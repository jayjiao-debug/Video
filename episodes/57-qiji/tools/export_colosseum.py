"""Export the 斗兽场 scene for the Remotion build (Q57COLO.tsx): still layers as SVG (from hist_b's own drawing code, fixed
camera) and the amphitheatre as data, so Remotion can build it bay by bay. For any point on the ring, screen x is fixed and
screen y = HY - FL * (Y - HC) / zr, so each anchor is stored as (x, zr) and the wall can stand at any height Y.
Writes remotion/public/ep57/colo/*.svg + colo.json (generated, not committed)."""
import os, sys, json, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hist_b as HB
OUT = '/home/claude/video/episodes/37-qiqing/remotion/public/ep57/colo'; os.makedirs(OUT, exist_ok=True)
CAP = {}
HB.write = lambda name, defs, body: CAP.update(defs=defs if isinstance(defs, str) else ''.join(defs), body=list(body))
def svg(defs, body): return f'<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs>{defs}</defs>{"".join(body)}</svg>'
def save(name, s): open(f'{OUT}/{name}.svg', 'w').write(s)

# 1 · Nero's lake at sunset (the whole drawing, without its label) and the lake's outline
lk = HB.colosseum_nero_lake()
save('lake', svg(CAP['defs'], [e for e in CAP['body'] if '尼禄的私人湖' not in e]))
# 2 · the morning square: back (sky, hills, paving), crowd, family, front (slope, pine, terrace)
R = random.Random(80)
pal = dict(sky0='#3A6BBB', sky1='#5B8FD6', sky2='#A9CBEB', cloud='#F4F7FB', far='#A9B6C6', far_l='#8796AA', hillL='#7E8E5A', hillR='#86964F', hill_lit='#C7D58A',
           cyp='#3D5230', pine='#4F6A36', ground='url(#r_plaza)', w0='#F6ECD4', w1='#EEE1C4', w2='#DCC9A4', w3='#C3AC84', pil='#FBF6EA', pil_d='#E4D6B8', pil_hi='#FFFFFF',
           band='#F4ECDA', band_d='#C9B48E', open='#3A332E', jamb='#9C7E5E', marble='#F8F4EC', shield='#D4A84A', banner='#B0302A', slope='#3E5530',
           shrub=['#4E6B3A', '#5B7A42', '#45603A'], trunk='#5E4632', canopy=['#4C6A36', '#58783E', '#42602F'], canopy_lit='#A8C46A',
           floor='#DED2BB', floor_j='#C2B293', bal='#EEE2CA', bal_d='#C4B191', bal_lit='#FFFFFF')
defs = (f'<linearGradient id="r_sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{pal["sky0"]}"/><stop offset=".3" stop-color="{pal["sky1"]}"/><stop offset=".55" stop-color="{pal["sky2"]}"/></linearGradient>'
        '<linearGradient id="r_plaza" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9CDB1"/><stop offset="1" stop-color="#C7B793"/></linearGradient>')
g = ['<rect width="1920" height="1080" fill="url(#r_sky)"/>']
for cx_, cy_, w in [(1640, 300, 54), (1760, 420, 40), (300, 470, 46)]:   # keep the random sequence; clouds are drawn live in Remotion
    HB.blob(R, cx_, cy_, w, 10, .18); HB.blob(R, cx_ + w * .8, cy_ + 6, w * .65, 9, .15)
HB.backdrop(g, R, pal, palace=False)
for zr in [100, 108, 117, 127, 138, 150, 163]:
    y = HB.HY + HB.FL * HB.HC / zr; g.append(HB.line([(0, y), (1920, y)], '#B9A780', 1.5, 'opacity=".55"'))
save('back', svg(defs, g))
gc = []; dfs = []; info, bt, Lb, tnear, xnear = HB.colosseum(gc, R, pal, dfs)    # (finished; used for the crowd and the finish layer)
TOPS = ['#E9E0CB', '#D8C7A2', '#B9473A', '#C98F45', '#5B6E8E', '#7C7A48', '#8E5B3E', '#F1EBDD', '#A4643F', '#3F5A73', '#C7B07A']
SK = ['#C99572', '#B07F62', '#D9A88C', '#8E5E45']; HR = ['#2A211B', '#3A2A20', '#5A3A26', '#1A1512']
crowd = []; gates = [x for x in info if x[3] > .3]
for k, ta, tb, cm in gates[1::2]:
    tm = (ta + tb) / 2; EX, EZ = HB.ring(HB.A_C + 1.0, HB.B_C + 1.0, tm); SX, SZ = EX * .5 + R.uniform(-20, 20), -HB.D + R.uniform(92, 100)
    for j in range(R.randint(16, 24)):
        u = R.random() ** .8; X = SX + (EX - SX) * u + R.uniform(-1.8, 1.8) * (1.5 - u); Z = SZ + (EZ - SZ) * u + R.uniform(-1.2, 1.2); crowd.append((X, Z, 0))
    for j in range(4): crowd.append((EX + R.uniform(-1.3, 1.3), EZ + R.uniform(.5, 1.6), 1))
for _ in range(40):
    X, Z = R.uniform(-115, 75), -HB.D + R.uniform(93, 150)
    if ((X * math.cos(HB.PHI) + Z * math.sin(HB.PHI)) / HB.A_C) ** 2 + ((-X * math.sin(HB.PHI) + Z * math.cos(HB.PHI)) / HB.B_C) ** 2 > 1.12: crowd.append((X, Z, 0))
gcr = []
for X, Z, door in sorted(crowd, key=lambda p: -p[1]):
    zr = Z + HB.D; x, y = HB.P3(X, 0, Z); h = HB.FL * 1.7 * 1.3 / zr * R.uniform(.92, 1.05)
    if 110 < x < 730 and y > 925: continue
    kind = 'tunic' if R.random() < .7 else 'stola'; top = R.choice(['#F1EBDD', '#E9E0CB', '#E8C36A', '#E2A15C']) if door else R.choice(TOPS)
    HB.tiny(gcr, x, y, h, top, R.choice(HR), R.choice(SK), R.uniform(.2, .8), kind, R.choice(['#C9B48A', '#8E5B3E', '#5B6E8E', '#E9E0CB']) if kind == 'stola' else None)
save('crowd', svg('', gcr))
gf = []
HB.roman(gf, 1692, 944, 340, 'stola', '#B9573E', '#D9A88C', '#3A2A20', palla='#6F83A6')
HB.roman(gf, 1846, 942, 382, 'toga', '#F1EADA', '#B98060', '#2A1F1A', left=(1788, 790))
HB.roman(gf, 1760, 946, 200, 'tunic', '#E3C67A', '#C99572', '#5A3A26', child=True, left=(1700, 760))
save('family', svg('', gf))
gfr = []; HB.slope(gfr, R, pal); HB.stone_pine(gfr, R, 70, 1080, 470, 170, pal); HB.terrace(gfr, pal)
save('front', svg('', gfr))
save('finished', svg(''.join(dfs), gc))      # the finished amphitheatre (for the very end, exact match with the story drawing)

# 3 · the amphitheatre as data
A, B = HB.A_C, HB.B_C; vis = HB.vis_ts(A, B, 1440)
def anc(tt, a=A, b=B): X, Z = HB.ring(a, b, tt); return [round(HB.CX + HB.FL * X / (Z + HB.D), 2), round(Z + HB.D, 3)]
def S(tt, Y): X, Z = HB.ring(A, B, tt); return HB.P3(X, Y, Z)
bt, Lb = HB.bays(A, B, 80, 4000, t0=tnear - math.pi)
wall = [S(tt, 48) for tt in vis] + [S(tt, 0) for tt in vis[::-1]]; xs = [p[0] for p in wall]; x0, x1 = min(xs), max(xs)
grad = (f'<linearGradient id="r_wall" gradientUnits="userSpaceOnUse" x1="{x0:.0f}" y1="0" x2="{x1:.0f}" y2="0"><stop offset="0" stop-color="{pal["w0"]}"/>'
        f'<stop offset="{(xnear - x0) / (x1 - x0):.2f}" stop-color="{pal["w1"]}"/><stop offset=".86" stop-color="{pal["w2"]}"/><stop offset="1" stop-color="{pal["w3"]}"/></linearGradient>')
bays = []
for k in range(80):
    ta, tb = bt[k], bt[k + 1]; ca, cb = HB.facing(A, B, ta), HB.facing(A, B, tb)
    if max(ca, cb) <= 0: continue
    cm = (ca + cb) / 2; dt = tb - ta; cw = .62 / Lb
    def Q(w, Y): return [round(v, 2) for v in S(ta + dt * w, Y)]
    st = []
    for si, (y0, y1, sill, crown) in enumerate(HB.STOREYS):
        w0, w1 = .5 - HB.KW / 2, .5 + HB.KW / 2; rr = (w1 - w0) * Lb / 2; spring = crown - rr
        def archp(a0, a1, sl, cr):
            r_ = (a1 - a0) * Lb / 2; sp = cr - r_; c = (a0 + a1) / 2
            return [Q(a0, sl)] + [Q(c - (a1 - a0) / 2 * math.cos(math.pi * i / 10), sp + r_ * math.sin(math.pi * i / 10)) for i in range(11)] + [Q(a1, sl)]
        d = HB.KW * min(.42, (1 - cm) * .8); far_right = Q(.5, 0)[0] < xnear; right_side = Q(1, 0)[0] > Q(0, 0)[0]
        inner = archp(w0, w1 - d, sill, crown - .2) if far_right == right_side else archp(w0 + d, w1, sill, crown - .2)
        centring = [Q(.5 - (w1 - w0) / 2 * math.cos(math.pi * i / 10), spring + rr * math.sin(math.pi * i / 10)) for i in range(11)]
        st.append(dict(arch=archp(w0, w1, sill, crown), inner=inner, centring=centring, sill=sill, crown=crown, spring=spring, y0=y0, y1=y1))
    lit = (HB.nrm(A, B, ta)[0] * HB.LIGHT[0] + HB.nrm(A, B, ta)[1] * HB.LIGHT[1]) > .2
    bays.append(dict(k=k, cm=round(cm, 3), a=anc(ta), b=anc(tb), w0=anc(ta + dt * (.5 - HB.KW / 2)), w1=anc(ta + dt * (.5 + HB.KW / 2)),
                     c0=anc(ta - cw * dt), c1=anc(ta + cw * dt), sa=anc(ta, A + 1.4, B + 1.4), sb=anc(tb, A + 1.4, B + 1.4), cr=anc((ta + tb) / 2, A - 1.5, B - 1.5),
                     col=pal['pil'] if lit else pal['pil_d'], storeys=st))
order = sorted(bays, key=lambda b: b['a'][0])
for i, b in enumerate(order): b['rank'] = round(i / max(1, len(order) - 1), 3)
piles = []
for tt in vis[::160]:
    X, Z = HB.ring(A + 6, B + 6, tt); p = HB.P3(X, 0, Z); piles.append([round(p[0], 1), round(p[1], 1), round(HB.FL / (Z + HB.D), 3)])
json.dump(dict(HY=HB.HY, FL=HB.FL, HC=HB.HC, grad=grad, bays=bays, bands=HB.BANDS, piles=piles, lake=[[round(x, 1), round(y, 1)] for x, y in lk],
               foot=[[round(v, 1) for v in S(tt, 0)] for tt in vis[::12]], pal=dict(band=pal['band'], jamb=pal['jamb'], open=pal['open'])), open(f'{OUT}/colo.json', 'w'))
print('ok', OUT, len(bays), 'bays')
