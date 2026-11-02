"""ep58: our own flat-vector 铜奔马 from a reference photo: mask -> smoothed tone layers -> potrace -> layered SVG."""
import sys, numpy as np, potrace
from PIL import Image, ImageFilter
ref, out = sys.argv[1], sys.argv[2]
im = Image.open(ref).convert('RGB'); a = np.asarray(im).astype(np.float32) / 255
L = a @ np.array([.2126, .7152, .0722], np.float32); sat = a.max(-1) - a.min(-1)
fg = (L < .80) | (sat > .10)
m = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(5))
ys, xs = np.nonzero(np.asarray(m) > 128); x0, x1, y0, y1 = xs.min() - 12, xs.max() + 12, ys.min() - 12, ys.max() + 12
S = 4
crop = im.crop((x0, y0, x1, y1)); W, H = crop.size
big = crop.resize((W * S, H * S), Image.LANCZOS)
mb = m.crop((x0, y0, x1, y1)).resize((W * S, H * S), Image.LANCZOS).filter(ImageFilter.GaussianBlur(3))
mask = np.asarray(mb) > 128
# drop the soft floor shadow: keep the largest connected blob only
import cv2
n, lab, st, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8)); keep = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]); mask = lab == keep
Lr = np.asarray(big.convert('L')).astype(np.float32) / 255
num = cv2.GaussianBlur(Lr * mask, (0, 0), 17); den = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), 17) + 1e-4
Lb = num / den
vals = Lb[mask]; qs = np.percentile(vals, [28, 62, 88])
def trace(bm, turd=40):
    bmp = potrace.Bitmap(~np.asarray(bm, bool)); p = bmp.trace(turdsize=turd, alphamax=1.1, opticurve=True, opttolerance=.4)
    d = []
    for c in p:
        s = c.start_point; d.append(f'M{s.x:.1f},{s.y:.1f}')
        for seg in c.segments:
            if seg.is_corner: d.append(f'L{seg.c.x:.1f},{seg.c.y:.1f} L{seg.end_point.x:.1f},{seg.end_point.y:.1f}')
            else: d.append(f'C{seg.c1.x:.1f},{seg.c1.y:.1f} {seg.c2.x:.1f},{seg.c2.y:.1f} {seg.end_point.x:.1f},{seg.end_point.y:.1f}')
        d.append('Z')
    return ' '.join(d)
pal = ['#1E3631', '#355F51', '#5E8E78', '#9CC2AB']   # deep patina -> light patina
layers = [trace(mask, 20)]
for k, q in enumerate(qs):
    sm = Image.fromarray(((Lb > q) & mask).astype(np.uint8) * 255).filter(ImageFilter.MedianFilter(15))
    layers.append(trace(np.asarray(sm) > 128, 400))
# rim light: a thin band along the top/left edge (light from upper left)
mk = mask.astype(np.uint8); sh = np.zeros_like(mk); sh[12:, 9:] = mk[:-12, :-9]
rim = mask & ~(sh > 0)
rim_d = trace(np.asarray(Image.fromarray(rim.astype(np.uint8) * 255).filter(ImageFilter.MedianFilter(3))) > 128, 30)
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W * S} {H * S}" width="{W * S}" height="{H * S}">']
for d, c in zip(layers, pal): svg.append(f'<path d="{d}" fill="{c}" fill-rule="evenodd"/>')
svg.append(f'<path d="{rim_d}" fill="#F6E3B8" fill-rule="evenodd" opacity=".9"/>')
svg.append('</svg>')
open(out, 'w').write('\n'.join(svg)); print('ok', out, W * S, H * S, 'bytes', sum(len(x) for x in svg))
