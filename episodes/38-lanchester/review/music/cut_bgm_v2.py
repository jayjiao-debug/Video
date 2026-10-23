"""ep38 BGM v2: one owner-approved edit + a fade over the last bar. Nothing else touches the music.

usage: python3 cut_bgm_v2.py <bgm.mp3> <bgm_cut.wav>

Source grid (measured): downbeat(k) = 0.400 + 2.025*k s  (118.5185 BPM, 4/4, bar = 89302.5 samples @44.1k)
Edit: play source bars 0-47, then source bars 72-80. Splice = 24 bars = 48.600 s = 2,143,260 samples (integer).
      Linear crossfade of XF_MS ending PRE_MS before the bar-48 downbeat (before the kick's attack).
Fade: raised-cosine over the last bar (edited bar 56 = source bar 80, the chord tail after the song's stop),
      ending exactly on the edited bar-57 downbeat; the file ends there.
Output: 32-bit float WAV, sample-identical to the ffmpeg decode everywhere except the 20 ms splice and the last bar.
"""
import subprocess, sys, numpy as np, soundfile as sf

SR = 44100
B0, BAR = 0.400, 2.025
CUT_OUT_BAR, CUT_IN_BAR = 48, 72          # source bar lines: leave at 48, re-enter at 72
END_SRC_BAR = 81                          # source bar 81 downbeat = end of the song's own tail
XF_MS, PRE_MS = 20.0, 2.0

src, dst = sys.argv[1], sys.argv[2]
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-f", "f32le", "-acodec", "pcm_f32le", "-ac", "2", "-ar", str(SR), "-"],
                     check=True, capture_output=True).stdout
x = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2)

SH = int(round((CUT_IN_BAR - CUT_OUT_BAR) * BAR * SR))                 # 2,143,260
s = int(round((B0 + CUT_OUT_BAR * BAR) * SR)) - int(round(PRE_MS * SR / 1000))   # crossfade ends here
n = int(round(XF_MS * SR / 1000))
end_src = int(round((B0 + END_SRC_BAR * BAR) * SR))

y = np.concatenate([x[:s], x[s + SH:end_src]]).astype(np.float64)
t = ((np.arange(n) + 0.5) / n)[:, None]
y[s - n:s] = x[s - n:s] * (1 - t) + x[s - n + SH:s + SH] * t          # linear: both sides are sample-aligned and correlated

f0 = int(round((B0 + (END_SRC_BAR - 1 - (CUT_IN_BAR - CUT_OUT_BAR)) * BAR) * SR))   # edited bar 56 downbeat
nf = len(y) - f0
y[f0:] *= (0.5 + 0.5 * np.cos(np.pi * (np.arange(nf) + 0.5) / nf))[:, None]

sf.write(dst, y.astype(np.float32), SR, subtype="FLOAT")
print(f"splice at {s / SR:.4f} s (xfade {(s - n) / SR:.4f}-{s / SR:.4f}), source re-entry {(s + SH) / SR:.4f} s; "
      f"fade {f0 / SR:.4f}-{len(y) / SR:.4f} s; length {len(y)} samples = {len(y) / SR:.4f} s")
