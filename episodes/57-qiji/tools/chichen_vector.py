"""ep57 奇琴伊察 (clean_chichen.jpg, 1932x2576): El Castillo drawn in code (our lines, our palette), laid over the
photo's layout so the shutter cut drawing → photo lines up. Repeated details are generated: the 9 stepped terraces
and their panels, the stair treads, canopy leaves, horizon trees, agave rosettes, field pebbles and the
snake-plant blades in the foreground (each from a hand-read tip / base / width).
usage: chichen_vector.py out.svg"""
import sys, math, random
W, H = 1932, 2576
R = random.Random(57)
INK = '#2A211B'
P = dict(sky0='#74B6D8', sky1='#8CC7E3', sky2='#D3F1F2', cloud='#EEF8FB', cloud_e='#A9D2E6',
         face_lit='#929A97', face_mid='#6D8488', face_sh='#516A6F', rface='#5A7479', rface_far='#6A858A', corner_sh='#3C5459',
         ledge='#B9BDB4', panel='#5F7276', stairs='#B0A698', stairs_sh='#8F877C', tread='#7A7268', bal='#CFC6B6', bal_sh='#9C978C',
         rstairs='#7F9AA0', rstair_ln='#5A757B', rbal='#34494D',
         t_wall='#B3A796', t_wall_r='#9C927F', t_frieze='#9A968C', t_frieze_r='#857F72', t_corn='#6C7573', t_corn_top='#8C9490', door='#2A2622',
         tree_far='#3F6553', tree_far_d='#2B4D40', tree_dk='#174A43', field0='#DDB47F', field1='#C9996C', field2='#B07E5A', pebble='#8E6A50', pebble_l='#E2C3A0',
         stone='#A8957F', agave='#5C6B3F', agave_d='#3D4A2C', agave_r='#7A4038', shrub='#B9B275', shrub_d='#8E8A55', stalk='#6B5A45',
         can_d='#3A4128', can_m='#5C6537', can_l='#8F9150', can_y='#B5A85E', branch='#3A3128',
         lf_back='#163220', lf_dark='#2B4A28', lf_mid='#516E36', lf_lit='#93A55A', lf_pale='#A3A784', lf_band='#213A1D', lf_rib='#1A2F17')

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
def seg_y(a, b, x): return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0] or 1)

g = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">',
     '<defs>'
     f'<linearGradient id="sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="2576"><stop offset="0" stop-color="{P["sky0"]}"/><stop offset=".42" stop-color="{P["sky1"]}"/><stop offset=".58" stop-color="#A3D6EC"/><stop offset=".64" stop-color="{P["sky2"]}"/></linearGradient>'
     f'<linearGradient id="lface" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="{P["face_lit"]}"/><stop offset=".55" stop-color="{P["face_mid"]}"/><stop offset="1" stop-color="{P["face_sh"]}"/></linearGradient>'
     f'<linearGradient id="rface" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="{P["rface"]}"/><stop offset="1" stop-color="{P["rface_far"]}"/></linearGradient>'
     f'<linearGradient id="field" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{P["field0"]}"/><stop offset=".3" stop-color="{P["field1"]}"/><stop offset="1" stop-color="{P["field2"]}"/></linearGradient>'
     '<linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0A1F14" stop-opacity="0"/><stop offset=".45" stop-color="#0A1F14" stop-opacity=".45"/><stop offset="1" stop-color="#0A1F14" stop-opacity=".82"/></linearGradient>'
     '</defs>',
     f'<rect width="{W}" height="{H}" fill="url(#sky)"/>']

# ---------------- sky: a few soft clouds (generated bumps along a baseline) ----------------
def cloud(x0, x1, y, h):
    """a soft cloud: a row of round puffs (tallest in the middle) merged into one scalloped top over a flat base"""
    cs = []; x = x0 + h * .4
    while x < x1 - h * .4:
        r = h * (.45 + .55 * math.sin(math.pi * (x - x0) / (x1 - x0))) * R.uniform(.8, 1.1); cs.append((x, y - r * .55, r)); x += r * R.uniform(.7, 1.1)
    top = []
    for xi in range(int(x0), int(x1) + 1, 5):
        ys = [cy - math.sqrt(r * r - (xi - cx) ** 2) for cx, cy, r in cs if abs(xi - cx) < r]
        top.append((xi, min(min(ys), y) if ys else y))
    return poly(top + [(x1, y), (x0, y)], P['cloud'], P['cloud_e'], 2, 'opacity=".9"')
for c in [(110, 470, 1175, 52), (0, 130, 575, 40), (95, 250, 868, 30), (165, 280, 940, 24), (0, 115, 1005, 26),
          (1580, 1720, 1150, 14), (1730, 1880, 1130, 16), (380, 520, 1240, 16)]:
    g.append(cloud(*c))

# ---------------- horizon: background trees (generated scalloped crowns) ----------------
def crowns(x0, x1, ybase, ytop, col, edge, rmin=22, rmax=40):
    """a tree line: a row of round crowns along ytop(x), merged into one scalloped outline"""
    cs = []; x = x0 - rmax
    while x < x1 + rmax:
        r = R.uniform(rmin, rmax); cs.append((x, ytop(x) + r, r)); x += r * R.uniform(.9, 1.4)
    top = []
    for xi in range(int(x0), int(x1) + 1, 6):
        ys = [cy - math.sqrt(r * r - (xi - cx) ** 2) for cx, cy, r in cs if abs(xi - cx) < r]
        top.append((xi, min(ys) if ys else ybase))
    return poly([(x0, ybase)] + top + [(x1, ybase)], col, edge, 2.5)
g.append(crowns(0, 330, 1612, lambda x: 1445 + (x - 120) ** 2 / 650 + 10 * math.sin(x / 40), P['tree_far'], P['tree_far_d']))
g.append(crowns(1380, 1932, 1600, lambda x: 1490 - (x - 1380) * .12, P['tree_far'], P['tree_far_d'], 18, 30))
g.append(crowns(1760, 1932, 1598, lambda x: 1350 + max(0, 1830 - x) * 1.4 + 8 * math.sin(x / 25), P['tree_dk'], INK, 20, 34))
for _ in range(14):   # a few lit leaf masses inside the tree lines
    x = R.choice([R.uniform(20, 240), R.uniform(1420, 1740)]); y = R.uniform(1500, 1575)
    g.append(f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="{R.uniform(14, 24):.0f}" ry="{R.uniform(8, 13):.0f}" fill="{R.choice([P["tree_far_d"], "#5E806A"])}" opacity=".8"/>')

# ---------------- the field (behind the pyramid base) ----------------
g.append(poly([(0, 1590), (1932, 1572), (1932, H), (0, H)], 'url(#field)', 'none', 0))

# ---------------- El Castillo ----------------
# terrace corners read off the photo, k = 0 (ground) … 9 (top platform)
Ltop = [(125, 1603), (138, 1553), (213, 1500), (283, 1443), (353, 1387), (420, 1332), (490, 1275), (557, 1218), (625, 1162), (686, 1105)]
F = [(1112, 1569), (1097, 1497), (1071, 1432), (1038, 1364), (1015, 1303), (1003, 1249), (997, 1200), (993, 1150), (988, 1100), (980, 1052)]
Rtop = [(1700, 1575), (1650, 1522), (1600, 1470), (1552, 1420), (1490, 1368), (1422, 1316), (1372, 1266), (1313, 1211), (1247, 1157), (1179, 1105)]
def lb(k):   # foot of terrace k's sloping wall at the left corner
    return (Ltop[k][0] - .25 * (Ltop[k][0] - Ltop[k - 1][0]), Ltop[k - 1][1] - 5) if k > 1 else (124, 1603)
def rb(k):
    return (Rtop[k][0] + .3 * (Rtop[k - 1][0] - Rtop[k][0]), Rtop[k - 1][1] - 6) if k > 1 else (1712, 1575)
# temple on top (drawn first: the platform edge hides its foot)
TL, TC, TR = 760, 973, 1129     # left end, front corner, right end
def tl(y_left, y_corner): return [(TL, y_left), (TC, y_corner)]
def tr(y_corner, y_right): return [(TC, y_corner), (TR, y_right)]
g.append(poly([(TL, 1000), (TC, 962), (TC, 1060), (TL, 1095)], P['t_wall'], INK, 3))                    # left face
g.append(poly([(TC, 962), (TR, 1000), (TR, 1095), (TC, 1060)], P['t_wall_r'], INK, 3))                  # right face
g.append(poly([(TL, 1000), (TC, 962), (TC, 1000), (TL, 1028)], P['t_frieze'], INK, 2))                  # frieze
g.append(poly([(TC, 962), (TR, 1000), (TR, 1033), (TC, 1000)], P['t_frieze_r'], INK, 2))
g.append(poly([(TL - 4, 1028), (TC, 998), (TC, 1011), (TL - 4, 1044)], P['t_corn'], INK, 2))           # middle moulding
g.append(poly([(TC, 998), (TR + 4, 1033), (TR + 4, 1046), (TC, 1011)], P['t_corn'], INK, 2))
g.append(poly([(TL - 3, 985), (963, 933), (TR + 3, 983), (TR + 3, 1000), (970, 962), (TL - 3, 1001)], P['t_corn'], INK, 3))   # roof slab
g.append(line([(TL + 2, 991), (963, 940), (TR - 2, 989)], P['t_corn_top'], 4))
for i in range(1, 7):   # frieze blocks (generated along the faces)
    x = TL + (TC - TL) * i / 7; g.append(line([(x, seg_y((TL, 1001), (TC, 962), x) + 3), (x, seg_y((TL, 1028), (TC, 998), x) - 2)], '#7E7B72', 1.5))
    x = TC + (TR - TC) * i / 7; g.append(line([(x, seg_y((TC, 962), (TR, 1000), x) + 3), (x, seg_y((TC, 998), (TR, 1033), x) - 2)], '#6E695E', 1.5))
for x0, x1, ytop in [(829, 845, 1047), (859, 890, 1038), (905, 924, 1028), (1043, 1063, 1040)]:   # doorways
    g.append(poly([(x0, ytop + (x0 - x1) * .0), (x1, ytop - (x1 - x0) * (.14 if x0 < TC else -.24)), (x1, 1100), (x0, 1100)], P['door'], INK, 2))
for x in (850, 897):   # serpent-column pillars between the doors
    g.append(poly([(x - 6, 1040), (x + 6, 1036), (x + 6, 1100), (x - 6, 1100)], '#A69A88', INK, 2))

# left face: stepped silhouette on the left, front corner on the right
sil_L = []
for k in range(1, 10): sil_L += [lb(k), Ltop[k]]
lface = sil_L + [(TL, 1094), F[9]] + F[::-1][1:] + [(1112, 1572), (124, 1606)]
g.append(poly(lface, 'url(#lface)', INK, 3))
# right face: front corner up, platform edge, stepped silhouette down the right
sil_R = []
for k in range(9, 0, -1): sil_R += [Rtop[k], rb(k)]
rface = F + [(TR, 1092)] + sil_R + [(1712, 1578), (1112, 1572)]
g.append(poly(rface, 'url(#rface)', INK, 3))
# terraces (generated): ledge line + lit cornice + panel moulding + panel joints on both faces, shade wedge at the corner
for k in range(1, 10):
    a, f = Ltop[k], F[k]; b0, f0 = lb(k), F[k - 1]
    h = a[1] - b0[1]
    def lp(t, d):   # point on the left face of terrace k: t along (0 = left corner, 1 = front corner), d down from its top
        top = lerp(a, f, t); bot = lerp(b0, f0, t); return lerp(top, bot, d)
    g.append(poly([lp(0, 0), lp(1, 0), lp(1, .16), lp(0, .16)], P['ledge'], 'none', 0, 'opacity=".55"'))
    g.append(line([lp(0, .42), lp(1, .42)], P['panel'], 2, 'opacity=".8"'))
    for j in range(1, 7):   # panel joints, crowding toward the far (left) corner
        t = (j / 7) ** 1.15; g.append(line([lp(t, .16), lp(t, .42)], P['panel'], 2, 'opacity=".55"'))
    g.append(line([b0, f0], INK, 2.5))   # foot of the terrace
    # right face of terrace k
    r, r0 = Rtop[k], rb(k)
    def rp(t, d): return lerp(lerp(f, r, t), lerp(f0, r0, t), d)
    g.append(poly([rp(0, 0), rp(1, 0), rp(1, .16), rp(0, .16)], P['ledge'], 'none', 0, 'opacity=".35"'))
    g.append(line([rp(0, .42), rp(1, .42)], P['corner_sh'], 2, 'opacity=".7"'))
    for j in range(1, 4):
        t = (j / 4) ** .85; g.append(line([rp(t, .16), rp(t, .42)], P['corner_sh'], 2, 'opacity=".5"'))
    g.append(poly([f, rp(.17, 0), rp(.12, 1), f0], P['corner_sh'], 'none', 0, 'opacity=".75"'))   # shaded wedge right of the corner
    g.append(line([f0, r0], INK, 2.5))
g.append(line(F, INK, 3))   # the front corner
g.append(poly([(588, 1585), (590, 1545), (603, 1536), (616, 1545), (617, 1582)], P['door'], INK, 2))   # tunnel door at the foot

# main staircase on the lit face: two balustrades running up the middle
LBo = [(742, 1093), (650, 1200), (562, 1300), (532, 1334), (394, 1500), (357, 1550), (340, 1597)]   # left balustrade, outer edge
RBi = [(885, 1066), (790, 1188), (690, 1300), (600, 1420), (555, 1490), (523, 1550), (503, 1597)]   # right balustrade, inner edge
bw = lambda y: 20 + (y - 1066) / 530 * 10   # balustrade width grows toward the viewer
LBi = [(x + bw(y), y) for x, y in LBo]; RBo = [(x + bw(y), y) for x, y in RBi]
g.append(poly(LBi + RBi[::-1], P['stairs'], INK, 3))
y = 1597; n = 0
while y > 1078:   # treads (generated): every second step of the 91, closer together toward the top
    xa, xb = edge_x(LBi, y), edge_x(RBi, y); tilt = (xb - xa) * .03
    g.append(line([(xa, y), (xb, y - tilt)], P['tread'], 2.2 if n % 2 else 1.6))
    if n % 3 == 0: g.append(poly([(xa, y), (xb, y - tilt), (xb, y - tilt - 4), (xa, y - 4)], P['stairs_sh'], 'none', 0, 'opacity=".45"'))
    y -= 11.6 - (1597 - y) / 520 * 2.2; n += 1
for o, i, shade in [(LBo, LBi, P['bal']), (RBi, RBo, P['bal'])]:
    g.append(poly(o + i[::-1], shade, INK, 3))
    g.append(line([(x + 5, y) for x, y in o], '#E4DCCB', 3))
g.append(poly(RBo + [(RBo[-1][0] + 26, RBo[-1][1]), (RBo[0][0] + 22, RBo[0][1] + 8)][::-1], P['corner_sh'], 'none', 0, 'opacity=".35"'))  # balustrade shadow

# the second staircase, seen edge-on down the shaded right face
D = [(1041, 1062), (1160, 1156), (1272, 1250), (1372, 1312), (1430, 1345), rb(4)]
up = [Rtop[4]]
for k in range(5, 10): up += [rb(k), Rtop[k]]
rs = D + up + [(TR, 1092)]
g.append(poly(rs, P['rstairs'], INK, 3))
sil = [(TR, 1092)] + up[::-1]   # the stepped silhouette, top → bottom
for i in range(1, 30):   # its treads: short lines from the dark balustrade out to the silhouette
    y = D[0][1] + (D[-1][1] - D[0][1]) * i / 30; xa = edge_x(D, y); xb = edge_x(sil, y) - 3
    if xb > xa + 6: g.append(line([(xa, y), (xb, y + (xb - xa) * .12)], P['rstair_ln'], 1.8))
g.append(line(D, P['rbal'], 10)); g.append(line(D, INK, 2.5))
g.append(poly(rs, 'none', INK, 3))

# ---------------- mid-ground: rock border, agave rosettes, feathery shrubs, flower stalks ----------------
g.append(poly([(0, 1700), (1932, 1690), (1932, 1790), (0, 1800)], '#9A6E4E', 'none', 0, 'opacity=".35"'))   # shade of the planting on the soil
for _ in range(32):   # sun-baked pebbles in the field
    x, y = R.uniform(0, W), R.uniform(1775, 2060)
    g.append(f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="{R.uniform(4, 11):.0f}" ry="{R.uniform(3, 6):.0f}" fill="{R.choice([P["pebble"], P["pebble_l"], "#A07A5C"])}" opacity=".85"/>')
x = 0
while x < W:   # the rock border along the planting
    r = R.uniform(11, 19); y = 1748 + R.uniform(-5, 5) - x * .006
    g.append(f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="{r:.0f}" ry="{r * .6:.0f}" fill="{R.choice([P["stone"], "#8C7B68", "#BCA68E"])}" stroke="{INK}" stroke-width="1.5"/>')
    x += r * 2.6
def rosette(cx, cy, rad, n, col, dark, spread=(-170, -10)):
    out = []
    for i in range(n):
        a = math.radians(spread[0] + (spread[1] - spread[0]) * (i + R.uniform(-.3, .3)) / (n - 1))
        L = rad * R.uniform(.6, 1.05) * (1.0 if -150 < math.degrees(a) < -30 else .75); w = rad * .09
        tip = (cx + math.cos(a) * L, cy + math.sin(a) * L); nx, ny = -math.sin(a), math.cos(a)
        out.append(poly([(cx + nx * w, cy + ny * w), tip, (cx - nx * w, cy - ny * w)], R.choice([col, col, dark]), INK, 1.5))
    return out
for cx, cy, rad, n, col in [(60, 1735, 95, 9, P['agave']), (200, 1740, 90, 9, P['agave']), (320, 1740, 85, 8, P['agave_d']), (480, 1735, 95, 9, P['agave']),
                            (660, 1745, 120, 10, P['agave']), (850, 1748, 130, 8, P['agave_r']), (1040, 1735, 120, 11, P['agave']), (1235, 1740, 110, 10, P['agave']),
                            (1560, 1735, 90, 8, P['agave']), (1720, 1745, 95, 8, P['agave_d']), (1870, 1740, 100, 9, P['agave'])]:
    g += rosette(cx, cy, rad, n, col, P['agave_d'])
def shrub(cx, cy, rx, ry, n):
    out = []
    for _ in range(n):
        a = R.uniform(0, 2 * math.pi); d = R.uniform(0, 1) ** .6; x, y = cx + math.cos(a) * rx * d, cy + math.sin(a) * ry * d
        out.append(f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="{R.uniform(9, 16):.0f}" ry="{R.uniform(5, 9):.0f}" transform="rotate({R.uniform(-40, 40):.0f} {x:.0f} {y:.0f})" fill="{R.choice([P["shrub"], P["shrub_d"], "#CFC98C"])}" stroke="{INK}" stroke-width="1"/>')
    return out
for cx, cy, rx, ry, n in [(365, 1590, 70, 55, 16), (950, 1580, 70, 35, 13), (1215, 1570, 50, 60, 13), (1640, 1615, 45, 30, 9)]:
    g.append(line([(cx, cy + ry + 30), (cx + R.uniform(-8, 8), cy)], P['stalk'], 4)); g += shrub(cx, cy, rx, ry, n)
def stalk(base, top, branches):
    out = [line([base, top], P['stalk'], 6)]
    for i in range(branches):   # little candelabra branches, each ending in a tuft
        t = .55 + .45 * i / max(1, branches - 1); p = lerp(base, top, t); s = -1 if i % 2 else 1; L = R.uniform(40, 80) * (1.1 - t * .5)
        q = (p[0] + s * L, p[1] - L * .55); out.append(line([p, q], P['stalk'], 3))
        for _ in range(2): out.append(f'<circle cx="{q[0] + R.uniform(-9, 9):.0f}" cy="{q[1] + R.uniform(-7, 4):.0f}" r="{R.uniform(5, 8):.0f}" fill="#8E8F62" stroke="{INK}" stroke-width="1"/>')
    return out
g += stalk((112, 1625), (98, 1248), 8)
g += stalk((404, 1625), (418, 1262), 7)
g.append(line([(1251, 1640), (1252, 1470)], P['stalk'], 4))

# ---------------- foreground: snake-plant blades (hand-read tip / base / width, shape generated) ----------------
def blade(tip, base, w, col, bend=0.0, bands=True, lit=True, rib=True):
    """a long pointed snake-plant blade from a hand-read tip, aimed through a hand-read lower point; it always runs
    on past the bottom of the frame, so no blade ends in a cut"""
    ux, uy = base[0] - tip[0], base[1] - tip[1]; s = (H + 40 - tip[1]) / uy if uy > 0 else 1
    base = (tip[0] + ux * max(1, s), tip[1] + uy * max(1, s))
    L = math.dist(tip, base); ux, uy = (tip[0] - base[0]) / L, (tip[1] - base[1]) / L; nx, ny = -uy, ux
    taper = min(.85, (2.4 * w + 70) / L)   # length of the pointed end, as a share of the blade
    def ax(t): return (base[0] + ux * L * t + nx * bend * math.sin(math.pi * t * .9), base[1] + uy * L * t + ny * bend * math.sin(math.pi * t * .9))
    def hw(t): return w / 2 * min(1.0, (1 - t) / taper) ** .8
    ts = [0, .25, .5] + [1 - taper * (1 - i / 9) for i in range(10)]
    ts = sorted(set(t for t in ts if 0 <= t <= 1))
    left = [(ax(t)[0] + nx * hw(t), ax(t)[1] + ny * hw(t)) for t in ts]; right = [(ax(t)[0] - nx * hw(t), ax(t)[1] - ny * hw(t)) for t in ts]
    out = [poly(left + right[::-1][1:], col, INK, 2.5)]
    side = left if left[len(left) // 2][0] < right[len(right) // 2][0] else right   # sun from the left: light the left edge
    if lit: out.append(line([(x + 5, y) for x, y in side][1:-2], P['lf_lit'], 4, 'opacity=".75"'))
    if bands:   # the snake-plant's dark cross-bands (generated zig-zags), only on the lit upper part
        seen = min(L, H + 40 - tip[1]); nb = int(seen / 120)
        for i in range(nb):
            t = 1 - (taper * .8) - (i + R.uniform(.2, .7)) * 120 / L
            if t < .05: break
            c = ax(t); h = hw(t) * .78
            out.append(line([(c[0] + nx * h, c[1] + ny * h), (c[0] + nx * h * .3 + ux * 10, c[1] + ny * h * .3 + uy * 10), (c[0] - nx * h * .3, c[1] - ny * h * .3), (c[0] - nx * h + ux * 9, c[1] - ny * h + uy * 9)], P['lf_band'], 6, 'opacity=".62"'))
    if rib: out.append(line([ax(t) for t in [i / 12 for i in range(12)] if ax(t)[1] < H + 20], P['lf_rib'], 2, 'opacity=".8"'))   # mid-rib
    return out
saw = []; x = -20
while x < W + 40:   # the dark heart of the clump: its top edge is a row of blade tips (generated sawtooth)
    w = R.uniform(40, 75); saw += [(x, 2190 + R.uniform(-15, 15)), (x + w / 2, 2080 + R.uniform(-40, 30))]; x += w
g.append(poly([(-20, H + 10)] + saw + [(x, 2190), (x, H + 10)], P['lf_back'], INK, 2))
for i in range(22):   # back row of dark blades filling the base of the clump (generated)
    x = -40 + (W + 80) * (i + R.uniform(.1, .9)) / 22; tipy = R.uniform(1930, 2120)
    g += blade((x + R.uniform(-50, 50), tipy), (x + R.uniform(-30, 30), H), R.uniform(80, 130), R.choice([P['lf_back'], P['lf_dark']]), R.uniform(-20, 20), bands=False, lit=False, rib=False)
# (tip, base, width, colour, bend) — back to front
B = [((701, 1504), (590, 1930), 30, 'lf_dark', -10), ((824, 1533), (720, 2150), 34, 'lf_dark', -15), ((1180, 1775), (1165, 2100), 26, 'lf_pale', 0),
     ((1316, 1622), (1320, 2150), 62, 'lf_dark', 0), ((395, 1710), (380, 2080), 42, 'lf_mid', 0), ((354, 1816), (330, 2120), 40, 'lf_dark', 0),
     ((166, 1874), (160, 2060), 30, 'lf_pale', 0), ((925, 1792), (840, 2250), 40, 'lf_mid', -10), ((1092, 1869), (1080, 2250), 42, 'lf_mid', 0),
     ((160, 1639), (110, 2250), 64, 'lf_mid', 8), ((42, 1863), (10, 2350), 80, 'lf_dark', 0), ((89, 1880), (80, 2350), 60, 'lf_mid', 0),
     ((219, 1892), (220, 2200), 44, 'lf_dark', 0), ((619, 1763), (590, 2350), 80, 'lf_mid', 0), ((678, 1851), (650, 2400), 80, 'lf_dark', 0),
     ((736, 1804), (720, 2450), 82, 'lf_mid', 0), ((824, 1818), (790, 2450), 90, 'lf_mid', -10), ((1022, 1775), (1010, 2350), 92, 'lf_mid', 0),
     ((507, 1486), (430, 2400), 92, 'lf_mid', -15), ((578, 1551), (555, 2400), 92, 'lf_mid', 10), ((266, 1663), (260, 2450), 135, 'lf_mid', 0),
     ((1281, 1734), (1240, 2450), 92, 'lf_mid', 10), ((1474, 1951), (1480, 2450), 80, 'lf_dark', 0), ((1539, 1975), (1560, 2450), 72, 'lf_mid', 0),
     ((1592, 1845), (1620, 2450), 82, 'lf_mid', 0), ((1651, 1669), (1680, 2576), 110, 'lf_mid', -10), ((1757, 2006), (1780, 2576), 100, 'lf_dark', 0),
     ((1385, 1335), (1400, 2500), 108, 'lf_mid', 0), ((101, 1951), (10, 2220), 36, 'lf_pale', 0), ((525, 1828), (0, 2520), 105, 'lf_lit', 30),
     ((1145, 1951), (1150, 2650), 130, 'lf_mid', 0), ((1830, 2070), (1890, 2650), 150, 'lf_mid', 0), ((248, 2292), (250, 2650), 115, 'lf_dark', 0),
     ((1510, 2222), (1440, 2700), 250, 'lf_mid', 0), ((466, 2445), (240, 2530), 26, 'lf_pale', 0)]
for tip, base, w, col, bend in B:
    g += blade(tip, base, w, P[col], bend)
g.append(f'<rect x="0" y="2010" width="{W}" height="{H - 2010}" fill="url(#shade)"/>')   # the clump darkens toward its base

# ---------------- canopy: leaf clusters in the top corners (generated) ----------------
def twig(path, w): return line(path, P['branch'], w)
for p, w in [([(0, 40), (80, 90), (170, 160), (260, 230), (330, 260)], 9), ([(80, 90), (140, 60), (230, 30), (330, 10)], 5), ([(170, 160), (150, 250), (180, 340)], 5),
             ([(0, 230), (60, 260), (110, 330)], 5), ([(260, 230), (360, 190), (430, 200)], 4), ([(0, 470), (40, 520), (70, 600), (90, 700)], 6),
             ([(1932, 120), (1800, 140), (1650, 170), (1500, 200), (1350, 230), (1230, 260)], 10), ([(1500, 200), (1450, 300), (1420, 380)], 5),
             ([(1350, 230), (1250, 320), (1220, 430)], 5), ([(1650, 170), (1700, 270), (1760, 330)], 5), ([(1230, 260), (1100, 160), (990, 60)], 5),
             ([(1932, 260), (1840, 250), (1760, 300)], 5), ([(1400, 0), (1380, 100), (1350, 230)], 6)]:
    g.append(twig(p, w))
def leaf(x, y, ang, L, col, sw=1.5):
    ca, sa = math.cos(ang), math.sin(ang); wd = L * .4
    return poly([(x, y), (x + ca * L * .5 - sa * wd / 2, y + sa * L * .5 + ca * wd / 2), (x + ca * L, y + sa * L), (x + ca * L * .5 + sa * wd / 2, y + sa * L * .5 - ca * wd / 2)], col, INK, sw)
def inside(p, q):
    x, y = p; c = False
    for (x1, y1), (x2, y2) in zip(q, q[1:] + q[:1]):
        if (y1 > y) != (y2 > y) and x < x1 + (x2 - x1) * (y - y1) / (y2 - y1): c = not c
    return c
def spray(x, y, ang, L, col, n=5, sw=1.5):
    """one polygon carrying a fan of n pointed leaves (generated lobes) growing from (x, y) toward ang"""
    q = [(x, y)]
    for i in range(n):
        a = ang + (i - (n - 1) / 2) * .42 + R.uniform(-.12, .12); l = L * R.uniform(.75, 1.05); w = .17
        for rr, da in [(.32, -w * .5), (.62, -w), (1, 0), (.62, w), (.32, w * .5)]:
            q.append((x + math.cos(a + da) * l * rr, y + math.sin(a + da) * l * rr))
    return poly(q, col, INK, sw)
def canopy(outline, holes, n_in, lit, base=P['can_d'], sun=()):
    """a tree mass from a hand-traced outline: fill, sky holes, leaf sprays generated along every edge (fanning out
    of the mass) and sunlit sprays scattered inside"""
    out = [poly(outline, base, INK, 2.5)] + [poly(q, P['can_l'], 'none', 0, 'opacity=".7"') for q in sun]   # sunlit patches
    for h in holes: out.append(poly(h, 'url(#sky)', INK, 2))
    xs = [p[0] for p in outline]; ys = [p[1] for p in outline]; k = 0
    while k < n_in:
        x, y = R.uniform(min(xs), max(xs)), R.uniform(min(ys), max(ys))
        if not inside((x, y), outline) or any(inside((x, y), h) for h in holes): continue
        out.append(spray(x, y, R.uniform(0, 2 * math.pi), R.uniform(52, 76), R.choice([P['can_l'], P['can_y']]) if lit(x, y) else R.choice([P['can_m'], P['can_d']]), R.randint(3, 5), 1.3)); k += 1
    for path, sgn, step in [(outline + outline[:1], 1, 58)] + [(h + h[:1], -1, 50) for h in holes]:
        L = sum(math.dist(a, b) for a, b in zip(path, path[1:]))
        for (x, y), (tx, ty) in along(path, max(3, int(L / step))):
            nx, ny = ty * sgn, -tx * sgn   # outward normal for a clockwise outline
            if (x <= 2 or x >= W - 2 or y <= 2) and sgn > 0: continue
            out.append(spray(x - nx * 16, y - ny * 16, math.atan2(ny, nx) + R.uniform(-.3, .3), R.uniform(50, 66), R.choice([P['can_l'], P['can_y']]) if lit(x, y) else R.choice([P['can_m'], P['can_d'], P['can_l']])))
    return out
for p, w in [([(0, 70), (60, 95), (130, 140), (200, 200), (260, 250)], 8), ([(300, 0), (330, 40), (380, 70), (440, 100), (520, 60)], 3), ([(330, 40), (420, 20), (480, 0)], 2),
             ([(1932, 120), (1800, 140), (1650, 170), (1500, 200), (1350, 230), (1250, 260)], 9), ([(1000, 110), (1100, 80), (1200, 110), (1300, 160), (1380, 220)], 7),
             ([(1480, 310), (1530, 360), (1560, 420), (1570, 520)], 3), ([(1530, 360), (1470, 420), (1440, 500)], 2), ([(1560, 420), (1600, 480), (1620, 530)], 2)]:
    g.append(line(p, P['branch'], w))   # bare branches reaching out of the masses
TLo = [(0, 0), (289, 0), (282, 40), (278, 78), (301, 125), (372, 136), (407, 148), (431, 207), (419, 266), (395, 301), (348, 336), (313, 372),
       (266, 407), (195, 419), (136, 407), (78, 325), (42, 278), (19, 231), (0, 184)]
g += canopy(TLo, [[(70, 88), (120, 78), (160, 100), (178, 140), (168, 200), (128, 236), (82, 218), (60, 160)], [(228, 300), (285, 296), (292, 345), (262, 365), (232, 352)]],
            26, lambda x, y: (x * 7 + y * 3) % 10 < 4, P['can_m'], [[(150, 120), (260, 140), (330, 190), (380, 240), (330, 300), (250, 330), (180, 300), (150, 220)]])
LEo = [(0, 390), (40, 398), (46, 470), (40, 540), (0, 556), (0, 590), (60, 596), (125, 619), (184, 601), (172, 654), (125, 713), (148, 748), (101, 795),
       (113, 842), (101, 913), (54, 960), (19, 1007), (0, 1010)]
g += canopy(LEo, [], 6, lambda x, y: False, '#3F5A3A')
TRo = [(955, 0), (957, 18), (951, 140), (996, 162), (1018, 207), (1051, 262), (1073, 284), (1090, 351), (1090, 440), (1129, 473), (1184, 496), (1251, 496),
       (1296, 440), (1373, 407), (1451, 362), (1473, 296), (1518, 318), (1573, 373), (1584, 440), (1618, 473), (1651, 440), (1673, 373), (1718, 318), (1762, 284),
       (1807, 262), (1851, 251), (1896, 251), (1932, 229), (1932, 0)]
g += canopy(TRo, [[(1105, 155), (1190, 150), (1200, 235), (1120, 245)], [(1222, 222), (1290, 215), (1300, 280), (1235, 288)], [(1340, 290), (1420, 280), (1410, 350), (1350, 360)],
                  [(1010, 40), (1070, 30), (1085, 90), (1020, 100)]],
            68, lambda x, y: x > 1430 and y < 330 or (x + y) % 3 == 0, P['can_m'],
            [[(1560, 60), (1700, 40), (1850, 70), (1920, 150), (1890, 240), (1800, 250), (1700, 300), (1620, 330), (1560, 280), (1520, 180)],
             [(1000, 60), (1100, 40), (1220, 80), (1260, 160), (1200, 220), (1100, 200), (1030, 150)],
             [(1110, 300), (1200, 280), (1290, 330), (1280, 420), (1200, 470), (1130, 440)], [(1580, 330), (1650, 320), (1670, 400), (1620, 450), (1585, 410)]])
g.append('</svg>')
open(sys.argv[1], 'w').write('\n'.join(g)); print('ok', len(g), 'elements')
