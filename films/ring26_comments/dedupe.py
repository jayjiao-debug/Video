import json, re, difflib, collections
segs = json.load(open('segs.json'))
BADGE = r'(互相关注|作者赞过|作者回复过|作者|粉丝|首评|置顶|朋友|已关注|关注)'
norm = lambda s: re.sub(r'[\s，。！？,.!?~～…·:：、"“”\'()（）]', '', s)
for s in segs:
    s['name'] = re.sub(BADGE, '', s['name']).strip(); s['text'] = re.sub(r'^' + BADGE + r'\s*', '', s['text']).strip()
    if not s['name'] and s['text'] and re.fullmatch(BADGE, s['text']): s['text'] = ''
    s['when'] = s['when'].replace('：', ':').replace(' ', ''); s['vid'] = s['frame'].split('/')[-1][:2]
groups = []; idx = collections.defaultdict(list)
def sim(a, b):
    if a['nt'] and b['nt']: return difflib.SequenceMatcher(None, a['nt'], b['nt']).ratio()
    return 1.0 if a['nn'] and a['nn'] == b['nn'] else 0
for s in segs:
    s['nt'] = norm(s['text']); s['nn'] = norm(s['name'])
    bucket = idx[s['when'] + '|' + s['prov']]; best = None
    for g in bucket:
        r = max(sim(s, m) for m in g['members'][:6])
        if s['nn'] and g['nn'] and s['nn'] != g['nn'] and difflib.SequenceMatcher(None, s['nn'], g['nn']).ratio() < 0.5: r *= 0.6
        if r > 0.8 and (best is None or r > best[0]): best = (r, g)
    if best: best[1]['members'].append(s); best[1]['nn'] = best[1]['nn'] or s['nn']
    else: g = {'members': [s], 'nn': s['nn']}; groups.append(g); bucket.append(g)
print(len(segs), 'segments ->', len(groups), 'unique')
print(sorted(collections.Counter(len(g['members']) for g in groups).items())[:8])
vids = collections.Counter(tuple(sorted({m['vid'] for m in g['members']})) for g in groups); print(vids)
json.dump(groups, open('groups.json', 'w'), ensure_ascii=False)
