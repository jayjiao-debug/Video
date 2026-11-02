"""ep58: 2.5D bronze recreation in code. Outline from the reference -> inflated surface + fine relief (from the
reference's local detail) -> normals -> lit as metal: warm key spot + back rim + dim fill; bronze/patina albedo with
patina gathering in hollows; Blinn-Phong specular. Output RGBA PNG. usage: bronze25d.py ref out.png [lx,ly,lz]"""
import sys, numpy as np, cv2
ref, out = sys.argv[1], sys.argv[2]; key = np.array([float(v) for v in (sys.argv[3] if len(sys.argv) > 3 else '-.5,-.75,.6').split(',')])
S = 3; img = cv2.imread(ref); f = img.astype(np.float32) / 255
Lum = f @ np.array([.0722, .7152, .2126], np.float32); sat = f.max(-1) - f.min(-1)
fg = (((Lum < .80) | (sat > .10)) * 255).astype(np.uint8); fg = cv2.medianBlur(fg, 5)
ys, xs = np.nonzero(fg); x0, x1, y0, y1 = max(xs.min() - 12, 0), xs.max() + 12, max(ys.min() - 12, 0), ys.max() + 12
Lum, fg = Lum[y0:y1, x0:x1], fg[y0:y1, x0:x1]
H, W = Lum.shape[0] * S, Lum.shape[1] * S
m = cv2.GaussianBlur(cv2.resize(fg, (W, H), interpolation=cv2.INTER_CUBIC), (0, 0), 2.5) > 128
n, lab, st, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8)); m = lab == (1 + np.argmax(st[1:, cv2.CC_STAT_AREA]))
Lr = cv2.resize(Lum, (W, H), interpolation=cv2.INTER_CUBIC)
d = cv2.distanceTransform(m.astype(np.uint8), cv2.DIST_L2, 5)
h = cv2.GaussianBlur(np.sqrt(d) * 13, (0, 0), 6)                                   # rounded body
hp = Lr - cv2.GaussianBlur(Lr, (0, 0), 9); hp = cv2.GaussianBlur(hp, (0, 0), 3.2)   # fine relief (mane, muscles, eye)
mid = Lr - cv2.GaussianBlur(Lr, (0, 0), 30)
h = h + 14 * hp * m + 32 * cv2.GaussianBlur(mid, (0, 0), 4) * m
gy, gx = np.gradient(h); N = np.dstack([-gx, -gy, np.ones_like(h)]); N /= np.linalg.norm(N, axis=2, keepdims=True)
def nl(v): v = np.array(v, np.float32); return v / np.linalg.norm(v)
Lk, Lrim, Lf, V = nl(key), nl([.75, -.35, -.25]), nl([.2, .9, .4]), nl([0, 0, 1])
dk = np.clip(N @ Lk, 0, 1); dr = np.clip(N @ Lrim, 0, 1); df = np.clip(N @ Lf, 0, 1)
Hh = nl(Lk + V); spec = np.clip(N @ Hh, 0, 1) ** 22
Hr = nl(Lrim + V); specr = np.clip(N @ Hr, 0, 1) ** 20
# patina: hollows (below local mean height) + soft noise
cav = np.clip((cv2.GaussianBlur(h, (0, 0), 9) - h) / 3, 0, 1)
rng = np.random.default_rng(3); nz = cv2.GaussianBlur(rng.random((H // 8 + 1, W // 8 + 1)).astype(np.float32), (0, 0), 1.2)
nz = cv2.resize(nz, (W, H), interpolation=cv2.INTER_CUBIC)
PB = float(__import__('os').environ.get('PATINA', '.35'))
pat = np.clip(PB + 1.6 * cav + .9 * (nz - .5), 0, 1)
bronze = np.array([.42, .30, .17]); patina = np.array([.28, .47, .38])
alb = bronze * (1 - pat[..., None]) + patina * pat[..., None]
keyc, rimc, fillc = np.array([1.0, .86, .64]), np.array([1.0, .78, .5]), np.array([.35, .42, .5])
col = alb * (.08 + 1.15 * dk[..., None] * keyc + .25 * df[..., None] * fillc + .5 * dr[..., None] * rimc)
gloss = (1 - .65 * pat)[..., None]
col += gloss * (.85 * spec[..., None] * keyc + .55 * specr[..., None] * rimc)
col = np.clip(col, 0, 1) ** (1 / 1.1)
rgba = np.dstack([col[..., ::-1] * 255, m * 255]).astype(np.uint8)
a = cv2.GaussianBlur(rgba[..., 3], (0, 0), .8); rgba[..., 3] = a
cv2.imwrite(out, rgba); print('ok', W, H)
