"""ep45 voice-over mix.
  python3 mix45vo.py --measure   → trims each clip in audio/vo/NN.mp3, writes audio/vo/NN.wav (44.1 kHz mono) and vo/durs.json
  python3 plan45vo.py            → lines_vo.json + vo/starts.json
  python3 mix45vo.py             → audio/mix45vo.wav: BGM (approved cut) dipped DUCK dB under the voice, voice at about -16 LUFS
The BGM gets only the approved cut, the fade-out and (owner OK 2026-10-25) a slight dip under the voice. Never under the
title, the hardest drop or the end card (FREE windows)."""
import json, subprocess, sys, numpy as np, soundfile as sf
SR, DUCK, ATT, REL, PRE = 44100, -6.0, 0.12, 0.45, 0.10
FREE = [(9.05, 11.32), (118.87, 120.30), (169.5, 999)]
def trim(x, thr=-45):
    e = np.convolve(np.abs(x), np.ones(441) / 441, 'same'); on = np.where(20 * np.log10(e + 1e-9) > thr)[0]
    return x[max(0, on[0] - 441):min(len(x), on[-1] + 2205)] if len(on) else x
if '--measure' in sys.argv:
    durs = {}
    for i in range(1, 50):
        n = f'{i:02d}'; raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'audio/vo/{n}.mp3', '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
        x = trim(np.frombuffer(raw, np.float32).copy()); sf.write(f'audio/vo/{n}.wav', x, SR); durs[n] = round(len(x) / SR, 3)
    json.dump(durs, open('vo/durs.json', 'w'), indent=0); print('total voice', round(sum(durs.values()), 1), 's'); sys.exit()
bgm, sr = sf.read('audio/bgm_cut45.wav', dtype='float32'); assert sr == SR
if bgm.ndim > 1: bgm = bgm.mean(1)
starts = json.load(open('vo/starts.json')); vo = np.zeros_like(bgm); act = np.zeros(len(bgm), bool)
for n, t0 in starts.items():
    x, _ = sf.read(f'audio/vo/{n}.wav', dtype='float32'); x = x / (np.sqrt(np.mean(x ** 2)) + 1e-9) * 0.1   # same speech level per clip
    a = int(t0 * SR); vo[a:a + len(x)] += x[:len(vo) - a]; act[max(0, a - int(PRE * SR)):a + len(x)] = True
for a, b in FREE: act[int(a * SR):int(min(b, len(bgm) / SR) * SR)] = False
# gain curve: dip with ATT attack, REL release (one-pole smoothing on the target)
tgt = np.where(act, 10 ** (DUCK / 20), 1.0).astype(np.float32); g = np.empty_like(tgt); y = 1.0
ka, kr = 1 - np.exp(-1 / (ATT * SR)), 1 - np.exp(-1 / (REL * SR))
for i, v in enumerate(tgt): y += (v - y) * (ka if v < y else kr); g[i] = y
sf.write('audio/_vo_only.wav', vo, SR)
L = lambda f: float(subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', f, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr.split('Summary:')[1].split('I:')[1].split('LUFS')[0])
vo *= 10 ** ((-16 - L('audio/_vo_only.wav')) / 20)
mix = bgm * g + vo
pk = np.max(np.abs(mix)); mix *= min(1.0, 10 ** (-1.0 / 20) / pk)   # keep a sample peak ≤ -1 dBFS by one overall gain (no limiter)
sf.write('audio/mix45vo.wav', mix, SR); sf.write('audio/_duck_gain.wav', g, SR)
print('peak before', round(20 * np.log10(pk), 2), 'dBFS · mix', L('audio/mix45vo.wav'), 'LUFS · voice share of time', round(act.mean() * 100), '%')
