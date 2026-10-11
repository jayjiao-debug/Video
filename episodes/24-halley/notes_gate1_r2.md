# Gate 1 notes: 一颗会回来的彗星, script v2 / lines.json (round 2 of max 3) — verdict: APPROVE (with must-fix wording)

Scores (rubric 1–5, only what gate 1 covers): script **5** once must-fix 1 is in (r1: 4) · info **4** (planned, from the
picture column; r1: 4) · visual / edit / motion / sound n/a.

**Why APPROVE.** Note 1 is closed: facts #19 now quotes Messier 1765, "618 days more for the period that was to end in
1759 than for the former". The 1858 source backs it ("if it retained its period it would be delayed about 618 days"), and
#41's arithmetic lands on mid-April 1759. "比起没有行星" is gone. Notes 2–8 are applied as worded, and note 10 is applied in
part, which was reasonable. Every cold-read complaint has an answer on screen. What remains is one character in one
subtitle, the title choice, one untraced picture card, and stale text in facts.md. None of it needs another round. The
producer applies the must-fix items below as written and carries on to gate 2a.

**v1 → v2, area by area:**
- **Script: v2 is better.**
  - The paradox now lands with a number at 3.7 s. "102" was at 11.4 s in v1, and the cold reader said that was the real hook.
  - "同一颗" lands at 31.8 s instead of 35.1 s.
  - The method run is down from five lines to four.
  - The trio is named, so 拉朗德 no longer comes out of nowhere.
  - The number stack is down from three subtitles to two.
  - Predicted and actual use the same words ("最接近太阳").
  - The post-reveal section now has a job: it shows "76 is only an average, so 2061 had to be computed".
  - The repeat line is cut. 39 lines → 32.
- **Info: same score.** The 1682→1759 lap bar, the whole-year brackets and the lag of the gold dot behind the ghost dot
  are all improvements. The score is held at 4 only because these are still words in a picture column.

**Checks I re-ran myself:**
- `pace.py lines_arr.json --film-end 122`: waiting 5.1 s = 4 %. The flags are:
  - the two named gaps (title 16.4–20.8, silence 79.3–81.5);
  - three MINOR 1.7 s holds in the build, which are deliberate (counter and calendar time).
- All 32 lines are ≤ 16 glyphs (max 16).
- `lines.json` and `lines_arr.json` are identical (32/32).
- **Every number in the lines traces to a verified row:**
  - 102 (#11/#12, 推算)
  - 1705 (#1)
  - 1758 (#7)
  - 53 (#13)
  - 24 (#2)
  - 76/75 (#3, arithmetic)
  - 1758年底到次年初 (#8)
  - 1742 (#12)
  - 六个月 (#23)
  - 518/618 (#19, baseline now quoted)
  - 1759年4月中旬 (#20)
  - 1758-12-25 (#14)
  - 16 (#13)
  - 1759-03-13 (#17)
  - 约一个月 (#21)
  - 公元前240 (#29)
  - 74/79 (#26)
  - 2061 (#39)
- No UNVERIFIED row is used.
- **Numbers in the picture column:**
  - These are all supported: 1656, 48→102, 1337–1698, 1681, 1607→1682, 1758-11-14, 约76年半 (估算 #41), 451→530, 1835→1910, 1066,
    1910, 1986.
  - **One is not: "1757–1758" on the L15 card** (must-fix 3).

## Rulings on the screenwriter's open items
1. **"卡在误差边上" (L26): approved.**
   - It is true: 13 Mar vs mid-April is 31–33 days against a ±1-month licence (#20, #21).
   - It claims neither hit nor miss, so it respects choice 4.
   - It answers the cold reader's "到底算准了没有". "卡在" is plain written Chinese, not slang.
2. **L19 wording:** keep "加上土星," so Saturn is named in the subtitle, but change one character (must-fix 1).
3. **《史记》 characters (L27 picture):** still open. Researcher, before gate 2b (r1 note 9). It does not block gate 1,
   because the subtitle does not depend on it.
4. **Lalande attribution as a picture tag (L17):** approved. It must stay on screen for the whole line, as written.
5. **102 before 1705:** approved. "预言它回来的人，那年该[102]岁了" reads alone ("那年" = the year it returns), and it
   makes the viewer ask who.

## Notes
| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | MUST-FIX (wording) | L19 (68.01–72.39) | **Replace "加上土星，比上一圈长[618]天" with "加上土星，比上一圈晚[618]天"** (14 glyphs, timing unchanged).<br>Why: L18 says 晚518 and L19 says 长618, so the viewer gets two verbs for one quantity, right where the cold reader stopped reading the numbers.<br>"晚" matches the picture exactly: the gold dot lags the ghost dot "照上一圈的节奏". It is also the 1858 source's word ("delayed about 618 days").<br>Change it in lines.json, lines_arr.json, the script.md lines table and the facts-map row. | screenwriter | row 13 (each line alone), row 12 |
| 2 | MUST-FIX (title) | Title card (16.625) and the gate-1 owner list | **Recommended title: 他走后16年，它回来了.**<br>ep22's overnight default title is 死后会变慢的钟 (ep22 notes_gate1_r2). Two episodes in a row opening on "死后…" is the sameness owner row 40 warns against. The r1 notes and the script both said to switch if that happened.<br>"他走后" keeps everything the cold reader liked: the number, the who/what gap, and an exact plain reading (#12–#14), answered by L24. It is a little less 灵异 than 死后, and it pins the 16 to his death, which also helps the 53 → 16 back-to-back the cold reader noticed.<br>Owner list order:<br>1. 他走后16年，它回来了<br>2. 死后16年，它回来了 (if the owner renames ep22)<br>3. 他没等到的那颗彗星<br>The sub-line stays 1705年，一个写给身后的预言. | screenwriter → producer | rows 2, 11, 40 |
| 3 | MUST-FIX (fact) | L15 picture (52.14) | **Delete the small card "1757–1758"**: no facts row supports when the computation ran. Keep the name tags with roles; they carry the scene.<br>If the researcher adds a sourced row with the dates, the card can come back with exactly that wording. | screenwriter (picture column) → art-director | row 11; gate-1 fact rule |
| 4 | MUST-FIX (facts.md hygiene) | facts.md Risks bullet 1, #21, Story-worthy #2, #7 note | facts.md still contradicts the corrected #19 and the approved L26 wording. The art director and animator read this file, so fix it now.<br>• **Risks bullet 1**, replace the first sentence with: "**Brief's own numbers to correct:** "~618 days" is how much **longer the 1682→1759 lap was than the 1607→1682 lap** (518 Jupiter + 100 Saturn; #19, Messier 1765). It is not a delay against a planet-free orbit and not the error of Halley's prediction."<br>• **#21 claim column**: replace "实际早了约一个月，仍在误差范围内" with "实际早了约一个月，卡在±1个月误差的边上".<br>• **Story-worthy #2**: replace "about a month early but inside the stated ±1 month" with "about a month early, right at the edge of the stated ±1 month".<br>• **#7 note**: replace 「我敢预言：1758年，它会回来」 with 「斗胆预言：1758年它会回来」. | researcher | row 11, row 32 |
| 5 | MED (carried, before gate 2b) | facts #28 → L27 picture | r1 note 9 is still open. Check the 《史记·秦始皇本纪》 characters against the 中华书局点校本 or 中研院《漢籍電子文獻》. Until then, letter only 《史记·秦始皇本纪》 秦始皇七年. | researcher | row 19 |
| 6 | LOW (gate 2b) | L1 picture (frame 0) | Draw the "你的一生" ruler to scale. It starts at the viewer's birth (~2005) and runs ~80 years. The one landing sits about two-thirds along it (2061, age ~55). The "平均76年" bracket then overshoots past the end (~2137).<br>If the landing is drawn near the ruler's start, the picture says "your life is shorter than 76 years", which is false. | art-director | row 11 |
| 7 | LOW (gate 2b) | L18 picture (63.25) | The ghost-dot label "照上一圈（1607→1682）的节奏" is about 18 glyphs on a moving diagram, and it competes with the subtitle. Set it in two tiers: **"照上一圈的节奏"** (≥ 40 px) and a small "1607→1682" under it. | art-director | rows 24, 69 |
| 8 | OPTIONAL | L27 (97.01) | If you want the subject back after the jump from 1759 to 240 BC: **"它最早的可靠记录：公元前[240]年"** (16 glyphs; #29 allows 「公认最早的可靠记录」). The current line is acceptable, so this is your call. | screenwriter | row 13 |
| 9 | for the producer | crew_log.md, gate 2a | (a) crew_log.md still has only the folder row. Log the gate-1 r1/r2 times, the cold read and the overnight defaults (title per note 2).<br>(b) The r1 flag still stands. The brief fixes "Tank / pond 2D", but owner rows 27, 34, 40 and 72 require 2–3 looks from different worlds at gate 2a, none repeating ep23's main look. The figure system is engine; world, palette and metaphor are new. | producer | rows 27, 40 |

## What must not change (it works)
- **Opening, now at its best:**
  - L1 is the viewer's own situation on frame 0, first person through their phone, with no figure.
  - The tail flare lands on beat 1 (0.44).
  - **102 at 3.7 s**, tagged 推算 on the faded bar.
  - 1705 → the hedged 「斗胆预言」 (never the Latin) → 53年, with no question asked.
- **The ink-to-comet thread:** the gold "1758" becomes the title comet, then slides into Halley's window (L13), then
  reappears beside the sighting (L23). The one gold dot carries the film.
- **The one idea:** 24 → three → 同一颗 → 那就能算 → 76≠75 → 木星 → "所以他估计" window.
- **Breakdown and build:**
  - The empty chair and cold candle, with no deathbed.
  - The named trio with roles (勒波特夫人 included).
  - "——拉朗德回忆" held for the whole line.
  - **The ghost dot "照上一圈的节奏" vs the lagging gold dot.**
  - 518 then 618 in two subtitles; Saturn's 100 on the counter only; the slam 518+100=618.
  - No exact predicted day. The ±1个月 band in the picture only. The 14 Nov 1758 public-bet card.
  - "它会回来吗？" only at the build peak.
- **Silence → drop 2:**
  - The empty eyepiece.
  - The smudge on 81.45 with "1758年12月25日夜" (never 圣诞夜).
  - "它回来了" + the gold 1758, the 帕利奇 tag, the Newtonian reflector (示意), the 16年 bracket.
  - "最接近太阳" used for both predicted and actual.
  - "卡在误差边上", with no hit/miss stamp.
- **Deep time with a purpose:** 公元前240 (hedged); 中国史书几乎次次记下; the relay of watchers along the ticks;
  74–79 with whole-year brackets; "平均76年" shrinking to "平均".
- **Ending:**
  - "所以下一次，也是这样算出来的" → "算出的答案：[2061]年" (callback to 才有答案).
  - The phone bookend stamped 2061.
  - "哈雷没等到的，这次[轮到你]".
  - End card 2061年它回来时，你多少岁？
- **Never named:** 哈雷彗星 and any textbook signal (row 73). The full "Not used, on purpose" list.
- **Mechanics:**
  - 32 lines ≤ 16 glyphs; lines.json = lines_arr.json.
  - Title on 16.625; reveal on 81.432.
  - Last line out at 115.70, before the end card at 115.87.
  - Follow pill `关注 Juno · 一起看懂世界`.

## Next
1. The producer (or the screenwriter) applies must-fix 1–3 exactly as written, and the researcher applies 4. No round 3.
2. The researcher closes note 5 before gate 2b. Notes 6–7 go to the art director with the storyboard brief.
3. Overnight default: title **他走后16年，它回来了**, script v2 + must-fixes. Log it in crew_log.md and put the title
   options (note 2 order) on the owner's morning list.
