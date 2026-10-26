"""Music series look demo (≈32 s): the heartbeat becomes the first drum, then BPM.
One clock for sound and picture: writes demo_score.json (beats, hits, phase table) and /dev/shm/m707/look_demo.wav.
Sounds: TR-707 samples (public domain, npm @fluid-music/tr-707), the heartbeat is the 707 kick pitched down and muffled."""
import json, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample
SR = 44100
T0, BPM0, BPM1, RAMP = 0.6, 72.0, 120.0, 4.0
BEAT_RAMP = 24                       # the ramp starts on this beat (start of bar 7)
T1 = T0 + BEAT_RAMP * 60 / BPM0
END_PHASE = 44                       # three bars at 120
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
END = beats[-1] + 1.4
REC = 12                             # the record takes over on beat 12 (bar 4, beat 1)
HAT = 32                             # hats (8ths) from beat 32
hits = []
for k, t in enumerate(beats[:-1]):
    if k < REC + 4: hits.append({'inst': 'heart', 't': t, 'k': k, 'v': 1.0 if k < REC else 1 - (k - REC + 1) / 5})
    if k >= REC: hits.append({'inst': 'kick', 't': t, 'k': k, 'v': min(1, .45 + .15 * (k - REC))})
for h in range(HAT * 2, END_PHASE * 2):
    hits.append({'inst': 'hat', 't': round(t_of(h / 2), 5), 'k': h, 'v': .9 if h % 2 else .6})
hits.append({'inst': 'kick', 't': beats[-1], 'k': END_PHASE, 'v': 1.0})   # the last downbeat, then let it ring
D = '/dev/shm/m707/x/package/TR707WAV/'
ld = lambda f: (lambda x: x.mean(1) if x.ndim > 1 else x)(sf.read(D + f, dtype='float32')[0])
kick, hat = ld('BassDrum1.wav'), ld('HhC.wav')
lp = lambda x, f: sosfilt(butter(4, f, 'low', fs=SR, output='sos'), x).astype(np.float32)
heart1 = lp(resample(kick, int(len(kick) / .62)), 260) * 2.6          # lub: lower, muffled (heard from inside)
heart2 = lp(resample(kick, int(len(kick) / .72)), 300) * 1.5          # dub
out = np.zeros(int((END + 1) * SR), np.float32)
def put(x, t, g):
    a = int(t * SR); n = min(len(x), len(out) - a); out[a:a + n] += x[:n] * g
for h in hits:
    if h['inst'] == 'heart': put(heart1, h['t'], h['v']); put(heart2, h['t'] + .27, .7 * h['v'])
    elif h['inst'] == 'kick': put(kick, h['t'], .9 * h['v'])
    else: put(hat, h['t'], .32 * h['v'])
# womb hush under the opening only (very quiet, filtered), gone by the record
rng = np.random.default_rng(1); hush = lp(np.cumsum(rng.standard_normal(len(out))).astype(np.float32), 180); hush /= np.max(np.abs(hush))
env = np.clip(1 - (np.arange(len(out)) / SR - 8.5) / 2.0, 0, 1) * np.clip(np.arange(len(out)) / SR / .5, 0, 1)
out += hush * env * .03
out[int((END - .2) * SR):] *= np.linspace(1, 0, len(out) - int((END - .2) * SR)) ** 2
out *= 10 ** (-1.5 / 20) / np.max(np.abs(out))
sf.write('/dev/shm/m707/look_demo.wav', np.stack([out, out], 1), SR)
json.dump({'T0': T0, 'T1': T1, 'RAMP': RAMP, 'BPM0': BPM0, 'BPM1': BPM1, 'END': END, 'REC': REC, 'HAT': HAT, 'beats': beats, 'hits': hits,
           'ph': [[round(t, 3), round(phase(t), 5), round(bpm(t), 2)] for t in np.arange(0, END + .5, 1 / 120)]}, open('demo_score.json', 'w'))
print('end', round(END, 2), 's; ramp', round(T1, 2), '→', round(T1 + RAMP, 2), '; record from', beats[REC], '; hats from', round(t_of(HAT), 2))
