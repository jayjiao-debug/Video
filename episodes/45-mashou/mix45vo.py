"""ep45 voice-over mix.
  python3 mix45vo.py --measure   → trims each clip in audio/vo/NN.mp3, writes audio/vo/NN.wav (44.1 kHz mono) and vo/durs.json
  python3 plan45vo.py            → lines_vo.json + vo/starts.json
  python3 mix45vo.py             → audio/mix45vo.wav: BGM (approved cut) dipped DUCK dB under the voice, voice at about -16 LUFS
The BGM gets only the approved cut, the fade-out and (owner OK 2026-10-25) a slight dip under the voice. Never under the
title, the hardest drop or the end card (FREE windows)."""
import json, subprocess, sys, numpy as np, soundfile as sf
SR, DUCK, ATT, REL, PRE = 44100, -6.0, 0.12, 0.45, 0.10
TEMPO = {'29': 1.05, '30': 1.05, '31': 1.05, '32': 1.05}   # Paris → Ho's gift must fit between the build (92.02) and the stop (107.87): 5 % faster, pitch kept
FADE = (177.49, 179.75)   # last bar of the music
VOGAIN = {'36': -1.5}   # H1b is spoken over the hardest drop at full music: a little lower so the sum stays under -1 dBFS
FREE = [(9.05, 11.32), (118.87, 120.30), (169.5, 999)]
BGM, STARTS, OUT, END = 'audio/bgm_cut45.wav', 'vo/starts.json', 'audio/mix45vo.wav', None
if '--v6' in sys.argv:   # the 2:30 version (owner 2026-10-25): bars 7-52 cut, 40 lines, film ends 140.70 on a fade
    FREE, FADE, END = [(9.05, 11.32), (87.17, 88.60), (136.17, 999)], (138.43, 140.70), 140.70
    BGM, STARTS, OUT = 'audio/bgm_cut45_150.wav', 'vo/starts_v6.json', 'audio/mix45vo_v6.wav'
def trim(x, thr=-45):
    e = np.convolve(np.abs(x), np.ones(441) / 441, 'same'); on = np.where(20 * np.log10(e + 1e-9) > thr)[0]
    return x[max(0, on[0] - 441):min(len(x), on[-1] + 2205)] if len(on) else x
if '--measure' in sys.argv:
    durs = {}
    for i in range(1, 50):
        n = f'{i:02d}'; raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'audio/vo/{n}.mp3', *(['-af', f'atempo={TEMPO[n]}'] if n in TEMPO else []), '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
        x = trim(np.frombuffer(raw, np.float32).copy()); sf.write(f'audio/vo/{n}.wav', x, SR); durs[n] = round(len(x) / SR, 3)
    json.dump(durs, open('vo/durs.json', 'w'), indent=0); print('total voice', round(sum(durs.values()), 1), 's'); sys.exit()
bgm, sr = sf.read(BGM, dtype='float32'); assert sr == SR
if bgm.ndim > 1: bgm = bgm.mean(1)
starts = json.load(open(STARTS)); vo = np.zeros_like(bgm); act = np.zeros(len(bgm), bool)
for n, t0 in starts.items():
    x, _ = sf.read(f'audio/vo/{n}.wav', dtype='float32'); x = x / (np.sqrt(np.mean(x ** 2)) + 1e-9) * 0.1 * 10 ** (VOGAIN.get(n, 0) / 20)   # same speech level per clip
    a = int(t0 * SR); vo[a:a + len(x)] += x[:len(vo) - a]; act[max(0, a - int(PRE * SR)):a + len(x)] = True
for a, b in FREE: act[int(a * SR):int(min(b, len(bgm) / SR) * SR)] = False
# gain curve: dip with ATT attack, REL release (one-pole smoothing on the target)
tgt = np.where(act, 10 ** (DUCK / 20), 1.0).astype(np.float32); g = np.empty_like(tgt); y = 1.0
ka, kr = 1 - np.exp(-1 / (ATT * SR)), 1 - np.exp(-1 / (REL * SR))
for i, v in enumerate(tgt): y += (v - y) * (ka if v < y else kr); g[i] = y
sf.write('audio/_vo_only.wav', vo, SR)
L = lambda f: float(subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', f, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr.split('Summary:')[1].split('I:')[1].split('LUFS')[0])
vo *= 10 ** ((-16 - L('audio/_vo_only.wav')) / 20); sf.write('audio/_vo_only.wav', vo, SR)
# a limiter on the VOICE only (consonant peaks), never on the music
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'audio/_vo_only.wav', '-af', 'alimiter=limit=0.5:attack=2:release=40:level=disabled', 'audio/_vo_lim.wav'], check=True)
vo, _ = sf.read('audio/_vo_lim.wav', dtype='float32'); vo = vo[:len(bgm)]; vo = np.pad(vo, (0, len(bgm) - len(vo)))
print('voice', L('audio/_vo_lim.wav'), 'LUFS')
mix = bgm * g + vo
f0, f1 = int(FADE[0] * SR), int(FADE[1] * SR); mix[f0:f1] *= np.linspace(1, 0, f1 - f0) ** 2; mix[f1:] = 0   # the fade over the last bar, as in ep43
pk = np.max(np.abs(mix))
if pk > 10 ** (-1 / 20): print('WARNING: sum peak', round(20 * np.log10(pk), 2), 'dBFS; lower the voice')
mix = mix[:int(END * SR)] if END else mix; sf.write(OUT, mix, SR); sf.write('audio/_duck_gain.wav', g, SR)
print('peak before', round(20 * np.log10(pk), 2), 'dBFS · mix', L(OUT), 'LUFS · voice share of time', round(act.mean() * 100), '%')
