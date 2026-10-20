"""ep31 《薄肌说明书》 style frames — the "说明书" look (a premium product manual / blueprint on dark navy).
Draws 8 key frames at 1920×1080 and a 4×2 sheet. Run from episodes/31-baoji with INTRO=<intro_v4.mp4 path>."""
import os, subprocess, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W, H = 1920, 1080
BG, BG2, GRID = (11, 22, 48), (14, 29, 61), (28, 46, 86)
CY, GOLD, RED, INK, DIM, PALE = (92, 225, 230), (255, 209, 102), (255, 122, 122), (234, 244, 255), (138, 160, 196), (190, 205, 230)
FS = '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'; FB = '/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc'
FL = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'; SER = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Black.ttc'
f = lambda p, s: ImageFont.truetype(p, s)
OUT = 'style/frames'; os.makedirs(OUT, exist_ok=True)

def page(step=None, title=None):
    im = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(im)
    for x in range(0, W, 48): d.line([x, 0, x, H], fill=GRID, width=1)
    for y in range(0, H, 48): d.line([0, y, W, y], fill=GRID, width=1)
    vig = Image.new('L', (W, H), 0); ImageDraw.Draw(vig).ellipse([-300, -250, W + 300, H + 250], fill=255)
    im = Image.composite(im, Image.new('RGB', (W, H), (6, 12, 28)), vig.filter(ImageFilter.GaussianBlur(160))); d = ImageDraw.Draw(im)
    d.text((W - 40, 34), 'Juno · VIBE知识大赏', font=f(FL, 22), fill=DIM, anchor='ra')
    if step:
        d.rounded_rectangle([70, 60, 70 + 132, 60 + 132], 18, outline=CY, width=4)
        d.text((136, 126), step[0], font=f(FB, 84), fill=CY, anchor='mm')
        d.text((230, 126), step[1], font=f(FB, 64), fill=INK, anchor='lm')
        d.line([70, 222, W - 70, 222], fill=(40, 70, 120), width=2)
    return im, d
def sub(d, txt, y=978): d.text((W // 2, y), txt, font=f(FS, 54), fill=INK, anchor='mm', stroke_width=3, stroke_fill=(5, 10, 25))
def figure(d, cx, cy, s=1.0, muscle=1.0, fat=1.0, abs_=False, age=False):
    """the manual figure: an IKEA-like faceless mannequin. cyan = muscle layer, pale outline = fat layer."""
    sh = lambda v: v * s
    if fat > 0.05:
        pad = sh(26 * fat)
        d.rounded_rectangle([cx - sh(95) - pad, cy - sh(170) - pad * .5, cx + sh(95) + pad, cy + sh(120) + pad], sh(70), outline=PALE, width=max(2, int(sh(3))))
    m = muscle
    d.ellipse([cx - sh(48), cy - sh(300), cx + sh(48), cy - sh(204)], fill=CY if not age else (200, 230, 235))
    d.rounded_rectangle([cx - sh(80 + 12 * m), cy - sh(180), cx + sh(80 + 12 * m), cy + sh(110)], sh(48), fill=CY)
    for side in (-1, 1):
        d.rounded_rectangle([cx + side * sh(100 + 12 * m) - sh(26 + 6 * m), cy - sh(170), cx + side * sh(100 + 12 * m) + sh(26 + 6 * m), cy + sh(60)], sh(26), fill=CY)
        d.rounded_rectangle([cx + side * sh(42) - sh(32 + 4 * m), cy + sh(120), cx + side * sh(42) + sh(32 + 4 * m), cy + sh(390)], sh(30), fill=CY)
    if abs_:
        for r in range(3):
            for c in (-1, 1): d.rounded_rectangle([cx + c * sh(30) - sh(22), cy - sh(40) + r * sh(46), cx + c * sh(30) + sh(22), cy - sh(4) + r * sh(46)], sh(10), outline=BG, width=max(2, int(sh(4))))
    if age: d.arc([cx - sh(52), cy - sh(306), cx + sh(52), cy - sh(214)], 200, 340, fill=INK, width=max(2, int(sh(6))))
def stamp(im, txt, xy, col=RED, rot=-8, size=78):
    lay = Image.new('RGBA', (600, 220), (0, 0, 0, 0)); dl = ImageDraw.Draw(lay)
    dl.rounded_rectangle([10, 10, 590, 210], 22, outline=col + (255,), width=10); dl.text((300, 110), txt, font=f(FB, size), fill=col + (255,), anchor='mm')
    lay = lay.rotate(rot, expand=True, resample=Image.BICUBIC); im.paste(lay, (xy[0] - lay.width // 2, xy[1] - lay.height // 2), lay)

frames = []
# 1 · intro: original footage, big 「薄肌」 pop on each cut, counter
intro = os.environ.get('INTRO')
if intro:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '6.0', '-i', intro, '-frames:v', '1', '/tmp/f31a.png'], check=True)
    im = Image.open('/tmp/f31a.png').convert('RGB').resize((W, H)); d = ImageDraw.Draw(im)
    d.text((W // 2, H // 2 + 20), '薄肌', font=f(FB, 300), fill=(255, 255, 255), anchor='mm', stroke_width=14, stroke_fill=(10, 20, 45))
    d.text((W - 70, 70), '×17', font=f(FB, 72), fill=GOLD, anchor='ra', stroke_width=5, stroke_fill=(10, 20, 45))
    frames.append(('01_intro', im))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '13.5', '-i', intro, '-frames:v', '1', '/tmp/f31b.png'], check=True)
    im = Image.open('/tmp/f31b.png').convert('L').resize((W, H)).convert('RGB')
    tint = Image.new('RGB', (W, H), (20, 40, 90)); im = Image.blend(im, tint, 0.45); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 120], fill=(0, 0, 0)); d.rectangle([0, H - 120, W, H], fill=(0, 0, 0))
    d.text((W // 2, H // 2), '「薄肌圣经」', font=f(SER, 150), fill=GOLD, anchor='mm', stroke_width=6, stroke_fill=(10, 15, 30))
    frames.append(('02_slowed', im))
# 3 · title on the drum hit: the manual cover
im, d = page()
d.rounded_rectangle([560, 150, 1360, 930], 26, fill=BG2, outline=CY, width=5)
d.text((960, 300), 'MANUAL · 使用说明', font=f(FL, 34), fill=DIM, anchor='mm')
d.text((960, 470), '薄肌', font=f(FB, 230), fill=INK, anchor='mm'); d.text((960, 650), '说明书', font=f(FB, 120), fill=CY, anchor='mm')
d.line([700, 750, 1220, 750], fill=(40, 70, 120), width=2)
d.text((960, 800), '型号：薄肌  ·  适用：普通人  ·  无需用药', font=f(FL, 32), fill=PALE, anchor='mm')
figure(d, 1600, 640, 0.6); frames.append(('03_title', im))
# 4 · 先翻译: the 薄肌 grid + ceiling
im, d = page()
ox, oy, gw, gh = 380, 860, 1160, 600
d.line([ox, oy, ox + gw, oy], fill=PALE, width=4); d.line([ox, oy, ox, oy - gh], fill=PALE, width=4)
d.text((ox + gw, oy + 40), '体脂率 →', font=f(FS, 40), fill=PALE, anchor='rm'); d.text((ox - 30, oy - gh), '肌肉量', font=f(FS, 40), fill=PALE, anchor='rm')
d.line([ox, oy - gh + 70, ox + gw, oy - gh + 70], fill=RED, width=4)
for x in range(ox, ox + gw, 40): d.line([x, oy - gh + 70, x + 20, oy - gh + 70], fill=BG, width=6)
d.text((ox + gw - 10, oy - gh + 30), '天花板 FFMI 25 · 再往上：药', font=f(FS, 34), fill=RED, anchor='rm')
z = [ox + 60, oy - 400, ox + 420, oy - 170]
glow = Image.new('RGB', (W, H), (0, 0, 0)); ImageDraw.Draw(glow).rounded_rectangle(z, 30, fill=(40, 140, 150)); im = Image.blend(im, Image.composite(glow, im, glow.convert('L').point(lambda v: 255 if v else 0)), 0.35); d = ImageDraw.Draw(im)
d.rounded_rectangle(z, 30, outline=CY, width=5); d.text(((z[0] + z[2]) // 2, (z[1] + z[3]) // 2), '薄肌', font=f(FB, 90), fill=CY, anchor='mm')
d.ellipse([ox + 230 - 20, oy - 300 - 20, ox + 230 + 20, oy - 300 + 20], fill=GOLD)
sub(d, '好消息：不用药，普通人也练得到'); frames.append(('04_grid', im))
# 5 · 步骤一 · 练: two sessions a week + the synthesis curve
im, d = page(('01', '练'))
days = '一二三四五六日'
for i, ch in enumerate(days):
    x = 200 + i * 230; d.rounded_rectangle([x, 290, x + 190, 380], 14, outline=(40, 70, 120), width=3); d.text((x + 95, 335), '周' + ch, font=f(FS, 38), fill=PALE, anchor='mm')
    if i in (0, 3):
        for b in range(5): d.rounded_rectangle([x + 30, 400 + b * 44, x + 160, 436 + b * 44], 8, fill=CY)
        d.text((x + 95, 640), '5 组', font=f(FB, 44), fill=CY, anchor='mm')
pts = []
for t in range(0, 7 * 230 * 10, 10):
    x = 200 + t / 10; day = (x - 200) / 230
    v = 0
    for s0 in (0.5, 3.5):
        dt = (day - s0) * 24
        if dt > 0: v += math.exp(-((dt - 22) / 12) ** 2) if dt < 60 else 0
    pts.append((x, 880 - 170 * v))
d.line(pts, fill=GOLD, width=6); d.text((1700, 720), '肌肉合成', font=f(FS, 36), fill=GOLD, anchor='mm')
d.text((520, 700), '~36 小时回落', font=f(FS, 30), fill=DIM, anchor='mm')
sub(d, '而且最好分两天练，别一次练完'); frames.append(('05_step1', im))
# 6 · 步骤二 · 吃: 110 g → four plates of 28 g
im, d = page(('02', '吃'))
d.text((960, 360), '70 公斤 × 1.6 克 ≈ 110 克 / 天', font=f(FB, 70), fill=INK, anchor='mm')
for i in range(4):
    x = 360 + i * 400; d.ellipse([x - 140, 480, x + 140, 760], outline=PALE, width=6); d.ellipse([x - 95, 525, x + 95, 715], fill=BG2, outline=(40, 70, 120), width=3)
    d.text((x, 620), '28克', font=f(FB, 62), fill=CY, anchor='mm'); d.text((x, 810), f'第{"一二三四"[i]}顿', font=f(FS, 36), fill=DIM, anchor='mm')
sub(d, '最好分成4顿，每顿约28克'); frames.append(('06_step2', im))
# 7 · 步骤三 · 睡: same diet, two sleep lengths, two outcomes
im, d = page(('03', '睡'))
for j, (lab, fat, lean, col) in enumerate([('每晚 8.5 小时', 1.4, 1.5, CY), ('每晚 5.5 小时', 0.6, 2.4, RED)]):
    x0 = 330 + j * 760; d.text((x0 + 260, 300), lab, font=f(FB, 56), fill=col, anchor='mm')
    for k, (nm, v, c) in enumerate([('减掉的脂肪', fat, GOLD), ('掉的瘦肉', lean, PALE)]):
        x = x0 + 80 + k * 250; hgt = v * 150
        d.rounded_rectangle([x, 820 - hgt, x + 170, 820], 12, fill=c); d.text((x + 85, 800 - hgt - 30), f'{v} kg', font=f(FB, 44), fill=c, anchor='mm')
        d.text((x + 85, 860), nm, font=f(FS, 32), fill=DIM, anchor='mm')
sub(d, '脂肪少减一半，瘦肉多掉六成'); frames.append(('07_step3', im))
# 8 · 步骤五 + ending: the 90-year-olds, and the figure still standing
im, d = page(('05', '什么时候开始？'))
for i in range(10): figure(d, 210 + i * 92, 640, 0.22, muscle=0.6, fat=0, age=True)
d.text((560, 820), '10 位约 90 岁的老人 · 练 8 周', font=f(FS, 40), fill=PALE, anchor='mm')
d.rounded_rectangle([1250, 820 - 190, 1450, 820], 16, fill=(60, 80, 120)); d.rounded_rectangle([1530, 820 - 520, 1730, 820], 16, fill=GOLD)
d.text((1630, 260), '+174%', font=f(FB, 80), fill=GOLD, anchor='mm'); d.text((1350, 860), '练之前', font=f(FS, 36), fill=DIM, anchor='mm'); d.text((1630, 860), '8 周后', font=f(FS, 36), fill=PALE, anchor='mm')
stamp(im, '90岁都来得及', (560, 420), col=CY, rot=-6, size=64)
sub(d, '其实，90岁都来得及'); frames.append(('08_step5', im))
for n, im in frames: im.save(f'{OUT}/{n}.png')
sheet = Image.new('RGB', (W, H)); tw, th = W // 4, H // 2
for i, (n, im) in enumerate(frames[:8]):
    sheet.paste(im.resize((tw, th), Image.LANCZOS), ((i % 4) * tw, (i // 4) * th))
sheet.save('style/storyboard_sheet.jpg', quality=90); print(len(frames), 'frames')
