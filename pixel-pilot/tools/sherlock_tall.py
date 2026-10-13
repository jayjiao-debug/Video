"""Sherlock v4: less chibi, built for recognisability. About 3.5 heads tall, 3/4 view
facing right, so the profile carries the identity: aquiline nose, long jaw, and
(classic) the deerstalker's front + back peaks, curved calabash pipe and Inverness cape;
(modern) tall curls, popped collar, blue scarf and the long coat flaring at the hem.
Shapes are polygons drawn at native resolution, each with a 1-cell outline ring.
Writes out/sheet_sherlock_tall.png (idle in both looks + black silhouette test).
"""
import pathlib
from PIL import Image, ImageDraw
from conan_v2 import COL, to_img
from design_sheet import F, BG, PANEL, INK, MUTED, GOLD

ROOT = pathlib.Path(__file__).resolve().parent.parent
PADX, W, H = 3, 34, 58
COL.update({
    "S": (246, 206, 176), "s": (214, 164, 136), "E": (24, 18, 22), "W": (255, 255, 255), "B": (96, 136, 176),
    "D": (150, 112, 74), "d": (112, 82, 54), "A": (120, 66, 36), "a": (226, 176, 84), "c": (88, 46, 26),
    "H": (40, 30, 30), "h": (86, 66, 60), "N": (56, 58, 72), "n": (38, 38, 50),
    "Q": (56, 96, 172), "q": (102, 144, 212), "L": (44, 42, 52), "l": (30, 28, 36), "F": (22, 18, 18),
    "w": (240, 238, 230), "R": (128, 36, 44), "G": (186, 224, 240), "g": (246, 252, 255), "P": (108, 70, 132),
})
N4 = ((1, 0), (-1, 0), (0, 1), (0, -1))


def cells_of(draw_fn):
    m = Image.new("L", (W + 2 * PADX, H), 0)
    draw_fn(ImageDraw.Draw(m), PADX)
    px = m.load()
    return {(x - PADX, y) for y in range(H) for x in range(W + 2 * PADX) if px[x, y]}


def poly(*pts):
    return cells_of(lambda d, o: d.polygon([(x + o, y) for x, y in pts], fill=1))


def ell(x0, y0, x1, y1):
    return cells_of(lambda d, o: d.ellipse((x0 + o, y0, x1 + o, y1), fill=1))


def rect(x0, y0, x1, y1):
    return {(x, y) for x in range(x0, x1 + 1) for y in range(y0, y1 + 1)}


class Grid:
    def __init__(self):
        self.g = [["."] * (W + 2 * PADX) for _ in range(H)]

    def put(self, x, y, c):
        if -PADX <= x < W + PADX and 0 <= y < H:
            self.g[y][x + PADX] = c

    def paint(self, d):
        for (x, y), c in d.items():
            self.put(x, y, c)

    def blob(self, cells, fill, ring=True):
        cells = set(cells)
        if ring:
            for x, y in cells:
                for dx, dy in N4:
                    if (x + dx, y + dy) not in cells:
                        self.put(x + dx, y + dy, "K")
        for x, y in cells:
            self.put(x, y, fill if isinstance(fill, str) else fill(x, y))


def tweed(x, y):
    return "d" if (x % 3 == 0 and y % 2 == 0) or (y % 4 == 1 and x % 2 == 1) else "D"


def face(G, look):
    """3/4 head facing right: long jaw, aquiline nose, sharp eyes, cheekbones."""
    head = poly((11, 10), (21, 10), (23, 13), (23, 19), (21, 22), (18, 24), (14, 23), (11, 19))
    nose = {(24, 14), (24, 15), (25, 16), (25, 17), (26, 17), (24, 18)}
    G.blob(head | nose, lambda x, y: "s" if (x, y) in {(24, 18), (12, 19), (13, 20)} else "S")
    G.blob({(11, 15), (11, 16), (11, 17), (12, 16)}, "s")  # ear
    # eyes: far (left) narrower, near (right) wider, both looking right, heavy lids
    G.paint({(15, 14): "E", (16, 14): "E", (17, 14): "E", (16, 15): "W", (17, 15): "E",
             (19, 14): "E", (20, 14): "E", (21, 14): "E", (22, 13): "E", (19, 15): "W", (20, 15): "B", (21, 15): "E"})
    G.paint({(15, 12): "E", (16, 12): "E", (17, 12): "E", (19, 12): "E", (20, 11): "E", (21, 11): "E", (22, 12): "E"})  # brows
    G.paint({(18, 18): "s", (19, 18): "s", (15, 18): "s"})          # cheekbones
    G.paint({(20, 20): "E", (21, 20): "E", (22, 19): "E"})          # thin knowing smile


def classic():
    G = Grid()
    # legs and shoes
    G.blob(poly((12, 44), (15, 44), (15, 53), (12, 53)), lambda x, y: "l" if x == 12 else "L")
    G.blob(poly((18, 44), (21, 44), (21, 53), (18, 53)), lambda x, y: "l" if x == 18 else "L")
    G.blob(rect(12, 54, 16, 55), "F"); G.blob(rect(18, 54, 23, 55), "F")
    # long tweed coat, flaring at the hem, opening down the front
    coat = poly((11, 25), (23, 25), (26, 46), (8, 46))
    G.blob(coat, lambda x, y: "d" if x == 19 + (y - 25) // 6 else tweed(x, y))
    # Inverness cape over the shoulders
    cape = poly((10, 24), (24, 24), (29, 37), (26, 39), (8, 39), (5, 37))
    G.blob(cape, tweed)
    G.paint({(x, 38): "d" for x in range(7, 28)})
    # collar + cravat
    G.blob({(15, 24), (16, 24), (17, 24), (18, 24), (19, 24), (16, 25), (17, 25), (18, 25)}, "w", ring=False)
    G.blob({(17, 26), (17, 27)}, "R", ring=False)
    face(G, "classic")
    # sideburn curls under the hat
    G.blob({(11, 11), (12, 11), (11, 12), (12, 12), (11, 13), (12, 13), (13, 11)}, "H", ring=False)
    # deerstalker: dome, front peak over the face, back peak behind, flaps tied on top
    dome = ell(9, 2, 24, 15) & rect(0, 0, 40, 10)
    G.blob(dome, tweed)
    G.blob(poly((19, 9), (29, 9), (27, 11), (19, 11)), "d")   # front peak
    G.blob(poly((6, 10), (12, 9), (12, 11), (8, 12)), "d")    # back peak
    G.blob({(15, 1), (16, 1), (18, 1), (19, 1), (17, 2)}, "d")  # bow
    G.blob({(10, 8), (10, 9), (10, 10)}, "d", ring=False)   # flap seam
    # calabash pipe: stem from the mouth corner, bowl curving down and out
    G.blob({(23, 20), (23, 21), (24, 22), (25, 23), (26, 24)}, "c")       # stem bends down...
    bowl = {(x, y) for y, xs in {19: (27, 30), 20: (27, 30), 21: (27, 30), 22: (27, 30), 23: (27, 29), 24: (27, 28)}.items()
            for x in range(xs[0], xs[1] + 1)}
    G.blob(bowl, lambda x, y: "a" if y == 19 else ("c" if x == 27 else "A"))  # ...and the bowl curves up
    G.paint({(26, 24): "c", (27, 25): "K"})
    # magnifying glass held low in the right hand
    G.blob({(26, 37), (27, 38), (28, 39), (27, 37), (28, 38)}, "S")
    G.blob({(29, 40), (30, 41), (29, 41)}, "c")
    lens = ell(28, 41, 35, 48)
    G.blob(lens, "a")
    G.blob(ell(29, 42, 34, 47), lambda x, y: "g" if (x, y) in {(30, 43), (31, 43), (30, 44)} else "G", ring=False)
    return G.g


def modern():
    G = Grid()
    G.blob(poly((12, 44), (15, 44), (15, 53), (12, 53)), lambda x, y: "l" if x == 12 else "L")
    G.blob(poly((18, 44), (21, 44), (21, 53), (18, 53)), lambda x, y: "l" if x == 18 else "L")
    G.blob(rect(12, 54, 16, 55), "F"); G.blob(rect(18, 54, 23, 55), "F")
    # long charcoal coat flaring at the hem (back hem kicks out behind him)
    coat = poly((10, 24), (24, 24), (27, 46), (6, 46), (4, 47))
    G.blob(coat, lambda x, y: "n" if x == 19 + (y - 24) // 6 or x == 12 - (y - 24) // 8 else "N")
    G.blob({(18, 26), (18, 27), (18, 28)}, "P", ring=False)  # shirt
    # hands in pockets: just the cuffs
    G.paint({(9, 36): "n", (10, 36): "n", (24, 36): "n", (25, 36): "n"})
    face(G, "modern")
    # tall curls, swept up and over, more volume on top-back
    hair = ell(9, 4, 25, 17) & rect(0, 0, 40, 10)
    hair |= {(10, 13), (11, 13), (11, 14), (10, 14), (12, 13)}
    shine = {(12, 4), (13, 4), (16, 3), (17, 3), (21, 5), (11, 8), (15, 7), (16, 7), (20, 9), (13, 10)}

    def hfill(x, y):
        return "h" if (x, y) in shine else "H"
    curls = set()
    for cx, cy in ((9, 6), (11, 4), (14, 3), (17, 2), (20, 3), (23, 5), (24, 8), (8, 9)):
        curls |= {(cx, cy), (cx + 1, cy), (cx, cy + 1), (cx + 1, cy + 1)}
    G.blob(hair | ell(9, 4, 14, 9) | ell(13, 3, 19, 8) | ell(18, 4, 24, 9) | curls, hfill)
    G.paint({(x, y): "K" for x, y in ((13, 5), (16, 4), (19, 5), (22, 7), (12, 9), (16, 9), (10, 7))})  # curl separations
    G.blob({(21, 10), (22, 11), (23, 11)}, "H", ring=False)  # fringe curl over the brow
    # popped collar up to the ear + blue scarf knot with tails
    G.blob(poly((10, 19), (13, 21), (13, 27), (9, 27)), lambda x, y: "n" if x == 13 else "N")
    G.blob(poly((22, 21), (25, 18), (26, 26), (22, 27)), lambda x, y: "n" if x == 22 else "N")
    G.blob(poly((14, 24), (21, 24), (21, 26), (14, 26)), lambda x, y: "q" if y == 24 and x < 17 else "Q")
    G.blob(poly((16, 27), (18, 27), (19, 34), (17, 35)), "Q")
    return G.g


def silhouette(im):
    a = im.split()[-1]
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out.paste((236, 226, 200, 255), (0, 0), a)
    return out


if __name__ == "__main__":
    looks = [("Classic", "Book look, OK for public use", classic()), ("Modern", "BBC look, private tests only", modern())]
    imgs = [to_img(g, 2) for _, _, g in looks]
    big = [i.resize((i.width * 3, i.height * 3), Image.NEAREST) for i in imgs]
    sil = [silhouette(i).resize((i.width * 3 // 2, i.height * 3 // 2), Image.NEAREST) for i in imgs]
    cw, ch = big[0].width + 120, big[0].height + 40
    page = Image.new("RGB", (60 + 2 * (cw + 30) + 2 * (sil[0].width + 60) + 60, ch + 260), BG)
    d = ImageDraw.Draw(page)
    d.text((60, 36), "SHERLOCK · less chibi", font=F(52), fill=INK)
    d.text((60, 100), "About 3.5 heads tall, 3/4 view. The profile does the work: nose, jaw, hat peaks, pipe, coat.", font=F(24, False), fill=MUTED)
    x = 60
    for (title, sub, _), b in zip(looks, big):
        d.rounded_rectangle((x, 160, x + cw, 160 + ch), 16, fill=PANEL)
        page.paste(b, (x + (cw - b.width) // 2, 180), b)
        d.text((x, 175 + ch), title, font=F(32), fill=GOLD)
        d.text((x, 218 + ch), sub, font=F(22, False), fill=INK)
        x += cw + 30
    d.text((x + 10, 160), "Silhouette test", font=F(26), fill=GOLD)
    for s_ in sil:
        page.paste(s_, (x + 20, 210), s_)
        x += s_.width + 60
    out = ROOT / "out" / "sheet_sherlock_tall.png"
    page.save(out)
    print("saved", page.size, imgs[0].size)
