"""Analyse a background track so the picture can be cut to it.

Produces beats (a constant-tempo grid), a smoothed energy curve for
music-reactive lighting, and named section markers (break, build, drop,
outro) that episode scripts anchor scenes to.
"""

import json
import subprocess

import numpy as np

SR = 22050
HOP = 512
ENV_HZ = 10  # energy curve resolution written to the timeline


def load_mono(path, sr=SR):
    pcm = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
        capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32)


def onset_envelope(x):
    win = np.hanning(1024)
    frames = np.lib.stride_tricks.sliding_window_view(x, 1024)[::HOP]
    spec = np.log1p(np.abs(np.fft.rfft(frames * win, axis=1)))
    flux = np.maximum(0, np.diff(spec, axis=0)).sum(1)
    return (flux - flux.mean()) / (flux.std() + 1e-9)


def beat_grid(flux, duration, lo=80, hi=160):
    """Constant-tempo beat grid: tempo by autocorrelation, phase by onset alignment."""
    fps = SR / HOP
    ac = np.correlate(flux, flux, "full")[len(flux) - 1:]
    lags = np.arange(len(ac))
    bpm = 60 * fps / np.maximum(lags, 1)
    ok = (bpm >= lo) & (bpm <= hi)
    lag = lags[ok][np.argmax(ac[ok])]
    # refine to sub-frame precision with a parabola through the peak
    a, b, c = ac[lag - 1], ac[lag], ac[lag + 1]
    period = (lag + 0.5 * (a - c) / (a - 2 * b + c + 1e-9)) / fps
    phases = np.linspace(0, period, 64, endpoint=False)
    t_env = np.arange(len(flux)) / fps

    def score(ph):
        idx = np.round((np.arange(ph, duration, period)) * fps).astype(int)
        idx = idx[idx < len(flux)]
        return flux[idx].sum()

    phase = max(phases, key=score)
    beats = np.arange(phase, duration, period)
    return 60 / period, beats, t_env


def energy_curve(x, duration):
    hop = SR // ENV_HZ
    n = len(x) // hop
    rms = np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(1) + 1e-12)
    db = 20 * np.log10(rms)
    k = np.hanning(9)
    db = np.convolve(db, k / k.sum(), "same")
    lo, hi = np.percentile(db, 5), np.percentile(db, 98)
    return np.clip((db - lo) / (hi - lo + 1e-9), 0, 1), db


def markers(db, duration, beats):
    """Find break (longest quiet stretch after the intro), drop (biggest rise after it), outro."""
    sec = db[: int(duration * ENV_HZ)]
    t = np.arange(len(sec)) / ENV_HZ
    loud = np.median(sec)
    quiet = sec < loud - 3.5
    # longest quiet run that starts after 10 s and ends before the last 10 s
    best, run_start = (0, 0, 0), None
    for i, q in enumerate(np.append(quiet, False)):
        if q and run_start is None:
            run_start = i
        elif not q and run_start is not None:
            if t[run_start] > 10 and t[min(i, len(t) - 1)] < duration - 10 and i - run_start > best[0]:
                best = (i - run_start, run_start, i)
            run_start = None
    out = {}
    if best[0] > 3 * ENV_HZ:
        out["break"] = float(t[best[1]])
        after = sec[best[2]:]
        rise = after[ENV_HZ:] - after[:-ENV_HZ]
        j = int(np.argmax(rise)) + ENV_HZ + best[2]
        out["build"] = float(t[best[2]])
        out["drop"] = float(t[j])
    tail = np.where(sec > loud - 6)[0]
    out["outro"] = float(t[tail[-1]]) if len(tail) else duration
    # snap markers to the beat grid
    for k, v in out.items():
        out[k] = round(float(beats[np.argmin(np.abs(beats - v))]), 3)
    return out


def band_flux(x, lo, hi):
    win = np.hanning(1024)
    frames = np.lib.stride_tricks.sliding_window_view(x, 1024)[::HOP]
    spec = np.abs(np.fft.rfft(frames * win, axis=1))
    freqs = np.fft.rfftfreq(1024, 1 / SR)
    s = np.log1p(spec[:, (freqs >= lo) & (freqs < hi)])
    f = np.maximum(0, np.diff(s, axis=0)).sum(1)
    return (f - f.mean()) / (f.std() + 1e-9)


def hits(x, beats, thresh=1.5):
    """Beats that carry a real accent (kick + snare energy): where impacts should land.
    Returns [(time, strength 0..1)]."""
    fps = SR / HOP
    low, mid = band_flux(x, 30, 160), band_flux(x, 1500, 6000)

    def peak(env, t):
        i = int(t * fps)
        return env[max(0, i - 2):i + 3].max() if i < len(env) else 0

    acc = np.array([peak(low, b) + 0.5 * peak(mid, b) for b in beats])
    top = np.percentile(acc, 98)
    return [(round(float(b), 3), round(float(min(1, (a - thresh) / (top - thresh + 1e-9))), 2)) for b, a in zip(beats, acc) if a > thresh]


def analyse(path):
    x = load_mono(path)
    duration = len(x) / SR
    flux = onset_envelope(x)
    tempo, beats, _ = beat_grid(flux, duration)
    energy, db = energy_curve(x, duration)
    return {
        "hits": hits(x, beats),
        "path": path,
        "duration": round(duration, 3),
        "tempo": round(float(tempo), 2),
        "beats": [round(float(b), 3) for b in beats],
        "markers": markers(db, duration, beats),
        "energy_hz": ENV_HZ,
        "energy": [round(float(e), 3) for e in energy],
    }


if __name__ == "__main__":
    import sys
    info = analyse(sys.argv[1])
    print(json.dumps({k: v for k, v in info.items() if k not in ("beats", "energy")}, indent=2))
    print("beats:", len(info["beats"]), info["beats"][:6])
