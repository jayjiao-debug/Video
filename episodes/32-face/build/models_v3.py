"""ep32 face-model round 3 — owner: 「The model is creepy … the dark blue coloring is good」.
Same dark-blue dot look (Film32 depthC ramp), three non-creepy face MODELS, each shown front-on and turned:
  1 · 圆润公仔: a soft toy-like head, dot-eyes as small bumps, a tiny smile (designer vinyl toy, not a person)
  2 · Face ID 图标: Apple's familiar glyph (corner brackets, two eye strokes, nose, smile) raised as ridges on a rounded plate
  3 · 鹅卵石: a smooth pebble with only a nose ridge and two soft dimples — barely a face, pure shape
Writes style/v3/models.jpg."""
import json, os, numpy as np
from PIL import Image, ImageDraw, ImageFont
W, H = 960, 540
F = '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
def hexc(h): h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], float)
DEEP, MID, CY, HI = hexc('#14305e'), hexc('#2d7fc1'), hexc('#5ce1e6'), hexc('#e6fdff')
def depthC(z):
    if z < 0.33: a, b, t = DEEP, MID, z / 0.33
    elif z < 0.7: a, b, t = MID, CY, (z - 0.33) / 0.37
    else: a, b, t = CY, HI, (z - 0.7) / 0.3
    return tuple(int(v) for v in a + (b - a) * t)
def g(x, y, cx, cy, sx, sy, a): return a * np.exp(-(((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2))
def arc(x, y, cy, curve, wdt, thick, a): return a * np.exp(-((y - (cy + curve * x ** 2)) / thick) ** 2) * np.exp(-(x / wdt) ** 6)
def seg(x, y, x0, y0, x1, y1, thick, a):
    px, py = x1 - x0, y1 - y0; t = np.clip(((x - x0) * px + (y - y0) * py) / (px * px + py * py), 0, 1)
    return a * np.exp(-(((x - x0 - t * px) ** 2 + (y - y0 - t * py) ** 2) / thick ** 2))

def toy(x, y):
    r = (x / 0.95) ** 2 + (y / 0.98) ** 2
    z = np.sqrt(np.clip(1 - r, 0, 1)) * 0.55
    z += g(x, y, 0, -0.08, 0.10, 0.08, 0.10)                                         # a button nose
    z += g(x, y, -0.32, 0.18, 0.065, 0.075, 0.12) + g(x, y, 0.32, 0.18, 0.065, 0.075, 0.12)  # dot eyes (bumps)
    z += arc(x, y, -0.36, 0.9, 0.20, 0.035, 0.08)                                       # a tiny smile
    return np.where(r < 1, z, np.nan)
def faceid(x, y):
    q = np.maximum(np.abs(x) - 0.55, 0) ** 2 + np.maximum(np.abs(y) - 0.55, 0) ** 2      # rounded-square plate
    r = q / 0.35 ** 2
    z = np.sqrt(np.clip(1 - r, 0, 1)) * 0.18 + 0.05
    for sx in (-1, 1):
        for sy in (-1, 1):                                                              # the four corner brackets
            cx, cy = sx * 0.62, sy * 0.62
            z += seg(x, y, cx, cy - sy * 0.0, cx - sx * 0.28, cy, 0.045, 0.30) + seg(x, y, cx, cy, cx, cy - sy * 0.28, 0.045, 0.30)
    z += seg(x, y, -0.25, 0.30, -0.25, 0.12, 0.045, 0.30) + seg(x, y, 0.25, 0.30, 0.25, 0.12, 0.045, 0.30)   # eyes
    z += seg(x, y, 0.02, 0.30, 0.02, -0.05, 0.04, 0.30) + seg(x, y, 0.02, -0.05, -0.08, -0.05, 0.04, 0.30)   # nose
    z += arc(x, y, -0.30, 0.9, 0.28, 0.045, 0.30) * (y < -0.12)                                            # smile
    return np.where(r < 1, z, np.nan)
def pebble(x, y):
    r = (x / 0.82) ** 2 + (y / 1.05) ** 2
    z = np.sqrt(np.clip(1 - r, 0, 1)) * 0.55
    z += g(x, y, 0, -0.02, 0.07, 0.30, 0.14)                                          # a nose ridge
    z -= g(x, y, -0.30, 0.20, 0.13, 0.09, 0.09) + g(x, y, 0.30, 0.20, 0.13, 0.09, 0.09)  # two soft dimples
    return np.where(r < 1, z, np.nan)

def cloud(fn, sp=0.026, ext=1.1):
    L = np.array([-0.40, 0.50, 0.77]); L /= np.linalg.norm(L); e = 0.012; pts = []
    for j, y in enumerate(np.arange(-ext, ext, sp * 0.866)):
        for x in np.arange(-ext + (j % 2) * sp / 2, ext, sp):
            z = fn(np.array(x), np.array(y))
            if np.isnan(z): continue
            zz = [fn(np.array(a), np.array(b)) for a, b in [(x + e, y), (x - e, y), (x, y + e), (x, y - e)]]
            gx = (zz[0] - zz[1]) / (2 * e) if not np.isnan(zz[0] + zz[1]) else 0
            gy = (zz[2] - zz[3]) / (2 * e) if not np.isnan(zz[2] + zz[3]) else 0
            n = np.array([-gx, -gy, 1.0]); n /= np.linalg.norm(n); pts.append([x, y, float(z), max(0.0, float(n @ L))])
    P = np.array(pts); P[:, 2] = (P[:, 2] - P[:, 2].min()) / (P[:, 2].max() - P[:, 2].min())
    lo, hi = np.percentile(P[:, 3], [3, 99]); P[:, 3] = np.clip((P[:, 3] - lo) / (hi - lo), 0, 1); return P
def draw(im, P, th, cx, cy, s):
    lay = Image.new('RGBA', im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    x, y, z, sh = P.T; c, sn = np.cos(th), np.sin(th)
    X = x * c + (z - 0.5) * 0.9 * sn; D = -x * sn + (z - 0.5) * 0.9 * c
    for i in np.argsort(D):
        k = 0.4 * sh[i] + 0.6 * z[i]; r = (1.6 + 1.3 * sh[i] + 0.4 * z[i]) * s / 300 * 1.15
        px, py = cx + X[i] * s, cy - y[i] * s
        d.ellipse([px - r, py - r, px + r, py + r], fill=depthC(0.2 + 0.8 * k) + (int(255 * (0.45 + 0.55 * (0.6 * sh[i] + 0.4 * z[i]))),))
    im.alpha_composite(lay)
def bg():
    yy, xx = np.mgrid[0:H, 0:W]; t = np.clip(np.sqrt(((xx / W - 0.5) * 1.4) ** 2 + (yy / H - 0.45) ** 2) / 0.9, 0, 1)[..., None]
    a, b = hexc('#0e1d3d')[None, None], hexc('#070f22')[None, None]
    return Image.fromarray((a + (b - a) * t).astype('uint8')).convert('RGBA')
os.makedirs('style/v3', exist_ok=True)
sheet = Image.new('RGB', (W * 2, H * 3)); f = ImageFont.truetype(F, 34)
for row, (fn, lab) in enumerate([(toy, '1 · 圆润公仔'), (faceid, '2 · Face ID 图标'), (pebble, '3 · 鹅卵石')]):
    P = cloud(fn)
    for col, th in enumerate([0.0, 0.6]):
        im = bg(); draw(im, P, th, W / 2, H / 2, 210)
        if col == 0: ImageDraw.Draw(im).text((18, 12), lab, font=f, fill=(255, 209, 102))
        sheet.paste(im.convert('RGB'), (col * W, row * H))
sheet.save('style/v3/models.jpg', quality=90)
