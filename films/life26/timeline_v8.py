"""《生命平等吗？》 v8 timing: re-paced at 6.3 characters a second (the owner: 有些地方阅读时间太短).
Cry For Me, 92.29 BPM, phrase starts 0.65 21.46 42.27 63.08 83.88 104.69 125.50 146.30 167.11 187.9.
Hits used: 26.48 / 31.68 (quiet-verse re-entries), 42.36 title, 168.40 drop, 187.9 end card on the track's own outro.
Kant's 'cruelty' pair is cut (lecture density); holds are named (pause rows)."""
import json, re, sys
CPS = 6.3
n = lambda s: len(re.sub(r'[\[\]{}「」，。：？、“”…—\s！"《》%·]', '', s))
need = lambda s, extra=0: max(1.9, 0.5 + n(s) / CPS + 0.6) + extra
S = [
    # cold open
    (0.3, '路边一只猫被车撞了'), (3.0, '很多人会难过一整天'),
    (5.75, '2018年，肯尼亚'), (None, '世界上最后一只雄性北方白犀牛死了'), (None, '它叫苏丹，45岁'), (None, '全世界都为它难过'),
    (17.0, '一只苍蝇落在窗台上'), (19.67, '一巴掌，没人会多看一眼'),
    (22.6, '苍蝇、猫、犀牛'), (25.0, '都是一条命'), (27.6, '为什么心疼的程度，差这么多'),
    (31.68, '是我们太冷漠'), (None, '还是有些命，天生就更重'), (None, '人类为这个问题，争了两千多年'),
    ('limit', 40.2),
    # M1 the survey
    (46.7, '法国研究者问了三千多人'), (None, '52种生物，只能救一个，你救谁'),
    (None, '答案排成了一条线'), (None, '和人类亲缘越近，越被同情'), (None, '我们心里有一把尺子'), (None, '刻度是：[像不像我们]'),
    ('pause', 0.3),   # 像我 / 不像 written at the two ends of the ruler
    # M2 the bridge (the classical bubbles are read too)
    (None, '庄子和惠子在桥上看鱼'), (None, '庄子说：鱼真快乐', 0.5), (None, '惠子问：{你不是鱼}，怎么知道鱼快乐', 0.5),
    # M3 the bat
    (None, '内格尔问：做一只蝙蝠，是什么感觉'), (None, '我们永远进不到别的生命里'), (None, '只能凭[像不像我们]，猜它疼不疼'),
    (None, '那么，这条线该画在哪里'),
    ('pause', 0.2),   # the row of lives finishes drawing
    # M4 Kant · Bentham · Singer
    (None, '康德说：画在[理性]'), (None, '有理性的人，不能只被当成工具'), (None, '对动物，我们没有直接的义务'),
    (None, '边沁说：画在[痛苦]'), (None, '问题不是它们能不能思考，能不能说话'), (None, '而是：它们会不会痛苦'),
    ('pause', 0.7),   # the boundary slides past the dog, chicken and fish
    (None, '辛格在《动物解放》里说'), (None, '同样的痛苦，就该被同样地在乎'), (None, '一只鸡的痛，和一只狗的痛，一样重'),
    ('pause', 0.4),   # two equal hearts fill
    (None, '如果只因为不是人，就不算数'), (None, '这种偏心，叫{物种歧视}'), (None, '就像种族歧视、性别歧视一样'),
    # M5 Schweitzer
    (None, '史怀哲说：画在[生命本身]'),
    (None, '1915年，非洲河上，船穿过一群河马'), (None, '他想到四个字：[敬畏生命]'), (None, '他写道：我是想活下去的生命'), (None, '活在同样想活下去的生命之中'),
    (None, '他拒绝给生命排高低'), (None, '活着，免不了伤害'), (None, '但不该{毫无必要}'),
    ('pause', 0.8),   # the row again, every life warm
    # M7 Lecky's circle
    (None, '历史学家莱基写道'), (None, '善意像一个圈，最先只圈住家人'), (None, '后来是阶层、国家、全人类'), (None, '最后，才轮到动物'),
    ('pause', 0.3),   # the animals' ring closes
    (None, '所以，生命平等吗'), (None, '在我们的感觉里，从来不平等'), (None, '我们总以为，自己站在圈的中心'),
    ('limit', 166.9),
    # the drop and the answer
    (168.35, '但这个圈，一直在变大'), (None, '苏丹让全世界难过'), (None, '不是因为它的命，比苍蝇更重'), (None, '是因为它有名字，我们[看见了它]'),
    ('pause', 0.3),
    (None, '庄子说：天地与我并生'), (None, '而[万物与我为一]', 1.2),
    ('limit', 187.9),
]
t = 0; rows = []
for r in S:
    a = r[0]
    if a == 'pause': t += r[1]; continue
    if a == 'limit':
        print(f'  -- limit {r[1]}: last line ends {t - 0.12:.2f}, slack {r[1] - (t - 0.12):+.2f}'); continue
    s = r[1]; ex = r[2] if len(r) > 2 else 0
    st = a if a is not None else t
    if st < t - 0.01: print(f'  OVERLAP {t - st:.2f} before {s}', file=sys.stderr)
    d = need(s, ex); rows.append([round(st, 3), round(st + d, 3), s]); t = st + d + 0.12
    print('%7.2f-%7.2f %4.1fs %2d  %s' % (st, st + d, d, n(s), s))
if '--write' in sys.argv:
    json.dump(rows, open('src/lines.json', 'w'), ensure_ascii=False, indent=0)
    print('wrote src/lines.json', len(rows))
