"""Time the subtitles of 《谁会拿诺奖》 (same rule as the other films: need = 0.5 + chars/7 + 0.6 s per line, windows shared
in proportion, 0.1 s gaps). Track uncut from 0:00: title 8.47 (B16), break 49.17, build 65.45, drop 81.40."""
import re, sys
CH = [
 ((0.30, 8.30), ['下周一[11:45]，斯德哥尔摩会念出一个名字。', '今年的诺贝尔经济学奖，[会是谁]？']),
 # 8.47 title card (until ~12.0)
 ((12.10, 30.70), ['第三位热门：[苏珊·阿西]，斯坦福。', '2007年，她成为[首位]获克拉克奖的女性。', '她研究网上拍卖：你每搜一次，广告位就[当场拍卖]。',
                   '规则怎么定，决定[你先看到谁]、商家付多少钱。', '她也是最早走进[科技公司]的经济学家之一。']),
 # 30.86 (bar 11) Blundell
 ((31.00, 48.95), ['第二位：[理查德·布伦德尔]，伦敦大学学院。', '政府加税，人会不会就{不想干活}了？', '他把80年代英国的几次税改，当成[天然实验]。',
                   '结果：工资涨了，人会多干，但[没想象中多]。', '他还参与主编了英国[税制改革]的权威报告。']),
 # 49.17 break: Pakes
 ((49.20, 65.97), ['呼声最高：[阿里尔·帕克斯]，哈佛。', '一辆车涨价，买家会[跑去哪]？', '旧模型：{按份额平分}，连皮卡都分一份。',
                   '1995年BLP模型：口味不同，买家跑向[最像的那辆]。', '反垄断常用它算：合并后[价格涨多少]。']),
 # 65.45 build
 ((66.00, 81.20), ['那[谁会赢]？', '2020年拍卖理论、2021和2023年劳动经济学，都刚拿过奖。', '帕克斯所在的产业组织，上一次是[2014年]。', '所以，我们猜——']),
 # 81.40 drop
 ((81.50, 83.40), ['[帕克斯]。']),
 ((83.50, 87.40), ['当然，也可能{三个都不是}。']),
]
need = lambda t: 0.5 + len(re.sub(r'[，。：；、？！"“”\s—\-\[\]{}…·]', '', t)) / 7 + 0.6
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
