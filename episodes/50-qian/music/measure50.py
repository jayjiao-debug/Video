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
