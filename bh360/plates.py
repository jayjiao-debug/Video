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
frames = [int(x) for x in a.frames.split(',')] if a.frames else range(a.a, a.b)
t0 = time.time(); n = 0
for i in frames:
    r, ex = S['r'][i], S['expo'][i]
    img = bh.render(r, a.w, True, 24, r_out=18, sky=sky, table=bh.orbit_table(r), t=i / fps * 40, tpeak=3900)
    Image.fromarray(bh.to_np(bh.tonemap(bh.bloom(img, 0.08), ex * 1.15))).save(f'{a.out}/f{i:05d}.jpg', quality=95)
    n += 1
print('PLATE_S_PER_FRAME', round((time.time() - t0) / max(n, 1), 2), flush=True)
