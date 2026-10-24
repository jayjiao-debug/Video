"""ep44 《你是爱因斯坦的大脑》 music bed (subtitle-only film, the bed is the whole soundtrack).

Song: episodes/41-sanqiannian/audio/bgm2.mp3 (バケモノの唄 instrumental). Never commit audio.
Grid (ep42 music_map): beat P=0.56605 s, part-1 downbeats T0+4P*n (T0=0.5688); after the 5-beat stop
bar the downbeats are 1.1348+4P*n (182.271, 184.535, 186.800, 189.064, DROP 191.327, ...).

Film layout (film seconds), every anchor below is measured back from the built file by measure44.py:
  A  0.000- 57.173  native. Intro bars 0,1,2 then a loop back to bar 1 (song 7.361 -> 2.833, chroma sim 1.000),
                    so the intro is 6 bars and the HIT (song 9.060) lands at 13.588 = title landing (cue a).
                    Song continues A -> B -> C to the end of the C turnaround bar 22 (song 52.645).
  B 57.173- 63.161  native. B-build bars 77-78 (song 174.912) -> stop bar 79 at 61.702: four 8th-note
                    ticks, the last at ~62.55 = D1 "the clock stops" (cue b). Ring tail, then silence.
  C 65.000-100.805  stretched x1.01193 (16 bars in 35.80 s). Lead-in bars 1-3 (first sound at 65.000 = D2),
                    valley bars 64-71 (song 145.478), L1 bars 42-46 (song 95.665): groove returns at ~89.6.
  D 100.805-136.805 stretched x1.00631 (bar 2.25 s). L1 bar 47 (rep 1 at 100.805), second C 48-55,
                    crash bar 72 (song 163.591) at 121.055 = rep 2, B-build 72-78 (rep 3 125.555, 127.805).
  E 136.805-164.5   native. Lead-in from bar 3 beat 2 (song 187.366): a 3-beat bar + bar 4 (the dip under
                    137.25), DROP (song 191.327) at 140.766 = F1 (cue d), drop bars 0-2, the song's own fall bar
                    (song 234.347) at 147.558 (quote), coda 149.822, coda splice 241.56 -> 244.62 at 154.771,
                    dead stop at 162.293, reverb ring, fade 163.5 -> 164.5 (cue e).
"""
import numpy as np, soundfile as sf, subprocess, json, os, sys
from scipy.signal import fftconvolve, lfilter

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
SONG = '/home/claude/video/episodes/41-sanqiannian/audio/bgm2.mp3'
P = 0.56605
T0 = 0.5688
BAR = 4 * P
FILM_LEN = 164.5


def B(k):            # part-1 song time of bar k downbeat
    return T0 + k * BAR


def load(path):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'],
                         capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


song = load(SONG)
S = lambda t: int(round(t * SR))


def cut(a, b):
    return song[S(a):S(b)].copy()


def eqp(n):
    r = np.linspace(0, 1, n)[:, None]
    return np.cos(r * np.pi / 2), np.sin(r * np.pi / 2)


def join(out, inc, xf, kind='eqp'):
    """Append inc to out; the last xf seconds of out overlap the first xf seconds of inc."""
    n = S(xf)
    if n == 0:
        return np.concatenate([out, inc])
    if kind == 'eqp':
        go, gi = eqp(n)
    else:
        r = np.linspace(0, 1, n)[:, None]; go, gi = 1 - r, r
    mid = out[-n:] * go + inc[:n] * gi
    return np.concatenate([out[:-n], mid, inc[n:]])


def stretch(x, tempo, tag):
    """Pitch-preserving time stretch with librubberband (ffmpeg). Measured latency 0 (xcorr), length = len/tempo."""
    fi, fo = os.path.join(HERE, f'_st_{tag}_in.wav'), os.path.join(HERE, f'_st_{tag}_out.wav')
    sf.write(fi, x, SR, subtype='FLOAT')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', fi, '-af',
                    f'rubberband=tempo={tempo:.7f}:transients=crisp:detector=compound:phase=laminar:'
                    'window=standard:pitchq=quality:channels=together', '-c:a', 'pcm_f32le', fo], check=True)
    y, _ = sf.read(fo, dtype='float32'); os.remove(fi); os.remove(fo)
    return y


def ir(sec, tau, seed, lp=0.35):
    """Stereo (decorrelated L/R) exponentially decaying noise IR, one-pole low-passed (darker tail)."""
    n = int(sec * SR); t = np.arange(n) / SR
    out = []
    for s in (seed, seed + 1):
        h = np.random.default_rng(s).standard_normal(n) * np.exp(-t / tau)
        h = lfilter([lp], [1, -(1 - lp)], h)
        out.append(h / np.sqrt((h ** 2).sum()))
    return np.stack(out, 1)


def reverb(x, h):
    return np.stack([fftconvolve(x[:, c], h[:, c]) for c in range(2)], 1).astype(np.float32)


# ------------------------------------------------------------------ anchors (film seconds)
HIT_FILM = 13.588                 # song 9.060 (B(2)+3P... beat 16), title landing, cue (a)
D2 = 65.000                       # first sound of the lead-in (song 182.266), cue (b)
REP1 = 100.805                    # L1 bar 47 downbeat (song 106.986), cue (c)
DIP = REP1 + 16 * 2.25            # 136.805, end of the B-build (stop-bar downbeat position)
LEAD_GRID0 = 182.271              # lead-in bar 1 downbeat (part-2 grid)
LEAD_FIRST = 182.266              # first audible sample of the lead-in
TICK_TAU = 0.50                   # D1 tick reverb decay (s, amplitude 1/e)
TICK_DB = -12.0                   # D1 tick reverb level
INHALE_DB = -9.0                  # D2 inhale level
HUNT_PRE_DB = -1.0                # groove return (89.6) -> rep-2 crash: one dB under, the hunt steps up on the crash
DROP_DB = +1.5                    # DROP bars 0-2 lifted: F1 is the biggest sustained moment
DROP_SONG = 191.327

out = {}

# ------------------------------------------------------------------ A: cold open + life story (native)
o = 4.528                                                       # film = song + o after the intro loop
a1 = cut(0.0, 7.361 + 0.060)                                    # intro bars 0,1,2 (+60 ms for the XF)
a2 = cut(2.833, B(23) + 0.015)                                   # bar 1 again -> ... C bar 22 end (52.645)
A = join(a1, a2, 0.060)                                          # equal-power 60 ms, centred before 7.361
assert abs(len(A) / SR - (B(23) + o + 0.015)) < 2e-3

# ------------------------------------------------------------------ B: B-build 77-78, stop bar, ring
b1 = cut(B(77), 180.90)                                          # ends in the song's own digital silence
AB = join(A, b1, 0.015)                                          # C22 -> B77 at film 57.173
t_stopbar = B(23) + o + 2 * BAR                                  # 57.173 + 2 bars = 61.702 stop-bar downbeat

# ------------------------------------------------------------------ C: lead-in 1-3, valley, L1 42-46 (x1.01193)
pre = LEAD_GRID0 - 181.900                                       # silent pre-roll so the first onset is clean
c = cut(181.900, 189.064 + 0.030)
c = join(c, cut(B(64) - 0.0, B(72) + 0.015), 0.030)              # lead-in bar 4 replaced by valley bar 64
c = join(c, cut(B(42), B(47) + 0.30), 0.015)                     # valley 71 -> L1 42 (groove returns)
C_native_bars = 16 * BAR                                         # lead-in bar1 downbeat -> L1 bar 47 downbeat
F_C = C_native_bars / (REP1 - (D2 + (LEAD_GRID0 - LEAD_FIRST)))  # 36.227 / 35.800
Cst = stretch(c, F_C, 'C')
C_start_film = D2 + (LEAD_GRID0 - LEAD_FIRST) - pre / F_C        # film time of the first sample of Cst

# ------------------------------------------------------------------ D: L1 47, C 48-55, crash + B-build 72-78 (x1.00631)
F_D = (9 * BAR + 7 * BAR) / (16 * 2.25)
d_pre = 0.30
d = cut(B(47) - d_pre, B(56) + 0.010)
d = join(d, cut(B(72) - 0.0, B(79) + 0.060), 0.010)              # C55 -> CRASH at rep 2
Dst = stretch(d, F_D, 'D')
D_start_film = REP1 - d_pre / F_D

# ------------------------------------------------------------------ E: dip, DROP, fall, coda, dead stop (native)
e = cut(187.366, DROP_SONG + 3 * BAR + 0.010)                     # 3-beat bar + bar 4 + DROP bars 0-2
e = join(e, cut(DROP_SONG + 19 * BAR, 241.60), 0.010)             # bar 2 -> the song's own fall bar 19
e = join(e, cut(244.58, 253.20), 0.080)                           # coda splice 241.56 -> 244.62 (XF centred; mel dist 2.99 vs 6.68 typical)
E_start_film = DIP

# ------------------------------------------------------------------ assemble on the film timeline
N = S(FILM_LEN)
mix = np.zeros((N + S(6), 2), np.float32)


def place(x, t0, fade_in=0.0, fade_out=0.0, gain=1.0):
    i = S(t0); x = x.copy() * gain
    if fade_in > 0:
        n = S(fade_in); x[:n] *= np.sin(np.linspace(0, 1, n) * np.pi / 2)[:, None]
    if fade_out > 0:
        n = S(fade_out); x[-n:] *= np.cos(np.linspace(0, 1, n) * np.pi / 2)[:, None]
    j = min(i + len(x), len(mix)); mix[i:j] += x[:j - i]


# A+B ends in digital silence (song 180.90 is silent); C starts in digital silence (181.90).
place(AB, 0.0)
# C -> D at rep 1: the same song audio (L1 bar 46 -> 47) stretched by two factors; linear 20 ms XF ending 2 ms
# after REP1, so the bar-47 downbeat comes from D.
xfCD = 0.020
tx = REP1 + 0.002; ts = tx - xfCD; n = S(xfCD)
cpart = Cst[:S(tx - C_start_film)].copy(); cpart[-n:] *= np.linspace(1, 0, n)[:, None]
place(cpart, C_start_film)
dpart = Dst[S(ts - D_start_film):S(DIP + 0.030 - D_start_film)].copy()
dpart[:n] *= np.linspace(0, 1, n)[:, None]
nd = S(0.030); dpart[-nd:] *= np.cos(np.linspace(0, 1, nd) * np.pi / 2)[:, None]   # D -> E: 30 ms eq-power
place(dpart, ts)
epart = e.copy(); epart[:nd] *= np.sin(np.linspace(0, 1, nd) * np.pi / 2)[:, None]
place(epart, DIP)

# ------------------------------------------------------------------ transitions / effects (all made from the song)
H1 = ir(2.5, 0.55, 7)
H2 = ir(4.0, 1.10, 11)
H3 = ir(2.0, 0.45, 21)
H4 = ir(2.0, TICK_TAU, 31)

# (1) Title rewind 12.75 -> 13.588: reversed reverb of the HIT's first 0.45 s, swelling into the hit.
hit = cut(9.040, 9.490)
rv = reverb(hit, H1)[::-1].copy()                                 # reversed: tail first, ends at the attack
L = S(13.588 - 12.75)
sw = rv[-L - S(0.45):-S(0.45)] if len(rv) > L + S(0.45) else rv
sw = sw[-L:]
sw *= (np.linspace(0, 1, len(sw)) ** 2)[:, None]
place(sw, 13.588 - len(sw) / SR, gain=10 ** (-11 / 20))

# (2) D1: the clock's ticks ring into the room, so the real near-silence after D1 stays under 1 s.
ticks = cut(179.420, 180.680)
place(reverb(ticks, H4), t_stopbar - 0.021, gain=10 ** (TICK_DB / 20))

# (3) D2 inhale: reversed reverb of the lead-in's first 0.6 s, ending exactly at 65.000.
li = cut(LEAD_FIRST, LEAD_FIRST + 0.60)
rv = reverb(li, H3)[::-1].copy()
inh = rv[-S(0.60) - S(0.55):-S(0.60)]
inh *= (np.linspace(0, 1, len(inh)) ** 2.5)[:, None]
place(inh, D2 - len(inh) / SR, gain=10 ** (INHALE_DB / 20))

# (4) Dip at 136.805: the B-build's last beat rings on under the filtered lead-in (no hard energy cliff).
lastbeat = cut(B(79) - P, B(79))
place(reverb(lastbeat, H1), DIP - 0.010, gain=10 ** (-12 / 20))

# (5) Dead stop rings out (song ends with a 20 ms cut), then the film fade 163.5 -> 164.5.
t_dead = DIP + (DROP_SONG + 3 * BAR - 187.366) + (241.52 - (DROP_SONG + 19 * BAR)) + (252.142 - 244.58)
last = cut(251.742, 252.142)
place(reverb(last, H2), t_dead - 0.40, gain=10 ** (-9 / 20))

mix = mix[:N]
t = np.arange(N) / SR
g = np.ones(N)
f0, f1 = 163.5, 164.5
w = np.clip((t - f0) / (f1 - f0), 0, 1); g *= np.cos(w * np.pi / 2) ** 1.5
# gain rides (steps hidden under transients: the D2 return from silence, the crash at rep 2, the DROP)
t_crash = REP1 + 9 * 2.25; t_drop = DIP + (DROP_SONG - 187.366); t_fall = t_drop + 3 * BAR
def ramp(a, b): return np.clip((t - a) / (b - a), 0, 1)
t_groove = C_start_film + ((189.064 - 181.9) + (B(72) - B(64))) / F_C      # valley 71 -> L1 42, drums re-enter (89.618)
gd = HUNT_PRE_DB * ((t >= t_groove - 0.004) & (t < t_crash - 0.004)) + HUNT_PRE_DB * (1 - ramp(t_crash - 0.004, t_crash + 0.004)) * ((t >= t_crash - 0.004) & (t < t_crash + 0.004))
gd += DROP_DB * ramp(t_drop - 0.010, t_drop + 0.002) * (1 - ramp(t_fall, t_fall + 2 * BAR))
g *= 10 ** (gd / 20)
mix *= g[:, None]

# ------------------------------------------------------------------ loudness: -14 LUFS integrated, TP <= -1.5 dBTP
import pyloudnorm as pyln
meter = pyln.Meter(SR)
lufs = meter.integrated_loudness(mix.astype(np.float64))
mix *= 10 ** ((-14.0 - lufs) / 20)


def true_peak(x):
    from scipy.signal import resample_poly
    return 20 * np.log10(np.abs(resample_poly(x, 4, 1, axis=0)).max())


tp = true_peak(mix)
tp_pre = tp
limited = False
if tp > -1.5:   # gentle look-ahead peak limiter (only if needed)
    limited = True
    ceiling = 10 ** (-1.7 / 20)
    from scipy.signal import resample_poly
    up = np.abs(resample_poly(mix, 4, 1, axis=0)).max(1)
    pk = np.maximum.reduceat(up, np.arange(0, len(up), 4))[:N]
    gr = np.minimum(1, ceiling / np.maximum(pk, 1e-9))
    la = S(0.003); rel = S(0.080)
    gmin = np.minimum.accumulate(gr[::-1])[::-1]
    from scipy.ndimage import minimum_filter1d
    gmin = minimum_filter1d(gr, size=2 * la + 1)
    sm = np.empty_like(gmin); acc = 1.0; a_rel = np.exp(-1 / rel)
    for i in range(len(gmin)):
        acc = gmin[i] if gmin[i] < acc else a_rel * acc + (1 - a_rel) * gmin[i]
        sm[i] = acc
    mix *= sm[:, None]
    gr_db = 20 * np.log10(sm.min()); gr_ms = (sm < 10 ** (-0.1 / 20)).sum() / SR * 1000
    mix *= 10 ** ((-14.0 - meter.integrated_loudness(mix.astype(np.float64))) / 20)
    tp = true_peak(mix)

assert len(mix) == S(FILM_LEN)
sf.write(os.path.join(HERE, 'ep44_bed_final.wav'), mix.astype(np.float32), SR, subtype='PCM_24')
info = dict(F_C=F_C, F_D=F_D, C_start_film=C_start_film, D_start_film=D_start_film, t_stopbar=t_stopbar,
            t_dead=t_dead, lufs_in=lufs, lufs_out=meter.integrated_loudness(mix.astype(np.float64)), tp=tp,
            limited=limited, tp_pre=tp_pre, gr_db=(gr_db if limited else 0.0), gr_ms_over_0p1dB=(gr_ms if limited else 0.0), dur=len(mix) / SR)
info = {k: (float(v) if isinstance(v, (np.floating, float, int)) and not isinstance(v, bool) else v) for k, v in info.items()}
json.dump(info, open(os.path.join(HERE, '_build_info.json'), 'w'), indent=1)
print(json.dumps(info, indent=1))
