"""ep50 demo score (从零做一首歌): one source for the audio and the picture. 100 BPM, 4/4, 16 steps per bar.
Writes score.json (sections, per-bar patterns, every hit with its time) and demo_audio.wav (TR-707 samples, public domain + a code bass)."""
import json, numpy as np, soundfile as sf
BPM = 100; BEAT = 60 / BPM; STEP = BEAT / 4; BAR = BEAT * 4; SR = 44100
K = [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0]     # kick on every beat (the pulse)
K13 = [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0]   # kick on 1 and 3 (strong beats)
SN = [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0]    # snare on 2 and 4 (backbeat)
HH = [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0]    # hats on 8ths
KF = [1,0,0,0, 0,0,0,1, 1,0,1,0, 0,0,0,0]    # the groove kick (syncopated)
BS = [1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0]    # bass rhythm
Z = [0] * 16
# sections: (bars, headline, sub, layers{kick,snare,hat,bass}, show strong/weak labels, show beat counter big)
SECT = [
 (2, '16个格子', '就能搭出一首歌的节奏', dict(k=KF, s=SN, h=HH, b=BS), False, 'hook'),
 (2, '先从一声「咚」开始', '每分钟 100 下 = 100 BPM', dict(k=K, s=Z, h=Z, b=Z), False, 'pulse'),
 (2, '强 · 弱 · 次强 · 弱', '只在第 1、3 拍踩下去', dict(k=K13, s=Z, h=Z, b=Z), True, 'strong'),
 (2, '咚 · 哒 · 咚 · 哒', '第 2、4 拍加上军鼓', dict(k=K13, s=SN, h=Z, b=Z), True, 'back'),
 (2, '加上镲：每拍两下', '节奏一下子「走」起来了', dict(k=K13, s=SN, h=HH, b=Z), True, 'hat'),
 (3, '底鼓挪一挪，再加贝斯', '这就是一首歌的骨架', dict(k=KF, s=SN, h=HH, b=BS), True, 'full'),
]
ROOTS = [45, 41, 36, 43]  # A2 F2 C2 G2 (MIDI), one per bar in the bass sections
bars, hits, t, bi = [], [], 0.0, 0
for n, head, sub, L, sw, key in SECT:
    for j in range(n):
        bars.append(dict(t=round(t, 4), head=head, sub=sub, sw=sw, key=key, first=(j == 0), **{k: v for k, v in L.items()}))
        for inst in 'kshb':
            for i, on in enumerate(L[inst]):
                if on: hits.append(dict(inst=inst, t=round(t + i * STEP, 4), step=i, bar=bi, note=ROOTS[bi % 4] if inst == 'b' else None))
        t += BAR; bi += 1
END = t + 1.2
json.dump(dict(bpm=BPM, step=STEP, bar=BAR, end=END, bars=bars, hits=hits), open('score.json', 'w'), ensure_ascii=False)
# ---- audio ----
D = '/dev/shm/m707/x/package/TR707WAV/'
smp = {k: sf.read(D + f, dtype='float32')[0] for k, f in dict(k='BassDrum1.wav', s='Snare1.wav', h='HhC.wav').items()}
gain = dict(k=1.0, s=0.75, h=0.28, b=0.55)
out = np.zeros(int(END * SR) + SR, np.float32)
def bass(note, dur):
    f = 440 * 2 ** ((note - 69) / 12); n = int(dur * SR); tt = np.arange(n) / SR
    w = np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(4 * np.pi * f * tt) + 0.12 * np.sin(6 * np.pi * f * tt)
    env = np.minimum(1, tt / 0.006) * np.exp(-tt / 0.22); return (w * env).astype(np.float32)
for h in hits:
    a = int(h['t'] * SR); x = smp[h['inst']] if h['inst'] != 'b' else bass(h['note'], STEP * 2.6)
    out[a:a + len(x)] += x * gain[h['inst']]
out = out[:int(END * SR)]; out[-int(0.8 * SR):] *= np.linspace(1, 0, int(0.8 * SR))
out *= 0.89 / np.max(np.abs(out)); sf.write('/dev/shm/m707/demo_audio.wav', np.stack([out, out], 1), SR)
print('bars', len(bars), 'hits', len(hits), 'end', round(END, 2))
