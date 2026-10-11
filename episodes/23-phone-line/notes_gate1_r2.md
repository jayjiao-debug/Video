# Gate 1 notes: 200段线，最多查8次 (script v2 / lines.json, 31 lines): verdict APPROVE (with fix-at-storyboard notes)

Round 2 of 2 tonight. The script now does what the owner asks for, and every number traces to an OK row. What is left: two line cuts, which are deletions only and add no new text; one attribution card; one picture-logic fix; and a cold read that has not been run yet. None of these needs another gate-1 round. Apply them to `lines.json` / the picture column **before the storyboard is written**, so the art director works from the final lines.

Scores (rubric 1–5, only the areas this gate covers): script **4** · info **4** (planned) · visual, edit, motion and sound are not scored at this gate.

## Compared with round 1 (v1 → v2)

- **Script: 3 → 4. v2 is better.**
  - The halving image is on screen at ~3.5 s; it was at 5.9 s.
  - 200 vs 8 is spoken by 8.8 s; it was at 11.6–14.3 s. The racing counters fill 12.6–16.4 s into drop 1.
  - Seven repeats or low-value lines are gone: L2 as a subtitle, L14, L20–21, L23, L31, and L32+L33 merged.
  - The Molnar line now reads as one person.
  - The cold reader's "a long list of what?" is answered at 2.94 s ("后台服务").
  - "两头" became "往两边".
  - The found item is named and labelled 示意.
- **Why it is not 5:**
  - The contradiction still lands at 8.8 s, not ~3 s (owner row 47). This is accepted: the halving image at 3.5 s carries the first 3 s, and it meets the rubric's ~8 s anchor.
  - Lines are still slightly dense: mean 3.39 s per line, against the owner's ≈ 4 s (row 65). Notes 1–2 fix this.
  - The programmer stretch (63–92 s) is the one long section without the viewer's own story. That is the cold reader's second swipe zone.
- **Info: 4 → 4.** The plan is unchanged and still passes the 5-second test on paper.
- **Pace (re-run `pace.py lines_arr.json --film-end 122`):**
  - Waiting is 11.4 s = 9 %. Nothing is TOO FAST.
  - The MINOR holds sit only on the planned payoffs.
  - The two CHECK gaps are the title and the silent gap, both named visual beats.
  - Every line is ≤ 16 glyphs (checked).
- **Cold read:** `coldread_gate1.json` is a v1 read, and it is contaminated (the reader saw the plan). I checked each of its confusions against v2:
  - **Fixed:** L2 list, "两头", crank (now carried by the picture inset), Git (card), "他"/quote (cut), "which item".
  - **Not fixed:** "内核开发者: which kernel? who?" (note 2).
  - There is no clean cold read of v2 (note 5).

## Fact trace (v2, every number and named claim)

| Line | Claim | facts.md row | OK? |
|---|---|---|---|
| L2 | 微软：后台服务，测一半最省事 | #25 | OK |
| L3 | 通信兵修电话线，也这样找 | #7 | OK |
| L4 | 200段 · 最多8次 | #1 (示意 label), #2 (最坏情况 tag) | OK |
| L5 | 最坏200次 | #3 | OK |
| L6–L12 | 那头没回应 → 走到一半 → 剪开、往两边试 → 摇手柄、有人接 = 好的 → 重复 → 剪口再接上 | #7, #8, #9, #10, #11 | OK; "教程" + "SS0437", no year |
| L13 | 第8次只剩1段 | #2, #4 | OK; 最坏情况 on the picture |
| L14 | 2⁸ = 256 > 200 (picture: 7次 128 不够) | #2 | OK |
| L15 | 二分查找 | #13 | OK |
| L16 | 线长一倍只多1次 (400段 示意, 8 → 9) | #5 | OK (2⁸ < 400 ≤ 2⁹) |
| L17 | 100万 → 20 | #5 | OK |
| L18 | 程序员用它找哪一版改坏了软件 | #13 | OK |
| L19 | Git文档：675个版本约10步 | #14 | OK |
| L20 | 一位内核开发者：平均每天用一次 | #15 | OK as worded, but see note 2 (cut) |
| L21 | 上万个版本 | #18 (10,928) | OK |
| L23 | 大约15步 | #16 | OK ("大约"; ⌈log₂⌉ of 上万 is 14–17) |
| L24 | 3.2万 (2¹⁵ = 32,768) | arithmetic | OK, but see note 1 (cut) |
| L25 | 最快20到30分钟，自动 | #16 | OK, "最快" bound to the minutes; see note 3 (attribution) |
| L26 | 只能有一处坏 · 测试得准 | #22, #20 | OK |
| L27 | 判断错一次全跑偏 | #20 | OK |
| L28 | 接头时通时断 → 失灵 | #12, #21 | OK (a sound inference from both rows) |
| L29 | 只开一半服务，重启 | #26, #25 | OK |
| L30 | 一个同步服务 | none: fiction frame | OK, labelled "某网盘同步服务 · 示意", no brand |

No UNVERIFIED row is used. 1946, 10 %, Murray loop, Christmas lights, Varley-as-bisection, Linus's year and "Juno 出品" are all absent. `facts.py`: no problems (`script.facts_flags.json` = []).

Brief check:
- Real sourced story: yes (SS0437, KB 929135, Git docs, kernel docs).
- 2⁸ = 256 ≥ 200 shown plainly: yes.
- The catch: one fault, a reliable test, intermittent fault: yes. "A test at any point" (git's skip, #23) is left out. That is acceptable.

## Notes: fix at storyboard (no further gate-1 round)

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | **must (fix at storyboard)** | L24 "15次对半，能分清[3.2万]个版本" (86.05–89.15) | **Cut the line.** Round 1 set the condition "if the mean line is still under ~3.4 s, cut it". v2 is at 3.39 s. The arithmetic stays on the picture: the 2¹⁵ = 32,768 doubling bar overlays the strip under L25.<br>Re-time:<br>• **L23 "大约[15]步" 81.45–86.55** (10 beats; the strip halves in great sweeps).<br>• **L25 "最快[20到30]分钟，自动跑完" 86.65–92.35**. The 2¹⁵ bar plays in its first half, then the clock sweeps.<br>Snap the edges to the beat grid and re-run `pace.py`. | screenwriter | Row 65 (≈ 4 s per line); row 12 (保留精华) |
| 2 | **must (fix at storyboard)** | L20 "一位内核开发者：平均每天用一次" (70.00–73.40) | **Cut the line.**<br>• It fails row 13 on its own: "用一次" has no object, so use what?<br>• "内核开发者" is jargon to a non-programmer. This is the one v1 cold-read confusion that v2 did not fix ("which kernel? who is this?").<br>• It sits in the cold reader's second swipe zone (programmer stretch).<br>• It adds no new idea: L18–L19 already show that programmers use it, and L25 shows it is routine.<br>Re-time the build across the freed 3.4 s:<br>• L18 63.25–67.35<br>• L19 67.45–71.95<br>• L21 72.05–76.15<br>• L22 76.25–79.30<br>(Snap to beats; "要查几次？" still ends at the silent gap.)<br>Mean line after notes 1 + 2: **3.62 s** (29 lines). | screenwriter | Row 13 (each subtitle makes sense alone); row 12; row 65 |
| 3 | **must (fix at storyboard)** | L23–L25 picture | **Attribution moves to the claim it belongs to.** 15 steps and 20–30 minutes are Molnar's own best case for a kernel bisection (#16). Without a source on screen, "最快20到30分钟" reads as a general promise for any search. With L20 cut, the text-only card **"据 Ingo Molnar · Linux 内核开发者 · Couder 2009"** sits on L23 (small, under the counter) and stays through L25, beside the existing tag "最好的情况 · 自动". Still no likeness and no penguin. | art-director | Row 11 (plain reading = what the source shows); row 32 |
| 4 | minor (fix at storyboard) | L10–L12 picture (the wireman) | **Picture logic of the cuts.** If the mid-point cut stays open, his next test from the quarter mark cannot reach the home switchboard on the left: the near side would go silent, and the yes/no test would break.<br>• At L10, before he walks on, show a quick tape wrap at the cut (one glint, ≤ 0.5 s).<br>• L12's pull-back then shows those 8 wraps, now retaped properly ("修好后，每个剪口都要再接上" stays as written).<br>• Bonus: L28's flickering splice should be one of those same wraps. That ties the catch to the procedure, since #12 says poor splices cause intermittent opens. | art-director | Row 13; rubric 3 (diagram readable without the subtitle); row 74 spirit (logical errors are blocking) |
| 5 | minor (non-blocking) | Process | **Run a clean cold read on v2 `lines.json` only** (after notes 1–2 are applied), in parallel with gate 2a. Do not let the reader open `script.md`. Route any line it marks as unclear to gate 2b as a screenwriter note. This is the only gate-1 input still missing. | producer | none (process) |
| 6 | minor (non-blocking) | `crew_log.md` | The log has no entries after "folder created" at 00:32: researcher, screenwriter v1/v2, both gate-1 rounds and the cold read are all missing. Log them with times, plus the default title taken for the sleeping owner. | producer | SKILL "Measuring whether the crew helps" |
| 7 | carry-over (gate 2a) | Looks | Round-1 note 7 still stands for the looks:<br>• dusk/blue-hour sky with lit poles and huts; check mean luminance (row 71)<br>• the lineman in profile, walking left → right (row 52)<br>• few hands, pose-checked, with the small-from-behind fallback allowed (rows 9, 74)<br>• not the series' default navy-and-gold night | art-director | Rows 9, 52, 71, 74; looks.md |

## Answers to the screenwriter's open questions

1. **L24 "3.2万"**: cut it (note 1). The 32,768 bar stays on the picture.
2. **L30 "一个同步服务"**: keep it. It is the viewer's own story, labelled "某网盘同步服务 · 示意" with no brand. It answers the cold reader's "which item?", and nobody will read it as a claim about what usually breaks PCs.
3. **Cold read on v2**: yes. Run it as non-blocking (note 5).

## Titles: ranking (round 2)

1. **200段线，最多查8次**: recommended for the feed, the cover and the drop-1 plaque.
   - It poses the paradox in two concrete, true numbers ("最多" = worst case, #2).
   - It is the cold reader's click.
   - Its one ambiguity ("what kind of line?") is answered by the plaque hanging on the phone wire.
2. **线长一倍，只多查1次** (new): counter-intuitive and true (#5), and it is the cold reader's "surprise that stuck". It is weaker than 1 because "线" has no context in the feed and the line carries no concrete stakes.
3. **一次测一半**: Microsoft's own words, but it has no number and no stakes, it gives away the takeaway, and it reads as an exam tip.

End card: keep "这条断了的电话线，你在哪见过？". It follows row 73: recognition is invited only at the end.

## What must not change (it works)

- **The hook as re-cut:**
  - L1 on frame 0 with the error dialog on beat 1 (0.44 s).
  - The "后台服务" list visible on frame 0, with "哪一项？" carried by the scrollbar and the hunting cursor.
  - The half greying on the beat at ~3.5 s.
  - The divider becoming the wire at 5.88.
  - "[200]段线，测一半最多[8]次" at 8.82.
  - The racing counters (二分 hits 8 while 逐段 is near 3), then the camera accelerating along the wire into the drop.
- **Two stations:**
  - The home switchboard on the left and the far hut on the right.
  - He walks left → right in profile.
  - The left lamp answers "喂？", so the left half greys.
  - The crank inset "摇手柄 = 呼叫对方".
- **The textbook is never named.** The pole line is shown as real. Recognition is invited only on the end card.
- **The fact handling:**
  - 200段 (never 200根杆) with "10公里 · 每50米一根杆 · 示意".
  - 最坏情况 on the 8.
  - "最快" bound to the minutes.
  - "美军通信兵教程 · SS0437" with no year.
  - No Molnar likeness.
  - No logos and no real Windows or Git UI.
  - No map and no Varley.
  - "一位" is the wording if Molnar is ever named in a line.
- **The wireman's procedure, including L12** "每个剪口都要再接上" (the WHY of fewer tests).
- **The visual grammar:**
  - amber = suspected, grey = ruled out, one halving move in all three worlds
  - gold only for keywords
  - every world change along the wire: divider → wire → ticks → version tiles → raindrop → wire → window → laptop
- **The arithmetic played:**
  - 200 → … → 1 on the beats.
  - 2⁸ = 256 overtaking the 200 ribbon, with "7次：128，不够".
  - 8 → 9 as the line doubles.
  - 100万 → 20.
  - The 2¹⁵ bar.
- **The music map:**
  - title plaque on drop 1 (16.625)
  - "要查几次？" then the silent gap (79.41–81.43)
  - "大约[15]步" on drop 2 (81.45)
  - the Juno end card at 115.87 with "关注 Juno · 一起看懂世界"
- **The catch played, not told:**
  - L26 with its two condition icons.
  - L27: the wrong half greys with the break inside it.
  - L28: the flickering splice.
- **The ending:**
  - The callback "回到电脑：只开[一半]服务，重启".
  - The found sync service at dawn (示意).
  - The far-off lineman closing his last splice.
  - L31 "不必查遍，每次排除[一半]".
- Every line stays at ≤ 16 glyphs, and the film is subtitle-only.
