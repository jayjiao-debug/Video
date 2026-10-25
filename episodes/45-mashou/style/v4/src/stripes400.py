#!/usr/bin/env python3
"""Note 1 test at phone size: the hero is isolated by diffing <name>.png against <name>_nohero.png, both shrunk to 400 px wide.
Above the neck cut, the front 45 % of the hero (toward the nose) is 'face', the back 35 % is 'mane'. Reports the mean luma of each
(target: within 25) and the banding of the mane: the std of a 1-px column profile taken across the mane, after a 3-px smooth."""
import sys, numpy as np
from PIL import Image
D = '/home/claude/video/episodes/45-mashou/style/v4/'
for arg in sys.argv[1:]:
    n, cut, face = arg.split(':'); cut = float(cut); left = face == 'L'
    A = Image.open(f'{D}{n}.png').convert('L'); B = Image.open(f'{D}{n}_nohero.png').convert('L')
    full = np.abs(np.asarray(A, float) - np.asarray(B, float)) > 10
    full[int(cut):, :] = False
    ys, xs = np.nonzero(full); x0, x1 = xs.min(), xs.max()
    a = np.asarray(A.resize((400, 225), Image.LANCZOS), float); k = 400 / 1920
    m = np.asarray(Image.fromarray(full.astype(np.uint8) * 255).resize((400, 225), Image.BILINEAR)) > 200
    X = np.arange(400)[None, :].repeat(225, 0) / k
    fr = (X < x0 + 0.45 * (x1 - x0)) if left else (X > x1 - 0.45 * (x1 - x0))
    bk = (X > x1 - 0.35 * (x1 - x0)) if left else (X < x0 + 0.35 * (x1 - x0))
    fm, mm = a[m & fr].mean(), a[m & bk].mean()
    # banding: rows through the mane, profile across x (locks run roughly vertical), smoothed
    rows = [r for r in range(225) if (m & bk)[r].sum() >= 4]; bands = []
    for r in rows:
        v = a[r][(m & bk)[r]];  v = np.convolve(v, np.ones(3) / 3, 'valid') if len(v) > 3 else v; bands.append(v.std())
    print(f'{n}: face {fm:.0f}, mane {mm:.0f} (Δ {mm - fm:+.0f}, target |Δ| ≤ 25), mane banding across the locks: std {np.mean(bands):.1f} luma (n={m.sum()} px at 400 px)')
