#!/usr/bin/env python3
"""The qin covers: the kit's cover.py, with each gold line centred on its real ink.

Pillow's getbbox() measures a line from 0 to its advance width, not its ink, so a line ending in a glyph with
a wide right bearing (的一天) sits a few px off the centre of a line that does not (采访秦始皇). This wraps the kit's
gold_text() (the kit itself is unchanged): it measures the drawn ink, outline included, shifts the line so that
ink is centred on the layout's x, and returns the ink box with the outline, so the safe-zone check sees the outline too.
  python3 scripts/qin/cover/make_covers.py [scripts/qin/cover/spec.json]"""
import os, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "kit", "cover"))
import cover  # noqa: E402

_gold = cover.gold_text


def ink_box(text, size, stroke):
    """(fill box, fill+outline box) of text drawn at the origin, as Pillow draws it"""
    f = ImageFont.truetype(cover.FONT, size); pad = size + stroke
    w = int(f.getlength(text)) + 2 * pad; h = 3 * size + 2 * pad
    boxes = []
    for sw in (0, stroke):
        m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).text((pad, pad), text, font=f, fill=255, stroke_width=sw, stroke_fill=255)
        x0, y0, x1, y1 = m.getbbox(); boxes.append((x0 - pad, y0 - pad, x1 - pad, y1 - pad))
    return boxes


def gold_ink(base, xy_center, text, size, stroke):
    f = ImageFont.truetype(cover.FONT, size); l, t, r, b = f.getbbox(text)
    fill, full = ink_box(text, size, stroke)
    dx = (fill[0] + fill[2]) / 2 - (l + r) / 2          # how far the ink centre sits from getbbox's centre
    cx = xy_center[0] - dx
    _gold(base, (cx, xy_center[1]), text, size, stroke)
    x = int(cx - (r - l) / 2 - l); y = int(xy_center[1] - (b - t) / 2 - t)   # where gold_text put the origin
    return (x + full[0], y + full[1], x + full[2], y + full[3])


cover.gold_text = gold_ink


def soft_vignette(base):
    """the kit's vignette, lighter (corners at about 70 % instead of 43 %): Jay found the dark bottom ugly (2026-11-13)"""
    W, H = base.size; m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
    d.ellipse([-W * 0.25, -H * 0.2, W * 1.25, H * 1.2], fill=255); m = m.filter(ImageFilter.GaussianBlur(min(W, H) * 0.12))
    dark = Image.new('RGB', (W, H), (8, 5, 4)); return Image.composite(base, dark, m.point(lambda v: int(180 + v * 75 / 255)))


cover.vignette = soft_vignette

if __name__ == "__main__":
    cover.main(sys.argv[1:] or [os.path.join(HERE, "spec.json")])
