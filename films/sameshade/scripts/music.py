#!/usr/bin/env python3
"""《大脑的懒惰》 music (v8): the owner's track exactly as it is, from 0:00, no cuts, no repeats, no edits.
The film is timed to the track; finish.py only fades the last 2 s and sets loudness.

    python3 scripts/music.py   -> src/music.json (film-time events = track-time events)

  title  = B16 (8.47, the first big hit)      break = G(96) 49.17      build = G(128) 65.45
  drop   = measured onset 81.40               end   = drop + 23 bars (128.20)
After the big drop the tracker's grid is half a beat off; accents there count from the measured onset."""
import json, subprocess
from pathlib import Path
import numpy as np, scipy.io.wavfile as wf

ROOT = Path(__file__).resolve().parent.parent
TR = json.loads((ROOT / 'src/track.json').read_text())
B = TR['beats']; BEAT = 60 / TR['tempo']; SR = 48000
src = ROOT / 'out/bgm48.wav'
if not src.exists():
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(ROOT / 'public/bgm.mp3'), '-ar', str(SR), '-ac', '2', str(src)], check=True)
_, X = wf.read(src); X = X.astype(np.float32) / 32768
# beats on one exact grid anchored at B16 (the tracker's values wobble by a few ms; the tempo is constant)
G = lambda i: B[16] + (i - 16) * BEAT
DROP_TR = 81.40
dur = len(X) / SR
film_of = lambda t: t
drop = film_of(DROP_TR)
BAR = 4 * BEAT
EV = {'title': film_of(G(16)), 'break': film_of(G(96)), 'build': film_of(G(128)), 'drop': drop,
      'end': drop + 23 * BAR, 'p5': drop + 23 * BAR}
beats = [round(G(i), 3) for i in range(0, 330) if 0 <= G(i) < dur]
(ROOT / 'src/music.json').write_text(json.dumps({'events': {k: round(v, 3) for k, v in EV.items()}, 'beat': BEAT, 'beats': beats}, indent=1))
for k, v in EV.items(): print(f'{k:6s} {v:8.3f}')
print('track length', round(dur, 2))
