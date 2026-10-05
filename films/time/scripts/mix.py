#!/usr/bin/env python3
"""Mix the soundtrack: the voice-over clips at their timeline starts, over the owner's track (from the timeline's
music offset), ducked under the voice with a sidechain compressor, faded out at the end, then loudness-normalised
(two-pass, −14 LUFS integrated, true peak ≤ −1.5 dBTP). Writes out/mix.wav.

    python3 scripts/mix.py
"""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TL = json.loads((ROOT / 'src/timeline.json').read_text())
END = TL['end']
OUT = ROOT / 'out'
OUT.mkdir(exist_ok=True)
MUSIC = ROOT / 'public/bgm.mp3'

# 1. voice track
inputs, parts = [], []
for k, l in enumerate(TL['lines']):
    inputs += ['-i', str(ROOT / f"public/vo/{l['id']}.wav")]
    ms = int(round(l['a'] * 1000))
    parts.append(f'[{k}:a]aresample=48000,adelay={ms}|{ms}[v{k}]')
n = len(TL['lines'])
fc = ';'.join(parts) + ';' + ''.join(f'[v{k}]' for k in range(n)) + f'amix=inputs={n}:normalize=0:dropout_transition=0,apad,atrim=0:{END},volume=1.0[vo]'
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', fc, '-map', '[vo]', '-ac', '1', '-ar', '48000', str(OUT / 'vo.wav')], check=True)

# 2. music bed, ducked by the voice, faded out over the last 3 s; voice gets a touch of compression and EQ
fade = 3.0
fc = (f"[1:a]atrim=start={TL['musicOffset']}:duration={END},asetpts=PTS-STARTPTS,aresample=48000,volume=0.26[m];"
      f"[0:a]highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=5:release=120:makeup=2,volume=2.0,asplit=2[vo1][sc];"
      f"[m][sc]sidechaincompress=threshold=0.025:ratio=3:attack=15:release=900:makeup=1[md];"
      f"[md]afade=t=out:st={END - fade}:d={fade}[mf];"
      f"[vo1]pan=stereo|c0=c0|c1=c0[vs];"
      f"[mf][vs]amix=inputs=2:normalize=0,atrim=0:{END}[mix]")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(OUT / 'vo.wav'), '-i', str(MUSIC), '-filter_complex', fc, '-map', '[mix]', '-ar', '48000', str(OUT / 'mix_raw.wav')], check=True)

# 3. loudness
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(OUT / 'mix_raw.wav'), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
m = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
      f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,alimiter=limit=0.80:level=false")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(OUT / 'mix_raw.wav'), '-af', af, '-ar', '48000', str(OUT / 'mix.wav')], check=True)
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(OUT / 'mix.wav'), '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
summ = r[r.rindex('Summary'):]
print(' '.join(summ.split()))
