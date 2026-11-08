# Shared helpers for turning a flat 2D reference painting into clean vector layers.
# Pipeline per image:  upscale x2 -> edge-preserving smooth -> split "ink" (thin dark lines)
# from "fills" -> quantise fills to a fixed palette (k-means, Lab) -> mode filter (kills
# speckles and anti-alias halos) -> vtracer per part (stacked, spline) -> path list.
import json, os, re, tempfile
import numpy as np, cv2
import vtracer

UP = 2  # work resolution factor; all traced coordinates are divided by UP again


def load(path):
    im = cv2.imread(path, cv2.IMREAD_COLOR)
    return cv2.cvtColor(im, cv2.COLOR_BGR2RGB)


def bg_mask(rgb, tol=14):
    """True where the flat paper background is (flood-filled from the border)."""
    h, w = rgb.shape[:2]
    ref = np.median(np.concatenate([rgb[:8].reshape(-1, 3), rgb[-8:].reshape(-1, 3)]), axis=0)
    d = np.abs(rgb.astype(int) - ref[None, None]).max(axis=2)
    cand = (d < tol).astype(np.uint8)
    n, lab = cv2.connectedComponents(cand, connectivity=4)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])))
    border.discard(0)
    m = np.isin(lab, list(border))
    return m


def upscale(rgb, k=UP):
    return cv2.resize(rgb, None, fx=k, fy=k, interpolation=cv2.INTER_CUBIC)


def smooth(rgb):
    out = rgb
    for _ in range(2):
        out = cv2.bilateralFilter(out, 7, 18, 5)
    return out


def ink_mask(rgb, fg, k=9, thr=9, rel=0.10, maxlum=170, min_area=40):
    """Thin dark strokes: black-hat on luminance (closing - image), relative to the local tone."""
    lum = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    lum = cv2.GaussianBlur(lum, (3, 3), 0.7)
    ker = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))
    clo = cv2.morphologyEx(lum, cv2.MORPH_CLOSE, ker).astype(np.int16)
    bh = clo - lum.astype(np.int16)
    m = (bh > np.maximum(thr, rel * clo)) & (lum < maxlum) & fg
    soft = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 0.9)
    m = soft > 0.45
    n, lab, st, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8), connectivity=8)
    keep = np.zeros(n, bool)
    keep[1:] = st[1:, cv2.CC_STAT_AREA] >= min_area
    return keep[lab]


def soft_labels(lab, valid, n_labels, sigma=1.4):
    """Smooth region boundaries: blur each label's mask, take the argmax (no jaggies at 2x)."""
    best = np.full(lab.shape, -1.0, np.float32)
    out = lab.copy()
    for i in range(n_labels):
        m = ((lab == i) & valid).astype(np.float32)
        if not m.any():
            continue
        b = cv2.GaussianBlur(m, (0, 0), sigma)
        u = b > best
        best[u] = b[u]
        out[u] = i
    return np.where(valid, out, lab)


def soft_mask(m, sigma=1.2):
    return cv2.GaussianBlur(m.astype(np.float32), (0, 0), sigma) > 0.5


def fg_mask_hi(rgb_hi, tol=14):
    """Foreground at work resolution with a smooth silhouette."""
    m = ~bg_mask(rgb_hi, tol)
    m = cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)) > 0
    return soft_mask(m, 1.3)


def merge_close(cen, de=5.0):
    """Merge palette entries closer than de (Lab units, OpenCV 8-bit Lab scale)."""
    cen = [c for c in cen]
    changed = True
    while changed:
        changed = False
        for i in range(len(cen)):
            for j in range(i + 1, len(cen)):
                if np.sqrt(((cen[i] - cen[j]) ** 2).sum()) < de:
                    cen[i] = (cen[i] + cen[j]) / 2
                    cen.pop(j)
                    changed = True
                    break
            if changed:
                break
    return np.array(cen, np.float32)


def kmeans_palette(rgb, mask, K, seed=1, extra=None):
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB).reshape(-1, 3).astype(np.float32)
    pts = lab[mask.reshape(-1)]
    if len(pts) > 250000:
        rs = np.random.RandomState(seed)
        pts = pts[rs.choice(len(pts), 250000, replace=False)]
    crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 60, 0.2)
    cv2.setRNGSeed(seed)
    _, _, cen = cv2.kmeans(pts, K, None, crit, 4, cv2.KMEANS_PP_CENTERS)
    if extra is not None:
        cen = np.concatenate([cen, extra.astype(np.float32)])
    return cen


def lab_of(rgb_list):
    a = np.array(rgb_list, np.uint8).reshape(-1, 1, 3)
    return cv2.cvtColor(a, cv2.COLOR_RGB2LAB).reshape(-1, 3).astype(np.float32)


def rgb_of(labc):
    a = np.clip(labc, 0, 255).astype(np.uint8).reshape(-1, 1, 3)
    return cv2.cvtColor(a, cv2.COLOR_LAB2RGB).reshape(-1, 3)


def assign(rgb, cen):
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB).reshape(-1, 3).astype(np.float32)
    best = np.zeros(len(lab), np.int32)
    bd = np.full(len(lab), 1e12, np.float32)
    for i, c in enumerate(cen):
        d = ((lab - c) ** 2).sum(1)
        u = d < bd
        bd[u] = d[u]
        best[u] = i
    return best.reshape(rgb.shape[:2])


def mode_filter(lab, valid, n_labels, r=2, iters=2):
    """Majority vote in a (2r+1)^2 window, restricted to valid pixels."""
    out = lab.copy()
    for _ in range(iters):
        votes = np.zeros((n_labels,) + lab.shape, np.float32)
        for i in range(n_labels):
            m = ((out == i) & valid).astype(np.float32)
            votes[i] = cv2.boxFilter(m, -1, (2 * r + 1, 2 * r + 1), normalize=False)
        out = np.where(valid, votes.argmax(0), out)
    return out


def fill_labels(lab, hole, valid):
    """Fill `hole` pixels with the nearest non-hole label (inside `valid`)."""
    from scipy import ndimage
    src = valid & ~hole
    if not src.any():
        return lab
    _, (iy, ix) = ndimage.distance_transform_edt(~src, return_indices=True)
    out = lab.copy()
    hv = hole & valid
    out[hv] = lab[iy[hv], ix[hv]]
    return out


def remove_small_regions(lab, valid, n_labels, min_area):
    """Merge connected regions smaller than min_area into their surroundings."""
    out = lab.copy()
    for i in range(n_labels):
        m = ((out == i) & valid).astype(np.uint8)
        n, cc, st, _ = cv2.connectedComponentsWithStats(m, connectivity=4)
        small = np.zeros(n, bool)
        small[1:] = st[1:, cv2.CC_STAT_AREA] < min_area
        hole = small[cc]
        if hole.any():
            out = fill_labels(out, hole, valid)
    return out


_num = re.compile(r'-?\d+(?:\.\d+)?')


def _fmt(v):
    s = f'{v:.1f}'
    if s.endswith('.0'):
        s = s[:-2]
    if s == '-0':
        s = '0'
    return s


def transform_d(d, dx, dy, k):
    """Apply translate(dx,dy) then scale k to an absolute-command path string (vtracer emits M/C/L/Z abs)."""
    out = []
    toks = re.findall(r'[MLCZmlcz]|-?\d+(?:\.\d+)?', d)
    i = 0
    xy = 0
    for t in toks:
        if t.isalpha():
            out.append(t.upper())
            xy = 0
        else:
            v = float(t)
            v = (v + (dx if xy % 2 == 0 else dy)) * k
            out.append(_fmt(v))
            xy += 1
    s = ''
    for t in out:
        if t.isalpha():
            s += t
        else:
            if s and (s[-1].isdigit()):
                s += ' ' if not t.startswith('-') else ''
            s += t
    return s


def vtrace_rgba(rgba, **kw):
    """Trace an RGBA uint8 image; returns [(hex, d)] in input pixel coords."""
    fd, src = tempfile.mkstemp(suffix='.png')
    os.close(fd)
    out = src.replace('.png', '.svg')
    cv2.imwrite(src, cv2.cvtColor(rgba, cv2.COLOR_RGBA2BGRA))
    opts = dict(colormode='color', hierarchical='stacked', mode='spline', filter_speckle=4,
                color_precision=8, layer_difference=1, corner_threshold=60, length_threshold=4.0,
                max_iterations=10, splice_threshold=45, path_precision=2)
    opts.update(kw)
    vtracer.convert_image_to_svg_py(src, out, **opts)
    svg = open(out).read()
    os.remove(src)
    os.remove(out)
    paths = []
    for m in re.finditer(r'<path d="([^"]+)" fill="(#[0-9A-Fa-f]{6})"(?: transform="translate\(([-\d.]+),([-\d.]+)\)")?', svg):
        d, fill = m.group(1), m.group(2).lower()
        dx = float(m.group(3) or 0)
        dy = float(m.group(4) or 0)
        paths.append((fill, d, dx, dy))
    return paths


def trace_layer(rgba, k=1.0 / UP, **kw):
    res = []
    for fill, d, dx, dy in vtrace_rgba(rgba, **kw):
        res.append([fill, transform_d(d, dx, dy, k)])
    return res


# ------------------------------------------------------------------ centre-line ink
_NB = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]


def skeleton_chains(mask):
    """Skeletonise a thin-line mask and walk it into pixel chains [(y,x),...]."""
    from skimage.morphology import skeletonize
    sk = skeletonize(mask > 0)
    H, W = sk.shape
    pad = np.pad(sk, 1)
    cnt = sum(np.roll(np.roll(pad, -dy, 0), -dx, 1) for dy, dx in _NB)[1:-1, 1:-1] * sk
    ys, xs = np.nonzero(sk)
    on = set(zip(ys.tolist(), xs.tolist()))
    deg = {p: int(cnt[p]) for p in on}
    nodes = [p for p in on if deg[p] != 2]
    used = set()
    chains = []

    def nbrs(p):
        y, x = p
        for dy, dx in _NB:
            q = (y + dy, x + dx)
            if q in on:
                yield q

    def walk(a, b):
        ch = [a, b]
        used.add((a, b)); used.add((b, a))
        prev, cur = a, b
        while deg[cur] == 2:
            nxt = None
            for q in nbrs(cur):
                if q != prev and (cur, q) not in used:
                    nxt = q
                    break
            if nxt is None:
                break
            used.add((cur, nxt)); used.add((nxt, cur))
            ch.append(nxt)
            prev, cur = cur, nxt
        return ch

    for n in nodes:
        for q in nbrs(n):
            if (n, q) not in used:
                chains.append(walk(n, q))
    # pure loops
    for p in on:
        if deg[p] == 2:
            for q in nbrs(p):
                if (p, q) not in used:
                    chains.append(walk(p, q))
    return chains


def _catmull(pts, closed=False):
    """Catmull-Rom through pts -> cubic Bezier path string (absolute)."""
    n = len(pts)
    if n == 1:
        x, y = pts[0]
        return f'M{_fmt(x)} {_fmt(y)}h0.1'
    if n == 2:
        return f'M{_fmt(pts[0][0])} {_fmt(pts[0][1])}L{_fmt(pts[1][0])} {_fmt(pts[1][1])}'
    P = [pts[0]] + list(pts) + [pts[-1]]
    s = f'M{_fmt(pts[0][0])} {_fmt(pts[0][1])}'
    for i in range(1, n):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        s += 'C' + ' '.join(_fmt(v) for v in (*c1, *c2, *p2))
    return s


def centre_lines(mask, colour_img, ink_pal_lab, k=1.0 / UP, min_len=7, eps=0.9, wscale=1.0):
    """Ink mask -> list of [hex, width, d] strokes (coords scaled by k)."""
    dist = cv2.distanceTransform((mask > 0).astype(np.uint8), cv2.DIST_L2, 3)
    lab = cv2.cvtColor(colour_img, cv2.COLOR_RGB2LAB).astype(np.float32)
    pal_rgb = rgb_of(ink_pal_lab)
    out = []
    for ch in skeleton_chains(mask):
        if len(ch) < min_len:
            continue
        a = np.array(ch, np.float32)
        # light smoothing (keep the ends)
        if len(a) >= 5:
            sm = a.copy()
            for _ in range(2):
                sm[1:-1] = (sm[:-2] + 2 * sm[1:-1] + sm[2:]) / 4
            a = sm
        xy = a[:, ::-1].reshape(-1, 1, 2)
        ap = cv2.approxPolyDP(xy, eps, False).reshape(-1, 2)
        iy = np.clip(np.array([p[0] for p in ch]), 0, mask.shape[0] - 1)
        ix = np.clip(np.array([p[1] for p in ch]), 0, mask.shape[1] - 1)
        w = float(np.median(dist[iy, ix])) * 2 * wscale
        c = np.median(lab[iy, ix], axis=0)
        ci = int(((ink_pal_lab - c) ** 2).sum(1).argmin())
        col = '#%02x%02x%02x' % tuple(int(v) for v in pal_rgb[ci])
        pts = [(float(x) * k, float(y) * k) for x, y in ap]
        out.append([col, round(max(w, 1.6) * k, 2), _catmull(pts)])
    return out
