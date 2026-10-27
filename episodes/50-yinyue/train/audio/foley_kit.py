"""Cut one-shots for the rail kit and the foley from CC0 BigSoundBank recordings (bigsoundbank.com, Joseph Sardin).
python3 foley_kit.py → /home/user/samples/foley/kit/<name>_<n>.wav (48 kHz stereo, peak −1 dBFS) + kit.json
"""
import json, os
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, find_peaks, resample_poly
from scipy.ndimage import median_filter

SRC = '/home/user/samples/foley/bsb'
OUT = '/home/user/samples/foley/kit'
SR = 48000


def load(f):
    x, sr = sf.read(f'{SRC}/{f}', always_2d=True, dtype='float32')
    if x.shape[1] == 1:
        x = np.repeat(x, 2, 1)
    if sr != SR:
        x = resample_poly(x, SR // 100, sr // 100, axis=0).astype('float32')
    return x


def onsets(x, lo=300, hi=8000, thr=3.0, min_gap=0.08):
    m = x.mean(1)
    h = sosfilt(butter(4, [lo, hi], 'bandpass', fs=SR, output='sos'), m)
    hop = int(SR * 0.005)
    n = len(h) // hop
    e = np.sqrt((h[:n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-9
    r = e / (median_filter(e, 101) + 1e-9)
    pk, pr = find_peaks(r, height=thr, distance=int(min_gap / 0.005))
    return pk * hop, pr['peak_heights']


def cut(x, i, length, pre=0.01, fade=0.05):
    a = max(0, i - int(pre * SR))
    y = x[a:a + int(length * SR)].copy()
    f = min(len(y), int(fade * SR))
    y[-f:] *= np.linspace(1, 0, f)[:, None] ** 2
    y[:32] *= np.linspace(0, 1, 32)[:, None]
    return y


def norm(y, peak_db=-1.0):
    p = np.abs(y).max() + 1e-9
    return (y / p * 10 ** (peak_db / 20)).astype('float32')


def save(name, ys):
    out = []
    for k, y in enumerate(ys):
        p = f'{OUT}/{name}_{k}.wav'
        sf.write(p, norm(y), SR)
        out.append(p)
    return out


def at(f, times, length):
    x = load(f)
    return [cut(x, int(t * SR), length) for t in times]


def sliced(f, n, length, **kw):
    x = load(f)
    idx, h = onsets(x, **kw)
    order = np.argsort(h)[::-1][:n]
    return [cut(x, idx[j], length) for j in sorted(order)]


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    kit = {}
    # 哐-当: wheel pairs crossing a joint (two axles 60–105 ms apart), cut 30 ms early
    kit['clack'] = save('clack', at('3040.flac', [29.885, 41.770, 106.135], 0.6)
                        + at('2727.flac', [71.960, 141.695], 0.6) + at('3043.flac', [37.565], 0.6))
    kit['horn'] = save('horn', at('0277.ogg', [0.0], 1.9) + at('2846.flac', [0.0], 6.9) + at('2847.flac', [0.0], 6.5))
    kit['door'] = save('door', at('0336.ogg', [0.0], 5.1))
    kit['gong'] = save('gong', [load(f) for f in ('1482.flac', '1483.flac', '1484.flac', '1485.flac')])
    kit['cracker'] = save('cracker', [load(f) for f in ('1137.flac', '1138.flac', '1139.flac', '1140.flac')])
    kit['crackers'] = save('crackers', at('0919.ogg', [0.0], 14.0))
    kit['bottle'] = save('bottle', sliced('0487.ogg', 8, 0.6, lo=1500, hi=12000))
    kit['beer'] = save('beer', [load(f) for f in ('1935.flac', '1936.flac', '1937.flac', '1938.flac')])
    kit['woodblock'] = save('woodblock', sliced('0466.ogg', 8, 0.4, lo=500, hi=8000))
    kit['bell'] = save('bell', sliced('2530.flac', 4, 2.0, lo=1500, hi=10000))
    json.dump(kit, open(f'{OUT}/kit.json', 'w'), indent=1)
    for k, v in kit.items():
        print(k, len(v))
