# Gate 1 notes: 假如你是清明上河图, script v1 + lines.json (51 lines), r1. Verdict: REVISE

Scores (rubric 1–5, only the areas this gate covers): **script 4** · facts **pass** · visual/info/edit/motion/sound: not at this gate.

**Bottom line.** The spine works and the facts are clean. The hook, the four teasers with their four payoffs, the find in the junk pile and the 藏者宜宝之 → 偷换藏抄 irony are all strong. The cold reader's one-sentence takeaway almost exactly matches the intended one.

What keeps it from a 5 is one stretch. From 61 s to 96 s, a new name arrives every 3.5 s and the 冯保 payoff falls flat. Add the dead end at 陆完 → 严嵩 and the short comic detour after the climax, and the owner would likely say "后面的内容好无聊" or "这里不明白". All 10 notes can be fixed in one screenwriter pass (two need a researcher answer first). That pass also takes the film from 3:00 to about 2:50.

**Inputs read:** brief.md, facts.md (all rows), script.md, lines.json, lines_pace_flags.json, script.facts_flags.json, coldread_gate1.json, notes_gate2a_r2.md, the gate-2a cold reads, rubric, all owner-notes rows, and ref_sheet_1–6 (iwanau, 0:00–3:00).

**Checks I ran myself:**
- `pace.py lines.json --film-end 180`: no line is TOO FAST, 9 % of the film is waiting (target ≤ 12 %), and the only CHECK is the title card.
- Display width of all 51 lines: the widest is 16.0.
- `facts.py --lines`: no problems.
- Every replacement wording below was width-checked (all ≤ 16) and has its reading need noted.

**Previous round:** none at gate 1. Against the gate-2a cold-read inputs, every item has landed: 「杨准记」 attribution, 二百五 avoided (240多 / 约251), the dimensions line gone, 贵官 → 权贵, and 后来 / 文人 separating 杨准 from the 权贵.

## The producer's questions

| Question | Answer | Evidence |
|---|---|---|
| Hook in 8 s with a concrete image? | **Yes.** | Frame 0 is the painting itself (虹桥 full frame, moving), and 「九百年」 is on frame 0. The paradox 留住 → 带走 is complete by about 5 s. T1 「换成了假的」 cuts in at 6.0 with a year stamp. Cold read: "by 8 s … three open loops, I'd stay". Risk: H1–H2 alone read as a 情感语录 until the picture says who 你 is (note 9a). |
| Teaser makes you want the payoffs? Every fate paid off? | **Yes, all four.** | T1 → W1–W3 (same mounting room) · T2 → F1 (same gate) · T3 → P1 (same gate) · T4 → Y1–Y4 (same storeroom). The cold reader's biggest "felt great" moment is the T4 payoff. Only T2's payoff disappoints (note 1). |
| Every line on a ✓ row? Legends? 1923? 伪满/溥仪? | **Pass.** | No 相传, ✗ or UNVERIFIED row is used. 王忬 / 汤臣 / 金瓶梅, 朱文徵 / 徐文靖, 「就是这个！」 and 徽宗's title slip are all out. 1923 everywhere (C24). 伪 appears every time, 伪满 is never an era chip, and there is no plane, place of seizure or Soviet claim (C28). 溥仪 is factual, not drawn and not comic. Details in the facts table below. Two small leftovers: the 1922 date in a stamp (9b) and one picture with no source row (10). |
| Does the middle drag? Could the handover set compress more? | **Mostly earns its time. Four soft spots.** | The soft spots: F1–F2 冯保 (cold read's most likely swipe), M1–M3 (dead end), Q2 (seals with no meaning), and the run of names from 61 s to 96 s. **Handover:** compress B2 + O1 into one iwanau-style line (note 5). M3 → F1 is already a tight in/out pair; keep it on one shot. The other in/outs each carry their own story, so merging them would lose content. Net about −10 s → **~2:50**. |
| Ending earned and clear to a 20-year-old? | **Yes, with two fixes.** | E1 → E3 is the cold reader's "best moment in the video". E4/E6 close 留住/带走 and E8 closes 难见. Weak spots: 「抄你」 reads as "copy you" (note 6), 「代价是」 has no subject (note 8), and a ~17 s comic detour delays the close (note 7). |
| Line rules | **Pass.** | All lines ≤ 16 wide. Reading budget is met everywhere. The two-line stack (line 1 stays) is intended and shouldn't be counted as waiting. ？ lines are centred per row 97. |
| Titles | **Pick #1 假如你是清明上河图.** Runner-up #2. Drop #3. | See "Title pick" below. |

## Facts table (every number and named claim in the lines)

| Line(s) | On screen | Row | Status |
|---|---|---|---|
| H1 | 九百年 | O8 | 估算, but it's the holds-for-all lower bound (901–958 years). O6's ✓ 「近千年」 is the strict alternative. Pass. |
| T1 / W1–W3 | 至正年间 · 裱画匠调包 · 权贵 · 杨准 1351 | C9, C10, C11 | ✓ Attributed (元·杨准记). |
| T2 / F1–F2 | 1578 · 太监冯保 · 题跋 | C20 | ✓ The Palace Museum's own word is 偷盗 (note 1). |
| T3 / P1 | 1923 · 溥仪 偷运 | C24 | ✓ (1923, not 1922). |
| P2–P3 | 一个月内 四卷 · 两卷写着张择端 | C25 | ✓ The stamp shows 1922.12.30 (note 9b). |
| T4 / Y1–Y4 | 约1950 · 沈阳 临时库房 · 三卷 · 两卷仿的 · 残次品 | C29, C30, C31, K5 | ✓ |
| N1–N2, Q | 四五个小时 / 一两分钟 · 10月30日撤展 · 下次未公布 | P3, P5 | ✓ (Q rounds up; see note 8b). |
| S1, E4 | 四次出宫，五次进宫 · 四个朝代 | O6 | ✓ The tally order matches O6's list. |
| B1–B2, O1 | 北宋末年 · 汴京 · 皇宫 · 靖康 → 金国民间 · 5米多 / 几百人 | C1, C5, O1, O2 | ✓ |
| Z1–Z5, E1 | 无款 · 1186 张著 · 张择端 · 藏者宜宝之 · 96印 / 14跋 | C2, C6, O4, O5 | ✓ Z4's 「他在最后写道」 holds whether 藏者宜宝之 is 张著's own words or part of his quotation of 向氏. |
| I2, M1–M3 | 元初入宫 · 陆完藏友人家 · 严嵩 · 隆庆入宫 | C8, C15, C16, C19 | ✓ |
| Q1–Q2 | 1799 毕沅 · 嘉庆五玺 | C22, C23 | ✓ |
| V1–V3 | 伪满皇宫 十几年 · 1945 覆灭出逃 · 下落不明 | C26, C27, C28 | ✓ Wording follows the researcher's proposals. |
| R1, D1–D3, C1, E7 | 1950年代 · 1973 驴 / 草棚 · 约一百卷 · 静养三年以上 | C32, C33, K1, O9 | ✓ |
| Ages | 约27 … 900多 | O8 | 估算, shown as 约 / 多. The 250 joke is avoided on purpose. |

## Notes

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | **High** | F1–F2 (82.5–89.25) | **The 冯保 payoff is the cold reader's most likely swipe point.** T2 promised a eunuch. The payoff is 「带你出了宫」 plus 「写了一段题跋」, and nothing happens. **F1:** use the Palace Museum's own verb (C20: 故宫纪录片 "由太监冯保偷盗而出"), e.g. 「1578年，太监冯保把你偷出了宫。」 (15.2 wide, needs 2.8 s). Keep T2 as 「带出皇宫」 so the teaser doesn't stack three 偷 in a row; the payoff then escalates. **F2:** make the colophon a callback to Z1, e.g. 「画你的人没留名，偷你的倒题了字。」 (16, 3.1 s). It rests on C2 (unsigned) and C20 (冯保跋), and says nothing about the order of colophon and removal (your gap 4). If you don't take the callback, cut F2 (−3.5 s) and keep 「心思爽然」 on F1's stamp line 3. | screenwriter | "后面的内容好无聊" · ep41 "cause and effect must be stated" |
| 2 | Med | M1–M3 (72.25–82.5) | **陆完 hides you, then 严嵩 suddenly has you.** The hiding never resolves (cold read #23 → #24: "missing link … confusion makes me swipe"). Keep three beats but join them with C16's 辗转 (故宫: "后经辗转…为权臣严嵩所得"): 「陆完被抄家前，把你藏进了朋友家。」 (16) / 「后来你辗转落到权臣严嵩手里，」 (14, line 1 stays) / 「严家倒台，你被抄进了皇宫。」 (13). 明 stays in the chip and stamp. Running time is unchanged. | screenwriter | ep41 "Every scene's cause and effect must be stated" |
| 3 | Med | 61–96 s: W3, Q1, Q2 | **Six new names in about 28 s** (杨准, 陆完, 严嵩, 冯保, 毕沅, 嘉庆). This is where the cold reader "realised it's a chronological list". In the lines, keep only names that pay off or that viewers already know (严嵩, 冯保, 嘉庆, 溥仪, 杨仁恺, and 陆完 as in note 2). 杨准 and 毕沅 move to the stamp, which already carries them: W3 「买下你的文人，记下了这次调包。」 (15); Q1 「清朝，主人家被抄，你又进了宫。」 (15). **Give the seal run a meaning** (cold read: "honour or damage? so what?"). This also sets up 1923's irony (the emperor's own house takes you out): Q2 「嘉庆盖了五方大印：你归皇家了。」 (15; C23 五玺全 + 石渠宝笈著录). | screenwriter | row 109 "A film is not a list of facts" · row 13 |
| 4 | Med | P2–P3 → Y2–Y3 | **The counts and the wording don't connect.** Four scrolls leave in 1923, three are found in 1950, so the cold reader asks "where's the fourth?". And 「写着张择端」 vs 「标着真迹」 are worded differently, so the payoff isn't linked. **First, answer the screenwriter's gap 3.** 王文锋 says the 1950 batch was "东北人民银行拨交来的一批《佚目》书画", and the 佚目 records what left under 赏溥杰. Find out whether the three 1950 scrolls are among the four in C25 (杨仁恺《国宝沉浮录》, 辽宁省博物馆 or 伪满皇宫博物院 texts). **If yes:** add a ✓ row. The screenwriter then uses the same word in P3 and Y3 and makes the callback explicit (the fourth stays honestly unaccounted for). **If no source:** the screenwriter removes the clash instead. Y2 gets no count that invites the comparison (e.g. 「好几卷」), and Y3 stays C31-true. | researcher (the screenwriter acts on the answer) | row 13 "make sense on first read" |
| 5 | Low–Med | B2 + O1 (34.0–40.5) | **Handover compression.** This is the one place where two routine hand-overs sit side by side. Use iwanau's 220 → 265 move: one line, banners 宋 → fire-glow on the beat, tally 进 then 出 on consecutive beats. E.g. 「你先进北宋皇宫，靖康后流入金国。」 (16, 3.1 s; C1 + C5. It drops 民间 and stays true). That saves ~3.4 s right after the title, where retention is weakest. **Don't merge anywhere else:** M3 → F1 is already a tight in/out pair; keep it on one shot with the 明 banner and the counter rolling 470 → 478. | screenwriter | rows 14 / 104 (reading pace, length set by story) |
| 6 | Med | C1 + E3 (145.75–156.75) | **「抄你」 will be read as "copy you"** (抄作业), and C1 「一百卷」 sits right before it. The picture plans confiscation torches. Make that reading true rather than fight it. Cut C1 as a line (−3.5 s) and put its number on the picture: the 抄 flash becomes the wall of grey copies with 「约一百卷 · 只有一卷是你」 (K1 余辉; K4 苏州片). Then 偷 / 换 / 藏 / 抄 are all things people did out of wanting you. The confiscations stay where they are (they brought you *into* the palace). This also answers the cold reader's "一百卷: why here?". Second-best: keep 抄 = 抄家, move C1 away from E3, and show seal strips on a door. | screenwriter | row 13 · row 11 "plain reading = what the film shows" |
| 7 | Med | D1–D3 (135.75–145.75) | **After 「才是你」 the story feels over** (cold read). The donkey is then a 10.5-s swerve into comedy before the moral. Keep it, because it's the most shareable fact (the cold reader's upvoted comment). But use two lines, framed as "even you carried a fake part": 「1973年重裱，揭掉了一头假驴。」 (14.2) / 「原来，明朝人把草棚看成了驴耳朵。」 (16). The picture shows the Ming patch peeling off, so 补画 is seen rather than read. With note 6, the run from the climax to E1 shrinks from ~17.5 s to ~10 s. | screenwriter | "后面的内容好无聊，保留精华" |
| 8 | Low | E7, Q | **(a) 「代价是」 has no subject.** The cold reader asked "cost of what? belonging to nobody doesn't cause fragility". Name what the price buys: 「安全的代价：展一次静养三年以上。」 (16, O9). **(b) Q** says 五小时 / 两分钟 where N1 says 四五个小时 / 一两分钟, which invites nitpick comments, and it has two different 你. Make it a hypothetical with one 你: 「要是排五小时看两分钟，你去吗？」 (15). Keep 「下一次见你…」 as the spare. | screenwriter | row 13 · row 32 "never state a result the source doesn't" |
| 9 | Low | Stamp column: H1, P2 | **(a) Name the painting on frame 0.** Cold read: H1–H2 alone read like a 情感语录, and 清明上河图 doesn't appear in a subtitle until 99.5 s. Don't spend a line on it. Change the frame-0 stamp from 「—（无印章）」 to 「— 《清明上河图》」 and keep the 虹桥 full-frame as written. Don't name 张择端 there, because Z1–Z3 is a reveal. **(b) P2's stamp** 「1922.12.30—1923.1.24」 is correct (C25), but it puts 1922 on screen 3 s after 「1923年」. That is the exact error the brief corrected, and the owner will read it as that. Use 「25天内 · 4卷（清宫档案）」. | screenwriter | row 22 "the topic itself" in the first line · row 47 "one line of context" |
| 10 | Low | V2 picture, plus 2 small rows | **The V2 picture has no source row.** "Crates pried open, scrolls scattered" shows a looting that no row in facts.md covers: C27 is Puyi's flight, and C28 says the scroll's path is undocumented. If a credible source documents the August 1945 小白楼 looting (伪满皇宫博物院, 一档馆 or 人民政协报), add it as a row so the picture can stand. Otherwise the screenwriter keeps the picture inside C27 (courtyard emptied, car lights sweeping away) plus V3's search in the dark. **While there,** add two cheap rows the screenwriter asked for: 溥杰 = 溥仪's younger brother (lets the P1 stamp read 「以赏给弟弟为名」), and the punctuation of 「藏者宜宝之」 (not blocking; Z4 holds either way). | researcher | ep41 "every prop must belong to its era" · brief: "every stamp maps to a row" |

**Length after notes 5–7:** 180 − 3.4 − 3.5 − 3.0 ≈ **170 s (2:50)**; ~2:46 if F2 is cut instead of rewritten.
- If the chosen track runs longer, spend the extra time on holds at Y4 「才是你」, E3 and the end card, not on new lines.
- P7 (苏州 「不是你」) is the only beat to restore, and only if it earns its place.
- Retiming to the bars: keep H1–H2 within budget + 0.5 s, so the paradox is complete by about 5 s.

## Title pick

**1 · 假如你是清明上河图.**
- It is the format the owner asked us to replicate, and the title card on the drop and the end card are built on it.
- It answers the cold reader's main confusion ("who is 你?") the moment it is seen.
- It cannot overclaim.
- **Against:** the cold reader finds "假如你是X" template-like ("营销号 / POV skit") and would click #2.

**Runner-up · 谁偷走过清明上河图.** It is the clickiest, and the film delivers three thefts by ✓ rows (C9, C20, C24). It is slightly narrower than the film, which is also about hiding, loss, the find and 难见, but it doesn't mislead. It is the owner's call if he wants more click.

**Drop · 清明上河图，四出五进.** It is cryptic before watching ("sounds like 四合院 layout"), and both the screenwriter and the cold reader rank it last.

## What must not change (it works)

**Story and lines**
- H1/H2 「九百年，人人都想留住你。/ 所以，你一直在被带走。」 and their payoffs at E4 「留住」 and E6 「带走」.
- The teaser as one sentence over four hard cuts with year stamps (T1–T4). All four are paid off on the *same* shot (mounting room, gate, gate, storeroom).
- N1 「排队四五个小时，只看你一两分钟。」 + N2 「你，为什么这么难见？」, the 撤展回库 / 下次展出：未公布 card, and the E8 payoff.
- The title card on the hardest drop: move the opening with it and don't add a line.
- S1 「四次出宫，五次进宫」 as the spine, with the on-screen tally: marks light on each in/out, it completes at R1, and the 出 marks flash at E4.
- Z1–Z5: the unsigned painting, named by a later owner's colophon; 藏者宜宝之 plus its plain gloss.
- W1–W3: the swap told plainly, with 「元·杨准记」 attribution in the stamp (the gate-2a fixes).
- P2 「一个月内，四卷清明上河图出了宫。」 (the cold reader's second curiosity spike).
- V1–V3: 伪 every time, 伪满 never an era chip, no plane, no place, no Soviet claim, and the 1-s picture pause before the find.
- Y1–Y4: the labelled ones are fakes and the reject is you. This is the film's best payoff.
- E1 → E3 irony (藏者宜宝之 → 偷你、换你、藏你、抄你), one word per beat.
- E5/E6 「直到你不再属于任何一个人，/ 你才终于，不再被谁带走。」
- The end-card question with a one-word answer on the Juno end card (「关注 Juno · 一起看懂世界」, never 出品).

**Discipline**
- Facts:
  - only ✓ rows; 1923; ages shown as 约 / 多 from O8, with 250 avoided;
  - 北宋末年 and 1950年代 instead of single years;
  - stamps in plain language (故宫博物院 · 元·杨准记 · 余辉考 · 故宫装裱记录).
- Lines: ≤ 16 wide, reading budget met, waiting ≤ 12 %, and the intended two-line stack.
- People and deaths: whole figures only, no likeness of 溥仪, and deaths (陆完's mother, 王忬) neither shown nor mentioned.
