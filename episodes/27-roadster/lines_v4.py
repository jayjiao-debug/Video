# ep27 v4 (blueprint, ~1:30) subtitle lines. (start, text, end or None = next start − 0.1)
import json
B = json.load(open('music/beats.json'))['beats']
snap = lambda t: min(B, key=lambda b: abs(b - t))
L = [
 (0.12, '它开上墙，倒挂在了顶上', None), (2.67, '还没掉下来', 5.0), (5.13, '重力明明在往下拉', 7.6),
 (10.56, '拆开看，只有两样东西', None), (13.17, '一台风扇，一组高压气瓶', 15.7),
 (15.79, '风扇把车底的空气往外抽', None), (18.39, '外面的空气，就把车往上推', None), (21.0, '外面推约[40吨]，车才2吨', None), (24.9, '车底只要少[约5%]的空气', 28.7),
 (28.8, '再看那组气瓶', None), (31.42, '据报道：10个喷口，600升空气', None), (35.76, '一边往上喷，一边往下喷', None), (39.0, '车就在空中翻了个身', None), (41.42, '落地前往下喷，稳住', 43.9),
 (44.0, '第二个演示：跳过五辆车', None), (46.6, '喷气比轮胎有劲得多', None), (49.1, '稳稳落地', 51.5), (51.6, '0到60英里/时，不到1秒', None), (54.2, '都是特斯拉说的，待验证', 56.5),
 (56.6, '那它能飞多高、多久？', None), (59.2, '没公布', None), (61.8, '会"飞"的版本：单座、仅邀请', None), (64.2, '而且不能上路', None), (66.8, '2028年才量产', 69.35),
 (69.45, '倒挂，是真本事', None), (72.1, '"飞"，还只是一跳', None), (74.7, '托住它的——', 77.15), (77.25, '是[空气]', 82.1),
]
out = []
for i, (t, s, e) in enumerate(L):
    st = round(snap(t), 3)
    en = e if e is not None else round(snap(L[i + 1][0]) - 0.1, 3)
    out.append([st, en, s])
json.dump(out, open('lines_v4_arr.json', 'w'), ensure_ascii=False)
