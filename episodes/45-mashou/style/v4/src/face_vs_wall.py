#!/usr/bin/env python3
"""Note 2b check: your lit face vs the wall right behind it. Renders are <name>.png and <name>_nohero.png (build.py name name@NOHERO).
face = hero pixels in front of the mane and above the jowl (local x < 760, 150 < y < 760); wall = a 6–30 px ring around the
whole hero, in front of the mane, sampled on the no-hero render. usage: face_vs_wall.py name x y h"""
import sys, numpy as np
from PIL import Image, ImageFilter
D = '/home/claude/video/episodes/45-mashou/style/v4/'
n, x, y, h = sys.argv[1], *map(float, sys.argv[2:5]); s = h / 925
A = np.asarray(Image.open(f'{D}{n}.png').convert('L'), float); B = np.asarray(Image.open(f'{D}{n}_nohero.png').convert('L'), float)
m = (np.abs(A - B) > 8).astype(np.uint8) * 255
X, Y = np.meshgrid(np.arange(1920), np.arange(1080))
lx, ly = (X - x) / s + 836, (Y - y) / s + 950
front = lx < 760
face = (m > 0) & front & (ly > 150) & (ly < 760)
mi = Image.fromarray(m); d30 = np.asarray(mi.filter(ImageFilter.MaxFilter(61))) > 0; d6 = np.asarray(mi.filter(ImageFilter.MaxFilter(13))) > 0
ring = d30 & ~d6 & front & (ly > 100) & (ly < 800)
print(f'{n}: face {A[face].mean():.0f} (n={face.sum()}), wall behind {B[ring].mean():.0f} (max of ring 90th pct {np.percentile(B[ring], 90):.0f}), frame mean {A.mean():.0f}, diff {A[face].mean() - B[ring].mean():+.0f}')
