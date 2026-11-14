#!/usr/bin/env python3
"""《采访牛顿的一天》 (formerly 《跟着牛顿过一天》) THE HOT SYLLABLES (v5 review, 14 Nov): finds where the sound mix's bus limiter would touch the voice and
writes the clip gain that keeps it idle, without taking any line under the 10 LU floor over the bed.

  python3 scripts/newton/voice/hot_syllables.py [--build]  measure the voice as assemble.py lays it WITHOUT clip gain
                                                           against the mix's bed, write scripts/newton/voice/clip_gain_v5.json
                                                           (--build: then assemble.py and gen_timing.py)
  python3 scripts/newton/voice/hot_syllables.py --check    measure the voice track as it is (voice_48k.wav, clip gain in):
                                                           every place over the threshold, every line over the bed (full
                                                           band and phone band), the peaks; writes nothing
  options: --margin 0.5 (dB under the ceiling)  --ceiling -1.8  --gain 6.2 (build.py's)  --floor 10.3 (LU)  --report <json>

Why: the voice track peaked at -1.0 dBFS (B06's "Began"); build.py adds +6.2 dB and limits at -1.8 dBTP (4x oversampled),
so the limiter took up to 6.9 dB off the voice's loudest syllables. The fix is the voice's: a clip gain on those syllables,
so the bus limiter never engages (music is never ducked; nothing here touches the music or the bed).
How:
  1. the bed (build.py --only music,amb,sfx --nolimit: the pre-limiter mix without the voice, master gain in) and the voice
     (x the master gain) at 192 kHz (build.py's aresample, the limiter's rate). Wherever |voice + bed| is over
     T = ceiling - margin, the voice's gain must be g <= (T - bed sign voice) / |voice|. (A place where the bed alone is
     over T is reported, not fixed: it is not the voice's.)
  2. THE CURVE: the required gain (the lowest of each 4 samples, at 48 kHz) is held at its lowest for HOLD s either side,
     then averaged over HOLD s: a smooth syllable-level ride (it moves over 25 ms or more, never at the pitch rate) that is
     at or under the required gain on every sample. A flat gain over the whole syllable took 2.6 LU off B06 (its "Began" is
     10 dB louder than the rest of the line); the curve takes off only what each moment needs.
  3. Each curve is written in the line's own clip seconds (it moves with the line) as [t0, t1, [dB, ...]]: one value
     every STEP s from t0 to t1, each the lowest of the curve within STEP of it (so the straight lines assemble.py draws
     between them stay under the curve), floored to 0.1 dB; the first and the last are 0 dB.
  4. THE FLOOR: every line with a clip gain is measured over the bed (voice minus bed integrated over the line, in
     REMIX_v5's three readings: full band, phone band 450 Hz-9 kHz Butterworth and brick wall, measure5.py's method);
     one under --floor in any of them gets its whole line lifted 0.5 dB
     ("lift_db", added to its pinned gain by assemble.py) and its curve is solved again, until it holds (at most +3 dB).
     A line under the floor without a clip gain is reported (the bed's, the sound lane's).
Run it after gen_timing.py: build.py places the scene-anchored cues on the picture's own scene bounds (voice.ts).
The file: {"ceiling_db", "margin_db", "master_gain_db", "hold_s", "step_s", "floor_lu", "lines": {id: [[t0, t1, [dB..]]]},
"lift_db": {id: dB}, "events", "margins"}. The run of record: make_v5.py, assemble.py, gen_timing.py,
hot_syllables.py --build, hot_syllables.py --check (0 places). A new take (swap_take.py) drops its line's entries: run this again after a swap, and after any change of the
bed's cues (the sound lane's), then the mix."""
import argparse, json, math, os, subprocess, sys, tempfile
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
LINES = os.path.join(HERE, "newton_lines.json")
BUILD = os.path.join(ROOT, "scripts/newton/sound/build.py")
SR, UP = 48000, 192000
HOLD, STEP, MERGE = 0.025, 0.005, 0.040
LIFT_STEP, LIFT_MAX = 0.5, 3.0
sys.path.insert(0, HERE)


def load(f, sr=SR):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-af", f"aresample={sr}", "-ar", str(sr), "-f", "f64le", "-"])
    return np.frombuffer(raw, np.float64).copy()


def build_bed(timing, voice, out, gain):
    subprocess.run([sys.executable, BUILD, "--timing", timing, "--voice", voice, "--only", "music,amb,sfx", "--nolimit",
                    "--gain", str(gain), "--out", out], check=True, stdout=subprocess.DEVNULL)


def required(v, b, T):
    """the voice's required gain where |v + b| > T (192 kHz): (indices, g, bed_alone mask)"""
    idx = np.where(np.abs(v + b) > T)[0]
    vv, bb = v[idx], b[idx]
    with np.errstate(divide="ignore", invalid="ignore"):
        g = np.where(np.abs(vv) > 0, (T - bb * np.sign(vv)) / np.abs(vv), 1.0)
    return idx, np.clip(g, 0.05, 1.0), np.abs(bb) > T


def events(v, b, T, idx, alone):
    """the hot places, as [(i0, i1, peak, bed_alone)] in 192 kHz samples (samples MERGE s apart make one)"""
    if not len(idx): return []
    out, cuts = [], np.where(np.diff(idx) > int(MERGE * UP))[0]
    for a, z in zip(np.concatenate([[0], cuts + 1]), np.concatenate([cuts, [len(idx) - 1]])):
        i0, i1 = idx[a], idx[z]
        out.append((int(i0), int(i1), float(np.abs(v[i0:i1 + 1] + b[i0:i1 + 1]).max()), bool(alone[a:z + 1].any())))
    return out


def curve48(n48, idx, g):
    """THE CURVE at 48 kHz: the required gain held at its lowest HOLD s either side, then averaged over HOLD s"""
    from scipy.ndimage import minimum_filter1d, uniform_filter1d
    r = np.ones(n48)
    np.minimum.at(r, np.minimum(idx // 4, n48 - 1), g)
    w = int(HOLD * SR)
    return np.minimum(uniform_filter1d(minimum_filter1d(r, 2 * w + 1), w | 1), 1.0)


def spans_of(a, lines):
    """the curve's runs (gain under 1) as clip-gain spans per line: {id: [[t0, t1, [dB, ...]]]} in clip seconds, one value
    every STEP s (each the lowest of the curve within STEP of its point, floored to 0.1 dB), 0 dB one STEP outside the run
    (unless that falls outside the clip)"""
    out = {}
    low = a < 1 - 1e-7
    if not low.any(): return out
    d = np.diff(np.concatenate([[0], low.astype(np.int8), [0]]))
    st = int(round(STEP * SR))
    voiced = [l for l in lines if not l.get("silent")]
    for i0, i1 in zip(np.where(d == 1)[0], np.where(d == -1)[0]):
        mid = (i0 + i1) / 2 / SR
        l = min(voiced, key=lambda l: 0 if l["start"] <= mid <= l["end"] else min(abs(mid - l["start"]), abs(mid - l["end"])))
        ls, le = int(round(l["start"] * SR)), int(round(l["end"] * SR))
        j0, j1 = max(i0, ls), min(i1, le)
        if j1 <= j0: continue
        K = int(math.ceil((j1 - j0) / st)) + 2
        pts = [j0 - st + q * st for q in range(K + 1)]
        vals = [math.floor(20 * math.log10(max(1e-6, a[max(0, p - st): min(len(a), p + st + 1)].min())) * 10) / 10 for p in pts]
        vals[0] = vals[-1] = 0.0
        keep = [q for q, p in enumerate(pts) if ls <= p <= le]
        pts, vals = [pts[q] for q in keep], [vals[q] for q in keep]
        out.setdefault(l["id"], []).append([round((pts[0] - ls) / SR, 4), round((pts[-1] - ls) / SR, 4), [round(x + 0.0, 1) for x in vals]])
    return out


def kw(x):
    from scipy.signal import lfilter
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1.0, -2.0, 1.0], [1, -1.99004745483398, 0.99007225036621]
    return lfilter(b2, a2, lfilter(b1, a1, x))


def integrated(y, t0, t1):
    """BS.1770 integrated loudness of the K-weighted signal y over [t0, t1] (400 ms blocks, 75 % overlap, gated)"""
    i0, i1, w, h = int(t0 * SR), int(t1 * SR), int(0.4 * SR), int(0.1 * SR)
    c = np.concatenate([[0.0], np.cumsum(y[i0:i1] ** 2)])
    if i1 - i0 < w: return -0.691 + 10 * math.log10(c[-1] / max(1, i1 - i0) + 1e-20)
    st = np.arange(0, i1 - i0 - w + 1, h); z = (c[st + w] - c[st]) / w
    z = z[-0.691 + 10 * np.log10(z + 1e-20) > -70]
    if not len(z): return -99.0
    g = -0.691 + 10 * math.log10(z.mean()) - 10
    z2 = z[-0.691 + 10 * np.log10(z) > g]
    return -0.691 + 10 * math.log10(z2.mean()) if len(z2) else -99.0


def brick(x, lo=450, hi=9000):
    """the phone band as an FFT brick wall (measure5.py's stricter reading)"""
    F = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); F[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(F, len(x))


class Bed:
    """the bed's K-weighted signals in the three readings REMIX_v5 holds the floor in: full band, phone band 450 Hz-9 kHz
    (4th-order Butterworth) and the phone band as an FFT brick wall"""
    def __init__(self, b48):
        from scipy.signal import butter, sosfilt
        self.sos = butter(4, [450, 9000], "bp", fs=SR, output="sos")
        self.kb, self.pb, self.wb = kw(b48), kw(sosfilt(self.sos, b48)), kw(brick(b48))

    def margins(self, v48, lines):
        """every line: voice minus bed integrated over the line (LU), in the three readings"""
        from scipy.signal import sosfilt
        kv, pv, wv = kw(v48), kw(sosfilt(self.sos, v48)), kw(brick(v48))
        out = {}
        for l in lines:
            if l.get("silent"): continue
            t0, t1 = l["start"], l["end"]
            r = [integrated(a, t0, t1) - integrated(b, t0, t1) for a, b in ((kv, self.kb), (pv, self.pb), (wv, self.wb))]
            out[l["id"]] = {"voice": round(integrated(kv, t0, t1), 2), "full": round(r[0], 2), "phone": round(r[1], 2), "brick": round(r[2], 2)}
        return out


def low_of(x):
    return min(x["full"], x["phone"], x["brick"])


def line_gain(n, lines, lift, sr):
    """the lift (dB) of each line as a gain over the film at sample rate sr"""
    g = np.ones(n)
    for l in lines:
        if lift.get(l["id"]): g[int(round(l["start"] * sr)): int(round(l["end"] * sr))] = 10 ** (lift[l["id"]] / 20)
    return g


def main():
    import shutil
    tmp = tempfile.mkdtemp(prefix="hot_")
    try: run(tmp)
    finally: shutil.rmtree(tmp, ignore_errors=True)


def run(tmp):
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--margin", type=float, default=0.5)
    ap.add_argument("--ceiling", type=float, default=-1.8)
    ap.add_argument("--gain", type=float, default=6.2)
    ap.add_argument("--floor", type=float, default=10.3)
    ap.add_argument("--build", action="store_true")
    ap.add_argument("--report", default=None)
    a = ap.parse_args()
    spec = json.load(open(LINES)); vb = spec["voice"]
    cg_file = vb.get("clip_gain") or sys.exit("hot_syllables: the lines file's voice block names no clip_gain file")
    if a.check:
        voice, timing = os.path.join(vb["out"], "voice_48k.wav"), os.path.join(vb["out"], "voice_timing.json")
    else:   # the voice as assemble.py lays it, without clip gain or lift
        import assemble
        assemble.main(vb["lines_dir"], tmp, vb.get("cuts", []), clip_gain=False)
        voice, timing = os.path.join(tmp, "voice_48k.wav"), os.path.join(tmp, "voice_timing.json")
    T = json.load(open(timing)); lines = T["lines"]
    bedf = os.path.join(tmp, "bed.wav"); build_bed(timing, voice, bedf, a.gain)
    k = 10 ** (a.gain / 20); thr = 10 ** ((a.ceiling - a.margin) / 20)
    v0, b = load(voice, UP) * k, load(bedf, UP)
    n = min(len(v0), len(b)); v0, b = v0[:n], b[:n]
    v48r, b48 = load(voice)[: n // 4] * k, load(bedf)[: n // 4]
    bed = Bed(b48)
    def line_of(t):
        return next((l["id"] for l in lines if l["start"] - 0.05 <= t <= l["end"] + 0.05 and not l.get("silent")), None)
    if a.check:
        idx, g, alone = required(v0, b, thr)
        ev = events(v0, b, thr, idx, alone)
        m = bed.margins(v48r, lines)
        spans, lift = None, {}
    else:
        lift, it = {}, 0
        while True:
            it += 1
            v = v0 * line_gain(n, lines, lift, UP)
            idx, g, alone = required(v, b, thr)
            ev0 = events(v, b, thr, idx, alone) if it == 1 else ev0
            ok = ~alone
            a48 = curve48(n // 4, idx[ok], g[ok])
            spans = spans_of(a48, lines)
            # the voice as assemble.py will build it: each span drawn the way assemble.py draws it
            import assemble
            env = np.ones(n // 4)
            for l in lines:
                if l["id"] in spans:
                    s0 = int(round(l["start"] * SR)); s1 = int(round(l["end"] * SR))
                    env[s0:s1] = np.minimum(env[s0:s1], assemble.clip_gain_env(s1 - s0, spans[l["id"]]))
            v48 = v48r * line_gain(n // 4, lines, lift, SR) * env
            m = bed.margins(v48, lines)
            low = [i for i in spans if low_of(m[i]) < a.floor and lift.get(i, 0) < LIFT_MAX]
            if not low: break
            for i in low: lift[i] = lift.get(i, 0) + LIFT_STEP
        ev = ev0
    rows = []
    for i0, i1, pk, al in ev:
        t0, t1 = i0 / UP, i1 / UP
        pdb = 20 * math.log10(pk)
        rows.append({"line": line_of((t0 + t1) / 2), "film_s": [round(t0, 3), round(t1, 3)], "peak_dbfs": round(pdb, 2),
                     "over_ceiling_db": round(pdb - a.ceiling, 2), "bed_alone": al})
    over = [r for r in rows if r["over_ceiling_db"] > 0]
    print(f"{'check' if a.check else 'measure (no clip gain)'}: {len(rows)} places over {a.ceiling - a.margin:.1f} dBFS (ceiling {a.ceiling} - margin "
          f"{a.margin}), {len(over)} over the ceiling itself (the limiter acts), {sum(r['film_s'][1] - r['film_s'][0] for r in over):.3f} s of film"
          f"{'; ' + str(sum(r['bed_alone'] for r in rows)) + ' with the bed alone over' if any(r['bed_alone'] for r in rows) else ''}")
    for r in sorted(rows, key=lambda r: -r["over_ceiling_db"])[:12]:
        print(f"  {r['line']}  {r['film_s'][0]:8.3f}-{r['film_s'][1]:8.3f}  peak {r['peak_dbfs']:+6.2f} dBFS ({r['over_ceiling_db']:+.2f} over the ceiling){'  BED ALONE' if r['bed_alone'] else ''}")
    under = sorted(((i, x) for i, x in m.items() if low_of(x) < 10.0), key=lambda kv: low_of(kv[1]))
    tight = sorted(m.items(), key=lambda kv: low_of(kv[1]))[:6]
    print("tightest lines over the bed (LU, full / phone Butterworth / phone brick wall):", "  ".join(f"{i} {x['full']:.1f}/{x['phone']:.1f}/{x['brick']:.1f}" for i, x in tight),
          f"; under 10: {', '.join(i for i, _ in under) or 'none'}")
    rep = {"voice": voice, "timing": timing, "ceiling_db": a.ceiling, "margin_db": a.margin, "master_gain_db": a.gain, "events": rows, "margins": m}
    if a.check:
        v = v0
        print(f"voice track peak {20 * math.log10(np.abs(load(voice)).max()):.2f} dBFS; 4x peak of voice + bed after the master gain "
              f"{20 * math.log10(np.abs(v + b).max()):.2f} dBFS (the limiter acts over {a.ceiling})")
    else:
        doc = {"what": "the hot syllables' clip gain (hot_syllables.py; assemble.py applies it): {line: [[t0 s, t1 s, [dB every step_s from t0 to t1]]]} in "
                       "the line's own clip; lift_db: dB added to the line's pinned gain so it keeps the floor over the bed",
               "ceiling_db": a.ceiling, "margin_db": a.margin, "master_gain_db": a.gain, "hold_s": HOLD, "step_s": STEP, "floor_lu": a.floor,
               "measured": f"the voice without clip gain against build.py's bed (cues.json) on a timing of {T['frames']} frames",
               "lines": {kk: spans[kk] for kk in [l["id"] for l in lines] if kk in spans},
               "lift_db": lift, "events": rows, "margins": m,
               "deepest_db": {kk: min(min(s[2]) for s in spans[kk]) for kk in spans}}
        json.dump(doc, open(cg_file, "w"), indent=1)
        print(f"wrote {cg_file}: {sum(len(x) for x in spans.values())} curves on {len(spans)} lines, deepest "
              + ", ".join(f"{kk} {d:+.1f}" for kk, d in sorted(doc['deepest_db'].items(), key=lambda kv: kv[1])[:8])
              + f"; lift {lift or 'none'}")
        if a.build:
            subprocess.run([sys.executable, os.path.join(HERE, "assemble.py")], check=True)
            subprocess.run([sys.executable, os.path.join(ROOT, "scripts/newton/gen_timing.py"), os.path.join(vb["out"], "voice_timing.json")], check=True)
    if a.report: json.dump(rep, open(a.report, "w"), indent=1)


if __name__ == "__main__":
    main()
