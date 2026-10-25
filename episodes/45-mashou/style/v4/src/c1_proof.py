#!/usr/bin/env python3
"""c1_proof.png: C1 at full size and at 400 px, next to the 新京报 press photo scaled to the same height.
For the owner and the director only: the photo is REFERENCE, never on screen, never traced."""
from PIL import Image, ImageDraw, ImageFont
import numpy as np
D = '/home/claude/video/episodes/45-mashou/style/v4/'
REF = '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/ref45/mashou_bjnews_1.jpg'
F = '/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc'; FR = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
c1 = Image.open(D + 'c1_hook.png').convert('RGB'); ref = Image.open(REF).convert('RGB')
H = 1080; refF = ref.resize((round(ref.width * H / ref.height), H), Image.LANCZOS)
c4 = c1.resize((400, 225), Image.LANCZOS); ref4 = ref.resize((round(ref.width * 225 / ref.height), 225), Image.LANCZOS)
M, TOP, GAP = 40, 130, 60
W = M + 1920 + M + refF.width + M
Hh = TOP + H + GAP + 80 + 225 + 120
s = Image.new('RGB', (W, Hh), '#14100d'); d = ImageDraw.Draw(s)
d.text((M, 30), 'ep45 C1 hero proof (gate 2b r3) · for the owner and the director only · the photo is reference, never on screen, never traced', font=ImageFont.truetype(F, 40), fill='#F3E6CF')
d.text((M, 82), 'Left: c1_hook.png as it will play (1920×1080).   Right: 新京报 press photo of the 圆明园马首 (3/4 view), scaled to the same height.', font=ImageFont.truetype(FR, 30), fill='#CDBFA8')
s.paste(c1, (M, TOP)); s.paste(refF, (M + 1920 + M, TOP))
y2 = TOP + H + GAP
d.text((M, y2), 'At phone size (400 px wide, same height 225 px), as on a portrait phone:', font=ImageFont.truetype(F, 34), fill='#FFB070')
s.paste(c4, (M, y2 + 70)); s.paste(ref4, (M + 420, y2 + 70))
lum = np.asarray(c1.convert('L'), float).mean()
d.text((M + 420 + ref4.width + 40, y2 + 70), f'C1 mean luma {lum:.0f}\nphoto: reference only\n(新京报, mashou_bjnews_1.jpg)', font=ImageFont.truetype(FR, 28), fill='#CDBFA8')
s.save(D + 'c1_proof.png'); print(D + 'c1_proof.png', s.size, round(lum, 1))
