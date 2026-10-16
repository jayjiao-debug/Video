# ep27 v2 (one take, ~1:40) subtitle lines. (start, text, end or None = next start − 0.1)
import json
B = json.load(open('music/beats.json'))['beats']
snap = lambda t: min(B, key=lambda b: abs(b - t))
L = [
 (0.6, '特斯拉新跑车，冲向一面墙', None), (3.3, '开上墙——', None), (5.9, '再开上天花板', None), (8.0, '它为什么不掉下来？', 10.5),
 (13.17, '车底，藏着一台大风扇', None), (15.79, '把车底的空气往外抽', None), (18.39, '外面的空气把它按在顶上', None),
 (21.0, '车底只要比外面少[约5%]', None), (24.9, '这是10月15日，特斯拉的发布会', None),
 (28.8, '倒挂，只是第一招', None), (31.4, '第二招：飞', 35.9),
 (41.4, '车里塞满了高压气瓶', None), (44.0, '据报道：10个喷口，600升空气', None), (46.6, '一侧喷气，车就翻身', None), (49.1, '落地前往下喷，刹一脚', 51.5),
 (52.2, '第三招：跳', 55.9), (56.6, '喷气，比轮胎有劲得多', 59.1), (61.8, '0到60英里/时，不到1秒', None), (64.2, '都是特斯拉说的，还没人实测', 67.5),
 (69.45, '但气瓶里的气，用完就没了', None), (72.1, '飞多高、飞多久？特斯拉没说', None), (74.7, '会飞的版本，不能上路', 77.15),
 (77.25, '一共三个版本', None), (79.8, '最便宜的，定金5万美元', None), (82.25, '量产，要等到[2028年]', None),
 (84.9, '倒挂是真的', None), (87.0, '"飞"，还只是一跳', 93.3),
]
out = []
for i, (t, s, e) in enumerate(L):
    st = round(snap(t), 3)
    en = e if e is not None else round(snap(L[i + 1][0]) - 0.1, 3)
    out.append([st, en, s])
json.dump(out, open('lines_v2_arr.json', 'w'), ensure_ascii=False)
