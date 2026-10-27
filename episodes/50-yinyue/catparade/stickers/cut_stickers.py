"""Cut the AI sticker cats out of their cream background.
python3 cut_stickers.py  → stickers/<name>.png (RGBA, cropped, 560 px tall) + stickers/stickers.json (size + foot anchor)
The art (style 2 贴纸吉祥物, Z-Image-Turbo, seed 1234) has a white sticker border, so a flood fill from the image edge
through cream background and the tan ground shadow stops at the border and leaves the whole sticker."""
import json, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = f'{HERE}/raw'
CAST = ['juzi', 'yanweifu', 'huihui', 'sanhua', 'naitang', 'xiaobai']
TH = 560                                            # stored height in px

def cut(name):
    im = Image.open(f'{RAW}/{name}.webp').convert('RGB')
    a = np.asarray(im).astype(int); R, G, B = a[..., 0], a[..., 1], a[..., 2]
    white = (R >= 248) & (G >= 248) & (B >= 243)
    # cream paper, the tan ground shadow and the soft blend between them; never the white border
    bg = (R >= 236) & (G >= 205) & (B >= 160) & (B <= 242) & (G - B >= 6) & (G - B <= 70) & ~white
    m = Image.fromarray((bg * 255).astype('uint8'), 'L').copy()
    h, w = bg.shape
    seeds = [(x, 0) for x in range(0, w, 16)] + [(x, h - 1) for x in range(0, w, 16)] + [(0, y) for y in range(0, h, 16)] + [(w - 1, y) for y in range(0, h, 16)]
    for s in seeds:
        if m.getpixel(s) == 255: ImageDraw.floodfill(m, s, 128)
    outside = np.asarray(m) == 128
    alpha = Image.fromarray(((~outside) * 255).astype('uint8'), 'L').filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.9))
    rgba = im.convert('RGBA'); rgba.putalpha(alpha)
    al = np.asarray(alpha)
    ys, xs = np.where(al > 40)
    x0, x1, y0, y1 = xs.min() - 4, xs.max() + 5, ys.min() - 4, ys.max() + 5
    rgba = rgba.crop((x0, y0, x1, y1))
    sc = TH / rgba.height
    rgba = rgba.resize((round(rgba.width * sc), TH), Image.LANCZOS)
    rgba.save(f'{HERE}/{name}.png', optimize=True)
    # foot anchor: centre of the opaque pixels in the bottom 5 % of the sticker
    al2 = np.asarray(rgba)[..., 3]
    hh = al2.shape[0]; band = al2[int(hh * 0.95):] > 128
    fx = float(np.where(band)[1].mean()) if band.any() else rgba.width / 2
    return {'w': rgba.width, 'h': TH, 'footX': round(fx, 1), 'footY': TH - 6}

meta = {n: cut(n) for n in CAST}
json.dump(meta, open(f'{HERE}/stickers.json', 'w'), indent=1)
print(json.dumps(meta))
