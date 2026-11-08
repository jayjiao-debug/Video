"""Seamless painted-background textures for the 林冲 film (render-time, written to /dev/shm, never committed).

usage: make_textures.py [outdir]   (default /dev/shm/shz01/film/assets)

Every texture is a 1024x1024 greyscale PNG centred on mid-grey (128), so it can be laid over a flat fill with
mix-blend-mode overlay/soft-light: it adds light AND dark variation without shifting the fill's colour. All fields are
built with wrap-around blurs and periodic functions, so they tile without seams.
  tex_wood.png    long grain with ring flecks and a few knots (planks run horizontally; rotate for vertical)
  tex_plaster.png mottled lime plaster with soft stains and fine pits
  tex_stone.png   granular stone with chips and soft mottling
  tex_fabric.png  fine plain weave
  tex_snow.png    soft drifts plus sparkle points
  tex_iron.png    rusty iron mottling
  tex_tiles.png   roof tile rows (rounded tile ends)
  tex_wash.png    ink-wash grain with soft directional streaks (mountains, skies)
  tex_canvas.png  painted-background brush grain (general, very subtle)
"""
import sys
import numpy as np
from PIL import Image

OUT = sys.argv[1] if len(sys.argv) > 1 else '/dev/shm/shz01/film/assets'
N = 1024


def blur(a, kx, ky=None):
    """separable wrap-around box blur x3 (≈ gaussian); kx, ky radii in px."""
    ky = kx if ky is None else ky
    for _ in range(3):
        if ky > 0:
            c = np.cumsum(np.pad(a, ((ky, ky), (0, 0)), mode='wrap'), axis=0)
            a = (c[2 * ky:] - c[:-2 * ky]) / (2 * ky)
        if kx > 0:
            c = np.cumsum(np.pad(a, ((0, 0), (kx, kx)), mode='wrap'), axis=1)
            a = (c[:, 2 * kx:] - c[:, :-2 * kx]) / (2 * kx)
    return a


def norm(a):
    a = a - a.mean()
    return a / (np.abs(a).max() + 1e-9)


def fbm(seed, radii=(64, 24, 8, 3), weights=(0.5, 0.28, 0.15, 0.07), shape=(N, N)):
    r = np.random.default_rng(seed)
    out = np.zeros(shape)
    for k, w in zip(radii, weights):
        out += norm(blur(r.standard_normal(shape), k)) * w
    return norm(out)


def save(name, field, contrast):
    img = np.clip(128 + field * 127 * contrast, 0, 255).astype(np.uint8)
    Image.fromarray(img, 'L').save(f'{OUT}/{name}')


yy, xx = np.mgrid[0:N, 0:N].astype(float)

# ---- wood: anisotropic streaks + rings warped by low noise + knots
r = np.random.default_rng(1)
streak = norm(blur(r.standard_normal((N, N)), 90, 2)) * 0.55 + norm(blur(r.standard_normal((N, N)), 30, 1)) * 0.3
warp = fbm(2, (128, 48), (0.7, 0.3)) * 18
rings = np.sin((yy + warp) * 2 * np.pi / 22.0 * 2) * 0.5 + np.sin((yy + warp * 1.7) * 2 * np.pi / 64.0 * 4) * 0.3
wood = streak + rings * 0.35
for i in range(5):
    cx, cy = r.uniform(0, N), r.uniform(0, N)
    dx = (xx - cx + N / 2) % N - N / 2
    dy = (yy - cy + N / 2) % N - N / 2
    d = np.sqrt((dx / 2.6) ** 2 + dy ** 2)
    knot = np.exp(-(d / 18) ** 2)
    wood += (np.sin(d * 0.9) * 0.4 * np.exp(-(d / 46) ** 2)) - knot * 1.2
save('tex_wood.png', norm(wood), 0.55)

# ---- plaster: mottling + big soft stains + fine pits
pl = fbm(3, (120, 40, 10, 2), (0.45, 0.3, 0.15, 0.1))
stains = norm(blur(np.random.default_rng(4).standard_normal((N, N)), 140))
stains = np.where(stains < -0.35, (stains + 0.35) * 2.0, 0)
pits = (np.random.default_rng(5).random((N, N)) > 0.996) * -1.0
pits = blur(pits, 1) * 6
save('tex_plaster.png', norm(pl + stains * 0.8 + pits), 0.5)

# ---- stone: granular speckle + chips + mottling
g = np.random.default_rng(6)
grain = norm(blur(g.standard_normal((N, N)), 1)) * 0.5
mott = fbm(7, (90, 30), (0.6, 0.4)) * 0.45
chips = (g.random((N, N)) > 0.9985) * 1.0
chips = -blur(chips, 3) * 10
save('tex_stone.png', norm(grain + mott + chips), 0.55)

# ---- fabric: plain weave + slub noise
weave = np.sin(xx * 2 * np.pi / 6) * np.sign(np.sin(yy * 2 * np.pi / 12)) * 0.5 + np.sin(yy * 2 * np.pi / 6) * np.sign(np.sin(xx * 2 * np.pi / 12)) * 0.5
slub = norm(blur(np.random.default_rng(8).standard_normal((N, N)), 40, 2)) * 0.4
save('tex_fabric.png', norm(weave * 0.6 + slub), 0.35)

# ---- snow: soft drifts + sparkles
drift = fbm(9, (160, 60, 20), (0.6, 0.3, 0.1))
sp = (np.random.default_rng(10).random((N, N)) > 0.9975) * 1.0
sp = blur(sp, 1) * 9
save('tex_snow.png', norm(drift * 0.6 + sp), 0.5)

# ---- iron: rust mottling with pits
rust = fbm(11, (50, 16, 4), (0.5, 0.3, 0.2))
rust = np.tanh(rust * 2.2)
save('tex_iron.png', norm(rust), 0.6)

# ---- tiles: rows of rounded tile ends (period 64 px x, 48 px y), alternating offset
row = (yy // 48).astype(int)
lx = (xx + (row % 2) * 32) % 64 - 32
ly = yy % 48
shape = np.clip(1 - (lx / 30) ** 2, 0, 1) ** 0.5
tile = shape * (0.4 + 0.6 * (ly / 48)) - (ly < 4) * 0.8
tile += fbm(12, (60, 12), (0.6, 0.4)) * 0.35
save('tex_tiles.png', norm(tile), 0.5)

# ---- ink-wash grain: directional streaks + blotches
w1 = norm(blur(np.random.default_rng(13).standard_normal((N, N)), 120, 8)) * 0.5
w2 = fbm(14, (80, 20, 4), (0.5, 0.3, 0.2)) * 0.5
save('tex_wash.png', norm(w1 + w2), 0.5)

# ---- canvas: painted-background brush grain, very subtle
br = norm(blur(np.random.default_rng(15).standard_normal((N, N)), 14, 3)) * 0.5 + norm(blur(np.random.default_rng(16).standard_normal((N, N)), 3, 14)) * 0.3 + fbm(17, (100, 30), (0.6, 0.4)) * 0.4
save('tex_canvas.png', norm(br), 0.4)
print('textures ok', OUT)
