"""Time the subtitles: each chapter window is shared by its lines in proportion to their reading need
(0.5 + chars/7 + 0.6 s), 0.1 s gaps. Prints the SUBS block for src/lib.ts."""
import re
CH = [
 ((0.10, 2.90), ['就在这一秒，']),
 ((3.00, 5.80), ['100万亿个粒子，穿过了你，']),
 ((5.90, 8.05), ['你毫无感觉。']),
 ((10.20, 15.20), ['今年诺贝尔物理学奖，', '颁给了在冰里捉它们的人。']),
 ((15.35, 24.30), ['它们叫中微子，外号"幽灵粒子"：', '不带电，几乎没有质量，', '能一口气穿过整个地球。']),
 ((24.50, 33.45), ['你这一生，被它撞上一次的概率，', '大约只有四分之一。', '想抓住它，探测器只能做得足够大。']),
 ((33.70, 45.75), ['1988年，物理学家哈尔岑提出：', '把南极的冰，变成探测器。', '冰下1450到2450米，', '钻86个孔，挂上5160只"眼睛"。']),
 ((45.90, 56.90), ['一整立方公里的冰，2010年底完工。', '中微子偶尔撞上冰里的原子，', '会闪出一道微弱的蓝光。']),
 ((57.05, 73.60), ['2013年，第一次抓到太阳系外的中微子：', '28个，能量是1987年超新星的百万倍。', '2017年9月22日，又一个撞进冰里，', '不到一分钟，警报传遍全球望远镜。']),
 ((73.85, 80.60), ['顺着方向找过去：40亿光年外，', '一个喷流正对地球的黑洞。']),
 ((82.00, 92.80), ['2023年，它用中微子拍下了银河系。', '人类多了一种看宇宙的方式，不靠光。', '从提出到获奖：38年。']),
 ((92.90, 96.60), ['你愿意为一个想法，等38年吗？']),
]
need = lambda t: 0.5 + len(re.sub(r'[，。：；、？！"“”\s—-]', '', t)) / 7 + 0.6
out, short = [], 0
for (a, z), lines in CH:
    ns = [need(t) for t in lines]; gaps = 0.1 * (len(lines) - 1)
    k = (z - a - gaps) / sum(ns)
    if k < 1: short += 1; print('!! window too short', a, z, round(k, 2))
    t = a
    for n, txt in zip(ns, lines):
        d = n * k; out.append((round(t, 2), round(t + d, 2), txt)); t += d + 0.1
print('export const SUBS: [number, number, string][] = [')
for a, z, t in out: print(f"  [{a:.2f}, {z:.2f}, '{t}'],")
print('];')
tw = sum(z - a for a, z, _ in out); tn = sum(max(0, (z - a) - need(t)) for a, z, t in out)
print(f'// waiting {100 * tn / tw:.1f}%')
