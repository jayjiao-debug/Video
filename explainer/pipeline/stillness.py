"""Find stretches where nothing on screen moves (QA for "dead air").

Decodes the video small and blurred (so film grain and subtitle text don't count as
motion), measures how much the picture above the subtitle band changes per frame,
and reports every run longer than `min_len` seconds whose motion stays under `thresh`.

  python -m pipeline.stillness out/tanks.mp4            # report
"""
import subprocess
import sys

import numpy as np

W, H = 192, 108


def motion(path, fps=10):
    cmd = ["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps={fps},scale={W}:{H},gblur=sigma=1.2,format=gray", "-f", "rawvideo", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
    art = frames[:, 6:78, :]  # skip the top chrome and the subtitle band
    d = np.abs(np.diff(art, axis=0)).mean(axis=(1, 2))
    return np.concatenate([[d[0]], d]), fps


def still_runs(path, thresh=0.12, min_len=1.2):
    m, fps = motion(path)
    runs, start = [], None
    for i, v in enumerate(list(m) + [1e9]):
        if v < thresh and start is None:
            start = i
        elif v >= thresh and start is not None:
            if (i - start) / fps >= min_len:
                runs.append((start / fps, i / fps, float(m[start:i].mean())))
            start = None
    return runs


if __name__ == "__main__":
    path = sys.argv[1]
    thresh = float(sys.argv[2]) if len(sys.argv) > 2 else 0.12
    runs = still_runs(path, thresh)
    for a, b, v in runs:
        print(f"{a:7.1f} – {b:6.1f}s  ({b - a:4.1f}s still, motion {v:.3f})")
    print(f"{len(runs)} still stretches, {sum(b - a for a, b, _ in runs):.1f}s total")
