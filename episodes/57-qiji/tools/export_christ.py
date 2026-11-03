"""Export the 基督像 history section for the Remotion build (Q57CHRIST.tsx).
Shot A (1922, a Rio street): christ_1922 from hist_b.py split into depth layers (sky, far range, Corcovado without the
statue, town, street, tram, people), with the donors' front arms cut off so Remotion moves them live (their geometry goes
to the JSON). Shot B (1926-1931, the summit): a new view from beside the summit drawn here in the same language (sky, the
bay, Sugarloaf, the city far below, forest, the granite summit), plus the statue outline and drawing from christ_vector.py
as data in statue units, so Remotion builds it piece by piece inside its scaffolding.
Writes remotion/public/ep57/christ/*.svg + christ.json (generated, not committed).   usage: python3 export_christ.py"""
import os, sys, re, json, math, random, runpy, inspect
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import hist_b as HB
from hist_b import poly, line, segs, ell, arc, blob, inside, ey, rim, INK, GOLD
OUT = os.path.normpath(os.path.join(HERE, '../../37-qiqing/remotion/public/ep57/christ')); os.makedirs(OUT, exist_ok=True)
def svg(defs, body): return f'<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs>{defs}</defs>{"".join(body)}</svg>'
def save(name, s): open(f'{OUT}/{name}.svg', 'w', encoding='utf-8').write(s)
J = {}

# ================================================================== shot A: the 1922 street, as depth layers
CAP = {}
HB.write = lambda name, defs, body: CAP.update(defs=defs, body=list(body))
_p20 = HB.person20; SIG = inspect.signature(_p20); CALLS = []
def p20(g, *a, **k):
    b = SIG.bind(g, *a, **k); b.apply_defaults(); i0 = len(g); hand = _p20(g, *a, **k)
    CALLS.append(dict(args={n: v for n, v in b.arguments.items() if n != 'g'}, i0=i0, i1=len(g), hand=hand)); return hand
HB.person20 = p20
HB.christ_1922()
B = CAP['body']; DEFS = CAP['defs']
def at(s): return next(i for i, e in enumerate(B) if s in e)
iF, iM, iS, iT, iP, iW = at('fill="#ABA0B6"'), at('fill="#857E92"'), at('fill="#77707A"'), at('<polygon points="400.0,772.0'), at('fill="#E9DBBE"'), at('880.0,612.0 1920.0,604.0')
mid, queue = CALLS[:3], CALLS[3:]
save('a_sky', svg(DEFS, B[:iF]))
save('a_far', svg(DEFS, B[iF:iM]))
save('a_mount', svg(DEFS, B[iM:iS]))                         # Corcovado bare: the statue and its scaffold (iS..iT) are left out
save('a_town', svg(DEFS, [e.replace(',772.0', ',840.0') for e in B[iT:iP]]))   # house fronts run on under the street (parallax)
save('a_street', svg(DEFS, B[iP:iW + 1]))                     # pavement, waves, tram wire
save('a_tram', svg(DEFS, B[iW + 1:mid[0]['i0']]))
save('a_mid', svg(DEFS, B[mid[0]['i0']:mid[-1]['i1']]))
save('a_near', svg(DEFS, B[mid[-1]['i1']:queue[0]['i1']]))    # church, lamp, donation box, the priest
names = ['priest', 'girl', 'man', 'woman', 'oldman', 'worker']
arms = {}
for nm, c in zip(names, queue):
    if nm in ('priest',): continue
    a = c['args']
    if nm == 'oldman': save('a_oldman', svg(DEFS, B[c['i0']:c['i1']])); continue
    x, yb, h, kind, face, child = a['x'], a['yb'], a['h'], a['kind'], a['face'], a['child']
    tail = 3 + (kind == 'worker') + (a['coin'] is True) + 2 * bool(a['cane']) + 2 * bool(a['bag']) + 1
    save(f'a_{nm}', svg(DEFS, B[c['i0']:c['i1'] - tail]))
    lw = max(2.0, h * .0062); rw = max(2.2, h * .011); aw = h * (.052 if child else .042)
    hr = h * (.085 if child else .062); hc = yb - h + hr; sh = hc + hr + h * .04
    ws = h * {'suit': .125, 'worker': .12, 'dress': .1, 'priest': .12}[kind] * (1.12 if child else 1); hip = yb - h * .48
    sF = (x + face * ws * .8, sh + h * .03)
    arms[nm] = dict(x=x, h=h, face=face, aw=round(aw, 2), lw=round(lw, 2), rw=round(rw, 2), sF=[round(v, 1) for v in sF],
                    rest=[round(sF[0] + face * h * .015, 1), round(hip + h * .045, 1)], hand=[round(v, 1) for v in c['hand']], m=round(h * .37, 1),
                    sleeve=a['cloth2'] if kind == 'worker' else a['cloth'], cloth2=a['cloth2'], skin=a['skin'], rimc=a['rimc'], kind=kind, bag=a['bag'])
J['arms'] = arms

# ================================================================== shot B: the summit, 1926-1931 (fixed camera)
R = random.Random(1931)
P = dict(far='#ADA3BD', far_l='#9289A6', far2='#978DAE', far2_l='#7E7596', loaf='#9A92AE', loaf_l='#6E6688', loaf_lit='#CDB6AA',
         urca='#7D8C77', urca_l='#5E6C5A', rock='#857E92', rock_lit='#B7A6A2', rock_sh='#6E6880', rock_line='#655E77', plat='#B3A690', plat_l='#C9BCA4',
         forest='#4B6744', leaf=['#58784B', '#678652', '#46623F', '#517046'], leaf_lit='#8DA663', land='#C8B79A', beach='#EBDDBB', rim='#FFE1A0')
bdefs = ('<linearGradient id="b_sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="645"><stop offset="0" stop-color="#4E6FA5"/><stop offset=".38" stop-color="#7F97C0"/>'
         '<stop offset=".78" stop-color="#CDBFB5"/><stop offset="1" stop-color="#F1D3A3"/></linearGradient>'
         '<radialGradient id="b_glow" gradientUnits="userSpaceOnUse" cx="1890" cy="470" r="760"><stop offset="0" stop-color="#FFE6AE" stop-opacity=".9"/>'
         '<stop offset=".4" stop-color="#FFE6AE" stop-opacity=".3"/><stop offset="1" stop-color="#FFE6AE" stop-opacity="0"/></radialGradient>'
         '<linearGradient id="b_sea" gradientUnits="userSpaceOnUse" x1="0" y1="640" x2="0" y2="1080"><stop offset="0" stop-color="#E2D2B8"/><stop offset=".14" stop-color="#B9BEBE"/>'
         '<stop offset=".55" stop-color="#90A6B5"/><stop offset="1" stop-color="#7893A8"/></linearGradient>'
         '<linearGradient id="b_haze" gradientUnits="userSpaceOnUse" x1="0" y1="640" x2="0" y2="1040"><stop offset="0" stop-color="#F2E4CC" stop-opacity=".55"/>'
         '<stop offset="1" stop-color="#F2E4CC" stop-opacity="0"/></linearGradient>')
# --- back: sky, the far ranges across the bay, the water
g = ['<rect width="1920" height="1080" fill="url(#b_sky)"/>', '<rect width="1920" height="1080" fill="url(#b_glow)"/>']
far1 = [(0, 618), (70, 604), (150, 596), (230, 606), (300, 592), (380, 584), (450, 596), (520, 612), (600, 606), (700, 616), (820, 610), (900, 622), (1000, 630), (1100, 628),
        (1180, 620), (1260, 612), (1330, 600), (1400, 606), (1480, 596), (1560, 604), (1640, 598), (1720, 610), (1800, 604), (1920, 612)]
# the Serra dos Orgaos far inland (very hazy, jagged, the 'finger' peak), the Niteroi hills across the bay, open sea to the right
serra = [(0, 604), (40, 592), (80, 578), (112, 584), (140, 566), (168, 556), (196, 570), (230, 562), (262, 548), (284, 556), (296, 524), (304, 522), (312, 552),
         (340, 560), (380, 552), (420, 566), (470, 574), (520, 568), (570, 584), (630, 590), (700, 600), (780, 606), (860, 614), (940, 626), (1000, 640)]
g.append(poly(serra + [(1000, 650), (0, 650)], '#BBB1C8', '#A79DB8', 2))
g.append(line([(px + 2, py + 3) for px, py in serra[3:13]], '#F3DCC0', 2.5, 'opacity=".6"'))
nit = [(560, 646), (620, 630), (690, 618), (760, 612), (820, 618), (880, 608), (940, 596), (1000, 590), (1050, 598), (1110, 586), (1170, 592), (1230, 606), (1290, 600),
       (1350, 612), (1420, 606), (1480, 622), (1530, 636), (1570, 646)]
g.append(poly(nit, P['far'], P['far_l'], 2))
g.append(rim(nit, 1, 3, '#F3D9B4', .5, .55).replace('opacity=".95"', 'opacity=".55"'))
for _ in range(26):   # forest texture on the Niteroi hills
    x = R.uniform(600, 1540); y = ey(nit, x) + R.uniform(5, 30)
    if inside(nit, x, y): g.append(poly(blob(R, x, y, R.uniform(5, 9), 8, .2), R.choice(['#A79EBA', '#A39AB7']), 'none', 0, 'opacity=".7"'))
g.append('<rect x="0" y="645" width="1920" height="435" fill="url(#b_sea)"/>')
g.append(line([(0, 645), (1920, 645)], '#F4E2C2', 2, 'opacity=".8"'))
for x0, x1 in ((0, 560), (580, 1560)):   # the far shore: a strip of tiny houses at the water's edge
    x = x0
    while x < x1:
        w = R.uniform(3, 6); hh = R.uniform(2, 5)
        if R.random() < .8: g.append(f'<rect x="{x:.1f}" y="{649 - hh:.1f}" width="{w:.1f}" height="{hh + 2:.1f}" fill="{R.choice(["#EDE2CF", "#DCC8B4", "#E6D6BC", "#CFC1B6", "#D9B9A6"])}" opacity=".85"/>')
        x += w + R.uniform(1, 6)
for (cx_, cy_, w_, h_) in ((520, 702, 70, 16), (640, 690, 34, 9), (330, 735, 46, 12), (1180, 668, 26, 7)):   # small islands in the bay
    isl = [(cx_ - w_, cy_), (cx_ - w_ * .6, cy_ - h_ * .7), (cx_ - w_ * .1, cy_ - h_), (cx_ + w_ * .5, cy_ - h_ * .6), (cx_ + w_, cy_)]
    g.append(poly(isl, '#8C9785', '#6E7A68', 1.8)); g.append(line([(cx_ - w_, cy_ + 1), (cx_ + w_, cy_ + 1)], '#F4E2C2', 1.5, 'opacity=".7"'))
    for k in range(3): g.append(poly(blob(R, cx_ - w_ * .4 + k * w_ * .4, cy_ - h_ * .6, h_ * .35, 7, .2), '#7A8774', 'none', 0))
y = 652
while y < 1000:   # ripples in perspective: short strokes, longer and sparser toward us
    k = (y - 645) / 350
    for _ in range(int(16 - 8 * k)):
        x = R.uniform(0, 1920); L = 6 + 30 * k * R.uniform(.6, 1.4)
        g.append(line([(x, y), (x + L, y)], R.choice(['#A3B6C3', '#B9C8D0']), .9 + 1.6 * k, f'opacity="{R.uniform(.45, .8):.2f}"'))
    y += 5 + 18 * k
for _ in range(80):   # glints on the water, thicker toward the sun
    x = R.uniform(900, 1920); y = R.uniform(655, 880)
    if R.random() > (x - 900) / 1020 + .15: continue
    L = R.uniform(8, 26) * (1 + (y - 650) / 300); g.append(line([(x, y), (x + L, y)], '#FFFFFF', 1.6 + (y - 650) / 200, f'opacity="{R.uniform(.35, .7):.2f}"'))
def boat(x, y, s, kind):
    if kind == 'sail':
        g.append(line([(x - 26 * s, y + 3 * s), (x - 70 * s, y + 4 * s)], '#E9EEF0', 2 * s, 'opacity=".8"'))   # wake
        g.append(poly([(x - 14 * s, y), (x + 14 * s, y), (x + 10 * s, y + 5 * s), (x - 11 * s, y + 5 * s)], '#4A3A32', INK, 1.5))
        g.append(poly([(x - 2 * s, y - 2 * s), (x - 2 * s, y - 30 * s), (x + 12 * s, y - 3 * s)], '#F6F1E6', INK, 1.5))
        g.append(poly([(x - 4 * s, y - 3 * s), (x - 4 * s, y - 22 * s), (x - 13 * s, y - 3 * s)], '#EADFC8', INK, 1.5))
    else:
        g.append(line([(x + 32 * s, y + 4 * s), (x + 110 * s, y + 6 * s)], '#E9EEF0', 2.4 * s, 'opacity=".8"'))
        g.append(poly([(x - 34 * s, y - 4 * s), (x + 30 * s, y - 4 * s), (x + 26 * s, y + 5 * s), (x - 30 * s, y + 5 * s)], '#3A3436', INK, 1.6))
        g.append(poly([(x - 18 * s, y - 4 * s), (x + 14 * s, y - 4 * s), (x + 14 * s, y - 11 * s), (x - 18 * s, y - 11 * s)], '#F1EBDD', INK, 1.4))
        g.append(poly([(x - 4 * s, y - 11 * s), (x + 3 * s, y - 11 * s), (x + 3 * s, y - 22 * s), (x - 4 * s, y - 22 * s)], '#B9473A', INK, 1.4))
        for k in range(4): g.append(ell(x - 10 * s - k * 9 * s, y - 27 * s - k * 4 * s, (5 + k * 2) * s, (3 + k) * s, '#E8E2DA', 'none', 0, f'opacity="{.8 - k * .15:.2f}"'))
boat(1290, 700, .55, 'sail'); boat(980, 742, .7, 'sail'); boat(700, 676, .45, 'sail'); boat(1420, 790, .85, 'sail'); boat(420, 668, .5, 'steam')
save('b_back', svg(bdefs, g))
# --- mid: Sugarloaf and Urca, the near shore and the city far below, under haze
g = []
LOAF0 = [(1540, 905), (1552, 866), (1566, 820), (1584, 776), (1606, 742), (1634, 718), (1664, 707), (1694, 713), (1718, 735), (1736, 772), (1750, 822), (1760, 870), (1766, 905)]
g.append(poly([(x, 905 + (905 - y) * .32) for x, y in LOAF0], '#8E9AB0', 'none', 0, 'opacity=".45"'))   # Sugarloaf's reflection in the cove
loaf = [(1540, 905), (1552, 866), (1566, 820), (1584, 776), (1606, 742), (1634, 718), (1664, 707), (1694, 713), (1718, 735), (1736, 772), (1750, 822), (1760, 870), (1766, 905)]
urca = [(1392, 906), (1410, 884), (1440, 866), (1478, 858), (1514, 864), (1540, 880), (1556, 906)]
babi = [(1766, 906), (1790, 884), (1830, 872), (1880, 870), (1920, 878), (1920, 906)]
g.append(poly(loaf, P['loaf'], P['loaf_l'], 2.5))
g.append(poly([(1694, 713), (1718, 735), (1736, 772), (1750, 822), (1760, 870), (1766, 905), (1738, 905), (1734, 862), (1726, 816), (1714, 772), (1700, 740), (1684, 718)], P['loaf_lit'], 'none', 0, 'opacity=".8"'))
g.append(line([(1694, 714), (1718, 736), (1736, 773), (1750, 823), (1760, 871)], P['rim'], 3, 'opacity=".75"'))
for _ in range(14):
    x = R.uniform(1580, 1740); y0 = ey(loaf[:7], x) if x < 1664 else ey(loaf[6:], x); y0 += R.uniform(8, 20); L = R.uniform(20, 60)
    if y0 + L > 890: continue
    g.append(line([(x, y0), (x - L * .06, y0 + L)], '#7E7596', 1.6, 'opacity=".55"'))
for hill in (urca, babi):
    g.append(poly(hill, P['urca'], P['urca_l'], 2))
    for _ in range(18):
        x = R.uniform(hill[0][0] + 10, hill[-1][0] - 6); y = ey(hill, x) + R.uniform(4, 22)
        if inside(hill, x, y): g.append(poly(blob(R, x, y, R.uniform(5, 8), 8, .2), R.choice(['#6E8168', '#788B70', '#677A62']), 'none', 0))
for _ in range(16):   # green fringe at Sugarloaf's foot
    x = R.uniform(1545, 1760); g.append(poly(blob(R, x, 900 - R.uniform(0, 8), R.uniform(5, 9), 8, .2), R.choice(['#6E8168', '#677A62']), 'none', 0))
# the near shore: the beaches of Botafogo / Flamengo, then the city running down to the foot of the mountain
shoreR = [(1060, 1000), (1150, 972), (1250, 950), (1350, 938), (1450, 932), (1560, 934), (1660, 944), (1760, 956), (1920, 968)]
shoreL = [(0, 900), (120, 905), (240, 914), (360, 928), (470, 952), (520, 1000)]
landR = shoreR + [(1920, 1080), (1060, 1080)]; landL = shoreL + [(520, 1080), (0, 1080)]
for land, shore in ((landR, shoreR), (landL, shoreL)):
    g.append(poly(land, P['land'], 'none', 0))
HOUSE = ['#E2C49A', '#D9A898', '#B9C6CB', '#EEE0C6', '#AEB894', '#E8CDB0', '#CBB0BE', '#F0E4C2']
rows = []
y = 904
while y < 1060:
    sc = .55 + (y - 900) / 170; rows.append((y, sc)); y += 7 * sc
for (y, sc) in rows:
    x = R.uniform(-10, 10)
    while x < 1930:
        w = R.uniform(7, 15) * sc; hh = R.uniform(5, 10) * sc; tall = R.random() < .08
        if tall: hh *= 2.2; w *= .8
        land = landR if x > 760 else landL; shore = shoreR if x > 760 else shoreL
        if inside(land, x + w / 2, y) and y > ey(shore, x + w / 2) + 3 + hh * .6:
            col = '#F1EBDD' if tall else R.choice(HOUSE)
            stroke = ' stroke="#6A5A50" stroke-width=".7"' if sc > .95 else ''
            g.append(f'<rect x="{x:.1f}" y="{y - hh:.1f}" width="{w:.1f}" height="{hh:.1f}" fill="{col}"{stroke}/>')
            if not tall and R.random() < .7: g.append(f'<rect x="{x - .5:.1f}" y="{y - hh - 1.6 * sc:.1f}" width="{w + 1:.1f}" height="{2.4 * sc:.1f}" fill="{R.choice(["#B9694E", "#A85E46", "#C27A5A"])}"/>')
            if tall:
                for k in range(1, int(hh / (3 * sc))): g.append(line([(x + 1.5, y - hh + k * 3 * sc), (x + w - 1.5, y - hh + k * 3 * sc)], '#9AA0A8', .8))
        elif inside(land, x + w / 2, y) and R.random() < .5:
            g.append(poly(blob(R, x + w / 2, y - 3 * sc, 4 * sc, 7, .2), R.choice(['#6F8A5A', '#7E965F', '#5F7A50']), 'none', 0))
        x += w + R.uniform(.5, 5) * sc
for shore in (shoreR, shoreL):   # beaches, with their lit edge
    g.append(line(shore, P['beach'], 6)); g.append(line([(px, py - 3) for px, py in shore], '#F7EEDA', 1.6, 'opacity=".8"'))
for _ in range(40):   # palms and street trees along the beaches
    sh = shoreR if R.random() < .75 else shoreL; x = R.uniform(sh[0][0] + 10, sh[-1][0] - 10); y = ey(sh, x) + R.uniform(7, 11)
    g.append(poly(blob(R, x, y - 3, R.uniform(2.5, 4), 7, .2), R.choice(['#5F7A50', '#6F8A5A']), 'none', 0))
hillL = [(0, 925), (80, 918), (160, 916), (240, 924), (320, 940), (400, 962), (470, 990), (520, 1030), (540, 1080), (0, 1080)]   # Santa Teresa ridge, nearer, hazy
g.append(poly(hillL, '#6F8466', '#55684F', 2))
for _ in range(90):
    x = R.uniform(0, 540); y = R.uniform(ey(hillL[:9], x) + 2, 1080)
    if not inside(hillL, x, y): continue
    if R.random() < .22: g.append(f'<rect x="{x:.1f}" y="{y - 6:.1f}" width="{R.uniform(8, 13):.1f}" height="7" fill="{R.choice(HOUSE)}" stroke="#5E4E48" stroke-width=".7"/>')
    else: g.append(poly(blob(R, x, y, R.uniform(7, 12), 8, .2), R.choice(['#7A9070', '#668060', '#86996F']), 'none', 0))
g.append('<rect x="0" y="640" width="1920" height="440" fill="url(#b_haze)"/>')
save('b_mid', svg(bdefs, g))
# --- forest: the forested flanks of Corcovado falling away on both sides of the summit
g = []
FL = [(0, 958), (90, 960), (180, 966), (270, 976), (350, 990), (420, 1006), (470, 1030), (500, 1080), (0, 1080)]
FR = [(1080, 1010), (1150, 996), (1240, 1004), (1340, 1016), (1460, 1026), (1600, 1034), (1760, 1040), (1920, 1044), (1920, 1080), (1080, 1080)]
for F, lit in ((FL, .15), (FR, .6)):
    g.append(poly(F, P['forest'], INK, 2.5))
    edge = F[:-2]
    xs = [p[0] for p in F]
    for _ in range(170):
        x = R.uniform(min(xs), max(xs)); y = R.uniform(ey(edge, x) - 4, 1090)
        if not inside(F, x, y) and y > ey(edge, x) + 2: continue
        col = P['leaf_lit'] if R.random() < lit * (1.2 - (y - 950) / 200) else R.choice(P['leaf'])
        g.append(poly(blob(R, x, y, R.uniform(9, 17) * (1 + (y - 960) / 260), 9, .2), col, '#2F4229', 1.2))
    for x in range(int(min(xs)) + 8, int(max(xs)), 26):   # a bumpy canopy line along the top
        y = ey(edge, x); g.append(poly(blob(R, x, y + 4, R.uniform(11, 16), 9, .18), R.choice(P['leaf'] + [P['leaf_lit']] * int(lit * 4)), '#2F4229', 1.4))
save('b_forest', svg(bdefs, g))
# --- rock: the granite summit and the levelled work platform
g = []
PLAT = [(430, 948), (500, 938), (620, 932), (760, 930), (900, 932), (1020, 938), (1110, 948), (1080, 960), (900, 966), (760, 968), (600, 966), (470, 960)]
ROCK = [(430, 948), (470, 960), (600, 966), (760, 968), (900, 966), (1080, 960), (1110, 948), (1138, 962), (1166, 984), (1192, 1014), (1214, 1048), (1230, 1080),
        (318, 1080), (334, 1046), (356, 1012), (384, 982), (408, 962)]
g.append(poly(ROCK, P['rock'], INK, 3))
g.append(poly([(1000, 1080), (1010, 1030), (1030, 990), (1060, 966), (1094, 962), (1090, 1000), (1086, 1040), (1090, 1080)], '#9E909E', 'none', 0, 'opacity=".8"'))
g.append(poly([(1110, 948), (1138, 962), (1166, 984), (1192, 1014), (1214, 1048), (1230, 1080), (1090, 1080), (1086, 1040), (1090, 1000), (1094, 962)], P['rock_lit'], 'none', 0))
g.append(poly([(430, 948), (408, 962), (384, 982), (356, 1012), (334, 1046), (318, 1080), (440, 1080), (446, 1030), (458, 990), (474, 962)], P['rock_sh'], 'none', 0))
g.append(line([(1112, 952), (1139, 966), (1167, 988), (1193, 1018), (1214, 1052), (1228, 1080)], P['rim'], 3.5, 'opacity=".85"'))
for _ in range(70):   # granite: long weathering streaks down the dome, and a few cracks
    x = R.uniform(330, 1220); y0 = 968 + R.uniform(2, 26); L = R.uniform(24, 90); sg = 1 if x > 760 else -1
    if not inside(ROCK, x, y0) or not inside(ROCK, x - L * .12 * sg, min(1078, y0 + L)): continue
    g.append(line([(x, y0), (x - L * .06 * sg, y0 + L * .5), (x - L * .1 * sg, y0 + L)], '#8D7F8C' if x > 1060 else P['rock_line'], R.uniform(1.4, 2.6), 'opacity=".55"'))
for _ in range(9):
    x = R.uniform(480, 1040); y0 = 975 + R.uniform(0, 20)
    g.append(line([(x, y0), (x + R.uniform(-10, 10), y0 + 14), (x + R.uniform(-14, 14), y0 + 30)], INK, 1.6, 'opacity=".45"'))
for _ in range(110):   # the forest climbing the lower dome: a canopy band with a ragged top edge
    x = R.uniform(310, 1240); y = R.uniform(1052, 1100) - 18 * math.exp(-((x - 760) / 260) ** 2) * R.random()
    if not inside(ROCK, x, min(y, 1078)) and x > 340 and x < 1220: continue
    g.append(poly(blob(R, x, y, R.uniform(12, 20), 9, .2), P['leaf_lit'] if x > 1000 and R.random() < .5 else R.choice(P['leaf']), '#2F4229', 1.3))
g.append(poly(PLAT, P['plat'], INK, 2.5))
g.append(poly([(470, 960), (600, 966), (760, 968), (900, 966), (1080, 960), (1110, 948), (1104, 952), (900, 961), (760, 963), (600, 961), (474, 955)], P['plat_l'], 'none', 0))
for k in range(12):   # cut-stone texture on the platform
    x = 470 + k * 55 + R.uniform(-8, 8); y = 940 + R.uniform(0, 18)
    g.append(line([(x, y), (x + R.uniform(14, 30), y + R.uniform(-1, 1))], '#9A8D78', 1.4, 'opacity=".7"'))
for (x, y, r) in [(420, 972, 11), (408, 990, 13), (392, 1012, 12), (1122, 968, 10), (1140, 990, 12), (1160, 1020, 13), (370, 1040, 14), (1180, 1052, 12)]:
    g.append(poly(blob(R, x, y, r, 9, .22), R.choice(P['leaf']), '#2F4229', 1.4))
save('b_rock', svg(bdefs, g))
# --- front: big leaves in the bottom corners, close to the lens
g = []
for (cx_, cy_, n, sgn) in ((120, 1080, 9, 1), (1800, 1080, 8, -1)):
    for i in range(n):
        a = math.radians(200 + i * (140 / (n - 1))) if sgn > 0 else math.radians(200 + i * (140 / (n - 1)))
        L = R.uniform(110, 180); w = R.uniform(26, 38); bx, by = cx_ + R.uniform(-90, 90), cy_ + R.uniform(0, 20)
        tip = (bx + L * math.cos(a) * .9, by + L * math.sin(a) * .55)
        mx, my = (bx + tip[0]) / 2, (by + tip[1]) / 2; nx, ny = -(tip[1] - by), tip[0] - bx; nl = math.hypot(nx, ny) or 1; nx, ny = nx / nl * w, ny / nl * w
        leaf = [(bx, by), (mx + nx, my + ny), tip, (mx - nx, my - ny)]
        g.append(poly(leaf, R.choice(['#35502F', '#3E5A36', '#2F472A']), INK, 2.5))
        g.append(line([(bx, by), tip], '#5F7D48', 2, 'opacity=".8"'))
        if (tip[0] - bx) * (-sgn) < 0: g.append(line([(mx + nx * .8, my + ny * .8), tip], '#9DB36A', 2.5, 'opacity=".7"'))
save('b_front', svg(bdefs, g))
J['b'] = dict(plat=PLAT)

# ================================================================== the statue (christ_vector.py, statue units) for shot B
sv = sys.argv; sys.argv = ['christ_vector.py', os.devnull]
G = runpy.run_path(os.path.join(HERE, 'christ_vector.py'))
sys.argv = sv
el = G['g']
i0 = next(i for i, e in enumerate(el) if 'url(#col)' in e and e.startswith('<polygon')); i1 = next(i for i, e in enumerate(el) if e.startswith('<polygon points="700,1950'))
CP = G['P']
REC = {CP['st']: '#BDB5A8', CP['st_lit']: '#E6DAC4', CP['st_sh']: '#8F8B88', CP['st_deep']: '#6B6766', CP['st_hair']: '#A39D93', CP['st_face']: '#D8CDBB',
       CP['st_line']: '#6E6862', CP['flute']: '#76716A', CP['flute_hi']: '#EADFCB', 'url(#col)': 'url(#sv_col)'}
def fix(e):
    for a_, b_ in REC.items(): e = e.replace(f'"{a_}"', f'"{b_}"')
    m = re.search(r'stroke="([^"]+)"', e); w = re.search(r'stroke-width="([\d.]+)"', e)
    if m and w and m.group(1) != 'none' and float(w.group(1)) > 0:
        sw = float(w.group(1)); nw = max(1.6, min(2.5, sw * .8)) if m.group(1) == INK else max(1.0, min(2.4, sw * .55))
        e = e.replace(w.group(0), f'stroke-width="{nw:.2f}" vector-effect="non-scaling-stroke"', 1)
    return e
stat = [fix(e) for e in el[i0:i1]]
def L_(p, w, op=1): return f'<polyline points="{" ".join(f"{x},{y}" for x, y in p)}" fill="none" stroke="#FFE1A0" stroke-width="{w}" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" opacity="{op}"/>'
stat += [L_(G['RTOP'] + G['RH'][:6], 2.2), L_(G['HEAD'][5:], 2.2), L_(G['LTOP'][3:], 1.6, .7), L_([(951, 1340), (951, 1600), (964, 1610)], 2), L_(G['colR'], 2, .85)]
cloak = G['cloak']; col = G['colL'] + G['colR'][::-1]
J['statue'] = dict(svg=''.join(stat), cloak=cloak, col=col)
json.dump(J, open(f'{OUT}/christ.json', 'w'))
print('ok', OUT, len(stat), 'statue elements;', ', '.join(f'{k}: hand {v["hand"]} sF {v["sF"]}' for k, v in arms.items()))
