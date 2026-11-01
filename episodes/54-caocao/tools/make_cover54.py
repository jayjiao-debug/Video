"""ep54 曹操 Douyin covers (3:4 1080×1440 and 4:3 1440×1080): the film's own picture fading up into the dark, with a short
text block top-left. r2: the owner found the first cover's text gave away too much (兵不满一万 / 十余万 / 夜袭乌巢), so the
variants now tease only.
The picture is the D1 hero frame at film 101.6 with no overlay, rendered at 1.5×:
  ENTRY=qq54/DVT54a CID=DVT54B SFPS=1 SCALE=1.5 node scripts/frame_ms.mjs stills <dir> 0
Usage: python3 make_cover54.py <hero.png> <out_dir>"""
import sys, os, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
SRC, OUT = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
BRUSH = os.path.join(HERE, '../../37-qiqing/remotion/public/fonts/brush/MaShanZheng-Regular.woff')   # OFL, subset
SERIF = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Black.ttc'
SERIF_R = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Medium.ttc'
FILL = {'cream': (246, 238, 226), 'muted': (222, 200, 170),
        'gold': (np.array([255, 236, 184]), np.array([226, 160, 64])), 'red': (np.array([255, 120, 96]), np.array([196, 40, 30]))}
BASE = np.array([8, 6, 6], np.float32)
# variant: [(text, font, size (on the 3:4), fill, gap after as a fraction of size)]
VARIANTS = {
    'A': [('曹操', BRUSH, 250, 'gold', 0.10), ('英雄，还是奸雄？', BRUSH, 100, 'cream', 0)],
    'B': [('洛阳 · 174年', SERIF_R, 40, 'muted', 0.5), ('20岁，他打死了', SERIF, 84, 'cream', 0.28), ('皇帝红人的叔叔', SERIF, 120, 'gold', 0)],
    'C': [('曹操', BRUSH, 120, 'cream', 0.05), ('英雄？', BRUSH, 170, 'gold', 0.02), ('奸雄？', BRUSH, 170, 'red', 0)],
}

PUNCT = '，？！。：、'
def draw_line(dr, x, y, tx, f, fill):
    """char by char: the brush font centres full-width punctuation in its cell, so pull it in (half-width advance)"""
    size = f.size; cx = x
    if 'woff' not in str(getattr(f, 'path', '')): dr.text((x, y), tx, font=f, fill=fill); return   # Noto sets its own punctuation well
    for ch in tx:
        if ch in PUNCT: dr.text((cx - 0.26 * size, y), ch, font=f, fill=fill); cx += 0.5 * size
        else: dr.text((cx, y), ch, font=f, fill=fill); cx += f.getlength(ch)

def text_block(img, x, y, lines, k=1.0):
    d = ImageDraw.Draw(img); placed = []; yy = y
    for tx, font, size, fill, gap in lines:
        f = ImageFont.truetype(font, int(size * k)); placed.append((tx, f, yy, fill)); yy += int(size * k * (1.18 + gap))
    sh = Image.new('L', img.size, 0); ds = ImageDraw.Draw(sh)
    for tx, f, y0, _ in placed: draw_line(ds, x, y0, tx, f, 255)
    sh = sh.filter(ImageFilter.GaussianBlur(14 * k)); img.paste(Image.new('RGB', img.size, (0, 0, 0)), (0, 0), sh.point(lambda v: int(v * 0.85)))
    for tx, f, y0, fill in placed:
        if isinstance(FILL[fill], tuple) and len(FILL[fill]) == 3: draw_line(d, x, y0, tx, f, FILL[fill]); continue
        top, bot = FILL[fill]; m = Image.new('L', img.size, 0); draw_line(ImageDraw.Draw(m), x, y0, tx, f, 255)
        rows = np.nonzero(np.array(m).max(1))[0]; t0, t1 = rows.min(), rows.max()
        u = np.clip((np.arange(img.size[1]) - t0) / max(1, t1 - t0), 0, 1)[:, None]
        col = (top + (bot - top) * u).astype(np.uint8)
        img.paste(Image.fromarray(np.repeat(col[:, None, :], img.size[0], axis=1).reshape(img.size[1], img.size[0], 3)), (0, 0), m)

def picture(W, H, img_h, top, cx, fade_top=380, fade_bot=220):
    src = Image.open(SRC).convert('RGB'); sc = img_h / src.height; src = src.resize((int(src.width * sc), img_h), Image.LANCZOS)
    x0 = int(min(max(0, cx * src.width - W / 2), src.width - W)); crop = src.crop((x0, 0, x0 + W, img_h))
    canvas = Image.new('RGB', (W, H), tuple(BASE.astype(int))); canvas.paste(crop, (0, top))
    arr = np.array(canvas).astype(np.float32); yy = np.arange(H)[:, None]
    u = np.clip((yy - top) / fade_top, 0, 1); fade = u * u * (3 - 2 * u)
    ub = np.clip((H - yy) / fade_bot, 0, 1); fade = fade * (0.45 + 0.55 * ub * ub * (3 - 2 * ub))
    arr = BASE + (arr - BASE) * fade[..., None]
    xx = np.arange(W)[None, :]; r = np.sqrt(((xx - W * 0.6) / (W / 2)) ** 2 + ((yy - H * 0.55) / (H * 0.7)) ** 2)
    arr *= np.clip(1 - 0.4 * np.clip(r - 0.6, 0, 1), 0, 1)[..., None]
    return Image.fromarray(arr.clip(0, 255).astype(np.uint8))

for name, lines in VARIANTS.items():
    t = picture(1080, 1440, 1120, 360, 0.66); text_block(t, 76, 70, lines); t.save(f'{OUT}/曹操_竖封面_3比4_{name}.png')
    w = picture(1440, 1080, 1180, 120, 0.58, fade_top=300, fade_bot=160)
    a = np.array(w).astype(np.float32); yy, xx = np.mgrid[0:1080, 0:1440]
    m = np.clip(1 - 0.66 * np.exp(-(((xx - 260) / 820) ** 2 + ((yy - 230) / 420) ** 2)), 0, 1)
    w = Image.fromarray((a * m[..., None]).clip(0, 255).astype(np.uint8)); text_block(w, 80, 50, lines, k=0.92); w.save(f'{OUT}/曹操_横封面_4比3_{name}.png')
print('ok')
