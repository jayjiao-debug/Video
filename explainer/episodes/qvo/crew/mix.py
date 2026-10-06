"""Edit the BGM to the film map, lay the VO, duck the music under it, master to -14 LUFS / -1.5 dBTP."""
import json, subprocess, numpy as np, soundfile as sf, librosa
from scipy.signal import butter, sosfilt
SR = 48000
tl = json.load(open('timeline.json'))
L = tl['length']; N = int(round(L * SR))
BGM = '/home/claude/jayjiao-debug/video/explainer/assets/music/bgm.mp3'
y, _ = librosa.load(BGM, sr=SR, mono=False)
X = 0.03
def seg(a, b): return y[:, int(a * SR):int(b * SR)]
a0, a1 = tl['music']['segA']; b0, b1 = tl['music']['segB']
A = seg(a0, a1 + X); B = seg(b0 - 0.0, b1)
n = int(X * SR); ramp = np.linspace(0, 1, n)
mus = np.concatenate([A[:, :-n], A[:, -n:] * (1 - ramp) + B[:, :n] * ramp, B[:, n:]], axis=1)
mus = mus[:, :N] if mus.shape[1] >= N else np.pad(mus, ((0, 0), (0, N - mus.shape[1])))
# fade over the last bar
fb = int(tl['bar'] * SR); mus[:, -fb:] *= np.linspace(1, 0, fb) ** 1.5
mus[:, :int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))
# VO track
vo = np.zeros(N)
hp = butter(2, 75, 'hp', fs=SR, output='sos')
pres = butter(2, [2500, 5000], 'bp', fs=SR, output='sos')
act = np.zeros(N)
for ln in tl['lines']:
    v, sr = sf.read(f"vo/{ln['id']}.wav"); v = librosa.resample(v.astype(np.float32), orig_sr=sr, target_sr=SR)
    v = sosfilt(hp, v); v = v + 0.25 * sosfilt(pres, v)
    v = v / (np.sqrt(np.mean(v[np.abs(v) > 0.02 * np.abs(v).max()] ** 2)) + 1e-9) * 0.12   # equal loudness per line
    i = int(ln['from'] * SR); j = min(N, i + len(v)); vo[i:j] += v[:j - i]; act[max(0, i - int(0.25 * SR)):j] = 1   # duck 250 ms early
# gentle compression on the VO
env = np.abs(vo); k = int(0.01 * SR); env = np.convolve(env, np.ones(k) / k, 'same')
g = np.where(env > 0.18, (0.18 / np.maximum(env, 1e-9)) ** 0.5, 1.0); vo *= g
# duck: -16 dB under the voice, attack 120 ms, release 400 ms
duck = np.where(act > 0, 10 ** (-16 / 20), 1.0)
out = np.empty(N); a_c = np.exp(-1 / (0.05 * SR)); r_c = np.exp(-1 / (0.40 * SR)); s = 1.0
# run the smoother at 1 kHz for speed
step = SR // 1000; d = duck[::step]; sm = np.empty_like(d)
for i, x in enumerate(d):
    c = a_c ** step if x < s else r_c ** step
    s = c * s + (1 - c) * x; sm[i] = s
gain = np.interp(np.arange(N), np.arange(len(sm)) * step, sm)
mix = mus * gain * 0.85 + vo[None, :]
sf.write('audio/mix_raw.wav', mix.T.astype(np.float32), SR, subtype='FLOAT')
sf.write('audio/vo_only.wav', vo.astype(np.float32), SR, subtype='FLOAT')
# master: two-pass loudnorm to -14 LUFS, then a true-peak limiter at -1.5 dBTP
p = subprocess.run(['ffmpeg', '-hide_banner', '-i', 'audio/mix_raw.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
m = json.loads(p[p.rindex('{'):p.rindex('}') + 1])
ln = f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'audio/mix_raw.wav', '-af', f'{ln},aresample=192000,alimiter=limit=0.78:attack=1:release=50:level=false,aresample=48000', '-ar', '48000', '-c:a', 'pcm_s16le', 'audio/master.wav'], check=True)
q = subprocess.run(['ffmpeg', '-hide_banner', '-i', 'audio/master.wav', '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
q = json.loads(q[q.rindex('{'):q.rindex('}') + 1]); print('master', q['input_i'], 'LUFS', q['input_tp'], 'dBTP', 'dur', sf.info('audio/master.wav').duration)
