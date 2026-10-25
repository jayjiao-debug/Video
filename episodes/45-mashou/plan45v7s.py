"""ep45 v7, subtitles only (owner 2026-10-25 20:28: 「我们不要配音了」).
Re-times lines_v7.json onto the v6 music cut (bars 7-52 removed): every line starts on a beat (half-beat where tight),
gets at least its reading minimum (0.5 s + 0.23 s per character, about 4.3 字/s), and the anchors land on the music.
Writes lines_v7s.json [[start, end, text], ...]."""
import json, math, re
BEAT, BAR0 = 60 / 106, 1.4498
snap = lambda t, g=1: BAR0 + BEAT * g * math.ceil((t - BAR0) / (BEAT * g) - 1e-6)
n = lambda s: len(re.sub(r'[\[\]，。：、？！“”"\s]', '', s))
dmin = lambda s: 0.5 + 0.23 * n(s)   # ≈ 4.3 字/s; the ep44 reference reads 4.1 字/s over 2.6 s lines
L = [x[2] for x in json.load(open('lines_v7.json'))]
TITLE = (9.05, 11.32)
ANCH = {14: 42.205, 20: 60.32, 24: 76.165, 27: 87.17}   # 1-based line: breakdown, build, stop, hardest drop
out, t, bad = [], 0.0, []
for i, s in enumerate(L, 1):
    if i == 4: t = max(t, TITLE[1])
    a = ANCH.get(i); st = snap(t, 0.5) if i > 1 else 0.0
    if a and st > a + 1e-3: bad.append(f'line {i} wants {st:.2f} > anchor {a:.2f} (over by {st - a:.2f})')
    st = a if a else st
    out.append([round(st, 3), dmin(s), s]); t = st + dmin(s)
lines = [[a, round(out[k + 1][0] if k + 1 < len(out) else a + d + 0.6, 3), s] for k, (a, d, s) in enumerate(out)]
json.dump(lines, open('lines_v7s.json', 'w'), ensure_ascii=False)
for (a, d, s), l in zip(out, lines): print(f'{a:7.2f} → {l[1]:7.2f}  min {d:4.2f} slack {l[1] - a - d:+5.2f}  {s}')
print('last line ends', lines[-1][1], '· end card +4.5 →', round(lines[-1][1] + 4.5, 2)); print(*bad, sep='\n')
