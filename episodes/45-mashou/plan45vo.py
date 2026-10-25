"""ep45 with voice-over: re-time the v5.1 lines on the measured narration clips (voice Sage, eleven_v4, run ep45-vo-02).
Same rules as plan45v5.py: each line starts on a beat, anchors pin lines to the music, every line gets at least its
reading minimum; now also at least its clip length + GAP, so the voice never runs into the next line.
Needs vo/durs.json {"01": seconds, ...} (clip lengths with leading/trailing silence trimmed; written by mix45vo.py --measure).
Writes lines_vo.json [[start, end, text], ...] and vo/starts.json {"01": film time the clip starts, ...}."""
import json, math, re
BEAT, BAR, BAR0 = 60 / 106, 4 * 60 / 106, 1.4498
bar = lambda k: BAR0 + BAR * k
beatT = lambda k: BAR0 + BEAT * k
snap = lambda t: beatT(math.ceil((t - BAR0) / BEAT - 1e-6))
snaph = lambda t: BAR0 + BEAT / 2 * math.ceil((t - BAR0) / (BEAT / 2) - 1e-6)   # half-beat grid, used only where a block is too tight for whole beats
TITLE = (9.05, 11.32)
REWIND = (None, 1.13)
ANCH = {'D9b': bar(40), 'E2a': 107.865, 'H1b': 118.87}   # hard anchors: build, the stop (lamp out), the hardest drop
LEAD = 0.06      # the voice starts just after the subtitle appears
HOLD = 0.7       # how long a line may stay up after its voice ends when the reading minimum asks for more
GAP = 0.30       # breath after the clip before the next line may start
s = open('script.md').read().split('# Script v4')[0]
rows = []
for r in s.splitlines():
    c = [x.strip() for x in r.strip('|').split('|')]
    if len(c) > 4 and re.match(r'^[A-Z]\w*$', c[0]):
        try: rows.append((c[0], float(c[3])))
        except ValueError: pass
texts = [l[2] for l in json.load(open('lines_v5.json'))]
durs = json.load(open('vo/durs.json'))
assert len(rows) == len(texts) == len(durs)
TIGHT = set(json.load(open('vo/tight.json'))) if __import__('os').path.exists('vo/tight.json') else set()
out, t, bad = [], 0.0, []
for i, ((lid, dmin), text) in enumerate(zip(rows, texts)):
    v = durs[f'{i + 1:02d}']
    d = max(LEAD + v + GAP, min(dmin, LEAD + v + HOLD))   # with the voice, the reading minimum is capped at the clip + HOLD
    if lid == 'T1': t = max(t, TITLE[1])
    if lid == 'A1': t = snap(t + REWIND[1])
    a = ANCH.get(lid)
    st = snaph(t) if lid in TIGHT else snap(t)
    if a and st > a + 1e-3: bad.append(f'{lid} wants {st:.2f} > anchor {a:.2f}')
    start = a if a else st
    out.append([lid, round(start, 3), d, text]); t = start + d
lines = []
for i, (lid, a, d, text) in enumerate(out):
    z = out[i + 1][1] if i + 1 < len(out) else a + d + 1.5
    lines.append([a, round(z, 3), text])
json.dump(lines, open('lines_vo.json', 'w'), ensure_ascii=False)
json.dump({f'{i + 1:02d}': round(a + LEAD, 3) for i, (lid, a, d, text) in enumerate(out)}, open('vo/starts.json', 'w'))
old = json.load(open('lines_bars.json'))
for i, ((lid, a, d, text), l) in enumerate(zip(out, lines)):
    v = durs[f'{i + 1:02d}']
    print(f'{lid:5s} {a:7.2f} → {l[1]:7.2f}  (was {old[i][0]:7.2f}, {a - old[i][0]:+5.2f})  vo {v:4.2f} slack {l[1] - a - LEAD - v:+5.2f}  {text}')
print('Q ends', lines[-1][1], '· music ends 179.75')
print('ANCHOR CONFLICTS:' if bad else 'anchors ok', *bad, sep='\n  ')
