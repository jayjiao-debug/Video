"""Sound for the duel demo (synthesised placeholder): wind, a rising tension swell during the push,
a sub thump as we land in his eyes, then near-silence: faint wind, a heartbeat, a thin high ring.
usage: python3 duel_sfx.py out.wav push_start push_end end"""
import sys, wave, numpy as np
from scipy.signal import butter, sosfilt
SR = 48000
out, a, b, end = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4])
N = int(end * SR); rng = np.random.default_rng(7); mix = np.zeros(N); t = np.arange(N) / SR

def band(x, lo, hi): return sosfilt(butter(2, [lo, hi], "bandpass", fs=SR, output="sos"), x)
def at(t0, sig, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig)); mix[i:j] += sig[: j - i] * g

wind = band(rng.standard_normal(N), 180, 1100) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.35 * t + 1))
wind_env = np.where(t < b, 1.0, 0.35)                                   # the world goes quiet in his eyes
mix += wind * wind_env * 0.12
m = int((b - a) * SR); tt = np.arange(m) / SR; x = tt / (b - a)
sweep = np.sin(2 * np.pi * (70 * tt + 120 * tt ** 2 / (b - a)))         # rising tone
air = band(rng.standard_normal(m), 900, 6000)
at(a, (sweep * 0.6 + air * 0.5) * x ** 2.2, 0.45)
m = int(1.2 * SR); tt = np.arange(m) / SR
at(b, np.sin(2 * np.pi * (48 - 10 * tt) * tt) * np.exp(-tt * 4), 0.9)    # sub thump on arrival
def beat(t0):
    m = int(0.18 * SR); tt = np.arange(m) / SR; s = np.sin(2 * np.pi * 52 * tt) * np.exp(-tt * 28)
    at(t0, s, 0.55); at(t0 + 0.2, s, 0.38)
k = b + 0.25
while k < end - 0.3: beat(k); k += 0.82
m = N - int(b * SR); tt = np.arange(m) / SR
at(b, np.sin(2 * np.pi * 3520 * tt) * np.minimum(1, tt * 2) * 0.5, 0.012)  # a thin ring
fade = int(0.25 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
mix = mix / np.abs(mix).max() * 0.7
with wave.open(out, "wb") as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes(np.repeat((mix * 32767).astype(np.int16)[:, None], 2, axis=1).tobytes())
print("ok", out)
