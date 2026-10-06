"""Place the VO lines on the film clock (music map), write timeline.json."""
import json, soundfile as sf
vo = json.load(open('vo.json'))
dur = {v['id']: len(sf.read(f'vo/{v["id"]}.wav')[0]) / 24000 for v in vo}
BAR = 2.0325
DROP1, A_END, DROP2 = 14.24, 30.50, 30.50 + (81.39 - 49.12)
G = 0.30
def run(ids, start, gaps=None):
    out, t = [], start
    for k, i in enumerate(ids):
        out.append((i, t, t + dur[i])); t += dur[i] + (gaps[k] if gaps else G)
    return out, t
sec = {}
for v in vo: sec.setdefault(v['section'], []).append(v['id'])
P = []
# hook from 0.12; question line held (h4) — must end before the drop
p, t = run(sec['hook'], 0.12, [0.32, 0.34, 0.36, 0]); P += p; assert t < 13.9, t
p, t = run(sec['setup'], 16.68, [0.26, 0.28, 0.28, 0.30, 0]); P += p; assert t < 30.4, t
# break: quieter, more air
p, t = run(sec['break'], 31.0, [0.95, 0.95, 0.95, 0]); P += p; assert t < 46.6, t
# build: u4 (the question) ends at 62.25
ids = sec['build']; tot = sum(dur[i] for i in ids)
gp = 0.52
start = 62.25 - tot - (len(ids) - 1) * gp
p, t = run(ids, start, [gp] * (len(ids) - 1) + [0]); P += p; assert start > 46.7, start
# reveal: 不是。 on the second drop
ids = sec['reveal']
gaps = {'r1': 0.55, 'r3': 0.36, 'r5': 0.4, 'r8': 0.6, 'r9': 0.36, 'r10': 0.5, 'r14': 0.4, 'r16': 0.32, 'r16b': 0.75}
p, t = run(ids, DROP2 - 0.02, [gaps.get(i, 0.30) for i in ids]); P += p
p, t = run(sec['end'], t + 0.35, [0.25, 0]); P += p
vo_end = t
# end card ~0.7 s after the last line; film ends on a bar of segment B, ≥ 5 s of end card
card = vo_end + 0.7
k = 0
while 30.50 + k * BAR < card + 5.0: k += 1
L = 30.50 + k * BAR
lines = []
byid = {v['id']: v for v in vo}
for i, a, b in P:
    v = byid[i]
    lines.append({'id': i, 'section': v['section'], 'from': round(a, 3), 'to': round(b, 3), 'vo': v['vo'], 'sub': v['sub'], 'screen': v.get('screen', [])})
tl = {'fps': 30, 'length': round(L, 3), 'frames': int(round(L * 30)), 'drop1': DROP1, 'drop2': round(DROP2, 3), 'breakAt': A_END,
      'buildAt': round(A_END + (65.2 - 49.12), 3), 'endCard': round(card, 3), 'bar': BAR,
      'music': {'segA': [81.39 - DROP1, 81.39 - DROP1 + A_END], 'segB': [49.12, 49.12 + L - A_END]}, 'lines': lines}
json.dump(tl, open('timeline.json', 'w'), ensure_ascii=False, indent=1)
for l in lines: print(f"{l['id']:>4} {l['from']:7.2f} {l['to']:7.2f}  {l['vo']}")
print('VO ends', round(vo_end, 2), 'end card', round(card, 2), 'film', round(L, 2), 'frames', tl['frames'], 'drop2', round(DROP2, 2))
