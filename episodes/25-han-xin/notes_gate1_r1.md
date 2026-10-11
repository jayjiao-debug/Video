# Gate 1 notes: 不数人头，怎么点兵？ script.md + lines.json v1 — verdict: REVISE

Scores (rubric 1–5, only the areas this gate covers): script 3 · visual – · info – · edit – · motion – · sound –

**Script 3. The hook and spine are close to 5; three subtitle clarity faults pull it down.**

What reaches 5:
- Frame 0 shows the viewer's own situation: 军训, 一百多人, the count breaks.
- "排三次队" arrives at 5.6 s and 128 at 8.1 s.
- One 示意 company (128, with remainders 2/3/2) carries the whole film: the hook, the 23 conflict (L16), 都对 (L22), the 一百多 catch (L38) and the callback (L39–40).
- The end-card question invites comments.

What drops to anchor 1 ("a line needs decoding"):
- Bare 孙子 in L17 and L30.
- 求一 is named in L24 but never explained in a subtitle, and L34's payoff depends on it.
- The RSA run L25–L28 is four lines of jargon (RSA, n, p, q, dP, dQ, qInv) with no "why".
- Three demonstration lines carry more picture than ~2.5 s allows (L8, L18, L22).

Overall: the owner would post this with 2–3 notes. The notes below are those notes.

Cold read: no coldread_*.json was supplied for this gate. Run the cold reader on the revised lines, and ask it specifically about L17/L30 (孙子), L24/L34 (求一) and L25–L28 (RSA).

## Facts check

Every number in lines.json traces to a facts row:

| Number(s) in the lines | Facts row or check |
|---|---|
| 128 | #32, a 示意 scenario |
| 100 → 33 → 6 → 1 | CALC, re-run by me: same counts for 101–199 |
| 约1600多年前 | #7, 估算, carried on the card |
| 23 | #3 |
| 70, 21, 15 | #5, re-checked |
| 233, 210 | #4 |
| 105 | #5 and #32 |
| 1247 | #9 |
| dP, dQ, qInv | #29 |
| 剩1 | #29 |
| 4 and 6, 无解 | #33, our arithmetic, tagged 示意 |

The names 秦王暗点兵 (1275) and 韩信点兵 (1592) are backed only by secondary sources (#16, #18). They are not UNVERIFIED, so they are allowed. No UNVERIFIED row is used. No RSA speed-up figure is used, and 《史记》 is not cited.

Two lines rest on the RFC but are not quoted in facts.md:
- L26: n = p × q
- L25: decryption takes a remainder (c^d mod n)

Note 5 closes this.

## Titles, ranked

1. **不数人头，怎么点兵？** It asks exactly what the film answers: three line-ups, read only the leftovers. Its plain reading claims nothing the film doesn't show. 点兵 ties the legend to the 军训 world without asserting history. Use the sub-line as written: 三个小余数，拼回一个大数.
2. **排三次队，数清一百多人.** Concrete and in the viewer's own world, but it reads as a life hack and gives the mechanism away. 数清 also needs the range condition, which the film only states at L38.
3. **韩信点兵，原文没有韩信.** It spends the film's twist in the title and frames a mostly maths/RSA film as a debunking video. It also leans on the viewer already knowing the classic puzzle (owner row 73's spirit).

## Notes

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | High | L24 (66.16) → L33–L34 | **Explain 求一 in a subtitle, not only in the picture.** L24 only names 大衍求一术, and its meaning ("找一个乘数，让余数变成1") lives in small picture text. L34 "这正是秦九韶的求一" is the bridge from 1247 to today, and it only lands if the viewer already knows what 求一 means. Rewrite L24, or add one line in the build, so the subtitle says what is being sought and ties it to 70: 70 is the multiple of 35 that leaves 1 when divided by 3. Example (≤16 字): "求一：找个乘数，让余数刚好剩1". Keep 大衍求一术 on the plaque. | screenwriter | "这句话意义不明确"; owner row 35 (an ordinary viewer must understand what is done and why) |
| 2 | High | L17 (47.49), L30 (83.74) | **Never put a bare 孙子 in a subtitle.** Read alone, "孙子先找三个数" reads as "the grandson…" (or the insult, or Sun Tzu). "西方，就这样称呼孙子的方法" has the same problem. The L11 card fixes this only in the picture, 14 s earlier. Use 《孙子算经》, 原书 or 书里 in the subtitle, e.g. L17 "原书先找三个数：70、21、15" and L30 "西方把《孙子算经》这招，叫作CRT" (15; do not repeat L29's 中国剩余定理). Re-check the 16-字 limit after the change. | screenwriter | "每条字幕单独读也要明白" ("这句话意义不明确") |
| 3 | High | L8 (23.30), L18 (50.13), L22 (60.97), L19 | **Demonstration lines carry more picture than their time.** L8 runs two sieve filters plus the result in 2.96 s. L18 runs nine line-ups (70, 21 and 15, each in rows of 3, 5 and 7) in 2.96 s. L22 lights three seats on a turning ring in 2.13 s, and L22 is the resolution of the 23-vs-128 conflict. On a phone at ¼ screen these will be missed. Targets: split L8 into two lines, one filter each (100→33, then 33→6), each ≥ 2.5 s. Give L18 ≥ 4 s (≈2 bars) and L22 ≥ 4 s. Find the time by cutting L14 (杨辉/秦王暗点兵: a third name for the same thing; keep it as a small picture tag on the 韩 banner) and by tightening the RSA run (note 4). Keep the fixed hits as they are: title 16.625, breakdown 49.04 on Sunzi's working, build 63.2, the silent gap, drop 2 81.43 on "CRT：中国剩余定理". Re-run pace.py. | screenwriter | row 65 ("节奏太快有点看不过来"; 10–12 beats for visual payoffs); row 14 |
| 4 | Med | L25–L28 (68.64–79.30), L31 | **The RSA run needs a reason, and less jargon.** It introduces RSA, n, p, q, 私钥, dP, dQ and qInv in four lines but never says *why* decryption splits into p and q. Splitting turns one huge calculation into two small, faster ones; that is the "what it is for" the brief requires. Spend one subtitle on that reason, with no number (it needs the row from note 5). Give RSA a 2–3 字 gloss on first mention (it is the 钥匙 from L6). Do not add lines or Latin tokens to this run: fold "n = p × q" (L26) into the picture or into L31. Keep the L28 dP · dQ · qInv beat as the set-up for the silent gap. | screenwriter | row 35 (why it was done and what it is for); "这句话意义不明确" |
| 5 | Med | facts.md #28–#30 | **Add the missing RSA quotes** so L25, L26 and the "faster" line trace to rows. (a) RFC 8017 §3.1: the modulus is the product of the primes (n = r_1·r_2… with u = 2: p·q). (b) RFC 8017 §5.1.2 RSADP step 2.a: m = c^d mod n. (c) The [FASTDEC] reference that §3.2 cites: Quisquater & Couvreur, "Fast decipherment algorithm for RSA public-key cryptosystem", Electronics Letters 18(21), 1982. Check its bibliographic data in a source you can open; it supports a qualitative 更快 only. Any speed-up factor stays UNVERIFIED. | researcher | "有没有比Wikipedia更靠谱的资源"; brief "invented numbers" |
| 6 | Med | L7 (20.80) | **Off by one: 一百多人 is not 100 possibilities.** Strictly, 一百多 is 101–199, which is 99 numbers; 100 is "一百", not "一百多". Someone will say so in the comments. I re-ran the sieve on 101–199 and it gives the same 33 → 6 → 1, so only L7 changes. Either say the range ("从100到199，100种可能", keeping the 10×10 grid of 100–199) or say 99 for 101–199. The first is cleaner on screen. | screenwriter | row 32 (never state what the numbers don't say) |
| 7 | Med | Picture column L14–L15 → L23 | **The timeline runs backwards.** The ribbon moves to 1275 (L14) and then 1592 (L15). At L23 the camera "runs forward" to 1247, which is earlier than both, so the camera reverses on the same ribbon. Fix: make the ribbon a forward run only (约3–5世纪 → 1247 → 今天). Show the names the puzzle picked up later (秦王暗点兵 1275, 韩信点兵 1592) as tags on the 韩 banner, not as ribbon stops. Cutting L14 (note 3) makes this easy. | screenwriter | row 67 (one travel direction, no turn-arounds) |
| 8 | Low | L11 (31.51) | "约1600多年前": 约 and 多 hedge twice. Use "1600多年前" in the subtitle; the card already carries 成书约公元3—5世纪 · 学界说法不一 (估). | screenwriter | brief (academic register) |
| 9 | Low | L37 (103.06) | Only the picture explains *why* "除4剩1、除6剩2" has no answer (odd vs even). If the time can be found after note 3, let the subtitle carry the reason, e.g. "除4剩1是单数，除6剩2是双数". Otherwise keep the line and make sure the cap-pairing picture reads in under 3 s. Optional. | screenwriter | rubric area 3 ("needs the subtitle to be understood"), reversed |
| 10 | Low (heads-up for gate 2a, not blocking) | Picture L1–L2, frame 0 | A top-down view of caps with a gold-ringed "你" puts the viewer outside, decoding a symbol. That is what the owner rejected in ep14 ("很难带入"). When sketching looks, try 0–3 s at eye level inside the row, where the shout breaks next to you, then rise to the top-down view for the line-ups. Keep: no full bodies unless pose-checked. | art-director | rows 47, 48; rows 9, 74 (figures) |

## What must not change (it works)

- **The opening.**
  - The 军训 world, with L1 "军训报数，一百多人又报乱了" on frame 0.
  - 128 and the remainders 2/3/2 by 0:11.
  - The promise in L5–L6: the legend, then the 加密钥匙.
  - No school words: no 题, 课本 or 做过.
- **The one-story spine.** The same 128 runs through the hook, the 23 conflict (L16 "原书答案却是：23"), the resolution (L21–L22, 105 and "都对"), the catch (L38) and the callback (L39–L40).
- **The honest legend handling.**
  - L10 "可最早的记载里，没有韩信" and L15 "韩信点兵，是后来的传说".
  - 传说 tags on the banner.
  - No 《史记》.
  - L12 shows the original text in full on the scroll, with 剩二/剩三/剩二 in gold.
- **The sieve as the "why" and Sunzi's 70/21/15 → 233 → −210 → 23 as the "how".** These are two different things; keep both.
- **The silent gap device.** dP · dQ · qInv alone, the three small "CRT"s brighten, then drop 2 lands on "CRT：中国剩余定理" (L28–L29).
- **The 1247 → today bridge** L33–L34 (q × qInv 剩1 → 求一, with the gold 1 landing on the gold 1).
- **The catch.** Both conditions, the 示意 tag on 4/6, and L38's bracket over the 105-ring.
- **Gold = "what is left over"** as the visual through-line. The drill-field grid as the canvas that becomes the tiles, the ring, the scroll and the key card.
- **The end card.** The question 韩信点兵这个说法，你第一次在哪听到？ (recognition invited only here), the sources line, and the follow pill 关注 Juno · 一起看懂世界.
- **What is left out on purpose.** No RSA speed-up number, no 质数 claim, no 周密 book name, and the Qin calendar congruence only as optional picture detail.
