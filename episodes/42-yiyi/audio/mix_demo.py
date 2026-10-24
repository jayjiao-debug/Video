"""ep42 30-second demo mix: the A_valley bed (0–32.27 s) + the demo voice lines, ep41's mix rules
(voice −15 LUFS each, bed at voice −2 LU, bridged 2 dB duck + −3 dB carve of 900–4500 Hz under speech), −14 LUFS delivery."""
import numpy as np, subprocess, json, os, pyloudnorm as pyln, soundfile as sf
from scipy.ndimage import uniform_filter1d
from scipy.signal import butter, sosfiltfilt
SR = 48000; A = os.path.dirname(os.path.abspath(__file__)); END = 32.27 + 0.4
BED = '/tmp/claude-0/-home-claude/bf206d1e-1152-5595-9b84-b15be6e5a777/scratchpad/music42/ep42_bed_optionA_valley.wav'
def load(path, af=''):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path] + (['-af', af] if af else []) + ['-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
LINES = [('vo01/Q0b', 0.0, 'highpass=f=90,aecho=0.6:0.4:30:0.12'), ('vo01/O1', 2.267, ''), ('vo01/O2', 5.097, ''), ('vo02/O3b', 9.060, ''), ('vo01/TT', 13.022, ''),
         ('vo01/E1', 18.682, ''), ('vo01/E2', 22.645, ''), ('vo01/E3', 26.607, '')]
bed = load(BED)[:int(END * SR)]; n = len(bed); bed[-int(0.4 * SR):] *= np.linspace(1, 0, int(0.4 * SR))[:, None]
meter = pyln.Meter(SR); dyn = 'highpass=f=90,acompressor=threshold=-26dB:ratio=3:attack=5:release=120:makeup=2'
vo = np.zeros((n, 2), np.float32); speaking = np.zeros(n, bool)
for f, at, fx in LINES:
    c = load(f'{A}/{f}.mp3', ','.join(x for x in (fx, dyn) if x))
    fi, fo = min(240, len(c) // 4), min(720, len(c) // 4); c[:fi] *= np.linspace(0, 1, fi)[:, None]; c[-fo:] *= np.linspace(1, 0, fo)[:, None]
    c *= 10 ** ((-15 - (1.5 if f.endswith('Q0b') else 0) - meter.integrated_loudness(c)) / 20)
    i0 = int(at * SR); m = min(len(c), n - i0); vo[i0:i0 + m] += c[:m]; speaking[i0:i0 + m] = True
    print(f'{f:10s} {at:6.2f} → {at + len(c) / SR:6.2f}')
bed *= 10 ** ((-17 - meter.integrated_loudness(bed)) / 20)
sp = speaking.copy(); d = np.diff(sp.astype(np.int8)); offs = np.where(d == -1)[0] + 1; ons = np.where(d == 1)[0] + 1
for o in offs:
    nx = ons[ons > o]
    if len(nx) and nx[0] - o < int(1.2 * SR): sp[o:nx[0]] = True
sm = lambda x: uniform_filter1d(uniform_filter1d(x, int(0.25 * SR)), int(0.25 * SR))
env = sm(np.where(sp, 10 ** (-2 / 20), 1.0)); env_mid = sm(np.where(sp, 10 ** (-3 / 20), 1.0))
mid = sosfiltfilt(butter(2, [900, 4500], btype='band', fs=SR, output='sos'), bed, axis=0)
mix = (bed * env[:, None] - mid * (env[:, None] * (1 - env_mid[:, None])) + vo).astype(np.float32)
mix *= 10 ** ((-14 - meter.integrated_loudness(mix)) / 20); pk = np.abs(mix).max()
if pk > 0.84: mix = (np.tanh(mix / 0.84) * 0.84).astype(np.float32)
sf.write(f'{A}/ep42_demo_mix.wav', mix, SR, subtype='PCM_24'); print('LUFS', round(meter.integrated_loudness(mix), 1), 'peak', round(20 * np.log10(np.abs(mix).max()), 1))
