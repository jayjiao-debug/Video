"""Redraw each hidden-3D ID pass as a flat 2D drawing (film style).
ids/d_XXX.png (2x, part colours) + ids/meta.json -> svg/d_XXX.svg (hand + sleeve, 1920x1080 user space) and svg/print.svg.
Style: flat skin #efb58e, one hard cel shadow #d29a76 (graphic offset shapes, not 3D shading), brown line #2A1C17 with
weight variation (heavier on the underside, away from the light), thin tapered inner lines that stop short."""
import cv2, json, sys, os
import numpy as np

SKIN, SHADE, LINE = '#efb58e', '#d29a76', '#2A1C17'
SLV, SLVS = '#3B4356', '#2E3446'
PAL = {1: (255, 0, 0), 2: (0, 255, 0), 3: (0, 0, 255), 4: (255, 255, 0), 5: (255, 0, 255), 6: (0, 255, 255), 7: (64, 191, 64)}  # sleeve colour no 50/50 blend of two part colours can produce
FING = [3, 4, 5, 6]
SC = 2.0  # id passes are rendered at 2x


def f(v):
    return f'{v:.1f}'


def labels(img):
    a = img[..., 3]
    ys, xs = np.where(a > 100)
    if len(xs) == 0:
        return None, (0, 0)
    m = 24
    x0, x1, y0, y1 = max(0, xs.min() - m), min(img.shape[1], xs.max() + m), max(0, ys.min() - m), min(img.shape[0], ys.max() + m)
    c = img[y0:y1, x0:x1].astype(np.int32)
    cols = np.array([PAL[k] for k in sorted(PAL)], np.int32)
    d = ((c[..., None, :3] - cols[None, None]) ** 2).sum(-1)
    L = (np.argmin(d, -1) + 1).astype(np.uint8)
    # anti-aliased blends between two part colours must not become a third label (e.g. red+blue -> grey 'sleeve'):
    # only confident pixels keep their label, the rest take the nearest confident label
    conf = d.min(-1) < 40 ** 2
    alpha = c[..., 3] >= 128
    good = conf & alpha
    if (alpha & ~good).any():
        _, idx = cv2.distanceTransformWithLabels((~good).astype(np.uint8), cv2.DIST_L2, 5, labelType=cv2.DIST_LABEL_PIXEL)
        ys, xs = np.where(good)
        lab = L[ys, xs]
        fix = alpha & ~good
        L[fix] = lab[idx[fix] - 1]
    L[~alpha] = 0
    return L, (x0, y0)


def smooth_mask(m, close=7, open_=5, blur=3.0):
    m = m.astype(np.uint8) * 255
    if close:
        m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (close * 2 + 1, close * 2 + 1)))
    if open_:
        m = cv2.morphologyEx(m, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (open_ * 2 + 1, open_ * 2 + 1)))
    if blur:
        m = cv2.GaussianBlur(m, (0, 0), blur)
    return m > 127


def resample(pts, step=3.0, closed=True):
    p = pts.astype(np.float64)
    if closed:
        p = np.vstack([p, p[:1]])
    seg = np.sqrt(((p[1:] - p[:-1]) ** 2).sum(1))
    s = np.concatenate([[0], np.cumsum(seg)])
    if s[-1] < step * 3:
        return pts.astype(np.float64)
    n = int(s[-1] / step)
    ss = np.linspace(0, s[-1], n, endpoint=not closed)
    return np.stack([np.interp(ss, s, p[:, 0]), np.interp(ss, s, p[:, 1])], 1)


def gsmooth(p, sigma=2.0, closed=True):
    k = int(sigma * 3)
    if len(p) < 2 * k + 3:
        return p
    w = np.exp(-np.arange(-k, k + 1) ** 2 / (2 * sigma ** 2)); w /= w.sum()
    if closed:
        q = np.vstack([p[-k:], p, p[:k]])
        return np.stack([np.convolve(q[:, i], w, 'valid') for i in range(2)], 1)
    q = np.vstack([np.repeat(p[:1], k, 0), p, np.repeat(p[-1:], k, 0)])
    return np.stack([np.convolve(q[:, i], w, 'valid') for i in range(2)], 1)


def normals(p, closed=True):
    if closed:
        t = np.roll(p, -1, 0) - np.roll(p, 1, 0)
    else:
        t = np.gradient(p, axis=0)
    t /= np.linalg.norm(t, axis=1, keepdims=True) + 1e-9
    return np.stack([t[:, 1], -t[:, 0]], 1)


def area(p):
    return 0.5 * np.sum(p[:, 0] * np.roll(p[:, 1], -1) - np.roll(p[:, 0], -1) * p[:, 1])


def path(p, closed=True):
    s = 'M' + ' L'.join(f'{f(x)},{f(y)}' for x, y in p)
    return s + ('Z' if closed else '')


def contours(m, mode=cv2.RETR_EXTERNAL, min_area=60):
    cs, hier = cv2.findContours(m.astype(np.uint8), mode, cv2.CHAIN_APPROX_NONE)
    out = []
    for c in cs:
        if cv2.contourArea(c) >= min_area:
            out.append(c[:, 0, :].astype(np.float64))
    return out


def to_screen(p, off):
    return (p + np.array(off)) / SC


def var_line_closed(p, w0, light_away=(0.7071, 0.7071), wmin=0.6, wmax=1.4):
    """Closed variable-width ink ring around contour p (screen px): heavier where the outward normal faces away from the light."""
    if len(p) < 12:
        return ''
    if area(p) < 0:
        p = p[::-1]
    n = normals(p)   # with positive (y-down screen) area orientation, (ty, -tx) points outward
    d = n @ np.array(light_away)
    w = w0 * (wmin + (wmax - wmin) * np.clip(d * 0.5 + 0.5, 0, 1) ** 1.5)
    # turning (positive = convex for this orientation); concave crotches get a thinner line
    t1 = p - np.roll(p, 3, 0); t2 = np.roll(p, -3, 0) - p
    cr = (t1[:, 0] * t2[:, 1] - t1[:, 1] * t2[:, 0]) / (np.linalg.norm(t1, axis=1) * np.linalg.norm(t2, axis=1) + 1e-9)
    w = w * np.where(cr < -0.25, 0.45, 1.0)
    w = gsmooth(np.stack([w, w], 1), 4)[:, 0]
    a, b = p + n * (w[:, None] * 0.5), p - n * (w[:, None] * 0.5)
    return f'<path d="{path(a)} {path(b[::-1])}" fill="{LINE}" fill-rule="evenodd"/>'


def taper_line(p, w0):
    if len(p) < 3:
        return ''
    n = normals(p, closed=False)
    s = np.linspace(0, 1, len(p))
    w = w0 * (0.18 + 0.82 * np.sin(np.pi * s) ** 0.7)
    a, b = p + n * (w[:, None] * 0.5), p - n * (w[:, None] * 0.5)
    return f'<path d="{path(np.vstack([a, b[::-1]]))}" fill="{LINE}"/>'


def draw(L, off, meta):
    hand = np.isin(L, [1, 2, 3, 4, 5, 6])
    sleeve = L == 7
    if hand.sum() < 500:
        return ''
    H = smooth_mask(hand, 8, 6, 3.2)
    S = smooth_mask(sleeve, 5, 3, 2.0) if sleeve.sum() > 200 else np.zeros_like(H)
    if S.any():   # the sleeve is one piece: keep its big component(s)
        n_, lab_, st_, _ = cv2.connectedComponentsWithStats(S.astype(np.uint8))
        if n_ > 2:
            big_ = st_[1:, cv2.CC_STAT_AREA].max()
            S = np.isin(lab_, [i for i in range(1, n_) if st_[i, cv2.CC_STAT_AREA] > 0.2 * big_])
    size = np.sqrt(H.sum())
    W_OUT = max(3.4, size / SC * 0.018)          # outer line (screen px)
    W_IN = min(2.6, W_OUT * 0.42)
    # smoothed part labels inside the silhouette (nearest label for pixels the smoothing added)
    Ls = np.zeros_like(L)
    for k in [1, 2, 3, 4, 5, 6]:
        mk = smooth_mask(L == k, 7, 6, 4.0) & H
        Ls[mk] = k
    holes = H & (Ls == 0)
    if holes.any():
        src = (Ls > 0).astype(np.uint8)
        _, idx = cv2.distanceTransformWithLabels(1 - src, cv2.DIST_L2, 5, labelType=cv2.DIST_LABEL_PIXEL)
        ys, xs = np.where(src)
        lab = Ls[ys, xs]
        Ls[holes] = lab[idx[holes] - 1]
    allow_palm = meta['curlMCP'] > 70 and not meta['palmDown']   # fist: fingers fold over the palm
    allow_thumb = meta['thumbOpp'] < -40
    svg = []
    # --- sleeve (behind the hand)
    if S.any():
        for c in contours(S):
            svg.append(f'<path d="{path(to_screen(gsmooth(resample(c, 4), 2), off))}" fill="{SLV}"/>')
    # --- hand fill
    cs = contours(H, min_area=400)
    big = max((cv2.contourArea(c.astype(np.float32)) for c in cs), default=0)
    cs = [c for c in cs if cv2.contourArea(c.astype(np.float32)) > 0.08 * big]   # drop slivers (they become ink blobs)
    keepH = np.zeros(H.shape, np.uint8); cv2.drawContours(keepH, [c.astype(np.int32)[:, None, :] for c in cs], -1, 1, -1)
    H = H & keepH.astype(bool)
    hc = [gsmooth(resample(c, 3.0), 2.2) for c in cs]
    for c in hc:
        svg.append(f'<path d="{path(to_screen(c, off))}" fill="{SKIN}"/>')
    # --- graphic cel shadow: band along the edges away from the light + strips cast by overlapping parts
    d = max(8, int(size * 0.11))
    Hs = np.zeros_like(H); Hs[:-d, :-d] = H[d:, d:]
    sh = H & ~Hs
    dp = max(5, int(size * 0.05))
    for k in [2, 3, 4, 5, 6]:
        mk = Ls == k
        if mk.sum() < 200: continue
        nb = np.zeros_like(Ls); nb[:-dp, :-dp] = Ls[dp:, dp:]
        sh |= mk & (nb != k) & (nb != 1)      # a finger's own side band, not a dirty band where it meets the palm
    d2 = max(4, int(size * 0.05))
    up = np.zeros_like(Ls); up[d2:, d2:] = Ls[:-d2, :-d2]
    occ = (Ls > 0) & (up > 0) & (up != Ls)
    if not allow_palm:
        occ &= ~(((Ls == 1) & np.isin(up, FING)) | (np.isin(Ls, FING) & (up == 1)))
    if not allow_thumb:
        occ &= ~(((Ls == 2) & (up == 1)) | ((Ls == 1) & (up == 2)))
    if allow_palm:
        sh = sh | occ
    sh = smooth_mask(sh, 8, 9, 4.0) & cv2.erode(H.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
    for c in contours(sh, min_area=300):
        svg.append(f'<path d="{path(to_screen(gsmooth(resample(c, 3.0), 2.0), off))}" fill="{SHADE}"/>')
    if S.any():
        Ss = np.zeros_like(S); Ss[:-d, :-d] = S[d:, d:]
        ssh = smooth_mask(S & ~Ss, 4, 4, 2.5)
        for c in contours(ssh, min_area=200):
            svg.append(f'<path d="{path(to_screen(gsmooth(resample(c, 3.0), 2.0), off))}" fill="{SLVS}"/>')
    # --- inner lines: boundaries between parts, only where a part overlaps another; thin, tapered, stopping short
    DT = cv2.distanceTransform(H.astype(np.uint8), cv2.DIST_L2, 5)
    drawn = np.zeros(H.shape, np.uint8)
    inner = []
    for k in [3, 4, 5, 6, 2]:
        mk = Ls == k
        if k == 2 and mk.sum() < 0.07 * H.sum():
            continue   # thumb seen end-on: no ring drawn inside the palm
        for c in contours(mk, min_area=300):
            p = gsmooth(resample(c, 4.0), 3.0)
            n = normals(p) * (1 if area(p) > 0 else -1)
            keep = []
            for (x, y), nn in zip(p, n):
                xi, yi = int(round(x)), int(round(y))
                if not (0 <= yi < H.shape[0] and 0 <= xi < H.shape[1]) or DT[yi, xi] < 7:
                    keep.append(False); continue
                qx, qy = int(round(x + nn[0] * 6)), int(round(y + nn[1] * 6))
                other = Ls[min(max(qy, 0), H.shape[0] - 1), min(max(qx, 0), H.shape[1] - 1)]
                ok = other not in (0, k)
                if other == 1 and k in FING and not allow_palm: ok = False
                if (other == 1 and k == 2) and not allow_thumb: ok = False
                if drawn[yi, xi]: ok = False
                keep.append(ok)
            keep = np.array(keep)
            if not keep.any():
                continue
            # runs (cyclic)
            idx = np.where(keep)[0]
            runs, cur = [], [idx[0]]
            for a, b in zip(idx[:-1], idx[1:]):
                if b == a + 1: cur.append(b)
                else: runs.append(cur); cur = [b]
            runs.append(cur)
            if len(runs) > 1 and runs[0][0] == 0 and runs[-1][-1] == len(p) - 1:
                runs[0] = runs[-1] + runs[0]; runs.pop()
            for r in runs:
                q = p[r]
                if len(q) < 16:
                    continue
                cut = max(3, int(len(q) * 0.14))
                q = q[cut:-cut]
                if len(q) < 9:
                    continue
                cv2.polylines(drawn, [q.astype(np.int32)], False, 1, 16)
                inner.append(taper_line(to_screen(gsmooth(q, 3.0, closed=False), off), W_IN))
    # --- knuckle / palm creases from the guide's joints (one or two, graphic)
    pts = meta.get('pts', {})
    if pts and meta['curlMCP'] > 50 and not meta['palmDown']:
        for fn in ('index', 'middle'):
            a, b = np.array(pts[f'{fn}-finger-phalanx-intermediate']), np.array(pts[f'{fn}-finger-phalanx-proximal'])
            v = a - b; ln = np.linalg.norm(v) + 1e-9; v /= ln; nrm = np.array([-v[1], v[0]])
            c0 = a - v * ln * 0.12
            q = np.array([c0 - nrm * ln * 0.22, c0 + v * ln * 0.04, c0 + nrm * ln * 0.22])
            inner.append(taper_line(resample(q, 2, closed=False), W_IN * 0.8))
    svg += inner
    # --- outer lines (variable weight)
    for c in hc:
        svg.append(var_line_closed(to_screen(c, off), W_OUT))
    if S.any():
        for c in contours(S):
            svg.append(var_line_closed(to_screen(gsmooth(resample(c, 4), 2), off), W_OUT * 0.9))
    return '\n'.join(svg), H, off


def print_svg(H, off, meta):
    """Red palm print from the same 2D silhouette at the contact drawing (thumb + fingers + palm, as pressed)."""
    Hm = cv2.erode(H.astype(np.uint8), np.ones((7, 7), np.uint8)).astype(bool)
    pts0 = meta['pts']
    w = (np.array(pts0['wrist']) * SC - np.array(off)); mp = (np.array(pts0['middle-finger-phalanx-proximal']) * SC - np.array(off))
    v = mp - w; ln = np.linalg.norm(v); v /= ln
    yy, xx = np.mgrid[0:Hm.shape[0], 0:Hm.shape[1]]
    rel = (xx - w[0]) * v[0] + (yy - w[1]) * v[1]
    # keep the palm side of a line just above the wrist, with a rounded heel (ellipse)
    c0 = w + v * ln * 0.42
    nx, ny = -v[1], v[0]
    u = (xx - c0[0]) * nx + (yy - c0[1]) * ny; vv = (xx - c0[0]) * v[0] + (yy - c0[1]) * v[1]
    heel = (u / (ln * 0.55)) ** 2 + (vv / (ln * 0.42)) ** 2 <= 1
    Hm = Hm & ((rel > ln * 0.42) | heel)
    Hm = smooth_mask(Hm, 6, 4, 3.0)
    out = ['<filter id="prRough" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter>']
    g = []
    for c in contours(Hm, min_area=400):
        g.append(f'<path d="{path(to_screen(gsmooth(resample(c, 3.0), 2.4), off))}" fill="#B3302A"/>')
    # joint gaps and palm lines (paper colour) from the guide's joints
    pts = meta['pts']
    for fn in ('index', 'middle', 'ring', 'pinky'):
        for j in ('intermediate', 'distal'):
            a = np.array(pts[f'{fn}-finger-phalanx-{j}']); b = np.array(pts[f'{fn}-finger-phalanx-proximal' if j == 'intermediate' else f'{fn}-finger-phalanx-intermediate'])
            v = a - b; v /= np.linalg.norm(v) + 1e-9; nrm = np.array([-v[1], v[0]])
            hw = 9 if j == 'intermediate' else 7
            g.append(f'<path d="M{f(a[0] - nrm[0] * hw)},{f(a[1] - nrm[1] * hw)} L{f(a[0] + nrm[0] * hw)},{f(a[1] + nrm[1] * hw)}" stroke="#F1E4C6" stroke-width="2.6" stroke-linecap="round" opacity="0.85"/>')
    w = np.array(pts['wrist']); im = np.array(pts['index-finger-phalanx-proximal']); pm = np.array(pts['pinky-finger-phalanx-proximal'])
    for k, bend in ((0.78, 18), (0.6, 24)):
        a = w + (im - w) * k; b = w + (pm - w) * (k + 0.05)
        mid = (a + b) / 2 + np.array([0, bend])
        g.append(f'<path d="M{f(a[0])},{f(a[1])} Q{f(mid[0])},{f(mid[1])} {f(b[0])},{f(b[1])}" stroke="#F1E4C6" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.75"/>')
    a = w + (im - w) * 0.75; b = w + np.array([-0.15, -0.05]) * 0 + (w - im) * -0.18
    g.append(f'<path d="M{f(a[0])},{f(a[1])} Q{f(a[0] + 24)},{f((a[1] + b[1]) / 2)} {f(b[0] + 10)},{f(b[1])}" stroke="#F1E4C6" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.7"/>')
    # skin texture: faint broken lines
    rng = np.random.default_rng(3)
    ys, xs = np.where(Hm)
    for _ in range(24):
        i = rng.integers(0, len(xs)); x, y = (xs[i] + off[0]) / SC, (ys[i] + off[1]) / SC
        g.append(f'<path d="M{f(x - 10)},{f(y)} q10,{f(rng.uniform(-3, 3))} 20,0" stroke="#F1E4C6" stroke-width="1.2" fill="none" opacity="0.4"/>')
    out.append(f'<g filter="url(#prRough)" opacity="0.94">{"".join(g)}</g>')
    return ''.join(out)


def main():
    meta = json.load(open('ids/meta.json'))
    os.makedirs('svg', exist_ok=True)
    contact = int(round(3.6 * 15))
    for dmeta in meta['drawings']:
        i = dmeta['i']
        img = cv2.cvtColor(cv2.imread(f'ids/d_{i:03d}.png', cv2.IMREAD_UNCHANGED), cv2.COLOR_BGRA2RGBA)
        L, off = labels(img)
        if L is None:
            open(f'svg/d_{i:03d}.svg', 'w').write(''); continue
        m = dict(dmeta['meta']); m['pts'] = {k: [v[0] * SC - off[0], v[1] * SC - off[1]] for k, v in dmeta['pts'].items()}
        # creases need crop coords -> convert back inside draw via to_screen; pass screen pts separately
        res = draw(L, off, {**m, 'pts': {k: (np.array(v) + np.array(off)) / SC for k, v in m['pts'].items()}} if False else {**m, 'pts': {k: v for k, v in dmeta['pts'].items()}})
        if not res:
            open(f'svg/d_{i:03d}.svg', 'w').write(''); continue
        s, H, off2 = res
        open(f'svg/d_{i:03d}.svg', 'w').write(s)
        if i == contact:
            open('svg/print.svg', 'w').write(print_svg(H, off2, {**m, 'pts': dmeta['pts']}))
    print('vectorised', len(meta['drawings']))


if __name__ == '__main__':
    main()
