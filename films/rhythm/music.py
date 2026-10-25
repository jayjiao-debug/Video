"""《你有节奏感吗？》 — the track, synthesized from scratch, plus the event list the picture follows.
120 BPM, 4/4, A minor (Am–F–C–G). Layers enter one by one, then a drop, a 2-bar drum cut, and a return.
Writes public/track.wav and src/events.json (every hit: time, instrument, step, accent)."""
import json
import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100
BPM = 120
BEAT = 60 / BPM            # 0.5 s
BAR = 4 * BEAT             # 2 s
STEP = BEAT / 4            # 16th = 0.125 s
NBARS = 33
LEN = NBARS * BAR
rng = np.random.default_rng(3)
mix = np.zeros((int(SR * (LEN + 2)), 2)); drm = np.zeros_like(mix)
events = []

def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, btype='low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, btype='high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], btype='band', fs=SR, output='sos'), x)
def put(t, sig, g=1.0, pan=0.0, bus=None):
    b = mix if bus is None else bus
    i = int(t * SR); j = min(len(b), i + len(sig)); s = sig[: j - i] * g
    b[i:j, 0] += s * np.sqrt(0.5 * (1 - pan)); b[i:j, 1] += s * np.sqrt(0.5 * (1 + pan))
def ev(t, inst, accent=0, note=None):
    e = {'t': round(t, 4), 'i': inst, 'bar': int(t // BAR), 'step': int(round((t % BAR) / STEP)) % 16, 'a': accent}
    if note is not None: e['n'] = note
    events.append(e)

# ---------------------------------------------------------------- instruments
def kick(acc=0):
    x = tt(0.45); f = 48 + 90 * np.exp(-x * 28); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-x * (7 if acc else 9)) + 0.25 * np.tanh(4 * np.sin(ph)) * np.exp(-x * 30)
    s[:200] += lp(rng.standard_normal(200), 3000) * np.linspace(0.35, 0, 200)
    return np.tanh(s * (1.6 if acc else 1.3))
def clap():
    s = np.zeros(int(0.3 * SR))
    for k, d in enumerate((0, 0.011, 0.022)):
        n = bp(rng.standard_normal(int(0.03 * SR)), 900, 5000) * np.exp(-tt(0.03) * 140); i = int(d * SR); s[i:i + len(n)] += n * (0.8 if k < 2 else 1)
    tail = bp(rng.standard_normal(len(s)), 900, 4000) * np.exp(-tt(0.3) * 16) * 0.5; return (s + tail) * 1.4
def hat(open_=False):
    d = 0.22 if open_ else 0.05; n = hp(rng.standard_normal(int(d * SR)), 7000, 4); return n * np.exp(-tt(d) * (18 if open_ else 90))
def crash():
    d = 2.2; n = hp(rng.standard_normal(int(d * SR)), 4000, 2); return n * np.exp(-tt(d) * 2.2) * 0.6
def bass(f, d):
    x = tt(d); ph = 2 * np.pi * f * x; s = 0.7 * np.sin(ph) + 0.35 * np.sign(np.sin(ph)) * 0.5 + 0.3 * np.sin(2 * ph)
    env = np.minimum(1, x / 0.005) * np.exp(-x * 2.5); env[-200:] *= np.linspace(1, 0, 200); return lp(s * env, 900)
def saw(f, x, det=0.0): return 2 * ((x * f * (1 + det)) % 1) - 1
def chord(freqs, d):
    x = tt(d); s = sum(saw(f, x, dt) for f in freqs for dt in (-0.006, 0, 0.007)) / (3 * len(freqs))
    env = np.minimum(1, x / 0.01) * np.exp(-x * 5); env[-300:] *= np.linspace(1, 0, 300); return lp(s * env, 2600)
def pad(freqs, d):
    x = tt(d); s = sum(saw(f, x, dt) for f in freqs for dt in (-0.004, 0.005)) / (2 * len(freqs))
    env = np.minimum(1, x / 0.4) * np.minimum(1, (d - x) / 0.4); return lp(s * env, 1200)
def pluck(f, d=0.35):
    n = int(SR / f); buf = rng.uniform(-1, 1, n); out = np.zeros(int(d * SR))
    for i in range(len(out)): out[i] = buf[i % n]; buf[i % n] = 0.497 * (buf[i % n] + buf[(i + 1) % n])
    return lp(out, 5000) * 1.6
def riser(d):
    x = tt(d); n = rng.standard_normal(len(x)); out = np.zeros_like(n); chunk = 2048
    for k in range(0, len(n), chunk):
        fc = 400 + 7000 * (k / len(n)) ** 2; out[k:k + chunk] = bp(n[k:k + chunk], fc * 0.7, min(fc * 1.4, 18000))
    return out * (x / d) ** 2 * 0.5

# ---------------------------------------------------------------- arrangement (bar indices)
ROOT = {0: 55.0, 1: 43.65, 2: 65.41, 3: 49.0}                    # Am F C G, one chord per bar
CH = {0: [220.0, 261.63, 329.63], 1: [174.61, 220.0, 261.63], 2: [196.0, 261.63, 329.63], 3: [196.0, 246.94, 293.66]}
SEC = dict(kick=0, accent=4, clap=6, hat=8, bass=10, sync=12, chords=14, melody=16, build=17, drop=18, cut=26, back=28, end=33)
MEL = [(0, 440.0), (3, 523.25), (6, 659.25), (8, 587.33), (10, 523.25), (12, 440.0), (14, 392.0)]  # steps in a bar, A minor pentatonic
duck = np.ones(len(mix))

def on(b, name): return b >= SEC[name]
for b in range(NBARS):
    t0 = b * BAR; c = b % 4
    drums = not (SEC['cut'] <= b < SEC['back']) and b < 31
    for beat in range(4):
        t = t0 + beat * BEAT
        if drums and (b != SEC['build'] or beat < 2):
            acc = 1 if (on(b, 'accent') and beat == 0) else 0
            put(t, kick(acc), 0.95 if acc else 0.8, bus=drm); ev(t, 'kick', acc)
            i = int(t * SR); k = int(0.25 * SR); duck[i:i + k] = np.minimum(duck[i:i + k], 0.35 + 0.65 * np.linspace(0, 1, k) ** 0.6)
        if drums and on(b, 'clap') and beat in (1, 3): put(t, clap(), 0.55, 0.05, bus=drm); ev(t, 'clap')
        if drums and on(b, 'hat'): put(t + BEAT / 2, hat(True), 0.22, 0.25, bus=drm); ev(t + BEAT / 2, 'hat')
    if drums and on(b, 'drop'):
        for s in range(16):
            if s % 2 == 1: put(t0 + s * STEP, hat(False), 0.12, -0.3, bus=drm)
    if on(b, 'bass') and b < 31:
        pat = [0, 4, 8, 12] if b < SEC['sync'] else [0, 3, 6, 10, 12, 14]      # straight, then syncopated
        for s in pat:
            d = (4 if b < SEC['sync'] else (3 if s in (0, 3) else 2)) * STEP
            put(t0 + s * STEP, bass(ROOT[c] * (2 if s in (10, 14) and b >= SEC['sync'] else 1), d), 0.55); ev(t0 + s * STEP, 'bass', note=c)
    if on(b, 'chords') and b < 31 and not (SEC['cut'] <= b < SEC['back']):
        for s in (2, 6, 10, 14): put(t0 + s * STEP, chord(CH[c], 1.5 * STEP), 0.35, 0.0); ev(t0 + s * STEP, 'chords', note=c)
    if SEC['cut'] <= b < SEC['back'] or b >= 31: put(t0, pad(CH[c], BAR), 0.25)
    if on(b, 'melody') and b < 31 and not (SEC['cut'] <= b < SEC['back']):
        for s, f in MEL:
            ff = f * (1.0 if b % 2 == 0 or s < 8 else 1.122)
            put(t0 + s * STEP, pluck(ff), 0.32, 0.15); ev(t0 + s * STEP, 'melody', note=round(ff, 1))
    if b == SEC['build']:
        put(t0, riser(BAR), 0.6)
        for s in range(16): put(t0 + s * STEP, clap(), 0.18 + 0.03 * s, bus=drm); ev(t0 + s * STEP, 'roll')
    if b in (SEC['drop'], SEC['back']): put(t0, crash(), 0.5, bus=drm); ev(t0, 'crash')

# sidechain the musical layers (bass already short) by re-mixing with the duck envelope on the right parts
i0, i1 = int(SEC['build'] * BAR * SR), int(SEC['drop'] * BAR * SR)   # close the filter over the build so the drop opens up
for ch in (0, 1): mix[i0:i1, ch] = lp(mix[i0:i1, ch], 700) * 0.8
mix *= np.clip(duck[:, None] * 0.6 + 0.4, 0, 1)   # pump the music under the kick
mix = np.tanh((mix + drm) * 1.3) * 0.85
mix[int(LEN * SR):] = 0
fade = int(1.2 * SR); e = int(LEN * SR); mix[e - fade:e] *= np.linspace(1, 0, fade)[:, None]
from scipy.io import wavfile
wavfile.write('public/track.wav', SR, (mix[:e] / np.abs(mix).max() * 0.9 * 32767).astype(np.int16))
json.dump({'bpm': BPM, 'bar': BAR, 'len': LEN, 'sec': SEC, 'events': sorted(events, key=lambda e: e['t'])}, open('src/events.json', 'w'), ensure_ascii=False)
print('ok', LEN, len(events))
