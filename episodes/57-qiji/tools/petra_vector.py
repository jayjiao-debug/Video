"""ep57 佩特拉 (petra2.jpg, 1717x2576, night): the Treasury (Al-Khazneh) by candlelight drawn in code (our lines,
our palette), laid over the photo's layout so the shutter cut drawing → photo lines up. Every shape is a coordinate
read off a labelled grid of the brightened photo; repeated details are generated (stars, rock flutes and strata,
column capitals, frieze rosettes, dentils, the tholos crown, rope sags, the lantern row on the platform, footprints,
and every lantern from one bag() recipe sized by its distance).
usage: petra_vector.py out.svg"""
import sys, math, random
W, H = 1717, 2576
R = random.Random(57)
INK = '#2A211B'
P = dict(sky0='#0E080F', sky1='#24131F', star='#F6E7CC', ridge='#1A0E12',
         fac_hi='#E08A58', door='#120705', deep='#260E09', recess='#160908', mould='#4A1D10',
         rope='#F2C189', post='#3A1A10', plat='#E8A064', plat_d='#B8683C', plat_top='#FBD49E',
         bag_edge='#E8B070', bag_far='#FFEBC8', foot='#2E1008', foot_hi='#C26A38')

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
def edge_y(edge, x):
    """y of a polyline edge (listed left → right) at x"""
    for a, b in zip(edge, edge[1:]):
        if a[0] <= x <= b[0]: return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0] or 1)
    return edge[0][1] if x < edge[0][0] else edge[-1][1]
def ell(cx, cy, rx, ry, fill, extra=''): return f'<ellipse cx="{cx:.0f}" cy="{cy:.0f}" rx="{rx:.1f}" ry="{ry:.1f}" fill="{fill}" {extra}/>'
def band(top, bot, x0, x1):
    """quad between two slanted edges from x0 to x1"""
    return [(x0, edge_y(top, x0)), (x1, edge_y(top, x1)), (x1, edge_y(bot, x1)), (x0, edge_y(bot, x0))]
def grad(id, stops, x1=0, y1=0, x2=0, y2=1, user=False):
    u = ' gradientUnits="userSpaceOnUse"' if user else ''
    return (f'<linearGradient id="{id}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"{u}>' +
            ''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops) + '</linearGradient>')
def rgrad(id, stops, cx=.5, cy=.5, r=.5):
    return (f'<radialGradient id="{id}" cx="{cx}" cy="{cy}" r="{r}">' +
            ''.join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"/>' for o, c, a in stops) + '</radialGradient>')

defs = [grad('sky', [(0, P['sky0']), (1, P['sky1'])]),
        grad('rock', [(0, '#120909'), (.3, '#1E0E0C'), (.55, '#33150E'), (.8, '#4E1F12'), (1, '#6A2A16')], 0, 0, 0, 1800, True),
        grad('rwall', [(0, '#160B0B'), (.22, '#26110E'), (.42, '#4A1F13'), (.62, '#7E361D'), (.82, '#B4532F'), (1, '#D06C40')], 0, 0, 0, 1760, True),
        grad('slab', [(0, '#2E140F'), (.55, '#4E2114'), (1, '#6E2E19')], 1300, 80, 520, 800, True),
        grad('fac', [(0, '#3E180F'), (.45, '#5E2615'), (.75, '#843A20'), (1, '#A04A29')], 0, 450, 0, 1700, True),
        grad('lit', [(0, '#5C2716'), (.45, '#7E381F'), (.75, '#AA502E'), (1, '#C9683D')], 0, 450, 0, 1700, True),
        grad('shd', [(0, '#220D08'), (.5, '#34140B'), (1, '#4E1F11')], 0, 450, 0, 1700, True),
        grad('sand', [(0, '#F4B474'), (.06, '#E8995A'), (.16, '#C46A38'), (.3, '#8A3A1C'), (.5, '#5A230F'), (.75, '#3E170A'), (1, '#4E1D0D')], 0, 1740, 0, H, True),
        grad('flute', [(0, '#000000'), (1, '#000000')]),
        rgrad('glow', [(0, '#FFD392', .9), (.4, '#F7A158', .45), (1, '#E07038', 0)]),
        rgrad('halo', [(0, '#FFF1D0', .55), (.5, '#FFC27A', .2), (1, '#F59A52', 0)]),
        rgrad('bag', [(0, '#FFFFF8', 1), (.55, '#FFF2D8', 1), (1, '#F4C88A', 1)], .5, .7, .75),
        rgrad('amb', [(0, '#FFB46A', .42), (.55, '#E9783E', .14), (1, '#C85A2A', 0)])]
g = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">', '<defs>' + ''.join(defs) + '</defs>',
     f'<rect width="{W}" height="{H}" fill="url(#sky)"/>']

# ---------------- sky: stars (generated) and the far ridge ----------------
sky_line = [(0, 540), (60, 490), (100, 430), (150, 400), (220, 388), (300, 345), (360, 300), (420, 255), (480, 205), (530, 160), (575, 112), (610, 65), (640, 25), (655, 0)]
ridge = [(0, 455), (50, 405), (100, 368), (160, 352), (230, 343), (300, 318), (380, 268), (460, 212), (530, 158), (580, 108), (615, 55), (640, 0)]
for _ in range(70):
    x, y = R.uniform(10, 600), R.uniform(10, 480)
    if y > edge_y(ridge, x) - 18: continue
    r = R.choice([1.5, 2, 2, 2.6, 3.4]); g.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r}" fill="{P["star"]}" opacity="{R.uniform(.4, .95):.2f}"/>')
g.append(poly(ridge + [(0, 700)], P['ridge'], '#2C1A20', 2))

# ---------------- the canyon walls: one dark mass, lit from below ----------------
g.append(poly(sky_line + [(W, 0), (W, 1800), (0, 1800)], 'url(#rock)', INK, 3))
# left wall: tall eroded flutes (generated slivers, alternately lit and shaded), darker toward the sky
x = 0
while x < 470:
    w = R.uniform(30, 70); top = edge_y(sky_line, x + w / 2) + R.uniform(10, 80); lit = R.random() < .5
    q = [(x, top + 30), (x + w * .5, top), (x + w, top + 40), (x + w + R.uniform(-10, 10), 1795), (x + R.uniform(-8, 8), 1798)]
    g.append(poly(q, '#5E2614' if lit else '#1A0B08', 'none', 0, f'opacity="{R.uniform(.25, .45):.2f}"'))
    x += w * R.uniform(.8, 1.2)
for i in range(18):   # sloping bedding lines (sandstone strata)
    y0 = 620 + i * 66; L = [(0, y0)]
    for k in range(1, 7): L.append((k * 80, y0 - k * 20 + R.uniform(-8, 8)))
    g.append(line([(x, y) for x, y in L if y > edge_y(sky_line, x) + 25], '#120806', 2, 'opacity=".5"'))
g.append(poly([(0, 1260), (60, 1230), (120, 1300), (150, 1460), (140, 1640), (175, 1800), (0, 1800)], '#7A3218', 'none', 0, 'opacity=".45"'))   # lit buttress, far left
g.append(poly([(180, 1330), (300, 1290), (420, 1300), (480, 1340), (500, 1795), (200, 1800), (220, 1600)], '#6A2A15', 'none', 0, 'opacity=".4"'))
# the cliff above the facade catches the candle light in a diagonal band (soft edges, outlined only along its lower lip)
slab = [(400, 900), (470, 760), (560, 620), (660, 500), (770, 395), (880, 310), (990, 240), (1100, 180), (1200, 130), (1290, 95),
        (1335, 180), (1365, 300), (1330, 395), (1040, 440), (1000, 452), (900, 478), (820, 525), (760, 600), (700, 640), (600, 735), (560, 790), (500, 880)]
g.append(poly(slab, 'url(#slab)', 'none', 0, 'opacity=".9"'))
g.append(line(slab[13:], '#140806', 3))
for i in range(8):   # strata across the slab (generated, following its slope)
    L = [(470 + s * 820 + R.uniform(-6, 6), 800 - s * 640 + (i - 4) * 36 * (1 - s * .4) + R.uniform(-5, 5)) for s in [k / 8 for k in range(9)]]
    g.append(line(L, '#1E0C08', 2, 'opacity=".45"'))
# right wall: a tall face, dark above and bright at its foot where the lanterns are
rwall_edge = [(1290, 0), (1330, 150), (1365, 300), (1385, 430), (1398, 620), (1405, 820), (1412, 1020), (1420, 1220), (1430, 1420), (1440, 1600), (1452, 1745)]
g.append(poly(rwall_edge + [(W, 1765), (W, 0)], 'url(#rwall)', INK, 3))
for i in range(26):   # honeycombed strata (generated wavy lines, darker high up, warm low down)
    y0 = 250 + i * 58; x0 = edge_x(rwall_edge, y0) + 6; L = [(x0, y0)]
    for k in range(1, 7): L.append((x0 + k * (W - x0) / 6, y0 + k * 7 + math.sin(i * 1.7 + k * 1.3) * 16))
    g.append(line(L, '#160807' if y0 < 1000 else '#6E2C16', 2.5 if y0 < 1000 else 3, 'opacity=".55"'))
for _ in range(30):   # erosion pockets
    y = R.uniform(420, 1650); x = R.uniform(edge_x(rwall_edge, y) + 40, W - 20); r = R.uniform(14, 36)
    g.append(ell(x, y, r, r * .5, '#1E0C0A' if y < 1000 else '#7E3419', 'opacity=".6"'))
g.append(poly([(1385, 430), (1398, 620), (1405, 820), (1412, 1020), (1420, 1220), (1430, 1420), (1440, 1600), (1452, 1745), (1422, 1745), (1410, 1560), (1398, 1300), (1388, 1000), (1378, 700)], P['deep'], INK, 2))

# ---------------- the facade: dark recess behind the upper storey, jambs of the rock-cut ----------------
recess = [(560, 800), (620, 700), (700, 640), (760, 610), (820, 535), (900, 492), (1000, 462), (1040, 455), (1060, 640), (1080, 900), (840, 1000), (600, 1080)]
g.append(poly(recess, P['recess'], INK, 3))
g.append(poly([(470, 1000), (520, 820), (565, 800), (560, 1710), (505, 1712), (490, 1300)], 'url(#fac)', INK, 3))
g.append(poly([(1340, 420), (1385, 430), (1398, 620), (1405, 820), (1412, 1020), (1420, 1220), (1430, 1420), (1440, 1600), (1422, 1690), (1395, 1690), (1380, 1000), (1360, 600)], 'url(#fac)', INK, 3))

# ---------------- upper storey ----------------
attic_top = [(540, 1090), (1340, 870)]          # the upper storey's floor line (slanted by perspective)
attic_bot = [(540, 1165), (1340, 962)]
g.append(poly(band(attic_top, attic_bot, 560, 1395), 'url(#lit)', INK, 3))
for k in (.35, .7):   # mouldings on the attic band
    g.append(line([lerp((560, edge_y(attic_top, 560)), (560, edge_y(attic_bot, 560)), k), lerp((1395, edge_y(attic_top, 1395)), (1395, edge_y(attic_bot, 1395)), k)], P['mould'], 2))

def column(xt, xb, top, bot, sw=2.5):
    """shaft from (xt[0]..xt[1], top) to (xb[0]..xb[1], bot): lit fill, a shadow strip on the right, a highlight"""
    return [poly([(xt[0], top), (xt[1], top), (xb[1], bot), (xb[0], bot)], 'url(#lit)', INK, sw),
            poly([(xt[1] - (xt[1] - xt[0]) * .28, top + 2), (xt[1] - 1, top + 2), (xb[1] - 1, bot - 2), (xb[1] - (xb[1] - xb[0]) * .28, bot - 2)], 'url(#shd)', 'none', 0, 'opacity=".55"'),
            line([(xt[0] + (xt[1] - xt[0]) * .3, top + 6), (xb[0] + (xb[1] - xb[0]) * .3, bot - 6)], P['fac_hi'], max(2, (xb[1] - xb[0]) * .12), 'opacity=".3"')]
def capital(x0, x1, top, bot, sw=2.5):
    """Corinthian capital: abacus, bell (wider at the top), two rows of acanthus leaves and corner volutes (generated)"""
    w = x1 - x0; h = bot - top; ab = h * .2
    out = [poly([(x0 - w * .04, top), (x1 + w * .04, top), (x1 + w * .02, top + ab), (x0 - w * .02, top + ab)], 'url(#lit)', INK, sw),
           poly([(x0 + w * .02, top + ab), (x1 - w * .02, top + ab), (x1 - w * .16, bot), (x0 + w * .16, bot)], 'url(#lit)', INK, sw)]
    for row, (yy, n) in enumerate(((top + ab + h * .38, 4), (bot - 2, 3))):
        xa, xb_ = x0 + w * (.1 + row * .08), x1 - w * (.1 + row * .08); lw = (xb_ - xa) / n
        for k in range(n):
            lx = xa + k * lw
            out.append(line([(lx, yy), (lx + lw * .25, yy - h * .3), (lx + lw * .5, yy - h * .36), (lx + lw * .75, yy - h * .3), (lx + lw, yy)], P['mould'], 2))
    for sx in (x0 + w * .02, x1 - w * .02):
        out.append(f'<circle cx="{sx:.0f}" cy="{top + ab + h * .14:.0f}" r="{max(3, w * .07):.1f}" fill="{P["fac_hi"]}" stroke="{INK}" stroke-width="2" opacity=".8"/>')
    return out

# left pavilion: back wall, columns, entablature, half pediment seen as a gable, finial
g.append(poly([(572, 794), (817, 798), (830, 1060), (572, 1120)], 'url(#shd)', INK, 3))
for xt, xb, top, bot in [((590, 631), (590, 632), 862, 1105), ((704, 745), (704, 746), 860, 1075), ((804, 831), (805, 832), 858, 1050)]:
    g += column(xt, xb, top, bot); g += capital(xt[0] - 6, xt[1] + 6, top - 34, top)
g.append(poly([(566, 794), (822, 798), (822, 828), (566, 828)], 'url(#lit)', INK, 3))
g.append(poly([(570, 828), (818, 828), (818, 846), (570, 846)], 'url(#fac)', INK, 2))
g.append(poly([(566, 790), (726, 652), (822, 792)], 'url(#lit)', INK, 3)); g.append(poly([(600, 782), (726, 676), (800, 784)], 'url(#fac)', INK, 2))
for (x, y), _ in along([(574, 784), (722, 660)], 9)[1:-1] + along([(730, 660), (815, 786)], 6)[1:-1]:   # dentils
    g.append(poly([(x - 3, y + 6), (x + 3, y + 6), (x + 3, y + 14), (x - 3, y + 14)], P['mould'], 'none', 0))
g.append(poly([(698, 662), (704, 632), (716, 620), (734, 620), (746, 632), (752, 662)], 'url(#lit)', INK, 2.5))

# the tholos: drum, columns, curved entablature, conical roof with a crown of leaves, the urn on top
g.append(poly([(822, 760), (1070, 760), (1070, 1000), (822, 1010)], 'url(#shd)', INK, 3))
for xt, top, bot in [((849, 890), 776, 990), ((949, 990), 760, 995), ((1050, 1082), 772, 975)]:
    g += column(xt, xt, top, bot); g += capital(xt[0] - 5, xt[1] + 5, top - 30, top)
ring_top = [(814, 712), (860, 698), (940, 690), (1010, 694), (1070, 706)]
ring_bot = [(822, 752), (870, 740), (945, 734), (1012, 738), (1072, 750)]
g.append(poly(ring_top + ring_bot[::-1], 'url(#lit)', INK, 3))
g.append(line([lerp(a, b, .5) for a, b in zip(ring_top, ring_bot)], P['mould'], 2))
dome = [(812, 712), (818, 682), (838, 658), (870, 640), (910, 630), (960, 626), (1005, 632), (1040, 648), (1062, 672), (1072, 706)]
g.append(poly(dome, 'url(#lit)', INK, 3))
for (x, y), (tx, ty) in along(dome, 14)[:-1]:   # crown of acanthus tips around the roof's edge
    nx, ny = ty, -tx
    if ny > 0: nx, ny = -nx, -ny
    g.append(poly([(x - tx * 8, y - ty * 8), (x + nx * 16, y + ny * 16), (x + tx * 8, y + ty * 8)], 'url(#lit)', INK, 2))
for k in range(1, 4):   # roof courses
    g.append(line([(812 + 10 * k, 712 - 2 * k), (870, 655 + 14 * k), (960, 640 + 15 * k), (1040, 662 + 12 * k), (1068 - 6 * k, 706 - 2 * k)], P['mould'], 1.5, 'opacity=".7"'))
urn = [(918, 628), (912, 610), (902, 590), (900, 560), (910, 536), (926, 524), (934, 516), (944, 516), (952, 524), (966, 536), (972, 560), (968, 590), (958, 610), (952, 628)]
g.append(poly(urn, '#3E180F', INK, 3)); g.append(line([(904, 560), (968, 560)], '#1E0B07', 2))

# right pavilion: back wall, relief niche, columns, entablature, the broken half pediment block
g.append(poly([(1058, 650), (1335, 600), (1340, 880), (1075, 940)], 'url(#shd)', INK, 3))
g.append(poly([(1167, 680), (1249, 668), (1252, 836), (1168, 846)], 'url(#fac)', INK, 2.5))
g.append(poly([(1160, 836), (1258, 822), (1262, 862), (1162, 876)], 'url(#lit)', INK, 2.5))
for xt, xb, top, bot in [((1094, 1140), (1095, 1142), 680, 932), ((1258, 1304), (1260, 1306), 600, 888)]:
    g += column(xt, xb, top, bot); g += capital(xt[0] - 7, xt[1] + 7, top - 36, top)
g.append(poly([(1304, 596), (1336, 592), (1340, 884), (1306, 888)], 'url(#lit)', INK, 2.5))
g.append(poly([(1050, 592), (1330, 534), (1335, 596), (1056, 650)], 'url(#lit)', INK, 3))
g.append(line([(1053, 620), (1332, 564)], P['mould'], 2))
blk = [(1030, 474), (1320, 444), (1328, 532), (1050, 594)]
g.append(poly(blk, 'url(#lit)', INK, 3))
for k in (.3, .55, .78):
    g.append(line([lerp(blk[0], blk[3], k), lerp(blk[1], blk[2], k)], P['mould'], 2))
for (x, y), _ in along([lerp(blk[0], blk[3], .62), lerp(blk[1], blk[2], .62)], 18)[1:-1]:   # dentils
    g.append(poly([(x - 4, y), (x + 4, y), (x + 4, y + 10), (x - 4, y + 10)], P['mould'], 'none', 0))
for x, y in [(1034, 470), (1290, 436)]:   # acroteria
    g.append(poly([(x, y), (x + 8, y - 30), (x + 30, y - 40), (x + 52, y - 30), (x + 60, y)], 'url(#lit)', INK, 2.5))

# ---------------- lower storey ----------------
arch = [(505, 1292), (604, 1268), (722, 1247), (823, 1226), (1010, 1176), (1145, 1138), (1312, 1100), (1400, 1084)]   # architrave underside
base_line = [(505, 1702), (800, 1700), (1000, 1690), (1150, 1680), (1400, 1672)]
g.append(poly(arch + base_line[::-1], 'url(#fac)', INK, 3))
# bays: left pilaster, relief niche, side door, vestibule shadow, the main door, relief panel, right pilaster
g.append(poly([(505, 1292), (578, 1275), (578, 1702), (505, 1702)], 'url(#lit)', INK, 2.5))
g.append(poly([(636, 1478), (690, 1474), (690, 1652), (636, 1655)], 'url(#shd)', INK, 2.5))
g.append(poly([(644, 1500), (662, 1490), (676, 1520), (672, 1600), (650, 1630), (642, 1580)], 'url(#fac)', '#3A160C', 2))
g.append(poly([(752, 1408), (800, 1404), (800, 1428), (752, 1432)], 'url(#lit)', INK, 2))
g.append(poly([(756, 1432), (798, 1428), (798, 1698), (756, 1700)], P['deep'], INK, 2.5))
g.append(poly([(940, 1210), (987, 1196), (987, 1692), (940, 1694)], 'url(#shd)', 'none', 0, 'opacity=".8"'))
for x in (875, 905):   # pilasters on the vestibule's back wall
    g.append(line([(x, 1222 - (x - 860) * .25), (x, 1696)], P['mould'], 2))
g.append(poly([(1040, 1342), (1126, 1334), (1126, 1366), (1040, 1372)], 'url(#lit)', INK, 2.5))
g.append(poly([(1046, 1372), (1124, 1366), (1124, 1684), (1046, 1688)], P['door'], INK, 3))
g.append(poly([(1198, 1392), (1326, 1380), (1328, 1548), (1200, 1556)], 'url(#fac)', INK, 2.5))
g.append(poly([(1196, 1548), (1330, 1540), (1332, 1574), (1198, 1582)], 'url(#lit)', INK, 2.5))
g.append(poly([(1222, 1420), (1250, 1404), (1270, 1440), (1262, 1520), (1232, 1536), (1218, 1480)], 'url(#lit)', '#3A160C', 2, 'opacity=".8"'))
g.append(poly([(1355, 1092), (1400, 1084), (1400, 1672), (1356, 1674)], 'url(#lit)', INK, 2.5))
# the six columns: shaft, two base rings, capital
cols = [((582, 624), (580, 626), 1265, 1310, 1700), ((700, 744), (698, 746), 1247, 1298, 1700), ((800, 846), (798, 848), 1225, 1275, 1698),
        ((985, 1040), (987, 1045), 1175, 1228, 1690), ((1122, 1175), (1125, 1180), 1138, 1198, 1680), ((1282, 1345), (1286, 1355), 1100, 1160, 1675)]
for xt, xb, ct, cb, bot in cols:
    w = xb[1] - xb[0]
    g += column(xt, xb, cb, bot - w * .45, 3)
    g.append(poly([(xb[0] - w * .1, bot - w * .45), (xb[1] + w * .1, bot - w * .45), (xb[1] + w * .16, bot - w * .2), (xb[0] - w * .16, bot - w * .2)], 'url(#lit)', INK, 2.5))
    g.append(poly([(xb[0] - w * .2, bot - w * .2), (xb[1] + w * .2, bot - w * .2), (xb[1] + w * .2, bot), (xb[0] - w * .2, bot)], 'url(#lit)', INK, 2.5))
    g += capital(xt[0] - (xt[1] - xt[0]) * .2, xt[1] + (xt[1] - xt[0]) * .2, ct, cb, 2.5)
def entab(top, bot, x0, x1, nrose):
    """entablature between two slanted edges: architrave / frieze with rosettes (generated) / cornice"""
    out = [poly(band(top, bot, x0, x1), 'url(#lit)', INK, 3)]
    a = lambda k: [lerp((x, edge_y(top, x)), (x, edge_y(bot, x)), k) for x in (x0, x1)]
    for k in (.22, .3, .66): out.append(line(a(k), P['mould'], 2))
    for (x, y), _ in along(a(.48), nrose)[1:-1]:
        out.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="5" fill="none" stroke="{P["mould"]}" stroke-width="2"/>')
    return out
g += entab([(505, 1196), (649, 1164)], [(505, 1294), (649, 1262)], 505, 649, 3)
g += entab([(649, 1164), (1167, 1059)], [(649, 1262), (1167, 1140)], 649, 1167, 12)
g += entab([(1150, 1012), (1400, 966)], [(1150, 1140), (1400, 1086)], 1150, 1400, 6)
# the pediment: raking cornices, tympanum, dentils, acroteria
g.append(poly([(640, 1166), (872, 1016), (1170, 1010), (1170, 1062)], 'url(#lit)', INK, 3))
g.append(poly([(690, 1150), (872, 1040), (1150, 1034), (1150, 1058)], 'url(#fac)', INK, 2))
for (x, y), _ in along([(652, 1158), (868, 1022)], 14)[1:-1] + along([(878, 1020), (1165, 1014)], 16)[1:-1]:
    g.append(poly([(x - 3, y + 5), (x + 3, y + 5), (x + 3, y + 12), (x - 3, y + 12)], P['mould'], 'none', 0))
for x, y, s in [(651, 1166, 26), (874, 1020, 30), (1158, 1012, 36)]:
    g.append(poly([(x - s, y), (x - s * .8, y - s * .9), (x - s * .3, y - s * 1.25), (x + s * .3, y - s * 1.25), (x + s * .8, y - s * .9), (x + s, y)], 'url(#lit)', INK, 2.5))
    for k in (-.45, 0, .45): g.append(line([(x + k * s, y - 2), (x + k * s * 1.2, y - s * 1.05)], P['mould'], 2))

# ---------------- ground: warm wash, rope line, platform, sand ----------------
g.append(ell(860, 1760, 980, 420, 'url(#amb)'))   # candle light washing up the facade's foot and the walls
plat_top = [(205, 1790), (262, 1746), (400, 1737), (600, 1725), (800, 1716), (1000, 1709), (1160, 1704), (1380, 1696), (1460, 1694)]
plat_bot = [(200, 1802), (262, 1772), (400, 1766), (600, 1757), (800, 1749), (1000, 1744), (1160, 1740), (1380, 1735), (1460, 1734)]
g.append(poly([(505, 1712), (1400, 1672), (1452, 1690), (1460, 1694)] + plat_top[::-1][:-1] + [(205, 1790), (180, 1800)], P['plat_d'], INK, 2))
posts = [815 + k * 98 for k in range(8)]
for x in posts: g.append(line([(x, 1700 - (x - 815) * .03), (x, 1655 - (x - 815) * .03)], P['post'], 4))
for a, b in zip(posts, posts[1:]):   # the rope sags between posts (two strands)
    ya, yb = 1660 - (a - 815) * .03, 1660 - (b - 815) * .03
    g.append(line([(a + (b - a) * t / 8, ya + (yb - ya) * t / 8 + 9 * math.sin(math.pi * t / 8)) for t in range(9)], P['rope'], 3))
    g.append(line([(a + (b - a) * t / 8, ya + 22 + (yb - ya) * t / 8 + 7 * math.sin(math.pi * t / 8)) for t in range(9)], P['rope'], 2.5, 'opacity=".8"'))
g.append(poly(plat_top + plat_bot[::-1], P['plat'], INK, 2.5))
g.append(line(plat_top[1:], P['plat_top'], 4))
for (x, y), _ in along(plat_top[1:], 22)[1:-1]:   # block joints on the platform's face
    g.append(line([(x, y + 4), (x + 2, y + 26)], P['plat_d'], 2))
sand_top = [(0, 1792), (180, 1800)] + plat_bot + [(1560, 1740), (W, 1765)]
g.append(poly(sand_top + [(W, H), (0, H)], 'url(#sand)', INK, 3))
for _ in range(120):   # footprints in the sand (generated): a dark dent with a lit far rim, larger toward the camera
    y = R.uniform(1990, H - 10); s = (y - 1720) / 850; x = R.uniform(-20, W + 20); rx = R.uniform(16, 42) * s; ry = rx * R.uniform(.28, .42)
    g.append(ell(x, y, rx, ry, P['foot'], 'opacity=".5"'))
    g.append(line([(x - rx * .9, y - ry * .2), (x - rx * .4, y - ry * .95), (x + rx * .4, y - ry * .95), (x + rx * .9, y - ry * .2)], P['foot_hi'], max(1.5, 3 * s), 'opacity=".55"'))

# ---------------- lanterns ----------------
def bag(cx, b, w, h, shape=None):
    """a paper-bag lantern: warm glow on the sand, a soft halo, a cream body lit from inside with a crumpled top"""
    s = min(1, h / 120); out = [ell(cx, b - h * .04, w * 2.1 + 10, (w * 2.1 + 10) * (.26 + .14 * s), 'url(#glow)')]
    if h > 24: out.append(ell(cx, b - h * .5, w * 1.05, h * .75, 'url(#halo)'))
    if shape is None:
        n = 5; top = [(cx + w * .47 - (k / n) * w * .94, b - h + (R.uniform(-.07, .07) * h if 0 < k < n else R.uniform(0, .05) * h)) for k in range(n + 1)]
        shape = [(cx - w * .5, b), (cx + w * .5, b)] + top
    if h > 24:
        out.append(poly(shape, 'url(#bag)', INK, 3 if h > 140 else 2.5 if h > 60 else 2))
        out.append(line([(cx + w * .16, b - h * .9), (cx + w * .21, b - h * .45), (cx + w * .14, b - 4)], P['bag_edge'], 3 if h > 100 else 2, 'opacity=".75"'))
        if h > 60: out.append(ell(cx, b - h * .28, w * .27, h * .17, '#FFFFFF', 'opacity=".75"'))
    else:
        out.append(poly(shape, P['bag_far'], '#C77A40', 1.2))
    return out
# the two big foreground bags, outlined by hand (crumpled, leaning)
bigL = [(225, 2510), (238, 2400), (250, 2290), (260, 2192), (285, 2178), (310, 2172), (340, 2182), (372, 2196), (405, 2210), (402, 2330), (398, 2460), (382, 2505), (340, 2530), (280, 2528)]
bigR = [(1335, 2175), (1360, 2158), (1395, 2150), (1430, 2155), (1470, 2168), (1476, 2300), (1470, 2420), (1440, 2440), (1380, 2432), (1348, 2405), (1338, 2300)]
bigR2 = [(1388, 2010), (1410, 2000), (1440, 2005), (1468, 2015), (1470, 2080), (1465, 2142), (1400, 2146), (1386, 2120)]
# every other lantern read off the grid: (centre x, bottom y, width, height)
near = [(487, 2190, 76, 165), (38, 2088, 100, 124), (230, 2020, 74, 104), (1146, 2048, 62, 102), (697, 2072, 62, 118), (631, 1986, 50, 76),
        (389, 1964, 44, 66), (1504, 2008, 46, 88), (688, 1940, 38, 56), (424, 1926, 36, 52), (1116, 1955, 36, 64), (1374, 1936, 40, 64),
        (1310, 1889, 36, 49), (1032, 1915, 35, 62), (910, 1886, 30, 46), (748, 1902, 32, 54), (283, 1904, 31, 46), (320, 1890, 28, 44),
        (88, 1900, 30, 52), (44, 1942, 44, 62), (1260, 1862, 25, 47), (1197, 1837, 25, 38), (1022, 1845, 28, 52), (1436, 1812, 28, 36),
        (1450, 1846, 28, 46), (184, 1882, 25, 34), (502, 1871, 34, 44), (730, 1877, 28, 46), (809, 1843, 19, 31), (853, 1821, 25, 31),
        (1262, 1812, 28, 41), (1129, 1799, 22, 31), (275, 1815, 25, 34), (356, 1862, 19, 34), (60, 1877, 19, 34), (12, 1852, 25, 31)]
mid = [(464, 1790, 28, 26), (490, 1789, 22, 20), (535, 1784, 28, 19), (566, 1778, 16, 16), (591, 1784, 16, 25), (423, 1789, 22, 18),
       (395, 1778, 10, 12), (375, 1790, 12, 16), (340, 1796, 19, 19), (306, 1793, 12, 16), (364, 1799, 22, 25), (407, 1809, 16, 19),
       (473, 1802, 16, 19), (522, 1806, 12, 19), (496, 1818, 10, 19), (544, 1821, 12, 22), (589, 1830, 18, 25), (453, 1831, 19, 22),
       (386, 1846, 16, 28), (334, 1840, 19, 19), (287, 1858, 24, 26), (262, 1827, 12, 25), (228, 1834, 19, 22), (197, 1824, 19, 22),
       (167, 1831, 16, 22), (148, 1824, 16, 16), (120, 1831, 16, 16), (137, 1862, 25, 22), (197, 1848, 19, 25), (81, 1846, 25, 22),
       (34, 1846, 19, 22), (529, 1827, 16, 22), (570, 1846, 22, 22), (476, 1840, 16, 22),
       (613, 1774, 12, 16), (634, 1771, 16, 16), (652, 1768, 9, 12), (686, 1765, 22, 16), (712, 1787, 16, 20), (755, 1762, 16, 19),
       (770, 1789, 16, 26), (789, 1756, 9, 19), (816, 1756, 19, 19), (836, 1753, 9, 16), (844, 1777, 16, 22), (877, 1753, 9, 16),
       (879, 1784, 12, 25), (899, 1762, 16, 19), (927, 1746, 12, 16), (968, 1768, 16, 22), (947, 1798, 20, 24), (999, 1746, 12, 19),
       (1035, 1740, 12, 16), (1058, 1757, 18, 20), (1089, 1746, 19, 22), (1105, 1771, 9, 16), (1137, 1771, 19, 25), (1089, 1790, 16, 19),
       (1108, 1790, 16, 28), (785, 1812, 19, 28), (739, 1809, 19, 28), (671, 1806, 16, 25), (657, 1831, 19, 28), (684, 1846, 19, 28),
       (605, 1809, 16, 25), (1182, 1746, 12, 22), (1238, 1740, 12, 19), (1297, 1749, 12, 22), (1380, 1743, 12, 19), (1136, 1740, 12, 19),
       (1201, 1762, 12, 22), (1217, 1781, 16, 28), (1251, 1752, 12, 16), (1267, 1771, 16, 22), (1300, 1784, 16, 28), (1333, 1765, 12, 19),
       (1348, 1774, 16, 25), (1389, 1774, 16, 22), (1445, 1777, 25, 28), (1480, 1777, 12, 22), (1503, 1774, 19, 22)]
row = []   # the row of small bags along the platform's top, spaced wider toward the camera (generated)
x = 300
while x < 1320:
    y = edge_y(plat_top, x) + 3; row.append((x, y, 8 + (x - 300) * .004, 11 + (x - 300) * .004)); x += 40 + (x - 300) * .06
items = [(cx, b, w, h, None) for cx, b, w, h in row + mid + near] + [(318, 2530, 180, 358, bigL), (1405, 2440, 140, 290, bigR), (1428, 2146, 84, 146, bigR2)]
for cx, b, w, h, shape in sorted(items, key=lambda t: t[1]):
    g += bag(cx, b, w, h, shape)

g.append('</svg>')
open(sys.argv[1], 'w').write('\n'.join(g)); print('ok', len(g), 'elements')
