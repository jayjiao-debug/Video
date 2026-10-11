# Gate 1 notes: 死后会变慢的钟 script v2 / lines.json — verdict: APPROVE (round 2; 5 small fixes to make before the storyboard is locked, listed below as "fix at storyboard"; 2 owner decisions carried to the morning)

Scores (rubric 1–5, only the areas this gate covers): script **4** (v1: 3) · info **4** (planned; v1: 4) · visual – · edit – · motion – · sound –

**Inputs.** The inputs were `script.md` v2, `lines.json` and `lines_arr.json`, `facts.md` and `brief.md`, my own `notes_gate1_r1.md`, and `coldread_gate1.json`.
- The cold read was done on **v1**: its file is stamped 00:55, and the lines it quotes are v1 lines. No v2 cold read exists. I used it to check whether v2 answers the first viewer's confusions.
- `lines.json` and `lines_arr.json` are identical.
- `facts.md` has not changed since r1 (file stamped 00:39). The researcher's part of r1 note 8a is still open.

**v1 → v2, area by area**
- **Script: v2 is better.**
  - **Density is fixed.** I re-ran `pace.py lines_arr.json --film-end 122`: 30 lines, 13 % waiting, no TOO FAST. That is inside the 12–20 % target from owner row 65.
  - **L6 is now true.** "你身上，也有这只钟" hands off to the title without the false "正在走".
  - **Every confusion the cold reader raised now has an answer:**
    - "Ticking of what?" → L8.
    - "同步 is vague" → L9 "比例和空气一样".
    - "How can a lab test itself before it exists?" → L17.
    - "前提错了, so were the tests lucky?" → L24.
    - "How is the spike a clock?" → L28.
    - "The film never comes back to 你" → L29.
  - **No repeats.** The Nobel line and "它叫碳14测年" are gone. The cold reader named the second one as the moment the film turned into a 科普 lesson. No scene repeats an earlier point.
- **Info: about the same.** The picture plan stays clean. One gain: the tick ↔ decaying-atom link is now shown on screen.
- **Why the script is 4 and not 5:**
  - L16 never says where the story has moved to (note 1).
  - L24 is an inference that facts.md does not yet support with a row of its own (notes 3–4).
  - The 28-s main section is now slow by design, and it sits exactly where the cold reader said they would swipe (32–46 s). Only the picture can hold that section (note 8).

**Fact trace v2** (every number in the lines and on the planned pictures)
- **Lines:**
  - L3 15 → #23 ✓
  - L8 衰变 = 滴答 → #23 (dpm) ✓
  - L11 5730 → #25 ✓
  - L13 1949 → #17, #18 ✓
  - L14 距今约4700年 → #19 by arithmetic (2026 + 2700 − 1 ≈ 4,725; 2026 + 2625 − 1 ≈ 4,650) ✓. But row #19 itself still says "约4600多年前", so the row has to change (note 3).
  - L15 quote → #20 ✓
  - L16 1959 → #12 ✓
  - L17 1965 → #13 ✓
  - L18 4块 → #13 ✓
  - L19 第一间 → #11 ✓
  - L21 1960年代 约翻倍 → #37 ✓
  - L27 5万 → #40 ✓
  - L28 回落 / 新的钟 → #38, #39 ✓
- **Pictures:**
  - 约前2700 / 前2625 → #19 ✓
  - 1960 诺贝尔 → #15 ✓
  - 1963 禁试条约 → #38 ✓
  - 只剩约千分之二 → #40 (0.24 %) ✓
  - 1950年后可精确定年 → #39 ✓
- **Not traced:**
  - L24 "偏差在误差内" has no row (notes 3–4).
  - The "15" on the viewer's own meter in 2026 has no row (note 7).
- **Correctly still off screen:**
  - 76.7 %
  - the found ages of the pharaoh woods
  - 盲测
  - Mawangdui
  - 168 / 186 BC
  - 1.1万
  - 5568
- **Formal checks:**
  - All 30 lines are ≤ 16 glyphs (counted by script).
  - `script.facts_flags.json` is empty.
  - No "Juno 出品".
  - No 课本 signal. Recognition is invited only in the end-card question (row 73).

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | **MUST, fix at storyboard** | L16 (63.25–66.13) | "1959年，物理学家拿到利比的书" never says **China**. The film jumps from Libby in America (L13–L15) to physicists who are not named anywhere in the subtitles. The viewer learns it is China only at L19 (72 s), and only the captions say so. The cold reader already flagged "Chinese is only implied", and my r1 wording (6c) made it worse by dropping v1's 中国. **Replace with `中国物理学家，拿到利比的书`** (13 glyphs; 12 counted chars, needs 2.81 s, slot 2.88 s ✓). "1959" stays on the year card. This also cuts one spoken date from the build, where the cold reader felt the dates "stack up". Update lines.json, lines_arr.json and the script table. | screenwriter | row 13 "each subtitle must make sense on first read, alone" |
| 2 | **MUST, fix at storyboard** | L8 (26.24–31.71) | "**它**每衰变一个，就是一声[滴答]" opens on a pronoun. Read alone, 它 is the tree on screen, not the atom. **Replace with `碳14每衰变一个，就是一声[滴答]`** (15 glyphs; needs ~2.96 s, slot 5.47 s ✓). | screenwriter | row 13 |
| 3 | **MUST, fix at storyboard** | facts.md | Three changes:<br>(a) Row #19's claim column still says "约4600多年前". Add an **估算** row: "距今约4700年 (from 2026): 2700 BC → ≈ 4,725; 2625 BC → ≈ 4,650". This is r1 note 8a, still open.<br>(b) Add a sourced row for L24: the early tests agreed only within their error bars, and the air's variation was found later, once measurements became more precise. Look first in **Currie 2004** (#21, the curve-of-knowns section and what followed it), then in Arnold & Libby 1949 Table 1, for the ± values of the known and found ages, or in IntCal20's introduction. Quote it.<br>(c) If (b) cannot be sourced, write UNVERIFIED and tell the screenwriter (note 4). | researcher | brief "verify every number"; gate-1 rule: every claim traces to a verified row |
| 4 | **MUST if 3b fails** | L24 (90.02–93.47) | I accept "当年对得上，是因为偏差在误差内" as wording. It answers the cold reader's biggest confusion ("当年是测对了还是运气好？"), and its plain reading is what the film shows. But it is a causal claim. If the researcher cannot source it by storyboard lock, **swap to your own fallback `当年的吻合，是在误差范围内`**: same slot, and it rests on #19 (± values) + #20 ("satisfactory") alone. Keep the band picture either way; it is tagged 示意. | screenwriter | row 11 "no line whose plain reading is not what the film shows" |
| 5 | fix at storyboard | end card, sources line | L20, L23 and L25 rest on #33 and #34, which come from **Blackwell & Buck** (*Bayesian Analysis*). That paper is not in the sources line. Add "Blackwell & Buck, *Bayesian Analysis* 2008", or cite IntCal20 (already listed) for #33/#34 once the researcher confirms it carries both claims. | screenwriter | row 19 sources |
| 6 | fix at storyboard | L28 picture | "drops to exactly one year tick" is more precise than #39 supports: it says "accurate dating of recent (post-1950) samples", not to the year. It also contradicts L26, where the answer is drawn as a "约" bracket. **Land the leaf's reading on a narrow bracket of 1–2 year ticks**, using the same bracket language as L26. The tag "1950年后的东西：可精确定年" stays. | art-director | row 32 "never state a result the source doesn't" |
| 7 | fix at storyboard | "你" meters (L6, L9, L29 pictures) | The viewer's own meter in 2026 is drawn "at 15". #23 is the 1950s living standard, and no row gives today's level. The script itself says L29 shows "no value". **Show the 你 meter as ticking dots in step with the air, with no "15" or "≈15" label.** The charcoal/tree meter keeps its "每克碳 · 每分钟 ≈ 15" label (#23). (Alternative: the researcher adds a Hua 2022 row on today's level, and the label may stay.) | art-director | row 11 |
| 8 | storyboard requirement | main section 20.8–49.0 | Five lines hold 2.4–3.5 s past reading (pace.py MINOR ×5), and the cold reader's top swipe window is 32–46 s. Each hold needs a **second visible action, about every 2 s**. The picture column already has the material:<br>· L7: dots drift into the leaves<br>· L8: 3–4 winks, each lighting one dot<br>· L9: the apple bite, then a dot topped up<br>· L10: the branch falls, then the valve closes<br>· L11: the ½ stamp, then the ¼ stamp, then the curve, then the emblem<br>Storyboard these as separate beats on the grid, not one hold per line. **Optional:** put "≈1.1万年" on the ¼ stamp, so the method produces one real answer on screen. If you do, the researcher adds an 估算 row (2 × 5730 = 11,460). | art-director | row 14 "a visual change every few seconds"; row 29 no "pop in then hold" |
| 9 | for the producer | owner touchpoint, crew_log | (a) **Mawangdui** stays out under overnight default A (r1 note 9). This departs from the brief's "must include", so it goes on the owner's morning list with options A/B/C from r1.<br>(b) **Title:** see the ranking below; the overnight default is 死后会变慢的钟.<br>(c) **Gate 2a:** the brief fixes one look ("Tank-episode 2D"), but owner rows 27, 34 and 72 require 2–3 looks from different worlds. Run 2–3 looks.<br>(d) crew_log.md still has only the folder row. Log gate 1 r1/r2, the cold read and these defaults. | producer | rows 27, 34, 72; brief |

**Title ranking (v2)**
1. **死后会变慢的钟** (recommended; overnight default).
   - It is literally what the film shows: steady while alive, slowing after death. So it does not overclaim.
   - With L6 now "你身上，也有这只钟", the title lands on drop 1 as that line's answer. This is the film's strongest hand-off.
   - It fits the series' paradox-phrase titles (越修越堵, 应该没事吧).
   - The cold reader's risk is real: cold in the feed it can read as 鸡汤 or 灵异. Two things carry the genre: the cover must show the sub-line **碳14测年：数滴答，再对表**, and frame 0 (museum case, label) confirms it within the first second.
2. **距今几千年，怎么算的？**
   - It is the viewer's own museum thought and matches frame 0 word for word.
   - It has no genre ambiguity, and the film answers it exactly.
   - The cold reader clicked its predecessor "谁定的'距今几千年'". "怎么算的" is calmer and gives up some of that pull, and it makes the drop-1 card after L6 a weaker hand-off.
   - Choose this one if the owner weights the feed click over the in-film punch. Either way, use "展柜里写着'距今几千年'，怎么算的？" as the first line of the post caption.
3. **一块木炭有多老**.
   - It is honest and is the callback line (L30).
   - But it reads as a calm lesson, and the cold reader would scroll past it.

What must not change (it works):
- **The hook, 0–16.40, exactly as timed:**
  - first-person phone at the case, with the label on frame 0
  - the focus square on beat 1 (0.44 s)
  - L2 "可木炭身上，没写日期"
  - 15 ticks counted on the picture by 5.2 s, each paired with a gold speck winking out
  - L4–L5
  - L6 "你身上，也有这只钟" → the dive into the grain → the title on drop 1 at 16.625
- **The title-card sub-line** 碳14测年：数滴答，再对表; the tick meter as the one recurring device.
- **The main section's logic chain**, with no repeats: air has C-14 → 1 decay = 1 tick → alive = topped up, same ratio as the air → dead = decay only → halves every ~5730 years.
- **The music map and its anchors:**
  - title on drop 1 at 16.625
  - breakdown 49.04 = "这只钟准吗？发明人先考一考"
  - build 63.2 = the China lab, ending on "空气里碳14[不变]"
  - silence 79.4–81.4 on the flat gauge
  - drop 2 at 81.45 = the spike
  - end card at 115.87
- **The two known-age tests**, Libby 1949 ↔ the 1965 lab, linked by the same checkbox. "实验室成立前先考一考" … "这才成立".
- **The catch order:** premise → spike → 原因是核试验 → 一直在变 → L24 reconciliation → tree rings → table (with the charcoal looked up as a "约" range) → too old (5万) → the spike as a new clock → 你 → callback.
- **L29 + L30 as the close:** the 你 thread returns, then "一块木炭有多老？数滴答，再[对表]".
- **Fact discipline:**
  - no 76.7 %, no worksheet, no 课本 signal
  - Mawangdui out until verified
  - no found pharaoh ages, no 盲测, no 1.1万 unless note 8's 估算 row is added
  - nuclear tests only as a curve and a glowing ring, with no "核弹" in the lines
  - no maps, no human remains, no likeness claims, only the 1949 sentence quoted
- **The end card:** "第一次听说'碳14'，你是在哪？", "@一起逛过博物馆的那个人", and the pill `关注 Juno · 一起看懂世界`.
