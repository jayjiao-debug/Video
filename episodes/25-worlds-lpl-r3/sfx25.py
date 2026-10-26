# ep25 sound: s130f untouched; intro slams (variant C, same timings as ep24 dum.py), soft whoosh on each Manim scene
# change, a boom on the drop, a soft thump on the end card. SFX bus clip-guarded (ep23 mix17).
import numpy as np, soundfile as sf, sys
from scipy.ndimage import minimum_filter1d, uniform_filter1d
SR = 44100; B = lambda n: 0.383 + 2.0248 * n; BEAT = 0.5062
rng = np.random.default_rng(25)
mus, _ = sf.read('../ep23/film/s130f.wav'); L = len(mus)
def bp(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
def sweep(n, f0, f1, tau): t = np.arange(n) / SR; f = f1 + (f0 - f1) * np.exp(-t / tau); return np.sin(2 * np.pi * np.cumsum(f) / SR)
def pad(x, n): return np.pad(x, (0, max(0, n - len(x))))[:n]
def paper(g=1.0): n = int(SR * .09); return bp(rng.standard_normal(n), 900, 6500) * env(n, .0008, .012) * .5 * g
def boom(g=1.0):
    n = int(SR * 1.6); x = sweep(n, 110, 40, .06) * env(n, .003, .45) + sweep(n, 400, 92.5, .015) * env(n, .001, .05) * .4
    return (x + bp(rng.standard_normal(n), 80, 900) * env(n, .02, .35) * .12 + pad(paper(.7), n)) * g
def suck(d): n = int(SR * d); t = np.arange(n) / SR; x = bp(rng.standard_normal(n), 250, 5000) * (t / d) ** 3; return x / np.abs(x).max() * .22
def rumble(d):
    n = int(SR * d); t = np.arange(n) / SR; e = np.minimum(1, t / .15) * np.exp(-t / 1.4)
    return (np.sin(2 * np.pi * 46.25 * t) * .6 + bp(rng.standard_normal(n), 30, 160) * .8) * e * .35
def whoosh(d=.7):
    n = int(SR * d); t = np.arange(n) / SR; e = np.sin(np.pi * t / d) ** 2; x = bp(rng.standard_normal(n), 400, 2600) * e; return x / np.abs(x).max() * .09
def thump(g=1.0): n = int(SR * .35); return (sweep(n, 150, 70, .02) * env(n, .001, .07) * .6) * g
o = np.zeros((L, 2))
def add(x, t, pan=0.):
    i = int(t * SR); j = min(L, i + len(x))
    if i < 0 or i >= L: return
    o[i:j, 0] += x[:j - i] * (1 - max(0, pan)); o[i:j, 1] += x[:j - i] * (1 + min(0, pan))
for k, t in enumerate(HITS := [B(0) + b * BEAT for b in [0, 2, 4, 5, 6, 6.5, 7, 7.5]]): add(boom(.42 + .05 * k), t, pan=(-.35 if k % 2 else .35))
add(suck(.6), B(2) - .6); add(boom(1.05), B(2)); add(rumble(4.0), B(2)); add(boom(.7), B(8))
for bar in [10, 14, 16, 20, 22, 26, 32, 38, 44, 50, 54, 56]: add(whoosh(.7), B(bar) - .35, pan=.2)
add(boom(.75), B(40)); add(thump(.5), 125.4)
o *= .8; lim = 10 ** (-1.0 / 20); m = mus + o; gg = np.ones(L)
for c in range(2):
    kk = np.where((np.abs(m[:, c]) > lim) & (o[:, c] != 0))[0]; gg[kk] = np.minimum(gg[kk], np.clip((np.sign(m[kk, c]) * lim - mus[kk, c]) / o[kk, c], 0, 1))
gg = minimum_filter1d(gg, 441); gg = np.minimum(gg, uniform_filter1d(gg, 441))
sf.write('mix25.wav', (mus + o * gg[:, None]).astype(np.float32), SR, subtype='FLOAT'); print('ok')
