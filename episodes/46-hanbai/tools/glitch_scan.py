#!/usr/bin/env python3
"""Single-frame glitch scan (crew QA): every frame as 160x90 grey, 10x10 blocks; a frame is flagged when
min(d_prev, d_next) - d_skip > 18 (it differs from both neighbours while they agree with each other).
usage: glitch_scan.py film.mp4"""
import subprocess, sys
import numpy as np
f = sys.argv[1]
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-vf', 'scale=160:90,format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, 90, 160).astype(np.float32)
blk = fr.reshape(-1, 9, 10, 16, 10).mean(axis=(2, 4))
bad = []
for i in range(1, len(blk) - 1):
    dp = np.abs(blk[i] - blk[i - 1]).max(); dn = np.abs(blk[i] - blk[i + 1]).max(); ds = np.abs(blk[i - 1] - blk[i + 1]).max()
    if min(dp, dn) - ds > 18: bad.append((i, i / 30, round(float(min(dp, dn) - ds), 1)))
print(f'{len(fr)} frames scanned; {len(bad)} flagged')
for b in bad[:40]: print('  frame %d (%.2f s) score %s' % b)
