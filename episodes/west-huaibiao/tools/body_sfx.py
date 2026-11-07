"""Sound and a sparse original score for the body of 一块怀表 (all synthesised: no samples, no borrowed melody).
Body time 0 = the night town. usage: python3 body_sfx.py out.wav"""
import sys, wave, numpy as np
from scipy.signal import butter, sosfilt
SR = 48000; END = 164.0
N = int(END * SR) + SR; rng = np.random.default_rng(1876)
L = np.zeros(N); R = np.zeros(N)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], "bandpass", fs=SR, output="sos"), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, "lowpass", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "highpass", fs=SR, output="sos"), x)
def secs(a): return int(a * SR)
def put(t0, s, g=1.0, pan=0.0):
    i = int(t0 * SR); j = min(N, i + len(s))
    if j <= i or i < 0: return
    L[i:j] += s[: j - i] * g * (1 - max(pan, 0)); R[i:j] += s[: j - i] * g * (1 + min(pan, 0))
def env(n, pts):  # piecewise-linear envelope over n samples, pts = [(t, v)...] in seconds
    tt = np.arange(n) / SR; return np.interp(tt, [p[0] for p in pts], [p[1] for p in pts])
def ks(freq, dur, bright=0.5, decay=0.996):
    n = secs(dur); per = max(2, int(SR / freq)); buf = rng.uniform(-1, 1, per) * np.hanning(per) ** bright; out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % per]; buf[i % per] = decay * 0.5 * (buf[i % per] + buf[(i + 1) % per])
    return out * np.minimum(1, np.arange(n) / 30)
def whoosh(dur, lo=300, hi=3000, peak=0.5):
    m = secs(dur); tt = np.arange(m) / SR; x = rng.standard_normal(m)
    a = bp(x, lo, lo * 3); b = bp(x, hi / 3, hi); k = np.sin(np.linspace(0, np.pi, m)); x = a * (1 - k) + b * k
    e = np.where(tt < dur * peak, (tt / (dur * peak)) ** 2, ((dur - tt) / (dur * (1 - peak))) ** 1.5); return x * e
def tick(tone=1.0):
    m = secs(0.035); return hp(rng.standard_normal(m), 2500) * np.exp(-np.arange(m) / SR * 220) + np.sin(2 * np.pi * 3400 * tone * np.arange(m) / SR) * np.exp(-np.arange(m) / SR * 300) * 0.5
def thud(t0, g, f=60, d=6):
    m = secs(0.6); tt = np.arange(m) / SR; put(t0, np.sin(2 * np.pi * f * np.exp(-tt * 2) * tt) * np.exp(-tt * d) + 0.3 * lp(rng.standard_normal(m), 300) * np.exp(-tt * 30), g)
def click(t0, f, g, pan=0.0):
    m = secs(0.06); tt = np.arange(m) / SR; put(t0, hp(rng.standard_normal(m), 1800) * np.exp(-tt * 180) + np.sin(2 * np.pi * f * tt) * np.exp(-tt * 90) * 0.6, g, pan)
def gunshot(t0, g, far=0.0, pan=0.0):
    m = secs(2.8); tt = np.arange(m) / SR
    s = hp(rng.standard_normal(m), 1500) * np.exp(-tt * 90) * 1.4 * (1 - far) + lp(rng.standard_normal(m), 400) * np.exp(-tt * 9) + np.sin(2 * np.pi * 58 * tt) * np.exp(-tt * 6) * 0.8
    if far: s = lp(s, 2500 - 1500 * far)
    put(t0, s, g, pan)
    for dly, gg, f in [(0.19, 0.35, 2500), (0.43, 0.22, 1600), (0.78, 0.14, 1100), (1.2, 0.08, 800)]: put(t0 + dly, lp(s, f), g * gg, (-0.4 if dly < 0.5 else 0.4))
def jingle(t0, g=0.1, pan=0.0):
    m = secs(0.35); tt = np.arange(m) / SR
    put(t0, sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) for f, d in [(2630, 14), (3710, 18), (5150, 22), (6880, 30)]) / 4, g, pan)
def noise_bed(t0, t1, lo, hi, g, pts=None, pan=0.0, mod=0.0):
    n = secs(t1 - t0); x = bp(rng.standard_normal(n), lo, hi)
    if mod: x *= (0.6 + 0.4 * np.sin(2 * np.pi * mod * np.arange(n) / SR + rng.uniform(0, 6)))
    e = env(n, pts) if pts else env(n, [(0, 0), (0.8, 1), (t1 - t0 - 0.8, 1), (t1 - t0, 0)])
    put(t0, x * e, g, pan)
def drone(t0, t1, f, g, fade=1.2):
    n = secs(t1 - t0); tt = np.arange(n) / SR
    s = (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) + 0.15 * np.sin(2 * np.pi * 3.01 * f * tt)) * env(n, [(0, 0), (fade, 1), (t1 - t0 - fade, 1), (t1 - t0, 0)])
    put(t0, s, g)

# ---- the score: a slow minor guitar under the story (Em C Am B), out where the story needs silence
E2, A2, B2, C3, D3, E3, G3, A3, B3, C4, D4, E4, Fs4, G4 = 82.41, 110.0, 123.47, 130.81, 146.83, 164.81, 196.0, 220.0, 246.94, 261.63, 293.66, 329.63, 369.99, 392.0
CH = [[E2, B2, E3, G3, B3], [C3, G3, C4, E4, G3], [A2, E3, A3, C4, E4], [B2, Fs4 / 2, B3, D4, Fs4 / 2]]
def arpeggio(t0, t1, g, beat=60 / 72):
    k = 0; t = t0
    while t < t1 - 0.5:
        chord = CH[(k // 8) % 4]; note = chord[[0, 2, 3, 4, 1, 3, 2, 4][k % 8]]
        put(t, ks(note, 2.2, 0.55, 0.9975), g * (1.15 if k % 8 == 0 else 0.8), (-0.25 if k % 2 else 0.25)); t += beat; k += 1
arpeggio(0.6, 44.6, 0.13)
arpeggio(115.6, 128.6, 0.11)
drone(0.0, 44.9, 41.2, 0.05)
put(44.95, ks(E2, 4.0, 0.4, 0.9985), 0.35)                       # after 「我就杀了你」: one low string, then nothing
drone(45.6, 61.3, 41.2, 0.08, 3.0)
n = secs(15.7); tt = np.arange(n) / SR
put(45.6, np.sin(2 * np.pi * np.cumsum(55 + 25 * (tt / tt[-1]) ** 2) / SR) * (tt / tt[-1]) ** 2 * 0.5, 0.12)   # a slow rise into the call
drone(76.8, 90.0, 36.7, 0.06)
n = secs(6.8); tt = np.arange(n) / SR                            # the legend: a wide open chord
pad = sum(sum(np.sign(np.sin(2 * np.pi * f * (1 + dt) * tt)) for dt in (-0.004, 0.0, 0.005)) for f in (E3, G3 * 1.0, B3, E4)) / 12
put(108.6, lp(pad, 1600) * env(n, [(0, 0), (1.2, 1), (5.8, 1), (6.8, 0)]), 0.09)
drone(139.9, 154.0, 41.2, 0.07, 2.0)
for k, f in enumerate([E3, B2, G3 / 2, E2]): put(146.6 + k * 1.3, ks(f, 3.0, 0.45, 0.998), 0.28, (-0.2 + 0.13 * k))   # 死人之手, then down and out
put(158.4, ks(E2, 5.0, 0.4, 0.9988), 0.32); put(158.42, ks(B2, 5.0, 0.4, 0.9988), 0.22); put(158.44, ks(E3, 5.0, 0.4, 0.9988), 0.18)

# ---- B1 night (0–6.3): crickets, a far piano, a low wind
n = secs(6.6); tt = np.arange(n) / SR
cr = sum(np.sin(2 * np.pi * f * tt) * (np.sin(2 * np.pi * r * tt) > 0.6) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.3 * tt + f)) for f, r in [(4300, 18), (4700, 21), (5100, 16)]) / 3
put(0, cr * env(n, [(0, 0), (1, 1), (5.6, 1), (6.6, 0)]), 0.025)
noise_bed(0, 6.5, 150, 700, 0.05, mod=0.2)
for k, f in enumerate([E4, G4, B3, E4, D4]): put(1.2 + k * 0.9, lp(ks(f * 2, 0.8, 0.8, 0.993), 2500), 0.04, 0.5)
# ---- B2 the card room (5.8–46.2)
noise_bed(5.8, 46.2, 200, 1200, 0.018)                                       # room tone
n = secs(40.4); x = rng.standard_normal(n); crack = np.zeros(n)
for k in rng.integers(0, n - 400, 420): crack[k:k + 300] += rng.uniform(-1, 1) * np.exp(-np.arange(300) / 40)
put(5.8, bp(crack, 1500, 6000) * 0.5 + bp(x, 80, 300) * 0.3, 0.03, -0.4)      # the fire
for k in range(10): put(6.6 + k * 0.07, bp(rng.standard_normal(secs(0.05)), 2000, 7000) * np.hanning(secs(0.05)), 0.1)   # cards riffled
for k in range(6): click(20.1 + k * 0.12, 2400 + 200 * k, 0.12)              # chips pushed back
m = secs(0.5); cr2 = np.zeros(m)
for k in rng.integers(0, m - 200, 40): cr2[k:k + 150] += rng.uniform(-1, 1) * np.exp(-np.arange(150) / 30)
put(22.4, bp(cr2, 300, 2500), 0.18)                                           # Tutt's chair as he leans in
for k in range(20): put(26.4 + k * 1.0, tick(1.0 if k % 2 == 0 else 0.86), 0.12 + 0.12 * (k < 7))   # the watch, loud on the table
for k in range(8): click(28.65 + k * 0.03, 4500 + 300 * (k % 3), 0.05 * (1 - k / 8))   # the chain as he grabs it
m = secs(1.4); tt = np.arange(m) / SR
put(44.95, np.sin(2 * np.pi * (48 - 8 * tt) * tt) * np.exp(-tt * 3.0), 0.6)
put(45.4, whoosh(1.2, 200, 3000, 0.6), 0.12)
# ---- B3 the square clears (45.6–55.0)
noise_bed(45.6, 61.4, 160, 900, 0.07, mod=0.23)
noise_bed(45.6, 50.5, 300, 2500, 0.035, pts=[(0, 0.0), (0.6, 1), (3.5, 0.4), (4.9, 0)])   # the town's noise draining away
for tt0, pan in [(47.2, -0.5), (48.1, 0.6), (49.3, -0.2)]: thud(tt0, 0.25, 90, 14); click(tt0, 900, 0.1, pan)   # doors banging shut
for k in range(12): put(50.6 + k * 0.52, lp(rng.standard_normal(secs(0.05)), 600) * np.hanning(secs(0.05)), 0.12); jingle(50.62 + k * 0.52, 0.035, 0.2)
# ---- REVEAL (55.0–61.4): the flight, the counter, the chime
put(55.5, whoosh(2.7, 180, 4000, 0.45), 0.35)
g2 = lambda x: (lambda u: u * u * (3 - 2 * u))(min(max((x - 55.6) / 2.6, 0.0), 1.0)); last = -1
for i in range(int(2.8 * 600)):
    tc = 55.6 + i / 600.0; v = int(round(69 * g2(tc)))
    if v != last and v > 0:
        m = secs(0.012); tt = np.arange(m) / SR; put(tc, np.sin(2 * np.pi * (1400 + v * 14) * tt) * np.exp(-tt * 400), 0.045); last = v
m = secs(2.0); tt = np.arange(m) / SR; put(58.2, (np.sin(2 * np.pi * 1318.5 * tt) + 0.6 * np.sin(2 * np.pi * 1975.5 * tt)) * np.exp(-tt * 2.0), 0.07)
# ---- B4 the shots (61.4–76.8)
def beat(t0, g):
    m = secs(0.2); tt = np.arange(m) / SR; s = np.sin(2 * np.pi * 50 * tt) * np.exp(-tt * 26) + 0.3 * lp(rng.standard_normal(m), 200) * np.exp(-tt * 40); put(t0, s, g); put(t0 + 0.19, s, g * 0.7)
for k in np.arange(63.0, 70.6, 0.82): beat(k, 0.4)
gunshot(64.4, 0.45, far=0.75, pan=0.1)                                       # Tutt fires, far away
thud(64.65, 0.3, 120, 20); noise_bed(64.65, 65.4, 1500, 6000, 0.08, pts=[(0, 1), (0.75, 0)])   # the miss kicks up dirt
m = secs(0.15); tt = np.arange(m) / SR; put(67.2, bp(rng.standard_normal(m), 300, 2500) * (tt / tt[-1]) ** 1.5, 0.25)
click(68.3, 1900, 0.35); click(68.385, 3300, 0.45)
gunshot(70.95, 0.95)                                                          # Hickok's shot
noise_bed(71.6, 76.8, 160, 900, 0.06, mod=0.2)
thud(74.6, 0.35, 55, 8)
noise_bed(74.0, 76.3, 800, 3000, 0.04, pts=[(0, 0), (0.3, 1), (2.0, 0.6), (2.3, 0)])   # the hat rolling
# ---- B5 the trial (76.8–90.3)
n = secs(13.5); tt = np.arange(n) / SR
mur = sum(bp(rng.standard_normal(n), 200 + 90 * k, 900 + 150 * k) * (0.5 + 0.5 * np.sin(2 * np.pi * (1.3 + 0.4 * k) * tt + k)) for k in range(5)) / 5
put(76.8, mur * env(n, [(0, 0), (0.8, 1), (7.5, 1.1), (8.0, 0.25), (9.0, 0.6), (12.5, 0.4), (13.5, 0)]), 0.06)
for tt0 in (84.8, 85.25): thud(tt0, 0.5, 140, 18); click(tt0, 700, 0.3)
put(88.8, whoosh(1.6, 300, 6000, 0.85), 0.2)
# ---- B6 the press (90.3–99.7) and the novels (99.7–103.1)
cyc = lambda tt: tt / 0.9 if tt < 5.6 else 5.6 / 0.9 + (tt - 5.6) / 0.9 + max(tt - 5.6, 0.0) ** 2 * 1.1
ts = np.arange(0, 9.4, 1 / 600.0); cv = np.array([cyc(x) for x in ts]); last = 0
for x, c in zip(ts, cv):
    if int(c - 0.5) > last - 1 and c - 0.5 >= last:
        thud(90.3 + x, 0.22, 70, 12); click(90.3 + x, 600, 0.12); put(90.3 + x + 0.25, bp(rng.standard_normal(secs(0.18)), 1500, 6000) * np.hanning(secs(0.18)), 0.05); last += 1
for k in range(100):                                                           # the count runs to 100 (ticks in time with the on-screen counter)
    x = 95.95 + 3.2 * (k / 99) ** 0.7
    m = secs(0.01); tt = np.arange(m) / SR; put(x, np.sin(2 * np.pi * (1200 + k * 9) * tt) * np.exp(-tt * 500), 0.04)
for k in range(9): put(99.8 + k * 0.33, whoosh(0.4, 500, 4000, 0.4) * 0.6, 0.12, (-0.5 if k % 2 else 0.5))
# ---- the movie again (103.1–108.45): the scoop's whoosh and shimmer, the draw, the shot, a white ring
put(103.5, whoosh(3.5, 200, 4500, 0.9), 0.2)
m = secs(3.5); tt = np.arange(m) / SR; u = tt / tt[-1]; f0 = 220 + 240 * u ** 2
put(103.6, (np.sin(2 * np.pi * np.cumsum(f0) / SR) * 0.5 * u ** 1.6), 0.12)
click(107.6, 1900, 0.35); click(107.685, 3300, 0.45); gunshot(108.42, 0.8)
noise_bed(108.45, 115.4, 160, 900, 0.07, mod=0.2)
# ---- B7 the archive (115.4–121.3) and the map (121.3–128.9)
noise_bed(115.4, 121.3, 100, 500, 0.02)
for x in (116.3, 118.4, 120.2): noise_bed(x, x + 0.5, 1500, 7000, 0.05, pts=[(0, 0), (0.1, 1), (0.5, 0)])    # pages turned
put(122.1, whoosh(2.3, 200, 2500, 0.5), 0.18)
for k in range(14): x = 125.6 + k * 0.17 + rng.uniform(0, 0.05); put(x, bp(rng.standard_normal(secs(0.04)), 2000, 9000) * np.hanning(secs(0.04)), 0.12)   # the number glitches
# ---- B8 Deadwood (128.9–139.5): saloon piano and voices, the piano stops, steps, black, one shot
piano = [E4, G4, B3 * 2, A3 * 2, G4, E4, D4, E4, B3 * 2, G4, Fs4, E4, D4, B3 * 2, C4 * 2, B3 * 2]
for k, f in enumerate(piano): put(129.0 + k * 0.42, lp(ks(f, 0.9, 0.9, 0.992), 3500), 0.07, 0.4); put(129.0 + k * 0.42, lp(ks(f / 2 if k % 4 == 0 else f * 0.75, 0.9, 0.9, 0.992), 3000), 0.05, 0.4)
n = secs(10.6); tt = np.arange(n) / SR
mur = sum(bp(rng.standard_normal(n), 250 + 120 * k, 1000 + 200 * k) * (0.5 + 0.5 * np.sin(2 * np.pi * (1.1 + 0.5 * k) * tt + k)) for k in range(4)) / 4
put(128.9, mur * env(n, [(0, 0), (0.8, 1), (7.6, 1), (8.2, 0.15), (10.6, 0.1)]), 0.04)
for x in (130.4, 133.1): click(x, 5200, 0.06, -0.3)
m = secs(0.9); tt = np.arange(m) / SR; put(136.5, bp(np.sin(2 * np.pi * (300 + 80 * np.sin(2 * np.pi * 3 * tt)) * tt), 200, 2000) * np.sin(np.linspace(0, np.pi, m)), 0.08)   # the door
for k in range(4): put(137.1 + k * 0.55, lp(rng.standard_normal(secs(0.06)), 500) * np.hanning(secs(0.06)), 0.18)
gunshot(139.6, 0.55, far=0.4)
# ---- B8 the cards (139.9–154.0)
for i in range(5): x = 139.9 + 0.9 + i * 0.32 + 0.9; put(x, bp(rng.standard_normal(secs(0.04)), 800, 5000) * np.exp(-np.arange(secs(0.04)) / SR * 60), 0.16)
for k in range(10): put(141.0 + k * 1.0, tick(1.0 if k % 2 == 0 else 0.86), 0.08)
m = secs(3.0); tt = np.arange(m) / SR; put(146.5, np.sin(2 * np.pi * (60 * np.exp(-tt * 1.4) + 28) * tt) * np.exp(-tt * 1.3), 0.6)
# ---- B9 dusk and the end card (154.0–164)
noise_bed(153.8, 164.0, 150, 800, 0.06, mod=0.2, pts=[(0, 0), (1.0, 1), (9.0, 0.8), (10.2, 0)])
for k in range(4): put(154.6 + k * 1.0, tick(1.0 if k % 2 == 0 else 0.86), 0.06 * (1 - k / 5))
for ch in (L, R):
    ch[secs(END) - secs(1.0): secs(END)] *= np.linspace(1, 0, secs(1.0)); ch[secs(END):] = 0
pk = max(np.abs(L).max(), np.abs(R).max()); L /= pk; R /= pk
st = (np.stack([L, R], 1)[: secs(END)] * 0.7 * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(st.tobytes())
print("ok", END)
