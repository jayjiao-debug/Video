"""ep32 《你的脸是密码》 soundtrack: the owner's slowed track, re-sequenced on bar lines (no stretching).
Source bars (bar k starts at B0 + k·BAR, BAR = 4 × 0.50625 s):
  33–39 hook build → 40 DROP = TITLE (film 14.175) → 40–63 acts 1–2 → 4–11 (bar 64 ≈ 4: chroma 0.99; the intro's own
  lift 7→8 lands 一百万分之一 at film 70.875) → 24–31 quiet: the twin twist (bar 12 ≈ 24: chroma 0.95) → 36–43
  (bar 32 ≈ 36: chroma 0.99): the build again → 40 = the ANSWER (film 103.275) → tape-stop ending on film bar 55.
usage (in the episode folder): python3 music/edit.py audio/soundtrack.wav music/timing.json"""
import sys, json, numpy as np, librosa, soundfile as sf, pyloudnorm as pyln
from scipy.signal import resample_poly
from scipy.ndimage import minimum_filter1d, uniform_filter1d
SR = 44100
x, _ = librosa.load('audio/bgm.mp3', sr=SR, mono=False); x = x.astype(np.float32)
BEAT, B0 = np.load('audio/grid.npy'); BAR = 4 * BEAT
def S(k): return B0 + BAR * k
SEGS = [(33, 40), (40, 64), (4, 12), (24, 32), (36, 44)]
h = int(0.006 * SR)
out = None
for (a, b) in SEGS:
    ia = int(round(S(a) * SR)) - h; ib = int(round(S(b) * SR)) + h
    seg = x[:, max(ia, 0):ib].copy()
    if out is None:
        seg = seg[:, h:]; seg[:, :int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))   # film starts on bar 33
        out = seg
    else:
        r = np.linspace(0, 1, 2 * h, dtype=np.float32)
        out[:, -2 * h:] = out[:, -2 * h:] * np.sqrt(1 - r) + seg[:, :2 * h] * np.sqrt(r)
        out = np.concatenate([out, seg[:, 2 * h:]], 1)
out = out[:, :-h]
nbars = sum(b - a for a, b in SEGS); END = nbars * BAR
out = out[:, :int(END * SR)]
# tape-stop over the last 1.6 s (the 最终版 curve), ending on the final bar line
TS = 1.6; i0 = int((END - TS) * SR); tt = np.arange(int(TS * SR)) / SR
src = (END - TS) + np.cumsum((1 - tt / TS) ** 1.6) / SR
tail = np.stack([np.interp(src * SR, np.arange(out.shape[1]), out[c]) for c in range(2)]) * np.clip((TS - tt) / 0.5, 0, 1)
y = np.concatenate([out[:, :i0], tail.astype(np.float32)], 1)
# −14 LUFS, true-peak limiter at −1.5 dBTP
y = y * 10 ** ((-14.0 - pyln.Meter(SR).integrated_loudness(y.T)) / 20)
pk = np.abs(resample_poly(y, 4, 1, axis=1)).max(0).reshape(-1, 4).max(1)[:y.shape[1]]
g = np.minimum(1.0, 10 ** (-1.6 / 20) / np.maximum(pk, 1e-9)); LA = int(0.004 * SR); g = minimum_filter1d(g, 2 * LA + 1)
gd = g[::44].copy(); rel = np.exp(-1 / 80.0)
for i in range(1, len(gd)): gd[i] = min(gd[i], rel * gd[i - 1] + (1 - rel) * gd[i])
g = np.minimum(g, np.interp(np.arange(len(g)), np.arange(len(gd)) * 44, gd)); g = uniform_filter1d(g, LA, mode='nearest')
y = (y * g).astype(np.float32)
sf.write(sys.argv[1], y.T, SR, subtype='PCM_24')
# film timeline: film bar j starts at j·BAR; which source bar it is
fb = []; 
for a, b in SEGS: fb += list(range(a, b))
T = {'BAR': BAR, 'BEAT': BEAT, 'end': END, 'src_bar_of_film_bar': fb,
     'title': 7 * BAR, 'lift': 35 * BAR, 'quiet': 39 * BAR, 'build2': 47 * BAR, 'answer': 51 * BAR, 'card': END - 2.0}
json.dump(T, open(sys.argv[2], 'w'), indent=1)
print('film %.2f s, %d bars; title %.3f lift %.3f quiet %.3f answer %.3f; limiter max GR %.1f dB' % (END, nbars, T['title'], T['lift'], T['quiet'], T['answer'], -20 * np.log10(g.min())))
