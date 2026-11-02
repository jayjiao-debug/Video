"""ep57 佩特拉 (petra2.jpg, 1717x2576, night): the Treasury (Al-Khazneh) by candlelight drawn in code (our lines,
our palette), laid over the photo's layout so the shutter cut drawing → photo lines up. Every shape is a coordinate
read off a labelled grid of the brightened photo; repeated details are generated (stars, rock strata, column
capitals, frieze ornaments, dentils, the tholos crown, rope sags, platform blocks, sand ripples, the lantern rows).
usage: petra_vector.py out.svg"""
import sys, math, random
W, H = 1717, 2576
R = random.Random(57)
INK = '#2A211B'
P = dict(sky0='#120A16', sky1='#2A1726', star='#F6E7CC', ridge='#1E1015',
         fac_hi='#E08A58', door='#120705', deep='#2A0F09', recess='#1A0A09',
         rope='#F2C189', post='#3A1A10', plat='#E59A5E', plat_d='#B5643A', plat_top='#F7C690',
         bag='#FFF3DC', bag_edge='#F2C483', bag_far='#FFE9C4', ripple='#3A160B', ripple_hi='#B56234')

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
    """quad between two slanted lines (each given as two points) from x0 to x1"""
    return [(x0, edge_y(top, x0)), (x1, edge_y(top, x1)), (x1, edge_y(bot, x1)), (x0, edge_y(bot, x0))]

def grad(id, stops, x1=0, y1=0, x2=0, y2=1, user=False):
    u = ' gradientUnits="userSpaceOnUse"' if user else ''
    return (f'<linearGradient id="{id}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"{u}>' +
            ''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops) + '</linearGradient>')
defs = [grad('sky', [(0, P['sky0']), (1, P['sky1'])]),
        grad('rock', [(0, '#1C0C0B'), (.3, '#2A120E'), (.55, '#401A10'), (.8, '#5E2614'), (1, '#7E3519')], 0, 0, 0, 1800, True),
        grad('rwall', [(0, '#1E0D0C'), (.2, '#2E140F'), (.4, '#5A2616'), (.6, '#94442A'), (.8, '#C25E38'), (1, '#D9784A')], 0, 0, 0, 1760, True),
        grad('slab', [(0, '#3A1810'), (.5, '#5A2616'), (1, '#7A3520')], 1300, 80, 450, 820, True),
        grad('fac', [(0, '#4A1D11'), (.45, '#6A2C18'), (.75, '#8E3F22'), (1, '#A84E2B')], 0, 450, 0, 1700, True),
        grad('lit', [(0, '#6A2D19'), (.45, '#8C3F23'), (.75, '#B65632'), (1, '#CF6C3F')], 0, 450, 0, 1700, True),
        grad('shd', [(0, '#2A100A'), (.5, '#3E180D'), (1, '#5A2414')], 0, 450, 0, 1700, True),
        grad('sand', [(0, '#F2AE6C'), (.09, '#E08C50'), (.25, '#A9542A'), (.5, '#6C2B15'), (.78, '#46190C'), (1, '#5A2311')], 0, 1700, 0, H, True),
        '<radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFD08A" stop-opacity=".85"/><stop offset=".45" stop-color="#F59A52" stop-opacity=".4"/><stop offset="1" stop-color="#E07038" stop-opacity="0"/></radialGradient>',
        '<radialGradient id="bag" cx=".5" cy=".68" r=".75"><stop offset="0" stop-color="#FFFFF6"/><stop offset=".55" stop-color="#FFF2D6"/><stop offset="1" stop-color="#F6CB8C"/></radialGradient>',
        '<radialGradient id="amb" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFB46A" stop-opacity=".45"/><stop offset=".6" stop-color="#E9783E" stop-opacity=".15"/><stop offset="1" stop-color="#C85A2A" stop-opacity="0"/></radialGradient>']
g = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">', '<defs>' + ''.join(defs) + '</defs>',
     f'<rect width="{W}" height="{H}" fill="url(#sky)"/>']

# ---------------- sky: stars (generated) and the far ridge ----------------
sky_line = [(0, 540), (60, 490), (100, 430), (150, 400), (220, 388), (300, 345), (360, 300), (420, 255), (480, 205), (530, 160), (575, 112), (610, 65), (640, 25), (655, 0)]
ridge = [(0, 455), (50, 405), (100, 368), (160, 352), (230, 343), (300, 318), (380, 268), (460, 212), (530, 158), (580, 108), (615, 55), (640, 0)]
for _ in range(60):
    x, y = R.uniform(10, 600), R.uniform(10, 500)
    if y > edge_y(ridge, x) - 18: continue
    r = R.choice([1.6, 2, 2.4, 3.2]); g.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r}" fill="{P["star"]}" opacity="{R.uniform(.45, .95):.2f}"/>')
g.append(poly(ridge + [(0, 700)][:0] + [(0, 700)], P['ridge'], '#2C1A20', 2))

# ---------------- the canyon: one rock mass, then lit faces and strata ----------------
g.append(poly(sky_line + [(W, 0), (W, 1800), (0, 1800)], 'url(#rock)', INK, 3))
# left wall: big buttresses lit from below (hand-placed), cracks (generated)
g.append(poly([(0, 900), (120, 820), (260, 760), (380, 740), (470, 760), (505, 800), (505, 1790), (0, 1800)], '#3A170F', '#24100B', 2, 'opacity=".55"'))
g.append(poly([(150, 1180), (300, 1120), (430, 1110), (505, 1130), (505, 1790), (180, 1800), (120, 1500)], '#5A2414', '#2E140C', 2, 'opacity=".6"'))
g.append(poly([(0, 1350), (90, 1300), (150, 1420), (130, 1600), (170, 1800), (0, 1800)], '#4E1F12', '#2E140C', 2, 'opacity=".6"'))
for i in range(16):   # sloping bedding lines on the left wall (sandstone strata)
    y0 = 600 + i * 72; L = [(0, y0)]
    for k in range(1, 7): L.append((k * 84, y0 - k * 22 + R.uniform(-8, 8) + (k * k * 1.2 if i > 8 else 0)))
    g.append(line([(x, y) for x, y in L if y > edge_y(sky_line, x) + 20], '#1E0C08', 2, 'opacity=".45"'))
for x0 in (60, 190, 330, 450):   # vertical joints
    g.append(line([(x0 + R.uniform(-10, 10), y) for y in range(int(edge_y(sky_line, x0)) + 60, 1790, 120)], '#1A0A07', 2.5, 'opacity=".5"'))
# the lit cliff above the facade (a slab catching the candle light, darker upward)
slab = [(430, 840), (500, 720), (590, 590), (680, 470), (780, 370), (880, 290), (990, 220), (1100, 160), (1200, 110), (1290, 70),
        (1340, 170), (1370, 300), (1330, 395), (1040, 440), (1000, 455), (900, 480), (820, 530), (760, 610), (700, 650), (600, 740), (560, 790), (505, 860)]
g.append(poly(slab, 'url(#slab)', INK, 3))
for i in range(9):   # strata across the slab (generated, following its slope)
    t = (i + 1) / 10; a = lerp((470, 790), (1300, 100), t * .15); L = []
    for k in range(9):
        s = k / 8; L.append((520 + s * 760 + R.uniform(-6, 6), 760 - s * 620 - i * 0 + (i - 4) * 38 * (1 - s * .3) + R.uniform(-5, 5)))
    g.append(line(L, '#2A110B', 2, 'opacity=".4"'))
# right wall: a tall face, bright at the foot where the lanterns are
rwall_edge = [(1290, 0), (1330, 150), (1365, 300), (1385, 430), (1398, 620), (1405, 820), (1412, 1020), (1420, 1220), (1430, 1420), (1440, 1600), (1452, 1745)]
g.append(poly(rwall_edge + [(W, 1765), (W, 0)], 'url(#rwall)', INK, 3))
g.append(poly([(1385, 430), (1398, 620), (1405, 820), (1412, 1020), (1420, 1220), (1430, 1420), (1440, 1600), (1452, 1745), (1422, 1745), (1410, 1560), (1398, 1300), (1388, 1000), (1378, 700)], P['deep'], INK, 2))
for i in range(22):   # honeycombed strata on the right wall (generated wavy lines)
    y0 = 280 + i * 66; L = [(edge_x(rwall_edge, y0) + 6, y0)]
    for k in range(1, 6): L.append((L[0][0] + k * (W - L[0][0]) / 5, y0 + k * 9 + math.sin(i * 1.7 + k) * 14))
    g.append(line(L, '#3A160C' if y0 < 900 else '#8A3A1E', 2.5, 'opacity=".55"'))
for _ in range(26):   # pocket hollows (erosion) on the right wall
    y = R.uniform(450, 1650); x = R.uniform(edge_x(rwall_edge, y) + 40, W - 20); r = R.uniform(14, 34)
    g.append(ell(x, y, r, r * .55, '#4A1C0E' if y < 1000 else '#9C4626', 'opacity=".6"'))

# ---------------- the facade: dark recess behind the upper storey ----------------
recess = [(560, 800), (620, 700), (700, 640), (760, 610), (820, 535), (900, 492), (1000, 462), (1040, 455), (1060, 640), (1080, 900),
          (840, 1000), (600, 1080)]
g.append(poly(recess, P['recess'], INK, 3))
# frame of the rock-cut: left jamb (lit edge) and right jamb
g.append(poly([(470, 1000), (520, 820), (565, 800), (560, 1710), (505, 1712), (490, 1300)], 'url(#fac)', INK, 3))
g.append(poly([(1340, 420), (1385, 430), (1398, 620), (1405, 820), (1412, 1020), (1420, 1220), (1430, 1420), (1440, 1600), (1422, 1690), (1395, 1690), (1380, 1000), (1360, 600)], 'url(#fac)', INK, 3))

# ---------------- upper storey ----------------
attic_top = [(540, 1090), (1340, 870)]          # the upper storey's floor line (slanted by perspective)
attic_bot = [(540, 1165), (1340, 962)]
g.append(poly(band(attic_top, attic_bot, 560, 1395), 'url(#lit)', INK, 3))
for k in (.35, .7):   # mouldings on the attic band
    g.append(line([lerp((560, edge_y(attic_top, 560)), (560, edge_y(attic_bot, 560)), k), lerp((1395, edge_y(attic_top, 1395)), (1395, edge_y(attic_bot, 1395)), k)], '#5A2414', 2))

def column(xt, xb, top, bot, sw=2.5, shade=True):
    """shaft from (xt[0]..xt[1], top) to (xb[0]..xb[1], bot): lit fill, a shadow strip on the right, a highlight"""
    out = [poly([(xt[0], top), (xt[1], top), (xb[1], bot), (xb[0], bot)], 'url(#lit)', INK, sw)]
    if shade:
        out.append(poly([(xt[1] - (xt[1] - xt[0]) * .28, top + 2), (xt[1] - 1, top + 2), (xb[1] - 1, bot - 2), (xb[1] - (xb[1] - xb[0]) * .28, bot - 2)], 'url(#shd)', 'none', 0, 'opacity=".55"'))
        out.append(line([(xt[0] + (xt[1] - xt[0]) * .3, top + 6), (xb[0] + (xb[1] - xb[0]) * .3, bot - 6)], P['fac_hi'], max(2, (xb[1] - xb[0]) * .12), 'opacity=".35"'))
    return out
def capital(x0, x1, top, bot, sw=2.5):
    """Corinthian capital: bell (wider at the top), abacus, two rows of acanthus leaves (generated)"""
    w = x1 - x0; h = bot - top; ab = h * .2
    out = [poly([(x0 - w * .04, top), (x1 + w * .04, top), (x1 + w * .02, top + ab), (x0 - w * .02, top + ab)], 'url(#lit)', INK, sw)]
    out.append(poly([(x0 + w * .02, top + ab), (x1 - w * .02, top + ab), (x1 - w * .16, bot), (x0 + w * .16, bot)], 'url(#lit)', INK, sw))
    for row, (yy, n) in enumerate(((top + ab + h * .38, 4), (bot - 2, 3))):
        xa, xb_ = x0 + w * (.1 + row * .08), x1 - w * (.1 + row * .08); lw = (xb_ - xa) / n
        for k in range(n):
            lx = xa + k * lw
            out.append(line([(lx, yy), (lx + lw * .25, yy - h * .3), (lx + lw * .5, yy - h * .36), (lx + lw * .75, yy - h * .3), (lx + lw, yy)], '#5A2414', 2))
    for sx in (x0 + w * .02, x1 - w * .02):   # corner volutes
        out.append(f'<circle cx="{sx:.0f}" cy="{top + ab + h * .14:.0f}" r="{max(3, w * .07):.1f}" fill="{P["fac_hi"]}" stroke="{INK}" stroke-width="2" opacity=".85"/>')
    return out

# left pavilion: back wall, columns, entablature, half pediment seen as a gable, finial
g.append(poly([(572, 794), (817, 798), (830, 1060), (572, 1120)], 'url(#shd)', INK, 3))
for xt, xb, top, bot in [((590, 631), (590, 632), 862, 1105), ((704, 745), (704, 746), 860, 1075), ((804, 831), (805, 832), 858, 1050)]:
    g += column(xt, xb, top, bot); g += capital(xt[0] - 6, xt[1] + 6, top - 34, top)
g.append(poly([(566, 794), (822, 798), (822, 828), (566, 828)], 'url(#lit)', INK, 3))
g.append(poly([(570, 828), (818, 828), (818, 846), (570, 846)], 'url(#fac)', INK, 2))
gable = [(566, 790), (726, 652), (822, 792)]
g.append(poly(gable, 'url(#lit)', INK, 3)); g.append(poly([(600, 782), (726, 676), (800, 784)], 'url(#fac)', INK, 2))
for (x, y), (tx, ty) in along([(574, 784), (722, 660)], 9)[1:-1] + along([(730, 660), (815, 786)], 6)[1:-1]:   # dentils
    g.append(poly([(x - 3, y + 6), (x + 3, y + 6), (x + 3, y + 14), (x - 3, y + 14)], '#5A2414', 'none', 0))
g.append(poly([(698, 662), (704, 632), (716, 620), (734, 620), (746, 632), (752, 662)], 'url(#lit)', INK, 2.5))

# the tholos: drum, columns, curved entablature, conical roof with a crown of leaves, the urn on top
g.append(poly([(822, 760), (1070, 760), (1070, 1000), (822, 1010)], 'url(#shd)', INK, 3))
for xt, top, bot in [((849, 890), 776, 990), ((949, 990), 760, 995), ((1050, 1082), 772, 975)]:
    g += column(xt, (xt[0], xt[1]), top, bot); g += capital(xt[0] - 5, xt[1] + 5, top - 30, top)
ring_top = [(814, 712), (860, 698), (940, 690), (1010, 694), (1070, 706)]
ring_bot = [(822, 752), (870, 740), (945, 734), (1012, 738), (1072, 750)]
g.append(poly(ring_top + ring_bot[::-1], 'url(#lit)', INK, 3))
g.append(line([lerp(a, b, .5) for a, b in zip(ring_top, ring_bot)], '#5A2414', 2))
dome = [(812, 712), (818, 682), (838, 658), (870, 640), (910, 630), (960, 626), (1005, 632), (1040, 648), (1062, 672), (1072, 706)]
g.append(poly(dome, 'url(#lit)', INK, 3))
for (x, y), (tx, ty) in along(dome, 14)[:-1]:   # crown of acanthus tips around the roof's edge
    nx, ny = ty, -tx
    if ny > 0: nx, ny = -nx, -ny
    g.append(poly([(x - tx * 8, y - ty * 8), (x + nx * 16, y + ny * 16), (x + tx * 8, y + ty * 8)], 'url(#lit)', INK, 2))
for k in range(1, 4):   # tiled roof courses
    g.append(line([(812 + 10 * k, 712 - 2 * k), (870, 655 + 14 * k), (960, 640 + 15 * k), (1040, 662 + 12 * k), (1068 - 6 * k, 706 - 2 * k)], '#5A2414', 1.5, 'opacity=".7"'))
urn = [(918, 628), (912, 610), (902, 590), (900, 560), (910, 536), (926, 524), (934, 516), (944, 516), (952, 524), (966, 536), (972, 560), (968, 590), (958, 610), (952, 628)]
g.append(poly(urn, '#4A1D11', INK, 3)); g.append(line([(904, 560), (968, 560)], '#2A100A', 2))

# right pavilion: back wall, relief niche, columns, entablature, the broken half pediment block
g.append(poly([(1058, 650), (1335, 600), (1340, 880), (1075, 940)], 'url(#shd)', INK, 3))
g.append(poly([(1167, 680), (1249, 668), (1252, 836), (1168, 846)], 'url(#fac)', INK, 2.5))
g.append(poly([(1160, 836), (1258, 822), (1262, 862), (1162, 876)], 'url(#lit)', INK, 2.5))
for xt, xb, top, bot in [((1094, 1140), (1095, 1142), 680, 932), ((1258, 1304), (1260, 1306), 600, 888)]:
    g += column(xt, xb, top, bot); g += capital(xt[0] - 7, xt[1] + 7, top - 36, top)
g.append(poly([(1304, 596), (1336, 592), (1340, 884), (1306, 888)], 'url(#lit)', INK, 2.5))
g.append(poly([(1050, 592), (1330, 534), (1335, 596), (1056, 650)], 'url(#lit)', INK, 3))
g.append(line([(1053, 620), (1332, 564)], '#5A2414', 2))
blk = [(1030, 474), (1320, 444), (1328, 532), (1050, 594)]
g.append(poly(blk, 'url(#lit)', INK, 3))
for k in (.3, .55, .78):
    g.append(line([lerp(blk[0], blk[3], k), lerp(blk[1], blk[2], k)], '#5A2414', 2))
for (x, y), _ in along([lerp(blk[0], blk[3], .62), lerp(blk[1], blk[2], .62)], 18)[1:-1]:   # dentils
    g.append(poly([(x - 4, y), (x + 4, y), (x + 4, y + 10), (x - 4, y + 10)], '#5A2414', 'none', 0))
for x, y in [(1034, 470), (1290, 436)]:   # acroteria
    g.append(poly([(x, y), (x + 8, y - 30), (x + 30, y - 40), (x + 52, y - 30), (x + 60, y)], 'url(#lit)', INK, 2.5))

# ---------------- lower storey ----------------
arch = [(505, 1292), (604, 1268), (722, 1247), (823, 1226), (1010, 1176), (1145, 1138), (1312, 1100), (1400, 1084)]   # architrave underside
base_line = [(505, 1702), (800, 1700), (1000, 1690), (1150, 1680), (1400, 1672)]
g.append(poly(arch + base_line[::-1], 'url(#fac)', INK, 3))
# bays: left pilaster, relief niche, side door, vestibule shadow, the main door, relief panel
g.append(poly([(505, 1292), (578, 1275), (578, 1702), (505, 1702)], 'url(#lit)', INK, 2.5))
g.append(poly([(636, 1478), (690, 1474), (690, 1652), (636, 1655)], 'url(#shd)', INK, 2.5))
g.append(poly([(644, 1500), (662, 1490), (676, 1520), (672, 1600), (650, 1630), (642, 1580)], 'url(#fac)', '#3A160C', 2))
g.append(poly([(752, 1408), (800, 1404), (800, 1428), (752, 1432)], 'url(#lit)', INK, 2))
g.append(poly([(756, 1432), (798, 1428), (798, 1698), (756, 1700)], P['deep'], INK, 2.5))
g.append(poly([(940, 1210), (987, 1196), (987, 1692), (940, 1694)], 'url(#shd)', 'none', 0, 'opacity=".8"'))
for x in (875, 905):   # pilasters on the vestibule's back wall
    g.append(line([(x, 1222 - (x - 860) * .25), (x, 1696)], '#5A2414', 2))
g.append(poly([(1040, 1342), (1126, 1334), (1126, 1366), (1040, 1372)], 'url(#lit)', INK, 2.5))
g.append(poly([(1046, 1372), (1124, 1366), (1124, 1684), (1046, 1688)], P['door'], INK, 3))
g.append(poly([(1198, 1392), (1326, 1380), (1328, 1548), (1200, 1556)], 'url(#fac)', INK, 2.5))
g.append(poly([(1196, 1548), (1330, 1540), (1332, 1574), (1198, 1582)], 'url(#lit)', INK, 2.5))
g.append(poly([(1222, 1420), (1250, 1404), (1270, 1440), (1262, 1520), (1232, 1536), (1218, 1480)], 'url(#lit)', '#3A160C', 2, 'opacity=".8"'))
g.append(poly([(1355, 1092), (1400, 1084), (1400, 1672), (1356, 1674)], 'url(#lit)', INK, 2.5))
# the six columns: shaft, base, capital
cols = [((582, 624), (580, 626), 1265, 1310, 1700), ((700, 744), (698, 746), 1247, 1298, 1700), ((800, 846), (798, 848), 1225, 1275, 1698),
        ((985, 1040), (987, 1045), 1175, 1228, 1690), ((1122, 1175), (1125, 1180), 1138, 1198, 1680), ((1282, 1345), (1286, 1355), 1100, 1160, 1675)]
for xt, xb, ct, cb, bot in cols:
    w = xb[1] - xb[0]
    g += column(xt, xb, cb, bot - w * .45, 3)
    g.append(poly([(xb[0] - w * .1, bot - w * .45), (xb[1] + w * .1, bot - w * .45), (xb[1] + w * .16, bot - w * .2), (xb[0] - w * .16, bot - w * .2)], 'url(#lit)', INK, 2.5))
    g.append(poly([(xb[0] - w * .2, bot - w * .2), (xb[1] + w * .2, bot - w * .2), (xb[1] + w * .2, bot), (xb[0] - w * .2, bot)], 'url(#lit)', INK, 2.5))
    g += capital(xt[0] - (xt[1] - xt[0]) * .2, xt[1] + (xt[1] - xt[0]) * .2, ct, cb, 2.5)
# entablatures: left wing, centre (under the pediment), right block — architrave / frieze (ornaments) / cornice
def entab(top, bot, x0, x1, nrose):
    out = [poly(band(top, bot, x0, x1), 'url(#lit)', INK, 3)]
    a = lambda k: [lerp((x, edge_y(top, x)), (x, edge_y(bot, x)), k) for x in (x0, x1)]
    for k in (.22, .3, .66):
        out.append(line(a(k), '#5A2414', 2))
    f0, f1 = a(.48)
    for (x, y), _ in along([f0, f1], nrose)[1:-1]:   # frieze rosettes and vine scrolls
        out.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="5" fill="none" stroke="#5A2414" stroke-width="2"/>')
    return out
g += entab([(505, 1196), (649, 1164)], [(505, 1294), (649, 1262)], 505, 649, 3)
g += entab([(649, 1164), (1167, 1059)], [(649, 1262), (1167, 1140)], 649, 1167, 12)
g += entab([(1150, 1012), (1400, 966)], [(1150, 1140), (1400, 1086)], 1150, 1400, 6)
# the pediment: raking cornices, tympanum, dentils, acroteria
ped = [(640, 1166), (872, 1016), (1170, 1010), (1170, 1062)]
g.append(poly(ped, 'url(#lit)', INK, 3))
g.append(poly([(690, 1150), (872, 1040), (1150, 1034), (1150, 1058)], 'url(#fac)', INK, 2))
for (x, y), _ in along([(652, 1158), (868, 1022)], 14)[1:-1] + along([(878, 1020), (1165, 1014)], 16)[1:-1]:
    g.append(poly([(x - 3, y + 5), (x + 3, y + 5), (x + 3, y + 12), (x - 3, y + 12)], '#5A2414', 'none', 0))
for x, y, s in [(651, 1166, 26), (874, 1020, 30), (1158, 1012, 36)]:
    g.append(poly([(x - s, y), (x - s * .8, y - s * .9), (x - s * .3, y - s * 1.25), (x + s * .3, y - s * 1.25), (x + s * .8, y - s * .9), (x + s, y)], 'url(#lit)', INK, 2.5))
    for k in (-.45, 0, .45): g.append(line([(x + k * s, y - 2), (x + k * s * 1.2, y - s * 1.05)], '#5A2414', 2))

# ---------------- ground: rope line, platform, sand ----------------
amb = ell(860, 1700, 760, 260, 'url(#amb)')   # warm wash of candle light up the facade's foot
g.append(amb)
plat_top = [(180, 1758), (300, 1748), (500, 1735), (700, 1722), (870, 1712), (1100, 1703), (1380, 1695), (1460, 1693)]
plat_bot = [(180, 1795), (300, 1783), (500, 1769), (700, 1757), (870, 1748), (1100, 1740), (1380, 1733), (1460, 1732)]
g.append(poly([(505, 1712), (1400, 1672), (1452, 1690), (1460, 1693)] + plat_top[::-1], P['plat_d'], INK, 2))
posts = [815 + k * 98 for k in range(8)]
for x in posts: g.append(line([(x, 1700 - (x - 815) * .03), (x, 1655 - (x - 815) * .03)], P['post'], 4))
for a, b in zip(posts, posts[1:]):   # the rope sags between posts
    ya, yb = 1660 - (a - 815) * .03, 1660 - (b - 815) * .03
    g.append(line([(a + (b - a) * t / 8, ya + (yb - ya) * t / 8 + 9 * math.sin(math.pi * t / 8)) for t in range(9)], P['rope'], 3))
    g.append(line([(a + (b - a) * t / 8, ya + 22 + (yb - ya) * t / 8 + 7 * math.sin(math.pi * t / 8)) for t in range(9)], P['rope'], 2.5, 'opacity=".8"'))
g.append(poly(plat_top + plat_bot[::-1], P['plat'], INK, 2.5))
g.append(line(plat_top, P['plat_top'], 4))
for (x, y), _ in along(plat_top, 22)[1:-1]:   # block joints on the platform's face
    g.append(line([(x, y + 4), (x + 2, y + 34)], P['plat_d'], 2))
sand_top = [(0, 1792), (180, 1795)] + plat_bot[1:] + [(1560, 1740), (W, 1765)]
g.append(poly(sand_top + [(W, H), (0, H)], 'url(#sand)', INK, 3))
for _ in range(170):   # footprint ripples in the sand (generated crescents), denser and larger toward the camera
    y = R.uniform(1960, H - 10); s = (y - 1700) / 850; x = R.uniform(-20, W + 20); L = R.uniform(40, 110) * s; c = R.uniform(.25, .55) * L
    a = (x - L / 2, y); b = (x + L / 2, y + R.uniform(-8, 8) * s); m = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - c)
    q = [lerp(lerp(a, m, t / 6), lerp(m, b, t / 6), t / 6) for t in range(7)]
    g.append(line(q, P['ripple'], max(2, 4 * s), 'opacity=".55"'))
    g.append(line([(px, py - 4 * s) for px, py in q[1:-1]], P['ripple_hi'], max(1.5, 2.5 * s), 'opacity=".45"'))

# ---------------- lanterns ----------------
def bag(cx, b, w, h, near):
    """a paper-bag lantern: glow on the sand, a crumpled top, cream body lit from inside"""
    out = [ell(cx, b - h * .05, w * 1.7 + 8, (w * 1.7 + 8) * .38, 'url(#glow)')]
    n = 5; top = [(cx + w * .47 - (k / n) * w * .94, b - h + R.uniform(-.06, .06) * h * (1 if 0 < k < n else .3)) for k in range(n + 1)]
    body = [(cx - w * .5, b), (cx + w * .5, b)] + top
    if near:
        out.append(poly(body, 'url(#bag)', INK, 2.5 if w > 60 else 2))
        out.append(line([(cx + w * .18, b - h * .92), (cx + w * .22, b - h * .45), (cx + w * .16, b - 4)], P['bag_edge'], 2.5, 'opacity=".8"'))
        out.append(line(top[1:-1], P['bag_edge'], 2))
        if w > 50: out.append(ell(cx, b - h * .3, w * .28, h * .2, '#FFFFFF', 'opacity=".7"'))
    else:
        out.append(poly(body, P['bag_far'], '#C77A40', 1.2))
    return out
# hand-placed lanterns read off the grid: (centre x, bottom y, width, height)
near = [(315, 2535, 178, 360), (1397, 2400, 136, 262), (487, 2190, 76, 165), (1424, 2148, 84, 146), (38, 2088, 100, 124),
        (230, 2020, 74, 104), (1146, 2048, 62, 102), (697, 2072, 62, 118), (631, 1986, 50, 76), (389, 1964, 44, 66),
        (1504, 2008, 46, 88), (688, 1940, 38, 56), (424, 1926, 36, 52), (1116, 1955, 36, 64), (1374, 1936, 40, 64),
        (1310, 1889, 36, 49), (1032, 1915, 34, 60), (910, 1888, 32, 46), (742, 1902, 36, 52), (281, 1900, 32, 42),
        (320, 1886, 30, 40), (88, 1899, 34, 50), (44, 1942, 44, 62), (1270, 1864, 20, 46), (1199, 1837, 28, 40),
        (1024, 1846, 30, 52), (1437, 1819, 30, 46), (1465, 1846, 26, 46), (184, 1877, 22, 28), (513, 1866, 26, 28),
        (318, 1883, 30, 38), (730, 1876, 26, 44), (810, 1841, 18, 34), (852, 1824, 22, 30), (491, 1850, 26, 26)]
far = []
for r, (y0, s, step) in enumerate([(1722, .044, 58), (1774, .03, 46), (1796, .02, 50), (1816, .012, 56), (1836, .004, 64), (1860, 0, 76)]):
    x = R.uniform(0, step)
    while x < 1540:
        y = y0 - s * (x - 858) + R.uniform(-4, 4) if r else edge_y(plat_top, x) + 2
        lo = 300 if r == 0 else (190 if r == 1 else 0)
        if x > lo and all(abs(x - a) > c * .7 + 10 or abs(y - b) > 30 for a, b, c, d in near):
            h = 11 + (y - 1700) * .2; far.append((x, y, h * .7, h))
        x += step * R.uniform(.7, 1.3)
for cx, b, w, h in sorted(far + near, key=lambda t: t[1]):
    g += bag(cx, b, w, h, w > 30)

g.append('</svg>')
open(sys.argv[1], 'w').write('\n'.join(g)); print('ok', len(g), 'elements')
