"""ep60 fixed textures for the 4:3 tomb-painting look (run once; outputs go to remotion/public/ep60/).

All world textures are periodic (FFT noise) so they tile under long camera pans. The screen grain is ONE fixed image
(no per-frame noise) so encoded video stays small.
  plaster.jpg  2048x1024  warm lime plaster: mottling, stains, trowel streaks, fine grain
  papyrus.jpg  2048x1024  papyrus sheet: horizontal + vertical fibre layers, specks, stains
  wear.png     2048x1024  RGBA paint loss: plaster-coloured chips + hairline cracks (laid over the paint)
  grain.jpg    1440x1080  screen grain for multiply: grain, dust specks, scratches, soft corner burn
  dust.jpg     1440x1080  screen specks for 'screen' blend on dark grades (black ground, light motes)
Usage: python3 -I tex60.py /home/claude/video/episodes/37-qiqing/remotion/public/ep60
"""
import sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

out = sys.argv[1]
os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(60)


def fnoise(h, w, beta=2.0, lo=0.0, hi=1e9, aniso=(1.0, 1.0), seed=None):
    """periodic 1/f^beta noise, normalised to [-1, 1]; aniso stretches features (fx, fy)"""
    r = np.random.default_rng(seed) if seed is not None else rng
    fy = np.fft.fftfreq(h)[:, None] * h * aniso[1]
    fx = np.fft.fftfreq(w)[None, :] * w * aniso[0]
    f = np.sqrt(fx * fx + fy * fy)
    f[0, 0] = 1
    amp = 1.0 / f ** (beta / 2)
    amp[(f < lo) | (f > hi)] = 0
    amp[0, 0] = 0
    ph = np.exp(2j * np.pi * r.random((h, w)))
    n = np.real(np.fft.ifft2(amp * ph))
    n -= n.mean()
    return n / (np.abs(n).max() + 1e-9)


def save_rgb(a, path, q=88):
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(path, quality=q, optimize=True)


# ---------------- plaster ----------------
H, W = 1024, 2048
base = np.array([232, 211, 168], float)
mott = fnoise(H, W, 2.6, 1, 60, seed=1)
mid = fnoise(H, W, 2.0, 4, 200, seed=2)
stain = np.clip((fnoise(H, W, 2.6, 2, 60, seed=3) - 0.18) * 1.5, 0, 1) ** 1.8
ring = np.clip(1 - np.abs(fnoise(H, W, 2.6, 2, 60, seed=3) - 0.2) * 18, 0, 1)  # tide-marks at stain edges
streak = fnoise(H, W, 1.8, 2, 400, aniso=(0.12, 1.0), seed=4)
fine = rng.normal(0, 1, (H, W))
lum = 1 + 0.08 * mott + 0.045 * mid + 0.025 * streak + 0.022 * fine - 0.09 * stain - 0.025 * ring
col = base[None, None, :] * lum[..., None]
col[..., 2] -= 14 * stain + 6 * ring  # stains are browner
col[..., 1] -= 5 * stain
save_rgb(col, f'{out}/plaster.jpg')

# ---------------- papyrus ----------------
pb = np.array([229, 200, 142], float)
hf = fnoise(H, W, 1.5, 6, 420, aniso=(0.02, 1.0), seed=11)   # long horizontal fibres
vf = fnoise(H, W, 1.5, 6, 420, aniso=(1.0, 0.025), seed=12)   # cross layer
strips = fnoise(H, W, 1.0, 6, 40, aniso=(0.0, 1.0), seed=13)  # strip joins
blot = np.clip((fnoise(H, W, 2.6, 2, 40, seed=14) - 0.2) * 1.6, 0, 1) ** 1.6
specks = (rng.random((H, W)) > 0.9993).astype(float)
specks = np.array(Image.fromarray((specks * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.1)), float) / 255 * 3
lum = 1 + 0.16 * hf + 0.09 * vf + 0.03 * strips + 0.05 * mott - 0.12 * blot - 0.5 * np.clip(specks, 0, 1) + 0.02 * fine
col = pb[None, None, :] * lum[..., None]
col[..., 2] -= 16 * blot
col[..., 1] -= 10 * blot
col[..., 0] -= 4 * blot
save_rgb(col, f'{out}/papyrus.jpg')

# ---------------- wear (paint loss + cracks), RGBA ----------------
chip_n = fnoise(H, W, 1.6, 8, 500, seed=21)
chip_m = fnoise(H, W, 2.4, 1, 30, seed=22)  # where the wall is more worn
chips = np.clip((chip_n + 0.5 * chip_m - 0.6) * 7, 0, 1)
scuff = np.clip((fnoise(H, W, 1.0, 60, 900, seed=23) + 0.3 * chip_m - 0.55) * 6, 0, 1) * 0.55
alpha = np.maximum(chips, scuff)
rgba = np.zeros((H, W, 4), float)
rgba[..., 0:3] = (base * (1 + 0.04 * mid[..., None]))
rgba[..., 3] = alpha * 235
img = Image.fromarray(np.clip(rgba, 0, 255).astype(np.uint8), 'RGBA')
# hairline cracks (drawn 2x, wrapped for tiling, then downsampled)
big = Image.new('RGBA', (W * 2, H * 2), (0, 0, 0, 0))
d = ImageDraw.Draw(big)
for k in range(16):
    x, y = rng.random() * W * 2, rng.random() * H * 2
    a = rng.random() * np.pi * 2
    pts = [(x, y)]
    for i in range(int(rng.integers(14, 46))):
        a += rng.normal(0, 0.32)
        L = rng.uniform(14, 40)
        x, y = x + np.cos(a) * L, y + np.sin(a) * L
        pts.append((x, y))
        if rng.random() < 0.08:  # a branch
            bx, by, ba = x, y, a + rng.choice([-1, 1]) * rng.uniform(0.6, 1.2)
            bp = [(bx, by)]
            for j in range(int(rng.integers(3, 9))):
                ba += rng.normal(0, 0.5); bx += np.cos(ba) * 16; by += np.sin(ba) * 16; bp.append((bx, by))
            for ox in (-W * 2, 0, W * 2):
                for oy in (-H * 2, 0, H * 2):
                    d.line([(p[0] + ox, p[1] + oy) for p in bp], fill=(92, 62, 34, 150), width=2)
    for ox in (-W * 2, 0, W * 2):
        for oy in (-H * 2, 0, H * 2):
            q = [(p[0] + ox, p[1] + oy) for p in pts]
            d.line([(p[0] + 2, p[1] + 2) for p in q], fill=(250, 238, 212, 90), width=2)  # lit lip
            d.line(q, fill=(98, 68, 40, 140), width=2)
big = big.resize((W, H), Image.LANCZOS)
img = Image.alpha_composite(img, big)
img.save(f'{out}/wear.png', optimize=True)

# ---------------- screen grain (multiply) ----------------
SH, SW = 1080, 1440
g = 255 - np.abs(rng.normal(0, 7, (SH, SW)))
g -= 10 * np.clip(fnoise(SH, SW, 2.2, 2, 80, seed=31), 0, 1)
yy, xx = np.mgrid[0:SH, 0:SW]
r = np.sqrt(((xx - SW / 2) / (SW / 2)) ** 2 + ((yy - SH / 2) / (SH / 2)) ** 2)
g -= 34 * np.clip(r - 0.75, 0, 1) ** 1.6
gi = Image.fromarray(np.clip(g, 0, 255).astype(np.uint8), 'L')
dd = ImageDraw.Draw(gi)
for k in range(260):  # dust specks
    x, y, s = rng.random() * SW, rng.random() * SH, rng.uniform(0.6, 2.4)
    dd.ellipse([x - s, y - s * rng.uniform(0.5, 1), x + s, y + s], fill=int(rng.uniform(120, 200)))
for k in range(14):  # fine hairs / scratches
    x, y, a = rng.random() * SW, rng.random() * SH, rng.random() * np.pi
    pts = [(x, y)]
    for i in range(12):
        a += rng.normal(0, 0.35); x += np.cos(a) * 6; y += np.sin(a) * 6; pts.append((x, y))
    dd.line(pts, fill=int(rng.uniform(150, 200)), width=1)
gi = gi.filter(ImageFilter.GaussianBlur(0.35))
gi.convert('RGB').save(f'{out}/grain.jpg', quality=86, optimize=True)

# ---------------- dust for dark grades (screen) ----------------
dk = np.abs(rng.normal(0, 5, (SH, SW)))
di = Image.fromarray(np.clip(dk, 0, 255).astype(np.uint8), 'L')
dd = ImageDraw.Draw(di)
for k in range(340):
    x, y, s = rng.random() * SW, rng.random() * SH, rng.uniform(0.5, 1.8)
    dd.ellipse([x - s, y - s, x + s, y + s], fill=int(rng.uniform(40, 120)))
di = di.filter(ImageFilter.GaussianBlur(0.4))
di.convert('RGB').save(f'{out}/dust.jpg', quality=86, optimize=True)
for f in sorted(os.listdir(out)):
    print(f, os.path.getsize(f'{out}/{f}') // 1024, 'KB')

# ---------------- displacement tile for the hand-painted edge wobble (R = dx, G = dy), 512 px, periodic ----------------
dx = fnoise(512, 512, 2.0, 6, 40, seed=41); dy = fnoise(512, 512, 2.0, 6, 40, seed=42)
disp = np.zeros((512, 512, 3), np.uint8)
disp[..., 0] = np.clip(128 + 127 * dx, 0, 255); disp[..., 1] = np.clip(128 + 127 * dy, 0, 255); disp[..., 2] = 128
Image.fromarray(disp).save(f'{out}/disp.png', optimize=True)
print('disp.png', os.path.getsize(f'{out}/disp.png') // 1024, 'KB')
