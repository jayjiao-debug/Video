# Script: 200段线，最多查8次  (v1, unattended overnight run 2026-10-12)

**Logline:**
- It is the night before a deadline and your computer keeps throwing errors. A long list of background services could be the cause.
- Microsoft's own advice is odd: test half of them at a time.
- A US Army wireman with a dead telephone line does the same: walk to the halfway point, cut in, crank the phone, keep the side that answers, and repeat. On a line of 200 spans, that takes at most 8 checks.
- Linux kernel developers find a bad change among tens of thousands of versions in about 15 steps.
- It works only if there is one fault and every test is reliable.

**Takeaway:** 找一个错，不必查遍：从中间测，每次排除一半；200段只要8次，线长一倍只多1次。前提：只有一处坏，每次测试都可靠。

**Length:** lines run 0.00–114.40 s. The Juno end card runs 115.87–~122 s (FIN 121.95). Total ≈ 122 s.

**Music map** (series track `bgm.mp3`, played from 0, untouched):
- intro 0–16.625 (beat 1 at 0.441)
- **drop 1 at 16.625 (title)**
- main from 20.689
- breakdown 49.041
- build 63.205
- **silent gap 79.412–81.432**
- **drop 2 at 81.432 (reveal)**
- outro 115.868 (end card)
- FIN 121.951
- One bar ≈ 2.03 s.

**Checks (run before hand-in):**
- `pace.py lines_arr.json --film-end 122` found no line too fast and 0 % waiting. It flagged only the two allowed gaps: the title (16.40–20.80) and the silent gap (79.30–81.45).
- `facts.py script.md --lines lines_arr.json` result is listed under "Every number on screen".
- Every line is ≤ 16 glyphs, counting punctuation and digits. The longest are L24 and L29, at 16.
- `lines.json` uses the object format `{start, end, text}`. `lines_arr.json` has the same lines as `[[s,e,"text"]]`. `[...]` marks gold keywords.

**Visual through-line: one wire.**
- The divider in the computer's service list becomes the telephone wire.
- The wire becomes the strip of code versions, and it leads back to the computer at dawn.
- Two colours carry the logic everywhere:
  - **amber** = still suspected
  - **cool grey** = ruled out
- Every halving is one move: half of the amber goes grey. The same move repeats in all three worlds (service list, pole line, version strip), so the viewer learns it once and recognises it twice.
- Gold is only for subtitle keywords.
- Transitions follow the wire (push along it, through the window, into the screen). No hard cuts.

---

## Decisions taken without the owner (unattended run): please check

1. **Opening world.** The film opens on the viewer's own laptop the night before a deadline (owner rows 22, 45, 47, 48), not on the phone line.
   - The phone line arrives at L4 as "the same trick, done by hand".
   - Reason: a 20-year-old says "这说的就是我" about a computer that keeps failing, not about a military line.
2. **8-second hook.** No sourced number exists for the computer story, and I did not invent one (for example, a service count).
   - The first concrete image is at **5.9 s**: half of the list greys out in one move as "一次测一半" appears.
   - The numbers arrive at 11.6 s (200) and 14.3 s (8).
   - If the director insists on a number before 8 s, the fix is to swap L2 out and pull L5–L6 earlier. That would cost the "which one is it?" beat.
3. **"美军通信兵手册"**, not facts row 7's suggested "教材". I chose this because "教材" could read as a school textbook, which the owner rule forbids signalling. SS0437 is an Army training subcourse, so "手册" (manual) is accurate enough. No year is shown.
4. **The textbook classic is never named.** The phone-line scenes show a real-looking rainy night: a line of poles across fields, one lineman and a lit hut at the far end. There are no worksheets, no "题", no "课本". Recognition is invited only by the end-card question.
5. **200 spans, not 200 poles.** On screen it is always "200段". The picture labels read "10公里 · 每50米一根杆 · 示意" (row 1). "第8次只剩1段" is labelled 最坏情况 in the picture (row 2).
6. **The brief's working title "一夜修好电话线" is not offered.** No source says the line was fixed in one night, so "一夜" would overclaim. "天亮前" in L37 belongs to the viewer's own laptop story, which is our fictional framing and is not presented as a fact.
7. **"最好的情况" applies to the minutes, not the steps.** Molnar says "in the best case i can get a ~15 step kernel bisection done in 20-30 minutes". So L28 says "大约15步", and the best case goes on L30 ("最快20到30分钟").
8. **"上万个版本" in L26** rests on Couder's example ("10928 revisions … roughly 14 steps", row 18) and on 15 steps covering up to 32,768 (row 16, arithmetic). It does not claim the size of any specific kernel bisection.
9. **Left out on purpose (not cut for lack of time):**
   - Victorian cables and Varley (rows 27–32): they are not bisection, and the owner wants no map.
   - Java's 9-year bug (row 34)
   - Mozilla (row 24)
   - RUS sectionalizing (row 33)
   - "Linus invented it" (row 19)
   - skipping untestable versions (row 23)
   - Christmas lights (row 38, UNVERIFIED)
   - all UNVERIFIED rows (35 "1946", 36, 37)

---

## Title options (≤ 10 字)

1. **200段线，最多查8次** (recommended)
   - It is the paradox itself in two concrete numbers: 200 places, and at most 8 checks.
   - The gap makes people ask "how?", and the film answers exactly that.
   - It is literally true: 8 is the worst case for 200 spans (2⁸ = 256 ≥ 200), and "最多" says so.
   - The picture on drop 1 is simply the pole line with the plaque on the wire.
2. **电话线断在哪？**
   - This is the situation as a question, the same pattern as the owner's pond pick 《池塘里有多少条鱼？》.
   - Viewers who did the rainy-night exercise recognise it without being told.
   - Weakness: it hides the computer and the payoff, so it reads as a puzzle rather than something useful.
3. **一次测一半**
   - These are Microsoft's own words (row 25), short and slightly odd ("why half?"). They describe the method in every world of the film: computer, line and code.
   - Weakness: it has no number and no stakes, so it is quieter as a hook.

**Title-card sub-line (all options):** 每测一次，排除一半

---

## Beat sheet

| Beat | Time | Purpose | What the viewer learns / feels |
|---|---|---|---|
| Hook (tiny story) | 0–16.4 | Your situation, why it matters, what you'll get | Deadline night, the computer errors, a long list: "which one?" (dread). Microsoft says test half at a time (odd). A wireman does the same: 200 spans, one by one up to 200 checks, by halves **at most 8**. |
| Title | 16.6–20.7 | Drop 1 | 《200段线，最多查8次》: the plaque hangs on the wire |
| Setup: the procedure | 20.8–41.4 | What is done, and why each step | The line is dead. Walk to the middle, cut in, test both ways; the side that answers is good. Go to the middle of the bad half and repeat. Every test leaves a cut to re-splice, so fewer tests matter. |
| Why 8 | 41.5–51.7 | The arithmetic, plainly | Each test halves what is left: 200 → 100 → … → 1 in 8. 2⁸ = 256 > 200. The name: 二分查找. |
| Twist | 51.8–57.1 | Counter-intuitive scaling | Double the line and you add only **one** check. A million places need only 20. |
| Evidence 1: your PC | 57.2–62.7 | Back to the viewer | Microsoft's clean boot: tick half the services; each restart rules out half. |
| Evidence 2: code | 63.25–79.3 | Build | Programmers hunt "which change broke it"; the Git command is called bisect; 675 versions ≈ 10 steps; a kernel developer uses it about daily; tens of thousands of versions, one bad: how many tries? |
| Silence | 79.4–81.4 | Breath | A huge strip of version ticks, dead still |
| Reveal | 81.45–93.3 | Drop 2 | **About 15 steps.** 15 halvings cover 32,768 versions; best case 20–30 minutes, automated; "unconditional goodness". |
| The catch | 94.1–105.5 | When it fails | Only one fault, and every test must be right. One wrong answer sends the rest off course. A splice that comes and goes breaks it. |
| Ending | 105.6–114.4 | Callback + takeaway | Back at the laptop: half, then half again. Before dawn, the one item is found. You don't check everything; you rule out half each time. |
| End card | 115.87–~122 | Comment bait | Question below |

---

## Lines

- **Chars** = the units `pace.py` counts: Chinese characters, plus one per number and one per English word.
- **Needs** = 0.5 + n/7 + 0.6 s.
- **Glyphs** = the full count for the ≤ 16 rule, including punctuation and digits.
- People on screen:
  - The **viewer**: first-person, so no body is drawn (no hands; owner row 9).
  - **The lineman**: one 2D figure in a plain rain cape with a field telephone. No weapons and no combat kit (facts Risks). Pose-checked.

| # | Start | End | Line (≤ 16 字) | Chars | Glyphs | Needs | Picture (what the viewer sees) | Beat · music | Fact # |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0.00 | 2.84 | 明早交论文，电脑却一直报错 | 12 | 13 | 2.81 | **Frame 0:** first-person POV. A laptop screen fills ~80 % of the frame on a dark desk with a lamp glow and rain streaking the window behind. The thesis document is open; the title is illegible, "论文.docx". **Beat 1 (0.44 s):** a generic, drawn error dialog (not real Windows UI) pops onto the document. A second one follows on the next beat. | intro · hit on beat 1 | — (the viewer's story) |
| 2 | 2.94 | 5.78 | 后台一长串，是哪一项引起的？ | 12 | 14 | 2.81 | The dialogs slide aside. Behind them, a long checklist of background services scrolls up and up (illegible generic labels, ticked boxes), all tinted **amber** = suspect. The scroll bar shrinks to a sliver. | intro | #25 (services list exists) |
| 3 | 5.88 | 8.72 | 微软官方：一次测[一半]最省事 | 12 | 13 | 2.81 | A small source card: "Microsoft 支持 · 干净启动" (text only, no logo). The list snaps to its middle and **the lower half turns cool grey in one move**. A thin divider line glows between the halves. | intro · first concrete image | #25 |
| 4 | 8.82 | 11.52 | 通信兵修电话线，也这样找 | 11 | 12 | 2.67 | **Transition by the line:** the camera pushes into the glowing divider. It becomes a wire, runs out through the rainy window and stretches across dark fields as a **telephone line on poles**, with a lit hut far away. Near end: the 2D lineman in a rain cape, field telephone at his feet. | intro, rising | #7 |
| 5 | 11.62 | 14.17 | [200]段线，逐段查最坏200次 | 10 | 15 | 2.53 | The camera trucks along the line. Spans light amber one by one as a counter ticks "逐段查 1, 2, 3 …" crawling toward 200. Labels: "10公里 · 每50米一根杆 · 示意". | intro | #1, #3 |
| 6 | 14.27 | 16.40 | 测一半：最多[8]次 | 7 | 8 | 2.10 | Fast: a cut mark at the middle, half the line greys; then the next half, and the next, ticking on the beats (200 → 100 → 50 → … → 1). A second counter "二分 1 … 8" finishes while the crawling counter is still near 3. From ~15.6 s the camera **accelerates along the wire** toward the one remaining amber span. | pre-drop | #2, #4 |
| T | 16.63 | 20.69 | *(title card)* | | | | **Drop 1:** the amber span flares. A framed plaque, styled like a lineman's metal tag, swings onto the wire between two poles: **200段线，最多查8次**, with the sub-line **每测一次，排除一半**. Rain sparkles in the light. | **DROP 1** | #1, #2 |
| 7 | 20.80 | 23.70 | 线不通了，那头接线员没回应 | 12 | 13 | 2.81 | At the near end, the lineman cranks the field telephone and listens. **Inset (far end):** a switchboard in the lit hut with no light on. The whole line is amber. | main | #7 |
| 8 | 23.80 | 26.70 | 美军通信兵手册：先走到[一半] | 12 | 13 | 2.81 | Card: "美军通信兵手册 · SS0437" (no year). The camera follows the lineman along the line, with a half-way marker ahead ("5公里 · 示意"). He does **not** stop at the first pole. | main | #7 |
| 9 | 26.80 | 29.84 | 剪开线，接上电话，两头各试一次 | 13 | 15 | 2.96 | At the mid-pole the lineman (pose-checked: standing, both hands on the wire and clips) cuts the wire and clips the test phone on. Two small arrows point left and right: "这边？" "那边？" | main | #8 |
| 10 | 29.94 | 32.98 | 摇手柄：哪边有人接，哪边是好的 | 13 | 15 | 2.96 | He cranks. Left: the hut's lamp lights and a speech mark "喂？" comes back along the wire, so that half turns **amber → good** (it greys out; ruled out). Right: silence. The fault is on the right. | main | #9 |
| 11 | 33.08 | 35.84 | 坏的那半，再走到它的一半 | 11 | 12 | 2.67 | The camera glides with him to the middle of the right half (a quarter mark). The left half stays grey behind them. | main | #7, #10 |
| 12 | 35.94 | 38.41 | 重复，直到锁定那一段 | 9 | 10 | 2.39 | Time-lapse: cut, crank, half greys; cut, crank, half greys. The amber shrinks to **one span** between two poles, where a broken wire hangs in the rain. | main | #10 |
| 13 | 38.51 | 41.41 | 修好后，每个剪口都要再接上 | 12 | 13 | 2.81 | The camera pulls back along the line: at every test point a **small taped splice** glints (8 of them). A tag reads "每测一次 = 一个剪口". | main | #11 |
| 14 | 41.51 | 44.12 | 每测一次，剩下的少[一半] | 10 | 11 | 2.53 | The line straightens into a clean horizontal ribbon of 200 tick-spans across the frame (diagram mode, same colours). | main | #4 |
| 15 | 44.22 | 46.83 | 200段，第[8]次就只剩1段 | 10 | 13 | 2.53 | **Play it on the beats:** "200 → 100 → 50 → 25 → 13 → 7 → 4 → 2 → 1". Each step greys half of the amber, with a step counter 1…8 and a small tag "最坏情况". | main | #2, #4 |
| 16 | 46.93 | 49.40 | 2的8次方＝[256]，大于200 | 9 | 15 | 2.39 | Above the 200-span ribbon, a second bar doubles 8 times (2, 4, 8 … 256) and ends **longer than the ribbon**: "2⁸ = 256 ≥ 200". Small note under it: "7次：128，不够". | main → breakdown 49.04 | #2 |
| 17 | 49.50 | 51.69 | 这招叫[二分查找] | 7 | 7 | 2.10 | The two bars fold into a framed heading **二分查找**, cut in at the midpoint of a wire. | breakdown | #13 |
| 18 | 51.79 | 54.40 | 线再长一倍，只多查[1]次 | 10 | 11 | 2.53 | **Play it:** the ribbon doubles in length (400 段 · 示意). The step counter goes **8 → 9** and the "逐段" counter jumps 200 → 400. | breakdown · twist | #5 |
| 19 | 54.50 | 57.11 | [100万]个位置，也只要[20]次 | 10 | 14 | 2.53 | Zoom out: the ribbon becomes a band of a million fine ticks. Two counters sit side by side: "逐个查：最坏100万次" vs "二分：20次". | breakdown | #5 |
| 20 | 57.21 | 60.11 | 电脑也一样：先只勾[一半]服务 | 12 | 13 | 2.81 | **Transition by the line:** the band narrows back into the single wire, which runs in through the rainy window to the laptop. The checklist from L2 is back; only the **upper half is ticked**. | breakdown | #26 |
| 21 | 60.21 | 62.70 | 重启一次，就排除[一半] | 9 | 10 | 2.39 | A restart spinner turns, and half of the amber list greys (the same move as on the line). | breakdown | #25 |
| 22 | 63.25 | 66.27 | 程序员用它找：哪次改动出了错 | 13 | 14 | 2.96 | **Build.** The list's rows tilt and slide into a **horizontal strip of version tiles** (small cards with dot-codes, no real code), marching off to the right. One tile somewhere is the culprit, but nothing marks it. | **build 63.2** | #13 |
| 23 | 66.37 | 68.68 | Git里这条命令叫[bisect] | 8 | 15 | 2.24 | A generic monospace prompt line (episode palette, no logos) types `git bisect`. Translation tag: "bisect = 一分为二". | build | #13 |
| 24 | 68.78 | 71.51 | 官方示例：675个版本，约10步 | 11 | 16 | 2.67 | Source card "git-scm.com 官方文档示例". The strip shows 675 tiles; the prompt prints "675 … roughly 10 steps", and the amber halves on beats. | build | #14 |
| 25 | 71.61 | 74.63 | 内核开发者：平均每天用它一次 | 13 | 14 | 2.96 | Text-only name card: "Ingo Molnar · Linux 内核开发者 · 据 Couder 2009". **No likeness, no penguin.** A small calendar strip ticks one mark per day. | build | #15 |
| 26 | 74.73 | 77.46 | 上万个版本里，藏着一个错 | 11 | 12 | 2.67 | The camera pulls far back: the strip becomes **tens of thousands of fine tiles**, wider than the frame, all amber. | build | #18, #16 |
| 27 | 77.56 | 79.30 | 要查几次？ | 4 | 5 | 1.67 | Hold on the enormous strip. A step counter reads "0". | build peak | — |
| — | 79.41 | 81.43 | *(no subtitle)* | | | | **Silence.** Everything stills; only the huge amber strip and "0". | **SILENT GAP** | — |
| 28 | 81.45 | 83.54 | 大约[15]步 | 4 | 5 | 1.67 | **Drop 2:** the strip halves in great sweeps, one per beat, grey flooding in from alternating sides. The step counter lands big at **"≈ 15 步"** on the drop, then keeps ticking to the last amber tile. | **DROP 2** | #16 |
| 29 | 83.64 | 86.88 | 15次对半，能分清[3.2万]个版本 | 12 | 16 | 2.81 | The doubling bar from L16 returns at scale: "2¹⁵ = 32,768". It overlays the strip and covers it end to end. | | #16 (arithmetic) |
| 30 | 86.98 | 90.07 | 最快[20到30]分钟，自动跑完 | 11 | 14 | 2.67 | A clock face sweeps 20–30 min while the prompt runs by itself. Tag: "最好的情况 · 自动". | | #16 |
| 31 | 90.17 | 93.27 | 他说：这是“无条件的好东西” | 11 | 14 | 2.67 | A quote card in the name-card style: "“unconditional goodness” — Ingo Molnar", with the Chinese under it. Text only. | | #17 |
| — | 93.27 | 94.07 | *(pause)* | | | | The last amber tile becomes a **raindrop** and falls; the camera follows it down into the rainy night and the pole line. | breath | — |
| 32 | 94.07 | 96.42 | 但这招有个[前提] | 7 | 7 | 2.10 | Back on the line at night. The lineman stands at a mid-pole with the test phone. | | #20, #22 |
| 33 | 96.52 | 99.44 | 只能有[一处]坏，测试还得准 | 11 | 12 | 2.67 | Two conditions float as icons by the wire: "① 只有一处坏" "② 每次测试都可靠". | | #22, #20 |
| 34 | 99.54 | 102.32 | 判断错一次，后面全[跑偏] | 10 | 11 | 2.53 | **Play it:** one wrong reading (a "喂？" misheard from the faulty side). The **wrong half greys out, with the real break inside it**. The amber search marches off the other way while the break stays hidden in the grey. Tag: "错1次". | | #20 |
| 35 | 102.42 | 105.48 | 接头时通时断，二分就会失灵 | 12 | 13 | 2.81 | Close on one taped splice, flickering amber/grey. The test phone answers, then doesn't; the half-markers jump back and forth. Tag: "时通时断". | | #12, #21 |
| 36 | 105.58 | 108.79 | 回到那台电脑：测一半，再测一半 | 13 | 15 | 2.96 | **Transition by the line:** the camera follows the wire back through the window to the laptop. The checklist halves on the beats (half, quarter, eighth …). | callback | #25, #26 |
| 37 | 108.89 | 111.52 | 天亮前，找到了那[一项] | 9 | 10 | 2.39 | One item stays amber. Its box un-ticks, the error dialogs are gone and the document sits clean. Outside the window the rain stops and the sky turns blue-grey. At dawn the pole line is visible, and far off the tiny lineman closes his last splice (bookend). | payoff | — (the viewer's story) |
| 38 | 111.62 | 114.40 | 不必查遍，每次排除[一半] | 10 | 11 | 2.53 | Slow pull-back: laptop, window, the line of poles at dawn. A last soft halving sweep crosses the whole frame, with grey settling and a single amber point. **一半** turns gold. Hold. | payoff | #4, #25 |
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
| 一次测一半最省事 · 干净启动 | "the most efficient way to do this is to test half of them at a time" | #25 | OK |
| 先只勾一半服务 · 重启一次排除一半 | "Select each of the check boxes in the upper half of the Service list"; each restart rules out half | #26, #25 | OK |
| 10公里 · 每50米一根杆 (示意) · 200段 | 10 000 ÷ 50 = 200 spans (201 poles) | #1 | OK arithmetic; the line is 示意 |
| 逐段查最坏200次 | worst case 200 | #3 | OK |
| 最多8次 · 第8次只剩1段 (最坏情况) | 200 → 100 → 50 → 25 → 13 → 7 → 4 → 2 → 1 | #2, #4 | OK |
| 2的8次方 = 256 > 200 · 7次 128 不够 | 2^7 = 128 < 200 ≤ 256 | #2 | OK |
| 接线员没回应 → 走到一半 | "proceed to halfway along the wire section that has the fault" | #7 | OK |
| 剪开线，接上电话，两头各试 | "cut the wire … Test wire in both directions" | #8 | OK |
| 摇手柄，有人接 = 好的一边 | "turn handcrank rapidly … when operator answers, determine what side is good" | #9 | OK |
| 重复直到锁定那一段 | "repeat testing procedures until fault is narrowed down to the section" | #10 | OK |
| 每个剪口都要再接上 | "Retape or splice each opening made in the wire line" | #11 | OK |
| 二分查找 | "binary search algorithm" | #13 | OK |
| 线长一倍只多1次 · 100万个位置 20次 | 2^20 = 1 048 576 ≥ 1 000 000 | #5 | OK arithmetic |
| 400段 (示意) · 8 → 9 | doubling adds one check | #5 | arithmetic, labelled 示意 |
| 哪次改动出了错 · git bisect | git docs | #13 | OK |
| 675个版本，约10步 | "675 revisions left to test after this (roughly 10 steps)" | #14 | OK |
| 平均每天用一次 (Ingo Molnar) | "My average is roughly once a day." | #15 | OK |
| 上万个版本 | 10928 revisions (example); 15 steps ≤ 32,768 | #18, #16 | OK / arithmetic |
| 约15步 | "~15 step kernel bisection" | #16 | OK |
| 2¹⁵ = 32,768 · 3.2万 | arithmetic | #16 note | OK arithmetic |
| 最快20到30分钟，自动 | "in the best case … in 20-30 minutes, in an automated way" | #16 | OK |
| "无条件的好东西" / "unconditional goodness" | Molnar quote | #17 | OK |
| 只有一处坏 | algorithm assumes one "first bad commit" | #22 | OK |
| 判断错一次，后面全跑偏 | "getting this wrong just once will send the rest of the bisection totally off course" | #20 | OK |
| 接头时通时断 → 失灵 | "An intermittent open also occurs in poor splices"; non-deterministic bugs defeat bisection | #12, #21 | OK |
| 论文 · 天亮前找到 | the viewer's own framing story | — | fiction frame, no factual claim |

---

## Still unresolved / for the director

1. **8-second rule (decision 2).** The first number comes at 11.6 s, and a concrete image comes at 5.9 s. Please judge whether the halving image is enough.
2. **L34 "跑偏".** This is plain colloquial Chinese for "off course" (the kernel doc's wording), not internet slang. If the director reads it as too casual, replace it with "后面全[走错]". It keeps the same length.
3. **L23 "bisect".** It counts as 1 unit for pace and 6 glyphs. If the director wants no English in subtitles, use "这条命令，名字就叫[二分]" (n = 10, needs 2.53, i.e. +0.29 s; it fits inside the build segment's 0.38 s of slack).
4. **Lineman figure:** one 2D figure, few poses (standing at a pole, walking, cranking). It must pass `pose_check.mjs`. If it reads poorly, the story still works with the figure seen small and from behind.
