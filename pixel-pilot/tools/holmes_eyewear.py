"""Eyewear overlays for the Holmes sprites, drawn on the 53x67 art grid so they stay
crisp and identical across poses: round wire glasses, or a gold monocle on a chain.
Eye centres are found per pose from the dark eye blobs inside the face.

python3 holmes_eyewear.py            -> out/holmes_eyewear_compare.png (idle: none / glasses / monocle)
python3 holmes_eyewear.py monocle    -> public/sprites/holmes_monocle_<pose>.png for every pose
"""
import sys, pathlib
import numpy as np
from PIL import Image, ImageDraw
from design_sheet import F, BG, PANEL, INK, GOLD

ROOT = pathlib.Path(__file__).resolve().parent.parent
SPR = ROOT / "public" / "sprites"
POSES = ("idle", "sit", "look", "shock", "read", "think", "deduce", "magnify", "blink")
FRAME, GOLD1, GOLD2, GLASS, GLINT = (34, 26, 24), (232, 186, 82), (170, 118, 44), (196, 226, 238), (255, 255, 255)


def cells(name):
    a = np.array(Image.open(SPR / f"{name}.png").convert("RGBA"))[::2, ::2].astype(int)
    return a


def find_eyes(a):
    """Centres of the two dark blobs enclosed by skin in the upper face."""
    h, w = a.shape[:2]
    skin = (a[..., 0] > 200) & (a[..., 1] > 150) & (a[..., 3] > 0)
    dark = (a[..., :3].sum(-1) < 160) & (a[..., 3] > 0)
    rows = [y for y in range(h) if skin[y].sum() > w // 3]
    y0, y1 = rows[0], rows[0] + 9

    def enclosed(x, y):
        left = any(skin[y, x - k] for k in range(1, 4))
        right = any(skin[y, x + k] for k in range(1, 4))
        vert = any(skin[y - k, x] or skin[y + k, x] for k in range(1, 3))
        return left and right and vert
    pts = [(x, y) for y in range(y0, y1) for x in range(int(w * 0.28), int(w * 0.72)) if dark[y, x] and enclosed(x, y)]
    mid = w / 2
    L = [p for p in pts if p[0] < mid]
    R = [p for p in pts if p[0] >= mid]
    c = lambda ps: (sum(p[0] for p in ps) / len(ps), sum(p[1] for p in ps) / len(ps))
    return c(L), c(R)


def ring(cx, cy, r):
    out = set()
    for y in range(int(cy - r - 2), int(cy + r + 3)):
        for x in range(int(cx - r - 2), int(cx + r + 3)):
            d = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
            if r - 0.5 <= d < r + 0.5:
                out.add((x, y))
    return out


def put(a, x, y, c, alpha=255):
    if 0 <= y < a.shape[0] and 0 <= x < a.shape[1]:
        if alpha == 255:
            a[y, x] = (*c, 255)
        else:  # tint glass over what is there
            k = alpha / 255
            a[y, x, :3] = (a[y, x, :3] * (1 - k) + np.array(c) * k).astype(int)
            a[y, x, 3] = 255


def glasses(a):
    (lx, ly), (rx, ry) = find_eyes(a)
    r = 3.6
    for cx, cy in ((lx, ly), (rx, ry)):
        for x, y in ring(cx, cy, r):
            put(a, x, y, FRAME)
        put(a, int(round(cx - 2)), int(round(cy - 2)), GLINT)
    yb = int(round(min(ly, ry) - 1))
    for x in range(int(lx + r + 0.5), int(rx - r + 0.5)):
        put(a, x, yb, FRAME)  # bridge
    return a


def monocle(a):
    (lx, ly), (rx, ry) = find_eyes(a)
    cx, cy, r = rx, ry, 4.2
    inner = {(x, y) for y in range(int(cy - r), int(cy + r + 1)) for x in range(int(cx - r), int(cx + r + 1))
             if (x - cx) ** 2 + (y - cy) ** 2 < (r - 0.5) ** 2}
    for x, y in inner:
        if a[y, x, :3].sum() > 300:   # tint the skin behind the lens, keep the eye dark
            put(a, x, y, GLASS, 90)
    rim = ring(cx, cy, r)
    for x, y in rim:
        put(a, x, y, GOLD2 if y > cy else GOLD1)
    for x, y in ring(cx, cy, r + 1):
        if a[y, x, 3] == 0 or a[y, x, :3].sum() > 300:
            put(a, x, y, FRAME)
    put(a, int(round(cx - 2)), int(round(cy - 2)), GLINT)
    put(a, int(round(cx - 1)), int(round(cy - 3)), GLINT)
    # chain: from the bottom of the rim, swinging out and down to the coat lapel
    x, y = int(round(cx + 1)), int(round(cy + r + 1))
    for i, (dx, dy) in enumerate([(1, 1), (1, 1), (0, 1), (0, 1), (-1, 1), (-1, 1), (-1, 1), (-1, 1), (-1, 0), (-1, 1)]):
        x, y = x + dx, y + dy
        put(a, x, y, GOLD1 if i % 2 == 0 else GOLD2)
    return a


def to_img(a):
    im = Image.fromarray(a.astype(np.uint8), "RGBA")
    return im.resize((im.width * 2, im.height * 2), Image.NEAREST)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        fn = {"monocle": monocle, "glasses": glasses}[sys.argv[1]]
        for p in POSES:
            to_img(fn(cells(f"holmes_{p}"))).save(SPR / f"holmes_{sys.argv[1]}_{p}.png")
        print("wrote", sys.argv[1])
        sys.exit()
    base = cells("holmes_idle")
    opts = [("No eyewear", base.copy()), ("Round glasses", glasses(base.copy())), ("Monocle + chain", monocle(base.copy()))]
    Z = 4
    tiles = [to_img(a).resize((a.shape[1] * 2 * Z, a.shape[0] * 2 * Z), Image.NEAREST) for _, a in opts]
    tw, th = tiles[0].size
    page = Image.new("RGB", (60 + 3 * (tw + 70), th + 230), BG)
    d = ImageDraw.Draw(page)
    d.text((60, 30), "SHERLOCK · eyewear", font=F(48), fill=INK)
    for i, ((t, _), tile) in enumerate(zip(opts, tiles)):
        x = 60 + i * (tw + 70)
        d.rounded_rectangle((x - 20, 110, x + tw + 20, 130 + th), 16, fill=PANEL)
        page.paste(tile, (x, 120), tile)
        d.text((x, 150 + th), t, font=F(30), fill=GOLD)
    page.save(ROOT / "out" / "holmes_eyewear_compare.png")
    print("eyes", find_eyes(base), page.size)
