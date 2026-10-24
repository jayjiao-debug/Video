# Script: 《为了跟你说一句话，人类努力了三千年》 (v3)

**Logline:** Someone asks what was said on the first phone call. To understand the answer we go back 3,000 years and follow one sentence at a time, ending with the brain waves of a woman in love leaving the solar system on a golden record.
**Takeaway:** 人类发明的每一种传话方式，都是为了离想见的人近一点. The first sentence on a telephone was "I want to see you"; the farthest-travelled one says "come visit".
**Length:** 188.1 s on the fixed music map in brief_v3.md (all times are film times). The title is fixed, so no title options are given.
**Files:** this script; `lines_v3.json` holds the same subtitles with display times (checked with pace.py: 0 too fast, 4 % waiting).

Screenwriter, 2026-10-24, rewritten after facts.md (00:24) and storyboard_v3.md (00:23) arrived.
- **Fact #** cites facts.md rows.
- **[verify]** marks a row that is still PENDING, or a claim facts.md has no row for. The researcher needs to clear these before recording.
- Transitions follow storyboard_v3.md wherever it already has a good one. My own proposals are labelled.

---

## Owner notes → what changed

| Note | What changed in the script |
|---|---|
| 2: opening boring | The cold open moves from frame 0: a phone call dives into the earpiece and races back along a wire to Bell's window. The hook question is voiced over that move, and a second voiced line promises the answer (答案，要从三千年前说起). |
| 3: rewind | The rewind lasts exactly one bar (9.30–11.564) and is a VHS ◀◀ REW with the year counter spinning back. No voice. |
| 6: Bell static | One man in one room. The camera pushes in on him, holds a voiceless build, then he speaks. We travel **inside the wire**: Watson listens, comes through his door into Bell's room, and the two men face each other. |
| 7: silent captions | **Every story subtitle has a voice**, including the crash line (voiced inside the 1.5 s total silence) and the hook answer (voiced by the same Chinese voice that asked the hook). The only unvoiced text is titles and labels: the film title, era labels, the S = · · · tag, the 《流水》 tape label and the end card. |
| 8: Marconi logic | The chain is voiced in order: Cornwall sends one letter, S, again and again → across the Atlantic a kite lifts the aerial to catch it → "Can you hear anything, Mr Kemp?" → three short sounds: that is S, and it crossed the Atlantic. The lost kite is gone from both picture and voice. |
| 10: 1977 call | The real exchange from that call is voiced by two new voices: "For keeps?" / "You mean… get married?" / "Yes." (fact V2). The split screen closes into one frame on "Yes." The record is cut and the rocket launches on the last climax bars, and the outro opens on her recording in the hush. |
| 11: finale | The cast stands on the ground of a hilltop at night. Voyager is shown in real 3D detail (fact P-V2). |
| 12: 运镜/转场 | Each era hand-over is a different motivated move; see "Transition out" in every block. |
| 1, 4, 5, 9 | The beats name only era-correct props (no envelope in 757, a wax-sealed folded sheet in 1825, no paper tape for Morse, Kline **seated and typing** with lamps on the panels and lights in the ceiling). Everything stands on its own ground. |

**Facts that changed v2 lines:**
- Watson → **沃森** (the 华生 transliteration is Sherlock's Watson).
- Bell's other room is "another room", not "next door" (B1, B4).
- "Clicks" → "three short sounds = S" (M2).
- ARPANET is "hundreds of miles", not 350 (A4), and the reply is "Got the L" (A2).
- The six-day wait in Beijing was the mail program locking up (E2).
- The subtitle uses Xinhua's rendering 「越过长城，走向世界」 (E3).
- Druyan's recording was **brain waves** and body sounds; the heartbeat is still unconfirmed (V3).
- **The real 1860 Scott recording is CC BY** (S4), so we can use it instead of a TTS stand-in.

v2 lines dropped:
- "风，卷走了其中一只" (the lost kite)
- "一封信可能要走好几个月 / 也可能，永远到不了" (no source)
- "那一天，真的下雨了" (SH2 PENDING)
- "放进火里烤" (wrong method)
- the voiced end title

---

## Voices

| Voice | Who | Lines |
|---|---|---|
| **ZH** | Chinese frame narrator: warm, intimate, about 30 | H1–2, 商, 杜甫, **B3 (the hook answered)**, 北京, outro |
| EN-US | American narrator | 莫尔斯, 阿帕网, 1977 |
| FR | French narrator | 斯科特 |
| EN-SC | Scottish narrator | 贝尔 |
| IT | Italian narrator | 马可尼 |
| Q-商 | 贞人: old man, chant-like, echo | SQ |
| Q-杜 | 杜甫: about 45, weary, recited | DQ |
| Q-莫 | Morse: 53, American, slow | MQ |
| Q-斯 | **Real First Sounds recording** (CC BY, credit on the end card), or crackly TTS as fallback | CQ |
| Q-贝 | Bell: 29, Scottish-born, **shouted** (B1: "I then shouted into M") | BQ |
| Q-马 | Marconi: 27, Italian-accented English, quiet | KQ |
| Q-克 / Q-杜瓦 | Kline (21, A5) / Duvall: telephone-headset filter | AQ1–3 / AA1–2 |
| Q-京 | Email voice: calm adult reading English, no named sender (E4) | JQ |
| Q-德 / Q-萨 | Druyan / Sagan: soft, phone filter, close | VQ1–3 |
| Q-唱片 | Golden Record Mandarin greeting: warm, space echo | O2 |

**How durations are estimated:**
- zh: syllables ÷ 4.5 + 0.3 s per internal pause.
- en: spoken words ÷ 2.6; fr/it: ÷ 2.8. Numbers count as spoken words.
- Quotes and dialogue get fixed, deliberate lengths.
- The v2 Chinese clips ran about 3.5 字/s with pauses, so zh lines may come out about 10 % longer. Every block has slack before its end.

**Subtitles:**
- The Chinese line is always shown, with the native line above it when the line is not Chinese.
- No subtitle line is over 22 字.
- Display runs from voice start − 0.05 s to min(voice end + 0.6, next line − 0.1). Exact windows are in `lines_v3.json`.

---

## Block 0 · Cold open, 0.00–9.30 (quiet intro)
**What we see** (my proposal; it joins the storyboard's C1/C2 at 3.2 s):
1. **0.00:** A phone fills the frame at night. A thumb has just tapped the green call button, the ring pulses, and the screen reads 正在呼叫… · 妈. It is moving and subtitled on frame 0, and it shows the viewer's own situation.
2. **0.8–3.2:** The camera dives into the earpiece grille. The call becomes light in a fibre, then a copper wire, and we race along it at night. Poles whip past while the world grows older: LED streets become neon, then gas lamps.
3. **3.2–8.8 (storyboard C1→C2):** The wire leads over 1876 Boston roofs to one lit top-floor window (P-B1). We push to the glass: Bell bends over the funnel of his liquid transmitter (P-B2) and draws a breath.
4. **9.30:** His lips part and the frame **freezes**.

| # | Speaker | Lang | Native | 中文字幕 | Start | Dur | End | Fact # |
|---|---|---|---|---|---|---|---|---|
| H1 | ZH | zh | — | 人类打出的第一通电话， / 第一句话，说的是什么？ | 0.20 | 4.5 | 4.70 | brief (hook) |
| H2 | ZH | zh | — | 答案，要从三千年前说起。 | 6.25 | 2.5 | 8.75 | — |

Voiced 7.0 / 9.3 s (76 %, the hook needs it). The H2 subtitle clears at 9.25.
**Transition out:** freeze on his parted lips, then the VHS rewind.

## Block 1 · Rewind, 9.30–11.564 (one bar)
**What we see:** ◀◀ REW, tracking-noise bands, a timecode running backwards and a year counter spinning 1876 → 1860 → 1844 → 1825 → 757 → 前1200. Each era flashes for 6–8 frames, played backwards: Scott's moon, the telegraph key, a wax-sealed letter, beacon fires, a crack running back into a shell. **No voice.** The sound is a tape-rewind squeal.
**Transition out:** the tape slows and ▶ PLAY lands on the Shang night sky (storyboard R1).

## Block 2 · Title, 11.564–18.965 (build)
**What we see:** The title slams in on the bar line: 为了跟你说一句话 / 人类努力了三千年 (gold), with a gold line under it. Then a slow tilt down. **No voice** (it is an on-screen title).
**Transition out:** tilt down from the sky to the Shang plain (storyboard T1).

## Block 3 · 商, 18.965–34.836 (verse)
Label: 约公元前 1200 年 · 商 · 殷墟 **[verify the date wording]**
**What we see** (storyboard SH1–SH5):
1. A diviner walks with a plastron in both hands toward a fire before rammed-earth halls that stand on the ground. He reaches it and **kneels** (S1).
2. He lifts his face and asks the sky. Wind; clouds roll in from the east, on the right (SQ).
3. A glowing thorn-wood brand touches the back of the shell. *Crack*: on the front, the 卜 crack grows on the beat (S2).
4. Characters appear beside the crack and glow gold. He raises the shell to the sky (S3). ⚠ The storyboard's SH4/SH5 show rain arriving. **Don't show rain falling until SH2 (a rain 验辞) is ✓.** Clouds gathering are fine.

| # | Speaker | Lang | Native | 中文字幕 | Start | Dur | End | Fact # |
|---|---|---|---|---|---|---|---|---|
| S1 | ZH | zh | — | 商朝人有一句话，想问老天。 | 19.40 | 2.5 | 21.90 | SH1 [verify] |
| SQ | Q-商 (echo) | 古汉语 | 其自东来雨？ | 「雨，会从东边来吗？」 | 22.40 | 2.0 | 24.40 | SH1 (text ✓ news; 合集12870 PENDING) |
| S2 | ZH | zh | — | 火烤龟甲，裂纹就是回答。 | 24.90 | 2.5 | 27.40 | **[verify: brand on drilled hollows; 龟甲 vs 牛骨 for this piece]** |
| S3 | ZH | zh | — | 刻下的这句问话，留到了今天。 | 27.90 | 3.0 | 30.90 | SH1 |

Voiced 10.0 / 15.9 s (63 %).
**Transition out:** match cut from the glowing cracks to blossom branches (storyboard SH5→D1).

## Block 4 · 杜甫, 34.836–54.875 (full)
Label: 757 年 · 杜甫 · 长安
**What we see** (storyboard D1–D4):
1. Dolly back through an apricot tree. Du Fu walks in past rammed-earth walls and a gate, with 大雁塔 behind on its own ground (D1).
2. Tracking walk: Du Fu, stooped, passes a rebel patrol on the wall and a ruined hall. He turns his head north (D2).
3. He stops at a breach, stands and looks up. Beacon towers light one after another along the ridges (D3, DQ). The ten characters of the line write themselves faintly in the sky as he recites.
4. A Tang courier gallops below with a letter tube (no envelope) (music only).

| # | Speaker | Lang | Native | 中文字幕 | Start | Dur | End | Fact # |
|---|---|---|---|---|---|---|---|---|
| D1 | ZH | zh | — | 757年，长安被叛军攻破。 | 35.30 | 3.2 | 38.50 | DF1 [verify] |
| D2 | ZH | zh | — | 杜甫困在城里，不知道家人还在不在。 | 39.00 | 3.6 | 42.60 | DF1 [verify 《述怀》"不知家在否"; fallback 「和家人断了音信」] |
| D3 | ZH | zh | — | 那年春天，他写下： | 43.10 | 1.9 | 45.00 | brief (春望 757) [verify] |
| DQ | Q-杜 | 古汉语 | 烽火连三月，家书抵万金。 | 「战火连烧三个月，一封家书抵得上万两黄金。」 | 45.50 | 4.2 | 49.70 | 《春望》 |

Voiced 12.9 / 20.0 s (64 %).
**Transition out:** match cut on the gallop, from the Tang courier to an 1825 post rider (storyboard D4→MO1).

## Block 5 · 莫尔斯, 54.875–73.015 (full, pulse)
Label: 1825 年 · 画家莫尔斯 · 华盛顿 → at M3: 1844 年 · 华盛顿→巴尔的摩
**What we see** (storyboard MO1–MO5):
1. A post rider on a snowy road reaches a house. Inside, Morse stands at his easel (a Lafayette canvas) and reads the folded, wax-sealed letter. His brush drops (M1).
2. He walks the road, slows, and stops in a churchyard at a fresh grave. Hat off, head bowed (M2).
3. Crane up into a time-lapse of seasons. Poles rise along the road; the Capitol (1844) (M3).
4. Morse sits at the key. His finger presses (MQ), and the pulse rides the wire fast toward Baltimore. **No paper tape.**

| # | Speaker | Lang | Native | 中文字幕 | Start | Dur | End | Fact # |
|---|---|---|---|---|---|---|---|---|
| M1 | EN-US | en | A letter told Samuel Morse his wife had died. | 一封信告诉莫尔斯：他的妻子去世了。 | 55.30 | 3.5 | 58.80 | MO1 PENDING (brief: NatGeo) |
| M2 | EN-US | en | When he got home, she was already buried. | 等他赶回家，她已经下葬了。 | 59.30 | 3.1 | 62.40 | MO1 PENDING |
| M3 | EN-US | en | Nineteen years later, his telegraph sent words in an instant: | 十九年后，他的电报，一瞬间就把话送到： | 63.30 | 3.9 | 67.20 | MO2 PENDING |
| MQ | Q-莫 | en | What hath God wrought. | 「上帝创造了何等奇迹。」 | 67.80 | 2.2 | 70.00 | MO2 PENDING |

Voiced 12.6 / 18.1 s (69 %). Nothing says the death inspired the telegraph; the two moments simply sit side by side (brief).
**Transition out:** along a line, the wire wobbles into a sound trace (storyboard MO5→S1).

## Block 6 · 斯科特, 73.015–90.845 (full)
Label: 1860 年 4 月 9 日 · 斯科特 · 巴黎 (the counter runs 1860 → 2008 at C2)
**What we see** (storyboard S1–S4):
1. We pull back from the trace. Scott cranks the drum and **sings into the horn, but we hear nothing**: only the stylus scratching a wavy line in the soot (C1).
2. He holds the sheet to the lamp. The lamp gutters and time passes, and the counter runs to 2008 (C2).
3. Close on the sheet as a scan bar sweeps it. The trace glows and **becomes sound**: the real 1860 voice (CQ).
4. Tilt up through the window to the moon. In a double exposure, his singing silhouette now matches the sound (C3).

| # | Speaker | Lang | Native | 中文字幕 | Start | Dur | End | Fact # |
|---|---|---|---|---|---|---|---|---|
| C1 | FR | fr | Scott invente une machine qui écrit la voix. | 斯科特造了一台机器，能把声音写下来。 | 73.50 | 2.9 | 76.40 | S2 ✓ (traces on soot paper) |
| C2 | FR | fr | Mais personne ne pourra l'écouter avant cent quarante-huit ans. | 可这声音，要等148年，才有人听见。 | 76.90 | 3.6 | 80.50 | S1, S2 ✓ (1860 → 2008) |
| CQ | Q-斯 (real recording) | fr | Au clair de la lune… | 「在月光下……」 | 81.30 | 3.0 | 84.30 | S1, S4 ✓ CC BY |
| C3 | FR | fr | Le chanteur ? Sans doute lui-même. | 唱歌的人，很可能就是他自己。 | 84.90 | 2.1 | 87.00 | S3 ✓ ("很可能") |

Voiced 11.5 / 17.8 s (65 %). The native line shows only the first four words, so it matches whatever the excerpt actually sings **[verify the lyric of the chosen excerpt]**.
**Transition out:** match cut from the Paris moon to the full moon in Bell's window (storyboard S4→B1).

## Block 7 · 贝尔, 90.845–110.385 (full)
Label: 1876 年 3 月 10 日晚 · 贝尔 · 波士顿
**What we see** (storyboard B1–B6, retimed to these lines):
1. **One man, one room** (P-B1: a top floor, the door closed). Pull back from the moon into the room: Bell at the table with the liquid transmitter (P-B2) and the wire leaving through the wall (B1).
2. **95.2–96.6, voiceless push-in, accelerating:** he bends over the funnel. This is the pause before the hit.
3. He **shouts** into the mouthpiece. We push into the funnel and go **through the object into the wire** (B4 tunnel, ~99.6–100.9): a copper tunnel with his voice as a gold pulse (BQ).
4. We come out of the receiver's mouth beside Watson's ear (P-B3: a small instrument with an armature, **not** a handset). Watson **listens**, then stands, and walks out through his door (B2).
5. **Letterbox in.** Bell's door opens and Watson walks in. Bell turns, and the two men face each other in the lamplight (B3).

| # | Speaker | Lang | Native | 中文字幕 | Start | Dur | End | Fact # |
|---|---|---|---|---|---|---|---|---|
| B1 | EN-SC | en | Bell's wire runs to another room, where Watson waits. | 贝尔的电线通到另一个房间，沃森在那头等着。 | 91.30 | 3.9 | 95.20 | B1, B4 ✓ |
| BQ | Q-贝 (shouted) | en | Mr. Watson — Come here — I want to see you. | 「沃森先生——过来——我想见你。」 | 96.60 | 3.0 | 99.60 | B1 ✓ notebook |
| B2 | EN-SC | en | Watson heard it — and he came. | 沃森听见了——他真的来了。 | 101.20 | 2.2 | 103.40 | B2 ✓ |
| B3 | **ZH** (hook voice) | zh | — | 人类第一通电话的第一句话， / 是：「我想见你」。 | 104.00 | 4.1 | 108.10 | B1 ✓ wording; **[verify: add a row saying 10 Mar 1876 is the first intelligible sentence by telephone (LOC)]** |

Voiced 13.1 / 19.5 s (67 %).
- B3 is deliberately in the Chinese frame voice: the voice that asked at 0:00 answers.
- Watson's own memory of the words was different (B1). We use the notebook, written that night; the producer may add a small tag 「贝尔当晚的笔记」.
- **No acid spill** (B4).

**Transition out:** through the light: the lamp flame becomes the spark of the Poldhu transmitter (storyboard B6→M1).

## Block 8 · 马可尼, 110.385–127.265 (breakdown build)
Label: 1901 年 12 月 12 日 · 康沃尔 → 纽芬兰 · 约 3400 公里 (M1, M3)
**What we see** (storyboard M1–M4, retimed):
1. **Poldhu:** we pull back from the spark through the window. An operator at the key, the aerial masts, sunset. A big tag reads **S = · · ·**, and three rings fly west (K1).
2. **114.1–115.2:** a whip pan right and a track over the Atlantic, following the rings (music).
3. **Signal Hill in a gale** (P-M1, P-M2): beside Cabot Tower an assistant holds the line of a big linen kite on bamboo spars. Tilt down along the aerial wire to the old hospital building (K2). **No lost kite.**
4. Inside, by candlelight, Marconi sits **listening** with a telephone earpiece (P-M3). He holds it out to Kemp, who bends to listen (KQ).
5. **121.95 / 122.25 / 122.55:** three short sounds. Three small sparks come down the kite wire into the earpiece, and Kemp's head lifts (K3).

| # | Speaker | Lang | Native | 中文字幕 | Start | Dur | End | Fact # |
|---|---|---|---|---|---|---|---|---|
| K1 | IT | it | Dalla Cornovaglia, una stazione ripete una sola lettera: S. | 英国康沃尔的电台，一遍遍只发一个字母：S。 | 110.85 | 3.2 | 114.05 | M2 ✓ |
| K2 | IT | it | Oltreoceano, un aquilone alza l'antenna per catturarla. | 大西洋对岸，风筝把天线拉上天，接住它。 | 115.20 | 2.5 | 117.70 | M4 ✓ |
| KQ | Q-马 | en | Can you hear anything, Mr Kemp? | 「肯普先生，你听到什么了吗？」 | 119.40 | 2.3 | 121.70 | M5 ✓ (documented in English) |
| K3 | IT | it | Tre brevi suoni: la S. Aveva attraversato l'Atlantico. | 三声短响，就是S——它越过了大西洋。 | 123.00 | 3.2 | 126.20 | M2 ✓ (three dots = S), M1 |

Voiced 11.2 / 16.9 s (66 %). Every causal link is voiced: **what** (S), **from where** (Cornwall), **how it is caught** (a kite lifts the aerial), **who hears** (Kemp), **result** (it crossed the Atlantic).
**Transition out:** match cut from the three dots to three panel lamps on a 1969 cabinet (storyboard M4→A1).

## Block 9 · 阿帕网, 127.265–145.70 (build → total silence 144.165–145.70)
Label: 1969 年 10 月 29 日晚 · 阿帕网 · UCLA → SRI (no clock time; A1)
**What we see** (storyboard A1–A4):
1. Dolly out from the lamps. Indicator lamps sit **on** the cabinet panels and fluorescent lights **in** the ceiling. Charley Kline sits at a teletype with a telephone headset (P-A1) (A1).
2. A lateral dolly past the IMP to a chalkboard and back. ⚠ **The chalkboard must not read "350 MILES"** (A4 sources disagree); use 「UCLA → SRI」 only (A2).
3. Close-ups cut on the beats: he types L, and L appears at SRI. Phone: "Got the L." Then O. Then G… (AQ1–AQ3).
4. **144.165, the crash:** the lamps die, the music stops, and the paper holds only **LO**. The narrator speaks inside the silence (A3).

| # | Speaker | Lang | Native | 中文字幕 | Start | Dur | End | Fact # |
|---|---|---|---|---|---|---|---|---|
| A1 | EN-US | en | The internet's ancestor is about to send its first message. | 互联网的前身，要发出第一条消息了。 | 127.75 | 3.9 | 131.65 | A1, A3 ✓ |
| A2 | EN-US | en | Charley Kline types "login" to a computer hundreds of miles away. | 克莱恩要给几百公里外的电脑，敲一个词：login。 | 132.10 | 3.9 | 136.00 | A1 ✓, A4 ✓ ("几百公里") |
| AQ1 | Q-克 | en | Did you get the L? | 「收到 L 了吗？」「收到 L 了。」 (one subtitle for the pair) | 136.80 | 1.0 | 137.80 | A2 ✓ |
| AA1 | Q-杜瓦 | en | Got the L. | ↑ | 138.20 | 0.8 | 139.00 | A2 ✓ |
| AQ2 | Q-克 | en | Did you get the O? | 「收到 O 了吗？」「收到 O 了。」 | 139.40 | 1.0 | 140.40 | A2 ✓ |
| AA2 | Q-杜瓦 | en | Got the O. | ↑ | 140.80 | 0.8 | 141.60 | A2 ✓ |
| AQ3 | Q-克 | en | Did you get the G? | 「收到 G 了吗？」 | 142.30 | 1.1 | 143.40 | A2 ✓ ("at which point the system crashed") |
| A3 | EN-US (dry, close) | en | Then the system crashed. | 然后，系统崩溃了。 | 144.30 | 1.35 | 145.65 | A2, A3 ✓ |

Voiced 13.7 / 18.4 s (75 %, the most voiced block, because it is dialogue). **The G question is never answered:** silence instead.
**Transition out:** match on text. "LO" on the paper becomes text on a 1987 CRT (storyboard A4→BJ1).

## Block 10 · 北京, 145.70–160.885 (filtered → climax hit 154.095)
Label: 1987 年 9 月 · 中国第一封电子邮件 · 北京
**What we see** (storyboard BJ1–BJ3):
1. Pull back from the CRT. Chinese and German scientists sit around a terminal of the Siemens system at ICA (E4, E5; **nobody named**). A tear-off calendar reads 14 (J1).
2. **Locked time-lapse:** the calendar tears 14 → 20 on the beats while the window cycles day and night. The figures change pose each day (sit, stand, listen) and the screen holds a frozen cursor (J2).
3. **152.4–154.1, wind-up:** a finger hovers over Enter while the picture holds.
4. **154.095:** Enter on the hit. **Letterbox.** We crane out of the window and fly north: a line of light over Beijing's roofs and over the Great Wall on its ridge at night (JQ).

| # | Speaker | Lang | Native | 中文字幕 | Start | Dur | End | Fact # |
|---|---|---|---|---|---|---|---|---|
| J1 | ZH | zh | — | 中国的第一封电子邮件，写好了。 | 146.45 | 3.0 | 149.45 | E1 ✓ (14 Sep, evening) |
| J2 | ZH | zh | — | 可程序卡住了，整整六天。 | 149.90 | 2.5 | 152.40 | E1, E2 ✓ (deadlock; sent 20 Sep) |
| JQ | Q-京 | en | Across the Great Wall we can reach every corner in the world. | 「越过长城，走向世界。」 | 154.10 | 4.8 | 158.90 | E3 ✓ (Xinhua rendering) |

Voiced 10.3 / 15.2 s (68 %). The email also had a German line first (E3); we voice only the English.
**Transition out:** along a line, the light becomes a telephone wire into 1977 (storyboard BJ3→V1).

## Block 11 · 1977, 160.885–172.935 (climax; the emotional peak; letterbox throughout)
Label: 1977 年 6 月 · 旅行者号金唱片 (V1)
**What we see** (storyboard V1–V4, plus the launch):
1. **160.9–164.2:** push in on Ann **sitting** by the window at night. A tape box reads **《流水》· 古琴 · 管平湖** (V4). She dials the rotary phone (V1).
2. **164.2–166.0:** a whip along the line across a moonlit continent into a **Tucson hotel room** (P-V1). A 1-s insert: the message slip *Annie called* on the bed. Carl picks up (VQ1).
3. **166.0–168.3:** shot and reverse shot on the beats, both **speaking and listening** in warm lamplight (VQ1, VQ2).
4. **168.3–169.5:** the split screen closes on **"Yes."**: two windows become one frame under one moon, and both **stand** (VQ3).
5. **169.5–172.9 (music):** the song plays on. A cutting stylus cuts the groove into the gold disc, which is bolted to Voyager's side (V8). Then the **launch**: the Titan-Centaur lifts (V6) and its trail arcs up off the Earth.

| # | Speaker | Lang | Native | 中文字幕 | Start | Dur | End | Fact # |
|---|---|---|---|---|---|---|---|---|
| V1 | EN-US (soft) | en | Ann Druyan found the Chinese song — and called Carl Sagan. | 安·德鲁扬找到了那首中国古曲，打给卡尔·萨根。 | 161.25 | 3.9 | 165.15 | V1 ✓, V4 ✓ |
| VQ1 | Q-德 (phone) | en | For keeps? | 「是一辈子吗？」「你是说……结婚？」 (one subtitle with VQ2) | 165.60 | 0.9 | 166.50 | V2 ✓ |
| VQ2 | Q-萨 (phone) | en | You mean… get married? | ↑ | 166.90 | 1.5 | 168.40 | V2 ✓ |
| VQ3 | Q-德 (phone, a breath) | en | Yes. | 「是。」 | 168.80 | 0.6 | 169.40 | V2 ✓ |

Voiced 6.8 / 12.05 s (57 %). The extra music is deliberate: the song, the record cut and the launch get the last climax bars.
- **Sequence [verify]:** V1 says she *called* him. Per V1 she left a message and he rang back an hour later, so the hotel insert shows the slip. If the director wants it simpler, cut the slip; the line stays true.
- **[verify V2]:** the full wording around "for keeps?" in the Radiolab/NPR transcript (it is quoted in facts.md as a fragment).

**Transition out:** the rocket's trail arcs off the Earth into the stars, then Voyager (storyboard V4→O1).

## Block 12 · Outro, 172.935–188.1 (quiet outro; the 1977 climax completes here)
**What we see** (storyboard O1–O3):
1. **172.935, in the hush:** a slow push to the record on Voyager, shown in real detail (P-V2: ten-sided bus, 3.7 m dish, RTG boom, magnetometer boom, the gold record on the outside of the bus). A soft pulse of light beats on the record (O1).
2. The greeting plays from the record with a space echo (O2). Voyager shrinks to a moving star.
3. **179.4:** tilt down to the hilltop. The cast of 10 stand **on the ground** in one flat tone, looking up at that moving star. The Juno end card builds over the sky: gold title, the question, and the 关注 Juno · 一起看懂世界 pill (O3: the card's question text is its subtitle).
4. Hold, then fade on the last bar.

| # | Speaker | Lang | Native | 中文字幕 | Start | Dur | End | Fact # |
|---|---|---|---|---|---|---|---|---|
| O1 | **ZH** | zh | — | 唱片上，还录着她恋爱时的脑电波和心跳。 | 173.40 | 3.6 | 177.00 | V3 ✓ brain waves; **[verify 心跳: NASA "Sounds of Earth" lists "Life signs: EEG, EKG"? If not ✓, say 「脑电波和身体的声音」]** |
| O2 | Q-唱片 (space echo) | zh | 各位都好吧？我们都很想念你们，有空请到这儿来玩。 | 各位都好吧？我们都很想念你们。 / 有空，请到这儿来玩。 | 177.60 | 5.0 | 182.60 | V5 ✓ (English by NASA; Chinese 据录音) |
| O3 | **ZH** | zh | — | 你最想对谁说一句话？ (end-card text) | 183.70 | 2.2 | 185.90 | brief |

Voiced 10.8 / 15.2 s (71 %).
- Sound: if 心跳 is ✓, two soft heartbeat thumps sit under O1 at the hush; otherwise a faint EEG crackle.
- Optional on-screen tag on Voyager: 「旅行者1号 · 约258亿公里外」 (V7, 估算 for late Oct 2026). It is a data label, not a story caption.
- **End-card sources line:** Library of Congress · Thomas A. Watson (1913) · History of Science Museum, Oxford · Parks Canada · L. Kleinrock (UCLA) · W. Zorn (KIT) · 新华网 · NASA/JPL · NPR · Radiolab · First Sounds (音频 CC BY) · 杜甫《春望》 **[+ Shang/Morse sources when SH1/MO1 clear]**

---

## Totals (estimated)

| Block | Window | Voiced (s) | % voiced |
|---|---|---|---|
| Cold open | 0–9.30 | 7.0 | 76 |
| Rewind + title | 9.30–18.965 | 0 | 0 |
| 商 | 18.965–34.836 | 10.0 | 63 |
| 杜甫 | 34.836–54.875 | 12.9 | 64 |
| 莫尔斯 | 54.875–73.015 | 12.6 | 69 |
| 斯科特 | 73.015–90.845 | 11.5 | 65 |
| 贝尔 | 90.845–110.385 | 13.1 | 67 |
| 马可尼 | 110.385–127.265 | 11.2 | 66 |
| 阿帕网 | 127.265–145.70 | 13.7 | 75 |
| 北京 | 145.70–160.885 | 10.3 | 68 |
| 1977 | 160.885–172.935 | 6.8 | 57 |
| Outro | 172.935–188.1 | 10.8 | 71 |
| **Film** | 188.1 | **120.1** | **63.8 %** |

pace.py on `lines_v3.json`: 0 TOO FAST, 4 % waiting. The only subtitle gaps are named beats: the rewind/title, scene transitions, and the record cut and launch.

## Open items for the researcher (must clear before recording)
- **SH1 / SH2:** confirm the 合集12870 source, whether it is a plastron or a bone, and the scorching method. Rain must not be shown arriving unless SH2 is ✓.
- **DF1:** Du Fu trapped in Chang'an, family in 鄜州, and 《述怀》's "不知家在否" (for D2), plus 春望 dated spring 757 (D3).
- **MO1 / MO2:** the Morse letter and burial; 24 May 1844 and the message.
- **Bell:** a source row saying 10 Mar 1876 is the first intelligible telephone sentence (B3 makes that claim).
- **V2:** the full sentence around "for keeps?". **V3:** whether the heartbeat (EKG) is on the record.
- **CQ:** the lyric actually sung in the chosen First Sounds excerpt.
