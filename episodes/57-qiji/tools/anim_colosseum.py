"""ep57 example (owner 09:08: "do something similar to before, recreate those scenes"): the 斗兽场 story drawing
(hist_b.colosseum_return) re-drawn for every frame in its own style, built to move:
- the camera dollies in and orbits a little (the drawing's own 3D projection changes each frame),
- every Roman walks along their stream to the ground arches, legs stepping with the beat, and goes in under the arch,
- the clouds drift, the father on the terrace points, the child bobs.
usage: anim_colosseum.py [frames]   → scratchpad sb57/shots/colosseum_R/f/*.jpg + sheet.jpg (5.016 s at 30 fps)"""
import os, sys, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hist_b as HB
from playwright.sync_api import sync_playwright

OUT = '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/sb57/shots/colosseum_R'
FPS, DUR, BEAT = 30, 5.016, 0.418
D0, PHI0 = HB.D, HB.PHI
def ease(x): x = min(1, max(0, x)); return x * x * (3 - 2 * x)

def frame_svg(t):
    u = t / DUR
    HB.D = D0 - 26 * ease(u); HB.PHI = PHI0 + math.radians(5) * (u - .5)          # the camera: dolly in + slow orbit
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
    for cx_, cy_, w in [(1640, 300, 54), (1760, 420, 40), (300, 470, 46)]:          # clouds drift
        cx_ += 40 * t
        g.append(HB.poly(HB.blob(R, cx_, cy_, w, 10, .18), pal['cloud'], 'none', 0, 'opacity=".9"'))
        g.append(HB.poly(HB.blob(R, cx_ + w * .8, cy_ + 6, w * .65, 9, .15), pal['cloud'], 'none', 0, 'opacity=".9"'))
    HB.backdrop(g, R, pal, palace=False)
    for zr in [100, 108, 117, 127, 138, 150, 163]:
        y = HB.HY + HB.FL * HB.HC / zr; g.append(HB.line([(0, y), (1920, y)], '#B9A780', 1.5, 'opacity=".55"'))
    dfs = []; info, bt, Lb, tnear, xnear = HB.colosseum(g, R, pal, dfs); defs.extend(dfs)
    TOPS = ['#E9E0CB', '#D8C7A2', '#B9473A', '#C98F45', '#5B6E8E', '#7C7A48', '#8E5B3E', '#F1EBDD', '#A4643F', '#3F5A73', '#C7B07A']
    SK = ['#C99572', '#B07F62', '#D9A88C', '#8E5E45']; HR = ['#2A211B', '#3A2A20', '#5A3A26', '#1A1512']
    crowd = []; gates = [x for x in info if x[3] > .3]
    for k, ta, tb, cm in gates[1::2]:
        tm = (ta + tb) / 2; EX, EZ = HB.ring(HB.A_C + 1.0, HB.B_C + 1.0, tm)
        SX, SZ = EX * .5 + R.uniform(-20, 20), -HB.D + R.uniform(92, 100)
        for j in range(R.randint(16, 24)):
            u0 = R.random() ** .8; jx, jz = R.uniform(-1.8, 1.8), R.uniform(-1.2, 1.2)
            uu = (u0 + .07 * t) % 1.0                                                 # everyone walks toward the arch
            X = SX + (EX - SX) * uu + jx * (1.5 - uu); Z = SZ + (EZ - SZ) * uu + jz
            crowd.append((X, Z, 0, uu, j))
        for j in range(4): crowd.append((EX + R.uniform(-1.3, 1.3), EZ + R.uniform(.5, 1.6), 1, 1.0, j))
    for _ in range(40):
        X, Z = R.uniform(-115, 75), -HB.D + R.uniform(93, 150)
        if ((X * math.cos(HB.PHI) + Z * math.sin(HB.PHI)) / HB.A_C) ** 2 + ((-X * math.sin(HB.PHI) + Z * math.cos(HB.PHI)) / HB.B_C) ** 2 > 1.12: crowd.append((X, Z, 0, .5, 0))
    for X, Z, door, uu, j in sorted(crowd, key=lambda p: -p[1]):
        zr = Z + HB.D; x, y = HB.P3(X, 0, Z); h = HB.FL * 1.7 * 1.3 / zr * R.uniform(.92, 1.05)
        if 110 < x < 730 and y > 925: continue
        kind = 'tunic' if R.random() < .7 else 'stola'
        top = R.choice(['#F1EBDD', '#E9E0CB', '#E8C36A', '#E2A15C']) if door else R.choice(TOPS)
        ph = R.uniform(.2, .8)                                                        # (keeps the random sequence) → step phase
        stride = .85 * math.sin(2 * math.pi * (t / (2 * BEAT) + ph))                  # one step per beat
        fade = 1.0 if uu < .93 else max(0, (1 - uu) / .07)                            # in under the arch
        n0 = len(g)
        HB.tiny(g, x, y - abs(stride) * h * .03, h, top, R.choice(HR), R.choice(SK), stride, kind, R.choice(['#C9B48A', '#8E5B3E', '#5B6E8E', '#E9E0CB']) if kind == 'stola' else None)
        if fade < 1: g[n0:] = [f'<g opacity="{fade:.2f}">' + ''.join(g[n0:]) + '</g>']
    HB.slope(g, R, pal); HB.stone_pine(g, R, 70, 1080, 470, 170, pal); HB.terrace(g, pal)
    pt = (1788 - 30 * math.sin(t * 2.2), 790 - 70 * ease(t / 1.2) + 12 * math.sin(t * 3))   # the father points at the new arena
    HB.roman(g, 1692, 944, 340, 'stola', '#B9573E', '#D9A88C', '#3A2A20', palla='#6F83A6')
    HB.roman(g, 1846, 942, 382, 'toga', '#F1EADA', '#B98060', '#2A1F1A', left=pt)
    HB.roman(g, 1760, 946 - 10 * abs(math.sin(math.pi * t / BEAT)), 200, 'tunic', '#E3C67A', '#C99572', '#5A3A26', child=True, left=(1700, 760 - 20 * abs(math.sin(math.pi * t / BEAT))))
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs>{"".join(defs)}</defs>' + ''.join(g) + '</svg>'

if __name__ == '__main__':
    os.makedirs(f'{OUT}/f', exist_ok=True); n = int(sys.argv[1]) if len(sys.argv) > 1 else int(round(DUR * FPS))
    with sync_playwright() as pw:
        br = pw.chromium.launch(); pg = br.new_page(viewport={'width': 1920, 'height': 1080})
        pg.set_content('<html><body style="margin:0;background:#000"><div id="f" style="width:1920px;height:1080px"></div></body></html>')
        for i in range(n):
            pg.evaluate('s => document.getElementById("f").innerHTML = s', frame_svg(i / FPS))
            pg.locator('#f').screenshot(path=f'{OUT}/f/{i:04d}.jpg', type='jpeg', quality=90)
        br.close()
    print('frames', n, OUT)
