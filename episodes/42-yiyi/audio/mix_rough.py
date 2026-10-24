"""ep42 rough-cut mix: the v2 bed (145.124 s, music automation already baked in) + every voice line on the v3 times,
with ep41's rules: each voice −15 LUFS, bed at voice −2 LU, bridged 2 dB duck + −3 dB carve of 900–4500 Hz under speech,
+2 dB lift on the DROP (106.987 → coda 116.043), −14 LUFS delivery.
A clip that runs past its window (next line − 0.10 s) is sped up with atempo (≤ 1.12); the measured lengths go to clips_v3.json."""
import numpy as np, subprocess, json, os, pyloudnorm as pyln, soundfile as sf
from scipy.ndimage import uniform_filter1d
from scipy.signal import butter, sosfiltfilt
SR = 48000; A = os.path.dirname(os.path.abspath(__file__)); END = 145.124
BED = '/tmp/claude-0/-home-claude/bf206d1e-1152-5595-9b84-b15be6e5a777/scratchpad/music42/ep42_bed_v2.wav'
ECHO_IN = 'highpass=f=90,aecho=0.6:0.4:30:0.12'                     # the 3 a.m. inner voice
PAST = 'aecho=0.7:0.35:38|61:0.14|0.08'                              # quoted voices from the past: a little room
PHONE = 'highpass=f=320,lowpass=f=3400,acompressor=threshold=-20dB:ratio=4:attack=3:release=80:makeup=3'
# (id, clip, start, fx, gain dB): starts from lines_v3.json; SQ is two clips (Greek lead-in, then Socrates)
LV = {r['id']: r for r in json.load(open(f'{A}/../lines_v3.json'))}
CL = [('Q0', 'vo01/Q0b', ECHO_IN, -1.5), ('HK1', 'vo03/H1b', 'atempo=1.06', 0), ('HK2', 'vo03/H2a', '', 0),
      ('E1', 'vo01/E1', '', 0), ('E2', 'vo01/E2', '', 0), ('E3', 'vo01/E3', '', 0),
      ('B1', 'vo04/B1', '', 0), ('BQ', 'vo04/BQ', PAST, 0), ('B3', 'vo04/B3', '', 0),
      ('C1', 'vo04/C1', '', 0), ('CQ', 'vo04/CQ', PAST, 0), ('C2', 'vo04/C2', '', 0),
      ('S1', 'vo04/S1', '', 0), ('SQ', 'vo04/SQa', '', 0), ('SQ+', 'vo04/SQb', PAST, 0), ('S2', 'vo04/S2', '', 0),
      ('M1', 'vo04/M1', '', 0), ('MQ1', 'vo04/MQ1', PAST, 0), ('MQ2', 'vo04/MQ2', PAST, 0), ('M2', 'vo04/M2', '', 0),
      ('F0', 'vo04/F0', '', 0), ('F1', 'vo04/F1', '', 0), ('F2', 'vo04/F2', '', 0), ('F3', 'vo04/F3', '', 0), ('F4', 'vo04/F4', '', 0),
      ('H1', 'vo04/H1', '', 0), ('H3', 'vo04/H3', '', 0),
      ('R1', 'vo04/R1', '', 0), ('RQ1', 'vo04/RQ1', PAST, 0), ('RQ2', 'vo04/RQ2', PAST, 0),
      ('L1', 'vo04/L1', '', 0), ('TE', 'vo04/TE', '', 0), ('T2', 'vo04/T2', PHONE, -1), ('T3', 'vo04/T3', '', 0)]
UNTIL = {'F4': 105.80, 'H3': 116.55}   # F4 ends before the breath; H3 may spill only a little into the coda
PICK = json.load(open(f'{A}/vo04/pick.json')) if os.path.exists(f'{A}/vo04/pick.json') else {}   # e.g. {"vo04/CQ": "vo04/CQ1"}
def load(path, af=''):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path] + (['-af', af] if af else []) + ['-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
def trim(c, th=-48):   # cut leading/trailing silence so the line starts on its time
    e = 20 * np.log10(np.maximum(uniform_filter1d(np.abs(c).max(1), 480), 1e-9)); idx = np.where(e > th)[0]
    return c[max(0, idx[0] - 240): idx[-1] + 2400] if len(idx) else c
bed = load(BED)[:int(END * SR)]; n = len(bed)
meter = pyln.Meter(SR); dyn = 'highpass=f=90,acompressor=threshold=-26dB:ratio=3:attack=5:release=120:makeup=2'
vo = np.zeros((n, 2), np.float32); speaking = np.zeros(n, bool); lens = {}
starts = []
for k, (i, f, fx, g) in enumerate(CL):
    f = PICK.get(f, f)
    if i == 'SQ+': at = starts[-1][1] + 0.08
    else: at = LV[i]['start']
    nxt = next((LV[j]['start'] for j, *_ in CL[k + 1:] if j in LV and j != i), END - 0.3)
    nxt = min(nxt, UNTIL.get(i, 1e9) + 0.10)
    c = trim(load(f'{A}/{f}.mp3', ','.join(x for x in (fx, dyn) if x)))
    room = nxt - 0.10 - at
    if i == 'SQ': room = nxt - 0.10 - at - 0.08 - len(trim(load(f'{A}/{PICK.get("vo04/SQb", "vo04/SQb")}.mp3'))) / SR
    if len(c) / SR > room and i not in ('Q0', 'HK1', 'HK2', 'E1', 'E2', 'E3'):
        k_t = min(1.12, len(c) / SR / room); c = trim(load(f'{A}/{f}.mp3', ','.join(x for x in (fx, f'atempo={k_t:.3f}', dyn) if x)))
        print(f'   {i}: atempo {k_t:.3f}' + ('  STILL LONG' if len(c) / SR > room + 0.05 else ''))
    fi, fo = min(240, len(c) // 4), min(720, len(c) // 4); c[:fi] *= np.linspace(0, 1, fi)[:, None]; c[-fo:] *= np.linspace(1, 0, fo)[:, None]
    c *= 10 ** ((-15 + g - meter.integrated_loudness(c)) / 20)
    i0 = int(at * SR); m = min(len(c), n - i0); vo[i0:i0 + m] += c[:m]; speaking[i0:i0 + m] = True
    starts.append((i, at + len(c) / SR)); lens[i] = round(len(c) / SR, 3)
    print(f'{i:4s} {f:10s} {at:7.3f} → {at + len(c) / SR:7.3f}  (next {nxt:7.3f})')
if 'SQ+' in lens: lens['SQ'] = round(starts[[s[0] for s in starts].index('SQ+')][1] - LV['SQ']['start'], 3); lens.pop('SQ+')
json.dump(lens, open(f'{A}/clips_v3.json', 'w'), indent=1)
bed *= 10 ** ((-17 - meter.integrated_loudness(bed)) / 20)
t = np.arange(n) / SR; lift = np.ones(n, np.float32)                       # +2 dB lift from the DROP to the coda
up = np.clip((t - 106.987) / 0.05, 0, 1) * np.clip((116.043 - t) / 0.6, 0, 1); lift = 10 ** (2 * up / 20)
bed *= lift[:, None]
sp = speaking.copy(); d = np.diff(sp.astype(np.int8)); offs = np.where(d == -1)[0] + 1; ons = np.where(d == 1)[0] + 1
for o in offs:
    nx = ons[ons > o]
    if len(nx) and nx[0] - o < int(1.2 * SR): sp[o:nx[0]] = True
sm = lambda x: uniform_filter1d(uniform_filter1d(x, int(0.25 * SR)), int(0.25 * SR))
env = sm(np.where(sp, 10 ** (-2 / 20), 1.0)); env_mid = sm(np.where(sp, 10 ** (-3 / 20), 1.0))
mid = sosfiltfilt(butter(2, [900, 4500], btype='band', fs=SR, output='sos'), bed, axis=0)
mix = (bed * env[:, None] - mid * (env[:, None] * (1 - env_mid[:, None])) + vo).astype(np.float32)
mix *= 10 ** ((-14 - meter.integrated_loudness(mix)) / 20)
if np.abs(mix).max() > 0.84: mix = (np.tanh(mix / 0.84) * 0.84).astype(np.float32)
mix *= min(10 ** ((-14 - meter.integrated_loudness(mix)) / 20), 0.89 / np.abs(mix).max())   # back to −14 after the soft clip, peak ≤ −1 dBFS
sf.write(f'{A}/ep42_rough_mix.wav', mix, SR, subtype='PCM_24'); sf.write(f'{A}/ep42_rough_vo.wav', vo, SR, subtype='PCM_24')
print('LUFS', round(meter.integrated_loudness(mix), 1), 'peak', round(20 * np.log10(np.abs(mix).max()), 1))
