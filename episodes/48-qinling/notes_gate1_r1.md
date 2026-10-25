# Gate 1 notes: 秦始皇陵，为什么不挖？ script v1 + lines.json (46 lines, 2:50.0), r1. Verdict: REVISE

Scores (rubric 1–5, only the areas this gate covers): **script 4** · facts **pass with 3 fixes** · visual/info/edit/motion/sound: not at this gate.

**Bottom line.** This is a strong script. The hook is a concrete number on frame 0 (15秒). The counter gives the film a spine. The 「挖吗？」 reps get shorter each time and give three different answers (rule → method → conviction). The ending is the expert's own words. Every number traces to a ✓ row, and none of the banned wordings appear. Four things would get it sent back:
- H4 says more than the film shows.
- The 定陵 line puts a 1957 event in 1956.
- B3's stamp dates the start of work, which facts C1 says not to do.
- W2 「颜色都留不住」 is contradicted by W4 four seconds later, and W6→W7 leave a conditional hanging across two voices.

All of these are line fixes. One round should be enough.

**Inputs:** brief.md (with the owner decisions), facts.md (all rows), script.md, lines.json, vo_lines.json, the history-video-style skill, the ep44 gate-1 notes as the bar, rubric.md and owner-notes.md (all rows). I had no cold read for this round. `pace.py --film-end 170` (my run): no TOO FAST, 9.0 s waiting = 5 %. B11 sits exactly on its floor (4.2 / 4.2).

## Fact check (every number and every quote → facts.md)

| Line | Claim | Row | Ruling |
|---|---|---|---|
| H1/H2 | 15秒变色 / 4分钟 | F3 ✓ | OK for H1. H2 has a precision problem, see note 2. |
| H3, B5, B6 | 《史记》 mercury rivers, 上具天文 | M4/S6 ✓ | OK. Both are framed as 《史记》. |
| H4 | 没人打开过它 | X8 / F1 | **Overclaims**, see note 1. |
| B1, B8, B9 | 13岁 · 50岁 · 当年九月 | C1/C4/C5 ✓ | OK (虚岁). |
| B3 | 三十多年 | C7 safe ✓ | The line is OK. **Stamp 「前247年起」 is not**, see note 3. |
| B7 | 机关弩 | S5 ✓ | OK. The stamp 〃 keeps 《史记》记载 on screen. |
| B10–B12 | 封死 / 尽闭工匠臧者 / 以象山 | S8/S9 ✓ | Verbatim. |
| X1 | 4年后秦亡 | X1 ✓ | OK (counter 4). |
| X2 | 刘邦曾指控：项羽挖了始皇帝的坟 | X3 ⚠ | This is the exact safe wording. The highlight is wrong, see note 9. The producer should spot-check 《高祖本纪》 「项羽烧秦宫室，掘始皇帝冢，私收其财物」 before publishing (it is the 罪四 of the ten charges). |
| X4 | 两千多年 · 约51米 | 估算 / D1 ✓ | 前206 → 1956 = 2161 years. OK. |
| D1/D2 | 1956 定陵 · 丝织品很快碳化、褪色 | F7 ✓ (1956–58) | The D2 wording is OK. **D1's 「1956年…被打开」 plus a vault-door shot dated 1956 is not**, see note 4. |
| F1–F3 | 1974 大旱打井 · 瓦盆爷 · 约8000 | T1/T2/T4 ✓ | OK. The 估算 label on 8000 is required. |
| F6–F8 | 1997 国家规定 · 暂不主动发掘 · 保护技术还不具备 | F1 ✓ | Faithful to 「对大型帝王陵寝暂不进行主动发掘」 / 「条件尚不具备」. It is attributed to 国务院, not 国家文物局. Good. |
| R2, R3 | 2002 · 隔着土看 · 强烈的汞异常 · 三十多米 · 170×145 · 1.2万㎡ | R1/F9/M5/D4/M3 ✓ | OK. 「证实」 is never used. |
| R4 | 也许不只是传说 | M5 (hedged) | **Accept.** It is weaker than the 2003 press's 「初步证实」. Keep it. |
| R5 | 两个小盗洞，离地宫中心两百多米 | X7 ✓ | Verbatim with 中新社 2002. The stamp 「洞宽不到1米」 is the safe wording. |
| R6 | 勘探没发现地宫被盗的迹象 | X8 safe ✓ | Accept. The stamp 「未见大规模盗扰」 carries the source's exact limit. |
| R7 | 段清波：只有挖开以后，才知道 | X8 ✓ verbatim | His words are about **whether it was looted**, not a call to dig (F10). See note 8. |
| W3 | 如果贸然打开……有的当时就会坏掉 | F5 ✓ | The elision is honest (it cuts 「对它是非常大的冲击，」). 「有的」 refers to 植物/动物纤维, and W2's 丝和木头 sets that up. OK. |
| W4 | 吴永琪带队十多年，让彩绘定格 | F12 ✓ (CCTV blurb) | OK as a compression ("十多年" = the German cooperation). Line order problem: see note 6. |
| W5 | 能不挖，就不要挖了 | F4 ✓ | Verbatim. Dropping 「除非是抢救性保护发掘」 is what F4 suggests. |
| W6/W7 | 要是能隔着土看清里面，而不去打扰这个睡了两千年的老人 | F4 | W7 is verbatim. W6 is a fair paraphrase of 「在地面不打开陵墓的条件下，了解里面的东西」. The structure is a problem, see note 7. |
| W8 | 往往是没得到的东西，最美 | F6 ✓ | Verbatim (comma added for the voice). |
| Counter | 13 · 50 · 0 · 4 · 2165 · 2183 · 2206 · 2211 · 2219 · 2235 | §C/§I | All recomputed (260 − BC; 209 + AD). Correct, and they match the stamps. |

## Notes

| # | Sev | Where | Problem → fix | Route to | Owner note |
|---|---|---|---|---|---|
| 1 | must | **H4** 10.50–14.00 | **Problem.** 「没人打开过它」 read plainly means "nobody, looters included, ever got in". facts X8 forbids that (「陵墓从没被盗」 is on the avoid list). The film then argues against it itself: X2 has 刘邦's charge, R7 has 「只有挖开以后，才知道」. Answering the screenwriter's question: yes, it conflicts.<br>**Fix.** Use 「**可直到今天，它还没被发掘。**」 (10 字, 3.25 s; the title lands at 13.75). 「还没」 already hints at 暂不. The screenwriter's 「它都没被发掘」 is an acceptable alternative. Either one matches the stamp 地宫从未发掘, F1/F11 and the title's verb.<br>**Owner sign-off.** The owner approved the old wording, so the producer shows him this one-phrase change, with the reason, at the gate-1 OK. Q's 「会打开它吗？」 stays: there, 打开 is the viewer's hypothetical. | screenwriter (+ producer: show the owner) | row 11 (plain reading), row 32 (never state more than the source) |
| 2 | should | **H2** 4.00–6.25 | **Problem.** The source says 「4分钟内就完全脱水、起翘、剥落」, so the flaking is finished by 4 min. 「4分钟，开始脱落」 puts the start at 4 min. It also repeats H1's 开始.<br>**Fix.** Use 「**4分钟内，就剥落了。**」 (9 字, about 2.9 s, so +0.5 s). Half of that is paid back by note 1. Put the title on the drop after the retime. | screenwriter | row 32 |
| 3 | must | **B3 stamp** | **Problem.** 「前247年起 · 骊山」 dates the start of the tomb work. facts C1 says no year for the start (it is 247 vs 246: UNESCO and 吴永琪 give 246).<br>**Fix.** Make the stamp 「**— 骊山 / 修陵三十多年**」. The year stays on B1's accession stamp only. | screenwriter | — |
| 4 | must | **D1** 74.00–78.00 (+ D1 stamp) | **Problem 1.** facts F7 supports "发掘 1956–58". The picture is a vault door swinging open under a 1956 stamp, and 「被打开」 reads as that moment. The 地宫 itself was entered in 1957.<br>**Problem 2.** Nothing says why 定陵 is in a Qin film (owner row 128: state the cause).<br>**Fix, line.** 「**1956年，[另一座皇陵]开始发掘。**」 (12 字, same window).<br>**Fix, stamp.** 「— 1956–58 · 明定陵 / 万历皇帝的陵」.<br>**Fix, link (picture only, no new line).** In F8's split frame, the dashed 「保护」 side carries a faint ghost of D2's browned silk. That way 「保护技术还不具备」 visibly answers 定陵. | screenwriter (line, stamp); art-director (F8 picture) | row 128, row 12 |
| 5 | should | **B2 gloss** | **Problem.** The Q row shows 郦山 and the gloss directly under it shows 骊山. Within one block this reads as a typo.<br>**Fix.** Use facts S2's own plain line as the gloss: {**一即位，就开始凿山修陵**} (10). The original stays as 郦. The voice reads 骊 lí as planned. | screenwriter | row 13 |
| 6 | must | **W2–W4** 136.25–148.75 | **Problem 1.** W2 「陶俑的颜色都**留不住**」 is followed by W4 「…让彩绘**定格**」, so the film contradicts itself within 8 s.<br>**Problem 2.** 吴永琪's name plate (W3) appears before he is introduced (W4).<br>**Fix: reorder and re-word.**<br>W1 今天，挖吗？<br>→ **W4′ (N) 「吴永琪带队十多年，[才]让彩绘定格。」** (14)<br>→ **W2′ (N) 「彩绘都这么难留，丝和木头呢？」** (12 字, 3.75 s)<br>→ W3 (E, the name plate first appears here) 如果贸然打开……有的当时就会坏掉<br>→ W5 …<br>**What this gives.** The irony lands (it took the man who saved the colours a decade). The question 「丝和木头呢？」 gets its answer in the very next line, in his voice.<br>**Picture.** W4′ = the lab, with the bracket freezing the warrior's colours. W2′ = H1's timer shot as the callback (what happens without the treatment), then the drop into the dark chamber with the silk, lacquer and slips. W3 = the blade of light (unchanged). Total time: 8.05 s vs 8.25 s now. | screenwriter (lines + picture column) | row 11, row 13 |
| 7 | must | **W6/W7** 151.50–160.00 | **Problem.** 「他说，要是能隔着土看清里面，」 (N) + 「而不去打扰…的老人。」 (E) is an if-clause with no main clause. It is split across two voices, and the next line (W8) never resolves it. A listener hears an unfinished sentence at the emotional peak.<br>**Fix.** W6 (N): 「**他盼的是：隔着土，也能了解里面，**」 (了解 is his word, 16 wide, about 4.0 s). W7 (E): 「**不去打扰这个[睡了两千年]的老人。**」 (drop 而; the rest is a verbatim fragment). Each line now stands alone, and the pair reads as one complete wish. Net time is about 0 (W6 +0.25 s, W7 −0.3 s). | screenwriter | row 13 |
| 8 | must | **R7** 131.00–134.00, speaker | **Answer to your question: no.** One E voice for both experts is not acceptable here.<br>**Why.** Over the next 30 s the E voice becomes "吴永琪's voice" (W3, W5, W7, W8). If the same voice says 「只有挖开以后，才知道」 and then 「能不挖，就不要挖了」, a listener hears one expert contradicting himself. It also casts 段清波 as the pro-dig side, which F10 says he isn't (his words are about the looting question).<br>**Fix.** Make R7 **N**: 「**段清波说：只有挖开以后，才知道。**」 (14 字, about 4.3 s; +1.3 s, well inside the 3:00 cap). Stamp: 「— 2010 · 段清波 / 考古学者 · 谈是否被盗」. Keep the E voice for 吴永琪 only. | screenwriter; producer (voice casting) | row 11 |
| 9 | should | **X2** highlight | **Problem.** On a muted phone the gold word is what people read, and [挖了] reads as the verdict.<br>**Fix.** Move the highlight to the frame: 「刘邦曾[**指控**]：项羽挖了始皇帝的坟。」 | screenwriter | row 11 |
| 10 | should | **E stamps** (W3, W5) | **Problem.** 「原话」 next to a synthetic voice can be taken as 吴永琪's recorded voice.<br>**Fix.** Stamp line 2 = 「**据央视采访**」 (no year, per facts). The words are his; the voice is not. Keep the 内容由AI生成 declaration at publish. | art-director; producer | brand/platform safety |
| 11 | carry-fwd | **B11** 50.50–54.75 | **Problem.** It is at its reading floor with 0 s spare (Q row + 13-字 gloss).<br>**Fix.** The gloss appears with row 1, never typed after it. Alternatively, hold the subtitle 0.5 s into the lamps-out pause before it clears. Bars may only add time here. | editor | row 104 |
| 12 | carry-fwd | **W8** 160.25 | The track's peak should land on the image (the night sky dissolving in), with ≥ 1 bar of air before 「往往是没得到的东西，最美」. At the moment there is only 0.25 s after W7. | editor | row 88, row 112 |
| 13 | carry-fwd | **R5 picture** | The two shafts must **not** be drawn as the continuation of 项羽's soldiers' dashed line from X3. Nobody knows who dug them or when. Draw them as found holes, with no figures and no era, and fade X3's 「？」 only at R6. | art-director | row 11 |
| 14 | carry-fwd | **W4 picture** | Two generic conservator silhouettes with no national or ethnic markers. The German cooperation lives in the stamp only. 吴永琪 is never a face. | art-director | facts Risks: real people |
| 15 | optional | **X4** | 「之后两千多年，它就**只是**一座山。」 (14 wide, the window holds) turns B12's 「让它**像**一座山」 into a payoff ("and it became just a hill") instead of a repeat. | screenwriter | row 12 |

## Answers to the screenwriter's five questions
1. **H4:** change it (note 1). Use 「它还没被发掘」; 「它都没被发掘」 also works.
2. **Counter 2235 beside 吴永琪's undated quotes:** fine as it is. The counter is the tomb's clock, and with note 10 his stamp carries no year. Don't dim it.
3. **R4:** keep 「也许不只是传说」. The alternative is clumsier and no safer.
4. **One E voice:** no. R7 goes to N (note 8).
5. **Unvoiced Q glosses:** accepted. A translation row under a voiced line is a bilingual subtitle, not a silent story caption (row 127). B4 and B10 frame the Q lines well for listeners.

## Hook, story, voice and safety
- **Hook (0–14 s).** It grips in 3 s. A painted face, a running timer and 「15秒」 are on frame 0, and the contradiction (colour dies in seconds → there's a sealed tomb of mercury rivers) is complete by 10.5 s. A muted viewer gets it all from the subtitles and the timer. The title holds 3.0 s, silent, on the drop. Good.
- **「挖吗？」 set-piece.** It builds: 97.25 → 109.75 → 134.25, the beat gets shorter (1.75 → 1.5 → folded in), and each rep gives a new kind of answer. The first real rep comes at 1:37. I accept that, because X3 at 1:08 is rep 0 and the first half builds the desire to dig (what is inside).
- **The turn.** F8 「不是不能挖，是保护技术还不具备。」 is clear and true to F1.
- **The ending is earned.** "Not yet" (the state) → "look without opening" (2002) → "don't, even if we can" (the man who saved the colours) → the viewer decides.
- **Classical Q lines.** All are inside the reading budget with their gloss. 上具天文 and 树草木以象山 read well with the glosses. B11 has no spare time (note 11).
- **Voice.** The lines are natural to say. Numbers in vo_lines are spelled right (一九五六 / 二零零二 / 八千 / 两百多米), and the readings are marked (骊 lí, 穿 chuān, 为 wéi, 藏 cáng). Add: **勘探 kān**, **嬴 yíng**, **汞 gǒng**; check these three in the first takes. The pauses are where the music needs them (title silent, the 2 s lamps-out, the end card). With notes 7 and 8 there are three voices with clean roles: N tells, Q is the 《史记》, E is 吴永琪 only.
- **Safety/platform.** No bodies: the sealing is a door and lamps, the B7 bolt hits nobody, and the death is a carriage that stops. 盗洞 / 被盗 are the archaeologists' own terms and appear only in a diagram, with no how-to and no 盗墓. No bordered maps: R3 is a soil section, and 定陵 is a different mound shape. No 剧毒, no 长明, no 证实. Real people appear only as quotes with titles. OK.

## Douyin title and end card
- **Title.** I agree with option 1: 「秦始皇陵，为什么不挖？兵马俑出土15秒就开始变色」. It has the search words plus a sourced surprise and doesn't give the answer away.
- **End card.** 「如果是你，会打开它吗？」 vs 「…现在会打开它吗？」 is the owner's call. Show him both. 「现在」 ties the debate to 暂不. The default is cleaner to read in one second.

## What must not change (it works)
- **The hook:** H1 on frame 0 (painted warrior, 00:00 → 00:15 timer, subtitle typed on frame 0) and H3's flakes → silver drops → rivers transition. The order 15 s → 4 min → 《史记》 → not dug → title stays, as does the silent 3.0 s title on the first drop with the ◀◀ rewind into B1.
- **The counter spine:** 嬴政 13 → 50 → 封存 0 → 4 → 2165 → 2183 → 2206 → 2211 → 2219 → 2235, including the B9 morph from age to 封存.
- **The Q device:** the period face, the reverb voice and a gloss row. B4 「《史记》记载，地宫里：」 framing B5/B6.
- **B10 → B11 → the 2 s lamps-out pause → B12 「树草木以象山」 at dawn.**
- **The 项羽 thread:** X2's accusation framing (刘邦曾指控), X3 「他挖进地宫了吗？」 paid off by R5/R6.
- **The three 「挖吗？」 reps,** each shorter than the last, and the spade prop that rises, lowers, is laid down and then is gone.
- **The answers:** F7 verbatim to the 1997 notice (暂不, 国务院) and F8's turn. R2 「隔着土看」 and R4's hedge.
- **吴永琪:** W5 「能不挖，就[不要挖了]。」, W8 「往往是没得到的东西，最美。」 on the biggest image, and the end card per the house style.
- **Wording that stays out:** none of 70多倍, 修陵70万, 38年, 长明, 证实, 没被盗过, 盗墓, 诅咒, 剧毒, 国家文物局 appears. Keep it that way.
