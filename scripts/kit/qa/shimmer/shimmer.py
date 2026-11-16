#!/usr/bin/env python3
"""SHIMMER TEST: does a still picture change when the camera moves by a fraction of a pixel?

  python3 scripts/kit/qa/shimmer/shimmer.py run <entry.ts> <outdir> [--frame F] [--size WxH] [--opts JSON] ...
      renders frame F of a preview entry K times with fixed camera jitters (scripts/kit/qa/shimmer/hook.ts, no change to
      the entry or its harness), once per variant (final / noink / noao / raw / mask), then analyses.
  python3 scripts/kit/qa/shimmer/shimmer.py analyse <outdir> [--sigma S] [--thr T] [--roi x0,y0,x1,y1]
      analyses again what `run` rendered (other blur, threshold or region).
  python3 scripts/kit/qa/shimmer/shimmer.py real <frames dir> <outdir> --cams cams.json [--ref F] [--frames a,b,..]
      the same measure on REAL consecutive frames of a camera move that only turns and zooms (the camera's place is
      fixed): every frame is warped into the view of frame --ref (an exact homography) and the pictures are compared.
      Used to validate the jitter test against a real clip (README.md).

The measure. Every jittered picture is moved back by its known offset and low-passed in one step (a Gaussian of
sigma = 1.5 px at 540x960, 3 px at 1080x1920: about a 5x5 box at the 540 size; done in the Fourier domain, so the
shift is exact for everything the low-pass keeps). A correctly filtered picture then gives K nearly equal pictures.
D(pixel) = max - min over the K pictures (the largest of R, G, B), in 8-bit levels (0..255).
Numbers per variant:
  over_ppm   pixels with D > thr, per million pixels                          <- the pass / fail number
  hot        how many cells (16x16 px at 540x960) hold at least one such pixel: the number of popping PLACES
  p99.9      the 99.9th percentile of D          max   the largest D          mean   the mean of D
Files: heat_<variant>.png (D over the dimmed picture), d_<variant>.png (D x 2 as grey, for other tools),
sheet.png (all heat maps side by side), report.json, report.md.
Needs numpy + Pillow. Renders ONLY through scripts/kit/queue/still.sh (the machine-wide render queue).
"""
import argparse, json, math, os, subprocess, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "../../../.."))
STILL = os.environ.get("SHIMMER_STILL", os.path.join(REPO, "scripts/kit/queue/still.sh"))
FONT = os.path.join(REPO, "public/bt/sans700.ttf")
VARIANTS = ["final", "noink", "noao", "raw", "mask"]
THR = 12.0           # levels: see README.md "the threshold"
ADD_PPM, ADD_SHARE = 300.0, 0.25   # PASS: final over_ppm - raw over_ppm <= max(ADD_PPM, ADD_SHARE x raw over_ppm)


# ---------------------------------------------------------------------------------------------------------------------
# the jitter table (the same as jitter.ts shimmerOffset)
# ---------------------------------------------------------------------------------------------------------------------
def halton(i, b):
    f, r = 1.0, 0.0
    while i > 0:
        f /= b
        r += f * (i % b)
        i //= b
    return r


def js_round(x):                      # Math.round
    return math.floor(x + 0.5)


def offsets(k, spread=0):
    out = []
    for j in range(k):
        i = j + 1
        wx = js_round((halton(i, 5) - 0.5) * 2 * spread) if spread > 0 else 0
        wy = js_round((halton(i, 7) - 0.5) * 2 * spread) if spread > 0 else 0
        out.append([halton(i, 2) - 0.5 + wx, halton(i, 3) - 0.5 + wy])
    return out


# ---------------------------------------------------------------------------------------------------------------------
# pictures
# ---------------------------------------------------------------------------------------------------------------------
def load(path):
    return np.asarray(Image.open(path).convert("RGB")).astype(np.float32)


def lowpass_shift(img, sx, sy, sigma):
    """the picture moved by (+sx, +sy) px (x right, y down) and low-passed with a Gaussian, in one Fourier step"""
    h, w = img.shape[:2]
    fy = np.fft.fftfreq(h)[:, None]
    fx = np.fft.rfftfreq(w)[None, :]
    g = np.exp(-2 * (math.pi * sigma) ** 2 * (fx * fx + fy * fy)) * np.exp(-2j * math.pi * (fx * sx + fy * sy))
    out = np.empty_like(img)
    for c in range(img.shape[2]):
        out[:, :, c] = np.fft.irfft2(np.fft.rfft2(img[:, :, c]) * g, s=(h, w))
    return out


def spread_map(stack):
    """D = max - min over the pictures, the largest of the channels"""
    mx = stack[0].copy()
    mn = stack[0].copy()
    for s in stack[1:]:
        np.maximum(mx, s, out=mx)
        np.minimum(mn, s, out=mn)
    return (mx - mn).max(axis=2)


def default_sigma(h):
    return 1.5 * h / 960.0


def stats(D, thr, border, roi=None, cell=None):
    h, w = D.shape
    x0, y0, x1, y1 = border, border, w - border, h - border
    if roi:
        x0, y0, x1, y1 = max(x0, roi[0]), max(y0, roi[1]), min(x1, roi[2]), min(y1, roi[3])
    d = D[y0:y1, x0:x1]
    over = d > thr
    cell = cell or max(1, round(16 * h / 960))
    hh, ww = (d.shape[0] // cell) * cell, (d.shape[1] // cell) * cell
    hot = int(over[:hh, :ww].reshape(hh // cell, cell, ww // cell, cell).any(axis=(1, 3)).sum()) if hh and ww else 0
    return {
        "over_ppm": round(1e6 * float(over.mean()), 1), "hot": hot, "p99.9": round(float(np.percentile(d, 99.9)), 2),
        "max": round(float(d.max()), 2), "mean": round(float(d.mean()), 3), "pixels": int(d.size),
    }


def ramp(t):
    """0..1 -> yellow, orange, red, magenta, white"""
    stops = np.array([[255, 235, 60], [255, 140, 0], [240, 20, 20], [255, 0, 220], [255, 255, 255]], np.float32)
    t = np.clip(t, 0, 1) * (len(stops) - 1)
    i = np.minimum(t.astype(int), len(stops) - 2)
    f = (t - i)[..., None]
    return stops[i] * (1 - f) + stops[i + 1] * f


def heat_image(picture, D, thr):
    """D over the dimmed grey picture: nothing under thr / 2, yellow at thr, red at 2.5 thr, white from 4 thr"""
    grey = picture.mean(axis=2, keepdims=True) * 0.45 + 30
    base = np.repeat(grey, 3, axis=2)
    a = np.clip((D - thr * 0.5) / (thr * 0.5), 0, 1)[..., None]
    col = ramp((D - thr * 0.5) / (thr * 3.5))
    return np.clip(base * (1 - a) + col * a, 0, 255).astype(np.uint8)


def dilate(D, r):
    """a max filter (so that a hot pixel survives a downscale)"""
    if r <= 0:
        return D
    out = D.copy()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            if dx or dy:
                np.maximum(out, np.roll(np.roll(D, dy, 0), dx, 1), out=out)
    return out


# ---------------------------------------------------------------------------------------------------------------------
# analyse a run
# ---------------------------------------------------------------------------------------------------------------------
def analyse(outdir, sigma=None, thr=THR, roi=None, quiet=False):
    man = json.load(open(os.path.join(outdir, "manifest.json")))
    offs, variants, K = man["offs"], man["variants"], len(man["offs"])
    w, h = man["w"], man["h"]
    sigma = sigma or default_sigma(h)
    border = int(math.ceil(4 * sigma + max(max(abs(o[0]), abs(o[1])) for o in offs))) + 1
    rep = {"entry": man["entry"], "frame": man["frame"], "size": [w, h], "k": K, "spread": man.get("spread", 0), "sigma": sigma,
           "thr": thr, "border": border, "roi": roi, "when": man.get("when"), "variants": {}}
    panels = []
    for vi, v in enumerate(variants):
        paths = [os.path.join(outdir, "fr", "f%04d.png" % (vi * K + k)) for k in range(K)]
        if not all(os.path.exists(p) for p in paths):
            print("shimmer: variant %s is not rendered, skipped" % v)
            continue
        imgs = [load(p) for p in paths]
        # setViewOffset(dx, dy) moves the picture by (-dx, -dy): move it back by (+dx, +dy)
        reg = [lowpass_shift(im, o[0], o[1], sigma) for im, o in zip(imgs, offs)]
        D = spread_map(reg)
        if vi == 0:
            # self-checks. (1) did the picture really move by the offsets? Least squares for a left-over global shift
            # of every picture against the mean (0 = the offsets are right; a wrong sign gives twice the offset).
            m = sum(reg) / K
            gy, gx = np.gradient(m.mean(axis=2))
            b = border
            gx, gy = gx[b:-b, b:-b].ravel(), gy[b:-b, b:-b].ravel()
            A = np.array([[gx @ gx, gx @ gy], [gx @ gy, gy @ gy]]) + 1e-6 * np.eye(2)
            left = []
            for r_ in reg:
                d = (r_.mean(axis=2) - m.mean(axis=2))[b:-b, b:-b].ravel()
                left.append(np.linalg.solve(A, [gx @ d, gy @ d]))
            rep["shift_left_px"] = round(float(np.abs(np.array(left)).max()), 3)
            if rep["shift_left_px"] > 0.08:
                print("shimmer: WARNING the pictures did not move by the jitter offsets (a shift of up to %.2f px is left after registration): the numbers are too high. Does the harness draw without the composer, or flip the picture?" % rep["shift_left_px"])
            # (2) is the frame a pure function of its number? the repeat of (variant 0, jitter 0) must equal the first picture
            rp = os.path.join(outdir, "fr", "f%04d.png" % (len(variants) * K))
            if os.path.exists(rp):
                rep["repeat_differs_px"] = int((np.abs(load(rp) - imgs[0]).max(axis=2) > 0).sum())
                if rep["repeat_differs_px"]:
                    print("shimmer: WARNING the same frame drawn again differs in %d pixels: the entry keeps state between draws (or uses a clock); the numbers hold that change too" % rep["repeat_differs_px"])
        D[:border] = D[-border:] = 0
        D[:, :border] = D[:, -border:] = 0                          # the border (wrap-round of the Fourier shift) is not measured
        st = stats(D, thr, border, roi)
        rep["variants"][v] = st
        mean = sum(imgs) / K
        Image.fromarray(np.clip(D * 2, 0, 255).astype(np.uint8)).save(os.path.join(outdir, "d_%s.png" % v))
        hm = heat_image(mean, D, thr)
        Image.fromarray(hm).save(os.path.join(outdir, "heat_%s.png" % v))
        if v == variants[0]:
            Image.fromarray(np.clip(mean, 0, 255).astype(np.uint8)).save(os.path.join(outdir, "mean_%s.png" % v))
        s = max(1, round(h / 960))
        small = heat_image(mean, dilate(D, s - 1), thr)[::s, ::s] if s > 1 else hm
        panels.append((v, small))
    if panels:
        ph, pw = panels[0][1].shape[:2]
        sheet = Image.new("RGB", (pw * len(panels) + 4 * (len(panels) - 1), ph), (255, 0, 255))
        for i, (_v, p) in enumerate(panels):
            sheet.paste(Image.fromarray(p), (i * (pw + 4), 0))
        sheet.save(os.path.join(outdir, "sheet.png"))
    f, raw = rep["variants"].get("final"), rep["variants"].get("raw")
    if f:
        share = {}
        if f["over_ppm"] > 0:
            for v, name in (("noink", "ink"), ("noao", "ao")):
                if v in rep["variants"]:
                    share[name] = round(1 - rep["variants"][v]["over_ppm"] / f["over_ppm"], 3)
        rep["share_of_over_ppm"] = share
        if raw:
            # the rule for the post passes: they may add at most a quarter (or ADD_PPM) to what the scene itself shimmers
            added, limit = f["over_ppm"] - raw["over_ppm"], max(ADD_PPM, ADD_SHARE * raw["over_ppm"])
            rep["post_added_ppm"], rep["post_limit_ppm"] = round(added, 1), round(limit, 1)
            rep["verdict"] = "PASS" if added <= limit else "FAIL"
    json.dump(rep, open(os.path.join(outdir, "report.json"), "w"), indent=1)
    lines = ["shimmer: %s frame %s, %dx%d, %d jitters, sigma %.2f px, thr %.1f levels, border %d px%s" % (
        os.path.relpath(man["entry"], REPO) if man["entry"].startswith(REPO) else man["entry"], man["frame"], w, h, K, sigma, thr, border,
        (", roi %s" % (roi,)) if roi else ""),
        "| variant | over_ppm | hot | p99.9 | max | mean |", "|---|---|---|---|---|---|"]
    for v, st in rep["variants"].items():
        lines.append("| %s | %.0f | %d | %.1f | %.1f | %.2f |" % (v, st["over_ppm"], st["hot"], st["p99.9"], st["max"], st["mean"]))
    if f and raw:
        lines.append("verdict: the post passes (ink + AO) add %.0f ppm to the raw picture's %.0f (allowed: %.0f): %s" % (
            rep["post_added_ppm"], raw["over_ppm"], rep["post_limit_ppm"], rep["verdict"]))
    if f and rep.get("share_of_over_ppm"):
        lines.append("share of the final over_ppm that goes away with the pass off: %s" % ", ".join("%s %.0f %%" % (k, 100 * x) for k, x in rep["share_of_over_ppm"].items()))
    open(os.path.join(outdir, "report.md"), "w").write("\n".join(lines) + "\n")
    if not quiet:
        print("\n".join(lines))
        print("heat maps: %s/sheet.png (%s), heat_<variant>.png" % (outdir, " | ".join(v for v, _ in panels)))
    return rep


# ---------------------------------------------------------------------------------------------------------------------
# render a run
# ---------------------------------------------------------------------------------------------------------------------
def run(a):
    outdir = os.path.abspath(a.outdir)
    os.makedirs(os.path.join(outdir, "fr"), exist_ok=True)
    w, h = (int(x) for x in a.size.split("x"))
    variants = a.variants.split(",")
    for v in variants:
        if v not in VARIANTS:
            sys.exit("shimmer: unknown variant %s (know %s)" % (v, ", ".join(VARIANTS)))
    offs = offsets(a.k, a.spread)
    entry = os.path.abspath(a.entry)
    wrapper = os.path.join(outdir, "_entry.ts")
    open(wrapper, "w").write('// written by shimmer.py: the page hook first, then the entry under test\nimport "%s";\nimport "%s";\n' % (
        os.path.join(HERE, "hook"), os.path.splitext(entry)[0]))
    # freeze the code under test: ONE bundle for every page load of this run (other people edit the tree meanwhile),
    # kept in the run's folder, so the run can be repeated later on exactly this code (--bundle)
    bundle = os.path.join(outdir, "_bundle.js")
    if a.bundle:
        if os.path.abspath(a.bundle) != bundle:
            open(bundle, "wb").write(open(a.bundle, "rb").read())
    else:
        js = ('require(process.argv[1] + "/node_modules/esbuild").build({ entryPoints: [process.argv[2]], bundle: true, format: "iife", '
              'outfile: process.argv[3], logLevel: "error", define: { "process.env.NODE_ENV": \'"production"\' }, '
              'nodePaths: [process.argv[1] + "/node_modules"] }).catch(() => process.exit(1))')
        r = subprocess.run(["node", "-e", js, REPO, wrapper, bundle], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        if r.returncode != 0:
            sys.exit("shimmer: the entry does not bundle:\n" + r.stdout)
    opts = {"font": FONT}
    opts.update(json.loads(a.opts) if a.opts else {})
    opts["f"] = a.frame
    opts["jit"] = {"f": a.frame, "offs": offs, "variants": variants}
    man = {"entry": entry, "frame": a.frame, "w": w, "h": h, "offs": offs, "variants": variants, "spread": a.spread, "opts": opts,
           "when": subprocess.run(["date", "-u", "+%Y-%m-%dT%H:%M:%SZ"], stdout=subprocess.PIPE, text=True).stdout.strip()}
    json.dump(man, open(os.path.join(outdir, "manifest.json"), "w"), indent=1)
    n = len(variants) * a.k
    per = max(a.k, (a.per_call // a.k) * a.k)                       # whole variants per page load (one hold of the lock)
    log = open(os.path.join(outdir, "render.log"), "w")
    for s in range(0, n, per):
        pick = ",".join(str(j) for j in range(s, min(n, s + per)))
        if s == 0:
            pick += ",%d" % n                                       # the repeat of the first picture (purity check)
        cmd = [STILL, bundle, os.path.join(outdir, "fr"), "--pick", pick, "--size", "%dx%d" % (w, h), "--opts", json.dumps(opts), "--timeout", "100"]
        r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        log.write(r.stdout)
        log.flush()
        for ln in r.stdout.splitlines():
            if "shimmer" in ln and ("WARNING" in ln or "frame " in ln and " j " not in ln) and s == 0 or "rror" in ln or "failed" in ln:
                print(ln)
        if r.returncode != 0:
            sys.exit("shimmer: the render failed (exit %d), see %s/render.log" % (r.returncode, outdir))
    return analyse(outdir, a.sigma, a.thr, a.roi)


# ---------------------------------------------------------------------------------------------------------------------
# real frames of a turn-and-zoom camera move
# ---------------------------------------------------------------------------------------------------------------------
def cam_matrix(c, w, h):
    """K (pixels from camera space) and R (camera space from world) of a three.js camera { pos, look, fov }"""
    pos, look = np.array(c["pos"], float), np.array(c["look"], float)
    z = pos - look
    z /= np.linalg.norm(z)                                          # the camera looks down -z
    x = np.cross([0, 1, 0], z)
    x /= np.linalg.norm(x)
    y = np.cross(z, x)
    R = np.stack([x, y, z])                                         # rows: camera axes in world
    f = (h / 2) / math.tan(math.radians(c["fov"]) / 2)
    Kc = np.array([[f, 0, -w / 2], [0, -f, -h / 2], [0, 0, -1]])   # pixel (x right, y down) = (Kc @ cam).xy / (Kc @ cam).z
    return Kc, R


def warp_to(img, cam_src, cam_ref, w, h):
    """the picture of cam_src seen through cam_ref (same camera place), bilinear resampling"""
    Ks, Rs = cam_matrix(cam_src, w, h)
    Kr, Rr = cam_matrix(cam_ref, w, h)
    Hm = Ks @ Rs @ Rr.T @ np.linalg.inv(Kr)                         # ref pixel -> src pixel
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float64) + 0.5
    p = np.stack([xs, ys, np.ones_like(xs)], axis=-1) @ Hm.T
    sx, sy = p[..., 0] / p[..., 2] - 0.5, p[..., 1] / p[..., 2] - 0.5
    ok = (sx >= 0) & (sx <= w - 1) & (sy >= 0) & (sy <= h - 1)
    sx, sy = np.clip(sx, 0, w - 1.001), np.clip(sy, 0, h - 1.001)
    x0, y0 = sx.astype(int), sy.astype(int)
    fx, fy = (sx - x0)[..., None].astype(np.float32), (sy - y0)[..., None].astype(np.float32)
    out = img[y0, x0] * (1 - fx) * (1 - fy) + img[y0, x0 + 1] * fx * (1 - fy) + img[y0 + 1, x0] * (1 - fx) * fy + img[y0 + 1, x0 + 1] * fx * fy
    return out, ok


def real(a):
    outdir = os.path.abspath(a.outdir)
    os.makedirs(outdir, exist_ok=True)
    cams = json.load(open(a.cams))
    frames = [int(x) for x in a.frames.split(",")] if a.frames else sorted(int(k) for k in cams)
    frames = [f for f in frames if os.path.exists(os.path.join(a.dir, "f%04d.png" % f))]
    ref = a.ref if a.ref is not None else frames[len(frames) // 2]
    first = load(os.path.join(a.dir, "f%04d.png" % frames[0]))
    h, w = first.shape[:2]
    sigma = a.sigma or default_sigma(h)
    reg, okall = [], np.ones((h, w), bool)
    for f in frames:
        wp, ok = warp_to(load(os.path.join(a.dir, "f%04d.png" % f)), cams[str(f)], cams[str(ref)], w, h)
        reg.append(lowpass_shift(wp, 0, 0, sigma))
        okall &= ok
    # pops: a frame that differs from BOTH its neighbours in time the same way (a thing that moves on gives
    # differences of opposite sign and counts nothing)
    pop = np.zeros((h, w), np.float32)
    for i in range(1, len(reg) - 1):
        d1, d2 = reg[i] - reg[i - 1], reg[i] - reg[i + 1]
        p = np.where(d1 * d2 > 0, np.minimum(np.abs(d1), np.abs(d2)), 0).max(axis=2)
        np.maximum(pop, p, out=pop)
    rng = spread_map(reg)
    pop[~okall] = 0
    rng[~okall] = 0
    mean = sum(load(os.path.join(a.dir, "f%04d.png" % f)) for f in [ref]) / 1
    border = int(math.ceil(4 * sigma)) + 1
    rep = {"frames": frames, "ref": ref, "sigma": sigma, "thr": a.thr, "pop": stats(pop, a.thr, border), "range": stats(rng, a.thr, border)}
    for name, D in (("pop", pop), ("range", rng)):
        Image.fromarray(np.clip(D * 2, 0, 255).astype(np.uint8)).save(os.path.join(outdir, "d_real_%s.png" % name))
        Image.fromarray(heat_image(mean, D, a.thr)).save(os.path.join(outdir, "heat_real_%s.png" % name))
    json.dump(rep, open(os.path.join(outdir, "real.json"), "w"), indent=1)
    print("shimmer real: %d frames %s..%s warped to frame %s, sigma %.2f" % (len(frames), frames[0], frames[-1], ref, sigma))
    for name in ("pop", "range"):
        st = rep[name]
        print("  %-5s over_ppm %.0f  hot %d  p99.9 %.1f  max %.1f  mean %.2f" % (name, st["over_ppm"], st["hot"], st["p99.9"], st["max"], st["mean"]))
    print("  pop = differs from both neighbours in time (flicker); range = max - min over the clip (also holds real movement)")
    return rep


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("run")
    r.add_argument("entry")
    r.add_argument("outdir")
    r.add_argument("--frame", type=int, default=0)
    r.add_argument("--size", default="540x960")
    r.add_argument("--opts", default="", help="JSON merged over the entry's options (as render.mjs --opts)")
    r.add_argument("--variants", default=",".join(VARIANTS))
    r.add_argument("--k", type=int, default=8, help="jitters per variant")
    r.add_argument("--spread", type=int, default=0, help="also move by whole pixels up to this many (screen-fixed noise)")
    r.add_argument("--bundle", default="", help="test this frozen bundle (a _bundle.js of an earlier run) instead of bundling the entry now")
    r.add_argument("--per-call", type=int, default=16, help="pictures per page load = per hold of the render lock")
    n = sub.add_parser("analyse")
    n.add_argument("outdir")
    e = sub.add_parser("real")
    e.add_argument("dir")
    e.add_argument("outdir")
    e.add_argument("--cams", required=True, help='JSON: { "<frame>": { "pos": [..], "look": [..], "fov": deg }, ... } (pos equal in all)')
    e.add_argument("--frames", default="")
    e.add_argument("--ref", type=int, default=None)
    for p in (r, n, e):
        p.add_argument("--sigma", type=float, default=None, help="low-pass sigma in px (default 1.5 x height / 960)")
        p.add_argument("--thr", type=float, default=THR, help="levels (default %s)" % THR)
    for p in (r, n):
        p.add_argument("--roi", type=lambda s: [int(x) for x in s.split(",")], default=None, help="x0,y0,x1,y1: numbers for this region only")
    a = ap.parse_args()
    if a.cmd == "run":
        run(a)
    elif a.cmd == "analyse":
        analyse(os.path.abspath(a.outdir), a.sigma, a.thr, a.roi)
    else:
        real(a)


if __name__ == "__main__":
    main()
