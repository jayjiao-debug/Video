"""ep31 《薄肌说明书》 soundtrack.
0–14.49 s : intro v4 (the 薄肌 montage, its own audio, no BGM)
17.0 s    : the BGM hard-cuts in at the track's drum entry (16.616 s), so film = track + 0.384 from here on
quotes    : three original-voice lines from the podcast, the BGM ducks ~10 dB under them
end       : tape-stop over the last 1.6 s (under the end card); total 127.0 s; −14 LUFS / −1.5 dBTP (ffmpeg loudnorm, 2-pass)
Writes audio/soundtrack.wav and music/timing.json."""
import json, subprocess, numpy as np, soundfile as sf, os
SR = 48000; TOTAL = 127.0
INTRO = os.environ['INTRO']; BGM = os.environ['BGM']; POD = os.environ['POD']
def load(path, t0=None, dur=None):
    cmd = ['ffmpeg', '-v', 'error']
    if t0 is not None: cmd += ['-ss', f'{t0}']
    if dur is not None: cmd += ['-t', f'{dur}']
    cmd += ['-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype='float32').reshape(-1, 2).copy()
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
def fade(x, fi=0.01, fo=0.01):
    a, b = int(fi * SR), int(fo * SR)
    if a: x[:a] *= np.linspace(0, 1, a)[:, None]
    if b: x[-b:] *= np.linspace(1, 0, b)[:, None]
    return x
mix = np.zeros((int(TOTAL * SR), 2), 'float32')
def put(x, at, gain_db=0.0):
    i = int(at * SR); n = min(len(x), len(mix) - i); mix[i:i + n] += x[:n] * 10 ** (gain_db / 20)
# intro
intro = load(INTRO); put(intro, 0.0)
dia_level = rms_db(intro[intro.std(axis=1) > 0] if len(intro) else intro)
# quotes (podcast timecodes from SenseVoice token times; cut in the gaps between words)
Q = {'Q5': (10281.02, 10284.68, 65.6), 'Q2': (6755.74, 6757.52, 106.1), 'Q4': (10195.03, 10197.02, 116.3)}
qwin = []
for k, (a, b, at) in Q.items():
    x = fade(load(POD, a, b - a), 0.012, 0.03); put(x, at, -18 - rms_db(x)); qwin.append((at, at + (b - a)))
# BGM from the drum entry, ducked under the quotes, tape-stop at the end
t_in, t_src = 17.0, 16.616; ts0, ts_len = TOTAL - 1.6, 1.6
music = load(BGM, t_src, TOTAL - t_in)
env = np.ones(len(music), 'float32'); tt = t_in + np.arange(len(music)) / SR
duck = np.zeros(len(music), 'float32')
for a, b in qwin: duck = np.maximum(duck, ((tt > a - 0.08) & (tt < b + 0.05)).astype('float32'))
k_att, k_rel = 1 - np.exp(-1 / (0.08 * SR)), 1 - np.exp(-1 / (0.30 * SR)); s = 0.0; sm = np.empty_like(duck)
for i, v in enumerate(duck): s += (k_att if v > s else k_rel) * (v - s); sm[i] = s
env *= 10 ** (-10 * sm / 20); music *= env[:, None]
# tape-stop: playback rate (1 - u)^1.6 over the last 1.6 s
i0 = int((ts0 - t_in) * SR); n = int(ts_len * SR); u = np.arange(n) / n
pos = i0 + np.cumsum((1 - u) ** 1.6); seg = np.stack([np.interp(pos, np.arange(len(music)), music[:, c]) for c in (0, 1)], 1)
seg *= np.linspace(1, 0, n)[:, None] ** 0.5; music = np.concatenate([music[:i0], seg.astype('float32')])
music = fade(music, 0.004, 0.0)
put(music, t_in, dia_level - rms_db(music[: int(20 * SR)]) - 4.0)      # music sits ~4 dB under the dialogue level
os.makedirs('audio', exist_ok=True); sf.write('audio/premix.wav', mix, SR, subtype='FLOAT')
m = subprocess.run(['ffmpeg', '-hide_banner', '-i', 'audio/premix.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
js = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'audio/premix.wav', '-af',
    f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true",
    '-ar', str(SR), '-c:a', 'pcm_s16le', 'audio/soundtrack.wav'], check=True)
os.remove('audio/premix.wav')
json.dump({'quotes': {k: {'film': [v[2], v[2] + v[1] - v[0]], 'src': [v[0], v[1]]} for k, v in Q.items()}, 'bgm_in': t_in, 'bgm_src': t_src,
           'tapestop': [ts0, TOTAL], 'total': TOTAL}, open('music/timing.json', 'w'), indent=1)
print('done', json.dumps(js)[:120])
