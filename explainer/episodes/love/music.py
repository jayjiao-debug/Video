"""《同一个中心》: a small synthesized score (pad, bell arpeggio, a late melody, a soft bass).
72 bpm, one bar = 3.333 s; the film's events sit on bar lines:
  bar 3 (10.0 s) the bells come in · bar 8 (26.67 s) the orbits cross · bar 12 (40.0 s) the quarrel ·
  bar 13 (43.33 s) the pull back · bar 14 (46.67 s) the long exposure, melody · bar 19 (63.33 s) last chord.
  python3 episodes/love/music.py public/build/love/love.wav
"""
import sys
import numpy as np
from scipy.signal import fftconvolve

SR = 44100
BPM = 72
BEAT = 60 / BPM
BAR = 4 * BEAT
TOTAL = 68.0
N = int(TOTAL * SR)
rng = np.random.default_rng(7)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# chords as MIDI notes (pad voicing around C4)
C = {
    'F': [53, 57, 60, 64], 'Em': [52, 55, 59, 62], 'Dm': [50, 53, 57, 60], 'C': [48, 52, 55, 59],
    'G': [55, 59, 62, 65], 'Am': [57, 60, 64, 71], 'Gs': [55, 60, 62, 65],
}
BARS = ['F', 'Em', 'Dm', 'C', 'F', 'Em', 'Dm', 'Gs', 'F', 'Em', 'Dm', 'C', 'Am', 'Gs', 'F', 'Em', 'Dm', 'C', 'F', 'C']
ROOT = {'F': 41, 'Em': 40, 'Dm': 38, 'C': 36, 'G': 43, 'Am': 45, 'Gs': 43}

L = np.zeros(N)
R = np.zeros(N)


def add(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    L[i:i + len(sig)] += sig * gain * np.sqrt(0.5 * (1 - pan))
    R[i:i + len(sig)] += sig * gain * np.sqrt(0.5 * (1 + pan))


def env_adsr(n, a, r, sr=SR):
    e = np.ones(n)
    na, nr = int(a * sr), int(r * sr)
    e[:na] = np.linspace(0, 1, na) ** 2
    e[-nr:] *= np.linspace(1, 0, nr) ** 1.5
    return e


def pad_note(m, dur, detune=0.004):
    n = int((dur + 1.6) * SR)
    t = np.arange(n) / SR
    f = hz(m)
    s = sum(np.sin(2 * np.pi * f * (1 + d) * t + p) for d, p in [(-detune, 0.3), (0, 1.1), (detune, 2.0)])
    s += 0.15 * np.sin(2 * np.pi * 2 * f * t)
    s *= 1 + 0.06 * np.sin(2 * np.pi * 0.23 * t)
    return s / 3 * env_adsr(n, 1.4, 1.8)


def bell(m, dur=2.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(m)
    s = np.zeros(n)
    for ratio, amp, dec in [(1, 1, 1.6), (2, 0.35, 2.6), (3.01, 0.16, 4.0), (4.2, 0.07, 6.0)]:
        s += amp * np.sin(2 * np.pi * f * ratio * t) * np.exp(-dec * t)
    att = np.minimum(1, t / 0.006)
    tail = np.minimum(1, (dur - t) / 0.25)
    return s * att * tail


def bass(m, dur):
    n = int((dur + 1.0) * SR)
    t = np.arange(n) / SR
    f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    tail = np.minimum(1, (n / SR - t) / 0.4)
    return s * np.exp(-0.7 * t) * np.minimum(1, t / 0.02) * tail


# ---------------------------------------------------------------- pad, the whole film
for b, ch in enumerate(BARS):
    t0 = b * BAR
    g = 0.11 if b != 12 else 0.08
    if b >= 18:
        g = 0.12
    for k, m in enumerate(C[ch]):
        dur = BAR if b < len(BARS) - 1 else 4.6
        add(pad_note(m, dur), t0, g, pan=(-0.4, 0.4, -0.2, 0.2)[k])

# ---------------------------------------------------------------- bell arpeggio (bars 3–11, 13–18)
for b, ch in enumerate(BARS):
    if not (3 <= b <= 11 or 13 <= b <= 18):
        continue
    notes = [m + 12 for m in C[ch]]
    pattern = [0, 1, 2, 3, 2, 1, 2, 3] if b < 14 else [0, 2, 1, 3, 2, 3, 1, 2]
    for i, k in enumerate(pattern):
        t0 = b * BAR + i * BEAT / 2
        vel = (0.55 if i % 2 == 0 else 0.38) * (0.8 if b < 8 else 1.0)
        add(bell(notes[k]), t0 + rng.normal(0, 0.006), 0.08 * vel, pan=((i % 4) - 1.5) * 0.25)

# ---------------------------------------------------------------- bass (bars 8–11, 14–19)
for b, ch in enumerate(BARS):
    if 8 <= b <= 11 or b >= 14:
        add(bass(ROOT[ch], BAR), b * BAR, 0.16)
        add(bass(ROOT[ch] + 7, BEAT), b * BAR + 2 * BEAT, 0.07)

# ---------------------------------------------------------------- melody (bars 14–18)
MEL = [(14, 0, 69, 1.5), (14, 1.5, 72, 0.5), (14, 2, 76, 2), (15, 0, 74, 1.5), (15, 1.5, 71, 0.5), (15, 2, 67, 2),
       (16, 0, 65, 1), (16, 1, 69, 1), (16, 2, 72, 2), (17, 0, 71, 1), (17, 1, 72, 1), (17, 2, 76, 2), (18, 0, 77, 2), (18, 2, 76, 2),
       (19, 0, 72, 4)]
for b, beat, m, d in MEL:
    pn = pad_note(m, d * BEAT, 0.002)
    s = bell(m, 3.5) * 0.9
    k = min(len(s), len(pn))
    s[:k] += 0.35 * pn[:k]
    add(s, b * BAR + beat * BEAT, 0.11, pan=0.05)

# ---------------------------------------------------------------- the crossing (bar 8): a swell into a low bloom
cross = 8 * BAR
n = int(1.6 * SR)
sw = rng.normal(0, 1, n)
sw = np.convolve(sw, np.ones(40) / 40, mode='same') * np.linspace(0, 1, n) ** 3
add(sw, cross - 1.6, 0.05)
nb = int(4 * SR)
tb = np.arange(nb) / SR
boom = np.sin(2 * np.pi * 55 * tb) * np.exp(-1.2 * tb) * np.minimum(1, tb / 0.01)
add(boom, cross, 0.28)
add(bell(88, 4.0), cross, 0.05, pan=0.3)
add(bell(81, 4.0), cross + 0.02, 0.05, pan=-0.3)

# the pull back (bar 13): a softer bloom
add(boom, 13 * BAR, 0.16)

# ---------------------------------------------------------------- reverb, master
ir_n = int(3.2 * SR)
ti = np.arange(ir_n) / SR
irL = rng.normal(0, 1, ir_n) * np.exp(-ti * 6.9 / 2.8)
irR = rng.normal(0, 1, ir_n) * np.exp(-ti * 6.9 / 2.8)
for ir in (irL, irR):
    ir[:] = np.convolve(ir, np.ones(6) / 6, mode='same')
    ir /= np.sqrt(np.sum(ir ** 2))
wetL = fftconvolve(L, irL)[:N]
wetR = fftconvolve(R, irR)[:N]
outL = 0.75 * L + 0.42 * wetL
outR = 0.75 * R + 0.42 * wetR
fade = np.ones(N)
fs = int(66.0 * SR)
fade[fs:] = np.linspace(1, 0, N - fs) ** 2
fade[: int(0.5 * SR)] = np.linspace(0, 1, int(0.5 * SR))
out = np.stack([outL * fade, outR * fade], axis=1)
out /= np.max(np.abs(out)) * 1.12

import wave
with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'love.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((out * 32767).astype('<i2').tobytes())
print('wrote', TOTAL, 's')
