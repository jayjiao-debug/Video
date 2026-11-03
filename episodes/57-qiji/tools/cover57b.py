"""ep57 covers in our house cover style (owner 13:49: the sticker covers were too far from our earlier style). The layout is
docs/history-video-style/make_cover_template.py (ep44): a small kicker, a two-line serif title (line 1 cream, line 2 rose-gold),
a small line under it, and the picture below fading up into the dark field with a soft vignette. The picture is the film's own
album: the seven real 打卡 photos (with 「你」 in them) as polaroids. 3:4 (1080x1440) and 4:3 (1440x1080). `python3 cover57b.py`"""
import os, sys, importlib.util
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
S = '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad'; D4 = f'{S}/sb57/demo4'; OUT = f'{S}/farm57'
spec = importlib.util.spec_from_file_location('tpl', '/home/claude/video/docs/history-video-style/make_cover_template.py')
src = open(spec.origin).read(); src = src[:src.index('FADE = [420, 260]')]      # take only the fonts, colours and text_block, not its run
T = {'__file__': spec.origin}; exec(compile(src, spec.origin, 'exec'), T)
text_block = T['text_block']
CAP = 'Noto Sans CJK SC'; SANS = '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
PH = [('chichen', '奇琴伊察'), ('machu2', '马丘比丘'), ('christ', '基督像'), ('colosseum', '斗兽场'), ('petra2', '佩特拉'), ('taj', '泰姬陵'), ('greatwall2', '长城')]
def card_src(k): return f'{S}/sb57/comp_greatwall2.jpg' if k == 'greatwall2' else f'{D4}/card_{k}.jpg'

def polaroid(k, name, w):
    im = Image.open(card_src(k)).convert('RGB'); h = int(w * 2 / 3)
    sc = max(w / im.width, h / im.height); im = im.resize((int(im.width * sc) + 1, int(im.height * sc) + 1), Image.LANCZOS)
    x0, y0 = (im.width - w) // 2, (im.height - h) // 2; im = im.crop((x0, y0, x0 + w, y0 + h))
    pad, bot = int(w * .045), int(w * .17); card = Image.new('RGB', (w + 2 * pad, h + pad + bot), '#FBFAF6'); card.paste(im, (pad, pad))
    d = ImageDraw.Draw(card); f = ImageFont.truetype(SANS, int(w * .07)); tw = d.textlength(name, font=f)
    d.text(((card.width - tw) / 2, h + pad + bot * .22), name, font=f, fill='#5A4E44')
    return card

def collage(W, H, layout):
    """the album on a dark table: polaroids with drop shadows, rotated"""
    base = Image.new('RGB', (W, H), (16, 14, 13))
    for (k, name), (cx, cy, w, rot) in zip(PH, layout):
        c = polaroid(k, name, w).convert('RGBA'); c = c.rotate(rot, resample=Image.BICUBIC, expand=True)
        sh = Image.new('RGBA', (c.width + 80, c.height + 80), (0, 0, 0, 0)); sh.paste((0, 0, 0, 150), (40, 58), c.split()[3]); sh = sh.filter(ImageFilter.GaussianBlur(18))
        base.paste(sh, (int(cx - sh.width / 2), int(cy - sh.height / 2 + 6)), sh); base.paste(c, (int(cx - c.width / 2), int(cy - c.height / 2)), c)
    return base

def fade(img, top, W, H, darken_tl=False):
    arr = np.array(img).astype(np.float32); yy = np.arange(H)[:, None]
    u = np.clip((yy - top) / 420, 0, 1); f = u * u * (3 - 2 * u); ub = np.clip((H - yy) / 260, 0, 1); f = f * (.35 + .65 * ub * ub * (3 - 2 * ub))
    base = np.array([10, 12, 15], np.float32); arr = base + (arr - base) * f[..., None]
    xx = np.arange(W)[None, :]; r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H * .6) / (H * .7)) ** 2); arr *= np.clip(1 - .45 * np.clip(r - .6, 0, 1), 0, 1)[..., None]
    if darken_tl:
        Y, X = np.mgrid[0:H, 0:W]; m = np.clip(1 - .62 * np.exp(-(((X - 200) / 900) ** 2 + ((Y - 160) / 420) ** 2)), 0, 1); arr *= m[..., None]
    return Image.fromarray(arr.clip(0, 255).astype(np.uint8))

K_, L1, L2, SUB = '北京出发 · 绕地球一圈 · 39,735 公里', '新世界七大奇迹，', '你去过几个？', '7 张打卡照，每一站都有「你」'
# tall: the album fills the lower two thirds
tall_layout = [(250, 520, 420, -7), (760, 500, 420, 5), (280, 820, 400, 4), (790, 810, 420, -5), (250, 1120, 400, -4), (760, 1110, 420, 6), (520, 1330, 400, -2)]
t = Image.new('RGB', (1080, 1440), (16, 14, 13)); col = collage(1080, 1440, tall_layout); t.paste(col, (0, 0))
t = fade(t, 330, 1080, 1440); text_block(t, 78, 96, K_, L1, L2, SUB, 96, 124); t.save(f'{OUT}/新世界七大奇迹_封面_竖版_3x4.png')
wide_layout = [(820, 330, 330, 6), (1180, 300, 330, -5), (290, 650, 350, -6), (700, 640, 360, 4), (1110, 635, 350, -3), (470, 900, 330, 5), (920, 905, 340, -6)]
w = Image.new('RGB', (1440, 1080), (16, 14, 13)); w.paste(collage(1440, 1080, wide_layout), (0, 0))
w = fade(w, 170, 1440, 1080, darken_tl=True); text_block(w, 80, 60, K_, L1, L2, SUB, 86, 108); w.save(f'{OUT}/新世界七大奇迹_封面_横版_4x3.png')
print('ok')
