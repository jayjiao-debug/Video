#!/usr/bin/env python3
"""《大脑是个赌徒》 music edit: the film's music is the owner's track, re-cut to play tricks on the listener's predictions.

    python3 scripts/edit_music.py      -> out/bgm_edit.wav (48 kHz stereo) + src/edit.json (film-time events + beats)

Splice points are measured on the track (see research/facts.md, 'music'):
  16.59  just before the first drop's hit (onset 16.64)
  10.49  start of the 3-bar dip that leads into it (b20)
  79.33–81.36  the quiet 'breath' bar before the second drop (no highs); 81.36 is just before its pickup hit (81.40)
Tricks:
  1. 拿走: the first drop is cut to silence for one bar; the listener's bet loses.
  2. 再来: the dip is replayed and the drop is given back (the title lands on it).
  3. 多等: the breath before the big drop plays twice, then one beat of silence, then the drop.
Every splice gets a 6 ms fade so nothing clicks; the silences are true digital silence."""
import json, subprocess
from pathlib import Path
import numpy as np, scipy.io.wavfile as wf

ROOT = Path(__file__).resolve().parent.parent
TR = json.loads((ROOT / 'src/track.json').read_text())
B = TR['beats']
BEAT = 60 / TR['tempo']                     # 0.5087 s
SR = 48000
src = ROOT / 'out/bgm48.wav'
if not src.exists():
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(ROOT / 'public/bgm.mp3'), '-ar', str(SR), '-ac', '2', str(src)], check=True)
_, X = wf.read(src); X = X.astype(np.float32) / 32768

DROP1 = B[32] - 0.02     # 16.59
DIP = B[20] - 0.02       # 10.49
PRE2 = 81.36             # just before the pickup of the big drop
BREATH = PRE2 - 4 * BEAT # one bar of the quiet breath
END = B[240] - 0.02

EDL = [
    ('play', B[16], DROP1, 'intro + dip'),
    ('silence', 4 * BEAT, None, 'trick 1: the drop is taken away'),
    ('play', DIP, DROP1, 'trick 2: the dip again'),
    ('play', DROP1, PRE2, 'drop 1 (title) -> section A -> break -> riser -> build -> breath'),
    ('play', BREATH, PRE2, 'trick 3: the breath again'),
    ('silence', BEAT, None, 'trick 3: one beat of nothing'),
    ('play', PRE2, END, 'the big drop -> out'),
]

FADE = int(0.006 * SR)
parts, film, segs = [], 0.0, []
for kind, a, z, note in EDL:
    if kind == 'silence':
        n = int(round(a * SR)); seg = np.zeros((n, 2), np.float32)
        segs.append(dict(kind=kind, film0=film, film1=film + n / SR, note=note))
    else:
        seg = X[int(round(a * SR)):int(round(z * SR))].copy()
        ramp = np.linspace(0, 1, FADE)[:, None]
        seg[:FADE] *= ramp; seg[-FADE:] *= ramp[::-1]
        segs.append(dict(kind=kind, src0=a, src1=z, film0=film, film1=film + len(seg) / SR, note=note))
    parts.append(seg); film += len(seg) / SR
Y = np.concatenate(parts)
wf.write(ROOT / 'out/bgm_edit.wav', SR, (np.clip(Y, -1, 1) * 32767).astype(np.int16))

def film_of(t, prefer=-1):
    """film time of track time t (last 'play' segment containing it unless prefer is given)"""
    hits = [s for s in segs if s['kind'] == 'play' and s['src0'] <= t < s['src1']]
    s = hits[prefer]
    return s['film0'] + t - s['src0']

beats = []
for s in segs:
    if s['kind'] != 'play': continue
    beats += [s['film0'] + b - s['src0'] for b in B if s['src0'] <= b < s['src1']]
EV = {
    'cut1': segs[0]['film1'],                  # where the first drop should have landed
    'replay': segs[2]['film0'],
    'title': segs[3]['film0'],                 # the drop, given back
    'break': film_of(B[96]), 'riser': film_of(B[120]), 'riserHit': film_of(B[127]), 'build': film_of(B[128]),
    'breath': film_of(79.19, 0), 'breath2': segs[4]['film0'], 'hush': segs[5]['film0'],
    'pickup': segs[6]['film0'] + 0.04, 'drop': film_of(B[161]), 'secB': film_of(B[176]), 'secC': film_of(B[192]),
    'secD': film_of(B[208]), 'outro': film_of(B[224]), 'end': film,
}
(ROOT / 'src/edit.json').write_text(json.dumps(dict(events={k: round(v, 3) for k, v in EV.items()},
    beats=[round(b, 3) for b in beats], segments=segs), ensure_ascii=False, indent=1))
for k, v in EV.items(): print(f'{k:9s} {v:7.2f}')
