"""Case 01 art: turn the generated images into true pixel art on a fixed grid and draw
the close-up props (clock at 9:45, the will, rain, magnifier) in code.

Scenes (study, hall) become 216x384 art pixels (shown at 5x = 1080x1920).
Portraits become 128x128 with the backdrop removed.
Writes case01/art/*.png at 1x; the renderer scales with nearest neighbour.
"""
import pathlib
import numpy as np
from PIL import Image, ImageDraw

HERE = pathlib.Path(__file__).resolve().parent
SRC, OUT = HERE / "art_src", HERE / "art"
K = (18, 14, 16)


def mode_down(im, block, colours=64):
    """Each block x block square becomes its most common colour (palette-quantised first)."""
    q = im.convert("RGB").quantize(colours, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(q.getpalette()[: colours * 3]).reshape(-1, 3)
    idx = np.array(q)
    h, w = idx.shape
    gh, gw = h // block, w // block
    b = idx[: gh * block, : gw * block].reshape(gh, block, gw, block).transpose(0, 2, 1, 3).reshape(gh, gw, -1)
    out = np.zeros((gh, gw), np.int64)
    for y in range(gh):
        for x in range(gw):
            v, c = np.unique(b[y, x], return_counts=True)
            out[y, x] = v[np.argmax(c)]
    return Image.fromarray(pal[out].astype(np.uint8), "RGB")


def scene(name):
    im = mode_down(Image.open(SRC / f"{name}.webp"), 4)
    im.save(OUT / f"{name}.png")
    return im


def portrait(name):
    src = Image.open(SRC / f"{name}.webp").convert("RGB")
    im = mode_down(src, 8, 32).convert("RGBA")
    a = np.array(im)
    bg = a[2, 2, :3].astype(int)
    # flood the flat backdrop from the border
    h, w = a.shape[:2]
    seen = np.zeros((h, w), bool)
    stack = [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]
    while stack:
        x, y = stack.pop()
        if not (0 <= x < w and 0 <= y < h) or seen[y, x]:
            continue
        if np.abs(a[y, x, :3].astype(int) - bg).sum() > 40:
            continue
        seen[y, x] = True
        stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    a[seen] = 0
    Image.fromarray(a, "RGBA").save(OUT / f"{name}.png")


def clock_closeup(hh=9, mm=45, size=64):
    """Big pocket-clock face, hands at hh:mm, cracked glass."""
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    c = size // 2
    d.ellipse((1, 1, size - 2, size - 2), fill=(92, 40, 30), outline=K)
    d.ellipse((5, 5, size - 6, size - 6), fill=(236, 222, 190), outline=K)
    for i in range(12):
        a = np.pi * 2 * i / 12
        r0, r1 = c - 10, c - 6
        d.line((c + r0 * np.sin(a), c - r0 * np.cos(a), c + r1 * np.sin(a), c - r1 * np.cos(a)), fill=K, width=2 if i % 3 == 0 else 1)
    am = np.pi * 2 * mm / 60
    ah = np.pi * 2 * ((hh % 12) + mm / 60) / 12
    d.line((c, c, c + (c - 12) * np.sin(am), c - (c - 12) * np.cos(am)), fill=K, width=2)
    d.line((c, c, c + (c - 20) * np.sin(ah), c - (c - 20) * np.cos(ah)), fill=K, width=3)
    d.ellipse((c - 2, c - 2, c + 2, c + 2), fill=(200, 60, 50))
    # crack across the glass
    pts = [(14, 18), (22, 26), (26, 24), (34, 33), (40, 31), (48, 40)]
    d.line(pts, fill=(255, 255, 255), width=1)
    im = im.convert("RGBA")
    im.save(OUT / "clock_945.png")


def will_doc(w=96, h=120):
    """Parchment page; the lines of text are drawn by the renderer in the pixel font."""
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, w - 1, h - 1), fill=(232, 214, 168), outline=K)
    d.rectangle((1, 1, w - 2, 3), fill=(214, 192, 142))
    for y in range(8, h - 30, 7):     # faint ruled lines
        d.line((8, y, w - 9, y), fill=(214, 196, 150))
    d.ellipse((w - 26, h - 24, w - 8, h - 6), fill=(170, 40, 40), outline=K)   # wax seal
    d.ellipse((w - 21, h - 19, w - 13, h - 11), outline=(120, 24, 24))
    im.save(OUT / "will.png")


def magnifier(r=22):
    s = 2 * r + 24
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.line((r * 1.7, r * 1.7, s - 3, s - 3), fill=K, width=7)
    d.line((r * 1.7, r * 1.7, s - 4, s - 4), fill=(110, 64, 34), width=4)
    d.ellipse((1, 1, 2 * r + 1, 2 * r + 1), outline=K, width=5)
    d.ellipse((2, 2, 2 * r, 2 * r), outline=(226, 176, 84), width=3)
    d.arc((8, 8, 2 * r - 6, 2 * r - 6), 200, 250, fill=(255, 255, 255), width=2)
    im.save(OUT / "magnifier.png")


def ink_hand():
    """The nephew's hand: fingertips stained with typewriter-ribbon black."""
    a = np.array(Image.open(OUT / "hand.png").convert("RGBA")).astype(int)
    h, w = a.shape[:2]
    skin = (a[..., 3] > 0) & (a[..., 0] > 190) & (a[..., 1] > 130)
    for x in range(w):
        ys = np.where(skin[:70, x])[0]
        if len(ys):
            top = ys[0]
            for y in range(top, min(top + 11, 70)):
                if skin[y, x]:
                    a[y, x, :3] = (34, 28, 40) if y < top + 8 else (88, 70, 84)
    Image.fromarray(a.astype(np.uint8), "RGBA").save(OUT / "hand_ink.png")


def hair_strand():
    """A curly dark-red hair, drawn on the saucer by the renderer."""
    im = Image.new("RGBA", (12, 4), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    pts = [(0, 2), (2, 1), (4, 1), (5, 2), (7, 3), (9, 2), (11, 1)]
    d.line(pts, fill=(128, 34, 26, 255))
    im.save(OUT / "hair.png")


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    for p in ("typewriter", "lantern", "hand"):
        portrait(p)
    ink_hand(); hair_strand()
    for s in ("study", "hall"):
        print(s, scene(s).size)
    for p in ("butler", "secretary", "nephew"):
        portrait(p)
    clock_closeup(); will_doc(); magnifier()
    print("ok")
