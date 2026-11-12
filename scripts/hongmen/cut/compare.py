#!/usr/bin/env python3
"""compare.py <frame> <remotion_still.png> [--out dir] [--pic dir] [--ov dir]
Compares the cut's frame (picture layer + overlay layer, laid together exactly as make_cut.sh does) with a real
Remotion still of the same frame at the same size (/home/user/hm_tools/remotion_still.sh HongmenFilm <frame> out.png).
Prints, per channel, the mean absolute difference
  - of the whole frame,
  - of the PICTURE (where the overlay layer is fully transparent),
  - of the OVERLAYS (where the overlay layer is opaque) and of their EDGES (partly transparent pixels: a dark or
    bright fringe from a wrong alpha convention shows as a signed difference there),
  - the shift (dx, dy) at which the cut's overlay shapes fit the still's best (0, 0 = the same pixels),
  - which of straight / premultiplied alpha the layer is (the one that reproduces the still),
and writes <out>/cmp_<frame>.png: cut | still | difference x4.
"""
import argparse
import os
import subprocess
import sys

import numpy as np
from PIL import Image

FINAL = os.environ.get("HM_CUT_DIR", "/home/user/hm_work/final")


def over_ffmpeg(pic, ov, out):
    fc = "[0:v]format=gbrp[p];[1:v]format=gbrap[o];[p][o]overlay=format=gbrp:alpha=straight"
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", pic, "-i", ov, "-filter_complex", fc, "-frames:v", "1", out], check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("frame", type=int)
    ap.add_argument("still")
    ap.add_argument("--out", default=os.path.join(FINAL, "compare"))
    ap.add_argument("--pic", default=os.path.join(FINAL, "frames", "pic_540x960"))
    ap.add_argument("--ov", default=os.path.join(FINAL, "frames", "ov"))
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    f = a.frame
    picp, ovp = os.path.join(a.pic, "f%04d.png" % f), os.path.join(a.ov, "o%04d.png" % f)
    cutp = os.path.join(a.out, "cut_%04d.png" % f)
    over_ffmpeg(picp, ovp, cutp)
    cut = np.asarray(Image.open(cutp).convert("RGB")).astype(np.float64)
    ref = np.asarray(Image.open(a.still).convert("RGB")).astype(np.float64)
    pic = np.asarray(Image.open(picp).convert("RGB")).astype(np.float64)
    ov = np.asarray(Image.open(ovp).convert("RGBA")).astype(np.float64)
    if cut.shape != ref.shape:
        print(f"sizes differ: cut {cut.shape[1]}x{cut.shape[0]}, still {ref.shape[1]}x{ref.shape[0]}")
        return 1
    al = ov[..., 3]
    clear, solid, edge = al == 0, al == 255, (al > 0) & (al < 255)
    d = cut - ref
    fmt = lambda m: ("%.2f / %.2f / %.2f" % tuple(np.abs(d[m]).mean(axis=0))) if m.any() else "-"
    print(f"frame {f}: mean absolute difference per channel (R / G / B), 0..255")
    print(f"  whole frame            {fmt(np.ones_like(clear))}")
    print(f"  picture (alpha 0)      {fmt(clear)}   ({clear.mean() * 100:.1f} % of the frame)")
    print(f"  overlays (alpha 255)   {fmt(solid)}   ({int(solid.sum())} px)")
    print(f"  overlay edges (partial){fmt(edge)}   ({int(edge.sum())} px; signed mean {d[edge].mean():+.2f})" if edge.any() else "  overlay edges          -")
    if clear.any():
        dd = np.abs(d).max(axis=2)
        print(f"  picture: {100 * (dd[clear] > 8).mean():.2f} % of pixels differ by more than 8, {100 * (dd[clear] > 24).mean():.2f} % by more than 24; mean colour cut {cut[clear].mean(axis=0).round(1)} still {ref[clear].mean(axis=0).round(1)}")
        # where: a 3 x 6 grid of the picture difference
        H, W = dd.shape
        grid = []
        for r in range(6):
            row = []
            for c in range(3):
                m = np.zeros_like(clear); m[r * H // 6:(r + 1) * H // 6, c * W // 3:(c + 1) * W // 3] = True
                m &= clear
                row.append("%5.2f" % np.abs(d[m]).mean() if m.any() else "    -")
            grid.append(" ".join(row))
        print("  picture difference by region (3 columns x 6 rows, top first):\n    " + "\n    ".join(grid))
    # alpha convention: which composite of (pic, ov) is nearest the still on the partly transparent pixels
    if edge.any():
        a1 = al[..., None] / 255.0
        straight = ov[..., :3] * a1 + pic * (1 - a1)
        premul = np.clip(ov[..., :3] + pic * (1 - a1), 0, 255)
        es = np.abs(straight - ref)[edge].mean(); ep = np.abs(premul - ref)[edge].mean()
        ef = np.abs(cut - straight)[al > 0].mean()
        print(f"  alpha: straight composite differs from the still by {es:.2f} on the edges, premultiplied by {ep:.2f} -> the layer is {'STRAIGHT' if es <= ep else 'PREMULTIPLIED'} alpha; ffmpeg's overlay equals the straight composite to {ef:.2f}")
    # overlay position: the still's own overlay shapes = where the still differs from the cut's picture layer
    if (al > 0).any():
        ys, xs = np.where(al > 0)
        y0, y1, x0, x1 = max(ys.min() - 6, 0), min(ys.max() + 7, al.shape[0]), max(xs.min() - 6, 0), min(xs.max() + 7, al.shape[1])
        g = lambda im: im[..., 0] * 0.3 + im[..., 1] * 0.59 + im[..., 2] * 0.11
        A, B = g(cut), g(ref)
        best = None
        for dy in range(-4, 5):
            for dx in range(-4, 5):
                sa = A[y0 + 4:y1 - 4, x0 + 4:x1 - 4]
                sb = B[y0 + 4 + dy:y1 - 4 + dy, x0 + 4 + dx:x1 - 4 + dx]
                if sa.shape != sb.shape or sa.size == 0:
                    continue
                m = (al[y0 + 4:y1 - 4, x0 + 4:x1 - 4] > 0)
                e = np.abs(sa - sb)[m].mean()
                if best is None or e < best[0]:
                    best = (e, dx, dy)
        e0 = np.abs(A - B)[al > 0].mean()
        print(f"  overlays: best fit at shift dx {best[1]} dy {best[2]} (difference {best[0]:.2f}; at 0, 0: {e0:.2f}); box x {xs.min()}..{xs.max()} y {ys.min()}..{ys.max()}")
        # the solid glyph shapes themselves: the same pixels?
        hi = lambda im: (im.min(axis=2) > 200)          # white text
        gold = lambda im: (im[..., 0] > 200) & (im[..., 1] > 140) & (im[..., 2] < 110)
        for name, fn in (("white", hi), ("gold", gold)):
            ma, mb = fn(cut) & (al > 0), fn(ref) & (al > 0)
            if ma.any() or mb.any():
                print(f"    {name} text pixels: cut {int(ma.sum())}, still {int(mb.sum())}, different {int((ma ^ mb).sum())}")
    heat = np.clip(np.abs(d) * 4, 0, 255)
    sheet = np.concatenate([cut, ref, heat], axis=1).astype(np.uint8)
    outp = os.path.join(a.out, "cmp_%04d.png" % f)
    Image.fromarray(sheet).save(outp)
    print("  wrote " + outp + "  (cut | still | difference x4)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
