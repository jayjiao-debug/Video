"""Procedural ink-wash (水墨) drawing kit for the 水浒人物志 series.

Everything is drawn in code: rice paper, ink washes with wet edges, bristle brush
strokes with dry-brush streaks (飞白), calligraphy from OFL brush fonts, a red
cinnabar accent (seals, the thumbprint, fire) and snow.

Layers are ink DENSITY maps (float32, 0 = no ink, 1 = full ink). They are
composited onto the paper multiplicatively, like real ink soaking into paper.
"""
import math
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
INK = np.array([0.075, 0.075, 0.09], np.float32)      # blue-black ink (RGB)
CINNABAR = np.array([0.78, 0.17, 0.11], np.float32)  # 朱砂
OCHRE = np.array([0.86, 0.52, 0.22], np.float32)     # 赭石 for fire light
FONTS = {
    'kai': '/dev/shm/gfonts/ofl/mashanzheng/MaShanZheng-Regular.ttf',
    'xing': '/dev/shm/gfonts/ofl/zhimangxing/ZhiMangXing-Regular.ttf',
    'cao': '/dev/shm/gfonts/ofl/longcang/LongCang-Regular.ttf',
    'song': '/dev/shm/gfonts/ofl/zcoolxiaowei/ZCOOLXiaoWei-Regular.ttf',
}


# ---------------------------------------------------------------- noise
def fbm(h, w, cells=4, octaves=5, seed=0, gain=0.5):
    """Smooth value noise in [0,1]; `cells` = grid cells across the short side."""
    rng = np.random.default_rng(abs(int(seed)))
    out = np.zeros((h, w), np.float32)
    amp, tot = 1.0, 0.0
    short = min(h, w)
    for o in range(octaves):
        c = cells * (2 ** o)
        gh = max(2, int(round(c * h / short)) + 1)
        gw = max(2, int(round(c * w / short)) + 1)
        g = rng.random((gh, gw)).astype(np.float32)
        out += amp * cv2.resize(g, (w, h), interpolation=cv2.INTER_CUBIC)
        tot += amp
        amp *= gain
    out /= tot
    lo, hi = np.percentile(out, 1), np.percentile(out, 99)
    return np.clip((out - lo) / (hi - lo + 1e-6), 0, 1)


def noise1d(n, cells=8, seed=0, octaves=4):
    """Smooth 1-D noise in [0,1] with `cells` features along n samples."""
    if n < 2:
        return np.zeros(n, np.float32)
    rng = np.random.default_rng(seed)
    x = np.linspace(0, 1, n)
    out = np.zeros(n)
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        c = max(2, int(cells * 2 ** o))
        g = rng.random(c + 3)
        xs = np.linspace(0, 1, c + 3)
        out += amp * np.interp(x, xs, g)
        tot += amp
        amp *= 0.5
    out /= tot
    lo, hi = out.min(), out.max()
    return ((out - lo) / (hi - lo + 1e-9)).astype(np.float32)


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a + 1e-9), 0, 1)
    return t * t * (3 - 2 * t)


# ---------------------------------------------------------------- paper
def paper(h=H, w=W, seed=1, tone=(0.925, 0.895, 0.835)):
    base = np.array(tone, np.float32)
    m = fbm(h, w, 2, 5, seed)
    f = fbm(h, w, 40, 2, seed + 1)
    img = np.ones((h, w, 3), np.float32) * base
    img *= (1 + 0.045 * (m - 0.5) + 0.025 * (f - 0.5))[..., None]
    # fibres: short curved hairs, a touch lighter or darker than the sheet
    rng = np.random.default_rng(seed + 2)
    fib = np.zeros((h, w), np.uint8)
    fibd = np.zeros((h, w), np.uint8)
    for _ in range(int(h * w / 900)):
        x, y = rng.random() * w, rng.random() * h
        a = rng.random() * math.pi
        L = 6 + rng.random() * 26
        pts = []
        for k in range(6):
            t = k / 5
            a2 = a + 0.6 * math.sin(t * 3 + x)
            pts.append((x + math.cos(a2) * L * t, y + math.sin(a2) * L * t))
        tgt = fib if rng.random() < 0.6 else fibd
        cv2.polylines(tgt, [np.int32(np.array(pts) * 4)], False, int(40 + rng.random() * 60), 1, cv2.LINE_AA, 2)
    img += (fib.astype(np.float32) / 255 * 0.05)[..., None]
    img -= (fibd.astype(np.float32) / 255 * 0.035)[..., None]
    # soft vignette
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((xx - w / 2) / (w * 0.75)) ** 2 + ((yy - h / 2) / (h * 0.75)) ** 2)
    img *= (1 - 0.10 * smoothstep(0.55, 1.05, r))[..., None]
    return np.clip(img, 0, 1)


# ---------------------------------------------------------------- compositing
def apply_ink(img, D, color=INK, strength=1.0):
    """Multiply-blend an ink density layer onto the image (in place returns new)."""
    D = np.clip(D * strength, 0, 1)[..., None]
    return img * (1 - D * (1 - np.asarray(color, np.float32)))


def apply_light(img, A, color=(0.97, 0.955, 0.92)):
    """Lighten toward `color` with alpha A (snow, highlights, paper left white)."""
    A = np.clip(A, 0, 1)[..., None]
    return img * (1 - A) + np.array(color, np.float32) * A


def to_u8(img):
    return (np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8)


def save(img, path):
    cv2.imwrite(path, cv2.cvtColor(to_u8(img), cv2.COLOR_RGB2BGR))


def union(*Ds):
    out = np.zeros_like(Ds[0])
    for d in Ds:
        out = 1 - (1 - out) * (1 - np.clip(d, 0, 1))
    return out


# ---------------------------------------------------------------- washes
_grid_cache = {}


def _grid(h, w):
    k = (h, w)
    if k not in _grid_cache:
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        _grid_cache[k] = (xx, yy)
    return _grid_cache[k]


def roughen(mask, amount=6, cells=12, seed=0):
    h, w = mask.shape
    if amount <= 0:
        return mask
    xx, yy = _grid(h, w)
    dx = (fbm(h, w, cells, 4, seed) - 0.5) * 2 * amount
    dy = (fbm(h, w, cells, 4, seed + 7) - 0.5) * 2 * amount
    return cv2.remap(mask.astype(np.float32), xx + dx, yy + dy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


def wash(mask, level=0.5, bleed=5, edge=0.25, rough=6, gran=0.3, seed=0, cells=10):
    """Turn a hard mask into a wet ink wash: feathered, ragged, darker rim, grainy."""
    h, w = mask.shape
    m = roughen(mask.astype(np.float32), rough, cells, seed)
    m1 = cv2.GaussianBlur(m, (0, 0), max(0.5, bleed))
    m2 = cv2.GaussianBlur(m, (0, 0), max(1.0, bleed * 4 + 6))
    rim = np.clip(m1 - m2, 0, 1) * smoothstep(0.3, 0.6, m1)
    g = fbm(h, w, 60, 3, seed + 3)
    flow = fbm(h, w, 3, 4, seed + 4)
    core = smoothstep(0.35, 0.65, m1)
    D = level * core * (1 + gran * (g - 0.5)) * (0.8 + 0.4 * flow) + edge * rim * 2.5
    return np.clip(D, 0, 1)


def gradient_y(h, w, y0, y1, v0, v1):
    y = np.arange(h, dtype=np.float32)[:, None]
    t = np.clip((y - y0) / (y1 - y0 + 1e-6), 0, 1)
    return np.broadcast_to(v0 + (v1 - v0) * t, (h, w)).astype(np.float32)


def poly_mask(h, w, pts, blur=0):
    m = np.zeros((h, w), np.uint8)
    cv2.fillPoly(m, [np.int32(np.round(np.array(pts) * 8))], 255, cv2.LINE_AA, 3)
    m = m.astype(np.float32) / 255
    if blur:
        m = cv2.GaussianBlur(m, (0, 0), blur)
    return m


def ellipse_mask(h, w, c, axes, ang=0):
    m = np.zeros((h, w), np.uint8)
    cv2.ellipse(m, (int(c[0] * 8), int(c[1] * 8)), (int(axes[0] * 8), int(axes[1] * 8)), ang, 0, 360, 255, -1, cv2.LINE_AA, 3)
    return m.astype(np.float32) / 255


# ---------------------------------------------------------------- brush strokes
def spline(ctrl, n=None):
    """Catmull-Rom through control points, resampled to ~1 px spacing."""
    P = np.array(ctrl, np.float64)
    if len(P) == 2:
        L = np.linalg.norm(P[1] - P[0])
        t = np.linspace(0, 1, max(2, int(L)))[:, None]
        return P[0] * (1 - t) + P[1] * t
    P = np.vstack([2 * P[0] - P[1], P, 2 * P[-1] - P[-2]])
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        L = np.linalg.norm(p2 - p1)
        m = max(2, int(L * 1.2))
        for t in np.linspace(0, 1, m, endpoint=False):
            t2, t3 = t * t, t * t * t
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    out.append(P[-2])
    out = np.array(out)
    # resample by arc length
    d = np.r_[0, np.cumsum(np.linalg.norm(np.diff(out, axis=0), axis=1))]
    if d[-1] < 1:
        return out
    s = np.linspace(0, d[-1], max(2, int(d[-1] / (n or 1.0))))
    return np.c_[np.interp(s, d, out[:, 0]), np.interp(s, d, out[:, 1])]


def press(n, start=0.25, end=0.35, minw=0.25, belly=1.0):
    """Width profile: brush lands (thin→full), travels, lifts (full→thin)."""
    t = np.linspace(0, 1, n)
    a = smoothstep(0, start, t) if start > 0 else np.ones(n)
    b = 1 - smoothstep(1 - end, 1, t) if end > 0 else np.ones(n)
    return minw + (1 - minw) * a * b * (1 + (belly - 1) * np.sin(np.pi * t))


def stroke(D, ctrl, width=12, ink=0.95, dry=0.35, bristles=None, prof=None, seed=0,
           wet=0.25, jitter=0.12, taper=(0.25, 0.35), fade=None, head=0.0):
    """Bristle brush stroke along control points; returns D with the stroke added.

    dry: how fast the brush runs out (0 = wet all along, 1 = streaky by the end).
    wet: halo bleed amount. ink: density of a full bristle.
    """
    h, w = D.shape
    P = spline(ctrl)
    n = len(P)
    if n < 2:
        return D
    rng = np.random.default_rng(seed)
    nb = bristles or int(np.clip(width / 1.6, 6, 40))
    tang = np.gradient(P, axis=0)
    tang /= (np.linalg.norm(tang, axis=1)[:, None] + 1e-9)
    nor = np.c_[-tang[:, 1], tang[:, 0]]
    wp = (prof if prof is not None else press(n, taper[0], taper[1])) * width
    s = np.linspace(0, 1, n)
    load = 1 - dry * s ** 1.3
    if fade is None:
        fade = 0.45 * dry  # ink thins toward the end of the stroke (墨分五色)
    S = 4  # subpixel scale for cv2 drawing
    pad = int(width * 1.5 + 12)
    bx0 = int(max(0, P[:, 0].min() - pad)); bx1 = int(min(w, P[:, 0].max() + pad + 1))
    by0 = int(max(0, P[:, 1].min() - pad)); by1 = int(min(h, P[:, 1].max() + pad + 1))
    if bx1 <= bx0 or by1 <= by0:
        return D
    P = P - np.array([bx0, by0])
    layer = np.zeros((by1 - by0, bx1 - bx0), np.uint8)
    offs = np.sort(rng.uniform(-0.5, 0.5, nb))
    for j in range(nb):
        o = offs[j] + rng.normal(0, 0.03)
        thr = rng.uniform(0.15, 0.85) * dry
        nz = noise1d(n, cells=max(3, n // 40), seed=seed * 131 + j)
        alive = (load * (0.65 + 0.7 * nz)) > (thr + 0.25 * dry)
        alive |= dry < 0.02
        r = np.maximum(0.6, wp / nb * (1.1 + 0.6 * rng.random()))
        jit = (noise1d(n, cells=max(3, n // 25), seed=seed * 71 + j) - 0.5) * jitter * wp
        cx = P[:, 0] + nor[:, 0] * (o * wp + jit)
        cy = P[:, 1] + nor[:, 1] * (o * wp + jit)
        val = int(255 * ink * (0.55 + 0.45 * rng.random() ** 0.5))
        # draw alive runs as thick polylines with per-run mean radius (fast)
        idx = np.flatnonzero(alive)
        if len(idx) == 0:
            continue
        breaks = np.flatnonzero(np.diff(idx) > 1)
        runs = np.split(idx, breaks + 1)
        for run in runs:
            if len(run) < 5 and dry > 0.02:
                continue
            # split long runs so the radius can follow the press profile
            step = 6
            for k0 in range(0, len(run) - 1, step):
                seg = run[k0:k0 + step + 1]
                if len(seg) < 2:
                    continue
                th = max(1, int(round(2 * r[seg].mean())))
                pts = np.int32(np.round(np.c_[cx[seg], cy[seg]] * S))
                v = int(val * (1 - fade * s[seg].mean()))
                cv2.polylines(layer, [pts], False, v, th, cv2.LINE_AA, 2)
    if head > 0:  # blunt, ink-heavy start (藏锋起笔)
        hr = max(1, int(wp[min(len(wp) - 1, int(n * 0.06))] * 0.55 * head * S))
        cv2.circle(layer, (int(P[0, 0] * S + tang[0, 0] * hr * 0.6), int(P[0, 1] * S + tang[0, 1] * hr * 0.6)), hr, int(255 * ink), -1, cv2.LINE_AA, 2)
    d = layer.astype(np.float32) / 255
    d = roughen(d, 0.8, 30, seed + 5)
    d = cv2.GaussianBlur(d, (0, 0), 0.6)
    if wet > 0:
        d = np.clip(d + wet * cv2.GaussianBlur(d, (0, 0), 2.5 + width * 0.08), 0, 1)
    out = D.copy()
    sub = out[by0:by1, bx0:bx1]
    out[by0:by1, bx0:bx1] = 1 - (1 - sub) * (1 - d)
    return out


def blob(D, c, r, level=0.8, seed=0, rough=None, bleed=None):
    """A soft dab of ink (a dot, an eye, a knot)."""
    h, w = D.shape
    m = ellipse_mask(h, w, c, (r, r * 0.9), 0)
    return union(D, wash(m, level, bleed or max(1, r * 0.2), 0.15, rough or max(1, r * 0.25), 0.2, seed, cells=30))


# ---------------------------------------------------------------- calligraphy
def text_mask(h, w, text, font='kai', size=80, xy=(0, 0), vertical=True, spacing=1.05, colgap=1.35, anchor='rt'):
    """Render text (vertical columns right-to-left if vertical) to a float mask."""
    img = Image.new('L', (w, h), 0)
    dr = ImageDraw.Draw(img)
    f = ImageFont.truetype(FONTS.get(font, font), size)
    x0, y0 = xy
    if vertical:
        cols = text.split('\n')
        for ci, col in enumerate(cols):
            x = x0 - ci * size * colgap
            y = y0
            for ch in col:
                if ch == ' ':
                    y += size * spacing
                    continue
                bb = dr.textbbox((0, 0), ch, font=f)
                cw = bb[2] - bb[0]
                dr.text((x - cw / 2 - bb[0], y - bb[1] * 0.0), ch, fill=255, font=f)
                y += size * spacing
    else:
        dr.text((x0, y0), text, fill=255, font=f)
    return np.asarray(img, np.float32) / 255


def calligraphy(mask, level=0.92, seed=0, bleed=0.9, rough=1.2):
    """Ink-ify a text mask: ragged edge, slight bleed, uneven ink."""
    h, w = mask.shape
    m = roughen(mask, rough, 40, seed)
    g = fbm(h, w, 24, 3, seed + 9)
    d = cv2.GaussianBlur(m, (0, 0), bleed) * level * (0.82 + 0.3 * g)
    halo = cv2.GaussianBlur(m, (0, 0), 3.5) * 0.12
    return np.clip(d + halo, 0, 1)


# ---------------------------------------------------------------- seal (印章)
def seal(h, w, center, size, chars, font='song', inverse=True, seed=0):
    """Square cinnabar seal. inverse=True: white characters on red (白文)."""
    cx, cy = center
    m = np.zeros((h, w), np.float32)
    half = size / 2
    box = poly_mask(h, w, [(cx - half, cy - half), (cx + half, cy - half), (cx + half, cy + half), (cx - half, cy + half)])
    n = len(chars)
    grid = 2 if n >= 3 else 1
    cell = size * (0.86 / grid)
    t = np.zeros((h, w), np.float32)
    if n == 1:
        t = text_mask(h, w, chars, font, int(size * 0.78), (cx, cy - size * 0.43), True)
    else:
        # traditional reading order: right column top→bottom, then left column
        cols = [chars[:math.ceil(n / 2)], chars[math.ceil(n / 2):]]
        for ci, col in enumerate(cols):
            x = cx + size * 0.215 - ci * size * 0.43
            fs = int(cell * (0.95 if len(col) <= 2 else 0.62))
            y = cy - size * 0.44
            t = np.maximum(t, text_mask(h, w, col, font, fs, (x, y), True, spacing=0.98 * (2 / max(2, len(col)))))
    t = cv2.dilate(t, np.ones((max(1, int(size * 0.025)),) * 2, np.uint8))
    t = roughen(t, 1.0, 40, seed + 1)
    wear = smoothstep(0.62, 0.9, fbm(h, w, 90, 2, seed + 2))
    if inverse:
        d = box * (1 - np.clip(t * 1.3, 0, 1))
    else:
        border = box - poly_mask(h, w, [(cx - half + size * 0.07, cy - half + size * 0.07), (cx + half - size * 0.07, cy - half + size * 0.07),
                                       (cx + half - size * 0.07, cy + half - size * 0.07), (cx - half + size * 0.07, cy + half - size * 0.07)])
        d = np.clip(border + t, 0, 1)
    d = roughen(d, 1.2, 30, seed + 3)
    d = d * (0.88 + 0.12 * fbm(h, w, 12, 2, seed + 4)) * (1 - 0.7 * wear * (d > 0))
    return np.clip(d, 0, 1)


# ---------------------------------------------------------------- thumbprint (手模)
def thumbprint(h, w, center, rx=95, ry=125, ang=-12, seed=0, pressure=0.9, freq=17):
    """Cinnabar thumbprint: whorl core above, ridges flattening to arches below,
    ragged rim, uneven pressure, broken ridges."""
    xx, yy = _grid(h, w)
    cx, cy = center
    a = math.radians(ang)
    X = (xx - cx) * math.cos(a) + (yy - cy) * math.sin(a)
    Y = -(xx - cx) * math.sin(a) + (yy - cy) * math.cos(a)
    nx, ny = X / rx, Y / ry
    r = np.sqrt(nx ** 2 + (ny * 1.02) ** 2)
    warp = (fbm(h, w, 5, 3, seed) - 0.5) * 0.10
    rc = np.sqrt((nx * 1.15) ** 2 + ((ny + 0.12) * 0.95) ** 2)
    lower = (ny + 0.12) * 1.0 + 0.32 * nx ** 2 + 0.05
    wgt = smoothstep(-0.05, 0.55, ny)
    f = (1 - wgt) * rc + wgt * np.maximum(lower, rc * 0.92) + warp
    ridges = 0.5 + 0.5 * np.cos(f * freq * 2 * np.pi)
    ridges = smoothstep(0.42, 0.78, ridges)
    rim_noise = (fbm(h, w, 18, 3, seed + 1) - 0.5) * 0.14
    edge = 1 - smoothstep(0.80, 0.98, r + rim_noise)
    press_map = pressure * (0.45 + 0.75 * fbm(h, w, 4, 3, seed + 2))
    press_map *= 1 - 0.45 * smoothstep(0.3, 1.0, r)
    breaks = smoothstep(0.3, 0.55, fbm(h, w, 55, 2, seed + 3))
    d = ridges * edge * press_map * (0.45 + 0.55 * breaks)
    d = cv2.GaussianBlur(d.astype(np.float32), (0, 0), 0.8)
    return np.clip(d * 1.35, 0, 1)


# ---------------------------------------------------------------- landscape bits
def ridge_mask(h, w, base_y, amp, cells=3, seed=0, sharp=1.0):
    """Mask below a mountain ridge line."""
    xs = noise1d(w, cells=cells, seed=seed, octaves=5)
    xs2 = noise1d(w, cells=cells * 4, seed=seed + 1, octaves=3)
    y = base_y - amp * (xs ** sharp) - amp * 0.15 * xs2
    yy = np.arange(h, dtype=np.float32)[:, None]
    return (yy > y[None, :]).astype(np.float32), y


def mountain(h, w, base_y, amp, level=0.35, mist=260, seed=0, cells=3, sharp=1.4):
    m, ridge = ridge_mask(h, w, base_y, amp, cells, seed, sharp)
    D = wash(m, level, 3, 0.3, 4, 0.35, seed)
    yy = np.arange(h, dtype=np.float32)[:, None]
    fade = 1 - smoothstep(0, mist, yy - ridge[None, :])  # mist swallows the foot
    tex = fbm(h, w, 14, 4, seed + 5)
    return D * fade * (0.75 + 0.5 * tex)


def snowflakes(h, w, n, seed=0, rmin=1.0, rmax=4.0, t=0.0, speed=60, drift=20, blur=0.8):
    """Snow as light dots (paper white). Positions advance with time t (seconds)."""
    rng = np.random.default_rng(seed)
    x0 = rng.random(n) * w
    y0 = rng.random(n) * h
    r = rmin + (rmax - rmin) * rng.random(n) ** 2.2
    ph = rng.random(n) * 6.28
    sp = speed * (0.6 + 0.8 * r / rmax)
    y = (y0 + sp * t) % (h + 20) - 10
    x = (x0 + drift * t + 8 * np.sin(t * 1.3 + ph)) % w
    A = np.zeros((h, w), np.uint8)
    for i in range(n):
        cv2.circle(A, (int(x[i] * 4), int(y[i] * 4)), int(r[i] * 4), int(150 + 105 * min(1, r[i] / rmax + 0.3)), -1, cv2.LINE_AA, 2)
    a = A.astype(np.float32) / 255
    if blur:
        a = cv2.GaussianBlur(a, (0, 0), blur)
    return a


def bare_tree(D, root, height, ang=-90, seed=0, width=14, depth=6, spread=28, dry=0.4):
    """Winter tree drawn as recursive tapering brush strokes."""
    rng = np.random.default_rng(seed)

    def branch(p, a, L, wdt, d):
        if d == 0 or L < 6:
            return
        bend = rng.normal(0, 10)
        mid = (p[0] + math.cos(math.radians(a + bend / 2)) * L * 0.5, p[1] + math.sin(math.radians(a + bend / 2)) * L * 0.5)
        end = (p[0] + math.cos(math.radians(a + bend)) * L, p[1] + math.sin(math.radians(a + bend)) * L)
        nonlocal D
        D = stroke(D, [p, mid, end], width=wdt, ink=0.9, dry=dry, seed=int(rng.integers(1e6)), taper=(0.02, 0.7), wet=0.12)
        k = 2 if rng.random() < 0.75 else 3
        for i in range(k):
            na = a + bend + rng.uniform(-spread, spread) + (i - (k - 1) / 2) * spread * 0.8
            branch(end, na, L * rng.uniform(0.58, 0.78), max(1.2, wdt * 0.62), d - 1)

    branch(root, ang, height * 0.32, width, depth)
    return D


# ---------------------------------------------------------------- set pieces (v2)
def _rot(pts, ang, origin):
    a = math.radians(ang)
    ox, oy = origin
    return [(ox + (x - ox) * math.cos(a) - (y - oy) * math.sin(a), oy + (x - ox) * math.sin(a) + (y - oy) * math.cos(a)) for x, y in pts]


def tree2(D, L, root, height, seed=0, trunk_w=34, lean=0.0, snow=True, twig=1.0, branches=7, b0=0.35):
    """Gnarled winter tree: trunk contours + wash + bark dabs, angular crab-claw
    branches. Returns (D, L) where L collects snow lying on the branches."""
    h, w = D.shape
    rng = np.random.default_rng(seed)
    n = 6
    ctrl = []
    for k in range(n):
        t = k / (n - 1)
        x = root[0] + lean * height * t + rng.normal(0, trunk_w * 0.55) * (0 < k < n - 1)
        ctrl.append((x, root[1] - height * 0.55 * t))
    P = spline(ctrl)
    m = len(P)
    tang = np.gradient(P, axis=0); tang /= np.linalg.norm(tang, axis=1)[:, None] + 1e-9
    nor = np.c_[-tang[:, 1], tang[:, 0]]
    wd = trunk_w * (1 - 0.6 * np.linspace(0, 1, m)) * (1 + 0.25 * smoothstep(0.9, 1.0, 1 - np.linspace(0, 1, m)))
    left = P + nor * wd[:, None] / 2
    right = P - nor * wd[:, None] / 2
    body = poly_mask(h, w, np.vstack([left, right[::-1]]))
    D = union(D, wash(body, 0.32, 1.5, 0.25, 2, 0.5, seed + 1, cells=30) * (0.7 + 0.5 * fbm(h, w, 30, 2, seed + 2)))
    D = stroke(D, left[::max(1, m // 8)], width=trunk_w * 0.22, dry=0.55, seed=seed + 3, taper=(0.02, 0.4), head=0.6)
    D = stroke(D, right[::max(1, m // 8)], width=trunk_w * 0.28, dry=0.45, seed=seed + 4, taper=(0.02, 0.4), head=0.6)
    for k in range(int(height / 60)):  # bark dabs
        i = int(rng.uniform(0.05, 0.8) * m)
        c = P[i] + nor[i] * rng.uniform(-0.3, 0.3) * wd[i]
        D = stroke(D, [c - tang[i] * 4 - nor[i] * wd[i] * 0.18, c + nor[i] * wd[i] * 0.18], width=wd[i] * 0.12 + 1.5, dry=0.6, ink=0.7, seed=seed + 10 + k, taper=(0.2, 0.6))

    def branch(p, ang, length, wdt, depth):
        nonlocal D, L
        pts = [p]
        a = ang
        seg = 3 + int(rng.random() * 2)
        for s in range(seg):
            a += rng.normal(0, 16) + (8 if depth <= 1 else 0) * np.sign(math.cos(math.radians(a)))  # twigs droop
            q = pts[-1]
            pts.append((q[0] + math.cos(math.radians(a)) * length / seg, q[1] + math.sin(math.radians(a)) * length / seg))
        D = stroke(D, pts, width=wdt, dry=0.35 + 0.1 * (3 - depth), seed=int(rng.integers(1e6)), taper=(0.0, 0.85), head=0.4, wet=0.15)
        if snow and wdt > 2.5:
            sp = [(x, y - wdt * 0.5) for x, y in pts[:-1]]
            L = stroke(L, sp, width=wdt * 0.42, dry=0.8, ink=0.85, seed=int(rng.integers(1e6)), taper=(0.3, 0.6), wet=0.0)
        if depth > 0:
            nk = 2 + int(rng.random() * 2 * twig)
            for k in range(nk):
                i = 1 + int(rng.random() * (len(pts) - 1))
                i = min(i, len(pts) - 1)
                side = 1 if k % 2 == 0 else -1
                branch(pts[i], a + side * rng.uniform(25, 55), length * rng.uniform(0.45, 0.7), max(1.2, wdt * 0.55), depth - 1)

    for k in range(branches):
        i = int(m * (b0 + (0.95 - b0) * k / max(1, branches - 1)))
        i = min(i, m - 1)
        side = 1 if k % 2 == 0 else -1
        base_a = math.degrees(math.atan2(tang[i, 1], tang[i, 0]))
        branch(tuple(P[i]), base_a + side * rng.uniform(30, 70), height * rng.uniform(0.25, 0.42) * (1 - 0.3 * k / branches), wd[i] * 0.45, 2)
    branch(tuple(P[-1]), math.degrees(math.atan2(tang[-1, 1], tang[-1, 0])), height * 0.3, wd[-1] * 0.8, 2)
    return D, L


def rock(D, L, pts, seed=0, level=0.38, snow=True):
    """A rock: dry contour, hemp-fibre texture strokes (披麻皴), dark base, snow cap."""
    h, w = D.shape
    rng = np.random.default_rng(seed)
    pts = [(x, y) for x, y in pts]
    m = poly_mask(h, w, pts)
    ys = [p[1] for p in pts]
    y0, y1 = min(ys), max(ys)
    D = union(D, wash(m, level, 1.5, 0.35, 4, 0.6, seed, cells=25) * gradient_y(h, w, y0, y1, 0.55, 1.15))
    loop = pts + [pts[0]]
    D = stroke(D, loop, width=9, dry=0.55, seed=seed + 1, taper=(0.05, 0.3), head=0.8)
    xs = [p[0] for p in pts]
    for k in range(int((max(xs) - min(xs)) / 22)):
        x = rng.uniform(min(xs) + 15, max(xs) - 15)
        ya = y0 + (y1 - y0) * rng.uniform(0.1, 0.4)
        D = stroke(D, [(x, ya), (x + rng.normal(6, 6), ya + (y1 - y0) * 0.3), (x + rng.normal(10, 8), ya + (y1 - y0) * rng.uniform(0.45, 0.6))],
                   width=3 + rng.random() * 3, dry=0.75, ink=0.65, seed=seed + 5 + k, taper=(0.1, 0.7))
    if snow:
        cap = m * (1 - smoothstep(y0 + (y1 - y0) * 0.18, y0 + (y1 - y0) * 0.42, gradient_y(h, w, 0, h, 0, h) + (fbm(h, w, 8, 3, seed + 9) - 0.5) * 40))
        L = union(L, cv2.GaussianBlur(cap, (0, 0), 2) * 0.95)
    return D, L


def fire(img, c, size=1.0, seed=0, t=0.0):
    """Distant fire: warm glow (light), cinnabar wash core, a few thin tongues."""
    h, w = img.shape[:2]
    x, y = c
    rng = np.random.default_rng(seed)
    glow = cv2.GaussianBlur(ellipse_mask(h, w, (x, y - 60 * size), (240 * size, 170 * size)), (0, 0), 80 * size)
    img = apply_light(img, glow * 0.6, (0.98, 0.70, 0.40))
    core = np.zeros((h, w), np.float32)
    for k in range(7):
        cx = x + rng.normal(0, 55 * size)
        cy = y - rng.uniform(10, 70) * size
        core = union(core, ellipse_mask(h, w, (cx, cy), (rng.uniform(30, 60) * size, rng.uniform(40, 90) * size), rng.normal(0, 10)))
    img = apply_ink(img, wash(core, 0.30, 14 * size, 0.1, 18 * size, 0.4, seed + 1, cells=8), OCHRE)
    tongues = np.zeros((h, w), np.float32)
    for k in range(22):
        bx = x + rng.normal(0, 70 * size)
        hh = (70 + rng.random() * 170) * size * math.exp(-((bx - x) / (130 * size)) ** 2)
        sway = math.sin(t * 6 + k) * 10 * size
        tongues = stroke(tongues, [(bx, y), (bx + rng.normal(0, 8) + sway * 0.5, y - hh * 0.55), (bx + rng.normal(0, 14) + sway, y - hh)],
                         width=(8 + rng.random() * 14) * size, dry=0.45, ink=0.85, seed=seed + 10 + k, taper=(0.1, 0.9), wet=0.6)
    img = apply_ink(img, tongues, CINNABAR, 0.9)
    hot = cv2.GaussianBlur(core, (0, 0), 20 * size)
    img = apply_light(img, hot * 0.25, (1.0, 0.85, 0.55))
    return img


def smoke(D, base, top, seed=0, width0=50, width1=260, level=0.32, n=14):
    h, w = D.shape
    rng = np.random.default_rng(seed)
    acc = np.zeros((h, w), np.float32)
    for k in range(n):
        t = k / (n - 1)
        x = base[0] + (top[0] - base[0]) * t ** 1.4 + rng.normal(0, 20 + 40 * t)
        y = base[1] + (top[1] - base[1]) * t
        r = width0 + (width1 - width0) * t
        e = ellipse_mask(h, w, (x, y), (r, r * 0.7), rng.normal(0, 20))
        acc = np.maximum(acc, e * (1 - 0.65 * t))
    return union(D, wash(acc, level, 30, 0.12, 40, 0.5, seed + 1, cells=4))


def temple(D, L, x, y, s=1.0, seed=0):
    """Small mountain temple (山神庙): platform, pillars, door, 歇山 roof with
    upturned eaves. Snow lies on the roof and the platform (returned in L)."""
    h, w = D.shape
    P = lambda px, py: (x + px * s, y + py * s)
    hw = 150
    # platform
    plat = poly_mask(h, w, [P(-175, -14), P(175, -14), P(185, 6), P(-185, 6)])
    D = union(D, wash(plat, 0.55, 1.5, 0.3, 2, 0.4, seed))
    # wall + pillars + door
    wall = poly_mask(h, w, [P(-hw, -150), P(hw, -150), P(hw, -14), P(-hw, -14)])
    D = union(D, wash(wall, 0.30, 1.5, 0.25, 2, 0.5, seed + 1) * gradient_y(h, w, y - 150 * s, y, 1.25, 0.8))
    door = poly_mask(h, w, [P(-38, -120), P(38, -120), P(38, -14), P(-38, -14)])
    D = union(D, wash(door, 0.92, 1.2, 0.2, 1.5, 0.15, seed + 2))
    for k, px in enumerate((-hw + 10, -48, 48, hw - 10)):
        D = stroke(D, [P(px, -150), P(px, -12)], width=9 * s, dry=0.35, seed=seed + 60 + k, taper=(0.05, 0.1), head=0.5)
    for k, px in enumerate((-105, 105)):  # lattice windows
        win = poly_mask(h, w, [P(px - 30, -112), P(px + 30, -112), P(px + 30, -58), P(px - 30, -58)])
        D = union(D, wash(win, 0.55, 1, 0.2, 1, 0.2, seed + 8 + k))
        for j in range(5):
            D = stroke(D, [P(px - 30 + j * 15, -112), P(px - 30 + j * 15, -58)], width=1.6 * s, dry=0.0, ink=0.35, seed=seed + 20 + j + 10 * k, taper=(0, 0), wet=0)
    # plaque
    pl = poly_mask(h, w, [P(-34, -146), P(34, -146), P(34, -128), P(-34, -128)])
    D = union(D, wash(pl, 0.75, 1, 0.1, 0.5, 0.1, seed + 30))
    # roof: eave curve with upturned corners, roof slope up to the ridge
    xs = np.linspace(-1, 1, 41)
    eave = [P(xx * 235, -158 - 34 * abs(xx) ** 4) for xx in xs]
    ridge = [P(xx * 120, -262 - 14 * abs(xx) ** 3) for xx in np.linspace(-1, 1, 21)]
    roof = poly_mask(h, w, eave + ridge[::-1])
    D = union(D, wash(roof, 0.22, 2, 0.3, 2, 0.4, seed + 31))
    under = poly_mask(h, w, eave + [P(150, -150), P(-150, -150)][::-1][::-1])
    D = union(D, wash(under, 0.85, 1.5, 0.2, 1.5, 0.2, seed + 32))
    D = stroke(D, eave, width=12 * s, dry=0.25, seed=seed + 33, taper=(0.15, 0.15), head=0.5)
    D = stroke(D, ridge, width=11 * s, dry=0.25, seed=seed + 34, taper=(0.1, 0.1))
    D = stroke(D, [P(-120, -262), P(-236, -195)], width=5 * s, dry=0.4, ink=0.8, seed=seed + 35)
    D = stroke(D, [P(120, -262), P(236, -195)], width=5 * s, dry=0.4, ink=0.8, seed=seed + 36)
    for k, xx in enumerate((-1, 1)):  # ridge-end ornaments
        D = stroke(D, [P(xx * 112, -262), P(xx * 126, -282), P(xx * 116, -292)], width=8 * s, dry=0.2, seed=seed + 40 + k, taper=(0.1, 0.6))
    # snow on the roof slope and the ridge, on the platform
    rs = poly_mask(h, w, [P(xx * 228, -166 - 30 * abs(xx) ** 4) for xx in xs] + [P(xx * 118, -258) for xx in np.linspace(-1, 1, 21)][::-1])
    rs *= smoothstep(0.25, 0.75, fbm(h, w, 14, 3, seed + 50)) * 0.5 + 0.55
    L = union(L, cv2.GaussianBlur(rs, (0, 0), 2.5) * 0.92)
    L = union(L, cv2.GaussianBlur(poly_mask(h, w, [P(-176, -12), P(176, -12), P(180, -4), P(-180, -4)]), (0, 0), 2) * 0.8)
    return D, L
