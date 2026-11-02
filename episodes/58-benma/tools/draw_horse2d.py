"""ep58: 2D flat horse. Silhouette from the reference; shading computed from the shape itself
(distance-field 'inflation' -> normals -> light from upper left -> 3 clean bands), so the bands follow
the form instead of the photo's patina blotches. Output: layered SVG."""
import sys, numpy as np, cv2, potrace
from PIL import Image, ImageFilter
ref, out = sys.argv[1], sys.argv[2]
im = Image.open(ref).convert('RGB'); a = np.asarray(im).astype(np.float32) / 255
L = a @ np.array([.2126, .7152, .0722], np.float32); sat = a.max(-1) - a.min(-1)
fg = ((L < .80) | (sat > .10)).astype(np.uint8) * 255
fg = cv2.medianBlur(fg, 5)
ys, xs = np.nonzero(fg); x0, x1, y0, y1 = xs.min() - 14, xs.max() + 14, ys.min() - 14, ys.max() + 14
S = 4
m = cv2.resize(fg[y0:y1, x0:x1], None, fx=S, fy=S, interpolation=cv2.INTER_CUBIC)
m = cv2.GaussianBlur(m, (0, 0), 3.5) > 128
n, lab, st, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8)); m = lab == (1 + np.argmax(st[1:, cv2.CC_STAT_AREA]))
H, W = m.shape
d = cv2.distanceTransform(m.astype(np.uint8), cv2.DIST_L2, 5)
h = np.sqrt(np.maximum(d, 0)) * 9.0                       # rounded 'inflated' height
h = cv2.GaussianBlur(h, (0, 0), 6)
gy, gx = np.gradient(h); nz = np.ones_like(h)
nn = np.sqrt(gx ** 2 + gy ** 2 + nz ** 2); nx, ny, nzz = -gx / nn, -gy / nn, nz / nn
Lx, Ly, Lz = -.55, -.75, .45; ln = np.sqrt(Lx * Lx + Ly * Ly + Lz * Lz)
lam = (nx * Lx + ny * Ly + nzz * Lz) / ln
# a little of the photo's own big light/dark (body form), heavily smoothed and masked
Lr = cv2.resize(L[y0:y1, x0:x1], (W, H), interpolation=cv2.INTER_CUBIC)
num = cv2.GaussianBlur(Lr * m, (0, 0), 30); den = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 30) + 1e-4
shade = .75 * lam + .25 * (num / den - .5) * 2
v = shade[m]; q = np.percentile(v, [30, 68, 92])
def trace(bm, turd=60):
    p = potrace.Bitmap(~np.asarray(bm, bool)).trace(turdsize=turd, alphamax=1.15, opticurve=True, opttolerance=.5)
    out = []
    for c in p:
        s = c.start_point; out.append(f'M{s.x:.1f},{s.y:.1f}')
        for g in c.segments:
            out.append(f'L{g.c.x:.1f},{g.c.y:.1f} L{g.end_point.x:.1f},{g.end_point.y:.1f}' if g.is_corner else
                       f'C{g.c1.x:.1f},{g.c1.y:.1f} {g.c2.x:.1f},{g.c2.y:.1f} {g.end_point.x:.1f},{g.end_point.y:.1f}')
        out.append('Z')
    return ' '.join(out)
pal = ['#1C332D', '#33594B', '#5C8C74', '#9DC4AE']
layers = [trace(m, 20)]
for k in q:
    b = ((shade > k) & m).astype(np.uint8) * 255
    b = cv2.morphologyEx(b, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8)); b = cv2.GaussianBlur(b, (0, 0), 4) > 128
    layers.append(trace(b & m, 300))
mk = m.astype(np.uint8); sh = np.zeros_like(mk); sh[10:, 8:] = mk[:-10, :-8]
rim = (m & ~(sh > 0)).astype(np.uint8) * 255; rim = cv2.morphologyEx(rim, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">']
for dd, c in zip(layers, pal): svg.append(f'<path d="{dd}" fill="{c}" fill-rule="evenodd"/>')
svg.append(f'<path d="{trace(rim > 0, 30)}" fill="#F3DDAE" fill-rule="evenodd" opacity=".95"/></svg>')
open(out, 'w').write('\n'.join(svg)); print('ok', W, H)
