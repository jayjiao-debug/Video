"""Render the ray-traced equirect plates for frames [a, b) of the fall (see ../scripts/sched.py).
    python3 plates.py <a> <b> <outdir> [--w 3840] [--gpu]"""
import sys, os, json, time, argparse
here = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, here)
import bh
from PIL import Image
ap = argparse.ArgumentParser(); ap.add_argument('a', type=int); ap.add_argument('b', type=int); ap.add_argument('out')
ap.add_argument('--w', type=int, default=3840); ap.add_argument('--gpu', action='store_true'); ap.add_argument('--frames', default='')
a = ap.parse_args()
if a.gpu: bh.use_gpu()
S = json.load(open(os.path.join(here, 'sched.json'))); fps = S['fps']
os.makedirs(a.out, exist_ok=True)
t0 = time.time(); sky = bh.xp.asarray(bh.make_sky(8192)); print('SKY_S', round(time.time() - t0, 1), flush=True)
frames = [int(x) for x in a.frames.split(',')] if a.frames else list(range(a.a, a.b))
import numpy as np
from concurrent.futures import ThreadPoolExecutor
def table_cpu(r):
    # the photon-orbit table is a long sequential loop over small arrays: faster on the CPU, and it overlaps the GPU frame
    return bh.orbit_table(r, X=np)
def to_dev(t):
    b, dphi, tabs = t; X = bh.xp
    return X.asarray(b), dphi, [dict(U=X.asarray(x['U']), end=X.asarray(x['end']), fate=X.asarray(x['fate'])) for x in tabs]
pool = ThreadPoolExecutor(1); nxt = pool.submit(table_cpu, S['r'][frames[0]]) if frames else None
t0 = time.time(); n = 0
for j, i in enumerate(frames):
    r, ex = S['r'][i], S['expo'][i]
    tab = to_dev(nxt.result())
    if j + 1 < len(frames): nxt = pool.submit(table_cpu, S['r'][frames[j + 1]])
    img = bh.render(r, a.w, True, 24, r_out=18, sky=sky, table=tab, t=i / fps * 40, tpeak=3900)
    Image.fromarray(bh.to_np(bh.tonemap(bh.bloom(img, 0.08), ex * 1.15))).save(f'{a.out}/f{i:05d}.jpg', quality=95)
    n += 1
print('PLATE_S_PER_FRAME', round((time.time() - t0) / max(n, 1), 2), flush=True)
