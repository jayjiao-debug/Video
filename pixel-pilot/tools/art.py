"""Pixel-art asset library for the pilot, drawn in code at native resolution (480x270).

Every sprite is drawn with aliased shapes on a tiny canvas, then gets an automatic
1 px outline. One palette for everything. Output: public/sprites/*.png, shown at
exactly 4x in the film (1920x1080) with nearest-neighbour scaling.
"""
import math, pathlib, random
import numpy as np
from PIL import Image, ImageDraw

OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "sprites"
OUT.mkdir(parents=True, exist_ok=True)
W, H = 480, 270

P = dict(
    ink=(22, 17, 30), night=(18, 22, 44), night2=(28, 33, 64), star=(236, 230, 200),
    moon=(250, 236, 180), moon2=(226, 204, 140),
    wall=(43, 34, 56), wall2=(51, 41, 66), wall3=(36, 28, 47),
    wood=(92, 58, 40), wood2=(70, 44, 32), wood3=(118, 78, 52), wood4=(52, 33, 26),
    floor=(40, 28, 24), floor2=(48, 34, 28),
    curtain=(122, 38, 48), curtain2=(92, 26, 38),
    gold=(232, 182, 72), gold2=(176, 124, 44), cream=(244, 230, 196),
    skin=(242, 196, 158), skin2=(214, 156, 122), hair=(40, 32, 52), hair2=(70, 58, 92),
    hood=(226, 120, 58), hood2=(180, 84, 42), hood3=(244, 158, 96),
    phone=(30, 34, 44), screen=(120, 220, 255), screen_off=(44, 52, 66),
    red=(214, 64, 64), teal=(52, 148, 140), teal2=(34, 104, 100), blue=(70, 100, 170),
    green=(90, 160, 90), purple=(120, 80, 150), paper=(236, 226, 200), paper2=(200, 186, 158),
    lamp=(60, 120, 90), lamp2=(40, 86, 64), mug=(200, 80, 70), white=(255, 255, 255),
)
A = lambda c, a=255: (*P[c], a)


def canvas(w, h):
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    return im, ImageDraw.Draw(im)


def outline(im, color="ink"):
    a = np.array(im)
    mask = a[..., 3] > 0
    grow = np.zeros_like(mask)
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        grow |= np.roll(np.roll(mask, dy, 0), dx, 1)
    edge = grow & ~mask
    a[edge] = A(color)
    return Image.fromarray(a)


def pad(im, n=1):
    out = Image.new("RGBA", (im.width + 2 * n, im.height + 2 * n), (0, 0, 0, 0))
    out.paste(im, (n, n))
    return out


def save(im, name):
    im.save(OUT / f"{name}.png")


def dither_rect(d, box, c1, c2, level):
    """Ordered 2x2 dither between two colours; level 0..4."""
    x0, y0, x1, y1 = box
    pat = [(0, 0), (1, 1), (1, 0), (0, 1)]
    for y in range(y0, y1):
        for x in range(x0, x1):
            on = (x % 2, y % 2) in pat[:level]
            d.point((x, y), fill=c2 if on else c1)


# ---------------------------------------------------------------- stage (back)
def stage():
    rnd = random.Random(7)
    im, d = canvas(W, H)
    # wall with vertical wallpaper stripes
    d.rectangle((0, 0, W, 178), fill=A("wall"))
    for x in range(0, W, 16):
        d.rectangle((x, 0, x + 1, 178), fill=A("wall2"))
        for y in range(6, 178, 16):
            d.point((x + 8, y), fill=A("wall2"))
    # darker top band (ceiling shadow), dithered
    dither_rect(d, (0, 0, W, 10), A("wall3"), A("wall"), 2)
    d.rectangle((0, 0, W, 4), fill=A("wall3"))
    # wainscot
    d.rectangle((0, 178, W, 212), fill=A("wood2"))
    d.rectangle((0, 178, W, 180), fill=A("wood3"))
    for x in range(8, W, 40):
        d.rectangle((x, 186, x + 31, 206), outline=A("wood4"))
        d.line((x + 1, 187, x + 30, 187), fill=A("wood"))
    # floor planks
    d.rectangle((0, 212, W, H), fill=A("floor"))
    for y in range(216, H, 9):
        d.line((0, y, W, y), fill=A("floor2"))
        off = (y * 37) % 60
        for x in range(off, W, 60):
            d.line((x, y + 1, x, y + 8), fill=A("wood4"))

    # window with night sky
    wx0, wy0, wx1, wy1 = 46, 34, 128, 128
    d.rectangle((wx0, wy0, wx1, wy1), fill=A("night"))
    dither_rect(d, (wx0, wy0 + 50, wx1, wy1), A("night"), A("night2"), 2)
    d.ellipse((96, 46, 112, 62), fill=A("moon"))
    d.ellipse((101, 46, 115, 59), fill=A("night"))  # crescent
    for _ in range(14):
        sx, sy = rnd.randrange(wx0 + 3, wx1 - 3), rnd.randrange(wy0 + 3, wy0 + 70)
        d.point((sx, sy), fill=A("star"))
    # distant city silhouette
    x = wx0
    while x < wx1:
        bw, bh = rnd.randrange(6, 14), rnd.randrange(10, 30)
        d.rectangle((x, wy1 - bh, x + bw, wy1), fill=(14, 16, 30, 255))
        for _ in range(bw * bh // 40):
            d.point((rnd.randrange(x + 1, x + bw), rnd.randrange(wy1 - bh + 2, wy1)), fill=A("gold2"))
        x += bw + 1
    # frame + cross bars
    d.rectangle((wx0 - 4, wy0 - 4, wx1 + 4, wy1 + 4), outline=A("wood"), width=4)
    d.rectangle((wx0 - 4, wy0 - 4, wx1 + 4, wy1 + 4), outline=A("ink"))
    d.rectangle((wx0 - 1, wy0 - 1, wx1 + 1, wy1 + 1), outline=A("wood4"))
    d.rectangle(((wx0 + wx1) // 2 - 1, wy0, (wx0 + wx1) // 2 + 1, wy1), fill=A("wood"))
    d.rectangle((wx0, (wy0 + wy1) // 2 - 1, wx1, (wy0 + wy1) // 2 + 1), fill=A("wood"))
    d.rectangle((wx0 - 8, wy1 + 4, wx1 + 8, wy1 + 8), fill=A("wood3"))
    d.line((wx0 - 8, wy1 + 8, wx1 + 8, wy1 + 8), fill=A("ink"))
    # curtains
    for cx, flip in ((wx0 - 16, 0), (wx1 + 4, 1)):
        d.rectangle((cx, wy0 - 10, cx + 12, wy1 + 22), fill=A("curtain"))
        for k in range(3):
            d.line((cx + 3 + k * 4, wy0 - 10, cx + 3 + k * 4, wy1 + 22), fill=A("curtain2"))
        d.rectangle((cx, wy0 - 10, cx + 12, wy1 + 22), outline=A("ink"))
    d.rectangle((wx0 - 22, wy0 - 14, wx1 + 22, wy0 - 11), fill=A("gold2"))

    # bookshelf
    bx0, by0, bx1, by1 = 352, 46, 444, 178
    d.rectangle((bx0, by0, bx1, by1), fill=A("wood4"))
    d.rectangle((bx0, by0, bx1, by1), outline=A("wood"), width=3)
    for sy in (by0 + 3 + 32, by0 + 3 + 64, by0 + 3 + 96):
        d.rectangle((bx0, sy, bx1, sy + 2), fill=A("wood"))
    cols = ["red", "teal", "blue", "green", "purple", "gold2", "paper2", "curtain", "teal2"]
    for row in range(4):
        base = by0 + 3 + 32 * (row + 1) - 1
        x = bx0 + 4
        while x < bx1 - 6:
            bw = rnd.choice((4, 5, 5, 6, 7))
            bh = rnd.randrange(18, 27)
            if rnd.random() < 0.12:
                x += bw; continue
            c = rnd.choice(cols)
            d.rectangle((x, base - bh, x + bw - 1, base), fill=A(c))
            d.line((x, base - bh, x, base), fill=A("ink"))
            if bh > 21:
                d.line((x + 1, base - bh + 4, x + bw - 2, base - bh + 4), fill=A("gold"))
            x += bw
    d.rectangle((bx0 - 1, by0 - 1, bx1 + 1, by1 + 1), outline=A("ink"))
    # framed picture on the wall
    d.rectangle((150, 50, 186, 78), fill=A("gold2"))
    d.rectangle((153, 53, 183, 75), fill=A("teal2"))
    d.polygon([(154, 74), (164, 60), (172, 70), (176, 64), (182, 74)], fill=A("teal"))
    d.rectangle((150, 50, 186, 78), outline=A("ink"))
    save(im, "stage")


def light():
    """Warm lamp light pool, three hard bands (pixel-art lighting), drawn additively."""
    im, d = canvas(W, H)
    cx, cy = 176, 150
    for r, a in ((150, 14), (100, 22), (58, 34)):
        d.ellipse((cx - r * 1.4, cy - r, cx + r * 1.4, cy + r), fill=(255, 196, 120, a))
    # vignette (dark corners), banded
    v = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    vd = ImageDraw.Draw(v)
    for i, a in enumerate((70, 45, 25)):
        m = 30 + i * 30
        vd.rectangle((0, 0, W, H), outline=(8, 6, 16, a), width=m)
    save(im, "light")
    save(v, "vignette")


# ---------------------------------------------------------------- desk (front)
def desk():
    im, d = canvas(W, H)
    x0, x1, top = 128, 352, 168
    d.rectangle((x0, top, x1, top + 6), fill=A("wood3"))
    d.line((x0, top, x1, top), fill=A("cream"))
    d.rectangle((x0 + 6, top + 7, x1 - 6, 222), fill=A("wood"))
    d.rectangle((x0 + 6, top + 7, x1 - 6, top + 9), fill=A("wood4"))
    for dx0 in (x0 + 14, x1 - 80):
        d.rectangle((dx0, top + 16, dx0 + 64, top + 34), outline=A("wood4"))
        d.rectangle((dx0 + 28, top + 23, dx0 + 36, top + 26), fill=A("gold"))
    d.rectangle((x0 + 6, top + 40, x1 - 6, 222), fill=A("wood2"))
    for lx in (x0 + 8, x1 - 14):
        d.rectangle((lx, top + 40, lx + 6, 236), fill=A("wood2"))
    im = outline(im)
    # lamp on the desk (left)
    d = ImageDraw.Draw(im)
    lx = 150
    d.rectangle((lx - 10, top - 3, lx + 10, top), fill=A("lamp2"))
    d.rectangle((lx - 1, top - 30, lx + 1, top - 3), fill=A("gold2"))
    d.polygon([(lx - 16, top - 30), (lx - 8, top - 46), (lx + 8, top - 46), (lx + 16, top - 30)], fill=A("lamp"))
    d.line((lx - 8, top - 44, lx + 6, top - 44), fill=(110, 180, 140, 255))
    d.line((lx - 16, top - 30, lx + 16, top - 30), fill=A("cream"))
    # mug (right of center)
    mx = 318
    d.rectangle((mx, top - 12, mx + 10, top - 1), fill=A("mug"))
    d.rectangle((mx + 11, top - 9, mx + 14, top - 4), outline=A("mug"))
    d.line((mx + 1, top - 11, mx + 9, top - 11), fill=(120, 60, 40, 255))
    # stack of books (left of center)
    for i, c in enumerate(("teal", "red", "blue")):
        d.rectangle((182 + i, top - 6 - i * 5, 208 - i, top - 2 - i * 5), fill=A(c))
        d.line((182 + i, top - 4 - i * 5, 208 - i, top - 4 - i * 5), fill=A("paper"))
    im = outline(im)
    save(im, "desk")


# ---------------------------------------------------------------- narrator
def head(pose):
    im, d = canvas(22, 22)
    # face
    d.rectangle((3, 6, 18, 19), fill=A("skin"))
    d.rectangle((3, 17, 18, 19), fill=A("skin2"))
    d.rectangle((2, 10, 3, 14), fill=A("skin"))
    d.rectangle((18, 10, 19, 14), fill=A("skin"))
    # hair
    d.rectangle((3, 2, 18, 7), fill=A("hair"))
    d.polygon([(3, 7), (8, 7), (6, 10), (3, 11)], fill=A("hair"))
    d.polygon([(10, 7), (18, 7), (18, 11), (15, 9)], fill=A("hair"))
    d.line((6, 3, 12, 3), fill=A("hair2"))
    d.line((12, 2, 15, 0), fill=A("hair"))  # cowlick
    d.point((15, 0), fill=A("hair"))
    # eyes
    if pose in ("sit", "read"):
        d.line((6, 13, 8, 13), fill=A("ink"))
        d.line((13, 13, 15, 13), fill=A("ink"))
    elif pose == "blink":
        d.line((6, 12, 8, 12), fill=A("ink"))
        d.line((13, 12, 15, 12), fill=A("ink"))
    elif pose == "look":
        for ex in (6, 13):
            d.rectangle((ex, 11, ex + 2, 13), fill=A("white"))
            d.rectangle((ex + 1, 11, ex + 2, 13), fill=A("ink"))
    elif pose == "shock":
        for ex in (5, 12):
            d.rectangle((ex, 10, ex + 3, 13), fill=A("white"))
            d.rectangle((ex + 1, 11, ex + 2, 12), fill=A("ink"))
    # cheeks + mouth
    d.point((5, 15), fill=(232, 150, 140, 255)); d.point((16, 15), fill=(232, 150, 140, 255))
    if pose == "shock":
        d.rectangle((9, 16, 11, 18), fill=(120, 40, 50, 255))
    elif pose == "read":
        d.line((9, 17, 12, 17), fill=(150, 70, 70, 255)); d.point((8, 16), fill=(150, 70, 70, 255)); d.point((13, 16), fill=(150, 70, 70, 255))
    else:
        d.line((9, 17, 11, 17), fill=(150, 70, 70, 255))
    return outline(pad(im))


def body(pose):
    im, d = canvas(44, 30)
    # torso (hoodie)
    d.rectangle((9, 6, 34, 29), fill=A("hood"))
    d.rectangle((9, 6, 12, 29), fill=A("hood2"))
    d.polygon([(9, 6), (4, 12), (2, 29), (9, 29)], fill=A("hood"))
    d.polygon([(34, 6), (39, 12), (41, 29), (34, 29)], fill=A("hood"))
    d.line((14, 6, 29, 6), fill=A("hood3"))
    # hood around the neck + strings
    d.rectangle((14, 3, 29, 7), fill=A("hood2"))
    d.line((19, 8, 19, 15), fill=A("cream")); d.line((24, 8, 24, 15), fill=A("cream"))
    # headphones around the neck
    d.rectangle((12, 4, 15, 9), fill=A("phone")); d.rectangle((28, 4, 31, 9), fill=A("phone"))
    d.line((15, 9, 28, 9), fill=(80, 86, 100, 255))
    # pocket
    d.rectangle((15, 20, 28, 25), fill=A("hood2"))
    # arms forward on the desk
    if pose == "shock":
        d.rectangle((0, 2, 5, 14), fill=A("hood")); d.rectangle((38, 2, 43, 14), fill=A("hood"))
        d.rectangle((0, 0, 5, 3), fill=A("skin")); d.rectangle((38, 0, 43, 3), fill=A("skin"))
    else:
        d.rectangle((2, 22, 16, 29), fill=A("hood3")); d.rectangle((27, 22, 41, 29), fill=A("hood3"))
    return outline(pad(im))


def narrator():
    for pose in ("sit", "look", "shock", "read", "blink"):
        im = Image.new("RGBA", (48, 56), (0, 0, 0, 0))
        b = body(pose if pose != "blink" else "sit")
        h = head(pose)
        im.alpha_composite(b, (1, 24))
        hx, hy = 12, 2
        if pose == "sit" or pose == "blink" or pose == "read":
            hy = 4  # head tilted down to the book
        if pose == "look":
            hx = 14
        if pose == "shock":
            hy = 0
        im.alpha_composite(h, (hx, hy))
        save(im, f"narrator_{pose}")


# ---------------------------------------------------------------- props
def props():
    # open book on the desk
    im, d = canvas(36, 10)
    d.polygon([(0, 9), (3, 2), (17, 0), (17, 9)], fill=A("paper"))
    d.polygon([(35, 9), (32, 2), (18, 0), (18, 9)], fill=A("paper"))
    for y in (3, 5, 7):
        d.line((5, y, 14, y - 1), fill=A("paper2")); d.line((21, y - 1, 30, y), fill=A("paper2"))
    d.line((17, 0, 17, 9), fill=A("paper2"))
    d.rectangle((0, 9, 35, 9), fill=A("teal2"))
    save(outline(pad(im)), "book_open")
    # phone, screen off / on
    for name, sc in (("phone", "screen_off"), ("phone_on", "screen")):
        im, d = canvas(14, 8)
        d.rectangle((0, 0, 13, 7), fill=A("phone"))
        d.rectangle((1, 1, 12, 6), fill=A(sc))
        if sc == "screen":
            d.rectangle((2, 2, 7, 3), fill=A("white")); d.point((10, 2), fill=A("red"))
            d.line((2, 5, 10, 5), fill=(200, 245, 255, 255))
        save(outline(pad(im)), name)
    # phone glow
    im, d = canvas(60, 40)
    for r, a in ((28, 30), (18, 40), (10, 60)):
        d.ellipse((30 - r, 20 - r * 0.7, 30 + r, 20 + r * 0.7), fill=(120, 220, 255, a))
    save(im, "phone_glow")
    # wall clock face + hands frames
    im, d = canvas(30, 30)
    d.ellipse((0, 0, 29, 29), fill=A("gold2"))
    d.ellipse((3, 3, 26, 26), fill=A("cream"))
    for k in range(12):
        a = k * math.pi / 6
        d.point((round(14.5 + 9.5 * math.sin(a)), round(14.5 - 9.5 * math.cos(a))), fill=A("ink"))
    save(outline(pad(im)), "clock")
    for i in range(24):
        im, d = canvas(32, 32)
        am = i / 24 * 2 * math.pi
        ah = (2 + i / 24) / 12 * 2 * math.pi
        c = 15.5
        d.line((c, c, c + 8 * math.sin(am), c - 8 * math.cos(am)), fill=A("ink"))
        d.line((c, c, c + 5 * math.sin(ah), c - 5 * math.cos(ah)), fill=A("red"), width=1)
        d.point((15, 15), fill=A("ink"))
        save(im, f"hands_{i:02d}")
    # steam puff
    im, d = canvas(3, 3)
    d.rectangle((0, 0, 2, 2), fill=(230, 230, 240, 150))
    save(im, "steam")


if __name__ == "__main__":
    stage(); light(); desk(); narrator(); props()
    # contact sheet for review, composited at 4x
    bg = Image.open(OUT / "stage.png").convert("RGBA")
    bg.alpha_composite(Image.open(OUT / "light.png"))
    bg.alpha_composite(Image.open(OUT / "clock.png"), (290, 30))
    bg.alpha_composite(Image.open(OUT / "hands_00.png"), (289, 29))
    bg.alpha_composite(Image.open(OUT / "narrator_look.png"), (216, 120))
    bg.alpha_composite(Image.open(OUT / "desk.png"))
    bg.alpha_composite(Image.open(OUT / "book_open.png"), (222, 158))
    bg.alpha_composite(Image.open(OUT / "phone_on.png"), (288, 160))
    bg.alpha_composite(Image.open(OUT / "vignette.png"))
    bg.resize((W * 4, H * 4), Image.NEAREST).save(OUT.parent.parent / "out" / "art_preview.png")
    print("ok")
