"""Procedural skyline: three parallax layers of buildings with individually
addressable windows, so every light in the city can be switched off on cue."""

import math

import cv2
import numpy as np
from PIL import Image, ImageDraw

from . import config as C
from .util import add_glow, lerp3

LW, LH = 4400, 1600
GROUND = 1100  # row of the street in layer coordinates

WARM = [(1.0, 0.78, 0.46), (1.0, 0.70, 0.38), (1.0, 0.85, 0.60), (0.98, 0.62, 0.32)]
COOL = [(0.82, 0.92, 1.0), (0.90, 0.95, 0.92)]
TV = (0.45, 0.62, 1.0)


def _crop(arr, iy, ix):
    """(H+1) x (W+1) window at (iy, ix); rows above the array read as empty sky."""
    h, w = C.H + 1, C.W + 1
    if iy >= 0:
        return arr[iy:iy + h, ix:ix + w]
    out = np.zeros((h, w), arr.dtype)
    out[-iy:] = arr[0:h + iy, ix:ix + w]
    return out


class Layer:
    def __init__(self, name, parallax, spec, rng, id_offset):
        self.name = name
        self.p = parallax
        self.spec = spec
        self.alpha = np.zeros((LH, LW), np.float32)
        self.ids = np.zeros((LH, LW), np.int32)
        self.pids = np.zeros((LH, LW), np.int32)
        self.windows = []  # (x_center, y_center, w, h, big)
        self.beacons = []  # (x, y)
        self.tanks = []
        self._build(rng, id_offset)

    def _build(self, rng, id_offset):
        s = self.spec
        mask = Image.new("L", (LW * 2, LH * 2), 0)
        d = ImageDraw.Draw(mask)
        solid_rects = []

        def R(x0, y0, x1, y1):
            d.rectangle([x0 * 2, y0 * 2, x1 * 2 - 1, y1 * 2 - 1], fill=255)

        x = -20
        while x < LW + 20:
            bw = int(rng.uniform(*s["width"]))
            bh = int(rng.uniform(*s["height"]))
            if rng.random() < 0.18:  # occasional tall tower
                bh = int(bh * rng.uniform(1.3, 1.7))
            top = GROUND - bh
            R(x, top, x + bw, LH)
            solid_rects.append((x, top, x + bw))
            style = rng.random()
            if style < 0.25:  # stepped crown
                sw = int(bw * rng.uniform(0.4, 0.7))
                sx = x + (bw - sw) // 2
                sh = int(rng.uniform(0.05, 0.12) * bh + 6)
                R(sx, top - sh, sx + sw, top)
                if rng.random() < 0.6:
                    aw = max(2, int(s["antenna_w"]))
                    ah = int(rng.uniform(0.15, 0.35) * bh)
                    ax = sx + sw // 2
                    R(ax - aw // 2, top - sh - ah, ax + aw - aw // 2, top - sh)
                    self.beacons.append((ax, top - sh - ah))
            elif style < 0.37:  # spire
                d.polygon([(x * 2, top * 2), ((x + bw) * 2, top * 2),
                           ((x + bw / 2) * 2, (top - bw * rng.uniform(0.5, 1.2)) * 2)],
                          fill=255)
            elif style < 0.62 and s["tanks"]:  # water tank on stilts
                tw = int(rng.uniform(0.18, 0.3) * bw + 8)
                tx = x + int(rng.uniform(0.1, 0.6) * bw)
                leg = int(tw * 0.45)
                th = int(tw * 0.9)
                R(tx + 1, top - leg, tx + 3, top)
                R(tx + tw - 3, top - leg, tx + tw - 1, top)
                R(tx, top - leg - th, tx + tw, top - leg)
                d.polygon([(tx * 2 - 2, (top - leg - th) * 2),
                           ((tx + tw) * 2 + 2, (top - leg - th) * 2),
                           ((tx + tw / 2) * 2, (top - leg - th - tw * 0.4) * 2)], fill=255)
            elif style < 0.75:  # rooftop box / elevator housing
                bx = x + int(rng.uniform(0.1, 0.5) * bw)
                R(bx, top - int(rng.uniform(6, 16)), bx + int(bw * 0.3), top)
            gap = int(rng.uniform(*s["gap"]))
            x += bw + gap

        m = np.asarray(mask, np.float32) / 255.0
        self.alpha = cv2.resize(m, (LW, LH), interpolation=cv2.INTER_AREA)

        # windows
        ww, wh = s["win"]
        sx, sy = s["spacing"]
        wid = id_offset
        for (bx0, top, bx1) in solid_rects:
            bw = bx1 - bx0
            cols = max(1, (bw - 2 * s["margin"]) // sx)
            if cols < 1:
                continue
            x_start = bx0 + (bw - cols * sx) // 2 + (sx - ww) // 2
            rows = (GROUND - top - s["margin"]) // sy
            density = rng.uniform(*s["lit"])
            office = rng.random() < 0.3
            for r in range(rows):
                wy = top + s["margin"] + r * sy
                if wy + wh > GROUND - 4:
                    break
                for c in range(cols):
                    wx = x_start + c * sx
                    if wx < 0 or wx + ww >= LW:
                        continue
                    wid += 1
                    self.ids[wy:wy + wh, wx:wx + ww] = wid
                    lit = rng.random() < density
                    self.windows.append(dict(
                        id=wid, x=wx + ww / 2, y=wy + wh / 2, w=ww, h=wh,
                        lit=lit, office=office))
        self.id_end = wid

    def add_person(self, win, rng):
        """Paint a head-and-shoulders silhouette inside a window."""
        x0 = int(win["x"] - win["w"] / 2)
        y0 = int(win["y"] - win["h"] / 2)
        w, h = win["w"], win["h"]
        img = Image.new("L", (w * 4, h * 4), 0)
        d = ImageDraw.Draw(img)
        cx = w * 4 * rng.uniform(0.35, 0.65)
        head_r = w * 4 * 0.17
        head_y = h * 4 * 0.52
        d.ellipse([cx - head_r, head_y - head_r, cx + head_r, head_y + head_r], fill=255)
        d.rounded_rectangle([cx - w * 4 * 0.36, head_y + head_r * 0.9,
                             cx + w * 4 * 0.36, h * 4 + 4], radius=head_r, fill=255)
        if rng.random() < 0.5:  # pointing arm
            d.line([cx + w * 4 * 0.2, head_y + head_r * 1.6,
                    cx + w * 4 * 0.45, head_y - head_r * 2.2],
                   fill=255, width=max(2, int(w * 4 * 0.12)))
        m = np.asarray(img.resize((w, h), Image.Resampling.BOX)) > 110
        region = self.pids[y0:y0 + h, x0:x0 + w]
        region[m] = win["id"]


LAYER_SPECS = {
    "far": dict(width=(28, 80), height=(50, 190), gap=(0, 6), win=(2, 3),
                spacing=(5, 7), margin=4, lit=(0.15, 0.5), antenna_w=1, tanks=False),
    "mid": dict(width=(50, 130), height=(90, 300), gap=(0, 14), win=(4, 5),
                spacing=(9, 11), margin=6, lit=(0.2, 0.55), antenna_w=2, tanks=True),
    "near": dict(width=(120, 260), height=(170, 480), gap=(4, 40), win=(17, 22),
                 spacing=(31, 38), margin=14, lit=(0.25, 0.6), antenna_w=3, tanks=True),
}
PARALLAX = {"far": 0.35, "mid": 0.6, "near": 1.0}
# layer -> (screen x of layer origin at cam_x = 0, ground screen-y at cam_y = 0)
PLACEMENT_KEYS = ("far", "mid", "near")


class City:
    def __init__(self, seed=C.SEED):
        rng = np.random.default_rng(seed)
        self.layers = []
        offset = 0
        for name in PLACEMENT_KEYS:
            layer = Layer(name, PARALLAX[name], LAYER_SPECS[name], rng, offset)
            offset = layer.id_end
            self.layers.append(layer)
        self.n = offset + 1
        self._assign_behaviour(rng)

    # ---------------------------------------------------------- behaviour

    def _assign_behaviour(self, rng):
        n = self.n
        self.color = np.zeros((n, 3), np.float32)
        self.base = np.zeros(n, np.float32)
        self.lit0 = np.zeros(n, bool)
        self.tv = np.zeros(n, bool)
        self.phase = rng.random(n).astype(np.float32) * 100
        self.flip = np.full(n, np.inf, np.float32)
        self.off = np.full(n, np.inf, np.float32)
        self.person = np.full(n, np.inf, np.float32)
        self.layer_of = np.zeros(n, np.int8)
        self.wx = np.zeros(n, np.float32)
        self.wy = np.zeros(n, np.float32)

        for li, layer in enumerate(self.layers):
            for w in layer.windows:
                i = w["id"]
                self.layer_of[i] = li
                self.wx[i], self.wy[i] = w["x"], w["y"]
                self.lit0[i] = w["lit"]
                if w["office"]:
                    self.color[i] = COOL[rng.integers(len(COOL))]
                else:
                    self.color[i] = WARM[rng.integers(len(WARM))]
                self.base[i] = rng.uniform(0.55, 1.0)
                if not w["office"] and rng.random() < 0.07:
                    self.tv[i] = True
                if rng.random() < 0.035:  # someone comes home / goes to bed
                    self.flip[i] = rng.uniform(8, 50)

        # The lights-out ripple spreads outward from the centre of the
        # blackout shot's frame.
        from .cameras import blackout_cam, drift_cam
        cam = blackout_cam(C.RIPPLE_START)
        span = C.RIPPLE_END - C.RIPPLE_START
        for li, layer in enumerate(self.layers):
            x0, _ = self.layer_origin(layer, cam)
            ids = np.array([w["id"] for w in layer.windows], np.int64)
            if len(ids) == 0:
                continue
            sx = self.wx[ids] - x0
            dist = np.abs(sx - C.W * 0.5) / (C.W * 0.5)
            t = C.RIPPLE_START + span * np.clip(dist, 0, 1.25) ** 0.8 * 0.85
            t += rng.uniform(0, 1.6, len(ids)) + (2 - li) * 0.25
            self.off[ids] = np.minimum(t, C.RIPPLE_END + 1.0)

        # People appear in near/mid windows visible in the drift shot; the
        # closest few are the first to switch off their lights.
        near = self.layers[2]
        mid = self.layers[1]
        dcam_a, dcam_b = drift_cam(C.PEOPLE_APPEAR[0]), drift_cam(C.FIRST_LIGHTS_OFF[1])
        cands = []
        for li, layer in ((2, near), (1, mid)):
            xa, ga = self.layer_origin(layer, dcam_a)
            xb, _ = self.layer_origin(layer, dcam_b)
            for w in layer.windows:
                sxa, sxb = w["x"] - xa, w["x"] - xb
                sy = w["y"] - ga
                if (self.lit0[w["id"]] and not self.tv[w["id"]]
                        and 60 < sxa < C.W - 60 and 60 < sxb < C.W - 60
                        and 330 < sy < C.H - 20):
                    cands.append((li, w))
        rng.shuffle(cands)
        # favour the near layer, where a silhouette at the glass is readable
        chosen = [c for c in cands if c[0] == 2][:22]
        chosen += [c for c in cands if c[0] == 1][:34 - len(chosen)]
        for k, (li, w) in enumerate(chosen):
            self.layers[li].add_person(w, rng)
            self.person[w["id"]] = rng.uniform(*C.PEOPLE_APPEAR)
            self.flip[w["id"]] = np.inf
        # first adopters: a handful of the people-windows go dark early
        early = [w for li, w in chosen if li == 2][:6] + [w for li, w in chosen if li == 1][:4]
        times = np.sort(rng.uniform(*C.FIRST_LIGHTS_OFF, len(early)))
        for w, t in zip(early, times):
            self.off[w["id"]] = max(t, self.person[w["id"]] + 2.5)
        self.early_off = sorted(float(self.off[w["id"]]) for w in early)

        # One stubborn window, near the centre of the final frame, stays on.
        best, best_d = None, 1e9
        x0, g = self.layer_origin(near, cam)
        for w in near.windows:
            sx, sy = w["x"] - x0, w["y"] - g
            dd = abs(sx - C.W * 0.58) + abs(sy - C.H * 0.7) * 0.5
            if self.lit0[w["id"]] and not self.tv[w["id"]] and dd < best_d:
                best, best_d = w, dd
        self.stubborn = best["id"]
        self.off[self.stubborn] = C.STUBBORN_OFF
        self.flip[self.stubborn] = np.inf
        self.color[self.stubborn] = WARM[0]
        self.base[self.stubborn] = 1.0

        # beacons (red aviation lights) go dark with the ripple
        self.beacon_list = []
        for li, layer in enumerate(self.layers):
            x0, _ = self.layer_origin(layer, cam)
            for (bx, by) in layer.beacons:
                dist = abs(bx - x0 - C.W / 2) / (C.W / 2)
                self.beacon_list.append((li, bx, by, C.RIPPLE_START + span * min(dist, 1.2) * 0.8
                                         + rng.uniform(0.5, 2.0), rng.uniform(0, 2)))

    # ---------------------------------------------------------- queries

    @staticmethod
    def layer_origin(layer, cam):
        """Return (layer x at screen x=0, layer y at screen ground line offset)."""
        cam_x, cam_y, grounds = cam["x"], cam["y"], cam["ground"]
        name = layer.name
        x0 = cam_x * layer.p + {"far": 300, "mid": 600, "near": 900}[name]
        ground_screen = grounds[name] + cam_y * layer.p
        y0 = GROUND - ground_screen
        return x0, y0

    def light_levels(self, T):
        on = self.lit0 ^ (T > self.flip)
        level = self.base * on
        # quick fade when a switch is flipped (~80 ms)
        level *= np.clip((self.off - T) / 0.08, 0, 1)
        tv = self.tv & on
        if tv.any():
            flick = 0.6 + 0.4 * np.sin(T * 7.3 + self.phase[tv]) * np.sin(T * 3.1 + self.phase[tv] * 1.7)
            level[tv] *= flick
        level[0] = 0
        return level.astype(np.float32)

    def lit_fraction(self, T):
        on = (self.lit0 ^ (T > self.flip)) & (T < self.off)
        return float(on.sum()) / max(1, int(self.lit0.sum()))

    # ---------------------------------------------------------- render

    def render(self, frame, T, cam, glow, layers=("far", "mid", "near"), starlight=0.0,
               beacon_on=True):
        """Composite the skyline onto frame (float32 HxWx3, modified copy returned)."""
        level = self.light_levels(T)
        lut = self.color * level[:, None]
        person_vis = (T > self.person) & (level > 0.05)

        horizon = lerp3((0.03, 0.035, 0.06), (0.36, 0.22, 0.14), glow)
        for layer in self.layers:
            if layer.name not in layers:
                continue
            x0, y0 = self.layer_origin(layer, cam)
            ix, iy = int(math.floor(x0)), int(math.floor(y0))
            fx, fy = x0 - ix, y0 - iy
            ix = max(0, min(ix, LW - C.W - 2))
            iy = min(iy, LH - C.H - 2)
            if iy + C.H + 1 <= 0:
                continue  # layer has scrolled entirely below the frame
            a = _crop(layer.alpha, iy, ix)
            ids = _crop(layer.ids, iy, ix)
            pids = _crop(layer.pids, iy, ix)

            # wall colour: silhouettes lit faintly by sky glow; far layers hazier
            haze = {"far": 0.55, "mid": 0.28, "near": 0.08}[layer.name]
            lit_wall = {"far": (0.05, 0.045, 0.06), "mid": (0.03, 0.028, 0.04),
                        "near": (0.016, 0.015, 0.022)}[layer.name]
            dark_wall = {"far": (0.018, 0.022, 0.038), "mid": (0.010, 0.012, 0.022),
                         "near": (0.004, 0.005, 0.009)}[layer.name]
            base_wall = lerp3(dark_wall, lit_wall, glow)
            wall = np.array(lerp3(base_wall, horizon, haze * glow), np.float32)
            wall += np.array((0.006, 0.009, 0.020), np.float32) * starlight * (1.0 - haze * 0.5)
            unlit = wall * 0.75 + np.array((0.02, 0.022, 0.03), np.float32) * glow * (1 - haze)

            win = ids > 0
            rgb = np.empty(a.shape + (3,), np.float32)
            rgb[:] = wall
            wl = lut[ids[win]]
            rgb[win] = unlit + wl * (1 - haze * 0.5)
            if person_vis.any():
                pm = pids > 0
                if pm.any():
                    vis = person_vis[pids[pm]]
                    idx = np.nonzero(pm)
                    rgb[idx[0][vis], idx[1][vis]] = wall * 1.1
            rgb *= a[..., None]

            # bilinear sub-pixel resample for smooth camera moves
            def bl(z):
                t = z[:-1, :-1] * (1 - fx) + z[:-1, 1:] * fx
                b = z[1:, :-1] * (1 - fx) + z[1:, 1:] * fx
                return t * (1 - fy) + b * fy

            a2 = bl(a)
            rgb2 = bl(rgb)
            frame = frame * (1 - a2[..., None]) + rgb2

        if beacon_on:
            for (li, bx, by, off, ph) in self.beacon_list:
                layer = self.layers[li]
                if layer.name not in layers or T > off:
                    continue
                blink = 0.5 + 0.5 * math.sin((T + ph) * math.pi * 1.0)
                if blink < 0.35:
                    continue
                x0, y0 = self.layer_origin(layer, cam)
                sx, sy = bx - x0, by - y0
                if -20 < sx < C.W + 20 and -20 < sy < C.H + 20:
                    r = {"far": 3, "mid": 5, "near": 7}[layer.name]
                    add_glow(frame, sx, sy, r, (1.0, 0.12, 0.08), 0.9 * blink)
        return frame
