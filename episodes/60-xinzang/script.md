# ep60 《死后称心脏》 · script v1 (2026-11-04)

Douyin knowledge film, Juno / VIBE知识大赏, new Egypt series. Subtitle-only, no narration. Facts: `facts.md` in this folder (only ✓ rows are on screen; every line carries its fact rows in round brackets).

## Format (owner direction for the Egypt series, from the @烬序 塞赫迈特 reference)
- **4:3, 1440×1080, 30 fps.** Subtitles in a band at the bottom, **one line at a time, centred, ≤ 16 字** (digits count as half width; widest line here = 16.0). The key word, marked `[like this]`, is **red**. Characters get **vertical name labels** (listed in the picture column as 「…」).
- **A new picture every 2–4 s**: 55 shots in 2:41, mean line 2.86 s (reference ≈ 2.6 s a line). Constant motion: every shot has a camera move and an action; no whip pans (they strobe on phones): use a short push + dissolve.
- **Mood colours per beat**: WARM PAPYRUS (daily life, the shop), STARRY LAPIS (night, the road, the hall; gold on lapis for the gods), BLOOD RED (danger: gates, Ammit, the bite), NILE GREEN (the Field of Reeds).
- **Gods drawn after the real papyri** (Ani BM EA 10470, Hunefer BM EA 9901): glamorous, gold-edged, flat-vector with rim light. See "Cast and labels".
- **Timing** is nominal: per line 0.5 s + 字/7 + 0.6 s (pacing skill) + 0.2 s inter-line gap (planner default), plus a named extra only where the picture delivers something (title 3.0 s, hall reveal, scale wobble, end card 6.0 s). Snap cue changes to the nearest bar of `tools/egypt_music.py` (100 bpm → 2.4 s bars) and re-run the pace check after.
- **Frame**: second person, 「假如你死在古埃及」. No running counter in this series; a top stamp (「年份 · 地点」) appears on three shots only: 5 (约公元前1250年 · 底比斯), 51 (约公元前1000年), 53 (今天 · 伦敦 大英博物馆).

## Hook (first 3 s)
Frame 0 is a gold-and-black Anubis mask staring into the lens over starry lapis while he tosses something over his shoulder, with the line **「你死后，[脑子]会被扔掉。」** Then 「心，却要留下来——」 / 「因为它要上秤，出庭作证。」 and the heart lands on a three-storey gold scale opposite a feather, two yellow eyes opening underneath. The title lands at 7.9 s and holds 3.0 s.

## Act structure (nominal seconds)
| act | time | shots | beat | colour |
|---|---|---|---|---|
| Hook + title | 0.0–10.9 | 1–4 | brain thrown away, heart kept, it will be weighed; TITLE | lapis, gold |
| 1 · You die | 10.9–26.5 | 5–9 | Thebes c. 1250 BC; 70-day mummy; brain out through the nose; the heart remembers everything; a beetle on your chest (plant) | papyrus → lapis glow |
| 1b · The ready-made guide | 26.5–40.8 | 10–14 | the Book of the Dead (real name: Coming Forth by Day), ~200 spells, bought ready-made with the name left blank; Ani's name filled in later (**CB1**) | warm papyrus |
| 2 · The road | 40.8–49.8 | 15–17 | the underworld: gates guarded by knife-holders, snakes and crocodiles, spells as weapons | lapis → blood red |
| 3 · The Hall of Two Truths | 49.8–74.5 | 18–26 | 42 judges with scary names; Spell 125, the negative confession; 「我没有……话太多」 (**CB2**) | lapis + gold |
| 4 · The weighing | 74.5–94.4 | 27–33 | Anubis, the feather of Ma'at, Thoth, Ammit (hippo butt), your Fate watching; the pans start to wobble | lapis, red rim |
| 5 · The twist: the cheat | 94.4–115.0 | 34–40 | the heart scarab and Spell 30B: "heart, don't testify against me"; Ani mutters it on his own papyrus; the Met's scarab was re-named (**CB3**) | green-gold glow, lapis |
| 6 · Two endings | 115.0–148.8 | 41–52 | fail: Ammit, the second death; pass: Horus, Osiris, "true of voice", the Field of Reeds, farm work, shabtis 365 + 36 overseers (**CB4**) | blood red → Nile green |
| Close + end card | 148.8–160.6 | 53–55 | the outcome was painted in advance; 「你的心，和羽毛一样轻吗？」 | lapis, dim to 30 % |

## Shot list
| # | time (s) | picture (what we see · camera · action · mood colour) | subtitle (key word in [ ]; fact rows in ( )) | music | SFX |
|---|---|---|---|---|---|
| 1 | 0.0–2.8 | Frame 0, STARRY LAPIS: extreme close-up of a jackal-masked embalmer (Anubis mask, black and gold, eyes catching torchlight). He flicks a small grey knot-shape over his shoulder; it arcs out of frame into a reed basket (flat icon, no anatomy). Push-in 100→112 %. | 「你死后，[脑子]会被扔掉。」 (F12) | sting | Frame 0: finger-cymbal crash + low dum. Whoosh on the toss; soft "thup" as it lands in the basket. |
| 2 | 2.8–5.0 | Match on the arc: the camera follows it down onto a linen-wrapped mummy; a red-gold heart glows through the chest wrappings (glow masked inside the body), pulsing. Tilt down + push. | 「[心]，却要留下来——」 (F11) | tension | Two heartbeats (thump-thump) locked to the two glow pulses. |
| 3 | 5.0–7.9 | The glowing heart (drawn as the papyri's jar-shaped heart) drops onto the left pan of a giant gold balance; a single white ostrich feather on the right pan. Fast pull-back: the scale is three storeys tall; under it two yellow eyes open in the dark (Ammit, not yet seen). | 「因为它要上[秤]，出庭作证。」 (F32, F18) | tension | Heavy metal CLANG + chain rattle on the drop; low growl under the eyes. |
| 4 | 7.9–10.9 | TITLE CARD over the slowly swinging scale: 《死后称心脏》 in gold inside a cartouche-shaped frame; the feather sways; gold dust drifts across starry lapis. Slow push. Holds 3.0 s (house rule ≥ 2.5 s). | (title card, no subtitle) 《死后称心脏》 | mystic | Deep gong on the title; sand hiss; the D-Hijaz reed motif (egypt_music.py) enters. |
| 5 | 10.9–14.3 | WARM PAPYRUS. Thebes at sunset: palms, a sail on the Nile, mud-brick houses. You (young scribe, white kilt, reed pen behind the ear) set down your palette; a blue lotus slips from your hand. Slow crane down. Stamp: 「约公元前1250年 · 底比斯」. | 「假如你死在[3000多年前]的埃及。」 (F8, F9) | mystic | Nile water lapping; reed pen taps the wooden palette; lotus lands softly. |
| 6 | 14.3–17.5 | Embalming tent. A priest in an Anubis mask winds linen round you; time-lapse: the sun arcs over the tent again and again; four canopic jars slide into a row beside the bed; corner counter rolls 第1天 → 第70天. | 「祭司花[70天]，把你做成木乃伊。」 (F14, F13) | groove | Linen swish on each wrap; four clay clunks as the jars land (on the beat); counter ticks. |
| 7 | 17.5–20.4 | Playful and stylised (no body interior): the masked priest twirls a long bronze hook like a conductor's baton; a cartoon grey puff pops up at frame left and he tosses it backward into a basket without looking (callback to frame 0). | 「脑子？从鼻子里[勾]出来，扔了。」 (F12) | groove | Comic "boing" on the twirl; basket "thup". (comic hit on the groove: oud pluck drop) |
| 8 | 20.4–23.6 | X-ray glow inside the mummy: only the heart is lit. It opens like a lantern; tiny papyrus-style vignettes of your life flicker inside (a boy learning to write, counting grain at work, a market quarrel). One vignette, you nudging a weight on a market scale, flashes red for a frame. | 「古埃及人认为：心记着你的[一切]。」 (F15) | mystic | Paper flutter per vignette; a tiny "ting" on the red flash; heartbeat under. |
| 9 | 23.6–26.5 | Top-down: a hand lays a green-stone heart scarab in a gold mount on the linen over the heart; a gold ring of light circles it (playful freeze-frame highlight); tilt shows tiny hieroglyphs on its underside. | 「胸口再压一只[甲虫]——记住它。」 (F16) | mystic | Stone tap on linen; small bright chime on the highlight ring. |
| 10 | 26.5–29.1 | WARM PAPYRUS. A papyrus roll tied with linen string is laid in the coffin beside you; the string slips and the roll whips open across the 4:3 frame like a banner: bright vignettes of gods, gates, a scale. | 「你还带着一卷[《亡灵书》]——」 (F1) | playful | String snap; long papyrus unrolling whoosh. |
| 11 | 29.1–31.8 | Dawn light rakes across the open banner; its hieroglyph title glows gold; a human-headed ba bird flies out of a tomb door into sunlight. | 「它本名叫《[白昼出行之书]》。」 (F2) | playful | Wing flaps; a bright riq shake. |
| 12 | 31.8–34.8 | A Theban scribe's stall: the vendor flips spell sheets like a menu; a rich client points (this one, that one); chosen sheets fly into a pile. | 「来世说明书，约[200]条咒语。」 (F1, F3) | playful | Rapid papyrus flips on the eighth notes; a reed pen "tap" on each pick. |
| 13 · **CB1** | 34.8–37.9 | Close-up of a finished scroll: every picture painted, gods coloured in; where the owner's name belongs, an empty gap. The gap blinks with a white outline. | 「而且是[现货]：名字那里空着。」 (F4) | playful | One bright "ding" on the blink. |
| 14 · **CB1** | 37.9–40.8 | REAL ANCHOR: the Ani papyrus redrawn in a museum case, small label 「大英博物馆 EA 10470」. A reed pen writes Ani's name into the gap in a slightly different ink. Vertical name label 「书吏 阿尼」. | 「阿尼纸草，名字就是[后填]的。」 (F5, F9) | playful | Reed pen scratch; soft glass-case hum. |
| 15 | 40.8–43.5 | STARRY LAPIS. You (white linen, faintly glowing) walk down a tomb shaft that opens onto a dark river under stars; a sun-boat silhouette far off. Drift forward. | 「下葬后，你上路了：去[冥界]。」 (F25) | tension | Stone door grinds shut behind you; night wind. |
| 16 | 43.5–46.5 | BLOOD RED. A pylon gate; squatting animal-headed guardians flank it, each holding a knife; the knives glint one after another as the camera trucks past. | 「一道道门，守门的手里拿着[刀]。」 (F25) | tension | A knife "shing" on each glint. |
| 17 | 46.5–49.8 | A cobra rears and a crocodile lunges at the lens; you lift the scroll, a line of gold glyphs flares off it and both recoil; beetles scatter. | 「蛇和鳄鱼扑过来，全靠[咒语]挡。」 (F25) | tension | Hiss; jaw snap; gold flare "whoomp"; beetle skitter. |
| 18 | 49.8–52.7 | BIG REVEAL, LAPIS + GOLD: a vast hall, lapis ceiling with gold stars, papyrus-bundle columns; the giant scale at the centre; you, tiny, at the door. Crane up and back. | 「终点：[双真理之厅]。」 (F26) | mystic | Huge doors boom open; footsteps echo. |
| 19 | 52.7–55.4 | Two long rows of seated judges (mummiform bodies, animal and human heads, each holding a feather or a knife) recede into the dark; truck along the row. Vertical label 「四十二判官」. | 「[42]位神排排坐，等着你。」 (F27) | mystic | Murmur of whispers rising. |
| 20 | 55.4–58.4 | Three punch-ins (~0.9 s each) with vertical labels 「碎骨者」「吞影者」「食血者」: one snaps a bone in his fingers, one gulps a shadow, one licks a red drop (stylised, no gore). | 「名字都很吓人：[碎骨者]、吞影者……」 (F28) | groove | Bone crack / gulp / drip, one per punch-in, on the beat. (three tension stabs over the groove intro) |
| 21 | 58.4–61.6 | You step up to the first judge and bow; your words float out as gold hieroglyph columns; the judge leans in. Darbuka groove starts. | 「第125章：对每一位逐条[发誓]——」 (F29, F27) | groove | Darbuka "tek" as each glyph column appears. |
| 22 | 61.6–64.2 | Three judges in quick succession nod; a gold check-mark glyph pops above each, one per beat. | 「“我没偷，没杀人，没[撒谎]。”」 (F30a, F30b, F30c) | groove | Three ticks on the beat. |
| 23 | 64.2–66.9 | Quick vignette: a baby with a milk cup; your hand pointedly not reaching for it. The judge squints, then nods. | 「“我没夺过婴儿嘴边的[奶]。”」 (F30d) | groove | Baby gurgle; tick. |
| 24 | 66.9–69.5 | Your hand flat on your chest; behind you the giant scale catches a glint (camera glances at it and back: a plant for the twist). | 「“我没在[秤]上做过手脚。”」 (F30e) | groove | Metallic "ting" on the glint; tick. |
| 25 · **CB2** | 69.5–72.1 | The judge labelled 「长角者」 slowly raises one brow; you freeze mid-sentence, a sweat drop; the music cuts out. | 「“我没有……[话太多]。”」 (F30g, F28) | playful | Music stops dead; a single reed squeak; one cricket. |
| 26 · **CB2** | 72.1–74.5 | Centred question. The horned judge turns and stares straight at the viewer; slow push on his eyes. | 「这条，你能过吗？」 (F30g) | playful | Cricket; one tiny finger-cymbal "tink". |
| 27 | 74.5–77.5 | Anubis (jackal head, black skin, gold collar) leads you to the scale by the hand, then kneels and steadies the plumb-bob with one finger; it swings, then settles. Low angle. Vertical label 「阿努比斯」. | 「阿努比斯领你上秤，校准[秤砣]。」 (F31) | tension | Footsteps; plumb-bob tick-tick-tick against the post. |
| 28 | 77.5–80.4 | Symmetric frame: heart on the left pan, feather on the right. Behind the feather Ma'at fades in (a woman with the tall ostrich feather on her head). Vertical label 「玛阿特」. | 「左边你的心，右边[真理]之羽。」 (F32) | tension | Two soft pan clinks, left then right. |
| 29 | 80.4–82.8 | Thoth (ibis head, white kilt) wets his reed pen on his palette; a baboon perches on top of the scale post, watching. Vertical label 「托特」. | 「[托特]提笔，准备记录。」 (F33) | tension | Pen dipped in water; first scratch. |
| 30 | 82.8–85.5 | BLOOD-RED rim light. Ammit crouches beneath the scale, tail swishing, eyes fixed on your heart. Vertical label 「阿米特」. | 「秤下蹲着“吞噬者”[阿米特]。」 (F34) | tension | Low growl; claws scrape stone. |
| 31 | 85.5–88.4 | Three-beat tilt down Ammit: crocodile head (jaws clack), lion forepart (mane ripples), hippo rear (it wiggles). | 「鳄鱼头，狮子前身，[河马屁股]。」 (F34) | tension | Jaw clack / small roar / comic "plop" on the wiggle. (comic hits over the tension bed; the bed keeps going) |
| 32 | 88.4–91.4 | Beside the scale (after Ani's sheet): Shai, god of Fate, and two birth goddesses stand with arms folded like spectators; your human-headed ba bird peeks from a little shrine. Vertical label 「命运之神 沙伊」. | 「秤旁还站着你的[命运]，在围观。」 (F35) | tension | A murmured "mm-hm"; ba-bird chirp. (bed thins to drone + one oud pluck) |
| 33 | 91.4–94.4 | Extreme close-up: the pans wobble; your heart's pan dips a hair; the feather trembles. Anubis, Thoth and Ammit all lean in. Near-silence (named beat). | 「秤盘开始[晃]……」 (F32) | tension | Heartbeat speeding up; chain creak; music drops to the drone only. |
| 34 | 94.4–97.0 | Quick dissolve-push (no whip pan) to the green heart scarab on your chest; it lights up green-gold. | 「等等——你胸口那只[甲虫]！」 (F16) | sting | Finger-cymbal crash; rising glow hum. |
| 35 | 97.0–99.7 | The scarab flips over; the lines of hieroglyphs on its underside light up one by one. | 「背面的咒语，专防心[告密]：」 (F17, F19) | playful | Stone flip; one chime per line. |
| 36 | 99.7–102.3 | Up on the scale, the jar-shaped heart lifts its lid like a mouth about to speak; a gold ribbon of spell glyphs wraps round it and the lid clicks shut. The heart "smiles" innocently. | 「“心啊，别站出来[指控]我！”」 (F18) | playful | Lid creak; glyph ribbon "zip"; click. |
| 37 | 102.3–105.5 | REAL ANCHOR: the Ani weighing scene (BM EA 10470/3) redrawn: Ani and Tutu bow at the left; a gold underline runs along the text above Ani as if he were whispering it. Vertical labels 「阿尼」「图图」. | 「阿尼称心时，嘴里正念着[这段咒]。」 (F20) | playful | Low whispering under the music. (bed thins: reed solo under the real papyrus) |
| 38 | 105.5–108.4 | Ani, still bowing, slides one eye to the camera and winks. | 「作弊？古埃及人管这叫[魔法]。」 (F1, F17) | playful | A bright "ting" on the wink. |
| 39 | 108.4–111.6 | REAL ANCHOR: museum case at the Met: Hatnefer's gold-mounted green heart scarab on its gold chain; macro: old signs sanded away, her name cut into the same spot. Vertical label 「哈特妮菲尔」. | 「大都会馆藏一只，名字是[改刻]的——」 (F21) | playful | Glass-case hum; sanding rasp; three chisel taps. |
| 40 · **CB3** | 111.6–115.0 | A small reed tag reading 「改名」 swings onto the scarab; Hatnefer's silhouette shrugs. | 「原本不是给她做的。改个名，[照用]。」 (F21) | playful | Tag "tink"; a sly darbuka roll. |
| 41 | 115.0–117.2 | BLOOD RED. The heart's pan drops with a bang; the feather flips up; Ammit springs. | 「可如果，秤[歪]了——」 (F37) | sting | Pan crash; roar. |
| 42 | 117.2–119.9 | Ammit's jaws close on the heart in silhouette; cut on the bite to a red flash, then black. | 「阿米特一口，[吞]掉你的心。」 (F38) | tension | CHOMP, then silence. |
| 43 | 119.9–123.1 | Your silhouette crumbles to sand and blows away into the dark; nothing is left. | 「这叫“[第二次死亡]”：彻底消失。」 (F39, F38) | tension | Sand-dissolve whoosh; music dead stop at the end of the line. |
| 44 | 123.1–125.3 | The sand rewinds into your shape; the pans level exactly; gold light floods the hall. | 「如果秤[平]了——」 (F37) | paradise | Reverse whoosh; bright chime as the beam levels. |
| 45 | 125.3–128.2 | Horus (falcon head, double crown) leads you by the hand to a shrine: Osiris enthroned (green skin, white plumed crown, crook and flail), Isis and Nephthys behind. Vertical labels 「荷鲁斯」「奥西里斯」「伊西斯」. | 「荷鲁斯牵你，去见[奥西里斯]。」 (F40) | paradise | Sistrum shimmer; footsteps. |
| 46 | 128.2–130.8 | Thoth writes; the verdict glyph glows gold on his palette; Osiris lowers his crook in assent. | 「托特记下：你“[言语真实]”。」 (F33, F41) | paradise | Pen scratch; a warm low gong. |
| 47 | 130.8–134.4 | NILE GREEN: endless fields cut by blue canals under a bright sky; palms; a reed boat (after Ani sheet 35). Wide crane over. | 「你进入[芦苇之野]：完美版的埃及。」 (F43, F44) | paradise | Birdsong; water. |
| 48 · **CB4** | 134.4–137.2 | You behind a plough and two oxen, sweating, deadpan to camera; the grain beside you is taller than you. | 「但是——天堂里，也要[种地]。」 (F43, F45) | playful | Ox moo; plough scrape; the music hiccups. |
| 49 | 137.2–140.2 | You open a painted box; dozens of small blue-glazed mummiform figurines holding hoes stand up in rows. Vertical label 「沙布提」. | 「所以，你带了一箱小人：[沙布提]。」 (F45, F47) | playful | Box lid creak; tiny clatter. |
| 50 | 140.2–142.8 | A summons is read off a papyrus; the shabtis snap upright in unison and march into the field, hoes on shoulders. | 「一点名，它们就答：“[我在]！”」 (F46) | playful | Tiny squeaky chorus on 「我在」; marching taps on the beat. (playful bed, darbuka doubles for the march) |
| 51 · **CB4** | 142.8–146.6 | Wide: the field fills with shabtis in a grid, counter rolls to 401; split: 365 hoeing in rows, 36 larger overseer figures in kilts pointing with whips, one per block. Stamp: 「约公元前1000年」. | 「后来全套：365个干活，36个[监工]。」 (F47) | playful | Hoe chops on the beat; one comic whip crack. |
| 52 | 146.6–148.8 | You drift in a reed boat on a canal, hands behind your head, eyes closed; shabtis harvest in the background. | 「你呢？躺着就行。」 (F45) | paradise | Water; birds; a contented sigh. |
| 53 | 148.8–151.7 | Pull back: the paradise is a vignette on the Ani papyrus; the scroll rolls up and settles into a museum case. Stamp: 「今天 · 伦敦 大英博物馆」. | 「而纸草上，结局早就[画好]了。」 (F42, F4) | mystic | Scroll rolling; museum hush. |
| 54 | 151.7–154.6 | Back to the starry hall: the beam settles exactly level, heart and feather side by side; the dim to the end card begins. | 「画成“通过”，就[一定通过]。」 (F42) | mystic | One last heartbeat; final reed note, then dead stop on the cut. |
| 55 | 154.6–160.6 | END CARD: the last shot dims to ~30 %; red J seal pressed in; film title 《死后称心脏》 (two lines); the closing question centred; pill 「关注 Juno · 一起探索世界」; sources line (below). Hold 6.0 s, fade to black. | 「你的心，和羽毛一样[轻]吗？」 (F32, F37) · end card | mystic → dead stop | Music already stopped (dead stop before the card); seal-press thump; one finger-cymbal ring-out. |

## Comment-bait beats (4)
| # | shots | beat | why it baits comments |
|---|---|---|---|
| CB1 | 13–14 | 「而且是现货：名字那里空着。」 → 「阿尼纸草，名字就是后填的。」 | 古埃及版"填空题"/"模板" jokes; "来世也有标准件" |
| CB2 | 25–26 | 「“我没有……话太多。”」 → 「这条，你能过吗？」 (the horned judge stares at the viewer) | viewers confess in the comments ("第一条就挂了", tagging a talkative friend) |
| CB3 | 39–40 | the Met's heart scarab: name cut over erased text, 「原本不是给她做的。改个名，照用。」 | "连作弊器都是二手的" / "古埃及闲鱼" |
| CB4 | 48–51 | 「但是——天堂里，也要种地。」 → shabtis answer 「我在！」 → 「365个干活，36个监工。」 | "死了还要上班" / "十天一个监工，KPI" / "我是那365个之一" |
Soft extras: 「河马屁股」 (31), 「命运在围观」 (32).

## Music cue map (scene level; one-shot comic moments ride the bed as SFX hits)
| cue | shots | seconds |
|---|---|---|
| sting | 1 | 0.0–2.8 |
| tension | 2–3 | 2.8–7.9 |
| mystic | 4–5 (title lands on the reed motif) | 7.9–14.3 |
| groove | 6–7 | 14.3–20.4 |
| mystic | 8–9 | 20.4–26.5 |
| playful | 10–14 | 26.5–40.8 |
| tension | 15–17 | 40.8–49.8 |
| mystic | 18–19 (hall reveal) | 49.8–55.4 |
| groove | 20–24 (the oath groove: one tick per declaration) | 55.4–69.5 |
| playful | 25–26 (music stops dead on 「话太多」) | 69.5–74.5 |
| tension | 27–33 (near-silence on 33, drone only) | 74.5–94.4 |
| sting | 34 | 94.4–97.0 |
| playful | 35–40 | 97.0–115.0 |
| sting | 41 | 115.0–117.2 |
| tension | 42–43 (dead stop at the end of 43) | 117.2–123.1 |
| paradise | 44–47 | 123.1–134.4 |
| playful | 48–51 | 134.4–146.6 |
| paradise | 52 | 146.6–148.8 |
| mystic | 53–54, dead stop before the end card | 148.8–154.6 |
The bed is ours (`tools/egypt_music.py`, D-Hijaz: drone, darbuka maqsum, oud, ney/reed, finger cymbals). Suggested mapping: mystic = drone + reed lead, no drums; groove = full maqsum; playful = oud plucks + riq, half-time; tension = drone + low dum on 1 and 3, no melody; paradise = reed lead up an octave + bright qanun, soft darbuka; sting = finger-cymbal crash + dum + reed glide.

## Cast and labels (drawn after the papyri)
| label (vertical) | look (from the Ani / Hunefer vignettes) | shots |
|---|---|---|
| 阿努比斯 | jackal head, black skin, gold collar and kilt; leads by the hand, kneels at the plumb-bob | 1 (mask), 6–7 (mask), 27 |
| 玛阿特 | woman with one tall ostrich feather on her head; the feather on the pan is hers | 28 |
| 托特 | ibis head, white kilt, scribe's palette and reed pen; a baboon (also Thoth) sits on top of the scale post in Ani | 29, 46 |
| 阿米特 | crocodile head, lion forepart (mane), hippopotamus hindquarters; crouched by the scale | 3 (eyes), 30–31, 41–42 |
| 命运之神 沙伊 + two birth goddesses | standing beside the scale in Ani | 32 |
| 碎骨者 / 吞影者 / 食血者 / 长角者 | four of the 42 judges, seated mummiform, each with a feather or knife | 20, 25–26 |
| 荷鲁斯 | falcon head, double crown; leads the dead by the hand | 45 |
| 奥西里斯 | enthroned in a shrine, green skin, white plumed crown, crook and flail, mummiform | 45–46 |
| 伊西斯 (+ Nephthys) | standing behind Osiris | 45 |
| 书吏 阿尼 / 图图 | Ani and his wife Tutu bowing (Ani EA 10470/3) | 14, 37 |
| 哈特妮菲尔 | the Met's gold-mounted heart scarab (Met 36.3.2) | 39–40 |
| 沙布提 | small blue-glazed mummiform figurines with hoes; overseers larger, in kilts | 49–51 |
Safety: no anatomy, no gore (the brain is a cartoon puff, the bite cuts on contact), no bordered maps, no real photos; museum objects are redrawn.

## Reserve lines (✓, for length or swaps; each needs its own picture)
- 「这东西不便宜，[有钱人]才买得起。」 (F6) after 14.
- 「“别在掌秤的神面前，与我为[敌]。”」 (F18) after 36.
- 「那里的麦子，长得[高得离谱]。」 (F44) after 47.
- 「阿尼纸草，1888年进了[大英博物馆]。」 (F9) as 53's stamp line.
- 「“我没让人[挨饿]，没让人流泪。”」 (F30h) or 「“我没[截]过该放的水。”」 (F30f) in the oath run.

## Title options (Douyin 标题 ≤ 30 字, question-shaped)
1. 古埃及人死后，为什么要把心脏放上秤？ (18)
2. 做木乃伊为什么扔掉脑子，却留下心脏？ (18)
3. 假如你死在古埃及，你的心能过秤吗？ (17)
4. 古埃及的“称心脏”审判，到底能不能作弊？ (20)
5. 《亡灵书》里称心脏，秤的另一头为什么是羽毛？ (22)
Search words to match: 古埃及称心脏 / 阿努比斯 / 亡灵书 / 木乃伊 脑子 / 心脏圣甲虫.

## Sources line (end card, verbatim)
资料：大英博物馆（阿尼纸草 EA10470、胡内弗纸草 EA9901）· 大都会艺术博物馆 · 沃尔特斯美术馆 · 利物浦博物馆 · 伦敦大学学院 · Lichtheim《古埃及文学》

## Checks done
- 55 shots, 0.0–160.6 s (2:41). Title at 7.9 s, held 3.0 s. End card 6.0 s.
- Widest line 16.0 (digits half width); no line over 16.
- Every subtitle carries ✓ fact rows. Lines that are jokes or questions (13, 25–26, 38, 40, 48, 52) rest on the fact they riff on. Wording kept inside the sources: 「秤平 / 秤歪」 (balance), not "lighter than the feather"; the closing 「和羽毛一样轻」 means balanced; the Met scarab is 「原本不是给她做的」, not "used by someone else"; the 401-shabti set is 「后来」 (Dynasty 21, after Ani); 70 days is the whole process.
- Not on screen (caution / ?): the deben price of a Book of the Dead (F7), the 37 m Greenfield papyrus (G1), "no papyrus ever shows failure" (G2).
