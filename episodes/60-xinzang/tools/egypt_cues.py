"""ep60 《死后称心脏》 cue library: everything in D Hijaz (D Eb F# G A Bb C, C# as leading tone), synthesised in code
(no samples, no licence), so any two cues can cross on a bar line without a key clash.

    python3 egypt_cues.py OUTDIR [cue ...]      cues: groove mystic tension playful paradise stings  (default: all)

Writes OUTDIR/<cue>.wav (first pass + ending button + tail), <cue>_loop.wav (exactly N bars, sample-exact loop),
<cue>_end.wav (the ending bar + tail, appended after any loop pass), stings, and cues.json (tempo, bar grid, hits,
loudness). 48 kHz stereo 24-bit, each cue normalised to -14 LUFS integrated, true peak <= -1.5 dBTP.

Tempi share one grid: groove 104 (24 bars), mystic 69.33 = 2/3 x 104 (16 bars), tension and paradise 78 = 3/4 x 104
(18/16 bars). groove, mystic and tension all last 55.385 s; downbeats coincide groove/mystic every 6.923 s (3:2 bars),
groove/tension+paradise every 9.231 s (4:3 bars), all of them every 27.69 s; every groove bar line is also a tension
beat. playful 112 (stands alone: cut it in on its own downbeat).

Instruments (measured against the two liked code-synth clips, ref60b/v1+v2): Karplus-Strong strings with a
fractional-delay allpass (in tune), a paired oud course through a modal body; additive mizmar/ney with formants,
scoops, turns, delayed vibrato and pitched breath; darbuka dum settling at ~64 Hz (the reference's low peak), tek
with ring modes (tamed at 2.5 kHz), bendir, riq, zills, sistrum; stereo decorrelated rooms (the references are wide:
side/mid -3...-4 dB). Humanised: per-bar seeded timing jitter, velocity and a slight lilt on off-beat eighths.
"""
import os, sys, json, zlib, numpy as np, soundfile as sf
from scipy import signal

SR = 48000
NOTE = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8,
        'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}
def midi(n): return n if isinstance(n, (int, np.integer)) else NOTE[n[:-1]] + 12 * (int(n[-1]) + 1)
def hz(n): return 440.0 * 2 ** ((midi(n) - 69) / 12) if not isinstance(n, float) else n
HIJAZ_PC = [2, 3, 6, 7, 9, 10, 0]
SCALE = [m for m in range(24, 110) if m % 12 in HIJAZ_PC]
def step(n, k):   # k scale steps up/down in D Hijaz
    m = midi(n); i = min(range(len(SCALE)), key=lambda j: abs(SCALE[j] - m)); return SCALE[i + k]

# ------------------------------------------------------------------ dsp helpers
def sos_lp(f, o=2): return signal.butter(o, f, 'low', fs=SR, output='sos')
def sos_hp(f, o=2): return signal.butter(o, f, 'high', fs=SR, output='sos')
def sos_bp(lo, hi, o=2): return signal.butter(o, [lo, hi], 'band', fs=SR, output='sos')
def filt(sos, x): return signal.sosfilt(sos, x, axis=0)
def peak_eq(x, f, gain_db, q=1.0):   # RBJ peaking biquad
    A = 10 ** (gain_db / 40); w = 2 * np.pi * f / SR; al = np.sin(w) / (2 * q)
    b = [1 + al * A, -2 * np.cos(w), 1 - al * A]; a = [1 + al / A, -2 * np.cos(w), 1 - al / A]
    return signal.lfilter(b, a, x, axis=0)
def shelf(x, f, gain_db, high=True):
    A = 10 ** (gain_db / 40); w = 2 * np.pi * f / SR; al = np.sin(w) / 2 * np.sqrt(2); c = np.cos(w); s = 2 * np.sqrt(A) * al
    if high:
        b = [A * ((A + 1) + (A - 1) * c + s), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - s)]
        a = [(A + 1) - (A - 1) * c + s, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - s]
    else:
        b = [A * ((A + 1) - (A - 1) * c + s), 2 * A * ((A - 1) - (A + 1) * c), A * ((A + 1) - (A - 1) * c - s)]
        a = [(A + 1) + (A - 1) * c + s, -2 * ((A - 1) + (A + 1) * c), (A + 1) + (A - 1) * c - s]
    return signal.lfilter(b, a, x, axis=0)
def env_ad(n, a, d):
    t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def modes(n, spec, rng=None):   # sum of decaying sinusoids: [(f, amp, tau)]
    t = np.arange(n) / SR; s = np.zeros(n)
    for f, a, tau in spec:
        ph = rng.random() * 6.283 if rng is not None else 0.0
        s += a * np.sin(2 * np.pi * f * t + ph) * np.exp(-t / tau)
    return s
def fade_edges(x, a=0.002, r=0.01):
    n = len(x); ia, ir = min(n, int(a * SR)), min(n, int(r * SR))
    if ia: x[:ia] *= np.linspace(0, 1, ia)
    if ir: x[-ir:] *= np.linspace(1, 0, ir)
    return x

# ------------------------------------------------------------------ strings (Karplus-Strong, in tune)
_KS = {}
def ks(f, dur, s=0.5, t60=1.2, bright=0.6, pos=0.13, var=0):
    """plucked string: loop = z^-N . Thiran allpass (fractional delay) . (1-s + s z^-1) . rho"""
    bright = round(bright, 1); t60 = round(t60, 2)
    key = (round(f, 3), round(dur, 3), s, t60, bright, round(pos, 3), var)
    if key in _KS: return _KS[key]
    rng = np.random.default_rng(zlib.crc32(repr(key).encode()))
    n = int(dur * SR); P = SR / f - s; N = int(np.floor(P - 0.5)); d = P - N; c = (1 - d) / (1 + d)
    rho = 10 ** (-3 / (f * t60))
    a = np.zeros(N + 3); a[0] = 1; a[1] = c; a[N] -= rho * (1 - s) * c; a[N + 1] -= rho * ((1 - s) + s * c); a[N + 2] -= rho * s
    L = int(round(P)); e = rng.uniform(-1, 1, L)
    e = signal.lfilter([1 - (0.92 - 0.8 * bright)], [1, -(0.92 - 0.8 * bright)], e)   # softer finger = darker burst
    k = max(1, int(round(pos * P))); e[k:] -= e[:-k] * 0.95                            # pluck position comb
    x = np.zeros(n); x[:min(n, L)] = e[:min(n, L)]
    y = signal.lfilter([1, c], a, x); y /= (np.abs(y).max() + 1e-9)
    _KS[key] = y; return y
def body_ir(spec, n=0.25, direct=0.55, seed=3):
    rng = np.random.default_rng(seed); m = int(n * SR); ir = modes(m, spec, rng); ir /= np.abs(ir).sum() / 25
    ir[0] += direct; return ir
OUD_BODY = body_ir([(98, .8, .07), (196, 1.0, .05), (290, .9, .045), (405, .6, .035), (580, .45, .03), (1050, .35, .02),
                    (1650, .22, .014), (2700, .12, .008)])
QANUN_BODY = body_ir([(170, .5, .05), (330, .8, .04), (560, .7, .03), (900, .6, .025), (1500, .55, .018), (2400, .45, .012),
                      (3600, .3, .008)], direct=0.6, seed=4)
HARP_BODY = body_ir([(120, .7, .08), (240, .8, .06), (470, .5, .04), (900, .3, .03)], direct=0.7, seed=5)
def oud(n, dur=0.9, vel=0.8, var=0, stacc=1.0):
    f = hz(n); t60 = 1.5 * (f / 73.4) ** -0.35 * stacc; br = 0.35 + 0.45 * vel
    a = ks(f * 2 ** (2.5 / 1200), dur, 0.5, t60, br, 0.14, var); b = ks(f * 2 ** (-2.5 / 1200), dur, 0.5, t60 * 0.92, br, 0.16, var + 7)
    s = 0.55 * a + 0.45 * b
    clk = np.random.default_rng(var + 99).standard_normal(int(0.004 * SR)) * np.linspace(1, 0, int(0.004 * SR)) * 0.25 * vel
    s[:len(clk)] += filt(sos_hp(2500), clk)
    return fade_edges(s * vel, 0.0005, 0.03)
def qanun(n, dur=1.4, vel=0.8, var=0):
    f = hz(n); t60 = 1.7 * (f / 146.8) ** -0.3; br = 0.55 + 0.4 * vel
    s = sum(ks(f * 2 ** (dc / 1200), dur, 0.35, t60, br, 0.09, var + j) for j, dc in enumerate((-1.6, 0, 1.7))) / 3
    return fade_edges(s * vel, 0.0005, 0.05)
def harp(n, dur=2.6, vel=0.8, var=0):
    f = hz(n); t60 = 2.6 * (f / 146.8) ** -0.25
    return fade_edges(ks(f, dur, 0.5, t60, 0.25 + 0.3 * vel, 0.32, var) * vel, 0.001, 0.08)
def bass(n, dur=0.5, vel=0.8, var=0, t60=0.35):
    return fade_edges(ks(hz(n), dur, 0.5, t60, 0.3 + 0.3 * vel, 0.2, var) * vel, 0.0005, 0.03)

# ------------------------------------------------------------------ winds (additive, formants)
def contour(notes, rng, glide=0.045, scoop=0.0, vib=(5.4, 18.0), vib_delay=0.28, drift=4.0):
    """notes: list of (midi, seconds, flags). returns f0[n] (Hz) and a per-note onset list."""
    seg = []
    for m, d, fl in notes:   # ornaments become extra short notes
        if 'turn' in fl and d > 0.35:
            g = min(0.07, d / 6); u, l = step(m, 1), step(m, -1)
            seg += [(m, g * 1.6, ''), (u, g, ''), (m, g, ''), (l, g, ''), (m, d - g * 4.6, fl)]
        elif 'grace' in fl and d > 0.15: g = 0.055; seg += [(step(m, 1), g, ''), (m, d - g, fl)]
        elif 'mord' in fl and d > 0.2: g = 0.05; seg += [(m, g, ''), (step(m, 1), g, ''), (m, d - 2 * g, fl)]
        else: seg.append((m, d, fl))
    n = int(sum(d for _, d, _ in seg) * SR); cents = np.zeros(n); onset = []; i = 0; prev = None
    for m, d, fl in seg:
        k = int(d * SR); tgt = 100.0 * m
        if prev is None: prev = tgt - (100 * scoop if scoop else 0)
        gl = int(max(0.008, glide if 'slide' not in fl else d * 0.6) * SR); gl = min(gl, k if 'slide' in fl else max(1, int(0.4 * k)))
        x = np.linspace(0, 1, gl); seg_c = np.full(k, tgt); seg_c[:gl] = prev + (tgt - prev) * (x * x * (3 - 2 * x))
        if 'fall' in fl:   # comic/expressive fall-off at the end of the note
            fk = int(min(0.35, d * 0.5) * SR); seg_c[-fk:] -= np.linspace(0, 1, fk) ** 2 * 500
        cents[i:i + k] = seg_c; onset.append((i, k, fl)); prev = tgt; i += k
    t = np.arange(n) / SR
    rate = vib[0] + 0.4 * np.sin(2 * np.pi * 0.31 * t + rng.random() * 6)
    vibr = vib[1] * np.sin(2 * np.pi * np.cumsum(rate) / SR)
    vd = np.zeros(n)   # vibrato starts late in each long note
    for i0, k, fl in onset:
        tt = np.arange(k) / SR; vd[i0:i0 + k] = np.clip((tt - vib_delay) / 0.25, 0, 1)
    wander = filt(sos_lp(3), rng.standard_normal(n)) * drift * 40
    return 440 * 2 ** ((cents + vibr * vd + wander - 6900) / 1200), onset
def additive(f0, amp, spec_fn, rng, kmax=40, fmax=11000.0, jitter=0.0):
    ph = 2 * np.pi * np.cumsum(f0) / SR; out = np.zeros(len(f0))
    for k in range(1, kmax + 1):
        fk = k * f0
        if fk.min() > fmax: break
        a = spec_fn(fk, k) * (fk < fmax)
        if jitter: a = a * (1 + jitter * filt(sos_lp(18), rng.standard_normal(len(f0))) * 6)
        out += a * np.sin(k * ph + rng.random() * 6.283)
    return out * amp
def formant(f, F, B): return 1 / (1 + ((f - F) / (B / 2)) ** 2)
def reed(notes, vel=0.7, rng=None, kind='mizmar', breath=None, legato=True):
    """notes: [(note, seconds, flags)]; kind 'mizmar' (nasal double reed) or 'ney' (breathy end-blown flute)."""
    rng = rng or np.random.default_rng(1)
    nm = [(midi(n), d, fl) for n, d, *f in notes for fl in [f[0] if f else '']]
    if kind == 'ney':
        f0, on = contour(nm, rng, glide=0.06, vib=(4.6, 14.0), vib_delay=0.35, drift=5.0)
    else:
        f0, on = contour(nm, rng, glide=0.035, scoop=0.6, vib=(5.8, 16.0), vib_delay=0.22, drift=3.0)
    n = len(f0); amp = np.ones(n)
    att = int((0.075 if kind == 'ney' else 0.03) * SR)
    for i0, k, fl in on:   # articulation: tongued notes dip, slurred notes don't
        if not legato or 'tongue' in fl:
            dk = min(k, int(0.04 * SR)); amp[i0:i0 + dk] *= np.linspace(0.35, 1, dk)
        if 'stacc' in fl:
            kk = int(k * 0.45); amp[i0 + kk:i0 + k] *= np.exp(-np.arange(k - kk) / (0.012 * SR))
    amp[:att] *= np.linspace(0, 1, att) ** 1.5
    rel = min(n, int(0.12 * SR)); amp[-rel:] *= np.linspace(1, 0, rel) ** 1.3
    amp *= 1 + 0.06 * filt(sos_lp(4), rng.standard_normal(n)) * 8   # breath pressure wander
    lvl = vel
    if kind == 'ney':
        tilt = 1.9 - 0.5 * lvl
        def spec(f, k): return (k ** -tilt) * (1.0 if k != 2 else 0.8) * (0.6 + 0.8 * formant(f, 1600, 1800))
        tone = additive(f0, amp, spec, rng, kmax=14, fmax=7000, jitter=0.08)
        br = 0.35 if breath is None else breath
        nz = rng.standard_normal(n)
        pitched = filt(sos_lp(160), nz) * 6 * (np.sin(2 * np.pi * np.cumsum(f0) / SR) + 0.5 * np.sin(4 * np.pi * np.cumsum(f0) / SR))
        air = filt(sos_bp(900, 6500), nz) * 0.5
        chiff = np.zeros(n)
        for i0, k, fl in on[:1] + [o for o in on[1:] if 'tongue' in o[2]]:
            ck = min(k, int(0.05 * SR)); chiff[i0:i0 + ck] += np.exp(-np.arange(ck) / (0.012 * SR))
        s = tone + br * (pitched * 0.35 + air) * amp * (0.6 + 0.4 * amp) + 0.25 * br * chiff * filt(sos_bp(1500, 6000), nz)
    else:
        tilt = 1.15 - 0.55 * lvl
        def spec(f, k):
            return (k ** -tilt) * (0.35 + 2.1 * formant(f, 1200, 600) + 1.5 * formant(f, 2750, 800) + 0.6 * formant(f, 4300, 1200)) \
                * (1 - 0.55 * formant(f, 620, 300)) / (1 + (f / 6500) ** 4)
        tone = additive(f0, amp, spec, rng, kmax=30, fmax=10000, jitter=0.05)
        br = 0.08 if breath is None else breath
        s = tone + br * filt(sos_bp(1200, 5000), rng.standard_normal(n)) * amp * 1.5
        s = np.tanh(s * 1.6) / 1.6   # reed buzz
    return fade_edges(s * vel / (np.abs(s).max() + 1e-9), 0.003, 0.03)
def R(seq, beat):   # [(note, beats, flags?)] -> seconds
    return [(n, b * beat, *f) for n, b, *f in seq]

# ------------------------------------------------------------------ sustained voices (wavetables, loop-safe)
def qf(f, L): return round(f * L) / L if L else f          # integer cycles per loop length -> sample-exact loops
_TAB = {}
def table(f0, spec_fn, size=8192, fmax=12000.0):
    key = (round(f0, 4), spec_fn.__name__, size)
    if key in _TAB: return _TAB[key]
    ph = np.arange(size) / size; t = np.zeros(size)
    for k in range(1, int(fmax / f0) + 1): t += spec_fn(k * f0, k) * np.sin(2 * np.pi * k * ph)
    _TAB[key] = t / (np.abs(t).max() + 1e-9); return _TAB[key]
def wt(tab, f):   # f: array of Hz
    ph = (np.cumsum(f) / SR) % 1.0; idx = ph * len(tab); i0 = idx.astype(int); fr = idx - i0
    return tab[i0] * (1 - fr) + tab[(i0 + 1) % len(tab)] * fr
def lfo(n, hz_, L, phase=0.0, t0=0.0):
    t = t0 + np.arange(n) / SR; fq = qf(hz_, L) if L else hz_; return np.sin(2 * np.pi * fq * t + phase)
def drone_voice(n, note, L, spec_fn, detune=3.0, vib=0.0015, seed=0, t0=0.0):
    f = qf(hz(note), L); tab = table(f, spec_fn); rng = np.random.default_rng(seed)
    centre = wt(tab, f * (1 + vib * lfo(n, 0.11, L, rng.random() * 6, t0)))
    out = np.stack([centre, centre], 1) * 0.8
    for ch, dc in ((0, -detune), (1, detune)):   # a centre voice carries the pitch; small detuned side voices give width
        ff = qf(f * 2 ** (dc / 1200), L) * (1 + vib * lfo(n, 0.13 + 0.05 * ch, L, rng.random() * 6, t0))
        out[:, ch] += 0.35 * wt(tab, ff)   # mono fold can never comb-cancel the centre (owner's audience: phone speakers)
    return out
def arghul(f, k):   # Egyptian double-pipe drone reed: nasal, formant near 1.1 kHz
    return k ** -1.0 * (0.5 + 1.5 * formant(f, 880, 420) + 0.6 * formant(f, 2350, 700)) / (1 + (f / 3500) ** 3)
def choir_oo(f, k): return k ** -1.3 * (0.2 + 1.6 * formant(f, 330, 160) + 0.8 * formant(f, 780, 250) + 0.25 * formant(f, 2400, 500))
def choir_ah(f, k): return k ** -1.1 * (0.2 + 1.3 * formant(f, 720, 220) + 0.9 * formant(f, 1150, 300) + 0.35 * formant(f, 2600, 600))
def strings(f, k): return k ** -1.0 * (0.4 + 0.8 * formant(f, 900, 900)) / (1 + (f / 2800) ** 2)
def held(dur, note, spec_fn, att=0.8, rel=1.2, gain=1.0, seed=0, voices=3):
    """a sustained tone with slow attack/release (stereo segment; place it with Mix.add)."""
    n = int((dur + rel) * SR); f = hz(note); tab = table(f, spec_fn); rng = np.random.default_rng(seed); s = np.zeros((n, 2))
    for v in range(voices):
        dc = (v - (voices - 1) / 2) * 5.0
        ff = f * 2 ** (dc / 1200) * (1 + 0.0012 * np.sin(2 * np.pi * (4.6 + 0.3 * v) * np.arange(n) / SR + rng.random() * 6))
        sig = wt(tab, ff); pan = (v / max(1, voices - 1)) * 2 - 1 if voices > 1 else 0
        s[:, 0] += sig * np.cos((pan * 0.6 + 1) * np.pi / 4); s[:, 1] += sig * np.sin((pan * 0.6 + 1) * np.pi / 4)
    e = np.ones(n); ka = min(n, int(att * SR)); e[:ka] = np.sin(np.linspace(0, np.pi / 2, ka)) ** 2
    kd = int(dur * SR); kr = n - kd
    if kr > 0: e[kd:] = np.cos(np.linspace(0, np.pi / 2, kr)) ** 2
    s *= (e * gain / voices)[:, None]; return s

# ------------------------------------------------------------------ percussion
def dum(rng, vel=1.0):
    n = int(0.55 * SR); t = np.arange(n) / SR
    f = 73.42 + 100 * np.exp(-t / 0.022); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t / 0.19) + 0.35 * np.sin(1.59 * ph + 1) * np.exp(-t / 0.07) + 0.18 * np.sin(2.14 * ph + 2) * np.exp(-t / 0.04)
    nz = rng.standard_normal(n)
    s += filt(sos_bp(140, 520), nz) * np.exp(-t / 0.014) * 0.9          # goblet knock: what a phone speaker hears
    s += filt(sos_hp(1800), nz) * np.exp(-t / 0.004) * 0.12              # skin slap
    return fade_edges(s * vel * (0.9 + 0.2 * rng.random()), 0.0003, 0.05)
def tek(rng, vel=1.0, ka=False):
    n = int(0.14 * SR); t = np.arange(n) / SR; nz = rng.standard_normal(n); sh = 0.94 if ka else 1.0
    s = modes(n, [(1180 * sh, .3, .02), (2350 * sh, .22, .016), (3650 * sh, .35, .014), (5300 * sh, .22, .01)], rng)
    s += filt(sos_bp(2800, 9000), nz) * np.exp(-t / (0.004 if not ka else 0.003)) * 1.1
    if ka: s = filt(sos_lp(5000), s) * 0.8
    return fade_edges(s * vel * (0.9 + 0.2 * rng.random()), 0.0002, 0.02)
def frame(rng, vel=1.0, buzz=0.0, f_end=55.0, damp=1.0):
    n = int(1.4 * SR); t = np.arange(n) / SR; f = f_end + 38 * np.exp(-t / 0.05); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t / (0.45 * damp)) + 0.4 * np.sin(1.59 * ph + 1) * np.exp(-t / (0.2 * damp)) + 0.25 * np.sin(2.13 * ph + 2) * np.exp(-t / (0.12 * damp))
    nz = rng.standard_normal(n)
    s += filt(sos_bp(110, 450), nz) * np.exp(-t / 0.025) * 1.0 + filt(sos_bp(800, 3000), nz) * np.exp(-t / 0.02) * 0.12
    if buzz: s += filt(sos_bp(1500, 6000), nz) * np.exp(-t / 0.22) * buzz * (1 + 0.5 * np.sin(2 * np.pi * 37 * t))
    return fade_edges(s * vel, 0.0005, 0.1)
def heart(rng, vel=1.0):   # a muffled bendir 'lub' with a knock a phone speaker can play (150-400 Hz)
    n = int(0.7 * SR); t = np.arange(n) / SR; f = 55 + 35 * np.exp(-t / 0.03); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t / 0.13) + 0.3 * np.sin(2 * ph) * np.exp(-t / 0.06)
    s += filt(sos_bp(120, 420), rng.standard_normal(n)) * np.exp(-t / 0.022) * 2.2
    s = s + 0.4 * np.tanh(3 * s); return fade_edges(filt(sos_lp(900), s) * vel, 0.0005, 0.05)
def jingle(rng, n_hits=4, spread=0.014, decay=0.07, lo=4200, hi=10500, n=None):
    n = n or int(0.3 * SR); out = np.zeros(n)
    for h in range(n_hits):
        i = int(rng.random() * spread * SR); m = n - i
        sp = [(rng.uniform(lo, hi), rng.uniform(.4, 1), decay * rng.uniform(.5, 1.2)) for _ in range(5)]
        out[i:] += modes(m, sp, rng) * rng.uniform(.5, 1)
    return out
def riq(rng, vel=1.0):
    s = jingle(rng, 3, 0.01, 0.05) * 0.5; s[:int(0.14 * SR)] += tek(rng, 0.25, True)
    return fade_edges(s * vel, 0.0003, 0.02)
def zills(rng, vel=1.0, dur=1.6):
    n = int(dur * SR); base = 2349.3   # D7, partials of a small bronze cymbal
    s = modes(n, [(base * r_, a, tau) for r_, a, tau in ((1, 1, .5), (1.47, .7, .4), (2.09, .5, .3), (2.56, .35, .22), (3.2, .25, .15))], rng)
    s2 = modes(n, [(base * 1.004 * r_, a, tau) for r_, a, tau in ((1, .6, .45), (1.47, .5, .35), (2.09, .3, .25))], rng)
    return fade_edges((s + s2) * 0.22 * vel, 0.0003, 0.1)
def sistrum(rng, vel=1.0, shakes=3, gap=0.07):
    n = int((shakes * gap + 0.5) * SR); out = np.zeros(n)
    for k in range(shakes):
        i = int(k * gap * SR); out[i:] += jingle(rng, 7, 0.03, 0.09, 3000, 9000, n - i) * (1 - 0.18 * k)
    return fade_edges(out * 0.35 * vel, 0.0005, 0.08)
def bowl(rng, note='D4', vel=1.0, dur=6.0):
    f = hz(note); n = int(dur * SR)
    s = modes(n, [(f, 1, 3.5), (f * 1.002, .6, 3.2), (f * 2.76, .45, 1.6), (f * 5.40, .25, .8), (f * 8.93, .12, .4)], rng)
    return fade_edges(s * vel * 0.3, 0.002, 0.3)
def clap(rng, vel=1.0):
    n = int(0.12 * SR); t = np.arange(n) / SR; nz = filt(sos_bp(900, 4500), rng.standard_normal(n)); e = np.zeros(n)
    for k, d in enumerate((0, 0.009, 0.017)): e += (t >= d) * np.exp(-np.maximum(0, t - d) / 0.006) * (0.7 if k < 2 else 1)
    e += (t >= 0.017) * np.exp(-np.maximum(0, t - 0.017) / 0.03) * 0.4
    return fade_edges(nz * e * vel * 0.8, 0.0002, 0.02)

# ------------------------------------------------------------------ rooms
def make_ir(rt60=1.2, pre=0.012, seed=11):
    rng = np.random.default_rng(seed); n = int(rt60 * 1.3 * SR); t = np.arange(n) / SR; ir = np.zeros((n, 2))
    for ch in (0, 1):
        nz = rng.standard_normal(n); x = np.zeros(n)
        for sos, k in ((sos_lp(450), 1.15), (sos_bp(450, 3500), 1.0), (sos_hp(3500), 0.5)):
            x += filt(sos, nz) * np.exp(-6.91 * t / (rt60 * k))
        for d, g in ((0.007, .5), (0.013, .38), (0.019, .3), (0.027, .22), (0.037, .16)):   # early reflections
            i = int((d + 0.003 * ch) * SR); x[i] += g * (1 if rng.random() > .5 else -1) * 8
        p = int(pre * SR); ir[p:, ch] = x[:n - p]
    ir *= np.minimum(1, t / 0.004)[:, None]; return ir / np.sqrt((ir ** 2).sum(0).mean())
def conv_st(x, ir):
    return np.stack([signal.oaconvolve(x[:, c], ir[:, c])[:len(x)] for c in (0, 1)], 1)

# ------------------------------------------------------------------ mixer and master
class Mix:
    def __init__(self, seconds, seed, N=1):
        self.n = int(seconds * SR); self.bus = {}; self.seed = seed; self.N = N; self.cut = None
    def r(self, bar, tag):   # per-bar seeded rng: every loop pass is identical -> sample-exact loops
        return np.random.default_rng([self.seed, int(bar) % self.N, zlib.crc32(tag.encode())])
    def add(self, bus, sig, t, pan=0.0, g=1.0):
        if self.cut is not None and t > self.cut: return   # used to keep only the next pass's downbeat (+ pre-roll)
        if bus not in self.bus: self.bus[bus] = np.zeros((self.n, 2))
        if sig.ndim == 2:
            i = int(round(t * SR)); s = sig
            if i < 0: s = s[-i:]; i = 0
            j = min(self.n, i + len(s))
            if j > i: self.bus[bus][i:j] += s[:j - i] * g
            return
        i = int(round(t * SR)); s = sig
        if i < 0: s = s[-i:]; i = 0
        j = min(self.n, i + len(s))
        if j <= i: return
        th = (np.clip(pan, -1, 1) + 1) * np.pi / 4; s = s[:j - i] * g
        self.bus[bus][i:j, 0] += s * np.cos(th); self.bus[bus][i:j, 1] += s * np.sin(th)
    def addbuf(self, bus, buf, g=1.0):
        if bus not in self.bus: self.bus[bus] = np.zeros((self.n, 2))
        self.bus[bus] += buf[:self.n] * g
def render(mix, cfg, ir):
    dry = np.zeros((mix.n, 2)); send = np.zeros((mix.n, 2))
    for name, x in mix.bus.items():
        c = cfg.get(name, {}); x = x.copy()
        if c.get('body') is not None: x = conv_st(x, np.stack([c['body'], c['body']], 1))
        if c.get('hp'): x = filt(sos_hp(c['hp']), x)
        if c.get('lp'): x = filt(sos_lp(c['lp']), x)
        for f, gdb, q in c.get('eq', []): x = peak_eq(x, f, gdb, q)
        x *= 10 ** (c.get('db', 0) / 20); dry += x; send += x * c.get('send', 0.15)
    return filt(sos_hp(28), dry + 0.55 * conv_st(send, ir))
def true_peak(x):
    return 20 * np.log10(np.abs(signal.resample_poly(x, 4, 1, axis=0)).max() + 1e-12)
def _release_py(g, a):   # instant attack (look-ahead already min-filtered), smooth release
    out = np.empty_like(g); p = 1.0
    for i in range(len(g)):
        p = g[i] if g[i] < p else a * p + (1 - a) * g[i]; out[i] = p
    return out
try:
    from numba import njit; _release = njit(cache=False)(_release_py)
except Exception: _release = _release_py
def limit(x, ceiling_db=-1.6, look=0.002, rel=0.08, circular=False):
    c = 10 ** (ceiling_db / 20); pad = int(0.5 * SR)
    xx = np.concatenate([x[-pad:], x, x[:pad]]) if circular else x   # a loop: the limiter sees both neighbours of the seam
    up = np.abs(signal.resample_poly(xx, 4, 1, axis=0)).max(1).reshape(-1, 4).max(1)[:len(xx)]
    need = np.minimum(1, c / np.maximum(up, 1e-9)); la = int(look * SR)
    from scipy.ndimage import minimum_filter1d
    g = minimum_filter1d(need, 2 * la + 1) if la else need
    out = _release(g, np.exp(-1 / (rel * SR)))
    att = la or 1
    out = np.minimum(out, signal.lfilter(np.ones(att) / att, 1, np.concatenate([np.ones(att), out]))[att:])
    y = xx * out[:, None]
    return y[pad:-pad] if circular else y
def lufs(x):
    import pyloudnorm as pyln
    return pyln.Meter(SR).integrated_loudness(x)
def master(x, gain, tp=-1.5, circular=False): return limit(x * gain, tp - 0.25, circular=circular)
def fit_gain(x, nbody=None, target=-14.0, tp=-1.5):
    body = x[:nbody] if nbody else x; g = 10 ** ((target - lufs(body)) / 20)
    for _ in range(4):
        L = lufs(master(body, g, tp))
        if abs(L - target) < 0.08: break
        g *= 10 ** ((target - L) / 20)
    return g

# ------------------------------------------------------------------ cues
class Cue:
    """a cue = a score function over bars 0..N-1 (seeded per bar), continuous beds, and an ending bar."""
    def __init__(self, name, bpm, bars, seed, rt60, cfg, beats=4):
        self.name, self.bpm, self.N, self.seed, self.rt60, self.cfg, self.beats = name, bpm, bars, seed, rt60, cfg, beats
        self.beat = 60 / bpm; self.bar = self.beats * self.beat; self.L = self.N * self.bar; self.next_pass = True
    def score(self, m, t0, first): raise NotImplementedError
    def beds(self, m, t0, seconds, L, fade_in): pass
    def ending(self, m, t): pass
    def hits(self): return {}
def build(cue, mode):
    """mode 'full' = pass 1 + ending; 'loop' = middle of 3 passes (sample-exact); 'end' = the ending after a pass."""
    L = cue.L; tail = max(4.0, cue.rt60 * 1.6) + cue.bar
    if mode == 'full': secs = L + tail; passes = [0.0]; t_end = L
    elif mode == 'loop': secs = 3 * L; passes = [0.0, L, 2 * L]; t_end = None
    else: secs = 2 * L + tail; passes = [0.0, L]; t_end = 2 * L
    m = Mix(secs, cue.seed, cue.N)
    for k, t0 in enumerate(passes): cue.score(m, t0, first=(k == 0 and mode != 'loop'))
    if t_end is not None:
        if cue.next_pass:   # the ending sits on the next pass's downbeat (and its pre-roll), exactly as the loop continues
            m.cut = t_end + 0.03; cue.score(m, t_end, first=False); m.cut = None
        cue.ending(m, t_end)
    Lq = round(L * SR) / SR   # the loop file is round(L*SR) samples: drones/LFOs get whole cycles in exactly that many samples
    cue.beds(m, 0.0, secs, Lq, fade_in=(mode == 'full'), t_end=t_end)   # same loop-quantised drones in every mode -> loop + end splice
    y = render(m, cue.cfg, make_ir(cue.rt60, seed=cue.seed))
    if mode == 'loop': return y[int(round(L * SR)):int(round(L * SR)) + int(round(L * SR))]
    if mode == 'end': return y[int(round(L * SR)):]   # pass 2 + ending (trimmed after mastering)
    return y

def mel(seq, eighth):   # [(note, eighths, flags?)] -> seconds
    return [(n, k * eighth, *f) for n, k, *f in seq]
def darbuka_bar(m, t, b, e8, r, vel=1.0, ghosts=True, fill=False, roll=False, lilt=0.04, sd=0.004, clapbus=None):
    """maqsum: DUM tek . tek DUM . tek .  (eighths 0 1 3 4 6), ka ghosts on 2 5 7, rolls into phrase starts."""
    def tt(e): return t + e * e8 + (lilt * e8 if (e % 1 == 0 and int(e) % 2 == 1) else 0) + r.normal(0, sd)
    for e, kind, v in ((0, 'D', 1.0), (1, 'T', .62), (3, 'T', .78), (4, 'D', .86), (6, 'T', .74)):
        if kind == 'D': m.add('dum', dum(r, v * vel), tt(e), -0.05)
        else: m.add('tek', tek(r, v * vel), tt(e), 0.12)
        if kind == 'T' and clapbus: m.add(clapbus, clap(r, 0.55 * vel), tt(e) + 0.004, -0.35 + 0.7 * r.random())
    if ghosts:
        for e in (2, 5, 7):
            if r.random() < 0.8: m.add('tek', tek(r, .2 * vel * (0.8 + 0.4 * r.random()), True), tt(e), -0.12)
        if r.random() < 0.35: m.add('tek', tek(r, .16 * vel, True), tt(7.5), -0.12)
    if fill:   # 16th tek-ka on beats 3-4 (keeps the dum on 4)
        for j, e in enumerate(np.arange(5, 8, 0.5)):
            m.add('tek', tek(r, (.25 + .07 * j) * vel, j % 2 == 1), tt(e), 0.12 if j % 2 == 0 else -0.12)
    if roll:   # 32nd roll over beat 4 into the next downbeat (the whoosh in the liked clip)
        for j in range(8): m.add('tek', tek(r, (.18 + .06 * j) * vel, j % 2 == 1), t + 6 * e8 + j * e8 / 4 + r.normal(0, .002), (-1) ** j * 0.15)
def riq_bar(m, t, e8, r, vel=1.0):
    for e in range(8):
        m.add('perc', riq(r, (0.28 if e % 2 == 0 else 0.42) * vel * (0.85 + 0.3 * r.random())), t + e * e8 + (0.04 * e8 if e % 2 else 0) + r.normal(0, .004), 0.72)
def oud_line(m, t, e8, line, r, g=1.0, bus='oud', pan=0.28, oct=0, stacc=1.0, trem=True, lilt=0.04):
    """line: [(eighth_pos, note, length_in_eighths, vel)]; long notes get the oud's tremolo (rish)."""
    for e, n, k, v in line:
        mm = midi(n) + 12 * oct; t0 = t + e * e8 + (lilt * e8 if e % 2 == 1 else 0) + r.normal(0, 0.007); v = v * (0.9 + 0.2 * r.random())
        if trem and k >= 2:
            for j in range(int(k * 2)): m.add(bus, oud(mm, 0.45, v * (1 if j == 0 else 0.62 + 0.1 * r.random()), int(r.integers(4)), stacc), t0 + j * e8 / 2 + r.normal(0, .003), pan, g)
        else: m.add(bus, oud(mm, 0.9 if stacc >= 1 else 0.5, v, int(r.integers(4)), stacc), t0, pan, g)

GROOVE_CFG = {'dum': dict(db=-2.5, send=0.1), 'tek': dict(db=-11, send=0.2, eq=[(2500, -4, 1.2)]), 'perc': dict(db=-16, send=0.3, hp=3000),
              'oud': dict(body=OUD_BODY, db=0.0, send=0.38), 'bass': dict(body=OUD_BODY, db=-3, send=0.05, lp=900),
              'reed': dict(db=-10.5, send=0.38, hp=180), 'qanun': dict(body=QANUN_BODY, db=-9, send=0.3), 'drone': dict(db=-9.0, send=0.15, lp=1700),
              'zill': dict(db=-15, send=0.35)}
class Groove(Cue):
    """the BGM (owner's favourite vibe): steady maqsum, oud ostinato, drone, rare quiet reed phrases. 104 BPM, 24 bars."""
    RIFF = [[(0, 'D3', 1, .95), (1, 'D3', 1, .5), (3, 'Eb3', 1, .78), (4, 'F#3', 1, .9), (6, 'G3', 1, .78), (7, 'F#3', 1, .55)],
            [(0, 'Eb3', 1, .88), (1, 'D3', 1, .5), (3, 'C3', 1, .72), (4, 'D3', 2, .88), (6, 'A2', 1, .7), (7, 'C3', 1, .5)],
            [(0, 'D3', 1, .95), (1, 'D3', 1, .5), (3, 'Eb3', 1, .78), (4, 'F#3', 1, .9), (6, 'A3', 1, .8), (7, 'Bb3', 1, .62)],
            [(0, 'A3', 1, .9), (1, 'G3', 1, .6), (2, 'F#3', 1, .66), (3, 'Eb3', 1, .7), (4, 'D3', 4, .85)]]
    PH_A = [('D4', 1), ('Eb4', 1), ('F#4', 1), ('G4', 1), ('A4', 1), ('Bb4', 1), ('A4', 1), ('G4', 1), ('F#4', 2, 'turn'), ('D4', 6)]
    PH_B = [('Bb4', 2, 'grace'), ('C5', 1), ('Bb4', 1), ('A4', 1), ('G4', 1), ('F#4', 1), ('Eb4', 1), ('D4', 7)]
    PH_TAG = [('A4', 2, 'mord'), ('G4', 1), ('F#4', 1), ('Eb4', 2), ('D4', 2)]
    def __init__(self, bpm=104, bars=24, seed=60, bgm=True):
        super().__init__('groove', bpm, bars, seed, 1.1, GROOVE_CFG); self.bgm = bgm
    def score(self, m, t0, first):
        e8 = self.beat / 2
        for b in range(self.N):
            t = t0 + b * self.bar; r = m.r(b, 'g'); ph = b % 4
            darbuka_bar(m, t, b, e8, r, 0.95, fill=(ph == 3 and b % 8 != 7), roll=(b % 8 == 7))
            riq_bar(m, t, e8, r, 0.9)
            if ph == 0: m.add('zill', zills(r, 0.8 if b % 8 == 0 else 0.5), t + abs(r.normal(0, .003)), -0.55)
            low = 'A1' if (ph == 3) else 'D2'
            for e, n_ in ((0, 'D2'), (4, low)): m.add('bass', bass(n_, 0.7, 0.75, int(r.integers(4)), t60=0.6), t + e * e8 + r.normal(0, .004), 0)
            oud_line(m, t, e8, self.RIFF[ph], r, 1.0, pan=0.55, oct=1)   # width from separate sources, not L/R tricks (mono-safe)
            if 8 <= b < 16: oud_line(m, t, e8, self.RIFF[ph], m.r(b, 'g2'), 0.45, 'oud', -0.6, oct=0, trem=False)   # second oud, an octave down
        bt = self.bar
        for b0, ph_, v in ((8, self.PH_A, .6), (16, self.PH_B, .6), (22, self.PH_TAG, .5)):
            m.add('reed', reed(mel(ph_, e8), v, m.r(b0, 'reed'), 'mizmar'), t0 + b0 * bt + 0.01, -0.42)
        run = ['D4', 'Eb4', 'F#4', 'G4', 'A4', 'Bb4', 'C5', 'D5']
        r = m.r(15, 'qn')
        for j, n_ in enumerate(run): m.add('qanun', qanun(n_, 1.0, 0.35 + 0.05 * j, j), t0 + 15 * bt + 6 * e8 + j * e8 / 4 + r.normal(0, .003), -0.5 + 0.14 * j)
    def beds(self, m, t0, secs, L, fade_in, t_end=None):
        n = m.n; d = drone_voice(n, 'D2', L, arghul, seed=1) + 0.7 * drone_voice(n, 'A2', L, arghul, seed=2) + 0.45 * drone_voice(n, 'D3', L, arghul, seed=3)
        e = np.ones(n)
        if fade_in: k = int(0.06 * SR); e[:k] = np.linspace(0, 1, k)
        if t_end is not None:
            i = int((t_end + 0.2) * SR); k = int(3.0 * SR); e[i:i + k] *= np.linspace(1, 0, min(k, n - i)) ** 2; e[i + k:] = 0
        m.addbuf('drone', d * e[:, None] * 0.5)
    def ending(self, m, t):
        r = m.r(0, 'end'); e8 = self.beat / 2
        m.add('tek', tek(r, 0.8), t + 0.003, 0.1); m.add('zill', zills(r, 0.8, 2.5), t + 0.002, 0.3)
        for n_, p in (('A2', .2), ('D3', .25), ('A3', -.2)): m.add('oud', oud(n_, 3.0, 0.75, 1), t + abs(r.normal(0, .004)), p)
        m.add('reed', reed([('D4', 2.6)], 0.5, r, 'mizmar'), t + 0.02, -0.18)
    def hits(self): return {'phrase_starts_bars': list(range(1, self.N + 1, 4)), 'reed_phrases_bars': [9, 17, 23], 'rolls_into_bars': [9, 17, 1]}

MYSTIC_CFG = {'frame': dict(db=-2, send=0.4), 'perc': dict(db=-13, send=0.6, hp=2500), 'ney': dict(db=-5, send=0.55, hp=200),
              'pad': dict(db=-10, send=0.5, lp=3500), 'drone': dict(db=-8, send=0.3, lp=1800), 'bowl': dict(db=-10, send=0.6), 'air': dict(db=-22, send=0.5)}
class Mystic(Cue):
    """the Duat: drone + breathy ney + sistrum shimmers + slow bendir pulse, no maqsum. 69.33 BPM (2/3 of groove), 16 bars."""
    NEY = {2: [('A4', 2, 'turn'), ('Bb4', .5), ('A4', 1.5), ('G4', .5), ('F#4', 1.5, 'tongue'), ('Eb4', .5), ('D4', 1.5)],
           6: [('D5', 2.5), ('C5', .5), ('Bb4', 1), ('A4', 1, 'tongue'), ('Bb4', .5), ('A4', .5), ('G4', .5), ('F#4', 1.5)],
           10: [('G4', 1), ('A4', 1), ('Bb4', 2, 'mord'), ('A4', .5), ('G4', .5), ('F#4', 1), ('Eb4', 1, 'tongue'), ('D4', 1)],
           14: [('D4', 3), ('Eb4', 1, 'tongue'), ('D4', 3.6)]}
    PADS = [(0, 4, ('D3', 'A3')), (4, 2, ('Eb3', 'G3')), (6, 2, ('D3', 'A3')), (8, 4, ('D3', 'A3', 'D4')), (12, 2, ('Eb3', 'Bb3')), (14, 2, ('D3', 'A3'))]
    def __init__(self, bars=16, seed=61):
        super().__init__('mystic', 104 * 2 / 3, bars, seed, 2.8, MYSTIC_CFG)
    def score(self, m, t0, first):
        bt, B = self.beat, self.bar
        for b in range(self.N):
            t = t0 + b * B; r = m.r(b, 'm')
            m.add('frame', frame(r, 0.95, buzz=0.12), t + r.normal(0, .004), -0.05)
            m.add('frame', frame(r, 0.42, buzz=0.05), t + 2 * bt + r.normal(0, .006), 0.1)
            if b % 4 == 3: m.add('frame', frame(r, 0.3), t + 3.5 * bt + r.normal(0, .006), 0.15)
            if b % 2 == 1: m.add('perc', sistrum(r, 0.8, 3), t + 1.5 * bt + r.normal(0, .01), -0.55 if b % 4 == 1 else 0.55)
            if b % 4 == 3: m.add('perc', sistrum(r, 0.6, 4, 0.06), t + 3 * bt, 0.3)
            if b in self.NEY: m.add('ney', reed(R(self.NEY[b], bt), 0.55, r, 'ney', breath=0.55), t + 0.03, -0.2)
            if b % 8 == 0: m.add('bowl', bowl(r, 'D4', 0.8), t + 0.01, 0.35)
        for b0, nb, notes in self.PADS:
            for j, n_ in enumerate(notes):
                m.add('pad', held(nb * B + 0.4, n_, choir_oo, att=1.6, rel=1.8, gain=0.5, seed=b0 * 7 + j), t0 + b0 * B - 0.4)
    def beds(self, m, t0, secs, L, fade_in, t_end=None):
        n = m.n; d = drone_voice(n, 'D2', L, arghul, seed=4) + 0.55 * drone_voice(n, 'A2', L, arghul, seed=5)
        swell = 0.8 + 0.2 * lfo(n, 1 / (2 * self.bar), L, -np.pi / 2)
        rng = np.random.default_rng(9); Lk = int(round((L or secs) * SR))
        base = rng.standard_normal(min(n, Lk)); nz = np.resize(base, n)   # periodic noise for loop-safe air
        air = filt(sos_bp(300, 2200), np.stack([nz, np.roll(nz, 977)], 1)) * (0.6 + 0.4 * lfo(n, 0.09, L))[:, None]
        e = np.ones(n)
        if fade_in: k = int(0.5 * SR); e[:k] = np.linspace(0, 1, k) ** 0.5
        if t_end is not None:
            i = int((t_end + 0.5) * SR); k = int(4.5 * SR); e[i:i + k] *= np.linspace(1, 0, min(k, n - i)) ** 2; e[i + k:] = 0
        m.addbuf('drone', d * (swell * e)[:, None] * 0.5); m.addbuf('air', air * e[:, None])
    def ending(self, m, t):
        r = m.r(0, 'end')
        m.add('bowl', bowl(r, 'A4', 0.5, 6), t + 0.02, -0.3)
        m.add('perc', sistrum(r, 0.7, 4, 0.08), t + self.beat, -0.4)
        m.add('ney', reed([('D4', 3.4)], 0.5, r, 'ney', breath=0.6), t + 0.05, -0.2)
    def hits(self): return {'frame_drum': 'beat 1 (strong) + beat 3 (soft) every bar', 'ney_phrases_bars': [3, 7, 11, 15], 'bowl_bars': [1, 9]}

TENSION_CFG = {'frame': dict(db=0, send=0.3), 'heart': dict(db=-3, send=0.15), 'dum': dict(db=-3, send=0.2), 'tek': dict(db=-10, send=0.2),
               'rub': dict(db=-1.0, send=0.45, lp=4500), 'drone': dict(db=-8, send=0.2), 'oud': dict(body=OUD_BODY, db=0, send=0.35),
               'qanun': dict(body=QANUN_BODY, db=-5, send=0.45), 'riser': dict(db=-15, send=0.5), 'zill': dict(db=-12, send=0.4),
               'reed': dict(db=-7, send=0.4, hp=150), 'boom': dict(db=-4, send=0.35)}
class Tension(Cue):
    """the weighing: low drone, heartbeat bendir, the Eb/D rub climbing D-Eb > F#-G > A-Bb > D-Eb, sparse plucks,
    a riser, one beat of silence, then the verdict hit on bar 18. 78 BPM (3/4 of groove), 18 bars = 55.38 s.
    bed=True: an 8-bar loop at a steady low intensity for the waiting before the weighing.
    hush=True (script shot 33): same build, but bar 17 drops to drone + a heartbeat that speeds up, then the silent beat."""
    def __init__(self, bars=18, seed=62, bed=False, hush=False):
        name = 'tension_loop' if bed else ('tension_hush' if hush else 'tension')
        super().__init__(name, 78, 8 if bed else bars, seed, 1.9, TENSION_CFG); self.bed = bed; self.hush = hush; self.next_pass = False
    def I(self, b): return 0.45 if self.bed else min(1.0, 0.2 + 0.8 * b / 15)
    def score(self, m, t0, first):
        bt, B = self.beat, self.bar; last = self.N - 1
        for b in range(self.N if self.bed else last):
            t = t0 + b * B; r = m.r(b, 't'); I = self.I(b)
            per = 2 if (not self.bed and b < 2) else 1
            hits = np.arange(0, 4, per) if b < 16 or self.bed else np.arange(0, 3, 0.5)   # bar 17: eighths, beat 4 silent
            if b == 16 and self.hush: hits = np.array([0, 0.8, 1.45, 1.95, 2.35, 2.65, 2.88])   # the heart speeds up alone
            for h in hits:
                v = (0.3 + 0.7 * I) * (1 if h % 1 == 0 else 0.7) * (0.92 + 0.16 * r.random()) * (0.75 if (b == 16 and self.hush) else 1)
                m.add('heart', heart(r, v), t + h * bt + r.normal(0, .003), 0)
                if h % 1 == 0 and b < 16: m.add('heart', heart(r, v * 0.55), t + (h + 0.32) * bt + r.normal(0, .003), 0)
            if I > 0.55 and b < 16 and not (self.hush and b == 15):
                for h in (1.5, 3.5): m.add('tek', tek(r, 0.18 + 0.25 * I, True), t + h * bt + r.normal(0, .004), 0.3)
            if (b % 2 == 1 or I > 0.6) and (self.bed or b < 16):   # sparse plucks: the semitone that won't resolve
                pair = ('D3', 'Eb3') if b % 4 < 2 else ('Eb3', 'D3')
                m.add('oud', oud(pair[0], 1.2, 0.55 + 0.3 * I, int(r.integers(4))), t + 1.5 * bt + r.normal(0, .006), 0.4)
                m.add('oud', oud(pair[1], 1.2, 0.45 + 0.3 * I, int(r.integers(4))), t + 2.5 * bt + r.normal(0, .006), -0.35)
            if b >= 5 and b % 2 == 1:   # the clock: high qanun Eb5 -> D5 on beat 4
                m.add('qanun', qanun('Eb5', 1.0, 0.5 + 0.3 * I, b), t + 3 * bt + r.normal(0, .004), -0.45)
                m.add('qanun', qanun('D5', 1.2, 0.45 + 0.3 * I, b + 1), t + 3.5 * bt + r.normal(0, .004), -0.45)
        # the rub: sustained semitone pairs, rising in the last quarter (the bed keeps D4/Eb4 as a continuous drone)
        pairs = [] if self.bed else [(2, 2, ('D4',)), (4, 8, ('D4', 'Eb4')), (12, 1, ('F#4', 'G4')), (13, 1, ('A4', 'Bb4')),
                                     (14, 1, ('C5', 'Bb4')), (15, 1 if self.hush else 1 + 3 / 4, ('D5', 'Eb5'))]
        for b0, nb, notes in pairs:
            for j, n_ in enumerate(notes):
                g = 0.35 + 0.5 * self.I(b0 + nb); last_pair = b0 >= 15 and not self.hush
                m.add('rub', held(nb * B, n_, strings, att=1.2 if b0 < 12 else 0.25, rel=0.012 if last_pair else 0.6, gain=g, seed=b0 * 3 + j), t0 + b0 * B)
        if not self.bed:   # riser over bars 13-17, stopping dead one beat before the hit
            n0 = int((t0 + 12 * B) * SR); n1 = int((t0 + 16 * B + (0 if self.hush else 3 * bt)) * SR); k = n1 - n0
            if 0 <= n0 and n1 <= m.n:
                r = m.r(12, 'riser'); nz = r.standard_normal((k, 2)); x = np.linspace(0, 1, k)
                out = np.zeros((k, 2)); seg = 8
                for s in range(seg):   # piecewise band-pass sweep 400 Hz -> 5 kHz
                    a, z = s * k // seg, (s + 1) * k // seg; fc = 400 * (12.5 ** ((s + .5) / seg))
                    out[a:z] = filt(sos_bp(fc / 1.6, fc * 1.6), nz[a:z + 0])
                out *= (x ** 2.2)[:, None]; kf = int((0.6 if self.hush else 0.01) * SR); out[-kf:] *= np.linspace(1, 0, kf)[:, None]
                m.addbuf('riser', np.pad(out, ((n0, m.n - n1), (0, 0))))
                # tremolo strings on the climb: the rub pair re-articulated as sixteenths in bar 17
                for j in range(0 if self.hush else 12):
                    tt = t0 + 16 * B + j * bt / 4
                    for n_ in ('D4', 'Eb4', 'A4'): m.add('rub', reed([(n_, bt / 4 * 0.9, 'stacc')], 0.25 + 0.04 * j, m.r(16, f'tr{j}{n_}'), 'mizmar'), tt, 0.0)
    def beds(self, m, t0, secs, L, fade_in, t_end=None):
        n = m.n; d = drone_voice(n, 'D2', L, arghul, seed=6) + 0.6 * drone_voice(n, 'D3', L, strings, seed=7)
        e = np.ones(n)
        if fade_in: k = int(1.2 * SR); e[:k] = np.linspace(0, 1, k)
        if not self.bed:
            t = np.arange(n) / SR; e *= np.clip(0.8 + 0.2 * t / (16 * self.bar), 0, 1)
            i = int((16 * self.bar + 3 * self.beat) * SR); k2 = int(0.012 * SR)   # the drone stops too: the pause before the hit
            j = int(17 * self.bar * SR); e[i:i + k2] *= np.linspace(1, 0, k2); e[i + k2:j] = 0
            e[j:] = np.exp(-np.arange(n - j) / (1.2 * SR)) * 0.9
        m.addbuf('drone', d * e[:, None] * 0.5)
        if self.bed: m.addbuf('rub', 0.32 * (drone_voice(n, 'D4', L, strings, seed=12) + drone_voice(n, 'Eb4', L, strings, seed=13)))
    def ending(self, m, t): pass
    def score_hit(self, m, t):
        r = m.r(0, 'hit')
        m.add('frame', frame(r, 1.0, buzz=0.2), t, 0); m.add('dum', dum(r, 1.0), t, 0); m.add('zill', zills(r, 1.0, 2.5), t + 0.002, -0.3)
        m.add('boom', boom(r, 0.8, dur=4.0), t, 0)
        for n_, p in (('D2', 0), ('D3', 0.25), ('A3', -0.25)): m.add('oud', oud(n_, 3.0, 0.9, 2), t + r.normal(0, .003), p)
        m.add('reed', reed([('D4', 1.6, 'fall')], 0.55, r, 'mizmar'), t + 0.01, -0.15)
    def hits(self):
        if self.bed: return {'loop': '8 bars, steady heartbeat every beat, D4/Eb4 rub'}
        if self.hush: return {'hush_bar17_from_s': round(16 * self.bar, 3), 'silence_from_s': round(16 * self.bar + 3 * self.beat, 3),
                              'VERDICT_HIT_s': round(17 * self.bar, 3), 'note': 'bar 17 = drone + accelerating heartbeat only (script shot 33)'}
        return {'rub_enters_bar': 5, 'climb_bars': [13, 14, 15, 16], 'silence_from_s': round(16 * self.bar + 3 * self.beat, 3),
                'VERDICT_HIT_s': round(17 * self.bar, 3), 'verdict_hit_bar': 18}

PLAYFUL_CFG = {'dum': dict(db=-5, send=0.1), 'tek': dict(db=-14, send=0.18, eq=[(2500, -4, 1.2)]), 'perc': dict(db=-21, send=0.25, hp=3000),
               'oud': dict(body=OUD_BODY, db=0, send=0.25), 'bass': dict(body=OUD_BODY, db=-2, send=0.04, lp=1000),
               'reed': dict(db=-4, send=0.28, hp=200), 'qanun': dict(body=QANUN_BODY, db=-8, send=0.3), 'clap': dict(db=-18, send=0.3),
               'zill': dict(db=-15, send=0.3), 'drone': dict(db=-15, send=0.1, lp=1500)}
class Playful(Cue):
    """comic beats: bouncy staccato oud + oom-pah bass + light darbuka + a sneaky staccato reed. 112 BPM, 24 bars."""
    S1 = [('D4', 1, 'stacc'), ('r', 1), ('Eb4', 1, 'stacc'), ('r', 1), ('F#4', 1, 'stacc'), ('r', 3),
          ('G4', 1, 'stacc'), ('F#4', 1, 'stacc'), ('Eb4', 1, 'stacc'), ('r', 1), ('D4', 1, 'stacc'), ('r', 3)]
    S2 = [('A4', 1, 'stacc'), ('r', 1), ('Bb4', 1, 'grace'), ('r', 1), ('A4', 1, 'stacc'), ('r', 3),
          ('G4', 1, 'stacc'), ('r', 1), ('F#4', 1, 'stacc'), ('r', 1), ('Eb4', 1, 'stacc'), ('D4', 1, 'stacc'), ('C#4', 1, 'stacc'), ('D4', 1, 'stacc')]
    BWOOP = [('D5', 3, 'fall')]
    ANSWER = [[(0, 'D3', 1, .8), (2, 'Eb3', 1, .7), (4, 'F#3', 1, .8)], [(0, 'G3', 1, .75), (1, 'F#3', 1, .6), (2, 'Eb3', 1, .65), (4, 'D3', 1, .85)]]
    def __init__(self, bars=24, seed=63):
        super().__init__('playful', 112, bars, seed, 0.9, PLAYFUL_CFG)
    def phrase(self, m, t, seq, e8, r, v=0.55, pan=-0.15):   # rests split a sneaky line into staccato fragments
        tt = t; chunk = []
        def flush(t_start):
            if chunk: m.add('reed', reed([(n, k * e8, fl) for n, k, fl in chunk], v, r, 'mizmar', legato=False), t_start, pan)
        start = t
        for n, k, *f in seq:
            if n == 'r': flush(start); chunk = []; tt += k * e8; start = tt; continue
            chunk.append((n, k, (f[0] if f else '') + ' tongue')); tt += k * e8
        flush(start)
    def score(self, m, t0, first):
        e8 = self.beat / 2; B = self.bar
        for b in range(self.N):
            t = t0 + b * B; r = m.r(b, 'p'); ph = b % 8
            darbuka_bar(m, t, b, e8, r, 0.7, fill=(b % 4 == 3 and b % 8 != 7), roll=(b % 8 == 7), lilt=0.06, clapbus='clap' if b >= 16 else None)
            riq_bar(m, t, e8, r, 0.6)
            # oom-pah: D2 on 1 & 3, A2 on 2 & 4; a chromatic walk-up into each 4-bar phrase
            walk = ['A1', 'Bb1', 'C2', 'C#2'] if b % 4 == 3 else None
            for q in range(4):
                n_ = walk[q] if walk else ('D2' if q % 2 == 0 else 'A2')
                m.add('bass', bass(n_, 0.4, 0.8 if q % 2 == 0 else 0.6, int(r.integers(4)), t60=0.18), t + q * self.beat + r.normal(0, .004), 0)
            for e in (1, 3, 5, 7):   # off-beat oud 'chk' dyads
                for n_, p in (('D3', 0.45 if e % 4 == 1 else -0.45), ('A3', 0.4 if e % 4 == 1 else -0.4)): m.add('oud', oud(n_, 0.3, 0.38 * (0.85 + 0.3 * r.random()), int(r.integers(4)), 0.25), t + e * e8 + 0.05 * e8 + r.normal(0, .005), p)
            if b % 4 == 0: m.add('zill', zills(r, 0.55), t, -0.4)
            if ph in (2, 3): oud_line(m, t, e8, self.ANSWER[ph - 2], r, 0.9, pan=0.25, stacc=0.35, trem=False)
            if ph in (6,): oud_line(m, t, e8, self.ANSWER[0], r, 0.9, pan=0.25, stacc=0.35, trem=False)
        for b0 in range(0, self.N, 8):
            r = m.r(b0, 'reed'); t = t0 + b0 * B
            self.phrase(m, t, self.S1, e8, r)
            self.phrase(m, t + 4 * B, self.S2, e8, r)
            m.add('reed', reed(mel(self.BWOOP, e8), 0.45, r, 'mizmar'), t + 7 * B + 4 * e8, -0.1)
            if b0 == 8:   # second time round the qanun doubles the sneak an octave up (pizzicato)
                tt = t
                for n, k, *f in self.S1 + self.S2[:0]:
                    if n != 'r': m.add('qanun', qanun(midi(n) + 12, 0.5, 0.4, int(tt * 10) % 5), tt + 0.004, 0.45)
                    tt += k * e8
                tt = t + 4 * B
                for n, k, *f in self.S2:
                    if n != 'r': m.add('qanun', qanun(midi(n) + 12, 0.5, 0.4, int(tt * 10) % 5), tt + 0.004, 0.45)
                    tt += k * e8
    def beds(self, m, t0, secs, L, fade_in, t_end=None):
        n = m.n; d = drone_voice(n, 'D3', L, arghul, seed=8); e = np.ones(n)
        if fade_in: k = int(0.05 * SR); e[:k] = np.linspace(0, 1, k)
        if t_end is not None:
            i = int((t_end + 0.1) * SR); k = int(1.2 * SR); e[i:i + k] *= np.linspace(1, 0, min(k, n - i)) ** 2; e[i + k:] = 0
        m.addbuf('drone', d * e[:, None] * 0.5)
    def ending(self, m, t):   # comic button: dum-tek! + bwoop + zill
        r = m.r(0, 'end'); e8 = self.beat / 2
        m.add('dum', dum(r, 0.8), t + e8, 0); m.add('tek', tek(r, 0.9), t + e8 + 0.004, 0.1); m.add('zill', zills(r, 0.9, 2.0), t + e8, -0.3)
        for n_ in ('D3', 'A3', 'D4'): m.add('oud', oud(n_, 1.0, 0.7, 1, 0.5), t + e8 + 0.003, 0.25)
    def hits(self): return {'sneak_phrases_bars': [1, 5, 9, 13, 17, 21], 'bwoop_bars': [8, 16, 24], 'claps_from_bar': 17}

PARADISE_CFG = {'harp': dict(body=HARP_BODY, db=0, send=0.45), 'pad': dict(db=-9, send=0.45, lp=4500), 'ney': dict(db=-4, send=0.45, hp=220),
                'qanun': dict(body=QANUN_BODY, db=-6, send=0.4), 'frame': dict(db=-9, send=0.35), 'perc': dict(db=-17, send=0.4, hp=3500),
                'drone': dict(db=-13, send=0.3, lp=1500), 'zill': dict(db=-14, send=0.5), 'bowl': dict(db=-12, send=0.6)}
class Paradise(Cue):
    """the Field of Reeds: harp arpeggios over D | Gm | Eb | D (the Hijaz cadence, warm), sweet ney, qanun tremolo,
    gentle bendir. 78 BPM (3/4 of groove), 16 bars."""
    CH = {'D': ('D3', 'A3', 'D4', 'F#4', 'A4', 'D5'), 'Gm': ('G2', 'D3', 'G3', 'Bb3', 'D4', 'G4'), 'Eb': ('Eb3', 'Bb3', 'Eb4', 'G4', 'Bb4', 'Eb5'),
          'Cm': ('C3', 'G3', 'C4', 'Eb4', 'G4', 'C5')}
    PROG = ['D', 'Gm', 'Eb', 'D', 'D', 'Gm', 'Cm', 'D', 'Gm', 'D', 'Eb', 'D', 'D', 'Gm', 'Eb', 'D']
    NEY = {4: [('A4', 3, 'turn'), ('F#4', 1), ('G4', 2), ('Bb4', 1), ('A4', 1), ('G4', 1.5), ('Eb4', .5), ('G4', 2), ('F#4', 2, 'mord'), ('D4', 2)],
           12: [('D5', 2), ('C5', .5), ('Bb4', .5), ('A4', 1), ('Bb4', 2, 'grace'), ('A4', 1), ('G4', 1), ('G4', 1, 'tongue'), ('Bb4', 1), ('A4', 1), ('G4', 1), ('F#4', 2, 'turn'), ('D4', 2)]}
    QMEL = [('F#5', 2), ('G5', 1), ('A5', 1), ('Bb5', 2), ('A5', 2), ('G5', 1.5), ('F#5', .5), ('Eb5', 1), ('D5', 1), ('Eb5', 2), ('D5', 2)]
    def __init__(self, bars=16, seed=64):
        super().__init__('paradise', 78, bars, seed, 2.2, PARADISE_CFG)
    def score(self, m, t0, first):
        bt, B = self.beat, self.bar; e8 = bt / 2
        for b in range(self.N):
            t = t0 + b * B; r = m.r(b, 'pa'); ch = self.CH[self.PROG[b]]; hi = b >= 8
            order = [0, 1, 2, 3, 4, 3, 2, 1] if not hi else [0, 2, 3, 4, 5, 4, 3, 2]
            for j, k in enumerate(order):
                v = (0.7 if j == 0 else 0.48 + 0.12 * (j == 4)) * (0.9 + 0.2 * r.random())
                m.add('harp', harp(ch[k], 2.4, v, int(r.integers(4))), t + j * e8 + r.normal(0, .006), -0.35 + 0.1 * k)
            m.add('frame', frame(r, 0.5, 0, f_end=58, damp=0.8), t + r.normal(0, .004), 0)
            m.add('frame', frame(r, 0.25, 0, f_end=58, damp=0.7), t + 2 * bt + r.normal(0, .006), 0.1)
            for q in (1, 3): m.add('perc', riq(r, 0.35), t + q * bt + r.normal(0, .004), 0.5)
            if b % 4 == 0: m.add('zill', zills(r, 0.45, 2.0), t + 0.003, 0.4)
            # warm pad: the three chord tones in the middle register, held across repeated chords
            if b == 0 or self.PROG[b - 1] != self.PROG[b]:
                run = 1
                while b + run < self.N and self.PROG[b + run] == self.PROG[b]: run += 1
                for j, n_ in enumerate(ch[:3]):
                    m.add('pad', held(run * B + 0.15, n_, strings, att=0.6, rel=0.9, gain=0.45, seed=b * 5 + j), t - 0.15)
            if b in self.NEY: m.add('ney', reed(R(self.NEY[b], bt), 0.6, r, 'ney', breath=0.32), t + 0.02, -0.15)
        tt = t0 + 8 * B; r = m.r(8, 'qmel')   # bars 9-12: the qanun sings, with tremolo on long notes
        for n_, k in self.QMEL:
            d = k * bt; nn = max(1, int(d / (bt / 4))) if k >= 1 else 1
            for j in range(nn): m.add('qanun', qanun(n_, 0.8, (0.6 if j == 0 else 0.4) * (0.9 + 0.2 * r.random()), j % 4), tt + j * bt / 4 + r.normal(0, .003), 0.35)
            tt += d
    def beds(self, m, t0, secs, L, fade_in, t_end=None):
        n = m.n; d = drone_voice(n, 'D2', L, strings, seed=10) + 0.5 * drone_voice(n, 'A2', L, strings, seed=11); e = np.ones(n)
        if fade_in: k = int(0.8 * SR); e[:k] = np.linspace(0, 1, k)
        if t_end is not None:
            i = int((t_end + 0.5) * SR); k = int(4.0 * SR); e[i:i + k] *= np.linspace(1, 0, min(k, n - i)) ** 2; e[i + k:] = 0
        m.addbuf('drone', d * e[:, None] * 0.5)
    def ending(self, m, t):   # a harp roll up D major to D6, bowl + zills, the pad dissolves
        r = m.r(0, 'end')
        for j, n_ in enumerate(('D3', 'A3', 'D4', 'F#4', 'A4', 'D5', 'F#5', 'A5', 'D6')):
            m.add('harp', harp(n_, 4.0, 0.62 - 0.02 * j, j % 4), t + j * 0.055, -0.4 + 0.1 * j)
        m.add('bowl', bowl(r, 'D5', 0.7, 6), t + 0.5, 0.3); m.add('zill', zills(r, 0.6, 2.5), t + 0.5, -0.3)
        m.add('pad', held(3.0, 'D3', strings, att=0.2, rel=3.0, gain=0.4, seed=99), t)
        m.add('pad', held(3.0, 'A3', strings, att=0.2, rel=3.0, gain=0.35, seed=98), t)
    def hits(self): return {'progression': self.PROG, 'ney_bars': [5, 13], 'qanun_melody_bars': [9, 12]}

def boom(rng, vel=1.0, dur=4.0):   # the low 'doom': sub drop + a phone-audible growl layer + a dark bronze ring
    n = int(dur * SR); t = np.arange(n) / SR
    f = 37 + 60 * np.exp(-t / 0.08); ph = 2 * np.pi * np.cumsum(f) / SR
    sub = np.sin(ph) * np.exp(-t / 1.1)
    growl = np.tanh(np.sin(ph) * 6) * np.exp(-t / 0.5); growl = filt(sos_bp(90, 900), growl) * 0.6
    nz = rng.standard_normal(n); thud = filt(sos_lp(400), nz) * np.exp(-t / 0.03) * 1.2
    ring = modes(n, [(hz('D3') * r_, a, tau) for r_, a, tau in ((1, .4, 2.0), (2.41, .25, 1.4), (3.89, .2, .9), (5.6, .12, .6), (1.006, .3, 1.8))], rng)
    return fade_edges((sub + growl + thud + 0.6 * ring) * vel, 0.0005, 0.3)

STING_CFG = {'reed': dict(db=-3, send=0.35, hp=180), 'frame': dict(db=0, send=0.4), 'dum': dict(db=0, send=0.2), 'tek': dict(db=-6, send=0.25),
             'zill': dict(db=-8, send=0.4), 'oud': dict(body=OUD_BODY, db=-2, send=0.3), 'boom': dict(db=0, send=0.35), 'qanun': dict(body=QANUN_BODY, db=-2, send=0.4),
             'harp': dict(body=HARP_BODY, db=0, send=0.5), 'bowl': dict(db=-4, send=0.6), 'drone': dict(db=-6, send=0.3), 'bass': dict(db=-2, send=0.1)}
def sting(name):
    """2-3.5 s stings. returns (stereo, hit_time_s)."""
    bt = 60 / 104; e8 = bt / 2; secs = 5.0; m = Mix(secs, 70, 1); r = np.random.default_rng(zlib.crc32(name.encode()))
    if name == 'sting_reed_flourish':   # a Hijaz run up to D5, landing with frame drum + zills
        run = [('D4', .045), ('Eb4', .045), ('F#4', .045), ('G4', .045), ('A4', .045), ('Bb4', .045), ('C5', .045), ('C#5', .045)]
        hit = 0.40
        m.add('reed', reed(run + [('D5', 1.6, 'mord')], 0.75, r, 'mizmar'), hit - 0.36, -0.1)
        m.add('frame', frame(r, 1.0, 0.15), hit, 0); m.add('zill', zills(r, 0.9, 2.2), hit + 0.004, 0.35)
        m.add('oud', oud('D3', 2.0, 0.8, 1), hit, 0.25); m.add('oud', oud('A3', 2.0, 0.6, 2), hit + 0.012, 0.3)
    elif name == 'sting_roll_hit':   # two beats of darbuka roll (16ths then 32nds), dum-tek + zills on the downbeat
        hit = 2 * bt; k = 0
        for j in range(4): m.add('tek', tek(r, 0.25 + 0.05 * j, j % 2 == 1), j * e8 / 2 + r.normal(0, .002), (-1) ** j * .15); k += 1
        for j in range(16): m.add('tek', tek(r, 0.35 + 0.035 * j, j % 2 == 1), bt + j * e8 / 4 + r.normal(0, .0015), (-1) ** j * .15)
        m.add('dum', dum(r, 1.0), hit, 0); m.add('tek', tek(r, 1.0), hit + 0.004, 0.1); m.add('zill', zills(r, 1.0, 2.2), hit, -0.3)
        m.add('bass', oud('D2', 2.0, 0.9, 1), hit, 0); m.add('oud', oud('D3', 1.5, 0.7, 2), hit, 0.25)
    elif name == 'sting_doom':   # Ammit: the low doom, D-Eb cluster blare falling into the floor
        hit = 0.05
        m.add('boom', boom(r, 1.0, 4.4), hit, 0); m.add('frame', frame(r, 1.0, 0.25, f_end=44), hit, 0); m.add('dum', dum(r, 0.9), hit, 0)
        for n_, p in (('D2', -0.2), ('Eb2', 0.2), ('A2', 0)):
            m.add('reed', reed([(n_, 2.4, 'fall')], 0.55, np.random.default_rng(midi(n_)), 'mizmar'), hit + 0.01, p)
    elif name == 'sting_reveal':   # qanun glissando up the Hijaz scale into a D major harp chord + bowl (paradise / feather)
        run = [n for n in SCALE if 62 <= n <= 86]; hit = len(run) * 0.032 + 0.05
        for j, n_ in enumerate(run): m.add('qanun', qanun(n_, 1.2, 0.35 + 0.025 * j, j % 4), 0.05 + j * 0.032, -0.3 + 0.03 * j)
        for j, n_ in enumerate(('D3', 'A3', 'D4', 'F#4', 'A4', 'D5')): m.add('harp', harp(n_, 3.5, 0.6, j % 4), hit + j * 0.01, -0.3 + 0.12 * j)
        m.add('bowl', bowl(r, 'D5', 0.9, 4), hit, 0.2); m.add('zill', zills(r, 0.7, 2.5), hit, -0.3)
    elif name == 'sting_comic':   # oud 'dun-dun' + a reed wah falling off (Ammit's gulp, a gag)
        hit = 0.0
        m.add('oud', oud('D3', 0.6, 0.9, 1, 0.4), 0.0, 0.2); m.add('oud', oud('A2', 0.8, 0.9, 2, 0.4), e8, 0.2)
        m.add('dum', dum(r, 0.8), e8, 0); m.add('reed', reed([('A4', 0.25, 'tongue'), ('F#4', 0.25, 'tongue'), ('D4', 0.9, 'fall')], 0.6, r, 'mizmar', legato=False), 2 * e8, -0.1)
    y = render(m, STING_CFG, make_ir(1.4, seed=7))
    return y, hit

def trim_tail(y, floor_db=-70.0, fade=0.25):
    e = np.abs(y).max(1); idx = np.where(e > 10 ** (floor_db / 20))[0]; end = (idx[-1] + 1) if len(idx) else len(y)
    y = y[:end].copy(); k = min(len(y), int(fade * SR)); y[-k:] *= np.linspace(1, 0, k)[:, None] ** 2; return y
def write(path, y): sf.write(path, y.astype(np.float32), SR, subtype='PCM_24')

CUES = {'groove': Groove, 'mystic': Mystic, 'tension': Tension, 'playful': Playful, 'paradise': Paradise}
def make_cue(name, out, meta):
    import time; t_ = time.time(); cue = CUES[name]()
    full = build(cue, 'full')
    if name == 'tension':
        m = Mix(full.shape[0] / SR, cue.seed, cue.N); cue.score_hit(m, cue.L - cue.bar)
        full = full + render(m, cue.cfg, make_ir(cue.rt60, seed=cue.seed))
        full = trim_tail(master(full, fit_gain(full, int(17 * cue.bar * SR)))); write(f'{out}/tension.wav', full)
        bed = Tension(bed=True); lp = build(bed, 'loop'); lp = master(lp, fit_gain(lp), circular=True); write(f'{out}/tension_loop.wav', lp)
        hu = Tension(hush=True); hf = build(hu, 'full'); m2 = Mix(hf.shape[0] / SR, hu.seed, hu.N); hu.score_hit(m2, hu.L - hu.bar)
        hf = hf + render(m2, hu.cfg, make_ir(hu.rt60, seed=hu.seed)); hf = trim_tail(master(hf, fit_gain(hf, int(16 * hu.bar * SR)))); write(f'{out}/tension_hush.wav', hf)
        meta['tension_hush'] = dict(file='tension_hush.wav', bpm=78, beats_per_bar=4, bar_s=round(hu.bar, 4), bars=hu.N, length_s=round(len(hf) / SR, 3),
                                    downbeat0_s=0.0, hits=hu.hits(), lufs=round(lufs(hf), 2), tp=round(true_peak(hf), 2))
        meta['tension'] = dict(file='tension.wav', bpm=78, beats_per_bar=4, bar_s=round(cue.bar, 4), bars=cue.N, length_s=round(len(full) / SR, 3),
                               downbeat0_s=0.0, hits=cue.hits(), lufs=round(lufs(full), 2), tp=round(true_peak(full), 2))
        meta['tension_loop'] = dict(file='tension_loop.wav', bpm=78, bar_s=round(bed.bar, 4), bars=8, length_s=round(len(lp) / SR, 3),
                                    hits=bed.hits(), lufs=round(lufs(lp), 2), tp=round(true_peak(lp), 2))
    else:
        G = fit_gain(full, int(cue.L * SR))   # the body sets the gain; loop, button and tail ride on the same gain
        full = trim_tail(master(full, G)); write(f'{out}/{name}.wav', full)
        lp = master(build(cue, 'loop'), G, circular=True); write(f'{out}/{name}_loop.wav', lp)
        en = build(cue, 'end'); en = master(en, G)[int(cue.L * SR):]; en = trim_tail(en); write(f'{out}/{name}_end.wav', en)
        meta[name] = dict(file=f'{name}.wav', loop=f'{name}_loop.wav', end=f'{name}_end.wav', bpm=round(cue.bpm, 3), beats_per_bar=4,
                          bar_s=round(cue.bar, 4), bars=cue.N, loop_s=round(cue.L, 4), length_s=round(len(full) / SR, 3), button_s=round(cue.L, 3),
                          downbeat0_s=0.0, hits=cue.hits(), lufs=round(lufs(full[:int(cue.L * SR)]), 2), tp=round(true_peak(full), 2),
                          loop_lufs=round(lufs(lp), 2), loop_tp=round(true_peak(lp), 2))
    print(name, 'done', round(time.time() - t_, 1), 's', json.dumps(meta.get(name, meta.get('tension')), ensure_ascii=False)[:300], flush=True)
def make_stings(out, meta):
    for nm in ('sting_reed_flourish', 'sting_roll_hit', 'sting_doom', 'sting_reveal', 'sting_comic'):
        y, hit = sting(nm); y = filt(sos_hp(28), y)
        import pyloudnorm as pyln
        st = max(pyln.Meter(SR, block_size=min(3.0, len(y) / SR - 0.01)).integrated_loudness(y[:int(3.0 * SR)]), -60)
        y = y * 10 ** ((-14 - st) / 20); y = limit(y, -1.75); y = trim_tail(y, -60, 0.6)
        write(f'{out}/{nm}.wav', y)
        meta[nm] = dict(file=f'{nm}.wav', hit_s=round(hit, 3), length_s=round(len(y) / SR, 3), tp=round(true_peak(y), 2), st_lufs=round(lufs(y), 1))
        print(nm, meta[nm], flush=True)

if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else 'cues'; os.makedirs(out, exist_ok=True)
    which = sys.argv[2:] or ['groove', 'mystic', 'tension', 'playful', 'paradise', 'stings']
    mp = f'{out}/cues.json'; meta = json.load(open(mp)) if os.path.exists(mp) else {}
    for w in which:
        if w == 'stings': make_stings(out, meta)
        else: make_cue(w, out, meta)
        json.dump(meta, open(mp, 'w'), ensure_ascii=False, indent=1)
