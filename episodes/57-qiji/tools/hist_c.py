"""ep57 history key frames, set C (1920x1080 SVG each), drawn in code in the language of the scene drawings
(petra_vector.py, taj_vector.py, gw_vector.py): hand-placed polygons and paths, code-generated repeats, ink #2A211B at
2-3 px, flat fills from a curated palette, gradients only for sky, glow and big surfaces. People are flat faceless figures
with a warm rim light; the emperor appears only as a dignified silhouette.
  petra_caravan  a camel caravan in the rose-red Siq, the Treasury glimpsed at the end (乳香 / 香料 / 丝绸 on the cargo)
  petra_tax      the toll point at the canyon mouth: coins stack into a growing pile; the Treasury half carved behind
  taj_build      the Taj under construction (scaffolds, half-built minarets, elephants hauling marble), 1632 → 1653,
                 the mourning emperor in the foreground
  taj_fort       the old emperor in a red-sandstone window of Agra Fort, the small white Taj far off at dusk;
                 inset: the two cenotaphs side by side
Kept free of key content: subtitle (x 120-1150, y 90-340), counter (x 1480-1800, y 50-130), odometer (x 120-720,
y 950-1040), seal (x > 1700, y > 950).
usage: hist_c.py [out_dir]     (default: <scratchpad>/sb57/hist; writes <name>.svg)"""
import sys, os, math, random

W, H = 1920, 1080
INK = '#2A211B'
GOLD, GOLD_D, CREAM = '#F2C66E', '#B07F2C', '#FFF6E6'
FONT = 'Noto Sans CJK SC'
OUT = '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/sb57/hist'

# ---------------- shared helpers (as in the scene scripts) ----------------
def pts(p): return ' '.join(f'{x:.1f},{y:.1f}' for x, y in p)
def poly(p, fill, stroke=INK, sw=3, extra=''): return f'<polygon points="{pts(p)}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" {extra}/>'
def line(p, stroke=INK, sw=3, extra=''): return f'<polyline points="{pts(p)}" fill="none" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" {extra}/>'
def lerp(a, b, t): return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
def along(path_, n):
    """n+1 evenly spaced points (with unit tangents) along a polyline"""
    seg = [math.dist(a, b) for a, b in zip(path_, path_[1:])]; L = sum(seg); out = []
    for i in range(n + 1):
        d = L * i / n; j = 0
        while j < len(seg) - 1 and d > seg[j]: d -= seg[j]; j += 1
        a, b = path_[j], path_[j + 1]; t = min(1, d / seg[j]); tx, ty = (b[0] - a[0]) / seg[j], (b[1] - a[1]) / seg[j]
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
def ell(cx, cy, rx, ry, fill, extra=''): return f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" fill="{fill}" {extra}/>'
def grad(id, stops, x1=0, y1=0, x2=0, y2=1, user=False):
    u = ' gradientUnits="userSpaceOnUse"' if user else ''
    return (f'<linearGradient id="{id}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"{u}>' +
            ''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops) + '</linearGradient>')
def rgrad(id, stops, cx=.5, cy=.5, r=.5):
    return (f'<radialGradient id="{id}" cx="{cx}" cy="{cy}" r="{r}">' +
            ''.join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"/>' for o, c, a in stops) + '</radialGradient>')
def curve(p, closed=True):
    """smooth path through the chosen points (Catmull-Rom → cubic Bézier)"""
    n = len(p); d = f'M{p[0][0]:.1f},{p[0][1]:.1f}'
    for i in range(n if closed else n - 1):
        p1, p2 = p[i], p[(i + 1) % n]
        if closed: p0, p3 = p[(i - 1) % n], p[(i + 2) % n]
        else: p0, p3 = p[max(i - 1, 0)], p[min(i + 2, n - 1)]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6); c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f' C{c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}'
    return d + (' Z' if closed else '')
def path(d, fill, stroke=INK, sw=3, extra=''): return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round" {extra}/>'
def marks(segs, stroke, sw, extra=''):
    """many short strokes as one path element"""
    return path(' '.join(f'M{a[0]:.1f},{a[1]:.1f} L{b[0]:.1f},{b[1]:.1f}' for a, b in segs), 'none', stroke, sw, extra)
def arch_d(x0, x1, spring, apex, bottom):
    """pointed (Mughal) arch: up the left jamb, two convex curves meeting at the apex, down the right jamb"""
    c = (x0 + x1) / 2; w = (x1 - x0) / 2; h = spring - apex
    return (f'M{x0:.1f},{bottom:.1f} L{x0:.1f},{spring:.1f} C{x0:.1f},{spring - .62 * h:.1f} {c - .45 * w:.1f},{apex + .135 * w:.1f} {c:.1f},{apex:.1f} '
            f'C{c + .45 * w:.1f},{apex + .135 * w:.1f} {x1:.1f},{spring - .62 * h:.1f} {x1:.1f},{spring:.1f} L{x1:.1f},{bottom:.1f} Z')
def dome_side(cx, base, top, hwb, hwm, ym, k=1.0):
    """right half of a bulbous dome, base → top (k scales the half-widths, for the lit crescent)"""
    h = ym - top
    return [(cx + hwb * k, base), (cx + hwm * k, ym), (cx + hwm * .9 * k, ym - h * .45), (cx + hwm * .55 * k, top + h * .12), (cx, top)]
def dome(cx, base, top, hwb, hwm, ym, fill, lit, shade, sw=2.5):
    r = dome_side(cx, base, top, hwb, hwm, ym); sl = [(2 * cx - x, y) for x, y in r]
    outline = curve(sl + r[::-1][1:], False) + ' Z'
    out = [path(outline, fill, 'none', 0)]
    out.append(path(curve(r, False) + ' ' + curve(dome_side(cx, base, top, hwb, hwm, ym, .3)[::-1], False).replace('M', 'L', 1) + ' Z', lit, 'none', 0))
    out.append(path(curve(sl, False) + ' ' + curve([(2 * cx - x, y) for x, y in dome_side(cx, base, top, hwb, hwm, ym, .62)][::-1], False).replace('M', 'L', 1) + ' Z', shade, 'none', 0))
    out.append(path(outline, 'none', INK, sw))
    return out
# --- helpers for these frames ---
def tf(ox, oy, k, f=1):
    """local → frame: origin (ox, oy) at the feet, k px per unit, f = +1 facing right / -1 facing left"""
    return lambda p: (ox + f * k * p[0], oy + k * p[1])
def TP(T, ps): return [T(p) for p in ps]
def rot(ps, a, cx=0, cy=0):
    c, s = math.cos(math.radians(a)), math.sin(math.radians(a))
    return [(cx + x * c - y * s, cy + x * s + y * c) for x, y in ps]
def limb(cl, foot=0):
    """polygon around a centreline [(x, y, half-width), ...] listed top → bottom, with an optional foot pad"""
    L = [(x - w, y) for x, y, w in cl]; Rr = [(x + w, y) for x, y, w in cl]
    if foot: x, y, w = cl[-1]; L.append((x - foot * .8, 0)); Rr.append((x + foot * 1.2, 0))
    return L + Rr[::-1]
def bar(p, color, w, sw=2.5):
    """a stroked bar (pole, staff, arm) with an ink outline"""
    return [line(p, INK, w + 2 * sw), line(p, color, w)]
def text(x, y, s, fs, fill, anchor='middle', weight=900, extra=''):
    return f'<text x="{x:.0f}" y="{y:.0f}" font-family="{FONT}" font-weight="{weight}" font-size="{fs}" fill="{fill}" text-anchor="{anchor}" {extra}>{s}</text>'
def tag(cx, cy, s, fs, rot_=0, hang=None, sw=2.5):
    """a gold luggage tag with ink text (cx, cy = centre), optionally on a string to `hang`"""
    w = len(s) * fs + fs * .9; h = fs * 1.42; x0, x1, y0, y1 = cx - w / 2, cx + w / 2, cy - h / 2, cy + h / 2
    out = []
    if hang: out.append(line([hang, (x0 + h * .3, cy)], INK, 2))
    out.append(f'<g transform="rotate({rot_:.1f} {cx:.0f} {cy:.0f})">')
    out.append(poly([(x0 + h * .42, y0), (x1, y0), (x1, y1), (x0 + h * .42, y1), (x0, cy)], GOLD, INK, sw))
    out.append(line([(x0 + h * .5, y0 + 4), (x1 - 4, y0 + 4)], '#FBE3A6', 3, 'opacity=".9"'))
    out.append(f'<circle cx="{x0 + h * .3:.1f}" cy="{cy:.1f}" r="{fs * .1:.1f}" fill="{INK}"/>')
    out.append(text(cx + h * .2, cy + fs * .36, s, fs, INK))
    out.append('</g>')
    return out
def jag(a, b, n, amp, rnd):
    """a rough rock edge from a to b: n points with sideways noise"""
    out = [a]
    for i in range(1, n):
        p = lerp(a, b, i / n); dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1
        e = rnd.uniform(-amp, amp); out.append((p[0] - dy / L * e, p[1] + dx / L * e))
    return out + [b]
def svg(defs, body):
    return '\n'.join([f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">',
                      '<defs>' + ''.join(defs) + '</defs>'] + body + ['</svg>'])

# ---------------- figures ----------------
CAMEL = [(-86, -150), (-78, -161), (-62, -171), (-40, -188), (-15, -198), (10, -194), (32, -178), (52, -162), (68, -155),
         (88, -146), (104, -134), (118, -127), (132, -131), (142, -145), (148, -162), (154, -176), (163, -184), (178, -186),
         (196, -180), (206, -173), (209, -165), (203, -159), (186, -159), (168, -160), (159, -150), (151, -131), (137, -113),
         (117, -101), (96, -98), (80, -96), (70, -92), (48, -96), (18, -100), (-16, -102), (-46, -100), (-63, -104), (-77, -113),
         (-87, -126), (-91, -140)]
AMPHORA = [(-4, -30), (4, -30), (3, -24), (11, -16), (12, 0), (8, 16), (2, 28), (-2, 28), (-8, 16), (-12, 0), (-11, -16), (-3, -24)]
def camel(ox, oy, k, f=1, load='A', rim='#FFD29A', pal=None, sw=None, step=1):
    """a dromedary in profile (local: feet at y 0, hump top at -198, muzzle at x 209), walking, with its load.
    returns (elements, anchors) — anchors in frame coords: sack, sack2, bolt, muzzle, saddle_back"""
    pal = pal or dict(body='#B27A50', dark='#875A3C', knee='#9A6A46', cloth='#9C3A30', stripe=GOLD, stripe2='#34446A',
                      sack='#E0C292', sack_d='#B9946A', jar='#B5603C', bolt='#2E6A78')
    sw = sw or (3 if k > 1.2 else 2.5 if k > .7 else 2)
    T = tf(ox, oy, k, f); out = []; A = {}
    out.append(ell(ox + f * 4 * k, oy + 2, 112 * k, 9 * k, '#2A140C', 'opacity=".25"'))
    s = step
    # far legs (darker), then the near legs; the body overlaps their tops
    out.append(poly(TP(T, limb([(60, -100, 10), (60 - 3 * s, -76, 7), (58 - 5 * s, -54, 6.5), (57 - 6 * s, -46, 4.5), (55 - 8 * s, -14, 4), (54 - 8 * s, -5, 5)], 9)), pal['dark'], INK, sw))
    out.append(poly(TP(T, limb([(-58, -106, 12), (-55 + 3 * s, -82, 8), (-52 + 6 * s, -58, 6.5), (-50 + 7 * s, -46, 4.5), (-46 + 9 * s, -14, 4), (-45 + 9 * s, -5, 5)], 9)), pal['dark'], INK, sw))
    out.append(poly(TP(T, limb([(74, -104, 12), (78 + 2 * s, -78, 8), (82 + 4 * s, -54, 7), (83 + 5 * s, -46, 5), (86 + 8 * s, -14, 4.5), (88 + 8 * s, -5, 6)], 10)), pal['body'], INK, sw))
    out.append(poly(TP(T, limb([(-70, -112, 16), (-68 - 2 * s, -84, 10), (-74 - 3 * s, -58, 7), (-72 - 3 * s, -46, 5), (-70 - 5 * s, -14, 4.5), (-70 - 5 * s, -5, 6)], 10)), pal['body'], INK, sw))
    for x, y in ((82 + 4 * s, -54), (-74 - 3 * s, -58)):   # knee knobs
        c = T((x, y)); out.append(ell(c[0], c[1], 8 * k, 6 * k, pal['knee'], f'stroke="{INK}" stroke-width="{sw * .8}"'))
    out += bar(TP(T, [(-89, -146), (-96, -128), (-97, -112)]), pal['dark'], max(3, 5 * k), sw * .8)   # tail
    out.append(path(curve(TP(T, CAMEL)), pal['body'], INK, sw))
    out.append(path(curve(TP(T, [(-40, -104), (20, -102), (60, -98), (66, -110), (20, -114), (-40, -114)])), pal['knee'], 'none', 0, 'opacity=".55"'))   # belly shade
    out.append(poly(TP(T, [(158, -182), (160, -193), (167, -185)]), pal['body'], INK, sw * .8))   # ear
    out.append(line(TP(T, [(197, -170), (203, -168)]), INK, sw * .8))   # nostril slit
    # halter and nose rope
    out.append(line(TP(T, [(166, -184), (171, -170), (176, -160)]), '#5A2C1E', max(2, 3 * k)))
    out.append(line(TP(T, [(172, -176), (204, -170)]), '#5A2C1E', max(2, 3 * k)))
    A['muzzle'] = T((200, -164))
    if load:
        blanket = [(-60, -160), (-48, -180), (-30, -194), (-12, -203), (8, -200), (28, -187), (42, -168), (44, -148), (38, -131), (-52, -131), (-63, -146)]
        out.append(path(curve(TP(T, blanket)), pal['cloth'], INK, sw))
        out.append(line(TP(T, [(-56, -143), (-10, -144), (41, -142)]), pal['stripe'], max(3, 5 * k)))
        out.append(line(TP(T, [(-59, -151), (-10, -152), (43, -150)]), pal['stripe2'], max(2, 3.5 * k)))
        out.append(marks([(T((x, -131)), T((x - 1, -125))) for x in range(-48, 38, 6)], pal['stripe'], max(1.5, 2.2 * k)))   # fringe
        A['saddle_back'] = T((-58, -158))
        if load == 'A':   # amphora behind, a big sack in front, a bolt of cloth across the top
            out.append(path(curve(TP(T, rot(AMPHORA, 22, -70, -142))), pal['jar'], INK, sw))
            out.append(line(TP(T, rot([(-11, -6), (11, -6)], 22, -70, -142)), '#8C4428', max(2, 3 * k)))
            sack = [(-18, -176), (6, -183), (30, -176), (38, -152), (38, -118), (28, -103), (-12, -102), (-24, -116), (-25, -150)]
            out.append(path(curve(TP(T, sack)), pal['sack'], INK, sw))
            out.append(path(curve(TP(T, [(28, -170), (36, -150), (36, -118), (27, -106), (18, -110), (24, -150)])), pal['sack_d'], 'none', 0))
            out.append(line(TP(T, [(-20, -170), (6, -176), (30, -170)]), '#7A5232', max(2, 3 * k)))   # cinched neck
            out.append(line(TP(T, [(-24, -132), (8, -124), (38, -132)]), '#7A5232', max(2, 2.5 * k), 'opacity=".8"'))   # rope round the sack
            bolt = [(-40, -222), (26, -222), (30, -211), (26, -200), (-40, -200), (-44, -211)]
            out.append(path(curve(TP(T, bolt)), pal['bolt'], INK, sw))
            out.append(path(curve(TP(T, [(-34, -219), (22, -219), (22, -214), (-34, -214)])), '#5FA0A8', 'none', 0, 'opacity=".55"'))
            e = T((26, -211)); out.append(ell(e[0], e[1], 5 * k, 10 * k, '#4D8C96', f'stroke="{INK}" stroke-width="{sw * .8}"'))
            out.append(line(TP(T, [(-20, -224), (-24, -198)]), '#5A2C1E', max(2, 2.5 * k))); out.append(line(TP(T, [(10, -224), (8, -198)]), '#5A2C1E', max(2, 2.5 * k)))
            A['sack'] = T((7, -140)); A['bolt'] = T((-8, -211)); A['sack_tie'] = T((6, -176))
        else:   # two sacks and a small jar on top
            s2 = [(-56, -170), (-30, -176), (-14, -168), (-10, -140), (-14, -116), (-34, -108), (-54, -114), (-62, -140)]
            out.append(path(curve(TP(T, s2)), pal['sack_d'], INK, sw))
            sack = [(-16, -178), (8, -184), (30, -176), (40, -150), (39, -118), (28, -104), (-10, -103), (-22, -118), (-24, -150)]
            out.append(path(curve(TP(T, sack)), pal['sack'], INK, sw))
            out.append(line(TP(T, [(-18, -171), (8, -177), (30, -171)]), '#7A5232', max(2, 3 * k)))
            out.append(line(TP(T, [(-22, -130), (10, -124), (39, -132)]), '#7A5232', max(2, 2.5 * k), 'opacity=".8"'))
            out.append(path(curve(TP(T, rot(AMPHORA, -8, -14, -222))), pal['jar'], INK, sw))
            A['sack'] = T((9, -141)); A['sack2'] = T((-36, -142)); A['sack_tie'] = T((8, -177))
    # warm rim light along the edges that face the light
    if rim:
        out.append(path(curve(TP(T, [(142, -150), (148, -165), (156, -179), (166, -186), (184, -186), (199, -179), (207, -170)]), False), 'none', rim, max(2, 3.5 * k), 'opacity=".85"'))
        out.append(path(curve(TP(T, [(84, -101), (98, -102), (116, -106), (134, -118)]), False), 'none', rim, max(1.5, 2.5 * k), 'opacity=".6"'))
        out.append(line(TP(T, [(90 + 8 * s, -6), (88 + 8 * s, -14), (85 + 5 * s, -46)]), rim, max(1.5, 2.5 * k), 'opacity=".7"'))
    return out, A

def figure(ox, oy, k, f=1, robe='#3E4A6A', head='wrap', wrap='#E9DDC8', skin='#8C5A3C', pose='walk', rim=None, sw=None, lean=0, staff=None, tool=None):
    """a small faceless figure in profile (local: feet at y 0, head top at -100), robe + headwrap/turban; returns (elements, anchors)"""
    sw = sw or (2.5 if k > 1.6 else 2 if k > .8 else 1.5)
    T0 = tf(ox, oy, k, f); T = lambda p: T0((p[0] + lean * -p[1], p[1])); out = []; A = {}
    out.append(ell(ox, oy, 18 * k, 3.5 * k, '#2A140C', 'opacity=".25"'))
    lw = max(2.5, 5 * k)
    dark = '#3A2A24'
    out += bar([T((-3, -14)), T((-7, -3)), T((-11, -1))], dark, lw, sw * .8)   # far leg
    if pose in ('push', 'pick'): far_hand = (24, -70) if pose == 'push' else (12, -102)
    else: far_hand = None
    if far_hand: out += bar([T((-1, -76)), T(lerp((-1, -76), far_hand, .5)), T(far_hand)], robe, max(3, 6 * k), sw * .8)
    body = [(-7, -77), (-2, -81), (5, -80), (9, -76), (11, -64), (9.5, -50), (12, -30), (15, -11), (2, -9), (-13, -11), (-12, -30), (-11, -50), (-11, -64)]
    out.append(path(curve(TP(T, body)), robe, INK, sw))
    out.append(line(TP(T, [(-11, -51), (10, -51)]), '#00000055', max(2, 3 * k)))   # belt
    out += bar([T((5, -12)), T((8, -3)), T((14, -1))], dark, lw, sw * .8)   # near leg
    hc = T((3, -88)); out.append(ell(hc[0], hc[1], 6.8 * k, 7.6 * k, skin, f'stroke="{INK}" stroke-width="{sw}"'))
    if head == 'wrap':
        out.append(path(curve(TP(T, [(-7, -88), (-5, -97), (3, -101), (10, -97), (11, -90), (6, -92), (-1, -91)])), wrap, INK, sw))
        out.append(path(curve(TP(T, [(-6, -92), (-10, -80), (-11, -68), (-7, -71), (-3, -86)])), wrap, INK, sw))
        out.append(line(TP(T, [(-6, -94), (10, -94)]), INK, max(2, 2.5 * k)))
    elif head == 'turban':
        out.append(path(curve(TP(T, [(-6, -89), (-6, -97), (2, -102), (10, -98), (11, -91), (3, -93)])), wrap, INK, sw))
        out.append(line(TP(T, [(-5, -94), (6, -99)]), '#00000040', max(1.5, 2 * k)))
    elif head == 'bare':
        out.append(path(curve(TP(T, [(-4, -90), (-3, -96), (4, -97), (9, -93), (3, -93)])), '#2A1C18', 'none', 0))
    # near arm and hand, per pose
    hand = {'walk': (14, -57), 'push': (24, -68), 'pick': (10, -104), 'carry': (5, -104), 'give': (22, -72), 'hold': (14, -66)}[pose]
    elbow = {'walk': (6, -62), 'push': (12, -70), 'pick': (8, -88), 'carry': (12, -88), 'give': (12, -66), 'hold': (10, -62)}[pose]
    out += bar([T((2, -75)), T(elbow), T(hand)], robe, max(3, 6 * k), sw * .8)
    hp = T(hand); out.append(f'<circle cx="{hp[0]:.1f}" cy="{hp[1]:.1f}" r="{max(2, 3 * k):.1f}" fill="{skin}" stroke="{INK}" stroke-width="{sw * .7}"/>')
    A['hand'] = hp; A['head'] = hc
    if pose == 'carry':   # basket on the head
        out.append(path(curve(TP(T, [(-10, -102), (14, -102), (12, -112), (-8, -112)])), '#C9A060', INK, sw))
        out.append(line(TP(T, [(-9, -107), (13, -107)]), '#8A6430', max(1.5, 2 * k)))
    if staff:
        a, b = staff; out += bar([T(a), T(b)], '#6E4426', max(2, 3 * k), sw * .7)
    if tool == 'pick':   # a pick raised over the head
        out += bar([T((10, -104)), T((-8, -116))], '#6E4426', max(2, 2.6 * k), sw * .7)
        out.append(path(curve(TP(T, [(-16, -108), (-8, -118), (0, -124)]), False), 'none', '#5E5A5A', max(2.5, 4 * k)))
    if rim:
        out.append(path(curve(TP(T, [(9, -96), (11, -90), (11, -84)]), False), 'none', rim, max(1.5, 2.5 * k), 'opacity=".9"'))
        out.append(path(curve(TP(T, [(9, -75), (11, -64), (10, -52), (12, -32), (14, -14)]), False), 'none', rim, max(1.5, 2.5 * k), 'opacity=".75"'))
    return out, A

ELE = [(-64, -72), (-58, -88), (-40, -100), (-10, -104), (14, -102), (26, -108), (40, -114), (54, -108), (62, -96),
       (66, -80), (68, -60), (68, -36), (70, -18), (76, -8), (72, -3), (64, -10), (60, -24), (58, -46), (56, -62),
       (48, -64), (40, -58), (34, -50), (30, -40), (10, -35), (-20, -35), (-46, -38), (-58, -48), (-66, -60)]
def elephant(ox, oy, k, f=1, rim=None, sw=None, mahout=True):
    """an Indian elephant in profile (local: feet at 0, back at -104, trunk tip at x 76); returns (elements, anchors)"""
    sw = sw or (3 if k > 1.6 else 2.5)
    T = tf(ox, oy, k, f); out = []; A = {}
    body, dark, ear = '#857F86', '#625C66', '#756E78'
    out.append(ell(ox, oy + 2, 80 * k, 7 * k, '#2A140C', 'opacity=".25"'))
    for cl in ([(10, -46, 9), (9, -20, 8.5), (8, -4, 9.5)], [(-34, -48, 10), (-33, -20, 8.5), (-32, -4, 9.5)]):
        out.append(poly(TP(T, limb(cl, 10)), dark, INK, sw))
    for cl in ([(22, -46, 10), (24, -20, 9), (25, -4, 10)], [(-46, -50, 12), (-45, -20, 9), (-45, -4, 10)]):
        out.append(poly(TP(T, limb(cl, 11)), body, INK, sw))
        x = cl[-1][0]; out.append(marks([(T((x + d, -1)), T((x + d, -5))) for d in (-4, 2, 8)], '#E8E0D8', max(1.5, 2 * k)))   # toenails
    out += bar(TP(T, [(-64, -72), (-70, -52), (-70, -38)]), dark, max(2, 3 * k), sw * .7)   # tail
    out.append(path(curve(TP(T, ELE)), body, INK, sw))
    out.append(path(curve(TP(T, [(-50, -42), (0, -38), (28, -44), (24, -52), (-10, -48), (-50, -50)])), dark, 'none', 0, 'opacity=".45"'))
    out.append(path(curve(TP(T, [(24, -98), (36, -102), (42, -88), (40, -70), (32, -58), (22, -60), (18, -76), (19, -92)])), ear, INK, sw))
    out.append(marks([(T((64, y)), T((60, y + 1))) for y in range(-56, -14, 8)], '#5E5862', max(1.2, 1.6 * k)))   # trunk creases
    out.append(path(curve(TP(T, [(56, -62), (64, -58), (72, -48), (66, -52)]), False) + ' Z', '#F4EEE4', INK, sw * .8))   # tusk
    A['strap'] = T((26, -72)); A['rear'] = T((-60, -62)); A['back'] = T((-8, -104))
    if rim:
        out.append(path(curve(TP(T, [(26, -106), (40, -113), (54, -107), (62, -96), (66, -80), (68, -56)]), False), 'none', rim, max(2, 3 * k), 'opacity=".8"'))
    if mahout:   # the driver on its neck
        m, _ = figure(*T((18, -100)), k * .55, f, robe='#E9DDC8', head='turban', wrap='#C4472E', pose='hold', sw=2)
        out += m[1:]
    return out, A

def stack(x, base, n, rx=24, ry=8, t=9, sw=2):
    """a stack of n gold coins standing on (x, base)"""
    out = []
    if n <= 0: return out
    top = base - t * n
    out.append(path(f'M{x - rx:.1f},{top:.1f} L{x - rx:.1f},{base:.1f} A{rx:.1f},{ry:.1f} 0 0 0 {x + rx:.1f},{base:.1f} L{x + rx:.1f},{top:.1f} Z', '#D9A441', INK, sw))
    out.append(path(' '.join(f'M{x - rx:.1f},{top + t * i:.1f} A{rx:.1f},{ry:.1f} 0 0 0 {x + rx:.1f},{top + t * i:.1f}' for i in range(1, n)), 'none', GOLD_D, 1.5))
    out.append(ell(x, top, rx, ry, GOLD, f'stroke="{INK}" stroke-width="{sw}"'))
    out.append(ell(x - rx * .25, top - ry * .2, rx * .45, ry * .35, '#FFE6A0', 'opacity=".8"'))
    out.append(line([(x + rx * .55, top + 3), (x + rx * .55, base + ry * .6)], '#FFE6A0', 2.5, 'opacity=".55"'))
    return out
def coin(x, y, r=14, tilt=.45, sw=2):
    return [ell(x, y + 2.5, r, r * tilt, GOLD_D, f'stroke="{INK}" stroke-width="{sw}"'), ell(x, y, r, r * tilt, GOLD, f'stroke="{INK}" stroke-width="{sw}"'),
            ell(x - r * .25, y - r * tilt * .2, r * .4, r * tilt * .3, '#FFE6A0', 'opacity=".85"')]

# ---------------- the Treasury (Al-Khazneh), front elevation ----------------
def treasury(cx, by, k, pal, sw=2.5, carve=None, rnd=None, marks_=True):
    """local units: facade 100 wide (x ±50), base at y 0, the urn's top at y -162.
    carve: a local y; everything below it is still raw rock with a work ledge on top (carved from the top down)"""
    T = lambda p: (cx + p[0] * k, by + p[1] * k)
    def Rr(x0, y0, x1, y1, fill, s=sw, extra=''): return poly([T((x0, y0)), T((x1, y0)), T((x1, y1)), T((x0, y1))], fill, INK, s, extra)
    def col(x, y0, y1, hw, cap=4):
        o = [Rr(x - hw, y1, x + hw, y0 - cap, pal['lit']),
             poly([T((x + hw * .35, y1)), T((x + hw - .3, y1)), T((x + hw - .3, y0 - cap)), T((x + hw * .35, y0 - cap))], pal['shade'], 'none', 0, 'opacity=".55"'),
             Rr(x - hw - 1, y0 - cap, x + hw + 1, y0, pal['lit'], sw * .8),   # capital
             line([T((x - hw - .5, y0 - cap * .45)), T((x + hw + .5, y0 - cap * .45))], pal['mould'], max(1.2, sw * .6)),
             Rr(x - hw - 1, y1, x + hw + 1, y1 + 1.6, pal['lit'], sw * .8)]   # base
        return o
    out = []
    # the cut in the cliff: dark recess behind the upper storey
    out.append(path(curve([T(p) for p in [(-56, -86), (-57, -132), (-50, -156), (-26, -166), (0, -170), (26, -166), (50, -156), (57, -132), (56, -86)]], False) + ' Z', pal['recess'], INK, sw))
    # ---- upper storey ----
    out.append(Rr(-54, -90, 54, -86, pal['lit']))
    for s in (-1, 1):
        x0, x1 = sorted((s * 50, s * 22))
        out.append(Rr(x0, -128, x1, -90, pal['shade']))
        out.append(Rr(x0 + 8, -120, x1 - 8, -98, pal['mid'], sw * .8))   # relief niche
        out.append(path(curve([T((s * 36 - 2.4, -101)), T((s * 36 - 1, -112)), T((s * 36 + 2, -116)), T((s * 36 + 2.6, -104)), T((s * 36, -100))]), pal['shade'], 'none', 0, 'opacity=".8"'))
        for x in (s * 47, s * 25): out += col(x, -124, -91, 2.6)
        out.append(Rr(x0 - 2, -134, x1 + 1, -128, pal['lit']))
        out.append(line([T((x0 - 2, -131)), T((x1 + 1, -131))], pal['mould'], max(1.2, sw * .6)))
        hp = [(s * 52, -134), (s * 21, -134), (s * 21, -146)]   # the broken pediment: each half rises toward the tholos
        out.append(poly([T(p) for p in hp], pal['lit'], INK, sw))
        out.append(poly([T(p) for p in [(s * 45, -135.5), (s * 23, -135.5), (s * 23, -143)]], pal['mid'], INK, sw * .6))
        for ax, ay in ((s * 21, -146), (s * 52, -134)):   # acroteria
            out.append(poly([T((ax - 2.5, ay)), T((ax - 2, ay - 4)), T((ax, ay - 6)), T((ax + 2, ay - 4)), T((ax + 2.5, ay))], pal['lit'], INK, sw * .7))
    # tholos: drum, columns, entablature, tent roof, urn
    out.append(Rr(-15, -128, 15, -90, pal['shade']))
    for x, hw in ((-11.5, 2.2), (-4, 2.4), (4, 2.4), (11.5, 2.2)): out += col(x, -124, -91, hw)
    out.append(Rr(-16, -134, 16, -128, pal['lit']))
    out.append(path(curve([T(p) for p in [(-16, -134), (-12, -142), (-6, -149), (6, -149), (12, -142), (16, -134)]], False) + ' Z', pal['lit'], INK, sw))
    out.append(marks([(T((x * .4, -148)), T((x, -135))) for x in (-11, -5, 0, 5, 11)], pal['mould'], max(1, sw * .5), 'opacity=".7"'))
    out.append(path(curve([T(p) for p in [(-3, -149), (-4.5, -154), (-3, -159), (0, -162), (3, -159), (4.5, -154), (3, -149)]]), pal['mid'], INK, sw * .8))
    # ---- attic between the storeys, and the lower entablature ----
    out.append(Rr(-52, -86, 52, -68, pal['mid']))
    out.append(Rr(-52, -68, 52, -60, pal['lit']))
    out.append(line([T((-52, -65)), T((52, -65))], pal['mould'], max(1.2, sw * .6)))
    for (x, y), _ in along([T((-48, -63.5)), T((48, -63.5))], 16)[1:-1]:   # frieze rosettes
        out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{max(1.5, .9 * k):.1f}" fill="none" stroke="{pal["mould"]}" stroke-width="{max(1, sw * .5):.1f}"/>')
    out.append(poly([T(p) for p in [(-36, -68), (36, -68), (0, -83)]], pal['lit'], INK, sw))   # pediment
    out.append(poly([T(p) for p in [(-29, -70), (29, -70), (0, -80)]], pal['mid'], INK, sw * .6))
    for ax, ay in ((0, -83), (-36, -68), (36, -68)):
        out.append(poly([T((ax - 3, ay)), T((ax - 2.4, ay - 4.5)), T((ax, ay - 7)), T((ax + 2.4, ay - 4.5)), T((ax + 3, ay))], pal['lit'], INK, sw * .7))
    # ---- lower storey: back wall, door, side reliefs, six columns, steps ----
    out.append(Rr(-50, -60, 50, -2, pal['mid']))
    out.append(Rr(-20, -60, 20, -2, pal['shade'], sw, 'opacity=".85"'))   # the vestibule in shadow
    out.append(Rr(-6, -40, 6, -2, pal['door']))
    out.append(Rr(-7.5, -43, 7.5, -40, pal['lit'], sw * .8))
    for s in (-1, 1):
        x0, x1 = sorted((s * 33, s * 41))
        out.append(Rr(x0, -44, x1, -14, pal['shade'], sw * .8))
        out.append(path(curve([T((s * 37 - 2, -18)), T((s * 37 - 2.5, -32)), T((s * 37, -38)), T((s * 37 + 2.5, -30)), T((s * 37 + 2, -18))]), pal['mid'], 'none', 0, 'opacity=".8"'))
    for x in (-44, -30, -12, 12, 30, 44): out += col(x, -55, -3, 3)
    out.append(Rr(-56, -2, 56, 2, pal['lit']))
    # ---- unfinished: the lower storey is still the cliff ----
    if carve is not None:
        rnd = rnd or random.Random(5)
        top = [(-60, carve)] + [(x, carve + rnd.uniform(-.6, .6)) for x in range(-50, 51, 10)] + [(60, carve)]
        rock = [T(p) for p in top] + [T((60, 2)), T((-60, 2))]
        out.append(poly(rock, pal['raw'], 'none', 0))   # the same stone as the cliff round it: no outline at the sides
        if marks_: out += carve_marks(cx, by, k, pal, carve, rnd, sw)
    return out
def carve_marks(cx, by, k, pal, carve, rnd, sw=2.5):
    """the work on the raw lower storey: strata, chisel marks under the ledge, setting-out lines, the ledge itself"""
    T = lambda p: (cx + p[0] * k, by + p[1] * k); out = []
    cut = []   # chisel marks on the freshly cut band under the ledge (generated diagonal ticks, thinning out downwards)
    for _ in range(150):
        x = rnd.uniform(-52, 52); y = carve + 2.5 + rnd.random() ** 1.8 * 16
        cut.append((T((x, y)), T((x + 1.4, y + 2.2))))
    out.append(marks(cut, pal['raw_d'], max(1.5, .42 * k), 'opacity=".75"'))
    guide = []   # the masons' setting-out lines for the columns still to come
    for x in (-44, -30, -12, 12, 30, 44):
        for y in range(int(carve) + 18, -4, 7): guide.append((T((x - 3, y)), T((x - 3, y + 3.5)))); guide.append((T((x + 3, y)), T((x + 3, y + 3.5))))
    for a, b in (((-36, -68), (0, -83)), ((0, -83), (36, -68)), ((-52, -68), (52, -68)), ((-52, -60), (52, -60)), ((-6, -40), (6, -40))):
        n = max(1, int(math.dist(a, b) / 7))
        guide += [(T(lerp(a, b, i / n)), T(lerp(a, b, (i + .5) / n))) for i in range(n)]
    out.append(marks(guide, '#FFF4E4', max(2.5, .6 * k), 'opacity=".85"'))
    out.append(poly([T((-54, carve - .3)), T((54, carve - .3)), T((54, carve + 2)), T((-54, carve + 2))], pal['ledge'], 'none', 0))   # the ledge's lit top
    out.append(line([T((-56, carve - .3)), T((56, carve - .3))], INK, sw))
    out.append(line([T((-54, carve + 2)), T((54, carve + 2))], pal['raw_d'], max(1.5, sw * .7)))
    return out

# ---------------- the Taj, front elevation ----------------
def taj(cx, by, k, pal, sw=2.5, build=None, detail=True):
    """local units: main block 200 wide (x ±100), plinth top at y 0, finial tip at -232.
    build: None (finished) or dict(dome=y, clad=y, mina=y, fmina=y) for the building site (brick core, part-clad)"""
    T = lambda p: (cx + p[0] * k, by + p[1] * k)
    def Rr(x0, y0, x1, y1, fill, s=sw, extra=''): return poly([T((x0, y0)), T((x1, y0)), T((x1, y1)), T((x0, y1))], fill, INK, s, extra)
    out = []
    def minaret(x, base, kk, cut=None, far=False):
        """a minaret at local x; kk scales it; cut = local height where building stopped"""
        o = []; m = lambda p: (cx + (x + p[0] * kk) * k, by + (base + p[1] * kk) * k)
        hw = lambda y: 6.5 - 1.5 * (-y / 100)
        top = -100 if cut is None else cut
        sh, md, lt = (pal['fshade'], pal['fmid'], pal['flit']) if far else (pal['shade'], pal['mid'], pal['lit'])
        sl, sr = [m((-hw(0), 0)), m((-hw(top), top))], [m((hw(0), 0)), m((hw(top), top))]
        o.append(poly([sl[0], sl[1], sr[1], sr[0]], md, 'none', 0))
        o.append(poly([sl[0], sl[1], lerp(sl[1], sr[1], .3), lerp(sl[0], sr[0], .3)], sh, 'none', 0))
        o.append(poly([lerp(sl[0], sr[0], .62), lerp(sl[1], sr[1], .62), sr[1], sr[0]], lt, 'none', 0))
        if build and cut is not None:   # the raw brick above the cladding
            cy_ = build.get('mclad', top * .55)
            o.append(poly([m((-hw(cy_), cy_)), m((-hw(top), top)), m((hw(top), top)), m((hw(cy_), cy_))], pal['brick'], 'none', 0))
            o.append(marks([(m((-hw(y), y)), m((hw(y), y))) for y in range(int(cy_) - 3, int(top), -3)], pal['brick_d'], 1.2, 'opacity=".6"'))
        if detail:
            o.append(marks([(m((-hw(y), y)), m((hw(y), y))) for y in range(-8, int(top), -8) if not (build and cut is not None and y < build.get('mclad', top * .55))], '#00000022', 1.2))
        o.append(poly([sl[0], sl[1], sr[1], sr[0]], 'none', INK, sw * (.8 if far else 1)))
        for yb in (-34, -67, -100):
            if yb < top - .5: continue
            w0 = hw(yb) + 3
            o.append(poly([m((-w0, yb - 3)), m((w0, yb - 3)), m((w0, yb)), m((-w0, yb))], md, INK, sw * .8))
            o.append(poly([m((-w0 + 1, yb)), m((w0 - 1, yb)), m((w0 - 2.5, yb + 3)), m((-w0 + 2.5, yb + 3))], sh, INK, sw * .6))
        if cut is None:
            o.append(poly([m((-6, -100)), m((6, -100)), m((6, -110)), m((-6, -110))], md, INK, sw * .8))
            o.append(poly([m((1, -100)), m((6, -100)), m((6, -110)), m((1, -110))], lt, 'none', 0))
            if detail:
                for a in (-3, 0, 3): o.append(path(arch_d(m((a - 1.2, 0))[0], m((a + 1.2, 0))[0], m((0, -106))[1], m((0, -108.5))[1], m((0, -101))[1]), pal['open'], 'none', 0))
            o.append(poly([m((-8, -110)), m((8, -110)), m((7, -112.5)), m((-7, -112.5))], pal['band'], INK, sw * .7))
            o += dome(m((0, 0))[0], m((0, -112.5))[1], m((0, -124))[1], 6 * kk * k, 7 * kk * k, m((0, -116))[1], md, lt, sh, sw * .8)
            o.append(line([m((0, -124)), m((0, -131))], INK, max(1.5, sw * .8)))
        return o
    b = build or {}
    # far minarets (behind), then the drum and dome
    for s in (-1, 1): out += minaret(s * 146, -4, .9, b.get('fmina'), far=True)
    if build is None or b.get('dome') is not None:
        out.append(Rr(-40, -122, 40, -98, pal['drum']))
        if detail:
            for kq in range(-3, 4):
                x = 38 * math.sin(math.radians(kq * 24)); w = 4.5 * math.cos(math.radians(kq * 24))
                out.append(path(arch_d(T((x - w, 0))[0], T((x + w, 0))[0], T((0, -110))[1], T((0, -116))[1], T((0, -102))[1]), 'none', pal['frame'], max(1, sw * .6), 'opacity=".8"'))
    if build is None:
        out += dome(cx, by - 121 * k, by - 200 * k, 46 * k, 53 * k, by - 150 * k, pal['dome_m'], pal['dome_l'], pal['dome_s'], sw * 1.1)
        if detail:
            for y in (-135, -155, -172): out.append(path(f'M{cx - 44 * k:.1f},{by + y * k:.1f} Q{cx:.1f},{by + (y + 6) * k:.1f} {cx + 44 * k:.1f},{by + y * k:.1f}', 'none', pal['frame'], max(1, sw * .5), 'opacity=".35"'))
        out.append(path(f'M{cx - 7 * k:.1f},{by - 200 * k:.1f} Q{cx:.1f},{by - 206 * k:.1f} {cx + 7 * k:.1f},{by - 200 * k:.1f} Z', pal['band'], INK, sw * .8))
        out.append(line([T((0, -203)), T((0, -226))], INK, max(2, 1.6 * k)))
        for y, r in ((-210, 2.2), (-216, 2.8), (-221, 1.6)): c = T((0, y)); out.append(f'<circle cx="{c[0]:.1f}" cy="{c[1]:.1f}" r="{r * k:.1f}" fill="{pal["band"]}" stroke="{INK}" stroke-width="{max(1, sw * .5):.1f}"/>')
    elif b.get('dome') is not None:   # the dome rising in brick: the profile up to the course being laid
        yc = b['dome']; prof = dome_side(0, -121, -200, 46, 53, -150)
        def half(y):   # half-width of the finished dome at local y (from the Catmull-Rom points, linear is enough here)
            P = prof[:]
            for (x0, y0), (x1, y1) in zip(P, P[1:]):
                if y1 <= y <= y0: return x0 + (x1 - x0) * (y - y0) / (y1 - y0)
            return 0
        ys = [y for y in range(-121, int(yc) - 1, -3)] + [yc]
        right = [(half(y), y) for y in ys]; left = [(-x, y) for x, y in right][::-1]
        out.append(poly([T(p) for p in right + left], pal['brick'], INK, sw * 1.1))
        out.append(marks([(T((-half(y) + 1, y)), T((half(y) - 1, y))) for y in range(-124, int(yc), -4)], pal['brick_d'], max(1, .7 * k), 'opacity=".7"'))
        out.append(poly([T((half(yc), yc)), T((-half(yc), yc)), T((-half(yc) + 2, yc - 2.5)), T((half(yc) - 2, yc - 2.5))], pal['brick_d'], INK, sw * .7))   # the course being laid
    # chhatris on the roof
    for s in (-1, 1):
        ax = s * 66
        if build is None:
            out.append(Rr(ax - 14, -94, ax + 14, -80, pal['mid']))
            out.append(poly([T((ax + 3, -94)), T((ax + 14, -94)), T((ax + 14, -80)), T((ax + 3, -80))], pal['lit'], 'none', 0))
            if detail:
                for a in (-8, 0, 8): out.append(path(arch_d(T((ax + a - 2.6, 0))[0], T((ax + a + 2.6, 0))[0], T((0, -88))[1], T((0, -91.5))[1], T((0, -81))[1]), pal['open'], INK, max(1, sw * .5)))
            out.append(Rr(ax - 14, -94, ax + 14, -80, 'none'))
            out.append(poly([T((ax - 17, -94)), T((ax + 17, -94)), T((ax + 15, -96.5)), T((ax - 15, -96.5))], pal['band'], INK, sw * .8))
            out += dome(T((ax, 0))[0], by - 96.5 * k, by - 116 * k, 12 * k, 14 * k, by - 102 * k, pal['mid'], pal['lit'], pal['shade'], sw * .9)
            out.append(line([T((ax, -116)), T((ax, -122))], INK, max(1.5, sw * .8)))
        else:
            out.append(Rr(ax - 14, -86, ax + 14, -80, pal['brick']))
    # ---- the facade ----
    clad = b.get('clad', -999)
    out.append(Rr(-100, -80, -78, 0, pal['chamL']))
    out.append(Rr(78, -80, 100, 0, pal['chamR']))
    out.append(poly([T(p) for p in [(-78, 0), (-78, -80), (-36, -80), (-36, -100), (36, -100), (36, -80), (78, -80), (78, 0)]], pal['face'], INK, sw))
    if build:   # brick core above the cladding line
        out.append(poly([T(p) for p in [(-100, clad), (-100, -80), (-36, -80), (-36, -100), (36, -100), (36, -80), (100, -80), (100, clad)]], pal['brick'], INK, sw))
        out.append(marks([(T((-99, y)), T((99, y))) for y in range(int(clad) - 4, -80, -4)] + [(T((-35, y)), T((35, y))) for y in range(-82, -100, -4)], pal['brick_d'], max(1, .7 * k), 'opacity=".55"'))
        out.append(line([T((-100, clad)), T((100, clad))], INK, sw))
    if detail:
        out.append(poly([T((-30, -96)), T((30, -96)), T((30, 0)), T((-30, 0))], 'none', pal['frame'], max(1.2, sw * .7)))
    # the great iwan and the two storeys of side arches
    out.append(path(arch_d(*[T((x, 0))[0] for x in (-25, 25)], T((0, -62))[1], T((0, -88))[1], T((0, 0))[1]), pal['recess'], INK, sw * 1.1))
    out.append(path(arch_d(*[T((x, 0))[0] for x in (-19, 19)], T((0, -54))[1], T((0, -74))[1], T((0, 0))[1]), pal['deep'], INK, sw * .7))
    if detail:
        out.append(path(arch_d(*[T((x, 0))[0] for x in (-7, 7)], T((0, -18))[1], T((0, -26))[1], T((0, 0))[1]), pal['door'], INK, sw * .7))
        out.append(path(arch_d(*[T((x, 0))[0] for x in (-8, 8)], T((0, -44))[1], T((0, -52))[1], T((0, -34))[1]), pal['open'], INK, sw * .6))
    for s in (-1, 1):
        for xc, hw_ in ((s * 57, 13), (s * 89, 7)):
            fill = pal['recess'] if abs(xc) < 80 else (pal['openL'] if s < 0 else pal['openR'])
            for spring, apex, bot in ((-60, -73, -44), (-24, -37, 0)):
                if build and apex < clad and bot < clad:   # not clad yet: the opening is a plain brick arch
                    out.append(path(arch_d(T((xc - hw_, 0))[0], T((xc + hw_, 0))[0], T((0, spring))[1], T((0, apex))[1], T((0, bot))[1]), pal['brick_d'], INK, sw * .8))
                    continue
                out.append(path(arch_d(T((xc - hw_, 0))[0], T((xc + hw_, 0))[0], T((0, spring))[1], T((0, apex))[1], T((0, bot))[1]), fill, INK, sw * .9))
                if bot < -10: out.append(Rr(xc - hw_ - 1.5, bot, xc + hw_ + 1.5, bot + 2.5, pal['band'], sw * .6))
    # pinnacles (guldastas)
    if build is None:
        for s in (-1, 1):
            for ax, tip in ((s * 36, -114), (s * 78, -94), (s * 100, -92)):
                out.append(Rr(ax - 2, tip + 4, ax + 2, -80 if abs(ax) > 40 else -100, pal['mid'], sw * .7))
                out.append(poly([T((ax - 3, tip + 5)), T((ax, tip)), T((ax + 3, tip + 5))], pal['band'], INK, sw * .6))
    # plinth
    out.append(Rr(-185, 0, 185, 20, pal['plinth']))
    out.append(Rr(-185, 0, 185, 3, pal['plinth_top'], sw * .8))
    if detail:
        out.append(marks([(T((x, 3)), T((x, 20))) for x in range(-175, 185, 22)], pal['frame'], max(1, sw * .5), 'opacity=".5"'))
    for s in (-1, 1): out += minaret(s * 172, 0, 1, b.get('mina'))
    return out

def scaffold(x0, x1, base, top_at, step=22, ledger=26, wood='#8A5A32', sw=2):
    """timber poles lashed into a grid; top_at(x) gives each pole's top (so the scaffold can hug a dome)"""
    out = []; poles = []; x = x0
    while x <= x1 + .1: poles.append((x, top_at(x))); x += step
    lw = 4
    for x, t in poles: out += bar([(x, base), (x, t)], wood, lw, sw * .7)
    y = base - ledger * .6; segs = []
    while y > min(t for _, t in poles):
        xs = [x for x, t in poles if t <= y + 2]
        if len(xs) > 1:
            out += bar([(xs[0] - 6, y), (xs[-1] + 6, y)], wood, 3.5, sw * .6)
            for xa, xb in zip(xs, xs[1:]):
                if random.Random(int(xa * 7 + y)).random() < .35: segs.append(((xa, y), (xb, y - ledger)))
            out.append(marks([((x - 3, y - 3), (x + 3, y + 3)) for x in xs], '#4A2E1A', 2))   # lashings
        y -= ledger
    if segs: out.append(marks(segs, '#6E4426', 3, 'opacity=".9"'))
    return out

# ---------------- the emperor, as a silhouette ----------------
# a Mughal profile (as in the court portraits): wrapped turban with a jewelled plume, beard, fitted jama flaring from the
# waist, sash, slippers. The head (with turban) is drawn upright and turned about the nape, so it can bow.
EMP_HEAD = [(-3, -79), (-5, -85), (-5, -91), (2, -95), (9, -94), (11, -90), (11.4, -87.6), (12.4, -86.2), (11.3, -85), (11.2, -83),
            (12, -81), (11.2, -77.5), (7, -76), (4, -77)]
EMP_TURBAN = [(-6.5, -90), (-7.5, -95), (-5, -100), (1, -103), (8, -102.5), (12.5, -99), (13, -94), (11.5, -91.5), (5, -91), (-1, -90)]
EMP_PLUME = [(7.5, -102), (8.6, -106), (7.5, -110.5), (4.5, -113.5), (6.4, -109.5), (6.6, -105.5)]
EMP_BODY = [(-3, -80), (-8, -76.5), (-10, -68), (-9.5, -58), (-8, -51), (-11, -44), (-15, -32), (-18, -20), (-20, -13), (-6, -11.5),
            (8, -11.5), (19, -13), (15, -26), (12, -38), (10, -47), (9.5, -51), (11, -60), (11, -68), (9, -74), (5, -77.5), (3, -80)]
def emp_head(T, pivot, bow, fill, rim, k, sw):
    """head, turban and plume, turned `bow` degrees forward about the nape"""
    R_ = lambda ps: TP(T, rot([(x - pivot[0], y - pivot[1]) for x, y in ps], bow, *pivot))
    out = [path(curve(R_(EMP_HEAD)), fill, INK, sw), path(curve(R_(EMP_TURBAN)), fill, INK, sw), path(curve(R_(EMP_PLUME)), fill, INK, sw * .8)]
    out.append(path(curve(R_([(-6, -93.5), (2, -97.5), (12.5, -98)]), False), 'none', '#4A3840', max(1.5, .45 * k)))   # the turban's wraps
    out.append(path(curve(R_([(-5.5, -97.5), (3, -101.5), (10, -101.5)]), False), 'none', '#4A3840', max(1.5, .45 * k)))
    j = R_([(8.2, -101.5)])[0]; out.append(f'<circle cx="{j[0]:.1f}" cy="{j[1]:.1f}" r="{max(2, .9 * k):.1f}" fill="{rim or "#6A5058"}" opacity=".9"/>')   # the jewel
    if rim:
        out.append(path(curve(R_([(12.5, -99), (13, -94), (11.5, -91.5)]), False), 'none', rim, max(2, .55 * k), 'opacity=".9"'))
        out.append(path(curve(R_([(11, -90), (11.4, -87.6), (12.4, -86.2), (11.3, -85), (11.2, -83), (12, -81), (11.2, -77.5)]), False), 'none', rim, max(2.5, .6 * k), 'opacity=".95"'))
        out.append(path(curve(R_([(8.6, -106), (7.5, -110.5), (4.5, -113.5)]), False), 'none', rim, max(1.5, .35 * k), 'opacity=".85"'))
    return out
def emperor_stand(ox, oy, k, f=1, fill='#1F161A', rim='#F3B47C', sw=3, bow=22):
    """Shah Jahan in mourning: standing, hands clasped, head bowed (local: feet at 0, turban top near -103)"""
    T = tf(ox, oy, k, f); out = []
    out.append(ell(ox, oy + 2, 30 * k, 3 * k, '#120A0A', 'opacity=".35"'))
    for leg, foot in (([(-4, -12), (-3.5, -2)], [(-6, -1), (-2, -3), (6, -1.5), (9, -3), (6, 0), (-6, 0)]),
                      ([(3, -12), (4, -2)], [(1, -1), (5, -3.5), (13, -2), (17, -4.5), (14, 0), (1, 0)])):
        out += bar(TP(T, leg), fill, max(3, 2.6 * k), sw * .8); out.append(path(curve(TP(T, foot)), fill, INK, sw * .8))
    out.append(path(curve(TP(T, EMP_BODY)), fill, INK, sw))
    out.append(path(curve(TP(T, [(9, -51), (11.5, -40), (13, -28), (10, -28), (8.5, -40)])), '#2C2028', INK, sw * .5))   # sash end
    out.append(line(TP(T, [(-8, -51), (9.5, -51)]), '#3A2A30', max(2, .55 * k)))   # waist tie
    out.append(path(curve(TP(T, [(-2, -76), (2, -67), (4, -61), (11, -57.5), (13, -54.5), (6, -54), (-1, -60), (-6, -70)])), '#281C22', INK, sw * .7))   # arm, hands clasped
    out += emp_head(T, (2, -79), bow, fill, rim, k, sw)
    if rim:   # the warm light on his front
        out.append(path(curve(TP(T, [(9, -74), (11, -68), (11, -60), (10.5, -55)]), False), 'none', rim, max(2, .5 * k), 'opacity=".8"'))
        out.append(path(curve(TP(T, [(11, -57.5), (13, -54.5)]), False), 'none', rim, max(2, .5 * k), 'opacity=".85"'))
        out.append(path(curve(TP(T, [(10, -47), (12, -38), (15, -26), (19, -13)]), False), 'none', rim, max(2, .5 * k), 'opacity=".8"'))
        out.append(line(TP(T, [(13, -2), (17, -4.5)]), rim, max(1.5, .4 * k), 'opacity=".8"'))
    return out

EMP_SEAT = [(-3, -63), (-9, -58), (-13, -49), (-14.5, -36), (-14.5, -22), (-16, -8), (-15, 0), (28, 1), (32, -6), (28, -13), (18, -15.5),
            (10, -16.5), (9, -26), (10, -38), (9.5, -48), (7, -56), (4, -60), (2, -63)]
def emperor_seat(ox, oy, k, f=1, fill='#1C1316', rim='#F6B77C', sw=3, bow=6):
    """the old emperor seated on a cushion, gazing out, a staff in his hand (local: seat at y 0, turban top near -86)"""
    T = tf(ox, oy, k, f); out = []
    out.append(path(curve(TP(T, [(-26, 0), (-24, -9), (-12, -12), (30, -12), (38, -8), (38, 4), (30, 8), (-22, 8)])), '#2E1A1A', INK, sw))   # cushion
    out.append(path(curve(TP(T, [(-27, -34), (-19, -36), (-17, -24), (-18, -2), (-27, -2), (-30, -18)])), '#2E1A1A', INK, sw))   # bolster
    out.append(path(curve(TP(T, EMP_SEAT)), fill, INK, sw))
    out += bar(TP(T, [(33, 6), (29, -74)]), '#2A1A16', max(3, .9 * k), sw * .8)   # staff
    c = T((29, -75)); out.append(f'<circle cx="{c[0]:.1f}" cy="{c[1]:.1f}" r="{2 * k:.1f}" fill="#2A1A16" stroke="{INK}" stroke-width="{sw * .8}"/>')
    out.append(path(curve(TP(T, [(-1, -56), (5, -46), (18, -43), (29, -45), (30.5, -41), (18, -38), (4, -39), (-5, -48)])), '#281C21', INK, sw * .7))   # arm to the staff
    Tq = lambda p: T((p[0], p[1] + 16))   # the head sits 16 units lower than on the standing figure
    out += emp_head(Tq, (2, -79), bow, fill, rim, k, sw)
    if rim:
        out.append(path(curve(TP(T, [(9.5, -48), (10, -38), (9, -26)]), False), 'none', rim, max(2, .5 * k), 'opacity=".75"'))
        out.append(path(curve(TP(T, [(18, -15.5), (28, -13), (32, -6)]), False), 'none', rim, max(2, .55 * k), 'opacity=".85"'))
        out.append(path(curve(TP(T, [(29, -45), (30.5, -41)]), False), 'none', rim, max(2, .5 * k), 'opacity=".85"'))
        out.append(line(TP(T, [(30.6, -68), (32, 4)]), rim, max(1.5, .35 * k), 'opacity=".8"'))
    return out

# ---------------- shared palettes ----------------
PETRA_LIT = dict(lit='#F5B690', mid='#E99C76', shade='#C47258', recess='#7A3328', door='#4A2018', mould='#B85E46',
                 raw='#DD9370', raw_d='#A85A44', ledge='#FAD0A8')
def rock_strata(clip, x0, x1, y0, y1, n, cols, rnd, slope=0., amp=14, sw=(10, 30), op=(.35, .7)):
    """Petra sandstone: wavy coloured bands (thick generated strokes) clipped to a wall"""
    out = [f'<g clip-path="url(#{clip})">']
    for i in range(n):
        y = y0 + (y1 - y0) * (i + rnd.uniform(-.35, .35)) / n; ph = rnd.uniform(0, 6); fq = rnd.uniform(.004, .01); a = amp * rnd.uniform(.5, 1.4)
        L = [(x, y + slope * (x - x0) + a * math.sin(ph + x * fq) + a * .4 * math.sin(ph * 2 + x * fq * 2.7)) for x in range(int(x0) - 40, int(x1) + 80, 40)]
        out.append(line(L, rnd.choice(cols), rnd.uniform(*sw), f'opacity="{rnd.uniform(*op):.2f}"'))
    return out
def rope(a, b, sag, color='#5A2C1E', w=2.5):
    m = lerp(a, b, .5); return path(f'M{a[0]:.1f},{a[1]:.1f} Q{m[0]:.1f},{m[1] + sag:.1f} {b[0]:.1f},{b[1]:.1f}', 'none', color, w)

# ================= 1. petra_caravan =================
def petra_caravan():
    R = random.Random(5701)
    defs = [grad('sky', [(0, '#A7C3D9'), (1, '#E4ECEA')]),
            grad('far', [(0, '#F3B28C'), (.55, '#E89A78'), (1, '#F4BC94')], 0, 40, 0, 800, True),
            grad('lw', [(0, '#A55F4C'), (.45, '#874841'), (1, '#5C2F2D')], 0, 0, 0, 900, True),
            grad('rw', [(0, '#B66B52'), (.5, '#914E43'), (1, '#663535')], 0, 0, 0, 910, True),
            grad('floor', [(0, '#F6C796'), (.1, '#DDA47C'), (.42, '#A8735A'), (1, '#6E4034')], 0, 785, 0, 1080, True),
            rgrad('pool', [(0, '#FFE6BE', .95), (.45, '#FFCB98', .45), (1, '#F6A876', 0)]),
            rgrad('spill', [(0, '#FFD0A0', .5), (.6, '#F6A878', .14), (1, '#E08A60', 0)])]
    g = [f'<rect width="{W}" height="{H}" fill="url(#sky)"/>']
    # ---- the far cliff with the Treasury, seen through the slit ----
    rim = [(1000, 70)] + [(x, 62 + 16 * math.sin(x * .02) + R.uniform(-6, 6)) for x in range(1040, 1640, 40)] + [(1660, 50)]
    g.append(poly(rim + [(1660, 800), (1000, 800)], 'url(#far)', '#9A5A44', 2.5))
    for i in range(16):   # fine strata on the far cliff
        y0 = 90 + i * 44 + R.uniform(-10, 10); L = [(x, y0 + 8 * math.sin(x * .012 + i) + (x - 1300) * .05) for x in range(1000, 1680, 40)]
        g.append(line(L, '#C9785C', 2, 'opacity=".55"'))
    g += treasury(1338, 777, 3.3, PETRA_LIT, 2.5)
    g.append(poly([(1000, 777), (1660, 777), (1660, 805), (1000, 805)], '#F7CFA2', '#B8805C', 2))
    # ---- the two walls of the Siq ----
    le = jag((1185, -10), (1085, 150), 6, 9, R)[:-1] + jag((1085, 150), (1052, 330), 5, 8, R)[:-1] + jag((1052, 330), (1100, 560), 6, 9, R)[:-1] + jag((1100, 560), (1148, 792), 6, 7, R)
    re_ = jag((1460, -10), (1585, 170), 6, 9, R)[:-1] + jag((1585, 170), (1592, 330), 4, 8, R)[:-1] + jag((1592, 330), (1540, 560), 6, 9, R)[:-1] + jag((1540, 560), (1502, 792), 6, 7, R)
    lwall = [(-10, -10)] + le + [(700, 838), (-10, 893)]
    rwall = re_ + [(1720, 846), (1930, 906), (1930, -10)]
    defs.append(f'<clipPath id="cl"><polygon points="{pts(lwall)}"/></clipPath><clipPath id="cr"><polygon points="{pts(rwall)}"/></clipPath>')
    sc = ['#B9705A', '#8A453F', '#C88464', '#6A3540', '#A35E4E', '#D9987A', '#7B3B3A']
    g.append(poly(lwall, 'url(#lw)', INK, 3))
    g += rock_strata('cl', 0, 1200, -20, 900, 30, sc, R, slope=.07, amp=16, sw=(10, 34)); g.append('</g>')
    defs.append('<radialGradient id="hang" cx="560" cy="120" r="760" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3A1A18" stop-opacity=".5"/>'
                '<stop offset=".6" stop-color="#3A1A18" stop-opacity=".22"/><stop offset="1" stop-color="#3A1A18" stop-opacity="0"/></radialGradient>')
    g.append(f'<g clip-path="url(#cl)"><rect x="0" y="0" width="1300" height="900" fill="url(#hang)"/></g>')   # the overhang keeps the upper wall in shade
    g.append(poly(rwall, 'url(#rw)', INK, 3))
    g += rock_strata('cr', 1420, 1920, -20, 920, 22, sc, R, slope=-.12, amp=14, sw=(10, 30)); g.append('</g>')
    for x0, top, wall in ((180, 40, lwall), (420, 70, lwall), (720, 120, lwall), (1760, 60, rwall)):   # long vertical joints
        y = top; L = []
        while y < 840: L.append((x0 + R.uniform(-12, 12), y)); y += R.uniform(70, 130)
        g.append(line(L, '#3E1E1C', 2.5, 'opacity=".45"'))
    # light thrown back onto the walls near the opening
    g.append(f'<g clip-path="url(#cl)">' + ell(1150, 560, 260, 420, 'url(#spill)') + '</g>')
    g.append(f'<g clip-path="url(#cr)">' + ell(1520, 520, 230, 420, 'url(#spill)') + '</g>')
    g.append(line(le, INK, 3)); g.append(line(re_, INK, 3))
    # ---- the floor: lit pool by the opening, worn paving and the rock-cut water channel ----
    floor = [(-10, 893), (700, 838), (1148, 792), (1502, 792), (1720, 846), (1930, 906), (1930, H + 10), (-10, H + 10)]
    g.append(poly(floor, 'url(#floor)', INK, 3))
    g.append(ell(1320, 806, 440, 52, 'url(#pool)'))
    pav = []
    for row in range(7):   # paving joints in perspective (generated)
        y = 860 + row * row * 6 + row * 18
        if y > H: break
        n = 6 + row * 2; w = (1920 + 200) / n
        for i in range(n):
            x = -100 + i * w + (row % 2) * w / 2 + R.uniform(-8, 8)
            pav.append(((x, y), (x + w * .8, y + R.uniform(-2, 2))))
            pav.append(((x + w * .85, y + 2), (x + w * .85 - 6 - row * 3, y + 14 + row * 5)))
    g.append(marks(pav, '#5E352C', 2, 'opacity=".28"'))
    g.append(line([(-10, 905), (700, 849), (1140, 801)], '#4A2622', 5, 'opacity=".55"'))   # the channel cut along the wall's foot
    g.append(line([(-10, 912), (700, 855), (1140, 805)], '#D59C78', 2, 'opacity=".45"'))
    track = [(120, 1010), (430, 948), (760, 885), (1050, 830), (1260, 795), (1400, 782)]
    for (x, y), _ in along(track, 70):   # hoof prints along the caravan's track (generated): flat dents with a lit far rim, larger toward the camera
        sc = (y - 760) / 260; x += R.uniform(-60, 60) * sc; rx = R.uniform(9, 15) * sc + 2; ry = rx * .32
        g.append(ell(x, y + R.uniform(-8, 14) * sc, rx, ry, '#5A3028', 'opacity=".35"'))
    # ---- the caravan, far to near ----
    rimc = '#FFD6A2'
    lead, LA = figure(1430, 780, .72, 1, robe='#2E3044', wrap='#E8DCC6', skin='#5A3828', pose='hold', rim=rimc, staff=((16, -64), (18, 0)))
    c4, A4 = camel(1290, 780, .42, 1, 'B', rim=rimc, pal=dict(body='#7E5238', dark='#5E3C2A', knee='#6E4730', cloth='#7E2E28', stripe=GOLD,
                                                                  stripe2='#2E3A5C', sack='#B89A76', sack_d='#957A5C', jar='#8E4A30', bolt='#2E6A78'))
    c3, A3 = camel(1120, 813, .68, 1, 'A', rim=rimc, pal=dict(body='#946243', dark='#6E4632', knee='#83573A', cloth='#8E3430', stripe=GOLD,
                                                                  stripe2='#34446A', sack='#CDB08A', sack_d='#A88A66', jar='#A5583A', bolt='#2E6A78'))
    t2, _ = figure(1018, 842, 1.32, 1, robe='#8E4A2E', wrap='#F0E6D2', skin='#7A4E34', pose='walk', rim=rimc, staff=((16, -60), (19, 0)))
    c2, A2 = camel(860, 858, 1.02, 1, 'B', rim=rimc)
    c1, A1 = camel(430, 936, 1.6, 1, 'A', rim=rimc)
    t1, _ = figure(764, 958, 2.15, 1, robe='#3E4A6A', wrap='#EADFC8', skin='#7E5036', pose='walk', rim=rimc, staff=((16, -62), (20, 0)))
    g += lead + c4 + [rope(A4['muzzle'], LA['hand'], 6, w=2)] + c3 + [rope(A3['muzzle'], A4['saddle_back'], 8, w=2)] + t2 + c2
    g.append(rope(A2['muzzle'], A3['saddle_back'], 14, w=2.5))
    g += c1 + [rope(A1['muzzle'], A2['saddle_back'], 22, w=3)] + t1
    # cargo labels
    g += tag(A1['sack'][0] + 4, A1['sack'][1] + 8, '乳香', 54, -4)
    g += tag(A2['sack'][0] + 4, A2['sack'][1] + 2, '香料', 44, -3)
    g += tag(A1['bolt'][0] + 14, A1['bolt'][1] - 64, '丝绸', 42, 3, hang=(A1['bolt'][0] + 6, A1['bolt'][1] - 14))
    return svg(defs, g)

# ================= 2. petra_tax =================
def petra_tax():
    R = random.Random(5702)
    defs = [grad('sky', [(0, '#A9C5DA'), (1, '#DCE6E6')]),
            grad('cliff', [(0, '#E7A27E'), (.5, '#DA8E6C'), (1, '#E9A57E')], 0, 0, 0, 840, True),
            grad('lc', [(0, '#93503F'), (.5, '#7A3F38'), (1, '#55292A')], 0, 0, 0, 900, True),
            grad('ground', [(0, '#F2C092'), (.35, '#E2A87E'), (1, '#C58664')], 0, 830, 0, 1080, True),
            rgrad('goldglow', [(0, '#FFE7A0', .8), (.5, '#F6C66A', .3), (1, '#F2B050', 0)]),
            rgrad('dust', [(0, '#FBE2C8', .8), (1, '#FBE2C8', 0)])]
    g = [f'<rect width="{W}" height="{H}" fill="url(#sky)"/>']
    # ---- the sunlit cliff with the Treasury being carved ----
    rimp = [(880, 70)] + [(x, 40 + 14 * math.sin(x * .013) + R.uniform(-6, 6)) for x in range(920, 1940, 40)]
    cliff = rimp + [(1930, 890), (880, 890)]
    defs.append(f'<clipPath id="cc"><polygon points="{pts(cliff)}"/></clipPath>')
    g.append(poly(cliff, 'url(#cliff)', '#8E4E3A', 3))
    tcx, tby, tk = 1452, 846, 4.2; ly = tby - 88 * tk   # the Treasury, and its work ledge
    tpal = dict(PETRA_LIT, raw='url(#cliff)', raw_d='#B8664C')
    g += treasury(tcx, tby, tk, tpal, 2.5, carve=-88, rnd=R, marks_=False)
    hole = [(tcx + x * tk, tby + y * tk) for x, y in [(-57, -88), (-57, -132), (-50, -156), (-26, -166), (0, -170), (26, -166), (50, -156), (57, -132), (57, -88)]]
    defs.append(f'<clipPath id="cs"><path clip-rule="evenodd" d="M{pts(cliff).replace(" ", " L")} Z {curve(hole, False)} Z"/></clipPath>')
    g += rock_strata('cs', 880, 1920, 40, 860, 20, ['#EFB08A', '#C9785C', '#D88A68', '#F3BC96', '#BC6A52'], R, slope=-.04, amp=10, sw=(6, 18), op=(.3, .6)); g.append('</g>')
    g += carve_marks(tcx, tby, tk, tpal, -88, R, 2.5)
    # rope and basket hanging from the finished storey
    g.append(line([(1640, 836 - 140 * 4.2), (1640, ly - 70)], '#6E4426', 3))
    g.append(path(curve([(1622, ly - 72), (1658, ly - 72), (1654, ly - 50), (1626, ly - 50)]), '#C9A060', INK, 2))
    g.append(line([(1624, ly - 64), (1656, ly - 64)], '#8A6430', 1.5))
    workers = [(1296, 1, 'pick', '#3E4A6A'), (1372, -1, 'carry', '#E6D8C0'), (1452, 1, 'pick', '#8E4A2E'), (1532, -1, 'pick', '#2E3044'), (1600, 1, 'walk', '#7A5A3A')]
    for x, f, pose, robe in workers:
        if pose == 'pick':   # dust where the pick bites, chips tumbling down the raw face (generated)
            g.append(ell(x + f * 14, ly + 8, 40, 14, 'url(#dust)'))
            for i in range(6):
                t = i / 5; y = ly + 14 + t * t * 210 + R.uniform(-6, 6); xx = x + f * (12 + t * 26) + R.uniform(-8, 8); s = 7.5 - t * 3.5; a = R.uniform(0, 6.28)
                g.append(poly([(xx + s * math.cos(a + q * 2.1), y + s * math.sin(a + q * 2.1) * .8) for q in range(3)], '#C26E52', INK, 1.5))
            g.append(line([(x + f * 10, ly + 18), (x + f * 22, ly + 70), (x + f * 34, ly + 150)], '#FFF0DC', 2, 'stroke-dasharray="2 12" opacity=".6"'))
        w_, _ = figure(x, ly + 1, .6, f, robe=robe, wrap='#EADFC8', skin='#7A4E34', pose=pose, tool='pick' if pose == 'pick' else None, sw=1.5)
        g += w_
    # ---- the shaded cliff on the left with the mouth of the Siq ----
    le = jag((1010, -10), (965, 260), 6, 10, R)[:-1] + jag((965, 260), (930, 600), 7, 10, R)[:-1] + jag((930, 600), (915, 870), 5, 8, R)
    lcl = [(-10, -10)] + le + [(-10, 905)]
    defs.append(f'<clipPath id="cl"><polygon points="{pts(lcl)}"/></clipPath>')
    g.append(poly(lcl, 'url(#lc)', INK, 3))
    g += rock_strata('cl', 0, 1000, -20, 900, 26, ['#A85E4C', '#7E4240', '#B8705A', '#64323A', '#93524A'], R, slope=.06, amp=14, sw=(10, 30)); g.append('</g>')
    # the mouth of the Siq: a slot open to the sky, its inner walls lit from above, its floor running back into the rock
    defs.append(grad('slot', [(0, '#E9A47C'), (.35, '#A85A44'), (.75, '#5E2C26'), (1, '#4A2220')], 0, 0, 0, 905, True))
    sl_l = jag((170, 905), (232, 520), 5, 9, R)[:-1] + jag((232, 520), (296, -10), 6, 9, R)
    sl_r = jag((392, -10), (402, 480), 6, 9, R)[:-1] + jag((402, 480), (392, 905), 5, 9, R)
    g.append(poly(sl_l + sl_r, 'url(#slot)', INK, 3))
    g.append(poly([(296, -10), (392, -10), (380, 40), (300, 40)], '#CFE0EA', 'none', 0))   # the sliver of sky
    g.append(poly([(296, -10), (336, 40), (326, 300), (304, 600), (286, 905), (170, 905)] + sl_l[::-1][1:-1], '#C27458', 'none', 0, 'opacity=".55"'))
    g.append(line([(336, 40), (326, 300), (304, 600), (286, 905)], '#3E1E1C', 2.5, 'opacity=".6"'))
    g.append(poly([(240, 905), (360, 905), (340, 800), (318, 760), (300, 790)], '#D79A74', INK, 2, 'opacity=".9"'))   # the floor going in
    g.append(line(sl_l + sl_r, INK, 3))
    # ---- the ground: sunlit plaza, the cliff's shadow over the toll point ----
    gr = [(-10, 905), (915, 872), (1930, 852), (1930, H + 10), (-10, H + 10)]
    g.append(poly(gr, 'url(#ground)', INK, 3))
    g.append(poly([(-10, 905), (915, 870), (1060, 1090), (-10, 1090)], '#6A3A30', 'none', 0, 'opacity=".32"'))
    # ---- the toll point: camel and trader from the Siq, the collector under an awning ----
    c, CA = camel(430, 936, 1.32, 1, 'B', rim='#FFD29A')
    g += c
    g += tag(CA['sack'][0] + 2, CA['sack'][1] + 4, '香料', 38, -3)
    # awning on two poles
    g += bar([(808, 935), (808, 548)], '#6E4426', 7, 2.5) + bar([(1176, 925), (1176, 548)], '#6E4426', 7, 2.5)
    aw = [(778, 520), (1206, 520), (1220, 570), (764, 570)]
    g.append(poly(aw, '#EAD9B8', INK, 3))
    for i in range(0, 8, 2):   # stripes
        x0 = 778 + i * (428 / 8); x1 = x0 + 428 / 8
        g.append(poly([(x0, 520), (x1, 520), (x1 + 1.7 * 14 * (x1 - 992) / 428, 570), (x0 + 1.7 * 14 * (x0 - 992) / 428, 570)], '#A33A2E', 'none', 0))
    g.append(poly(aw, 'none', INK, 3))
    sc_ = ' '.join(f'M{764 + i * 456 / 12:.1f},570 q{456 / 24:.1f},20 {456 / 12:.1f},0' for i in range(12))
    g.append(path(sc_, '#EAD9B8', INK, 2.5))
    # the collector, seated behind the counter, hand out
    col, CO = figure(1116, 905, 2.25, -1, robe='#4E2E5A', wrap='#F0E6D2', skin='#7A4E34', pose='give', rim='#FFD29A')
    g += col
    # the counter (stone), its plaque, coins stacking up
    g.append(poly([(820, 790), (1150, 790), (1150, 935), (820, 935)], '#B4705A', INK, 3))
    g.append(poly([(820, 880), (1150, 880), (1150, 935), (820, 935)], '#9C5A48', 'none', 0))   # the counter's foot in its own shadow
    g.append(poly([(808, 778), (1162, 778), (1162, 792), (808, 792)], '#E4A07E', INK, 3))
    g.append(marks([((x, 800), (x, 930)) for x in (930, 1040)], '#7A4234', 2, 'opacity=".5"'))
    stacks = [(848, 3), (894, 6), (940, 10), (986, 15), (1032, 21)]
    g.append(ell(990, 700, 190, 110, 'url(#goldglow)'))
    for x, n in stacks: g += stack(x, 782, n, 21, 7, 8.5, 2)
    g += tag(985, 872, '过路税', 50, 0)
    # the trader paying: a coin in the air on its way to the first stack
    tr, TA = figure(742, 936, 2.3, 1, robe='#3E4A6A', wrap='#EADFC8', skin='#7E5036', pose='give', rim='#FFD29A')
    g += tr
    hx, hy = TA['hand']
    g += coin(hx + 26, hy - 36, 14, .5) + coin(hx + 62, hy - 52, 14, .5)
    g.append(path(f'M{hx + 6:.0f},{hy - 10:.0f} Q{hx + 40:.0f},{hy - 70:.0f} {856:.0f},{782 - 3 * 8.5 - 16:.0f}', 'none', CREAM, 3, 'stroke-dasharray="2 10" opacity=".9"'))
    # the strongbox, overflowing
    g.append(poly([(1150, 868), (1262, 868), (1262, 936), (1150, 936)], '#6E3A26', INK, 3))
    g.append(poly([(1150, 868), (1262, 868), (1262, 880), (1150, 880)], '#8E5034', INK, 2.5))
    heap = []
    for i in range(46):   # coins heaped into a mound in the box (generated): back rows first, top of the mound last
        u = R.uniform(-1, 1); x = 1206 + u * 50; h = 44 * (1 - u * u); y = 870 - R.uniform(0, 1) ** .7 * h
        heap.append((y, x))
    for y, x in sorted(heap, key=lambda t: -t[0]): g += coin(x, y, 11, .45, 1.5)
    for x, y in ((1278, 930), (1296, 936), (1140, 940)): g += coin(x, y, 10, .4, 1.5)
    g.append(ell(1206, 850, 90, 40, 'url(#goldglow)'))
    return svg(defs, g)

# ================= 3. taj_build =================
TAJ_DUSK = dict(shade='#B8AAB0', mid='#E3D6CE', lit='#F5EADE', fshade='#ADA0A8', fmid='#D3C6C0', flit='#E6DAD0', band='#C2B0AA', open='#8C7C84',
                frame='#A39092', drum='#DCCEC6', dome_m='#E6D9D0', dome_l='#F8EEE2', dome_s='#B9ABB2', chamL='#C2B6BC', chamR='#F0E4D8', face='#E7DCD4',
                recess='#B2A2A6', deep='#978690', door='#4A3C44', openL='#988894', openR='#CDB6A8', plinth='#D6C6BE', plinth_top='#EBE0D8',
                brick='#B0634A', brick_d='#874634')
def taj_build():
    R = random.Random(5703)
    defs = [grad('sky', [(0, '#8C88A6'), (.45, '#BFA0A4'), (.8, '#E6B898'), (1, '#F0CFA6')], 0, 0, 0, 800, True),
            grad('earth', [(0, '#CFA27C'), (1, '#9C6C52')], 0, 790, 0, 1080, True),
            grad('terrace', [(0, '#A24E36'), (1, '#6E2E22')], 0, 930, 0, 1080, True),
            rgrad('sun', [(0, '#FFF0D2', .95), (.25, '#FFDCA8', .6), (1, '#F6B888', 0)]),
            rgrad('glow', [(0, '#FFE2B8', .5), (1, '#FFE2B8', 0)])]
    g = [f'<rect width="{W}" height="{H}" fill="url(#sky)"/>']
    g.append(ell(1790, 640, 330, 300, 'url(#sun)'))
    g.append(f'<circle cx="1790" cy="640" r="46" fill="#FFF3DA" opacity=".9"/>')
    for i, y in enumerate((520, 585, 650)):   # haze bands
        g.append(poly([(0, y), (1920, y - 20), (1920, y + 18), (0, y + 30)], '#F6DCC0', 'none', 0, f'opacity="{.18 + i * .06:.2f}"'))
    # far bank of trees
    d_ = 'M0,800'; x = 0
    while x < 1930:   # the far bank: a flat line of trees in the haze (generated scallops)
        w_ = R.uniform(26, 52); hh = R.uniform(6, 16) * (1.5 if R.random() < .12 else 1); d_ += f' Q{x + w_ / 2:.0f},{798 - hh * 2:.0f} {x + w_:.0f},798'; x += w_
    g.append(path(d_ + ' L1930,815 L0,815 Z', '#A38C98', '#86707E', 2))
    # the building site
    cx, by, k = 1215, 815, 2.45
    g.append(poly([(0, by), (1930, by), (1930, H + 10), (0, H + 10)], 'url(#earth)', INK, 2.5))
    g += taj(cx, by, k, TAJ_DUSK, 2.5, build=dict(dome=-171, clad=-52, mina=-62, fmina=-46, mclad=-30))
    # scaffold hugging the rising dome, and round the minaret tops
    prof = dome_side(0, -121, -200, 46, 53, -150)
    def dome_top(x):   # top of the scaffold over local x (follows the finished dome's profile, plus a margin)
        u = abs((x - cx) / k); best = -100
        for (x0, y0), (x1, y1) in zip(prof, prof[1:]):
            if x1 <= u <= x0: best = y0 + (y1 - y0) * (u - x0) / (x1 - x0 or 1)
        if u < prof[-2][0]: best = -200 + (prof[-2][1] + 200) * u / prof[-2][0]
        return by + (best - 10) * k
    g += scaffold(cx - 62 * k, cx + 62 * k, by - 100 * k, dome_top, step=22 * k / 2.2 * 1.0, ledger=26, sw=2)
    for s in (-1, 1):
        mx_ = cx + s * 172 * k; top = by - 62 * k
        g += scaffold(mx_ - 16, mx_ + 16, top + 70, lambda x, t=top: t - 50, step=32, ledger=24, sw=2)
        fx = cx + s * 146 * k; ft = by - 50 * k
        g += scaffold(fx - 12, fx + 12, ft + 50, lambda x, t=ft: t - 34, step=24, ledger=22, sw=2)
    r_ = dome_side(cx, by - 121 * k, by - 200 * k, 46 * k, 53 * k, by - 150 * k); sl_ = [(2 * cx - x, y) for x, y in r_]   # the dome still to come, as a chalk line
    g.append(path(curve(sl_ + r_[::-1][1:], False), 'none', CREAM, 4, 'stroke-dasharray="7 9" opacity=".95"'))
    g.append(line([(cx, by - 203 * k), (cx, by - 230 * k)], CREAM, 4, 'stroke-dasharray="7 9" opacity=".95"'))
    for x, y in ((cx - 40, by - 128 * k), (cx + 46, by - 152 * k - 2), (cx + 92, by - 100 * k - 1), (cx - 98, by - 100 * k - 1)):   # masons on the dome
        w_, _ = figure(x, y, .5, 1 if x > cx else -1, robe='#E6D8C0', head='turban', wrap='#C4472E', skin='#6E4430', pose='carry' if x < cx - 60 else 'pick', tool=None, sw=1.5)
        g += w_
    # the ground of the site, the ramp, and the marble on the move
    blocks = [((700, 836), 64, 32), ((640, 846), 44, 24), ((1700, 830), 58, 28)]
    for (x, y), w, h in blocks:   # cut marble waiting by the plinth
        g.append(poly([(x, y), (x + w, y), (x + w, y - h), (x, y - h)], '#F1ECE6', INK, 2.5))
        g.append(poly([(x + w * .7, y), (x + w, y), (x + w, y - h), (x + w * .7, y - h)], '#CFC6C6', 'none', 0))
        g.append(poly([(x, y), (x + w, y), (x + w, y - h), (x, y - h)], 'none', INK, 2.5))
    # elephants hauling a sled with a block on rollers, workers pushing
    e1, E1 = elephant(1040, 1000, 1.65, -1, rim='#FFD9A8')
    e2, E2 = elephant(1560, 905, 1.0, -1, rim='#FFD9A8')
    sled = lambda x0, x1, yb, hb: ([poly([(x0, yb - 10), (x1, yb - 10), (x1, yb - 10 - hb), (x0, yb - 10 - hb)], '#F3EEE8', INK, 3),
                                     poly([(x0 + (x1 - x0) * .7, yb - 10), (x1, yb - 10), (x1, yb - 10 - hb), (x0 + (x1 - x0) * .7, yb - 10 - hb)], '#D2CACA', 'none', 0),
                                     poly([(x0, yb - 10), (x1, yb - 10), (x1, yb - 10 - hb), (x0, yb - 10 - hb)], 'none', INK, 3),
                                     line([(x0 + 8, yb - 10 - hb + 8), (x0 + (x1 - x0) * .55, yb - 10 - hb + 8)], '#FFFFFF', 3, 'opacity=".7"'),
                                     poly([(x0 - 14, yb - 10), (x1 + 8, yb - 10), (x1 + 8, yb), (x0 - 4, yb)], '#7A4E2E', INK, 2.5)] +
                                    [f'<circle cx="{x:.0f}" cy="{yb + 6:.0f}" r="7" fill="#9A6A42" stroke="{INK}" stroke-width="2"/>' for x in range(int(x0), int(x1) + 1, 34)])
    s2 = sled(1640, 1740, 905, 46)
    g += e2 + [rope(E2['strap'], (1640, 878), 6, '#5A3A22', 3)] + s2
    g += sled(1180, 1340, 1000, 74)
    g += e1 + [rope(E1['strap'], (1180, 950), 10, '#5A3A22', 4)]
    for x, pose in ((1372, 'push'), (1430, 'push')):
        w_, _ = figure(x, 1004, 1.25, -1, robe='#E6D8C0', head='turban', wrap='#C4472E' if x < 1400 else '#E8B04A', skin='#6E4430', pose=pose, lean=.22, rim='#FFD9A8')
        g += w_
    for x, y, kk in ((850, 902, .95), (898, 896, .95)):
        w_, _ = figure(x, y, kk, 1, robe='#E6D8C0', head='turban', wrap='#8E3A2E', skin='#6E4430', pose='carry', rim='#FFD9A8')
        g += w_
    # ---- the foreground terrace and the emperor ----
    g.append(poly([(-10, 930), (790, 930), (820, 948), (820, H + 10), (-10, H + 10)], 'url(#terrace)', INK, 3))
    g.append(poly([(-10, 922), (800, 922), (826, 944), (-10, 944)], '#C26A48', INK, 3))
    pan = ' '.join(f'M{x},{962} L{x},{1060} M{x + 64},{962} L{x + 64},{1060}' for x in range(18, 760, 92))
    g.append(path(pan, 'none', '#5A221A', 2, 'opacity=".55"'))
    g.append(ell(380, 640, 300, 360, 'url(#glow)'))
    g += emperor_stand(372, 924, 5.1, 1, rim='#F7BE86', sw=3)
    # ---- 1632 → 1653 ----
    yy = 262
    g.append(text(1258, yy, '1632', 104, GOLD, 'start', 900, f'stroke="{INK}" stroke-width="10" paint-order="stroke" stroke-linejoin="round"'))
    g.append(path(f'M1526,{yy - 38} L1590,{yy - 38}', 'none', INK, 20)); g.append(path(f'M1526,{yy - 38} L1590,{yy - 38}', 'none', GOLD, 9))
    g.append(path(f'M1578,{yy - 62} L1612,{yy - 38} L1578,{yy - 14} Z', GOLD, INK, 4))
    g.append(text(1622, yy, '1653', 104, GOLD, 'start', 900, f'stroke="{INK}" stroke-width="10" paint-order="stroke" stroke-linejoin="round"'))
    return svg(defs, g)

# ================= 4. taj_fort =================
TAJ_GLOW = dict(shade='#E6C6C4', mid='#F7E4DA', lit='#FFF4EA', fshade='#DCC0C0', fmid='#F0DCD4', flit='#FBEDE4', band='#E2C8C2', open='#C9A6AE',
                frame='#D6B8B6', drum='#F4E2DA', dome_m='#F8E6DC', dome_l='#FFF6EE', dome_s='#DDBDC0', chamL='#E4CACA', chamR='#FFF0E4', face='#F8E8DE',
                recess='#D9BAB8', deep='#C4A4AA', door='#9A7A86', openL='#C8A8B0', openR='#E8CCC0', plinth='#EAD6CE', plinth_top='#F8EAE2')
def cusp_arch(x0, x1, spring, apex, bottom, n=9, depth=.32):
    """a multifoil (cusped) Mughal arch: lobes along a pointed arch, cusps pointing into the opening"""
    c = (x0 + x1) / 2; w = (x1 - x0) / 2; h = spring - apex
    def bez(p0, p1, p2, p3, t): return tuple((1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t * t * cc + t ** 3 * d for a, b, cc, d in zip(p0, p1, p2, p3))
    L = [bez((x0, spring), (x0, spring - .62 * h), (c - .45 * w, apex + .135 * w), (c, apex), t / 40) for t in range(41)]
    Rt = [bez((c, apex), (c + .45 * w, apex + .135 * w), (x1, spring - .62 * h), (x1, spring), t / 40) for t in range(1, 41)]
    P = L + Rt; seg = [math.dist(a, b) for a, b in zip(P, P[1:])]; tot = sum(seg)
    def at(d):
        for i, s in enumerate(seg):
            if d <= s: return lerp(P[i], P[i + 1], d / s)
            d -= s
        return P[-1]
    q = [at(tot * i / n) for i in range(n + 1)]
    d = f'M{x0:.1f},{bottom:.1f} L{x0:.1f},{spring:.1f}'
    for a, b in zip(q, q[1:]):
        m = lerp(a, b, .5); vx, vy = m[0] - c, m[1] - (spring + 40); L_ = math.hypot(vx, vy) or 1; r = math.dist(a, b) * depth
        d += f' Q{m[0] + vx / L_ * r:.1f},{m[1] + vy / L_ * r:.1f} {b[0]:.1f},{b[1]:.1f}'
    return d + f' L{x1:.1f},{bottom:.1f} Z'
def taj_fort():
    R = random.Random(5704)
    defs = [grad('wall', [(0, '#2E1512'), (.6, '#3E1B16'), (1, '#33160F')], 0, 0, 0, 1080, True),
            grad('dusk', [(0, '#4C3E66'), (.35, '#8E5A78'), (.62, '#E0906C'), (.8, '#F6C08A'), (1, '#F7CC96')], 0, 260, 0, 700, True),
            grad('river', [(0, '#E6A684'), (.5, '#B67E86'), (1, '#6E5272')], 0, 712, 0, 812, True),
            grad('reveal', [(0, '#7E3A28'), (.5, '#B65A3C'), (1, '#9A4630')], 0, 280, 0, 900, True),
            rgrad('halo', [(0, '#FFF2E0', .95), (.3, '#FFE0C0', .55), (1, '#F8C098', 0)]),
            rgrad('spill', [(0, '#F49A64', .38), (.6, '#C8603C', .12), (1, '#8E3A24', 0)]),
            grad('marble', [(0, '#F6EEE6'), (1, '#D8CCC6')]),
            rgrad('shaft', [(0, '#FFFBF2', .9), (.5, '#FFF4E2', .4), (1, '#FFF0DC', 0)])]
    g = [f'<rect width="{W}" height="{H}" fill="url(#wall)"/>']
    # warm light from the window on the room's wall
    g.append(ell(990, 600, 760, 520, 'url(#spill)'))
    # blind arches carved on the dark wall (left), the alfiz frame round the window
    for x in (110, 330):
        g.append(path(arch_d(x, x + 150, 520, 430, 900), '#371812', '#24100D', 2.5))
        g.append(path(arch_d(x + 18, x + 132, 540, 462, 900), 'none', '#4A2218', 2))
    fx0, fx1, fy0 = 520, 1462, 205
    g.append(poly([(fx0, fy0), (fx1, fy0), (fx1, 905), (fx0, 905)], '#4A2118', INK, 3))
    g.append(poly([(fx0 + 22, fy0 + 22), (fx1 - 22, fy0 + 22), (fx1 - 22, 905), (fx0 + 22, 905)], 'none', '#6A2E20', 3))
    for rx_ in (650, 1332):   # a carved rosette in each spandrel (generated petals)
        ry_ = 336
        g.append(f'<circle cx="{rx_}" cy="{ry_}" r="34" fill="#55251A" stroke="{INK}" stroke-width="2.5"/>')
        for i in range(8):
            a = i * math.pi / 4; px, py = rx_ + 19 * math.cos(a), ry_ + 19 * math.sin(a)
            g.append(ell(px, py, 11, 6, '#6E3222', f'stroke="{INK}" stroke-width="2" transform="rotate({math.degrees(a):.0f} {px:.1f} {py:.1f})"'))
        g.append(f'<circle cx="{rx_}" cy="{ry_}" r="9" fill="#8E4430" stroke="{INK}" stroke-width="2"/>')
        g.append(path(f'M{rx_ - 25},{ry_ - 22} A34,34 0 0 1 {rx_ + 25},{ry_ - 22}', 'none', '#A65038', 2.5, 'opacity=".7"'))
    # ---- the window: inner opening (reveal), the view through the outer opening ----
    x0, x1, spring, apex, sill = 590, 1392, 500, 262, 886
    inner = cusp_arch(x0, x1, spring, apex, sill, 9, .3)
    sc_, ox_, oy_ = .93, 900, 700
    outer = cusp_arch(ox_ + (x0 - ox_) * sc_, ox_ + (x1 - ox_) * sc_, oy_ + (spring - oy_) * sc_, oy_ + (apex - oy_) * sc_, sill, 9, .3)
    defs.append(f'<clipPath id="view"><path d="{outer}"/></clipPath>')
    g.append(path(inner, 'url(#reveal)', INK, 3))
    v = ['<g clip-path="url(#view)">', f'<rect x="0" y="0" width="{W}" height="{H}" fill="url(#dusk)"/>']
    for y, op in ((560, .2), (618, .26), (668, .3)):
        v.append(poly([(400, y), (1500, y - 12), (1500, y + 16), (400, y + 24)], '#FBE0C4', 'none', 0, f'opacity="{op}"'))
    for bx, byy in ((760, 380), (790, 370), (1240, 330)):   # three birds going home
        v.append(path(f'M{bx - 12},{byy} q6,-7 12,0 q6,-7 12,0', 'none', '#3A2A3A', 2.5))
    v.append(ell(1132, 636, 270, 170, 'url(#halo)'))
    d_ = 'M400,718'; x = 400
    while x < 1500:
        w_ = R.uniform(18, 34); hh = R.uniform(5, 13) * (1.4 if R.random() < .15 else 1); d_ += f' Q{x + w_ / 2:.0f},{708 - hh * 2:.0f} {x + w_:.0f},708'; x += w_
    v.append(path(d_ + ' L1500,722 L400,722 Z', '#9A7690', '#7A5A76', 1.5))
    v += taj(1132, 702, .63, TAJ_GLOW, 1.6, detail=False)
    v.append(poly([(400, 716), (1500, 716), (1500, 812), (400, 812)], 'url(#river)', 'none', 0))
    v.append(poly([(1118, 720), (1146, 720), (1152, 790), (1112, 790)], '#FFF0E2', 'none', 0, 'opacity=".45"'))   # the reflection
    rip = [((x, y), (x + R.uniform(20, 60), y)) for y in range(728, 806, 9) for x in [R.uniform(420, 1450) for _ in range(3)]]
    v.append(marks(rip, '#FCE6D4', 2, 'opacity=".45"'))
    # the fort's own ramparts below the window, merlons against the river
    rp = [(400, 818), (1500, 806), (1500, 900), (400, 900)]
    v.append(poly(rp, '#3A1A18', INK, 2.5))
    for i in range(22):
        x = 410 + i * 50; y = edge_y([(400, 818), (1500, 806)], x)
        v.append(path(f'M{x},{y + 1} L{x},{y - 18} Q{x + 14},{y - 30} {x + 28},{y - 18} L{x + 28},{y + 1} Z', '#3A1A18', INK, 2))
        v.append(line([(x + 2, y - 18), (x + 14, y - 27)], '#B86A4A', 2, 'opacity=".7"'))
    v.append('</g>')
    g += v
    g.append(path(outer, 'none', INK, 2.5))
    g.append(path(inner, 'none', INK, 3.5))
    # the sill, lit on top
    g.append(poly([(560, 886), (1424, 886), (1440, 906), (544, 906)], '#C8714E', INK, 3))
    g.append(poly([(544, 906), (1440, 906), (1440, 934), (544, 934)], '#5A2618', INK, 3))
    # ---- the old emperor at the window ----
    g += emperor_seat(690, 878, 4.3, 1, rim='#FFC088', sw=3)
    # ---- inset: the two cenotaphs, side by side ----
    ix, iy, iw, ih = 1494, 452, 372, 392
    ins = [f'<g transform="rotate(2.5 {ix + iw / 2} {iy + ih / 2})">',
           poly([(ix - 14, iy - 14), (ix + iw + 14, iy - 14), (ix + iw + 14, iy + ih + 14), (ix - 14, iy + ih + 14)], '#120806', 'none', 0, 'opacity=".45" transform="translate(8 10)"'),
           poly([(ix - 14, iy - 14), (ix + iw + 14, iy - 14), (ix + iw + 14, iy + ih + 14), (ix - 14, iy + ih + 14)], CREAM, INK, 3)]
    defs.append(f'<clipPath id="ins"><rect x="{ix}" y="{iy}" width="{iw}" height="{ih}"/></clipPath>')
    ins.append(f'<g clip-path="url(#ins)">')
    ins.append(f'<rect x="{ix}" y="{iy}" width="{iw}" height="{ih}" fill="#C9BCB8"/>')
    # the marble screen behind (jali): panels of generated lattice
    for p in range(3):
        px0 = ix + 6 + p * (iw - 12) / 3; px1 = px0 + (iw - 12) / 3 - 8
        ins.append(poly([(px0, iy + 40), (px1, iy + 40), (px1, iy + 214), (px0, iy + 214)], '#E4DAD4', INK, 2))
        lat = []
        for yy in range(iy + 52, iy + 206, 16):
            for xx in range(int(px0) + 10, int(px1) - 4, 16):
                o = 8 if ((yy - iy) // 16) % 2 else 0
                lat.append(f'M{xx + o:.0f},{yy - 6} l6,6 l-6,6 l-6,-6 Z')
        ins.append(path(' '.join(lat), '#A99C9C', 'none', 0, 'opacity=".75"'))
        ins.append(poly([(px0 - 3, iy + 30), (px1 + 3, iy + 30), (px1 + 3, iy + 42), (px0 - 3, iy + 42)], '#EFE6E0', INK, 2))
    ins.append(poly([(ix, iy + 214), (ix + iw, iy + 214), (ix + iw, iy + ih), (ix, iy + ih)], 'url(#marble)', INK, 2))
    ins.append(marks([((ix, y), (ix + iw, y)) for y in (iy + 262, iy + 330)] + [((x, iy + 214), (x - 40, iy + ih)) for x in range(ix + 40, ix + iw + 40, 70)], '#B8AAA8', 1.5, 'opacity=".6"'))
    ins.append(poly([(ix + 150, iy), (ix + 230, iy), (ix + 330, iy + ih), (ix + 40, iy + ih)], '#FFF8EC', 'none', 0, 'opacity=".35"'))   # a soft beam of light
    ins.append(ell(ix + iw / 2, iy + 40, 220, 220, 'url(#shaft)'))
    def ceno(x0, x1, base, h, man):
        o = [poly([(x0 - 14, base), (x1 + 14, base), (x1 + 14, base - 14), (x0 - 14, base - 14)], '#EAE2DC', INK, 2.5),
             poly([(x0 - 6, base - 14), (x1 + 6, base - 14), (x1 + 6, base - 26), (x0 - 6, base - 26)], '#F2EAE4', INK, 2.5),
             poly([(x0, base - 26), (x1, base - 26), (x1, base - 26 - h), (x0, base - 26 - h)], '#F8F2EC', INK, 2.5)]
        top = base - 26 - h
        if man: o.append(path(f'M{x0 + 10},{top} Q{x0 + 14},{top - 16} {(x0 + x1) / 2},{top - 18} Q{x1 - 14},{top - 16} {x1 - 10},{top} Z', '#F8F2EC', INK, 2.5))   # pen box
        else: o.append(poly([(x0 + 10, top), (x1 - 10, top), (x1 - 14, top - 8), (x0 + 14, top - 8)], '#F8F2EC', INK, 2.5))   # writing tablet
        vine = []   # inlaid flowers (pietra dura), generated along the side
        for i in range(int((x1 - x0 - 16) / 18) + 1):
            x = x0 + 12 + i * 18; y = base - 26 - h / 2
            vine.append(f'<circle cx="{x:.0f}" cy="{y - 4:.0f}" r="4" fill="#B4473C"/>')
            vine.append(f'<ellipse cx="{x + 7:.0f}" cy="{y + 3:.0f}" rx="5" ry="2.4" fill="#5E7E5A"/>')
        o.append(line([(x0 + 8, base - 26 - h / 2 + 2), (x1 - 8, base - 26 - h / 2 + 2)], '#7A9070', 1.5))
        o += vine
        o.append(line([(x0 + 4, base - 30), (x1 - 4, base - 30)], '#C9BDB8', 1.5))
        return o
    ins.append(ell(ix + iw / 2, iy + 352, 182, 22, '#8E807E', 'opacity=".25"'))
    ins += ceno(ix + 38, ix + 184, iy + 350, 66, True)
    ins += ceno(ix + 214, ix + 338, iy + 350, 56, False)
    ins.append('</g>')
    ins.append(f'<rect x="{ix}" y="{iy}" width="{iw}" height="{ih}" fill="none" stroke="{INK}" stroke-width="2.5"/>')
    ins.append('</g>')
    # callout: from the far Taj to the print
    g.append(path(f'M1196,606 L{ix - 14},{iy - 2}', 'none', CREAM, 2.5, 'stroke-dasharray="3 9" opacity=".75"'))
    g.append(path(f'M1196,704 L{ix - 10},{iy + ih + 18}', 'none', CREAM, 2.5, 'stroke-dasharray="3 9" opacity=".75"'))
    g += ins
    return svg(defs, g)

FRAMES = dict(petra_caravan=petra_caravan, petra_tax=petra_tax, taj_build=taj_build, taj_fort=taj_fort)
if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else OUT
    only = sys.argv[2:] or list(FRAMES)
    os.makedirs(out, exist_ok=True)
    for name in only:
        s = FRAMES[name](); open(os.path.join(out, name + '.svg'), 'w').write(s); print('ok', name, len(s) // 1024, 'KB')
