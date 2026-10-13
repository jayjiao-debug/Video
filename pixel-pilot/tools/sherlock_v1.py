"""Sherlock Holmes chibi in the same bead-sprite style as conan_v2, in two looks:
  * classic: deerstalker, tweed Inverness cape, calabash pipe (public-domain book look)
      -> sherlock_<pose>.png
  * modern: dark curls, long charcoal coat with turned-up collar, blue scarf
      (BBC-inspired, private tests only)  -> sherlock_modern_<pose>.png

Writes public/sprites/sherlock[_modern]_<pose>.png.
"""
from art import save
from conan_v2 import COL, to_img

PADX = 3
COL.update({
    "S": (248, 228, 212), "s": (228, 200, 186), "B": (112, 150, 182), "W": (255, 255, 255),
    "D": (150, 112, 74), "d": (112, 82, 54),                     # tweed + check
    "A": (128, 72, 40), "a": (226, 176, 84),                     # pipe bowl + rim
    "H": (44, 34, 32), "h": (82, 66, 60),                        # curls + shine
    "N": (58, 58, 70), "n": (40, 40, 50),                        # coat + seam
    "Q": (52, 86, 156), "q": (90, 126, 196),                     # scarf
    "P": (108, 68, 132), "L": (34, 34, 42), "F": (24, 20, 20), "w": (246, 246, 242),
})

HEAD = {
    "classic": [
        ".......KKKK.......",
        ".....KKDDDDKK.....",
        "....KDDdDDdDDK....",
        "...KDDDDDDDDDDK...",
        "..KDdDDDdDDDdDDK..",
        ".KDDDDDDDDDDDDDDK.",
        ".KDDdDDDdDDDdDDDK.",
        "KDDDDDDDDDDDDDDDDK",
        "KDKddddddddddddKDK",
        "KDKKKKKKKKKKKKKKDK",
        "KdKHSSSSSSSSSSHKdK",
        "KDKSSSSSSSSSSSSKDK",
        "KDKSEESSSSSSEESKDK",
        "KdKSEBSSSSSSEBSKdK",
        ".KKSBBSSSSSSBBSKK.",
        "..KSsSSSSSSSSsSK..",
        "..KSSSSSSSSSSSSK..",
        "...KKSSSSSSSSKK...",
    ],
    "modern": [
        "....KK.KKK.KK.....",
        "...KHHKHHHKHHKK...",
        "..KHHhHHHHHHhHHK..",
        ".KHHHHHhhHHHHHhHK.",
        "KHHhHHHHHHHHhHHHHK",
        "KHHHHhHHHHhHHHHhHK",
        "KHhHHHHHHHHHHHHHHK",
        "KHHHHHHhHHHHHhHHHK",
        "KHHHSSHHHHHSSHHHHK",
        "KHHSSSSHHHSSSSSHHK",
        "KHSSSSSSSSSSSSSSHK",
        "KHSHHSSSSSSHHSSSHK",
        "KHSSEESSSSSSEESSHK",
        "KHSSEBSSSSSSEBSSHK",
        ".KSSBBSSSSSSBBSSK.",
        ".KSssSSSSSSSSssSK.",
        "..KSSSSSSSSSSSSK..",
        "...KKSSSSSSSSKK...",
    ],
}
BODY = {
    "classic": [
        "...KDDDKwwKDDDK...",
        "..KDDdDDKKDDdDDK..",
        ".KDDDDDDDDDDDDDDK.",
        "KDDdDDDdDDDdDDDdDK",
        "KDDDDDDDDDDDDDDDDK",
        "KdDDDdDDDDDdDDDDdK",
        "KKKKKKKKKKKKKKKKKK",
        "..KSKDDdDDDdDKSK..",
        "...KKDDDDDDDDKK...",
        "....KDDDdDDDDK....",
        "....KDDDKKDDDK....",
        ".....KLK..KLK.....",
        ".....KFK..KFK.....",
        ".....KKK..KKK.....",
    ],
    "modern": [
        "...KKNQQQQQQNKK...",
        "..KNNNQQqQQQNNNK..",
        ".KNNNNPPQQPPNNNNK.",
        ".KNNNNnPQQPnNNNNK.",
        "KNNNNNnPQQPnNNNNNK",
        "KNNNNNnNQQNnNNNNNK",
        "KNNNNNnNQQNnNNNNNK",
        ".KSKNNnNNNNnNNKSK.",
        "..KKNNnNNNNnNNKK..",
        "...KNNnNNNNnNNK...",
        "...KNNnNKKNnNNK...",
        ".....KLK..KLK.....",
        ".....KFK..KFK.....",
        ".....KKK..KKK.....",
    ],
}
HAND_ROW = 25
HANDS = {"classic": (3, 14), "modern": (2, 15)}
SLEEVE = {"classic": "D", "modern": "N"}
PIPE_POSES = ("idle", "look", "blink", "think")
POSES = ("idle", "sit", "look", "shock", "read", "think", "deduce", "blink")


def grid(look, pose):
    rows = HEAD[look] + BODY[look]
    for y, r in enumerate(rows):
        assert len(r) == 18, (look, y, len(r))
    g = [list("." * PADX + r + "." * PADX) for r in rows]
    W = len(g[0])
    put = lambda x, y, c: g[y].__setitem__(x + PADX, c)
    get = lambda x, y: g[y][x + PADX]
    # eyes: 2x3 blocks at cols 4-5 and 12-13, rows 12-14
    eyes = {
        "idle": ["EE", "EB", "BB"], "look": ["SE", "SE", "SB"], "think": ["SS", "EE", "BB"],
        "shock": ["EE", "EE", "SS"], "deduce": ["EE", "EW", "BB"],
        "sit": ["SS", "ES", "SE"], "read": ["SS", "SS", "EE"], "blink": ["SS", "SS", "EE"],
    }[pose]
    for ex in (4, 12):
        for dy, pair in enumerate(eyes):
            if pose == "sit" and ex == 12:
                pair = pair[::-1]
            put(ex, 12 + dy, pair[0]); put(ex + 1, 12 + dy, pair[1])
    # brows (modern has them drawn in; classic gets them for expressive poses)
    brow = "H" if look == "modern" else "E"
    if pose in ("shock", "think"):
        for x in (4, 5, 12, 13):
            if look == "modern":
                put(x, 11, "S")
            put(x, 10, brow)
    elif pose == "deduce":  # one cocked brow, the other low and sharp
        if look == "modern":
            put(12, 11, "S"); put(13, 11, "S")
        put(12, 10, brow); put(13, 10, brow)
        put(4, 11, brow); put(5, 11, brow)
    # mouth, row 16
    pipe = look == "classic" and pose in PIPE_POSES
    if pose == "shock":
        put(8, 16, "M"); put(9, 16, "M")
    elif pose == "sit":
        put(7, 15, "E"); put(8, 16, "E"); put(9, 16, "E"); put(10, 15, "E")
    elif pose == "deduce":
        put(7, 16, "E"); put(8, 16, "E"); put(9, 16, "E"); put(10, 15, "E")  # smirk
    elif not pipe:
        put(8, 16, "E"); put(9, 16, "E")
    if pipe:  # calabash: stem from the mouth, curving down to a bowl on the right
        put(8, 16, "E"); put(9, 16, "A"); put(10, 16, "A"); put(11, 17, "A")
        for x, y in ((12, 17), (13, 17), (12, 18), (13, 18), (12, 19), (13, 19)):
            put(x, y, "A")
        put(12, 16, "a"); put(13, 16, "a"); put(11, 16, "K"); put(14, 16, "K")
        put(11, 18, "K"); put(14, 17, "K"); put(14, 18, "K"); put(14, 19, "K")
        put(12, 20, "K"); put(13, 20, "K"); put(11, 19, "K")
        put(12, 15, "K"); put(13, 15, "K")
    # arms
    new = []
    def paint(x, y, c):
        put(x, y, c); new.append((x + PADX, y))
    hl, hr = HANDS[look]
    sleeve = SLEEVE[look]
    def lower(hx):
        put(hx, HAND_ROW, "K")
        side = -1 if hx < 9 else 1
        if get(hx + side, HAND_ROW) == "K":
            put(hx + side, HAND_ROW, ".")
    if pose == "shock":
        lower(hl); lower(hr)
        for hx, ax in ((-2, -1), (17, 17)):
            for x in (hx, hx + 1):
                paint(x, 18, "S"); paint(x, 19, "S")
            for y in range(20, 24):
                paint(ax, y, sleeve)
    if pose == "deduce":  # finger to the temple, sleeve down the side
        lower(hr)
        for (x, y) in ((17, 13), (18, 13), (17, 14), (18, 14), (18, 11), (18, 12)):
            paint(x, y, "S")
        for y in range(15, 24):
            paint(17, y, sleeve)
    if pose == "think":  # steepled fingers under the chin ("mind palace")
        lower(hl); lower(hr)
        for x, c in zip(range(7, 11), "KSSK"):
            put(x, 18, c)
        for x, c in zip(range(6, 12), "KSSSSK"):
            put(x, 19, c)
        put(8, 17, "K") if get(8, 17) == "." else None
    if pose == "read":  # small book held in front
        lower(hl); lower(hr)
        for y, row in zip(range(21, 25), ("KKKKKKKK", "KwwKwwwK", "KwwKwwwK", "KKKKKKKK")):
            for dx, c in enumerate(row):
                put(5 + dx, y, c)
        put(4, 22, "S"); put(13, 22, "S"); put(4, 23, "K"); put(13, 23, "K")
    for x, y in new:
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < W and 0 <= ny < len(g) and g[ny][nx] == ".":
                g[ny][nx] = "K"
    return g


if __name__ == "__main__":
    for pose in POSES:
        save(to_img(grid("classic", pose), 2), f"sherlock_{pose}")
        save(to_img(grid("modern", pose), 2), f"sherlock_modern_{pose}")
    print("ok", to_img(grid("classic", "idle"), 2).size)
