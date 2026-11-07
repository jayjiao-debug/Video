"""Sound design + an original sparse western score for the hero cold open (all synthesised, no samples, no borrowed melody).
usage: python3 west_sfx.py out.wav"""
import sys, wave, numpy as np
from scipy.signal import butter, sosfilt
SR = 48000
END = 715 / 30
T = dict(duel=0.0, pov=3.4, push=4.9, ecu=6.9, hhand=234/30, tumble=250/30, ohand=268/30, heyes=282/30, oeyes=296/30, flash=305/30,
         shot=311/30, black=313/30, reveal=379/30, line=379/30 + 3.4, watch=511/30, title=511/30 + 2.5)
N = int(END * SR) + SR; rng = np.random.default_rng(1865)
L = np.zeros(N); R = np.zeros(N)

def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], "bandpass", fs=SR, output="sos"), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, "lowpass", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "highpass", fs=SR, output="sos"), x)
def put(t0, s, g=1.0, pan=0.0):
    i = int(t0 * SR); j = min(N, i + len(s))
    if j <= i: return
    L[i:j] += s[: j - i] * g * (1 - max(pan, 0)); R[i:j] += s[: j - i] * g * (1 + min(pan, 0))
def secs(a): return int(a * SR)
def env_ad(n, a, d): e = np.exp(-np.arange(n) / SR / d); e[: max(1, secs(a))] *= np.linspace(0, 1, max(1, secs(a))); return e
def ks(freq, dur, bright=0.5, decay=0.996):   # Karplus-Strong plucked string (a dry steel-string guitar)
    n = secs(dur); per = int(SR / freq); buf = rng.uniform(-1, 1, per) * np.hanning(per) ** bright; out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % per]; buf[i % per] = decay * 0.5 * (buf[i % per] + buf[(i + 1) % per])
    return out * np.minimum(1, np.arange(n) / 30)

# wind: three gusty layers, shaped by the story (dies in the eye close-up, gone indoors)
n = secs(T["black"]); t = np.arange(n) / SR
wind = bp(rng.standard_normal(n), 160, 900) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.23 * t + 1)) + 0.4 * bp(rng.standard_normal(n), 900, 3500) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.41 * t))
shape = np.interp(t, [0, 3.4, 4.9, 6.6, 6.9, 7.8, 8.0, T["black"]], [1.0, 0.75, 0.6, 1.25, 0.06, 0.06, 0.45, 0.4])
put(0, wind * shape, 0.09)
n = secs(T["watch"] - T["reveal"] + 0.5); t = np.arange(n) / SR
w2 = bp(rng.standard_normal(n), 140, 1100) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.19 * t)); w2 *= np.interp(t, [0, 1.2, n / SR - 0.5, n / SR], [0, 1, 1, 0])
put(T["reveal"], w2, 0.1)

# the watch motif: a soft tick under the duel (1 Hz), silent in the eye close-up, loud and close on the table
def tick(g, tone=1.0):
    m = secs(0.035); s = hp(rng.standard_normal(m), 2500) * np.exp(-np.arange(m) / SR * 220) + np.sin(2 * np.pi * 3400 * tone * np.arange(m) / SR) * np.exp(-np.arange(m) / SR * 300) * 0.5
    return s * g
for k in range(7): put(k * 1.0, tick(1.0, 1.0 if k % 2 == 0 else 0.86), 0.06)
for k in range(7): put(T["watch"] + k * 1.0, tick(1.0, 1.0 if k % 2 == 0 else 0.86), 0.32)

# score: a low plucked E at the first frame, a dyad on arriving in his eyes, a rising swell into the crash push
put(0.0, ks(82.41, 4.0, 0.4, 0.9985), 0.32, -0.15)
put(T["pov"], ks(82.41, 3.0, 0.6, 0.998) + 0.7 * ks(123.47, 3.0, 0.6, 0.998), 0.28, 0.1)
m = secs(T["ecu"] - T["duel"] - 1.2); tt = np.arange(m) / SR
riser = (np.sin(2 * np.pi * (60 * tt + 18 * tt ** 2)) * 0.5 + bp(rng.standard_normal(m), 400, 5000) * 0.6) * (tt / tt[-1]) ** 2.5
put(1.2, riser[: secs(T["pov"] - 1.2)] * np.linspace(1, 0.2, secs(T["pov"] - 1.2)), 0.18)
m = secs(T["ecu"] - T["push"]); tt = np.arange(m) / SR
swell = (bp(rng.standard_normal(m), 600, 9000) + 0.6 * np.sin(2 * np.pi * (110 * tt + 90 * tt ** 2))) * (tt / tt[-1]) ** 3
put(T["push"], swell, 0.3)                                                         # hard stop at the eyes
m = secs(1.4); tt = np.arange(m) / SR
put(T["pov"], np.sin(2 * np.pi * (46 - 8 * tt) * tt) * np.exp(-tt * 3.5), 0.7)    # sub thump on arrival

# heartbeat in his eyes, then drum hits on every cutaway, faster each time
def beat(t0, g):
    m = secs(0.2); tt = np.arange(m) / SR; s = np.sin(2 * np.pi * 50 * tt) * np.exp(-tt * 26) + 0.3 * lp(rng.standard_normal(m), 200) * np.exp(-tt * 40)
    put(t0, s, g); put(t0 + 0.19, s, g * 0.7)
for k in np.arange(T["pov"] + 0.2, T["ecu"] - 0.2, 0.86): beat(k, 0.5)
def tom(t0, g, f=72):
    m = secs(0.5); tt = np.arange(m) / SR; s = np.sin(2 * np.pi * f * np.exp(-tt * 3) * tt * 1.0) * np.exp(-tt * 7) + 0.25 * bp(rng.standard_normal(m), 150, 900) * np.exp(-tt * 25)
    put(t0, s, g)
for i, c in enumerate([T["hhand"], T["tumble"], T["ohand"], T["heyes"], T["oeyes"], T["flash"]]): tom(c, 0.5 + i * 0.07, 70 + i * 3)

# the eye close-up: a fly, a breath, the creak of leather as he narrows his eyes
m = secs(0.9); tt = np.arange(m) / SR
fly = lp(np.sign(np.sin(2 * np.pi * (215 + 12 * np.sin(2 * np.pi * 7 * tt)) * tt)), 3000) * (0.5 + 0.5 * np.sin(2 * np.pi * 1.7 * tt)) * np.interp(tt, [0, 0.2, 0.7, 0.9], [0, 1, 1, 0])
put(T["ecu"], fly, 0.025, 0.5)
m = secs(0.7); put(T["ecu"] + 0.05, bp(rng.standard_normal(m), 300, 2200) * np.sin(np.linspace(0, np.pi, m)) ** 2, 0.05)
m = secs(0.4); cr = np.zeros(m)
for k in rng.integers(0, m - 200, 60): cr[k:k + 120] += rng.uniform(-1, 1) * np.exp(-np.arange(120) / 25)
put(T["ecu"] + 0.12, bp(cr, 400, 3000), 0.25)

# tumbleweed: a dry rolling scrape with a whoosh; spurs on the opponent's cutaway
m = secs(0.75); tt = np.arange(m) / SR
roll = bp(rng.standard_normal(m), 1500, 7000) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 6 * tt))) * np.sin(np.linspace(0, np.pi, m))
put(T["tumble"], roll, 0.16, -0.6); put(T["tumble"], lp(rng.standard_normal(m), 900) * np.sin(np.linspace(0, np.pi, m)) ** 2, 0.12, 0.4)
def jingle(t0):
    m = secs(0.35); tt = np.arange(m) / SR
    s = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) for f, d in [(2630, 14), (3710, 18), (5150, 22), (6880, 30)]) / 4
    put(t0, s, 0.16, 0.3)
jingle(T["ohand"] + 0.05); jingle(T["ohand"] + 0.22)

# the draw and the shot: cloth whoosh, crack + boom, echoes off the buildings into the black
m = secs(0.18); put(T["shot"] - 0.16, bp(rng.standard_normal(m), 500, 4000) * np.sin(np.linspace(0, np.pi, m)) ** 2, 0.25)
m = secs(2.6); tt = np.arange(m) / SR
gun = hp(rng.standard_normal(m), 1500) * np.exp(-tt * 90) * 1.4 + lp(rng.standard_normal(m), 400) * np.exp(-tt * 9) + np.sin(2 * np.pi * 58 * tt) * np.exp(-tt * 6) * 0.8
put(T["shot"], gun, 0.95)
for dly, g, f in [(0.19, 0.35, 2500), (0.43, 0.22, 1600), (0.78, 0.14, 1100), (1.2, 0.08, 800)]:
    put(T["shot"] + dly, lp(gun, f), g, (-0.4 if dly < 0.5 else 0.4))

# the reveal: a slow open chord (detuned saws, filtered), a chime when the line reaches him
m = secs(T["watch"] - T["reveal"]); tt = np.arange(m) / SR
pad = sum(sum(np.sign(np.sin(2 * np.pi * f * (1 + dt) * tt)) for dt in (-0.004, 0.0, 0.005)) for f in (164.81, 196.0, 246.94)) / 9
pad = lp(pad, 1400) * np.interp(tt, [0, 2.0, m / SR - 0.6, m / SR], [0, 1, 1, 0])
put(T["reveal"], pad, 0.07)
m = secs(2.0); tt = np.arange(m) / SR
put(T["line"], (np.sin(2 * np.pi * 1318.5 * tt) + 0.6 * np.sin(2 * np.pi * 1975.5 * tt)) * np.exp(-tt * 2.2), 0.07)

# the table: a warm low drone; the title lands on a deep hit, a shimmer and a falling three-note pluck
m = secs(END - T["watch"]); tt = np.arange(m) / SR
drone = (np.sin(2 * np.pi * 41.2 * tt) + 0.35 * np.sin(2 * np.pi * 82.4 * tt)) * np.interp(tt, [0, 1.0, m / SR - 0.7, m / SR], [0, 1, 1, 0])
put(T["watch"], drone, 0.12)
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
