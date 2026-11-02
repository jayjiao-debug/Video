"""ep57 泰姬陵 (taj.jpg, 2576x1711): the scene drawn in code (our lines, our palette), laid over the photo's
layout so the shutter cut drawing → photo lines up. Hazy dawn: light from the right, lavender shade on the
left. Repeated details are generated (arch rows, minaret balcony rings and courses, drum frieze, lotus petals,
tree scallops, the crowd's heads and shoulders). The waving character is composited later, not drawn here.
usage: taj_vector.py out.svg"""
import sys, math, random
W, H = 2576, 1711
R = random.Random(57)
INK = '#2A211B'
CX = 1292.5   # the monument's axis: the right half mirrors the left
P = dict(sky0='#97A1BB', sky1='#A29FB3', sky2='#B9A6A8',
         shade='#7D7889', mid='#AE978C', lit='#D7B391', hi='#E6C7A4', recess='#8C7C80', deep='#776A75', band='#9A8582',
         chamL='#837B88', chamR='#D2AC8C', face='#B39A8D', frame='#8A7672', open='#5F5662',
         fshade='#857D8A', fmid='#9E8B88', flit='#BC9F92',
         plinth='#A6999C', plinth_top='#C2B2AE',
         tree='#4C5365', tree_lo='#3F4555', tree_hi='#5E6578',
         door='#1A1217', door_in='#0D090C', door_rim='#3A2D34',
         crowd=['#211A1E', '#1B1418', '#161013'], rim='#76626B', mass='#1A1317')

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
# --- helpers for this scene ---
def mx(x): return 2 * CX - x
def mirror(p): return [(mx(x), y) for x, y in p][::-1]
def curve(p, closed=True):
    """smooth path through the chosen points (Catmull-Rom → cubic Bézier)"""
    n = len(p); d = f'M{p[0][0]:.0f},{p[0][1]:.0f}'
    for i in range(n if closed else n - 1):
        p1, p2 = p[i], p[(i + 1) % n]
        if closed: p0, p3 = p[(i - 1) % n], p[(i + 2) % n]
        else: p0, p3 = p[max(i - 1, 0)], p[min(i + 2, n - 1)]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6); c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f' C{c1[0]:.0f},{c1[1]:.0f} {c2[0]:.0f},{c2[1]:.0f} {p2[0]:.0f},{p2[1]:.0f}'
    return d + (' Z' if closed else '')
def path(d, fill, stroke=INK, sw=3, extra=''): return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round" {extra}/>'
def marks(segs, stroke, sw, extra=''):
    """many short strokes as one path element"""
    return path(' '.join(f'M{a[0]:.0f},{a[1]:.0f} L{b[0]:.0f},{b[1]:.0f}' for a, b in segs), 'none', stroke, sw, extra)
def dome_side(cx, base, top, hwb, hwm, ym, k=1.0):
    """right half of a bulbous dome, base → top (k scales the half-widths, for the lit crescent)"""
    h = ym - top
    return [(cx + hwb * k, base), (cx + hwm * k, ym), (cx + hwm * .9 * k, ym - h * .45), (cx + hwm * .55 * k, top + h * .12), (cx, top)]
def dome(cx, base, top, hwb, hwm, ym, fill, lit, shade, sw=2.5):
    r = dome_side(cx, base, top, hwb, hwm, ym); sl = [(2 * cx - x, y) for x, y in r]   # both halves, base → top
    outline = curve(sl + r[::-1][1:], False) + ' Z'
    out = [path(outline, fill, 'none', 0)]
    out.append(path(curve(r, False) + ' ' + curve(dome_side(cx, base, top, hwb, hwm, ym, .3)[::-1], False).replace('M', 'L', 1) + ' Z', lit, 'none', 0))
    out.append(path(curve(sl, False) + ' ' + curve([(2 * cx - x, y) for x, y in dome_side(cx, base, top, hwb, hwm, ym, .62)][::-1], False).replace('M', 'L', 1) + ' Z', shade, 'none', 0))
    out.append(path(outline, 'none', INK, sw))
    return out
def arch(x0, x1, spring, apex, bottom):
    """pointed (Mughal) arch outline: up the left jamb, two curves to the apex, down the right jamb"""
    c = (x0 + x1) / 2; w = (x1 - x0) / 2
    return [(x0, bottom), (x0, spring), (x0 + w * .08, spring - (spring - apex) * .45), (x0 + w * .35, apex + (spring - apex) * .14), (c, apex),
            (x1 - w * .35, apex + (spring - apex) * .14), (x1 - w * .08, spring - (spring - apex) * .45), (x1, spring), (x1, bottom)]
def arch_d(x0, x1, spring, apex, bottom):
    a = arch(x0, x1, spring, apex, bottom)
    return f'M{x0:.0f},{bottom:.0f} L{x0:.0f},{spring:.0f} ' + curve(a[1:-1], False).split(' ', 1)[1] + f' L{x1:.0f},{bottom:.0f} Z'

g = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">',
     f'<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{P["sky0"]}"/><stop offset=".55" stop-color="{P["sky1"]}"/><stop offset="1" stop-color="{P["sky2"]}"/></linearGradient>'
     '<linearGradient id="dome" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7A7A8E"/><stop offset=".38" stop-color="#A08E8C"/><stop offset=".64" stop-color="#C9A88F"/><stop offset=".92" stop-color="#E0BA96"/><stop offset="1" stop-color="#D6B091"/></linearGradient>'
     '<linearGradient id="drum" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8A8290"/><stop offset=".5" stop-color="#A9938C"/><stop offset="1" stop-color="#C7A68F"/></linearGradient></defs>',
     f'<rect width="{W}" height="{H}" fill="url(#sky)"/>']

# ---------------- minarets (far pair first, near pair later) ----------------
def minaret(m, far=False):
    sh, md, lt = (P['fshade'], P['fmid'], P['flit']) if far else (P['shade'], P['mid'], P['lit'])
    sw = 2 if far else 2.5; out = []
    cx, ftop, dtop = m['fin']; base, top, hwb, hwm, ym = m['dome']
    sl, sr = m['shaft_l'], m['shaft_r']; y0, y1 = sl[0][1], sl[-1][1]
    # shaft: mid fill, shade strip on the left, lit strip on the right, stone courses, outline
    out.append(poly([sl[0], sr[0], sr[-1], sl[-1]], md, 'none', 0))
    out.append(poly([sl[0], lerp(sl[0], sr[0], .28), lerp(sl[-1], sr[-1], .28), sl[-1]], sh, 'none', 0))
    out.append(poly([lerp(sl[0], sr[0], .6), sr[0], sr[-1], lerp(sl[-1], sr[-1], .6)], lt, 'none', 0))
    step = 15 if far else 17; courses = []; joints = []
    for i, y in enumerate(range(int(y0) + step, int(y1), step)):
        xl, xr = edge_x(sl, y), edge_x(sr, y); courses.append(((xl, y), (xr, y)))
        for k in range(3):   # staggered vertical joints, bunched toward the edges (it is round)
            t = .5 + .5 * math.sin(math.radians(-60 + k * 60 + (30 if i % 2 else 0)))
            if .04 < t < .96: x = xl + (xr - xl) * t; joints.append(((x, y), (x, y + step)))
    out.append(marks(courses, '#7F6F72', 1.5, 'opacity=".45"')); out.append(marks(joints, '#7F6F72', 1.2, 'opacity=".35"'))
    out.append(poly([sl[0], sr[0], sr[-1], sl[-1]], 'none', INK, sw))
    # balcony rings: parapet band + corbel row with generated brackets
    for x0, x1, b0, b1 in m['balc']:
        bm = b0 + (b1 - b0) * .45; c = (x0 + x1) / 2; r = (x1 - x0) / 2
        out.append(poly([(x0, b0), (x1, b0), (x1, bm), (x0, bm)], md, INK, sw))
        out.append(poly([(x1 - r * .6, b0), (x1, b0), (x1, bm), (x1 - r * .6, bm)], lt, 'none', 0))
        out.append(poly([(x0 + 4, bm), (x1 - 4, bm), (x1 - 9, b1), (x0 + 9, b1)], sh, INK, sw * .8))
        n = 11; ticks = []
        for k in range(1, n):
            x = c + (r - 8) * math.sin(math.pi * (k / n - .5)); ticks.append(((x, bm + 2), (x, b1 - 2)))
        out.append(marks(ticks, P['open'], 3 if not far else 2))
        out.append(line([(x0, b0 + 3), (x1, b0 + 3)], P['hi'] if not far else lt, 2, 'opacity=".7"'))
    # pavilion: columns and three arched openings (spaced around the octagon)
    px0, px1, p0, p1 = m['pav']; pc = (px0 + px1) / 2; pr = (px1 - px0) / 2
    out.append(poly([(px0, p0), (px1, p0), (px1, p1), (px0, p1)], md, INK, sw))
    out.append(poly([(pc + pr * .2, p0), (px1, p0), (px1, p1), (pc + pr * .2, p1)], lt, 'none', 0))
    for a in (-52, 0, 52):
        oc = pc + pr * .78 * math.sin(math.radians(a)); ow = pr * .32 * math.cos(math.radians(a)) + 2
        out.append(path(arch_d(oc - ow, oc + ow, p0 + (p1 - p0) * .38, p0 + (p1 - p0) * .14, p1 - 2), P['open'], INK, 1.5))
    out.append(poly([(px0, p0), (px1, p0), (px1, p1), (px0, p1)], 'none', INK, sw))
    # eave (chhajja), dome, finial
    e0, e1, ey0, ey1 = m['eave']
    out.append(poly([(e0, ey0), (e1, ey0), (e1 - 7, ey1), (e0 + 7, ey1)], P['band'], INK, sw))
    out += dome(cx, base, top, hwb, hwm, ym, md, lt, sh, sw)
    out.append(line([(cx, dtop + 2), (cx, ftop)], INK, 3 if not far else 2.5))
    for t, rr in ((.3, 4), (.55, 3)): out.append(f'<circle cx="{cx}" cy="{dtop - (dtop - ftop) * t:.0f}" r="{rr if not far else rr - 1}" fill="{P["band"]}" stroke="{INK}" stroke-width="1.5"/>')
    return out

NL = dict(fin=(458, 456, 494), dome=(541, 494, 30, 33, 526), eave=(406, 510, 541, 553), pav=(425, 489, 553, 601),
          balc=[(410, 502, 600, 627), (402, 512, 820, 841), (396, 518, 1006, 1032)], shaft_l=[(422, 627), (406, 1300)], shaft_r=[(499, 627), (504, 1300)])
NR = dict(fin=(2127, 451, 499), dome=(535, 499, 30, 32, 521), eave=(2077, 2177, 535, 546), pav=(2096, 2158, 546, 593),
          balc=[(2081, 2174, 592, 618), (2076, 2186, 805, 831), (2070, 2188, 1000, 1025)], shaft_l=[(2091, 618), (2086, 1300)], shaft_r=[(2166, 618), (2181, 1300)])
FL = dict(fin=(644, 641, 665), dome=(706, 665, 25, 27, 692), eave=(605, 683, 706, 714), pav=(617, 671, 714, 756),
          balc=[(608, 680, 756, 771), (602, 686, 919, 938), (597, 691, 1068, 1085)], shaft_l=[(614, 771), (606, 1215)], shaft_r=[(675, 771), (688, 1215)])
FR = dict(fin=(1936, 639, 659), dome=(704, 659, 24, 26, 684), eave=(1900, 1974, 704, 711), pav=(1911, 1960, 711, 751),
          balc=[(1902, 1974, 751, 768), (1897, 1981, 915, 932), (1894, 1986, 1063, 1080)], shaft_l=[(1908, 768), (1900, 1215)], shaft_r=[(1968, 768), (1979, 1215)])
g += minaret(FL, True) + minaret(FR, True)

# ---------------- trees on the right (scalloped canopy, generated clumps) ----------------
top_c = [(2150, 1012), (2207, 994), (2257, 984), (2284, 964), (2304, 934), (2336, 926), (2386, 926), (2427, 932), (2448, 950), (2463, 966),
         (2472, 932), (2482, 898), (2498, 858), (2516, 826), (2538, 806), (2564, 800), (2600, 798)]
def canopy(edge, n, bump):
    d = f'M{edge[0][0]:.0f},{edge[0][1]:.0f}'; pp = along(edge, n)
    for (a, _), (b, (tx, ty)) in zip(pp, pp[1:]):
        m = lerp(a, b, .5); s = bump * R.uniform(.6, 1.3); d += f' Q{m[0] + ty * s:.0f},{m[1] - tx * s:.0f} {b[0]:.0f},{b[1]:.0f}'
    return d
def blob(cx, cy, rx, ry, n=7):
    """a leaf clump: scalloped ellipse"""
    q = [(cx + rx * math.cos(2 * math.pi * k / n), cy + ry * math.sin(2 * math.pi * k / n)) for k in range(n)]
    d = f'M{q[0][0]:.0f},{q[0][1]:.0f}'
    for k in range(n):
        a, b = q[k], q[(k + 1) % n]; th = 2 * math.pi * (k + .5) / n
        d += f' Q{cx + rx * 1.35 * math.cos(th):.0f},{cy + ry * 1.35 * math.sin(th):.0f} {b[0]:.0f},{b[1]:.0f}'
    return d + ' Z'
g.append(path(canopy(top_c, 26, 15) + ' L2600,1320 L2150,1320 Z', P['tree'], INK, 2.5))
for _ in range(34):   # leaf clumps: lighter toward the sky, darker low down
    x = R.uniform(2195, 2570); yt = max(y for xx, y in top_c if abs(xx - x) < 60)   # stay under the canopy edge
    y = R.uniform(yt + 40, 1250); rx = R.uniform(24, 40)
    hi = y < yt + 130 and R.random() < .8
    g.append(path(blob(x, y, rx, rx * .62), P['tree_hi'] if hi else P['tree_lo'], '#363B4A' if hi else 'none', 1.5 if hi else 0, 'opacity=".9"'))
for _ in range(9):   # small gaps of sky through the leaves
    x = R.uniform(2240, 2470); y = R.uniform(1000, 1180)
    g.append(path(blob(x, y, R.uniform(6, 11), R.uniform(4, 7), 5), '#8E92A6', 'none', 0, 'opacity=".55"'))

# ---------------- the drum and the big dome ----------------
g.append(poly([(CX - 196, 652), (CX + 196, 652), (CX + 196, 760), (CX - 196, 760)], 'url(#drum)', INK, 2.5))
for k in range(-3, 4):   # blind-arch panels on the lower drum, spaced around the cylinder
    x = CX + 190 * math.sin(math.radians(k * 24)); w = 26 * math.cos(math.radians(k * 24))
    g.append(path(arch_d(x - w, x + w, 690, 668, 750), 'none', '#857375', 1.8, 'opacity=".7"'))
DC = 1290
dl = {316: 1264, 340: 1229, 364: 1196, 400: 1160, 450: 1113, 507: 1081, 557: 1069, 580: 1068, 607: 1073, 645: 1084}   # dome edges read off the photo
dr = {316: 1316, 340: 1352, 364: 1388, 400: 1428, 450: 1476, 507: 1502, 557: 1512, 580: 1513, 607: 1509, 645: 1498}
left = [(dl[y], y) for y in sorted(dl, reverse=True)]; right = [(dr[y], y) for y in sorted(dr)]
g.append(path(curve(left + right, False) + ' Z', 'url(#dome)', INK, 3))
for y in (420, 470, 520, 570, 615):   # marble courses: arcs around the dome (seen from below they sag)
    k = min(dl, key=lambda k: abs(k - y)); g.append(path(f'M{dl[k] + 4:.0f},{y} Q{DC},{y + 22} {dr[k] - 4:.0f},{y}', 'none', '#8E7A7A', 1.6, 'opacity=".45"'))
g.append(path(f'M{DC + 120},{410} Q{DC + 200},{480} {DC + 205},{585}', 'none', P['hi'], 7, 'opacity=".55"'))   # sheen on the lit side
# frieze band at the dome's foot (generated cusped arches)
g.append(poly([(CX - 214, 610), (CX + 214, 610), (CX + 214, 654), (CX - 214, 654)], 'url(#drum)', INK, 2.5))
fr = []
for k in range(-11, 12):
    a = math.radians(k * 7.4); x = CX + 206 * math.sin(a); w = 8.5 * math.cos(a) + 1
    fr.append(path(arch_d(x - w, x + w, 638, 621, 651), '#8C797B', 'none', 0))
g += fr
g.append(line([(CX - 214, 616), (CX + 214, 616)], '#7E6C6E', 2)); g.append(line([(CX - 214, 652), (CX + 214, 652)], INK, 2.5))
# lotus cap with generated petals, then the finial
g.append(path(f'M{DC - 26},314 L{DC + 26},314 Q{DC + 60},336 {DC + 96},360 L{DC - 96},360 Q{DC - 60},336 {DC - 26},314 Z', '#B9A39A', INK, 2.5))
g.append(poly([(DC - 26, 314), (DC + 4, 314), (DC + 10, 360), (DC - 96, 360)], '#93848C', 'none', 0, 'opacity=".55"'))
pet = []
for k in range(-7, 8):
    t = k / 7.5; pet.append(((DC + 24 * t, 316), (DC + 94 * math.sin(t * math.pi / 2), 358)))
g.append(marks(pet, '#6E5F62', 2))
sc = ' '.join(f'M{DC - 96 + i * 12},360 q6,9 12,0' for i in range(16))
g.append(path(sc, 'none', INK, 2))
g.append(poly([(DC - 98, 360), (DC + 98, 360), (DC + 98, 368), (DC - 98, 368)], P['band'], INK, 2))
g.append(poly([(DC - 14, 314), (DC + 14, 314), (DC + 10, 300), (DC - 10, 300)], P['band'], INK, 2))
g.append(line([(DC, 300), (DC, 196)], INK, 5))
for cy, r in ((284, 9), (259, 13), (237, 6), (218, 9)):
    g.append(f'<circle cx="{DC}" cy="{cy}" r="{r}" fill="#8B7470" stroke="{INK}" stroke-width="2"/>')
g.append(path(f'M{DC - 13},178 Q{DC - 12},199 {DC},199 Q{DC + 12},199 {DC + 13},178 Q{DC + 6},192 {DC},192 Q{DC - 6},192 {DC - 13},178 Z', '#8B7470', INK, 2))

# ---------------- big chhatris (left, mirrored right) ----------------
def chhatri(ax):
    out = []
    out.append(poly([(ax - 72, 752), (ax + 72, 752), (ax + 72, 840), (ax - 72, 840)], P['mid'], INK, 2.5))
    out.append(poly([(ax + 15, 752), (ax + 72, 752), (ax + 72, 840), (ax + 15, 840)], P['lit'], 'none', 0))
    out.append(poly([(ax - 72, 752), (ax - 40, 752), (ax - 40, 840), (ax - 72, 840)], P['shade'], 'none', 0))
    for a in (-55, 0, 55):   # three arched openings around the octagon
        oc = ax + 52 * math.sin(math.radians(a)); ow = 22 * math.cos(math.radians(a)) + 1
        out.append(path(arch_d(oc - ow, oc + ow, 780, 764, 824), P['open'], INK, 2))
    out.append(poly([(ax - 72, 752), (ax + 72, 752), (ax + 72, 840), (ax - 72, 840)], 'none', INK, 2.5))
    out.append(poly([(ax - 90, 738), (ax + 76, 738), (ax + 70, 751), (ax - 82, 751)], P['band'], INK, 2.5))   # chhajja
    out.append(poly([(ax - 66, 728), (ax + 66, 728), (ax + 66, 739), (ax - 66, 739)], P['band'], INK, 2))
    out.extend(dome(ax, 729, 638, 64, 71, 708, P['mid'], P['lit'], P['shade'], 2.5))
    out.append(line([(ax + 1, 640), (ax + 2, 603)], INK, 3.5))
    out.append(f'<circle cx="{ax + 1}" cy="624" r="5" fill="{P["band"]}" stroke="{INK}" stroke-width="1.5"/>')
    return out
def small_chhatri(ax):
    return [poly([(ax - 19, 792), (ax + 19, 792), (ax + 19, 834), (ax - 19, 834)], P['fmid'], INK, 2),
            path(arch_d(ax - 9, ax + 9, 806, 797, 830), P['open'], INK, 1.5),
            poly([(ax - 27, 785), (ax + 27, 785), (ax + 22, 793), (ax - 22, 793)], P['band'], INK, 2)] + dome(ax, 786, 762, 18, 20, 777, P['fmid'], P['flit'], P['fshade'], 2)
g += small_chhatri(872) + small_chhatri(mx(872))
g += chhatri(1026) + chhatri(mx(1026))

# ---------------- pinnacles (guldastas) behind the corner ----------------
def pinnacle(cx, tip, cap, w, bottom, lit_right=True):
    out = [poly([(cx - w / 2, cap + 12), (cx + w / 2, cap + 12), (cx + w / 2, bottom), (cx - w / 2, bottom)], P['mid'], 'none', 0),
           poly([(cx + w * .05, cap + 12), (cx + w / 2, cap + 12), (cx + w / 2, bottom), (cx + w * .05, bottom)], P['lit'], 'none', 0),
           poly([(cx - w / 2, cap + 12), (cx + w / 2, cap + 12), (cx + w / 2, bottom), (cx - w / 2, bottom)], 'none', INK, 2)]
    rings = [((cx - w / 2 - 2, y), (cx + w / 2 + 2, y)) for y in range(int(cap) + 40, int(min(bottom, cap + 170)), 34)]
    out.append(marks(rings, INK, 2))
    out.append(path(f'M{cx - w * .75:.0f},{cap + 13} Q{cx - w * .8:.0f},{cap} {cx:.0f},{cap - 4} Q{cx + w * .8:.0f},{cap} {cx + w * .75:.0f},{cap + 13} Z', P['band'], INK, 2))
    out.append(line([(cx, cap - 4), (cx, tip)], INK, 2.5))
    return out
for ax, tip, cap, w in ((837, 680, 700, 15), (863, 713, 728, 15)):
    g += pinnacle(ax, tip, cap, w, 840) + pinnacle(mx(ax), tip - 3, cap - 3, w, 840)

# ---------------- the facade: chamfers, front face, pishtaq ----------------
g.append(poly([(817, 834), (935, 826), (935, 1210), (817, 1210)], P['chamL'], INK, 3))
g.append(poly([(mx(935), 826), (mx(817), 834), (mx(817), 1210), (mx(935), 1210)], P['chamR'], INK, 3))
g.append(poly([(935, 826), (1130, 826), (1130, 750), (mx(1130), 750), (mx(1130), 826), (mx(935), 826), (mx(935), 1210), (935, 1210)], P['face'], INK, 3))
g.append(poly([(1130, 750), (1210, 750), (1210, 1210), (1130, 1210)], '#A68F87', 'none', 0, 'opacity=".5"'))   # the shaded inner side of the pishtaq frame
# parapet band along the roof edge, with a generated row of small cusped panels
for x0, x1, yt in ((817, 935, 834), (935, 1130, 826), (mx(1130), mx(935), 826), (mx(935), mx(817), 834)):
    g.append(line([(x0, yt + 21), (x1, yt + 21)], INK, 2))
    n = max(2, int((x1 - x0) / 16)); cusp = ' '.join(f'M{x0 + (x1 - x0) * i / n:.0f},{yt + 18} q{(x1 - x0) / n / 2:.0f},-13 {(x1 - x0) / n:.0f},0' for i in range(n))
    g.append(path(cusp, 'none', '#7F6C6C', 1.6, 'opacity=".75"'))
# pishtaq parapet band (top) with generated panels
g.append(line([(1130, 797), (mx(1130), 797)], INK, 2.5))
pan = ' '.join(f'M{1138 + i * 26.5:.0f},792 L{1138 + i * 26.5:.0f},768 q9.5,-12 19,0 L{1157 + i * 26.5:.0f},792' for i in range(12))
g.append(path(pan, 'none', '#7F6C6C', 1.8, 'opacity=".8"'))
# calligraphy frame and inner frame
g.append(poly([(1148, 806), (mx(1148), 806), (mx(1148), 1210), (1148, 1210)], 'none', P['frame'], 3))
g.append(poly([(1170, 826), (mx(1170), 826), (mx(1170), 1210), (1170, 1210)], 'none', P['frame'], 2))
# spandrels with generated floral scrolls
g.append(poly([(1180, 840), (mx(1180), 840), (mx(1180), 935), (1180, 935)], '#A48C86', P['frame'], 2))
sp = []
for side in (-1, 1):
    for k in range(4):
        x = CX + side * (40 + k * 22); y = 862 + (k % 2) * 16
        sp.append(f'M{x:.0f},{y} q{side * 9},-12 {side * 18},0 q{side * 6},10 {side * -4},14')
g.append(path(' '.join(sp), 'none', '#6E5D60', 2))
# the great iwan: pointed arch, half-dome with generated ribs, back wall, window grille, door
g.append(path(arch_d(1190, mx(1190), 935, 869, 1210), P['recess'], INK, 3.5))
g.append(path(arch_d(1214, mx(1214), 962, 904, 1210), P['deep'], INK, 2))
ribs = []
for k in range(-4, 5):
    t = k / 4.5; ribs.append(((CX + 12 * t, 910), (CX + 76 * math.sin(t * 1.2), 962)))
g.append(marks(ribs, '#6A5E68', 1.6, 'opacity=".8"'))
g.append(poly([(1222, 962), (mx(1222), 962), (mx(1222), 1210), (1222, 1210)], '#8B7E86', INK, 2))
g.append(path(arch_d(1265, mx(1265), 968, 946, 1036), '#A39491', INK, 2))
gr = [((x, 958 if abs(x - CX) < 15 else 966), (x, 1034)) for x in range(1272, 1318, 9)] + [((1266, y), (mx(1266), y)) for y in range(978, 1034, 11)]
g.append(marks(gr, '#5F5560', 1.5))
g.append(path(arch_d(1272, mx(1272), 1094, 1078, 1150), '#6F6470', INK, 2))
g.append(line([(1222, 1056), (mx(1222), 1056)], '#7A6E76', 2))
# side arches: two storeys on each wing and each chamfer (defined once, mirrored)
side = [  # x0, x1, spring, apex, bottom, frame (x0, x1, top), fill
    (971, 1066, 941, 899, 1032, (947, 1097, 884), P['recess']), (968, 1068, 1100, 1061, 1210, None, P['recess']),
    (853, 903, 935, 900, 1042, (824, 928, 884), '#706775'), (853, 903, 1105, 1072, 1210, None, '#706775')]
for x0, x1, spr, apx, bot, fr_, fill in side:
    for mir in (False, True):
        a0, a1 = (mx(x1), mx(x0)) if mir else (x0, x1)
        fill_ = fill
        if mir and fill == '#706775': fill_ = '#B4927C'; a0, a1 = a0 + 3, a1 + 8   # the lit chamfer reads a touch wider in the photo
        if fr_:
            f0, f1 = (mx(fr_[1]), mx(fr_[0])) if mir else (fr_[0], fr_[1])
            g.append(poly([(f0, fr_[2]), (f1, fr_[2]), (f1, 1210), (f0, 1210)], 'none', P['frame'], 2))
        g.append(path(arch_d(a0, a1, spr, apx, bot), fill_, INK, 2.5))
        c = (a0 + a1) / 2; w = (a1 - a0) / 2
        g.append(path(arch_d(c - w * .72, c + w * .72, spr + 10, apx + 16, bot), 'none', '#6E6068', 1.6, 'opacity=".7"'))   # inner order of the arch
        if bot < 1100:   # upper storey: grille and ledge
            g.append(poly([(c - w * .3, bot - 45), (c + w * .3, bot - 45), (c + w * .3, bot - 4), (c - w * .3, bot - 4)], '#A19190', INK, 1.5))
            g.append(marks([((c - w * .3 + w * .6 * k / 4, bot - 45), (c - w * .3 + w * .6 * k / 4, bot - 4)) for k in range(1, 4)], '#5F5560', 1.3))
            g.append(poly([(a0 - 4, bot), (a1 + 4, bot), (a1 + 4, bot + 12), (a0 - 4, bot + 12)], P['band'], INK, 2))
        else:
            g.append(poly([(c - w * .32, 1150), (c + w * .32, 1150), (c + w * .32, 1210), (c - w * .32, 1210)], '#6A606B', INK, 1.5))
g.append(line([(817, 1056), (1130, 1056)], P['frame'], 2)); g.append(line([(mx(1130), 1056), (mx(817), 1056)], P['frame'], 2))
# front pinnacles: chamfer corners, chamfer/wing joints, pishtaq edges
for ax, tip, cap, w in ((823, 742, 760, 16), (933, 736, 752, 17), (1103, 668, 682, 17)):
    g += pinnacle(ax, tip, cap, w, 1210) + pinnacle(mx(ax), tip - 3, cap - 3, w, 1210)

# ---------------- plinth ----------------
g.append(poly([(360, 1203), (2232, 1203), (2232, 1320), (360, 1320)], P['plinth'], INK, 2.5))
g.append(poly([(360, 1203), (2232, 1203), (2232, 1216), (360, 1216)], P['plinth_top'], INK, 2))
g.append(marks([((x, 1216), (x, 1320)) for x in range(420, 2232, 120)], '#8E8288', 1.5, 'opacity=".6"'))

# ---------------- near minarets ----------------
g.append(poly([(390, 1192), (532, 1192), (532, 1320), (390, 1320)], P['mid'], INK, 2.5))
g.append(poly([(mx(532) + 12, 1192), (mx(390) + 12, 1192), (mx(390) + 12, 1320), (mx(532) + 12, 1320)], P['mid'], INK, 2.5))
g += minaret(NL) + minaret(NR)

# ---------------- the crowd: backlit heads and shoulders (generated from a list of readings) ----------------
mass = [(205, 1320), (300, 1258), (390, 1278), (470, 1296), (500, 1310), (530, 1296), (600, 1270), (700, 1258), (850, 1245), (1000, 1236), (1100, 1234),
        (1300, 1238), (1360, 1234), (1550, 1250), (1650, 1250), (1850, 1262), (2080, 1236), (2150, 1238), (2300, 1250), (2400, 1266), (2576, 1266)]
g.append(poly(mass + [(2576, H), (205, H)], P['mass'], INK, 2.5))
def person(x0, x1, top, neck, L, Rt, tone, nk=.62, acc=()):
    c = (x0 + x1) / 2; hw = (x1 - x0) / 2; hh = neck - top; out = []
    def side(s, S):   # one side of the outline, head top → hem: skull, jaw, neck, trapezius, shoulder, arm, hem
        nkp = (c + s * hw * nk, neck); nb = (c + s * hw * (nk + .12), neck + (S[1] - neck) * .4)   # neck, neck base
        tz = (lerp(nkp, S, .64)[0], S[1] - (S[1] - neck) * .2)   # flat trapezius before the shoulder rounds off
        return [(c, top), (c + s * hw * .8, top + hh * .16), (c + s * hw, top + hh * .5), (c + s * hw * .9, top + hh * .8), nkp, nb, tz, S,
                (S[0] + s * 13, S[1] + 40), (S[0] + s * 19, S[1] + 150), (S[0] + s * 13, S[1] + 300), (S[0] + s * 20, H + 30)]
    rs, ls = side(1, Rt), side(-1, L)
    out.append(path(curve(ls[::-1] + rs[1:], False) + ' Z', tone, INK, 3))
    # backlight: a thin warm rim over the skull and along both shoulders
    out.append(path(curve([(c - hw * .9, top + hh * .34), (c - hw * .55, top + hh * .08), (c, top + 3), (c + hw * .55, top + hh * .08), (c + hw * .9, top + hh * .34)], False), 'none', P['rim'], 3.5))
    for s, S in ((1, Rt), (-1, L)):
        out.append(line([(S[0] - s * 22, S[1] + 80), (S[0] - s * 18, S[1] + 190), (S[0] - s * 10, S[1] + 290)], '#2A2126', 3))   # where the arm meets the body
    for a in acc:
        if a == 'cap':   # cap: a flatter crown and a brim stub
            out.append(path(f'M{c - hw * .95:.0f},{top + hh * .38:.0f} Q{c:.0f},{top - 8:.0f} {c + hw * .95:.0f},{top + hh * .38:.0f} L{c + hw * 1.25:.0f},{top + hh * .44:.0f} L{c + hw * .9:.0f},{top + hh * .5:.0f} Z', '#2A2024', INK, 2.5))
        if a == 'beanie':   # knitted cap: crown plus a turned-up band
            out.append(path(f'M{c - hw * 1.0:.0f},{top + hh * .44:.0f} Q{c - hw:.0f},{top - 6:.0f} {c:.0f},{top - 3:.0f} Q{c + hw:.0f},{top - 6:.0f} {c + hw * 1.0:.0f},{top + hh * .44:.0f} Z', '#33262B', INK, 2.5))
            out.append(line([(c - hw * 1.0, top + hh * .34), (c + hw * 1.0, top + hh * .34)], '#45363C', 3))
        if a == 'bun':
            out.append(f'<circle cx="{c + hw * .25:.0f}" cy="{top + 6:.0f}" r="{hw * .38:.0f}" fill="{tone}" stroke="{INK}" stroke-width="2.5"/>')
        if a == 'ponytail':
            out.append(path(curve([(c - hw * .3, top + hh * .5), (c + hw * .3, top + hh * .5), (c + hw * .38, neck + 10), (c + hw * .12, neck + 70), (c - hw * .05, neck + 92), (c - hw * .3, neck + 60), (c - hw * .38, neck + 10)], True), '#2C2126', INK, 2.5))
            out.append(path(f'M{c - hw * .32:.0f},{top + hh * .56:.0f} Q{c:.0f},{top + hh * .66:.0f} {c + hw * .32:.0f},{top + hh * .56:.0f}', 'none', P['rim'], 2.5, 'opacity=".7"'))   # the hair tie
        if a == 'hair':   # long hair over the shoulders
            out.append(path(curve([(c - hw * 1.02, top + hh * .5), (c - hw * 1.08, neck + 20), (c - hw * .9, neck + 95), (c, neck + 110), (c + hw * .9, neck + 95), (c + hw * 1.08, neck + 20), (c + hw * 1.02, top + hh * .5)], False), '#2A1F24', INK, 2.5))
        if a == 'hood':
            out.append(path(curve([(c - hw * 1.2, neck + 22), (c - hw * .9, neck - 6), (c, neck + 4), (c + hw * .9, neck - 6), (c + hw * 1.2, neck + 22), (c, neck + 70)], True), '#29191F', INK, 2.5))
        if a == 'strap':
            out.append(line([(c + hw * 1.1, neck + 20), (c - hw * 1.6, neck + 260)], '#3A2B31', 9))
        if a == 'backpack':
            for s in (-1, 1): out.append(line([(c + s * hw * .7, neck + 8), (c + s * hw * 1.25, neck + 30), (c + s * hw * 1.05, neck + 70)], '#2C211B', 8))   # straps
            out.append(path(curve([(c - hw * 1.1, neck + 45), (c + hw * 1.1, neck + 45), (c + hw * 1.3, neck + 190), (c, neck + 230), (c - hw * 1.3, neck + 190)], True), '#251A15', INK, 3))
            out.append(path(curve([(c - hw * .8, neck + 140), (c + hw * .8, neck + 140), (c + hw * .85, neck + 195), (c, neck + 212), (c - hw * .85, neck + 195)], True), '#2B1F18', INK, 2))   # front pocket
            out.append(line([(c - hw * 1.05, neck + 70), (c, neck + 58), (c + hw * 1.05, neck + 70)], '#4A382C', 2.5))
    return out
crowd = [  # x0, x1, head top, neck, left shoulder, right shoulder, tone (0 back .. 2 front), accessories
    (1848, 1892, 1238, 1290, (1828, 1312), (1910, 1312), 0, ()),
    (870, 922, 1132, 1200, (846, 1232), (930, 1226), 0, ()),
    (204, 262, 1100, 1208, (150, 1290), (362, 1272), 1, ()),
    (372, 456, 1160, 1226, (342, 1268), (505, 1306), 2, ()),
    (544, 628, 1170, 1236, (500, 1306), (664, 1270), 1, ('ponytail',)),
    (692, 756, 1150, 1226, (656, 1262), (792, 1252), 0, ('beanie',)),
    (774, 850, 1126, 1210, (742, 1246), (882, 1242), 1, ()),
    (1128, 1192, 1120, 1214, (1096, 1246), (1226, 1246), 1, ('hair',)),
    (1228, 1296, 1116, 1200, (1196, 1226), (1344, 1228), 2, ()),
    (1460, 1540, 1116, 1205, (1440, 1228), (1604, 1252), 1, ('bun',)),
    (2304, 2368, 1136, 1212, (2268, 1232), (2420, 1262), '#1F1318', ()),
    (2156, 2224, 1104, 1204, (2082, 1232), (2280, 1262), 2, ('cap',)),
    (1360, 1450, 1108, 1198, (1336, 1228), (1474, 1222), '#22141B', ('hood', 'strap')),
    (1955, 2020, 1150, 1228, (1862, 1246), (2100, 1242), 2, ('backpack',)),
    (920, 1000, 1076, 1172, (870, 1216), (1046, 1228), '#211316', ()),
    (1660, 1756, 1100, 1208, (1604, 1252), (1868, 1254), 2, ()),
]
for x0, x1, top, neck, L, Rt, tone, acc in crowd:
    g += person(x0, x1, top, neck, L, Rt, P['crowd'][tone] if isinstance(tone, int) else tone, .9 if 'hair' in acc else .62, acc)
# the wide-brim hat (on the backpack wearer), tilted
g.append(path(f'M1944,1176 Q1946,1114 1986,1114 Q2026,1114 2028,1184 Z', '#2A2024', INK, 3))
g.append(f'<ellipse cx="1980" cy="1188" rx="98" ry="15" transform="rotate(16 1980 1188)" fill="#2A2024" stroke="{INK}" stroke-width="3"/>')
g.append(path('M1900,1166 Q1960,1160 2040,1196', 'none', P['rim'], 3))
# the big near shoulder on the right edge
g.append(path(curve([(2400, H + 30), (2420, 1300), (2430, 1190), (2448, 1126), (2482, 1084), (2536, 1060), (2600, 1048), (2620, H + 30)], False) + ' Z', P['crowd'][2], INK, 3))
g.append(path('M2440,1150 Q2470,1092 2540,1068', 'none', P['rim'], 3))

# ---------------- the gate: dark doorway frame on the left ----------------
g.append(poly([(0, 0), (212, 0), (210, 600), (205, 1100), (203, H), (0, H)], P['door'], INK, 3))
g.append(poly([(0, 0), (100, 0), (100, H), (0, H)], P['door_in'], 'none', 0))
g.append(line([(205, 0), (203, 600), (199, 1100), (197, H)], P['door_rim'], 4))
g.append(marks([((100, 0), (100, H)), ((150, 0), (150, H))], '#251B21', 2))
g.append(line([(40, H), (150, 1676), (292, 1644)], '#5A4A52', 6))   # light on the threshold step
g.append('</svg>')
open(sys.argv[1], 'w').write('\n'.join(g)); print('ok', len(g), 'elements')
