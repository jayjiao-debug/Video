"""Extra merge: identical/near-identical text (or both empty) in the same province AND visually matching crops."""
import json, collections, difflib
import numpy as np
from PIL import Image
G = json.load(open('groups.json'))
def thumb(m):
    im = Image.open(m['frame']).convert('L'); im = im.crop((0, m['top'], min(im.width, 420), m['bot'])) if m['bot'] < im.height or m['top'] else im.crop((0, 0, min(im.width, 420), im.height))
    return np.asarray(im.resize((42, 40))).astype(float), im.height
info = []
for g in G:
    m = max(g['members'], key=lambda m: (m['src'] == 'new', m['sharp']))
    t = max((x['nt'] for x in g['members']), key=len); p = collections.Counter(x['prov'] for x in g['members']).most_common(1)[0][0]
    info.append((t, p, m))
parent = list(range(len(G)))
def find(i):
    while parent[i] != i: parent[i] = parent[parent[i]]; i = parent[i]
    return i
cand = collections.defaultdict(list)
for i, (t, p, m) in enumerate(info): cand[(p, t if len(t) < 12 else t[:12])].append(i)
TH = {}
merged = 0
for k, ids in cand.items():
    if len(ids) < 2: continue
    for a in range(len(ids)):
        for b in range(a + 1, len(ids)):
            i, j = ids[a], ids[b]
            if find(i) == find(j): continue
            ti, tj = info[i][0], info[j][0]
            if ti != tj and difflib.SequenceMatcher(None, ti, tj).ratio() < 0.9: continue
            if len(ti) >= 10 and ti == tj: parent[find(j)] = find(i); merged += 1; continue
            for x in (i, j):
                if x not in TH: TH[x] = thumb(info[x][2])
            (A, ha), (B, hb) = TH[i], TH[j]
            if abs(ha - hb) > 25: continue
            if np.abs(A - B).mean() < 9: parent[find(j)] = find(i); merged += 1
out = collections.defaultdict(lambda: {'members': []})
for i, g in enumerate(G): out[find(i)]['members'] += g['members']
G2 = list(out.values()); print('merged', merged, '->', len(G2))
json.dump(G2, open('groups.json', 'w'), ensure_ascii=False)
