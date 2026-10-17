#!/usr/bin/env python3
"""Cardboard look, figure/ground pass (from the 2026-10-17 art review):
1. public/bg2/<bg>.jpg  — each soft background graded so the tan puppets separate from it (darker, cooler or redder, bokeh rolled off,
   a darker floor plane the puppets stand on, a vignette toward the subject);
2. per puppet, from public/cut(2)/<id>.png: cut_sh (a second, softer drop shadow), cut_rim (a thin warm rim just outside the
   cardboard, for lives in the circle of care) and cut_dk (the same puppet darkened, for lives outside it: darker, not see-through)."""
import json, os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
YY, XX = np.mgrid[0:1080, 0:1920].astype(np.float32)
f = lambda im: np.asarray(im).astype(np.float32) / 255
u8 = lambda a: Image.fromarray((np.clip(a, 0, 1) * 255 + .5).astype(np.uint8))
lum = lambda a: a[..., 0] * .2126 + a[..., 1] * .7152 + a[..., 2] * .0722
radial = lambda cx, cy, rx, ry: np.sqrt(((XX - cx) / rx) ** 2 + ((YY - cy) / ry) ** 2)
def smooth(a, b, x): t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)
def grade(img, blur=0, knee=None, bright=1, sat=1, gains=(1, 1, 1), vign=None, floor=None, pool=None, band=None):
    a = f(img)
    if blur: a = np.stack([nd.gaussian_filter(a[..., c], blur) for c in range(3)], -1)
    if knee: th, k = knee; l = lum(a); nl = np.where(l > th, th + (l - th) * k, l); a = a * (nl / np.maximum(l, 1e-4))[..., None]
    a = a * bright; l = lum(a)[..., None]; a = l + (a - l) * sat; a = a * np.array(gains, np.float32)
    if band: y0, y1, k = band; w = smooth(y0 - 120, y0, YY) * (1 - smooth(y1, y1 + 120, YY)); a = a * (1 - w * (1 - k))[..., None]
    if floor: yt, col, al = floor; w = smooth(yt - 25, yt + 35, YY) * al; a = a * (1 - w[..., None]) + np.array(col, np.float32)[None, None] / 255 * w[..., None]
    if vign: cx, cy, rx, ry, s = vign; a = a * (1 - s * smooth(.35, 1.15, radial(cx, cy, rx, ry)))[..., None]
    if pool: cx, cy, rx, ry, al, col = pool; d = radial(cx, cy, rx, ry); w = (np.exp(-d * d * 2.2) * al)[..., None]; a = 1 - (1 - a) * (1 - np.array(col, np.float32) / 255 * w)
    return u8(a)
REC = {
 'studio':  dict(blur=7, knee=(.26, .5), bright=.88, sat=.92, gains=(1.0, .89, .92), floor=(782, (44, 27, 26), .5), vign=(960, 560, 1000, 640, .32), pool=(960, 600, 720, 270, .13, (255, 190, 120))),
 'savanna': dict(blur=6, knee=(.45, .6), bright=.88, sat=1.15, gains=(1.0, .87, .86), band=(500, 760, .74), floor=(780, (70, 40, 36), .40), vign=(900, 560, 1050, 650, .30), pool=(1610, 430, 190, 190, .55, (255, 226, 170))),
 'room':    dict(blur=6, knee=(.55, .5), bright=.76, sat=1.0, gains=(1.0, .93, .86), band=(200, 780, .82), floor=(785, (84, 58, 46), .55), vign=(960, 480, 950, 600, .35)),
 'pond':    dict(blur=8, knee=(.45, .6), bright=.80, sat=1.0, gains=(.97, 1.0, 1.02), band=(330, 700, .82), vign=(960, 520, 1050, 640, .30), pool=(960, 640, 800, 200, .10, (255, 226, 170))),
 'river':   dict(blur=6, knee=(.45, .6), bright=.90, sat=1.12, gains=(1.0, .93, .88), band=(450, 720, .66), vign=(900, 600, 1050, 620, .22)),
 'night':   dict(blur=4, knee=(.25, .6), bright=.92, vign=(1000, 560, 1000, 620, .28)),
 'dusk':    dict(blur=4, knee=(.18, .5), bright=.96, vign=(960, 600, 1050, 650, .22)),
}
os.makedirs(f'{R}/public/bg2', exist_ok=True)
for b, rec in REC.items():
    grade(Image.open(f'{R}/public/bg/{b}.jpg').convert('RGB'), **rec).save(f'{R}/public/bg2/{b}.jpg', quality=92)
    print('bg', b)
CUT = json.load(open(f'{R}/src/cut.json')); CUT2 = json.load(open(f'{R}/src/cut2.json'))
PAD = 90
for d in ('cut_sh', 'cut_rim', 'cut_dk'): os.makedirs(f'{R}/public/{d}', exist_ok=True)
for id_, a in list(CUT.items()) + list(CUT2.items()):
    src = 'cut2' if id_ in CUT2 else 'cut'; k = a.get('k', 1)
    im = Image.open(f'{R}/public/{src}/{id_}.png').convert('RGBA'); A = np.asarray(im.split()[3]).astype(np.float32)
    # the second shadow: the silhouette, padded, blurred (≈26 px on screen at scale 1)
    big = np.zeros((im.height + 2 * PAD, im.width + 2 * PAD), np.float32); big[PAD:PAD + im.height, PAD:PAD + im.width] = A
    big = nd.gaussian_filter(big, 26 * k) * 0.32
    sh = np.zeros(big.shape + (4,), np.uint8); sh[..., 0], sh[..., 1], sh[..., 2] = 18, 10, 4; sh[..., 3] = np.clip(big, 0, 255)
    Image.fromarray(sh).save(f'{R}/public/cut_sh/{id_}.png', optimize=True)
    # the rim: a thin ring just outside the cardboard, not on the stick
    solid = A > 200; ring = nd.binary_dilation(solid, iterations=int(6 * k)) & ~solid
    ring = nd.gaussian_filter(ring.astype(np.float32), 1.5 * k); fy = int(a['ay'] + 6 * k); ring[fy:] = 0
    rim = np.zeros(A.shape + (4,), np.uint8); rim[..., 0], rim[..., 1], rim[..., 2] = 255, 222, 160; rim[..., 3] = np.clip(ring * 255 * 1.4, 0, 255)
    Image.fromarray(rim).save(f'{R}/public/cut_rim/{id_}.png', optimize=True)
    # darker cardboard for lives left outside
    dk = np.asarray(im).astype(np.float32).copy(); dk[..., :3] *= np.array([.5, .52, .6]); Image.fromarray(dk.clip(0, 255).astype(np.uint8)).save(f'{R}/public/cut_dk/{id_}.png', optimize=True)
print('puppets', len(CUT) + len(CUT2), 'pad', PAD)
