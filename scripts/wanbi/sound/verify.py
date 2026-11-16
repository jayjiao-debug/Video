#!/usr/bin/env python3
"""verify.py <mix.wav> <narration.wav> <beats.json> [voice_timing.json]: the finished Wanbi mix against the rules. A copy of
scripts/kit/sound/verify.py for a film that does NOT loop: the loop-joint checks are replaced by the two ends.
Length to the sample (the narration's own rate and length = the film's frames) and the 48 kHz copy's length (1600
samples a frame), loudness and true peak (both files), the stems add up to the mix, the narration inside the mix is
the narration (one gain + the limiters' smooth gain: no sample moved), the start (no click on the first sample) and
the end (silence on the last sample, the fade after the last word), and where the film has no bed at all."""
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
base = mix_p[:-4]
m48 = probe(base + "_48k.wav"); w48 = B["total"] * 48000 // B["fps"]
say(int(m48["sample_rate"]) == 48000 and m48["duration_ts"] == w48, f"48 kHz copy (the file to mux): {m48['duration_ts']} samples at {m48['sample_rate']} Hz = {m48['duration_ts'] / 1600:g} frames (film {B['total']} = {w48} samples)")
I, tp = loud(mix_p); I48, tp48 = loud(base + "_48k.wav")
say(tp <= -1.0 and tp48 <= -1.0, f"true peak {tp:.1f} dBFS, 48 kHz copy {tp48:.1f} dBFS (must be at most -1)")
say(-15.5 < I < -13.5, f"loudness {I:.1f} LUFS as this mono file (48 kHz copy {I48:.1f}) = {I + 3:.1f} LUFS as the stereo file a player makes of it (target -14.5 mono, as Hongmen and Arthur)")
x = load(mix_p)
st = [load(base + k + ".wav") for k in ("_narr", "_sfx", "_beds")]
say(db(np.abs(x - sum(st)).max()) < -100, f"the three stems add up to the mix (largest difference {db(np.abs(x - sum(st)).max()):.0f} dBFS)")
# the narration stem is the narration times a smooth positive gain: the ratio of the two, where the voice is loud, moves slowly
x0 = load(narr_p); a = np.abs(x0) > 10 ** (-30 / 20); r = st[0][a] / x0[a]
say(r.min() > 0 and db(r.max() / r.min()) < 12, f"narration in the mix = the narration x a gain between {db(r.min()):+.1f} and {db(r.max()):+.1f} dB (one gain + two look-ahead limiters; same samples, same places)")
# the two ends (the film does not loop)
N = len(x); w = int(0.005 * sr); near = np.abs(np.diff(x[: int(0.05 * sr)]))
say(abs(x[0]) < 10 ** (-60 / 20) and np.abs(np.diff(x[:w])).max() <= max(np.percentile(near, 99.5), 10 ** (-70 / 20)) * 1.5, f"the start: first sample {db(abs(x[0])):.0f} dBFS, the largest sample step in the first 5 ms {db(np.abs(np.diff(x[:w])).max()):.0f} dBFS (in the first 50 ms {db(near.max()):.0f}): no click")
tail20 = db(np.sqrt((x[-int(0.02 * sr):] ** 2).mean()))
last_word = max(l["end"] for l in (json.load(open(sys.argv[4], encoding="utf8"))["lines"] if len(sys.argv) > 4 else B["lines"])); env = np.abs(x)
k = N - 1
while k > 0 and env[k] < 10 ** (-80 / 20): k -= 1
say(abs(x[-1]) < 10 ** (-80 / 20) and tail20 < -45, f"the end: last sample {db(abs(x[-1])):.0f} dBFS, the last 20 ms at {tail20:.1f} dBFS (the tail fades to silence: nothing is cut off loud); the last word ends at {last_word:.3f} s, the film at {N / sr:.3f} s")
lv = lambda s_, e_: db(np.sqrt((x[int(s_ * sr): int(e_ * sr)] ** 2).mean()))
print(f"        the last second in 100 ms steps (dBFS): " + " ".join(f"{lv(N / sr - 1 + i / 10, N / sr - 0.9 + i / 10):.0f}" for i in range(10)))
# where the film has no bed at all (digital silence in the bed stem for more than half a second)
bd = st[2]; fr = sr // B["fps"]; q = np.abs(bd[: (N // fr) * fr]).reshape(-1, fr).max(1) < 1e-6; gaps = []; i = 0
while i < len(q):
    if q[i]:
        j = i
        while j < len(q) and q[j]: j += 1
        if j - i > B["fps"] // 2: gaps.append((i, j))
        i = j
    else: i += 1
shot_of = lambda f: [s_["id"] for s_ in B["shots"] if s_["from"] <= f <= s_["to"]][0]
print("        no bed at all: " + ("nowhere" if not gaps else "; ".join(f"frames {a_}-{b_ - 1} ({(b_ - a_) / B['fps']:.1f} s, shots {shot_of(a_)}..{shot_of(b_ - 1)})" for a_, b_ in gaps)))
print("verify: " + ("all checks passed" if ok else "SOMETHING FAILED"))
sys.exit(0 if ok else 1)
