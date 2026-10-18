"""Synthesize the sound demos for 《为什么有些音放在一起好听》 (no samples, no AI)."""
import numpy as np, wave, sys
SR = 48000
def tone(f, dur, sustain=False, harm=6):
    t = np.arange(int(SR * dur)) / SR
    y = sum((1 / n ** 1.4) * np.sin(2 * np.pi * f * n * t) * (np.exp(-t * (0.6 + 0.5 * n)) if not sustain else 1) for n in range(1, harm + 1))
    env = np.minimum(1, t / 0.012) * np.minimum(1, (dur - t) / 0.25)
    return y * env
def pair(f1, f2, dur, **k): return tone(f1, dur, **k) + tone(f2, dur, **k)
gap = lambda s: np.zeros(int(SR * s))
C4, A4 = 261.6256, 440.0
ET = lambda f, k: f * 2 ** (k / 12)
seq = [
    pair(C4, C4 * 1.5, 2.2), gap(0.5),              # Do + Sol (pure 3:2)
    pair(C4, ET(C4, 6), 2.2), gap(0.5),             # Do + #Fa (1:√2)
    pair(C4, C4 * 2, 2.0), gap(0.8),                # octave 1:2
    pair(A4, A4 * 1.5, 3.2, sustain=True), gap(0.5),  # pure fifth: still
    pair(A4, ET(A4, 7), 3.2, sustain=True), gap(0.3), # piano fifth: ~1.5 beats/s
]
y = np.concatenate(seq); y = 0.8 * y / np.abs(y).max()
out = sys.argv[1] if len(sys.argv) > 1 else 'out/tones_demo.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())
print(out, round(len(y) / SR, 2), 's')
