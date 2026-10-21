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
# gears: steady clicks while in step; after the drift, the clicks scatter and a grind comes in
GEAR, GDRIFT, CROWD, VOICE, REAL, GLOBE, CA2, CH2, AC2, WHY2, REC = 33.42, 36.86, 40.87, 52.53, 56.74, 60.52, 65.45, 69.51, 73.99, 78.33, 103.55
def gclick(t, f, g, pan=0.0):
    y = tt(0.03); add(t, (np.sin(2 * np.pi * f * y) * 0.5 + bp(rng.standard_normal(len(y)), 2000, 8000)) * np.exp(-y * 180), g, pan)
t = GEAR + 0.3
while t < GDRIFT: gclick(t, 2400, 0.05); t += 1 / 6.1
for i, (rate, f, pan) in enumerate(((9.0, 2600, -0.5), (12.5, 2100, 0.5), (1.5, 1800, -0.2), (7.0, 3000, 0.3))):
    t = GDRIFT + 0.05 * i
    while t < CROWD - 0.2: gclick(t, f, 0.04, pan); t += 1 / rate * rng.uniform(0.7, 1.3)
y = tt(CROWD - GDRIFT); add(GDRIFT, bp(rng.standard_normal(len(y)), 150, 900) * 0.05 * np.clip(y / 1.5, 0, 1) * np.clip((CROWD - GDRIFT - y) / 0.2, 0, 1) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * y) ** 2), 1.0)
tone_room(GEAR, CROWD, 250, 0.012)
# the crowd: big room, the spot on one person, a swell as the age band lights
tone_room(CROWD, VOICE, 200, 0.025); clunk(CROWD + 0.8, 0.7)
y = tt(1.8); add(BAND, lp(rng.standard_normal(len(y)), 900) * np.sin(np.pi * y / 1.8) ** 2 * 0.15 + np.sin(2 * np.pi * 110 * y) * np.sin(np.pi * y / 1.8) ** 2 * 0.03, 1.0)
# ---------------------------------------------------------------- multiple-personality version, 52.5 s onwards
def bell(t, f0, g, d=3.0):
    y = tt(d); s = sum(a * np.sin(2 * np.pi * f0 * m * y) * np.exp(-y * dk) for m, a, dk in ((1, 1, 1.2), (2.76, 0.5, 2.0), (5.4, 0.25, 3.5), (8.9, 0.12, 5)))
    add(t, s, g)
CHILD, HURT, GATE, BOOTH, FROST, DARK, CLOCK, SCREEN, OFFICE, ALONE, THER, GEARS2, MERGE = 52.53, 56.74, 60.52, 65.45, 69.51, 73.99, 78.33, 82.239, 86.44, 91.29, 95.28, 99.42, 103.55
for k in range(3): clunk(CROWD + 1.0 + k * 0.25, 0.3)
# the child: a low heartbeat and a dull pressure that grows until the gate drops
t = CHILD + 0.4
while t < GATE:
    for dt, a in ((0, 0.5), (0.22, 0.32)):
        y = tt(0.25); add(t + dt, lp(np.sin(2 * np.pi * 48 * y) * np.exp(-y * 18), 200), a * (0.5 + 0.5 * (t - CHILD) / (GATE - CHILD)))
    t += 0.9 - 0.25 * (t - CHILD) / (GATE - CHILD)
y = tt(GATE - CHILD); add(CHILD, lp(rng.standard_normal(len(y)), 160) * 0.12 * (y / (GATE - CHILD)) ** 2, 1.0)
# the gate: a heavy slide and a slam, then a muffled hush
y = tt(0.4); add(GATE - 0.38, bp(rng.standard_normal(len(y)), 300, 2500) * np.sin(np.pi * y / 0.4) * 0.25, 1.0)
y = tt(0.9); add(GATE, np.sin(2 * np.pi * 55 * y * (1 - 0.3 * y)) * np.exp(-y * 6) + bp(rng.standard_normal(len(y)), 200, 1500) * np.exp(-y * 20) * 0.7, 0.85)
tone_room(GATE + 0.2, BOOTH, 180, 0.02)
# booths: a soft glass tone for each identity, a frosting hiss, a dark thud, then the clock ticking with a skipped beat
for k, f in enumerate((523, 659, 784, 988)):
    y = tt(1.6); add(BOOTH + 0.3 + k * 0.2, (np.sin(2 * np.pi * f * y) + 0.3 * np.sin(2 * np.pi * f * 2.01 * y)) * np.exp(-y * 2.5), 0.05, -0.6 + 0.4 * k)
y = tt(1.2); add(FROST, hp(rng.standard_normal(len(y)), 4000) * np.sin(np.pi * y / 1.2) ** 2 * 0.08, 1.0)
y = tt(0.6); add(DARK, np.sin(2 * np.pi * 70 * y) * np.exp(-y * 12) * 0.6, 0.6, 0.6)
t = CLOCK
while t < SCREEN - 0.1:
    y = tt(0.03); s2 = bp(rng.standard_normal(len(y)), 2000, 6000) * np.exp(-y * 160)
    if not (79.6 < t < 80.9): add(t, s2, 0.12)
    t += 0.5087
tone_room(BOOTH, SCREEN, 300, 0.01)
# the film version: a cinema rumble, then the red X stamped on the drop
y = tt(1.2); add(SCREEN, np.sin(2 * np.pi * 42 * y * (1 - 0.3 * y)) * np.exp(-y * 3.5) + lp(rng.standard_normal(len(y)), 1200) * np.exp(-y * 6) * 0.7, 0.9)
y = tt(0.25); add(SCREEN + 0.02, bp(rng.standard_normal(len(y)), 600, 4000) * np.exp(-y * 25), 0.5)
# the office: keyboards, a quiet room; then everything drains away to one light
for k in range(70):
    t = OFFICE + rng.uniform(0, ALONE - OFFICE); y = tt(0.03); add(t, bp(rng.standard_normal(len(y)), 1500, 6000) * np.exp(-y * 150), rng.uniform(0.02, 0.05), rng.uniform(-0.6, 0.6))
tone_room(OFFICE, ALONE + 0.8, 500, 0.012)
y = tt(THER - ALONE); add(ALONE, (np.sin(2 * np.pi * 65 * y) + 0.4 * np.sin(2 * np.pi * 98 * y)) * 0.03 * np.clip(y / 1.0, 0, 1) * np.clip((THER - ALONE - y) / 0.4, 0, 1), 1.0)
# therapy: a warm room, a clock-less calm; the gears find each other again
tone_room(THER, MERGE, 600, 0.008)
y = tt(GEARS2 - THER); add(THER, (np.sin(2 * np.pi * 220 * y) + np.sin(2 * np.pi * 277 * y) + np.sin(2 * np.pi * 330 * y)) * 0.012 * np.sin(np.pi * y / (GEARS2 - THER)), 1.0)
t = GEARS2 + 0.2
while t < MERGE - 0.2:
    k = min(1, (t - GEARS2) / 2.2); jitter = (1 - k) * rng.uniform(-0.06, 0.06); gclick(t + jitter, 2400, 0.05); t += 1 / 6.1
# merge: four soft tones walking in, one chord on the hit
for k, f in enumerate((523, 659, 784, 988)):
    y = tt(2.0); add(MERGE + 0.3 + k * 0.3, np.sin(2 * np.pi * f * y) * np.exp(-y * 2.0), 0.04, -0.6 + 0.4 * k)
for f in (523, 659, 784, 1046): bell(HIT2, f, 0.06, 4.0)
y = tt(2.4); add(HIT2 - 0.2, lp(rng.standard_normal(len(y)), 700) * np.sin(np.pi * y / 2.4) ** 2 * 0.12, 1.0)
# coda: dawn in the bathroom, a few birds outside, the sun on the hit
tone_room(CODA, LEN, 400, 0.008)
for k in range(9):
    t = CODA + 0.8 + k * 0.85 + rng.uniform(0, 0.4); y = tt(0.18); f = rng.uniform(3000, 4200); ph = np.cumsum(2 * np.pi * (f + 900 * np.sin(2 * np.pi * 14 * y)) / SR)
    add(t, np.sin(ph) * np.sin(np.pi * y / 0.18) ** 2, 0.02, 0.6)
y = tt(2.0); add(SUN - 0.1, lp(rng.standard_normal(len(y)), 1500) * np.sin(np.pi * y / 2.0) ** 2 * 0.1, 1.0)
pk = np.abs(out).max(); out = out / max(pk, 1e-9) * 0.9
wavfile.write('public/sfx_did.wav', SR, (out * 32767).astype(np.int16))
print('ok', pk)
