"""Time the subtitles of 《大脑的懒惰》: each window is shared by its lines in proportion to their reading need
(0.5 + chars/7 + 0.6 s), 0.1 s gaps. Prints the SUBS block for src/subs_data.ts."""
import re, sys
CH = [
 ((0.05, 2.45), ['A和B，是[同一个颜色]。']),
 ((2.50, 5.15), ['盯着B，我把周围[遮住]——']),
 ((5.25, 7.95), ['B在变深——它{一像素没动}。']),
 # 8.14 title card; the board grows back around A and B
 ((11.75, 24.20), ['把阴影[拿开]：B一点没变，它本来就这么深。', '大脑不测量，它[猜]：B在阴影里，就该调亮。', '1867年，亥姆霍兹称之为"[无意识推理]"。']),
 # 24.42 the board folds into a table top (a phrase starts here)
 ((24.60, 30.80), ['这块玻璃，刚好盖住左边的桌面。', '放得进右边那张桌子吗？押一个——']),
 ((30.90, 32.45), ['看好了——']),
 # 32.56 the glass lands on the right table
 ((32.60, 48.65), ['{严丝合缝}，两块桌面一模一样。', '不信？用两根手指比一比两条长边。', '知道了答案，再看一眼：左边还是更长吧？', '大脑默认它是立体的，自动按[透视]拉长。', '知道了也没用，它照样偷这个懒。']),
 # 48.84 break: the glass becomes the yellow block
 ((49.00, 55.40), ['黄蓝两块赛跑，谁先到终点？押一个——', '看起来，你追我赶，[一步一停]。']),
 # 59.01 they cross the line together
 ((59.10, 68.30), ['{同时}撞线。它们一直是匀速。', '拿掉条纹再跑一次：大脑靠边缘[对比]估速度。', '对比弱，就显得慢。']),
 # 69.19 build: the spheres
 ((69.35, 84.90), ['再来一组：这12个球，分别是什么颜色？', '红、绿、蓝、紫、橙……对吧？', '我们把每一个球，都取一次色——', '第一个：219、203、178。', '第二个，[一样]。第三个，还是一样……']),
 # 85.14 drop
 ((85.30, 91.20), ['12个球，全是[同一种米色]。', '彩色的，只是前面那些细线。']),
 ((91.30, 95.10), ['大脑处理颜色很[节省]：直接借旁边的。']),
 # 95.31 the barber pole
 ((95.50, 101.20), ['这些斜条纹，明明在往{右}走。', '用两根手指，把左右两边挡住——']),
 ((101.30, 103.30), ['挡好了吗？']),
 # 103.45 the sides close to a slit
 ((103.60, 109.40), ['只剩一条缝，它们就开始往[上]走。', '信息不够，大脑挑[最省事]的答案。']),
 # 109.56 recap
 ((109.70, 117.50), ['你看到的世界，是大脑[最省力]的猜测。', '大多数时候，它都猜对了。', '所以你几乎没发现。']),
 # 117.70 back to the board
 ((117.85, 122.60), ['现在，再看一眼A和B——', '它们还是{不一样}。']),
]
need = lambda t: 0.5 + len(re.sub(r'[，。：；、？！"“”\s—\-\[\]{}…]', '', t)) / 7 + 0.6
out = []
for (a, z), lines in CH:
    ns = [need(t) for t in lines]; gaps = 0.1 * (len(lines) - 1)
    k = (z - a - gaps) / sum(ns)
    flag = '  !! too short' if k < 1 else ('  ~ stretched' if k > 1.15 else '')
    print(f'// {a:6.2f}-{z:6.2f} x{k:.2f}{flag}', file=sys.stderr)
    t = a
    for n, txt in zip(ns, lines):
        d = n * k; out.append((round(t, 2), round(t + d, 2), txt)); t += d + 0.1
print('export const SUBS: [number, number, string][] = [')
for a, z, t in out: print(f"  [{a:.2f}, {z:.2f}, '{t}'],")
print('];')
tw = sum(z - a for a, z, _ in out); tn = sum(max(0, (z - a) - (0.5 + len(re.sub(r'[，。：；、？！"“”\s—\-\[\]{}…]', '', t)) / 7)) for a, z, t in out)
st = sum(max(0, (z - a) - need(t)) for a, z, t in out)
print(f'// stretch beyond need {100 * st / tw:.1f}%  |  time after reading (incl. 0.6 s look) {100 * tn / tw:.1f}%', file=sys.stderr)
