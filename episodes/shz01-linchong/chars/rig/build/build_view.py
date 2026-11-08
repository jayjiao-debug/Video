# python3 build_view.py <view> [--debug DIR]
# Trace one 林冲 reference into rig parts and write chars/rig/data/lc_<view>.json.
# References are read from /dev/shm/shz01/art (never committed); only the vector output is kept.
import sys, os, json, time
import numpy as np, cv2
sys.path.insert(0, os.path.dirname(__file__))
from tracelib import *
from specs import VIEWS

ART = '/dev/shm/shz01/art/'
OUT = os.path.join(os.path.dirname(__file__), '..', 'data')


def polymask(poly, shape, k=UP):
    m = np.zeros(shape, np.uint8)
    pts = (np.array(poly, np.float64) * k).round().astype(np.int32)
    cv2.fillPoly(m, [pts], 1, cv2.LINE_8)
    return m > 0


def pred_mask(pred, L, pal_lab):
    """Pixels whose palette colour satisfies a named predicate."""
    Lc, ac, bc = pal_lab[:, 0], pal_lab[:, 1], pal_lab[:, 2]
    if pred == 'dark':
        ok = Lc < 92
    elif pred == 'red':
        ok = (ac > 146) & (Lc < 170)
    elif pred == 'skin':
        ok = (ac > 136) & (bc > 145) & (Lc > 120)
    elif pred == 'notskin':
        ok = ~((ac > 136) & (bc > 145) & (Lc > 120))
    elif pred == 'cord':
        ok = (ac > 150) & (Lc < 140)
    elif pred == 'brown':
        ok = (ac >= 134) & (bc >= 131) & (Lc > 50) & (Lc < 160)
    elif pred == 'notbrown':
        ok = ~((ac >= 134) & (bc >= 131) & (Lc > 50) & (Lc < 160))
    elif pred == 'navy':
        ok = (bc < 128) & (Lc < 130)
    elif pred == 'notdark':
        ok = Lc >= 92
    elif pred == 'none':
        ok = np.zeros(len(Lc), bool)
    elif pred == 'notgreen':
        ok = ~((ac < 120) & (Lc < 170))
    elif isinstance(pred, (list, tuple)):  # explicit RGB anchors, within dE 18
        anc = lab_of(pred)
        d = np.sqrt(((pal_lab[:, None, :] - anc[None]) ** 2).sum(-1)).min(1)
        ok = d < 22
    else:
        raise ValueError(pred)
    return ok[L]


def build(view, debug=None):
    t0 = time.time()
    S = VIEWS[view]
    rgb = load(ART + S['src'])
    R = upscale(rgb)
    shp = R.shape[:2]
    FG = fg_mask_hi(R)
    INK = ink_mask(R, FG, **S.get('ink', {}))
    Sm = smooth(R)
    cen = merge_close(kmeans_palette(Sm, FG & ~INK, S.get('K', 30)), S.get('merge', 7.5))
    for c in S.get('extra_colours', []):
        cen = np.concatenate([cen, lab_of([c])])
    n = len(cen)
    L = assign(Sm, cen)
    L = mode_filter(L, FG & ~INK, n, r=2, iters=2)
    L = fill_labels(L, INK, FG)
    L = remove_small_regions(L, FG, n, S.get('min_region', 160))
    pal = rgb_of(cen)

    pal_hex = ['#%02x%02x%02x' % tuple(int(v) for v in c) for c in pal]

    def snap(c):
        return pal_hex[nearest_label(c)]

    def nearest_label(c):
        return int(((cen - lab_of([c])[0]) ** 2).sum(1).argmin())

    # ---- erasures (traced face features, topknot ring, reference hat, ...)
    for e in S.get('erase', []):
        m = polymask(e['poly'], shp)
        if e.get('pred'):
            m &= pred_mask(e['pred'], L, cen) if e['pred'] != 'notskin_soft' else (L != nearest_label('#efb58e'))
        mode = e.get('mode', 'near')
        if mode == 'bg':
            FG &= ~m
        elif mode == 'near':
            src = FG & ~m
            if 'within' in e:
                src &= polymask(e['within'], shp)
            L = _fill_from(L, m & FG, src)
        else:  # explicit colour
            L[m & FG] = nearest_label(mode)
        if e.get('pred') == 'notskin_soft':  # only small specks of ink (stubble, tattoo dots)
            mm = polymask(e['poly'], shp)
            nn, cc, st, _ = cv2.connectedComponentsWithStats((INK & mm).astype(np.uint8), connectivity=8)
            small = np.zeros(nn, bool)
            small[1:] = st[1:, cv2.CC_STAT_AREA] < 90
            INK &= ~small[cc]
        elif e.get('ink', True):
            INK &= ~(m if not e.get('pred') else cv2.dilate(m.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0)
    for p in S.get('paint', []):  # add shapes (e.g. hat removal fills the head top)
        m = polymask(p['poly'], shp)
        FG |= m
        L[m] = nearest_label(p['colour'])
        INK &= ~m
    L = soft_labels(L, FG, n, 1.6)
    INK &= FG

    ero = cv2.erode(Sm, np.ones((3, 3), np.uint8))
    ik = merge_close(kmeans_palette(ero, INK, 8), 9)

    parts = S['parts']
    names = sorted(parts, key=lambda k: parts[k]['z'])
    polys = {k: polymask(parts[k]['poly'], shp) for k in names}
    owned = {}
    for k in names:
        P = parts[k]
        m = polys[k] & FG
        for kp in P.get('keep', []):  # restrict a sub-area to pixels of some colour class
            sub = polymask(kp['poly'], shp) if kp.get('poly') else np.ones(shp, bool)
            ok = pred_mask(kp['pred'], L, cen)
            if not str(kp['pred']).startswith('not'):
                ok = cv2.dilate(ok.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
            m &= ~sub | ok
        owned[k] = m
    out_parts = {}
    for k in names:
        P = parts[k]
        z = P['z']
        region = owned[k]
        cover = np.zeros(shp, bool)
        for q in names:
            if q != k and parts[q]['z'] > z and k not in parts[q].get('no_cover', []):
                cover |= owned[q]
        visible = region & ~cover
        hidden = region & cover
        if P.get('region_extra'):
            ext = polymask(P['region_extra'], shp) & ~FG
            region = region | ext
            hidden = hidden | ext
        Lp = _fill_from(L, hidden, visible) if hidden.any() and visible.any() else L
        for pp in P.get('paint', []):
            mm = polymask(pp['poly'], shp) & ~(visible & owned[k])
            region = region | mm
            Lp = Lp.copy()
            Lp[mm] = nearest_label(pp['colour'])
        Lp = soft_labels(Lp, region, n, 1.2) if hidden.any() else Lp
        alpha = soft_mask(region, 0.8)
        rgba = np.dstack([pal[Lp], (alpha * 255).astype(np.uint8)])
        fills = trace_layer(rgba, filter_speckle=S.get('speckle', 10), length_threshold=6, corner_threshold=70)
        fills = [[snap(c), d] for c, d in fills]
        inkm = INK & visible
        inks = centre_lines(inkm, ero, ik, min_len=S.get('ink_min_len', 9)) if inkm.any() else []
        # synthetic outline for silhouette edges that were covered at rest
        for he in P.get('hidden_edges', []):
            inks.append([P.get('edge_colour', '#2f4a3b'), P.get('edge_width', 1.1), _catmull_pts(he)])
        out_parts[k] = dict(z=z, parent=P.get('parent'), pivot=P.get('pivot'), fills=fills, inks=inks)
        if debug:
            cv2.imwrite(f'{debug}/{view}_{k}.png', cv2.cvtColor(rgba, cv2.COLOR_RGBA2BGRA))
        print(f'  {k}: {len(fills)} fills, {len(inks)} inks', flush=True)
    # palette compaction
    cols = {}
    def ci(c):
        if c not in cols:
            cols[c] = len(cols)
        return cols[c]
    for k, v in out_parts.items():
        v['fills'] = [[ci(c), d] for c, d in v['fills']]
        v['inks'] = [[ci(c), w, d] for c, w, d in v['inks']]
    meta = {kk: S[kk] for kk in ('chin', 'sole', 'origin_x', 'far') if kk in S}
    if S.get('arm_clip'):
        ac = S['arm_clip']
        cm = np.zeros(shp, bool)
        for pl in ac['polys']:
            cm |= polymask(pl, shp)
        cm &= owned[ac['part']]
        cm = soft_mask(cm, 1.0)
        rgba = np.dstack([np.zeros(shp + (3,), np.uint8), (cm * 255).astype(np.uint8)])
        rgba[..., :3] = 255
        meta['arm_clip'] = [d for c, d in trace_layer(rgba, filter_speckle=20, length_threshold=6)]
    meta['face'] = S.get('face', {})
    meta['view'] = view
    meta['src_size'] = [rgb.shape[1], rgb.shape[0]]
    data = dict(meta=meta, palette=list(cols.keys()), parts=out_parts)
    os.makedirs(OUT, exist_ok=True)
    fn = os.path.join(OUT, f'lc_{view}.json')
    s = json.dumps(data, separators=(',', ':'), ensure_ascii=False)
    open(fn, 'w').write(s)
    print(f'{view}: {sum(len(v["fills"]) + len(v["inks"]) for v in out_parts.values())} paths, {len(s) // 1024} KB, {time.time() - t0:.1f}s')


def _fill_from(L, hole, src):
    from scipy import ndimage
    if not src.any():
        return L
    _, (iy, ix) = ndimage.distance_transform_edt(~src, return_indices=True)
    out = L.copy()
    out[hole] = L[iy[hole], ix[hole]]
    return out


def _catmull_pts(pts):
    from tracelib import _catmull
    return _catmull([tuple(map(float, p)) for p in pts])


if __name__ == '__main__':
    v = sys.argv[1]
    dbg = None
    if '--debug' in sys.argv:
        dbg = sys.argv[sys.argv.index('--debug') + 1]
        os.makedirs(dbg, exist_ok=True)
    build(v, dbg)
