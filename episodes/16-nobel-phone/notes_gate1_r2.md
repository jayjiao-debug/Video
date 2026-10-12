# Gate 1 notes: 利率没动，只改了一句话 / 相信我，这就够了 (ep16) script v2 + lines.json — verdict: APPROVE (conditional on note 1)

Scores (rubric 1–5, only the areas this gate covers): script **4** (r1: 3) · visual — · info — · edit — · motion — · sound —

**Conditional means:** note 1 is a one-line swap. The exact text is given below and it traces to row 55. The producer checks
the swap against row 55 and takes the lines to the owner. There is no round 3. The cold read runs in parallel. If it
flags a line as not understood, or a swipe point inside 0–9 s, only that line goes back to the screenwriter. If it
scores the film below 7/10 to the end, send it back to me.

**v2 vs r1 (script area): v2 is clearly better.**
- **Hook.** The viewer's own moment is on frame 0 (「听说下周涨价，你今天就买了」, a price tag, no phone). The paradox is complete
  at 6.2 s. The actual words are on screen at 6.2 s. The number now has scale (21个月, 7 boxes you can count).
- **Lecture.** Title to Hall now takes 4 s (r1: 13 s). The 1970s is one line that says why the work was needed.
- **Jargon.** Every r1 jargon item is glossed or removed (实验室, 0, 7个季度, 7 %, 买债, 美债).
- **One device.** The three cases now act on one playable tile row instead of three charts.
- **Length.** 34 lines became 28, ≈ 3.9 s per line, close to the owner's ~4 s.

It is a 4 and not a 5 for two reasons. The evidence block is still three foreign cases in a row (the device and the
你-scale translations carry it). And line 20 has a fidelity problem (note 1).

## My 8 notes from r1

| r1 note | Status |
|---|---|
| 1 Hook (stake, words, scale, ≤ 8 s) | **Done.** (a), (b) and (c)(ii) are applied. Row 27 is dropped, so no number repeats. For (d) the screenwriter took the branch my note allowed: "or the number moving on the picture from ~5 s". See decision (a). |
| 2 Lecture after the title | **Done.** |
| 3 Causal claim needs a source | **Done.** Researcher rows 54–57. Lines 20 and 22 are built on them, but line 20 needs note 1. |
| 4 Jargon | **Done.** 两年期 comes back only at line 20, which note 1 removes. |
| 5 One playable device | **Done.** It is specified per line in the Picture column. |
| 6 Density | **Done.** 28 lines. pace.py: 0 % waiting, 0.9–1.15 s slack per line. The only flag is the title plaque, which is planned. |
| 7 Frame 0 not a phone; no 央行 push | **Done.** A price tag has not been used in any earlier episode (checked looks.md and the episode scripts). The sticker's date carries the eye into the statement page, so the cut is motivated. |
| 8 Wording | **Done**, except 「美国家庭」. See decision (b). |

## Fact fidelity of new and changed lines

| Line | Row | Status |
|---|---|---|
| 2 利率没动，只改了一句话 | 26 | OK. 改 is literally right. The picture shows the old wording only as 「没有日期」, so the unverified "extended period" text is not used. |
| 3 低利率"至少到2013年年中" | 26 | OK. It is a translation in quote marks, with the English small in the picture. |
| 4 预测机构改口：加息要等21个月以上 | 28 | OK. The row says "jumped to seven or more quarters", so 改口 and 以上 both hold. 21 = 7 × 3 (计算). 「预测机构中位数」 in the picture matches "Blue Chip median". |
| 7 1982年一查：10户里约8户 | 14 | OK. 1982 is the publication year, and 一查 is acceptable for "a 1982 study". |
| 9 / picture 14.8 % | 11, 12, 51 / 47 | OK |
| 10 央行先在纸上试政策 | 15 | OK. It is faithful to "a kind of laboratory for policymakers". |
| 14 利率降到0，没法再降了 | 20 | OK ("cannot be lowered further") |
| 16 借100块，年息近7块 | 33 | OK. 6.80 % monthly average (计算), and the tag 10年期 · 月均 stays. |
| 19 6周后…必要时买它们的国债 | 35, 56 | OK. 6 weeks is exact (26 Jul → 6 Sep). 必要时 is backed by row 56 ("none … has activated"). |
| **20 三次表态后，两年期利率降了约2个点** | 54, 55 | **The number is right, but the plain reading is wrong (note 1).** The 研究估算 tag is present in the picture. |
| 21 到2015年…一次都没用过 | 36, 56, 57 | OK. The 截至2015年1月 tag stays. Row 57 would also allow 2015年6月. |
| 22 欧洲央行对法院说：光是"宣布"就够了 | 57 | **OK, and framed correctly.** It is the ECB's claim, not the Court's finding. The quote marks sit only on 宣布. No English is quoted. The picture card says 「欧洲央行称…」 and is labelled 意译. |
| 25 美国国债利率涨了约六成 | 38 | OK. 1.76 → 2.81 = +59.7 % (计算). The tag 10年期 · 月均 · 4月→9月 stays. |
| 26 自己的话是原因之一 | 39 | OK, and the hedge is kept. |

The rest is clean:
- No UNVERIFIED row is used. No news-only row is used.
- Nothing about China at all. No faces, no logos, no advice.
- Hall is credited only for consumption and expectations.

## Notes

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | High (one line) | Line 20 (74.6–79.0) and its picture | **The line reads as "Spain's 7 % fell by 2 points".**<br>The viewer's only Spanish rate is line 16's 100块 → 7块, which is the 10-year. A cold viewer maps 「两年期利率降了约2个点」 onto it and reads 7块 → 5块. Row 55 puts the 10-year effect at about 1 point (ES −115 / −97 bp). So the plain reading doubles the study's result on the film's core evidence line.<br>Two smaller problems on the same line:<br>– 两年期 is a new term, brought back after r1 removed it.<br>– 「三次」: the subtitles have shown only two statements (7.26 and the plan). 8.2 never appears.<br>**Replace with:** 「这几次表态，让西班牙年息少了约[1块]」 (16 by pace.py count; needs 3.4 s, slot is 4.4 s). This uses row 55 ES 10-yr −115 / −97 bp, "approximately 100 bps", the researcher's safe phrase 「约1个百分点」. It continues the line-16 coins, so it is the 你-scale translation r1 note 5 asked for.<br>**Picture:** Spain's 7-coin stack from line 16 loses about one coin. Tag 「研究估算 · Altavilla 等，2016 · 10年期」. Show the total, or three steps with **8.2 going up** (row 55: 10-year rose on 2 Aug). Never three equal down-steps.<br>Germany/France "flat" stays only if the researcher adds the DE/FR **10-year** totals from the same Table 1. Row 55 gives DE/FR for the 2-year only. Otherwise drop the comparison.<br>Keep the 2-point (2-year) figure off screen. A second number here would compete. | screenwriter (line + picture column); researcher only for the DE/FR 10-year figures | "只有我过得不好…误导" (the plain reading must be what the source shows); ep13 "never state a result the source doesn't"; "这句话意义不明确" |
| 2 | Carry-forward (gate 2b, not a revision now) | Hook picture, 5.5–8.9 s | This is the condition for accepting decision (a):<br>– the quarter boxes are visibly ticking on by 6.2 s;<br>– the countable 7 and 「21个月」 can be read at phone size (≥ 64 px numbers) before line 4 ends;<br>– frame 0 already moves (sticker slap, price flip) on the music's first beat.<br>The storyboard must say so explicitly. | art-director | ep14 opening formula (number on the picture, countable, early); ep11 v3 (something happens inside the first second); ep15 "make sure the reading is big enough" |
| 3 | Low, non-blocking | Line 7 | If it is quick, confirm from the KVA scientific background (p. 22) or the Hall–Mishkin 1982 *Econometrica* record that the data are US households. If confirmed, use the screenwriter's prepared variant 「1982年查美国家庭：10户约8户真这样」. If not, ship line 7 as it is. | researcher | "有没有比Wikipedia更靠谱的资源" (primary only) |

## The two open decisions

**(a) The hook lines end at 8.9 s, not 8.0 s: accepted, no cut.**
- My r1 note (d) offered "or the number moving on the picture from ~5 s", and v2 does exactly that (boxes from 5.5 s).
- The paradox is complete at 6.2 s with a concrete date and 「利率没动」. The rubric's 5-anchor says "~8 s", and v2 meets it.
- Getting to 8.0 would mean cutting 你 from line 1 (it is the viewer stake) or splitting line 2 (that adds a cut and makes the paradox land later). Either costs more than 0.9 s is worth.
- The condition is note 2.

**(b) 「美国家庭」 dropped: accepted.**
- "Facts only from verified rows" outranks my r1 wording note.
- 「1982年一查」 plus the author tag already marks it as a historical study, not Chinese families.
- Note 3 is the cheap way to restore 美国 if the researcher can confirm it.

## Title ranking (the owner picks)

1. **利率没动，只改了一句话**: feed title and cover. A true paradox that the film pays off by 6.2 s, and the r1 cold reader's pick. For topicality, add a small 「2026诺贝尔经济学奖」 kicker on the cover, rather than putting it in the title.
2. **今年诺奖：说话也是政策**: the best option if the owner wants 诺奖 in the title itself. It is accurate (rows 6, 20), and lines 23–26 show words cutting both ways. It is a weaker puzzle than 1, and its pull fades once the prize news cycle ends.
3. **相信我，这就够了**: in-film plaque only, with 「2026 诺贝尔经济学奖」. As a feed title it reads as 情感/鸡汤, which is a baiting risk (r1 cold read).
4. **央行说句话，为什么管用**: accurate and safe, but it reads like a 经济学课 question and has the lowest pull.

## What must not change (it works)

- **The new hook:**
  - line 1 word for word, with the price tag that already moves on frame 0;
  - the sticker date carrying into the statement page;
  - line 3 showing the actual words;
  - 21个月 with 7 countable boxes;
  - no phone anywhere.
- **Title → Hall in 4 s:** 今天花多少 / 10户约8户 / 「剩下的，多是月光族」.
- **The one tile-row device** acting on all three cases, and the 你-scale translations: 21个月, 100块/7块, 六成.
- **Line 22's framing**: 「欧洲央行对法院说」, quote marks only on 宣布, labelled 意译. The 「就够了」 echo of line 18 is good.
- **Everything on the r1 don't-change list:**
  - the Draghi arc and its order, with the reveal at 79.0 s (67 %);
  - the 2013 beat with 「原因之一」 and the credibility line;
  - lines 13, 18 and 28 word for word;
  - 伍德福德等人;
  - 月均 and 截至2015年1月 tags;
  - no UNVERIFIED or news-only rows;
  - Bernanke unnamed, no faces or logos;
  - the @ prompt;
  - end-card 生活费.
- **28 lines at ~3.9 s each.** Don't add lines back. If the track is shorter, use the screenwriter's cut order (9, then 14, then 22).
