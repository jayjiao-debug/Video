"""Measure ep50_bed.wav: landmarks (xcorr against the source), joins (level steps, HF clicks), hush near-silence,
loudness curves (400 ms momentary, 3 s short-term), brightness, mono fold. Writes _measure.json and a PNG
(path given as argv[1], default: scratch next to this file)."""
import numpy as np, soundfile as sf, json, os, sys, subprocess
import pyloudnorm as pyln
from scipy.signal import resample_poly, butter, sosfilt, fftconvolve
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000; P = 0.56605; BAR = 4 * P
info = json.load(open(os.path.join(HERE, '_build_info.json')))
A = info['anchors']; OFF = info['OFF']; LAG = info['lags_ms']
x, _ = sf.read(os.path.join(HERE, 'ep50_bed.wav'), dtype='float32')
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', os.path.join(HERE, 'bgm.mp3'), '-f', 'f32le', '-ac', '2',
                      '-ar', str(SR), '-'], capture_output=True).stdout
song = np.frombuffer(raw, np.float32).reshape(-1, 2)
S = lambda t: int(round(t * SR))
m = x.mean(1).astype(np.float64)
N = len(m); dur = N / SR


def locate(song_t, pred, win=0.35, search=0.05):
    src = song[S(song_t - 0.05):S(song_t + win)].mean(1).astype(np.float64)
    a = S(pred - 0.05 - search); tgt = m[max(a, 0):a + len(src) + 2 * S(search)]
    c = fftconvolve(tgt, src[::-1], 'valid')
    cs = np.concatenate([[0], np.cumsum(tgt ** 2)]); n = len(src)
    nrm = np.sqrt(cs[n:] - cs[:-n])[:len(c)] * np.linalg.norm(src) + 1e-12
    k = int(np.argmax(c / nrm)); return max(a, 0) / SR + k / SR + 0.05, float((c / nrm)[k])


B1 = lambda k: 0.5688 + k * BAR
B2 = lambda k: 1.1348 + k * BAR
marks = [  # label, song time, segment
    ('hook: chorus bar 20 downbeat (first hit)', B1(20), 'S1'),
    ('1-beat break (song 54.343)', 54.343, 'S1'),
    ('TITLE: bar 24 re-entry hit', B1(24), 'S1'),
    ('B pre bar 8 (J2)', B1(8), 'S2'),
    ('B pre bar 14 (J3)', B1(14), 'S3'),
    ('B pre fill bar 15', B1(15), 'S3'),
    ('REVEAL: chorus bar 48 downbeat', B1(48), 'S4'),
    ('chorus dip bar 55 beat 4', B1(55) + 3 * P, 'S4'),
    ('verse hit bar 56', B1(56), 'S4'),
    ('Tang Q: bar 57', B1(57), 'S4'),
    ('开元: bar 59', B1(59), 'S4'),
    ('valley bar 64', B1(64), 'S4'),
    ('CRASH bar 72 (J5)', B1(72), 'S5'),
    ('printing: bar 73', B1(73), 'S5'),
    ('stop bar 79', B1(79), 'S5'),
    ('lead-in first note', 182.266, 'S6'),
    ('DROP bar 84', B2(84), 'S6'),
    ('ARRIVAL bar 88', B2(88), 'S6'),
    ('bar 89', B2(89), 'S6'),
    ('bar 103 beat 3 (after J7)', B2(103) + 2 * P, 'S7'),
    ('coda fall bar 104', B2(104), 'S7'),
    ('coda Gb', 236.924, 'S7'),
    ('coda Db hit', 240.500, 'S7'),
]
res = []
for lab, st, sg in marks:
    pred = st - OFF[sg] - LAG[sg] / 1000
    got, r = locate(st, pred)
    res.append(dict(event=lab, song_s=round(st, 3), film_pred=round(pred, 3), film_measured=round(got, 3), xcorr=round(r, 3)))

# ---- joins: 5 ms RMS steps and HF click energy, vs the same stats over the surrounding 4 s
hp = sosfilt(butter(4, 6000, 'high', fs=SR, output='sos'), m)
def env(sig, a, b, w=0.005):
    seg = sig[S(a):S(b)]; n = S(w); k = len(seg) // n
    return 10 * np.log10(np.mean(seg[:k * n].reshape(k, n) ** 2, 1) + 1e-14)
joins = {}
for j, xf in info['xfades'].items():
    c = 0.5 * (xf['film'][0] + xf['film'][1])
    e = env(m, c - 2, c + 2); st = np.abs(np.diff(e)); mid = len(e) // 2; w = int((xf['film'][1] - xf['film'][0]) / 2 / 0.005) + 4
    eh = env(hp, c - 2, c + 2)
    joins[j] = dict(film=xf['film'], max_5ms_step_in_xfade_db=round(float(st[mid - w:mid + w].max()), 1),
                    p99_step_around_db=round(float(np.percentile(st, 99)), 1),
                    hf_peak_in_xfade_vs_p95_around_db=round(float(eh[mid - w:mid + w].max() - np.percentile(eh, 95)), 1))

# ---- loudness curves
meter = pyln.Meter(SR)
from scipy.signal import lfilter
def kweight(sig):
    # ITU-R BS.1770 pre-filter + RLB at 48 kHz
    b1 = [1.53512485958697, -2.69169618940638, 1.19839281085285]; a1 = [1.0, -1.69065929318241, 0.73248077421585]
    b2 = [1.0, -2.0, 1.0]; a2 = [1.0, -1.99004745483398, 0.99007225036621]
    return lfilter(b2, a2, lfilter(b1, a1, sig, axis=0), axis=0)
kw = kweight(x.astype(np.float64))
pw = (kw ** 2).sum(1)
cs = np.concatenate([[0], np.cumsum(pw)])
def curve(win, hop=0.05):
    n = S(win); h = S(hop); idx = np.arange(0, N - n, h)
    ms = (cs[idx + n] - cs[idx]) / n
    return (idx + n / 2) / SR, -0.691 + 10 * np.log10(ms + 1e-14)
tM, M = curve(0.4); tS, ST = curve(3.0)
body = np.median(ST[(tS > 10) & (tS < 95)])
# brightness (spectral centroid, 100 ms)
from numpy.fft import rfft, rfftfreq
nf = 4096; hop = S(0.1); fr = rfftfreq(nf, 1 / SR); cent = []; tc = []
win = np.hanning(nf)
for i in range(0, N - nf, hop):
    sp = np.abs(rfft(m[i:i + nf] * win));
    if sp.sum() > 1e-6: cent.append((sp * fr).sum() / sp.sum()); tc.append((i + nf / 2) / SR)
cent = np.array(cent); tc = np.array(tc)
# hush near-silence
hush = (tM > 96.0) & (tM < 98.6)
quiet = tM[hush][M[hush] < -45]
near_sil = dict(below_minus45_lufsM_s=round(len(quiet) * 0.05, 2), first=round(float(quiet.min()), 2) if len(quiet) else None,
                last=round(float(quiet.max()), 2) if len(quiet) else None,
                lowest_M=round(float(M[hush].min()), 1))
# sag check: 3 s short-term more than 6 dB under the body median (excluding the hush and the end card)
sag = tS[(ST < body - 6) & ~((tS > 95.5) & (tS < 99.5)) & (tS < 121)]
# mono fold, LR correlation
L, R = x[:, 0].astype(np.float64), x[:, 1].astype(np.float64)
corr = float(np.corrcoef(L, R)[0, 1])
mono_db = 10 * np.log10(np.mean(((L + R) / 2) ** 2) / np.mean((L ** 2 + R ** 2) / 2))
tp = 20 * np.log10(np.abs(resample_poly(x, 4, 1, axis=0)).max())
# band balance (body): low <120, mud 200-500, harsh 2-5k relative to total
def band(lo, hi, a=10, b=95):
    seg = m[S(a):S(b)]; sp = np.abs(rfft(seg)) ** 2; f = rfftfreq(len(seg), 1 / SR)
    return 10 * np.log10(sp[(f >= lo) & (f < hi)].sum() / sp.sum())
bands = {k: round(band(*v), 1) for k, v in dict(sub_20_60=(20, 60), low_60_120=(60, 120), mud_200_500=(200, 500), harsh_2k_5k=(2000, 5000), air_8k_16k=(8000, 16000)).items()}
# peak sections
def mean_st(a, b): s = (tS >= a) & (tS < b); return round(float(np.mean(ST[s])), 1)
sections = {k: mean_st(*v) for k, v in {
    'hook 0-9.25': (1.5, 9.25), 'verse 9.25-18.3': (9.25, 18.3), 'B pre 18.3-27.4': (18.3, 27.36), 'chorus 27.4-45.5': (27.36, 45.48),
    'verse 45.5-63.6': (45.48, 63.6), 'valley 63.6-79.4': (63.6, 79.44), 'B build 79.4-95.3': (79.44, 95.29),
    'lead-in 98.4-107.5': (99.9, 107.5), 'drop 107.5-116.6': (107.5, 116.55), '信+air 116.6-121.1': (116.55, 121.08),
    'coda 121.1-125.5': (121.08, 125.45)}.items()}

out = dict(landmarks=res, joins=joins, hush=near_sil, sag_3s_more_than_6dB_under_body=[round(float(v), 2) for v in sag[::10]],
           body_short_term_lufs=round(float(body), 1), section_short_term_lufs=sections,
           integrated_lufs=round(meter.integrated_loudness(x.astype(np.float64)), 2), true_peak_dbtp=round(float(tp), 2),
           max_momentary_lufs=round(float(M.max()), 1), max_momentary_at=round(float(tM[np.argmax(M)]), 2),
           max_short_term_lufs=round(float(ST.max()), 1), max_short_term_at=round(float(tS[np.argmax(ST)]), 2),
           lr_correlation=round(corr, 3), mono_fold_change_db=round(float(mono_db), 2), band_share_db_body=bands,
           duration=dur, last_nonsilent=round(float(np.nonzero(np.abs(m) > 10 ** (-80 / 20))[0].max() / SR), 3))
json.dump(out, open(os.path.join(HERE, '_measure.json'), 'w'), indent=1, ensure_ascii=False)
print(json.dumps(out, indent=1, ensure_ascii=False))

png = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'ep50_bed_curves.png')
fig, ax = plt.subplots(2, 1, figsize=(18, 8), sharex=True)
ax[0].plot(tM, M, lw=0.5, color='0.6', label='momentary 400 ms'); ax[0].plot(tS, ST, lw=1.6, color='C3', label='short-term 3 s')
ax[0].axhline(body, ls=':', color='k'); ax[0].set_ylim(-60, -5); ax[0].set_ylabel('LUFS')
cues = {'title': 9.25, 'guess': 22.0, 'reveal': 27.25, 'Tang Q': 47.75, '交子': 67.5, 'crash': 79.44, '宝钞': 84.5,
        'Q collapse': 92.0, 'hush': 96.5, '白银': 98.5, 'today/DROP': 107.5, '信': 117.0, 'air': 119.5, 'end card': 120.5}
for k, v in cues.items():
    for a_ in ax: a_.axvline(v, color='C0', lw=0.6, alpha=0.6)
    ax[0].text(v, -7, k, rotation=90, fontsize=7, va='top')
for j, xf in info['xfades'].items():
    for a_ in ax: a_.axvspan(*xf['film'], color='C2', alpha=0.4)
    ax[0].text(xf['film'][0], -58, j, fontsize=7, color='C2')
ax[0].legend(loc='lower left')
ax[1].plot(tc, cent, lw=0.6, color='C1'); ax[1].set_ylabel('centroid Hz'); ax[1].set_xlabel('film s'); ax[1].set_ylim(0, 6000)
ax[1].set_xticks(np.arange(0, 128, 5))
plt.tight_layout(); plt.savefig(png, dpi=90)
print('png', png)

# ======================================================================= music_map_ep50.json
lines = json.load(open(os.path.join(HERE, '..', 'lines_read.json')))
DB0 = B1(20) - OFF['S1']                      # 0.1932: pre-hush film downbeats DB0 + BAR*k (k = 0..42)
DB1 = B2(80) - OFF['S6']                      # 98.443: post-hush film downbeats DB1 + BAR*k (k = 0..10)
def grid_pos(tf):
    if tf < 96.45: base, kmax, songbar = DB0, 42, None
    elif tf < 121.085: base, kmax, songbar = DB1, 10, None
    else: return dict(note='coda (rubato, no grid)')
    i = int(round((tf - base) / P)); bt = base + i * P
    return dict(nearest_beat=round(bt, 3), bar=i // 4 + 1, beat=i % 4 + 1, delta=round(bt - tf, 3))
song_bar_of = {}
pre = [20, 21, 22, 23, 24, 25, 26, 27, 8, 9, 14, 15] + list(range(48, 71)) + list(range(72, 80))
for k, sb in enumerate(pre): song_bar_of[round(DB0 + k * BAR, 3)] = sb
post = list(range(80, 90)) + [103]
for k, sb in enumerate(post): song_bar_of[round(DB1 + k * BAR, 3)] = sb
line_tab = []
for st, en, txt, spk in lines:
    g = grid_pos(st); line_tab.append(dict(start=st, text=txt.replace('\n', ' / '), **g))
lm = {r['event']: r['film_measured'] for r in res}
cues = [
    dict(cue='hook, energy from frame 0', target=0.0, landed='chorus-1 groove from sample 0 (song 45.660, mid-beat 4 of bar 19); first downbeat (bar 20, phrase start) at 0.193', delta=0.193),
    dict(cue='hook line 2', target=3.0, landed='bar 21 beat 2 at 3.023', delta=0.023),
    dict(cue='hook line 3', target=6.5, landed='bar 22 beat 4 at 6.420; fill bar 23 from 6.986', delta=-0.08),
    dict(cue='TITLE HIT', target=9.25, landed=f"bar 24 re-entry hit at {lm['TITLE: bar 24 re-entry hit']} after the song's own 1-beat break 8.683-9.250 (-25 LUFS-M -> -12; +14.6 dB jump)", delta=round(lm['TITLE: bar 24 re-entry hit'] - 9.25, 3)),
    dict(cue='先猜？ guess beat 22.0-23.5 (held, tense)', target=22.0, landed='inside the bright B pre-chorus pedal (bars 8-9 | 14-15, brightest stretch before the reveal); bar 14 downbeat 22.836 mid-beat; fill bar 15 from 25.100; reversed swell 26.36-27.36 (-15 dB)', delta=None),
    dict(cue='REVEAL 原来，"钱"是一把[铲子]', target=27.25, landed=f"chorus downbeat (bar 48) at {lm['REVEAL: chorus bar 48 downbeat']}", delta=round(lm['REVEAL: chorus bar 48 downbeat'] - 27.25, 3)),
    dict(cue='Tang Q 废五铢钱', target=47.75, landed=f"bar 57 downbeat {lm['Tang Q: bar 57']}", delta=round(lm['Tang Q: bar 57'] - 47.75, 3)),
    dict(cue='开元 新钱的名字', target=52.25, landed=f"bar 59 downbeat {lm['开元: bar 59']}", delta=round(lm['开元: bar 59'] - 52.25, 3)),
    dict(cue='纸币之一 (world first)', target=79.0, landed=f"CRASH bar 72 at {lm['CRASH bar 72 (J5)']} (brightest build starts)", delta=round(lm['CRASH bar 72 (J5)'] - 79.0, 3)),
    dict(cue='printing set-piece', target=81.75, landed=f"bar 73 downbeat {lm['printing: bar 73']}", delta=round(lm['printing: bar 73'] - 81.75, 3)),
    dict(cue='宝钞 collapse Q', target=92.0, landed='last two build bars 77-78 (90.762, 93.026); stop bar 79 at 95.290: four 8th-note hits 95.29-96.42 = the value tag falling', delta=None),
    dict(cue='HUSH 96.5-98.5', target=96.5, landed=f"song silence from 96.45; stop-bar ring -25 -> -40 dB by 97.2; below -45 LUFS-M {near_sil['below_minus45_lufsM_s']} s (~97.55-98.1); inhale 97.89-98.44; lead-in first note {lm['lead-in first note']}", delta=-0.05),
    dict(cue='白银 line', target=98.5, landed=f"lead-in first note {lm['lead-in first note']} (bar 80)", delta=round(lm['lead-in first note'] - 98.5, 3)),
    dict(cue='如今 10.17亿 (today)', target=107.5, landed=f"DROP bar 84 at {lm['DROP bar 84']}", delta=round(lm['DROP bar 84'] - 107.5, 3)),
    dict(cue='值钱的是，大家都[信]它 = the peak', target=117.0, landed=f"Bb-minor ARRIVAL bar 88 at {lm['ARRIVAL bar 88']} (+1 dB lift), line starts on beat 2 (117.123); bar 89 downbeat 118.821; loudest 3 s of the film at {out['max_short_term_at']} ({out['max_short_term_lufs']} LUFS-S), loudest 400 ms at {out['max_momentary_at']}", delta=round(117.123 - 117.0, 3)),
    dict(cue='1.0 s air', target=119.5, landed='bar 89/103 beat 2 at 119.387, beat 3 119.953 (still the peak; J7 splice 119.43-119.91 is inaudible, r 0.93)', delta=-0.113),
    dict(cue='END CARD', target=120.5, landed='beat 4 at 120.519; the fall (drums stop) at 121.085 = suggested J-stamp moment; coda Gb 121.398, Db hit 124.974', delta=0.019),
    dict(cue='clean stop', target=127.0, landed=f"fade 125.45 -> 126.96 over the last coda chord (Gb), ending where the next chord would start; last non-silent sample {out['last_nonsilent']}", delta=round(out['last_nonsilent'] - 127.0, 3)),
]
spans = [
    dict(film=[0.0, 18.307], song=[45.660, 63.967], bars='19 (last 0.19 s), 20-23 chorus-1 end + 1-beat break, 24-27 verse', note='TITLE = bar 24 at 9.250'),
    dict(film=[18.307, 22.836], song=[18.682, 23.211], bars='8-9 B pre-chorus'),
    dict(film=[22.836, 27.364], song=[32.268, 36.796], bars='14-15 B pre (15 = fill into the chorus)'),
    dict(film=[27.364, 79.441], song=[109.250, 161.327], bars='48-55 chorus-2, 56-63 verse, 64-70 valley (no kick)'),
    dict(film=[79.441, 96.45], song=[163.591, 180.60], bars='72-78 B build (crash at 72), 79 stop bar (2 beats of hits)'),
    dict(film=[96.45, 98.443], song='gap', bars='hush: stop-bar ring + near-silence + inhale'),
    dict(film=[98.443, 118.821], song=[182.271, 202.649], bars='80-83 lead-in, 84 DROP, 85-87, 88 ARRIVAL (Bb min), 89'),
    dict(film=[118.821, 126.96], song=[234.347, 242.49], bars='103 (via J7 inside beat 2), 104 fall + coda Gb-F-Bb-Db-Gb, fade'),
]
jn = {
    'J2': dict(film=18.307, cut='bar 27 -> bar 8', how='linear xfade over bar 27 beat 4 = bar 7 beat 4 (the song\'s own A->B approach)'),
    'J3': dict(film=22.836, cut='bar 9 -> bar 14', how='linear xfade over bar 9 beat 4 = bar 13 beat 4'),
    'J4': dict(film=27.364, cut='bar 15 -> bar 16 (natural, through the downbeat) -> bar 48', how='linear xfade bar 16 -> bar 48 inside beat 1'),
    'J5': dict(film=79.441, cut='bar 70 -> bar 72 (bar 71 dropped)', how='18 ms equal-power ending 2 ms before the crash; the only odd-length edit'),
    'J7': dict(film=119.43, cut='bar 89 -> bar 103', how='linear xfade inside beat 2 (bar 89 = bar 103 copy) so the fall into the coda is the song\'s own'),
}
for j in jn:
    jn[j].update(xfade=info['xfades'][j]['film'], kind=info['xfades'][j]['kind'], lag_ms=info['xfades'][j]['lag_ms'],
                 copy_correlation=info['xfades'][j]['r'], **{k: v for k, v in joins[j].items() if k != 'film'})
mm = dict(
    file='ep50_bed.wav (48 kHz, 24-bit PCM, stereo, 127.000 s) - never commit audio',
    song='episodes/50-qian/music/bgm.mp3 (バケモノの唄 instrumental, 254.1 s; md5 32975059d98bb656410fe1a58b6cdb3b = ep41 bgm2.mp3)',
    build='python3 build50.py && python3 measure50.py <png>',
    loudness=dict(integrated_lufs=out['integrated_lufs'], true_peak_dbtp=out['true_peak_dbtp'], limiter='not needed',
                  max_short_term=[out['max_short_term_lufs'], out['max_short_term_at']], max_momentary=[out['max_momentary_lufs'], out['max_momentary_at']],
                  sections_short_term_lufs=sections, lr_correlation=out['lr_correlation'], mono_fold_change_db=out['mono_fold_change_db']),
    grid=dict(beat_s=P, bpm=round(60 / P, 2), song_part1_downbeats='0.5688 + 2.2642*k (bars 0-79)', song_part2_downbeats='1.1348 + 2.2642*k (bars 80-110)',
              film_pre_hush=f'downbeats {DB0:.4f} + 2.26420*k, k = 0..42 (95.290 = stop bar); beats every 0.56605',
              film_post_hush=f'downbeats {DB1:.4f} + 2.26420*k, k = 0..10 (107.500 DROP, 116.557 ARRIVAL, 121.085 fall); coda after 121.085 is rubato',
              film_downbeat_to_song_bar=song_bar_of),
    spans=spans, joins=jn, effects=info['fx'],
    gain_rides=[dict(film=[116.557, 121.085], db=1.0, why='信 + air = the sustained peak; step hidden under the bar-88 downbeat and the drum stop'),
                dict(film=[125.45, 126.96], db='fade (cos^1.5)', why='last coda chord fades out, silent before 127.0')],
    cues=cues, landmarks=res, line_starts_vs_grid=line_tab,
)
json.dump(mm, open(os.path.join(HERE, 'music_map_ep50.json'), 'w'), indent=1, ensure_ascii=False, default=float)
print('wrote music_map_ep50.json')
