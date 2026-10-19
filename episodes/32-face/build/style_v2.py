"""ep32 look round 2 — owner: 「没有高级感了」 then 「不creepy的高级感」. Three premium, non-creepy directions for the
depth-map beat, drawn from the same face point cloud (build/face_pts.json: x, y, z, shade). Writes style/v2/*.png + options.jpg."""
import json, os, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
P = np.array(json.load(open('build/face_pts.json'))['pts'])
F = '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
FL = next(p for p in ['/usr/share/fonts/opentype/noto/NotoSansCJK-Light.ttc', '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', F] if os.path.exists(p))
W, H = 1920, 1080
def font(p, s): return ImageFont.truetype(p, s)
def hexc(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def lerp(a, b, t): return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))
def grad(c0, c1, cx=0.5, cy=0.45):
    yy, xx = np.mgrid[0:H, 0:W]; t = np.clip(np.sqrt(((xx / W - cx) * 1.4) ** 2 + (yy / H - cy) ** 2) / 0.9, 0, 1)[..., None]
    a = np.array(c0)[None, None]; b = np.array(c1)[None, None]
    return Image.fromarray((a + (b - a) * t).astype('uint8')).convert('RGBA')
def face(im, th, cx, cy, s, c0, c1, rmin, rmax):
    lay = Image.new('RGBA', im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    x, y, z, sh = P.T; c, sn = np.cos(th), np.sin(th)
    X = x * c + (z - 0.5) * 0.9 * sn; D = -x * sn + (z - 0.5) * 0.9 * c
    for i in np.argsort(D):
        k = 0.45 * sh[i] + 0.55 * z[i]; r = (rmin + (rmax - rmin) * k) * s / 300
        px, py = cx + X[i] * s, cy - y[i] * s
        d.ellipse([px - r, py - r, px + r, py + r], fill=lerp(c0, c1, k) + (int(255 * (0.35 + 0.65 * k)),))
    im.alpha_composite(lay)
def sub(d, txt, col): f = font(F, 50); d.text(((W - d.textlength(txt, font=f)) / 2, 960), txt, font=f, fill=col)

# A · 浅色产品页 — warm light grey, graphite dots, face turned 3/4 (no eye contact), soft floor shadow
im = grad(hexc('#f4f2ee'), hexc('#d9d5ce'))
sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sh).ellipse([700, 850, 1080, 910], fill=(0, 0, 0, 70)); im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(28)))
face(im, 0.62, 880, 500, 300, hexc('#c3ccd6'), hexc('#1d2a3a'), 1.4, 3.4)
d = ImageDraw.Draw(im)
d.text((1290, 300), '30,000+', font=font(F, 110), fill=hexc('#1d2a3a')); d.text((1296, 440), '个红外点，量出脸的形状', font=font(FL, 40), fill=hexc('#5a6573'))
d.line([1296, 515, 1560, 515], fill=hexc('#2f7bff'), width=3); sub(d, '拼出来，是一张深度图', hexc('#1d2a3a'))
im.convert('RGB').save('style/v2/A_light.png')

# B · 夜色侧影 — deep navy, the face turned to profile, lit warm like a sculpture (no frontal gaze)
im = grad(hexc('#14284f'), hexc('#060c1c'))
face(im, 1.05, 860, 500, 300, hexc('#1b3b6b'), hexc('#ffe7c2'), 1.3, 3.2)
d = ImageDraw.Draw(im)
d.text((1290, 300), '30,000+', font=font(F, 110), fill=hexc('#ffe7c2')); d.text((1296, 440), '个红外点，量出脸的形状', font=font(FL, 40), fill=hexc('#9fb2cc'))
sub(d, '拼出来，是一张深度图', hexc('#eef3fa'))
im.convert('RGB').save('style/v2/B_profile.png')

# C · 抽象地形 — no face at all: the depth map laid back like a landscape of light
im = grad(hexc('#0d1a33'), hexc('#050a16'))
lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dd = ImageDraw.Draw(lay)
x, y, z, _ = P.T
for i in np.argsort(-y):
    X = 960 + x[i] * 560; Y = 600 - y[i] * 170 - z[i] * 280; k = z[i]; r = 1.2 + 2.4 * k
    dd.ellipse([X - r, Y - r, X + r, Y + r], fill=lerp(hexc('#1c4f8a'), hexc('#9ff3ff'), k) + (int(255 * (0.3 + 0.7 * k)),))
im.alpha_composite(lay); d = ImageDraw.Draw(im)
d.text((140, 140), '30,000+', font=font(F, 110), fill=hexc('#9ff3ff')); d.text((146, 280), '个红外点，量出脸的形状', font=font(FL, 40), fill=hexc('#8aa2c4'))
sub(d, '拼出来，是一张深度图', hexc('#eef3fa'))
im.convert('RGB').save('style/v2/C_terrain.png')

sheet = Image.new('RGB', (1920, 1080)); dl = ImageDraw.Draw(sheet); f = font(F, 44)
cur = os.environ.get('CUR')
tiles = [('A_light', 'A · 浅色产品页', (190, 70, 20)), ('B_profile', 'B · 夜色侧影', (255, 209, 102)), ('C_terrain', 'C · 抽象地形', (255, 209, 102))]
for i, (n, lab, col) in enumerate(tiles):
    sheet.paste(Image.open(f'style/v2/{n}.png').convert('RGB').resize((960, 540)), ((i % 2) * 960, (i // 2) * 540))
    dl.text(((i % 2) * 960 + 20, (i // 2) * 540 + 10), lab, font=f, fill=col)
if cur:
    sheet.paste(Image.open(cur).convert('RGB').resize((960, 540)), (960, 540)); dl.text((1500, 1010), "刚才 · 正脸点阵", font=f, fill=(255, 209, 102))
sheet.save('style/v2/options.jpg', quality=90)
