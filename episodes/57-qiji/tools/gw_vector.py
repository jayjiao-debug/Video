"""ep57 长城 (greatwall2.jpg, 2576x1717): the scene drawn in code (our lines, our palette), laid over the
photo's layout so the shutter cut drawing → photo lines up. Repeated details are generated (crenellations
along the wall's path, steps in perspective, brick courses, dry-grass strokes).
usage: gw_vector.py out.svg"""
import sys, math, random
W, H = 2576, 1717
R = random.Random(57)
INK = '#2A211B'
P = dict(sky0='#F7ECD6', sky1='#EAD6B6', far='#D3C7B6', mid='#BCAE9C', slope='#6F665C', slope_lit='#93877A', foot='#9E8B76',
         valley='#D7C19B', river='#F4EEE2', hill='#C8945A', hill_hi='#E3B776', hill_lo='#9A6C44',
         wface='#EEDCB5', wtop='#7C7068', wwalk='#6E6A70', tower='#BBA98E', roof='#5E544D',
         nwall='#6C6870', ncap='#DCA965', merl='#78737B', merl_lit='#E4B878',
         blk_dark='#5B5962', blk_top='#8E8277', blk_lit='#BC9D79', tread='#7B8196', riser='#565B6F',
         pcap='#D8A25F', pcap_d='#6C686F', pface='#625F68', rail='#8A4632', rail_hi='#C98055', grass='#C99A5C', grass_d='#8F6A42')

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

g = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">',
     f'<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{P["sky0"]}"/><stop offset="1" stop-color="{P["sky1"]}"/></linearGradient>'
     f'<linearGradient id="hill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{P["hill_hi"]}"/><stop offset=".6" stop-color="{P["hill"]}"/><stop offset="1" stop-color="{P["hill_lo"]}"/></linearGradient>'
     f'<linearGradient id="slope" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{P["slope_lit"]}"/><stop offset="1" stop-color="{P["slope"]}"/></linearGradient></defs>',
     f'<rect width="{W}" height="{H}" fill="url(#sky)"/>']
# --- mountains, far → near (soft ink, thinner lines far away) ---
far = [(0, 75), (120, 85), (250, 110), (400, 125), (500, 115), (580, 95), (650, 70), (720, 45), (790, 38), (850, 52), (920, 60), (1000, 88), (1100, 118), (1200, 124), (1300, 100), (1450, 90), (1530, 78), (1600, 94), (1700, 108), (1800, 90), (1900, 84), (2000, 74), (2100, 68), (2200, 55), (2300, 60), (2400, 44), (2500, 30), (2576, 22)]
g.append(poly(far + [(W, 700), (0, 700)], P['far'], '#9C9182', 2))
mid = [(0, 130), (150, 150), (300, 190), (400, 214), (500, 200), (600, 170), (700, 150), (800, 136), (900, 150), (1000, 165), (1100, 176), (1200, 200), (1300, 214), (1400, 200), (1500, 214), (1600, 228), (1700, 218), (1800, 190), (1900, 170), (2000, 164), (2100, 150), (2200, 140), (2300, 120), (2400, 100), (2500, 90), (2576, 84)]
g.append(poly(mid + [(W, 800), (0, 800)], P['mid'], '#8E8274', 2))
g.append(poly([(0, 300), (150, 318), (250, 350), (350, 378), (450, 362), (550, 330), (640, 300), (720, 290), (720, 1000), (0, 1000)], P['foot'], '#6E6152', 2.5))
g.append(poly([(1330, 290), (1500, 278), (1650, 298), (1760, 330), (1700, 420), (1600, 470), (1500, 520), (1450, 480), (1400, 400)], P['valley'], '#8E7B60', 2))
g.append(line([(1435, 296), (1420, 340), (1452, 392), (1500, 432), (1540, 470), (1562, 520), (1580, 565)], P['river'], 12))
g.append(poly([(1560, 600), (1600, 420), (1700, 330), (1800, 292), (1900, 270), (2000, 260), (2100, 246), (2200, 240), (2300, 200), (2400, 170), (2500, 146), (2576, 130), (2576, 900), (1560, 900)], 'url(#slope)', '#5E5448', 3))
for i in range(9):   # ridge ribs on the big slope (generated)
    x0 = 1700 + i * 100; g.append(line([(x0, 300 - i * 12), (x0 - 120, 520), (x0 - 210, 700)], '#7A6E61', 2, 'opacity=".55"'))
g.append(poly([(0, 520), (200, 560), (380, 600), (500, 700), (520, 900), (720, 990), (720, 1300), (0, 1400)], '#6F5C49', '#4A3C2E', 3))
# --- the golden hill under the wall ---
g.append(poly([(700, 770), (640, 700), (620, 600), (640, 480), (700, 430), (850, 380), (980, 340), (1050, 360), (1150, 420), (1250, 482), (1350, 560), (1450, 640), (1520, 720), (1300, 740), (1000, 760), (800, 772)], 'url(#hill)', '#6E4A2A', 3))
for _ in range(140):   # dry scrub on the hill: short ink ticks
    x, y = R.uniform(720, 1450), R.uniform(420, 740)
    if y < 330 + (x - 700) * .35 or y > 760: continue
    g.append(line([(x, y), (x + R.uniform(-6, 6), y - R.uniform(10, 22))], '#7A5230', 2, 'opacity=".6"'))
# --- the distant wall: lit inner face, crenellated top, the stair strip on the left ---
top = [(650, 420), (700, 372), (760, 342), (820, 320), (880, 302), (940, 290), (1000, 280), (1035, 272)]
g.append(poly(top + [(1040, 380), (960, 420), (860, 462), (760, 522), (700, 600), (662, 700), (640, 640), (630, 520)], P['wface'], '#8C7656', 3))
for k in range(1, 6):   # stone courses on the lit face (generated, following the wall's curve)
    t = k / 6; g.append(line([lerp(a, b, t) for a, b in zip(top, [(630, 520), (700, 600), (760, 522), (860, 462), (960, 420), (1000, 400), (1040, 380), (1040, 380)])], '#C8B08A', 2))
for (x, y), (tx, ty) in along(top, 16):   # crenellations along the top
    nx, ny = ty, -tx
    if ny > 0: nx, ny = -nx, -ny
    w, h = 16, 26; q = [(x - tx * w, y - ty * w), (x + tx * w, y + ty * w), (x + tx * w + nx * h, y + ty * w + ny * h), (x - tx * w + nx * h, y - ty * w + ny * h)]
    g.append(poly(q, P['wtop'], INK, 2))
left_out = [(590, 425), (500, 520), (470, 650), (480, 800), (520, 900)]; left_in = [(645, 440), (612, 540), (600, 680), (622, 800), (665, 862)]
g.append(poly(left_out + left_in[::-1], P['wwalk'], INK, 3))
for i in range(1, 26):   # the far stair strip: steps
    t = i / 26; a = lerp(left_out[0], left_out[-1], t); a = (edge_x(left_out, a[1]), a[1]); b = (edge_x(left_in, a[1]), a[1])
    g.append(line([a, b], '#4E4B52', 2))
for (x, y), (tx, ty) in along(left_out, 12):
    g.append(poly([(x - 10, y), (x + 4, y), (x + 4, y - 22), (x - 10, y - 22)], P['merl_lit'], INK, 2))
# tower and the small pavilion
g.append(poly([(735, 330), (735, 245), (1030, 245), (1030, 330)], P['tower'], INK, 3))
g.append(poly([(790, 245), (800, 200), (950, 195), (968, 245)], P['roof'], INK, 3))
for x in range(750, 1030, 34): g.append(poly([(x, 250), (x + 16, 250), (x + 16, 232), (x, 232)], P['tower'], INK, 2))
g.append(poly([(205, 540), (205, 420), (300, 410), (300, 540)], '#8E8478', INK, 3))
g.append(poly([(280, 335), (370, 322), (445, 432), (300, 444)], P['roof'], INK, 3))
# --- the near wall crossing the frame (crenellated, lit caps) ---
c0, c1 = (690, 800), (1650, 745)
g.append(poly([c0, c1, (1660, 930), (600, 930)], P['nwall'], INK, 3))
for i in range(10):   # brick courses
    y = 820 + i * 12; g.append(line([(610, y + (c0[1] - 800)), (1650, y - 100 + (c1[1] - 700) + 100)], '#5A5660', 1.5))
n = 11
for i in range(n):
    a = lerp(c0, c1, (i + .15) / n); b = lerp(c0, c1, (i + .78) / n)
    m = [(a[0], a[1]), (b[0], b[1]), (b[0], b[1] - 74), (a[0], a[1] - 74)]
    g.append(poly(m, P['merl'], INK, 3)); g.append(poly([m[3], m[2], (m[2][0] + 10, m[2][1] - 9), (m[3][0] + 10, m[3][1] - 9)], P['merl_lit'], INK, 2))
    g.append(line([(m[1][0] - 3, m[1][1] - 6), (m[2][0] - 3, m[2][1] + 6)], P['merl_lit'], 6))
# the far walkway behind the near wall, down to the parapet (fills the landing)
g.append(poly([(560, 925), (1660, 925), (1660, 1000), (1255, 882), (900, 1000), (600, 1100), (300, 1190), (0, 1273), (0, 1000), (560, 960)], P['wwalk'], INK, 3))
# --- foreground: stairs ---
wl = [(1273, 912), (1182, 1073), (1018, 1255), (855, 1509), (800, 1717)]   # walkway left edge, top → bottom
wr = [(1625, 905), (1636, 982), (1673, 1345), (1691, 1717)]
g.append(poly(wl + wr[::-1], P['tread'], INK, 3))
y, step = 1717, 96
while y > 912 and step > 9:   # steps in perspective: each riser a little shorter than the one in front
    y2 = y - step; a, b = (edge_x(wl, y2), y2), (edge_x(wr, y2), y2)
    g.append(poly([a, b, (b[0], y2 + step * .32), (a[0], y2 + step * .32)], P['riser'], 'none', 0))
    g.append(line([a, b], INK, 2.5))
    for k in range(1, 4):   # paving joints on each tread
        t = k / 4 + R.uniform(-.06, .06); x = a[0] + (b[0] - a[0]) * t; g.append(line([(x, y2 + step * .32), (x, y - 2)], '#5E6377', 1.5))
    y = y2; step *= .9
# right block: shaded brick face, top, lit 春 face
g.append(poly([(1700, 1717), (1672, 650), (2300, 540), (2300, 1717)], P['blk_dark'], INK, 3))
for i in range(12):   # brick courses, converging to the left
    yl = 690 + i * 88; yr = 580 + i * 98; g.append(line([(1680, yl), (2300, yr)], '#B9AFA4', 3, 'opacity=".55"'))
    for k in range(4):
        x = 1720 + k * 150 + (i % 2) * 70; t = (x - 1680) / 620; yy = yl + (yr - yl) * t
        g.append(line([(x, yy), (x, yy + 80)], '#B9AFA4', 2, 'opacity=".4"'))
g.append(poly([(1650, 600), (2290, 440), (2576, 470), (2576, 562), (2300, 540), (1672, 650)], P['blk_top'], INK, 3))
g.append(poly([(2300, 540), (2576, 562), (2576, 1717), (2300, 1717)], P['blk_lit'], INK, 3))
g.append('<text x="2440" y="640" font-family="Noto Serif CJK SC" font-weight="700" font-size="64" fill="#7B6248" opacity=".75">春</text>')
# left parapet: cap stones (alternating lit / shade) and the inner face
cap_top = [(0, 1273), (300, 1190), (600, 1100), (900, 1000), (1255, 882)]; cap_bot = [(0, 1473), (300, 1370), (600, 1260), (900, 1130), (1262, 936)]
g.append(poly(cap_bot + [(1273, 960), (1182, 1073), (1018, 1255), (855, 1509), (800, 1717), (0, 1717)], P['pface'], INK, 3))
cap_mid = [lerp(p, q, .42) for p, q in zip(cap_top, cap_bot)]
st, sm_, sb = along(cap_top, 9), along(cap_mid, 9), along(cap_bot, 9)
for i in range(9):
    g.append(poly([st[i][0], st[i + 1][0], sm_[i + 1][0], sm_[i][0]], P['pcap'], INK, 2.5))      # sunlit top of each cap stone
    g.append(poly([sm_[i][0], sm_[i + 1][0], sb[i + 1][0], sb[i][0]], P['pcap_d'], INK, 2.5))     # its shaded front
g.append(poly([(745, 1215), (790, 1200), (820, 1430), (800, 1480), (760, 1470)], P['pcap'], INK, 2))   # sunlit patch on the inner face
for i in range(14):   # brick courses on the inner face, sloping with the parapet
    y0 = 1500 + i * 17; g.append(line([(0, y0), (edge_x([(1273, 912), (1182, 1073), (1018, 1255), (855, 1509), (800, 1717)], max(960, y0 - 420 + i * 6)) - 4, y0 - 420 + i * 6)], '#53505A', 1.5))
# railings
rl = [(236, 1717), (500, 1500), (745, 1330), (1000, 1150), (1273, 927), (1500, 905)]
rr = [(1609, 909), (1640, 1050), (1680, 1250), (1727, 1345), (1818, 1618), (1891, 1717)]
for r in (rl, rr):
    g.append(line(r, INK, 18)); g.append(line(r, P['rail'], 11)); g.append(line([(x - 2, y - 3) for x, y in r], P['rail_hi'], 3))
for x, y in [(500, 1500), (745, 1330), (1255, 940), (1680, 1250), (1800, 1580)]:
    g.append(line([(x, y), (x, y + 230 * (y / 1717))], INK, 15)); g.append(line([(x, y), (x, y + 230 * (y / 1717))], P['rail'], 9))
# dry grass, bottom left (generated strokes)
for _ in range(420):
    x, y = R.uniform(0, 660), R.uniform(640, 1250)
    if y > 1265 - x * .3: continue
    a = R.uniform(-1.9, -1.2); L = R.uniform(30, 90)
    g.append(line([(x, y), (x + math.cos(a) * L, y + math.sin(a) * L)], R.choice([P['grass'], P['grass_d'], '#E2B97A']), R.uniform(2, 4)))
g.append('</svg>')
open(sys.argv[1], 'w').write('\n'.join(g)); print('ok', len(g), 'elements')
