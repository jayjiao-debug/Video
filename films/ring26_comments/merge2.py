import json, re, difflib, collections
G = json.load(open('groups.json'))
norm = lambda s: re.sub(r'[\s，。！？,.!?~～…·:：、"“”\'()（）\-]', '', s)
def rep(g):
    t = max((norm(m['text']) for m in g['members']), key=len); n = max((norm(m['name']) for m in g['members']), key=len)
    p = collections.Counter(m['prov'].lstrip('-') for m in g['members']).most_common(1)[0][0]; return t, n, p
R = [rep(g) for g in G]
parent = list(range(len(G)))
def find(i):
    while parent[i] != i: parent[i] = parent[parent[i]]; i = parent[i]
    return i
byp = collections.defaultdict(list)
for i, (t, n, p) in enumerate(R): byp[p].append(i)
merged = 0
for p, ids in byp.items():
    for a in range(len(ids)):
        for b in range(a + 1, len(ids)):
            i, j = ids[a], ids[b]; ti, ni, _ = R[i]; tj, nj, _ = R[j]
            ns = difflib.SequenceMatcher(None, ni, nj).ratio() if ni and nj else 0
            ts = difflib.SequenceMatcher(None, ti, tj).ratio() if ti and tj else (1.0 if not ti and not tj else 0)
            if (ns >= 0.75 and ts >= 0.7) or (ts >= 0.9 and len(ti) >= 8):
                ri, rj = find(i), find(j)
                if ri != rj: parent[rj] = ri; merged += 1
out = collections.defaultdict(lambda: {'members': []})
for i, g in enumerate(G): out[find(i)]['members'] += g['members']
G2 = list(out.values())
print('merged', merged, '->', len(G2), 'unique')
json.dump(G2, open('groups.json', 'w'), ensure_ascii=False)
