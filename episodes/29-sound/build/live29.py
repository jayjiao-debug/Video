"""per-frame (30 fps) analysis of the final ep29 soundtrack → live29.json: 48-bin log spectrum (dB, same edges as
spectra.json), left/right RMS (dB) and a low-band (<120 Hz) envelope. The film draws these, so what you see is what you hear."""
import json, sys, numpy as np, soundfile as sf
x, SR = sf.read(sys.argv[1]); x = x.T
edges = np.array(json.load(open('spectra.json'))['edges'])
FPS, N = 30, 8192
win = np.hanning(N); F = np.fft.rfftfreq(N, 1 / SR)
nfr = int(x.shape[1] / SR * FPS)
spec, L, R, low = [], [], [], []
mono = x.mean(0)
for i in range(nfr):
    c = int(i / FPS * SR); a = max(0, c - N // 2); seg = mono[a:a + N]
    if len(seg) < N: seg = np.pad(seg, (0, N - len(seg)))
    P = np.abs(np.fft.rfft(seg * win)) ** 2
    b = [10 * np.log10(P[(F >= edges[k]) & (F < edges[k + 1])].mean() + 1e-12) for k in range(48)]
    spec.append(b)
    h = slice(max(0, c - 735), c + 735)
    L.append(10 * np.log10(np.mean(x[0, h] ** 2) + 1e-10)); R.append(10 * np.log10(np.mean(x[1, h] ** 2) + 1e-10))
    low.append(10 * np.log10(P[(F >= 30) & (F < 120)].sum() + 1e-12))
spec = np.array(spec); spec = spec - np.percentile(spec, 99.5) + 58     # same scale as spectra.json (loudest ≈ 58)
# smooth like a meter: fast rise, ~0.2 s fall
sm = spec.copy()
for i in range(1, len(sm)): sm[i] = np.maximum(spec[i], sm[i - 1] - 3.0)
low = np.array(low); low = np.clip((low - np.percentile(low, 5)) / (np.percentile(low, 99) - np.percentile(low, 5)), 0, 1)
json.dump({'spec': np.round(sm, 1).tolist(), 'L': np.round(L, 1).tolist(), 'R': np.round(R, 1).tolist(), 'low': np.round(low, 2).tolist()}, open('build/live29.json', 'w'), separators=(',', ':'))
print(nfr, 'frames', spec.max(), np.percentile(L, 50))
