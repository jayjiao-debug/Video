#!/usr/bin/env python3
"""inner_timing.py <voice letter> <timing.json> : inside each line, where are the pauses of the stretched take
(asm/<voice><nn>.wav) against the caption boundaries the picture was timed to (proportional to the characters)?"""
import sys, json, re, subprocess, numpy as np
import os
SR = 44100
voice, tj = sys.argv[1], json.load(open(sys.argv[2], encoding="utf8"))
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "gen_timing.py"), encoding="utf8").read()
CAP = eval(src[src.index("CAP = [") + 6: src.index("SEG_OF")])
cjk = lambda s: len(re.findall(r"[一-鿿]", s))
def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)
def gaps(x, thr_db=-36, min_ms=28):
    n = int(0.005 * SR); m = len(x) // n; e = 20 * np.log10(np.maximum(np.sqrt((x[: m * n].reshape(m, n) ** 2).mean(1)), 1e-9))
    q = e < thr_db; out = []; i = 0
    while i < m:
        if q[i]:
            j = i
            while j < m and q[j]: j += 1
            if (j - i) * 5 >= min_ms and i > 0 and j < m: out.append(((i + j) / 2 * 0.005, (j - i) * 5))
            i = j
        else: i += 1
    return out
worst = []
for n, row in enumerate(tj["lines"], 1):
    x = load(f"asm/{voice}{n:02d}.wav"); d = len(x) / SR; g = gaps(x)
    groups = [c if isinstance(c, str) else c[0] for c in CAP[n - 1]]; tot = sum(cjk(c) for c in groups); acc = 0; bounds = []
    for c in groups[:-1]: acc += cjk(c); bounds.append((acc / tot * d, c))
    cells = []
    for b, c in bounds:
        if g:
            k = min(g, key=lambda t: abs(t[0] - b)); dv = k[0] - b
            cells.append(f"{re.sub('[【】“”]', '', c)}| {dv * 30:+.0f}f"); worst.append((abs(dv), n, c, dv))
        else: cells.append(f"{c}| no pause")
    print(f"{n:2d} {d:4.2f}s pauses {len(g)} / boundaries {len(bounds)}: " + "  ".join(cells))
worst.sort(reverse=True)
print("largest distances between a caption boundary and the nearest pause (frames; + = the voice is later than the caption):")
print("  " + ", ".join(f"line {w[1]} after {re.sub('[【】“”]', '', w[2])} {w[3] * 30:+.0f}f" for w in worst[:10]))
print("  mean |distance| %.1f frames, over 3 frames: %d of %d" % (np.mean([w[0] for w in worst]) * 30, sum(w[0] * 30 > 3 for w in worst), len(worst)))
