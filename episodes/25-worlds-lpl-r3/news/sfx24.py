# SFX for ep24 《先别慌》, from the page's EVENTS (events.json). Music (s130f) untouched; SFX bus clip-guarded like ep23 mix17.
import numpy as np, soundfile as sf, json, sys
from scipy.ndimage import minimum_filter1d, uniform_filter1d
SR = 44100; B = lambda n: 0.383 + 2.0248 * n; BEAT = 0.5062
rng = np.random.default_rng(24)
mus, _ = sf.read('../../ep23/film/s130f.wav'); L = len(mus)
def bp(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
def sweep(n, f0, f1, tau): t = np.arange(n) / SR; f = f1 + (f0 - f1) * np.exp(-t / tau); return np.sin(2 * np.pi * np.cumsum(f) / SR)
def pad(x, n): return np.pad(x, (0, max(0, n - len(x))))[:n]
def paper(g=1.0): n = int(SR * .09); return bp(rng.standard_normal(n), 900, 6500) * env(n, .0008, .012) * .5 * g
def boom(g=1.0):   # variant C (the owner's default)
    n = int(SR * 1.6); x = sweep(n, 110, 40, .06) * env(n, .003, .45) + sweep(n, 400, 92.5, .015) * env(n, .001, .05) * .4
    tail = bp(rng.standard_normal(n), 80, 900) * env(n, .02, .35) * .12
    return (x + tail + pad(paper(.7), n)) * g
def thup(g=1.0):   # small paper landing on the desk
    n = int(SR * .35); x = sweep(n, 150, 70, .02) * env(n, .001, .07) * .6
    return (x + pad(paper(.9), n)) * g
def suck(d): n = int(SR * d); t = np.arange(n) / SR; x = bp(rng.standard_normal(n), 250, 5000) * (t / d) ** 3; return x / np.abs(x).max() * .22
def rumble(d):
    n = int(SR * d); t = np.arange(n) / SR; e = np.minimum(1, t / .15) * np.exp(-t / 1.4)
    return (np.sin(2 * np.pi * 46.25 * t) * .6 + bp(rng.standard_normal(n), 30, 160) * .8) * e * .35
def scratch(d, g=1.0):   # felt-tip pen on newsprint
    n = int(SR * d); t = np.arange(n) / SR
    am = np.abs(np.sin(2 * np.pi * (7 + 3 * rng.random()) * t + rng.random() * 6)) ** .6
    x = bp(rng.standard_normal(n), 1800, 7000) * am * np.minimum(1, t / .03) * np.minimum(1, (d - t) / .05)
    return x / (np.abs(x).max() + 1e-9) * .18 * g
def tick(): n = int(SR * .03); return bp(rng.standard_normal(n), 2500, 8000) * env(n, .0005, .004) * .25
def whoosh(d=.9):
    n = int(SR * d); t = np.arange(n) / SR; e = np.sin(np.pi * t / d) ** 2
    x = bp(rng.standard_normal(n), 300, 3000) * e; return x / np.abs(x).max() * .16
o = np.zeros((L, 2))
def add(x, t, pan=0.):
    i = int(t * SR); j = min(L, i + len(x))
    if i < 0 or i >= L: return
    o[i:j, 0] += x[:j - i] * (1 - max(0, pan)); o[i:j, 1] += x[:j - i] * (1 + min(0, pan))
E = json.load(open('events.json'))
BIG = B(2); HITS = [B(0) + b * BEAT for b in [0, 2, 4, 5, 6, 6.5, 7, 7.5]]
k = 0
for e in sorted(E, key=lambda e: e['t']):
    t = e['t']
    if e['kind'] == 'slam' and t < B(2) - .01:          # the 8 intro headlines (variant C, accelerating)
        add(boom(.42 + .05 * k), t, pan=(-.35 if k % 2 else .35)); k += 1
    elif e['kind'] == 'big' and abs(t - BIG) < .01:
        add(suck(.6), t - .6); add(boom(1.05), t); add(rumble(4.0), t)
    elif e['kind'] == 'big': add(boom(.6), t)
    elif e['kind'] == 'title': add(boom(.7), t)
    elif e['kind'] == 'slam': add(thup(.55), t, pan=float(rng.uniform(-.3, .3)))
    elif e['kind'] == 'pen': add(scratch(e.get('dur', .5)), t, pan=.15)
    elif e['kind'] == 'tick':
        for i in range(28): add(tick(), t + e['dur'] * (1 - (1 - i / 28) ** 2), pan=-.2)
for bar in [10, 14, 22, 26, 32, 36, 40, 44, 50, 54, 56]: add(whoosh(.9), B(bar) - .75)   # camera glides
add(thup(.6), 125.4)                                                             # end card
o *= .8; lim = 10 ** (-0.3 / 20); m = mus + o; gg = np.ones(L)
for c in range(2):
    kk = np.where((np.abs(m[:, c]) > lim) & (o[:, c] != 0))[0]; gg[kk] = np.minimum(gg[kk], np.clip((np.sign(m[kk, c]) * lim - mus[kk, c]) / o[kk, c], 0, 1))
gg = minimum_filter1d(gg, 441); gg = np.minimum(gg, uniform_filter1d(gg, 441))
sf.write('mix24.wav', (mus + o * gg[:, None]).astype(np.float32), SR, subtype='FLOAT'); print('min sfx gain', round(float(gg.min()), 2))
