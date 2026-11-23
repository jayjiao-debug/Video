#!/usr/bin/env python3
"""Writes scripts/mona/voice/mona_lines.json (the lines file of 采访蒙娜丽莎的一天 for the day engine's gen_timing.py) from
the script's table (script v1 + the spoken Italian / French, 24 Nov 2026). The "en" field holds the words actually SAID
by a speaker who does not speak Chinese (Italian for Mona and Leonardo, French for Napoleon): the engine's small row
under the Chinese. For the reporter and the child it holds the English meaning (never on screen).
    python3 scripts/mona/voice/make_lines.py"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
# [n, scene, who, emotion, zh, said (it / fr) or English meaning, extras]
L = [
 [1, "A", "mo", "pose, lips barely move", "嘘。新来的徒弟？站那儿，别挡光。", "Ssh. La nuova allieva? Sta' lì. Non farmi ombra.", {"pre": 2.0}],
 [2, "A", "ji", "curious", "你嘴没动啊？", "Your lips aren't moving.", {}],
 [3, "A", "mo", "pose, proud", "师父说了：别动，快好了。", "Il maestro ha detto: ferma, ho quasi finito.", {"after": 4.4, "card": {"zh": "1503年10月 · 佛罗伦萨 · 先画好的是头", "en": "October 1503 · Florence · the head was painted first"}, "card_delay": 1.9, "card_hold": 2.6}],
 [4, "B", "ji", "", "他们是谁？", "Who are they?", {"pre": 2.2}],
 [5, "B", "mo", "tired, the smile stays on", "师父怕我闷，请人唱歌、讲笑话。", "Il maestro ha paura che mi annoi. Ha chiamato musici e buffoni.", {}],
 [6, "B", "mo", "tired", "讲了四年。就三个笑话。", "Quattro anni. Tre barzellette in tutto.", {"after": 0.6}],
 [7, "B", "ji", "", "那你笑什么？", "So why the smile?", {}],
 [8, "B", "mo", "pose, dry", "我不笑，他们不走。", "Se non sorrido, non se ne vanno.", {"after": 2.4}],
 [9, "B", "mo", "caught, then pose", "……这一笔，别画。", "...Questo non disegnarlo.", {"after": 0.5}],
 [10, "B", "le", "absent-minded", "别动。快好了。", "Ferma. Ho quasi finito.", {"after": 0.4}],
 [11, "B", "ji", "", "能不笑吗？", "Can you stop smiling?", {}],
 [12, "B", "mo", "pose, firm", "不能。还差一笔。", "No. Manca una pennellata.", {"after": 0.8}],
 [13, "C", "ji", "", "还没交货？", "Still not delivered?", {"pre": 2.4}],
 [14, "C", "mo", "pose, patient", "十四年了。师父说，还差一笔。", "Quattordici anni. Il maestro dice che manca una pennellata.", {}],
 [15, "C", "ji", "", "订画的人呢？", "And the client?", {}],
 [16, "C", "mo", "plain", "我丈夫订的。一直没收到货。", "L'ha ordinato mio marito. Non l'ha mai ricevuto.", {}],
 [17, "C", "mo", "pose, dry", "他大概以为，我跟画家跑了。", "Penserà che sono scappata col pittore.", {"after": 1.0}],
 [18, "C", "le", "asleep, mumbling", "别动……快好了……", "Ferma... ho quasi finito...", {"after": 3.2, "card": {"zh": "客人的日记 · 他的右手已经瘫了", "en": "A visitor's diary · his right hand was paralysed"}, "card_delay": 0.4, "card_hold": 2.6}],
 [19, "C", "mo", "plain, warm", "你听，快好了。", "Senti? Ha quasi finito.", {"after": 1.4}],
 [20, "D", "mo", "pose", "师父把我借给国王，看两天。", "Il maestro mi ha prestata al re. Per due giorni.", {"pre": 2.2}],
 [21, "D", "ji", "", "两天？", "Two days?", {}],
 [22, "D", "mo", "tired, the smile stays on", "……两百多年了。", "...Sono passati più di duecento anni.", {"pre": 1.8, "after": 1.6}],
 [23, "D", "na", "nervous whisper", "她一直在看我。", "Elle me regarde. Tout le temps.", {}],
 [24, "D", "mo", "pose, whisper, eyes to lens", "是他把我挂床头的。", "È lui che mi ha appesa sopra il letto.", {"after": 0.9}],
 [25, "E", "mo", "bright, a real smile", "师父派人来接我了！", "Il maestro ha mandato qualcuno a prendermi!", {"pre": 3.2}],
 [26, "E", "ji", "flat", "他是小偷。", "He's a thief.", {}],
 [27, "E", "mo", "pose, whisper", "嘘。别吓跑他。", "Ssh. Non farlo scappare.", {"after": 1.4, "card": {"zh": "藏在箱子里 · 28个月", "en": "Hidden in a trunk · 28 months"}, "card_delay": 1.2, "card_hold": 2.2}],
 [28, "E", "mo", "sigh, loose", "啊……没人看。", "Ahh... nessuno mi guarda.", {"pre": 2.2}],
 [29, "E", "mo", "plain, content", "画了四百年，头一回不用笑。", "Quattrocento anni, e per la prima volta non devo sorridere.", {"after": 0.5}],
 [30, "E", "ji", "", "外面排队看空墙呢。", "They're queuing to see the empty wall.", {"after": 3.0}],
 [31, "E", "mo", "baffled", "看墙？我挂着的时候，怎么没人排队？", "Il muro? Quando c'ero appesa io, nessuno faceva la fila.", {"split": ["看墙？我挂着的时候，", "appesa io,"]}],
 [32, "E", "ji", "", "你丢了才出名。", "You got famous by going missing.", {}],
 [33, "E", "mo", "tired", "……那我早该丢。", "...Allora dovevo sparire prima.", {"after": 3.2, "card": {"zh": "1913年12月 · 佛罗伦萨 · 找到了", "en": "December 1913 · Florence · found"}, "card_delay": 0.5, "card_hold": 2.4}],
 [34, "E", "mo", "pose, through the smile", "假，放完了。", "Vacanza finita.", {"after": 1.0}],
 [35, "F", "mo", "tired, the smile stays on", "他们看我一眼，就转过身，背对我，学我笑。", "Mi guardano un attimo, poi mi voltano le spalle e imitano il mio sorriso.", {"pre": 2.2, "after": 1.6, "split": ["他们看我一眼，就转过身，", "le spalle"]}],
 [36, "F", "mo", "pose, pleased", "有位老太太从轮椅上站起来，请我吃蛋糕。", "Una vecchia signora si è alzata dalla sedia a rotelle per offrirmi una torta.", {"after": 1.0, "split": ["有位老太太从轮椅上站起来，", "a rotelle"]}],
 [37, "F", "mo", "pose, touched", "还有人送南瓜汤。五百年，总算有人管饭。", "E qualcuno ha portato la zuppa di zucca. Cinquecento anni, e finalmente mi danno da mangiare.", {"split": ["还有人送南瓜汤。", "di zucca."]}],
 [38, "F", "mo", "tired", "可惜，隔着窗。", "Peccato per il vetro.", {"after": 1.0}],
 [39, "F", "ki", "loud", "妈妈，她没有眉毛！", "Mum, she has no eyebrows!", {"after": 0.5}],
 [40, "F", "mo", "pose, stung", "有的。师父一根一根画的。", "Le ho. Il maestro le ha dipinte pelo per pelo.", {"after": 2.8, "card": {"zh": "瓦萨里写过她的眉毛 · 画上现在没有", "en": "Vasari described her eyebrows · the panel shows none today"}, "card_delay": 0.2, "card_hold": 2.4}],
 [41, "F", "ji", "", "真没有。", "You really don't.", {"after": 1.0}],
 [42, "F", "mo", "caught, then pose", "……这一笔，也别画。", "...Non disegnare neanche questo.", {"after": 1.0}],
 [43, "G", "mo", "pose, giving orders", "徒弟，师父呢？他该来补那一笔了。", "Allieva, dov'è il maestro? È ora che venga a dare quell'ultima pennellata.", {"pre": 2.0, "split": ["徒弟，师父呢？", "il maestro?"]}],
 [44, "G", "ji", "quiet", "他1519年就走了。", "He's been gone since 1519.", {"after": 1.2}],
 [45, "G", "mo", "the smile holds, the eyes change", "……走了？那“快好了”呢？", "...Se n'è andato? E «ho quasi finito»?", {"after": 0.8}],
 [46, "G", "ji", "quiet", "一直没画完。", "He never finished.", {"after": 2.4}],
 [47, "H", "mo", "plain", "他右手瘫了那年，还把我摆出来，给客人看。", "L'anno in cui gli si paralizzò la mano destra, mi mostrava ancora ai suoi ospiti.", {"pre": 2.6, "after": 0.5, "split": ["他右手瘫了那年，", "mano destra,"]}],
 [48, "H", "mo", "plain", "十四年，他走到哪儿，把我带到哪儿。", "Quattordici anni. Ovunque andasse, mi portava con sé.", {"after": 0.9, "split": ["十四年，", "anni."]}],
 [49, "H", "mo", "a small laugh", "我还以为，是他手慢。", "Credevo fosse solo lento.", {"after": 0.9}],
 [50, "H", "mo", "sigh, soft", "原来，是他舍不得画完。", "Invece non se la sentiva di finirmi.", {"after": 2.2}],
 [51, "H", "ji", "gentle", "你可以动了。", "You can move now.", {"after": 2.6}],
 [52, "H", "mo", "sore", "五百年……腮帮子，酸死了。", "Cinquecento anni... che male alla mascella.", {"after": 1.6}],
 [53, "I", "ji", "whisper", "他都不在了。", "He isn't even here any more.", {"pre": 3.2}],
 [54, "I", "mo", "pose, lips still, eyes warm", "嘘。我不动，他就还在画。", "Ssh. Finché non mi muovo, lui sta ancora dipingendo.", {"after": 2.6}],
 [55, "I", "mo", "whisper, off screen", "……刚才揉脸那一笔，别画啊。", "...E la mano sulla guancia, prima. Non disegnarla, eh.", {"after": 1.2}],
]
SCENES = {
 "A": {"time": "1503年", "en": "1503", "place": "stage", "where": "佛罗伦萨，画室", "stage": ["s1"]},
 "B": {"time": "第四年", "en": "Year four", "place": "stage", "where": "佛罗伦萨，画室", "stage": ["s2"], "open_card": "画了四年 · 瓦萨里《艺苑名人传》"},
 "C": {"time": "1517年", "en": "1517", "place": "stage", "where": "法国，克卢城堡", "stage": ["s3"], "open_card": "1517年10月10日 · 法国 克卢城堡 · 十四年后"},
 "D": {"time": "1518年", "en": "1518", "place": "stage", "where": "国王的墙，拿破仑的卧室", "stage": ["s4a", "s4b", "s4c", "s4d"], "open_card": "约1518年 · 归法国国王", "cards": {"D22": "1800年 · 杜伊勒里宫 · 拿破仑的卧室（传说）"}},
 "E": {"time": "1911年", "en": "1911", "place": "stage", "where": "卢浮宫", "stage": ["s5", "s5b"], "open_card": "1911年8月21日 · 卢浮宫"},
 "F": {"time": "今天", "en": "Today", "place": "stage", "where": "卢浮宫，玻璃后面", "stage": ["s6", "s6b", "s6c", "s6d"], "open_card": "卢浮宫 · 回来以后", "cards": {"F35": "1956年 · 一块石头 / 2022年 · 蛋糕", "F36": "2024年 · 南瓜汤"}},
 "G": {"time": "傍晚", "en": "Evening", "place": "stage", "where": "卢浮宫", "stage": ["s7"]},
 "H": {"time": "闭馆以后", "en": "After closing", "place": "stage", "where": "卢浮宫", "stage": ["s8"]},
 "I": {"time": "深夜", "en": "Night", "place": "stage", "where": "卢浮宫", "stage": ["s9"]},
}
SPOKEN = {"ji": "zh", "mo": "en", "le": "en", "na": "en", "ki": "zh"}
LANG = {"ji": "zh", "mo": "it", "le": "it", "na": "fr", "ki": "zh"}
lines, k = [], {}
for n, sc, who, emo, zh, en, x in L:
    k[sc] = k.get(sc, 0) + 1
    l = {"n": n, "id": f"{sc}{n:02d}", "scene": sc, "who": who, "emotion": emo, "lang": LANG[who], "zh": zh, "en": en, "en_on_screen": SPOKEN[who] == "en"}
    sp = x.pop("split", None)
    if sp:
        a, b = sp; i = en.index(b) + len(b)
        assert zh.startswith(a), (n, a)
        l["screens"] = [{"zh": a, "en": en[:i].strip()}, {"zh": zh[len(a):], "en": en[i:].strip()}]
    else: l["screens"] = [{"zh": zh, "en": en}]
    l.update(x); lines.append(l)
out = {
 "film": "mona", "version": "v1 (script v1 with the spoken Italian / French, 24 Nov 2026; placeholder timing until the voice exists)",
 "source": "the Claude Doc 采访蒙娜丽莎的一天: script v1 (its tables and its section of spoken lines); written by make_lines.py",
 "title": {"zh": "采访蒙娜丽莎的一天", "en": "A Day Interviewing the Mona Lisa"},
 "speakers": {"ji": "记者 (the camera, never seen; Chinese)", "mo": "蒙娜丽莎 Mona (Italian)", "le": "达芬奇 Leonardo (Italian)", "na": "拿破仑 Napoleon (French)", "ki": "小孩 a child in the crowd (off screen; Chinese)"},
 "scenes": SCENES, "gap": 0.2, "lead": 0.1,
 "engine": {"spoken": SPOKEN, "places": ["stage"], "title_after": "A03", "title_delay": 0.3, "title_hold": 1.5, "rate_en": 3.0},
 "lines": lines,
}
p = os.path.join(HERE, "mona_lines.json")
json.dump(out, open(p, "w", encoding="utf8"), ensure_ascii=False, indent=1)
print(p, len(lines), "lines")
