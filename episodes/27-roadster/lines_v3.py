# ep27 v3 (~1:30, starts on the track) subtitle lines. (start, text, end or None = next start − 0.1)
import json
B = json.load(open('music/beats.json'))['beats']
snap = lambda t: min(B, key=lambda b: abs(b - t))
L = [
 (0.12, '特斯拉新车，开上天花板', None), (2.67, '它为什么不掉下来？', 5.0),
 (7.73, '车底，藏着一台大风扇', None), (10.56, '把车底的空气往外抽', None), (13.17, '外面的空气把它按在顶上', None),
 (15.79, '外面推约[40吨]，车才2吨', None), (18.39, '车底只要比外面少[约5%]', None),
 (21.0, '10月15日，特斯拉在 SpaceX 测试场发布', None), (24.9, '倒挂，只是第一招', None), (28.8, '第二招：飞', 31.3),
 (32.0, '车里塞满了高压气瓶', 34.5), (34.6, '一侧喷气，车就翻身', 37.0), (37.1, '据报道：10个喷口，600升空气', 40.3),
 (41.42, '第三招：跳', 44.0), (46.6, '喷气，比轮胎有劲得多', 49.0), (51.6, '0到60英里/时，不到1秒', None), (54.2, '特斯拉说的，还没人实测', None),
 (56.6, '气瓶的气用完，就飞不动了', None), (59.2, '飞多高、飞多久？没公布', None), (61.8, '会"飞"的版本：单座、仅邀请', None),
 (64.2, '而且不能开上马路', None), (66.8, '最便宜的，定金5万美元', None), (69.45, '量产，要等到[2028年]', None),
 (72.1, '倒挂，是真本事', None), (74.7, '"飞"，还只是一跳', 77.15), (77.25, '托住它的，从头到尾都是[空气]', 82.1),
]
out = []
for i, (t, s, e) in enumerate(L):
    st = t if t in (32.0, 34.6, 37.1) else round(snap(t), 3)
    en = e if e is not None else round(snap(L[i + 1][0]) - 0.1, 3)
    out.append([st, en, s])
json.dump(out, open('lines_v3_arr.json', 'w'), ensure_ascii=False)
