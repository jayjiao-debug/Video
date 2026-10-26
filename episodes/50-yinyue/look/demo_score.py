"""Music series look demo (≈17 s): the heartbeat becomes the first drum, then BPM.
One clock for sound and picture: writes demo_score.json (beats, hits, phase table) and /dev/shm/m707/look_demo.wav.
Sounds: TR-707 samples (public domain, npm @fluid-music/tr-707), the heartbeat is the 707 kick pitched down and muffled."""
import json, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample
SR = 44100
T0, BPM0, BPM1, RAMP = 0.25, 80.0, 120.0, 2.0
BEAT_RAMP = 13                       # the ramp starts on this beat (two bars after the record)
T1 = T0 + BEAT_RAMP * 60 / BPM0
END_PHASE = 25                       # two bars at 120 after the hats come in
def phase(t):
    if t < T1: return (t - T0) * BPM0 / 60
    if t < T1 + RAMP: d = t - T1; return BEAT_RAMP + (BPM0 * d + (BPM1 - BPM0) * d * d / (2 * RAMP)) / 60
    return BEAT_RAMP + (BPM0 + BPM1) / 2 * RAMP / 60 + (t - T1 - RAMP) * BPM1 / 60
def bpm(t): return BPM0 if t < T1 else BPM1 if t > T1 + RAMP else BPM0 + (BPM1 - BPM0) * (t - T1) / RAMP
def t_of(ph):                        # invert phase() by bisection
    lo, hi = 0.0, 60.0
    for _ in range(60):
        m = (lo + hi) / 2; lo, hi = (m, hi) if phase(m) < ph else (lo, m)
    return lo
beats = [round(t_of(k), 5) for k in range(0, END_PHASE + 1)]
END = beats[-1] + 1.0
REC = 5                              # the record takes over on beat 5
HAT = 17                             # hats (8ths) and claps from beat 17 (a bar start for the record)
hits = []
for k, t in enumerate(beats[:-1]):
    if k < REC + 2: hits.append({'inst': 'heart', 't': t, 'k': k, 'v': 1.0 if k < REC else 1 - (k - REC + 1) / 3})
    if k >= REC: hits.append({'inst': 'kick', 't': t, 'k': k, 'v': min(1, .6 + .2 * (k - REC))})
    if k >= HAT and (k - REC) % 4 in (1, 3): hits.append({'inst': 'clap', 't': t, 'k': k, 'v': 1.0})
for h in range(HAT * 2, END_PHASE * 2):
    hits.append({'inst': 'hat', 't': round(t_of(h / 2), 5), 'k': h, 'v': .9 if h % 2 else .6})
hits.append({'inst': 'kick', 't': beats[-1], 'k': END_PHASE, 'v': 1.0})   # the last downbeat, then let it ring
import os
D = os.environ.get('M707', '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/m707/package/TR707WAV/')   # npm pack @fluid-music/tr-707 (README: all samples public domain)
ld = lambda f: (lambda x: x.mean(1) if x.ndim > 1 else x)(sf.read(D + f, dtype='float32')[0])
kick, hat, clap = ld('BassDrum1.wav'), ld('HhC.wav'), ld('HandClap.wav')
lp = lambda x, f: sosfilt(butter(4, f, 'low', fs=SR, output='sos'), x).astype(np.float32)
heart1 = lp(resample(kick, int(len(kick) / .62)), 260) * 2.6          # lub: lower, muffled (heard from inside)
heart2 = lp(resample(kick, int(len(kick) / .72)), 300) * 1.5          # dub
out = np.zeros(int((END + 1) * SR), np.float32)
def put(x, t, g):
    a = int(t * SR); n = min(len(x), len(out) - a); out[a:a + n] += x[:n] * g
for h in hits:
    if h['inst'] == 'heart': put(heart1, h['t'], h['v']); put(heart2, h['t'] + .27, .7 * h['v'])
    elif h['inst'] == 'kick': put(kick, h['t'], .9 * h['v'])
    elif h['inst'] == 'clap': put(clap, h['t'], .55 * h['v'])
    else: put(hat, h['t'], .32 * h['v'])
# womb hush under the opening only (very quiet, filtered), gone by the record
rng = np.random.default_rng(1); hush = lp(np.cumsum(rng.standard_normal(len(out))).astype(np.float32), 180); hush /= np.max(np.abs(hush))
env = np.clip(1 - (np.arange(len(out)) / SR - 3.0) / 1.0, 0, 1) * np.clip(np.arange(len(out)) / SR / .2, 0, 1)
out += hush * env * .03
out[int((END - .2) * SR):] *= np.linspace(1, 0, len(out) - int((END - .2) * SR)) ** 2
out *= 10 ** (-1.5 / 20) / np.max(np.abs(out))
sf.write(os.environ.get('OUTWAV', 'look_demo.wav'), np.stack([out, out], 1), SR)
json.dump({'T0': T0, 'T1': T1, 'RAMP': RAMP, 'BPM0': BPM0, 'BPM1': BPM1, 'END': END, 'REC': REC, 'HAT': HAT, 'beats': beats, 'hits': hits,
           'ph': [[round(t, 3), round(phase(t), 5), round(bpm(t), 2)] for t in np.arange(0, END + .5, 1 / 120)]}, open('demo_score.json', 'w'))
print('end', round(END, 2), 's; ramp', round(T1, 2), '→', round(T1 + RAMP, 2), '; record from', beats[REC], '; hats from', round(t_of(HAT), 2))
