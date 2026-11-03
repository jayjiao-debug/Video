"""Export the 泰姬陵 history scenes for the Remotion build (Q57TAJ.tsx), in the language of hist_c.py (flat colour, ink
#2A211B, warm rim light, faceless figures). Everything is written inline into one JSON (layers as SVG markup, sprites
drawn at their origin, anchors), so Remotion can stack them in one <svg> without waiting for image loads:
  shot A  the building site seen from the south (fixed camera): sky, the Yamuna, the far bank, the site ground, trees;
          the red-sandstone terrace and Shah Jahan (body and head apart, so the head can lift); worker / ox-cart sprites.
          The Taj itself, the scaffolds, cranes and the elephant are built live in TSX from hist_c.taj()'s geometry.
  shot B  dusk from the river: Agra Fort's Musamman Burj (the old emperor in its window, a guard), the river bend, the
          Taj far off; the crypt with her cenotaph, and his cenotaph in four parts that Remotion sets down one by one.
Writes ../../37-qiqing/remotion/public/ep57/taj/taj.json (+ a preview SVG per shot). Run: python3 export_taj.py"""
import os, sys, json, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hist_c as HC
from hist_c import (INK, GOLD, CREAM, W, H, pts, poly, line, lerp, ell, grad, rgrad, curve, path, marks, arch_d, dome,
                    tf, TP, limb, bar, figure, emperor_stand, emp_head, emperor_seat, taj, edge_y, TAJ_DUSK, TAJ_GLOW)
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../37-qiqing/remotion/public/ep57/taj')
os.makedirs(OUT, exist_ok=True)
J = dict(layers={}, sprites={}, A={}, B={})
def S(els): return ''.join(els)
def layer(name, defs, body): J['layers'][name] = dict(defs=S(defs), body=S(body))

# ---------------- shared scenery helpers ----------------
def crown(g, R, cx, cy, r, c0, c1, rim=None, sw=2.5, n=6):
    """a clumpy broadleaf crown (mango / neem): overlapping blobs with one ink outline, a lit cluster, a rim on the right"""
    bl = []
    for i in range(n):
        a = math.pi * (1.05 + .9 * i / (n - 1)); d = r * R.uniform(.38, .55)
        bl.append((cx + d * math.cos(a) * 1.25, cy + d * math.sin(a) * .75 + r * .1, r * R.uniform(.5, .66)))
    bl.append((cx, cy + r * .15, r * .62))
    g += [f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{rr:.1f}" fill="{c0}" stroke="{INK}" stroke-width="{2 * sw}"/>' for x, y, rr in bl]
    g += [f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{rr:.1f}" fill="{c0}"/>' for x, y, rr in bl]
    for x, y, rr in bl[:-1]:
        if x > cx - r * .2: g.append(f'<circle cx="{x + rr * .18:.1f}" cy="{y - rr * .2:.1f}" r="{rr * .62:.1f}" fill="{c1}" opacity=".9"/>')
    if rim:
        for x, y, rr in bl:
            if x > cx: g.append(path(f'M{x + rr * .2:.1f},{y - rr * .98:.1f} A{rr:.1f},{rr:.1f} 0 0 1 {x + rr * .97:.1f},{y + rr * .2:.1f}', 'none', rim, 2.5, 'opacity=".75"'))
def tree(g, R, x, base, h, r, c0, c1, trunk='#5E4632', rim=None):
    g += bar([(x, base), (x + R.uniform(-6, 6), base - h * .55), (x + R.uniform(-8, 8), base - h + r * .4)], trunk, max(5, r * .16), 2)
    crown(g, R, x, base - h, r, c0, c1, rim)
def palm(g, x, base, h, lean, c0='#4E5E3A', c1='#6C7C48', trunk='#7A5A3E', sw=2):
    top = (x + lean, base - h); mid = (x + lean * .3, base - h * .5)
    g.append(path(f'M{x - 5},{base} Q{mid[0] - 5:.1f},{mid[1]:.1f} {top[0] - 3:.1f},{top[1]:.1f} L{top[0] + 3:.1f},{top[1]:.1f} Q{mid[0] + 5:.1f},{mid[1]:.1f} {x + 5},{base} Z', trunk, INK, sw))
    for i in range(1, 9):
        u = i / 9; p = (x + (top[0] - x) * u * u, base - h * u)
        g.append(line([(p[0] - 4.5, p[1]), (p[0] + 4.5, p[1] - 1)], '#5A4030', 1.5))
    for a, L, droop in ((-170, 70, 22), (-140, 62, 26), (-110, 46, 18), (-70, 48, 18), (-40, 64, 26), (-10, 72, 22), (-90, 30, 6)):
        r_ = math.radians(a); e = (top[0] + L * math.cos(r_), top[1] + L * math.sin(r_) + droop)
        m = (top[0] + L * .55 * math.cos(r_), top[1] + L * .55 * math.sin(r_) - 8)
        nx, ny = -(e[1] - top[1]) / L * 7, (e[0] - top[0]) / L * 7
        g.append(path(f'M{top[0]:.1f},{top[1]:.1f} Q{m[0] + nx:.1f},{m[1] + ny:.1f} {e[0]:.1f},{e[1]:.1f} Q{m[0] - nx:.1f},{m[1] - ny:.1f} {top[0]:.1f},{top[1]:.1f} Z',
                      c0 if a < -90 else c1, INK, sw))
def scallops(R, x0, x1, y, hmin, hmax, wmin=24, wmax=50, tall=.12):
    d_ = f'M{x0},{y}'; x = x0
    while x < x1:
        w_ = R.uniform(wmin, wmax); hh = R.uniform(hmin, hmax) * (1.6 if R.random() < tall else 1); d_ += f' Q{x + w_ / 2:.0f},{y - hh * 2:.0f} {x + w_:.0f},{y}'; x += w_
    return d_
def tufts(g, R, n, x0, x1, y0, y1, col='#6E7A44', k=1.0, avoid=lambda x, y: False):
    out = []
    while len(out) < n:
        x, y = R.uniform(x0, x1), R.uniform(y0, y1)
        if avoid(x, y): continue
        out.append((x, y))
    for x, y in sorted(out, key=lambda p: p[1]):
        s = k * (.6 + .5 * (y - y0) / max(1, y1 - y0))
        g.append(f'<g transform="translate({x:.1f},{y:.1f}) scale({s:.2f})"><path d="M-7,0 L-3,-15 L-1,0 L2,-19 L4,0 L8,-12 L10,0 Z" fill="{col}" stroke="{INK}" stroke-width="1.2"/></g>')
def block(g, x, y, w, h, c='#F1ECE6', side='#CFC6C6', sw=2.5):
    g.append(poly([(x, y), (x + w, y), (x + w, y - h), (x, y - h)], c, INK, sw))
    g.append(poly([(x + w * .7, y), (x + w, y), (x + w, y - h), (x + w * .7, y - h)], side, 'none', 0))
    g.append(poly([(x, y), (x + w, y), (x + w, y - h), (x, y - h)], 'none', INK, sw))
def sprite(name, els, drop_shadow=False): J['sprites'][name] = S(els[1:] if drop_shadow else els)

# ================= shot A: the building site, 1631 → 1653 =================
CX, BY, K = 1030, 870, 2.15          # the Taj (local units of hist_c.taj: plinth top y 0, finial -232)
J['A'].update(CX=CX, BY=BY, K=K, pal=TAJ_DUSK, brick=dict(TAJ_DUSK, shade='#8E4A38', mid='#B0634A', lit='#C47458', fshade='#84463A', fmid='#A55E48',
              flit='#B86C54', band='#9A5440', open='#5E2E24', frame='#874634', drum='#B0634A', dome_m='#B0634A', dome_l='#C47458', dome_s='#8E4A38',
              chamL='#9C5542', chamR='#BC6E54', face='#B0634A', recess='#6A3428', deep='#5A2C22', door='#4A2420', openL='#6A3428', openR='#7A3E2E'))
R = random.Random(5711)
defs = [grad('a_sky', [(0, '#8C88A6'), (.45, '#BFA0A4'), (.8, '#E6B898'), (1, '#F0CFA6')], 0, 0, 0, 800, True),
        grad('a_earth', [(0, '#C99C78'), (.35, '#BE8E6C'), (1, '#9C6C52')], 0, 846, 0, 1080, True),
        grad('a_river', [(0, '#EBC9AC'), (.5, '#D4B0A4'), (1, '#AE96A6')], 0, 796, 0, 848, True),
        rgrad('a_sun', [(0, '#FFF0D2', .95), (.25, '#FFDCA8', .6), (1, '#F6B888', 0)])]
g = [f'<rect width="{W}" height="{H}" fill="url(#a_sky)"/>']
SUN = (1745, 706); J['A']['sun'] = SUN
g.append(ell(SUN[0], SUN[1], 340, 300, 'url(#a_sun)')); g.append(f'<circle cx="{SUN[0]}" cy="{SUN[1]}" r="44" fill="#FFF3DA" opacity=".92"/>')
for i, y in enumerate((520, 585, 650, 712)):   # haze bands
    g.append(poly([(0, y), (1920, y - 20), (1920, y + 18), (0, y + 30)], '#F6DCC0', 'none', 0, f'opacity="{.14 + i * .06:.2f}"'))
g.append(path(scallops(R, -20, 1940, 784, 4, 10, 40, 80, .2) + ' L1940,800 L-20,800 Z', '#C2AAB2', 'none', 0, 'opacity=".8"'))   # the farthest trees
for x in (140, 214, 1268, 1330, 1500):   # a few palms and tall trees on the far bank, in the haze
    gp = []; palm(gp, x, 796, R.uniform(46, 62), R.uniform(-8, 8), '#9C8494', '#AC94A2', '#94808C', 1.4); g += gp
for x, r in ((380, 16), (560, 20), (860, 15), (1580, 18), (1860, 16)):
    g.append(f'<circle cx="{x}" cy="{796 - r * 1.5}" r="{r}" fill="#A38C98" stroke="#86707E" stroke-width="1.6"/>')
g.append(path(scallops(R, -20, 1940, 798, 5, 14) + ' L1940,806 L-20,806 Z', '#A38C98', '#86707E', 2))   # the far bank
g.append(poly([(-10, 803), (1930, 803), (1930, 848), (-10, 848)], 'url(#a_river)', 'none', 0))   # the Yamuna
g.append(marks([((SUN[0] - w / 2 + R.uniform(-6, 6), y), (SUN[0] + w / 2 + R.uniform(-6, 6), y)) for y, w in ((809, 70), (815, 56), (822, 80), (829, 50), (836, 64), (842, 40))], '#FFF2DA', 3, 'opacity=".85"'))
g.append(marks([((x, y), (x + R.uniform(18, 46), y)) for y in range(810, 846, 7) for x in [R.uniform(0, 1880) for _ in range(5)]], '#F8E2D0', 2, 'opacity=".5"'))
g.append(path('M-10,848 ' + ' '.join(f'L{x},{848 + 2.5 * math.sin(x * .02):.1f}' for x in range(0, 1940, 40)) + ' L1930,1090 L-10,1090 Z', 'url(#a_earth)', INK, 2.5))
g.append(poly([(-10, 848), (1930, 848), (1930, 856), (-10, 856)], '#A9805E', 'none', 0, 'opacity=".55"'))   # the bank lip
for x, y, rx, ry in ((780, 952, 200, 12), (1240, 968, 260, 14), (1680, 905, 180, 8), (600, 875, 120, 6), (1450, 1068, 300, 10)):   # worn ground
    g.append(ell(x, y, rx, ry, '#D6AE86', 'opacity=".45"'))
g.append(marks([((x, 937), (x + 46, 937)) for x in range(1440, 1930, 70)] + [((x, 943), (x + 46, 943)) for x in range(1470, 1930, 70)], '#8E6448', 2, 'opacity=".5"'))   # cart ruts
g.append(marks([((x, 1046), (x + 60, 1046)) for x in range(980, 1930, 96)], '#8E6448', 2.5, 'opacity=".45"'))   # the sled's track
# trees on the near bank: a clump right (into the low sun) and one behind the terrace, all clear of the building
for x, h, r in ((1622, 196, 64), (1748, 236, 78), (1872, 204, 70)):
    tree(g, R, x, 884, h, r, '#4E5A36', '#6E7A46', rim='#FFD9A8')
gp = []; palm(gp, 1690, 884, 250, 18, sw=2.2); g += gp
for x, h, r in ((470, 210, 70), (556, 172, 56)):
    tree(g, R, x, 888, h, r, '#55603A', '#73804A', rim='#F2C69A')
tufts(g, R, 40, 1580, 1920, 862, 900, k=1.1)
tufts(g, R, 18, 580, 640, 860, 900, k=1.0)
tufts(g, R, 30, 1500, 1920, 1050, 1080, k=1.5)
layer('a_back', defs, g)

# the foreground: the red-sandstone terrace Shah Jahan stands on, his glow
defs = [grad('a_terrace', [(0, '#A24E36'), (1, '#6E2E22')], 0, 950, 0, 1080, True), rgrad('a_glow', [(0, '#FFE2B8', .5), (1, '#FFE2B8', 0)])]
g = [ell(318, 650, 290, 350, 'url(#a_glow)')]
g.append(poly([(-10, 956), (584, 956), (584, H + 10), (-10, H + 10)], 'url(#a_terrace)', INK, 3))
g.append(poly([(-10, 934), (556, 934), (584, 956), (-10, 956)], '#C26A48', INK, 3))
g.append(line([(-10, 937), (556, 937)], '#E08A62', 2.5, 'opacity=".8"'))
g.append(path(' '.join(f'M{x},970 L{x},1066 M{x + 64},970 L{x + 64},1066' for x in range(18, 540, 92)), 'none', '#5A221A', 2, 'opacity=".55"'))
layer('a_front', defs, g)
# Shah Jahan, mourning: the body, and the head (turban, plume) drawn upright so Remotion can turn it about the nape
EX, EY, EK = 300, 946, 4.6
Te = tf(EX, EY, EK, 1); bowed = set(emp_head(Te, (2, -79), 22, '#1F161A', '#F7BE86', EK, 3))
layer('a_emp_body', [], [e for e in emperor_stand(EX, EY, EK, 1, rim='#F7BE86', sw=3, bow=22) if e not in bowed])
layer('a_emp_head', [], emp_head(Te, (2, -79), 0, '#1F161A', '#F7BE86', EK, 3))
J['A']['emp_pivot'] = Te((2, -79)); J['A']['emp_head'] = Te((6, -98))

# the elephant, in parts (legs turn about their hips in Remotion); local origin at its feet, facing left
KE = 1.3
el, _ = HC.elephant(0, 0, KE, -1, rim='#FFD9A8')
J['A']['ele'] = dict(k=KE, shadow=el[0], far=[el[1], el[2]], near=[S(el[3:5]), S(el[5:7])], body=S(el[7:]),
                     hips_far=[tf(0, 0, KE, -1)((10, -46)), tf(0, 0, KE, -1)((-34, -48))], hips_near=[tf(0, 0, KE, -1)((22, -46)), tf(0, 0, KE, -1)((-46, -50))],
                     strap=tf(0, 0, KE, -1)((26, -72)), rear=tf(0, 0, KE, -1)((-60, -62)))
# workers (all drawn at their final size: they only glide)
W_ = dict(robe='#E6D8C0', head='turban', skin='#6E4430')
for nm, k, f, pose, wrap, kw in (('mason_pick_r', .42, 1, 'pick', '#C4472E', {}), ('mason_pick_l', .42, -1, 'pick', '#E8B04A', {}),
                                 ('mason_carry_r', .42, 1, 'carry', '#8E3A2E', {}), ('mason_carry_l', .42, -1, 'carry', '#C4472E', {}),
                                 ('mason_hold_l', .42, -1, 'hold', '#E8B04A', {})):
    sprite(nm, figure(0, 0, k, f, wrap=wrap, pose=pose, sw=1.4, **W_, **kw)[0], drop_shadow=True)
for nm, k, f, pose, wrap, kw in (('pusher_a', .78, -1, 'push', '#C4472E', dict(lean=.22, rim='#FFD9A8')), ('pusher_b', .78, -1, 'push', '#E8B04A', dict(lean=.22, rim='#FFD9A8')),
                                 ('carrier', .5, 1, 'carry', '#8E3A2E', dict(rim='#FFD9A8')), ('digger', .5, -1, 'pick', '#C4472E', dict(tool='pick', rim='#FFD9A8')),
                                 ('driver', .44, -1, 'walk', '#E8B04A', dict(staff=((14, -60), (24, 2)), rim='#FFD9A8')), ('boatman', .3, 1, 'push', '#C4472E', dict(staff=((24, -70), (40, 10))))):
    sprite(nm, figure(0, 0, k, f, wrap=wrap, pose=pose, **W_, **kw)[0])

# the ox-cart (a new drawing in the same language): a pair of zebu oxen under a yoke, a two-wheeled cart with a marble block.
# Local: feet at y 0, the oxen face left (f = -1), the cart behind them; the wheel is drawn live (it turns).
OX = [(-70, -78), (-62, -88), (-40, -92), (-8, -92), (16, -94), (24, -104), (34, -110), (44, -106), (52, -96), (62, -92), (74, -90), (84, -86),
      (94, -76), (98, -66), (93, -60), (84, -61), (74, -66), (66, -66), (60, -56), (54, -46), (44, -40), (34, -44), (26, -50), (6, -52), (-30, -52), (-52, -54), (-66, -62)]
def ox(T, body, dark, sw, rim=None, k=1):
    o = []
    for cl_, c in (([(28, -50, 6.5), (29, -26, 4.5), (29, -6, 4)], dark), ([(-44, -56, 9), (-42, -30, 5), (-43, -6, 4)], dark),
                   ([(42, -50, 7), (43, -26, 5), (44, -6, 4.5)], body), ([(-56, -58, 10), (-52, -30, 5.5), (-54, -6, 4.5)], body)):
        o.append(poly(TP(T, limb(cl_)), c, INK, sw))
        x = cl_[-1][0]; o.append(poly(TP(T, [(x - 5, -6), (x + 5, -6), (x + 6, 0), (x - 6, 0)]), '#3A2C26', INK, sw * .7))
    o += bar(TP(T, [(-67, -80), (-72, -60), (-73, -42)]), dark, max(2, 3 * k), sw * .7)
    o.append(path(curve(TP(T, [(-77, -44), (-73, -48), (-69, -42), (-73, -34)])), '#3A2C26', INK, sw * .7))
    o.append(path(curve(TP(T, OX)), body, INK, sw))
    o.append(path(curve(TP(T, [(52, -58), (60, -54), (56, -42), (46, -38), (44, -46)])), dark, 'none', 0, 'opacity=".55"'))   # dewlap shade
    o.append(path(curve(TP(T, [(-50, -56), (0, -54), (24, -52), (20, -60), (-30, -60)])), dark, 'none', 0, 'opacity=".4"'))
    o.append(path(curve(TP(T, [(76, -90), (74, -100), (68, -108), (72, -106), (80, -96), (80, -88)])), '#EADFC6', INK, sw * .8))   # horn
    o.append(path(curve(TP(T, [(70, -84), (60, -80), (58, -76), (68, -78)])), dark, INK, sw * .7))   # ear
    if rim: o.append(path(curve(TP(T, [(24, -104), (34, -110), (44, -106), (52, -96), (62, -92)]), False), 'none', rim, max(1.5, 3 * k), 'opacity=".8"'))
    return o
KO = .62
To = tf(0, 0, KO, -1); Tf_ = tf(-8 * KO * -1, -5 * KO, KO, -1)
oc = []
oc.append(ell(-60 * KO, 2, 180 * KO, 7 * KO, '#2A140C', 'opacity=".22"'))
oc += ox(Tf_, '#BDB3A6', '#988E84', 2, k=KO)
oc += [poly(TP(To, [(-300, -66), (-108, -66), (-108, -54), (-300, -54)]), '#7A4E2E', INK, 2)]   # cart bed (far side rail)
oc += bar(TP(To, [(-110, -62), (56, -98)]), '#6E4426', 4, 1.6)   # the shaft to the yoke
oc += ox(To, '#DCD3C6', '#A89E92', 2, rim='#FFE2B8', k=KO)
oc += bar(TP(To, [(48, -108), (60, -104)]), '#5A3A22', 6, 1.6)   # the yoke on the neck
oc += [poly(TP(To, [(-290, -114), (-128, -114), (-128, -66), (-290, -66)]), '#F3EEE8', INK, 2.2),
       poly(TP(To, [(-290, -114), (-240, -114), (-240, -66), (-290, -66)]), '#D2CACA', 'none', 0),
       poly(TP(To, [(-290, -114), (-128, -114), (-128, -66), (-290, -66)]), 'none', INK, 2.2),
       line(TP(To, [(-140, -106), (-220, -106)]), '#FFFFFF', 2.5, 'opacity=".75"')]
oc += [poly(TP(To, [(-306, -70), (-102, -70), (-102, -56), (-306, -56)]), '#8E5E36', INK, 2)]   # cart bed (near)
oc += marks([(To((x, -70)), To((x, -56))) for x in range(-290, -110, 22)], '#5E3A20', 1.5, 'opacity=".7"')
oc += figure(*To((-60, 6)), .44, -1, wrap='#E8B04A', pose='walk', staff=((14, -60), (24, 2)), rim='#FFD9A8', **W_)[0][1:]
sprite('oxcart', oc)
J['A']['oxcart'] = dict(k=KO, wheel=To((-210, -36)), r=36 * KO)

# ================= shot B: Agra Fort at dusk, the Taj across the river; the crypt =================
R = random.Random(5712)
TX, PE, PF, RA, RO = 400, 470, 700, 78, 190     # tower axis, eave and floor of the marble pavilion, half-widths of the front face / octagon
def Q(x, y):
    """the octagon's oblique faces recede: above the eye their horizontal edges dip toward the far corners"""
    d = max(0, abs(x - TX) - RA) / (RO - RA); return (x, y + .03 * (900 - y) * d)
def QP(ps): return [Q(x, y) for x, y in ps]
def cusp_pts(x0, x1, spring, apex, bottom, n=9, depth=.3):
    """the multifoil arch of hist_c.cusp_arch, as points (so it can be mapped and used as a clip)"""
    d = HC.cusp_arch(x0, x1, spring, apex, bottom, n, depth).replace('M', '').replace('Z', '').split()
    out = []; cur = None; i = 0
    while i < len(d):
        tok = d[i]
        if tok[0] == 'L': cur = tuple(map(float, tok[1:].split(','))); out.append(cur); i += 1
        elif tok[0] == 'Q':
            c = tuple(map(float, tok[1:].split(','))); e = tuple(map(float, d[i + 1].split(',')))
            for j in range(1, 7):
                u = j / 6; out.append(((1 - u) ** 2 * cur[0] + 2 * (1 - u) * u * c[0] + u * u * e[0], (1 - u) ** 2 * cur[1] + 2 * (1 - u) * u * c[1] + u * u * e[1]))
            cur = e; i += 2
        else: cur = tuple(map(float, tok.split(','))); out.append(cur); i += 1
    return out
# --- the sky (its own layer: it barely moves) ---
defs = [grad('b_dusk', [(0, '#4C3E66'), (.3, '#8E5A78'), (.58, '#E0906C'), (.8, '#F6C08A'), (1, '#F7CC96')], 0, 80, 0, 760, True)]
layer('b_sky', defs, [f'<rect x="-200" y="-200" width="{W + 400}" height="{H + 400}" fill="url(#b_dusk)"/>'] +
      [poly([(-200, y), (2120, y - 14), (2120, y + 14), (-200, y + 26)], '#FBE0C4', 'none', 0, f'opacity="{op}"') for y, op in ((560, .14), (612, .2), (660, .26))])
# --- far: the far bank, the Taj complex on its terrace, the river bend, the inner bank ---
TJ = (1120, 702, .72); J['B'].update(taj=TJ)
defs = [rgrad('b_halo', [(0, '#FFF2E0', .9), (.3, '#FFE0C0', .5), (1, '#F8C098', 0)]),
        grad('b_river', [(0, '#E6A684'), (.45, '#C48A88'), (1, '#7E5E7E')], 0, 736, 0, 1080, True),
        grad('b_field', [(0, '#8E8A5A'), (1, '#5A6038')], 0, 760, 0, 1080, True)]
g = [path(scallops(R, -200, 2120, 690, 5, 13, 22, 44, .15) + ' L2120,742 L-200,742 Z', '#9A7690', '#7A5A76', 1.5)]
for x in (560, 690, 1470, 1610, 1800):
    gp = []; palm(gp, x, 690, R.uniform(40, 54), R.uniform(-6, 6), '#86687E', '#94768C', '#7E6478', 1.3); g += gp
g.append(ell(TJ[0], 640, 300, 190, 'url(#b_halo)'))
for x in range(900, 1360, 26):   # the garden's trees behind the enclosure
    g.append(f'<circle cx="{x + R.uniform(-6, 6):.0f}" cy="{708 - R.uniform(6, 16):.0f}" r="{R.uniform(10, 15):.0f}" fill="#6E5A6A" stroke="#584656" stroke-width="1.4"/>')
def red_hall(g, x0, x1, base, h):   # the mosque / its twin: a red-sandstone hall with three white domes
    g.append(poly([(x0, base), (x1, base), (x1, base - h), (x0, base - h)], '#B4644E', INK, 1.6))
    c = (x0 + x1) / 2; g.append(poly([(c - 9, base), (c + 9, base), (c + 9, base - h - 6), (c - 9, base - h - 6)], '#C8765C', INK, 1.4))
    g.append(path(arch_d(c - 5, c + 5, base - h * .45, base - h * .75, base), '#7A3A30', INK, 1.2))
    for dx, r in ((-(x1 - x0) * .3, 8), (0, 11), ((x1 - x0) * .3, 8)):
        g += dome(c + dx, base - h - (6 if dx == 0 else 0), base - h - r * 2.1 - (6 if dx == 0 else 0), r * .95, r * 1.05, base - h - r * .9 - (6 if dx == 0 else 0), '#F4E2DA', '#FFF4EA', '#D8BCBC', 1.2)
red_hall(g, 870, 958, 718, 30); red_hall(g, 1282, 1370, 718, 30)
g += taj(TJ[0], TJ[1], TJ[2], TAJ_GLOW, 1.6, detail=False)
g.append(poly([(860, 716), (1380, 716), (1380, 742), (860, 742)], '#A4503A', INK, 1.8))   # the riverside terrace
g.append(marks([((x, 718), (x, 740)) for x in range(872, 1380, 24)], '#7E3A2A', 1.2, 'opacity=".6"'))
for x in (860, 1380):
    g.append(poly([(x - 12, 742), (x + 12, 742), (x + 12, 704), (x - 12, 704)], '#B85E44', INK, 1.6))
    g += dome(x, 704, 690, 11, 12.5, 699, '#F4E2DA', '#FFF4EA', '#D8BCBC', 1.2)
RIVER = [(-200, 742), (2120, 742), (2120, 772), (1700, 780), (1420, 800), (1260, 836), (1160, 900), (1130, 980), (1150, 1100), (520, 1100), (610, 980), (690, 880), (720, 800)]
g.append(path(curve(RIVER[2:] + [(720, 790), (700, 770)], False) + ' L-200,770 L-200,742 L2120,742 Z', 'url(#b_river)', 'none', 0))
g.append(poly([(TJ[0] - 16, 744), (TJ[0] + 16, 744), (TJ[0] + 26, 850), (TJ[0] - 26, 850)], '#FFF0E2', 'none', 0, 'opacity=".35"'))   # the Taj's reflection
rip = []
for y in range(750, 1080, 10):
    for _ in range(4):
        x = R.uniform(400, 1900); L = R.uniform(18, 54)
        rip.append(((x, y), (x + L, y)))
g.append(f'<g clip-path="url(#b_water)">' + marks(rip, '#FCE6D4', 2, 'opacity=".42"') + '</g>')
defs.append(f'<clipPath id="b_water"><path d="{curve(RIVER[2:] + [(720, 790), (700, 770)], False)} L-200,770 L-200,742 L2120,742 Z"/></clipPath>')
BANK = [(2120, 776), (1700, 784), (1430, 804), (1276, 840), (1180, 902), (1152, 980), (1170, 1100)]
g.append(path(curve(BANK, False) + ' L2120,1100 Z', 'url(#b_field)', INK, 2))
g.append(path(curve([(2120, 776), (1700, 784), (1430, 804), (1276, 840), (1180, 902), (1152, 980), (1170, 1100)], False) + ' L1190,1100 ' +
              curve([(1196, 1100), (1178, 990), (1204, 912), (1296, 852), (1446, 818), (1710, 798), (2120, 790)], False).replace('M', 'L', 1) + ' Z', '#D8B48C', 'none', 0))   # the sand
for x, y, h, r in ((1520, 830, 96, 34), (1640, 822, 110, 40), (1770, 826, 90, 32), (1880, 830, 120, 44)):
    tree(g, R, x, y, h, r, '#3E4A30', '#566440', rim='#E8A884')
tufts(g, R, 40, 1240, 1920, 860, 1080, col='#4E5A34', k=1.3, avoid=lambda x, y: x < 1200 + (1080 - y) * .2)
layer('b_far', defs, g)
# --- near: Agra Fort's Musamman Burj, its marble pavilion, the ramparts, the bank at its foot ---
defs = [grad('b_redF', [(0, '#B65A40'), (1, '#7E3426')], 0, 700, 0, 1080, True), grad('b_redL', [(0, '#C86A4A'), (1, '#8E4030')], 0, 700, 0, 1080, True),
        grad('b_redR', [(0, '#8E4434'), (1, '#5E2A20')], 0, 700, 0, 1080, True), grad('b_wallL', [(0, '#A24E36'), (1, '#6A2C20')], 0, 760, 0, 1080, True)]
MF, ML, MR = '#EBD4C8', '#F6E4D6', '#C9AEB0'
g = []
# ramparts (left: across to the frame edge; right: running back toward the river and a turret)
g.append(poly([(-20, 770), (TX - RO, 750), (TX - RO, H + 20), (-20, H + 20)], 'url(#b_wallL)', INK, 3))
for i in range(5):
    x = -6 + i * 44; y = 770 - (x + 20) / (TX - RO + 20) * 20
    g.append(path(f'M{x},{y + 1} L{x},{y - 20} Q{x + 15},{y - 34} {x + 30},{y - 20} L{x + 30},{y + 1} Z', '#A24E36', INK, 2.5))
g.append(marks([((-20, y), (TX - RO, y - 20)) for y in range(820, 1080, 44)], '#5E2418', 2, 'opacity=".55"'))
g.append(poly([(TX + RO, 790), (860, 840), (860, H + 20), (TX + RO, H + 20)], 'url(#b_wallL)', INK, 3))
for i in range(6):
    x = TX + RO + 8 + i * 44; y = 790 + (x - TX - RO) / (860 - TX - RO) * 50
    g.append(path(f'M{x},{y + 1} L{x},{y - 18} Q{x + 14},{y - 31} {x + 28},{y - 18} L{x + 28},{y + 1} Z', '#A24E36', INK, 2.5))
    g.append(line([(x + 2, y - 18), (x + 14, y - 26)], '#E08A62', 2, 'opacity=".6"'))
g.append(marks([((TX + RO, y), (860, y + 50)) for y in range(850, 1080, 46)], '#5E2418', 2, 'opacity=".55"'))
g.append(poly([(846, 1100), (846, 830), (852, 818), (890, 818), (896, 830), (896, 1100)], '#B05A40', INK, 3))   # the turret
g.append(poly([(840, 818), (902, 818), (896, 806), (846, 806)], '#C8704E', INK, 2.5))
g.append(poly([(882, 830), (896, 830), (896, 1100), (882, 1100)], '#7A3426', 'none', 0, 'opacity=".7"'))
# the bank at the fort's foot, down to the water: grass and reeds (same layer as the fort, so nothing slides)
g.append(path(curve([(846, 1000), (900, 980), (960, 990), (1010, 1030), (1040, 1100)], False) + ' L840,1100 Z', '#6E7A44', INK, 2.5))
tufts(g, R, 22, 880, 1030, 1000, 1080, col='#4E5A30', k=1.6, avoid=lambda x, y: y < 990 + (x - 880) * .45)
# the tower body (red sandstone, battered)
def faces(y0, y1, a0, r0, a1, r1):
    return ([(TX - r0, y0), (TX - a0, y0), (TX - a1, y1), (TX - r1, y1)], [(TX - a0, y0), (TX + a0, y0), (TX + a1, y1), (TX - a1, y1)],
            [(TX + a0, y0), (TX + r0, y0), (TX + r1, y1), (TX + a1, y1)])
fL, fF, fR = faces(PF + 14, H + 20, RA, RO, RA + 8, RO + 18)
for f_, c in ((fL, 'url(#b_redL)'), (fF, 'url(#b_redF)'), (fR, 'url(#b_redR)')): g.append(poly(QP(f_), c, INK, 3))
for y in (790, 880, 990):   # string courses
    g.append(line(QP([(TX - RO - 6, y), (TX - RA - 4, y), (TX + RA + 4, y), (TX + RO + 6, y)]), '#E08A62', 3, 'opacity=".55"'))
for xa, xb in ((TX - 56, TX - 6), (TX + 6, TX + 56)):   # blind arches on the front face
    g.append(path(arch_d(xa, xb, 838, 800, 960), '#8A3A2A', '#5A2018', 2.5))
for sgn in (-1, 1):
    xa, xb = TX + sgn * (RA + 24), TX + sgn * (RO - 20)
    g.append(path('M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in QP([(min(xa, xb), 960), (min(xa, xb), 846), ((xa + xb) / 2, 806), (max(xa, xb), 846), (max(xa, xb), 960)])) + ' Z',
                  '#7E3426' if sgn > 0 else '#9A4630', '#5A2018', 2.5))
# the corbelled balcony base under the pavilion
for f_, c in zip(faces(PF, PF + 14, RA + 4, RO + 10, RA + 4, RO + 10), ('#F2DED0', '#E6CCC0', '#C2A6A8')): g.append(poly(QP(f_), c, INK, 2.5))
for x in list(range(TX - RO + 8, TX + RO, 26)):
    p = Q(x, PF + 14); g.append(path(f'M{p[0] - 6:.1f},{p[1]:.1f} L{p[0] + 6:.1f},{p[1]:.1f} L{p[0] + 3:.1f},{p[1] + 18:.1f} L{p[0] - 3:.1f},{p[1] + 18:.1f} Z', '#D8BEB4', INK, 1.8))
# the pavilion: three faces of white marble, a cusped arch in each, the interior dark (Remotion lights it)
OPEN = [QP(cusp_pts(TX - 64, TX + 64, 566, 488, PF, 9, .3)), QP(cusp_pts(TX + RA + 16, TX + RO - 14, 572, 506, PF, 7, .28)),
        QP(cusp_pts(TX - RO + 14, TX - RA - 16, 572, 506, PF, 7, .28))]
fL, fF, fR = faces(PE, PF, RA, RO, RA, RO)
for f_, c in ((fL, ML), (fF, MF), (fR, MR)): g.append(poly(QP(f_), c, INK, 3))
for f_, c in ((fL, '#FFF2E6'), (fF, '#FBEADE')): g.append(line(QP([f_[0], f_[1]]), c, 3, 'opacity=".9"'))
for o in OPEN: g.append(poly(o, '#3A2428', INK, 3))
for o, c in zip(OPEN, ('#D9BEB4', '#B9989E', '#E8D0C2')):   # the arch frames (a second, outer line)
    cxo = sum(p[0] for p in o) / len(o); g.append(poly([(cxo + (x - cxo) * 1.07, y - 6 * (1 - (y - 480) / 220)) for x, y in o], 'none', c, 3, 'opacity=".9"'))
for x in (TX - RA, TX + RA):   # the corner shafts
    g.append(poly(QP([(x - 5, PE), (x + 5, PE), (x + 5, PF), (x - 5, PF)]), '#F8EADF' if x < TX else '#DCC2BE', INK, 2))
g.append(poly(QP([(TX - RO - 6, PF - 3), (TX - RA, PF - 3), (TX + RA, PF - 3), (TX + RO + 6, PF - 3), (TX + RO + 6, PF + 4), (TX - RO - 6, PF + 4)]), '#E8D2C6', INK, 2))
# the eave (chhajja), the parapet, the drum and the dome
for f_, c in zip(faces(PE - 10, PE + 8, RA + 8, RO + 18, RA + 4, RO + 10), ('#F8E8DC', '#EEDAD0', '#C8ACB0')): g.append(poly(QP(f_), c, INK, 2.5))
for f_, c in zip(faces(PE + 8, PE + 14, RA + 4, RO + 10, RA, RO), ('#A88C90', '#A08488', '#7E6468')): g.append(poly(QP(f_), c, 'none', 0, 'opacity=".7"'))
for f_, c in zip(faces(PE - 36, PE - 10, RA + 2, RO + 4, RA + 2, RO + 4), (ML, MF, MR)): g.append(poly(QP(f_), c, INK, 2.5))
for x in range(TX - RO + 4, TX + RO, 22):   # little merlons on the parapet
    p = Q(x, PE - 36); g.append(path(f'M{p[0] - 7:.1f},{p[1] + 1:.1f} L{p[0] - 7:.1f},{p[1] - 8:.1f} Q{p[0]:.1f},{p[1] - 16:.1f} {p[0] + 7:.1f},{p[1] - 8:.1f} L{p[0] + 7:.1f},{p[1] + 1:.1f} Z', '#F2E0D4', INK, 1.8))
g.append(poly([(TX - 104, PE - 36), (TX + 104, PE - 36), (TX + 98, PE - 52), (TX - 98, PE - 52)], '#E8D2C6', INK, 2.5))
g += dome(TX, PE - 50, PE - 134, 92, 104, PE - 82, '#F2E0D6', '#FFF4EA', '#CDB0B2', 3)
g.append(path(f'M{TX - 12},{PE - 133} Q{TX},{PE - 142} {TX + 12},{PE - 133} Z', '#E8B860', INK, 2))
g.append(line([(TX, PE - 138), (TX, PE - 160)], '#C8902E', 4)); g.append(line([(TX, PE - 138), (TX, PE - 160)], INK, 1.2, 'opacity=".5"'))
for y, r in ((PE - 146, 4), (PE - 154, 5)): g.append(f'<circle cx="{TX}" cy="{y}" r="{r}" fill="{GOLD}" stroke="{INK}" stroke-width="1.6"/>')
g.append(path(f'M{TX - 68},{PE - 74} Q{TX - 30},{PE - 124} {TX + 8},{PE - 128}', 'none', '#FFFFFF', 4, 'opacity=".5"'))
layer('b_fort', defs, g)
J['B']['open'] = [[[round(x, 1), round(y, 1)] for x, y in o] for o in OPEN]
# inside the window: the old emperor on his cushion, the lamp, and a guard at the far arch
g = []
gx, gy = TX - RO + 52, PF - 2
g += figure(gx, gy, 1.12, -1, robe='#4A2A2A', head='turban', wrap='#8E2E24', skin='#4A2E26', pose='hold', staff=((14, -112), (12, 2)), rim='#FFB878', sw=2.2)[0][1:]
g += bar([(TX + 50, PF - 2), (TX + 50, PF - 56)], '#6A4A2A', 3, 1.6)   # the lamp stand
g.append(path(f'M{TX + 40},{PF - 58} Q{TX + 50},{PF - 50} {TX + 60},{PF - 58} Z', '#C8902E', INK, 1.6))
g.append(path(f'M{TX + 42},{PF - 2} L{TX + 58},{PF - 2} L{TX + 54},{PF - 8} L{TX + 46},{PF - 8} Z', '#8A6A3A', INK, 1.6))
g += emperor_seat(TX - 22, PF - 8, 1.52, 1, rim='#FFC088', sw=2.6, bow=10)
layer('b_inside', [], g)
J['B'].update(lamp=(TX + 50, PF - 62), eye=tf(TX - 22, PF - 8, 1.52, 1)((10, -69)), fort=(TX - 120, 860), PF=PF)

# --- the crypt (the panel): the marble screen, the floor, her cenotaph; his cenotaph in four parts ---
IX, IY, IW, IH = 1262, 392, 556, 476
J['B']['panel'] = (IX, IY, IW, IH)
defs = [grad('b_marble', [(0, '#F6EEE6'), (1, '#D8CCC6')]), rgrad('b_shaft', [(0, '#FFFBF2', .9), (.5, '#FFF4E2', .4), (1, '#FFF0DC', 0)])]
g = [f'<rect x="{IX}" y="{IY}" width="{IW}" height="{IH}" fill="#C9BCB8"/>']
for p in range(3):
    px0 = IX + 8 + p * (IW - 16) / 3; px1 = px0 + (IW - 16) / 3 - 10
    g.append(poly([(px0, IY + 50), (px1, IY + 50), (px1, IY + 268), (px0, IY + 268)], '#E4DAD4', INK, 2))
    lat = []
    for yy in range(IY + 64, IY + 258, 18):
        for xx in range(int(px0) + 12, int(px1) - 4, 18):
            o = 9 if ((yy - IY) // 18) % 2 else 0
            lat.append(f'M{xx + o:.0f},{yy - 7} l7,7 l-7,7 l-7,-7 Z')
    g.append(path(' '.join(lat), '#A99C9C', 'none', 0, 'opacity=".75"'))
    g.append(poly([(px0 - 3, IY + 38), (px1 + 3, IY + 38), (px1 + 3, IY + 52), (px0 - 3, IY + 52)], '#EFE6E0', INK, 2))
g.append(poly([(IX, IY + 268), (IX + IW, IY + 268), (IX + IW, IY + IH), (IX, IY + IH)], 'url(#b_marble)', INK, 2))
g.append(marks([((IX, y), (IX + IW, y)) for y in (IY + 330, IY + 410)] + [((x, IY + 268), (x - 56, IY + IH)) for x in range(IX + 56, IX + IW + 56, 96)], '#B8AAA8', 1.5, 'opacity=".6"'))
g.append(poly([(IX + 230, IY), (IX + 340, IY), (IX + 480, IY + IH), (IX + 70, IY + IH)], '#FFF8EC', 'none', 0, 'opacity=".32"'))
g.append(ell(IX + IW / 2, IY + 50, 300, 300, 'url(#b_shaft)'))
CB = IY + 440
def ceno(x0, x1, base, h, man, s=1.4):
    vine = []
    for i in range(int((x1 - x0 - 22) / 25) + 1):
        x = x0 + 16 + i * 25; y = base - 36 - h / 2
        vine += [f'<circle cx="{x:.0f}" cy="{y - 5:.0f}" r="5.5" fill="#B4473C"/>', f'<ellipse cx="{x + 10:.0f}" cy="{y + 4:.0f}" rx="7" ry="3.4" fill="#5E7E5A"/>']
    top = base - 36 - h
    parts = [[poly([(x0 - 20, base), (x1 + 20, base), (x1 + 20, base - 20), (x0 - 20, base - 20)], '#EAE2DC', INK, 2.5)],
             [poly([(x0 - 9, base - 20), (x1 + 9, base - 20), (x1 + 9, base - 36), (x0 - 9, base - 36)], '#F2EAE4', INK, 2.5)],
             [poly([(x0, base - 36), (x1, base - 36), (x1, top), (x0, top)], '#F8F2EC', INK, 2.5),
              line([(x0 + 10, base - 36 - h / 2 + 3), (x1 - 10, base - 36 - h / 2 + 3)], '#7A9070', 2)] + vine + [line([(x0 + 6, base - 42), (x1 - 6, base - 42)], '#C9BDB8', 2)],
             [path(f'M{x0 + 14},{top} Q{x0 + 20},{top - 22} {(x0 + x1) / 2},{top - 25} Q{x1 - 20},{top - 22} {x1 - 14},{top} Z', '#F8F2EC', INK, 2.5) if man else
              poly([(x0 + 14, top), (x1 - 14, top), (x1 - 20, top - 11), (x0 + 20, top - 11)], '#F8F2EC', INK, 2.5)]]
    return parts
g.append(ell(IX + IW / 2, CB + 4, 260, 28, '#8E807E', 'opacity=".25"'))
her = ceno(IX + 318, IX + 492, CB, 78, False)
for p in her: g += p
layer('b_crypt', defs, g)
his = ceno(IX + 70, IX + 274, CB, 92, True)
J['B']['his'] = [S(p) for p in his]
J['B']['ceno'] = dict(his=(IX + 172, CB - 36 - 92 - 25), her=(IX + 405, CB - 36 - 78 - 11), base=CB)

json.dump(J, open(f'{OUT}/taj.json', 'w'))
# previews (for checking only): the still layers stacked at their resting place
def prev(name, keys, extra=''):
    d = ''.join(J['layers'][k]['defs'] for k in keys); b = ''.join(J['layers'][k]['body'] for k in keys)
    open(f'{OUT}/{name}.svg', 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs>{d}</defs>{b}{extra}</svg>')
spr = lambda nm, x, y: f'<g transform="translate({x},{y})">{J["sprites"][nm]}</g>'
prev('preview_a', ['a_back', 'a_front', 'a_emp_body', 'a_emp_head'], S(taj(CX, BY, K, TAJ_DUSK, 2.5)) + spr('oxcart', 1560, 934) + spr('pusher_a', 1700, 1040) +
     f'<g transform="translate(1400,1040)">{J["A"]["ele"]["shadow"]}{S(J["A"]["ele"]["far"])}{S(J["A"]["ele"]["near"])}{J["A"]["ele"]["body"]}</g>')
prev('preview_b', ['b_sky', 'b_far', 'b_fort', 'b_inside', 'b_crypt'], S(his[0] + his[1] + his[2] + his[3]))
print('ok', OUT, round(os.path.getsize(f'{OUT}/taj.json') / 1024), 'KB')
