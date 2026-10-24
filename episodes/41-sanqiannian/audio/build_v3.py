"""ep41 v3 mix (music-specialist review applied, 2026-10-24).
BGM: バケモノの唄 (instrumental). Spans [0,54.905) + [91.695,209.47) + [238.0,253.2): join 1 re-enters on the song's own
hit and stays on the bar grid (10 ms crossfade), join 2 lands 8 bars after the drop (40 ms) with a reverb tail.
Voice lines from lines_v3.json (film times, already in the post-fix timeline). Bed at voice −2 LU; a shallow, bridged
broadband duck (2 dB, none on quiet beds or the climax) plus a −3 dB carve of the music's 900–4500 Hz band under speech.
Scott's 1860 recording gets its own EQ, speech-band gain and a −9 dB music dip. Pre-drop dip into the climax at 154.54.
Delivery: 4× oversampled limiter, then linear two-pass loudnorm to −14 LUFS / −1.5 dBTP (done in final_v3.sh)."""
import numpy as np, subprocess, pyloudnorm as pyln, soundfile as sf, os, json, re
from scipy.ndimage import uniform_filter1d
from scipy.signal import butter, sosfiltfilt, fftconvolve
SR = 48000; A = os.path.dirname(os.path.abspath(__file__)); VO_L = -15.0
def load(path, extra=''):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path] + (['-af', extra] if extra else []) + ['-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()
song = load(f'{A}/bgm2.mp3'); SPANS = [(0.0, 54.905), (91.695, 209.47), (238.0, 253.2)]; XF = [0.010, 0.040]
bgm = song[:0]; joins = []
for k, (a, b) in enumerate(SPANS):
    seg = song[int(a * SR): int(b * SR)].copy()
    if len(bgm):
        xf = int(XF[k - 1] * SR); ramp = np.linspace(0, 1, xf)[:, None]
        bgm[-xf:] = bgm[-xf:] * (1 - ramp) + seg[:xf] * ramp; seg = seg[xf:]; joins.append(len(bgm) / SR)
    bgm = np.concatenate([bgm, seg])
n = len(bgm); DUR = n / SR
# keep the climax ringing across join 2: the last 0.3 s of span 2 through a 2.5 s decaying-noise reverb, −12 dB
tail = song[int(209.17 * SR): int(209.47 * SR)]
ir = np.random.default_rng(7).standard_normal(int(2.5 * SR)) * np.exp(-np.arange(int(2.5 * SR)) / (0.55 * SR)); ir /= np.sqrt((ir ** 2).sum())
rv = np.stack([fftconvolve(tail[:, c], ir) for c in range(2)], 1).astype(np.float32) * 10 ** (-12 / 20)
j2 = int(joins[1] * SR); m = min(len(rv), n - j2); bgm[j2:j2 + m] += rv[:m]

ECHO = 'aecho=0.8:0.55:45|90|140:0.22|0.14|0.08'; OLD = 'highpass=f=320,lowpass=f=2800,acrusher=bits=10:mix=0.2'; PHONE = 'highpass=f=300,lowpass=f=3400'
SPACE = 'aecho=0.8:0.6:180|340:0.25|0.15'; SCOTT = 'highpass=f=100,lowshelf=f=180:g=-6,equalizer=f=900:t=q:w=1:g=5,equalizer=f=2200:t=q:w=1:g=3'
FX = {'': '', 'ECHO': ECHO, 'OLD': OLD, 'PHONE': PHONE, 'SPACE': SPACE}
LINES = [(l['file'], l['at'], ','.join(x for x in (SCOTT if 'CQ_cut' in l['file'] else FX.get(l.get('fx', ''), l.get('fx', '')), l.get('extra', '')) if x)) for l in json.load(open(f'{A}/lines_v3.json'))]
meter = pyln.Meter(SR); dyn = 'highpass=f=90,acompressor=threshold=-26dB:ratio=3:attack=5:release=120:makeup=2'
band = lambda x: sosfiltfilt(butter(4, [300, 3400], btype='band', fs=SR, output='sos'), x, axis=0)
vo = np.zeros((n, 2), np.float32); speaking = np.zeros(n, bool); rep = []; c2_band = None
for f, at, fx in LINES:
    c = load(f'{A}/{f}.mp3', ','.join(x for x in (fx, dyn if 'CQ_cut' not in f else '') if x))
    if len(c) > 400: c = c[:-144]
    fi, fo = min(240, len(c) // 4), min(720, len(c) // 4); c[:fi] *= np.linspace(0, 1, fi)[:, None]; c[-fo:] *= np.linspace(1, 0, fo)[:, None]
    if 'CQ_cut' in f and c2_band is not None:   # match the 1860 voice's speech band to the narration's, minus 2 dB
        g = c2_band - 2 - meter.integrated_loudness(band(c)); c *= 10 ** (g / 20); pk = np.abs(c).max(); c *= min(1, 0.6 / pk)
    else:
        L = meter.integrated_loudness(c); c *= 10 ** ((VO_L - (2.0 if OLD in fx else 0) - L) / 20)
        if f.endswith('/C2'): c2_band = meter.integrated_loudness(band(c))
    i0 = int(at * SR); mm = min(len(c), n - i0); vo[i0:i0 + mm] += c[:mm]; speaking[i0:i0 + mm] = True
    rep.append(f'{f.split("/")[-1]:16s} {at:7.2f} → {at + len(c)/SR:7.2f}')
L_b = meter.integrated_loudness(bgm); bgm *= 10 ** ((VO_L - 2 - L_b) / 20)
# gain automation: title and climax lifts, Scott dip, pre-drop dip (raised-cosine ramps)
def ramp_env(events):
    g = np.zeros(n)
    for a, b, db, ri, ro in events:
        t = np.arange(n) / SR; up = np.clip((t - a) / ri, 0, 1); dn = np.clip((b - t) / ro, 0, 1); w = 0.5 - 0.5 * np.cos(np.pi * np.minimum(up, dn)); g += db * w
    return 10 ** (g / 20)
DROP = 154.54
LIFT = [(9.05, 19.2, 1.5, 0.15, 0.15), (DROP, 172.6, 1.5, 0.02, 0.3), (80.45, 85.6, -9, 0.25, 0.4), (DROP - 2 * 0.566, DROP, -5, 0.566, 0.01)]
QUIET = [(0, 9.0), (145.43, 154.4), (DROP, 188.5)]
sp = speaking.copy(); d = np.diff(sp.astype(np.int8)); offs = np.where(d == -1)[0] + 1; ons = np.where(d == 1)[0] + 1
for o in offs:   # bridge gaps shorter than 1.2 s so the duck never releases between sentences
    nxt = ons[ons > o]
    if len(nxt) and nxt[0] - o < int(1.2 * SR): sp[o:nxt[0]] = True
depth = np.full(n, 10 ** (-2 / 20))
for a, b in QUIET: depth[int(a * SR):int(b * SR)] = 1.0
smooth = lambda x: uniform_filter1d(uniform_filter1d(x, int(0.25 * SR)), int(0.25 * SR))
env = smooth(np.where(sp, depth, 1.0)); env_mid = smooth(np.where(sp, 10 ** (-3 / 20), 1.0))
mid = sosfiltfilt(butter(2, [900, 4500], btype='band', fs=SR, output='sos'), bgm, axis=0)
bgm = (bgm * env[:, None] - mid * (env[:, None] * (1 - env_mid[:, None]))) * ramp_env(LIFT)[:, None]
mix = (bgm + vo).astype(np.float32)
sf.write(f'{A}/ep41_v3_mix_raw.wav', mix, SR, subtype='FLOAT')
print(f'{DUR:.2f}s, joins at {", ".join(f"{j:.3f}" for j in joins)}, raw {meter.integrated_loudness(mix):.1f} LUFS, peak {20*np.log10(np.abs(mix).max()):.1f} dBFS'); print('\n'.join(rep))
# delivery loudness: oversampled limiter, then linear two-pass loudnorm to −14 LUFS / −1.5 dBTP
gain = -14.0 - meter.integrated_loudness(mix) + 0.4
lim = f'aresample=192000,volume={gain:.2f}dB,alimiter=limit=0.79:attack=3:release=60:level=false,aresample=48000'
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f'{A}/ep41_v3_mix_raw.wav', '-af', lim, '-c:a', 'pcm_f32le', f'{A}/ep41_v3_mix_lim.wav'], check=True)
out = subprocess.run(['ffmpeg', '-hide_banner', '-i', f'{A}/ep41_v3_mix_lim.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
J = json.loads(out[out.rindex('{'):out.rindex('}') + 1])
ln = f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={J['input_i']}:measured_TP={J['input_tp']}:measured_LRA={J['input_lra']}:measured_thresh={J['input_thresh']}:offset={J['target_offset']}:linear=true"
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f'{A}/ep41_v3_mix_lim.wav', '-af', ln + ',aresample=48000', '-c:a', 'pcm_s24le', f'{A}/ep41_v3_mix.wav'], check=True)
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', f'{A}/ep41_v3_mix.wav', '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
print('delivery:', ' '.join(l.strip() for l in r[r.rindex('Summary'):].splitlines() if l.strip().startswith(('I:', 'Peak:', 'LRA:'))))
