"""Sky: light-polluted haze, starfield, Milky Way, and the passing airplane."""

import math

import numpy as np

from . import config as C
from .util import add_glow, blur, crop_subpixel, fbm, hash_noise, vertical_gradient

SKY_H = C.H + 800
SKY_W = C.W + 200


class Sky:
    def __init__(self, seed=C.SEED + 1):
        rng = np.random.default_rng(seed)
        h, w = SKY_H, SKY_W
        top_of_view = SKY_H - C.H  # sky row at screen top when untilted
        horizon = (top_of_view + C.H * 0.82) / SKY_H

        self.polluted = vertical_gradient(h, w, [
            (0.0, (0.020, 0.018, 0.030)),
            (top_of_view / SKY_H, (0.060, 0.048, 0.062)),
            (horizon - 0.2, (0.20, 0.13, 0.10)),
            (horizon, (0.40, 0.25, 0.15)),
            (1.0, (0.44, 0.28, 0.16)),
        ])
        # soft clouds of haze catch the city light
        haze = fbm(rng, h, w, 220, 4)
        self.polluted *= (0.82 + 0.36 * haze)[..., None]

        self.dark = vertical_gradient(h, w, [
            (0.0, (0.002, 0.004, 0.012)),
            (top_of_view / SKY_H, (0.005, 0.009, 0.024)),
            (horizon - 0.14, (0.016, 0.028, 0.062)),
            (horizon, (0.045, 0.065, 0.110)),
            (1.0, (0.045, 0.065, 0.110)),
        ])

        # Milky Way: a band from lower left to upper right
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        x_n = xx / w
        center = top_of_view + C.H * (0.95 - 0.95 * x_n) - 180 * np.sin(x_n * math.pi) + 60
        dist = (yy - center) / 190.0
        band = np.exp(-dist ** 2)
        core = np.exp(-(dist * 1.8) ** 2)
        clouds = fbm(rng, h, w, 90, 6)
        detail = fbm(rng, h, w, 14, 3)
        dust = np.exp(-((yy - center - 18 * np.sin(x_n * 9)) / 30.0) ** 2) * \
            np.clip(fbm(rng, h, w, 40, 4) * 1.6 - 0.3, 0, 1)
        mw = (0.35 * band + 0.65 * core) * (0.35 + 0.65 * clouds ** 1.5) * (0.75 + 0.5 * detail)
        mw = np.clip(mw - 0.5 * dust * band, 0, None) * 0.3
        warm = np.clip(1 - np.abs(x_n - 0.35) * 2.2, 0, 1)[..., None]
        tint = (np.array((0.55, 0.62, 0.95), np.float32) * (1 - warm)
                + np.array((0.95, 0.82, 0.70), np.float32) * warm)
        self.milky = (blur(mw, 1.5)[..., None] * tint).astype(np.float32)
        self.band = band

        # faint stars, far denser inside the band
        self.stars = np.zeros((h, w, 3), np.float32)
        n = 60000
        sx = rng.uniform(0, w - 1, n)
        sy = rng.uniform(0, h - 1, n)
        dens = band[sy.astype(int), sx.astype(int)]
        keep = rng.random(n) < (0.08 + 0.92 * dens ** 1.5)
        sx, sy = sx[keep].astype(int), sy[keep].astype(int)
        mag = rng.power(8, len(sx)) ** 6  # most faint, few bright
        temps = rng.random(len(sx))
        cols = np.stack([0.8 + 0.2 * temps, 0.85 + 0.1 * temps, 1.0 - 0.25 * temps], 1)
        vals = (0.05 + 0.6 * mag)[:, None] * cols
        np.add.at(self.stars, (sy, sx), vals.astype(np.float32))
        self.stars = blur(self.stars, 0.55) * 2.4

        # bright stars that twinkle, drawn per frame
        nb = 260
        self.bright = [(rng.uniform(0, w), rng.uniform(0, h), rng.uniform(0.35, 1.0),
                        rng.uniform(0, 100), rng.random()) for _ in range(nb)]

    def render(self, T, glow, stars, milky, offset_y, offset_x=0.0):
        """glow: 0..1 light pollution; stars/milky: 0..1 visibility."""
        y = SKY_H - C.H - offset_y
        x = 100 + offset_x
        base_p = crop_subpixel(self.polluted, x, y)
        base_d = crop_subpixel(self.dark, x, y)
        frame = base_d + (base_p - base_d) * glow
        if stars > 0:
            frame += crop_subpixel(self.stars, x, y) * stars
            for (bx, by, b, ph, t) in self.bright:
                sx, sy = bx - x, by - y
                if -10 < sx < C.W + 10 and -10 < sy < C.H + 10:
                    tw = 0.75 + 0.25 * hash_noise(T * 3.0 + ph, 7)
                    col = (0.85 + 0.15 * t, 0.9, 1.0 - 0.2 * t)
                    add_glow(frame, sx, sy, 3 + 3 * b, col, stars * b * tw * 0.9)
        if milky > 0:
            frame += crop_subpixel(self.milky, x, y) * milky
        return frame


def airplane(frame, T, t0, t1, y0, y1):
    """A blinking airplane crossing the sky between t0 and t1."""
    if not (t0 <= T <= t1):
        return
    u = (T - t0) / (t1 - t0)
    x = -40 + (C.W + 80) * u
    y = y0 + (y1 - y0) * u
    add_glow(frame, x, y, 2, (1.0, 0.95, 0.9), 0.35)
    if (T * 1.1) % 1.0 < 0.12:
        add_glow(frame, x - 3, y + 1, 7, (1.0, 0.15, 0.1), 1.1)
    if ((T + 0.5) * 1.1) % 1.0 < 0.08:
        add_glow(frame, x + 2, y, 9, (1.0, 1.0, 1.0), 1.0)
