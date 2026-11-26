#!/usr/bin/env python3
"""采访月老的一天: writes scripts/yuelao/voice/yuelao_lines.json (the day engine's lines file) from the script below.
Each row: id, who, zh, en, then options (screens split with '|', pre, after, emo, tts, card, pic)."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
SPEAKERS = {
    "ji": "记者 (the camera, never seen; standard Mandarin, the series voice)",
    "yl": "月老 (the lead: old, quick, fussy, warm underneath)",
    "xm": "林小满 (30, programmer, flat and tired)",
    "ma": "小满妈 (praying at the temple, loud)",
    "xq": "相亲男 (polite, checklist)",
    "qs": "外卖骑手 (young, kind)",
}
SCENES = {
    "A": {"time": "年终考核日 08:00", "en": "Review day, 08:00", "place": "office"},
    "B": {"time": "08:10", "en": "08:10", "place": "office"},
    "C": {"time": "09:30", "en": "09:30", "place": "office"},
    "D": {"time": "11:00", "en": "11:00", "place": "office"},
    "E": {"time": "人间 14:00", "en": "Mortal world, 14:00", "place": "work"},
    "F": {"time": "19:00", "en": "19:00", "place": "street"},
    "G": {"time": "22:00", "en": "22:00", "place": "street"},
    "H": {"time": "22:40", "en": "22:40", "place": "street"},
    "I": {"time": "22:55", "en": "22:55", "place": "street"},
    "J": {"time": "23:00", "en": "23:00", "place": "street"},
}
R = [
 # A: cold open
 ("A01","ji","月老？您被线绑架了？","Yue Lao? Have the threads kidnapped you?",dict(pre=1.2,after=0.15,tts="[surprised, amused] 月老？您被线绑架了？")),
 ("A02","yl","别动！一动，三对离婚。","Don't move! One tug and three couples divorce.",dict(after=3.0,emo="hissed through a thread in his teeth, dead serious",tts="[urgent, hissing] 别动！一动，三对离婚。")),
 ("A03","yl","等等……您是天庭派来考核的吧？","Wait... Heaven sent you for my review, didn't it?",dict(pre=0.3,screens="等等……|您是天庭派来考核的吧？",emo="suspicious, then fawning",tts="[suspicious] 等等……[nervous, fawning] 您是天庭派来考核的吧？")),
 ("A04","ji","啊？我其实是——","Uh? Actually I'm...",dict(tts="[confused] 啊？我其实是——")),
 ("A05","yl","懂！暗访。您记，随便记。","Got it! Undercover. Write it all down, please.",dict(after=2.6,emo="cuts her off, bowing",tts="[cutting in, eager] 懂！暗访。[fawning] 您记，随便记。")),
 # B: the office
 ("B01","yl","姻缘司，上下就我一个。别人九九六，我零零七。","The Marriage Bureau is just me. Others work 996. I work 007.",dict(pre=0.5,screens="姻缘司，上下就我一个。|别人九九六，我零零七。",emo="complaining, proud of it",tts="[sighs] 姻缘司，上下就我一个。别人九九六，[dry] 我零零七。")),
 ("B02","ji","一天绑多少对？","How many couples a day?",dict()),
 ("B03","yl","一万八千对。","Eighteen thousand.",dict(emo="proud")),
 ("B04","yl","可一天，也散七千五。","And seven and a half thousand split, the same day.",dict(after=2.4,emo="deflating",tts="[deflated] 可一天，也散七千五。",card={"zh":"2025年全国结婚登记676.3万对，离婚登记274.3万对（民政部）","en":"2025: 6.763M marriages, 2.743M divorces (Ministry of Civil Affairs)"},card_hold=2.6)),
 ("B05","yl","现在的年轻人，线刚绑上，自己就剪了。","Young people now: I tie it, they cut it.",dict(screens="现在的年轻人，|线刚绑上，自己就剪了。",emo="grumbling")),
 ("B06","yl","今年指标，就差一对。今晚子时截止。","This year's target is one couple short. Deadline: midnight.",dict(screens="今年指标，就差一对。|今晚子时截止。",emo="tapping the board, anxious")),
 ("B07","ji","差一对会怎样？","What if you're one short?",dict()),
 ("B08","yl","扣仙丹。还得写检讨。","They dock my elixir. And I write a self-criticism.",dict(after=0.5,emo="miserable",tts="[miserable] 扣仙丹。还得写检讨。")),
 # C: the famous case files
 ("C01","yl","不过您先看看，我的老业绩！","But first, look at my past results!",dict(pre=0.5,emo="brightening, showing off")),
 ("C02","yl","牛郎织女。我绑的！牢吧？","The Cowherd and the Weaver Girl. Mine! Solid, eh?",dict(emo="very proud",tts="[proud] 牛郎织女。我绑的！牢吧？")),
 ("C03","ji","可他们一年见一次。","They meet once a year.",dict()),
 ("C04","yl","……异地恋，也算成。","...Long distance still counts.",dict(after=0.4,emo="small",tts="[awkward, quiet] ……异地恋，也算成。")),
 ("C05","yl","梁山伯祝英台。……变蝴蝶了。这单别记。","Liang and Zhu. ...They became butterflies. Don't write that one.",dict(screens="梁山伯祝英台。|……变蝴蝶了。|这单别记。",after=0.3,emo="proud, then sees the file, shuts it fast",tts="梁山伯祝英台。[hesitates] ……变蝴蝶了。[quickly] 这单别记。")),
 ("C06","yl","许仙白娘子。跨物种，审批走了一千年。","Xu Xian and Lady White Snake. Cross-species: approval took a thousand years.",dict(screens="许仙白娘子。|跨物种，审批走了一千年。",emo="bureaucratic sigh")),
 ("C07","yl","宝玉黛玉。手一抖，绑成了宝钗。","Baoyu and Daiyu. My hand slipped. He got Baochai.",dict(screens="宝玉黛玉。|手一抖，绑成了宝钗。",emo="guilty",tts="宝玉黛玉。[guilty, small] 手一抖，绑成了宝钗。")),
 ("C08","yl","读者骂了我两百多年。","Readers have cursed me for two hundred years.",dict(after=0.3,emo="wounded")),
 ("C09","yl","董永七仙女——那是玉帝的亲闺女。","Dong Yong and the Seventh Fairy. She was the Jade Emperor's own daughter.",dict(screens="董永七仙女——|那是玉帝的亲闺女。",emo="whispering the second half",tts="董永七仙女——[whispers] 那是玉帝的亲闺女。")),
 ("C10","ji","那玉帝……","And the Jade Emperor...?",dict()),
 ("C11","yl","扣了我三百年仙丹。","Docked three hundred years of elixir.",dict(after=0.6,emo="flat, defeated",tts="[flat] 扣了我三百年仙丹。")),
 # D: the case arrives
 ("D01","yl","来单了！月老庙，加急！","An order! From my temple. Urgent!",dict(pre=0.6,emo="jumping up",tts="[excited] 来单了！月老庙，加急！")),
 ("D02","ma","月老保佑！我闺女三十了，天天加班，就是不找对象！","Bless us, Yue Lao! My girl is thirty, works every night, and won't find anyone!",dict(screens="月老保佑！我闺女三十了，|天天加班，就是不找对象！",emo="praying loudly, echo",tts="[pleading, loud] 月老保佑！我闺女三十了，天天加班，就是不找对象！")),
 ("D03","ma","今年再不成，我就不起来了！","If it doesn't happen this year, I'm not getting up!",dict(after=0.3,emo="threatening the god",tts="[stubborn] 今年再不成，我就不起来了！")),
 ("D04","yl","就她了！林小满。今晚必须绑上。","Her! Lin Xiaoman. Tied by tonight.",dict(screens="就她了！林小满。|今晚必须绑上。",emo="decisive")),
 ("D05","yl","您拿着线，跟我来！","Hold the thread and follow me!",dict(after=0.5,emo="thrusting the spool at the lens")),
 # E: attempt one
 ("E01","yl","嘘。凡人看不见咱们。","Shh. Mortals can't see us.",dict(pre=0.7,emo="whisper",tts="[whispers] 嘘。凡人看不见咱们。")),
 ("E02","ji","绑脚？不是绑手吗？","The ankle? Not the wrist?",dict(pre=0.4,tts="[whispers, puzzled] 绑脚？不是绑手吗？")),
 ("E03","yl","唐朝起就绑脚。绑手，是电视剧瞎改的。","Ankles, since the Tang. Wrists are a TV invention.",dict(screens="唐朝起就绑脚。|绑手，是电视剧瞎改的。",after=2.2,emo="offended professional",card={"zh":"唐《续玄怪录·定婚店》：赤绳“以系夫妻之足”","en":"Tang tale 'The Inn of Betrothal': the red cord 'ties the feet of husband and wife'"},card_hold=2.4)),
 ("E04","xm","不合适。不合适。下一个。","No. No. Next.",dict(pre=0.3,emo="flat, swiping without looking up",tts="[flat, bored] 不合适。不合适。下一个。")),
 ("E05","yl","哎哎哎！她左滑一下，我断一根！","Hey hey hey! Every left swipe snaps one of mine!",dict(screens="哎哎哎！|她左滑一下，我断一根！",emo="panicking",tts="[panicking] 哎哎哎！她左滑一下，我断一根！")),
 ("E06","yl","这个……您记成“缘分未到”。","This one... write it down as 'not fated yet'.",dict(after=0.6,emo="recovering, to the lens, a weak smile",tts="[embarrassed] 这个……您记成，缘分未到。")),
 # F: the blind date
 ("F01","yl","没事！她妈安排了相亲。这回稳了。","No matter! Her mum set up a blind date. This one's safe.",dict(pre=0.6,screens="没事！她妈安排了相亲。|这回稳了。",emo="confident again")),
 ("F02","xq","你好。有房吗？月薪多少？","Hello. Own a flat? Monthly salary?",dict(pre=0.5,emo="polite, reading from a list")),
 ("F03","xm","你能接受九九六吗？","Can you live with 996?",dict(emo="flat")),
 ("F04","xq","不好意思，我回个消息。","Sorry, I need to answer a message.",dict(pre=0.5)),
 ("F05","xm","正好，我修个bug。","Good. I'll fix a bug.",dict(after=0.9)),
 ("F06","yl","……这个，也记“缘分未到”。","...This one too. 'Not fated yet.'",dict(after=0.8,emo="desperate",tts="[defeated] ……这个，也记，缘分未到。")),
 # G: rock bottom
 ("G01","yl","线呢？我的线呢！","Where's the thread? My thread!",dict(pre=0.5,emo="frantic",tts="[frantic] 线呢？我的线呢！")),
 ("G02","yl","别动别动——缠您法器上了。","Don't move, don't move. It's wound round your instrument.",dict(screens="别动别动——|缠您法器上了。",after=0.5,emo="picking at the lens, close")),
 ("G03","qs","林女士，您的外卖！","Ms Lin, your delivery!",dict(pre=0.3,emo="calling, a little out of breath, in the background",tts="[calling out, cheerful] 林女士，您的外卖！")),
 ("G04","xm","谢谢。又是你啊。","Thanks. You again.",dict(emo="tired, not unkind")),
 ("G05","yl","还剩一个时辰。……完了。","One 'shichen' left. ...I'm done for.",dict(screens="还剩一个时辰。|……完了。",after=0.9,emo="sinking onto the step",tts="还剩一个时辰。[sighs, hopeless] ……完了。")),
 # H: the turn and the quiet scene
 ("H01","ji","那您自己呢？","And you yourself?",dict(pre=0.8,after=1.0,tts="[gently] 那您自己呢？")),
 ("H02","yl","……我？","...Me?",dict(after=1.0,emo="caught, very quiet",tts="[quietly] ……我？")),
 ("H03","yl","当年太忙。想着忙完这阵，就给自己绑一根。","I was too busy back then. I thought: after this rush, I'll tie one for myself.",dict(screens="当年太忙。|想着忙完这阵，|就给自己绑一根。",after=0.7,emo="quiet, looking at the cut thread",tts="[softly, slowly] 当年太忙。想着忙完这阵，就给自己绑一根。")),
 ("H04","yl","这一阵，忙了一千二百年。","The rush has lasted twelve hundred years.",dict(after=1.2,emo="a small dry laugh",tts="[soft, wry] 这一阵，忙了一千二百年。")),
 ("H05","yl","我这个……也记“缘分未到”吧。","Mine... write it down as 'not fated yet', too.",dict(after=1.8,emo="the gag, soft",tts="[very softly] 我这个……也记，缘分未到吧。")),
 # I: the fix
 ("I01","yl","等等。这根线……不是我绑的。","Wait. This thread... I didn't tie it.",dict(pre=0.6,screens="等等。|这根线……不是我绑的。",emo="noticing, slow",tts="[noticing] 等等。[puzzled] 这根线……不是我绑的。")),
 ("I02","yl","早就在这儿了。让我的线，盖住了。","It was here all along. Buried under mine.",dict(screens="早就在这儿了。|让我的线，盖住了。",after=0.5,emo="wonder")),
 ("I03","yl","我急什么呢。","What was I rushing for.",dict(after=0.9,emo="a breath, a smile",tts="[soft laugh] 我急什么呢。")),
 ("I04","qs","又加班啊？今天给你多加了个蛋。","Late again? I had them add an extra egg today.",dict(pre=0.4,screens="又加班啊？|今天给你多加了个蛋。",emo="shy")),
 ("I05","xm","……谢谢。你叫什么名字？","...Thank you. What's your name?",dict(after=1.2,emo="looks up for the first time, a real smile",tts="[surprised, warm] ……谢谢。你叫什么名字？")),
 ("I06","yl","成了！快记！我绑的！全是我绑的！","Done! Write it! I tied it! All me!",dict(screens="成了！快记！|我绑的！全是我绑的！",emo="exploding with joy",tts="[shouting, overjoyed] 成了！快记！我绑的！全是我绑的！")),
 ("I07","ji","不是早就在那儿吗？","Wasn't it there all along?",dict(tts="[dry] 不是早就在那儿吗？")),
 ("I08","yl","咳……这句，记成“缘分已到”。","Ahem... put that down as 'fated at last'.",dict(after=1.0,emo="cough, dignified",tts="[coughs] 咳……这句，记成，缘分已到。")),
 # J: the button
 ("J01","ji","那我的那根呢？","And my thread?",dict(pre=0.5,after=0.5,tts="[curious, hopeful] 那我的那根呢？")),
 ("J02","yl","你的？早绑好了。","Yours? Tied long ago.",dict(after=0.6,emo="flips the book, smiles at the lens",tts="[warm] 你的？早绑好了。")),
 ("J03","yl","是你已经见过的人。","It's someone you have already met.",dict(after=3.6,emo="warm, to the lens, slow",tts="[warm, slowly] 是你已经见过的人。")),
]
lines = []
for n, (id_, who, zh, en, o) in enumerate(R, 1):
    sc = o.pop("screens", None)
    if sc:
        parts = sc.split("|"); ew = en.split(); k = len(parts)
        screens = [{"zh": p, "en": " ".join(ew[i * len(ew) // k:(i + 1) * len(ew) // k])} for i, p in enumerate(parts)]
        assert "".join(parts) == zh, id_
    else:
        screens = [{"zh": zh, "en": en}]
    for s in screens: assert len(s["zh"]) <= 16, (id_, s["zh"])
    lines.append({"n": n, "id": id_, "scene": id_[0], "who": who, "zh": zh, "en": en, "screens": screens, **o})
J = {"film": "yuelao", "version": 1, "source": "script v1, written 26 Nov 2026 from the approved concept (Claude Doc 采访月老的一天: concept and beat outline)",
     "title": {"zh": "采访月老的一天", "en": "A Day Interviewing the Old Man under the Moon"},
     "speakers": SPEAKERS, "scenes": SCENES, "gap": 0.18, "lead": 0.1, "level_target_db": -23.75,
     "engine": {"spoken": {k: "zh" for k in SPEAKERS}, "places": ["office", "work", "street"],
                "title_after": "A05", "title_delay": 0.25, "title_hold": 2.4, "rate_zh": 4.4, "tail_s": 0.4},
     "lines": lines}
json.dump(J, open(os.path.join(HERE, "yuelao_lines.json"), "w"), ensure_ascii=False, indent=1)
print(len(lines), "lines,", sum(len(l["zh"]) for l in lines), "chars")
