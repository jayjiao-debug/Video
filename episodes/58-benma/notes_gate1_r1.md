# Gate 1 notes: 马踏飞燕，脚下踩的到底是什么鸟？ script v1 + lines.json (39 cards, 179.5 s), r1 — verdict: REVISE

Scores (rubric 1–5, only the areas this gate covers): **script 4** · facts **pass** (one stamp date to source, one narrator line to attribute) · visual/info/edit/motion/sound: not scored at this gate. Picture-column notes are carried forward to 2a/2b.

**Bottom line.** This is a strong v1, about level with the approved 何尊 v2.
- The fact discipline is the best we have had. Every on-screen number traces to a ✓ row. It never says 郭沫若 named it, never links the gait to the balance, and never crowns a species.
- The name beat (铜奔马 has no bird in it; the man who gave it that name is the one who reads it as a hawk) is the best 原来如此 in any of our 文物 films.

What would send it back is three moments, none of them structural:
- **(a)** 「答案是——」 → 「至今，没有定论」 is a fake drum roll. It promises a reveal and delivers a shrug, at the exact bar where the music drops to the quiet break.
- **(b)** The first card after the title is a date-and-place reset (「1969年秋，甘肃武威，」), followed by a count card. That runs straight through the 18–24 s leak window. The pull (two dead plough horses, the offer to sell) only arrives at 22–27 s.
- **(c)** The picture column assumes a 3D horse (an orbit, an arc, under the belly, a low front angle). Our flat-vector engine can't do that without a decision on a 3D model.

One round should fix all three.

**Inputs read:**
- production-crew SKILL (Director), rubric.md, all owner-notes rows
- brief.md, facts.md (all 45 rows + Not used + Risks), music_map.md, script.md, lines.json, lines_pace_flags.json, coldread_input_v1.txt
- history-video-style and pacing skills; docs/analytics_takeaways.md
- ep55 script_v2.md (the bar); ep53 notes_gate1_r1.md (format and precedent)

**No cold-read result is in the folder yet.** Only the input file is there, so these rulings are mine alone (note 11).

**My own pace.py runs:**
- v1 (`--film-end 179.5`): no TOO FAST lines, 0 % waiting. All 78 rows are ≤ 16 characters. That is 681 字 over 167.3 s of subtitle time ≈ 4.1 字/s, exactly the house reference. The only flag is the title CHECK.
- With notes 1, 2, 4 and 5 applied (my own scratch run; every replacement line is in the notes table below): no TOO FAST lines, 2 % waiting. The two short WAITs are on C5 and the new 144.99 card. Both carry a picture event (the villagers lower their arms; the label reveal), so both are allowed.

## The producer's questions, answered

| Check | Ruling |
|---|---|
| Line 1 doesn't answer the title | ✓ H1 sets up the one-hoof mystery only. |
| Answer held to the end | ✓ in substance: 没有定论 at 145, payoff at 162.8–171.7. **But the way it is held fails at 142.76** (note 1). |
| ≤ 2:59 | ✓ 179.5 s, on the uncut track. |
| Second question at 30–60 s | ✓ Q2 「一只脚，怎么站得住？」 sits on the 35.76 main-section downbeat. |
| Subtitle + picture at frame 0 | ✓ H1 on frame 0, horse in side view. Carry-forward: the silhouette must sit on a **light** ground, not a dark museum (note 8a). |
| **5-second gate** | **Pass (4/5).** Frame 0 is the horse everyone knows. Row 2 makes the contradiction countable on the picture: three gap ticks under the raised hooves, one lit contact. By 5 s the bird and 「7公斤多」 have landed. It follows owner row 47 (object on frame 0, a number on the picture, no question asked). 旅游标志 is a fair anchor; 课本 would break row 73. |
| **30-second dip (13–36 s)** | **Not hard enough yet (note 2).** The title asks "what bird?" and the next card answers with 「1969年秋，甘肃武威，」 and then 「…一共99件」: a date line and a count at 13.5–22.4 s, where we lose fastest. The material is good: 两匹耕马刚死 / 39匹铜马 is a real rhyme, and 「有村民提议：卖了买马」 is a real stake. It is just in the wrong order. Lead with the stake and the 13–36 s stretch becomes an open loop that 党寿山 closes on 35.76. |
| **Facts** | Pass. See the table below. Fix the N3 stamp date (note 6) and attribute R2 (note 5). |
| **Pacing** | ✓ 681 字 / 167.3 s ≈ 4.1 字/s, 0 % waiting, no line over 16 characters. Like ep55, 35 of the 39 cards are exactly 2 bars. That is acceptable at this density. If the owner says 单调, the fix is the picture changing inside each card, not more short cards. |
| **The ending** | **As written it deflates.** 「答案是——」 is a promise, and 「至今，没有定论。连甘肃省博物馆，也这么说。」 is a shrug, both on the bar where the music drops. That is three letdowns at once, 34 s before the end. The script already has the cure, one card later: the museum's own name has no bird in it. Make **that** the answer (note 1). The museum's own sentence pairs the two: 「因为被踏之鸟的物种尚无定论…本名，是铜奔马」 (row 23 + 31). The payoff P1–P2 then lands well, and K3/K4 are the best lines in the film. |
| **End question** | **Keep it.** 「燕子、猎鹰、乌鸦、风神——你觉得，它踩的是哪一只？」 is a four-way vote, the lowest-effort comment there is. Optional: a second prompt for the pinned comment (note 10). |
| **Picture notes** | Mostly sound: one saturated colour (patina green on the horse only), X-ray in greyscale, cream traces, terrain-only corridor, our own sign and plush, era-correct props, real people as dignified silhouettes. **But the camera language needs a 3D horse** (note 3), and a few frames need care (note 8). |

## Fact check (every on-screen number, date and name → facts.md)

| Card | On screen | Row | Ruling |
|---|---|---|---|
| H1, H2 | 旅游标志 · 三只脚悬空，只靠一只 · 7公斤多 · 全压在一只鸟的背上 · stamp 高34.5厘米 / 右后蹄 · 唯一着力点 | 34, 11, 13, 10, 9 | ✓ |
| C1–C5 | 1969年秋 · 甘肃武威 · 挖防空洞 · 99件 (39+45+14+1) · 两匹耕马刚死 · 39匹铜马 · 有村民提议 · 党寿山 · 县文化馆 · stamp 230多件 | 1, 2, 5, 3, 4 | ✓. 「秋」 is the allowed form, with no month. 「有村民提议」 is kept word for word. 「国家的文物，不能卖」 is an unquoted paraphrase of 「文物是国家财产，不可变卖损坏」, which is fine. |
| Q2, X0, A1–A4 | 东汉 · 重心 · 鸟当底座 / 双翅撑住平衡 · X光 · 铁骨头 · 腿根、脚踝、马蹄 · 铁骨铜腿 · stamps 长45厘米 · 分范合铸 | 7, 12, 13, 14, 15, 9, 10 | ✓. 「就会翻倒」 vs CETV 「有倾覆的危险」 is acceptable physics. |
| G1–G3 | 顺拐 · 对侧步 · 汉代河西良马练出来的 · 走马 · 骑着稳，颠得少 | 17, 19 | ✓. It is never linked to the balance (row 18 ✗ respected). |
| N1, N2 | 1971 · 郭沫若 · 「天马行空，独来独往」 · 「马踏飞燕」 从此传开 · 1973 巴黎 | 20, 21, 35 | ✓. 「从此传开」 is the allowed wording, never 「起名」. The quote is a contiguous cut. |
| **N3** | 巴黎之后是伦敦 · 十几个国家 · **stamp/counter 「1973 · 英国伦敦」** | 35, 36 | Line ✓. **The stamp's year is not in row 35**, which says only 「随后在伦敦…第二站」 (note 6). |
| N4–N6 | 1983 侧面剪影 · 中国旅游标志 · 2002 禁止出国展览 · 2022 绿色玩偶 · 约2万个 | 34, 37, 41 | ✓ |
| R0–R9 | 尾巴平的 · 180度 · 鹰隼类猛禽的特征 · 凹窝 / 可能 · 考古学家初世宾 · 猎鹰 · 乌鸦 (有学者说) · 风神 龙雀 · 张衡《东京赋》 · 牛龙菲 · 马超龙雀 · 名字列表 | 26, 27, 25, 28, 30, 24 | ✓. **R2 asserts a researcher's reading in the narrator's voice** (note 5). No sun crow, no 匈奴鹰, no year for 牛龙菲: correct. |
| K1–K4 | 没有定论 · 甘肃省博物馆 · 本名铜奔马 · 初世宾 定名 + 猎鹰 · 说不准的先不写进名字 | 31, 23, 27 | ✓. 「所以」 is the museum's own causal link (人民日报 2026-02-15). |
| P1, P2 | 没有它就站不住 · 鸟刚回头，马已经冲过去 · 让这匹马飞了起来 | 13, 32, 33 | ✓ (the artistic reading is sourced: 新华网 2026-02-10, 澎湃 2026). |
| Sources line | 人民日报、新华社、文艺报、中国社会科学报、中新社、澎湃新闻等 | — | ✓. CETV reaches us via 澎湃号, so it is covered by 「澎湃新闻等」. |

## Notes (ranked)

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | **must** | **R10–K2** (142.76–153.90) | **Problem.** 「答案是——」 → 「至今，[没有定论]。/ 连甘肃省博物馆，也这么说。」 is a drum roll that pays off in a shrug, on the bar where the music falls to the quiet break. Its plain reading ("an answer follows") is not what follows. It is the most likely swipe in the back half, and it costs the payoff and the end question.<br>**Fix: same bars, swap the order so the break opens on a concrete reveal, with 没有定论 as its reason.**<br>• **R10 142.76 (1 bar):** 「博物馆的答案——」 (alt. 「看看它的名牌——」).<br>• **144.99 (2):** 「它的本名，叫“铜奔马”——\n名字里，[没有鸟]。」 Old K2's picture and its tier-2 hit move here: the label slides in, and the dotted bird tries to settle on it and fades. They now land on the tier-1 break bar.<br>• **149.44 (2):** 「因为这只鸟到底是什么，\n至今，[没有定论]。」 Old K1's picture: desk lamp, 「尚无定论」 written.<br>• **K3, K4 unchanged.**<br>• Swap the K1/K2 stamps to match. Change the R0 stamp 「俗称：马踏飞燕」 → 「流传最广的名字」 (row 25), so 98 s doesn't pre-empt the 本名 reveal.<br>Facts: rows 23 + 31. The museum's own sentence links the two. Pace: ✓. | screenwriter (lines, stamps); art-director (move the label beat to 144.99) | rows 11, 109 (原来如此), 112 (the hit after a pause); brief rule 2 |
| 2 | **must** | **C1–C5** (13.47–35.76) | **Problem.** Straight after the title the film resets to 「1969年秋，甘肃武威，」 and then a count, 「马、车、人、牛，一共99件」. That is the date/count pattern, in the exact 18–24 s window where we lose to 同类 (analytics). The stake and the rhyme only arrive at 22–31 s.<br>**Fix: lead with the stake and let the rest of 1969 explain it (same five 2-bar cards, Q2 stays on 35.76):**<br>• **C1 13.47:** 「1969年，它刚出土，\n就有村民提议：卖了，换钱买马。」<br>• **C2 17.93:** 「那年，生产队的两匹耕马刚死，\n地下却挖出了[39匹铜马]。」<br>• **C3 22.39:** 「挖防空洞，挖穿了一座古墓：\n一整支青铜仪仗队，99件。」<br>• **C4 26.85:** 「消息传到县文化馆，\n干部党寿山赶到了现场。」<br>• **C5 31.31:** 「他一遍遍地劝：\n国家的文物，不能卖。」<br>甘肃武威 moves to the stamp (「1969 · 甘肃武威」). Facts: rows 1, 3, 5. 「有村民提议」 stays word for word. 「卖了」 covers the finds this horse was among; never 「差点被卖」. 「一遍遍地劝」 = 「反复动员」.<br>**Picture:** the sink through the floor lands on lamp-lit hands holding the horse up while a second villager points down the road. C2 cuts to the empty halters and the idle plough, then to the row of bronze horses on straw. C3 is the how: the pick through the brick, the lamp lowered, the procession. C5 keeps its end: arms lower, the bronzes go back, and the lamp finds the one-hoof horse into Q2.<br>Pace: ✓ (C5 waits 1.3 s over a named action). Equivalent orders are fine if the stake is in the first card after the title and no card opens on a date and place alone. | screenwriter; art-director (re-sequence C1–C3 pictures) | rows 12, 47; analytics (20–40 s); brief (the 30-s dip) |
| 3 | **must** (decide before 2a) | **Picture column: Q2, A2, G1, P1, P2** | **Problem.** These moves need a 3D horse:<br>• Q2: low front angle, three hooves above the lens<br>• A2: under the belly at ground level<br>• G1: "arc round to a pure side view"<br>• P1: "circles low around the single hoof"<br>• P2: the horse pulls away from camera<br>A flat-vector drawing of the 铜奔马 holds up in profile and maybe in one 3/4 view. Every extra angle of a complex organic bronze is a new hand-drawn asset, and that is the risk owner rows 9 and 98 warn about. ep55's parametric code-3D 尊 does not carry over to a horse.<br>**Options for the producer:**<br>(a) **A licensed 3D scan of the 铜奔马** (CC0/CC-BY, licence recorded) as the one 3D hero inside flat-vector sets. ep53's sword and ep55's 尊 set the precedent. Light it per row 81 (one key, the hoof/bird brightest) and keep the bronze big and readable (row 44). This keeps the brief's orbit set-piece.<br>(b) **2D only.** The horse lives in profile (+ one 3/4).<br>• Q2: crane down the profile to hoof height.<br>• A2: the wing footprint drawn as a cream ellipse in side view.<br>• G1: no arc; the profile is already side-on.<br>• P1: crane down while the case, plinth and floor drop away in parallax layers and the horizon falls below the bird. No orbit.<br>• P2: a side-on track as the horse outruns the camera.<br>**My recommendation:** (a) if a clean licensed scan exists, otherwise (b). Decide before the art director draws looks, and rewrite the five picture cells to match. | producer (decision, licence); art-director; screenwriter (picture column) | rows 9, 33, 42, 44, 46, 81, 98 |
| 4 | should | **G3** (66.97–71.43) and the 58–98 s stretch | **Problem.** The title question is asked at 9 s and not again until R0 at 98 s, 85 s later. After Q2 is answered (58 s), the viewer gets a declared detour (「还有个细节」), a modern 走马 card, then six dated rungs (1971 · 1973 · 1973 · 1983 · 2002 · 2022) with no open question over them. That is the "list of facts" pattern (row 109). G3 (the modern herder) is the weakest card in it.<br>**Fix (same bars):** replace G3 with a hand-back that re-asks the title and motivates the name history: 「可它脚下这只鸟，到底是什么？\n先从它的名字说起。」 (14/9). Don't write 「名字是怎么来的」: it would imply someone coined it, and the plain reading becomes 郭沫若.<br>**Picture suggestion:** the pacing Han horse passes. A bird (a dark silhouette, species unreadable) lifts from the grass at its hooves, and the camera follows it into the 1971 museum case, where it becomes the bronze bird under the hoof. The counter goes 东汉 → 1971 on N1, which also removes G3's 今天 bounce.<br>**Optional, same pass:** N5 (2002 export ban) is the third use of that beat in four object films (ep53 S2, cut; ep55's closing line). Swap it if the screenwriter has something on-thread for the 2 bars. If not, leave it. | screenwriter; art-director (the hand-back picture) | rows 12, 109, 107 |
| 5 | should | **R2** (107.09) + R4 highlight | **Problem.** 「这是鹰隼类猛禽的特征。」 says in the narrator's voice what row 27 attributes to a researcher (文艺报, 茹实). R1–R4 are four cards in a row that build the hawk case, R4 puts [猎鹰] in gold, and K3 calls it back. The film's plain reading drifts toward "it's a hawk" (brief: Must avoid).<br>**Fix:** R2 → 「鸟头向后扭了180度，\n研究者说，这像鹰隼类猛禽。」 (10/12, pace ✓). Take the gold off [猎鹰] in R4. Gold goes on evidence (平的) and names (马超龙雀, 没有鸟), never on a species. | screenwriter | row 11; brief (never crown one species); facts Risks |
| 6 | must (small) | **N3 stamp/counter** 「1973 · 英国伦敦」 | **Problem.** Row 35 gives Paris 1973-05-08 and then 「随后」 London. It gives no year for London, so the stamp's year is untraced.<br>**Fix:** the researcher adds the London leg's date from a credible source to row 35 (it should be the Royal Academy show of autumn 1973). If it can't be confirmed, the N3 stamp drops 「英国伦敦」 for a line that doesn't need a London year. Moot if the screenwriter cuts N3 under note 4. | researcher → screenwriter | gate-1 fact rule; row 11 |
| 7 | should | **P2 → END** (167.28–179.50) | **Problem.** The track's loudest stretch (−17 → −14 dB, rising to the 178.5 fade) sits under a 7.8 s end card over a dimmed still. Analytics: the end card is our second-biggest leak (12–27 % per 2 s). Row 88: the biggest image goes on the musical peak.<br>**Fix:** keep the flight moving under the end card. The horse is still pulling away through the sky at 30 % brightness while the J, title, question and pill come in on bars. Have the question on by ~173.4 as planned. | art-director; editor | row 88; analytics (end card) |
| 8 | should (carry to 2a/2b) | **Picture column, several cards** | (a) **H1 frame 0:** the backlit silhouette must sit on a light, warm ground (the sign's dark-on-light read), not a dark museum. Check mean luma on frame 0 (post-mortem rule 5; row 71).<br>(b) **The 铜奔马 case label** must be unreadable in every shot before 144.99 (H1, N5, R4, any museum wide), or the note-1 reveal is spoiled.<br>(c) **N1→N2:** no image that links 郭沫若 to the words 马踏飞燕 (no speech, no pen, no glow passing from him to the poster). The posters start after he has turned away.<br>(d) **N4:** a 1983 roadside panel with a car and tour bus passing invents a use the facts don't give. Show the mark being printed or stamped on tourism materials, or over a travel-office door (row 34: 「中国旅游图形标志」).<br>(e) **G1:** the stamp says 河西走廊 but the picture is the bronze in the foundry. Match them, and keep the CoG line and plumb dot off the gait shots, so nothing visually links gait and balance (row 18 ✗).<br>(f) **N6 plush:** our own design, no museum tag, brand or the real product's face proportions.<br>(g) **P1/P2 sky:** keep it desaturated, so patina green stays the only saturated colour. | art-director | rows 11, 50, 71, 121; post-mortem rule 5; facts Risks |
| 9 | optional | **T** (9.02–13.47) | The pace CHECK: name the beat. The push ends on the bird's turned-back head, which plants R2's 180° and P2's 「鸟刚回头」 four seconds before anyone mentions it. The title must not cover the hoof–bird contact. | art-director | pacing §2; analytics (title leak) |
| 10 | optional | **G1** + pinned comment | (a) G1 can borrow the viewer's own life (row 45): nearly every 18–23-year-old has been told off for 顺拐 at 军训. Something like 「还有个细节：它在“[顺拐]”——\n军训时被纠正的那种，它是练出来的。」 is the idea; the screenwriter judges the wording and keeps the definition in G2.<br>(b) Pinned comment: 「如果让你给它重新起名，你叫它什么？」 sits beside the end-card vote. It plays off the 本名 reveal; keep the end card as written. | screenwriter; producer | rows 45, 35 |
| 11 | process | **Cold read** | No `coldread_*.json` is in the folder. Run the cold reader on the **revised** lines before the owner sees them. If it still swipes at 13–22 s or reads the 145 s beat as a let-down, send it back to me. Also remind the owner of the brief's 巨量算数 / search-box check before the title is locked. | producer | SKILL (gate 1 = director + cold reader); brief (Demand) |

**Titles.** Keep option 1, 「马踏飞燕，脚下踩的到底是什么鸟？」, as the Douyin title (brief-fixed to the search). With note 1 in place, the film answers it honestly. Option 3 is the right fallback if the owner's 巨量算数 check favours the balance question.

What must not change (it works):
- **The hook:** H1 「旅游标志上这匹马，/ 三只脚悬空，只靠[一只]撑着。」 and H2 「7公斤多的铜马，/ 全压在一只鸟的背上。」. Also the frame-0 plan: horse on frame 0, three gap ticks, the 7公斤多 arrow pressing on the bird.
- **The title:** it slams on the 9.02 A-section downbeat, 2 bars, over the hoof and bird, with no subtitle under it.
- **Q2 「一只脚，怎么站得住？」 on 35.76** (centred, 1 bar), then X0 「东汉工匠，用了三招。」 and A1–A4 word for word. Keep the ghost horse toppling off the plumb line, the wing footprint as the base, the X-ray scan bar finding the iron (hit), and 铁骨铜腿.
- **The gait stays separate from the balance** (「还有个细节」); G1–G2 wording.
- **The 1969 material:** 两匹耕马刚死 / 39匹铜马, 「有村民提议」 word for word, 党寿山 as a dignified silhouette, villagers practical and not greedy, the lamp finding the one-hoof horse into Q2.
- **N1–N2:** 郭沫若 「天马行空，独来独往」 and 「从此传开」, never 「起名」.
- **N4:** the callback to frame 0, with our own silhouette.
- **N6 → R0:** the 燕 character floating from the tag to the bird.
- **The bird section:**
  - R0's question
  - R1's scissor tail vs the flat tail
  - R3's 「可能」 and R4's attribution
  - R5 「有学者说」 for the crow (no sun crow, no 匈奴鹰)
  - R6 张衡 on bamboo slips
  - R7 「马超龙雀 / 比风神还快」
  - R8's name tags and R9's four-way line-up
- **K3 「定名“铜奔马”的，正是初世宾，/ 说它是猎鹰的那位。」 and K4 「说不准的，就先不写进名字。/ 但有一件事，可以确定：」**: the best lines in the film.
- **The payoff:**
  - P1 「不管它是什么鸟——/ 没有它，这匹马就站不住。」
  - P2 「鸟刚回头，马已经冲过去：/ 是它，让这匹马[飞]了起来。」
  - the floor falling away, the flight on the final build
- **The end question:** 「燕子、猎鹰、乌鸦、风神——/ 你觉得，它踩的是哪一只？」, the pill 「关注 Juno · 一起看懂世界」, no 「Juno 出品」.
- **Numbers and wording that stay out:**
  - Allowed forms: 1969年(秋), 230多件, 7公斤多, 十几个国家, 约2万个.
  - Kept out: month or day of discovery, tomb owner, 近两千年, 7.15, 郭沫若起名, the gait as the balance, a single species.
- **Music and timing:** the uncut track, every card on the 0.10 + 2.229·n grid, 179.5 s, Q2 on the main section, 没有定论 inside the break, payoff on the final build.
- **Picture rules:** one saturated colour (patina green, horse only), greyscale X-ray, cream traces, terrain-only corridor (no bordered maps), our own sign and plush, era-correct props (no stirrups), real people as rim-lit silhouettes.
