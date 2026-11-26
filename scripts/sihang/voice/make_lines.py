#!/usr/bin/env python3
"""采访八百壮士的一天 (film: sihang): the script as data -> scripts/sihang/voice/sihang_lines.json (the day engine's lines
file: src/kit/day/README.md). Script v1 is the Claude Doc "采访八百壮士的一天 · 剧本 v1" (25 Nov 2026); changes since:
  - the hook is SPOKEN (her whisper over the head count), so her "我数了，四百二十" is gone (said once, not twice);
  - 杨瑞符's line moved from 27 Oct to the evening of 28 Oct, where his own diary puts it (孤军奋斗四日记: said to the
    wounded sent out that evening; 苏智良 / 胡皓磊, 澎湃 2020);
  - every man speaks with the accent of his home (the owner, 26 Nov): 满仓 湖北, 老班长 河南 (咱 for 我们), 杨瑞符 天津,
    谢晋元 广东, the fellow reporter 上海. The two officers' lines are sourced quotes: not one character is changed.
Run: python3 scripts/sihang/voice/make_lines.py   then   python3 scripts/kit/day/gen_timing.py --film sihang --placeholder
"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))

SPEAKERS = {
    "ji": "记者 (the camera, never seen; standard Mandarin)",
    "mc": "满仓 (演绎人物, 19, 湖北通城)",
    "lb": "老班长 (演绎人物, 河南)",
    "xj": "谢晋元 (中校团附, 广东蕉岭; sourced quotes only)",
    "yr": "杨瑞符 (营长, 天津; sourced quote only)",
    "cl": "传令兵",
    "th": "同行记者 (上海)",
}
SCENES = {
    "A": {"time": "10月26日 深夜", "en": "26 Oct, late night", "place": "hall"},
    "B": {"time": "10月26日 深夜", "en": "26 Oct, late night", "place": "hall"},
    "C": {"time": "10月27日 上午", "en": "27 Oct, morning", "place": "hall"},
    "D": {"time": "10月28日 拂晓", "en": "28 Oct, dawn", "place": "hall"},
    "E": {"time": "10月28日 晚", "en": "28 Oct, evening", "place": "hall"},
    "F": {"time": "10月28日 夜", "en": "28 Oct, night", "place": "hall"},
    "G": {"time": "10月30日 夜", "en": "30 Oct, night", "place": "hall"},
    "H": {"time": "10月31日 凌晨", "en": "31 Oct, before dawn", "place": "bridge"},
}
# [id, who, screens (zh), en, {pre, after, tts, emo, pic, whisper}]
L = [
    # ------------------------------------------------------------------ A · 26 Oct, late night: into the building
    ["A01", "ji", ["他们说，这里有八百人。"], "They say there are eight hundred men in here.", {"pre": 0.15, "after": 0.1, "tts": "[whispers] 他们说，这里有八百人。", "whisper": True, "pic": "Frame 0: lamp light, soldiers hauling grain sacks to the windows; the camera pans along them."}],
    ["A02", "ji", ["我数了三遍——", "四百二十。"], "I counted three times: four hundred and twenty.", {"after": 0.55, "tts": "[whispers, flat] 我数了三遍——四百二十。", "whisper": True, "pic": "The head count lands on three helmets: 418, 419, 420."}],
    ["A03", "ji", ["你们这儿，多少人？"], "How many of you are here?", {"pre": 0.15, "tts": "[curious, bright] 你们这儿，多少人？"}],
    ["A04", "mc", ["八百！"], "Eight hundred!", {"after": 0.95, "emo": "at once, proud, loud", "pic": "满仓 with a sack on his shoulder, helmet a size too big."}],
    ["A05", "mc", ["……对外，都讲八百。"], "...To outsiders, we all say eight hundred.", {"after": 2.7, "emo": "lower, a glance round, a small grin", "pic": "The title: a 号外 front page slams on."}],
    ["A06", "mc", ["我叫满仓。", "这回，仓真是满的。"], "I'm Mancang, 'full barn'. This time the barn really is full.", {"pre": 3.3, "after": 1.5, "emo": "shy, pleased with his own joke", "pic": "The unit's clipping card over the live picture, then his banner; the sacks piled to the ceiling."}],
    # ------------------------------------------------------------------ B · the same night: which one is the commander
    ["B01", "ji", ["哪位是谢团附？"], "Which one is Commander Xie?", {"pre": 0.9, "tts": "[curious] 哪位是谢团附？"}],
    ["B02", "mc", ["我也不认得。", "我才来三个月。"], "I don't know him either. I've only been here three months.", {"after": 0.5, "emo": "honest shrug"}],
    ["B03", "lb", ["全楼，就一个坐着的。"], "Only one man in this building is sitting down.", {"after": 1.5, "emo": "dry, not looking up", "pic": "The camera pans to the one man seated at a crate, writing by a lamp."}],
    ["B04", "ji", ["团附，写什么呢？"], "Commander, what are you writing?", {"tts": "[gently, respectful] 团附，写什么呢？"}],
    ["B05", "xj", ["晋元决心殉国，", "誓不轻易撤退，", "亦不作片刻偷生之计。"], "I am resolved to die for my country. I swear not to retreat lightly, nor to seek a moment's survival.", {"pre": 0.7, "after": 2.2, "emo": "calm, even, as he writes; no heroics", "pic": "His banner; the seal 原话 · 遗书. He folds it, hands it to a runner, looks at the lens, nods."}],
    ["B06", "mc", ["记者，对面亮的是么事？"], "Reporter, what's that shining over there?", {"pre": 1.0, "emo": "wonder, quiet", "pic": "Through the window slit: neon across the Suzhou Creek, sixty metres away."}],
    ["B07", "ji", ["霓虹灯。"], "Neon lights.", {"tts": "[softly] 霓虹灯。"}],
    ["B08", "mc", ["……上海，真亮啊。"], "...Shanghai is so bright.", {"pre": 0.4, "after": 1.6, "emo": "a breath, a country boy", "pic": "His face half warm lamp, half cold neon. Hold two seconds."}],
    ["B09", "mc", ["记者，你会写字吧？"], "Reporter, you can write, can't you?", {"emo": "shy, sudden"}],
    ["B10", "ji", ["写给谁？"], "To whom?", {"tts": "[warm] 写给谁？", "pic": "A pencil and a warehouse goods slip come into the frame."}],
    ["B11", "mc", ["我娘。……就写：娘，儿在上海。", "住的洋楼，高得很。"], "My ma. ...Write: Ma, I'm in Shanghai. I live in a foreign-style building, very tall.", {"after": 0.6, "emo": "dictating slowly, proud", "pic": "The letter's first line appears on the goods slip."}],
    ["B12", "mc", ["后面的，我再想想。"], "The rest, I'll think about.", {"after": 1.3, "emo": "scratching his helmet", "pic": "The REC clock runs to 27 Oct 08:20; the neon goes out, daylight."}],
    # ------------------------------------------------------------------ C · 27 Oct, morning: a river apart
    ["C01", "lb", ["东边，准备。"], "East side. Ready.", {"pre": 4.2, "after": 1.1, "emo": "low, level", "pic": "First the south bank: roofs and balconies full of people; a blackboard. Then the attack: the camera ducks behind the sacks."}],
    ["C02", "lb", ["这是咱的。"], "That one's ours.", {"after": 0.55, "emo": "counting shots like weather"}],
    ["C03", "lb", ["这也是咱的。"], "That one's ours too.", {"after": 0.55}],
    ["C04", "lb", ["——这是他们的。"], "...That one's theirs.", {"after": 1.3, "emo": "same tone", "pic": "His hand presses the camera down. A sack over her leaks wheat."}],
    ["C05", "ji", ["……谢谢。"], "...Thank you.", {"after": 1.6, "tts": "[whispers, shaken] ……谢谢。", "whisper": True, "pic": "Silence. Then cheering from across the river."}],
    ["C06", "mc", ["他们……给我们喊好？"], "They're... cheering for us?", {"pre": 0.3, "after": 1.2, "emo": "amazed"}],
    ["C07", "ji", ["几点换班呀？"], "What time is the shift change?", {"pre": 0.6, "tts": "[innocently] 几点换班呀？"}],
    ["C08", "lb", ["换班？", "四百二十个人，守一栋楼……"], "Shift change? Four hundred and twenty men, holding one building...", {"emo": "a tired half laugh"}],
    ["C09", "mc", ["八百。"], "Eight hundred.", {"emo": "correcting him, serious"}],
    ["C10", "lb", ["对，八百。", "——八百也不换。"], "Right, eight hundred. ...Eight hundred don't change shifts either.", {"after": 1.7, "emo": "dry", "pic": "Seal: four days and nights, no relief. Shell dust whites the lens out."}],
    # ------------------------------------------------------------------ D · 28 Oct, dawn: the window (no effects, no music)
    ["D01", "lb", ["在挖墙脚。要炸楼。"], "They're digging at the foot of the wall. To blow the building.", {"pre": 2.4, "after": 1.8, "emo": "very low", "pic": "Digging under the wall. A young soldier, back to us, ties grenades on and steps onto the sill."}],
    ["D02", "ji", ["你——"], "You...", {"after": 7.6, "tts": "[startled, breaking off] 你——", "pic": "The window is empty. A blast below; dust drifts in. Hold. White words: 陈树生，二十一岁。 满仓 takes off his helmet. Black."}],
    # ------------------------------------------------------------------ E · 28 Oct, evening: the first letter home
    ["E01", "yr", ["你们就说有八百人，", "决不可说只有一营人。"], "Say there are eight hundred men. Never say there is only one battalion.", {"pre": 1.6, "after": 1.7, "emo": "gruff, low, to the wounded on the stretchers", "pic": "The wounded are carried out at the back. His banner; the seal 原话."}],
    ["E02", "mc", ["原来他就是谢团附。"], "So that's Commander Xie.", {"pre": 1.6, "after": 0.4, "emo": "a whisper of surprise", "pic": "The companies stand in rows. The battalion commander brings forward the man who was writing."}],
    ["E03", "xj", ["与最后阵地共存亡。"], "We live or die with this last position.", {"pre": 0.5, "after": 2.4, "emo": "level, to every man", "pic": "The seal 原话 · 10月28日晚. Paper is handed down the rows; pencils."}],
    ["E04", "ji", ["接着写？"], "Shall we go on?", {"pre": 0.7, "tts": "[softly] 接着写？", "pic": "From here no effects: one slow push."}],
    ["E05", "mc", ["写……顿顿有粮吃，", "粮食堆到房顶。"], "Write... there's grain at every meal. Grain piled up to the roof.", {"after": 1.0, "emo": "searching, then pleased", "pic": "Behind him the sack wall, shot through, leaking."}],
    ["E06", "mc", ["我们人多，有八百人。", "莫挂念。"], "There are a lot of us, eight hundred. Don't worry.", {"after": 0.6, "emo": "steady"}],
    ["E07", "ji", ["……八百？"], "...Eight hundred?", {"after": 0.5, "tts": "[very softly] ……八百？"}],
    ["E08", "mc", ["写八百。", "娘听了放心。"], "Write eight hundred. Ma will rest easy when she hears it.", {"after": 1.2, "emo": "simple, sure; nobody laughs"}],
    ["E09", "lb", ["他娘不识字。", "信到了，村里先生念给她听。"], "His mother can't read. When it comes, the village teacher reads it to her.", {"pre": 0.3, "after": 3.0, "emo": "aside, quiet", "pic": "满仓 presses a thumbprint in lamp soot. The push ends on three lines and the print."}],
    # ------------------------------------------------------------------ F · 28 Oct night to 29 Oct dawn: sent from across the river
    ["F01", "mc", ["记者先吃。"], "Reporter eats first.", {"pre": 3.8, "after": 0.4, "emo": "generous, grinning", "pic": "A rope through the wall hole: sacks of bread, biscuits, tins, medicine. He holds a tin out to the lens."}],
    ["F02", "ji", ["……没有拉环？"], "...No pull tab?", {"after": 0.5, "tts": "[whispers, puzzled] ……没有拉环？", "whisper": True}],
    ["F03", "lb", ["城里人。"], "City folk.", {"after": 1.3, "emo": "dry", "pic": "He opens it with his bayonet."}],
    ["F04", "lb", ["八百孤军，死守四行。"], "Eight hundred lone soldiers hold Sihang to the death.", {"pre": 0.9, "after": 0.5, "emo": "reading a headline slowly", "pic": "A newspaper from under the sacks: the front page close up."}],
    ["F05", "mc", ["……登报了？", "我娘看得见不？"], "...We're in the paper? Can my ma see it?", {"emo": "eyes wide"}],
    ["F06", "lb", ["村里先生看得见。"], "The village teacher can.", {"after": 1.2, "emo": "kindly"}],
    ["F07", "lb", ["旗。对岸一个女学生送来的。"], "A flag. A schoolgirl brought it over from the other bank.", {"pre": 0.9, "after": 9.4, "emo": "quiet, almost to himself", "pic": "A roll of cloth. The seal. Then dawn on the roof: the flag's shadow slides over upturned faces; the south bank roars; a blackboard."}],
    # ------------------------------------------------------------------ G · 30 Oct, night: a shell a second
    ["G01", "lb", ["鬼子给开的窗。"], "A window, courtesy of the enemy.", {"pre": 3.2, "after": 0.8, "emo": "dry, loud over the guns", "pic": "Searchlights, shells. The west wall is holed; he sets the machine gun in the new hole."}],
    ["G02", "mc", ["记者！信上再加一句！"], "Reporter! Add one more line to the letter!", {"pre": 0.4, "emo": "shouting over the shelling"}],
    ["G03", "ji", ["加什么？"], "Add what?", {"tts": "[shouting over noise] 加什么？"}],
    ["G04", "mc", ["等打完仗——", "我回去割稻！"], "When the fighting's done, I'm going home to cut the rice!", {"after": 2.2, "emo": "shouting, almost laughing", "pic": "The fourth line, shaky. The battery: 7%. Midnight: the field telephone rings."}],
    ["G05", "cl", ["命令——全营撤进租界！"], "Orders: the whole battalion withdraws into the Settlement!", {"pre": 1.5, "after": 0.6, "emo": "out of breath, loud"}],
    ["G06", "mc", ["撤？不是讲共存亡吗？"], "Withdraw? Didn't we say live or die here?", {"emo": "stunned, hurt"}],
    ["G07", "lb", ["是命令。"], "It's an order.", {"after": 2.4, "emo": "flat, heavy", "pic": "谢晋元 looks back at the building. A searchlight whites the lens out."}],
    # ------------------------------------------------------------------ H · 31 Oct, before dawn: across the bridge
    ["H01", "mc", ["低头！"], "Head down!", {"pre": 2.2, "after": 2.0, "emo": "a shout", "pic": "The bridge under searchlights; they run in batches; his hand presses the camera down."}],
    ["H02", "mc", ["记者，信。"], "Reporter. The letter.", {"pre": 3.0, "after": 0.6, "emo": "out of breath, small", "pic": "South side. Rifles are piled up; he holds his a second, then lets go. The goods slip: four lines and a thumbprint."}],
    ["H03", "ji", ["放心。"], "I've got it.", {"after": 1.5, "tts": "[softly, steady] 放心。", "pic": "The battery: 2%, the red lamp blinking."}],
    ["H04", "th", ["喂——", "里面到底多少人？"], "Hey! How many were really in there?", {"pre": 0.9, "after": 2.4, "emo": "shouting from behind the cordon, a newsman", "pic": "The camera looks back: 满仓, 老班长, the tired line of men."}],
    ["H05", "ji", ["八百。"], "Eight hundred.", {"after": 18.3, "tts": "[quiet, sure, after a breath] 八百。", "pic": "The battery dies. Black. The end slate: five white lines."}],
]

def split_en(en, screens):
    """the line's English cut into as many pieces as it has screens, in proportion to the screens' lengths (the film is
    Chinese only: the English is never drawn, but the generator wants the pieces to spell the line)"""
    w, n = en.split(" "), len(screens)
    if n == 1: return [en]
    if len(w) < n: w = w + ["."] * (n - len(w))
    tot, out, i = sum(len(x) for x in screens), [], 0
    for k, sc in enumerate(screens):
        left = n - k - 1
        take = len(w) - i - left if k == n - 1 else max(1, min(len(w) - i - left, round(len(w) * len(sc) / tot)))
        out.append(" ".join(w[i:i + take])); i += take
    return out

def main():
    lines = []
    for n, (id_, who, screens, en, o) in enumerate(L, 1):
        zh = "".join(screens)
        # the English of a screen: the whole line's on its first screen (the film is Chinese only; English is never drawn)
        d = {"n": n, "id": id_, "scene": id_[0], "who": who, "zh": zh, "en": en,
             "screens": [{"zh": s, "en": e} for s, e in zip(screens, split_en(en, screens))]}
        for k in ("pre", "after", "emo", "pic", "tts", "whisper"):
            if k in o: d[k] = o[k]
        lines.append(d)
    out = {
        "film": "sihang", "version": 1,
        "source": "script v1 (Claude Doc 采访八百壮士的一天 · 剧本 v1, 25 Nov 2026) with the changes in scripts/sihang/voice/make_lines.py",
        "title": {"zh": "采访八百壮士的一天", "en": "A Day Interviewing the Eight Hundred"},
        "speakers": SPEAKERS, "scenes": SCENES, "gap": 0.25, "lead": 0.1,
        # the lines arrive at about -20 dBFS speech RMS; the house level is Newton's (-23.75), which the mix's +6.2 dB master gain expects
        "level_target_db": -23.75,
        # the hot syllables' clip gain (scripts/sihang/voice/hot.py writes it; assemble.py applies it; path from the repo root)
        "voice": {"clip_gain": "scripts/sihang/voice/clip_gain.json"},
        "engine": {"spoken": {k: "zh" for k in SPEAKERS}, "places": ["hall", "roof", "bridge"], "title_after": "A05", "title_delay": 0.2, "title_hold": 2.5, "rate_zh": 4.0, "tail_s": 0.4},
        "lines": lines,
    }
    p = os.path.join(HERE, "sihang_lines.json")
    json.dump(out, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("wrote", p, len(lines), "lines")

if __name__ == "__main__":
    main()
