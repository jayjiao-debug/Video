#!/usr/bin/env python3
"""A long fire bed that never repeats, made from the library's 10 s furnace loop (v5 r2, sound review MINOR 7).

  python3 scripts/newton/sound/make_fire_bed.py [--clips /home/user/newton_work/film/sound/clips] [--seconds 96]

Why: the quiet scene (F, after THE TURN, about 31 s) and G's fire (about 23 s) had only amb_furnace (10.03 s) looped, so
its loudest pop pair came back every 10.00 s (envelope autocorrelation 0.53 at that lag; under F11, F14 and F16). Two
layers at incommensurate rates only got that to 0.42. This writes amb_fire_long.mp3: grains of amb_furnace (1.2-2.8 s
each, drawn from anywhere in the clip, never the stretch the grain before came from) joined with 120 ms equal-power
crossfades, so no stretch of the fire comes back at a fixed lag. Fire is noise and pops with no pitch or rhythm, so the
joins cannot be heard; the level is the source's (equal-power joins of uncorrelated noise keep the RMS). The same file
every run (seed 1686). The real fix is the sound farm's: a 60 s furnace recording (REMIX_v5.md, placeholders)."""
import argparse, os, subprocess
import numpy as np

SR = 48000
ap = argparse.ArgumentParser()
ap.add_argument("--clips", default="/home/user/newton_work/film/sound/clips")
ap.add_argument("--seconds", type=float, default=96.0)
a = ap.parse_args()
src = os.path.join(a.clips, "amb_furnace.mp3")
x = np.frombuffer(subprocess.check_output(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]), dtype=np.float32).astype(np.float64)
x = x[int(0.05 * SR): len(x) - int(0.05 * SR)]               # clear of the mp3's edges
rng = np.random.default_rng(1686)
XF = int(0.12 * SR); n_out = int(a.seconds * SR)
fade = np.sin(np.linspace(0, np.pi / 2, XF))                # equal power: sin in, cos out
out = np.zeros(n_out + 4 * SR); pos = 0; prev = None; grains = []
while pos < n_out:
    g = int(rng.uniform(1.2, 2.8) * SR) + XF
    for _ in range(100):                                    # not the stretch the last grain came from
        s0 = int(rng.uniform(0, len(x) - g))
        if prev is None or s0 + g < prev[0] - SR // 2 or s0 > prev[1] + SR // 2: break
    seg = x[s0: s0 + g].copy()
    if pos: seg[:XF] *= fade
    seg[-XF:] *= fade[::-1]
    out[pos: pos + g] += seg; grains.append((pos / SR, s0 / SR, g / SR)); prev = (s0, s0 + g); pos += g - XF
out = out[:n_out]
raw = (np.clip(out, -1, 1) * 32767).astype("<i2").tobytes()
dst = os.path.join(a.clips, "amb_fire_long.mp3")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "libmp3lame", "-b:a", "256k",
                "-metadata", "title=amb_fire_long (amb_furnace grains, never repeating)",
                "-metadata", "comment=scripts/newton/sound/make_fire_bed.py, seed 1686", dst], input=raw, check=True)
rms = lambda v: 20 * np.log10(np.sqrt(np.mean(v ** 2)) + 1e-12)
print(f"wrote {dst}: {a.seconds:.1f} s, {len(grains)} grains, RMS {rms(out):.2f} dBFS (source {rms(x):.2f})")
