"""Route B of the background test: trace AI-painted set plates into flat vector layers (far / mid / near).

usage: python3 trace_plates.py [name ...]      (default: all plates)

Plates come from HF Z-Image-Turbo (prompts + seeds in art_log.md, "Background plates") and live in
/dev/shm/shz01/art/bg/<name>.png (never committed). Output: /dev/shm/shz01/film/bgtrace/<name>.json
  {w, h, layers: {far|mid|near: {fills: [[hex, d], ...], ink: [[hex, width, d], ...]}}}
in plate pixels after the crop. Same family as the characters: the rig's tracelib (k-means palette in Lab, mode filter,
small-region merge, vtracer stacked splines, centre-line ink). Each deeper layer has the nearer layers' area filled with
its nearest colours, so the layers can slide over each other for parallax without holes.
"""
import json, os, sys
import numpy as np, cv2

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../chars/rig/build'))
import tracelib as T  # noqa: E402

SRC = '/dev/shm/shz01/art/bg'
OUT = '/dev/shm/shz01/film/bgtrace'
D = 2048 / 2000  # polygons below were read on a 2000-px-wide view of the 2048-px plates


def P(pts):
    return [(x * D, y * D) for x, y in pts]


PLATES = {
    # S02/S03 tavern back wall. Fixes: pseudo-text on the hanging sign -> flat board (the 酒 is drawn in code);
    # a modern hurricane lantern -> inpainted (an oil dish lamp is drawn in code). Roof tiles at the top cropped.
    'bg_tavern': dict(K=26, crop=(0, 56, 2048, 1152),
                      flat=[P([(690, 355), (815, 355), (815, 695), (690, 695)])] +
                      [P([(cx, 322), (cx + 34, 354), (cx, 386), (cx - 34, 354)]) for cx in (120, 298, 480)],  # 福 -> plain red diamond
                      inpaint=[P([(192, 440), (305, 440), (305, 596), (192, 596)])],
                      layers={'far': P([(928, 305), (1395, 305), (1395, 1068), (928, 1068)]) + [None] +
                              P([(1862, 40), (2000, 40), (2000, 1100), (1862, 1100)]),
                              'mid': None,
                              'near': P([(0, 822), (822, 822), (822, 1125), (0, 1125)])}),
    # S01 table top, seen from above: crop to the boards only.
    'bg_table': dict(K=12, sp=18, sr=34, crop=(256, 100, 1874, 950), layers={'near': None}),
    # S22/S23 山神庙 interior.
    'bg_temple': dict(K=22, sp=18, sr=30, crop=(0, 0, 2048, 1152),
                      layers={'far': None,
                              'mid': P([(150, 410), (735, 410), (735, 1015), (150, 1015)]) + [None] +
                              P([(680, 360), (1000, 360), (1010, 930), (680, 930)]) + [None] +
                              P([(1040, 330), (1550, 330), (1550, 975), (1040, 975)]) + [None] +
                              P([(700, 850), (1020, 850), (1020, 960), (700, 960)]),
                              'near': P([(0, 895), (380, 950), (520, 1125), (0, 1125)])}),
    # S09 岳庙 courtyard, high angle. Fix: the plate's own incense burner is replaced by paving copied from the right
    # (the take keeps its 鼎). Bottom extended by mirroring the paving so the layer covers the frame when moved up.
    'bg_courtyard': dict(K=24, sp=16, sr=26, crop=(0, 0, 2048, 1152), copy=[(P([(135, 660), (345, 660), (345, 905), (135, 905)]), 655)],
                         extend=420,
                         layers={'far': P([(0, 0), (2000, 0), (2000, 150), (0, 150)]),
                                 'mid': P([(0, 0), (2000, 0), (2000, 470), (1920, 470), (1920, 655), (1370, 655), (1370, 735),
                                           (735, 735), (735, 650), (130, 650), (130, 470), (0, 470)]),
                                 'near': None}),
}


def poly_mask(shape, polys):
    m = np.zeros(shape, np.uint8)
    cur = []
    for p in (polys or []) + [None]:
        if p is None:
            if cur:
                cv2.fillPoly(m, [np.array(cur, np.int32)], 1)
            cur = []
        else:
            cur.append(p)
    return m > 0


def shift_polys(polys, dx, dy):
    return [None if p is None else (p[0] - dx, p[1] - dy) for p in polys] if polys else polys


def trace(name):
    cfg = PLATES[name]
    rgb = T.load(f'{SRC}/{name}.png')
    # ---- fixes in plate coordinates (before the crop)
    for poly in cfg.get('flat', []):
        m = poly_mask(rgb.shape[:2], poly)
        rgb[m] = np.median(rgb[m], axis=0).astype(np.uint8)
    for poly in cfg.get('inpaint', []):
        m = poly_mask(rgb.shape[:2], poly).astype(np.uint8)
        rgb = cv2.inpaint(rgb, cv2.dilate(m, np.ones((5, 5), np.uint8)), 9, cv2.INPAINT_TELEA)
    for poly, dx in cfg.get('copy', []):
        m = poly_mask(rgb.shape[:2], poly)
        ys, xs = np.nonzero(m)
        rgb[ys, xs] = rgb[ys, np.clip(xs + int(dx), 0, rgb.shape[1] - 1)]
    x0, y0, x1, y1 = cfg['crop']
    rgb = np.ascontiguousarray(rgb[y0:y1, x0:x1])
    if cfg.get('extend'):
        e = cfg['extend']
        rgb = np.concatenate([rgb, rgb[-e:][::-1]], axis=0)
    h, w = rgb.shape[:2]
    sm = T.smooth(rgb)
    # painted gradients would posterise into blotches: flatten them into cel regions first (mean shift), the ink is
    # still found on the lightly smoothed plate
    flat = T.smooth(cv2.pyrMeanShiftFiltering(rgb, cfg.get('sp', 12), cfg.get('sr', 18)))
    valid = np.ones((h, w), bool)
    # ---- ink (thin dark outlines) -> centre lines; fills quantised under them
    ink = T.ink_mask(sm, valid, k=11, thr=7, rel=0.07, maxlum=165, min_area=80)
    ink_lab = cv2.cvtColor(sm, cv2.COLOR_RGB2LAB).reshape(-1, 3)[ink.reshape(-1)].astype(np.float32)
    if len(ink_lab) > 50:
        cv2.setRNGSeed(3)
        _, _, ink_pal = cv2.kmeans(ink_lab[:: max(1, len(ink_lab) // 60000)], 3, None,
                                   (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 40, 0.5), 3, cv2.KMEANS_PP_CENTERS)
    else:
        ink_pal = T.lab_of(['#2A1C17', '#3B2A22', '#4A3A30'])
    pal = T.merge_close(T.kmeans_palette(flat, ~ink, cfg['K'], seed=1), 4.0)
    lab = T.assign(flat, pal)
    lab = T.fill_labels(lab, ink, valid)
    lab = T.mode_filter(lab, valid, len(pal), r=3, iters=2)
    lab = T.remove_small_regions(lab, valid, len(pal), cfg.get('min_area', 500))
    lab = T.soft_labels(lab, valid, len(pal), 1.2)
    pal_rgb = T.rgb_of(pal)
    # ---- depth regions (polygons are in pre-crop plate px)
    order = [k for k in ('far', 'mid', 'near') if k in cfg['layers']]
    explicit = {k: poly_mask((h, w), shift_polys(cfg['layers'][k], x0, y0)) for k in order if cfg['layers'][k]}
    own = {}
    rest = np.ones((h, w), bool)
    for k in reversed(order):  # nearest wins; a None region = everything no other layer names explicitly
        if k in explicit:
            m = explicit[k]
        else:
            m = np.ones((h, w), bool)
            for kk, mm in explicit.items():
                if kk != k:
                    m &= ~mm
        own[k] = m & rest
        rest &= ~own[k]
    if order[0] in own:
        own[order[0]] |= rest  # leftovers go to the deepest layer
    out = {'w': w, 'h': h, 'layers': {}}
    nearer = np.zeros((h, w), bool)
    for k in reversed(order):
        region = own[k]
        cover = region | nearer  # this layer is opaque wherever a nearer layer is (no holes when they slide)
        hole = cv2.dilate(nearer.astype(np.uint8), np.ones((9, 9), np.uint8)) > 0
        hole &= ~cv2.erode(region.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
        lk = T.fill_labels(lab, hole & cover, cover) if hole.any() else lab
        q = pal_rgb[lk].astype(np.uint8)
        alpha = (T.soft_mask(cv2.dilate(cover.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0, 1.0) * 255).astype(np.uint8)
        rgba = np.dstack([q, alpha])
        fills = T.trace_layer(rgba, k=1.0, filter_speckle=8, color_precision=8, layer_difference=8, path_precision=1)
        fills = [[c, d] for c, d in fills if c not in ('#000000',)]
        strokes = T.centre_lines((ink & region).astype(np.uint8), sm, ink_pal, k=1.0, min_len=14, eps=1.0, wscale=0.9)
        out['layers'][k] = {'fills': fills, 'ink': strokes}
        nearer |= region
        print(f'{name} {k}: {len(fills)} fills, {len(strokes)} ink strokes')
    os.makedirs(OUT, exist_ok=True)
    with open(f'{OUT}/{name}.json', 'w') as f:
        json.dump(out, f, separators=(',', ':'))
    # flat preview of what was traced (for checking), not committed
    cv2.imwrite(f'{OUT}/{name}_quant.png', cv2.cvtColor(pal_rgb[lab].astype(np.uint8), cv2.COLOR_RGB2BGR))


if __name__ == '__main__':
    for n in (sys.argv[1:] or list(PLATES)):
        trace(n)
