"""Export the 马丘比丘 history scenes for the Remotion build (Q57MACHU.tsx), from hist_a.py's own drawing code.
Shot A (machu_palace): the citadel split into depth layers (back / mid / city / near) so Remotion can crane up through
them with parallax; the near layer is extended downward with the lower farming terraces the camera rises past.
Shot B (machu_hidden): sky / far peaks / citadel / sea of clouds / valley / near hills, each with a margin for the truck.
Figures, the house being built, crops, the terrace wall being laid, clouds and smoke are built live in Remotion.
Writes remotion/public/ep57/machu/*.svg + machu.json (generated, not committed). usage: python3 export_machu.py"""
import os, sys, json, math, random, re
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import hist_a as HA
OUT = os.path.join(HERE, '../../37-qiqing/remotion/public/ep57/machu'); os.makedirs(OUT, exist_ok=True)
W, H, INK = 1920, 1080, '#2A211B'
def save(name, s): open(f'{OUT}/{name}.svg', 'w').write(s)
def fill_of(e): m = re.search(r'fill="([^"]+)"', e); return m.group(1) if m else None
def first(lst, pred, start=0): return next(i for i in range(start, len(lst)) if pred(lst[i]))

# =====================================================================================================
# A · machu_palace as depth layers (source 2576x1717 shown through viewBox 0 268 2576 1449, exactly as hist_a does)
# =====================================================================================================
inner, ridges = HA.machu_scene()
defs = inner[0]
i_mid = first(inner, lambda e: fill_of(e) == '#3C4F50')      # mid ridges, shoulder, Huayna Picchu, small peak, hump
i_city = first(inner, lambda e: fill_of(e) == '#6E6457')     # the citadel's ground, lawns, terraces, houses, trees
sc, oy = W / 2576, 268
m = lambda x, y: (x * sc, (y - oy) * sc)
def src_layer(els, extra=''):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">{defs}'
            f'<svg x="0" y="0" width="{W}" height="{H}" viewBox="0 {oy} 2576 1449">{"".join(els)}</svg>{extra}</svg>')
save('a_back', src_layer(inner[1:i_mid]))
save('a_mid', src_layer(inner[i_mid:i_city]))
llamas = ''.join(HA.llama(x, y, s_, c_, sh_, fl) for x, y, s_, c_, sh_, fl in
                 ((560, 742, .62, '#F1E6CF', '#CDBB9C', False), (612, 760, .66, '#9A6B45', '#76502F', True), (700, 726, .55, '#E7DCC6', '#C2B190', False)))
save('a_city', src_layer(inner[i_city:], llamas))
picks = sorted([r for r in ridges if 1150 < r[0] < 1450 and 1060 < r[1] < 1200], key=lambda r: r[0])
left = sorted([r for r in ridges if 300 < r[0] < 700 and 1250 < r[1] < 1420], key=lambda r: r[1])
smoke = [list(map(lambda v: round(v, 1), m(*r))) for r in (picks[1], picks[-2], left[len(left) // 2])]

# the near layer (screen coords, 1920 x NH): machu_palace's foreground terrace (same code and random sequence; the house
# plot at the right end is cleared of grass), then the lower farming terraces stepping down below it
NH = 1900
HOUSE = (1112, 1262)                       # the house built live in Remotion stands here on the tread
rnd = random.Random(574)
g = []
g.append(HA.poly([(-20, 935), (1300, 935), (1330, H + 20), (-20, H + 20)], '#7A6F5E', INK, 3))
for i in range(6):
    y0 = 937 + i * 25; x = -20 - (i % 2) * 45
    xend = 1300 + (y0 + 12 - 935) * .2
    while x < xend - 20:
        w_ = min(rnd.uniform(70, 135), xend - x); c_ = rnd.choice(['#7A6F5E', '#857A67', '#6E6454', '#8C806C'])
        g.append(f'<rect x="{x + 2:.1f}" y="{y0 + 2:.1f}" width="{w_ - 4:.1f}" height="21" rx="6" fill="{c_}" stroke="#4E4538" stroke-width="2"/>'); x += w_
tread = [(-20, 905), (300, 896), (700, 898), (1000, 906), (1260, 918), (1300, 940), (-20, 942)]
g.append(HA.poly(tread, '#6F8A34', INK, 3))
g.append(HA.poly([(-20, 925), (1290, 925), (1300, 940), (-20, 942)], '#5C7228', 'none', 0))
g.append(HA.poly([(HOUSE[0] - 14, 914), (HOUSE[1] + 52, 916), (HOUSE[1] + 40, 936), (HOUSE[0] - 20, 936)], '#8C7B5E', INK, 2))   # the cleared plot
for _ in range(90):
    x = rnd.uniform(0, 1280); y = rnd.uniform(905, 938); dx, dy = rnd.uniform(-4, 4), rnd.uniform(6, 14); c_ = rnd.choice(['#93AE45', '#4E6322', '#7E9233'])
    if HOUSE[0] - 26 < x < HOUSE[1] + 56: continue
    g.append(HA.line([(x, y), (x + dx, y - dy)], c_, 2))
# lower terraces: tread k (soil + crop green) on top of wall k (fitted masonry), each a little lower and longer to the right
R2 = random.Random(5741)
LEVELS, GAP, XA, XB = [], [], 640, 1180   # the first lower terrace's wall is still being laid between XA and XB (laid live in Remotion)
top = 1087
for k in range(1, 6):
    def edge(x, base=top): return base + (0 if x < 1330 else (x - 1330) * .07)
    xs = list(range(-40, 1981, 40))
    t_top = [(x, edge(x)) for x in xs]; t_bot = [(x, edge(x) + 30) for x in xs]
    wall_b = [(x, edge(x) + 30 + 150) for x in xs]
    g.append(HA.poly(t_bot + wall_b[::-1], '#756A59', INK, 3))
    if k == 1:   # raw earth where the wall is not laid yet
        g.append(HA.poly([(XA - 150, top + 30), (XB + 150, top + 30), (XB + 150, top + 180), (XA - 150, top + 180)], '#8C7556', INK, 2))
        for x in range(XA - 130, XB + 150, 46):
            g.append(HA.line([(x, top + 40), (x + 14, top + 90), (x + 6, top + 160)], '#735E43', 2, 'opacity=".7"'))
    for i in range(6):                                                    # masonry courses
        yy = 30 + 2 + i * 25; x = -40 - R2.uniform(0, 60); a = b = None
        while x < 1980:
            w_ = R2.uniform(70, 140); c_ = R2.choice(['#7A6F5E', '#857A67', '#6E6454', '#8C806C'])
            y_ = edge(x + w_ / 2) + yy
            if k == 1 and x + w_ > XA and x < XB:
                a = round(x, 1) if a is None else a; b = round(x + w_, 1); x += w_; continue
            g.append(f'<rect x="{x + 2:.1f}" y="{y_:.1f}" width="{w_ - 4:.1f}" height="21" rx="6" fill="{c_}" stroke="#4E4538" stroke-width="2"/>'); x += w_
        if k == 1: GAP.append([a, b])
    g.append(HA.poly(t_top + t_bot[::-1], '#6E8A34' if k % 2 else '#7A9338', INK, 3))
    g.append(HA.poly([(x, y + 18) for x, y in t_top] + t_bot[::-1], '#5C7228', 'none', 0))
    if k == 1:   # the unfinished stretch of terrace is bare soil on top
        g.append(HA.poly([(XA - 40, top + 2), (XB + 40, top + 2), (XB + 64, top + 30), (XA - 64, top + 30)], '#9A8160', INK, 2))
    for _ in range(70):
        x = R2.uniform(-20, 1960); y = edge(x) + R2.uniform(4, 28); dx, dy = R2.uniform(-4, 4), R2.uniform(6, 12); c_ = R2.choice(['#93AE45', '#4E6322', '#7E9233'])
        if k == 1 and XA - 70 < x < XB + 70: continue
        g.append(HA.line([(x, y), (x + dx, y - dy)], c_, 2))
    LEVELS.append(dict(top=top, slope=.07, x_break=1330))
    top = top + 180
save('a_near', f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{NH}" viewBox="0 0 {W} {NH}">{"".join(g)}</svg>')

# =====================================================================================================
# B · machu_hidden as depth layers, each on a canvas with a 100 px margin all round (for the camera truck)
# =====================================================================================================
CAP = {}
_svg = HA.svg
HA.svg = lambda parts, defs='': CAP.update(parts=list(parts), defs=defs) or ''
HA.machu_hidden()
HA.svg = _svg
hg, hdefs = CAP['parts'], CAP['defs']
i_hu = first(hg, lambda e: 'url(#h4hu)' in e)
i_sea = first(hg, lambda e: fill_of(e) == '#F1EDE5')
i_riv = first(hg, lambda e: fill_of(e) == '#B3C4C8')
i_near = first(hg, lambda e: fill_of(e) == '#2B382E')
is_fig = lambda e: e.startswith('<g transform') and '#E9B27A' in e
MG = 100
def widen(e):
    e = re.sub(r'<rect x="0" y="([\d.]+)" width="1920"', lambda q: f'<rect x="-{MG}" y="{q.group(1)}" width="{W + 2 * MG}"', e)
    e = e.replace('<rect width="1920" height="1080"', f'<rect x="-{MG}" y="-{MG}" width="{W + 2 * MG}" height="{H + 2 * MG}"')
    return re.sub(r'(?<![\d.])(-20|-40|1940|1960)(\.0)?,', lambda q: {'-20': '-140', '-40': '-140', '1940': '2060', '1960': '2060'}[q.group(1)] + ',', e)
def b_layer(els):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W + 2 * MG}" height="{H + 2 * MG}" viewBox="-{MG} -{MG} {W + 2 * MG} {H + 2 * MG}">'
            f'<defs>{hdefs}</defs>{"".join(widen(e) for e in els if not is_fig(e))}</svg>')
save('b_sky', b_layer(hg[:2]))
save('b_far', b_layer(hg[2:i_hu]))
save('b_city', b_layer(hg[i_hu:i_sea]))
save('b_sea', b_layer(hg[i_sea:i_riv]))
save('b_valley', b_layer(hg[i_riv:i_near]))
save('b_near', b_layer(hg[i_near:]))
col, x, figs = ['r', 's', 's', 's', 'r', 's', 's', 's', 'r', 's', 's'], 790, []
for i, c_ in enumerate(col):                                          # the column, as machu_hidden places it
    y = 941 - (x - 760) * .0105
    if c_ == 'r': figs.append(dict(k='r', x=x + 28, y=round(y, 2), step=i)); x += 100
    else: figs.append(dict(k='s', x=x, y=round(y, 2), step=i)); x += 58

json.dump(dict(smoke=smoke, house=HOUSE, levels=LEVELS, wall1_gap=GAP, wall1_x=[XA, XB], column=figs, NH=NH, MG=MG), open(f'{OUT}/machu.json', 'w'))
print('ok', os.path.abspath(OUT), 'layers', i_mid, i_city, '| B', i_hu, i_sea, i_riv, i_near, len(hg))
