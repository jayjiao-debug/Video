#!/usr/bin/env python3
"""Contact sheet of the six v4 key frames (Look 1 铜灯影, storyboard gate 2b) → ../sheet.png, plus 400-px checks → ../check400/"""
from PIL import Image, ImageDraw, ImageFont
import numpy as np, os
D = '/home/claude/video/episodes/45-mashou/style/v4/'
F = '/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc'; FR = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
frames = [('c1_hook', 'C1 hook · 0:01.6', 'your head fills the frame on Ho\'s desk, 2007; the lamp has just clicked on'),
          ('a4_noon', 'A4 noon · 0:41', 'memory: the water clock, 12 arcs at once; you third on the left row'),
          ('b3_1860', 'B3 1860 · 0:53', 'same stage on fire; your seat empty, the looter carries you out right'),
          ('d6a_2007', 'D6a 2007 · 1:12', 'the room before the sale: empty chairs, the gavel at rest'),
          ('e2a_lamp', 'E2a the stop · 1:48', 'Ho\'s room empty; the lamp has just gone out'),
          ('h1b_return', 'H1b the drop · 1:59', 'the 文殊亭 doors open; your light spills across the court')]
os.makedirs(D + 'check400', exist_ok=True)
W, TW, TH, M, CAP = 2000, 960, 540, 26, 86
sheet = Image.new('RGB', (W, 110 + 3 * (TH + CAP + M) + 10), '#14100d'); d = ImageDraw.Draw(sheet)
d.text((M, 26), '《马首回家，用了160年》 · storyboard gate 2b · Look 1 铜灯影 · six key frames', font=ImageFont.truetype(F, 44), fill='#F3E6CF')
for i, (n, t, sub) in enumerate(frames):
    x, y = M + (i % 2) * (TW + M - 4), 110 + (i // 2) * (TH + CAP + M)
    im = Image.open(f'{D}{n}.png').convert('RGB'); lum = np.asarray(im.convert('L'), float).mean()
    im.resize((400, 225), Image.LANCZOS).save(f'{D}check400/{n}_400.png')
    sheet.paste(im.resize((TW, TH), Image.LANCZOS), (x, y))
    d.text((x + 4, y + TH + 6), f'{t}  ·  luma {lum:.0f}', font=ImageFont.truetype(F, 32), fill='#FFB070')
    d.text((x + 4, y + TH + 46), sub, font=ImageFont.truetype(FR, 26), fill='#CDBFA8')
    print(n, round(lum, 1))
sheet.save(D + 'sheet.png'); print(D + 'sheet.png', sheet.size)
# a 400-px-wide strip of all six, as on a phone
strip = Image.new('RGB', (400 * 3 + 20, 225 * 2 + 10), '#000')
for i, (n, *_ ) in enumerate(frames): strip.paste(Image.open(f'{D}check400/{n}_400.png'), ((i % 3) * 410, (i // 3) * 235))
strip.save(D + 'check400/strip400.png')
