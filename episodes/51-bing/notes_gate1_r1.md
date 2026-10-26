# Gate 1 notes: 古代没有冰箱，夏天怎么吃冰？ script v1 + lines_read.json (40 lines, 2:03.75), r1 — verdict: REVISE

Scores (rubric 1–5, only the areas this gate covers): **script 4** · facts **pass, with 3 wording fixes at the character level and 1 sources-line fix** · visual/info/edit/motion/sound: not scored at this gate (a few picture-column notes are carried forward for 2a/2b).

**Bottom line.** This is a solid v1, about where ep50's v1 was. The spine is clear: the cold was winter, kept until summer; first the nobles had it, then the street; today the fridge makes its own winter. It has five real 原来如此 beats:
- the "fridge" chilled **wine** and could also warm it;
- ×3 because about 2/3 melts, joined by the picture alone;
- the 冰票;
- the Qing "fridge" cooled **the whole room**;
- there are more fridges than households.

Every number traces to a ✓ row. The wording discipline is exemplary: no 硝石, 最早, 前433, 杨国忠, 1956, 每户 or 因为/难怪. The cold reader (CR = coldread_gate1.json) loved H2/H3, 酒/温酒, 冰淇淋, 存三份, 冰票, 牙齿打颤, 整间屋子, 比家庭还多 and P1/P2.

What would send it back:
- **(a) Frame 0 opens on old news.** Row 1 「你家冰箱会制冷。」 tells the viewer nothing new. CR: 「更像知识科普的常规开场，没有反常识」.
- **(b) The 13 s right after the title are the film's weakest.** That is where the hook's catch is lost: two classical lines and three look-alike terms (凌阴 / 凌人 / 三其凌). CR: 「开头抓到的人最容易在这里流失」.
- **(c) The 北宋 block is a list of nouns with no turn.** CR: 「整片最容易滑走的地方」.
- **(d) One overclaim:** 「清宫里，真有叫"冰箱"的东西」.

All of these are line fixes, and one round should do it.

**Inputs read:**
- production-crew SKILL (Director) and rubric.md
- owner-notes.md (all rows)
- brief.md, facts.md (every row), script.md, lines_read.json, lines.json, script.facts_flags.json (empty)
- coldread_gate1.json
- the history-video-style and topic-picker skills
- the ep50 references: script, notes_gate1_r1, notes_gate4_r1/r2, coldread_frames

My own `pace.py lines.json --film-end 123.75` run: no TOO FAST lines, 3.3 s waiting = 3 %, matching the script. I also ran the revised timeline below through pace.py: no TOO FAST lines, film 119.0 s + 0.5 s fade.

## Fact check (every number, quote and wording limit → facts.md)

| Line | Claim on screen | Row | Ruling |
|---|---|---|---|
| H1 | 2400多年前 · "冰箱" in quotes · 不会 (制冷) | §0, B2, B7 | ✓. Never 2400年前, never 最早. |
| H1/H2 stamps | 战国早期 · 湖北随州 / 曾侯乙墓的铜鉴缶 / 现藏湖北省博物馆 | B1, B2, Risks | ✓. 「现藏」 is the wording the Risks section requires. |
| H2, H3 | 它的冷是冬天凿下的冰，从冬天撑到夏天 | §0, C1–C4 (本片归纳) | ✓. The researcher endorses this synthesis (§0 「The cold came from winter ice」). |
| Q1 | 二之日凿冰冲冲，三之日纳于凌阴 · 《诗经·七月》 | C1 | ✓, verbatim. The poem is not dated, and 冲冲 is not explained. |
| Z1/Z2 | 专管冰的官叫凌人 · **他**手下干活的80人 | C5 | ✓ on the number (徒八十人, never 「凌人80人」). **Character level:** the office is 下士**二人** plus staff, so 「他」 makes it one man. Note 2 rewrites the line without 他. |
| Q2 | 令斩冰，三其凌 · 备足三倍 | C3 | ✓. The stamp says 《周礼》, never 西周. |
| A1 | 春秋 · 凤翔 · 秦雍城凌阴遗址 · 190 m³ · 口大底小 | C6 | ✓ (宝鸡市文物局). No 「最早」. 宝鸡's own words are 「大型地下冰窖」, which note 2 uses. |
| J1–J4 | 战国早期 · 方盆套方罐 · 冰在中间 · 罐里是酒 · 鉴是盆，缶是罐 · 缶：盛酒器 | B2, B3 | ✓. |
| J5 | 冬天还能温酒 · 湖北省博物馆：冰温两用 | B4 (✓ attributed) | ✓. B4's on-screen wording includes 冬天. 温酒 is the natural reading of 「温热与冰镇双重功能」 for a wine jar. **Keep 温酒, not 温水** (open decision 3: the stricter alternative is not needed). |
| W2 | 只有朝廷和达官显贵 · 据上海社科院 程鹏 | D2 | ✓ (attributed). |
| Q3 | 取大冰，使匠琢为山 · gloss 唐朝权贵 | E2 | ✓. It is an excerpt. 杨氏子弟 → 唐朝权贵 is a fair generalisation, and 杨国忠 is not named. |
| T1, T2 | 酥山 · 乳酥淋成小山 · 冰窖冻 · 有点**像**冰淇淋 | E3 | ✓ (像, never 是 or 发明). |
| S1–S3 | 北宋 · 汴京 · 六月 · 青布伞 · 冰雪 · 最好的两家全用银器 | E6 | ✓. In the source, 「皆用青布伞」 covers all the street sellers listed, 冰雪凉水 among them. No bench wording is used. |
| S4 | 冰雪冷元子 · 州桥夜市 · 夏月 | E5 | ✓ (it is a name only). Note 3 cuts it as a line anyway. |
| Q4 | 于夜内凿之，声如錾石 · 《燕京岁时记》 · 清 · 北京 | G1 | ✓, verbatim. **Gloss:** 「像在凿石头」 drops 「声」, so it reads as "hard like stone" rather than "sounds like chiselling stone". See note 10. |
| C1 | 清宫的冰窖 · **半埋**地下 · 墙厚两米 · 乾隆年间修建 | G2, P9 | 墙厚两米 ✓ and 乾隆 ✓. 「半埋」 slightly overstates: the floor is ~1.5 m down in a 6 m-high building, about ¼. See note 15. |
| C2, C3 | 存到夏天化掉约2/3 · 存三份，化两份，剩一份 (估算) | C4 | ✓. These are two separate facts, and the link to 《周礼》 is made by the picture only, with no 因为. **This is exactly what C4 requires. Keep it.** |
| C4, C5 | 夏天 · 官员凭冰票领冰 · 工部颁给冰票 · 按等级分 | D3 | ✓ (暑伏–立秋; 多寡不同，各有等差). No numbers. |
| C6, C7 | 卖酸梅汤的手敲两只铜碗 · 敲冰盏 · 冰镇 · 凉得牙齿打颤 | G3 | ✓. The 冰盏 belongs to the 酸梅汤 seller, as required. **Stamp issue:** C7's 「其凉振齿」 is from 《燕京岁时记》, but it sits under C6's 《清稗类钞》, so it reads as that book's words (note 16). |
| K1 | 清宫里，**真有叫"冰箱"的东西** | G6, H3 | **Overclaim.** G6 supports 「故宫收藏有一件乾隆御制款的掐丝珐琅冰箱」, which is the museum's name for the object. No row says the Qing court called it 冰箱 (H3: 「supported only as far as G6」). The plain reading of 「真有叫…的」 is "it was called that then". See note 4. |
| K2, K3 | 铜钱孔 · 凉的是整间屋子 · 故宫藏 · 高45厘米 | G6 | ✓. |
| C2/K3 stamps | 「据故宫**研究员**周乾」 | G1, G2 | **Wrong title.** He is 研究**馆**员. See note 5. |
| M1 | 机械制冷的冰箱，19世纪才发明 · 据北京大学李零 | B7 | ✓, verbatim. |
| M2, M3 | 1990 农村 1.22 · 2024 全国 104.8 | A3, A1 | ✓ each, and each is labelled. Two different series sit next to each other; see note 11. |
| M4 | 冰箱，比家庭还多了 · 估算 | A1 | ✓ (104.8/100 > 1, an average). It never says 每户. |
| P1, P2 | 装的是冬天 · 自己就能造出冬天 | 本片归纳 | Fine, and unattributed. |
| Sources line | … | — | The hook's 「2400多年前 / 战国早期」 comes from **新华社 2025** (B2), and 新华社 is missing from the line. See note 12. |

## Hook, title and the 5-second door

**Order A vs B: I recommend neither as written, but B′ (B's twist on frame 0 plus A's picture).**
- **Problems with A.** Row 1 「你家冰箱会制冷。」 is the "true but old news" opening. The topic-picker warns about exactly this (好人会赢吗: worst 5 s on the account), and CR felt it: 「常规开场」. The number and the twist only start typing in row 2.
- **Problems with B.** The second twist waits until 3 s, and 「不插电」 is a joke (the screenwriter's own critique, which I agree with).
- **B′.** Both twists go in one subtitle on frame 0, with the viewer's own fridge in the picture. This is the same call the owner made on ep50 (twist on frame 0, your phone in the picture). It also sets up P2 with the same word: 自己不会冷 → 自己就能造出冬天.
- **Rows 22/47 still hold.** The picture is the viewer's situation (your fridge opening on frame 0), and the picture overturns it (the light dies on 不会冷).

**Title.** 9.25–12.25, silent, 3.0 s on the drop. It meets ≥ 2.5 s and lands by ~14 s, so keep it. CR's swipe flag at 9.25 (「3秒没字」) comes from reading lines only; the plaque is on screen there (same as ep50 gate 1).

**5-second door (B′):**
- ✓ subtitle on frame 0;
- ✓ twist + number in row 1, with both rows inside 3 s;
- ✓ picture readable in 2 s, *if* the vessel is lit (note 14);
- ✓ 标题 = the searched question.

## Notes

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | must (owner pick) | **H1** 0.00–4.00 | **Problem.** Row 1 is zero information, and the twist arrives in row 2 (see the hook section above). **Fix (B′, recommended):** **H1 0.00–4.00** 「2400多年前，中国就有"冰箱"了。\n可它自己，[不会冷]。」 (row 1 ≈ 14.8 wide, row 2 = 8; need 3.7 s). §0 ✓ is the source; the quotes satisfy the 「了」 caveat. H2 and H3 stay word for word, and 「可它自己不会冷 → 它的冷，是冬天凿下的冰」 flows on directly. **Picture:** your fridge door opens on the first beat. Inside, in the cold light, stands the bronze vessel. On [不会冷] the light clicks off and the hum cuts (SFX 1 and 2 unchanged). **Producer:** show the owner A, B and B′ as text, recommending B′. | screenwriter (line); producer (show A/B/B′) | rows 22, 47; topic-picker §3 (A_self alone doesn't hold 5 s), §6 |
| 2 | must | **周 block** 12.25–28.50 | **Problem.** CR's #1 boring stretch and three swipe flags (12.25, 19.25, 25.5). There are two classical lines in 10 s, and 凌阴 / 凌人 look alike (CR 17.0: 「分不清哪个是人哪个是地方」). Z2's 「他」 is also wrong (two 下士). **Fix:** keep every fact, and leave no unfamiliar term in the subtitles except inside the Q1 text:<br>· **Q1** 12.25–17.25 「二之日凿冰冲冲，三之日纳于凌阴。\n{寒冬凿冰，藏进冰窖}」 (+0.25 s; the label that drops onto the pit becomes 「冰窖」)<br>· **Z (Z1+Z2 merged)** 17.25–21.25 「还设了专管冰的官，\n手下光干活的，就有80人。」 (C5 ✓; no 他, no 凌人 in the line; the stamp keeps 《周礼·天官》 / 凌人：徒八十人; no highlight)<br>· **Q2 → N line** 21.25–23.75 「凿冰，要备足[三倍]的量。」 (C3 ✓; stamp line 2 「令斩冰，三其凌」; the hanging 「？」 over three blocks stays)<br>· **A1** 23.75–27.00 「考古真挖到过一座：秦国的地下冰窖。」 (宝鸡市文物局's own 「大型地下冰窖」; the stamp keeps 秦雍城凌阴遗址)<br>Net −1.5 s. That leaves 3 Q lines (Q1, Q3, Q4), never two in a row. | screenwriter | rows 12, 13; topic-picker E_barrier |
| 3 | must | **北宋 block** 57.75–68.25 | **Problem.** CR's likeliest swipe point (57.75) and boring stretch #2. Four lines of nouns, and the block's real point is never said: after W2's 「只有朝廷和达官显贵」, ice is now **sold on the street**. 「冰雪冷元子」 is an empty name (CR 65.75: 「没有任何解释」), and E5 forbids describing it. **Fix:**<br>· **S1+S2 merged** 「到了北宋，冰上了街：\n汴京六月，青布伞下卖"冰雪"。」 (4.25 s; E6 ✓, sold 「巷陌路口…当街」)<br>· **S3** unchanged, with the silver glint.<br>· **Cut S4 as a line.** Keep its name board 「冰雪冷元子」 and the plum-red boxes as a background prop in the day → night lantern move, which now bridges into Q4's night moat.<br>Highlight at most one of the two lines ([银器] stays). Net −3.5 s. | screenwriter; art-director (prop moves into the transition) | rows 12, 128 (state the turn) |
| 4 | must | **K1** 91.75–94.50 | **Problem.** 「清宫里，真有叫"冰箱"的东西」 claims a Qing-period name; facts support only the museum's name (G6/H3). **Fix:** 「故宫里，就藏着乾隆的"冰箱"：」 (11 字, same window; G6 ✓ 「故宫收藏有一件乾隆御制款的掐丝珐琅冰箱」). The 清·乾隆 counter and the label floating onto the box stay. **If the researcher finds a ✓ Qing use of the word** (e.g. 造办处档案 via a 故宫 page), the original line can come back. Until then, don't write the beat sheet's "冰箱 first meant an ice box" anywhere on screen. | screenwriter; researcher (optional check) | row 11 (plain reading = what the source says) |
| 5 | must | **C2, K3 stamps** | **Problem.** 「据故宫研究员周乾」: his title is 研究**馆**员. **Fix:** 「据故宫博物院周乾」 (8 字), which matches the sources line. | screenwriter | row 32 (never state more than the source) |
| 6 | must | **先猜？** 36.75–38.25 | **Problem.** 1.5 s holds 「先猜？罐里装的是……」 plus three options (~15 字), which needs ≥ 2.2 s at our pace. CR also felt a gap here. **Fix:** ≥ 2.25 s (one bar on the retime). Either shorten the prompt to 「先猜？」 + 「肉？ · 瓜果？ · 酒？」 or keep it and give it 2.5 s. Options ≥ 44 px on one baseline (ep50 gate 4 r1 note 14). | screenwriter (timing); editor (bar) | rows 69, 76; ep50 r1 #14 |
| 7 | should | **W1+W2** 42.75–48.00 | **Problem.** The question has an obvious answer. CR 42.75: 「答案是意料之中的…跟我没关系」. **Fix:** one subtitle, 「这么费劲的冰，\n只有朝廷和达官显贵用得起。」 (4.25 s; D2 ✓, stamp unchanged), on the picture of his cup being taken. Net −1.0 s. Drop the centred-question treatment. | screenwriter | rows 12, 47 (don't ask the question) |
| 8 | should | **T1** 52.25–55.00 | **Problem.** Two 「山」 in a row, and CR 48.0 thought the 酥山 was carved from ice. **Fix:** 「能吃的叫"酥山"：乳酥淋成小山，」 (12 字, E3 ✓). 「能吃的」 separates it from the ice mountain you look at. | screenwriter | row 13 |
| 9 | should | **J1** 28.50–31.25 | **Problem.** CR 31.25 isn't sure whether 「那件"冰箱"」 is the 秦 凌阴 just shown. **Fix:** 「战国早期，开头那件"冰箱"登场。」 (12 字, 3.0 s). It keeps 「登场」, which CR liked, and names the callback. | screenwriter | row 13 |
| 10 | should | **Q4 gloss** | **Problem.** 「夜里凿冰，像在凿石头」 loses 「声」. **Fix:** {清朝北京：夜里凿冰，声音像凿石头} (15). Window 4.5 s (+0.25). | screenwriter | row 11 |
| 11 | should | **M2 → M3** 103–108.75 | **Problem.** 1990 **rural** (1.22) is set against 2024 **national** (104.8). Each is labelled and true, but CR 103.0 noticed (「口径不一样，直接比会有点不对劲」), and a fact-checker commenter would too. **Fix, researcher:** read 国家统计局 年鉴 2025 table 6-15 (rural, per 100 households, 2024; the facts give the URL; it needs a browser or the owner). **If ✓,** M3 becomes 「2024年，农村每百户[N台]。」, one series and the cleanest "your parents' lifetime" story. M4 then rests on A1 alone, as a stamp tag 「全国 104.8」. **If it can't be opened,** keep v1 as written (both labelled) and say so in the revision note. Don't add 城镇 42.33 (a third number; ep50 CR). | researcher → screenwriter | row 32; Risks (numbers) |
| 12 | must | **Sources line** | **Problem.** The source for 2400多年前 / 战国早期 (新华社 2025, B2) is missing. **Fix:** add 「新华社（2025）」 after 湖北省博物馆. Everything else in the line checks out. | screenwriter | brand/platform safety |
| 13 | carry-fwd | **M1 picture** | **Problem.** "A box with a coil on top" is the 1920s domestic monitor-top: the wrong era under a 19世纪 counter, and a design tied to one brand. **Fix:** show a 19th-century machine. A generic steam-era compressor with pipes and a flywheel, frosting over and making a block of ice by itself (no ice put in). The domestic white fridge appears only from 1990. | art-director | row 121 (props belong to their era); brands |
| 14 | carry-fwd | **Frame 0 vessel** | **Problem.** The script has the vessel "dark, with no mist and no glow" after the light clicks off. That is a black object in a black fridge, which won't read at ¼ phone size. **Fix:** the vessel keeps a warm rim and stays the brightest thing in frame (style B 「漆」: the hero object is brightest). Only the fridge's own cold light and hum die. | art-director | rows 47, 71, 81 |
| 15 | low | **C1** line + picture | **Problem.** 「半埋地下」 reads as half-buried; the source has the floor ~1.5 m down in a 6 m hall. **Fix:** 「清宫的冰窖，建在半地下，墙厚两米，」 (13, same window). In the picture the floor sits ~¼ of the wall height below the street line, not half. | screenwriter; art-director | row 11 |
| 16 | low | **C7 stamp** | **Problem.** 「其凉振齿」 sits under C6's 《清稗类钞》 note but is 《燕京岁时记》's line. **Fix:** stamp line 2 「燕京岁时记：其凉振齿」 (10). | screenwriter | row 32 |
| 17 | low | facts **E6/E7** | **Problem.** 「是月巷陌杂卖」 and 「都人最重三伏」 are, as far as I know, in **卷八** of 《东京梦华录》, not 卷六. This is not on screen. **Fix:** re-check the 卷 against the Gutenberg text and fix the row, so later stamps or the publish copy don't inherit it. | researcher | — |
| 18 | optional | **C6** | **Problem.** CR 86.25 asks why the seller knocks the bowls. **Fix:** 「卖酸梅汤的，敲两只铜碗当吆喝，」 (13). G3 has it as a sellers' signal. Only if it fits the window: +0.25 s. | screenwriter | row 128 |
| 19 | owner | **Douyin 标题 / cover / end card** | **标题.** With B′, take option 2 「古代没有冰箱，夏天怎么吃冰？2400多年前的"冰箱"不会冷」 (29). The 标题 and frame 0 then say the same thing and spend no answer.<br>**Cover.** Rows 105/119 say the title alone. If a kicker is wanted anyway, 「不会冷的"冰箱"」 is the only one that spoils nothing; 「冰，要存三倍」 spends the C2–C3 payoff, so don't use it.<br>**End card.** Keep 「你家冰箱里，现在冻着什么？」. CR answered it unprompted (「一盒不敢打开的剩菜」). | producer | rows 105, 119; rubric 1 |

**Net time.** The notes add up to −5.0 s: note 2 −1.5, note 3 −3.5, note 6 +0.75, note 7 −1.0, note 9 +0.25, note 10 +0.25, note 1 ±0. That gives ≈ 1:59.0 incl. the end card, +0.5 s fade (pace.py run on the revised timeline: no TOO FAST lines). The retime to bars only adds time; spend it on the title, 先猜？, the Q1 chisel stop, the C2 hush and the P1 pull-back, never on new lines. Owner row 104: the story sets the length, so ~2:00 is fine.

## Answers to the screenwriter's open decisions
1. **Hook order:** B′ (note 1). Show A and B to the owner as well.
2. **End card:** keep the default (note 19).
3. **J5:** keep 「到了冬天，它还能[温]酒。」. It is within B4 ✓ attributed, and the stamp carries 湖北省博物馆.
4. **M2/M3:** try for one series (note 11). If that fails, keep both, labelled.
5. **Length:** ≈ 2:00 after these notes is fine. Don't pad.

## Story check
- **A new visible event every ~5 s:** yes, line by line in the picture column. The longest stop is the 鉴缶 set-piece, ~9 s, with a new action every 2–3 s (lift, pack, guess, pour, season flip). That is acceptable, unlike ep50 v1's 13 s at the balance.
- **The 清 block is long (≈ 31 s, 10 lines) but each line acts something different:** moat → vault → melt → ghost blocks → ticket → queue → hutong → shiver → hall → mist. Don't cut it.
- **The ×3 callback works as a gap.** CR joined it at 78.75 (「有点爽」) even though it felt the minute's wait. Keep the 「？」 over the blocks; note 2 highlights [三倍] so the setup is marked.
- **Payoff and ending:** P1/P2 is CR's best line (「我会想复述」), and the 1.0 s of air is on the peak. The ending question is personal and easy to answer.

## What must not change (it works)
- **H2/H3** 「它的冷，是冬天凿下的冰，」 / 「从冬天，一直撑到夏天。」 and the ◀◀ seasons rewind to the frozen river.
- **The title:** its wording, silent, 3.0 s on the drop, the plaque above the walker.
- **The 鉴缶 set-piece J2–J5:** exploded 鉴/缶, ice packed in the gap, 先猜？ with 肉？/瓜果？/酒？, 「罐里装的，是[酒]」, 「到了冬天，它还能[温]酒」 with the season flip. This is CR's first 「哇」.
- **T2** 「进冰窖冻好，有点像[冰淇淋]。」 with 像, and the ghost cone for one beat.
- **S3** 「卖得最好的两家，全用[银器]。」 with the silver glint as the set-piece.
- **The ×3 → 约2/3 → 「存三份，化两份，剩下[一份]」 chain,** made by the picture alone. No 因为/难怪 anywhere.
- **The Qing run:** the 周 chisel returning on the moat; C4/C5 冰票 by grade (no numbers); C6/C7 the brass bowls and 「凉得牙齿打颤」 with the one shiver; K2/K3 coin holes and 「凉的是[整间屋子]」.
- **M4** 「冰箱，比家庭还多了。」; the 100-window grid with exactly 1.22 lit; spill past the edge for 104.8.
- **P1/P2** 「古人的"冰箱"里，装的是[冬天]。」 / 「今天的冰箱，自己就能造出冬天。」, the 1.0 s of air, then 「你家冰箱里，现在冻着什么？」 on the Juno card (「关注 Juno · 一起看懂世界」, no 「Juno 出品」).
- **The spine:** one walker (the ep50 silhouette), era wipes by foreground objects, the cold thing in his hand as the only accent, the walk beginning and ending at your fridge.
- **Wording that stays out:** 硝石 (in any form), 世界最早 / 最早的冰箱, 2400年前 without 多, 前433, 冰酪, 杨国忠, 1956, 每户, 卖冰的冰盏, 金璧, 因为会化 / 难怪, BC years, 1978 on screen, and the 《周礼》 鉴 linked to the 曾侯乙 vessel.
- **Safety:** no brands (generic fridge and cup), artefacts drawn not photographed, no maps, silhouettes only, no tomb or bones, no funeral ice.
