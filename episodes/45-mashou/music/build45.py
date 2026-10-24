"""ep45 music beds from bgm2 (episodes/41-sanqiannian/audio/bgm2.mp3, never committed), on the ep42 grid.

Intro loop: song bars 1-2 play twice more before the intro runs on, so the song's first crash (beat 16, song 9.059)
lands at film 18.115 = the title, and the B section (song 11.889) at film 20.945 = A1. All joins sit on bar downbeats
(same beat phase), 10 ms crossfades, so the film keeps the song's own grid: film beat k = 0.5688 + k*0.56605.

usage: python3 build45.py demo   -> ep45_demo_bed.wav (0-34.532 s, fade over the last bar, -14 LUFS)
"""
import sys, numpy as np, soundfile as sf, pyloudnorm as pyln
sys.path.insert(0, '/home/claude/video/episodes/42-yiyi/music')
from build42 import song, SR, B, P

XF = 0.010
def cut(spans):
    out = song[:0]; joins = []
    for a, b in spans:
        seg = song[int(round(a * SR)):int(round(b * SR))].copy()
        if len(out):
            n = int(round(XF * SR)); r = np.linspace(0, 1, n)[:, None]; out[-n:] = out[-n:] * (1 - r) + seg[:n] * r; seg = seg[n:]; joins.append(len(out) / SR)
        out = np.concatenate([out, seg])
    return out, joins

if __name__ == '__main__':
    end = 0.5688 + 60 * P                                     # film 34.532 (beat 60)
    spans = [(0.0, B(9)), (B(1) - XF, B(9)), (B(1) - XF, None)]
    film_before = B(9) + (B(9) - B(1))                         # film time where span 3 starts
    spans[2] = (spans[2][0], spans[2][0] + XF + (end - film_before))
    x, joins = cut(spans)
    x = x[:int(round(end * SR))]
    t = np.arange(len(x)) / SR; fa = 0.5688 + 56 * P           # fade over the last bar
    g = np.where(t < fa, 1.0, np.cos(np.clip((t - fa) / (end - fa), 0, 1) * np.pi / 2) ** 1.5)
    x = (x * g[:, None]).astype(np.float32)
    m = pyln.Meter(SR); x *= 10 ** ((-14 - m.integrated_loudness(x)) / 20)
    sf.write('ep45_demo_bed.wav', x, SR, subtype='PCM_24')
    print('demo bed %.3f s, joins %s, crash at film %.3f' % (len(x) / SR, [round(j, 3) for j in joins], film_before + (B(16) - B(1))))
