"""Douyin covers for ep41 (横版 1440×1080, 竖版 1080×1440) from the film's own Bell frame."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np, os
D = os.path.dirname(os.path.abspath(__file__))
SERIF = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc'; SANS = '/usr/share/fonts/opentype/noto/NotoSansCJK-Medium.ttc'
bg0 = Image.open(f'{D}/f_6.0.png').convert('RGB')
HOOK = ['第一通电话', '他说了什么？']; TITLE = '《为了跟你说一句话，人类努力了三千年》'; SERIES = 'VIBE知识大赏'

def gold_text(img, lines, size, cy, line_gap=1.18, cx=None):
    W, H = img.size; cx = W / 2 if cx is None else cx; f = ImageFont.truetype(SERIF, size, index=0)
    mask = Image.new('L', img.size, 0); d = ImageDraw.Draw(mask); y = cy - size * line_gap * len(lines) / 2
    for ln in lines:
        bb = d.textbbox((0, 0), ln, font=f)            # ink box: centre the ink, not the advance (handles the trailing ？)
        d.text((cx - (bb[0] + bb[2]) / 2, y - bb[1]), ln, font=f, fill=255); y += size * line_gap
    sh = mask.filter(ImageFilter.GaussianBlur(size * 0.08)); shadow = Image.new('RGB', img.size, (0, 0, 0))
    img.paste(shadow, (0, 0), sh.point(lambda v: int(v * 0.85)))
    g = np.zeros((H, W, 3), np.float32); yy = np.linspace(0, 1, H)[:, None]
    top, mid, bot = np.array([255, 241, 196]), np.array([242, 207, 122]), np.array([201, 149, 47])
    ys = np.nonzero(np.array(mask).max(1))[0]; a, b = (ys.min(), ys.max()) if len(ys) else (0, H)
    u = np.clip((np.arange(H) - a) / max(1, b - a), 0, 1)[:, None]
    col = np.where(u[..., None] < 0.5, top + (mid - top) * (u[..., None] * 2), mid + (bot - mid) * ((u[..., None] - 0.5) * 2))
    g[:] = col.reshape(H, 1, 3); img.paste(Image.fromarray(g.astype(np.uint8)), (0, 0), mask)
    return y

def small(img, text, size, cy, fill, font=SERIF, spacing=0.0):
    W, _ = img.size; f = ImageFont.truetype(font, size, index=0); d = ImageDraw.Draw(img); bb = d.textbbox((0, 0), text, font=f)
    d.text((W / 2 - (bb[0] + bb[2]) / 2, cy - (bb[1] + bb[3]) / 2), text, font=f, fill=fill)

def vignette(img, strength=0.6, band=None):
    W, H = img.size; yy, xx = np.mgrid[0:H, 0:W]; r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    v = np.clip(1 - strength * np.clip(r - 0.45, 0, 1) ** 1.5, 0, 1)
    if band: a, b, k = band; v *= np.clip(1 - k * np.clip((yy - a) / (b - a), 0, 1), 0, 1) if b > a else np.clip(1 - k * np.clip((a - yy) / (a - b), 0, 1), 0, 1)
    arr = np.array(img).astype(np.float32) * v[..., None]; return Image.fromarray(arr.clip(0, 255).astype(np.uint8))

# 横版 1440×1080: Bell centred, the hook over a dark band at the bottom
wide = bg0.crop((300, 0, 1740, 1080)); wide = vignette(wide, 0.7, (560, 1000, 0.82))
y = gold_text(wide, HOOK, 132, 800)
small(wide, TITLE, 40, 990, (236, 228, 210))
small(wide, SERIES, 30, 70, (242, 207, 122), SANS)
wide.save(f'{D}/封面_横版_4x3.png')
# 竖版 1080×1440: scaled to the height, Bell and the mouthpiece in frame, hook in the upper wall (lower 18 % kept free)
big = bg0.resize((2560, 1440), Image.LANCZOS); tall = big.crop((900, 0, 1980, 1440)); tall = vignette(tall, 0.6, (560, 60, 0.8))
gold_text(tall, HOOK, 124, 300)
small(tall, TITLE, 36, 520, (236, 228, 210))
small(tall, SERIES, 30, 92, (242, 207, 122), SANS)
tall.save(f'{D}/封面_竖版_3x4.png')
for n in ('封面_横版_4x3.png', '封面_竖版_3x4.png'): im = Image.open(f'{D}/{n}'); print(n, im.size); im.resize((im.width // 4, im.height // 4)).save(f'{D}/thumb_{n}')
