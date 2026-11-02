"""ep58: the 铜奔马 in Juno style. Accurate outline (traced) + form shading from the shape (soft-edged bands),
patina green as the one glowing accent, warm rim light, a few dark detail shapes (eye, mouth, nostril, mane
from the reference's darkest pockets). Writes horse_juno.svg (viewBox in px of the 3x reference)."""
import sys, numpy as np, cv2, potrace
ref, out = sys.argv[1], sys.argv[2]; S = 3
img = cv2.imread(ref); f = img.astype(np.float32) / 255; Lum = f @ np.array([.0722, .7152, .2126], np.float32); sat = f.max(-1) - f.min(-1)
fg = (((Lum < .80) | (sat > .10)) * 255).astype(np.uint8); fg = cv2.medianBlur(fg, 5)
ys, xs = np.nonzero(fg); x0, x1, y0, y1 = max(xs.min() - 12, 0), xs.max() + 12, max(ys.min() - 12, 0), ys.max() + 12
img, fg, Lum = img[y0:y1, x0:x1], fg[y0:y1, x0:x1], Lum[y0:y1, x0:x1]
img = cv2.resize(img, None, fx=S, fy=S, interpolation=cv2.INTER_LANCZOS4); H, W = img.shape[:2]
m = cv2.GaussianBlur(cv2.resize(fg, (W, H), interpolation=cv2.INTER_CUBIC), (0, 0), 2.5) > 128
n, lab, st, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8)); m = lab == (1 + np.argmax(st[1:, cv2.CC_STAT_AREA]))
Lr = cv2.resize(Lum, (W, H), interpolation=cv2.INTER_CUBIC)
# form shading from the shape: inflated height -> normals -> light from upper left
d = cv2.distanceTransform(m.astype(np.uint8), cv2.DIST_L2, 5); h = cv2.GaussianBlur(np.sqrt(d) * 9, (0, 0), 7)
gy, gx = np.gradient(h); nn = np.sqrt(gx ** 2 + gy ** 2 + 1); lam = (-gx * -.55 + -gy * -.75 + .45) / nn / np.sqrt(.55 ** 2 + .75 ** 2 + .45 ** 2)
# blend in the photo's broad light/dark so the musculature reads (heavily smoothed)
num = cv2.GaussianBlur(Lr * m, (0, 0), 14); den = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 14) + 1e-4
sh = .6 * lam + .4 * ((num / den) - np.median((num / den)[m])) * 2.2
v = sh[m]; q_sh, q_hi, q_top = np.percentile(v, [30, 80, 95])
def clean(b, k=9, blur=5): b = cv2.morphologyEx(b.astype(np.uint8) * 255, cv2.MORPH_OPEN, np.ones((k, k), np.uint8)); return (cv2.GaussianBlur(b, (0, 0), blur) > 128) & m
shadow, high, top = clean(sh < q_sh), clean(sh > q_hi), clean(sh > q_top, 7, 4)
# dark detail pockets (eye, nostril, mouth, mane grooves): locally dark vs surroundings
loc = cv2.GaussianBlur(Lr, (0, 0), 10); det = (Lr < loc - .085) & m
det = cv2.morphologyEx(det.astype(np.uint8) * 255, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)) > 0
n2, l2, s2, _ = cv2.connectedComponentsWithStats(det.astype(np.uint8)); keep = np.zeros_like(det)
for i in range(1, n2):
    a_ = s2[i, cv2.CC_STAT_AREA]; cx_, cy_ = s2[i, 0] + s2[i, 2] / 2, s2[i, 1] + s2[i, 3] / 2
    head = cx_ < .42 * W and cy_ < .42 * H
    if (head and 60 * S < a_ < 2500 * S) or (not head and 400 * S < a_ < 4000 * S): keep |= l2 == i
mk = m.astype(np.uint8); shf = np.zeros_like(mk); shf[9:, 7:] = mk[:-9, :-7]; rim = (m & ~(shf > 0))
def trace(bm, turd=40):
    p = potrace.Bitmap(~np.asarray(bm, bool)).trace(turdsize=turd, alphamax=1.15, opticurve=True, opttolerance=.5); o = []
    for c in p:
        s = c.start_point; o.append(f'M{s.x:.1f},{s.y:.1f}')
        for g in c.segments:
            o.append(f'L{g.c.x:.1f},{g.c.y:.1f} L{g.end_point.x:.1f},{g.end_point.y:.1f}' if g.is_corner else f'C{g.c1.x:.1f},{g.c1.y:.1f} {g.c2.x:.1f},{g.c2.y:.1f} {g.end_point.x:.1f},{g.end_point.y:.1f}')
        o.append('Z')
    return ' '.join(o)
P = dict(sil=trace(m, 10), shadow=trace(shadow, 300), high=trace(high, 300), top=trace(top, 200), det=trace(keep, 12), rim=trace(rim, 30))
import json; json.dump(dict(W=W, H=H, **P), open(out, 'w')); print('ok', W, H, {k: len(v) for k, v in P.items()})
