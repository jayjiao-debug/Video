# Script: 假如你是清明上河图  (v2.1 · fix pass on the v2 cold read; v2 approved at gate 1 r2)

Screenwriter, 2026-10-24. Files: this script + `lines.json` (48 lines, `[[start, end, "text"], ...]`, `[red]` = red key word).
**Length:** 170.0 s (2:50) nominal, was 180.0 s; **184.3 s (3:04) in the build**. **Lines:** 48, was 51.
**v2.2 (2026-10-24): retimed to the owner's track. Timing only, with no wording changes.** The build uses `lines_bars.json` (184.3 s). See "Retiming to bars".
**v2.3 (2026-10-24): the title goes on drop 1 (the owner's decision).**
- **New order:** H1–H2 → **title card on drop 1 (9.05 s)** → T1–T4 → N1 → N2 → S1.
- **Timing only:** the same 48 lines with the same wording, and no new lines. From B1 (bar 13) onward nothing moves.
- **Files:** `lines.json` stays as the nominal v2.1 timing (old order, title at 23.25–26.25). The build uses `lines_bars.json`. See "Retiming to bars (v2.3)".
**Look:** A 汴河暮影 (owner pick, gate 2a). The picture column describes look A only. The B and C mappings are gone.

## Changelog v2.1 (cold read of v2, routed by the producer)

Runtime unchanged at **170.0 s**, 48 lines. The only timing change is the D1/D2 boundary (134.75 → 135.25). Only the lines the producer routed changed: M1, D1–D2 and E7. Their protected parts are kept: M2's 几经辗转, two donkey lines tied by 假驴, and E7's 「安全的代价」.

| Note | What changed |
|---|---|
| 1 Donkey pair (131.75–138.25): "nothing says someone painted the donkey in" | Reordered as cause → effect, still two lines (C33). **D1** 「1973年重裱，揭掉了一头【假驴】。」 → 「明朝人把草棚当驴耳，【补画】了头驴。」 (14: who, why, what). **D2** 「原来，明朝人把草棚看成了【驴耳朵】。」 → 「1973年重裱，【假驴】才被揭掉。」 (10). 假驴 stays, so the tie to the fakes holds. D1 is now 3.5 s and D2 3.0 s, and both meet the Needs + 0.4 s retiming floor (old D1 was 0.1 s under it). **Stamps.** D1 「— 明代 / 裱画师误补（故宫装裱记录）」 and D2 「— 1973 · 故宫 / 重新装裱（故宫装裱记录）」. The 47/38 line 3 is dropped because the 1973 stamp now holds 3.0 s (< 4 s). D1 is an undated Ming flashback, so its chip reads 明 and the counter is hidden. |
| 2 陆完 (69.25): "no introduction; is he the 文人?" | **M1** 「陆完被抄家前，把你藏进了【朋友家】。」 → 「明朝，主人陆完被抄家前【藏】起了你。」 (14, same 3.5 s). 明朝 separates him from the Yuan 文人, and 主人 says who he is to you. **Not 大臣 / 尚书:** neither is in a ✓ row. C15 calls him only 主人, and C7 lists him as a colophon writer. Identity + name + cause + 朋友家 doesn't fit in 16 wide, so the friend's house moves to the picture and the stamp (「陆完藏画友人家（余辉考）」, unchanged). The red moves to 藏, which seeds E3's 藏你 the way F1's 偷 seeds 偷你. |
| 3a Z2 「在你身后」 (40.5) | **Not changed.** Z2 is on the don't-change list (Z1–Z5). The only same-length option, 「在你卷尾写下」, loses the personification and isn't clearly better. The picture (张著 writing on the paper joined to your end) settles 身后. |
| 3b Q1 「主人家」 (86.0) | **Not changed.** M1 now introduces 主人 as "whoever owned you then", so 「清朝，主人家被抄」 reads as M1's parallel. The same-length 「清朝，新主人被抄」 is less natural and not clearly better. The Q1 stamp still names 毕沅. |
| 3c E7 「展一次静养三年以上」 (157.0) | **E7** → 「安全的代价：展完要静养【三年以上】。」 (same 14, same width 16). 完 and 要 supply the missing "after" and "must". This is O9's own logic: "一次展出以后…必须…“静养”三年以上". |

## Changelog (gate 1 r1 → v2)

| Note | What changed |
|---|---|
| 1 冯保 | **F1** → 「1578年，太监冯保把你【偷】出了宫。」 (C20: 故宫纪录片 "偷盗而出"; 故宫VR dates the removal 1578). **F2** → 「画你的人没留名，偷你的倒【题了字】。」, a callback to Z1 (C2 + C20). Order check: 偷你的 is only a label for who he is, and 倒题了字 says only that a colophon of his exists. Neither says when he wrote it relative to the theft. The F2 **picture** is an insert of the colophon itself, not a scene of him writing after walking out, so the picture implies no order either (C20 Pass 2). T2 stays 「带出皇宫」. The stamp line 2 uses the museum's own words: 「冯保偷盗而出（故宫博物院）」. |
| 2 陆完 → 严嵩 | **M1** 「陆完被抄家前，把你藏进了【朋友家】。」 / **M2** 「几经辗转，你落到权臣【严嵩】手里，」 (line 1 stays) / **M3** 「严家倒台，你被抄进了【皇宫】。」. Same running time. I used 几经辗转 rather than 「后来你辗转…」 because W3 now also starts with 后来 (see 3). 明 stays in the chip and stamp. |
| 3 names | **W3** → 「后来买下你的文人，【记下】了调包。」 (杨准 moves to the stamp). **Q1** → 「清朝，主人家被抄，你【又进了宫】。」 (毕沅 moves to the stamp). **Q2** → 「嘉庆盖了五方大印：你归【皇家】了。」, which sets up P1's irony. The 55–96 s run now names only 陆完, 严嵩, 冯保, 嘉庆 and 溥仪. **K7 not used** (see "Left out on purpose"). |
| 4 counts | Researcher: same 《佚目》 batch, but no source maps the 1950 scrolls to the 1923 entries (C31). So I removed the clash. **Y2** → 「专家杨仁恺，翻出【好几卷】“你”。」 (no count; the C30 three is "好几"). **Y3** is unchanged and C31-true. Also **P3** → 「清单上，其中两卷都写着【张择端】。」. That change wasn't routed, see "Where I differ". |
| 5 handover | **B2 + O1 → BO** 「你进了北宋【皇宫】，靖康后流入【金国】。」 (16, 3.5 s; C1 + C5). On consecutive beats the tally lights 进 then 出 and the sky turns to fire-glow. Saves 3.0 s. M3 → F1 stays on one shot (picture column). |
| 6 抄你 | **C1 cut** as a line (−3.5 s). The 抄 flash in E3 is now the wall of grey copies with 「约一百卷 · 只有一卷是你」 (K1, K4), and the stamp switches to 「约百卷仿本（余辉估）」 on that beat. E3 goes from 3.25 to 3.5 s so the 抄 frame holds about 1.5 s. 偷 / 换 / 藏 / 抄 are now all things people did out of wanting you. |
| 7 donkey | **D1** 「1973年重裱，揭掉了一头【假驴】。」 / **D2** 「原来，明朝人把草棚看成了【驴耳朵】。」 (two lines, was three; −3.5 s). The patch peeling off is in the picture. 假驴 ties it to the fakes thread. Climax to E1 is now 10 s (was 17.5). |
| 8 | **(a) E7** → 「安全的代价：展一次静养【三年以上】。」 (O9). **(b) Q** → 「要是排【五小时】看两分钟，你去吗？」 (one 你, a hypothetical). The spare stays 「下一次见你，你觉得要等几年？」. |
| 9 | **(a)** The frame-0 stamp is now 「— 《清明上河图》」, with 张择端 not named. The frame stays the 虹桥 full-frame. **(b)** The P2 stamp is now 「25天内 · 4卷（清宫档案）」, so no 1922 appears on screen. |
| 10 | **V2 picture** stays inside C27: the courtyard empties and headlights sweep away. No crates pried open, no scattered scrolls. **P1 stamp** → 「以赏给弟弟溥杰为名（清宫档案）」 (C24b). Z4 is unchanged: C6 Pass 2 confirms 藏者宜宝之 are 张著's own words. |
| Researcher C9/C11 | The swap is dated only 「1351年以前」: **T1 stamp** 「— 元 · 1351年前」. **W1–W2 stamp** 「— 元 · 1351年前 / 裱画匠调包（杨准记）/ 杨准原话："以似本易去"」. No 至正 and no single year. The counter at W1–W2 goes 240多 → **200多** because 240多 assumed 至正. W3 keeps 约251 (1351), so it still never stops on 250. |
| Owner: look A | The picture column is rewritten for 汴河暮影: you are the only light, and the handovers happen on the 虹桥 crest. In/out has a fixed screen direction, and each deal's mood follows gate-2a R7: official entries at dusk or in daylight, secret exits at night with the lanterns out. The palace gate set is gone; the era's palace is a silhouette on the far bank. Full-frame painting inserts are entered through your glowing silk. |
| Also | **H2/T1:** the cut moves 6.00 → 5.75, so H1–H2 sit within reading budget + 0.5 s (director's retiming rule). **M3 red** 抄进 → 皇宫, so 抄 isn't primed as 抄家 right before E3's 抄你 = copy you. |

**Unchanged on purpose (director's "don't change" list):**
- H1/H2 and their E4/E6 payoffs. T1–T4 as one sentence on four hard cuts. N1/N2 + card. The title on the drop. S1 + tally.
- Z1–Z5. W1–W2. P2. V1–V3 discipline and the 1-s pause. Y1, Y3, Y4. E1 → E3. E5/E6. The end-card format.

---

**Logline:** 你就是《清明上河图》。九百年里，人人都想留住你，所以你一直在被带走：被调包、被藏、被太监偷出宫、被末代皇帝偷运出宫、在乱中下落不明，最后在一堆残次品里被认了出来。
**Takeaway:** 人人都想据为己有的东西，直到不再属于任何一个人，才终于留住了。安全的代价是：它很难再被看见。

**Notes on the numbers:**
- **Timing is nominal** in this table and in `lines.json` (0.25 s grid). The bar-locked timing for the build is `lines_bars.json` (see "Retiming to bars").
- **Counting.** 字 is counted as in `pace.py` (a number counts as one). The ≤ 16 rule is checked on display width (punctuation 1, each digit 0.55). The widest lines are 16.0.

## Story in 3 lines
1. 你是《清明上河图》。九百年里人人都想留住你，所以你四次被带出皇宫、五次被送回：被裱画匠调包、被藏进朋友家、被太监偷出宫、被末代皇帝偷运出宫，1945年还下落不明。
2. 几年后，沈阳的库房里翻出好几卷"你"：标着真迹的都是仿的，混在残次品里的那一卷才是你。连你身上，也有一头明朝人补画的假驴。
3. 第一个写下画家名字的张著，留了一句"藏者宜宝之"，后人珍惜到偷你、换你、藏你、抄你。直到你不再属于任何一个人，你才不再被带走。代价是展一次要静养三年以上，所以你这么难见。

## Title options (≤ 10 字)
1. **假如你是清明上河图** (9 字). **Recommended; the director's pick.**
   - It is the format's own title shape, which the owner asked us to replicate.
   - It answers the cold reader's main confusion ("who is 你?") the moment it is seen. In v2.3 the card lands at 9 s (drop 1), 15 s earlier than before.
   - It promises the device, not any single event, so it can't overclaim.
   - Against: the cold reader finds "假如你是X" template-like.
2. **谁偷走过清明上河图** (9 字). The clickiest, and the cold reader's pick.
   - The film answers it three times, each from a ✓ row in the Palace Museum's or the source's own words: the mounter (C9 盗出), the eunuch (C20 偷盗), the last emperor (C24 偷运).
   - It asks "who", not "how many times", because how you left in 1127 is unknown (C5).
   - It is slightly narrower than the film (which also covers the find and 难见), but it doesn't mislead.
3. **清明上河图，为什么难见** (9 字 + comma). New; it replaces 「四出五进」, which both the cold reader and I ranked last.
   - It is the viewer's own question: they queued or saw the queue (N1).
   - The film asks it at N2 and answers it at E7–E8, so the title is fully paid off.
   - It names the painting and promises nothing the film doesn't deliver.
   - Against: it sounds more like an explainer than an adventure, and it hides the heist life.

**Cover:** the title alone (owner row 105). No hook line, and nothing that spoils the 残次品 reveal.

## The opening and the ending at a glance
Times are the build timing (`lines_bars.json`, v2.3).

| Part | Time | Lines |
|---|---|---|
| 1 Paradox hook | 0.00–7.11 (wind-up to 9.05) | 九百年，人人都想【留住】你。 / 所以，你一直在被【带走】。 (stamp: — 《清明上河图》) |
| 2 Title card | 9.05–11.64 | 假如你是清明上河图 (slams on drop 1's hit) |
| 3 Fate teaser (4 hard cuts, year stamps) | 11.64–21.83 | 你被人偷偷【换成了假的】，(元 · 1351年前) / 被一个【太监】带出皇宫，(1578) / 被【末代皇帝】偷运出宫，(1923) / 还躺在一堆【破画】里。(约1950) |
| 4 Present-day hook | 21.83–27.49 | 排队【四五个小时】，只看你【一两分钟】。 / 你，为什么这么【难见】？ (centred) |
| 6 Twist + moral | 142.39–172.39 | 藏者宜宝之——人人都很【珍惜】你： / 【偷你】、【换你】、【藏你】、【抄你】。 / 可四个朝代的皇宫，都没【留住】你。 / 直到你不再属于【任何一个人】， / 你才终于，不再被谁【带走】。 / 安全的代价：展完要静养【三年以上】。 / 所以，你才这么【难见】。 |
| 7 Comment question + end card | 174.66–184.30 | 要是排【五小时】看两分钟，你去吗？ (centred, on the Juno end card) |

## Beat sheet
Times are the build timing (`lines_bars.json`, v2.3).

| Part | Time | Purpose | What the viewer learns / feels |
|---|---|---|---|
| 1 Hook | 0–7.11 s (wind-up to 9.05) | Paradox: wanting to keep you is why you were always taken. Frame 0 is the painting, and the stamp names it. | 「为什么想留住，反而被带走？」 |
| 2 Title | 9.05–11.64 s | Title card on drop 1's hit, straight after the paradox (owner's decision, v2.3). | Who 你 is: the painting, named at 9 s. |
| 3 Teaser | 11.64–21.83 s | Four fates with year stamps; each is paid off on the same shot later. | A heist life in 10 seconds. |
| 4 Present day | 21.83–27.49 s | The 2025 queue; then gone again. The question leads straight into S1. | 4–5 hours for 1–2 minutes. Why? |
| 5a Spine + birth | 27.49–37.68 s | 四出五进 tally; painted; in and out of the Song palace in one line. | The tally is the map: 4 outs, 5 ins. |
| 5b 张著 | 37.68–54.66 s | 原来如此 1: the unsigned painting gets its painter's name from a Jin owner's note, which ends 「藏者宜宝之」. | Set-up for F2 and the ending. |
| 5c 元 | 54.66–68.24 s | In; the swap (teaser 1 paid off); the later buyer wrote it down. | 原来如此 2: you carry your own diary. |
| 5d 明 | 68.24–86.36 s | Your Ming owner 陆完 hides you before his house is raided (the friend's house is in the picture) → 辗转 → 严嵩 → confiscated in → 冯保 steals you (teaser 2 paid off), and the thief signs where the painter didn't. | 藏 and 偷; the irony of names. |
| 5e 清 · 民国 | 86.36–114.66 s | Confiscated in; 嘉庆's five seals: you belong to the court → the court's own emperor smuggles you out (teaser 3 paid off); four 清明上河图 in a month; 伪满; 1945 lost. | The fakes travel with you; then you are lost from frame. |
| 5f 约1950 | 114.66–130.51 s | Storeroom; several "you"s; the labelled ones are copies, the reject is you (teaser 4 paid off). | 原来如此 3: the real one looked like the worst one. |
| 5g Home | 130.51–141.83 s | 1950s back (tally complete); a Ming hand painted a donkey onto you (cause), and the 1973 remount peeled the fake off (effect). | 原来如此 4: even you carried a fake part. |
| 6 Twist + moral | 142.39–172.39 s | 藏者宜宝之 → 偷换藏抄 → four palaces lost you → safe once you belong to no one → the price of safety: rarely shown. | 原来如此 5: answers 「为什么这么难见」. |
| 7 Question + end card | 172.39–184.30 s | Something viewers will answer in one word. | 「要是排五小时看两分钟，你去吗？」 |

## Callbacks (set-up → payoff)
| Set-up | Payoff |
|---|---|
| H1 「人人都想【留住】你」 | E4 「四个朝代的皇宫，都没【留住】你」 |
| H2 「你一直在被【带走】」 | E6 「你才终于，不再被谁【带走】」 |
| T1 swapped (mounting room) | W1–W2: the same mounting-room shot, longer, then the night sale on the crest |
| T2 eunuch on the night crest (1578) | F1: the same shot, continued |
| T3 crate on the winter crest (1923) | P1: the same shot, continued |
| T4 storeroom pile (约1950) | Y1–Y4: the same storeroom, lamp on, the reveal |
| Z1 「你身上，没有画家的名字」 | F2 「画你的人没留名，偷你的倒题了字」 |
| Q2 「你归皇家了」 | P1 「1923年，溥仪把你偷运出了宫」: the court itself takes you out |
| Y2 好几卷“你” | Y4 「混在残次品里的那一卷，才是你」 |
| N1 queue · N2 「为什么这么难见？」 | E7–E8 「安全的代价…」/「所以，你才这么难见」; Q asks about the same queue |
| Z4–Z5 「藏者宜宝之」 + gloss | E1 「藏者宜宝之——人人都很珍惜你：」 |
| M1 【藏】起了你 · F1 【偷】 · W1 换走了你 | E3 藏你 / 偷你 / 换你: each verb is seeded on its own beat |
| W1 假画 · P3 两卷都写着张择端 · Y3 仿的 · D2 假驴 | E3 换你 / 抄你 (the 抄 flash: 约一百卷 · 只有一卷是你) |
| S1 tally 出○○○○ 进○○○○○ | fills at every in/out; complete at R1; the 出 marks flash at E4 |

P3 → Y3 is **not** a callback. No source ties the 1950 scrolls to the 1923 entries (C31), so the lines don't link them.

## Screen furniture (look A · 汴河暮影)
- **Subtitle.** Top-left (x 150, first line y ≥ 132), Noto Serif CJK SC Black 58 px, at most 2 lines.
  - **Reveal.** Typed lines reveal in ≤ 0.4 s, and their budget includes that 0.4 s.
  - **Cut-on lines.** T1–T4 and E3 appear whole on the cut.
  - **Red.** `[ ]` words are #EE4B3B.
  - **Centred lines.** N2 and Q end in ？ and are centred with the ½ em pull-back (owner row 97).
- **Stacking.** A line marked **"line 1 (stays)"** stays above the next line (its line 2) until line 2 ends. Then both clear.
  - `lines.json` gives each line its own reading window; windows never overlap.
  - Stacking only adds display time, so a reviewer who extracts subtitles from the render will see line 1 "waiting". That's the stack, not slack.
- **Stamp (top-right).**
  - Line 1 `— 年份 · 地点` (56 px).
  - Line 2: event + plain-language source in brackets (40 px, ≤ 14 字).
  - Line 3: a detail or quote (34 px), only where the stamp holds ≥ 4 s.
  - `〃` = unchanged. Stamps change on a beat. Teaser cuts show line 1 only.
- **Era chip + counter (bottom-left).** Red era chip + `你 约N 岁`.
  - Anchor c. 1100 (O8, 估算). "约N" where the stamp has a year; "N多" where it has only an era.
  - The counter is hidden in the hook, teaser, present day, title and end card, and on the D1 flashback (明, undated). It never stops on 250.
  - Chips: 北宋 · 金 · 元 · 明 · 清 · 民国 · 新中国. 伪满 is never a chip.
- **四出五进 tally.** Beside the counter: four 出 and five 进 marks, labelled 「四出五进 —— 故宫博物院」.
  - Marks light on their beats: 进 BO · 出 BO · 进 I2 · 出 W2 · 进 M3 · 出 F1 · 进 Q1 · 出 P1 · 进 R1 (complete; all nine flash red).
- **The stage: the 虹桥 crest.** Seen side-on: railing, lanterns, a boat lowering its mast beyond.
  - **Far bank:** the era's palace in silhouette. 宋 宫城门楼; 元 大都 skyline with the White Dagoba; 明/清 紫禁城 角楼 and 午门; 1920s the same in winter; 1950s and today the 午门 with a museum plaque.
  - **Screen direction is fixed:** **进** = you are carried leftward over the crest toward the palace; **出** = you are carried rightward, away from it, into the dark.
  - **What changes per era:** only the sky and season, the hat silhouettes, the boat and the far-bank palace.
  - **Mood follows the deal (gate 2a R7):**
    - Official entries (BO 进, I2, M3, Q1, R1): dusk or day, people on the bank, lanterns lit.
    - Secret exits (W2, F1, P1): night, lanterns out, figures close, your glow the only light.
    - BO 出 (靖康): fire-glow sky and refugee carts; nobody is seen grabbing you.
- **Light.** You are the only glowing, saturated thing in every frame, and you rim-light whoever holds you.
  - Small practicals (the mounting-room lamp, the 1950 desk lamp) stay dim and small.
  - Red is reserved for seals, the tally and key words.
  - Skies follow looks.md: `#2B4552 → #6E827E → #E6B676 → #F3CC8E`, silhouettes `#15100C`, silk `#FFF3D8` with a `#FFD58F` rim.
- **Inserts.** A push through your glowing silk gives a full-frame painting insert (code-drawn, no scan, L1): frame 0, B1, Z1–Z4, F2, Q2, Y4, D1–D2, E1.
- **Interiors.**
  - The mounting room with the round window and White Dagoba (the gate-2a hook still): T1, W1.
  - A southern study: W3. A Ming house: M1–M2. The 伪满 library building: V1–V2. The 沈阳 storeroom: T4, Y1–Y4.
  - The 1973 restoration table: D2. The 午门 queue and the case: N1–N2, E5–E8.
- **People.**
  - Whole figures only, profiles and silhouettes, never hands from off-screen (brief).
  - No likeness of 溥仪: at most a distant back view, never comic.
  - No plane, airfield or map in 1945.
  - Deaths (陆完's mother, 王忬) are not shown or mentioned.

## Retiming to bars (v2.3 · title on drop 1)

Screenwriter, 2026-10-24. v2.2 retimed the lines to the owner's track. v2.3 reorders the opening on the owner's decision (owner-notes row 133): **the title card goes on drop 1, before the fate teaser.** He chose this over the iwanau order (paradox → teaser → question → title).
- **Timing only.** The same 48 lines, with the same wording and in the same order. No new lines. The title card is the only thing that moves: from after N2 to between H2 and T1.
- **Files.** `lines_bars.json` is the build timing (same format as `lines.json`). `lines.json` stays as the nominal v2.1 timing (old order). The v2.2 timing is saved in the scratchpad if anyone needs to diff it.
- **Length.** The film is **184.3 s (3:04)** and ends where the song ends (music.md).

### v2.3 changes (against v2.2)
| What | v2.2 | v2.3 | Why |
|---|---|---|---|
| Title card 假如你是清明上河图 | After N2: bar 10 → 11.25 (24.09–26.92) | **After H2: drop 1's hit, 9.05 → bar 4.5 (11.64)** | The owner's decision. 9.05 is where the drop is heard (see "Drop 1, measured"). |
| T1–T4 | Bars 3 / 4.5 / 5.5 / 6.5 | **4.5 / 6 / 7 / 8** | They start once the title has had its reading time. T2–T4 now cut on downbeats, and T4 lands on the bar-8 phrase change. |
| N1 | 7.5 (18.43) | **9 (21.83)** | Follows T4. |
| N2 | 9 (21.83) | **10.5 (25.22)** | Follows N1 (6 beats). Same 2.26 s on screen. |
| S1 | 11.25 → 13 (26.92–30.88, 3.96 s) | **11.5 → 13 (27.49–30.88, 3.40 s)** | **The only change from S1 onward: it starts one beat later.** It still ends on bar 13, so B1 and everything after it are exactly as in v2.2. |
| B1 → Q (lines 10–48) | — | **Unchanged** | — |

**Why S1 can't stay on 11.25.**
- At their pace.py minimums, with every hard cut on a bar or half-bar (as in v2.2), the teaser, N1 and N2 need 28 beats = 7 bars: T1 6 beats, T2–T4 4 each, N1 6, N2 4.
- The title needs its own reading time from the slam: 2.39 s for 9 字. So it can't hand over before 9.05 + 2.39 = 11.44.
- The first half-bar after that is 4.5 (11.64), and 4.5 + 7 bars = **11.5**.
- Keeping S1 on 11.25 would need one of these, and none is allowed:
  - The title held for only one bar (to bar 4, 10.51). That is 1.46 s from the hit, or 2.26 s even from the 8.24 downbeat. Both are under its 2.39 s.
  - The T1 hard cut on bar 4.25. That is beat 2, off the bar/half-bar grid for a scene cut (owner row 49).
  - A teaser line under pace.py's floor. T1 in one bar is 0.015 s TOO FAST, and N1 in 5 beats is 0.02 s TOO FAST.
- **Cost:** S1 gives up one beat (0.57 s). It still has 0.59 s over its Needs and stays above its floor (3.40 against 3.21).

**Grid.** From music.md: 106 BPM, film bar j = 1.4498 + 2.26415·j s, one beat = 0.566 s. I re-checked it on `audio/bgm_cut.wav`, first bar by bar for loudness and then in 10 ms windows for onsets:
- **Drop 1's hit is at 9.04–9.05, not on the 8.24 downbeat** (see "Drop 1, measured").
- The bass is off on the even bars 34–40.
- The stop is at bar 49 and hits on its downbeat (112.35–112.40). There is no bass in bars 50–52, and bar 50 re-enters on its downbeat.
- The hardest drop is at bar 54, and the loudest bars are 56–57 and 64–65.
- The outro starts at bar 74, and the music ends at about 184.3 (silent by 184.5).

**Bar notation.** 4.5 = bar 4, beat 3 (the half-bar). 51.25 = bar 51, beat 2. 52.75 = bar 52, beat 4. 3.375 = bar 3, the off-beat eighth after beat 2 (9.09 on the grid).

**Rules used**
- **Starts.** Every line starts on a beat. Scene cuts sit on a bar or a half-bar (owner row 49). A line inside the same shot may start on any beat.
  - **Exceptions:** H1 at 0.00 (owner rows 22 and 47: subtitle on frame 0), and the title slam at 9.05. The slam follows the measured hit (owner row 26: find drops by measuring the audio, not from a grid). The title is a card, not a line.
- **Pace.** No line is TOO FAST in pace.py. The script's own floor (Needs + 0.4 s for typed lines) holds wherever the anchors leave room. The lines that miss it are listed under "Below the floor".
- **Note 4a.** M2, Q2 and D1 only gain time.
- **Holds** go where the producer named them: 才是你, E3, the moral and the end card. Where a long hold would leave a read line sitting on screen, the text clears and a named picture beat carries the time instead.

### Drop 1, measured: the hit is at 9.05, not on the 8.24 downbeat
Measured on `audio/bgm_cut.wav` in 10 ms windows, split into sub-bass (< 100 Hz) and highs (> 4 kHz):
- **8.24 (bar 3's downbeat): nothing happens.** There is no onset in any band, and the sub-bass is still off (about −40 dB).
- **8.78 (bar 3, beat 2): the track's own sound pause.** The highs fall about 13 dB and the whole mix about 5 dB, for half a beat.
- **8.96:** a small pickup.
- **9.04–9.05: the hit.** A cymbal/hi-hat onset, with the sub-bass full by 9.10. On the grid this is the off-beat eighth after beat 2 (bar 3.375 = 9.09), and the crash leads it by about 40 ms.
- From there the sub-bass plays on every off-beat eighth: folded over bars 4–14, it is loudest at x.5 of each beat. Per-bar loudness therefore puts "the drop" in bar 3, but the ear hears it at 9.05.

**So the title slams at 9.05, on the hit.**
- A slam at 8.24 would come 0.8 s ahead of the drop, still inside the intro, and the sound pause would then fall while the title is already up.
- 9.05 is the moment the owner hears as "0:08–0:09".
- **If the producer wants the slam on the 8.24 downbeat anyway, no line moves.** The card simply holds 3.40 s instead of 2.59 s.
- **Side effect on v2.2:** v2.2's "T1 HARD CUT on drop 1 (8.24)" and storyboard r1's "b3: stamp slams" were also 0.8 s ahead of the audible drop. In v2.3 the title takes that slot.
- **Flag for the editor (not changed here, because it is after S1):** the hardest drop's sub-bass also comes back off the beat. It enters at 123.40, the off-beat eighth after beat 4 of bar 53, which is 0.31 s before Y4's HIT on bar 54 (123.71). It is worth a listen when the cut is assembled. If it feels late, the picture HIT can move to 123.40 without moving Y4.

### Anchor table (line → bar → time)
"Needs" is pace.py's 0.5 + 字/7 + 0.6. "vs v2.1" is the on-screen change from `lines.json`. **Bold bars** are the music map's anchors. Rows from B1 (#10) down are unchanged from v2.2.

| # | ID | Line | Bar | Start | End | On | Needs | vs v2.1 | Music on the bar → what lands on it |
|---|---|---|---|---|---|---|---|---|---|
| 1 | H1 | 九百年，人人都想【留住】你。 | frame 0 | 0.00 | 3.71 | 3.71 | 2.5 | +0.71 | Intro, no bass. Typed from frame 0, over the painting itself, with the stamp 「— 《清明上河图》」 on screen from frame 0. 留住 turns red on the first downbeat (bar 0, 1.45). Line 1, which stays. |
| 2 | H2 | 所以，你一直在被【带走】。 | 1 | 3.71 | 7.11 | 3.40 | 2.4 | +0.65 | Pull back through the silk on bar 1, which shows that 你 is the scroll they hold. The silhouettes roll you up on bar 2 and walk off rightward. |
| — | (no subtitle) | | 2.5 | 7.11 | 9.05 | 1.94 | — | — | **Wind-up into drop 1** (pauses.md §1–§3). H1 and H2 clear, your glow is carried off right, and the lanterns die two per beat from bar 2.75. **8.78 (bar 3, beat 2) is the track's own sound pause:** the darkest frame, still drifting and never frozen (owner row 91). |
| — | **Title card** | 假如你是清明上河图 | **drop 1's hit (3.375)** | **9.05** | 11.64 | 2.59 | (2.39) | — | **The title slams on the hit** (crash at 9.04–9.05, sub-bass full by 9.10): scale-down + damped jolt, no flash (owner row 84), built from the film's own silk (storyboard scene 07). A glint runs along it on bar 4 (10.51). It stays fully legible until the hard cut on 4.5. There is no exit move, because T1 is a hard cut. |
| 3 | T1 | 你被人偷偷【换成了假的】， | 4.5 | 11.64 | 15.03 | 3.40 | 2.5 | +0.40 | **HARD CUT out of the title**, with your glow locked on the lock point. The line appears whole and the stamp slams on the cut. It gets 1.5 bars, because one bar would be 0.015 s under pace for 10 字. The copy slides into your place on bar 5. |
| 4 | T2 | 被一个【太监】带出皇宫， | 6 | 15.03 | 17.30 | 2.26 | 2.4 | −0.24 | HARD CUT on the downbeat. Cut-on. |
| 5 | T3 | 被【末代皇帝】偷运出宫， | 7 | 17.30 | 19.56 | 2.26 | 2.4 | −0.24 | HARD CUT on the downbeat. Cut-on. |
| 6 | T4 | 还躺在一堆【破画】里。 | **8** | 19.56 | 21.83 | 2.26 | 2.2 | −0.24 | HARD CUT on **the bar-8 phrase change (lighter top end)**, so the dim storeroom gets the lighter music. Cut-on. Picture pause: only the push and the dust. |
| 7 | N1 | 排队【四五个小时】，只看你【一两分钟】。 | 9 | 21.83 | 25.22 | 3.40 | 3.1 | −0.10 | The light + shape match lands on bar 9: the buried glow becomes the case light at the top of the 午门 ramp. The queue steps forward on beats, and the shot goes **into the hall on bar 10**. |
| 8 | N2 | 你，为什么这么【难见】？ | 10.5 | 25.22 | 27.49 | 2.26 | 2.2 | −1.24 | Same shot (centred ？ line). Your glow goes out on 10.75, and the card 「撤展回库」「下次展出：未公布」 is there on bar 11. From 11 to 11.5 nothing new appears: a picture pause before S1. |
| 9 | S1 | 你这一生：【四次出宫】，【五次进宫】。 | **11.5** (v2.2: 11.25) | 27.49 | 30.88 | 3.40 | 2.8 | −0.85 | **One beat later than v2.2.** Cut to the empty crest at dusk on 11.5: light returns after N2's dark case. S1 types on the cut. The lanterns light right→left from 11.5 to 12, the 出 row draws on 12 and the 进 row on 12.5. It ends on bar 13, as before. |
| 10 | B1 | 北宋末年，你在【汴京】被画了出来。 | 13 | 30.88 | 34.28 | 3.40 | 3.0 | −0.10 | Push into the silk on bar 13. Labels on 13.5 and 14. |
| 11 | BO | 你进了北宋【皇宫】，靖康后流入【金国】。 | 14.5 | 34.28 | 37.68 | 3.40 | 3.1 | −0.10 | 进 lights on bar 15 as the lift starts. Fire-glow sky on 15.5, and 出 on 15.75. |
| 12 | Z1 | 你身上，没有画家的【名字】。 | **16** | 37.68 | 41.07 | 3.40 | 2.5 | +0.40 | **The full section starts**, and the 张著 run begins on it. |
| 13 | Z2 | 1186年，金人【张著】在你身后写下： | 17.5 | 41.07 | 44.47 | 3.40 | 2.8 | −0.10 | Line 1, which stays through Z3 (6.8 s on screen). |
| 14 | Z3 | 画你的人，叫【张择端】。 | 19 | 44.47 | 47.87 | 3.40 | 2.2 | −0.10 | 「翰林张择端」 lights up on 19.5. |
| 15 | Z4 | 他在最后写道：【藏者宜宝之】。 | 20.5 | 47.87 | 51.26 | 3.40 | 2.7 | −0.60 | The five characters glow one per beat from bar 21. Line 1, which stays through Z5 (6.8 s). |
| 16 | Z5 | 谁收藏你，都要好好【珍惜】。 | 22 | 51.26 | 54.66 | 3.40 | 2.5 | −0.60 | Pull back, and you roll up on bar 23. |
| 17 | I2 | 元朝建立后，你又进了【皇宫】。 | 23.5 | 54.66 | 58.05 | 3.40 | 2.7 | +0.15 | 进 lights on bar 24.5. |
| 18 | W1 | 宫里的裱画匠，拿【假画】换走了你。 | 25 | 58.05 | 61.45 | 3.40 | 3.0 | −0.10 | Pays off T1 on the same shot. |
| 19 | W2 | 真的你，被偷偷卖给了一个【权贵】。 | 26.5 | 61.45 | 64.85 | 3.40 | 3.0 | −0.10 | 出 lights on bar 27.5. |
| 20 | W3 | 后来买下你的文人，【记下】了调包。 | 28 | 64.85 | 68.24 | 3.40 | 3.0 | −0.10 | The inaudible splice sits on this bar line. |
| 21 | M1 | 明朝，主人陆完被抄家前【藏】起了你。 | 29.5 | 68.24 | 71.64 | 3.40 | 3.1 | −0.10 | The friend's door closes on bar 30.5. |
| 22 | M2 | 几经辗转，你落到权臣【严嵩】手里， | 31 | 71.64 | 75.03 | 3.40 | 3.0 | **+0.15 (4a)** | Three dissolves on 31.5, 32 and 32.25. |
| 23 | M3 | 严家倒台，你被抄进了【皇宫】。 | 32.5 | 75.03 | 78.43 | 3.40 | 2.7 | +0.15 | Seal strips on bar 33 and 进 on 33.5. The sky darkens into F1 on the held shot. |
| 24 | F1 | 1578年，太监冯保把你【偷】出了宫。 | **34** | 78.43 | 81.83 | 3.40 | 2.8 | +0.15 | **The breakdown starts and the bass drops out**, so the eunuch slips off in the bare bar. 出 lights on bar 35 as the bass returns. |
| 25 | F2 | 画你的人没留名，偷你的倒【题了字】。 | 35.5 | 81.83 | 86.36 | 4.53 | 3.1 | +1.03 | Insert. 冯保's colophon lights one column per beat through bar 36 (no bass), so the joke gets a bar to land. |
| 26 | Q1 | 清朝，主人家被抄，你【又进了宫】。 | 37.5 | 86.36 | 89.75 | 3.40 | 2.8 | +0.15 | 进 lights on bar 38. |
| 27 | Q2 | 嘉庆盖了五方大印：你归【皇家】了。 | 39 | 89.75 | 94.28 | 4.53 | 3.0 | **+1.28 (4a)** | Five seals slam on five beats (39 → 40, bass on). The roofs close in the no-bass bar 40. |
| 28 | P1 | 1923年，溥仪把你【偷运】出了宫。 | 41 (asked: **42**) | 94.28 | 97.68 | 3.40 | 2.7 | +0.15 | The bass is back. **The build (bar 42, brighter) lands on P1's 出 tick** as the crate rolls off right. |
| 29 | P2 | 一个月内，四卷【清明上河图】出了宫。 | 42.5 | 97.68 | 102.20 | 4.53 | 3.1 | +0.53 | Four rolls cross on 42.5, 42.75, 43 and 43.25. Then **43.5 → 44.5 is the bar where nothing new appears** (the v2 design). |
| 30 | P3 | 清单上，其中两卷都写着【张择端】。 | 44.5 | 102.20 | 105.60 | 3.40 | 3.0 | −0.35 | The two ledger entries light on 45 and 45.25. |
| 31 | V1 | 你在【伪满皇宫】，一放就是十几年。 | 46 | 105.60 | 109.00 | 3.40 | 3.0 | −0.10 | Seasons in time-lapse, one per beat. |
| 32 | V2 | 1945年，伪满覆灭，溥仪出逃。 | 47.5 | 109.00 | 112.39 | 3.40 | 2.5 | +0.40 | Headlights sweep away on bar 48. Line 1, which stays through V3. |
| 33 | V3 | 混乱中，你【下落不明】。 | **49** | 112.39 | 114.66 | 2.26 | 2.2 | −0.49 | **The stop.** The line appears whole on the downbeat, as T1–T4 do. The stop itself is the pause: the camera keeps searching the dark, nothing new appears, and the counter keeps rolling. This replaces v2.1's 1-s gap. |
| 34 | Y1 | 几年后，沈阳一间【临时库房】里， | **50** | 114.66 | 117.49 | 2.83 | 2.8 | −0.67 | **Re-entry, no bass.** The desk lamp clicks on the downbeat. Line 1, which stays through Y2 (6.2 s on screen). |
| 35 | Y2 | 专家杨仁恺，翻出【好几卷】“你”。 | 51.25 | 117.49 | 120.88 | 3.40 | 2.7 | −0.10 | Same storeroom shot, so it starts on a beat. |
| 36 | Y3 | 标着真迹的两卷，都是【仿的】。 | 52.75 (map: **53**) | 120.88 | 123.71 | 2.83 | 2.7 | −0.42 | One beat before **the pickup (bar 53)**. The 真迹 slips turn grey on bar 53 as the bass returns. Line 1, which stays through Y4 (7.4 s). |
| 37 | Y4 | 混在残次品里的那一卷，【才是你】。 | **54** | 123.71 | 128.24 | 4.53 | 3.0 | +0.28 | **The hardest drop. HIT:** the battered roll opens and glows. Two bars of text (hold). |
| — | (no subtitle) | | 56 | 128.24 | 130.51 | 2.26 | — | — | **The film's biggest frame on its loudest bar** (owner row 88). Y3 and Y4 clear, and the 虹桥 crowd fills the frame in full colour and comes alive: the boat lowers its mast and the bridge crowd moves. It is frame 0 again, now real. |
| 38 | R1 | 1950年代，你回到了【故宫】。 | 57 | 130.51 | 133.90 | 3.40 | 2.4 | +0.40 | The fifth 进 lights on 57.5, and all nine marks flash red on bar 58. |
| 39 | D1 | 明朝人把草棚当驴耳，【补画】了头驴。 | 58.5 | 133.90 | 138.43 | 4.53 | 3.1 | **+1.03 (4a)** | The posts on 58.5, the dashed ear outline on 59, and the donkey painted on its grey patch on 59.5. |
| 40 | D2 | 1973年重裱，【假驴】才被揭掉。 | 60.5 | 138.43 | 141.83 | 3.40 | 2.5 | +0.40 | The patch peels on bar 61. |
| — | (no subtitle) | | 62 | 141.83 | 142.39 | 0.57 | — | — | Phrase start. The camera starts its run along your tail one beat before the line. |
| 41 | E1 | 藏者宜宝之——人人都很【珍惜】你： | 62.25 | 142.39 | 146.36 | 3.96 | 2.8 | −0.29 | 藏者宜宝之 glows on bar 63. Line 1, which stays through E3 (8.5 s). |
| 42 | E3 | 【偷你】、【换你】、【藏你】、【抄你】。 | 64 | 146.36 | 150.88 | 4.53 | 2.2 | **+1.03 hold** | **Loud bar 64:** 偷 on 64, 换 on 64.25, 藏 on 64.5, 抄 on 64.75. The 抄 wall (「约一百卷 · 只有一卷是你」) holds through bar 65. |
| 43 | E4 | 可四个朝代的皇宫，都没【留住】你。 | 66 | 150.88 | 154.28 | 3.40 | 3.0 | −0.10 | 宋 on 66, 元 on 66.25, 明 on 66.5 and 清 on 66.75, each with its 出 flash. |
| 44 | E5 | 直到你不再属于【任何一个人】， | 67.5 | 154.28 | 157.68 | 3.40 | 2.8 | −0.10 | The hats fall away on bar 68. Line 1, which stays through E6. |
| 45 | E6 | 你才终于，不再被谁【带走】。 | 69 | 157.68 | 162.20 | 4.53 | 2.5 | **+0.53 hold** | Inside: you lie in the case and light the faces of the crowd. |
| — | (no subtitle) | | 71 | 162.20 | 165.04 | 2.83 | — | — | **The moral's picture.** E5 and E6 clear. A slow pull-back: the crowd keeps filing past your glow, and nobody carries you anywhere. The case starts to dim on bar 72. |
| 46 | E7 | 安全的代价：展完要静养【三年以上】。 | 72.25 | 165.04 | 169.00 | 3.96 | 3.1 | +0.46 | You are rolled up and boxed, and the lid closes on bar 73. Three light sweeps (three years) on 73, 73.25 and 73.5. Line 1, which stays through E8. |
| 47 | E8 | 所以，你才这么【难见】。 | **74** | 169.00 | 172.39 | 3.40 | 2.2 | −0.10 | **Outro, no bass.** Callback to N2: the empty case and the card 「下次展出：未公布」. |
| — | (no subtitle) | | 75.5 | 172.39 | 174.66 | 2.26 | — | — | The card alone for a half-bar. **The Juno end card arrives on bar 76** (J monogram and gold title). |
| 48 | Q | 要是排【五小时】看两分钟，你去吗？ | 76.5 | 174.66 | 184.30 | 9.64 | 3.0 | **+4.14 hold** | Types on 76.5. The follow pill comes in on bar 78 and the sources line on 78.5. Holds to the song's own end. Nothing gets brighter after this (owner row 95): a slow drift while the dusk sky dims. |

### The title card: drop 1 (9.05)
- **Where.** On drop 1's hit, 9.05 (see "Drop 1, measured"), straight after the paradox and its wind-up. The owner chose drop 1 over the format's order (owner-notes row 133).
- **How long.** From the slam to the hard cut on bar 4.5 it gets 2.59 s, against its reading time of 2.39 s (9 字). It can't hand over earlier on the grid: the half-bar before 4.5 is bar 4 (10.51), only 1.46 s after the hit.
- **What it does now.** It answers "who is 你?" at 9 s instead of 24 s (see below). The fates then read as the painting's life from the first cut: 假如你是清明上河图 → 你被人偷偷换成了假的…
- **The v2.2 flag is gone.** v2.2 put the title on a flat bar (bar 10, about −16 dB) with no musical hit. Now it sits on the first drop, with a real sound pause before it.
- **The cost.**
  - The first concrete fate with a year stamp (T1, 元 · 1351年前) now arrives at 11.64, where v2.1 had it at 5.75. The director's rubric note counted "a concrete fate with a year stamp by 8.75 s".
  - The paradox (H1 with 九百年) is still on frame 0, and the title is the hook's second beat.
  - N2's question now leads straight into S1 rather than into the title. The 11 → 11.5 picture pause gives it a breath.

### Who is 你 in the first 9 s (no new cue needed)
- **The risk.** Both cold reads flagged that H1–H2 alone read like an emo or breakup caption. They also noted that before v2.3, the words 清明上河图 first appeared big at 24 s.
- **v2.3 closes that window at 9.05 s.** Before that, three cues are already on screen, and none of them is a line:
  1. Frame 0 is the painting itself: the glowing 虹桥 section, full frame, already moving.
  2. The frame-0 stamp 「— 《清明上河图》」 names it from frame 0 (it is on the don't-change list).
  3. H2's pull-back on bar 1 (3.71) shows that 你 is the scroll two figures hold open, roll up and carry off.
- **So H1–H2 need no added cue, and no line changes.**
- **The risk that remains** is H1 alone (0–3.7 s), and only the picture can carry it:
  - Frame 0 must read as a painting on silk, not as scenery.
  - The stamp must be on screen and legible from frame 0, not typed in late.
  - Both are for the art director and the build. I'm not proposing a stamp change.

### Anchors that moved
| Asked for | Where it is | Why |
|---|---|---|
| Title slams on bar 3 (8.24) | **9.05: drop 1's hit (bar 3.375)** | Nothing in the track happens on 8.24. The drop is heard at 9.04–9.05, after a half-beat sound pause from 8.78. The lines are identical either way. On 8.24 the card would hold 3.40 s. |
| Teaser + N1 + N2 from about bar 4.25 | **Bar 4.5 → 11.5** | 4.5 is the first half-bar after the title's reading time (9.05 + 2.39 = 11.44). The hard cuts stay on bars and half-bars. |
| S1 near 26.92 (bar 11.25) | **Bar 11.5 (27.49)**, one beat later | See "v2.3 changes". It ends on bar 13 as before, so nothing after it moves. |
| N2 on bar 8 (music map) | Bar 10.5 | Bar 8's phrase change now carries the T4 cut instead (the storeroom on the lighter music). N2 shows 2.26 s, as in v2.2. |
| 1923 (P1) on bar 42 (96.55) | **Bar 41 (94.28)**, unchanged from v2.2 | P1–V2 need 32 beats before the stop: P1 6, P2 8 with its rest bar, P3, V1 and V2 6 each, all at their floors. Starting on bar 42 leaves only 28. On bar 41 the bass is back, and **the build on bar 42 lands on P1's 出 tick** as the crate leaves. F1–Q2 then fill bars 34 → 41 exactly (6 + 8 + 6 + 8 beats). |
| Y3 on the pickup (bar 53) | **52.75** (one beat early), unchanged from v2.2 | One bar is TOO FAST for 11 字 (2.26 against 2.42). The 真迹 slips turn grey on bar 53, so the pickup still lands on the twist. |
| V3 on the stop (bar 49) | Bar 49 ✓, but only one bar, unchanged from v2.2 | Y1 is fixed on bar 50, so V3 gets exactly 2.26 s (it needs 2.24). It should **appear whole on the downbeat** rather than be typed. The v2.1 1-s gap is gone, and the stop itself is the pause. |
| H1–H2 over the intro (bars 0–2) | ✓ | H1 runs from 0 to bar 1 and H2 from bar 1 to 2.5. Then comes the wind-up into the drop, now 1.94 s (7.11 → 9.05). The old "H1–H2 within budget + 0.5 s" rule can't hold, because the intro is 9 s long. The picture beats above fill it. |

### Where the extra 14.6 s went
Up to the hardest drop the film runs as v2.1 did: the drop is at 123.71, and v2.1 had Y4 at 124.0. After the drop it runs 60.6 s instead of 46.0 s.

| Where | Gained | How |
|---|---|---|
| 才是你 (Y4 + the 虹桥 bar) | +2.0 s | Two bars of text, then one picture-only bar on the loudest bar of the song |
| E3 | +1.0 s | The 抄 wall holds a full bar |
| The moral (E4–E6 + its picture) | +3.2 s | E6 gets 2 bars, then a picture-only 1.25 bars |
| End card (E8 → Q) | +5.9 s | The card arrives on bar 76, and Q holds to 184.3 |
| D1 (4a), R1, D2, E1, E7 | +2.6 s | D1 +1.03 (4a). The others gain 0.3–0.5 s so that each scene cut lands on a half-bar |

### Below the floor (Needs + 0.4 s). All of them pass pace.py.
| Line | On | Floor | Why |
|---|---|---|---|
| N1, BO, M1 (14 字) | 3.40 | 3.50 | They get 6 beats. A 7th would push the next scene cut off the half-bar. Z1 → F1 is 18 bars for 12 lines, each at its 6-beat minimum. S1–BO fill bars 11.5–16, and the teaser, N1 and N2 fill 4.5–11.5 exactly. |
| N2 | 2.26 | 2.64 | Same as v2.2: the teaser, N1 and N2 are all at their minimums (see "v2.3 changes"). The 11 → 11.5 picture pause gives the question its breath. |
| V3 | 2.26 | (typed: 2.64) | It is shown whole, so the typed floor doesn't apply. It has 0.02 s over Needs. |
| Y1 | 2.83 | 3.21 | Bars 50 → 54 hold three lines. Y1 is line 1 and stays through Y2, so it is on screen for 6.2 s. |
| Y3 | 2.83 | 3.07 | Same reason. It is line 1 and stays through Y4 (7.4 s). |

- **S1 is not below its floor:** it gets 3.40 against a floor of 3.21.
- **Note 4a.** All three lines gain time:
  - **M2** gets 3.40 (floor 3.36; v2.1 3.25).
  - **Q2** gets 4.53 (v2.1 3.25). The five seal slams fall on five beats, and the roofs close in the no-bass bar 40.
  - **D1** gets 4.53 (floor 3.50; v2.1 3.50).
- **Lines that lost more than 0.1 s against v2.1:** N2 −1.24, S1 −0.85 (v2.2: −0.29), Y1 −0.67, Z4 −0.60, Z5 −0.60, V3 −0.49, Y3 −0.42, P3 −0.35, E1 −0.29, T2–T4 −0.24.
  - All of them are forced by the fixed anchors. S1 → F1 (bars 11.5 → 34) is 2.1 s shorter than in v2.1 (v2.2: 1.5 s), and V3 → Y4 (bars 49 → 54) is 2.7 s shorter.
  - Every one is still at or above its Needs.

### For the storyboard (art director): what v2.3 moves
Storyboard r1's scenes 01–08 and its line ↔ bar map assume the v2.2 order. Here is what changes. Everything from scene 09 (B1, bar 13) on stays.
- **Scene 01 (0 → 9.05).** It no longer ends on a hard cut at b3. It ends on the wind-up: the lanterns die from b2.75, and the dark crest at 8.78 is the darkest frame, still moving. The title then slams at 9.05.
- **Scene 07, the title (9.05 → b4.5).** It moves here. It slams on the hit, glints on b4 and stays legible to the cut. It leaves by the teaser's first **hard cut** on b4.5, with the glow locked, rather than by an ink-sink and band match.
- **Scenes 02–05, the teaser.** They shift to b4.5 / b6 / b7 / b8 → b9. The stamps slam on those cuts. The grey copy now lies on the lock point at b5, not b4.
- **Scene 06, 午门 (b9 → b11.5).** The light + shape match lands on b9, the shot goes into the hall on b10, your glow goes out on b10.75, the card is there on b11, and b11 → b11.5 is the pause.
- **Transition 06 → 08 (b11.5).** It replaces the old 06 → 07 and 07 → 08. N2's dark, empty case hands over to the empty crest at dusk, and the lanterns lighting are the "light returns" beat. The move is the art director's call.
- **Scene 08 (S1).** It starts on b11.5 (it was b11) and keeps its beats: 出 row on b12, 进 row on b12.5, ink-trace to B1 on b13.

### Checks run on `lines_bars.json` (v2.3)
- **`pace.py lines_bars.json --film-end 184.3`**
  - **TOO FAST:** none.
  - **Waiting:** 18.4 s = 10 % (target ≤ 12 %), the same as v2.2.
  - **The 8 WAIT lines are all deliberate holds, as in v2.2:**
    - F2 1.4: the joke and the colophon.
    - Q2 1.6: note 4a and the five seals.
    - P2 1.4: the designed rest bar.
    - D1 1.4: note 4a.
    - The producer's named holds: Y4 1.6, E3 2.3, E6 2.0 and Q 6.7.
  - **4 CHECKs, all named picture beats:**
    - **New: the wind-up + title card (7.1–11.6, 4.5 s).** This is 1.94 s of wind-up with the track's sound pause, then the title card for 2.59 s (the card is text, but not a subtitle).
    - The 虹桥 bar (128.2–130.5), the moral's picture (162.2–165.0) and the end card arriving (172.4–174.7).
    - The old title-card CHECK at 24.1–26.9 is gone.
  - **Time with no subtitle:** about 12.5 s across six beats: wind-up 1.94, title 2.59, 虹桥 2.26, phrase start 0.57, the moral's picture 2.83 and the end card arriving 2.26. Of that, 11.9 s is in the four CHECK gaps (v2.2: 10.2). If a picture beat isn't built as described, that time becomes dead air, so each one is spelled out in the anchor table.
- **`facts.py script.md --lines lines_bars.json`:** no problems. It's the same wording, so the numbers are the same.
- **Other checks:**
  - The text is identical to `lines.json` on all 48 rows.
  - Every line starts on a beat (H1 at 0.00).
  - No windows overlap, and the last line ends at 184.30.
  - The widest line is still 16.0.
  - Lines 1–2 and 10–48 are byte-identical to v2.2. Only lines 3–9 (T1–S1) changed.
- **Side note (from v2.2).** P3 is 13 字 in pace.py (Needs 3.0). The line table says 12, which is a miscount in v2.1. The wording is unchanged, and at 3.40 s P3 still meets its floor (3.36).

## Music and retiming (written before the track; superseded by "Retiming to bars" above)
- **Title (23.25).** Lands on the hardest drop. Move the whole opening with it. If the drop comes later, hold N2 longer, but don't add a line.
- **Teaser T1–T4.** Hard cuts on the beat, about 2.5–3 s each. The year stamp slams on each cut.
- **P2 → P3.** One bar where nothing new appears after the fourth roll crosses, so the "four?" lands (cold read).
- **V3 → Y1.** The 1-s gap (112.75–113.75) is the film's one deliberate picture pause plus a music dip (pauses.md). Y4 「才是你」 lands on the next strong downbeat.
- **E3.** Four consecutive beats, one flash and one red word per beat. 偷 / 换 / 藏 are short; the 抄 frame (the wall of copies) holds to the end of the line.
- **Tally ticks, seal slams (Q2) and stamp changes** land on beats.
- **Retiming rule.**
  - Map new → old piecewise per line, and never shorten a line below its "Needs" + 0.4 s (typed lines).
  - Keep H1–H2 within budget + 0.5 s.
  - The end card holds the question to the song's end, at most 3:00.
  - If the track runs longer, spend the extra time on holds at Y4, E3 and the end card, not on new lines.

## Lines
Stage: **crest** = the 虹桥 handover stage · **insert** = full-frame painting through the silk · **int.** = interior.

| # | ID | Start | End | Line (≤ 16 字) | 字 | Needs | Stack | Red | Stamp (top-right) | Era · age | Tally | Stage | Picture (look A) | Fact # |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | H1 | 0.00 | 3.00 | 九百年，人人都想【留住】你。 | 10 | 2.5 | line 1 (stays) | 留住 | — 《清明上河图》 | — | — | insert | Frame 0, already moving: full frame of your 虹桥 section, glowing warm like lantern silk. The arched bridge is crowded with tiny figures and a boat below lowers its mast, drifting right→left. The subtitle is on frame 0 with its first words already typed. | O8 |
| 2 | H2 | 3.00 | 5.75 | 所以，你一直在被【带走】。 | 9 | 2.4 | line 2 | 带走 | 〃 | — | — | crest | Pull back through the silk: you are a scroll held open on the real 虹桥 crest at dusk by two silhouettes in era-neutral robes, so the painted bridge rhymes with the stage bridge. They roll you up and walk off rightward; your glow goes with them and the crest falls dark behind. This is the wind-up into the title, which slams on drop 1 (v2.3). | O6 (framing) |
| 3 | T1 | 5.75 | 8.75 | 你被人偷偷【换成了假的】， | 10 | 2.5 (cut-on) |  | 换成了假的 | — 元 · 1351年前 | — | — | int. | HARD CUT out of the title card (v2.3), on the half-bar. Night, the mounting room (gate-2a hook still): the round window with the White Dagoba and one small lamp. The bowed craftsman lays a grey copy beside your glowing silk. You slide out of frame and only grey is left on the table. | C9 |
| 4 | T2 | 8.75 | 11.25 | 被一个【太监】带出皇宫， | 9 | 2.4 (cut-on) |  | 太监 | — 1578 · 紫禁城 | — | — | crest | HARD CUT. The crest at night, lanterns out, the 紫禁城 corner tower in silhouette on the far bank. A eunuch (Ming eunuch's hat, whole figure) walks off rightward with your glowing roll under his arm, lighting his sleeve. | C20 |
| 5 | T3 | 11.25 | 13.75 | 被【末代皇帝】偷运出宫， | 9 | 2.4 (cut-on) |  | 末代皇帝 | — 1923 · 紫禁城 | — | — | crest | HARD CUT. The same crest on a 1920s winter night, with snow on the railing. Two servants in long gowns push a crate on a hand-cart off rightward, and glow leaks between its slats. 溥仪 is not drawn. | C24 |
| 6 | T4 | 13.75 | 16.25 | 还躺在一堆【破画】里。 | 8 | 2.2 (cut-on) |  | 破画 | — 约1950 · 沈阳 | — | — | int. | HARD CUT. A dim storeroom: heaps of rolled scrolls as black shapes, with one faint glow buried in the pile. Hold (picture pause before the present-day cut). | C30 |
| 7 | N1 | 16.25 | 19.75 | 排队【四五个小时】，只看你【一两分钟】。 | 14 | 3.1 |  | 四五个小时、一两分钟 | — 2025 · 故宫午门 / 故宫百年 · 展了一个月 | — | — | int. | Night, today: the 午门 silhouette. A long queue of silhouettes snakes up the ramp in time-lapse toward one warm point at the top: you, in a glass case. Then inside, the crowd shuffles past the case in seconds, faces lit only by you. | P3 |
| 8 | N2 | 19.75 | 23.25 | 你，为什么这么【难见】？ | 8 | 2.2 · key: read twice |  | 难见 | — 2025年10月30日 / 撤展回库 | — | — | int. | CENTRED ？ line. Your glow goes out; the case is empty and dark. A card stands on the plinth (no phone, no hand): 「撤展回库」「下次展出：未公布」. | P3, P5 |
| 9 | S1 | 26.25 | 30.50 | 你这一生：【四次出宫】，【五次进宫】。 | 12 | 2.8 · key: read twice |  | 四次出宫、五次进宫 | —（无印章） | — | appears: 出○○○○ 进○○○○○ | crest | After N2's dark, empty case (v2.3: the title now comes before the teaser): the empty crest at dusk, the far-bank palace in silhouette. Bottom-left, beside where the counter will sit, the tally draws itself: four hollow 出 marks and five hollow 进 marks, labelled 「四出五进 —— 故宫博物院」. | O6 |
| 10 | B1 | 30.50 | 34.00 | 北宋末年，你在【汴京】被画了出来。 | 13 | 3.0 |  | 汴京 | — 北宋末年 · 汴京 / 画成，未署名 | 北宋 · 你 0 岁 |  | insert | Push into the silk: the city paints itself in as the camera tracks right→left. At the far end sits a painter (whole figure, from behind), lit by the silk. Labels 「5米多长」「几百个人」 pop on beats. | C1; O1, O2 (labels) |
| 11 | BO | 34.00 | 37.50 | 你进了北宋【皇宫】，靖康后流入【金国】。 | 14 | 3.1 |  | 皇宫、金国 | — 北宋 · 宫廷 / 首次入宫（故宫博物院）→ on the 出 beat: — 1127 · 汴京 / 靖康之变，流入金国 | 北宋 · 你 0 岁 → 金 · 你 约27岁 | 进 ● then 出 ● | crest | Song dusk, people on the bank, the Song palace gate on the far bank. Two court figures carry you leftward toward it, and 进 lights. On the next beat the sky turns to fire-glow and the palace darkens. Your glow drifts off rightward among refugee carts, and 出 lights. Nobody is seen grabbing you (how you left is unknown, C5). | C1, C5 |
| 12 | Z1 | 37.50 | 40.50 | 你身上，没有画家的【名字】。 | 10 | 2.5 |  | 名字 | 〃 | 〃 (rolls toward 86) |  | insert | Your last painted section, full frame. The camera searches the corners for a signature and finds bare silk. | C2 |
| 13 | Z2 | 40.50 | 44.00 | 1186年，金人【张著】在你身后写下： | 12 | 2.8 | line 1 (stays) | 张著 | — 1186 · 金国 / 张著题跋（今在卷尾） / 落款：清明后一日 | 金 · 你 约86岁 |  | int. | A Jin scholar (whole figure, seated, lit only by your glow) writes on the paper joined to your end. Columns of characters appear. | C6 |
| 14 | Z3 | 44.00 | 47.50 | 画你的人，叫【张择端】。 | 8 | 2.2 · key: read twice | line 2 | 张择端 | 〃 | 〃 |  | insert | In his columns, 「翰林张择端」 lights up, big. | C6, C2 |
| 15 | Z4 | 47.50 | 51.50 | 他在最后写道：【藏者宜宝之】。 | 11 | 2.7 · key: read twice | line 1 (stays) | 藏者宜宝之 | 〃 | 〃 |  | insert | The five characters 藏者宜宝之 at the end of his colophon glow one by one, big enough to read on a phone. | C6 (张著's own words, Pass 2) |
| 16 | Z5 | 51.50 | 55.50 | 谁收藏你，都要好好【珍惜】。 | 10 | 2.5 · key: read twice | line 2 | 珍惜 | 〃 | 〃 |  | int. | Pull back: the colophon is now part of your tail, and you roll up. | C6 |
| 17 | I2 | 55.50 | 58.75 | 元朝建立后，你又进了【皇宫】。 | 11 | 2.7 |  | 皇宫 | — 元初 · 元朝宫廷 / 再次入宫（故宫博物院） | 元 · 你 170多岁 | 进 ●● | crest | Yuan daylight, people on the bank, the 大都 skyline with the White Dagoba across the water. Officials in brimmed Yuan hats carry you leftward, and 进 lights. | C8 |
| 18 | W1 | 58.75 | 62.25 | 宫里的裱画匠，拿【假画】换走了你。 | 13 | 3.0 | line 1 (stays) | 假画 | — 元 · 1351年前 / 裱画匠调包（杨准记） / 杨准原话："以似本易去" | 元 · 你 200多岁 |  | int. | Pays off T1: the same mounting-room shot, longer. The craftsman lays the grey copy where you lay and rolls you up. | C9 |
| 19 | W2 | 62.25 | 65.75 | 真的你，被偷偷卖给了一个【权贵】。 | 13 | 3.0 | line 2 | 权贵 | 〃 | 〃 | 出 ●● | crest | The secret sale (R7): the crest at night, lanterns out, the two figures close (the gate-2a key frame, relit for night). The craftsman hands your glowing roll to a 权贵 in a Yuan brim, both men's hands on the rollers. They turn rightward, away from the palace, and 出 lights. | C9 |
| 20 | W3 | 65.75 | 69.25 | 后来买下你的文人，【记下】了调包。 | 13 | 3.0 |  | 记下 | — 1351 · 江西泰和 / 文人杨准买下，次年题跋 | 元 · 你 约251岁 |  | int. | A southern study: a scholar (whole figure) writes on your tail by your glow. Inside his columns a tiny silhouette replay of the swap plays (craftsman, copy, hand-over): you carry your own diary. The counter rolls to 约251 without stopping on 250. | C10, C11, C9 |
| 21 | M1 | 69.25 | 72.75 | 明朝，主人陆完被抄家前【藏】起了你。 | 14 | 3.1 |  | 藏 | — 明 · 正德年间 · 苏州 / 陆完藏画友人家（余辉考） | 明 · 你 400多岁 |  | int. | Your Ming owner's house at night: torchlight gathers at the front gate (silhouettes only, no violence). At the back gate your owner (whole figure, Ming robe) hands your glowing roll to a friend. The friend's door closes, and the glow vanishes behind it. The friend's house now lives in the picture and the stamp, not the line. His mother is not mentioned. | C15 |
| 22 | M2 | 72.75 | 76.00 | 几经辗转，你落到权臣【严嵩】手里， | 13 | 3.0 | line 1 (stays) | 严嵩 | — 明 · 中期 / 辗转归严嵩（故宫博物院） | 〃 |  | int. | Three quick dissolves: your glow passes through doorways and between Ming silhouettes (no faces, no names). It comes to rest in a grand hall, in a lacquer box among treasures. | C16 |
| 23 | M3 | 76.00 | 79.25 | 严家倒台，你被抄进了【皇宫】。 | 11 | 2.7 | line 2 | 皇宫 | — 明 · 隆庆年间 / 严家被抄，你入宫（故宫博物院） | 明 · 你 约470岁 | 进 ●●● | crest | Paper seal strips slap across the hall's doors. Dusk on the crest: a confiscation cart with Ming officials crosses leftward toward the 紫禁城, and 进 lights. **Hold this shot into F1** (note 5): the sky darkens to night and the counter rolls 约470 → 约478. | C16, C19 |
| 24 | F1 | 79.25 | 82.50 | 1578年，太监冯保把你【偷】出了宫。 | 12 | 2.8 | line 1 (stays) | 偷 | — 1578 · 紫禁城 / 冯保偷盗而出（故宫博物院） / 冯保跋："心思爽然" | 明 · 你 约478岁 | 出 ●●● | crest | Pays off T2 on the same shot: night, lanterns out. The eunuch walks off rightward with you under his arm, and 出 lights. | C20 |
| 25 | F2 | 82.50 | 86.00 | 画你的人没留名，偷你的倒【题了字】。 | 14 | 3.1 | line 2 | 题了字 | 〃 | 〃 |  | insert | Callback to Z1, as an insert, not a scene. Left: your bare corner, where no painter signed. Right: 冯保's colophon columns on your tail, lighting up one column at a time. He is not shown writing, because the order of colophon and removal is unknown (C20). | C2, C20, C7 |
| 26 | Q1 | 86.00 | 89.25 | 清朝，主人家被抄，你【又进了宫】。 | 12 | 2.8 |  | 又进了宫 | — 1799 · 紫禁城 / 毕沅家被抄，你入宫 | 清 · 你 约699岁 | 进 ●●●● | crest | Qing dusk, people on the bank: a confiscation cart with Qing officials (Qing caps) crosses leftward toward the 紫禁城, and 进 lights. | C21, C22 |
| 27 | Q2 | 89.25 | 92.50 | 嘉庆盖了五方大印：你归【皇家】了。 | 13 | 3.0 |  | 皇家 | — 嘉庆 · 延春阁 / 五玺全（《石渠宝笈三编》） | 〃 |  | insert | The seal run: five red imperial seals slam onto your silk, one per beat, the only red on screen. On the fifth, palace roofs close over you in silhouette: you belong to the court. | C23 |
| 28 | P1 | 92.50 | 95.75 | 1923年，溥仪把你【偷运】出了宫。 | 11 | 2.7 |  | 偷运 | — 1923 · 紫禁城 / 以赏给弟弟溥杰为名（清宫档案） | 民国 · 你 约823岁 | 出 ●●●● | crest | Pays off T3 on the same winter shot: the crate on its hand-cart goes off rightward, and 出 lights. 溥仪 is not drawn (at most a distant back view, never comic). | C24, C24b |
| 29 | P2 | 95.75 | 99.75 | 一个月内，四卷【清明上河图】出了宫。 | 14 | 3.1 | line 1 (stays) | 清明上河图 | 〃 / 25天内 · 4卷（清宫档案） | 〃 |  | crest | Four rolls cross the crest rightward, one after another (one glowing, three grey). A ledger page beside them fills with one entry per roll. After the fourth, one bar where nothing new appears. | C25 |
| 30 | P3 | 99.75 | 103.50 | 清单上，其中两卷都写着【张择端】。 | 12 | 2.8 · key: read twice | line 2 | 张择端 | 〃 | 〃 |  | crest | In the ledger, two entries light up, each reading 「张择端清明上河图一卷」. Below, those two rolls lie side by side: one glows (you), one is grey. | C25, C24 |
| 31 | V1 | 103.50 | 107.00 | 你在【伪满皇宫】，一放就是十几年。 | 13 | 3.0 |  | 伪满皇宫 | — 伪满时期 · 长春 / 存于伪满皇宫图书楼 | 民国 · 你 830多岁 |  | int. | A small two-storey library building in a courtyard, in silhouette. Inside, crates sit on shelves, and a faint glow shows through the slats of one. The sky time-lapses through seasons for years. No likeness of 溥仪, no flags, no map. | C26 |
| 32 | V2 | 107.00 | 110.00 | 1945年，伪满覆灭，溥仪出逃。 | 10 | 2.5 | line 1 (stays) |  | — 1945年8月 / 伪满覆灭，下落不明 | 民国 · 你 约845岁 |  | int. | Night: the courtyard empties, and car headlights sweep across the building and away (C27). No crates pried open, no plane, no route (note 10). | C27, C28 |
| 33 | V3 | 110.00 | 112.75 | 混乱中，你【下落不明】。 | 8 | 2.2 | line 2 | 下落不明 | 〃 | 〃 |  | int. | Your glow is lost: the camera searches the dark and can't find you while the counter keeps rolling. Then the 1-s picture pause with a music dip (named beat). | C28 |
| 34 | Y1 | 113.75 | 117.25 | 几年后，沈阳一间【临时库房】里， | 12 | 2.8 | line 1 (stays) | 临时库房 | — 约1950 · 沈阳 / 东北博物馆 · 杨仁恺 | 新中国 · 你 约850岁 |  | int. | Pays off T4: the same storeroom. A small desk lamp clicks on, and a researcher (whole figure) starts working through the heap. | C29, C30 |
| 35 | Y2 | 117.25 | 120.75 | 专家杨仁恺，翻出【好几卷】“你”。 | 11 | 2.7 | line 2 | 好几卷 | 〃 | 〃 |  | int. | Several rolls on the table, each opened a hand's width to show a 虹桥. (Three, per C30, but overlapped so they aren't counted.) | C30 |
| 36 | Y3 | 120.75 | 124.00 | 标着真迹的两卷，都是【仿的】。 | 11 | 2.7 | line 1 (stays) | 仿的 | 〃 | 〃 |  | int. | Two neat rolls with paper slips reading 「真迹」 turn grey. | K5, C31 |
| 37 | Y4 | 124.00 | 128.25 | 混在残次品里的那一卷，【才是你】。 | 13 | 3.0 · key: read twice | line 2 | 才是你 | 〃 | 〃 |  | insert | HIT on a downbeat. The battered roll with torn edges opens and glows, and the camera pushes into the 虹桥 crowd in full colour. Hold 0.5 s. | C30 |
| 38 | R1 | 128.75 | 131.75 | 1950年代，你回到了【故宫】。 | 9 | 2.4 |  | 故宫 | — 1950年代 · 北京 / 回到故宫博物院 | 新中国 · 你 850多岁 | 进 ●●●●● (complete) | crest | Daylight on the crest, visitors on the bank, and the far-bank 午门 now carries a museum plaque. Staff in 1950s clothes carry you leftward. The fifth 进 lights and all nine marks flash red: 「四出五进」. | C32, O6 |
| 39 | D1 | 131.75 | 135.25 | 明朝人把草棚当驴耳，【补画】了头驴。 | 14 | 3.1 | line 1 (stays) | 补画 | — 明代 / 裱画师误补（故宫装裱记录） | 明 (flashback; counter hidden, because the 补画 has no date) |  | insert | Push back through your silk into the painted street: the two thin posts of a broken straw shed stand up from a torn spot. A dashed donkey-ear outline draws itself over the two posts. Then a donkey is painted in below them, on a patch a shade greyer than your silk (a fake on the real thing). No figure is drawn. | C33 |
| 40 | D2 | 135.25 | 138.25 | 1973年重裱，【假驴】才被揭掉。 | 10 | 2.5 | line 2 | 假驴 | — 1973 · 故宫 / 重新装裱（故宫装裱记录） | 新中国 · 你 约873岁 |  | int. → insert | The 1973 restoration table under daylight lamps, with restorers (whole figures) bent over you. Insert: the grey patch with the donkey peels away, and the two posts stand alone over blank silk. | C33 |
| 41 | E1 | 138.25 | 142.50 | 藏者宜宝之——人人都很【珍惜】你： | 12 | 2.8 · key: read twice | line 1 (stays) | 珍惜 | — 1186 · 张著题跋 / 你身上：96方印 · 14段题跋 | 你 900多岁 |  | insert | Callback: the camera travels along your whole tail, past colophons and red seals, to the glowing 藏者宜宝之. | C6; O4, O5 (stamp) |
| 42 | E3 | 142.50 | 146.00 | 【偷你】、【换你】、【藏你】、【抄你】。 | 8 | 2.2 (cut-on) · key: read twice | line 2 | 偷你、换你、藏你、抄你 | 〃 → on the 抄 beat: — 今天 / 约百卷仿本（余辉估） | 〃 |  | mixed | Four flashes, one per beat, each word turning red as it lands. **偷**: the eunuch walking off the night crest. **换**: the grey copy sliding in (mounting room). **藏**: the friend's door closing. **抄**: pull back to a wall of grey 清明上河图 copies with only one glowing, labelled 「约一百卷 · 只有一卷是你」. The 抄 frame holds to the end of the line (about 1.5 s). | C20, C24, C9, C15, K1, K4 |
| 43 | E4 | 146.00 | 149.50 | 可四个朝代的皇宫，都没【留住】你。 | 13 | 3.0 |  | 留住 | — 宋 · 元 · 明 · 清 / 四次出宫（故宫博物院） | 〃 | four 出 marks flash | crest | The crest cycles sky, hats and far-bank palace 宋 → 元 → 明 → 清. Each time your glow is carried off rightward, away from the palace, and an 出 mark flashes. | O6 |
| 44 | E5 | 149.50 | 153.00 | 直到你不再属于【任何一个人】， | 12 | 2.8 | line 1 (stays) | 任何一个人 | — 1950年代至今 · 故宫博物院 / 结束流离（故宫博物院） | 〃 |  | crest | Day on the crest: the hats fall away. Ordinary visitors in today's clothes cross leftward toward the 午门 with its museum plaque (the queue from N1). | C32 |
| 45 | E6 | 153.00 | 157.00 | 你才终于，不再被谁【带走】。 | 10 | 2.5 · key: read twice | line 2 | 带走 | 〃 | 〃 |  | int. | Inside: you lie in the case and light the faces of the crowd filing past. Nobody carries you anywhere. | C32 |
| 46 | E7 | 157.00 | 160.50 | 安全的代价：展完要静养【三年以上】。 | 14 | 3.1 | line 1 (stays) | 三年以上 | — 故宫规定 / 展后静养三年以上（北京晚报） | 〃 |  | int. | The case dims. You are rolled up and laid in a storage box, and the lid closes. Three seasons' cycles of light sweep across the box: three years. | O9 |
| 47 | E8 | 160.50 | 164.00 | 所以，你才这么【难见】。 | 8 | 2.2 · key: read twice | line 2 | 难见 | 〃 | 〃 |  | int. | Callback to N2: the empty case and the card 「下次展出：未公布」. | O9, P5 |
| 48 | Q | 164.50 | 170.00 | 要是排【五小时】看两分钟，你去吗？ | 13 | 3.0 · key: read twice |  | 五小时 | — | — | — | end card | CENTRED ？ line on the Juno end card: J monogram, gold title 假如你是清明上河图, this question, the follow pill 「关注 Juno · 一起看懂世界」 and the sources line. | P3 |

**Age values:**
- All are computed from the c. 1100 anchor (O8 估算).
- **Dated beats:** 1127 → 约27 · 1186 → 约86 · 1351 → 约251 · 1578 → 约478 · 1799 → 约699 · 1923 → 约823 · 1945 → 约845 · 约1950 → 约850 · 1973 → 约873.
- **Era-only beats:**
  - 元初 → 170多.
  - The swap, "1351年以前", after the Yuan palace entry, in the Palace Museum's 元代后期 → **200多**. This replaces 240多, which assumed 至正 (C9 revised).
  - 正德 → 400多; 隆庆 (1567–72) → 约470; 伪满时期 → 830多; 1950年代 → 850多; today → 900多.

## End card
- **Question for comments:** 要是排五小时看两分钟，你去吗？
  - Viewers can answer in one word (去 / 不去), and many have queued themselves (cold read's comment: 「去。三年才展一次，五小时算什么。」).
  - 五小时 and 两分钟 are the top of the reported ranges (P3), phrased as a would-you with one 你.
  - Spare: 「下一次见你，你觉得要等几年？」 (P5: next showing not announced).
- **@ prompt:** 「@ 那个愿意陪你排五小时的人」
- **Sources line:** 资料：故宫博物院 · 余辉（故宫博物院院刊 2012；光明日报 2017）· 朱鸿文（光明日报 2026）· 王文锋（长春日报 2020）· 许忠陵《清明上河图装裱记》· 北京晚报 2015
- **Rules:** the Juno end card (J monogram, gold title, the question, follow pill 「关注 Juno · 一起看懂世界」). Never "Juno 出品".

## Facts used (every on-screen number or named fact → facts.md row → source)
| Row | Status | Used in | What is on screen | 来源 (source, short) |
|---|---|---|---|---|
| O8 | 估算 | H1, counter | 九百年 / 900多岁; ages from anchor c. 1100 | C1 sources; 祝勇, 新京报 2025 |
| O6 | ✓ | H2, S1, tally, BO, R1, E4 | 四次出宫，五次进宫 (四出五进宫门) | 故宫博物院《我们的清明上河图》2022 |
| C9 | ✓ (杨准's account, adopted by the Palace Museum; date only "1351年以前") | T1, W1, W2, E3 | 宫里的裱画匠拿假画换走真本，卖给权贵; stamp 元 · 1351年前（杨准记）; quote 以似本易去 | 余辉, 光明日报 2017-02-19; 余辉, 澎湃 2015; 故宫 2022 |
| C10, C11 | ✓ | W3 | 后来 (via 真定, 陈某) 文人杨准1351买下, 1352 题跋, 江西泰和 | 余辉, 澎湃 2015 |
| C20 | ✓ (order of colophon vs removal unknown; wording avoids it) | T2, F1, F2, E3 | 1578 太监冯保 偷盗而出 / 带出宫外; his colophon 「心思爽然」 | 故宫VR (李湜); 故宫 2022; 余辉, 澎湃 2015 |
| C7 | ✓ | F2 | 冯保 is among the 13 colophon writers | 故宫VR |
| C24 | ✓ | T3, P1, P3, E3 | 1923 溥仪以赏赐为名偷运出宫; one 「张择端清明上河图一卷」 entry is you | 新京报 / 中新社 2025-09-29; 故宫 2022; 王文锋 2020 (一史馆目录) |
| C24b | ✓ | P1 stamp | 溥杰 = 溥仪's younger brother (其弟) | 故宫VR; 光明网 2025-10-01; 北京日报 2016 |
| C25 | ✓ | P2, P3, P2 stamp | 4 scrolls named 清明上河图 left within 25 days (1922-12-30 → 1923-01-24); 2 listed as 张择端 | 王文锋 2020 (一史馆目录) |
| C30 | ✓ (date 争议 → "约1950", "几年后") | T4, Y1, Y2, Y4 | 沈阳临时库房; several (3) works named 清明上河图; found among 残次品; 专家 杨仁恺 | 王文锋 2020; 文摘报 2012 |
| K5, C31 | ✓ (C31 mapping to 1923 entries UNVERIFIED → not used) | Y3 | the two labelled as genuine were copies | 管继平, 北京晚报 2024; 王文锋 2020 |
| P3 | ✓ | N1, N2 card, Q | 排队四五个小时; 看一两分钟; 10月30日撤展回库; 展了一个月 (9/30–10/29) | 朱鸿文, 光明日报 2026-01-04; 红星新闻 2025; 新华网 2025 |
| P5 | ✓ | N2 card, E8 card | 下次展出：未公布 | 中新社 2025-09-29 |
| C1 | ✓ (year 争议 → "北宋末年") | B1, BO | 北宋末年 · 汴京; first held by the Northern Song court | 故宫 2022; 余辉院刊 2012 |
| O1, O2 | ✓ (holds-for-all wording) | B1 picture labels | 5米多长 · 几百个人 | 故宫藏品页; 故宫出版社 2015 |
| C5 | ✓ (how it left: unknown) | BO | 靖康后，流入金国 | 故宫 2022 |
| C2 | ✓ | Z1, Z3, F2 | 画上没有画家的名字 | 故宫VR |
| C6 | ✓ (藏者宜宝之 = 张著's own words, Pass 2) | Z2–Z5, E1 | 1186 · 金人张著; 翰林张择端; 藏者宜宝之; 落款 清明后一日 | 余辉, 光明日报 2017; 张健, 澎湃 2015; 祝勇, 新京报 2025 |
| C8 | ✓ | I2 | 元朝建立后再次入宫 | 故宫 2022; 故宫VR |
| C15 | ✓ | M1, E3 | 明朝 · 主人陆完 · 被抄家前藏起了你; stamp 陆完藏画友人家 (正德, 苏州). 主人 is C15's own word; no row gives his office, so no 大臣/尚书 | 余辉, 澎湃 2015; 光明日报 2025-06-12 |
| C16 | ✓ | M2 | 后经辗转，为权臣严嵩所得 | 故宫 2022; 故宫VR; 光明日报 2025 |
| C19 | ✓ (隆庆; no year) | M3 | 严家被抄 → 隆庆年间入宫 | 故宫VR; 故宫 2022 |
| C21, C22 | ✓ | Q1 | 清 毕沅 (owner, seals); 1799 抄家，入宫 | 清华新闻网 2024; 余辉讲座 2012; 文摘报 2012 |
| C23 | ✓ | Q2 | 嘉庆 五玺全, 《石渠宝笈三编》, 延春阁 | 故宫VR; 故宫 2022 |
| C26 | ✓ | V1 | 伪满皇宫 图书楼; 十几年 | 光明网/大河报 2025-10-01; 人民政协网 2019 |
| C27 | ✓ | V2 (line + picture) | 1945年8月 伪满覆灭，溥仪出逃 | 爱新觉罗·毓嶦, 人民政协报 2014 |
| C28 | 争议 → proposed wording | V3 | 混乱中，你下落不明 (no place named) | 王文锋 2020 |
| C29 | ✓ | Y1 stamp | 东北博物馆, 沈阳 | 王文锋 2020; 中新网 2009 |
| C32 | ✓ ("1950年代") | R1, E5, E6 | 1950年代回到故宫, 自此结束辗转流离 | 故宫 2022; 新京报/中新社 2025 |
| C33 | ✓ | D1, D2 | 明代裱画师把草棚误作驴耳，补画了驴 (D1; stamp 裱画师误补); 1973 修裱时揭去 (D2). 揭补约47处 / 接笔38处 is no longer on screen | 许忠陵《清明上河图装裱记》, 故宫博物院 2016 |
| K1 | ✓ (余辉's estimate) | E3 抄 flash label + stamp | 约一百卷 · 只有一卷是你 | 余辉讲座, 故宫博物院 2012 |
| K4 | ✓ | E3 抄 flash picture | the wall of copies (苏州片 etc.) | 台北故宫博物院 2018; 院刊 2008 |
| O4, O5 | ✓ | E1 stamp | 96方印 · 14段题跋 (no claim of one seal per owner) | 故宫藏品页; 余辉, 澎湃 2015 |
| O9 | ✓ (as reported) | E7 | 展完要静养三年以上 (source: 一次展出以后…必须回到库房“静养”三年以上) | 孙乐琪, 北京晚报 2015-09-08 (新华网) |

**Framing lines (interpretation, not facts).** Each follows from the rows above and states no new fact.
- H1 「人人都想留住你」 and H2 「所以…一直在被带走」.
- E1 「人人都很珍惜你」.
- E3: four verbs summing up C9/C15/C20/C24 and K1.
- E5/E6, the moral (C32: since the 1950s you have stayed with a public museum; the 2007 Hong Kong and 2012 Tokyo showings, P6, were loans).
- E7 「安全的代价」.
- Q2 「你归皇家了」 (C23: catalogued and sealed by the emperor).
- F2 「偷你的」 (C20's 偷盗, used as a label, with no claim about order).
- Y2 「“你”」 for scrolls named 清明上河图 (C30).

## Left out on purpose
- **K7 (乾隆's 《石渠宝笈》初编 already held a "张择端" 清明上河图, a 明代苏州片).** It's a good fact, but it doesn't earn a line here:
  1. **It spoils the best payoff.** Telling viewers at 1799 that a palace-catalogued "张择端" was a fake gives away Y3/Y4 「标着真迹的…都是仿的 / …才是你」 thirty seconds early, and that payoff is on the don't-change list.
  2. **It makes the middle heavier.** It would be a fourth "fake" beat before 1950 (W1, P3, Y3), and it adds 乾隆 plus a catalogue concept in the run the director wants lighter. It could only replace Q2, and Q2 carries the P1 irony.
  3. **It invites the forbidden mapping.** Placed before P3 「其中两卷都写着张择端」, it leads viewers to read the second 1923 张择端 as that same fake. That is the researcher's UNVERIFIED inference (C31), which may not appear on screen.
  - **Spare if the owner wants it** (replacing Q2, same time): 「乾隆宫里早有一卷“你”：假的。」 (15). Stamp: 「— 乾隆朝 / 《石渠宝笈》初编著录 · 明代苏州片（杨仁恺）」.
- **The 王忬 / 汤臣 / 金瓶梅 stories (C17–18, 相传)** and 朱文徵 / 徐文靖 (C14, UNVERIFIED).
- **「就是这个！」 (C30).** It is never put in 杨仁恺's mouth.
- **徽宗's title slip (C3).** It is no longer on the scroll.
- **1945.** No place of seizure, no Soviet claim, no plane (C28), and no looting picture unless note 10's row appears.
- **伪满.** Always written with 伪, never used as an era chip. **1922.** Not on screen anywhere (C24).
- **Cut for length:**
  - The 2015 thirteen-hour queue (P2), the 2005 empty rooms (P1), the 冯忠莲 copy (C34) and the 清院本 (K3).
  - The 2026 苏州 仇英本 (P7). It is the first to restore if the track runs longer: 「今年春天苏州展的那卷，也【不是你】。」 (16, about 3.5 s).
  - C1 「世上约有一百卷清明上河图」 as a line. Its number now lives on the E3 抄 frame (note 6).

## Where I differ from the notes (for the director)
1. **W3 keeps 后来.** I used 「后来买下你的文人，【记下】了调包。」, not 「买下你的文人，记下了这次调包。」.
   - Without 后来, 「买下你的文人」 right after 「卖给了一个权贵」 can read as the same purchase. That is the r2 cold-read confusion that 后来 + 文人 fixed.
   - Because of this, M2 opens with 几经辗转 so two lines in 7 s don't both start with 后来.
2. **BO uses 「你进了北宋皇宫」, not 「你先进北宋皇宫」.** 「你先进…」 can misparse as 先进 ("advanced") on a first read. Same width (16).
3. **P3 reworded, though not routed:** 「清单上，其中两卷都写着【张择端】。」. The cold reader asked whether the real one "counts as written 张择端" after Z1 said you are unsigned. 清单上 makes it the palace list's label, which is true of you (C24) and true of the copy (C25). P3 is not on the don't-change list.
4. **Y2 says 好几卷“你”, not 好几卷清明上河图.** The full name makes the line 17 wide. 「“你”」 also sets up Y4 「才是你」. The cold reader should check that 「“你”」 reads cleanly.
5. **K7 is not used** (reasons above). It is offered as a spare line.
6. **v2.1, M1 identity: 主人, not 大臣 / 尚书.** The producer offered 「明朝大臣陆完 / 尚书陆完, whichever is ✓」. Neither office is in facts.md (C15: 主人; C7: colophon writer), so the line uses 明朝 + 主人. If the owner wants his office on screen, the researcher needs a sourced row first. Even then, 「明朝大臣陆完」 costs 2 more 字 than 「明朝，主人陆完」, and M1 is already 16 wide.

## Checks run
- **`pace.py lines.json --film-end 170`:**
  - **TOO FAST:** none.
  - **Waiting:** 16.0 s = 9 % (target ≤ 12 %). All of it sits on "key: read twice" lines, E3's flashes and the end-card question.
  - **CHECK:** one, at 23.2–26.2, the title card (named beat).
- **Width:** every line ≤ 16.0 display width (punctuation 1, digits 0.55). The 16.0 lines are N1, BO, M1, F2, P2, D1 and E7 (v2.1: D1 replaces D2).
- **v2.1 re-run (2026-10-24):** `pace.py` gives the same result: no TOO FAST, 16.0 s = 9 % waiting, the one CHECK is the title card. `facts.py script.md --lines lines.json` finds no problems. lines.json matches the line table on all 48 rows.
  - The retiming floor (Needs + 0.4 s) is met by all four changed lines: M1 3.5/3.5, D1 3.5/3.5, D2 3.0/2.93, E7 3.5/3.5. D1 has left the under-floor list. M2 and Q2 are still 0.1–0.15 s under (director's carry-forward 4a).
- **Facts:** every number on screen maps to a row above.
  - Years: 1186, 1578, 1923, 1945, 约1950, 1950年代, 1973, 2025; stamps 1127, 1351, 1799.
  - Counts: 九百年, 四五个小时, 一两分钟, 四次/五次, 五方大印, 四卷/两卷, 好几卷, 三年以上, 25天/4卷, 96方印/14段, 约一百卷.
  - `facts.py` was run with `--lines`.
