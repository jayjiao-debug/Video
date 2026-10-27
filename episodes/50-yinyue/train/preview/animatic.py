"""Cheap rough cut: stills + slow push-ins, cuts on bar lines, a light pulse on every 哐, subtitles, real music."""
import sys, os, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
sys.path.insert(0, '/home/user/Video/episodes/50-yinyue/train'); sys.path.insert(0, '/home/user/Video/episodes/50-yinyue/train/audio')
import tempo as T, cues
import score_train as ST
S = '/tmp/claude-0/-home-user-Video/ca950e1c-26f8-5f17-9c2a-78a6336a8884/scratchpad'
OUT = f'{S}/preview'
W, H, FPS = 1280, 720, 30
F_SUB = ImageFont.truetype('/home/user/assets/fonts/NotoSansCJKsc-Black.otf', 46)
F_PLQ = ImageFont.truetype('/home/user/assets/fonts/NotoSerifSC-Black.otf', 64)
F_BIG = ImageFont.truetype('/home/user/assets/fonts/NotoSansCJKsc-Black.otf', 150)
score = ST.build()
CLACK = [e['t'] for e in score.tracks['clack']]
KICK = [e['t'] for e in score.tracks['kick_e']] + [e['t'] for e in score.tracks['drums'] if e['d'] == 'kick']


def load(p, crop=None):
    im = Image.open(p).convert('RGB')
    if crop:
        im = im.crop(crop)
    im = im.resize((W, H), Image.LANCZOS)
    return im.filter(ImageFilter.UnsharpMask(1.2, 60, 2))


def push(im, u, z0=1.0, z1=1.08, cx=0.5, cy=0.5):
    z = z0 + (z1 - z0) * u
    w, h = W / z, H / z
    x0, y0 = (W - w) * cx, (H - h) * cy
    return im.crop((x0, y0, x0 + w, y0 + h)).resize((W, H), Image.BILINEAR)


def subtitle(im, txt):
    if not txt:
        return im
    d = ImageDraw.Draw(im)
    tw = d.textlength(txt, font=F_SUB)
    x, y = (W - tw) / 2, H - 120
    sh = Image.new('L', (W, H), 0); ds = ImageDraw.Draw(sh)
    ds.text((x, y + 3), txt, font=F_SUB, fill=200)
    sh = sh.filter(ImageFilter.GaussianBlur(8))
    im = Image.composite(Image.new('RGB', (W, H), (8, 14, 22)), im, sh)
    d = ImageDraw.Draw(im)
    d.text((x, y), txt, font=F_SUB, fill=(255, 255, 255), stroke_width=2, stroke_fill=(20, 26, 34))
    return im


def pulse(im, t, times, amt=0.10, dur=0.12):
    k = max([0.0] + [1 - (t - c) / dur for c in times if 0 <= t - c < dur])
    return ImageEnhance.Brightness(im).enhance(1 + amt * k) if k > 0 else im


def plaque(im, a):
    if a <= 0:
        return im
    pw, ph = 620, 130
    x0, y0 = (W - pw) // 2, int(H * 0.42)
    pl = Image.new('RGBA', (pw, ph), (0, 0, 0, 0)); d = ImageDraw.Draw(pl)
    d.rounded_rectangle((0, 0, pw - 1, ph - 1), 14, fill=(236, 234, 226, 255), outline=(30, 30, 30, 255), width=4)
    d.rounded_rectangle((10, 10, pw - 11, ph - 11), 10, outline=(30, 30, 30, 255), width=2)
    tw = d.textlength('开往零点的列车', font=F_PLQ)
    d.text(((pw - tw) / 2, 20), '开往零点的列车', font=F_PLQ, fill=(18, 18, 18, 255))
    for cx in (22, pw - 22):        # chips at the corners
        d.ellipse((cx - 7, ph - 22, cx + 5, ph - 12), fill=(28, 40, 60, 255))
    pl.putalpha(pl.getchannel('A').point(lambda v: int(v * min(1, a))))
    base = im.convert('RGBA')
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle((x0 + 8, y0 + 12, x0 + pw + 8, y0 + ph + 12), 14, fill=(0, 0, 0, int(120 * min(1, a))))
    base = Image.alpha_composite(base, sh.filter(ImageFilter.GaussianBlur(10)))
    base.alpha_composite(pl, (x0, y0))
    return base.convert('RGB')


def render(shots, t0, t1, name, subs_on=True, extra=None):
    d = f'{OUT}/{name}_frames'; os.makedirs(d, exist_ok=True)
    n = int(round((t1 - t0) * FPS))
    for i in range(n):
        t = t0 + i / FPS
        sh = next(s for s in shots if s['a'] <= t < s['b'])
        u = (t - sh['a']) / (sh['b'] - sh['a'])
        im = push(sh['im'], u, *sh.get('z', (1.0, 1.08)), *sh.get('c', (0.5, 0.5)))
        if sh.get('fn'):
            im = sh['fn'](im, t, u)
        im = pulse(im, t, CLACK if sh.get('pulse', 'clack') == 'clack' else KICK, sh.get('amt', 0.10))
        if extra:
            im = extra(im, t)
        if subs_on:
            im = subtitle(im, cues.sub_at(t))
        im.save(f'{d}/{i:04d}.jpg', quality=90)
    return d, n
