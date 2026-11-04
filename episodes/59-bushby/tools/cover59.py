"""ep59 covers in the house template (docs/history-video-style/make_cover_template.py): kicker, two-line serif title (cream / rose-gold),
a sub line, the film's own picture fading up from below. Picture: the drawn hug at the door (EP59V3PIC frame 4400, picture only).
3:4 (1080x1440) and 4:3 (1440x1080). `python3 cover59.py <picture.png> <out_dir> "<kicker>" "<l1>" "<l2>" "<sub>"`"""
import sys, importlib.util
import numpy as np
from PIL import Image
spec = importlib.util.spec_from_file_location('tpl', '/home/claude/video/docs/history-video-style/make_cover_template.py')
src = open(spec.origin).read(); src = src[:src.index('FADE = [420, 260]')]
T = {'__file__': spec.origin}; exec(compile(src, spec.origin, 'exec'), T); text_block = T['text_block']
pic, out, K, L1, L2, SUB = sys.argv[1:7]
P = Image.open(pic).convert('RGB')
def fade(img, top, W, H, darken_tl=False):
    a = np.array(img).astype(np.float32); yy = np.arange(H)[:, None]
    u = np.clip((yy - top) / 420, 0, 1); f = u * u * (3 - 2 * u); ub = np.clip((H - yy) / 260, 0, 1); f = f * (.35 + .65 * ub * ub * (3 - 2 * ub))
    base = np.array([10, 12, 15], np.float32); a = base + (a - base) * f[..., None]
    xx = np.arange(W)[None, :]; r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H * .6) / (H * .7)) ** 2); a *= np.clip(1 - .45 * np.clip(r - .6, 0, 1), 0, 1)[..., None]
    if darken_tl:
        Y, X = np.mgrid[0:H, 0:W]; m = np.clip(1 - .62 * np.exp(-(((X - 200) / 900) ** 2 + ((Y - 160) / 420) ** 2)), 0, 1); a *= m[..., None]
    return Image.fromarray(a.clip(0, 255).astype(np.uint8))
def place(W, H, ph, cx, top):
    sc = ph / P.height; im = P.resize((int(P.width * sc), ph), Image.LANCZOS)
    x0 = int(min(max(0, cx * im.width - W / 2), im.width - W)); c = Image.new('RGB', (W, H), (10, 12, 15)); c.paste(im.crop((x0, 0, x0 + W, ph)), (0, top)); return c
t = fade(place(1080, 1440, 1140, 0.30, 300), 330, 1080, 1440); text_block(t, 78, 96, K, L1, L2, SUB, 96, 124); t.save(f'{out}/他走路回家_封面_竖版_3x4.png')
# wide (owner 03:08: the building took half the frame): the frame mirrored, pushed in and right-aligned, so the facade sits under the
# title and the hug, the street, the bunting and the press fill the rest
from PIL import ImageOps
M = ImageOps.mirror(P); ph = 994; im = M.resize((int(M.width * ph / M.height), ph), Image.LANCZOS); x0 = im.width - 1440; top = 110
w = Image.new('RGB', (1440, 1080), (10, 12, 15)); w.paste(im.crop((x0, 0, x0 + 1440, ph)), (0, top))
a = np.array(w).astype(np.float32); Y, X = np.mgrid[0:1080, 0:1440]; yy = np.arange(1080)[:, None]
u = np.clip((yy - top) / 300, 0, 1); f = u * u * (3 - 2 * u); base = np.array([10, 12, 15], np.float32); a = base + (a - base) * f[..., None]
a *= np.clip(1 - .62 * np.exp(-(((X - 240) / 760) ** 2 + ((Y - 200) / 380) ** 2)), 0, 1)[..., None]
r = np.sqrt(((X - 720) / 720) ** 2 + ((Y - 648) / 756) ** 2); a *= np.clip(1 - .45 * np.clip(r - .6, 0, 1), 0, 1)[..., None]
w = Image.fromarray(a.clip(0, 255).astype(np.uint8)); text_block(w, 80, 60, K, L1, L2, SUB, 86, 108); w.save(f'{out}/他走路回家_封面_横版_4x3.png')
print('ok')
