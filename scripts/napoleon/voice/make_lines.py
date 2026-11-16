#!/usr/bin/env python3
"""Writes napoleon_lines.json (the day engine's lines file) from the script table below (script_v2, 16 Nov 2026: the
spine is 「不可能」). Everyone speaks Chinese; "en" is a plain English gloss (never shown; the film is Chinese only).
His few French words (Impossible, En avant) are part of his Chinese lines; the soldiers' Vive l'Empereur is a sound."""
import json, os
C = lambda zh, en, d=0.3, h=2.8: dict(card_delay=d, card_hold=h, card=dict(zh=zh, en=en))
S = [  # scene, who, zh, gloss, {pre, after, card}
 ("A", "ji", "带大炮翻雪山？不可能。", "Cannon over the Alps? Impossible.", dict(pre=0.35, after=0.25)),
 ("A", "np", "不可能？这个词，不是法语。", "Impossible? That word is not French.", dict(after=3.3)),   # 0.3 s, THE FREEZE (2.5 s: his card), 0.5 s
 ("A", "ji", "您骑的……是骡子？", "You are riding... a mule?", dict(pre=0.4, after=0.3)),
 ("A", "np", "马过不了这种路。", "A horse cannot pass here.", dict(after=0.35)),
 ("A", "np", "画的时候，画成马。白的。", "In the painting, make it a horse. White.", dict(after=3.6, **C("真事：他翻山骑的是骡子。白马是事后画的。", "True: he crossed on a mule; the painting came later.", 0.4, 2.9))),
 ("A", "ji", "这不算造假吗？", "Is that not faking it?", dict(after=0.3)),
 ("A", "np", "这叫战略。En avant！", "It is called strategy. En avant!", dict(after=3.3)),
 ("B", "ji", "教皇都请来了。", "Even the Pope is here.", dict(pre=1.6, after=0.3)),
 ("B", "np", "请他来看。", "Invited to watch.", dict(after=1.6)),
 ("B", "ji", "等等，您自己戴？", "Wait, you crown yourself?", dict(after=1.2)),
 ("B", "np", "我挣来的，我自己戴。", "I earned it. I put it on.", dict(after=3.4, **C("真事：1804年，他给自己戴上了皇冠。", "True: in 1804 he crowned himself.", 0.3, 2.6))),
 ("C", "ji", "明天打仗，您不睡？", "Battle tomorrow and you do not sleep?", dict(pre=1.8, after=0.5)),
 ("C", "np", "你。马伦哥那个。腿好了？", "You. From Marengo. Is the leg healed?", dict(after=0.3)),
 ("C", "bg", "好了，陛下！", "Healed, Sire!", dict(after=0.6)),
 ("C", "ji", "几万人，您都记得？", "Tens of thousands, and you remember?", dict(after=0.3)),
 ("C", "np", "记不住名字，带不了兵。", "Forget their names and you cannot lead them.", dict(after=4.6, **C("真事：那一夜，全军举着火把迎接他。", "True: on the eve of Austerlitz the army lit torches for him.", 1.0, 3.0))),
 ("D", "ji", "您同时写三封信？", "Three letters at once?", dict(pre=1.6, after=0.25)),
 ("D", "np", "四封。你也记。", "Four. You write too.", dict(after=1.2)),
 ("D", "ji", "晚饭只吃十分钟？", "Dinner in ten minutes?", dict(after=0.3)),
 ("D", "np", "八分钟。打牌。", "Eight. Cards.", dict(after=2.2)),
 ("D", "ji", "陛下，您出老千。", "Sire, you are cheating.", dict(after=0.4)),
 ("D", "np", "这也叫战略。", "This too is strategy.", dict(after=3.2, **C("真事：他打牌下棋都作弊，人人都知道。", "True: he cheated at cards and chess, and everyone knew.", 0.3, 2.7))),
 ("D", "ji", "英国人画您很矮。", "The English draw you very short.", dict(after=0.3)),
 ("D", "np", "一米六八！比你们高！", "One metre sixty-eight! Taller than you!", dict(after=3.6, **C("真事：约 1 米 68，高于当时法国男人的平均。", "True: about 1.68 m, above the French average of his day.", 0.3, 3.0))),
 ("E", "ji", "陛下，回头吧。", "Sire, turn back.", dict(pre=3.0, after=3.2)),   # he says nothing and keeps walking (script E26: a silence, not a line)
 ("E", "ji", "这也是战略？", "Is this strategy too?", dict(after=1.4)),
 ("E", "np", "这……不叫战略。", "This... is not strategy.", dict(after=3.2)),
 ("F", "ji", "他们是来抓您的。", "They are here to arrest you.", dict(pre=2.4, after=0.4)),
 ("F", "np", "我知道。", "I know.", dict(after=1.8)),
 ("F", "np", "谁想打死自己的皇帝，开枪。", "Whoever would kill his Emperor, fire.", dict(after=4.2, **C("真事：1815年3月7日，拉弗雷。没有人开枪。", "True: Laffrey, 7 March 1815. Nobody fired.", 1.4, 2.6))),
 ("F", "ji", "这也行？！", "That works?!", dict(after=2.6)),
 ("F", "ji", "还能翻盘吗？", "Can you still turn it round?", dict(pre=0.8, after=2.0)),
 ("F", "np", "上马。", "Mount up.", dict(after=3.2)),
 ("G", "ji", "您说过中国是睡狮？", "Did you call China a sleeping lion?", dict(pre=2.8, after=0.4)),
 ("G", "np", "我说过吗？", "Did I?", dict(after=3.2, **C("传说：查无出处，最早见于一百多年后。", "Legend: no source; it first appears over a century later.", 0.3, 2.7))),
 ("G", "ji", "还回法国吗？", "Will you go back to France?", dict(after=2.6)),
 ("G", "np", "……不可能。", "...Impossible.", dict(after=2.6)),
 ("G", "ji", "您终于说了。", "You finally said it.", dict(after=0.6)),
 ("G", "np", "记下来。但法典，他们删不掉。", "Write it down. But the Code they cannot erase.", dict(after=4.0)),
]
SCENES = {
 "A": dict(time="1800年 · 阿尔卑斯山", en="The Alps, 1800", place="alps"),
 "B": dict(time="1804年 · 巴黎圣母院", en="Notre-Dame, 1804", place="notredame"),
 "C": dict(time="1805年 · 奥斯特里茨前夜", en="Eve of Austerlitz, 1805", place="camp"),
 "D": dict(time="约1806年 · 杜伊勒里宫", en="The Tuileries, about 1806", place="tuileries"),
 "E": dict(time="1812年 · 俄国", en="Russia, 1812", place="russia"),
 "F": dict(time="1815年 · 拉弗雷", en="Laffrey, 1815", place="laffrey"),
 "G": dict(time="约1820年 · 圣赫勒拿岛", en="Saint Helena, about 1820", place="helena"),
}
lines = []
for i, (sc, who, zh, en, o) in enumerate(S, 1):
    l = dict(n=i, id=f"{sc}{i:02d}", scene=sc, who=who, zh=zh, en=en, screens=[dict(zh=zh, en=en)])
    l.update(o); lines.append(l)
j = dict(film="napoleon", version=2, source="script_v2.md (16 Nov 2026), the spine is 不可能",
         title=dict(zh="采访拿破仑的一天", en="A Day Interviewing Napoleon"),
         speakers=dict(ji="记者 (the camera, never seen)", np="拿破仑", bg="老兵 the grenadier"),
         scenes=SCENES, gap=0.2, lead=0.1,
         engine=dict(spoken=dict(ji="zh", np="zh", bg="zh"), places=[s["place"] for s in SCENES.values()] + ["waterloo"]),
         lines=lines)
# the title: after A07 (「这叫战略。En avant！」), as he rides on
j["engine"].update(title_after="A07", title_delay=0.5, title_hold=2.2)
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "napoleon_lines.json")
json.dump(j, open(out, "w", encoding="utf8"), ensure_ascii=False, indent=1)
print(out, len(lines), "lines")
