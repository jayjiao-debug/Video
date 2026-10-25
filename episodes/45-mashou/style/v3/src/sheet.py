#!/usr/bin/env python3
"""Contact sheet of the four v3 stills (hybrid L1 铜灯影 + L3 铜壁) → ../sheet.png"""
from PIL import Image, ImageDraw, ImageFont
import numpy as np
D = '/home/claude/video/episodes/45-mashou/style/v3/'
F = '/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc'; FR = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
frames = [('hook_L1', 'L1 铜灯影 · C1 hook', '正觉寺·文殊亭 at dusk; nose inside the glass; visitor at the case depth'),
          ('key_L1_1860', 'L1 铜灯影 · B3 key', '1860: carried off in both hands; your seat empty between 龙 and 猴'),
          ('handover', 'L1 → L3 hand-over', 'the stage sets into bronze behind you; the dolly along the wall begins'),
          ('key_L3_2007', 'L3 铜壁 · D6a key', '2007, before the sale: empty chairs, gavel at rest, 撤拍; you ≈ ¼ of a person')]
W, TW, TH, M, CAP = 2000, 960, 540, 26, 86
sheet = Image.new('RGB', (W, 110 + 2 * (TH + CAP + M) + 10), '#14100d'); d = ImageDraw.Draw(sheet)
d.text((M, 26), '《马首回家，用了160年》 · gate 2a v3 · hybrid: L1 铜灯影 (lived) + L3 铜壁 (recorded)', font=ImageFont.truetype(F, 44), fill='#F3E6CF')
for i, (n, t, sub) in enumerate(frames):
    x, y = M + (i % 2) * (TW + M - 4), 110 + (i // 2) * (TH + CAP + M)
    im = Image.open(f'{D}{n}.png').convert('RGB'); lum = np.asarray(im.convert('L'), float).mean()
    sheet.paste(im.resize((TW, TH), Image.LANCZOS), (x, y))
    d.text((x + 4, y + TH + 6), f'{t}  ·  luma {lum:.0f}', font=ImageFont.truetype(F, 32), fill='#FFB070')
    d.text((x + 4, y + TH + 46), sub, font=ImageFont.truetype(FR, 26), fill='#CDBFA8')
sheet.save(D + 'sheet.png'); print(D + 'sheet.png', sheet.size)
