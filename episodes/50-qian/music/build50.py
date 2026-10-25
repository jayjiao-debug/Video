"""ep50 《钱是怎么从贝壳变成二维码的？》 music bed (subtitle-only film; SFX come later).

Song: episodes/50-qian/music/bgm.mp3 (バケモノの唄 instrumental, 254.1 s, md5 32975059..., same file as
episodes/41-sanqiannian/audio/bgm2.mp3). Never commit audio.

Grid (measured, same as ep42/ep44): beat P = 0.56605 s (106.0 bpm), 4/4.
  part 1 downbeats B(k) = 0.5688 + k*2.2642          (bars 0..79; bar 79 = stop bar, 2 beats of hits, then silence)
  part 2 downbeats B(k) = 1.1348 + k*2.2642          (bars 80..110; lead-in 80-83, DROP bar 84 = 191.328)
Song form (bar numbers): intro 0-3 | A 4-7 | B pre 8-15 | C chorus 16-23 (1-beat break at the end of 23) |
  verse 24-39 | A'' 40-47 | C chorus 48-55 | verse 56-63 | valley 64-71 (no kick) | B pre 72-78 (crash at 72) |
  stop 79 + 1.6 s digital silence | lead-in 80-83 (filtered, no sub) | DROP 84-87 (A min -> Bb min) |
  drop body 88-103 (Bb min) | coda 104-110 (rubato, no drums; Gb F Bb Db cycles) | dead stop 252.12.
Repeated bars are near copies (r = 0.81-0.98 at < 2 ms lag), so every splice below crossfades between two copies
of the same musical moment (linear, lag-aligned) except J5, which is hidden under the crash.

Film layout (film seconds; n = bar index from the title):
  S1  0.000- 18.307  song 45.660-63.967  hook = chorus-1 bars 19(last 0.19 s)-23, 1-beat break 8.683-9.250,
                     TITLE = bar 24 re-entry at 9.250, verse 24-27.
  J2  18.307         bar 27 -> B pre bar 8 (xfade over the last beat: bar 27 beat 4 ~ bar 7 beat 4, r 0.94)
  S2 18.307- 22.836  song 18.682-23.211  B pre 8-9 (bright pedal = the held, tense 先猜？ stretch)
  J3  22.836         bar 9 -> bar 14 (xfade over the last beat: bar 9 ~ bar 13, r 0.98)
  S3 22.836- 27.364  song 32.268-36.796  B pre 14-15 (15 = the fill into the chorus)
  J4  27.364         REVEAL: bar 15 -> chorus downbeat. Natural 15->16 through the downbeat, then xfade 16 -> 48
                     inside beat 1 (r 0.92).
  S4 27.364- 79.441  song 109.250-161.327  chorus 48-55 (soft dip 44.91, verse hit 45.478), verse 56-63,
                     valley 64-70.
  J5  79.441         valley bar 70 -> CRASH bar 72 (bar 71 dropped: the only odd-length edit, hidden by the crash)
  S5 79.441- 96.50   song 163.591-180.65  B pre 72-78 (brightest build: 宝钞), stop bar 79 at 95.291 (hits to
                     96.42), song silence from 96.45.
  HUSH 96.45-98.44   stop-bar ring (reverb, -12 dB) dying away + near-silence + reversed-reverb inhale
  S6 98.438-118.82   song 182.266-202.649  lead-in 80-83 from its first note (98.438), DROP bar 84 at 107.500
                     (= 「如今，10.17亿人…」), 85-87, ARRIVAL bar 88 (Bb min) at 116.557 under 「…[信]它」, bar 89.
  J7  ~119.4-119.9   bar 89 -> bar 103 (xfade inside beat 2, r 0.94): the drop's last bar, so the fall is the song's own
  S7 118.821-126.96  song 234.347-242.49  bar 103, the fall (drums stop) at 121.085, coda Gb 121.39, F 122.16,
                     Bb 123.57, Db 124.41/124.97, Gb 125.64 fades out, silent from 126.96 (the next chord never sounds).
  End of file 127.000.
Gain rides: +RISE_DB on bars 88-89/103 (信 + 1.0 s air = the sustained peak), steps hidden under the bar-88
downbeat and the drum stop at 121.085. Then normalise to -14 LUFS integrated, true peak <= -1.5 dBTP.
"""
import numpy as np, soundfile as sf, subprocess, json, os
from scipy.signal import fftconvolve, lfilter, resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
SONG = os.path.join(HERE, 'bgm.mp3')
OUT = os.path.join(HERE, 'ep50_bed.wav')
P = 0.56605
BAR = 4 * P
FILM_LEN = 127.0

# ---- tunables (dB unless noted)
RISE_DB = 1.0            # 信 + air lift (bars 88-89/103)
RING_DB = -12.0          # stop-bar ring into the hush
INHALE_DB = -10.0        # reversed-reverb inhale into the lead-in (98.438)
REVEAL_SWELL_DB = -15.0  # reversed-reverb swell into the reveal downbeat 27.364 (set None to drop it)
FADE = (125.45, 126.96)  # coda fade: from the Gb (125.64) to the next chord onset (song 242.49 -> 126.964)
LUFS_TARGET = -14.0
TP_CEIL = -1.5


def B1(k):  # part-1 downbeat (song s)
    return 0.5688 + k * BAR


def B2(k):  # part-2 downbeat (song s)
    return 1.1348 + k * BAR


def load(path):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


song = load(SONG)
S = lambda t: int(round(t * SR))

# ---- anchors: film time of the title and the segment offsets (film = song - off)
TITLE = 9.250
OFF1 = B1(24) - TITLE            # 45.660  S1: hook + verse 24-27
F_J2 = TITLE + 4 * BAR           # 18.307
OFF2 = B1(8) - F_J2              # S2: B pre 8-9
F_J3 = F_J2 + 2 * BAR            # 22.836
OFF3 = B1(14) - F_J3             # S3: B pre 14-15 (+ bar 16 beat 1)
REVEAL = F_J3 + 2 * BAR          # 27.364
OFF4 = B1(48) - REVEAL           # S4: chorus 48 .. valley 70
F_J5 = REVEAL + 23 * BAR         # 79.441 (48..70 = 23 bars)
OFF5 = B1(72) - F_J5             # S5: crash 72 .. stop bar 79 .. silence
LEAD_FIRST = 182.266             # first audible sample of the lead-in (song)
DROP_SONG = B2(84)               # 191.328
DROP = 107.500                   # film: 「如今，[10.17亿]人用网络支付。」
OFF6 = DROP_SONG - DROP          # 83.828  S6: lead-in .. bar 89
ARRIVAL = DROP + 4 * BAR         # 116.557 bar 88 (Bb min arrival) under 「值钱的是，大家都[信]它。」
F_89 = DROP + 5 * BAR            # 118.821
OFF7 = B2(103) - F_89            # S7: bar 103 .. coda
CODA = F_89 + BAR                # 121.085 the fall (drums stop)

N = S(FILM_LEN)
segs = {}                        # name -> dict(off, f0, f1, lag)


def seg_audio(off, f0, f1, lag=0.0):
    """Song audio that lands on film [f0, f1) for film = song - off (lag in s shifts the source later)."""
    a = S(f0 + off + lag); n = S(f1) - S(f0)
    out = np.zeros((n, 2), np.float32)
    lo, hi = max(a, 0), min(a + n, len(song))
    out[lo - a:hi - a] = song[lo:hi]
    return out


def align_lag(offA, lagA, offB, f0, f1, search=0.004):
    """Lag (s) for segment B so its audio matches A's over film [f0, f1] (xcorr, mono), and the correlation."""
    a = seg_audio(offA, f0, f1, lagA).mean(1).astype(np.float64)
    L = S(search)
    bseg = seg_audio(offB, f0 - search, f1 + search).mean(1).astype(np.float64)
    c = fftconvolve(bseg, a[::-1], 'valid')
    cs = np.concatenate([[0], np.cumsum(bseg ** 2)]); n = len(a)
    nrm = np.sqrt(cs[n:] - cs[:-n])[:len(c)] * np.linalg.norm(a) + 1e-12
    r = c / nrm; k = int(np.argmax(r))
    return (k - L) / SR, float(r[k])


# Each splice: (outgoing, incoming, xfade film start, xfade end, kind)
plan = [
    ('S1', OFF1, 0.0),
    ('S2', OFF2, None),
    ('S3', OFF3, None),
    ('S4', OFF4, None),
    ('S5', OFF5, None),
    ('S6', OFF6, None),
    ('S7', OFF7, None),
]
XF = {  # splice name: (film xfade start, end, kind, align?)
    'J2': (F_J2 - P + 0.030, F_J2 - 0.012, 'lin', True),      # bar 27 beat 4 ~ bar 7 beat 4
    'J3': (F_J3 - P + 0.030, F_J3 - 0.012, 'lin', True),      # bar 9 beat 4 ~ bar 13 beat 4
    'J4': (REVEAL + 0.070, REVEAL + P - 0.040, 'lin', True),  # bar 16 beat 1 ~ bar 48 beat 1
    'J5': (F_J5 - 0.020, F_J5 - 0.002, 'eqp', False),         # quiet valley tail -> crash attack
    'J7': (F_89 + P + 0.040, F_89 + 2 * P - 0.040, 'lin', True),  # bar 89 beat 2 ~ bar 103 beat 2
}
# film spans each segment owns (outside the xfades)
bounds = {
    'S1': (0.0, F_J2), 'S2': (F_J2, F_J3), 'S3': (F_J3, REVEAL), 'S4': (REVEAL, F_J5), 'S5': (F_J5, 96.90),
    'S6': (98.20, F_89), 'S7': (F_89, FILM_LEN),
}
order = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7']
joins = {'J2': ('S1', 'S2'), 'J3': ('S2', 'S3'), 'J4': ('S3', 'S4'), 'J5': ('S4', 'S5'), 'J7': ('S6', 'S7')}
offs = {'S1': OFF1, 'S2': OFF2, 'S3': OFF3, 'S4': OFF4, 'S5': OFF5, 'S6': OFF6, 'S7': OFF7}
lags = {k: 0.0 for k in offs}
xinfo = {}
for j, (a, b) in joins.items():
    x0, x1, kind, al = XF[j]
    if al:
        lag, r = align_lag(offs[a], lags[a], offs[b], x0, x1)
        lags[b] = lag
    else:
        r = None
    xinfo[j] = dict(film=[round(x0, 4), round(x1, 4)], kind=kind, lag_ms=round(lags[b] * 1000, 3),
                    r=(round(r, 3) if r is not None else None))

# ---- assemble: gain envelopes per segment (1 inside, crossfade ramps at the joins)
t = np.arange(N) / SR
mix = np.zeros((N, 2), np.float32)
start_of = {b: XF[j][0] for j, (a, b) in joins.items()}
end_of = {a: XF[j][1] for j, (a, b) in joins.items()}
kind_in = {b: XF[j][2] for j, (a, b) in joins.items()}
kind_out = {a: XF[j][2] for j, (a, b) in joins.items()}
for s_ in order:
    f0 = start_of.get(s_, bounds[s_][0]); f1 = end_of.get(s_, bounds[s_][1])
    x = seg_audio(offs[s_], f0, f1, lags[s_])
    n = len(x); g = np.ones(n)
    if s_ in start_of:                                       # fade in over the xfade
        j = [k for k, v in joins.items() if v[1] == s_][0]; m = S(XF[j][1]) - S(XF[j][0])
        r = np.linspace(0, 1, m)
        g[:m] = r if kind_in[s_] == 'lin' else np.sin(r * np.pi / 2)
    if s_ in end_of:                                         # fade out over the xfade
        j = [k for k, v in joins.items() if v[0] == s_][0]; m = S(XF[j][1]) - S(XF[j][0])
        r = np.linspace(1, 0, m)
        g[-m:] = r if kind_out[s_] == 'lin' else np.sin(r * np.pi / 2)
    if s_ == 'S1':                                           # frame 0 starts mid-beat: 4 ms de-click only
        m = S(0.004); g[:m] *= np.linspace(0, 1, m)
    if s_ == 'S5':                                           # ends in the song's digital silence
        m = S(0.010); g[-m:] *= np.linspace(1, 0, m)
    if s_ == 'S6':                                           # starts in digital silence before 182.266
        m = S(0.010); g[:m] *= np.linspace(0, 1, m)
    i0 = S(f0)
    mix[i0:i0 + n] += (x * g[:, None]).astype(np.float32)


# ---- effects, all made from the song itself
def ir(sec, tau, seed, lp=0.35):
    n = int(sec * SR); tt = np.arange(n) / SR; out = []
    for s in (seed, seed + 1):
        h = np.random.default_rng(s).standard_normal(n) * np.exp(-tt / tau)
        h = lfilter([lp], [1, -(1 - lp)], h); out.append(h / np.sqrt((h ** 2).sum()))
    return np.stack(out, 1)


def reverb(x, h):
    return np.stack([fftconvolve(x[:, c], h[:, c]) for c in range(2)], 1).astype(np.float32)


def place(x, f0, db):
    i = S(f0); x = x * 10 ** (db / 20); j = min(i + len(x), N)
    if i < 0: x = x[-i:]; i = 0
    mix[i:j] += x[:j - i]


def song_cut(a, b):
    return song[S(a):S(b)].copy()


fx = []
# (1) reveal swell: reversed reverb of the chorus downbeat (bar 48's first 0.45 s), rising into 27.364
if REVEAL_SWELL_DB is not None:
    rv = reverb(song_cut(B1(48), B1(48) + 0.45), ir(2.0, 0.50, 5))[::-1].copy()
    L = S(1.0); sw = rv[-S(0.45) - L:-S(0.45)].copy()
    sw *= (np.linspace(0, 1, len(sw)) ** 2.5)[:, None]
    place(sw, REVEAL - len(sw) / SR, REVEAL_SWELL_DB)
    fx.append(dict(film=[round(REVEAL - 1.0, 3), round(REVEAL, 3)], what='reversed-reverb swell of the chorus downbeat into the reveal', db=REVEAL_SWELL_DB))
# (2) hush: the stop bar's hits ring into the room (2 s reverb, tau 0.45 s), so the silence is a decay, not a dropout
stop_hits = song_cut(B1(79), 180.62)
place(reverb(stop_hits, ir(2.5, 0.45, 31)), B1(79) - OFF5, RING_DB)
fx.append(dict(film=[round(B1(79) - OFF5, 3), 98.4], what='stop-bar ring (reverb of song 179.44-180.62)', db=RING_DB))
# (3) inhale: reversed reverb of the lead-in's first 0.6 s, ending on its first note
li = song_cut(LEAD_FIRST, LEAD_FIRST + 0.60)
rv = reverb(li, ir(2.0, 0.45, 21))[::-1].copy()
inh = rv[-S(0.60) - S(0.55):-S(0.60)].copy(); inh *= (np.linspace(0, 1, len(inh)) ** 2.5)[:, None]
F_LEAD = LEAD_FIRST - OFF6
place(inh, F_LEAD - len(inh) / SR, INHALE_DB)
fx.append(dict(film=[round(F_LEAD - 0.55, 3), round(F_LEAD, 3)], what='reversed-reverb inhale into the lead-in', db=INHALE_DB))

# ---- gain rides and the coda fade
def ramp(a, b): return np.clip((t - a) / (b - a), 0, 1)
gd = RISE_DB * ramp(ARRIVAL - 0.008, ARRIVAL + 0.002) * (1 - ramp(CODA - 0.010, CODA + 0.060))
g = 10 ** (gd / 20)
w = ramp(*FADE); g = g * np.cos(w * np.pi / 2) ** 1.5
g[t >= FADE[1]] = 0.0
mix *= g[:, None].astype(np.float32)

# ---- loudness
import pyloudnorm as pyln
meter = pyln.Meter(SR)
lufs_in = meter.integrated_loudness(mix.astype(np.float64))
mix *= 10 ** ((LUFS_TARGET - lufs_in) / 20)


def true_peak(x):
    return 20 * np.log10(np.abs(resample_poly(x, 4, 1, axis=0)).max() + 1e-12)


tp = true_peak(mix)
limited = False
if tp > TP_CEIL:  # simple look-ahead peak limiter, only if needed
    limited = True
    from scipy.ndimage import minimum_filter1d
    up = np.abs(resample_poly(mix, 4, 1, axis=0)).max(1)
    pk = np.maximum.reduceat(up, np.arange(0, len(up), 4))[:N]
    gr = np.minimum(1, 10 ** ((TP_CEIL - 0.2) / 20) / np.maximum(pk, 1e-9))
    gmin = minimum_filter1d(gr, size=2 * S(0.003) + 1)
    sm = np.empty_like(gmin); acc = 1.0; a_rel = np.exp(-1 / S(0.080))
    for i in range(len(gmin)):
        acc = gmin[i] if gmin[i] < acc else a_rel * acc + (1 - a_rel) * gmin[i]; sm[i] = acc
    mix *= sm[:, None].astype(np.float32)
    mix *= 10 ** ((LUFS_TARGET - meter.integrated_loudness(mix.astype(np.float64))) / 20)
    tp = true_peak(mix)

assert len(mix) == N
sf.write(OUT, mix.astype(np.float32), SR, subtype='PCM_24')
info = dict(OFF=dict(offs), lags_ms={k: round(v * 1000, 3) for k, v in lags.items()}, xfades=xinfo, fx=fx,
            anchors=dict(TITLE=TITLE, F_J2=F_J2, F_J3=F_J3, REVEAL=REVEAL, F_J5=F_J5, STOPBAR=B1(79) - OFF5,
                         F_LEAD=F_LEAD, DROP=DROP, ARRIVAL=ARRIVAL, F_89=F_89, CODA=CODA, FADE=list(FADE)),
            lufs_in=lufs_in, lufs_out=meter.integrated_loudness(mix.astype(np.float64)), true_peak_dbtp=tp,
            limited=limited, dur=len(mix) / SR)
json.dump(info, open(os.path.join(HERE, '_build_info.json'), 'w'), indent=1, default=float)
print(json.dumps(info, indent=1, default=float))
