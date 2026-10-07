"""Time the subtitles of 《大脑的懒惰》: each window is shared by its lines in proportion to their reading need
(0.5 + chars/7 + 0.6 s), 0.1 s gaps. Prints the SUBS block for src/subs_data.ts."""
import re, sys
CH = [
 ((0.05, 2.45), ['A和B，是[同一个颜色]。']),
 ((2.50, 5.15), ['盯着B，我把周围[遮住]——']),
 ((5.25, 7.95), ['B在变深——它{一像素没动}。']),
 # 8.14 title card; the board grows back around A and B
 ((11.75, 22.20), ['把阴影[拿开]：B一点没变，它本来就这么深。', '大脑不测量，它[猜]：B在阴影里，就该调亮。', '1867年，亥姆霍兹称之为"[无意识推理]"。']),
 # 22.38 the board folds into a table top
 ((22.55, 30.40), ['这两张桌面，哪张更[长]？', '左边细长，右边短宽？', '把左边的桌面拿起来，转一下——']),
 # 30.52 it lands on the right one
 ((30.55, 40.50), ['{一模一样}，只是转了90度。', '1990年，心理学家谢泼德画出了这对桌子。', '大脑默认它是立体的，自动按[透视]拉长。']),
 # 40.70 break: the gold top becomes the yellow block
 ((40.90, 46.80), ['两块方块，看起来在[一步一停]地走。', '黄的走，蓝的停；蓝的走，黄的停。']),
 # 48.84 the stripes go
 ((48.90, 55.40), ['拿掉条纹：它们一直是{匀速}。', '大脑靠边缘的[对比]估速度，对比弱就显得慢。']),
 # 56.98 build: the stripes turn into the spheres' stripes
 ((57.15, 72.70), ['最后一组：这12个球，分别是什么颜色？', '红、绿、蓝、紫、橙……对吧？', '我们把每一个球，都取一次色——', '第一个：219、203、178。', '第二个，[一样]。第三个，还是一样……']),
 # 72.93 drop
 ((73.10, 79.00), ['12个球，全是[同一种米色]。', '彩色的，只是前面那些细线。']),
 ((79.10, 82.90), ['大脑处理颜色很[节省]：直接借旁边的。']),
 # 83.10 the stripes tilt and a slit closes in
 ((83.30, 88.30), ['这些斜条纹，往哪个方向走？', '看起来，一直在往[上]？']),
 # 89.21 the window opens
 ((89.30, 95.20), ['打开窗口——它们一直在往{右}走。', '信息不够，大脑就挑[最省事]的答案。']),
 # 95.31 recap
 ((95.45, 101.25), ['你看到的世界，是大脑[最省力]的猜测。', '大多数时候，它都猜对了。']),
 # 101.42 back to the board
 ((101.60, 106.30), ['现在，再看一眼A和B——', '它们还是{不一样}。']),
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
