"""Art for Ep1 《消失的13号房》. Generated sources in art_src/ are edited where a clue needs an exact
count (five windows per floor), then pixelised to the 216x384 grid like case01/case_art.py.

python3 room13_art.py   -> art/*.png
"""
import pathlib, sys
import numpy as np
from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "case01"))
import case_art   # noqa: E402
from case_art import mode_down   # noqa: E402

SRC, OUT = HERE / "art_src", HERE / "art"

# facade_gen.webp has three windows per floor; the clue needs five identical ones.
# Each floor: (y0, y1) rows covering lintel to flower box, and the source tile's x range.
FLOORS = [(244, 418), (462, 674), (788, 1020)]
TILE_X = (160, 282)
WALL = (85, 780)
BRICK_X = (284, 360)          # a strip of plain brick between two windows, same rows
WIN_LOW = 2                   # 二楼: the row just above the shop front (rooms 11-15)
CURTAIN = (52, 44, 70)


def five_windows(src):
    a = np.array(src.convert("RGB"))
    tw = TILE_X[1] - TILE_X[0]
    step = (WALL[1] - WALL[0]) / 5
    for fi, (y0, y1) in enumerate(FLOORS):
        tile = a[y0:y1, TILE_X[0]:TILE_X[1]].copy()
        brick = a[y0:y1, BRICK_X[0]:BRICK_X[1]]
        bw = brick.shape[1]
        for x in range(WALL[0], WALL[1]):              # wipe the row back to plain brick
            a[y0:y1, x] = brick[:, (x - WALL[0]) % bw]
        for i in range(5):
            cx = WALL[0] + step * (i + 0.5)
            x0 = int(round(cx - tw / 2))
            a[y0:y1, x0:x0 + tw] = tile
            if fi == WIN_LOW and i == 2:               # room 13: curtains drawn tight
                gy0, gy1, gx0, gx1 = 856 - y0, 966 - y0, 177 - TILE_X[0], 263 - TILE_X[0]
                glass = a[y0 + gy0:y0 + gy1, x0 + gx0:x0 + gx1]
                frame = glass.min(2) > 195                 # keep the white glazing bars
                cur = np.zeros_like(glass)
                cur[:] = CURTAIN
                cur[:, ::10] = (36, 30, 52)                # folds
                cur[:, 5::10] = (66, 56, 86)
                glass[~frame] = cur[~frame]
    return Image.fromarray(a)


def facade():
    im = five_windows(Image.open(SRC / "facade_gen.webp"))
    im.save(SRC / "facade_five.png")
    px = mode_down(im, 4, 96)
    px.save(OUT / "facade.png")
    return px


# ------------------------------------------------------------------ corridor (二楼, flat elevation)
# corridor_gen.webp: one door, striped wallpaper (period 63 px), dado rail at y~590, wainscot below.
WALL_SLICE = (960, 960 + 63 * 8)
DOOR_BOX = (626, 238, 958, 806)
LAMP_BOX = (488, 236, 580, 412)
PERIOD = 63
BAY = 470
ROOMS = ["11", "12", None, "14", "15"]       # None: room 13, hidden behind a papered panel
STRIP_W = BAY * len(ROOMS) + 160
PANEL = (BAY * 2 + 80 + (BAY - (DOOR_BOX[2] - DOOR_BOX[0])) // 2 - 10, None)


def corridor_src():
    a = np.array(Image.open(SRC / "corridor_gen.webp").convert("RGB"))
    h = a.shape[0]
    wall = a[:, WALL_SLICE[0]:WALL_SLICE[1]].astype(float)
    # flatten the lamp's falloff so the slice tiles without bands: divide out a column profile
    # smoothed over two stripe periods, separately above and below the dado rail
    for r0, r1 in ((0, 104), (104, 590), (590, 800), (800, h)):
        prof = wall[r0:r1].mean((0, 2))
        k = np.ones(PERIOD * 2) / (PERIOD * 2)
        sm = np.convolve(np.pad(prof, PERIOD, mode="wrap"), k, mode="same")[PERIOD:-PERIOD]
        wall[r0:r1] *= (sm.mean() / sm)[None, :, None]
    # one perfectly periodic stripe: the average of the eight periods in the slice
    wall = wall[:, :PERIOD * 8].reshape(h, 8, PERIOD, 3).mean(1)
    wall = np.clip(wall, 0, 255).astype(np.uint8)
    out = np.zeros((h, STRIP_W, 3), np.uint8)
    for x in range(STRIP_W):
        out[:, x] = wall[:, x % wall.shape[1]]
    door = a[DOOR_BOX[1]:DOOR_BOX[3], DOOR_BOX[0]:DOOR_BOX[2]]
    dw = door.shape[1]
    doors = {}
    for i, room in enumerate(ROOMS):
        x0 = 80 + i * BAY + (BAY - dw) // 2
        if room is None:
            # the false wall: same paper, hung half a stripe off, and the dado/wainscot
            # dropped a few pixels so the rail and the skirting don't meet their neighbours
            px0, px1 = x0 - 6, x0 + dw + 6
            sh = PERIOD // 2
            for x in range(px0, px1):
                out[:590, x] = wall[:590, (x + sh) % wall.shape[1]]
                out[590:806, x] = wall[586:802, (x + 17) % wall.shape[1]]
            out[806:812, px0:px1] = wall[812:818, 0:1]          # carpet edge shows through the gap
            doors["13"] = (px0, px1)
        else:
            out[DOOR_BOX[1]:DOOR_BOX[3], x0:x0 + dw] = door
            doors[room] = (x0, x0 + dw)
    return Image.fromarray(out), doors


def corridor():
    im, doors = corridor_src()
    im.save(SRC / "corridor_strip.png")
    px = mode_down(im, 4, 96)
    # brass plates: blank them, then stamp the room number in a 3x5 pixel font (art pixels)
    a = np.array(px)
    for room, (x0, x1) in doors.items():
        if room == "13":
            continue
        cx = (x0 + x1) // 8
        py = 384 // 4 + 2
        a[py - 1:py + 7, cx - 5:cx + 5] = (196, 150, 64)
        a[py - 1, cx - 5:cx + 5] = (236, 196, 100)
        a[py + 6, cx - 5:cx + 5] = (120, 84, 30)
        x = cx - 4
        for ch in room:
            for r, bits in enumerate(DIGITS[ch]):
                for c, b in enumerate(bits):
                    if b == "1":
                        a[py + r, x + c] = (40, 24, 12)
            x += 4
    px = Image.fromarray(a)
    px.save(OUT / "corridor.png")
    return px, {k: (v[0] // 4, v[1] // 4) for k, v in doors.items()}


# ------------------------------------------------------------------ lobby + key board
BOARD_IN = (228, 456, 602, 706)     # inside of the generated key board (source px)
BOARD_BACK = (52, 24, 20)
BRASS, BRASS_HI, BRASS_LO = (196, 150, 64), (236, 196, 100), (120, 84, 30)
KEYS = ["11", "12", None, "14", "15"]   # None: the hook whose 13 plate was unscrewed


def lobby():
    a = np.array(Image.open(SRC / "lobby_gen.webp").convert("RGB"))
    a[820:1000, 0:122] = a[820:1000, 130:252]           # the generator put a modern box on the counter
    a[BOARD_IN[1]:BOARD_IN[3], BOARD_IN[0]:BOARD_IN[2]] = BOARD_BACK
    px = mode_down(Image.fromarray(a), 4, 96)
    q = np.array(px)
    x0, y0, x1, y1 = (v // 4 for v in BOARD_IN)
    q[y0:y1, x0:x1] = BOARD_BACK
    q[y0 + 20, x0 + 2:x1 - 2] = (88, 48, 32)              # rail the hooks hang from
    q[y0 + 21, x0 + 2:x1 - 2] = (34, 16, 12)
    step = (x1 - x0) / 5
    for i, room in enumerate(KEYS):
        cx = int(x0 + step * (i + 0.5))
        py = y0 + 8
        if room is None:                                   # pale square where the plate was, two nail holes
            q[py - 1:py + 7, cx - 5:cx + 5] = (92, 58, 44)
            q[py, cx - 4] = q[py + 5, cx + 4] = (24, 12, 10)
        else:
            q[py - 1:py + 7, cx - 5:cx + 5] = BRASS
            q[py - 1, cx - 5:cx + 5] = BRASS_HI
            q[py + 6, cx - 5:cx + 5] = BRASS_LO
            x = cx - 4
            for ch in room:
                for r, bits in enumerate(DIGITS[ch]):
                    for c, b in enumerate(bits):
                        if b == "1":
                            q[py + r, x + c] = (40, 24, 12)
                x += 4
        q[y0 + 19:y0 + 23, cx] = BRASS_HI                   # the hook
        q[y0 + 23, cx:cx + 2] = BRASS
        if room is not None:                               # key: ring, shank, bit
            ky = y0 + 24
            q[ky:ky + 4, cx - 1:cx + 2] = BRASS
            q[ky + 1:ky + 3, cx] = BOARD_BACK
            q[ky + 4:ky + 14, cx] = BRASS
            q[ky + 4:ky + 14, cx + 1] = BRASS_LO
            q[ky + 11:ky + 14, cx + 2:cx + 4] = BRASS
    px = Image.fromarray(q)
    px.save(OUT / "lobby.png")
    return px


DIGITS = {
    "1": ["010", "110", "010", "010", "111"],
    "2": ["110", "001", "010", "100", "111"],
    "3": ["110", "001", "010", "001", "110"],
    "4": ["101", "101", "111", "001", "001"],
    "5": ["111", "100", "110", "001", "110"],
}


# ------------------------------------------------------------------ portraits (same treatment as case01)
PEOPLE = ("manager", "porter", "maid", "ada", "thomas")
PASTE = (206, 200, 186)        # dried wallpaper paste on the porter's right cuff


def portraits():
    case_art.SRC, case_art.OUT = SRC, OUT
    for n in PEOPLE:
        case_art.portrait(n)
    # the porter's cuff: a greyish-white smear, drawn, never labelled
    im = Image.open(OUT / "porter.png").convert("RGBA")
    a = np.array(im)
    for x, y in ((32, 103), (33, 103), (34, 103), (31, 104), (32, 104), (33, 104), (34, 104), (35, 104), (32, 105), (33, 105), (34, 105)):
        a[y, x] = (*PASTE, 255)
    Image.fromarray(a, "RGBA").save(OUT / "porter.png")


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    facade()
    print(corridor()[1])
    lobby()
    portraits()
    print("wrote", OUT)
