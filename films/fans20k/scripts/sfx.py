"""Code-synthesized SFX for the demo: paper unroll, whoosh, tape zip, cassette clack, PLAY clunk, then a faint tape hiss + motor hum."""
import numpy as np, wave
SR = 48000; L = 59.4; y = np.zeros(int(SR * L))
rng = np.random.default_rng(3)
def at(t, sig, g=1.0):
    i = int(t * SR); n = min(len(sig), len(y) - i); y[i:i + n] += g * sig[:n]
def noise(d): return rng.standard_normal(int(SR * d))
def env(n, a, r): t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-np.maximum(0, t - a) / r)
def lowpass(x, k):
    out = np.copy(x); 
    for i in range(1, len(x)): out[i] = out[i - 1] + k * (x[i] - out[i - 1])
    return out
# paper unroll: crinkly band-limited noise with a rising sweep 0–1.1 s
n = noise(1.2); c = lowpass(n, 0.25) - lowpass(n, 0.02); c *= np.sin(np.linspace(0, np.pi, len(c))) ** 0.5 * (0.6 + 0.4 * (rng.random(len(c)) > 0.97)); at(0.0, c, 0.5)
# fast scroll ticks 0.8–2.4 s, accelerating
t = 0.8; k = 0
while t < 2.4: at(t, noise(0.01) * env(480, 0.001, 0.004), 0.25); t += max(0.03, 0.16 - k * 0.012); k += 1
# whoosh 2.4–2.95
n = noise(0.6); w = lowpass(n, 0.08) * np.sin(np.linspace(0, np.pi, len(n))) ** 2; at(2.4, w, 1.6)
# tape zip 2.85–3.4: buzzing saw rising in pitch
d = 0.55; tt = np.arange(int(SR * d)) / SR; f = 90 + 500 * tt / d; ph = 2 * np.pi * np.cumsum(f) / SR; z = ((ph / (2 * np.pi)) % 1 - 0.5) * np.sin(np.pi * tt / d); at(2.85, lowpass(z, 0.3), 0.6)
# cassette clack 3.8 and PLAY clunk 3.95
for tc, g in ((3.78, 0.9), (3.95, 1.2)):
    n = noise(0.12) * env(int(SR * 0.12), 0.0005, 0.02); thump = np.sin(2 * np.pi * 70 * np.arange(len(n)) / SR) * env(len(n), 0.001, 0.05); at(tc, lowpass(n, 0.5) + 0.8 * thump, g)
# tape hiss + motor hum from PLAY on
tt = np.arange(int(SR * (L - 4.0))) / SR; hiss = lowpass(noise(L - 4.0), 0.6) * 0.03; hum = 0.012 * np.sin(2 * np.pi * 50 * tt) + 0.006 * np.sin(2 * np.pi * 100 * tt)
fade = np.minimum(1, tt / 0.3) * np.minimum(1, (L - 4.0 - tt) / 0.8); at(4.0, (hiss + hum) * fade, 1)
y = 0.8 * y / np.abs(y).max()
st = np.stack([y, y], 1)
with wave.open('out/sfx.wav', 'wb') as f: f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((st * 32767).astype(np.int16).tobytes())
print('ok')
