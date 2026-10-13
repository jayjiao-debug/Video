"""Visual-novel portraits: detailed 128x128 pixel busts with layered expressions.

The bust comes from one generated image (art_src/*.webp, seed 559153), pixelised by case_art.mode_down.
Expressions are painted onto that one bust in code, so the face, hair and clothes never drift between
expressions. Each expression is a combination of layers:
    eyes  : open / closed / narrow / wide / side / down
    brows : base / up / angry / worried / quirk
    mouth : base / open1 / open2 / smirk / smile / o / firm / pout
    extra : sweat, blush, shadow (dread)

python3 vn_faces.py  -> art/<who>_<expr>.png and out/vn_faces_sheet.png
"""
import pathlib, sys
import numpy as np
from PIL import Image, ImageDraw

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "case01"))

LASH = (8, 5, 8)
INSIDE = (96, 36, 38)
TEETH = (240, 236, 226)
SHINE = (226, 236, 250)
SWEAT = (176, 214, 244)
SWEAT_EDGE = (60, 92, 150)
BLUSH = (238, 150, 140)


class Face:
    """Pixel coordinates of one bust's features (art pixels in the 128x128 image)."""

    def __init__(self, **kw):
        self.__dict__.update(kw)


HOLMES = Face(
    src="holmes_vn",
    skin=(245, 198, 164), shade=(198, 129, 108), white=(241, 221, 201), iris=(30, 20, 24), iris2=(63, 56, 67),
    mouth_col=(105, 71, 58), brow_col=LASH,
    # eye interiors (x0, y0, x1, y1 inclusive), the lash row above, and the iris columns
    eyes=[dict(box=(60, 47, 68, 51), lash=(60, 45, 68, 46), iris=(63, 66)),
          dict(box=(79, 47, 85, 51), lash=(79, 46, 86, 46), iris=(80, 83))],
    # brows: list of rows (y, x0, x1) each, and the skin colour that sits behind them
    brows=[[(42, 59, 69), (43, 68, 71)], [(42, 80, 89), (43, 81, 88)]],
    brow_clear=[(41, 43, 59, 71), (41, 43, 80, 89)],
    mouth=dict(y=63, x0=71, x1=77),
    sweat_at=(56, 49), blush_rows=(53, [(60, 66), (80, 85)]),
)

SECRETARY = Face(
    src="secretary_vn",
    skin=(242, 194, 165), shade=(166, 123, 100), white=(251, 252, 231), iris=(25, 5, 8), iris2=(92, 48, 53),
    mouth_col=(140, 86, 74), brow_col=(130, 74, 62),
    eyes=[dict(box=(61, 44, 68, 47), lash=(60, 42, 69, 43), iris=(63, 66)),
          dict(box=(80, 44, 84, 47), lash=(79, 42, 86, 43), iris=(81, 82))],
    brows=[[(40, 63, 69), (41, 70, 71)], [(40, 79, 84), (41, 79, 83)]],
    brow_clear=[(39, 41, 62, 72), (39, 42, 78, 85)],
    mouth=dict(y=59, x0=70, x1=77),
    sweat_at=(56, 46), blush_rows=(51, [(60, 66), (80, 84)]),
)


def flood_bg(im, tol=40):
    a = np.array(im.convert("RGBA"))
    h, w = a.shape[:2]
    bg = a[2, 2, :3].astype(int)
    seen = np.zeros((h, w), bool)
    stack = [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]
    while stack:
        x, y = stack.pop()
        if not (0 <= x < w and 0 <= y < h) or seen[y, x]:
            continue
        if np.abs(a[y, x, :3].astype(int) - bg).sum() > tol:
            continue
        seen[y, x] = True
        stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    a[seen] = 0
    return Image.fromarray(a, "RGBA")


def base(f):
    p = HERE / "art" / f"{f.src}.png"
    if not p.exists():
        from case_art import mode_down
        flood_bg(mode_down(Image.open(HERE / "art_src" / f"{f.src}.webp"), 8, 48)).save(p)
    return Image.open(p).convert("RGBA")


# ------------------------------------------------------------------ layers
def put(d, x, y, c):
    d.point((x, y), fill=c + (255,))


def eyes(d, f, mode):
    for i, e in enumerate(f.eyes):
        x0, y0, x1, y1 = e["box"]
        lx0, ly0, lx1, ly1 = e["lash"]
        ix0, ix1 = e["iris"]
        mid = (y0 + y1) // 2
        if mode == "open":
            continue
        # wipe the eye back to skin, then redraw
        d.rectangle((x0, ly0, x1, y1), fill=f.skin + (255,))
        if mode == "closed":            # a soft downward arc
            d.line((lx0, mid, lx1, mid), fill=LASH + (255,))
            put(d, lx0, mid - 1, f.shade); put(d, lx1, mid - 1, f.shade)
            d.line((lx0 + 1, mid + 1, lx1 - 1, mid + 1), fill=f.shade + (255,))
            continue
        top = {"narrow": ly1 + 1, "wide": ly0 - 1, "side": ly0, "down": ly1 + 1}.get(mode, ly0)
        d.rectangle((x0, top + (ly1 - ly0) + 1, x1, y1), fill=f.white + (255,))
        d.rectangle((lx0, top, lx1, top + (ly1 - ly0)), fill=LASH + (255,))
        if mode == "wide":              # tiny pupils in big whites
            cx = (ix0 + ix1) // 2
            d.rectangle((cx, mid, cx + 1, mid + 1), fill=f.iris + (255,))
            d.line((x0, y1 + 1, x1, y1 + 1), fill=f.shade + (255,))
            continue
        shift = {"side": -2 if i == 0 else -1, "down": 0}.get(mode, 0)
        iy0 = top + (ly1 - ly0) + 1
        iy1 = y1 + (1 if mode == "down" else 0)
        d.rectangle((ix0 + shift, iy0, ix1 + shift, iy1), fill=f.iris2 + (255,))
        if ix1 - ix0 >= 2 and iy1 > iy0:
            d.rectangle((ix0 + shift + 1, iy0, ix1 + shift - 1, iy1 - 1), fill=f.iris + (255,))
        else:
            d.rectangle((ix0 + shift, iy0, ix1 + shift, iy1), fill=f.iris + (255,))
        if mode != "down":
            put(d, ix0 + shift + 1, iy0 + 1, SHINE)


def brows(d, f, mode):
    if mode == "base":
        return
    for i, (rows, clear) in enumerate(zip(f.brows, f.brow_clear)):
        y0, y1, x0, x1 = clear
        d.rectangle((x0, y0, x1, y1), fill=f.skin + (255,))
        xs = [x for _, a, b in rows for x in range(a, b + 1)]
        bx0, bx1 = min(xs), max(xs)
        by = rows[0][0]
        inner_left = i == 0          # the left brow's inner end is on its right
        for x in range(bx0, bx1 + 1):
            t = (x - bx0) / max(1, bx1 - bx0)
            inner = t if inner_left else 1 - t
            if mode == "up":
                y = by - 1 - (1 if 0.25 < t < 0.75 else 0)
            elif mode == "angry":     # inner ends drop
                y = by - 1 + round(inner * 3)
            elif mode == "worried":   # inner ends lift
                y = by + 1 - round(inner * 3)
            elif mode == "quirk":     # one brow up, one down
                y = by - 2 + (1 if 0.2 < t < 0.8 else 0) if i == 1 else by + 1
            else:
                y = by
            put(d, x, y, f.brow_col)
            put(d, x, y + 1, f.brow_col)


def mouth(d, f, mode):
    m = f.mouth
    y, x0, x1 = m["y"], m["x0"], m["x1"]
    cx = (x0 + x1) // 2
    if mode == "base":
        return
    d.rectangle((x0 - 1, y - 2, x1 + 1, y + 3), fill=f.skin + (255,))
    c = f.mouth_col + (255,)
    if mode == "open1":
        d.line((x0 + 1, y, x1 - 1, y), fill=c)
        d.line((x0 + 2, y + 1, x1 - 2, y + 1), fill=INSIDE + (255,))
    elif mode == "open2":
        d.line((x0 + 1, y, x1 - 1, y), fill=c)
        d.rectangle((x0 + 1, y + 1, x1 - 1, y + 2), fill=INSIDE + (255,))
        d.line((x0 + 2, y + 1, x1 - 2, y + 1), fill=TEETH + (255,))
        d.line((x0 + 2, y + 3, x1 - 2, y + 3), fill=c)
    elif mode == "smirk":
        d.line((x0, y, x1 - 2, y), fill=c)
        put(d, x1 - 1, y - 1, f.mouth_col); put(d, x1, y - 1, f.mouth_col); put(d, x1 + 1, y - 2, f.mouth_col)
        put(d, x1 + 1, y, f.shade)
    elif mode == "smile":
        put(d, x0, y - 1, f.mouth_col); put(d, x1, y - 1, f.mouth_col)
        d.line((x0 + 1, y, x1 - 1, y), fill=c)
    elif mode == "o":
        d.rectangle((cx - 2, y - 1, cx + 2, y + 3), fill=c)
        d.rectangle((cx - 1, y, cx + 1, y + 2), fill=INSIDE + (255,))
        put(d, cx - 2, y - 1, f.skin); put(d, cx + 2, y - 1, f.skin); put(d, cx - 2, y + 3, f.skin); put(d, cx + 2, y + 3, f.skin)
    elif mode == "firm":
        d.line((x0 + 1, y, x1 - 1, y), fill=c)
        d.line((x0 + 2, y + 1, x1 - 2, y + 1), fill=f.shade + (255,))
    elif mode == "pout":
        d.line((cx - 1, y, cx + 2, y), fill=c)
        put(d, cx + 3, y + 1, f.mouth_col)
    elif mode == "wobble":           # nervous wavy line
        for k, x in enumerate(range(x0, x1 + 1)):
            put(d, x, y + (k % 2), f.mouth_col)


def extra(d, f, items):
    if "sweat" in items:
        x, y = f.sweat_at
        for yy, xs in ((0, (1,)), (1, (0, 1, 2)), (2, (0, 1, 2)), (3, (0, 1, 2)), (4, (1,))):
            for xx in xs:
                put(d, x + xx, y + yy, SWEAT)
        put(d, x + 1, y - 1, SWEAT_EDGE); put(d, x - 1, y + 2, SWEAT_EDGE); put(d, x + 3, y + 2, SWEAT_EDGE)
        put(d, x - 1, y + 3, SWEAT_EDGE); put(d, x + 3, y + 3, SWEAT_EDGE); put(d, x + 1, y + 5, SWEAT_EDGE)
        put(d, x, y + 1, (255, 255, 255))
    if "blush" in items:
        y, spans = f.blush_rows
        for a, b in spans:
            for x in range(a, b + 1, 2):
                put(d, x, y, BLUSH)


def dread(im, f):
    """Blue gloom over the upper face (skin and eyes only), with the anime vertical lines."""
    a = np.array(im).astype(int)
    x0 = min(e["box"][0] for e in f.eyes) - 6
    x1 = max(e["box"][2] for e in f.eyes) + 4
    y0 = min(e["lash"][1] for e in f.eyes) - 6
    y1 = max(e["box"][3] for e in f.eyes) + 2
    for y in range(y0, y1 + 1):
        k = 0.55 * (1 - (y - y0) / (y1 - y0 + 1))
        for x in range(x0, x1 + 1):
            px = a[y, x]
            skinish = px[3] > 0 and px[0] > 150 and px[0] > px[2] + 40
            if not skinish:
                continue
            c = px[:3] * (1 - k) + np.array([60, 70, 150]) * k
            if x % 3 == 0 and y < y1 - 1:
                c = c * 0.78
            a[y, x, :3] = c
    return Image.fromarray(a.astype(np.uint8), "RGBA")


EXPRESSIONS = {
    "holmes": {
        "neutral": dict(),
        "think": dict(eyes="side", brows="quirk", mouth="pout"),
        "smirk": dict(eyes="narrow", brows="quirk", mouth="smirk"),
        "serious": dict(eyes="narrow", brows="angry", mouth="firm"),
        "shock": dict(eyes="wide", brows="up", mouth="o", extra=("sweat",)),
        "smile": dict(eyes="closed", brows="up", mouth="smile"),
    },
    "secretary": {
        "neutral": dict(),
        "smile": dict(eyes="narrow", mouth="smile", extra=("blush",)),
        "nervous": dict(eyes="side", brows="worried", mouth="wobble", extra=("sweat",)),
        "shock": dict(eyes="wide", brows="worried", mouth="o", extra=("sweat",)),
        "despair": dict(eyes="down", brows="worried", mouth="firm", extra=("sweat", "dread")),
    },
}
FACES = {"holmes": HOLMES, "secretary": SECRETARY}


def render(who, expr="neutral", blink=False, talk=0):
    """talk: 0 closed, 1 or 2 open (the mouth flap while speaking)."""
    f = FACES[who]
    e = EXPRESSIONS[who][expr]
    im = base(f).copy()
    d = ImageDraw.Draw(im)
    brows(d, f, e.get("brows", "base"))
    eyes(d, f, "closed" if blink and e.get("eyes") != "wide" else e.get("eyes", "open"))
    m = e.get("mouth", "base")
    if talk and m not in ("o",):
        m = "open1" if talk == 1 else "open2"
    mouth(d, f, m)
    extra(d, f, e.get("extra", ()))
    if "dread" in e.get("extra", ()):
        im = dread(im, f)
    return im


if __name__ == "__main__":
    (HERE / "art").mkdir(exist_ok=True)
    (HERE / "out").mkdir(exist_ok=True)
    cells = []
    for who, ex in EXPRESSIONS.items():
        for name in ex:
            im = render(who, name)
            im.save(HERE / "art" / f"{who}_{name}.png")
            cells.append((f"{who} {name}", im))
    s = 3
    cols = 6
    rows = -(-len(cells) // cols)
    sheet = Image.new("RGBA", (cols * 128 * s, rows * (128 * s + 24)), (40, 32, 52, 255))
    d = ImageDraw.Draw(sheet)
    for i, (lab, im) in enumerate(cells):
        x, y = (i % cols) * 128 * s, (i // cols) * (128 * s + 24)
        sheet.alpha_composite(im.resize((128 * s, 128 * s), Image.NEAREST), (x, y))
        d.text((x + 8, y + 128 * s + 4), lab, fill=(255, 255, 255))
    sheet.save(HERE / "out" / "vn_faces_sheet.png")
    print(len(cells), "faces")
