#!/usr/bin/env python3
"""Shade a bronze relief from a greyscale height map (white = high) under one raking lamp.
Replaces the v2 SVG emboss (teal fringe, emboss noise, brown mud):
  - rounded forms: painted heights + a pillow from the distance to each form's edge
  - normals → Lambert + narrow Blinn speculars, cast shadows ray-marched toward the lamp, AO in the crevices
  - patina (muted 石青, not teal) only in recessed crevices and only in patches
  - one raking lamp from upper-left with a pool (spot) → real tonal range: lit tops ~#FFE0B8, deep cast shadows
usage: relief.py height.png out.png [--az DEG] [--el DEG] [--depth PX] [--spot x,y,r] [--floor F] [--patina A]"""
import argparse
import numpy as np
from PIL import Image
from scipy import ndimage as nd

ap = argparse.ArgumentParser()
ap.add_argument('hm'); ap.add_argument('out')
ap.add_argument('--az', type=float, default=145)    # light comes FROM this image direction (deg, 0 = right, 90 = down) → 145 ≈ upper-left
ap.add_argument('--el', type=float, default=32)
ap.add_argument('--depth', type=float, default=46)  # px of relief for white
ap.add_argument('--spot', default='900,560,900')
ap.add_argument('--floor', type=float, default=0.32)
ap.add_argument('--patina', type=float, default=0.45)
ap.add_argument('--gain', type=float, default=1.0)
a = ap.parse_args()

h0 = np.asarray(Image.open(a.hm).convert('L'), dtype=np.float32) / 255.0
H, W = h0.shape
# rounded forms: soften the steps a little, then add a pillow that rises with the distance from each step edge
g = np.hypot(nd.sobel(h0, 1), nd.sobel(h0, 0))
edges = g > 0.08
dist = nd.distance_transform_edt(~edges)
pillow = np.sqrt(np.clip(dist / 26.0, 0, 1))
bg = np.percentile(h0, 8)
raised = np.clip((h0 - bg) / 0.08, 0, 1)
h = nd.gaussian_filter(h0, 1.6) * 0.82 + nd.gaussian_filter(h0, 5) * 0.18 + 0.07 * pillow * raised
hz = h * a.depth

# normals
dx = nd.sobel(hz, 1) / 8.0; dy = nd.sobel(hz, 0) / 8.0
n = np.dstack([-dx, -dy, np.ones_like(hz)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
az, el = np.radians(a.az), np.radians(a.el)
L = np.array([-np.cos(az) * np.cos(el), -np.sin(az) * np.cos(el), np.sin(el)])  # vector pointing TO the light
L = np.array([np.cos(az) * np.cos(el) * -1, np.sin(az) * np.cos(el) * -1, np.sin(el)])
# az measured as the direction the light travels FROM: upper-left means L points up-left: (-x, -y)
L = np.array([np.cos(np.radians(a.az)), -np.sin(np.radians(a.az)), 0]) * np.cos(el); L[2] = np.sin(el)
L = L / np.linalg.norm(L)
diff = np.clip((n * L).sum(2), 0, 1)
Hv = L + np.array([0, 0, 1.0]); Hv /= np.linalg.norm(Hv)
spec = np.clip((n * Hv).sum(2), 0, 1) ** 60

# cast shadows: march toward the light
sh = np.zeros_like(hz, dtype=bool)
lx, ly = L[0] / np.hypot(L[0], L[1]), L[1] / np.hypot(L[0], L[1])
slope = np.tan(el)
for t in range(2, 140, 2):
    sx, sy = int(round(lx * t)), int(round(ly * t))
    shifted = np.roll(np.roll(hz, -sy, 0), -sx, 1)
    sh |= shifted > hz + t * slope + 0.5
shadow = 1 - 0.78 * nd.gaussian_filter(sh.astype(np.float32), 2.2)

# ambient occlusion from crevices
cav = np.clip((nd.gaussian_filter(hz, 10) - hz) / 6.0, 0, 1)
ao = 1 - 0.55 * cav

# the lamp: one pool, falling off to the edges (and the panel's top-left stays quiet for the subtitle)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
sx_, sy_, sr = [float(v) for v in a.spot.split(',')]
pool = a.floor + (1 - a.floor) * np.exp(-(((xx - sx_) / sr) ** 2 + ((yy - sy_) / (sr * 0.75)) ** 2) * 1.6)

I = (0.07 + 1.25 * diff ** 1.4 * shadow) * ao * pool * a.gain
# bronze ramp: deep shadow → base → lit → top
stops = np.array([0.0, 0.18, 0.42, 0.7, 1.0])
cols = np.array([[15, 10, 6], [60, 43, 28], [126, 94, 62], [206, 166, 118], [255, 232, 194]], dtype=np.float32)
Ic = np.clip(I, 0, 1)
rgb = np.stack([np.interp(Ic, stops, cols[:, k]) for k in range(3)], 2)
rgb += (spec * shadow * pool)[..., None] * np.array([255, 235, 208]) * 0.85

# patina: muted 石青-green, only in recessed crevices, only in patches (never an outline)
rng = np.random.default_rng(7)
noise = nd.gaussian_filter(rng.standard_normal((H, W)).astype(np.float32), 14)
noise = (noise - noise.mean()) / noise.std()
patch = np.clip((noise - 0.7) * 1.2, 0, 1)
crev = np.clip((nd.gaussian_filter(hz, 9) - hz - 1.5) / 4.0, 0, 1)
pm = nd.gaussian_filter(crev * patch, 4) * a.patina
pat = np.array([84, 110, 100], dtype=np.float32) * (0.45 + 0.55 * pool)[..., None]
rgb = rgb * (1 - pm[..., None]) + pat * pm[..., None]

# cast-metal grain
grain = rng.standard_normal((H, W)).astype(np.float32)
rgb += nd.gaussian_filter(grain, 0.7)[..., None] * 5
Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8)).save(a.out)
print(a.out, 'mean luma', round(float((rgb @ np.array([0.299, 0.587, 0.114])).mean()), 1))
