"""Trace a flat secondary-character reference into clean vector fills (builder C: 高衙内, 陆谦).
python3 trace2.py <ref.png> <out.json> [K] [erase.json]
erase.json: [{"poly": [[x,y],...], "fill": "#rrggbb" | null}]  (null = make transparent), in source px.
Output: {w, h, top, sole, cx, paths: [[hex, d], ...]} in source pixel coordinates.
Uses the rigger's tracelib (upscale, smooth, palette, mode filter, vtracer).
"""
import json, sys, os
import numpy as np, cv2
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../../chars/rig/build'))
import tracelib as T

src, out = sys.argv[1], sys.argv[2]
K = int(sys.argv[3]) if len(sys.argv) > 3 else 16
erase = json.load(open(sys.argv[4])) if len(sys.argv) > 4 else []

rgb = T.load(src)
h, w = rgb.shape[:2]
bg = T.bg_mask(rgb, 16)
fg = ~bg
for e in erase:
    poly = np.array(e['poly'], np.int32)
    m = np.zeros((h, w), np.uint8)
    cv2.fillPoly(m, [poly], 1)
    m = m > 0
    if e.get('fill'):
        rgb[m & fg] = T.hex_rgb(e['fill'])
        if e.get('add'):
            rgb[m] = T.hex_rgb(e['fill']); fg = fg | m
    else:
        fg = fg & ~m
hi = T.smooth(T.upscale(rgb))
fgh = cv2.resize(fg.astype(np.uint8), (w * T.UP, h * T.UP), interpolation=cv2.INTER_LINEAR) > 0
fgh = T.soft_mask(cv2.morphologyEx(fgh.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)) > 0, 1.3)
cen = T.kmeans_palette(hi, fgh, K)
cen = T.merge_close(list(cen), 6.0)
lab = T.assign(hi, cen)
lab = T.mode_filter(lab, fgh, len(cen), r=2, iters=2)
lab = T.remove_small_regions(lab, fgh, len(cen), 60)
pal = T.rgb_of(cen)
rgba = np.zeros((h * T.UP, w * T.UP, 4), np.uint8)
rgba[..., :3] = pal[lab]
rgba[..., 3] = np.where(fgh, 255, 0)
paths = T.trace_layer(rgba, filter_speckle=8, color_precision=8, layer_difference=4)
ys, xs = np.nonzero(fg)
res = dict(w=w, h=h, top=int(ys.min()), sole=int(ys.max()), cx=float(xs.mean()), paths=paths)
json.dump(res, open(out, 'w'))
print(out, len(paths), 'paths', 'top', res['top'], 'sole', res['sole'])
