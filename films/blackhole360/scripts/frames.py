"""Style frames for 《掉进黑洞》: 4K equirect panoramas at four moments of the fall, plus a flat 16:9 'front view' of each."""
import sys, math, numpy as np
from PIL import Image
sys.path.insert(0, 'scripts')
import bh
W = int(sys.argv[1]) if len(sys.argv) > 1 else 3840
sky = bh.make_sky(8192)
SHOTS = [('1_远处', 40, False, 0.75), ('2_靠近', 10, True, 0.7), ('3_光子球', 3.2, True, 0.7), ('4_视界前', 2.15, True, 0.8)]
def front(eq, fov=100, w=1600, h=900):
    """rectilinear view straight ahead from an equirect image"""
    H, Wd = eq.shape[:2]
    f = (w / 2) / math.tan(math.radians(fov / 2))
    xs, ys = np.meshgrid(np.arange(w) - w / 2 + 0.5, np.arange(h) - h / 2 + 0.5)
    d = np.stack([np.full_like(xs, f), -xs, -ys], -1); d /= np.linalg.norm(d, axis=-1, keepdims=True)
    lon = -np.arctan2(d[..., 1], d[..., 0]); lat = np.arcsin(d[..., 2])
    px = ((lon + np.pi) / (2 * np.pi) * Wd).astype(int) % Wd; py = ((np.pi / 2 - lat) / np.pi * H).astype(int).clip(0, H - 1)
    return eq[py, px]
for name, r, fall, ex in SHOTS:
    img = bh.render(r, W, fall, 24, r_out=18, sky=sky, table=bh.orbit_table(r))
    L = img.mean(-1); p = float(np.percentile(L[L > 0.02], 99.3)) if (L > 0.02).any() else 1.0
    out = bh.tonemap(bh.bloom(img, 0.08), ex * min(2.5, 2.2 / max(p, 1e-3)))  # auto exposure, like an eye adapting
    Image.fromarray(out).save(f'out/全景_{name}.jpg', quality=90)
    Image.fromarray(front(out)).save(f'out/正前方_{name}.jpg', quality=90)
    print('ok', name, flush=True)
