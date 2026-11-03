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
    u = eio(t / DUR); HB.D = D0 + 26 - 60 * u; HB.PHI = PHI0 + math.radians(-9 + 18 * u)

def lake_layer():
    lk = HB.colosseum_nero_lake(); body = [e for e in CAP['body'] if '尼禄的私人湖' not in e]
    return svg(CAP['defs'], body), lk

def return_layers(t, tl):
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
    back = len(g); dfs = []; info, bt, Lb, tnear, xnear = HB.colosseum(g, R, pal, dfs); defs.extend(dfs); col = len(g)
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
    d, back, col, crowd, fam, front = return_layers(t, tl)
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
    u = eio(t / DUR); z = 1.10 + .12 * u; px = 60 - 120 * u; py = -16 * u
    return ('<div id="f" style="position:relative;width:1920px;height:1080px;overflow:hidden;background:#000">'
            + f'<div style="position:absolute;inset:0;transform-origin:960px 600px;transform:translate({px:.1f}px,{py:.1f}px) scale({z:.4f})">'
            + svg(d, back, f'opacity:{1 - a_lake:.3f}')
            + svg(d, col, f'clip-path:inset({yc:.1f}px 0 0 0)')
            + svg('', [scaf])
            + svg('', crowd, f'opacity:{a_crowd:.3f}')
            + svg('', fam, f'opacity:{a_crowd:.3f}')
            + svg('', front, f'opacity:{1 - a_lake:.3f}')
            + f'<div style="position:absolute;inset:0;opacity:{a_lake:.3f}">' + lake_svg.replace('</svg>', earth + '</svg>') + '</div></div></div>')

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
