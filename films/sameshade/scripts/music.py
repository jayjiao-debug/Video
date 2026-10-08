#!/usr/bin/env python3
"""《大脑的懒惰》 music (v7): the owner's track from beat 16, lengthened by repeating whole phrases so the story can
breathe, never by stretching lines. Every splice sits on the same beat of a repeated phrase, so the grid never slips.

    python3 scripts/music.py   -> out/bgm_trim.wav (48 kHz stereo) + src/music.json (film-time events)

EDL (track beats):  B16 → B64  |  B48 → B112  |  B104 → end
  - the second 16-beat phrase of the main section plays twice (+8.14 s for the board and the tables)
  - the half phrase B104–B112 of the quiet section plays twice (+4.07 s for the race)
  - the film runs 23 bars past the drop instead of 20 (the song simply keeps going).
After the big drop the tracker's grid is half a beat off; accents there count from the measured onset (track 81.40)."""
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
EDL = [(G(16), G(64)), (G(48), G(112)), (G(104), None)]
# joins: an equal-power crossfade 60 ms long centred on each splice (a fade-out/fade-in dip clicks in the quiet section)
H = int(0.030 * SR)
segs, film = [], 0.0
Y = np.zeros((0, 2), np.float32)
for n, (a, z) in enumerate(EDL):
    i0 = int(round(a * SR)); i1 = len(X) if z is None else int(round(z * SR))
    seg = X[i0 - (H if n else 0): i1 + (H if z is not None else 0)].copy()
    segs.append(dict(src0=a, src1=z if z is not None else len(X) / SR, film0=film))
    if n == 0:
        Y = seg
    else:
        k = np.linspace(0, np.pi / 2, 2 * H)[:, None]
        tail, head = Y[-2 * H:], seg[:2 * H]
        Y = np.concatenate([Y[:-2 * H], tail * np.cos(k) + head * np.sin(k), seg[2 * H:]])
    film += (i1 - i0) / SR
wf.write(ROOT / 'out/bgm_trim.wav', SR, (np.clip(Y, -1, 1) * 32767).astype(np.int16))
def film_of(t):
    for s in reversed(segs):
        if s['src0'] <= t < s['src1']: return s['film0'] + t - s['src0']
    raise ValueError(t)
drop = film_of(DROP_TR)
BAR = 4 * BEAT
EV = {'title': film_of(G(32)), 'break': film_of(G(96)), 'build': film_of(G(128)), 'drop': drop,
      'end': drop + 23 * BAR, 'p5': drop + 23 * BAR}
beats = sorted({round(s['film0'] + (G(i) - s['src0']), 3) for s in segs for i in range(16, 330) if s['src0'] <= G(i) < s['src1']})
(ROOT / 'src/music.json').write_text(json.dumps({'events': {k: round(v, 3) for k, v in EV.items()}, 'beat': BEAT, 'beats': beats}, indent=1))
for k, v in EV.items(): print(f'{k:6s} {v:8.3f}')
print('film length available', round(film, 2))
