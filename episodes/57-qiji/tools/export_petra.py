"""Export the 佩特拉 scenes for the Remotion build (Q57PETRA.tsx), from hist_c's own drawing code (petra_caravan,
petra_tax), recomposed so the right column is free for the widgets and every moving part comes out on its own.
  shot A (the Siq): a_far.svg (sky, far cliff, the finished Treasury) and a_near.svg (both walls, the floor, plants);
                    the caravan as data: each camel's body/load in local coordinates (exported at its own scale, feet at
                    the origin) plus its leg parameters, so Remotion walks the legs and glides the camels in perspective.
  shot B (the toll point): b_back.svg (sky, far domes, the sunlit cliff, raw), b_mid.svg (shaded cliff with the Siq mouth,
                    plaza, plants, camel, trader, booth, collector, strongbox); the Treasury as a list of elements (finished
                    and rough-cut markup, with their heights) so Remotion can carve it from the top down; the masons'
                    setting-out lines; masons; the coins in the strongbox.
Writes <repo>/episodes/37-qiqing/remotion/public/ep57/petra/*.svg + petra.json (generated, not committed).
usage: python3 episodes/57-qiji/tools/export_petra.py"""
import os, sys, json, math, random, re
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import hist_c as HC
OUT = os.path.normpath(os.path.join(HERE, '../../37-qiqing/remotion/public/ep57/petra')); os.makedirs(OUT, exist_ok=True)
W, H, INK, GOLD = 1920, 1080, HC.INK, HC.GOLD
poly, line, path, ell, curve, jag, grad, rgrad, lerp, pts = HC.poly, HC.line, HC.path, HC.ell, HC.curve, HC.jag, HC.grad, HC.rgrad, HC.lerp, HC.pts
def svg(defs, body): return f'<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs>{"".join(defs)}</defs>{"".join(body)}</svg>'
def save(name, s): open(f'{OUT}/{name}.svg', 'w').write(s)
def r1(p): return [round(p[0], 2), round(p[1], 2)]

# ---- plants, in the drawings' language (lumpy flat blobs, ink outline, a lit side toward the sun at the right) ----
def lump(rnd, cx, cy, r, n=11, j=.16):
    return [(cx + r * (1 + rnd.uniform(-j, j)) * math.cos(2 * math.pi * i / n), cy + r * .86 * (1 + rnd.uniform(-j, j)) * math.sin(2 * math.pi * i / n)) for i in range(n)]
def shrub(rnd, cx, base, r, cols=('#5B6B35', '#6C7C3E', '#53622F'), lit='#A3B262', flowers=None, sw=2.2):
    out = [ell(cx + r * .25, base + 1, r * 1.3, r * .2, '#2A140C', 'opacity=".25"')]
    blobs = []
    for i in range(6):
        a = math.pi * (.08 + .84 * i / 5); bx = cx - math.cos(a) * r * .72; by = base - r * .42 - math.sin(a) * r * .5
        blobs.append((bx, by, r * rnd.uniform(.42, .56)))
    blobs.append((cx, base - r * .95, r * .5))
    for k, (bx, by, rr) in enumerate(sorted(blobs, key=lambda b: b[1])):
        out.append(path(curve(lump(rnd, bx, by, rr)), cols[k % 3], INK, sw))
    for bx, by, rr in blobs:
        if bx > cx - r * .3: out.append(path(curve(lump(rnd, bx + rr * .3, by - rr * .32, rr * .42, 9, .2)), lit, 'none', 0, 'opacity=".75"'))
    if flowers:
        for bx, by, rr in blobs:
            for _ in range(2):
                fx, fy = bx + rnd.uniform(-.5, .5) * rr, by + rnd.uniform(-.5, .4) * rr
                out.append(f'<circle cx="{fx:.1f}" cy="{fy:.1f}" r="{max(2.5, r * .07):.1f}" fill="{flowers}" stroke="{INK}" stroke-width="1.2"/>')
    return out
def caper(rnd, cx, cy, r, sw=2):
    """a caper clump growing out of a crack in the wall, a few runners hanging down"""
    out = []
    for i in range(3):
        a = rnd.uniform(-.6, .6); L = r * rnd.uniform(1.4, 2.4)
        p0 = (cx + rnd.uniform(-.4, .4) * r, cy); p1 = (p0[0] + math.sin(a) * L * .5, p0[1] + L * .45); p2 = (p0[0] + math.sin(a) * L * .7, p0[1] + L)
        out.append(path(f'M{p0[0]:.1f},{p0[1]:.1f} Q{p1[0]:.1f},{p1[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}', 'none', '#4A5A2A', 2.5))
        for t in (.35, .65, .95):
            q = ((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1])
            out.append(path(curve(lump(rnd, q[0], q[1], r * .22, 7, .2)), '#6C7C3E', INK, 1.4))
    for bx, by, rr in ((cx - r * .45, cy, r * .5), (cx + r * .4, cy - r * .1, r * .55), (cx, cy - r * .35, r * .5)):
        out.append(path(curve(lump(rnd, bx, by, rr)), '#5B6B35', INK, sw))
        out.append(path(curve(lump(rnd, bx + rr * .3, by - rr * .3, rr * .4, 8, .2)), '#A3B262', 'none', 0, 'opacity=".7"'))
    return out

# ================= shot A: the Siq (petra_caravan, everything inside the walls moved DX to the left) =================
DX = -180
def S(p): return (p[0] + DX, p[1])
def SL(ps): return [S(p) for p in ps]
R = random.Random(5701)
defsA = [grad('sky', [(0, '#A7C3D9'), (1, '#E4ECEA')]),
         grad('far', [(0, '#F3B28C'), (.55, '#E89A78'), (1, '#F4BC94')], 0, 40, 0, 800, True),
         grad('lw', [(0, '#A55F4C'), (.45, '#874841'), (1, '#5C2F2D')], 0, 0, 0, 900, True),
         grad('rw', [(0, '#B66B52'), (.5, '#914E43'), (1, '#663535')], 0, 0, 0, 910, True),
         grad('floor', [(0, '#F6C796'), (.1, '#DDA47C'), (.42, '#A8735A'), (1, '#6E4034')], 0, 785, 0, 1080, True),
         rgrad('pool', [(0, '#FFE6BE', .95), (.45, '#FFCB98', .45), (1, '#F6A876', 0)]),
         rgrad('spill', [(0, '#FFD0A0', .5), (.6, '#F6A878', .14), (1, '#E08A60', 0)])]
g = [f'<rect width="{W}" height="{H}" fill="url(#sky)"/>']
for cx_, cy_, w_ in ((1150, 28, 70), (1290, 46, 50)):   # a cloud over the slit
    g.append(ell(cx_, cy_, w_, w_ * .32, '#F6F9FB', 'opacity=".9"')); g.append(ell(cx_ + w_ * .4, cy_ - w_ * .18, w_ * .55, w_ * .3, '#F6F9FB', 'opacity=".9"'))
rim = [(1000, 70)] + [(x, 62 + 16 * math.sin(x * .02) + R.uniform(-6, 6)) for x in range(1040, 1640, 40)] + [(1660, 50)]
rim = [(930, 84)] + rim + [(1730, 58)]       # wider, so the slit can open up as the camera pushes in
g.append(poly(SL(rim + [(1730, 840), (930, 840)]), 'url(#far)', '#9A5A44', 2.5))
for i in range(16):
    y0 = 90 + i * 44 + R.uniform(-10, 10); L = [(x, y0 + 8 * math.sin(x * .012 + i) + (x - 1300) * .05) for x in range(930, 1760, 40)]
    g.append(line(SL(L), '#C9785C', 2, 'opacity=".55"'))
TA_X, TA_Y, TA_K = 1338 + DX, 777, 3.3
g += HC.treasury(TA_X, TA_Y, TA_K, HC.PETRA_LIT, 2.5)
g.append(poly(SL([(930, 777), (1730, 777), (1730, 845), (930, 845)]), '#F7CFA2', '#B8805C', 2))
save('a_far', svg(defsA, g))

g = []
le = jag((1185, -10), (1085, 150), 6, 9, R)[:-1] + jag((1085, 150), (1052, 330), 5, 8, R)[:-1] + jag((1052, 330), (1100, 560), 6, 9, R)[:-1] + jag((1100, 560), (1148, 792), 6, 7, R)
re_ = jag((1460, -10), (1585, 170), 6, 9, R)[:-1] + jag((1585, 170), (1592, 330), 4, 8, R)[:-1] + jag((1592, 330), (1540, 560), 6, 9, R)[:-1] + jag((1540, 560), (1502, 792), 6, 7, R)
le, re_ = SL(le), SL(re_)
lwall = [(-10, -10)] + le + [S((700, 838)), (-10, 893)]
rwall = re_ + [S((1720, 846)), (1930, 906), (1930, -10)]
defsN = list(defsA[2:])
defsN.append(f'<clipPath id="cl"><polygon points="{pts(lwall)}"/></clipPath><clipPath id="cr"><polygon points="{pts(rwall)}"/></clipPath>')
sc = ['#B9705A', '#8A453F', '#C88464', '#6A3540', '#A35E4E', '#D9987A', '#7B3B3A']
g.append(poly(lwall, 'url(#lw)', INK, 3))
g += HC.rock_strata('cl', 0, 1200 + DX, -20, 900, 30, sc, R, slope=.07, amp=16, sw=(10, 34)); g.append('</g>')
defsN.append('<radialGradient id="hang" cx="380" cy="120" r="760" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3A1A18" stop-opacity=".5"/>'
             '<stop offset=".6" stop-color="#3A1A18" stop-opacity=".22"/><stop offset="1" stop-color="#3A1A18" stop-opacity="0"/></radialGradient>')
g.append(f'<g clip-path="url(#cl)"><rect x="0" y="0" width="1300" height="900" fill="url(#hang)"/></g>')
g.append(poly(rwall, 'url(#rw)', INK, 3))
g += HC.rock_strata('cr', 1420 + DX, 1920, -20, 920, 22, sc, R, slope=-.12, amp=14, sw=(10, 30)); g.append('</g>')
for x0, top, wall in ((180, 40, lwall), (420, 70, lwall), (720 + DX, 120, lwall), (1760, 60, rwall)):
    y = top; L = []
    while y < 840: L.append((x0 + R.uniform(-12, 12), y)); y += R.uniform(70, 130)
    g.append(line(L, '#3E1E1C', 2.5, 'opacity=".45"'))
g.append(f'<g clip-path="url(#cl)">' + ell(1150 + DX, 560, 260, 420, 'url(#spill)') + '</g>')
g.append(f'<g clip-path="url(#cr)">' + ell(1520 + DX, 520, 230, 420, 'url(#spill)') + '</g>')
g.append(line(le, INK, 3)); g.append(line(re_, INK, 3))
floor = [(-10, 893), S((700, 838)), S((1148, 792)), S((1502, 792)), S((1720, 846)), (1930, 906), (1930, H + 10), (-10, H + 10)]
g.append(poly(floor, 'url(#floor)', INK, 3))
g.append(ell(1320 + DX, 806, 440, 52, 'url(#pool)'))
pav = []
for row in range(7):
    y = 860 + row * row * 6 + row * 18
    if y > H: break
    n = 6 + row * 2; w = (1920 + 200) / n
    for i in range(n):
        x = -100 + i * w + (row % 2) * w / 2 + R.uniform(-8, 8)
        pav.append(((x, y), (x + w * .8, y + R.uniform(-2, 2))))
        pav.append(((x + w * .85, y + 2), (x + w * .85 - 6 - row * 3, y + 14 + row * 5)))
g.append(HC.marks(pav, '#5E352C', 2, 'opacity=".28"'))
g.append(line([(-10, 905), S((700, 849)), S((1140, 801))], '#4A2622', 5, 'opacity=".55"'))
g.append(line([(-10, 912), S((700, 855)), S((1140, 805))], '#D59C78', 2, 'opacity=".45"'))
track = SL([(120, 1010), (430, 948), (760, 885), (1050, 830), (1260, 795), (1400, 782)])
for (x, y), _ in HC.along(track, 70):
    s_ = (y - 760) / 260; x += R.uniform(-60, 60) * s_; rx = R.uniform(9, 15) * s_ + 2; ry = rx * .32
    g.append(ell(x, y + R.uniform(-8, 14) * s_, rx, ry, '#5A3028', 'opacity=".35"'))
# plants (added): capers hanging from cracks in both walls, shrubs and an oleander at the walls' feet, clear of the track
P = random.Random(57)
for cx_, cy_, r_ in ((150, 330, 26), (430, 610, 22), (690, 250, 18), (1520, 470, 24), (1800, 300, 28), (1700, 700, 22)):
    g += caper(P, cx_, cy_, r_)
g += shrub(P, 1560, 858, 46, flowers='#E88AA6'); g += shrub(P, 1830, 905, 64, flowers='#E88AA6'); g += shrub(P, 1390, 818, 26)
g += shrub(P, 40, 893, 40); g += shrub(P, 470, 846, 24)
for x_, y_ in ((1670, 885), (1460, 832), (1910, 946), (110, 905), (560, 848)):   # grass tufts at the wall foot
    g.append(path(f'M{x_ - 9},{y_} L{x_ - 5},{y_ - 18} L{x_ - 1},{y_} L{x_ + 2},{y_ - 24} L{x_ + 5},{y_} L{x_ + 9},{y_ - 15} L{x_ + 12},{y_} Z', '#6C7C3E', INK, 1.5))
save('a_near', svg(defsN, g))

# ---- the caravan (as in petra_caravan, moved by DX); each item at its own scale with its feet at the origin ----
rimc = '#FFD6A2'
PAL4 = dict(body='#7E5238', dark='#5E3C2A', knee='#6E4730', cloth='#7E2E28', stripe=GOLD, stripe2='#2E3A5C', sack='#B89A76', sack_d='#957A5C', jar='#8E4A30', bolt='#2E6A78')
PAL3 = dict(body='#946243', dark='#6E4632', knee='#83573A', cloth='#8E3430', stripe=GOLD, stripe2='#34446A', sack='#CDB08A', sack_d='#A88A66', jar='#A5583A', bolt='#2E6A78')
PAL1 = dict(body='#B27A50', dark='#875A3C', knee='#9A6A46', cloth='#9C3A30', stripe=GOLD, stripe2='#34446A', sack='#E0C292', sack_d='#B9946A', jar='#B5603C', bolt='#2E6A78')
def camel_item(id_, x, y, k, load, pal, amp, ph, tag=None):
    el, A = HC.camel(0, 0, k, 1, load, rim=rimc, pal=pal)
    sw = 3 if k > 1.2 else 2.5 if k > .7 else 2
    it = dict(kind='camel', id=id_, x0=x + DX, y0=y, k=k, sw=sw, pal=dict(body=pal['body'], dark=pal['dark'], knee=pal['knee']), rim=rimc,
              shadow=el[0], body=''.join(el[7:-1]), amp=amp, ph=ph, anc={n: r1(A[n]) for n in ('muzzle', 'saddle_back', 'sack')})
    if tag:
        s_, fs, rot_, dx_, dy_ = tag; cx_, cy_ = A['sack'][0] + dx_, A['sack'][1] + dy_; w_ = len(s_) * fs + fs * .9
        it['tag'] = dict(svg=''.join(HC.tag(cx_, cy_, s_, fs, rot_)), pivot=r1((cx_ - w_ / 2, cy_)))
    return it
def fig_item(id_, x, y, k, walk=0, **kw):
    el, A = HC.figure(0, 0, k, 1, **kw)
    sw = kw.get('sw') or (2.5 if k > 1.6 else 2 if k > .8 else 1.5)
    it = dict(kind='fig', id=id_, x0=x + DX, y0=y, k=k, anc={'hand': r1(A['hand'])}, walk=walk)
    if walk: it.update(shadow=el[0], body=''.join(el[3:5]), post=''.join(el[7:]), lw=max(2.5, 5 * k), sw=sw * .8)
    else: it['svg'] = ''.join(el)
    return it
items = [fig_item('lead', 1430, 780, .72, robe='#2E3044', wrap='#E8DCC6', skin='#5A3828', pose='hold', rim=rimc, staff=((16, -64), (18, 0))),
         camel_item('c4', 1290, 780, .42, 'B', PAL4, 0, 0),
         dict(kind='rope', a=['c4', 'muzzle'], b=['lead', 'hand'], sag=6, w=2),
         camel_item('c3', 1120, 813, .68, 'A', PAL3, .55, 2.1, tag=('香料', 34, -3, 4, 4)),
         dict(kind='rope', a=['c3', 'muzzle'], b=['c4', 'saddle_back'], sag=8, w=2),
         fig_item('t2', 1018, 842, 1.32, walk=1, robe='#8E4A2E', wrap='#F0E6D2', skin='#7A4E34', pose='walk', rim=rimc, staff=((16, -60), (19, 0))),
         camel_item('c2', 860, 858, 1.02, 'B', PAL1, 1.0, 4.0, tag=('没药', 44, -3, 4, 2)),
         dict(kind='rope', a=['c2', 'muzzle'], b=['c3', 'saddle_back'], sag=14, w=2.5),
         camel_item('c1', 430, 936, 1.6, 'A', PAL1, 1.3, .6, tag=('乳香', 54, -4, 4, 8)),
         dict(kind='rope', a=['c1', 'muzzle'], b=['c2', 'saddle_back'], sag=22, w=3),
         fig_item('t1', 764, 958, 2.15, walk=1, robe='#3E4A6A', wrap='#EADFC8', skin='#7E5036', pose='walk', rim=rimc, staff=((16, -62), (20, 0)))]
A_DATA = dict(VX=1599 + DX, HY=724, TX=TA_X, TY=TA_Y, TK=TA_K, items=items)

# ================= shot B: the toll point (petra_tax recomposed: Treasury centre-right, booth left of it) =================
R = random.Random(5702)
DB = -260                       # the booth group and the shaded cliff move left
TCX, TBY, TK = 1200, 891, 3.3   # the Treasury: recess top at y 330, below the subtitle zone; right of it the widget column
CLIFF = dict(c0='#E7A27E', c1='#DA8E6C', c2='#E9A57E')
defsB = [grad('sky', [(0, '#86AED3'), (.6, '#B7D0E2'), (1, '#E4ECEA')], 0, 0, 0, 200, True),
         grad('cliff', [(0, CLIFF['c0']), (.5, CLIFF['c1']), (1, CLIFF['c2'])], 0, 0, 0, 900, True),
         grad('dome', [(0, '#F0C3A6'), (1, '#E3A98C')], 0, 60, 0, 200, True)]
g = [f'<rect width="{W}" height="{H}" fill="url(#sky)"/>']
# far: hazy sandstone domes beyond the cliff
far = [(560, 200), (600, 120), (660, 96), (740, 110), (800, 88), (880, 82), (960, 104), (1040, 92), (1130, 70), (1230, 74), (1300, 98), (1390, 86),
       (1480, 64), (1580, 70), (1660, 96), (1760, 84), (1850, 72), (1940, 80), (1940, 220), (560, 220)]
g.append(poly(far, '#E9C2AE', '#C99A86', 2, 'opacity=".9"'))
g.append(poly([(560, 150), (700, 132), (900, 140), (1100, 124), (1300, 136), (1500, 118), (1700, 130), (1940, 120), (1940, 220), (560, 220)], '#E2B49E', 'none', 0, 'opacity=".7"'))
# mid: the sunlit cliff (raw: the Treasury is carved into it live), its rounded tops
rimp = [(600, 150)] + [(x, 132 + 14 * math.sin(x * .013) + R.uniform(-6, 6) - 30 * math.exp(-((x - 1560) / 90) ** 2) - 22 * math.exp(-((x - 860) / 70) ** 2)) for x in range(640, 1960, 40)]
cliff = rimp + [(1930, 905), (600, 905)]
defsB.append(f'<clipPath id="cc"><polygon points="{pts(cliff)}"/></clipPath>')
g.append(poly(cliff, 'url(#cliff)', '#8E4E3A', 3))
g += HC.rock_strata('cc', 600, 1920, 120, 890, 20, ['#EFB08A', '#C9785C', '#D88A68', '#F3BC96', '#BC6A52'], R, slope=-.04, amp=10, sw=(6, 18), op=(.3, .6)); g.append('</g>')
for x0, top in ((1470, 200), (1680, 160), (1880, 220), (820, 210)):   # long vertical joints
    y = top; L = []
    while y < 880: L.append((x0 + R.uniform(-10, 10), y)); y += R.uniform(70, 130)
    g.append(line(L, '#A85A44', 2, 'opacity=".5"'))
P = random.Random(5703)
for cx_, cy_, r_ in ((1530, 520, 22), (1760, 420, 26), (1640, 760, 20), (900, 300, 18)):
    g += caper(P, cx_, cy_, r_)
for cx_, b_, r_ in ((700, 158, 22), (1010, 128, 18), (1300, 124, 20), (1600, 104, 24), (1840, 116, 20)):   # shrubs on the cliff top
    g += shrub(P, cx_, b_, r_, cols=('#6A7A40', '#7A8A48', '#5E6E38'))
save('b_back', svg(defsB, g))

# near: the shaded cliff with the Siq mouth, the plaza, the toll point
def SB(p): return (p[0] + DB, p[1])
def SBL(ps): return [SB(p) for p in ps]
defsM = [grad('lc', [(0, '#93503F'), (.5, '#7A3F38'), (1, '#55292A')], 0, 0, 0, 900, True),
         grad('ground', [(0, '#F2C092'), (.35, '#E2A87E'), (1, '#C58664')], 0, 890, 0, 1080, True),
         rgrad('goldglow', [(0, '#FFE7A0', .8), (.5, '#F6C66A', .3), (1, '#F2B050', 0)]),
         grad('slot', [(0, '#E9A47C'), (.35, '#A85A44'), (.75, '#5E2C26'), (1, '#4A2220')], 0, 0, 0, 905, True)]
g = []
gr = [(-10, 912), (900, 903), (1930, 893), (1930, H + 10), (-10, H + 10)]
g.append(poly(gr, 'url(#ground)', INK, 3))
le = jag((1010, -10), (965, 260), 6, 10, R)[:-1] + jag((965, 260), (930, 600), 7, 10, R)[:-1] + jag((930, 600), (915, 870), 5, 8, R)
le = SBL(le) + [(655, 908)]
lcl = [(-10, -10)] + le + [(-10, 912)]
defsM.append(f'<clipPath id="cl"><polygon points="{pts(lcl)}"/></clipPath>')
g.append(poly(lcl, 'url(#lc)', INK, 3))
g += HC.rock_strata('cl', 0, 760, -20, 900, 26, ['#A85E4C', '#7E4240', '#B8705A', '#64323A', '#93524A'], R, slope=.06, amp=14, sw=(10, 30)); g.append('</g>')
DS = -150   # the Siq's mouth (a slot open to the sky) sits behind the camel
def SS(ps): return [(x + DS, y) for x, y in ps]
sl_l = SS(jag((170, 912), (232, 520), 5, 9, R)[:-1] + jag((232, 520), (296, -10), 6, 9, R))
sl_r = SS(jag((392, -10), (402, 480), 6, 9, R)[:-1] + jag((402, 480), (392, 912), 5, 9, R))
g.append(poly(sl_l + sl_r, 'url(#slot)', INK, 3))
g.append(poly(SS([(296, -10), (392, -10), (380, 40), (300, 40)]), '#CFE0EA', 'none', 0))
g.append(poly(SS([(296, -10), (336, 40), (326, 300), (304, 600), (286, 912), (170, 912)]) + sl_l[::-1][1:-1], '#C27458', 'none', 0, 'opacity=".55"'))
g.append(line(SS([(336, 40), (326, 300), (304, 600), (286, 912)]), '#3E1E1C', 2.5, 'opacity=".6"'))
g.append(poly(SS([(240, 912), (360, 912), (340, 800), (318, 760), (300, 790)]), '#D79A74', INK, 2, 'opacity=".9"'))
g.append(line(sl_l + sl_r, INK, 3))
g.append(poly([(-10, 912), (655, 908), (820, 1090), (-10, 1090)], '#6A3A30', 'none', 0, 'opacity=".3"'))   # the shaded cliff's shadow on the plaza
stones = []
for _ in range(26):   # pebbles on the plaza (clear of the Treasury's foot and the booth)
    x = P.uniform(20, 1900); y = P.uniform(930, 1070)
    if 980 < x < 1430 and y < 960: continue
    s_ = (y - 880) / 190 * P.uniform(4, 9); stones.append(path(curve(lump(P, x, y, s_, 7, .25)), '#C98A68', INK, 1.5))
g += stones
for cx_, b_, r_, fl in ((1520, 902, 34, None), (1650, 912, 50, None), (1890, 936, 58, None), (40, 925, 44, None)):
    g += shrub(P, cx_, b_, r_, cols=('#6A7A40', '#7A8A48', '#5E6E38'), flowers=fl)
for x_, y_ in ((1480, 910), (1580, 918), (1750, 924), (1440, 940), (110, 940)):
    g.append(path(f'M{x_ - 9},{y_} L{x_ - 5},{y_ - 18} L{x_ - 1},{y_} L{x_ + 2},{y_ - 24} L{x_ + 5},{y_} L{x_ + 9},{y_ - 15} L{x_ + 12},{y_} Z', '#6C7C3E', INK, 1.5))
c, CA = HC.camel(430 + DB, 936, 1.32, 1, 'B', rim='#FFD29A'); g += c
g += HC.tag(CA['sack'][0] + 2, CA['sack'][1] + 4, '香料', 38, -3)
g += HC.bar(SBL([(808, 935), (808, 548)]), '#6E4426', 7, 2.5) + HC.bar(SBL([(1176, 925), (1176, 548)]), '#6E4426', 7, 2.5)
aw = SBL([(778, 520), (1206, 520), (1220, 570), (764, 570)])
g.append(poly(aw, '#EAD9B8', INK, 3))
for i in range(0, 8, 2):
    x0 = 778 + i * (428 / 8); x1 = x0 + 428 / 8
    g.append(poly(SBL([(x0, 520), (x1, 520), (x1 + 1.7 * 14 * (x1 - 992) / 428, 570), (x0 + 1.7 * 14 * (x0 - 992) / 428, 570)]), '#A33A2E', 'none', 0))
g.append(poly(aw, 'none', INK, 3))
g.append(path(' '.join(f'M{764 + DB + i * 456 / 12:.1f},570 q{456 / 24:.1f},20 {456 / 12:.1f},0' for i in range(12)), '#EAD9B8', INK, 2.5))
col, CO = HC.figure(1116 + DB, 905, 2.25, -1, robe='#4E2E5A', wrap='#F0E6D2', skin='#7A4E34', pose='give', rim='#FFD29A'); g += col
g.append(poly(SBL([(820, 790), (1150, 790), (1150, 935), (820, 935)]), '#B4705A', INK, 3))
g.append(poly(SBL([(820, 880), (1150, 880), (1150, 935), (820, 935)]), '#9C5A48', 'none', 0))
g.append(poly(SBL([(808, 778), (1162, 778), (1162, 792), (808, 792)]), '#E4A07E', INK, 3))
g.append(HC.marks([(SB((x, 800)), SB((x, 930))) for x in (930, 1040)], '#7A4234', 2, 'opacity=".5"'))
g.append(ell(990 + DB, 700, 190, 110, 'url(#goldglow)'))
g += HC.tag(985 + DB, 872, '过路税', 50, 0)
tr, TA = HC.figure(742 + DB, 936, 2.3, 1, robe='#3E4A6A', wrap='#EADFC8', skin='#7E5036', pose='give', rim='#FFD29A'); g += tr
g.append(poly(SBL([(1150, 868), (1262, 868), (1262, 936), (1150, 936)]), '#6E3A26', INK, 3))
g.append(poly(SBL([(1150, 868), (1262, 868), (1262, 880), (1150, 880)]), '#8E5034', INK, 2.5))
save('b_mid', svg(defsM, g))
heap = []
for i in range(60):   # the coins in the strongbox, back rows first (the box fills up as the tolls come in)
    u = R.uniform(-1, 1); x = 1206 + DB + u * 50; h = 44 * (1 - u * u); y = 870 - R.uniform(0, 1) ** .7 * h
    heap.append([round(x, 1), round(y, 1)])
heap.sort(key=lambda p: -p[1])

# the Treasury, finished, element by element, plus a rough-cut version of each (the masons' first pass)
pal = dict(HC.PETRA_LIT)
els = HC.treasury(TCX, TBY, TK, pal, 2.5)
ROUGH = {pal['lit']: '#EDB08A', pal['mid']: '#E2A07C', pal['shade']: '#C98466', pal['mould']: '#B8705A'}
NUM = re.compile(r'(-?\d+\.?\d*),(-?\d+\.?\d*)')
def yr(e):
    ys = [float(b) for a, b in NUM.findall(e)]
    m = re.search(r'cy="(-?[\d.]+)"', e); r_ = re.search(r' r="([\d.]+)"', e)
    if m: c_ = float(m.group(1)); rr = float(r_.group(1)) if r_ else 0; ys += [c_ - rr, c_ + rr]
    return min(ys), max(ys)
def rough(e):
    def f(m): return f'fill="{ROUGH.get(m.group(1), m.group(1))}"'
    e2 = re.sub(r'fill="([^"]+)"', f, e)
    e2 = e2.replace(f'stroke="{pal["mould"]}"', 'stroke="#B8705A"').replace(f'stroke="{INK}"', 'stroke="#6A3428"')
    return e2
def hatch(e):
    fm = re.search(r'fill="([^"]+)"', e)
    if not fm or fm.group(1) not in ROUGH or e.startswith('<polyline'): return ''
    e2 = re.sub(r'fill="[^"]+"', 'fill="url(#pb_chisel)"', e, count=1)
    e2 = re.sub(r'stroke="[^"]+"', 'stroke="none"', e2, count=1); e2 = re.sub(r'opacity="[^"]+"', '', e2)
    return e2
tre = []
for i, e in enumerate(els):
    y0, y1 = yr(e)
    tre.append(dict(fin=e, rough=rough(e) if i else e, hatch=hatch(e) if i else '', y0=round(y0, 1), y1=round(y1, 1)))
# the setting-out: the masons' marks for the whole facade, listed top → bottom (they draw in, then the cut takes them)
def T(p): return (TCX + p[0] * TK, TBY + p[1] * TK)
def dashes(a, b, step=6.5):
    n = max(1, int(math.dist(a, b) / step)); return [(T(lerp(a, b, i / n)), T(lerp(a, b, (i + .5) / n))) for i in range(n)]
guide = []
arch = [(-57, -86), (-57, -132), (-50, -156), (-26, -166), (0, -170), (26, -166), (50, -156), (57, -132), (57, -86)]
for a, b in zip(arch, arch[1:]): guide += dashes(a, b)
for y in (-134, -128, -90, -86, -68, -60, -2):
    guide += dashes((-54, y), (54, y))
for s in (-1, 1):
    guide += dashes((s * 52, -134), (s * 21, -146)) + dashes((s * 21, -146), (s * 21, -134))
    for x in (s * 47, s * 25, s * 11.5, s * 4): guide += dashes((x, -128), (x, -90), 7)
    for x in (s * 44, s * 30, s * 12): guide += dashes((x - 3, -60), (x - 3, -2), 7) + dashes((x + 3, -60), (x + 3, -2), 7)
guide += dashes((-16, -134), (0, -149)) + dashes((0, -149), (16, -134)) + dashes((-36, -68), (0, -83)) + dashes((0, -83), (36, -68))
guide += dashes((-6, -40), (6, -40)) + dashes((-6, -40), (-6, -2)) + dashes((6, -40), (6, -2))
guide.sort(key=lambda s: (round(min(s[0][1], s[1][1]) / 12), s[0][0]))
guide = [[r1(a), r1(b)] for a, b in guide]
# the masons on the work ledge (rigid, feet at the origin)
masons = []
for x, f, pose, robe in ((-37, 1, 'pick', '#3E4A6A'), (-19, -1, 'carry', '#E6D8C0'), (0, 1, 'pick', '#8E4A2E'), (19, -1, 'pick', '#2E3044'), (35, 1, 'walk', '#7A5A3A')):
    el, _ = HC.figure(0, 0, .5, f, robe=robe, wrap='#EADFC8', skin='#7A4E34', pose=pose, tool='pick' if pose == 'pick' else None, sw=1.5)
    masons.append(dict(x=x, f=f, pick=pose == 'pick', svg=''.join(el)))
B_DATA = dict(TCX=TCX, TBY=TBY, TK=TK, tre=tre, guide=guide, masons=masons, heap=heap, hand=r1(TA['hand']),
              stacks=[[x + DB, n] for x, n in ((848, 2), (894, 4), (940, 6), (986, 9), (1032, 12))], counter=782, ground=900,
              cliff=CLIFF, ledge=pal['ledge'], raw_d='#B8664C')
json.dump(dict(A=A_DATA, B=B_DATA), open(f'{OUT}/petra.json', 'w'), ensure_ascii=False)
print('ok', OUT, len(items), 'caravan items,', len(tre), 'treasury elements,', len(guide), 'setting-out marks')
