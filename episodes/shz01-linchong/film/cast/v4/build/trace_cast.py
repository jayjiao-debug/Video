"""Trace a side-character reference (same pipeline as the 林冲 rig: chars/rig/build/tracelib.py) into flat vector fills,
with the painted facial features removed so the face can be drawn in code with 林冲's face construction.

python3 trace_cast.py <ref.png> <out.json> [--border] [--facing 1|-1] [--noface] [--K 18]
  --border   the reference has a painted frame: everything within 44 px of the image edge is background
  --facing   1 = 3/4 view facing right, -1 = facing left, 0 = front (default)
  --noface   back views: still erase features (a 3/4 rear cheek stays blank), but no anchors are needed
Output JSON (source px): {w, h, top, sole, cx, paths:[[hex,d],...], face:{y0, y1, cx, cw, chin, facing}, skin, neck}
"""
import json, sys, os, argparse
import numpy as np, cv2
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../../../chars/rig/build'))
import tracelib as T

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('out')
ap.add_argument('--border', action='store_true'); ap.add_argument('--facing', type=int, default=0)
ap.add_argument('--noface', action='store_true'); ap.add_argument('--K', type=int, default=18)
a = ap.parse_args()

rgb = T.load(a.src)
h, w = rgb.shape[:2]
if a.border:
    m = np.zeros((h, w), bool); m[:44, :] = m[-44:, :] = True; m[:, :44] = m[:, -44:] = True
    # paint the frame with the background colour sampled just inside it
    bgc = np.median(rgb[60:120, 60:120].reshape(-1, 3), axis=0)
    rgb[m] = bgc
bg = T.bg_mask(rgb, 16)
fg = ~bg
ys, xs = np.nonzero(fg)
top, sole = int(ys.min()), int(ys.max())

# ---- face: largest skin component in the head band; fill its holes (eyes, brows, mouth, moustache) with skin
R, G, B = [rgb[..., i].astype(int) for i in range(3)]
skin = fg & (R > 150) & (R > G + 12) & (G > B + 6) & (R - B > 35) & (R - B < 140) & (G > 95)
band = np.zeros_like(skin); band[top: top + int((sole - top) * 0.24), :] = True
lab_n, lab, stats, _ = cv2.connectedComponentsWithStats((skin & band).astype(np.uint8), 8)
face_info = None
if lab_n > 1:
    k = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    comp = (lab == k).astype(np.uint8)
    # fill holes: flood from outside
    ff = comp.copy(); pad = np.zeros((h + 2, w + 2), np.uint8)
    inv = (1 - comp).astype(np.uint8)
    cv2.floodFill(inv, pad, (0, 0), 0)
    filled = (comp | inv).astype(bool)
    # close small gaps at the boundary (an eye touching the hair edge)
    filled = cv2.morphologyEx(filled.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)).astype(bool) & (comp.astype(bool) | ~bg)
    skin_med = np.median(rgb[comp.astype(bool)].reshape(-1, 3), axis=0)
    holes = filled & ~comp.astype(bool)
    rgb[holes] = skin_med
    rows = np.nonzero(filled.any(1))[0]
    y0, yb = int(rows.min()), int(rows.max())
    widths = np.array([filled[y].sum() for y in range(y0, yb + 1)])
    ymax = y0 + int(np.argmax(widths[: max(3, len(widths) * 2 // 3)]))
    wmax = widths[ymax - y0]
    chin = yb
    for y in range(ymax, yb + 1):
        if filled[y].sum() < 0.62 * wmax:
            chin = y; break
    xs_ = np.nonzero(filled[ymax])[0]
    face_info = dict(y0=y0, y1=int(chin), cx=float(xs_.mean()), cw=float(wmax), xl=int(xs_.min()), xr=int(xs_.max()),
                     facing=a.facing, skin='#%02x%02x%02x' % tuple(int(v) for v in skin_med))

hi = T.smooth(T.upscale(rgb))
fgh = cv2.resize(fg.astype(np.uint8), (w * T.UP, h * T.UP), interpolation=cv2.INTER_LINEAR) > 0
fgh = T.soft_mask(cv2.morphologyEx(fgh.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)) > 0, 1.3)
cen = T.kmeans_palette(hi, fgh, a.K)
cen = T.merge_close(list(cen), 6.0)
lab2 = T.assign(hi, cen)
lab2 = T.mode_filter(lab2, fgh, len(cen), r=2, iters=2)
lab2 = T.remove_small_regions(lab2, fgh, len(cen), 60)
pal = T.rgb_of(cen)
rgba = np.zeros((h * T.UP, w * T.UP, 4), np.uint8)
rgba[..., :3] = pal[lab2]
rgba[..., 3] = np.where(fgh, 255, 0)
paths = T.trace_layer(rgba, filter_speckle=8, color_precision=8, layer_difference=4)
res = dict(w=w, h=h, top=top, sole=sole, cx=float(xs.mean()), paths=paths, face=face_info)
json.dump(res, open(a.out, 'w'))
print(os.path.basename(a.out), len(paths), 'paths; top', top, 'sole', sole, 'face', face_info and {k: (round(v) if isinstance(v, float) else v) for k, v in face_info.items()})
