"""Genre-switch demo (jazz 4 bars -> rock 3 bars, 120 BPM): one score for the picture and the sound.
python3 clip_score.py <outdir> -> <outdir>/clip_score.json, <outdir>/clip_audio.wav
Every sound is made here in code: drums, bass, guitar, piano, synth brass, and a formant-synthesised voice."""
import json, sys, wave, numpy as np
from scipy.signal import lfilter, butter
OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
SR, BPM = 48000, 120
BEAT = 60 / BPM; STEP = BEAT / 4; BAR = BEAT * 4
R4 = lambda a: a * 4
mid = lambda n: 440 * 2 ** ((n - 69) / 12)
# ---------------------------------------------------------------- the parts, in the same player order as LINEUP in genre_frames.js
# (player index, part name, pattern, note length in steps, mark)
PARTS = {
    'jazz': [
        (0, 'ride', [1,0,0,0, 1,0,0,1, 1,0,0,0, 1,0,0,1], 1, 'tick'), (0, 'brush', [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0], 1, 'sq'),
        (1, 'walk', R4([1,0,0,0]), 1, 'bar'), (2, 'comp', [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0], 1, 'bar'),
        (3, 'piano', [0,0,0,1, 0,0,1,0, 0,0,0,1, 0,0,0,0], 2, 'bar'), (4, 'horns', [0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,1,0], 2, 'bar'),
        (5, 'scat', [0,0,0,0, 0,0,1,0, 1,0,1,1, 0,0,0,0], 2, 'bar')],
    'rock': [
        (0, 'kick', [1,0,0,0, 0,0,0,1, 1,0,1,0, 0,0,0,0], 1, 'dot'), (0, 'snare', [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0], 1, 'sq'), (0, 'hats', R4([1,0,1,0]), 1, 'tick'),
        (1, 'bass8', R4([1,0,1,0]), 1, 'bar'), (2, 'power', R4([1,0,1,0]), 2, 'bar'), (3, 'pad', [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0], 8, 'bar'),
        (4, 'hey', [1,0,1,0, 1,0,0,1, 0,0,1,0, 1,0,0,0], 2, 'bar')],
}
SECTIONS = [('jazz', 4), ('rock', 3)]
# harmony per bar: jazz ii-V-I in F, rock E-E-G-A
JAZZ = [dict(root=43, chord=[55, 58, 62, 65], walk=[43, 46, 50, 53]), dict(root=36, chord=[52, 55, 58, 62], walk=[36, 40, 43, 46]),
        dict(root=41, chord=[57, 60, 64, 67], walk=[41, 45, 48, 52]), dict(root=41, chord=[57, 60, 64, 69], walk=[41, 40, 38, 36])]
ROCK = [40, 40, 43, 45]
SCAT = ['doo', 'bah', 'doo', 'bee', 'bah']
bars, hits, t = [], [], 0.0
for genre, n in SECTIONS:
    for j in range(n):
        bars.append(dict(t=round(t, 4), genre=genre, first=j == 0))
        for (pl, part, pat, ln, mark) in PARTS[genre]:
            for i, on in enumerate(pat):
                if not on: continue
                tt = t + i * STEP + (STEP * .33 if genre == 'jazz' and i % 4 == 2 else 0)   # swing the off-beat 8ths in jazz
                hits.append(dict(genre=genre, player=pl, part=part, t=round(tt, 4), step=i, bar=len(bars) - 1, j=j, len=ln))
        t += BAR
END = t + 1.5
json.dump(dict(bpm=BPM, step=STEP, bar=BAR, end=END, bars=bars, hits=hits,
               parts={g: [[pl, part, pat, ln, mark] for (pl, part, pat, ln, mark) in P] for g, P in PARTS.items()}), open(f'{OUT}/clip_score.json', 'w'), ensure_ascii=False)

# ---------------------------------------------------------------- instruments
rng = np.random.default_rng(3)
out = np.zeros(int((END + 1) * SR))
def add(sig, t0, g=1.0):
    i = int(t0 * SR); n = min(len(sig), len(out) - i); out[i:i + n] += g * sig[:n]
def tt(d): return np.arange(int(d * SR)) / SR
def bp(x, lo, hi, order=2): b, a = butter(order, [lo / (SR / 2), hi / (SR / 2)], 'band'); return lfilter(b, a, x)
def lp(x, f, order=2): b, a = butter(order, f / (SR / 2)); return lfilter(b, a, x)
def hp(x, f, order=2): b, a = butter(order, f / (SR / 2), 'high'); return lfilter(b, a, x)
def kick(big=1.0):
    x = tt(.5); f = 45 + 110 * np.exp(-x / .04); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x / (.18 * big)) + .3 * np.exp(-x / .003) * rng.standard_normal(len(x)))
def snare(): x = tt(.3); return .6 * bp(rng.standard_normal(len(x)), 1500, 7000) * np.exp(-x / .08) + .5 * np.sin(2 * np.pi * 190 * x) * np.exp(-x / .05)
def hat(): x = tt(.08); return .5 * hp(rng.standard_normal(len(x)), 7000) * np.exp(-x / .02)
def ride():
    x = tt(1.0); s = sum(np.sin(2 * np.pi * f * x) for f in [3170, 4215, 5340, 6120, 7600]) / 5
    return .25 * (s + .5 * hp(rng.standard_normal(len(x)), 6000)) * np.exp(-x / .35)
def brush(): x = tt(.25); return .35 * bp(rng.standard_normal(len(x)), 800, 5000) * np.minimum(1, x / .02) * np.exp(-x / .09)
def pluck_bass(n, d=.45):
    x = tt(d); f = mid(n); w = np.sin(2 * np.pi * f * x) + .5 * np.sin(4 * np.pi * f * x) + .2 * np.sin(6 * np.pi * f * x)
    return w * np.minimum(1, x / .004) * np.exp(-x / .25)
def piano(notes, d=.6):
    x = tt(d); s = 0
    for n in notes:
        f = mid(n); s = s + sum((.6 ** k) * np.sin(2 * np.pi * f * (k + 1) * x) * np.exp(-x * (2 + 2 * k)) for k in range(5))
    return s / len(notes) * np.minimum(1, x / .003)
def gtr_comp(notes, d=.18):
    x = tt(d); s = sum(np.sin(2 * np.pi * mid(n) * x) + .3 * np.sin(4 * np.pi * mid(n) * x) for n in notes)
    return lp(s / len(notes), 2500) * np.exp(-x / .07)
def brass(notes, d=.4):
    x = tt(d); s = 0
    for n in notes:
        f = mid(n) * (1 + .004 * np.sin(2 * np.pi * 5.5 * x))
        ph = np.cumsum(f) / SR; s = s + (2 * (ph % 1) - 1)                        # sawtooth
    env = np.minimum(1, x / .03) * np.exp(-np.maximum(0, x - .25) / .06)
    bright = np.convolve(s / len(notes), np.ones(3) / 3, 'same')
    return lp(bright, 1800) * env * 1.4
def power(n, d=.22):
    x = tt(d); s = sum(np.sin(2 * np.pi * mid(m) * x) + .5 * np.sin(4 * np.pi * mid(m) * x) for m in (n, n + 7, n + 12))
    return lp(np.tanh(4 * s), 3500) * np.exp(-x / .2) * .5
def pad(notes, d=4.0):
    x = tt(d); s = sum(np.sin(2 * np.pi * mid(n) * x + k) for k, n in enumerate(notes)) / len(notes)
    return s * np.minimum(1, x / .4) * np.exp(-np.maximum(0, x - 3.2) / .3)
# formant voice: a buzzing source (like vocal folds) through three resonances that make the vowel
VOWEL = dict(oo=(300, 870, 2240), ah=(730, 1090, 2440), ee=(270, 2290, 3010), eh=(530, 1840, 2480))
def voice(f0, vowel, d=.35, cons=None, breath=0.0):
    x = tt(d); f = f0 * (1 + .012 * np.sin(2 * np.pi * 5.2 * x) * np.minimum(1, x / .15))
    ph = np.cumsum(f) / SR; src = (2 * (ph % 1) - 1) - .3 * np.sin(2 * np.pi * ph)
    src = src + breath * rng.standard_normal(len(x))
    F = VOWEL[vowel]; y = sum(bp(src, fc * .88, fc * 1.12) * g for fc, g in zip(F, (1, .6, .3)))
    env = np.minimum(1, x / .03) * np.exp(-np.maximum(0, x - d * .6) / .06)
    if cons in ('d', 'b'):   # a stop: a short burst before the vowel
        y[:int(.012 * SR)] *= .2; y[:int(.006 * SR)] += .3 * rng.standard_normal(int(.006 * SR))
    if cons == 'h':          # breath first
        n = int(.05 * SR); y = np.concatenate([.5 * bp(rng.standard_normal(n), 1000, 4000), y]); env = np.concatenate([np.linspace(.2, 1, n), env])
    return y * env * 2.2
SYL = dict(doo=('d', 'oo'), bah=('b', 'ah'), bee=('b', 'ee'), hey=('h', 'eh'))
# ---------------------------------------------------------------- render the hits
for h in hits:
    b = bars[h['bar']]; j = h['j']; p = h['part']; t0 = h['t']
    if b['genre'] == 'jazz':
        H = JAZZ[j]
        if p == 'ride': add(ride(), t0, .6)
        elif p == 'brush': add(brush(), t0, .8)
        elif p == 'walk': add(pluck_bass(H['walk'][h['step'] // 4]), t0, .9)
        elif p == 'comp': add(gtr_comp(H['chord'][:3]), t0, .35)
        elif p == 'piano': add(piano([n + 12 for n in H['chord']], .5), t0, .45)
        elif p == 'horns': add(brass([n + 12 for n in H['chord'][1:]], .38), t0, .22)
        elif p == 'scat':
            k = sum(1 for q in hits if q['part'] == 'scat' and q['t'] < t0) % len(SCAT); c, v = SYL[SCAT[k]]
            add(voice(mid(H['chord'][(k + 2) % 4] + 12), v, .3, c), t0, .5)
    else:
        n = ROCK[j]
        if p == 'kick': add(kick(1.2), t0, 1.0)
        elif p == 'snare': add(snare(), t0, .85)
        elif p == 'hats': add(hat(), t0, .45)
        elif p == 'bass8': add(pluck_bass(n - 12, .22), t0, .8)
        elif p == 'power': add(power(n), t0, .45)
        elif p == 'pad': add(pad([n + 12, n + 19, n + 24]), t0, .12)
        elif p == 'hey': add(voice(mid(n + 24 + (3 if h['step'] in (7, 10) else 0)), 'eh', .28, 'h', .05), t0, .55)
# a kick into the switch, and a crash on it
t_sw = bars[4]['t']
x = tt(2.0); crash = .35 * hp(rng.standard_normal(len(x)), 4000) * np.exp(-x / .6); add(crash, t_sw); add(kick(1.4), t_sw, .8)
out /= np.max(np.abs(out)) / .89
pcm = (np.stack([out, out], 1) * 32767).astype(np.int16)
with wave.open(f'{OUT}/clip_audio.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('end', END, 'hits', len(hits))
