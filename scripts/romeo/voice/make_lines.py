#!/usr/bin/env python3
"""SCRIPT V2 of 采访罗密欧与朱丽叶 (22 Nov 2026): the one source for the lines file and the readable script.
  python3 scripts/romeo/voice/make_lines.py            -> scripts/romeo/voice/romeo_lines.json (gen_timing.py's input)
                                                          + /mnt/project-files/next-video/romeo-juliet/script_v2.md
v2 = v1 + the two script reviews (Claude Doc "Review notes" tab) as Claude picked them; Jay handed full control for the
night of 22 Nov ("approve voice recording etc."), so v2 is the approved shooting script unless he changes it.
Speakers: ji = the reporter (Chinese), ro = Romeo, ju = Juliet, fr = Friar Laurence (Shakespeare's English).
A line: (id, who, emotion, zh subtitle, spoken/English, picture-and-sound note, options)
options: screens = [(zh, en), ...] when the line needs more than one subtitle screen; tts = what the voice says (with
ElevenLabs audio tags in [brackets]); pre / after = silence before / hold after (s); card = (zh, en) fact card after it;
also = a second voice at the same moment (the split screen: Romeo's half), rendered as its own clip."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_JSON = os.path.join(HERE, "romeo_lines.json")
OUT_MD = "/mnt/project-files/next-video/romeo-juliet/script_v2.md"

SPEAKERS = {"ji": "记者 (the camera, never seen)", "ro": "罗密欧 Romeo", "ju": "朱丽叶 Juliet", "fr": "劳伦斯神父 Friar Laurence"}
NAMES = {"ji": "记者", "ro": "罗密欧", "ju": "朱丽叶", "fr": "神父"}
SCENES = {
    "A": dict(time="星期日 清晨", label="还不认识朱丽叶", en="Sunday, dawn", place="grove", title="城西树林", note="REC beep, straight in. Music: one lute, comically mournful."),
    "B": dict(time="星期日 夜", label="认识：0分钟", en="Sunday night", place="hall", title="凯普莱特家的舞会", note="Join: the REC clock races, dawn to night. Lute and hand drum, a dance."),
    "C": dict(time="星期日 深夜", label="认识：3小时", en="Sunday, late night", place="balcony", title="阳台上，果园里", note="Join: whip pan. One lute over crickets. Two interviews cut together, switching on every answer (Jay's note): Juliet on her balcony, Romeo crouched in the dark orchard. Hard cuts between lines only."),
    "D": dict(time="星期一 下午", label="认识第1天", en="Monday afternoon", place="cell", title="劳伦斯神父的小屋", note="Join: the REC clock races."),
    "E": dict(time="星期一 傍晚", label="婚礼后一小时", en="Monday, dusk", place="street", title="维罗纳街头", note="THE TURN. Join: match cut, the bell rope to a sword hitting the stones. The music stops mid-bar and stays out until the last scene. No effects."),
    "F": dict(time="星期二", label="认识第2天 · 已婚 · 已分居", en="Tuesday", place="cell", title="神父的小屋，然后朱丽叶的房间", note="Join: the REC clock races. The cell is greyer today."),
    "G": dict(time="星期三 正午", label="认识第3天", en="Wednesday noon", place="mantua", title="曼图亚", note="Join: match cut on the letter, from the young friar's hand to the same letter behind a window being boarded shut (Verona). Fact card while nobody speaks. Then Mantua: flat white noon."),
    "H": dict(time="星期四 凌晨", label="认识第4天", en="Thursday, before dawn", place="tomb", title="凯普莱特家的墓穴", note="THE QUIET SCENE. Join: a hand over the lens. No music, no effects, one slow push for the whole scene."),
    "I": dict(time="星期四 凌晨", label="认识第4天", en="Thursday, before dawn", place="tomb", title="碎片", note="THE NEW ENDING. Black. One jagged shard of picture lights up, low on the floor and tilted, filling at least half the frame, cracks running off it."),
}

L = []
def line(id_, who, emo, zh, en, pic="", **o):
    L.append(dict(id=id_, who=who, emo=emo, zh=zh, en=en, pic=pic, **o))

# ---------------------------------------------------------------- A · Sunday dawn · the grove
line("A01", "ji", "bright, nosy, sure of herself", "罗密欧，为朱丽叶哭呢？", "Romeo, crying over Juliet?",
     "Frame 0, medium close: Romeo hugs a sycamore and bawls, crumpled poems all round him. Still. Subtitle on frame 0.",
     tts="[curious, warm] 罗密欧，为朱丽叶哭呢？", pre=0.15, after=0.1)
line("A02", "ro", "stops dead, blank, one tear hanging", "……朱丽叶是谁？", "…Who is Juliet?",
     "Snap zoom on his blank face by second 3. The lute stops. The REC label stamps in: 还不认识朱丽叶. The title lands in the gap: a folded letter drops in, is sealed with wax (采访 罗密欧与朱丽叶 的一天), and a small wax blob stamps 四 over 一.",
     tts="[sniffling, completely blank] ...Who is Juliet?", after=1.9)
line("A03", "ro", "bursting into sobs again", "是罗瑟琳！她发誓这辈子不恋爱！", "Rosaline! She hath forsworn to love!",
     "He flings an arm up; pages fly. His blue strip slams in and folds into a name tab: 罗密欧 · 恋爱脑.",
     tts="[sobbing dramatically] Rosaline! She hath forsworn to love!")
line("A04", "ro", "eager, sniffing, pushing the letter at the lens", "好心人，替我把信送去！", "Good friend, bear her this!",
     "He pushes a sealed love letter right at the lens.",
     tts="[eager, still sniffling] Good friend, bear her this!")
line("A05", "ji", "flat", "我只拍，不插手。", "I only film. I don't interfere.",
     "The letter droops. Her rule stamps in as a wax tally: 插手 0.", tts="[firm, matter-of-fact] 我只拍，不插手。", after=0.9)

# ---------------------------------------------------------------- B · Sunday night · the Capulets' feast
line("B01", "ji", "whisper", "为了罗瑟琳，混进仇家舞会。", "Sneaking into the enemy's ball, for Rosaline.",
     "Wide: torch-lit hall, dancers. Romeo in a half mask sulks along the wall.", tts="[whispers] 为了罗瑟琳，混进仇家舞会。", pre=0.6)
line("B02", "ro", "struck, the mask slipping", "我以前那也叫爱？", "Did my heart love till now?",
     "He stops mid-step. She tilts along his look to Juliet across the hall, and back.", tts="[awestruck, breathless] Did my heart love till now?")
line("B03", "ji", "innocent", "那罗瑟琳呢？", "And Rosaline?", "", tts="[innocently curious] 那罗瑟琳呢？")
line("B04", "ro", "not blinking, not turning", "谁？", "Who?",
     "Hold. Her note in the gap: 失恋：一个白天.", tts="[distracted, not listening] Who?", after=1.0)
line("B05", "ji", "friendly", "朱丽叶，看上谁了？", "Juliet, who caught your eye?",
     "SWITCH (hard cut) to Juliet's interview across the same hall: on tiptoe, staring back the other way. Mirrored framings: he looks right, she looks left. Her red strip slams in and folds into a tab: 朱丽叶 · 行动派.", tts="[teasing, friendly] 朱丽叶，看上谁了？")
line("B06", "ju", "eyes locked on him, an order", "快去，问他叫什么。", "Go ask his name.",
     "She points without looking at the lens.", tts="[urgent, bossy] Go! Ask his name.")
line("B07", "ji", "flat", "我只拍。", "I only film.", "The tally blinks: 插手 0. Juliet huffs and waves someone else off.", tts="[flat, polite but firm] 我只拍。")
line("B08", "ji", "whisper, to us", "他是她家世仇的独子。", "He's the only son of her family's sworn enemy.",
     "Her whisper (悄悄说): the lens leans in, the edges darken, the room sound dips. Juliet stays in frame, unaware.",
     tts="[whispers] 他是她家世仇的独子。", after=0.5)

# ---------------------------------------------------------------- C · Sunday late night · balcony and orchard
line("C01", "ju", "to the night, sighing", "罗密欧啊罗密欧！你为什么偏偏是罗密欧？", "O Romeo, Romeo! Wherefore art thou Romeo?",
     "Her interview, close on the balcony, the moon behind her. Still.",
     screens=[("罗密欧啊罗密欧！", "O Romeo, Romeo!"), ("你为什么偏偏是罗密欧？", "Wherefore art thou Romeo?")],
     tts="[sighing, dreamy] O Romeo, Romeo! Wherefore art thou Romeo?", pre=0.5)
line("C02", "ji", "whisper", "对方哪里好？", "What's so good about her?", "Switch to his interview: one question, both answer.", tts="[whispers] 对方哪里好？")
line("C03", "ro", "a whisper that turns into a shout, arms wide", "那是东方，朱丽叶就是太阳！", "It is the east, and Juliet is the sun!",
     "He points up out of frame. Snap zoom on 'sun'.", tts="[whispering, then bursting out] It is the east, and Juliet is the sun!")
line("C04", "ji", "dry", "现在是半夜。", "It's midnight.", "Hold on him, arm still up.", tts="[whispers, deadpan] 现在是半夜。")
line("C05", "ju", "dreamy", "我的爱像海一样深，没有边。", "My bounty is as boundless as the sea, my love as deep.",
     "Switch to her. Slow push: the one sincere beat of the first half.", tts="[softly, dreamy] My bounty is as boundless as the sea, my love as deep.")
line("C06", "ji", "dry", "才认识三小时吧？", "You met three hours ago?", "", tts="[deadpan, teasing] 才认识三小时吧？")
line("C07", "ju", "prim, nodding gravely", "是太急，太轻率，太突然了。", "It is too rash, too unadvised, too sudden.",
     "She straightens, hands folded. Then her eyes drift shut.", tts="[primly, very serious] It is too rash, too unadvised, too sudden.")
line("C08", "ju", "lovesick, eyes closed, to herself (Romeo says his half at the same moment)", "罗密欧……罗密欧……", "Romeo… Romeo…",
     "(Jay's idea.) The screen splits: Juliet on top in red, Romeo below in blue, each sighing the other's name twice at the same moment in the same lovey voice, each to themselves. Both stop: each heard something. The two pictures widen until they meet; the line between them is the edge of her balcony: one picture all along. She looks down, he looks up. Her note: 就在楼下.",
     tts="[lovesick sigh] Romeo... Romeo...", also=dict(who="ro", zh="朱丽叶……朱丽叶……", en="Juliet… Juliet…", tts="[lovesick sigh] Juliet... Juliet..."), after=1.6)
line("C09", "ro", "calling up, hand on heart", "小姐，我对着月亮发誓——", "Lady, by yonder blessed moon I swear—",
     "One picture: him below, her at the rail.", tts="[earnest, hand on heart] Lady, by yonder blessed moon I swear—")
line("C10", "ju", "cutting him off", "别对月亮发誓！月亮天天在变！", "O, swear not by the moon, the inconstant moon!",
     "Her note in the gap: 月亮一月一变，他一天。", tts="[cutting in, quick] O, swear not by the moon, the inconstant moon!", after=0.9)
line("C11", "ju", "caught for half a second, then all business, calling down", "你要是真心想娶我，明天给我回话！", "Thy purpose marriage, send me word tomorrow!",
     "Snap zoom on 'marriage'.", tts="[brisk, decisive] Thy purpose marriage, send me word tomorrow!")
line("C12", "ro", "from below, instantly", "九点整！", "At the hour of nine!",
     "Tilt down: he is already running for the wall. Her note: 太突然？", tts="[instantly, thrilled] At the hour of nine!", after=0.9)

# ---------------------------------------------------------------- D · Monday afternoon · the Friar's cell
line("D01", "fr", "eyebrow up, eyes on his herbs", "你昨晚，是跟罗瑟琳在一起？", "Wast thou with Rosaline?",
     "The Friar sorts herbs and small bottles at a bench. Romeo bursts in, glowing. Banner travels with the Friar: 劳伦斯神父 · 草药行家.",
     tts="[dry, knowing] Wast thou with Rosaline?", pre=0.6)
line("D02", "ro", "stiff, one eye on the lens", "这个名字，我已经忘了。", "I have forgot that name.",
     "He shuffles to stand between the Friar and the lens.", tts="[stiffly] I have forgot that name.")
line("D03", "fr", "dry, straight to the lens", "年轻人的爱，不走心，只看脸。", "Young men's love then lies not truly in their hearts, but in their eyes.",
     "He leans round Romeo to say it to her. Snap zoom on 'eyes'.",
     screens=[("年轻人的爱，", "Young men's love then lies"), ("不走心，只看脸。", "not truly in their hearts, but in their eyes.")],
     tts="[wry, amused] Young men's love then lies not truly in their hearts, but in their eyes.")
line("D04", "ji", "amused", "那您还给他们证婚？", "And you'll still marry them?", "", tts="[amused, surprised] 那您还给他们证婚？")
line("D05", "fr", "wagging a finger, slow", "慢慢来。跑得快的，容易摔。", "Wisely and slow; they stumble that run fast.",
     "On 'fast' Juliet sprints in through the bright doorway and skids to a stop.", tts="[slow, wise] Wisely and slow; they stumble that run fast.")
line("D06", "fr", "low, a shadow crossing his face", "爱得越猛，收场越惨。", "These violent delights have violent ends.",
     "The two clasp hands in front of him. A bell. She steps back wide: three small figures in the doorway light (no blessing close-up). Stamp: 认识一天 · 已婚.",
     tts="[quietly, ominous] These violent delights have violent ends.", after=1.4)

# ---------------------------------------------------------------- E · Monday dusk · the street (THE TURN)
line("E01", "ji", "small", "罗密欧？", "Romeo?",
     "Dusk, the street after the duel (v5: the duel itself opens the scene, without words). Romeo with his back to us, his rapier dropped on the stones beside Tybalt's; Tybalt lies behind him. No blood. Still.", tts="[quietly, uneasy] 罗密欧？", pre=5.8)
line("E02", "ro", "hollow, to his own hand", "老天爷在耍我！", "O, I am fortune's fool!",
     "He turns; one slow push; he runs out of frame.", tts="[hollow, shaken] O, I am fortune's fool!")
line("E03", "ji", "whisper, small", "他刚杀了朱丽叶的表哥。", "He just killed Juliet's cousin.",
     "Her whisper on the empty street. Then the fact card while nobody speaks.", tts="[whispers, shaken] 他刚杀了朱丽叶的表哥。",
     after=4.0, card=("判决：驱逐。回来就是死。", "Sentence: banished. Come back and die."))

# ---------------------------------------------------------------- F · Tuesday · the cell, then Juliet's room
line("F01", "ji", "whisper", "爸妈要她后天嫁别人。", "Her parents want her married to another man the day after tomorrow.",
     "Her whisper over the cell: the Friar at the window, Juliet steady beside him.", tts="[whispers] 爸妈要她后天嫁别人。", pre=0.6)
line("F02", "fr", "low, careful", "喝下这瓶药。没有体温，没有呼吸。", "Take thou this vial. No warmth, no breath, shall testify thou livest.",
     "Close on a small bottle held to the window light (the 假死药), Juliet's steady face behind it.",
     screens=[("喝下这瓶药。", "Take thou this vial."), ("没有体温，没有呼吸。", "No warmth, no breath, shall testify thou livest.")],
     tts="[low, careful] Take thou this vial. No warmth, no breath, shall testify thou livest.")
line("F03", "fr", "the same", "四十二个小时后，像睡了一觉一样醒来。", "Two and forty hours, and then awake as from a pleasant sleep.",
     "", screens=[("四十二个小时后，", "Two and forty hours,"), ("像睡了一觉一样醒来。", "and then awake as from a pleasant sleep.")],
     tts="[low, reassuring] Two and forty hours, and then awake as from a pleasant sleep.")
line("F04", "ju", "snatching it before he has finished", "给我，给我！别跟我说怕！", "Give me, give me! O, tell not me of fear!",
     "She takes the bottle out of his hand.", tts="[fierce, impatient] Give me, give me! O, tell not me of fear!")
line("F05", "ji", "worried", "罗密欧知道吗？", "Does Romeo know?", "", tts="[worried] 罗密欧知道吗？")
line("F06", "fr", "already writing, sealing it with red wax", "我写信，把一切告诉罗密欧。", "Shall Romeo by my letters know our drift.",
     "He writes and seals a letter with red wax. Her note in the gap: 信里写着：她是假死.", tts="[busy, writing] Shall Romeo by my letters know our drift.", after=0.9)
line("F07", "fr", "gentle, to the lens", "你，能替我带给罗密欧吗？", "Thou. Wilt thou bear this to Romeo?",
     "He holds the sealed letter out to the lens, exactly as Romeo did in scene 1.", tts="[gently, hopeful] Thou. Wilt thou bear this to Romeo?")
line("F08", "ji", "after a long beat, small", "……我只拍。", "…I only film.",
     "The tally 插手 0 blinks, no sound this time. He nods without blame and gives the letter to a young friar, who leaves. She holds on the empty doorway a second too long.",
     tts="[small, hesitant] ……我只拍。", pre=0.9, after=1.3)
line("F09", "ju", "alone, a small brave smile", "罗密欧，等我。这一杯，敬你。", "Romeo, I come! This do I drink to thee.",
     "Join: the cell door closes over the lens and opens on her room at night. She raises the bottle to the lens like a toast. Cut before it reaches her lips.",
     tts="[softly, brave] Romeo, I come! This do I drink to thee.", pre=1.0, after=1.0)

# ---------------------------------------------------------------- G · Wednesday noon · Mantua
line("G01", "ji", "whisper", "先到的消息：朱丽叶死了。", "The news that got here first: Juliet is dead.",
     "Mantua, a bare street, flat noon light. A rider leaves at the far end. Romeo small in frame, seen from a little above.",
     tts="[whispers] 先到的消息：朱丽叶死了。", pre=4.4,
     card_before=("送信人被瘟疫封了门。信没出城。", "The messenger was shut in by the plague. The letter never left town."))
line("G02", "ro", "white, to the sky", "老天，我不服！", "Then I defy you, stars!", "", tts="[raw, defiant] Then I defy you, stars!")
line("G03", "ro", "a last hope, straight to the lens", "神父没有托你带信给我？", "Hast thou no letters to me from the friar?",
     "He walks up to the lens. The camera holds still.", tts="[desperate hope] Hast thou no letters to me from the friar?")
line("G04", "ji", "barely", "……没有。", "…No.", "", tts="[barely audible] ……没有。")
line("G05", "ro", "flat", "……无所谓了。", "No matter.",
     "He turns away. A small dark bottle goes into his coat.", tts="[flat, empty] No matter.", after=0.3)
line("G06", "ji", "urgent", "等等，她没——", "Wait, she's not—", "He is already walking off; he does not turn.", tts="[urgent, cut off] 等等，她没——")
line("G07", "ji", "whisper, cracking", "她没死。他没听完。", "She isn't dead. He didn't hear the rest.",
     "Plain words, no bubble. From here every effect is gone. He walks off; she does not follow at once.",
     tts="[whispers, voice cracking] 她没死。他没听完。", after=1.0)

# ---------------------------------------------------------------- H · Thursday before dawn · the tomb (THE QUIET SCENE)
line("H01", "ro", "soft, wondering", "死神，还没能夺走你的美。", "Death hath had no power yet upon thy beauty.",
     "Torchlight. Juliet on a stone bier, hands folded. Romeo kneels beside her.", tts="[soft, wondering] Death hath had no power yet upon thy beauty.", pre=1.5)
line("H02", "ro", "the same", "你的嘴唇，你的脸，还是红的。", "Beauty's ensign yet is crimson in thy lips and in thy cheeks.",
     "His hand near her cheek, not touching.", screens=[("你的嘴唇，你的脸，", "Beauty's ensign yet is crimson"), ("还是红的。", "in thy lips and in thy cheeks.")],
     tts="[tender, quiet] Beauty's ensign yet is crimson in thy lips, and in thy cheeks.")
line("H03", "ji", "out loud, shaking", "红的，是因为她活着！", "They're red because she's alive!",
     "She says it out loud this time. He does not turn. Picture still; only her voice shakes.", tts="[desperate, voice shaking] 红的，是因为她活着！")
line("H04", "ro", "calm", "这一杯，敬我的爱人。", "Here's to my love!",
     "He raises the dark bottle with the same gesture Juliet used in F09. It never reaches his lips.", tts="[calm, tender] Here's to my love!")
line("H05", "ji", "breaking", "我只拍，不插……不拍了！", "I only film, I don't inter— I'm done filming!",
     "The picture lurches. The camera leaves her hands: torch streaks, the bier, his hand filling the frame. Glass breaks. Stone. A crack splits the picture. Black. The REC display stutters and dies. Two seconds of silence.",
     tts="[breaking] 我只拍，不插……[shouting] 不拍了！", after=5.4)

# ---------------------------------------------------------------- I · the shard
line("I01", "ju", "waking, soft", "我的罗密欧呢？", "Where is my Romeo?",
     "Through the shard: the spilled bottle on the stones, his empty hand. He stares at the hand, then towards where it came from. Behind him her fingers move. She sits up. He turns. They hug; it holds four seconds. The lute returns, slow.",
     tts="[waking, drowsy, soft] Where is my Romeo?", pre=2.2, after=4.0)
line("I02", "ju", "over his shoulder, puzzled", "神父的信，你没收到？", "Did the friar's letter not reach thee?", "Still in the hug.",
     tts="[puzzled] Did the friar's letter not reach thee?")
line("I03", "ro", "blank", "什么信？", "What letter?", "Both turn slowly and look up past the shard, to where she is standing.", tts="[blank] What letter?", after=0.8)
line("I04", "ji", "tiny", "……拍不了了。我送。", "…I can't film any more. I'll deliver it.",
     "In the cracked glass the tally turns to 插手 1. The shard flickers. Power-off sound. Black. End card on parchment: 从相识到墓穴，一共四天。原著里，信没有送到，两个人都没能活下来。这个结局，是记者扔出来的。 Seal: 演绎.",
     tts="[tiny, sheepish, after a pause] 拍不了了。我送。", after=6.0)


def lines_json():
    out, n = [], 0
    for l in L:
        n += 1
        screens = l.get("screens") or [(l["zh"], l["en"])]
        d = {"n": n, "id": l["id"], "scene": l["id"][0], "who": l["who"], "zh": l["zh"], "en": l["en"],
             "screens": [{"zh": z, "en": e} for z, e in screens], "emo": l["emo"], "pic": l["pic"]}
        if l.get("tts"): d["tts"] = l["tts"]
        for k in ("pre", "after"):
            if k in l: d[k] = l[k]
        if l.get("card"):
            d["card"] = {"zh": l["card"][0], "en": l["card"][1]}; d["card_hold"] = l.get("card_hold", 3.6); d["card_delay"] = 0.2
        if l.get("card_before"): d["card_before"] = {"zh": l["card_before"][0], "en": l["card_before"][1]}
        if l.get("also"): d["also"] = l["also"]
        out.append(d)
    return {
        "film": "romeo", "version": 2,
        "source": "script v2 (22 Nov 2026): /mnt/project-files/next-video/romeo-juliet/script_v2.md, from scripts/romeo/voice/make_lines.py",
        "title": {"zh": "采访罗密欧与朱丽叶的一天", "en": "A Day Interviewing Romeo and Juliet"},
        "speakers": SPEAKERS,
        "scenes": {k: {"time": v["time"], "en": v["en"], "place": v["place"], "label": v["label"]} for k, v in SCENES.items()},
        "gap": 0.25, "lead": 0.1,
        "engine": {"spoken": {"ji": "zh", "ro": "en", "ju": "en", "fr": "en"}, "places": sorted({v["place"] for v in SCENES.values()}),
                   "title_after": "A02", "title_delay": 0.15, "title_hold": 2.6, "rate_zh": 4.2, "rate_en": 2.4},
        "lines": out,
    }


def script_md():
    zh_ji = sum(len([c for c in l["zh"] if '一' <= c <= '鿿']) for l in L if l["who"] == "ji")
    en_words = sum(len(l["en"].split()) for l in L if l["who"] != "ji")
    s = ["# 采访罗密欧与朱丽叶 · Script v2 (22 Nov 2026)", "",
         "Status: **approved on Jay's behalf** (he handed full control for the night of 22 Nov, \"approve voice recording etc.\"). "
         "v1 is unchanged in `script_v1.md` for comparison. What changed and why: the doc's \"Review notes\" tab "
         "(https://claude.ai/artifact/4RfcKCyy65j3Uqx6ahubv7#8ceeca9a-be2c), applied as Claude picked them:", "",
         "1. **Hook**: her first question assumes the famous love story (罗密欧，为朱丽叶哭呢？) and he answers ……朱丽叶是谁？ by second 3.",
         "2. **One rule, one phrase**: 我只拍，不插手。 then 我只拍。 then ……我只拍。 then 我只拍，不插……不拍了！ The tally reads 插手 0, and 1 at the end.",
         "3. **Mantua logic hole closed**: she tries to tell him (等等，她没——) and he is gone before she finishes; at the tomb she says it out loud and he does not turn. The throw is the only thing faster than him.",
         "4. **Cards became her whispers** in the second half (他刚杀了朱丽叶的表哥。 / 爸妈要她后天嫁别人。 / 先到的消息：朱丽叶死了。), and the letter's content is said once (信里写着：她是假死).",
         "5. **Restored lines** (time is no longer tight): the moon exchange, the Friar's \"Wisely and slow; they stumble that run fast\" as Juliet sprints in, Juliet's \"Give me, give me!\".",
         "6. **Name tabs**: a name and one tag (罗密欧 · 恋爱脑, 朱丽叶 · 行动派, 劳伦斯神父 · 草药行家).",
         "7. **The clock**: Sunday to Thursday dawn; the REC label counts how long they have known each other (认识第4天 at the tomb); the title keeps 的一天 and a wax 四 is stamped over 一; the end card opens 从相识到墓穴，一共四天。",
         "8. **Ending**: no 失败 stamp; 插手 1 lands after the last line, the shard fills at least half the frame, and her last line is ……拍不了了。我送。",
         "9. **Platform**: no liquid ever reaches a mouth on screen; the bottle is the 假死药; no 毒 / 殉情 / 自杀 in the title, cover or tags; no cross or altar; 瘟疫 and 封门, never 密接 / 隔离 / 封控.", "",
         f"Counts: {len(L)} lines; the reporter {sum(1 for l in L if l['who']=='ji')} lines ({zh_ji} 字); the leads and the Friar {sum(1 for l in L if l['who']!='ji')} lines ({en_words} English words). "
         "The leads speak Shakespeare's English (large Chinese subtitle, small English under it); the reporter speaks Chinese (Chinese only).", "",
         "Format per line: `#  ROLE [emotion]  中文字幕  |  spoken English (reporter: the gloss, not shown)  ||  picture / sound`", ""]
    for k, sc in SCENES.items():
        s += [f"## Scene {k} · {sc['time']} · {sc['title']} · REC label: {sc['label']}", sc["note"], ""]
        for l in [x for x in L if x["id"][0] == k]:
            role = NAMES[l["who"]] + ("（悄悄说）" if l["who"] == "ji" and "whisper" in l["emo"] else "")
            row = f"**{l['id']}** {role} [{l['emo']}] {l['zh']}  |  {l['en']}"
            if l.get("also"): row += f"  ＋ 罗密欧（同时） {l['also']['zh']}  |  {l['also']['en']}"
            if l["pic"]: row += f"  ||  {l['pic']}"
            if l.get("card_before"): row = f"*Card while nobody speaks:* {l['card_before'][0]}\n\n" + row
            if l.get("card"): row += f"  ||  *Card while nobody speaks:* {l['card'][0]}"
            s += [row, ""]
    s += ["## Notes", "- English lines are Shakespeare's words (Moby text, checked against `play_text_bosak_moby.tsv`) except A02, A03's \"Rosaline!\", A04, B04, C08, F07, I02, I03.",
          "- Invented: the reporter; the Friar offering her the letter (F07); all of scene I. In the play both die.",
          "- Not on screen: Mercutio, the Nurse, Paris, the apothecary, the parents. Juliet's age is never said; the hug is the only touch.",
          "- Decided with full control (Jay can still change any): keep the Friar's offer (F07-F08), keep the last laugh (I02-I04), title 的一天 with a wax 四 over 一."]
    return "\n".join(s) + "\n"


if __name__ == "__main__":
    with open(OUT_JSON, "w", encoding="utf-8") as f: json.dump(lines_json(), f, ensure_ascii=False, indent=1)
    os.makedirs(os.path.dirname(OUT_MD), exist_ok=True)
    with open(OUT_MD, "w", encoding="utf-8") as f: f.write(script_md())
    print(f"wrote {OUT_JSON} ({len(L)} lines) and {OUT_MD}")
