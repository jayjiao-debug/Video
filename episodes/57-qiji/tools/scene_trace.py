"""ep57: the drawn (vector) version of a stop, traced from its photo so it lines up exactly with the real
photo at the shutter. Edge-preserving smoothing -> k-means colour regions (Lab) -> smoothed label map ->
potrace each region -> stacked SVG paths, with a light stylisation of the colours (flatter, a bit warmer).
usage: scene_trace.py photo.jpg out.svg [k=12] [w=1600] [ss=60] [sr=.35] [ps=2.2] [turd=80] [sat=1.12] [warm=6] [gamma=.7]
       [lines=1] [lo=40] [hi=110] [minlen=60] [lw=2] [lc=#2A211B] [la=.55]   (ink line layer from strong edges)"""
import sys, numpy as np, cv2, potrace
args = dict(a.split('=', 1) for a in sys.argv[3:] if '=' in a)
K, Wt = int(args.get('k', 12)), int(args.get('w', 1600))
img = cv2.imread(sys.argv[1], cv2.IMREAD_COLOR)
img = cv2.resize(img, (Wt, round(img.shape[0] * Wt / img.shape[1])), interpolation=cv2.INTER_AREA)
H, W = img.shape[:2]
if 'gamma' in args:   # lift dark photos before tracing
    img = (255 * (img / 255.) ** float(args['gamma'])).clip(0, 255).astype(np.uint8)
sm = img.copy()
for _ in range(3): sm = cv2.bilateralFilter(sm, 9, 30, 9)
sm = cv2.edgePreservingFilter(sm, flags=1, sigma_s=float(args.get('ss', 60)), sigma_r=float(args.get('sr', .35)))
sm = cv2.pyrMeanShiftFiltering(sm, 12, 22)
lab = cv2.cvtColor(sm, cv2.COLOR_BGR2LAB).astype(np.float32)
small = cv2.resize(lab, (W // 3, H // 3), interpolation=cv2.INTER_AREA).reshape(-1, 3)
_, _, cen = cv2.kmeans(small, K, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 40, .5), 4, cv2.KMEANS_PP_CENTERS)
lbl = np.argmin(((lab.reshape(-1, 1, 3) - cen[None]) ** 2).sum(-1), 1).reshape(H, W)
order = np.argsort(cen[:, 0]); rank = np.empty(K, int); rank[order] = np.arange(K)   # dark -> light
Lr = rank[lbl]
prob = np.zeros((K, H, W), np.float32); ps = float(args.get('ps', 2.2))
for k in range(K): prob[k] = cv2.GaussianBlur((Lr == k).astype(np.float32), (0, 0), ps)
L2 = prob.argmax(0)
sat, warm = float(args.get('sat', 1.12)), float(args.get('warm', 6))
cols = []
for k in range(K):
    c = cv2.cvtColor(np.uint8([[cen[order[k]]]]), cv2.COLOR_LAB2BGR)
    hsv = cv2.cvtColor(c, cv2.COLOR_BGR2HSV).astype(np.float32); hsv[..., 1] = np.clip(hsv[..., 1] * sat, 0, 255)
    c = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)[0, 0].astype(np.float32)
    c[2] = min(255, c[2] + warm); c[0] = max(0, c[0] - warm * .6)   # BGR: a touch warmer
    cols.append('#%02X%02X%02X' % (int(c[2]), int(c[1]), int(c[0])))
def trace(bm, turd):
    p = potrace.Bitmap(~np.asarray(bm, bool)).trace(turdsize=turd, alphamax=1.1, opticurve=True, opttolerance=.4)
    o = []
    for c in p:
        s = c.start_point; o.append(f'M{s.x:.1f},{s.y:.1f}')
        for g in c.segments:
            o.append(f'L{g.c.x:.1f},{g.c.y:.1f} L{g.end_point.x:.1f},{g.end_point.y:.1f}' if g.is_corner else
                     f'C{g.c1.x:.1f},{g.c1.y:.1f} {g.c2.x:.1f},{g.c2.y:.1f} {g.end_point.x:.1f},{g.end_point.y:.1f}')
        o.append('Z')
    return ' '.join(o)
turd = int(args.get('turd', 80))
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">', f'<rect width="{W}" height="{H}" fill="{cols[0]}"/>']
for k in range(1, K):
    svg.append(f'<path d="{trace(L2 >= k, turd)}" fill="{cols[k]}" fill-rule="evenodd"/>')
if args.get('lines', '1') == '1':
    g = cv2.cvtColor(cv2.bilateralFilter(cv2.bilateralFilter(img, 9, 40, 9), 9, 40, 9), cv2.COLOR_BGR2GRAY)
    e = cv2.Canny(g, int(args.get('lo', 40)), int(args.get('hi', 110)))
    n, cc, st, _ = cv2.connectedComponentsWithStats(cv2.dilate(e, np.ones((3, 3), np.uint8)))
    keep = np.zeros(n, bool); keep[1:] = np.maximum(st[1:, cv2.CC_STAT_WIDTH], st[1:, cv2.CC_STAT_HEIGHT]) >= int(args.get('minlen', 60))
    e = (keep[cc] & (e > 0)).astype(np.uint8)
    lw = int(args.get('lw', 2)); e = cv2.dilate(e, np.ones((lw, lw), np.uint8))
    e = cv2.GaussianBlur(e.astype(np.float32), (0, 0), .8) > .35
    svg.append(f'<path d="{trace(e, 6)}" fill="{args.get("lc", "#2A211B")}" fill-opacity="{args.get("la", .55)}" fill-rule="evenodd"/>')
svg.append('</svg>')
open(sys.argv[2], 'w').write('\n'.join(svg)); print('ok', W, H, len(''.join(svg)) // 1024, 'KB')
