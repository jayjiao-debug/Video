"""ep50 final mix: the music bed (ep50_bed.wav, -14 LUFS) + sound effects placed from sfx_cues.json.

sfx_cues.json: [{"t": film s, "sfx": "iron_drag", "db": -4, ...}, ...]  optional per cue:
  len        seconds of the effect kept (after src_start)
  src_start  seconds skipped at the head of the effect file
  lead       seconds: the effect's main transient sits this far into the (trimmed) file; it is placed at t - lead
  semitones  pitch shift (rubberband, length kept) so tonal effects sit in the song's key
  hp         high-pass corner in Hz (2nd-order Butterworth, both channels)
  fade_in / fade_out  seconds (default 0.0 / 0.15)
  role       label used by the level report (accent / normal / soft / hush)
  off        true = cue kept in the list for reference but not mixed
Each effect is normalised first (longer than 0.5 s: -20 LUFS integrated; shorter: peak -8 dBFS), then gets "db".
No ducking of the bed (owner, ep14: no sidechain ducking; the bed's own hits must stay intact).
Output: ep50_mix.wav (48 kHz stereo 24-bit, -14 LUFS integrated, true peak <= -1.5 dBTP). Audio is gitignored.
`python3 mix50.py --report` also prints, per cue: the effect's loudest 400 ms vs the bed under it (dLUFS), the
effect's best 1/3-octave band vs the bed's over 150 ms around the effect's peak (band SNR = audibility), and effect peak vs the bed's local peak."""
import json, os, sys, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, lfilter, resample_poly
SR = 48000; A = os.path.dirname(os.path.abspath(__file__))
SFX = '/tmp/claude-0/-home-claude/bf206d1e-1152-5595-9b84-b15be6e5a777/scratchpad/sfx50'
TP_CEIL = -1.5


def load(path, semitones=0.0):
    af = ['-af', f'rubberband=pitch={2 ** (semitones / 12):.6f}:pitchq=quality:transients=crisp'] if semitones else []
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, *af, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


meter = pyln.Meter(SR)


def render(c):
    """Return (start sample, stereo effect) for one cue, gain included."""
    a = load(f"{SFX}/sfx_{c['sfx']}.mp3", c.get('semitones', 0.0))
    a = a[int(c.get('src_start', 0.0) * SR):]
    if c.get('len'): a = a[:int(c['len'] * SR)]
    if len(a) / SR > 0.5:
        L = meter.integrated_loudness(a.astype(np.float64))
        a *= 10 ** ((-20 - L) / 20) if np.isfinite(L) else 1
    else:
        a *= 10 ** (-8 / 20) / max(np.abs(a).max(), 1e-6)
    if c.get('hp'):
        a = sosfilt(butter(2, c['hp'], 'high', fs=SR, output='sos'), a, axis=0).astype(np.float32)
    fi, fo = int(c.get('fade_in', 0.0) * SR), int(c.get('fade_out', 0.15) * SR)
    if fi: a[:fi] *= np.linspace(0, 1, fi)[:, None]
    if fo: a[-fo:] *= np.linspace(1, 0, fo)[:, None]
    a *= 10 ** (c.get('db', -6) / 20)
    return int(round((c['t'] - c.get('lead', 0.0)) * SR)), a


def kw(x):  # BS.1770 K-weighting at 48 kHz
    b1 = [1.53512485958697, -2.69169618940638, 1.19839281085285]; a1 = [1.0, -1.69065929318241, 0.73248077421585]
    b2 = [1.0, -2.0, 1.0]; a2 = [1.0, -1.99004745483398, 0.99007225036621]
    return lfilter(b2, a2, lfilter(b1, a1, x, axis=0), axis=0)


def mloud(x):  # loudest 400 ms (momentary LUFS) and the window start
    p = (kw(x.astype(np.float64)) ** 2).sum(1); n = int(0.4 * SR)
    if len(p) < n: return -0.691 + 10 * np.log10(p.sum() / n + 1e-15), 0
    cs = np.concatenate([[0], np.cumsum(p)]); w = (cs[n:] - cs[:-n]) / n; k = int(np.argmax(w))
    return -0.691 + 10 * np.log10(w[k] + 1e-15), k


EDGES = 100 * 2 ** (np.arange(0, 22) / 3)            # 1/3-octave bands 100 Hz .. 12.7 kHz


def bands(x):
    X = np.abs(np.fft.rfft(x.mean(1) * np.hanning(len(x)))) ** 2; f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.array([10 * np.log10(X[(f >= lo) & (f < lo * 2 ** (1 / 3))].sum() + 1e-15) for lo in EDGES])


def main(report=False):
    bed = load(f'{A}/ep50_bed.wav'); n = len(bed)
    cues = sorted(json.load(open(f'{A}/sfx_cues.json')), key=lambda c: c['t'])
    fx = np.zeros_like(bed); rows = []
    for c in cues:
        if c.get('off'): continue
        i0, a = render(c)
        if i0 < 0: a = a[-i0:]; i0 = 0
        m = min(len(a), n - i0)
        if m <= 0: continue
        a = a[:m]; fx[i0:i0 + m] += a
        if report:
            eM, k = mloud(a); w0 = i0 + k; w1 = min(w0 + int(0.4 * SR), n)
            bM = -0.691 + 10 * np.log10((kw(bed[max(w0 - SR // 4, 0):w1 + SR // 4].astype(np.float64)) ** 2).sum(1).mean() + 1e-15)
            pe = (a.astype(np.float64) ** 2).sum(1); h = int(0.075 * SR)
            pk = int(np.argmax(np.convolve(pe, np.ones(int(0.01 * SR)), 'same'))); s0 = max(pk - h, 0)
            seg_e = a[s0:s0 + 2 * h]; seg_b = bed[i0 + s0:i0 + s0 + len(seg_e)]   # 150 ms around the effect's peak
            snr = bands(seg_e) - bands(seg_b); j = int(np.argmax(snr))
            pk_e = 20 * np.log10(np.abs(a).max() + 1e-9)
            pk_b = 20 * np.log10(np.abs(bed[max(i0 - SR // 5, 0):i0 + m + SR // 5]).max() + 1e-9)
            rows.append(dict(t=c['t'], sfx=c['sfx'], role=c.get('role', ''), db=c.get('db'), eff_M=round(float(eM), 1),
                             bed_M=round(float(bM), 1), dLUFS=round(float(eM - bM), 1), band_snr=round(float(snr[j]), 1),
                             band_hz=int(EDGES[j]), dPeak=round(float(pk_e - pk_b), 1)))
    if report:
        json.dump(rows, open(f'{A}/_sfx_report.json', 'w'), indent=0, ensure_ascii=False, default=float)
        for r in rows:
            print(f"{r['t']:7.2f} {r['sfx']:16s} {r['role']:6s} db {r['db']:5} eff {r['eff_M']:6.1f} bed {r['bed_M']:6.1f} "
                  f"dLUFS {r['dLUFS']:6.1f} bandSNR {r['band_snr']:6.1f}@{r['band_hz']:5d} dPeak {r['dPeak']:6.1f}")
    mix = bed + fx
    mix *= 10 ** ((-14 - meter.integrated_loudness(mix.astype(np.float64))) / 20)
    tp = 20 * np.log10(np.abs(resample_poly(mix, 4, 1, axis=0)).max())
    if tp > TP_CEIL:                                   # only the effect layer is turned down, never the bed
        raise SystemExit(f'true peak {tp:.2f} dBTP > {TP_CEIL}: lower the loudest cue (see --report dPeak)')
    sf.write(f'{A}/ep50_mix.wav', mix.astype(np.float32), SR, subtype='PCM_24')
    out = dict(lufs=round(meter.integrated_loudness(mix.astype(np.float64)), 2), true_peak_dbtp=round(float(tp), 2),
               cues_mixed=sum(1 for c in cues if not c.get('off')), cues_off=sum(1 for c in cues if c.get('off')))
    print(json.dumps(out))
    return mix


if __name__ == '__main__':
    main(report='--report' in sys.argv)
