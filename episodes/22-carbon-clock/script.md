# Script: 死后会变慢的钟  (v1, gate 1 draft · unattended overnight run 2026-10-12)

**Logline:**
- Every museum label says "距今几千年", but a piece of charcoal carries no date.
- While a tree is alive, each gram of its carbon "ticks" about 15 times a minute, in step with the air. After it dies, the ticking slows by half every ~5730 years. Count the ticks that are left and you can tell how long it has been dead.
- Libby tested the clock in 1949 on pharaoh-tomb wood whose age was already known, and China's first lab passed the same kind of test in 1965 before it was allowed to exist.
- Then the catch: the clock assumed the air's carbon-14 never changes. In the 1960s nuclear tests nearly doubled it, and the air had in fact always varied. Tree rings, each with an exact year, became the table every reading is checked against.

**Takeaway:** 活过的东西都带着一只钟：活着时和空气同步，死后滴答每约5730年少一半。数剩下的滴答，再拿树轮对表，才读得出它死了多久。

**Length:** lines 0.00–115.30 s, then the Juno end card 115.87–~122 s (music FIN 121.95). 38 lines.

**Music map** (series track `public/bgm.mp3`, same as ep14)
- intro 0–16.625 (beat 1 at 0.441)
- **drop 1 at 16.625 (title)**
- main 20.689
- breakdown 49.041
- build 63.205
- **silent gap 79.412–81.432**
- **drop 2 at 81.432 (reveal)**
- outro 115.868 (end card)
- FIN 121.951
- One bar ≈ 2.03 s.

**Checks:**
- `pace.py lines_arr.json --film-end 122`: no line too fast, 0 % waiting. The only flags are the title gap (16.40–20.80) and the silent gap (79.30–81.45), both named beats.
- All lines are ≤ 16 glyphs, counting punctuation and digits (brackets excluded). The longest is 16.
- `lines.json` uses the object format `{start, end, text}`. `lines_arr.json` holds the same lines as `[[s,e,"text"]]` for the house tools. `[ ]` marks the gold keyword.

## Decisions taken without the owner (unattended run)

1. **Mawangdui is not in the lines.**
   - The brief asks for "the real Mawangdui dating (what was dated, the lab, the result)", but facts #7 (the C-14 result) and #8 (168 / 186 BC) are both UNVERIFIED.
   - The only verified link is a coincidence of years: the tombs opened in 1972, the same year the lab began publishing annual dates (#1, #10).
   - Putting the two side by side would read as "C-14 dated Mawangdui", which is the claim we can't make (owner rule: no line whose plain reading isn't what the film shows).
   - If a library check verifies #7, one Mawangdui line can replace L24 ("1965年，新实验室也先考自己") without retiming anything else.
2. **No 76.7 %, no worksheet, no "课本" signal anywhere.** Recognition is invited only by the end-card question.
3. **The cold open is a museum moment, not a campfire or a funeral.**
   - It is the viewer's own question at the viewer's own phone.
   - The emotional turn is "你身上也有这只钟", which makes the topic about the viewer.
   - The concrete countable number is the 15 ticks (#23), on screen at 5.2 s.
   - The museum label shows no specific age. A real object with a verified C-14 age is not in facts.md, and a 示意 number on a museum label would look fake in frame 0.
4. **Drop 2 is the bomb spike** (#37), set up by the build's last line "这只钟的前提：空气里碳14不变".
   - The catch then generalises it: the air always varied (#33), so tree rings calibrate the clock (#34, #35).
   - The two limits close the film as the clock's two ends: 往前 about 5万年 (#40), 往后 the bomb spike as a new clock (#39).
5. **Coal dilution (2.5 %, #36), 5568 vs 5730, "今 = 1950" and 3‰ precision are left out.** All are true, but each opens a side door the film has no time to close.
6. **"盲测" is not on screen.** Row #13's quoted text says four wood samples matched the accepted ages, but the word "blind" is not in the quote. The line says "4块已知年代的木头，全都对上", which holds either way.
7. **The ages of the Egyptian wood are given as "约4600年前", not "4600多年".** Sneferu's expected age is 4575 ± 75 and Zoser's is 4650 ± 75 (#19), so "多" would be false for one of them.

---

## Title options (≤ 10 字)

1. **死后会变慢的钟** (recommended)
   - It names the film's one counter-intuitive image: a clock that only starts to wind down once life stops (L4 "死后，滴答越来越慢").
   - It is concrete and emotional, and it makes you ask "什么钟？", which the first 16 s answer.
   - It does not overclaim. The film shows exactly this: ticks steady while alive, slowing after death.
   - Risk: a half-second "ghost story?" read, which is probably a click, not a misread.
2. **一块木炭有多老**
   - The plain question the film answers in its last two lines (L37–L38 callback).
   - It is the most honest option, and it is concrete because there is one object.
   - But it reads as calm 科普, with less pull in the feed.
3. **谁定的"距今几千年"**
   - It is the viewer's own museum question, word for word from L1, and the recognition is instant.
   - The film answers it as "a clock inside the object, checked against tree rings".
   - Risk: "谁" promises a person, and the answer is a method (although Libby is in it).

**Title-card sub-line (all options):** 碳14测年：数滴答，再对表

---

## Beat sheet

| Beat | Time | Purpose | What the viewer learns / feels |
|---|---|---|---|
| Hook (tiny story) | 0–16.4 | The viewer at a museum case, phone up | "The label says thousands of years, but the charcoal has no date. Alive, it ticked about 15 times a minute per gram; dead, it slows. The ticks left tell how long it's been dead. **You carry this clock too.**" The number is on screen by 5.2 s. |
| Title | 16.6–20.7 | Drop 1 | 《死后会变慢的钟》: the camera dives into the charcoal's grain, which opens into a living tree's rings |
| Setup: the clock | 20.8–49.0 | What is done, why, what for | C-14 is in the air; trees and people take it in, so living things stay in step with the air. Death stops the top-up and only decay is left. It halves about every 5730 years; 1/4 left ≈ 1.1万年 (示意). Measure what's left and you can work back to the time. It's Libby's method, called 碳14测年, and archaeology and geology rely on it. |
| Twist: test the clock | 49.1–63.2 | Breakdown: WHY anyone believed it | 1949: Libby takes pharaoh-tomb wood whose age is already known (≈ 4600 years). His verdict: "吻合得令人满意". Nobel Prize, 1960. |
| Evidence 2: China | 63.3–79.3 | Build: the same test, here | 1959: Libby's book reaches China. 1965: the new lab tests itself first: 4 pieces of wood of known age all match, and only then is China's first C-14 lab founded. Build peak: **the clock's premise is that the air's C-14 never changes.** |
| Silence | 79.4–81.4 | Breath | The air gauge, steady, alone |
| Reveal | 81.4–89.5 | Drop 2 | In the 1960s atmospheric C-14 nearly doubled, from nuclear tests, and so did every living thing. |
| The catch, and its answer | 89.5–104.2 | When it fails, and what was done | The premise was wrong: the air always varied. So the clock is calibrated with tree rings: each ring has an exact year; measure each ring's C-14 and you get a table; look the charcoal's reading up in it. |
| The clock's two ends | 104.3–110.1 | Limits, plus one more surprise | Beyond about 5万年 too little is left to measure. For anything after 1950, the bomb spike itself is a new, precise clock. |
| Ending | 110.2–115.3 | Callback + takeaway | 一块木炭有多老？ → 数它的滴答，再拿树轮对表. Back at the museum case, on the viewer's reflection. |
| End card | 115.87–~122 | Comment bait | Question below |

---

## Lines

- Chars = the units `pace.py` counts (Chinese characters, plus one per number).
- Needs = 0.5 + n/7 + 0.6 s.
- Look: the Tank-episode 2D flat illustration, as in the brief. People are few and pose-checked, from the owner-approved figure system.
- **The one recurring device is the tick meter:** a row of dots that light up one per tick, with the label "每克碳 · 每分钟". It is the "clock" in every scene.

| # | Start | End | Line (≤ 16 字) | Chars | Needs | Picture (what the viewer sees) | Beat · music | Fact # |
|---|---|---|---|---|---|---|---|---|
| 1 | 0.00 | 2.55 | 展柜里写着：距今几千年 | 10 | 2.53 | **Frame 0, first person:** the viewer's own phone screen fills the frame, in camera mode, aimed at a lit museum case. Inside sits a small black lump of charcoal on a plinth. Under it, a museum label reads "木炭 · 距今数千年". **Beat 1 (0.44 s):** the phone's yellow focus square snaps onto the charcoal. | intro · hit on beat 1 | — (general) |
| 2 | 2.65 | 5.06 | 可木炭身上，没写日期 | 9 | 2.39 | Pinch-zoom on the phone: the charcoal's cracked, glossy grain fills the screen. No mark, no writing anywhere. A tiny "？" blinks in the corner of the camera UI. | intro | — |
| 3 | 5.16 | 8.29 | 活着时，每克碳每分钟滴答约[15]下 | 14 | 3.10 | **The countable number.** A ghost of the living tree grows up out of the charcoal, faint green line art. Beside it, the **tick meter** appears: 15 dots light one by one on the beats, labelled "每克碳 · 每分钟 ≈ 15". | intro | #23 |
| 4 | 8.39 | 10.66 | 死后，滴答越来越[慢] | 8 | 2.24 | The ghost tree fades back into the black charcoal. The meter keeps ticking, but each dot now lights more slowly and some stay dark. Small tag: "示意". | intro, the turn | #25 (mechanism) |
| 5 | 10.76 | 13.60 | 剩几下，就能说出它死了多久 | 12 | 2.81 | The dark dots are counted off, and a dial beside the meter starts turning, reading "死了多久？". The camera pulls back out of the phone to the case. | intro, rising | #29 |
| 6 | 13.70 | 16.40 | 你身上也有这只钟，正在走 | 11 | 2.67 | **The emotional turn.** The case glass shows the viewer's own reflection, a twenty-something from the 2D cast holding the phone. A small tick meter appears over the reflection and ticks steadily: 15. From ~15.6 s the camera **accelerates into the charcoal's grain**. | pre-drop | #23, #37 ("living matter") |
| T | 16.63 | 20.69 | *(title card)* | | | **Drop 1:** the black grain cracks open into a warm cross-section of a living tree. Its rings ripple outward from the centre like a clock face. The title **死后会变慢的钟** sits on the slice, with the sub-line 碳14测年：数滴答，再对表. | **DROP 1** | — |
| 7 | 20.80 | 23.58 | 空气里，有极少量的[碳14] | 10 | 2.53 | Pull back from the slice to the whole tree under a pale sky. The air is a field of tiny grey dots (carbon), and a rare few glow gold, labelled "碳14". | main section | #22 |
| 8 | 23.68 | 26.18 | 树吸进它，人吃进它 | 8 | 2.24 | Gold dots drift into the leaves. The cast figure (the viewer) bites an apple from the tree, and gold dots follow into the figure. Hand on the apple, pose-checked. | | #37 (air → living matter) |
| 9 | 26.28 | 29.35 | 活着时，体内含量和空气[同步] | 12 | 2.81 | Two tick meters side by side, "空气" and "树" (and a small third, "你"), tick **in step**, all at 15. | | #23, #33, #37 |
| 10 | 29.45 | 32.09 | 死后不再补，只剩[衰变] | 9 | 2.39 | A branch is cut and falls (no violence; it is a branch). Its gold-dot inflow stops with a soft "closed" valve icon. Its meter drifts out of step with the air's. | | #25 (mechanism) |
| 11 | 32.19 | 34.97 | 每过约[5730]年，滴答少一半 | 10 | 2.53 | Timeline bar: "0 → 5730年". The branch's meter goes from 15 dots lit to half of them lit (≈ 7.5, tag "示意"). A gold "½" stamps on the beat. | | #25 |
| 12 | 35.07 | 37.71 | 剩1/4，就是约[1.1万]年 | 9 | 2.39 | The timeline extends to "11460年". The meter drops to a quarter lit. A smooth halving curve draws itself (示意 tag). | | #25, #32 (computed, **示意**) |
| 13 | 37.81 | 40.73 | 量出剩多少，就能倒推时间 | 11 | 2.67 | **Play it backwards:** a reading arrow on the curve's vertical axis ("剩多少") slides across to the curve and drops to the time axis ("多少年"). | | #29 |
| 14 | 40.83 | 43.75 | 这套方法，出自化学家[利比] | 11 | 2.67 | A portrait card in the 2D style, framed: "美国化学家 · 利比", with a lab bench behind and a counter tube. No likeness claim. | | #15, #22 |
| 15 | 43.85 | 46.06 | 它叫[碳14测年] | 6 | 1.96 | The curve and the meter fold into one clean emblem: a tree-ring disc with a meter arc, labelled **碳14测年**. | | #11, #15 |
| 16 | 46.16 | 48.95 | 考古、地质，都靠它测年代 | 10 | 2.53 | Three quick icons around the emblem: a dig trench with charcoal, rock strata, a tree slice. Each lights on a beat. | | #15 (Nobel citation) |
| 17 | 49.10 | 51.66 | 这只钟准吗？先[考一考] | 9 | 2.39 | **Breakdown, the music thins.** The emblem tilts like a balance scale, and a pencil checkmark box appears beside it, empty. | breakdown 49.04 | #17 |
| 18 | 51.76 | 54.75 | 1949年，利比找来法老墓的木头 | 12 | 2.81 | Card "1949". Two pieces of wood slide in on a lab tray. Tags: "左塞尔墓 · 萨卡拉 · 金合欢木" and "斯尼夫鲁墓 · 美杜姆 · 柏木". A small step-pyramid silhouette sits behind them, with a dot and label only and no map. | | #17, #18 |
| 19 | 54.85 | 57.55 | 年代早已知道：约[4600年]前 | 10 | 2.53 | Each wood gets a sealed answer card from history: "已知 约前2700年" and "已知 约前2625年". The cards stay face-down for now. | | #19 |
| 20 | 57.65 | 60.35 | 他写道：“吻合得令人满意” | 10 | 2.53 | The meters measure the wood, and the dial lands. The answer cards flip, and the dial and the card sit side by side and agree. A paper strip types the quote in English small print: "The agreement… is seen to be satisfactory." | | #17, #20 |
| 21 | 60.45 | 63.15 | 1960年，他为此获[诺贝尔奖] | 10 | 2.53 | The checkmark box from L17 ticks. A small gold medal disc, plain with no likeness, rolls in: "1960 · 诺贝尔化学奖". | | #15 |
| 22 | 63.25 | 66.07 | 1959年，利比的书到了中国 | 10 | 2.53 | **Build.** Card "1959". A book titled 《放射性碳测年》 passes from one 2D figure's hands (caption "考古学家 夏鼐") to two others (captions "仇士华 · 蔡莲珍 · 核物理学家"). The figures are pose-checked, with hands on the book. | build 63.2 | #11, #12 |
| 23 | 66.17 | 69.13 | 1965年，新实验室也先考自己 | 11 | 2.67 | Card "1965 · 初冬". A bare lab room in the same style. The same empty checkmark box as L17 appears, rhyming with Libby. | build | #13 |
| 24 | 69.23 | 72.47 | [4]块已知年代的木头，全都对上 | 13 | 2.96 | Four wood samples in envelopes (caption "佟柱臣 提供"). One by one their dials land next to face-down answer cards. The cards flip and all four match, with a check on each beat. No ages are shown (not in the facts). | build | #13 |
| 25 | 72.57 | 75.96 | 中国第一间碳14实验室，这才成立 | 14 | 3.10 | The door plate goes up: "中国科学院考古研究所 · 碳十四实验室 · 1965". The checkmark box ticks. | build | #11, #13 |
| 26 | 76.06 | 79.30 | 这只钟的前提：空气里碳14[不变] | 13 | 2.96 | Pull back to the sky over the lab. A large **air gauge** of gold dots reads steady at "100%", and a dashed line is labelled "假设：一直不变". The music rises. | build peak | #33 |
| — | 79.41 | 81.43 | *(no subtitle)* | | | **Silence.** Everything stills; only the air gauge and its dashed "不变" line remain, perfectly flat. | **SILENT GAP** | — |
| 27 | 81.45 | 84.10 | 1960年代，大气碳14约[翻倍] | 10 | 2.53 | **Drop 2.** The flat line **spikes**: the gauge shoots to "约 ×2", and a curve draws a steep peak at the mid-1960s, labelled "北半球 · 1960年代中期". It is a clean graph only: no clouds, no flags. | **DROP 2** | #37 |
| 28 | 84.20 | 86.27 | 原因是[核试验] | 6 | 1.96 | The peak is labelled "核试验". A small "1963 禁试条约" tick sits on the axis where the curve begins to fall. | | #37, #38 |
| 29 | 86.37 | 89.44 | 那几年的活物，体内也跟着翻倍 | 13 | 2.96 | Back to the tree-ring slice: **one ring glows twice as bright**, tag "1960年代". The "你" meter from L6 appears in a corner and ticks double-time for a beat, tag "示意". | | #37 |
| 30 | 89.54 | 92.61 | 前提错了：空气里碳14一直在变 | 13 | 2.96 | The dashed "不变" line from L26 cracks and falls away. Behind the bomb peak, the older part of the curve is revealed: it was never flat, with gentle wiggles all the way back (shape 示意). | | #33 |
| 31 | 92.71 | 95.36 | 所以，钟要拿[树轮]来校准 | 10 | 2.53 | The wiggly curve slides down onto a long tree-ring slab, and each wiggle lines up with a band of rings. | | #34 |
| 32 | 95.46 | 98.25 | 每圈树轮，年份精确到一年 | 11 | 2.67 | Push in on the slab: each ring gets a small year tag that counts back on the beats. | | #34 |
| 33 | 98.35 | 101.28 | 测出每圈的碳14，排成[对照表] | 12 | 2.81 | A tick meter samples a ring, and the reading drops into a table column. Row after row fills: "读数 → 年份". The table becomes the calibration curve, tagged "校正曲线（示意）". | | #34, #35 |
| 34 | 101.38 | 104.17 | 木炭的读数，到表里查年份 | 11 | 2.67 | The museum charcoal from L1 returns as a small inset. Its meter reading slides across to the curve, then down to a year band. A soft "约" bracket is shown on purpose, because the answer is a range. | | #35 |
| 35 | 104.27 | 107.20 | 往前，超过约[5万]年就剩太少 | 12 | 2.81 | The camera travels left along the curve into the distance. The tick meter's dots go dark until barely one flickers: "剩不到0.2% · 约5万年". The curve fades into grain. | | #40 |
| 36 | 107.30 | 110.09 | 往后，核弹尖峰成了新的[钟] | 11 | 2.67 | Whip back right to the bomb peak (from L27), which now glows gold. Tag: "1950年后的东西：可精确定年". | | #39 |
| 37 | 110.19 | 112.41 | 一块木炭有多老？ | 7 | 2.10 | **Callback.** The curve folds back into the museum case. We are again first person, on the viewer's phone, and the focus square sits on the charcoal. | callback | — |
| 38 | 112.51 | 115.30 | 数它的滴答，再拿树轮[对表] | 11 | 2.67 | The charcoal's meter and a tiny tree-ring disc appear side by side over the phone image, and a small gold check joins them. The phone lowers. In the glass, the viewer's reflection with its own meter, still ticking 15, holds. **对表** turns gold. | payoff | #23, #34 |
| E | 115.87 | ~122 | *(Juno end card)* | | | The glass reflection whitens into the **Juno end card**: J monogram, gold title, question, follow pill `关注 Juno · 一起看懂世界`, sources. | **outro 115.87 → FIN** | — |

**Transitions, all motivated, no hard cuts:**
- phone screen → dive into the charcoal grain → it opens into the living tree's rings (title)
- tree → sky dots → meters
- curve → emblem → Libby's lab tray
- the empty checkmark box carries Libby → the Chinese lab (the same box)
- lab → pull up to the sky and the air gauge
- gauge spike → back to the tree slice (the bright ring)
- curve → tree-ring slab → table → museum inset
- curve folds back into the case
- glass reflection → end card

**Sensitivity:**
- Nuclear tests appear only as a labelled curve and a glowing ring: no mushroom clouds, no country names, no flags.
- No maps or borders. Places are a dot plus a label.
- Real people appear as 2D figures and portrait cards without likeness claims, and no invented dialogue. The only quoted words are Libby's published sentence.
- No human remains anywhere. This is why Mawangdui's woman is not shown either.

---

## End card

- **Question for comments:** 第一次听说"碳14"，你是在哪？
  - This invites recognition (school, a museum, a documentary) without the film signalling it.
  - Alt: 如果能测，你最想知道哪件东西有多老？
- **@ prompt:** @一起逛过博物馆的那个人
- **Sources line:**
  - Arnold & Libby, *Science* 1949
  - Currie, *J. Res. NIST* 2004
  - Reimer et al., IntCal20, *Radiocarbon* 2020
  - Turney et al., *Sci. Rep.* 2018
  - Hua et al., *Radiocarbon* 2022
  - NobelPrize.org 1960
  - 张雪莲, 中国社会科学网 2022
  - 《大众考古》2016

---

## Every number or named claim on screen → facts row (来源 in facts.md)

| On screen | Value | Row | Status |
|---|---|---|---|
| 每克碳每分钟约15下 (living) | 15.3 ± 0.5 dpm/g | #23 | OK |
| 碳14 exists in nature / in the air | Libby postulated natural 14C, 1946 | #22 | OK |
| air → living matter, in step | "in atmospheric CO2, and consequently in living matter" | #37 | OK |
| 约5730年少一半 | 5730 ± 40 | #25 | OK (5700 ± 30 in #26 overlaps; "约") |
| 剩一半 ≈ 7.5 dots | 15 ÷ 2 | #23, #25 | computed, **示意** |
| 剩1/4 → 约1.1万年 / 11460年 | 2 × 5730 | #25, #32 | computed, **示意** |
| 量出剩多少 → 倒推时间 | t = T · log₂(N₀/N) | #29 | OK (math) |
| 化学家利比; 碳14测年 used in archaeology and geology | Nobel 1960 citation | #15 | OK |
| 1949, pharaoh-tomb wood (Zoser, Sakkara, acacia; Sneferu, Meydum, cypress) | Arnold & Libby 1949 | #17, #18 | OK |
| 约4600年前 · 约前2700年 · 约前2625年 | 4650 ± 75, 4575 ± 75 (expected) | #19 | OK (expected ages only; found ages not shown) |
| "吻合得令人满意" | "The agreement between prediction and observation is seen to be satisfactory." | #20 | OK (translation) |
| 1960, 诺贝尔化学奖 | Nobel Prize in Chemistry 1960 | #15 | OK |
| 1959, Libby's book · 夏鼐 · 仇士华 · 蔡莲珍 · 核物理学家 | Xia Nai gave them the book; two nuclear physicists | #11, #12 | OK |
| 1965, 4 known-age woods all match, lab founded | 佟柱臣 four samples; "正式宣告成立" | #13 | OK |
| 中国第一间碳14实验室 · 考古研究所 | "国内第一个碳十四年代学实验室", 1965 | #11 | OK |
| premise: air's C-14 constant | "initial assumption of constant atmospheric radiocarbon" proved erroneous | #33 | OK |
| 1960年代 约翻倍 · 核试验 · 北半球 | "approximately doubled… by the mid-1960s" | #37 | OK |
| 1963 禁试条约 (picture only) | Partial Test Ban Treaty, then decrease | #38 | OK |
| 活物体内也翻倍 | "and consequently in living matter" | #37 | OK |
| 树轮年份精确到一年 | "reliable to the nearest year" | #34 | OK |
| 对照表 / 校正曲线 | IntCal20 | #35 | OK (curve shape drawn 示意) |
| 约5万年 · 剩不到0.2% | ≤ 0.2 % modern ≈ ≥ 50 000 BP | #40 | OK |
| 1950年后的东西可精确定年 | post-1950 dating | #39 | OK |

---

## Still unresolved / needs checking

1. **#7 (the Mawangdui C-14 result) and #8 (168 / 186 BC)** need a library/CNKI check. Until then Mawangdui stays out (decision 1).
2. **L8 "人吃进它"** rests on #37's "consequently in living matter" and on the general mechanism. No row says "through food" in words. The director can ask the researcher for a one-line source, or the line can become "树吸进它，动物吃进它" without retiming.
3. **L6 / L38: the viewer's own meter "ticks 15".**
   - #23 is a value for modern living carbon.
   - Today's exact level in a person (residual bomb carbon) is not in facts, so the picture says "15" with no decimals and L29's double-time is tagged 示意.
4. **L20 quote:** the Chinese is our translation of Libby's sentence; the picture shows the English original in small print.
5. **L27 "北半球" tag:** Turney et al. say the doubling was in the Northern Hemisphere and Currie says "atmospheric CO2" generally. The subtitle has no hemisphere, so it is true for both; the tag is the precise version.
6. **Not used (true, but cut for focus):**
   - coal dilution 2.5 % (#36)
   - Libby's 5568 vs 5730 (#27, #28)
   - "present" = 1950 (#24)
   - 3‰ precision (#14)
   - AMS (#41)
   - IntCal20's 13,900 / 55,000 (#35, numbers)
   - 26,937 artefacts, 辛追 (#2, #3)
   - the 1972 annual reports (#10)
   - Excluded as unverified or textbook: 76.7 % (#9, #31), the 77 % 示意 for 前168年 (#30, which depends on UNVERIFIED #8), the found C-14 ages of the pharaoh woods (#19).
