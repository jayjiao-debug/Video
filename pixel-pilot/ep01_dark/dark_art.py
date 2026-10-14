"""Art for Ep1 《三十秒的黑暗》.

Characters come from generated 2x2 expression sheets (art_src/*_sheet.webp, one character per sheet so
the four faces stay consistent), cut by cells.py to 128x128. The clue details are drawn here, never
left to the generator: the colonel's dark lenses (down before the blackout, flipped up after), the
blue paint on his glove fingertip, the painted sapphire that becomes a real one.

python3 cells.py colonel lady lily magician butler   -> art_src/<name>_c0..c3.png
python3 dark_art.py                                    -> art/*.png
"""
import pathlib, sys
import numpy as np
from PIL import Image, ImageDraw

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "case01"))
from case_art import mode_down   # noqa: E402

SRC, OUT = HERE / "art_src", HERE / "art"
K = (18, 14, 16, 255)
PAINT_BLUE = (44, 92, 200)            # the blue Lily paints the sapphire with; also on the glove
GEM = dict(out=(16, 28, 92), dark=(30, 62, 170), mid=(70, 130, 235), light=(150, 200, 255), white=(255, 255, 255))


def cell(name, k):
    return Image.open(SRC / f"{name}_c{k}.png").convert("RGBA")


def arr(im):
    return np.array(im)


def img(a):
    return Image.fromarray(a, "RGBA")


# ------------------------------------------------------------------ the colonel
LENSES = ((56, 66), (84.5, 66))       # lens centres (portrait px)


def lens_centres(im):
    """Centroids of the pale glass inside each spectacle frame (they move a little between cells)."""
    a = arr(im).astype(int)
    glass = (a[..., 3] > 0) & (np.abs(a[..., 0] - a[..., 2]) < 24) & (a[..., :3].min(2) > 150) & (a[..., :3].max(2) < 225)
    glass[:52] = False
    glass[84:] = False
    out = []
    for lo, hi in ((30, 70), (70, 110)):
        ys, xs = np.where(glass[:, lo:hi])
        out.append((xs.mean() + lo, ys.mean()))
    return out


def dark_lenses(im):
    a = arr(im)
    for cx, cy in lens_centres(im):
        for y in range(int(cy - 10), int(cy + 11)):
            for x in range(int(cx - 10), int(cx + 11)):
                if (x - cx) ** 2 + (y - cy) ** 2 <= 9.2 ** 2 and a[y, x, :3].astype(int).sum() > 150:
                    a[y, x, :3] = (54, 56, 70)
        a[int(cy - 5), int(cx - 4):int(cx - 1), :3] = (150, 160, 182)   # glint
        a[int(cy - 4), int(cx - 5), :3] = (150, 160, 182)
    return img(a)


def flipped_lenses(im):
    """Clear frames over the eyes; the dark plates swung up on their hinges, sitting on the brow."""
    cs = lens_centres(im)
    im = im.copy()
    d = ImageDraw.Draw(im)
    for cx, cy in cs:   # seen nearly edge-on once flipped: a slim dark slab above each frame
        x0, x1 = int(cx - 9), int(cx + 9)
        d.ellipse((x0, cy - 17, x1, cy - 10), fill=(54, 56, 70, 255), outline=K)
        d.line((x0 + 4, cy - 15, x1 - 6, cy - 15), fill=(150, 160, 182, 255))
        d.line((cx - 6, cy - 10, cx - 6, cy - 8), fill=K)                  # hinges
        d.line((cx + 6, cy - 10, cx + 6, cy - 8), fill=K)
    return im


def blue_fingertip(im):
    a = arr(im)
    ys, xs = np.where((a[..., :3].min(2) > 215) & (a[..., 3] > 0))
    sel = (ys > 88) & (xs < 70)
    ys, xs = ys[sel], xs[sel]
    y0, x0 = ys.min(), xs[ys <= ys.min() + 3].min()
    for y in range(y0, y0 + 4):
        for x in range(x0, x0 + 4):
            if a[y, x, :3].min() > 200:
                a[y, x, :3] = PAINT_BLUE
    return img(a)


# ------------------------------------------------------------------ others
def lily_shock(im):
    a = arr(im)
    skin = a[78, 70, :3].copy()
    a[78:85, 57:69, :3] = skin
    d = ImageDraw.Draw(im2 := img(a))
    d.ellipse((60, 78, 65, 85), fill=(150, 50, 60, 255), outline=K)
    return im2


def wet_apron(im):
    a = arr(im).astype(int)
    rng = np.random.default_rng(4)
    brown = (np.abs(a[..., 0] - 140) < 45) & (np.abs(a[..., 1] - 90) < 40) & (a[..., 2] < 110) & (a[..., 3] > 0)
    brown[:100] = False
    blot = np.zeros(brown.shape, bool)
    for cx, cy, r in ((55, 110, 9), (71, 118, 10), (62, 125, 8)):
        yy, xx = np.ogrid[:128, :128]
        blot |= (xx - cx) ** 2 + (yy - cy) ** 2 <= r * r
    m = brown & blot
    a[m, :3] = (a[m, :3] * 0.5).astype(int)
    for _ in range(9):   # drips catching the light
        y, x = rng.integers(104, 127), rng.integers(50, 78)
        if m[y, x]:
            a[y, x, :3] = (170, 200, 230)
    return img(a.astype(np.uint8))


DOVE = ["..KKKK....",
        ".KWWWWK...",
        "KWWWWWWKO.",
        "KWWWWKWKOO",
        ".KWWWWWWK.",
        "KWWWWWWWK.",
        ".KKKKKKK.."]


def dove_on_brim(im):
    im = im.copy()
    a = arr(im)
    col = dict(K=(18, 14, 16), W=(250, 250, 246), O=(240, 160, 50))
    ox, oy = 98, 22                       # drawn at 2x: a fat dove on the brim
    for r, row in enumerate(DOVE):
        for c, ch in enumerate(row):
            if ch in col:
                a[oy + 2 * r:oy + 2 * r + 2, ox + 2 * c:ox + 2 * c + 2] = (*col[ch], 255)
    return img(a)


def portraits():
    P = {}
    c = {k: cell("colonel", k) for k in range(4)}
    P["colonel_calm"] = dark_lenses(c[0])
    P["colonel_smile"] = dark_lenses(c[0])          # c1 barely differs and its lenses sit oddly
    P["colonel_after"] = blue_fingertip(flipped_lenses(c[0]))
    P["colonel_after_smile"] = blue_fingertip(flipped_lenses(c[0]))
    P["colonel_caught"] = c[3]
    lady = [cell("lady", k) for k in range(4)]
    P.update(lady_smile=lady[0], lady_shock=lady[1], lady_cry=lady[2], lady_angry=lady[3])
    lily = [cell("lily", k) for k in range(4)]
    P.update(lily_angry=lily[0], lily_calm=lily[1], lily_sad=lily[2], lily_happy=lily[3])
    P["lily_shock"] = lily_shock(lily[1])
    P["lily_after"] = wet_apron(P["lily_shock"])
    P["lily_after_sad"] = wet_apron(lily[2])
    mg = [cell("magician", k) for k in range(4)]
    P.update(magician_smug=mg[0], magician_shock=mg[2], magician_laugh=mg[3])
    P["magician_after"] = dove_on_brim(mg[2])
    bt = [cell("butler", k) for k in range(4)]
    P.update(butler_calm=bt[0], butler_nervous=bt[1], butler_sad=bt[2], butler_smile=bt[3])
    for k, v in P.items():
        v.save(OUT / f"{k}.png")
    return P


# ------------------------------------------------------------------ manga emotion symbols (portrait px)
EMOTES = {
    "note": (["...KKK..", "...KYYK.", "...KYKYK", "...KYK.K", "...KYK..", ".KKKYK..", "KYYYYK..", "KYYYYK..", ".KKKK..."], dict(Y=(255, 214, 90))),
    "bang": (["KKK", "KOK", "KOK", "KOK", "KOK", "KKK", "...", "KKK", "KOK", "KKK"], dict(O=(255, 196, 60))),
    "sweat": (["..K..", ".KBK.", "KBBBK", "KBBWK", "KBBBK", ".KKK."], dict(B=(130, 200, 250), W=(240, 250, 255))),
    "anger": ([".KK.KK.", "KOOKOOK", "KOK.KOK", ".K...K.", "KOK.KOK", "KOOKOOK", ".KK.KK."], dict(O=(245, 140, 40))),
    "spark": (["...K...", "..KYK..", ".KYYYK.", "KYYWYYK", ".KYYYK.", "..KYK..", "...K..."], dict(Y=(255, 220, 90), W=(255, 255, 255))),
    "ask": ([".KKKK.", "KCCCCK", "KCKKCK", "...KCK", "..KCK.", "..KCK.", "..KK..", "......", "..KK..", "..KCK.", "..KK.."], dict(C=(244, 230, 196))),
}


def emotes():
    for name, (rows, pal) in EMOTES.items():
        pal = dict(pal, K=(18, 14, 16))
        im = Image.new("RGBA", (len(rows[0]), len(rows)), (0, 0, 0, 0))
        a = arr(im)
        for r, row in enumerate(rows):
            for c, ch in enumerate(row):
                if ch in pal:
                    a[r, c] = (*pal[ch], 255)
        img(a).save(OUT / f"emote_{name}.png")


# ------------------------------------------------------------------ the painting (close-up, 80x64 art px)
def gem_pixels(d, cx, cy, real):
    """A sapphire seen from the front: painted (flat) or real (faceted, outlined, highlight)."""
    if not real:
        d.polygon([(cx - 3, cy), (cx, cy - 3), (cx + 3, cy), (cx, cy + 3)], fill=PAINT_BLUE + (255,))
        return
    d.polygon([(cx - 4, cy), (cx, cy - 4), (cx + 4, cy), (cx, cy + 4)], fill=GEM["out"] + (255,))
    d.polygon([(cx - 3, cy), (cx, cy - 3), (cx + 3, cy), (cx, cy + 3)], fill=GEM["dark"] + (255,))
    d.polygon([(cx - 2, cy - 1), (cx, cy - 3), (cx + 1, cy - 1)], fill=GEM["mid"] + (255,))
    d.point((cx - 1, cy - 2), fill=GEM["white"] + (255,))
    d.point((cx, cy - 2), fill=GEM["white"] + (255,))
    d.point((cx + 1, cy + 1), fill=GEM["light"] + (255,))


def painting(real, w=80, h=64):
    rng = np.random.default_rng(11)
    im = Image.new("RGBA", (w, h), (0, 0, 0, 255))
    a = arr(im)
    for y in range(h):   # unfinished dark background, loose horizontal strokes
        for x in range(w):
            t = y / h
            base = np.array([52, 60, 50]) * (1 - t) + np.array([70, 48, 40]) * t
            a[y, x, :3] = np.clip(base + rng.integers(-6, 7) + (8 if (x // 6 + y // 3) % 5 == 0 else 0), 0, 255)
    im = img(a)
    d = ImageDraw.Draw(im)
    cx, cy = w // 2, int(h * 0.56)
    d.ellipse((cx - 22, cy + 2, cx + 22, cy + 14), fill=(150, 40, 52, 255))               # velvet cushion
    d.ellipse((cx - 22, cy + 2, cx + 22, cy + 9), fill=(176, 58, 70, 255))
    d.line((cx - 16, cy + 5, cx + 12, cy + 4), fill=(200, 90, 100, 255))
    for tx in (cx - 22, cx + 21):                                                            # tassels
        d.line((tx, cy + 8, tx, cy + 13), fill=(214, 170, 70, 255))
    gem_pixels(d, cx, cy, real)
    if real:   # the wet paint pushed aside where a fingertip pressed the stone in
        for dx, dy in ((5, 1), (6, 2), (5, 3), (-5, 2)):
            d.point((cx + dx, cy + dy), fill=PAINT_BLUE + (255,))
    d.rectangle((0, 0, w - 1, h - 1), outline=(236, 222, 190, 255), width=2)
    return im


# ------------------------------------------------------------------ the drawing room
CUSHION = (101, 259)
CANVAS = (26, 225, 53, 256)          # inside of the easel's canvas (art px)
CLOCK = (170, 105, 11)
METER = (179, 168, 193, 186)


def salon(gem_on_cushion, real_in_painting):
    base = Image.open(SRC / "salon_raw.png").convert("RGBA")
    a = arr(base)
    a[246:259, 94:109] = a[246:259, 80:95]          # the generator's pot plant: wallpaper/wainscot from beside it
    im = img(a)
    d = ImageDraw.Draw(im)
    cx, cy = CUSHION
    d.ellipse((cx - 9, cy - 3, cx + 9, cy + 3), fill=(150, 40, 52, 255), outline=K)
    d.line((cx - 6, cy - 2, cx + 5, cy - 2), fill=(196, 80, 92, 255))
    for tx in (cx - 9, cx + 9):
        d.point((tx, cy + 3), fill=(214, 170, 70, 255))
    if gem_on_cushion:
        gem_pixels(d, cx, cy - 4, True)
    # the canvas: a small copy of the still life
    x0, y0, x1, y1 = CANVAS
    p = painting(real_in_painting, 80, 64).resize((x1 - x0, y1 - y0), Image.NEAREST)
    im.paste(p, (x0, y0))
    pd = ImageDraw.Draw(im)
    gx, gy = (x0 + x1) // 2, y0 + int((y1 - y0) * 0.56)
    pd.rectangle((gx - 1, gy - 1, gx + 1, gy + 1), fill=PAINT_BLUE + (255,))
    if real_in_painting:
        pd.point((gx - 1, gy - 1), fill=GEM["white"] + (255,))
        pd.point((gx + 1, gy + 1), fill=GEM["out"] + (255,))
    # coin-in-the-slot gas meter beside the door
    mx0, my0, mx1, my1 = METER
    pd.rectangle(METER, fill=(160, 120, 50, 255), outline=K)
    pd.rectangle((mx0 + 2, my0 + 2, mx1 - 2, my0 + 8), fill=(236, 222, 190, 255), outline=K)
    pd.line((mx0 + 5, my0 + 12, mx1 - 5, my0 + 12), fill=K)                      # coin slot
    pd.line((mx0 + 7, my0 + 4, mx0 + 9, my0 + 6), fill=K)
    # clock face wiped clean: the hands are drawn per frame
    ccx, ccy, r = CLOCK
    pd.ellipse((ccx - r, ccy - r, ccx + r, ccy + r), fill=(236, 226, 196, 255), outline=(90, 56, 30, 255), width=2)
    for i in range(12):
        ang = np.pi * 2 * i / 12
        pd.point((ccx + (r - 3) * np.sin(ang), ccy - (r - 3) * np.cos(ang)), fill=K)
    return im


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    P = portraits()
    emotes()
    painting(False).save(OUT / "painting_before.png")
    painting(True).save(OUT / "painting_after.png")
    salon(True, False).save(OUT / "salon_before.png")
    salon(False, True).save(OUT / "salon_after.png")
    # contact sheet
    names = list(P)
    cols = 6
    sh = Image.new("RGBA", (cols * 136, ((len(names) + cols - 1) // cols) * 136 + 400), (40, 36, 48, 255))
    for i, n in enumerate(names):
        sh.alpha_composite(P[n], ((i % cols) * 136 + 4, (i // cols) * 136 + 4))
    y = ((len(names) + cols - 1) // cols) * 136
    for i, n in enumerate(("salon_before", "salon_after")):
        sh.alpha_composite(Image.open(OUT / f"{n}.png").crop((0, 150, 216, 300)).convert("RGBA"), (i * 220, y))
    sh.alpha_composite(painting(False).resize((160, 128), Image.NEAREST), (450, y))
    sh.alpha_composite(painting(True).resize((160, 128), Image.NEAREST), (620, y))
    for i, n in enumerate(EMOTES):
        e = Image.open(OUT / f"emote_{n}.png")
        sh.alpha_composite(e.resize((e.width * 4, e.height * 4), Image.NEAREST), (450 + i * 60, y + 160))
    sh.resize((sh.width * 2, sh.height * 2), Image.NEAREST).save(OUT / "contact.png")
    print("wrote", OUT)
