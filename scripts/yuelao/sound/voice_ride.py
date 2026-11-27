#!/usr/bin/env python3
"""采访月老的一天: the voice's clip gain against the bed (the method of scripts/newton/voice/hot_syllables.py, on the whole
voice track): wherever voice x master gain + bed would go over T = ceiling - margin (4x oversampled, ffmpeg's resampler),
the voice alone is ridden down just enough, on a smooth syllable-level curve (the lowest needed gain held over 2*HOLD,
then averaged over HOLD: never at the pitch rate), so build.py's voice limiter and its true-peak check stay idle. The
music and the bed are never touched. numpy + ffmpeg only.
  voice_ride.py <voice_48k.wav> <bed.wav: build.py --only music,amb,sfx --nolimit> <out voice.wav> [--gain 6.2] [--ceiling -1.8] [--margin 0.5]"""
import argparse, subprocess
import numpy as np
ap = argparse.ArgumentParser(); ap.add_argument("voice"); ap.add_argument("bed"); ap.add_argument("out")
ap.add_argument("--gain", type=float, default=6.2); ap.add_argument("--ceiling", type=float, default=-1.8); ap.add_argument("--margin", type=float, default=0.5)
ap.add_argument("--hold", type=float, default=0.025)
a = ap.parse_args(); SR = 48000
def ld(f, sr=SR):
    return np.frombuffer(subprocess.check_output(["ffmpeg", "-v", "error", "-i", f, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"]), np.float32)
def runmin(x, w):
    """the minimum over a centred window of w samples (w odd), O(n) (van Herk / Gil-Werman)"""
    r = w // 2; xp = np.concatenate([np.full(r, np.inf), x, np.full(r + w, np.inf)])
    nb = -(-len(xp) // w); xp = np.concatenate([xp, np.full(nb * w - len(xp), np.inf)]); B = xp.reshape(nb, w)
    pre = np.minimum.accumulate(B, axis=1).ravel(); suf = np.minimum.accumulate(B[:, ::-1], axis=1)[:, ::-1].ravel()
    j = np.arange(len(x)); return np.minimum(suf[j], pre[j + w - 1])
def runmean(x, h):
    xp = np.concatenate([np.full(h // 2, x[0]), x, np.full(h - 1 - h // 2, x[-1])]); c = np.concatenate([[0.0], np.cumsum(xp, dtype=np.float64)])
    return (c[h:] - c[:-h]) / h
v = ld(a.voice).astype(np.float64); b = ld(a.bed).astype(np.float64); n = min(len(v), len(b)); v, b = v[:n], b[:n]
G = 10 ** (a.gain / 20); T = 10 ** ((a.ceiling - a.margin) / 20)
tmp = a.out + ".v4x.f32"
v4 = ld(a.voice, SR * 4).astype(np.float64)[: 4 * n] * G; b4 = ld(a.bed, SR * 4).astype(np.float64)[: 4 * n]
m = min(len(v4), len(b4)); v4, b4 = v4[:m], b4[:m]
need = np.ones(m); over = np.abs(v4 + b4) > T
need[over] = np.clip((T - b4[over] * np.sign(v4[over])) / (np.abs(v4[over]) + 1e-9), 0.05, 1.0)
need48 = need[: (m // 4) * 4].reshape(-1, 4).min(1); need48 = np.concatenate([need48, np.ones(max(0, n - len(need48)))])[:n]
h = max(1, int(a.hold * SR)); curve = np.minimum(runmean(runmin(need48, 2 * h + 1), h), 1.0)
y = (v * curve).astype(np.float32)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "pcm_f32le", a.out], input=y.tobytes(), check=True)
db = 20 * np.log10(np.maximum(curve, 1e-6))
print("voice_ride: %d samples over T (4x); ridden %.2f s of voice, deepest %.1f dB" % (int(over.sum()), float((db < -0.05).sum()) / SR, db.min()))
