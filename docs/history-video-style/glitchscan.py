"""glitchscan.py <video>: flag single-frame outliers (a frame unlike both neighbours while the neighbours match each other).
Prints the time and score of each suspect frame; cuts (where the neighbours differ too) are not flagged."""
import subprocess, sys, numpy as np
v = sys.argv[1]; w, h = 160, 90
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', v, '-vf', f'scale={w}:{h}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)
n = len(F); out = []
for i in range(1, n - 1):
    dp = np.abs(F[i] - F[i - 1]).mean(); dn = np.abs(F[i] - F[i + 1]).mean(); ds = np.abs(F[i + 1] - F[i - 1]).mean()
    # local blocks too: a small glitch (a hand, a slab) changes one region a lot
    bp = np.abs(F[i] - F[i - 1]).reshape(9, 10, 16, 10).mean((1, 3)); bn = np.abs(F[i] - F[i + 1]).reshape(9, 10, 16, 10).mean((1, 3)); bs = np.abs(F[i + 1] - F[i - 1]).reshape(9, 10, 16, 10).mean((1, 3))
    blk = (np.minimum(bp, bn) - 2.5 * bs).max()
    score = min(dp, dn) - 2.5 * ds
    if score > 1.5 or blk > 18: out.append((i / 30, round(score, 1), round(float(blk), 1)))
print(n, 'frames;', len(out), 'suspects')
for t, s, b in out: print(f'{t:8.3f}  global {s:5.1f}  block {b:5.1f}')
