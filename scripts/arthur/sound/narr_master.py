#!/usr/bin/env python3
"""narr_master.py <in> <out.wav> [--lufs -12] [--ceil -2] [--knee -7] [--comp "<ffmpeg filter>"]
Narration to a target loudness with as little damage as possible: light 2:1 compression, then a gain, then a soft
clipper (4x oversampled) that rounds off only the highest waveform peaks under the ceiling. Prints how much was touched."""
import subprocess, re, sys, numpy as np
from scipy.signal import resample_poly
SR = 48000
A = sys.argv[1:]; src, dst = A[0], A[1]
LUFS, CEIL, KNEE, COMP = -12.0, -2.0, -7.0, "acompressor=threshold=-16dB:ratio=2:attack=2:release=100:knee=6"
i = 2
while i < len(A):
    if A[i] == "--lufs": LUFS = float(A[i + 1])
    elif A[i] == "--ceil": CEIL = float(A[i + 1])
    elif A[i] == "--knee": KNEE = float(A[i + 1])
    elif A[i] == "--comp": COMP = A[i + 1]
    i += 2
def loud(p):
    e = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", p, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    s = e[e.rfind("Summary:"):]
    return float(re.search(r"I:\s+(-?[\d.]+) LUFS", s).group(1)), float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", s).group(1)), float(re.search(r"LRA:\s+(-?[\d.]+) LU", s).group(1))
def load(p, af="anull"):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-af", af, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)
def save(p, x):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "1", "-ar", str(SR), "-i", "-", "-c:a", "pcm_s24le", p], input=x.astype(np.float32).tobytes(), check=True)
def softclip(x, knee, ceil):
    up = resample_poly(x, 4, 1); a = np.abs(up); o = a > knee
    y = up.copy(); y[o] = np.sign(up[o]) * (knee + (ceil - knee) * np.tanh((a[o] - knee) / (ceil - knee)))
    return resample_poly(y, 1, 4)[: len(x)], float(o.mean())
I0, tp0, lra0 = loud(src)
x = load(src, COMP)
c, k = 10 ** (CEIL / 20), 10 ** (KNEE / 20)
save(dst, x); I1, _, _ = loud(dst); g = LUFS - I1
for it in range(6):
    y, frac = softclip(x * 10 ** (g / 20), k, c)
    y = np.clip(y, -c * 1.02, c * 1.02)                 # (the resampler's ripple)
    save(dst, y); I, tp, lra = loud(dst)
    if abs(I - LUFS) < 0.05: break
    g += LUFS - I
xin = x * 10 ** (g / 20); gl = (xin * y).sum() / (xin * xin).sum(); sdr = 10 * np.log10((xin ** 2).sum() / ((y - gl * xin) ** 2).sum())
print(f"in {I0:.1f} LUFS / TP {tp0:.1f} / LRA {lra0:.1f}  ->  out {I:.1f} LUFS / TP {tp:.1f} / LRA {lra:.1f};  gain {g:+.1f} dB after the compressor; {100 * frac:.2f} % of the samples rounded (above {KNEE:.0f} dBFS), peak before {20 * np.log10(np.abs(xin).max()):+.1f} dBFS; clipper SDR {sdr:.1f} dB")
