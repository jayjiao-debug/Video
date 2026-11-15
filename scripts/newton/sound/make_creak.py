#!/usr/bin/env python3
"""One small floorboard creak, synthesised: sfx_board_creak.mp3 (the intro: her last step up to his door, her weight
settling on the old landing; owner's note 1, 15 Nov).

  python3 scripts/newton/sound/make_creak.py [--clips /home/user/newton_work/film/sound/clips] [--wav DIR]

A creak is stick-slip: the board's edge catches and lets go many times a second against its neighbour, and each
release rings the wood. Built that way:
  - the releases: a train of clicks whose rate climbs as her weight comes on (90 -> 170 a second over the first
    55 %) and falls back as she settles (to 115), each click a little early or late (12 % jitter) and uneven in
    strength, so it is a creak and not a buzz (at 34-78 a second, the first try, it was ten separate ticks);
  - the wood: every click rings four narrow resonances (390 Hz, 870 Hz, 1.55 kHz, 2.4 kHz, the upper two weaker);
  - a little dry friction noise (600 Hz - 2.5 kHz) under it;
  - the swell: in over 45 %, out over the rest. 0.19 s, nothing under 250 Hz.
It is NOT cut from sfx_big_door (the hinge of his door creaks 1.8 s later, at A from + 3.72: the two must not be
the same sound): lower, shorter, pulsed. Deterministic (a fixed seed). Mono 48 kHz, mp3 192k.
The clip starts with 5 ms of silence (PRE): the cue's "at" is where the creak begins."""
import argparse, os, subprocess, numpy as np
from scipy.signal import butter, sosfilt, iirpeak, lfilter
SR = 48000
PRE = 0.005
DUR = 0.19

def creak(seed=57):
    rng = np.random.default_rng(seed); n = int(DUR * SR); t = np.arange(n) / SR; u = t / DUR
    rate = np.where(u < 0.55, 90 + (170 - 90) * (np.minimum(u, 0.55) / 0.55) ** 0.8, 170 - (170 - 115) * (np.clip(u - 0.55, 0, 1) / 0.45))   # releases per second
    x = np.zeros(n); ph = 0.0; nxt = 0.35 + 0.3 * rng.random()
    click = np.hanning(int(0.0005 * SR) | 1)
    for i in range(n):
        ph += rate[i] / SR
        if ph >= nxt:
            ph -= nxt; nxt = 1 + 0.12 * rng.standard_normal()                           # the next release a little early or late
            a = 0.6 + 0.8 * rng.random(); m = min(len(click), n - i); x[i:i + m] += a * click[:m]
    y = np.zeros(n)
    for hz, q, g in ((390, 11, 1.0), (870, 10, 0.85), (1550, 8, 0.40), (2400, 7, 0.20)):
        b, a_ = iirpeak(hz, q, fs=SR); y += g * lfilter(b, a_, x)
    fr = sosfilt(butter(2, [600, 2500], "bp", fs=SR, output="sos"), rng.standard_normal(n)) * 0.02      # dry friction
    env = np.where(u < 0.45, np.sin(np.pi / 2 * np.minimum(u, 0.45) / 0.45) ** 1.5, np.cos(np.pi / 2 * np.clip((u - 0.45) / 0.55, 0, 1)) ** 1.3)
    y = (y + fr * np.abs(y).max()) * env
    y = sosfilt(butter(2, 250, "hp", fs=SR, output="sos"), y)
    f = int(0.012 * SR); y[-f:] *= np.linspace(1, 0, f)
    y = np.concatenate([np.zeros(int(PRE * SR)), y, np.zeros(int(0.01 * SR))])
    return y / np.abs(y).max() * 10 ** (-6.0 / 20)

def write_mp3(x, path, title):
    raw = (np.clip(x, -1, 1) * 32767).astype("<i2").tobytes()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "libmp3lame", "-b:a", "192k",
                    "-metadata", f"title={title}", "-metadata", "comment=synthesised: scripts/newton/sound/make_creak.py", path], input=raw, check=True)
    print("wrote", path, f"{len(x) / SR:.3f} s")

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--clips", default="/home/user/newton_work/film/sound/clips")
    ap.add_argument("--wav", default=None, help="also write a 16-bit wav into this folder (for measuring)")
    a = ap.parse_args()
    y = creak()
    write_mp3(y, os.path.join(a.clips, "sfx_board_creak.mp3"), "a small floorboard creak (her weight settling)")
    if a.wav:
        import soundfile as sf
        sf.write(os.path.join(a.wav, "sfx_board_creak.wav"), y.astype(np.float32), SR, subtype="PCM_16")
