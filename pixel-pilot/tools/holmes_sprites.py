"""Turn the image-generator Sherlock poses (art_src/holmes/<pose>.png, 1024x1024) into
true pixel sprites for the film: background flood-filled away, every pose downsampled
on the same grid (so feet and hat line up between poses), one shared palette, and
each art cell taken as the most common colour in its block so edges stay crisp.
Also derives a blink frame from idle.

Writes public/sprites/holmes_<pose>.png (scaled 2x, like the other narrators).
"""
import pathlib
import numpy as np
from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "art_src" / "holmes"
OUT = ROOT / "public" / "sprites"
POSES = ("idle", "sit", "look", "shock", "read", "think", "deduce", "magnify")
BLOCK = 14          # source px per art cell -> about 66 cells tall for the figure
COLOURS = 32
BG_THRESH = 48


def cut_background(im):
    """RGBA with the flat backdrop (and the floor shadow) made transparent."""
    work = im.convert("RGB").copy()
    key = (255, 0, 255)
    w, h = work.size
    for xy in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, h - 4), (w // 2, 4), (4, h // 2), (w - 5, h // 2)):
        if work.getpixel(xy) != key:
            ImageDraw.floodfill(work, xy, key, thresh=BG_THRESH)
    a = np.array(work)
    alpha = np.where((a == key).all(-1), 0, 255).astype(np.uint8)
    rgba = np.dstack([np.array(im.convert("RGB")), alpha])
    return Image.fromarray(rgba, "RGBA")


KEEP = ((176, 214, 232), (232, 246, 252), (18, 14, 16))  # lens glass, lens glint, outline: small areas, must survive


def shared_palette(images):
    strip = Image.new("RGB", (sum(i.width for i in images) + 3 * 160, images[0].height))
    for k, c in enumerate(KEEP):
        strip.paste(c, (sum(i.width for i in images) + k * 160, 0, sum(i.width for i in images) + (k + 1) * 160, images[0].height))
    x = 0
    for i in images:
        rgb = Image.new("RGB", i.size, (0, 0, 0))
        rgb.paste(i, (0, 0), i)
        strip.paste(rgb, (x, 0)); x += i.width
    return strip.quantize(COLOURS, method=Image.Quantize.MEDIANCUT)


def to_cells(im, pal):
    """Mode-downsample: each BLOCK x BLOCK block becomes its most common palette index."""
    rgb = Image.new("RGB", im.size, (0, 0, 0)); rgb.paste(im, (0, 0), im)
    idx = np.array(rgb.quantize(palette=pal, dither=Image.Dither.NONE))
    alpha = np.array(im)[..., 3] > 0
    idx = np.where(alpha, idx, 255)
    h, w = idx.shape
    gh, gw = h // BLOCK, w // BLOCK
    blocks = idx[: gh * BLOCK, : gw * BLOCK].reshape(gh, BLOCK, gw, BLOCK).transpose(0, 2, 1, 3).reshape(gh, gw, -1)
    out = np.zeros((gh, gw), np.uint8)
    for y in range(gh):
        for x in range(gw):
            vals, counts = np.unique(blocks[y, x], return_counts=True)
            out[y, x] = vals[np.argmax(counts)]
    return out


def render(cells, pal_rgb):
    h, w = cells.shape
    img = np.zeros((h, w, 4), np.uint8)
    for i, c in enumerate(pal_rgb):
        img[cells == i] = (*c, 255)
    return Image.fromarray(img, "RGBA")


def blink_from(cells, pal_rgb):
    """Close the eyes: inside the face, keep only the bottom cell of each dark eye column."""
    out = cells.copy()
    dark = {i for i, c in enumerate(pal_rgb) if sum(c) < 150}
    skinish = {i for i, (r, g, b) in enumerate(pal_rgb) if r > 200 and g > 150 and b > 110 and r - b > 40}
    h, w = cells.shape
    mid = cells[:, w // 4: 3 * w // 4]
    face_rows = [y for y in range(h) if np.isin(mid[y], list(skinish)).sum() > w // 5]
    if len(face_rows) < 4:
        return out
    vals, counts = np.unique(cells[face_rows][np.isin(cells[face_rows], list(skinish))], return_counts=True)
    skin = vals[np.argmax(counts)]
    y0, y1 = face_rows[0], face_rows[0] + (face_rows[-1] - face_rows[0]) * 2 // 3
    for x in range(w // 4, 3 * w // 4):
        col = [y for y in range(y0, y1 + 1) if cells[y, x] in dark]
        if 2 <= len(col) <= 6 and cells[col[0] - 1, x] in skinish and cells[col[-1] + 1, x] in skinish:
            for y in col[:-1]:
                out[y, x] = skin
    return out


if __name__ == "__main__":
    cut = {p: cut_background(Image.open(SRC / f"{p}.png")) for p in POSES}
    pal = shared_palette(list(cut.values()))
    pal_rgb = [tuple(pal.getpalette()[i * 3: i * 3 + 3]) for i in range(COLOURS)]
    pal_rgb = [(18, 14, 16) if sum(c) < 70 else c for c in pal_rgb]  # one outline black
    cells = {p: to_cells(cut[p], pal) for p in POSES}
    cells["blink"] = blink_from(cells["idle"], pal_rgb)
    # common crop across all poses so they stay aligned
    ys, xs = np.where(np.any([c != 255 for c in cells.values()], axis=0))
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    for p, c in cells.items():
        im = render(c[y0:y1, x0:x1], pal_rgb)
        im.resize((im.width * 2, im.height * 2), Image.NEAREST).save(OUT / f"holmes_{p}.png")
    print("ok", (x1 - x0, y1 - y0), "cells; palette", len(pal_rgb))
