#!/usr/bin/env python3
"""L1 → L3 hand-over still: the 1860 stage sets into bronze behind the looter. Left of a drifting seam the stage is already
a cast relief (raking lamp, upper-left); at the seam the metal is still hot (a copper glow cooling leftwards) under a band
of smoke; right of it the L1 fire world still runs, with the looter carrying you out of frame.
usage: handover_comp.py ho_L1.png ho_rel.png out.png"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
A = np.asarray(Image.open(sys.argv[1]).convert('RGB'), dtype=np.float32)
B = np.asarray(Image.open(sys.argv[2]).convert('RGB'), dtype=np.float32)
H, W, _ = A.shape
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
rng = np.random.default_rng(3)
def fbm(scale, oct=4, seed=0):
    r = np.random.default_rng(seed); out = np.zeros((H, W), np.float32); amp = 1.0
    for o in range(oct):
        n = nd.gaussian_filter(r.standard_normal((H, W)).astype(np.float32), scale / (2 ** o)); n /= n.std() + 1e-6
        out += amp * n; amp *= 0.5
    return out / 1.9
seam = 1240 + 60 * np.sin(yy / 130 + 1.2) + 26 * fbm(40, 3, 5)
d = xx - seam                                  # < 0: relief side
m = np.clip(0.5 - d / 70, 0, 1)                # 1 = relief
out = B * m[..., None] + A * (1 - m[..., None])
# hot metal: the newest-cast strip still glows copper, cooling leftwards (stronger in the recesses)
lumB = B @ np.array([0.299, 0.587, 0.114])
heat = np.clip(1 + d / 340, 0, 1) ** 1.6 * m
glow = np.array([255, 120, 50], np.float32)
out = out * (1 - 0.55 * heat[..., None]) + (glow * (0.35 + 0.65 * (1 - lumB / 255.0))[..., None]) * 0.85 * heat[..., None] + B * 0.25 * heat[..., None]
edge = np.exp(-((d + 14) / 10) ** 2) * (0.6 + 0.4 * np.clip(fbm(12, 2, 9), -1, 1))
out += edge[..., None] * np.array([255, 170, 90], np.float32) * 0.55
# smoke band riding the seam (lit by the fire on its right flank)
sm = np.clip(0.55 + 0.6 * fbm(28, 4, 11), 0, 1) * np.exp(-((d - 30) / 120) ** 2) * np.clip((yy - 120) / 300, 0, 1)
smoke = np.array([58, 40, 36], np.float32) + np.clip(d / 160, 0, 1)[..., None] * np.array([110, 50, 20], np.float32)
out = out * (1 - 0.8 * sm[..., None]) + smoke * 0.8 * sm[..., None]
# embers drifting over the seam, settling as dull specks on the relief
for i in range(70):
    x = 1050 + rng.random() * 420; y = 160 + rng.random() * 760; r = 1 + rng.random() * 2.2
    hot = np.clip((x - 1100) / 260, 0.15, 1)
    msk = np.exp(-(((xx - x) ** 2 + (yy - y) ** 2) / (r * r)))
    out += msk[..., None] * np.array([255, 190, 110]) * hot * 0.9
Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(sys.argv[3]); print(sys.argv[3])
