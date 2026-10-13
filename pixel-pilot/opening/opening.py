"""Series opening (~12.5 s): two-tone navy / black / white silhouettes, one shot per bar,
match cuts between round shapes (moon -> clock -> teacup), title spelled out between
Holmes and the unknown culprit. Pixel art at 216x384, shown at 5x (1080x1920, 30 fps).

python3 opening.py               -> out/opening_raw.mp4 (picture only)
python3 opening.py still 3.8 9.9 -> out/still_<t>.png
"""
import math, pathlib, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
OUT = HERE / "out"
FPS, W, H, AW, AH = 30, 1080, 1920, 216, 384
BPM = 120
BEAT = 60 / BPM
DUR = 12.5

NAVY = (14, 30, 118)
BLUE = (30, 66, 178)
LIGHT = (76, 128, 232)
BLACK = (6, 8, 20)
WHITE = (238, 242, 255)
RED = (226, 30, 42)
GOLD = (236, 186, 70)

TITLE = "像素福尔摩斯"
SUBTITLE = "第一案 · 雨夜书房"
SUSPECTS = (("butler", "管家"), ("secretary", "秘书"), ("nephew", "侄子"))

FONT = ImageFont.truetype("/usr/share/fonts/opentype/unifont/unifont.otf", 16)

# shot boundaries (seconds); every cut sits on a beat
T_MOON, T_CLOCK, T_CUP, T_DOORS, T_MAG, T_TITLE, T_END = 2.0, 3.0, 4.0, 5.0, 7.0, 8.0, 11.0


ease = lambda x: 0.5 - 0.5 * math.cos(math.pi * max(0.0, min(1.0, x)))
clamp = lambda x, a=0.0, b=1.0: max(a, min(b, x))


def rgba(p):
    return Image.open(p).convert("RGBA")


def silhouette(im, col):
    a = np.array(im)
    a[..., :3] = col
    a[..., 3] = np.where(a[..., 3] > 0, 255, 0)
    return Image.fromarray(a, "RGBA")


def text_img(s, color=WHITE, outline=None):
    """Unifont at native 16 px = 16 art pixels tall."""
    w = int(FONT.getlength(s)) + 4
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
    return Image.fromarray(a, "RGBA")


def up(im, s):
    return im.resize((im.width * s, im.height * s), Image.NEAREST)


def paste_c(dst, im, cx, cy):
    dst.alpha_composite(im, (int(round(cx - im.width / 2)), int(round(cy - im.height / 2))))


def camera(art, cx, cy, z):
    """z = screen px per art px (5 = whole 216x384 frame)."""
    vw, vh = W / z, H / z
    x0 = clamp(cx - vw / 2, 0, art.width - vw)
    y0 = clamp(cy - vh / 2, 0, art.height - vh)
    if z == int(z):
        x0, y0 = round(x0 * z) / z, round(y0 * z) / z
    return art.resize((W, H), Image.NEAREST, box=(x0, y0, x0 + vw, y0 + vh))


# ------------------------------------------------------------------ assets
SPR = ROOT / "public" / "sprites"
HOLMES = {p: rgba(SPR / f"holmes_{p}.png") for p in ("idle", "deduce", "magnify")}   # 2 art px per cell
HOLMES_SMALL = {p: im.resize((im.width // 2, im.height // 2), Image.NEAREST) for p, im in HOLMES.items()}
PORT = {n: rgba(ROOT / "case01" / "art" / f"{n}.png") for n, _ in SUSPECTS}

DIGITS = {   # 3x5 pixel font for the door plate
    "2": ["111", "001", "111", "100", "111"],
    "1": ["010", "110", "010", "010", "111"],
    "B": ["110", "101", "110", "101", "110"],
}


def tiny(d, s, x, y, col):
    for ch in s:
        for r, row in enumerate(DIGITS[ch]):
            for c, v in enumerate(row):
                if v == "1":
                    d.point((x + c, y + r), fill=col)
        x += 4


# ------------------------------------------------------------------ 221B facade (tall, the camera tilts)
FAC_H = 600
DOOR = (84, 470, 132, 560)        # x0, y0, x1, y1 of the door opening


def facade(t, door_open=0.0, holmes_in=0.0):
    im = Image.new("RGBA", (AW, FAC_H), NAVY)
    d = ImageDraw.Draw(im)
    d.ellipse((150, 30, 186, 66), fill=WHITE)                       # moon
    for cx, cy, r in ((40, 60, 14), (58, 56, 18), (78, 64, 12)):     # cloud
        d.ellipse((cx - r, cy - r // 2, cx + r, cy + r // 2), fill=BLUE)
    d.rectangle((0, 110, AW, FAC_H), fill=BLUE)                     # building
    d.rectangle((0, 104, AW, 112), fill=BLACK)                      # cornice
    for x in range(4, AW, 12):
        d.rectangle((x, 112, x + 5, 117), fill=BLACK)
    # three storeys of windows; the first-floor centre one is Holmes's
    lit = {(1, 2), (0, 0), (2, 3), (1, 0)}
    for row, y in enumerate((140, 240, 340)):
        for col, x in enumerate((14, 62, 120, 168)):
            win = (x, y, x + 34, y + 62)
            on = (row, col) in lit
            d.rectangle((win[0] - 3, win[1] - 6, win[2] + 3, win[1] - 2), fill=BLACK)   # lintel
            d.rectangle(win, fill=LIGHT if on else BLACK)
            d.line((x + 17, y, x + 17, y + 62), fill=BLUE if on else NAVY, width=2)
            d.line((x, y + 30, x + 34, y + 30), fill=BLUE if on else NAVY, width=2)
            d.rectangle((win[0] - 3, win[3], win[2] + 3, win[3] + 3), fill=BLACK)       # sill
    if holmes_in > 0:   # Holmes steps into the lit window
        s = silhouette(HOLMES_SMALL["idle"].crop((0, 0, 53, 40)), BLACK)
        x = int(120 + 34 - (1 - ease(holmes_in)) * 0 - 34 + 4)
        win = Image.new("RGBA", (34, 62), (0, 0, 0, 0))
        win.alpha_composite(s, (int(-10 + 18 * ease(holmes_in) - 9), 62 - 40))
        im.alpha_composite(win, (120, 240))
        d = ImageDraw.Draw(im)
        d.line((137, 240, 137, 302), fill=BLUE, width=2)
        d.line((120, 270, 154, 270), fill=BLUE, width=2)
    # door: arch, fanlight, plate
    x0, y0, x1, y1 = DOOR
    d.rectangle((x0 - 8, y0 - 30, x1 + 8, y1), fill=BLACK)
    d.pieslice((x0 - 8, y0 - 54, x1 + 8, y0 - 6), 180, 360, fill=BLACK)
    d.pieslice((x0, y0 - 46, x1, y0 - 14), 180, 360, fill=LIGHT)
    for a in range(200, 360, 30):
        r = math.radians(a)
        d.line((108, y0 - 30, 108 + 24 * math.cos(r), y0 - 30 + 16 * math.sin(r)), fill=BLACK)
    if door_open > 0:
        d.rectangle(DOOR, fill=GOLD)
        w = int((x1 - x0) * (1 - ease(door_open)))
        if w > 0:
            d.rectangle((x0, y0, x0 + w, y1), fill=NAVY)
    else:
        d.rectangle(DOOR, fill=NAVY)
        d.rectangle((x0 + 5, y0 + 6, x1 - 5, y0 + 38), outline=BLACK)
        d.rectangle((x0 + 5, y0 + 46, x1 - 5, y1 - 8), outline=BLACK)
        d.ellipse((x1 - 12, y0 + 42, x1 - 8, y0 + 46), fill=GOLD)
    d.rectangle((99, y0 - 12, 117, y0 - 4), fill=WHITE)
    tiny(d, "221B", 101, y0 - 11, BLACK)
    # lamps and railings
    for lx in (40, 176):
        d.rectangle((lx - 1, 480, lx + 1, 580), fill=BLACK)
        d.polygon([(lx - 8, 462), (lx + 8, 462), (lx + 5, 480), (lx - 5, 480)], fill=BLACK)
        d.rectangle((lx - 5, 466, lx + 5, 476), fill=GOLD if int(t * 8) % 7 else LIGHT)
        d.polygon([(lx - 4, 462), (lx + 4, 462), (lx, 456)], fill=BLACK)
    d.rectangle((0, 548, AW, 551), fill=BLACK)
    for x in range(0, AW, 5):
        if not (x0 - 12 < x < x1 + 12):
            d.rectangle((x, 530, x + 1, 560), fill=BLACK)
            d.point((x, 528), fill=BLACK)
    d.rectangle((0, 560, AW, FAC_H), fill=BLACK)
    for i in range(3):   # steps
        d.rectangle((x0 - 14 - 4 * i, y1 + 4 * i, x1 + 14 + 4 * i, y1 + 4 * i + 3), fill=BLUE if i % 2 else NAVY)
    return im


# ------------------------------------------------------------------ round things
CX, CY, R = 108, 176, 44


def moon_shot(t):
    k = (t - T_MOON) / (T_CLOCK - T_MOON)
    im = Image.new("RGBA", (AW, AH), NAVY)
    d = ImageDraw.Draw(im)
    r = 26 + (R - 26) * ease(k)
    cy = CY + 40 * (1 - ease(k))
    d.ellipse((CX - r, cy - r, CX + r, cy + r), fill=WHITE)
    for cx, yy, rr in ((40, 92, 16), (64, 86, 22), (180, 120, 14), (160, 126, 10)):
        dx = int(k * 12) * (1 if cx < 108 else -1)
        d.ellipse((cx - rr + dx, yy - rr // 2, cx + rr + dx, yy + rr // 2), fill=BLUE)
    # rooftops, chimneys, Holmes on the ridge
    roof = [(0, 300), (40, 286), (80, 296), (130, 270), (216, 290), (216, 384), (0, 384)]
    d.polygon(roof, fill=BLACK)
    for x, h in ((24, 30), (150, 40), (170, 26)):
        d.rectangle((x, 280 - h, x + 10, 300), fill=BLACK)
        d.rectangle((x + 2, 276 - h, x + 4, 280 - h), fill=BLACK)
    s = silhouette(HOLMES_SMALL["idle"], BLACK)
    im.alpha_composite(s, (92, 284 - s.height + 8))
    # smoke
    for i in range(5):
        p = (t * 0.8 + i * 0.2) % 1
        d.rectangle((152 + int(p * 10), 238 - int(p * 50), 155 + int(p * 10), 241 - int(p * 50)), fill=BLUE)
    return im


def clock_shot(t):
    k = clamp((t - T_CLOCK) / 0.75)
    im = Image.new("RGBA", (AW, AH), NAVY)
    d = ImageDraw.Draw(im)
    d.ellipse((CX - R - 6, CY - R - 6, CX + R + 6, CY + R + 6), fill=BLACK)
    d.rectangle((CX - 5, CY - R - 16, CX + 5, CY - R - 4), fill=BLACK)
    d.ellipse((CX - 9, CY - R - 26, CX + 9, CY - R - 10), outline=BLACK, width=3)
    d.ellipse((CX - R, CY - R, CX + R, CY + R), fill=WHITE)
    for i in range(12):
        a = 2 * math.pi * i / 12
        r0 = R - (9 if i % 3 == 0 else 6)
        d.line((CX + r0 * math.sin(a), CY - r0 * math.cos(a), CX + (R - 3) * math.sin(a), CY - (R - 3) * math.cos(a)),
               fill=BLACK, width=3 if i % 3 == 0 else 1)
    # hands spin and lock on 9:45
    spin = (1 - (1 - k) ** 3)
    mins = 45 + 60 * 5 * (spin - 1)
    am = 2 * math.pi * mins / 60
    ah = 2 * math.pi * (9 + mins / 60) / 12
    d.line((CX, CY, CX + (R - 10) * math.sin(am), CY - (R - 10) * math.cos(am)), fill=BLACK, width=3)
    d.line((CX, CY, CX + (R - 22) * math.sin(ah), CY - (R - 22) * math.cos(ah)), fill=BLACK, width=5)
    d.ellipse((CX - 3, CY - 3, CX + 3, CY + 3), fill=RED)
    if k >= 1:
        lab = text_img("9:45", RED, BLACK)
        paste_c(im, up(lab, 2), CX, CY + R + 40)
    return im


def cup_shot(t):
    k = (t - T_CUP) / (T_DOORS - T_CUP)
    im = Image.new("RGBA", (AW, AH), NAVY)
    d = ImageDraw.Draw(im)
    d.ellipse((CX - R, CY - R, CX + R, CY + R), fill=WHITE)                    # saucer
    d.ellipse((CX - R + 8, CY - R + 8, CX + R - 8, CY + R - 8), outline=LIGHT, width=2)
    d.ellipse((CX - 30, CY - 30, CX + 30, CY + 30), fill=LIGHT)                # cup rim
    d.rectangle((CX + 28, CY - 6, CX + 46, CY + 6), fill=LIGHT)                # handle
    d.rectangle((CX + 34, CY - 2, CX + 42, CY + 2), fill=NAVY)
    d.ellipse((CX - 25, CY - 25, CX + 25, CY + 25), fill=BLACK)                # tea
    drop_t = 0.5
    if k < drop_t:   # the drop falls away from the camera into the cup
        p = ease(k / drop_t)
        r = 12 - 10 * p
        x, y = CX - 30 * (1 - p), CY - 70 * (1 - p)
        d.ellipse((x - r, y - r * 1.3, x + r, y + r), fill=RED)
    else:
        p = (k - drop_t) / (1 - drop_t)
        for j in range(3):
            rr = 3 + 30 * clamp(p * 1.6 - j * 0.25)
            if 3 < rr < 25:
                d.ellipse((CX - rr, CY - rr, CX + rr, CY + rr), outline=RED, width=1)
        d.ellipse((CX - 3, CY - 3, CX + 3, CY + 3), fill=RED)
    return im


# ------------------------------------------------------------------ three doors
DOORS_X = (14, 82, 150)
DOOR_W, DOOR_Y0, DOOR_Y1 = 52, 150, 290


def suspect_figure(name, col):
    """Bust silhouette continued straight down into a body, so it stands in the doorway."""
    p = PORT[name].crop(PORT[name].getbbox())
    p = p.resize((p.width * 44 // p.width, p.height * 44 // p.width), Image.NEAREST)
    a = np.array(silhouette(p, col))
    from scipy import ndimage
    # the cut-out lost dark jacket fills; close the outline against the bottom edge and fill it
    m = np.vstack([a[..., 3] > 0, np.ones((1, a.shape[1]), bool)])
    m = ndimage.binary_fill_holes(ndimage.binary_closing(m, iterations=2))[:-1]
    a[m] = (*col, 255)
    lab, n = ndimage.label(a[..., 3] > 0)
    if n > 1:   # keep the figure, drop stray backdrop specks
        size = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
        a[np.isin(lab, 1 + np.where(size < 25)[0])] = 0
        a[..., 3] = np.where(ndimage.binary_fill_holes(a[..., 3] > 0), 255, 0)
        a[a[..., 3] > 0, :3] = col
    s = Image.fromarray(a, "RGBA")
    rows = a[int(a.shape[0] * 0.7):, :, 3] > 0
    xs = np.where(rows.any(0))[0]    # shoulder width
    body_h = DOOR_Y1 - DOOR_Y0 - 14 - s.height
    fig = Image.new("RGBA", (s.width, s.height + max(0, body_h)), (0, 0, 0, 0))
    if body_h > 0 and len(xs):
        ImageDraw.Draw(fig).polygon([(xs[0], s.height - 4), (xs[-1], s.height - 4),
                                     (xs[-1] - 3, fig.height), (xs[0] + 3, fig.height)], fill=col)
    fig.alpha_composite(s, (0, 0))
    return fig


FIGS = {n: suspect_figure(n, LIGHT) for n, _ in SUSPECTS}
LABELS = {n: text_img(lab, WHITE, BLACK) for n, lab in SUSPECTS}


def doors_shot(t, mag=None):
    im = Image.new("RGBA", (AW, AH), NAVY)
    d = ImageDraw.Draw(im)
    d.rectangle((0, DOOR_Y1, AW, AH), fill=BLACK)
    d.rectangle((0, 70, AW, 76), fill=BLACK)
    for i, x in enumerate(DOORS_X):   # a hanging lamp over each door; it lights when the door opens
        on = t >= T_DOORS + BEAT * (1 + i)
        lx = x + DOOR_W // 2
        if on:
            d.polygon([(lx - 6, 104), (lx + 6, 104), (lx + 30, DOOR_Y0 - 4), (lx - 30, DOOR_Y0 - 4)], fill=BLUE)
        d.line((lx, 76, lx, 96), fill=BLACK)
        d.polygon([(lx - 8, 104), (lx + 8, 104), (lx + 4, 96), (lx - 4, 96)], fill=BLACK)
        d.rectangle((lx - 3, 104, lx + 3, 106), fill=GOLD if on else BLACK)
    for i, ((name, _), x) in enumerate(zip(SUSPECTS, DOORS_X)):
        t_open = T_DOORS + BEAT * (1 + i)
        k = clamp((t - t_open) / 0.18)
        d.rectangle((x - 3, DOOR_Y0 - 3, x + DOOR_W + 3, DOOR_Y1), fill=BLACK)
        if k > 0:
            d.rectangle((x, DOOR_Y0, x + DOOR_W, DOOR_Y1), fill=BLACK)
            f = FIGS[name]
            im.alpha_composite(f, (x + (DOOR_W - f.width) // 2, DOOR_Y1 - f.height))
            lab = LABELS[name]
            im.alpha_composite(lab, (x + (DOOR_W - lab.width) // 2, DOOR_Y1 + 10))
            d = ImageDraw.Draw(im)
            # the door swings inward: a narrowing white panel on the hinge side
            pw = int(DOOR_W * (1 - k) + 5 * k)
            d.rectangle((x, DOOR_Y0, x + pw, DOOR_Y1), fill=WHITE)
            d.rectangle((x - 3, DOOR_Y1 - 1, x + DOOR_W + 3, DOOR_Y1 + 1), fill=BLACK)
        else:
            d.rectangle((x, DOOR_Y0, x + DOOR_W, DOOR_Y1), fill=WHITE)
            d.ellipse((x + DOOR_W - 10, (DOOR_Y0 + DOOR_Y1) // 2 - 2, x + DOOR_W - 6, (DOOR_Y0 + DOOR_Y1) // 2 + 2), fill=BLACK)
    if mag is not None:
        magnifier(im, *mag)
    return im


def magnifier(im, cx, cy, r):
    d = ImageDraw.Draw(im)
    a = math.radians(45)
    hx, hy = cx + r * math.cos(a), cy + r * math.sin(a)
    d.line((hx, hy, hx + r * 1.4 * math.cos(a), hy + r * 1.4 * math.sin(a)), fill=BLACK, width=max(4, int(r / 3)))
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=WHITE, outline=BLACK, width=max(3, int(r / 7)))


def mag_shot(t):
    k = (t - T_MAG) / (T_TITLE - T_MAG)
    if k < 0.65:
        p = ease(k / 0.65)
        return doors_shot(t, (250 - 190 * p, 150 + 40 * math.sin(p * 3), 26))
    p = ease((k - 0.65) / 0.35)
    return doors_shot(t, (60 + 48 * p, 190 - 14 * p, 26 + 300 * p * p))


# ------------------------------------------------------------------ title: Holmes | the unknown
def culprit_figure(col):
    im = Image.new("RGBA", (60, 150), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle((18, 0, 42, 22), fill=col)            # top hat
    d.rectangle((10, 20, 50, 25), fill=col)
    d.ellipse((17, 24, 43, 52), fill=col)             # head
    d.rectangle((25, 50, 35, 58), fill=col)           # neck
    d.polygon([(4, 66), (14, 58), (46, 58), (56, 66), (60, 150), (0, 150)], fill=col)   # coat
    q = text_img("?", WHITE)
    im.alpha_composite(up(q, 2).crop((0, 0, 24, 40)), (19, 26 - 4))
    return im


CULPRIT = culprit_figure(BLUE)
HOLMES_SIL = silhouette(HOLMES["deduce"], BLACK)
REVEAL_ORDER = (0, 5, 2, 4, 1, 3)
T_LETTERS = T_TITLE + 0.5


def title_shot(t):
    im = Image.new("RGBA", (AW, AH), BLACK)
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, AW // 2, AH), fill=NAVY)
    k = clamp((t - T_TITLE) / 0.25)
    im.alpha_composite(HOLMES_SIL, (AW // 2 - HOLMES_SIL.width + 18, 250 - HOLMES_SIL.height))
    im.alpha_composite(CULPRIT, (AW // 2 + 16, 250 - CULPRIT.height))
    d = ImageDraw.Draw(im)
    # letters appear out of order, one per half beat
    shown = [i for j, i in enumerate(REVEAL_ORDER) if t >= T_LETTERS + j * BEAT / 2]
    glyphs = [up(text_img(ch, WHITE), 2) for ch in TITLE]
    gw = 32
    x0 = AW // 2 - gw * len(TITLE) // 2
    for i in shown:
        im.alpha_composite(glyphs[i], (x0 + i * gw - 4, 270))
    if t >= T_LETTERS + 3.5 * BEAT:
        sub = text_img(SUBTITLE, GOLD)
        paste_c(im, sub, AW // 2, 330)
    # the white flash closes into a seam down the middle
    seam_w = int((AW / 2) * (1 - ease(k)))
    d = ImageDraw.Draw(im)
    d.rectangle((AW // 2 - seam_w - 1, 0, AW // 2 + seam_w, AH), fill=WHITE)
    return im


# ------------------------------------------------------------------ frame
def frame_at(t):
    if t < T_MOON:   # tilt up the facade, Holmes appears at the window
        k = t / T_MOON
        art = facade(t, holmes_in=clamp((t - 1.4) / 0.4))
        cy = FAC_H - AH / 2 - (FAC_H - AH) * ease(k * 1.05)
        return camera(art, AW / 2, cy, 5)
    if t < T_CLOCK:
        return up(moon_shot(t), 5)
    if t < T_CUP:
        return up(clock_shot(t), 5)
    if t < T_DOORS:
        return up(cup_shot(t), 5)
    if t < T_MAG:
        k = (t - T_DOORS) / (T_MAG - T_DOORS)
        return camera(doors_shot(t), AW / 2, AH / 2, 5 + 0.5 * ease(k))
    if t < T_TITLE:
        return camera(mag_shot(t), AW / 2, AH / 2, 5.5)
    if t < T_END:
        return up(title_shot(t), 5)
    # back to the door; push in, the door opens on warm light, white out
    k = (t - T_END) / (DUR - T_END)
    art = facade(t, door_open=clamp((t - (T_END + 1.0)) / 0.3))
    z = 5 + 7 * ease(k * 1.1)
    cx, cy = 108, FAC_H - AH / 2 + (515 - (FAC_H - AH / 2)) * ease(k * 1.1)
    f = camera(art, cx, cy, z)
    w = clamp((t - (DUR - 0.25)) / 0.25)
    if w > 0:
        f.alpha_composite(Image.new("RGBA", f.size, (*WHITE, int(255 * w))))
    return f


def render(path, t0=0.0, t1=DUR):
    OUT.mkdir(exist_ok=True)
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                          "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "16", "-preset", "medium",
                          "-pix_fmt", "yuv420p", str(path)], stdin=subprocess.PIPE)
    for i in range(int(t0 * FPS), int(t1 * FPS)):
        p.stdin.write(frame_at(i / FPS).convert("RGB").tobytes())
    p.stdin.close()
    p.wait()


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "still":
        OUT.mkdir(exist_ok=True)
        for s in sys.argv[2:]:
            frame_at(float(s)).convert("RGB").save(OUT / f"still_{s}.png")
    else:
        render(OUT / "opening_raw.mp4")
