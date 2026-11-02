"""ep57 history-explainer key frames, set A (1920x1080 SVG each), drawn in code in the scene drawings' language
(ink #2A211B at 2-3 px, flat fills from a curated palette, gradients only for sky / glow / big surfaces,
hand-placed shapes plus generated repeats; no tracing, no filters, no image-derived shapes).
  chichen_calendar  El Castillo from a drone, as a calendar dial: 4 staircases x 91 + the platform = 365
  chichen_serpent   the equinox sunset: 7 light triangles on the north stair's west balustrade, down to the serpent head
  machu_palace      Machu Picchu lived in: thatched roofs, smoke, llamas, the ruler's silhouette, altitude line
  machu_hidden      the city above a sea of clouds; conquistadors marching along the river far below
El Castillo is a small 3D model (9 terraces, 4 stairs, temple) projected through a camera and painted back to front;
machu_palace runs machu_vector.py's own drawing code (roofs added to its house rows) and draws on top of it.
Keep-free zones (subtitle top-left, counter top-right, odometer bottom-left, seal bottom-right) hold no key content.
usage: hist_a.py [out_dir]   (default: the session scratchpad's sb57/hist)"""
import sys, os, math, random
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/sb57/hist'
W, H = 1920, 1080
INK, GOLD, CREAM, DARK = '#2A211B', '#F2C66E', '#FFF6E6', '#1E1612'
FONT = 'Noto Sans CJK SC'


# ---------------- 2D helpers (same as the scene scripts) ----------------
def pts(p): return ' '.join(f'{x:.1f},{y:.1f}' for x, y in p)
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
def puff(pg, r, fill, stroke, sw=2, extra='', rnd=None):
    """a cloud mass: the polygon's edges (clockwise) replaced by outward arcs of about radius r"""
    rnd = rnd or random.Random(7); d = f'M{pg[0][0]:.1f},{pg[0][1]:.1f}'
    for a, b in zip(pg, pg[1:] + pg[:1]):
        k = max(1, round(math.dist(a, b) / (1.5 * r)))
        for i in range(1, k + 1):
            q = lerp(a, b, i / k); rr = math.dist(a, b) / k * rnd.uniform(.52, .7)
            d += f' A{rr:.1f},{rr:.1f} 0 0 1 {q[0]:.1f},{q[1]:.1f}'
    return f'<path d="{d} Z" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" {extra}/>'
def text(x, y, s, size, fill=GOLD, anchor='middle', sw=None, weight=900, extra=''):
    """a label with a dark rim (stroke painted under the fill), so it reads on any ground"""
    sw = size * .15 if sw is None else sw
    return (f'<text x="{x:.1f}" y="{y:.1f}" font-family="{FONT}" font-weight="{weight}" font-size="{size}" text-anchor="{anchor}" fill="{fill}" '
            f'stroke="{DARK}" stroke-width="{sw:.1f}" stroke-linejoin="round" paint-order="stroke" {extra}>{s}</text>')
def svg(parts, defs=''):
    return '\n'.join([f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">', f'<defs>{defs}</defs>'] + parts + ['</svg>'])
def lgrad(id_, stops, x1=0, y1=0, x2=0, y2=1, units=''):
    u = f' gradientUnits="{units}"' if units else ''
    return f'<linearGradient id="{id_}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"{u}>' + ''.join(f'<stop offset="{o}" stop-color="{c}"' + (f' stop-opacity="{a}"' if a is not None else '') + '/>' for o, c, a in stops) + '</linearGradient>'
def rgrad(id_, cx, cy, r, stops):
    return f'<radialGradient id="{id_}" cx="{cx}" cy="{cy}" r="{r}" gradientUnits="userSpaceOnUse">' + ''.join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"/>' for o, c, a in stops) + '</radialGradient>'


# ---------------- a tiny 3D camera ----------------
def sub(a, b): return (a[0] - b[0], a[1] - b[1], a[2] - b[2])
def dot(a, b): return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
def cross(a, b): return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])
def norm(a): l = math.sqrt(dot(a, a)); return (a[0] / l, a[1] / l, a[2] / l)
class Cam:
    """pinhole camera: x east, y north, z up (metres); screen y down"""
    def __init__(s, pos, look, f, c):
        s.C = pos; s.F = norm(sub(look, pos)); s.R = norm(cross(s.F, (0, 0, 1))); s.U = cross(s.R, s.F); s.f = f; s.c = c
    def __call__(s, P):
        v = sub(P, s.C); d = dot(v, s.F); return (s.c[0] + s.f * dot(v, s.R) / d, s.c[1] - s.f * dot(v, s.U) / d)
    def sees(s, P, n): return dot(n, sub(s.C, P)) > 0
    def poly(s, P3, fill, stroke=INK, sw=3, extra=''): return poly([s(p) for p in P3], fill, stroke, sw, extra)
    def line(s, P3, stroke=INK, sw=3, extra=''): return line([s(p) for p in P3], stroke, sw, extra)


# ---------------- El Castillo (metres; real proportions, simplified) ----------------
S0, SP, ZT, NT = 27.65, 9.8, 24.0, 9        # base half-size, platform half-size, platform height, terraces
HT = ZT / NT; BAT = .4; DS = (S0 - SP - BAT) / 8   # terrace height, wall batter, setback per terrace
WS, BW, BH, RF = 4.4, .95, .8, 33.0          # stair half-width, balustrade width / height, distance of the stair foot
TQ, TZ = 6.4, 6.0                            # temple half-size, temple height
SIDES = {'S': (0, -1), 'E': (1, 0), 'N': (0, 1), 'W': (-1, 0)}
def sb(k): return S0 - DS * k                # half-size at the foot of terrace k
def st(k): return sb(k) - BAT                # half-size at the top of terrace k
def zk(k): return HT * k
def P3(side, r, u, z):
    """point on a side: r out from the centre along the side's normal, u along the side (u > 0 = counter-clockwise)"""
    nx, ny = SIDES[side]; return (nx * r + -ny * u, ny * r + nx * u, z)
def zr(r): return ZT * (RF - r) / (RF - SP)  # the stair ramp's height at distance r
def rz(z): return RF - (RF - SP) * z / ZT
PROFILE = [(sb(0), 0)]                       # the stepped terrace profile in a side's (r, z) plane, foot → platform
for k in range(NT):
    PROFILE.append((st(k), zk(k + 1)))
    if k < NT - 1: PROFILE.append((sb(k + 1), zk(k + 1)))

def terrace_wall(cam, side, k, col, band, panel, sw=2.5):
    """one terrace wall: battered face, lit cornice band, panel moulding, panel joints (generated)"""
    a0, a1, b0, b1 = sb(k), st(k), zk(k), zk(k + 1)
    def at(t, d):   # t across (0 = u-, 1 = u+), d down from the top
        rt, rb = a1, a0; ut = -a1 + 2 * a1 * t; ub = -a0 + 2 * a0 * t
        top = P3(side, rt, ut, b1); bot = P3(side, rb, ub, b0); return lerp3(top, bot, d)
    o = [cam.poly([at(0, 1), at(1, 1), at(1, 0), at(0, 0)], col, INK, sw)]
    o.append(cam.poly([at(0, 0), at(1, 0), at(1, .17), at(0, .17)], band, 'none', 0))
    o.append(cam.line([at(0, .44), at(1, .44)], panel, 1.6, 'opacity=".8"'))
    n = max(4, int(2 * a0 / 3.2))
    for j in range(1, n):
        t = j / n; u = -a0 + 2 * a0 * t
        if abs(u) < WS + .6: continue
        o.append(cam.line([at(t, .17), at(t, .44)], panel, 1.4, 'opacity=".6"'))
    o.append(cam.poly([at(0, 1), at(1, 1), at(1, 0), at(0, 0)], 'none', INK, sw))
    return o
def lerp3(a, b, t): return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t)
def wall_normal(side): nx, ny = SIDES[side]; return norm((nx * HT, ny * HT, BAT))

def stair(cam, side, c, step=2, sw=2.5, light=None):
    """one staircase: ramp with treads, two balustrades (top strip, inner and outer walls down to the terrace profile).
    c: colours (ramp, tread, bal_top, bal_out_l, bal_out_r, bal_in); light: optional extra parts on the outer walls"""
    o = []; ui = WS - BW
    # outer walls (u = +WS and u = -WS), bounded below by the terrace profile
    for sgn, key in ((1, 'out_p'), (-1, 'out_m')):
        nx, ny = SIDES[side]; tn = (-ny * sgn, nx * sgn, 0)
        P = P3(side, (RF + SP) / 2, sgn * WS, 6)
        if not cam.sees(P, tn): continue
        rz_ = [(RF, 0)] + PROFILE + [(SP, ZT + BH), (RF, BH)]
        o.append(cam.poly([P3(side, r, sgn * WS, z) for r, z in rz_], c[key], INK, sw))
        if light and key in light: o += light[key]
        o.append(cam.poly([P3(side, RF, sgn * ui, 0), P3(side, RF, sgn * WS, 0), P3(side, RF, sgn * WS, BH), P3(side, RF, sgn * ui, BH)], c['end'], INK, 2))
    # ramp + treads
    o.append(cam.poly([P3(side, RF, -ui, 0), P3(side, RF, ui, 0), P3(side, SP, ui, ZT), P3(side, SP, -ui, ZT)], c['ramp'], INK, sw))
    for i in range(step, 91, step):
        z = ZT * i / 91; r = rz(z)
        o.append(cam.line([P3(side, r, -ui, z), P3(side, r, ui, z)], c['tread'], 1.6 if i % (step * 2) else 2.2))
    # balustrades: inner wall strip + top strip
    for sgn in (1, -1):
        nx, ny = SIDES[side]; tn = (ny * sgn, -nx * sgn, 0)   # inner wall faces the treads
        if cam.sees(P3(side, (RF + SP) / 2, sgn * ui, 6), tn):
            o.append(cam.poly([P3(side, RF, sgn * ui, 0), P3(side, SP, sgn * ui, ZT), P3(side, SP, sgn * ui, ZT + BH), P3(side, RF, sgn * ui, BH)], c['in'], INK, 1.8))
        o.append(cam.poly([P3(side, RF, sgn * ui, BH), P3(side, RF, sgn * WS, BH), P3(side, SP, sgn * WS, ZT + BH), P3(side, SP, sgn * ui, ZT + BH)], c['top'], INK, sw))
    return o

def temple(cam, c, sw=2.5):
    """the temple on the platform: walls with doorways, moulding, frieze, roof slab"""
    o = []; z0 = ZT
    faces = []
    for side in SIDES:
        n3 = (SIDES[side][0], SIDES[side][1], 0)
        if cam.sees(P3(side, TQ, 0, z0 + 3), n3): faces.append(side)
    for side in faces:
        col = c[side]
        o.append(cam.poly([P3(side, TQ, -TQ, z0), P3(side, TQ, TQ, z0), P3(side, TQ, TQ, z0 + 3.6), P3(side, TQ, -TQ, z0 + 3.6)], col['wall'], INK, sw))
        doors = [(-2.6, -1.6), (-.7, .7), (1.6, 2.6)] if side == 'N' else [(-.8, .8)]
        for u0, u1 in doors:
            o.append(cam.poly([P3(side, TQ, u0, z0), P3(side, TQ, u1, z0), P3(side, TQ, u1, z0 + 2.6), P3(side, TQ, u0, z0 + 2.6)], c['door'], INK, 2))
        o.append(cam.poly([P3(side, TQ + .25, -TQ - .25, z0 + 3.6), P3(side, TQ + .25, TQ + .25, z0 + 3.6), P3(side, TQ + .25, TQ + .25, z0 + 4.0), P3(side, TQ + .25, -TQ - .25, z0 + 4.0)], col['corn'], INK, 2))
        o.append(cam.poly([P3(side, TQ, -TQ, z0 + 4.0), P3(side, TQ, TQ, z0 + 4.0), P3(side, TQ, TQ, z0 + 5.5), P3(side, TQ, -TQ, z0 + 5.5)], col['frieze'], INK, 2))
        for j in range(1, 8):
            u = -TQ + 2 * TQ * j / 8; o.append(cam.line([P3(side, TQ, u, z0 + 4.1), P3(side, TQ, u, z0 + 5.4)], col['joint'], 1.5))
        o.append(cam.poly([P3(side, TQ + .35, -TQ - .35, z0 + 5.5), P3(side, TQ + .35, TQ + .35, z0 + 5.5), P3(side, TQ + .35, TQ + .35, z0 + TZ), P3(side, TQ + .35, -TQ - .35, z0 + TZ)], col['corn'], INK, 2.5))
    if cam.sees((0, 0, z0 + TZ), (0, 0, 1)):
        q = TQ + .35; o.append(cam.poly([(-q, -q, z0 + TZ), (q, -q, z0 + TZ), (q, q, z0 + TZ), (-q, q, z0 + TZ)], c['roof'], INK, sw))
    return o

def terrace_top(cam, k, col, sw=2.5):
    q = st(k); z = zk(k + 1)
    return cam.poly([(-q, -q, z), (q, -q, z), (q, q, z), (-q, q, z)], col, INK, sw)


# =====================================================================================================
# 1 · chichen_calendar — the pyramid from a drone, turned into a calendar dial
# =====================================================================================================
def chichen_calendar():
    R = random.Random(571)
    e, az = math.radians(62), 0.0; D = 1000; CX, CY = 925, 672
    cam = Cam((D * math.cos(e) * math.sin(az), -D * math.cos(e) * math.cos(az), D * math.sin(e) + 8), (0, 0, 8), 7.35 * D, (CX, CY))
    defs = (rgrad('lawn', CX, CY, 1000, [(0, '#8E9A5E', 1), (.55, '#6E7B48', 1), (1, '#3C4A2E', 1)])
            + rgrad('dim', CX, CY, 1150, [(.45, '#0E120A', 0), (1, '#0E120A', .55)]))
    g = [f'<rect width="{W}" height="{H}" fill="url(#lawn)"/>']
    # the forest edge at the top of the frame (generated round crowns, two rows)
    for row, (y0, col, edge, rr) in enumerate([(70, '#2E3F2A', '#1F2C1C', (26, 44)), (150, '#3B5034', '#24331F', (30, 50))]):
        cs = []; x = -60
        while x < W + 60:
            r = R.uniform(*rr); cs.append((x, y0 + R.uniform(-18, 18), r)); x += r * R.uniform(1.0, 1.5)
        top = []
        for xi in range(-20, W + 21, 8):
            ys = [cy - math.sqrt(r * r - (xi - cx) ** 2) for cx, cy, r in cs if abs(xi - cx) < r]
            top.append((xi, min(ys) if ys else y0 + 30))
        g.append(poly([(-20, -20)] + top + [(W + 20, -20)] if row == 0 else top + [(W + 20, y0 + 60), (W + 20, -20), (-20, -20), (-20, y0 + 60)], col, edge, 2.5))
        if row == 1:
            g.append(poly([(-20, y0 + 40)] + [(x, y + 1) for x, y in top] + [(W + 20, y0 + 40), (W + 20, y0 + 70), (-20, y0 + 70)], col, 'none', 0))
            g.append(line([(-20, y0 + 52), (W + 20, y0 + 44)], '#24331F', 3, 'opacity=".5"'))
        for cx, cy, r in cs:   # crown arcs (generated)
            if R.random() < .6: g.append(line([(cx - r * .6, cy + r * .1), (cx - r * .3, cy - r * .35), (cx + r * .2, cy - r * .4)], '#4E6640' if row else '#3E5436', 3, 'opacity=".8"'))
    # the pyramid's shadow on the lawn (sun from the upper left)
    q0 = S0 + 1; g.append(cam.poly([(-q0 + 5, -q0 - 3, 0), (q0 + 8, -q0 - 3, 0), (q0 + 9, q0 - 6, 0), (-q0 + 5, q0 - 3, 0)], '#2E3A22', 'none', 0, 'opacity=".5"'))
    # the calendar dial on the ground: 365 ticks, the quarter marks under the four stairs
    RR = 44
    ring = [cam((RR * math.cos(2 * math.pi * i / 180), RR * math.sin(2 * math.pi * i / 180), 0)) for i in range(181)]
    g.append(line(ring, GOLD, 2.5, 'opacity=".55"'))
    ring2 = [cam(((RR + 2.4) * math.cos(2 * math.pi * i / 180), (RR + 2.4) * math.sin(2 * math.pi * i / 180), 0)) for i in range(181)]
    g.append(line(ring2, GOLD, 1.5, 'opacity=".35"'))
    for i in range(365):
        a = -math.pi / 2 + 2 * math.pi * i / 365; ca, sa = math.cos(a), math.sin(a)
        L = 2.4 if i % 5 else 2.4
        g.append(line([cam((RR * ca, RR * sa, 0)), cam(((RR + L) * ca, (RR + L) * sa, 0))], GOLD, 1.6, 'opacity=".75"'))
    for a in (0, 90, 180, 270):
        ca, sa = math.cos(math.radians(a)), math.sin(math.radians(a))
        g.append(line([cam((RR * ca, RR * sa, 0)), cam(((RR + 4.5) * ca, (RR + 4.5) * sa, 0))], GOLD, 5))
    g.append(f'<rect width="{W}" height="{H}" fill="url(#dim)"/>')
    # the pyramid: terraces bottom → top (walls facing the camera, then the top), stairs far → near, temple
    lit = dict(W=('#A9AFA6', '#C9CBBF', '#7A8884'), S=('#7E9496', '#9FB0AD', '#5A6E72'), E=('#4E666D', '#67797C', '#3A4F55'), N=('#4E666D', '#67797C', '#3A4F55'))
    for k in range(NT):
        g.append(terrace_top(cam, k - 1, '#AEB6AE') if k else '')
        for side in ('N', 'E', 'W', 'S'):
            if cam.sees(P3(side, (sb(k) + st(k)) / 2, 0, zk(k) + HT / 2), wall_normal(side)):
                g += terrace_wall(cam, side, k, *lit[side])
    g.append(terrace_top(cam, NT - 1, '#D6D2C0'))
    q = st(NT - 1)   # the platform (the +1) outlined in gold
    plat = [cam((-q, -q, ZT)), cam((q, -q, ZT)), cam((q, q, ZT)), cam((-q, q, ZT))]
    sc = dict(ramp='#E7D7B0', tread='#B79B68', top='#F4E6C4', out_p='#9C8256', out_m='#B39A6A', end='#C9AE7E', **{'in': '#BFA77A'})
    order = sorted(SIDES, key=lambda s: -math.dist(cam.C, P3(s, RF, 0, 0)))
    for side in order:
        o = stair(cam, side, sc, step=3)
        pg = [cam(P3(side, RF, -WS, 0)), cam(P3(side, RF, WS, 0)), cam(P3(side, SP, WS, ZT + BH)), cam(P3(side, SP, -WS, ZT + BH))]
        g.append(poly(pg, 'none', GOLD, 12, 'opacity=".35"'))
        g += o
        g.append(poly(pg, 'none', GOLD, 3.5))
    g.append(poly(plat, 'none', GOLD, 12, 'opacity=".35"'))
    tc = dict(S=dict(wall='#C2B6A2', corn='#7D8683', frieze='#A9A497', joint='#8A857A'), E=dict(wall='#A59A86', corn='#68716E', frieze='#8F8A7D', joint='#76716A'),
              W=dict(wall='#D0C5B0', corn='#8C9490', frieze='#B7B2A4', joint='#958F84'), N=dict(wall='#A59A86', corn='#68716E', frieze='#8F8A7D', joint='#76716A'),
              door='#2A2622', roof='#9AA29D')
    g += temple(cam, tc)
    g.append(poly(plat, 'none', GOLD, 4))
    # labels: 91 at the foot of each stair (the dial's numerals), +1 on the temple, = 365 on the right
    for side in SIDES:
        x, y = cam(P3(side, RF + 5.4, 0, 0)); g.append(text(x, y + 22, '91', 64))
    x, y = cam((0, 0, ZT + TZ)); g.append(text(x, y + 20, '+1', 56))
    g.append(text(1650, 720, '= 365', 150, sw=22))
    return svg(g, defs)


def serpent_head(cam, sgn, lit):
    """a carved Kukulkan head at the foot of the north stair's balustrade (sgn +1 west, -1 east): top, snout end and the
    west-facing cheek with open jaws, fangs, forked tongue, eye and brow scroll"""
    c = dict(top='#F6CC8E', end='#D9965E', cheek='#FFD999', line='#B9783E', mouth='#4A2422', eye='#3A2A24') if lit else \
        dict(top='#7D7795', end='#5C5674', cheek='#6A6484', line='#4C4864', mouth='#2A2233', eye='#2A2233')
    u_out, u_in = (WS + .3, WS - BW - .3) if sgn > 0 else (-(WS - BW - .3), -(WS + .3))   # u_out = the west-facing side
    r0, r1 = RF - .6, RF + 3.3
    prof = [(r0, 0), (r1, 0), (r1, .55), (r0 + 1.5, .98), (r1 + .2, 1.2), (r1 + .1, 1.8), (r1 - .35, 2.05), (r0 + 1.3, 2.3), (r0, 2.45)]
    Q = lambda r, z, u: P3('N', r, u, z)
    o = [cam.poly([Q(r1 - .35, 2.05, u_out), Q(r0 + 1.3, 2.3, u_out), Q(r0, 2.45, u_out), Q(r0, 2.45, u_in), Q(r0 + 1.3, 2.3, u_in), Q(r1 - .35, 2.05, u_in)], c['top'], INK, 2.5)]
    o.append(cam.poly([Q(r1 + .1, 1.8, u_out), Q(r1 - .35, 2.05, u_out), Q(r1 - .35, 2.05, u_in), Q(r1 + .1, 1.8, u_in)], c['top'], INK, 2))
    o.append(cam.poly([Q(r1, 0, u_out), Q(r1, .55, u_out), Q(r1, .55, u_in), Q(r1, 0, u_in)], c['end'], INK, 2))          # lower jaw front
    o.append(cam.poly([Q(r1 + .2, 1.2, u_out), Q(r1 + .1, 1.8, u_out), Q(r1 + .1, 1.8, u_in), Q(r1 + .2, 1.2, u_in)], c['end'], INK, 2))   # snout front
    o.append(cam.poly([Q(r, z, u_out - .05 * sgn) for r, z in [(r1 + .05, .5), (r0 + 1.4, .98), (r1 + .15, 1.22)]], c['mouth'], INK, 2))   # the open mouth
    if lit:
        o.append(cam.line([Q(r, z, u_out - .4) for r, z in [(r1 - .3, .82), (r1 + .7, .8), (r1 + 1.2, .62)]], '#C2463A', 5))     # forked tongue
        o.append(cam.line([Q(r, z, u_out - .4) for r, z in [(r1 + .7, .8), (r1 + 1.25, .95)]], '#C2463A', 4))
    o.append(cam.poly([Q(r, z, u_out) for r, z in prof], c['cheek'], INK, 2.5))
    for fr in (r1 - .1, r1 - .55):   # fangs
        o.append(cam.poly([Q(r, z, u_out) for r, z in [(fr, 1.12), (fr - .14, .78), (fr - .28, 1.08)]], '#FFF6E6', INK, 1.3))
        o.append(cam.poly([Q(r, z, u_out) for r, z in [(fr - .05, .6), (fr - .17, .86), (fr - .3, .64)]], '#FFF6E6', INK, 1.3))
    ex, ez = r0 + 1.0, 1.72
    o.append(cam.poly([Q(ex + .42 * math.cos(t * math.pi / 8), ez + .3 * math.sin(t * math.pi / 8), u_out) for t in range(16)], c['eye'], INK, 2))
    o.append(cam.poly([Q(ex - .1 + .12 * math.cos(t * math.pi / 4), ez + .08 + .1 * math.sin(t * math.pi / 4), u_out) for t in range(8)], '#FFF6E6' if lit else c['top'], 'none', 0))
    o.append(cam.line([Q(r0 + .3 + .9 * t, 2.05 + .25 * math.sin(math.pi * t), u_out) for t in [i / 8 for i in range(9)]], c['line'], 3))   # brow scroll
    for i in range(3):   # scale lines on the cheek
        rr_ = r0 + .35 + i * .45; o.append(cam.line([Q(rr_, .25, u_out), Q(rr_ + .25, .55, u_out), Q(rr_, .8, u_out)], c['line'], 2))
    return o


# =====================================================================================================
# 2 · chichen_serpent — equinox sunset, the light serpent on the north stair
# =====================================================================================================
def chichen_serpent():
    R = random.Random(572)
    phi = math.radians(36); D = 92
    cam = Cam((-D * math.sin(phi), D * math.cos(phi), 4.0), (0, 0, 13.5), 1630, (1160, 652))
    sun = (1886, 572)
    defs = (lgrad('sky', [(0, '#5E6C93', None), (.45, '#B98A86', None), (.75, '#E9AC78', None), (1, '#F7CF8E', None)], units='userSpaceOnUse', x2=0, y2=720)
            + rgrad('glow', sun[0], sun[1], 760, [(0, '#FFF1C4', .95), (.18, '#FFD58A', .75), (.5, '#F2A866', .28), (1, '#F2A866', 0)])
            + lgrad('field', [(0, '#B07A55', None), (1, '#5E4436', None)], units='userSpaceOnUse', y1=640, y2=1080))
    g = [f'<rect width="{W}" height="{H}" fill="url(#sky)"/>', f'<rect width="{W}" height="{H}" fill="url(#glow)"/>']
    g.append(f'<circle cx="{sun[0]}" cy="{sun[1]}" r="62" fill="#FFF3CF" stroke="#F7C77E" stroke-width="3"/>')
    # horizon tree line (generated crowns), dark against the glow, warm caps toward the sun
    hz = 655; cs = []; x = -40
    while x < W + 40:
        r = R.uniform(16, 34); cs.append((x, hz - R.uniform(0, 26) - (12 if x > 1500 else 0), r)); x += r * R.uniform(1.0, 1.5)
    top = []
    for xi in range(-20, W + 21, 6):
        ys = [cy - math.sqrt(r * r - (xi - cx) ** 2) for cx, cy, r in cs if abs(xi - cx) < r]
        top.append((xi, min(ys) if ys else hz))
    g.append(poly([(-20, hz + 30)] + top + [(W + 20, hz + 30)], '#4A3F3E', '#2E2628', 2.5))
    g.append(poly([(-20, hz + 6), (W + 20, hz + 6), (W + 20, H + 20), (-20, H + 20)], 'url(#field)', INK, 2.5))
    # sun-baked field: pebbles and long shadows thrown left by the low sun
    for _ in range(60):
        x, y = R.uniform(0, W), R.uniform(700, 1070); r = R.uniform(3, 8) * (y - 600) / 300
        g.append(f'<ellipse cx="{x - r * 4:.1f}" cy="{y + r * .3:.1f}" rx="{r * 4:.1f}" ry="{r * .35:.1f}" fill="#4A3330" opacity=".35"/>')
        g.append(f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{r:.1f}" ry="{r * .55:.1f}" fill="{R.choice(["#C99266", "#8E6248", "#D9A574"])}"/>')
    # painted far → near: temple (above the eye), terraces by height away from the eye, then the near stairs
    lit = dict(W=('#DE9C62', '#F3C58E', '#B57446'), N=('#625E7C', '#7A7592', '#4C4864'), E=('#5A5470', '#6E6886', '#45405C'), S=('#5A5470', '#6E6886', '#45405C'))
    tc = dict(W=dict(wall='#E8AE74', corn='#B77A4C', frieze='#D49A66', joint='#B57E52'), N=dict(wall='#706A86', corn='#4E4964', frieze='#625C79', joint='#57516C'),
              E=dict(wall='#706A86', corn='#4E4964', frieze='#625C79', joint='#57516C'), S=dict(wall='#706A86', corn='#4E4964', frieze='#625C79', joint='#57516C'),
              door='#231B22', roof='#C48E6A')
    g += temple(cam, tc)
    zc = cam.C[2]
    for k in sorted(range(NT), key=lambda k: -abs(zk(k) + HT / 2 - zc)):
        for side in SIDES:
            if cam.sees(P3(side, (sb(k) + st(k)) / 2, 0, zk(k) + HT / 2), wall_normal(side)):
                g += terrace_wall(cam, side, k, *lit[side])
        if cam.sees((0, 0, zk(k + 1)), (0, 0, 1)): g.append(terrace_top(cam, k, '#B98564'))
    # west stair on the sunlit face (drawn first: further from the eye than the north stair's balustrade)
    wc = dict(ramp='#EDB57A', tread='#C48550', top='#F6CB92', out_p='#D99860', out_m='#D99860', end='#E2A46C', **{'in': '#C98A58'})
    g += stair(cam, 'W', wc, step=2)
    # north stair in shade; its west balustrade (u = +WS) catches the sun between the shadows of the terrace corners
    tri = []
    for k in range(1, 8):
        z0 = zk(k); r0 = rz(z0 - BH); w = HT * (RF - SP) / ZT * .97
        a, b = (r0, z0), (r0 - w, z0); c = (r0 - w, zr(r0 - w) + BH)
        tri.append(cam.poly([P3('N', r, WS, z) for r, z in (a, b, c)], 'none', '#FFC56E', 16, 'opacity=".4"'))
        tri.append(cam.poly([P3('N', r, WS, z) for r, z in (a, b, c)], '#FFDC8E', '#C98A3E', 1.5))
        tri.append(cam.line([P3('N', r, WS, z) for r, z in ((a[0] - .12, a[1] + .1), (c[0] + .02, c[1] - .1))], '#FFF3CF', 2.5))
    nc = dict(ramp='#857C93', tread='#6B6380', top='#9C93A9', out_p='#2F2A45', out_m='#3F3A55', end='#585170', **{'in': '#5C5672'})
    g += stair(cam, 'N', nc, step=2, light={'out_p': tri})
    # the serpent heads at the foot of the north stair (drawn a little larger than life so they read): the west one sunlit
    for sgn, lit_ in ((-1, False), (1, True)):
        g += serpent_head(cam, sgn, lit_)
    # the low sun's ray (dashed) skimming the north-west corner onto the balustrade, and the label
    def agave(cx, cy, rad, n):   # a dark rosette against the low sun: blades with a warm rim, long shadow to the left
        o = [f'<ellipse cx="{cx - rad * 1.6:.1f}" cy="{cy + 3:.1f}" rx="{rad * 1.9:.1f}" ry="{rad * .12:.1f}" fill="#3A2830" opacity=".45"/>']
        for i in range(n):
            a = math.radians(-165 + 150 * (i + R.uniform(-.3, .3)) / (n - 1)); L = rad * R.uniform(.6, 1.05) * (1 if -150 < math.degrees(a) < -30 else .75); w = rad * .09
            tip = (cx + math.cos(a) * L, cy + math.sin(a) * L); nx, ny = -math.sin(a), math.cos(a)
            o.append(poly([(cx + nx * w + 3, cy + ny * w), (tip[0] + 2, tip[1]), (cx - nx * w + 3, cy - ny * w)], '#E9A060', 'none', 0))
            o.append(poly([(cx + nx * w, cy + ny * w), tip, (cx - nx * w, cy - ny * w)], R.choice(['#3E4630', '#33392A']), INK, 1.5))
        return o
    for cx, cy, rad, n in ((150, 905, 70, 9), (1560, 1010, 95, 10), (1240, 1050, 60, 8), (880, 1072, 80, 10)):
        g += agave(cx, cy, rad, n)
    tgt = cam(P3('N', rz(zk(5)) - .9, WS, zk(5) + .7))
    g.append(line([sun, tgt], GOLD, 3.5, 'stroke-dasharray="16 12"'))
    g.append(f'<circle cx="{tgt[0]:.1f}" cy="{tgt[1]:.1f}" r="7" fill="{GOLD}" stroke="{DARK}" stroke-width="2.5"/>')
    g.append(text(sun[0] - 92, sun[1] - 100, '春分 · 秋分', 48, anchor='end'))
    return svg(g, defs)


# =====================================================================================================
# figures: dignified silhouettes with a warm rim light, flat llamas
# =====================================================================================================
def sil(parts, x, y, s, rim=(-2.4, -1.6), flip=False, dark='#211A17', rimc='#F2B66E'):
    """a silhouette built from local parts at (x, y), scale s (flip = face right). parts: ('p', points) polygons,
    ('l', points, width) strokes, ('e', cx, cy, rx, ry). The warm rim is the same shape in the rim colour, nudged toward
    the light and laid under the dark one."""
    fx = -1 if flip else 1
    def body(col, dx, dy):
        o = []
        for q in parts:
            if q[0] == 'p': o.append(f'<polygon points="{pts([(px + dx, py + dy) for px, py in q[1]])}" fill="{col}"/>')
            elif q[0] == 'l': o.append(line([(px + dx, py + dy) for px, py in q[1]], col, q[2]))
            else: o.append(f'<ellipse cx="{q[1] + dx:.1f}" cy="{q[2] + dy:.1f}" rx="{q[3]}" ry="{q[4]}" fill="{col}"/>')
        return ''.join(o)
    return (f'<g transform="translate({x:.1f},{y:.1f}) scale({fx * s:.3f},{s:.3f})">'
            f'{body(rimc, fx * rim[0] / s, rim[1] / s)}{body(dark, 0, 0)}</g>')
def fan(cx, cy, r_in, r_out, a0, a1, n):
    """a fan of n pointed feathers (one polygon) between angles a0..a1 (degrees, screen: 270 = straight up)"""
    q = [(cx + math.cos(math.radians(a0 - 6)) * 3, cy + math.sin(math.radians(a0 - 6)) * 3)]
    for i in range(n):
        a = math.radians(a0 + (a1 - a0) * i / (n - 1)); h = math.radians((a1 - a0) / (n - 1) / 2)
        q += [(cx + math.cos(a - h) * r_in, cy + math.sin(a - h) * r_in), (cx + math.cos(a) * r_out, cy + math.sin(a) * r_out), (cx + math.cos(a + h) * r_in, cy + math.sin(a + h) * r_in)]
    q.append((cx + math.cos(math.radians(a1 + 6)) * 3, cy + math.sin(math.radians(a1 + 6)) * 3))
    return ('p', q)
def ruler_parts():
    """the Sapa Inca, facing left: fan of feathers on the head band, brow fringe, tunic, cloak, staff with a star head"""
    return [fan(.5, -93, 9, 19, 200, 340, 9), ('e', 0, -86, 6.5, 7.6), ('p', [(-7.6, -90), (7.2, -90), (7.4, -85.5), (-7.8, -85.5)]),
            ('p', [(-9.4, -86), (-5.6, -86), (-5.2, -79.5), (-8.8, -79.5)]), ('p', [(-3.2, -80), (3.2, -80), (3.8, -75), (-3.8, -75)]),
            ('p', [(-10.5, -76.5), (9.5, -76.5), (12.5, -70), (14, -30), (-13.5, -30), (-12.5, -70)]),
            ('p', [(4, -77.5), (11, -76), (17, -62), (20.5, -40), (22, -26), (9, -26), (11, -50)]),
            ('l', [(-9, -72), (-15.5, -58), (-22, -55)], 5.5), ('l', [(-23, -66), (-23, 0)], 2.6),
            ('p', [(-23 + 5.5 * math.cos(t * math.pi / 4) * (1 if t % 2 else .45), -70 + 5.5 * math.sin(t * math.pi / 4) * (1 if t % 2 else .45)) for t in range(8)]),
            ('l', [(-5, -31), (-6, -2)], 5.4), ('l', [(4.5, -31), (5.5, -2)], 5.4), ('p', [(-12, -3.5), (-3, -3.5), (-3, 1), (-12, 1)]), ('p', [(1, -3.5), (9, -3.5), (9, 1), (1, 1)])]
def attendant_parts(pole_to=None, bow=0):
    """an attendant, facing left; pole_to = local point the raised pole reaches (a feather parasol on top)"""
    hx, hy = -bow * 2.5, -82 + bow * 2
    o = [('e', hx, hy, 6, 7), ('p', [(hx - 7, hy - 3), (hx + 6.6, hy - 3), (hx + 6.8, hy + .5), (hx - 7.2, hy + .5)]),
         ('p', [(-3, -76), (3, -76), (3.5, -71), (-3.5, -71)]), ('p', [(-9.5, -72), (9, -72), (11.5, -66), (12.5, -30), (-12, -30), (-11, -66)]),
         ('l', [(-4.5, -31), (-5.5, -2)], 5), ('l', [(4, -31), (5, -2)], 5), ('p', [(-11, -3.5), (-3, -3.5), (-3, 1), (-11, 1)]), ('p', [(1, -3.5), (8.5, -3.5), (8.5, 1), (1, 1)])]
    if pole_to:
        hand = (-9, -62); px, py = pole_to
        o += [('l', [(-6, -68), (-10, -60), hand], 5), ('l', [(5, -68), (-2, -76), (-8, -80)], 5), ('l', [(hand[0] + 2, hand[1] + 14), (px, py)], 2.4)]
        o.append(('p', [(px - 24, py + 1), (px - 15, py - 6), (px, py - 8.5), (px + 15, py - 6), (px + 24, py + 1)] +
                  [(px + 24 - 48 * i / 12 - (2 if i % 2 else 0), py + (6.5 if i % 2 else 2)) for i in range(13)]))   # parasol with a feather fringe
    else:
        o += [('l', [(-6, -68), (-9, -52), (-4, -46)], 5), ('l', [(6, -68), (2, -52), (-3, -47)], 5)]   # hands together
    return o
def llama(x, y, s, col, shade, flip=False):
    """a flat llama (ink outline), facing left, feet at (x, y)"""
    fx = -1 if flip else 1
    legs = [(-13, -26), (-8.5, -25), (11, -26), (15.5, -27)]
    o = []
    for i, (lx, ly) in enumerate(legs):
        c_ = shade if i % 2 else col; o.append(poly([(lx - 2, ly), (lx + 2, ly), (lx + 1.6 + (1 if i > 1 else 0), 0), (lx - 1.6 + (1 if i > 1 else 0), 0)], c_, INK, 1.6))
    o.append(poly([(19, -39), (25, -36), (21, -31)], col, INK, 1.6))
    o.append(poly([(-16, -40), (-8, -44.5), (10, -44.5), (18, -41), (21.5, -33), (19, -26), (12, -23), (-10, -23), (-17, -27.5)], col, INK, 1.8))
    o.append(poly([(-10, -26), (12, -26), (18, -29), (19, -27), (12, -23), (-10, -23)], shade, 'none', 0))
    o.append(poly([(-17.5, -37), (-21, -55), (-22, -62), (-15.5, -63.5), (-12.5, -55), (-8.5, -42)], col, INK, 1.8))
    o.append(poly([(-19, -66), (-18, -73), (-16.4, -66)], col, INK, 1.4)); o.append(poly([(-16.8, -66), (-14.8, -72.5), (-14.2, -65)], col, INK, 1.4))
    o.append(poly([(-23, -66.5), (-27.5, -63.5), (-30.5, -61), (-29.5, -58.5), (-22, -58), (-15.5, -60), (-14.5, -64.5), (-18, -67.5)], col, INK, 1.8))
    o.append(f'<circle cx="-21.5" cy="-63.5" r="1.1" fill="{INK}"/>')
    return f'<g transform="translate({x:.1f},{y:.1f}) scale({fx * s:.3f},{s:.3f})">{"".join(o)}</g>'
def smoke(x, y, h, rnd):
    """a wisp of hearth smoke rising from a roof: overlapping soft puffs growing and fading, bending with the breeze"""
    o = []
    for i in range(12):
        t = i / 11; cx = x + 30 * t * t + 5 * math.sin(t * 7); cy = y - h * t; r = 3.5 + 11 * t
        o.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="#F2EEE6" opacity="{.62 - .5 * t:.2f}"/>')
    o.append(line([(x + 30 * t * t + 5 * math.sin(t * 7), y - h * t) for t in [i / 10 for i in range(11)]], '#C9C3B8', 1.5, 'opacity=".5"'))
    return ''.join(o)


# =====================================================================================================
# 3 · machu_palace — the citadel lived in (machu_vector.py's own drawing, roofed, with people and llamas)
# =====================================================================================================
def machu_scene():
    """run machu_vector.py's drawing code with thatched roofs added to its house rows and big gables;
    returns (svg element list without the outer tag, roof ridge centres in source px)"""
    rnd = random.Random(573); ridges = []
    straw = [('#A9894D', '#CDB273'), ('#B39552', '#D6BC7C'), ('#9C7E46', '#C3A66A')]
    def roof_row(walls, a, b, dv, h, w):
        """the house row as drawn by machu_vector, minus its side-wall gables, plus a steep thatched A-frame roof on each
        house: front gable wall, lit left slope, shaded right slope, straw strokes"""
        o, skip = [], False
        for e in walls:   # drop the 5-point gable polygons (and the niche drawn right after each)
            if skip: skip = False; continue
            if e.startswith('<polygon') and e.split('points="')[1].split('"')[0].count(',') == 5: skip = True; continue
            o.append(e)
        L = math.dist(a, b); n = max(1, round(L / w))
        for k in range(n):
            A, B = lerp(a, b, k / n + .03), lerp(a, b, (k + 1) / n - .03); ww = math.dist(A, B)
            M = lerp(A, B, .5); ap = (M[0], M[1] - ww * .62)
            A2, B2 = lerp(ap, A, 1.16), lerp(ap, B, 1.16)
            D = lambda p: (p[0] + dv[0] * 1.05, p[1] + dv[1] * 1.05)
            lit_c, sh_c = rnd.choice(straw)[::-1]
            o.append(poly([A2, ap, D(ap), D(A2)], lit_c, INK, 2))
            o.append(poly([ap, B2, D(B2), D(ap)], sh_c, INK, 2))
            for t in (.3, .55, .8):
                o.append(line([lerp(ap, D(ap), t), lerp(B2, D(B2), t)], '#7A5F34', 1.4))
                o.append(line([lerp(ap, D(ap), t), lerp(A2, D(A2), t)], '#A8894E', 1.4))
            o.append(poly([A, B, lerp(ap, M, .14)], '#B5A78D', INK, 2))
            o.append(poly([lerp(A, B, .4), lerp(A, B, .6), lerp(lerp(A, B, .58), ap, .3), lerp(lerp(A, B, .42), ap, .3)], '#3B342C', 'none', 0))
            ridges.append(lerp(ap, D(ap), .5))
        return o
    def roof_gable(apex, bl, br, dv):
        hw = (bl[1] - apex[1]) * .3; bt = (bl[0], bl[1] - hw); rt = (br[0], br[1] - hw)
        bt = lerp(apex, bt, 1.14); rt = lerp(apex, rt, 1.14); ap = (apex[0], apex[1] - 3)
        D = lambda p: (p[0] + dv[0] * 1.15, p[1] + dv[1] * 1.15)
        ridges.append(lerp(ap, D(ap), .5))
        return [poly([bt, ap, D(ap), D(bt)], '#D6BC7C', INK, 2.2), poly([ap, rt, D(rt), D(ap)], '#A9894D', INK, 2.2)] + \
               [line([lerp(ap, D(ap), t), lerp(rt, D(rt), t)], '#7A5F34', 1.5) for t in (.3, .6, .85)]
    src = open(os.path.join(HERE, 'machu_vector.py')).read()
    src = src.replace("open(sys.argv[1], 'w').write('\\n'.join(g)); print('ok', len(g), 'elements')", '')
    for a_, b_ in (("terr='#6E7B32'", "terr='#6F8C34'"), ("terr_sun='#869540'", "terr_sun='#97B046'"), ("lawn='#78872F'", "lawn='#7E9233'"),
                   ("sky0='#5B8BC3'", "sky0='#6A9BD2'"), ("cl_base='#B3BECD'", "cl_base='#C7CFDA'"), ("cl_grey='#A7B2C2'", "cl_grey='#BAC3D0'")):
        src = src.replace(a_, b_)
    hook = ("_hr, _bg = house_row, big_gable\n"
            "def house_row(a, b, dv, h, w, lit): return ROOF_ROW(_hr(a, b, dv, h, w, lit), a, b, dv, h, w)\n"
            "def big_gable(apex, bl, br, dv, lit=True): return ROOF_GABLE(apex, bl, br, dv) + _bg(apex, bl, br, dv, lit)\n")
    src = src.replace('blocks = [', hook + 'blocks = [', 1)
    ns = {'ROOF_ROW': roof_row, 'ROOF_GABLE': roof_gable, '__name__': 'machu_scene'}
    exec(compile(src, 'machu_vector.py', 'exec'), ns)
    return ns['g'][1:-1], ridges

def machu_palace():
    rnd = random.Random(574)
    inner, ridges = machu_scene()
    sc, oy = W / 2576, 268
    m = lambda x, y: (x * sc, (y - oy) * sc)
    g = [f'<svg x="0" y="0" width="{W}" height="{H}" viewBox="0 {oy} 2576 1449" preserveAspectRatio="xMidYMid slice">'] + inner + ['</svg>']
    # hearth smoke from two roofs in the middle of the town
    picks = sorted([r for r in ridges if 1150 < r[0] < 1450 and 1060 < r[1] < 1200], key=lambda r: r[0])
    for r in (picks[1], picks[-2]) if len(picks) > 3 else picks[:2]:
        x, y = m(*r); g.append(smoke(x, y - 14, 95, rnd))
    # llamas grazing on the main plaza
    for x, y, s_, c_, sh_, fl in ((560, 742, .62, '#F1E6CF', '#CDBB9C', False), (612, 760, .66, '#9A6B45', '#76502F', True), (700, 726, .55, '#E7DCC6', '#C2B190', False)):
        g.append(llama(x, y, s_, c_, sh_, fl))
    # the foreground terrace: a grass tread on a stone wall, where the ruler stands with his attendants
    tread = [(-20, 905), (300, 896), (700, 898), (1000, 906), (1260, 918), (1300, 940), (-20, 942)]
    g.append(poly([(-20, 935), (1300, 935), (1330, H + 20), (-20, H + 20)], '#7A6F5E', INK, 3))
    for i in range(6):   # Inca masonry on the terrace wall: fitted blocks of varied width and tone (generated)
        y0 = 937 + i * 25; x = -20 - (i % 2) * 45
        xend = 1300 + (y0 + 12 - 935) * .2
        while x < xend - 20:
            w_ = min(rnd.uniform(70, 135), xend - x); c_ = rnd.choice(['#7A6F5E', '#857A67', '#6E6454', '#8C806C'])
            g.append(f'<rect x="{x + 2:.1f}" y="{y0 + 2:.1f}" width="{w_ - 4:.1f}" height="21" rx="6" fill="{c_}" stroke="#4E4538" stroke-width="2"/>'); x += w_
    g.append(poly(tread, '#6F8A34', INK, 3))
    g.append(poly([(-20, 925), (1290, 925), (1300, 940), (-20, 942)], '#5C7228', 'none', 0))
    for _ in range(90):   # grass blades on the tread
        x = rnd.uniform(0, 1280); y = rnd.uniform(905, 938)
        g.append(line([(x, y), (x + rnd.uniform(-4, 4), y - rnd.uniform(6, 14))], rnd.choice(['#93AE45', '#4E6322', '#7E9233']), 2))
    # the ruler (Pachacuti, as a silhouette only), a parasol bearer and an attendant
    rx_, ry_, rs = 930, 926, 1.55
    ax, as_ = rx_ + 58, 1.42
    rim = dict(rim=(-4.6, -2.6), rimc='#FFCB80')
    g.append(sil(attendant_parts(bow=1), rx_ + 112, ry_ + 2, 1.36, **rim))
    g.append(sil(attendant_parts(pole_to=((rx_ - ax) / as_ + 2, -128 * rs / as_)), ax, ry_ + 1, as_, **rim))
    g.append(sil(ruler_parts(), rx_, ry_, rs, **rim))
    g.append(llama(330, 920, 1.05, '#F1E6CF', '#CDBB9C'))
    # the altitude line
    x0, ytop, ybot = 1860, 610, 930
    g.append(line([(x0, ybot), (x0, ytop)], CREAM, 3, 'opacity=".85"'))
    for i in range(9): y = ybot - i * (ybot - ytop) / 8; g.append(line([(x0 - 9, y), (x0, y)], CREAM, 2.5, 'opacity=".75"'))
    g.append(line([(1215, ytop), (x0 + 12, ytop)], CREAM, 3, 'stroke-dasharray="10 9" opacity=".8"'))
    g.append(poly([(x0, ytop - 16), (x0 - 9, ytop - 2), (x0 + 9, ytop - 2)], CREAM, 'none', 0))
    g.append(text(x0 + 8, ytop - 26, '海拔 约2350米', 46, anchor='end'))
    return svg(g)


# =====================================================================================================
# 4 · machu_hidden — the city above a sea of clouds; the conquerors far below
# =====================================================================================================
def morion(cx, cy, s=1.0):
    return ('p', [(cx + x * s, cy + y * s) for x, y in [(-12, -5), (-9, -1), (-4, .5), (4, .5), (9, -1), (12, -5), (8, -3), (5, -3.5), (5, -7), (3, -10.5), (0, -13), (-3, -10.5), (-5, -7), (-5, -3.5), (-8, -3)]])
def lance(a, b, w=2.2):
    ux, uy = b[0] - a[0], b[1] - a[1]; L = math.hypot(ux, uy); ux, uy = ux / L, uy / L; nx, ny = -uy, ux
    tip = (b[0] + ux * 11, b[1] + uy * 11)
    return [('l', [a, b], w), ('p', [(b[0] + nx * 2.4 + ux * 3, b[1] + ny * 2.4 + uy * 3), tip, (b[0] - nx * 2.4 + ux * 3, b[1] - ny * 2.4 + uy * 3), b])]
def soldier_parts(step=0):
    k = 1 if step % 2 else -1
    return ([morion(0, -60), ('e', -.5, -55.5, 4.6, 5.4), ('p', [(-5, -54), (-3.5, -49.5), (1, -51)]),
             ('p', [(-6, -51), (6, -51), (7.5, -44), (5, -37), (-6, -37), (-9.5, -41.5), (-8, -47)]), ('p', [(4, -51.5), (9.5, -49), (12.5, -38), (6, -37)]),
             ('p', [(-7.5, -38.5), (7, -38.5), (9.5, -31.5), (6, -27), (-6, -27), (-9.5, -31.5)]),
             ('l', [(-3, -29), (-5 - 2 * k, -14), (-9 - 3 * k, -1)], 4), ('l', [(3, -29), (4 + k, -14), (7 + 2 * k, -1)], 4),
             ('p', [(-14 - 3 * k, -3), (-6 - 3 * k, -3), (-6 - 3 * k, 1), (-14 - 3 * k, 1)]), ('p', [(3 + 2 * k, -3), (11 + 2 * k, -3), (11 + 2 * k, 1), (3 + 2 * k, 1)]),
             ('l', [(-3, -49), (-8, -42), (-11.5, -40)], 3.8)] + lance((-10, -6), (-17.5, -128)))
def rider_parts(step=0):
    k = 1 if step % 2 else -1
    horse = [('p', [(-22, -54), (-8, -57), (12, -56), (24, -52), (27, -44), (24, -35), (12, -32), (-14, -32), (-23, -38), (-25, -46)]),
             ('p', [(-17, -52), (-26, -66), (-31, -74), (-36, -76), (-47, -64), (-45, -59.5), (-37, -61), (-30, -58), (-21, -44)]),
             ('p', [(-32, -74), (-31, -81), (-28.5, -74)]), ('p', [(-24, -66), (-31, -76.5), (-26, -78), (-18, -60)]),
             ('p', [(24, -53), (31, -47), (33, -32), (29, -29), (26, -44)]),
             ('l', [(-18, -36), (-20 - 2 * k, -18), (-22 - 3 * k, 0)], 4.6), ('l', [(-12, -36), (-8 + k, -20), (-11 + 2 * k, -2)], 4.6),
             ('l', [(15, -38), (20, -21), (17 - 2 * k, 0)], 5), ('l', [(20, -38), (24, -22), (27 + 2 * k, -3)], 5)]
    man = [morion(1, -91), ('e', .5, -86.5, 4.6, 5.4), ('p', [(-4, -85), (-2.5, -80.5), (2, -82)]),
           ('p', [(-5, -82), (6, -82), (8, -66), (-4, -63), (-8, -72)]), ('p', [(4, -82.5), (10, -79), (14, -64), (7, -63)]),
           ('l', [(1, -63), (-4, -50), (-2, -38)], 5.2), ('l', [(-2, -79), (-7, -70), (-10.5, -68)], 3.8), ('p', [(-12, -58), (14, -58), (12, -53), (-11, -53)])]
    return horse + man + lance((-9, -50), (-16, -168))

def bank(x0, x1, ytop, ybase, rmin, rmax, fill, stroke, rnd, sw=2, caps=None):
    """a cloud bank: a row of round billows (centres hang from ytop(x)) merged into one scalloped top over a flat base;
    caps: colour of the sunlit cap laid on each billow's upper left"""
    cs = []; x = x0 - rmax
    while x < x1 + rmax:
        r = rnd.uniform(rmin, rmax); cs.append((x, ytop(x) + r, r)); x += r * rnd.uniform(.8, 1.25)
    top = []
    for xi in range(int(x0), int(x1) + 1, 4):
        ys = [cy - math.sqrt(r * r - (xi - cx) ** 2) for cx, cy, r in cs if abs(xi - cx) < r]
        top.append((xi, min(ys) if ys else ybase))
    o = [poly([(x0, ybase)] + top + [(x1, ybase)], fill, stroke, sw)]
    if caps:   # soft shade on the lower right of each billow, then the sunlit cap on its upper left
        for cx, cy, r in cs:
            o.append(f'<path d="M{cx + r * .95:.1f},{cy + r * .1:.1f} A{r:.1f},{r:.1f} 0 0 1 {cx - r * .1:.1f},{cy + r * .95:.1f} A{r * 1.3:.1f},{r * 1.3:.1f} 0 0 0 {cx + r * .95:.1f},{cy + r * .1:.1f} Z" fill="#C9CDD3" opacity=".4"/>')
        for cx, cy, r in cs:
            if rnd.random() < .7:
                o.append(f'<path d="M{cx - r * .82:.1f},{cy - r * .2:.1f} A{r:.1f},{r:.1f} 0 0 1 {cx + r * .25:.1f},{cy - r * .97:.1f} A{r * 1.25:.1f},{r * 1.25:.1f} 0 0 0 {cx - r * .82:.1f},{cy - r * .2:.1f} Z" fill="{caps}" opacity=".8"/>')
    return o
def hang(x0, x1, ytop, ybot, rmin, rmax, fill, stroke, rnd, sw=2):
    """the underside of a cloud deck: billows bulging downward from a flat top, bottom edge hanging at ybot(x)"""
    cs = []; x = x0 - rmax
    while x < x1 + rmax:
        r = rnd.uniform(rmin, rmax); cs.append((x, ybot(x) - r, r)); x += r * rnd.uniform(.8, 1.25)
    bot = []
    for xi in range(int(x0), int(x1) + 1, 4):
        ys = [cy + math.sqrt(r * r - (xi - cx) ** 2) for cx, cy, r in cs if abs(xi - cx) < r]
        bot.append((xi, max(ys) if ys else ytop))
    return poly([(x0, ytop), (x1, ytop)] + bot[::-1], fill, 'none', 0) + line(bot, stroke, sw)
def peak(base_l, summit, base_r, split, lit, shade, ink, sw=2):
    """a mountain: shaded silhouette, sunlit left face down to a split line"""
    return [poly([base_l] + [summit] + [base_r], shade, ink, sw), poly([base_l, summit] + split, lit, 'none', 0), poly([base_l, summit, base_r], 'none', ink, sw)]
def jungle(pg, n, col, rnd, rr=(10, 18), op='.8', sw=2.5):
    """jungle crowns: short arcs scattered inside a polygon (generated)"""
    xs = [p[0] for p in pg]; ys = [p[1] for p in pg]; o = []; k = 0; tries = 0
    while k < n and tries < n * 30:
        tries += 1; x, y = rnd.uniform(min(xs), max(xs)), rnd.uniform(min(ys), max(ys)); r = rnd.uniform(*rr)
        if not inside((x, y), pg) or not inside((x, y - r), pg) or not inside((x - r, y), pg) or not inside((x + r, y), pg): continue
        o.append(line([(x - r, y), (x - r * .6, y - r * .7), (x, y - r * .9), (x + r * .6, y - r * .7), (x + r, y)], col, sw, f'opacity="{op}"')); k += 1
    return o

def machu_hidden():
    rnd = random.Random(575)
    defs = (lgrad('h4sky', [(0, '#7FA0CA', None), (.6, '#CFD6DA', None), (1, '#F8DFB2', None)], units='userSpaceOnUse', y2=470)
            + rgrad('h4glow', 1400, 300, 560, [(0, '#FFE9BC', .85), (.5, '#FFE2A8', .35), (1, '#FFE2A8', 0)])
            + lgrad('h4low', [(0, '#76868A', None), (.35, '#55655F', None), (1, '#2F3B36', None)], units='userSpaceOnUse', y1=600, y2=1080)
            + lgrad('h4hu', [(0, '#D2AE6C', None), (1, '#8C7C4A', None)], units='userSpaceOnUse', x1=1440, x2=1600, y1=0, y2=0)
            + lgrad('h4belly', [(0, '#BFC7CF', 0), (1, '#BFC7CF', 1)], units='userSpaceOnUse', y1=545, y2=620)
            + lgrad('h4mist', [(0, '#D6DEDF', 0), (.6, '#D6DEDF', .45), (1, '#D6DEDF', .1)], units='userSpaceOnUse', y1=780, y2=905))
    g = [f'<rect width="{W}" height="{H}" fill="url(#h4sky)"/>', f'<rect width="{W}" height="{H}" fill="url(#h4glow)"/>']
    # far peaks poking out of the cloud sea (lit west faces)
    def jag(a, b, n, amp):   # an irregular ridgeline between two points (generated)
        return [(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n + (rnd.uniform(-amp, amp) if 0 < i < n else 0)) for i in range(n + 1)]
    for bl, sm, br, col, sh, ink in (((-30, 470), (235, 268), (560, 470), '#B9C0CC', '#97A1B3', '#7F8AA0'), ((610, 470), (850, 330), (1090, 470), '#C3C8D1', '#A3ABBA', '#8792A6'),
                                     ((1640, 470), (1815, 232), (1990, 470), '#AEB6C3', '#8E99AC', '#76829A')):
        left, right = jag(bl, sm, 6, 9), jag(sm, br, 6, 9)[1:]
        split = [(sm[0] + (br[0] - sm[0]) * .25 + rnd.uniform(-8, 8), sm[1] + (470 - sm[1]) * t) for t in (.35, .7, 1)]
        g.append(poly(left + right, sh, ink, 2)); g.append(poly(left + split[::-1][::-1], col, 'none', 0)); g.append(poly(left + right, 'none', ink, 2))
        for t in (.3, .55):   # a couple of ribs on the lit face
            p0 = lerp(sm, bl, t * .5); g.append(line([p0, (p0[0] + 25, p0[1] + 60), (p0[0] + 30, p0[1] + 120)], ink, 1.5, 'opacity=".5"'))
    g += bank(-40, 1960, lambda x: 418 + 9 * math.sin(x / 80), 520, 12, 22, '#E6E4DF', '#BDBCB8', rnd, 1.5)
    # Huayna Picchu: the sugarloaf behind the citadel, terraces near its summit
    hu = [(1400, 470), (1418, 360), (1440, 280), (1466, 216), (1496, 172), (1528, 152), (1556, 156), (1584, 186), (1606, 236), (1626, 300), (1648, 380), (1668, 470)]
    g.append(poly(hu, 'url(#h4hu)', INK, 3))
    g.append(poly([(1556, 156), (1584, 186), (1606, 236), (1626, 300), (1648, 380), (1668, 470), (1585, 470), (1572, 330), (1560, 220)], '#5E5A3E', INK, 2.5))
    for i in range(3):
        y = 176 + i * 13; g.append(line([(1502 + i * 4, y), (1548 + i * 2, y - 3)], '#8FAA45', 4)); g.append(line([(1502 + i * 4, y + 3), (1548 + i * 2, y)], '#6E6455', 1.5))
    g += jungle([(1420, 470), (1440, 300), (1470, 230), (1540, 200), (1560, 330), (1575, 470)], 22, '#A4884F', rnd, (7, 12), '.7', 2)
    # the saddle with the citadel
    ridge = [(1120, 480), (1142, 400), (1172, 350), (1210, 318), (1262, 300), (1340, 292), (1420, 296), (1470, 306), (1505, 332), (1532, 384), (1552, 480)]
    g.append(poly(ridge, '#827E4E', INK, 3))
    fl, fr = ridge[:4][::-1], ridge[7:]                       # left flank (top → bottom) and right flank (top → bottom)
    g += jungle([(1130, 480), (1150, 410), (1175, 400), (1510, 400), (1535, 420), (1550, 480)], 26, '#9C9660', rnd, (8, 13), '.75', 2)
    for j, y in enumerate(range(326, 400, 11)):              # terraces on both flanks (generated bands)
        xl = edge_x(fl, y) + 3; xr = edge_x(fr, y) - 3; L = 70 + j * 3
        for xa, xb in ((xl, xl + L), (xr - L * .8, xr)):
            g.append(poly([(xa, y), (xb, y - 2), (xb, y + 6), (xa, y + 8)], '#93AE45' if j % 2 else '#7E9A3C', INK, 1.3))
            g.append(poly([(xa, y + 8), (xb, y + 6), (xb, y + 9), (xa, y + 11)], '#6E6455', 'none', 0))
    g.append(poly([(1290, 304), (1350, 299), (1405, 301), (1425, 312), (1300, 318)], '#93AE45', INK, 2))   # the plaza
    for y, x0, x1 in [(300, 1226, 1268), (312, 1446, 1478), (318, 1200, 1270), (334, 1196, 1290), (334, 1400, 1490), (350, 1214, 1470)]:   # houses (generated rows)
        x = x0
        while x < x1:
            w_ = rnd.uniform(13, 16); ap = (x + w_ / 2, y - w_ * .78)
            g.append(poly([(x, y), (x + w_, y), (x + w_, y + 8), (x, y + 8)], '#BFB195', INK, 1.4))
            g.append(poly([(x - 1.5, y + 1), ap, (ap[0] + 7, ap[1] - 4), (x + 5.5, y - 3)], '#D6BC7C', INK, 1.4))
            g.append(poly([ap, (x + w_ + 1.5, y + 1), (x + w_ + 8, y - 3), (ap[0] + 7, ap[1] - 4)], '#A9894D', INK, 1.4))
            g.append(poly([(x - 1.5, y + 1), ap, (x + w_ + 1.5, y + 1)], '#C2A462', INK, 1.4))
            x += w_ + rnd.uniform(4, 8)
    # the sea of clouds, piling against the mountain (sunlit caps), and its grey underside
    heap = lambda x, c, w, h: h * math.exp(-((x - c) / w) ** 2)
    g += bank(-40, 1960, lambda x: 452 + 18 * math.sin(x / 210 + 1) + 9 * math.sin(x / 63) - heap(x, 1340, 170, 46) - heap(x, 430, 160, 26), 640, 18, 40, '#F1EDE5', '#BAB4AA', rnd, 2, '#FFE9C2')
    for cx_, w_, h_ in ((300, 200, 44), (980, 230, 36), (1780, 190, 40)):   # broad cumulus heaps rising out of the sea
        g += bank(cx_ - w_, cx_ + w_, lambda x, c=cx_, w=w_, h=h_: 580 - (80 + h) * math.exp(-((x - c) / (w * .62)) ** 2), 620, 30, 52, '#F7F2E9', '#BAB4AA', rnd, 2, '#FFE9C2')
    g += bank(-40, 1960, lambda x: 512 + 22 * math.sin(x / 300) + 12 * math.sin(x / 90 + 2) - heap(x, 820, 210, 34) - heap(x, 1720, 160, 30), 660, 30, 64, '#FBF7EF', '#BAB4AA', rnd, 2, '#FFEBC8')
    g.append(f'<rect x="0" y="545" width="{W}" height="75" fill="url(#h4belly)"/>')
    g.append(f'<rect x="0" y="618" width="{W}" height="{H - 618}" fill="url(#h4low)"/>')
    g.append(hang(-40, 1960, 616, lambda x: 690 + 14 * math.sin(x / 150), 26, 50, '#A9B3BE', '#6F7C90', rnd))
    g.append(hang(-40, 1960, 616, lambda x: 654 + 10 * math.sin(x / 110 + 1), 22, 42, '#BFC7CF', '#8B96A6', rnd, 1.5))
    # under the clouds: a tall cliff wall across the gorge, ribbed with buttresses and gullies (generated), jungle crowns
    cliff = [(-20, 660), (1940, 660), (1940, 884), (-20, 900)]
    under = [poly(cliff, '#55665E', '#33423D', 2.5)]
    xc = 40
    while xc < 1980:
        w_ = rnd.uniform(110, 300); top = rnd.uniform(668, 760); lean = rnd.uniform(-40, 40)
        bt = [(xc - 10, top), (xc + 12, top), (xc + w_ / 2 + lean, 892), (xc - w_ / 2 + lean, 896)]
        under.append(poly(bt, '#5E7067', '#3A4A44', 1.8))
        under.append(poly([bt[0], (xc + 1, top), (xc + lean * .6 - w_ * .05, 894), bt[3]], '#6B7E73', 'none', 0))
        under.append(line([(xc + 1, top + 4), (xc + lean * .5 + 4, 780), (xc + lean * .6 - w_ * .05, 890)], '#46574F', 2, 'opacity=".8"'))
        xc += w_ * rnd.uniform(.6, .8)
    under += jungle(cliff, 70, '#748A7C', rnd, (9, 16), '.7', 2.2)
    for e in under: g.insert(-3, e)
    g.append(f'<rect x="0" y="780" width="{W}" height="125" fill="url(#h4mist)"/>')
    river = [(-20, 902), (400, 896), (800, 890), (1200, 886), (1600, 882), (1940, 878)]
    g.append(poly(river + [(x, y + 20) for x, y in river[::-1]], '#B3C4C8', '#5E6E72', 2))
    for x in range(30, 1900, 85):
        y = 900 - x * .0125; g.append(line([(x, y), (x + 34, y - .5)], '#E0E9EA', 2, 'opacity=".8"'))
    g.append(poly([(-20, 922), (400, 916), (800, 910), (1200, 906), (1600, 902), (1940, 898), (1940, 1100), (-20, 1100)], '#6B7663', INK, 2.5))   # the near bank
    g.append(poly([(-20, 966), (600, 960), (1300, 958), (1940, 950), (1940, 1100), (-20, 1100)], '#46523F', 'none', 0))
    path = [(1940, 928), (1600, 931), (1300, 934), (1000, 938), (760, 941), (560, 944)]
    g.append(line([(x, y + 8) for x, y in path], CREAM, 5, 'stroke-dasharray="1 15" opacity=".65"'))
    g.append(line([(1940, 912), (1990, 908)], CREAM, 5, 'stroke-dasharray="1 15" opacity=".65"'))
    near_l = [(-20, 800), (130, 830), (280, 880), (420, 935), (540, 985), (620, 1040), (660, 1100), (-20, 1100)]
    near_r = [(1940, 860), (1850, 880), (1770, 930), (1730, 990), (1712, 1100), (1940, 1100)]
    for pg in (near_l, near_r):
        g.append(poly(pg, '#2B382E', INK, 3)); g += jungle(pg, 30, '#43543F', rnd, (14, 24), '.9', 3)
    # the column, marching left along the river: riders and pikemen (silhouettes, warm rim), nobody looks up
    col = ['r', 's', 's', 's', 'r', 's', 's', 's', 'r', 's', 's']
    x = 790
    for i, c_ in enumerate(col):
        y = 941 - (x - 760) * .0105
        if c_ == 'r': g.append(sil(rider_parts(i), x + 28, y, 1.08, rim=(2.4, -1.8), rimc='#E9B27A')); x += 100
        else: g.append(sil(soldier_parts(i), x, y, 1.08, rim=(2.4, -1.8), rimc='#E9B27A')); x += 58
    return svg(g, defs)

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    which = sys.argv[2:] or ['chichen_calendar', 'chichen_serpent', 'machu_palace', 'machu_hidden']
    for name in which:
        fn = globals().get(name)
        if not fn: continue
        open(os.path.join(OUT, name + '.svg'), 'w').write(fn()); print('svg', name)
