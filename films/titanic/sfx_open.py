"""Sound for the 《一把钥匙》 opening proof, synthesized: harbour morning (water, gulls), a pen striking a name, the key set down,
the cold wind in the crow's nest, the long pull-back over a silent sea, the key sliding in and the lock turning on the title."""
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile
SR = 44100; LEN = 21.2
out = np.zeros((int(SR * LEN), 2)); rng = np.random.default_rng(3)
def tt(d): return np.arange(int(d * SR)) / SR
def add(t, sig, g=1.0, pan=0.0):
    i = int(t * SR); j = min(len(out), i + len(sig)); s = sig[: j - i] * g; out[i:j, 0] += s * np.sqrt(0.5 * (1 - pan)); out[i:j, 1] += s * np.sqrt(0.5 * (1 + pan))
def bp(x, lo, hi, o=4): return sosfilt(butter(o, [lo, hi], btype='band', fs=SR, output='sos'), x)
def lp(x, f, o=4): return sosfilt(butter(o, f, btype='low', fs=SR, output='sos'), x)
def hp(x, f, o=4): return sosfilt(butter(o, f, btype='high', fs=SR, output='sos'), x)
LOCK, PULL, INSERT, TITLE = 8.473, 12.54, 16.25, 16.613
# harbour: soft water lapping and distant gulls under the desk scene
y = tt(LOCK); wat = lp(rng.standard_normal(len(y)), 600) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.35 * y) ** 2) * 0.06; wat[: int(0.6 * SR)] *= np.linspace(0, 1, int(0.6 * SR)); wat[-int(0.15 * SR):] *= np.linspace(1, 0, int(0.15 * SR)); add(0, wat, 1.0, 0.4)
for t0 in (1.2, 3.1, 6.0):
    y = tt(0.5); f = 2200 + 500 * np.sin(2 * np.pi * 3 * y); ph = np.cumsum(2 * np.pi * f / SR); add(t0, np.sin(ph) * np.sin(np.pi * y / 0.5) ** 2 * 0.5, 0.02, -0.5)
# pen: the strike (one long scratch) and the new name written above
y = tt(1.3); add(1.0, bp(rng.standard_normal(len(y)), 2500, 8000) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * y)) * np.sin(np.pi * y / 1.3), 0.05)
t = 2.3
while t < 3.3:
    d = rng.uniform(0.05, 0.12); y = tt(d); add(t, bp(rng.standard_normal(len(y)), 3000, 8000) * np.sin(np.pi * y / d) ** 2, 0.04); t += d + rng.uniform(0.01, 0.04)
# the key: a bright brass clink as we arrive on it
y = tt(0.8); add(4.404, sum(np.sin(2 * np.pi * f * y) * np.exp(-y * k) for f, k in ((2350, 7), (3720, 9), (5910, 14))) * 0.3, 0.5)
# crow's nest: cold wind and a creak of rigging, then the pull-back over the sea: a long breath of air and a low drone
y = tt(INSERT - LOCK); wind = bp(rng.standard_normal(len(y)), 250, 1800) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.2 * y + 1)) * 0.07; wind[: int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR)); wind[-int(0.2 * SR):] *= np.linspace(1, 0, int(0.2 * SR)); add(LOCK, wind, 1.0)
y = tt(0.7); add(9.6, bp(np.sign(np.sin(2 * np.pi * 160 * y + 3 * np.sin(2 * np.pi * 7 * y))), 300, 1500) * np.sin(np.pi * y / 0.7) ** 2, 0.02, 0.4)
y = tt(INSERT - PULL); add(PULL, (np.sin(2 * np.pi * 49 * y) + 0.5 * np.sin(2 * np.pi * 73.5 * y)) * 0.05 * np.clip(y / 1.5, 0, 1) * np.clip((INSERT - PULL - y) / 0.2, 0, 1), 1.0)
y = tt(2.0); w = np.zeros(len(y)); xx = rng.standard_normal(len(y))
for k in range(8): a, b = k * len(y) // 8, (k + 1) * len(y) // 8; f = 250 + 2000 * k / 8; w[a:b] = bp(xx, f, f * 1.8)[a:b]
add(PULL + 0.4, w * np.sin(np.pi * y / 2.0) ** 2, 0.25)
# the key slides in (a metal scrape) and the lock turns on the title: click + a deep hit
y = tt(TITLE - INSERT); add(INSERT, bp(rng.standard_normal(len(y)), 1500, 6000) * np.linspace(0.3, 1, len(y)), 0.06)
y = tt(0.06); add(TITLE, (bp(rng.standard_normal(len(y)), 1500, 7000) + np.sin(2 * np.pi * 1800 * y)) * np.exp(-y * 90), 0.7)
y = tt(2.5); add(TITLE, np.sin(2 * np.pi * 40 * y * (1 - 0.2 * y)) * np.exp(-y * 2.2) * 0.9 + lp(rng.standard_normal(len(y)), 400) * np.exp(-y * 4) * 0.3, 0.8)
y = tt(4.0); add(TITLE + 0.2, (np.sin(2 * np.pi * 110 * y) + 0.6 * np.sin(2 * np.pi * 164.8 * y)) * 0.03 * np.minimum(1, y / 0.5) * np.clip((4 - y) / 0.6, 0, 1), 1.0)
pk = np.abs(out).max(); out = out / max(pk, 1e-9) * 0.9
wavfile.write('public/sfx_open.wav', SR, (out * 32767).astype(np.int16)); print('ok', pk)
