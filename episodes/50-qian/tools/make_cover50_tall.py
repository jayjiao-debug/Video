"""ep50 designed tall cover (1080×1440) and wide (1440×1080): title + the film's hook characters + the journey 贝 → 布币 → 交子 → 手机,
assembled from picture-only film frames (pic/), feathered onto a dark lacquer ground. Bottom ~16 % kept free of key content."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np, os
D = os.path.dirname(os.path.abspath(__file__)); P = f'{D}/pic'; OUT = f'{D}/../out'
SERIF = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Black.ttc'; SERIF_R = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Medium.ttc'
CREAM = (246, 238, 226); GT, GB = np.array([255, 232, 170]), np.array([214, 160, 64])
def ground(W, H):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    base = np.array([16, 9, 7], np.float32); warm = np.array([92, 52, 30], np.float32)
    g = np.exp(-(((xx - W * 0.5) / (W * 0.55)) ** 2 + ((yy - H * 0.55) / (H * 0.42)) ** 2))
    streak = 6 * np.sin(yy / 7.0 + 0.3 * np.sin(xx / 90.0))
    a = base + (warm - base) * g[..., None] * 0.55 + streak[..., None] * 0.6
    return Image.fromarray(a.clip(0, 255).astype(np.uint8))
def feather(im, r=0.12):
    w, h = im.size; m = Image.new('L', (w, h), 0); d = ImageDraw.Draw(m)
    d.rounded_rectangle([int(w * r * 0.5), int(h * r * 0.5), int(w * (1 - r * 0.5)), int(h * (1 - r * 0.5))], radius=int(min(w, h) * 0.2), fill=255)
    return m.filter(ImageFilter.GaussianBlur(min(w, h) * r * 0.5))
def paste(dst, src, box, scale, xy):
    c = src.crop(box); c = c.resize((int(c.width * scale), int(c.height * scale)), Image.LANCZOS); dst.paste(c, xy, feather(c)); return c.size
def grad_text(img, xy, text, font, anchor='la'):
    m = Image.new('L', img.size, 0); ImageDraw.Draw(m).text(xy, text, font=font, fill=255, anchor=anchor)
    a = np.array(m); ys = np.nonzero(a.max(1))[0]; t0, t1 = ys.min(), ys.max()
    u = np.clip((np.arange(img.size[1]) - t0) / max(1, t1 - t0), 0, 1)[:, None]
    col = (GT + (GB - GT) * u).astype(np.uint8); g = np.repeat(col[:, None, :], img.size[0], axis=1)
    img.paste(Image.fromarray(g), (0, 0), m)
def shadow_text(img, items):
    sh = Image.new('L', img.size, 0); ds = ImageDraw.Draw(sh)
    for xy, t, f, an in items: ds.text(xy, t, font=f, fill=255, anchor=an)
    img.paste(Image.new('RGB', img.size, (0, 0, 0)), (0, 0), sh.filter(ImageFilter.GaussianBlur(10)).point(lambda v: int(v * 0.8)))
def arrow(d, x, y, s=26, col=(214, 170, 96)):
    d.line([(x - s, y), (x + s, y)], fill=col, width=4); d.polygon([(x + s + 4, y), (x + s - 12, y - 10), (x + s - 12, y + 10)], fill=col)
hook = Image.open(f'{P}/f_2.6.png').convert('RGB'); walk = Image.open(f'{P}/f_113.0.png').convert('RGB')
CHARS = (40, 300, 1780, 930)                       # 财货贵钱 + cowries + phone
PIECES = [('hook', (215, 760, 385, 900), '贝壳'), ('walk', (240, 580, 384, 790), '布币'), ('walk', (990, 550, 1130, 790), '交子'), ('walk', (1650, 510, 1830, 800), '手机')]
def journey(img, x0, y0, width, h, d, fs):
    n = len(PIECES); slot = width / n
    for i, (srcn, box, lab) in enumerate(PIECES):
        bw, bh = box[2] - box[0], box[3] - box[1]; sc = h / bh
        cx = x0 + slot * (i + 0.5); w = int(bw * sc)
        paste(img, hook if srcn == 'hook' else walk, box, sc * (0.8 if srcn == 'hook' else 1), (int(cx - w * (0.8 if srcn == 'hook' else 1) / 2), y0 + (int(h * 0.25) if srcn == 'hook' else 0)))
        d.text((cx, y0 + h + 14), lab, font=fs, fill=(226, 214, 200), anchor='ma')
        if i < n - 1: arrow(d, int(x0 + slot * (i + 1)), y0 + h // 2)
def tall():
    W, H = 1080, 1440; img = ground(W, H); d = ImageDraw.Draw(img)
    fk = ImageFont.truetype(SERIF_R, 30, index=0); f1 = ImageFont.truetype(SERIF, 112, index=0); f2 = ImageFont.truetype(SERIF, 128, index=0)
    fl = ImageFont.truetype(SERIF_R, 34, index=0)
    shadow_text(img, [((W // 2, 150), '钱是怎么从贝壳', f1, 'ma'), ((W // 2, 290), '变成二维码的？', f2, 'ma')])
    d.text((W // 2, 92), '从古至今 · 钱', font=fk, fill=(214, 196, 178), anchor='ma')
    d.text((W // 2, 150), '钱是怎么从贝壳', font=f1, fill=CREAM, anchor='ma')
    grad_text(img, (W // 2 + 32, 290), '变成二维码的？', f2, 'ma')       # ？ carries ~½em of space on its right: shift right to centre the ink
    paste(img, hook, CHARS, 1080 / (CHARS[2] - CHARS[0]), (0, 440))
    journey(img, 30, 880, 1020, 250, d, fl)
    d.line([(140, 1210), (W - 140, 1210)], fill=(120, 84, 46), width=2)
    img.save(f'{OUT}/封面_竖版_3x4_设计版.png'); return img
def wide():
    W, H = 1440, 1080; img = ground(W, H); d = ImageDraw.Draw(img)
    fk = ImageFont.truetype(SERIF_R, 28, index=0); f1 = ImageFont.truetype(SERIF, 104, index=0); f2 = ImageFont.truetype(SERIF, 118, index=0)
    fl = ImageFont.truetype(SERIF_R, 30, index=0)
    shadow_text(img, [((W // 2, 110), '钱是怎么从贝壳', f1, 'ma'), ((W // 2, 236), '变成二维码的？', f2, 'ma')])
    d.text((W // 2, 60), '从古至今 · 钱', font=fk, fill=(214, 196, 178), anchor='ma')
    d.text((W // 2, 110), '钱是怎么从贝壳', font=f1, fill=CREAM, anchor='ma')
    grad_text(img, (W // 2 + 30, 236), '变成二维码的？', f2, 'ma')
    paste(img, hook, CHARS, 1240 / (CHARS[2] - CHARS[0]), (100, 380))
    journey(img, 170, 820, 1100, 170, d, fl)
    img.save(f'{OUT}/封面_横版_4x3_设计版.png'); return img
t, w = tall(), wide()
s = Image.new('RGB', (540 + 720 + 20, 720), (30, 30, 32)); s.paste(t.resize((540, 720)), (0, 0)); s.paste(w.resize((720, 540)), (560, 90))
s.save('/tmp/claude-0/-home-claude/bf206d1e-1152-5595-9b84-b15be6e5a777/scratchpad/cov_design.jpg', quality=90)
q = Image.new('RGB', (270 + 360 + 20, 360), (30, 30, 32)); q.paste(t.resize((270, 360)), (0, 0)); q.paste(w.resize((360, 270)), (290, 45))
q.save('/tmp/claude-0/-home-claude/bf206d1e-1152-5595-9b84-b15be6e5a777/scratchpad/cov_design_25.jpg'); print('ok')
