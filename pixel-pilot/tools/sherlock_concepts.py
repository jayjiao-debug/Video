"""Sherlock v3 concepts: keep the big-head chibi proportions but give him attitude
(heavy-lidded eyes, real brows, smirk, popped collar, magnifying glass).
Three idle concepts on one page for Jay to pick a direction before drawing all poses.
Writes out/sheet_sherlock_concepts.png.
"""
import pathlib
from PIL import Image, ImageDraw
from conan_v2 import COL, to_img
from design_sheet import F, BG, PANEL, INK, MUTED, GOLD

ROOT = pathlib.Path(__file__).resolve().parent.parent
PADX, W, H = 4, 26, 34
COL.update({
    "S": (252, 206, 168), "s": (226, 164, 128), "p": (244, 146, 136), "W": (255, 255, 255),
    "E": (24, 18, 22), "M": (150, 46, 52), "B": (86, 132, 186), "b": (52, 84, 130),
    "D": (156, 116, 76), "d": (118, 84, 54), "A": (128, 72, 40), "a": (226, 176, 84),
    "H": (46, 34, 34), "h": (96, 74, 68), "N": (58, 60, 76), "n": (40, 40, 52),
    "Q": (58, 98, 176), "q": (104, 146, 214), "L": (40, 38, 48), "F": (26, 20, 20),
    "G": (186, 224, 240), "g": (246, 252, 255), "w": (246, 246, 242),
})
N4 = ((1, 0), (-1, 0), (0, 1), (0, -1))


def rr(x0, y0, x1, y1, r):
    out = []
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            dx = max(x0 + r - x, 0, x - (x1 - r))
            dy = max(y0 + r - y, 0, y - (y1 - r))
            if dx * dx + dy * dy <= r * r + 0.8 * r:
                out.append((x, y))
    return out


def disc(cx, cy, r):
    return [(x, y) for y in range(int(cy - r - 1), int(cy + r + 2)) for x in range(int(cx - r - 1), int(cx + r + 2))
            if (x - cx) ** 2 + (y - cy) ** 2 <= r * r]


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
    return "d" if (x % 3 == 0 and y % 2 == 0) or (y % 3 == 0 and x % 2 == 1) else "D"


HEAD = rr(2, 4, 23, 21, 5)


def legs(G):
    for x in (8, 15):
        G.blob(rr(x, 30, x + 2, 32, 0), lambda x, y: "F" if y == 32 else "L")


def hand(G, x, y):
    G.blob(rr(x, y, x + 2, y + 2, 0), lambda xx, yy: "s" if (xx, yy) == (x + 2, y + 2) else "S")


# ------------------------------------------------------------------ A: smug genius
def smug():
    G = Grid()
    G.blob(rr(5, 22, 20, 29, 2), lambda x, y: "n" if x in (10, 15) and y > 24 else "N")
    legs(G)
    hand(G, 2, 25); hand(G, 21, 25)
    bumps = [(x, 3) for x in (5, 6, 9, 10, 11, 14, 15, 18, 19, 21)] + [(x, 2) for x in (6, 10, 14, 15, 19)] + [(10, 1), (15, 1)]
    side = [(1, y) for y in range(8, 16)] + [(24, y) for y in range(8, 14)] + [(0, 10), (0, 11), (25, 9)]

    def fill(x, y):
        if (x, y) in {(6, 5), (7, 5), (10, 3), (11, 4), (15, 4), (16, 5), (19, 6), (4, 8), (9, 7), (13, 8), (21, 9)}:
            return "h"
        if y <= 8 or (y == 9 and x <= 13) or (y == 10 and (x <= 8 or x >= 22)) or (y == 11 and x <= 5) \
                or (x <= 3 and y <= 17) or (x >= 22 and y <= 14):
            return "H"
        return "S"
    G.blob(set(HEAD) | set(bumps) | set(side), fill)
    # heavy-lidded eyes looking sideways, one brow cocked
    for x0, flick in ((5, -1), (17, 4)):
        G.paint({(x0 + i, 13): "E" for i in range(4)})
        G.put(x0 + flick, 12 if flick > 0 else 13, "E")
        G.paint({(x0, 14): "W", (x0 + 1, 14): "W", (x0 + 2, 14): "E", (x0 + 3, 14): "E",
                 (x0, 15): "W", (x0 + 1, 15): "W", (x0 + 2, 15): "B", (x0 + 3, 15): "E"})
    G.paint({(5, 11): "E", (6, 11): "E", (7, 11): "E", (8, 11): "E"})                    # flat brow
    G.paint({(16, 11): "E", (17, 10): "E", (18, 10): "E", (19, 10): "E", (20, 11): "E"})  # cocked brow
    G.paint({(13, 16): "s", (13, 17): "s", (4, 16): "s", (21, 16): "s"})                  # nose, cheekbones
    G.paint({(5, 17): "p", (6, 17): "p", (19, 17): "p", (20, 17): "p"})
    G.paint({(10, 19): "E", (11, 19): "E", (12, 19): "E", (13, 19): "E", (14, 18): "E", (15, 18): "E"})  # smirk
    # popped collar + scarf
    G.blob(rr(2, 18, 6, 24, 1), lambda x, y: "n" if x == 6 else "N")
    G.blob(rr(19, 18, 23, 24, 1), lambda x, y: "n" if x == 19 else "N")
    G.blob(rr(8, 21, 17, 23, 1) + [(11, y) for y in range(24, 28)] + [(12, y) for y in range(24, 27)],
           lambda x, y: "q" if (x, y) in ((9, 21), (10, 21), (11, 25)) else "Q")
    return G.g


# ------------------------------------------------------------------ B: classic sleuth
def sleuth():
    G = Grid()
    G.blob(rr(6, 24, 19, 29, 2), tweed)
    legs(G)
    G.blob(rr(3, 21, 22, 26, 3), tweed)  # Inverness cape
    G.blob([(11, 22), (12, 22), (13, 22), (14, 22), (12, 23), (13, 23)], "w", ring=False)
    hand(G, 1, 25)
    dome = rr(3, 1, 22, 11, 8)

    def fill(x, y):
        if y <= 9:
            return tweed(x, y)
        if y <= 11 and 4 <= x <= 21:
            return "d"  # front peak
        if y <= 15 and (x <= 4 or x >= 21):
            return "H"
        return "S"
    G.blob(set(HEAD) | set(dome), fill)
    G.paint({(x, 12): "K" for x in range(5, 21)})
    G.blob([(10, 0), (11, 0), (14, 0), (15, 0), (12, 1), (13, 1)], "d")  # flaps tied in a bow
    # left eye squinting with curiosity, brow up
    G.paint({(5, 14): "E", (6, 14): "E", (7, 14): "E", (8, 14): "E",
             (5, 15): "W", (6, 15): "E", (7, 15): "B", (8, 15): "W", (6, 16): "E", (7, 16): "E"})
    G.paint({(5, 13): "K", (6, 12): "E", (7, 12): "E", (8, 13): "E"})
    G.paint({(4, 18): "p", (5, 18): "p", (13, 17): "s"})
    G.paint({(9, 19): "E", (10, 20): "E", (11, 20): "E", (12, 20): "E", (13, 19): "E"})  # pleased smile
    # pipe out of the left mouth corner
    G.blob(rr(5, 20, 6, 22, 0), lambda x, y: "a" if y == 20 else "A")
    G.paint({(7, 20): "A", (8, 20): "A"})
    # magnifying glass over the right eye: the eye is huge inside the lens
    lens = disc(18, 15, 4.6)
    G.blob(lens, "a")
    inner = disc(18, 15, 3.6)
    G.blob(inner, "G", ring=False)
    G.paint({(x, y): "W" for x, y in disc(18, 15.5, 2.6)})
    G.paint({(x, y): "B" for x, y in disc(18.5, 16, 1.6)})
    G.paint({(18, 16): "E", (19, 16): "E", (18, 17): "E", (19, 17): "E", (17, 15): "g", (16, 13): "g", (15, 14): "g"})
    G.paint({(16, 11): "E", (17, 11): "E", (18, 11): "E", (19, 11): "E", (20, 11): "E"})  # brow above lens
    G.blob([(22, 19), (23, 20), (24, 21), (22, 20), (23, 21)], "A")                       # handle
    hand(G, 23, 22)
    return G.g


# ------------------------------------------------------------------ C: eureka (hybrid)
def eureka():
    G = Grid()
    G.blob(rr(5, 22, 20, 29, 2), lambda x, y: "n" if x in (10, 15) and y > 24 else "N")
    legs(G)
    hand(G, 2, 25)
    dome = [(x, y) for y in range(0, 10) for x in range(2, 24) if ((x - 12.5) / 8.6) ** 2 + ((y - 9.4) / 9) ** 2 <= 1]
    domeset = set(dome)
    curls = [(x, y) for x, y in rr(1, 8, 4, 15, 1)] + [(x, y) for x, y in rr(21, 8, 24, 14, 1)] + \
            [(0, 11), (0, 12), (25, 10), (25, 11)]

    def fill(x, y):
        if (x, y) in domeset:
            return tweed(x, y) if y <= 7 else "d"
        if (x, y) in {(2, 10), (23, 11), (3, 13), (3, 6), (21, 6), (19, 4)}:
            return "h"
        if y <= 10 or (x <= 4 and y <= 15) or (x >= 21 and y <= 14) or (y == 11 and x in (10, 11, 14, 15)) or (y == 12 and x in (10, 15)):
            return "H"
        return "S"
    G.blob(set(HEAD) | set(dome) | set(curls), fill)
    G.paint({(x, 10): "K" for x in range(5, 21)})
    for x, y in dome:  # outline the cap against the curls
        for dx, dy in N4:
            n = (x + dx, y + dy)
            if n not in domeset and n[1] >= 1 and n[1] <= 9 and fill(*n) == "H":
                G.put(*n, "K")
    # big shiny eyes with a glint, brows up
    for x0 in (5, 17):
        G.paint({(x0, 13): "E", (x0 + 1, 13): "E", (x0 + 2, 13): "E", (x0 + 3, 13): "E",
                 (x0, 14): "E", (x0 + 1, 14): "W", (x0 + 2, 14): "E", (x0 + 3, 14): "E",
                 (x0, 15): "E", (x0 + 1, 15): "E", (x0 + 2, 15): "B", (x0 + 3, 15): "E",
                 (x0 + 1, 16): "E", (x0 + 2, 16): "E"})
    G.paint({(4, 18): "p", (5, 18): "p", (20, 18): "p", (21, 18): "p", (12, 17): "s"})
    # big toothy grin
    G.paint({(x, 18): "E" for x in range(9, 17)})
    G.paint({(9, 19): "E", (10, 19): "W", (11, 19): "W", (12, 19): "W", (13, 19): "W", (14, 19): "W", (15, 19): "W", (16, 19): "E"})
    G.paint({(10, 20): "E", (11, 20): "M", (12, 20): "M", (13, 20): "M", (14, 20): "M", (15, 20): "E"})
    G.paint({(11, 21): "E", (12, 21): "E", (13, 21): "E", (14, 21): "E"})
    G.blob(rr(7, 22, 18, 23, 1) + [(14, y) for y in range(24, 28)] + [(15, y) for y in range(24, 27)],
           lambda x, y: "q" if (x, y) in ((8, 22), (9, 22), (14, 25)) else "Q")
    G.blob([(23, y) for y in range(18, 26)] + [(24, y) for y in range(18, 25)], "N")  # raised arm
    hand(G, 23, 15)
    G.blob([(24, 13), (24, 14)], "S")  # finger up
    G.paint({(-1, 10): "g", (-2, 9): "g", (26, 7): "g", (27, 8): "g", (25, 6): "g"})  # sparkles
    return G.g


CONCEPTS = [
    ("A · Smug genius", "Modern. Messy dark curls, heavy-lidded side-eye, cocked brow, smirk, popped collar.", smug),
    ("B · Classic sleuth", "Book look. Deerstalker, pipe, and his eye blown up huge in the magnifying glass.", sleuth),
    ("C · Eureka!", "Hybrid. Curls spilling out of the deerstalker, sparkly eyes, big grin, finger up.", eureka),
]

if __name__ == "__main__":
    Z = 14
    imgs = [to_img(fn(), 2) for _, _, fn in CONCEPTS]
    cw = max(i.width for i in imgs) * Z // 2 + 80
    ch = max(i.height for i in imgs) * Z // 2 + 60
    page = Image.new("RGB", (3 * (cw + 30) + 90, ch + 330), BG)
    d = ImageDraw.Draw(page)
    d.text((60, 40), "SHERLOCK · personality concepts", font=F(52), fill=INK)
    d.text((60, 104), "Same big-head chibi, three attitudes. Pick one and I'll draw every pose in it.", font=F(24, False), fill=MUTED)
    for i, ((title, sub, _), im) in enumerate(zip(CONCEPTS, imgs)):
        x = 60 + i * (cw + 30)
        d.rounded_rectangle((x, 170, x + cw, 170 + ch), 16, fill=PANEL)
        big = im.resize((im.width * Z // 2, im.height * Z // 2), Image.NEAREST)
        page.paste(big, (x + (cw - big.width) // 2, 170 + (ch - big.height) // 2), big)
        d.text((x, 190 + ch), title, font=F(32), fill=GOLD)
        words, line, yy = sub.split(), "", 240 + ch
        for w_ in words:
            if d.textlength(line + " " + w_, font=F(22, False)) > cw:
                d.text((x, yy), line.strip(), font=F(22, False), fill=INK); yy += 30; line = ""
            line += " " + w_
        d.text((x, yy), line.strip(), font=F(22, False), fill=INK)
    out = ROOT / "out" / "sheet_sherlock_concepts.png"
    page.save(out)
    print("saved", page.size)
