# Gate 1 notes: 死后会变慢的钟 script v1 / lines.json — verdict: REVISE (round 1; one owner decision attached, see note 9, it does not block the revision)

Scores (rubric 1–5, only the areas this gate covers): script **3** (4–5 once notes 1–3 are in) · info **4** (planned) · visual – · edit – · motion – · sound –

No cold-read was provided for this round, so this judgement is the director's alone. There is no previous round to compare with. I compared against ep14 《你以为大家都在看你》 final, the film the owner approved after his "节奏太快有点看不过来" note (owner row 65).

**What I checked**
- `pace.py lines_arr.json --film-end 122`
  - The draft has 38 lines in 115 s, with **0 % waiting**.
  - The ep14 film the owner approved has 26 lines in 114 s, with **21 % waiting**.
  - Owner row 65 says that room is what he wants for this kind of film: about 4 s per line after the title.
  - This draft gives about 2.8 s per line. That is the density he called "看不过来".
- `script.facts_flags.json` is empty, so no banned sources were found.
- Every line is ≤ 16 glyphs.
- The music anchors are respected:
  - title on drop 1 (16.625)
  - breakdown at 49.04 = the test
  - build at 63.2 = the China lab
  - silent gap at 79.4–81.4 = the flat gauge
  - drop 2 at 81.432 = the spike
  - end card at 115.87

**Opening test** (owner rows 22, 35, 36, 45, 47, 48)
- Frame 0 is the viewer's own phone, aimed at a museum label. The focus square lands on beat 1, at 0.44 s.
- The contradiction is clear by about 4 s: the label says 几千年, but the charcoal carries no date.
- The countable number is on the picture at 5.2 s (15 dots).
- The question is never asked out loud.
- A 20-year-old who photographs exhibits (博物馆热) can say "这说的就是我". It passes.
- The only weak point is L6 (note 2).

**Fact trace** (lines.json order; every number must trace to a verified row)
- L3 15 → #23 ✓
- L11 5730 → #25 ✓
- L12 1/4 → 1.1万: 2 × 5730 = 11,460. This is arithmetic, but no row states it (note 8a).
- L18 1949 → #17 ✓
- L19 约4600年前: ✗ against today's date (note 4)
- L20 quote → #20 ✓ (attribution, note 6)
- L21 1960 → #15 ✓
- L22 1959 → #12 ✓ (wording, note 6)
- L23 1965 → #11, #13 ✓
- L24 4块 → #13 ✓
- L25 第一间 → #11 ✓
- L27 1960年代 / 约翻倍 → #37 ✓
- L35 5万 → #40 ✓ (picture tag ✗, note 5)
- Picture numbers:
  - 约前2700 / 前2625 → #19 ✓
  - 1963 禁试条约 → #38 ✓
  - 1965 初冬 → #13 ✓
  - 北半球 · 1960年代中期 → #37 ✓
  - "剩不到0.2%" ✗ (note 5)
- Correctly kept off screen:
  - 76.7 %
  - the found ages of the pharaoh woods
  - "盲测"
  - any Mawangdui C-14 claim
  - 168 / 186 BC

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | MAJOR | whole film (20.8–115.3) | **Too dense: 38 lines at 0 % waiting.** Cut to **≤ 30 lines at 12–20 % waiting**. Keep every music anchor listed above, and retime on beats within each section. Tested cut set (pace.py: 30 lines, 12 % waiting, no TOO FAST, none over 16 glyphs; full list below):<br>(a) **cut L8** "树吸进它，人吃进它". The picture keeps the leaves taking in gold dots and the apple bite, under L7/L9. This also removes the unsourced "人吃".<br>(b) **cut L13** "量出剩多少，就能倒推时间". It repeats L5 "剩几下，就能说出它死了多久" nearly word for word. The reading-arrow picture stays, under L12.<br>(c) **L14 + L15 → `这就是利比的[碳14测年]`**. The portrait card carries "美国化学家 · 利比". L16 is optional; the main section has slack for it now (see 6a).<br>(d) **cut L21** (Nobel). The medal disc "1960 · 诺贝尔化学奖" (≥ 40 px) rolls in during L20's hold, together with the checkbox tick.<br>(e) **cut L29**. The bright 1960s ring moves under L28 (see note 3).<br>(f) **L31 + L32 → `所以拿[树轮]校准：每圈都有准确年份`** (16).<br>(g) **L37 + L38 → `一块木炭有多老？数滴答，再[对表]`**. Or keep L38 verbatim and let the picture alone carry the callback to the case; either way 数滴答 and 对表 survive.<br>You may choose other cuts, but hold the targets. Also update the script.md table (Chars / Needs / Picture) and lines_arr.json. | screenwriter | row 65 "节奏太快有点看不过来…~8 beats (≈4 s) per line"; row 12 "每个 scene must add something new; cut repeats" |
| 2 | MAJOR | L6 (13.70–16.40) | "你身上也有这只钟，**正在走**". A clock that 正在走 is counting time. The film teaches the opposite: while you are alive the clock stays in step with the air and counts nothing (L9); it only starts to run down at death. The title "死后会变慢的钟" lands one beat later, so the plain reading becomes "your countdown is already running". **Replace with `你身上，也有这只钟`** (8 chars, slot 2.7 s, needs 2.2 ✓). Keep the picture: the reflection's meter ticks steadily at 15. The title then delivers the punch, and this time it is true. | screenwriter | row 11 "No line … whose plain reading is not what the film shows"; row 13 "each subtitle must make sense on first read" |
| 3 | MAJOR | L29 picture (86.37–89.44) | The "你" meter that ticks double-time for the 1960s is false for this audience: a viewer aged 18–25 was not alive then, and a 示意 tag does not fix a false claim. Under any version of the line: **no "你" meter in the bomb beat.** Show the one ring that glows twice as bright, tagged "1960年代". If a meter is needed, label it "1965年的树叶". | screenwriter (picture column) → art-director | row 11 |
| 4 | MINOR | L19 (54.85–57.55) + its cards | "年代早已知道：约4600年前" sits on the same frame as the cards "约前2700年 / 约前2625年". Counted from 2026, those are about **4,725 and 4,650 years ago**. The 4650 / 4575 in #19 are ages as of 1950, so decision 7 used the wrong reference year. A viewer who does the subtraction sees a contradiction. **Replace with `年代早已知道：距今约[4700年]`** (15 glyphs; pace-tested ✓). The cards stay. | screenwriter · researcher (8a) | row 11; brief "verify every number" |
| 5 | MINOR | L35 picture tag | "剩不到0.2% · 约5万年" is not true with the film's own half-life: at 50,000 years 5730 leaves **0.24 %**. Currie's 0.2 % ↔ 50,000 BP pairing uses Libby's 5568. facts.md Risks: never mix half-lives. **Tag: `只剩约千分之二 · 约5万年`.** | screenwriter (picture column) | facts.md Risks (half-life) |
| 6 | MINOR | L16, L20, L22, L36, L1 label | (a) L16, if kept: "都**靠**它测年代" → "都**用**它测年代". Geology mostly dates with other methods, and L35 itself says C-14 stops at about 5万年.<br>(b) L20: "他写道" → **`论文写道：“吻合得令人满意”`**. The paper is Arnold & Libby (#17).<br>(c) L22: "利比的书到了中国" claims when the book first reached China, which no row says. #12 says Xia Nai gave it to the two physicists in 1959. **`1959年，物理学家拿到利比的书`** (16). This also adds something new: the lab's founders were physicists, not archaeologists.<br>(d) L36: "核弹尖峰" → **`往后，核试验尖峰成了新的[钟]`**. That matches L28 and keeps weapons out of the words.<br>(e) L1 picture: change the label "距今数千年" to "距今几千年", the line's wording. | screenwriter | row 11; facts Risks (nuclear: keep abstract) |
| 7 | MINOR | L3/L10 and L18 pictures | (a) "滴答" (L3) and "衰变" (L10) are two words the viewer has to link alone. Show the link: **each tick on the meter = one gold C-14 dot on the sample winking out.** Introduce it at L3 and make it obvious at L10.<br>(b) L18's two-part tags ("左塞尔墓 · 萨卡拉 · 金合欢木" ×2) are unreadable at phone size during a 3-s line. Keep only "左塞尔墓" / "斯尼夫鲁墓", plus the known-age cards and the pyramid dot-label. | screenwriter (picture column) → art-director | row 48 "shown plainly, not encoded"; rows 24, 29, 69 (phone size, few words) |
| 8 | MINOR | facts.md, end card | (a) Add 估算 rows:<br>· 2 × 5730 = 11,460 → 约1.1万 (L12)<br>· 2700 / 2625 BC → ≈ 4,725 / 4,650 years before 2026 → 约4700 (L19)<br>(b) If L8 is kept: one quoted line on the food chain (Libby's Nobel lecture, #16, or Currie 2004).<br>(c) If the 夏鼐 caption says "考古学家", source it.<br>(d) The end-card sources line lacks the Hunan government portal 2026 (#12, the 1959 line) and Chen 2023 *Frontiers* (#11); the screenwriter adds them. | researcher · screenwriter (d) | row 19 sources; brief "verify every number" |
| 9 | OWNER DECISION | brief "Must include: Mawangdui" | The brief requires the real Mawangdui dating, but facts #7 and #8 are UNVERIFIED. The screenwriter was right to keep it out: putting 1972 next to the lab would read as "C-14 dated Mawangdui". This is a deviation from the brief, so only the owner can accept it. Options:<br>**(A)** Ship without Mawangdui; the Chinese anchor is the 1959 / 1965 lab story. *Overnight default; recommended.*<br>**(B)** Hold one Mawangdui line (it replaces L23, no retiming) until the researcher checks 《长沙马王堆一号汉墓》 (文物出版社 1973), the IA-CAS 《放射性碳素测定年代报告》 series in 《考古》 1972–74, and the IA-CAS compilation 《中国考古学中碳十四年代数据集》 for Tomb 1's sample, lab number and result. One lead is worth checking specifically: whether the dated sample was the charcoal packed around Tomb 1's burial chamber. This is the director's memory, **not a fact**. If it holds, the hook's museum charcoal becomes that charcoal, and title 2 moves to first.<br>**(C)** A Mawangdui line built only from verified rows (1972 excavation + the lab's reports from 1972). *Not recommended:* it implies a dating it cannot show. | producer → owner (researcher for B) | row 11; row 19; brief |

**Tested replacement line set** (30 lines; apply notes 1–6; the screenwriter sets the beat timings; pace-checked with even slots per section: 12 % waiting, no TOO FAST, all ≤ 16 glyphs)

- **Hook (0–16.4), timings unchanged:**
  - 展柜里写着：距今几千年
  - 可木炭身上，没写日期
  - 活着时，每克碳每分钟滴答约[15]下
  - 死后，滴答越来越[慢]
  - 剩几下，就能说出它死了多久
  - 你身上，也有这只钟
- **Main (20.8–49.0):**
  - 空气里，有极少量的[碳14]
  - 活着时，体内含量和空气[同步]
  - 死后不再补，只剩[衰变]
  - 每过约[5730]年，滴答少一半
  - 剩1/4，就是约[1.1万]年
  - 这就是利比的[碳14测年]
  - (optional: 考古、地质，都用它测年代)
- **Breakdown (49.1–63.2):**
  - 这只钟准吗？先[考一考]
  - 1949年，利比找来法老墓的木头
  - 年代早已知道：距今约[4700年]
  - 论文写道：“吻合得令人满意”
- **Build (63.25–79.3):**
  - 1959年，物理学家拿到利比的书
  - 1965年，新实验室也先考自己
  - [4]块已知年代的木头，全都对上
  - 中国第一间碳14实验室，这才成立
  - 这只钟的前提：空气里碳14[不变]
- **Drop 2 → end (81.45–115.3):**
  - 1960年代，大气碳14约[翻倍]
  - 原因是[核试验]
  - 前提错了：空气里碳14一直在变
  - 所以拿[树轮]校准：每圈都有准确年份
  - 测出每圈的碳14，排成[对照表]
  - 木炭的读数，到表里查年份
  - 往前，超过约[5万]年就剩太少
  - 往后，核试验尖峰成了新的[钟]
  - 一块木炭有多老？数滴答，再[对表]

**Title ranking**
1. **死后会变慢的钟** (recommended; this is the overnight default).
   - The film delivers exactly this: steady while alive, slowing after death.
   - With L6 fixed to "你身上，也有这只钟", the title lands on drop 1 as the answer to that line. It is the strongest hook-to-title handoff of the three.
   - Risk: the topic is invisible in the feed. The cover must carry the sub-line 碳14测年：数滴答，再对表.
   - The morbid half-read is a click, not a misread, because it is literally true.
2. **一块木炭有多老**.
   - It is the most honest option and the film's own callback line.
   - But it reads as calm 科普 and gives the least pull.
   - It moves to first only if note 9B verifies that Mawangdui's dated sample was charcoal.
3. **谁定的"距今几千年"**.
   - It is the most relatable: everyone has seen these labels.
   - But in Chinese "谁定的…" reads as "who decided this, arbitrarily?". The plain reading is the opposite of what the film shows (measured, then checked against tree rings), and it invites the "碳14是假的" comments facts.md warns about (row 11).
   - If the owner wants the label angle, a non-accusatory form would be "距今几千年，是怎么算的" (11 glyphs).

**For gate 2a (not part of this revision; producer / art director):**
- The brief fixes one look ("Tank-episode 2D flat illustration"), but owner row 27 requires 2–3 looks from different worlds for the owner to choose from.
- Rows 34 and 72 say flat Tank-style illustration is "not proven" and that flat clip-art reads cheap.
- Treat the script's picture column as look-agnostic, and run the 2–3 looks as usual.

What must not change (it works):
- **The hook's structure:**
  - first-person phone at the museum case, with the label on frame 0
  - the focus square on beat 1 (0.44 s)
  - L2's contradiction "可木炭身上，没写日期"
  - 15 ticks counted on the picture by 5.2 s
  - the reflection beat (L6) handing off to the title on drop 1 at 16.625
- **The title-card sub-line** 碳14测年：数滴答，再对表, and the camera dive from charcoal grain into living tree rings.
- **The tick meter as the one recurring device** ("每克碳 · 每分钟") across every scene.
- **The music map:**
  - breakdown = "is the clock right? test it"
  - build = the China lab, ending on the premise line "空气里碳14[不变]"
  - silence on the flat gauge
  - drop 2 = the spike
  - keep these anchors exact
- **The known-age test told twice, Libby 1949 ↔ the IA-CAS lab 1965,** linked by the same empty checkbox. L25's "这才成立" is the new information that justifies the second test.
- **The catch, in this order:**
  - premise → spike → 原因是核试验 (the reveal after the spike)
  - → "the air always varied" → tree rings → table → look the charcoal up
  - then the two ends: 往前 5万年 / 往后 post-1950 clock
- **Fact discipline:**
  - no 76.7 %, no worksheet, no 课本 signal
  - Mawangdui out until verified
  - found ages of the pharaoh woods never shown; no "盲测"
  - nuclear tests only as a curve and a glowing ring
  - no human remains, no maps, no likeness claims, only Libby's published sentence quoted
- **Decision 5's cuts:** 2.5 % coal dilution, 5568 vs 5730, 今 = 1950 and 3‰ all stay out.
- **The end card:**
  - the question "第一次听说'碳14'，你是在哪？" (recognition invited only here, per row 73)
  - the @ prompt
  - the follow pill `关注 Juno · 一起看懂世界`
  - no "Juno 出品"
