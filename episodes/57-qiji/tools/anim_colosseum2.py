"""ep57 斗兽场 as one time-lapse (owner 09:19: "make the camera move, not the assets jitter; time-lapse the lake being filled,
then the Colosseum being built"). 6 bars (≈10 s) in the drawings' own style, one continuous camera (dolly + orbit, smooth):
  bars 1–2  Nero's private lake at sunset                      「这块地，原来是暴君尼禄的私人湖。」
  bar 3     time-lapse: earth fills the lake from one side, the sky turns from sunset to morning, clouds race
  bars 4–6  the Colosseum rises tier by tier (one per bar) behind a scaffold line; then the crowd and a family appear (no stepping)
            「新皇帝把湖填了，建起斗兽场，说：还给罗马人民。」
usage: anim_colosseum2.py  → scratchpad sb57/shots/colosseum_TL/f/*.jpg"""
import os, sys, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hist_b as HB
from playwright.sync_api import sync_playwright

OUT = '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/sb57/shots/colosseum_TL'
FPS, BAR = 30, 1.672; DUR = 6 * BAR
D0, PHI0 = HB.D, HB.PHI
def cl(x): return min(1.0, max(0.0, x))
def ease(x): x = cl(x); return x * x * (3 - 2 * x)
def eio(x): x = cl(x); return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2
CAP = {}
HB.write = lambda name, defs, body: CAP.update(defs=defs if isinstance(defs, str) else ''.join(defs), body=list(body))
def svg(defs, body, style=''):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute;left:0;top:0;{style}"><defs>{defs}</defs>{"".join(body)}</svg>'

def camera(t):
    HB.D = D0; HB.PHI = PHI0   # owner 09:25: no camera move here, just the time-lapse (a moving 3D camera shimmered)

def lake_layer():
    lk = HB.colosseum_nero_lake(); body = [e for e in CAP['body'] if '尼禄的私人湖' not in e]
    return svg(CAP['defs'], body), lk

def return_layers(t, tl, prog=1.0):
    """the morning scene split: back (sky, hills, square), colosseum, crowd + family, front (slope, pine, terrace)"""
    R = random.Random(80); pal = dict(sky0='#3A6BBB', sky1='#5B8FD6', sky2='#A9CBEB', cloud='#F4F7FB',
        far='#A9B6C6', far_l='#8796AA', hillL='#7E8E5A', hillR='#86964F', hill_lit='#C7D58A', cyp='#3D5230', pine='#4F6A36',
        ground='url(#r_plaza)', w0='#F6ECD4', w1='#EEE1C4', w2='#DCC9A4', w3='#C3AC84', pil='#FBF6EA', pil_d='#E4D6B8', pil_hi='#FFFFFF',
        band='#F4ECDA', band_d='#C9B48E', open='#3A332E', jamb='#9C7E5E', marble='#F8F4EC', shield='#D4A84A', banner='#B0302A',
        slope='#3E5530', shrub=['#4E6B3A', '#5B7A42', '#45603A'], trunk='#5E4632', canopy=['#4C6A36', '#58783E', '#42602F'], canopy_lit='#A8C46A',
        floor='#DED2BB', floor_j='#C2B293', bal='#EEE2CA', bal_d='#C4B191', bal_lit='#FFFFFF')
    defs = [f'<linearGradient id="r_sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{pal["sky0"]}"/><stop offset=".3" stop-color="{pal["sky1"]}"/>'
            f'<stop offset=".55" stop-color="{pal["sky2"]}"/></linearGradient>'
            f'<linearGradient id="r_plaza" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9CDB1"/><stop offset="1" stop-color="#C7B793"/></linearGradient>']
    g = ['<rect width="1920" height="1080" fill="url(#r_sky)"/>']
    for i, (cx_, cy_, w) in enumerate([(1640, 300, 54), (1760, 420, 40), (300, 470, 46), (900, 360, 50), (1300, 250, 44)]):   # clouds race in the time-lapse
        cx_ = (cx_ + 900 * tl + 60 * t) % 2200 - 140
        g.append(HB.poly(HB.blob(R, cx_, cy_, w, 10, .18), pal['cloud'], 'none', 0, 'opacity=".9"'))
        g.append(HB.poly(HB.blob(R, cx_ + w * .8, cy_ + 6, w * .65, 9, .15), pal['cloud'], 'none', 0, 'opacity=".9"'))
    HB.backdrop(g, R, pal, palace=False)
    for zr in [100, 108, 117, 127, 138, 150, 163]:
        y = HB.HY + HB.FL * HB.HC / zr; g.append(HB.line([(0, y), (1920, y)], '#B9A780', 1.5, 'opacity=".55"'))
    back = len(g); dfs = []; info, bt, Lb, tnear, xnear = colosseum_build(g, R, pal, dfs, prog, t); defs.extend(dfs); col = len(g)
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
    for X, Z, door in sorted(crowd, key=lambda p: -p[1]):
        zr = Z + HB.D; x, y = HB.P3(X, 0, Z); h = HB.FL * 1.7 * 1.3 / zr * R.uniform(.92, 1.05)
        if 110 < x < 730 and y > 925: continue
        kind = 'tunic' if R.random() < .7 else 'stola'; top = R.choice(['#F1EBDD', '#E9E0CB', '#E8C36A', '#E2A15C']) if door else R.choice(TOPS)
        HB.tiny(g, x, y, h, top, R.choice(HR), R.choice(SK), R.uniform(.2, .8), kind, R.choice(['#C9B48A', '#8E5B3E', '#5B6E8E', '#E9E0CB']) if kind == 'stola' else None)
    crw = len(g)
    HB.roman(g, 1692, 944, 340, 'stola', '#B9573E', '#D9A88C', '#3A2A20', palla='#6F83A6')
    HB.roman(g, 1846, 942, 382, 'toga', '#F1EADA', '#B98060', '#2A1F1A', left=(1788, 790))
    HB.roman(g, 1760, 946, 200, 'tunic', '#E3C67A', '#C99572', '#5A3A26', child=True, left=(1700, 760))
    fam = len(g); HB.slope(g, R, pal); HB.stone_pine(g, R, 70, 1080, 470, 170, pal); HB.terrace(g, pal)
    d = ''.join(defs)
    return d, g[:back], g[back:col], g[col:crw], g[crw:fam], g[fam:]

def frame_html(t):
    camera(t)
    lake_svg, lk = lake_layer()
    tl = ease((t - 2 * BAR) / BAR)                                     # bar 3: the fill
    prog = cl((t - 3 * BAR) / (2.7 * BAR))
    d, back, col, crowd, fam, front = return_layers(t, tl, prog)
    # the earth fills the lake from the left, in carts' rhythm (four pushes, one per beat)
    xs = [p[0] for p in lk]; x0, x1 = min(xs), max(xs); beats = (t - 2 * BAR) / (BAR / 4)
    fillx = x0 + (x1 - x0) * cl((math.floor(beats) + ease(beats % 1)) / 4) if t > 2 * BAR else x0
    earth = (f'<defs><clipPath id="fillc"><rect x="0" y="0" width="{fillx:.0f}" height="1080"/></clipPath></defs>'
             f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in lk)}" fill="#BFA77E" stroke="#2A211B" stroke-width="3" clip-path="url(#fillc)"/>'
             + ''.join(f'<line x1="{x0 + (x1 - x0) * k / 14:.0f}" y1="{min(p[1] for p in lk):.0f}" x2="{x0 + (x1 - x0) * k / 14 - 60:.0f}" y2="{max(p[1] for p in lk):.0f}" stroke="#A88F66" stroke-width="3" clip-path="url(#fillc)" opacity=".7"/>' for k in range(15)))
    a_lake = 1 - ease((t - 2.75 * BAR) / (.25 * BAR))                 # the sunset scene hands over to the morning square at the end of bar 3
    # the Colosseum rises one tier per bar (bars 4, 5, 6), the build line eased onto each downbeat
    k = (t - 3 * BAR) / BAR; lvl = cl((math.floor(k) + eio(min(1, (k % 1) / .7))) / 3) if t > 3 * BAR else 0
    yb, yt = 760, 175; yc = yb - (yb - yt) * lvl
    ex = [HB.P3(*(lambda X, Z: (X, 0, Z))(*HB.ring(HB.A_C, HB.B_C, k2 * math.pi / 90)))[0] for k2 in range(180)
          if HB.ring(HB.A_C, HB.B_C, k2 * math.pi / 90)[1] + HB.D > 1]
    sx0, sx1 = min(ex) + 30, max(ex) - 30; nP = int((sx1 - sx0) / 54)
    scaf = '' if lvl in (0, 1) else (f'<g opacity=".95">'
            + ''.join(f'<line x1="{sx0 + (sx1 - sx0) * i / nP:.0f}" y1="{yc - 46:.0f}" x2="{sx0 + (sx1 - sx0) * i / nP:.0f}" y2="{yc + 24:.0f}" stroke="#8A6A48" stroke-width="5"/>' for i in range(nP + 1))
            + f'<line x1="{sx0:.0f}" y1="{yc - 40:.0f}" x2="{sx1:.0f}" y2="{yc - 40:.0f}" stroke="#8A6A48" stroke-width="5"/><line x1="{sx0:.0f}" y1="{yc - 8:.0f}" x2="{sx1:.0f}" y2="{yc - 8:.0f}" stroke="#8A6A48" stroke-width="4"/></g>')
    a_crowd = ease((t - 5.3 * BAR) / (.5 * BAR))
    z, px, py = 1.0, 0.0, 0.0
    return ('<div id="f" style="position:relative;width:1920px;height:1080px;overflow:hidden;background:#000">'
            + f'<div style="position:absolute;inset:0;transform-origin:960px 600px;transform:translate({px:.1f}px,{py:.1f}px) scale({z:.4f})">'
            + svg(d, back, f'opacity:{1 - a_lake:.3f}')
            + svg(d, col)
            + svg('', crowd, f'opacity:{a_crowd:.3f}')
            + svg('', fam, f'opacity:{a_crowd:.3f}')
            + svg('', front, f'opacity:{1 - a_lake:.3f}')
            + f'<div style="position:absolute;inset:0;opacity:{a_lake:.3f}">' + lake_svg.replace('</svg>', earth + '</svg>') + '</div></div></div>')

# ------------------------------------------------------------------------------------------------ the Colosseum under construction
TOP = 46.4
def colosseum_build(g, R, pal, defs_out, prog, t):
    """HB.colosseum drawn part-built: each bay's wall stands at its own height (a building front sweeping round the ring,
    rising in stone courses on the beat); arches turned on timber centring; scaffolding and treadwheel cranes on the bays
    still being built; masts, flags and hangings only when it is finished."""
    A, B = HB.A_C, HB.B_C; vis = HB.vis_ts(A, B, 1440)
    def S(tt, Y): X, Z = HB.ring(A, B, tt); return HB.P3(X, Y, Z)
    wall = [S(tt, 48) for tt in vis] + [S(tt, 0) for tt in vis[::-1]]; xs = [p[0] for p in wall]; x0, x1 = min(xs), max(xs)
    tnear = max(vis, key=lambda tt: HB.facing(A, B, tt)); xnear = S(tnear, 0)[0]
    defs_out.append(f'<linearGradient id="r_wall" gradientUnits="userSpaceOnUse" x1="{x0:.0f}" y1="0" x2="{x1:.0f}" y2="0"><stop offset="0" stop-color="{pal["w0"]}"/>'
                    f'<stop offset="{(xnear - x0) / (x1 - x0):.2f}" stop-color="{pal["w1"]}"/><stop offset=".86" stop-color="{pal["w2"]}"/><stop offset="1" stop-color="{pal["w3"]}"/></linearGradient>')
    bt, Lb = HB.bays(A, B, 80, 4000, t0=tnear - math.pi)
    info = []
    for k in range(80):
        ta, tb = bt[k], bt[k + 1]; ca, cb = HB.facing(A, B, ta), HB.facing(A, B, tb)
        if max(ca, cb) <= 0: continue
        info.append((k, ta, tb, (ca + cb) / 2))
    order = sorted(info, key=lambda r: S(r[1], 0)[0]); rank = {r[0]: i / max(1, len(order) - 1) for i, r in enumerate(order)}
    COURSE = 1.2
    def height(k):   # the building front sweeps left → right, a step behind; heights snap to stone courses
        h = TOP * cl(prog * 1.35 - .35 * rank[k]); return min(TOP, math.floor(h / COURSE) * COURSE) if h < TOP else TOP
    HK = {k: height(k) for k, *_ in info}
    done = prog >= .999
    if prog < .35:   # the foundation trench, marked out before the walls go up
        g.append(HB.line([S(tt, 0) for tt in vis], '#8A6A48', 6, f'opacity="{1 - prog / .35:.2f}"')); g.append(HB.line([S(tt, 0) for tt in vis], '#5E4632', 2, 'stroke-dasharray="10 8"'))
    # stone piles on the ground (shrinking as it rises)
    for i, tt in enumerate(vis[::160]):
        X, Z = HB.ring(A + 6, B + 6, tt); p = HB.P3(X, 0, Z); s = HB.FL / (Z + HB.D); n = int(5 * (1 - prog))
        for j in range(n): g.append(HB.poly([(p[0] + (j - n / 2) * s * 1.1, p[1]), (p[0] + (j - n / 2 + 1) * s * 1.1, p[1]), (p[0] + (j - n / 2 + 1) * s * 1.1, p[1] - s), (p[0] + (j - n / 2) * s * 1.1, p[1] - s)], '#E2D3B0', HB.INK, 1.2))
    for k, ta, tb, cm in info:   # the wall, bay by bay, up to its height
        Yb = HK[k]
        if Yb <= 0: continue
        g.append(HB.poly([S(ta, 0), S(tb, 0), S(tb, Yb), S(ta, Yb)], 'url(#r_wall)', HB.INK, 2))
        g.append(HB.line([S(ta, Yb), S(tb, Yb)], HB.INK, 3))
    for k, ta, tb, cm in info:   # arches: open when finished, on timber centring while the crown is being turned
        if cm < .1: continue
        Yb = HK[k]; sw = 2.2 if cm > .45 else 1.5
        def Q(w, Y): return S(ta + (tb - ta) * w, Y)
        right_side = Q(1, 0)[0] > Q(0, 0)[0]
        for si, (y0, y1, sill, crown) in enumerate(HB.STOREYS):
            if Yb <= sill: break
            w0, w1 = .5 - HB.KW / 2, .5 + HB.KW / 2
            def archp(w0, w1, sl, cr):
                rr = (w1 - w0) * Lb / 2; sp = cr - rr; c = (w0 + w1) / 2
                return [Q(w0, sl)] + [Q(c - (w1 - w0) / 2 * math.cos(math.pi * i / 10), sp + rr * math.sin(math.pi * i / 10)) for i in range(11)] + [Q(w1, sl)]
            rr = (w1 - w0) * Lb / 2; spring = crown - rr
            if Yb >= crown:
                g.append(HB.poly(archp(w0, w1, sill, crown), pal['jamb'], HB.INK, sw))
                d = HB.KW * min(.42, (1 - cm) * .8); far_right = Q(.5, 0)[0] < xnear
                inner = archp(w0, w1 - d, sill, crown - .2) if far_right == right_side else archp(w0 + d, w1, sill, crown - .2)
                g.append(HB.poly(inner, pal['open'], 'none', 0))
            else:   # the opening so far, and the wooden centring waiting for the voussoirs
                top_ = min(Yb, spring)
                g.append(HB.poly([Q(w0, sill), Q(w1, sill), Q(w1, top_), Q(w0, top_)], pal['open'], HB.INK, sw))
                if Yb > spring - 1.5:
                    c_ = [Q(.5 - (w1 - w0) / 2 * math.cos(math.pi * i / 10), spring + rr * math.sin(math.pi * i / 10)) for i in range(11)]
                    g.append(HB.line(c_, '#9A7044', max(2.5, sw * 1.8)))
                    for i in (2, 5, 8): g.append(HB.line([Q(.5 - (w1 - w0) / 2 * math.cos(math.pi * i / 10), spring), c_[i]], '#9A7044', 1.6))
    for k, ta, tb, cm in info:   # engaged columns, storey by storey, as far as they are built
        if cm < .1 or k == info[0][0]: continue
        Yb = HK[k]; dt = tb - ta; cw = .62 / Lb
        def Bq(dw, Y): return S(ta + dt * dw, Y)
        col = pal['pil'] if (HB.nrm(A, B, ta)[0] * HB.LIGHT[0] + HB.nrm(A, B, ta)[1] * HB.LIGHT[1]) > .2 else pal['pil_d']; sw = 2 if cm > .45 else 1.4
        for (y0, y1, sill, crown) in HB.STOREYS:
            if Yb <= y0 + .3: break
            g.append(HB.poly([Bq(-cw, y0 + .3), Bq(cw, y0 + .3), Bq(cw, min(Yb, y1 - .6)), Bq(-cw, min(Yb, y1 - .6))], col, HB.INK, sw))
    for y0, y1 in HB.BANDS:   # entablatures where the wall has reached them
        for k, ta, tb, cm in info:
            if HK[k] >= y1: g.append(HB.poly([S(ta, y1), S(tb, y1), S(tb, y0), S(ta, y0)], pal['band'], HB.INK, 1.6))
    # scaffolding on the bays being built: poles, ledgers at each lift, a few braces
    for k, ta, tb, cm in info:
        Yb = HK[k]
        if Yb >= TOP or Yb <= 0 or cm < .12: continue
        X, Z = HB.ring(A + 1.4, B + 1.4, ta); s = HB.FL / (Z + HB.D)
        p0, p1 = HB.P3(X, 0, Z), HB.P3(X, Yb + 3.2, Z); g.append(HB.line([p0, p1], '#8A6A48', max(1.6, s * .22)))
        X2, Z2 = HB.ring(A + 1.4, B + 1.4, tb)
        for lift in range(3, int(Yb + 3), 3):
            g.append(HB.line([HB.P3(X, lift, Z), HB.P3(X2, lift, Z2)], '#8A6A48', max(1.4, s * .18)))
        if k % 3 == 0: g.append(HB.line([HB.P3(X, 0, Z), HB.P3(X2, min(Yb, 9), Z2)], '#7A5A3A', max(1.2, s * .14)))
    # treadwheel cranes on the wall top where the work is (a block goes up on every beat)
    front = [r for r in info if 0 < HK[r[0]] < TOP and r[3] > .35]
    for r in front[::max(1, len(front) // 3)][:3]:
        k, ta, tb, cm = r; Yb = HK[k]; X, Z = HB.ring(A - 1.5, B - 1.5, (ta + tb) / 2); s = HB.FL / (Z + HB.D); base = HB.P3(X, Yb, Z)
        top_ = (base[0] + s * 1.5, base[1] - s * 8.5); g.append(HB.line([base, top_], '#7A5A3A', max(2, s * .35)))
        g.append(HB.line([(base[0] + s * 3, base[1]), top_], '#7A5A3A', max(2, s * .3)))
        jib = (top_[0] - s * 5, top_[1] + s * 1.5); g.append(HB.line([top_, jib], '#7A5A3A', max(2, s * .3)))
        g.append(HB.ell(base[0] + s * 1.6, base[1] - s * 2.2, s * 2.0, s * 2.0, 'none', '#7A5A3A', max(2, s * .3)))
        ph = (t / .418) % 1.0; by = base[1] + s * 9 - (s * 9 + 1.5 * s) * ease(min(1, ph / .8))   # the block rises from the ground to the wall top
        g.append(HB.line([jib, (jib[0], by)], HB.INK, 1.2))
        g.append(HB.poly([(jib[0] - s * .8, by), (jib[0] + s * .8, by), (jib[0] + s * .8, by + s * 1.1), (jib[0] - s * .8, by + s * 1.1)], '#E2D3B0', HB.INK, 1.4))
    if done:   # finished: attic, masts and flags, hangings
        for k, ta, tb, cm in info:
            if cm < .2: continue
            def Q(w, Y): return S(ta + (tb - ta) * w, Y)
            if k % 2: g.append(HB.poly([Q(.4, 38.6), Q(.6, 38.6), Q(.6, 41.8), Q(.4, 41.8)], pal['open'], HB.INK, 1.5))
            else: g.append(HB.poly([Q(.5 + .14 * math.cos(a), 40.2 + 1.1 * math.sin(a)) for a in [2 * math.pi * i / 12 for i in range(12)]], pal['shield'], HB.INK, 1.5))
        FLAGS = ['#B8322A', '#E9B64C', '#F4EEE2', '#3E5A8C']
        for k, ta, tb, cm in info:
            if cm < .12: continue
            X, Z = HB.ring(A, B, ta); s = HB.FL / (Z + HB.D); b_ = HB.P3(X, 46.0, Z); t_ = HB.P3(X, 52.5, Z)
            g.append(HB.line([b_, t_], HB.INK, max(1.6, s * .28)))
            if k % 2 == 0: c = FLAGS[(k // 2) % 4]; fw = s * 2.4; g.append(HB.poly([t_, (t_[0] + fw, t_[1] + fw * .22), (t_[0], t_[1] + fw * .5)], c, HB.INK, 1.4))
    return [r for r in info if r[3] > .1], bt, Lb, tnear, xnear

if __name__ == '__main__':
    os.makedirs(f'{OUT}/f', exist_ok=True); n = int(round(DUR * FPS))
    only = [int(x) for x in sys.argv[1:]]
    with sync_playwright() as pw:
        br = pw.chromium.launch(); pg = br.new_page(viewport={'width': 1920, 'height': 1080})
        pg.set_content('<html><body style="margin:0;background:#000"><div id="root"></div></body></html>')
        for i in (only or range(n)):
            pg.evaluate('s => document.getElementById("root").innerHTML = s', frame_html(i / FPS))
            pg.locator('#f').screenshot(path=f'{OUT}/f/{i:04d}.jpg', type='jpeg', quality=90)
        br.close()
    print('frames', len(only) or n, OUT)

