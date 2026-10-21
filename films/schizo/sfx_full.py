"""Sound for the cinematic opening of 《身体里住着两个人》, synthesized in code: rain on a window, a fluorescent hum,
the finger squeak on fogged glass, the cabinet hinge, the warm lamp switch, the door slam + crack, a creak,
the burst of glass and its falling tinkle, a low riser into the title, and the spotlight clunk. Writes public/sfx_cine.wav."""
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 44100; LEN = 122.4
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
# spotlight: heavy clunk + hum of the lamp, room tone of an empty hall (opening block)
y = tt(0.6); cl = np.sin(2 * np.pi * 90 * y) * np.exp(-y * 20) + bp(rng.standard_normal(len(y)), 400, 3000) * np.exp(-y * 50) * 0.8 + bp(rng.standard_normal(len(y)), 3000, 8000) * np.exp(-y * 90) * 0.3
add(STAGE, cl, 0.8)
y = tt(40.87 - STAGE); add(STAGE, (np.sin(2 * np.pi * 120 * y) * 0.004 + lp(rng.standard_normal(len(y)), 300) * 0.02) * np.minimum(1, y / 0.3) * np.clip((40.87 - STAGE - y) / 0.2, 0, 1), 1.0)

# ======================================================================== the rest of the film
HALL0, BAND, RAD0, CA, CH, AC, WHY, DROP, PLT0, LIT, FLY, ONE, STR0, TURN, TUNE, FIN, HIT2, CODA, SUN, END = 40.87, 45.02, 52.53, 65.45, 69.51, 73.99, 78.33, 82.239, 86.44, 91.29, 92.5, 94.0, 95.28, 99.6, 101.57, 103.55, 105.64, 108.184, 111.745, 115.815
def clunk(t, g=0.6):
    y = tt(0.6); add(t, np.sin(2 * np.pi * 90 * y) * np.exp(-y * 20) + bp(rng.standard_normal(len(y)), 400, 3000) * np.exp(-y * 50) * 0.8, g)
def tone_room(t0, t1, f=300, g=0.02):
    y = tt(t1 - t0); n = len(y); e = np.minimum(1, y / 0.3) * np.clip((t1 - t0 - y) / 0.3, 0, 1); add(t0, lp(rng.standard_normal(n), f) * g * e, 1.0)
# programme: paper and pencil
y = tt(0.3); add(25.3, bp(rng.standard_normal(len(y)), 1500, 6000) * np.exp(-y * 12), 0.06)
t = 29.7
while t < 30.7:
    d = rng.uniform(0.06, 0.15); y = tt(d); add(t, bp(rng.standard_normal(len(y)), 2500, 7000) * np.sin(np.pi * y / d) ** 2, 0.05); t += d + rng.uniform(0.01, 0.05)
# metronomes: a spot clunk as each is lit, then ticks at each extreme of the swing (computed from the same motion as the picture)
MX = [-1.35, -0.45, 0.45, 1.35]; MT = [33.40, 34.16, 34.93, 35.69]; MD = [0, 0.9, -0.7, 1.6]; DRIFT = 36.86
def eio(x): x = min(1, max(0, x)); return 4 * x ** 3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2
def phase(i, t):
    base = np.pi * (t - 0.334) / 0.5087
    if t < FIN: return base + max(0, min(t, HALL0) - DRIFT) ** 1.4 * MD[i]
    return base + (HALL0 - DRIFT) ** 1.4 * MD[i] * (1 - eio((t - FIN - 0.15) / (HIT2 - FIN - 0.15)))
def tick(t, i, g):
    y = tt(0.05); f = [1900, 1600, 2200, 1750][i]; s = (np.sin(2 * np.pi * f * y) * 0.6 + bp(rng.standard_normal(len(y)), 2500, 7000)) * np.exp(-y * 140); add(t, s, g, MX[i] / 1.6)
for i in range(4): clunk(MT[i], 0.35)
for i in range(4):
    for (a, b) in ((MT[i], HALL0), (FIN, CODA)):
        ts = np.arange(a, b, 1 / 600); ph = np.array([phase(i, x) for x in ts]); c = np.cos(ph)
        for k in np.where(np.sign(c[1:]) != np.sign(c[:-1]))[0]: tick(ts[k], i, 0.12)
tone_room(33.4, HALL0, 250, 0.015)
# the hall: big empty room, the seat spot, the warm band
tone_room(HALL0, RAD0, 200, 0.03); clunk(HALL0 + 0.6, 0.7)
y = tt(1.8); add(BAND, lp(rng.standard_normal(len(y)), 900) * np.sin(np.pi * y / 1.8) ** 2 * 0.15 + np.sin(2 * np.pi * 110 * y) * np.sin(np.pi * y / 1.8) ** 2 * 0.03, 1.0)
# the radio room: rain, valve hum, static; the voices are shaped noise with each city's envelope
n = int((PLT0 - RAD0) * SR); y = np.arange(n) / SR + RAD0
rainr = lp(hp(rng.standard_normal(n), 400), 5000) * 0.04; fade = np.minimum(1, (y - RAD0) / 0.6) * np.clip((PLT0 - 0.3 - y) / 0.3, 0, 1); add(RAD0, rainr * fade, 1.0, -0.5)
static = bp(rng.standard_normal(n), 800, 6000) * 0.015 + np.sin(2 * np.pi * 50 * y) * 0.006
def env(kind, t):
    if kind == 0: return np.clip(0.35 + 0.65 * np.abs(np.sin(t * 13.1) * np.sin(t * 5.3 + 1)) + 0.25 * np.sin(t * 47) ** 8, 0, 1)
    if kind == 1: return np.clip(0.3 + 0.7 * np.maximum(0, np.sin(t * 4.7)) * (0.6 + 0.4 * np.sin(t * 1.1) ** 2), 0, 1)
    return np.clip(0.55 + 0.3 * np.sin(t * 2.3) + 0.1 * np.sin(t * 5.1), 0, 1)
src = rng.standard_normal(n)
f_hi = bp(src, 1200, 3500); f_mid = bp(src, 300, 1200); f_lo = bp(src, 150, 700)
vox = np.zeros(n)
unk = (y < 60.52) * np.clip((y - RAD0 - 1.2) / 1.5, 0, 1) * np.clip(0.4 + 0.6 * np.abs(np.sin(y * 3.7) * np.sin(y * 1.3)), 0, 1)
vox += f_mid * unk * 0.05
ca = ((y >= CA) & (y < CH)); chn = ((y >= CH) & (y < AC)); ac = ((y >= AC) & (y < WHY))
vox += np.tanh(f_hi * 6) * env(0, y) * ca * 0.05 + f_mid * env(1, y) * chn * 0.07 + f_lo * env(2, y) * ac * 0.08
mix3 = (y >= WHY) & (y < DROP); vox += (f_hi * env(0, y) + f_mid * env(1, y) + f_lo * env(2, y)) * mix3 * 0.025
dr = (y >= DROP); vox += (f_mid + f_lo) * dr * 0.06 * np.clip((PLT0 - 0.4 - y) / 0.4, 0, 1)
add(RAD0, (static * np.clip((PLT0 - 0.4 - y) / 0.3, 0, 1) + vox), 1.0)
for t in (CA - 1.2, CH - 0.55, AC - 0.55):
    for k in range(10): y2 = tt(0.02); add(t + k * 0.05, bp(rng.standard_normal(len(y2)), 2000, 6000) * np.exp(-y2 * 200), 0.08)
y = tt(1.2); add(DROP, np.sin(2 * np.pi * 42 * y * (1 - 0.3 * y)) * np.exp(-y * 3.5) + lp(rng.standard_normal(len(y)), 1200) * np.exp(-y * 6) * 0.7, 0.9)
y = tt(0.9); w = np.zeros(len(y)); xx = rng.standard_normal(len(y))
for k in range(8): a, b = k * len(y) // 8, (k + 1) * len(y) // 8; f = 300 + 2500 * k / 8; w[a:b] = bp(xx, f, f * 1.8)[a:b]
add(DROP + 0.1, w * np.sin(np.pi * y / 0.9) ** 2, 0.35)
# the plates: metal shimmer as the light rakes across, a bell when 調 lights, a whoosh as they fly, a chord as they become one
def bell(t, f0, g, d=3.0):
    y = tt(d); s = sum(a * np.sin(2 * np.pi * f0 * m * y) * np.exp(-y * dk) for m, a, dk in ((1, 1, 1.2), (2.76, 0.5, 2.0), (5.4, 0.25, 3.5), (8.9, 0.12, 5)))
    add(t, s, g)
y = tt(LIT - PLT0); add(PLT0, hp(rng.standard_normal(len(y)), 5000) * 0.01 * np.sin(np.pi * y / (LIT - PLT0)), 1.0)
for i, f in enumerate((660, 740, 880)): bell(LIT + i * 0.06, f, 0.07)
y = tt(ONE - FLY); w = np.zeros(len(y)); xx = rng.standard_normal(len(y))
for k in range(8): a, b = k * len(y) // 8, (k + 1) * len(y) // 8; f = 500 + 3000 * k / 8; w[a:b] = bp(xx, f, f * 1.6)[a:b]
add(FLY, w * np.sin(np.pi * y / (ONE - FLY)) ** 2, 0.18)
for f in (440, 554, 659, 880): bell(ONE, f, 0.06, 4.0)
tone_room(PLT0, STR0, 250, 0.012)
# the string: Karplus–Strong plucks; out of tune it beats against itself; the peg creaks; on the hit it rings true
def ks(f, d, damp=0.996):
    n = int(d * SR); N = int(SR / f); buf = rng.uniform(-1, 1, N); out_ = np.zeros(n)
    for i in range(n): out_[i] = buf[i % N]; buf[i % N] = damp * 0.5 * (buf[i % N] + buf[(i + 1) % N])
    return out_
add(95.45, (ks(196, 3.0) + ks(203.5, 3.0)) * 0.5, 0.25); add(97.9, (ks(196, 3.0) + ks(188.2, 3.0)) * 0.5, 0.22)
t = TURN
while t < TUNE - 0.1:
    d = rng.uniform(0.08, 0.18); y = tt(d); f = rng.uniform(500, 900); s = np.sign(np.sin(2 * np.pi * f * y)) * np.sin(np.pi * y / d) ** 2; add(t, bp(s, 400, 3000), 0.03); t += d + rng.uniform(0.02, 0.08)
add(TUNE, ks(196, 4.0, 0.998), 0.35); add(TUNE + 0.01, ks(392, 3.0, 0.997), 0.12)
tone_room(STR0, FIN, 220, 0.01)
# finale: the stage again; a warm swell on the hit
tone_room(FIN, CODA, 250, 0.015)
y = tt(2.4); add(HIT2 - 0.2, lp(rng.standard_normal(len(y)), 700) * np.sin(np.pi * y / 2.4) ** 2 * 0.12 + np.sin(2 * np.pi * 98 * y) * np.sin(np.pi * y / 2.4) ** 2 * 0.03, 1.0)
# coda: dawn in the bathroom, a few birds outside, the sun on the hit
tone_room(CODA, LEN, 400, 0.008)
for k in range(9):
    t = CODA + 0.8 + k * 0.85 + rng.uniform(0, 0.4); y = tt(0.18); f = rng.uniform(3000, 4200); ph = np.cumsum(2 * np.pi * (f + 900 * np.sin(2 * np.pi * 14 * y)) / SR)
    add(t, np.sin(ph) * np.sin(np.pi * y / 0.18) ** 2, 0.02, 0.6)
y = tt(2.0); add(SUN - 0.1, lp(rng.standard_normal(len(y)), 1500) * np.sin(np.pi * y / 2.0) ** 2 * 0.1, 1.0)
pk = np.abs(out).max(); out = out / max(pk, 1e-9) * 0.9
wavfile.write('public/sfx_full.wav', SR, (out * 32767).astype(np.int16))
print('ok', pk)
