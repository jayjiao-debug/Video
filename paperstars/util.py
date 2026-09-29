"""Math, easing, glow sprites, and the supersampled vector canvas."""

import math
import os
from functools import lru_cache

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

from .config import H, SS, W


# ----------------------------------------------------------------- easing

def clamp(x, lo=0.0, hi=1.0):
    return lo if x < lo else hi if x > hi else x


def smoothstep(e0, e1, x):
    t = clamp((x - e0) / (e1 - e0)) if e1 != e0 else float(x >= e1)
    return t * t * (3 - 2 * t)


def ease_in_out(t):
    t = clamp(t)
    return 0.5 - 0.5 * math.cos(math.pi * t)


def lerp(a, b, t):
    return a + (b - a) * t


def lerp3(a, b, t):
    return tuple(lerp(x, y, t) for x, y in zip(a, b))


def keyframes(t, keys):
    """Interpolate a list of (time, value) pairs with eased segments.

    Values may be floats or tuples/dicts of floats.
    """
    if t <= keys[0][0]:
        return keys[0][1]
    for (t0, v0), (t1, v1) in zip(keys, keys[1:]):
        if t < t1:
            u = ease_in_out((t - t0) / (t1 - t0))
            if isinstance(v0, dict):
                return {k: lerp(v0[k], v1[k], u) for k in v0}
            if isinstance(v0, tuple):
                return lerp3(v0, v1, u)
            return lerp(v0, v1, u)
    return keys[-1][1]


def hash_noise(x, seed=0):
    """Smooth 1-D value noise in [-1, 1]."""
    i = math.floor(x)
    f = x - i

    def h(n):
        n = (n * 374761393 + seed * 668265263) & 0xFFFFFFFF
        n = ((n ^ (n >> 13)) * 1274126177) & 0xFFFFFFFF
        return (n & 0xFFFF) / 32767.5 - 1.0

    u = f * f * (3 - 2 * f)
    return lerp(h(i), h(i + 1), u)


# ------------------------------------------------------------- raster ops

def value_noise_2d(rng, h, w, cell):
    """Smooth random field in [0, 1] with feature size ~cell pixels."""
    gh, gw = max(2, h // cell + 2), max(2, w // cell + 2)
    grid = rng.random((gh, gw)).astype(np.float32)
    big = cv2.resize(grid, (gw * cell, gh * cell), interpolation=cv2.INTER_CUBIC)
    return np.clip(big[:h, :w], 0, 1)


def fbm(rng, h, w, base_cell, octaves=5):
    out = np.zeros((h, w), np.float32)
    amp, total, cell = 1.0, 0.0, base_cell
    for _ in range(octaves):
        out += amp * value_noise_2d(rng, h, w, max(2, int(cell)))
        total += amp
        amp *= 0.55
        cell /= 2
    return out / total


def blur(img, sigma):
    return cv2.GaussianBlur(img, (0, 0), sigmaX=sigma, sigmaY=sigma)


def vertical_gradient(h, w, stops):
    """stops: list of (y_fraction, (r,g,b)). Returns h x w x 3 float32."""
    ys = np.linspace(0, 1, h, dtype=np.float32)
    col = np.zeros((h, 3), np.float32)
    pos = np.array([s[0] for s in stops], np.float32)
    for c in range(3):
        col[:, c] = np.interp(ys, pos, [s[1][c] for s in stops])
    return np.repeat(col[:, None, :], w, axis=1)


def crop_subpixel(arr, x, y, w=W, h=H):
    """Crop arr[y:y+h, x:x+w] with bilinear sub-pixel offset (arr is 2D or 3D)."""
    ix, iy = int(math.floor(x)), int(math.floor(y))
    fx, fy = x - ix, y - iy
    ah, aw = arr.shape[:2]
    ix = max(0, min(ix, aw - w - 1))
    iy = max(0, min(iy, ah - h - 1))
    c = arr[iy:iy + h + 1, ix:ix + w + 1]
    top = c[:-1, :-1] * (1 - fx) + c[:-1, 1:] * fx
    bot = c[1:, :-1] * (1 - fx) + c[1:, 1:] * fx
    return (top * (1 - fy) + bot * fy).astype(np.float32)


@lru_cache(maxsize=256)
def glow_sprite(radius):
    """Soft radial glow with a brighter core, peak 1.0. radius in px."""
    r = max(1, int(radius))
    size = r * 2 + 1
    yy, xx = np.mgrid[-r:r + 1, -r:r + 1].astype(np.float32)
    d2 = (xx * xx + yy * yy) / float(r * r)
    halo = np.exp(-d2 * 4.0)
    core = np.exp(-d2 * 40.0)
    s = (0.55 * halo + 0.45 * core).reshape(size, size, 1)
    return s.astype(np.float32)


def add_glow(frame, x, y, radius, color, intensity=1.0):
    """Additively splat a glow sprite centred at (x, y)."""
    if intensity <= 0.001:
        return
    spr = glow_sprite(int(round(radius)))
    r = spr.shape[0] // 2
    cx, cy = int(round(x)), int(round(y))
    x0, y0, x1, y1 = cx - r, cy - r, cx + r + 1, cy + r + 1
    fh, fw = frame.shape[:2]
    sx0, sy0 = max(0, -x0), max(0, -y0)
    sx1 = spr.shape[1] - max(0, x1 - fw)
    sy1 = spr.shape[0] - max(0, y1 - fh)
    if sx1 <= sx0 or sy1 <= sy0:
        return
    col = np.asarray(color, np.float32) * intensity
    frame[max(0, y0):min(fh, y1), max(0, x0):min(fw, x1)] += spr[sy0:sy1, sx0:sx1] * col


def star_polygon(cx, cy, r_out, r_in, rot=0.0, points=5, puff=0.0, n_sub=4):
    """Five-pointed star outline. `puff` rounds the edges outward (paper-star look)."""
    verts = []
    total = points * 2
    for i in range(total):
        a = rot + math.pi * i / points - math.pi / 2
        rr = r_out if i % 2 == 0 else r_in
        verts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    if puff <= 0:
        return verts
    out = []
    for i in range(total):
        (x0, y0), (x1, y1) = verts[i], verts[(i + 1) % total]
        for k in range(n_sub):
            u = k / n_sub
            px, py = lerp(x0, x1, u), lerp(y0, y1, u)
            # push midpoints outward from centre
            bulge = puff * math.sin(math.pi * u) * (r_out - r_in) * 0.5
            dx, dy = px - cx, py - cy
            d = math.hypot(dx, dy) or 1.0
            out.append((px + dx / d * bulge, py + dy / d * bulge))
    return out


def resample_polygon(pts, n):
    """Resample a closed polygon to n points evenly spaced along its perimeter."""
    pts = np.asarray(pts, np.float64)
    closed = np.vstack([pts, pts[:1]])
    seg = np.hypot(*(np.diff(closed, axis=0).T))
    cum = np.concatenate([[0], np.cumsum(seg)])
    targets = np.linspace(0, cum[-1], n, endpoint=False)
    xs = np.interp(targets, cum, closed[:, 0])
    ys = np.interp(targets, cum, closed[:, 1])
    return np.stack([xs, ys], axis=1)


def align_polygon(ref, pts):
    """Rotate the start index of pts to best match ref (same length)."""
    best, best_d = pts, float("inf")
    for k in range(len(pts)):
        cand = np.roll(pts, k, axis=0)
        d = float(np.sum((cand - ref) ** 2))
        if d < best_d:
            best, best_d = cand, d
    return best


# ----------------------------------------------------------------- canvas

class Canvas:
    """RGBA vector layer drawn at SS x resolution, composited onto a float frame.

    Opaque shapes are drawn straight into the layer; translucent ones are
    drawn into a scratch tile and alpha-composited, because PIL's ImageDraw
    replaces RGBA pixels rather than blending them.
    """

    def __init__(self):
        self.img = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.img)
        self.dirty = False
        self.ox, self.oy = 0.0, 0.0  # translation applied to everything drawn

    def _p(self, x, y):
        return ((x + self.ox) * SS, (y + self.oy) * SS)

    @staticmethod
    def _c(color, alpha=1.0):
        r, g, b = (int(clamp(c) * 255 + 0.5) for c in color)
        return (r, g, b, int(clamp(alpha) * 255 + 0.5))

    def _draw(self, pts, pad, alpha, fn):
        """fn(draw, pts) renders using already-mapped points."""
        if alpha <= 0.002:
            return
        self.dirty = True
        if alpha >= 0.998:
            fn(self.d, pts)
            return
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        x0 = max(0, int(min(xs) - pad - 2))
        y0 = max(0, int(min(ys) - pad - 2))
        x1 = min(W * SS, int(max(xs) + pad + 3))
        y1 = min(H * SS, int(max(ys) + pad + 3))
        if x1 <= x0 or y1 <= y0:
            return
        region = self.img.crop((x0, y0, x1, y1))
        tile = Image.new("RGBA", region.size, (0, 0, 0, 0))
        fn(ImageDraw.Draw(tile), [(x - x0, y - y0) for x, y in pts])
        self.img.paste(Image.alpha_composite(region, tile), (x0, y0))

    def poly(self, pts, color, alpha=1.0):
        c = self._c(color, alpha)
        self._draw([self._p(x, y) for x, y in pts], 0, alpha,
                   lambda d, q: d.polygon(q, fill=c))

    def rect(self, x0, y0, x1, y1, color, alpha=1.0):
        c = self._c(color, alpha)
        self._draw([self._p(x0, y0), self._p(x1, y1)], 0, alpha,
                   lambda d, q: d.rectangle([*q[0], *q[1]], fill=c))

    def ellipse(self, cx, cy, rx, ry, color, alpha=1.0):
        c = self._c(color, alpha)
        self._draw([self._p(cx - rx, cy - ry), self._p(cx + rx, cy + ry)], 0, alpha,
                   lambda d, q: d.ellipse([*q[0], *q[1]], fill=c))

    def circle(self, cx, cy, r, color, alpha=1.0):
        self.ellipse(cx, cy, r, r, color, alpha)

    def limb(self, p0, p1, width, color, alpha=1.0):
        """Thick line with round caps."""
        c = self._c(color, alpha)
        wpx = max(1, int(width * SS))
        rr = width * SS / 2

        def fn(d, q):
            d.line([*q[0], *q[1]], fill=c, width=wpx)
            for (x, y) in q:
                d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=c)

        self._draw([self._p(*p0), self._p(*p1)], rr + 1, alpha, fn)

    def line(self, pts, width, color, alpha=1.0):
        c = self._c(color, alpha)
        wpx = max(1, int(width * SS))
        self._draw([self._p(x, y) for x, y in pts], wpx, alpha,
                   lambda d, q: d.line(q, fill=c, width=wpx, joint="curve"))

    def text(self, cx, cy, s, size, color, alpha=1.0, font="serif", tracking=0.0):
        if alpha <= 0.002:
            return
        f = load_font(font, int(size * SS))
        widths = [self.d.textlength(ch, font=f) for ch in s]
        track = tracking * size * SS
        total = sum(widths) + track * (len(s) - 1)
        asc, desc = f.getmetrics()
        x = (cx + self.ox) * SS - total / 2
        y = (cy + self.oy) * SS - (asc + desc) / 2
        c = self._c(color, alpha)

        def fn(d, q):
            xx, yy = q[0]
            for ch, wch in zip(s, widths):
                d.text((xx, yy), ch, font=f, fill=c)
                xx += wch + track

        self._draw([(x, y), (x + total, y + asc + desc)], size * SS * 0.3, alpha, fn)

    def composite(self, frame):
        if not self.dirty:
            return frame
        # PIL premultiplies alpha when resampling RGBA, so edge colours stay
        # true and a plain "over" is correct.
        small = self.img.resize((W, H), Image.Resampling.BOX)
        a = np.asarray(small, np.float32) / 255.0
        alpha = a[..., 3:4]
        return frame * (1 - alpha) + a[..., :3] * alpha


FONT_CANDIDATES = {
    "serif": [
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
        "/Library/Fonts/Georgia.ttf",
        "C:/Windows/Fonts/georgia.ttf",
    ],
    "serif-italic": [
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSerifItalic.ttf",
        "/Library/Fonts/Georgia Italic.ttf",
        "C:/Windows/Fonts/georgiai.ttf",
    ],
}


@lru_cache(maxsize=64)
def load_font(kind, size):
    for path in FONT_CANDIDATES.get(kind, []):
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default(size=size)
