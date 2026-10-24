"""Measure ep44_bed_final.wav: landmark positions (xcorr against the source), cue offsets, loudness, joins.
Writes music_map_ep44.json and ep44_bed_curves.png."""
import numpy as np, soundfile as sf, json, os, pyloudnorm as pyln
from scipy.signal import resample_poly, butter, sosfilt, resample
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000; P = 0.56605; T0 = 0.5688; BAR = 4 * P
B = lambda k: T0 + k * BAR
info = json.load(open(os.path.join(HERE, '_build_info.json')))
F_C, F_D, CS, DS = info['F_C'], info['F_D'], info['C_start_film'], info['D_start_film']
DIP = 136.805; DROP = 191.327
import subprocess
_raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', '/home/claude/video/episodes/41-sanqiannian/audio/bgm2.mp3', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True).stdout
song = np.frombuffer(_raw, np.float32).reshape(-1, 2)
x, _ = sf.read(os.path.join(HERE, 'ep44_bed_final.wav'), dtype='float32')
S = lambda t: int(round(t * SR))


def film(seg, s):
    if seg == 'A1': return s
    if seg == 'A2': return s + 4.528
    if seg == 'B': return s - B(77) + 57.1734
    if seg == 'C':
        if 181.9 <= s <= 189.064: tau = s - 181.9
        elif B(64) <= s <= B(72): tau = (189.064 - 181.9) + (s - B(64))
        else: tau = (189.064 - 181.9) + (B(72) - B(64)) + (s - B(42))
        return CS + tau / F_C
    if seg == 'D':
        if s <= B(56) and s >= B(47) - 0.3: tau = s - (B(47) - 0.3)
        else: tau = (B(56) - B(47) + 0.3) + (s - B(72))
        return DS + tau / F_D
    if seg == 'E':
        if s <= DROP + 3 * BAR and s >= 187.366: tau = s - 187.366
        elif s <= 241.56: tau = (DROP + 3 * BAR - 187.366) + (s - (DROP + 19 * BAR))
        else: tau = (DROP + 3 * BAR - 187.366) + (241.52 - (DROP + 19 * BAR)) + (s - 244.58)
        return DIP + tau


def locate(seg, s, win=0.4, search=0.25):
    """Find where song time s actually sits in the mix: xcorr a source snippet around the predicted film time."""
    f = {'C': F_C, 'D': F_D}.get(seg, 1.0)
    pred = film(seg, s)
    src = song[S(s - 0.1):S(s + win)].mean(1)
    if f != 1.0: src = resample(src, int(round(len(src) / f)))
    a = S(pred - 0.1 / f - search); b = a + len(src) + 2 * S(search)
    tgt = x[max(a, 0):b].mean(1)
    from scipy.signal import fftconvolve as _fc
    c = _fc(tgt, src[::-1], 'valid')
    cs_ = np.concatenate([[0], np.cumsum(tgt.astype(np.float64) ** 2)]); nrm = np.sqrt(cs_[len(src):] - cs_[:-len(src)])[:len(c)] * np.linalg.norm(src) + 1e-12
    k = np.argmax(c / nrm)
    return max(a, 0) / SR + k / SR + 0.1 / f, float((c / nrm)[k]), pred


L = []   # (label, seg, song_t, cue_film or None, tolerance)
L += [('first note (frame-0 crack ~0.5)', 'A1', 0.570, 0.5, None),
      ('intro loop splice (bar 2 -> bar 1, chroma 1.000)', 'A2', 2.833, None, None),
      ('TITLE: song HIT (crash + 808 pickup, beat 16) [cue a: 13.5-14.0]', 'A2', 9.060, 13.75, 0.25),
      ('A section downbeat', 'A2', 9.626, None, None),
      ('B section (bright B pedal), compass scene', 'A2', 18.682, None, None),
      ('C section', 'A2', 36.796, None, None),
      ('C turnaround bar 22', 'A2', 50.381, None, None),
      ('J1 C22 -> B-build bar 77 (hospital)', 'B', B(77), 56.25, None),
      ('stop bar downbeat, tick 1', 'B', 179.441, None, None),
      ('tick 4 = last tick, D1 "the clock stops" [cue b]', 'B', 180.290, 62.5, 0.1),
      ('D2 lead-in first sound [cue b: exactly 65.0]', 'C', 182.266, 65.0, 0.1),
      ('lead-in bar 3 -> valley bar 64 (dark, 808 bumps)', 'C', B(64), None, None),
      ('valley 71 -> L1 42: groove returns (23 years / Kansas)', 'C', B(42), None, None),
      ('L1 bar 44', 'C', B(44), 94.25, None),
      ('REP 1 找到了: L1 bar 47 downbeat [cue c]', 'D', B(47), 100.75, 0.1),
      ('REP 1 stamp: C48 beat 3 [cue c ~104.25]', 'D', B(48) + 2 * P, 104.25, 0.1),
      ('1997 drive: C bar 50 downbeat', 'D', B(50), 107.5, None),
      ('C turnaround bar 54 (she refuses 116.75)', 'D', B(54), 116.75, None),
      ('REP 2 找到了: CRASH (song 163.591) [cue c ~120.5]', 'D', 163.591, 120.5, 0.1),
      ('REP 2 stamp 得不出结论: crash bar beat 3 [cue c 122.25]', 'D', 163.591 + 2 * P, 122.25, 0.1),
      ('REP 3 找到了: B-build bar 74 downbeat [cue c 125.5]', 'D', B(74), 125.5, 0.1),
      ('REP 3 stamp 只是假设: bar 75 downbeat [cue c 127.75]', 'D', B(75), 127.75, 0.1),
      ('18 researchers: bar 76', 'D', B(76), 130.25, None),
      ('verdict: bar 77 beat 3', 'D', B(77) + 2 * P, 133.5, None),
      ('DIP: lead-in bar 3 beat 2 (3-beat bar) under 137.25', 'E', 187.366, 137.25, None),
      ('lead-in bar 4 (breath)', 'E', 189.064, None, None),
      ('DROP, key change up a semitone [cue d: F1 140.75]', 'E', DROP, 140.75, 0.1),
      ('compass bookend: drop bar 1 + 2 beats', 'E', DROP + BAR + 2 * P, 144.0, None),
      ("song's own fall bar (drums decay) [quote 147.5]", 'E', DROP + 19 * BAR, 147.5, None),
      ('coda (Gb, quiet, no sub)', 'E', 236.611, None, None),
      ('coda F chord [quote 151.0]', 'E', 237.70, 151.0, None),
      ('coda splice 241.56 -> 244.62 [end card 154.75]', 'E', 244.62, 154.75, None),
      ('dead stop (final hit, rings out)', 'E', 252.10, None, None)]

rows = []
for lab, seg, s, cue, tol in L:
    m, r, pred = locate(seg, s)
    d = None if cue is None else round(m - cue, 3)
    ok = None if tol is None else abs(m - cue) <= tol + 1e-9
    rows.append(dict(event=lab, song_s=round(s, 3), film_pred=round(pred, 3), film_measured=round(m, 3),
                     xcorr=round(r, 3), cue=cue, delta=d, within_tol=ok))
    print(f'{lab:62s} song {s:8.3f} pred {pred:8.3f} meas {m:8.3f} r={r:.2f}' + ('' if cue is None else f'  cue {cue:7.2f} d={m-cue:+.3f}' + ('' if tol is None else (' OK' if ok else ' MISS'))))

# cold-open picture beats vs the beat grid (film beats = 0.5688 + 4.528 + kP after the loop; same grid before)
beats = np.array([T0 + k * P for k in range(0, 40)])
co = {t: float(beats[np.argmin(abs(beats - t))] - t) for t in (4.0, 6.25, 8.25, 10.25, 12.75)}
print('cold-open beats (nearest beat - picture):', {k: round(v, 3) for k, v in co.items()})

# loudness curves
meter = pyln.Meter(SR)
I = meter.integrated_loudness(x.astype(np.float64))
tp = 20 * np.log10(np.abs(resample_poly(x, 4, 1, axis=0)).max())
y = x.astype(np.float64).copy()
for f in meter._filters.values():
    for c in range(2): y[:, c] = f.apply_filter(y[:, c])
pw = (y ** 2).sum(1); cs = np.concatenate([[0], np.cumsum(pw)])
hop = S(0.05); w = S(0.4)
idx = np.arange(0, len(x) - w, hop); st = -0.691 + 10 * np.log10((cs[idx + w] - cs[idx]) / w + 1e-12); tt = (idx + w / 2) / SR
w3 = S(3.0); idx3 = np.arange(0, len(x) - w3, hop); st3 = -0.691 + 10 * np.log10((cs[idx3 + w3] - cs[idx3]) / w3 + 1e-12); tt3 = (idx3 + w3 / 2) / SR
mono = x.mean(1)
sub = sosfilt(butter(4, 100, 'low', fs=SR, output='sos'), mono); hi = sosfilt(butter(4, 4000, 'high', fs=SR, output='sos'), mono)
c2 = np.concatenate([[0], np.cumsum(sub ** 2)]); c3 = np.concatenate([[0], np.cumsum(hi ** 2)]); c1 = np.concatenate([[0], np.cumsum(mono ** 2)])
subr = 10 * np.log10((c2[idx + w] - c2[idx]) / (c1[idx + w] - c1[idx] + 1e-12) + 1e-12)
hir = 10 * np.log10((c3[idx + w] - c3[idx]) / (c1[idx + w] - c1[idx] + 1e-12) + 1e-12)
# near-silence after D1 (short-term 400 ms < -40 LUFS)
m = (tt > 62.5) & (tt < 65.0)
ns = float((st[m] < -40).sum() * 0.05)
ns_seg = tt[m][st[m] < -40]
print(f'integrated {I:.2f} LUFS, true peak {tp:.2f} dBTP, near-silence (<-40 LUFS 400ms) between D1 and D2: {ns:.2f} s',
      (round(float(ns_seg.min()), 2), round(float(ns_seg.max()), 2)) if len(ns_seg) else '')
# loudest moments
for lab, (a, b) in {'title 13.4-16': (13.4, 16), 'body 17-56': (17, 56), 'hospital 56-62.5': (56, 62.5), 'journey 65-97.5': (65, 97.5),
                    'hunt 97.5-136.8': (97.5, 136.8), 'dip 136.8-140.7': (136.8, 140.7), 'drop 140.75-147.5': (140.75, 147.5),
                    'after 151': (151, 163.5)}.items():
    mm = (tt >= a) & (tt < b); m3 = (tt3 >= a) & (tt3 < b)
    print(f'{lab:20s} ST400 p95 {np.percentile(st[mm], 95):6.1f}  ST3s mean {st3[m3].mean():6.1f}  sub/full {subr[mm].mean():6.1f}  >4k/full {hir[mm].mean():6.1f}')
mm = tt > 151; print('max ST400 after 151:', round(float(st[mm].max()), 2), ' max ST400 in drop 140.7-147.5:', round(float(st[(tt > 140.7) & (tt < 147.5)].max()), 2))

# joins: sample-step clicks and 10 ms level jumps
joins = {'intro loop': 7.361, 'J1 C22->B77': 57.1734, 'silence->C (pre-roll)': CS, 'lead-in->valley': film('C', B(64)),
         'valley->L1': film('C', B(42)), 'C->D rep1': 100.807, 'C55->crash': film('D', 163.591), 'D->E dip': DIP,
         'drop->fall bar': film('E', DROP + 19 * BAR), 'coda splice': film('E', 244.62), 'dead stop': film('E', 252.142)}
jr = {}
for k, t0 in joins.items():
    seg = x[S(t0 - 0.06):S(t0 + 0.06)].mean(1)
    d1 = np.abs(np.diff(seg)); ref = np.abs(np.diff(x[S(t0 - 1.0):S(t0 - 0.1)].mean(1)))
    e = 20 * np.log10(np.sqrt(np.convolve(x[S(t0 - 0.3):S(t0 + 0.3)].mean(1) ** 2, np.ones(480) / 480, 'valid')) + 1e-9)
    e10 = e[::480]
    jump = float(np.max(np.abs(np.diff(e10[:]))))
    jr[k] = dict(film=round(t0, 3), max_step_vs_p99_before=round(float(d1.max() / (np.percentile(ref, 99.9) + 1e-9)), 2),
                 max_10ms_level_jump_db=round(jump, 1))
    print(f'join {k:24s} {t0:8.3f}  max sample step / p99.9 before = {jr[k]["max_step_vs_p99_before"]:.2f}   max 10ms level jump {jump:.1f} dB')

# mono compatibility and stereo
L_, R_ = x[:, 0], x[:, 1]
corr = float(np.corrcoef(L_, R_)[0, 1]); monodiff = meter.integrated_loudness(np.stack([(L_ + R_) / 2] * 2, 1).astype(np.float64)) - I
print(f'L/R correlation {corr:.3f}, mono fold-down loudness change {monodiff:+.2f} dB')

# plot
fig, ax = plt.subplots(3, 1, figsize=(30, 11), sharex=True)
ax[0].plot(tt, st, lw=.6, label='ST 400 ms'); ax[0].plot(tt3, st3, lw=1.6, label='ST 3 s'); ax[0].set_ylim(-50, -6); ax[0].axhline(-14, color='g', lw=.5); ax[0].legend(loc='lower left')
ax[0].set_ylabel('LUFS')
ax[1].plot(tt, subr, lw=.6); ax[1].set_ylabel('<100 Hz / full (dB)'); ax[1].set_ylim(-35, 2)
ax[2].plot(tt, hir, lw=.6); ax[2].set_ylabel('>4 kHz / full (dB)'); ax[2].set_ylim(-45, -10)
cues = {'title': 13.588, 'D1': 62.5, 'D2': 65.0, 'rep1': 100.75, 'rep2': 121.0, 'rep3': 125.5, 'F1': 140.75, 'quote': 147.5, '151': 151.0, 'end card': 154.75, 'fade': 163.5}
for a in ax:
    for k, v in cues.items(): a.axvline(v, color='r', lw=.8)
    for k, v in joins.items(): a.axvline(v, color='k', lw=.4, ls=':')
for k, v in cues.items(): ax[0].text(v, -8, k, color='r', fontsize=9)
ax[2].set_xticks(np.arange(0, 165, 5)); ax[2].grid(axis='x', alpha=.3)
plt.tight_layout(); plt.savefig(os.path.join(HERE, 'ep44_bed_curves.png'), dpi=55)

MAP = dict(
    file='ep44_bed_final.wav (48 kHz, 24-bit, stereo, 164.500 s)',
    song='episodes/41-sanqiannian/audio/bgm2.mp3 (not committed)',
    loudness=dict(integrated_lufs=round(I, 2), true_peak_dbtp=round(tp, 2), limiter_max_gr_db=round(info.get('gr_db', 0), 2),
                  limiter_active_ms=round(info.get('gr_ms_over_0p1dB', 0)), near_silence_after_D1_s=ns,
                  lr_correlation=round(corr, 3), mono_fold_change_db=round(monodiff, 2)),
    grid=dict(beat_s=P, song_downbeats_part1='0.5688 + 2.2642*n', song_downbeats_part2='1.1348 + 2.2642*n (from 182.271)',
              film_grid={'0-62.9 (A,B)': 'downbeats 0.5688 + 2.2642*n (identical to the song grid; film = song + 4.528 after the intro loop)',
                         '65.0-100.8 (C, x1.01193)': 'downbeats 65.005 + 2.2375*n',
                         '100.8-136.8 (D, x1.00631)': 'downbeats 100.805 + 2.25*n, beats 0.5625',
                         '136.8-164.5 (E, native)': 'beats 136.805 + 0.56605*k; DROP downbeat 140.766, then 2.2642 bars (coda is rubato)'}),
    spans=[
        dict(film=[0.0, 7.361], song=[0.0, 7.361], what='intro bars 0-2 (F, Am, F), first note 0.570'),
        dict(film=[7.361, 57.173], song=[2.833, 52.645], what='intro bars 1-3 again (6-bar intro) + HIT + A + B + C to the end of the turnaround bar 22', xf='60 ms equal-power before 7.361 (loop splice)'),
        dict(film=[57.173, 63.161], song=[174.912, 180.90], what='B-build bars 77-78 + stop bar (4 ticks) + the song silence', xf='15 ms equal-power'),
        dict(film=[63.161, round(CS, 3)], song='gap', what='digital silence (filled by the tick reverb and the inhale)'),
        dict(film=[round(CS, 3), 100.807], song=[[181.90, 189.064], [round(B(64), 3), round(B(72), 3)], [round(B(42), 3), round(B(47), 3)]], tempo=round(F_C, 5),
             what='lead-in bars 1-3, valley bars 64-71, L1 bars 42-46; one rubberband stretch (pitch kept)', xf='30 ms eq-power (lead-in->valley), 15 ms (valley->L1)'),
        dict(film=[100.787, 136.805], song=[[round(B(47), 3), round(B(56), 3)], [163.591, 179.441]], tempo=round(F_D, 5),
             what='L1 bar 47, C 48-55, crash + B-build 72-78', xf='20 ms linear at rep 1 (same audio), 10 ms eq-power C55->crash'),
        dict(film=[136.805, 164.5], song=[[187.366, round(DROP + 3 * BAR, 3)], [round(DROP + 19 * BAR, 3), 241.60], [244.58, 252.142]],
             what='lead-in from bar 3 beat 2 (3-beat bar), DROP + drop bars 0-2, the fall bar, coda (one cycle skipped), dead stop',
             xf='30 ms eq-power at the dip, 10 ms drop->fall bar, 80 ms eq-power coda splice centred on 241.56 -> 244.62 (film 154.772)'),
    ],
    effects=[
        dict(film=[12.75, 13.588], what='reverse reverb swell of the HIT (rewind), -11 dB, ends on the HIT'),
        dict(film=[61.68, 64.2], what='2 s reverb (tau 0.5 s) of the stop-bar ticks, -12 dB: the clock rings out by ~63.9, then real near-silence 64.15-64.6'),
        dict(film=[64.45, 65.0], what='inhale: reversed reverb of the lead-in, -9 dB, ends at 65.000'),
        dict(film=[136.795, 139.3], what='2.5 s reverb of the B-build last beat under the dip, -12 dB'),
        dict(film=[round(info['t_dead'], 3), 164.5], what='4 s reverb ring of the dead stop, -9 dB; film fade 163.5->164.5 (cos^1.5)'),
    ],
    gain_rides=[dict(film=[89.618, 121.055], db=-1.0, why='groove return -> rep-2 crash one dB under, so the hunt steps up on the crash (steps hidden under the drum re-entry and the crash)'),
                dict(film=[140.756, 147.559], db=+1.5, why='DROP bars 0-2 lifted so F1 is the biggest sustained moment; ramps back to 0 over the fall bar 147.559-152.087')],
    report=dict(
        missed=[
            dict(cue='rep 2 找到了 ~120.5', got='crash downbeat 121.055 (+0.555)', why='120.5 is not on any downbeat that also keeps rep 1 (100.75) and rep 3 (125.5) on downbeats: those two are 11 bars apart only at a 2.25 s bar, which puts the downbeats at 118.805 / 121.055. 120.493 is beat 4 (the pickup into the crash). Ask the picture to move 找到了 to 121.05; the stamp 得不出结论 at 122.25 then sits on beat 3 (122.180, -0.07).'),
            dict(cue='cold-open beat 8.25 (C4 car)', got='nearest beats 7.927 / 8.494 (+0.244)', why='4.0, 6.25 and 10.25 are on the beat (-0.035, -0.021, -0.058); 8.25 is 7.5 beats after 4.0, a half-beat on any grid that holds the other three. The intro has no drums (pulse autocorr 0.31), so the half-beat cut is soft; picture could move C4 to 8.49.'),
            dict(cue='rewind start 12.75', got='beats 12.456 / 13.022', why='Not a named cue; the reverse swell starts at 12.75 anyway and ends on the HIT 13.588.'),
        ],
        near=[
            dict(cue='title landing (a)', got='HIT 13.588 (window 13.5-14.0)'),
            dict(cue='D1 clock stops (b)', got='last tick 62.551 (+0.051); near-silence 0.45 s (64.15-64.60 < -40 LUFS); D2 first sound 65.001'),
            dict(cue='hunt (c)', got='rep1 100.806 (+0.056), stamp 104.180 (-0.07 vs ~104.25), rep3 125.555 (+0.055), stamp 127.805 (+0.055); all shifted +0.05 on purpose so the stamps (beat 3) and the 找到了 (downbeats) split the 0.125 s difference'),
            dict(cue='F1 (d)', got='DROP 140.766 (+0.016)'),
            dict(cue='ending (e)', got='fall bar 147.559 (quote 147.5), coda from 149.823, F chord 150.912 (quote 151.0), max ST400 after 151 = -14.8 vs drop max -10.3, dead stop 162.25 rings into the 163.5-164.5 fade'),
        ],
        stretch='two segments are time-stretched with rubberband (pitch kept): 65.0-100.8 x1.0119 (+1.2 %), 100.8-136.8 x1.0063 (+0.6 %); crest factor and onset sharpness within 6 % of the source',
        not_on_beat_scene_changes='hospital 56.25 (music changes on the next downbeat 57.173), she refuses 116.75 (turnaround 116.555), 18 researchers 130.25 (bar 130.055), compass bookend 144.0 (drop bar 1 beat 3 = 144.162), end card 154.75 (coda is rubato; the splice sits at 154.772)'),
    cues=rows, cold_open_beats_nearest_beat_minus_picture=co, joins=jr)
import builtins
def _cl(o):
    if isinstance(o, dict): return {k: _cl(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)): return [_cl(v) for v in o]
    if isinstance(o, (np.floating,)): return float(o)
    if isinstance(o, (np.integer,)): return int(o)
    if isinstance(o, np.bool_): return bool(o)
    return o
MAP = _cl(MAP)
json.dump(MAP, open(os.path.join(HERE, 'music_map_ep44.json'), 'w'), indent=1, ensure_ascii=False)
