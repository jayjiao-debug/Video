# Script: 不数人头，怎么点兵？  (v1, 2026-10-12, unattended overnight run)

## Choices made without asking (unattended run; please review at gate 1)

1. **The opening world is 军训, not the 韩信 legend.**
   - Owner rows 22, 45 and 47 say the first line must be the viewer's own situation, not a famous detour.
   - A college 军训 company failing its 报数 is something an 18–25 viewer has lived. The legend comes in at L5 as "a story people tell" (传说), and the honest history comes at L10–L15.
2. **The company has 128 people (示意), told to the viewer only as "一百多人".**
   - 128 leaves 2, 3 and 2 when lined up in rows of 3, 5 and 7. Those are the same remainders as the original text (#1), and 128 is the second answer in #32.
   - This lets one story carry the whole film:
     - the hook (128 from three line-ups)
     - the twist (the old book says 23, L16)
     - the mechanism (23, 128 and 233 are all right, L22)
     - the catch (you must know it is 一百多, L38)
     - the callback (L39–L40)
   - 128 and "一百多人" are a scenario, not a historical claim. The picture carries a small 示意 tag in Sc1.
3. **Why three remainders are enough is shown as a sieve over 100–199** (100 → 33 → 6 → 1, arithmetic checked).
   - Sunzi's own working (70/21/15 → 233 → −210 → 23, #4–#5) then shows how it was computed in practice.
   - The sieve says *why* it works and Sunzi says *how*, so the two do not repeat each other.
4. **Cut for time:**
   - Qin Jiushao's 377873/499067 calendar problem (#13). It is kept as an optional picture detail only.
   - Gauss (#22–#23) and the 1852/Matthiessen story (#25–#26).
   - Qin's reputation (#15).
   - The 歌诀 (#19).
   - The folk names 鬼谷算/隔墙算 (#17). 周密's book is never named.
5. **Not used, on purpose:**
   - 《史记》 (#21 UNVERIFIED).
   - Any RSA speed-up figure (#30).
   - "质数" for p and q (the facts rows only say "factor").
   - Any word that points at school (题/课本/做过). L10 says 记载, not 原题. L30 says 方法, not 那道题.
6. **"约1600多年前" is used as the brief asked** (#7, 估算). The picture card adds 「成书约公元3—5世纪 · 学界说法不一」.

---

**Logline:**
- A 军训 company keeps botching its count. Lining up three times (in 3s, 5s and 7s) and looking only at who is left over is enough to say "128".
- The trick is called 韩信点兵, but that is a later legend: the oldest text, 《孙子算经》 (约1600多年前), has no general and no soldiers, just 「今有物不知其数」 with the same remainders. Its answer is 23, and both are right, because the answers repeat every 105.
- 秦九韶 generalised it in 1247 (大衍求一术). Today every RSA private key in the RFC 8017 format stores its "CRT" numbers: decryption works out two small remainders and stitches them back with qInv, the same 求一.
- The catch: the divisors must share no factor, and you must already know the rough size.

**Takeaway:** 三个小余数，能拼回一个大数：前提是除数两两互素，而且你大概知道它有多大。

**Length:** lines run 0.00–114.40 s, then the Juno end card runs 115.87–~122 s (music FIN 121.95). Total ≈ 122 s.

**Music map** (series track `public/bgm.mp3`, played from 0, untouched)
- intro 0–16.625
- **drop 1 at 16.625 (title)**; cold open ends 16.40
- main section from 20.689
- breakdown 49.041 (lands on L17, the start of Sunzi's working)
- build 63.205 (L23 at 63.25: the timeline starts to run forward, 1247 → today)
- **silent gap 79.41–81.43** (no subtitle 79.30–81.45: only dP · dQ · qInv on screen)
- **drop 2 at 81.432 (reveal: L29 "CRT：中国剩余定理" at 81.45)**
- outro texture 115.868 (end card)
- FIN 121.951
- One bar ≈ 2.03 s.

**Checks:**
- `pace.py lines_arr.json --film-end 122`:
  - every line is at or above its reading need, and waiting is 0.0 s = 0 %
  - the only flags are the title (16.40–20.80) and the silent gap (79.30–81.45), both named beats
- 40 lines. All are ≤ 16 glyphs, counting punctuation, digits and Latin letters (max 16: L17 and L22).
- `lines.json` = `[{start, end, text}]` with `[gold]` markup. `lines_arr.json` = the same lines as `[[s, e, "text"]]` for the house tools.
- Arithmetic checked in python:
  - 100–199 → 33 (mod 3 = 2) → 6 (113, 128, 143, 158, 173, 188) → 1 (128)
  - 128 % 3/5/7 = 2/3/2
  - 70/21/15 leave 1 only for 3/5/7 respectively
  - 2×70 + 3×21 + 2×15 = 233; 233 − 210 = 23
  - 105 and 210 leave 0 for 3, 5 and 7
  - no n with n % 4 = 1 and n % 6 = 2

**Visual through-line (for the art director):**
- **Gold = "what is left over".**
  - The leftover students glow gold in every line-up.
  - The 剩二/剩三/剩二 characters on the scroll glow gold.
  - The 1 in 「求一」 and the qInv field in the key glow gold.
  - CRT turns gold on drop 2.
- **The drill-field grid is the canvas.** Seen top-down, each student is a cap (a circle with a brim): countable, no body logic needed, few or no full figures (owner rows 9, 74). The grid becomes:
  - the 100-tile sieve
  - the 105-seat ring
  - the scroll's column grid
  - the key file's field grid
  - the drill field again
- **The timeline ribbon** (约4–5世纪 → 1275 → 1592 → 1247 → today) carries the history and the jump to RSA. Transitions come from moving along it, not from cuts.
- Style: the Tank-episode 2D look (brief). It must not become flat clip-art: give it rich light and texture and keep the camera moving (owner row 72).

---

## Title options (≤ 10 字)

1. **不数人头，怎么点兵？** (recommended)
   - It poses the paradox in the viewer's terms ("how do you count people without counting?") and names the legend (点兵) without claiming it is history.
   - The film answers it exactly: three line-ups and the leftovers.
   - It claims nothing the film does not show.
2. **韩信点兵，原文没有韩信**
   - The honest twist is the hook. It is true (#1, #20: the oldest text has no 韩信) and it surprises people who know the legend.
   - Risks:
     - it gives away the twist
     - it can read as a debunking video, when most of the film is the maths and RSA
     - a quick reader might take it as "韩信 didn't exist", which the film never says
3. **排三次队，数清一百多人**
   - Concrete, practical, and true in the film (L1–L4, L39).
   - It hides the history and the RSA payoff, and "数清" leans on the range condition the film only explains at the end (L38). That is honest but slightly ahead of itself.

**Title-card sub-line (all options):** 三个小余数，拼回一个大数

---

## Beat sheet

| Beat | Time | Purpose | What the viewer learns / feels |
|---|---|---|---|
| Hook (tiny story) | 0–16.4 | Your situation, why it matters, what you'll get | 军训, 一百多人, the count breaks a third time (frustration). Then the promise: line up 3 times, look only at the leftovers → 128. People call it 韩信点兵 (legend), and it still sits inside today's encryption keys. "一百多人" at 0 s, "三次" at 5.6 s, "128" at 8.1 s. |
| Title | 16.6–20.7 | Drop 1 | 《不数人头，怎么点兵？》 · 三个小余数，拼回一个大数 |
| Setup: the idea | 20.8–28.6 | What is done and why it works | 100 possible headcounts. Each remainder strikes most of them out (100 → 33 → 6 → 1), and three remainders leave only 128. |
| Twist: the legend | 28.7–45.2 | Honest history | The oldest record has no 韩信: 《孙子算经》, 约1600多年前, 「今有物不知其数」, with the *same* three remainders. 1275 杨辉: 秦王暗点兵; 韩信点兵 is a later legend (1592 on the card). |
| Evidence 1: Sunzi's working | 45.3–63.1 | How it was computed; why answers repeat | The book's answer is 23 (tension: we said 128). 70/21/15: each one leaves 1 in only one line-up. 2×70 + 3×21 + 2×15 = 233, minus 210 = 23. 105 people fill all three line-ups exactly, so 23, 128 and 233 are all right. |
| Evidence 2 (build): 1247 → today | 63.25–79.3 | General method, then the jump to today | 秦九韶 1247, 大衍求一术. RSA decryption also takes a remainder; the divisor n = p × q; the private key stores three extra numbers: dP, dQ, qInv. |
| Silence | 79.4–81.4 | Breath | The three field names alone. "CRT" faintly visible in their labels. |
| Reveal (payoff) | 81.45–97.5 | Drop 2 | CRT = 中国剩余定理: the West's name for Sunzi's method. Decryption works out two small remainders (÷p, ÷q) and qInv stitches them back. q × qInv leaves 1 when divided by p: that is 秦九韶's 求一. |
| The catch | 97.6–108.7 | Its limits | 1: the divisors must share no factor (4 and 6: no answer, 示意). 2: you must already know the rough size. |
| Ending | 108.8–114.4 | Callback + takeaway | 一百多 → only 128. "下次报数乱了，试试排三次队." |
| End card | 115.87–~122 | Comment bait | Question below |

---

## Lines

Chars = the units `pace.py` counts: Chinese characters, plus one per number or Latin word. Needs = 0.5 + n/7 + 0.6 s.

| # | Start | End | Line (≤ 16 字) | Chars | Needs | Picture (what the viewer sees) | Beat · music | Fact # |
|---|---|---|---|---|---|---|---|---|
| 1 | 0.00 | 2.89 | 军训报数，一百多人又报乱了 | 12 | 2.81 | **Frame 0:** a top-down view of a sunlit drill field, filled by a ragged block of ~128 green training caps (circle + brim, no bodies). Number bubbles are already running over the heads: "…56、57、58、5…". **Beat 1:** one bubble flips red ("5?"), and the whole chain of bubbles collapses back to "0". One cap has a thin gold ring: "你". Corner tag: 示意. | intro · hit on beat 1 | scenario (示意) |
| 2 | 2.99 | 5.45 | 第三遍了，还得从头报 | 9 | 2.39 | A tally in chalk on the field edge: 正 strokes, "第3遍". The bubbles restart at "1、2、3…". The heat shimmers, and a few caps tilt (a sigh). The "你" cap droops. | intro | scenario |
| 3 | 5.55 | 8.01 | 其实，排[三次]队就够了 | 9 | 2.39 | The bubbles freeze and fade. On the beat, the block **snaps into rows of 3**, with the caps sliding into place like beads. The tally becomes three empty boxes: □ □ □. | intro, rising | #34 (logic) |
| 4 | 8.11 | 11.00 | 看每次多出几个，就知道[128]人 | 12 | 2.81 | Three quick re-formations, one per beat. In rows of 3, **2** caps are left over and glow gold. In rows of 5, **3** are left over. In rows of 7, **2** are left over. The boxes fill: 2 · 3 · 2. Then a big gold "128" stamps over the field. | intro | #32 (128); scenario |
| 5 | 11.10 | 13.56 | 传说，[韩信]就这样点兵 | 9 | 2.39 | The painted field lines dissolve into an ink-wash camp seen from above. The caps become a stylised banner army in formation (no weapons, no battle); a faint banner reads 「韩」. A small tag, "传说", sits on the banner. | intro | #20 |
| 6 | 13.66 | 16.40 | 今天，它还藏在加密[钥匙]里 | 11 | 2.67 | The gold leftover dots lift off the formation and fly together into the outline of a **modern key** (a generic key icon with a small "RSA 私钥" tag). From ~15.6 s the camera pushes into the key's bow. | pre-drop | #29 |
| T | 16.63 | 20.69 | *(title card)* | | | **Drop 1:** the push lands, and a framed **command-token plaque** (令牌 shape, wood and gold) slams into frame: **不数人头，怎么点兵？** with the sub-line 三个小余数，拼回一个大数. The caps re-form behind it as a neat grid. | **DROP 1** | — |
| 7 | 20.80 | 23.20 | 一百多人，有100种可能 | 9 | 2.39 | The caps become **100 numbered tiles, 100–199** (10 × 10), all lit. Counter: "可能：100". | main section | arithmetic |
| 8 | 23.30 | 26.27 | 三人排多2、五人排多3：剩[6]种 | 13 | 2.96 | Sieve, filter 1 ("÷3 剩2"): two thirds of the tiles dim on the beat, and the counter rolls 100 → 33. Filter 2 ("÷5 剩3"): more tiles dim, counter → **6** (113, 128, 143, 158, 173, 188 stay lit). | | arithmetic (CALC) |
| 9 | 26.37 | 28.63 | 七人排多2：只剩[128] | 8 | 2.24 | Filter 3 ("÷7 剩2"): five more dim, and **128** alone glows gold. Counter: 1. | | #32; CALC |
| 10 | 28.73 | 31.41 | 可最早的记载里，没有[韩信] | 11 | 2.67 | The 128 tile rolls up like paper and becomes the edge of an **old scroll** unrolling left to right. The banner 「韩」 from L5 fades out above it. | | #20 |
| 11 | 31.51 | 33.91 | 《孙子算经》，约1600多年前 | 9 | 2.39 | Title slip on the scroll: 《孙子算经》卷下. Timeline ribbon under it: "成书约公元3—5世纪 · 学界说法不一 (估)". A small card: "作者孙子：生平不详，不是写兵法的孙武". | | #2, #7 (估算), #8 |
| 12 | 34.01 | 36.69 | 原文只说：今有物不知其数 | 11 | 2.67 | The full original text inks itself in, column by column (woodblock style): 「今有物不知其数，三三数之剩二，五五数之剩三，七七数之剩二，问物几何？」 No people and no soldiers anywhere on the scroll. | | #1 |
| 13 | 36.79 | 39.76 | 三个余数，和我们连队一模一样 | 13 | 2.96 | 剩二 · 剩三 · 剩二 glow **gold**, one per beat. Beside each, a tiny inset of the matching 军训 line-up repeats its gold leftovers (2 · 3 · 2). | | #1 |
| 14 | 39.86 | 42.54 | 南宋杨辉，叫它[秦王暗点兵] | 11 | 2.67 | The camera glides right along the timeline ribbon to a card: "1275 · 杨辉《续古摘奇算法》· 秦王暗点兵". | | #16 |
| 15 | 42.64 | 45.18 | [韩信点兵]，是后来的传说 | 10 | 2.53 | Further along the ribbon, a card: "1592 · 明 · 程大位《算法统宗》· 韩信点兵". The 「韩」 banner reappears beside it with its "传说" tag. | | #18, #20 |
| 16 | 45.28 | 47.39 | 原书答案却是：[23] | 7 | 2.10 | Back on the scroll: 「答曰：二十三」 inks in and a gold "23" rises out of it. A ghost of our "128" hangs beside it, slightly askew: the conflict is visible. | | #3 |
| 17 | 47.49 | 50.03 | 孙子先找三个数：70、21、15 | 10 | 2.53 | **Breakdown.** Three wooden counting blocks drop onto the scroll, one per beat: 70 · 21 · 15. | breakdown 49.04 | #5 |
| 18 | 50.13 | 53.10 | 每个只在一种排法里，多出1个 | 13 | 2.96 | Play it: 70 caps line up in 3s (1 left, gold), then in 5s (0), then in 7s (0). The same happens, faster, for 21 (only the 5s leave 1) and 15 (only the 7s leave 1). Labels: "70 管3 · 21 管5 · 15 管7". | breakdown | #5 |
| 19 | 53.20 | 55.88 | 多几个就拿几份，加起来[233] | 11 | 2.67 | The blocks multiply by the gold remainders: 2 × 70 = 140, 3 × 21 = 63, 2 × 15 = 30. They stack, and a counter rolls to **233**. | | #4 |
| 20 | 55.98 | 58.09 | 再减去[210]，得到23 | 7 | 2.10 | A 210-block lifts off the stack: 233 − 210 = **23**. The scroll's 「二十三」 glows in answer. | | #4 |
| 21 | 58.19 | 60.87 | 105人，三种排法都正好排满 | 11 | 2.67 | 105 caps snap into rows of 3, then 5, then 7, with **zero left over** each time (three clean clicks). Label: "105 = 3×5×7 · 210 = 2×105". | | #5, #32 |
| 22 | 60.97 | 63.10 | 所以23、128、233，[都对] | 7 | 2.10 | The caps close into a **ring of 105 seats**. Seat 23 lights; the ring turns once and 128 lights (our ghost "128" snaps into place, gold); it turns again and 233 lights. Label: "每隔105，一个答案". | | #32 |
| 23 | 63.25 | 66.06 | 1247年，秦九韶写出通用解法 | 11 | 2.67 | **Build.** The ring rolls onto the timeline ribbon and the camera runs forward with it to a card: "1247 · 南宋 · 秦九韶《数书九章》". (Optional small detail on the card: "377873x ≡ 1 (mod 499067) → 457999 · 用于历法".) | **build 63.2** | #9 (#13 optional) |
| 24 | 66.16 | 68.54 | 核心叫[大衍求一术] | 8 | 2.24 | Framed plaque: **大衍求一术**. Under it, one line: "求一：找一个乘数，让余数变成1". A tiny echo: "70 = 35×2 → 除3剩1" with the 1 in gold. | build | #9, #11 |
| 25 | 68.64 | 71.45 | 到今天，[RSA]解密也在算余数 | 11 | 2.67 | The ribbon speeds to "今天". The key from L6 returns, big. On it: "密文 → 大数 ÷ n → 余数 = 明文" (simplified, no exponents shown). Small tag: "IETF RFC 8017 · PKCS #1". | build | #28, #30 |
| 26 | 71.55 | 74.50 | 除数n，是p和q两个数相乘 | 12 | 2.81 | The "n" splits on the beat into two gears, **p** and **q**, with "n = p × q" between them. | build | #29 (factors) |
| 27 | 74.60 | 77.55 | 它的私钥里，专门存了三个数 | 12 | 2.81 | The key opens into a clean **key-file card** with field rows (generic, no real key material): n, e, d, p, q … three rows stay dark, waiting. | build | #29 |
| 28 | 77.65 | 79.30 | [dP]、[dQ]、[qInv] | 3 | 1.53 | The three rows light on three beats: **dP · dQ · qInv**. Beside each, in small grey type, the standard's own words: "CRT exponent · CRT exponent · CRT coefficient". | build peak | #29 |
| — | 79.41 | 81.43 | *(no subtitle)* | | | **Silence.** Everything stills. Only the three fields remain, and the three small "CRT"s brighten slightly. | **SILENT GAP** | — |
| 29 | 81.45 | 83.64 | CRT：[中国剩余定理] | 7 | 2.10 | **Drop 2.** The three "CRT"s fly together and unfold into "Chinese Remainder Theorem" and then, big and gold, **中国剩余定理**. The 孙子算经 scroll unrolls behind the key card. | **DROP 2** | #24, #29 |
| 30 | 83.74 | 86.64 | 西方，就这样称呼孙子的方法 | 12 | 2.81 | Label on the scroll: "Sun Zi Theorem / Chinese Remainder Theorem". The 剩二/剩三/剩二 glow answers the gold. | | #24 |
| 31 | 86.74 | 89.64 | 解密：先算除以p、q的小余数 | 12 | 2.81 | The big number on the key splits into two small boxes: "÷p → 余数 m₁" and "÷q → 余数 m₂". It is the same picture language as the line-ups (two line-ups now, with gold leftovers). | | #30 |
| 32 | 89.74 | 92.22 | 再用[qInv]，拼回解密结果 | 9 | 2.39 | The gold qInv field slides down like a **clasp** and joins the two boxes; they merge back into one "明文" block. | | #30 |
| 33 | 92.32 | 94.94 | q乘qInv，除以p正好剩[1] | 10 | 2.53 | Equation strip: "q × qInv ÷ p → 剩 **1**", with the 1 in gold. | | #29 |
| 34 | 95.04 | 97.52 | 这正是秦九韶的[求一] | 9 | 2.39 | The 1247 plaque **大衍求一术** from L24 slides in, and its gold "1" lands exactly on the qInv "1". | | #11, #29 |
| 35 | 97.62 | 100.10 | 不过，这招有两个[前提] | 9 | 2.39 | The key and the scroll draw back to the drill-field grid. Two small plaques appear: ① ②. | | #33, #34 |
| 36 | 100.20 | 102.96 | 一：除数之间，不能有公因数 | 11 | 2.67 | ①: "3、5、7：两两没有公因数". Three formations side by side, nothing shared between them. | | #33 |
| 37 | 103.06 | 105.96 | 比如除4剩1、除6剩2：无解 | 12 | 2.81 | Tag "示意". Rows of 4 leave 1 (so the count is odd, shown by a pairing of caps); rows of 6 leave 2 (so it is even). The two conditions clash and a red ✕ appears: "4和6都含2". | | #33 (our arithmetic, 示意) |
| 38 | 106.06 | 108.68 | 二：得先知道[大概]有多少 | 10 | 2.53 | ②: the 105-seat ring returns with 23 · 128 · 233 lit. A bracket labelled "一百多" slides over it and covers only 128. | | #32, #34 |
| 39 | 108.78 | 111.40 | 所以一百多人，只能是[128] | 10 | 2.53 | The ring opens back into the **drill field** from frame 0, now orderly. Counter: **128** in gold. The "你" cap rights itself. | callback | #32; scenario |
| 40 | 111.50 | 114.40 | 下次报数乱了，试试排三次队 | 12 | 2.81 | The company re-forms in rows of 3 on the beat, and the 2 gold leftovers blink. The camera cranes up and back over the field and holds. | payoff | #34 (logic) |
| E | 115.87 | ~122 | *(Juno end card)* | | | The field's gold leftover dots gather into the **Juno end card**: J monogram, gold title, question, follow pill 「关注 Juno · 一起看懂世界」, sources. | **outro 115.87 → FIN** | — |

---

## End card

- **Question for comments:** 韩信点兵这个说法，你第一次在哪听到？
  - It is the only place where recognition is invited (owner row 73).
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
| 一百多人, 128, 第三遍, the 军训 company | story scenario; 128 chosen because 128 % 3/5/7 = 2/3/2 | #32 (128 is an answer) | **示意** scenario, tagged in Sc1 |
| 三次 line-ups are enough (given 一百多) | three remainders fix one number within a band of 105 | #34 | OK (logic) |
| 100种可能, 33, 6, 1 (100–199) | 100–199 sieve | — | CALC (python, see Checks) |
| 传说 韩信点兵; 最早的记载里没有韩信 | "Earliest dated texts… no general and no soldiers" | #20 | OK as inference; safe wording used |
| 《孙子算经》卷下 | problem in 卷下 | #2 | OK |
| 约1600多年前; 公元3—5世纪 | 3rd–5th c., disputed | #7 | **估算**, labelled |
| 作者生平不详，不是孙武 (picture card) | MacTutor | #8 | OK (secondary) |
| 今有物不知其数…问物几何 | original text | #1 | OK |
| 剩二 · 剩三 · 剩二 | 2, 3, 2 | #1 | OK |
| 1275, 杨辉, 秦王暗点兵 | Yang Hui 1275 | #16 | OK (name secondary) |
| 1592, 程大位《算法统宗》, 韩信点兵 | 1592 | #18 | OK (name secondary) |
| 答曰：二十三 / 23 | 23 | #3 | OK |
| 70, 21, 15; each leaves 1 in one line-up | 70 = 1 mod 3, 21 = 1 mod 5, 15 = 1 mod 7 | #5 | OK |
| 140, 63, 30, 233 | 2×70 + 3×21 + 2×15 | #4 | OK |
| 210 → 23 | 233 − 210 | #4 | OK |
| 105 = 3×5×7; 210 = 2×105 | 一百六以上，以一百五减之 | #5, #32 | OK |
| 23, 128, 233 都对; 每隔105 | 23, 128, 233, 338 | #32 | OK |
| 1247, 秦九韶, 《数书九章》 | 1247 | #9 | OK |
| 大衍求一术; 求一 = 让余数变成1 | αG ≡ 1 (mod m) | #9, #11 | OK |
| (optional) 377873, 499067, 457999 | Qin's calendar congruence | #13 | OK |
| RSA, RFC 8017, PKCS #1 | IETF standard | #28 | OK |
| 解密 = 大数 ÷ n 的余数 | RSADP | #30 | OK (n = p×q: see unresolved 1) |
| p, q; dP, dQ, qInv; "CRT exponent / coefficient" | RFC 8017 §3.2 | #29 | OK |
| CRT = 中国剩余定理; Sun Zi Theorem | "called the SUN ZI Theorem, or the CRT" | #24 | OK |
| ÷p, ÷q → two remainders → qInv stitches | m₁ = c^dP mod p, m₂ = c^dQ mod q, h, m = m₂ + q·h | #30 | OK |
| q × qInv 除以p剩1 | q * qInv == 1 (mod p) | #29 | OK |
| 两两没有公因数 | pairwise relatively prime | #33 | OK |
| 除4剩1、除6剩2：无解 | our arithmetic | #33 | OK, tagged **示意** |
| 得先知道大概有多少 | band of 105 | #34 | OK (logic) |

---

## Still unresolved / for the director

1. **"n = p × q" (L26) and "大数 ÷ n 取余" (L25)** rest on RFC 8017 (§3.1: n is the product of the primes; RSADP: m = c^d mod n). Facts #29–#30 quote dP/dQ/qInv and the CRT steps, and call p and q "factors", but no row quotes n = p·q or c^d mod n word for word. The researcher can add the §3.1/§5.1.2 sentences. The claim is standard and not a number.
2. **"它的私钥里，专门存了三个数" (L27).** RFC 8017 allows two private-key forms: (n, d), or the quintuple (p, q, dP, dQ, qInv). The line describes the second (CRT) form, which is also the one the ASN.1 RSAPrivateKey carries. If the director wants it airtight, change it to "标准私钥格式里，存了三个数" (same length).
3. **The 军训 scenario is invented (示意).**
   - It is a dramatised viewer situation, not a claim about any real company.
   - Whether a real 教官 would do this is not asserted. L3 is the narrator's suggestion ("其实…就够了").
   - L40 is a light suggestion, not a claim that it is faster.
4. **L15 "韩信点兵，是后来的传说" + the 1592 card.** #18 dates the book (Tohoku catalogue), but the 韩信点兵 name inside it is secondary (PolyU). The card says the name appears there; it does not say it is the first appearance.
5. **"孙子" could be misread as Sun Tzu the strategist.** The L11 card covers it (#8).
6. **Not used (as listed at the top):** #13 (optional picture detail only), #15, #17, #19, #21–#23, #25–#27, #31.
