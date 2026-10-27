"""喵喵乐队 30 s test (heartbeat hook + BPM cats): one score for picture and sound.
python3 score.py <outdir>  → <outdir>/score.json (events the picture reads) + <outdir>/music.wav (48 kHz stereo, unmastered)"""
import json, math, os, sys
import numpy as np

OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
os.makedirs(OUT, exist_ok=True)
SR, DUR = 48000, 30.0
N = int(SR * DUR)
rng = np.random.default_rng(7)

# ------------------------------------------------------------------ timing (the picture reads exactly these numbers)
HB = 60 / 72                                   # heartbeat period, 72 BPM
heart = [round(1.0 + i * HB, 4) for i in range(11)]          # 1.00 … 9.33
steps = heart[2:9]                             # the big cat's footfalls (it stops after the 7th)
lanes = [
    {'key': 'b60', 'bpm': 60, 'appear': 10.3, 'first': 12.0, 'fur': 'blue', 'mood': 'sleep', 'word': '咚', 'y': 440},
    {'key': 'b120', 'bpm': 120, 'appear': 15.3, 'first': 17.0, 'fur': 'yellow', 'mood': 'happy', 'word': '嗒', 'y': 690},
    {'key': 'b180', 'bpm': 180, 'appear': 20.3, 'first': 22.0, 'fur': 'pink', 'mood': 'sweat', 'word': '次', 'y': 940},
]
END_HIT = 29.0
for ln in lanes:
    p = 60 / ln['bpm']; n = int(round((END_HIT - ln['first']) / p)) + 1
    ln['hits'] = [round(ln['first'] + i * p, 4) for i in range(n)]
subs = [
    (2.4, 9.4, '你身体里，本来就有一个节拍器'),
    (10.6, 15.0, 'BPM：一分钟走几步。60，就是一秒一步'),
    (15.6, 20.0, '120：一秒两步，像进行曲'),
    (20.6, 25.0, '180：一秒三步……猫已经在逃命了'),
    (25.6, 30.0, '一样的速度往前走，节拍越快，猫越挤'),
]
score = {'fps': 30, 'dur': DUR, 'heart': heart, 'steps': steps, 'jump': 9.55, 'lanes': lanes, 'end': END_HIT,
         'subs': [{'a': a, 'b': b, 'text': t} for a, b, t in subs]}
json.dump(score, open(f'{OUT}/score.json', 'w'), ensure_ascii=False, indent=1)

# ------------------------------------------------------------------ instruments
L = np.zeros(N); R = np.zeros(N)
def put(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR); j = min(N, i + len(sig))
    if i >= N: return
    gl, gr = math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4)
    L[i:j] += sig[:j - i] * gain * gl * 1.414; R[i:j] += sig[:j - i] * gain * gr * 1.414
def tt(sec): return np.arange(int(sec * SR)) / SR
def att(t, a=0.003): return np.minimum(1, t / a)
def hz(midi): return 440 * 2 ** ((midi - 69) / 12)

def heartbeat(strong=True):
    t = tt(0.35); f = 62 - 18 * np.minimum(1, t / 0.08)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * att(t, .004) * np.exp(-t * (14 if strong else 20)) * (1 if strong else .55)
def tom(m):
    t = tt(0.9); f = hz(m) * (1 + 0.6 * np.exp(-t * 40))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-t * 4.5) + 0.25 * np.sin(2 * ph) * np.exp(-t * 9)) * att(t)
def marimba(m):
    t = tt(1.0); f = hz(m)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 5.5) + 0.35 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * 22)
            + 0.08 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 60)) * att(t, .002)
def glock(m):
    t = tt(1.4); f = hz(m)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 3) + 0.25 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6)
            + 0.1 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 12)) * att(t, .001)
def kick():
    t = tt(0.4); f = 50 + 90 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * att(t, .001)
def soft(x, k):  # cheap low-pass: moving average of k samples
    return np.convolve(x, np.ones(k) / k, mode='same')
def whoosh(sec=0.5, up=True):
    t = tt(sec); n = rng.standard_normal(len(t)); env = np.sin(np.pi * t / sec) ** 2
    return (soft(n, 9) * 0.6 + soft(n, 30) * 0.8) * env
def shimmer():
    t = tt(2.2); n = rng.standard_normal(len(t))
    return (n - soft(n, 6)) * np.exp(-t * 2.2) * 0.35 * att(t, .002)
def pad(ms, sec):
    t = tt(sec); env = np.minimum(1, t / 0.6) * np.minimum(1, (sec - t) / 0.8)
    s = np.zeros(len(t))
    for m in ms:
        for d in (-0.06, 0.06):
            f = hz(m + d); s += np.sin(2 * np.pi * f * t) + np.sin(6 * np.pi * f * t) / 9
    return s * env / (2 * len(ms))

# ------------------------------------------------------------------ the score
# hook: heartbeat (lub-dub), a quiet pad on C
for i, h in enumerate(heart):
    put(heartbeat(True), h, 0.9); put(heartbeat(False), h + 0.19, 0.9)
    if h in steps: put(marimba(48), h, 0.25)                   # a soft wooden "咚" under each footfall
put(pad([48, 55, 64], 7.0), 3.0, 0.12)
put(whoosh(0.45), 9.5, 0.35)
put(glock(84), 9.95, 0.18, 0.2)
# BPM: chords change every 2 s from 12 s: C Am F G
CH = [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]]
def chord(t): return CH[int((t - 12) // 2) % 4] if t >= 12 else CH[0]
for k in range(9):
    t0 = 12 + 2 * k
    if t0 < 30: put(pad([m + 12 for m in chord(t0)], 2.3), t0 - 0.1, 0.07)
for ln in lanes:
    for i, h in enumerate(ln['hits']):
        c = chord(h)
        if ln['bpm'] == 60:
            put(tom(c[0] - 12), h, 0.55, -0.15); put(kick(), h, 0.35)
        elif ln['bpm'] == 120:
            put(marimba([c[0], c[1], c[2], c[1]][i % 4] + 12), h, 0.32, 0.25)
        else:
            put(glock([c[2], c[1], c[0]][i % 3] + 36 - (12 if c[2] + 36 > 88 else 0)), h, 0.11, -0.35)
put(shimmer(), END_HIT, 0.5)
for m in CH[0]: put(glock(m + 36), END_HIT, 0.1)

# ------------------------------------------------------------------ room: short synthetic reverb (convolution)
irt = tt(1.3); ir = rng.standard_normal(len(irt)) * np.exp(-irt * 4.5); ir[:int(.012 * SR)] = 0; ir /= np.sqrt((ir ** 2).sum())
def conv(x): n = len(x) + len(ir); n2 = 1 << (n - 1).bit_length(); return np.fft.irfft(np.fft.rfft(x, n2) * np.fft.rfft(ir, n2), n2)[:len(x)]
wl, wr = conv(L), conv(R)
L2, R2 = L + 0.18 * wl, R + 0.18 * np.roll(wr, 240)
peak = max(np.abs(L2).max(), np.abs(R2).max()); L2 /= peak / 0.8; R2 /= peak / 0.8
st = (np.stack([L2, R2], 1) * 32767).astype('<i2')
import wave
with wave.open(f'{OUT}/music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
print('score', len(lanes[0]['hits']), len(lanes[1]['hits']), len(lanes[2]['hits']), 'hits; wav ok')
