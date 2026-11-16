#!/usr/bin/env python3
"""finish.py <out prefix> <beats.json> [--tail-ms 400] [--timing voice_timing.json]: the end of a film that does NOT loop.
The kit mixer (scripts/kit/sound/mix.py) builds a looping track (Hongmen loops): its limiters and its 48 kHz copy run
round a ring. Wanbi ends: this gives the mix and its three stems the same short fade at the very end (the last
--tail-ms, after the last word: the narration's tail is silence there) and a 3 ms fade-in at the very start, so the
last sample is silence and nothing is cut off loud; then it makes the 48 kHz copy again from the faded mix, exactly
the film's length at 48 kHz (1600 samples a frame; Fourier resampling as the kit mixer's, which is clean now that both
ends are silent). The stems still add up to the mix. Writes over <out>.wav, <out>_narr/_sfx/_beds.wav, <out>_48k.wav."""
import json, re, subprocess, sys
import numpy as np
sys.dont_write_bytecode = True
A = sys.argv[1:]
if len(A) < 2: raise SystemExit(__doc__)
out, beats_p = A[0], A[1]
TAIL_MS = float(A[A.index("--tail-ms") + 1]) if "--tail-ms" in A else 400.0
TIMING = A[A.index("--timing") + 1] if "--timing" in A else None      # the narration's own word times (the English voice ends elsewhere)
B = json.load(open(beats_p, encoding="utf8")); FPS, TOTAL = B["fps"], B["total"]

def rate(p): return int(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=sample_rate", "-of", "csv=p=0", p], check=True, capture_output=True, text=True).stdout.strip())
def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-f", "f32le", "-ac", "1", "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)
def save(p, x, sr):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "1", "-ar", str(sr), "-i", "-", "-c:a", "pcm_s24le", p], input=x.astype(np.float32).tobytes(), check=True)
def loud(p):
    e = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", p, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    s = e[e.rfind("Summary:"):]
    return float(re.search(r"I:\s+(-?[\d.]+) LUFS", s).group(1)), float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", s).group(1))

SR = rate(out + ".wav"); N = TOTAL * SR // FPS
nt = int(TAIL_MS / 1000 * SR); ni = int(0.003 * SR)
last_word = max(l["end"] for l in (json.load(open(TIMING, encoding="utf8"))["lines"] if TIMING else B["lines"]))
if (N - nt) / SR < last_word + 0.05: raise SystemExit(f"finish: a {TAIL_MS:.0f} ms tail fade would start at {(N - nt) / SR:.3f} s, before the last word ends ({last_word:.3f} s)")
env = np.ones(N)
env[:ni] = np.sin(np.linspace(0, np.pi / 2, ni)) ** 2
env[N - nt:] = np.cos(np.linspace(0, np.pi / 2, nt)) ** 2          # equal-power-shaped fade to exactly 0 on the last sample
mix = None
for k in ("", "_narr", "_sfx", "_beds"):
    x = load(out + k + ".wav")
    if len(x) != N: raise SystemExit(f"finish: {out}{k}.wav is {len(x)} samples, the film is {N}")
    save(out + k + ".wav", x * env, SR)
    if k == "": mix = x * env
m48 = TOTAL * 48000 // FPS; X = np.fft.rfft(mix); Y = np.zeros(m48 // 2 + 1, dtype=complex); k_ = min(len(X), len(Y)); Y[:k_] = X[:k_]
y48 = np.fft.irfft(Y, m48) * (m48 / N)
save(out + "_48k.wav", y48, 48000)
I, tp = loud(out + ".wav"); I48, tp48 = loud(out + "_48k.wav")
print(f"finish: a {TAIL_MS:.0f} ms fade to silence on the last {TAIL_MS / 1000 * FPS:.0f} frames (from {(N - nt) / SR:.3f} s; the last word ends at {last_word:.3f} s) and a 3 ms fade-in, on the mix and its three stems")
print(f"finish: mix {I:.1f} LUFS, true peak {tp:.1f} dBFS ({N} samples at {SR} Hz);  48 kHz copy {I48:.1f} LUFS, true peak {tp48:.1f} dBFS, {m48} samples = {m48 / 1600:g} frames -> {out}_48k.wav")
