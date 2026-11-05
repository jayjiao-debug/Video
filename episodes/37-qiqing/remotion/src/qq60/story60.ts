/* ep60 《死后的心脏》 timeline, generated from episodes/60-xinzang/script.md (v1); v2 (owner 15:10): the separate title card (shot 4, 3.0 s) is gone — the title lives inside the opening scenes — so every shot after 7.9 s is 3.0 s earlier (157.6 s). Shot numbers are kept (there is no shot 4). v2b (owner 15:40): the title stays in shot 3 only, so shot 3 runs to 8.4 and shot 5 is 8.4–11.3. Times in seconds; this is the final clock (our music
   is composed to this cut). sub: one centred line, [key] = gold key word. pic: the shot brief. cue/sfx: the soundtrack plan. 
   v7 (owner 11-05 17:46–18:04: clarity rewrite — 现货/阿尼 gone, the west + gate names + 驱鳄咒, 话太多吧, 当年的埃及人, 定做/磨掉旧字; 18:01 line 25 dropped).
   v6 (owner 21:54: "按上面重排时间、合并镜头、换配乐重做"): every line is timed for reading like the reference — dur = max(2.2, 0.68 + 0.237 × 字) —
   and 14 pairs of shots are merged so a picture holds across two lines (39 pictures, mean 4.3 s). A shot now carries `lines` (absolute t0/t1);
   `sub` = its first line. Shot numbers of absorbed shots are gone (their content is part of the host shot: see `pic`, "⟶ [merged n]"). */
export type Line = {text: string; t0: number; t1: number; from: number};
export type Shot = {n: number; a: number; b: number; sub: string; lines: Line[]; cue: string; pic: string; sfx: string; cb: boolean; stamp?: {era: string; place: string; src?: string}};
export const SHOTS: Shot[] = [
 {
  "n": 1,
  "a": 0.0,
  "b": 2.81,
  "sub": "你死后，[脑子]会被扔掉。",
  "cue": "sting",
  "pic": "Frame 0, STARRY LAPIS: extreme close-up of a jackal-masked embalmer (Anubis mask, black and gold, eyes catching torchlight). He flicks a small grey knot-shape over his shoulder; it arcs out of frame into a reed basket (flat icon, no anatomy). Push-in 100→112 %.",
  "sfx": "Frame 0: finger-cymbal crash + low dum. Whoosh on the toss; soft \"thup\" as it lands in the basket.",
  "cb": false,
  "lines": [
   {
    "text": "你死后，[脑子]会被扔掉。",
    "t0": 0.0,
    "t1": 2.81,
    "from": 1
   }
  ]
 },
 {
  "n": 2,
  "a": 2.81,
  "b": 5.01,
  "sub": "[心]，却要留下来——",
  "cue": "tension",
  "pic": "Match on the arc: the camera follows it down onto a linen-wrapped mummy; a red-gold heart glows through the chest wrappings (glow masked inside the body), pulsing. Tilt down + push.",
  "sfx": "Two heartbeats (thump-thump) locked to the two glow pulses.",
  "cb": false,
  "lines": [
   {
    "text": "[心]，却要留下来——",
    "t0": 2.81,
    "t1": 5.01,
    "from": 2
   }
  ]
 },
 {
  "n": 3,
  "a": 5.01,
  "b": 8.41,
  "sub": "因为它要上[秤]，出庭作证。",
  "cue": "tension",
  "pic": "The glowing heart (drawn as the papyri's jar-shaped heart) drops onto the left pan of a giant gold balance; a single white ostrich feather on the right pan. Fast pull-back: the scale is three storeys tall; under it two yellow eyes open in the dark (Ammit, not yet seen).",
  "sfx": "Heavy metal CLANG + chain rattle on the drop; low growl under the eyes.",
  "cb": false,
  "lines": [
   {
    "text": "因为它要上[秤]，出庭作证。",
    "t0": 5.01,
    "t1": 8.41,
    "from": 3
   }
  ]
 },
 {
  "n": 5,
  "a": 8.41,
  "b": 12.17,
  "sub": "假如你死在[3000多年前]的埃及。",
  "cue": "mystic",
  "pic": "WARM PAPYRUS. Thebes at sunset: palms, a sail on the Nile, mud-brick houses. You (young scribe, white kilt, reed pen behind the ear) set down your palette; a blue lotus slips from your hand. Slow crane down. Stamp: 「约公元前1250年 · 底比斯」.",
  "sfx": "Nile water lapping; reed pen taps the wooden palette; lotus lands softly.",
  "cb": false,
  "stamp": {
   "era": "约公元前1250年",
   "place": "底比斯"
  },
  "lines": [
   {
    "text": "假如你死在[3000多年前]的埃及。",
    "t0": 8.41,
    "t1": 12.17,
    "from": 5
   }
  ]
 },
 {
  "n": 6,
  "a": 12.17,
  "b": 18.98,
  "sub": "祭司花[70天]，把你做成木乃伊。",
  "cue": "groove",
  "pic": "Embalming tent. A priest in an Anubis mask winds linen round you; time-lapse: the sun arcs over the tent again and again; four canopic jars slide into a row beside the bed; corner counter rolls 第1天 → 第70天. ⟶ [merged 7] Playful and stylised (no body interior): the masked priest twirls a long bronze hook like a conductor's baton; a cartoon grey puff pops up at frame left and he tosses it backward into a basket without looking (callback to frame 0).",
  "sfx": "Linen swish on each wrap; four clay clunks as the jars land (on the beat); counter ticks. ⟶ [7] Comic \"boing\" on the twirl; basket \"thup\". (comic hit on the groove: oud pluck drop)",
  "cb": false,
  "lines": [
   {
    "text": "祭司花[70天]，把你做成木乃伊。",
    "t0": 12.17,
    "t1": 15.69,
    "from": 6
   },
   {
    "text": "脑子？从鼻子里[勾]出来，扔了。",
    "t0": 15.69,
    "t1": 18.98,
    "from": 6
   }
  ]
 },
 {
  "n": 8,
  "a": 18.98,
  "b": 22.74,
  "sub": "古埃及人认为：心记着你的[一切]。",
  "cue": "mystic",
  "pic": "X-ray glow inside the mummy: only the heart is lit. It opens like a lantern; tiny papyrus-style vignettes of your life flicker inside (a boy learning to write, counting grain at work, a market quarrel). One vignette, you nudging a weight on a market scale, flashes red for a frame.",
  "sfx": "Paper flutter per vignette; a tiny \"ting\" on the red flash; heartbeat under.",
  "cb": false,
  "lines": [
   {
    "text": "古埃及人认为：心记着你的[一切]。",
    "t0": 18.98,
    "t1": 22.74,
    "from": 8
   }
  ]
 },
 {
  "n": 9,
  "a": 22.74,
  "b": 26.03,
  "sub": "胸口再压一只[甲虫]——记住它。",
  "cue": "mystic",
  "pic": "Top-down: a hand lays a green-stone heart scarab in a gold mount on the linen over the heart; a gold ring of light circles it (playful freeze-frame highlight); tilt shows tiny hieroglyphs on its underside.",
  "sfx": "Stone tap on linen; small bright chime on the highlight ring.",
  "cb": false,
  "lines": [
   {
    "text": "胸口再压一只[甲虫]——记住它。",
    "t0": 22.74,
    "t1": 26.03,
    "from": 9
   }
  ]
 },
 {
  "n": 10,
  "a": 26.03,
  "b": 28.84,
  "sub": "你还带着一卷[《亡灵书》]——",
  "cue": "playful",
  "pic": "WARM PAPYRUS. A papyrus roll tied with linen string is laid in the coffin beside you; the string slips and the roll whips open across the 4:3 frame like a banner: bright vignettes of gods, gates, a scale. ⟶ [merged 11] Dawn light rakes across the open banner; its hieroglyph title glows gold; a human-headed ba bird flies out of a tomb door into sunlight.",
  "sfx": "String snap; long papyrus unrolling whoosh. ⟶ [11] Wing flaps; a bright riq shake.",
  "cb": false,
  "lines": [
   {
    "text": "你还带着一卷[《亡灵书》]——",
    "t0": 26.03,
    "t1": 28.84,
    "from": 10
   }
  ]
 },
 {
  "n": 12,
  "a": 28.84,
  "b": 35.77,
  "sub": "冥界[通关攻略]：约200条咒语。",
  "cue": "playful",
  "pic": "A Theban scribe's stall: the vendor flips spell sheets like a menu; a rich client points (this one, that one); chosen sheets fly into a pile. ⟶ [merged 13] Close-up of a finished scroll: every picture painted, gods coloured in; where the owner's name belongs, an empty gap. The gap blinks with a white outline.",
  "sfx": "Rapid papyrus flips on the eighth notes; a reed pen \"tap\" on each pick. ⟶ [13] One bright \"ding\" on the blink.",
  "cb": false,
  "lines": [
   {
    "text": "冥界[通关攻略]：约200条咒语。",
    "t0": 28.84,
    "t1": 32.25,
    "from": 12
   },
   {
    "text": "书是[提前]写好的，名字先空着。",
    "t0": 32.25,
    "t1": 35.77,
    "from": 12
   }
  ]
 },
 {
  "n": 14,
  "a": 35.77,
  "b": 38.82,
  "sub": "谁买，就在空格里[填名字]。",
  "cue": "playful",
  "pic": "REAL ANCHOR: the Ani papyrus redrawn in a museum case, small label 「大英博物馆 EA 10470」. A reed pen writes Ani's name into the gap in a slightly different ink. Vertical name label 「书吏 阿尼」.",
  "sfx": "Reed pen scratch; soft glass-case hum.",
  "cb": true,
  "lines": [
   {
    "text": "谁买，就在空格里[填名字]。",
    "t0": 35.77,
    "t1": 38.82,
    "from": 14
   }
  ]
 },
 {
  "n": 15,
  "a": 38.82,
  "b": 44.69,
  "sub": "下葬后，你要去[冥界]——",
  "cue": "tension",
  "pic": "STARRY LAPIS. You (white linen, faintly glowing) walk down a tomb shaft that opens onto a dark river under stars; a sun-boat silhouette far off. Drift forward.",
  "sfx": "Stone door grinds shut behind you; night wind.",
  "cb": false,
  "lines": [
   {
    "text": "下葬后，你要去[冥界]——",
    "t0": 38.82,
    "t1": 41.4,
    "from": 15
   },
   {
    "text": "往[西边]走，太阳落下的地方。",
    "t0": 41.4,
    "t1": 44.69,
    "from": 15
   }
  ]
 },
 {
  "n": 16,
  "a": 44.69,
  "b": 51.5,
  "sub": "一道道门，守门的手里拿着[刀]。",
  "cue": "tension",
  "pic": "BLOOD RED. A pylon gate; squatting animal-headed guardians flank it, each holding a knife; the knives glint one after another as the camera trucks past.",
  "sfx": "A knife \"shing\" on each glint.",
  "cb": false,
  "lines": [
   {
    "text": "一道道门，守门的手里拿着[刀]。",
    "t0": 44.69,
    "t1": 48.21,
    "from": 16
   },
   {
    "text": "报出守门人的[名字]，才放行。",
    "t0": 48.21,
    "t1": 51.5,
    "from": 16
   }
  ]
 },
 {
  "n": 17,
  "a": 51.5,
  "b": 55.26,
  "sub": "遇到蛇和鳄鱼？翻攻略，念[驱鳄咒]。",
  "cue": "tension",
  "pic": "A cobra rears and a crocodile lunges at the lens; you lift the scroll, a line of gold glyphs flares off it and both recoil; beetles scatter.",
  "sfx": "Hiss; jaw snap; gold flare \"whoomp\"; beetle skitter.",
  "cb": false,
  "lines": [
   {
    "text": "遇到蛇和鳄鱼？翻攻略，念[驱鳄咒]。",
    "t0": 51.5,
    "t1": 55.26,
    "from": 17
   }
  ]
 },
 {
  "n": 18,
  "a": 55.26,
  "b": 60.41,
  "sub": "终点：[审判大厅]。",
  "cue": "mystic",
  "pic": "BIG REVEAL, LAPIS + GOLD: a vast hall, lapis ceiling with gold stars, papyrus-bundle columns; the giant scale at the centre; you, tiny, at the door. Crane up and back. ⟶ [merged 19] Two long rows of seated judges (mummiform bodies, animal and human heads, each holding a feather or a knife) recede into the dark; truck along the row. Vertical label 「四十二判官」.",
  "sfx": "Huge doors boom open; footsteps echo. ⟶ [19] Murmur of whispers rising.",
  "cb": false,
  "lines": [
   {
    "text": "终点：[审判大厅]。",
    "t0": 55.26,
    "t1": 57.6,
    "from": 18
   },
   {
    "text": "[42]位神排排坐，等着你。",
    "t0": 57.6,
    "t1": 60.41,
    "from": 18
   }
  ]
 },
 {
  "n": 20,
  "a": 60.41,
  "b": 63.93,
  "sub": "名字都很吓人：[碎骨者]、吞影者……",
  "cue": "groove",
  "pic": "Three punch-ins (~0.9 s each) with vertical labels 「碎骨者」「吞影者」「食血者」: one snaps a bone in his fingers, one gulps a shadow, one licks a red drop (stylised, no gore).",
  "sfx": "Bone crack / gulp / drip, one per punch-in, on the beat. (three tension stabs over the groove intro)",
  "cb": false,
  "lines": [
   {
    "text": "名字都很吓人：[碎骨者]、吞影者……",
    "t0": 60.41,
    "t1": 63.93,
    "from": 20
   }
  ]
 },
 {
  "n": 21,
  "a": 63.93,
  "b": 70.15,
  "sub": "第125章：对每一位逐条[发誓]——",
  "cue": "groove",
  "pic": "You step up to the first judge and bow; your words float out as gold hieroglyph columns; the judge leans in. Darbuka groove starts. ⟶ [merged 22] Three judges in quick succession nod; a gold check-mark glyph pops above each, one per beat.",
  "sfx": "Darbuka \"tek\" as each glyph column appears. ⟶ [22] Three ticks on the beat.",
  "cb": false,
  "lines": [
   {
    "text": "第125章：对每一位逐条[发誓]——",
    "t0": 63.93,
    "t1": 67.34,
    "from": 21
   },
   {
    "text": "“我没偷，没杀人，没[撒谎]。”",
    "t0": 67.34,
    "t1": 70.15,
    "from": 21
   }
  ]
 },
 {
  "n": 23,
  "a": 70.15,
  "b": 76.01,
  "sub": "“我没夺过婴儿嘴边的[奶]。”",
  "cue": "groove",
  "pic": "Quick vignette: a baby with a milk cup; your hand pointedly not reaching for it. The judge squints, then nods. ⟶ [merged 24] Your hand flat on your chest; behind you the giant scale catches a glint (camera glances at it and back: a plant for the twist).",
  "sfx": "Baby gurgle; tick. ⟶ [24] Metallic \"ting\" on the glint; tick.",
  "cb": false,
  "lines": [
   {
    "text": "“我没夺过婴儿嘴边的[奶]。”",
    "t0": 70.15,
    "t1": 73.2,
    "from": 23
   },
   {
    "text": "“我没在[秤]上做过手脚。”",
    "t0": 73.2,
    "t1": 76.01,
    "from": 23
   }
  ]
 },
 {
  "n": 25,
  "a": 76.01,
  "b": 79.61,
  "sub": "“我没有……[话太多]吧？”",
  "cue": "playful",
  "pic": "The judge labelled 「长角者」 slowly raises one brow; you freeze mid-sentence, a sweat drop; the music cuts out. ⟶ [merged 26] Centred question. The horned judge turns and stares straight at the viewer; slow push on his eyes.",
  "sfx": "Music stops dead; a single reed squeak; one cricket. ⟶ [26] Cricket; one tiny finger-cymbal \"tink\".",
  "cb": true,
  "lines": [
   {
    "text": "“我没有……[话太多]吧？”",
    "t0": 76.01,
    "t1": 79.61,
    "from": 25
   }
  ]
 },
 {
  "n": 27,
  "a": 79.61,
  "b": 86.42,
  "sub": "阿努比斯领你上秤，校准[秤砣]。",
  "cue": "tension",
  "pic": "Anubis (jackal head, black skin, gold collar) leads you to the scale by the hand, then kneels and steadies the plumb-bob with one finger; it swings, then settles. Low angle. Vertical label 「阿努比斯」. ⟶ [merged 28] Symmetric frame: heart on the left pan, feather on the right. Behind the feather Ma'at fades in (a woman with the tall ostrich feather on her head). Vertical label 「玛阿特」.",
  "sfx": "Footsteps; plumb-bob tick-tick-tick against the post. ⟶ [28] Two soft pan clinks, left then right.",
  "cb": false,
  "lines": [
   {
    "text": "阿努比斯领你上秤，校准[秤砣]。",
    "t0": 79.61,
    "t1": 83.13,
    "from": 27
   },
   {
    "text": "左边你的心，右边[真理]之羽。",
    "t0": 83.13,
    "t1": 86.42,
    "from": 27
   }
  ]
 },
 {
  "n": 29,
  "a": 86.42,
  "b": 89.0,
  "sub": "[托特]提笔，准备记录。",
  "cue": "tension",
  "pic": "Thoth (ibis head, white kilt) wets his reed pen on his palette; a baboon perches on top of the scale post, watching. Vertical label 「托特」.",
  "sfx": "Pen dipped in water; first scratch.",
  "cb": false,
  "lines": [
   {
    "text": "[托特]提笔，准备记录。",
    "t0": 86.42,
    "t1": 89.0,
    "from": 29
   }
  ]
 },
 {
  "n": 30,
  "a": 89.0,
  "b": 95.34,
  "sub": "秤下蹲着“吞噬者”[阿米特]。",
  "cue": "tension",
  "pic": "BLOOD-RED rim light. Ammit crouches beneath the scale, tail swishing, eyes fixed on your heart. Vertical label 「阿米特」. ⟶ [merged 31] Three-beat tilt down Ammit: crocodile head (jaws clack), lion forepart (mane ripples), hippo rear (it wiggles).",
  "sfx": "Low growl; claws scrape stone. ⟶ [31] Jaw clack / small roar / comic \"plop\" on the wiggle. (comic hits over the tension bed; the bed keeps going)",
  "cb": false,
  "lines": [
   {
    "text": "秤下蹲着“吞噬者”[阿米特]。",
    "t0": 89.0,
    "t1": 92.05,
    "from": 30
   },
   {
    "text": "鳄鱼头，狮子前身，[河马屁股]。",
    "t0": 92.05,
    "t1": 95.34,
    "from": 30
   }
  ]
 },
 {
  "n": 32,
  "a": 95.34,
  "b": 98.86,
  "sub": "秤旁还站着命运之神，在[围观]。",
  "cue": "tension",
  "pic": "Beside the scale (after Ani's sheet): Shai, god of Fate, and two birth goddesses stand with arms folded like spectators; your human-headed ba bird peeks from a little shrine. Vertical label 「命运之神 沙伊」.",
  "sfx": "A murmured \"mm-hm\"; ba-bird chirp. (bed thins to drone + one oud pluck)",
  "cb": false,
  "lines": [
   {
    "text": "秤旁还站着命运之神，在[围观]。",
    "t0": 95.34,
    "t1": 98.86,
    "from": 32
   }
  ]
 },
 {
  "n": 33,
  "a": 98.86,
  "b": 101.06,
  "sub": "秤盘开始[晃]……",
  "cue": "tension",
  "pic": "Extreme close-up: the pans wobble; your heart's pan dips a hair; the feather trembles. Anubis, Thoth and Ammit all lean in. Near-silence (named beat).",
  "sfx": "Heartbeat speeding up; chain creak; music drops to the drone only.",
  "cb": false,
  "lines": [
   {
    "text": "秤盘开始[晃]……",
    "t0": 98.86,
    "t1": 101.06,
    "from": 33
   }
  ]
 },
 {
  "n": 34,
  "a": 101.06,
  "b": 106.92,
  "sub": "等等——你胸口那只[甲虫]！",
  "cue": "sting",
  "pic": "Quick dissolve-push (no whip pan) to the green heart scarab on your chest; it lights up green-gold. ⟶ [merged 35] The scarab flips over; the lines of hieroglyphs on its underside light up one by one.",
  "sfx": "Finger-cymbal crash; rising glow hum. ⟶ [35] Stone flip; one chime per line.",
  "cb": false,
  "lines": [
   {
    "text": "等等——你胸口那只[甲虫]！",
    "t0": 101.06,
    "t1": 103.87,
    "from": 34
   },
   {
    "text": "背面的咒语，专防心[告密]：",
    "t0": 103.87,
    "t1": 106.92,
    "from": 34
   }
  ]
 },
 {
  "n": 36,
  "a": 106.92,
  "b": 109.73,
  "sub": "“心啊，别站出来[指控]我！”",
  "cue": "playful",
  "pic": "Up on the scale, the jar-shaped heart lifts its lid like a mouth about to speak; a gold ribbon of spell glyphs wraps round it and the lid clicks shut. The heart \"smiles\" innocently.",
  "sfx": "Lid creak; glyph ribbon \"zip\"; click.",
  "cb": false,
  "lines": [
   {
    "text": "“心啊，别站出来[指控]我！”",
    "t0": 106.92,
    "t1": 109.73,
    "from": 36
   }
  ]
 },
 {
  "n": 37,
  "a": 109.73,
  "b": 116.54,
  "sub": "当年的埃及人，称心时就念[这段咒]。",
  "cue": "playful",
  "pic": "REAL ANCHOR: the Ani weighing scene (BM EA 10470/3) redrawn: Ani and Tutu bow at the left; a gold underline runs along the text above Ani as if he were whispering it. Vertical labels 「阿尼」「图图」. ⟶ [merged 38] Ani, still bowing, slides one eye to the camera and winks.",
  "sfx": "Low whispering under the music. (bed thins: reed solo under the real papyrus) ⟶ [38] A bright \"ting\" on the wink.",
  "cb": false,
  "lines": [
   {
    "text": "当年的埃及人，称心时就念[这段咒]。",
    "t0": 109.73,
    "t1": 113.73,
    "from": 37
   },
   {
    "text": "作弊？他们管这叫[魔法]。",
    "t0": 113.73,
    "t1": 116.54,
    "from": 37
   }
  ]
 },
 {
  "n": 39,
  "a": 116.54,
  "b": 123.83,
  "sub": "博物馆有只甲虫，不是给她[定做]的——",
  "cue": "playful",
  "pic": "REAL ANCHOR: museum case at the Met: Hatnefer's gold-mounted green heart scarab on its gold chain; macro: old signs sanded away, her name cut into the same spot. Vertical label 「哈特妮菲尔」. ⟶ [merged 40] A small reed tag reading 「改名」 swings onto the scarab; Hatnefer's silhouette shrugs.",
  "sfx": "Glass-case hum; sanding rasp; three chisel taps. ⟶ [40] Tag \"tink\"; a sly darbuka roll.",
  "cb": false,
  "lines": [
   {
    "text": "博物馆有只甲虫，不是给她[定做]的——",
    "t0": 116.54,
    "t1": 120.54,
    "from": 39
   },
   {
    "text": "只是磨掉旧字，改个名，[照用]。",
    "t0": 120.54,
    "t1": 123.83,
    "from": 39
   }
  ]
 },
 {
  "n": 41,
  "a": 123.83,
  "b": 126.03,
  "sub": "可如果，秤[歪]了——",
  "cue": "sting",
  "pic": "BLOOD RED. The heart's pan drops with a bang; the feather flips up; Ammit springs.",
  "sfx": "Pan crash; roar.",
  "cb": false,
  "lines": [
   {
    "text": "可如果，秤[歪]了——",
    "t0": 123.83,
    "t1": 126.03,
    "from": 41
   }
  ]
 },
 {
  "n": 42,
  "a": 126.03,
  "b": 129.08,
  "sub": "阿米特一口，[吞]掉你的心。",
  "cue": "tension",
  "pic": "Ammit's jaws close on the heart in silhouette; cut on the bite to a red flash, then black.",
  "sfx": "CHOMP, then silence.",
  "cb": false,
  "lines": [
   {
    "text": "阿米特一口，[吞]掉你的心。",
    "t0": 126.03,
    "t1": 129.08,
    "from": 42
   }
  ]
 },
 {
  "n": 43,
  "a": 129.08,
  "b": 132.37,
  "sub": "这叫“[第二次死亡]”：彻底消失。",
  "cue": "tension",
  "pic": "Your silhouette crumbles to sand and blows away into the dark; nothing is left.",
  "sfx": "Sand-dissolve whoosh; music dead stop at the end of the line.",
  "cb": false,
  "lines": [
   {
    "text": "这叫“[第二次死亡]”：彻底消失。",
    "t0": 129.08,
    "t1": 132.37,
    "from": 43
   }
  ]
 },
 {
  "n": 44,
  "a": 132.37,
  "b": 134.57,
  "sub": "如果秤[平]了——",
  "cue": "paradise",
  "pic": "The sand rewinds into your shape; the pans level exactly; gold light floods the hall.",
  "sfx": "Reverse whoosh; bright chime as the beam levels.",
  "cb": false,
  "lines": [
   {
    "text": "如果秤[平]了——",
    "t0": 132.37,
    "t1": 134.57,
    "from": 44
   }
  ]
 },
 {
  "n": 45,
  "a": 134.57,
  "b": 140.91,
  "sub": "荷鲁斯牵你，去见[奥西里斯]。",
  "cue": "paradise",
  "pic": "Horus (falcon head, double crown) leads you by the hand to a shrine: Osiris enthroned (green skin, white plumed crown, crook and flail), Isis and Nephthys behind. Vertical labels 「荷鲁斯」「奥西里斯」「伊西斯」. ⟶ [merged 46] Thoth writes; the verdict glyph glows gold on his palette; Osiris lowers his crook in assent.",
  "sfx": "Sistrum shimmer; footsteps. ⟶ [46] Pen scratch; a warm low gong.",
  "cb": false,
  "lines": [
   {
    "text": "荷鲁斯牵你，去见[奥西里斯]。",
    "t0": 134.57,
    "t1": 137.86,
    "from": 45
   },
   {
    "text": "托特记下：此人诚实，[通过]。",
    "t0": 137.86,
    "t1": 140.91,
    "from": 45
   }
  ]
 },
 {
  "n": 47,
  "a": 140.91,
  "b": 144.67,
  "sub": "你进入[芦苇之野]：完美版的埃及。",
  "cue": "paradise",
  "pic": "NILE GREEN: endless fields cut by blue canals under a bright sky; palms; a reed boat (after Ani sheet 35). Wide crane over.",
  "sfx": "Birdsong; water.",
  "cb": false,
  "lines": [
   {
    "text": "你进入[芦苇之野]：完美版的埃及。",
    "t0": 140.91,
    "t1": 144.67,
    "from": 47
   }
  ]
 },
 {
  "n": 48,
  "a": 144.67,
  "b": 147.48,
  "sub": "但是——天堂里，也要[种地]。",
  "cue": "playful",
  "pic": "You behind a plough and two oxen, sweating, deadpan to camera; the grain beside you is taller than you.",
  "sfx": "Ox moo; plough scrape; the music hiccups.",
  "cb": true,
  "lines": [
   {
    "text": "但是——天堂里，也要[种地]。",
    "t0": 144.67,
    "t1": 147.48,
    "from": 48
   }
  ]
 },
 {
  "n": 49,
  "a": 147.48,
  "b": 153.81,
  "sub": "所以，你带了一箱小人：[沙布提]。",
  "cue": "playful",
  "pic": "You open a painted box; dozens of small blue-glazed mummiform figurines holding hoes stand up in rows. Vertical label 「沙布提」. ⟶ [merged 50] A summons is read off a papyrus; the shabtis snap upright in unison and march into the field, hoes on shoulders.",
  "sfx": "Box lid creak; tiny clatter. ⟶ [50] Tiny squeaky chorus on 「我在」; marching taps on the beat. (playful bed, darbuka doubles for the march)",
  "cb": false,
  "lines": [
   {
    "text": "所以，你带了一箱小人：[沙布提]。",
    "t0": 147.48,
    "t1": 151.0,
    "from": 49
   },
   {
    "text": "一点名，它们就答：“[我在]！”",
    "t0": 151.0,
    "t1": 153.81,
    "from": 49
   }
  ]
 },
 {
  "n": 51,
  "a": 153.81,
  "b": 157.45,
  "sub": "后来全套：365个干活，36个[监工]。",
  "cue": "playful",
  "pic": "Wide: the field fills with shabtis in a grid, counter rolls to 401; split: 365 hoeing in rows, 36 larger overseer figures in kilts pointing with whips, one per block. Stamp: 「约公元前1000年」.",
  "sfx": "Hoe chops on the beat; one comic whip crack.",
  "cb": true,
  "stamp": {
   "era": "约公元前1000年",
   "place": ""
  },
  "lines": [
   {
    "text": "后来全套：365个干活，36个[监工]。",
    "t0": 153.81,
    "t1": 157.45,
    "from": 51
   }
  ]
 },
 {
  "n": 52,
  "a": 157.45,
  "b": 159.65,
  "sub": "你呢？躺着就行。",
  "cue": "paradise",
  "pic": "You drift in a reed boat on a canal, hands behind your head, eyes closed; shabtis harvest in the background.",
  "sfx": "Water; birds; a contented sigh.",
  "cb": false,
  "lines": [
   {
    "text": "你呢？躺着就行。",
    "t0": 157.45,
    "t1": 159.65,
    "from": 52
   }
  ]
 },
 {
  "n": 53,
  "a": 159.65,
  "b": 162.94,
  "sub": "而纸草上，结局早就[画好]了。",
  "cue": "mystic",
  "pic": "Pull back: the paradise is a vignette on the Ani papyrus; the scroll rolls up and settles into a museum case. Stamp: 「今天 · 伦敦 大英博物馆」.",
  "sfx": "Scroll rolling; museum hush.",
  "cb": false,
  "stamp": {
   "era": "今天",
   "place": "伦敦 大英博物馆"
  },
  "lines": [
   {
    "text": "而纸草上，结局早就[画好]了。",
    "t0": 159.65,
    "t1": 162.94,
    "from": 53
   }
  ]
 },
 {
  "n": 54,
  "a": 162.94,
  "b": 165.75,
  "sub": "画成“通过”，就[一定通过]。",
  "cue": "mystic",
  "pic": "Back to the starry hall: the beam settles exactly level, heart and feather side by side; the dim to the end card begins.",
  "sfx": "One last heartbeat; final reed note, then dead stop on the cut.",
  "cb": false,
  "lines": [
   {
    "text": "画成“通过”，就[一定通过]。",
    "t0": 162.94,
    "t1": 165.75,
    "from": 54
   }
  ]
 },
 {
  "n": 55,
  "a": 165.75,
  "b": 171.75,
  "sub": "你的心，和羽毛一样[轻]吗？",
  "cue": "mystic → dead stop",
  "pic": "END CARD: the last shot dims to ~30 %; red J seal pressed in; film title 《死后的心脏》 (two lines); the closing question centred; pill 「关注 Juno · 一起探索世界」; sources line (below). Hold 6.0 s, fade to black.",
  "sfx": "Music already stopped (dead stop before the card); seal-press thump; one finger-cymbal ring-out.",
  "cb": false,
  "lines": [
   {
    "text": "你的心，和羽毛一样[轻]吗？",
    "t0": 165.75,
    "t1": 171.75,
    "from": 55
   }
  ]
 }
];
export const FILM_END = SHOTS[SHOTS.length - 1].b;
export const FPS = 30;
export const shot = (n: number) => SHOTS.find((s) => s.n === n)!;
