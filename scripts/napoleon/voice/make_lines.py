#!/usr/bin/env python3
"""Writes napoleon_lines.json (the day engine's lines file) from the script table below (script_v1, 16 Nov 2026).
"en" is the engine's second-language slot: for this film it carries FRENCH for the lines spoken in French (np, gd, dv)
and a plain English gloss (never shown) for the reporter's Chinese lines."""
import json, os
S = [  # who, zh, second row, {pre, after, card}
 ("A", "ji", "将军？您不是在桥上吗？", "General? Were you not on the bridge?", dict(pre=0.35, after=0.25)),
 ("A", "np", "把我画在桥上。", "Peignez-moi sur le pont.", dict(after=3.3)),   # 0.3 s, THE FREEZE (2.5 s: his card), 0.5 s
 ("A", "ji", "可您刚掉河里。", "But you just fell in the river.", dict(pre=0.5, after=0.3)),
 ("A", "np", "低一点。", "Plus bas.", dict(after=0.9)),
 ("A", "np", "从这儿看，我就在桥上。", "D'ici, je suis sur le pont.", dict(after=4.6, card_delay=1.5, card_hold=2.8,
    card=dict(zh="真事：他举旗冲上了桥。没冲过去，被人群挤进了河里。", en="True: he charged the bridge with the flag, failed, and was pushed into the water."))),
 ("A", "ji", "能量个身高吗？", "May I measure your height?", dict(after=0.25)),
 ("A", "np", "上马。", "À cheval.", dict(after=3.2)),
 ("B", "ji", "这是……骡子？", "Is that a mule?", dict(pre=1.6, after=0.3)),
 ("B", "np", "马过不了这种路。", "Un cheval ne passe pas ici.", dict(after=2.4)),
 ("B", "np", "你，这辈子想要什么？", "Toi. Que veux-tu, dans la vie ?", dict(after=0.4)),
 ("B", "gd", "一块地。一头牛。", "Une ferme. Une vache.", dict(after=0.4)),
 ("B", "np", "给你了。", "Tu l'auras.", dict(after=3.2, card_delay=0.3, card_hold=2.6,
    card=dict(zh="真事：五个月后，他下令付给这位向导 1200 法郎。", en="True: five months later he ordered 1,200 francs paid to the guide."))),
 ("B", "ji", "他人还挺好……", "He is rather kind.", dict(after=0.4)),
 ("B", "np", "画师。画一匹烈马。我，要镇定。", "Peintre. Un cheval fougueux. Et moi, calme.", dict(after=0.3)),
 ("B", "ji", "可这是骡……", "But that is a mule.", dict(after=0.15)),
 ("B", "np", "没人会问伟人的画像像不像。", "Personne ne s'informe si les portraits des grands hommes sont ressemblants.", dict(after=2.0)),
 ("B", "ji", "身高？", "Your height?", dict(after=0.25)),
 ("B", "np", "我在马上。", "Je suis à cheval.", dict(after=2.6)),
 ("C", "ji", "教皇不给您戴吗？", "Does the Pope not crown you?", dict(pre=1.8, after=0.3)),
 ("C", "np", "我自己来。", "Je m'en charge.", dict(after=3.0)),
 ("C", "ji", "您母亲呢？", "Where is your mother?", dict(after=0.9)),
 ("C", "np", "……她在赌气。", "…Elle boude.", dict(after=0.5)),
 ("C", "np", "大卫。把我母亲画上去。那儿，正中间。", "David. Mettez ma mère. Là. Au milieu.", dict(after=0.25)),
 ("C", "dv", "是，陛下。", "Oui, Sire.", dict(after=1.8)),
 ("C", "ji", "这也行？", "Is that allowed?", dict(after=0.4)),
 ("C", "np", "低一点。", "Plus bas.", dict(after=0.9)),
 ("C", "ji", "现在能量了吗？", "May I measure now?", dict(after=0.3)),
 ("C", "np", "我在宝座上。", "Je suis sur un trône.", dict(after=2.6)),
 ("D", "ji", "您吃这么快？", "You eat this fast?", dict(pre=1.6, after=0.3)),
 ("D", "np", "……逗号。十二分钟。已经太久了。", "…virgule. Douze minutes. C'est déjà trop.", dict(after=2.0)),
 ("D", "ji", "这是您？", "Is this you?", dict(after=0.3)),
 ("D", "np", "英国人画的。", "Les Anglais.", dict(after=0.4)),
 ("D", "ji", "好小。", "So small.", dict(after=0.3)),
 ("D", "np", "五尺二寸！法国尺！", "Cinq pieds deux pouces ! Mesure française !", dict(after=4.4, card_delay=0.3, card_hold=4.0,
    card=dict(zh="真事：法国的 5 尺 2 寸，约 1 米 68，比当时的法国男人还高一点。英国人按自己的尺子读成了“5 英尺 2”。", en="True: 5 pieds 2 pouces is about 1.68 m; read in English feet it became 5 ft 2."))),
 ("D", "ji", "那量一下？", "Shall we measure?", dict(after=0.25)),
 ("D", "np", "没空。去俄国。", "Pas le temps. La Russie.", dict(after=3.0)),
 ("E", "ji", "这段……怎么画？", "How shall this be painted?", dict(pre=3.0, after=2.6)),
 ("E", "np", "从伟大到可笑……只差一步。", "Du sublime au ridicule… il n'y a qu'un pas.", dict(after=3.6)),
 ("F", "ji", "陛下……", "Sire…", dict(pre=3.0, after=1.0)),
 ("F", "np", "画……", "Peignez…", dict(after=1.6)),
 ("F", "np", "……不。", "…Non.", dict(after=4.5)),
 ("G", "ji", "您在……种菜？", "You are gardening?", dict(pre=3.0, after=0.4)),
 ("G", "np", "豆子。比我的元帅听话。", "Des haricots. Ils obéissent mieux que mes maréchaux.", dict(after=1.0)),
 ("G", "ji", "还有画师吗？", "Are there painters still?", dict(after=0.8)),
 ("G", "np", "没有画师了。只剩你了。", "Plus de peintres. Il n'y a que vous.", dict(after=1.6)),
 ("G", "ji", "那……什么会留下？", "Then what will remain?", dict(after=0.9)),
 ("G", "np", "不是我那四十场胜仗。滑铁卢会把它们抹掉。", "Pas mes quarante batailles. Waterloo les effacera.", dict(after=0.7)),
 ("G", "np", "留下来的……是我的法典。", "Ce qui restera… c'est mon Code civil.", dict(after=5.0)),
 ("G", "np", "来吧。量。", "Allez. Mesurez.", dict(after=3.0)),
 ("G", "ji", "一米六八。不矮啊。", "One metre sixty-eight. Not short.", dict(after=0.4)),
 ("G", "np", "我一直这么说。", "Je l'ai toujours dit.", dict(after=0.8)),
 ("G", "np", "……低一点。", "…Plus bas.", dict(after=2.2)),
]
SCENES = {
 "A": dict(time="1796年 · 阿尔科莱", en="Arcole, 1796", place="arcole"),
 "B": dict(time="1800年 · 阿尔卑斯山", en="The Alps, 1800", place="alps"),
 "C": dict(time="1804年 · 巴黎圣母院", en="Notre-Dame, 1804", place="notredame"),
 "D": dict(time="约1805年 · 杜伊勒里宫", en="The Tuileries, about 1805", place="tuileries"),
 "E": dict(time="1812年 · 俄国", en="Russia, 1812", place="russia"),
 "F": dict(time="1815年 · 滑铁卢", en="Waterloo, 1815", place="waterloo"),
 "G": dict(time="约1820年 · 圣赫勒拿岛", en="Saint Helena, about 1820", place="helena"),
}
lines = []
for i, (sc, who, zh, en, o) in enumerate(S, 1):
    l = dict(n=i, id=f"{sc}{i:02d}", scene=sc, who=who, zh=zh, en=en, screens=[dict(zh=zh, en=en)])
    l.update(o); lines.append(l)
j = dict(film="napoleon", version=1, source="script_v1.md (16 Nov 2026), premise A 画里的他",
         title=dict(zh="采访拿破仑的一天", en="A Day Interviewing Napoleon"),
         speakers=dict(ji="记者 (the camera, never seen)", np="拿破仑 Napoléon (French)", gd="向导 Dorsaz (French)", dv="大卫 David (French)"),
         scenes=SCENES, gap=0.2, lead=0.1,
         engine=dict(spoken=dict(ji="zh", np="en", gd="en", dv="en"), places=[s["place"] for s in SCENES.values()], rate_en=2.6),
         lines=lines)
# the title: after A07 (「上马。」), over the join to the map
j["engine"].update(title_after="A07", title_delay=0.5, title_hold=2.2)
# two rows too wide for one screen: split at the full stop
SPLIT = {"C23": [("大卫。把我母亲画上去。", "David. Mettez ma mère."), ("那儿，正中间。", "Là. Au milieu.")],
         "G47": [("不是我那四十场胜仗。", "Pas mes quarante batailles."), ("滑铁卢会把它们抹掉。", "Waterloo les effacera.")]}
for l in lines:
    if l["id"] in SPLIT: l["screens"] = [dict(zh=a, en=b) for a, b in SPLIT[l["id"]]]
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "napoleon_lines.json")
json.dump(j, open(out, "w", encoding="utf8"), ensure_ascii=False, indent=1)
print(out, len(lines), "lines")
