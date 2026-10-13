"""Movement test for the Holmes sprites: a small rig on the idle drawing (head and body
split at the neck) plus pose swaps hidden behind squash-and-stretch.

  hop in -> breathe + head bob + blink -> talk (mouth flaps, nods) -> idea (deduce)
  -> think -> shock (jump + shake) -> laugh (bounces) -> read -> back to idle + blink

Writes out/holmes_movement_test.mp4 (1920x1080, 30 fps).
"""
import math, pathlib, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
SPR = ROOT / "public" / "sprites"
FPS, W, H = 30, 1920, 1080
CELL = 7                       # screen px per art cell
FEET_Y, CX = 900, 960
NECK = 31                      # idle: rows above this are the head
FONT = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 40)
MOUTH_DARK, MOUTH_RED, MOUTH_TONGUE = (60, 18, 22), (150, 46, 52), (226, 120, 120)


def cells(p):
    return np.array(Image.open(SPR / f"holmes_{p}.png").convert("RGBA"))[::2, ::2].copy()


POSE = {p: cells(p) for p in ("idle", "blink", "talk1", "talk2", "look", "think", "deduce", "shock", "sit", "read", "magnify")}


EYES = ((21, 22, 20, 23), (32, 33, 20, 23))   # idle eye blocks: x0, x1, y0, y1 (art cells)


def close_eyes(a):
    """Blink: eye blocks go to skin, with one closed-lid line along the bottom."""
    a = a.copy()
    sk = a[24, 27].copy()
    for x0, x1, y0, y1 in EYES:
        a[y0:y1 + 1, x0:x1 + 1] = sk
        a[y1, x0 - 1:x1 + 2] = (60, 30, 30, 255)
    return a


# blink and mouth shapes come from holmes_rig.py (same face, only eyes / mouth redrawn)


def find_mouth(a):
    h, w = a.shape[:2]
    rgb = a[..., :3].astype(int)
    skin = (rgb[..., 0] > 200) & (rgb[..., 1] > 150) & (a[..., 3] > 0)
    dark = (rgb.sum(-1) < 200) & (a[..., 3] > 0)
    rows = [y for y in range(h) if skin[y].sum() > w // 3]
    pts = [(x, y) for y in range(rows[-1] - 6, rows[-1] + 1) for x in range(w // 2 - 7, w // 2 + 7)
           if dark[y, x] and skin[y - 1, x]]
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    return (min(xs) + max(xs)) / 2, sum(ys) / len(ys), max(xs) - min(xs) + 1


MX, MY, MW = find_mouth(POSE["idle"])


def with_mouth(a, openness):
    """openness 0 = drawn smile, 1 = small open, 2 = wide open."""
    if openness == 0:
        return a
    a = a.copy()
    skin = tuple(int(v) for v in a[int(MY) - 2, int(MX)][:3])
    x0, y0 = int(round(MX - MW / 2)), int(round(MY))
    for y in range(y0 - 1, y0 + 2):           # wipe the drawn smile
        for x in range(x0 - 1, x0 + int(MW) + 1):
            if a[y, x, :3].astype(int).sum() < 200:
                a[y, x] = (*skin, 255)
    w = 4 if openness == 1 else 5
    hgt = 3 if openness == 1 else 4
    cx = int(round(MX - w / 2))
    for y in range(hgt):
        for x in range(w):
            edge = y == 0 or y == hgt - 1 or x == 0 or x == w - 1
            corner = (y in (0, hgt - 1)) and (x in (0, w - 1))
            if corner:
                continue
            c = MOUTH_DARK if edge else (MOUTH_TONGUE if y == hgt - 2 and hgt > 2 else MOUTH_RED)
            a[y0 - 1 + y, cx + x] = (*c, 255)
    return a


def rig(head_dy=0, blink=False, mouth=0):
    """Idle drawing with the head moved down by head_dy cells (body stays put)."""
    base = POSE["blink" if blink else ("talk%d" % mouth if mouth else "idle")]
    out = POSE["idle"].copy()
    out[:NECK] = 0
    im = Image.fromarray(out, "RGBA")
    im.alpha_composite(Image.fromarray(np.ascontiguousarray(base[:NECK]), "RGBA"), (0, head_dy))
    return np.array(im)


def place(frame, a, sx=1.0, sy=1.0, dx=0, dy=0):
    """Draw cell-array a scaled CELL*sx by CELL*sy, feet anchored at FEET_Y."""
    im = Image.fromarray(a, "RGBA")
    w, h = int(im.width * CELL * sx), int(im.height * CELL * sy)
    im = im.resize((w, h), Image.NEAREST)
    frame.alpha_composite(im, (int(CX - w / 2 + dx), int(FEET_Y - h + dy)))


def backdrop():
    bg = Image.new("RGBA", (W, H), (34, 27, 46, 255))
    d = ImageDraw.Draw(bg)
    for i in range(0, H, CELL):
        k = i / H
        d.rectangle((0, i, W, i + CELL), fill=(int(34 + 14 * k), int(27 + 10 * k), int(46 + 12 * k), 255))
    d.rectangle((0, FEET_Y - 10, W, H), fill=(28, 22, 34, 255))
    d.rectangle((0, FEET_Y - 10, W, FEET_Y - 10 + CELL), fill=(52, 42, 62, 255))
    return bg


BG = backdrop()


def shadow(frame, scale, dx=0):
    d = ImageDraw.Draw(frame)
    rw, rh = 170 * scale, 26 * scale
    d.ellipse((CX + dx - rw, FEET_Y - 4 - rh / 2, CX + dx + rw, FEET_Y - 4 + rh / 2), fill=(18, 14, 24, 255))


def label(frame, text):
    d = ImageDraw.Draw(frame)
    tw = d.textlength(text, font=FONT)
    d.rounded_rectangle((CX - tw / 2 - 28, 960, CX + tw / 2 + 28, 1036), 14, fill=(20, 16, 28, 230))
    d.text((CX - tw / 2, 974), text, font=FONT, fill=(244, 230, 196))


ease = lambda t: 0.5 - 0.5 * math.cos(math.pi * max(0, min(1, t)))


def squash_swap(t, a, b):
    """0..1 over ~8 frames: a squashes down, swaps to b, b stretches up and settles."""
    if t < 0.4:
        k = ease(t / 0.4)
        return a, 1 + 0.08 * k, 1 - 0.1 * k
    k = (t - 0.4) / 0.6
    s = math.sin(k * math.pi) * (1 - k)
    return b, 1 - 0.05 * s, 1 + 0.08 * s


SEGMENTS = []  # (seconds, label, fn(t_local_seconds, frame_idx) -> (array, sx, sy, dx, dy, shadow_scale))


def seg(sec, text):
    def deco(fn):
        SEGMENTS.append((sec, text, fn)); return fn
    return deco


breath = lambda t: 1 if (t % 1.2) > 0.6 else 0


@seg(1.2, "Hop in")
def _(t, f):
    k = min(1, t / 0.8)
    x = -700 * (1 - ease(k))
    hop = math.sin(min(1, t / 0.8) * math.pi * 2)
    y = -abs(hop) * 120 * (1 - k * 0.6)
    sx, sy = (1, 1.06) if y < -20 else (1.06, 0.92) if t > 0.75 and t < 0.95 else (1, 1)
    return rig(), sx, sy, x, y, 1 + y / 400


@seg(3.0, "Breathe, head bob and blink")
def _(t, f):
    return rig(head_dy=breath(t), blink=1.3 < t < 1.42 or 2.4 < t < 2.5), 1, 1, 0, 0, 1


# phrases of (mouth shape, seconds): shapes held 0.08-0.16 s, closed gaps between words,
# a real pause between phrases; the head dips once at the start of each phrase only.
PHRASES = [
    [(1, .10), (2, .14), (1, .08), (0, .08), (1, .10), (2, .12), (2, .10), (1, .08), (0, .12),
     (1, .08), (2, .16), (1, .10), (0, .45)],
    [(1, .08), (2, .12), (1, .10), (0, .06), (2, .14), (1, .08), (0, .10), (1, .10), (2, .12),
     (1, .08), (0, .60)],
]
TALK_TRACK = []  # (start, end, shape, phrase_start)
_t = 0.15
for ph in PHRASES:
    ps = _t
    for shape, d in ph:
        TALK_TRACK.append((_t, _t + d, shape, ps)); _t += d


@seg(round(_t + 0.3, 2), "Talking")
def _(t, f):
    m, ps = 0, None
    for s0, s1, shape, phs in TALK_TRACK:
        if s0 <= t < s1:
            m, ps = shape, phs
    dip = 1 if ps is not None and t - ps < 0.22 else 0
    blink = any(abs(t - (s1 - 0.25)) < 0.06 for s0, s1, shape, phs in TALK_TRACK if shape == 0 and s1 - s0 > 0.4)
    return rig(head_dy=dip, mouth=m, blink=blink and m == 0), 1, 1, 0, 0, 1


def pose_seg(prev, cur, hold_fn=None):
    def fn(t, f):
        if t < 0.27:
            a, sx, sy = squash_swap(t / 0.27, POSE[prev], POSE[cur])
            return a, sx, sy, 0, 0, 1
        if hold_fn:
            return hold_fn(t - 0.27, POSE[cur])
        return POSE[cur], 1, 1, 0, -(1 if ((t - 0.27) % 1.0) > 0.5 else 0) * CELL, 1
    return fn


SEGMENTS.append((1.8, "Idea! (deduce)", pose_seg("idle", "deduce",
                 lambda t, a: (a, 1, 1, 0, -abs(math.sin(t * 7)) * 10 * max(0, 1 - t), 1))))
SEGMENTS.append((1.8, "Thinking", pose_seg("deduce", "think")))
SEGMENTS.append((1.6, "Shock (jump + shake)", pose_seg("think", "shock",
                 lambda t, a: (a, 1, 1.05 if t < 0.25 else 1, math.sin(t * 60) * 6 * max(0, 1 - t * 1.5),
                               -math.sin(min(1, t / 0.5) * math.pi) * 90, 1))))
SEGMENTS.append((1.8, "Laugh (bounces)", pose_seg("shock", "sit",
                 lambda t, a: (a, 1 + 0.04 * abs(math.sin(t * 9)) * (abs(math.sin(t * 9)) < 0.3),
                               1, 0, -abs(math.sin(t * 9)) * 26, 1))))
SEGMENTS.append((1.8, "Reading", pose_seg("sit", "read")))
SEGMENTS.append((1.8, "Investigate", pose_seg("read", "magnify")))
SEGMENTS.append((1.8, "Back to idle", pose_seg("magnify", "idle",
                 lambda t, a: (rig(head_dy=breath(t), blink=0.8 < t < 0.92), 1, 1, 0, 0, 1))))


if __name__ == "__main__":
    out = ROOT / "out" / "holmes_movement_test.mp4"
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}",
                           "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "14", "-pix_fmt", "yuv420p", str(out)],
                          stdin=subprocess.PIPE)
    n = 0
    for sec, text, fn in SEGMENTS:
        for i in range(int(sec * FPS)):
            a, sx, sy, dx, dy, sh = fn(i / FPS, n)
            frame = BG.copy()
            shadow(frame, max(0.4, min(1.1, sh)), dx)
            place(frame, a, sx, sy, dx, dy)
            label(frame, text)
            ff.stdin.write(frame.tobytes())
            n += 1
    ff.stdin.close(); ff.wait()
    print("frames", n, "->", out)
