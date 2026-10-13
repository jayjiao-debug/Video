"""Shared kit for the case renderer: assets, pixel text, camera, living art, overlays.

Case 01 · 雨夜书房 — vertical (1080x1920, 30 fps) immersive detective short.

Everything is keyed to the voice timeline (timeline.json), so re-recording the voice
re-times the film. Scenes are pixel art at 216x384 (5x on screen); the camera crops
the art and scales with nearest neighbour, resting on integer zooms.

python3 case_render.py            -> out/case01_raw.mp4 (picture only)
python3 case_render.py 30 45      -> only seconds 30..45 (quick checks)
python3 case_render.py still 31.5 -> out/still.png
"""
import json, math, pathlib, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = pathlib.Path(__file__).resolve().parent
ART = HERE / "art"
SPR = HERE.parent / "public" / "sprites"
W, H, FPS = 1080, 1920, 30
K = (18, 14, 16)
INK, CREAM, GOLD, RED, GREEN, SKY, WHITE = (22, 17, 30), (244, 230, 196), (232, 182, 72), (214, 64, 64), (96, 196, 110), (120, 220, 255), (255, 255, 255)

LINES = json.loads((HERE / "lines.json").read_text())
TL = json.loads((HERE / "timeline.json").read_text())
DUR = TL["duration"]
IDX = {l["id"]: i for i, l in enumerate(LINES)}
S = [l["start"] for l in TL["lines"]]
E = [l["end"] for l in TL["lines"]]
KY = [l["key"] for l in TL["lines"]]

# ------------------------------------------------------------------ assets
def rgba(p):
    return Image.open(p).convert("RGBA")


STUDY = rgba(ART / "study.png")
HALL = rgba(ART / "hall.png")
PORT = {n: rgba(ART / f"{n}.png") for n in ("butler", "secretary", "nephew")}
CLOCK = rgba(ART / "clock_945.png")
WILL = rgba(ART / "will.png")
MAG = rgba(ART / "magnifier.png")
HAIR = rgba(ART / "hair.png")
TYPEW = rgba(ART / "typewriter.png")
LANTERN = rgba(ART / "lantern.png")
HAND = rgba(ART / "hand_ink.png")
HAIR_AT = (74, 239)            # on the saucer, never pointed out until the reveal
HOLMES = {p: rgba(SPR / f"holmes_{p}.png") for p in ("idle", "talk1", "talk2", "deduce", "think", "shock", "sit", "magnify", "blink")}
HOLMES = {p: im.resize((im.width // 2, im.height // 2), Image.NEAREST) for p, im in HOLMES.items()}  # 1 px per art cell

FONT = ImageFont.truetype("/usr/share/fonts/opentype/unifont/unifont.otf", 16)

# voice loudness per frame -> mouth
with wave.open(str(HERE / "audio/voice.wav")) as w:
    _v = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(np.float32) / 32768
    _sr = w.getframerate()
_hop = _sr // FPS
RMS = np.array([np.sqrt((_v[i * _hop:(i + 1) * _hop] ** 2).mean() + 1e-12) for i in range(len(_v) // _hop + 1)])
RMS /= RMS.max()


def loud(t):
    i = int(t * FPS)
    return RMS[i] if i < len(RMS) else 0.0


# ------------------------------------------------------------------ helpers
ease = lambda x: 0.5 - 0.5 * math.cos(math.pi * max(0.0, min(1.0, x)))
clamp = lambda x, a=0.0, b=1.0: max(a, min(b, x))


def ramp(t, t0, d=0.3):
    return ease((t - t0) / d)


def text_img(s, scale=4, color=CREAM, outline=INK, spans=()):
    """Pixel text: Unifont at its native 16 px, 1 px outline, then scaled up.
    spans: [(substring, colour)] recoloured in place (keywords)."""
    w = int(FONT.getlength(s)) + 4
    im = Image.new("RGBA", (w, 20), (0, 0, 0, 0))
    mask = Image.new("L", (w, 20), 0)
    ImageDraw.Draw(mask).text((2, 1), s, font=FONT, fill=255)
    m = np.array(mask) > 0
    a = np.zeros((20, w, 4), np.uint8)
    if outline:
        o = np.zeros_like(m)
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                o |= np.roll(np.roll(m, dy, 0), dx, 1)
        a[o] = (*outline, 255)
    a[m] = (*color, 255)
    for sub, col in spans:
        i = s.find(sub)
        if i < 0:
            continue
        x0 = 2 + int(FONT.getlength(s[:i]))
        x1 = 2 + int(FONT.getlength(s[:i + len(sub)]))
        seg = m[:, x0:x1]
        a[:, x0:x1][seg] = (*col, 255)
    im = Image.fromarray(a, "RGBA")
    return im.resize((im.width * scale, im.height * scale), Image.NEAREST)


def paste_c(frame, im, cx, cy, alpha=1.0):
    """Paste centred, with optional fade (quantised to 4 steps for an old-hardware look)."""
    if alpha <= 0:
        return
    if alpha < 1:
        a = np.array(im)
        a[..., 3] = (a[..., 3] * (round(alpha * 4) / 4)).astype(np.uint8)
        im = Image.fromarray(a, "RGBA")
    frame.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2)))


def up(im, s):
    return im.resize((im.width * s, im.height * s), Image.NEAREST)


def darken(frame, k, tint=(10, 6, 18)):
    if k <= 0:
        return frame
    ov = Image.new("RGBA", frame.size, (*tint, int(255 * clamp(k))))
    frame.alpha_composite(ov)
    return frame


def camera(art, cx, cy, z):
    """Crop art around (cx, cy) at zoom z (screen px per art px), nearest-neighbour."""
    vw, vh = W / z, H / z
    x0 = clamp(cx - vw / 2, 0, art.width - vw)
    y0 = clamp(cy - vh / 2, 0, art.height - vh)
    if z == int(z):   # rest on whole art pixels
        x0, y0 = round(x0 * z) / z, round(y0 * z) / z
    return art.resize((W, H), Image.NEAREST, box=(x0, y0, x0 + vw, y0 + vh))


def cam_path(t, keys):
    """keys: [(time, cx, cy, z)], eased between."""
    if t <= keys[0][0]:
        return keys[0][1:]
    for a, b in zip(keys, keys[1:]):
        if a[0] <= t <= b[0]:
            k = ease((t - a[0]) / max(1e-6, b[0] - a[0]))
            return tuple(a[i] + (b[i] - a[i]) * k for i in (1, 2, 3))
    return keys[-1][1:]


# ------------------------------------------------------------------ living art
RNG = np.random.default_rng(7)
RAIN = [(RNG.uniform(52, 160), RNG.uniform(0, 1), RNG.uniform(0.9, 1.6)) for _ in range(70)]
WINDOW = (54, 24, 158, 196)


def study_at(t, rain=True, flash=0.0, poison=None):
    a = STUDY.copy()
    d = ImageDraw.Draw(a)
    if rain:
        x0, y0, x1, y1 = WINDOW
        for x, ph, sp in RAIN:
            y = y0 + ((ph + t * sp) % 1) * (y1 - y0)
            d.line((int(x), int(y), int(x), int(min(y1, y + 3))), fill=(150, 190, 230, 200))
    if flash > 0:
        x0, y0, x1, y1 = WINDOW
        d.rectangle(WINDOW, fill=(200, 220, 255, int(170 * flash)))
    if poison is not None:   # a green drop falling into the teacup, then a ripple
        if poison < 1:
            y = 214 + 22 * poison
            d.rectangle((77, int(y), 78, int(y) + 1), fill=(120, 230, 90, 255))
        elif poison < 1.8:
            r = int(2 + 3 * (poison - 1))
            d.ellipse((78 - r, 235 - 1, 78 + r, 235 + 1), outline=(120, 230, 90, 255))
    a.alpha_composite(HAIR, HAIR_AT)
    return a


DRIPS = [(0.0,), (0.33,), (0.66,)]


def hall_at(t, wet=True):
    a = HALL.copy()
    d = ImageDraw.Draw(a)
    if wet:
        for x, y in ((44, 240), (45, 252), (47, 266), (49, 278), (46, 284)):   # shine on the wet one
            d.point((x, y), fill=(150, 200, 235, 255))
        d.ellipse((38, 298, 56, 303), fill=(92, 130, 170, 200))                # puddle
        d.line((41, 300, 52, 300), fill=(160, 200, 235, 220))
        for (ph,) in DRIPS:
            k = (t * 1.3 + ph) % 1
            y = 289 + k * 10
            d.rectangle((47, int(y), 47, int(y) + 1), fill=(170, 215, 245, 255))
    return a


def door_art(open_k):
    """Closed study door, two halves sliding apart as open_k goes 0 -> 1."""
    a = Image.new("RGBA", (216, 384), (0, 0, 0, 0))
    d = ImageDraw.Draw(a)
    half = 108
    off = int(open_k * 112)
    for side in (0, 1):
        x0 = (0 - off) if side == 0 else (half + off)
        x1 = x0 + half - 1
        d.rectangle((x0, 0, x1, 383), fill=(86, 50, 32, 255), outline=K)
        for gx in range(x0 + 6, x1, 12):
            d.line((gx, 0, gx, 383), fill=(70, 40, 26, 255))
        for py in (40, 200):
            d.rectangle((x0 + 14, py, x1 - 14, py + 130), outline=(54, 30, 20, 255), width=2)
            d.rectangle((x0 + 17, py + 3, x1 - 17, py + 127), outline=(110, 68, 44, 255))
        kx = x1 - 12 if side == 0 else x0 + 8
        d.ellipse((kx, 186, kx + 5, 191), fill=GOLD + (255,), outline=K)
    return a


# ------------------------------------------------------------------ overlays
def tag(frame, text, x, y, col=GOLD, fg=INK, scale=3, t=1.0):
    """A label chip with a pointer line, popping in."""
    if t <= 0:
        return
    im = text_img(text, scale, fg, None)
    k = min(1, t / 0.2)
    pad = 16
    bw, bh = im.width + 2 * pad, im.height + 2 * pad - 8
    x0, y0 = int(x - bw / 2), int(y - bh / 2 - (1 - k) * 30)
    d = ImageDraw.Draw(frame)
    d.rectangle((x0 + 6, y0 + 6, x0 + bw + 6, y0 + bh + 6), fill=(10, 8, 14, 200))
    d.rectangle((x0, y0, x0 + bw, y0 + bh), fill=col, outline=K, width=4)
    frame.alpha_composite(im, (x0 + pad, y0 + pad - 6))


def holmes(frame, t, pose, cx, feet, scale=7, talking=False, enter=None, leave=None):
    if talking and pose in ("idle", "deduce"):
        lv = loud(t)
        if pose == "idle":
            pose = "talk2" if lv > 0.35 else ("talk1" if lv > 0.12 else "idle")
    im = up(HOLMES[pose], scale)
    dy = 0
    if enter is not None and t < enter + 0.35:
        dy = (1 - ease((t - enter) / 0.35)) * 500
    if leave is not None and t > leave:
        dy = ease((t - leave) / 0.35) * 600
    bob = 0 if (t * 2) % 1 < 0.5 else scale
    frame.alpha_composite(im, (int(cx - im.width / 2), int(feet - im.height + dy + (bob if not talking else 0))))


def portrait_card(frame, name, cx, cy, scale, label=None, sil=False, alpha=1.0, glow=None):
    p = PORT[name]
    if sil:
        a = np.array(p); a[..., :3] = (8, 6, 12); p = Image.fromarray(a, "RGBA")
    im = up(p, scale)
    d = ImageDraw.Draw(frame)
    pad = 3 * scale
    box = (int(cx - im.width / 2 - pad), int(cy - im.height / 2 - pad), int(cx + im.width / 2 + pad), int(cy + im.height / 2 + pad))
    d.rectangle(box, fill=(44, 34, 58) if not glow else glow, outline=K, width=max(4, scale))
    paste_c(frame, im, cx, cy, alpha)
    if label:
        lab = text_img(label, max(2, scale // 2 + 1), CREAM)
        frame.alpha_composite(lab, (int(cx - lab.width / 2), box[3] + 12))
    return box


def stamp(frame, text, cx, cy, t, col=RED, scale=5, angle=-12):
    if t <= 0:
        return
    k = min(1, t / 0.12)
    s = 1 + (1 - k) * 1.5
    im = text_img(text, scale, col, None)
    pad = 18
    box = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad - 10), (0, 0, 0, 0))
    bd = ImageDraw.Draw(box)
    bd.rectangle((0, 0, box.width - 1, box.height - 1), outline=col + (255,), width=10)
    box.alpha_composite(im, (pad, pad - 5))
    box = box.resize((int(box.width * s), int(box.height * s)), Image.NEAREST).rotate(angle, expand=True, resample=Image.NEAREST)
    paste_c(frame, box, cx, cy, 1.0 if k >= 1 else 0.75)


def flash(frame, k, col=(255, 255, 255)):
    if k > 0:
        frame.alpha_composite(Image.new("RGBA", frame.size, (*col, int(255 * clamp(k)))))


def shake(t, t0, amp=18, d=0.35):
    if t0 <= t < t0 + d:
        k = 1 - (t - t0) / d
        return int(math.sin(t * 90) * amp * k), int(math.cos(t * 77) * amp * k)
    return 0, 0


