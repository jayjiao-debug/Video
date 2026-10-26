"""Cut the 2D cat illustration (white background) into parts for code-driven deformation:
alpha from the white background, then head / tail / body by flood-filling the regions between the dark outlines.
python3 cut.py cat_src.png outdir"""
import sys, numpy as np
from PIL import Image
from scipy import ndimage as nd
src, out = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(src).convert('RGB')).astype(np.int32); H, W, _ = im.shape
lum = im.mean(2); white = im.min(2) > 238
# background = white pixels connected to the border
lab, n = nd.label(white); border = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])) - {0}
bg = np.isin(lab, list(border)); char = ~bg
char = nd.binary_closing(char, iterations=2)
line = (lum < 140) & char                         # the dark brown outline
fillable = char & ~line
yy, xx = np.mgrid[0:H, 0:W]
# head: an ellipse from the ears down to the chin, plus everything above the brow, plus the whiskers either side
inside = ((xx - 512) / 318.) ** 2 + ((yy - 392) / 252.) ** 2 <= 1
head = char & (inside | (yy < 330) | (((xx < 222) | (xx > 802)) & (yy > 430) & (yy < 610)))
from matplotlib.path import Path
tailpoly = Path([(752, 655), (875, 640), (880, 885), (800, 900), (758, 872), (748, 760)])
tail = char & tailpoly.contains_points(np.c_[xx.ravel(), yy.ravel()]).reshape(H, W) & ~head & (xx >= 770)
# the body keeps its own outline where the tail tucks behind it (no cut edge that swings with the tail)
body_keep = char & ~head & (xx < 772)
# body keeps a band under the head (hidden by the head) so a moving head never opens a hole
under = ((xx - 512) / 300.) ** 2 + ((yy - 430) / 236.) ** 2 <= 1
body = (char & ~tail & ~(head & ~(under & (yy > 520)))) | (body_keep & ~(head & ~(under & (yy > 520))))
print('px head', head.sum(), 'tail', tail.sum(), 'body', body.sum(), 'char', char.sum())
# the band under the head is plain fur (a neck), never a second copy of the cheeks / chin / whiskers
neck = (((xx - 512) / 172.) ** 2 + ((yy - 640) / 120.) ** 2 <= 1) & (yy > 520)
body = (body & ~head) | neck
rgba = np.dstack([im.astype(np.uint8), np.zeros((H, W), np.uint8)])
furc = im[700, 512].astype(np.uint8)
def save(mask, name):
	a = rgba.copy()
	if name == 'body': a[neck & head, :3] = furc
	a[..., 3] = (nd.gaussian_filter(mask.astype(float), .7) * 255).astype(np.uint8)
	ys, xs = np.where(mask); x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
	Image.fromarray(a[y0:y1, x0:x1]).save(f'{out}/{name}.png'); print(name, 'bbox', int(x0), int(y0), int(x1), int(y1))
	return (int(x0), int(y0), int(x1), int(y1))
import json
boxes = {k: save(m, k) for k, m in (('head', head), ('tail', tail), ('body', body))}
# colours for code-drawn parts
fur = im[700, 512]; json.dump({'boxes': boxes, 'fur': '#%02x%02x%02x' % tuple(int(c) for c in im[450, 470]), 'line': '#%02x%02x%02x' % tuple(int(c) for c in im[line].reshape(-1, 3).mean(0).round().astype(int)), 'size': [W, H]}, open(f'{out}/parts.json', 'w'))
dbg = np.zeros((H, W, 3), np.uint8); dbg[head] = (255, 120, 120); dbg[tail] = (120, 255, 120); dbg[body] = (120, 120, 255); dbg[line] //= 2
Image.fromarray(dbg).save(f'{out}/debug.png')
