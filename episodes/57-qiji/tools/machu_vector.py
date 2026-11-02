"""ep57 马丘比丘 (machu2.jpg, 2576x1717): the scene drawn in code (our lines, our palette), laid over the
photo's layout so the shutter cut drawing → photo lines up. Repeated details are generated (cloud puffs,
ridge faces, jungle crowns, terrace bands, rows of roofless houses clipped to each ruin block, tree clumps, grass strokes).
usage: machu_vector.py out.svg"""
import sys, math, random
W, H = 2576, 1717
R = random.Random(57)
INK = '#2A211B'
P = dict(sky0='#5B8BC3', sky1='#A3C3DD', cl_base='#B3BECD', cl_white='#EEF1F6', cl_mid='#D3DAE4', cl_grey='#A7B2C2', cl_line='#6F7C90',
         far='#22394E', far_rib='#2F4A60', left='#1F3140', left_rib='#2D4352', mid='#3C4F50', mid_lit='#4D5E4B',
         shoulder='#232B26', sh_rib='#323B31', hu_lit0='#6A6A43', hu_lit1='#4A4B31', hu_sh='#2D312B', hu_rib='#3A3D31',
         lp_lit='#5E6239', lp_sh='#3A3E2A', hump='#2A3326', tree='#4F5B2C', tree_hi='#6E7A38', tree_d='#33401F',
         site='#6E6457', stone='#8C806C', stone_lit='#A89B83', stone_sh='#625849', floor='#3B342C', gable='#B5A78D', path='#A08F76',
         lawn='#78872F', lawn_sun='#93A13F', lawn_sh='#5C6A27', terr='#6E7B32', terr_sun='#869540', riser='#5D5446',
         scrub='#4E5128', scrub_hi='#646735', grass0='#69652A', grass1='#46420F', blade='#7E7A35', blade_d='#3E3A10', roof='#4A3E2C')

def pts(p): return ' '.join(f'{x:.0f},{y:.0f}' for x, y in p)
def poly(p, fill, stroke=INK, sw=3, extra=''): return f'<polygon points="{pts(p)}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" {extra}/>'
def line(p, stroke=INK, sw=3, extra=''): return f'<polyline points="{pts(p)}" fill="none" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" {extra}/>'
def lerp(a, b, t): return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
def along(path, n):
    """n+1 evenly spaced points (with unit tangents) along a polyline"""
    seg = [math.dist(a, b) for a, b in zip(path, path[1:])]; L = sum(seg); out = []
    for i in range(n + 1):
        d = L * i / n; j = 0
        while j < len(seg) - 1 and d > seg[j]: d -= seg[j]; j += 1
        a, b = path[j], path[j + 1]; t = min(1, d / seg[j]); tx, ty = (b[0] - a[0]) / seg[j], (b[1] - a[1]) / seg[j]
        out.append((lerp(a, b, t), (tx, ty)))
    return out
def edge_x(edge, y):
    """x of a polyline edge (listed top → bottom) at height y"""
    for a, b in zip(edge, edge[1:]):
        if a[1] <= y <= b[1]: return a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1] or 1)
    return edge[0][0] if y < edge[0][1] else edge[-1][0]
def inside(p, pg):
    x, y = p; c = False
    for (x1, y1), (x2, y2) in zip(pg, pg[1:] + pg[:1]):
        if (y1 > y) != (y2 > y) and x < x1 + (x2 - x1) * (y - y1) / (y2 - y1): c = not c
    return c
def clip(a, d, pg):
    """the piece(s) of the line a + s*d that lie inside polygon pg"""
    ss = []
    for p, q in zip(pg, pg[1:] + pg[:1]):
        ex, ey = q[0] - p[0], q[1] - p[1]; den = d[0] * ey - d[1] * ex
        if abs(den) < 1e-9: continue
        s = ((p[0] - a[0]) * ey - (p[1] - a[1]) * ex) / den; t = ((p[0] - a[0]) * d[1] - (p[1] - a[1]) * d[0]) / den
        if 0 <= t < 1: ss.append(s)
    ss.sort(); return [((a[0] + d[0] * s0, a[1] + d[1] * s0), (a[0] + d[0] * s1, a[1] + d[1] * s1)) for s0, s1 in zip(ss[::2], ss[1::2])]
def puff(pg, r, fill, stroke=P['cl_line'], sw=2, extra=''):
    """a cloud mass: the polygon's edges (clockwise) replaced by outward arcs of about radius r"""
    d = f'M{pg[0][0]:.0f},{pg[0][1]:.0f}'
    for a, b in zip(pg, pg[1:] + pg[:1]):
        k = max(1, round(math.dist(a, b) / (1.5 * r)))
        for i in range(1, k + 1):
            q = lerp(a, b, i / k); rr = math.dist(a, b) / k * R.uniform(.52, .7)
            d += f' A{rr:.0f},{rr:.0f} 0 0 1 {q[0]:.0f},{q[1]:.0f}'
    return f'<path d="{d} Z" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" {extra}/>'
def clump(cx, cy, r, n, fill, hi=None, sw=2):
    """a tree clump: n round crowns around (cx, cy), lit caps on the upper left"""
    out = []
    for _ in range(n):
        x, y, rr = cx + R.uniform(-r, r), cy + R.uniform(-r * .6, r * .6), r * R.uniform(.45, .7)
        out.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rr:.0f}" fill="{fill}" stroke="{INK}" stroke-width="{sw}"/>')
        if hi: out.append(f'<circle cx="{x - rr * .3:.0f}" cy="{y - rr * .3:.0f}" r="{rr * .45:.0f}" fill="{hi}"/>')
    return out

g = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">',
     f'<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="600" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="{P["sky0"]}"/><stop offset="1" stop-color="{P["sky1"]}"/></linearGradient>'
     f'<linearGradient id="huay" x1="0" y1="350" x2="0" y2="1050" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="{P["hu_lit0"]}"/><stop offset="1" stop-color="{P["hu_lit1"]}"/></linearGradient>'
     f'<linearGradient id="grass" x1="0" y1="1440" x2="0" y2="1717" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="{P["grass0"]}"/><stop offset="1" stop-color="{P["grass1"]}"/></linearGradient>'
     f'<linearGradient id="lawn" x1="640" y1="1060" x2="1170" y2="1340" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="{P["lawn"]}"/><stop offset=".55" stop-color="{P["lawn"]}"/><stop offset="1" stop-color="{P["lawn_sun"]}"/></linearGradient></defs>',
     f'<rect width="{W}" height="{H}" fill="url(#sky)"/>']

# --- back ranges (drawn before the clouds, which sit on their tops) ---
g.append(poly([(1280, 380), (W, 380), (W, H), (1280, H)], P['far'], '#162636', 2))
for rib in ([(1800, 470), (1840, 540), (1910, 590), (1990, 650), (2040, 700)], [(2000, 456), (2060, 540), (2150, 610), (2240, 680), (2300, 760)],
            [(2440, 458), (2425, 560), (2400, 680), (2370, 820)], [(W, 600), (2520, 690), (2460, 760), (2420, 830)]):   # far ridges
    g.append(poly(rib + [(x - 8 - 22 * k, y + 8 * k) for k, (x, y) in list(enumerate(rib))[::-1]], P['far_rib'], '#1A2C3D', 1.5, 'opacity=".85"'))   # lit side of each far ridge
left_ridge = [(0, 576), (50, 564), (100, 546), (150, 543), (250, 543), (300, 546), (350, 555), (400, 573), (450, 587), (500, 579), (550, 567), (600, 552), (650, 543), (700, 528), (750, 510), (800, 489), (850, 480), (900, 470), (1000, 462), (1100, 470)]
g.append(poly(left_ridge + [(1100, 1250), (0, 1250)], P['left'], '#141F29', 2.5))
for _ in range(55):   # jungle crowns on the left range (generated arcs)
    x = R.uniform(0, 1050); y = R.uniform(edge_x([(q, p) for p, q in left_ridge], x) + 50, 1200)
    r = R.uniform(14, 24); g.append(line([(x - r, y), (x - r * .6, y - r * .7), (x, y - r * .9), (x + r * .6, y - r * .7), (x + r, y)], P['left_rib'], 3, 'opacity=".9"'))

# --- clouds: grey base over the whole sky, blue gaps, white heads, grey undersides, mist on the far crests ---
base = [(-60, -60), (W + 60, -60), (W + 60, 470), (2576, 470), (2500, 482), (2440, 455), (2380, 468), (2300, 482), (2200, 482), (2100, 470), (2000, 452), (1950, 446), (1900, 452), (1800, 457),
        (1700, 470), (1600, 484), (1500, 500), (1400, 512), (1300, 502), (1200, 482), (1100, 480), (1000, 478), (900, 480), (800, 492), (750, 502), (690, 518), (630, 540), (570, 557), (510, 557),
        (468, 540), (420, 518), (360, 500), (300, 510), (210, 522), (120, 516), (60, 505), (0, 498), (-60, 498)]
g.append(puff(base, 40, P['cl_base']))
for gap in ([(-30, 40), (30, 46), (62, 76), (100, 118), (122, 146), (70, 146), (34, 110), (-30, 92)],
            [(250, -40), (430, -40), (405, 22), (362, 32), (350, 78), (318, 96), (272, 72), (255, 40)],
            [(-30, 342), (48, 348), (108, 330), (150, 326), (128, 348), (70, 376), (-30, 392)]):
    g.append(poly(gap, 'url(#sky)', P['cl_line'], 2))
g.append(puff([(-60, 330), (150, 318), (300, 322), (450, 345), (560, 370), (700, 400), (820, 430), (900, 466), (800, 488), (700, 508), (600, 535), (515, 548), (455, 528), (360, 492), (250, 503), (120, 503), (-60, 492)], 44, P['cl_white']))
g.append(puff([(560, -60), (1660, -60), (1690, 110), (1610, 245), (1460, 330), (1350, 418), (1220, 466), (1050, 466), (900, 438), (780, 398), (650, 378), (560, 328), (505, 248), (520, 118)], 60, P['cl_white']))
g.append(puff([(880, 300), (1050, 250), (1250, 240), (1450, 300), (1500, 420), (1380, 470), (1220, 476), (1050, 474), (900, 462)], 50, P['cl_grey']))   # shaded underside behind the summit
g.append(puff([(1660, -60), (W + 60, -60), (W + 60, 170), (2450, 225), (2300, 255), (2100, 248), (1950, 276), (1800, 296), (1690, 250), (1700, 110)], 55, P['cl_white']))
g.append(puff([(-60, -60), (560, -60), (520, 110), (505, 240), (420, 292), (260, 312), (100, 322), (-60, 330)], 45, P['cl_mid'], extra='opacity=".55"'))
g.append(puff([(1690, 330), (1830, 300), (2000, 292), (2200, 302), (2400, 280), (W + 60, 250), (W + 60, 440), (2440, 430), (2300, 440), (2150, 430), (2000, 420), (1850, 440), (1700, 455), (1560, 470), (1480, 440), (1560, 370)], 38, P['cl_grey']))
g.append(puff([(1960, 425), (2150, 415), (2300, 432), (2400, 405), (2500, 425), (W + 60, 415), (W + 60, 478), (2500, 486), (2440, 460), (2380, 472), (2300, 487), (2200, 487), (2100, 476), (1990, 458)], 22, P['cl_mid']))
g.append(puff([(760, 470), (860, 455), (960, 462), (1060, 470), (1000, 492), (900, 498), (800, 505)], 18, P['cl_mid']))   # mist lying on the left crest

# --- mid ridges right (lit valley faces) and the dark shoulder running off Huayna ---
mid = [(1990, 785), (2040, 745), (2100, 717), (2161, 754), (2213, 774), (2265, 795), (2301, 831), (2317, 868), (2332, 909), (2353, 982)]
g.append(poly(mid + [(2353, H), (1745, H)], P['mid'], '#1B2A30', 2.5))
g.append(poly([(2353, 982), (2410, 940), (2446, 909), (2498, 889), (2540, 868), (W, 847), (W, H), (2353, H)], P['mid_lit'], '#1B2A30', 2.5))
for (x, y), _ in along(mid, 6)[1:-1]:   # gullies on the lit faces (generated, falling from each crest)
    g.append(line([(x, y + 10), (x - 25, y + 120), (x - 40, y + 260)], '#33453F', 3, 'opacity=".8"'))
for (x, y), _ in along([(2353, 982), (2446, 909), (2540, 868), (W, 847)], 4)[1:]:
    g.append(line([(x - 5, y + 12), (x - 30, y + 150), (x - 45, y + 330)], '#3E4E3D', 3, 'opacity=".8"'))
hu_right = [(1250, 359), (1275, 387), (1294, 425), (1312, 462), (1337, 487), (1350, 494), (1369, 500), (1381, 516), (1400, 531), (1419, 556), (1431, 575), (1450, 600), (1475, 612)]
sh_top = [(1500, 612), (1526, 621), (1565, 645), (1604, 665), (1653, 665), (1712, 680), (1771, 694), (1830, 709), (1881, 728), (1902, 738), (1949, 769), (1985, 780), (2006, 795), (2037, 826), (2052, 852),
          (2078, 873), (2099, 899), (2125, 940), (2151, 972), (2172, 987), (2203, 1003), (2234, 1023), (2265, 1044), (2291, 1065), (2306, 1091), (2322, 1117), (2343, 1148), (2369, 1179), (2394, 1210),
          (2420, 1246), (2446, 1288), (2472, 1324), (2498, 1350), (2524, 1376), (2550, 1402), (W, 1423)]
g.append(poly(hu_right + sh_top + [(W, H), (1200, H), (1200, 700)], P['shoulder'], INK, 3))
for i in range(1, 9):   # spur faces falling from the shoulder's skyline (generated, each a little different)
    (x, y), _ = along(sh_top, 9)[i]; lean = R.uniform(60, 140); wd = R.uniform(40, 90)
    g.append(poly([(x - 4, y + 10), (x + 10, y + 140), (x - lean + wd, y + 520), (x - lean - wd * .4, y + 560), (x - 35, y + 150)], P['sh_rib'], '#1A201C', 1.5, 'opacity=".55"'))

for _ in range(50):   # jungle crowns on the lower shoulder (generated arcs)
    x, y = R.uniform(1500, W), R.uniform(1000, H)
    if y < edge_x([(q, p) for p, q in sh_top], x) + 60: continue   # below the shoulder's skyline only
    r = R.uniform(14, 26); g.append(line([(x - r, y), (x - r * .6, y - r * .7), (x, y - r * .9), (x + r * .6, y - r * .7), (x + r, y)], '#36412F', 3, 'opacity=".8"'))
# --- Huayna Picchu: lit west face, shadow east face, rock ribs ---
hu_left = [(837, 800), (856, 775), (875, 756), (894, 737), (912, 712), (934, 675), (950, 637), (969, 594), (987, 556), (1006, 525), (1031, 487), (1050, 450), (1062, 444), (1100, 400), (1125, 375), (1150, 358), (1190, 351), (1220, 354)]
split = [(1220, 354), (1215, 400), (1210, 450), (1215, 520), (1230, 600), (1250, 680), (1275, 760), (1300, 850), (1330, 940), (1350, 1000), (1360, 1250)]
g.append(poly(hu_left + [(1250, 359)] + hu_right + [(1480, 700), (1470, 900), (1460, 1250), (900, 1250), (850, 900)], 'url(#huay)', INK, 3))
g.append(poly(split + [(1460, 1250), (1470, 900), (1480, 700)] + hu_right[::-1] + [(1250, 359)], P['hu_sh'], INK, 2.5))
for i in range(9):   # rock ribs falling from the crest down-left across the lit face (generated)
    y = 420 + i * 60; a = (edge_x(split, y) - 8, y); y2 = min(y + 200, 980); b = (edge_x(hu_left[::-1], min(y2, 800)) + 25, y2)
    g.append(line([a, lerp(a, b, .45), (lerp(a, b, .7)[0] + 12, lerp(a, b, .7)[1]), b], P['hu_rib'], 4, 'opacity=".8"'))
for i in range(8):   # cliff bands on the shadow face
    x = 1262 + i * 26; y = 480 + (i % 4) * 70
    g.append(line([(x, y), (x + 8, y + 140 + (i % 3) * 50), (x + 22, y + 280 + (i % 2) * 70)], '#202420', 5, 'opacity=".6"'))
for _ in range(50):   # vegetation tufts on the lit face (short arcs)
    y = R.uniform(470, 980); x0 = edge_x(hu_left[::-1], min(y, 800)) + 20; x1 = edge_x(split, y) - 15
    if x1 - x0 < 20: continue
    x = R.uniform(x0, x1); g.append(line([(x - 9, y + 4), (x, y - 5), (x + 9, y + 4)], '#7A7B4E', 2.5, 'opacity=".6"'))

# --- the small peak on the left (lit east face, shaded west flank) ---
lp_left = [(505, 727), (481, 744), (447, 772), (419, 806), (399, 847), (385, 889), (371, 923), (357, 957), (343, 976), (334, 999), (326, 1024), (317, 1050), (309, 1073), (300, 1093), (289, 1110), (277, 1133), (269, 1150), (257, 1170), (247, 1195)]
lp_right = [(550, 731), (571, 758), (591, 799), (605, 827), (619, 841), (646, 854), (660, 868), (674, 889), (687, 916), (700, 950)]
g.append(poly(lp_left[::-1] + [(520, 722)] + lp_right + [(720, 1100), (400, 1230), (247, 1230)], P['lp_lit'], INK, 3))
g.append(poly(lp_left + [(247, 1230), (330, 1200), (380, 1050), (420, 930), (470, 820), (515, 728)], P['lp_sh'], INK, 2.5))
for i in range(7):   # ribs on the lit face
    a = (522 + i * 8, 740 + i * 8); g.append(line([a, (a[0] + 10 + i * 12, a[1] + 120), (a[0] + 5 + i * 20, a[1] + 240)], '#4C5030', 3, 'opacity=".8"'))
# the forested hump between the two peaks, the lit trees in front of it
g.append(poly([(660, 960), (690, 890), (720, 850), (760, 820), (800, 800), (840, 790), (880, 800), (920, 830), (960, 900), (980, 1000), (700, 1010)], P['hump'], INK, 3))
for cx, cy, r, n in [(640, 950, 40, 6), (700, 935, 40, 6), (610, 1000, 30, 4), (690, 990, 36, 5), (760, 960, 34, 4), (800, 985, 30, 4), (560, 1010, 26, 3)]:
    g += clump(cx, cy, r, n, P['tree'], P['tree_hi'])

# --- the site: stone ground of the whole citadel ---
site = [(0, 1192), (60, 1182), (110, 1186), (245, 1200), (300, 1165), (330, 1100), (360, 1050), (395, 1015), (450, 1000), (495, 990), (530, 1008), (600, 1030), (650, 1012), (700, 1002), (734, 998),
        (790, 995), (880, 992), (950, 997), (997, 997), (1091, 1002), (1114, 1011), (1152, 1025), (1198, 1034), (1231, 1034), (1250, 1044), (1278, 1058), (1306, 1067), (1334, 1081), (1353, 1095),
        (1372, 1114), (1391, 1137), (1419, 1152), (1447, 1156), (1475, 1166), (1494, 1180), (1512, 1189), (1531, 1198), (1550, 1212), (1573, 1231), (1597, 1241), (1630, 1255), (1662, 1269), (1700, 1278),
        (1722, 1300), (1752, 1378), (1775, 1400), (1810, 1440), (1845, 1485), (1860, 1530), (1840, 1600), (1780, 1660), (1720, H), (0, H)]
g.append(poly(site, P['site'], INK, 3))
# lit scrub slope below the east terraces, falling to the right
scrub = [(1700, 1300), (1712, 1313), (1810, 1362), (1889, 1381), (1967, 1401), (2026, 1420), (2085, 1450), (2144, 1489), (2203, 1538), (2262, 1587), (2321, 1637), (2380, 1695), (2400, H), (1700, H), (1840, 1600), (1860, 1530), (1845, 1485), (1775, 1400)]
g.append(poly(scrub, P['scrub'], INK, 3))
for _ in range(22):   # shrub clumps on the scrub (generated)
    x, y = R.uniform(1760, 2380), R.uniform(1330, 1717)
    if not inside((x, y), scrub) or not inside((x, y - 30), scrub): continue
    g += clump(x, y, R.uniform(28, 42), 3, R.choice([P['scrub'], '#43461F']), P['scrub_hi'], 1.5)

# --- lawns: the main plaza (sun on its lower half), small upper lawns, the lower plaza ---
plaza = [(640, 1092), (700, 1074), (770, 1064), (850, 1070), (905, 1105), (945, 1150), (980, 1196), (1060, 1196), (1100, 1254), (1160, 1290), (1170, 1338), (960, 1340), (950, 1306), (880, 1288),
         (825, 1272), (812, 1300), (803, 1330), (770, 1290), (720, 1230), (680, 1180), (650, 1135)]
g.append(poly(plaza, 'url(#lawn)', INK, 3))
g.append(poly([(700, 1197), (734, 1197), (827, 1327), (800, 1334)], P['path'], 'none', 0, 'opacity=".9"'))   # the worn path down its left side
for a, b in [((803, 1190), (945, 1196)), ((905, 1232), (980, 1236)), ((966, 1258), (1100, 1254)), ((850, 1072), (945, 1150))]:   # terrace walls across the plaza
    g.append(line([a, b], INK, 9)); g.append(line([a, b], P['stone'], 5))
for pg in ([(653, 1011), (742, 1015), (738, 1050), (650, 1048)], [(598, 1052), (642, 1056), (642, 1100), (598, 1098)]):
    g.append(poly(pg, P['lawn'], INK, 2.5))
lower = [(1052, 1355), (1266, 1351), (1301, 1394), (1319, 1434), (1345, 1469), (1209, 1499), (1170, 1495), (1144, 1469), (1100, 1425), (1056, 1381)]
g.append(poly(lower, P['lawn_sun'], INK, 3))
g.append(poly([(1166, 1556), (1231, 1520), (1300, 1560), (1340, 1622), (1300, 1717), (1253, H)], P['lawn'], INK, 3))
g.append(poly([(1319, 1512), (1450, 1520), (1440, 1600), (1340, 1600)], P['lawn_sh'], INK, 2.5))

# --- terraces (generated bands) ---
# west terraces on the small peak: curved bands, lit treads, stone risers
wl = [(395, 1015), (360, 1050), (330, 1095), (300, 1145), (285, 1195)]; wr = [(470, 1015), (500, 1045), (492, 1095), (460, 1140), (420, 1200)]
g.append(poly(wl + wr[::-1], P['terr'], INK, 3))
for k in range(1, 9):
    t = k / 9; a = (edge_x(wl, 1015 + 180 * t), 1015 + 180 * t); b = (edge_x(wr, 1012 + 175 * t), 1012 + 175 * t); m = (lerp(a, b, .5)[0], lerp(a, b, .5)[1] + 6)
    g.append(poly([a, m, b, (b[0], b[1] + 9), (m[0], m[1] + 9), (a[0], a[1] + 9)], P['riser'], 'none', 0)); g.append(line([a, m, b], INK, 2))
# east terraces: straight bands running down-left, clipped to their block
east = [(1624, 1298), (1700, 1300), (1722, 1325), (1750, 1378), (1765, 1400), (1762, 1430), (1740, 1460), (1705, 1484), (1680, 1502), (1660, 1530), (1640, 1570), (1590, 1572), (1576, 1555), (1590, 1478), (1596, 1405), (1598, 1360), (1612, 1325)]
g.append(poly(east, P['terr_sun'], INK, 3))
d = (-0.785, 0.62); n = (0.62, 0.785)
for k in range(13):
    c = 1880 + k * 24; a = (n[0] * c, n[1] * c)   # line n·p = c
    for p, q in clip(a, d, east):
        g.append(poly([p, q, (q[0] + n[0] * 10, q[1] + n[1] * 10), (p[0] + n[0] * 10, p[1] + n[1] * 10)], P['riser'], 'none', 0)); g.append(line([p, q], INK, 2))
# small terraces left of the great stair, the long strips beside it, the stair itself
for k in range(4):
    y = 1160 + k * 24; g.append(poly([(955, y), (1060, y - 4), (1062, y + 14), (957, y + 18)], P['terr'], INK, 2)); g.append(poly([(957, y + 18), (1062, y + 14), (1062, y + 22), (957, y + 26)], P['riser'], 'none', 0))
for k in range(3):
    y = 1156 + k * 17; g.append(poly([(1128, y), (1290, y + 6), (1292, y + 14), (1130, y + 8)], P['terr'], INK, 2))
st = [(1058, 1147), (1109, 1259)]
g.append(poly([(1052, 1147), (1068, 1147), (1116, 1259), (1098, 1259)], P['stone_lit'], INK, 2))
for k in range(1, 12):
    t = k / 12; a = lerp((1052, 1147), (1098, 1259), t); b = lerp((1068, 1147), (1116, 1259), t); g.append(line([a, b], P['stone_sh'], 1.5))

# --- roofless houses: rows generated inside each ruin block; the big gables read off the photo, placed by hand ---
def house_row(a, b, dv, h, w, lit):
    """roofless houses sharing walls from a to b: floor strip, inner face of the back wall, front face, cross walls, some gables"""
    L = math.dist(a, b); u = ((b[0] - a[0]) / L, (b[1] - a[1]) / L); C, D = (b[0] + dv[0], b[1] + dv[1]), (a[0] + dv[0], a[1] + dv[1])
    o = [poly([a, b, C, D], P['stone'], INK, 2), poly([lerp(a, C, .1), lerp(b, D, .1), lerp(C, a, .1), lerp(D, b, .1)], P['floor'], 'none', 0),
         poly([a, b, (b[0], b[1] + h), (a[0], a[1] + h)], P['stone_lit'] if lit else P['stone_sh'], INK, 2.5)]
    n = max(1, round(L / w))
    for k in range(n + 1):
        E = lerp(a, b, k / n); F = (E[0] + dv[0], E[1] + dv[1])
        if 0 < k < n: o.append(poly([E, F, (F[0] + u[0] * 7, F[1] + u[1] * 7), (E[0] + u[0] * 7, E[1] + u[1] * 7)], P['stone_lit'], INK, 1.5))   # cross wall
        if R.random() < (.6 if k in (0, n) else .35):   # gable on this wall, with a trapezoid niche
            M = lerp(E, F, .5); o.append(poly([(E[0], E[1] + h), E, (M[0], M[1] - h * 1.6), F, (F[0], F[1] + h * .7)], P['gable'] if k < n else P['stone_sh'], INK, 2.5))
            o.append(poly([(M[0] - 3, M[1] + 2), (M[0] + 4, M[1] + 2), (M[0] + 3, M[1] - 9), (M[0] - 2, M[1] - 9)], P['floor'], 'none', 0))
    return o
def big_gable(apex, bl, br, dv, lit=True):
    hw = (bl[1] - apex[1]) * .3; bt = (bl[0], bl[1] - hw); rt = (br[0], br[1] - hw)
    o = [poly([br, rt, (rt[0] + dv[0], rt[1] + dv[1]), (br[0] + dv[0], br[1] + dv[1])], P['stone_sh'], INK, 2.5)]   # side wall running back
    o.append(poly([bl, br, rt, apex, bt], P['gable'] if lit else P['stone'], INK, 3))
    m = lerp(bl, br, .5); s_ = (br[0] - bl[0]) / 9
    for k in (-1, 1) if br[0] - bl[0] > 50 else (0,):   # trapezoid niches
        c = m[0] + k * s_ * 2.2; o.append(poly([(c - s_, m[1] - hw * .8), (c + s_, m[1] - hw * .8), (c + s_ * .7, m[1] - hw * 1.9), (c - s_ * .7, m[1] - hw * 1.9)], P['floor'], 'none', 0))
    return o
blocks = [   # polygon, a point on the first row, row step, row direction, house width, depth, wall height, rows
    ([(0, 1205), (110, 1198), (250, 1210), (430, 1222), (445, 1300), (425, 1460), (200, 1458), (0, 1445)], (0, 1226), (0, 52), (1, .03), 58, (14, -26), 18, 5),
    ([(440, 1228), (560, 1245), (650, 1280), (760, 1330), (800, 1440), (720, 1500), (600, 1480), (440, 1462)], (440, 1252), (0, 52), (1, .17), 56, (14, -24), 18, 5),
    ([(780, 1335), (960, 1315), (1040, 1360), (1110, 1440), (1160, 1520), (1150, 1640), (1080, 1680), (960, 1650), (830, 1610), (760, 1560), (750, 1420)], (770, 1345), (0, 52), (1, .27), 56, (10, -24), 16, 7),
    ([(960, 1005), (1091, 1006), (1198, 1038), (1306, 1071), (1372, 1118), (1419, 1156), (1494, 1184), (1550, 1216), (1600, 1250), (1600, 1290), (1490, 1290), (1400, 1255), (1300, 1222), (1200, 1205), (1130, 1170), (1110, 1140), (1060, 1140), (1000, 1080), (955, 1060)], (960, 1024), (0, 42), (1, .3), 50, (10, -26), 15, 8),
    ([(1180, 1500), (1215, 1500), (1345, 1470), (1340, 1350), (1300, 1300), (1420, 1280), (1560, 1300), (1600, 1350), (1590, 1460), (1560, 1560), (1460, 1600), (1350, 1600), (1340, 1520)], (1300, 1307), (0, 50), (1, .21), 54, (10, -26), 16, 7),
    ([(1330, 1620), (1460, 1610), (1580, 1585), (1650, 1580), (1720, 1620), (1700, H), (1290, H)], (1300, 1632), (0, 48), (1, .17), 54, (8, -20), 16, 3),
]
for pg, o, rs, u, w, dv, h, nr in blocks:
    for r in range(nr):   # each row line clipped to its block, broken into runs of 2-5 houses
        a0 = (o[0] + rs[0] * r, o[1] + rs[1] * r)
        for p, q in clip(a0, u, pg):
            L = math.dist(p, q); t = R.uniform(0, 12)
            while t < L - w * .8:
                run = min(L - t, w * R.randint(1, 4)); A = lerp(p, q, t / L); B = lerp(p, q, (t + run) / L)
                g += house_row(A, B, dv, h, w, R.random() < .65); t += run + R.choice([0, 0, 14, 26])
# long walls and the round wall in the lower block
g.append(poly([(783, 1336), (806, 1336), (822, 1546), (745, 1546), (740, 1520)], P['stone'], INK, 3))
g.append(poly([(848, 1362), (866, 1362), (878, 1553), (860, 1553)], P['stone_lit'], INK, 3))
g.append(poly([(990, 1452), (1008, 1442), (1035, 1441), (1056, 1452), (1058, 1500), (992, 1500)], P['stone_lit'], INK, 3))
gables = [((461, 1226), (432, 1345), (492, 1345)), ((605, 1288), (574, 1349), (636, 1349)), ((512, 1298), (482, 1395), (554, 1395)), ((651, 1323), (620, 1395), (680, 1395)),
          ((728, 1334), (692, 1416), (769, 1416)), ((543, 1395), (502, 1467), (584, 1467)), ((702, 1395), (666, 1467), (743, 1467)),
          ((968, 1323), (956, 1352), (980, 1352)), ((881, 1336), (866, 1398), (896, 1398)), ((967, 1504), (931, 1605), (1003, 1605))]
for apex, bl, br in sorted(gables, key=lambda t: t[1][1]):
    g += big_gable(apex, bl, br, (40, -14) if bl[0] < 800 else (8, -30))
# the thatched hut in the lower block
g.append(poly([(940, 1441), (1000, 1438), (1000, 1487), (940, 1487)], P['stone_sh'], INK, 2.5))
g.append(poly([(967, 1386), (1004, 1441), (936, 1444)], P['roof'], INK, 3))
for k in range(1, 5): g.append(line([(967, 1390), lerp((940, 1443), (1001, 1440), k / 5)], '#6B5A3E', 2))
# the crowd terrace below the west terraces and the guard house with its thatched roof
g.append(poly([(400, 1160), (520, 1150), (640, 1180), (650, 1222), (420, 1222)], P['path'], INK, 2.5))
g.append(poly([(734, 998), (779, 998), (779, 980), (734, 980)], P['stone_sh'], INK, 2)); g.append(poly([(728, 982), (756, 966), (785, 982)], P['roof'], INK, 2.5))
g.append(poly([(449, 1013), (491, 1013), (491, 995), (449, 995)], P['stone_sh'], INK, 2)); g.append(poly([(444, 997), (470, 985), (496, 997)], P['roof'], INK, 2))
# trees inside the citadel
for cx, cy, r, n in [(975, 1165, 30, 5), (1245, 1295, 40, 6), (1550, 1420, 48, 8), (1290, 1150, 26, 3), (1720, 1630, 30, 4)]:
    g += clump(cx, cy, r, n, P['tree_d'], P['tree'])
g.append(line([(1240, 1325), (1238, 1380), (1245, 1440)], INK, 6))

# --- foreground: the grass slope bottom left (generated blades) ---
fg = [(0, 1405), (40, 1430), (60, 1455), (122, 1455), (203, 1451), (268, 1455), (341, 1451), (406, 1451), (455, 1455), (504, 1463), (552, 1475), (601, 1491), (650, 1507), (699, 1524), (731, 1545),
      (750, 1572), (790, 1592), (851, 1605), (903, 1612), (947, 1615), (995, 1620), (1034, 1633), (1065, 1646), (1100, 1666), (1131, 1688), (1152, H), (0, H)]
g.append(poly(fg, 'url(#grass)', INK, 3))
for _ in range(200):
    x, y = R.uniform(0, 1150), R.uniform(1440, H)
    if not inside((x, y), fg) or not inside((x, y - 30), fg): continue
    a = R.uniform(-2.0, -1.15); L = R.uniform(18, 50)
    g.append(line([(x, y), (x + math.cos(a) * L, y + math.sin(a) * L)], R.choice([P['blade'], P['blade_d'], '#8E8A40']), R.uniform(2, 3.5)))
g.append('</svg>')
open(sys.argv[1], 'w').write('\n'.join(g)); print('ok', len(g), 'elements')
