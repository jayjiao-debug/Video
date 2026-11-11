#!/usr/bin/env python3
"""cover_text.py <spec.json> : crop the clean cover stills and set the hook type on them.
spec: {"font": "<ttf, relative to the spec>", "covers": [{"src": "still.png", "crop": [x0, y0, x1, y1], "size": [w, h],
        "out": "cover.png", "scrim": {"side": "top"|"left", "px": 420, "a": 0.3} | null,
        "lines": [{"t": "拔出石中剑", "px": 128, "col": "white"|"gold"}, ...],
        "anchor": {"cx": 540, "top": 115}, "gap": 18}]}
Type: the film's own caption face (Noto Sans SC Bold), white or gold with a thick ink outline and a soft shadow, like
the captions in the picture. anchor.top = the top of the first line's ink; every line's ink is centred on anchor.cx
(a full-width ？ carries empty space on its right, so the line is centred by what is drawn, not by its advance).
Prints, per line, where the glyphs sit and a check measured on the finished picture."""
import json, sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

INK = (17, 19, 27)
GOLD = [(0.0, (255, 236, 176)), (0.45, (255, 200, 66)), (1.0, (232, 158, 24))]
WHITE = [(0.0, (255, 255, 255)), (1.0, (236, 238, 244))]

def ramp(stops, h):
    ys = np.linspace(0, 1, h); out = np.zeros((h, 3))
    for i in range(3): out[:, i] = np.interp(ys, [s[0] for s in stops], [s[1][i] for s in stops])
    return out

def set_line(im, text, font, cx, top, col):
    """draws one line with the top of its INK at `top` and the middle of its ink on cx; returns the ink box
    (x0, y0, x1, y1) in the picture. The ink is measured on the drawn glyphs (font.getbbox gives the advance width,
    which for a line ending in a full-width mark is about half an em wider than what is seen)."""
    px = font.size; sw = max(6, round(px * 0.075)); pad = sw + 40
    l, t, r, b = font.getbbox(text)
    W, H = r + 2 * pad + px, b + 2 * pad + px; ox, oy = pad, pad
    edge = Image.new("L", (W, H), 0); ImageDraw.Draw(edge).text((ox, oy), text, font=font, fill=255, stroke_width=sw, stroke_fill=255)
    face = Image.new("L", (W, H), 0); ImageDraw.Draw(face).text((ox, oy), text, font=font, fill=255, stroke_width=1, stroke_fill=255)
    ix0, iy0, ix1, iy1 = face.point(lambda v: 255 if v > 96 else 0).getbbox()    # the glyphs' ink on this canvas
    w, h = ix1 - ix0, iy1 - iy0
    x0, y0 = round(cx - (ix0 + ix1) / 2), top - iy0
    # soft shadow under the outline
    sh = edge.filter(ImageFilter.GaussianBlur(px * 0.09)).point(lambda v: int(v * 0.55))
    im.paste(Image.new("RGB", (W, H), (8, 9, 16)), (x0, y0 + round(px * 0.06)), sh)
    im.paste(Image.new("RGB", (W, H), INK), (x0, y0), edge)
    g = ramp(GOLD if col == "gold" else WHITE, h)
    fill = np.zeros((H, W, 3), dtype=np.uint8); fill[:] = g[0].astype(np.uint8)
    fill[iy0: iy1] = g[:, None, :].astype(np.uint8); fill[iy1:] = g[-1].astype(np.uint8)
    im.paste(Image.fromarray(fill), (x0, y0), face)
    return (x0 + ix0, top, x0 + ix1, top + h)

def scrim(im, side, px, a):
    arr = np.asarray(im).astype(np.float64); H, W = arr.shape[:2]
    if side == "top": k = np.clip(1 - np.arange(H) / px, 0, 1)[:, None, None]
    elif side == "left": k = np.clip(1 - np.arange(W) / px, 0, 1)[None, :, None]
    else: raise SystemExit("scrim side")
    k = (k ** 1.6) * a
    return Image.fromarray((arr * (1 - k) + np.array([10, 12, 22]) * k).round().astype(np.uint8))

spec = json.load(open(sys.argv[1], encoding="utf8")); base_dir = os.path.dirname(os.path.abspath(sys.argv[1]))
for c in spec["covers"]:
    im = Image.open(os.path.join(base_dir, c["src"])).convert("RGB").crop(tuple(c["crop"]))
    if list(im.size) != c["size"]: im = im.resize(tuple(c["size"]), Image.LANCZOS)
    if c.get("scrim"): im = scrim(im, c["scrim"]["side"], c["scrim"]["px"], c["scrim"]["a"])
    y = c["anchor"]["top"]; boxes = []; base = np.asarray(im).astype(int)
    for ln in c["lines"]:
        f = ImageFont.truetype(os.path.join(base_dir, spec["font"]), ln["px"])
        bx = set_line(im, ln["t"], f, c["anchor"]["cx"], y, ln["col"]); boxes.append(bx)
        y = bx[3] + c.get("gap", 16)
    im.save(os.path.join(base_dir, c["out"]))
    W, H = im.size
    # check on the finished picture: per line, the span of the columns the type changed (glyphs + outline, in the rows of
    # the glyphs), whose middle must sit on the anchor
    ch = (np.abs(np.asarray(im).astype(int) - base).max(2) > 40)
    seen = []
    for b in boxes:
        cols = np.nonzero(ch[b[1]: b[3]].sum(0) > 2)[0]; seen.append((int(cols.min()), int(cols.max()) + 1))
    print(c["out"], im.size)
    for ln, b, sx in zip(c["lines"], boxes, seen):
        print(f"   {ln['t']}: glyphs x {b[0]}-{b[2]} y {b[1]}-{b[3]} ({b[3] - b[1]} px tall); with the outline x {sx[0]}-{sx[1]}, middle {(sx[0] + sx[1]) / 2:.1f} (anchor {c['anchor']['cx']})")
    print(f"   margins with the outline: left {min(s[0] for s in seen)} ({100 * min(s[0] for s in seen) / W:.1f} %), top {boxes[0][1]} ({100 * boxes[0][1] / H:.1f} %), right {W - max(s[1] for s in seen)}; the type ends at {100 * boxes[-1][3] / H:.0f} % of the height")
