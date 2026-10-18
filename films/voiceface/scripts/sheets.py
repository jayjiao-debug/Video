import re, glob, textwrap
from PIL import Image, ImageDraw, ImageFont
fs = sorted(glob.glob('out/fr/t*.png')); ims = [Image.open(f).convert('RGB') for f in fs]
w, h = ims[0].size
s = Image.new('RGB', (w * 2, h * 3))
for i in range(6): s.paste(ims[i], ((i % 2) * w, (i // 2) * h))
s.save('out/looks_sheet.jpg', quality=88)
src = open('src/Board.tsx').read()
board = re.findall(r"\{ t: '([^']*)', d: '([^']*)'", src)
B, R = 'NotoSansCJK-Bold.ttc', 'NotoSansCJK-Regular.ttc'
fb = ImageFont.truetype('/usr/share/fonts/opentype/noto/' + B, 26, index=2); fr = ImageFont.truetype('/usr/share/fonts/opentype/noto/' + R, 21, index=2)
tw, th, cap, cols = 600, 338, 150, 3
panels = ims[6:]
def page(items, name):
    rows = (len(items) + cols - 1) // cols
    P = Image.new('RGB', (cols * (tw + 30) + 30, rows * (th + cap + 30) + 30), (14, 12, 12)); d = ImageDraw.Draw(P)
    for k, (im, (t, desc)) in enumerate(items):
        x, y = 30 + (k % cols) * (tw + 30), 30 + (k // cols) * (th + cap + 30)
        P.paste(im.resize((tw, th)), (x, y)); d.text((x, y + th + 10), t, font=fb, fill=(241, 197, 109))
        for j, ln in enumerate(textwrap.wrap(desc, 27)[:4]): d.text((x, y + th + 48 + j * 26), ln, font=fr, fill=(225, 218, 205))
    P.save(name, quality=86); print(name, P.size)
items = list(zip(panels, board)); page(items[:9], 'out/storyboard_1.jpg'); page(items[9:], 'out/storyboard_2.jpg')
