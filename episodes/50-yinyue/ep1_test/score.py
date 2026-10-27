"""ep1 opening test (从零做一首歌, night-stage look): one score for sound and picture.
python3 score.py <outdir>  -> <outdir>/score.json and <outdir>/audio.wav
All sounds are synthesized here (no samples), so the music is ours."""
import json, sys, wave, numpy as np
OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
SR = 48000
KF = [1,0,0,0, 0,0,0,1, 1,0,1,0, 0,0,0,0]    # groove kick
SN = [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0]    # backbeat
HH = [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0]    # 8th hats
BS = [1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0]    # bass rhythm
K1 = [1] + [0] * 15                          # one hit
K4 = [1,0,0,0] * 4                           # kick on every beat
Z = [0] * 16
# (bpm, bars, line, keyword, layers, mode)
SECT = [
    (100, 2, '16个格子，就能搭出一首歌', '一首歌', dict(k=KF, s=SN, h=HH, b=BS), 'band'),
    (100, .5, '', '', dict(), 'cut'),
    (100, 1, '先从一声「咚」开始', '咚', dict(k=K1), 'solo'),
    (100, 1, '先从一声「咚」开始', '咚', dict(k=K4), 'solo'),
    (72, 2, '你的心跳，就是这样一下一下', '心跳', dict(heart=K4), 'heart'),
    (100, 2, '一分钟敲 100 下，就叫 100 BPM', 'BPM', dict(k=K4), 'bpm'),
    (70, 1, '慢一点：70 BPM', '70', dict(k=K4), 'bpm'),
    (150, 2, '快一点：150 BPM', '150', dict(k=K4), 'bpm'),
    (100, 1, '下一步：给它分出强和弱', '强和弱', dict(k=K1), 'end'),
]
bars, hits, t = [], [], 0.0
for bpm, n, line, kw, L, mode in SECT:
    step = 60 / bpm / 4
    for j in range(int(np.ceil(n))):
        steps = 16 if n - j >= 1 else int(16 * (n - j))
        bars.append(dict(t=round(t, 4), bpm=bpm, step=step, steps=steps, line=line, kw=kw, mode=mode, first=j == 0,
                         rows={k: v for k, v in L.items()}))
        for inst, pat in L.items():
            for i, on in enumerate(pat[:steps]):
                if on: hits.append(dict(inst=inst, t=round(t + i * step, 4), step=i, bar=len(bars) - 1))
        t += steps * step
END = t + 1.6
json.dump(dict(end=END, bars=bars, hits=hits), open(f'{OUT}/score.json', 'w'), ensure_ascii=False)

# ---------------- audio ----------------
rng = np.random.default_rng(7)
out = np.zeros(int((END + 1) * SR))
def add(sig, t, g=1.0):
    i = int(t * SR); out[i:i + len(sig)] += g * sig[:len(out) - i]
def tt(d): return np.arange(int(d * SR)) / SR
def kick(f0=130, f1=44, d=.45):
    x = tt(d); f = f1 + (f0 - f1) * np.exp(-x / .045); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-x / .16) + .25 * np.exp(-x / .004) * rng.standard_normal(len(x))
def snare():
    x = tt(.3); n = rng.standard_normal(len(x)); n = n - np.roll(n, 1) * .6
    return .55 * n * np.exp(-x / .07) + .5 * np.sin(2 * np.pi * 185 * x) * np.exp(-x / .05)
def hat():
    x = tt(.08); n = rng.standard_normal(len(x)); n = np.diff(np.diff(n, prepend=0), prepend=0)
    return .35 * n * np.exp(-x / .018)
ROOTS = [45, 41, 36, 43]
def bass(note, d=.32):
    f = 440 * 2 ** ((note - 69) / 12); x = tt(d)
    w = np.sin(2 * np.pi * f * x) + .4 * np.sin(4 * np.pi * f * x) + .15 * np.sin(6 * np.pi * f * x)
    return w * np.minimum(1, x / .005) * np.exp(-x / .2)
for h in hits:
    i, t0 = h['inst'], h['t']
    if i == 'k': add(kick(), t0, .95)
    elif i == 's': add(snare(), t0, .7)
    elif i == 'h': add(hat(), t0, .5)
    elif i == 'b': add(bass(ROOTS[h['bar'] % 4]), t0, .5)
    elif i == 'heart':  # lub-dub
        add(kick(95, 38, .35), t0, .9); add(kick(85, 36, .3), t0 + .17, .55)
# a quiet pad under the solo part (A minor), fading in after the lights cut, out at the end
t_pad = bars[2]['t']; x = np.arange(len(out)) / SR
pad = sum(np.sin(2 * np.pi * 440 * 2 ** ((m - 69) / 12) * x + k) for k, m in enumerate([57, 60, 64, 69]))
env = np.clip((x - t_pad) / 4, 0, 1) * np.clip((END - x) / 1.5, 0, 1) * (.5 + .5 * np.sin(2 * np.pi * x / 9.6))
out += .018 * pad * env
# light-cut: a short falling sweep at the cut
tc = bars[1]['t']; d = tt(.6); sw = np.sin(2 * np.pi * np.cumsum(900 * np.exp(-d / .15) + 60) / SR) * np.exp(-d / .2) * .12
add(sw, tc)
out /= np.max(np.abs(out)) / .89
pcm = (np.stack([out, out], 1) * 32767).astype(np.int16)
with wave.open(f'{OUT}/audio.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('end', round(END, 2), 'bars', len(bars), 'hits', len(hits))
