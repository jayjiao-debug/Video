# Gate 1 notes: 从扔石头，到火箭云 script v1 + lines_read.json (28 lines, 1:55.5), r1 — verdict: REVISE (line fixes only)

Scores (rubric 1–5, only the areas this gate covers): **script 4** · facts **pass, with 1 wording fix on a ⚠ row (C1)** · visual/info/edit/motion/sound are not scored at this gate (two picture notes are carried forward to 2a/2b).

**Bottom line.** This is a strong v1, cleaner on facts than ep51's v1 was. Every year, distance and mass on screen traces to a facts row, and the 估算 arithmetic from 2026 is right. Every trap the researcher flagged has been avoided:
- 10月23日, not 10-24;
- 长征六号改;
- 北京、山西、山东, never 陕西;
- no metres for any ancient weapon;
- 远闻 read as the sound, not the range;
- no 世界第一, no 1288, no 10亿.

What would send it back is three lines and one surplus rung, not structure:
- (a) **C1** uses 「史书记载」 for a ⚠ row whose allowed wording is 「史书说」. The source is 苏秦's sales pitch to the King of 韩.
- (b) **R2** answers the film's searched question with 「天都黑了…天上还有太阳」, which reads as a contradiction on first pass.
- (c) **P2** 「扔上天的，还能接回来」 is trivially true of any stone, so the last statement doesn't say what the film means. This is the 「扔」 problem.
- (d) **O6 天问二号** is a future-tense afterthought that steps on the 「回来了」 turn.

**If notes 1–4 are applied word for word, the producer can treat the script as approved without a director r2.** Notes 5–9 are polish the screenwriter can take or leave in the same pass. Notes 10–12 are carried forward to 2a/2b.

**Inputs read:**
- the production-crew SKILL (Director section) and rubric.md;
- owner-notes.md (all rows);
- brief.md, facts.md (every row), script.md v1, lines_read.json, lines.json, lines_pace_flags.json;
- ep51 script v2 and ep51 notes_gate1_r1 (the series model).

**No cold-read file** existed for this gate when I reviewed.

**Pace check.** I ran pace.py on my own revised timeline (scratchpad `r1_proposed.json`, notes 1–8 applied, O6 cut, later lines moved up by 4.5 s). Result: no TOO FAST lines, 3 % waiting, every row ≤ 16 wide. The film is 111.0 s + 0.5 s fade = **1:51.5**, inside the brief's 1:45–2:15.

## 1. Fact check, line by line (stamps included)

| Line | On screen | Row | 2026 − year | Ruling |
|---|---|---|---|---|
| H1 + stamp | 天都黑了 · 10月23日 傍晚 · 多地网友都拍到了 | A1, A4, A6 | — | ✓. 「天都黑了」 fits 「地面光线已经较暗」 and 央视's 「夜空」 at ~18:20. |
| H2 + stamp | 长征六号改 · 尾迹 · 18:15 · 太原卫星发射中心 · 第672次 | A1, A3, A6 | — | ✓. 新华社's name, time and count. |
| H3 | 人类练了几万年 | B3 | — | ✓ (石镞, 几万年前). See note 6 on how it sits beside S1's 十几万年前. |
| S1 + stamp | 十几万年前 · 许家窑人 · 可能 · 石球多达几千件 | B1 ⚠ | 16–20万 | ✓. The 「可能」 is kept and no hunt is shown. |
| S2 + stamp | 几万年前 · 箭头 · 山西峙峪 · 国博：已出土石镞 | B3 | — | ✓. This is the safe wording; 4.5万 / 弓箭 are not used. |
| C1 + stamp | 2000多年前 · 史书**记载**：劲弩能"射六百步之外" · 《战国策》《史记》 | C1 ⚠ | 战国 | **Wording.** The row allows 「史书说」 as a quote. It is a persuader's speech, and 「记载」 presents it as a recorded fact. Note 1. |
| C2 + stamp | 1000多年前 · 北宋初 · 史书记载：从七百步加到千步 | C2 ⚠ | 976 → 1050 | ✓. 「史书记载」 is the row's own wording; no metres. |
| F1 + stamp | 同一时期 · "火箭法" · 970 · 冯继升等 | D2 | 970 | ✓. 970 sits in the same 开宝 years as 976. No 「第一枚」. |
| D1 + stamp | 982年前 · 《武经总要》 · 目前最早记载的火药方 · 1044 | D1, I3 | 1044 → 982 ✓ | ✓. 「最早记载」 is the source's own phrase, with no 世界. |
| E1 + stamp | 767年前 · 大竹筒 · 火药把弹丸打了出去 · 南宋 1259 寿春 · 突火枪 | E1 | 1259 → 767 ✓ | ✓. |
| E2 | "远闻百五十余步" · 《宋史·兵志》 | E1/E2 | — | ✓ (as quoted by 科普中国). |
| E3 | 不是射程 · "砰"的一声 · 150多步外都听得见 · "闻"：听见 | E2 | — | ✓. This is exactly correction 7. |
| E4 + stamp | 728年前 · 竹筒换成了铜管 · 元 1298 · 铭文：大德二年 | E3 | 1298 → 728 ✓ | ✓. No 「最早」, no 1332, no 1288. |
| M1 + stamp | 407年前 · 徐光启派人去澳门买西洋大炮 · 1619 | F1 | 1619 → 407 ✓ | ✓. 「买」 is a fair plain form of 洽购. |
| M2 + stamp | 整整400年前 · 红夷大炮守住了宁远 · 天启六年正月 | F2 | 1626 → 400 ✓ | ✓. No cannon count, no range, no enemy. |
| O1 + stamp | 56年前 · 长征一号 · 东方红一号 · 最高2384公里 · 1970.4.24 | G1, G2 | 1970 → 56 ✓ | ✓. 最高 = 远地点. |
| O2 | 到今天，它还在天上飞 · 据中国科学报2025 | G3 | — | ✓. It never says the satellite still plays music. |
| O3 + stamp | 5年前 · 天问一号着陆火星 · 离地球约3.2亿公里 · 2021.5.15 | H4 | 2021 → 5 ✓ | ✓. The source has 千米; 公里 = 千米, unified on purpose (see 5c). |
| O4 + stamp | 2年前 · 嫦娥六号 · **38万公里外** · 月球背面 | H1, H3 | 2024 → 2 ✓ | **Missing 约.** The row says 「约38万公里」 (an average). The stamp has 约 but the line doesn't. Note 7. |
| O5 | 这一次，它回来了 · 人类首份月背样品1935.3克 | H3 | — | ✓. 「人类首份月背样品」 is 新华社's own wording. 「这一次」 contrasts locally with O2/O3 (stayed up, stayed on Mars) and claims no first return. Keep it. |
| O6 | 今年 · 天问二号追上一颗小行星 · 还要采样，带回地球 | H5 | — | ✓ as worded (future tense). **Cut on story grounds** (note 4). That also removes the publish-day sampling check. |
| R0 | 北京、山西、山东都看见了 | A4 | — | ✓. Never 陕西. |
| R1–R3 | 太阳在"打光" · 地面已经天黑，天上还有太阳 · 尾气胀开 · 像冬天哈出的白气 | A5, A6, A7 | — | ✓ on facts. **Clarity** problem in R2 (note 2); R3 repeats R2 (note 8). |
| P1/P2 | 几万年来…越扔越远 · 扔上天的还能接回来 | 本片归纳 | — | Fine as synthesis. P2 has a clarity problem (note 3). |
| Title | 从扔石头 / 到火箭云 | — | — | ✓. It promises exactly what the film walks through. |
| Sources line | … 《宋史》 · 新华社 2026-07-06 … | — | — | 《宋史》 was never opened; every 宋史 quote came via 国家航天局 / 科普中国. 2026-07-06 goes with O6. Note 9. |

**Banned-wording sweep:** none appears.
- 10月24日, 陕西, bare 长征六号, 长六甲;
- 世界第一 / 第一枚火箭;
- 射程150步, 230米;
- 1288, 1332, 万户, 10亿, 已经采样, 助推器分离.

**「最早 / 第一」 on screen:** only D1 「目前最早记载」 (the source's phrase) and O5 「人类首份月背样品」 (新华社's phrase). Both are sourced.

## 2. Hook: pick **order A**

- **Frame 0 stops the scroll and reads in 2 s.**
  - The picture is the exact image the viewer just saw in the trend, drawn huge.
  - 「天都黑了，这团云还在[发光]。」 is 11 字, about 1.6 s of reading.
  - It is a paradox stated, not asked (owner row 47), and the topic itself (row 22).
- **The format line (3000年 shape) arrives by 6 s,** with its number: 「把东西扔这么高，人类练了[几万年]」. The title then lands on the drop at 9.5.
- **Why not B.** Its row 1 slogan 「为了这团云」 gives the ancients a purpose they never had, which is a plain-reading risk (row 11). Its H3 「先从一颗石头说起」 is a filler line.
- **Why not C.** It puts a ✗ number (120米) on frame 0 and spends 8 s before the first real fact. It also slips the title off the drop. Use C's idea only in the pinned comment, as the screenwriter proposes.
- **Polish (note 5a):** H2 → 「那是长征六号改火箭的尾迹。」. The v1 comma 「是长征六号改火箭，留下的尾迹」 reads as a broken sentence.

## 3. The ladder

**Does it build, with the numbers accelerating? Yes.** Two counters run at once:
- **The years shrink, faster and faster:** 十几万 → 几万 → 2000多 → 1000多 → 982 → 767 → 728 → 407 → 400 → 56 → 5 → 2. This is the 3000年 video's real engine.
- **The distances:** 六百步 → 千步, then a deliberate gap with no invented gun or cannon ranges, then 2384公里 → 3.2亿公里. Then the planned step down to 约38万 for the turn.

Leaving out metres is right. Don't add 「约1.5公里」, even as 估算: the 步→公里 jump reads on its own.

**Weak or slow rungs:**
- **F1 + D1 (28.75–36.75)** are two paper beats back to back: a scroll at court, then a book. Nothing is thrown for 8 s. The lines are fine (D1 gets a small tidy-up in note 5b). The fix is in the picture (note 11).
- **M1 「407年前」** throws nothing, but it is the one human story and the setup for 「整整400年前」. Keep it.
- **O6 天问二号** is the real weak rung. It is future tense (「还要」), has no number (10亿 is rightly out), names an asteroid nobody knows, and sits 4.5 s after the turn, deflating it. **Cut it** (note 4). The ladder then ends 56 → 5 → 2 → 「回到开头那团云」 (5 days ago), which is the cleanest countdown.

**先猜？ lands, on one condition.** The 先猜？ beat is the film's best 原来如此, and E1's near-landing pellet is a fair clue. But E2's picture already sends **sound rings** across the ground before the guess, which gives the answer away. Hold the rings until E3 (note 10).

**「回来了」 lands.**
- It is set up by O2 「它还在天上飞」 (thrown, never back) and O3 (stayed on Mars).
- It is staged with the capsule landing in the hand that threw the stone, with the music returning.
- With O6 cut, nothing steps on it.

**Is the ending earned? Yes, but P2 needs a sharper wording.**
- The cloud's answer (R0–R3) is the last 原来如此, and it pays off frame 0 and the search question word for word.
- P1/P2 then generalise the turn. As written, P2 「扔上天的，还能接回来」 is true of any stone thrown in the air, so the plain reading is empty. Note 3 makes it specific.

**End question: easy.** 「你见过火箭云吗？在哪儿？」 can be answered in one word (a city), even with 「没见过」. It also feeds the search. Keep it, and keep the @ prompt.

## 4. Reading pace and line clarity
- **pace.py:** no TOO FAST lines, both in v1 and in my revision. Waiting is 3 %. The two CHECK gaps are the named beats (title, 先猜？).
- **「扔」.** It is literal in S1 and the film's spine verb in H3, P1 and P2 (the title sets up the metaphor, so no quote marks are needed). The one place it misfires is P2 (note 3).
- **Lines that don't stand alone:**
  - R2 「天上还有太阳」 right after 「天都黑了」 (note 2).
  - R3 repeats 「高空 / 阳光照亮」 instead of adding the why of the size (note 8).
  - S1 is the wordiest line in the film (note 6).

## 5. The screenwriter's open calls: decided
1. **Hook:** A.
2. **天问二号:** cut O6 (note 4). It is not moved and not reworded.
3. **万户:** stays out. A second debunk next to 150步 turns the film into a fact-check, and it is a legend from 1945. It can go in the pinned comment if the owner wants it.
4. **C2 → F1 order:** keep v1 (弩 thread, then 「同一时期」 970, then 982年前). It is honest: 970 and 976 fall in the same 开宝 years, C2's stamp says only 「北宋初」, and the on-screen years still run downward.
5. **Units:**
   - 公里 throughout (2384 / 约3.2亿 / 约38万), where the source says 千米 or 公里. They are the same unit, and a single unit makes the ladder readable.
   - 克 for the sample.
   - 步 only for the ancient texts, always with 史书.
   - No metres for ancient weapons anywhere, including the publish copy.
6. **Length:** 1:51.5 after the cut. Spend any bars from the retime on the title, 先猜？, the 宁远 pause, the O4 hush and the P1 pull-back.

## 6. Titles: picked
- **Film title (plaque and end card): 「从扔石头，到火箭云」** (two rows: 从扔石头 / 到火箭云).
- **Douyin 标题: option 1, 「长征六号改的火箭云，为什么天黑了还在发光？」** It matches the search (火箭云 · 长征六号 · 为什么), says what frame 0 says, and spends no answer.
- **Cover:** the title alone (rows 105, 119).
- **Title option 3 「扔上天，还能接回来」** spends the turn. Don't use it anywhere.

## Notes

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | **must** | **C1** 19.50–24.00 | **Problem.** 「史书记载：劲弩能"射六百步之外"」 states a ⚠ row more strongly than allowed. The source is 苏秦's speech to the King of 韩; the row's on-screen wording is 「史书说」 as a quote.<br>**Fix:** 「2000多年前，史书里说：\n劲弩能"射六百步之外"。」 (row 1 width 11; same window).<br>**Stamp line 2:** 「苏秦语 · 据《战国策》《史记》」 (≤ 12).<br>C2 keeps 「史书记载」, which is that row's own wording. | screenwriter | rows 11, 32 |
| 2 | **must** | **R2** (v1 94.00–97.50) | **Problem.** The answer to the searched question reads as a contradiction: 「天都黑了」 → 「天上还有太阳」 (the viewer looks up and sees no sun).<br>**Fix:** 「因为地面已经天黑，\n高空还有[阳光]。」. This is A6's own on-screen wording (「地面已经天黑，高空还有阳光」) and 央视网's 「高空尾迹仍能受到阳光照射」.<br>The diagram labels 「地面：天黑 / 高空：有阳光」 already match. The plume lights on [阳光]. | screenwriter | rows 11, 13 |
| 3 | **must** | **P2** (v1 105.25–108.50) | **Problem.** 「现在，扔上天的，还能接回来」: any stone thrown up comes back down, so the film's last statement is trivially true, and a commenter will say so. This is the loose 「扔」.<br>**Fix:** 「现在，扔到月亮上的，\n还能[接回来]。」 (row 1 width 10; H3 ✓ 嫦娥六号).<br>Picture unchanged (the arc from the Moon back into his palm). | screenwriter | rows 11, 13 |
| 4 | **must (decision)** | **O6** 82.50–87.00 | **Problem.** 天问二号 is future tense, has no number, and comes after the turn, so it deflates 「回来了」. It also forces a publish-day check on sampling.<br>**Fix:** cut the line, and move R0–END up by 4.5 s (R0 82.50, R1 86.50, R2 89.50, R3 93.00, P1 97.50, P2 100.75, AIR 104.00–105.00, END 105.00–111.00). The film becomes 1:51.0 + fade.<br>**Transition:** O5's returning capsule arc carries us back into the R0 match frame (it replaces O6's dashed arc).<br>Remove the 2026-07-06 source and the O6 SFX/stamp rows. | screenwriter; editor (timeline) | rows 12, 109 |
| 5 | should | **H2**, **D1** | **(a)** H2: 「那是长征六号改火箭的尾迹。」 (12 字). v1's comma reads as a broken sentence on frame 3.<br>**(b)** D1: 「982年前，《武经总要》里，\n有目前最早记载的[火药方]。」. This drops the doubled 「写下了…记载」; 「最早记载」 is the source phrase. | screenwriter | row 13 |
| 6 | should | **S1** 12.50–16.50 | **Problem.** It is the wordiest line (18 字, two rows) on the first rung after the title, where viewers decide to stay.<br>**Fix:** 「十几万年前，人可能就在扔[石球]了。」 (one row, width 16; B1 ⚠, 可能 kept).<br>The 「几万年」 (H3) vs 「十几万年前」 (S1) mismatch then reads as "even older, maybe", which is what B1 allows. Don't raise H3 to 十几万年: that would rest the hook on a 可能. | screenwriter | rows 13, 104 |
| 7 | should | **O4** 73.50–78.00 | **Problem.** 「38万公里外」 drops the row's 约 (an average distance). O3 has 约 and O4 should match.<br>**Fix:** 「2年前，嫦娥六号落到\n约38万公里外的月球背面。」 (row 2 width 12). The tag already reads 「约38万公里」. | screenwriter | row 32 |
| 8 | should | **R3** (v1 97.50–102.00) | **Problem.** After note 2, R3 row 1 「尾气在高空胀开，被阳光照亮」 repeats R2 and adds nothing new about why the cloud is so big.<br>**Fix:** 「那里空气稀薄，尾气一下胀开，\n像冬天哈出的一口白气。」 (row 1 width 14). A7 ✓: 「周围气压很低，尾气迅速膨胀、扩散」 and 「像冬天哈出来的白气」.<br>Picture unchanged (the plume swells, then the walker's breath puff). | screenwriter | row 12 |
| 9 | should | **Sources line** | Replace the bare 「《宋史》」 with 「国家航天局、科普中国引《宋史》」: the original was never opened.<br>Drop 新华社 2026-07-06 (O6 is cut).<br>Everything else checks out. | screenwriter | row 19 |
| 10 | carry-fwd | **E2 / 先猜？ picture** 41.00–46.50 | **Problem.** The sound rings in E2 give away the guess.<br>**Fix:** through E2 and 先猜？, show only the pellet's short arc and its near mark, plus one far empty flag 「百五十余步？」. The rings start on E3's 「砰」 and race to the flag, and 「150多步」 locks in. | art-director | rows 47, 112 (pause before the hit) |
| 11 | carry-fwd | **F1 → D1 → E1** 28.75–41.00 | **Problem.** Two paper beats in a row (scroll, then book), and the D1 picture is static.<br>**Fix:** give D1 a physical event that carries the cut. A spark from the powder packet jumps off the page, falls into the open mouth of the bamboo tube in his hands, and becomes E1's flame (a motivated hand-over). The book pages stay illegible woodcuts. | art-director, animator | rows 29, 86 |
| 12 | carry-fwd | **O4 hush** | The "music thinned to near silence" must come from the track's own quiet bars, or be a picture-only pause. No processing of the BGM, and no hush longer than about 2 bars. | editor | rows 50, 51, 64 |

## Story check
- **A new visible event every ~4 s:** yes, line by line. The longest stop is the 突火枪 set-piece (41–50.75), with an action every 2–3 s.
- **Four 原来如此 beats:**
  - "火箭" is a 1,000-year-old word;
  - 150步 was the sound;
  - the goal became 「回来」;
  - the cloud is sunlight the ground can't see.
- **One takeaway.** The answer to the trending search is inside the film.
- **Rubric 1 sits at 4 now and reaches 5 with notes 2–4:** every beat adds something, and the ending lands instead of restating.

## What must not change (it works)
- **Hook A:** frame 0 is the cloud blooming with H1 on frame 0. H3 「把东西扔这么高，人类练了[几万年]」 plays over the ◀◀ rewind into the stone ball. The title is silent on the drop at 9.50.
- **The countdown wording 「X年前」 on every dated rung:** 982 · 767 · 728 · 407 · 「整整400年前」 · 56 · 5 · 2.
- **The 史书 honesty device:** 史书里说 (C1), 史书记载 (C2), 史书写它 (E2). Ancient figures stay in 步 and never in metres.
- **The 突火枪 set-piece:** E1 → E2 (quote, no gloss) → 先猜？ (射程？ · 响声？) → E3 「不是射程：是"砰"的一声，[150多步]外都听得见」 with the 〃 / "闻"：听见 stamp.
- **M1 → M2:** 徐光启 and Macau, then 「整整400年前，[红夷大炮]守住了宁远」. The cannon flash match-cuts to the 1970 launch flame.
- **O1 → O5:**
  - the ruler turning vertical;
  - 「到今天，它还在天上飞」;
  - 3.2亿 as the biggest number, then the deliberately smaller 约38万;
  - 「这一次，它[回来了]」 with the capsule landing in the hand that threw the stone, and 新华社's 「人类首份月背样品1935.3克」.
- **R0 → R1:** the match frame back to frame 0, 北京·山西·山东 on a borderless dot strip, and R1 asking H1's question word for word.
- **P1, the 1.0 s of air, the end card:** 「你见过火箭云吗？在哪儿？」 and the pill 「关注 Juno · 一起看懂世界」. No 「Juno 出品」.
- **Wording that stays out:**
  - 10月24日, 陕西, 长征六号 (bare), 长六甲;
  - 世界第一 / 第一枚火箭 / 中国是火箭的故乡;
  - 射程150步, 230米, any metres for ancient weapons;
  - 1288, 1332 on screen, 万户, 10亿;
  - 嫦娥五号 1731克 (it would blur 1935.3), 遥感五十号 uses beyond 新华社's, 助推器分离, 第五个国家;
  - the cannon count at 宁远, 红衣 renaming, enemy figures.
- **Safety:** everything is drawn (no netizen photos), weapons fire at the sky or empty ground, no recipe text, no maps or borders, silhouettes only for real people.
