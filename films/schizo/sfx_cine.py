"""Sound for the cinematic opening of 《身体里住着两个人》, synthesized in code: rain on a window, a fluorescent hum,
the finger squeak on fogged glass, the cabinet hinge, the warm lamp switch, the door slam + crack, a creak,
the burst of glass and its falling tinkle, a low riser into the title, and the spotlight clunk. Writes public/sfx_cine.wav."""
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 44100; LEN = 24.9
out = np.zeros((int(SR * LEN), 2))
rng = np.random.default_rng(11)
SPLIT, WARM, SLAM, CREAK, TITLE, STAGE = 4.6, 8.473, 12.55, 14.6, 16.613, 20.683
def at(t): return int(t * SR)
def add(t, sig, g=1.0, pan=0.0):
    i = at(t); j = min(len(out), i + len(sig)); s = sig[: j - i] * g
    out[i:j, 0] += s * np.sqrt(0.5 * (1 - pan)); out[i:j, 1] += s * np.sqrt(0.5 * (1 + pan))
def bp(x, lo, hi, o=4): return sosfilt(butter(o, [lo, hi], btype='band', fs=SR, output='sos'), x)
def lp(x, f, o=4): return sosfilt(butter(o, f, btype='low', fs=SR, output='sos'), x)
def hp(x, f, o=4): return sosfilt(butter(o, f, btype='high', fs=SR, output='sos'), x)
def tt(d): return np.arange(int(d * SR)) / SR

# rain on the window (right side), until the stage
d = STAGE; n = int(d * SR); r = lp(hp(rng.standard_normal(n), 400), 5000) * 0.05
drops = np.zeros(n)
for k in rng.integers(0, n - 2000, 900): m = 600; drops[k:k + m] += bp(rng.standard_normal(m), 2500, 9000) * np.exp(-np.arange(m) / SR * 400) * rng.uniform(0.1, 0.5)
amb = r + drops * 0.25; fade = np.ones(n); fade[: at(1.0)] = np.linspace(0, 1, at(1.0)); fade[at(TITLE):] *= np.linspace(1, 0.35, n - at(TITLE)); fade[-at(0.3):] *= np.linspace(1, 0, at(0.3))
add(0, amb * fade, 1.0, 0.5)
# fluorescent hum (100 Hz + harmonics), dies at the burst; flickers
x = tt(TITLE); hum = sum(np.sin(2 * np.pi * 100 * k * x) / k for k in (1, 2, 3, 5)) * 0.012
hum *= np.where(((x > 2.3) & (x < 2.5)) | ((x > 10.1) & (x < 10.18)), 0.3, 1.0); hum[: at(0.8)] *= np.linspace(0, 1, at(0.8)); add(0, hum, 1.0)
# finger squeaks writing 精 and 分
for t0, t1 in ((0.55, 1.6), (1.7, 2.55)):
    t = t0
    while t < t1:
        dd = rng.uniform(0.08, 0.2); y = tt(dd); f = rng.uniform(900, 1500)
        s = np.sin(2 * np.pi * (f + 200 * np.sin(2 * np.pi * 7 * y)) * y) * np.sin(np.pi * y / dd) ** 2 + bp(rng.standard_normal(len(y)), 2000, 6000) * 0.3
        add(t, s, 0.025); t += dd + rng.uniform(0.03, 0.12)
# hinge creak as the doors open
y = tt(3.0); f = 180 + 60 * np.sin(2 * np.pi * 0.7 * y); ph = np.cumsum(2 * np.pi * f / SR)
cr = np.sign(np.sin(ph)) * (0.5 + 0.5 * np.sin(2 * np.pi * 13 * y)) ; cr = bp(cr, 300, 2400) * np.sin(np.pi * y / 3.0) ** 2
add(SPLIT, cr, 0.025)
# lamp switch + warm hum
y = tt(0.05); add(WARM, bp(rng.standard_normal(len(y)), 1500, 7000) * np.exp(-y * 120), 0.35, -0.6)
y = tt(SLAM - WARM); add(WARM, np.sin(2 * np.pi * 60 * y) * 0.006 * (1 - np.exp(-y * 4)), 1.0, -0.6)
# slam: wooden thud + glass crack
y = tt(0.5); th = np.sin(2 * np.pi * 70 * y * (1 - 0.4 * y)) * np.exp(-y * 16) + bp(rng.standard_normal(len(y)), 200, 1800) * np.exp(-y * 40) * 0.6
add(SLAM, th, 0.9)
def crack(t, g, d=0.35):
    y = tt(d); s = np.zeros(len(y))
    for k in range(30):
        i = int(rng.uniform(0, 0.6) * len(y) * (k / 30)); m = 300; s[i:i + m] += hp(rng.standard_normal(m), 3000) * np.exp(-np.arange(m) / SR * 600) * rng.uniform(0.3, 1)
    add(t, s, g)
crack(SLAM + 0.01, 0.55)
# creak of the cracked glass
crack(CREAK, 0.22, 0.6); crack(16.25, 0.25, 0.35)
# riser into the title: low swelling noise + sub
y = tt(1.6); rs = lp(rng.standard_normal(len(y)), 600) * (y / 1.6) ** 3 * 0.25 + np.sin(2 * np.pi * 38 * y) * (y / 1.6) ** 2 * 0.3
add(TITLE - 1.6, rs, 0.8)
# burst: impact + glass explosion + long tinkle
y = tt(1.2); boom = np.sin(2 * np.pi * 45 * y * (1 - 0.3 * y)) * np.exp(-y * 4) * 1.0 + lp(rng.standard_normal(len(y)), 900) * np.exp(-y * 9) * 0.8
add(TITLE, boom, 0.9)
y = tt(1.5); gl = hp(rng.standard_normal(len(y)), 2500) * np.exp(-y * 5) * 0.8; add(TITLE, gl, 0.6, -0.2); add(TITLE + 0.01, gl[::-1][::-1], 0.5, 0.2)
for k in range(140):
    t = TITLE + 0.05 + rng.exponential(0.9); f = rng.uniform(2500, 9000); y = tt(0.25)
    s = np.sin(2 * np.pi * f * y) * np.exp(-y * rng.uniform(25, 60)) + np.sin(2 * np.pi * f * 1.51 * y) * np.exp(-y * 70) * 0.5
    if t < STAGE - 0.4: add(t, s, rng.uniform(0.01, 0.05) * np.exp(-(t - TITLE) * 0.5), rng.uniform(-0.8, 0.8))
# a low drone under the title, cut as we go through
y = tt(STAGE - TITLE); dr = (np.sin(2 * np.pi * 55 * y) + 0.5 * np.sin(2 * np.pi * 82.5 * y)) * 0.05 * np.minimum(1, y / 0.8) * np.clip((STAGE - TITLE - y) / 0.3, 0, 1)
add(TITLE, dr, 1.0)
# whoosh through the title
y = tt(0.7); w = np.zeros(len(y)); xx = rng.standard_normal(len(y))
for k in range(8): a, b = k * len(y) // 8, (k + 1) * len(y) // 8; f = 300 + 2500 * k / 8; w[a:b] = bp(xx, f, f * 1.8)[a:b]
add(19.95, w * np.sin(np.pi * y / 0.7) ** 2, 0.3)
# spotlight: heavy clunk + hum of the lamp, room tone of an empty hall
y = tt(0.6); cl = np.sin(2 * np.pi * 90 * y) * np.exp(-y * 20) + bp(rng.standard_normal(len(y)), 400, 3000) * np.exp(-y * 50) * 0.8 + bp(rng.standard_normal(len(y)), 3000, 8000) * np.exp(-y * 90) * 0.3
add(STAGE, cl, 0.8)
y = tt(LEN - STAGE); add(STAGE, (np.sin(2 * np.pi * 120 * y) * 0.004 + lp(rng.standard_normal(len(y)), 300) * 0.02) * np.minimum(1, y / 0.3), 1.0)
pk = np.abs(out).max(); out = out / max(pk, 1e-9) * 0.9
wavfile.write('public/sfx_cine.wav', SR, (out * 32767).astype(np.int16))
print('ok', pk)
