#!/usr/bin/env python3
"""The character design sheet of 采访罗密欧与朱丽叶 (gate 1), composed from the renders of design_sheet.sh:
  python3 src/videos/romeo/preview/design_sheet.py <renders dir> <out dir>
writes <out>/characters_p1_cast.png (line-up, black shapes, three-quarter, back, notes) and
<out>/characters_p2_faces.png (interview busts, expressions, options)."""
import os, re, sys
from PIL import Image, ImageDraw, ImageFont

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
CJK = os.path.join(REPO, "public/bt/sans700.ttf")
LAT = os.path.join(REPO, "public/bt/nunito900.ttf")
PAPER, INK, MUTE = (239, 227, 200), (40, 30, 26), (120, 100, 86)
COL = {"ro": (47, 95, 184), "ju": (184, 37, 47), "fr": (122, 90, 60), "gold": (226, 176, 58)}
W = 1800


def font(size, cjk=True): return ImageFont.truetype(CJK if cjk else LAT, size)
def img(name): return Image.open(os.path.join(SRC, name)).convert("RGB")
def fit(im, w): return im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


def text(d, xy, s, size, fill=INK, anchor="la", cjk=True): d.text(xy, s, font=font(size, cjk), fill=fill, anchor=anchor)


def wrap(d, s, size, width):
    f, out, line = font(size), [], ""
    for ch in s:
        if d.textlength(line + ch, font=f) > width and line:
            # break at the last space when the line has one (English), else anywhere (Chinese)
            cut = line.rfind(" ")
            if cut > len(line) * 0.6: out.append(line[:cut]); line = line[cut + 1:] + ch
            else: out.append(line); line = ch
        else: line += ch
    if line: out.append(line)
    return out


def para(d, x, y, s, size, width, fill=INK, gap=1.35):
    for ln in wrap(d, s, size, width):
        text(d, (x, y), ln, size, fill); y += round(size * gap)
    return y


def heads(log):
    """the figures' screen positions from a people_lineup log: [(name, foot x, foot y, head x, head y)]"""
    try: s = open(os.path.join(SRC, log)).read()
    except OSError: return []
    out = []
    for m in re.finditer(r"LOG: slot \d+ (\S+) foot ([\d.]+),([\d.]+) head ([\d.]+),([\d.]+)", s):
        out.append((m.group(1), *map(float, m.groups()[1:])))
    return out


def header(d, y, title, sub):
    text(d, (60, y), title, 64)
    text(d, (62, y + 84), sub, 30, MUTE, cjk=False)
    d.line([(60, y + 132), (W - 60, y + 132)], fill=INK, width=3)
    return y + 156


CHARS = [
    ("ro", "罗密欧 · 恋爱脑", "Romeo, the lovesick one",
     "Montague blue and gold. Half-lid dreamy eyes, brows tipped up, freckles, a little blush. A velvet cap with one long cream feather (it comes off in the tomb). Slashed doublet with gold buttons, short cape, puffed sleeves, pale hose, brown boots. Always carries a sealed love letter. Resting face: the lovesick sigh. Treats the reporter as a messenger."),
    ("ju", "朱丽叶 · 行动派", "Juliet, the one who acts",
     "Capulet red and gold. Wide bright eyes with lashes, level brows, a small sure smile. A gold-net cap with pearls, a forehead jewel, two long tresses bound with gold rings. Square neck, laced front, jewelled girdle, puffed sleeves. Carries the small pale bottle. Gives the orders: one hand on her hip."),
    ("fr", "劳伦斯神父 · 草药行家", "Friar Laurence, the herbalist",
     "A brown habit with the hood down, a white rope belt with three knots, a basket of herbs and flowers. Bald crown with a ring of grey hair, bushy grey brows, a soft scalloped beard, crow's feet, the only nose in the film. Weary and warm, the one adult who listens. No cross anywhere (platform rule)."),
]


def page1():
    hero, black, t34, back = img("hero.png"), img("hero_black.png"), img("turn34.png"), img("back.png")
    H = 156 + hero.height + 70 + 720 + 60 + 720 + 60
    pg = Image.new("RGB", (W, H), PAPER); d = ImageDraw.Draw(pg)
    y = header(d, 40, "采访罗密欧与朱丽叶 · 角色设计 v1", "Character design, gate 1 · 22 Nov 2026 · the reporter is the camera and never appears")
    pg.paste(hero, (0, y))
    hs = heads("hero.log") or [("romeo", 330, 1230, 0, 0), ("juliet", 900, 1230, 0, 0), ("friar", 1450, 1230, 0, 0)]
    for (name, fx, fy, *_), (k, zh, en, _) in zip(hs, CHARS):
        text(d, (fx, y + min(fy + 30, hero.height - 80)), zh, 40, COL[k], anchor="ma")
        text(d, (fx, y + min(fy + 82, hero.height - 30)), en, 24, MUTE, anchor="ma", cjk=False)
    y += hero.height + 20
    text(d, (60, y), "Black shapes at phone size: each one reads in a second (cap and feather · tresses and gown · round head, cowl and basket)", 26, MUTE, cjk=False); y += 50
    a, b = fit(black, 880), fit(t34, 880)
    pg.paste(a, (10, y)); pg.paste(b, (W - 10 - b.width, y)); y += max(a.height, b.height) + 40
    c = fit(back, 880); pg.paste(c, (10, y))
    x0, yy = 920, y + 10
    for k, zh, en, note in CHARS:
        d.rectangle([x0, yy + 6, x0 + 18, yy + 44], fill=COL[k])
        text(d, (x0 + 34, yy), zh, 36, COL[k]); text(d, (x0 + 34, yy + 46), en, 22, MUTE, cjk=False)
        yy = para(d, x0 + 34, yy + 84, note, 21, W - x0 - 80, INK, 1.4) + 24
    return pg.crop((0, 0, W, max(y + c.height + 40, yy + 20)))


def page2():
    busts = [img(f"bust_{k}.png") for k in ("romeo", "juliet", "friar")]
    rows = [("ex_romeo.png", "ro", "罗密欧", ["resting: the lovesick sigh", "dreamy: 想她", "wail, with tears (the dawn)", "blank: 朱丽叶是谁？", "hollow: 命运的玩物"]),
            ("ex_juliet.png", "ju", "朱丽叶", ["resting: sure", "bossy: 快去问他叫什么", "swoon: 罗密欧……", "caught: 他就在楼下", "brave: 这一杯，敬你"]),
            ("ex_friar.png", "fr", "神父", ["resting: weary", "dry: 年轻人的爱…", "worried", "warn: 爱得越猛…", "caught: 她冲进来了"])]
    opts = img("options.png")
    bw = 580
    bh = round(busts[0].height * bw / busts[0].width)
    H = 156 + 60 + bh + 70 + 3 * (round(606 * W / 2000) + 110) + round(606 * W / 2000) + 200
    pg = Image.new("RGB", (W, H), PAPER); d = ImageDraw.Draw(pg)
    y = header(d, 40, "表情与选项 · Faces and options", "Interview framing (9:16 crop), five faces each, and two open choices")
    text(d, (60, y), "How each one looks in their interview frame", 28, MUTE, cjk=False); y += 50
    for i, (bimg, (k, zh, en, _)) in enumerate(zip(busts, CHARS)):
        x = 15 + i * (bw + 15); pg.paste(fit(bimg, bw), (x, y))
        text(d, (x + bw // 2, y + bh + 14), zh, 30, COL[k], anchor="ma")
    y += bh + 70
    for fn, k, zh, caps in rows:
        r = fit(img(fn), W); pg.paste(r, (0, y)); y += r.height + 8
        for j, cap in enumerate(caps):
            text(d, (W * (2 * j + 1) // 10, y), cap, 22, COL[k] if j == 0 else INK, anchor="ma")
        y += 70
    text(d, (60, y), "Open choices (my default first)", 28, MUTE, cjk=False); y += 46
    r = fit(opts, W); pg.paste(r, (0, y)); y += r.height + 8
    caps = ["Romeo: cap on (default)", "cap off (the tomb, the end)", "Friar: full beard (default)", "goatee", "no beard"]
    for j, cap in enumerate(caps): text(d, (W * (2 * j + 1) // 10, y), cap, 22, INK, anchor="ma", cjk=False)
    y += 60
    return pg.crop((0, 0, W, y + 20))


if __name__ == "__main__":
    p1, p2 = page1(), page2()
    p1.save(os.path.join(OUT, "characters_p1_cast.png")); p2.save(os.path.join(OUT, "characters_p2_faces.png"))
    print("wrote", os.path.join(OUT, "characters_p1_cast.png"), p1.size, os.path.join(OUT, "characters_p2_faces.png"), p2.size)
