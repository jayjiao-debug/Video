"""Time the subtitles: each chapter window is shared by its lines in proportion to their reading need
(0.5 + chars/7 + 0.6 s), 0.1 s gaps. Prints the SUBS block for src/lib.ts."""
import re
CH = [
 ((0.10, 2.45), ['后悔分两种。']),
 ((2.65, 5.00), ['一种，时间会治好；']),
 ((5.20, 8.05), ['另一种，时间会放大。']),
 ((10.25, 15.15), ['1994年，心理学家问：', '你这辈子，最后悔什么？']),
 ((15.35, 24.30), ['只看上一周：', '53%的人，最后悔"做了"的事——', '说错的话，冲动的决定。', '拉长到一辈子——']),
 ((24.50, 33.45), ['84%的人，最后悔"没做"的事：', '没去的地方，没说出口的话。', '时间尺度一换，答案翻了过来。']),
 ((33.70, 45.75), ['原因很冷酷：', '做错的事有结局，你会慢慢消化；', '没做的事没有结局，大脑一直在补完。', '而且越往后，你越确信"当时能行"。']),
 ((45.90, 56.90), ['2018年，他又追问：是哪一种"没做"？', '72%的后悔，是没成为想成为的人；', '只有28%，是没尽到该尽的责任。']),
 ((57.05, 73.60), ['拦住你的，常常是一个误判：', '你以为所有人都在看你。', '实验：穿一件尴尬的T恤走进教室，', '本人估计，一半人会注意到；', '实际：只有大约四分之一的人。']),
 ((73.85, 80.60), ['你高估了别人的目光一倍，', '却低估了遗憾的寿命。']),
 ((82.00, 92.80), ['2022年，109个国家，2万多条后悔：', '30岁以后，差距拉开：', '"没做"的后悔，是"做错"的两倍。']),
 ((92.90, 96.60), ['你那条没走的路，是什么？']),
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
