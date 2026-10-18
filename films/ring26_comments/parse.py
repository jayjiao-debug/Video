import json, re, difflib, csv
rows = json.load(open('rows2.json'))
TIME = re.compile(r'\s*(\d+\s*(秒|分钟|小时|天)前|刚刚|昨天\s*\d{1,2}:\d{2}|\d{1,2}-\d{1,2})\s*$')
items = []
for r in rows:
    L = r['lines']
    if not L: continue
    txt = ' '.join(L)
    if '已收起' in txt: continue
    # find the start of the action line
    k = next((i for i, l in enumerate(L) if re.match(r'^(评论了你|回复|赞了|@)', l)), None)
    if k is None: continue
    name = ' '.join(L[:k]).strip() or '(无名)'
    body = ''.join(L[k:]).strip()
    m = re.match(r'^(评论了你|回复了你的评论|回复\s*@[^:：]+|回复)\s*[:：]?\s*(.*)$', body)
    kind, text = (m.group(1), m.group(2)) if m else ('?', body)
    t = TIME.search(text); when = t.group(1) if t else ''
    if t: text = text[:t.start()]
    # a time may sit in the middle when the comment wraps: "...xx 12分钟前 rest"
    mid = re.search(r'\s(\d+\s*(分钟|小时|天)前)\s', text)
    if mid: when = when or mid.group(1); text = text[:mid.start()] + text[mid.end():]
    items.append({'name': name, 'kind': 'reply' if kind.startswith('回复') else 'comment', 'to': kind[2:].strip(' @') if kind.startswith('回复@') or kind.startswith('回复 @') else '', 'text': text.strip(), 'when': when, 'target': r['thumbDiff'] < 15, 'thumbDiff': r['thumbDiff'], 'frame': r['frame']})
norm = lambda s: re.sub(r'[\s，。！？,.!?~～…·:：]', '', s)
uniq = []
for it in items:
    key = norm(it['name'] + '|' + it['text'])
    hit = next((u for u in uniq if difflib.SequenceMatcher(None, key, u['_k']).ratio() > 0.8), None)
    if hit:
        hit['_n'] += 1
        if len(it['text']) > len(hit['text']): hit.update({k: v for k, v in it.items()}); hit['_k'] = key
    else: it['_k'] = key; it['_n'] = 1; uniq.append(it)
uniq.sort(key=lambda u: u['frame'])
tgt = [u for u in uniq if u['target']]; other = [u for u in uniq if not u['target']]
print('all unique rows', len(uniq), 'target video', len(tgt), 'other videos', len(other))
with open('comments_target.csv', 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f); w.writerow(['序号', '昵称', '类型', '回复对象', '评论内容(OCR)', '时间(录屏时)'])
    for i, u in enumerate(tgt, 1): w.writerow([i, u['name'], '评论' if u['kind'] == 'comment' else '回复', u['to'], u['text'], u['when']])
for u in tgt: print(u['when'].ljust(7), u['name'][:10].ljust(10), '|', u['text'])
print('--- other videos'); [print(u['thumbDiff'], u['name'], '|', u['text']) for u in other]
