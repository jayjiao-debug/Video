"""Measure ep51_bed.wav: grid placement (every film downbeat located by xcorr against the source bar), landmarks,
joins (5 ms level steps, >6 kHz clicks, spectral jump), hush profile, loudness curves (400 ms momentary, 3 s
short-term), brightness, sub level, mono fold, true peak. Writes _measure.json, music_map_ep51.json and the PNG
(argv[1], default ep51_bed_curves.png next to this file).  Run after build51.py."""
import numpy as np, soundfile as sf, json, os, sys, subprocess
import pyloudnorm as pyln
from scipy.signal import resample_poly, butter, sosfilt, fftconvolve, lfilter
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
plt.rcParams['font.family'] = ['Noto Sans CJK SC', 'DejaVu Sans']

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000; P = 0.56605; BAR = 4 * P
info = json.load(open(os.path.join(HERE, '_build_info.json')))
OFF = info['OFF']; LAG = info['lags_ms']
x, _ = sf.read(os.path.join(HERE, 'ep51_bed.wav'), dtype='float32')
xu, _ = sf.read(os.path.join(HERE, 'ep51_bed_untouched.wav'), dtype='float32')
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', os.path.join(HERE, 'bgm.mp3'), '-f', 'f32le', '-ac', '2',
                      '-ar', str(SR), '-'], capture_output=True).stdout
song = np.frombuffer(raw, np.float32).reshape(-1, 2)
S = lambda t: int(round(t * SR))
m = x.mean(1).astype(np.float64); N = len(m); dur = N / SR
B1 = lambda k: 0.5688 + k * BAR
B2 = lambda k: 1.1348 + k * BAR
DA = lambda k: 0.4432 + k * BAR
DB = lambda k: 74.2586 + k * BAR


def locate(song_t, pred, win=0.30, search=0.03, sig=m):
    src = song[S(song_t - 0.05):S(song_t + win)].mean(1).astype(np.float64)
    a = S(pred - 0.05 - search); tgt = sig[max(a, 0):a + len(src) + 2 * S(search)]
    c = fftconvolve(tgt, src[::-1], 'valid')
    cs = np.concatenate([[0], np.cumsum(tgt ** 2)]); n = len(src)
    nrm = np.sqrt(cs[n:] - cs[:-n])[:len(c)] * np.linalg.norm(src) + 1e-12
    k = int(np.argmax(c / nrm)); return max(a, 0) / SR + k / SR + 0.05, float((c / nrm)[k])


# ---- film downbeat -> song bar (what the build put there)
A_BARS = [20, 21, 22, 23, 24, 25, 26, 27] + list(range(8, 23)) + [55, 56, 57, 58, 63, 64, 65, 66]   # n = 0..30
A_SEG = ['S1'] * 8 + ['S2'] * 15 + ['S3'] * 4 + ['S4'] * 4
A_NOTE = {7: 'bar 27 b1-b2, then bar 7 from beat 3 (J2)', 23: 'bar 23 b1, then bar 55 from beat 2 (J3)',
          27: 'bar 59 b1-b2, then bar 63 from beat 3 (J4)', 30: 'bar 66 b1-b2, then stop bar 79 hits on b3-b4 (J5)'}
A_BARS[7] = 27; A_BARS[23] = 23; A_BARS[27] = 59
B_BARS = list(range(16, 24)) + [80, 83, 84, 85, 86, 87, 88, 89, 90, 105, 106, 107]    # m = 0..19
B_SEG = ['S6'] * 8 + ['S7', 'S8', 'S8', 'S8', 'S8', 'S8', 'S8', 'S8', 'S8', 'S9', 'S9', 'S9']
B_NOTE = {8: 'lead-in 80 b1-b2, then bar 82 from beat 3 (J8)', 17: 'END CARD: drums stop, coda bar 105 (J9)',
          19: 'coda bar 107, fading 117.27 -> 119.10'}
songbar = lambda k: B1(k) if k < 80 else B2(k)
grid = []
for n_, (k, sg) in enumerate(zip(A_BARS, A_SEG)):
    pred = DA(n_)
    got, r = locate(songbar(k), pred)
    grid.append(dict(grid='A', n=n_, formula=round(pred, 4), song_bar=k, measured=round(got, 4), err_ms=round((got - pred) * 1000, 1),
                     xcorr=round(r, 3), note=A_NOTE.get(n_, '')))
for n_, (k, sg) in enumerate(zip(B_BARS, B_SEG)):
    pred = DB(n_)
    if pred > 118.9: break
    got, r = locate(songbar(k), pred)
    grid.append(dict(grid='B', n=n_, formula=round(pred, 4), song_bar=k, measured=round(got, 4), err_ms=round((got - pred) * 1000, 1),
                     xcorr=round(r, 3), note=B_NOTE.get(n_, '')))
grid_err = [abs(g['err_ms']) for g in grid if g['xcorr'] > 0.8 and not (g['grid'] == 'B' and g['n'] >= 17)]

# ---- beat-level onset check: HF onset nearest every film beat (where the music has one)
hp = sosfilt(butter(4, [2000, 8000], 'band', fs=SR, output='sos'), m)
h = S(0.001); e = np.sqrt(np.mean(hp[:len(hp) // h * h].reshape(-1, h) ** 2, 1)) + 1e-9
de = np.maximum(np.diff(20 * np.log10(e), prepend=-180), 0)
def beat_onsets(base, n0, n1):
    out = []
    for i in range(n0, n1):
        tb = base + i * P; a = int((tb - 0.03) * 1000); b = int((tb + 0.03) * 1000)
        if b >= len(de): break
        j = a + int(np.argmax(de[a:b])); out.append((tb, j / 1000 - tb, de[j]))
    return out
bo = beat_onsets(DA(0), 0, 4 * 30 + 2) + beat_onsets(DB(0), 0, 4 * 17)
strong = [o for o in bo if o[2] > 6]
beat_stats = dict(beats_checked=len(bo), with_clear_onset=len(strong),
                  median_offset_ms=round(float(np.median([o[1] for o in strong]) * 1000), 1),
                  p90_abs_offset_ms=round(float(np.percentile(np.abs([o[1] for o in strong]), 90) * 1000), 1))

# ---- landmarks
marks = [
    ('hook: bar 20 downbeat (fridge door)', B1(20), 0.4432), ('bar 23 beat-4 break', B1(23) + 3 * P, DA(3) + 3 * P),
    ('TITLE: bar 24 re-entry', B1(24), DA(4)), ('B pre bar 8 (after J2)', B1(8), DA(8)),
    ('fill bar 15 (先猜？ hold)', B1(15), DA(15)), ('RELEASE: chorus bar 16', B1(16), DA(16)),
    ('Tang Q: chorus bar 20', B1(20), DA(20)), ('bar 55 break (after J3)', B1(55) + 3 * P, DA(23) + 3 * P),
    ('Song street: verse 56', B1(56), DA(24)), ('Q4 清: valley 64 hit', B1(64), DA(28)),
    ('墙厚两米: valley 66 hit', B1(66), DA(30)), ('STOP hits (bar 79)', B1(79), DA(30) + 2 * P),
    ('RETURN: chorus bar 16', B1(16), DB(0)), ('bar 23 break before the lead-in', B1(23) + 3 * P, DB(7) + 3 * P),
    ('lead-in first note (bar 80)', B2(80), DB(8)), ('lead-in bar 83', B2(83), DB(9)), ('DROP bar 84', B2(84), DB(10)),
    ('ARRIVAL bar 88 (Bb minor)', B2(88), DB(14)), ('bar 89 (P2)', B2(89), DB(15)), ('bar 90 (air)', B2(90), DB(16)),
    ('FALL: coda bar 105', B2(105), DB(17)), ('coda bar 106', B2(106), DB(18)), ('coda bar 107', B2(107), DB(19)),
]
res = []
for lab, st, pred in marks:
    got, r = locate(st, pred)
    res.append(dict(event=lab, song_s=round(st, 3), film_formula=round(pred, 3), film_measured=round(got, 3),
                    err_ms=round((got - pred) * 1000, 1), xcorr=round(r, 3)))


# ---- joins
def env(sig, a, b, w=0.005):
    seg = sig[S(a):S(b)]; n = S(w); k = len(seg) // n
    return 10 * np.log10(np.mean(seg[:k * n].reshape(k, n) ** 2, 1) + 1e-14)
hp6 = sosfilt(butter(4, 6000, 'high', fs=SR, output='sos'), m)
def specjump(c, w=0.046):
    """Spectral distance (dB, 1/3-oct-ish bands) between the 46 ms before and after c, vs the median for beats."""
    def bands(a):
        seg = m[S(a):S(a + w)] * np.hanning(S(w)); sp = np.abs(np.fft.rfft(seg)) ** 2; f = np.fft.rfftfreq(len(seg), 1 / SR)
        edges = 50 * 2 ** np.arange(0, 9, 0.5)
        return np.array([10 * np.log10(sp[(f >= edges[i]) & (f < edges[i + 1])].sum() + 1e-12) for i in range(len(edges) - 1)])
    return float(np.mean(np.abs(bands(c) - bands(c - w))))
ref_jumps = np.median([specjump(DA(0) + i * P + 0.2) for i in range(0, 100, 3)])
joins = {}
for j, xf in info['joins'].items():
    win = xf.get('film') or [min(xf['film_in'][0], (xf['film_out'] or xf['film_in'])[0]), max(xf['film_in'][1], (xf['film_out'] or xf['film_in'])[1])]
    c = 0.5 * (win[0] + win[1]); half = (win[1] - win[0]) / 2
    e_ = env(m, c - 2, c + 2); st = np.abs(np.diff(e_)); mid = len(e_) // 2; w = int(half / 0.005) + 4
    eh = env(hp6, c - 2, c + 2)
    joins[j] = dict(window=[round(v, 4) for v in win], max_5ms_step_in_join_db=round(float(st[mid - w:mid + w].max()), 1),
                    p99_5ms_step_around_db=round(float(np.percentile(st, 99)), 1),
                    hf_peak_in_join_vs_p95_around_db=round(float(eh[mid - w:mid + w].max() - np.percentile(eh, 95)), 1),
                    spectral_jump_db=round(specjump(win[1]), 1), spectral_jump_typical_offbeat_db=round(float(ref_jumps), 1))

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
(tMu, Mu), (tSu, STu) = curves(xu)
body = float(np.median(ST[(tS > 10) & (tS < 63)]))
nf = 4096; hop = S(0.1); fr = np.fft.rfftfreq(nf, 1 / SR); cent = []; tc = []; subl = []
win = np.hanning(nf)
for i in range(0, N - nf, hop):
    sp = np.abs(np.fft.rfft(m[i:i + nf] * win))
    if sp.sum() > 1e-4:
        cent.append((sp * fr).sum() / sp.sum()); tc.append((i + nf / 2) / SR)
        subl.append(10 * np.log10((sp[fr < 100] ** 2).sum() / (sp ** 2).sum() + 1e-12))
cent = np.array(cent); tc = np.array(tc); subl = np.array(subl)
hush = (tM > 70.0) & (tM < 74.4)
quiet = tM[hush][M[hush] < -45]
near_sil = dict(below_minus45_lufsM_s=round(len(quiet) * 0.05, 2), first=round(float(quiet.min()), 2) if len(quiet) else None,
                last=round(float(quiet.max()), 2) if len(quiet) else None, lowest_M=round(float(M[hush].min()), 1),
                M_at=dict((f'{v:.2f}', round(float(M[np.argmin(abs(tM - v))]), 1)) for v in [70.0, 70.4, 70.63, 71.0, 71.5, 72.0, 72.5, 73.0, 73.5, 74.0, 74.2, 74.5]))
sag = tS[(ST < body - 6) & ~((tS > 69.0) & (tS < 76.0)) & (tS < 112.75)]
L, R = x[:, 0].astype(np.float64), x[:, 1].astype(np.float64)
corr = float(np.corrcoef(L, R)[0, 1])
mono_db = 10 * np.log10(np.mean(((L + R) / 2) ** 2) / np.mean((L ** 2 + R ** 2) / 2))
tp = 20 * np.log10(np.abs(resample_poly(x, 4, 1, axis=0)).max())
def band(lo, hi, a=10, b=112):
    seg = m[S(a):S(b)]; sp = np.abs(np.fft.rfft(seg)) ** 2; f = np.fft.rfftfreq(len(seg), 1 / SR)
    return 10 * np.log10(sp[(f >= lo) & (f < hi)].sum() / sp.sum())
bands = {k: round(band(*v), 1) for k, v in dict(sub_20_60=(20, 60), low_60_120=(60, 120), mud_200_500=(200, 500), harsh_2k_5k=(2000, 5000), air_8k_16k=(8000, 16000)).items()}
SECTIONS = [('hook 0-9.50', 0.5, DA(4)), ('title verse 9.50-18.56', DA(4), DA(8)), ('B pre 18.56-36.67 (周/战国, 先猜？)', DA(8), DA(16)),
            ('chorus 36.67-54.78 (酒 -> Tang)', DA(16), DA(24)), ('verse 54.78-63.84 (Song street, 银器)', DA(24), DA(28)),
            ('valley 63.84-69.50 (清 night)', DA(28), DA(30) + 2 * P), ('stop hits 69.50-70.63', DA(30) + 2 * P, DA(31)),
            ('hush 70.63-74.26', DA(31), DB(0)), ('return chorus 74.26-92.37 (剩下一份 -> 乾隆)', DB(0), DB(8)),
            ('lead-in 92.37-96.90 (整间屋子)', DB(8), DB(10)), ('drop 96.90-105.96 (19世纪 -> numbers)', DB(10), DB(14)),
            ('ARRIVAL 105.96-112.75 (P1, P2, air)', DB(14), DB(17)), ('coda 112.75-117.27 (end card)', DB(17), 117.27),
            ('fade 117.27-119.25', 117.27, 119.25)]
def mean_st(a, b, tt=tS, v=ST):
    s = (tt >= a) & (tt < b)
    if not s.any(): return None
    return round(float(10 * np.log10(np.mean(10 ** (v[s] / 10)))), 1)
def mean_m(a, b): return mean_st(a, b, tM, M)
def mean_c(a, b): s = (tc >= a) & (tc < b); return int(np.mean(cent[s])) if s.any() else None
sections = {k: dict(short_term_lufs=mean_m(a, b), centroid_hz=mean_c(a, b)) for k, a, b in SECTIONS}

out = dict(grid_check=dict(max_abs_err_ms=round(max(grid_err), 1), mean_abs_err_ms=round(float(np.mean(grid_err)), 1), n=len(grid_err),
                           beat_onsets=beat_stats),
           landmarks=res, joins=joins, hush=near_sil, sag_3s_more_than_6dB_under_body=[round(float(v), 2) for v in sag[::10]],
           body_short_term_lufs=round(body, 1), sections=sections,
           integrated_lufs=round(meter.integrated_loudness(x.astype(np.float64)), 2), true_peak_dbtp=round(float(tp), 2),
           max_momentary_lufs=round(float(M.max()), 1), max_momentary_at=round(float(tM[np.argmax(M)]), 2),
           max_short_term_lufs=round(float(ST.max()), 1), max_short_term_at=round(float(tS[np.argmax(ST)]), 2),
           lr_correlation=round(corr, 3), mono_fold_change_db=round(float(mono_db), 2), band_share_db_body=bands,
           duration=dur, last_nonsilent=round(float(np.nonzero(np.abs(m) > 10 ** (-80 / 20))[0].max() / SR), 3),
           untouched=dict(integrated_lufs=round(meter.integrated_loudness(xu.astype(np.float64)), 2),
                          true_peak_dbtp=round(float(20 * np.log10(np.abs(resample_poly(xu, 4, 1, axis=0)).max())), 2),
                          title_9p5=dict(M_before=round(float(np.mean(Mu[(tMu > 8.3) & (tMu < 8.9)])), 1),
                                         M_after=round(float(np.mean(Mu[(tMu > 9.7) & (tMu < 10.3)])), 1))))
json.dump(dict(out, grid=grid), open(os.path.join(HERE, '_measure.json'), 'w'), indent=1, ensure_ascii=False)
print(json.dumps(out, indent=1, ensure_ascii=False))

# ---- PNG
png = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'ep51_bed_curves.png')
fig, ax = plt.subplots(3, 1, figsize=(20, 11), sharex=True, gridspec_kw=dict(height_ratios=[3, 1.3, 1.1]))
cols = ['#f2f2f2', '#e0ecf7']
for i, (k, a, b) in enumerate(SECTIONS):
    for a_ in ax: a_.axvspan(a, b, color=cols[i % 2], zorder=0)
    ax[0].text((a + b) / 2, -6.5, k.split(' ')[0], ha='center', fontsize=8, rotation=0)
ax[0].plot(tMu, Mu, lw=0.5, color='C2', alpha=0.35, label='untouched alt, momentary')
ax[0].plot(tM, M, lw=0.5, color='0.45', label='bed momentary 400 ms')
ax[0].plot(tS, ST, lw=1.8, color='C3', label='bed short-term 3 s')
ax[0].axhline(body, ls=':', color='k'); ax[0].axhline(body - 6, ls=':', color='0.6')
ax[0].set_ylim(-60, -4); ax[0].set_ylabel('LUFS')
cues = {'door 0.44': 0.4432, 'TITLE 9.50': 9.5, '先猜？35.0': 35.0, 'release 36.67': DA(16), 'Tang 45.73': DA(20), 'Song 54.78': DA(24),
        '清 Q4 62.75': 62.75, 'stop 69.50': DA(30) + 2 * P, 'hush 70.63': DA(31), 'RETURN 74.26': DB(0), 'lead-in 92.37': DB(8),
        'DROP 96.90': DB(10), 'P1 ARRIVAL 105.96': DB(14), 'END CARD 112.75': DB(17)}
for k, v in cues.items():
    for a_ in ax: a_.axvline(v, color='C0', lw=0.8, alpha=0.7)
    ax[0].text(v + 0.2, -58, k, rotation=90, fontsize=8, va='bottom', color='C0')
for j, xf in joins.items():
    for a_ in ax: a_.axvspan(xf['window'][0] - 0.05, xf['window'][1] + 0.05, color='C2', alpha=0.5)
    ax[0].text(xf['window'][0], -12, j, fontsize=8, color='g')
ax[0].legend(loc='lower left', fontsize=8)
ax[0].set_title('ep51 bed: loudness, brightness, sub (shaded = sections; green = joins J2-J9; dotted = body median and -6 dB)')
ax[1].plot(tc, cent, lw=0.6, color='C1'); ax[1].set_ylabel('centroid Hz'); ax[1].set_ylim(0, 6000)
ax[2].plot(tc, subl, lw=0.6, color='C4'); ax[2].set_ylabel('<100 Hz share dB'); ax[2].set_ylim(-35, 0)
ax[2].set_xlabel('film s'); ax[2].set_xticks(np.arange(0, 121, 5)); ax[2].set_xlim(0, 119.5)
plt.tight_layout(); plt.savefig(png, dpi=80)
print('png', png)

# ======================================================================= music_map_ep51.json
lines = json.load(open(os.path.join(HERE, '..', 'lines_read.json')))
def grid_pos(tf):
    if tf < DA(31): base, g_ = DA(0), 'A'
    elif tf < DB(0) - 0.3: return dict(grid='hush', note='no pulse (70.63-74.26)')
    elif tf < DB(17) + 0.01: base, g_ = DB(0), 'B'
    else: return dict(grid='B', note='end card / coda (drums out)')
    i = int(round((tf - base) / P)); bt = base + i * P
    return dict(grid=g_, nearest_beat=round(bt, 3), grid_bar=i // 4, beat=i % 4 + 1, delta=round(bt - tf, 3))
line_tab = [dict(start=st, text=txt.replace('\n', ' / '), **grid_pos(st)) for st, en, txt, spk in lines]
BARS_TXT = {
    'S1': ('19 (last 0.44 s) | 20-23 chorus-1 end, bar 23 beat-4 break 8.93-9.50 | 24-27b2 verse', 'TITLE = bar 24 re-entry at DA(4) 9.50'),
    'S2': ('7b3-b4 | B pre 8-15 (15 = fill under 先猜？) | chorus-1 16-23b1 (16 = release at DA(16) 36.67)', 'the song at offset 0.1256 (same alignment as the untouched alt)'),
    'S3': ('55b2-b4 (shallow break 54.22-54.78) | verse 56-58 | 59b1-b2', ''),
    'S4': ('63b3-b4 | valley 64-65 | 66b1-b2 (hits at 63.84 and 68.37)', ''),
    'S5': ('stop bar 79: four eighth-note hits on DA(30) beats 3-4 (69.50-70.51), then the song\'s own digital silence', ''),
    'S6': ('chorus-1 16-23 (bar 23 beat-4 deep break 91.81-92.37)', 'RETURN on the bar-16 downbeat at DB(0)'),
    'S7': ('lead-in 80 b1-b2 from its first note', ''),
    'S8': ('82b3-b4 | 83 | DROP 84 | 85-87 | ARRIVAL 88 | 89 | 90', 'DROP at DB(10) 96.90, ARRIVAL at DB(14) 105.957'),
    'S9': ('coda 105 (Bbm) | 106 (Gb-F) | 107 fading 117.27-119.10', 'drums out from DB(17) 112.75'),
}
spans = []
for k_, v_ in info['spans'].items():
    spans.append(dict(seg=k_, film=v_['film'], song=v_['song'], lag_ms=v_['lag_ms'], bars=BARS_TXT[k_][0], note=BARS_TXT[k_][1]))
    if k_ == 'S5':
        spans.append(dict(seg='HUSH', film=[v_['film'][1], round(DB(0), 4)], song='gap',
                          bars='stop-bar ring (-12 dB, tau 0.55 s) -> near silence (< -45 LUFS-M %s-%s) -> reversed-reverb inhale (-10 dB, 1.0 s)' % (near_sil['first'], near_sil['last'])))
mm = dict(
    file='ep51_bed.wav (48 kHz, 24-bit PCM, stereo, 119.250 s) - never commit audio',
    alt='ep51_bed_untouched.wav: song from 0.1256 s in one piece (bar 0 at DA(0), bar 4 = groove/sub entry at 9.50), +%.2f dB static gain, one fade %.2f->%.2f' % (
        info['untouched']['gain_db'], *info['untouched']['fade']),
    song='episodes/51-bing/music/bgm.mp3 (バケモノの唄 instrumental, 254.1 s; md5 32975059d98bb656410fe1a58b6cdb3b = ep50 / ep41 bgm2.mp3)',
    build='python3 build51.py && python3 measure51.py',
    loudness=dict(integrated_lufs=out['integrated_lufs'], true_peak_dbtp=out['true_peak_dbtp'], limiter='used' if info['limited'] else 'not needed',
                  max_short_term=[out['max_short_term_lufs'], out['max_short_term_at']], max_momentary=[out['max_momentary_lufs'], out['max_momentary_at']],
                  body_short_term=out['body_short_term_lufs'], sections=sections, lr_correlation=out['lr_correlation'],
                  mono_fold_change_db=out['mono_fold_change_db'], bands_body=bands),
    grid=dict(beat_s=P, bpm=round(60 / P, 2), song_part1_downbeats='0.5688 + 2.2642*k (bars 0-79)', song_part2_downbeats='1.1348 + 2.2642*k (bars 80-110)',
              film_grid_A='DA(k) = 0.4432 + 2.2642*k, k = 0..30 (beats 0.4432 + 0.56605*n); stop hits on DA(30) beats 3-4',
              film_hush='70.63-74.26: no pulse. Drips, if counted, should count INTO the return on grid B: 71.43 72.00 72.56 73.13 73.69 -> 74.26',
              film_grid_B='DB(k) = 74.2586 + 2.2642*k, k = 0..16 with drums; DB(17) = 112.75 fall; coda bars 105-107 continue the grid softly',
              placement_check=out['grid_check'], film_downbeats=grid),
    spans=spans, joins={k: dict(**info['joins'][k], **joins[k]) for k in joins}, effects=info['fx'],
    gain_rides=[dict(film=[DB(0), DB(10)], db=f"{info['gains']['BUILD_DB']} -> 0 (linear in dB)", why='post-hush chorus + lead-in grow into the drop'),
                dict(film=[DB(14), DB(17)], db=info['gains']['RISE_DB'], why='arrival (bars 88-90, P1 + P2 + air); step under the 88 downbeat, removed under the fall'),
                dict(film=info['anchors']['FADE'], db='fade (cos^1.5)', why='coda bar 107 (Bbm) fades out, silent before 119.25')],
    landmarks=res, line_starts_vs_grid=line_tab,
)
json.dump(mm, open(os.path.join(HERE, 'music_map_ep51.json'), 'w'), indent=1, ensure_ascii=False, default=float)
print('wrote music_map_ep51.json')
