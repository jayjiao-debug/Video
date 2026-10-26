"""Cut any kitten from the series (same pose: sitting, front view, tail on the right, white background) into
head / body / tail, detecting the neck, the eyes and the nose so the rig fits each cat.
python3 cutcat.py <src.png> <outdir> <name>   → <name>_head.png, <name>_body.png, <name>_tail.png, <name>.json"""
import sys, json, numpy as np
from PIL import Image
from scipy import ndimage as nd
from matplotlib.path import Path
src, out, name = sys.argv[1:4]
im = np.asarray(Image.open(src).convert('RGB')).astype(np.int32); H, W, _ = im.shape
lum = im.mean(2); white = im.min(2) > 238
lab, _ = nd.label(white); border = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])) - {0}
char = nd.binary_closing(~np.isin(lab, list(border)), iterations=2)
yy, xx = np.mgrid[0:H, 0:W]
# neck: the narrowest row between head and body once whiskers are opened away
solid = nd.binary_opening(char, iterations=9)
rows = range(560, 730); wid = [solid[y].sum() for y in rows]; neckY = rows[int(np.argmin(wid))]
xsN = np.where(solid[neckY])[0]; cx = (xsN.min() + xsN.max()) / 2
# head width: widest solid row above the neck (cheeks)
hw = max(solid[y].sum() for y in range(300, neckY)) / 2
ry = (neckY - 140) / 2 + 4; cy = neckY - ry + 2; rx = hw + 4
inside = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1
head = char & (inside | (yy < neckY - 30))   # everything above the neck moves with the head (cheek edges, whiskers, ears)
tail = char & ~head & (xx >= 770) & (yy >= 620) & Path([(765, 620), (900, 600), (905, 905), (790, 915), (765, 880)]).contains_points(np.c_[xx.ravel(), yy.ravel()]).reshape(H, W)
neck = (((xx - cx) / (rx * .55)) ** 2 + ((yy - neckY) / 120.) ** 2 <= 1) & (yy > neckY - 120)
body = (char & ~head & ~tail) | neck
# face landmarks: the two biggest dark blobs in the face are the eyes; the pink blob between them is the nose
dark = (lum < 90) & inside & (yy > cy - ry * .3) & (yy < cy + ry * .5)
dl, n = nd.label(nd.binary_opening(dark, iterations=3)); sizes = nd.sum(dark, dl, range(1, n + 1)); big = np.argsort(sizes)[-2:] + 1
eyes = sorted([tuple(float(v) for v in nd.center_of_mass(dl == k)[::-1]) for k in big])
rads = [float(np.sqrt(sizes[k - 1] / np.pi)) for k in big]
if max(rads) > 110:
	good = eyes[int(np.argmin(rads))]; eyes = sorted([good, (2 * cx - good[0], good[1])]); rads = [min(rads)] * 2
er = max(rads) * 1.15
pink = (im[..., 0] > 200) & (im[..., 1] < 190) & (im[..., 1] > 120) & (im[..., 2] < 180) & (abs(xx - cx) < 60) & (yy > eyes[0][1]) & (yy < eyes[0][1] + 120)
nose = [float(v) for v in nd.center_of_mass(pink)[::-1]] if pink.sum() > 20 else [cx, eyes[0][1] + 60]
furc = im[int(neckY + 60), int(cx) + 60].astype(np.uint8)
rgba = np.dstack([im.astype(np.uint8), np.zeros((H, W), np.uint8)]); boxes = {}
for k, m in (('head', head), ('tail', tail), ('body', body)):
    a = rgba.copy()
    if k == 'body': a[neck & head, :3] = furc
    a[..., 3] = (nd.gaussian_filter(m.astype(float), .7) * 255).astype(np.uint8)
    ys, xs = np.where(m); x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    Image.fromarray(a[y0:y1, x0:x1]).save(f'{out}/{name}_{k}.png'); boxes[k] = [int(x0), int(y0), int(x1), int(y1)]
info = {'boxes': boxes, 'neckY': int(neckY), 'cx': float(cx), 'head': [float(cx), float(cy), float(rx), float(ry)], 'eyes': eyes, 'eyeR': er, 'nose': nose, 'mouth': [nose[0], nose[1] + 34]}
json.dump(info, open(f'{out}/{name}.json', 'w'))
dbg = np.zeros((H, W, 3), np.uint8); dbg[body] = (120, 120, 255); dbg[head] = (255, 120, 120); dbg[tail] = (120, 255, 120)
for (ex, ey) in eyes: dbg[int(ey) - 6:int(ey) + 6, int(ex) - 6:int(ex) + 6] = (255, 255, 0)
dbg[int(nose[1]) - 5:int(nose[1]) + 5, int(nose[0]) - 5:int(nose[0]) + 5] = (0, 255, 255)
Image.fromarray(dbg).resize((256, 256)).save(f'{out}/{name}_debug.png')
print(name, 'neck', neckY, 'head', [round(v) for v in info['head']], 'eyes', [[round(v) for v in e] for e in eyes], 'r', round(er), 'nose', [round(v) for v in nose])
