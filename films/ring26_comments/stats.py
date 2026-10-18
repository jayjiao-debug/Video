import json, re, collections
R = json.load(open('rows.json'))
POP = {'北京':21893095,'天津':13866009,'河北':74610235,'山西':34915616,'内蒙古':24049155,'辽宁':42591407,'吉林':24073453,'黑龙江':31850088,'上海':24870895,'江苏':84748016,'浙江':64567588,'安徽':61027171,'福建':41540086,'江西':45188635,'山东':101527453,'河南':99365519,'湖北':57752557,'湖南':66444864,'广东':126012510,'广西':50126804,'海南':10081232,'重庆':32054159,'四川':83674866,'贵州':38562148,'云南':47209277,'西藏':3648100,'陕西':39528999,'甘肃':25019831,'青海':5923957,'宁夏':7202654,'新疆':25852345}
for r in R:
    p = r['prov'].strip('-·. ').replace('中国', ''); r['P'] = next((k for k in POP if p.startswith(k)), '')
    r['O'] = '' if r['P'] else p
print('N', len(R), 'with likes', sum(r['likes'] > 0 for r in R), 'total likes', sum(r['likes'] for r in R))
pc = collections.Counter(r['P'] for r in R if r['P']); print('prov top', pc.most_common(8)); print('prov bottom', pc.most_common()[-6:])
per = sorted(((c / POP[p] * 1e6, p, c) for p, c in pc.items()), reverse=True); print('per million top', [(round(a, 1), p, c) for a, p, c in per[:6]]); print('per million bottom', [(round(a, 2), p, c) for a, p, c in per[-4:]])
lk = collections.defaultdict(list)
for r in R:
    if r['P']: lk[r['P']].append(r['likes'])
avg = sorted(((sum(v) / len(v), p, len(v), max(v)) for p, v in lk.items()), reverse=True); print('avg likes top', [(round(a, 2), p, n, mx) for a, p, n, mx in avg[:6]])
oc = collections.Counter(r['O'] for r in R if r['O']); print('non-prov', oc.most_common(25))
T = [r['text'] for r in R]
cnt = lambda pat: sum(len(re.findall(pat, re.sub(r'@\S+', '', t))) for t in T)
print('妈 chars', cnt('妈'), '爸', cnt('爸'), '领导', cnt('领导'), '老师/班主任', cnt('老师|班主任'), '对象', cnt('对象|男朋友|女朋友|老公|老婆'), '诈骗/骚扰', cnt('诈骗|骚扰|推销'), '外卖', cnt('外卖|快递'))
print('comments mentioning 妈', sum(1 for t in T if '妈' in re.sub(r'@\S+', '', t)), '爸', sum(1 for t in T if '爸' in re.sub(r'@\S+', '', t)))
print('tags total', sum(r['tags'] for r in R), 'comments with tags', sum(1 for r in R if r['tags']), 'tag-only', sum(1 for r in R if r['tags'] and not re.sub(r'@\S+|\s', '', r['text'])))
print('top tags', [(r['tags'], r['name'], r['crop']) for r in sorted(R, key=lambda r: -r['tags'])[:5]])
print('top likes', [(r['likes'], r['name'], r['text'][:24], r['crop']) for r in sorted(R, key=lambda r: -r['likes'])[:12]])
print('empty text', sum(1 for r in R if not r['text'].strip()))
# beijing hour from 昨天hh:mm (phone SAST = Beijing-6)
hr = collections.Counter()
for r in R:
    m = re.match(r'昨天(\d{1,2}):', r['when'])
    if m: hr[(int(m.group(1)) + 6) % 24] += 1
print('beijing hours (昨天 only)', sorted(hr.items()))
