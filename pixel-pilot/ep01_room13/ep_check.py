"""Checks on the finished cut: picture hits against the beat grid, metronome runs, and whether the
beat grid still sits on the music's onsets after the edit.

python3 ep_check.py ../deliverables/ep01_room13.mp4 [timeline.json]
"""
import json, pathlib, subprocess, sys
import numpy as np

HERE = pathlib.Path(__file__).resolve().parent
TL = json.loads(pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else HERE / "timeline.json").read_text())
BEATS = np.array(TL["beats"])
FPS, w, h = 30, 108, 192


def frames(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-vf", f"scale={w}:{h}", "-f", "rawvideo", "-pix_fmt", "gray", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)


def picture_hits(v):
    m = v.copy()
    m[:, 106:141] = 0                                   # subtitle band masked
    d = np.abs(np.diff(m, axis=0)).mean((1, 2))
    thr = max(6.0, np.median(d) * 8)
    return [(i + 1) / FPS for i in range(1, len(d) - 1) if d[i] > thr and d[i] >= d[i - 1] and d[i] >= d[i + 1]], d


def onset_offsets(path):
    import librosa
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", "22050", "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    y, sr = np.frombuffer(raw, np.float32), 22050
    env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=256)
    t = librosa.times_like(env, sr=sr, hop_length=256)
    offs = []
    for b in BEATS:
        win = (t > b - 0.12) & (t < b + 0.12)
        if win.any():
            offs.append(t[win][np.argmax(env[win])] - b)
    return np.array(offs)


if __name__ == "__main__":
    path = pathlib.Path(sys.argv[1])
    v = frames(path)
    hits, _ = picture_hits(v)
    off = np.array([BEATS[np.argmin(np.abs(BEATS - t))] - t for t in hits])
    on = np.abs(off) <= 1.5 / FPS
    print(f"picture hits {len(hits)}, on a beat (+-1 frame) {on.sum()} ({100 * on.mean():.0f}%)")
    for t, o, ok in zip(hits, off, on):
        if not ok:
            print(f"  off-beat hit at {t:6.2f}s ({o * 1000:+.0f} ms from the nearest beat)")
    hit_beats = sorted({int(np.argmin(np.abs(BEATS - t))) for t, ok in zip(hits, on) if ok})
    run, best, runs = 1, 1, []
    for a, b in zip(hit_beats, hit_beats[1:]):
        run = run + 1 if b == a + 1 else 1
        if run >= 4:
            runs.append(BEATS[b])
        best = max(best, run)
    print(f"longest run of consecutive beats with a hit: {best}" + (f"  (>=4 at {sorted(set(np.round(runs, 1)))})" if runs else ""))
    gaps = np.diff(hits)
    print(f"hits closer than 1 s apart: {int((gaps < 1.0).sum())}")
    offs = onset_offsets(path)
    print(f"music onsets vs beat grid: median {np.median(offs) * 1000:+.0f} ms, |off| < 35 ms on {100 * np.mean(np.abs(offs) < 0.035):.0f}% of beats")
