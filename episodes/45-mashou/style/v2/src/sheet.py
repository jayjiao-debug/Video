#!/usr/bin/env python3
"""Contact sheet of the three looks (hook | key), captions below each frame → ../contact_sheet.png"""
from PIL import Image, ImageDraw, ImageFont
D = '/home/claude/video/episodes/45-mashou/style/v2/'
F = '/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc'; FR = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
looks = [('1', '铜灯影', 'silhouette theatre · you are the only light (ep43 approach, copper)'),
         ('2', '正午倒影', 'daylight · every reflection shows where you belong'),
         ('3', '铜壁', 'BOLD · history cast in a bronze relief wall; only you are in the round')]
caps = {'1': ['C1 · 正觉寺·文殊亭, dusk', 'B4 · 1860, the fire: you are carried off'],
        '2': ['C1 · the floor remembers noon', 'A7 · 12:00, all twelve spout'],
        '3': ['C1 · the wall of your story behind you', 'D7 · 2007, the gavel does not fall']}
W, TW, TH, M, LH, CAP = 2000, 960, 540, 26, 74, 44
sheet = Image.new('RGB', (W, 110 + 3 * (LH + TH + CAP + M) + 10), '#14100d'); d = ImageDraw.Draw(sheet)
d.text((M, 26), '《马首回家，用了160年》 · gate 2a v2 · three looks (hook C1 | key visual)', font=ImageFont.truetype(F, 44), fill='#F3E6CF')
y = 110
for n, name, sub in looks:
    d.text((M, y + 10), f'Look {n} · {name}', font=ImageFont.truetype(F, 42), fill='#FFB070')
    d.text((M + 470, y + 22), sub, font=ImageFont.truetype(FR, 28), fill='#CDBFA8')
    y += LH
    for i, k in enumerate(['hook', 'key']):
        x = M + i * (TW + M - 4)
        sheet.paste(Image.open(f'{D}look{n}_{k}.png').convert('RGB').resize((TW, TH), Image.LANCZOS), (x, y))
        d.text((x + 4, y + TH + 4), caps[n][i], font=ImageFont.truetype(FR, 26), fill='#CDBFA8')
    y += TH + CAP + M
sheet.save(D + 'contact_sheet.png'); print(D + 'contact_sheet.png', sheet.size)
