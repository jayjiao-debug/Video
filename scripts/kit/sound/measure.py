#!/usr/bin/env python3
"""Measures the delivered effect clips, to pick takes without ears.
usage: measure.py <clips dir> [report.json ...]        (numpy + ffmpeg)
Per clip: length; where the sound starts (on), its loudest point (pk), how long it rings after it (ring = time from the
loudest point until the level is 20 dB down), how many separate hits it holds (hits: envelope peaks at least 70 ms apart
and less than 12 dB under the loudest), loudest 50 ms (dBFS), the average level, where the energy sits (centroid in Hz;
share under 150 Hz = what a phone speaker does not play; 150-1k; 1-4 k = where speech is understood; over 4 k), for
ambience how even it is (sd of the 250 ms levels in dB; a low figure = steady), and the farm's AudioSet labels."""
import json, os, subprocess, sys
import numpy as np
SR = 44100
def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)
def win_rms(x, ms):
    n = max(1, int(SR * ms / 1000)); c = np.cumsum(np.concatenate([[0.0], x * x]))
    if len(x) <= n: return np.array([np.sqrt(c[-1] / max(1, len(x)))])
    return np.sqrt(np.maximum(0, c[n:] - c[:-n]) / n)
db = lambda v: 20 * np.log10(max(float(v), 1e-9))
def measure(x):
    env = win_rms(x, 5); pk = env.max(); on = np.nonzero(env > pk * 10 ** (-40 / 20))[0]
    start = on[0] / SR; end = on[-1] / SR
    onset = np.nonzero(env > pk * 0.25)[0][0] / SR
    e10 = win_rms(x, 10); ip = int(np.argmax(e10)); after = e10[ip:]
    below = np.nonzero(after < e10[ip] * 0.1)[0]; ring = (below[0] / SR) if len(below) else (len(after) / SR)
    # separate hits: local maxima of the 10 ms envelope, 70 ms apart, within 12 dB of the loudest
    h = e10[:: SR // 200]; thr = h.max() * 10 ** (-12 / 20); hits = []; last = -99
    for i in range(1, len(h) - 1):
        if h[i] >= thr and h[i] >= h[i - 1] and h[i] > h[i + 1] and (i - last) * 5 >= 70: hits.append(i * 5); last = i
    X = np.abs(np.fft.rfft(x)) ** 2; f = np.fft.rfftfreq(len(x), 1 / SR); tot = X.sum() + 1e-20
    share = lambda lo, hi: 100 * X[(f >= lo) & (f < hi)].sum() / tot
    lv = win_rms(x, 250)[:: SR // 8]; lv = 20 * np.log10(np.maximum(lv, 1e-9)); lv = lv[lv > lv.max() - 40]
    return dict(len=len(x) / SR, start=start, end=end, on=onset, pk=ip / SR, ring=ring, hits=len(hits), hit_ms=hits[:6],
                loud=db(win_rms(x, 50).max()), rms=db(np.sqrt((x * x).mean())), peak=db(np.abs(x).max()),
                cen=float((f * X).sum() / tot), lo=share(0, 150), mid=share(150, 1000), sp=share(1000, 4000), hi=share(4000, 1e9), sd=float(lv.std()))
if __name__ == "__main__":
    d = sys.argv[1]; tags = {}
    for rp in sys.argv[2:]:
        for c in json.load(open(rp, encoding="utf8")).get("clips", []):
            if c.get("tags"): tags[c["name"]] = " ".join(f"{t[0]} {t[1]:.2f};" for t in c["tags"][:4])
    print(f"{'clip':16} {'len':>5} {'on':>5} {'pk':>5} {'ring':>5} {'hits':>4} {'loud':>6} {'rms':>6} {'peak':>6} {'cen Hz':>6} {'<150':>4} {'-1k':>4} {'1-4k':>4} {'>4k':>4} {'sd':>4}  hits at ms / labels")
    for fn in sorted(os.listdir(d)):
        if not fn.endswith(".mp3"): continue
        m = measure(load(os.path.join(d, fn))); n = fn[:-4]
        print(f"{n:16} {m['len']:5.2f} {m['on']:5.2f} {m['pk']:5.2f} {m['ring']:5.2f} {m['hits']:4d} {m['loud']:6.1f} {m['rms']:6.1f} {m['peak']:6.1f} {m['cen']:6.0f} {m['lo']:4.0f} {m['mid']:4.0f} {m['sp']:4.0f} {m['hi']:4.0f} {m['sd']:4.1f}  {m['hit_ms']}  {tags.get(n, '')}")
