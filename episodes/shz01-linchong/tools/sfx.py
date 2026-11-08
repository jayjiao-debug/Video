"""Synthesised sound cues for the 林冲 film (storyboard_v3 §10, retimed in film/timing.md).
One quiet family, well under the music, except the door burst at 93.565.
usage: sfx.py <out.wav>   (48 kHz stereo, 148.5 s)"""
import sys
import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000
DUR = 148.5
N = int(SR * DUR)
out = np.zeros((N, 2), np.float32)
R = np.random.default_rng(11)


def db(x):
    return 10 ** (x / 20)


def noise(sec, seed=None):
    r = np.random.default_rng(seed) if seed is not None else R
    return r.standard_normal(int(round(sec * SR))).astype(np.float32)


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], 'bandpass', fs=SR, output='sos')
    return signal.sosfilt(sos, x).astype(np.float32)


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, 'lowpass', fs=SR, output='sos'), x).astype(np.float32)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, 'highpass', fs=SR, output='sos'), x).astype(np.float32)


def env(n, a, d, shape=4.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * shape / max(d, 1e-4))
    return e.astype(np.float32)


def norm(x):
    m = np.max(np.abs(x)) + 1e-9
    return x / m


def put(x, t, gain_db, pan=0.0):
    """Place mono or stereo x at time t (s) with peak gain_db dBFS and pan -1..1."""
    if x.ndim == 1:
        x = norm(x)
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        x = np.stack([x * l * 1.41, x * r * 1.41], -1)
    else:
        x = x / (np.max(np.abs(x)) + 1e-9)
    i = int(t * SR)
    j = min(N, i + len(x))
    if j > i:
        out[i:j] += x[: j - i] * db(gain_db)


def fade(x, fi, fo):
    n = len(x)
    e = np.ones(n, np.float32)
    a, b = int(fi * SR), int(fo * SR)
    if a: e[:a] = np.linspace(0, 1, a)
    if b: e[n - b:] *= np.linspace(1, 0, b)
    return (x.T * e).T if x.ndim == 2 else x * e


# ---- cue generators
def swish(sec=0.12, lo=2500, hi=9000):
    x = bp(noise(sec), lo, hi)
    n = len(x)
    e = np.sin(np.linspace(0, np.pi, n)) ** 2
    return x * e


def thump(f0=110, f1=45, sec=0.5, click=0.25):
    n = int(sec * SR)
    t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(np.linspace(f0, f1, n)) / SR
    x = np.sin(ph) * np.exp(-t * 9)
    x += lp(noise(sec), 1800) * np.exp(-t * 60) * click
    return x.astype(np.float32)


def clack(f=780, sec=0.18):
    n = int(sec * SR)
    t = np.arange(n) / SR
    x = (np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * f * 2.03 * t) + 0.3 * np.sin(2 * np.pi * f * 3.4 * t)) * np.exp(-t * 38)
    x += bp(noise(sec), 1500, 6000) * np.exp(-t * 120) * 0.8
    return x.astype(np.float32)


def rustle(sec=0.8, dens=40, lo=2000, hi=10000):
    n = int(sec * SR)
    x = np.zeros(n, np.float32)
    for _ in range(int(dens * sec)):
        i = R.integers(0, n - 2000)
        L = R.integers(300, 2000)
        x[i:i + L] += bp(noise(L / SR), lo, hi) * np.hanning(L) * R.uniform(0.3, 1)
    return x


def rip(sec=0.35):
    n = int(sec * SR)
    x = rustle(sec, 220, 900, 7000)
    e = np.concatenate([np.linspace(0, 1, n // 3), np.linspace(1, 0.2, n - n // 3)])
    return x * e


def whoosh(sec=0.4, f0=400, f1=2500):
    x = noise(sec)
    n = len(x)
    y = np.zeros(n, np.float32)
    blk = 2400
    for i in range(0, n, blk):
        k = i / n
        fc = f0 + (f1 - f0) * k
        y[i:i + blk] = bp(x[i:i + blk], fc * 0.6, min(fc * 1.6, 20000))
    return y * np.sin(np.linspace(0, np.pi, n))


def wind(sec, seed=5, lo=180, hi=900, gust_at=()):
    a = lp(noise(sec, seed), 1200)
    b = lp(noise(sec, seed + 1), 1200)
    t = np.arange(len(a)) / SR
    mod = 0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * t + 1.3) * np.sin(2 * np.pi * 0.047 * t)
    for g in gust_at:
        mod += 0.9 * np.exp(-((t - g) ** 2) / 0.6)
    L = bp(a, lo, hi) * mod
    Rr = bp(b, lo * 1.1, hi * 1.1) * mod
    return np.stack([L, Rr], -1)


def cicadas(sec, seed=8):
    t = np.arange(int(sec * SR)) / SR
    x = np.zeros_like(t)
    for k, (fc, am) in enumerate([(4300, 41), (4700, 37), (5200, 45)]):
        ph = R.uniform(0, 6)
        chirp = 0.5 + 0.5 * np.sin(2 * np.pi * (0.35 + 0.1 * k) * t + ph)
        x += np.sin(2 * np.pi * fc * t) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * am * t))) * chirp
    x = bp(x.astype(np.float32), 3000, 7000)
    return np.stack([x, np.roll(x, 900)], -1)


def fire(sec, seed=9):
    n = int(sec * SR)
    base = lp(noise(sec, seed), 400) * 0.6
    cr = np.zeros(n, np.float32)
    r = np.random.default_rng(seed)
    for _ in range(int(sec * 28)):
        i = r.integers(0, n - 800)
        L = r.integers(80, 700)
        cr[i:i + L] += bp(r.standard_normal(L).astype(np.float32), 1200, 6000) * np.exp(-np.arange(L) / (L / 4)) * r.uniform(0.2, 1)
    x = base + cr * 1.6
    y = base + np.roll(cr, 1700) * 1.6
    return np.stack([x, y], -1)


def water(sec, seed=12):
    t = np.arange(int(sec * SR)) / SR
    x = lp(noise(sec, seed), 700) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.27 * t) ** 2)
    y = lp(noise(sec, seed + 1), 700) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * t + 1) ** 2)
    return np.stack([x, y], -1)


def pour(sec=0.8):
    x = noise(sec)
    n = len(x)
    y = np.zeros(n, np.float32)
    blk = 1200
    for i in range(0, n, blk):
        fc = 1800 + 900 * np.sin(i / n * 9) + R.uniform(-300, 300)
        y[i:i + blk] = bp(x[i:i + blk], fc * 0.7, fc * 1.4)
    return y * np.hanning(n) ** 0.5


# ---- the cue list (times from film/timing.md)
put(swish(0.09, 3000, 9000), 0.30, -30, -0.2)                   # brush flick
put(thump(140, 60, 0.35, 0.6), 2.833, -27, -0.2)                # palm press (soft)
put(rustle(0.8), 4.50, -33, 0.1)                                 # paper rustle
put(rustle(0.5, 70), 8.673, -31, 0.0)                            # crumple
put(fade(cicadas(4.2), 0.8, 0.02), 14.45, -34)                   # cicadas, cut dead on 18.657
for tt in (18.657, 18.866, 19.075, 19.284, 19.493, 20.329):     # title brush whisks
    put(swish(0.16, 1500, 7000), tt - 0.02, -33)
put(thump(120, 55, 0.6, 0.5), 22.814, -24, 0.2)                 # seal
put(rip(0.3), 26.92, -27, -0.3)                                  # paper rip inside the hit
put(whoosh(0.35, 300, 2200), 26.80, -30, -0.2)                   # thrust
put(thump(90, 40, 0.5, 0.2), 30.314, -30)                        # ranks stamp
put(pour(0.8), 35.70, -34, 0.2)                                  # tea pour
put(pour(0.6), 55.30, -34, -0.1)                                 # wine pour
put(clack(760), 61.125, -24, 0.0)                                # cangue clack
put(fade(cicadas(2.6, 4), 0.6, 0.05), 64.40, -35)                # road cicadas, cut on 66.955
put(fade(wind(6.0, 5, 160, 700), 2.5, 0.0), 71.4, -36)          # wind bed rises with the first snow
put(fade(wind(4.4, 6, 160, 900, gust_at=(1.2,)), 0.6, 0.4), 77.4 - 4.0, -32)   # 沧州 snow
put(thump(70, 30, 1.2, 0.8) + 0.4 * lp(noise(1.2), 600) * env(int(1.2 * SR), 0.05, 0.9), 75.256, -27)  # roof collapse
put(fade(wind(2.5, 7, 120, 400), 0.2, 1.5), 77.6, -40)           # muffled wind inside
put(rustle(0.6, 60, 200, 1800), 77.95, -32)                      # stone scrape
put(thump(80, 40, 0.5, 0.6), 78.588, -27)                        # stone meets the door
put(fade(fire(12.25), 0.25, 0.01), 79.80, -22)                   # fire bed, cut with the music at 92.05
put(rustle(0.32, 60, 200, 1800), 93.25, -34)                     # stone scrape pre-lap
put(thump(65, 30, 1.0, 1.0), 93.565, -17)                        # door burst (the one loud cue)
put(fade(wind(7.0, 8, 200, 1400, gust_at=(0.4, 3.0)), 0.05, 1.2), 93.565, -24)  # blizzard
put(fade(water(25.0), 1.5, 2.5), 100.2, -30)                     # water lap
for tt in (134.21, 134.49, 134.77, 135.05, 135.33, 135.61):     # promise brush whisks
    put(swish(0.18, 1500, 6500), tt - 0.02, -34)
put(fade(whoosh(0.9, 300, 1500), 0.3, 0.4), 136.0, -33)          # release breath
put(thump(120, 55, 0.6, 0.5), 141.862, -23, 0.0)                 # J seal

sf.write(sys.argv[1], out, SR, subtype='FLOAT')
print('sfx ok', sys.argv[1], 'peak', float(np.max(np.abs(out))))
