"""One consistent Holmes: every pose is built from the single idle drawing.

The idle sprite (53x68 art cells) is the master. Expressions only redraw the eyes,
brows and mouth on that same face; gestures erase the hanging arms and draw new
sleeves and hands in the idle's own palette, with a 1-cell outline. So head, hat,
coat and proportions never change between poses.

compose(expr, arms) -> RGBA cell array. Running the file writes
public/sprites/holmes_<pose>.png for the standard pose names (the image-generator
versions stay as holmes_gen_<pose>.png) and out/holmes_rig_sheet.png.
"""
import pathlib
import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SPR = ROOT / "public" / "sprites"
K, COAT, COAT_HI, CHECK, COAT_SH = (18, 14, 16), (121, 75, 53), (132, 86, 65), (61, 29, 19), (105, 66, 50)
SKIN, SKIN_SH, MOUTH, RED, TONGUE, WHITE = (249, 202, 171), (228, 163, 134), (39, 26, 25), (150, 46, 52), (226, 120, 120), (255, 255, 255)
BLUSH, INSIDE = (240, 160, 146), (96, 36, 38)
PAGE, PAGE_SH, COVER, BRASS, GLASS = (240, 232, 212), (206, 192, 166), (90, 43, 28), (226, 176, 84), (176, 214, 232)
EYES = ((21, 22), (32, 33))       # eye columns; eyes sit on rows 20..23
MOUTH_ROW, MOUTH_X = 26, (25, 29)
N4 = ((1, 0), (-1, 0), (0, 1), (0, -1))


def load(name):
    return np.array(Image.open(SPR / f"{name}.png").convert("RGBA"))[::2, ::2].astype(np.uint8).copy()


MASTER_FILE = SPR / "holmes_gen_idle.png"
if not MASTER_FILE.exists():
    Image.open(SPR / "holmes_idle.png").save(MASTER_FILE)
MASTER = load("holmes_gen_idle")
H, W = MASTER.shape[:2]


class Canvas:
    def __init__(self, a):
        self.a = a.copy()
        self.new = set()

    def put(self, x, y, c, mark=True):
        if 0 <= x < W and 0 <= y < H:
            self.a[y, x] = (*c, 255)
            if mark:
                self.new.add((x, y))

    def clear(self, x, y):
        if 0 <= x < W and 0 <= y < H:
            self.a[y, x] = 0

    def outline_new(self):
        """1-cell K ring around freshly drawn cells (over empty space and over the old drawing)."""
        for x, y in list(self.new):
            for dx, dy in N4:
                n = (x + dx, y + dy)
                if n not in self.new and 0 <= n[0] < W and 0 <= n[1] < H:
                    self.a[n[1], n[0]] = (*K, 255)
        self.new = set()

    def close_edge(self, rows, side):
        """After erasing an arm, re-ink the torso's outer edge on those rows."""
        for y in rows:
            xs = np.where(self.a[y, :, 3] > 0)[0]
            if len(xs):
                x = xs.min() if side == "L" else xs.max()
                self.a[y, x] = (*K, 255)


# ------------------------------------------------------------------ face
def face(cv, expr):
    a = cv.a
    put = lambda x, y, c: cv.put(x, y, c, mark=False)

    def wipe_eyes():
        for x0, x1 in EYES:
            for y in range(19, 24):
                for x in range(x0 - 1, x1 + 2):
                    if a[y, x, :3].astype(int).sum() < 200:
                        put(x, y, SKIN)

    def wipe_mouth():
        for x in range(MOUTH_X[0] - 1, MOUTH_X[1] + 2):
            for y in range(MOUTH_ROW - 1, MOUTH_ROW + 4):
                if a[y, x, :3].astype(int).sum() < 300 or tuple(a[y, x, :3]) in (RED, TONGUE):
                    put(x, y, SKIN)

    def eyes(rows, shift=0, glint=False):
        wipe_eyes()
        for x0, x1 in EYES:
            for y in rows:
                put(x0 + shift, y, K); put(x1 + shift, y, K)
            if glint:
                put(x0 + shift, rows[0], WHITE)

    def brows(left, right):
        for (x0, x1), lift in zip(EYES, (left, right)):
            if lift is None:
                continue
            y = 18 - lift
            for x in range(x0 - 1, x1 + 2):
                put(x, y, K)
            if lift:
                put(x0 - 2, y + 1, K) if (x0 - 2) >= 0 else None
                put(x1 + 2, y + 1, K)

    def round_eye(x0, y0, w, h, shine=1, shine_at=(0, 0)):
        for y in range(y0, y0 + h):
            for x in range(x0, x0 + w):
                corner = w > 2 and (y in (y0, y0 + h - 1)) and (x in (x0, x0 + w - 1))
                if not corner:
                    put(x, y, K)
        if shine:   # 2-wide: a top pixel; 3-wide: left of the second row
            put(*((x0 + shine_at[0], y0 + shine_at[1]) if w == 2 else (x0, y0 + 1)), WHITE)
        if shine == 2:
            put(x0 + w - 2, y0 + h - 2, WHITE)

    def blush():
        for (x0, x1), side in zip(EYES, (-1, 1)):
            cx = x0 - 2 if side < 0 else x1 + 2
            for x in (cx - 1, cx, cx + 1):
                if a[24, x, 3] and a[24, x, :3].astype(int).sum() > 500:
                    put(x, 24, BLUSH)

    def smile(wide=False, lopsided=False):
        x0, x1 = (24, 30) if wide else (25, 29)
        for x in range(x0 + 1, x1):
            put(x, 26, K)
        put(x0, 25, K)
        put(x1, 25, K)
        if lopsided:
            put(x1 + 1, 24, K)

    def grin():
        """Laugh: wide D mouth with a tongue."""
        for x in range(24, 31):
            put(x, 25, K)
        put(24, 26, K); put(30, 26, K)
        for x in range(25, 30):
            put(x, 26, INSIDE)
        put(25, 27, K); put(29, 27, K)
        for x in range(26, 29):
            put(x, 27, TONGUE)
        for x in range(26, 29):
            put(x, 28, K)

    def o_mouth():
        """Shock: small dark oval, tongue at the bottom (no red lipstick O)."""
        for x in range(26, 29):
            put(x, 25, K); put(x, 29, K)
        for y in range(26, 29):
            put(25, y, K); put(29, y, K)
        for x in range(26, 29):
            put(x, 26, INSIDE); put(x, 27, INSIDE)
            put(x, 28, TONGUE)

    if expr == "neutral":
        return
    if expr == "blink":
        wipe_eyes()
        for x0, x1 in EYES:
            for x in range(x0 - 1, x1 + 2):
                put(x, 23, MOUTH)
    elif expr == "happy":
        wipe_eyes(); wipe_mouth(); blush()
        for x0, x1 in EYES:  # ^ ^ arcs
            put(x0 - 1, 22, K); put(x0, 21, K); put(x1, 21, K); put(x1 + 1, 22, K)
        grin()
    elif expr == "shock":
        wipe_eyes(); wipe_mouth(); blush()
        for x0, x1 in EYES:   # bigger round eyes with two sparkles
            round_eye(x0 - 1, 19, 3, 5, shine=1)
        o_mouth()
    elif expr == "think":
        wipe_eyes(); wipe_mouth()
        for x0, x1 in EYES:   # looking up and to the side
            round_eye(x0, 19, 2, 4, shine=1, shine_at=(1, 0))
        brows(None, 0)
        for x in range(27, 30):                 # "hmm" pushed to one side
            put(x, 26, K)
        put(30, 25, K)
    elif expr == "look":
        wipe_eyes(); wipe_mouth()
        for x0, x1 in EYES:
            round_eye(x0 + 1, 20, 2, 4, shine=1, shine_at=(1, 0))
        smile()
    elif expr == "read":
        wipe_eyes(); wipe_mouth()
        for x0, x1 in EYES:   # looking down at the page
            round_eye(x0, 21, 2, 3, shine=0)
        smile()
    elif expr == "smug":
        # confident, not sleepy: open eyes with a shine, one brow up, a lopsided grin
        wipe_eyes(); wipe_mouth(); blush()
        for x0, x1 in EYES:
            round_eye(x0, 20, 2, 4, shine=1)
        brows(None, 0)
        smile(wide=True)
    elif expr.startswith("talk"):
        # small dark mouth shapes in the same ink as the drawn smile (no lipstick red)
        wipe_mouth()
        inside = (96, 36, 38)
        for x in range(25, 30):
            put(x, 26, K)
        if expr == "talk1":            # just parted
            for x in range(26, 29):
                put(x, 27, K)
        else:                          # open
            put(25, 27, K); put(29, 27, K)
            for x in range(26, 29):
                put(x, 27, inside)
            for x in range(26, 29):
                put(x, 28, K)


# ------------------------------------------------------------------ arms
def erase_arm(cv, side):
    if side == "L":
        for y in range(35, 52):
            for x in range(0, 14 if y < 47 else 14):
                cv.clear(x, y)
        for y in range(35, 39):
            for x in range(0, 13):
                cv.clear(x, y)
        cv.close_edge(range(35, 52), "L")
        drop_specks(cv)
    else:
        for y in range(36, 52):
            for x in range(38, W):
                cv.clear(x, y)
        cv.close_edge(range(36, 52), "R")
    drop_specks(cv)


def drop_specks(cv):
    """Remove outline cells left floating after an erase (no filled neighbour)."""
    a = cv.a
    for y in range(30, H):
        for x in range(W):
            if a[y, x, 3] and tuple(a[y, x, :3]) == K:
                filled = [a[y + dy, x + dx] for dx, dy in N4 if 0 <= x + dx < W and 0 <= y + dy < H]
                if not any(n[3] and tuple(n[:3]) != K for n in filled):
                    a[y, x] = 0


def sleeve(cv, pts, thick=3):
    """Thick polyline of coat cells through pts (with check stripes), outlined later."""
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        n = max(abs(x1 - x0), abs(y1 - y0), 1)
        for i in range(n + 1):
            x = round(x0 + (x1 - x0) * i / n)
            y = round(y0 + (y1 - y0) * i / n)
            for dx in range(-(thick // 2), thick - thick // 2):
                for dy in range(-(thick // 2), thick - thick // 2):
                    xx, yy = x + dx, y + dy
                    c = CHECK if (xx + yy) % 5 == 0 else (COAT_HI if dx == -(thick // 2) else COAT)
                    cv.put(xx, yy, c)


def hand(cv, x, y, w=3, h=3):
    for dy in range(h):
        for dx in range(w):
            cv.put(x + dx, y + dy, SKIN_SH if (dx == w - 1 and dy == h - 1) else SKIN)


def arms(cv, kind):
    if kind == "rest":
        return
    if kind == "finger":            # right hand up beside the head, index finger raised
        erase_arm(cv, "R")
        sleeve(cv, [(37, 38), (41, 41), (42, 33)])
        hand(cv, 41, 29)
        for y in (26, 27, 28):
            cv.put(42, y, SKIN)
    elif kind == "chin":            # right hand to the chin
        erase_arm(cv, "R")
        sleeve(cv, [(37, 38), (39, 44), (35, 38), (33, 34)])
        hand(cv, 31, 30)
    elif kind == "up":              # both hands thrown up
        erase_arm(cv, "L"); erase_arm(cv, "R")
        sleeve(cv, [(15, 37), (10, 33), (8, 30)])
        sleeve(cv, [(37, 37), (42, 33), (44, 30)])
        hand(cv, 6, 26); hand(cv, 44, 26)
    elif kind == "book":            # open book held in front of the chest
        erase_arm(cv, "L"); erase_arm(cv, "R")
        sleeve(cv, [(15, 37), (13, 41), (15, 44)])
        sleeve(cv, [(37, 37), (39, 41), (37, 44)])
        cv.outline_new()
        for y in range(38, 48):
            for x in range(17, 36):
                edge = y in (38, 47) or x in (17, 35)
                spine = x == 26
                c = COVER if edge else (K if spine else (PAGE_SH if (y % 2 == 0 and x not in (18, 34)) else PAGE))
                cv.put(x, y, c)
        cv.outline_new()
        hand(cv, 15, 43); hand(cv, 35, 43)
    elif kind == "magnify":         # right hand up holding a magnifying glass by the face
        erase_arm(cv, "R")
        sleeve(cv, [(37, 38), (41, 41), (42, 34)])
        cv.outline_new()
        for y in range(27, 32):
            cv.put(43, y, COVER)
        cx, cy, r = 43, 22, 4.2
        for y in range(16, 29):
            for x in range(37, 50):
                d = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
                if d < r - 0.6:
                    cv.put(x, y, WHITE if (x - cx, y - cy) in ((-1, -2), (-2, -1)) else GLASS)
                elif d < r + 0.5:
                    cv.put(x, y, BRASS)
        cv.outline_new()
        hand(cv, 42, 30)
    cv.outline_new()


POSES = {   # pose name -> (expression, arms)
    "idle": ("neutral", "rest"), "blink": ("blink", "rest"), "sit": ("happy", "rest"),
    "look": ("look", "rest"), "shock": ("shock", "up"), "read": ("read", "book"),
    "think": ("think", "chin"), "deduce": ("smug", "finger"), "magnify": ("smug", "magnify"),
    "talk1": ("talk1", "rest"), "talk2": ("talk2", "rest"),
}


def compose(expr, arm):
    cv = Canvas(MASTER)
    face(cv, expr)
    arms(cv, arm)
    return cv.a


def to_png(a):
    im = Image.fromarray(a, "RGBA")
    return im.resize((im.width * 2, im.height * 2), Image.NEAREST)


if __name__ == "__main__":
    for p in ("idle", "sit", "look", "shock", "read", "think", "deduce", "magnify"):
        src = SPR / f"holmes_{p}.png"
        gen = SPR / f"holmes_gen_{p}.png"
        if src.exists() and not gen.exists():
            Image.open(src).save(gen)
    for p, (e, a) in POSES.items():
        to_png(compose(e, a)).save(SPR / f"holmes_{p}.png")
    names = list(POSES)
    ims = [to_png(compose(*POSES[p])) for p in names]
    w, h = ims[0].size
    page = Image.new("RGBA", (len(ims) * (w + 6), h), (43, 34, 56, 255))
    for i, im in enumerate(ims):
        page.alpha_composite(im, (i * (w + 6), 0))
    page.resize((page.width * 2, page.height * 2), Image.NEAREST).save(ROOT / "out" / "holmes_rig_sheet.png")
    print("ok", names)
