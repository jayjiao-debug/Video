#!/usr/bin/env python3
"""The music of 采访八百壮士的一天, made in code (numpy only; no samples, nothing downloaded): one plain theme in D minor
at 60 bpm, a warm pad (i - VI - III - VII) under a breathy flute-like voice. Two cues, both quiet:
  mus_flag   2 bars  (F: the flag's shadow crosses the roof): it rises and does not resolve
  mus_end    4 bars  (after her camera dies: under the end slate), ends on a long D
NO MUSIC in scene D (陈树生) and none under the letter scenes: the cues file keeps to that.
  make_music.py <clips_dir>
Mono 48 kHz mp3. Every cue is normalised to -1 dBFS peak; its level in the film is the cue's static gain."""
import sys, os, subprocess
import numpy as np

SR = 48000
BEAT = 1.0                                   # 60 bpm
A4 = 440.0
NOTE = {"C": -9, "D": -7, "E": -5, "F": -4, "G": -2, "A": 0, "Bb": 1, "B": 2}

def hz(name):
    n, o = name[:-1], int(name[-1])
    return A4 * 2 ** ((NOTE[n] + 12 * (o - 4)) / 12)

def adsr(n, a, d, s, r, hold):
    """n samples; attack a, decay d to level s, release r after `hold` seconds"""
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), np.where(t < a + d, 1 - (1 - s) * (t - a) / max(d, 1e-4), s))
    rel = np.clip(1 - (t - hold) / max(r, 1e-4), 0, 1)
    return e * np.where(t > hold, rel ** 2, 1)

def pad_note(f, dur, tail=3.0, seed=0):
    """a warm string-like pad voice: three slightly detuned stacks of soft harmonics, a slow swell"""
    n = int((dur + tail) * SR); t = np.arange(n) / SR
    rng = np.random.default_rng(seed); y = np.zeros(n)
    for det in (-5, 0, 6):
        ff = f * 2 ** (det / 1200)
        ph = rng.uniform(0, 2 * np.pi)
        drift = 1 + 0.0012 * np.sin(2 * np.pi * (0.13 + 0.05 * rng.random()) * t + ph)
        base = 2 * np.pi * np.cumsum(ff * drift) / SR
        for k in range(1, 9):
            if ff * k > 3200: break
            y += (1 / k) * np.exp(-0.42 * (k - 1)) * np.sin(k * base + ph * k)
    return y * adsr(n, 1.3, 0.8, 0.85, tail, dur) / 3

def flute_note(f, dur, tail=0.9, seed=0, vib=1.0):
    """a breathy flute-like solo voice (near a 箫): a sine with two soft overtones, a late vibrato, a little air"""
    n = int((dur + tail) * SR); t = np.arange(n) / SR
    rng = np.random.default_rng(100 + seed)
    vdepth = vib * 0.006 * np.clip((t - 0.35) / 0.6, 0, 1)
    fr = f * (1 + vdepth * np.sin(2 * np.pi * 5.1 * t)) * (1 - 0.012 * np.exp(-t / 0.05))    # a small scoop into the note
    ph = 2 * np.pi * np.cumsum(fr) / SR
    y = np.sin(ph) + 0.22 * np.sin(2 * ph + 0.4) + 0.07 * np.sin(3 * ph + 1.1)
    air = rng.standard_normal(n)
    # the air: noise band-passed round the second harmonic (FFT mask), low
    S = np.fft.rfft(air); fq = np.fft.rfftfreq(n, 1 / SR)
    S *= np.exp(-0.5 * ((fq - 2 * f) / (0.5 * f)) ** 2)
    air = np.fft.irfft(S, n); air *= 0.05 / max(1e-9, np.abs(air).max())
    env = adsr(n, 0.09, 0.25, 0.8, tail, dur)
    return (y * 0.5 + air) * env

def reverb(y, seconds=2.4, mix=0.32, seed=5):
    """a plain hall: convolution with decaying low-passed noise (FFT), mixed under the dry sound"""
    rng = np.random.default_rng(seed); m = int(seconds * SR)
    ir = rng.standard_normal(m) * np.exp(-np.arange(m) / (0.42 * SR))
    S = np.fft.rfft(ir); fq = np.fft.rfftfreq(m, 1 / SR); S *= 1 / (1 + (fq / 2600) ** 2); S[fq < 120] *= 0.3
    ir = np.fft.irfft(S, m); ir[: int(0.012 * SR)] *= 0.2; ir /= np.sqrt((ir ** 2).sum())
    n = len(y) + m; Y = np.fft.rfft(y, n) * np.fft.rfft(ir, n)
    wet = np.fft.irfft(Y, n)
    out = np.zeros(n); out[: len(y)] += y * (1 - mix); out += wet * mix * 0.9
    return out

CHORDS = {"Dm": ["D2", "D3", "A3", "F4"], "Bb": ["Bb1", "Bb2", "F3", "D4"], "F": ["F2", "F3", "C4", "A4"], "C": ["C2", "C3", "G3", "E4"], "Dm_end": ["D2", "D3", "A3", "D4"]}

def cue(bars, melody, pad_gain=1.0, mel_gain=1.0, end_hold=0.0, bass=True):
    """bars: chord names, 4 beats each; melody: (start beat, beats, note) list"""
    total = len(bars) * 4 * BEAT + end_hold + 6.0
    y = np.zeros(int(total * SR))
    for i, c in enumerate(bars):
        last = i == len(bars) - 1
        d = 4 * BEAT + (end_hold if last else 0.4)
        for j, nm in enumerate(CHORDS[c]):
            if j == 0 and not bass: continue
            g = (0.22 if j == 0 else 0.8 if j == 1 else 0.6) * pad_gain
            v = pad_note(hz(nm), d, tail=3.6 if last else 2.2, seed=i * 10 + j) * g
            a = int(i * 4 * BEAT * SR); y[a: a + len(v)] += v[: len(y) - a]
    for k, (b0, nb, nm) in enumerate(melody):
        v = flute_note(hz(nm), nb * BEAT - 0.12, seed=k) * 0.55 * mel_gain
        a = int(b0 * BEAT * SR); y[a: a + len(v)] += v[: len(y) - a]
    y = reverb(y)
    # trim the silent tail, a short fade at both ends
    thr = 10 ** (-66 / 20) * np.abs(y).max(); last = np.nonzero(np.abs(y) > thr)[0][-1]
    y = y[: min(len(y), last + int(0.3 * SR))]
    f = int(0.02 * SR); y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    return y

def write(y, path):
    y = y * (10 ** (-1 / 20) / max(1e-9, np.abs(y).max()))
    pcm = (y * 32767).astype(np.int16).tobytes()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-", "-b:a", "192k", path], input=pcm, check=True)
    print(f"wrote {path}: {len(y) / SR:.2f} s")

def main(out):
    os.makedirs(out, exist_ok=True)
    # the theme: A4 D5 | F5 . D5 | E5 C5 | D5 ... (every long note is a chord tone)
    # mus_flag: two bars that rise and do not resolve (the shelling of the 30th cuts in after it)
    flag = cue(["Dm", "Bb"], [(0.3, 1.7, "A4"), (2, 2, "D5"), (4, 3.6, "F5")], pad_gain=1.0, mel_gain=1.0, end_hold=0.6)
    # mus_end: four bars under the end slate; the last block of the slate lands on the long D
    end = cue(["Dm", "Bb", "C", "Dm_end"], [(0.5, 1.5, "A4"), (2, 2, "D5"), (4, 3, "F5"), (7, 1, "D5"), (8, 2, "E5"), (10, 2, "C5"), (12, 5, "D5")],
              pad_gain=0.9, mel_gain=0.8, end_hold=3.0)
    write(flag, os.path.join(out, "mus_flag.mp3")); write(end, os.path.join(out, "mus_end.mp3"))

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
