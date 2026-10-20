"""ep35 15-second sample soundtrack (film 0 = BGM 29.5 s, so the track's drop at 42.478 s lands at film 12.978 = the title plank).
BGM (owner's earlier track, placeholder) + synthesized foley: platform room tone, a train rumble under the clock spin,
accelerating clock ticks, hill wind, the plank's fall (air) and landing (wood knock + strings snapping taut).
Usage: BGM=... OUT=... python3 sample_mix.py"""
import os, subprocess, json, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
SR = 48000; T = 16.5; OFF = 29.5; DROP = 12.978
rng = np.random.default_rng(7)
n = int(T * SR); tt = np.arange(n) / SR
def load(path, t0, dur):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(t0), '-t', str(dur), '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, 'float32').reshape(-1, 2).copy(); out = np.zeros((n, 2), 'float32'); out[:min(n, len(x))] = x[:n]; return out
def bp(x, lo, hi, order=2): return sosfilt(butter(order, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def lp(x, f, order=2): return sosfilt(butter(order, f, 'lowpass', fs=SR, output='sos'), x)
def env(points):                                   # piecewise-linear envelope from (time, gain) points
    ts, gs = zip(*points); return np.interp(tt, ts, gs)
def db(g): return 10 ** (g / 20)
mix = np.zeros((n, 2))
# BGM
bgm = load(os.environ['BGM'], OFF, T)
bgm *= env([(0, 0), (1.0, 1), (T - 0.8, 1), (T, 0)])[:, None]
mix += bgm * db(-1)
# platform room tone (brown-ish noise, low), fading out through the cross-dissolve
room = lp(np.cumsum(rng.standard_normal(n)) * 0.002, 220)
room = room / np.abs(room).max()
mix += (room * env([(0, 0), (0.6, 1), (6.4, 1), (7.0, 0), (T, 0)]) * db(-30))[:, None]
# train rumble swelling under the clock spin
rum = bp(rng.standard_normal(n), 45, 240, 3); rum /= np.abs(rum).max()
mix += (rum * env([(0, 0), (3.6, 0), (4.6, 1), (5.4, 0.8), (6.6, 0), (T, 0)]) * db(-20))[:, None] * np.array([0.8, 1.0])
# accelerating clock ticks during the spin (3.9 → 5.6)
def click(at, g):
    i = int(at * SR); L = int(0.03 * SR)
    if i + L >= n: return
    c = bp(rng.standard_normal(L), 2500, 6000) * np.exp(-np.arange(L) / (0.004 * SR)); c /= np.abs(c).max()
    mix[i:i + L] += (c * db(g))[:, None]
u = np.linspace(0, 1, 34); ease = np.where(u < 0.5, 4 * u ** 3, 1 - (-2 * u + 2) ** 3 / 2)
for k, e in enumerate(np.unique(np.round(3.9 + 1.7 * ease, 3))): click(e, -22 if k % 2 else -19)
# wind on the hill
wind = bp(rng.standard_normal(n), 300, 1400, 2); wind /= np.abs(wind).max()
wmod = 0.6 + 0.4 * np.sin(2 * np.pi * 0.23 * tt) * np.sin(2 * np.pi * 0.07 * tt + 1)
mix += (wind * wmod * env([(0, 0), (6.4, 0), (7.4, 1), (T, 1)]) * db(-34))[:, None] * np.array([1.0, 0.85])
# the plank: air as it falls, then the knock and the strings snapping taut
air = bp(rng.standard_normal(n), 600, 4000, 2); air /= np.abs(air).max()
mix += (air * env([(0, 0), (DROP - 0.6, 0), (DROP - 0.05, 1), (DROP, 0), (T, 0)]) ** 2 * db(-26))[:, None]
i0 = int(DROP * SR); L = int(0.9 * SR); tk = np.arange(L) / SR
knock = sum(a * np.sin(2 * np.pi * f * tk) * np.exp(-tk / d) for f, a, d in [(165, 1.0, 0.16), (410, 0.6, 0.07), (930, 0.35, 0.03), (2100, 0.2, 0.012)])
knock += bp(rng.standard_normal(L), 800, 5000) * np.exp(-tk / 0.008) * 0.6
knock /= np.abs(knock).max()
twang = sum(np.sin(2 * np.pi * f * tk * (1 + 0.004 * np.sin(2 * np.pi * 6 * tk))) * np.exp(-tk / 0.35) for f in (523.0, 659.0)) / 2
mix[i0:i0 + L] += (knock * db(-9))[:, None] + (twang * db(-30))[:, None] * np.array([1.0, 0.7])
for k, d in enumerate([0.16, 0.30, 0.42]):                 # two small settling knocks as the plank bounces
    j = int((DROP + d) * SR); m = min(L, n - j); mix[j:j + m] += (knock[:m] * db(-24 - 5 * k))[:, None]
# loudness: -14 LUFS / -1.5 dBTP, two passes
os.makedirs('/tmp/claude-0', exist_ok=True)
pre = os.environ['OUT'] + '.pre.wav'; sf.write(pre, mix.astype('float32'), SR, subtype='FLOAT')
m = subprocess.run(['ffmpeg', '-hide_banner', '-i', pre, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
js = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', pre, '-af', f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true", '-ar', str(SR), '-c:a', 'pcm_s16le', os.environ['OUT']], check=True)
os.remove(pre); print('ok', js['input_i'])
