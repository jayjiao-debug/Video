#!/usr/bin/env python3
"""narr_master.py <in> <out.wav> [--lufs -14] [--ceil -3] [--mode limit|clip] [--knee -7] [--comp "<ffmpeg filter>"]
Narration to a target loudness (mono reading; the same sound as a stereo file reads 3 LU higher).
  --mode limit (default): one fixed gain, then a look-ahead peak limiter: only a smooth gain change around the few
                peaks that would pass the ceiling (5 ms ahead, 60 ms release: --rel). The waveform is never bent, so nothing
                crackles; it reaches about -14 LUFS mono on this voice before the limiter has to work much.
  --mode clip : the louder chain of v2 / v3 (3:1 compression, gain, a soft clipper). At -12.5 LUFS mono it bent the loud
                syllables audibly (the owner heard the voice break), so use it only if loudness matters more than tone.
Prints how much was touched."""
import subprocess, re, sys, numpy as np
from scipy.signal import resample_poly
SR = 48000
A = sys.argv[1:]; src, dst = A[0], A[1]
LUFS, CEIL, KNEE, COMP, MODE = -14.0, -3.0, -7.0, "acompressor=threshold=-16dB:ratio=2:attack=2:release=100:knee=6", "limit"
REL = 60.0
i = 2
while i < len(A):
    if A[i] == "--lufs": LUFS = float(A[i + 1])
    elif A[i] == "--ceil": CEIL = float(A[i + 1])
    elif A[i] == "--knee": KNEE = float(A[i + 1])
    elif A[i] == "--comp": COMP = A[i + 1]
    elif A[i] == "--mode": MODE = A[i + 1]
    elif A[i] == "--rel": REL = float(A[i + 1])
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
def limit(x, ceil, ahead_ms=5, rel_ms=120):
    """look-ahead peak limiter on a 1 ms control grid: the gain is down before the peak arrives and comes back slowly"""
    B = SR // 1000; up = np.abs(resample_poly(x, 4, 1))[: len(x) * 4]
    pk = np.maximum(up.reshape(-1, 4).max(1), 1e-9)                       # the peak between the samples too
    m = len(pk) // B; need = np.minimum(1.0, ceil / np.concatenate([pk[: m * B].reshape(m, B).max(1), [pk[m * B:].max() if len(pk) > m * B else 1e-9]]))
    L = ahead_ms; pad = np.concatenate([need, np.ones(L)])
    ahead = np.min(np.stack([pad[j: j + len(need)] for j in range(L + 1)]), 0)   # the lowest gain needed in the next 5 ms
    g = np.empty_like(ahead); a = 1 - np.exp(-1 / rel_ms); cur = 1.0
    for j in range(len(ahead)):
        cur = min(ahead[j], cur + (1 - cur) * a); g[j] = cur
    g = np.convolve(np.concatenate([np.full(L - 1, g[0]), g]), np.ones(L) / L, "valid")      # a 5 ms slope instead of a step
    gs = np.repeat(g, B)[: len(x)]
    gs = np.convolve(np.concatenate([np.full(B, gs[0]), gs, np.full(B, gs[-1])]), np.hanning(2 * B + 1) / np.hanning(2 * B + 1).sum(), "same")[B: B + len(x)]
    return x * gs, gs
I0, tp0, lra0 = loud(src)
if MODE == "limit":
    x = load(src); c = 10 ** (CEIL / 20)
    g = LUFS - I0
    for it in range(8):
        y, gs = limit(x * 10 ** (g / 20), c, rel_ms=REL)
        over = int((np.abs(y) > c * 1.01).sum()); y = np.clip(y, -c * 1.01, c * 1.01)
        save(dst, y); I, tp, lra = loud(dst)
        if abs(I - LUFS) < 0.05: break
        g += LUFS - I
    n = int(0.05 * SR); mm = len(x) // n; P = (x[: mm * n].reshape(mm, n) ** 2).mean(1); act = P > P.max() * 10 ** (-40 / 10)
    gr = -20 * np.log10(gs[: mm * n].reshape(mm, n).min(1))[act]
    print(f"in {I0:.1f} LUFS / TP {tp0:.1f} / LRA {lra0:.1f}  ->  out {I:.1f} LUFS / TP {tp:.1f} / LRA {lra:.1f};  gain {g:+.1f} dB, peak before the limiter {20 * np.log10(np.abs(x).max()) + g:+.1f} dBFS; limiter: turned down by more than 1 dB in {100 * (gr > 1).mean():.1f} % of the 50 ms windows with speech, more than 3 dB in {100 * (gr > 3).mean():.1f} %, most {gr.max():.1f} dB; the waveform is not bent ({over} samples cut by the safety stop)")
    sys.exit(0)
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
