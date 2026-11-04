#!/usr/bin/env python3
"""ep60 v6 music library (owner 21:58: "aim for X number of bars, reusable for scenes ... the same style so that immersive is kept
constant"): turn ElevenLabs Music generations (one per mood: 2-bar intro, N-bar loop, 2-bar button) into loopable modules on one
120 BPM grid, matched to the reference's timbre, and lay them out on the film's timeline for a music-only preview.

    python3 lib60.py build RAW_DIR LIB_DIR [REF_AUDIO[:start:end]]   -> LIB_DIR/<mood>_<N>bar.wav (+ _intro, _end), lib.json
    python3 lib60.py preview LIB_DIR OUT.wav                         -> the cues on the v6 timeline (music only), mastered

Build, per generation: beat grid (librosa) -> tempo (median beat period) -> if it is off 120 by > 0.25 BPM, time-stretch the
whole take to 120 (ffmpeg atempo, pitch kept) -> downbeat phase = the beat phase (mod 4) with the strongest onsets -> the loop
starts on the downbeat nearest the nominal end of the intro (2 bars); intro = the 2 bars before it, loop = N bars, end = the rest.
Seamless loop: the loop's last bar is cross-faded (equal power) into the bar that precedes its first bar in the take, so the end
of the file flows into its start the way the intro flowed into bar 1. One match-EQ for the whole library (third-octave average
of all loops vs the reference, +-6 dB, smoothed, linear phase), then every module at -14 LUFS (loop), true peak <= -1.5 dBTP.
"""
import os, sys, json, subprocess, numpy as np, soundfile as sf
from scipy import signal
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
SR = 48000; BPM = 120.0; BAR = 4 * 60 / BPM
# mood -> loop bars and the sections the generation was asked for (bars): intro 2, loop N, end 2; tension: loop 8, rise 4, hush 2
MOODS = {'mystery': 16, 'curious': 8, 'danger': 8, 'groove': 16, 'tension': 8, 'playful': 16, 'dark': 8, 'bright': 8, 'resolution': 6}

def load(p, sr=SR, ss=None, to=None):
    a = ['ffmpeg', '-v', 'quiet'] + (['-ss', str(ss), '-to', str(to)] if ss is not None else []) + ['-i', p, '-ac', '2', '-ar', str(sr), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(a, capture_output=True).stdout, np.float32).reshape(-1, 2).astype(np.float64)

def grid(y):
    import librosa
    m = librosa.resample(y.mean(1).astype(np.float32), orig_sr=SR, target_sr=22050)
    oenv = librosa.onset.onset_strength(y=m, sr=22050)
    tempo, beats = librosa.beat.beat_track(onset_envelope=oenv, sr=22050, start_bpm=BPM, tightness=400, units='frames')
    bt = librosa.frames_to_time(beats, sr=22050); per = float(np.median(np.diff(bt))) if len(bt) > 8 else 60 / BPM
    st = oenv[np.clip(beats, 0, len(oenv) - 1)]; phase = int(np.argmax([st[k::4].mean() for k in range(4)]))
    return 60 / per, bt, phase

def stretch(p_in, factor, p_out):
    subprocess.run(['ffmpeg', '-v', 'quiet', '-y', '-i', p_in, '-af', f'atempo={factor:.6f}', '-ar', str(SR), p_out], check=True)

def third_oct(y):
    f, P = signal.welch(y.mean(1), SR, nperseg=8192); c = np.geomspace(40, 16000, 28)
    return c, np.array([10 * np.log10(P[(f >= a / 2 ** (1 / 6)) & (f < a * 2 ** (1 / 6))].mean() + 1e-20) for a in c])

def eq_fir(c, gain_db, n=4097):
    f = np.linspace(0, SR / 2, n // 2 + 1); g = np.interp(np.log(np.maximum(f, 20)), np.log(c), gain_db)
    return signal.firwin2(n, f / (SR / 2), 10 ** (g / 20))

def build(raw, lib, ref=None):
    import egypt_cues as E
    os.makedirs(lib, exist_ok=True); parts, meta = {}, {}
    for mood, N in MOODS.items():
        p = f'{raw}/ep60lib_{mood}.mp3'
        if not os.path.exists(p): print('missing', p); continue
        y = load(p); tempo, bt, ph = grid(y); note = ''
        if abs(tempo - BPM) > 0.25:
            tmp = f'{lib}/_st_{mood}.wav'; stretch(p, BPM / tempo, tmp); y = load(tmp); os.remove(tmp)
            t2, bt, ph = grid(y); note = f'stretched {tempo:.2f}->{t2:.2f} BPM'; tempo = t2
        down = bt[ph::4]; s = float(down[np.argmin(np.abs(down - 2 * BAR))]) if len(down) else 2 * BAR
        k = int(round(s * SR)); b = int(round(BAR * SR))
        if k < b: k += 4 * int(round(60 / BPM * SR))   # need one full bar before the loop for the seam
        L = N * b if mood != 'tension' else 8 * b
        intro = y[max(0, k - 2 * b):k]; loop = y[k:k + L].copy(); rest = y[k + L:]
        pre = y[k - b:k]; w = np.sin(np.linspace(0, np.pi / 2, b))[:, None]   # last bar of the loop -> the bar before its start
        loop[-b:] = loop[-b:] * np.cos(np.linspace(0, np.pi / 2, b))[:, None] + pre * w
        d = {'intro': intro, 'loop': loop}
        if mood == 'tension': d['rise'] = rest[:4 * b]; d['hush'] = rest[4 * b:6 * b + int(0.8 * SR)]
        elif mood == 'resolution': d['loop'] = y[k:k + N * b]; d['end'] = rest   # resolution plays through: body + cadence
        else: d['end'] = rest
        if 'end' in d:
            e = d['end']; i = np.flatnonzero(np.abs(e).max(1) > 10 ** (-60 / 20)); e = e[:i[-1] + 1] if len(i) else e
            kf = min(len(e) // 3, int(0.4 * SR)); e[-kf:] *= np.linspace(1, 0, kf)[:, None] ** 2; d['end'] = e
        parts[mood] = d; meta[mood] = dict(tempo=round(tempo, 2), downbeat_s=round(s, 3), loop_bars=N if mood != 'tension' else 8, note=note)
        print(f'{mood:10s} tempo {tempo:6.2f}  downbeat phase {ph}  loop from {s:6.3f} s  {note}', flush=True)
    # one match-EQ for the library
    if ref:
        rp, *rr = ref.split(':'); r = load(rp, ss=rr[0], to=rr[1]) if rr else load(rp)
        c, Rs = third_oct(r); Ls = np.mean([third_oct(d['loop'])[1] for d in parts.values()], 0)
        g = (Rs - Rs.mean()) - (Ls - Ls.mean()); g = np.convolve(np.pad(g, 2, mode='edge'), np.ones(5) / 5, 'valid'); g = np.clip(g, -6, 6)
        fir = eq_fir(c, g); meta['_eq_db'] = {f'{int(a)}': round(float(v), 1) for a, v in zip(c, g)}
        for d in parts.values():
            for kk in d: d[kk] = signal.fftconvolve(d[kk], fir[:, None], mode='same')
    for mood, d in parts.items():
        Lm = E.lufs(d['loop']); gain = 10 ** ((-14 - Lm) / 20); N = meta[mood]['loop_bars']
        names = {'intro': f'{mood}_intro_2bar', 'loop': f'{mood}_{N}bar' if mood != 'resolution' else f'{mood}_{N}bar_body',
                 'end': f'{mood}_end' if mood != 'resolution' else f'{mood}_cadence', 'rise': 'tension_rise_4bar', 'hush': 'tension_hush_2bar'}
        files = {}
        for kk, x in d.items():
            x = E.limit(x * gain, -1.75, circular=(kk == 'loop' and mood != 'resolution')); fn = f'{names[kk]}.wav'
            sf.write(f'{lib}/{fn}', x.astype(np.float32), SR, subtype='PCM_24'); files[kk] = dict(file=fn, seconds=round(len(x) / SR, 3), bars=round(len(x) / SR / BAR, 2))
        meta[mood]['files'] = files
    json.dump(meta, open(f'{lib}/lib.json', 'w'), indent=1); print('wrote', lib)

# ---------------------------------------------------------------- the v6 preview: cues on the timeline, changes on bar lines
PLAN = [  # (start s, mood, part, note) on one 2 s bar grid from 0; each change cross-fades over half a bar into the next downbeat
 (0, 'mystery', 'intro', 'hook: the ensemble enters'), (4, 'mystery', 'loop', 'you die, the mummy (title ~6.3 lands in bar 2 of the loop)'),
 (26, 'curious', 'loop', 'Book of the Dead'), (42, 'danger', 'loop', 'the road through the underworld'),
 (52, 'groove', 'loop', 'hall of the 42 judges + the oath'), (72, 'groove', 'end', '话太多: the groove buttons and stops (the comic stop)'),
 (76, 'tension', 'loop', 'the weighing'), (92, 'tension', 'rise', 'the pans wobble'), (96, 'tension', 'hush', 'near silence before 「等等——」'),
 (98, 'playful', 'loop', 'the scarab cheat'), (122, 'dark', 'loop', 'fail: the second death'), (130, 'bright', 'loop', 'pass: Osiris, the Field of Reeds'),
 (142, 'playful', 'loop', 'the shabtis at work'), (158, 'resolution', 'loop', 'close'), (170, None, None, 'end')]

def preview(lib, out):
    import egypt_cues as E
    meta = json.load(open(f'{lib}/lib.json')); n = int(169.25 * SR); y = np.zeros((n, 2)); x_ = int(0.5 * BAR * SR)
    for (t0, mood, part, _), (t1, *_r) in zip(PLAN[:-1], PLAN[1:]):
        f = meta[mood]['files'][part]['file']; src = sf.read(f'{lib}/{f}', always_2d=True)[0]
        if mood == 'resolution':   # body + cadence play through to the end
            src = np.concatenate([src, sf.read(f"{lib}/{meta[mood]['files']['end']['file']}", always_2d=True)[0]])
        a, b = int(t0 * SR), min(n, int(t1 * SR) + x_)
        seg = src[np.arange(b - a) % len(src)] if part == 'loop' and mood != 'resolution' else np.pad(src, ((0, max(0, b - a - len(src))), (0, 0)))[:b - a]
        g = np.ones(b - a)
        if t1 < 169 and part not in ('end', 'hush'): g[-x_:] = np.cos(np.linspace(0, np.pi / 2, x_))   # out: half a bar into the next downbeat
        y[a:b] += seg * g[:, None]
    L = E.lufs(y); y = E.limit(y * 10 ** ((-14 - L) / 20), -1.75); k = int(1.0 * SR); y[-k:] *= np.linspace(1, 0, k)[:, None]
    sf.write(out, y.astype(np.float32), SR, subtype='PCM_24'); print('preview', out, round(len(y) / SR, 2), 's', round(E.lufs(y), 2), 'LUFS')

if __name__ == '__main__':
    if sys.argv[1] == 'build': build(sys.argv[2], sys.argv[3], sys.argv[4] if len(sys.argv) > 4 else None)
    else: preview(sys.argv[2], sys.argv[3])
