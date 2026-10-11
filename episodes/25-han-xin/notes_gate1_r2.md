# Gate 1 notes: 不数人头，怎么点兵？ script.md + lines.json v2 — verdict: APPROVE (with 3 must-fix edits before the storyboard locks; no further gate round)

Scores (rubric 1–5, only the areas this gate covers): script 4 (v1: 3) · visual – · info – · edit – · motion – · sound –

## Script 4 (up from 3)

v2 is better than v1 in the script area. All three anchor-1 faults from round 1 are gone:
- No subtitle contains a bare 孙子. Both uses are now 《孙子算经》 or 原书.
- 求一 is explained in a subtitle (L23) and tied to a number the viewer already has (L24: 35 × 2 = 70). L33 "这正是秦九韶的求一" now lands on a known word.
- The RSA run says *why* (L30: split into p and q, faster) and *what* is stitched back (L31). The 除数n line is gone.

Each confusion in coldread_gate1.json was checked against v2:
- #7 (100 possibilities), #8 (三人排多2), #13 (我们), #18 (70 alone), #20 (210 before 105), #24 (求一), #26 (除数n), #32 (拼回什么) and #35–36 (4 and 6): all fixed in the text.
- #4 (多出几个 is vague at first) is left as it was, correctly. It is the protected opening, and its picture shows the gold leftovers at the same moment.
- #27–28 (dP · dQ · qInv as code names) is kept on purpose as the mystery before the gap. It is now set up by a plain line (L26) and paid off in L30–L32.

Why it is not a 5:
- The film's key reveal is rushed (must-fix 1).
- The whole film runs at 2 % waiting. The owner's last stated comfort was ~20 % (row 65). See the risk note for the producer.

**Cold read:** coldread_gate1.json is the read of v1 (it uses the v1 numbering and timings). v2 has not been cold-read. Tonight is the last round, so I checked each confusion myself (above) instead. At gate 2a, the cold reader's 5-second test should include the L17, L24 and L25–L27 frames, because those lines now lean on their pictures.

## Status of the round-1 notes

| r1 # | Status |
|---|---|
| 1 求一 | Done. L23 + L24. |
| 2 bare 孙子 | Done. L16, L29. |
| 3 overloaded demonstration lines | Done. L8 is split into L8–L10 (2.56 s each), L17 = 4.00 s, L21 = 4.00 s, v1 L14 is cut. Every fixed hit was re-checked and is still in place: title 16.625; L7 at 20.70 on the main section; breakdown 49.04 inside L17; build 63.205 → L22 at 63.25; gap 79.38–81.45; drop 2 → L28 at 81.45; end card 115.87. |
| 4 RSA reason | Done. L25, L26, L30, L31. |
| 5 RFC rows | Done. #35–#39 added. The FASTDEC volume and year are UNVERIFIED and appear nowhere on screen, which is correct. |
| 6 一百多 ≠ 100 | Done in the subtitle (L7). It comes back in the picture label; see note 4. |
| 7 timeline backwards | Done. The ribbon runs one way only; 1275 and 1592 are banner tags. |
| 8 约…多 | Done. "1600多年前" is the 估算 row #7, and the card carries 公元3—5世纪 · 学界说法不一 (估). |
| 9 odd/even reason | Done. L36. |
| 10 eye-level opening | Still open with the art director, for gate 2a. |

## Facts check (v2)

I re-ran the arithmetic in python:
- 100–199 → 33 → 6 (113, 128, 143, 158, 173, 188) → 1 (128).
- 70 / 21 / 15 leave remainders 1-0-0 / 0-1-0 / 0-0-1 for 3, 5, 7.
- 35 mod 3 = 2, and 70 mod 3 = 1.
- 2×70 + 3×21 + 2×15 = 233, and 233 − 210 = 23.
- 105 leaves 0 for 3, 5 and 7.
- The answers below 400 are 23, 128, 233 and 338.
- No n < 1000 leaves 1 when divided by 4 and 2 when divided by 6.

Every number in lines.json traces to a facts row:

| Number(s) in the lines | Row |
|---|---|
| 一百多, 128, 2/3/2 | #32 (示意 scenario) |
| 100, 199, 33, 6, 1 | CALC (re-run) |
| 1600多年前 | #7 估算, hedged on the card |
| 23 | #3 |
| 70, 21, 15 | #5 |
| 233 | #4 |
| 105 | #5, #32 |
| 1247 | #9 |
| 35 × 2 = 70, remainder 1 | #11 + CALC |
| RSA 算余数 | #36 |
| n = p × q (picture) | #35 (the two-prime case, as the row says) |
| 三个数 dP, dQ, qInv | #29, #37 |
| 更快 (no factor) | #39 |
| 拼回 | #38 |
| q × qInv 剩1 | #29 |
| 中国剩余定理 | #24 |
| 4/6 无解, 单/双 | #33 (示意) |
| 大概有多少 | #34 |

- No UNVERIFIED row is used. There is no speed-up number, no 《史记》 and no 周密 book name.
- The 1275 and 1592 names on the banner tags rest on secondary sources (#16, #18). That is allowed.
- One small gap: the L26 key-file picture lists n, e, d, p, q and then the three extras. That layout is RFC 8017 Appendix A.1.2 (RSAPrivateKey), which facts.md does not quote. See note 5.

## Titles, ranked

1. **不数人头，怎么点兵？** (recommended)
   - It asks exactly what the film answers, and its plain reading promises nothing the film doesn't show.
   - 点兵 belongs to both the legend and the 军训 world.
   - Sub-line: 三个小余数，拼回一个大数.
2. **韩信点兵，原文没有韩信**
   - The cold reader's click. It is honest and grabby.
   - It spends the film's twist in the title, and most of the film is maths and RSA, so history-clickers may feel baited.
   - It also leans on the viewer already knowing the classic (the spirit of row 73).
   - This is the one to offer the owner if he wants a stronger click.
3. **从点兵，到加密钥匙**
   - True to the arc.
   - It has no number and no question, so it is the least concrete of the three.

## Notes

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | **Must-fix (before the storyboard locks)** | L28 (81.45–83.63), L29 | **Give the drop-2 reveal room.** "CRT：中国剩余定理" is the film's key reveal, coming after a 2-s silence. It gets 2.18 s against a reading need of 2.1 s, while the picture runs a two-stage unfold (CRT → Chinese Remainder Theorem → 中国剩余定理). The cold reader named this name as the thing they'd tell a friend. Fix: **delete L29** "西方这样称呼《孙子算经》的方法" and **hold L28 from 81.45 to 86.77** (5.3 s ≈ 2.5 bars). Move L29's content into the L28 picture: after the gold 中国剩余定理 lands (~83.5 s), the scroll's 《孙子算经》 title slip glows and the label "Sun Zi Theorem / Chinese Remainder Theorem" appears. L30 onward keeps its timings. Then: 38 lines; re-run pace.py and update script.md's line table and trace table. | screenwriter | Row 65 (10–12 beats for visual payoffs; "节奏太快…看不过来"); brief (key reveal on drop 2) |
| 2 | **Must-fix (fix at storyboard)** | L30 (86.87) | **Wording/register:** "拆成p、q两个小的算" is colloquial (brief: academic register). Use **"解密：拆成p、q两个小计算，更快"** (16 字). This is the facts row #39 safe wording. Timing is unchanged. | screenwriter | Brief (academic register) |
| 3 | **Must-fix (clerical)** | script.md trace table + "Still unresolved" §1 | Replace R-a → #35, R-b → #36, "FASTDEC row" → #39, and add #37/#38 next to #29/#30 where the CRT key form and the decryption steps are cited. Delete the unresolved items that are now closed (§1 and §2; see note 5 for §2). | screenwriter | Brief (every number traces to a row) |
| 4 | Low (fix at storyboard) | L7 picture | The corner label "一百多人 = 100～199" brings back the off-by-one from r1 note 6 in the picture (strictly, 一百多 is 101–199). Label it **"100～199"** only. The sieve result is the same either way. | art-director | Row 32 (never state what the numbers don't say) |
| 5 | Low (fix at storyboard) | facts.md; L26 picture | Add one row quoting RFC 8017 **Appendix A.1.2 RSAPrivateKey**: the field order version, modulus n, publicExponent e, privateExponent d, prime1 p, prime2 q, exponent1, exponent2, coefficient. This backs "还多存了三个数" exactly as the L26 key-file card draws it (the three extras after n, e, d, p, q). Keep L26's wording as it is. | researcher | "有没有比Wikipedia更靠谱的资源"; brief (every number traces) |
| 6 | Low (heads-up for gate 2b) | Picture column L17, L24, L25 | Several lines put 3–5 text items on screen next to the subtitle in ≤ 4 s. Examples: L25 has "RSA：一种加密方法", the ÷ n → 余数 chain, p × q, n = p × q and the RFC tag; L17 has three labels and two insets. On a ¼-screen phone, that is a slide. Rule for the storyboard: at most one picture label per line besides the subtitle, sized ≥ 40 px. In L24 that one label must be **"35 = 5×7"**, as big as anything in the frame, because the subtitle never says where 35 comes from. Move the RFC tag to the end-card sources (it is already there). | art-director | Row 29 (few words on screen, no slide layout); row 69 (labels ≥ 40 px) |
| 7 | Risk to tell the owner (not blocking) | Whole film | **Density.** With note 1 applied, the 32 lines after the title share ~92.5 s, an average of ~2.9 s per line, and waiting is ~4 %. The owner's ep14 comfort was ~4 s per line and ~20 % waiting (row 65). The music fixes the length, and the brief's must-includes fill it, so I am not cutting content on his behalf. If he wants more air at the morning check, the two cleanest cuts are: (a) merge L13 + L14 into **"《孙子算经》原文：今有物不知其数"** (16 字; the age stays on the card); (b) drop L36 (the odd/even reason, which the cap-pairing picture already shows). Together they free ~5 s for L15 (the 23 conflict) and L38 (the callback). | producer | Row 65; row 12 ("保留精华") |

## What must not change (it works)

- **The opening, verbatim**, L1–L6 at the same timings:
  - 军训 + 一百多人 on frame 0
  - 三次 by 5.6 s and 128 by 8.1 s
  - the legend, then the 加密钥匙 promise
  - no school words anywhere
- **The 128 spine.** The same company runs through the hook, the sieve (L7–L10), the 23 conflict (L15), 都对 (L21), the catch bracket (L37) and the callback (L38–L39).
- **The sieve, one filter per line** (L8–L10, "N人一排多k个" phrasing), as the "why". Then the book's working as the "how", in the reordered sequence 70/21/15 → L17 (70 alone, 4 s) → 233 → 105 → 233 − 2×105 = 23 → 都对 (4 s).
- **The 求一 pair.** L23 (what is sought) + L24 (35 × 2 = 70), paid off at L32–L33 with the gold 1 landing on the gold 1.
- **The honest legend block.** L11 "可最早的记载里，没有韩信" → L12 "韩信点兵，是后来的传说" (banner tags 1275 and 1592, not ribbon stops). Then the book, the original text and 答曰二十三. No 《史记》.
- **The forward-only ribbon:** 3—5世纪 → 1247 → 今天. The 1247 plaque enters from the left at L33; the camera never turns back.
- **The RSA run as rewritten:**
  - L25 RSA 加密 算余数
  - L26 解密钥匙里多存三个数
  - L27 dP · dQ · qInv alone into the silent gap
  - drop 2
  - L30 split, faster, no number
  - L31 stitch back
  - L32 q × qInv 剩1
- **The catch.** Both conditions, the 示意 tag on 4/6, the odd/even reason, and the "一百多" bracket over the 105 ring.
- **Gold = what is left over**, through to the end card.
- **The end card.** The question 韩信点兵这个说法，你第一次在哪听到？ (the only place recognition is invited), the sources line, and the pill 关注 Juno · 一起看懂世界.
- **What is left out on purpose.** No speed-up factor, no 质数 claim, no 周密 book name, no single founding year for 《孙子算经》.
