"""ep41 v3 mix (lines from lines_v3.json). BGM: バケモノの唄 (instrumental), kept spans [0,54.875) + [91.41,209.47) + [238.0,253.2) joined with
40 ms crossfades (owner-approved length 2.5–3 min). Music sits under the voices but louder than the opening test
(owner 22:53 'a tad louder'): 4 LU under the voice between lines, a further 3 dB under while anyone speaks."""
import numpy as np, subprocess, pyloudnorm as pyln, soundfile as sf, os
SR = 48000; A = os.path.dirname(os.path.abspath(__file__)); VO_L = -15.0
def load(path, extra=''):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path] + (['-af', extra] if extra else []) + ['-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()
song = load(f'{A}/bgm2.mp3'); SPANS = [(0.0, 54.875), (91.41, 209.47), (238.0, 253.2)]; xf = int(0.04 * SR)
bgm = song[:0]
for a, b in SPANS:
    seg = song[int(a * SR): int(b * SR)].copy()
    if len(bgm): ramp = np.linspace(0, 1, xf)[:, None]; bgm[-xf:] = bgm[-xf:] * (1 - ramp) + seg[:xf] * ramp; seg = seg[xf:]
    bgm = np.concatenate([bgm, seg])
n = len(bgm); DUR = n / SR
OLD = 'highpass=f=320,lowpass=f=2800,acrusher=bits=10:mix=0.2'; PHONE = 'highpass=f=300,lowpass=f=3400'; ECHO = 'aecho=0.7:0.5:60:0.25'; SPACE = 'aecho=0.8:0.6:180|340:0.25|0.15'
V5 = 'vo05'
LINES_V2 = [('vo04/00_hook_C', 0.75, ''), ('vo04/01_shang_n1_E4', 19.45, ''), ('vo04/01_shang_q_J4', 26.35, ECHO), ('vo04/01_shang_n2_E4', 28.5, ''),
         (f'{V5}/02_du_n1', 35.5, ''), (f'{V5}/02_du_q', 43.4, ECHO), (f'{V5}/02_du_n2', 48.0, ''),
         (f'{V5}/03_morse_n1b', 55.4, ''), (f'{V5}/03_morse_n2', 66.4, ''), (f'{V5}/03_morse_q', 71.6, ''),
         (f'{V5}/04_scott_n1', 74.3, ''), (f'{V5}/04_scott_q', 82.8, OLD), (f'{V5}/04_scott_n2', 86.0, ''),
         (f'{V5}/05_bell_n1', 91.6, ''), (f'{V5}/05_bell_qb', 99.4, ''), (f'{V5}/05_bell_n2', 102.8, ''),
         (f'{V5}/06_marconi_n1', 111.0, ''), (f'{V5}/06_marconi_q', 120.3, ''), (f'{V5}/06_marconi_n2', 122.4, ''),
         (f'{V5}/07_arpa_n1b', 128.7, 'atempo=1.08'), (f'{V5}/07_arpa_q1', 139.95, PHONE), (f'{V5}/07_arpa_a1', 140.9, PHONE), (f'{V5}/07_arpa_q2', 141.95, PHONE), (f'{V5}/07_arpa_a2', 142.95, PHONE),
         (f'{V5}/08_bj_n1', 146.0, ''), (f'{V5}/08_bj_q', 154.1, ''), (f'{V5}/09_fin_n1b', 161.9, ''), (f'{V5}/09_fin_greet', 174.0, SPACE), (f'{V5}/09_fin_title', 180.0, '')]
import json
FX = {'': '', 'ECHO': ECHO, 'OLD': OLD, 'PHONE': PHONE, 'SPACE': SPACE}
LINES = [(l['file'], l['at'], ','.join(x for x in (FX.get(l.get('fx', ''), l.get('fx', '')), l.get('extra', '')) if x)) for l in json.load(open(f'{A}/lines_v3.json'))]
meter = pyln.Meter(SR); dyn = 'acompressor=threshold=-26dB:ratio=3:attack=5:release=120:makeup=2'
vo = np.zeros((n, 2), np.float32); speaking = np.zeros(n); rep = []
for f, at, fx in LINES:
    c = load(f'{A}/{f}.mp3', ','.join(x for x in (fx, dyn) if x))
    L = meter.integrated_loudness(c); c *= 10 ** ((VO_L - (2.0 if OLD in fx else 0) - L) / 20)
    i0 = int(at * SR); m = min(len(c), n - i0); vo[i0:i0 + m] += c[:m]; speaking[i0:i0 + m] = 1
    rep.append(f'{f.split("/")[-1]:16s} {at:7.2f} → {at + len(c)/SR:7.2f}')
L_b = meter.integrated_loudness(bgm); bgm *= 10 ** ((VO_L - 4 - L_b) / 20)
env = np.ones(n); g = 1.0; lo = 10 ** (-3 / 20); look = int(0.15 * SR)
sp_ahead = np.concatenate([speaking[look:], np.zeros(look)])
for i in range(n):
    tgt = lo if sp_ahead[i] else 1.0
    g += (tgt - g) * ((1 / (0.25 * SR)) * 6 if tgt < g else (1 / (0.7 * SR)) * 4); env[i] = g
bgm *= env[:, None]
fade = int(1.6 * SR); bgm[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
mix = bgm + vo
pk = np.abs(mix).max(); mix *= min(10 ** (-0.5 / 20) * 10 ** ((-14.5 - meter.integrated_loudness(mix)) / 20), 10 ** (-1 / 20) / pk)
sf.write(f'{A}/ep41_v3_mix.wav', mix, SR, subtype='PCM_24')
print(f'{DUR:.2f}s, mix {meter.integrated_loudness(mix):.1f} LUFS, peak {20*np.log10(np.abs(mix).max()):.1f} dBFS'); print('\n'.join(rep))
