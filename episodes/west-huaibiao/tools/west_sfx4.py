"""Sound design + a sparse original score for the hero cold open v4 (all synthesised: no samples, no borrowed melody).
Timeline: duel 0–5.82 (one scoop into his eyes, the draw), the bullet 5.82–8.77 (slow motion, into the dark, into the lens),
the screen breaks 8.77, shards fall onto the watch (C0 = 9.17), title at C0 + 4.05, end C0 + 8.33.
usage: python3 west_sfx4.py out.wav"""
import sys, wave, numpy as np
from scipy.signal import butter, sosfilt
SR = 48000
TF = 5.82; IMP = 263 / 30; C0 = IMP + 0.4; END = C0 + 250 / 30
T = dict(scoop=0.45, pov=0.8, eyes=3.2, squint=3.5, swing=3.95, settle=4.85, grab=5.30, cock=5.60, shot=TF, dark=7.2, turn=7.9,
         come=8.3, imp=IMP, fall=C0, title=C0 + 4.05)
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
def ks(freq, dur, bright=0.5, decay=0.996):   # Karplus-Strong plucked string
    n = secs(dur); per = int(SR / freq); buf = rng.uniform(-1, 1, per) * np.hanning(per) ** bright; out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % per]; buf[i % per] = decay * 0.5 * (buf[i % per] + buf[(i + 1) % per])
    return out * np.minimum(1, np.arange(n) / 30)
def whoosh(dur, lo=300, hi=3000, peak=0.5, sweep=True):
    m = secs(dur); tt = np.arange(m) / SR; x = rng.standard_normal(m)
    if sweep:
        a = bp(x, lo, lo * 3); b = bp(x, hi / 3, hi); k = np.sin(np.linspace(0, np.pi, m)); x = a * (1 - k) + b * k
    else: x = bp(x, lo, hi)
    env = np.where(tt < dur * peak, (tt / (dur * peak)) ** 2, ((dur - tt) / (dur * (1 - peak))) ** 1.5)
    return x * env
def tick(tone=1.0):
    m = secs(0.035); return hp(rng.standard_normal(m), 2500) * np.exp(-np.arange(m) / SR * 220) + np.sin(2 * np.pi * 3400 * tone * np.arange(m) / SR) * np.exp(-np.arange(m) / SR * 300) * 0.5
def beat(t0, g, slow=1.0):
    m = secs(0.2 * slow); tt = np.arange(m) / SR; s = np.sin(2 * np.pi * 50 / slow * tt) * np.exp(-tt * 26 / slow) + 0.3 * lp(rng.standard_normal(m), 200) * np.exp(-tt * 40 / slow)
    put(t0, s, g); put(t0 + 0.19 * slow, s, g * 0.7)
def click(t0, f, g):
    m = secs(0.06); tt = np.arange(m) / SR
    put(t0, hp(rng.standard_normal(m), 1800) * np.exp(-tt * 180) + np.sin(2 * np.pi * f * tt) * np.exp(-tt * 90) * 0.6, g)
def tinkle(t0, g, pan):
    m = secs(0.12); tt = np.arange(m) / SR
    s = sum(np.sin(2 * np.pi * rng.uniform(2200, 7800) * tt) * np.exp(-tt * rng.uniform(25, 70)) for _ in range(3)) / 3
    put(t0, s, g, pan)

# ---- the duel
n = secs(TF + 0.3); t = np.arange(n) / SR
wind = bp(rng.standard_normal(n), 160, 900) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.23 * t + 1)) + 0.4 * bp(rng.standard_normal(n), 900, 3500) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.41 * t))
put(0, wind * np.interp(t, [0, 0.8, 2.4, 3.1, 3.25, 3.95, 4.45, 5.0, 5.5, TF, TF + 0.3], [1.0, 0.85, 0.6, 0.45, 0.04, 0.04, 0.9, 0.35, 0.12, 0.1, 0.0]), 0.09)
for k in range(3): put(k * 1.0, tick(1.0 if k % 2 == 0 else 0.86), 0.06)
put(0.0, ks(82.41, 3.2, 0.4, 0.9985), 0.32, -0.15)
put(T["pov"], ks(82.41, 2.6, 0.6, 0.998) + 0.7 * ks(123.47, 2.6, 0.6, 0.998), 0.26, 0.1)
# the scoop: one long rising push of air, a thump as we land behind his eyes, a vertigo shimmer into the opponent, cut dead at his eyes
put(T["scoop"], whoosh(T["eyes"] - T["scoop"] + 0.05, 200, 4500, 0.9), 0.24)
m = secs(1.2); tt = np.arange(m) / SR
put(T["pov"], np.sin(2 * np.pi * (46 - 8 * tt) * tt) * np.exp(-tt * 3.5), 0.55)
m = secs(T["eyes"] - 1.4); tt = np.arange(m) / SR; u = tt / tt[-1]
f0 = 220 + 240 * u ** 2
vert = (np.sin(2 * np.pi * np.cumsum(f0) / SR) + np.sin(2 * np.pi * np.cumsum(f0 * (1.01 + 0.03 * u)) / SR)) * 0.5 * u ** 1.6 + 0.35 * bp(rng.standard_normal(m), 2000, 9000) * u ** 3
put(1.4, vert, 0.16)
# his eyes: near silence, a breath, leather creak as he narrows them, one heartbeat
m = secs(0.6); put(T["eyes"] + 0.05, bp(rng.standard_normal(m), 300, 2200) * np.sin(np.linspace(0, np.pi, m)) ** 2, 0.05)
m = secs(0.4); cr = np.zeros(m)
for k in rng.integers(0, m - 200, 60): cr[k:k + 120] += rng.uniform(-1, 1) * np.exp(-np.arange(120) / 25)
put(T["squint"], bp(cr, 400, 3000), 0.28)
beat(T["squint"] + 0.3, 0.55)
# the swing round his head, the wait, the draw
w = whoosh(0.95, 250, 3500, 0.55)
put(T["swing"], w * np.linspace(1, 0.3, len(w)), 0.3, -0.5); put(T["swing"], w * np.linspace(0.3, 1, len(w)), 0.3, 0.5)
m = secs(0.35); tt = np.arange(m) / SR
put(T["settle"] + 0.1, sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) for f, d in [(2630, 14), (3710, 18), (5150, 22), (6880, 30)]) / 4, 0.08, -0.4)
beat(T["settle"] + 0.15, 0.5)
m = secs(0.15); tt = np.arange(m) / SR
put(T["grab"] + 0.06, bp(rng.standard_normal(m), 300, 2500) * (tt / tt[-1]) ** 1.5, 0.35, -0.1)
m = secs(0.1); put(T["grab"] + 0.2, bp(rng.standard_normal(m), 3000, 9000) * np.sin(np.linspace(0, np.pi, m)), 0.22, -0.1)
click(T["cock"], 1900, 0.4); click(T["cock"] + 0.085, 3300, 0.55)

# ---- the shot and the bullet
m = secs(0.12); tt = np.arange(m) / SR
put(TF, hp(rng.standard_normal(m), 1500) * np.exp(-tt * 70) * 1.5, 0.9)                     # the crack, cut short
m = secs(3.2); tt = np.arange(m) / SR                                                      # ...then the boom stretched into slow time
boom = lp(rng.standard_normal(m), 260) * np.exp(-tt * 1.1) * 1.4 + np.sin(2 * np.pi * np.cumsum(70 * np.exp(-tt * 0.9) + 18) / SR) * np.exp(-tt * 0.8)
put(TF + 0.03, boom * np.minimum(1, tt / 0.05), 0.85)
put(TF + 0.05, whoosh(1.6, 120, 1500, 0.15, sweep=False), 0.3)
# the bullet's whir: a low hum pulsing with its spin, a hiss of air; rising as it comes round and into the lens
m = secs(IMP - TF - 0.6); tt = np.arange(m) / SR; tl = TF + 0.6 + tt
spin = 4.2 + 3.0 * np.clip((tl - T["come"]) / (IMP - T["come"]), 0, 1) ** 2
pitch = 95 * (1 + 0.6 * np.clip((tl - T["come"]) / (IMP - T["come"]), 0, 1) ** 2)
hum = np.sin(2 * np.pi * np.cumsum(pitch) / SR) * (0.6 + 0.4 * np.sin(2 * np.pi * np.cumsum(spin) / SR))
air = bp(rng.standard_normal(m), 900, 5000) * (0.5 + 0.5 * np.sin(2 * np.pi * np.cumsum(spin) / SR))
lev = np.interp(tl, [TF + 0.6, 7.0, T["turn"], T["come"], IMP], [0.0, 0.7, 0.55, 0.45, 1.6])
put(TF + 0.6, (hum * 0.7 + air * 0.35) * lev, 0.2, 0.15)
beat(6.4, 0.6, slow=2.2); beat(7.5, 0.55, slow=2.4)
m = secs(IMP - T["come"]); tt = np.arange(m) / SR; u = tt / tt[-1]                         # a swell sucked into the impact
put(T["come"], (bp(rng.standard_normal(m), 400, 8000) * u ** 3 + np.sin(2 * np.pi * np.cumsum(200 + 900 * u ** 2) / SR) * u ** 2.5 * 0.4), 0.22)

# ---- the screen breaks
m = secs(0.05); put(IMP, hp(rng.standard_normal(m), 3000) * np.exp(-np.arange(m) / SR * 120), 0.9)
m = secs(1.6); tt = np.arange(m) / SR
put(IMP, sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) for f, d in [(2410, 3.0), (3980, 4.2), (5730, 5.5), (7920, 7.0)]) / 4, 0.32)
m = secs(0.22); crk = np.zeros(m)
for k in rng.integers(0, m - 300, 90): crk[k:k + 200] += rng.uniform(-1, 1) * np.exp(-np.arange(200) / 30)
put(IMP + 0.01, bp(crk, 1800, 9000), 0.55)
m = secs(0.9); tt = np.arange(m) / SR
put(IMP, np.sin(2 * np.pi * (48 - 12 * tt) * tt) * np.exp(-tt * 4.5), 0.7)
for _ in range(26): tinkle(IMP + rng.uniform(0.02, 0.35), rng.uniform(0.05, 0.12), rng.uniform(-0.8, 0.8))
for k in range(80):                                                                          # shards falling away
    x = rng.uniform(0, 1) ** 1.6; tinkle(T["fall"] + 0.05 + x * 1.1, rng.uniform(0.03, 0.11) * (1 - 0.6 * x), rng.uniform(-0.9, 0.9))
m = secs(1.2); put(T["fall"], bp(rng.standard_normal(m), 3000, 10000) * np.exp(-np.arange(m) / SR * 3.0), 0.08)

# ---- the table
for k in range(9): put(C0 + 0.25 + k * 1.0, tick(1.0 if k % 2 == 0 else 0.86), 0.32)
m = secs(END - C0); tt = np.arange(m) / SR
put(C0, (np.sin(2 * np.pi * 41.2 * tt) + 0.35 * np.sin(2 * np.pi * 82.4 * tt)) * np.interp(tt, [0, 1.2, m / SR - 0.7, m / SR], [0, 1, 1, 0]), 0.12)
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
