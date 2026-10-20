"""Sound design for 《妈，是我》 v2, synthesized in code (no samples, no AI): phone vibration, a soft ringtone,
taps, whooshes, stamps, paper, key ticks, a heartbeat, the Chinese busy tone, DTMF for 1-1-0.
Writes public/sfx.wav and public/mix.wav (bgm + sfx, loudness-normalised later by ffmpeg)."""
import numpy as np, subprocess, sys
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 44100; LEN = 118.0
out = np.zeros(int(SR * LEN))
rng = np.random.default_rng(7)
def at(t): return int(t * SR)
def add(t, sig, gain=1.0):
    i = at(t); j = min(len(out), i + len(sig)); out[i:j] += sig[: j - i] * gain
def env(n, a=0.005, r=0.1):
    e = np.ones(n); na = max(1, int(a * SR)); nr = max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def bp(x, lo, hi, order=4): return sosfilt(butter(order, [lo, hi], btype='band', fs=SR, output='sos'), x)
def lp(x, f, order=4): return sosfilt(butter(order, f, btype='low', fs=SR, output='sos'), x)
def tone(f, d, a=0.005, r=0.05):
    t = np.arange(int(d * SR)) / SR; return np.sin(2 * np.pi * f * t) * env(len(t), a, r)

def vibrate(t0, dur):
    t = t0
    while t < t0 + dur:
        n = int(0.75 * SR); tt = np.arange(n) / SR
        sig = np.sign(np.sin(2 * np.pi * 165 * tt)) * (0.6 + 0.4 * np.sin(2 * np.pi * 24 * tt))
        sig = lp(sig, 900) * env(n, 0.02, 0.05)
        add(t, sig, 0.10); t += 1.25
def ringtone(t0, dur, base=1046.5):
    notes = [1, 1.26, 1.5, 2.0]; t = t0
    while t < t0 + dur:
        for k, m in enumerate(notes):
            d = 0.5; tt = np.arange(int(d * SR)) / SR
            s = (np.sin(2 * np.pi * base * m * tt) + 0.3 * np.sin(2 * np.pi * base * m * 3 * tt)) * np.exp(-tt * 9)
            add(t + k * 0.14, s, 0.05)
        t += 1.2
def click(t, g=0.18):
    n = int(0.03 * SR); s = bp(rng.standard_normal(n), 2000, 7000) * np.exp(-np.arange(n) / SR * 160); add(t, s, g)
def whoosh(t, d=0.42, g=0.16):
    n = int(d * SR); x = rng.standard_normal(n); tt = np.arange(n) / SR
    y = np.zeros(n); seg = 8
    for k in range(seg):  # a moving band
        a, b = k * n // seg, (k + 1) * n // seg; f = 400 + 3000 * (k / seg)
        y[a:b] = bp(x, f, f * 1.8)[a:b]
    add(t - d / 2, y * np.sin(np.pi * tt / d) ** 2, g)
def thump(t, g=0.5, f=58):
    n = int(0.35 * SR); tt = np.arange(n) / SR; s = np.sin(2 * np.pi * f * tt * (1 - 0.3 * tt)) * np.exp(-tt * 14)
    s += bp(rng.standard_normal(n), 300, 2500) * np.exp(-tt * 60) * 0.5; add(t, s, g)
def paper(t, g=0.12):
    n = int(0.18 * SR); tt = np.arange(n) / SR; s = bp(rng.standard_normal(n), 1500, 6000) * np.exp(-tt * 25); add(t, s, g)
def tick(t, g=0.12):
    n = int(0.04 * SR); tt = np.arange(n) / SR; s = (np.sin(2 * np.pi * 2200 * tt) + bp(rng.standard_normal(n), 3000, 8000)) * np.exp(-tt * 120); add(t, s, g)
def heartbeat(t0, t1):
    t = t0
    while t < t1:
        for dt, a in ((0, 0.5), (0.22, 0.32)):
            n = int(0.25 * SR); tt = np.arange(n) / SR; s = np.sin(2 * np.pi * 48 * tt) * np.exp(-tt * 18); add(t + dt, lp(s, 200), a)
        t += 0.95
def busy(t0, n=3):
    for k in range(n): add(t0 + k * 0.7, tone(425, 0.35, 0.01, 0.02), 0.07)
def dtmf(t, lo, hi):
    tt = np.arange(int(0.16 * SR)) / SR; s = (np.sin(2 * np.pi * lo * tt) + np.sin(2 * np.pi * hi * tt)) * env(len(tt), 0.005, 0.02); add(t, s, 0.05)
def blip_down(t):
    tt = np.arange(int(0.4 * SR)) / SR; f = 900 - 600 * tt / 0.4; s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 6); add(t, s, 0.08)
def crackle(t0, d):
    n = int(d * SR); x = rng.standard_normal(n) * (rng.random(n) < 0.02); add(t0, bp(x, 800, 5000), 0.5)

# ---- the score of effects (seconds match Film2.tsx)
vibrate(0.35, 2.9); ringtone(0.4, 2.9)
click(3.39)
heartbeat(12.7, 16.2)
for k, dt in enumerate([0, 0.509, 0.763, 1.018]): thump(16.613 + dt, 0.28 if k else 0.45)
for t in [20.6, 33.4, 37.7, 44.5, 47.6, 55.2, 59.1, 72.0, 78.3, 85.4, 90.1, 94.4, 101.57, 105.64]: whoosh(t)
thump(30.3, 0.55); thump(80.8, 0.55)
vibrate(37.85, 0.7); vibrate(41.0, 0.7); click(37.9, 0.1); click(41.05, 0.1)
for i in range(4): paper(48.0 + i * 0.3, 0.06)
vibrate(55.3, 3.6); ringtone(55.35, 3.5, 880)
for i in range(6): paper(59.15 + i * 0.254)
click(64.1, 0.12); click(68.2, 0.14); click(69.2, 0.1)
for i in range(6): tick(75.1 + i * 0.45)
busy(82.45)
add(85.6, tone(450, 1.0, 0.01, 0.05), 0.05)
click(88.0, 0.12)
blip_down(90.4); click(91.5, 0.2)
dtmf(92.8, 697, 1209); dtmf(93.1, 697, 1209); dtmf(93.4, 941, 1336)
vibrate(94.5, 5.3); ringtone(94.55, 5.3, 784)
click(100.0)
crackle(103.1, 0.6)

out = np.clip(out, -1, 1)
st = np.stack([out, out], 1)
wavfile.write('public/sfx.wav', SR, (st * 32767).astype(np.int16))
# mix: bgm + sfx, then loudness-normalise the mix to -14 LUFS
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'public/bgm.mp3', '-i', 'public/sfx.wav', '-filter_complex',
                '[0:a]atrim=0:118,asetpts=N/SR/TB,aresample=44100[b];[b][1:a]amix=inputs=2:weights=1\\ 1.8:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11[m]',
                '-map', '[m]', '-ar', '44100', 'public/mix.wav'], check=True)
print('ok')
