"""ep58: faithful code-drawn vector of the bronze. Edge-preserving smoothing -> k-means colour regions (Lab)
-> cleaned label map -> potrace each region -> layered SVG with the real patina colours (optionally nudged).
usage: vector_trace.py ref out.svg [k=8] [scale=3] [crop=x0,y0,x1,y1] [bg=white|none]"""
import sys, numpy as np, cv2, potrace
args = dict(a.split('=', 1) for a in sys.argv[3:] if '=' in a)
K, S = int(args.get('k', 8)), float(args.get('scale', 3))
img = cv2.imread(sys.argv[1], cv2.IMREAD_COLOR)
if 'crop' in args:
    x0, y0, x1, y1 = map(int, args['crop'].split(',')); img = img[y0:y1, x0:x1]
f = img.astype(np.float32) / 255; Lum = f @ np.array([.0722, .7152, .2126], np.float32)
sat = f.max(-1) - f.min(-1)
fg = (((Lum < .80) | (sat > .10)) * 255).astype(np.uint8); fg = cv2.medianBlur(fg, 5)
ys, xs = np.nonzero(fg); x0, x1, y0, y1 = max(xs.min() - 12, 0), xs.max() + 12, max(ys.min() - 12, 0), ys.max() + 12
img, fg = img[y0:y1, x0:x1], fg[y0:y1, x0:x1]
img = cv2.resize(img, None, fx=S, fy=S, interpolation=cv2.INTER_LANCZOS4)
m = cv2.GaussianBlur(cv2.resize(fg, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_CUBIC), (0, 0), 2.5) > 128
n, lab, st, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8)); m = lab == (1 + np.argmax(st[1:, cv2.CC_STAT_AREA]))
sm = img.copy()
for _ in range(4): sm = cv2.bilateralFilter(sm, 9, 28, 9)
sm = cv2.edgePreservingFilter(sm, flags=1, sigma_s=float(args.get('ss', 40)), sigma_r=float(args.get('sr', .25)))
labc = cv2.cvtColor(sm, cv2.COLOR_BGR2LAB).astype(np.float32)
X = labc[m]
crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 40, .5)
_, lbl, cen = cv2.kmeans(X, K, None, crit, 4, cv2.KMEANS_PP_CENTERS)
order = np.argsort(cen[:, 0]); rank = np.empty(K, int); rank[order] = np.arange(K)   # dark -> light
L = np.full(m.shape, -1, np.int32); L[m] = rank[lbl.ravel()]
# clean: smooth one-hot maps, argmax
H, W = m.shape; prob = np.zeros((K, H, W), np.float32)
for k in range(K): prob[k] = cv2.GaussianBlur((L == k).astype(np.float32), (0, 0), float(args.get('ps', 2.2)) * S / 3)
L2 = prob.argmax(0); L2[~m] = -1
cols = []
for k in range(K):
    c = cv2.cvtColor(np.uint8([[cen[order[k]]]]), cv2.COLOR_LAB2BGR)[0, 0][::-1]; cols.append('#%02X%02X%02X' % tuple(int(v) for v in c))
def trace(bm, turd):
    p = potrace.Bitmap(~np.asarray(bm, bool)).trace(turdsize=turd, alphamax=1.0, opticurve=True, opttolerance=.3)
    o = []
    for c in p:
        s = c.start_point; o.append(f'M{s.x:.1f},{s.y:.1f}')
        for g in c.segments:
            o.append(f'L{g.c.x:.1f},{g.c.y:.1f} L{g.end_point.x:.1f},{g.end_point.y:.1f}' if g.is_corner else
                     f'C{g.c1.x:.1f},{g.c1.y:.1f} {g.c2.x:.1f},{g.c2.y:.1f} {g.end_point.x:.1f},{g.end_point.y:.1f}')
        o.append('Z')
    return ' '.join(o)
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">',
       f'<path d="{trace(m, 10)}" fill="{cols[0]}" fill-rule="evenodd"/>']
for k in range(1, K):   # stacked: each layer = all regions at least this light
    svg.append(f'<path d="{trace(L2 >= k, int(float(args.get("turd", 8)) * S))}" fill="{cols[k]}" fill-rule="evenodd"/>')
svg.append('</svg>')
open(sys.argv[2], 'w').write('\n'.join(svg)); print('ok', W, H, cols)
