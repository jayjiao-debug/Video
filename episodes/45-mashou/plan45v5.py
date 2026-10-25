"""ep45 rebuild: lay the v5.1 lines onto the one-cut bed (bgm_cut45.wav: track bars 26-57 removed, 32 bars; film bar j = track bar j for j < 26, j+32 after).
Each line starts on a beat; anchors pin lines to music landmarks; every line gets at least its reading minimum.
Writes lines_bars.json [[start, end, text], ...] (film time)."""
import json, math, re
BEAT, BAR, BAR0 = 60 / 106, 4 * 60 / 106, 1.4498
bar = lambda k: BAR0 + BAR * k
beatT = lambda k: BAR0 + BEAT * k                      # beat k (k = 4·bar)
snap = lambda t: beatT(math.ceil((t - BAR0) / BEAT - 1e-6))
# film landmarks (bar index in film time)
TITLE = (9.05, 11.32)          # drop 1 is audible at 9.05; the title card holds one bar
REWIND = (None, 1.13)          # the rewind before A1 lasts half a bar
ANCH = {'D9b': bar(40), 'E2a': bar(47) - BAR / 2, 'H1b': 118.87, 'K1a': None}   # breakdown 73.90 · build 92.02 · stop 107.87 (lamp out) · hardest drop audible 118.87
# lines and reading minimums from script.md v5.1 (top section)
s = open('script.md').read().split('# Script v4')[0]
rows = []
for r in s.splitlines():
    c = [x.strip() for x in r.strip('|').split('|')]
    if len(c) > 4 and re.match(r'^[A-Z]\w*$', c[0]):
        try: rows.append((c[0], float(c[3])))
        except ValueError: pass
texts = [l[2] for l in json.load(open('lines_v5.json'))]
assert len(rows) == len(texts), (len(rows), len(texts))
out, t = [], 0.0
for (lid, dmin), text in zip(rows, texts):
    if lid == 'T1': t = max(t, TITLE[1])
    if lid == 'A1': t = snap(t + REWIND[1])
    a = ANCH.get(lid)
    start = max(snap(t), a) if a else snap(t)
    out.append([lid, round(start, 3), dmin, text]); t = start + dmin
# ends: each line runs to the next line's start (lines in a block stay up, as in ep43); last line holds to the end card
lines = []
for i, (lid, a, d, text) in enumerate(out):
    z = out[i + 1][1] if i + 1 < len(out) else a + d + 1.5
    lines.append([a, round(z, 3), text])
json.dump(lines, open('lines_bars.json', 'w'), ensure_ascii=False)
for (lid, a, d, text), l in zip(out, lines): print(f'{lid:5s} {a:7.2f} → {l[1]:7.2f}  (min {d:4.2f}, slack {l[1]-a-d:+5.2f})  {text}')
print('Q ends', lines[-1][1], '· music ends 179.75 · bed 181.7')
