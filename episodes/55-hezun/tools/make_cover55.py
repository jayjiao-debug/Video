"""ep55 何尊 Douyin covers (3:4 1080×1440 and 4:3 1440×1080), the ep54 recipe: the film's own picture fading up out of
the dark, a short text block top-left. Teaser only (owner note on ep54: 封面表露太多了): the covers never show 宅兹中国 or
where the two characters are.
The picture is card 1 at t = 5.2 s (the 尊 on the scrap-yard scale with its 30元 tag), bronzeA look, no overlay, 1.5×:
  ENTRY=qq55h/COVER55 CID=COVER55 SFPS=1 SCALE=1.5 node scripts/frame_ms.mjs stills <dir> 0
Usage: python3 make_cover55.py <picture.png> <out_dir> [yard|pour|gold]
  pour / gold (owner 11-02 「do the furnace」): COVER55F frames 46 (54.6 s, the bronze pouring into the glowing mould) and
  100 (60.0 s, the golden 尊 out of the broken mould), same text as the chosen B with a kicker that fits the foundry."""
import sys, os, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from fontTools.ttLib import TTFont
SRC, OUT = sys.argv[1], sys.argv[2]
SET = sys.argv[3] if len(sys.argv) > 3 else 'yard'
HERE = os.path.dirname(os.path.abspath(__file__))
BRUSH = os.path.join(HERE, '../../37-qiqing/remotion/public/fonts/brush/MaShanZheng-Regular.woff')   # OFL, subset
SERIF = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Black.ttc'
SERIF_R = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Medium.ttc'
FILL = {'cream': (246, 238, 226), 'muted': (222, 200, 170),
        'gold': (np.array([255, 236, 184]), np.array([214, 150, 70]))}
BASE = np.array([10, 7, 5], np.float32)
# variant: [(text, font, size (on the 3:4), fill, gap after as a fraction of size)]
VARIANTS = {
    'A': [('1965 · 宝鸡 · 废品收购站', SERIF_R, 40, 'muted', 0.5), ('这件“破烂”', SERIF, 104, 'cream', 0.16), ('身价30元', SERIF, 150, 'gold', 0)],
    'B': [('1965 · 宝鸡 · 废品收购站', SERIF_R, 40, 'muted', 0.5), ('差点被销毁的', SERIF, 104, 'cream', 0.16), ('国宝', SERIF, 190, 'gold', 0)],
    'C': [('3000年前的一件酒器', SERIF_R, 40, 'muted', 0.5), ('它身上', SERIF, 104, 'cream', 0.16), ('藏着两个字', SERIF, 140, 'gold', 0)],
}

def covers(path, text):
    cmap = TTFont(path, fontNumber=0).getBestCmap() if path.endswith('.ttc') else TTFont(path).getBestCmap()
    return [ch for ch in text if ord(ch) not in cmap and ch != ' ']

PUNCT = '，？！。：、'
def draw_line(dr, x, y, tx, f, fill):
    """char by char for the brush font (it centres full-width punctuation in its cell); Noto sets its own punctuation well"""
    size = f.size; cx = x
    if 'woff' not in str(getattr(f, 'path', '')): dr.text((x, y), tx, font=f, fill=fill); return
    for ch in tx:
        if ch in PUNCT: dr.text((cx - 0.26 * size, y), ch, font=f, fill=fill); cx += 0.5 * size
        else: dr.text((cx, y), ch, font=f, fill=fill); cx += f.getlength(ch)

def text_block(img, x, y, lines, k=1.0):
    d = ImageDraw.Draw(img); placed = []; yy = y
    for tx, font, size, fill, gap in lines:
        miss = covers(font, tx); assert not miss, (font, miss)
        f = ImageFont.truetype(font, int(size * k)); placed.append((tx, f, yy, fill)); yy += int(size * k * (1.18 + gap))
    sh = Image.new('L', img.size, 0); ds = ImageDraw.Draw(sh)
    for tx, f, y0, _ in placed: draw_line(ds, x, y0, tx, f, 255)
    ink = int(np.nonzero(np.array(sh).max(1))[0].max())   # the block's ink bottom, for the series line below it
    sh = sh.filter(ImageFilter.GaussianBlur(14 * k)); img.paste(Image.new('RGB', img.size, (0, 0, 0)), (0, 0), sh.point(lambda v: int(v * 0.85)))
    for tx, f, y0, fill in placed:
        if len(FILL[fill]) == 3: draw_line(d, x, y0, tx, f, FILL[fill]); continue
        top, bot = FILL[fill]; m = Image.new('L', img.size, 0); draw_line(ImageDraw.Draw(m), x, y0, tx, f, 255)
        rows = np.nonzero(np.array(m).max(1))[0]; t0, t1 = rows.min(), rows.max()
        u = np.clip((np.arange(img.size[1]) - t0) / max(1, t1 - t0), 0, 1)[:, None]
        col = (top + (bot - top) * u).astype(np.uint8)
        img.paste(Image.fromarray(np.repeat(col[:, None, :], img.size[0], axis=1).reshape(img.size[1], img.size[0], 3)), (0, 0), m)
    return ink

def picture(W, H, img_h, top, cx, fade_top=380, fade_bot=220):
    src = Image.open(SRC).convert('RGB'); sc = img_h / src.height; src = src.resize((int(src.width * sc), img_h), Image.LANCZOS)
    x0 = int(min(max(0, cx * src.width - W / 2), src.width - W)); crop = src.crop((x0, 0, x0 + W, img_h))
    canvas = Image.new('RGB', (W, H), tuple(BASE.astype(int))); canvas.paste(crop, (0, top))
    arr = np.array(canvas).astype(np.float32); yy = np.arange(H)[:, None]
    u = np.clip((yy - top) / fade_top, 0, 1); fade = u * u * (3 - 2 * u)
    ub = np.clip((H - yy) / fade_bot, 0, 1); fade = fade * (0.45 + 0.55 * ub * ub * (3 - 2 * ub))
    arr = BASE + (arr - BASE) * fade[..., None]
    xx = np.arange(W)[None, :]; r = np.sqrt(((xx - W * 0.5) / (W / 2)) ** 2 + ((yy - H * 0.62) / (H * 0.7)) ** 2)
    arr *= np.clip(1 - 0.4 * np.clip(r - 0.6, 0, 1), 0, 1)[..., None]
    return Image.fromarray(arr.clip(0, 255).astype(np.uint8))

def series(img, x, y, k=1.0):
    """the small line under the hook: the film's title only (owner 11-02: no VIBE知识大赏 on the cover)"""
    d = ImageDraw.Draw(img); f = ImageFont.truetype(SERIF_R, int(36 * k))
    d.text((x, y), '《“中国”两个字，最早出现在哪？》', font=f, fill=FILL['muted'])

F_LINES = [('三千年前 · 西周 · 铸造', SERIF_R, 40, 'muted', 0.5), ('差点被销毁的', SERIF, 104, 'cream', 0.16), ('国宝', SERIF, 190, 'gold', 0)]
# per set: the variants and the picture crop (tall cx, wide cx)
SETS = {'yard': (VARIANTS, 0.55, 0.56, 1300, 150), 'pour': ({'F1': F_LINES}, 0.52, 0.52, 1300, 150), 'gold': ({'F2': F_LINES}, 0.49, 0.45, 1180, 270)}   # + tall picture height, top
os.makedirs(OUT, exist_ok=True)
VS, TCX, WCX, TH, TT = SETS[SET]
for name, lines in VS.items():
    t = picture(1080, 1440, TH, TT, TCX, fade_top=420, fade_bot=200); yb = text_block(t, 76, 80, lines)
    if SET != 'yard': series(t, 70, yb + 34)      # owner 11-02: the gold cover (F2) carries the title line under 国宝
    t.save(f'{OUT}/何尊_竖封面_3比4_{name}.png')
    w = picture(1440, 1080, 1280, -90, WCX, fade_top=200, fade_bot=150)
    a = np.array(w).astype(np.float32); yy, xx = np.mgrid[0:1080, 0:1440]
    m = np.clip(1 - 0.62 * np.exp(-(((xx - 300) / 760) ** 2 + ((yy - 220) / 380) ** 2)), 0, 1)
    w = Image.fromarray((a * m[..., None]).clip(0, 255).astype(np.uint8)); yb = text_block(w, 86, 64, lines, k=0.86)
    if SET != 'yard': series(w, 80, yb + 28, k=0.86)
    w.save(f'{OUT}/何尊_横封面_4比3_{name}.png')
print('ok')
