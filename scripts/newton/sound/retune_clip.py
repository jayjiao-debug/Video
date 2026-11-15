#!/usr/bin/env python3
"""Retune a pitched one-shot effect to a note of the film's key (owner rule: tonal effects are tuned to the track's key).

  retune_clip.py <in.mp3> <out.mp3> --target 880 [--win 0.26 0.40] [--band 600 850]

Finds the clip's dominant partial inside --band (Hz) over --win (s, the pitched burst), then plays the clip faster
(a sampler's key change: pitch and length move together, like a smaller object struck) by target / found, delays it so
its loudest 10 ms block stays at the same time in the clip (the cue's sync does not move), matches its loudest
momentary loudness (400 ms, BS.1770 K-weighted) to the original's (so the cue's gain in cues.json keeps its meaning),
and writes a 48 kHz 192k mp3. Prints the measured pitch before and after.
Used for sfx_card (gate 4, director's note 2): 725 Hz (a quarter-tone between F5 and F#5) -> A5 880 Hz, the one note
in D major (mus_morning, mus_noon, mus_laugh), D minor (mus_night) and F major (mus_supper) alike:
  python3 scripts/newton/sound/retune_clip.py <clips>/sfx_card.mp3 <clips>/sfx_card_A5.mp3 --target 880"""
import argparse, subprocess, tempfile, os
from fractions import Fraction
import numpy as np, soundfile as sf
from scipy.signal import resample_poly, lfilter
SR = 48000

def load(p):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", p, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"])
    return np.frombuffer(raw, np.float32).astype(np.float64).reshape(-1, 2)

def pitch(x, win, band):
    seg = x[int(win[0] * SR):int(win[1] * SR)].mean(1); N = 1 << 20
    F = np.abs(np.fft.rfft(seg * np.hanning(len(seg)), N)); f = np.fft.rfftfreq(N, 1 / SR)
    i = np.argmax(F * ((f > band[0]) & (f < band[1])))
    a, b, c = np.log(F[i - 1:i + 2]); return f[i] + 0.5 * (a - c) / (a - 2 * b + c) * (f[1] - f[0])

def kw(x):
    x = lfilter([1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585], x)
    return lfilter([1.0, -2.0, 1.0], [1, -1.99004745483398, 0.99007225036621], x)

def max_momentary(x):
    y = kw(x.mean(1)); c = np.concatenate([[0], np.cumsum(y * y)]); w = int(0.4 * SR)
    if len(y) <= w: return -0.691 + 10 * np.log10(c[-1] / w + 1e-20)
    return -0.691 + 10 * np.log10(((c[w:] - c[:-w]) / w).max() + 1e-20)

def peak_time(x):
    e = np.array([np.mean(x[i:i + 480] ** 2) for i in range(0, len(x) - 480, 480)]); return np.argmax(e) * 0.01

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src"); ap.add_argument("out")
    ap.add_argument("--target", type=float, required=True, help="Hz")
    ap.add_argument("--win", type=float, nargs=2, default=[0.26, 0.40])
    ap.add_argument("--band", type=float, nargs=2, default=[600, 850])
    a = ap.parse_args()
    x = load(a.src); f0 = pitch(x, a.win, a.band); r = a.target / f0
    q = Fraction(1 / r).limit_denominator(2000)                  # output length = input / r
    y = np.stack([resample_poly(x[:, k], q.numerator, q.denominator) for k in range(2)], 1)
    shift = int(round((peak_time(x) - peak_time(y)) * SR))      # keep the loudest moment where it was
    y = np.concatenate([np.zeros((max(0, shift), 2)), y])[max(0, -shift):]
    y *= 10 ** ((max_momentary(x) - max_momentary(y)) / 20)
    with tempfile.TemporaryDirectory() as d:
        w = os.path.join(d, "t.wav"); sf.write(w, y, SR, subtype="FLOAT")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", w, "-c:a", "libmp3lame", "-b:a", "192k", "-ar", str(SR), a.out], check=True)
    z = load(a.out)
    win2 = [t / r + shift / SR for t in a.win]; band2 = [b * r for b in a.band]
    f1 = pitch(z, win2, band2)
    note = lambda f: 69 + 12 * np.log2(f / 440)
    print(f"{a.src}: {f0:.1f} Hz (midi {note(f0):.2f}) -> {a.out}: {f1:.1f} Hz (midi {note(f1):.2f}); speed x{r:.4f}, "
          f"delay {shift / SR * 1000:.0f} ms; loudest moment {peak_time(x):.2f} s -> {peak_time(z):.2f} s; "
          f"max momentary {max_momentary(x):.1f} -> {max_momentary(z):.1f} LUFS; length {len(x) / SR:.2f} -> {len(z) / SR:.2f} s")

if __name__ == "__main__":
    main()
