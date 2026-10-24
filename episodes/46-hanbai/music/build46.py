"""ep46 汉柏 music bed from bgm2.mp3 — the ep42 plan "A" (episodes/42-yiyi/music/music_map_ep42.json, build_v2.py
semantics) with ONE extra 2-bar intro loop at the start, so the song's first crash (song 9.060) lands on the title at
film 13.588 and every later anchor of plan A moves +4.528 s (2 bars).

Loop: play song [0, B(13)) then jump back to B(5) (bars 2-3 repeat). Measured: log-spectrum distance 0.90 after the
join and 0.86 before it (the other candidates were 1.5 and 8.1), 10 ms crossfade on a downbeat.

SPANS/XF follow build_v2.py: out = beat, in = beat - XF. bgm2.mp3 is never committed (gitignored)."""
import numpy as np, soundfile as sf, pyloudnorm as pyln, subprocess, json, sys
from scipy.signal import fftconvolve

SR = 48000
SONG = '/home/claude/video/episodes/41-sanqiannian/audio/bgm2.mp3'
P = 0.56605
def B(k): return 0.5688 + P * (k - 1)          # song beat k (part-1 grid; downbeats at k = 1 mod 4)
STOP = 252.128                                  # coda dead stop (measured, ep42 map)

def load(path, sr=SR):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(sr), '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()

SPANS = [(0.0, B(13)), (B(5) - 0.010, 86.608), (163.581, 181.139), (181.695, B(354)), (B(426) - 0.040, STOP), ('gap', 1.70), (0.0, B(29))]
XF = [0.010, 0.010, 0.010, 0.040, 0.015, 0.010]

def build(song):
    bgm = song[:0]; joins = []
    for k, sp in enumerate(SPANS):
        seg = np.zeros((int(round(sp[1] * SR)), 2), np.float32) if sp[0] == 'gap' else song[int(round(sp[0] * SR)):int(round(sp[1] * SR))].copy()
        if len(bgm):
            xf = int(round(XF[k - 1] * SR)); r = np.linspace(0, 1, xf)[:, None]
            bgm[-xf:] = bgm[-xf:] * (1 - r) + seg[:xf] * r; seg = seg[xf:]; joins.append(len(bgm) / SR)
        bgm = np.concatenate([bgm, seg])
    n = len(bgm)
    def tail_at(a, b, at, ir, db):
        tl = song[int(a * SR):int(b * SR)]; rv = np.stack([fftconvolve(tl[:, c], ir) for c in range(2)], 1).astype(np.float32) * 10 ** (db / 20)
        j = int(at * SR); mm = min(len(rv), n - j); bgm[j:j + mm] += rv[:mm]
    ir = np.random.default_rng(7).standard_normal(int(2.5 * SR)) * np.exp(-np.arange(int(2.5 * SR)) / (0.55 * SR)); ir /= np.sqrt((ir ** 2).sum())
    ir2 = np.random.default_rng(11).standard_normal(int(4.0 * SR)) * np.exp(-np.arange(int(4.0 * SR)) / (1.1 * SR)); ir2 /= np.sqrt((ir2 ** 2).sum())
    tail_at(B(354) - 0.3, B(354), joins[3], ir, -12)        # drop -> coda cut rings
    tail_at(STOP - 0.4, STOP, joins[4] - 0.4, ir2, -9)       # coda dead stop rings into the gap
    t = np.arange(n) / SR; g = np.ones(n)
    DROP = joins[3] - (B(354) - B(338))
    up = np.clip((t - (DROP - 2 * P)) / P, 0, 1); w = 0.5 - 0.5 * np.cos(np.pi * up); w[t >= DROP] = 0; g *= 10 ** (-5 * w / 20)   # pre-drop breath
    jr = int((joins[5] - 0.010) * SR); g[jr:] *= 10 ** (-3 / 20)        # bookend return -3 dB
    F = B(29) - B(21); i = int((n / SR - F) * SR); g[i:] *= np.cos(np.linspace(0, 1, n - i) * np.pi / 2) ** 1.5   # fade over the last 2 bars
    return (bgm * g[:, None]).astype(np.float32), joins, DROP

if __name__ == '__main__':
    song = load(SONG)
    x, j, d = build(song)
    m = pyln.Meter(SR); x *= 10 ** ((-14 - m.integrated_loudness(x)) / 20)
    out = '/home/claude/video/episodes/46-hanbai/audio/ep46_bed_v1.wav'
    import os; os.makedirs(os.path.dirname(out), exist_ok=True)
    sf.write(out, x, SR, subtype='PCM_24')
    first_note_return = j[5] + 0.555
    anchors = {'length': round(len(x) / SR, 3), 'joins': [round(v, 3) for v in j], 'title_hit': round(9.060 + 2 * 4 * P, 3),
               'drop': round(d, 3), 'coda_cut': round(j[3], 3), 'dead_stop': round(j[4], 3), 'intro_return': round(j[5], 3),
               'final_hit': round(j[5] + 9.060, 3), 'fade_start': round(len(x) / SR - (B(29) - B(21)), 3)}
    json.dump(anchors, open('/home/claude/video/episodes/46-hanbai/music/anchors46.json', 'w'), indent=1)
    print(anchors)
