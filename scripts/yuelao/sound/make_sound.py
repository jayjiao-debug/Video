#!/usr/bin/env python3
"""The music, room tones and effects of 采访月老的一天, all made in code (numpy; no samples, nothing downloaded).
  make_sound.py <clips_dir>
Music (D major pentatonic, plucked strings like a small zheng, a woodblock):
  mus_office  100 bpm, 8 bars: the bureau's busy little tune (scenes A to D)
  mus_city     92 bpm, 8 bars: the same tune thinner, marimba-like (E, F)
  mus_night    slow pad and a few notes (G)
  mus_tender   60 bpm: the tune slow over a warm pad (from the middle of H to I03)
  mus_warm     76 bpm: the tune full, pad and plucks, ends on a long D (I04 to the end)
Room tones: amb_office, amb_work, amb_street. Effects: sfx_* (stamp, pop, snap, twang, whoosh, sparkle, ding, boing, beep).
Mono 48 kHz mp3, each normalised to -1 dBFS peak; levels are the cues' static gains."""
import sys, os, subprocess
import numpy as np
SR = 48000
rng = np.random.default_rng(7)
PENTA = [62, 64, 66, 69, 71]                      # D E F# A B (midi)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
deg = lambda d: PENTA[d % 5] + 12 * (d // 5)      # scale degree -> midi

def pluck(f, dur, bright=0.5, seed=0):
    """Karplus-Strong string"""
    n = int(dur * SR); N = max(2, int(SR / f)); r = np.random.default_rng(seed)
    buf = r.uniform(-1, 1, N); k = np.ones(3) / 3
    for _ in range(int(2 + 6 * (1 - bright))): buf = np.convolve(np.r_[buf[-1], buf, buf[0]], k, "valid")
    out = np.empty(n); decay = 0.996 - 0.002 * (f / 800)
    for i in range(0, n, N):
        m = min(N, n - i); out[i:i + m] = buf[:m]
        buf = decay * 0.5 * (buf + np.roll(buf, 1))
    t = np.arange(n) / SR
    return out * np.minimum(1, t / 0.002) * np.exp(-t * 1.2)

def mallet(f, dur):
    t = np.arange(int(dur * SR)) / SR
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 18)) * np.exp(-t * 6) * np.minimum(1, t / 0.003)

def pad(f, dur, tail=1.5):
    n = int((dur + tail) * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for det in (-0.004, 0, 0.005):
        for hN, a in ((1, 1), (2, 0.35), (3, 0.12)): y += a * np.sin(2 * np.pi * f * (1 + det) * hN * t + rng.uniform(0, 6))
    env = np.minimum(1, t / 0.9) * np.clip((dur + tail - t) / tail, 0, 1) ** 1.5
    return y * env

def block(dur=0.08, f=1100):
    t = np.arange(int(dur * SR)) / SR
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 60)

def add(y, x, at, g=1.0):
    i = int(at * SR)
    if i >= len(y): return
    m = min(len(x), len(y) - i); y[i:i + m] += g * x[:m]

def noise(n, lo, hi):
    X = np.fft.rfft(rng.standard_normal(n)); fr = np.fft.rfftfreq(n, 1 / SR)
    X *= (fr > lo) * (fr < hi) / np.maximum(fr, 20) ** 0.5
    return np.fft.irfft(X, n)

# the tune: (beat, degree, length in beats); 4/4, 8 bars
TUNE = [(0, 5, 1), (1, 7, .5), (1.5, 8, .5), (2, 9, 1), (3, 8, 1), (4, 7, 1), (5, 5, .5), (5.5, 4, .5), (6, 3, 2),
        (8, 5, 1), (9, 7, .5), (9.5, 8, .5), (10, 9, 1), (11, 10, 1), (12, 9, .5), (12.5, 8, .5), (13, 7, 1), (14, 5, 2),
        (16, 8, 1), (17, 8, .5), (17.5, 9, .5), (18, 10, 1), (19, 9, 1), (20, 8, 1), (21, 7, .5), (21.5, 5, .5), (22, 4, 2),
        (24, 3, 1), (25, 4, .5), (25.5, 5, .5), (26, 7, 1), (27, 5, 1), (28, 4, .5), (28.5, 3, .5), (29, 4, 1), (30, 5, 2)]
BASS = [0, 0, 3, 3, -2, -2, 2, 0]                 # one per bar (degrees, low octave): D D A A B B F# D
CHORD = [[0, 2, 3], [0, 2, 3], [3, 5, 7], [3, 5, 7], [-1, 0, 2], [-1, 0, 2], [1, 3, 5], [0, 2, 3]]

def tune(bpm, voice, bass=True, blocks=True, padK=0.0, bars=8, end_long=False, seed=1):
    b = 60 / bpm; n = int((bars * 4 * b + (5 if end_long else 0.01)) * SR); y = np.zeros(n)
    for i, (bt, d, ln) in enumerate(TUNE):
        f = hz(deg(d))
        add(y, voice(f, max(0.5, ln * b * 2.2)) if voice is not pluck else pluck(f, max(0.6, ln * b * 2.4), 0.6, seed + i), bt * b, 0.9)
    for bar in range(bars):
        if bass:
            for k in (0, 2): add(y, pluck(hz(deg(BASS[bar]) - 24), b * 1.8, 0.2, 90 + bar), (bar * 4 + k) * b, 0.8)
        if blocks:
            for k in (1, 3): add(y, block(), (bar * 4 + k) * b, 0.16)
            add(y, block(0.05, 1500), (bar * 4 + 3.5) * b, 0.1)
        if padK:
            for d in CHORD[bar]: add(y, pad(hz(deg(d) - 12), 4 * b), bar * 4 * b, padK * 0.16)
    if end_long:
        for d in (0, 2, 3, 5): add(y, pluck(hz(deg(d)), 4.5, 0.5, 300 + d), bars * 4 * b + 0.04 * d, 0.7)
        add(y, pad(hz(50), 3.0, 2.0), bars * 4 * b, 0.3)
    return y

def night():
    b = 1.0; n = int(32 * SR); y = np.zeros(n)
    for bar, ch in enumerate([[0, 2, 3], [-1, 0, 2], [3, 5, 7], [0, 2, 3]] * 2):
        for d in ch: add(y, pad(hz(deg(d) - 12), 4 * b), bar * 4 * b, 0.2)
        add(y, mallet(hz(deg(ch[2] + 5)), 2.5), bar * 4 * b + 1.0, 0.25); add(y, mallet(hz(deg(ch[1] + 5)), 2.5), bar * 4 * b + 2.5, 0.18)
    return y

def stamp():
    n = int(0.5 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (70 + 60 * np.exp(-t * 30)) * t) * np.exp(-t * 14) + 0.5 * noise(n, 300, 5000) / 0.02 * np.exp(-t * 45) * 0.02

def pop():
    n = int(0.16 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (500 + 900 * t / 0.16) * t) * np.exp(-t * 28)

def snap():
    n = int(0.35 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (1800 * np.exp(-t * 9) + 300) * t) * np.exp(-t * 16) + 0.6 * rng.standard_normal(n) * np.exp(-t * 220)

def twang():
    n = int(0.7 * SR); t = np.arange(n) / SR
    return pluck(330, 0.7, 0.8, 5) * 0.8 + 0.5 * np.sin(2 * np.pi * (330 + 500 * np.minimum(t / 0.25, 1)) * t) * np.exp(-t * 7)

def whoosh():
    n = int(0.5 * SR); t = np.arange(n) / SR; x = noise(n, 200, 9000)
    return x / np.abs(x).max() * np.sin(np.pi * t / 0.5) ** 2

def sparkle():
    n = int(1.6 * SR); y = np.zeros(n)
    for i, d in enumerate([5, 7, 8, 10, 12, 13]): add(y, mallet(hz(deg(d) + 12), 1.2), 0.07 * i, 0.6)
    return y

def ding():
    return mallet(hz(86), 1.0) + 0.6 * mallet(hz(93), 1.0)

def boing():
    n = int(0.6 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (220 - 110 * t / 0.6 + 14 * np.sin(2 * np.pi * 9 * t)) * t) * np.exp(-t * 4) * np.minimum(1, t / 0.005)

def beep():
    n = int(0.12 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * 1320 * t) * np.minimum(1, np.minimum(t, 0.12 - t) / 0.01)

def amb(kind):
    n = int(20 * SR); t = np.arange(n) / SR
    if kind == "office": y = noise(n, 60, 900) + 0.25 * noise(n, 2000, 6000) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.07 * t))
    elif kind == "work":
        y = noise(n, 50, 400) * 1.5 + 0.2 * noise(n, 800, 3000)
        for k in rng.uniform(0, 19.9, 90): add(y, rng.standard_normal(int(0.012 * SR)) * np.exp(-np.arange(int(0.012 * SR)) / 150), k, 0.004 * np.abs(y).max() * 40)
    else: y = noise(n, 40, 600) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.05 * t)) + 0.3 * noise(n, 600, 2500) * np.clip(np.sin(2 * np.pi * 0.06 * t + 1), 0, 1) ** 3
    f = int(0.5 * SR); y[:f] = y[:f] * np.linspace(0, 1, f) + y[-f:] * np.linspace(1, 0, f)    # loops
    return y[:-f]

def save(dst, name, y):
    y = np.asarray(y, np.float64); y = y / max(1e-9, np.abs(y).max()) * 10 ** (-1 / 20)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "libmp3lame", "-b:a", "192k", os.path.join(dst, name + ".mp3")], input=y.astype(np.float32).tobytes(), check=True)

def main():
    dst = sys.argv[1]; os.makedirs(dst, exist_ok=True)
    save(dst, "mus_office", tune(100, pluck))
    save(dst, "mus_city", tune(92, mallet, bass=True, blocks=False))
    save(dst, "mus_night", night())
    save(dst, "mus_tender", tune(60, pluck, bass=False, blocks=False, padK=1.0, seed=40))
    save(dst, "mus_warm", tune(76, pluck, bass=True, blocks=False, padK=0.8, bars=8, end_long=True, seed=70))
    for k in ("office", "work", "street"): save(dst, "amb_" + k, amb(k))
    for nm, fn in (("stamp", stamp), ("pop", pop), ("snap", snap), ("twang", twang), ("whoosh", whoosh), ("sparkle", sparkle), ("ding", ding), ("boing", boing), ("rec_beep", beep)): save(dst, "sfx_" + nm, fn())
    subprocess.run([sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../kit/day/sound/make_poweroff.py"), "0.1", "0.5", os.path.join(dst, "sfx_poweroff.mp3")], check=True)
    print("clips in", dst)

if __name__ == "__main__":
    main()
