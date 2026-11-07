"""Sound design + a sparse original western score for the hero cold open v3 (all synthesised: no samples, no borrowed melody).
Timeline: shot A 0–7.2 (duel, one move), white flash, shot B 7.2–13.6 (the 69 m flight), dissolve, shot C 13.1–20.3 (the watch).
usage: python3 west_sfx.py out.wav"""
import sys, wave, numpy as np
from scipy.signal import butter, sosfilt
SR = 48000
B0 = 7.2; C0 = 13.1; END = C0 + 8.0
T = dict(dolly=0.6, pov=1.6, zoom=2.4, vert=2.8, push=4.0, squint=4.5, swing=4.95, settle=5.85, grab=6.45, cock=6.72, shot=6.97,
         flight=B0 + 0.5, arrive=B0 + 2.9, line=B0 + 3.2, crane=B0 + 3.3, watch=C0, title=C0 + 3.85)
N = int(END * SR) + SR; rng = np.random.default_rng(1865)
L = np.zeros(N); R = np.zeros(N)

def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], "bandpass", fs=SR, output="sos"), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, "lowpass", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "highpass", fs=SR, output="sos"), x)
def secs(a): return int(a * SR)
def put(t0, s, g=1.0, pan=0.0):
    i = int(t0 * SR); j = min(N, i + len(s))
    if j <= i: return
    L[i:j] += s[: j - i] * g * (1 - max(pan, 0)); R[i:j] += s[: j - i] * g * (1 + min(pan, 0))
def ks(freq, dur, bright=0.5, decay=0.996):   # Karplus-Strong plucked string (a dry steel-string guitar)
    n = secs(dur); per = int(SR / freq); buf = rng.uniform(-1, 1, per) * np.hanning(per) ** bright; out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % per]; buf[i % per] = decay * 0.5 * (buf[i % per] + buf[(i + 1) % per])
    return out * np.minimum(1, np.arange(n) / 30)
def whoosh(dur, lo=300, hi=3000, peak=0.5, sweep=True):
    m = secs(dur); tt = np.arange(m) / SR; x = rng.standard_normal(m)
    if sweep:   # two bands crossfaded = a rising-then-falling sweep
        a = bp(x, lo, lo * 3); b = bp(x, hi / 3, hi); k = np.sin(np.linspace(0, np.pi, m))
        x = a * (1 - k) + b * k
    else: x = bp(x, lo, hi)
    env = np.where(tt < dur * peak, (tt / (dur * peak)) ** 2, ((dur - tt) / (dur * (1 - peak))) ** 1.5)
    return x * env

# ---- shot A
# wind: gusty layers; drops away as we enter his eyes, rushes back with the swing, near silent before the draw
n = secs(B0); t = np.arange(n) / SR
wind = bp(rng.standard_normal(n), 160, 900) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.23 * t + 1)) + 0.4 * bp(rng.standard_normal(n), 900, 3500) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.41 * t))
shape = np.interp(t, [0, 1.6, 2.8, 4.0, 4.3, 4.95, 5.45, 6.0, 6.4, 6.97, B0], [1.0, 0.8, 0.6, 0.5, 0.05, 0.05, 0.9, 0.35, 0.12, 0.1, 0.0])
put(0, wind * shape, 0.09)
# the watch motif: a soft 1 Hz tick under the duel, stopping in his eyes
def tick(tone=1.0):
    m = secs(0.035); s = hp(rng.standard_normal(m), 2500) * np.exp(-np.arange(m) / SR * 220) + np.sin(2 * np.pi * 3400 * tone * np.arange(m) / SR) * np.exp(-np.arange(m) / SR * 300) * 0.5
    return s
for k in range(4): put(k * 1.0, tick(1.0 if k % 2 == 0 else 0.86), 0.06)
# score: a low plucked E on the first frame; a dyad when we land in his eyes (the POV)
put(0.0, ks(82.41, 3.5, 0.4, 0.9985), 0.32, -0.15)
put(T["pov"], ks(82.41, 3.0, 0.6, 0.998) + 0.7 * ks(123.47, 3.0, 0.6, 0.998), 0.28, 0.1)
# into the POV: a fast air push, a sub thump on arrival
put(T["dolly"], whoosh(1.0, 200, 2500, 0.85), 0.22)
m = secs(1.4); tt = np.arange(m) / SR
put(T["pov"], np.sin(2 * np.pi * (46 - 8 * tt) * tt) * np.exp(-tt * 3.5), 0.6)
# the zoom snaps onto him: a short tight whoosh and a low knock
put(T["zoom"] - 0.05, whoosh(0.45, 600, 5000, 0.8), 0.18)
m = secs(0.5); tt = np.arange(m) / SR
put(T["vert"] - 0.02, np.sin(2 * np.pi * 70 * np.exp(-tt * 3) * tt) * np.exp(-tt * 8), 0.45)
# the dolly zoom: a vertigo shimmer (two close tones beating faster) rising under it, cut dead at the eyes
m = secs(T["push"] + 0.3 - T["vert"]); tt = np.arange(m) / SR; u = tt / tt[-1]
f0 = 220 + 220 * u ** 2
vert = (np.sin(2 * np.pi * np.cumsum(f0) / SR) + np.sin(2 * np.pi * np.cumsum(f0 * (1.0 + 0.01 + 0.03 * u)) / SR)) * 0.5
vert = vert * u ** 1.6 + 0.35 * bp(rng.standard_normal(m), 2000, 9000) * u ** 3
put(T["vert"], vert, 0.16)
put(T["push"] - 0.05, whoosh(0.5, 400, 6000, 0.85), 0.25)
# in the eyes: near silence, a held breath, the creak of leather as he narrows them, one heartbeat
m = secs(0.7); put(T["push"] + 0.3, bp(rng.standard_normal(m), 300, 2200) * np.sin(np.linspace(0, np.pi, m)) ** 2, 0.05)
m = secs(0.4); cr = np.zeros(m)
for k in rng.integers(0, m - 200, 60): cr[k:k + 120] += rng.uniform(-1, 1) * np.exp(-np.arange(120) / 25)
put(T["squint"], bp(cr, 400, 3000), 0.28)
def beat(t0, g):
    m = secs(0.2); tt = np.arange(m) / SR; s = np.sin(2 * np.pi * 50 * tt) * np.exp(-tt * 26) + 0.3 * lp(rng.standard_normal(m), 200) * np.exp(-tt * 40)
    put(t0, s, g); put(t0 + 0.19, s, g * 0.7)
beat(T["squint"] + 0.35, 0.55)
# the swing round his head: a cloth-and-air pass from left to right
w = whoosh(0.95, 250, 3500, 0.55)
put(T["swing"], w * np.linspace(1, 0.3, len(w)), 0.3, -0.5); put(T["swing"], w * np.linspace(0.3, 1, len(w)), 0.3, 0.5)
# the wait: a distant spur jingle, two slow heartbeats, then nothing
def jingle(t0, g=0.12, pan=0.3):
    m = secs(0.35); tt = np.arange(m) / SR
    s = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) for f, d in [(2630, 14), (3710, 18), (5150, 22), (6880, 30)]) / 4
    put(t0, s, g, pan)
jingle(T["settle"] + 0.1, 0.08, -0.4)
beat(T["settle"] + 0.25, 0.5); beat(T["settle"] + 0.95, 0.55)
# the draw: leather slide out of the holster, a metal scrape, the hammer cocked, the shot
m = secs(0.16); tt = np.arange(m) / SR
put(T["grab"] + 0.08, bp(rng.standard_normal(m), 300, 2500) * (tt / tt[-1]) ** 1.5, 0.35, -0.1)
m = secs(0.12); tt = np.arange(m) / SR
put(T["grab"] + 0.22, bp(rng.standard_normal(m), 3000, 9000) * np.sin(np.linspace(0, np.pi, m)), 0.22, -0.1)
def click(t0, f, g):
    m = secs(0.06); tt = np.arange(m) / SR
    s = hp(rng.standard_normal(m), 1800) * np.exp(-tt * 180) + np.sin(2 * np.pi * f * tt) * np.exp(-tt * 90) * 0.6
    put(t0, s, g)
click(T["cock"], 1900, 0.4); click(T["cock"] + 0.085, 3300, 0.55)
m = secs(0.18); put(T["shot"] - 0.2, bp(rng.standard_normal(m), 500, 4000) * np.sin(np.linspace(0, np.pi, m)) ** 2, 0.2)
m = secs(2.8); tt = np.arange(m) / SR
gun = hp(rng.standard_normal(m), 1500) * np.exp(-tt * 90) * 1.4 + lp(rng.standard_normal(m), 400) * np.exp(-tt * 9) + np.sin(2 * np.pi * 58 * tt) * np.exp(-tt * 6) * 0.8
put(T["shot"], gun, 0.95)
for dly, g, f in [(0.19, 0.35, 2500), (0.43, 0.22, 1600), (0.78, 0.14, 1100), (1.2, 0.08, 800)]:
    put(T["shot"] + dly, lp(gun, f), g, (-0.4 if dly < 0.5 else 0.4))
# a high ring after the shot (the white): fades as the real street comes up
m = secs(1.6); tt = np.arange(m) / SR
put(T["shot"] + 0.05, np.sin(2 * np.pi * 3950 * tt) * np.exp(-tt * 2.2) * np.minimum(1, tt / 0.05), 0.035)

# ---- shot B: the flight
n = secs(C0 + 0.5 - B0); t = np.arange(n) / SR
w2 = bp(rng.standard_normal(n), 140, 1100) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.19 * t)); w2 *= np.interp(t, [0, 0.8, n / SR - 0.6, n / SR], [0, 1, 1, 0])
put(B0, w2, 0.08)
# the rush of air: a long whoosh peaking mid-flight, buildings passing left and right
put(T["flight"] - 0.1, whoosh(2.7, 180, 4000, 0.45), 0.42)
for k, tp in enumerate([0.55, 0.9, 1.25, 1.55, 1.85, 2.1, 2.35]):
    put(T["flight"] + tp, whoosh(0.32, 500, 5000, 0.4, sweep=False), 0.09, (-0.6 if k % 2 == 0 else 0.6))
# the counter: a rising pitched ratchet that speeds up with the metres, landing on a chime when the line reaches him
g2 = lambda x: (lambda u: u * u * (3 - 2 * u))(min(max((x - (B0 + 0.6)) / 2.6, 0.0), 1.0))
last = -1
for i in range(int(2.7 * 600)):
    tc = B0 + 0.6 + i / 600.0
    v = int(round(69 * g2(tc)))
    if v != last and v > 0:
        m = secs(0.012); tt = np.arange(m) / SR
        put(tc, np.sin(2 * np.pi * (1400 + v * 14) * tt) * np.exp(-tt * 400), 0.05, 0.1)
        last = v
m = secs(1.4); tt = np.arange(m) / SR
put(T["arrive"], np.sin(2 * np.pi * (52 - 10 * tt) * tt) * np.exp(-tt * 4), 0.55)
m = secs(2.2); tt = np.arange(m) / SR
put(T["line"], (np.sin(2 * np.pi * 1318.5 * tt) + 0.6 * np.sin(2 * np.pi * 1975.5 * tt)) * np.exp(-tt * 2.0), 0.08)
# the crane: a slow open chord (detuned saws, filtered) under the town
m = secs(C0 + 0.5 - T["crane"]); tt = np.arange(m) / SR
pad = sum(sum(np.sign(np.sin(2 * np.pi * f * (1 + dt) * tt)) for dt in (-0.004, 0.0, 0.005)) for f in (164.81, 196.0, 246.94)) / 9
pad = lp(pad, 1400) * np.interp(tt, [0, 1.2, m / SR - 0.5, m / SR], [0, 1, 1, 0])
put(T["crane"], pad, 0.075)

# ---- shot C: the table
for k in range(9): put(C0 + 0.15 + k * 1.0, tick(1.0 if k % 2 == 0 else 0.86), 0.32)
m = secs(END - C0); tt = np.arange(m) / SR
drone = (np.sin(2 * np.pi * 41.2 * tt) + 0.35 * np.sin(2 * np.pi * 82.4 * tt)) * np.interp(tt, [0, 1.0, m / SR - 0.7, m / SR], [0, 1, 1, 0])
put(C0, drone, 0.12)
m = secs(3.0); tt = np.arange(m) / SR
put(T["title"], np.sin(2 * np.pi * (72 * np.exp(-tt * 1.4) + 30) * tt) * np.exp(-tt * 1.3), 0.85)
put(T["title"] + 0.05, sum(np.sin(2 * np.pi * f * tt) for f in (1318.5, 1975.5, 2637.0)) / 3 * (1 - np.exp(-tt * 8)) * np.exp(-tt * 1.6), 0.05)
for k, f in enumerate([164.81, 123.47, 82.41]): put(T["title"] + 0.35 + k * 0.42, ks(f, 2.5, 0.5, 0.998), 0.3, (-0.2 + 0.2 * k))

for ch in (L, R):
    ch[secs(END) - secs(0.6): secs(END)] *= np.linspace(1, 0, secs(0.6)); ch[secs(END):] = 0
pk = max(np.abs(L).max(), np.abs(R).max()); L /= pk; R /= pk
st = (np.stack([L, R], 1)[: secs(END)] * 0.7 * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(st.tobytes())
print("ok", round(END, 3), "s")
