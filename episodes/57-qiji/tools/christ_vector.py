"""ep57 基督像 (christ.jpg, 1718x2576): the scene drawn in code (our lines, our palette), laid over the photo's
layout so the shutter cut drawing → photo lines up. Repeated details are generated (column flutes, robe folds,
pedestal stones, stair steps, balusters, weathering streaks, the crowd as head-and-shoulder silhouettes).
usage: christ_vector.py out.svg"""
import sys, math, random
W, H = 1718, 2576
R = random.Random(57)
INK = '#2A211B'
P = dict(sky0='#2F5690', sky1='#41659A', sky2='#7590C0', haze='#A3B6D6',
         st='#A9A8A2', st_lit='#C9C6C0', st_sh='#828580', st_deep='#5E625F', st_hair='#8E8F89', st_face='#BEBBB4', st_line='#676A66',
         col0='#7C7E79', col1='#A4A39D', col2='#C0BDB7', flute='#5C5F5B', flute_hi='#CFCCC6',
         ped='#4E4243', ped_line='#3A3031', ped_top='#6E6564',
         drumL='#4B4A49', drumL_top='#77726D', dot='#CFCCC8', baseL='#383736', hazeL='#8496AC',
         band='#BFB4AF', band_hi='#D4CAC4', band_side='#5A514C',
         drumR='#B5A79F', drumR_top='#D3C7BE', drumR_sh='#9D8F85', streak='#6F6259', ground='#7D6D61',
         balu='#4F4540', balu_post='#A29690', tread='#77675F', riser='#4D403B', pole='#26303D', cam='#ECECEC')

def pts(p): return ' '.join(f'{x:.0f},{y:.0f}' for x, y in p)
def poly(p, fill, stroke=INK, sw=3, extra=''): return f'<polygon points="{pts(p)}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" {extra}/>'
def line(p, stroke=INK, sw=3, extra=''): return f'<polyline points="{pts(p)}" fill="none" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" {extra}/>'
def ell(cx, cy, rx, ry, fill, stroke=INK, sw=2.5, extra=''): return f'<ellipse cx="{cx:.0f}" cy="{cy:.0f}" rx="{rx:.1f}" ry="{ry:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>'
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
def arc(cx, cy, rx, ry, a0, a1, n=10): return [(cx + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)), cy + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]

g = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">',
     '<defs>'
     f'<linearGradient id="sky" x1="0" y1="0" x2="1" y2=".25"><stop offset="0" stop-color="{P["sky0"]}"/><stop offset=".5" stop-color="{P["sky1"]}"/><stop offset="1" stop-color="{P["sky2"]}"/></linearGradient>'
     f'<linearGradient id="haze" gradientUnits="userSpaceOnUse" x1="0" y1="1050" x2="0" y2="2100"><stop offset="0" stop-color="{P["haze"]}" stop-opacity="0"/><stop offset="1" stop-color="{P["haze"]}" stop-opacity=".72"/></linearGradient>'
     f'<linearGradient id="col" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="{P["col0"]}"/><stop offset=".55" stop-color="{P["col1"]}"/><stop offset="1" stop-color="{P["col2"]}"/></linearGradient>'
     f'<linearGradient id="drumR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="{P["drumR"]}"/><stop offset=".8" stop-color="{P["drumR"]}"/><stop offset="1" stop-color="{P["drumR_sh"]}"/></linearGradient>'
     '</defs>',
     f'<rect width="{W}" height="{H}" fill="url(#sky)"/>', f'<rect width="{W}" height="{H}" fill="url(#haze)"/>']
# --- sky: one soft light ray from the top right, and the small daytime moon ---
g.insert(1, '<defs><linearGradient id="ray" gradientUnits="userSpaceOnUse" x1="1718" y1="0" x2="700" y2="1900"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".05"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient></defs>')
for k in range(3):   # one soft ray, feathered by stacking three narrowing wedges
    d = 170 - k * 55; g.append(poly([(1718, 130 - d), (1718, 130 + d), (510 + d * .75, 2150), (510 - d * .75, 2150)], 'url(#ray)', 'none', 0))
g.append(ell(1256, 809, 6, 6, '#DCE3EE', 'none', 0, 'opacity=".85"'))

# --- the two lamp posts with their cameras (behind the drum walls) ---
for (bx, by), (tx, ty) in [((130, 2080), (178, 1858)), ((1498, 2046), (1442, 1834))]:
    g.append(line([(bx, by), (tx, ty)], INK, 11)); g.append(line([(bx, by), (tx, ty)], P['pole'], 6))
g.append(poly([(173, 1852), (184, 1855), (182, 1868), (172, 1866)], P['pole'], INK, 2))
g.append(line([(137, 1887), (162, 1902)], INK, 17)); g.append(line([(137, 1887), (162, 1902)], P['cam'], 12))
g.append(poly([(160, 1898), (184, 1900), (187, 1918), (164, 1917)], P['cam'], INK, 2.5))
g.append(poly([(1434, 1832), (1450, 1830), (1452, 1858), (1436, 1860)], '#3A4250', INK, 2))
g.append(line([(1424, 1877), (1458, 1877)], INK, 18)); g.append(line([(1424, 1877), (1458, 1877)], P['cam'], 13))
g.append(poly([(1446, 1884), (1460, 1884), (1460, 1906), (1446, 1906)], P['cam'], INK, 2.5))

# --- the statue ---
# lower tunic (fluted column) first, the cloak covers its top
hem = [(742, 1612), (806, 1645), (854, 1664), (903, 1679), (922, 1698), (942, 1713), (955, 1727)]
colL = [(742, 1600), (742, 1680), (740, 1780), (737, 1880), (735, 1948)]; colR = [(953, 1600), (953, 1700), (955, 1730), (957, 1800), (960, 1880), (963, 1948)]
g.append(poly(colL + colR[::-1], 'url(#col)', INK, 3))
n = 11
for i in range(n):   # flutes: a dark groove with a lit ridge beside it, spreading slightly toward the base
    xt = 753 + i * (946 - 753) / (n - 1); xb = 745 + i * (956 - 745) / (n - 1); yt = edge_y(hem, xt) + 4
    g.append(line([(xt, yt), (xb, 1944)], P['flute'], 5)); g.append(line([(xt + 7, yt + 6), (xb + 7, 1944)], P['flute_hi'], 2.5, 'opacity=".8"'))
# the cloak: arms, shoulders, head and robe in one outline
LH = [(384, 1213), (392, 1206), (410, 1203), (423, 1196), (440, 1193), (462, 1195), (476, 1199), (490, 1206), (503, 1208)]
LTOP = [(530, 1210), (560, 1210), (590, 1208), (620, 1204), (648, 1197), (680, 1193), (710, 1186), (737, 1181), (765, 1177), (792, 1175)]
HEAD = [(794, 1160), (796, 1135), (799, 1105), (803, 1080), (811, 1063), (824, 1055), (838, 1052), (852, 1054), (864, 1059), (873, 1072), (878, 1092), (880, 1120), (882, 1150), (884, 1172)]
RTOP = [(902, 1179), (947, 1183), (983, 1194), (1003, 1199), (1036, 1206), (1050, 1208), (1090, 1204), (1126, 1201), (1163, 1195)]
RH = [(1180, 1189), (1198, 1183), (1226, 1179), (1245, 1180), (1252, 1188), (1276, 1186), (1284, 1195), (1280, 1201), (1265, 1212), (1234, 1220), (1198, 1228), (1170, 1228), (1161, 1226)]
RSL = [(1157, 1224), (1151, 1244), (1140, 1272), (1129, 1296), (1121, 1305), (1090, 1307), (1054, 1309), (1019, 1312), (983, 1321), (951, 1334)]
BODYR = [(951, 1450), (951, 1600), (964, 1610), (971, 1624), (962, 1638), (953, 1652), (953, 1700)]
BODYL = [(742, 1612), (734, 1585), (729, 1540), (725, 1500), (716, 1490), (714, 1472), (718, 1455), (720, 1400), (720, 1330)]
LBOT = [(690, 1328), (657, 1325), (623, 1322), (590, 1317), (560, 1313), (549, 1305), (541, 1290), (527, 1265), (513, 1240), (503, 1238)]
LHB = [(480, 1237), (455, 1238), (425, 1235), (402, 1228), (390, 1221)]
cloak = LH + LTOP + HEAD + RTOP + RH + RSL + BODYR + hem[::-1] + BODYL + LBOT + LHB
g.append(poly(cloak, P['st'], INK, 3))
# light from the right: lit planes on the right torso and the top of the right arm
g.append(poly([(898, 1180), (947, 1183), (951, 1334), (951, 1600), (905, 1665), (900, 1400)], P['st_lit'], 'none', 0))
g.append(poly(RTOP + [(1163, 1195), (1150, 1222), (1100, 1232), (1054, 1240), (1000, 1262), (960, 1290), (951, 1300)], P['st_lit'], 'none', 0))
g.append(poly([(951, 1300), (1000, 1262), (1054, 1240), (1100, 1232), (1150, 1222), (1140, 1272), (1121, 1305), (1054, 1309), (983, 1321), (951, 1334)], P['st_sh'], 'none', 0))
# shade: the left torso, the underside of the left sleeve
g.append(poly([(720, 1330), (762, 1335), (768, 1450), (756, 1560), (746, 1616), (734, 1585), (729, 1540), (725, 1500), (716, 1490), (714, 1472), (718, 1455), (720, 1400)], P['st_sh'], 'none', 0))
g.append(poly([(549, 1305), (590, 1317), (623, 1322), (657, 1325), (690, 1328), (720, 1330), (722, 1288), (690, 1294), (650, 1300), (600, 1302), (565, 1298)], P['st_deep'], 'none', 0))
for (a, b, wt, wb) in [((535, 1226), (580, 1300), 6, 20), ((590, 1216), (650, 1288), 6, 22), ((634, 1204), (704, 1282), 6, 20), ((742, 1200), (790, 1252), 5, 14)]:
    # hanging folds of the left sleeve: dark wedges widening downward
    g.append(poly([(a[0] - wt, a[1]), (a[0] + wt, a[1]), (b[0] + wb, b[1]), (b[0] - wb * .3, b[1])], P['st_sh'], 'none', 0))
    g.append(line([a, lerp(a, b, .5), (b[0] + wb * .3, b[1])], P['st_line'], 2))
for (a, b) in [((1054, 1240), (960, 1300)), ((1100, 1232), (1030, 1290)), ((1147, 1215), (1085, 1272))]:   # long folds of the right sleeve
    g.append(line([a, lerp(a, b, .5), b], P['st_line'], 2.5))
# sleeve openings (dark inside) and the hands
g.append(poly([(503, 1208), (513, 1240), (527, 1265), (541, 1290), (549, 1305), (555, 1298), (540, 1262), (524, 1232), (511, 1209)], P['st_sh'], 'none', 0))
g.append(poly([(1163, 1195), (1157, 1224), (1151, 1244), (1140, 1272), (1129, 1296), (1121, 1305), (1116, 1294), (1130, 1262), (1142, 1232), (1153, 1198)], P['st_sh'], 'none', 0))
g.append(line([(511, 1210), (522, 1240), (538, 1268), (552, 1298)], P['st_line'], 2)); g.append(line([(1154, 1199), (1144, 1232), (1132, 1264), (1118, 1296)], P['st_line'], 2))
g.append(poly(LH + [(503, 1238)] + LHB, P['st_face'], INK, 2.5))
g.append(poly([(1163, 1195)] + RH, P['st_face'], INK, 2.5))
for k in range(3):   # finger lines (generated)
    g.append(line([(392 + k * 2, 1210 + k * 5), (425 + k * 4, 1212 + k * 6)], P['st_line'], 1.8))
    g.append(line([(1276 - k * 3, 1194 + k * 6), (1235 - k * 6, 1199 + k * 7)], P['st_line'], 1.8))
g.append(line([(424, 1197), (470, 1203)], P['st_line'], 1.8)); g.append(line([(1244, 1182), (1205, 1190)], P['st_line'], 1.8))
# chest: the drape across the chest, the small heart, the stole, waist cords
g.append(line([(733, 1203), (770, 1236), (800, 1254), (822, 1260), (848, 1256), (880, 1248)], INK, 2.5))
g.append(line([(745, 1290), (790, 1290), (830, 1286), (875, 1270)], P['st_line'], 2))
g.append(f'<path d="M838,1215 C835,1209 828,1211 829,1216 C830,1220 836,1222 838,1226 C840,1222 846,1220 847,1216 C848,1211 841,1209 838,1215 Z" fill="{P["st_lit"]}" stroke="{P["st_line"]}" stroke-width="2"/>')
g.append(poly([(884, 1178), (903, 1180), (910, 1662), (898, 1672)], P['st_sh'], INK, 2))
for k in range(3): g.append(line([(828 + k * 6, 1287 + k * 4), (858 + k * 4, 1318 + k * 3), (886, 1334 + k * 5)], P['st_line'], 1.8))
# robe folds below the waist: a few long curved lines
for f in [[(748, 1320), (806, 1421), (864, 1518), (890, 1575)], [(776, 1372), (812, 1440), (845, 1494), (872, 1560)],
          [(750, 1330), (752, 1440), (752, 1560), (750, 1610)], [(930, 1300), (932, 1430), (930, 1560), (925, 1640)], [(808, 1500), (830, 1560), (850, 1620)]]:
    g.append(line(f, P['st_line'], 2.5))
g.append(poly([(716, 1472), (736, 1466), (744, 1488), (725, 1499), (716, 1490)], P['st_sh'], 'none', 0))   # the small flap at the left edge
g.append(line([(718, 1468), (738, 1466), (745, 1488), (727, 1500)], P['st_line'], 2))
g.append(line(hem, INK, 3)); g.append(poly([(948, 1612), (970, 1624), (962, 1637), (953, 1630)], P['st_sh'], 'none', 0))
# the head: hair falling to the shoulders, a calm simple face (no detailed features)
g.append(poly(HEAD + [(884, 1176), (860, 1180), (830, 1180), (794, 1175)], P['st_hair'], INK, 3))
face = [(816, 1084), (822, 1070), (838, 1063), (856, 1066), (870, 1078), (874, 1098), (871, 1124), (864, 1142), (850, 1153), (836, 1152), (824, 1140), (818, 1118)]
g.append(poly(face, P['st_face'], P['st_line'], 2))
g.append(poly([(816, 1084), (822, 1070), (834, 1065), (830, 1090), (832, 1130), (836, 1152), (824, 1140), (818, 1118)], P['st_sh'], 'none', 0, 'opacity=".55"'))
for ex in (831, 858): g.append(ell(ex, 1095, 9, 6, P['st_sh'], 'none', 0, 'opacity=".45"'))   # soft shade under the brow, no eyes drawn
g.append(line([(822, 1088), (838, 1084), (852, 1084), (868, 1088)], P['st_line'], 2.5, 'opacity=".7"'))
g.append(line([(845, 1090), (843, 1112), (848, 1116)], P['st_line'], 2))
g.append(poly([(828, 1126), (840, 1121), (852, 1121), (864, 1126), (858, 1144), (846, 1152), (834, 1146)], P['st_hair'], 'none', 0, 'opacity=".45"'))   # the short beard as a soft tone
for s in (-1, 1):   # hair strands (mirrored)
    cx = 840
    g.append(line([(cx + s * 4, 1056), (cx + s * 30, 1068), (cx + s * 36, 1110), (cx + s * 38, 1170)], P['st_line'], 2))
    g.append(line([(cx + s * 10, 1056), (cx + s * 37, 1075), (cx + s * 41, 1120), (cx + s * 42, 1172)], P['st_line'], 1.6, 'opacity=".7"'))
g.append(poly([(828, 1150), (860, 1150), (866, 1177), (822, 1177)], P['st_sh'], 'none', 0))   # neck in shade under the chin
g.append(line([(822, 1177), (845, 1186), (868, 1177)], P['st_line'], 2))

# --- the pedestal and the scaffold beside it ---
g.append(poly([(700, 1950), (965, 1950), (965, 1980), (1010, 1980), (1010, 1988), (1027, 1988), (1027, 2090), (700, 2090)], P['ped'], INK, 3))
for i in range(7):   # dressed stone courses (generated)
    y = 1966 + i * 18; x1 = 965 if y < 1980 else (1010 if y < 1988 else 1027)
    g.append(line([(702, y), (x1 - 2, y)], P['ped_line'], 2))
    for x in range(712 + (i % 2) * 22, x1 - 10, 44): g.append(line([(x, y), (x, y + 18)], P['ped_line'], 1.6))
g.append(poly([(726, 1940), (970, 1940), (970, 1952), (726, 1952)], P['ped_top'], INK, 2.5))
for x in (577, 620, 665, 708): g.append(line([(x, 1926), (x, 2045)], '#2C2828', 3))
for (y, x0, x1) in [(1932, 575, 727), (1940, 575, 727), (1977, 562, 690), (1985, 562, 690)]: g.append(line([(x0, y), (x1, y)], '#2C2828', 3))

# --- the stairs between the walls (mostly behind the crowd) ---
g.append(poly([(400, 2046), (700, 2060), (1027, 2060), (1250, 2040), (1340, 2040), (1500, 2576), (180, 2576)], P['tread'], INK, 3))
y, step = 2572, 25.0
while y > 2070:   # steps in perspective: each riser a little shorter than the one in front
    y2 = y - step; a, b = (380 - (y2 - 2100) * .38, y2), (1240 + (y2 - 2050) * .3, y2)
    g.append(poly([a, b, (b[0], y2 + step * .42), (a[0], y2 + step * .42)], P['riser'], 'none', 0))
    g.append(line([a, b], INK, 2))
    y = y2; step *= .975

# --- crowd standing behind the drum walls (only heads show) ---
def head(x, y, r, skin, hair, hat=None, hatc=None, back=False, long=0):
    o = []
    if long: o.append(poly(arc(x, y, r * .98, r * 1.02, 180, 360) + [(x + r * .95, y + long), (x - r * .95, y + long)], hair, INK, 2.5))
    o.append(ell(x, y, r * .86, r, skin))
    if back: o.append(ell(x, y, r * .88, r * 1.02, hair))
    elif hair: o.append(poly(arc(x, y, r * .9, r * 1.04, 190, 350) + [(x + r * .55, y - r * .32), (x - r * .55, y - r * .32)], hair, INK, 2))
    if hat == 'cap':
        o.append(poly(arc(x, y - r * .05, r * .94, r * 1.08, 180, 360) + [(x + r * .94, y - r * .12)], hatc, INK, 2.5))
        o.append(poly([(x - r * .2, y - r * .22), (x + r * 1.35, y - r * .26), (x + r * 1.3, y - r * .08), (x - r * .2, y - r * .08)], hatc, INK, 2.5))
    if hat == 'brim':
        o.append(ell(x, y - r * .3, r * 1.7, r * .38, hatc)); o.append(poly(arc(x, y - r * .3, r * .9, r * 1.0, 180, 360), hatc, INK, 2.5))
        o.append(line([(x - r * .88, y - r * .42), (x + r * .88, y - r * .42)], INK, 2.5))
    return o
g += head(325, 2037, 13, '#B9876A', '#2A211B') + head(367, 2032, 13, '#D8AC90', None, 'cap', '#F2F2F2') + head(1357, 2022, 12, '#D9AE95', '#E8E4DE')

# --- the platform: left drum (in shade), right drum (sunlit), their sloping parapets ---
rimL = [(36, 2096), (67, 2080), (133, 2067), (200, 2058), (267, 2053), (333, 2049), (400, 2047)]
bandL_out = [(400, 2047), (320, 2117), (267, 2170), (220, 2230), (163, 2305), (105, 2410), (47, 2516), (18, 2576)]
bandL_in = [(432, 2052), (410, 2100), (373, 2160), (337, 2200), (300, 2260), (270, 2330), (248, 2410), (225, 2480), (200, 2576)]
g.append(poly([(0, 2402), (40, 2402), (40, 2576), (0, 2576)], P['hazeL'], 'none', 0))
g.append(poly(rimL + bandL_out[1:5] + [(113, 2395), (0, 2395), (0, 2265), (22, 2183)], P['drumL'], INK, 3))
g.append(line(rimL, P['drumL_top'], 5)); g.append(line([(x, y + 1) for x, y in rimL], INK, 2))
for _ in range(16):   # weathering streaks on the shaded drum
    x = R.uniform(30, 300); y0 = edge_y(rimL, x) + 6; L = R.uniform(30, 150)
    if edge_x(bandL_out, y0 + L) < x: continue
    g.append(line([(x, y0), (x - L * .08, y0 + L)], '#3A3938', R.uniform(3, 7), 'opacity=".45"'))
for (x, y, r) in [(307, 2087, 5), (320, 2080, 6), (333, 2084, 5), (313, 2097, 5), (327, 2094, 6), (267, 2130, 5), (273, 2122, 4), (287, 2116, 5), (293, 2110, 4), (268, 2141, 4), (279, 2136, 4)]:
    g.append(ell(x, y, r, r * .85, P['dot'], 'none', 0))   # the pale marks on the drum
g.append(poly([(0, 2388), (117, 2388), (110, 2403), (0, 2403)], '#8E8B87', INK, 2.5))
g.append(poly([(40, 2403), (109, 2403), (47, 2516), (40, 2516)], P['baseL'], INK, 2.5))
g.append(poly(bandL_in + [(260, 2576), (290, 2470), (320, 2330), (380, 2230), (440, 2140), (470, 2060)], P['band_side'], INK, 2.5))
g.append(poly(bandL_out + bandL_in[::-1], P['band'], INK, 3))
g.append(line([lerp((edge_x(bandL_out, y), y), (edge_x(bandL_in, y), y), .25) for y in range(2060, 2577, 40)], P['band_hi'], 5, 'opacity=".8"'))
# right drum
rimR = [(1295, 2031), (1307, 2027), (1353, 2033), (1420, 2037), (1487, 2040), (1553, 2047), (1600, 2053), (1620, 2063)]
edgeR = [(1620, 2063), (1640, 2117), (1660, 2183), (1680, 2250), (1693, 2303), (1700, 2360)]
bandR_out = [(1295, 2031), (1354, 2105), (1385, 2144), (1430, 2220), (1477, 2298), (1514, 2360), (1546, 2413), (1585, 2480), (1640, 2576)]
bandR_in = [(1262, 2034), (1273, 2090), (1308, 2190), (1342, 2290), (1385, 2390), (1415, 2452), (1462, 2576)]
def band_hi(out, inn, t, ys): return [lerp((edge_x(out, y), y), (edge_x(inn, y), y), t) for y in ys]
g.append(poly([(1480, 2380), (1718, 2360), (1718, 2576), (1560, 2576)], P['ground'], INK, 3))
for _ in range(60):   # rocky ground: short strokes
    x, y = R.uniform(1520, 1715), R.uniform(2395, 2570)
    if x < 1480 + (y - 2380) * .45: continue
    g.append(line([(x, y), (x + R.uniform(8, 22), y + R.uniform(-4, 6))], R.choice(['#5E5047', '#9A8A7C']), R.uniform(2, 4)))
for (x, y, r) in [(1712, 2420, 18), (1706, 2452, 14), (1716, 2478, 12)]: g.append(ell(x, y, r, r * .8, '#5D7F4A', INK, 2))
g.append(line([(1690, 2300), (1690, 2380)], '#7A3A26', 5)); g.append(line([(1690, 2318), (1718, 2312)], '#7A3A26', 5)); g.append(line([(1704, 2306), (1704, 2385)], '#7A3A26', 4))
g.append(poly(rimR + edgeR[1:] + [(1700, 2366), (1525, 2378)] + bandR_out[5:0:-1], 'url(#drumR)', INK, 3))
g.append(poly(rimR + [(x - 2, y + 26) for x, y in rimR[::-1]], P['drumR_sh'], 'none', 0, 'opacity=".55"'))
g.append(line(rimR, P['drumR_top'], 6)); g.append(line([(x, y + 3) for x, y in rimR], INK, 2))
for _ in range(26):   # weathering streaks running down from the rim
    x = R.uniform(1420, 1650); y0 = edge_y(rimR, min(x, 1620)) + 8; L = R.uniform(30, 170)
    if x > edge_x(edgeR, y0 + L) - 6 or x < edge_x(bandR_out, y0 + L) + 6: continue
    g.append(line([(x, y0), (x + L * .06, y0 + L)], P['streak'], R.uniform(2, 6), 'opacity=".3"'))
g.append(poly([(1514, 2366), (1700, 2354), (1700, 2368), (1522, 2381)], '#CBBFB6', INK, 2.5))
g.append(line([(1595, 2342), (1632, 2340)], INK, 4))
balL = [(1238, 2060), (1243, 2150), (1255, 2250), (1280, 2340), (1310, 2420), (1350, 2520), (1372, 2576)]   # foot of the balustrade, top → bottom
g.append(poly(bandR_in + balL[::-1], P['balu'], INK, 2.5))
for (x, y), (tx, ty) in along([(1254, 2115), (1266, 2200), (1290, 2290), (1318, 2375), (1350, 2460)], 5):   # balusters, bigger as they come closer
    h = 44 + (y - 2115) * .16; w = h * .34
    g.append(poly([(x - w * .5, y - h * .5), (x + w * .5, y - h * .5), (x + w * .3, y - h * .2), (x + w * .6, y + h * .15), (x + w * .35, y + h * .5), (x - w * .35, y + h * .5), (x - w * .6, y + h * .15), (x - w * .3, y - h * .2)], P['balu_post'], INK, 2))
g.append(poly(bandR_out + bandR_in[::-1], P['band'], INK, 3))
g.append(line(band_hi(bandR_out, bandR_in, .3, range(2060, 2577, 40)), P['band_hi'], 5, 'opacity=".8"'))

# --- the crowd on the stairs: generated head-and-shoulder silhouettes, no faces ---
def person(x, y, r, shirt, hair, skin='#C99A7C', hat=None, hatc=None, bot=None, wf=1.0, pants=None, pbot=2576, legs=None,
           back=False, long=0, arms=True, acc=None):
    o = []; sw = 1.7 * r * wf; bot = bot or y + 5 * r; y0 = y + .75 * r; y1 = y + 1.45 * r
    if legs:
        for s in (-1, 1): o.append(line([(x + s * sw * .4, pbot - 4), (x + s * sw * .36, legs)], INK, r * .85 + 4)); o.append(line([(x + s * sw * .4, pbot - 4), (x + s * sw * .36, legs)], skin, r * .85))
    if pants:
        o.append(poly([(x - sw * .92, bot - 4), (x + sw * .92, bot - 4), (x + sw * .88, pbot), (x - sw * .88, pbot)], pants, INK, 2.5))
        if pbot - bot > 40: o.append(line([(x, bot + 12), (x, pbot)], INK, 2))
    if arms:   # shoulder → elbow (a little out) → hand, drawn under the torso
        for s in (-1, 1):
            a = (x + s * sw * .9, y1 + .2 * r); e = (x + s * (sw + .3 * r), y1 + 1.9 * r); h = (x + s * (sw + .05 * r), min(bot - .1 * r, y1 + 3.7 * r))
            o.append(line([a, e, h], INK, r * .6 + 4)); o.append(line([a, e, h], skin, r * .6))
            if arms == 'sleeve': o.append(line([a, lerp(a, e, .6)], shirt, r * .7))
    torso = [(x - .42 * r, y0), (x - .78 * sw, y0 + .22 * r), (x - .97 * sw, y0 + .6 * r), (x - sw, y1 + .5 * r), (x - .9 * sw, bot), (x + .9 * sw, bot),
             (x + sw, y1 + .5 * r), (x + .97 * sw, y0 + .6 * r), (x + .78 * sw, y0 + .22 * r), (x + .42 * r, y0)]
    o.append(poly(torso, shirt, INK, 2.5))
    if acc:
        kind, c = acc
        if kind == 'hstripe':
            for yy in range(int(y1), int(bot) - 6, int(r * .9)): o.append(line([(x - sw * .93, yy), (x + sw * .93, yy)], c, r * .32))
        if kind == 'vstripe':
            for k in range(-3, 4): o.append(line([(x + k * sw * .27, y0 + .5 * r), (x + k * sw * .25, bot - 3)], c, r * .2))
        if kind == 'strap': o.append(line([(x - sw * .55, y0 + .3 * r), (x + sw * .8, bot - 6)], c, r * .3))
        if kind == 'text':
            for k in range(2): o.append(line([(x - sw * .5 + j * sw * .19, y1 + r * (.9 + k * .45) + (j % 2) * r * .14) for j in range(6)], c, 3.5))
        if kind == 'dots':
            for k in range(16): o.append(ell(x - sw * .7 + (k % 4) * sw * .45, y1 + r * .5 + (k // 4) * (bot - y1 - r) / 4, 3, 3, c, 'none', 0))
        if kind == 'pack': o.append(poly([(x - sw * 1.0, y1), (x - sw * .35, y1 - r * .1), (x - sw * .3, y1 + r * 2.4), (x - sw * 1.05, y1 + r * 2.5)], c, INK, 2.5))
    o += head(x, y, r, skin, hair, hat, hatc, back, long)
    return o
crowd = [
    dict(x=440, y=1980, r=17, shirt='#DCDCDA', hair='#2A1F1A', skin='#B07F62', bot=2060),
    dict(x=475, y=1970, r=17, shirt='#A3A3A6', hair='#2A1F1A', skin='#D7A88E', bot=2070, back=True),
    dict(x=550, y=2015, r=14, shirt='#E5C33C', hair='#2A1F1A', bot=2070, arms=False),
    dict(x=715, y=1990, r=16, shirt='#2F3A55', hair='#1E1814', skin='#B98365', bot=2110, pants='#6E2A30', pbot=2160),
    dict(x=1175, y=1980, r=18, shirt='#E6DCD2', hair=None, skin='#D9A88C', hat='cap', hatc='#2B3352', bot=2060),
    dict(x=1217, y=1972, r=17, shirt='#E9E1D8', hair='#D9BC86', skin='#E2B79B', bot=2030, arms=False),
    dict(x=1247, y=1947, r=18, shirt='#8A5A3C', hair='#2A211B', skin='#B98365', bot=2030, arms=False),
    dict(x=902, y=1932, r=18, shirt='#2A3350', hair='#2A211B', skin='#C49172', hat='brim', hatc='#C8312E', bot=2100, wf=1.4, back=True, acc=('dots', '#E58AA8')),
    dict(x=685, y=1932, r=21, shirt='#1E1E22', hair='#1A1512', skin='#9C6B50', bot=2090, pants='#B79B78', pbot=2160, arms='sleeve'),
    dict(x=780, y=1945, r=20, shirt='#1F2840', hair='#B88A5A', skin='#E0B59A', bot=2090, pants='#B8B2A8', pbot=2140, arms='sleeve', acc=('pack', '#5F7A4A')),
    dict(x=630, y=1960, r=19, shirt='#2E3E70', hair='#3B2A20', skin='#D9A88C', bot=2090, pants='#EDEDED', pbot=2140, acc=('vstripe', '#E9E9EE'), back=True),
    dict(x=835, y=1968, r=19, shirt='#EDE6E2', hair='#D8B57A', skin='#E2B79B', bot=2140, long=40, acc=('dots', '#C96A7A')),
    dict(x=1090, y=1962, r=19, shirt='#9C9A98', hair='#1C1714', skin='#C08A6C', bot=2130, long=45, arms='sleeve'),
    dict(x=500, y=1972, r=20, shirt='#4B4F37', hair='#9A3A26', skin='#E2B298', bot=2200, wf=1.3, back=True),
    dict(x=1225, y=2012, r=20, shirt='#2E7C74', hair=None, skin='#B67C5C', hat='cap', hatc='#D8262C', bot=2200, pants='#2B2626', pbot=2300, arms='sleeve', back=False),
    dict(x=1042, y=2017, r=20, shirt='#ECECEC', hair='#3A2A20', skin='#D9A88C', hat='brim', hatc='#B7B39A', bot=2190, arms='sleeve', acc=('pack', '#1E1E22')),
    dict(x=827, y=2035, r=23, shirt='#D42A2A', hair='#1A1412', skin='#7A4E38', bot=2210, arms='sleeve', back=True, acc=('hstripe', '#1C1414')),
    dict(x=427, y=2082, r=22, shirt='#9E98B5', hair='#4A3428', skin='#D7A88E', bot=2380, wf=1.35, back=True, arms='sleeve', acc=('strap', '#2A2626')),
    dict(x=1110, y=2140, r=22, shirt='#F0C9D6', hair='#2A1C16', skin='#DDA88A', bot=2283, pants='#A8DCCB', pbot=2367, legs=2555, back=True, long=95),
    dict(x=585, y=2130, r=24, shirt='#2C2F2A', hair=None, skin='#C48E6E', hat='cap', hatc='#18181B', bot=2347, pants='#5C8C8A', pbot=2440, legs=2576),
    dict(x=920, y=2155, r=24, shirt='#2B3557', hair='#2A1C16', skin='#B57E62', bot=2355, arms='sleeve', acc=('text', '#E5559A')),
    dict(x=705, y=2180, r=24, shirt='#EEE4E4', hair='#8E2E2A', skin='#E0B39A', bot=2300, back=True, acc=('dots', '#4E8A6A')),
    dict(x=714, y=2290, r=24, shirt='#D9302E', hair='#8E2E2A', skin='#E0B39A', bot=2450, back=True),
    dict(x=878, y=2239, r=27, shirt='#3D5A8E', hair='#2A1F1A', skin='#C99478', bot=2461, pants='#2A2A30', pbot=2576, arms='sleeve', acc=('dots', '#7F9BCB')),
    dict(x=363, y=2221, r=28, shirt='#F2F0F4', hair='#5A3A26', skin='#D9A588', bot=2410, wf=1.3, pants='#8FA6C4', pbot=2576),
    dict(x=668, y=2268, r=28, shirt='#1E1C1E', hair='#4A3626', skin='#C99478', bot=2440, pants='#9DB4D4', pbot=2576, back=True, acc=('strap', '#E8762E')),
    dict(x=775, y=2292, r=28, shirt='#F2246A', hair='#B08B5E', skin='#E3B497', bot=2461, pants='#F2246A', pbot=2576, long=60),
    dict(x=1250, y=2411, r=30, shirt='#3A3330', hair='#5A4434', skin='#C08A6A', hat='cap', hatc='#F1F1F1', bot=2576),
    dict(x=379, y=2432, r=37, shirt='#5C5E62', hair='#1B1512', skin='#A87658', bot=2576, wf=1.5, back=True, arms=False, acc=('text', '#E2525A')),
    dict(x=432, y=2479, r=33, shirt='#3A3A40', hair=None, skin='#E8B4A8', bot=2576, arms=False),
    dict(x=189, y=2479, r=37, shirt='#F1E7B0', hair='#2A211B', skin='#A87050', hat='cap', hatc='#2E5FB8', bot=2576, wf=1.35, arms=False, acc=('strap', '#F08A2A')),
    dict(x=939, y=2489, r=42, shirt='#2E2C30', hair='#BDB7B2', skin='#D7AE96', hat='cap', hatc='#A7A7C2', bot=2576, arms=False, back=True),
    dict(x=1206, y=2489, r=48, shirt='#3A3532', hair='#D9BF92', skin='#E1B79C', bot=2576, arms=False, long=60),
    dict(x=733, y=2500, r=30, shirt='#2A2626', hair='#2A211B', skin='#C99478', hat='brim', hatc='#F1EEE8', bot=2576, arms=False, acc=('strap', '#3DAA8A')),
    dict(x=589, y=2526, r=40, shirt='#2E2E33', hair=None, skin='#C99478', hat='brim', hatc='#F1EEEA', bot=2576, arms=False),
    dict(x=13, y=2560, r=42, shirt='#3A3532', hair='#5C3D2C', bot=2576, arms=False, back=True),
]
# the packed crowd behind them: rows of generated figures, muted, filling the stairs between the walls
MUTE = ['#3E3A3A', '#5A5050', '#6B6A70', '#4A4F5E', '#7A6E66', '#2F3238', '#8C8A86', '#56604F', '#6F5A4E', '#3A4560']
SKIN = ['#C99A7C', '#B07F62', '#8E5E45', '#DDB497', '#C48E6E']
HAIR = ['#2A211B', '#1A1512', '#4A3428', '#6B4A30', '#B89064', '#2A1C16']
ACC = ['#C8312E', '#2E5FB8', '#E5C33C', '#F1F1F1', '#2E7C74', '#E58AA8']
filler = []
for yy in range(1998, 2440, 36):
    r = 13 + (yy - 1998) * .042; x = edge_x(bandL_in, yy) + R.uniform(.5, 1.5) * r
    while x < edge_x(balL, yy) - 1.2 * r:
        hx, hy = x + R.uniform(-.4, .4) * r, yy + R.uniform(-.5, .5) * r
        if all(math.dist((hx, hy), (c['x'], c['y'])) > 1.5 * (r + c['r']) for c in crowd):
            hat = R.random(); filler.append(dict(x=hx, y=hy, r=r, shirt=R.choice(MUTE), hair=R.choice(HAIR), skin=R.choice(SKIN), arms=False,
                                                 bot=hy + 4.6 * r, wf=R.uniform(.9, 1.15), back=R.random() < .5,
                                                 hat='cap' if hat < .18 else None, hatc=R.choice(ACC)))
        x += R.uniform(2.4, 3.2) * r
for c in sorted(filler, key=lambda c: c['y']): g += person(**c)
for c in crowd: g += person(**c)
g.append(line([(1000, 2565), (1040, 2510), (1067, 2478)], INK, 18)); g.append(line([(1000, 2565), (1040, 2510), (1067, 2478)], '#D7AE96', 13))   # raised arm
g.append(line([(1262, 2100), (1300, 2130), (1308, 2142)], INK, 16)); g.append(line([(1262, 2100), (1300, 2130), (1308, 2142)], '#B67C5C', 11))  # arm on the parapet
# out-of-focus heads right in front of the lens (dark, soft)
g.append(poly(arc(1430, 2600, 185, 175, 180, 360, 16), '#2E2420', INK, 3))
g.append(poly(arc(1650, 2610, 120, 120, 180, 360, 12), '#3A2E28', INK, 3))
for k in range(9):   # a few loose hair strokes on the blurred heads
    x0 = 1290 + k * 40; g.append(line([(x0, 2470 + abs(k - 4) * 9), (x0 + 30, 2450 + abs(k - 4) * 10)], '#54443B', 4, 'opacity=".6"'))
g.append('</svg>')
open(sys.argv[1], 'w').write('\n'.join(g)); print('ok', len(g), 'elements')
