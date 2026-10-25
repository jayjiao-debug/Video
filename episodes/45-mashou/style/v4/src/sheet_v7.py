#!/usr/bin/env python3
"""ep45 v7 key-frame sheet (script v7, subtitles only): 15 frames with a caption each (id · v7 time · one line), 400-px checks
and a 400-px strip.  usage: sheet_v7.py SRC_DIR OUT_DIR   (SRC_DIR holds the v7_*.png frames)"""
import os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
SRC, OUT = sys.argv[1].rstrip('/') + '/', sys.argv[2].rstrip('/') + '/'
F = '/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc'; FR = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
frames = [
    ('v7_h1_hook', 'H1 · 0:00.0', 'frame 0: twelve heads on the RING at night, the copper horse lit; 回来了 ?/12'),
    ('v7_h3_answer', 'H3 · 0:07.4', 'six slide into 保利 ×4 / 国博 ×2, five dashed; only the horse stays: 回国 7 · 回园 1'),
    ('v7_t_title', 'title · 0:09.6', 'push on the horse; 「七个回国，一个回家」 over the picture (9.05–11.07), no card'),
    ('v7_n3_queue', 'N3 · 0:15.6', '2026 杭州: one queue in two depth rows; 牛 虎 猴 猪 in cases, museum light'),
    ('v7_a2_noon', 'A2 · 0:21.8', 'noon, bar 9: all twelve spout together (a4_noon, v7 stamp)'),
    ('v7_b2_taken', 'B2 · 0:28.7', '「它被带走了」: fire on bar 12, the looter carries it out right; 在家 11/12'),
    ('v7_d2_guess', 'D2 · 0:34.0', 'London 1989: paddles up, gavel raised, the board face-down 「?」; counter hidden'),
    ('v7_d3_hammer', 'D3 · 0:35.4', 'the strike on bar 15; the board flips to 「三四十万美元」'),
    ('v7_d5_2007', 'D5 · 0:42.2', '2007, the breakdown: the gavel at rest, empty chairs (d6a_2007, counter hidden)'),
    ('v7_p2_paris', 'P2 · 1:00.3', 'Paris 2009 on the build: rat + rabbit, phone bank, 「两件合计 3149万欧元」'),
    ('v7_p3_refuse', 'P3 · 1:06.4', 'Beijing 2009.3.2: the buyer\'s press table; 「未付款」 lands on the board'),
    ('v7_e2_stop', 'E2 · 1:16.2', 'the stop: Ho\'s lamp has just gone out (e2a_lamp, counter hidden)'),
    ('v7_r1_drop', 'R1 · 1:27.2', 'the drop: 「它回到了圆明园」, 文殊亭 doors open; counter back as 回园 1/12'),
    ('v7_r5_ear', 'R5 · 1:40.0', 'push on the ears: the near one rolled (ringed), the far one straight'),
    ('v7_q_end', 'Q · 2:00.0', 'the ending question; the dial: 7 home in China (6 ivory + the horse), 5 dashed'),
]
os.makedirs(OUT + 'check400', exist_ok=True)
COLS, TW, TH, M, CAP = 3, 640, 360, 22, 100
rows = (len(frames) + COLS - 1) // COLS
W = COLS * TW + (COLS + 1) * M
sheet = Image.new('RGB', (W, 100 + rows * (TH + CAP + M)), '#14100d'); d = ImageDraw.Draw(sheet)
d.text((M, 24), '《七个回国，一个回家》 ep45 · script v7 (subtitles only, 2:08) · Look 1 铜灯影 · 15 key frames', font=ImageFont.truetype(F, 38), fill='#F3E6CF')
fT, fS = ImageFont.truetype(F, 26), ImageFont.truetype(FR, 19)
for i, (n, t, sub) in enumerate(frames):
    x, y = M + (i % COLS) * (TW + M), 92 + (i // COLS) * (TH + CAP + M)
    im = Image.open(f'{SRC}{n}.png').convert('RGB'); lum = np.asarray(im.convert('L'), float).mean()
    im.resize((400, 225), Image.LANCZOS).save(f'{OUT}check400/{n}_400.png')
    sheet.paste(im.resize((TW, TH), Image.LANCZOS), (x, y))
    d.text((x + 2, y + TH + 6), f'{i + 1:02d}  {t}  ·  luma {lum:.0f}', font=fT, fill='#FFB070')
    lines, cur = [], ''
    for w in sub.split(' '):   # wrap the one-line caption to the tile width
        t2 = (cur + ' ' + w).strip()
        if d.textlength(t2, font=fS) > TW - 6 and cur: lines.append(cur); cur = w
        else: cur = t2
    lines.append(cur)
    for j, ln in enumerate(lines[:2]): d.text((x + 2, y + TH + 40 + j * 26), ln, font=fS, fill='#CDBFA8')
    print(n, round(lum, 1))
sheet.save(OUT + 'sheet_v7_full.png'); print(OUT + 'sheet_v7_full.png', sheet.size)
# a 400-px-wide strip of all frames, as on a phone (5 per row)
strip = Image.new('RGB', (400 * 5 + 40, 225 * 3 + 20), '#000')
for i, (n, *_) in enumerate(frames): strip.paste(Image.open(f'{OUT}check400/{n}_400.png'), ((i % 5) * 410, (i // 5) * 235))
strip.save(OUT + 'strip400_v7.png'); print(OUT + 'strip400_v7.png', strip.size)
