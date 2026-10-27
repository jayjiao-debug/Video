"""Comic beat-grid layouts: a coded foot stomps the beat (咚 on the strong beat, 哒 on the weak ones).
Layouts:  A 四格小节   one panel per beat; the lit panel is the impact frame
          B 舞台+格条   one big foot on a stage, small beat cells underneath
          C 冲击帧      2-frame anime impact frame on the downbeat
          D 拍号对比    4/4 强弱次强弱 vs 3/4 强弱弱
Drawn at 2x and downsampled once, so lines and type are smooth."""
import math, numpy as np
from PIL import Image, ImageDraw, ImageFont
W, H, S = 1920, 1080, 2
BPM = 120; BEAT = 60 / BPM; FPS = 30
BG = (248, 245, 238); INK = (17, 17, 17); YEL = (255, 210, 63); RED = (232, 72, 59); GREY = (184, 184, 184)
PALE = (255, 233, 160); ORANGE = (240, 150, 40); WHITE = (255, 255, 255)
CJK = '/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc'
SYM = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def font(sz, f=CJK): return ImageFont.truetype(f, int(sz * S), index=2) if f == CJK else ImageFont.truetype(f, int(sz * S))
def smooth(x): x = min(1., max(0., x)); return x * x * (3 - 2 * x)

# ---------------------------------------------------------------- the foot
def chaikin(pts, n=4):
    for _ in range(n):
        out = []
        for i in range(len(pts)):
            p, q = np.array(pts[i]), np.array(pts[(i + 1) % len(pts)]); out += [tuple(.75 * p + .25 * q), tuple(.25 * p + .75 * q)]
        pts = out
    return pts
# shoe outline in local units: heel bottom at (0,0), toe to the right, up is negative y
SHOE = chaikin([(-4, -14), (4, 0), (150, 0), (198, -4), (210, -40), (192, -74), (140, -92), (104, -114), (74, -126), (22, -126), (0, -104)])
LEG = [(26, -110), (80, -110), (76, -270), (30, -270)]
CREASES = [((118, -86), (132, -66)), ((136, -90), (150, -70))]
def foot_pose(u, strong):
    """lift (px), tilt (deg, toe up), squash, hit flag; u = seconds from the beat (None = resting)"""
    if u is None: return 22, -6, 0., False
    pre, up = (.2, 62) if strong else (.14, 34)
    if -pre <= u < 0:
        w = smooth(1 + u / pre); return 22 + (up - 22) * w, -6 - 10 * w, 0., False
    if 0 <= u < .45:
        s = math.exp(-u / .07); back = smooth((u - .12) / .3)          # land hard, then ease back to the resting hover
        return 22 * back, -6 * back, (.14 if strong else .06) * s, True
    return 22, -6, 0., False
def draw_foot(img, cx, gy, sc, u, strong, shoe_col=None, ink=INK, leg_col=WHITE, rim=None):
    lift, tilt, q, hit = foot_pose(u, strong)
    col = shoe_col or (RED if (strong and hit) else WHITE)
    a = math.radians(tilt); c, s_ = math.cos(a), math.sin(a)
    def T(p):
        x, y = p; x = 105 + (x - 105) * (1 + q * .5); y = y * (1 - q)          # squash about the sole
        x, y = x * c - y * s_, x * s_ + y * c                                 # tilt about the heel
        return ((cx + (x - 105) * sc) * S, (gy - lift + y * sc) * S)
    d = ImageDraw.Draw(img); lw = int(6 * sc * S)
    for poly, fill in ((LEG, leg_col), (SHOE, col)):
        P = [T(p) for p in poly]
        if rim: d.line(P + [P[0]], fill=rim, width=lw * 3, joint='curve')
        d.polygon(P, fill=fill); d.line(P + [P[0]], fill=ink, width=lw, joint='curve')
    for p, q_ in CREASES: d.line([T(p), T(q_)], fill=ink, width=int(4 * sc * S))
    d.line([T((14, 0)), T((178, 0))], fill=ink, width=int(9 * sc * S))       # thick sole
    return hit

# ---------------------------------------------------------------- drawing kit
def canvas(col=BG): return Image.new('RGBA', (W * S, H * S), col + (255,))
def R(*xy): return [v * S for v in xy]
_dots = None
def halftone(img, box, col=(214, 214, 214), step=13, r=1.7):
    global _dots
    if _dots is None:
        _dots = Image.new('RGBA', (W * S, H * S), (0, 0, 0, 0)); d = ImageDraw.Draw(_dots)
        for y in range(0, H * S, step * S):
            for x in range((y // (step * S)) % 2 * step * S // 2, W * S, step * S): d.ellipse([x - r * S, y - r * S, x + r * S, y + r * S], fill=col + (255,))
    x0, y0, x1, y1 = [int(v * S) for v in box]; img.alpha_composite(_dots.crop((x0, y0, x1, y1)), (x0, y0))
def text(img, s, sz, cx, cy, fill, stroke=0, sfill=INK, rot=0, scale=1., f=CJK, alpha=1.):
    if scale <= .01 or alpha <= .01: return
    ft = font(sz * scale, f); sw = int(stroke * scale * S)
    l, t, r, b = ft.getbbox(s, stroke_width=sw); lay = Image.new('RGBA', (r - l + 8, b - t + 8), (0, 0, 0, 0))
    ImageDraw.Draw(lay).text((4 - l, 4 - t), s, font=ft, fill=fill, stroke_width=sw, stroke_fill=sfill)
    if rot: lay = lay.rotate(rot, resample=Image.BICUBIC, expand=True)
    if alpha < 1: a = np.asarray(lay).copy(); a[..., 3] = (a[..., 3] * alpha).astype(np.uint8); lay = Image.fromarray(a)
    img.alpha_composite(lay, (int(cx * S - lay.width / 2), int(cy * S - lay.height / 2)))
FOOT_ANG = (194, 214, 238, 302, 326, 346)
def burst(img, cx, cy, r0, r1, angs=FOOT_ANG, width=7, col=INK, prog=1.):
    """impact strokes fanning out from the contact point (drawn behind the foot)"""
    d = ImageDraw.Draw(img)
    for i, ang in enumerate(angs):
        a = math.radians(ang); k = 1 + .12 * (i % 2); rr0 = r0 * k; rr1 = (r0 + (r1 - r0) * prog) * k
        d.line([cx * S + math.cos(a) * rr0 * S, cy * S + math.sin(a) * rr0 * S, cx * S + math.cos(a) * rr1 * S, cy * S + math.sin(a) * rr1 * S], fill=col, width=int(width * S))
def header(img, label, tempo=True):
    l, t_, r, b = font(48).getbbox(label); w = (r - l) / S + 84
    d = ImageDraw.Draw(img); d.rectangle(R(130, 132, 130 + w, 222), fill=INK); text(img, label, 48, 130 + w / 2, 176, WHITE)
    if tempo: text(img, '♩', 66, 1612, 172, INK, f=SYM); text(img, '= ' + str(BPM), 52, 1710, 177, INK)
def finish(img): return img.convert('RGB').resize((W, H), Image.LANCZOS)
def beat_state(t, t0, lead=0.2):
    n = math.floor((t - t0 + lead) / BEAT); return n, t - (t0 + n * BEAT)

# ---------------------------------------------------------------- A: 四格小节
def panel_geo(widths, x0=130, x1=1790, gap=24):
    tot = sum(widths) + gap * (len(widths) - 1); x = x0 + (x1 - x0 - tot) / 2; out = []
    for w in widths: out.append((x, x + w)); x += w + gap
    return out
PY0, PY1 = 268, 820; GROUND = PY1 - 70
def layout_A(t=0, t0=0.0, labels=('咚', '哒', '哒', '哒'), still=None):
    img = canvas(); header(img, '一小节 = 四格'); nb = len(labels)
    n, u = still if still is not None else beat_state(t, t0)
    act = n % nb if n >= 0 else -1
    grow = [0.] * nb
    if act >= 0: grow[act] = smooth((u + .2) / .12) if u < 0 else 1.
    if act >= 0 and u < 0 and n >= 1: grow[(act - 1) % nb] = 1 - grow[act]
    geo = panel_geo([369 + 111 * g for g in grow])
    for i, ((x0, x1), g) in enumerate(zip(geo, grow)):
        strong = labels[i] == '咚'; on = i == act; hit = on and u >= 0; cx = (x0 + x1) / 2
        d = ImageDraw.Draw(img); d.rectangle(R(x0, PY0, x1, PY1), fill=YEL if (hit and strong) else WHITE)
        if not (hit and strong): halftone(img, (x0 + 6, PY0 + 6, x1 - 6, PY1 - 6))
        d = ImageDraw.Draw(img); d.line(R(x0 + 20, GROUND, x1 - 20, GROUND), fill=INK, width=5 * S)
        sc = .95 + .22 * g
        if hit and u < .3: burst(img, cx, GROUND - 4, 140 * sc, (205 if strong else 185) * sc, angs=FOOT_ANG if strong else (198, 222, 318, 342), width=8 if strong else 5, prog=smooth(u / .1))
        draw_foot(img, cx, GROUND, sc, u if on else None, strong)
        d = ImageDraw.Draw(img); d.rectangle(R(x0, PY0, x1, PY1), outline=INK, width=(9 if on else 5) * S)
        pop = 1 + .35 * math.exp(-u / .06) if hit else 1.
        if strong and hit: text(img, labels[i] + '!', 112, x0 + 132, PY0 + 90, RED, stroke=7, rot=12, scale=pop)
        elif strong: text(img, labels[i], 84, x0 + 80, PY0 + 76, WHITE, stroke=6, rot=8)
        else: text(img, labels[i], 80 if hit else 70, x0 + 70, PY0 + 70, WHITE, stroke=6, rot=6, scale=pop)
        text(img, str(i + 1), 96 if on else 74, cx, PY1 + 78, ((RED if strong else INK) if on else GREY))
        text(img, '强' if strong else '弱', 32, cx, PY1 + 160, INK if on else GREY)
    return img

# ---------------------------------------------------------------- B: 舞台 + 节拍格条
def starburst(img, cx, cy, r0, r1, n=14, fill=YEL, rot=0):
    pts = []
    for i in range(2 * n):
        r = r1 if i % 2 == 0 else r0; a = math.pi * i / n + math.radians(rot); j = 1 + .08 * math.sin(i * 2.3)
        pts.append((cx * S + math.cos(a) * r * j * S, cy * S + math.sin(a) * r * j * .82 * S))
    d = ImageDraw.Draw(img); d.polygon(pts, fill=INK)
    d.polygon([((x - cx * S) * .93 + cx * S, (y - cy * S) * .9 + cy * S) for x, y in pts], fill=fill)
def layout_B(t=0, t0=0.0, still=None):
    img = canvas(); n, u = still if still is not None else beat_state(t, t0)
    act = n % 4 if n >= 0 else -1; hit = u >= 0
    header(img, '4/4 拍 · 第 %d 拍' % (max(act, 0) + 1))
    gy, cx, sc = 820, 720, 1.85
    d = ImageDraw.Draw(img); d.line(R(150, gy, 1770, gy), fill=INK, width=6 * S)
    strong = act == 0
    if act >= 0 and hit and u < .3: burst(img, cx, gy - 6, 140 * sc, (260 if strong else 200) * sc, angs=FOOT_ANG if strong else (198, 222, 318, 342), width=12 if strong else 8, prog=smooth(u / .1))
    draw_foot(img, cx, gy, sc, u if act >= 0 else None, strong)
    if act >= 0 and hit:
        pop = 1 + .3 * math.exp(-u / .06)
        if strong: starburst(img, 1340, 420, 150 * pop, 230 * pop, rot=8); text(img, '咚!', 150, 1340, 415, RED, stroke=8, rot=10, scale=pop)
        else: text(img, '哒', 130, 1260, 470, WHITE, stroke=8, rot=6, scale=pop)
    cw, ch, gap = 170, 112, 18; x = 960 - (4 * cw + 3 * gap) / 2; y0 = 890
    for i in range(4):
        on = i == act; st = i == 0
        d = ImageDraw.Draw(img); d.rectangle(R(x, y0, x + cw, y0 + ch), fill=YEL if (on and hit and st) else WHITE)
        if not (on and hit and st): halftone(img, (x + 4, y0 + 4, x + cw - 4, y0 + ch - 4))
        d = ImageDraw.Draw(img); d.rectangle(R(x, y0, x + cw, y0 + ch), outline=INK, width=(7 if on else 4) * S)
        text(img, str(i + 1), 56, x + 48, y0 + ch / 2 - 2, (RED if st else INK) if on else GREY)
        text(img, '咚' if st else '哒', 40, x + 118, y0 + ch / 2 - 2, WHITE, stroke=4)
        x += cw + gap
    return img

# ---------------------------------------------------------------- C: 冲击帧
def speedlines(img, cx, cy, n=90, rmin=430, seed=3, col=WHITE):
    rng = np.random.default_rng(seed); d = ImageDraw.Draw(img); L = 2400
    for _ in range(n):
        a = rng.uniform(0, 2 * math.pi); w = rng.uniform(.004, .016); r0 = rmin * rng.uniform(.9, 1.6)
        d.polygon([(cx * S + math.cos(a - w) * L * S, cy * S + math.sin(a - w) * L * S), (cx * S + math.cos(a + w) * L * S, cy * S + math.sin(a + w) * L * S),
                   (cx * S + math.cos(a) * r0 * S, cy * S + math.sin(a) * r0 * S)], fill=col)
def layout_C(t=0, frame=0):
    """the downbeat's first 2 frames: black, speed lines, white leg, red shoe flat on the ground"""
    img = canvas((14, 14, 16)); cx, gy, sc = 1000, 900, 2.3 + .08 * frame
    speedlines(img, cx, gy - 120, rmin=520, seed=3 + frame)
    d = ImageDraw.Draw(img); d.line(R(0, gy, W, gy), fill=WHITE, width=8 * S)
    burst(img, cx, gy - 8, 140 * sc, 280 * sc, width=16, col=WHITE)
    draw_foot(img, cx, gy, sc, 0.0, True, rim=WHITE)
    text(img, '咚!', 330, 470, 330, RED, stroke=14, sfill=WHITE, rot=12, scale=1 + .06 * frame)
    return img

# ---------------------------------------------------------------- D: 拍号对比
def layout_D(t=None, t0=0.0, still=(0, 2 / FPS)):
    img = canvas(); header(img, '强弱规律 · 每格一拍', tempo=False)
    rows = [('4/4', ['强', '弱', '次强', '弱'], ['咚', '哒', '咚', '哒'], 262), ('3/4', ['强', '弱', '弱'], ['咚', '哒', '哒'], 652)]
    cw, ch, gap, x0 = 290, 300, 22, 420
    for name, acc, snd, y in rows:
        d = ImageDraw.Draw(img); d.rectangle(R(130, y + 70, 360, y + 230), fill=INK); text(img, name, 88, 245, y + 148, WHITE, f=SYM)
        nb = len(acc); n, u = still if t is None else beat_state(t, t0); act = n % nb if n >= 0 else -1
        for i in range(nb):
            x = x0 + i * (cw + gap); on = i == act; hit = on and u >= 0; kind = acc[i]
            lit = {'强': YEL, '次强': PALE}.get(kind)          # accents are always coloured: it's a chart
            d = ImageDraw.Draw(img); d.rectangle(R(x, y, x + cw, y + ch), fill=lit or WHITE)
            if not lit: halftone(img, (x + 5, y + 5, x + cw - 5, y + ch - 5))
            d = ImageDraw.Draw(img); g = y + ch - 40; d.line(R(x + 18, g, x + cw - 18, g), fill=INK, width=4 * S)
            sc = .66; strong = kind != '弱'
            if hit and u < .3: burst(img, x + cw / 2, g - 3, 140 * sc, 200 * sc, width=6, prog=smooth(u / .1))
            shoe = (RED if kind == '强' else ORANGE) if (hit and strong) else None
            draw_foot(img, x + cw / 2, g, sc, u if on else None, strong, shoe_col=shoe)
            d = ImageDraw.Draw(img); d.rectangle(R(x, y, x + cw, y + ch), outline=INK, width=(9 if on else 5) * S)
            fill = {'强': RED, '次强': ORANGE}.get(kind, WHITE)
            text(img, snd[i] + ('!' if kind == '强' else ''), {'强': 66, '次强': 56}.get(kind, 50), x + 58, y + 50, fill, stroke=5, rot=10)
            text(img, kind, 38, x + cw / 2, y + ch + 38, {'强': RED, '次强': ORANGE}.get(kind, GREY))
    text(img, '格子一样宽 = 每拍一样长', 32, 1590, 770, (110, 110, 110)); text(img, '3/4 一小节少一格', 32, 1590, 822, (110, 110, 110))
    return img
