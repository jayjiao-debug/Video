"""ep31 covers v2 (owner: put the two of them on the thumbnail).
Wide 4:3: the podcast frame with both hosts and the 「薄肌圣经」 card (clip 84), fading into the film's navy; gold hook.
Tall 3:4: the two hosts stacked (邵艾伦 top, 孙宇晨 below), cropped from the picture band; gold hook above the
lower 18% (Douyin's UI zone). Usage: python3 cover_people.py <clips dir> <out dir>"""
import sys, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
CL, OUT = sys.argv[1], sys.argv[2]
SER = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Black.ttc'; SANS = '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
NAVY = (8, 17, 39)
def frame(k, t=0.4):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(t), '-i', f'{CL}/{k}.mp4', '-frames:v', '1', '/tmp/cv_src.png'], check=True)
    im = Image.open('/tmp/cv_src.png').convert('RGB'); w, h = im.size
    return im.crop((0, int(h * 0.125), w, int(h * 0.75)))                      # the picture band only (no burned-in subtitles)
def grade(im):
    a = np.asarray(im).astype(float) / 255; a = a ** 1.08 * 0.92                   # a touch darker / richer
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype('uint8'))
def fade_to_navy(im, start, end):
    w, h = im.size; a = np.asarray(im).astype(float)
    k = np.clip((np.arange(h) - start) / max(1, end - start), 0, 1)[:, None, None] ** 1.3
    return Image.fromarray((a * (1 - k) + np.array(NAVY) * k).astype('uint8'))
def gold_text(canvas, xy, text, size, anchor='mm'):
    f = ImageFont.truetype(SER, size); m = Image.new('L', canvas.size, 0); ImageDraw.Draw(m).text(xy, text, font=f, fill=255, anchor=anchor)
    bbox = m.getbbox(); y0, y1 = bbox[1], bbox[3]
    grad = np.zeros((canvas.size[1], canvas.size[0], 3)); t = np.clip((np.arange(canvas.size[1]) - y0) / max(1, y1 - y0), 0, 1)[:, None]
    top, mid, bot = np.array([255, 227, 155]), np.array([245, 199, 107]), np.array([201, 145, 58])
    col = np.where(t < 0.45, top + (mid - top) * (t / 0.45), mid + (bot - mid) * ((t - 0.45) / 0.55)); grad[:] = col[:, None, :]
    sh = m.filter(ImageFilter.GaussianBlur(14)); canvas.paste(Image.new('RGB', canvas.size, (0, 0, 0)), (0, 0), sh.point(lambda v: v * 0.7))
    canvas.paste(Image.fromarray(grad.astype('uint8')), (0, 0), m); return bbox
def text(canvas, xy, s, size, fill, font=SANS, anchor='mm', spacing=0):
    d = ImageDraw.Draw(canvas); f = ImageFont.truetype(font, size)
    if spacing: s = (' ' * spacing).join(s)
    d.text(xy, s, font=f, fill=fill, anchor=anchor)

# ---- wide 1440×1080
W, H = 1440, 1080
band = grade(frame('84_04-17-18')); bw, bh = band.size
sc = 1540 / bw; band = band.resize((int(bw * sc), int(bh * sc)), Image.LANCZOS)
x0 = (band.size[0] - W) // 2; band = band.crop((x0, 0, x0 + W, band.size[1]))      # centre crop, nudged so both faces stay in
cv = Image.new('RGB', (W, H), NAVY); cv.paste(band, (0, 0)); cv = fade_to_navy(cv, int(band.size[1] * 0.80), int(band.size[1] * 1.0))
text(cv, (W // 2, 720), 'VIBE知识大赏', 30, (200, 215, 240), spacing=1)
bb = gold_text(cv, (W // 2 + 15, 850), '论文打几分？', 140)
text(cv, (W // 2, 975), '《薄肌说明书》', 38, (110, 231, 239), font=SER)
cv.save(f'{OUT}/cover_wide.png')
# ---- tall 1080×1440: 邵艾伦 (left panel, frame 01) on top, 孙宇晨 (right panel, frame 55) below
W, H = 1080, 1440
def panel(k, side):
    b = grade(frame(k)); w, h = b.size; half = b.crop((0, 0, w // 2, h)) if side == 'L' else b.crop((w // 2, 0, w, h))
    pw, ph = half.size; tgt = 1080 / 540                                         # each slot is 1080×540
    cw = pw; chh = int(cw / tgt); cy = int(ph * 0.08)                            # keep the head and shoulders
    half = half.crop((0, cy, cw, cy + chh)); return half.resize((1080, 540), Image.LANCZOS)
cv = Image.new('RGB', (W, H), NAVY)
cv.paste(panel('01_00-00-48', 'L'), (0, 0)); cv.paste(panel('55_02-34-12', 'R'), (0, 546))
d = ImageDraw.Draw(cv); d.rectangle([0, 540, W, 546], fill=NAVY)
cv = fade_to_navy(cv, 930, 1060)
text(cv, (W // 2, 46), 'VIBE知识大赏', 28, (225, 235, 250), spacing=1)
gold_text(cv, (W // 2 + 14, 1072), '论文打几分？', 118)
text(cv, (W // 2, 1158), '《薄肌说明书》', 34, (110, 231, 239), font=SER)
cv.save(f'{OUT}/cover_tall.png')
print('ok')
