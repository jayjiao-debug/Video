"""Signature check for the farm 'copied strip' glitch: rows 287–420 duplicated from 286 px lower (at 1080)."""
import subprocess, sys, numpy as np
v = sys.argv[1]; w, h = 480, 540
pr = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-i', v, '-vf', f'scale={w}:{h}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], stdout=subprocess.PIPE)
dl = []
while True:
    b = pr.stdout.read(w * h)
    if len(b) < w * h: break
    f = np.frombuffer(b, np.uint8).reshape(h, w).astype(np.float32); dl.append(np.abs(f[144:210] - f[287:353]).mean())
d = np.array(dl); n = len(d)
np.save('sig.npy', d); hits = []
for i in range(n):
    lo, hi = max(0, i - 10), min(n, i + 11); ref = np.median(np.r_[d[lo:i], d[i + 1:hi]])
    if d[i] < 0.6 * ref and ref > 4: hits.append(i)
print('hits', len(hits)); 
if hits:
    runs = []; s = hits[0]; p = hits[0]
    for x in hits[1:]:
        if x - p > 15: runs.append((s, p)); s = x
        p = x
    runs.append((s, p))
    for a, b in runs: print(f'{a/30:.2f}–{b/30:.2f} s  ({b-a+1} frames span)')
