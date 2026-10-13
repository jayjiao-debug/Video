"""Case 01 · 雨夜书房 — vertical (1080x1920, 30 fps) immersive detective short.

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


# ------------------------------------------------------------------ HUD
CLUES = [  # (collect time, label)
    (KY[4], "9:45"), (KY[5], "9:30雨"), (KY[6], "毒杯"), (KY[13], "干伞"), (KY[14], "遗嘱"),
]


def hud(frame, t, show=True):
    if not show:
        return
    d = ImageDraw.Draw(frame)
    d.rectangle((0, 0, W, 132), fill=(16, 12, 24, 230))
    d.rectangle((0, 132, W, 137), fill=(52, 40, 66, 255))
    frame.alpha_composite(text_img("第一案 · 雨夜书房", 3, GOLD), (36, 18))
    frame.alpha_composite(text_img("线索", 3, CREAM), (36, 72))
    x = 150
    for i, (tc, lab) in enumerate(CLUES):
        got = t >= tc
        box = (x, 66, x + 166, 124)
        if got:
            pop = clamp((t - tc) / 0.25)
            col = (60, 44, 24) if pop >= 1 else (232, 182, 72)
            d.rectangle(box, fill=col, outline=GOLD)
            im = text_img(lab, 3, CREAM)
            frame.alpha_composite(im, (x + 83 - im.width // 2, 68))
        else:
            d.rectangle(box, outline=(80, 64, 96))
            im = text_img("?", 3, (110, 92, 130), None)
            frame.alpha_composite(im, (x + 83 - im.width // 2, 68))
        x += 182


def wrap(txt, n=15):
    """Split into rows of <= n chars, breaking after punctuation nearest the middle."""
    if len(txt) <= n:
        return [txt]
    best = None
    for i, ch in enumerate(txt[:-1]):
        if ch in "，。：？！":
            cost = abs((i + 1) - len(txt) / 2) + (100 if max(i + 1, len(txt) - i - 1) > n else 0)
            if best is None or cost < best[0]:
                best = (cost, i + 1)
    cut = best[1] if best and best[0] < 100 else n
    return [txt[:cut]] + wrap(txt[cut:], n)


def subtitle(frame, t):
    idx = max([i for i in range(len(S)) if t >= S[i] - 0.05] or [-1])
    if idx < 0 or t > E[idx] + 0.6:
        return
    txt = LINES[idx]["t"]
    speaker = None
    if "：" in txt[:4]:
        speaker, txt = txt.split("：", 1)
    key = LINES[idx]["k"]
    # wrap at ~13 full-width chars per row (scale 4 -> 64 px a char)
    rows = wrap(txt)
    y = 1580
    d = ImageDraw.Draw(frame)
    d.rectangle((0, y - 30, W, y + 70 * len(rows) + 30), fill=(14, 10, 20, 205))
    if speaker:
        tag = text_img(speaker, 3, INK, None)
        d.rectangle((40, y - 82, 40 + tag.width + 30, y - 30), fill=GOLD)
        frame.alpha_composite(tag, (55, y - 78))
    for r in rows:
        im = text_img(r, 4, CREAM, INK, spans=[(key, GOLD)] if key in r else [])
        frame.alpha_composite(im, (W // 2 - im.width // 2, y))
        y += 70


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


# ------------------------------------------------------------------ shots
def shot_cold(t):
    f = Image.new("RGBA", (W, H), (6, 4, 10, 255))
    fl = max(0, 1 - abs(t - (KY[0] + 0.1)) / 0.12) + 0.6 * max(0, 1 - abs(t - (KY[0] + 0.45)) / 0.08)
    door = up(door_art(0), 5)
    f.alpha_composite(door)
    darken(f, 0.86 - 0.7 * fl)
    clock = text_img("22:00", 6, CREAM)
    if t > 0.3:
        paste_c(f, clock, W / 2, 420, ramp(t, 0.3, 0.4))
    return f


def shot_door(t):
    t0 = S[1]
    k = ease((t - t0) / 1.4)
    cx, cy, z = cam_path(t, [(t0, 108, 192, 5), (t0 + 1.4, 108, 200, 5), (KY[1] - 0.05, 105, 215, 6)])
    f = camera(study_at(t), cx, cy, z).convert("RGBA")
    darken(f, 0.25)
    if k < 1:
        f.alpha_composite(up(door_art(k), 5))
    if t >= KY[1]:
        f = camera(study_at(t), 100, 224, 10).convert("RGBA")
        darken(f, 0.15)
        dx, dy = shake(t, KY[1], 14)
        f = f.transform(f.size, Image.AFFINE, (1, 0, -dx, 0, 1, -dy))
        red = Image.new("RGBA", f.size, (120, 0, 0, int(80 * max(0, 1 - (t - KY[1]) / 1.2))))
        f.alpha_composite(red)
    return f


def shot_intro(t):
    f = camera(study_at(t), 108, 200, 5).convert("RGBA")
    darken(f, 0.55)
    pose = "deduce" if t > S[3] + 0.3 else "idle"
    holmes(f, t, pose, W / 2, 1540, 9, talking=True, enter=S[2], leave=E[3] + 0.05)
    if S[2] + 0.3 < t < E[2] + 0.2:
        tag(f, "福尔摩斯", W / 2, 600, t=t - S[2] - 0.3)
    if t > KY[3] - 0.2:
        tt = t - (KY[3] - 0.2)
        stamp(f, "这次 你是侦探", W / 2, 520, tt, GOLD, 5, -6)
    return f


def shot_clock(t):
    t0 = S[4]
    cx, cy, z = cam_path(t, [(t0, 108, 230, 5), (t0 + 0.7, 150, 300, 10)])
    f = camera(study_at(t), cx, cy, z).convert("RGBA")
    if t > KY[4] - 0.25:
        k = ramp(t, KY[4] - 0.25, 0.25)
        darken(f, 0.5 * k)
        big = up(CLOCK, 10)
        paste_c(f, big, W / 2, 820, 1.0 if k >= 1 else k)
        tag(f, "9:45", W / 2, 1280, RED, WHITE, 5, t - KY[4])
    mx = W / 2 + 160 * math.sin(t * 2.2)
    paste_c(f, up(MAG, 5), mx + 120, 880 + 60 * math.cos(t * 1.7))
    return f


def shot_window(t):
    t0 = S[5]
    cx, cy, z = cam_path(t, [(t0, 150, 300, 10), (t0 + 0.6, 106, 110, 6)])
    fl = max(0, 1 - abs(t - (t0 + 1.0)) / 0.1)
    f = camera(study_at(t, flash=fl), cx, cy, z).convert("RGBA")
    if t > KY[5]:
        tag(f, "9:30 开始下雨", W / 2, 1300, SKY, INK, 4, t - KY[5])
    return f


def shot_tea(t):
    t0 = S[6]
    cx, cy, z = cam_path(t, [(t0, 106, 110, 6), (t0 + 0.6, 118, 236, 10)])
    f = camera(study_at(t), cx, cy, z).convert("RGBA")
    # teacup on the left of the frame, teapot on the right (screen coords at the rest framing)
    d = ImageDraw.Draw(f)
    if t > t0 + 0.9:
        if (t * 3) % 1 < 0.7:
            d.rectangle((30, 820, 260, 1010), outline=RED, width=8)
        tag(f, "茶杯：有毒", 200, 740, RED, WHITE, 3, t - t0 - 0.9)
    if t > t0 + 1.9:
        d.rectangle((760, 840, 1075, 1110), outline=GREEN, width=8)
        tag(f, "茶壶：没毒", 880, 760, GREEN, INK, 3, t - t0 - 1.9)
    if t > KY[6]:
        tag(f, "倒茶之后才下的毒", W / 2, 1320, GOLD, INK, 4, t - KY[6])
    return f


def suspects_bg(t):
    f = camera(study_at(t), 108, 192, 5).convert("RGBA")
    darken(f, 0.82)
    return f


SUS = [("butler", "管家"), ("secretary", "秘书"), ("nephew", "侄子")]


def shot_three(t):
    f = suspects_bg(t)
    for i, (n, lab) in enumerate(SUS):
        tt = t - (S[7] + 0.15 * i)
        if tt > 0:
            y = 800 + (1 - ease(tt / 0.3)) * 1200
            portrait_card(f, n, 200 + i * 340, y, 2, "？", sil=True)
    return f


def shot_suspect(t, i):
    f = suspects_bg(t)
    n, lab = SUS[i]
    li = 8 + i
    k = ease((t - S[li]) / 0.3)
    # the others small and dim at the top
    for j, (m, l2) in enumerate(SUS):
        if j != i:
            portrait_card(f, m, 180 + j * 360, 320, 1, l2, sil=False, alpha=0.5)
    portrait_card(f, n, W / 2, 330 + 520 * k, 5, None)
    lab_im = text_img(lab, 5, GOLD)
    paste_c(f, lab_im, W / 2, 1290)
    if i == 0 and t > KY[8]:
        stamp(f, "厨娘作证 ✓", W / 2 + 120, 1150, t - KY[8], GREEN, 4)
    if i == 1 and t > KY[9]:
        stamp(f, "打字声没停 ✓", W / 2 + 100, 1150, t - KY[9], GREEN, 4)
    if i == 1:   # typewriter clacks drawn as little sparks
        if (t * 9) % 1 < 0.5 and S[9] < t < E[9]:
            tag(f, "嗒嗒嗒", 860, 520, CREAM, INK, 2)
    if i == 2 and t > KY[10]:
        stamp(f, "冒雨 · 10点到家？", W / 2, 1150, t - KY[10], SKY, 3, -4)
    return f


def shot_hall(t):
    t0 = S[11]
    cx, cy, z = cam_path(t, [(t0, 108, 192, 5), (t0 + 1.2, 54, 262, 10)])
    f = camera(hall_at(t), cx, cy, z).convert("RGBA")
    d = ImageDraw.Draw(f)
    if t > S[12] + 0.2:
        d.rectangle((395, 600, 530, 1320), outline=SKY, width=8)
        tag(f, "医生的伞 · 湿", 330, 520, SKY, INK, 3, t - S[12] - 0.2)
    if t > KY[13]:
        d.rectangle((535, 600, 690, 1300), outline=GOLD, width=8)
        tag(f, "侄子的伞 · 干！", 800, 760, GOLD, INK, 3, t - KY[13])
        mx, my = 600 + 30 * math.sin(t * 3), 980
        paste_c(f, up(MAG, 6), mx + 90, my + 90)
    return f


def will_card(f, t, t_key, glow=False):
    big = up(WILL, 8)
    paste_c(f, big, W / 2, 900)
    x0, y0 = W / 2 - big.width / 2, 900 - big.height / 2
    head = text_img("遗嘱", 6, INK, None)
    f.alpha_composite(head, (int(W / 2 - head.width / 2), int(y0 + 40)))
    for k, (s, col) in enumerate([("明天起", INK), ("取消侄子的", RED), ("继承权", RED)]):
        if t >= t_key - 0.6 + 0.25 * k or glow:
            im = text_img(s, 5, col, None)
            f.alpha_composite(im, (int(x0 + 70), int(y0 + 210 + 110 * k)))
    if t >= t_key or glow:
        d = ImageDraw.Draw(f)
        d.rectangle((x0 + 70, y0 + 420, x0 + 70 + 5 * 16 * 5, y0 + 432), fill=RED)


def shot_will(t):
    f = camera(study_at(t), 112, 238, 10).convert("RGBA")
    darken(f, 0.6)
    will_card(f, t, KY[14])
    return f


def shot_pause(t):
    f = suspects_bg(t)
    darken(f, 0.3)
    if t < KY[15] - 0.1:
        holmes(f, t, "idle", W / 2, 1500, 8, talking=True, enter=S[15])
        return f
    title = text_img("凶手是谁？", 7, GOLD)
    paste_c(f, title, W / 2, 330 + (1 - ramp(t, KY[15], 0.25)) * -200)
    for i, (n, lab) in enumerate(SUS):
        portrait_card(f, n, 190 + i * 350, 720, 2, f"{i + 1} {lab}")
    # clue recap
    d = ImageDraw.Draw(f)
    y = 1010
    for i, (tc, lab) in enumerate(CLUES):
        im = text_img(f"· {lab}", 3, CREAM)
        f.alpha_composite(im, (150, y + i * 62))
    hold0 = E[15]
    if t > hold0:
        n = 5 - int(t - hold0)
        if n >= 1:
            num = text_img(str(n), 12, RED)
            s = 1 + 0.25 * (1 - ((t - hold0) % 1) / 0.2) if ((t - hold0) % 1) < 0.2 else 1
            num = num.resize((int(num.width * s), int(num.height * s)), Image.NEAREST)
            paste_c(f, num, 860, 1150)
        if (t * 2) % 1 < 0.6:
            im = text_img("⏸ 暂停 · 评论区告诉我", 3, WHITE)
            paste_c(f, im, W / 2, 1420)
    return f


def shot_reveal(t):
    f = suspects_bg(t)
    darken(f, 0.2)
    title = text_img("答案揭晓", 8, GOLD)
    paste_c(f, title, W / 2, 520)
    holmes(f, t, "deduce", W / 2, 1500, 9, enter=S[16])
    flash(f, 1 - (t - S[16]) / 0.3)
    return f


def mini_holmes(f, t, pose="idle"):
    holmes(f, t, pose, 170, 1540, 5, talking=True)


def shot_r1(t):
    # top: rain from 9:30; bottom: the umbrella that should be wet
    f = Image.new("RGBA", (W, H), (14, 10, 20, 255))
    top = camera(study_at(t), 106, 110, 10).crop((0, 300, W, 1000))
    f.alpha_composite(top.convert("RGBA"), (0, 150))
    tag(f, "9:30 开始下雨", W / 2, 260, SKY, INK, 4, t - S[17])
    bot = camera(hall_at(t, wet=False), 60, 262, 10).crop((0, 560, W, 1260)).convert("RGBA")
    f.alpha_composite(bot, (0, 870))
    if t > KY[17] - 0.4:
        # ghost drips: what we'd expect
        d = ImageDraw.Draw(f)
        for i in range(5):
            k = (t * 1.4 + i / 5) % 1
            x = 540 + (i - 2) * 50
            d.rectangle((x, 1000 + k * 380, x + 10, 1020 + k * 380), fill=(140, 200, 245, 160))
        tag(f, "冒雨回来 → 伞应该是湿的", W / 2, 920, CREAM, INK, 3, t - KY[17] + 0.4)
    mini_holmes(f, t)
    return f


def shot_r2(t):
    f = Image.new("RGBA", (W, H), (14, 10, 20, 255))
    bot = camera(hall_at(t, wet=True), 60, 262, 10).crop((0, 300, W, 1100)).convert("RGBA")
    f.alpha_composite(bot, (0, 200))
    stamp(f, "干的", 640, 720, t - S[18], RED, 6)
    if t > KY[18] - 0.3:
        # timeline bar
        d = ImageDraw.Draw(f)
        y = 1200
        d.rectangle((90, y, 990, y + 10), fill=CREAM)
        marks = [(0.12, "到家", GOLD), (0.42, "9:30 下雨", SKY), (0.68, "9:40 送茶", CREAM), (0.88, "9:45", RED)]
        for i, (u, lab, col) in enumerate(marks):
            if t > KY[18] - 0.3 + 0.25 * i:
                x = 90 + u * 900
                d.rectangle((x - 8, y - 20, x + 8, y + 30), fill=col)
                im = text_img(lab, 3, col)
                f.alpha_composite(im, (int(x - im.width / 2), y + 46 if i % 2 else y - 80))
        if t > KY[18]:
            portrait_card(f, "nephew", 90 + 0.12 * 900, y - 230, 1)
    mini_holmes(f, t)
    return f


def shot_r3(t):
    t0 = S[19]
    f = camera(study_at(t, poison=(t - (KY[19] - 0.5)) / 0.5 if t > KY[19] - 0.5 else None), 100, 232, 10).convert("RGBA")
    darken(f, 0.35)
    # the nephew sneaking in from the right, as a dark shape
    k = ease((t - t0) / 1.2)
    portrait_card(f, "nephew", W + 200 - 520 * k, 700, 3, None, sil=t < KY[19] - 0.8)
    mini_holmes(f, t)
    return f


def shot_r4(t):
    f = camera(study_at(t), 112, 238, 10).convert("RGBA")
    darken(f, 0.7)
    will_card(f, t, 0, glow=True)
    dx, dy = shake(t, S[20] + 0.3, 10, 0.5)
    f = f.transform(f.size, Image.AFFINE, (1, 0, -dx, 0, 1, -dy))
    mini_holmes(f, t)
    return f


def shot_culprit(t):
    f = suspects_bg(t)
    portrait_card(f, "nephew", W / 2, 760, 5, "侄子", glow=(60, 20, 26) if t > KY[21] else None)
    if t > KY[21]:
        stamp(f, "凶手", W / 2 + 60, 980, t - KY[21], (255, 72, 72), 9)
        dx, dy = shake(t, KY[21], 22)
        f = f.transform(f.size, Image.AFFINE, (1, 0, -dx, 0, 1, -dy))
    holmes(f, t, "deduce", 190, 1540, 5)
    return f


def shot_outro(t):
    f = suspects_bg(t)
    darken(f, 0.1)
    pose = "sit" if t < S[22] + 1.6 else "idle"
    holmes(f, t, pose, W / 2, 1450, 9, talking=pose == "idle")
    if t > KY[22] - 0.2:
        im = text_img("第二案 · 敬请期待", 4, GOLD)
        paste_c(f, im, W / 2, 380, ramp(t, KY[22] - 0.2, 0.3))
    return f


SHOTS = [
    (0, shot_cold), (S[1], shot_door), (S[2], shot_intro), (S[4], shot_clock), (S[5], shot_window),
    (S[6], shot_tea), (S[7], shot_three), (S[8], lambda t: shot_suspect(t, 0)),
    (S[9], lambda t: shot_suspect(t, 1)), (S[10], lambda t: shot_suspect(t, 2)), (S[11], shot_hall),
    (S[14], shot_will), (S[15], shot_pause), (S[16], shot_reveal), (S[17], shot_r1), (S[18], shot_r2),
    (S[19], shot_r3), (S[20], shot_r4), (S[21], shot_culprit), (S[22], shot_outro),
]
NO_HUD = {shot_cold, shot_door, shot_reveal}


def frame_at(t):
    fn = [f for t0, f in SHOTS if t >= t0 - 0.12][-1]   # cut a hair before the line
    f = fn(t)
    hud(f, t, show=fn not in NO_HUD and t < S[16])
    subtitle(f, t)
    # cut flash: 2 frames of white on every shot change
    for t0, _ in SHOTS[1:]:
        if 0 <= t - (t0 - 0.12) < 2 / FPS:
            flash(f, 0.35)
    return f


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "still":
        for i, s in enumerate(sys.argv[2:]):
            frame_at(float(s)).convert("RGB").save(HERE / "out" / f"still_{i}.png")
        sys.exit()
    a, b = (float(sys.argv[1]), float(sys.argv[2])) if len(sys.argv) > 2 else (0, DUR)
    out = HERE / "out" / ("case01_raw.mp4" if len(sys.argv) <= 2 else "case01_part.mp4")
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                           "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "16", "-preset", "medium",
                           "-pix_fmt", "yuv420p", str(out)], stdin=subprocess.PIPE)
    n0, n1 = int(a * FPS), int(b * FPS)
    for n in range(n0, n1):
        ff.stdin.write(frame_at(n / FPS).convert("RGB").tobytes())
        if n % 300 == 0:
            print("frame", n, "/", n1, flush=True)
    ff.stdin.close(); ff.wait()
    print("->", out)
