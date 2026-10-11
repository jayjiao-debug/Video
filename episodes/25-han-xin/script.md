> **Gate 1 r2 must-fix applied by the producer (overnight, 2026-10-12):** deleted old L29 (西方这样称呼…; the link moves into the picture), held CRT：中国剩余定理 81.45–86.77; L30 → 解密：拆成p、q两个小计算，更快. Trace-table placeholders #35/#36/FASTDEC = facts rows #35/#36/#39. `lines.json` is the source of truth; the lines table below may lag these edits.

# Script: 不数人头，怎么点兵？  (v2, 2026-10-12, unattended overnight run, gate-1 round 2)

## Change log v1 → v2 (gate 1 notes_gate1_r1.md + coldread_gate1.json)

Line numbers: "v1 Lxx" means the old numbering. Unmarked numbers are v2.

**Director's notes routed to the screenwriter**
- **Note 1 (求一) → L23 + new L24.**
  - v1 L24 "核心叫大衍求一术" is now L23 "[求一]：找个乘数，让余数剩1". The subtitle now says what is being sought. The plaque still reads 大衍求一术.
  - New L24 "35乘几，除以3剩1？乘2：[70]" ties 求一 to 70. 70 is the multiple of 35 (= 5×7) that leaves 1 when divided by 3 (#11). The viewer met 70 at L16–L17, so this explains the number they already know.
  - L33 "这正是秦九韶的[求一]" now lands on a word that was explained 27 s earlier.
- **Note 2 (bare 孙子) → L16 + L29.**
  - v1 L17 is now L16 "原书先找三个数：70、21、15".
  - v1 L30 is now L29 "西方这样称呼《孙子算经》的方法". This does not repeat 中国剩余定理 or CRT.
  - No subtitle contains a bare 孙子. Every 孙子 is inside 《孙子算经》.
- **Note 3 (overloaded demonstration lines) → L8–L10, L17, L21; v1 L14 cut.**
  - v1 L8 is now two lines, one filter each: L8 "三人一排多2个：剩[33]种" and L9 "五人一排多3个：剩[6]种" (2.56 s each). L10 is the third filter (÷7 → 128).
  - v1 L18 is now L17, 4.00 s (≈2 bars). See the cold-read fix below.
  - v1 L22 is now L21, 4.00 s.
  - v1 L14 (杨辉 / 秦王暗点兵) is cut. 秦王暗点兵 · 1275 is now only a small tag on the 韩 banner (L12).
  - Fixed hits are unchanged:
    - title 16.625
    - breakdown 49.04, inside L17 on 70's first line-up (Sunzi's working)
    - build 63.205, on L22 at 63.25
    - silent gap 79.38–81.45
    - drop 2 81.45 on "CRT：[中国剩余定理]"
    - end card 115.87
- **Note 4 (RSA needs a reason, less jargon) → L25–L27 + L30.**
  - The RSA run before the gap is now three lines. It was four.
    - L25 "到今天，[RSA]加密也在算余数". The first mention glosses RSA as 加密 and brings back the 钥匙 from L6 in the picture.
    - L26 "解密钥匙里，还多存了三个数". 私钥 becomes the plain 解密钥匙. 多存 tells the viewer these are extras.
    - L27 "[dP]、[dQ]、[qInv]" is kept as the set-up for the silent gap.
  - v1 L26 "除数n，是p和q两个数相乘" is cut from the subtitles. "n = p × q" lives in the L25 picture, and the split is said in L30.
  - The reason is one subtitle with no number: L30 "解密：拆成p、q两个小的算，更快". Two small calculations instead of one big one.
  - No Latin tokens were added. The run before the gap now has fewer of them (n is gone).
- **Note 6 (一百多 ≠ 100) → L7 "从100到199，100种可能".** The 10 × 10 grid of 100–199 is kept. Re-checked: 100 → 33 → 6 → 1 (128).
- **Note 7 (timeline backwards) → the ribbon only runs forward: 约公元3—5世纪 (L13) → 1247 (L22) → 今天 (L25).**
  - 1275 秦王暗点兵 and 1592 韩信点兵 are tags on the 韩 banner in L12. They are not stops on the ribbon. There are no turn-arounds.
- **Note 8 → L13 "《孙子算经》，1600多年前"** (约 dropped). The card keeps 成书约公元3—5世纪 · 学界说法不一 (估).
- **Note 9 (optional, done) → L35 + new L36 "一个要单数，一个要双数".** The reason for 无解 is now in the subtitle as well as the picture.
- **Note 5** is routed to the researcher. As instructed, the lines rely on the two standard RFC 8017 facts being added in parallel: n = p × q (§3.1) and m = c^d mod n (§5.1.2). They are cited below as **#35** and **#36**.
- **Note 10** is routed to the art director. The picture for L1–L2 is left as v1 so the art director can try the eye-level opening.

**Cold reader's confusions**
- **"#18 每个只在一种排法里，多出1个 means nothing as text" → L17 "70人三人一排多1，五人七人排满".**
  - It gives one concrete case, in the same "N人一排" words as L8–L10.
  - The picture plays 70, then faster 21 (only rows of 5 leave 1) and 15 (only rows of 7 leave 1), with labels.
- **"#20 why 210 before 105?" → reordered.**
  - L19 "105人：三种排法都排满" comes first.
  - Then L20 "233减两个105：正是[23]". The subtraction now follows its reason.
  - 210 stays in the picture: 「以二百一十减之」 · 210 = 2×105.
- **"#25–#28 RSA wall of jargon / divisor of what?"**
  - L25 says RSA 加密 computes remainders. That is the "divides something" the reader was missing.
  - 私钥 → 解密钥匙. The 除数n line is gone.
  - L30 says why the job is split into p and q (更快). L31 says what is stitched back: "把两个结果拼回来".
  - dP · dQ · qInv stay, but only as the 2-second mystery before the gap. After the drop, the picture shows dP → the p-side box, dQ → the q-side box, qInv → the clasp.
- **"#8 三人排多2 reads like '3 people, 2 extra'" → "三人一排多2个"** in L8–L10 (the reader's own suggestion).
- **"#13 who is 我们?" → v1 L13 is merged into L15 "同样的余数，原书答案却是[23]".** 我们 is gone. The merge also frees 2 s for note 3.
- **"#7 一百多人，有100种可能 reads strangely" → fixed by note 6 (L7).**
- **"#35–#36 4 and 6 too fast" → fixed by note 9 (L36).**
- **Not changed:**
  - "#4 多出几个 vague at first". This is in the protected opening. L8–L10 make it concrete 12 s later, as the reader said.
  - The 16.4–20.7 title gap. It is the title card on drop 1, a named beat.

**Kept exactly (director's "don't change" list)**
- L1–L6, verbatim and on the same timings.
- L11 "可最早的记载里，没有[韩信]" and L12 "[韩信点兵]，是后来的传说", verbatim.
  - L12 now follows L11 directly, so the legend is handled in one block before the source is shown.
- The 128 spine: hook → L15 "…原书答案却是[23]" (the conflict wording is kept inside the merged line) → L21 都对 → L37 catch → L38–L39 callback.
- The sieve as the "why" (L7–L10) and Sunzi's 70/21/15 → 233 → −210 → 23 as the "how" (L16–L20).
- The silent gap device: L27 alone, then the three "CRT"s, then drop 2 on L28.
- The 1247 → today bridge (L32–L33).
- Both catch conditions, 示意 on 4/6, and the bracket over the 105-ring.
- Gold = what is left over.
- The end card question and the follow pill.
- Everything left out on purpose: no speed-up number, no 质数, no 周密, no 《史记》.

**Choices made without asking (unattended)**
- **v1 L35 "不过，这招有两个前提" is folded into the two conditions:**
  - L34 "不过，除数之间不能有公因数"
  - L37 "而且，得先知道[大概]有多少"
  - The ① ② plaques stay in the picture. This bought the time for L36.
- **Titles:** v1's #3 "排三次队，数清一百多人" is replaced. Both the director and the cold reader said it oversells; 数清 needs the range condition. The new #3 is "从点兵，到加密钥匙".

---

**Logline:**
- A 军训 company keeps botching its count. Lining up three times (in 3s, 5s and 7s) and looking only at who is left over is enough to say "128".
- 韩信点兵 is a later legend. The oldest record, 《孙子算经》 (1600多年前), has no general, only 「今有物不知其数」 with the same remainders. Its answer is 23, and both are right, because subtracting 105 never changes a remainder.
- 秦九韶 (1247) made it a general method built on 求一: find a multiplier that leaves remainder 1. Today RSA decryption splits one big calculation into two small ones (p and q) because that is faster, and stitches them back with qInv, a 求一 number.
- The catch: the divisors must share no factor, and you must already know the rough size.

**Takeaway:** 三个小余数，能拼回一个大数：前提是除数互不相干，而且你大概知道它有多大。

**Length:** lines 0.00–115.30 s, then the Juno end card 115.87–~122 s (FIN 121.95). Total ≈ 122 s. 39 lines (v1: 40).

**Music map** (series track, played from 0, untouched)
- intro 0–16.625; cold open ends 16.40
- **drop 1 16.625 (title)**
- main 20.689 (L7 at 20.70)
- breakdown 49.041 (inside L17: 70 caps snap into rows of 3)
- build 63.205 (L22 at 63.25: the ring rolls onto the ribbon and runs forward to 1247)
- **silent gap 79.41–81.43** (no subtitle 79.38–81.45)
- **drop 2 81.432 (L28 "CRT：[中国剩余定理]" at 81.45)**
- outro 115.868 (end card)
- FIN 121.951
- One bar ≈ 2.03 s.

**Checks**
- `pace.py lines_arr.json --film-end 122`:
  - every line is at or above its reading need
  - waiting 1.9 s = **2 %**, all of it on L21 (都对, held on purpose to 4.0 s while the ring turns)
  - flags: the title gap (16.4–20.7) and the silent gap (79.4–81.5), both named beats
- 39 lines, all ≤ 16 glyphs counting punctuation, digits and Latin letters. The max is 16: L16, L17, L24, L30.
- `lines.json` = `[{start, end, text}]` with `[gold]` markup. `lines_arr.json` = the same lines as `[[s, e, "text"]]`.
- Arithmetic re-run in python:
  - 100–199 → 33 → 6 (113, 128, 143, 158, 173, 188) → 1 (128)
  - 35 × 2 = 70, and 70 % 3 = 1
  - 2×70 + 3×21 + 2×15 = 233; 233 − 2×105 = 23
  - 105 % 3/5/7 = 0
  - no n < 1000 with n % 4 = 1 and n % 6 = 2

**Visual through-line (for the art director):** unchanged from v1.
- Gold = "what is left over".
- Top-down caps on the drill-field grid. The grid becomes the 100-tile sieve, the scroll, the 105-seat ring, the key card, and the field again.
- **The timeline ribbon now runs one way only:** 约公元3—5世纪 → 1247 → 今天. Later names are banner tags, not ribbon stops.
- Tank-episode 2D look, rich light, the camera always moving (owner row 72).

---

## Title options (≤ 10 字)

1. **不数人头，怎么点兵？** (recommended; the director's #1)
   - It asks exactly what the film answers: three line-ups, and you read only the leftovers.
   - 点兵 names the legend without claiming it is history, and it fits the 军训 world.
   - Its plain reading claims nothing the film does not show.
   - Sub-line: 三个小余数，拼回一个大数.
2. **韩信点兵，原文没有韩信** (the cold reader's click)
   - The honest twist as a hook. It is true (#1, #20) and it surprises anyone who knows the phrase.
   - Risks:
     - It gives the twist away.
     - It frames a mostly maths/RSA film as a debunk, so history-clickers may feel baited.
     - It leans on the viewer already knowing the puzzle.
3. **从点兵，到加密钥匙** (new; replaces v1's 排三次队，数清一百多人, which oversold)
   - An odd pair (counting soldiers ↔ encryption keys) that makes people ask "how?". It spans the whole film: legend → key.
   - It claims only what L5–L6 already promise: the legend (点兵) and today's 加密钥匙.
   - Risk: it has no number, so it is less concrete than #1.

---

## Beat sheet

| Beat | Time | Purpose | What the viewer learns / feels |
|---|---|---|---|
| Hook (tiny story) | 0–16.4 | Your situation, why it matters, what you'll get | Unchanged. 一百多人 at 0 s, 三次 at 5.6 s, 128 at 8.1 s, then the legend and the encryption key. |
| Title | 16.6–20.7 | Drop 1 | 《不数人头，怎么点兵？》 · 三个小余数，拼回一个大数 |
| Setup: the idea | 20.7–31.0 | What is done, why it works | 100 possible counts (100–199). Each line-up strikes most of them out: 100 → 33 → 6 → 1 = 128. One filter per line. |
| Twist: the legend | 31.1–44.6 | Honest history | No 韩信 in the earliest record. 韩信点兵 is a later legend (banner tags 1275 / 1592). The record is 《孙子算经》, 1600多年前, 「今有物不知其数」. Same remainders, yet the book's answer is 23 (conflict). |
| Evidence 1: the book's working | 44.7–63.1 | How it was computed; why answers repeat | 70/21/15. 70 leaves 1 only in rows of 3 (21 and 15 the same for 5 and 7, shown). Take as many as are left over: 233. 105 fills every line-up, so 233 minus two 105s = 23. So 23, 128 and 233 are all right. |
| Evidence 2 (build): 1247 → today | 63.25–79.38 | General method, then the jump | 秦九韶 1247. 求一 = find a multiplier so the remainder is 1; 35 × 2 = 70 is one. RSA 加密 also computes remainders; its decryption key stores three extra numbers: dP, dQ, qInv. |
| Silence | 79.4–81.4 | Breath, mystery | What are those three for? The "CRT"s brighten. |
| Reveal (payoff) | 81.45–98.0 | Drop 2 | CRT = 中国剩余定理, the West's name for the method in 《孙子算经》. Decryption is split into p and q, two small calculations, which is faster. qInv stitches the two results back together, because q × qInv leaves 1 when divided by p: 秦九韶's 求一. |
| The catch | 98.1–109.6 | Its limits | 1: the divisors must share no factor (4 and 6: odd vs even, no answer, 示意). 2: you must know the rough size. |
| Ending | 109.7–115.3 | Callback | 一百多 → only 128. 下次报数乱了，试试排三次队. |
| End card | 115.87–~122 | Comment bait | Question below |

---

## Lines

Chars = the units `pace.py` counts (Chinese characters plus one per number or Latin word). Needs = 0.5 + n/7 + 0.6 s.

| # | Start | End | Line (≤ 16 字) | Chars | Needs | Picture (what the viewer sees) | Beat · music | Fact # |
|---|---|---|---|---|---|---|---|---|
| 1 | 0.00 | 2.89 | 军训报数，一百多人又报乱了 | 12 | 2.81 | (as v1) **Frame 0:** sunlit drill field from above, a ragged block of ~128 green caps (circle + brim, no bodies), number bubbles running "…56、57、58、5…". **Beat 1:** one bubble flips red and the chain collapses to "0". Gold-ringed cap "你". Corner tag 示意. *(Art director: see note 10, eye-level variant.)* | intro · hit on beat 1 | scenario (示意) |
| 2 | 2.99 | 5.45 | 第三遍了，还得从头报 | 9 | 2.39 | (as v1) Chalk tally "第3遍"; the bubbles restart; caps tilt in a sigh; the "你" cap droops. | intro | scenario |
| 3 | 5.55 | 8.01 | 其实，排[三次]队就够了 | 9 | 2.39 | (as v1) The bubbles freeze; on the beat the block snaps into rows of 3. Tally → □ □ □. | intro, rising | #34 |
| 4 | 8.11 | 11.00 | 看每次多出几个，就知道[128]人 | 12 | 2.81 | (as v1) Three re-formations, one per beat: rows of 3 → **2** gold leftovers, rows of 5 → **3**, rows of 7 → **2**. Boxes fill 2 · 3 · 2. Gold "128" stamps over the field. | intro | #32; scenario |
| 5 | 11.10 | 13.56 | 传说，[韩信]就这样点兵 | 9 | 2.39 | (as v1) The field dissolves into an ink-wash camp; a stylised banner army (no weapons); banner 「韩」 with tag "传说". | intro | #20 |
| 6 | 13.66 | 16.40 | 今天，它还藏在加密[钥匙]里 | 11 | 2.67 | (as v1) The gold leftover dots fly together into a modern key outline (tag "RSA 私钥"); push into the key's bow from ~15.6 s. | pre-drop | #29 |
| T | 16.63 | 20.69 | *(title card)* | | | (as v1) **Drop 1:** command-token plaque slams in: **不数人头，怎么点兵？** · 三个小余数，拼回一个大数. Caps re-form behind as a neat grid. | **DROP 1** | — |
| 7 | 20.70 | 22.98 | 从100到199，100种可能 | 8 | 2.24 | The caps become **100 numbered tiles, 100–199** (10 × 10), all lit. Corner label "一百多人 = 100～199". Counter "可能：100". | main 20.69 | arithmetic |
| 8 | 23.08 | 25.64 | 三人一排多2个：剩[33]种 | 10 | 2.56 | Filter 1 only. Header chip: a tiny row of 3 caps + 2 gold leftovers, "三人一排 · 多2". On the beat, two thirds of the tiles dim; counter rolls **100 → 33**. | | CALC |
| 9 | 25.74 | 28.30 | 五人一排多3个：剩[6]种 | 10 | 2.56 | Filter 2 only. Chip "五人一排 · 多3". More tiles dim; counter **33 → 6**. The six survivors pulse: 113 · 128 · 143 · 158 · 173 · 188. | | CALC |
| 10 | 28.40 | 30.96 | 七人一排多2个：只剩[128] | 10 | 2.56 | Filter 3. Chip "七人一排 · 多2". Five more dim; **128** alone glows gold. Counter: 1. | | #32; CALC |
| 11 | 31.06 | 33.77 | 可最早的记载里，没有[韩信] | 11 | 2.71 | The 128 tile rolls up like paper into the edge of an **old scroll** unrolling left to right; plain columns, no figures. Above it, the 「韩」 banner from L5 fades to a ghost. | | #20 |
| 12 | 33.87 | 36.43 | [韩信点兵]，是后来的传说 | 10 | 2.56 | The ghost banner returns beside the scroll with its "传说" tag and two small hanging **tags** (not timeline stops): "1275 · 杨辉 · 秦王暗点兵" and "1592 · 程大位《算法统宗》· 韩信点兵". Then the banner drifts off frame. | | #16, #18, #20 |
| 13 | 36.53 | 38.82 | 《孙子算经》，1600多年前 | 8 | 2.29 | Title slip on the scroll: 《孙子算经》卷下. Under it, the **timeline ribbon begins** (its first and leftmost stop): "成书约公元3—5世纪 · 学界说法不一 (估)". A small card: "作者生平不详，不是写兵法的孙武". | | #2, #7 (估算), #8 |
| 14 | 38.92 | 41.63 | 原文只说：今有物不知其数 | 11 | 2.71 | The full original text inks in column by column: 「今有物不知其数，三三数之剩二，五五数之剩三，七七数之剩二，问物几何？」 No people anywhere on the scroll. | | #1 |
| 15 | 41.73 | 44.58 | 同样的余数，原书答案却是[23] | 12 | 2.85 | 剩二 · 剩三 · 剩二 glow **gold** in turn, each with a tiny inset of our line-up's 2 · 3 · 2. Then 「答曰：二十三」 inks in and a gold **23** rises; our ghost "128" hangs beside it, askew (the conflict). | | #1, #3 |
| 16 | 44.68 | 47.24 | 原书先找三个数：70、21、15 | 10 | 2.56 | Three wooden counting blocks drop onto the scroll, one per beat: **70 · 21 · 15**. | | #5 |
| 17 | 47.34 | 51.34 | 70人三人一排多1，五人七人排满 | 14 | 4.00 | **Breakdown (49.04) lands on the first click.** 70 caps line up in rows of 3: **1 gold leftover**. Rows of 5: 0. Rows of 7: 0 (two clean clicks). Label "70：只在三人一排时多1". Then, at double speed, two small insets: "21：只在五人一排时多1" and "15：只在七人一排时多1", each with its one gold cap. | **breakdown 49.04** | #5 |
| 18 | 51.44 | 54.15 | 多几个就拿几份，加起来[233] | 11 | 2.71 | The blocks multiply by our gold leftovers: 70 × **2** = 140, 21 × **3** = 63, 15 × **2** = 30. They stack; the counter rolls to **233**. | | #4 |
| 19 | 54.25 | 56.67 | 105人：三种排法都排满 | 9 | 2.42 | 105 caps snap into rows of 3, then 5, then 7, with **zero left over** each time (three clean clicks). Label "105 = 3×5×7 · 拿走它，多出的人数不变". | | #5, #32 |
| 20 | 56.77 | 59.05 | 233减两个105：正是[23] | 8 | 2.28 | Two 105-blocks lift off the 233 stack, one per beat: 233 → **128** (gold flash: "our" number) → **23**. Small scroll caption: 「以二百一十减之」 · 210 = 2×105. The scroll's 「二十三」 glows. | | #4, #5 |
| 21 | 59.15 | 63.15 | 所以23、128、233，[都对] | 7 | 4.00 | The caps close into a **ring of 105 seats**. Seat 23 lights; the ring turns once and 128 lights (the ghost "128" snaps into place, gold); it turns again and 233 lights. Label "每隔105，一个答案". The ring keeps turning slowly to the end of the line. | | #32 |
| 22 | 63.25 | 66.02 | 1247年，秦九韶写出通用解法 | 11 | 2.77 | **Build (63.2).** The ring rolls onto the timeline ribbon and the camera runs **forward** (left → right, the only direction it ever goes) from 3—5世纪 to a card: "1247 · 南宋 · 秦九韶《数书九章》". A framed plaque rises: **大衍求一术**. (Optional small detail on the card: "377873x ≡ 1 (mod 499067) → 457999 · 用于历法".) | **build 63.2** | #9 (#13 optional) |
| 23 | 66.12 | 68.90 | [求一]：找个乘数，让余数剩1 | 11 | 2.78 | Close on the plaque; the characters **求一** brighten gold. Under them a slot machine of multipliers: "× ?" spins, and a remainder readout beside it flickers 2 … 0 … **1** (gold), then stops. | build | #11 |
| 24 | 69.00 | 71.77 | 35乘几，除以3剩1？乘2：[70] | 11 | 2.77 | The 70-block from L16 returns. A 35-block (label "35 = 5×7：五人、七人都排满") is copied ×1 (35 ÷ 3 剩 2, grey) → ×2 = **70** (÷ 3 剩 **1**, gold). The 70 slots back onto the scroll: "70，就是一次求一". | build | #5, #11 (CALC: 35×2=70, 70 mod 3 = 1) |
| 25 | 71.87 | 74.64 | 到今天，[RSA]加密也在算余数 | 11 | 2.77 | The ribbon speeds **forward** to "今天". The key from L6 returns, big. On it, plainly: "RSA：一种加密方法". Below: "密文 → 巨大的数 ÷ n → 余数 = 明文" (no exponents), and the n quietly splits into two gears labelled **p × q** ("n = p × q"). Tag: "IETF RFC 8017 · PKCS #1". | build | #28, #35, #36 |
| 26 | 74.74 | 77.66 | 解密钥匙里，还多存了三个数 | 12 | 2.92 | The key opens into a clean **key-file card** with field rows (generic, no real key material): n, e, d, p, q … then three rows stay dark, waiting. | build | #29 |
| 27 | 77.76 | 79.38 | [dP]、[dQ]、[qInv] | 3 | 1.62 | The three rows light on three beats: **dP · dQ · qInv**. Beside each, in small grey type, the standard's own words: "CRT exponent · CRT exponent · CRT coefficient". | build peak | #29 |
| — | 79.41 | 81.43 | *(no subtitle)* | | | **Silence.** Everything stills; only the three fields remain, and the three small "CRT"s brighten slightly. | **SILENT GAP** | — |
| 28 | 81.45 | 83.63 | CRT：[中国剩余定理] | 7 | 2.18 | **Drop 2.** The three "CRT"s fly together and unfold into "Chinese Remainder Theorem", then, big and gold, **中国剩余定理**. The scroll unrolls behind the key card. | **DROP 2** | #24, #29 |
| 29 | 83.73 | 86.77 | 西方这样称呼《孙子算经》的方法 | 13 | 3.04 | Label on the scroll: "Sun Zi Theorem / Chinese Remainder Theorem". The 剩二/剩三/剩二 glow answers the gold. | | #24 |
| 30 | 86.87 | 89.90 | 解密：拆成p、q两个小的算，更快 | 13 | 3.03 | One giant block "÷ n" (slow, grinding progress bar) **cracks into two small blocks** "÷ p" and "÷ q", fed by the dP and dQ rows. Each is now a small line-up with gold leftovers; both finish while the giant block's ghost bar is still crawling. Words only, **no speed number**. | | #28, #30, #35 |
| 31 | 90.00 | 92.76 | 再用[qInv]，把两个结果拼回来 | 11 | 2.76 | The gold qInv row slides down like a **clasp**, joins the two small results, and they merge into one "明文" block. | | #30 |
| 32 | 92.86 | 95.47 | q乘qInv，除以p正好剩[1] | 10 | 2.61 | Equation strip: "q × qInv ÷ p → 剩 **1**", with the 1 in gold. | | #29 |
| 33 | 95.57 | 98.04 | 这正是秦九韶的[求一] | 9 | 2.47 | The 1247 plaque **大衍求一术** slides in from the left (it comes from the past, so it enters; the camera does not turn back). Its gold "1" lands exactly on the qInv "1". | | #11, #29 |
| 34 | 98.14 | 101.03 | 不过，除数之间不能有公因数 | 12 | 2.89 | The key and the scroll draw back to the drill-field grid. Plaque ① appears: "3、5、7：两两没有公因数". Three formations side by side, nothing shared between them. | | #33 |
| 35 | 101.13 | 104.03 | 比如除4剩1、除6剩2：[无解] | 12 | 2.90 | Tag "示意". Two formations: rows of 4 with 1 left over, rows of 6 with 2 left over. A red ✕ between them: "4和6都含2". | | #33 (our arithmetic, 示意) |
| 36 | 104.13 | 106.74 | 一个要单数，一个要双数 | 10 | 2.61 | The caps pair off two by two. Under rows of 4, one cap is left unpaired: "单数". Under rows of 6, all pair up: "双数". The same crowd can't be both, and the ✕ pulses once. | | #33 (示意) |
| 37 | 106.84 | 109.59 | 而且，得先知道[大概]有多少 | 11 | 2.75 | Plaque ②. The 105-seat ring returns with 23 · 128 · 233 lit. A bracket labelled "一百多" slides over it and covers only 128. | | #32, #34 |
| 38 | 109.70 | 112.30 | 所以一百多人，只能是[128] | 10 | 2.60 | The ring opens back into the **drill field** from frame 0, now orderly. Counter: **128** in gold. The "你" cap rights itself. | callback | #32; scenario |
| 39 | 112.40 | 115.30 | 下次报数乱了，试试排三次队 | 12 | 2.90 | The company re-forms in rows of 3 on the beat, and the 2 gold leftovers blink. The camera cranes up and back over the field and holds into the end card. | payoff | #34 |
| E | 115.87 | ~122 | *(Juno end card)* | | | (as v1) The gold leftover dots gather into the Juno end card: J monogram, gold title, question, follow pill 「关注 Juno · 一起看懂世界」, sources. | **outro 115.87 → FIN** | — |

---

## End card (unchanged)

- **Question for comments:** 韩信点兵这个说法，你第一次在哪听到？
  - This is the only place where recognition is invited (owner row 73).
  - Alt: 如果只能看"剩几个"，你还想数什么？
- **@ prompt:** @军训时总报错数的那位
- **Sources line:**
  - 《孙子算经》卷下 (Project Gutenberg #24038)
  - 王翼勳《數學傳播》35(3), 2011
  - Shen Kangsheng, *Arch. Hist. Exact Sci.* 38, 1988
  - 秦九韶《数书九章》1247 (Ho Peng-Yoke, DSB)
  - 文耀光《數學傳播》23(3), 1999
  - H. W. Lee, PolyU AMA1D01C notes
  - IETF RFC 8017 (2016)

---

## Every number or named claim on screen → facts row

| On screen | Value / wording | Row | Status |
|---|---|---|---|
| 一百多人, 128, 第三遍, the 军训 company | story scenario; 128 % 3/5/7 = 2/3/2 | #32 | **示意**, tagged in Sc1 |
| 三次 line-ups are enough (given 一百多) | three remainders fix one number within a band of 105 | #34 | OK (logic) |
| 100到199, 100种, 33, 6, 1 | 100–199 sieve | — | CALC (python) |
| 最早的记载里没有韩信; 韩信点兵是后来的传说 | earliest dated texts have no general or soldiers | #20 | OK as inference; safe wording |
| 1275 杨辉 秦王暗点兵 (banner tag) | Yang Hui 1275 | #16 | OK (name secondary) |
| 1592 程大位《算法统宗》韩信点兵 (banner tag) | 1592 | #18 | OK (name secondary) |
| 《孙子算经》卷下; 1600多年前; 公元3—5世纪 | 3rd–5th c., disputed | #2, #7 | **估算**, hedged on the card |
| 作者生平不详，不是孙武 (card) | MacTutor | #8 | OK (secondary) |
| 今有物不知其数…问物几何; 剩二/剩三/剩二 | original text | #1 | OK |
| 答曰：二十三 / 23 | 23 | #3 | OK |
| 70, 21, 15; each leaves 1 in only one line-up | 70 ≡ 1 (3), 21 ≡ 1 (5), 15 ≡ 1 (7), 0 for the others | #5 | OK |
| 140, 63, 30, 233 | 2×70 + 3×21 + 2×15 | #4 | OK |
| 105 = 3×5×7; 233 − 2×105 = 23; 210 = 2×105 | 以二百一十减之; 一百六以上，以一百五减之 | #4, #5, #32 | OK |
| 23, 128, 233 都对; 每隔105 | 23, 128, 233, 338 | #32 | OK |
| 1247, 秦九韶, 《数书九章》, 大衍求一术 | 1247 | #9 | OK |
| 求一 = 找个乘数，让余数剩1 | αG ≡ 1 (mod m) | #11 | OK |
| 35 × 2 = 70, 除以3剩1 (35 = 5×7) | 70 = 衍数 35 × 乘率 2 for modulus 3 | #11, #5 | OK; CALC |
| (optional) 377873, 499067, 457999 | Qin's calendar congruence | #13 | OK |
| RSA 加密, RFC 8017, PKCS #1 | IETF standard | #28 | OK |
| 加密/解密 算余数 (÷ n → 余数) | m = c^d mod n (RFC 8017 §5.1.2 RSADP) | **#36** | standard; researcher adding the row in parallel |
| n = p × q (picture) | RFC 8017 §3.1, u = 2 | **#35** | standard; researcher adding the row in parallel |
| dP, dQ, qInv; "CRT exponent / coefficient"; 解密钥匙里多存的三个数 | RFC 8017 §3.2 | #29 | OK (see unresolved 2) |
| CRT = 中国剩余定理; Sun Zi Theorem | Shen 1988 p.287 | #24 | OK |
| 拆成p、q两个小的算，更快 (no number) | "observed the benefit of applying the CRT to RSA operations" [FASTDEC] | #28 (+ #39, note 5c) | OK qualitative; no factor |
| ÷p, ÷q → two results → qInv stitches | m₁ = c^dP mod p, m₂ = c^dQ mod q, h, m = m₂ + q·h | #30 | OK |
| q × qInv 除以p剩1 | q * qInv == 1 (mod p) | #29 | OK |
| 除数之间不能有公因数 | pairwise relatively prime | #33 | OK |
| 除4剩1、除6剩2 无解; 一个要单数，一个要双数 | our arithmetic (odd vs even) | #33 | OK, tagged **示意** |
| 得先知道大概有多少 | band of 105 | #34 | OK (logic) |

---

## Still unresolved / for the director

1. **#35 / #36 row numbers.** The researcher is adding the RFC 8017 rows (n = p × q; m = c^d mod n) and the [FASTDEC] reference in parallel. Replace "#35 / #36 / #39" with their row numbers once facts.md is updated.
   - L30's "更快" is qualitative only. It rests on #28 ("benefit") and the FASTDEC paper's own title ("Fast decipherment…"), which RFC 8017 cites.
2. **L26 "解密钥匙里，还多存了三个数".** RFC 8017 allows two private-key forms. The line describes the CRT form (the quintuple, also the ASN.1 RSAPrivateKey). 多存 marks the three numbers as extras on top of what decryption strictly needs. If the director wants it airtight: "标准解密钥匙里，多存三个数" (same reading time).
3. **L17 explains only 70 in the subtitle.** 21 and 15 are shown by analogy in the picture, with labels. This was the only way to give the line 4 s and keep it readable alone. If the cold reader still trips here, the fix is a picture fix (bigger 21/15 labels), not another line.
4. **L15 merges v1 L13 + L16.** The protected wording "原书答案却是[23]" is kept inside it. If the director prefers the two v1 lines, the 2.8 s would have to come out of L17 or L21, which note 3 lengthened.
5. **The breakdown (49.04) now lands inside L17** (70's first click), not on the first block dropping. It is still on the book's working, as note 3 asked.
6. **The 军训 scenario is invented (示意)**, as in v1.
