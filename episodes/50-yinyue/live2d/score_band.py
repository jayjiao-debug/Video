"""Band test score (100 BPM, 4 bars + an ending): one clock for sound and picture.
Writes band.json (every event: drums, bass notes, key chords, lead notes) and band.wav.
Drums: TR-707 samples (public domain). Bass, keys and the sung lead ('aah', a formant synth) are synthesised here."""
import json, os, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
SR, BPM, T0 = 44100, 100, 0.5
B = 60 / BPM; E8 = B / 2
D = os.environ.get('M707', '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/m707/package/TR707WAV/')
ev = []
CH = [('C', [48, 52, 55], 36), ('Am', [45, 48, 52], 33), ('F', [41, 45, 48], 29), ('G', [43, 47, 50], 31)]
LEAD = [[(0, 1, 76), (1, 1, 79), (2, 1, 81), (3, 1, 79)], [(0, 2, 76), (2, 1, 74), (3, 1, 72)],
        [(0, 1, 74), (1, 1, 76), (2, 1, 77), (3, 1, 81)], [(0, 3, 79)]]
for bar in range(4):
    tb = T0 + bar * 4 * B
    for e in range(8):
        t = tb + e * E8
        ev.append({'i': 'hat', 't': t, 'v': .9 if e % 2 == 0 else .6})
        if e in (0, 4) or (bar % 2 == 1 and e == 5): ev.append({'i': 'kick', 't': t, 'v': 1})
        if e in (2, 6): ev.append({'i': 'snare', 't': t, 'v': 1})
    name, chord, root = CH[bar]
    for e, off in ((0, 0), (3, 0), (4, 12), (6, 7)): ev.append({'i': 'bass', 't': tb + e * E8, 'd': E8 * 1.6, 'n': root + off, 'bar': bar})
    for e in (2, 6): ev.append({'i': 'keys', 't': tb + e * E8, 'd': B * .7, 'n': [c + 12 for c in chord], 'bar': bar})
    for beat, dur, n in LEAD[bar]: ev.append({'i': 'lead', 't': tb + beat * B, 'd': dur * B * .92, 'n': n})
END = T0 + 16 * B
ev += [{'i': 'kick', 't': END, 'v': 1}, {'i': 'crash', 't': END, 'v': 1}, {'i': 'bass', 't': END, 'd': 1.6, 'n': 36, 'bar': 4},
       {'i': 'keys', 't': END, 'd': 1.8, 'n': [60, 64, 67, 72], 'bar': 4}, {'i': 'lead', 't': END, 'd': 1.5, 'n': 72}]
DUR = END + 2.2
f = lambda n: 440 * 2 ** ((n - 69) / 12)
out = np.zeros(int((DUR + 1) * SR), np.float32)
def put(x, t, g): a = int(t * SR); n = min(len(x), len(out) - a); out[a:a + n] += (x[:n] * g).astype(np.float32)
ld = lambda fn: (lambda x: x.mean(1) if x.ndim > 1 else x)(sf.read(D + fn, dtype='float32')[0])
smp = {'kick': (ld('BassDrum1.wav'), .9), 'snare': (ld('Snare1.wav'), .65), 'hat': (ld('HhC.wav'), .25), 'crash': (ld('Crash.wav'), .4)}
lp = lambda x, fc: sosfilt(butter(2, fc, 'low', fs=SR, output='sos'), x)
bp = lambda x, fc, q: sosfilt(butter(2, [fc / (1 + 1 / q), fc * (1 + 1 / q)], 'band', fs=SR, output='sos'), x)
def bass(n, d):
    t = np.arange(int((d + .3) * SR)) / SR; fr = f(n)
    x = .6 * np.sin(2 * np.pi * fr * t) + .4 * (2 * ((fr * t) % 1) - 1)
    env = np.minimum(t / .005, 1) * np.exp(-t / .5) * np.clip((d + .3 - t) / .3, 0, 1)
    return lp(x, 700) * env
def keys(ns, d):
    t = np.arange(int((d + .6) * SR)) / SR; x = 0
    for n in ns: fr = f(n); x = x + np.sin(2 * np.pi * fr * t + .8 * np.exp(-t / .15) * np.sin(2 * np.pi * fr * 2 * t)) + .25 * np.sin(2 * np.pi * 2 * fr * t) * np.exp(-t / .2)
    env = np.minimum(t / .003, 1) * np.exp(-t / .55) * np.clip((d + .6 - t) / .4, 0, 1) * (1 + .15 * np.sin(2 * np.pi * 5 * t))
    return x * env / len(ns)
def lead(n, d):   # an 'aah' voice: a vibrato saw through two vowel formants
    t = np.arange(int((d + .25) * SR)) / SR; vib = 1 + .006 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(t / .3, 1)
    ph = np.cumsum(f(n) * vib) / SR; x = 2 * (ph % 1) - 1
    y = bp(x, 800, 4) + .6 * bp(x, 1150, 5) + .25 * bp(x, 2600, 6)
    env = np.minimum(t / .04, 1) * np.clip((d + .25 - t) / .25, 0, 1)
    return y * env
for e in ev:
    if e['i'] in smp: x, g = smp[e['i']]; put(x, e['t'], g * e.get('v', 1))
    elif e['i'] == 'bass': put(bass(e['n'], e['d']), e['t'], .55)
    elif e['i'] == 'keys': put(keys(e['n'], e['d']), e['t'], .28)
    elif e['i'] == 'lead': put(lead(e['n'], e['d']), e['t'], 1.1)
out = out[:int(DUR * SR)]; out[-int(.6 * SR):] *= np.linspace(1, 0, int(.6 * SR)) ** 2
out *= 10 ** (-1 / 20) / np.max(np.abs(out))
sf.write(os.environ.get('OUTWAV', 'band.wav'), np.stack([out, out], 1), SR)
json.dump({'bpm': BPM, 't0': T0, 'beat': B, 'dur': DUR, 'hits': sorted(ev, key=lambda h: h['t'])}, open('band.json', 'w'))
print('dur', round(DUR, 2), 'events', len(ev))
