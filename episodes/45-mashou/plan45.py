"""ep45 v3 line timing on the film bed (music/build45film.py). Anchored lines start on music landmarks; the rest share
the slack between anchors in proportion to their reading need, snapped to the beat grid. Writes lines_v3.json + a table."""
import json, math, re
P, D0 = 0.56605, 0.5688
def beat_snap(t, after=None):
    if t >= 137.77: g0 = 138.342            # after the intro return the song restarts its own grid
    else: g0 = D0
    k = round((t - g0) / P); return g0 + k * P
def chars(s): return len(re.findall(r'[一-鿿]|[A-Za-z]+|\d+(?:[.,]\d+)*', re.sub(r'[\[\]]', '', s)))
def need(s, kind): return 0.5 + chars(s) / 7 + 0.6 + (0.4 if kind == 'typed' else 0)
# id, kind, text, anchor (None = float), extra hold (named picture beat)
L = [
 ('C1','typed','假如说，你是圆明园的[马首]。',0.0,0),('C2','cut','1860年，你被[抢走]，',3.399,0),('C3','cut','在伦敦，被[拍卖]，',5.663,0),('C4','cut','又被人花[6910万]买下，',7.927,0),
 ('C5','cut','又被[捐了出去]。',10.191,0),('C6','cut','2020年，你[回家]了。',12.456,0),('C7','punch','可十二个里，还有[五个]没回来。',14.720,0),
 ('A1','typed','乾隆年间，你由红铜[一次铸成]。',20.947,0),('A3','typed','你和十一个兄弟，坐在[水池两边]。',None,0),('A4','typed','每两小时，轮到谁，[谁就喷水]。',None,0),
('A6','cut','你是[午时]。',None,0),('A7','typed','正午十二点，十二个[一起喷水]。',34.53,1.8),
 ('B1','typed','1860年，英法联军[进了园子]。',None,0),('B2','typed','能搬走的都被搬走，然后[一把火]。',None,1.0),('B4','typed','你被带走了，[不知去了哪]。',48.12,0.6),
 ('D1','typed','一百多年后，你出现在[伦敦]。',None,0),('D2','typed','锤子落下，你被台湾收藏家[买走]。',None,0),('D3','typed','兄弟牛、猴、虎，也[上了拍卖台]。',None,0.8),
 ('D4','cut','锤子落下：被[买回中国]。',63.97,0),('D5','typed','港澳企业家何鸿燊，买回了[猪首]。',None,0),('D6','typed','2007年，你又要[上拍]了。',None,0),
 ('D7','cut','这一次，锤子[没有落下]。',None,0.6),('D8','typed','拍卖前，还是何鸿燊，买下了你：',75.29,0),('D9','punch','[6910万港元]。',79.815,0.2),
 ('D10','typed','比上一次，贵了[二十多倍]。',None,0),('D11','typed','巴黎，你的兄弟鼠和兔上拍，',84.344,0),('D12','cut','锤子落下：[3149万欧元]。',88.87,0),
 ('D13','cut','买家却[拒绝付款]。',None,0),('D14','typed','4年后，鼠和兔被法国一家人[送回]。',None,0),('E1','typed','2007到2019年，你在港澳[展出]。',None,0),
 ('E2','typed','2019年，何鸿燊把你[捐给国家]。',None,0),('E3','typed','2020年5月，他去世了，[98岁]。',None,0),('E4','punch','他没等到，[你回家]那天。',105.29,0),
 ('H1a','typed','2020年12月1日，',109.25,0),('H1b','stack','你回到[圆明园]。',116.04,0.4),('H2','cut','你离开了[160年]。',None,0),('H3','typed','十二个里，回到中国的有[七个]。',None,0),
 ('H4','stack','如今回到圆明园的，[只有你]。',125.10,0.3),('H5','typed','你住进园里唯一[幸存]的古建筑。',128.16,0),('H7','typed','人们发现，你的一只耳朵[卷了]。',131.64,0),
 ('H8','typed','研究的人说：你一路[被撞过]。',134.98,0),('K1','typed','正午十二点，你们本该[一起喷水]。',138.332,0),('K2','cut','还差[十一个]：六个在博物馆，',141.728,0),
 ('K4','cut','五个，至今[没回中国]。',None,0),('K5','typed','2018年，法国拍出[疑似龙首]，',146.82,0),('K5b','stack','真假，[说不清]。',149.65,0),('Q','end','如果找到了，该[花钱买回来]吗？',151.36,0),
]
END = 154.181
out = []; i = 0
anchors = [k for k, l in enumerate(L) if l[3] is not None] + [len(L)]
for a, b in zip(anchors[:-1], anchors[1:]):
    t0 = L[a][3]; t1 = L[b][3] if b < len(L) else END
    group = L[a:b]; needs = [need(l[2], l[1]) + l[4] for l in group]
    if L[a][0] == 'C7': t1 = 17.55
    if L[a][0] == 'E4': needs[0] = 1e-9  # E4 holds to the lead-in by design
    slack = (t1 - t0) - sum(needs)
    t = t0
    for l, nd in zip(group, needs):
        d = nd + (slack * nd / sum(needs) if slack > 0 else 0)
        if l[0] == 'E4': d = 109.25 - 105.29
        s = t; e = t + d
        out.append([round(s, 3), round(e, 3), l[2], l[0], l[1], round(nd if l[0] != 'E4' else 2.4, 2)]); t = e
    if slack < -0.05: print('!! over by %.2f s in group starting %s' % (-slack, L[a][0]))
# snap starts to beats (except the first and anchors); ends = next start
for k in range(1, len(out)):
    if L[k][3] is None: out[k][0] = round(beat_snap(out[k][0]), 3)
for k in range(len(out) - 1): out[k][1] = out[k + 1][0] if out[k][3] not in ('C7',) else out[k][1]
out[-1][1] = END
bad = 0
for s, e, txt, idd, kind, nd in out:
    fl = '  <<< too fast' if (e - s) < nd - 0.25 else ''
    bad += bool(fl); print(f'{idd:4} {s:7.2f}-{e:7.2f} {e - s:5.2f} (need {nd:4.2f}) {kind:5} {txt}{fl}')
json.dump([[s, e, txt] for s, e, txt, *_ in out], open('lines_v3.json', 'w'), ensure_ascii=False, indent=1)
json.dump([{'id': idd, 'a': s, 'b': e, 'text': txt, 'kind': kind} for s, e, txt, idd, kind, _ in out], open('lines_v3_meta.json', 'w'), ensure_ascii=False, indent=1)
print('too fast:', bad)
