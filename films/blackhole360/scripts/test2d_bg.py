"""Background plates for the 10 s flat test: the black hole seen ahead and a little to the right, slow push-in, disk turning.
    python3 scripts/test2d_bg.py out/t2bg <n_frames> <fps> <part> <parts>"""
import sys, os, numpy as np
from PIL import Image
sys.path.insert(0, 'scripts')
import bh
out, n, fps, part, parts = sys.argv[1], int(sys.argv[2]), float(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
os.makedirs(out, exist_ok=True)
sky = bh.make_sky(8192)
cache = {}
for i in range(part, n, parts):
    t = i / fps
    rk = round(40 - 5 * (t / 10), 1)
    if rk not in cache: cache = {rk: bh.orbit_table(rk)}
    img = bh.render(rk, 1440, False, 24, r_out=18, sky=sky, table=cache[rk], t=t * 60, view=(1440, 810, 84, 2, 14))
    Image.fromarray(bh.tonemap(bh.bloom(img, 0.08), 0.85)).save(f'{out}/f{i:04d}.jpg', quality=90)
    print('frame', i, flush=True)
