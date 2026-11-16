#!/usr/bin/env python3
"""front.py: the part of a cover still that stands IN FRONT of the title (his top-knot pokes up over the flag's hem).
  python3 scripts/libai/cover/front.py <still.png> <out.png> --seed X,Y --box X0,Y0,X1,Y1 [--dark 86]
The dark shape that holds the seed, inside the box, is cut out of the still (holes filled, edge softened one pixel) and
written on a transparent page of the still's size. cover.mjs --front draws it over the title."""
import argparse
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ap = argparse.ArgumentParser()
ap.add_argument("still"); ap.add_argument("out")
ap.add_argument("--seed", required=True); ap.add_argument("--box", required=True); ap.add_argument("--dark", type=int, default=86)
a = ap.parse_args()
im = Image.open(a.still).convert("RGB"); px = np.asarray(im).astype(int)
sx, sy = map(int, a.seed.split(",")); x0, y0, x1, y1 = map(int, a.box.split(","))
lum = (px[..., 0] * 299 + px[..., 1] * 587 + px[..., 2] * 114) // 1000
dark = np.zeros(lum.shape, bool); dark[y0:y1, x0:x1] = lum[y0:y1, x0:x1] < a.dark
lab, _ = ndimage.label(dark)
if not lab[sy, sx]: raise SystemExit("the seed is not on a dark pixel")
m = ndimage.binary_fill_holes(lab == lab[sy, sx])
m = ndimage.binary_closing(m, iterations=2) | m
alpha = Image.fromarray((m * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.8))
out = im.convert("RGBA"); out.putalpha(alpha); out.save(a.out)
ys, xs = np.nonzero(m); print("front:", a.out, "box", xs.min(), ys.min(), xs.max(), ys.max(), "px", int(m.sum()))
