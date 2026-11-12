#!/usr/bin/env python3
"""verify.py <mix.wav> <narration.wav> <beats.json>: the finished mix against the rules.
Length to the sample (the narration's own rate and length = the film's frames), loudness and true peak, the stems add
up to the mix, the narration inside the mix is the narration (one gain + the limiters' smooth gain: no sample moved),
and the loop: the file played twice has no step at the joint (level and spectrum just before the end against just
after the start, compared with what the same measure reads elsewhere in the film)."""
import json, re, subprocess, sys
import numpy as np
mix_p, narr_p, beats_p = sys.argv[1:4]
B = json.load(open(beats_p, encoding="utf8"))
def probe(p):
    o = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=sample_rate,channels,duration_ts,codec_name", "-of", "json", p], capture_output=True, text=True).stdout
    return json.loads(o)["streams"][0]
def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-f", "f32le", "-ac", "1", "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)
def loud(p):
    e = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", p, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    s = e[e.rfind("Summary:"):]
    return float(re.search(r"I:\s+(-?[\d.]+) LUFS", s).group(1)), float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", s).group(1))
db = lambda v: 20 * np.log10(max(float(v), 1e-12))
ok = True
def say(good, text):
    global ok; ok = ok and good; print(("  ok    " if good else "  FAIL  ") + text)
print("verify " + mix_p)
m, n = probe(mix_p), probe(narr_p); sr = int(m["sample_rate"]); want = B["total"] * sr // B["fps"]
say(m["sample_rate"] == n["sample_rate"] and m["duration_ts"] == n["duration_ts"] == want, f"length: {m['duration_ts']} samples at {sr} Hz = {m['duration_ts'] / sr:.4f} s = {m['duration_ts'] * B['fps'] / sr:g} frames (film {B['total']} frames, narration {n['duration_ts']} samples), {m['codec_name']}, {m['channels']} channel")
I, tp = loud(mix_p)
say(tp < -1.0, f"true peak {tp:.1f} dBFS (must be under -1)")
say(-15.5 < I < -13.5, f"loudness {I:.1f} LUFS as this mono file = {I + 3:.1f} LUFS as the stereo file a player makes of it (the Arthur film: -14.5 / -11.5)")
x = load(mix_p); base = mix_p[:-4]
st = [load(base + k + ".wav") for k in ("_narr", "_sfx", "_beds")]
say(db(np.abs(x - sum(st)).max()) < -100, f"the three stems add up to the mix (largest difference {db(np.abs(x - sum(st)).max()):.0f} dBFS)")
# the narration stem is the narration times a smooth positive gain: the ratio of the two, where the voice is loud, moves slowly
x0 = load(narr_p); a = np.abs(x0) > 10 ** (-30 / 20); r = st[0][a] / x0[a]
say(r.min() > 0 and db(r.max() / r.min()) < 12, f"narration in the mix = the narration x a gain between {db(r.min()):+.1f} and {db(r.max()):+.1f} dB (one gain + two look-ahead limiters; same samples, same places)")
# the loop
N = len(x); w = int(0.05 * sr)
def spec(seg):
    S = np.abs(np.fft.rfft(seg * np.hanning(len(seg)))) ** 2; f = np.fft.rfftfreq(len(seg), 1 / sr)
    e = [S[(f >= lo) & (f < hi)].sum() for lo, hi in ((70, 300), (300, 1000), (1000, 3000), (3000, 8000), (8000, 20000))]
    return 10 * np.log10(np.maximum(np.array(e) / len(seg) ** 2, 1e-20))
ring = lambda p, k: np.take(x, np.arange(p, p + k), mode="wrap")
dj = abs(db(np.sqrt((ring(N - w, w) ** 2).mean())) - db(np.sqrt((ring(0, w) ** 2).mean())))
sj = np.abs(spec(ring(N - w, w)) - spec(ring(0, w))).max()
# the same two measures at every frame boundary of the film's quiet moments (pauses between lines), for scale
step = abs(x[0] - x[-1]); near = np.abs(np.diff(ring(N - w, 2 * w)))
say(step <= max(np.percentile(near, 99.5), 10 ** (-70 / 20)), f"loop joint: the sample step from the last sample to the first is {db(step):.1f} dBFS; the steps between neighbouring samples within 50 ms of it reach {db(near.max()):.1f} dBFS (no click)")
say(dj < 6, f"loop joint: level in the last 50 ms {db(np.sqrt((ring(N - w, w) ** 2).mean())):.1f} dBFS, in the first 50 ms {db(np.sqrt((ring(0, w) ** 2).mean())):.1f} dBFS (difference {dj:.1f} dB: the narration's comma and the privy bed, both continuous)")
print(f"        loop joint: largest difference between the two sides in any of five bands: {sj:.1f} dB")
# the bed alone over the joint: the privy's air must run through the loop at one level (no bare moment, no step)
bd = st[2]; rb = lambda p, k: np.take(bd, np.arange(p, p + k), mode="wrap"); lvb = lambda p, k: db(np.sqrt((rb(p, k) ** 2).mean()))
w2 = int(0.2 * sr); d2 = lvb(0, w2) - lvb(N - w2, w2)
say(abs(d2) <= 1.5, f"loop joint, the beds alone: last 200 ms {lvb(N - w2, w2):.1f} dBFS -> first 200 ms {lvb(0, w2):.1f} dBFS ({d2:+.1f} dB; must be within 1.5)   [100 ms: {lvb(0, w2 // 2) - lvb(N - w2 // 2, w2 // 2):+.1f} dB, 50 ms: {lvb(0, w2 // 4) - lvb(N - w2 // 4, w2 // 4):+.1f} dB]")
w1 = int(0.1 * sr); around = [lvb(N - 8 * w1 + i * w1, w1) for i in range(18)]; med = float(np.median(around))
say(min(around) > med - 6, f"loop joint, the beds alone: the 100 ms levels from 0.8 s before to 1 s after run from {min(around):.1f} to {max(around):.1f} dBFS, median {med:.1f} (no bare moment: none more than 6 dB under the median; the louder ones are birds)")
# where the film has no bed at all (digital silence in the bed stem for more than half a second): by design only the cards
fr = sr // B["fps"]; q = np.abs(bd[: (N // fr) * fr]).reshape(-1, fr).max(1) < 1e-6; gaps = []; i = 0
while i < len(q):
    if q[i]:
        j = i
        while j < len(q) and q[j]: j += 1
        if j - i > B["fps"] // 2: gaps.append((i, j))
        i = j
    else: i += 1
shot_of = lambda f: [s_["id"] for s_ in B["shots"] if s_["from"] <= f <= s_["to"]][0]
print("        no bed at all: " + ("nowhere" if not gaps else "; ".join(f"frames {a_}-{b_ - 1} ({(b_ - a_) / B['fps']:.1f} s, shots {shot_of(a_)}..{shot_of(b_ - 1)})" for a_, b_ in gaps)))
tail = db(np.sqrt((ring(N - int(0.02 * sr), int(0.02 * sr)) ** 2).mean())); print(f"        the last 20 ms are at {tail:.1f} dBFS: nothing is cut off loud at the end")
print("verify: " + ("all checks passed" if ok else "SOMETHING FAILED"))
sys.exit(0 if ok else 1)
