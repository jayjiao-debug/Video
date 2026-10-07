#!/usr/bin/env python3
"""《大脑的懒惰》 music: the owner's track, uncut, from beat 16 (track 8.473 s) so the first drop lands at film 8.14.

    python3 scripts/music.py   -> out/bgm_trim.wav (48 kHz stereo) + src/music.json (film-time events)

The beat tracker's grid is half a beat off from the big drop on; accents after it are placed from the measured
onset (track 81.40), as in 《大脑是个赌徒》."""
import json, subprocess
from pathlib import Path
import numpy as np, scipy.io.wavfile as wf

ROOT = Path(__file__).resolve().parent.parent
TR = json.loads((ROOT / 'src/track.json').read_text())
B = TR['beats']; BEAT = 60 / TR['tempo']; SR = 48000
O = B[16]                                   # film 0
src = ROOT / 'out/bgm48.wav'
if not src.exists():
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(ROOT / 'public/bgm.mp3'), '-ar', str(SR), '-ac', '2', str(src)], check=True)
_, X = wf.read(src); X = X.astype(np.float32) / 32768
Y = X[int(round(O * SR)):].copy()
f = int(0.006 * SR); Y[:f] *= np.linspace(0, 1, f)[:, None]
wf.write(ROOT / 'out/bgm_trim.wav', SR, (np.clip(Y, -1, 1) * 32767).astype(np.int16))
drop = 81.40 - O
EV = {'title': B[32] - O, 'break': B[96] - O, 'build': B[128] - O, 'drop': drop,
      **{f'p{k}': drop + 16 * k * BEAT for k in range(1, 7)}}
(ROOT / 'src/music.json').write_text(json.dumps({'events': {k: round(v, 3) for k, v in EV.items()}, 'beat': BEAT,
    'beats': [round(b - O, 3) for b in B if b >= O]}, indent=1))
for k, v in EV.items(): print(f'{k:6s} {v:7.3f}')
