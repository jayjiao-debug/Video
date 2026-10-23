"""ep41 opening (first 35 s): バケモノの唄 instrumental 0 → 35.4 s, narrator + diviner.
Music sits under the voice (owner 2026-10-23: 'the music is too loud'): BGM 6 LU under the narration between lines,
ducked a further 4 dB while anyone speaks (0.25 s down, 0.6 s back up)."""
import numpy as np, subprocess, pyloudnorm as pyln, soundfile as sf, os
SR = 48000; A = os.path.dirname(os.path.abspath(__file__)); DUR = 35.4
def load(path, extra=''):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path] + (['-af', extra] if extra else []) + ['-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()
meter = pyln.Meter(SR); VO_L = -15.0
dyn = 'acompressor=threshold=-26dB:ratio=3:attack=5:release=120:makeup=2'
LINES = [('vo04/00_hook_C.mp3', 0.75, ''), ('vo04/01_shang_n1_E4.mp3', 19.45, ''), ('vo04/01_shang_q_J4.mp3', 26.35, 'aecho=0.7:0.5:60:0.25'), ('vo04/01_shang_n2_E4.mp3', 28.5, '')]
n = int(DUR * SR); vo = np.zeros((n, 2), np.float32); speaking = np.zeros(n)
for f, at, fx in LINES:
    c = load(f'{A}/{f}', ','.join(x for x in (fx, dyn) if x)); c *= 10 ** ((VO_L - meter.integrated_loudness(c)) / 20)
    i0 = int(at * SR); m = min(len(c), n - i0); vo[i0:i0 + m] += c[:m]; speaking[i0:i0 + m] = 1
bgm = load(f'{A}/bgm2.mp3')[:n]
L_b = meter.integrated_loudness(bgm); bgm *= 10 ** ((VO_L - 6 - L_b) / 20)
# duck envelope: 0.25 s attack, 0.6 s release
env = np.ones(n); k_a, k_r = 1 / (0.25 * SR), 1 / (0.6 * SR); g = 1.0; tgt_lo = 10 ** (-4 / 20)
for i in range(n):
    tgt = tgt_lo if speaking[min(n - 1, i + int(0.15 * SR))] else 1.0
    g += (tgt - g) * (k_a * 6 if tgt < g else k_r * 4); env[i] = g
bgm *= env[:, None]
bgm *= np.clip((DUR - np.arange(n) / SR) / 0.6, 0, 1)[:, None]
mix = bgm + vo
pk = np.abs(mix).max(); mix *= min(1, 10 ** (-1 / 20) / pk)
sf.write(f'{A}/ep41_open_mix.wav', mix, SR, subtype='PCM_24')
print(f'mix {meter.integrated_loudness(mix):.1f} LUFS, peak {20*np.log10(np.abs(mix).max()):.1f} dBFS; BGM bed {VO_L-6:.0f}/{VO_L-10:.0f} LUFS vs voice {VO_L:.0f}')
