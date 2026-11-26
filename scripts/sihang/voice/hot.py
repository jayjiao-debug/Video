#!/usr/bin/env python3
"""《采访八百壮士的一天》 THE HOT SYLLABLES: the clip gain that keeps the voice's loudest syllables, laid over the film's
beds and effects, under the sound mix's ceiling, so scripts/kit/day/sound/build.py's limiters never act
(a short form of scripts/newton/voice/hot_syllables.py: the same curve, no floor / lift pass).

  python3 scripts/sihang/voice/hot.py <lines_dir> <cuts.list.json> <clips_dir> [--work DIR] [--check]

  1. the voice as scripts/kit/day/voice/assemble.py lays it WITHOUT clip gain, times the mix's master gain, and the bed
     (build.py --only music,amb,sfx --nolimit: every cue at its gain, master gain in), both 4x oversampled.
  2. wherever |voice + bed| (or the voice alone) is over T = ceiling - margin, the voice needs the gain
     g <= (T - max(0, bed x sign(voice))) / |voice|. A place where the bed alone is over T is printed (the sound's, not
     the voice's).
  3. the curve: the needed gain held at its lowest for HOLD s either side, then averaged over HOLD s: a ride at syllable
     level, at or under the needed gain on every sample.
  4. written per line, in the line's own clip seconds, as [t0, t1, [dB, ...]] (one value every STEP s, each the lowest of
     the curve within STEP of it, floored to 0.1 dB) into scripts/sihang/voice/clip_gain.json, which the lines file names
     ("voice": {"clip_gain": ...}) and assemble.py applies.
  --check: measures the voice track as it is now in --work/voice (clip gain in) against the bed and writes nothing.
Run it again after a new take, a change of a pad (the bed moves under the lines) or a change of the cue sheet. The clips
are not in the repo: the curves are computed where the clips are and committed as numbers."""
import argparse, json, os, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
KIT_VOICE = os.path.join(ROOT, "scripts/kit/day/voice")
BUILD = os.path.join(ROOT, "scripts/kit/day/sound/build.py")
CUES = os.path.join(ROOT, "scripts/sihang/sound/cues.json")
LINES = os.path.join(HERE, "sihang_lines.json")
OUT = os.path.join(HERE, "clip_gain.json")
SR = 48000
HOLD, STEP = 0.025, 0.005


def load(f):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", str(SR), "-f", "f64le", "-"])
    return np.frombuffer(raw, np.float64).copy()


def up4(x):
    """4x oversampling (band-limited, FFT in blocks with a margin either side)"""
    N, M = 1 << 18, 1 << 12
    out = np.empty(4 * len(x)); xp = np.concatenate([np.zeros(M), x, np.zeros(N + M)]); pos = 0
    while pos < len(x):
        seg = xp[pos: pos + N + 2 * M]
        X = np.fft.rfft(seg); Y = np.zeros(2 * len(seg) + 1, complex); Y[:len(X)] = X
        y = np.fft.irfft(Y, 4 * len(seg)) * 4
        n = min(N, len(x) - pos)
        out[4 * pos: 4 * (pos + n)] = y[4 * M: 4 * (M + n)]
        pos += N
    return out


def db(v): return 20 * np.log10(max(float(v), 1e-12))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("lines_dir"); ap.add_argument("cuts"); ap.add_argument("clips")
    ap.add_argument("--work", default="/home/user/sihang_work/film")
    ap.add_argument("--ceiling", type=float, default=-1.8); ap.add_argument("--margin", type=float, default=0.5)
    ap.add_argument("--gain", type=float, default=6.2)
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()
    sys.path.insert(0, KIT_VOICE)
    import assemble
    assemble.LINES_FILE = LINES
    vdir = os.path.join(a.work, "voice") if a.check else os.path.join(a.work, "hot")
    os.makedirs(vdir, exist_ok=True)
    os.chdir(ROOT)
    if not a.check:
        sys.path.insert(0, HERE)
        import build_voice
        assemble.main(build_voice.faded(a.lines_dir, vdir), vdir, [a.cuts], clip_gain=False)   # the clips as build_voice.py lays them
    timing = os.path.join(vdir, "voice_timing.json"); voice = os.path.join(vdir, "voice_48k.wav")
    bed_f = os.path.join(a.work, "hot", "bed.wav"); os.makedirs(os.path.dirname(bed_f), exist_ok=True)
    subprocess.run([sys.executable, BUILD, "--film", "sihang", "--timing", timing, "--voice", voice, "--clips", a.clips, "--cues", CUES,
                    "--only", "music,amb,sfx", "--nolimit", "--gain", str(a.gain), "--out", bed_f], check=True, stdout=subprocess.DEVNULL)
    G = 10 ** (a.gain / 20); T = 10 ** ((a.ceiling - a.margin) / 20)
    v = load(voice) * G; b = load(bed_f); n = min(len(v), len(b)); v, b = v[:n], b[:n]
    v4, b4 = up4(v), up4(b)
    L = json.load(open(timing))["lines"]
    # the bed alone
    over_b = np.where(np.abs(b4) > T)[0]
    if len(over_b):
        ts = sorted({round(i / 4 / SR, 1) for i in over_b})
        print(f"THE BED ALONE is over {a.ceiling - a.margin:.1f} dBFS (peak {db(np.abs(b4).max()):.2f}) near: " + " ".join(f"{t:.1f}" for t in ts[:60]))
    else: print(f"the bed alone peaks at {db(np.abs(b4).max()):.2f} dBFS at {np.abs(b4).argmax() / 4 / SR:.2f} s")
    s4 = np.abs(v4 + b4)
    print(f"voice x master gain peaks at {db(np.abs(v4).max()):.2f} dBFS, voice + bed at {db(s4.max()):.2f} dBFS ({s4.argmax() / 4 / SR:.2f} s); the line is {a.ceiling - a.margin:.1f}")
    if a.check:
        bad = np.where(np.maximum(s4, np.abs(v4)) > 10 ** (a.ceiling / 20))[0]
        print("CHECK:", "0 places over the ceiling" if not len(bad) else f"{len(bad)} samples over {a.ceiling}: " + " ".join(sorted({f'{i / 4 / SR:.1f}' for i in bad})[:60]))
        sys.exit(1 if len(bad) else 0)
    av = np.abs(v4)
    need = np.ones(len(v4)); hot = np.where(np.maximum(s4, av) > T)[0]
    room = np.maximum(T - np.maximum(0.0, b4[hot] * np.sign(v4[hot])), 0.02)
    need[hot] = np.minimum(1.0, room / np.maximum(av[hot], 1e-9))
    need = need.reshape(-1, 4).min(1)                                    # 48 kHz
    h = int(round(HOLD * SR)); held = np.ones(len(need))
    for i in np.where(need < 1.0)[0]:
        lo, hi = max(0, i - h), min(len(need), i + h + 1)
        seg = held[lo:hi]; np.minimum(seg, need[i], out=seg)
    w = h | 1; c = np.cumsum(np.concatenate([[0.0], np.pad(held, (w // 2, w // 2), constant_values=1.0)]))
    curve = np.minimum((c[w:] - c[:-w]) / w, 1.0)
    st = int(round(STEP * SR)); lines = {}; rep = []
    idx = np.where(curve < 1.0 - 1e-7)[0]
    regs = []
    for i in idx:
        if regs and i - regs[-1][1] <= 4 * st: regs[-1][1] = i
        else: regs.append([i, i])
    for i0, i1 in regs:
        tm = (i0 + i1) / 2 / SR
        l = next((x for x in L if x["start"] - 0.05 <= tm <= x["end"] + 0.05 and not x.get("silent")), None)
        if l is None: print(f"  (a hot place at {tm:.2f} s is in no line: skipped)"); continue
        a0, a1 = int(round(l["start"] * SR)), int(round(l["end"] * SR))
        k0 = max(a0, i0 - 2 * st); k1 = min(a1, i1 + 2 * st)
        # evenly spaced values from t0 to t1 (assemble.py's reading): the last step may be shorter, so resample on an even grid
        t0, t1 = (k0 - a0) / SR, (k1 - a0) / SR
        m = max(2, int(np.ceil((t1 - t0) / STEP)) + 1); grid = np.linspace(k0, k1, m)
        ev = [np.floor(10 * db(curve[max(0, int(p) - st): int(np.ceil(p)) + st + 1].min())) / 10 for p in grid]
        if k0 > a0: ev[0] = 0.0
        if k1 < a1: ev[-1] = 0.0
        ev = [min(0.0, round(float(x), 1)) for x in ev]
        lines.setdefault(l["id"], []).append([round(t0, 4), round(t1, 4), ev])
        rep.append((l["id"], tm, min(ev)))
    json.dump({"ceiling_db": a.ceiling, "margin_db": a.margin, "master_gain_db": a.gain, "hold_s": HOLD, "step_s": STEP,
               "lines": lines, "lift_db": {}}, open(OUT, "w"), ensure_ascii=False, separators=(",", ":"))
    by = {}
    for lid, tm, d in rep: by.setdefault(lid, []).append(d)
    print(f"wrote {OUT}: {len(rep)} places in {len(by)} lines; deepest per line: " + "  ".join(f"{k} {min(v):.1f}" for k, v in sorted(by.items())))


if __name__ == "__main__":
    main()
