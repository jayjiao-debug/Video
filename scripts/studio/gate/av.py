"""Picture and sound measurements for the gate: decoding, loudness, sound faults, ground stability, version diff.

Everything here measures; nothing judges taste. Thresholds are starting points, set in GATE_RULES (gate.py) and tuned
film by film from the owner's notes (the notes ledger).
"""
import os, subprocess, sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import slib


# ------------------------------------------------------------------------------------------------ decoding
def audio(path, sr=48000, mono=True):
    cmd = [slib.ffmpeg(), "-v", "error", "-i", path, "-f", "f32le", "-ar", str(sr)] + (["-ac", "1"] if mono else ["-ac", "2"]) + ["-"]
    x = np.frombuffer(subprocess.check_output(cmd), dtype=np.float32).astype(np.float64)
    return x if mono else x.reshape(-1, 2)


def frames_gray(path, w=135, h=240, every=1):
    """every frame of a video as a (n, h, w) uint8 array, small and gray"""
    vf = f"scale={w}:{h}:flags=area,format=gray" + (f",select='not(mod(n\\,{every}))'" if every > 1 else "")
    cmd = [slib.ffmpeg(), "-v", "error", "-i", path, "-vf", vf, "-vsync", "0", "-f", "rawvideo", "-pix_fmt", "gray", "-"]
    b = subprocess.check_output(cmd)
    return np.frombuffer(b, dtype=np.uint8).reshape(-1, h, w)


# ------------------------------------------------------------------------------------------------ loudness (BS.1770)
def _kweight(x, sr):
    from scipy.signal import lfilter
    # BS.1770-4 pre-filter (shelf) and RLB high-pass, coefficients for 48 kHz
    if sr != 48000:
        from scipy.signal import resample_poly
        x = resample_poly(x, 48000, sr); sr = 48000
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621]
    return lfilter(b2, a2, lfilter(b1, a1, x))


def lufs(x, sr=48000):
    """integrated loudness (mono), gated as BS.1770"""
    y = _kweight(x, sr) ** 2
    blk, hop = int(0.4 * 48000), int(0.1 * 48000)
    if len(y) < blk:
        return -99.0
    ms = np.array([y[i:i + blk].mean() for i in range(0, len(y) - blk + 1, hop)])
    l = -0.691 + 10 * np.log10(ms + 1e-12)
    g = ms[l > -70]
    if not len(g): return -99.0
    rel = -0.691 + 10 * np.log10(g.mean()) - 10
    g2 = ms[(l > -70) & (l > rel)]
    return float(-0.691 + 10 * np.log10(g2.mean())) if len(g2) else -99.0


def short_term(x, sr=48000, win=0.4, hop=0.1):
    """loudness of each 0.4 s block (LUFS-like), and the block times"""
    y = _kweight(x, sr) ** 2
    b, h = int(win * 48000), int(hop * 48000)
    n = max(0, (len(y) - b) // h + 1)
    ms = np.array([y[i * h:i * h + b].mean() for i in range(n)])
    return -0.691 + 10 * np.log10(ms + 1e-12), np.arange(n) * hop + win / 2


def true_peak_db(x):
    from scipy.signal import resample_poly
    return float(20 * np.log10(np.max(np.abs(resample_poly(x, 4, 1))) + 1e-12))


# ------------------------------------------------------------------------------------------------ sound faults
def clicks(x, sr=48000, k=12.0):
    """sample jumps far above the local level: a cut without a fade, a dropped buffer. Returns [(t, jump)]"""
    d = np.abs(np.diff(x))
    if not len(d): return []
    win = int(0.01 * sr)
    env = np.convolve(d, np.ones(win) / win, mode="same") + 1e-4
    idx = np.where((d > k * env) & (d > 0.08))[0]
    out, last = [], -sr
    for i in idx:
        if i - last > sr // 10:
            out.append((round(i / sr, 3), round(float(d[i]), 3)))
        last = i
    return out


def holes(x, sr=48000, min_s=0.25, start=1.0, end_pad=1.5):
    """digital silence inside the film (not the head or the tail): a cue that did not load, a gap between beds"""
    a = np.abs(x) < 1e-5
    out, i, n = [], int(start * sr), len(x) - int(end_pad * sr)
    while i < n:
        if a[i]:
            j = i
            while j < n and a[j]: j += 1
            if (j - i) / sr >= min_s: out.append((round(i / sr, 2), round((j - i) / sr, 2)))
            i = j
        else:
            i += 1 + int(np.argmax(a[i + 1:n])) if a[i + 1:n].any() else n
    return out


def line_edges(voice, lines, sr=48000, edge_ms=25, rel_db=-28):
    """a voice line cut at its start or end: the voice is still loud in the first / last 25 ms of the line's clip.
    lines: [(id, start s, end s)] where start / end are the clip's edges in the film. Returns [(id, 'start'|'end', dB)]"""
    out = []
    for lid, s, e in lines:
        a, b = int(s * sr), int(e * sr)
        if b - a < sr // 5 or a < 0 or b > len(voice): continue
        seg = voice[a:b]
        ref = 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9)
        n = int(edge_ms / 1000 * sr)
        for side, part in (("start", seg[:n]), ("end", seg[-n:])):
            lv = 20 * np.log10(np.sqrt(np.mean(part ** 2)) + 1e-9) - ref
            if lv > rel_db:
                out.append((lid, side, round(float(lv), 1)))
    return out


def under_voice(voice, rest, lines, sr=48000):
    """how far the voice sits over everything under it, per line: [(id, dB)] (house rule 14 to 22 dB; Newton's
    'music too quiet' and 李白's buried lines are the two ends)"""
    out = []
    for lid, s, e in lines:
        a, b = int(s * sr), int(e * sr)
        if b <= a: continue
        v = np.sqrt(np.mean(voice[a:b] ** 2)) + 1e-9
        r = np.sqrt(np.mean(rest[a:b] ** 2)) + 1e-9
        out.append((lid, round(float(20 * np.log10(v / r)), 1)))
    return out


def repeats(x, sr=48000, hop=0.05, min_gap=1.0, min_count=3, min_db=-45):
    """the same sound heard again and again: a looped crow, burps on a loop, a click track. Fingerprints 0.4 s windows
    (log band energies), finds windows that match exactly enough at least min_count times, more than min_gap apart.
    Returns [(first t, count, times)] for the clearest repeats."""
    from numpy.fft import rfft
    w, h = int(0.4 * sr), int(hop * sr)
    n = (len(x) - w) // h
    if n < 10: return []
    win = np.hanning(w)
    edges = np.geomspace(80, 12000, 25)
    freqs = np.fft.rfftfreq(w, 1 / sr)
    bins = [np.where((freqs >= edges[i]) & (freqs < edges[i + 1]))[0] for i in range(24)]
    F, L = np.zeros((n, 24)), np.zeros(n)
    for i in range(n):
        seg = x[i * h:i * h + w]
        L[i] = 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9)
        sp = np.abs(rfft(seg * win)) ** 2
        F[i] = np.log10(np.array([sp[b].sum() for b in bins]) + 1e-12)
    loud = L > min_db
    # onset-like windows only (a rise of 6 dB): a steady bed is not a repeat
    onset = np.r_[False, (L[1:] - L[:-1]) > 6] & loud
    idx = np.where(onset)[0]
    if len(idx) < min_count: return []
    G = F[idx] - F[idx].mean(axis=1, keepdims=True)
    G /= (np.linalg.norm(G, axis=1, keepdims=True) + 1e-9)
    S = G @ G.T
    used, out = set(), []
    for a in range(len(idx)):
        if a in used: continue
        m = [b for b in np.where(S[a] > 0.985)[0] if abs(idx[b] - idx[a]) * hop >= min_gap or b == a]
        times = sorted(set(round(idx[b] * hop, 2) for b in m))
        # keep matches more than min_gap apart
        kept = []
        for t in times:
            if not kept or t - kept[-1] >= min_gap: kept.append(t)
        if len(kept) >= min_count:
            out.append((kept[0], len(kept), kept[:12]))
            used.update(m)
    out.sort(key=lambda r: -r[1])
    return out[:8]


def low_thump(x, sr=48000, lo=40, hi=120):
    """a steady low pulse (the 72 Hz thump in 李白's music): share of the energy below 120 Hz and how regular its beat
    is. Returns (share of energy in lo..hi, period s or None, regularity 0..1)"""
    from scipy.signal import butter, sosfilt
    sos = butter(4, [lo, hi], btype="band", fs=sr, output="sos")
    y = sosfilt(sos, x)
    share = float(np.sum(y ** 2) / (np.sum(x ** 2) + 1e-12))
    env = np.sqrt(np.convolve(y ** 2, np.ones(int(0.02 * sr)) / int(0.02 * sr), mode="same"))[::int(0.01 * sr)]
    env = env - env.mean()
    if env.std() < 1e-6: return share, None, 0.0
    ac = np.correlate(env, env, mode="full")[len(env) - 1:]
    ac /= ac[0] + 1e-12
    lo_l, hi_l = 25, 200          # 0.25 to 2 s
    k = lo_l + int(np.argmax(ac[lo_l:hi_l]))
    return share, round(k * 0.01, 2), round(float(ac[k]), 2)


# ------------------------------------------------------------------------------------------------ ground stability
def flicker(frames, region=None):
    """pixels that pop and come back on the next frame (sparkle, crawling outlines, a jiggling ground): for each frame
    triple, the part of |f1 - f0| that f2 undoes, averaged over the region. Returns one score per frame (gray levels).
    A camera move changes pixels too, but it does not undo itself one frame later, so it scores low."""
    F = frames.astype(np.int16)
    if region is not None:
        y0, y1, x0, x1 = region
        F = F[:, y0:y1, x0:x1]
    d1 = F[1:-1] - F[:-2]
    d2 = F[1:-1] - F[2:]
    pop = np.where(np.sign(d1) == np.sign(d2), np.minimum(np.abs(d1), np.abs(d2)), 0)
    back = np.abs(F[2:] - F[:-2]) < 6          # it really came back
    s = (pop * back).reshape(len(pop), -1).mean(axis=1)
    return np.r_[0.0, s, 0.0]


def flicker_map(frames, f):
    """where frame f pops (for the evidence image)"""
    F = frames.astype(np.int16)
    d1, d2 = F[f] - F[f - 1], F[f] - F[f + 1]
    pop = np.where(np.sign(d1) == np.sign(d2), np.minimum(np.abs(d1), np.abs(d2)), 0)
    return np.clip(pop * 8, 0, 255).astype(np.uint8)


def cuts(frames, thr=40):
    """hard cuts (mean change of the whole frame over thr gray levels)"""
    d = np.abs(frames[1:].astype(np.int16) - frames[:-1]).mean(axis=(1, 2))
    return set(int(i) + 1 for i in np.where(d > thr)[0])


# ------------------------------------------------------------------------------------------------ version diff
def align(old, new):
    """match the frames of two versions (lengths may differ: a line got longer, a scene was cut). Each frame gets a
    coarse signature; difflib matches runs of equal signatures; the matched pairs are then compared finely.
    Returns (pairs [(old i, new j)], opcodes)"""
    import difflib
    def sig(F):
        s = F.reshape(len(F), 12, F.shape[1] // 12, 9, F.shape[2] // 9).mean(axis=(2, 4))
        return [bytes((v // 24).astype(np.uint8).ravel()) for v in s]
    a, b = sig(old), sig(new)
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    ops = sm.get_opcodes()
    pairs = []
    for tag, i1, i2, j1, j2 in ops:
        if tag == "equal":
            pairs += list(zip(range(i1, i2), range(j1, j2)))
        elif tag == "replace" and (i2 - i1) == (j2 - j1):
            pairs += list(zip(range(i1, i2), range(j1, j2)))
    return pairs, ops


def changed_ranges(old, new, fps=30, thr=2.0, min_len=3, merge=15):
    """the seconds of the new version that differ from the old one: [(new f0, new f1, old f0 or None, kind, size)]
    kind: 'changed' (same place in time, different picture), 'new' (frames the old one did not have), 'cut' (old frames gone)"""
    pairs, ops = align(old, new)
    ch = np.zeros(len(new), dtype=bool)
    size = np.zeros(len(new))
    matched = np.zeros(len(new), dtype=bool)
    for i, j in pairs:
        d = float(np.abs(old[i].astype(np.int16) - new[j]).mean())
        matched[j] = True
        if d > thr:
            ch[j] = True; size[j] = d
    newf = ~matched
    out = []
    def runs(mask):
        r, j = [], 0
        while j < len(mask):
            if mask[j]:
                k = j
                while k < len(mask) and mask[k]: k += 1
                r.append([j, k - 1]); j = k
            else:
                j += 1
        m = []
        for a, b in r:
            if m and a - m[-1][1] <= merge: m[-1][1] = b
            else: m.append([a, b])
        return [x for x in m if x[1] - x[0] + 1 >= min_len]
    omap = {j: i for i, j in pairs}
    for a, b in runs(ch):
        out.append((a, b, omap.get(a), "changed", round(float(size[a:b + 1].max()), 1)))
    for a, b in runs(newf):
        out.append((a, b, None, "new", None))
    for tag, i1, i2, j1, j2 in ops:
        if tag == "delete" or (tag == "replace" and (i2 - i1) > (j2 - j1)):
            gone = (i2 - i1) - (j2 - j1 if tag == "replace" else 0)
            if gone >= min_len:
                out.append((j1, j1, i1, "cut", gone))
    out.sort(key=lambda r: r[0])
    return out, len(old), len(new)
