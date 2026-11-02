"""ep57 斗兽场 (colosseum.jpg, 2576x1931): the scene drawn in code (our lines, our palette), laid over the
photo's layout so the shutter cut drawing → photo lines up. Every coordinate was read off a full-res grid of
the photo; repeated details are generated (arches / piers / pilasters along the curved wall from measured bay
centres, attic windows and putlog holes, pock-marks, gates, cobble rows, rail posts, grass, tourists).
usage: colosseum_vector.py out.svg"""
import sys, math, random
W, H = 2576, 1931
R = random.Random(57)
INK = '#2A211B'
P = dict(sky0='#386BBD', sky1='#4C86D3', sky2='#76ACE7', cloud='#F1F5FA',
         att0='#9F775A', att1='#CFA87C', att_arc='#C79F76', att_hole='#6A4A36', att_line='#86634A',
         trav0='#E2D4B8', trav1='#D3BF9D', pil='#F0E7D4', blind='#C6B08C', band='#EAE0CA', band_d='#C4AF8C',
         open='#3A332E', open2='#4B423A', inner='#8E6F55', gate='#77706A', gate_bar='#4A4643', hole='#6B5A49',
         ruin='#8E7C68', ruin_d='#5D544B', ruin_lit='#DCCFB8', ruin_col='#D3C3A6', wedge='#C9996B', wedge_c='#A9784F',
         lb='#B8956F', lb_l='#D6BE98', lb_d='#96714F', lb_brick='#A47A58',
         iny='#D8BE8A', iny_l='#E8D5AA', inb='#9B6C4C', inb_l='#B9875F',
         door='#BA6640', door_d='#7E3F27', banner='#D9508A',
         bldg1='#D8A55F', bldg2='#B9694B', bldg_roof='#8E4B36', win='#5C4537', hedge='#5E8B3A',
         tree0='#3E5A2F', tree1='#557539', tree2='#71904A', tree_d='#2D4325', fence='#24282A',
         road='#A3A097', walk='#C9C4B8', lawn0='#7FA846', lawn1='#4F7A2A', grass_d='#3D6922', grass_l='#9CC15E',
         patch='#BDB497', curb='#D9D4C8', curb_d='#A9A397', cob='#8E8C87', cob_l='#B2B0AA', cob_d='#6C6A66',
         side='#CEC6B5', side_d='#AFA693', asph='#A09A8E', grate='#4E4A45',
         blk_cap='#DCD2C1', blk='#A96B4B', blk_side='#7B4E3A', blk_line='#CD9474',
         boll='#E0D9C9', boll_d='#ADA595', rail='#2B2C2C', skin='#C99572', shadow='#5F5D59')

def pts(p): return ' '.join(f'{x:.0f},{y:.0f}' for x, y in p)
def poly(p, fill, stroke=INK, sw=3, extra=''): return f'<polygon points="{pts(p)}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" {extra}/>'
def line(p, stroke=INK, sw=3, extra=''): return f'<polyline points="{pts(p)}" fill="none" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" {extra}/>'
def segs(ss, stroke=INK, sw=2, extra=''):
    """many short strokes as one path element"""
    d = ' '.join(f'M{a[0]:.0f} {a[1]:.0f}L{b[0]:.0f} {b[1]:.0f}' for a, b in ss)
    return f'<path d="{d}" fill="none" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" {extra}/>'
def ell(cx, cy_, rx, ry, fill, stroke='none', sw=0, extra=''): return f'<ellipse cx="{cx:.0f}" cy="{cy_:.0f}" rx="{rx:.1f}" ry="{ry:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>'
def lerp(a, b, t): return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
def cy(curve, x):
    """y of a polyline listed left → right at x (held flat past the ends)"""
    if x <= curve[0][0]: return curve[0][1]
    for a, b in zip(curve, curve[1:]):
        if a[0] <= x <= b[0]: return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0] or 1)
    return curve[-1][1]
def span(curve, x0, x1, n=12): return [(x0 + (x1 - x0) * i / n, cy(curve, x0 + (x1 - x0) * i / n)) for i in range(n + 1)]
def arch(x0, x1, crown, bot0, bot1=None, n=12):
    """round-headed opening: jambs from the sill up to the spring line, half-ellipse head up to the crown"""
    bot1 = bot0 if bot1 is None else bot1; r = (x1 - x0) / 2; c = (x0 + x1) / 2
    spring = min(crown + r, min(bot0, bot1) - 4); ry = spring - crown
    head = [(c - r * math.cos(math.pi * i / n), spring - ry * math.sin(math.pi * i / n)) for i in range(n + 1)]
    return [(x0, bot0)] + head + [(x1, bot1)]
def widths(cs, k):
    """opening widths from the local bay spacing (bays narrow toward the far end of the curve)"""
    out = []
    for i, c in enumerate(cs):
        a = cs[max(0, i - 1)]; b = cs[min(len(cs) - 1, i + 1)]; s = (b - a) / (2 if 0 < i < len(cs) - 1 else 1)
        out.append(k * s)
    return out
def inside(p, x, y):
    c = False
    for (x1, y1), (x2, y2) in zip(p, p[1:] + p[:1]):
        if (y1 > y) != (y2 > y) and x < x1 + (x2 - x1) * (y - y1) / (y2 - y1): c = not c
    return c
def blob(cx, cy_, r, n=9, j=.28):
    return [(cx + r * (1 + R.uniform(-j, j)) * math.cos(2 * math.pi * i / n), cy_ + r * .82 * (1 + R.uniform(-j, j)) * math.sin(2 * math.pi * i / n)) for i in range(n)]

g = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">',
     '<defs>'
     f'<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{P["sky0"]}"/><stop offset=".45" stop-color="{P["sky1"]}"/><stop offset=".72" stop-color="{P["sky2"]}"/></linearGradient>'
     f'<linearGradient id="trav" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="{P["trav0"]}"/><stop offset="1" stop-color="{P["trav1"]}"/></linearGradient>'
     f'<linearGradient id="attic" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="{P["att0"]}"/><stop offset=".55" stop-color="#B48C67"/><stop offset="1" stop-color="{P["att1"]}"/></linearGradient>'
     f'<linearGradient id="lawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{P["lawn0"]}"/><stop offset="1" stop-color="{P["lawn1"]}"/></linearGradient>'
     f'<linearGradient id="road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{P["walk"]}"/><stop offset=".22" stop-color="{P["road"]}"/><stop offset="1" stop-color="#8F8C84"/></linearGradient>'
     '</defs>',
     f'<rect width="{W}" height="{H}" fill="url(#sky)"/>']

# ---------------------------------------------------------------- sky details + the town on the right
for cx_, cy_, w in [(2500, 1215, 46), (2468, 1043, 30)]:   # two small fair-weather clouds low on the right
    g.append(poly(blob(cx_, cy_, w, 10, .18), P['cloud'], 'none', 0, 'opacity=".85"'))
    g.append(poly(blob(cx_ + w * .7, cy_ + 6, w * .6, 9, .15), P['cloud'], 'none', 0, 'opacity=".85"'))
g.append(poly([(2448, 1290), (2468, 1275), (2565, 1265), (2576, 1265), (2576, 1445), (2448, 1445)], P['bldg1'], INK, 2.5))
g.append(poly([(2489, 1336), (2530, 1318), (2576, 1316), (2576, 1440), (2489, 1440)], P['bldg2'], INK, 2.5))
g.append(poly([(2484, 1338), (2530, 1312), (2576, 1310), (2576, 1320), (2530, 1322), (2492, 1340)], P['bldg_roof'], INK, 2))
for r_ in range(4):   # windows, generated in rows
    for c_ in range(4):
        x, y = 2458 + c_ * 30, 1300 + r_ * 34
        if x > 2480 and y > 1330: continue
        g.append(poly([(x, y), (x + 12, y), (x + 12, y + 18), (x, y + 18)], P['win'], 'none', 0))
for r_ in range(3):
    for c_ in range(3):
        x, y = 2500 + c_ * 26, 1350 + r_ * 28
        g.append(poly([(x, y), (x + 10, y), (x + 10, y + 15), (x, y + 15)], P['win'], 'none', 0))
g.append(poly([(2436, 1440), (2470, 1424), (2520, 1420), (2576, 1416), (2576, 1478), (2436, 1478)], P['hedge'], '#3F5F28', 2.5))
g.append(line([(2566, 1265), (2568, 1190)], INK, 4)); g.append(poly([(2558, 1192), (2576, 1188), (2576, 1206), (2560, 1206)], '#3E4A52', INK, 2))

# ---------------------------------------------------------------- the outer wall: curves read off the photo
TOP = [(773, 801), (807, 796), (900, 786), (1011, 777), (1100, 772), (1189, 769), (1300, 768), (1450, 770), (1539, 774), (1628, 781),
       (1717, 788), (1806, 797), (1894, 810), (1983, 830), (2072, 850), (2161, 863), (2190, 870)]
AB = [(773, 890), (1050, 891), (1300, 890), (1500, 892), (1600, 896), (1810, 908), (1910, 921), (2000, 935), (2100, 955), (2210, 978)]   # attic base
E3 = [(890, 998), (1300, 996), (1600, 1003), (1800, 1011), (2000, 1025), (2100, 1038), (2210, 1056)]   # band between tiers 3 and 2 (top)
C2 = [(900, 1026), (1550, 1027), (1650, 1037), (1760, 1040), (1870, 1047), (1975, 1056), (2068, 1072), (2160, 1084), (2230, 1098), (2280, 1109),
      (2330, 1127), (2362, 1136), (2390, 1150), (2412, 1160)]   # tier-2 arch crowns
B2 = [(900, 1204), (1500, 1205), (1700, 1218), (2000, 1225), (2200, 1242), (2262, 1228), (2314, 1242), (2350, 1250), (2412, 1262)]   # tier-2 sills
E2 = [(890, 1257), (1600, 1265), (1800, 1274), (2100, 1283), (2210, 1292)]   # band between tiers 2 and 1 (top)
E2B = [(890, 1296), (1600, 1300), (2100, 1310), (2210, 1318)]
C1 = [(900, 1312), (1600, 1318), (1770, 1322), (1882, 1327), (1988, 1332), (2086, 1338), (2172, 1343), (2246, 1349), (2301, 1354), (2345, 1359),
      (2383, 1365), (2440, 1375)]   # ground-tier arch crowns
GND = 1500
T1C = [986, 1115, 1247, 1384, 1516, 1646, 1770, 1882, 1988, 2086, 2172]   # bay centres, measured at each tier
T2C = [989, 1117, 1247, 1380, 1510, 1641, 1760, 1870, 1975, 2068, 2158]
T3C = [986, 1115, 1245, 1378, 1507, 1639, 1755, 1862, 1965, 2060, 2150]
T1R = [2246, 2301, 2345, 2383, 2406, 2421, 2433]   # the inner ring on the right (outer ring gone)
T2R = [2224, 2279, 2327, 2362, 2387, 2403]

# face of the outer wall
g.append(poly(TOP + [(2201, 947), (2210, 987), (2210, 1502), (900, 1500), (900, 890), (773, 890)], 'url(#trav)', INK, 3))

# ---------------------------------------------------------------- the inner ring on the right end
RS = [(2199, 989), (2228, 994), (2264, 1005), (2300, 1017), (2336, 1030), (2362, 1040), (2365, 1007), (2390, 1006), (2392, 1048), (2404, 1091),
      (2408, 1113), (2415, 1156), (2419, 1210), (2426, 1257), (2433, 1300), (2440, 1372), (2444, 1462), (2446, 1502), (2199, 1502)]
g.append(poly(RS, P['iny'], INK, 3))
g.append(poly([(2199, 989), (2228, 994), (2264, 1005), (2300, 1017), (2336, 1030), (2362, 1040), (2392, 1048), (2400, 1076), (2340, 1062), (2270, 1050), (2205, 1048)], P['inb'], INK, 2.5))
g.append(poly([(2365, 1007), (2390, 1006), (2392, 1048), (2365, 1044)], P['inb_l'], INK, 2.5))   # the stub chimney
for k in range(1, 4):   # brick courses on that top band
    t = k / 4; g.append(line([lerp(a, b, t) for a, b in zip([(2205, 994), (2264, 1007), (2336, 1032), (2392, 1050)], [(2205, 1048), (2270, 1050), (2340, 1062), (2400, 1076)])], '#82573C', 1.5))
g.append(poly([(2205, 1048), (2270, 1050), (2340, 1062), (2400, 1076), (2405, 1098), (2340, 1090), (2270, 1080), (2205, 1080)], P['iny_l'], INK, 2))
g.append(poly(arch(2300, 2329, 1046, 1096), P['open'], INK, 2.5))
for x in (2214, 2238, 2262):   # small square openings in the upper band
    y = cy([(2205, 1012), (2270, 1020)], x); g.append(poly([(x, y), (x + 13, y + 1), (x + 13, y + 22), (x, y + 21)], P['open'], INK, 1.5))
# tier 2 of the inner ring: arches with yellow piers
wR = widths(T2R, .7)
for c, w in zip(T2R, wR):
    x0, x1 = c - w / 2, c + w / 2
    g.append(poly(arch(x0, x1, cy(C2, c), cy(B2, x0), cy(B2, x1), 10), P['open'], INK, 2.5))
    g.append(line([(x0 + 2, cy(B2, x0) - 18), (x1 - 2, cy(B2, x1) - 18)], P['iny_l'], 3))   # the balustrade rail inside
for a, b in zip(T2R, T2R[1:]):   # yellow pilasters between
    m = (a + b) / 2; pw = (b - a) * .16
    g.append(poly([(m - pw, cy(C2, m) + 18), (m + pw, cy(C2, m) + 18), (m + pw, cy(B2, m)), (m - pw, cy(B2, m))], P['iny_l'], INK, 1.5))
# brick band + cornice between tiers 2 and 1 on the right
BB = [(2205, 1244), (2253, 1240), (2336, 1252), (2412, 1272), (2426, 1280)]; BB2 = [(2205, 1302), (2253, 1300), (2336, 1302), (2420, 1325), (2430, 1330)]
g.append(poly(BB + BB2[::-1], P['inb'], INK, 2.5))
for k in range(1, 4):
    t = k / 4; g.append(line([lerp(a, b, t) for a, b in zip(BB, BB2)], '#7E553B', 1.5))
BC = [(2205, 1334), (2336, 1336), (2433, 1350)]
g.append(poly(BB2 + BC[::-1], P['iny_l'], INK, 2))
wR = widths(T1R, .7)
for c, w in zip(T1R, wR):
    x0, x1 = c - w / 2, c + w / 2
    g.append(poly(arch(x0, x1, cy(C1, c), GND + 2, GND + 2, 10), P['open'], INK, 2.5))
    g.append(poly([(x0 + 2, 1440), (x1 - 2, 1440), (x1 - 2, GND), (x0 + 2, GND)], P['open2'], 'none', 0))
for a, b in zip(T1R, T1R[1:]):
    m = (a + b) / 2; pw = (b - a) * .17
    g.append(poly([(m - pw, cy(C1, m) + 10), (m + pw, cy(C1, m) + 10), (m + pw, GND), (m - pw, GND)], P['iny_l'], INK, 1.5))

# ---------------------------------------------------------------- the attic storey (brick), windows, holes
g.append(poly(TOP + [(2201, 947), (2210, 987)] + AB[::-1], 'url(#attic)', INK, 3))
for c in T3C:   # faint relieving arches in the brick, one per bay
    s = 64 * (1 if c < 1700 else (2190 - c) / 490 * .6 + .4); yb = cy(AB, c) - 10
    g.append(line([(c - s + s * 2 * i / 14, yb - 58 * math.sin(math.pi * i / 14) * (s / 64) ** .4 - 2) for i in range(15)], P['att_arc'], 7, 'opacity=".7"'))
for a, b in zip(T3C, T3C[1:]):   # attic pilasters over every pier
    m = (a + b) / 2 + 4; g.append(line([(m, cy(TOP, m) + 14), (m - 1, cy(AB, m) - 2)], P['att_line'], 3, 'opacity=".75"'))
for x0, x1, y0, y1 in [(978, 1011, 810, 870), (1224, 1267, 797, 859), (1483, 1526, 810, 899), (1726, 1768, 819, 879), (1839, 1874, 832, 892), (2039, 2070, 874, 952)]:
    g.append(poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], P['sky2'], INK, 3))      # square windows, sky behind
    j = (x1 - x0) * min(.5, max(.12, (x0 - 1300) / 1400))
    g.append(poly([(x1 - j, y0 + 4), (x1, y0), (x1, y1), (x1 - j, y1)], '#4A3A30', 'none', 0))   # the wall's depth on the far jamb
g.append(segs([((2163, 838), (2165, 985)), ((2184, 842), (2186, 985))] + [((2163, y), (2185, y + 1)) for y in range(850, 985, 19)], '#3A2C22', 4))   # scaffold ladder on the attic's end
for _ in range(75):   # putlog holes scattered in rows
    x = R.uniform(790, 2180); row = R.randint(0, 3); yt, yb = cy(TOP, x), cy(AB, x)
    y = yt + (yb - yt) * (.18 + row * .2) + R.uniform(-6, 6); s = R.uniform(4, 8) * (1 if x < 1800 else .8)
    g.append(poly([(x, y), (x + s, y), (x + s, y + s), (x, y + s)], P['att_hole'], 'none', 0))

# ---------------------------------------------------------------- tier 3 (top arcade): piers, blind + open arches
w3 = widths(T3C, .6)
for c, w in zip(T3C, w3):
    x0, x1 = c - w / 2, c + w / 2; crown = cy(AB, c) + 26; b0, b1 = cy(E3, x0), cy(E3, x1)
    if c in (1115, 1639):   # open to the sky
        g.append(poly(arch(x0, x1, crown, b0, b1), P['sky2'], INK, 3))
        g.append(poly([(x1 - w * .28, cy(E3, x1) - 2), (x1 - w * .22, crown + 30), (x1, crown + w * .3), (x1, b1)], P['inner'], INK, 2))
    elif c == 2060:
        g.append(poly(arch(x0, x1, crown, b0, b1), P['open'], INK, 3))
    else:   # walled-up bay: a blind arch
        g.append(poly(arch(x0 + 4, x1 - 4, crown + 4, b0, b1), P['blind'], '#8E7A5E', 2))
for a, b in zip([900] + T3C, T3C + [2205]):   # travertine pilaster blocks between bays
    m = (a + b) / 2 if a > 900 else 922; pw = (b - a) * .17 if a > 900 else 22
    yt, yb = cy(AB, m) - 6, cy(E3, m)
    g.append(poly([(m - pw, yt), (m + pw, yt), (m + pw, yb), (m - pw, yb)], P['pil'], INK, 2))
g.append(poly(span(E3, 890, 2210) + [(x, y + 21) for x, y in span(E3, 890, 2210)][::-1], P['band'], INK, 2.5))   # entablature 3|2

# ---------------------------------------------------------------- tier 2: arches (some show sky / the inner ring)
w2 = widths(T2C, .6)
SKY2 = {1247: 1073, 1380: 1068, 1510: 1096}   # bays where the sky shows through, down to this y
for c, w in zip(T2C, w2):
    x0, x1 = c - w / 2, c + w / 2; crown = cy(C2, c); b0, b1 = cy(B2, x0), cy(B2, x1)
    g.append(poly(arch(x0, x1, crown, b0, b1), P['open'], INK, 3))
    if c in SKY2:
        sk = [p for p in arch(x0, x1, crown, SKY2[c], SKY2[c]) if p[1] <= SKY2[c]]
        g.append(poly(sk, P['sky2'], 'none', 0))
        g.append(poly([(x0 + 2, SKY2[c]), (x1 - 2, SKY2[c] + 4), (x1 - 2, b1 - 2), (x0 + 2, b0 - 2)], P['inner'], 'none', 0))
        g.append(poly(arch(x0 + w * .22, x1 - w * .12, SKY2[c] + 18, b0 - 4, b1 - 4, 8), P['open2'], INK, 1.5))   # an inner-ring arch beyond
        g.append(poly(arch(x0, x1, crown, b0, b1), 'none', INK, 3))
    g.append(line([(x0 + 3, b0 - 20), (x1 - 3, b1 - 20)], '#6E655C', 2))   # railing inside the opening
for a, b in zip([920] + T2C, T2C + [2205]):
    m = (a + b) / 2; pw = (b - a) * .14 if a > 920 else 20
    yt, yb = cy(E3, m) + 21, cy(E2, m)
    g.append(poly([(m - pw, yt + 6), (m + pw, yt + 6), (m + pw, yb), (m - pw, yb)], P['pil'], INK, 2))
    g.append(poly([(m - pw - 5, yt), (m + pw + 5, yt), (m + pw + 5, yt + 10), (m - pw - 5, yt + 10)], P['band'], INK, 2))   # capital
g.append(poly(span(E2, 890, 2210) + span(E2B, 890, 2210)[::-1], P['band'], INK, 2.5))   # entablature 2|1
g.append(line(span([(890, 1277), (1600, 1283), (2100, 1296), (2210, 1305)], 890, 2210), P['band_d'], 2))

# ---------------------------------------------------------------- tier 1 (ground arcade) with gates
w1 = widths(T1C, .64)
for c, w in zip(T1C, w1):
    x0, x1 = c - w / 2, c + w / 2; crown = cy(C1, c)
    g.append(poly(arch(x0, x1, crown, GND, GND), P['open'], INK, 3))
    if c == 1115:   # the orange door under a dark fan-light
        g.append(poly([(x0 + 2, 1374), (x1 - 2, 1374), (x1 - 2, GND), (x0 + 2, GND)], P['door'], INK, 2.5))
        g.append(poly([(1100, 1412), (1138, 1412), (1138, 1443), (1100, 1443)], P['door_d'], INK, 2))
        g.append(segs([((c, crown + 4), (c, 1374)), ((x0 + 8, 1352), (x1 - 8, 1352))], '#5A524A', 2))
        continue
    gt = GND - 62 * (w / 80) ** .5
    g.append(poly([(x0 + 3, gt), (x1 - 3, gt), (x1 - 3, GND), (x0 + 3, GND)], P['gate'], INK, 1.5))
    nb = max(3, int(w / 11)); g.append(segs([((x0 + 3 + (w - 6) * i / nb, gt), (x0 + 3 + (w - 6) * i / nb, GND)) for i in range(1, nb)], P['gate_bar'], 2))
for x in (961, 983, 1006):   # pink banners in the first bay
    g.append(poly([(x, 1384), (x + 16, 1384), (x + 16, 1474), (x, 1474)], P['banner'], INK, 2))
for a, b in zip([920] + T1C, T1C + [2205]):
    m = (a + b) / 2; pw = (b - a) * .13 if a > 920 else 20
    yt = cy(E2B, m)
    g.append(poly([(m - pw, yt + 10), (m + pw, yt + 10), (m + pw, GND), (m - pw, GND)], P['pil'], INK, 2))
    g.append(poly([(m - pw - 5, yt), (m + pw + 5, yt), (m + pw + 5, yt + 10), (m - pw - 5, yt + 10)], P['band'], INK, 2))
g.append(poly([(2174, 978), (2201, 978), (2207, 1250), (2180, 1250)], P['pil'], INK, 2))   # Valadier's buttress edge
# pock-marks (the holes left where iron clamps were dug out), generated over the piers
for cs_, top_c, bot_c in [(T3C, AB, E3), (T2C, E3, E2), (T1C, E2B, [(0, 1480), (3000, 1480)])]:
    for a, b in zip(cs_, cs_[1:]):
        for _ in range(5 if b - a > 90 else 3):
            x = R.uniform(a + (b - a) * .3, b - (b - a) * .3); y = R.uniform(cy(top_c, x) + 18, cy(bot_c, x) - 10)
            g.append(ell(x, y, R.uniform(2.5, 5) * (b - a) / 120, R.uniform(3, 5.5), P['hole']))
# lamp post in front of the wall
g.append(line([(1650, 1168), (1651, 1525)], INK, 8)); g.append(line([(1650, 1168), (1651, 1525)], '#55585A', 4))
g.append(poly([(1640, 1150), (1660, 1150), (1664, 1172), (1636, 1172)], '#3E4448', INK, 2))

# ---------------------------------------------------------------- the left block (inner ring, where the outer ring fell)
LB = [(342, 827), (389, 842), (461, 881), (500, 898), (567, 892), (569, 864), (583, 853), (633, 853), (661, 842), (700, 837), (767, 856), (775, 890),
      (905, 890), (905, 1490), (340, 1478)]
g.append(poly(LB, P['lb'], INK, 3))
g.append(poly([(342, 827), (389, 842), (461, 881), (500, 898), (500, 920), (342, 870)], P['lb_brick'], INK, 2))
g.append(poly([(500, 898), (567, 892), (569, 864), (583, 853), (633, 853), (661, 842), (700, 837), (767, 856), (775, 890), (905, 890), (905, 920), (500, 918)], P['lb_brick'], INK, 2.5))
g.append(poly([(583, 853), (633, 853), (633, 862), (583, 862)], '#3C5A9C', INK, 2))   # the blue railing on the roof
for k in range(1, 3):
    g.append(line([(505, 898 + k * 7), (900, 898 + k * 7)], '#82603F', 1.5))
for k in range(1, 5):   # brick courses on the sloping roof stub, following its slope
    t = k / 5; g.append(line([lerp((342, 827), (342, 870), t), lerp((389, 842), (420, 885), t), lerp((461, 881), (470, 905), t), lerp((500, 898), (500, 920), t)], '#82603F', 1.5))
for k in range(1, 4):   # and on the rubble crest further right
    y0 = 860 + k * 12; g.append(line([(600, max(y0, 856)), (661, max(y0 - 6, 846)), (700, max(y0 - 8, 841)), (767, max(y0, 860)), (900, max(y0 + 10, 893))], '#82603F', 1.5, 'opacity=".8"'))
g.append(poly([(342, 925), (905, 925), (905, 940), (342, 942)], P['lb_l'], INK, 2))   # cornice at roof level
g.append(poly([(470, 1000), (905, 985), (905, 1000), (470, 1014)], P['lb_l'], INK, 2))   # cornice of the upper storey
for x0, x1, cr, bt in [(403, 500, 928, 1152), (503, 555, 1042, 1152), (606, 689, 1009, 1150), (767, 819, 950, 990), (769, 811, 1025, 1153), (833, 897, 1031, 1153)]:
    g.append(poly(arch(x0, x1, cr, bt), P['open'], INK, 3))
    g.append(line(arch(x0 - 8, x1 + 8, cr - 8, cr + (x1 - x0) / 2 + 6)[1:-1], P['lb_l'], 4))   # lit arch ring
for x0, x1 in [(560, 600), (695, 760), (815, 830)]:   # piers with a lit pilaster
    m = (x0 + x1) / 2; g.append(poly([(m - 9, 1014), (m + 9, 1014), (m + 9, 1150), (m - 9, 1150)], P['lb_l'], INK, 2))
g.append(poly([(400, 1150), (911, 1160), (911, 1178), (400, 1174)], P['lb_l'], INK, 2.5))   # balcony ledge
g.append(poly([(400, 1174), (911, 1178), (911, 1209), (400, 1209)], P['lb_d'], INK, 2))
for k in range(1, 3):
    g.append(line([(404, 1174 + k * 11), (908, 1178 + k * 10)], '#7C5C40', 1.5))
g.append(poly([(389, 1259), (944, 1259), (944, 1281), (389, 1281)], P['lb_l'], INK, 2.5))   # cornice over the ground storey
for x0, x1, cr, bt in [(500, 583, 1214, 1259), (894, 939, 1214, 1259)]:
    g.append(poly(arch(x0, x1, cr, bt), P['open'], INK, 2.5))
for x0, x1 in [(500, 550), (606, 675), (739, 814)]:
    g.append(poly(arch(x0, x1, 1310, 1462), P['open'], INK, 3))
    g.append(line(arch(x0 - 9, x1 + 9, 1301, 1310 + (x1 - x0) / 2 + 8)[1:-1], P['lb_l'], 5))
for m in (578, 707, 857):
    g.append(poly([(m - 12, 1290), (m + 12, 1290), (m + 12, 1462), (m - 12, 1462)], P['lb_l'], INK, 2))
g.append(poly([(400, 1209), (444, 1209), (444, 1264), (400, 1264)], P['lb_l'], INK, 2))
g.append(poly([(444, 1281), (490, 1281), (500, 1460), (452, 1460)], P['lb_l'], INK, 2.5))   # slanted pier
g.append(poly([(589, 1168), (630, 1158), (672, 1168), (672, 1259), (589, 1259)], '#E4DDCF', INK, 2.5))   # the plaque
g.append(segs([((630, 1164), (630, 1192)), ((620, 1174), (640, 1174))], INK, 3))
g.append(segs([((600, 1214 + k * 9), (662, 1214 + k * 9)) for k in range(4)], '#9C9488', 2))
g.append(segs([((x, 1372 + (x - 480) * .01), (x, 1482)) for x in range(484, 905, 13)], '#2E2C2B', 2.5))   # iron railing along the base
g.append(line([(482, 1372), (905, 1376)], '#2E2C2B', 3)); g.append(line([(482, 1430), (905, 1433)], '#2E2C2B', 2))
for xa, xb, ya in [(422, 555, 1140), (622, 678, 1142), (789, 911, 1136)]:   # visitors on the balconies (generated heads)
    for x in range(xa, xb, 9):
        y = ya + R.uniform(-4, 6); col = R.choice(['#3B4F7A', '#C24B45', '#E8E2D6', '#2F2F33', '#6C8F4E'])
        g.append(poly([(x - 4, y + 7), (x + 4, y + 7), (x + 5, 1152), (x - 5, 1152)], col, 'none', 0))
        g.append(ell(x, y + 2, 3.5, 4, '#2D2420'))

# ---------------------------------------------------------------- the tall broken end (left)
TL = [(222, 416), (173, 449), (147, 502), (133, 551), (131, 613), (133, 676), (147, 738), (120, 782), (107, 827), (107, 889), (104, 978), (98, 996),
      (78, 1022), (73, 1058), (80, 1093), (84, 1160), (86, 1500)]
TRr = [(269, 418), (271, 442), (298, 458), (312, 620), (341, 633), (337, 707), (333, 751), (337, 773), (342, 827), (345, 990), (404, 1000), (406, 1160), (400, 1500)]
g.append(poly(TL + TRr[::-1], P['ruin'], INK, 3))
g.append(poly([(222, 416), (173, 449), (147, 502), (133, 551), (131, 613), (133, 676), (147, 738), (200, 712), (249, 694), (249, 444)], P['ruin_d'], INK, 2.5))   # the attic, seen from inside
g.append(poly([(226, 452), (249, 444), (249, 690), (230, 698)], P['ruin_lit'], INK, 2))   # a lit radial wall
for i, x in enumerate((162, 186, 208)):   # window slits through the attic
    yt = cy([(140, 505), (180, 470), (215, 455)], x); yb = cy([(147, 735), (200, 712), (249, 694)], x) - 18
    g.append(poly([(x, yt + 18), (x + 12 - i, yt + 14), (x + 12 - i, yb), (x, yb + 2)], '#3E3731', INK, 1.5))
for (x, y) in [lerp(a, b, t) for a, b in zip(TL[:7], TL[1:7]) for t in (0, .5)]:   # corbels along the curved edge
    g.append(poly([(x - 9, y), (x + 3, y), (x + 3, y + 8), (x - 9, y + 8)], '#4A433C', 'none', 0))
WED = [(249, 444), (271, 442), (298, 458), (312, 620), (249, 622)]
g.append(poly(WED, P['wedge'], INK, 2.5))   # Stern's brick buttress, sunlit
for y in range(460, 620, 14):
    g.append(line([(250, y), (298 + (y - 458) * (312 - 298) / (620 - 458) - 2, y)], P['wedge_c'], 1.5))
g.append(poly([(312, 622), (341, 633), (337, 707), (312, 700)], P['wedge'], INK, 2.5))
for y in range(636, 700, 10):
    g.append(line([(314, y), (338, y + 2)], P['wedge_c'], 1.5))
BA = [(147, 742), (200, 712), (260, 690), (300, 676), (342, 670)]
g.append(poly(BA + [(x, y + 15) for x, y in BA][::-1], P['ruin_lit'], INK, 2.5))   # cornice under the attic
g.append(poly([(276, 705), (337, 707), (333, 751), (337, 773), (342, 900), (300, 905), (276, 905)], P['wedge'], INK, 2.5))
for y in range(716, 900, 13):
    g.append(line([(278, y), (336, y)], P['wedge_c'], 1.5))
for x0, x1, cr, bt in [(112, 125, 846, 905), (133, 151, 830, 897), (164, 191, 800, 880), (209, 247, 769, 870), (281, 300, 764, 884)]:   # tier-3 openings
    g.append(poly(arch(x0, x1, cr, bt, n=8), P['open'], INK, 2.5))
for x0, x1, yt in [(126, 132, 820), (152, 162, 795), (192, 207, 760), (249, 274, 700)]:   # lit columns
    g.append(poly([(x0, yt), (x1, yt), (x1, cy([(98, 992), (173, 947), (249, 918), (345, 910)], x1)), (x0, cy([(98, 992), (173, 947), (249, 918), (345, 910)], x0))], P['ruin_col'], INK, 2))
B3T = [(98, 992), (173, 947), (249, 918), (345, 910)]; B3B = [(73, 1025), (129, 993), (218, 979), (307, 973), (345, 972)]
g.append(poly(B3T + [(404, 1000), (345, 990)][:0] + B3B[::-1], P['ruin_lit'], INK, 2.5))   # entablature 3|2 of the ruin
g.append(line([(85, 1010), (150, 968), (240, 946), (345, 940)], '#A89880', 2))
for x0, x1, cr in [(97, 119, 1072), (129, 151, 1062), (160, 187, 1050), (200, 236, 1040), (253, 302, 1020)]:   # tier-2 openings
    g.append(poly(arch(x0, x1, cr, 1158, n=8), P['open'], INK, 2.5))
for x0, x1 in [(120, 128), (151, 159), (187, 199), (236, 252), (304, 338)]:
    g.append(poly([(x0, cy(B3B, x0) + 2), (x1, cy(B3B, x1) + 2), (x1, 1158), (x0, 1158)], P['ruin_col'], INK, 2))
g.append(poly([(302, 958), (344, 956), (344, 984), (304, 986)], P['ruin_lit'], INK, 2))   # white capital
g.append(poly([(345, 990), (404, 1000), (406, 1160), (340, 1160)], P['wedge'], INK, 2.5))   # brick buttress below
for y in range(1004, 1158, 13):
    g.append(line([(346, y), (404, y)], P['wedge_c'], 1.5))
g.append(poly([(84, 1158), (406, 1158), (406, 1178), (84, 1186)], P['ruin_lit'], INK, 2.5))
g.append(poly([(222, 416), (269, 416), (271, 442), (226, 446)], P['ruin_lit'], INK, 2.5))   # the cap stone on top

# ---------------------------------------------------------------- trees + iron fence on the left
BT = [(0, 1122), (40, 1128), (90, 1158), (140, 1188), (175, 1230), (180, 1600), (0, 1600)]
g.append(poly(BT, P['tree_d'], INK, 2.5))
CR = [(160, 1300), (175, 1240), (205, 1212), (233, 1203), (270, 1210), (310, 1232), (350, 1270), (385, 1320), (400, 1380), (404, 1460), (420, 1500),
      (430, 1545), (300, 1580), (180, 1580), (155, 1450)]
g.append(poly(CR, P['tree0'], INK, 3))
for _ in range(170):   # leaf clusters, generated inside the crowns (lighter toward the sunny top right)
    x, y = R.uniform(0, 430), R.uniform(1120, 1580)
    if inside(CR, x, y): col = R.choice([P['tree1'], P['tree2']] if (x - 160) / 270 - (y - 1200) / 380 > -.2 else [P['tree0'], P['tree1'], '#35502B'])
    elif inside(BT, x, y): col = R.choice([P['tree0'], '#35502B'])
    else: continue
    g.append(poly(blob(x, y, R.uniform(12, 22), 11, .18), col, '#24361D', 1.2, 'opacity=".92"'))
g.append(poly([(0, 1075), (48, 1078), (48, 1135), (0, 1132)], P['bldg1'], INK, 2))   # a house far behind
xs = list(range(6, 236, 21))   # the tall railing: spear-topped bars
g.append(segs([((x, 1062 + x * .14), (x - 2, 1610)) for x in xs], P['fence'], 6))
g.append(segs([((x - 4, 1062 + x * .14), (x, 1048 + x * .14)) for x in xs] + [((x + 4, 1062 + x * .14), (x, 1048 + x * .14)) for x in xs], P['fence'], 3))
g.append(segs([((0, 1084), (236, 1102)), ((0, 1124), (236, 1148)), ((0, 1560), (236, 1572))], P['fence'], 5))
g.append(poly([(0, 1400), (50, 1402), (50, 1545), (0, 1545)], '#5D6468', INK, 2))

# ---------------------------------------------------------------- road, lawn, rails, curb
ROADT = [(0, 1478), (340, 1478), (905, 1490), (1000, 1500), (2446, 1502), (2460, 1474), (2576, 1474)]
LAWNT = [(0, 1545), (404, 1546), (722, 1549), (1250, 1552), (1987, 1558), (2576, 1576)]
g.append(poly(ROADT + [(2576, 1580), (0, 1580)], 'url(#road)', 'none', 0))
g.append(line(ROADT[1:6], INK, 2.5))
# far tourists on the road: generated simple silhouettes from measured spots
TOP_C = ['#2F3A5A', '#E6E1D6', '#C2453E', '#3F6D9C', '#E8B04A', '#1F1F22', '#7A9C55', '#D97F9E', '#8FB7D9']
BOT_C = ['#2B2E3A', '#3E5C86', '#6B6458', '#1E1E22', '#B9A88D']
def tiny(x, yt, yb, top=None, bot=None):
    h = yb - yt; hr = h * .085; top = top or R.choice(TOP_C); bot = bot or R.choice(BOT_C); s = R.uniform(-.06, .06) * h
    g.append(poly([(x - h * .05, yt + h * .5), (x + h * .05, yt + h * .5), (x + h * .07 + s, yb), (x + h * .01, yb), (x, yt + h * .62), (x - h * .01, yb), (x - h * .07 - s, yb)], bot, INK, 1.2))
    g.append(poly([(x - h * .1, yt + h * .2), (x + h * .1, yt + h * .2), (x + h * .08, yt + h * .55), (x - h * .08, yt + h * .55)], top, INK, 1.2))
    g.append(ell(x, yt + hr, hr * .85, hr, '#3A2C24', INK, 1))
for x, yt, yb in [(410, 1463, 1522), (440, 1465, 1522), (675, 1469, 1502), (742, 1478, 1541), (812, 1478, 1541), (838, 1476, 1538), (870, 1478, 1540),
                  (898, 1480, 1541), (969, 1478, 1543), (1000, 1478, 1541), (1078, 1480, 1541), (1133, 1480, 1543), (1186, 1484, 1522), (1541, 1472, 1553),
                  (1580, 1490, 1546), (1714, 1497, 1546), (1797, 1482, 1553), (1820, 1482, 1550), (1862, 1482, 1553), (2008, 1475, 1518), (2033, 1504, 1546),
                  (2060, 1505, 1550), (2108, 1507, 1557), (2270, 1486, 1539), (2364, 1479, 1532), (2382, 1480, 1530), (2440, 1475, 1568), (2505, 1504, 1582),
                  (2533, 1461, 1511), (2556, 1470, 1515), (1440, 1488, 1530), (1460, 1490, 1528), (2380, 1470, 1500)]:
    tiny(x, yt, yb)
# the police car parked by the wall
g.append(poly([(434, 1520), (436, 1492), (470, 1488), (490, 1466), (560, 1462), (598, 1478), (600, 1520)], '#F2F2F0', INK, 2.5))
g.append(poly([(495, 1470), (555, 1467), (575, 1484), (488, 1488)], '#3C4F66', INK, 1.5))
g.append(line([(438, 1503), (598, 1500)], '#2E59A8', 5))
for x in (465, 575): g.append(ell(x, 1520, 13, 13, '#222', INK, 2))
g.append(poly(LAWNT + [(2576, 1931), (0, 1931)], 'url(#lawn)', INK, 2.5))
g.append(segs([((x, cy(LAWNT, x) - 18), (x, cy(LAWNT, x) + 2)) for x in range(420, 2576, 40)] + [((420, cy(LAWNT, 420) - 16), (2576, cy(LAWNT, 2576) - 16))], '#6D6B66', 2))
for x0, y0, x1, y1 in [(1159, 1561, 1288, 1578), (1352, 1566, 1417, 1584), (2156, 1606, 2282, 1625), (2421, 1617, 2563, 1636), (661, 1569, 717, 1600)]:   # stone slabs in the grass
    g.append(poly([(x0 + 10, y0), (x1, y0 + 2), (x1 - 8, y1), (x0, y1 - 1)], P['patch'], '#7E7860', 2))
g.append(ell(2193, 1663, 88, 13, P['patch'], '#7E7860', 2)); g.append(ell(2193, 1660, 70, 8, '#CEC6AA'))
CT = [(170, 1652), (209, 1656), (505, 1664), (722, 1678), (939, 1711), (1083, 1725), (1300, 1735), (1618, 1758), (1987, 1789), (2355, 1818), (2576, 1840)]
for _ in range(190):   # grass strokes
    x = R.uniform(400, 2576); y0 = cy(LAWNT, x); y = R.uniform(y0 + 8, cy(CT, x) - 4); s = .5 + (y - 1550) / 300
    a = R.uniform(-1.9, -1.25); L = R.uniform(8, 16) * s
    g.append(line([(x, y), (x + math.cos(a) * L, y + math.sin(a) * L)], R.choice([P['grass_d'], P['grass_d'], P['grass_l']]), 2.2 * s))
RL = [(217, 1609), (505, 1622), (661, 1625), (1000, 1636), (1300, 1645), (1618, 1672), (1987, 1693), (2355, 1716), (2576, 1732)]   # the low rail
g.append(segs([((x, cy(RL, x)), (x, cy(CT, x))) for x in range(240, 2576, 62)], P['rail'], 4))
g.append(line(RL, P['rail'], 5))

# ---------------------------------------------------------------- path: curb, cobbles, sidewalk, brick block
CB = [(x, y + 8 + (x / 2576) * 8) for x, y in CT]
g.append(poly(CT + CB[::-1], P['curb'], INK, 2.5))
g.append(poly(CB + [(2576, 1931), (0, 1931), (0, 1655)], P['cob'], 'none', 0))
hs = [.92 ** k for k in range(15)]   # cobble rows in perspective: each row a bit shorter than the one in front
ts = [sum(hs[:k]) / sum(hs) for k in range(len(hs) + 1)]   # 0 = bottom edge, 1 = curb
def row_y(x, t): return 1931 + (cy(CB, x) - 1931) * t
for k in range(1, len(ts)):
    t0, t1 = ts[k - 1], ts[k]
    g.append(line([(x, row_y(x, t1)) for x in range(0, 2577, 64)], P['cob_d'], 1.6 + (1 - t1) * 1.4))
    hh = row_y(1300, t0) - row_y(1300, t1); step = max(14, hh * 1.5); x = R.uniform(0, step); tk = []
    while x < 2576:
        tk.append(((x, row_y(x, t0) - 1), (x + 2, row_y(x, t1) + 1))); x += step * R.uniform(.8, 1.2)
    g.append(segs(tk, P['cob_d'], 1.4 + (1 - t1) * 1.2))
    g.append(segs([((a[0] + 4, a[1] - 3), (a[0] + step * .5, a[1] - 3)) for a, b in tk[::2]], P['cob_l'], 2.5, 'opacity=".55"'))
g.append(poly([(209, 1660), (505, 1667), (722, 1681), (905, 1712), (975, 1826), (209, 1747)], P['asph'], 'none', 0))   # tarmac by the block
SW = [(0, 1805), (199, 1797), (209, 1747), (975, 1826), (758, 1931), (0, 1931)]
g.append(poly(SW, P['side'], INK, 2.5))
g.append(poly([(975, 1826), (992, 1832), (776, 1931), (758, 1931)], P['curb'], INK, 2.5))
for k in range(1, 4):   # paving joints
    t = k / 4; a = lerp((209, 1747), (0, 1805), t); b = lerp((975, 1826), (758, 1931), t); g.append(line([a, b], P['side_d'], 2))
for k in range(1, 7):
    t = k / 7; a = lerp((209, 1747), (975, 1826), t); b = lerp((0, 1931), (758, 1931), t); g.append(line([a, (b[0] + (a[0] - b[0]) * .02, b[1])], P['side_d'], 1.5))
g.append(poly([(354, 1826), (477, 1826), (474, 1840), (350, 1840)], P['grate'], INK, 2))
g.append(poly([(231, 1880), (318, 1880), (316, 1895), (228, 1895)], P['grate'], INK, 2))
g.append(poly([(0, 1609), (238, 1617), (238, 1640), (0, 1636)], P['blk_cap'], INK, 2.5))   # brick block
g.append(poly([(0, 1636), (202, 1640), (199, 1797), (0, 1805)], P['blk'], INK, 2.5))
g.append(poly([(202, 1640), (238, 1640), (236, 1790), (199, 1797)], P['blk_side'], INK, 2.5))
for i in range(1, 9):
    y = 1636 + i * 18.5; g.append(line([(2, y), (200, y + 1)], P['blk_line'], 2))
    g.append(segs([((x + (i % 2) * 22, y), (x + (i % 2) * 22, y + 18)) for x in range(20, 190, 44)], P['blk_line'], 2))

# ---------------------------------------------------------------- bollards, bin, people
def shadow(x, y, L, w): g.append(poly([(x + 10, y - 2), (x - L, y + w * .4), (x - L - 8, y + w), (x - 6, y + w * .5)], P['shadow'], 'none', 0, 'opacity=".55"'))
def bollard(x0, x1, yt, yb):
    r = (x1 - x0) / 2; c = (x0 + x1) / 2; spring = yt + r * .8
    shadow(x0 + 8, yb, 70, 16)
    head = [(c - r * math.cos(math.pi * i / 10), spring - r * .8 * math.sin(math.pi * i / 10)) for i in range(11)]
    g.append(poly([(x0, yb)] + head + [(x1, yb)], P['boll'], INK, 3))
    g.append(poly([(c + r * .35, yb - 2), (c + r * .35, spring + 6), (x1 - 3, spring + 2), (x1 - 3, yb - 2)], P['boll_d'], 'none', 0))
    g.append(line([(x0 + 6, spring + 14), (x1 - 4, spring + 10)], P['boll_d'], 2.5))
    g.append(poly([(c - 5, yt + 1), (c + 5, yt + 1), (c + 4, yt - 10), (c - 4, yt - 10)], '#8F887A', INK, 2))
for b in [(715, 791, 1624, 1797), (899, 961, 1617, 1765), (1026, 1083, 1606, 1739)]: bollard(*b)
g.append(line([(958, 1674), (960, 1898)], INK, 7)); g.append(line([(958, 1674), (960, 1898)], '#5A5D60', 3))
g.append(poly([(955, 1690), (1022, 1690), (1018, 1800), (990, 1835), (964, 1800)], '#DADDDF', INK, 2.5, 'opacity=".95"'))
g.append(poly([(953, 1666), (1026, 1666), (1024, 1690), (955, 1690)], '#3B3F42', INK, 2.5))
g.append(line([(975, 1700), (972, 1790)], '#B7BBBE', 3)); g.append(line([(1005, 1700), (1003, 1790)], '#B7BBBE', 3))

def person(cx, yt, yb, top, bot, hair, w=1.0, stride=.0, dress=False, hem=.08, back=True, bag=None, cap=None, stripes=False, arm=0.0, shorts=False, lead=1):
    """a simple walking figure, no face: head (hair seen from behind or side), torso, two tapered legs, swinging arms"""
    h = yb - yt; hr = h * .068; sh = yt + hr * 2 + h * .025; hp = yt + h * .5; ws = h * .12 * w; wh = h * .1 * w
    shadow(cx, yb, h * .45, h * .07)
    if dress:
        for fx in (cx - wh * .6 - stride * h * .12, cx + wh * .6 + stride * h * .12):
            kx = cx + (fx - cx) * .5
            g.append(line([(kx, yb - h * (hem + .02)), (fx, yb - 7)], INK, h * .045 + 4)); g.append(line([(kx, yb - h * (hem + .02)), (fx, yb - 7)], P['skin'], h * .045))
            g.append(poly([(fx - 9, yb - 8), (fx + 9, yb - 8), (fx + 10, yb), (fx - 9, yb)], '#3A2C24', INK, 1.5))
        g.append(poly([(cx - wh, hp - 10), (cx + wh, hp - 10), (cx + wh * 1.5, yb - h * hem), (cx - wh * 1.5, yb - h * hem)], top, INK, 2.5))
    else:
        for sgn in (-lead, lead):   # legs: hip → ankle, tapered; shorts leave the calves bare
            fx = cx + sgn * stride * h * .17; hx0, hx1 = cx + sgn * 2, cx + sgn * wh
            leg = [(hx0, hp), (hx1, hp), (fx + sgn * h * .028, yb - 8), (fx - sgn * h * .028, yb - 8)]
            if shorts:
                g.append(poly(leg, P['skin'], INK, 2.5))
                g.append(poly([leg[0], leg[1], lerp(leg[1], leg[2], .42), lerp(leg[0], leg[3], .42)], bot, INK, 2.5))
            else: g.append(poly(leg, bot, INK, 2.5))
            g.append(poly([(fx - h * .04, yb - 10), (fx + h * .04, yb - 10), (fx + h * .05, yb), (fx - h * .045, yb)], '#30261F', INK, 1.5))
    g.append(poly([(cx - ws * .8, sh - 3), (cx + ws * .8, sh - 3), (cx + ws, sh + 10), (cx + wh * 1.05, hp + 4), (cx - wh * 1.05, hp + 4), (cx - ws, sh + 10)], top, INK, 2.5))
    if stripes:
        g.append(segs([((cx - ws + (ws - wh) * k / 8 + 3, sh + (hp - sh) * k / 8), (cx + ws - (ws - wh) * k / 8 - 3, sh + (hp - sh) * k / 8)) for k in range(1, 8)], '#E8E6E0', 3))
    for sgn in (-1, 1):   # arms, hanging a little away from the body
        s0 = (cx + sgn * ws * .9, sh + 9); hand = (cx + sgn * (ws + h * .025 + arm * h * .05), hp + h * .03)
        g.append(line([s0, hand], INK, h * .05 + 4)); g.append(line([s0, hand], P['skin'], h * .05))
        g.append(line([s0, lerp(s0, hand, .38)], top, h * .056))
    if bag: g.append(poly([(cx - ws - 6, sh + 6), (cx - ws + 22, sh + 2), (cx - ws + 20, hp - 18), (cx - ws - 8, hp - 22)], bag, INK, 2.5))
    g.append(line([(cx, sh - h * .02), (cx, sh + 2)], P['skin'], h * .05))   # neck
    g.append(ell(cx, yt + hr, hr * .86, hr, hair if back else P['skin'], INK, 2.5))
    if not back: g.append(poly([(cx - hr * .86, yt + hr * .9), (cx - hr * .7, yt + hr * .1), (cx, yt - 1), (cx + hr * .7, yt + hr * .1), (cx + hr * .86, yt + hr * .9), (cx + hr * .2, yt + hr * .45)], hair, INK, 2))
    if cap: g.append(poly([(cx - hr * .95, yt + hr * .8), (cx - hr * .8, yt + hr * .05), (cx + hr * .8, yt + hr * .05), (cx + hr * 1.5, yt + hr * .8)], cap, INK, 2))
# measured spots: (centre x, top of head, feet)
person(357, 1501, 1747, '#F1EFEA', '#2B3346', '#C9C2B5', stride=.7, back=True, lead=-1)
person(434, 1515, 1736, '#F3F1EC', P['skin'], '#E3C27A', stride=.4, dress=True, hem=.29)
person(520, 1489, 1800, '#6E9A3E', '#F0EEE8', '#A8643E', w=1.15, stride=.3, back=True, arm=.4, shorts=True)
person(632, 1472, 1790, '#2B3550', '#646A70', '#4C4740', w=1.15, stride=.55, back=True, stripes=True, cap='#5C6B5B', shorts=True)
person(1508, 1510, 1764, '#9FBBD9', '#4F6F98', '#2F2620', stride=.15, back=True, shorts=True)
person(1606, 1544, 1774, '#D93B32', P['skin'], '#2B1E18', stride=.1, dress=True, back=True)
person(1803, 1533, 1835, '#2E3A55', '#3E5D8A', '#4A3527', w=1.05, stride=.75, back=False, bag='#24272C', arm=.6)
person(1905, 1547, 1840, '#2C3B5E', '#8FB0D2', '#3B2A20', stride=.85, back=False, arm=.5)
g.append(poly([(1895, 1628), (1938, 1616), (1941, 1634), (1898, 1646)], '#C8382F', INK, 2))   # her red belt bag
g.append('</svg>')
open(sys.argv[1], 'w').write('\n'.join(g)); print('ok', len(g), 'elements')
