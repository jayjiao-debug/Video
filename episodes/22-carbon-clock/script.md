> **Gate 1 r2 must-fix applied by the producer (overnight, 2026-10-12):** L16 → 中国物理学家，拿到利比的书; L8 → 碳14每衰变一个，就是一声[滴答]; L24 → fallback 当年的吻合，是在误差范围内 (the sourced row for the original wording was not added tonight). `lines.json` is the source of truth; the lines table below may lag these edits.

# Script: 死后会变慢的钟  (v2, gate 1 round 2 · unattended overnight run 2026-10-12)

## Change log v1 → v2

Notes from `notes_gate1_r1.md` (director, REVISE):

- **Note 1 (too dense) → 38 lines cut to 30, waiting 0 % → 13 %** (`pace.py lines_arr.json --film-end 122`, no TOO FAST, all lines ≤ 16 glyphs). Every music anchor is unchanged. Line starts sit on the beat grid (16.625 + 0.5062·k) within each section.
  - (a) Cut L8 "树吸进它，人吃进它". The leaves taking in gold dots and the apple bite stay in the picture under the new L7/L9.
  - (b) Cut L13 "量出剩多少，就能倒推时间". The reading-arrow picture moves under L11.
  - (c) Cut L14 + L15 ("化学家利比" / "它叫碳14测年"). The method name stays on the title sub-line and on the emblem at the end of L11. Libby is introduced as the inventor in L12 ("发明人") and on his portrait card. The cold reader named "它叫碳14测年" at 46 s as the moment the film turned into a 科普 lesson; that line is gone now.
  - (d) Cut L21 (Nobel). The medal "1960 · 诺贝尔化学奖" rolls in during L15's hold, together with the checkbox tick.
  - (e) Cut L29. The bright 1960s ring moves under L22 "原因是[核试验]".
  - (f) Kept the tree-ring step as two lines, because the new reconciliation line (L24) comes before it: "要更准，拿[树轮]校准：每圈年份准确" + "测出每圈的碳14，排成[对照表]". The v1 lookup line ("木炭的读数，到表里查年份") is cut. Its picture (the charcoal inset looked up in the table) moves under L26, and the callback L30 "再[对表]" says it in words.
  - (g) Merged L37 + L38 into "一块木炭有多老？数滴答，再[对表]".
  - Also cut L12 "剩1/4，就是约1.1万年". The ¼ step is still shown in the picture under L11 as "再过5730年 → ¼". That leaves no 1.1万 figure on screen, so note 8a's 11,460 row is no longer needed.
- **Note 2 → L6 is now "你身上，也有这只钟".** The picture is unchanged: the reflection's meter ticks steadily at 15.
- **Note 3 → no "你" meter in the bomb beat.** Under L22 one tree ring glows twice as bright, tagged "1960年代". If the art director wants a meter there, it is labelled "1965年的树叶".
- **Note 4 → L14 is now "年代早已知道：距今约[4700年]".** The cards "约前2700年 / 约前2625年" stay.
- **Note 5 → the L27 tag is now "只剩约千分之二 · 约5万年".**
- **Note 6 → wording fixes:**
  - (a) L16 is cut, so the 靠/用 fix doesn't apply.
  - (b) L15 is now "论文写道：“吻合得令人满意”".
  - (c) L16 is now "1959年，物理学家拿到利比的书".
  - (d) L28 now says "核试验尖峰"; "核弹" is gone from the lines.
  - (e) The L1 museum label now reads "距今几千年".
- **Note 7 →**
  - (a) A tick is now defined in words (L8 "它每衰变一个，就是一声[滴答]") and in the picture: each tick = one gold C-14 dot winking out.
  - (b) The L13 wood tags are now just "左塞尔墓" / "斯尼夫鲁墓".
- **Note 8d → the sources line adds** Hunan Provincial Government portal 2026 (#12) and Chen 2023, *Frontiers in Earth Science* (#11).
  - Note 8a still needs a researcher row for "约4700年", computed as 2026 + 2700 ≈ 4,725 and 2026 + 2625 ≈ 4,650.
  - Note 8b is moot: L8 is cut.
  - Note 8c: the 夏鼐 caption is now the name only, with no "考古学家".
- **Note 9 → the overnight default (A) applies.** The film ships without Mawangdui, and the Chinese anchor is the 1959 / 1965 lab story.

Cold reader (`coldread_gate1.json`):

- **"Ticking of what?"** → L8 "它每衰变一个，就是一声[滴答]", with the picture link from note 7a. #23 measures exactly this: decays per minute per gram.
- **"前提错了, so were the matched tests lucky?"** → new L24 "当年对得上，是因为偏差在误差内", placed right after "前提错了". The picture returns to the 1949 tray and the 1965 cards: each measured age is drawn as a band, and the air's wiggle for that era sits inside it (示意).
- **"How is the bomb spike a clock?"** → L28 "核试验尖峰后逐年回落，成了新的[钟]". The picture puts year ticks on the falling slope: a reading slides to the slope and drops to one year.
- **"The film never comes back to 你" / "is MY C-14 doubled?"** → new L29 "你身上的钟，跟着今天的空气". The reflection's meter returns and links to the present-day end of the falling curve, far below the peak. No value is shown.
- **"往前 / 往后 took a second"** → L27 is now "太老的不行：超过约[5万]年就剩太少". L28 names the spike directly.
- **"同步 is vague: same amount? same ratio?"** → L9 is now "活着时不断补回，比例和空气[一样]".
- **"How can a lab test itself before it exists? Whose lab?"** → L17 is now "1965年，实验室成立前先考一考". L19 "这才成立" is unchanged.
- **"Dates stack up, 1960 Nobel → back to 1959"** → the Nobel is no longer a line (it is the medal under L15), and the build has 5 lines over 16 s.
- **Not addressed in words:** "how do you know the year of a ring in very old wood" (cross-dating). The facts table has no row for it, and the cold reader called it a small itch.

**Kept as notes say it works:**
- the hook structure and timings (0–16.40)
- the title on drop 1 at 16.625 and the title-card sub-line
- the tick meter as the one device
- breakdown = "这只钟准吗？…考一考"
- the build ending on "空气里碳14[不变]"
- the silent gap 79.41–81.43 on the flat gauge
- drop 2 at 81.45 = the spike → "原因是[核试验]"
- the catch order (premise → spike → cause → always varied → tree rings → table → two ends)
- Libby 1949 ↔ the 1965 lab, linked by one checkbox
- "这才成立"
- all of decision 5's cuts
- the end card question, @ prompt and pill
- the end card at 115.87

---

**Logline:**
- Every museum label says "距今几千年", but a piece of charcoal carries no date.
- Each "tick" is one carbon-14 atom decaying. While a thing is alive it keeps topping up from the air, so its ticks match the air. After death the ticks halve every ~5730 years, and the ticks left tell how long it has been dead.
- Libby tested the clock in 1949 on pharaoh-tomb wood of known age. China's first lab passed the same kind of test in 1965 before it was founded.
- The catch: the clock assumed the air's C-14 never changes. Nuclear tests nearly doubled it, and the air had always varied a little (within the early error bars). Tree rings with exact years became the table every reading is checked against, and the bomb spike itself became a new clock. The viewer's own clock follows today's air.

**Takeaway:** 活过的东西都带着一只钟：活着时和空气一样，死后滴答每约5730年少一半。数剩下的滴答，再拿树轮对表，才读得出它死了多久。

**Length:** lines 0.00–115.30 s, then the Juno end card 115.87–~122 s (music FIN 121.95). 30 lines.

**Music map** (series track `public/bgm.mp3`, played from 0; anchors unchanged):

| Section | Time (s) |
|---|---|
| intro | 0–16.625 |
| **drop 1 (title)** | 16.625 |
| main | 20.689 |
| breakdown | 49.041 |
| build | 63.205 |
| **silent gap** | 79.412–81.432 |
| **drop 2: first line at 81.45** | 81.432 |
| outro (end card) | 115.868 |
| FIN | 121.951 |

- Beat ≈ 0.506 s.
- Line starts after each section's first line sit on beats of 16.625 + 0.5062·k.

**Checks**
- `pace.py lines_arr.json --film-end 122`: 30 lines, 15.7 s waiting = **13 %**, no TOO FAST.
  - pace.py prints "[MAJOR] 13 %" because its built-in target is ≤ 12 %. The director's target for this film is 12–20 % (owner row 65).
  - The waiting sits mostly in the main section (5 lines at about 5.5 s each), where the picture does the most work (tree, dots, meters, halving curve).
  - The only gaps are the title (16.40–20.80) and the silent gap (79.30–81.45), both named beats.
- All lines are ≤ 16 glyphs, counting punctuation and digits (brackets excluded).
- `lines.json` uses `{start, end, text}`. `lines_arr.json` holds the same lines as `[[s,e,"text"]]`. `[ ]` marks the gold keyword.

## Decisions taken without the owner (unattended run)

1. **Mawangdui stays out (director note 9, overnight default A).** Facts #7 and #8 are UNVERIFIED. The Chinese anchor is the 1959 / 1965 lab. If a library check later verifies #7 (sample, lab number, result), one Mawangdui line can replace L17 without retiming. Its slot is 2.94 s, which fits up to 13 counted characters.
2. **No 76.7 %, no worksheet, no "课本" signal.** Recognition is invited only by the end-card question (owner row 73).
3. **The cold open is unchanged** apart from L6's wording.
4. **The reconciliation line (L24) states only what the facts support.**
   - The 1949 agreement was "satisfactory" against the stated ± uncertainties (#19, #20), and the premise of constant air was wrong (#33). Together these mean the deviation lay inside the error of the day.
   - No size of the natural variation is claimed: there is no row for it.
5. **The viewer's clock (L29) is tied to today's air only.**
   - That follows from "in atmospheric CO2, and consequently in living matter" (#37).
   - The falling curve after 1963 is #38.
   - No claim is made about how much bomb carbon a person carries today: there is no row for it.
6. **The method's name is no longer a spoken line.** It is on the title sub-line (16.6 s) and on the emblem at the end of L11.
7. **The look is left open (director's gate-2a note).** The picture column describes what the viewer must see, not a style, so it works for any of the 2–3 looks.

---

## Title options (≤ 10 字)

1. **死后会变慢的钟** (recommended; the overnight default)
   - It names the film's one counter-intuitive image: ticks steady while alive, slowing after death (L3–L4).
   - With L6 now "你身上，也有这只钟", the title on drop 1 answers that line.
   - It does not overclaim: the film shows exactly this.
   - Risk (cold reader): cold in the feed it can read as 鸡汤 or 灵异. The cover must carry the sub-line 碳14测年：数滴答，再对表.
2. **一块木炭有多老**
   - It is the film's own callback (L30), the most honest option, and concrete: one object.
   - It reads as calm 科普 and gives the least pull (the cold reader would scroll past).
3. **距今几千年，怎么算的？** (replaces v1's "谁定的'距今几千年'")
   - It is the viewer's own museum thought, word for word from L1. The cold reader's click pick was this label angle.
   - It drops "谁定的…", which the director read as "who decided this, arbitrarily?". That wording invited "碳14是假的" comments and promised a person instead of a method.
   - The film answers the question exactly: count the ticks, then check the table.

**Title-card sub-line (all options):** 碳14测年：数滴答，再对表

---

## Beat sheet

| Beat | Time | Purpose | What the viewer learns / feels |
|---|---|---|---|
| Hook (tiny story) | 0–16.4 | The viewer at a museum case, phone up | "The label says thousands of years, but the charcoal has no date. Alive, it ticked about 15 times a minute per gram; dead, it slows. The ticks left tell how long it's been dead. **You carry this clock too.**" The number is on screen by 5.2 s. |
| Title | 16.6–20.7 | Drop 1 | 《死后会变慢的钟》: the camera dives into the charcoal grain, which opens into a living tree's rings. |
| Setup: the clock | 20.8–49.0 | What it is, why it works | There is a little C-14 in the air. **One atom decaying = one tick.** Alive, the losses are topped up, so the ratio matches the air. Dead, there is no top-up, only decay. Ticks halve every ~5730 years. (Picture: ½, then ¼, a reading arrow, then the emblem 碳14测年.) |
| Twist: test the clock | 49.1–63.1 | Breakdown: why anyone believed it | Its inventor tested it first. In 1949 Libby took pharaoh-tomb wood whose age was already known (距今约4700年). The paper: "吻合得令人满意". (Nobel medal in the picture.) |
| Evidence 2: China | 63.25–79.3 | Build: the same test, here, with stakes | 1959: physicists get Libby's book. 1965: before the lab may exist, it is tested; 4 known-age woods all match; only then is China's first C-14 lab founded. Build peak: **the clock's premise is that the air's C-14 never changes.** |
| Silence | 79.4–81.4 | Breath | The air gauge, flat and alone |
| Reveal | 81.45–86.4 | Drop 2 | In the 1960s the air's C-14 roughly doubled, because of nuclear tests (one tree ring glows twice as bright). |
| The catch, reconciled | 86.5–101.1 | When it fails, why the tests still passed, the fix | The premise was wrong: the air always varied. The old tests still matched because the deviation lay within the error. For more precision, calibrate with tree rings (exact years), measure each ring and build the table, then look the charcoal up. |
| The clock's two ends + you | 101.2–111.2 | Limits, a new clock, back to the viewer | Too old doesn't work: past ~5万年 too little is left. The bomb spike, falling year by year, became a new clock. **And your clock follows today's air** (callback to L6). |
| Ending | 111.3–115.3 | Callback + takeaway | 一块木炭有多老？数滴答，再对表. Back at the case, first person. |
| End card | 115.87–~122 | Comment bait | Question below |

---

## Lines

- Chars = the units `pace.py` counts (Chinese characters, plus one per number).
- Needs = 0.5 + n/7 + 0.6 s.
- Glyphs = everything shown, counting punctuation and digits; the limit is 16.
- **The one recurring device is the tick meter:** a row of dots that light up one per tick, with the label "每克碳 · 每分钟". From L3 on, each lit dot is paired with one gold C-14 dot winking out in the sample (note 7a).

| # | Start | End | Line (≤ 16 字) | Glyphs | Chars | Needs | Picture (what the viewer sees) | Beat · music | Fact # |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0.00 | 2.55 | 展柜里写着：距今几千年 | 11 | 10 | 2.53 | **Frame 0, first person:** the viewer's own phone screen fills the frame, in camera mode, aimed at a lit museum case. Inside, a small black lump of charcoal sits on a plinth, with a label under it: "木炭 · 距今几千年". **Beat 1 (0.44 s):** the yellow focus square snaps onto the charcoal. | intro · hit on beat 1 | — (general) |
| 2 | 2.65 | 5.06 | 可木炭身上，没写日期 | 10 | 9 | 2.39 | Pinch-zoom: the charcoal's cracked, glossy grain fills the screen. No mark or writing anywhere. A tiny "？" blinks in the corner of the camera UI. | intro | — |
| 3 | 5.16 | 8.29 | 活着时，每克碳每分钟滴答约[15]下 | 16 | 14 | 3.10 | **The countable number.** A faint green ghost of the living tree grows out of the charcoal. Beside it the **tick meter** appears, labelled "每克碳 · 每分钟 ≈ 15". Its 15 dots light one by one on the beats, and with each one a tiny gold speck in the wood winks out. | intro | #23 |
| 4 | 8.39 | 10.66 | 死后，滴答越来越[慢] | 9 | 8 | 2.24 | The ghost tree fades into the black charcoal. The meter keeps ticking, but each dot lights more slowly and some stay dark. Tag "示意". | intro, the turn | #25 (mechanism) |
| 5 | 10.76 | 13.60 | 剩几下，就能说出它死了多久 | 13 | 12 | 2.81 | The dark dots are counted off, and a dial beside the meter turns, reading "死了多久？". The camera pulls back out of the phone to the case. | intro, rising | #29 |
| 6 | 13.70 | 16.40 | 你身上，也有这只钟 | 9 | 8 | 2.24 | **The emotional turn.** The case glass shows the viewer's own reflection, a twenty-something holding the phone. A small tick meter appears over the reflection and ticks steadily at 15. From ~15.6 s the camera **accelerates into the charcoal's grain**. | pre-drop | #23, #37 ("living matter") |
| T | 16.63 | 20.69 | *(title card)* | | | | **Drop 1:** the black grain cracks open into a warm cross-section of a living tree, with rings rippling outward like a clock face. The title **死后会变慢的钟** sits on the slice, with the sub-line 碳14测年：数滴答，再对表. | **DROP 1** | — |
| 7 | 20.80 | 26.14 | 空气里，有极少量的[碳14] | 12 | 10 | 2.53 | Pull back from the slice to the whole tree under a pale sky. The air is a field of tiny grey dots (carbon), with a rare few glowing gold, labelled "碳14". Over the hold, gold dots drift into the leaves (formerly under the cut L8). | main section | #22 |
| 8 | 26.24 | 31.71 | 它每衰变一个，就是一声[滴答] | 13 | 12 | 2.81 | **The tick, defined.** Push in to one gold dot inside a leaf. It flashes and winks out, and the tick meter lights one dot with a soft tick. Three or four more follow: one wink = one lit dot, every time. Small tag "1下 = 1个碳14原子衰变". | | #23 (disintegrations per minute per gram) |
| 9 | 31.81 | 37.28 | 活着时不断补回，比例和空气[一样] | 15 | 14 | 3.10 | Three meters side by side, "空气" / "树" / "你" (the viewer's figure bites an apple from the tree, hand on the apple, pose-checked), all at 15 and ticking **in step**. Whenever a gold dot winks out in the tree, a new one flows in from the air to replace it. | | #23, #37 |
| 10 | 37.38 | 42.85 | 死后不再补，只剩[衰变] | 10 | 9 | 2.39 | A branch is cut and falls (it is only a branch). A soft "closed" valve icon stops its inflow. Its dots keep winking out with no replacements, and its meter drifts out of step with the air's. | | #25 (mechanism) |
| 11 | 42.95 | 48.95 | 每过约[5730]年，滴答少一半 | 14 | 10 | 2.53 | Timeline bar "0 → 5730年": the branch's meter goes from 15 lit dots to half (tag "示意"), and a gold "½" stamps on the beat. It continues "再过5730年 → ¼" with no year total shown. A halving curve draws itself, and a reading arrow runs from "剩多少" across to the curve and down to "多少年" (formerly under the cut L13). At the end the curve and meter fold into one emblem: a tree-ring disc with a meter arc, labelled **碳14测年**. | | #25, #29, #32 (math) |
| 12 | 49.10 | 51.96 | 这只钟准吗？发明人先[考一考] | 13 | 12 | 2.81 | **Breakdown, the music thins.** The emblem tilts like a balance scale, and an empty pencil checkbox appears beside it. A portrait card slides in: "利比 · 美国化学家 · 碳14测年发明人" (2D style, no likeness claim). | breakdown 49.04 | #15, #17, #22 |
| 13 | 52.06 | 55.50 | 1949年，利比找来法老墓的木头 | 16 | 12 | 2.81 | Card "1949". Two pieces of wood slide in on a lab tray, tagged only "左塞尔墓" and "斯尼夫鲁墓". Behind them is a small step-pyramid silhouette, with a dot and label only and no map. | | #17, #18 |
| 14 | 55.60 | 59.05 | 年代早已知道：距今约[4700年] | 15 | 11 | 2.67 | Each wood gets an answer card from history, "已知 约前2700年" and "已知 约前2625年". The cards flip face-down (sealed) on the beat. | | #19 (+ 估算 row needed, note 8a) |
| 15 | 59.15 | 63.10 | 论文写道：“吻合得令人满意” | 14 | 11 | 2.67 | The meters measure the wood and the dials land. The cards flip, and dial and card sit side by side and agree. A paper strip shows the English in small print: "The agreement… is seen to be satisfactory." · Arnold & Libby, *Science* 1949. The checkbox ticks, and a plain gold medal disc rolls in: "1960 · 诺贝尔化学奖" (≥ 40 px, no likeness). | | #17, #20, #15 |
| 16 | 63.25 | 66.13 | 1959年，物理学家拿到利比的书 | 16 | 12 | 2.81 | **Build.** Card "1959". A book titled 《放射性碳测年》 passes from one figure (caption "夏鼐") to two others (caption "仇士华 · 蔡莲珍 · 核物理学家"). Hands are on the book, pose-checked. | build 63.2 | #11, #12 |
| 17 | 66.23 | 69.17 | 1965年，实验室成立前先考一考 | 16 | 12 | 2.81 | Card "1965 · 初冬". A bare lab room in the same style, with a **blank** door plate. The same empty checkbox as L12 appears, rhyming with Libby. | build | #13 |
| 18 | 69.27 | 72.21 | [4]块已知年代的木头，全都对上 | 14 | 13 | 2.96 | Four wood samples in envelopes (caption "佟柱臣 提供"). One by one their dials land next to face-down answer cards; the cards flip and all four match, with a check on each beat. No ages are shown (not in the facts). | build | #13 |
| 19 | 72.31 | 75.75 | 中国第一间碳14实验室，这才成立 | 16 | 14 | 3.10 | The blank door plate fills in: "中国科学院考古研究所 · 碳十四实验室 · 1965", and the checkbox ticks. | build | #11, #13 |
| 20 | 75.85 | 79.30 | 这只钟的前提：空气里碳14[不变] | 15 | 13 | 2.96 | Pull back to the sky over the lab. A large **air gauge** of gold dots reads steady at "100%", with a dashed line labelled "假设：一直不变". The music rises. | build peak | #33 |
| — | 79.41 | 81.43 | *(no subtitle)* | | | | **Silence.** Everything stills; only the air gauge and its flat dashed "不变" line remain. | **SILENT GAP** | — |
| 21 | 81.45 | 84.36 | 1960年代，大气碳14约[翻倍] | 15 | 10 | 2.53 | **Drop 2.** The flat line **spikes**: the gauge shoots to "约 ×2", and a curve draws a steep peak at the mid-1960s, labelled "北半球 · 1960年代中期". It is a clean graph only: no clouds, no flags. | **DROP 2** | #37 |
| 22 | 84.46 | 86.38 | 原因是[核试验] | 6 | 6 | 1.96 | The peak is labelled "核试验". The tree-ring slice from the title returns as an inset, where **one ring glows twice as bright**, tagged "1960年代". **No "你" meter** (note 3); if a meter is used, it is labelled "1965年的树叶". | | #37 |
| 23 | 86.48 | 89.92 | 前提错了：空气里碳14一直在变 | 15 | 13 | 2.96 | The dashed "不变" line from L20 cracks and falls away. Behind the bomb peak, the older part of the curve appears: never flat, with gentle wiggles all the way back (shape 示意). A small "1963 禁试条约" tick sits where the peak starts to fall. | | #33, #38 |
| 24 | 90.02 | 93.47 | 当年对得上，是因为偏差在误差内 | 15 | 14 | 3.10 | **The reconciliation.** The 1949 tray (L13–L15) and the four 1965 envelopes (L18) come back small, and each dial's reading widens into a **band** labelled "误差". For that era, the air's wiggle (from L23) slides in and sits **inside** each band, and the checks stay ticked. No numbers on the bands (found ages are not in the facts); tag "示意". | | #19 (± uncertainties), #20, #33 |
| 25 | 93.57 | 97.52 | 要更准，拿[树轮]校准：每圈年份准确 | 16 | 14 | 3.10 | The wiggly curve slides down onto a long tree-ring slab, each wiggle lining up with a band of rings. Push in: each ring gets a small year tag, counting back on the beats. | | #34 |
| 26 | 97.62 | 101.06 | 测出每圈的碳14，排成[对照表] | 14 | 12 | 2.81 | A tick meter samples a ring and the reading drops into a table column; row after row fills "读数 → 年份". The table becomes the calibration curve, tagged "校正曲线（示意）". Then the museum charcoal returns as a small inset: its reading slides to the curve, then down to a year band shown with a soft "约" bracket, because the answer is a range. | | #34, #35 |
| 27 | 101.16 | 104.60 | 太老的不行：超过约[5万]年就剩太少 | 16 | 15 | 3.24 | The camera travels left along the curve into the distance. The tick meter's dots go dark until barely one flickers, tagged "只剩约千分之二 · 约5万年". The curve fades into grain. | | #40 (0.24 % at 5730, see trace) |
| 28 | 104.70 | 108.15 | 核试验尖峰后逐年回落，成了新的[钟] | 16 | 15 | 3.24 | Whip back right to the bomb peak (L21), now glowing gold. Its falling slope gets plain year ticks on the axis, one per beat. A leaf sample tagged "示意" slides its reading across to the slope and drops to exactly one year tick, which lights. Tag: "1950年后的东西：可精确定年". | | #38, #39 |
| 29 | 108.25 | 111.18 | 你身上的钟，跟着今天的空气 | 13 | 12 | 2.81 | **Closing the 你 thread.** The museum glass and the viewer's reflection return (L6), and its tick meter ticks at 15. A thin gold thread runs from the meter to the **present-day right end** of the falling curve, far below the peak, beside the air gauge; the two tick in step. No value, no "×2". | | #37, #38 |
| 30 | 111.28 | 115.30 | 一块木炭有多老？数滴答，再[对表] | 15 | 13 | 2.96 | **Callback.** The curve folds back into the museum case, and we are again first person on the viewer's phone, the focus square on the charcoal. The charcoal's meter and a tiny tree-ring disc appear side by side, and a small gold check joins them. **对表** turns gold. The phone lowers; the reflection, with its own meter, holds. | payoff | #23, #34 |
| E | 115.87 | ~122 | *(Juno end card)* | | | | The glass reflection whitens into the **Juno end card**: J monogram, gold title, question, follow pill `关注 Juno · 一起看懂世界`, sources. | **outro 115.87 → FIN** | — |

**Transitions (all motivated, no hard cuts):**
- phone screen → dive into the charcoal grain → it opens into the living tree's rings (title)
- tree → sky dots → one leaf's dot (the tick) → meters
- curve → emblem → the tilted emblem as a scale → Libby's tray
- the empty checkbox carries Libby to the Chinese lab (the same box)
- lab → pull up to the sky and the air gauge
- gauge spike → ring inset → the wiggles behind the peak → back to the 1949 / 1965 bands
- curve → tree-ring slab → table → museum inset
- the curve's left end fades → whip to the peak → its right end → the thread to the reflection
- curve folds into the case
- glass reflection → end card

**Sensitivity:**
- Nuclear tests appear only as a labelled curve and a glowing ring: no clouds, no country names, no flags, and "核弹" is not in the lines.
- No maps or borders.
- Real people appear only as figures or cards without likeness claims, with no invented dialogue. The only quote is the 1949 paper's sentence.
- No human remains.

---

## End card

- **Question for comments:** 第一次听说"碳14"，你是在哪？
  - Alt: 如果能测，你最想知道哪件东西有多老？
- **@ prompt:** @一起逛过博物馆的那个人
- **Sources line:**
  - Arnold & Libby, *Science* 1949
  - Currie, *J. Res. NIST* 2004
  - Reimer et al., IntCal20, *Radiocarbon* 2020
  - Turney et al., *Sci. Rep.* 2018
  - Hua et al., *Radiocarbon* 2022
  - NobelPrize.org 1960
  - Chen, *Front. Earth Sci.* 2023
  - 张雪莲, 中国社会科学网 2022
  - 《大众考古》2016
  - 湖南省人民政府 (enghunan.gov.cn) 2026

---

## Every number or named claim on screen → facts row

| On screen | Value | Row | Status |
|---|---|---|---|
| 每克碳每分钟约15下 (living) | 15.3 ± 0.5 dpm/g | #23 | OK |
| 1下 = 1个碳14原子衰变 | dpm = disintegrations per minute | #23 | OK |
| 碳14 in the air | natural 14C, Libby 1946 | #22 | OK |
| 比例和空气一样 / 跟着今天的空气 | "in atmospheric CO2, and consequently in living matter" | #37 | OK (mechanism) |
| 约5730年少一半; ½ → ¼ | 5730 ± 40; (1/2)² | #25, #32 | OK; meter counts are **示意** |
| 碳14测年 · 利比 · 发明人 · 美国化学家 | Nobel 1960 "for his method" | #15, #22 | OK |
| 1949, 左塞尔墓 / 斯尼夫鲁墓 | Arnold & Libby 1949 | #17, #18 | OK |
| 距今约4700年 · 约前2700年 · 约前2625年 | 2700 / 2625 BC (expected); 2026 + 2700 − 1 ≈ 4,725, 2026 + 2625 − 1 ≈ 4,650 | #19 | OK for the BC dates; **"约4700" needs the researcher's 估算 row (note 8a)** |
| "吻合得令人满意" | "The agreement between prediction and observation is seen to be satisfactory." | #20 | OK (translation; paper attributed) |
| 1960 诺贝尔化学奖 (medal, picture) | | #15 | OK |
| 1959 · 物理学家 · 利比的书 · 夏鼐 · 仇士华 · 蔡莲珍 | | #11, #12 | OK (夏鼐 caption is the name only) |
| 1965 · 初冬 · 4块 · 佟柱臣 · 这才成立 · 中国第一间 | | #11, #13 | OK |
| premise: constant air C-14 → wrong | | #33 | OK |
| 1960年代 约翻倍 · 核试验 · 北半球 · 1960年代中期 | | #37 | OK |
| 1963 禁试条约, then falling (逐年回落) | | #38 | OK |
| 偏差在误差内 | ± uncertainties on the known ages, agreement "satisfactory" + wrong premise | #19, #20, #33 | inference from verified rows; no magnitude claimed (director to confirm) |
| 树轮年份准确 | "reliable to the nearest year" | #34 | OK |
| 对照表 / 校正曲线 | IntCal20 | #35 | OK (shape 示意) |
| 约5万年 · 只剩约千分之二 | (1/2)^(50000/5730) = 0.24 % | #40 | OK (估算 check in #40) |
| 新的钟 · 1950年后可精确定年 | post-1950 dating | #39 | OK |

## Still open

1. **Researcher (note 8a):** add a 估算 row for "距今约4700年": 2700 BC → ≈ 4,725 years before 2026 and 2625 BC → ≈ 4,650, so "约4700".
2. **Director:** confirm that L24 "当年对得上，是因为偏差在误差内" is acceptable as an inference from #19 / #20 / #33. If not, the fallback (same slot, 12 chars) is "当年的吻合，是在误差范围内".
3. **Owner (note 9):** Mawangdui shipped as option A (out). If a later library check verifies #7, it replaces L17 (2.94 s slot).
4. **Not used (true, cut for focus):**
   - coal dilution 2.5 % (#36)
   - 5568 vs 5730 (#27, #28)
   - "present" = 1950 (#24)
   - 3‰ (#14)
   - AMS (#41)
   - IntCal20's 13,900 / 55,000 (#35)
   - 辛追, 26,937 artefacts (#2, #3)
   - the 1972 annual reports (#10)
   - Excluded as unverified or textbook: 76.7 % (#9, #31), 77 % (#30), and the found C-14 ages of the pharaoh woods (#19).
