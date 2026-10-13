"""Cute and consistent Holmes: the image-generator bodies (chubby mitten hands, round
shapes) with ONE head pasted on every pose.

The master head is cut from holmes_gen_deduce (big round head, blush, shiny eyes).
Each pose keeps its own generated body and arms; its generated head is cut away by
flood fill (black outline is the barrier) and the master head goes in its place,
aligned on the chin. Raised hands, the magnifier and the pointing finger are drawn
back over the head. Expressions redraw only eyes, brows and mouth on the master.

compose(pose, expr, head_dy=0) -> RGBA cell array. Running the file writes
public/sprites/holmes_<pose>.png and out/holmes_hybrid_sheet.png.
"""
import pathlib
from collections import deque
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = pathlib.Path(__file__).resolve().parent.parent
SPR = ROOT / "public" / "sprites"
K = (18, 14, 16)
SKIN, SKIN_SH, BLUSH, HAND = (249, 216, 188), (228, 163, 134), (249, 202, 171), (243, 196, 166)
WHITE, MOUTH_IN, TONGUE, BROW = (255, 255, 255), (120, 40, 44), (222, 120, 116), (39, 26, 25)
N4 = ((1, 0), (-1, 0), (0, 1), (0, -1))


def load(p):
    return np.array(Image.open(SPR / f"holmes_gen_{p}.png").convert("RGBA"))[::2, ::2].copy()


def is_k(px):
    return px[3] > 0 and int(px[0]) + int(px[1]) + int(px[2]) < 60


def head_mask(a, limit=None):
    """Hat + face + hair: flood through non-outline cells from a hat seed and a face seed,
    then grow one cell to take the outline ring."""
    h, w = a.shape[:2]
    ys, xs = np.where(a[..., 3] > 0)
    cx = int(np.median(xs[ys < 20]))
    skin = (a[..., 0] > 235) & (a[..., 1] > 195) & (a[..., 3] > 0)
    seeds = [(cx, 8)]
    face_pts = [(x, y) for y in range(26, 31) for x in range(cx - 4, cx + 5) if skin[y, x]]
    seeds.append(face_pts[len(face_pts) // 2])
    white = (a[..., :3].min(-1) > 200) & (a[..., 2] > 225) & (a[..., 3] > 0)
    limit = limit or min(y for y in range(26, h) if white[y, cx - 6:cx + 7].any())   # cravat top
    m = np.zeros((h, w), bool)
    q = deque(s for s in seeds if not is_k(a[s[1], s[0]]))
    for x, y in q:
        m[y, x] = True
    while q:
        x, y = q.popleft()
        for dx, dy in N4:
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < limit and not m[ny, nx] and a[ny, nx, 3] > 0 and not is_k(a[ny, nx]):
                m[ny, nx] = True
                q.append((nx, ny))
    grown = m.copy()
    for dx, dy in N4:
        grown |= np.roll(np.roll(m, dy, 0), dx, 1) & (a[..., 3] > 0) & np.array([[is_k(a[y, x]) for x in range(w)] for y in range(h)])
    return ndimage.binary_fill_holes(grown)      # eyes, brows, mouth inside the face


def chin(mask):
    """(hat centre x, bottom row) of the head mask."""
    ys, xs = np.where(mask)
    hat = xs[ys < 16]
    return int(round((hat.min() + hat.max()) / 2)), int(ys.max())


# ------------------------------------------------------------------ master head
SRC = load("deduce")
HM = head_mask(SRC)
HM[24:, 41:] = False                      # pointing finger
HEAD = np.where(HM[..., None], SRC, 0).astype(np.uint8)
HCX, HBOT = chin(HM)
H, W = SRC.shape[:2]


def face(expr):
    """Master head with eyes / brows / mouth redrawn for one expression."""
    a = HEAD.copy()

    def put(x, y, c):
        a[y, x] = (*c, 255)
    # wipe the generated features (only dark cells inside the face)
    for y in range(19, 33):
        for x in range(19, 40):
            if a[y, x, 3] and int(a[y, x, :3].astype(int).sum()) < 200 and not (y >= 30 and x < 21):
                put(x, y, SKIN_SH if y <= 20 else SKIN)

    L, R = 23, 35                          # eye centre columns (near eye on the right is wider)

    def eye(cx, wide, dy=0, dx=0, big=False):
        x0 = cx - 1 + dx
        x1 = x0 + (3 if wide else 2) + (1 if big else 0)
        top, bot = 22 + dy - (1 if big else 0), 26 + dy
        for y in range(top, bot + 1):
            for x in range(x0, x1):
                corner = (y in (top, bot)) and (x in (x0, x1 - 1))
                if not corner:
                    put(x, y, K)
        put(x0 + (1 if big else 0), top + 1, WHITE)          # shine
        if big:
            put(x0 + 2, bot - 1, WHITE)

    def closed(cx, wide, happy=True):
        """happy: upside-down U (^); else a soft lid line."""
        x0, x1 = cx - 1, cx + (2 if wide else 1)
        if happy:
            put(x0, 25, K); put(x1, 25, K)
            for x in range(x0 + 1, x1):
                put(x, 24, K)
        else:
            for x in range(x0, x1 + 1):
                put(x, 25, K)
            put(x0 - 1, 24, K) if False else None

    def brows(lift_l=0, lift_r=0, tilt=0):
        """tilt>0: inner ends down (determined); tilt<0: inner ends up (worried)."""
        for i, x in enumerate(range(21, 25)):
            y = 20 - lift_l + (1 if (tilt > 0 and i == 3) else 0) - (1 if (tilt < 0 and i == 3) else 0)
            put(x, y, BROW)
        for i, x in enumerate(range(34, 38)):
            y = 20 - lift_r + (1 if (tilt > 0 and i == 0) else 0) - (1 if (tilt < 0 and i == 0) else 0)
            put(x, y, BROW)

    def smile(wide=False):
        x0, x1 = (27, 32) if wide else (28, 31)
        put(x0, 28, K); put(x1, 28, K)
        for x in range(x0 + 1, x1):
            put(x, 29, K)

    def flat():
        for x in range(28, 32):
            put(x, 29, K)

    def open_mouth(w, h, x0=None, tongue=True):
        x0 = x0 if x0 is not None else 30 - w // 2
        for y in range(28, 28 + h):
            for x in range(x0, x0 + w):
                edge = y in (28, 27 + h) or x in (x0, x0 + w - 1)
                corner = (y in (28, 27 + h)) and (x in (x0, x0 + w - 1))
                if corner:
                    continue
                c = K if edge else (TONGUE if tongue and y == 26 + h and h > 3 else MOUTH_IN)
                put(x, y, c)

    def grin():
        """Laugh: wide D mouth, flat top, round bottom, tongue."""
        rows = {28: (26, 33), 29: (26, 33), 30: (27, 32), 31: (28, 31)}
        for y, (x0, x1) in rows.items():
            for x in range(x0, x1 + 1):
                edge = y == 28 or x in (x0, x1) or y == 31
                put(x, y, K if edge else (TONGUE if y == 30 else MOUTH_IN))

    if expr in ("neutral", "talk1", "talk2"):
        eye(L, False); eye(R, True); brows()
        {"neutral": smile, "talk1": lambda: open_mouth(4, 3), "talk2": lambda: open_mouth(4, 4)}[expr]()
    elif expr == "blink":
        closed(L, False, happy=False); closed(R, True, happy=False); brows(); smile()
    elif expr == "happy":
        closed(L, False); closed(R, True); brows(1, 1); grin()
    elif expr == "shock":
        eye(L, False, big=True); eye(R, True, big=True); brows(2, 2); open_mouth(4, 5)
    elif expr == "think":
        eye(L, False, dy=-1, dx=1); eye(R, True, dy=-1, dx=1); brows(0, 2, tilt=0)
        for x in range(29, 32):
            put(x, 29, K)
        put(32, 28, K)
    elif expr == "look":
        eye(L, False, dx=1); eye(R, True, dx=1); brows(0, 1); smile()
    elif expr == "read":
        eye(L, False, dy=1); eye(R, True, dy=1); brows(); smile()
    elif expr == "smug":
        eye(L, False); eye(R, True); brows(0, 1, tilt=1); smile(wide=True)
    return a


# ------------------------------------------------------------------ bodies
BODY_SRC = {"idle": "sit", "deduce": "deduce", "shock": "shock", "think": "think",
            "read": "read", "magnify": "magnify"}
LIMIT = {"read": 37}                                  # head sits low, cravat shows beside the chin
KEEP_OUT = {"deduce": [(41, 24, W, H)],              # cells that are hands / props, not head
            "think": [(17, 33, 29, 40)],
            "magnify": [(0, 19, 15, H)]}
OVER_BOXES = {"think": [(17, 33, 29, 40)]}            # drawn over the head even though low
DROP = {"magnify": [(40, 0, W, 31)],                 # leftover hat flap / ear from the generated head
        "shock": [(42, 15, W, 27)]}
# mitten hands drawn on top: (pattern, x, y); s skin, h skin shadow, K outline
FIST_CHIN = (".KK.....",
             "KsK.....",
             "KsK.....",
             "KsKKKKK.",
             "KssssssK",
             "KssssssK",
             "KhhhhhhK",
             ".KKKKKK.")
HANDS = {"think": [(FIST_CHIN, 22, 31)]}


def drop_specks(m, n=5):
    lab, k = ndimage.label(m)
    for i in range(1, k + 1):
        if (lab == i).sum() < n:
            m[lab == i] = False
    return m


BODIES = {}
for name, src in BODY_SRC.items():
    a = load(src)
    m = head_mask(a, LIMIT.get(src))
    cx, bot = chin(m)
    for x0, y0, x1, y1 in KEEP_OUT.get(src, []):
        m[y0:y1, x0:x1] = False
    body = np.where(m[..., None], 0, a).astype(np.uint8)
    for x0, y0, x1, y1 in DROP.get(src, []):
        body[y0:y1, x0:x1] = 0
    # what is left above the shoulders is a raised hand or prop: it goes over the head
    over = np.zeros((H, W), bool)
    over[:bot - 5] = body[:bot - 5, :, 3] > 0
    for x0, y0, x1, y1 in OVER_BOXES.get(name, []):
        over[y0:y1, x0:x1] |= body[y0:y1, x0:x1, 3] > 0
    stray = over & ~drop_specks(over.copy())
    lab, k = ndimage.label(over)
    dark = body[..., :3].astype(int).sum(-1) < 160
    for i in range(1, k + 1):                         # outline slivers of the old head
        if dark[lab == i].mean() > 0.6:
            stray |= lab == i
    body[stray] = 0
    over &= ~stray
    BODIES[name] = (body, over, cx, bot)


def compose(pose, expr, head_dy=0):
    body, over, cx, bot = BODIES[pose]
    head = face(expr)
    dx, dy = cx - HCX, bot - HBOT + head_dy
    out = Image.fromarray(np.where(over[..., None], 0, body).astype(np.uint8), "RGBA")
    shifted = np.zeros_like(head)
    ys, xs = np.where(head[..., 3] > 0)
    ny, nx = ys + dy, xs + dx
    ok = (ny >= 0) & (ny < H) & (nx >= 0) & (nx < W)
    shifted[ny[ok], nx[ok]] = head[ys[ok], xs[ok]]
    out.alpha_composite(Image.fromarray(shifted, "RGBA"))
    out.alpha_composite(Image.fromarray(np.where(over[..., None], body, 0).astype(np.uint8), "RGBA"))
    out = np.array(out)
    for pat, x0, y0 in HANDS.get(pose, []):
        for j, row in enumerate(pat):
            for i, c in enumerate(row):
                if c != ".":
                    out[y0 + j, x0 + i] = (*{"K": K, "s": HAND, "h": SKIN_SH}[c], 255)
    return out


POSES = {"idle": ("idle", "neutral"), "blink": ("idle", "blink"), "talk1": ("idle", "talk1"),
         "talk2": ("idle", "talk2"), "look": ("idle", "look"), "sit": ("idle", "happy"),
         "shock": ("shock", "shock"), "think": ("think", "think"), "deduce": ("deduce", "smug"),
         "read": ("read", "read"), "magnify": ("magnify", "smug")}


def save(a, path, z=2):
    im = Image.fromarray(a, "RGBA")
    im.resize((im.width * z, im.height * z), Image.NEAREST).save(path)


if __name__ == "__main__":
    sheet_order = ["idle", "blink", "talk2", "look", "sit", "deduce", "think", "shock", "read", "magnify"]
    tiles = {}
    for name, (pose, expr) in POSES.items():
        a = compose(pose, expr)
        tiles[name] = a
        save(a, SPR / f"holmes_{name}.png")
    Z = 6
    page = Image.new("RGBA", (len(sheet_order) * (W * Z + 20) + 20, H * Z + 40), (40, 30, 50, 255))
    for i, n in enumerate(sheet_order):
        im = Image.fromarray(tiles[n], "RGBA").resize((W * Z, H * Z), Image.NEAREST)
        page.alpha_composite(im, (20 + i * (W * Z + 20), 20))
    page.save(ROOT / "out" / "holmes_hybrid_sheet.png")
    print("head chin", HCX, HBOT, {k: v[2:] for k, v in BODIES.items()})
