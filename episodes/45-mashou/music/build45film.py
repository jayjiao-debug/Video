"""ep45 full bed: the ep42 'v2' cut of bgm2 (music_map_ep42.json) with the 4-bar intro loop in front, so every
v2 landmark moves +9.056 s: title crash 18.115, B section 20.945, stop HIT 105.29, silence 105.98, DROP 116.04,
coda cut 125.10, dead STOP 136.09, intro return 137.76, FINAL HIT 146.82, end 154.18. Same tails/breath/fade as ep42."""
import sys, json, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import fftconvolve
sys.path.insert(0, '/home/claude/video/episodes/42-yiyi/music')
from build42 import song, SR, B, P, STOP
SP = [(0.0, B(9)), (B(1) - 0.010, B(9)), (B(1) - 0.010, B(21)), (B(33) - 0.010, B(129)), (B(265) - 0.010, B(320)), (B(321) - 0.010, B(354)), (B(426) - 0.040, STOP), ('gap', 1.70), (0.0, B(29))]
XF = [0.010, 0.010, 0.010, 0.010, 0.010, 0.040, 0.015, 0.010]
bgm = song[:0]; joins = []
for k, sp in enumerate(SP):
    seg = np.zeros((int(round(sp[1] * SR)), 2), np.float32) if sp[0] == 'gap' else song[int(round(sp[0] * SR)):int(round(sp[1] * SR))].copy()
    if len(bgm):
        xf = int(round(XF[k - 1] * SR)); r = np.linspace(0, 1, xf)[:, None]; bgm[-xf:] = bgm[-xf:] * (1 - r) + seg[:xf] * r; seg = seg[xf:]; joins.append(len(bgm) / SR)
    bgm = np.concatenate([bgm, seg])
n = len(bgm)
def tail_at(a, b, at, ir, db):
    tl = song[int(a * SR):int(b * SR)]; rv = np.stack([fftconvolve(tl[:, c], ir) for c in range(2)], 1).astype(np.float32) * 10 ** (db / 20)
    j = int(at * SR); mm = min(len(rv), n - j); bgm[j:j + mm] += rv[:mm]
ir = np.random.default_rng(7).standard_normal(int(2.5 * SR)) * np.exp(-np.arange(int(2.5 * SR)) / (0.55 * SR)); ir /= np.sqrt((ir ** 2).sum())
ir2 = np.random.default_rng(11).standard_normal(int(4.0 * SR)) * np.exp(-np.arange(int(4.0 * SR)) / (1.1 * SR)); ir2 /= np.sqrt((ir2 ** 2).sum())
tail_at(B(354) - 0.3, B(354), joins[5], ir, -12)
tail_at(STOP - 0.4, STOP, joins[6] - 0.4, ir2, -9)
t = np.arange(n) / SR; g = np.ones(n)
DROP = joins[5] - (B(354) - B(338))
up = np.clip((t - (DROP - 2 * P)) / P, 0, 1); w = 0.5 - 0.5 * np.cos(np.pi * up); w[t >= DROP] = 0; g *= 10 ** (-5 * w / 20)
jr = int((joins[7] - 0.010) * SR); g[jr:] *= 10 ** (-3 / 20)
F = B(29) - B(21); i = int((n / SR - F) * SR); g[i:] *= np.cos(np.linspace(0, 1, n - i) * np.pi / 2) ** 1.5
x = (bgm * g[:, None]).astype(np.float32)
m = pyln.Meter(SR); x *= 10 ** ((-14 - m.integrated_loudness(x)) / 20)
sf.write('ep45_film_bed.wav', x, SR, subtype='PCM_24')
L = {'title_crash': 18.115, 'joins': [round(j, 3) for j in joins], 'drop': round(DROP, 3), 'length': round(n / SR, 3)}
print(json.dumps(L))
