"""Sound for 《哪个才是真的你》, synthesized in code: bathroom hum, light switch, phone shutters, a mirror shimmer,
stamps, the darkroom flashbulb, paper slides and card flips, ticks for callouts, whooshes, a projector rattle,
slider ticks, a toggle and the end chime. Writes public/sfx.wav."""
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 44100; LEN = 145.0
out = np.zeros((int(SR * LEN), 2))
rng = np.random.default_rng(7)
def at(t): return int(t * SR)
def add(t, sig, g=1.0, pan=0.0):
    i = at(t); j = min(len(out), i + len(sig)); s = sig[: j - i] * g
    out[i:j, 0] += s * np.sqrt(0.5 * (1 - pan)); out[i:j, 1] += s * np.sqrt(0.5 * (1 + pan))
def bp(x, lo, hi, o=4): return sosfilt(butter(o, [lo, hi], btype='band', fs=SR, output='sos'), x)
def lp(x, f, o=4): return sosfilt(butter(o, f, btype='low', fs=SR, output='sos'), x)
def hp(x, f, o=4): return sosfilt(butter(o, f, btype='high', fs=SR, output='sos'), x)
def tt(d): return np.arange(int(d * SR)) / SR
def env(d, a=0.003, r=None):
    x = tt(d); e = np.minimum(1, x / a); return e * np.exp(-x / (r or d / 4))
def noise(d): return rng.standard_normal(int(d * SR))

def click(t, g=0.3, f=3000):            # light switch / UI tick
    s = bp(noise(0.03), f * 0.5, min(f * 2, 18000)) * env(0.03, 0.0005, 0.004); add(t, s, g)
def shutter(t, g=0.5):                  # phone shutter: two clicks and a short air burst
    for dt, gg in ((0, 1), (0.07, 0.7)): add(t + dt, bp(noise(0.05), 1500, 9000) * env(0.05, 0.0005, 0.008), g * gg)
    add(t, bp(noise(0.12), 600, 4000) * env(0.12, 0.002, 0.03), g * 0.3)
def whoosh(t, d=0.6, g=0.25, lo=300, hi=3000, pan=0.0):
    x = tt(d); n = noise(d); s = bp(n, lo, hi) * np.sin(np.pi * x / d) ** 2; add(t, s, g, pan)
def thud(t, g=0.6, f=70):
    x = tt(0.5); s = np.sin(2 * np.pi * f * x * (1 - 0.3 * x)) * np.exp(-x * 9) + lp(noise(0.5), 300) * np.exp(-x * 30) * 0.5; add(t, s, g)
def bell(t, f0, g, d=2.5, pan=0.0):
    x = tt(d); s = sum(np.sin(2 * np.pi * f0 * m * x) * np.exp(-x * (2 + m)) / m for m in (1, 2.01, 3.03, 4.2)); s *= np.minimum(1, x / 0.002); add(t, s, g, pan)
def shimmer(t, g=0.12, d=1.6):
    for i, f in enumerate((1568, 1975, 2349, 2637, 3136)): bell(t + i * 0.05, f, g * 0.5, d, pan=(i - 2) * 0.25)
def paper(t, g=0.2, d=0.35):
    x = tt(d); s = hp(noise(d), 1500) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 23 * x))) * np.sin(np.pi * x / d); add(t, s, g)
def riser(t0, t1, g=0.12):
    d = t1 - t0; x = tt(d); f = 200 + 1600 * (x / d) ** 2; ph = np.cumsum(2 * np.pi * f / SR)
    s = (bp(noise(d), 500, 6000) * 0.6 + np.sin(ph) * 0.3) * (x / d) ** 2; add(t0, s, g)
def hum(t0, t1, g=0.012, f=100):
    d = t1 - t0; x = tt(d); s = sum(np.sin(2 * np.pi * f * k * x) / k for k in (1, 2, 3, 5)); e = np.minimum(1, np.minimum(x / 0.5, (d - x) / 0.5)); add(t0, s * e, g)
def room(t0, t1, g=0.02):
    d = t1 - t0; x = tt(d); s = lp(noise(d), 500); e = np.minimum(1, np.minimum(x / 0.8, (d - x) / 0.8)); add(t0, s * e, g)
def beep(t, f=1000, d=0.12, g=0.08):
    x = tt(d); add(t, np.sin(2 * np.pi * f * x) * np.minimum(1, np.minimum(x / 0.005, (d - x) / 0.005)), g)

# bathroom: hum + room tone where the bathroom is on screen
for a, b in ((0.33, 16.4), (49.4, 74.3), (86.0, 89.8), (105.2, 128.0), (128.2, 138.7)):
    hum(a, b, 0.008); room(a, b, 0.03)
click(0.33, 0.5); click(0.45, 0.2)
shutter(4.404, 0.6); whoosh(4.55, 0.45, 0.12, 800, 5000)
whoosh(6.5, 1.0, 0.14, 200, 1500, -0.3)
shimmer(8.473, 0.14)
thud(12.54, 0.35, 90); click(12.54, 0.2, 1800); thud(12.62, 0.3, 80)
riser(14.6, 16.55, 0.10); thud(16.613, 0.7, 55); shimmer(16.65, 0.10, 2.5)
# darkroom
hum(20.7, 49.1, 0.006, 60); room(20.7, 49.1, 0.025)
bell(20.9, 220, 0.05, 3.0)
add(24.65, bp(noise(0.06), 1000, 12000) * env(0.06, 0.0005, 0.01), 0.6); x = tt(0.8); add(24.66, np.sin(2 * np.pi * (3000 - 1500 * x) * x) * np.exp(-x * 5), 0.03)
paper(27.6, 0.25); paper(27.85, 0.25)
whoosh(30.6, 0.7, 0.18, 400, 4000, 0.4); click(31.25, 0.15, 2500)
bell(36.9, 880, 0.10); whoosh(39.5, 0.5, 0.1, 400, 3000, -0.6); bell(42.1, 660, 0.10)
whoosh(44.7, 1.2, 0.08, 150, 900)
# mirror (break)
click(49.4, 0.45)
x = tt(1.6); add(52.3, bp(noise(1.6), 300, 3000) * (x / 1.6) ** 3, 0.12)
for t in (56.5, 57.4, 58.3): click(t, 0.25, 2200)
whoosh(60.1, 0.8, 0.2, 300, 3500)
bell(63.0, 523, 0.07, 3.0); bell(63.0, 784, 0.05, 3.0)
# build: preview, shutter, distance
click(66.4, 0.2, 2000); shutter(69.2, 0.55); beep(69.95, 330, 0.18, 0.05); beep(70.13, 311, 0.25, 0.05)
whoosh(72.1, 1.4, 0.12, 120, 800)
whoosh(74.6, 2.0, 0.12, 300, 2500)
for k in range(9): click(74.7 + k * 0.21, 0.07, 3500)   # the distance counter ticking down (its own clock)
for t in (77.6, 77.75, 77.9): click(t, 0.18, 2600)
riser(80.6, 82.2, 0.08)
thud(82.239, 0.75, 50); shimmer(82.3, 0.08, 2.0)
whoosh(86.0, 2.4, 0.1, 200, 1500)
thud(89.95, 0.5, 60)
beep(91.65, 1400, 0.08, 0.06); click(94.6, 0.35, 1500); x = tt(0.5); add(94.62, np.sin(2 * np.pi * np.cumsum(180 * (1 - x)) / SR) * np.exp(-x * 4), 0.05)
d = 6.0; x = tt(d); s = bp(noise(d), 800, 5000) * (0.4 + 0.6 * (np.sin(2 * np.pi * 24 * x) > 0.6)); s *= np.minimum(1, np.minimum(x / 0.4, (d - x) / 0.4)); add(95.4, s, 0.05)
thud(98.0, 0.45, 70)
whoosh(101.5, 1.3, 0.14, 200, 2000)
# beauty
for t in (108.8, 109.3, 109.8): click(t, 0.2, 2400)
bell(111.8, 988, 0.10)
shimmer(115.2, 0.12, 2.2)
for t in (118.5, 121.6, 124.5): whoosh(t, 0.45, 0.12, 500, 4000)
click(125.6, 0.4, 1800); click(125.68, 0.2, 2600)
for t in (128.4, 129.6): click(t, 0.15, 2000)
shutter(131.9, 0.4)
x = tt(4.0); add(134.4, (np.sin(2 * np.pi * 261.6 * x) + 0.6 * np.sin(2 * np.pi * 392 * x) + 0.4 * np.sin(2 * np.pi * 523.2 * x)) * np.sin(np.pi * x / 4.0) ** 2, 0.03)
bell(138.8, 784, 0.12, 4.0); bell(138.85, 1175, 0.07, 4.0)

out = np.tanh(out * 1.2) * 0.9
wavfile.write('public/sfx.wav', SR, (out * 32767).astype(np.int16))
print('ok', out.shape, np.abs(out).max())
