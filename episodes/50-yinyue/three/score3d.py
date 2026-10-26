"""Drummer-cat motion test: one score → hits.json (for the picture) and drums.wav (TR-707 samples, public domain).
100 BPM, 4 bars of a basic rock groove: kick 1 & 3 (+ the 'and' of 3 in bars 2 and 4), snare 2 & 4, closed hats on 8ths,
then a last kick + crash on the downbeat of bar 5."""
import json, os, numpy as np, soundfile as sf
SR, BPM, T0 = 44100, 100, 0.5
B = 60 / BPM
D = os.environ.get('M707', '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/m707/package/TR707WAV/')
hits = []
for bar in range(4):
    for e in range(8):                       # eighths
        t = T0 + (bar * 4 + e / 2) * B
        hits.append({'i': 'hat', 't': t, 'v': .9 if e % 2 == 0 else .6})
        if e in (0, 4) or (bar % 2 == 1 and e == 5): hits.append({'i': 'kick', 't': t, 'v': 1})
        if e in (2, 6): hits.append({'i': 'snare', 't': t, 'v': 1})
end = T0 + 16 * B
hits += [{'i': 'kick', 't': end, 'v': 1}, {'i': 'crash', 't': end, 'v': 1}]
DUR = end + 2.2
ld = lambda f: (lambda x: x.mean(1) if x.ndim > 1 else x)(sf.read(D + f, dtype='float32')[0])
smp = {'kick': (ld('BassDrum1.wav'), .95), 'snare': (ld('Snare1.wav'), .7), 'hat': (ld('HhC.wav'), .3), 'crash': (ld('Crash.wav'), .45)}
out = np.zeros(int((DUR + 1) * SR), np.float32)
for h in hits:
    x, g = smp[h['i']]; a = int(h['t'] * SR); n = min(len(x), len(out) - a); out[a:a + n] += x[:n] * g * h['v']
out = out[:int(DUR * SR)]; out[-int(.6 * SR):] *= np.linspace(1, 0, int(.6 * SR)) ** 2
out *= 10 ** (-1 / 20) / np.max(np.abs(out))
sf.write(os.environ.get('OUTWAV', 'drums.wav'), np.stack([out, out], 1), SR)
json.dump({'bpm': BPM, 't0': T0, 'beat': B, 'dur': DUR, 'hits': sorted(hits, key=lambda h: h['t'])}, open('hits.json', 'w'))
print('dur', round(DUR, 2), 'hits', len(hits))
