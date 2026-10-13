"""The recurring narrator: an original kid detective (deerstalker, mustard trench coat,
teal scarf, brass monocle). Chibi proportions so the face reads on a phone.

Writes public/sprites/narrator_<pose>.png (56x64) for every pose, plus
out/detective_sheet.png, a character sheet at 8x.
"""
import pathlib
from PIL import Image, ImageDraw
from art import A, P, canvas, outline, pad, save, OUT

P.update(
    coat=(204, 156, 66), coat2=(160, 116, 44), coat3=(232, 192, 104),
    lapel=(122, 82, 40), tweed=(70, 116, 108), tweed2=(48, 84, 80), tweed3=(98, 148, 136),
    hairb=(86, 52, 36), hairb2=(118, 76, 50), brass=(236, 196, 92), scarf=(48, 160, 150), scarf2=(30, 112, 106),
    blush=(236, 150, 140), mouth=(140, 60, 60), shine=(255, 255, 255),
)
POSES = ("sit", "look", "shock", "read", "think", "deduce", "blink")


def head(pose):
    im, d = canvas(28, 28)
    lift = -2 if pose == "shock" else 0
    # face (rounded)
    d.rectangle((4, 9, 23, 25), fill=A("skin"))
    d.rectangle((5, 26, 22, 26), fill=A("skin2"))
    d.rectangle((4, 23, 23, 25), fill=A("skin2"))
    d.rectangle((5, 9, 22, 24), fill=A("skin"))
    d.point((4, 25), fill=(0, 0, 0, 0)); d.point((23, 25), fill=(0, 0, 0, 0))
    d.rectangle((2, 15, 3, 19), fill=A("skin")); d.rectangle((24, 15, 25, 19), fill=A("skin"))  # ears
    # hair under the cap: side tufts and a swoop over the forehead
    d.rectangle((3, 8, 6, 15), fill=A("hairb")); d.rectangle((21, 8, 24, 14), fill=A("hairb"))
    d.polygon([(6, 9), (16, 9), (11, 13), (7, 13)], fill=A("hairb"))
    d.line((8, 10, 13, 10), fill=A("hairb2"))
    # deerstalker cap
    y = lift
    d.ellipse((2, 0 + y, 25, 14 + y), fill=A("tweed"))
    d.rectangle((2, 7 + y, 25, 9 + y), fill=A("tweed"))
    for yy in range(1 + y, 10 + y, 3):
        d.line((4, yy, 23, yy), fill=A("tweed2"))
    for xx in range(5, 24, 4):
        d.line((xx, 1 + y, xx, 9 + y), fill=A("tweed3"))
    d.rectangle((13, 0 + y, 14, 1 + y), fill=A("tweed2"))  # button
    d.rectangle((8, 9 + y, 22, 10 + y), fill=A("tweed2"))  # front peak
    d.line((0, 6 + y, 3, 9 + y), fill=A("tweed2")); d.line((24, 9 + y, 27, 6 + y), fill=A("tweed2"))  # flaps tied up
    # eyes (3x4 with a shine pixel)
    L, R = 8, 16
    ey = 15
    def eye(x, dx=0, dy=0):
        d.rectangle((x, ey, x + 2, ey + 3), fill=A("ink"))
        d.point((x + (1 if dx < 0 else 0) + max(dx, 0), ey + dy), fill=A("shine"))
    if pose in ("sit", "read"):
        for x in (L, R):
            d.line((x, ey + 2, x + 2, ey + 2), fill=A("ink")); d.point((x - 1, ey + 1), fill=A("ink"))
    elif pose == "blink":
        for x in (L, R):
            d.line((x, ey + 2, x + 2, ey + 2), fill=A("ink"))
    elif pose == "look":
        for x in (L, R):
            d.rectangle((x + 1, ey, x + 3, ey + 3), fill=A("ink")); d.point((x + 3, ey), fill=A("shine"))
    elif pose == "think":
        for x in (L, R):
            d.rectangle((x - 1, ey - 1, x + 1, ey + 2), fill=A("ink")); d.point((x - 1, ey - 1), fill=A("shine"))
    elif pose == "deduce":
        for x in (L, R):
            d.rectangle((x, ey + 1, x + 2, ey + 3), fill=A("ink")); d.line((x - 1, ey, x + 3, ey), fill=A("hairb"))
            d.point((x, ey + 1), fill=A("shine"))
    elif pose == "shock":
        for x in (L - 1, R):
            d.rectangle((x, ey - 1, x + 3, ey + 3), fill=A("shine")); d.rectangle((x + 1, ey, x + 2, ey + 2), fill=A("ink"))
    # brass monocle on the right eye + chain
    d.ellipse((R - 2, ey - 2, R + 4, ey + 5), outline=A("brass"))
    d.line((R + 4, ey + 4, R + 6, ey + 9), fill=A("brass"))
    if pose == "deduce":
        d.point((R + 3, ey - 1), fill=A("shine"))  # glint
    # blush + mouth
    d.point((6, 21), fill=A("blush")); d.point((7, 21), fill=A("blush"))
    d.point((20, 21), fill=A("blush")); d.point((21, 21), fill=A("blush"))
    if pose == "shock":
        d.rectangle((12, 21, 15, 24), fill=A("mouth"))
    elif pose in ("read", "sit"):
        d.line((12, 22, 15, 22), fill=A("mouth")); d.point((11, 21), fill=A("mouth")); d.point((16, 21), fill=A("mouth"))
    elif pose == "deduce":
        d.line((12, 22, 16, 22), fill=A("mouth")); d.point((17, 21), fill=A("mouth"))  # smirk
    elif pose == "think":
        d.line((13, 23, 14, 23), fill=A("mouth"))
    else:
        d.line((12, 22, 15, 22), fill=A("mouth"))
    if pose == "shock":
        d.rectangle((24, 9, 25, 12), fill=A("screen"))  # sweat drop
    return outline(pad(im))


def body(pose):
    im, d = canvas(50, 32)
    # coat
    d.rectangle((10, 6, 39, 31), fill=A("coat"))
    d.polygon([(10, 6), (5, 12), (3, 31), (10, 31)], fill=A("coat"))
    d.polygon([(39, 6), (44, 12), (46, 31), (39, 31)], fill=A("coat"))
    d.rectangle((10, 6, 13, 31), fill=A("coat2"))
    d.line((15, 7, 34, 7), fill=A("coat3"))
    # cape layer (inverness) over the shoulders
    d.polygon([(8, 7), (41, 7), (45, 17), (4, 17)], fill=A("coat3"))
    d.line((4, 17, 45, 17), fill=A("coat2"))
    # lapels + scarf
    d.polygon([(19, 6), (25, 14), (31, 6)], fill=A("lapel"))
    d.rectangle((17, 3, 33, 7), fill=A("scarf"))
    d.line((17, 6, 33, 6), fill=A("scarf2"))
    d.rectangle((28, 7, 31, 16), fill=A("scarf")); d.line((28, 16, 31, 16), fill=A("scarf2"))
    # buttons
    for y in (20, 25):
        d.point((23, y), fill=A("brass")); d.point((27, y), fill=A("brass"))
    # arms
    if pose == "think":
        d.rectangle((2, 22, 16, 31), fill=A("coat3"))
        d.polygon([(34, 31), (42, 31), (38, 12), (32, 10)], fill=A("coat"))
        d.rectangle((31, 6, 35, 10), fill=A("skin"))  # hand at the chin
    elif pose == "deduce":
        d.rectangle((2, 22, 16, 31), fill=A("coat3"))
        d.polygon([(36, 16), (46, 8), (49, 12), (40, 20)], fill=A("coat"))
        d.rectangle((45, 4, 48, 8), fill=A("skin")); d.line((48, 0, 48, 4), fill=A("skin"))  # pointing finger
    elif pose == "shock":
        d.rectangle((0, 3, 6, 15), fill=A("coat")); d.rectangle((43, 3, 49, 15), fill=A("coat"))
        d.rectangle((0, 0, 6, 3), fill=A("skin")); d.rectangle((43, 0, 49, 3), fill=A("skin"))
    else:
        d.rectangle((2, 22, 16, 31), fill=A("coat3")); d.rectangle((33, 22, 47, 31), fill=A("coat3"))
    return outline(pad(im))


def sprite(pose):
    im = Image.new("RGBA", (56, 64), (0, 0, 0, 0))
    b = body("sit" if pose == "blink" else pose)
    im.alpha_composite(b, (2, 27))
    hx, hy = 13, 2
    if pose in ("sit", "read", "blink"):
        hy = 4
    if pose == "look":
        hx = 15
    if pose == "think":
        hx, hy = 11, 3
    if pose == "shock":
        hy = 1
    im.alpha_composite(head(pose), (hx, hy))
    if pose == "think":  # redraw the chin hand over the face
        hand = Image.new("RGBA", (56, 64), (0, 0, 0, 0))
        hd = ImageDraw.Draw(hand)
        hd.rectangle((33, 26, 37, 30), fill=A("skin"))
        im.alpha_composite(outline(hand))
    return im


if __name__ == "__main__":
    for pose in POSES:
        save(sprite(pose), f"narrator_{pose}")
    # character sheet at 8x on the room's wall colour
    pad_ = 8
    sheet = Image.new("RGBA", (len(POSES) * (56 + pad_) + pad_, 64 + 2 * pad_), A("wall"))
    for i, pose in enumerate(POSES):
        sheet.alpha_composite(sprite(pose), (pad_ + i * (56 + pad_), pad_))
    root = pathlib.Path(__file__).resolve().parent.parent
    sheet.resize((sheet.width * 6, sheet.height * 6), Image.NEAREST).save(root / "out" / "detective_sheet.png")
    print("ok")
