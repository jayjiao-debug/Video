# Gate 1 notes: 一颗会回来的彗星, script v1 (round 1 of max 3) — verdict: REVISE

Scores (rubric 1–5, only what gate 1 covers): script **4** · info **4** (planned, from the picture column) · visual / edit /
motion / sound n/a.

No cold-read was provided for this gate. These notes stand on their own. If a cold-read arrives, weigh its title pick
and swipe points before round 2.

**Why REVISE and not APPROVE.** The script is strong and nearly done. But the build's central number is framed against
the wrong baseline (note 1–2), and the owner would send that back as untrue. Three of the 39 lines also break "each line
alone" (owner row 13) or repeat an earlier point (row 12).

Checks I re-ran myself:
- `pace.py lines_arr.json --film-end 122`: 0 % waiting. The only flags are the title (16.4–20.8) and the silent gap
  (79.3–81.5), and both are named beats.
- All 39 lines are ≤ 16 glyphs (the longest is 16).
- `lines.json` and `lines_arr.json` are identical.
- `script.facts_flags.json` is empty.
- Every number in the lines traces to a verified row: 76 #25, 1705 #1, 1758 #7, 102 #11/#12 (arithmetic, tagged 推算),
  53 #13, 24 #2, 1531/1607/1682 #3, 76/75 #3 (arithmetic), 1742 #12, 518/100/618 #19, 1759年4月中旬 ±1月 #20,
  1758-12-25 #14, 16 #13, 3月13日 #17, 约一个月 #21, 公元前240 #29, 74/79 #26, 2061 #39.
- No UNVERIFIED row is used (#10, #16 self-made, #32, #33).
- One problem: the **baseline** of 518/100/618 is not what #19 supports. See note 1.

## Rulings on the screenwriter's open items
1. **《史记》 characters (L34 picture):** the subtitle doesn't depend on them, so this does not block gate 1. It must be
   closed before gate 2b (note 9).
2. **L1 "多半只见一次": keep.** The viewer is 18–25, born after the 1986 return. For them 2061 is the only return in a
   normal lifespan (the next is about 2134). The plain reading is true.
3. **L7 and L13 as logic premises with no row: keep.** Neither carries a number or a historical claim.
4. **"巴黎" (L18): keep.** It is supported by #17/#19 (Observatoire de Paris) and #22 (the Académie).
5. **Pose list:** noted for the animator. If note 5 is taken, the rooftop figure drops out.

## Notes
| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | HIGH | facts.md #19 | **Pin down what the 618 days are measured against.** #19's note says "relative to an unperturbed orbit (i.e., the period from 1682)". Those are two different things.<br>The arithmetic points to the previous lap. The 1607-10-27 → 1682-09-15 lap is about 74.9 years. Repeating it from 1682-09-15 lands about 1757-08. Adding 618 days gives about **mid-April 1759**, which is exactly Clairaut's published prediction (#20). So 618 days = how much **longer this lap is than the previous one**, not a delay versus a planet-free orbit.<br>Find a quote that states the baseline, from any of these:<br>• Clairaut 1758/1760<br>• Wilson, *JHA* 24 (1993)<br>• Whewell 1858 (already cited in #20)<br>• Grant, *History of Physical Astronomy* (1852)<br>Then rewrite #19's note. If a source says the opposite, quote it and flag it to the screenwriter. | researcher | row 11 (plain reading = what the film shows), row 19 |
| 2 | HIGH | L22–L24 (63.25–71.15) and their picture | "比起没有行星" states the wrong baseline (note 1). Rewrite against the previous lap.<br>Lines:<br>• **L22 "木星让这一圈，比上一圈晚[518]天"** (16 glyphs)<br>• L23 unchanged<br>• **L24 "这一圈，比上一圈长[618]天"** (13), or keep "加起来，晚了[618]天"<br>Picture: relabel the ghost dot from "没有行星时" to **"照上一圈（1607→1682）的节奏"**.<br>This still can't be read as Halley's mistake (your choice 3). It also ties back to the "75年" lap in L14.<br>Apply once note 1 confirms. If the researcher finds the opposite, keep the current wording and cite the quote. | screenwriter | row 11 |
| 3 | MED | L31 (89.61) | "3月13日，它离太阳最近" has no year. The last year on screen is "1758年12月25日", so read alone it is ambiguous.<br>Replace with **"1759年3月13日，最接近太阳"** (16 glyphs). It reuses L25's wording, so the viewer links "the date they computed" to "the date it happened". | screenwriter | row 13 (each line alone) |
| 4 | MED | L3–L4 (5.93–11.33) | L3 ends on the bare verb "写下". L4 "我斗胆预言：…", read alone, sounds like the channel speaking.<br>Replace with:<br>• **L3 "1705年，天文学家哈雷写道"** (14)<br>• **L4 "「斗胆预言：[1758]年它会回来」"** (16 including the corner quotes)<br>It stays faithful to "I dare venture to foretell" (#7) and stays hedged. | screenwriter | row 13 |
| 5 | MED | L1 / L39 picture (frame 0 and bookend) | Frame 0 shows a twenty-something seated on a parapet, seen from behind. That is the outside-view figure that failed in ep14 ("很难带入").<br>Make it **first person** instead: the viewer's own phone in camera mode fills the lower frame (phone edge only, no drawn hands), with the comet over the rooftops both on its screen and in the sky behind.<br>L39 returns to the same phone, and the camera UI timestamp now reads **2061**. That keeps your bookend reveal.<br>This also removes a pose-check figure sitting on an edge. | screenwriter | rows 48, 53, 1 |
| 6 | MED | L37–L38 (106.63–111.54) | L37 "行星一拉，每一圈都得重算" restates L15 and L19–L24. Keep L36: its 74–79 range and the "76 → 平均" tag are new.<br>Turn L37 into the bridge to the ending:<br>• **L37 "所以下一次，也是这样算出来的"** (13)<br>• **L38 "算出的答案：[2061]年"** (11), a callback to L6 "才有答案"<br>Picture for L37: the tug arrows act on the *future* lap, and the ruler lands on the 2061 tick. | screenwriter | row 12 (no repeats) |
| 7 | LOW | L32 picture (92.33) | "早了约一个月" has no scale, so after "前后一个月" it reads as "only just".<br>Under the calendar strip, add a long bar for the lap, **"1682→1759 · 约76年半"** (估算, arithmetic from #17), with the 1-month gap as a thin sliver labelled "约1个月".<br>This keeps your choice 4: no hit/miss verdict. | screenwriter | rubric 3; rubric 1 (ending lands) |
| 8 | LOW | L36 picture (103.63) | Drop the decimals, which are noise at phone size and compete with the subtitle's 74/79.<br>Use **"79年 · 451→530"** and **"74年 · 1835→1910"**. | screenwriter | rubric 3; row 69 |
| 9 | MED | facts.md #28 → L34 picture | Before gate 2b, verify the exact characters against a 中华书局点校本 scan or 中研院《漢籍電子文獻》. Expected: 「七年，彗星先出東方，見北方，五月見西方」. Until then the art director letters only 《史记·秦始皇本纪》 秦始皇七年. | researcher | row 19 |
| 10 | LOW | L25–L26, optional | The 14 Nov 1758 announcement came 6 weeks before anyone saw the comet (#22, #14). That turns "它会回来吗？" into a public bet, and right now it is only a picture card. It is your call.<br>Option:<br>• **L25 "1758年11月，他们公布了日子"** (16)<br>• **L26 "[1759年4月中旬]，最接近太阳"** (15)<br>The ±1个月 band then lives in the picture only. | screenwriter | row 35 (why it was done) |
| 11 | LOW | L29 picture, for gate 2a/2b | The only source for Palitzsch's instrument (#16, INAF) says a 2.5 m **Newtonian reflector**, which has its eyepiece on the side near the top, not at the back like a refractor.<br>Draw it that way (still 示意) and pose-check the eye to that eyepiece, or keep the telescope small and generic. | art-director | row 74 (body logic), row 11 |

## What must not change (it works)
- **Opening chain L1–L6:**
  - The viewer's lifetime against 76 years, with the "你的一生" ruler where only one landing fits.
  - 1705.
  - The hedged quote (斗胆, never the stronger Latin).
  - **102**, tagged 推算.
  - **53年**, with no question asked.
  - Subtitle on frame 0, and the tail flare on beat 1 (0.44 s).
- **The ink-to-comet thread:** the gold "1758" peels off the page and becomes the comet on drop 1. The one gold dot
  carries the whole film: the ellipse, the dot Jupiter and Saturn tug, the smudge in the eyepiece, the ticks, the bookend.
- **The one idea, shown:** 24 orbits → three that match → "不是三颗彗星，是[同一颗]" with the orbits merging. Then
  "那就能算" → 76 ≠ 75 → Jupiter → the window 1758年底到次年初.
- **Breakdown:** the empty chair and cold candle, with no deathbed. The Paris trio, with Lepaute named (勒波特夫人).
  "拉朗德回忆" attribution on the six-months quote.
- **Build:** the counters slam together 518 + 100 = 618 (only the baseline wording changes). No exact predicted day.
  The ±1个月 band. "它会回来吗？" only at the build peak.
- **Silence → drop 2:** the empty eyepiece in the gap. The smudge lands on 81.45 with "1758年12月25日夜" (not 圣诞夜). The
  帕利奇 tag. The life-bar bracket "16年". "早了约一个月" with no hit/miss stamp.
- **Deep time:** 公元前240年 with 「目前能确认的最早记录」 wording, and 中国史书几乎次次记下. No 世界最早, no 《春秋》, no 1057 BC.
- **Ending:** the rooftop bookend, with the frame-0 world revealed as 2061. "哈雷没等到的，这次[轮到你]". 2061 as the year
  only. End-card question 2061年它回来时，你多少岁？
- **Never named:** the film never says 哈雷彗星 and never signals the textbook (row 73). Viewers will name it in the
  comments themselves.
- **The "Not used, on purpose" list in full** (#10, #32, #33, self-made telescope, the 2061 day, the Lepaute omission,
  pills, Giotto, Babylon).
- **Mechanics:** lines.json and lines_arr.json stay in sync, every line ≤ 16 glyphs, the music map, the title on
  16.625 and the reveal on 81.432.

## Titles, ranked
1. **死后16年，它回来了**
   - Strongest stop in the feed: a number plus an emotional turn, and exactly true (#12–#14). L30 answers it word for word.
   - Risk: cold, "死后…它回来了" can read as 灵异/鸡汤. The ep22 cold-reader said the same of 死后会变慢的钟.
   - It also reuses that 死后 opener two episodes later.
   - The title lands on a comet swinging round the Sun, so the genre resolves in about 1 s.
   - If ep22 was published as 死后会变慢的钟, take #2 instead.
2. **他没等到的那颗彗星**
   - Honest, names the subject and carries the ending's emotion.
   - No number, so it stops fewer thumbs.
3. **写给身后的预言**
   - Essay register, the weakest at stopping a swipe.

## Next
1. The researcher does notes 1 and 9.
2. The screenwriter applies notes 2–8, and note 10 if he wants it, then re-runs pace.py and the 16-glyph check.
3. **If note 1 confirms the previous-lap baseline and notes 2–6 are applied as worded, I accept them without a round 2.**
   The producer can then take the script and the title order above to the owner, or take #1 by default on the overnight
   run.
4. If note 1 finds anything else, there is a round 2 on L22–L24 only.

**Flag for the producer (not a script note):** the brief's visual direction is the pond 2D look, and ep22, ep23 and
ep25 carry the same line. At gate 2a, rows 27/40 still apply. The figure system is engine. The world, palette and
metaphor must be new for this episode.
