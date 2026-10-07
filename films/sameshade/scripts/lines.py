"""Time the subtitles of 《大脑的懒惰》: each window is shared by its lines in proportion to their reading need
(0.5 + chars/7 + 0.6 s), 0.1 s gaps. Prints the SUBS block for src/subs_data.ts."""
import re, sys
CH = [
 ((0.05, 2.45), ['A和B，是[同一个颜色]。']),
 ((2.50, 5.15), ['盯着B，我把周围[遮住]——']),
 ((5.25, 7.95), ['B在变深——它{一像素没动}。']),
 # 8.14 title card (3.3 s), the board comes back around A and B
 ((11.75, 15.40), ['把阴影[拿开]：B一点没变，它本来就这么深。']),
 ((15.50, 26.60), ['这不是眼睛的错，是大脑的一种[省力策略]。', '它先猜：B在阴影里，阴影会让东西变暗。', '于是自动把B[调亮]了一档。']),
 ((26.70, 33.80), ['1867年，亥姆霍兹管这叫"[无意识推理]"：', '你看到的不是光，是大脑对光的[推断]。']),
 ((33.95, 40.45), ['这原本是一项本领：', '阴影里的白纸，读数少了一半，你看它依然是[白纸]。']),
 # 40.70 break: the dress
 ((40.90, 56.70), ['2015年，一张裙子照片引发全网[争论]。', '1401人里：57%看成蓝黑，30%看成[白金]。', '以为在阴影里的人，扣除蓝光，看成[白金]；', '以为在灯下的人，扣除黄光，看成[蓝黑]。']),
 # 56.98 build: the spheres
 ((57.15, 72.70), ['再看一组：这12个球，分别是什么颜色？', '红、绿、蓝、紫、橙……对吧？', '我们把每一个球，都取一次色——', '第一个：219、203、178。', '第二个，[一样]。第三个，还是一样……']),
 # 72.93 drop
 ((73.10, 79.00), ['12个球，全是[同一种米色]。', '彩色的，只是前面那些细线。']),
 ((79.10, 89.90), ['2018年，工程学教授诺维克提出了这个错觉。', '大脑处理形状很精细，处理颜色却很[节省]：', '它会把旁边的颜色，借过来涂上。']),
 ((90.00, 99.70), ['你看到的世界，是大脑的[最佳推断]。', '这种懒惰，其实是[效率]：', '大多数时候推断得很准，所以你几乎从来没发现。']),
 ((99.85, 105.30), ['现在你知道A和B一样了。再看一眼——', '它们还是{不一样}。']),
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
