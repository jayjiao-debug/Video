# Gate 1 notes: 200段线，最多查8次 (script v1 / lines.json): verdict REVISE

One round should be enough. The facts are clean. Two problems are ones the owner has sent films back for before: the numbers arrive late, and the lines are too dense for his reading pace. The other notes are one-line swaps.

Scores (rubric 1–5, only the areas this gate covers):
- script **3**: clear and correct, but the paradox lands late and lines are packed. Expect 4–5 once notes 1–3 are in.
- info **4** (planned): the amber/grey halving, the doubling bar overtaking the ribbon and the 8 → 9 counter all pass the 5-second test on paper.
- visual, edit, motion and sound are not scored at this gate.

Round 1, so there is no earlier version to compare. **No cold-read was provided for this gate.** The producer should run one on v2 before it goes to the owner.

## Fact trace (gate 1 check)

Every number and named claim in lines.json traces to an OK row of facts.md:
- 一次测一半最省事: #25
- 200段: #1, 示意 on the picture
- 最坏200次: #3
- 最多8次 / 第8次只剩1段: #2, #4; 最坏情况 shown on the picture
- 256 > 200, 7次 128 不够: #2
- the wireman steps (走到一半, 剪开, 两头各试, 摇手柄, 重复, 每个剪口再接上): #7–#11
- 二分查找: #13
- 线长一倍多1次 / 100万→20: #5
- 先勾一半服务 / 重启排除一半: #26, #25
- 675 → 约10步: #14
- 每天一次: #15 (see note 3)
- 上万个版本: #18, #16
- 约15步 / 最快20到30分钟 / 自动: #16
- 无条件的好东西: #17
- 一处坏 / 判断错一次全跑偏 / 时通时断: #22, #20, #12, #21

Checks on what the script avoids:
- No UNVERIFIED row is used. 1946, 10 %, Murray loop, Christmas lights, Linus's year and Varley-as-bisection are all absent.
- The traps in facts.md are handled: 200 spans not poles, the worst-case 8, no year for SS0437, "最快" tied to the minutes and not the steps.
- `facts.py`: no problems.
- One wording fails the plain-reading test: L25 (note 3).

Side remark, no action: 10 km with a pole every 50 m on a rainy night is the classic textbook phone-line problem. The script never says so, which is right (owner row 73). Some viewers will remember "7次" from the textbook, which narrows to 1–2 poles, not 1 span. Our 8 for one span is correct, and the picture's 最坏情况 tag covers it. It will just bring comments.

## Answers to the screenwriter's open questions

1. **Is the halving image at 5.9 s enough for the 8-second rule?** No; see note 1.
2. **L34 "跑偏"**: keep it. It is plain standard Chinese and it is the kernel doc's meaning.
3. **L23 "bisect"**: cut the line (note 2). Let the picture type `git bisect` with its "bisect = 一分为二" tag.
4. **Lineman**: fine as planned. See note 7 for gate 2a.

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | **major** | Hook, L1–L6 (0–16.4 s) | **The paradox arrives too late.** The first number (200) comes at 11.6 s and the payoff (8) at 14.3 s. The rubric's 5 needs the numbers by ~8 s, and the owner's formula wants the contradiction on screen by ~3 s. Re-cut the hook (the line texts are already pace-checked):<br>• **L1** 0.00–2.84 stays. Picture: the long amber service list is already visible behind the error dialogs on frame 0. A scrollbar sliver and a hunting cursor carry "哪一项？", so it needs no line.<br>• **Drop L2 as a subtitle.**<br>• **L3 moves to 2.94–5.78**: "微软官方：一次测[一半]最省事". Half the list greys on the beat at ~3.5 s.<br>• **L4 moves to 5.88–8.72**: "通信兵修电话线，也这样找". Same wire push-through.<br>• **New L5 at 8.82–~12.4**: "[200]段线，测一半最多[8]次" (13 glyphs).<br>• **New L6 at ~12.5–16.4**: "一段段查，最坏要200次" (12). The two counters race and 二分 hits 8 while 逐段 crawls at ~3. Then the camera accelerates along the wire into the drop as planned.<br>Result: halving image by ~3.5 s and 200 vs 8 by 8.8 s, with 3.9 s of room for the racing-counter payoff. If you prefer to keep 8 as the last word before the drop, swap the two new lines, but keep 200 on screen by ≤ 9 s. | screenwriter | Rows 22 and 47 (contradiction by 3 s, number on the picture); rubric 1 anchor 5 (number in first ~8 s) |
| 2 | **major** | Whole film | **Too dense for this owner.** There are 38 lines at a mean of 2.8 s each with 0 % waiting. After ep14 v17 the owner said "节奏太快有点看不过来" and set ~8 beats (≈ 4 s) per line after the title, 10–12 beats for visual payoffs, and ~20 % waiting as fine. Cut repeats and low-value lines; each item below adds nothing new:<br>• **L2**: see note 1.<br>• **L14** "每测一次，剩下的少一半": repeats L6/L11. L15's on-beat play shows it.<br>• **L20–21** (the mid-film return to the PC): repeats L3, and L36–37 do the PC callback. Go straight from the million-tick band (L19) into the version-tile strip (L22) as a shape match on the build. Give L19's 100万 vs 20 payoff the freed seconds.<br>• **L23** "Git里这条命令叫bisect": cut. Rename L24 to **"Git文档：675个版本约10步"** (16), so the tool is named once.<br>• **L31** (the Molnar quote): adds no new idea. "他" is ambiguous 20 s after an unnamed "内核开发者", and "无条件的好东西" reads as translationese. Cut it; the raindrop transition starts after L30.<br>• **L32 + L33 merge** into **"前提：只能有[一处]坏，测试得准"** (14).<br>That leaves 31 lines. Re-time inside the fixed anchors: title at 16.625, "大约15步" at 81.432, end card at 115.87. Payoff lines get 10–12 beats: the racing counters, L15, L19, L28 and the L34 wrong-turn play. Re-run `pace.py`; expect ~12–20 % waiting and no TOO FAST. If the mean line is still under ~3.4 s, also move L29's "3.2万" onto the picture only (2¹⁵ = 32,768 bar) and cut the line. | screenwriter | Row 65 (~2:00, ≈ 4 s/line); row 12 "保留精华" (cut repeats) |
| 3 | **major** (facts) | L25 (71.6 s) "内核开发者：平均每天用它一次" | The plain reading is "kernel developers (in general) use it daily". The source is one person's habit (Molnar, #15). Change it to **"一位内核开发者：平均每天用一次"** (15). The text name card "Ingo Molnar · 据 Couder 2009" stays in the picture. | screenwriter | Row 11 (plain reading = what the source shows); row 32 |
| 4 | minor | L8 "美军通信兵手册" | SS0437 is an Army training subcourse. The field manual it cites (FM 24-20) was not opened, so "手册" names a document we haven't read. Use **"美军通信兵教程：先走到[一半]"** (13). "教程" does not signal a school textbook, and the card stays "SS0437", no year. | screenwriter | Row 32 (never state more than the source) |
| 5 | minor | L7–L10 picture | **Picture logic.** "哪边有人接，哪边是好的" only works if someone can answer at **both** ends of the line. The picture has one hut (far end, L4/L7), while L10 has the left side answer from the hut. Put a station at each end: the lit hut at one end and the switchboard he set out from at the other. Make the side that answers the side whose station lights, consistent with his walking direction. | screenwriter (picture column) → art-director | Row 13 (each beat clear alone); rubric 3 (diagram readable without the subtitle) |
| 6 | minor | L29 (if kept after note 2) | "3.2万" is a safe under-statement of 32,768 (≈ 3.3万) and it is true as written. Keep it, or say "3万多". No change needed if L29 moves to the picture. | screenwriter | none |
| 7 | minor (for gate 2a) | Picture column, both worlds | **Heads-up for the looks.** Every scene is night and rain (the desk lamp, the rainy line), which drifts toward the series' default navy-night-and-gold (looks.md observation) and toward "too dark" (row 71, ep21 v1 at 27/255). Keep a mid-tone sky: rain at dusk or blue hour, lit poles and the hut, and check mean luminance on the style frames. Draw the lineman in profile so his direction reads (row 52). Keep hands minimal and pose-checked (rows 9 and 74); the fallback of showing him small from behind is acceptable. | art-director | Rows 9, 52, 71, 74; looks.md |

## Titles: ranking

1. **200段线，最多查8次** (top; use it for the feed, the cover and the drop-1 plaque). It is the paradox in two concrete, true numbers ("最多" = worst case, #2). It makes viewers ask "how?" without misleading, and the film answers exactly that.
2. **一次测一半**. These are Microsoft's own words (#25) and they cover all three worlds (PC, line, code). But it has no number and no stakes, and it gives away the takeaway.
3. **电话线断在哪？** This is the classic exercise's own question. It hides the payoff, and it is about a phone line no 20-year-old has. It fails the "这说的就是我" test (row 45) and leans on textbook recognition, which row 73 allows only in the end-card question.

End-card question: keep "这条断了的电话线，你在哪见过？". It is the row-73 pattern: recognition is invited only at the end.

## What must not change (it works)

- **The opening world**: the viewer's own laptop the night before a deadline, with a subtitle on frame 0 and an error dialog on beat 1 (0.44 s). The phone line is introduced as "the same trick, done by hand" (rows 22, 45, 47).
- **The textbook is never named**: no 题, 课本 or worksheets. The rainy-night pole line is shown as real.
- **The fact handling**:
  - "200段" never "200根杆", with "10公里 · 每50米一根杆 · 示意".
  - 最坏情况 on the 8.
  - "最快" bound to 20–30 minutes.
  - No year on SS0437.
  - No likeness of Molnar.
  - No Penguin, Java or Firefox logos and no real Windows UI.
  - No map, nothing about Varley or the Victorian cables.
- **The army source shown plainly**: the wireman's real procedure (走到一半 → 剪开 → 两头各试 → 摇手柄有人接 = 好的一边 → 重复 → 每个剪口再接上). L13 (each test leaves a splice, so fewer tests matter) is the WHY and must stay.
- **The visual grammar**:
  - amber = suspected, grey = ruled out, one halving move repeated across the PC, the line and the code.
  - Gold only for subtitle keywords.
  - Every world change goes along the wire: divider → wire → window → laptop.
- **The arithmetic shown plainly**:
  - 200 → 100 → … → 1 on the beats.
  - The 2⁸ = 256 bar overtaking the 200 ribbon, with "7次：128，不够".
  - 8 → 9 when the line doubles.
  - 100万 → 20.
- **The music map**:
  - title plaque (a lineman's metal tag on the wire) on drop 1 at 16.625
  - "要查几次？" then the silent gap, then "大约15步" on drop 2 at 81.432
  - Juno end card at 115.87 with "关注 Juno · 一起看懂世界"
- **The catch, played rather than told**: L34 (one wrong reading greys the half that holds the break) and L35 (the flickering splice).
- **The ending**: the dawn callback with the one item found and the far-off lineman closing his last splice, then L38 "不必查遍，每次排除[一半]".
- **Line length**: every line stays at ≤ 16 glyphs.
