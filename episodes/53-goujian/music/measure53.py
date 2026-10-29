"""Measure ep53_bed.wav: grid placement (every film downbeat located by xcorr against the source bar), landmark onsets
(HF attack start and spectral-flux peak vs the formula), joins (5 ms level steps, >6 kHz clicks, spectral jump),
hush profile, loudness curves (400 ms momentary, 3 s short-term), brightness, sub level, mono fold, true peak.
Writes _measure.json, music_map_ep53.json and the PNG (argv[1], default ep53_bed_curves.png next to this file).
Run after build53.py (and retime53.py for the line table)."""
import numpy as np, soundfile as sf, json, os, sys, subprocess
import pyloudnorm as pyln
from scipy.signal import resample_poly, butter, sosfilt, fftconvolve, lfilter
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
plt.rcParams['font.family'] = ['DejaVu Sans']

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000; P = 0.56605; BAR = 4 * P
info = json.load(open(os.path.join(HERE, '_build_info.json')))
A = info['anchors']
x, _ = sf.read(os.path.join(HERE, 'ep53_bed.wav'), dtype='float32')
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', os.path.join(HERE, 'bgm.mp3'), '-f', 'f32le', '-ac', '2',
                      '-ar', str(SR), '-'], capture_output=True).stdout
song = np.frombuffer(raw, np.float32).reshape(-1, 2)
S = lambda t: int(round(t * SR))
m = x.mean(1).astype(np.float64); N = len(m); dur = N / SR
sm = song.mean(1).astype(np.float64)
B1 = lambda k: 0.5688 + k * BAR
B2 = lambda k: 1.1348 + k * BAR
DA = lambda k: 0.4432 + k * BAR
songbar = lambda k: B1(k) if k < 80 else B2(k)


def locate(song_t, pred, win=0.30, search=0.03, sig=m):
    src = sm[S(song_t - 0.05):S(song_t + win)]
    a = S(pred - 0.05 - search); tgt = sig[max(a, 0):a + len(src) + 2 * S(search)]
    c = fftconvolve(tgt, src[::-1], 'valid')
    cs = np.concatenate([[0], np.cumsum(tgt ** 2)]); n = len(src)
    nrm = np.sqrt(cs[n:] - cs[:-n])[:len(c)] * np.linalg.norm(src) + 1e-12
    k = int(np.argmax(c / nrm)); return max(a, 0) / SR + k / SR + 0.05, float((c / nrm)[k])


# ---- film downbeat -> song bar (what the build put there); 'i2'/'i3' = intro bars 2/3
BARS = [20, 21, 22, 23, 24, 25, 26, 27, 64, 72, 73, 74, 75, 76, 77, 78, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
        64, 65, 66, 67, 2, 3] + list(range(84, 99)) + [105, 106]
NOTE = {7: 'bar 27 b1-b2, then bar 63 from beat 3 (J1)', 8: 'valley 64 b1-b2, then valley 71 b3-b4 (J2)',
        15: 'bar 78 b1-b2, then bar 12 from beat 3 (J3)', 27: 'J4: 23 deep break -> valley 64', 31: 'J5: intro bar 2 (hush)',
        32: 'intro bar 3, fading 73.46 -> 74.41', 33: 'J6: DROP 84 out of near silence', 48: 'J7: END CARD, coda 105', 49: 'coda 106, fading'}
grid = []
for n_, k in enumerate(BARS):
    pred = DA(n_)
    got, r = locate(songbar(k), pred)
    grid.append(dict(n=n_, formula=round(pred, 4), song_bar=('intro %d' % k) if n_ in (31, 32) else k, measured=round(got, 4),
                     err_ms=round((got - pred) * 1000, 1), xcorr=round(r, 3), note=NOTE.get(n_, '')))
grid_err = [abs(g['err_ms']) for g in grid if g['xcorr'] > 0.8]

# ---- beat-level onsets: HF onset nearest every film beat (where the music has one)
hp = sosfilt(butter(4, [2000, 8000], 'band', fs=SR, output='sos'), m)
h = S(0.001); e = np.sqrt(np.mean(hp[:len(hp) // h * h].reshape(-1, h) ** 2, 1)) + 1e-9
de = np.maximum(np.diff(20 * np.log10(e), prepend=-180), 0)
bo = []
for i in range(0, 4 * 48):
    tb = DA(0) + i * P
    if DA(31) - 0.1 < tb < DA(33) - 0.1: continue                         # hush: no pulse
    a = int((tb - 0.03) * 1000); b = int((tb + 0.03) * 1000)
    j = a + int(np.argmax(de[a:b])); bo.append((tb, j / 1000 - tb, de[j]))
strong = [o for o in bo if o[2] > 6]
beat_stats = dict(beats_checked=len(bo), with_clear_onset=len(strong),
                  median_offset_ms=round(float(np.median([o[1] for o in strong]) * 1000), 1),
                  p90_abs_offset_ms=round(float(np.percentile(np.abs([o[1] for o in strong]), 90) * 1000), 1))


# ---- landmark onsets: first 1 ms frame that rises > 9 dB above the median of -60..-15 ms (2-8 kHz band; if the HF
#      band has no clear rise, e.g. a valley hit after hats, the full band with a 6 dB rise). Calibrated on the source:
#      drum downbeats sit at -3.5..+3.5 ms of the formula, soft piano/coda attacks at +7..+9 ms.
SOS_HF = butter(4, [2000, 8000], 'band', fs=SR, output='sos')


def onset_at(sig, t, pre=(-0.060, -0.015), win=0.035):
    a = S(t - 0.12); b = S(t + win)
    for flt, rise in ((SOS_HF, 9.0), (None, 6.0)):
        y = sosfilt(flt, sig[a:b]) if flt is not None else sig[a:b]
        hh = S(0.001); k = len(y) // hh
        ee = 10 * np.log10(np.mean(y[:k * hh].reshape(k, hh) ** 2, 1) + 1e-14); te = a / SR + (np.arange(k) + 0.5) * hh / SR
        base = np.median(ee[(te >= t + pre[0]) & (te < t + pre[1])])
        s_ = np.nonzero((te >= t + pre[1]) & (ee > base + rise))[0]
        if len(s_): return te[s_[0]], ('2-8 kHz' if flt is not None else 'full band')
    return None, None


marks = [('first downbeat (rust bloom)', 20, DA(0)), ('TITLE: bar 24 re-entry', 24, DA(4)), ('lull: valley 64 hit', 64, DA(8)),
         ('DIVE: B pre 72', 72, DA(9)), ('fill bar 15 (wind-up)', 15, DA(18)), ('DRAW: chorus 16', 16, DA(19)),
         ('M1: valley 64 after the deep break', 64, DA(27)), ('M2: valley 66 hit', 66, DA(29)), ('HUSH: intro bar 2', 2, DA(31)),
         ('T1: DROP 84', 84, DA(33)), ('ARRIVAL 88 (Bb minor)', 88, DA(37)), ('lift 94', 94, DA(43)), ('P1: bar 96', 96, DA(45)),
         ('END CARD: coda 105', 105, DA(48))]
res = []
for lab, k, pred in marks:
    got, r = locate(songbar(k), pred)
    st, how = onset_at(m, pred)
    sst, _ = onset_at(sm, songbar(k))                       # the same transient in the source, for reference
    res.append(dict(event=lab, song_bar=k, film_formula=round(pred, 3), placement_err_ms=round((got - pred) * 1000, 1),
                    xcorr=round(r, 3), onset_ms=(round((st - pred) * 1000, 1) if st else None), onset_band=how,
                    source_onset_ms=(round((sst - songbar(k)) * 1000, 1) if sst else None),
                    within_10ms=(bool(abs(st - pred) <= 0.010) if st else None)))


# ---- hit contrast: momentary level of the 0.4 s after each hit minus the energy mean of the 1.0 s before it, and the
#      sub (< 100 Hz) share of the 0.4 s after it. A drop is 'harder' when both are larger.
def hit_contrast(t0):
    def lev(sig, a, b):
        kw = kweight(sig[S(a):S(b)].astype(np.float64)); return -0.691 + 10 * np.log10(np.mean((kw ** 2).sum(1)) + 1e-14)
    seg = m[S(t0):S(t0 + 0.4)]; sp = np.abs(np.fft.rfft(seg)) ** 2; f = np.fft.rfftfreq(len(seg), 1 / SR)
    return dict(after_0p4s=round(lev(x, t0, t0 + 0.4), 1), before_1s=round(lev(x, t0 - 1.0, t0 - 0.005), 1),
                contrast_db=round(lev(x, t0, t0 + 0.4) - lev(x, t0 - 1.0, t0 - 0.005), 1),
                phone_band_contrast_db=round(lev(xp, t0, t0 + 0.4) - lev(xp, t0 - 1.0, t0 - 0.005), 1),
                sub_share_after_db=round(float(10 * np.log10(sp[f < 100].sum() / sp.sum())), 1))


# ---- joins
def env(sig, a, b, w=0.005):
    seg = sig[S(a):S(b)]; n = S(w); k = len(seg) // n
    return 10 * np.log10(np.mean(seg[:k * n].reshape(k, n) ** 2, 1) + 1e-14)


hp6 = sosfilt(butter(4, 6000, 'high', fs=SR, output='sos'), m)


def specjump(c, w=0.046, sig=None):
    sig = m if sig is None else sig
    def bands(a):
        seg = sig[S(a):S(a + w)] * np.hanning(S(w)); sp = np.abs(np.fft.rfft(seg)) ** 2; f = np.fft.rfftfreq(len(seg), 1 / SR)
        edges = 50 * 2 ** np.arange(0, 9, 0.5)
        return np.array([10 * np.log10(sp[(f >= edges[i]) & (f < edges[i + 1])].sum() + 1e-12) for i in range(len(edges) - 1)])
    return float(np.mean(np.abs(bands(c) - bands(c - w))))


ref_jumps = np.median([specjump(DA(0) + i * P + 0.2) for i in range(0, 120, 3)])
# the musical moment each join stands in for, in the untouched song (what the listener expects to hear there)
SRC_SAME = {'J1': B1(63) + 3 * P - 0.040, 'J2': B1(71) + 2 * P - 0.013, 'J3': B1(12) + 3 * P - 0.040, 'J4': B1(24) - 0.003,
            'J5': B1(68) + 0.012, 'J6': B2(84) - 0.004, 'J7': B2(104)}
joins = {'REF_title_23_24 (song-native re-entry)': dict(window=[9.49, 9.51], spectral_jump_db=round(specjump(9.51), 1),
                                                      max_5ms_step_in_join_db=round(float(np.abs(np.diff(env(m, 7.5, 11.5)))[390:410].max()), 1)),
         'REF_song_fall_103_104 (drums stop, not used)': dict(window=None, spectral_jump_db=round(specjump(B2(104) + 0.002, sig=sm), 1))}
for j, xf in info['joins'].items():
    win = xf.get('film') or [min(xf['film_in'][0], (xf['film_out'] or xf['film_in'])[0]), max(xf['film_in'][1], (xf['film_out'] or xf['film_in'])[1])]
    c = 0.5 * (win[0] + win[1]); half = (win[1] - win[0]) / 2
    e_ = env(m, c - 2, c + 2); st = np.abs(np.diff(e_)); mid = len(e_) // 2; w = int(half / 0.005) + 4
    eh = env(hp6, c - 2, c + 2)
    joins[j] = dict(window=[round(v, 4) for v in win], max_5ms_step_in_join_db=round(float(st[mid - w:mid + w].max()), 1),
                    p99_5ms_step_around_db=round(float(np.percentile(st, 99)), 1),
                    hf_peak_in_join_vs_p95_around_db=round(float(eh[mid - w:mid + w].max() - np.percentile(eh, 95)), 1),
                    spectral_jump_db=round(specjump(win[1]), 1), spectral_jump_typical_offbeat_db=round(float(ref_jumps), 1),
                    spectral_jump_source_same_moment_db=round(specjump(SRC_SAME[j], sig=sm), 1))

# ---- fast level jumps at every artificial point (joins, gain steps, fades, effects): the largest 50 ms change of the
#      10 ms RMS within +-80 ms, in the bed and at the same musical moment in the source (bars as the song plays them)
e10 = env(m, 0, dur - 0.01, 0.010); t10 = (np.arange(len(e10)) + 0.5) * 0.010
def max_jump(sig_env, tt, c, w=0.08):
    """[largest rise, largest fall] of the 10 ms RMS over 50 ms within +-w of c (dB)."""
    s_ = (tt > c - w) & (tt < c + w); idx = [i for i in np.nonzero(s_)[0] if i + 5 < len(sig_env)]
    d = np.array([sig_env[i + 5] - sig_env[i] for i in idx if max(sig_env[i], sig_env[i + 5]) > -60] or [0.0])
    return [round(float(max(d.max(), 0)), 1), round(float(min(d.min(), 0)), 1)]
es = env(sm, 0, len(sm) / SR - 0.01, 0.010); ts = (np.arange(len(es)) + 0.5) * 0.010
F = info['attacks']
POINTS = [('reference: TITLE re-entry 23 break -> 24 (song-native)', DA(4), 24, B1(24)),
          ('reference: song fall 103 -> 104 (not used)', None, 104, B2(104)),
          ('J1 copy 27~63', np.mean(info['joins']['J1']['film']), 63, B1(63) + 2.5 * P),
          ('J2 64b2 -> 71b3', info['joins']['J2']['film_in'][1] + 0.013, 71, B1(71) + 2 * P),
          ('BUILD step (72)', DA(9), 72, B1(72)), ('J3 copy 78~12', np.mean(info['joins']['J3']['film']), 12, B1(12) + 2.5 * P),
          ('DRAW (swell -> 16)', DA(19), 16, B1(16)), ('J4 23 break -> 64', DA(27), 64, B1(64)),
          ('J5 67 -> intro 2', DA(31), 2, B1(2)), ('hush fade end', A['M3_END'], None, None),
          ('J6 silence -> 84 (+DROP step)', DA(33), 84, B2(84)), ('DROP step down (88)', DA(37), 88, B2(88)),
          ('RISE step (96)', DA(45), 96, B2(96)), ('J7 98 -> 105 (fall)', DA(48), 105, B2(105))]
point_jumps = []
for lab, c, k, songt in POINTS:
    if c is None:
        point_jumps.append(dict(point=lab, film=None, bed_rise_fall_50ms_db=None, source_same_moment_db=max_jump(es, ts, songt), on_beat=True)); continue
    near = float(np.min(np.abs(DA(0) + np.arange(-1, 200) * P - c)))
    point_jumps.append(dict(point=lab, film=round(float(c), 3), bed_rise_fall_50ms_db=max_jump(e10, t10, c),
                            source_same_moment_db=(max_jump(es, ts, songt) if songt else None),
                            on_beat=bool(near < 0.025)))

# ---- loudness curves
meter = pyln.Meter(SR)


def kweight(sig):
    b1 = [1.53512485958697, -2.69169618940638, 1.19839281085285]; a1 = [1.0, -1.69065929318241, 0.73248077421585]
    b2 = [1.0, -2.0, 1.0]; a2 = [1.0, -1.99004745483398, 0.99007225036621]
    return lfilter(b2, a2, lfilter(b1, a1, sig, axis=0), axis=0)


def curves(sig):
    kw = kweight(sig.astype(np.float64)); pw = (kw ** 2).sum(1); cs = np.concatenate([[0], np.cumsum(pw)])
    def curve(win, hop=0.05):
        n = S(win); hh = S(hop); idx = np.arange(0, len(pw) - n, hh)
        return (idx + n / 2) / SR, -0.691 + 10 * np.log10((cs[idx + n] - cs[idx]) / n + 1e-14)
    return curve(0.4), curve(3.0)


(tM, M), (tS, ST) = curves(x)
body = float(np.median(ST[(tS > 10) & (tS < 61)]))
nf = 4096; hop = S(0.1); fr = np.fft.rfftfreq(nf, 1 / SR); cent = []; tc = []; subl = []
win_ = np.hanning(nf)
for i in range(0, N - nf, hop):
    sp = np.abs(np.fft.rfft(m[i:i + nf] * win_))
    if sp.sum() > 1e-4:
        cent.append((sp * fr).sum() / sp.sum()); tc.append((i + nf / 2) / SR)
        subl.append(10 * np.log10((sp[fr < 100] ** 2).sum() / (sp ** 2).sum() + 1e-12))
cent = np.array(cent); tc = np.array(tc); subl = np.array(subl)
hz = (tM > A['HUSH'] - 0.3) & (tM < A['T1_DROP'] + 0.3)
quiet = tM[hz][M[hz] < -35]
hush = dict(below_minus35_lufsM_s=round(len(quiet) * 0.05, 2), first=round(float(quiet.min()), 2) if len(quiet) else None,
            last=round(float(quiet.max()), 2) if len(quiet) else None, lowest_M=round(float(M[hz].min()), 1),
            lowest_at=round(float(tM[hz][np.argmin(M[hz])]), 2),
            M_at=dict((f'{v:.2f}', round(float(M[np.argmin(abs(tM - v))]), 1)) for v in
                      [70.4, 70.8, 71.5, 72.5, 73.5, 74.0, 74.4, 74.6, 74.8, 75.0, 75.1, 75.4, 75.8]))
sag = tS[(ST < body - 6) & ~((tS > A['HUSH'] - 1) & (tS < A['T1_DROP'] + 1.5)) & (tS < A['END_CARD'])]
L, R = x[:, 0].astype(np.float64), x[:, 1].astype(np.float64)
corr = float(np.corrcoef(L, R)[0, 1])
mono_db = 10 * np.log10(np.mean(((L + R) / 2) ** 2) / np.mean((L ** 2 + R ** 2) / 2))
tp = 20 * np.log10(np.abs(resample_poly(x, 4, 1, axis=0)).max())


def band(lo, hi, a=10, b=108):
    seg = m[S(a):S(b)]; sp = np.abs(np.fft.rfft(seg)) ** 2; f = np.fft.rfftfreq(len(seg), 1 / SR)
    return 10 * np.log10(sp[(f >= lo) & (f < hi)].sum() / sp.sum())


bands = {k: round(band(*v), 1) for k, v in dict(sub_20_60=(20, 60), low_60_120=(60, 120), mud_200_500=(200, 500), harsh_2k_5k=(2000, 5000), air_8k_16k=(8000, 16000)).items()}
SECTIONS = [('hook 0-9.50', 0.5, DA(4)), ('title verse 9.50-18.56', DA(4), DA(8)), ('lull 18.56-20.82', DA(8), DA(9)),
            ('B pre dive 20.82-43.46 (S4-D5)', DA(9), DA(19)), ('chorus 43.46-61.58 (draw, glyphs, letters, 1977)', DA(19), DA(27)),
            ('valley 61.58-70.63 (M1, M2 zoom)', DA(27), DA(31)), ('hush 70.63-74.41 (M3)', DA(31), A['M3_END']),
            ('near silence 74.41-75.16', A['M3_END'], DA(33)), ('DROP 75.16-84.22 (T1-T3)', DA(33), DA(37)),
            ('body 84.22-97.80 (arrival, E1, L1, R2)', DA(37), DA(43)), ('lift 97.80-102.33 (R3)', DA(43), DA(45)),
            ('P1 + air 102.33-109.12', DA(45), DA(48)), ('coda 109.12-111.39 (end card)', DA(48), DA(49)),
            ('fade 111.39-113.63', DA(49), dur)]


def mean_m(a, b):
    s = (tM >= a) & (tM < b)
    return round(float(10 * np.log10(np.mean(10 ** (M[s] / 10)))), 1) if s.any() else None


def mean_c(a, b): s = (tc >= a) & (tc < b); return int(np.mean(cent[s])) if s.any() else None
def mean_sub(a, b): s = (tc >= a) & (tc < b); return round(float(np.mean(subl[s])), 1) if s.any() else None


xp = sosfilt(butter(4, [300, 8000], 'band', fs=SR, output='sos'), x, axis=0)
(tMp, Mp), _ = curves(xp)
def mean_p(a, b):
    s = (tMp >= a) & (tMp < b)
    return round(float(10 * np.log10(np.mean(10 ** (Mp[s] / 10)))), 1) if s.any() else None
sections = {k: dict(momentary_lufs_mean=mean_m(a, b), phone_band_300_8k_lufs=mean_p(a, b), centroid_hz=mean_c(a, b), sub_share_db=mean_sub(a, b))
            for k, a, b in SECTIONS}

# ebur128 (ffmpeg) as the reference meter
eb = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', os.path.join(HERE, 'ep53_bed.wav'), '-af', 'ebur128=peak=true',
                     '-f', 'null', '-'], capture_output=True, text=True).stderr
ebs = eb[eb.rfind('Summary:'):]
def grab(key):
    for ln in ebs.splitlines():
        if ln.strip().startswith(key + ':'): return ln.split(':', 1)[1].strip()
ebur = dict(I=grab('I'), LRA=grab('LRA'), true_peak=grab('Peak'))

HITS = {'TITLE 9.50': DA(4), 'DIVE 20.82': DA(9), 'DRAW 43.46': DA(19), 'M1 61.58': DA(27), 'T1 DROP 75.16': DA(33),
        'ARRIVAL 84.22': DA(37), 'P1 102.33': DA(45), 'END fall 109.12': DA(48)}
hits = {k: hit_contrast(v) for k, v in HITS.items()}
out = dict(hit_contrast=hits, grid_check=dict(max_abs_err_ms=round(max(grid_err), 1), mean_abs_err_ms=round(float(np.mean(grid_err)), 1), n=len(grid_err),
                           beat_onsets=beat_stats),
           landmarks=res, joins=joins, level_jumps_at_edit_points=point_jumps, hush=hush,
           sag_3s_more_than_6dB_under_body=[round(float(v), 2) for v in sag[::10]],
           body_short_term_lufs=round(body, 1), sections=sections, ebur128=ebur,
           integrated_lufs=round(meter.integrated_loudness(x.astype(np.float64)), 2), true_peak_dbtp=round(float(tp), 2),
           max_momentary_lufs=round(float(M.max()), 1), max_momentary_at=round(float(tM[np.argmax(M)]), 2),
           max_short_term_lufs=round(float(ST.max()), 1), max_short_term_at=round(float(tS[np.argmax(ST)]), 2),
           lr_correlation=round(corr, 3), mono_fold_change_db=round(float(mono_db), 2), band_share_db_body=bands,
           duration=dur, last_nonsilent=round(float(np.nonzero(np.abs(m) > 10 ** (-80 / 20))[0].max() / SR), 3))
json.dump(dict(out, grid=grid), open(os.path.join(HERE, '_measure.json'), 'w'), indent=1, ensure_ascii=False)
print(json.dumps(out, indent=1, ensure_ascii=False))

# ---- PNG
png = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'ep53_bed_curves.png')
fig, ax = plt.subplots(3, 1, figsize=(22, 11), sharex=True, gridspec_kw=dict(height_ratios=[3, 1.3, 1.1]))
cols = ['#f2f2f2', '#e0ecf7']
for i, (k, a, b) in enumerate(SECTIONS):
    for a_ in ax: a_.axvspan(a, b, color=cols[i % 2], zorder=0)
    ax[0].text((a + b) / 2, -6.5, k.split(' ')[0], ha='center', fontsize=8)
ax[0].plot(tM, M, lw=0.5, color='0.45', label='bed momentary 400 ms')
ax[0].plot(tS, ST, lw=1.8, color='C3', label='bed short-term 3 s')
ax[0].axhline(body, ls=':', color='k'); ax[0].axhline(body - 6, ls=':', color='0.6')
ax[0].set_ylim(-60, -4); ax[0].set_ylabel('LUFS')
cues = {'rust 0.44': DA(0), 'TITLE 9.50': DA(4), 'lull 18.56': DA(8), 'DIVE 20.82': DA(9), 'DRAW 43.46': DA(19), 'M1 61.58': DA(27),
        'HUSH 70.63': DA(31), 'M3 end 74.41': A['M3_END'], 'T1 DROP 75.16': DA(33), 'arrival 84.22': DA(37), 'R2 95.54': DA(42),
        'P1 102.33': DA(45), 'air 107.99': A['AIR'], 'END 109.12': DA(48)}
for k, v in cues.items():
    for a_ in ax: a_.axvline(v, color='C0', lw=0.8, alpha=0.7)
    ax[0].text(v + 0.2, -58, k, rotation=90, fontsize=8, va='bottom', color='C0')
for j, xf in joins.items():
    if j.startswith('REF') or xf['window'] is None: continue
    for a_ in ax: a_.axvspan(xf['window'][0] - 0.05, xf['window'][1] + 0.05, color='C2', alpha=0.5)
    ax[0].text(xf['window'][0], -12, j, fontsize=8, color='g')
ax[0].legend(loc='lower left', fontsize=8)
ax[0].set_title('ep53 bed: loudness, brightness, sub (shaded = sections; green = joins J1-J7; dotted = body median and -6 dB)')
ax[1].plot(tc, cent, lw=0.6, color='C1'); ax[1].set_ylabel('centroid Hz'); ax[1].set_ylim(0, 6000)
ax[2].plot(tc, subl, lw=0.6, color='C4'); ax[2].set_ylabel('<100 Hz share dB'); ax[2].set_ylim(-35, 0)
ax[2].set_xlabel('film s'); ax[2].set_xticks(np.arange(0, 116, 5)); ax[2].set_xlim(0, 114)
plt.tight_layout(); plt.savefig(png, dpi=80)
print('png', png)

# ======================================================================= music_map_ep53.json
lp = os.path.join(HERE, '..', 'lines_bars.json')
lines = json.load(open(lp)) if os.path.exists(lp) else []


def grid_pos(tf):
    if tf >= DA(48) - 0.01: return dict(grid='A', nearest_beat=round(DA(48), 3), grid_bar=48, beat=1, delta=round(DA(48) - tf, 3), note='end card / coda (drums out)')
    i = int(round((tf - DA(0)) / P)); bt = DA(0) + i * P
    return dict(grid='A', nearest_beat=round(bt, 3), grid_bar=i // 4, beat=i % 4 + 1, delta=round(bt - tf, 3))


line_tab = [dict(start=st, end=en, text=txt.replace('\n', ' / '), **grid_pos(st)) for st, en, txt, spk in lines]
BARS_TXT = {
    'S1': ('19b4 (0.44 s pickup) | chorus-1 20-23 hook (bar 23 beat-4 deep break 8.93-9.50) | TITLE 24 at DA(4) | 25 26 | 27b1-b3', 'same alignment as ep51 (song 45.4096 at frame 0)'),
    'S2': ('63b3-b4 | valley 64 b1-b2 (F hit at DA(8) = the lull)', 'J1 copy 27~63'),
    'S3': ('valley 71 b3-b4 (off-beat kicks) | B pre-2 72 (DIVE at DA(9)) 73-77 | 78b1-b3', 'J2 half-bar swap on beat 3'),
    'S4': ('B pre-1 12b3-b4 | 13 14 | 15 fill (DA(18)) | chorus-1 16 (DRAW at DA(19)) .. 23 (deep break 61.01-61.58)', 'J3 copy 78~12'),
    'S5': ('valley 64 (M1 hit at DA(27)) 65 66 (M2 hit at DA(29)) 67 (off-beat kicks)', 'J4 cut after the deep break'),
    'S6': ('intro 2 (F-E, DA(31)) | intro 3 (Am-C) faded 73.46 -> 74.41 (before its drum fill)', 'J5 cut: the hush'),
    'S7': ('DROP 84 (T1 at DA(33)) 85 86 87 | ARRIVAL 88 (DA(37)) 89-93 | lift 94-95 | 96 (P1 at DA(45)) 97 98 (air on the F)', 'J6 out of near silence'),
    'S8': ('coda 105 (Bbm-Db, END at DA(48)) | 106 (Gb-F) faded 111.39 -> 113.55', 'J7 = ep51 J9'),
}
spans = []
for k_, v_ in info['spans'].items():
    spans.append(dict(seg=k_, film=v_['film'], song=v_['song'], lag_ms=v_['lag_ms'], bars=BARS_TXT[k_][0], note=BARS_TXT[k_][1]))
    if k_ == 'S6':
        spans.append(dict(seg='HUSH', film=[round(A['M3_END'], 4), round(DA(33), 4)], song='gap',
                          bars='ring of the intro C chord (-14 dB, tau 0.45 s) + reversed-reverb inhale of the 84 downbeat (-12 dB, 0.70 s)'))
mm = dict(
    file='ep53_bed.wav (48 kHz, 24-bit PCM, stereo (dual mono source), %.3f s = 3409 frames at 30 fps) - never commit audio' % dur,
    song='episodes/53-goujian/music/bgm.mp3 (バケモノの唄 instrumental, 254.1 s, mono 44.1 kHz mp3; md5 32975059d98bb656410fe1a58b6cdb3b = ep50 / ep51)',
    build='python3 build53.py && python3 retime53.py && python3 measure53.py',
    loudness=dict(integrated_lufs=out['integrated_lufs'], ebur128=ebur, true_peak_dbtp=out['true_peak_dbtp'],
                  limiter='used' if info['limited'] else 'not needed',
                  max_short_term=[out['max_short_term_lufs'], out['max_short_term_at']], max_momentary=[out['max_momentary_lufs'], out['max_momentary_at']],
                  body_short_term=out['body_short_term_lufs'], hit_contrast=hits, sections=sections, lr_correlation=out['lr_correlation'],
                  mono_fold_change_db=out['mono_fold_change_db'], bands_body=bands, hush=hush,
                  sag_3s_more_than_6dB_under_body=out['sag_3s_more_than_6dB_under_body'], level_jumps_at_edit_points=point_jumps),
    grid=dict(beat_s=P, bpm=round(60 / P, 2), song_part1_downbeats='0.5688 + 2.2642*k (bars 0-79)', song_part2_downbeats='1.1348 + 2.2642*k (bars 80-110)',
              film_grid='DA(k) = 0.4432 + 2.2642*k, k = 0..49, ONE grid for the whole film (beats 0.4432 + 0.56605*n). '
                        'Hush DA(31)..DA(33) has no pulse; DA(48) = end card (drums out), DA(49) = coda fading.',
              placement_check=out['grid_check'], film_downbeats=grid),
    spans=spans, joins={k: (dict(**info['joins'][k], **joins[k]) if k in info['joins'] else joins[k]) for k in joins}, effects=info['fx'],
    gain_rides=[dict(film=[round(DA(9), 3), round(DA(18), 3)], db=f"0 -> {info['gains']['BUILD_DB']} over the dive bar, then -> 0 by the fill (linear in dB)", why='the dive crash at full level, then the descent (B pre) grows into the draw'),
                dict(film=[round(DA(31), 3), round(A['M3_END'], 3)], db=f"{info['gains']['HUSH_DB']}", why='the drumless intro under M3: a hush that reads on a phone'),
                dict(film=[round(DA(33), 3), round(DA(37), 3)], db=f"+{info['gains']['DROP_DB']}", why='T1 = hardest drop (bars 84-87); step down under the 88 arrival'),
                dict(film=[round(DA(45), 3), round(DA(48), 3)], db=f"+{info['gains']['RISE_DB']}", why='P1 + air = the emotional peak (bars 96-98); removed under the fall'),
                dict(film=[round(DA(32) + P, 3), round(A['M3_END'], 3)], db='fade (cos^1.5)', why='the hush: intro bar 3 fades to near silence'),
                dict(film=A['FADE'], db='fade (cos^1.5)', why='coda bar 106 fades out, silent before the film ends')],
    landmarks=res, line_starts_vs_grid=line_tab,
)
json.dump(mm, open(os.path.join(HERE, 'music_map_ep53.json'), 'w'), indent=1, ensure_ascii=False, default=float)
print('wrote music_map_ep53.json')
