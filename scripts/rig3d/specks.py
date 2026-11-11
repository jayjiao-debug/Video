# Isolated single-pixel specks: a pixel that differs from the median of its 8 neighbours by more than T while the
# neighbours agree with each other (a flat area with one odd pixel).
#   python3 specks.py <frames dir> [T] [--mask <mask frames dir>]
# --mask: the same frames rendered with rigLab's `mask` option (the figures alone on magenta). Only specks on a
# figure, or within one pixel of one, are counted: under a moving camera the set has thin lines of its own (tile
# joints, blind slats) that come and go by single pixels, and those are not the rig's.
import sys, glob, os
import numpy as np
from PIL import Image

def find(path, T=28, mask=None):
    """the specks of one picture: [(x, y, its colour, the colour round it)]; mask = a picture of the figures on magenta"""
    a = np.asarray(Image.open(path).convert('RGB'), np.float32)
    h, w, _ = a.shape
    nb = np.stack([a[1 + dy:h - 1 + dy, 1 + dx:w - 1 + dx] for dy in (-1, 0, 1) for dx in (-1, 0, 1) if (dy, dx) != (0, 0)])
    med = np.median(nb, axis=0); spread = (nb.max(axis=0) - nb.min(axis=0)).max(axis=-1)
    diff = np.abs(a[1:-1, 1:-1] - med).max(axis=-1)
    hit = (diff > T) & (spread < 14)
    if mask is not None:
        m = np.asarray(Image.open(mask).convert('RGB').resize((w, h), Image.NEAREST), np.float32)
        fig = np.abs(m - np.array([255, 0, 255], np.float32)).max(axis=-1) > 40
        near = fig.copy()
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1): near |= np.roll(np.roll(fig, dy, 0), dx, 1)
        hit &= near[1:-1, 1:-1]
    ys, xs = np.nonzero(hit)
    return [(int(x) + 1, int(y) + 1, tuple(int(c) for c in a[y + 1, x + 1]), tuple(int(c) for c in med[y, x])) for x, y in zip(xs, ys)]

if __name__ == "__main__":
    args = sys.argv[1:]; md = None
    if "--mask" in args: i = args.index("--mask"); md = args[i + 1]; del args[i:i + 2]
    d = args[0]; T = float(args[1]) if len(args) > 1 else 28
    tot = 0; rows = []
    for p in sorted(glob.glob(d + '/f*.png')):
        mp = os.path.join(md, os.path.basename(p)) if md else None
        s = find(p, T, mp if mp and os.path.exists(mp) else None); tot += len(s)
        if s: rows.append((p.split('/')[-1], s[:6], len(s)))
    print(d, 'frames', len(glob.glob(d + '/f*.png')), 'specks', tot, 'in', len(rows), 'frames' + (' (on the figures only)' if md else ''))
    for r in rows[:12]: print('  ', r[0], r[2], r[1][:3])
