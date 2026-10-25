#!/usr/bin/env python3
"""Edge scan: for each sampled frame, count how many columns/rows from each border match the canvas colour
(navy #22374A / #213547 +/-8 on >=85 % of the pixels in that column/row). Also flag flat bands
(per-line std < 2 and mean within 6 of the border line) that are not navy, as a lead to look at.
usage: edge_scan.py VIDEO FPS OUT.txt"""
import subprocess, sys, numpy as np
video, fps, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
W, H = 1920, 1080
NAVY = np.array([34, 55, 74])
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', video, '-vf', f'fps={fps}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                     stdout=subprocess.PIPE)
rows = []
i = 0
def run_len(lines):  # lines: iterable of (N,3) arrays from the edge inward
    n = 0
    for ln in lines:
        m = (np.abs(ln.astype(int) - NAVY).max(axis=1) <= 8).mean()
        if m >= 0.85: n += 1
        else: break
    return n
def flat_len(lines):
    n = 0; ref = None
    for ln in lines:
        ln = ln.astype(float); mu = ln.mean(axis=0); sd = ln.std(axis=0).max()
        if ref is None: ref = mu
        if sd < 2.0 and np.abs(mu - ref).max() < 6: n += 1
        else: break
    return n
while True:
    buf = p.stdout.read(W * H * 3)
    if len(buf) < W * H * 3: break
    f = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    t = i / fps; i += 1
    L = run_len(f[:, k] for k in range(400)); R = run_len(f[:, W - 1 - k] for k in range(400))
    T = run_len(f[k] for k in range(300)); B = run_len(f[H - 1 - k] for k in range(300))
    fl = [flat_len(f[:, k] for k in range(200)), flat_len(f[:, W - 1 - k] for k in range(200)),
          flat_len(f[k] for k in range(150)), flat_len(f[H - 1 - k] for k in range(150))]
    rows.append((t, L, R, T, B, *fl))
with open(out, 'w') as fo:
    fo.write('t L R T B | flatL flatR flatT flatB\n')
    for r in rows:
        if max(r[1:5]) > 0 or max(r[5:]) >= 4:
            fo.write('%.2f %d %d %d %d | %d %d %d %d\n' % r)
print('frames', len(rows), 'navy hits', sum(1 for r in rows if max(r[1:5]) > 0), 'flat>=4', sum(1 for r in rows if max(r[5:]) >= 4))
