#!/usr/bin/env python3
"""Hongmen film: narration + spot effects + ambience beds -> one mastered, LOOPING track.
An adapted copy of scripts/arthur/sound/sfx_mix.py + narr_master.py (same levelling, same limiter; numpy + ffmpeg only).

usage: mix.py <narration.wav> <beats.json> <cues.json> <clips dir> <out prefix>
              [--timing voice_timing.json] [--lufs -14.5] [--ceil -1.5] [--sfx-db 0] [--bed-db 0] [--guard 3] [--no-guard]
writes <out>.wav (the mix), <out>_narr.wav, <out>_sfx.wav, <out>_beds.wav (the three stems: they add up to the mix),
       <out>_48k.wav (the mix at 48 kHz, exactly the film's length there too: the file to mux),
       <out>_cues.txt (the cue table with resolved frames and levels), <out>_cues.json (the same as data), and prints the log.

What is different from the Arthur mixer
  * Cues are tied to NAMED beats (cuesheet.py resolves them from beats.json): no frame number is typed anywhere.
  * The film loops. Everything is placed on a RING as long as the film: a sound that runs over the last sample goes on
    at sample 0 (the privy bed is one stretch of one clip from BEAT.privyBack over the loop point to the first cut; an
    effect tail that would cross the end wraps the same way). Both limiters run round the ring too, so the gain at the
    last sample is the gain at the first.
  * The track keeps the narration's own sample rate and length to the sample; the narration is never padded, trimmed
    or moved: one gain, then the look-ahead limiter of the Arthur film (a smooth gain change, the waveform is not bent).
  * A bed may be longer than its clip: it is looped with an equal-power crossfade ("loop_x_s", default 0.6 s).
    A bed plays at ONE fixed gain for its whole stretch: nothing follows the voice (no pumping).
    "off_s" starts a bed INSIDE that loop (the whole clip still plays, from another place: the loop's period stays the
    clip's length; it used to cut the clip short first, which made a 2 s loop). The log says, for every bed stretch,
    how often its clip repeats.
  * "hp": 150 on a sound = high-pass it there when it is loaded (a fire whose energy sits under 150 Hz would otherwise be
    levelled by its crackle and come out several dB louder than the other beds on a full-range speaker).
  * "loop_at_s" on a cue that runs over the film's end: this point of the (trimmed) clip falls on the loop point, so
    the place where the film restarts is a chosen, even moment of the clip wherever the beats put the cue's start.
  * The word report: every narration character against everything under it (whole character, full band and 250-8000 Hz);
    <out>_words.txt lists the characters with less than 10 dB of margin and the cues that sound under them.
  * The word guard: every spot effect is compared with each narration character it sounds under (250 to 8000 Hz, where
    speech is understood): the effect's loudest 50 ms inside the character against that character's own level. If the
    voice is not at least --guard dB above it, the cue is turned down by the shortfall (one fixed gain per cue, at most
    12 dB) and the table says so. A cue with "guard": false is left alone (a hit placed in a pause).

cues.json
  "vars":   {"stamp": 3}                        named frame offsets
  "sounds": {"seal": {"file": "seal_2.mp3", "anchor": "onset" | "peak" | "start", "rel": -9, "max_s": 0.4,
                      "tail_ms": 60, "from_s": null, "st": 0, "drive": null,
                      "bed": true, "even": 0.8, "tame": 12, "loop_x_s": 0.6, "hp": null}}
     rel    = level against the narration's loud syllables (P90 of its 100 ms levels above 150 Hz): the effect's loudest
              50 ms above 150 Hz (a bed: its average). A sharp hit is held back by its peak (crest 12 dB), a bass-heavy
              clip by its full-band level, exactly as in the Arthur mixer.
     anchor = which point of the clip lands on the cue's frame: its onset (first sharp rise), loudest point, or start.
  "cues":   [{"s": "seal", "at": "HIT.title", "off": "stamp", "db": 0, "st": 0, "to": "SHOT_END.2a", "to_off": 0,
              "in_f": 0, "out_f": 2, "off_s": 0, "guard": true, "on": true, "note": "..."}]
     at / off / to / to_off: see cuesheet.py.  db, st = this cue's trim in dB and pitch in semitones.
     in_f / out_f = fades in frames;  off_s = start this far inside the clip (a bed: inside its loop);
     loop_at_s = (a cue that wraps) the clip's second that falls on the film's loop point.
A sound whose file is missing is skipped with a warning (the mix is still written)."""
import json, os, re, subprocess, sys
import numpy as np
sys.dont_write_bytecode = True      # no __pycache__ in the repo
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cuesheet

A = sys.argv[1:]
if len(A) < 5: raise SystemExit(__doc__)
narr_in, beats_p, cues_p, sfx_dir, out = A[:5]
LUFS, CEIL, SFX_DB, BED_DB, GUARD, TIMING, CREST = -14.5, -1.5, 0.0, 0.0, 3.0, None, 12.0
NARR_CEIL = -2.0
GB = (250, 8000)      # the word guard listens in this band
i = 5
while i < len(A):
    k = A[i]
    if k == "--lufs": LUFS = float(A[i + 1]); i += 2
    elif k == "--ceil": CEIL = float(A[i + 1]); i += 2
    elif k == "--sfx-db": SFX_DB = float(A[i + 1]); i += 2
    elif k == "--bed-db": BED_DB = float(A[i + 1]); i += 2
    elif k == "--guard": GUARD = float(A[i + 1]); i += 2
    elif k == "--no-guard": GUARD = None; i += 1
    elif k == "--timing": TIMING = A[i + 1]; i += 2
    else: raise SystemExit("unknown option " + k)

beats = json.load(open(beats_p, encoding="utf8")); sheet = json.load(open(cues_p, encoding="utf8"))
FPS, TOTAL = beats["fps"], beats["total"]
SR = int(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=sample_rate", "-of", "csv=p=0", narr_in], check=True, capture_output=True, text=True).stdout.strip())
if SR % FPS: raise SystemExit(f"the narration's rate {SR} is not a whole number of samples per frame")
FR = SR // FPS

def load(p, sr=None):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-f", "f32le", "-ac", "1"] + (["-ar", str(sr)] if sr else []) + ["-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)
def save(p, x, sr=None):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "1", "-ar", str(sr or SR), "-i", "-", "-c:a", "pcm_s24le", p], input=x.astype(np.float32).tobytes(), check=True)
def loud(p):
    """integrated loudness (LUFS) and true peak (dBTP) of a file"""
    e = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", p, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    s = e[e.rfind("Summary:"):]
    m1, m2 = re.search(r"I:\s+(-?[\d.]+) LUFS", s), re.search(r"Peak:\s+(-?[\d.]+) dBFS", s)
    return (float(m1.group(1)) if m1 else -99.0), (float(m2.group(1)) if m2 else -99.0)      # (a silent stem has no reading)
db = lambda v: 20 * np.log10(max(float(v), 1e-9))
def win_rms(x, ms):
    n = max(1, int(SR * ms / 1000)); c = np.cumsum(np.concatenate([[0.0], x * x]))
    if len(x) <= n: return np.array([np.sqrt(c[-1] / max(1, len(x)))])
    return np.sqrt(np.maximum(0, c[n:] - c[:-n]) / n)
rms = lambda x: float(np.sqrt((x * x).mean())) if len(x) else 0.0

# ---- filters in the frequency domain (2nd order Butterworth responses; no scipy). ring=True: the signal is a loop.
def _resp(f, lo=None, hi=None):
    H = np.ones(len(f), dtype=complex)
    if lo: s = 1j * f / lo; H *= s * s / (s * s + np.sqrt(2) * s + 1)
    if hi: s = 1j * f / hi; H *= 1 / (s * s + np.sqrt(2) * s + 1)
    return H
def filt(x, lo=None, hi=None, ring=False):
    if not len(x): return x
    n = len(x) if ring else 1 << (len(x) + SR // 4 - 1).bit_length()
    if ring:   # a prime factor makes numpy's FFT slow: filter a padded copy that carries the wrap on both sides
        P = SR // 2; y = np.concatenate([x[-P:], x, x[:P]]); m = 1 << (len(y) - 1).bit_length()
        return np.fft.irfft(np.fft.rfft(y, m) * _resp(np.fft.rfftfreq(m, 1 / SR), lo, hi), m)[P: P + len(x)]
    return np.fft.irfft(np.fft.rfft(x, n) * _resp(np.fft.rfftfreq(n, 1 / SR), lo, hi), n)[: len(x)]
def resample(x, m):
    """x at a new length m (Fourier method: pitch and speed change together)"""
    if m == len(x) or len(x) < 2 or m < 2: return x
    X = np.fft.rfft(x); Y = np.zeros(m // 2 + 1, dtype=complex); k = min(len(X), len(Y)); Y[:k] = X[:k]
    return np.fft.irfft(Y, m) * (m / len(x))
_n = np.arange(-32, 33); _H4 = np.sinc(_n / 4) * np.kaiser(65, 8.0)
def over4(x):
    """4 x oversampled copy: the peaks between the samples"""
    up = np.zeros(len(x) * 4); up[::4] = x
    return np.convolve(up, _H4, "same")
def block_peaks(x, ring=True):
    """the 4 x oversampled peak of every 1 ms block of x (ring: with one second of the loop's other end on each side)"""
    P = SR if ring else 0
    xx = np.concatenate([x[-P:], x, x[:P]]) if ring else x
    B = int(round(SR / 1000)); m = -(-len(xx) // B)
    pk = np.abs(over4(xx)).reshape(-1, 4).max(1)
    return np.concatenate([pk, np.zeros(m * B - len(pk))]).reshape(m, B).max(1), len(xx), P
def limiter(x, ceil, ahead_ms=5, rel_ms=60, ring=True, peaks=None, scale=1.0):
    """the Arthur film's look-ahead peak limiter on a 1 ms control grid: the gain is down before the peak arrives and
    comes back slowly. Returns the gain curve (1 = untouched). ring: the signal is a loop (the limiter's state is
    carried round the loop point, so the gain on the last sample is the gain on the first).
    peaks = block_peaks(x) computed before, for x * scale (the narration's gain search)."""
    pk, n, P = peaks if peaks is not None else block_peaks(x, ring)
    B = int(round(SR / 1000)); m = len(pk)
    need = np.minimum(1.0, ceil / np.maximum(pk * scale, 1e-9))
    need = np.minimum(need, np.minimum(np.concatenate([need[1:], [1.0]]), np.concatenate([[1.0], need[:-1]])))   # the smoothing below spans one block either side
    L = ahead_ms; pad = np.concatenate([need, np.ones(L)])
    ahead = np.min(np.stack([pad[j: j + m] for j in range(L + 1)]), 0)
    g = np.empty(m); a = 1 - np.exp(-1 / rel_ms); cur = 1.0
    for j in range(m):
        cur = min(ahead[j], cur + (1 - cur) * a); g[j] = cur
    g = np.convolve(np.concatenate([np.full(L - 1, g[0]), g]), np.ones(L) / L, "valid")
    gs = np.repeat(g, B)[:n]
    w = np.hanning(2 * B + 1); w /= w.sum()
    gs = np.convolve(np.concatenate([np.full(B, gs[0]), gs, np.full(B, gs[-1])]), w, "same")[B: B + n]
    return gs[P: P + len(x)]

# ------------------------------------------------------------------------------------------------------ the narration
x0 = load(narr_in); N = len(x0)
if N != TOTAL * FR: raise SystemExit(f"the narration is {N} samples, the film is {TOTAL} frames = {TOTAL * FR} samples at {SR} Hz: they must be equal")
tmp = out + "_tmp.wav"
save(tmp, x0); I0, tp0 = loud(tmp)
g = LUFS - I0; c = 10 ** (NARR_CEIL / 20)
pk0 = block_peaks(x0)
for it in range(8):
    gs = limiter(x0, c, peaks=pk0, scale=10 ** (g / 20)); narr = x0 * 10 ** (g / 20) * gs
    save(tmp, narr); I, tp = loud(tmp)
    if abs(I - LUFS) < 0.05: break
    g += LUFS - I
n50 = int(0.05 * SR); mm = N // n50; P_ = (x0[: mm * n50].reshape(mm, n50) ** 2).mean(1); act = P_ > P_.max() * 10 ** (-40 / 10)
gr = -20 * np.log10(gs[: mm * n50].reshape(mm, n50).min(1))[act]
print(f"narration: in {I0:.1f} LUFS / TP {tp0:.1f}  ->  {I:.1f} LUFS / TP {tp:.1f}: gain {g:+.2f} dB, then the limiter at {NARR_CEIL} dBFS: turned down by more than 1 dB in {100 * (gr > 1).mean():.1f} % of the 50 ms windows with speech, more than 3 dB in {100 * (gr > 3).mean():.1f} %, most {gr.max():.1f} dB. Length {N} samples at {SR} Hz, no sample moved.")
NARR_GAIN = g
lv = win_rms(filt(narr, lo=150, ring=True), 100)[:: SR // 20]; lv = lv[lv > 10 ** (-45 / 20)]
REF = db(np.percentile(lv, 90))
print(f"narration: loud syllables (P90 of the 100 ms levels above 150 Hz) at {REF:.1f} dBFS")
nb = filt(narr, lo=GB[0], hi=GB[1], ring=True)             # the band in which speech is understood (vowels and the hiss of s / sh / x)
# the narration's characters (for the word guard and the table)
WORDS = []
if TIMING and os.path.exists(TIMING):
    for ln in json.load(open(TIMING, encoding="utf8"))["lines"]:
        for w in ln.get("words", []): WORDS.append((w[0], int(w[1] * SR), int(w[2] * SR), ln["line"]))
else:
    print("no --timing: the word guard uses the caption groups instead of the characters")
    for cp in beats["captions"]: WORDS.append((cp["text"].replace("【", "").replace("】", ""), cp["from"] * FR, (cp["end"] + 1) * FR, cp["line"]))

# -------------------------------------------------------------------------------------------------------- the sounds
clips, missing = {}, []
print("sounds:")
for name, s in sheet["sounds"].items():
    p = os.path.join(sfx_dir, s["file"])
    if not os.path.exists(p):
        missing.append(name); print(f"  {name:9s} {s['file']:22s} MISSING: its cues are skipped"); continue
    x = load(p, SR)
    if s.get("st"): x = resample(x, int(len(x) / 2 ** (s["st"] / 12)))
    if s.get("drive"): x = np.tanh(x / np.abs(x).max() * s["drive"])               # harmonics for a boom that sits under 150 Hz
    x = filt(x, lo=max(70, s.get("hp") or 0))
    env = win_rms(x, 5); pk = env.max(); on = np.nonzero(env > pk * 10 ** (-40 / 20))[0]
    a, b = max(0, on[0] - int(0.004 * SR)), min(len(x), on[-1] + int(0.03 * SR))
    if s.get("from_s") is not None: a = int(s["from_s"] * SR)
    x = x[a:b]
    if s.get("max_s"): x = x[: int(s["max_s"] * SR)]
    if s.get("even"):   # a bed: flatten its swells with a slow gain that follows the clip's own envelope (at most 12 dB either way)
        n_ = int(s["even"] * SR); c_ = np.cumsum(np.concatenate([np.zeros(n_ // 2 + 1), x * x, np.zeros(n_ - n_ // 2)]))
        e_ = np.maximum(np.sqrt(np.maximum(0, c_[n_:n_ + len(x)] - c_[:len(x)]) / n_), 1e-6)       # the level over "even" seconds round each sample
        x = x * np.clip(np.median(e_) / e_, 10 ** (-12 / 20), 10 ** (12 / 20))
    if s.get("tame"):   # round the spikes that stand more than "tame" dB over the clip's average (at most 3 dB more)
        r_ = rms(x); k_ = r_ * 10 ** (s["tame"] / 20); c_ = r_ * 10 ** ((s["tame"] + 3) / 20); a_ = np.abs(x); o_ = a_ > k_
        x = x.copy(); x[o_] = np.sign(x[o_]) * (k_ + (c_ - k_) * np.tanh((a_[o_] - k_) / (c_ - k_)))
    env = win_rms(x, 5); pk = env.max()
    anchor = {"start": 0, "peak": int(np.argmax(win_rms(x, 10))), "onset": int(np.nonzero(env > pk * 0.25)[0][0])}[s.get("anchor", "onset")]
    bed = bool(s.get("bed")); xh = filt(x, lo=150)
    if bed: level = db(rms(xh)); full = db(rms(x))
    else: level = db(win_rms(xh, 50).max()); full = db(win_rms(x, 50).max())
    peak = db(np.abs(x).max()); crest = CREST + (8 if bed else 0)
    gain = REF + s["rel"] - level + (BED_DB if bed else 0)
    if full + gain > REF + s["rel"] + 8: gain = REF + s["rel"] + 8 - full        # a bass-heavy clip: do not let the lows run away
    if peak + gain > REF + s["rel"] + crest: gain = REF + s["rel"] + crest - peak  # a sharp hit: hold the peak back
    clips[name] = (x, anchor, gain)
    print(f"  {name:9s} {s['file']:22s} {len(x) / SR:5.2f} s  anchor {s.get('anchor', 'onset'):5s} at {anchor / SR * 1000:4.0f} ms  level {level:6.1f} dB (full band {full:6.1f}, peak {peak:6.1f})  gain {gain:+6.1f} dB -> {level + gain - REF:+.1f} dB vs narration (asked {s['rel']:+.0f}), peak {peak + gain:.1f} dBFS")

def tile(x, need, xf, start=0):
    """a bed longer than its clip: loop it with equal-power crossfades of xf samples; `start` = begin this far inside
    the loop (the clip is not cut short: the loop's period stays len(x) - xf). Returns (samples, repeats)."""
    if start + need <= len(x): return x[start: start + need], 1.0
    xf = max(2, min(xf, len(x) // 3)); t = np.linspace(0, np.pi / 2, xf); o = x.copy()
    while len(o) < start + need:
        o = np.concatenate([o[:-xf], o[-xf:] * np.cos(t) + x[:xf] * np.sin(t), x[xf:]])
    return o[start: start + need], need / (len(x) - xf)
def ring_add(buf, x, p):
    """add x into the ring buf with x[0] at sample p (p may be negative or past the end: it wraps)"""
    if len(x) > len(buf): raise SystemExit("a cue is longer than the film")
    p %= len(buf); k = min(len(x), len(buf) - p)
    buf[p: p + k] += x[:k]
    if k < len(x): buf[: len(x) - k] += x[k:]
def ring_get(buf, p, n):
    p %= len(buf); k = min(n, len(buf) - p)
    return np.concatenate([buf[p: p + k], buf[: n - k]]) if k < n else buf[p: p + n]

# ---------------------------------------------------------------------------------------------------------- the cues
sfx = np.zeros(N); beds = np.zeros(N); rows = []; skipped = []; WRAPS = []
for cu in cuesheet.resolve(beats, sheet):
    if cu["s"] in missing: skipped.append(cu); continue
    x, anchor, gain = clips[cu["s"]]; s = sheet["sounds"][cu["s"]]; bed = bool(s.get("bed"))
    st = cu.get("st", 0)
    if st: k = 2 ** (st / 12); x = resample(x, int(len(x) / k)); anchor = int(anchor / k)
    o_ = int(cu.get("off_s", 0) * SR); reps = 1.0; xfs = int(s.get("loop_x_s", 0.6) * SR)
    if cu.get("dur_f"):
        need = anchor + int(cu["dur_f"] * FR)
        if bed:
            per = max(1, len(x) - max(2, min(xfs, len(x) // 3)))
            if cu.get("loop_at_s") is not None and cu.get("wrap"):   # this point of the clip on the film's loop point
                o_ = int(cu["loop_at_s"] * SR) - (N - int(round(cu["f"] * FR)) % N)
            o_ %= per if o_ + need > len(x) or o_ < 0 else max(1, len(x))
            x, reps = tile(x, need, xfs, o_)
        else: x = x[o_: o_ + need]; anchor = max(0, anchor - o_)
    elif o_: o_ %= max(1, len(x)); x = x[o_:]; anchor = max(0, anchor - o_)
    x = x.copy()
    fi = max(int(0.002 * SR), int(cu.get("in_f", 0) * FR)); fo = max(int(s.get("tail_ms", 40) / 1000 * SR), int(cu.get("out_f", 0) * FR))
    fi, fo = min(fi, len(x)), min(fo, len(x))
    x[:fi] *= np.linspace(0, 1, fi); x[-fo:] *= np.linspace(1, 0, fo)
    gdb = gain + cu.get("db", 0) + SFX_DB
    x *= 10 ** (gdb / 20)
    p = int(round(cu["f"] * FR)) - anchor
    # the word guard: this effect against every character it sounds under
    worst, wword, cut = None, "", 0.0
    xb = filt(x, lo=GB[0], hi=GB[1])
    under = []
    for (ch, a, b, ln) in WORDS:
        for sh in (0, N, -N):                                    # the cue may wrap round the loop point
            lo_, hi_ = max(a + sh, p), min(b + sh, p + len(x))
            if hi_ - lo_ < int(0.02 * SR): continue
            v = db(rms(nb[lo_ - sh: hi_ - sh]))                 # the character's own level over the stretch they share
            seg = xb[lo_ - p: hi_ - p]; e = db(win_rms(seg, 50).max())
            under.append((v - e, ch, ln))
    if under:
        m_ = min(under); worst, wword = m_[0], f"{m_[1]}(L{m_[2]})"
    if not bed and GUARD is not None and cu.get("guard", True) is not False and worst is not None:
        thr = cu["guard"] if isinstance(cu.get("guard"), (int, float)) and not isinstance(cu.get("guard"), bool) else GUARD
        if worst < thr:
            cut = min(12.0, thr - worst); x *= 10 ** (-cut / 20); gdb -= cut; worst += cut
    ring_add(beds if bed else sfx, x, p)
    wraps = p < 0 or p + len(x) > N
    if wraps:   # the proof of the loop: the clip's sample k is the film's last sample, k + 1 is the film's first
        k_ = (N - 1 - p) % N
        WRAPS.append((cu["s"], f"{cu['s']} ({s['file']}) runs over the loop point as ONE stretch: its sample {k_} is the film's last sample, its sample {k_ + 1} the film's first ({k_ / SR:.3f} s into a {len(x) / SR:.3f} s stretch; fades only at its two ends, {fi / SR * 1000:.0f} ms in and {fo / SR * 1000:.0f} ms out)"))
    rows.append(dict(i=cu["i"], f=cu["f"], s=cu["s"], file=s["file"], ref=cu["ref"], ref_to=cu.get("ref_to"), f_to=cu.get("f_to"), bed=bed, gain_db=round(gdb, 1),
                     peak_db=round(db(np.abs(x).max()), 1), level_db=round(db(rms(filt(x, lo=150))) if bed else db(win_rms(filt(x, lo=150), 50).max()), 1),
                     from_s=round(p / SR, 3), to_s=round((p + len(x)) / SR, 3), wraps=bool(wraps), words="".join(dict.fromkeys(u[1] for u in under))[:14],
                     voice_over_db=None if worst is None else round(worst, 1), worst_word=wword, guard_cut_db=round(cut, 1), note=cu.get("note", ""),
                     clip_from_s=round(o_ / SR, 2) if bed else None, repeats=round(reps, 2) if bed else None, clip_s=round(len(clips[cu["s"]][0]) / SR, 2)))

# ------------------------------------------------------------------------------------------------------------ the bus
total = narr + sfx + beds
cc = 10 ** (CEIL / 20)
gb = limiter(total, cc)
mix = total * gb
over = int((np.abs(over4(mix)) > cc * 1.02).sum())
stems = {"": mix, "_narr": narr * gb, "_sfx": sfx * gb, "_beds": beds * gb}
for k, v in stems.items(): save(out + k + ".wav", v)
# the same mix at 48 kHz for the mux (AAC in an mp4 is 48 kHz): resampled round the loop (Fourier, periodic), so it is
# exactly the film's length at 48 kHz too (1600 samples a frame) and its last sample still runs into its first
if SR != 48000:
    m48 = TOTAL * 48000 // FPS; X_ = np.fft.rfft(mix); Y_ = np.zeros(m48 // 2 + 1, dtype=complex); k_ = min(len(X_), len(Y_)); Y_[:k_] = X_[:k_]
    save(out + "_48k.wav", np.fft.irfft(Y_, m48) * (m48 / N), 48000)
os.remove(tmp)
print(f"mix bus limiter at {CEIL} dBFS: turned down by more than 0.5 dB during {100 * float((gb < 10 ** (-0.5 / 20)).mean()):.2f} % of the film, most {-20 * np.log10(gb.min()):.1f} dB; samples over the ceiling after it (4 x oversampled): {over}")

# ---------------------------------------------------------------------------------------------------------- the report
rows.sort(key=lambda r: (r["from_s"] if not r["wraps"] else r["from_s"] + (0 if r["from_s"] >= 0 else N / SR), r["i"]))
lines = [f"{'frame':>5} {'sec':>6} {'sound':8} {'file':24} {'tied to':22} {'gain':>6} {'peak':>6} {'level':>6} {'plays (s)':>15} {'voice over it':>13} {'guard':>6}  note"]
for r in sorted(rows, key=lambda r: (r["f"], r["i"])):
    span = f"{r['from_s'] % (N / SR):6.2f}-{r['to_s'] % (N / SR) if r['wraps'] else r['to_s']:6.2f}" + ("*" if r["wraps"] else " ")
    vo = "      (pause)" if r["voice_over_db"] is None else f"{r['voice_over_db']:+5.1f} {r['worst_word']:>7}"
    until = f" -> {r['ref_to']} (f{r['f_to']})" if r["ref_to"] else ""
    lines.append(f"{r['f']:5d} {r['f'] / FPS:6.2f} {r['s']:8} {r['file']:24} {r['ref']:22} {r['gain_db']:+6.1f} {r['peak_db']:6.1f} {r['level_db']:6.1f} {span:>15} {vo:>13} {('-%.1f' % r['guard_cut_db']) if r['guard_cut_db'] else '':>6}  {'[bed] ' if r['bed'] else ''}{r['note']}{until}")
legend = ("frame = the film frame the sound's anchor lands on (resolved from the beat it is tied to); gain = dB applied to the clip; peak = its sample peak in the mix (dBFS, before the bus limiter); "
          "level = its loudest 50 ms above 150 Hz (a bed: its average); plays = seconds in the film (* = runs over the loop point and on from 0); "
          "voice over it = the smallest margin, in dB, of a narration character (250-8000 Hz) over the effect's loudest 50 ms inside that character, and which character; "
          "guard = dB the word guard turned this cue down to keep that margin.")
open(out + "_cues.txt", "w", encoding="utf8").write("\n".join(lines) + "\n\n" + legend + "\n")
json.dump({"fps": FPS, "frames": TOTAL, "sample_rate": SR, "samples": N, "lufs_target": LUFS, "narration_gain_db": round(NARR_GAIN, 2), "ref_dbfs": round(REF, 1), "cues": sorted(rows, key=lambda r: (r["f"], r["i"])),
           "skipped": [{"s": c["s"], "at": c["ref"], "f": c["f"]} for c in skipped]}, open(out + "_cues.json", "w", encoding="utf8"), ensure_ascii=False, indent=1)
print("\n".join(lines))
if skipped: print("SKIPPED (clip missing): " + ", ".join(f"{c['s']} at {c['ref']}" for c in skipped))

nf = filt(narr, lo=150, ring=True); sf = filt(sfx + beds, lo=150, ring=True)
bl = []
for r in rows:
    if not r["bed"]: continue
    n_ = int((r["to_s"] - r["from_s"]) * SR); p_ = int(r["from_s"] * SR)
    v = db(rms(ring_get(nf, p_, n_))); e = db(rms(ring_get(sf, p_, n_)))
    lp = "plays once, no loop" if r["repeats"] <= 1 else f"its {r['clip_s']:.1f} s clip LOOPS: {r['repeats']:.1f} times round"
    bl.append(f"f{r['f']} {r['s']} {n_ / SR:.1f} s ({r['file']} from {r['clip_from_s']:.1f} s; {lp}): voice {v - e:+.0f} dB over everything under it; bed alone {db(rms(ring_get(beds, p_, n_))):.1f} dBFS full band")
if bl: print("beds (how far the voice sits above the effects + ambience under it, averages above 150 Hz):\n  " + "\n  ".join(bl))
cuts = [r for r in rows if r["guard_cut_db"]]
print(f"word guard ({GUARD} dB): {len(cuts)} cue(s) turned down" + (": " + ", ".join(f"f{r['f']} {r['s']} -{r['guard_cut_db']}" for r in cuts) if cuts else ""))

# the word report: every narration character against everything that sounds under it (the checker's measure: the whole
# character's level, full band; beside it the same in 250-8000 Hz, where speech is understood)
under_all = sfx + beds; eb = filt(under_all, lo=GB[0], hi=GB[1], ring=True); WL = []
T_ = N / SR
def _cues_at(a, b):
    o = []
    for r in rows:
        f0, f1 = r["from_s"] * SR, r["to_s"] * SR
        if any(min(b, f1 + k) - max(a, f0 + k) > 0.02 * SR for k in (0, N, -N)): o.append(r["s"] + ("(bed)" if r["bed"] else ""))
    return list(dict.fromkeys(o))
for (ch, a, b, ln) in WORDS:
    a, b = max(0, a), min(N, b)
    if b - a < int(0.02 * SR): continue
    u = rms(under_all[a:b])
    if u < 1e-7: continue
    WL.append((db(rms(narr[a:b])) - db(u), db(rms(nb[a:b])) - db(max(rms(eb[a:b]), 1e-9)), ch, ln, a / SR, _cues_at(a, b)))
low = sorted([w for w in WL if w[0] < 10], key=lambda w: w[4])
wl = [f"{len(WORDS)} narration characters; {len(WL)} have a sound under them; {len(low)} have it less than 10 dB under the voice over the whole character (full band); "
      f"{sum(1 for w in WL if w[0] < 6)} less than 6 dB; {sum(1 for w in WL if w[0] < 0)} have it louder than the voice.",
      f"{'char':4} {'line':>4} {'at s':>7} {'full band':>10} {'250-8000':>9}  under it"]
for w in low: wl.append(f"{w[2]:4} {w[3]:4d} {w[4]:7.2f} {w[0]:+10.1f} {w[1]:+9.1f}  {', '.join(w[5])}")
onlybed = [w for w in low if w[5] and all(c.endswith('(bed)') for c in w[5])]
wl.append(f"of these, {len(onlybed)} have only a bed under them: " + " ".join(f"{w[2]}{w[0]:+.1f}" for w in onlybed))
open(out + "_words.txt", "w", encoding="utf8").write("\n".join(wl) + "\n")
print("words under sound (whole character, voice against effects + beds):\n  " + "\n  ".join(wl))

# the loop: the last sample runs into the first
def joint(name, v):
    d = np.abs(np.diff(np.concatenate([v[-2205:], v[:2205]])))
    step = abs(v[0] - v[-1]); typ = max(float(np.percentile(d, 99)), 1e-9)
    w = int(0.1 * SR); r = np.concatenate([v[-10 * w:], v[: 10 * w]]).reshape(20, w); l_ = 20 * np.log10(np.maximum(np.sqrt((r * r).mean(1)), 1e-9))
    st = np.abs(np.diff(l_)); here = st[9]; other = np.delete(st, 9)
    click = "no click" if (step <= typ * 1.5 or step < 10 ** (-70 / 20)) else "CHECK: a step at the joint"
    return (f"  {name:5s} level, last 100 ms {l_[9]:6.1f} dBFS -> first 100 ms {l_[10]:6.1f} dBFS: {l_[10] - l_[9]:+5.1f} dB (between neighbouring 100 ms in the second before and after: median {np.median(other):.1f}, largest {other.max():.1f} dB); "
            f"sample step over the joint {db(step):6.1f} dBFS (largest sample steps within 50 ms of it: {db(typ):6.1f} dBFS) -> {click}")
print("the loop point (last sample -> first sample):")
for k, v in (("mix", mix), ("narr", stems["_narr"]), ("sfx", stems["_sfx"]), ("beds", stems["_beds"])): print(joint(k, v))
for r, chk in WRAPS: print("  " + chk)
print(f"  both limiters ran round the loop: narration gain last sample {20 * np.log10(gs[-1]):+.3f} dB, first {20 * np.log10(gs[0]):+.3f} dB; bus gain last {20 * np.log10(gb[-1]):+.3f} dB, first {20 * np.log10(gb[0]):+.3f} dB")
I2, tp2 = loud(out + ".wav"); I3, tp3 = loud(out + "_sfx.wav"); I4, tp4 = loud(out + "_beds.wav")
n_out = int(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=duration_ts", "-of", "csv=p=0", out + ".wav"], capture_output=True, text=True).stdout.strip())
print(f"mix: {I2:.1f} LUFS (mono reading; the same sound as a stereo file reads 3 LU higher), true peak {tp2:.1f} dBFS; {n_out} samples at {SR} Hz = {n_out / SR:.4f} s = {n_out / FR:g} frames   (narration alone {I:.1f} LUFS; effects alone {I3:.1f} LUFS, peak {tp3:.1f}; beds alone {I4:.1f} LUFS, peak {tp4:.1f})  cues {len(rows)}")
if n_out != N: raise SystemExit("the mix is not as long as the narration")
