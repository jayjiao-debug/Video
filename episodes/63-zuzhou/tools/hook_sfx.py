"""Synthesised sound bed for the 13.5 s hook (previs placeholder, no samples, no melody):
desert wind, a sub hit on the cut, clock ticks, electrical hum + clunks, rain + thunder, stone crack, deep boom + shimmer.
usage: python3 hook_sfx.py <out.wav> <cuts as comma list>"""
import sys, wave, numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
out, cuts = sys.argv[1], [float(x) for x in sys.argv[2].split(",")]   # H2, H3, H4, H5, H6a, H6b starts, end
c2, c3, c4, c5, c6a, c6b, end = cuts
N = int(end * SR) + SR // 2
rng = np.random.default_rng(63)
mix = np.zeros(N)

def band(x, lo=None, hi=None, order=4):
    if lo and hi: sos = butter(order, [lo, hi], "bandpass", fs=SR, output="sos")
    elif lo: sos = butter(order, lo, "highpass", fs=SR, output="sos")
    else: sos = butter(order, hi, "lowpass", fs=SR, output="sos")
    return sosfilt(sos, x)

def at(t0, sig, gain=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig)); mix[i:j] += sig[: j - i] * gain

def env(n, a, r):   # attack/release in samples, flat between
    e = np.ones(n); a = max(1, min(a, n)); r = max(1, min(r, n))
    e[:a] = np.linspace(0, 1, a); e[-r:] *= np.linspace(1, 0, r); return e

def secs(s): return int(s * SR)

# H1: desert wind, slow gusts
n = secs(c2); w = band(rng.standard_normal(n), 150, 900, 2)
gust = 0.55 + 0.45 * np.sin(np.linspace(0, 2.2 * np.pi, n) - 1.2)
at(0, w * gust * env(n, secs(0.3), secs(0.15)), 0.10)
# cut to the hotel: sub hit + tick tock
t = np.arange(secs(1.6)) / SR
at(c2, np.sin(2 * np.pi * (52 - 14 * t) * t) * np.exp(-t * 3.2), 0.55)
for k in range(2):
    tk = band(rng.standard_normal(secs(0.03)), 2500, 7000) * np.exp(-np.arange(secs(0.03)) / SR * 160)
    at(c2 + 0.55 + k * 0.7, tk, 0.35)
# H3: hum rising, then clunks as the windows go
n = secs(c4 - c3); t = np.arange(n) / SR
hum = (np.sin(2 * np.pi * 100 * t) + 0.5 * np.sin(2 * np.pi * 200 * t) + 0.25 * np.sin(2 * np.pi * 300 * t)) * np.linspace(0.2, 1.0, n)
at(c3, hum * env(n, secs(0.2), secs(0.05)), 0.07)
for k, dt in enumerate([0.35, 0.8, 1.2, 1.55, 1.85, 2.1]):
    m = secs(0.12); tt = np.arange(m) / SR
    cl = (np.sin(2 * np.pi * 70 * tt) * 0.8 + band(rng.standard_normal(m), 300, 2000) * 0.5) * np.exp(-tt * 40)
    at(c3 + dt, cl, 0.45 * (1 - k * 0.08))
# H4 + H5: rain bed, thunder crack on the cut to the manor
n = secs(c6a - c4 + 0.2)
rain = band(rng.standard_normal(n), 1200, 9000, 2) + 0.4 * band(rng.standard_normal(n), 200, 1200, 2)
at(c4, rain * env(n, secs(0.02), secs(0.25)), 0.09)
m = secs(2.2); tt = np.arange(m) / SR
crack = band(rng.standard_normal(m), 40, 600, 2) * (np.exp(-tt * 2.2) + 1.6 * np.exp(-tt * 18))
at(c4 - 0.02, crack, 0.55)
# H6a: low drone + a stone crack
n = secs(c6b - c6a); t = np.arange(n) / SR
at(c6a, (np.sin(2 * np.pi * 41 * t) + 0.3 * np.sin(2 * np.pi * 61.5 * t)) * env(n, secs(0.15), secs(0.02)), 0.18)
m = secs(0.25); tt = np.arange(m) / SR
at(c6a + 0.62, band(rng.standard_normal(m), 900, 6000) * np.exp(-tt * 25), 0.35)
# H6b: deep boom + shimmer, then fade to nothing
m = secs(end - c6b + 0.4); tt = np.arange(m) / SR
boom = np.sin(2 * np.pi * (75 * np.exp(-tt * 1.5) + 32) * tt) * np.exp(-tt * 1.1)
at(c6b, boom + band(rng.standard_normal(m), 30, 250, 2) * np.exp(-tt * 4) * 0.6, 0.75)
sh = sum(np.sin(2 * np.pi * f * tt + p) for f, p in [(1318.5, 0), (1975.5, 1), (2637, 2), (3951, 3)]) / 4
at(c6b + 0.05, sh * (1 - np.exp(-tt * 6)) * np.exp(-tt * 1.4) * (0.7 + 0.3 * np.sin(2 * np.pi * 7 * tt)), 0.06)

fade = secs(0.6); mix[secs(end) - fade: secs(end)] *= np.linspace(1, 0, fade); mix[secs(end):] = 0
mix = mix / max(1e-9, np.abs(mix).max()) * 0.7
st = np.repeat((mix * 32767).astype(np.int16)[:, None], 2, axis=1)
with wave.open(out, "wb") as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(st.tobytes())
print("sfx", out, round(len(mix) / SR, 2), "s")
