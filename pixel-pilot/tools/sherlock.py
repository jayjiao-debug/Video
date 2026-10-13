"""Sherlock Holmes chibi, v2: rounder and cuter, modelled on the proportions of the
channel's own narrator ("Better Call Saul" guy): a huge soft-cornered head, warm skin
with blush, big shiny eyes, a short wide body and square nub hands.

Two looks:
  * classic: deerstalker with ear flaps, tweed cape, calabash pipe (public-domain
    book look)  -> sherlock_<pose>.png
  * modern: dark curls, charcoal coat, blue scarf (BBC-inspired, private tests only)
    -> sherlock_modern_<pose>.png

Shapes are built from rounded rectangles; every blob gets a 1-cell outline ring that
also draws the separation lines where it overlaps earlier blobs.
v1 (taller, thinner) is kept in tools/sherlock_v1.py and public/sprites/sherlock_v1/.
"""
from art import save
from conan_v2 import COL, to_img

PADX = 3
W, H = 22, 29
COL.update({
    "S": (252, 206, 168), "s": (232, 172, 134), "p": (244, 150, 140), "W": (255, 255, 255),
    "E": (24, 18, 22), "M": (150, 46, 52),
    "D": (156, 116, 76), "d": (118, 84, 54),                      # tweed + check
    "A": (128, 72, 40), "a": (226, 176, 84),                      # pipe bowl + rim
    "H": (50, 38, 36), "h": (92, 72, 64),                         # curls + shine
    "N": (60, 62, 76), "n": (44, 44, 56),                         # coat + seam
    "Q": (58, 98, 176), "q": (100, 140, 210),                     # scarf
    "P": (112, 72, 138), "L": (40, 38, 48), "F": (26, 20, 20), "w": (246, 246, 242),
})
POSES = ("idle", "sit", "look", "shock", "read", "think", "deduce", "blink")
PIPE_POSES = ("idle", "look", "blink", "think")
N4 = ((1, 0), (-1, 0), (0, 1), (0, -1))


def rr(x0, y0, x1, y1, r):
    """Cells of a rounded rectangle (inclusive bounds)."""
    out = []
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            dx = max(x0 + r - x, 0, x - (x1 - r))
            dy = max(y0 + r - y, 0, y - (y1 - r))
            if dx * dx + dy * dy <= r * r + 0.8 * r:
                out.append((x, y))
    return out


class Grid:
    def __init__(self):
        self.g = [["."] * (W + 2 * PADX) for _ in range(H)]

    def put(self, x, y, c):
        if -PADX <= x < W + PADX and 0 <= y < H:
            self.g[y][x + PADX] = c

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


def grid(look, pose):
    G = Grid()
    sleeve = "D" if look == "classic" else "N"
    # ---- body
    if look == "classic":
        G.blob(rr(4, 18, 17, 24, 2), tweed)
    else:
        G.blob(rr(4, 18, 17, 24, 2), lambda x, y: "n" if x in (8, 13) and y > 19 else "N")
    for x in (6, 13):  # legs + shoes
        G.blob(rr(x, 25, x + 2, 27, 0), lambda x, y: "F" if y == 27 else "L")
    if look == "classic":
        G.blob(rr(2, 18, 19, 22, 2), tweed)  # Inverness cape
        G.blob([(9, 19), (10, 19), (11, 19), (12, 19), (10, 20), (11, 20)], "w", ring=False)  # collar
    else:
        G.blob([(9, 21), (12, 21), (9, 22), (12, 22)], "P", ring=False)  # shirt
        G.blob(rr(5, 19, 16, 20, 1) + [(10, y) for y in range(21, 24)] + [(11, y) for y in range(21, 23)],
               lambda x, y: "q" if (x, y) in ((7, 19), (8, 19), (10, 22)) else "Q")  # scarf
    # ---- arms
    rest = pose not in ("shock", "think", "read")
    if rest or pose == "deduce":
        G.blob(rr(1, 20, 3, 22, 0), lambda x, y: "s" if (x, y) == (1, 22) else "S")
    if rest and pose != "deduce":
        G.blob(rr(18, 20, 20, 22, 0), lambda x, y: "s" if (x, y) == (20, 22) else "S")
    if pose == "shock":
        G.blob([(2, 19), (3, 19), (18, 19), (19, 19)], sleeve)
        G.blob(rr(-1, 16, 1, 18, 0), "S")
        G.blob(rr(20, 16, 22, 18, 0), "S")
    if pose == "deduce":
        G.blob([(21, y) for y in range(13, 21)] + [(20, 19), (20, 20)], sleeve)
        G.blob(rr(20, 10, 22, 12, 0) + [(21, 8), (21, 9)], "S")
    # ---- head (+ hat dome or curls)
    head = rr(1, 3, 20, 17, 4)
    if look == "classic":
        dome = rr(2, 1, 19, 8, 6)
        cells = set(head) | set(dome)

        def fill(x, y):
            if y <= 6:
                return tweed(x, y)
            if y == 7 and 3 <= x <= 18:
                return "d"  # front peak
            if y <= 10 and (x <= 3 or x >= 18):
                return "H"  # curls under the hat
            return "S"
        G.blob(cells, fill)
        G.blob([(10, 0), (11, 0)], "d", ring=False)  # tied flaps on top
        for x0 in (-1, 20):  # ear flaps
            G.blob(rr(x0, 7, x0 + 2, 12, 1), tweed)
        G.blob([(x, 8) for x in range(3, 19)], "K", ring=False)  # peak shadow line
    else:
        bumps = [(x, 2) for x in (4, 5, 8, 9, 10, 13, 14, 17)] + [(x, 1) for x in (9,)]
        cells = set(head) | set(bumps)
        fringe = {(x, 8) for x in (2, 3, 4, 5, 7, 8, 11, 12, 13, 15, 16, 18, 19)} | {(x, 9) for x in (2, 3, 4, 12, 18, 19)}
        shine = {(5, 4), (6, 4), (9, 3), (13, 4), (14, 5), (16, 6), (4, 6)}

        def fill(x, y):
            if (x, y) in shine:
                return "h"
            if y <= 7 or (x, y) in fringe or (y <= 11 and (x <= 2 or x >= 19)):
                return "H"
            return "S"
        G.blob(cells, fill)
    # ---- face
    put = G.put
    for x in (4, 5, 16, 17):
        put(x, 13, "p")
    L, R = (6, 7), (14, 15)

    def eye_pair(cells):
        for ex in (L[0], R[0]):
            for (dx, dy), c in cells.items():
                put(ex + dx, dy, c)
    if pose == "blink":
        eye_pair({(0, 11): "E", (1, 11): "E", (-1, 10): "E", (2, 10): "E"})
    elif pose == "idle":
        eye_pair({(0, 10): "W", (1, 10): "E", (0, 11): "E", (1, 11): "E", (0, 12): "E", (1, 12): "E"})
    elif pose == "look":
        eye_pair({(1, 10): "E", (2, 10): "W", (1, 11): "E", (2, 11): "E", (1, 12): "E", (2, 12): "E"})
    elif pose == "think":
        eye_pair({(1, 9): "E", (2, 9): "W", (1, 10): "E", (2, 10): "E"})
        for x in (5, 6, 7, 14, 15, 16):
            put(x, 8 if look == "modern" else 9, "E")
    elif pose == "shock":
        eye_pair({(0, 9): "E", (1, 9): "E", (0, 10): "W", (1, 10): "E", (0, 11): "E", (1, 11): "E", (0, 12): "E", (1, 12): "E"})
    elif pose == "sit":
        eye_pair({(-1, 11): "E", (0, 10): "E", (1, 10): "E", (2, 11): "E"})
    elif pose == "read":
        eye_pair({(0, 12): "E", (1, 12): "E", (-1, 11): "E", (2, 11): "E"})
    elif pose == "deduce":
        for x in (5, 6, 7, 8):
            put(x, 11, "E")  # narrowed left eye
        for (dx, dy), c in {(0, 10): "W", (1, 10): "E", (0, 11): "E", (1, 11): "E", (0, 12): "E", (1, 12): "E"}.items():
            put(R[0] + dx, dy, c)
        for x in (14, 15, 16):
            put(x, 8 if look == "modern" else 9, "E")  # cocked brow
    # mouth
    mouth = {
        "idle": {(9, 14): "E", (10, 15): "E", (11, 15): "E", (12, 14): "E"},
        "blink": {(9, 14): "E", (10, 15): "E", (11, 15): "E", (12, 14): "E"},
        "look": {(10, 15): "E", (11, 15): "E"},
        "sit": {(9, 14): "E", (10, 14): "E", (11, 14): "E", (12, 14): "E", (10, 15): "M", (11, 15): "M"},
        "shock": {(10, 14): "E", (11, 14): "E", (10, 15): "M", (11, 15): "M", (10, 16): "E", (11, 16): "E"},
        "read": {(10, 15): "E", (11, 15): "E"},
        "think": {(10, 15): "E", (11, 15): "E"},
        "deduce": {(9, 15): "E", (10, 15): "E", (11, 15): "E", (12, 14): "E"},
    }[pose]
    for (x, y), c in mouth.items():
        put(x, y, c)
    if look == "classic" and pose in PIPE_POSES:  # calabash pipe from the mouth corner
        G.blob(rr(14, 15, 15, 17, 0), lambda x, y: "a" if y == 15 else "A")
        put(12, 15, "A"); put(13, 15, "A")
    # ---- props / posed hands drawn last
    if pose == "think":  # steepled fingers under the chin
        G.blob([(10, 19), (11, 19)] + [(x, y) for x in range(9, 13) for y in (20, 21)], "S")
    if pose == "read":
        G.blob(rr(6, 19, 15, 22, 0), lambda x, y: "K" if x in (10, 11) else ("A" if y == 22 else "w"))
        G.blob(rr(4, 20, 5, 21, 0), "S")
        G.blob(rr(16, 20, 17, 21, 0), "S")
    return G.g


if __name__ == "__main__":
    for pose in POSES:
        save(to_img(grid("classic", pose), 2), f"sherlock_{pose}")
        save(to_img(grid("modern", pose), 2), f"sherlock_modern_{pose}")
    print("ok", to_img(grid("classic", "idle"), 2).size)
