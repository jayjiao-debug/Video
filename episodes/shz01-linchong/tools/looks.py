"""Look stills for 水浒人物志 · 壹 · 林冲 (9:16, 1080x1920).

Usage: python3 looks.py <outdir> [names...]   names: hook title portrait snow regret
"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ink import *
from ink import _rot, _grid
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SUBFONT = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc'


def subtitle(img, text, y=1440, size=58, color=(0.11, 0.105, 0.10), halo=(0.93, 0.90, 0.84)):
    """Preview of the burned-in subtitle: ink text with a paper halo, bottom-centred."""
    h, w = img.shape[:2]
    m = Image.new('L', (w, h), 0)
    d = ImageDraw.Draw(m)
    f = ImageFont.truetype(SUBFONT, size, index=0)
    bb = d.textbbox((0, 0), text, font=f)
    x = (w - (bb[2] - bb[0])) / 2 - bb[0]
    d.text((x, y - size), text, fill=255, font=f)
    a = np.asarray(m, np.float32) / 255
    hl = cv2.dilate(a, np.ones((9, 9), np.uint8))
    hl = cv2.GaussianBlur(hl, (0, 0), 3.5)
    img = apply_light(img, np.clip(hl * 1.4, 0, 1) * 0.85, halo)
    return img * (1 - a[..., None]) + np.array(color, np.float32) * a[..., None]


def seal_bold(h, w, c, size, chars, seed=0):
    return seal(h, w, c, size, chars, 'kai', True, seed)


# ------------------------------------------------------------------ figure
def lin_walker(D, L, x, y, s=1.0, seed=0, facing=1, lean=9, gourd=True):
    """林冲 walking into the wind: 毡笠 hat, cloak flaring back, 花枪 over the
    shoulder with the wine gourd hanging from it (第十回).
    (x, y) = feet, s = scale (1.0 = ~300 px tall). facing=1 walks right."""
    h, w = D.shape
    f = facing

    def P(px, py):
        q = _rot([(px, py)], lean, (0, 0))[0]
        return (x + q[0] * s * f, y + q[1] * s)

    rng = np.random.default_rng(seed)
    # cloak: front edge straight, back edge flaring in the wind
    cloak = poly_mask(h, w, [P(22, -208), P(34, -160), P(40, -40), P(30, -12), P(-30, -14), P(-62, -22),
                             P(-118, -48), P(-92, -96), P(-70, -150), P(-30, -206)])
    D = union(D, wash(cloak, 0.58, 2, 0.4, 3 * s, 0.45, seed, cells=24) * (0.85 + 0.3 * fbm(h, w, 6, 3, seed + 1)))
    D = stroke(D, [P(-28, -206), P(-62, -150), P(-90, -96), P(-120, -48)], width=7 * s, dry=0.45, seed=seed + 2, head=0.6)
    D = stroke(D, [P(22, -204), P(36, -150), P(40, -60), P(32, -14)], width=8 * s, dry=0.3, seed=seed + 3, head=0.6)
    D = stroke(D, [P(-6, -186), P(-24, -120), P(-48, -50)], width=4 * s, dry=0.7, ink=0.55, seed=seed + 4)
    D = stroke(D, [P(-40, -24), P(-80, -32), P(-116, -46)], width=5 * s, dry=0.6, ink=0.7, seed=seed + 5)
    # stride
    D = stroke(D, [P(10, -28), P(26, -10), P(40, 2)], width=13 * s, dry=0.1, seed=seed + 6, taper=(0.05, 0.05))
    D = stroke(D, [P(-8, -26), P(-22, -10), P(-34, 0)], width=13 * s, dry=0.1, seed=seed + 7, taper=(0.05, 0.05))
    # head + hat tipped into the wind
    D = blob(D, P(10, -226), 16 * s, 0.8, seed + 8)
    hat = poly_mask(h, w, [P(-58, -232), P(12, -280), P(76, -246), P(52, -236), P(-30, -228)])
    D = union(D, wash(hat, 0.85, 1.5, 0.3, 2 * s, 0.2, seed + 9, cells=30))
    D = stroke(D, [P(-64, -230), P(10, -244), P(82, -246)], width=6 * s, dry=0.2, seed=seed + 10, taper=(0.3, 0.3))
    L = stroke(L, [P(-40, -240), P(12, -272), P(54, -252)], width=6 * s, dry=0.5, ink=0.9, seed=seed + 11, wet=0)
    L = stroke(L, [P(-26, -206), P(20, -210)], width=5 * s, dry=0.5, ink=0.8, seed=seed + 12, wet=0)
    # spear on the shoulder, tip forward and up; gourd hangs near the tip
    tip = P(170, -360)
    D = stroke(D, [P(-130, -104), P(10, -206), tip], width=6.5 * s, dry=0.05, seed=seed + 13, taper=(0.05, 0.05), head=0.3, fade=0.0)
    D = stroke(D, [tip, P(196, -380)], width=11 * s, dry=0.0, seed=seed + 14, taper=(0.02, 0.95), fade=0.0)
    if gourd:
        g0 = P(140, -338)
        D = stroke(D, [g0, P(142, -312)], width=1.6 * s, dry=0.0, seed=seed + 15, taper=(0, 0), wet=0)
        D = blob(D, P(143, -302), 8 * s, 0.85, seed + 16)
        D = blob(D, P(145, -282), 13 * s, 0.85, seed + 17)
    # hand on the shaft
    D = stroke(D, [P(26, -196), P(36, -180), P(28, -168)], width=11 * s, dry=0.2, seed=seed + 18)
    return D, L


# ------------------------------------------------------------------ stills
def still_hook(out):
    img = paper(seed=11)
    h, w = H, W
    # dark table wash all over, lighter toward the sheet
    tbl = 0.66 * (0.82 + 0.3 * fbm(h, w, 2, 3, 13)) * (1 + 0.06 * (fbm(h, w, 30, 2, 12) - 0.5))
    yy, xx = _grid(h, w)
    tbl *= 1 + 0.25 * smoothstep(0.3, 1.0, np.sqrt(((xx - 540) / 700) ** 2 + ((yy - 900) / 1100) ** 2))
    img = apply_ink(img, tbl)
    # the sheet (slightly yellower paper), rotated a few degrees, deckled edge
    cx, cy, sw, sh, ang = 545, 880, 880, 1240, -2.5
    a = math.radians(ang)
    corners = []
    for dx, dy in [(-1, -1), (1, -1), (1, 1), (-1, 1)]:
        px, py = dx * sw / 2, dy * sh / 2
        corners.append((cx + px * math.cos(a) - py * math.sin(a), cy + px * math.sin(a) + py * math.cos(a)))
    sheet = poly_mask(h, w, corners)
    sheet = roughen(sheet, 3, 60, 14)
    shadow = cv2.GaussianBlur(np.roll(np.roll(sheet, 14, 0), 10, 1), (0, 0), 16)
    img = apply_ink(img, shadow * 0.35)
    sp = paper(seed=15, tone=(0.905, 0.865, 0.775))
    sm = smoothstep(0.3, 0.7, sheet)[..., None]
    img = img * (1 - sm) + sp * sm
    # text, dictated by 林冲 (第八回)
    cols = ['东京八十万禁军教头林冲', '为因身犯重罪断配沧州', '去后存亡不保有妻张氏', '年少情愿立此休书任从',
            '改嫁永无争执委是自行', '情愿即非相逼恐后无凭', '立此文约为照', '年月日']
    fs = 64
    T = np.zeros((h, w), np.float32)
    x0, y0 = cx + 330, cy - 560
    for i, col in enumerate(cols):
        T = np.maximum(T, text_mask(h, w, col, 'kai', fs, (x0 - i * 94, y0), True, spacing=1.06))
    # rotate text with the sheet
    M = cv2.getRotationMatrix2D((cx, cy), -ang, 1.0)
    T = cv2.warpAffine(T, M, (w, h))
    D = calligraphy(T, 0.93, seed=16)
    # 花押 (signature flourish) under 年月日
    fx, fy = x0 - 7 * 94, y0 + 4 * 68 + 30
    sig = np.zeros((h, w), np.float32)
    sig = stroke(sig, [(fx - 30, fy), (fx + 20, fy - 14), (fx - 10, fy + 26), (fx + 34, fy + 18), (fx + 6, fy + 52)], width=7, dry=0.3, seed=17)
    D = union(D, cv2.warpAffine(sig, M, (w, h)))
    img = apply_ink(img, D)
    tp = thumbprint(h, w, tuple(cv2.transform(np.array([[[fx + 10, fy + 230]]], np.float32), M)[0, 0]), 88, 116, -14, seed=18)
    img = apply_ink(img, tp, CINNABAR)
    img = subtitle(img, '按下手印的人，叫林冲。')
    save(img, os.path.join(out, 'hook.png'))


def still_title(out):
    img = paper(seed=21)
    h, w = H, W
    # one big wet splash behind the name (泼墨)
    band = poly_mask(h, w, [(-40, 1250), (1120, 640), (1120, 980), (-40, 1560)])
    img = apply_ink(img, wash(roughen(band, 40, 4, 22), 0.16, 10, 0.3, 20, 0.5, seed=23, cells=5) * gradient_y(h, w, 600, 1500, 1.0, 0.5))
    # the spear: one long confident stroke corner to corner
    D = np.zeros((h, w), np.float32)
    D = stroke(D, [(120, 1560), (300, 900), (420, 230)], width=14, dry=0.45, seed=24, taper=(0.05, 0.3))
    img = apply_ink(img, D, strength=0.9)
    # spear tassel: the single red
    tas = np.zeros((h, w), np.float32)
    for k in range(9):
        a0 = math.radians(130 + k * 9)
        tas = stroke(tas, [(412, 290), (412 + math.cos(a0) * 40, 290 + math.sin(a0) * 70), (412 + math.cos(a0) * 54 + 10, 290 + math.sin(a0) * 120)],
                     width=7, dry=0.5, ink=0.9, seed=25 + k, taper=(0.05, 0.6))
    img = apply_ink(img, tas, CINNABAR)
    # 林冲 in running script, huge
    T = text_mask(h, w, '林冲', 'xing', 420, (680, 380), True, spacing=1.0)
    img = apply_ink(img, calligraphy(T, 0.95, seed=26, bleed=1.2, rough=2.0))
    # nickname, small 楷
    T2 = text_mask(h, w, '豹子头', 'kai', 72, (960, 420), True, spacing=1.1)
    img = apply_ink(img, calligraphy(T2, 0.85, seed=27))
    # seals: series and episode number
    img = apply_ink(img, seal_bold(h, w, (960, 760), 120, '水浒人物', seed=28), CINNABAR)
    img = apply_ink(img, seal(h, w, (960, 900), 80, '壹', 'kai', False, seed=29), CINNABAR)
    save(img, os.path.join(out, 'title.png'))


def still_snow(out):
    h, w = H, W
    img = paper(seed=41)
    # night sky: dark, mottled; heavier at the top. The snow stays paper (烘云托月)
    sky = gradient_y(h, w, 0, 1180, 0.82, 0.40) * (0.8 + 0.35 * fbm(h, w, 2, 5, 42))
    img = apply_ink(img, sky)
    img = apply_ink(img, mountain(h, w, 1040, 210, 0.30, 200, seed=43, cells=2, sharp=1.3))
    img = apply_ink(img, mountain(h, w, 1090, 90, 0.30, 90, seed=143, cells=4, sharp=1.1))
    # the fodder depot burning, far left; smoke drifting with the wind
    img = apply_ink(img, smoke(np.zeros((h, w), np.float32), (430, 990), (760, 240), seed=46, width0=70, width1=320, level=0.30))
    img = fire(img, (420, 1080), 1.15, seed=44)
    depot = poly_mask(h, w, [(250, 1100), (290, 1066), (360, 1060), (380, 1046), (470, 1050), (500, 1074), (560, 1100)])
    img = apply_ink(img, wash(depot, 0.72, 1.5, 0.25, 3, 0.3, seed=47))
    # snowfield (paper), with soft drifts
    ground = gradient_y(h, w, 1095, 1175, 0, 1)
    img = apply_light(img, ground * 0.93, (0.935, 0.92, 0.885))
    drift = np.zeros((h, w), np.float32)
    for k, (yy, x0, x1) in enumerate([(1260, 300, 1080), (1420, -40, 640), (1600, 420, 1100), (1760, -40, 500)]):
        drift = stroke(drift, [(x0, yy), ((x0 + x1) / 2, yy - 18), (x1, yy + 6)], width=26, dry=0.85, ink=0.22, seed=148 + k, wet=0.6)
    img = apply_ink(img, cv2.GaussianBlur(drift, (0, 0), 4))
    D = np.zeros((h, w), np.float32)
    Lt = np.zeros((h, w), np.float32)
    # the temple, right of centre
    D, Lt = temple(D, Lt, 700, 1250, 0.95, seed=48)
    # trees: one big gnarled tree left foreground, one small behind the temple
    D, Lt = tree2(D, Lt, (940, 1262), 460, seed=55, trunk_w=16, lean=-0.06, branches=4, twig=0.6)
    D, Lt = tree2(D, Lt, (40, 1900), 1700, seed=54, trunk_w=64, lean=0.05, branches=5, twig=0.7, b0=0.62)
    # rock with snow cap, bottom right
    D, Lt = rock(D, Lt, [(760, 1830), (800, 1760), (890, 1730), (990, 1750), (1060, 1810), (1080, 1880), (760, 1890)], seed=56)
    # footprints toward the door
    for k in range(12):
        px = 600 + k * 9 + (k % 2) * 16
        py = 1800 - k * 40
        D = union(D, cv2.GaussianBlur(ellipse_mask(h, w, (px, py), (8 - k * 0.45, 4.5 - k * 0.25)), (0, 0), 1.2) * 0.4)
    # 林冲, walking to the temple with spear and gourd
    D, Lt = lin_walker(D, Lt, 470, 1830, 1.05, seed=57, facing=1, lean=8)
    img = apply_ink(img, D)
    img = apply_light(img, Lt * 0.92)
    # snow in three depths
    img = apply_light(img, snowflakes(h, w, 1000, 58, 0.8, 2.2, blur=0.6) * 0.75)
    img = apply_light(img, snowflakes(h, w, 280, 59, 2.0, 4.5, blur=1.0) * 0.9)
    img = apply_light(img, snowflakes(h, w, 34, 60, 6, 12, blur=4.0) * 0.6)
    img = subtitle(img, '那一夜大雪，草屋被雪压塌了。')
    save(img, os.path.join(out, 'snow.png'))


def still_regret(out):
    h, w = H, W
    img = paper(seed=61)
    # 梁山泊: far shore in mist, open water, reeds in front
    img = apply_ink(img, mountain(h, w, 760, 120, 0.22, 140, seed=62, cells=2, sharp=1.6))
    img = apply_ink(img, mountain(h, w, 820, 70, 0.32, 90, seed=63, cells=3, sharp=1.3))
    # water: a few long dry horizontal strokes
    D = np.zeros((h, w), np.float32)
    rng = np.random.default_rng(64)
    for k in range(10):
        y = 930 + k * 55 + rng.normal(0, 8)
        x0 = rng.uniform(-50, 500)
        D = stroke(D, [(x0, y), (x0 + rng.uniform(200, 500), y + rng.normal(0, 3))], width=3 + rng.random() * 3, dry=0.75, ink=0.5, seed=65 + k)
    img = apply_ink(img, D)
    # the boat with one figure (the messenger coming back)
    B = np.zeros((h, w), np.float32)
    bx, by = 380, 1010
    hull = poly_mask(h, w, [(bx - 120, by - 6), (bx + 130, by - 14), (bx + 96, by + 14), (bx - 92, by + 16)])
    B = union(B, wash(hull, 0.8, 1.5, 0.2, 2, 0.2, seed=66))
    B = blob(B, (bx + 10, by - 52), 9, 0.85, seed=67)
    B = stroke(B, [(bx + 10, by - 44), (bx + 4, by - 8)], width=16, dry=0.2, seed=68, taper=(0.1, 0.2))
    B = stroke(B, [(bx + 30, by - 70), (bx + 60, by + 30)], width=3, dry=0.1, seed=69, taper=(0, 0))  # pole
    img = apply_ink(img, B)
    img = apply_ink(img, cv2.GaussianBlur(np.flipud(B), (0, 0), 3) * 0.0)
    # reeds: tall bending strokes, bottom right
    R = np.zeros((h, w), np.float32)
    for k in range(34):
        x = 620 + rng.normal(0, 160)
        top = 1100 + rng.random() * 300
        bend = rng.normal(40, 30)
        R = stroke(R, [(x, 1950), (x + bend * 0.3, (1950 + top) / 2), (x + bend, top)], width=5 + rng.random() * 5, dry=0.5, ink=0.85, seed=70 + k, taper=(0.05, 0.9))
        if rng.random() < 0.5:  # reed plume
            R = stroke(R, [(x + bend, top), (x + bend + 30, top - 40), (x + bend + 60, top - 50)], width=9, dry=0.85, ink=0.5, seed=200 + k, taper=(0.1, 0.8))
    img = apply_ink(img, R)
    # 已故半载, large pale calligraphy in the sky
    T = text_mask(h, w, '已故半载', 'xing', 190, (800, 120), True, spacing=1.0)
    img = apply_ink(img, calligraphy(T, 0.85, seed=71, bleed=1.4, rough=2.2))
    img = subtitle(img, '自缢身死，已故半载。')
    save(img, os.path.join(out, 'regret.png'))


def lin_back(D, Lt, x, y, k=1.0, seed=0, wind=1.0):
    """林冲 seen from behind, half length: headscarf corners and ribbons in the
    wind, broad shoulders, spear upright at his left. (x, y) = head centre."""
    h, w = D.shape
    P = lambda px, py: (x + px * k, y + py * k)
    head = ellipse_mask(h, w, P(0, -30), (60 * k, 72 * k))
    neck = poly_mask(h, w, [P(-30, 20), P(30, 20), P(40, 84), P(-40, 84)])
    body = poly_mask(h, w, [P(-44, 70), P(44, 70), P(150, 116), P(232, 168), P(262, 260), P(280, 700), P(292, 1100),
                            P(-292, 1100), P(-276, 700), P(-258, 260), P(-226, 168), P(-150, 116)])
    fade = 1 - smoothstep(y + 380 * k, y + 1000 * k, gradient_y(h, w, 0, h, 0, h))
    D = union(D, wash(np.maximum(head, neck), 0.78, 1.5, 0.3, 2, 0.3, seed, cells=24))
    D = union(D, wash(body, 0.38, 2, 0.35, 3, 0.5, seed + 1, cells=14) * (0.4 + 0.6 * fade) * (0.8 + 0.4 * fbm(h, w, 4, 4, seed + 2)))
    # contours of the robe, heavy at the shoulders, running dry toward the hem
    D = stroke(D, [P(-44, 76), P(-150, 116), P(-226, 168), P(-258, 262), P(-272, 620)], width=24 * k, dry=0.8, seed=seed + 3, taper=(0.05, 0.5), head=0.8)
    D = stroke(D, [P(44, 76), P(150, 116), P(232, 168), P(262, 262), P(280, 600)], width=26 * k, dry=0.75, seed=seed + 4, taper=(0.05, 0.5), head=0.8)
    D = stroke(D, [P(4, 92), P(-6, 300), P(6, 560)], width=8 * k, dry=0.8, ink=0.7, seed=seed + 5)
    D = stroke(D, [P(-150, 200), P(-110, 300), P(-128, 420)], width=7 * k, dry=0.85, ink=0.6, seed=seed + 6)
    D = stroke(D, [P(150, 200), P(116, 310), P(132, 430)], width=7 * k, dry=0.85, ink=0.6, seed=seed + 7)
    D = stroke(D, [P(-262, 560), P(0, 586), P(272, 556)], width=30 * k, dry=0.55, seed=seed + 8, taper=(0.1, 0.1))  # belt
    # headscarf with two stiff corners (抓角), ribbons streaming in the wind
    scarf = poly_mask(h, w, [P(-64, -36), P(-70, -86), P(-96, -128), P(-40, -104), P(0, -110), P(40, -104), P(96, -132), P(72, -84), P(64, -36), P(0, -50)])
    D = union(D, wash(scarf, 0.95, 1.2, 0.2, 1.5, 0.2, seed + 9))
    Lt = stroke(Lt, [P(-62, -40), P(0, -54), P(62, -40)], width=4 * k, dry=0.2, ink=0.9, seed=seed + 10, wet=0)
    for j, (dx, amp) in enumerate([(-14, 1.0), (14, 0.8)]):
        D = stroke(D, [P(dx, -40), P(dx + 50 * wind, 20), P(dx + 120 * wind, 60 + 20 * amp), P(dx + 210 * wind * amp, 50 + 40 * amp)],
                   width=12 * k, dry=0.45, seed=seed + 11 + j, taper=(0.1, 0.85))
    # left arm and fist on the spear
    D = stroke(D, [P(-232, 190), P(-290, 300), P(-318, 400)], width=46 * k, dry=0.7, seed=seed + 13, taper=(0.1, 0.3), head=0.6)
    D = blob(D, P(-330, 418), 26 * k, 0.9, seed + 14)
    return D, Lt


def still_portrait(out):
    """人物形象 over 东京: 林冲 from behind on a height, the city's roofs in mist below.
    We never draw his face; the novel's words do (豹头环眼，燕颔虎须, 第七回)."""
    h, w = H, W
    img = paper(seed=31)
    # 东京: tiers of roofs in mist
    R = np.zeros((h, w), np.float32)
    rng = np.random.default_rng(32)
    for row, (yy, lvl, sc) in enumerate([(980, 0.18, 0.55), (1110, 0.28, 0.75), (1260, 0.40, 1.0)]):
        x = -80 + rng.random() * 60
        while x < w + 80:
            rw = (150 + rng.random() * 120) * sc
            ry = yy + rng.normal(0, 10)
            eave = [(x + t * rw, ry - 22 * sc * abs(2 * t - 1) ** 4) for t in np.linspace(0, 1, 15)]
            top = [(x + rw * 0.78, ry - 50 * sc), (x + rw * 0.22, ry - 50 * sc)]
            m = poly_mask(h, w, eave + top)
            R = union(R, wash(m, lvl, 1.5, 0.3, 2, 0.3, seed=40 + row * 50 + int(x) % 50) )
            R = stroke(R, eave, width=5 * sc, dry=0.3, ink=lvl + 0.35, seed=60 + row * 50 + int(x) % 50, taper=(0.2, 0.2), wet=0.1)
            wall = poly_mask(h, w, [(x + rw * 0.15, ry), (x + rw * 0.85, ry), (x + rw * 0.85, ry + 60 * sc), (x + rw * 0.15, ry + 60 * sc)])
            R = union(R, wash(wall, lvl * 0.5, 1.5, 0.2, 2, 0.3, seed=80 + row * 50 + int(x) % 50) * (1 - smoothstep(ry, ry + 60 * sc, gradient_y(h, w, 0, h, 0, h))))
            x += rw + rng.uniform(10, 60) * sc
    mist = 1 - 0.85 * smoothstep(0, 1, np.abs(gradient_y(h, w, 0, h, 0, h) - 1180) < 0) # placeholder
    img = apply_ink(img, R)
    for yy in (1030, 1170, 1330):  # mist bands between the tiers
        band = np.exp(-((gradient_y(h, w, 0, h, 0, h) - yy) / 34) ** 2) * (0.6 + 0.4 * fbm(h, w, 3, 3, yy))
        img = apply_light(img, band * 0.7, (0.93, 0.90, 0.84))
    # a far pagoda for 东京 (大相国寺 is next to the 岳庙 in the story)
    G = np.zeros((h, w), np.float32)
    px, py = 250, 930
    for t in range(7):
        ww = 70 - t * 7
        yy = py - t * 46
        G = stroke(G, [(px - ww, yy), (px, yy - 8), (px + ww, yy)], width=6, dry=0.3, ink=0.45, seed=90 + t, taper=(0.2, 0.2), wet=0.1)
        G = union(G, wash(poly_mask(h, w, [(px - ww * 0.6, yy), (px + ww * 0.6, yy), (px + ww * 0.6, yy + 40), (px - ww * 0.6, yy + 40)]), 0.18, 1, 0.1, 1, 0.2, seed=100 + t))
    G = stroke(G, [(px, py - 330), (px, py - 390)], width=4, dry=0.2, ink=0.4, seed=110)
    img = apply_ink(img, G)
    # the man, from behind, on the height (lower right)
    D = np.zeros((h, w), np.float32)
    Lt = np.zeros((h, w), np.float32)
    D, Lt = lin_back(D, Lt, 700, 1240, 1.05, seed=33, wind=1.0)
    S = stroke(np.zeros((h, w), np.float32), [(354, 240), (352, 1100), (350, 1950)], width=10, dry=0.12, seed=45, taper=(0.02, 0.02), fade=0.0)
    S = stroke(S, [(354, 240), (355, 160)], width=22, dry=0.0, seed=46, taper=(0.05, 0.95), fade=0.0)
    S = stroke(S, [(340, 250), (368, 250)], width=8, dry=0.1, seed=47, taper=(0, 0))
    img = apply_ink(img, union(S, D))
    img = apply_light(img, Lt * 0.85)
    T = np.zeros((h, w), np.float32)
    for j in range(11):
        a0 = math.radians(80 + (j - 5) * 6)
        T = stroke(T, [(354, 262), (354 + math.cos(a0) * 26 + 10, 262 + math.sin(a0) * 60), (354 + math.cos(a0) * 34 + 30, 262 + math.sin(a0) * 110)],
                   width=6, dry=0.5, ink=0.9, seed=50 + j, taper=(0.05, 0.6))
    img = apply_ink(img, T, CINNABAR)
    # inscription (题款), top right, and a seal
    I = text_mask(h, w, '八十万禁军枪棒教头', 'xing', 84, (968, 150), True, spacing=1.0)
    img = apply_ink(img, calligraphy(I, 0.9, seed=51, bleed=1.0, rough=1.6))
    I2 = text_mask(h, w, '豹头环眼\n燕颔虎须', 'kai', 50, (850, 170), True, spacing=1.08, colgap=1.5)
    img = apply_ink(img, calligraphy(I2, 0.8, seed=52))
    img = apply_ink(img, seal(h, w, (968, 1000), 86, '豹子头', 'kai', True, seed=53), CINNABAR)
    img = subtitle(img, '八十万禁军枪棒教头——林冲。')
    save(img, os.path.join(out, 'portrait.png'))


if __name__ == '__main__':
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    names = sys.argv[2:] or ['hook', 'title', 'portrait', 'snow', 'regret']
    for n in names:
        globals()['still_' + n](out)
        print('done', n)
