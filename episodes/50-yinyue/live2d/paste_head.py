import sys, numpy as np; from PIL import Image
from scipy import ndimage as nd
src, out, s, mx, my = sys.argv[1], sys.argv[2], *map(float, sys.argv[3:6])
new = np.asarray(Image.open(src).convert('RGB')).astype(float)
h = Image.open('../l2d/band/cream_head.png'); full = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0)); full.paste(h, (153, 76))
ox, oy = 512.9, 438.45   # original eye midpoint
# affine: new = s*(orig - o) + m  -> PIL wants inverse: orig = (new - m)/s + o
inv = (1 / s, 0, ox - mx / s, 0, 1 / s, oy - my / s)
H = np.asarray(full.transform((1024, 1024), Image.AFFINE, inv, resample=Image.BICUBIC)).astype(float)
a = H[..., 3:] / 255.; a = nd.gaussian_filter(a[..., 0], 1.2)[..., None] * (a > .02)
hm = a[..., 0] > .5; ys = np.where(hm.any(1))[0]; bot = ys.max()
ring = nd.binary_dilation(hm, iterations=14) & ~hm
yy = np.mgrid[0:1024, 0:1024][0]; ring &= yy < bot - 70
new[ring & (new.min(2) < 245) & (new.mean(2) > 40) | ring] = 255   # clear the redrawn head's edge around the pasted one
o = new * (1 - a) + H[..., :3] * a
bgm = np.asarray(Image.fromarray(o.astype(np.uint8))).min(2) > 244; lab, _ = nd.label(bgm); o[lab == lab[2, 2]] = 255
Image.fromarray(o.astype(np.uint8)).save(out)
