#!/usr/bin/env python3
"""ep60 v6 music library (owner 21:58: "aim for X number of bars, reusable for scenes and fit the atmosphere of the event, they should
sound the same style so that immersive is kept constant").

One source, one ensemble: every module is cut from ElevenLabs take A (ep60v6_music_A_cinematic: oud, qanun, ney, soft strings, frame
drum / darbuka; D centre; measured 120.00 BPM over the whole take, beats at 0.355 + 0.5 k s, downbeats at 1.855 + 2 k s). The nine
per-mood generations (ep60-music-02) came back in five different keys (A, C, Bb, Eb, A) and three tempi, mostly static drones, so they
fail "the same style"; they are not used.

    python3 lib60.py build A.mp3 LIB_DIR REF_AUDIO[:start:end]   -> LIB_DIR/<mood>_<N>bar.wav, _thin (drums out), _intro_1bar, _end; lib.json
    python3 lib60.py preview LIB_DIR OUT.wav                     -> the modules on the v6 timeline (169.25 s, music only), mastered

Loops: for each mood, candidate starts on A's downbeats inside the mood's region; the loop point with the most similar seam wins (MFCC +
chroma of the bars that meet at the wrap). 'pre' seam: the loop's last beat cross-fades into the beat that precedes bar 1 in A, so the
end of the file flows into its start exactly as A flowed into bar 1 (clean first entrance); 'tail' seam: the beat after the loop
cross-fades over the head (used when the bar before is a different texture). Thin = the same loop's harmonic layer (HPSS, sample
aligned: full <-> thin switches on any bar without phasing). Button (_end) = the downbeat after the loop, dry, then a short ring-out
(RT 1.2 s room, 35 % wet: a stop, not a wash). One EQ for the whole library (broad gains solved so the loops' band shares <120 / 120-500 / 500-2k / 2-6k Hz match the
reference's; the top follows the presence band within -2.5/+0.5 dB: the reference's top end is codec roll-off; linear phase) and one gain for the whole library (groove loop at -14 LUFS), so the moods keep A's relative dynamics.
"""
import os, sys, json, subprocess, numpy as np, soundfile as sf
from scipy import signal
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import egypt_cues as E
SR = 48000; BEAT = 0.5; BAR = 2.0; B = int(BAR * SR); Q = int(BEAT * SR)
A_D0 = 1.855          # take A: downbeats at 1.855 + 2 k s
FILM_D0 = 0.3         # film bar grid: downbeats at 0.3 + 2 k s (title 6.30 on bar 4; 「话太多」 72.3; hush 96.3; 「等等」 98.3; pass 130.3; shabtis 142.3)
# mood: (loop bars, region in A the loop must stay inside, thin layer?, character)
LOOPS = {
 'mystery': (8, (7.855, 27.855), False, 'calm mystery: oud ostinato over a warm low drone, ney phrases; no drums'),
 'curious': (8, (23.855, 43.855), False, 'light and curious: qanun and oud plucks, ney answers; no drums'),
 'danger':  (4, (39.855, 51.855), False, 'danger: tense oud/strings ostinato, ney trills, higher register; no drums'),
 'groove':  (8, (51.855, 69.855), True,  'stately groove: darbuka maqsum enters, oud and qanun call and response'),
 'tension': (8, (81.855, 101.855), True, 'the weighing: driving frame drum and darbuka, the ensemble climbs across the 8 bars (A runs it straight into dark)'),
 'dark':    (2, (101.855, 106.355), True,  'dark: the low held drone with a soft low drum on the downbeats (thin = the drone alone: the hush)'),
 'playful': (4, (107.855, 119.855), True, 'playful and sly: lighter darbuka, staccato oud and reed riff'),
 'bright':  (8, (127.855, 147.855), True, 'bright and open: full ensemble, warm qanun/oud melody, riq'),
 'busy':    (8, (143.855, 163.855), True, 'busy: the fullest, brightest groove (spare: shabtis, a finale)'),
}
ONESHOTS = {'hook_intro_4bar': (0.0, 7.855 + BEAT, 'the opening: drone swell, solo ney, temple gong at 5.35 s (lands on the title)'),
            'resolution_cadence': (163.855, None, 'the last bar and the final chord on D, ringing out (~4 s)')}

def load(p, ss=None, to=None):
    a = ['ffmpeg', '-v', 'quiet'] + (['-ss', str(ss), '-to', str(to)] if ss is not None else []) + ['-i', p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(a, capture_output=True).stdout, np.float32).reshape(-1, 2).astype(np.float64)

def bar_feats(y, t):
    import librosa
    s = y[int(t * SR):int(t * SR) + B].mean(1).astype(np.float32); s = librosa.resample(s, orig_sr=SR, target_sr=22050)
    mf = librosa.feature.mfcc(y=s, sr=22050, n_mfcc=20)[1:].mean(1); ch = librosa.feature.chroma_cqt(y=s, sr=22050).mean(1)
    return np.r_[mf / (np.linalg.norm(mf) + 1e-9), ch / (np.linalg.norm(ch) + 1e-9)]

def beat_db(y, t): k = int(round(t * SR)); return 10 * np.log10(np.mean(y[k:k + Q] ** 2) + 1e-12)

def best_loop(y, N, lo, hi):
    """candidate starts on A's downbeats; score = cosine similarity of the two bars that meet at the seam. Level guard: the beat
    that is blended in at the seam must be within 6 dB of the loop's median beat (A has breaks: a seam into a break = a hole)."""
    cands = []
    s = lo
    while s + N * BAR <= hi + 1e-6:
        med = np.median([beat_db(y, s + i * BEAT) for i in range(4 * N)])
        if s - BAR >= lo - 1e-6 and beat_db(y, s - BEAT) > med - 6: cands.append((float(bar_feats(y, s + (N - 1) * BAR) @ bar_feats(y, s - BAR)) / 2, s, 'pre'))
        if s + N * BAR + BEAT <= hi + 1e-6 and beat_db(y, s + N * BAR) > med - 6: cands.append((float(bar_feats(y, s + N * BAR) @ bar_feats(y, s)) / 2, s, 'tail'))
        s += BAR
    return max(cands)

def make_loop(y, s, N, seam):
    k = int(round(s * SR)); L = N * B; x = y[k:k + L].copy(); fo, fi = np.cos(np.linspace(0, np.pi / 2, Q))[:, None], np.sin(np.linspace(0, np.pi / 2, Q))[:, None]
    if seam == 'pre': x[-Q:] = x[-Q:] * fo + y[k - Q:k] * fi          # end of file = the beat before bar 1
    else: x[:Q] = x[:Q] * fi + y[k + L:k + L + Q] * fo                 # head = the beat after the loop, fading into bar 1
    return x

def circ(fn, x, pad=int(1.5 * SR)):
    """process a loop as a loop: wrap-pad with its own end/start, process, crop (keeps the seam seamless)."""
    return fn(np.concatenate([x[-pad:], x, x[:pad]]))[pad:pad + len(x)]

def hpss_h(x, margin=1.5):
    import librosa
    out = np.zeros_like(x)
    for c in (0, 1):
        S = librosa.stft(x[:, c].astype(np.float32), n_fft=4096, hop_length=1024)
        H, P = librosa.decompose.hpss(S, margin=margin, kernel_size=(31, 31))
        out[:, c] = librosa.istft(H, hop_length=1024, length=len(x))
    return out

IR = None
def ring(x, rt=1.2, wet=0.35):
    global IR
    if IR is None or len(IR) != int(rt * 1.3 * SR): IR = E.make_ir(rt60=rt, pre=0.015, seed=21)
    xx = np.concatenate([x, np.zeros((len(IR), 2))]); return xx + wet * E.conv_st(xx, IR)

def button(y, t):
    k = int(round(t * SR)); hit = y[k:k + Q].copy(); f = int(0.15 * SR); hit[-f:] *= np.linspace(1, 0, f)[:, None] ** 2
    return E.trim_tail(ring(hit), -62, 0.3)

def third_oct(y):
    f, P = signal.welch(y.mean(1), SR, nperseg=8192); c = np.geomspace(40, 16000, 28)
    return c, np.array([10 * np.log10(P[(f >= a / 2 ** (1 / 6)) & (f < a * 2 ** (1 / 6))].mean() + 1e-20) for a in c])

def eq_fir(c, gain_db, n=4097):
    f = np.linspace(0, SR / 2, n // 2 + 1); g = np.interp(np.log(np.maximum(f, 20)), np.log(c), gain_db)
    return signal.firwin2(n, f / (SR / 2), 10 ** (g / 20))

def build(src, lib, ref):
    os.makedirs(lib, exist_ok=True); y = load(src); files, meta = {}, {'source': os.path.basename(src), 'grid': 'A downbeats 1.855 + 2k s; film downbeats 0.3 + 2k s', 'modules': {}}
    for mood, (N, (lo, hi), thin, what) in LOOPS.items():
        sc, s, seam = best_loop(y, N, lo, hi); x = make_loop(y, s, N, seam)
        files[f'{mood}_{N}bar'] = x; files[f'{mood}_intro_1bar'] = y[int(round((s - BAR) * SR)):int(round(s * SR))]
        if mood != 'dark': files[f'{mood}_end'] = button(y, s + N * BAR)
        if thin: files[f'{mood}_{N}bar_thin'] = circ(hpss_h, x)
        meta['modules'][mood] = dict(bars=N, seconds=N * BAR, loop_from_A=round(s, 3), seam=seam, seam_similarity=round(sc, 3), thin=thin, character=what)
        print(f'{mood:8s} {N:2d} bars  A {s:7.3f}-{s + N * BAR:7.3f} s  seam {seam:4s} sim {sc:.3f}', flush=True)
    for name, (a, b, what) in ONESHOTS.items():
        x = y[int(a * SR):(int(b * SR) if b else len(y))].copy(); x = E.trim_tail(x, -70, 0.4); files[name] = x
        meta['modules'][name] = dict(seconds=round(len(x) / SR, 3), from_A=a, character=what)
    # one EQ for the library, toward the reference's balance: iterate broad gains (log-f interpolation between band centres) until the
    # library's band shares (<120, 120-500, 500-2k, 2-6k Hz, % of power) match the reference's; above 6 kHz follow the presence band
    # within -2.5/+0.5 dB of the mids (the reference's top end is codec roll-off, and its 50 Hz line is not music: no third-octave chasing)
    rp, *rr = ref.split(':'); r = load(rp, *rr) if rr else load(rp)
    f, Pr = signal.welch(r.mean(1), SR, nperseg=16384)
    Pl = np.mean([signal.welch(files[f'{m}_{LOOPS[m][0]}bar'].mean(1), SR, nperseg=16384)[1] for m in LOOPS], 0)
    edges = [(20, 120), (120, 500), (500, 2000), (2000, 6000)]; cen = np.array([60., 245., 1000., 3460.])
    share = lambda P: np.array([10 * np.log10(P[(f >= a) & (f < b)].sum() / P[f >= 20].sum()) for a, b in edges])
    target = share(Pr); gc = np.zeros(4)
    def curve(fq, gc):
        G = np.interp(np.log(np.maximum(fq, 20)), np.log(cen), gc)
        return np.where(fq >= 6000, np.clip(gc[3], gc[2] - 2.5, gc[2] + 0.5), G)
    for _ in range(12): gc += 0.8 * (target - share(Pl * 10 ** (curve(f, gc) / 10)))
    gc = np.clip(gc - gc[2], -9, 7); c = np.geomspace(31.5, 16000, 28); g = curve(c, gc)
    fir = eq_fir(c, g); meta['eq_db'] = {f'{int(a)}': round(float(v), 1) for a, v in zip(c, g)}
    meta['band_shares'] = dict(reference=[round(v, 1) for v in target], library_before=[round(v, 1) for v in share(Pl)], library_after=[round(v, 1) for v in share(Pl * 10 ** (curve(f, gc) / 10))])
    print('EQ (dB):', ' '.join(f'{int(a)}:{v:+.1f}' for a, v in zip(c, g)), flush=True); print('band shares', meta['band_shares'], flush=True)
    eq = lambda x: signal.fftconvolve(np.concatenate([x, np.zeros((len(fir), 2))]), fir[:, None], mode='full')[len(fir) // 2:len(fir) // 2 + len(x)]
    for kk in files:
        files[kk] = circ(eq, files[kk]) if (kk.endswith('bar') or kk.endswith('bar_thin')) and 'intro' not in kk else eq(files[kk])
    # stereo: A is very wide (side ~ mid, bass 3 dB heavier on the right, L/R correlation < 0.2): bass mono below 150 Hz, side -3 dB
    hp = signal.butter(4, 150, 'high', fs=SR, output='sos')
    def ms(x):
        M, S_ = (x[:, 0] + x[:, 1]) / 2, (x[:, 0] - x[:, 1]) / 2; S_ = 0.7 * signal.sosfiltfilt(hp, S_); return np.stack([M + S_, M - S_], 1)
    for kk in files:
        files[kk] = circ(ms, files[kk]) if (kk.endswith('bar') or kk.endswith('bar_thin')) and 'intro' not in kk else ms(files[kk])
    meta['stereo'] = 'side high-passed at 150 Hz (bass mono), side -3 dB'
    # stems with headroom: one gain for the whole library (groove loop at -22 LUFS) so nothing is limited here (the limiter is a -1 dBTP
    # safety only); loudness is made once, in the master (soft clip + true-peak limiter), not by squashing every module
    gain = 10 ** ((-22 - E.lufs(files['groove_8bar'])) / 20); meta['library_gain_db'] = round(20 * np.log10(gain), 2)
    for kk, x in files.items():
        loop = (kk.endswith('bar') or kk.endswith('bar_thin')) and 'intro' not in kk
        x = E.limit(x * gain, -1.0, circular=loop and not kk.startswith('hook')); sf.write(f'{lib}/{kk}.wav', x.astype(np.float32), SR, subtype='PCM_24')
        meta.setdefault('files', {})[kk] = dict(seconds=round(len(x) / SR, 3), lufs=round(E.lufs(x), 1) if len(x) > SR else None, tp=round(E.true_peak(x), 2))
    json.dump(meta, open(f'{lib}/lib.json', 'w'), indent=1, ensure_ascii=False); print('wrote', lib, len(files), 'files')

# ---------------------------------------------------------------- the v6 preview: modules on the film's bar grid
# (film start, film end, file, options)  in: x = 1-beat equal-power cross-fade centred on the start (pre-roll = the loop's own tail),
# hard = straight in on the downbeat (10 ms), swell = 1-beat fade-in from silence, eg = equal-gain cross-fade (same loop, full <-> thin)
# out: x / eg = cross-fade centred on the end, button = the module's _end at the end time, cut = stop at the end (30 ms) and let the
# room ring (reverb of the last 0.3 s), hold = to the end of the file.  bar0 = loop bar to start from (continuation after a switch).
PLAN = [
 (0.95, 8.3, 'hook_intro_4bar', dict(inn='hard', out='x')),                         # 0-8.4 hook: the gong (A 5.35) lands on the title at 6.30
 (8.3, 26.3, 'mystery_8bar', dict(inn='x')),                            # you die, the mummy
 (26.3, 42.3, 'curious_8bar', dict(inn='x')),                           # Book of the Dead
 (42.3, 52.3, 'danger_4bar', dict(inn='x')),                            # the road: gates, knives, cobra and crocodile
 (52.3, 72.3, 'groove_8bar', dict(inn='x', out='button')),              # hall of the 42 judges + the oath; button on 72.3 = 「话太多」
 (76.3, 92.3, 'tension_8bar', dict(inn='swell')),                       # the weighing (Ammit roars in 31, ~86-92: BGM drop comes with the SFX pass)
 (92.3, 96.3, 'dark_2bar', dict(inn='x')),                              # 32: the bed thins to the drone (A's own tension -> drone join)
 (96.3, 98.3, 'dark_2bar_thin', dict(inn='eg', out='cut', bar0=0, db=-5, lp=900)), # 33: drone only (the thin layer: no drum), darker; cut on 98.3
 (98.3, 106.3, 'playful_4bar', dict(inn='hard')),                       # 34 「等等——」 the scarab cheat, straight in on the downbeat
 (106.3, 114.3, 'playful_4bar_thin', dict(inn='eg', out='eg', bar0=0)), # 37: the bed thins under the papyrus line (drums out)
 (114.3, 121.57, 'playful_4bar', dict(inn='eg', out='cut', bar0=0)),    # 39-40; cut on the pan crash 121.57
 (126.3, 130.11, 'dark_2bar', dict(inn='swell', out='cut', db=-2)),     # 43 「第二次死亡」: chomp (123.77) then silence, the doom drone from 126.3, dead stop at 130.11
 (130.3, 142.17, 'bright_8bar', dict(inn='swell', out='cut')),          # 44-47 pass: Osiris, the Field of Reeds; the hiccup at 142.17
 (142.3, 156.3, 'playful_4bar', dict(inn='hard')),                      # 48-52 shabtis: playful again (reuse)
 (156.3, 164.3, 'mystery_8bar', dict(inn='x', out='x', cresc=4)),       # 53-54: the opening theme returns (bookend), +4 dB over its last bar into the cadence
 (164.3, 169.25, 'resolution_cadence', dict(inn='x')),                  # 55 end card: the last bar and the final chord ring through the card
]
FILM = 169.25

def preview(lib, out):
    n = int(FILM * SR); y = np.zeros((n, 2)); h = Q // 2
    eqp = lambda m: (np.sin(np.linspace(0, np.pi / 2, m)), np.cos(np.linspace(0, np.pi / 2, m)))
    for t0, t1, name, o in PLAN:
        src = sf.read(f'{lib}/{name}.wav', always_2d=True)[0]; L = len(src); loop = (name.endswith('bar') or name.endswith('bar_thin')) and 'intro' not in name
        inn, outm = o.get('inn', 'x'), o.get('out', 'x'); a0 = int(round(t0 * SR)); a1 = int(round(t1 * SR))
        pre = h if inn in ('x', 'eg') else (Q if inn == 'swell' else 0)
        post = h if outm in ('x', 'eg') else 0
        ia, ib = a0 - pre, min(n, a1 + post); idx = np.arange(ia, ib) - a0 + o.get('bar0', 0) * B
        if loop: seg = src[idx % L]
        else: seg = np.where(((idx >= 0) & (idx < L))[:, None], src[np.clip(idx, 0, L - 1)], 0.0)
        g = np.ones(len(seg))
        if inn in ('x', 'eg'): up, _ = eqp(2 * h); g[:2 * h] *= up if inn == 'x' else np.linspace(0, 1, 2 * h)
        elif inn == 'swell': g[:Q] *= np.linspace(0, 1, Q) ** 2
        else: g[:int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))
        if outm in ('x', 'eg') and ib == a1 + post: _, dn = eqp(2 * h); g[-2 * h:] *= dn if outm == 'x' else np.linspace(1, 0, 2 * h)
        elif outm in ('cut', 'button'): k = int(0.03 * SR); g[-k:] *= np.linspace(1, 0, k)
        if o.get('cresc'): k = a1 - B - ia; g[k:] *= 10 ** (np.clip((np.arange(len(g) - k)) / B, 0, 1) * o['cresc'] / 20)
        seg = seg * g[:, None]
        if 'lp' in o: seg = E.filt(E.sos_lp(o['lp'], 4), seg)
        seg *= 10 ** (o.get('db', 0) / 20); y[ia:ib] += seg
        if outm == 'cut':
            tail = ring(seg[-int(0.3 * SR):], wet=0.6)[int(0.3 * SR):] * 0.6; e = min(n, ib + len(tail)); y[ib:e] += tail[:e - ib]
        if outm == 'button':
            mood = name.split('_')[0]; bt = sf.read(f'{lib}/{mood}_end.wav', always_2d=True)[0]; e = min(n, a1 + len(bt)); y[a1:e] += bt[:e - a1] * 10 ** (o.get('db', 0) / 20)
    y = master(y); k = int(0.5 * SR); y[-k:] *= np.linspace(1, 0, k)[:, None] ** 2
    sf.write(out, y.astype(np.float32), SR, subtype='PCM_24'); print('preview', out, round(len(y) / SR, 2), 's', round(E.lufs(y), 2), 'LUFS', round(E.true_peak(y), 2), 'dBTP')

def softclip(x, ceil_db=-1.0, knee_db=2.5):
    """4x oversampled tanh soft clip above a knee 2.5 dB under the ceiling: shaves the darbuka's few-ms peaks (a few dB at most)
    without the pumping a deep brickwall would add to the oud between hits; the rare tutti hits are left to the limiter."""
    c = 10 ** (ceil_db / 20); t = c * 10 ** (-knee_db / 20); up = signal.resample_poly(x, 4, 1, axis=0); a = np.abs(up); o = a > t
    a[o] = t + (c - t) * np.tanh((a[o] - t) / (c - t)); return signal.resample_poly(np.sign(up) * a, 1, 4, axis=0)[:len(x)]

def master(y, target=-14.0, ceil=-1.75):
    g = 10 ** ((target - E.lufs(y)) / 20)
    for _ in range(3):
        z = softclip(y * g); g *= 10 ** ((target - E.lufs(z)) / 20)
    z = softclip(y * g); tp_in, tp_sc = E.true_peak(y * g), E.true_peak(z); z = E.limit(z, ceil, look=0.005, rel=0.15)
    print(f'master: gain {20 * np.log10(g):+.1f} dB, peaks {tp_in:+.1f} dBTP -> soft clip {tp_sc:+.1f} -> limiter (max GR {max(0, tp_sc - ceil):.1f} dB)')
    return z

if __name__ == '__main__':
    if sys.argv[1] == 'build': build(sys.argv[2], sys.argv[3], sys.argv[4])
    else: preview(sys.argv[2], sys.argv[3])
