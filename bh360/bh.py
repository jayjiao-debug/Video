#!/usr/bin/env python3
"""《掉进黑洞》 — a physically based 360° (equirectangular) Schwarzschild black-hole renderer, all in code.

Units G = c = M = 1: horizon r = 2, photon sphere r = 3, innermost stable orbit r = 6.
For every pixel of the equirect frame we take the viewing direction in the observer's frame, undo the observer's
motion (relativistic aberration, for a free-falling camera), turn it into the static frame's impact parameter b, and
look up the photon's orbit u(φ) = 1/r(φ) from a table integrated once (d²u/dφ² = 3u² − u). The orbit tells us
  - whether the ray falls in (black), escapes (sample the star sky in its asymptotic direction: lensing, Einstein
    ring and the secondary images come out of this by themselves), or
  - first crosses a thin Keplerian disk (6 ≤ r ≤ r_out): blackbody colour shifted by the redshift factor g
    (gravitational + Doppler: the approaching side is bright and blue, the receding side dim and red), I ∝ g⁴.
Front of the frame (centre, yaw 0) looks at the black hole.

    python3 scripts/bh.py out/frame.jpg --r 30 [--fall] [--w 3840] [--tilt 8]
"""
import argparse, math, numpy as np
np.seterr(over='ignore', invalid='ignore')
from PIL import Image

xp = np  # array backend for the heavy parts: numpy, or cupy after use_gpu()
def _gauss(a, s):
    from scipy.ndimage import gaussian_filter
    return gaussian_filter(a, s)
def use_gpu():
    global xp, _gauss
    import cupy, cupyx.scipy.ndimage as cnd
    xp = cupy; _gauss = cnd.gaussian_filter
def to_np(a):
    return a.get() if hasattr(a, 'get') else a

# ---------------------------------------------------------------- orbit table
def orbit_table(r0, nb=7000, dphi=0.003, phimax=4 * math.pi, X=None):
    """u(φ) for photons leaving radius r0, inward (k=0) and outward (k=1) starting branches, for impact parameters b."""
    X = X if X is not None else xp
    bc = 3 * math.sqrt(3)
    bmax = r0 / math.sqrt(1 - 2 / r0) * 1.0001
    # dense around the critical b (the photon ring), log-spaced elsewhere
    t = X.linspace(-1, 1, nb)
    b = X.unique(X.concatenate([bc + (bmax - bc) * X.clip(t, 0, 1) ** 4, bc - bc * X.clip(-t, 0, 1) ** 4]))
    b = b[(b > 1e-4) & (b <= bmax)]
    ns = int(phimax / dphi)
    tabs = []
    u0 = 1 / r0
    for sgn in (+1, -1):  # +1: moving inward (u grows), −1: outward
        U = X.full((len(b), ns), X.nan, X.float32)
        u = X.full(len(b), u0); w = sgn * X.sqrt(X.maximum(1 / b ** 2 - u0 ** 2 * (1 - 2 * u0), 0))
        alive = X.ones(len(b), bool); end = X.full(len(b), X.nan); fate = X.zeros(len(b), X.int8)  # 1 = captured, 2 = escaped
        f = lambda u: 3 * u * u - u
        for i in range(ns):
            U[alive, i] = u[alive]
            # RK4 on (u, w)
            k1u, k1w = w, f(u)
            k2u, k2w = w + 0.5 * dphi * k1w, f(u + 0.5 * dphi * k1u)
            k3u, k3w = w + 0.5 * dphi * k2w, f(u + 0.5 * dphi * k2u)
            k4u, k4w = w + dphi * k3w, f(u + dphi * k3u)
            u = u + dphi / 6 * (k1u + 2 * k2u + 2 * k3u + k4u); w = w + dphi / 6 * (k1w + 2 * k2w + 2 * k3w + k4w)
            cap = alive & (u >= 0.5); esc = alive & (u <= 0)
            fate[cap] = 1; end[cap] = (i + 1) * dphi
            # escaped: the asymptotic direction is φ + (the small remaining angle ≈ u / |w|)
            fate[esc] = 2; end[esc] = (i + 1) * dphi
            alive &= ~(cap | esc)
            if not alive.any(): break
        fate[alive] = 1; end[alive] = ns * dphi  # trapped near the photon sphere for > 2 turns: treat as captured
        tabs.append(dict(U=U, end=end, fate=fate))
    return b, dphi, tabs

# ---------------------------------------------------------------- sky
def make_sky(w=8192, seed=7):
    """Procedural star sky (equirect): stars with a power-law brightness, colour by temperature, a faint galactic band."""
    rng = np.random.default_rng(seed)
    h = w // 2
    img = np.zeros((h, w, 3), np.float32)
    # galactic band along a great circle tilted 60° from the disk plane
    lon = (np.arange(w) + 0.5) / w * 2 * np.pi - np.pi; lat = np.pi / 2 - (np.arange(h) + 0.5) / h * np.pi
    LON, LAT = np.meshgrid(lon, lat)
    X, Y, Z = np.cos(LAT) * np.cos(LON), np.cos(LAT) * np.sin(LON), np.sin(LAT)
    tilt = math.radians(62); gz = -Y * math.sin(tilt) + Z * math.cos(tilt)
    noise = np.zeros((h, w), np.float32)
    for s, a in ((6, 0.45), (20, 0.35), (64, 0.2)):
        n = rng.random((h // s + 2, w // s + 2)).astype(np.float32)
        n = np.array(Image.fromarray(n).resize((w, h), Image.BICUBIC))
        noise += a * n
    band = np.exp(-(gz / 0.12) ** 2) * (0.2 + 0.8 * noise ** 2)
    img += band[..., None] * np.array([0.022, 0.020, 0.018], np.float32)
    # stars
    n = 140000
    sx = rng.integers(0, w, n); sy = (np.arccos(rng.uniform(-1, 1, n)) / np.pi * h).astype(int).clip(0, h - 1)
    mag = rng.pareto(1.6, n) + 1
    br = np.minimum(mag ** 1.5 * 0.08, 2.5).astype(np.float32)
    temp = rng.choice([3200, 4500, 5800, 7500, 11000, 20000], n, p=[0.25, 0.25, 0.22, 0.14, 0.09, 0.05])
    col = np.stack([bb_rgb(t) for t in temp]).astype(np.float32)
    np.add.at(img, (sy, sx), br[:, None] * col)
    # a soft glow for the bright ones
    big = br > 1.2
    for dy, dx, k in ((0, 1, .25), (0, -1, .25), (1, 0, .25), (-1, 0, .25)):
        np.add.at(img, ((sy[big] + dy).clip(0, h - 1), (sx[big] + dx) % w), (k * br[big])[:, None] * col[big])
    return img

def bb_rgb(T):
    """Approximate sRGB colour (linear, max 1) of a blackbody at temperature T (K)."""
    t = T / 100
    r = 255 if t <= 66 else 329.7 * (t - 60) ** -0.1332
    g = 99.47 * math.log(t) - 161.1 if t <= 66 else 288.1 * (t - 60) ** -0.0755
    bl = 255 if t >= 66 else (0 if t <= 19 else 138.5 * math.log(t - 10) - 305.0)
    c = np.clip(np.array([r, g, bl]) / 255, 0, 1)
    return (c ** 2.2) / max((c ** 2.2).max(), 1e-6)

def bb_rgb_vec(T):
    t = xp.clip(T, 1000, 40000) / 100
    r = xp.where(t <= 66, 255, 329.7 * xp.maximum(t - 60, 1e-3) ** -0.1332)
    g = xp.where(t <= 66, 99.47 * xp.log(t) - 161.1, 288.1 * xp.maximum(t - 60, 1e-3) ** -0.0755)
    bl = xp.where(t >= 66, 255, xp.where(t <= 19, 0, 138.5 * xp.log(xp.maximum(t - 10, 1e-3)) - 305.0))
    c = xp.clip(xp.stack([r, g, bl], -1) / 255, 0, 1) ** 2.2
    return c / xp.maximum(c.max(-1, keepdims=True), 1e-6)

# ---------------------------------------------------------------- render
def render(r0, W=3840, fall=False, tilt_deg=8.0, r_out=22.0, sky=None, table=None, yaw0=0.0, t=0.0, tpeak=5200, gain=1.8, view=None):
    """view = (w, h, fov_deg, pitch_deg): a flat (rectilinear) camera looking at the black hole instead of the 360 frame"""
    H = W // 2
    b_tab, dphi, tabs = table if table is not None else orbit_table(r0)
    sky = xp.asarray(sky if sky is not None else make_sky())
    # observer frame: x forward (to the black hole), y left, z up
    if view is None:
        lon = (xp.arange(W, dtype=xp.float32) + 0.5) / W * 2 * xp.pi - xp.pi + yaw0
        lat = xp.pi / 2 - (xp.arange(H, dtype=xp.float32) + 0.5) / H * xp.pi
        LON, LAT = xp.meshgrid(lon, lat)
        d = xp.stack([xp.cos(LAT) * xp.cos(-LON), xp.cos(LAT) * xp.sin(-LON), xp.sin(LAT)], -1).astype(xp.float64)
        del LON, LAT
    else:
        vw, vh, fov, pitch = view[:4]; vyaw = math.radians(view[4]) if len(view) > 4 else 0.0
        f = (vw / 2) / math.tan(math.radians(fov / 2))
        xs, ys = xp.meshgrid(xp.arange(vw) - vw / 2 + 0.5, xp.arange(vh) - vh / 2 + 0.5)
        d = xp.stack([xp.full(xs.shape, f), -xs, -ys], -1).astype(xp.float64)
        d /= xp.linalg.norm(d, axis=-1, keepdims=True)
        pr = math.radians(pitch); cp, sp = math.cos(pr), math.sin(pr)
        d = xp.stack([d[..., 0] * cp - d[..., 2] * sp, d[..., 1], d[..., 0] * sp + d[..., 2] * cp], -1)
        cy, sy = math.cos(vyaw), math.sin(vyaw)
        d = xp.stack([d[..., 0] * cy - d[..., 1] * sy, d[..., 0] * sy + d[..., 1] * cy, d[..., 2]], -1)
    # aberration: a camera falling in from rest at infinity moves inward (+x) at v = sqrt(2/r) relative to the static frame.
    # a direction d seen by the moving camera corresponds to d_s in the static frame (cos θ_s = (cos θ − v)/(1 − v cos θ)).
    dopp_cam = xp.ones(d.shape[:2])
    if fall:
        v = math.sqrt(2 / r0); gam = 1 / math.sqrt(1 - v * v)
        c = d[..., 0]
        cs = (c - v) / (1 - v * c)
        perp = d[..., 1:]; pn = xp.linalg.norm(perp, axis=-1, keepdims=True)
        ss = xp.sqrt(xp.maximum(1 - cs ** 2, 0))[..., None]
        d = xp.concatenate([cs[..., None], xp.where(pn > 1e-12, perp / xp.maximum(pn, 1e-12), 0) * ss], -1)
        dopp_cam = 1 / (gam * (1 - v * c))  # frequency boost of incoming light seen by the moving camera
    # photon plane: P̂ = observer position direction (−x), ψ = angle between ray and the inward direction (+x)
    P = xp.array([-1.0, 0, 0])
    cpsi = d[..., 0]
    spsi = xp.sqrt(xp.maximum(1 - cpsi ** 2, 0))
    b = r0 * spsi / math.sqrt(1 - 2 / r0)
    e2 = d - (d @ P)[..., None] * P; e2 /= xp.maximum(xp.linalg.norm(e2, axis=-1, keepdims=True), 1e-12)
    inward = cpsi > 0
    # nearest b in the table
    bi = xp.clip(xp.searchsorted(b_tab, b), 1, len(b_tab) - 1)
    bf = xp.clip((b - b_tab[bi - 1]) / (b_tab[bi] - b_tab[bi - 1]), 0, 1)
    out = xp.zeros(d.shape[:2] + (3,), xp.float32)
    # disk plane: normal N tilted by tilt_deg towards the camera (we sit slightly above the disk)
    tl = math.radians(tilt_deg); N = xp.array([-math.sin(tl), 0, math.cos(tl)])
    pN = P @ N; e2N = e2 @ N
    phid = xp.mod(xp.arctan2(-pN, e2N), xp.pi)  # first φ where the photon plane meets the disk line
    dbx = P - (P @ N) * N; dbx /= xp.linalg.norm(dbx); dby = xp.cross(N, dbx)  # basis in the disk plane
    ell = xp.cross(P, e2)  # direction of the traced ray's angular momentum
    for k, tab in enumerate(tabs):
        m = inward if k == 0 else ~inward
        if not m.any(): continue
        U, end, fate = tab['U'], tab['end'], tab['fate']
        bim = bi[m]; fb = bf[m]; ph0 = phid[m]
        same = fate[bim] == fate[bim - 1]
        endm = xp.where(same, end[bim - 1] * (1 - fb) + end[bim] * fb, xp.where(fb < 0.5, end[bim - 1], end[bim]))
        fm = xp.where(fb < 0.5, fate[bim - 1], fate[bim])
        nm = int(m.sum()); col = xp.zeros((nm, 3), xp.float32); hitd = xp.zeros(nm, bool)
        for j in range(3):  # up to three disk crossings (direct image, the one wrapped under, the photon ring)
            ph = ph0 + j * xp.pi
            ok = (~hitd) & (ph < endm)
            ii = xp.clip((ph / dphi).astype(int), 0, U.shape[1] - 1)
            ua, ub = U[bim - 1, ii], U[bim, ii]
            u = xp.where(xp.isfinite(ua) & xp.isfinite(ub), ua * (1 - fb) + ub * fb, xp.where(fb < 0.5, ua, ub))
            r = xp.where(xp.isfinite(u) & (u > 0), 1 / xp.maximum(u, 1e-9), xp.inf)
            onr = ok & (r >= 6) & (r <= r_out)
            if onr.any():
                rr = r[onr]
                Om = rr ** -1.5
                Lz = -b[m][onr] * (ell[m][onr] @ N)  # the real photon runs the other way
                g = xp.sqrt(1 - 3 / rr) / (1 - Om * Lz) / math.sqrt(1 - 2 / r0)
                g = g * dopp_cam[m][onr]
                # temperature profile T ∝ r^(-3/4) (1 − √(6/r))^(1/4) (peak tpeak K); intensity ∝ T⁴, observed × g⁴
                prof = rr ** -0.75 * xp.maximum(1 - xp.sqrt(6 / rr), 0) ** 0.25 / (8.17 ** -0.75 * (1 - math.sqrt(6 / 8.17)) ** 0.25)
                Tobs = tpeak * prof * g
                # gas texture: streaks that orbit at the local Kepler rate (so they shear as time runs)
                phc = ph[onr]
                pos = rr[:, None] * (xp.cos(phc)[:, None] * P + xp.sin(phc)[:, None] * e2[m][onr])
                az = xp.arctan2(pos @ dby, pos @ dbx) - Om * t * 1.0
                lr = xp.log(rr)
                tex = (0.62 + 0.14 * xp.sin(23 * lr + 2 * az + 1.3) + 0.10 * xp.sin(61 * lr + 5 * az + 0.4) + 0.07 * xp.sin(140 * lr + 11 * az + 2.1)
                       + 0.09 * xp.sin(37 * lr - 3 * az + 0.7) * xp.sin(7 * az + 9 * lr) + 0.06 * xp.sin(210 * lr + 17 * az + 1.9))
                I = prof ** 4 * g ** 4 * gain * xp.clip(tex, 0.15, 1.2)
                edge = xp.clip((r_out - rr) / 3, 0, 1) * xp.clip((rr - 6) / 0.6, 0, 1)
                col[onr] = (bb_rgb_vec(Tobs) * (I * edge)[:, None]).astype(xp.float32)
                hitd[onr] = True
        # escaped rays (not stopped by the disk): sample the sky in the asymptotic direction
        esc = (~hitd) & (fm == 2)
        if esc.any():
            phi_inf = endm[esc]
            n = xp.cos(phi_inf)[:, None] * P + xp.sin(phi_inf)[:, None] * e2[m][esc]
            slon = xp.arctan2(n[:, 1], n[:, 0]); slat = xp.arcsin(xp.clip(n[:, 2], -1, 1))
            sh, sw = sky.shape[:2]
            px = ((slon + xp.pi) / (2 * xp.pi) * sw).astype(int) % sw; py = ((xp.pi / 2 - slat) / xp.pi * sh).astype(int).clip(0, sh - 1)
            sc = sky[py, px]
            if fall:  # stars ahead get blue and bright, behind red and dim
                dc = dopp_cam[m][esc]
                sc = sc * (dc ** 3)[:, None] * xp.array([1, 1, 1], xp.float32)
                sc = sc * xp.clip(xp.stack([1 / dc, xp.ones_like(dc), dc], -1), 0.4, 2.2) ** 0.6
            col[esc] = sc
        out[m] = col
    return out

def tonemap(img, exposure=1.0):
    """Luminance Reinhard (keeps the hue of the hot gas instead of washing it to white), then sRGB gamma."""
    x = img * exposure
    L = 0.2126 * x[..., 0] + 0.7152 * x[..., 1] + 0.0722 * x[..., 2]
    Ld = L * (1 + L / 9.0) / (1 + L)
    x = x * (Ld / xp.maximum(L, 1e-6))[..., None]
    m = x.mean(-1, keepdims=True); x = m + (x - m) * 1.45  # a little more saturation: the gas reads warm, not beige
    x = xp.maximum(x, 0) + xp.maximum(x.max(-1, keepdims=True) - 1, 0) * 0.35  # very hot spots burn toward white
    x = xp.clip(x, 0, 1) ** (1 / 2.2)
    return (x * 255 + 0.5).astype(xp.uint8)

def bloom(img, k=0.12):
    bright = xp.maximum(img - 1.5, 0)
    s = img.shape[1] / 1920
    gl = xp.stack([_gauss(bright[..., c], 10 * s) for c in range(3)], -1) + 0.5 * xp.stack([_gauss(bright[..., c], 40 * s) for c in range(3)], -1)
    return img + k * gl * 4

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('out'); ap.add_argument('--r', type=float, default=30); ap.add_argument('--w', type=int, default=3840)
    ap.add_argument('--fall', action='store_true'); ap.add_argument('--tilt', type=float, default=8); ap.add_argument('--exp', type=float, default=1.0)
    a = ap.parse_args()
    img = render(a.r, a.w, a.fall, a.tilt)
    Image.fromarray(tonemap(bloom(img), a.exp)).save(a.out, quality=92)
    print('saved', a.out)
