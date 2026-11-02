"""ep57 history key frames, set B (1920x1080 SVG each), drawn in code in the scene drawings' language
(christ_vector.py / colosseum_vector.py / gw_vector.py): hand-placed polygons and paths plus generated repeats,
ink #2A211B at 2-3 px, flat fills from a fixed palette, gradients only for sky / glow / water / big walls.
People are flat faceless figures with a warm rim light; the emperor is a dignified back-view silhouette.
  christ_1922          1920s Rio street: people drop coins into a church box; Corcovado with the statue in scaffolding.
  colosseum_nero_lake  Nero's private lake with porticoes and the gilded Domus Aurea; the emperor alone on his terrace.
  colosseum_return     same camera: the lake filled in, the new Colosseum complete, Romans streaming in.
The two Colosseum frames share one 3D camera (ellipse 188 x 156 m, 48 m high), so the lake, its ghost outline and
the amphitheatre sit on the same spot.
Free zones (no key content): subtitle x120-1150 y90-340, counter x1480-1800 y50-130, odometer x120-720 y950-1040,
seal x>1700 y>950.
usage: hist_b.py [out_dir]   (default: scratchpad sb57/hist), then render each svg with sb57/vec/render.py"""
import sys, os, math, random
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/sb57/hist'
W, H = 1920, 1080
INK = '#2A211B'
GOLD = '#F2C66E'


# ------------------------------------------------------------------------------------------------ helpers
def pts(p): return ' '.join(f'{x:.1f},{y:.1f}' for x, y in p)
def poly(p, fill, stroke=INK, sw=3, extra=''): return f'<polygon points="{pts(p)}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" {extra}/>'
def line(p, stroke=INK, sw=3, extra=''): return f'<polyline points="{pts(p)}" fill="none" stroke="{stroke}" stroke-width="{sw:.1f}" stroke-linecap="round" stroke-linejoin="round" {extra}/>'
def segs(ss, stroke=INK, sw=2, extra=''):
    d = ' '.join(f'M{a[0]:.1f} {a[1]:.1f}L{b[0]:.1f} {b[1]:.1f}' for a, b in ss)
    return f'<path d="{d}" fill="none" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" {extra}/>'
def ell(cx, cy, rx, ry, fill, stroke=INK, sw=2.5, extra=''): return f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>'
def lerp(a, b, t): return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
def arc(cx, cy, rx, ry, a0, a1, n=10): return [(cx + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)), cy + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]
def bez(p0, p1, p2, t): return ((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1])
def ey(curve, x):
    """y of a polyline listed left -> right at x"""
    if x <= curve[0][0]: return curve[0][1]
    for a, b in zip(curve, curve[1:]):
        if a[0] <= x <= b[0]: return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0] or 1)
    return curve[-1][1]
def inside(p, x, y):
    c = False
    for (x1, y1), (x2, y2) in zip(p, p[1:] + p[:1]):
        if (y1 > y) != (y2 > y) and x < x1 + (x2 - x1) * (y - y1) / (y2 - y1): c = not c
    return c
def blob(R, cx, cy, r, n=9, j=.28):
    return [(cx + r * (1 + R.uniform(-j, j)) * math.cos(2 * math.pi * i / n), cy + r * .82 * (1 + R.uniform(-j, j)) * math.sin(2 * math.pi * i / n)) for i in range(n)]
def label(x, y, s, size=50, anchor='start', fill=GOLD):
    """gold caption, house style: heavy sans, ink outline painted under the fill"""
    return (f'<text x="{x}" y="{y}" font-family="Noto Sans CJK SC" font-weight="900" font-size="{size}" text-anchor="{anchor}" fill="{fill}" '
            f'stroke="{INK}" stroke-width="{size * .16:.1f}" stroke-linejoin="round" paint-order="stroke">{s}</text>')
def rim(p, side, w, col, up=.35, thr=.3):
    """warm rim light: a band just inside every edge of the polygon that faces the light
    (side +1: light from the right, -1: from the left; slightly from above)"""
    L = (side, -up); ln = math.hypot(*L); L = (L[0] / ln, L[1] / ln); d = w * .5 + 1.2
    chains, cur, n = [], [], len(p)
    for i in range(n):
        a, b = p[i], p[(i + 1) % n]; dx, dy = b[0] - a[0], b[1] - a[1]; sl = math.hypot(dx, dy)
        if sl < 1e-6: continue
        nx, ny = dy / sl, -dx / sl
        if inside(p, (a[0] + b[0]) / 2 + nx * 1.5, (a[1] + b[1]) / 2 + ny * 1.5): nx, ny = -nx, -ny
        if nx * L[0] + ny * L[1] > thr:
            s0, s1 = (a[0] - nx * d, a[1] - ny * d), (b[0] - nx * d, b[1] - ny * d)
            if cur and math.dist(cur[-1], s0) < d * 3: cur.append(s1)
            else:
                if cur: chains.append(cur)
                cur = [s0, s1]
        elif cur: chains.append(cur); cur = []
    if cur: chains.append(cur)
    return ''.join(line(c, col, w, 'opacity=".95"') for c in chains)
def write(name, defs, body):
    os.makedirs(OUT, exist_ok=True)
    f = os.path.join(OUT, name + '.svg')
    open(f, 'w', encoding='utf-8').write(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">\n<defs>{defs}</defs>\n'
                                         + '\n'.join(body) + '\n</svg>')
    print('ok', f, len(body), 'elements')


# ================================================================================================ 1. christ_1922
# the statue outline from christ_vector.py (same polygon, scaled onto the summit)
LH = [(384, 1213), (392, 1206), (410, 1203), (423, 1196), (440, 1193), (462, 1195), (476, 1199), (490, 1206), (503, 1208)]
LTOP = [(530, 1210), (560, 1210), (590, 1208), (620, 1204), (648, 1197), (680, 1193), (710, 1186), (737, 1181), (765, 1177), (792, 1175)]
HEAD = [(794, 1160), (796, 1135), (799, 1105), (803, 1080), (811, 1063), (824, 1055), (838, 1052), (852, 1054), (864, 1059), (873, 1072), (878, 1092), (880, 1120), (882, 1150), (884, 1172)]
RTOP = [(902, 1179), (947, 1183), (983, 1194), (1003, 1199), (1036, 1206), (1050, 1208), (1090, 1204), (1126, 1201), (1163, 1195)]
RH = [(1180, 1189), (1198, 1183), (1226, 1179), (1245, 1180), (1252, 1188), (1276, 1186), (1284, 1195), (1280, 1201), (1265, 1212), (1234, 1220), (1198, 1228), (1170, 1228), (1161, 1226)]
RSL = [(1157, 1224), (1151, 1244), (1140, 1272), (1129, 1296), (1121, 1305), (1090, 1307), (1054, 1309), (1019, 1312), (983, 1321), (951, 1334)]
BODYR = [(951, 1450), (951, 1600), (964, 1610), (971, 1624), (962, 1638), (953, 1652), (953, 1700)]
HEM = [(742, 1612), (806, 1645), (854, 1664), (903, 1679), (922, 1698), (942, 1713), (955, 1727)]
BODYL = [(742, 1612), (734, 1585), (729, 1540), (725, 1500), (716, 1490), (714, 1472), (718, 1455), (720, 1400), (720, 1330)]
LBOT = [(690, 1328), (657, 1325), (623, 1322), (590, 1317), (560, 1313), (549, 1305), (541, 1290), (527, 1265), (513, 1240), (503, 1238)]
LHB = [(480, 1237), (455, 1238), (425, 1235), (402, 1228), (390, 1221)]
COLL = [(742, 1600), (742, 1680), (740, 1780), (737, 1880), (735, 1948)]
COLR = [(953, 1600), (953, 1700), (955, 1730), (957, 1800), (960, 1880), (963, 1948)]

RIM1 = '#FFD08A'


def person20(g, x, yb, h, kind, face=-1, hat=None, cloth='#3B3A40', cloth2='#F1ECE2', skin='#B98A6A', hair='#2A1F1A', hatc='#5A4636',
             reach=None, coin=False, cane=False, bag=None, stride=0.0, child=False, rimc=RIM1, shadow=True):
    """a 1920s figure, no face: hat, hair seen from the back, suit / dress / cassock / work clothes, warm rim on the right"""
    lw = max(2.0, h * .0062); rw = max(2.2, h * .011); aw = h * (.052 if child else .042)
    hr = h * (.085 if child else .062); hrx = hr * .86
    hc = yb - h + hr; sh = hc + hr + h * .04
    ws = h * {'suit': .125, 'worker': .12, 'dress': .1, 'priest': .12}[kind] * (1.12 if child else 1)
    hip = yb - h * .48
    if shadow:   # the sun is behind, to the right: shadows fall toward us, to the left
        g.append(poly([(x + h * .1, yb), (x - h * .08, yb), (x - h * .62, yb + h * .06), (x - h * .45, yb + h * .075)], '#6A5A4E', 'none', 0, 'opacity=".3"'))
    # legs and shoes
    fA, fB = x - h * .035 - stride * h * .09, x + h * .035 + stride * h * .09
    def shoe(f):
        g.append(poly([(f - h * .028, yb - h * .03), (f + h * .028, yb - h * .03), (f + h * .028 + max(0, face) * h * .035, yb), (f - h * .028 + min(0, face) * h * .035, yb)], '#2A221E', INK, lw))
    if kind in ('suit', 'worker'):
        for leg in ([(x - h * .078, hip), (x - h * .004, hip), (fA + h * .026, yb - h * .03), (fA - h * .03, yb - h * .03)],
                    [(x + h * .004, hip), (x + h * .078, hip), (fB + h * .03, yb - h * .03), (fB - h * .026, yb - h * .03)]):
            g.append(poly(leg, cloth, INK, lw)); g.append(rim(leg, 1, rw, rimc))
        g.append(line([(x, hip + h * .02), (x + (fA + fB - 2 * x) * .1, yb - h * .2)], INK, lw * .6, 'opacity=".5"'))
        shoe(fA); shoe(fB)
        hem = None
    else:
        hem = yb - h * (.2 if kind == 'dress' else .03)
        if kind == 'dress':
            for f in (fA, fB):
                g.append(line([(x + (f - x) * .6, hem - 4), (f, yb - h * .03)], INK, h * .034 + lw * 2)); g.append(line([(x + (f - x) * .6, hem - 4), (f, yb - h * .03)], '#C49A7C', h * .034))
            shoe(fA); shoe(fB)
        else:
            shoe(fA + h * .01); shoe(fB - h * .01)
    # arms: shoulder -> elbow (bowed out) -> hand
    sF = (x + face * ws * .8, sh + h * .03); sB = (x - face * ws * .8, sh + h * .03)
    def arm_pts(s, hand):
        mx, my = (s[0] + hand[0]) / 2, (s[1] + hand[1]) / 2; dx, dy = hand[0] - s[0], hand[1] - s[1]; L = math.hypot(dx, dy) or 1
        e1 = (mx - dy / L * h * .05, my + dx / L * h * .05); e2 = (mx + dy / L * h * .05, my - dx / L * h * .05)
        e = e1 if abs(e1[0] - x) > abs(e2[0] - x) else e2
        if hand[1] < s[1]: e = e1 if e1[1] > e2[1] else e2   # a raised arm bends with the elbow down
        return [s, e, hand]
    def arm(s, hand, sleeve):
        p = arm_pts(s, hand)
        g.append(line(p, INK, aw + lw * 2)); g.append(line(p, sleeve, aw))
        g.append(ell(hand[0], hand[1], aw * .55, aw * .6, skin, INK, lw * .8))
        return p
    sleeve = cloth2 if kind == 'worker' else cloth
    hangB = (sB[0] - face * h * .015, hip + h * .04); arm(sB, hangB, sleeve)
    # body
    if kind == 'suit':
        body = [(x - h * .04, sh - h * .014), (x - ws, sh + h * .01), (x - ws * 1.03, sh + h * .09), (x - ws * .92, hip + h * .07),
                (x + ws * .92, hip + h * .07), (x + ws * 1.03, sh + h * .09), (x + ws, sh + h * .01), (x + h * .04, sh - h * .014)]
        g.append(poly(body, cloth, INK, lw)); g.append(rim(body, 1, rw, rimc))
        g.append(poly([(x + face * h * .004, sh - h * .012), (x + face * h * .036, sh - h * .008), (x + face * h * .014, sh + h * .07)], cloth2, INK, lw * .7))
        g.append(line([(x + face * h * .036, sh - h * .008), (x + face * h * .03, sh + h * .12), (x + face * h * .02, hip + h * .05)], INK, lw * .7, 'opacity=".6"'))
    elif kind == 'worker':
        body = [(x - h * .04, sh - h * .014), (x - ws, sh + h * .01), (x - ws * 1.02, sh + h * .09), (x - ws * .9, hip + h * .02),
                (x + ws * .9, hip + h * .02), (x + ws * 1.02, sh + h * .09), (x + ws, sh + h * .01), (x + h * .04, sh - h * .014)]
        g.append(poly(body, cloth2, INK, lw)); g.append(rim(body, 1, rw, rimc))
        for s_ in (-1, 1): g.append(line([(x + s_ * ws * .55, sh + h * .005), (x + s_ * ws * .45, hip + h * .02)], '#5A3A2A', h * .014))
        g.append(poly([(x - ws * .92, hip - h * .01), (x + ws * .92, hip - h * .01), (x + ws * .9, hip + h * .03), (x - ws * .9, hip + h * .03)], cloth, INK, lw))
    elif kind == 'dress':
        body = [(x - h * .035, sh - h * .012), (x - ws, sh + h * .01), (x - ws * 1.02, sh + h * .08), (x - ws * .98, hip + h * .03),
                (x - ws * 1.28, hem), (x + ws * 1.28, hem), (x + ws * .98, hip + h * .03), (x + ws * 1.02, sh + h * .08), (x + ws, sh + h * .01), (x + h * .035, sh - h * .012)]
        g.append(poly(body, cloth, INK, lw)); g.append(rim(body, 1, rw, rimc))
        g.append(poly([(x - ws * .99, hip - h * .005), (x + ws * .99, hip - h * .005), (x + ws * 1.03, hip + h * .035), (x - ws * 1.03, hip + h * .035)], cloth2, INK, lw * .8))   # the drop-waist sash
        for k in (-1, 0, 1): g.append(line([(x + k * ws * .5, hip + h * .05), (x + k * ws * .7, hem - 3)], INK, lw * .6, 'opacity=".45"'))   # pleats
    else:   # priest: cassock to the ankles, white collar, button line
        body = [(x - h * .04, sh - h * .014), (x - ws, sh + h * .01), (x - ws * 1.03, sh + h * .09), (x - ws * 1.0, hip), (x - ws * 1.16, hem),
                (x + ws * 1.16, hem), (x + ws * 1.0, hip), (x + ws * 1.03, sh + h * .09), (x + ws, sh + h * .01), (x + h * .04, sh - h * .014)]
        g.append(poly(body, cloth, INK, lw)); g.append(rim(body, 1, rw, rimc))
        g.append(poly([(x + face * h * .0, sh - h * .012), (x + face * h * .03, sh - h * .01), (x + face * h * .03, sh + h * .008), (x, sh + h * .01)], cloth2, INK, lw * .7))
        for k in range(9): g.append(ell(x + face * h * .03, sh + h * (.04 + k * .05), h * .004, h * .004, '#6A5E58', 'none', 0))
    # neck, head, hair
    g.append(poly([(x - h * .022, hc + hr * .6), (x + h * .022, hc + hr * .6), (x + h * .025, sh), (x - h * .025, sh)], skin, INK, lw * .8))
    head = arc(x, hc, hrx, hr, 0, 360, 24)[:-1]
    g.append(poly(head, skin, INK, lw))
    long_ = kind in ('dress',) and not child
    hp = arc(x, hc, hrx * 1.05, hr * 1.04, 215, 360 + (78 if long_ else 30), 16) + [(x + hrx * .2, hc + hr * (.5 if long_ else .2)), (x - hrx * .3, hc - hr * .3)]
    if face == 1: hp = [(2 * x - px, py) for px, py in hp]
    g.append(poly(hp, hair, INK, lw * .8))
    g.append(rim(head, 1, rw, rimc))
    # hats
    hp_ = None
    if hat == 'fedora':
        g.append(ell(x, hc - hr * .5, h * .098, h * .017, hatc, INK, lw))
        hp_ = [(x - h * .062, hc - hr * .5), (x - h * .058, hc - hr * 1.4), (x - h * .02, hc - hr * 1.62), (x + h * .006, hc - hr * 1.48), (x + h * .028, hc - hr * 1.6), (x + h * .058, hc - hr * 1.4), (x + h * .062, hc - hr * .5)]
        g.append(poly(hp_, hatc, INK, lw)); g.append(poly([(x - h * .061, hc - hr * .55), (x + h * .061, hc - hr * .55), (x + h * .06, hc - hr * .82), (x - h * .06, hc - hr * .82)], '#2A211B', INK, lw * .6))
    elif hat == 'boater':
        g.append(ell(x, hc - hr * .5, h * .1, h * .016, hatc, INK, lw))
        hp_ = [(x - h * .058, hc - hr * .5), (x - h * .058, hc - hr * 1.35), (x + h * .058, hc - hr * 1.35), (x + h * .058, hc - hr * .5)]
        g.append(poly(hp_, hatc, INK, lw)); g.append(poly([(x - h * .058, hc - hr * .58), (x + h * .058, hc - hr * .58), (x + h * .058, hc - hr * .84), (x - h * .058, hc - hr * .84)], '#2A211B', 'none', 0))
        g.append(ell(x, hc - hr * 1.35, h * .058, h * .01, '#EED9A4', INK, lw * .8))
    elif hat == 'cloche':
        hp_ = arc(x, hc - hr * .12, hrx * 1.16, hr * 1.06, 180, 360, 14) + [(x + hrx * 1.16 + max(0, face) * h * .012, hc + hr * .32), (x - hrx * 1.16 - max(0, -face) * h * .012, hc + hr * .32)]
        g.append(poly(hp_, hatc, INK, lw)); g.append(line([(x - hrx * 1.12, hc + hr * .05), (x + hrx * 1.12, hc + hr * .05)], '#2A211B', h * .012))
    elif hat == 'flatcap':
        hp_ = arc(x, hc - hr * .2, hrx * 1.12, hr * .95, 180, 360, 12) + [(x + face * hrx * 1.9, hc - hr * .1)]
        if face == -1: hp_ = arc(x, hc - hr * .2, hrx * 1.12, hr * .95, 180, 360, 12)[::-1] + [(x - hrx * 1.9, hc - hr * .1)]
        g.append(poly(hp_, hatc, INK, lw))
    elif hat == 'saturno':
        g.append(ell(x, hc - hr * .55, h * .115, h * .02, hatc, INK, lw))
        hp_ = arc(x, hc - hr * .55, h * .06, h * .05, 180, 360, 12)
        g.append(poly(hp_, hatc, INK, lw))
    if hp_: g.append(rim(hp_, 1, rw, rimc))
    # front arm (over the body)
    if reach:
        hx, hy = reach; L = math.hypot(hx - sF[0], hy - sF[1]); m = h * .37
        if L > m: hx, hy = sF[0] + (hx - sF[0]) * m / L, sF[1] + (hy - sF[1]) * m / L
        ap = arm(sF, (hx, hy), sleeve); hand = (hx, hy)
    else:
        hand = (sF[0] + face * h * .015, hip + h * .045); ap = arm(sF, hand, sleeve)
    if kind == 'worker': g.append(line([ap[0], lerp(ap[0], ap[1], .7)], cloth2, aw * 1.08))   # rolled sleeve
    if coin is True: g.append(ell(hand[0] + face * aw * .3, hand[1] - aw * .55, h * .017, h * .013, GOLD, INK, 1.6))
    if cane:
        g.append(line([(hand[0], hand[1]), (hand[0] + face * h * .05, yb)], INK, h * .016 + 3)); g.append(line([(hand[0], hand[1]), (hand[0] + face * h * .05, yb)], '#6B4A30', h * .016))
    if bag:
        g.append(line([hand, (hand[0] + face * h * .01, hand[1] + h * .04)], INK, 2))
        g.append(poly([(hand[0] - h * .035, hand[1] + h * .04), (hand[0] + h * .035, hand[1] + h * .04), (hand[0] + h * .04, hand[1] + h * .1), (hand[0] - h * .04, hand[1] + h * .1)], bag, INK, lw))
    # warm rim light on the right edges
    g.append(line([(px + aw * .3, py) for px, py in ap], rimc, rw * .8, 'opacity=".8"'))
    return hand


def christ_1922():
    R = random.Random(1922)
    P = dict(sky0='#6C83AA', sky1='#B5A4A0', sky2='#EBC48F', sky3='#F7DCAA', glow='#FFE6AE',
             far='#ABA0B6', far_l='#8C809A', loaf='#9E95B2', loaf_l='#7E7596', bay='#F6E2B8',
             rock='#857E92', rock_lit='#B7A6A2', rock_line='#655E77', forest='#4B6744', leaf=['#58784B', '#678652', '#46623F', '#517046'], leaf_lit='#8DA663',
             stat='#8E8A97', stat_sh='#706C7A', stat_rim='#FFE1A0', ped='#77707A', scaf='#4A3424',
             roof='#B4583A', roof_d='#8E4230', win='#4B3B35', frame='#F1E5CC',
             pave='#E9DBBE', wave='#9C8670', church='#F1E9D9', church_sh='#DCCFB9', trim='#C99A5C', trim_d='#A87A42', door='#5E3523', door_l='#7A4A30',
             box='#8A5634', box_l='#B07445', box_d='#5C3822', brass='#E2B65A', iron='#3E3530')
    defs = (f'<linearGradient id="c_sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{P["sky0"]}"/><stop offset=".42" stop-color="{P["sky1"]}"/>'
            f'<stop offset=".62" stop-color="{P["sky2"]}"/><stop offset="1" stop-color="{P["sky3"]}"/></linearGradient>'
            f'<radialGradient id="c_glow" gradientUnits="userSpaceOnUse" cx="1340" cy="300" r="460"><stop offset="0" stop-color="{P["glow"]}" stop-opacity=".95"/>'
            f'<stop offset=".45" stop-color="{P["glow"]}" stop-opacity=".35"/><stop offset="1" stop-color="{P["glow"]}" stop-opacity="0"/></radialGradient>'
            f'<linearGradient id="c_door" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A261C"/><stop offset="1" stop-color="#9A6232"/></linearGradient>')
    g = [f'<rect width="{W}" height="{H}" fill="url(#c_sky)"/>', f'<rect width="{W}" height="{H}" fill="url(#c_glow)"/>']
    # --- far range (the Tijuca massif in haze), Sugarloaf on the right, a strip of the bay
    far = [(0, 610), (90, 592), (180, 566), (260, 556), (340, 572), (430, 548), (520, 528), (600, 540), (700, 566), (800, 556), (880, 570), (960, 600),
           (1500, 612), (1560, 600), (1620, 618), (1700, 640), (1920, 650)]
    g.append(poly(far + [(1920, 780), (0, 780)], P['far'], P['far_l'], 2))
    g.append(poly([(1460, 668), (1920, 668), (1920, 700), (1460, 700)], P['bay'], 'none', 0))
    for i in range(14):   # glints on the bay
        x = 1480 + i * 31 + R.uniform(-8, 8); y = 674 + R.uniform(0, 18); g.append(line([(x, y), (x + R.uniform(10, 22), y)], '#FFFFFF', 2, 'opacity=".7"'))
    g.append(poly([(1585, 690), (1610, 650), (1640, 630), (1680, 626), (1712, 640), (1730, 690)], P['loaf'], P['loaf_l'], 2))
    loaf = [(1700, 690), (1712, 640), (1722, 590), (1736, 548), (1752, 520), (1772, 504), (1796, 500), (1818, 508), (1834, 530), (1846, 570), (1856, 630), (1864, 690)]
    g.append(poly(loaf, P['loaf'], P['loaf_l'], 2))
    g.append(line([(1820, 512), (1836, 534), (1847, 574), (1856, 630)], P['stat_rim'], 3, 'opacity=".6"'))
    # --- Corcovado: granite needle over a forested foot
    PEAK = [(860, 760), (930, 716), (1000, 672), (1060, 628), (1110, 586), (1150, 548), (1186, 510), (1220, 478), (1252, 452), (1278, 434), (1298, 425),
            (1368, 425), (1388, 434), (1404, 456), (1418, 490), (1430, 530), (1444, 572), (1466, 610), (1500, 640), (1550, 666), (1620, 694), (1710, 720), (1800, 760)]
    g.append(poly(PEAK, P['rock'], INK, 3))
    g.append(poly([(1368, 425), (1388, 434), (1404, 456), (1418, 490), (1430, 530), (1444, 572), (1466, 610), (1440, 614), (1424, 576), (1410, 534), (1398, 494), (1384, 460), (1374, 440)], P['rock_lit'], 'none', 0))
    g.append(line([(1370, 427), (1388, 436), (1402, 458), (1416, 492), (1428, 532), (1442, 574), (1464, 610)], P['stat_rim'], 3, 'opacity=".8"'))
    for _ in range(40):   # granite streaks running down the face (generated)
        x = R.uniform(1160, 1450); y0 = ey(PEAK[5:18], x) + R.uniform(6, 14); L = R.uniform(30, 95)
        g.append(line([(x, y0), (x - L * .1, y0 + L * .5), (x - L * .16, y0 + L)], P['rock_line'], R.uniform(1.5, 2.5), 'opacity=".55"'))
    FOREST = [(860, 760), (930, 716), (1000, 672), (1060, 628), (1110, 586), (1150, 548), (1176, 522), (1210, 552), (1256, 580), (1306, 600), (1366, 612),
              (1426, 616), (1466, 610), (1500, 640), (1550, 666), (1620, 694), (1710, 720), (1800, 760)]
    g.append(poly(FOREST, P['forest'], INK, 2.5))
    for _ in range(200):   # tree crowns, generated inside the forest (lit toward the sun on the right)
        x, y = R.uniform(860, 1800), R.uniform(520, 760)
        if not inside(FOREST, x, y): continue
        col = P['leaf_lit'] if (x > 1450 and R.random() < .55) else R.choice(P['leaf'])
        g.append(poly(blob(R, x, y, R.uniform(8, 15), 9, .2), col, '#2F4229', 1.2))
    # --- the statue on the summit, backlit, wrapped in its 1920s scaffolding (scaffold laid out in the statue's own coordinates)
    s = .24; ox, oy = 1332, 380
    def T(p): return [(ox + (x - 840) * s, oy + (y - 1948) * s) for x, y in p]
    g.append(poly([(1302, 380), (1362, 380), (1370, 428), (1294, 428)], P['ped'], INK, 2.5))
    g.append(poly([(1296, 374), (1368, 374), (1368, 382), (1296, 382)], '#8E8790', INK, 2))
    for k in range(1, 3): g.append(line([(1300 - k * 1.5, 382 + k * 15), (1364 + k * 1.5, 382 + k * 15)], '#5E5862', 1.5))
    def TS(a, b): return tuple(T([a, b]))
    YG = 1948 + (425 - oy) / s   # the summit, in statue units
    sc = []
    for x in (690, 760, 920, 990): sc.append(TS((x, 1010), (x, 1948)))   # the tower round the figure
    for y in range(1020, 1948, 96): sc.append(TS((680, y), (1000, y)))
    for i, y in enumerate(range(1020, 1890, 128)):
        sc.append(TS((690, y), (760, y + 128)) if i % 2 else TS((760, y), (690, y + 128)))
        sc.append(TS((920, y), (990, y + 128)) if i % 2 else TS((990, y), (920, y + 128)))
    for xa, xb in ((395, 565), (1115, 1285)):   # braced towers under both arms, down to the rock
        xm = (xa + xb) / 2
        for x in (xa, xm, xb): sc.append(TS((x, 1250), (x, YG)))
        for y in range(1250, int(YG), 110): sc.append(TS((xa - 10, y), (xb + 10, y)))
        for y in range(1250, int(YG) - 110, 220): sc += [TS((xa, y), (xm, y + 110)), TS((xm, y + 110), (xb, y + 220))]
        sc.append(TS((xa - 20, 1244), (xb + 20, 1244)))
    sc += [TS((565, 1244), (690, 1244)), TS((990, 1244), (1115, 1244))]
    g.append(segs(sc, INK, 3, 'opacity=".85"')); g.append(segs(sc, '#9A7650', 1.4))
    d0, d1, d2 = T([(990, 1010), (1170, 870), (1170, 1010)])   # a small derrick on the tower top, hook down
    g.append(segs([(d0, d1), (d1, d2)], INK, 3)); g.append(poly([(d2[0] - 6, d2[1]), (d2[0] + 6, d2[1]), (d2[0] + 6, d2[1] + 9), (d2[0] - 6, d2[1] + 9)], '#6E5038', INK, 1.5))
    g.append(poly(T(COLL + COLR[::-1]), P['stat'], INK, 2))
    cloak = LH + LTOP + HEAD + RTOP + RH + RSL + BODYR + HEM[::-1] + BODYL + LBOT + LHB
    g.append(poly(T(cloak), P['stat'], INK, 2))
    g.append(poly(T([(720, 1330), (762, 1335), (768, 1450), (756, 1560), (746, 1616), (734, 1585), (729, 1540), (725, 1500), (716, 1490), (714, 1472), (718, 1455), (720, 1400)]), P['stat_sh'], 'none', 0))
    g.append(poly(T([(549, 1305), (590, 1317), (623, 1322), (657, 1325), (690, 1328), (720, 1330), (722, 1288), (690, 1294), (650, 1300), (600, 1302), (565, 1298)]), P['stat_sh'], 'none', 0))
    g.append(poly(T(HEAD + [(884, 1176), (860, 1180), (830, 1180), (794, 1175)]), '#7A7784', INK, 1.8))
    g.append(line(T(RTOP + RH[:6]), P['stat_rim'], 2.5)); g.append(line(T(HEAD[5:]), P['stat_rim'], 2.5)); g.append(line(T(LTOP[3:]), P['stat_rim'], 2, 'opacity=".7"'))
    g.append(line(T([(951, 1340), (951, 1600), (964, 1610)]), P['stat_rim'], 2.2))
    # scaffold: a tower of poles and ledgers round the figure, braced towers under both arms, a small derrick on top
    fr = [TS((660, y), (1020, y)) for y in (1420, 1612, 1804)] + [TS((375, 1244), (585, 1244)), TS((1095, 1244), (1305, 1244))]   # ledgers passing in front
    g.append(segs(fr, INK, 3.2)); g.append(segs(fr, '#B08A5C', 1.6))
    # --- the town at the foot of the mountain (generated sobrados: pastel fronts, tiled roofs or parapets, tall windows)
    HOUSE = ['#E2B064', '#D9917D', '#A9BCC4', '#EFDDBC', '#9EAE84', '#E8C5A0', '#C7A3B5', '#F2E2B4']
    x = 400
    while x < 1940:
        w = R.uniform(84, 150); hh = R.uniform(80, 150) if x < 1440 else R.uniform(56, 92); top = 772 - hh; col = R.choice(HOUSE)
        g.append(poly([(x, 772), (x, top), (x + w, top), (x + w, 772)], col, INK, 2.5))
        if R.random() < .55:
            g.append(poly([(x - 7, top), (x + w + 7, top), (x + w - 16, top - 24), (x + 16, top - 24)], P['roof'], INK, 2.5))
            for k in range(1, 3): g.append(line([(x - 7 + k * 6, top - k * 8), (x + w + 7 - k * 6, top - k * 8)], P['roof_d'], 1.5))
        else:
            g.append(poly([(x - 3, top), (x + w + 3, top), (x + w + 3, top - 13), (x - 3, top - 13)], P['frame'], INK, 2))
            for u in range(int(x + 12), int(x + w - 6), 18): g.append(line([(u, top - 13), (u, top - 22)], INK, 4)); g.append(ell(u, top - 25, 4, 4, P['frame'], INK, 1.5))
        nr = max(1, int((hh - 24) // 44)); nc = max(1, int((w - 16) // 34))
        for r_ in range(nr):
            for c_ in range(nc):
                wx = x + 12 + c_ * (w - 24) / nc + ((w - 24) / nc - 16) / 2; wy = top + 16 + r_ * 44
                g.append(poly([(wx, wy + 30), (wx, wy + 6), (wx + 8, wy), (wx + 16, wy + 6), (wx + 16, wy + 30)], P['win'], INK, 1.5))
                g.append(line([(wx - 2, wy + 31), (wx + 18, wy + 31)], P['frame'], 3))
        x += w
    for px_, top_ in ((1520, 560), (1758, 585)):   # imperial palms
        g.append(line([(px_, 772), (px_ + 4, top_)], INK, 10)); g.append(line([(px_, 772), (px_ + 4, top_)], '#B3A182', 6))
        for a in (-160, -130, -100, -70, -40, -10, 20):
            ex_, ey_ = px_ + 4 + 58 * math.cos(math.radians(a)), top_ + 30 * math.sin(math.radians(a)) + 22
            fr = [(px_ + 4, top_), ((px_ + 4 + ex_) / 2, top_ - 16 + (ey_ - top_) * .3), (ex_, ey_)]
            g.append(line(fr, INK, 9)); g.append(line(fr, '#5C7A45', 5))
    # --- the street: Portuguese pavement, black-and-white waves laid in perspective (generated)
    g.append(poly([(0, 772), (1920, 772), (1920, 1080), (0, 1080)], P['pave'], INK, 2.5))
    HZ, FC, CAMH = 700, 900.0, 1.6
    def wave_y(d, xs): return [(xx, HZ + FC * CAMH / (d + .25 * math.sin(((xx - 960) * d / FC) / .55))) for xx in xs]
    xs = list(range(0, 1921, 8)); ds = [3.4 + .62 * k for k in range(30)]
    for k in range(0, len(ds) - 1, 2):
        a, b = wave_y(ds[k], xs), wave_y(ds[k + 1], xs)
        band = [(x_, max(774, y_)) for x_, y_ in a] + [(x_, max(774, y_)) for x_, y_ in b[::-1]]
        g.append(poly(band, P['wave'], 'none', 0, 'opacity=".42"'))
    # --- the tram (bonde aberto) and its overhead wire
    g.append(line([(880, 612), (1920, 604)], '#3A3230', 2))
    g.append(poly([(1172, 776), (1172, 712), (1440, 712), (1440, 776)], '#D6B25C', INK, 2.5))
    g.append(poly([(1160, 712), (1452, 712), (1446, 698), (1166, 698)], '#5E5A52', INK, 2.5))
    g.append(poly([(1172, 776), (1440, 776), (1440, 788), (1172, 788)], '#4E6B48', INK, 2.5))
    for u in range(1180, 1440, 37): g.append(line([(u, 712), (u, 776)], INK, 3))
    for i, u in enumerate(range(1196, 1430, 37)):
        if i % 3 == 1: continue
        g.append(ell(u, 734, 8, 9, R.choice(['#C99476', '#8E5E45', '#E0B497']), INK, 1.5)); g.append(ell(u, 726, 13, 3.5, R.choice(['#E3C68A', '#3B3A40', '#5A4636']), INK, 1.5))
        g.append(poly([(u - 10, 744), (u + 10, 744), (u + 11, 762), (u - 11, 762)], R.choice(['#3B3A40', '#D9CCB0', '#2E4D5E', '#8E3B3A']), INK, 1.5))
    for u in (1205, 1408): g.append(ell(u, 792, 13, 13, '#2E2A28', INK, 2))
    g.append(line([(1300, 698), (1236, 612)], INK, 3)); g.append(poly([(1180, 716), (1240, 716), (1240, 730), (1180, 730)], P['frame'], INK, 1.5))
    # --- people in the middle distance, walking toward the church
    person20(g, 1528, 868, 200, 'dress', -1, 'cloche', '#7A5A86', '#E9D7B0', '#E0B497', '#3A2A20', '#2E2A30', stride=.5)
    person20(g, 1586, 872, 214, 'suit', -1, 'fedora', '#4A4A52', '#F2EEE6', '#C99476', '#2A1F1A', '#6B5A48', stride=.5)
    person20(g, 1712, 880, 222, 'suit', -1, 'boater', '#C9BBA0', '#F2EEE6', '#B98060', '#2A1F1A', '#E3C68A', stride=.25)
    # --- the church on the left (baroque front, bell tower at the frame edge, open door with candle light)
    g.append(poly([(0, 906), (0, 300), (92, 300), (92, 906)], P['church'], INK, 3))
    g.append(poly(arc(46, 300, 46, 52, 180, 360, 12), P['trim'], INK, 3)); g.append(segs([((46, 248), (46, 214)), ((34, 226), (58, 226))], INK, 5))
    g.append(poly(arc(46, 382, 26, 30, 180, 360, 10) + [(72, 440), (20, 440)], '#3E2E26', INK, 2.5)); g.append(ell(46, 410, 12, 14, P['brass'], INK, 2))
    g.append(poly([(0, 452), (98, 452), (98, 464), (0, 464)], P['trim'], INK, 2))
    g.append(poly([(92, 906), (92, 462), (430, 462), (430, 906)], P['church'], INK, 3))
    gable = [(100, 462), (110, 444), (138, 436), (160, 426), (178, 412), (198, 400), (230, 393), (262, 393), (294, 400), (314, 412), (332, 426), (354, 436), (382, 444), (392, 462)]
    g.append(poly(gable, P['church'], INK, 3)); g.append(line([(p[0], p[1] + 12) for p in gable[1:-1]], P['trim'], 3))
    g.append(segs([((246, 393), (246, 352)), ((232, 366), (260, 366))], INK, 6)); g.append(segs([((246, 393), (246, 352)), ((232, 366), (260, 366))], P['trim'], 2.5))
    for x0, x1 in ((92, 124), (398, 430)): g.append(poly([(x0, 906), (x0, 462), (x1, 462), (x1, 906)], P['trim'], INK, 2.5))
    g.append(poly([(92, 600), (430, 600), (430, 616), (92, 616)], P['trim'], INK, 2.5))
    g.append(ell(246, 530, 30, 30, '#3E2E26', INK, 3)); g.append(ell(246, 530, 38, 38, 'none', P['trim'], 6))
    for wx in (150, 318): g.append(poly(arc(wx + 14, 500, 14, 14, 180, 360, 8) + [(wx + 28, 570), (wx, 570)], '#3E2E26', INK, 2.5))
    door = arc(246, 730, 62, 50, 180, 360, 14) + [(308, 906), (184, 906)]
    g.append(poly(door, 'url(#c_door)', INK, 3)); g.append(line(arc(246, 730, 72, 60, 180, 360, 14), P['trim'], 8)); g.append(line(arc(246, 730, 72, 60, 180, 360, 14), INK, 2))
    g.append(poly([(184, 734), (204, 742), (204, 906), (184, 906)], P['door'], INK, 2)); g.append(poly([(308, 734), (288, 742), (288, 906), (308, 906)], P['door'], INK, 2))
    for k in range(3): g.append(ell(228 + k * 18, 820, 3, 7, '#FFE6A8', 'none', 0, 'opacity=".9"'))   # candles inside
    g.append(poly([(130, 640), (170, 640), (170, 712), (130, 712)], '#F6EEDD', INK, 2))   # the appeal poster, the statue drawn on it
    g.append(poly([(136, 666), (164, 663), (164, 668), (152, 668), (153, 704), (147, 704), (148, 668), (136, 669)], '#8A8590', 'none', 0))
    g.append(ell(150, 658, 4, 5, '#8A8590', 'none', 0))
    for i, (y0, x1) in enumerate(((906, 470), (924, 485), (941, 500))):   # three steps
        g.append(poly([(0, y0), (x1, y0), (x1 + 6, y0 + 18), (0, y0 + 18)], '#D8CBB4' if i % 2 == 0 else '#CDBFA6', INK, 2.5))
    # the church's shadow falls toward us (the sun is behind the scene): it also calms the corner under the odometer
    g.append(poly([(0, 958), (506, 958), (470, 1000), (330, 1080), (0, 1080)], '#5E4E44', 'none', 0, 'opacity=".32"'))
    # --- lamp post on the right
    g.append(line([(1870, 940), (1870, 470)], INK, 12)); g.append(line([(1870, 940), (1870, 470)], '#2E3A3A', 7))
    g.append(poly([(1852, 470), (1888, 470), (1882, 430), (1858, 430)], '#F6E3A8', INK, 2.5)); g.append(poly([(1850, 430), (1890, 430), (1870, 414)], '#2E3A3A', INK, 2.5))
    g.append(poly([(1856, 940), (1884, 940), (1880, 900), (1860, 900)], '#2E3A3A', INK, 2))
    # --- the donation box on its post
    g.append(poly([(553, 722), (567, 722), (569, 924), (551, 924)], '#6E4228', INK, 2.5))
    g.append(poly([(530, 940), (590, 940), (580, 922), (540, 922)], '#6E4228', INK, 2.5))
    g.append(poly([(510, 646), (610, 646), (610, 724), (510, 724)], P['box'], INK, 3))
    g.append(poly([(590, 646), (610, 646), (610, 724), (590, 724)], P['box_d'], 'none', 0))
    g.append(poly([(504, 646), (616, 646), (606, 628), (514, 628)], P['box_l'], INK, 3))
    g.append(poly([(542, 634), (580, 634), (580, 640), (542, 640)], INK, INK, 1))
    for u in (522, 598): g.append(poly([(u - 4, 647), (u + 4, 647), (u + 4, 723), (u - 4, 723)], P['iron'], 'none', 0))
    g.append(segs([((560, 662), (560, 706)), ((546, 676), (574, 676))], INK, 9)); g.append(segs([((560, 662), (560, 706)), ((546, 676), (574, 676))], P['brass'], 5))
    g.append(line([(612, 630), (612, 724)], RIM1, 3, 'opacity=".8"'))
    # --- the queue at the box (left to right): priest at the door, a girl, the man at the slot, a woman, an old man, a worker
    person20(g, 352, 946, 392, 'priest', 1, 'saturno', '#26201F', '#F1ECE2', '#C7987A', '#4A3A30', '#26201F')
    hand_girl = person20(g, 470, 942, 205, 'dress', 1, 'cloche', '#C9705E', '#F2E6CC', '#D7A88A', '#6A4430', '#EAD7B0', reach=(530, 732), child=True)
    hand_man = person20(g, 694, 934, 402, 'suit', -1, 'fedora', '#3A3A42', '#F2EEE6', '#B98060', '#2A1F1A', '#5B4535', reach=(592, 624))
    hand_wom = person20(g, 838, 936, 368, 'dress', -1, 'cloche', '#2E4D5E', '#D7B062', '#E0B497', '#2A1F1A', '#8E3B3A', reach=(790, 726), coin=True, bag='#5A3A2A')
    person20(g, 968, 938, 388, 'suit', -1, 'boater', '#D6C9AC', '#F4F0E6', '#C99476', '#BDB3A6', '#E3C68A', cane=True)
    hand_wrk = person20(g, 1100, 940, 382, 'worker', -1, 'flatcap', '#5B4636', '#ECE4D4', '#8E5E45', '#1E1814', '#4A4440', reach=(1030, 552))
    # --- coins: one dropping into the slot, one tossed by the girl, one flipped by the worker
    def coin(cx, cy, r, tilt=.7, op=1):
        o = f'opacity="{op:.2f}"'
        g.append(ell(cx, cy, r, r * tilt, GOLD, INK, 1.8, o)); g.append(ell(cx - r * .2, cy - r * .15 * tilt, r * .5, r * .3 * tilt, '#FFF0C2', 'none', 0, o))
    coin(hand_man[0] - 8, hand_man[1] + 4, 9)
    g.append(segs([((hand_man[0] - 8, hand_man[1] + 16), (hand_man[0] - 8, hand_man[1] + 22)), ((hand_man[0] - 16, hand_man[1] + 14), (hand_man[0] - 17, hand_man[1] + 20))], INK, 2))
    tr = [bez((hand_girl[0] + 4, hand_girl[1] - 6), (548, 640), (556, 640), t / 10) for t in range(0, 8)]
    g.append(line(tr, GOLD, 3, 'stroke-dasharray="6 7" opacity=".9"')); coin(tr[-1][0], tr[-1][1], 9, .55)
    coin(hand_wrk[0] - 6, hand_wrk[1] - 52, 11, .3)
    g.append(segs([((hand_wrk[0] - 22, hand_wrk[1] - 70), (hand_wrk[0] - 28, hand_wrk[1] - 78)), ((hand_wrk[0] + 10, hand_wrk[1] - 70), (hand_wrk[0] + 16, hand_wrk[1] - 78)),
                   ((hand_wrk[0] - 6, hand_wrk[1] - 74), (hand_wrk[0] - 6, hand_wrk[1] - 84))], GOLD, 3))
    g.append(line([(hand_wrk[0] - 4, hand_wrk[1] - 10), (hand_wrk[0] - 6, hand_wrk[1] - 38)], GOLD, 3, 'stroke-dasharray="5 6"'))
    # --- the gift rises from the box to the mountain: a trail of coins getting smaller
    p0, p1, p2 = (564, 612), (610, 380), (1262, 408)
    n = 20
    for i in range(n):
        t = .05 + .93 * i / (n - 1); cx, cy = bez(p0, p1, p2, t); r = 9 - 5.5 * i / (n - 1)
        coin(cx, cy, r, .62, 1 - .45 * i / (n - 1))
    # --- the 捐 badge and the year label
    g.append(ell(468, 600, 36, 36, GOLD, INK, 3.5)); g.append(ell(468, 600, 28, 28, 'none', '#C9953C', 2.5))
    g.append(f'<text x="468" y="615" font-family="Noto Sans CJK SC" font-weight="900" font-size="40" text-anchor="middle" fill="{INK}">捐</text>')
    g.append(label(1456, 318, '1922 → 1931', 46))
    write('christ_1922', defs, g)


# ================================================================================================ 2 + 3: the shared camera
D, HC, FL, CX, HY, PHI = 240.0, 30.0, 1560.0, 1010.0, 575.0, math.radians(18)
def P3(X, Y, Z):
    zr = Z + D; return (CX + FL * X / zr, HY - FL * (Y - HC) / zr)
def rot(u, v): return (u * math.cos(PHI) - v * math.sin(PHI), u * math.sin(PHI) + v * math.cos(PHI))
def ring(A, B, t, n=2.0):
    c, s = math.cos(t), math.sin(t)
    if n == 2.0: return rot(A * c, B * s)
    e = 2 / n; return rot(A * math.copysign(abs(c) ** e, c), B * math.copysign(abs(s) ** e, s))
def nrm(A, B, t):
    c, s = math.cos(t), math.sin(t); nu, nv = c / A, s / B; L = math.hypot(nu, nv); return rot(nu / L, nv / L)
def facing(A, B, t):
    """cosine between the wall's outward normal and the direction to the camera"""
    X, Z = ring(A, B, t); nx, nz = nrm(A, B, t); vx, vz = -X, -D - Z; return (nx * vx + nz * vz) / math.hypot(vx, vz)
def vis_ts(A, B, n=1440):
    ts = [2 * math.pi * i / n for i in range(n)]; v = [facing(A, B, t) > 0 for t in ts]
    s = next(i for i in range(n) if v[i] and not v[i - 1]); out = []; i = s
    while v[i % n]: out.append(ts[i % n] + (2 * math.pi if i >= n else 0)); i += 1
    return out
def bays(A, B, nb=80, N=4000, t0=0.0):
    """bay boundaries at equal arc length round the ellipse"""
    ts = [t0 + 2 * math.pi * i / N for i in range(N + 1)]; Pp = [ring(A, B, t) for t in ts]; cum = [0.0]
    for a, b in zip(Pp, Pp[1:]): cum.append(cum[-1] + math.dist(a, b))
    L = cum[-1]; out = []; j = 0
    for k in range(nb + 1):
        d = L * k / nb
        while j < N - 1 and cum[j + 1] < d: j += 1
        out.append(ts[j] + (ts[j + 1] - ts[j]) * (d - cum[j]) / ((cum[j + 1] - cum[j]) or 1))
    return out, L / nb
A_C, B_C = 94.0, 78.0                  # the amphitheatre's outer ellipse (m)
A_L, B_L, N_L = 116.0, 96.0, 4.0       # Nero's lake: a rounded-rectangle basin, a little bigger than the amphitheatre
def lake_pts(A=A_L, B=B_L, Y=0.0, n=240): return [P3(*(lambda q: (q[0], Y, q[1]))(ring(A, B, 2 * math.pi * i / n, N_L))) for i in range(n)]

LIGHT = (-.78, -.63)   # direction toward the sun (from the left, a little toward us)


def backdrop(g, R, pal, palace):
    """hills of Rome behind the valley; on the Oppian, Nero's golden house (frame 2) or plain roofs (frame 3)"""
    far = [(0, 586), (120, 572), (260, 558), (380, 566), (520, 550), (640, 560), (760, 574), (900, 566), (1040, 578), (1200, 570), (1360, 582),
           (1520, 568), (1680, 558), (1800, 566), (1920, 556)]
    g.append(poly(far + [(1920, 720), (0, 720)], pal['far'], pal['far_l'], 2))
    left = [(0, 540), (90, 532), (200, 526), (300, 534), (390, 550), (470, 572), (540, 600), (610, 630), (670, 662), (720, 700), (0, 700)]
    g.append(poly(left, pal['hillL'], INK, 2.5))
    right = [(800, 700), (860, 664), (940, 626), (1030, 594), (1130, 570), (1240, 552), (1360, 540), (1480, 534), (1600, 530), (1720, 524), (1840, 516), (1920, 512), (1920, 710)]
    g.append(poly(right, pal['hillR'], INK, 2.5))
    g.append(line([(p[0], p[1] + 3) for p in right[1:-1]], pal['hill_lit'], 4, 'opacity=".8"'))
    for _ in range(46):   # cypresses and pines dotted on the slopes (generated)
        x = R.uniform(0, 1920); hl = left if x < 760 else right; y = ey(hl[:-1] if x < 760 else right[:-1], x) + R.uniform(10, 60)
        if palace and 1000 < x < 1600 and y < 650: continue
        if R.random() < .6:
            hh = R.uniform(22, 40); g.append(poly([(x, y - hh), (x + hh * .16, y - hh * .5), (x + hh * .14, y), (x - hh * .14, y), (x - hh * .16, y - hh * .5)], pal['cyp'], INK, 1.5))
        else:
            r = R.uniform(10, 16); g.append(line([(x, y), (x + 2, y - r * 1.6)], INK, 3)); g.append(poly(blob(R, x + 2, y - r * 1.9, r, 9, .15), pal['pine'], INK, 1.5))
    if palace:
        # the Domus Aurea: arched podium, a long gilded colonnade, the domed octagon hall, wings
        g.append(poly([(1000, 650), (1000, 604), (1600, 600), (1600, 650)], pal['pod'], INK, 2.5))
        for x in range(1012, 1590, 30): g.append(poly(arc(x + 11, 626, 11, 10, 180, 360, 6) + [(x + 22, 648), (x, 648)], pal['pod_d'], INK, 1.5))
        g.append(poly([(1020, 604), (1020, 552), (1580, 548), (1580, 600)], pal['fac'], INK, 2.5))
        g.append(poly([(1020, 552), (1020, 566), (1580, 562), (1580, 548)], pal['fac_d'], 'none', 0))
        for x in range(1030, 1576, 16):   # colonnade
            yt = 566 - (x - 1020) * 4 / 560; g.append(poly([(x, 600), (x, yt), (x + 7, yt), (x + 7, 600)], pal['col'], INK, 1.2))
        g.append(poly([(1012, 556), (1588, 552), (1588, 542), (1012, 546)], pal['gild'], INK, 2))
        g.append(poly([(1012, 546), (1588, 542), (1560, 528), (1040, 532)], pal['roof'], INK, 2))
        g.append(line([(1040, 532), (1560, 528)], pal['gild'], 3))
        for x in range(1050, 1560, 46): g.append(poly([(x, 531), (x + 6, 519), (x + 12, 531)], pal['gild'], INK, 1.5))   # gilt acroteria
        g.append(poly([(1236, 546), (1236, 500), (1344, 500), (1344, 546)], pal['fac'], INK, 2.5))   # octagon drum
        for x in range(1244, 1340, 20): g.append(poly(arc(x + 6, 512, 6, 6, 180, 360, 6) + [(x + 12, 536), (x, 536)], pal['pod_d'], INK, 1.2))
        g.append(poly([(1230, 502), (1350, 502), (1350, 494), (1230, 494)], pal['gild'], INK, 2))
        dome = arc(1290, 494, 58, 44, 180, 360, 16)
        g.append(poly(dome, pal['gild'], INK, 2.5)); g.append(poly(arc(1290, 494, 58, 44, 270, 360, 8) + [(1290, 494)], pal['gild_d'], 'none', 0))
        for a in (210, 240, 270, 300, 330): g.append(line([(1290 + 58 * math.cos(math.radians(a)), 494 + 44 * math.sin(math.radians(a))), (1290, 494 - 44)], pal['gild_d'], 1.5))
        g.append(line(arc(1290, 494, 55, 41, 190, 265, 8), '#FFF0C2', 3, 'opacity=".9"'))
        g.append(poly([(1284, 452), (1296, 452), (1294, 440), (1286, 440)], pal['gild'], INK, 1.5))
        for x0 in (1060, 1490):   # two pavilions on the wings
            g.append(poly([(x0, 548), (x0, 516), (x0 + 60, 516), (x0 + 60, 548)], pal['fac'], INK, 2))
            g.append(poly([(x0 - 6, 516), (x0 + 66, 516), (x0 + 30, 496)], pal['gild'], INK, 2))
    g.append(poly([(0, 704), (300, 694), (700, 676), (1000, 670), (1400, 674), (1920, 690), (1920, 1080), (0, 1080)], pal['ground'], INK, 2))


def stone_pine(g, R, x, yb, top, r, pal):
    """a Roman umbrella pine: a bare leaning trunk forking under one wide, flat, scalloped crown"""
    fork = (x + 14, top + 34)
    g.append(line([(x, yb), (x - 12, (yb + top) / 2), fork], INK, 18)); g.append(line([(x, yb), (x - 12, (yb + top) / 2), fork], pal['trunk'], 11))
    for bx_ in (x - r * .45, x + r * .2, x + r * .55):
        g.append(line([fork, (bx_, top + 4)], INK, 9)); g.append(line([fork, (bx_, top + 4)], pal['trunk'], 5))
    up = []; n = 14
    for i in range(n + 1):
        u = -1 + 2 * i / n; bump = R.uniform(6, 14) if i % 2 else 0
        up.append((x + u * r, top - r * .3 * (1 - u * u) ** .6 - bump))
    lo = [(x + u * r * .96, top + r * .07 + R.uniform(-4, 4)) for u in [1 - 2 * i / 8 for i in range(9)]]
    crown = up + lo
    g.append(poly(crown, pal['canopy'][0], INK, 3))
    g.append(poly([(px, py + r * .12) for px, py in up[1:-1]] + [(x + r * .8, top + r * .07), (x - r * .8, top + r * .07)], pal['canopy'][2], 'none', 0, 'opacity=".7"'))   # the shaded underside
    g.append(line([(px + 3, py + 5) for px, py in up[1:9]], pal['canopy_lit'], 6, 'opacity=".85"'))   # sunlit rim of the crown (sun on the left)
    for _ in range(22):   # needle tufts along the top (generated ticks)
        i = R.randint(1, n - 1); px, py = up[i]; a = math.radians(R.uniform(-150, -30)); L = R.uniform(6, 11)
        g.append(line([(px, py + 6), (px + math.cos(a) * L, py + 6 + math.sin(a) * L)], pal['canopy'][1], 3))


def slope(g, R, pal):
    """the hillside under the camera, bottom left: calm and dark behind the odometer"""
    s = [(0, 900), (160, 916), (330, 940), (520, 966), (720, 996), (880, 1030), (960, 1080), (0, 1080)]
    g.append(poly(s, pal['slope'], INK, 3))
    for i in range(30):   # shrubs along its crest
        x = 10 + i * 32 + R.uniform(-6, 6)
        if x > 950: break
        y = ey(s[:7], x) + R.uniform(-2, 8); g.append(poly(blob(R, x, y, R.uniform(14, 24), 9, .2), R.choice(pal['shrub']), INK, 1.8))


TERR = [(1235, 1080), (1530, 900), (1920, 880)]
def terrace(g, pal):
    """the terrace corner, bottom right, with its balustrade (same in both frames)"""
    g.append(poly(TERR + [(1920, 1080)], pal['floor'], INK, 3))
    for k in range(1, 7):   # paving joints parallel to the balustrade, and across
        t = k / 7; a = lerp((1235, 1080), (1920, 1080), t); g.append(line([lerp(TERR[1], (1920, 1080), t * .9), lerp(TERR[0], (1920, 1080), t)], pal['floor_j'], 2))
        g.append(line([lerp(TERR[1], TERR[2], t), (1920 - (1 - t) * 0, 880 + 200 * t)], pal['floor_j'], 2, 'opacity=".0"'))
    for k in range(1, 6): y = 900 + k * 34; g.append(line([(1530 - (y - 900) * 1.64, y), (1920, y - 4)], pal['floor_j'], 1.6))
    def bal(a, b, ha, hb, n):
        base = lambda t: lerp(a, b, t); hh = lambda t: ha + (hb - ha) * t
        top = [(base(t)[0], base(t)[1] - hh(t)) for t in (0, 1)]
        g.append(poly([a, b, (b[0], b[1] - hb * .16), (a[0], a[1] - ha * .16)], pal['bal_d'], INK, 2.5))   # plinth
        for i in range(n):   # balusters, bigger as they come closer
            t = (i + .5) / n; bx, by = base(t); h_ = hh(t); w_ = h_ * .17; y0 = by - h_ * .16; y1 = by - h_ * .84
            g.append(poly([(bx - w_ * .5, y0), (bx + w_ * .5, y0), (bx + w_ * .3, y0 - (y0 - y1) * .3), (bx + w_ * .55, y0 - (y0 - y1) * .62), (bx + w_ * .3, y1), (bx - w_ * .3, y1),
                           (bx - w_ * .55, y0 - (y0 - y1) * .62), (bx - w_ * .3, y0 - (y0 - y1) * .3)], pal['bal'], INK, 2))
        g.append(poly([(a[0], a[1] - ha * .84), (b[0], b[1] - hb * .84), top[1], top[0]], pal['bal'], INK, 2.5))   # rail
        g.append(line([(top[0][0], top[0][1] + 3), (top[1][0], top[1][1] + 3)], pal['bal_lit'], 4))
    bal(TERR[2], TERR[1], 74, 80, 16)
    bal(TERR[1], TERR[0], 80, 175, 7)


def portico(g, R, pal):
    """colonnades round the far half of the lake, with a pavilion at each end"""
    A0, B0 = A_L + 8, B_L + 8; A1, B1 = A_L + 15, B_L + 15; n = 360; CH = 8.6
    ts = [2 * math.pi * i / n for i in range(n)]
    keep = [t for t in ts if ring(A0, B0, t, N_L)[1] > -12]
    i0 = next(i for i in range(n) if ring(A0, B0, ts[i], N_L)[1] > -12 and ring(A0, B0, ts[i - 1], N_L)[1] <= -12)
    seq = [ts[(i0 + k) % n] + (2 * math.pi if i0 + k >= n else 0) for k in range(len(keep))]
    def at(A, B, t, Y): X, Z = ring(A, B, t, N_L); return P3(X, Y, Z)
    wall = [at(A0, B0, t, CH) for t in seq] + [at(A0, B0, t, 0) for t in seq[::-1]]
    g.append(poly(wall, pal['por_wall'], INK, 2))
    roof = [at(A0, B0, t, CH + 1) for t in seq] + [at(A1, B1, t, CH + 3.2) for t in seq[::-1]]
    g.append(poly(roof, pal['por_roof'], INK, 2))
    for k in range(1, 4):
        g.append(line([lerp(at(A0, B0, t, CH + 1), at(A1, B1, t, CH + 3.2), k / 4) for t in seq], pal['por_roof_d'], 1.2))
    # columns every ~5 m along the inner ring
    Pp = [ring(A0, B0, t, N_L) for t in seq]; cum = [0.0]
    for a, b in zip(Pp, Pp[1:]): cum.append(cum[-1] + math.dist(a, b))
    m = int(cum[-1] / 4.6); cols = []
    for k in range(m + 1):
        d = cum[-1] * k / m; j = min(range(len(cum)), key=lambda i: abs(cum[i] - d)); cols.append(seq[j])
    ent = [at(A0, B0, t, CH + 1) for t in seq] + [at(A0, B0, t, CH) for t in seq[::-1]]
    for t in cols:
        X, Z = ring(A0, B0, t, N_L); zr = Z + D; w = FL * .5 / zr
        b_ = P3(X, 0, Z); t_ = P3(X, CH, Z)
        g.append(poly([(b_[0] - w, b_[1]), (b_[0] + w, b_[1]), (t_[0] + w * .85, t_[1]), (t_[0] - w * .85, t_[1])], pal['col'], INK, 1.3))
        g.append(line([(t_[0] - w * .5, t_[1] + 4), (b_[0] - w * .5, b_[1] - 2)], pal['col_lit'], 1.4))
        g.append(poly([(t_[0] - w * 1.4, t_[1]), (t_[0] + w * 1.4, t_[1]), (t_[0] + w * 1.1, t_[1] + 3), (t_[0] - w * 1.1, t_[1] + 3)], pal['gild'], INK, 1))
    g.append(poly(ent, pal['gild'], INK, 1.8))
    for t in (seq[0], seq[-1]):   # end pavilions
        X, Z = ring(A0 + 3, B0 + 3, t, N_L); zr = Z + D; s = FL / zr; bx, by = P3(X, 0, Z)
        w, hh = 7 * s, 11 * s
        g.append(poly([(bx - w, by), (bx - w, by - hh), (bx + w, by - hh), (bx + w, by)], pal['fac'], INK, 2))
        for k in range(4): xx = bx - w + w * 2 * (k + .5) / 4; g.append(poly([(xx - s * .4, by), (xx - s * .4, by - hh * .8), (xx + s * .4, by - hh * .8), (xx + s * .4, by)], pal['col'], INK, 1.2))
        g.append(poly([(bx - w - s, by - hh), (bx + w + s, by - hh), (bx, by - hh - 5 * s)], pal['gild'], INK, 2))
    return cols


def nero(g, x, yb, h, rimc='#FFCF7A'):
    """the emperor seen from behind on his terrace: still, upright, hands clasped behind his back, toga with a purple
    border, a gilt laurel wreath tied with ribbons; a dark silhouette with a warm rim light from the low sun on the left. No face."""
    SIL, FOLD, PUR = '#2B2029', '#4A3843', '#5C2A55'
    lw = 3; rw = 4.5
    sh = yb - .82 * h; hip = yb - .5 * h; hem = yb - .035 * h; hcx, hcy = x, yb - .918 * h; hrx, hry = .056 * h, .064 * h
    g.append(poly([(x + .14 * h, yb), (x - .1 * h, yb), (x + .5 * h, yb + .05 * h), (x + .7 * h, yb + .04 * h)], '#3A2A26', 'none', 0, 'opacity=".35"'))   # shadow away from the sun
    for f in (x - .05 * h, x + .05 * h):   # sandals under the hem
        g.append(poly([(f - .035 * h, yb - .022 * h), (f + .035 * h, yb - .022 * h), (f + .04 * h, yb), (f - .04 * h, yb)], '#1E161C', INK, 2))
    # upper arms, elbows out (the hands are clasped behind the back)
    for s_ in (-1, 1):
        ua = [(x + s_ * .12 * h, sh + .03 * h), (x + s_ * .175 * h, sh + .13 * h), (x + s_ * .182 * h, yb - .6 * h), (x + s_ * .13 * h, yb - .57 * h), (x + s_ * .1 * h, sh + .12 * h)]
        g.append(poly(ua, SIL, INK, lw))
        if s_ < 0: g.append(rim(ua, -1, rw, rimc))
    body = [(x - .05 * h, sh - .02 * h), (x - .13 * h, sh + .004 * h), (x - .148 * h, sh + .06 * h), (x - .14 * h, hip), (x - .146 * h, yb - .25 * h), (x - .16 * h, hem),
            (x - .05 * h, hem + .006 * h), (x + .06 * h, hem - .004 * h), (x + .16 * h, hem), (x + .146 * h, yb - .25 * h), (x + .14 * h, hip),
            (x + .148 * h, sh + .06 * h), (x + .13 * h, sh + .004 * h), (x + .05 * h, sh - .02 * h)]
    g.append(poly(body, SIL, INK, lw)); g.append(rim(body, -1, rw, rimc))
    g.append(line([(x - .16 * h, hem - .012 * h), (x - .05 * h, hem - .006 * h), (x + .06 * h, hem - .016 * h), (x + .16 * h, hem - .012 * h)], PUR, .02 * h))   # purple hem
    # the toga's sweep from the left shoulder down to the right hip, with its purple edge, and the folds below
    sweep = [(x - .11 * h, sh + .01 * h), (x - .03 * h, sh + .1 * h), (x + .06 * h, sh + .2 * h), (x + .13 * h, hip - .02 * h), (x + .145 * h, hip + .03 * h)]
    g.append(line(sweep, PUR, .018 * h)); g.append(line([(px, py - .01 * h) for px, py in sweep], FOLD, 2))
    for k in range(3):
        g.append(line([(x - .12 * h + k * .02 * h, sh + .12 * h + k * .08 * h), (x - .02 * h + k * .03 * h, sh + .21 * h + k * .07 * h), (x + .1 * h, hip + .04 * h + k * .04 * h)], FOLD, 2.5))
    for k in range(5):
        x0 = x - .1 * h + k * .05 * h; g.append(line([(x0, hip + .08 * h), (x0 - .004 * h, yb - .26 * h), (x0 - .01 * h, hem - .03 * h)], FOLD, 2.5))
    # forearms meeting behind the back
    for s_ in (-1, 1):
        e = (x + s_ * .155 * h, yb - .585 * h); hnd = (x - s_ * .02 * h, yb - .55 * h)
        g.append(line([e, hnd], INK, .05 * h + 4)); g.append(line([e, hnd], SIL, .05 * h)); g.append(line([(e[0], e[1] - .02 * h), (hnd[0], hnd[1] - .02 * h)], FOLD, 2))
    g.append(ell(x, yb - .55 * h, .038 * h, .028 * h, SIL, INK, 2))
    # neck, head with short hair, the wreath: a band of gilt leaves round the back of the head, two ribbon ends at the nape
    g.append(poly([(x - .036 * h, hcy + hry * .5), (x + .036 * h, hcy + hry * .5), (x + .05 * h, sh), (x - .05 * h, sh)], SIL, INK, 2.5))
    head = arc(hcx, hcy, hrx, hry, 0, 360, 24)[:-1]
    g.append(poly(head, SIL, INK, lw)); g.append(rim(head, -1, rw * .8, rimc))
    yb_ = hcy - hry * .12   # the wreath band sits a little above the middle of the head
    band = [(hcx + hrx * 1.03 * math.cos(math.radians(a)), yb_ + hry * .2 * math.sin(math.radians(a))) for a in range(180, -1, -15)]
    g.append(line(band, INK, .02 * h + 3)); g.append(line(band, '#B88A3A', .02 * h))
    for i, (lx, ly) in enumerate(band):
        for s2 in (-1, 1):
            ang = -60 if lx < hcx else 60
            ang = ang + s2 * 22 + (180 if lx > hcx else 0)
            cx_, cy_ = lx + math.cos(math.radians(ang)) * .012 * h, ly + math.sin(math.radians(ang)) * .012 * h
            g.append(f'<ellipse cx="{cx_:.1f}" cy="{cy_:.1f}" rx="{.016 * h:.1f}" ry="{.0065 * h:.1f}" transform="rotate({ang:.0f} {cx_:.1f} {cy_:.1f})" fill="#D8A640" stroke="{INK}" stroke-width="1.4"/>')
    g.append(line([(px + 1, py - 2) for px, py in band[:5]], '#FFE7A8', 2, 'opacity=".8"'))


def roman(g, x, yb, h, kind, cloth, skin='#C08A66', hair='#2E231D', palla=None, child=False, left=None, right=None, rimc='#FFE3A6'):
    """a Roman citizen seen from behind (tunic / toga / stola with palla), no face, warm rim on the left"""
    lw = max(2.0, h * .0065); rw = max(2.5, h * .011); aw = h * (.052 if child else .044)
    hr = h * (.085 if child else .062); hrx = hr * .88; hc = yb - h + hr; sh = hc + hr + .04 * h
    ws = h * (.13 if child else (.105 if kind == 'stola' else .125)); hip = yb - .5 * h
    hem = {'tunic': yb - .3 * h, 'toga': yb - .04 * h, 'stola': yb - .03 * h}[kind]
    g.append(poly([(x + .1 * h, yb), (x - .1 * h, yb), (x + .45 * h, yb + .05 * h), (x + .62 * h, yb + .04 * h)], '#4A4038', 'none', 0, 'opacity=".25"'))
    if kind == 'tunic':
        for f in (x - .05 * h, x + .05 * h):
            g.append(line([(f, hem - 4), (f, yb - .03 * h)], INK, .05 * h + lw * 2)); g.append(line([(f, hem - 4), (f, yb - .03 * h)], skin, .05 * h))
    for f in (x - .05 * h, x + .05 * h): g.append(poly([(f - .03 * h, yb - .025 * h), (f + .03 * h, yb - .025 * h), (f + .035 * h, yb), (f - .035 * h, yb)], '#5A3A26', INK, lw * .8))
    flare = 1.25 if kind != 'tunic' else 1.15
    body = [(x - .04 * h, sh - .014 * h), (x - ws, sh + .01 * h), (x - ws * 1.04, sh + .1 * h), (x - ws * .95, hip), (x - ws * flare, hem),
            (x + ws * flare, hem), (x + ws * .95, hip), (x + ws * 1.04, sh + .1 * h), (x + ws, sh + .01 * h), (x + .04 * h, sh - .014 * h)]
    g.append(poly(body, cloth, INK, lw)); g.append(rim(body, -1, rw, rimc))
    if kind == 'tunic': g.append(line([(x - ws * .95, hip - .02 * h), (x + ws * .95, hip - .02 * h)], '#6B4A30', .018 * h))
    if kind == 'toga':
        g.append(line([(x + ws * .8, sh + .01 * h), (x - ws * .1, sh + .16 * h), (x - ws * .9, hip + .02 * h)], INK, 2, 'opacity=".5"'))
        for k in range(3): g.append(line([(x + ws * (.6 - k * .3), hip + .05 * h), (x + ws * (.55 - k * .3), hem - .02 * h)], INK, 1.6, 'opacity=".35"'))
    if kind == 'stola':
        for k in range(3): g.append(line([(x + ws * (-.5 + k * .5), hip), (x + ws * (-.6 + k * .6), hem - .02 * h)], INK, 1.6, 'opacity=".35"'))
    # arms
    def arm(s, hand):
        mx, my = (s[0] + hand[0]) / 2, (s[1] + hand[1]) / 2; e = (mx + (.03 * h if hand[0] > x else -.03 * h), my + .02 * h)
        p = [s, e, hand]; g.append(line(p, INK, aw + lw * 2)); g.append(line(p, skin, aw))
        if kind != 'tunic': g.append(line([s, lerp(s, e, .8)], cloth, aw * 1.15))
        g.append(ell(hand[0], hand[1], aw * .55, aw * .6, skin, INK, lw * .8)); return p
    sL = (x - ws * .8, sh + .03 * h); sR = (x + ws * .8, sh + .03 * h)
    pL = arm(sL, left or (sL[0] - .02 * h, hip + .05 * h))
    pR = arm(sR, right or (sR[0] + .02 * h, hip + .05 * h))
    # head
    g.append(poly([(x - .022 * h, hc + hr * .6), (x + .022 * h, hc + hr * .6), (x + .025 * h, sh), (x - .025 * h, sh)], skin, INK, lw * .8))
    head = arc(x, hc, hrx, hr, 0, 360, 24)[:-1]
    g.append(poly(head, hair, INK, lw)); g.append(rim(head, -1, rw, rimc))
    if palla:   # the palla drawn over the head and shoulders
        pp = arc(x, hc - hr * .05, hrx * 1.18, hr * 1.12, 180, 360, 12) + [(x + ws * 1.05, sh + .06 * h), (x + ws * .9, sh + .22 * h), (x - ws * .9, sh + .22 * h), (x - ws * 1.05, sh + .06 * h)]
        g.append(poly(pp, palla, INK, lw)); g.append(rim(pp, -1, rw, rimc))
    g.append(line([(px - aw * .3, py) for px, py in pL], rimc, rw * .7, 'opacity=".8"'))


def tiny(g, x, yb, h, top, hair, skin, stride, kind='tunic', palla=None):
    """a small Roman walking away from us, toward the arches"""
    lw = max(.9, h * .04); hip = yb - h * .47; sh = yb - h * .8; hr = h * .075
    hem = yb - h * (.28 if kind == 'tunic' else .04); s = stride * h * .1
    if kind == 'tunic':
        for f in (x - s, x + s):
            g.append(line([(x + (f - x) * .3, hip), (f, yb - lw)], INK, h * .08 + lw * 2)); g.append(line([(x + (f - x) * .3, hip), (f, yb - lw)], skin, h * .08))
    g.append(poly([(x - h * .1, sh), (x + h * .1, sh), (x + h * (.14 if kind == 'tunic' else .16), hem), (x - h * (.14 if kind == 'tunic' else .16), hem)], top, INK, lw))
    for sg in (-1, 1): g.append(line([(x + sg * h * .1, sh + h * .03), (x + sg * h * .13, hip)], INK, h * .06 + lw * 2)); g.append(line([(x + sg * h * .1, sh + h * .03), (x + sg * h * .13, hip)], skin, h * .06))
    g.append(ell(x, yb - h * .9, hr * .9, hr, palla or hair, INK, lw))


# ------------------------------------------------------------------------------------------------ 2. colosseum_nero_lake
def colosseum_nero_lake():
    R = random.Random(64)
    pal = dict(sky0='#7C7DA4', sky1='#C99484', sky2='#F0B678', sky3='#FAD9A0', sun='#FFF3D2',
               far='#C19C8E', far_l='#A07F78', hillL='#9C7F62', hillR='#A08A55', hill_lit='#E2BF78', cyp='#4A5636', pine='#5F6B3E',
               pod='#E2C595', pod_d='#6E5040', fac='#F2DCAA', por_in='#7E5644', fac_d='#D9B97E', col='#FBEACB', col_lit='#FFFFFF', gild='#E9B64C', gild_d='#BB8730', roof='#B05A3A',
               ground='#8E9550', por_wall='#7A5444', por_roof='#B5603C', por_roof_d='#8E4A30',
               walk='#E3CDA0', rim_='#F3E2BE', slope='#3F4A2E', shrub=['#4E5E36', '#5C6B3C', '#455232'],
               trunk='#5E4632', canopy=['#4F5E34', '#5B6B3A', '#46542F'], canopy_lit='#C9B060',
               floor='#D8BF96', floor_j='#BBA07A', bal='#EAD6B0', bal_d='#BC9E78', bal_lit='#FFF0CC')
    defs = (f'<linearGradient id="n_sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{pal["sky0"]}"/><stop offset=".3" stop-color="{pal["sky1"]}"/>'
            f'<stop offset=".45" stop-color="{pal["sky2"]}"/><stop offset=".56" stop-color="{pal["sky3"]}"/></linearGradient>'
            f'<radialGradient id="n_sun" gradientUnits="userSpaceOnUse" cx="706" cy="560" r="420"><stop offset="0" stop-color="#FFF2C8" stop-opacity=".95"/>'
            f'<stop offset=".35" stop-color="#FFE0A0" stop-opacity=".45"/><stop offset="1" stop-color="#FFE0A0" stop-opacity="0"/></radialGradient>'
            f'<linearGradient id="n_water" gradientUnits="userSpaceOnUse" x1="0" y1="690" x2="0" y2="900"><stop offset="0" stop-color="#F7D28E"/>'
            f'<stop offset=".45" stop-color="#D9A47E"/><stop offset="1" stop-color="#6E7E9A"/></linearGradient>'
            f'<linearGradient id="n_grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A39A5A"/><stop offset="1" stop-color="#5E6A3A"/></linearGradient>')
    g = [f'<rect width="{W}" height="{H}" fill="url(#n_sky)"/>', f'<rect width="{W}" height="{H}" fill="url(#n_sun)"/>']
    g.append(ell(706, 556, 40, 40, pal['sun'], 'none', 0))
    pal['ground'] = 'url(#n_grass)'
    backdrop(g, R, pal, palace=True)
    # walk round the lake, then the porticoes, then the water
    walk = lake_pts(A_L + 5, B_L + 5)
    g.append(poly(walk, pal['walk'], INK, 2))
    portico(g, R, pal)
    lake = lake_pts()
    g.append(poly(lake, 'url(#n_water)', 'none', 0))
    ys = [p[1] for p in lake]; y_far, y_near = min(ys), max(ys)
    # reflections: the sun's path down the water, the colonnade's columns, ripples (all generated)
    for i in range(26):
        t = i / 25; y = y_far + 6 + (y_near - y_far - 14) * t; w = 10 + 70 * t * R.uniform(.6, 1)
        xs_ = [p[0] for p in lake if abs(p[1] - y) < 30];
        g.append(line([(706 - w / 2 + R.uniform(-8, 8), y), (706 + w / 2 + R.uniform(-8, 8), y)], '#FFF0C4', 2 + 3 * t, 'opacity=".85"'))
    for _ in range(170):
        x = R.uniform(min(p[0] for p in lake), max(p[0] for p in lake)); y = R.uniform(y_far + 4, y_near - 4)
        if not inside(lake, x, y) or not inside(lake, x + 30, y): continue
        t = (y - y_far) / (y_near - y_far); L = 8 + 30 * t
        g.append(line([(x, y), (x + L, y)], R.choice(['#FCE3AE', '#B98E7A', '#8E8CA4']), 1.2 + 2 * t, 'opacity=".7"'))
    # the pleasure boat: a little gilded barge with a purple awning
    bx, by, s = 1120, 772, 1.0
    g.append(poly([(bx - 46, by), (bx + 40, by), (bx + 56, by - 12), (bx - 58, by - 10)], '#8E5A34', INK, 2.5)); g.append(line([(bx - 56, by - 9), (bx + 54, by - 11)], pal['gild'], 3))
    g.append(poly([(bx - 26, by - 11), (bx - 26, by - 30), (bx + 22, by - 30), (bx + 22, by - 11)], 'none', INK, 2.5))
    g.append(poly([(bx - 34, by - 30), (bx + 30, by - 30), (bx + 22, by - 40), (bx - 26, by - 40)], '#6A2E5E', INK, 2.5))
    g.append(line([(bx - 46, by + 6), (bx + 44, by + 6)], '#FCE3AE', 3, 'opacity=".7"'))
    g.append(poly(lake, 'none', INK, 9)); g.append(poly(lake, 'none', pal['rim_'], 5))   # the stone kerb
    # the garden slope below, the umbrella pine, the terrace, the emperor
    slope(g, R, pal)
    stone_pine(g, R, 70, 1080, 470, 170, pal)
    terrace(g, pal)
    nero(g, 1622, 968, 420)
    g.append(label(780, 852, '尼禄的私人湖', 52))
    write('colosseum_nero_lake', defs, g)
    return lake


# ------------------------------------------------------------------------------------------------ 3. colosseum_return
STOREYS = [(0.0, 10.4, 0.0, 7.6), (11.8, 22.2, 12.6, 19.8), (23.6, 33.4, 24.4, 31.2)]   # (base, top, sill, arch crown) in m
BANDS = [(10.4, 11.8), (22.2, 23.6), (33.4, 34.8), (46.4, 48.0)]
KW = .6


def colosseum(g, R, pal, defs_out):
    A, B = A_C, B_C
    vis = vis_ts(A, B, 1440)
    def S(t, Y): X, Z = ring(A, B, t); return P3(X, Y, Z)
    def strip(Y0, Y1): return [S(t, Y1) for t in vis] + [S(t, Y0) for t in vis[::-1]]
    wall = strip(0, 48); xs = [p[0] for p in wall]; x0, x1 = min(xs), max(xs)
    tnear = max(vis, key=lambda t: facing(A, B, t)); xnear = S(tnear, 0)[0]
    defs_out.append(f'<linearGradient id="r_wall" gradientUnits="userSpaceOnUse" x1="{x0:.0f}" y1="0" x2="{x1:.0f}" y2="0"><stop offset="0" stop-color="{pal["w0"]}"/>'
                    f'<stop offset="{(xnear - x0) / (x1 - x0):.2f}" stop-color="{pal["w1"]}"/><stop offset=".86" stop-color="{pal["w2"]}"/><stop offset="1" stop-color="{pal["w3"]}"/></linearGradient>')
    g.append(poly(wall, 'url(#r_wall)', INK, 3))
    bt, Lb = bays(A, B, 80, 4000, t0=tnear - math.pi)   # a pier faces the camera square on
    def lit(t): nx, nz = nrm(A, B, t); return nx * LIGHT[0] + nz * LIGHT[1]
    info = []
    for k in range(80):
        ta, tb = bt[k], bt[k + 1]; ca, cb = facing(A, B, ta), facing(A, B, tb)
        if min(ca, cb) < .1: continue
        info.append((k, ta, tb, (ca + cb) / 2))
    # openings, statues in the upper arches
    for k, ta, tb, cm in info:
        def Q(w, Y): return S(ta + (tb - ta) * w, Y)
        sw = 2.2 if cm > .45 else 1.5
        right_side = Q(1, 0)[0] > Q(0, 0)[0]
        for si, (y0, y1, sill, crown) in enumerate(STOREYS):
            def archp(w0, w1, sl, cr):
                rr = (w1 - w0) * Lb / 2; sp = cr - rr; c = (w0 + w1) / 2
                return [Q(w0, sl)] + [Q(c - (w1 - w0) / 2 * math.cos(math.pi * i / 10), sp + rr * math.sin(math.pi * i / 10)) for i in range(11)] + [Q(w1, sl)]
            w0, w1 = .5 - KW / 2, .5 + KW / 2
            g.append(poly(archp(w0, w1, sill, crown), pal['jamb'], INK, sw))
            d = KW * min(.42, (1 - cm) * .8)
            far_right = Q(.5, 0)[0] < xnear   # left of the nearest pier we look into the right-hand jamb
            if far_right == right_side: inner = archp(w0, w1 - d, sill, crown - .2)
            else: inner = archp(w0 + d, w1, sill, crown - .2)
            g.append(poly(inner, pal['open'], 'none', 0))
            if si > 0:
                g.append(line([Q(w0 + .02, sill + 1.1), Q(w1 - .02, sill + 1.1)], pal['band'], 2.5 if cm > .4 else 1.5))   # the parapet inside
    # engaged columns on the piers, storey by storey (Tuscan, Ionic, Corinthian: lit or shaded flat tones)
    for k, ta, tb, cm in info:
        if k == info[0][0]: continue
        dt = tb - ta; cw = .62 / Lb
        def Bq(dw, Y): return S(ta + dt * dw, Y)
        col = pal['pil'] if lit(ta) > .2 else pal['pil_d']
        sw = 2 if cm > .45 else 1.4
        for (y0, y1, sill, crown) in STOREYS:
            g.append(poly([Bq(-cw, y0 + .3), Bq(cw, y0 + .3), Bq(cw, y1 - .6), Bq(-cw, y1 - .6)], col, INK, sw))
            g.append(poly([Bq(-cw * 1.5, y1 - .6), Bq(cw * 1.5, y1 - .6), Bq(cw * 1.5, y1), Bq(-cw * 1.5, y1)], col, INK, sw * .8))
        g.append(poly([Bq(-cw * .8, 34.8), Bq(cw * .8, 34.8), Bq(cw * .8, 46.4), Bq(-cw * .8, 46.4)], col, INK, sw * .8))   # attic pilaster
        if cm > .5: g.append(line([Bq(-cw * .55, 1), Bq(-cw * .55, 9.6)], pal['pil_hi'], 1.6))
    # entablatures between the storeys and the attic cornice
    for y0, y1 in BANDS:
        g.append(poly(strip(y0, y1), pal['band'], INK, 2))
        g.append(line([S(t, y0 + (y1 - y0) * .45) for t in vis], pal['band_d'], 1.4))
    # attic: square windows and gilt bronze shields in alternate bays, corbels for the awning masts
    for k, ta, tb, cm in info:
        def Q(w, Y): return S(ta + (tb - ta) * w, Y)
        if cm < .2: continue
        if k % 2: g.append(poly([Q(.4, 38.6), Q(.6, 38.6), Q(.6, 41.8), Q(.4, 41.8)], pal['open'], INK, 1.5))
        else: g.append(poly([Q(.5 + .14 * math.cos(a), 40.2 + 1.1 * math.sin(a)) for a in [2 * math.pi * i / 12 for i in range(12)]], pal['shield'], INK, 1.5))
        for w in (.2, .5, .8): g.append(poly([Q(w - .04, 44.2), Q(w + .04, 44.2), Q(w + .04, 45.0), Q(w - .04, 45.0)], pal['band_d'], 'none', 0))
    # masts on top with pennants, red hangings down the third storey
    FLAGS = ['#B8322A', '#E9B64C', '#F4EEE2', '#3E5A8C']
    for i, (k, ta, tb, cm) in enumerate(info):
        X, Z = ring(A, B, ta); zr = Z + D; b_ = P3(X, 46.0, Z); t_ = P3(X, 52.5, Z); s = FL / zr
        g.append(line([b_, t_], INK, max(1.6, s * .28)))
        if k % 2 == 0 and cm > .15:
            c = FLAGS[(k // 2) % 4]; fw = s * 2.4
            g.append(poly([t_, (t_[0] + fw, t_[1] + fw * .22), (t_[0], t_[1] + fw * .5)], c, INK, 1.4))
        if k % 6 == 3 and cm > .3:
            hw = .9 / Lb; dt = tb - ta
            def Bq(dw, Y): return S(ta + dt * dw, Y)
            g.append(poly([Bq(-hw, 33.3), Bq(hw, 33.3), Bq(hw, 25.4), Bq(0, 24.6), Bq(-hw, 25.4)], pal['banner'], INK, 1.8))
            g.append(line([Bq(-hw * .8, 26.2), Bq(0, 25.5), Bq(hw * .8, 26.2)], GOLD, 2.2))
            cc = Bq(0, 29.6); g.append(ell(cc[0], cc[1], s * .45, s * .45, GOLD, INK, 1.2))
    return info, bt, Lb, tnear, xnear


def colosseum_return(lake_outline):
    R = random.Random(80)
    pal = dict(sky0='#3A6BBB', sky1='#5B8FD6', sky2='#A9CBEB', cloud='#F4F7FB',
               far='#A9B6C6', far_l='#8796AA', hillL='#7E8E5A', hillR='#86964F', hill_lit='#C7D58A', cyp='#3D5230', pine='#4F6A36',
               ground='url(#r_plaza)', w0='#F6ECD4', w1='#EEE1C4', w2='#DCC9A4', w3='#C3AC84', pil='#FBF6EA', pil_d='#E4D6B8', pil_hi='#FFFFFF',
               band='#F4ECDA', band_d='#C9B48E', open='#3A332E', jamb='#9C7E5E', marble='#F8F4EC', shield='#D4A84A', banner='#B0302A',
               slope='#3E5530', shrub=['#4E6B3A', '#5B7A42', '#45603A'], trunk='#5E4632', canopy=['#4C6A36', '#58783E', '#42602F'], canopy_lit='#A8C46A',
               floor='#DED2BB', floor_j='#C2B293', bal='#EEE2CA', bal_d='#C4B191', bal_lit='#FFFFFF')
    defs = [f'<linearGradient id="r_sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{pal["sky0"]}"/><stop offset=".3" stop-color="{pal["sky1"]}"/>'
            f'<stop offset=".55" stop-color="{pal["sky2"]}"/></linearGradient>'
            f'<linearGradient id="r_plaza" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9CDB1"/><stop offset="1" stop-color="#C7B793"/></linearGradient>']
    g = ['<rect width="1920" height="1080" fill="url(#r_sky)"/>']
    for cx_, cy_, w in [(1640, 300, 54), (1760, 420, 40), (300, 470, 46)]:   # a few fair-weather clouds
        g.append(poly(blob(R, cx_, cy_, w, 10, .18), pal['cloud'], 'none', 0, 'opacity=".9"'))
        g.append(poly(blob(R, cx_ + w * .8, cy_ + 6, w * .65, 9, .15), pal['cloud'], 'none', 0, 'opacity=".9"'))
    backdrop(g, R, pal, palace=False)
    # paving joints on the new square (lines of constant depth, generated)
    for zr in [100, 108, 117, 127, 138, 150, 163]:
        y = HY + FL * HC / zr; g.append(line([(0, y), (1920, y)], '#B9A780', 1.5, 'opacity=".55"'))
    # the ghost of the lake, faint, where the water used to be
    g.append(poly(lake_outline, '#8DB6CF', '#5E8EB0', 3.5, 'fill-opacity=".22" stroke-dasharray="18 12" stroke-opacity=".9"'))
    dfs = []
    info, bt, Lb, tnear, xnear = colosseum(g, R, pal, dfs)
    defs.extend(dfs)
    # crowds streaming to the ground arches (world positions -> perspective size), drawn far to near
    TOPS = ['#E9E0CB', '#D8C7A2', '#B9473A', '#C98F45', '#5B6E8E', '#7C7A48', '#8E5B3E', '#F1EBDD', '#A4643F', '#3F5A73', '#C7B07A']
    SK = ['#C99572', '#B07F62', '#D9A88C', '#8E5E45']; HR = ['#2A211B', '#3A2A20', '#5A3A26', '#1A1512']
    crowd = []
    gates = [x for x in info if x[3] > .3]
    for k, ta, tb, cm in gates[1::2]:   # a stream to every other ground arch
        tm = (ta + tb) / 2; EX, EZ = ring(A_C + 1.0, B_C + 1.0, tm)
        SX, SZ = EX * .5 + R.uniform(-20, 20), -D + R.uniform(92, 100)
        for j in range(R.randint(16, 24)):
            u = R.random() ** .8; X = SX + (EX - SX) * u + R.uniform(-1.8, 1.8) * (1.5 - u); Z = SZ + (EZ - SZ) * u + R.uniform(-1.2, 1.2)
            crowd.append((X, Z, 0))
        for j in range(4): crowd.append((EX + R.uniform(-1.3, 1.3), EZ + R.uniform(.5, 1.6), 1))   # walking in under the arch
    for _ in range(40):   # people spread over the square
        X, Z = R.uniform(-115, 75), -D + R.uniform(93, 150)
        if ((X * math.cos(PHI) + Z * math.sin(PHI)) / A_C) ** 2 + ((-X * math.sin(PHI) + Z * math.cos(PHI)) / B_C) ** 2 > 1.12: crowd.append((X, Z, 0))
    for X, Z, door in sorted(crowd, key=lambda p: -p[1]):
        zr = Z + D; x, y = P3(X, 0, Z); h = FL * 1.7 * 1.3 / zr * R.uniform(.92, 1.05)
        if 110 < x < 730 and y > 925: continue
        kind = 'tunic' if R.random() < .7 else 'stola'
        top = R.choice(['#F1EBDD', '#E9E0CB', '#E8C36A', '#E2A15C']) if door else R.choice(TOPS)
        tiny(g, x, y, h, top, R.choice(HR), R.choice(SK), R.uniform(.2, .8), kind, R.choice(['#C9B48A', '#8E5B3E', '#5B6E8E', '#E9E0CB']) if kind == 'stola' else None)
    slope(g, R, pal)
    stone_pine(g, R, 70, 1080, 470, 170, pal)
    terrace(g, pal)
    # on the emperor's terrace now: a family of ordinary Romans looking at their new amphitheatre
    roman(g, 1692, 944, 340, 'stola', '#B9573E', '#D9A88C', '#3A2A20', palla='#6F83A6')
    roman(g, 1846, 942, 382, 'toga', '#F1EADA', '#B98060', '#2A1F1A', left=(1788, 790))
    roman(g, 1760, 946, 200, 'tunic', '#E3C67A', '#C99572', '#5A3A26', child=True, left=(1700, 760))
    write('colosseum_return', ''.join(defs), g)


if __name__ == '__main__':
    christ_1922()
    lk = colosseum_nero_lake()
    colosseum_return(lk)
