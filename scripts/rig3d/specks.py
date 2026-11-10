# Isolated single-pixel specks: a pixel that differs from the median of its 8 neighbours by more than T while the
# neighbours agree with each other (a flat area with one odd pixel). usage: python3 specks.py <frames dir> [T]
import sys, glob
import numpy as np
from PIL import Image
d = sys.argv[1]; T = float(sys.argv[2]) if len(sys.argv) > 2 else 28
tot = 0; rows = []
for p in sorted(glob.glob(d + '/f*.png')):
    a = np.asarray(Image.open(p).convert('RGB'), np.float32)
    h, w, _ = a.shape
    nb = np.stack([a[1 + dy:h - 1 + dy, 1 + dx:w - 1 + dx] for dy in (-1, 0, 1) for dx in (-1, 0, 1) if (dy, dx) != (0, 0)])
    med = np.median(nb, axis=0); spread = (nb.max(axis=0) - nb.min(axis=0)).max(axis=-1)
    diff = np.abs(a[1:-1, 1:-1] - med).max(axis=-1)
    m = (diff > T) & (spread < 14)
    ys, xs = np.nonzero(m)
    tot += len(xs)
    if len(xs): rows.append((p.split('/')[-1], [(int(x) + 1, int(y) + 1, tuple(int(c) for c in a[y + 1, x + 1]), tuple(int(c) for c in med[y, x])) for x, y in zip(xs[:6], ys[:6])], len(xs)))
print(d, 'frames', len(glob.glob(d + '/f*.png')), 'specks', tot, 'in', len(rows), 'frames')
for r in rows[:12]: print('  ', r[0], r[2], r[1][:3])
