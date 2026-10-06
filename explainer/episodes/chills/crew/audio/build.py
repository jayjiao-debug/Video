"""Assemble the film soundtrack from segments.json: real bars of bgm.mp3, edits on measured downbeats,
5 ms micro-fades at every cut (no clicks), filters with matched loudness, master −14 LUFS / ≤ −2 dBTP."""
import json, subprocess, numpy as np, soundfile as sf, librosa
from scipy.signal import butter, sosfilt, sosfilt_zi
SR = 48000
BGM = '/home/claude/jayjiao-debug/video/explainer/assets/music/bgm.mp3'
y, _ = librosa.load(BGM, sr=SR, mono=False)
segs = json.load(open('audio/segments.json'))
F = int(0.005 * SR)
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
def lowpass(x, fc, order=4):
    sos = butter(order, fc, 'lp', fs=SR, output='sos'); return np.stack([sosfilt(sos, c) for c in x])
def sweep(x, f0, f1):
    # time-varying low-pass: process in 20 ms blocks with an exponential cutoff ramp, state carried across
    n = x.shape[1]; out = np.zeros_like(x); blk = int(0.02 * SR)
    zs = None
    for i in range(0, n, blk):
        k = i / n; fc = f0 * (f1 / f0) ** (k ** 1.6)
        sos = butter(2, min(fc, SR / 2 - 100), 'lp', fs=SR, output='sos')
        if zs is None: zs = [sosfilt_zi(sos) * 0 for _ in range(2)]
        for c in range(2):
            out[c, i:i + blk], zs[c] = sosfilt(sos, x[c, i:i + blk], zi=zs[c])
    return out
parts = []
for s in segs:
    if s['track'] is None:
        n = int(round((s['film_to'] - s['film_from']) * SR)); parts.append(np.zeros((2, n))); continue
    a, b = s['track']; x = y[:, int(round(a * SR)):int(round(b * SR))]
    if s['fx'] == 'repeat3': x = np.concatenate([x, x, x], axis=1)
    ref = rms_db(x)
    if s['fx'] == 'lowpass':
        x = lowpass(x, 800); x *= 10 ** ((ref - rms_db(x)) / 20)   # same loudness as the original, only duller
    if s['fx'] == 'sweep': x = sweep(x, 400, 12000)
    if s['gain'] != 0 and s['id'].startswith(('bed', 'outro')):
        n = x.shape[1]; r = min(n, int(2.03 * SR))
        env = np.full(n, 10 ** (s['gain'] / 20)); env[:r] = 10 ** (np.linspace(0, s['gain'], r) / 20)
        x = x * env
    else:
        x = x * 10 ** (s['gain'] / 20)
    if s['fx'] == 'fade':
        n = x.shape[1]; x[:, n // 3:] *= np.linspace(1, 0, n - n // 3) ** 1.5
    parts.append(x)
# joins: continuous audio → butt join (no fade); real splices → 15 ms equal-power crossfade; silence edges → 5 ms fades
XF = int(0.015 * SR)
def contiguous(p, q):
    return p['track'] and q['track'] and abs(p['track'][1] - q['track'][0]) < 0.003 and p['fx'] == q['fx'] and p.get('reps', 1) == 1
mix = parts[0]
for i in range(1, len(parts)):
    p, q = segs[i - 1], segs[i]; nxt = parts[i]
    if q['track'] is None or p['track'] is None:
        mix[:, -F:] *= np.linspace(1, 0, F); nxt[:, :F] *= np.linspace(0, 1, F)
        mix = np.concatenate([mix, nxt], axis=1)
    elif contiguous(p, q):
        mix = np.concatenate([mix, nxt], axis=1)
    else:
        # crossfade that ENDS on the join: the previous part fades out over its last 7.5 ms while the next part's
        # 7.5 ms pre-roll (from its source) fades in; the next part then starts exactly on time (no drift)
        h = XF // 2
        st = int(round(q['track'][0] * SR))
        pre = y[:, max(0, st - h):st] * 10 ** (q['gain'] / 20) if q['gain'] == 0 or not q['id'].startswith(('bed', 'outro')) else y[:, max(0, st - h):st]
        th = np.linspace(0, np.pi / 2, pre.shape[1])
        mix[:, -pre.shape[1]:] = mix[:, -pre.shape[1]:] * np.cos(th) + pre * np.sin(th)
        mix = np.concatenate([mix, nxt], axis=1)
# bed gain changes happen at cuts; smooth 30 ms ramps are already implied by micro fades
sf.write('audio/raw.wav', mix.T.astype(np.float32), SR, subtype='FLOAT')
p = subprocess.run(['ffmpeg', '-hide_banner', '-i', 'audio/raw.wav', '-af', 'loudnorm=I=-14:TP=-2:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
m = json.loads(p[p.rindex('{'):p.rindex('}') + 1])
ln = f"loudnorm=I=-14:TP=-2:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'audio/raw.wav', '-af', f'{ln},aresample=192000,alimiter=limit=0.6:attack=1:release=60:level=false,aresample=48000', '-ar', '48000', '-c:a', 'pcm_s16le', 'audio/master.wav'], check=True)
q = subprocess.run(['ffmpeg', '-hide_banner', '-i', 'audio/master.wav', '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
q = json.loads(q[q.rindex('{'):q.rindex('}') + 1])
print('master', q['input_i'], 'LUFS', q['input_tp'], 'dBTP', round(mix.shape[1] / SR, 3), 's')
