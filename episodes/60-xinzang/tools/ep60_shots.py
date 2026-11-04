"""ep60 shot list: compute reading-budget timings and character widths, emit the markdown table.
Duration per line = 0.5 + n/7 + 0.6 (pacing skill), min 2.0 s, plus a named extra for planned beats."""
import re, sys, json

# (act, sub, facts, music, picture, sfx, extra, tag)
S = []
def add(act, sub, facts, music, picture, sfx, extra=0.0, tag=''):
    S.append(dict(act=act, sub=sub, facts=facts, music=music, picture=picture, sfx=sfx, extra=extra, tag=tag))

# ---------------- HOOK ----------------
add('Hook', '你死后，[脑子]会被扔掉。', 'F12', 'sting',
    'Frame 0, STARRY LAPIS: extreme close-up of a jackal-masked embalmer (Anubis mask, black and gold, eyes catching torchlight). He flicks a small grey knot-shape over his shoulder; it arcs out of frame into a reed basket (flat icon, no anatomy). Push-in 100→112 %.',
    'Frame 0: finger-cymbal crash + low dum. Whoosh on the toss; soft "thup" as it lands in the basket.', 0.2)
add('Hook', '[心]，却要留下来——', 'F11', 'tension',
    'Match on the arc: the camera follows it down onto a linen-wrapped mummy; a red-gold heart glows through the chest wrappings (glow masked inside the body), pulsing. Tilt down + push.',
    'Two heartbeats (thump-thump) locked to the two glow pulses.')
add('Hook', '因为它要上[秤]，出庭作证。', 'F32, F18', 'tension',
    'The glowing heart (drawn as the papyri\'s jar-shaped heart) drops onto the left pan of a giant gold balance; a single white ostrich feather on the right pan. Fast pull-back: the scale is three storeys tall; under it two yellow eyes open in the dark (Ammit, not yet seen).',
    'Heavy metal CLANG + chain rattle on the drop; low growl under the eyes.', 0.2)
add('Hook', '(TITLE) 《死后称心脏》', '—', 'mystic',
    'TITLE CARD over the slowly swinging scale: 《死后称心脏》 in gold inside a cartouche-shaped frame; the feather sways; gold dust drifts across starry lapis. Slow push. Holds 3.0 s (house rule ≥ 2.5 s).',
    'Deep gong on the title; sand hiss; the D-Hijaz reed motif (egypt_music.py) enters.', 0.0, 'TITLE')

# ---------------- ACT 1: you die ----------------
add('1 You die', '假如你死在[3000多年前]的埃及。', 'F8, F9', 'mystic',
    'WARM PAPYRUS. Thebes at sunset: palms, a sail on the Nile, mud-brick houses. You (young scribe, white kilt, reed pen behind the ear) set down your palette; a blue lotus slips from your hand. Slow crane down. Stamp: 「约公元前1250年 · 底比斯」.',
    'Nile water lapping; reed pen taps the wooden palette; lotus lands softly.')
add('1 You die', '祭司花[70天]，把你做成木乃伊。', 'F14, F13', 'groove',
    'Embalming tent. A priest in an Anubis mask winds linen round you; time-lapse: the sun arcs over the tent again and again; four canopic jars slide into a row beside the bed; corner counter rolls 第1天 → 第70天.',
    'Linen swish on each wrap; four clay clunks as the jars land (on the beat); counter ticks.')
add('1 You die', '脑子？从鼻子里[勾]出来，扔了。', 'F12', 'playful',
    'Playful and stylised (no body interior): the masked priest twirls a long bronze hook like a conductor\'s baton; a cartoon grey puff pops up at frame left and he tosses it backward into a basket without looking (callback to frame 0).',
    'Comic "boing" on the twirl; basket "thup".')
add('1 You die', '古埃及人认为：心记着你的[一切]。', 'F15', 'mystic',
    'X-ray glow inside the mummy: only the heart is lit. It opens like a lantern; tiny papyrus-style vignettes of your life flicker inside (a boy learning to write, counting grain at work, a market quarrel). One vignette, you nudging a weight on a market scale, flashes red for a frame.',
    'Paper flutter per vignette; a tiny "ting" on the red flash; heartbeat under.')
add('1 You die', '胸口再压一只[甲虫]——记住它。', 'F16', 'mystic',
    'Top-down: a hand lays a green-stone heart scarab in a gold mount on the linen over the heart; a gold ring of light circles it (playful freeze-frame highlight); tilt shows tiny hieroglyphs on its underside.',
    'Stone tap on linen; small bright chime on the highlight ring.')

# ---------------- ACT 1b: the ready-made guide ----------------
add('1b The guide', '你还带着一卷[《亡灵书》]——', 'F1', 'groove',
    'WARM PAPYRUS. A papyrus roll tied with linen string is laid in the coffin beside you; the string slips and the roll whips open across the 4:3 frame like a banner: bright vignettes of gods, gates, a scale.',
    'String snap; long papyrus unrolling whoosh.')
add('1b The guide', '它本名叫《[白昼出行之书]》。', 'F2', 'groove',
    'Dawn light rakes across the open banner; its hieroglyph title glows gold; a human-headed ba bird flies out of a tomb door into sunlight.',
    'Wing flaps; a bright riq shake.')
add('1b The guide', '来世说明书，约[200]条咒语。', 'F1, F3', 'playful',
    'A Theban scribe\'s stall: the vendor flips spell sheets like a menu; a rich client points (this one, that one); chosen sheets fly into a pile.',
    'Rapid papyrus flips on the eighth notes; a reed pen "tap" on each pick.')
add('1b The guide', '而且是[现货]：名字那里空着。', 'F4', 'playful',
    'Close-up of a finished scroll: every picture painted, gods coloured in; where the owner\'s name belongs, an empty gap. The gap blinks with a white outline.',
    'One bright "ding" on the blink.', 0.2, 'CB1')
add('1b The guide', '阿尼纸草，名字就是[后填]的。', 'F5, F9', 'playful',
    'REAL ANCHOR: the Ani papyrus redrawn in a museum case, small label 「大英博物馆 EA 10470」. A reed pen writes Ani\'s name into the gap in a slightly different ink. Vertical name label 「书吏 阿尼」.',
    'Reed pen scratch; soft glass-case hum.', 0.0, 'CB1')

# ---------------- ACT 2: the road ----------------
add('2 The road', '下葬后，你上路了：去[冥界]。', 'F25', 'tension',
    'STARRY LAPIS. You (white linen, faintly glowing) walk down a tomb shaft that opens onto a dark river under stars; a sun-boat silhouette far off. Drift forward.',
    'Stone door grinds shut behind you; night wind.')
add('2 The road', '一道道门，守门的手里拿着[刀]。', 'F25', 'tension',
    'BLOOD RED. A pylon gate; squatting animal-headed guardians flank it, each holding a knife; the knives glint one after another as the camera trucks past.',
    'A knife "shing" on each glint.')
add('2 The road', '蛇和鳄鱼扑过来，全靠[咒语]挡。', 'F25', 'tension',
    'A cobra rears and a crocodile lunges at the lens; you lift the scroll, a line of gold glyphs flares off it and both recoil; beetles scatter.',
    'Hiss; jaw snap; gold flare "whoomp"; beetle skitter.', 0.3)

# ---------------- ACT 3: the hall and the 42 ----------------
add('3 The hall', '终点：[双真理之厅]。', 'F26', 'mystic',
    'BIG REVEAL, LAPIS + GOLD: a vast hall, lapis ceiling with gold stars, papyrus-bundle columns; the giant scale at the centre; you, tiny, at the door. Crane up and back.',
    'Huge doors boom open; footsteps echo.', 0.6)
add('3 The hall', '[42]位神排排坐，等着你。', 'F27', 'mystic',
    'Two long rows of seated judges (mummiform bodies, animal and human heads, each holding a feather or a knife) recede into the dark; truck along the row. Vertical label 「四十二判官」.',
    'Murmur of whispers rising.')
add('3 The hall', '名字都很吓人：[碎骨者]、吞影者……', 'F28', 'tension',
    'Three punch-ins (~0.9 s each) with vertical labels 「碎骨者」「吞影者」「食血者」: one snaps a bone in his fingers, one gulps a shadow, one licks a red drop (stylised, no gore).',
    'Bone crack / gulp / drip, one per punch-in, on the beat.')
add('3 The hall', '第125章：对每一位逐条[发誓]——', 'F29, F27', 'groove',
    'You step up to the first judge and bow; your words float out as gold hieroglyph columns; the judge leans in. Darbuka groove starts.',
    'Darbuka "tek" as each glyph column appears.')
add('3 The hall', '“我没偷，没杀人，没[撒谎]。”', 'F30a, F30b, F30c', 'groove',
    'Three judges in quick succession nod; a gold check-mark glyph pops above each, one per beat.',
    'Three ticks on the beat.')
add('3 The hall', '“我没夺过婴儿嘴边的[奶]。”', 'F30d', 'groove',
    'Quick vignette: a baby with a milk cup; your hand pointedly not reaching for it. The judge squints, then nods.',
    'Baby gurgle; tick.')
add('3 The hall', '“我没在[秤]上做过手脚。”', 'F30e', 'groove',
    'Your hand flat on your chest; behind you the giant scale catches a glint (camera glances at it and back: a plant for the twist).',
    'Metallic "ting" on the glint; tick.')
add('3 The hall', '“我没有……[话太多]。”', 'F30g, F28', 'playful',
    'The judge labelled 「长角者」 slowly raises one brow; you freeze mid-sentence, a sweat drop; the music cuts out.',
    'Music stops dead; a single reed squeak; one cricket.', 0.4, 'CB2')
add('3 The hall', '这条，你能过吗？', 'F30g', 'playful',
    'Centred question. The horned judge turns and stares straight at the viewer; slow push on his eyes.',
    'Cricket; one tiny finger-cymbal "tink".', 0.2, 'CB2')

# ---------------- ACT 4: the weighing ----------------
add('4 The weighing', '阿努比斯领你上秤，校准[秤砣]。', 'F31', 'tension',
    'Anubis (jackal head, black skin, gold collar) leads you to the scale by the hand, then kneels and steadies the plumb-bob with one finger; it swings, then settles. Low angle. Vertical label 「阿努比斯」.',
    'Footsteps; plumb-bob tick-tick-tick against the post.')
add('4 The weighing', '左边你的心，右边[真理]之羽。', 'F32', 'tension',
    'Symmetric frame: heart on the left pan, feather on the right. Behind the feather Ma\'at fades in (a woman with the tall ostrich feather on her head). Vertical label 「玛阿特」.',
    'Two soft pan clinks, left then right.')
add('4 The weighing', '[托特]提笔，准备记录。', 'F33', 'tension',
    'Thoth (ibis head, white kilt) wets his reed pen on his palette; a baboon perches on top of the scale post, watching. Vertical label 「托特」.',
    'Pen dipped in water; first scratch.')
add('4 The weighing', '秤下蹲着“吞噬者”[阿米特]。', 'F34', 'tension',
    'BLOOD-RED rim light. Ammit crouches beneath the scale, tail swishing, eyes fixed on your heart. Vertical label 「阿米特」.',
    'Low growl; claws scrape stone.')
add('4 The weighing', '鳄鱼头，狮子前身，[河马屁股]。', 'F34', 'playful',
    'Three-beat tilt down Ammit: crocodile head (jaws clack), lion forepart (mane ripples), hippo rear (it wiggles).',
    'Jaw clack / small roar / comic "plop" on the wiggle.')
add('4 The weighing', '秤旁还站着你的[命运]，在围观。', 'F35', 'playful',
    'Beside the scale (after Ani\'s sheet): Shai, god of Fate, and two birth goddesses stand with arms folded like spectators; your human-headed ba bird peeks from a little shrine. Vertical label 「命运之神 沙伊」.',
    'A murmured "mm-hm"; ba-bird chirp.')
add('4 The weighing', '秤盘开始[晃]……', 'F32', 'tension',
    'Extreme close-up: the pans wobble; your heart\'s pan dips a hair; the feather trembles. Anubis, Thoth and Ammit all lean in. Near-silence (named beat).',
    'Heartbeat speeding up; chain creak; music drops to the drone only.', 0.8)

# ---------------- ACT 5: the twist ----------------
add('5 The cheat', '等等——你胸口那只[甲虫]！', 'F16', 'sting',
    'Quick dissolve-push (no whip pan) to the green heart scarab on your chest; it lights up green-gold.',
    'Finger-cymbal crash; rising glow hum.')
add('5 The cheat', '背面的咒语，专防心[告密]：', 'F17, F19', 'playful',
    'The scarab flips over; the lines of hieroglyphs on its underside light up one by one.',
    'Stone flip; one chime per line.')
add('5 The cheat', '“心啊，别站出来[指控]我！”', 'F18', 'playful',
    'Up on the scale, the jar-shaped heart lifts its lid like a mouth about to speak; a gold ribbon of spell glyphs wraps round it and the lid clicks shut. The heart "smiles" innocently.',
    'Lid creak; glyph ribbon "zip"; click.')
add('5 The cheat', '阿尼称心时，嘴里正念着[这段咒]。', 'F20', 'mystic',
    'REAL ANCHOR: the Ani weighing scene (BM EA 10470/3) redrawn: Ani and Tutu bow at the left; a gold underline runs along the text above Ani as if he were whispering it. Vertical labels 「阿尼」「图图」.',
    'Low whispering under the music.')
add('5 The cheat', '作弊？古埃及人管这叫[魔法]。', 'F1, F17', 'playful',
    'Ani, still bowing, slides one eye to the camera and winks.',
    'A bright "ting" on the wink.')
add('5 The cheat', '大都会馆藏一只，名字是[改刻]的——', 'F21', 'playful',
    'REAL ANCHOR: museum case at the Met: Hatnefer\'s gold-mounted green heart scarab on its gold chain; macro: old signs sanded away, her name cut into the same spot. Vertical label 「哈特妮菲尔」.',
    'Glass-case hum; sanding rasp; three chisel taps.')
add('5 The cheat', '原本不是给她做的。改个名，[照用]。', 'F21', 'playful',
    'A small reed tag reading 「改名」 swings onto the scarab; Hatnefer\'s silhouette shrugs.',
    'Tag "tink"; a sly darbuka roll.', 0.2, 'CB3')

# ---------------- ACT 6: two endings ----------------
add('6 Two endings', '可如果，秤[歪]了——', 'F37', 'sting',
    'BLOOD RED. The heart\'s pan drops with a bang; the feather flips up; Ammit springs.',
    'Pan crash; roar.')
add('6 Two endings', '阿米特一口，[吞]掉你的心。', 'F38', 'tension',
    'Ammit\'s jaws close on the heart in silhouette; cut on the bite to a red flash, then black.',
    'CHOMP, then silence.')
add('6 Two endings', '这叫“[第二次死亡]”：彻底消失。', 'F39, F38', 'tension',
    'Your silhouette crumbles to sand and blows away into the dark; nothing is left.',
    'Sand-dissolve whoosh; music dead stop at the end of the line.', 0.3)
add('6 Two endings', '如果秤[平]了——', 'F37', 'paradise',
    'The sand rewinds into your shape; the pans level exactly; gold light floods the hall.',
    'Reverse whoosh; bright chime as the beam levels.')
add('6 Two endings', '荷鲁斯牵你，去见[奥西里斯]。', 'F40', 'paradise',
    'Horus (falcon head, double crown) leads you by the hand to a shrine: Osiris enthroned (green skin, white plumed crown, crook and flail), Isis and Nephthys behind. Vertical labels 「荷鲁斯」「奥西里斯」「伊西斯」.',
    'Sistrum shimmer; footsteps.')
add('6 Two endings', '托特记下：你“[言语真实]”。', 'F33, F41', 'paradise',
    'Thoth writes; the verdict glyph glows gold on his palette; Osiris lowers his crook in assent.',
    'Pen scratch; a warm low gong.')
add('6 Two endings', '你进入[芦苇之野]：完美版的埃及。', 'F43, F44', 'paradise',
    'NILE GREEN: endless fields cut by blue canals under a bright sky; palms; a reed boat (after Ani sheet 35). Wide crane over.',
    'Birdsong; water.', 0.4)
add('6 Two endings', '但是——天堂里，也要[种地]。', 'F43, F45', 'playful',
    'You behind a plough and two oxen, sweating, deadpan to camera; the grain beside you is taller than you.',
    'Ox moo; plough scrape; the music hiccups.', 0.2, 'CB4')
add('6 Two endings', '所以，你带了一箱小人：[沙布提]。', 'F45, F47', 'playful',
    'You open a painted box; dozens of small blue-glazed mummiform figurines holding hoes stand up in rows. Vertical label 「沙布提」.',
    'Box lid creak; tiny clatter.')
add('6 Two endings', '一点名，它们就答：“[我在]！”', 'F46', 'groove',
    'A summons is read off a papyrus; the shabtis snap upright in unison and march into the field, hoes on shoulders.',
    'Tiny squeaky chorus on 「我在」; marching taps on the beat.')
add('6 Two endings', '后来全套：365个干活，36个[监工]。', 'F47', 'playful',
    'Wide: the field fills with shabtis in a grid, counter rolls to 401; split: 365 hoeing in rows, 36 larger overseer figures in kilts pointing with whips, one per block. Stamp: 「约公元前1000年」.',
    'Hoe chops on the beat; one comic whip crack.', 0.4, 'CB4')
add('6 Two endings', '你呢？躺着就行。', 'F45', 'paradise',
    'You drift in a reed boat on a canal, hands behind your head, eyes closed; shabtis harvest in the background.',
    'Water; birds; a contented sigh.')

# ---------------- CLOSE ----------------
add('Close', '而纸草上，结局早就[画好]了。', 'F42, F4', 'mystic',
    'Pull back: the paradise is a vignette on the Ani papyrus; the scroll rolls up and settles into a museum case. Stamp: 「今天 · 伦敦 大英博物馆」.',
    'Scroll rolling; museum hush.')
add('Close', '画成“通过”，就[一定通过]。', 'F42', 'mystic',
    'Back to the starry hall: the beam settles exactly level, heart and feather side by side; the dim to the end card begins.',
    'One last heartbeat; final reed note, then dead stop on the cut.', 0.3)
add('End card', '你的心，和羽毛一样[轻]吗？', 'F32, F37', 'mystic',
    'END CARD: the last shot dims to ~30 %; red J seal pressed in; film title 《死后称心脏》 (two lines); the closing question centred; pill 「关注 Juno · 一起探索世界」; sources line (below). Hold 6.0 s, fade to black.',
    'Music already stopped (dead stop before the card); seal-press thump; one finger-cymbal ring-out.', 0.0, 'END')

# ---------------- timing ----------------
PUN = set('，。、：；！？“”‘’《》（）—…·「」 ,.!?:;()')
def strip(s): return s.replace('[', '').replace(']', '')
def width(s):
    w = 0.0
    for ch in strip(s):
        if ch.isascii() and ch.isalnum(): w += 0.5
        elif ch == ' ': w += 0.0
        else: w += 1.0
    return w
def nread(s):
    return sum(1 for ch in strip(s) if ch not in PUN)

t = 0.0
rows = []
for i, s in enumerate(S, 1):
    if s['tag'] == 'TITLE': d = 3.0
    elif s['tag'] == 'END': d = 6.0
    else:
        n = nread(s['sub']); d = max(2.0, 0.5 + n / 7 + 0.6) + s['extra'] + 0.2  # 0.2 = planner inter-line gap
    d = round(d, 1)
    rows.append(dict(i=i, start=round(t, 1), end=round(t + d, 1), d=d, w=width(s['sub']), n=nread(s['sub']), **s))
    t += d
total = t
if __name__ == '__main__':
    import collections
    print('shots', len(rows), 'total', round(total, 1))
    for r in rows:
        flag = ' WIDE' if r['w'] > 16 and r['tag'] not in ('TITLE',) else ''
        print(f"{r['i']:>2} {r['start']:6.1f}-{r['end']:6.1f} d={r['d']:.1f} w={r['w']:.1f} n={r['n']:>2} {r['music']:<8} {r['tag']:<5} {strip(r['sub'])}{flag}")
    acts = collections.OrderedDict()
    for r in rows:
        a = acts.setdefault(r['act'], [r['start'], r['end'], 0]); a[1] = r['end']; a[2] += 1
    for k, v in acts.items(): print(f"{k:<16} {v[0]:6.1f}-{v[1]:6.1f}  ({v[2]} shots)")
    json.dump(rows, open(sys.argv[1] if len(sys.argv) > 1 else '/dev/null', 'w'), ensure_ascii=False, indent=1)
