"""Look at a mix: spectrogram, short-term loudness, per-bus levels, band balance. python3 analyze.py mix.wav [stems_dir] out.png"""
import sys, os, glob
import numpy as np, soundfile as sf
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
import pyloudnorm as pyln

def short_term(x, sr, win=3.0, hop=0.5):
    m = pyln.Meter(sr, block_size=0.4)
    out = []
    for i in range(0, max(1, len(x) - int(win * sr)), int(hop * sr)):
        try: out.append((i / sr, m.integrated_loudness(x[i:i + int(win * sr)])))
        except Exception: out.append((i / sr, -70))
    return np.array(out)

def bands(x, sr):
    X = np.abs(np.fft.rfft(x.mean(1) * np.hanning(len(x)))) ** 2
    f = np.fft.rfftfreq(len(x), 1 / sr)
    edges = [20, 60, 120, 250, 500, 1000, 2000, 4000, 8000, 16000]
    e = [X[(f >= a) & (f < b)].sum() for a, b in zip(edges[:-1], edges[1:])]
    e = 10 * np.log10(np.array(e) / sum(e) + 1e-12)
    return edges, e

if __name__ == '__main__':
    mix, stems, out = sys.argv[1], (sys.argv[2] if len(sys.argv) > 3 else None), sys.argv[-1]
    x, sr = sf.read(mix)
    fig, ax = plt.subplots(4, 1, figsize=(14, 13), gridspec_kw={'height_ratios': [3, 1.3, 2, 1.5]})
    ax[0].specgram(x.mean(1), NFFT=2048, Fs=sr, noverlap=1536, cmap='magma', vmin=-120)
    ax[0].set_yscale('symlog', linthresh=200); ax[0].set_ylim(30, 16000); ax[0].set_title(os.path.basename(mix))
    st = short_term(x, sr)
    ax[1].plot(st[:, 0] + 1.5, st[:, 1]); ax[1].set_ylabel('LUFS-S'); ax[1].grid(alpha=.3); ax[1].set_xlim(0, len(x) / sr)
    if stems:
        for f in sorted(glob.glob(f'{stems}/bus_*.wav')):
            y, _ = sf.read(f); hop = sr // 10
            n = len(y) // hop
            r = 20 * np.log10(np.sqrt((y[:n * hop].mean(1).reshape(n, hop) ** 2).mean(1)) + 1e-6)
            ax[2].plot(np.arange(n) / 10, r, label=os.path.basename(f)[4:-4], lw=1)
        ax[2].legend(ncol=5); ax[2].set_ylim(-60, 0); ax[2].grid(alpha=.3); ax[2].set_ylabel('bus RMS dB'); ax[2].set_xlim(0, len(x) / sr)
    ed, e = bands(x, sr)
    ax[3].bar([f'{a}-{b}' for a, b in zip(ed[:-1], ed[1:])], e); ax[3].set_ylabel('share dB'); ax[3].grid(alpha=.3)
    plt.tight_layout(); plt.savefig(out, dpi=60)
    m = pyln.Meter(sr)
    print('integrated LUFS %.1f  peak %.2f dBFS' % (m.integrated_loudness(x), 20 * np.log10(np.abs(x).max())))
    print('band shares dB:', ' '.join(f'{a}-{b}:{v:.1f}' for a, b, v in zip(ed[:-1], ed[1:], e)))
