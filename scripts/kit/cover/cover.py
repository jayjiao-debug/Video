#!/usr/bin/env python3
"""Covers and thumbnails for any film (README.md next to this file). Pillow only.

  cover.py spec.json                       every cover in the spec (paths in it are relative to the spec's folder)
  cover.py --bg still.png --layout low --hook "他靠上厕所" --hook "躲过了一场暗杀" --title "《鸿门宴，到底死了谁？》" \
           [--series "VIBE知识大赏"] [--font public/bt/sans700.ttf] [--target douyin34] --out cover.png

The background is a CLEAN still rendered at the cover's own shape (the lens takes the drawing buffer's shape, so a
4:3 still shows more of the set, not a squashed 9:16 frame). It is never stretched: a background whose shape differs
from the target's (after the optional crop) is refused; a uniform resize to the target's size is allowed.
Layouts (the ones the Hongmen covers shipped with; px sizes are for a 1080 px short side and scale with it):
  low   type in a band under the middle, a dark ramp behind it (Douyin 3:4, Shorts 9:16)
  side  type in a column on the left third, the subject on the right, a dark side ramp (Douyin 4:3, YouTube 16:9)
  top   type in the top third on a dark ramp, the lower part left to the app (Shorts 9:16)
  bottom  type in the lower half (16:9 / 4:3 with the subject in the upper half)
Every line is fitted to its width (the size only shrinks), gold with a dark outline and a soft shadow; the title and
the series line are plain cream / gold. The safe zones of --target are checked and printed (README.md)."""
import argparse, json, os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.abspath(os.path.join(HERE, "../../../public/bt/sans700.ttf"))      # the house face (already in the repo)


def set_font(path):
    global FONT
    FONT = os.path.abspath(path)


# ------------------------------------------------------------------------------------------------ the drawing helpers
def gold_text(base, xy_center, text, size, stroke):
    """gold gradient type with a dark outline and a soft shadow, centred by its ink; returns its box"""
    W, H = base.size; f = ImageFont.truetype(FONT, size)
    l, t, r, b = f.getbbox(text); w, h = r - l, b - t
    x = int(xy_center[0] - w / 2 - l); y = int(xy_center[1] - h / 2 - t)
    # shadow
    sh = Image.new('L', (W, H), 0); ImageDraw.Draw(sh).text((x + 6, y + 10), text, font=f, fill=255, stroke_width=stroke + 4, stroke_fill=255)
    sh = sh.filter(ImageFilter.GaussianBlur(14)); base.paste(Image.new('RGB', (W, H), (10, 6, 4)), (0, 0), sh.point(lambda v: int(v * 0.85)))
    # dark outline
    ol = Image.new('L', (W, H), 0); ImageDraw.Draw(ol).text((x, y), text, font=f, fill=255, stroke_width=stroke, stroke_fill=255)
    base.paste(Image.new('RGB', (W, H), (48, 22, 10)), (0, 0), ol)
    # gold gradient fill
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).text((x, y), text, font=f, fill=255)
    g = Image.new('RGB', (W, H)); gd = ImageDraw.Draw(g)
    top, bot = y + t, y + t + h; stops = [(0, (255, 244, 190)), (0.45, (246, 200, 92)), (0.55, (222, 160, 46)), (1, (170, 108, 28))]
    for yy in range(max(0, top - 5), min(H, bot + 5)):
        u = min(1, max(0, (yy - top) / max(1, h)))
        for i in range(len(stops) - 1):
            if stops[i][0] <= u <= stops[i + 1][0]:
                a = (u - stops[i][0]) / (stops[i + 1][0] - stops[i][0]); c = tuple(int(stops[i][1][k] + (stops[i + 1][1][k] - stops[i][1][k]) * a) for k in range(3)); break
        gd.line([(0, yy), (W, yy)], fill=c)
    base.paste(g, (0, 0), m)
    return (x + l, y + t, x + r, y + b)


def plain(base, xy_center, text, size, fill, stroke=0):
    """plain type centred by its ink, with a thin dark edge; returns its box"""
    f = ImageFont.truetype(FONT, size); l, t, r, b = f.getbbox(text); w, h = r - l, b - t
    x = int(xy_center[0] - w / 2 - l); y = int(xy_center[1] - h / 2 - t)
    ImageDraw.Draw(base).text((x, y), text, font=f, fill=fill, stroke_width=stroke, stroke_fill=(20, 10, 6))
    return (x + l, y + t, x + r, y + b)


def shade(base, y0, y1, top_dark):
    """a dark ramp: from y0 to y1 (px), dark at the top (top_dark) or at the bottom"""
    W, H = base.size; m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
    for yy in range(H):
        if top_dark: u = 1 - min(1, max(0, (yy - y0) / (y1 - y0)))
        else: u = min(1, max(0, (yy - y0) / (y1 - y0)))
        d.line([(0, yy), (W, yy)], fill=int(235 * u ** (0.85 if top_dark else 1.3)))
    base.paste(Image.new('RGB', (W, H), (14, 9, 8)), (0, 0), m)


def side_shade(im, x1, x2):
    """a dark ramp from the left edge, fading out between x1 and x2 (px)"""
    W, H = im.size; m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
    for x in range(W):
        u = 1 - min(1, max(0, (x - x1) / (x2 - x1))); d.line([(x, 0), (x, H)], fill=int(225 * u ** 0.9))
    im.paste(Image.new('RGB', (W, H), (14, 9, 8)), (0, 0), m)


def vignette(base):
    W, H = base.size; m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
    d.ellipse([-W * 0.25, -H * 0.2, W * 1.25, H * 1.2], fill=255); m = m.filter(ImageFilter.GaussianBlur(min(W, H) * 0.12))
    dark = Image.new('RGB', (W, H), (8, 5, 4)); return Image.composite(base, dark, m.point(lambda v: int(110 + v * 145 / 255)))


def fit(text, maxw, start):
    """the largest size from start down (steps of 2) at which text is at most maxw px wide"""
    s = start
    while ImageFont.truetype(FONT, s).getlength(text) > maxw: s -= 2
    return s


# ------------------------------------------------------------------------------------------------ layouts and targets
# Positions are fractions of the cover (x of W, y of H); px sizes are for a 1080 px short side. "hooks" are the gold
# lines in order (y, max width, start size, stroke); title (y, size[, stroke = 3]); "same": all hook lines get the
# smallest fitted size. A cover's "override" replaces any of these keys (and "k", the px scale).
LAYOUTS = {
    "low":    {"shade": ("bottom", 0.58, 0.74), "cx": 0.5, "hooks": [(0.665, 0.60, 130, 6), (0.745, 0.74, 112, 5)], "title": (0.805, 38), "series": (0.035, 28)},
    "side":   {"side": (0.22, 0.56), "cx": 0.27, "hooks": [(0.42, 0.38, 150, 7), (0.535, 0.42, 140, 6)], "title": (0.62, 44), "series": (0.05, 28)},
    "top":    {"shade": ("top", 0.0, 0.40), "cx": 0.5, "hooks": [(0.12, 0.86, 150, 7), (0.19, 0.80, 110, 6)], "title": (0.245, 46), "series": (0.035, 28)},
    "bottom": {"shade": ("bottom", 0.48, 0.86), "cx": 0.5, "hooks": [(0.66, 0.80, 195, 6), (0.80, 0.70, 144, 5)], "title": (0.91, 48, 2), "series": (0.05, 30)},
}
# target: the shape and the safe zone (fractions; "bottom" = the band at the bottom that holds no type)
TARGETS = {
    "douyin34":   {"size": (1080, 1440), "edge": 0.06, "bottom": 0.18, "right": 0.0},
    "douyin43":   {"size": (1440, 1080), "edge": 0.06, "bottom": 0.18, "right": 0.0},
    "shorts916":  {"size": (1080, 1920), "edge": 0.06, "bottom": 0.22, "right": 0.0},
    "youtube169": {"size": (1280, 720),  "edge": 0.05, "bottom": 0.0,  "right": 0.0},
}


def load_bg(path, crop=None, size=None):
    """the background: optional crop [x0, y0, x1, y1], then a UNIFORM resize to size; refuses to stretch"""
    im = Image.open(path).convert('RGB')
    if crop: im = im.crop(tuple(crop))
    if size and tuple(size) != im.size:
        a, b = im.size[0] / im.size[1], size[0] / size[1]
        if abs(a - b) / b > 0.005:
            raise SystemExit(f"cover.py: {path} is {im.size[0]}x{im.size[1]} (after the crop), the cover {size[0]}x{size[1]}: "
                             f"another shape. Covers are never stretched: render the still at the cover's shape (README.md) or crop it to that shape.")
        im = im.resize(tuple(size), Image.LANCZOS)
    return im


def check(boxes, W, H, target):
    """prints each box and whether it keeps the target's safe zone"""
    if not target: return True
    t = TARGETS[target]; ok = True
    for name, (x0, y0, x1, y1) in boxes:
        bad = []
        if x0 < t["edge"] * W or y0 < t["edge"] * H or x1 > (1 - t["edge"]) * W or y1 > (1 - t["edge"]) * H: bad.append(f"closer than {t['edge']:.0%} to an edge")
        if t["bottom"] and y1 > (1 - t["bottom"]) * H: bad.append(f"in the lower {t['bottom']:.0%}")
        if t["right"] and x1 > (1 - t["right"]) * W: bad.append(f"in the right {t['right']:.0%}")
        if bad: ok = False
        print(f"  {name:8} box {x0},{y0}-{x1},{y1}" + (("  SAFE-ZONE: " + "; ".join(bad)) if bad else "  ok"))
    return ok


def make(c, base_dir="."):
    """one cover from a dict: bg, out, layout, hook [lines], title, series, crop, size, target, font, same, overrides"""
    P = lambda p: p if os.path.isabs(p) else os.path.join(base_dir, p)
    if c.get("font"): set_font(P(c["font"]))
    size = c.get("size") or (TARGETS[c["target"]]["size"] if c.get("target") and c.get("resize") else None)
    im = vignette(load_bg(P(c["bg"]), c.get("crop"), size)); W, H = im.size
    if c.get("target"):
        tw, th = TARGETS[c["target"]]["size"]
        if abs(W / H - tw / th) / (tw / th) > 0.005:
            raise SystemExit(f"cover.py: {c['bg']} is {W}x{H}, a {c['target']} cover is {tw}x{th}: another shape (never stretched)")
    L = dict(LAYOUTS[c.get("layout", "low")]); L.update(c.get("override", {}))
    k = L.get("k", min(W, H) / 1080)
    if "shade" in L and L["shade"]:
        side, a, b = L["shade"]; shade(im, int(H * a), int(H * b), side == "top")
    if "side" in L and L["side"]:
        side_shade(im, int(W * L["side"][0]), int(W * L["side"][1]))
    cx = W * L["cx"]; hooks = c.get("hook", []); boxes = []
    rows = L["hooks"] + [L["hooks"][-1]] * max(0, len(hooks) - len(L["hooks"]))
    sizes = [fit(t, W * r[1], round(r[2] * k)) for t, r in zip(hooks, rows)]
    if c.get("same"): sizes = [min(sizes)] * len(sizes)
    for i, (t, r, s) in enumerate(zip(hooks, rows, sizes)):
        boxes.append((f"hook{i + 1}", gold_text(im, (cx, H * r[0]), t, s, r[3])))
    if c.get("title"):
        ti = L["title"]
        boxes.append(("title", plain(im, (cx, H * ti[0]), c["title"], round(ti[1] * k), (240, 232, 214), ti[2] if len(ti) > 2 else 3)))
    if c.get("series"):
        boxes.append(("series", plain(im, (W / 2, H * L["series"][0] + 14), c["series"], round(L["series"][1] * k), (226, 196, 120), 2)))
    out = P(c["out"]); os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    im.save(out)
    print(out, im.size, "sizes", sizes)
    check(boxes, W, H, c.get("target"))
    return out


def sheet(outs, path, h=360):
    """the covers side by side at one height (a contact sheet to look at)"""
    ims = [Image.open(o) for o in outs]; ims = [i.resize((round(i.size[0] * h / i.size[1]), h)) for i in ims]
    s = Image.new('RGB', (sum(i.size[0] for i in ims) + 10 * (len(ims) - 1), h), (255, 255, 255)); x = 0
    for i in ims: s.paste(i, (x, 0)); x += i.size[0] + 10
    s.save(path); print("sheet", path)


def main(argv):
    if argv and argv[0].endswith(".json"):
        spec = json.load(open(argv[0], encoding="utf8")); d = os.path.dirname(os.path.abspath(argv[0]))
        if spec.get("font"): set_font(spec["font"] if os.path.isabs(spec["font"]) else os.path.join(d, spec["font"]))
        outs = [make(c, d) for c in spec["covers"]]
        if spec.get("sheet"): sheet(outs, spec["sheet"] if os.path.isabs(spec["sheet"]) else os.path.join(d, spec["sheet"]))
        return
    ap = argparse.ArgumentParser(description="one cover (or: cover.py spec.json)")
    ap.add_argument("--bg", required=True, help="the clean still, rendered at the cover's shape")
    ap.add_argument("--out", required=True)
    ap.add_argument("--layout", default="low", choices=sorted(LAYOUTS))
    ap.add_argument("--hook", action="append", default=[], help="a gold hook line (give it once per line)")
    ap.add_argument("--title", default="")
    ap.add_argument("--series", default="", help="the series line (small, gold, at the top)")
    ap.add_argument("--font", default=None, help="a .ttf/.otf (default public/bt/sans700.ttf)")
    ap.add_argument("--target", default=None, choices=sorted(TARGETS), help="check its shape and safe zone")
    ap.add_argument("--crop", default=None, help="x0,y0,x1,y1 before anything else")
    ap.add_argument("--size", default=None, help="WxH: a uniform resize after the crop (the shape must already match)")
    ap.add_argument("--same", action="store_true", help="all hook lines at the smallest fitted size")
    a = ap.parse_args(argv)
    make({"bg": a.bg, "out": a.out, "layout": a.layout, "hook": a.hook, "title": a.title, "series": a.series, "font": a.font,
          "target": a.target, "same": a.same, "crop": [int(v) for v in a.crop.split(",")] if a.crop else None,
          "size": [int(v) for v in a.size.split("x")] if a.size else None}, os.getcwd())


if __name__ == "__main__":
    main(sys.argv[1:])
