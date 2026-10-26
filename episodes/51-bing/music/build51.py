"""ep51 《古代没有冰箱，夏天怎么吃冰？》 music bed (subtitle-only film; SFX come later).

Owner (2026-10-26): "use the same BGM, you are given the option to sample/slice etc to make it more whole but it
should still be smooth."  Brief: episodes/51-bing/MUSIC_BRIEF.md.  Never commit audio.

Song: episodes/51-bing/music/bgm.mp3 (バケモノの唄 instrumental, 254.1 s, md5 32975059d98bb656410fe1a58b6cdb3b,
same file as ep50 / ep41 bgm2.mp3).

Song grid (measured in ep50, re-checked here: HF onsets within -6..+2 ms of the formula at 27 bar lines):
  beat P = 0.56605 s (106.0 bpm), 4/4
  part 1 downbeats B1(k) = 0.5688 + 2.2642k   (bars 0..79; bar 79 = stop bar: 4 eighth-note hits, then digital silence)
  part 2 downbeats B2(k) = 1.1348 + 2.2642k   (bars 80..110)
Song form and harmony (chroma, this file):
  A minor, 2-bar loop F-E | Am-C (verse, valley, lead-in); chorus F-G | C | Dm-E | Am-C.
  intro 0-3 | A 4-7 | B pre 8-15 (bright pedal, 15 = fill) | chorus-1 16-23 (bar 23 beat 4 = deep 1-beat break) |
  verse 24-39 | A'' 40-47 | chorus-2 48-55 (bar 55 beat 4 = shallow break, bass keeps going) | verse 56-63 |
  valley 64-71 (no kick, 2-bar hit/answer pattern) | B pre 72-78 | stop 79 (E-chord hits) + 1.6 s silence |
  lead-in 80-83 (no sub) | DROP 84-87 (modulates) | Bb-minor body 88-103 (2-bar loop Gb-F | Bbm-Db) |
  coda 104-110 (drums out, same 2-bar loop: 104 Gb-F, 105 Bbm-Db, 106 Gb-F, 107 Bbm-Db ...).
Near copies (per-beat r at <2 ms lag): 27~7 .96, 23~55 .95, 59~63 .92, 80~82 .95, 16~48 .9, 89~103 .97.
Even/odd bars of the Bb body do NOT match (r ~.55), so bar parity is kept everywhere.

Fixed picture contract (film seconds):
  grid A  DA(k) = 0.4432 + 2.2642k  (0 <= t < 70.63; DA(4) = 9.50 title)
  hush    70.63 - 74.26
  grid B  DB(k) = 74.2586 + 2.2642k (DB(0) return, DB(14) = 105.957 peak, DB(17) = 112.750 end card)
  film    119.25 s

Film layout (n = grid-A bar, m = grid-B bar; every span is the song playing straight through):
  film span        song span           bars                                   join in -> type, r
  S1  0.000- 16.8  45.410- 62.2        19b4(0.44 s pickup) 20-23 hook, 24-27b3   start mid-beat, 4 ms de-click
                                       TITLE = bar 24 re-entry after the bar-23 break, at DA(4) 9.50
  J2  n7 beat 3    27 -> 7 (copy)      the song's own A -> B pre approach        lin xfade, lag-aligned, r .96
  S2  16.8- 52.9   16.7- 52.8          7b4, B pre 8-15, chorus-1 16-23b2         (= the song at offset 0.1256)
                                       chorus downbeat at DA(16) 36.67 = release after 先猜？
  J3  n23 beat 2   23 -> 55 (copy)     so the break before n24 is the shallow one (no second "title slam")
  S3  52.9- 62.7   125.4-135.2         55b2-b4 (break), verse 56-58, 59b1-b3
  J4  n27 beat 3   59 -> 63 (copy)     so the valley follows the bar it follows in the song
  S4  62.7- 69.50  143.9-150.6         63b3-b4, valley 64-65, 66b1-b2 (F; hit at DA(28) 63.84 = Q4 chisels)
  J5  69.500       66b2 -> stop bar 79 under its first hit (E chord = the E of bar 66's beats 3-4)
  S5  69.50- 70.7  179.44-180.66       stop bar 79: four eighth-note hits on DA(30) beats 3-4, silence from 70.63
  HUSH 70.63-74.26                     stop-bar ring (reverb of the hits) dies away into a held-breath FLOOR,
                                       reversed-reverb inhale of the bar-16 downbeat into DB(0)
                                       FLOOR (sound r1 addendum, QA Q4 "hush too long"): a spectral freeze of the
                                       song's own intro Am (bars 1 and 3, beats 1-2, harmonic part only; reads as an
                                       A-E open fifth, shared by the E stop chord and the F return), dark (90 Hz-2.5 kHz),
                                       half-wide stereo, faded in under the ring 70.30-71.10, held at FLOOR_LUFS,
                                       faded out over the last beat into DB(0). Without it the bed sat below
                                       -35 LUFS-M for 2.2 s (owner: a silence of ~1 s at most); with it, 0 s.
  S6  74.26- 92.37 36.80- 54.91        chorus-1 16-23 (return on the chorus downbeat at DB(0), deep break 91.80-92.37)
  J7  92.372       break -> lead-in    23b4 break -> bar 80 first note (from the song's own silence), cut on the bar line
  S7  92.37- 93.7  182.27-183.6        lead-in 80 b1-b2
  J8  m8 beat 3    80 -> 82 (copy)     r .95
  S8  93.7-112.75  187.9-207.18        82b3, 83, DROP 84 at DB(10) 96.90, 85-87, ARRIVAL 88 (Bb minor) at DB(14)
                                       105.957, 89, 90 (Gb-F = the air 111.75-112.75 sits on the dominant F)
  J9  112.750      90 -> coda 105      drums stop on the downbeat; harmony goes F -> Bbm (V -> i), exactly the
                                       chord the song would play next (91 and 105 are both Bbm-Db)
  S9  112.75-119.1 238.88-245.0        coda 105 Bbm-Db, 106 Gb-F, 107 Bbm faded out (cos^1.5) 117.27 -> 119.10
Gain rides (fades only; no ducking, no stretch, no pitch): BUILD ramp BUILD_DB -> 0 dB across DB(0)..DB(10)
(post-hush chorus + lead-in) so the second half grows into the drop; +RISE_DB on the arrival bars 88-90 (step
hidden under the 88 downbeat, removed under the fall). Then -14 LUFS integrated, true peak <= -1.5 dBTP.

Also writes ep51_bed_untouched.wav: the song in one piece from song 0.1256 s (bar 0 at 0.4432 = DA(0), bar 4 = the
groove/sub entry = the first hard drop at 9.50), gain to -14 LUFS, one fade over bar DA(51)..DA(52) 115.92->118.18.
"""
import numpy as np, soundfile as sf, subprocess, json, os
from scipy.signal import fftconvolve, lfilter, resample_poly, butter, sosfilt

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
SONG = os.path.join(HERE, 'bgm.mp3')
OUT = os.path.join(HERE, 'ep51_bed.wav')
OUT_U = os.path.join(HERE, 'ep51_bed_untouched.wav')
P = 0.56605
BAR = 4 * P
FILM_LEN = 119.25

# ---- tunables (dB unless noted)
BUILD_DB = -2.5            # post-hush chorus starts this much under unity, ramps to 0 dB at the drop DB(10)
RISE_DB = 1.5              # arrival lift, bars 88-90 (DB14..DB17)
RING_DB = -12.0            # stop-bar ring into the hush
RING_TAU = 0.55            # ring decay (s)
INHALE_DB = -10.0          # reversed-reverb inhale into DB(0)
INHALE_LEN = 1.4           # s (r1 addendum: 1.0 -> 1.4, the inhale starts ~72.86 so the breath is drawn earlier)
FLOOR_LUFS = -33.0         # held-breath floor under the hush: its integrated loudness in the final bed (None = off)
FLOOR_BARS = (1, 3)        # song part-1 bars whose beats 1-2 (intro Am, no drums) are frozen
FLOOR_ENV = (70.30, 71.10) # fade-in under the stop-bar ring; fade-out = the last beat before DB(0)
RELEASE_SWELL_DB = -15.0   # reversed-reverb swell into the chorus downbeat DA(16) (None = off)
FADE = (117.27, 119.10)    # coda fade: from the bar-107 Bbm (song 243.40) to silence before the film ends
LUFS_TARGET = -14.0
TP_CEIL = -1.5


def B1(k): return 0.5688 + k * BAR          # song part-1 downbeat
def B2(k): return 1.1348 + k * BAR          # song part-2 downbeat
def DA(k): return 0.4432 + k * BAR          # film grid A
def DB(k): return 74.2586 + k * BAR         # film grid B


def load(path):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


song = load(SONG)
S = lambda t: int(round(t * SR))
N = S(FILM_LEN)


def attack(t_nom, before=0.012, after=0.010):
    """Start of the transient nearest a nominal song time: first 0.25 ms frame whose 2-8 kHz energy jumps."""
    a = S(t_nom - before); b = S(t_nom + after)
    hp = sosfilt(butter(4, [2000, 8000], 'band', fs=SR, output='sos'), song[a - 4800:b].mean(1))[4800:]
    h = S(0.00025); e = np.sqrt(np.mean(hp[:len(hp) // h * h].reshape(-1, h) ** 2, 1)) + 1e-9
    d = 20 * np.log10(e[1:] / e[:-1]); d[e[1:] < 0.05 * e.max()] = 0      # ignore jumps out of the noise floor
    i = int(np.argmax(d > 6.0)) if np.any(d > 6.0) else int(np.argmax(d))
    return (a + (i + 1) * h) / SR


def silence_start(t0, t1, thr=1e-5, hold=0.020):
    """First moment from which the song stays below thr (both channels) for at least `hold` seconds."""
    x = np.abs(song[S(t0):S(t1)]).max(1) < thr
    h = S(hold); run = np.convolve(x.astype(float), np.ones(h), 'valid') >= h
    return t0 + int(np.argmax(run)) / SR


# ---- segment offsets (film = song - off)
OFF = {}
OFF['S1'] = B1(24) - DA(4)        # 45.4096  hook + title verse
OFF['S2'] = B1(8) - DA(8)         # 0.1256   B pre + chorus-1
OFF['S3'] = B1(55) - DA(23)       # chorus-2 end break + verse 56-58
OFF['S4'] = B1(63) - DA(27)       # verse 63 + valley
F_STOP = DA(30) + 2 * P           # 69.5003: stop hits on beats 3-4 of the last grid-A bar
OFF['S5'] = B1(79) - F_STOP
OFF['S6'] = B1(16) - DB(0)        # chorus-1 after the hush
OFF['S7'] = B2(80) - DB(8)        # lead-in from its first note
OFF['S8'] = B2(82) - DB(8)        # 82..90 (drop at DB10, arrival at DB14)
OFF['S9'] = B2(105) - DB(17)      # coda from bar 105

T_STOP_ATT = attack(B1(79))                   # stop-hit transient in the song
T_16_ATT = attack(B1(16))                     # bar-16 downbeat transient (return)
T_80_ATT = attack(182.266, before=0.02)       # lead-in first note
T_STOP_SIL = silence_start(180.45, 181.2)     # song goes digitally silent after the hits


def seg_audio(off, f0, f1, lag=0.0):
    a = S(f0 + off + lag); n = S(f1) - S(f0)
    out = np.zeros((n, 2), np.float32)
    lo, hi = max(a, 0), min(a + n, len(song))
    if hi > lo: out[lo - a:hi - a] = song[lo:hi]
    return out


def align_lag(offA, lagA, offB, f0, f1, search=0.004):
    a = seg_audio(offA, f0, f1, lagA).mean(1).astype(np.float64)
    L = S(search)
    bseg = seg_audio(offB, f0 - search, f1 + search).mean(1).astype(np.float64)
    c = fftconvolve(bseg, a[::-1], 'valid')
    cs = np.concatenate([[0], np.cumsum(bseg ** 2)]); n = len(a)
    nrm = np.sqrt(cs[n:] - cs[:-n])[:len(c)] * np.linalg.norm(a) + 1e-12
    r = c / nrm; k = int(np.argmax(r))
    return (k - L) / SR, float(r[k])


# ---- joins. copy: linear xfade between two copies of the same moment (lag-aligned).
#      cut:  outgoing fades over out=(a,b), incoming fades in over inn=(a,b) (equal-power quarter-sine)
JOINS = [
    dict(name='J2', a='S1', b='S2', kind='copy', win=(DA(7) + 2 * P + 0.040, DA(7) + 3 * P - 0.040),
         cut='bar 27 -> bar 7 inside beat 3 (27~7), so bar 8 follows the song\'s own bar 7'),
    dict(name='J3', a='S2', b='S3', kind='copy', win=(DA(23) + P + 0.040, DA(23) + 2 * P - 0.040),
         cut='bar 23 -> bar 55 inside beat 2 (23~55), so n24 follows the shallow chorus-2 break'),
    dict(name='J4', a='S3', b='S4', kind='copy', win=(DA(27) + 2 * P + 0.040, DA(27) + 3 * P - 0.040),
         cut='bar 59 -> bar 63 inside beat 3 (59~63), so the valley follows bar 63 as in the song'),
    dict(name='J5', a='S4', b='S5', kind='cut', out=(F_STOP - 0.002, F_STOP + 0.040),
         inn=(F_STOP - 0.0015 - (B1(79) - T_STOP_ATT), F_STOP - (B1(79) - T_STOP_ATT)),
         cut='valley 66 beat 2 -> stop bar 79 under its first hit (E chord on beat 3 = bar 66\'s own E)'),
    dict(name='J6', a=None, b='S6', kind='cut', inn=(DB(0) - (B1(16) - T_16_ATT) - 0.0015, DB(0) - (B1(16) - T_16_ATT)),
         cut='hush -> chorus-1 downbeat (bar 16) at DB(0), out of the inhale'),
    dict(name='J7', a='S6', b='S7', kind='cut', out=(DB(8) - 0.030, DB(8) - 0.003),
         inn=(DB(8) - 0.060, DB(8) - 0.050),
         cut='bar 23 beat-4 break -> lead-in bar 80 from its first note (incoming starts in the song\'s silence)'),
    dict(name='J8', a='S7', b='S8', kind='copy', win=(DB(8) + 2 * P + 0.040, DB(8) + 3 * P - 0.040),
         cut='lead-in 80 -> 82 inside beat 3 (80~82)'),
    dict(name='J9', a='S8', b='S9', kind='cut', out=(DB(17) - 0.035, DB(17) - 0.010), inn=(DB(17) - 0.140, DB(17) - 0.004),
         cut='bar 90 (Gb-F) -> coda bar 105 (Bbm): drums stop on the end-card downbeat, harmony V -> i'),
]
SEG_END = {'S5': T_STOP_SIL - OFF['S5'] + 0.004, 'S9': FADE[1] + 0.01}
SEG_START = {'S1': 0.0}
order = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9']
lags = {k: 0.0 for k in order}
env_in, env_out, xinfo = {}, {}, {}
for j in JOINS:
    if j['kind'] == 'copy':
        lag, r = align_lag(OFF[j['a']], lags[j['a']], OFF[j['b']], *j['win'])
        lags[j['b']] = lag
        env_out[j['a']] = ('lin', j['win']); env_in[j['b']] = ('lin', j['win'])
        xinfo[j['name']] = dict(film=[round(v, 4) for v in j['win']], kind='copy xfade (linear)', lag_ms=round(lag * 1000, 3),
                                r=round(r, 3), cut=j['cut'])
    else:
        if j['a']: env_out[j['a']] = ('eqp', j['out'])
        env_in[j['b']] = ('eqp', j['inn'])
        xinfo[j['name']] = dict(film_out=[round(v, 4) for v in j['out']] if j['a'] else None,
                                film_in=[round(v, 4) for v in j['inn']], kind='cut (equal-power)', lag_ms=0.0, r=None, cut=j['cut'])

# ---- assemble
t = np.arange(N) / SR
mix = np.zeros((N, 2), np.float32)
spans = {}
for s_ in order:
    f0 = env_in[s_][1][0] if s_ in env_in else SEG_START[s_]
    f1 = env_out[s_][1][1] if s_ in env_out else SEG_END[s_]
    f1 = min(f1, FILM_LEN)
    x = seg_audio(OFF[s_], f0, f1, lags[s_]); n = len(x); g = np.ones(n)
    tt = f0 + np.arange(n) / SR
    if s_ in env_in:
        k, (a, b) = env_in[s_]; w = np.clip((tt - a) / (b - a), 0, 1)
        g *= w if k == 'lin' else np.sin(w * np.pi / 2)
    if s_ in env_out:
        k, (a, b) = env_out[s_]; w = np.clip((b - tt) / (b - a), 0, 1)
        g *= w if k == 'lin' else np.sin(w * np.pi / 2)
    if s_ == 'S1':
        m = S(0.004); g[:m] *= np.linspace(0, 1, m)
    if s_ == 'S5':
        m = S(0.004); g[-m:] *= np.linspace(1, 0, m)
    i0 = S(f0)
    mix[i0:i0 + n] += (x * g[:, None]).astype(np.float32)
    spans[s_] = dict(film=[round(f0, 4), round(f1, 4)], song=[round(f0 + OFF[s_] + lags[s_], 4), round(f1 + OFF[s_] + lags[s_], 4)],
                     off=round(OFF[s_], 5), lag_ms=round(lags[s_] * 1000, 3))


# ---- effects, all made from the song itself
def ir(sec, tau, seed, lp=0.35):
    n = int(sec * SR); tt_ = np.arange(n) / SR; out = []
    for s in (seed, seed + 1):
        h = np.random.default_rng(s).standard_normal(n) * np.exp(-tt_ / tau)
        h = lfilter([lp], [1, -(1 - lp)], h); out.append(h / np.sqrt((h ** 2).sum()))
    return np.stack(out, 1)


def reverb(x, h):
    return np.stack([fftconvolve(x[:, c], h[:, c]) for c in range(2)], 1).astype(np.float32)


def place(x, f0, db):
    i = S(f0); x = x * 10 ** (db / 20)
    if i < 0: x = x[-i:]; i = 0
    j = min(i + len(x), N); mix[i:j] += x[:j - i]


def song_cut(a, b): return song[S(a):S(b)].copy()


def rev_swell(src_t, length, db, end_film, seed):
    """Reversed reverb of the song's downbeat at src_t (first 0.5 s), rising into end_film."""
    rv = reverb(song_cut(src_t, src_t + 0.5), ir(2.5, 0.55, seed))[::-1].copy()
    L = S(length); sw = rv[-S(0.5) - L:-S(0.5)].copy()
    sw *= (np.linspace(0, 1, len(sw)) ** 2.5)[:, None]
    place(sw, end_film - len(sw) / SR, db)


fx = []
if RELEASE_SWELL_DB is not None:   # (1) into the chorus downbeat after 先猜？
    rev_swell(T_16_ATT, 1.0, RELEASE_SWELL_DB, DA(16) - (B1(16) - T_16_ATT), 5)
    fx.append(dict(film=[round(DA(16) - 1.0, 3), round(DA(16), 3)], what='reversed-reverb swell of the bar-16 downbeat into the chorus release', db=RELEASE_SWELL_DB))
# (2) hush: the stop hits ring into the room, so the silence is a decay, not a dropout
place(reverb(song_cut(T_STOP_ATT, T_STOP_SIL), ir(3.0, RING_TAU, 31)), T_STOP_ATT - OFF['S5'], RING_DB)
fx.append(dict(film=[round(F_STOP, 3), round(F_STOP + 3.0, 3)], what='stop-bar ring (reverb of the four hits, tau %.2f s)' % RING_TAU, db=RING_DB))
# (3) inhale into the return: reversed reverb of the same bar-16 downbeat
rev_swell(T_16_ATT, INHALE_LEN, INHALE_DB, DB(0) - (B1(16) - T_16_ATT), 21)
fx.append(dict(film=[round(DB(0) - INHALE_LEN, 3), round(DB(0), 3)], what='reversed-reverb inhale of the bar-16 downbeat into DB(0)', db=INHALE_DB))


# ---- gain rides and the coda fade
def ramp(a, b): return np.clip((t - a) / (b - a), 0, 1)


gd = np.zeros(N)
gd += np.where((t >= DB(0) - 1.5) & (t < DB(10)), BUILD_DB * (1 - ramp(DB(0), DB(10))), 0.0)   # build
gd += RISE_DB * ramp(DB(14) - 0.008, DB(14) + 0.002) * (1 - ramp(DB(17) - 0.004, DB(17) + 0.060))
g = 10 ** (gd / 20)
w = ramp(*FADE); g = g * np.cos(w * np.pi / 2) ** 1.5
g[t >= FADE[1]] = 0.0
mix *= g[:, None].astype(np.float32)


import pyloudnorm as _pyln
meter_pre = _pyln.Meter(SR)

# ---- (4) the held-breath floor under the hush (placed after the gain rides so its level is exactly FLOOR_LUFS)
def spectral_freeze(bars, dur, seed, nfft=8192, hop=1024, jitter=0.35):
    """Median magnitude spectrum of the harmonic part of `bars` (beats 1-2 each), resynthesised for `dur` s with
    running phase + a small random phase jitter: a steady, slightly shimmering pad made only of the song itself."""
    import librosa
    mags = []
    for k in bars:
        x = song_cut(B1(k) + 0.03, B1(k) + 2 * P - 0.03).mean(1).astype(np.float64)
        mags.append(np.abs(librosa.stft(librosa.effects.harmonic(x, margin=2.0), n_fft=nfft, hop_length=hop)))
    mg = np.median(np.concatenate(mags, 1), 1)
    rng = np.random.default_rng(seed); w = 2 * np.pi * np.arange(nfft // 2 + 1) * hop / nfft
    ph = rng.uniform(0, 2 * np.pi, len(mg)); nfr = int(dur * SR / hop) + 4; Z = np.empty((len(mg), nfr), complex)
    for i in range(nfr):
        ph = ph + w + rng.normal(0, jitter, len(mg)); Z[:, i] = mg * np.exp(1j * ph)
    return librosa.istft(Z, hop_length=hop, n_fft=nfft)[:S(dur)]


if FLOOR_LUFS is not None:
    f0, f1 = FLOOR_ENV[0], DB(0)
    a_, b_ = spectral_freeze(FLOOR_BARS, f1 - f0, 1), spectral_freeze(FLOOR_BARS, f1 - f0, 2)
    pad = np.stack([a_, 0.6 * a_ + 0.8 * b_], 1)                                  # L/R r ~0.6: wide but mono-safe
    pad = sosfilt(butter(2, 2500, 'low', fs=SR, output='sos'), pad, axis=0)
    pad = sosfilt(butter(2, 90, 'high', fs=SR, output='sos'), pad, axis=0)
    gain_now = LUFS_TARGET - meter_pre.integrated_loudness(mix.astype(np.float64))  # what normalise() will apply
    pad *= 10 ** ((FLOOR_LUFS - gain_now - meter_pre.integrated_loudness(pad)) / 20)
    tp_ = f0 + np.arange(len(pad)) / SR
    env_ = np.sin(np.clip((tp_ - f0) / (FLOOR_ENV[1] - f0), 0, 1) * np.pi / 2) * np.cos(np.clip((tp_ - (f1 - P)) / P, 0, 1) * np.pi / 2)
    place((pad * env_[:, None]).astype(np.float32), f0, 0.0)
    fx.append(dict(film=[round(f0, 3), round(f1, 3)], what='held-breath floor: spectral freeze of the intro Am (bars %s, beats 1-2), 90 Hz-2.5 kHz' % (FLOOR_BARS,),
                   lufs=FLOOR_LUFS))

# ---- loudness
import pyloudnorm as pyln
meter = pyln.Meter(SR)


def true_peak(x): return 20 * np.log10(np.abs(resample_poly(x, 4, 1, axis=0)).max() + 1e-12)


def normalise(x, limit=True):
    lufs_in = meter.integrated_loudness(x.astype(np.float64))
    x = x * 10 ** ((LUFS_TARGET - lufs_in) / 20)
    tp = true_peak(x); limited = False
    if tp > TP_CEIL and limit:
        limited = True
        from scipy.ndimage import minimum_filter1d
        up = np.abs(resample_poly(x, 4, 1, axis=0)).max(1)
        pk = np.maximum.reduceat(up, np.arange(0, len(up), 4))[:len(x)]
        gr = np.minimum(1, 10 ** ((TP_CEIL - 0.2) / 20) / np.maximum(pk, 1e-9))
        gmin = minimum_filter1d(gr, size=2 * S(0.003) + 1)
        sm = np.empty_like(gmin); acc = 1.0; a_rel = np.exp(-1 / S(0.080))
        for i in range(len(gmin)):
            acc = gmin[i] if gmin[i] < acc else a_rel * acc + (1 - a_rel) * gmin[i]; sm[i] = acc
        x = x * sm[:, None].astype(np.float32)
        x = x * 10 ** ((LUFS_TARGET - meter.integrated_loudness(x.astype(np.float64))) / 20)
        tp = true_peak(x)
    return x, lufs_in, tp, limited


mix, lufs_in, tp, limited = normalise(mix)
assert len(mix) == N
sf.write(OUT, mix.astype(np.float32), SR, subtype='PCM_24')

# ---- untouched alternative: one continuous stretch, fade-out only (plus one static gain)
U_OFF = B1(0) - DA(0)              # 0.1256: song bar 0 at DA(0); bar 4 (groove + sub entry) at DA(4) = 9.50
U_FADE = (DA(51), DA(52))          # 115.92 -> 118.18, the last bar, ending on a downbeat
u = seg_audio(U_OFF, 0.0, FILM_LEN)
w = np.clip((t - U_FADE[0]) / (U_FADE[1] - U_FADE[0]), 0, 1)
u = u * (np.cos(w * np.pi / 2) ** 1.5 * (t < U_FADE[1]))[:, None].astype(np.float32)
u_lufs_in = meter.integrated_loudness(u.astype(np.float64))
u_gain = LUFS_TARGET - u_lufs_in
u_tp = true_peak(u) + u_gain
if u_tp > TP_CEIL: u_gain -= (u_tp - TP_CEIL); u_tp = TP_CEIL     # static gain only, never a limiter here
u = u * 10 ** (u_gain / 20)
sf.write(OUT_U, u.astype(np.float32), SR, subtype='PCM_24')

info = dict(OFF=OFF, lags_ms={k: round(v * 1000, 3) for k, v in lags.items()}, joins=xinfo, spans=spans, fx=fx,
            attacks=dict(stop79=T_STOP_ATT, bar16=T_16_ATT, lead80=T_80_ATT, stop_silence=T_STOP_SIL),
            anchors=dict(TITLE=DA(4), RELEASE=DA(16), VALLEY=DA(28), STOP=F_STOP, HUSH=[DA(31), DB(0)], RETURN=DB(0),
                         LEADIN=DB(8), DROP=DB(10), ARRIVAL=DB(14), ENDCARD=DB(17), FADE=list(FADE)),
            gains=dict(BUILD_DB=BUILD_DB, RISE_DB=RISE_DB),
            lufs_in=lufs_in, lufs_out=meter.integrated_loudness(mix.astype(np.float64)), true_peak_dbtp=tp,
            limited=limited, dur=len(mix) / SR,
            untouched=dict(song_offset=U_OFF, fade=list(U_FADE), gain_db=u_gain, lufs_in=u_lufs_in,
                           lufs_out=meter.integrated_loudness(u.astype(np.float64)), true_peak_dbtp=true_peak(u)))
json.dump(info, open(os.path.join(HERE, '_build_info.json'), 'w'), indent=1, default=float)
print(json.dumps(info, indent=1, default=float))
