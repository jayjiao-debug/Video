#!/usr/bin/env python3
"""c1_proof.png (gate 2b r5): C1 at full size next to TWO press photos at the same height — the 3/4 view (mashou_bjnews_1.jpg)
and the mane from behind (mashou_bjnews_zhengjuesi.jpg) — plus the 400 px row of all three.
For the owner and the director only: the photos are REFERENCE, never on screen, never traced."""
from PIL import Image, ImageDraw, ImageFont
import numpy as np
D = '/home/claude/video/episodes/45-mashou/style/v4/'
REFD = '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/ref45/'
REFS = [('mashou_bjnews_1.jpg', '新京报 · 3/4 view (face, mouth, jowl)'), ('mashou_bjnews_zhengjuesi.jpg', '新京报 · 正觉寺, from behind (the mane)')]
F = '/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc'; FR = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
c1 = Image.open(D + 'c1_hook.png').convert('RGB'); refs = [Image.open(REFD + f).convert('RGB') for f, _ in REFS]
H, h4 = 1080, 225
big = [c1] + [r.resize((round(r.width * H / r.height), H), Image.LANCZOS) for r in refs]
small = [c1.resize((400, h4), Image.LANCZOS)] + [r.resize((round(r.width * h4 / r.height), h4), Image.LANCZOS) for r in refs]
M, TOP, GAP = 40, 130, 60
W = M + sum(b.width + M for b in big)
Hh = TOP + H + 56 + GAP + 70 + h4 + 120
s = Image.new('RGB', (W, Hh), '#14100d'); d = ImageDraw.Draw(s)
d.text((M, 30), 'ep45 C1 hero proof (gate 2b r5) · for the owner and the director only · the photos are reference, never on screen, never traced', font=ImageFont.truetype(F, 40), fill='#F3E6CF')
d.text((M, 82), 'Left: c1_hook.png as it will play (1920×1080).   Middle and right: 新京报 press photos of the 圆明园马首, scaled to the same height.', font=ImageFont.truetype(FR, 30), fill='#CDBFA8')
x = M; labels = ['C1 · r5: one casting: the mane is relief in the neck (same patina, one outline), cast tongues below the cut; ears out of the poll'] + [l for _, l in REFS]
for b, lab in zip(big, labels):
    s.paste(b, (x, TOP)); d.text((x, TOP + H + 10), lab, font=ImageFont.truetype(FR, 28), fill='#FFB070'); x += b.width + M
y2 = TOP + H + 56 + GAP
d.text((M, y2), 'At phone size (same height 225 px; C1 is 400 px wide), as on a portrait phone:', font=ImageFont.truetype(F, 34), fill='#FFB070')
x = M
for sm in small: s.paste(sm, (x, y2 + 70)); x += sm.width + 20
lum = np.asarray(c1.convert('L'), float).mean()
d.text((x + 20, y2 + 70), f'C1 mean luma {lum:.0f}\nphotos: reference only\n({", ".join(f for f, _ in REFS)})', font=ImageFont.truetype(FR, 28), fill='#CDBFA8')
s.save(D + 'c1_proof.png'); print(D + 'c1_proof.png', s.size, round(lum, 1))
