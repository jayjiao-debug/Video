"""ep45 v8.1, subtitles only (copied from plan45v8s.py). The owner accepted the 2023 reunion beat (F24): after the
payoff C2 「可住回圆明园的，只有它。」 the four 保利 brothers visit the horse in 正觉寺 for 12 days, then leave.
Same music cut, same rules: every line starts on a beat (half-beat grid), gets at least its reading minimum
(0.5 s + 0.23 s per character, about 4.3 字/s), and the anchors land on the music.
New in v8.1:
- Lines 30-31 (V1 「2023年，四个兄弟回来看过它，」 14 字 → 14 half-beats; V2 「只待了[12天]，又走了。」 9 字 → 10
  half-beats) take exactly 24 half-beats = 3 bars = 6.792 s. So every line after them moves by whole bars, and the
  picture hits inside those lines (b168 highlight, the R6 knock, the K1 shadow arcs, the K4 gavel) keep their place
  in the bar.
- Lines 1-29 are untouched: the title window, the hard anchors and the soft anchors 8 and 11 are as in v8.
- The Q anchor moves from line 37 / bar 52 to line 39 / bar 55 (125.978), so Q ends 130.298, the end card runs
  130.298 → 134.798 (4.5 s), the seal lands on bar 57 (130.506) and the music fades from the outro downbeat 132.77.
Writes lines_v81s.json [[start, end, text], ...] and copies the times into lines_v81.json."""
import json, math, re
BEAT, BAR0 = 60 / 106, 1.4498
BAR = 4 * BEAT
snap = lambda t, g=1: BAR0 + BEAT * g * math.ceil((t - BAR0) / (BEAT * g) - 1e-6)
n = lambda s: len(re.sub(r'[\[\]，。：、？！“”"\s]', '', s))
dmin = lambda s: 0.5 + 0.23 * n(s)   # ≈ 4.3 字/s; the ep44 reference reads 4.1 字/s over 2.6 s lines
L = [x[2] for x in json.load(open('lines_v81.json'))]
TITLE = (9.05, 11.638)   # title over the picture, no subtitle; ≤ 2.6 s (owner, v8 brief); line 4 starts on the half-beat 11.638
PRE_TITLE, POST_TITLE = 3, 4   # 1-based: the line cut at TITLE[0], the line that waits for TITLE[1]
ANCH = {13: 42.205, 19: 60.32, 23: 76.165, 26: 87.17}   # 1-based line: breakdown, build, stop, hardest drop
# soft music anchors (v8): they spread the 2.6 s that the cut Hangzhou lines leave before the breakdown, instead of
# parking it all on line 12 in the 20-40 s danger zone
ANCH.update({8: 26.356,      # re-raise 「后来回来了几个？」 on bar 11: the counter flips back to 「回来了 ?/12」 on the downbeat
             11: 35.412,     # 「锤子落下」 London strike on bar 15 (as in storyboard_v7 / p45_london.js)
             39: BAR0 + 55 * BAR})  # v8.1: Q on bar 55 (125.978; v8 bar 52 + 3 bars), end card 130.298 → 134.798, seal bar 57
CARD = 4.5
out, t, bad = [], 0.0, []
for i, s in enumerate(L, 1):
    if i == POST_TITLE: t = max(t, TITLE[1])
    a = ANCH.get(i); st = snap(t, 0.5) if i > 1 else 0.0
    if a and st > a + 1e-3: bad.append(f'line {i} wants {st:.2f} > anchor {a:.2f} (over by {st - a:.2f})')
    st = a if a else st
    if i == PRE_TITLE and st + dmin(s) > TITLE[0] + 1e-3: bad.append(f'line {i} needs {dmin(s):.2f} s but only has {TITLE[0] - st:.2f} s before the title')
    out.append([round(st, 3), dmin(s), s]); t = st + dmin(s)
lines = []
for k, (a, d, s) in enumerate(out):
    end = out[k + 1][0] if k + 1 < len(out) else a + d + 0.6
    if k + 1 == PRE_TITLE: end = TITLE[0]
    lines.append([a, round(end, 3), s])
for (a, d, s), (_, e, _) in zip(out, lines):
    if e - a < d - 1e-3: bad.append(f'"{s}" on {e - a:.2f} s < reading minimum {d:.2f} s')
json.dump(lines, open('lines_v81s.json', 'w'), ensure_ascii=False)
json.dump(lines, open('lines_v81.json', 'w'), ensure_ascii=False)
for (a, d, s), l in zip(out, lines): print(f'{a:7.3f} → {l[1]:7.3f}  min {d:4.2f} slack {l[1] - a - d:+5.2f}  {s}')
print(f'title {TITLE[0]} → {TITLE[1]} ({TITLE[1] - TITLE[0]:.2f} s on screen)')
card0 = lines[-1][1]; card1 = round(card0 + CARD, 3)
seal = BAR0 + BAR * math.ceil((card0 - BAR0) / BAR - 1e-6)
print('last line ends', card0, f'· end card +{CARD} →', card1, f'({card1 // 60:.0f}:{card1 % 60:04.1f})',
      f'· seal on bar {round((seal - BAR0) / BAR)} = {seal:.3f} (+{seal - card0:.3f} s)')
hl = sum('[' in s for s in L); print(f'highlights {hl}/{len(L)} = {100 * hl / len(L):.0f} %, longest line {max(map(n, L))} 字')
print(*bad, sep='\n') if bad else print('no anchor conflicts; every line ≥ its reading minimum')
