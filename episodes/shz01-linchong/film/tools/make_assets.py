"""Render-time textures for the 林冲 film (written to /dev/shm, never committed).
fibre.png: rice-paper fibre overlay (greyscale, used with multiply at ~5 %).
paper.png: warm paper texture 2048x2048 (tileable-ish) for the 休书 and title ground.
"""
import sys
import numpy as np
from PIL import Image

out = sys.argv[1] if len(sys.argv) > 1 else '/dev/shm/shz01/film/assets'
rng = np.random.default_rng(7)


def blur(a, k):
    # separable box blur x3 ~ gaussian
    for _ in range(3):
        a = np.cumsum(np.pad(a, ((k, k), (0, 0)), mode='wrap'), axis=0)
        a = (a[2 * k:] - a[:-2 * k]) / (2 * k)
        a = np.cumsum(np.pad(a, ((0, 0), (k, k)), mode='wrap'), axis=1)
        a = (a[:, 2 * k:] - a[:, :-2 * k]) / (2 * k)
    return a


def fibres(h, w, n, seed):
    r = np.random.default_rng(seed)
    img = np.zeros((h, w), np.float32)
    for _ in range(n):
        x, y = r.uniform(0, w), r.uniform(0, h)
        ang = r.uniform(0, np.pi)
        ln = r.uniform(20, 90)
        t = np.linspace(0, 1, int(ln))
        cx = (x + np.cos(ang) * ln * t + np.sin(t * 6 + x) * 3).astype(int) % w
        cy = (y + np.sin(ang) * ln * t + np.cos(t * 5 + y) * 3).astype(int) % h
        img[cy, cx] += r.uniform(0.3, 1.0)
    return img


h, w = 1080, 1920
base = rng.normal(0, 1, (h, w)).astype(np.float32)
mott = blur(rng.normal(0, 1, (h, w)).astype(np.float32), 24)
mott = (mott - mott.mean()) / (mott.std() + 1e-6)
fb = blur(fibres(h, w, 9000, 3), 1)
v = 0.5 * base * 0.25 + mott * 0.5 + fb * 1.2
v = (v - v.min()) / (v.max() - v.min())
img = (255 - v * 140).clip(0, 255).astype(np.uint8)
Image.fromarray(img, 'L').save(f'{out}/fibre.png')

# warm paper
s = 2048
mott = blur(rng.normal(0, 1, (s, s)).astype(np.float32), 40)
mott = (mott - mott.mean()) / (mott.std() + 1e-6)
fine = blur(rng.normal(0, 1, (s, s)).astype(np.float32), 2)
fb = blur(fibres(s, s, 22000, 5), 1)
lum = 0.93 + mott * 0.025 + fine * 0.012 - fb * 0.05
col = np.stack([lum * 241, lum * 228, lum * 198], -1).clip(0, 255).astype(np.uint8)
Image.fromarray(col, 'RGB').save(f'{out}/paper.png')
print('assets ok', out)
