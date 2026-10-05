#!/usr/bin/env python3
"""Synthesize the sound effects for 《心流》 from out/sfx_events.json and mix them under the music.

    npx tsx sfx/events.ts && python3 sfx/synth.py

Every sound is made here from noise and sine waves (no samples, no licences): clock ticks, pager
beeps, the improvised piano notes, tennis hits and chess clicks. Writes out/sfx.wav (effects alone,
for review) and out/mix_sfx.wav (music + effects), which scenes.json points finish.py at.
"""
import json, subprocess
import numpy as np

SR = 48000
DUR = 164.5
N = int(SR * DUR)
rng = np.random.default_rng(11)
ev = json.load(open('out/sfx_events.json'))
L = np.zeros(N, np.float32)
R = np.zeros(N, np.float32)


def band(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    w = np.clip((f - lo * 0.7) / (lo * 0.3 + 1e-9), 0, 1) * np.clip((hi * 1.3 - f) / (hi * 0.3), 0, 1)
    return np.fft.irfft(X * w, len(x)).astype(np.float32)


def place(s, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i + len(s) <= 0:
        return
    j = min(N, i + len(s))
    seg = s[: j - i] * gain
    a = (pan + 1) * np.pi / 4
    L[i:j] += seg * np.cos(a)
    R[i:j] += seg * np.sin(a)


def env(n, tau, attack=0.0015):
    t = np.arange(n) / SR
    return (np.minimum(1, t / attack) * np.exp(-t / tau)).astype(np.float32)


def norm(s):
    return s / (np.abs(s).max() + 1e-9)


def tick(f0, n_s=0.03, tau=0.004, wood=0.35):
    n = int(n_s * SR)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * f0 * t) + 0.5 * np.sin(2 * np.pi * f0 * 2.7 * t)
    click = band(rng.standard_normal(n), 1500, 9000) * wood
    return norm((tone + click) * env(n, tau))


# ---- banks
clock_tick = [tick(1150, 0.05, 0.007, 0.6), tick(1380, 0.05, 0.007, 0.6)]


def beep(f0):
    # a pager blip: a short pure tone with soft edges
    n = int(0.045 * SR)
    t = np.arange(n) / SR
    e = np.minimum(1, np.minimum(t / 0.003, (t[-1] - t) / 0.008))
    return norm(np.sin(2 * np.pi * f0 * t) * e).astype(np.float32)


beep_bank = [beep(2650 + 70 * k) for k in range(5)]


def piano(k):
    # a soft electric-piano note: a few decaying partials, key 0 = C4 on a C major pentatonic-ish row
    scale = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28]
    f0 = 261.63 * 2 ** (scale[k % len(scale)] / 12)
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * f0 * m * t) * np.exp(-t * (1.6 + 1.4 * m)) for m, a in [(1, 1), (2, 0.35), (3, 0.12), (4, 0.05)])
    return norm(s * np.minimum(1, t / 0.004)).astype(np.float32)


def thump(f0, f1, n_s, tau):
    n = int(n_s * SR)
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / 0.03)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return norm(np.sin(ph) * env(n, tau, 0.002))


def racket():
    n = int(0.12 * SR)
    pop = thump(420, 180, 0.12, 0.018)
    crack = band(rng.standard_normal(n), 1200, 6000) * env(n, 0.006)
    return norm(pop + 0.6 * crack)


hit_bank = [racket() for _ in range(4)]


def chess():
    # wood on wood: a short knock with a mid resonance
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * 820 * t) * np.exp(-t / 0.012) + 0.6 * np.sin(2 * np.pi * 1530 * t) * np.exp(-t / 0.008)
    knock = band(rng.standard_normal(n), 300, 3000) * env(n, 0.006)
    return norm(body + 0.8 * knock)


click_bank = [chess() for _ in range(3)]

# ---- place events
for t, g, p in ev['ticks']:
    place(clock_tick[int(t * 10) % 2], t, (0.55 if t < 100 else 0.85) * g, p)
# 560 beeps in 12 s: every 8th is a clear blip, the rest a quiet swarm under it
for k, (t, g, p) in enumerate(ev['beeps']):
    loud = k % 8 == 0
    place(beep_bank[rng.integers(5)], t, (0.28 if loud else 0.05) * g * (0.8 + 0.4 * rng.random()), p * 0.8)
for t, k in ev['notes']:
    place(piano(int(k)), t, 0.32, (k - 6) / 12)
for t, g, p in ev['hits']:
    place(hit_bank[rng.integers(4)], t, 1.0 * g, p)
for t, g, p in ev['clicks']:
    place(click_bank[rng.integers(3)], t, 0.75 * g, p)

sfx = np.stack([L, R], 1)
peak = np.abs(sfx).max()
print('sfx peak', round(float(peak), 3))
music = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', 'public/bgm.mp3', '-t', str(DUR), '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).reshape(-1, 2)
M = np.zeros((N, 2), np.float32)
M[: len(music)] = music[:N]
beats = json.load(open('src/music.json'))['beats']
for name, a, z in [('S1 clock', 1, 31), ('S5 beeps', 136, 160), ('S7 piano', 186, 209), ('S9 tennis', 241, 257), ('S9 chess', 258, 272), ('S10 clock', 273, 305)]:
    i, j = int(beats[a] * SR), int(beats[z] * SR)
    d = 20 * np.log10((np.sqrt(np.mean(sfx[i:j] ** 2)) + 1e-9) / (np.sqrt(np.mean(M[i:j] ** 2)) + 1e-9))
    print(f'  {name:10s} effects vs music {d:6.1f} dB')
sfx = 0.55 * np.tanh(sfx / 0.55)
mix = 0.98 * np.tanh((M + sfx) / 0.98)


def write(path, x):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', path], input=x.astype(np.float32).tobytes(), check=True)


write('out/sfx.wav', sfx / max(1.0, peak / 0.98))
write('out/mix_sfx.wav', mix)
print('wrote out/sfx.wav, out/mix_sfx.wav')
