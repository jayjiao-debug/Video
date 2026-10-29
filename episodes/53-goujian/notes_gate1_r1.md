# Gate 1 notes: 越王勾践剑 / 为什么不锈？ script v1 + lines_read.json (30 lines, 1:56.5), r1 — verdict: REVISE

Scores (rubric 1–5, only the areas this gate covers): **script 4** · facts **pass** (every number traces to a ✓ row or to a ? row in its safe wording; 1 sources-line fix, 1 wording to verify) · visual/info/edit/motion/sound: not scored at this gate. A few picture-column notes are carried forward to 2a/2b.

**Bottom line.** This is a strong v1, at or above where ep51 v1 was.
- The spine is one thread: "why doesn't it rust?" → "it did, lightly; the tomb held it off".
- The one-take is designed with intent. The way down lays out the answer's layers without naming them, and the way up names them (L1). That is the best structural idea we have had in an object film.
- Fact discipline is exemplary: no 2400, 毫无锈蚀, 出土时划破, 郭沫若破译 or 第一批, and 陪嫁 is never stated as fact.

What would send it back:
- **(a) The first 2 s show only a kitchen knife.** The sword only arrives at ~2.0 s.
- **(b) 镀铬 is raised and never closed.** That loop is a promise the film breaks.
- **(c) 14.75–18.75 is trivia in the leak window.**

All three are line or timing fixes, and one round should do it.

**Inputs read:**
- production-crew SKILL (Director), rubric.md, all owner-notes rows
- brief.md; facts.md (every row); script.md; lines_read.json, lines.json; lines_pace_flags.json; script.facts_flags.json (empty)
- docs/analytics_takeaways.md
- ep51 notes_gate1_r1.md and its approved lines; ep50 and ep52 openings (for owner row 40)

**No cold read was in the folder.** These rulings are mine alone; see note 15.

**My own `pace.py` runs:**
- v1 (`--film-end 116.5`): no TOO FAST lines, 1.5 s waiting = 1 %. This matches the script.
- The revised timeline below (`--film-end 108.25`): no TOO FAST lines, 1 % waiting. The only flag is the end card's MINOR WAIT, by design.

## Fact check (every on-screen number and claim → facts.md)

| Line | On screen | Row | Ruling |
|---|---|---|---|
| H1 | 菜刀沾水不擦就会锈 · 埋了两千多年 · 还是亮的 | I1 (no number), A14 + 估算, A9 | ✓. 两千多年 is the burial span (战国中期 → 1965); never 2400. |
| H2 + stamp | 卧薪尝胆的越王勾践 · 春秋末年 · 55.6厘米 · 875克 | I5 ?, I3, B1, B3 | ✓. 卧薪尝胆 is used as the familiar epithet only, with nothing about its source. Accepted. |
| S1 | 湖北省博物馆 · **一把剑，独占一个展厅** | D1 | 独立展厅 ✓. **「独占」 and the picture's "nothing else is on display" go one step past D1.** See note 7. |
| S2 | 日本、新加坡 · 2013年起禁止出境展览 | D7 ? (safe wording, exact), D2, G1 | ✓ as worded. Cut anyway, for pace (note 3). |
| S3 | 一种流传很广的说法：镀了铬 | E7 ? | ✓. This is the safe wording from the corrections, item 4. |
| D1–D6 | 1965年冬 · 江陵 · 修水渠 · 楚墓 · 10.8米 · 夯土/白膏泥 · 从没被盗 · 木椁 + 两层棺 · 内棺, 墓主人左边, 黑漆鞘 · 洗净剑鞘, 拔出 · 寒光闪闪 · stamp 1965年12月 | A1–A10, A14 | ✓. The day (12月25日, A3 ?) is correctly left out. |
| I0–I3 | 越王鸠浅，自作用剑 · 约2500年前 · 读错 (邵滑) · 十几位学者 · 40多封信 · 两个多月 · 唐兰读出, 郭沫若认同 | C1–C5, C7, I2 + 估算 | ✓. 「来回写了40多封信」 matches 光明日报 2025 「书信往来40余封」. |
| C1–C2 | 越 → 楚 · 一种说法：陪嫁 · 至今没有定论 | A13, H1 ✓, H2 ? | ✓ as hedged. Cut anyway (note 5). |
| B1 | 1977 · 科教片 · 30多张 → 20多张 | F1, F2 | ✓. Never 出土时. |
| M1 | 含锡约18%–20% · 铅几乎为零 · 料很纯 | B7, B9, E10 | ✓. B7, never B8. |
| M2 | 研究了7年多 · 菱形花纹 热镀锡 | E5 | ✓. 「7年有余」. |
| T1–T3, R2, R3 | 它也锈了 · 很轻，人眼几乎看不出 · 不是秘方，主要是那座墓 · 出土后没那么亮 · 锈没法完全停下 | E8 (后德俊, attributed in the stamps) | ✓. 「秘方」 is a fair, softer rendering of 「并非是经过特殊工艺处理」. |
| E1, L1 | 同一座墓里的其他剑也几乎没锈 · 剑鞘、两层棺、木椁、白膏泥 · 隔绝空气 | E10, E11, E12, A6, A7 | ✓. 湖北日报 2024 says 「同一墓葬」 word for word. |
| P1 | 它不是不会锈，是那座墓替它挡了两千多年 | 本片归纳 | Fine. It is the T3 claim restated, and T3 carries 「主要」. |
| Sources line | 「湖北省博物馆（2025研究成果；研究员后德俊、江旭东）」 | E8 | **Wrong date for 后德俊.** His words are from 北京日报 2016, not the 2025 study. See note 6. |

## The producer's two concerns and the screenwriter's question

**1. 镀铬: yes, close it out loud. Do it at M2, in E7's own safe wording, with no verdict word.**
- **Why it must close.** S3 plants 「它表面镀了铬，所以不锈」 as the ready-made answer, and as written nothing ever answers it. M2 says 热镀锡 55 s later without linking back, and the 「镀铬？」 tag is told not to return. A viewer can leave believing 镀铬. A fact-checker commenter will ask 「所以到底镀没镀铬？」. The brief asked to test the claim. Owner row 11 applies: the film must not leave a plain reading it doesn't support.
- **How.** E7 gives the safe form: 「有一种说法：表面镀了铬。博物馆2025年的研究，说的是锡。」 Start M2 with 「镀铬？」 so the callback reads alone after 55 s (row 13), then give the study's finding.
- **What it must never say:** 谣言, 假的, 不是铬, 没有铬, 被证伪, ✗ or a strike-through.
  - 「不是铬」 / 「没有铬」 overclaim: no study we have tested this sword for chromium and found none (E7 is ?).
  - 国博 still prints 铬盐 (E7), so nothing may make that wording look foolish.
  - The 秦俑 paper (E6) stays out. It is about other objects.
- **The chain after the fix:** 镀铬？ → 结论是锡 (the pattern) → 那它到底为什么不锈？ → 也锈了 → 不是秘方，主要是墓. M3's 「那…到底」 now tells the viewer that the tin finding is not the whole answer. Don't add a line claiming the tin does or doesn't stop rust: no source says either about this sword (E16 is another sword).

**2. S1/S2 (10.5–18.75): the producer is right about S2, not S1.**
- **S2** is a list of two country names and a year, with no turn. It sits exactly where we start losing to 同类 (analytics 20–40 s, and the post-title leak at 18–24 s in 《第几个人》). It also invites the 1994 Singapore-scratch comments that facts G2/G4 warn about. Cut it as a line (note 3).
- **S1 stays.** It anchors "today" in the museum hall, which the ending needs (R2 rises into the case, R3 is "2026 · 湖北省博物馆"). The image (one lit case in a dark hall, a queue) is a real reveal.
- The 4 s saved buys a bridge line (note 4), so the 镀铬 tease turns into the dive, and the leak window becomes descent and action.

**3. The 楚-tomb beat (C1–C2): cut it.**
- It is the one beat off the rust thread (rows 107/109), and it ends on 「至今没有定论」, an unresolved thread in a film that already has one loop to close.
- It sits in the slowest stretch: a 21.5 s glide at ~2 cm/s where the picture only changes inside a reflection (rubric 5: "barely changes for 10 s" = 1). Cutting it brings that glide down to 14 s.
- It removes the two-dots schematic, a map-adjacent risk.
- Few viewers will register 「楚墓」 in D1 as a puzzle; D1 keeps 楚墓 (A1 ✓).
- If the producer wants comment bait, the 陪嫁/战利品 question can go in the posting copy, hedged.

## Notes

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | **must** | **H1** 0.00–2.00 (the 2-second door) | **Problem.** As written, the first 2 s are a kitchen knife and 「你家菜刀，沾水不擦就会锈。」, which is everyday news. Row 2 types and the knife → sword match lands at ~2.0 s. So the frame that decides the push has no sword and no contradiction. This is the same fault ep51 v1 had (ep51 r1 note 1). **Fix (keep the words and the line order, which follows row 47; change the timing and frame 0):**<br>(a) Both rows of H1 are fully on screen by **1.5 s** (row 1 on frame 0, row 2 typed by 1.5 s, or both on frame 0).<br>(b) **Frame 0 already holds both halves.** Rust blooms on the near steel on beat 1, and the far end of the same edge line already glints bronze-gold, out of focus.<br>(c) The match (steel → bronze) completes by **~1.5 s**, so the sword's diamond pattern fills the frame before 2.0 s. Leg 1 of the camera table becomes 0.00–1.5.<br>Update the "Hook check" and the leg table to match. | screenwriter (timing, picture column); animator (carry) | rows 22, 47; analytics (2 s); ep51 gate 1 r1 #1 |
| 2 | **must** | **M2** (old 74.00–78.25) · producer concern 1 | **Problem.** The 镀铬 claim from S3 is never answered (see above). **Fix, new M2, 4.5 s (+0.25):** 「镀铬？博物馆研究了7年多，\n结论是：菱形花纹，热镀[锡]。」 (rows 13 / 13 wide; 21 字; need 4.35 → 4.5). Rows: E7 ? in its safe form, E5 ✓. The stamp keeps 「2017–2025 · 湖北省博物馆 / 7年多无损检测」.<br>**Picture.** S3's 「镀铬？」 tag comes back beside the diamond as the push begins. On [锡] a second tag, 「热镀锡 · 2025研究」, appears beside it. The 「镀铬？」 tag is *not* struck, crossed or stamped; it simply stays behind as the push carries the camera into the diamond.<br>**Unchanged:** M3 「那它，到底为什么不锈？」, T3 「保住它的，不是什么秘方，主要是那座[墓]。」.<br>**Banned anywhere on screen or in stamps:** 谣言 · 假的 · 不是铬 · 没有铬 · 证伪 · ✗ on 镀铬. | screenwriter | rows 11, 13, 32; facts E7 / Risks |
| 3 | **must** | **S2** 14.75–18.75 · producer concern 2 | **Problem.** A trivia list in the leak window, plus the Singapore comment risk (G2/G4). **Fix.** Cut S2 as a line. S3 moves up to **14.75–19.25**. Optional: the 「禁止出境」 seal survives as a picture beat on the plinth at the end of S1's orbit, with S1's stamp line 2 → 「2013年起禁止出境」 (D2/G1 ✓, 10 wide). The art director decides at 2b whether it adds or clutters. If kept, the 国家文物局 list moves to the posting copy (note 6). Drop D7 from the facts table. | screenwriter; art-director (seal, optional) | analytics (20–40 s); row 12 |
| 4 | should | **new S4** 19.25–22.25 | **Problem.** After the 镀铬 tease the film dives into 1965 without saying why. The viewer doesn't know the descent is the way to the answer, and that is where the 20–40 s leak lives. **Fix:** 「是不是真的？先回到它出土那天。」 (15 wide, 13 字, need 2.96 → 3.0 s). It rides the last of the S3 dolly and the fall through the pommel rings (Match 2 now starts on this line). D1 then lands on the shaft at 22.25. It questions without judging (E7-safe), and M2 (note 2) answers it. **Softer alternative** if the producer wants no question mark: 「答案，要从它出土那天说起。」 (2.75 s). | screenwriter | rows 35, 128 (state why); analytics |
| 5 | should | **C1–C2** 58.25–65.75 · screenwriter's open decision 3 | **Cut both lines** (reasons above). The glide goes straight from I3 to B1's roll (Match 3). The blade glide becomes ~14 s, so the camera speed and the reflection beats get retimed in the storyboard. Remove H1/H2/A13-as-C1 from the facts-used table, and 「陪嫁 as fact」 from the banned list (no longer relevant). | screenwriter | rows 107, 109 (one thread; cut what doesn't serve it) |
| 6 | **must** | **End-card sources line** | **Problem.** 「湖北省博物馆（2025研究成果；研究员后德俊、江旭东）」 dates 后德俊's statement to the 2025 study. It is from 北京日报 2016 (E8). The twist rests on him, so his source must be right. **Fix (3 items):** 「资料：湖北省博物馆（2025研究成果）· 光明日报（陈振裕 2016；江旭东 2025）· 北京日报（后德俊 2016）」. The 国家文物局 2013 list, 中新社 2023 and 湖北日报 2024 go in the full posting copy. | screenwriter | row 32; brand/fact safety |
| 7 | should | **S1** 「一把剑，独占一个展厅」 + picture "nothing else is on display" | **Problem.** D1 supports 独立展厅 (光明日报; 湖北日报 「约300平方米的独立展厅」). It does not show that the hall holds only this sword. **Fix (researcher, 1 check):** confirm from a museum or press page that the hall shows the sword alone. **If ✓,** keep the line. **If not,** use 「如今它在湖北省博物馆，\n有一间自己的独立展厅。」 (same window, 11 + 9 wide) and drop "nothing else is on display" from the picture. | researcher → screenwriter | row 11 |
| 8 | should | **L1 picture** | **Problem.** "Air dots bounce off the outer layers; **none** reach the sword" contradicts T1/T2 (it *did* rust, lightly). **Fix:** almost all the dots bounce, and one or two get through to the blade and leave the faint specks from T2. It is honest, and it pays off 「也锈了」 on the way out. | art-director (storyboard); screenwriter (picture column) | row 11 (picture = what the source says) |
| 9 | should | **Posting copy @ prompt** | **Problem.** 「@ 那个说"它镀了铬"的朋友」 frames 镀铬 as a mistake to mock, against E7's ? status. **Fix:** 「@ 那个以为它"一点没锈"的朋友」. The target is the twist, which is E8 ✓. | producer; screenwriter | facts E7 / Risks |
| 10 | carry-fwd (2b) | **S1 → S3 camera** | **Problem.** The camera backs out 1.2 → 6 m, then dollies straight back in along the same axis: a yo-yo, the kind of reversal row 67 warns about. **Fix:** let S1's orbit carry the camera round toward the pommel end, so S3's push-in approaches the pommel along the sword's axis from a new direction. The pull-back can also stop shorter (~4 m), now that S2 is gone. | art-director | row 67 |
| 11 | carry-fwd (2b) | **D2–D5 descent** | **Problem.** D2 is a "side cutaway", but D4 has coffin lids "passing the lens" (looking down, camera through solid lids), and D5 is top-down. **Fix:** settle one geometry. Recommended: descend beside the section face, then tilt down (slow, eased) over the chamber, while the 1965 excavation **lifts** the 椁 roof and the two lids one by one (counted 1, 2). The camera passes through glass and soil as the brief's device, but never through a solid lid. | art-director | rows 43, 67; brief (device) |
| 12 | carry-fwd (2a/2b) | **I0–I3 blade glide** | **Problem.** The inscription, the letters and 鸠浅＝勾践 live in the blade's reflection, 5 cm off, at ¼-screen size. **Fix:** the reflected content must read on a phone. 鸠浅 ＝ 勾践 ≥ 96 px equivalent; the letter counter numerals ≥ 64 px. Something visibly changes every ~3 s (glyphs pass, letters fly, counter ticks, glyphs glow). | art-director; animator | rows 24, 69, 76; rubric 3, 5 |
| 13 | low | **D2 depth tag** | A6 measures 10.8 m 「自现存封土堆至椁底板」. The tag should keep counting through D3–D4 and reach 10.8 at the 椁 floor, not at the white clay. L1 runs it back the same way. | art-director | row 11 |
| 14 | owner | **Opening device vs ep51** (row 40) + titles | **Device.** ep51 opened on *your fridge* → the bronze vessel and ended at your fridge. ep53 opens on *your knife* → the bronze sword and ends in your kitchen. The bookend is the same kind. **My recommendation: keep it.** The device itself (one unbroken glide, edge-match knife → sword) is new to the series, and rows 22/47 want the viewer's situation on line 1. The producer should name the overlap when showing the owner, so it is his call, not a surprise.<br>**Titles.** Recommend option 1 「越王勾践剑 / 为什么不锈？」 (the searched question; the film answers it honestly). Option 2 is the fallback if the owner feels the question presupposes 不锈. **Douyin 标题:** the 16-字 working title; **not** 「…其实它也锈了」, which spends the drop.<br>**End card:** keep 「你第一次见到它，是在哪？」. It is the one place row 73 allows recognition to be invited. | producer | rows 2, 40, 73, 105 |
| 15 | process | **Cold read** | There was no `coldread_gate1.json`. Run the cold reader on the **revised** lines before the owner touchpoint. If it flags the descent (22–43 s) or I1 「"鸠浅"是谁？」 (the viewer already knows from H2), send it back to me. Don't patch it at the owner stage. | producer | SKILL (gate 1: director + cold reader) |

## Revised timeline (notes 1–5 applied; pace.py: no TOO FAST lines, 1 % waiting)

| ID | Time | Change |
|---|---|---|
| H1, H2, TITLE, S1 | 0.00–14.75 | unchanged (H1 timing inside the line per note 1) |
| S3 | 14.75–19.25 | moved up 4.0 s |
| **S4** | 19.25–22.25 | new (note 4) |
| D1–I3 | 22.25–57.25 | −1.0 s, otherwise unchanged |
| B1, M1 | 57.25–65.50 | −8.5 s |
| **M2** | 65.50–70.00 | new wording, 4.5 s (note 2) |
| M3 · HUSH | 70.00–73.00 · 73.00–73.75 | — |
| **T1 (hardest drop)** | **73.75** | — |
| T2 → P1 | 73.75–103.25 | unchanged lines |
| AIR · END | 103.25–104.25 · 104.25–108.25 | + 0.5 s fade → **108.75** |

**Net −8.25 s.** The editor builds the bed to the picture, as in ep51: the title stays on the first hard drop and T1 stays on the hardest drop at its new time. 1:49 is below the brief's 1:50 target, which is fine (owner row 104; analytics ≤ 120 s). The bar retime may add time. Spend it on the title, the D6 draw, the hush and the P1 pull-back, never on new lines.

## What must not change (it works)
- **The spine:** the way down plants the layers unnamed, and the way up names them (L1 + depth tag 10.8 → 0). Keep 「用夯土和白膏泥层层封住」 in D2: it is the quiet set-up.
- **H1's words and order:** your knife, then the sword, two rows; 「也」 in T1 calls back to it. **H2** 「主人，是卧薪尝胆的越王勾践。」 (zero barrier by 8.5 s).
- **The title:** 2.0 s, riding the case glass on the first hard drop, no flash, no subtitle under it.
- **S3** 「有一种流传很广的说法：\n它表面[镀了铬]，所以不锈。」 with its non-mocking 「镀铬？」 tag.
- **The descent D1–D6,** including 「洗净剑鞘，拔出来：寒光闪闪。」 and the draw on the beat.
- **The inscription block I0–I3,** the 40多封信 counter and 唐兰读出/郭沫若认同 (never 郭沫若破译).
- **B1** as 1977 · 科教片 · 30多张 → 20多张, the film-light match, never 出土时.
- **M1** (B7, never B8); **M3 + 0.75 s hush;** **T1 「其实，它也[锈]了。」 on the hardest drop.**
- **T2 → P1 unchanged:** 很轻 · 不是秘方，主要是墓 · 同墓其他剑也几乎没锈 · the six named layers · 出土后反而没那么亮 · 再好的保管也停不下 · 「它不是不会锈，是那座墓，替它挡了[两千多年]。」, the 1.0 s air, back to frame 0's framing.
- **Wording that stays out:** 2400 · 毫无锈蚀/一点没锈 · 谣言 · 硫化 · 郭沫若破译 · 出土时划破 · 全是绿松石 · 泡在水里 · 第一批 · 12月25日 · the tomb owner's name · the 1994 scratch · any cause for the export ban · the 秦俑 chromium paper.
- **Safety:** no photo of the real sword, no faces for real people, outline-only occupant, no bordered map, Juno end card with 「关注 Juno · 一起看懂世界」 (no 「Juno 出品」).
