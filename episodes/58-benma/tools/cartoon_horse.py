"""ep58: the 铜奔马 as recognisable cartoon vector art. Traced outline (simplified), flat patina colour with soft
cartoon shading, far legs darker, and hand-placed line art (eye, brow, nostril, open mouth, teeth, jaw, ear, the
tuft's tie, mane grooves, shoulder/haunch, tail knot, hooves) in the 3x reference coordinates.
usage: cartoon_horse.py ref out.svg"""
import sys, numpy as np, cv2, potrace, math
ref, out = sys.argv[1], sys.argv[2]; S = 3
img = cv2.imread(ref); f = img.astype(np.float32) / 255; Lum = f @ np.array([.0722, .7152, .2126], np.float32); sat = f.max(-1) - f.min(-1)
fg = (((Lum < .80) | (sat > .10)) * 255).astype(np.uint8); fg = cv2.medianBlur(fg, 3)
ys, xs = np.nonzero(fg); x0, x1, y0, y1 = max(xs.min() - 12, 0), xs.max() + 12, max(ys.min() - 12, 0), ys.max() + 12
Lum, fg = Lum[y0:y1, x0:x1], fg[y0:y1, x0:x1]; H, W = Lum.shape[0] * S, Lum.shape[1] * S
m = cv2.GaussianBlur(cv2.resize(fg, (W, H), interpolation=cv2.INTER_LINEAR), (0, 0), 2.0) > 128
n, lab, st, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8)); m = lab == (1 + np.argmax(st[1:, cv2.CC_STAT_AREA]))
Lr = cv2.resize(Lum, (W, H), interpolation=cv2.INTER_CUBIC)
d = cv2.distanceTransform(m.astype(np.uint8), cv2.DIST_L2, 5); mf = m.astype(np.float32)
h0 = np.sqrt(d) * 13; h1 = cv2.GaussianBlur(h0 * mf, (0, 0), 16) / (cv2.GaussianBlur(mf, (0, 0), 16) + 1e-4); h = h1 * (1 - np.exp(-d / 7)) * mf
gy, gx = np.gradient(h); nn = np.sqrt(gx ** 2 + gy ** 2 + 1); lam = (gx * .55 + gy * .75 + .5) / nn
lp = cv2.GaussianBlur(Lr * mf, (0, 0), 14) / (cv2.GaussianBlur(mf, (0, 0), 14) + 1e-4)
lam = .5 * (lam - lam[m].mean()) / (lam[m].std() + 1e-6) + .5 * (lp - lp[m].mean()) / (lp[m].std() + 1e-6)
v = lam[m]; q1, q2, q3 = np.percentile(v, [26, 76, 93])
def band(b, k=11, bl=6): b = cv2.morphologyEx(b.astype(np.uint8) * 255, cv2.MORPH_OPEN, np.ones((k, k), np.uint8)); return (cv2.GaussianBlur(b, (0, 0), bl) > 128) & m
far0 = (cv2.GaussianBlur(Lr, (0, 0), 4) < .34) & (np.mgrid[0:H, 0:W][0] > .58 * H) & m
far = band(far0, 5, 4)
hy, hx = np.mgrid[0:H, 0:W]; mouth = band((cv2.GaussianBlur(Lr, (0, 0), 2) < .30) & (hx > 300) & (hx < 480) & (hy > 315) & (hy < 420), 3, 2)
def trace(bm, turd=60, am=1.3, tol=.8):
    p = potrace.Bitmap(~np.asarray(bm, bool)).trace(turdsize=turd, alphamax=am, opticurve=True, opttolerance=tol); o = []
    for c in p:
        s = c.start_point; o.append(f'M{s.x:.0f},{s.y:.0f}')
        for g in c.segments:
            o.append(f'L{g.c.x:.0f},{g.c.y:.0f} L{g.end_point.x:.0f},{g.end_point.y:.0f}' if g.is_corner else f'C{g.c1.x:.0f},{g.c1.y:.0f} {g.c2.x:.0f},{g.c2.y:.0f} {g.end_point.x:.0f},{g.end_point.y:.0f}')
        o.append('Z')
    return ' '.join(o)
mk = m.astype(np.uint8); sh = np.zeros_like(mk); sh[10:, 8:] = mk[:-10, :-8]; rim = band(m & ~(sh > 0), 3, 1.5)
sil = trace(m, 20, 1.25, .6)
P = dict(sil=sil, far=trace(far, 200), mouth=trace(mouth, 30, 1.1, .4), shadow=trace(band(lam < q1), 500), high=trace(band(lam > q2), 500), top=trace(band(lam > q3, 9, 5), 300), rim=trace(rim, 40, 1.1, .4))
DK, LT = '#10201A', '#C2E0CC'
def stroke(dd, w=7, c=DK, o=1): return f'<path d="{dd}" fill="none" stroke="{c}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" opacity="{o}"/>'
crest = [(655 + 145 * t, 130 + 340 * t) for t in np.linspace(.05, .95, 9)]
nx, ny = -.92, .39
mane = ''.join(stroke(f'M{x + nx * 4:.0f},{y + ny * 4:.0f} L{x + nx * 46:.0f},{y + ny * 46 + 18:.0f}', 6, DK, .55) for x, y in crest)
details = ''.join([
 # head
 '<ellipse cx="566" cy="213" rx="23" ry="14" transform="rotate(-15 566 213)" fill="#0E1A15"/>', '<circle cx="559" cy="207" r="5.5" fill="#EAF4EC"/>',
 stroke('M512,184 Q560,160 608,190', 8),
 '<ellipse cx="338" cy="298" rx="12" ry="8" transform="rotate(-25 338 298)" fill="#0E1A15"/>',
 stroke('M350,262 Q425,230 505,202', 7, LT, .75),
 stroke('M336,410 Q398,442 456,430', 7), stroke('M470,336 Q546,346 588,300', 6, DK, .8), stroke('M470,422 Q542,412 592,352', 6, DK, .7),
 stroke('M672,142 Q694,118 709,102', 6), stroke('M598,70 Q640,59 683,66', 7),
 mane,
 # body
 stroke('M612,560 Q694,700 642,900', 7, DK, .45), stroke('M500,862 Q565,925 645,932', 6, DK, .35),
 stroke('M1238,640 Q1335,762 1270,930', 7, DK, .45), stroke('M900,944 Q1050,962 1180,932', 6, DK, .3),
 # tail knot and split tip
 stroke('M1296,455 Q1300,432 1320,428', 6), stroke('M1336,456 Q1344,434 1362,432', 6), stroke('M1400,442 Q1440,440 1478,434', 5, DK, .6),
 # hooves
 stroke('M72,1222 Q112,1202 152,1216', 6), stroke('M1600,1002 Q1628,1032 1648,1076', 6), stroke('M880,1150 Q930,1135 975,1150', 6),
])
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">
<defs><linearGradient id="hb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5E9178"/><stop offset="1" stop-color="#3B6553"/></linearGradient>
<filter id="sf"><feGaussianBlur stdDeviation="3"/></filter><clipPath id="cl"><path d="{sil}"/></clipPath></defs>
<path d="{sil}" fill="url(#hb)"/>
<g clip-path="url(#cl)">
<path d="{P['shadow']}" fill="#2C5243" opacity=".85" filter="url(#sf)"/>
<path d="{P['far']}" fill="#1E3A31" opacity=".9" filter="url(#sf)"/>
<path d="{P['high']}" fill="#86B99D" opacity=".75" filter="url(#sf)"/>
<path d="{P['top']}" fill="#C4E2CE" opacity=".6" filter="url(#sf)"/>
<path d="{P['mouth']}" fill="#160E0B"/>
{details}
<path d="{P['rim']}" fill="#F3DDAE" opacity=".9"/>
</g>
<path d="{sil}" fill="none" stroke="#0F1E18" stroke-width="7" stroke-linejoin="round"/>
</svg>'''
open(out, 'w').write(svg); print('ok', W, H)
