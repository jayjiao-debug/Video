"""Conan O'Brien caricature chibi in the same bead-sprite style as conan_v2: towering
orange pompadour, pale long face, strong chin, dark suit, blue tie, tall frame.
PRIVATE TESTS ONLY (likeness of a real person).

Writes public/sprites/obrien_<pose>.png and out/obrien_sheet.png.
"""
import pathlib
from PIL import Image
from art import P, save
from conan_v2 import COL, to_img

PADX = 3
COL.update({
    "O": (226, 100, 42), "o": (250, 150, 80), "S": (250, 228, 210), "s": (226, 194, 176), "b": (170, 80, 40),
    "N": (46, 48, 66), "T": (60, 112, 204), "F": (36, 30, 30), "M": (120, 40, 40), "W": (255, 255, 255),
})
BODY = [
    "........KKKKKK....",
    "......KKOOooOOK...",
    "....KKOOOOOOOOOK..",
    "...KOOOOoooOOOOOK.",
    "..KOOOooOOOOOOOOK.",
    ".KOOooOOOOOOOOOOK.",
    ".KOOOOOOOOOOOOOOOK",
    "..KOOOOOOOOOOOOOK.",
    "...KKOOOOOOOOOOK..",
    "...KOOOOOOOOOOOK..",
    "...KOSSSSSSSSOOK..",
    "...KSSSSSSSSSSK...",
    "...KSbbSSSSbbSK...",
    "..KSSSEESSEESSSK..",
    "..KSSSSSSSSSSSSK..",
    "...KSSSSssSSSSK...",
    "...KSSSSSSSSSSK...",
    "...KSSSKKKKSSSK...",
    "...KSSSSSSSSSSK...",
    "....KSSSSSSSSK....",
    ".....KKSSSSKK.....",
    "....KNNwwwwNNK....",
    "...KNNNwTTwNNNK...",
    "..KNNNNNTTNNNNNK..",
    "..KNNNNNTTNNNNNK..",
    "..KSKNNNTTNNNKSK..",
    "...KKNNNNNNNNKK...",
    "....KNNNNNNNNK....",
    "....KNNNKKNNNK....",
    ".....KNK..KNK.....",
    ".....KFK..KFK.....",
    ".....KKK..KKK.....",
]
POSES = ("idle", "sit", "look", "shock", "read", "think", "deduce", "blink")


def grid(pose):
    for y, r in enumerate(BODY):
        assert len(r) == 18, (y, len(r))
    g = [list("." * PADX + r + "." * PADX) for r in BODY]
    W = len(g[0])
    put = lambda x, y, c: g[y].__setitem__(x + PADX, c)
    eyes = {"idle": "EE", "look": "SE", "think": "ES", "shock": "WE", "deduce": "EE",
            "sit": "SS", "read": "SS", "blink": "SS"}[pose]
    for ex in (6, 10):
        put(ex, 13, eyes[0]); put(ex + 1, 13, eyes[1])
        if pose in ("sit", "read", "blink"):
            put(ex, 14, "E"); put(ex + 1, 14, "E")
    if pose in ("think", "shock"):  # brows up
        for x in (5, 6, 11, 12):
            put(x, 12, "S"); put(x, 11, "b")
    if pose == "deduce":  # one cocked brow
        put(11, 12, "S"); put(12, 12, "S"); put(11, 11, "b"); put(12, 11, "b")
    # mouth (row 15, default 4-wide line)
    if pose == "shock":
        for x in (7, 8, 9, 10):
            put(x, 17, "K"); put(x, 18, "M")
        put(7, 18, "K"); put(10, 18, "K")
    elif pose in ("sit", "read"):
        put(6, 16, "K"); put(11, 16, "K")
    elif pose == "deduce":
        put(7, 17, "S"); put(11, 17, "K"); put(11, 16, "K")
    elif pose == "think":
        put(7, 17, "S"); put(10, 17, "S")
    new = []
    def paint(x, y, c):
        put(x, y, c); new.append((x + PADX, y))
    def lower(side):
        if side == "L":
            put(2, 25, "."); put(3, 25, ".")
        else:
            put(14, 25, "."); put(15, 25, ".")
    if pose == "shock":
        lower("L"); lower("R")
        for hx, ax in ((-2, -1), (17, 17)):
            for x in (hx, hx + 1):
                paint(x, 18, "S"); paint(x, 19, "S")
            for y in range(20, 25):
                paint(ax, y, "N")
    if pose == "deduce":
        lower("R")
        for (x, y) in ((17, 14), (18, 14), (17, 15), (18, 15), (18, 12), (18, 13)):
            paint(x, y, "S")
        for y in range(16, 25):
            paint(17, y, "N")
    if pose == "think":
        lower("R")
        for (x, y) in ((12, 20), (13, 20), (12, 19), (13, 19)):
            paint(x, y, "S")
        for y in (21, 22, 23, 24):
            paint(15, y, "N")
    for x, y in new:
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < W and 0 <= ny < len(g) and g[ny][nx] == ".":
                g[ny][nx] = "K"
    return g


if __name__ == "__main__":
    for pose in POSES:
        save(to_img(grid(pose), 2), f"obrien_{pose}")
    imgs = [to_img(grid(p), 2) for p in POSES]
    w, h = imgs[0].size
    pad = 6
    sheet = Image.new("RGBA", (len(POSES) * (w + pad) + pad, h + 2 * pad), (*P["wall"], 255))
    for i, im in enumerate(imgs):
        sheet.alpha_composite(im, (pad + i * (w + pad), pad))
    root = pathlib.Path(__file__).resolve().parent.parent
    sheet.resize((sheet.width * 5, sheet.height * 5), Image.NEAREST).save(root / "out" / "obrien_sheet.png")
    print("ok", imgs[0].size)
