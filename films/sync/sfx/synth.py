#!/usr/bin/env python3
"""Synthesize the sound effects for 《没有指挥》 from out/sfx_events.json and mix them under the music.

    npx tsx sfx/events.ts && python3 sfx/synth.py

Every sound is made here from noise and sine waves (no samples, no licences): claps, metronome and
clock ticks, heartbeats, footsteps, the bridge's low creak, two blink whooshes and a quiet night bed
(crickets, water). Writes out/sfx.wav (effects alone, for review) and out/mix_sfx.wav (music + effects),
which scenes.json points finish.py at.
"""
import json, subprocess
import numpy as np

SR = 48000
DUR = 164.5
N = int(SR * DUR)
rng = np.random.default_rng(7)
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


# ---- one-shot banks
clap_bank = [norm(band(rng.standard_normal(int(0.06 * SR)), 700 + 300 * k, 2600 + 200 * k) * env(int(0.06 * SR), 0.009)) for k in range(8)]


def tick(f0, n_s=0.03, tau=0.004, wood=0.35):
    n = int(n_s * SR)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * f0 * t) + 0.5 * np.sin(2 * np.pi * f0 * 2.7 * t)
    click = band(rng.standard_normal(n), 1500, 9000) * wood
    return norm((tone + click) * env(n, tau))


met_bank = [tick(2100 + 60 * k, tau=0.0035) for k in range(6)]
clock_tick = [tick(1150, 0.05, 0.007, 0.6), tick(1380, 0.05, 0.007, 0.6)]


def thump(f0, f1, n_s, tau):
    n = int(n_s * SR)
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / 0.03)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return norm(np.sin(ph) * env(n, tau, 0.004))


lub = thump(75, 48, 0.25, 0.07)
dub = thump(95, 60, 0.2, 0.05)
step_bank = [norm(band(rng.standard_normal(int(0.09 * SR)), 60, 420) * env(int(0.09 * SR), 0.025, 0.003)) for _ in range(6)]

# ---- place events
for t, g, p in ev['claps']:
    place(clap_bank[rng.integers(8)], t + rng.normal(0, 0.003), 0.19 * g * (0.7 + 0.6 * rng.random()), p * 0.8)
for t, g, p in ev['met']:
    place(met_bank[rng.integers(6)], t, 0.5 * g * (0.8 + 0.4 * rng.random()), p * 0.7)
for t, g, p in ev['clock']:
    place(clock_tick[0 if p < 0 else 1], t, 1.0 * g, p)
hb = ev['heart']
for k, (t, g, p) in enumerate(hb):
    place(lub if k % 2 == 0 else dub, t, 1.2 * g, 0)
for t, g, p in ev['steps']:
    place(step_bank[rng.integers(6)], t, 0.5 * g, p)
for t in ev['whoosh']:
    n = int(0.42 * SR)
    w = band(rng.standard_normal(n), 400, 3500) * np.hanning(n).astype(np.float32) ** 2
    place(norm(w), t - 0.2, 0.16, 0)

# ---- continuous beds
# the bridge's creak: low rumble swaying at ~0.95 Hz, level following the sway
cr = np.array(ev['creak'])
if len(cr):
    t0, t1 = cr[0, 0], cr[-1, 0]
    i0, i1 = int(t0 * SR), int(t1 * SR)
    t = np.arange(i1 - i0) / SR + t0
    lvl = np.interp(t, cr[:, 0], cr[:, 1]).astype(np.float32)
    rumble = norm(band(rng.standard_normal(i1 - i0), 35, 160))
    groan = norm(band(rng.standard_normal(i1 - i0), 180, 520))
    sway = np.abs(np.sin(np.pi * t * 0.95)).astype(np.float32)
    s = (0.5 * rumble + 0.18 * groan * sway) * (lvl ** 1.3) * (0.4 + 0.6 * sway)
    L[i0:i1] += 1.1 * s
    R[i0:i1] += 1.1 * s
# night: crickets (chirps of 4.4–4.9 kHz) and slow water
for a, z in ev['night']:
    i0, i1 = int(a * SR), int(min(z, DUR) * SR)
    n = i1 - i0
    fade = np.minimum(1, np.minimum(np.arange(n), n - np.arange(n)) / (0.8 * SR)).astype(np.float32)
    water = norm(band(rng.standard_normal(n), 80, 900)) * (0.6 + 0.4 * np.sin(np.arange(n) / SR * 0.7)) * 0.13
    L[i0:i1] += water * fade
    R[i0:i1] += water[::-1] * fade
    for c in range(5):
        f = 4400 + 120 * c
        period = 0.55 + 0.17 * c
        pan = -0.8 + 0.4 * c
        t = a + rng.random() * period
        while t < z - 0.3:
            for k in range(3):
                m = int(0.018 * SR)
                tt = np.arange(m) / SR
                chirp = np.sin(2 * np.pi * f * tt) * np.hanning(m)
                place(chirp.astype(np.float32), t + k * 0.03, 0.045, pan)
            t += period * (0.9 + 0.2 * rng.random())

sfx = np.stack([L, R], 1)
peak = np.abs(sfx).max()
print('sfx peak', round(float(peak), 3))
# music, decoded to the same rate
music = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', 'public/bgm.mp3', '-t', str(DUR), '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).reshape(-1, 2)
M = np.zeros((N, 2), np.float32)
M[: len(music)] = music[:N]
rm = np.sqrt(np.mean(M ** 2))
rs = np.sqrt(np.mean(sfx[np.abs(sfx).sum(1) > 1e-4] ** 2))
print('music rms', round(float(rm), 4), 'sfx rms (active)', round(float(rs), 4))
beats = json.load(open('src/music.json'))['beats']
for name, a, z in [('S1 claps', 1, 31), ('S2 night', 39, 64), ('S4 clocks', 96, 128), ('S5 metro', 136, 161), ('S6 metro', 161, 177), ('S7 heart', 189, 209), ('S8 bridge', 217, 241), ('S9 claps', 241, 273)]:
    i, j = int(beats[a] * SR), int(beats[z] * SR)
    d = 20 * np.log10((np.sqrt(np.mean(sfx[i:j] ** 2)) + 1e-9) / (np.sqrt(np.mean(M[i:j] ** 2)) + 1e-9))
    print(f'  {name:10s} effects vs music {d:6.1f} dB')
# soft-limit the effects' transient peaks (a clap pile or a heartbeat) so they never force the whole mix
# down, then a gentle tanh on the sum keeps it under full scale without pumping the music
sfx = 0.55 * np.tanh(sfx / 0.55)
mix = M + sfx
mix = 0.98 * np.tanh(mix / 0.98)


def write(path, x):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', path], input=x.astype(np.float32).tobytes(), check=True)


write('out/sfx.wav', sfx / max(1.0, peak / 0.98))
write('out/mix_sfx.wav', mix)
print('wrote out/sfx.wav, out/mix_sfx.wav')
