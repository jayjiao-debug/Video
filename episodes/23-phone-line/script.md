> **Gate 1 r2 must-fix applied by the producer (overnight, 2026-10-12):** cut old L20 (一位内核开发者…) and old L24 (15次对半…); re-timed the build lines and the reveal pair (大约15步 81.45–86.55, 最快20到30分钟 86.65–92.35). Source card for Molnar goes on L23–L25 (art). `lines.json` is the source of truth; the lines table below may lag these edits.

# Script: 200段线，最多查8次  (v2, unattended overnight run 2026-10-12)

## Change log v1 → v2 (gate 1, notes_gate1_r1.md + coldread_gate1.json)

**Director notes routed to the screenwriter**
- **Note 1 → hook re-cut.** L2 "后台一长串…" is no longer a subtitle; the scrollbar sliver and hunting cursor carry "哪一项？" in the picture. Microsoft line at 2.94, wireman line at 5.88, **"[200]段线，测一半最多[8]次" at 8.82**, then "一段段查，最坏要200次" at 12.60 over the racing counters. Halving image at ~3.5 s; 200 vs 8 by 8.8 s.
- **Note 2 → 38 lines cut to 31.** Cut: L2 (as subtitle), L14 (repeat), L20–21 (mid-film PC return; the version strip now shape-matches the million-tick band on the build), L23 (bisect line; `git bisect` appears only typed in the picture), L31 (Molnar quote). L32 + L33 merged into "前提：只能有[一处]坏，测试得准". L24 renamed "Git文档：675个版本约10步". Payoff lines get 10 beats: L4–L5 counters (3.7 / 3.8 s), L13 "第8次只剩1段" (5.0 s), L17 "100万…20次" (5.1 s), L23 "大约15步" (4.5 s), L27 wrong-turn play (4.6 s). Mean line is now 3.39 s. I kept "3.2万" (L24) because it carries the "why 15" arithmetic. Fallback if the director wants it: cut L24 and leave "2¹⁵ = 32,768" in the picture only.
- **Note 3 → L20** is now "一位内核开发者：平均每天用一次". The name card stays.
- **Note 4 → L7** is now "美军通信兵教程：先走到[一半]". The card is "SS0437", with no year.
- **Note 5 → picture, L6–L9.** There is a station at each end: the lit field switchboard he set out from (left, near end) and a hut at the far end (right). He walks left → right in profile. At the mid-cut the **left** (home) switchboard lamp lights and answers, so the left half greys and he keeps walking right.
- Notes 6 and 7 need no script change: note 6 is "keep 3.2万", and note 7 is for the art director. The picture column now asks for a dusk/blue-hour sky, not black night.

**Cold-reader confusions**
- "Long list of what?" → L2 now names it: "微软：**后台服务**，测[一半]最省事". The list on screen is labelled "后台服务".
- "Test half how?" → L29 at the callback says how: "回到电脑：只开[一半]服务，重启". The L2 picture already shows half the ticks clearing.
- "Crank phone?" → the picture explains it (L6, L9). An inset shows the field telephone's hand crank turning, with a tag "摇手柄 = 呼叫对方", and the call travels along the wire as a pulse.
- "两头" read as the two ends of the whole line → L8 now says "往两边各试一次", with arrows both ways from the cut.
- "Git / bisect / versions of what?" → L18 is now "程序员用它找：哪一版改坏了软件". The bisect line is cut. "Git" appears once, as the source of the 675 example, with the picture card "Git · 程序员存版本的工具 · 官方文档".
- "Who is 他? Stiff quote" → the quote line is cut.
- "Which item was it?" → L30 is now "天亮前找到了：一个[同步服务]". The picture labels it "某网盘同步服务 · 示意" (fictional frame, no brand).
- Swipe risk 16.4–20.8 → still the title gap, which the director keeps. The counters finish racing and the camera accelerates into the drop.

**Titles:** option 3 "电话线断在哪？" (director: fails row 45; cold reader: misleads) is replaced by "线长一倍，只多查1次", the cold reader's "surprise that stuck".

**Unchanged (director's "don't change" list):** the laptop opening with L1 and the subtitle on frame 0; the textbook is never named; 200段 / 示意 / 最坏情况 / 最快 bound to minutes / no SS0437 year / no Molnar likeness / no logos or real Windows UI / no map or Varley; the wireman's procedure including L12 "每个剪口都要再接上"; amber/grey and the wire transitions; 200 → 1 on the beats, 2⁸ = 256 overtaking 200, 8 → 9, 100万 → 20; the music anchors (title 16.625, "大约15步" at 81.45, silent gap 79.3–81.45, end card 115.87); "跑偏"; the catch played (L27, L28); the dawn callback and "不必查遍，每次排除[一半]"; every line ≤ 16 glyphs.

---

**Logline:**
- It is the night before a deadline and your computer keeps throwing errors. Microsoft's own advice for the background services is odd: test half of them at a time.
- A US Army wireman with a dead phone line does the same. He walks to the middle, cuts in, cranks the phone and keeps the side that answers. With 200 spans, that takes at most 8 checks; doubling the line adds one.
- Programmers find the version that broke their software among tens of thousands in about 15 steps.
- It works only if there is one fault and every test is right. Back at the laptop, the culprit is found before dawn.

**Takeaway:** 找一个错，不必查遍：从中间测，每次排除一半；200段只要8次，线长一倍只多1次。前提：只有一处坏，每次测试都可靠。

**Length:** lines run 0.00–115.25 s. The Juno end card runs 115.87–~122 s (FIN 121.95). Total ≈ 122 s.

**Music map** (series track `bgm.mp3`, played from 0, untouched): intro 0–16.625 (beat 1 at 0.441) · **drop 1 at 16.625 (title)** · main 20.689 · breakdown 49.041 (L14 lands on it) · build 63.205 (L18 at 63.25) · **silent gap 79.412–81.432** · **drop 2 at 81.432 ("大约15步" at 81.45)** · outro 115.868 (end card) · FIN 121.951. One bar ≈ 2.03 s, one beat ≈ 0.51 s.

**Checks (run before hand-in):**
- `pace.py lines_arr.json --film-end 122`: no line is too fast, and waiting is **11.4 s = 9 %**. It reports five MINOR holds, all on payoff lines given ~10 beats on purpose (L5, L13, L17, L23, L27), and the two allowed gaps: the title (16.40–20.80) and the silent gap (79.30–81.45).
- 31 lines, mean 3.39 s each (3.43 s after the title).
- Every line is ≤ 16 glyphs, counting punctuation and digits. The longest are L8, L19 and L24, at 16.
- `lines.json` uses `{start, end, text}`; `lines_arr.json` has the same lines as `[[s,e,"text"]]`. `[...]` marks gold keywords.

**Visual through-line: one wire.** The divider in the service list becomes the telephone wire. The million-tick band becomes the strip of software versions. The strip's last tile becomes a raindrop that falls back onto the line, and the wire leads back through the window to the laptop at dawn. **Amber** = still suspected, **cool grey** = ruled out. Every halving is the same move, half of the amber going grey, in all three worlds. Gold is only for subtitle keywords. Transitions follow the wire; there are no hard cuts. Sky: rain at dusk / blue hour with lit poles and huts, never black (note 7, owner row 71).

---

## Decisions taken without the owner (unattended run): please check

1. **Opening world:** the viewer's own laptop the night before a deadline (owner rows 22, 45, 47, 48). The phone line arrives at L3 as the same trick done by hand.
2. **The list is named at 2.94 s ("后台服务")**, so the viewer knows what is halved. No service count is given, because none is sourced.
3. **"美军通信兵教程"** (note 4). "教程" does not read as a school textbook. No year.
4. **The textbook classic is never named.** The pole line in the rain is shown as real. Recognition is invited only by the end-card question.
5. **200 spans, not 200 poles.** Labels read "10公里 · 每50米一根杆 · 示意" (#1). The 8 is tagged 最坏情况 (#2).
6. **The found item ("一个同步服务") is our fictional frame**, like 论文 and 天亮前. It is labelled 示意 on screen, uses no brand and is not presented as a fact about what usually breaks PCs.
7. **"最快" goes with the minutes, not the steps** (#16).
8. **"上万个版本"** rests on Couder's 10,928 example (#18) and on 15 steps covering 32,768 (#16 arithmetic).
9. **Left out on purpose:** Victorian cables and Varley (#27–32), Java's 9-year bug (#34), Mozilla (#24), RUS (#33), "Linus invented it" (#19), skipped versions (#23), the Molnar quote (#17, cut by note 2), Christmas lights (#38), and all UNVERIFIED rows.

---

## Title options (≤ 10 字)

1. **200段线，最多查8次** (recommended; the director's top pick and the cold reader's click)
   - It is the paradox in two concrete numbers, and the gap makes people ask "how?". The film answers exactly that.
   - It is literally true: 8 is the worst case for 200 spans (2⁸ = 256 ≥ 200), and "最多" says so.
   - On drop 1 the plaque hangs on the phone line, so "什么线" is answered by the picture.
2. **一次测一半**
   - These are Microsoft's own words (#25), and they cover all three worlds: PC, line and code.
   - Weakness: there is no number and no stakes, it gives away the takeaway, and it can read as an exam tip.
3. **线长一倍，只多查1次** (new; replaces "电话线断在哪？")
   - This is the counter-intuitive scaling the cold reader said they'd repeat to a friend. It is true (#5: 200 → 8, 400 → 9, 100万 → 20), with no overclaim.
   - Weakness: "线" without context is abstract until the picture shows the pole line, and it hides the PC story.

**Title-card sub-line (all options):** 每测一次，排除一半

---

## Beat sheet

| Beat | Time | Purpose | What the viewer learns / feels |
|---|---|---|---|
| Hook (tiny story) | 0–16.4 | Your situation, why it matters, the paradox in numbers | Deadline night, errors, a long list of background services: which one? Microsoft says test half (odd). A wireman does the same: **200 spans, at most 8 checks** (8.8 s), against 200 one by one, as the counters race. |
| Title | 16.6–20.7 | Drop 1 | 《200段线，最多查8次》: the plaque hangs on the wire |
| Setup: the procedure | 20.8–43.9 | What is done, and why each step | The line is dead (stations at both ends). Walk to the middle, cut in, call both ways; the side that answers is good. Halve the bad half, repeat. Every test leaves a cut to re-splice, so fewer tests matter. |
| Why 8 | 44.0–54.6 | The arithmetic, plainly | 200 → 100 → … → 1 in 8 (payoff). 2⁸ = 256 > 200 on the breakdown. The name: 二分查找. |
| Twist | 54.7–63.1 | Counter-intuitive scaling | Double the line: **one** more check. A million places: 20 (payoff). |
| Evidence: software | 63.25–79.3 | Build: a new world, bigger | Programmers hunt the version that broke their software. Git's own example: 675 versions in about 10 steps. One kernel developer does it about daily. Tens of thousands of versions, one bad: how many tries? |
| Silence | 79.3–81.45 | Breath | A huge amber strip, dead still, counter "0" |
| Reveal | 81.45–92.35 | Drop 2 | **About 15 steps.** 15 halvings cover 32,768 versions; best case 20–30 minutes, automated. |
| The catch | 93.25–104.65 | When it fails | Only one fault, and every test must be right. One wrong answer sends the rest off course (played). A splice that comes and goes breaks it. |
| Ending | 104.75–115.25 | Callback + takeaway | Back at the laptop: only half the services on, restart, halve again. Before dawn: a sync service. You don't check everything; you rule out half each time. |
| End card | 115.87–~122 | Comment bait | Question below |

---

## Lines

- **Chars** = the units `pace.py` counts: Chinese characters, plus one per number and one per English word. **Needs** = 0.5 + n/7 + 0.6 s. **Glyphs** = the full count for the ≤ 16 rule.
- People on screen: the **viewer** is first-person, with no body drawn (owner row 9). **The lineman** is one 2D figure in a plain rain cape with a field telephone, in profile walking left → right. No weapons and no combat kit. Pose-checked.
- Two stations (note 5): **home switchboard** at the left (near) end, a small lit field station with an operator seen small from behind; **far hut** at the right end.

| # | Start | End | Line (≤ 16 字) | Chars | Glyphs | Needs | Picture (what the viewer sees) | Beat · music | Fact # |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0.00 | 2.84 | 明早交论文，电脑却一直报错 | 12 | 13 | 2.81 | **Frame 0:** first-person POV. A laptop fills ~80 % of the frame, desk lamp glow, rain on the window behind (blue-hour sky, not black). The thesis "论文.docx" is open. Behind it, a long amber list headed **"后台服务"** is already visible, its scrollbar a thin sliver, with a cursor hunting up and down ("哪一项？" is carried by the picture, not a line). **Beat 1 (0.44 s):** a drawn error dialog (not real Windows UI) pops up, then a second on the next beat. | intro · hit on beat 1 | — (the viewer's story) |
| 2 | 2.94 | 5.78 | 微软：后台服务，测[一半]最省事 | 12 | 14 | 2.81 | Source card "Microsoft 支持 · 干净启动" (text only, no logo). The dialogs slide aside. **At ~3.5 s, on the beat,** the list snaps to its middle: the lower half's ticks clear and it turns cool grey in one move. A thin divider glows between the halves. | intro · halving image by 3.5 s | #25 |
| 3 | 5.88 | 8.72 | 通信兵修电话线，也这样找 | 11 | 12 | 2.67 | **Transition by the line:** the camera pushes into the glowing divider. It becomes a wire, runs out through the rainy window and across dusk fields as a **telephone line on poles**, with a lit station at each end. The 2D lineman stands at the near end with a field telephone. | intro, rising | #7 |
| 4 | 8.82 | 12.50 | [200]段线，测一半最多[8]次 | 10 | 13 | 2.53 | Labels drop in: "10公里 · 每50米一根杆 · 示意". The whole line glows amber. A cut mark at the middle and half the line greys; then the next half, ticking on the beats. Counter **"二分：1, 2, 3 …"** with a small tag "最坏情况". | intro · **200 and 8 by 8.8 s** | #1, #2 |
| 5 | 12.60 | 16.40 | 一段段查，最坏要200次 | 9 | 12 | 2.39 | **The race:** under it a second counter **"逐段：1, 2, 3 …"** crawls span by span toward "/ 200". The 二分 counter hits **8** while 逐段 is still near 3. From ~15.6 s the camera **accelerates along the wire** toward the one remaining amber span. | intro · pre-drop | #3, #2, #4 |
| T | 16.63 | 20.69 | *(title card)* | | | | **Drop 1:** the amber span flares. A plaque styled like a lineman's metal tag swings onto the wire between two poles: **200段线，最多查8次**, sub-line **每测一次，排除一半**. Rain sparkles in the light. | **DROP 1** | #1, #2 |
| 6 | 20.80 | 23.90 | 线不通了，那头接线员没回应 | 12 | 13 | 2.81 | At the **home switchboard** (left end) the lineman cranks the field telephone. **Inset that explains the crank:** a close-up of the box's hand crank turning, a pulse running along the wire, tag "摇手柄 = 呼叫对方". The pulse reaches nowhere: **inset, far hut (right end)**, its switchboard lamp stays dark. The whole line is amber. | main | #7, #9 |
| 7 | 24.00 | 27.10 | 美军通信兵教程：先走到[一半] | 12 | 13 | 2.81 | Card: "美军通信兵教程 · SS0437" (no year). The camera tracks him walking **left → right** in profile, past the first poles without stopping, toward a half-way marker ("5公里 · 示意"). | main | #7 |
| 8 | 27.20 | 30.70 | 剪开线，接上电话，往两边各试一次 | 14 | 16 | 3.10 | At the mid-pole (pose-checked: standing, hands on wire and clips) he cuts the wire and clips the test phone on. Two arrows from the cut point **both ways**: "← 这边？" "那边？ →". Both station icons appear small at the frame edges so "两边" means toward each station. | main | #8 |
| 9 | 30.80 | 34.20 | 摇手柄：哪边有人接，哪边是好的 | 13 | 15 | 2.96 | He cranks (the same crank close-up flashes for half a second). **Left:** the pulse reaches the home switchboard, its lamp lights, and "喂？" comes back along the wire, so the left half turns grey (ruled out). **Right:** the pulse runs out and the far hut stays dark. Tag: "有人接 = 这边是好的". The fault is on the right. | main | #9 |
| 10 | 34.30 | 37.30 | 坏的那半，再走到它的一半 | 11 | 12 | 2.67 | The camera glides with him rightward to the middle of the right half (quarter mark). Grey stays behind them. | main | #7, #10 |
| 11 | 37.40 | 40.10 | 重复，直到锁定那一段 | 9 | 10 | 2.39 | Time-lapse: cut, crank, half greys; cut, crank, half greys. The amber shrinks to **one span** between two poles, where a broken wire hangs in the rain. | main | #10 |
| 12 | 40.20 | 43.85 | 修好后，每个剪口都要再接上 | 12 | 13 | 2.81 | The camera pulls back along the line: at every test point a **small taped splice** glints (8 of them). Tag: "每测一次 = 一个剪口". | main | #11 |
| 13 | 43.95 | 48.95 | 200段，第[8]次就只剩1段 | 10 | 13 | 2.53 | The line straightens into a clean ribbon of 200 tick-spans (diagram mode, same colours). **Played on the beats:** "200 → 100 → 50 → 25 → 13 → 7 → 4 → 2 → 1", each step greying half the amber, step counter 1…8, tag "最坏情况". **Payoff: 10 beats.** | main | #2, #4 |
| 14 | 49.05 | 52.00 | 2的8次方＝[256]，大于200 | 9 | 15 | 2.39 | **On the breakdown:** above the ribbon a second bar doubles 8 times (2, 4, 8 … 256) and ends **longer than the ribbon**: "2⁸ = 256 ≥ 200". Small note under it: "7次：128，不够". | **breakdown 49.04** | #2 |
| 15 | 52.10 | 54.60 | 这招叫[二分查找] | 7 | 7 | 2.10 | The two bars fold into a framed heading **二分查找**, cut in at the midpoint of a wire. | breakdown | #13 |
| 16 | 54.70 | 57.90 | 线再长一倍，只多查[1]次 | 10 | 11 | 2.53 | **Played:** the ribbon doubles in length (400段 · 示意). The step counter goes **8 → 9** while the 逐段 counter jumps 200 → 400. | breakdown · twist | #5 |
| 17 | 58.00 | 63.10 | [100万]个位置，也只要[20]次 | 10 | 14 | 2.53 | Zoom out: the ribbon becomes a band of a million fine ticks. Two counters side by side: "逐个查：最坏100万次" vs "二分：20次"; the 二分 counter ticks to 20 across the bars. **Payoff: 10 beats.** At ~62.6 s the band's ticks start to tilt into small cards. | breakdown → build | #5 |
| 18 | 63.25 | 66.75 | 程序员用它找：哪一版改坏了软件 | 14 | 15 | 3.10 | **Build, shape match:** the ticks become a **horizontal strip of software version tiles** (small cards with dot-codes, no real code) labelled "第1版 … 最新版". The newest tile shows a small red error mark; one earlier tile is the culprit, but nothing marks it yet. | **build 63.2** | #13 |
| 19 | 66.85 | 69.90 | Git文档：675个版本约10步 | 10 | 16 | 2.53 | Source card "Git · 程序员存版本的工具 · 官方文档" (no logo). A generic monospace prompt types `git bisect` (tag "bisect = 一分为二"), then prints "675 … roughly 10 steps". The strip shows 675 tiles; the amber halves on the beats. | build | #13, #14 |
| 20 | 70.00 | 73.40 | 一位内核开发者：平均每天用一次 | 14 | 15 | 3.10 | Text-only name card: "Ingo Molnar · Linux 内核开发者 · 据 Couder 2009". **No likeness, no penguin.** A small calendar strip ticks one mark per day. | build | #15 |
| 21 | 73.50 | 76.60 | 上万个版本里，藏着一个错 | 11 | 12 | 2.67 | The camera pulls far back: the strip becomes **tens of thousands of fine tiles**, wider than the frame, all amber. | build | #18, #16 |
| 22 | 76.70 | 79.30 | 要查几次？ | 4 | 5 | 1.67 | Hold on the enormous strip. A step counter reads "0". | build peak | — |
| — | 79.30 | 81.45 | *(no subtitle)* | | | | **Silence.** Everything stills: only the huge amber strip and "0". | **SILENT GAP** | — |
| 23 | 81.45 | 85.95 | 大约[15]步 | 4 | 5 | 1.67 | **Drop 2:** the strip halves in great sweeps, one per beat, grey flooding in from alternating sides. The counter lands big at **"≈ 15 步"** on the drop, then ticks on to the last amber tile. **Payoff: ~9 beats.** | **DROP 2** | #16 |
| 24 | 86.05 | 89.15 | 15次对半，能分清[3.2万]个版本 | 12 | 16 | 2.81 | The doubling bar from L14 returns at scale: "2¹⁵ = 32,768". It overlays the strip and covers it end to end. | | #16 (arithmetic) |
| 25 | 89.25 | 92.35 | 最快[20到30]分钟，自动跑完 | 11 | 14 | 2.67 | A clock face sweeps 20–30 min while the prompt runs by itself. Tag: "最好的情况 · 自动". | | #16 |
| — | 92.35 | 93.25 | *(pause)* | | | | The last amber tile becomes a **raindrop** and falls; the camera follows it down into the rain and the pole line. | breath | — |
| 26 | 93.25 | 96.45 | 前提：只能有[一处]坏，测试得准 | 12 | 14 | 2.81 | Back on the line at dusk. The lineman stands at a mid-pole with the test phone. Two conditions float as icons by the wire: "① 只有一处坏" "② 每次测试都可靠". | | #22, #20 |
| 27 | 96.55 | 101.15 | 判断错一次，后面全[跑偏] | 10 | 11 | 2.53 | **Played:** one wrong reading (a "喂？" misheard from the faulty side). The **wrong half greys out, with the real break inside it**; the amber search marches off the other way while the break stays hidden in the grey. Tag: "错1次". **Payoff: 9 beats.** | | #20 |
| 28 | 101.25 | 104.65 | 接头时通时断，二分就会失灵 | 12 | 13 | 2.81 | Close on one taped splice, flickering amber/grey. The test phone answers, then doesn't; the half-markers jump back and forth. Tag: "时通时断". | | #12, #21 |
| 29 | 104.75 | 108.05 | 回到电脑：只开[一半]服务，重启 | 12 | 14 | 2.81 | **Transition by the line:** the camera follows the wire back through the window to the laptop. The "后台服务" list: only the upper half ticked → restart spinner → half greys; again → a quarter; again → an eighth, on the beats (the same move as on the line). | callback | #26, #25 |
| 30 | 108.15 | 111.45 | 天亮前找到了：一个[同步服务] | 12 | 13 | 2.81 | One row stays amber and zooms forward: a generic sync icon labelled **"某网盘同步服务 · 示意"** (no brand). Its box un-ticks, the error dialogs are gone and the document sits clean. Outside, the rain stops and the sky turns blue-grey. At dawn the pole line is visible, and far off the tiny lineman closes his last splice (bookend). | payoff | — (the viewer's story, 示意) |
| 31 | 111.55 | 115.25 | 不必查遍，每次排除[一半] | 10 | 11 | 2.53 | Slow pull-back: laptop, window, the line of poles at dawn. A last soft halving sweep crosses the whole frame, grey settling and a single amber point left. **一半** turns gold. Hold. | payoff | #4, #25 |
| E | 115.87 | ~122 | *(Juno end card)* | | | | The wire draws itself into the **Juno end card** (J monogram, gold title, question, follow pill "关注 Juno · 一起看懂世界", sources). | **outro → FIN** | — |

---

## End card

- **Question for comments:** 这条断了的电话线，你在哪见过？
  - Alt: 你用"一次测一半"找到过什么？
- **@ prompt:** @那个电脑总出毛病的朋友
- **Sources line:**
  - US Army Signal School, *Testing Wire Lines and Locating Faults* (SS0437)
  - Microsoft Support KB 929135
  - git-scm.com, git-bisect
  - Linux kernel docs, *Bisecting a regression*
  - C. Couder, *Fighting regressions with git bisect* (2009)

---

## Every number or named claim on screen → facts row

| On screen | Value | Row | Status |
|---|---|---|---|
| 后台服务，测一半最省事 · 干净启动 | "the most efficient way to do this is to test half of them at a time" | #25 | OK |
| 只开一半服务，重启 | "Select each of the check boxes in the upper half of the Service list"; each restart rules out half | #26, #25 | OK |
| 10公里 · 每50米一根杆 (示意) · 200段 | 10 000 ÷ 50 = 200 spans | #1 | OK arithmetic; line is 示意 |
| 一段段查最坏200次 | worst case 200 | #3 | OK |
| 测一半最多8次 · 第8次只剩1段 (最坏情况) | 200 → 100 → 50 → 25 → 13 → 7 → 4 → 2 → 1 | #2, #4 | OK |
| 2的8次方 = 256 > 200 · 7次 128 不够 | 2^7 = 128 < 200 ≤ 256 | #2 | OK |
| 接线员没回应 → 先走到一半 | "proceed to halfway along the wire section that has the fault" | #7 | OK |
| 剪开线，接上电话，往两边各试 | "cut the wire … Test wire in both directions" | #8 | OK |
| 摇手柄，有人接 = 好的一边 | "turn handcrank rapidly … when operator answers, determine what side is good" | #9 | OK |
| 重复直到锁定那一段 | "repeat testing procedures until fault is narrowed down to the section" | #10 | OK |
| 每个剪口都要再接上 | "Retape or splice each opening made in the wire line" | #11 | OK |
| 二分查找 | "binary search algorithm" | #13 | OK |
| 线长一倍只多1次 · 400段 (示意) 8 → 9 · 100万 → 20 | 2^20 = 1 048 576 ≥ 1 000 000 | #5 | OK arithmetic |
| 哪一版改坏了软件 · git bisect | "find which commit in your project's history introduced a bug" | #13 | OK |
| Git文档：675个版本约10步 | "675 revisions left to test after this (roughly 10 steps)" | #14 | OK |
| 一位内核开发者：平均每天用一次 (Ingo Molnar) | "My average is roughly once a day." | #15 | OK, one person |
| 上万个版本 | 10928 revisions (example); 15 steps ≤ 32,768 | #18, #16 | OK / arithmetic |
| 大约15步 | "~15 step kernel bisection" | #16 | OK |
| 2¹⁵ = 32,768 · 3.2万 | arithmetic | #16 note | OK arithmetic |
| 最快20到30分钟，自动 | "in the best case … in 20-30 minutes, in an automated way" | #16 | OK |
| 只有一处坏 | algorithm assumes one "first bad commit" | #22 | OK |
| 判断错一次，后面全跑偏 | "getting this wrong just once will send the rest of the bisection totally off course" | #20 | OK |
| 接头时通时断 → 失灵 | "An intermittent open also occurs in poor splices"; non-deterministic bugs defeat bisection | #12, #21 | OK |
| 论文 · 天亮前 · 某网盘同步服务 | the viewer's own framing story | — | fiction frame, labelled 示意; no factual claim |

---

## Still open for the director

1. **L24 "3.2万"**: kept, at a mean line of 3.39 s (the note's threshold is ~3.4). If you'd rather have 30 lines, cut L24 and give its 3.1 s to L23 and L25; "2¹⁵ = 32,768" stays in the picture.
2. **L30 "一个同步服务"**: it answers the cold reader's "which item?". It is fictional and labelled 示意. If you think naming any category implies a claim about what usually breaks PCs, the fallback is "天亮前，找到了那[一项]" with the label kept only in the picture.
3. **Cold read on v2**: the gate-1 cold read was contaminated (the reader saw the plan). A clean one on lines.json alone is worth running before the owner sees it.
