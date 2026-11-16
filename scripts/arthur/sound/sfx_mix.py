#!/usr/bin/env python3
"""Narration + sound effects -> one mastered track.
usage: sfx_mix.py <narration.mp3|wav> <cues.json> <sfx_dir> <out_prefix> [--lufs -14.5] [--sfx-db 0] [--bed-db 0] [--dur seconds] [--mode limit|clip]
cues.json: {"sounds": {"shing": {"file": "sword_out_a_1.mp3", "anchor": "onset"|"peak"|"start", "rel": -9,
                                 "max_s": 1.0, "tail_ms": 60, "from_s": null, "st": 0, "drive": null}, ...},
            "cues": [{"s": "shing", "f": 806, "db": 0, "st": 0, "dur_f": null, "in_f": 0, "out_f": 2, "note": "..."}, ...]}
  rel    = the sound's level against the narration, in dB: the loudest 50 ms of the effect (above 150 Hz, what a
           phone speaker plays) against the narration's loud syllables (90th percentile of its 100 ms levels). A
           sharp hit is held back further: its sample peak stays at most CREST dB above that level.
  anchor = which point of the clip lands on frame f: its onset (first sharp rise), its loudest point, or its start.
  A bed (ambience under a whole shot) is a sound with "bed": true: its level is its average (rms above 150 Hz) against
  the narration's loud syllables, "even": seconds flattens its swells (a slow gain that follows the clip's own
  envelope), "tame": dB rounds off spikes (claps) that far over its average, and a cue may start inside the clip
  with "off_s". --bed-db moves all beds together, --sfx-db everything.
  db, st = per-cue trim in dB and pitch shift in semitones; dur_f / in_f / out_f = length and fades in frames.
Writes <out_prefix>_narr.wav (narration alone at the target loudness), _sfx.wav (effects alone), _mix.wav (both, limited).
--mode limit (default): the narration and the mix pass a look-ahead limiter (a smooth gain change, the waveform is never
bent); --mode clip is the louder v2 / v3 chain (compression + soft clip), which made the voice break at -12.5 LUFS."""
import json, subprocess, sys, re
import numpy as np
from scipy.signal import butter, sosfilt, resample

SR, FPS = 48000, 30
A = sys.argv[1:]
narr_in, cues_p, sfx_dir, out = A[0], A[1], A[2], A[3]
LUFS, SFX_DB, BED_DB, DUR, CREST, MODE = -14.5, 0.0, 0.0, None, 12.0, "limit"
i = 4
while i < len(A):
    if A[i] == "--lufs": LUFS = float(A[i + 1]); i += 2
    elif A[i] == "--sfx-db": SFX_DB = float(A[i + 1]); i += 2
    elif A[i] == "--dur": DUR = float(A[i + 1]); i += 2
    elif A[i] == "--bed-db": BED_DB = float(A[i + 1]); i += 2
    elif A[i] == "--mode": MODE = A[i + 1]; i += 2
    else: raise SystemExit("unknown option " + A[i])

def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)
def save(p, x):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "1", "-ar", str(SR), "-i", "-", "-c:a", "pcm_s24le", p], input=x.astype(np.float32).tobytes(), check=True)
def loud(p):
    """integrated loudness (LUFS) and true peak (dBTP) of a file"""
    e = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", p, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    s = e[e.rfind("Summary:"):]
    return float(re.search(r"I:\s+(-?[\d.]+) LUFS", s).group(1)), float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", s).group(1))
db = lambda x: 20 * np.log10(max(x, 1e-9))
HP150 = butter(2, 150, "hp", fs=SR, output="sos"); HP70 = butter(2, 70, "hp", fs=SR, output="sos")
def win_rms(x, ms):
    n = int(SR * ms / 1000); c = np.cumsum(np.concatenate([[0.0], x * x]))
    if len(x) <= n: return np.array([np.sqrt(c[-1] / max(1, len(x)))])
    return np.sqrt(np.maximum(0, c[n:] - c[:-n]) / n)

# ---------------------------------------------------------------- narration: narr_master.py (3:1 compression, gain, soft clip)
import os
tmp = out + "_tmp.wav"; narr_p = out + "_narr.wav"
NM = [sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), "narr_master.py"), narr_in, narr_p, "--lufs", str(LUFS)]
NM += ["--mode", "limit", "--ceil", "-2", "--rel", "60"] if MODE == "limit" else ["--mode", "clip", "--knee", "-6", "--ceil", "-3", "--comp", "acompressor=threshold=-18dB:ratio=3:attack=1:release=80:knee=6"]
r = subprocess.run(NM, check=True, capture_output=True, text=True)
print("narration:", r.stdout.strip())
I, tp = loud(narr_p)
narr = load(narr_p)
if DUR: narr = np.concatenate([narr, np.zeros(max(0, int(DUR * SR) - len(narr)))])[: int(DUR * SR)]
lv = win_rms(sosfilt(HP150, narr), 100)[:: SR // 20]; lv = lv[lv > 10 ** (-45 / 20)]
REF = db(np.percentile(lv, 90))
print(f"narration: {I:.1f} LUFS, peak {tp:.1f} dB; loud syllables (P90, 100 ms, >150 Hz) at {REF:.1f} dBFS")

# ---------------------------------------------------------------------------------------------------------- the effects
J = json.load(open(cues_p, encoding="utf8"))
clips = {}
for name, s in J["sounds"].items():
    x = load(f"{sfx_dir}/{s['file']}")
    if s.get("st"): x = resample(x, int(len(x) / 2 ** (s["st"] / 12)))            # the whole sound higher / lower
    if s.get("drive"): x = np.tanh(x / np.abs(x).max() * s["drive"])               # harmonics for a boom that sits under 150 Hz
    x = sosfilt(HP70, x)
    env = win_rms(x, 5); pk = env.max(); on = np.nonzero(env > pk * 10 ** (-40 / 20))[0]
    a, b = max(0, on[0] - int(0.004 * SR)), min(len(x), on[-1] + int(0.03 * SR))
    if s.get("from_s") is not None: a = int(s["from_s"] * SR)
    x = x[a:b]
    if s.get("max_s"): x = x[: int(s["max_s"] * SR)]
    if s.get("even"):   # a bed: flatten its swells with a slow gain that follows the clip's own envelope (at most 12 dB either way)
        n_ = int(s["even"] * SR); e_ = np.sqrt(np.convolve(x * x, np.ones(n_) / n_, "same")); e_ = np.maximum(e_, 1e-6)
        x = x * np.clip(np.median(e_) / e_, 10 ** (-12 / 20), 10 ** (12 / 20))
    if s.get("tame"):   # a bed made of sharp claps: round the spikes that stand more than "tame" dB over the clip's average (at most 3 dB more)
        r_ = np.sqrt((x * x).mean()); k_ = r_ * 10 ** (s["tame"] / 20); c_ = r_ * 10 ** ((s["tame"] + 3) / 20); a_ = np.abs(x); o_ = a_ > k_
        x = x.copy(); x[o_] = np.sign(x[o_]) * (k_ + (c_ - k_) * np.tanh((a_[o_] - k_) / (c_ - k_)))
    env = win_rms(x, 5); pk = env.max()
    anchor = {"start": 0, "peak": int(np.argmax(win_rms(x, 10))), "onset": int(np.nonzero(env > pk * 0.25)[0][0])}[s.get("anchor", "onset")]
    bed = bool(s.get("bed"))
    if bed: level = db(np.sqrt((sosfilt(HP150, x) ** 2).mean())); full = db(np.sqrt((x ** 2).mean()))     # a bed: its average
    else: level = db(win_rms(sosfilt(HP150, x), 50).max()); full = db(win_rms(x, 50).max())
    peak = db(np.abs(x).max()); crest = CREST + (8 if bed else 0)
    gain = REF + s["rel"] - level + (BED_DB if bed else 0)
    if full + gain > REF + s["rel"] + 8: gain = REF + s["rel"] + 8 - full        # a bass-heavy clip: do not let the lows run away
    if peak + gain > REF + s["rel"] + crest: gain = REF + s["rel"] + crest - peak  # a sharp hit: hold the peak back
    clips[name] = (x, anchor, gain)
    print(f"  {name:10s} {s['file']:22s} {len(x) / SR:5.2f} s  anchor {s.get('anchor', 'onset'):5s} at {anchor / SR * 1000:4.0f} ms  level {level:6.1f} dB (full band {full:6.1f}, peak {peak:6.1f})  gain {gain:+6.1f} dB -> {level + gain - REF:+.1f} dB vs narration (asked {s['rel']:+.0f}), peak {peak + gain:.1f} dBFS")
N = len(narr); stem = np.zeros(N)
rows = []
for c in J["cues"]:
    x, anchor, gain = clips[c["s"]]; s = J["sounds"][c["s"]]
    st = c.get("st", 0)
    if st: k = 2 ** (st / 12); x = resample(x, int(len(x) / k)); anchor = int(anchor / k)
    if c.get("off_s"): o_ = int(c["off_s"] * SR); x = x[o_:]; anchor = max(0, anchor - o_)        # start inside the clip (beds)
    if c.get("dur_f"): x = x[: anchor + int(c["dur_f"] / FPS * SR)]
    x = x.copy()
    fi = max(int(0.002 * SR), int(c.get("in_f", 0) / FPS * SR)); fo = max(int(s.get("tail_ms", 40) / 1000 * SR), int(c.get("out_f", 0) / FPS * SR))
    fi, fo = min(fi, len(x)), min(fo, len(x))
    x[:fi] *= np.linspace(0, 1, fi); x[-fo:] *= np.linspace(1, 0, fo)
    x *= 10 ** ((gain + c.get("db", 0) + SFX_DB) / 20)
    p = int(round(c["f"] / FPS * SR)) - anchor
    a, b = max(0, p), min(N, p + len(x))
    if b > a: stem[a:b] += x[a - p: b - p]
    rows.append((c["f"], c["s"], gain + c.get("db", 0) + SFX_DB, db(np.abs(x).max()), p / SR, (p + len(x)) / SR, c.get("note", ""), bool(s.get("bed")), db(np.sqrt((sosfilt(HP150, x) ** 2).mean()))))
save(out + "_sfx.wav", stem)
mix = narr + stem
if MODE == "limit":
    # for the moment an effect sits on top of a voice peak (the narration alone stops at -2 dBFS): the same look-ahead
    # limiter over the sum, ceiling -1.5 dBFS; a smooth dip of the whole mix, nothing is bent
    from scipy.signal import resample_poly
    def limit(x, ceil, ahead_ms=5, rel_ms=60):
        B = SR // 1000; up = np.abs(resample_poly(x, 4, 1))[: len(x) * 4]
        pk = np.maximum(up.reshape(-1, 4).max(1), 1e-9)
        m = len(pk) // B; need = np.minimum(1.0, ceil / np.concatenate([pk[: m * B].reshape(m, B).max(1), [pk[m * B:].max() if len(pk) > m * B else 1e-9]]))
        L = ahead_ms; pad = np.concatenate([need, np.ones(L)])
        ahead = np.min(np.stack([pad[j: j + len(need)] for j in range(L + 1)]), 0)
        g = np.empty_like(ahead); a = 1 - np.exp(-1 / rel_ms); cur = 1.0
        for j in range(len(ahead)):
            cur = min(ahead[j], cur + (1 - cur) * a); g[j] = cur
        g = np.convolve(np.concatenate([np.full(L - 1, g[0]), g]), np.ones(L) / L, "valid")
        gs = np.repeat(g, B)[: len(x)]
        gs = np.convolve(np.concatenate([np.full(B, gs[0]), gs, np.full(B, gs[-1])]), np.hanning(2 * B + 1) / np.hanning(2 * B + 1).sum(), "same")[B: B + len(x)]
        return x * gs, gs
    c = 10 ** (-1.5 / 20); mix, gs = limit(mix, c); mix = np.clip(mix, -c * 1.01, c * 1.01)
    save(out + "_mix.wav", mix)
    print(f"mix limiter: turned down by more than 0.5 dB during {100 * float((gs < 10 ** (-0.5 / 20)).mean()):.2f} % of the film, most {-20 * np.log10(gs.min()):.1f} dB")
else:
    # safety for the rare moment an effect sits on top of a voice peak (the narration alone stops at -3 dBFS): round off
    # above -3 dBFS, never above -2.7 dBFS
    k, c = 10 ** (-3 / 20), 10 ** (-2.7 / 20); a_ = np.abs(mix); o = a_ > k
    touched = float(o.mean()); mix[o] = np.sign(mix[o]) * (k + (c - k) * np.tanh((a_[o] - k) / (c - k)))
    save(out + "_mix.wav", mix)
    print(f"mix safety clip: {100 * touched:.3f} % of the samples")
for r in rows: print(f"  f{r[0]:<5d} {r[0] / FPS:6.2f} s  {r[1]:10s} peak {r[3]:6.1f} dBFS  plays {r[4]:6.2f}-{r[5]:6.2f} s  {r[6]}")
# how the effects sit against the voice: per cue, the effect's loudest 100 ms against the narration in the same half second
sf = sosfilt(HP150, stem); nf = sosfilt(HP150, narr); worst = []
for r in rows:
    a, b = max(0, int(r[4] * SR)), min(N, int(r[5] * SR))
    if b - a < 100: continue
    e = db(win_rms(sf[a:b], 50).max()); v = db(win_rms(nf[max(0, a - SR // 4): min(N, b + SR // 4)], 100).max())
    if v > -50: worst.append((e - v, r[0], r[1], e, v))
worst.sort(reverse=True)
print("effects against the voice next to them (dB, loudest first):", ", ".join(f"f{w[1]} {w[2]} {w[0]:+.0f}" for w in worst[:10]))
# the beds: their average against the average of the narration over the same stretch (speech-to-ambience ratio)
beds = []
for r in rows:
    if not r[7]: continue
    a, b = max(0, int(r[4] * SR)), min(N, int(r[5] * SR)); v = db(np.sqrt((nf[a:b] ** 2).mean())); e = db(np.sqrt((sf[a:b] ** 2).mean()))
    beds.append(f"f{r[0]} {r[1]} {r[5] - r[4]:.1f} s: voice {v - e:+.0f} dB over everything under it")
if beds: print("beds (how far the voice sits above the effects + ambience under it, averages above 150 Hz):\n  " + "\n  ".join(beds))
I2, tp2 = loud(out + "_mix.wav"); I3, tp3 = loud(out + "_sfx.wav")
print(f"mix: {I2:.1f} LUFS, peak {tp2:.1f} dB   (narration alone {I:.1f} LUFS; effects alone {I3:.1f} LUFS, peak {tp3:.1f} dB)  cues {len(rows)}")
