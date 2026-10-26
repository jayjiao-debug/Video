"""ep50 covers (from docs/history-video-style/make_cover_template.py) in the reference grid's layout (kicker, two-line serif title: line 1 cream, line 2 rose-gold, a small line under it,
the picture below fading up into dark). No producer mark. 3:4 (1080×1440) and 4:3 (1440×1080) per variant."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np, os
D = os.path.dirname(os.path.abspath(__file__)); P = f'{D}/pic'
SERIF = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Black.ttc'
if not os.path.exists(SERIF): SERIF = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc'
SERIF_R = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Medium.ttc'
if not os.path.exists(SERIF_R): SERIF_R = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc'
CREAM = (246, 238, 226); ROSE_T, ROSE_B = np.array([255, 232, 170]), np.array([214, 160, 64])   # lacquer gold leaf
V = [  # name, picture, crop centre x (0–1), kicker, line1, line2, sub
    ('A', 'f_28.6.png', 0.60, '从古至今 · 钱', '“钱”字原来是', '一把铲子', '财、货、贵都带贝，偏偏钱是金字旁'),
    ('B', 'f_2.2.png', 0.47, '从古至今 · 钱', '钱是怎么从贝壳', '变成二维码的？', '贝壳 · 铲子 · 交子 · 白银 · 手机'),
    ('C', 'f_70.5.png', 0.48, '北宋 · 四川', '一千文铁钱，重25斤', '换成一张纸', '交子：世界上最早的纸币之一'),
]
def text_block(img, x, y, kicker, l1, l2, sub, s1, s2):
    d = ImageDraw.Draw(img)
    fk = ImageFont.truetype(SERIF_R, int(s2 * 0.21), index=0); f1 = ImageFont.truetype(SERIF, s1, index=0); f2 = ImageFont.truetype(SERIF, s2, index=0)
    fs = ImageFont.truetype(SERIF_R, int(s2 * 0.30), index=0)
    # shadow layer
    sh = Image.new('L', img.size, 0); ds = ImageDraw.Draw(sh)
    yk = y; y1 = yk + int(s2 * 0.42); y2 = y1 + int(s1 * 1.22); ys = y2 + int(s2 * 1.62)
    for (tx, f, yy) in ((l1, f1, y1), (l2, f2, y2), (sub, fs, ys)): ds.text((x, yy), tx, font=f, fill=255)
    sh = sh.filter(ImageFilter.GaussianBlur(s2 * 0.08)); img.paste(Image.new('RGB', img.size, (0, 0, 0)), (0, 0), sh.point(lambda v: int(v * 0.8)))
    d.text((x, yk), kicker, font=fk, fill=(214, 196, 178))
    d.text((x, y1), l1, font=f1, fill=CREAM)
    m = Image.new('L', img.size, 0); ImageDraw.Draw(m).text((x, y2), l2, font=f2, fill=255)
    a = np.array(m); ys_ = np.nonzero(a.max(1))[0]; t0, t1 = ys_.min(), ys_.max()
    u = np.clip((np.arange(img.size[1]) - t0) / max(1, t1 - t0), 0, 1)[:, None]
    col = (ROSE_T + (ROSE_B - ROSE_T) * u).astype(np.uint8)
    g = np.repeat(col[:, None, :], img.size[0], axis=1).reshape(img.size[1], img.size[0], 3)
    img.paste(Image.fromarray(g), (0, 0), m)
    d.text((x, ys), sub, font=fs, fill=(226, 214, 200))
FADE = [420, 260]
def picture(name, cx, W, H, img_h, top):
    src = Image.open(f'{P}/{name}').convert('RGB'); sc = img_h / src.height; src = src.resize((int(src.width * sc), img_h), Image.LANCZOS)
    x0 = int(min(max(0, cx * src.width - W / 2), src.width - W)); crop = src.crop((x0, 0, x0 + W, img_h))
    canvas = Image.new('RGB', (W, H), (10, 12, 15)); canvas.paste(crop, (0, top))
    arr = np.array(canvas).astype(np.float32); yy = np.arange(H)[:, None]
    # fade the picture's top edge into the dark field, and a soft vignette
    u = np.clip((yy - top) / FADE[0], 0, 1); fade = u * u * (3 - 2 * u)            # long smoothstep, no hard band
    ub = np.clip((H - yy) / FADE[1], 0, 1); fade = fade * (0.35 + 0.65 * ub * ub * (3 - 2 * ub))
    base = np.array([10, 12, 15], np.float32)
    arr = base + (arr - base) * fade[..., None] if True else arr
    xx = np.arange(W)[None, :]; r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H * 0.6) / (H * 0.7)) ** 2)
    arr *= np.clip(1 - 0.45 * np.clip(r - 0.6, 0, 1), 0, 1)[..., None]
    return Image.fromarray(arr.clip(0, 255).astype(np.uint8))
WCX = {'A': 0.52, 'B': 0.50, 'C': 0.45}
PORT = {'B': (720, 0.50)}
for n, f, cx, k, l1, l2, sub in V:
    ph, pcx = PORT.get(n, (1330, cx)); t = picture(f, pcx, 1080, 1440, ph, 1440 - ph if ph < 1140 else 300); text_block(t, 78, 96, k, l1, l2, sub, 92, 118); t.save(f'{D}/../out/封面_竖版_3x4_{n}.png')
    wh, wt = {'B': (900, 330)}.get(n, (1160, 170)); w = picture(f, WCX.get(n, cx), 1440, 1080, wh, wt)
    # darken the top-left for the text on the wide version
    a = np.array(w).astype(np.float32); yy, xx = np.mgrid[0:1080, 0:1440]; m = np.clip(1 - 0.62 * np.exp(-(((xx - 200) / 900) ** 2 + ((yy - 160) / 420) ** 2)), 0, 1)
    w = Image.fromarray((a * m[..., None]).clip(0, 255).astype(np.uint8)); text_block(w, 80, 60, k, l1, l2, sub, 84, 104); w.save(f'{D}/../out/封面_横版_4x3_{n}.png')
ims = [Image.open(f'{D}/../out/封面_竖版_3x4_{n}.png').resize((360, 480)) for n, *_ in V] + [Image.open(f'{D}/../out/封面_横版_4x3_{n}.png').resize((480, 360)) for n, *_ in V]
s = Image.new('RGB', (1440, 480 + 360 + 20), (30, 30, 32))
for i in range(3): s.paste(ims[i], (i * 480 + 60, 0))
for i in range(3): s.paste(ims[3 + i], (i * 480, 500))
s.save(f'{D}/../out/covers_sheet.jpg', quality=88)
print('ok')
