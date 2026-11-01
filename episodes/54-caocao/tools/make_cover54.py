"""ep54 曹操 Douyin covers (3:4 1080×1440 and 4:3 1440×1080) in the house layout: kicker, two-line serif hook (line 1 cream,
line 2 gold gradient), a small line under it, the film's own picture fading up into the dark.
The picture is the D1 hero frame at film 101.6 with no overlay, rendered at 1.5×:
  ENTRY=qq54/DVT54a CID=DVT54B SFPS=1 SCALE=1.5 node scripts/frame_ms.mjs stills <dir> 0
Usage: python3 make_cover54.py <hero.png> <out_dir>"""
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
SRC, OUT = sys.argv[1], sys.argv[2]
SERIF = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Black.ttc'
SERIF_R = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Medium.ttc'
CREAM = (246, 238, 226); GOLD_T, GOLD_B = np.array([255, 236, 184]), np.array([226, 160, 64])
KICK, L1, L2, SUB = '建安五年 · 官渡', '曹操的兵不满一万，', '袁绍十余万', '他亲率五千人，夜袭乌巢'
BASE = np.array([8, 6, 6], np.float32)

def text_block(img, x, y, s1, s2):
    d = ImageDraw.Draw(img)
    fk = ImageFont.truetype(SERIF_R, int(s2 * 0.30)); f1 = ImageFont.truetype(SERIF, s1); f2 = ImageFont.truetype(SERIF, s2); fs = ImageFont.truetype(SERIF_R, int(s2 * 0.36))
    yk = y; y1 = yk + int(s2 * 0.55); y2 = y1 + int(s1 * 1.25); ys = y2 + int(s2 * 1.38)
    sh = Image.new('L', img.size, 0); ds = ImageDraw.Draw(sh)
    for tx, f, yy in ((KICK, fk, yk), (L1, f1, y1), (L2, f2, y2), (SUB, fs, ys)): ds.text((x, yy), tx, font=f, fill=255)
    sh = sh.filter(ImageFilter.GaussianBlur(s2 * 0.10)); img.paste(Image.new('RGB', img.size, (0, 0, 0)), (0, 0), sh.point(lambda v: int(v * 0.85)))
    d.text((x, yk), KICK, font=fk, fill=(222, 200, 170))
    d.text((x, y1), L1, font=f1, fill=CREAM)
    m = Image.new('L', img.size, 0); ImageDraw.Draw(m).text((x, y2), L2, font=f2, fill=255)
    a = np.array(m); rows = np.nonzero(a.max(1))[0]; t0, t1 = rows.min(), rows.max()
    u = np.clip((np.arange(img.size[1]) - t0) / max(1, t1 - t0), 0, 1)[:, None]
    col = (GOLD_T + (GOLD_B - GOLD_T) * u).astype(np.uint8)
    img.paste(Image.fromarray(np.repeat(col[:, None, :], img.size[0], axis=1).reshape(img.size[1], img.size[0], 3)), (0, 0), m)
    d.text((x, ys), SUB, font=fs, fill=(232, 220, 204))
    return t1

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

# 3:4 — the picture in the lower part (his face, fist and the blade), the hook above; the lower ~18% is left to Douyin's UI
t = picture(1080, 1440, 1120, 360, 0.66); text_block(t, 76, 92, 84, 132); t.save(f'{OUT}/曹操_竖封面_3比4.png')
# 4:3 — the whole hero frame, the hook top-left over the darkened cape
w = picture(1440, 1080, 1180, 120, 0.58, fade_top=300, fade_bot=160)
a = np.array(w).astype(np.float32); yy, xx = np.mgrid[0:1080, 0:1440]
m = np.clip(1 - 0.66 * np.exp(-(((xx - 260) / 820) ** 2 + ((yy - 230) / 400) ** 2)), 0, 1)
w = Image.fromarray((a * m[..., None]).clip(0, 255).astype(np.uint8)); text_block(w, 80, 70, 80, 124); w.save(f'{OUT}/曹操_横封面_4比3.png')
print('ok')
