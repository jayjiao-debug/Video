"""Plates for the storyboard: flat views out of the 360 world at the moments of the fall."""
import sys, os, numpy as np
from PIL import Image
sys.path.insert(0, 'scripts')
import bh
os.makedirs('public/board', exist_ok=True)
sky = bh.make_sky(8192)
P = [  # name, r, falling, (fov, pitch, yaw), exposure
    ('p1_far', 40, False, (84, 2, 14), 0.85), ('p2_back', 40, False, (90, 8, 180), 0.85), ('p3_mid', 26, False, (90, 3, 0), 0.85),
    ('p4_down', 12, True, (100, -55, 0), 0.75), ('p5_near', 9, True, (95, 4, 0), 0.7), ('p6_photon', 3.2, True, (100, 0, 0), 0.75),
    ('p7_horizon', 2.08, True, (100, 0, 0), 0.8),
]
for name, r, fall, (fov, pitch, yaw), ex in P:
    img = bh.render(r, 1920, fall, 24, r_out=18, sky=sky, table=bh.orbit_table(r), view=(1920, 1080, fov, pitch, yaw))
    L = img.mean(-1); p = float(np.percentile(L[L > 0.02], 99.3)) if (L > 0.02).any() else 1.0
    Image.fromarray(bh.tonemap(bh.bloom(img, 0.08), ex * min(2.5, 2.2 / max(p, 1e-3)))).save(f'public/board/{name}.jpg', quality=90)
    print('ok', name, flush=True)
