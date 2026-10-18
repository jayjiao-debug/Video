"""Merge the slow-scroll segments with the earlier 3226 comments, dedupe, and export one best crop per comment."""
import json, re, difflib, collections, os, shutil
import numpy as np
from PIL import Image
OLD = '../cm2'
new = json.load(open('segs.json'))
for s in new: s['src'] = 'new'
old = []
for r in json.load(open(f'{OLD}/rows.json')):
    p = f'{OLD}/crops/{r["crop"]}'
    old.append({'frame': p, 'top': 0, 'bot': r['height'], 'name': r['name'], 'text': r['text'], 'when': r['when'], 'prov': r['prov'], 'likes': str(r['likes'] or ''), 'sharp': 0, 'h': r['height'], 'src': 'old'})
BADGE = r'(互相关注|作者赞过|作者回复过|作者|粉丝|首评|置顶|朋友|已关注|关注)'
norm = lambda s: re.sub(r'[\s，。！？,.!?~～…·:：、"“”\'()（）\-]', '', s)
segs = new + old
for s in segs:
    s['name'] = re.sub(BADGE, '', s['name']).strip(); s['text'] = re.sub(r'^' + BADGE + r'\s*', '', s['text']).strip()
    s['prov'] = s['prov'].strip('-·. '); s['when'] = s['when'].replace('：', ':').replace(' ', '')
    s['nt'], s['nn'] = norm(s['text']), norm(s['name'])
# pass 1: within the new session, bucket by when+prov (times are consistent inside one session)
groups = []; idx = collections.defaultdict(list)
def sim(a, b):
    if a['nt'] and b['nt']: return difflib.SequenceMatcher(None, a['nt'], b['nt']).ratio()
    return 1.0 if a['nn'] and a['nn'] == b['nn'] else 0
for s in segs:
    key = s['src'] + '|' + s['when'] + '|' + s['prov']; best = None
    for g in idx[key]:
        r = max(sim(s, m) for m in g['members'][:6])
        if s['nn'] and g['nn'] and s['nn'] != g['nn'] and difflib.SequenceMatcher(None, s['nn'], g['nn']).ratio() < 0.5: r *= 0.6
        if r > 0.8 and (best is None or r > best[0]): best = (r, g)
    if best: best[1]['members'].append(s); best[1]['nn'] = best[1]['nn'] or s['nn']
    else: g = {'members': [s], 'nn': s['nn']}; groups.append(g); idx[key].append(g)
print('pass1', len(segs), '->', len(groups))
# pass 2: across sessions, block by province, match on text + name
def rep(g):
    t = max((m['nt'] for m in g['members']), key=len); n = max((m['nn'] for m in g['members']), key=len)
    p = collections.Counter(m['prov'] for m in g['members']).most_common(1)[0][0]; return t, n, p
R = [rep(g) for g in groups]; parent = list(range(len(groups)))
def find(i):
    while parent[i] != i: parent[i] = parent[parent[i]]; i = parent[i]
    return i
byp = collections.defaultdict(list)
for i, (t, n, p) in enumerate(R): byp[p].append(i)
for p, ids in byp.items():
    for a in range(len(ids)):
        ti, ni, _ = R[ids[a]]
        for b in range(a + 1, len(ids)):
            tj, nj, _ = R[ids[b]]
            if abs(len(ti) - len(tj)) > max(6, 0.4 * max(len(ti), len(tj))): continue
            ns = difflib.SequenceMatcher(None, ni, nj).ratio() if ni and nj else 0
            ts = difflib.SequenceMatcher(None, ti, tj).ratio() if ti and tj else (1.0 if not ti and not tj else 0)
            if (ns >= 0.75 and ts >= 0.7) or (ts >= 0.92 and len(ti) >= 8 and (ns >= 0.5 or not ni or not nj)):
                x, y = find(ids[a]), find(ids[b])
                if x != y: parent[y] = x
out = collections.defaultdict(lambda: {'members': []})
for i, g in enumerate(groups): out[find(i)]['members'] += g['members']
G = list(out.values())
print('pass2 ->', len(G), 'unique comments')
print('sources', collections.Counter(''.join(sorted({m['src'] for m in g['members']})) for g in G))
json.dump(G, open('groups.json', 'w'), ensure_ascii=False)
