"""The screen breaks: cracks spread from the bullet's nose over a frozen frame, hold, then the shards fall away and reveal the
watch underneath. usage: python3 shatter.py <freeze.png> <watch frames dir (w%04d.png)> <out dir> <ex> <ey>"""
import sys, os, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops
FREEZE, WDIR, OUT, EX, EY = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4]), float(sys.argv[5])
W, H = 1080, 1920; FPS = 30
N_GROW, N_HOLD, N_FALL = 4, 8, 24
rnd = random.Random(1865); os.makedirs(OUT, exist_ok=True)
E = np.array([EX, EY])

# ---- the crack web: radial cracks at jittered angles, rings at jittered radii; shards are the cells between them
NR = 14
th = sorted((i + rnd.uniform(-0.32, 0.32)) * 2 * math.pi / NR for i in range(NR))
R = [0, 38, 95, 190, 330, 540, 820, 1250, 2600]
P = {}
for i in range(NR):
    for j, r in enumerate(R):
        a = th[i] + (rnd.uniform(-0.06, 0.06) if 0 < j < len(R) - 1 else 0)
        rr = r * (1 + (rnd.uniform(-0.12, 0.12) if 0 < j < len(R) - 1 else 0))
        P[i, j] = E + rr * np.array([math.cos(a), math.sin(a)])
mids = {}
def edge(a, b):   # a jagged edge between two web points, the same jag for both shards that share it
    k = (min(a, b), max(a, b))
    if k not in mids:
        pa, pb = P[k[0]], P[k[1]]; d = pb - pa; n = np.array([-d[1], d[0]]) / (np.linalg.norm(d) + 1e-6)
        m = max(1, int(np.linalg.norm(d) / 70))
        mids[k] = [pa + d * (q / (m + 1)) + n * rnd.uniform(-1, 1) * min(14, np.linalg.norm(d) * 0.05) for q in range(1, m + 1)]
    pts = mids[k]
    return pts if a <= b else pts[::-1]
shards = []
for i in range(NR):
    i2 = (i + 1) % NR
    for j in range(len(R) - 1):
        if j == 0:
            poly = [P[i, 0]] + edge((i, 0), (i, 1)) + [P[i, 1]] + edge((i, 1), (i2, 1)) + [P[i2, 1]] + edge((i2, 1), (i2, 0))
        else:
            poly = [P[i, j]] + edge((i, j), (i, j + 1)) + [P[i, j + 1]] + edge((i, j + 1), (i2, j + 1)) + [P[i2, j + 1]] + edge((i2, j + 1), (i2, j)) + [P[i2, j]] + edge((i2, j), (i, j))
        shards.append([tuple(map(float, p)) for p in poly])
# ring cracks that never broke through: drawn but the two cells fall together
breaks = {(i, j): (rnd.random() < (0.95 if j < 4 else 0.7)) for i in range(NR) for j in range(1, len(R) - 1)}

def crack_layer(reveal):
    """white crack lines (with a dark refraction edge) out to radius `reveal`"""
    L = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
    def seg(pa, pb, w, a):
        if np.linalg.norm(np.array(pa) - E) > reveal and np.linalg.norm(np.array(pb) - E) > reveal: return
        d.line([(pa[0] + 1.5, pa[1] + 1.5), (pb[0] + 1.5, pb[1] + 1.5)], fill=(0, 0, 0, int(a * 0.6)), width=w + 1)
        d.line([pa, pb], fill=(235, 242, 250, a), width=w)
    for i in range(NR):   # radial cracks
        for j in range(len(R) - 1):
            pts = [P[i, j]] + edge((i, j), (i, j + 1)) + [P[i, j + 1]]
            for a, b in zip(pts, pts[1:]): seg(tuple(a), tuple(b), 3 if j < 3 else 2, 230 if j < 4 else 190)
    for i in range(NR):   # ring cracks
        i2 = (i + 1) % NR
        for j in range(1, len(R) - 1):
            if not breaks[i, j]: continue
            pts = [P[i, j]] + edge((i, j), (i2, j)) + [P[i2, j]]
            for a, b in zip(pts, pts[1:]): seg(tuple(a), tuple(b), 2, 200 if j < 4 else 150)
    for _ in range(70):   # hairline branches
        i = rnd.randrange(NR); j = rnd.randrange(1, len(R) - 2)
        p = P[i, j] + (P[i, j + 1] - P[i, j]) * rnd.random(); a = rnd.uniform(0, 2 * math.pi); ln = rnd.uniform(15, 70)
        q = p + ln * np.array([math.cos(a), math.sin(a)]); seg(tuple(p), tuple(q), 1, 140)
    # the crushed white star at the nose
    for _ in range(260):
        a = rnd.uniform(0, 2 * math.pi); r = abs(rnd.gauss(0, 22)); p = E + r * np.array([math.cos(a), math.sin(a)])
        if r < reveal: d.ellipse([p[0] - 1.6, p[1] - 1.6, p[0] + 1.6, p[1] + 1.6], fill=(255, 255, 255, rnd.randint(120, 255)))
    return L

def sheen(base):   # each pane catches the light a little differently
    S = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(S)
    for poly in shards: d.polygon(poly, fill=(255, 255, 255, rnd.randint(3, 13)))
    return Image.alpha_composite(base, S)

freeze = Image.open(FREEZE).convert("RGBA").resize((W, H))
full = sheen(Image.alpha_composite(freeze, crack_layer(9999)))
k = 0
for f in range(N_GROW + N_HOLD):   # cracks race out with a flash at the nose, then hold
    reveal = 2600 * min(1.0, ((f + 1) / N_GROW) ** 1.6)
    img = Image.alpha_composite(freeze, crack_layer(reveal)) if f < N_GROW else full.copy()
    if f < 5:
        fl = Image.new("RGBA", (W, H), (0, 0, 0, 0)); fd = ImageDraw.Draw(fl); rad = 120 + 90 * f; al = int(230 * (1 - f / 5))
        fd.ellipse([EX - rad, EY - rad, EX + rad, EY + rad], fill=(255, 250, 240, al)); fl = fl.filter(ImageFilter.GaussianBlur(40 + 12 * f))
        img = Image.alpha_composite(img, fl)
    img.convert("RGB").save(f"{OUT}/s{k:04d}.png"); k += 1

# the fall: inner panes go first; each drops, drifts outward, turns and shrinks a little as it falls away
pieces = []
for poly in shards:
    xs = [p[0] for p in poly]; ys = [p[1] for p in poly]
    x0, y0, x1, y1 = max(0, int(min(xs)) - 2), max(0, int(min(ys)) - 2), min(W, int(max(xs)) + 3), min(H, int(max(ys)) + 3)
    if x1 <= x0 or y1 <= y0: continue
    m = Image.new("L", (W, H), 0); ImageDraw.Draw(m).polygon(poly, fill=255)
    crop = full.crop((x0, y0, x1, y1)); mc = m.crop((x0, y0, x1, y1))
    edge_l = Image.new("RGBA", crop.size, (0, 0, 0, 0)); ImageDraw.Draw(edge_l).line([(p[0] - x0, p[1] - y0) for p in poly] + [(poly[0][0] - x0, poly[0][1] - y0)], fill=(255, 255, 255, 150), width=2)
    crop = Image.alpha_composite(crop, edge_l); crop.putalpha(ImageChops.multiply(crop.getchannel("A"), mc))
    c = np.array([sum(xs) / len(xs), sum(ys) / len(ys)]); dist = np.linalg.norm(c - E)
    pieces.append(dict(img=crop, x0=x0, y0=y0, c=c, delay=min(0.2, dist / 2600 * 0.24) + rnd.uniform(0, 0.06),
                       vx=(c[0] - EX) * rnd.uniform(0.3, 0.9), vy=rnd.uniform(-160, 60) + (c[1] - EY) * 0.2, w=rnd.uniform(-3.2, 3.2), sh=rnd.uniform(0.1, 0.3)))
for f in range(N_FALL):
    tt = (f + 1) / FPS
    bg = Image.open(f"{WDIR}/w{f:04d}.png").convert("RGBA").resize((W, H))
    for pc in pieces:
        tau = max(0.0, tt - pc["delay"])
        if tau <= 0: bg.alpha_composite(pc["img"], (pc["x0"], pc["y0"])); continue
        dy = pc["vy"] * tau + 0.5 * 7200 * tau * tau; dx = pc["vx"] * tau
        ang = math.degrees(pc["w"] * tau); sc = max(0.3, 1 - pc["sh"] * tau * 2)
        im = pc["img"]; im2 = im.resize((max(1, int(im.width * sc)), max(1, int(im.height * sc))), Image.BILINEAR).rotate(ang, resample=Image.BILINEAR, expand=True)
        cx, cy = pc["c"][0] + dx, pc["c"][1] + dy
        ox = int(cx - (pc["c"][0] - pc["x0"]) * sc - (im2.width - im.width * sc) / 2); oy = int(cy - (pc["c"][1] - pc["y0"]) * sc - (im2.height - im.height * sc) / 2)
        if oy > H or ox > W or ox + im2.width < 0: continue
        bg.alpha_composite(im2, (max(0, ox), max(0, oy)), (max(0, -ox), max(0, -oy)))
    bg.convert("RGB").save(f"{OUT}/s{k:04d}.png"); k += 1
print("shatter frames", k)
