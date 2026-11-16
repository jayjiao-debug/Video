#!/usr/bin/env python3
"""Synthesised camcorder / CRT switch-off for the qin film's last shot.
  make_poweroff.py <collapse_s> <dot_end_s> <out.mp3>
t = 0 is the off click (the button). collapse_s: when the picture starts to squash (after the click);
dot_end_s: when the last dot is gone. Mono 48 kHz."""
import sys, subprocess, numpy as np

SR = 48000
c0, d1, out = float(sys.argv[1]), float(sys.argv[2]), sys.argv[3]
T = d1 + 0.6
t = np.arange(int(T * SR)) / SR
y = np.zeros_like(t)
rng = np.random.default_rng(7)

def env(t0, att, dec):
    e = np.zeros_like(t); m = t >= t0
    u = t[m] - t0
    e[m] = np.minimum(1, u / max(att, 1e-4)) * np.exp(-u / dec)
    return e

# 1. the button: a short plastic click (damped 1.6 kHz + 3.9 kHz partials, a 3 ms noise transient)
y += 0.55 * env(0, 0.0005, 0.010) * np.sin(2 * np.pi * 1600 * t)
y += 0.25 * env(0, 0.0005, 0.006) * np.sin(2 * np.pi * 3900 * t)
n = rng.standard_normal(len(t)); y += 0.35 * env(0, 0.0002, 0.003) * n

# 2. the tube collapse: a low thump as the picture starts to squash
y += 0.55 * env(c0, 0.004, 0.16) * np.sin(2 * np.pi * (70 - 25 * np.clip((t - c0) / 0.3, 0, 1)) * t)

# 3. the falling whine, from the collapse to the dot's end (exponential sweep 2.2 kHz -> 140 Hz)
dur = max(0.15, d1 - c0)
u = np.clip((t - c0) / dur, 0, 1)
f = 2200 * (140 / 2200) ** u
ph = 2 * np.pi * np.cumsum(f) / SR
w_env = (t >= c0) * np.minimum(1, (t - c0) / 0.012) * (1 - u) ** 1.6
y += 0.20 * w_env * (np.sin(ph) + 0.3 * np.sin(2 * ph))

# 4. static: band-limited crackle that thins out
crk = rng.standard_normal(len(t)) * (rng.random(len(t)) < 0.02)
k = np.ones(24) / 24
static = np.convolve(rng.standard_normal(len(t)), k, mode="same") * 0.6 + np.convolve(crk, np.ones(6) / 6, mode="same") * 3
y += 0.10 * (t >= c0) * np.exp(-np.clip(t - c0, 0, None) / 0.28) * (static - np.convolve(static, np.ones(200) / 200, mode="same"))

# 5. the dot goes out: a tiny soft tick
y += 0.12 * env(d1, 0.0008, 0.012) * np.sin(2 * np.pi * 2400 * t)

y *= 0.9 / max(1e-6, np.abs(y).max())
pcm = (y * 32767).astype(np.int16).tobytes()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-", "-b:a", "192k", out],
               input=pcm, check=True)
print(f"wrote {out}: {T:.2f} s (collapse {c0:.2f} s, dot gone {d1:.2f} s)")
