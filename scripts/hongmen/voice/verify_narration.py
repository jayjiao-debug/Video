"""Checks on the finished narration: verify_narration.py [folder with narration_v4.wav and voice_timing_v4.json]
Line edges against the json, levels, the silences between lines, the word times, the loop joint."""
import json, sys
import numpy as np
from hmaudio import SR, HOP, cjk, strip, read_wav, env_db
V = sys.argv[1] if len(sys.argv) > 1 else "."
x = read_wav(V + "/narration_v4.wav"); j = json.load(open(V + "/voice_timing_v4.json", encoding="utf8"))
e = env_db(x); loud = np.percentile(e, 90)
print(f"track {len(x) / SR:.4f} s, {len(x) / 1470:.3f} frames; json frames {j['frames']}, speech_end {j['speech_end']}; loud level {loud:.1f} dBFS, peak {20 * np.log10(abs(x).max()):.2f}")
rows = j["lines"]; bad = 0; levels = {}
for i, r in enumerate(rows):
    a, b = r["start"], r["end"]
    seg = e[int(a / HOP):int(b / HOP)]
    act = seg[seg > np.percentile(seg, 90) - 20]
    lvl = 10 * np.log10(np.mean(10 ** (act / 10)))
    # the silence before the line and after it: the loudest 10 ms in it
    pa = rows[i - 1]["end"] if i else 0.0; nb = rows[i + 1]["start"] if i + 1 < len(rows) else len(x) / SR
    before = e[int((pa + 0.01) / HOP):int((a - 0.012) / HOP)]; after = e[int((b + 0.012) / HOP):int((nb - 0.012) / HOP)]
    # where the level first / last is above loud-32 near the stated edges
    w0 = e[int(max(0, a - 0.06) / HOP):int((a + 0.06) / HOP)]; k0 = np.nonzero(w0 > loud - 32)[0]
    w1 = e[int((b - 0.06) / HOP):int(min(len(x) / SR, b + 0.06) / HOP)]; k1 = np.nonzero(w1 > loud - 32)[0]
    ws = r["words"]; mono = all(ws[k][1] <= ws[k][2] + 1e-9 and (k == 0 or ws[k][1] >= ws[k - 1][1]) for k in range(len(ws)))
    okw = abs(ws[0][1] - a) < 0.002 and abs(ws[-1][2] - b) < 0.002 and len(ws) == cjk(r["text"]) and "".join(w[0] for w in ws) == strip(r["text"]) and mono
    mind = min(ws[k + 1][1] - ws[k][1] for k in range(len(ws) - 1))
    flag = "" if okw else "  WORDS?"
    levels[r["line"]] = lvl
    if len(before) and before.max() > loud - 30: flag += "  SOUND BEFORE?"      # line 11: the f of 范, see the note
    bad += bool(flag)
    print(f"{r['line']:2d} {r['take']:11s} f{a * 30:7.1f}-{b * 30:7.1f} level {lvl:6.1f} tempo {r['tempo']:.3f} rate {r['rate']:.2f} | silence before: {a - pa:.3f} s, loudest {before.max() if len(before) else -99:5.0f} dB | shortest char {mind * 1000:3.0f} ms{flag}")
print("flags:", bad)
# one level for every line: each line against the median of the lines (the criterion is about 2 dB)
med = float(np.median([levels[n] for n in levels if 2 <= n <= 21]))
dev = {n: levels[n] - med for n in levels}
worst = max(dev, key=lambda n: abs(dev[n]))
print(f"level: median of lines 2-21 {med:.1f} dBFS; lines 2-21 within {min(dev[n] for n in dev if 2 <= n <= 21):+.1f} .. {max(dev[n] for n in dev if 2 <= n <= 21):+.1f} dB; "
      f"line 1 {dev[1]:+.1f} dB, line 22 {dev[22]:+.1f} dB; step 21 -> 22 {levels[22] - levels[21]:+.1f} dB, across the loop 22 -> 1 {levels[1] - levels[22]:+.1f} dB; "
      f"worst line {worst} ({dev[worst]:+.1f} dB) {'OK' if abs(dev[worst]) <= 2.0 else 'OUT OF THE 2 dB BAND'}")
# what sounds before the first word of the film (the head of the track is the loop take's comma)
h = x[:int((rows[0]["start"] - 0.012) * SR)]
print(f"head: loudest sample before the first word {20 * np.log10(np.abs(h).max() + 1e-12):.1f} dBFS, loudest 10 ms {e[:int((rows[0]['start'] - 0.012) / HOP)].max():.1f} dBFS (speech {loud:.1f})")
# the holds as an ear takes them: from the last 5 ms that reaches loud - 25 dB to the first one after the hold
def rms5(a, b):
    n = int(0.005 * SR); i0 = int(a * SR)
    return [(i0 + k * n) / SR for k in range(int((b - a) / 0.005)) if 10 * np.log10(np.mean(x[i0 + k * n:i0 + (k + 1) * n] ** 2) + 1e-13) > loud - 25]
for n in (1, 9, 21):
    a, b = rows[n - 1]["end"], rows[n]["start"]
    q = rms5(a - 0.3, a + 0.02); p = rms5(b - 0.02, b + 0.2)
    print(f"hold after line {n}: json {b - a:.3f} s; from the last 5 ms above {loud - 25:.0f} dBFS to the next one {p[0] - q[-1] - 0.005:.3f} s")
# the loop joint: the end of the track followed by its head
y = np.concatenate([x[-int(1.2 * SR):], x[:int(0.8 * SR)]]); ey = env_db(y)
T = 1.2
print("loop joint (20 ms a character, | = the loop point; level 0 = under -60 dBFS .. 9 = above -15):")
row = ""
for b in range(int(len(y) / SR / 0.02)):
    if abs(b * 0.02 - T) < 1e-6: row += "|"
    seg = ey[b * 10:(b + 1) * 10]; row += str(int(min(9, max(0, (seg.max() + 60) // 5))))
print("  " + row)
# silence across the joint, by the same rule as in the take: 邦 under -50 dBFS (raw scale) .. the first lasting sound of 他
last = rows[-1]["end"] - (len(x) / SR - T); first = T + rows[0]["start"]
print(f"  last sound of line 22 at {last - T:+.3f} s, first sound of line 1 at {first - T:+.3f} s: silence across the loop point {first - last:.3f} s")
k = np.nonzero(ey[int(last / HOP) + 2:int(first / HOP) - 2] > loud - 32)[0]
print(f"  loudest level inside it {ey[int(last / HOP) + 2:int(first / HOP) - 2].max():.0f} dBFS; jump at the joint: last sample {x[-1]:+.6f}, first sample {x[0]:+.6f}")
