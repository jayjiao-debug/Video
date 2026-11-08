"""Sample ink points from brush glyphs (Ma Shan Zheng) for the S32 release (T13): the strokes lift off as motes.
Writes film/cast/t13_glyphs.json: {char: [[x, y], ...]} with x, y in em units (0..1, top-left origin, hanging baseline)."""
import json, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

FONT = '/root/.local/share/fonts/MaShanZheng-Regular.ttf'
TEXT = '休书东京八十万禁军教头林冲为因身犯重罪断配沧州去后存亡不保有妻张氏年少情愿立此休书任从改嫁永无争执委是自行情愿即非相逼'
BIG = '依旧夫妻完聚'
out = {}
rng = np.random.default_rng(5)
for chars, n, size in ((sorted(set(TEXT) - set(BIG)), 14, 200), (list(BIG), 70, 400)):
    font = ImageFont.truetype(FONT, size)
    for ch in chars:
        im = Image.new('L', (size, int(size * 1.3)), 0)
        d = ImageDraw.Draw(im)
        asc = font.getmetrics()[0]
        d.text((0, 0), ch, font=font, fill=255)
        a = np.array(im)
        ys, xs = np.nonzero(a > 128)
        if len(xs) == 0:
            continue
        idx = rng.choice(len(xs), size=min(n, len(xs)), replace=False)
        # em box: hanging baseline ~ top of the em square; PIL draws from the ascent line, so y=0 ~ em top
        out[ch] = [[round(float(xs[i]) / size, 3), round(float(ys[i]) / size, 3)] for i in idx]
json.dump(out, open(sys.argv[1], 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(out), 'glyphs')
