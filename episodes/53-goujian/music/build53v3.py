"""ep53 v3 (2:25, 勾践 thread over verse 24-39) music bed. Derived from build53.py (v2); v2 layout notes below are kept for reference.
v3 layout: DIVE 72 @DA(9) .. 76 b1-b2 -> (copy) 12 b3 @DA(13) .. fill 15 @DA(16) .. chorus-1 16 (DRAW) @DA(17) .. 23 .. verse 24-39 @DA(25..40)
(勾践 thread) -> (cut) chorus 22-23 copy @DA(41..42) (paper test; 23 b4 deep break) -> (cut) valley 64-67 @DA(43..46) (M1, M2)
-> intro 2-3 hush @DA(47..48) -> near silence -> DROP 84 @DA(49) .. 89 -> (copy) 92 @DA(55) .. lift 94-95 .. P1 96 @DA(59) .. 98
-> (cut) coda 105 END CARD @DA(62); film 4360 frames = 145.333 s.

ep53 《越王勾践剑 / 真的没锈吗？》 music bed (subtitle-only, one continuous camera move; SFX come later).

Song: episodes/53-goujian/music/bgm.mp3 (バケモノの唄 instrumental, 254.1 s, mono 44.1 kHz mp3,
md5 32975059d98bb656410fe1a58b6cdb3b = ep50 / ep51). Never commit audio (episodes/*/music/*.wav|mp3 are gitignored).

Song grid (measured in ep50, re-checked here on the waveforms: drum downbeats start 1.5-7.5 ms before the formula,
the spectral-flux peak ~6 ms after it, so the formula is the perceived beat):
  beat P = 0.56605 s (106.0 bpm), 4/4
  part 1 downbeats B1(k) = 0.5688 + 2.2642k   (bars 0..79)
  part 2 downbeats B2(k) = 1.1348 + 2.2642k   (bars 80..110)
Song form / harmony (chroma): A minor, 2-bar loop F-E | Am-C (intro, verse, valley, lead-in); chorus F-G | C | Dm-E | Am-C.
  intro 0-3 (no drums; drum fill on 3 beat 4) | A 4-7 | B pre 8-15 (2-bar loop 8~10~12~14 r .97, 9~11~13 r .98;
  15 = fill) | chorus-1 16-23 (23 beat 4 = deep break: bass and kick out) | verse 24-39 | A'' 40-47 | chorus-2 48-55 |
  verse 56-63 | valley 64-71 (no hats; even bars = beat-1 hit, odd bars = off-beat kicks on 3& and 4&) |
  B pre 72-78 (~8-14, r .93) | stop 79 + 1.6 s silence | lead-in 80-83 (no sub) | DROP 84-87 (E pedal, most sub and
  the highest peak in the song: the hardest drop) | Bb-minor body 88-103 (2-bar loop Gb-F | Bbm-Db; 88 = arrival;
  94-95 = a lift that reprises the drop texture) | coda 104-110 (drums out).

ONE film grid for the whole film (the hush is exactly 2 bars, so the grid never breaks):
  DA(k) = 0.4432 + 2.2642k  (k = 0..49); beats DA(0) + 0.56605n
  DA(0)  0.443  first downbeat: rust blooms on beat 1 (frame 0 is 0.44 s into a pickup, music already moving)
  DA(4)  9.500  TITLE on the bar-24 re-entry after the bar-23 deep break (first hard drop)
  DA(8) 18.557  the lull bar: kick and hats fall away under 「…镀了铬，所以不锈。」
  DA(9) 20.821  DIVE (S4): B pre 72 downbeat, the bright pedal starts; after the crash bar the gain settles to
                -1.5 dB and builds back to 0 by the fill (a crescendo through the descent)
  DA(19) 43.463 DRAW (D6): chorus-1 downbeat (bar 16) after the bar-15 fill, with a reversed-reverb swell into it
  DA(27) 61.577 M1: bar-23 deep break -> valley (the macro zoom drops into the dark)
  DA(31) 70.633 HUSH (M3): drums stop, the song's own drumless intro (bars 2-3) under 「那它，到底为什么不锈？」,
                faded out by 74.412, then 0.75 s of near silence (a ring + an inhale)
  DA(33) 75.162 T1: DROP bar 84 (hardest drop of the film: near silence -> the song's most sub), +0.5 dB for 84-87
  DA(37) 84.217 arrival bar 88 (Bb minor) inside T3: the rewind lands
  DA(45) 102.332 P1 (emotional peak): body bar 96 (= the arrival chord Gb) after the 94-95 lift, +2 dB (loudest bars)
  DA(48) 109.125 END CARD: the fall (drums stop, coda bar 105, F -> Bbm), coda 106 faded to silence by 113.55
  film 113.633 s = 3409 frames at 30 fps

Film layout (n = DA bar; every span is the song playing straight through; r = per-beat waveform correlation of
the two copies at the measured lag; "cut" joins happen on a transient or a chord change, so they have no r):
  film span           song span          bars                                          join in -> type, r
  S1    0.000- 17.95  45.410- 63.360     19b4 (0.44 s pickup), chorus-1 20-23 hook,   start mid-beat, 4 ms de-click
                                         TITLE = 24 at DA(4), 25, 26, 27 b1-b3
  J1    17.46-17.95   27 -> 63 (copy)    n7 beat 3, so the valley follows bar 63 as in the song   lin, lag -1.8 ms, r .952
  S2    17.46- 19.68  144.38-146.59      63 b3-b4, valley 64 b1-b2 (F hit + sub on DA(8) = the lull)
  J2    19.59-19.68   64 -> 71 (half)    n8 beat 3: chord change F|E -> C (the loop changes chord every 2 beats);
                                         71's off-beat kicks (3&, 4&) pull into the B pre crash. The odd bar
                                         count title -> draw (15) is absorbed here, inside a quiet bar.
                                                                                 eqp 82 ms, ends 13 ms before both beat-3 attacks
  S3    19.59- 36.06  162.36-178.83      71 b3-b4, B pre-2 72 (DIVE at DA(9)) 73-77, 78 b1-b3
  J3    35.58-36.06   78 -> 12 (copy)    n15 beat 3, B pre-2 -> B pre-1 so the bar-15 fill leads to the chorus
                                                                                 lin, lag +3.25 ms, r .964
  S4    35.58- 61.57  28.91- 54.91       12 b3-b4, 13, 14, 15 fill (DA(18)), chorus-1 16 (DRAW at DA(19)) .. 23
                                         (deep break 61.01-61.58)
  J4    61.567-61.572 23 -> 64 (cut)     DA(27): deep break -> valley hit (the F the song plays after 23); outgoing
                                         gone 0.5 ms before bar 24's attack, incoming in 1.5 ms before 64's attack
  S5    61.57- 70.63  145.47-154.53      valley 64 (M1 hit) 65 66 (M2 hit) 67 (off-beat kicks into the hush)
  J5    70.60-70.63   67 -> intro 2 (cut) DA(31): the expected downbeat never comes; drums stop, the intro piano
                                         stays (outgoing gone before bar 68's attack; intro faded in 1 ms before DA(31))
  S6    70.61- 74.41  5.08-   8.88       intro 2 (F-E), intro 3 (Am-C) at HUSH_DB, faded out (cos^1.5) from DA(32)+1P
                                         73.46 to M3_END 74.412 (before the intro's own drum fill)
  HUSH  74.41- 75.16                     ring of the intro's last C chord (RING_DB) + reversed-reverb inhale of the 84
                                         downbeat (INHALE_DB, 0.70 s); lowest -37 LUFS-M at 74.7
  J6    75.147-75.157 silence -> 84      DA(33): the drop from its transient (10 ms fade-in ending 4.5 ms before it)
  S7    75.15-109.11  191.31-225.28      DROP 84 (T1) 85 86 87 | ARRIVAL 88 (DA(37)) 89-93 | lift 94-95 |
                                         96 (P1 at DA(45)) 97 98 (air on 98's F)
  J7    108.98-109.12 98 -> 105 (cut)    DA(48): drums stop on the end-card downbeat; harmony F -> Bbm (V -> i), what the
                                         song itself plays into 105 (98 ~ 90 r .94, so this is ep51's J9 90 -> 105)
  S8   108.98-113.63  238.74-243.38      coda 105 (Bbm-Db), 106 (Gb-F) faded (cos^1.5) 111.389 -> 113.549
Gain rides (fades only; no ducking, no stretch, no pitch): the B pre settles to BUILD_DB over the dive bar and grows
back to 0 by the fill (DA(10)..DA(18)); HUSH_DB on the drumless intro (step under the withheld DA(31) downbeat);
DROP_DB on bars 84-87 (step down under the 88 arrival); RISE_DB on P1 + air (96-98, step under the 96 downbeat,
eased off over the coda's first 0.3 s so the fall is the song's own). Then -14 LUFS integrated, true peak <= -1.5 dBTP.
"""
import numpy as np, soundfile as sf, subprocess, json, os
from scipy.signal import fftconvolve, lfilter, resample_poly, butter, sosfilt

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
SONG = os.path.join(HERE, 'bgm.mp3')
OUT = os.path.join(HERE, 'ep53v3_bed.wav')
P = 0.56605
BAR = 4 * P
FPS = 30
FILM_LEN = 4360 / FPS          # 113.633 s: END card 109.125 + 4.0 s + 0.5 s fade, rounded up to a frame

# ---- tunables (dB unless noted)
BUILD_DB = -1.5                # B pre: the dive bar at unity, settles to this by DA(10), grows back to 0 at the fill DA(18)
DROP_DB = 0.5                  # T1 lift, bars 84-87 (DA(33)..DA(37)); the hardness comes from silence -> sub, not level
RISE_DB = 2.0                  # P1 + air lift, bars 96-98 (DA(45)..DA(48)): the loudest sustained bars of the film
DRAW_SWELL_DB = -15.0          # reversed-reverb swell of the bar-16 downbeat into the draw DA(19) (None = off)
DRAW_SWELL_LEN = 1.0           # s
HUSH_FADE = None               # (start, end) of the intro fade-out; set below from the grid
HUSH_DB = -4.5                 # the drumless intro under M3 sits this much under unity (phone band: ~4 dB under the body)
RING_DB = -16.0                # ring of the last intro chord into the near silence
RING_TAU = 0.45
INHALE_DB = -14.0              # reversed-reverb inhale of the bar-84 downbeat into T1 (kept low: the 50 ms jump into T1
                               # must stay bigger than the title's 23 -> 24 re-entry)
INHALE_LEN = 0.70              # s
HUSH_GAP = 0.75                # near silence between the M3 subtitle end and T1
J2_XF = (0.095, 0.013)         # J2 eqp xfade: starts this long before DA(8)+2P, ends this long before it (both beat-3 attacks are at -9..-11 ms)
FADE = None                    # coda fade, set below
LUFS_TARGET = -14.0
TP_CEIL = -1.5


def B1(k): return 0.5688 + k * BAR          # song part-1 downbeat
def B2(k): return 1.1348 + k * BAR          # song part-2 downbeat
def DA(k): return 0.4432 + k * BAR          # the film grid


T_HUSH = DA(47)                              # M3 start
T_DROP = DA(49)                              # T1
M3_END = T_DROP - HUSH_GAP                   # 74.412: subtitle end = music has faded out
HUSH_FADE = (DA(48) + P, M3_END)             # from the Am's second beat to near silence
FADE = (DA(63), DA(63) + 2.16)               # 111.389 -> 113.549 over coda bar 106 (Gb -> F)


def load(path):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


song = load(SONG)
S = lambda t: int(round(t * SR))
N = S(FILM_LEN)


def attack(t_nom, lo=-0.015, hi=0.015):
    """Start of the transient nearest a nominal song time: the steepest rise of the 0.5 ms 2-8 kHz envelope within
    +-15 ms, walked back to where it leaves its floor (+1.5 dB). Checked against the waveforms: drum downbeats start
    1.5-7.5 ms before the formula, the intro piano ~+8..12 ms after it. A fade-in that ends here ends before the hit."""
    a = S(t_nom - 0.1); b = S(t_nom + 0.05)
    y = sosfilt(butter(4, [2000, 8000], 'band', fs=SR, output='sos'), song[a:b].mean(1).astype(np.float64))
    h = S(0.0005); k = len(y) // h
    e = 10 * np.log10(np.mean(y[:k * h].reshape(k, h) ** 2, 1) + 1e-14); te = a / SR + np.arange(k) * h / SR
    es = np.convolve(e, np.ones(3) / 3, 'same'); d = es[4:] - es[:-4]; td = te[2:-2]
    sel = (td >= t_nom + lo) & (td < t_nom + hi); tpk = td[sel][int(np.argmax(d[sel]))]
    j = int(np.nonzero(te <= tpk)[0][-1]); floor = es[j - 8]
    while j > 0 and es[j] > floor + 1.5 and te[j] > t_nom + lo - 0.005: j -= 1
    return float(te[j])


# ---- segment offsets (film = song - off)
OFF = {}
OFF['S1'] = B1(24) - DA(4)        # 45.4096 hook + title verse (same alignment as ep51)
OFF['S2'] = B1(63) - DA(7)        # verse 63b3.. valley 64 on DA(8)
OFF['S3'] = B1(72) - DA(9)        # valley 71b3, B pre 72 on DA(9)
OFF['S4'] = B1(12) - DA(13)       # B pre-1 12b3 .. chorus 16 on DA(19) .. 23
OFF['S4b'] = B1(22) - DA(41)      # chorus 22-23 copy under the paper test (23 b4 = deep break)
OFF['S5'] = B1(64) - DA(43)       # valley 64-67
OFF['S6'] = B1(2) - DA(47)        # intro 2-3 (hush)
OFF['S7'] = B2(84) - DA(49)
OFF['S7b'] = B2(92) - DA(55)      # 90-91 left out (one 2-bar loop unit): 89 -> 92       # drop 84 .. body 98
OFF['S8'] = B2(105) - DA(62)      # coda 105-106

T = dict(a24=attack(B1(24)), a64=attack(B1(64)), a68=attack(B1(68)), a2=attack(B1(2)), a84=attack(B2(84)),
         a16=attack(B1(16)), a72=attack(B1(72)), a96=attack(B2(96)), a88=attack(B2(88)), a71b3=attack(B1(71) + 2 * P), a40=attack(B1(40)), a22=attack(B1(22)))
film_of = lambda seg, song_t: song_t - OFF[seg]


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


def corr_plain(offA, offB, f0, f1, lagB=0.0):
    a = seg_audio(offA, f0, f1).mean(1); b = seg_audio(offB, f0, f1, lagB).mean(1)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-12))


# ---- joins. copy: linear xfade between two copies of the same moment (lag-aligned).
#      cut:  outgoing fades over out=(a,b), incoming fades in over inn=(a,b) (equal-power quarter-sine)
F_J2 = DA(8) + 2 * P
F24 = film_of('S4b', T['a24'])         # where bar 24's transient would sound if S4b kept playing
F40 = film_of('S4', T['a40'])
F22 = film_of('S4b', T['a22'])
print('J3b: F40 %.4f F22 %.4f' % (F40, F22))
F68 = film_of('S5', T['a68'])
F2 = film_of('S6', T['a2'])
F84 = film_of('S7', T['a84'])
JOINS = [
    dict(name='J1', a='S1', b='S2', kind='copy', win=(DA(7) + 2 * P + 0.040, DA(7) + 3 * P - 0.040),
         cut='bar 27 -> bar 63 inside beat 3 (27~63), so the valley follows bar 63 as in the song'),
    dict(name='J2', a='S2', b='S3', kind='cut', out=(F_J2 - J2_XF[0], F_J2 - J2_XF[1]), inn=(F_J2 - J2_XF[0], F_J2 - J2_XF[1]),
         cut='valley 64 beats 1-2 (F hit) -> valley 71 beats 3-4 (C, off-beat kicks into the 72 crash); '
             'chord change on beat 3, done before either beat-3 attack'),
    dict(name='J3', a='S3', b='S4', kind='copy', win=(DA(13) + 2 * P + 0.040, DA(13) + 3 * P - 0.040),
         cut='B pre-2 76 -> B pre-1 12 inside beat 3 (76~12), so 13-14-15 fill lead into the chorus at DA(17)'),
    dict(name='J3b', a='S4', b='S4b', kind='cut', out=(min(F22, F40) - 0.004, F40 - 0.0005), inn=(F22 - 0.0015, F22),
         cut='verse 39 (Am-C) -> chorus 22 (Dm-E) at DA(41): the paper test gets the chorus end and its deep break'),
    dict(name='J4', a='S4b', b='S5', kind='cut', out=(film_of('S5', T['a64']) - 0.002, F24 - 0.0005),
         inn=(film_of('S5', T['a64']) - 0.0015, film_of('S5', T['a64'])),
         cut='bar 23 beat-4 deep break -> valley 64 hit at DA(27) (the F the song plays after 23)'),
    dict(name='J5', a='S5', b='S6', kind='cut', out=(F68 - 0.030, F68 - 0.003), inn=(min(F2, DA(47)) - 0.021, min(F2, DA(47)) - 0.001),
         cut='valley 67 (off-beat kicks) -> drumless intro bar 2 at DA(31): the expected hit never comes = the hush'),
    dict(name='J6', a=None, b='S7', kind='cut', inn=(F84 - 0.010, F84),
         cut='near silence -> DROP bar 84 from its transient at DA(49)'),
    dict(name='J6b', a='S7', b='S7b', kind='copy', win=(DA(54) + 2 * P + 0.040, DA(54) + 3 * P - 0.040),
         cut='body 89 -> 91 inside beat 3 (89~91, the 2-bar loop Gb-F | Bbm-Db), so 90-91 are left out'),
    dict(name='J7', a='S7b', b='S8', kind='cut', out=(DA(62) - 0.035, DA(62) - 0.010), inn=(DA(62) - 0.140, DA(62) - 0.004),
         cut='bar 98 (Gb-F) -> coda bar 105 (Bbm): drums stop on the end-card downbeat, V -> i (98~90, ep51 J9)'),
]
SEG_START = {'S1': 0.0}
SEG_END = {'S6': HUSH_FADE[1] + 0.002, 'S8': FILM_LEN}
order = ['S1', 'S2', 'S3', 'S4', 'S4b', 'S5', 'S6', 'S7', 'S7b', 'S8']
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
        w = j.get('out') or j['inn']
        r = corr_plain(OFF[j['a']], OFF[j['b']], w[0] - 0.05, w[1]) if j['a'] else None   # info only: the two signals
        xinfo[j['name']] = dict(film_out=[round(v, 4) for v in j['out']] if j['a'] else None,
                                film_in=[round(v, 4) for v in j['inn']], kind='cut (equal-power)', lag_ms=0.0,
                                r_before_cut=(round(r, 3) if r is not None else None), cut=j['cut'])

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
    if s_ == 'S6':                                   # the hush: intro at HUSH_DB, faded out to near silence by M3_END
        w = np.clip((tt - HUSH_FADE[0]) / (HUSH_FADE[1] - HUSH_FADE[0]), 0, 1)
        g *= 10 ** (HUSH_DB / 20) * np.cos(w * np.pi / 2) ** 1.5
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


def rev_swell(src_t, length, db, end_film, seed, src_len=0.5):
    """Reversed reverb of the song's downbeat at src_t (first src_len s), rising into end_film."""
    rv = reverb(song_cut(src_t, src_t + src_len), ir(2.5, 0.55, seed))[::-1].copy()
    L = S(length); sw = rv[-S(src_len) - L:-S(src_len)].copy()
    sw *= (np.linspace(0, 1, len(sw)) ** 2.5)[:, None]
    place(sw, end_film - len(sw) / SR, db)


fx = []
if DRAW_SWELL_DB is not None:   # (1) the blade sliding out: swell into the chorus downbeat at the draw
    F16 = film_of('S4', T['a16'])
    rev_swell(T['a16'], DRAW_SWELL_LEN, DRAW_SWELL_DB, F16, 5)
    fx.append(dict(film=[round(F16 - DRAW_SWELL_LEN, 3), round(F16, 3)], what='reversed-reverb swell of the bar-16 downbeat into the draw', db=DRAW_SWELL_DB))
# (2) hush ring: the last intro chord (C, beats 3-4 of intro bar 3 before the drum fill) rings into the near silence
ring_src = song_cut(B1(3) + 2 * P, B1(3) + 2 * P + 0.45)
ring_src *= np.hanning(2 * len(ring_src))[len(ring_src):, None].astype(np.float32) ** 0.5
ring = reverb(ring_src, ir(2.0, RING_TAU, 31))
place(ring, DA(48) + 2 * P, RING_DB + HUSH_DB)
fx.append(dict(film=[round(DA(48) + 2 * P, 3), round(T_DROP, 3)], what='ring (reverb, tau %.2f s) of the intro C chord into the near silence' % RING_TAU, db=RING_DB))
# (3) inhale into T1: reversed reverb of the bar-84 downbeat
rev_swell(T['a84'], INHALE_LEN, INHALE_DB, F84, 21, src_len=0.4)
fx.append(dict(film=[round(F84 - INHALE_LEN, 3), round(F84, 3)], what='reversed-reverb inhale of the bar-84 downbeat into T1', db=INHALE_DB))


# ---- gain rides and the coda fade
def ramp(a, b): return np.clip((t - a) / (b - a), 0, 1)


F72 = film_of('S3', T['a72']); F88 = film_of('S7', T['a88']); F96 = film_of('S7b', T['a96'])
gd = np.zeros(N)
gd += np.where(t < DA(17), BUILD_DB * ramp(DA(9) + 0.30, DA(10)) * (1 - ramp(DA(10), DA(16))), 0.0)   # the dive crash at unity,
                                                                                                  # settles to BUILD_DB by DA(10),
                                                                                                  # then grows back to 0 at the fill
gd += DROP_DB * ramp(F84 - 0.005, F84) * (1 - ramp(F88 - 0.008, F88 + 0.004))                    # T1 drop 84-87
gd += RISE_DB * ramp(F96 - 0.008, F96 + 0.004) * (1 - ramp(DA(62) - 0.004, DA(62) + 0.300))       # P1 + air 96-98; eased off
                                                                                                  # over the coda's first 0.3 s so the fall is the song's own
g = 10 ** (gd / 20)
w = ramp(*FADE); g = g * np.cos(w * np.pi / 2) ** 1.5
g[t >= FADE[1]] = 0.0
mix *= g[:, None].astype(np.float32)

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

ANCH = dict(FIRST_DOWNBEAT=DA(0), TITLE=DA(4), LULL=DA(8), DIVE=DA(9), FILL=DA(16), DRAW=DA(17), DEEP_BREAK_23=DA(24) + 3 * P,
            VERSE_24=DA(25), PAPER_22=DA(41), DEEP_BREAK_23b=DA(42) + 3 * P, M1_VALLEY=DA(43), M2=DA(45), HUSH=T_HUSH, M3_END=M3_END,
            T1_DROP=T_DROP, ARRIVAL_88=DA(53), LIFT_94=DA(57), P1=DA(59), AIR=DA(61) + 2 * P, END_CARD=DA(62), FADE=list(FADE), FILM_LEN=FILM_LEN)
info = dict(OFF=OFF, lags_ms={k: round(v * 1000, 3) for k, v in lags.items()}, joins=xinfo, spans=spans, fx=fx,
            attacks={k: round(v, 4) for k, v in T.items()}, anchors=ANCH,
            gains=dict(BUILD_DB=BUILD_DB, HUSH_DB=HUSH_DB, DROP_DB=DROP_DB, RISE_DB=RISE_DB),
            lufs_in=lufs_in, lufs_out=meter.integrated_loudness(mix.astype(np.float64)), true_peak_dbtp=tp,
            limited=limited, dur=len(mix) / SR)
json.dump(info, open(os.path.join(HERE, '_build_info_v3.json'), 'w'), indent=1, default=float)
print(json.dumps(info, indent=1, default=float))
