"""ep50 final mix: the music bed (ep50_bed.wav, −14 LUFS) + sound effects placed from sfx_cues.json.
sfx_cues.json: [{"t": film s, "sfx": "iron_drag", "db": -4, "fade_in": 0.0, "fade_out": 0.3, "len": null}, ...]
Each effect is first normalised to −20 LUFS (short sounds: by peak to −8 dBFS), then given its cue gain.
The bed dips 2 dB for 0.6 s around loud effects (db ≥ −2) so they read without the mix getting louder.
Output: ep50_mix.wav (48 kHz stereo, −14 LUFS integrated, ≤ −1 dBTP). Audio files are gitignored."""
import json, os, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.ndimage import uniform_filter1d
SR = 48000; A = os.path.dirname(os.path.abspath(__file__))
SFX = '/tmp/claude-0/-home-claude/bf206d1e-1152-5595-9b84-b15be6e5a777/scratchpad/sfx50'
def load(path):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
bed = load(f'{A}/ep50_bed.wav'); n = len(bed); meter = pyln.Meter(SR)
fx = np.zeros_like(bed); duck = np.zeros(n, np.float32)
for c in json.load(open(f'{A}/sfx_cues.json')):
    a = load(f"{SFX}/sfx_{c['sfx']}.mp3")
    if c.get('len'): a = a[:int(c['len'] * SR)]
    if len(a) / SR > 0.5:
        L = meter.integrated_loudness(a)
        a *= 10 ** ((-20 - L) / 20) if np.isfinite(L) else 1
    else: a *= 10 ** (-8 / 20) / max(np.abs(a).max(), 1e-6)
    fi, fo = int(c.get('fade_in', 0.0) * SR), int(c.get('fade_out', 0.15) * SR)
    if fi: a[:fi] *= np.linspace(0, 1, fi)[:, None]
    if fo: a[-fo:] *= np.linspace(1, 0, fo)[:, None]
    a *= 10 ** (c.get('db', -6) / 20)
    i0 = int(c['t'] * SR); m = min(len(a), n - i0)
    if m > 0: fx[i0:i0 + m] += a[:m]
    if c.get('db', -6) >= -2: duck[max(0, i0 - int(0.05 * SR)): i0 + int(0.6 * SR)] = 1
env = 10 ** (-2 * uniform_filter1d(duck, int(0.15 * SR)) / 20)
mix = bed * env[:, None] + fx
mix *= 10 ** ((-14 - meter.integrated_loudness(mix)) / 20)
pk = np.abs(mix).max()
if pk > 0.89: mix = (np.tanh(mix / 0.89) * 0.89).astype(np.float32); mix *= 10 ** ((-14 - meter.integrated_loudness(mix)) / 20)
sf.write(f'{A}/ep50_mix.wav', mix.astype(np.float32), SR, subtype='PCM_24')
print('LUFS', round(meter.integrated_loudness(mix), 2), 'peak dBFS', round(20 * np.log10(np.abs(mix).max()), 2))
