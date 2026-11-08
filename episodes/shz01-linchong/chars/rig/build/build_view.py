# python3 build_view.py <view> [--debug DIR]
# Trace one 林冲 reference into rig parts and write chars/rig/data/lc_<view>.json.
# References are read from /dev/shm/shz01/art (never committed); only the vector output is kept.
import sys, os, json, time, re
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
    elif pred == 'notred':
        ok = ~((ac > 146) & (Lc < 170))
    elif pred == 'hat':
        ok = (ac < 140) & (bc > 128) & (bc < 156) & (Lc > 105) & (Lc < 222)
    elif pred == 'collar':  # neither skin nor dark hair/cloth
        ok = ~((ac > 136) & (bc > 145) & (Lc > 120)) & (Lc >= 92)
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
    for hp in S.get('holes', []):  # enclosed background (e.g. between the legs)
        ref = np.median(np.concatenate([R[:8].reshape(-1, 3), R[-8:].reshape(-1, 3)]), axis=0)
        near_bg = (np.abs(R.astype(int) - ref[None, None]).max(axis=2) < 16).astype(np.uint8)
        near_bg = cv2.morphologyEx(near_bg, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
        near_bg = cv2.GaussianBlur(near_bg.astype(np.float32), (0, 0), 2.2) > 0.5
        # take the anti-aliased rim as well (pixels still close to the paper colour)
        lum_ref = float(ref.mean())
        rim = (np.abs(R.astype(int) - ref[None, None]).max(axis=2) < 30) & (R.astype(int).mean(axis=2) <= lum_ref + 2)
        grow = cv2.dilate(near_bg.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))).astype(bool) & rim
        near_bg = cv2.GaussianBlur((near_bg | grow).astype(np.float32), (0, 0), 1.4) > 0.5
        FG &= ~(polymask(hp, shp) & near_bg)
    FG = soft_mask(FG, 1.0)
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
            m &= pred_mask(e['pred'], L, cen) if e['pred'] != 'notskin_soft' else (L != nearest_label(S.get('skin', '#efb58e')))
        mode = e.get('mode', 'near')
        if mode == 'bg':
            FG &= ~m
        elif mode == 'near':
            src = FG & ~m
            if 'within' in e:
                src &= polymask(e['within'], shp)
            L = _fill_from(L, m & FG, src)
        else:  # explicit colour ('skin' = this view's skin tone)
            L[m & FG] = nearest_label(S.get('skin', '#efb58e') if mode == 'skin' else mode)
        if e.get('pred') == 'notskin_soft':  # only small specks of ink (stubble, tattoo dots)
            mm = polymask(e['poly'], shp)
            nn, cc, st, _ = cv2.connectedComponentsWithStats((INK & mm).astype(np.uint8), connectivity=8)
            small = np.zeros(nn, bool)
            small[1:] = st[1:, cv2.CC_STAT_AREA] < 90
            INK &= ~small[cc]
        elif e.get('ink_all'):
            INK &= ~polymask(e['poly'], shp)
        if e.get('ink_pred') == 'cord':  # thin red cord lines live in the ink layer: find them by colour
            labi = cv2.cvtColor(Sm, cv2.COLOR_RGB2LAB).astype(int)
            red = ((labi[..., 1] > 151) & (labi[..., 0] < 170)).astype(np.uint8)
            red = cv2.dilate(red, np.ones((5, 5), np.uint8)) > 0
            INK &= ~(polymask(e['poly'], shp) & red)
            Lr = red & polymask(e['poly'], shp) & FG
            if Lr.any():
                L = _fill_from(L, Lr, FG & ~Lr & polymask(e.get('within', e['poly']), shp))
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
    # no olive/yellow ink (anti-alias mixes of skin and hair): snap those to the skin outline brown
    for i, c in enumerate(rgb_of(ik)):
        hh = cv2.cvtColor(np.uint8([[c]]), cv2.COLOR_RGB2HSV)[0, 0]
        if 20 <= hh[0] <= 45 and hh[1] > 60:
            ik[i] = lab_of(['#8a5a44'])[0]

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
        if P.get('extend'):  # area to own and repaint (hidden behind a part that sits higher)
            ext = polymask(P['extend'], shp) & FG & ~region
            region = region | ext
            hidden = hidden | ext
        if P.get('region_extra'):
            ext = polymask(P['region_extra'], shp) & ~FG
            region = region | ext
            hidden = hidden | ext
        src = visible
        if hidden.sum() > max(4000, 0.02 * region.sum()) and not P.get('fill_any'):
            # large hidden areas are refilled from the part's own main colours only
            # (not from small coloured details such as a belt edge or a hand)
            labs, cnt = np.unique(L[visible], return_counts=True)
            top = labs[np.argsort(cnt)[::-1][:P.get('fill_top', 2)]]
            src = visible & np.isin(L, top)
        Lp = _fill_from(L, hidden, src) if hidden.any() and src.any() else L
        for pp in P.get('paint', []):
            mm = polymask(pp['poly'], shp) & ~(visible & owned[k])
            region = region | mm
            Lp = Lp.copy()
            Lp[mm] = nearest_label(pp['colour'])
        Lp = soft_labels(Lp, region, n, 1.2) if hidden.any() else Lp
        alpha = soft_mask(region, 0.8)
        rgba = np.dstack([pal[Lp], (alpha * 255).astype(np.uint8)])
        # enclosed transparent holes: vtracer's stacked shapes would paint over them, so they are
        # stored as contours and cut out with an even-odd clip at render time
        holes = []
        inv = (~alpha).astype(np.uint8)
        nh, hl, hs, _ = cv2.connectedComponentsWithStats(inv, connectivity=4)
        ys0, xs0 = np.nonzero(alpha)
        if len(ys0):
            for i in range(1, nh):
                x, y_, w_, h_, a_ = hs[i]
                if a_ < 60 or x == 0 or y_ == 0 or x + w_ >= shp[1] or y_ + h_ >= shp[0]:
                    continue
                if not (alpha[y_:y_ + h_, x:x + w_].any()):
                    continue
                # inside the part's bounding box and not connected to the outside
                hm = (hl == i).astype(np.uint8)
                cs, _ = cv2.findContours(hm, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
                for c in cs:
                    c = cv2.approxPolyDP(c, 1.2, True).reshape(-1, 2)
                    if len(c) >= 3:
                        holes.append(_catmull_pts([(x0 / UP, y0 / UP) for x0, y0 in c]) + 'Z')
        fills = trace_layer(rgba, filter_speckle=S.get('speckle', 10), length_threshold=6, corner_threshold=70)
        fills = [[snap(c), d] for c, d in fills]
        inkm = INK & visible
        inks = centre_lines(inkm, ero, ik, min_len=S.get('ink_min_len', 9)) if inkm.any() else []
        for rc in S.get('ink_recolour', []):  # soften strokes in an area (colour, max width)
            pl = np.array(rc['poly'], np.float32)
            for st in inks:
                x0, y0 = map(float, re.findall(r'-?\d+(?:\.\d+)?', st[2])[:2])
                if cv2.pointPolygonTest(pl, (x0, y0), False) >= 0:
                    st[0] = rc['colour']
                    st[1] = min(st[1], rc.get('maxw', 1.0))
        # synthetic outline for silhouette edges that were covered at rest
        for he in P.get('hidden_edges', []):
            inks.append([P.get('edge_colour', '#2f4a3b'), P.get('edge_width', 1.1), _catmull_pts(he)])
        out_parts[k] = dict(z=z, parent=P.get('parent'), pivot=P.get('pivot'), fills=fills, inks=inks)
        if holes:
            out_parts[k]['holes'] = holes
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
