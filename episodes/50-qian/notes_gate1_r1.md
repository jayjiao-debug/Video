# Gate 1 notes: 钱是怎么从贝壳变成二维码的？ script v1 + lines.json (47 lines, 2:36.0), r1. Verdict: REVISE

Scores (rubric 1–5, only the areas this gate covers): **script 4** · facts **pass, with 1 stamp fix, 1 re-check and a sources-line fix** · visual/info/edit/motion/sound: not scored at this gate.

**Bottom line.** This is a strong v1 with a real spine. The film follows one thread, what makes money worth something: a thing → its weight → a name → a promise → trust. Along that thread it builds four 原来如此 beats: 钱 was a spade, 半两 is a weight, paper came because iron was too heavy, and money is trust. Every number traces to a ✓ row, and every wording limit holds (之一, 25斤8两 only, 移动支付 with no 扫码 number, 网络支付 10.17亿, 2025 Q1–Q3, 《说文》 via 《太平御览》, 621, 1024, 不能直钱一文, 明中晚期). No banned wording appears. These things would get it sent back:
- **The strongest twist comes too late.** The cold reader stayed because of 「偏偏钱是金字旁」 at 0:11, not the frame-0 line. The topic-picker data says the first 5 s decide the size of the film.
- **Two cause-and-effect gaps (owner row 128).** Why the 宝钞 collapsed is never said. Why a spade explains 金字旁 is left to the viewer.
- **T1b 「有10.17亿。」 fails the stand-alone rule (row 13).** The today block also stacks three big numbers in 13 s.
- **The S1 stamp may contradict S2,** depending on how 《宋史》 is read.

All of these are line fixes, and one round should be enough.

**Inputs.** I read:
- brief.md, facts.md (all rows), script.md, lines.json and vo_lines.json;
- the history-video-style and topic-picker skills;
- the ep48 gate-1 notes as the bar, rubric.md and owner-notes.md (all rows);
- **coldread_gate1.json** (it arrived during the review and is cited as CR below).

My own `pace.py --film-end 156` run: no TOO FAST lines, 7.8 s waiting = 5 %, the same as the script reports. The Q lines with their glosses all sit within 0.01–0.15 s of their reading floor (C2 3.24/3.25, G1 4.24/4.25, S3 4.24/4.25, M2 4.10/4.25).

## Fact check (every number, quote and character → facts.md)

| Line | Claim | Row | Ruling |
|---|---|---|---|
| H1 | 你手机里的钱，一千年前只是一张纸 | §0 safe wording, H1 | ✓ verbatim to the safe hook. No 最早 and no 祖宗. The wording is ambiguous to a reader (CR 0.0), see note 1. |
| H2, B1 | 三千多年前 · 贝壳当钱 · 商代晚期 · 殷 | B1 | ✓. Never 「最早的货币」. |
| H3, H4, C1 | 财 货 贵 carry 贝, and 钱 is 金字旁 | B5, C1, B6 | ✓. 财 (贝+才), 货 (化+贝) and 贵 (中一贝) all show 贝 in 简体, and 钱 shows 钅. No 买/卖/宝 appear. [金] highlights the word in the subtitle, which is right. |
| B2a, B2b | 远方海边 · 稀少、结实、好带 | B3 | ✓. These are the source's three reasons. |
| B3 | 商代晚期，还有了青铜铸的贝 | B4 | ✓ (with no 最早). The picture column says "the first time metal enters the money". That is fine as an animator note, but no 「最早」 may reach the screen (note 13). |
| C2 | 钱，铫也，古田器也 · 《说文解字》 / 据《太平御览》引 | C2 | ✓. The attribution chain is exactly right. 铫 is read **yáo**. |
| C3, C4a, C4b | 钱是一把铲子 · 东周 铲→货币 · 名字也叫钱 · 国博 stamps | C3, C4 | ✓, attributed to 国博. The logic gap to 金字旁 is note 5. |
| D1a, D1b | 各国钱不一样：刀、铲、圆、贝 | D1 | ✓. There is no map and no state names. |
| E1 | 秦统一六国，也统一了钱 · counter 前221 · stamp 「秦统一六国后」 | E1 | ✓, provided the counter lands on 前221 and holds (see open decision 1). |
| E2 | 写着半两，就得重半两 | E2 | ✓ (重如其文). |
| F1a, F1b | 五铢 = a weight · 前118 · 七百多年 | F1, F2, G4 | ✓. It never says 734 or 739. Counter 前118 → 621 = 738 years, consistent. |
| G1 | 废五铢钱，行开元通宝钱 · 621 · 武德四年 | G1 | ✓. This is a verbatim excerpt of 《旧唐书》. |
| G2 | 新钱上的字，不再是重量 | G4 | ✓. CR finds it half-said, see note 6. |
| S1 stamp | 「十枚铁钱抵一枚铜钱」 | H5, P11 | **Re-check.** The source ratio is 铜钱一当**小**铁钱十. As I remember the full 《宋史》 sentence, the 嘉/邛 coins at 贯二十五斤八两 are the 景德**大**铁钱, each worth one copper coin or ten small ones. If that is right, the stamp beside S2's string makes viewers think the 25-斤 string was worth only 100 copper coins. See note 4. |
| S2 | 一串一千文，重二十五斤八两 | H5 | ✓. 25斤8两 only, with no kg and no 500斤. The line is true under either reading (1000 coins per 贯). |
| S3 | 患蜀人铁钱重，不便贸易 | H3/H4 | ✓ verbatim. |
| S4a–S5b | 交子 · 一交一缗 · 富民十六户 · 不能偿所负，争讼不息 | H3, K1 | ✓. 「兑」 is plain enough for the fact, but the promise behind it is never set up (note 7). |
| S6 | 1024年，官府接手交子 | H1, H3 | ✓. |
| S7 | 世界上最早的[纸币之一] | H2 | ✓. The gold highlight carries 之一, so a muted reader sees the qualifier. Keep it (CR wanted it "more certain": no). |
| S8 | 红黑套印，暗藏编号，防人伪造 | H7 | ✓ (朱墨间错, 隐密题号; 人民论坛 「防伪」). |
| M1a, M1b | 明初 · 1375 · 一贯=一千文=一两银 | I1 | ✓. The 1375 counter matches the stamp 「洪武八年定比价」. |
| M2 | 钞一贯不能直钱一文 · counter 「明」 with no year | I2 | ✓ verbatim (是时 dropped). The cause is missing, see note 3. |
| M3–M4b | 明朝人改用白银 · 明中晚期 · 每次都要称 | I3, I4, I5 | ✓. 明中晚期 is on the counter and the stamp. |
| R1 | 1948 · 人民币 · 1948.12.01 石家庄 · 人民银行成立 | J1 | ✓ and neutral. |
| T1a, T1b | 10.17亿 网络支付 · 2025年12月 · 90.3% | A1 | ✓ (not called growing, not 扫码). The form problem is note 2. |
| T2 | 去年前九个月，移动支付1700多亿笔 | A2 | ✓ (1703.82亿, 2025年1–9月). It is tagged 移动支付, never 扫码. |
| T3 | 平均每秒，七千多笔 · 估算 | A2 | ✓. 1703.82亿 ÷ (273 d × 86400) = 7,224. It still holds on the full year (≈ 7,340). The 估算 label is on screen. |
| P1–P2 | 钱越变越轻 · 本身不值钱 · 大家都信它 | K5, K2 | Our synthesis, unattributed, as K2 requires. |
| Sources line | 「中国人民银行 2025年支付体系运行情况」 | A2/A4 | **Wrong source.** The film's number comes from CNNIC 第57次 quoting 人民银行 (A2). The annual report (A4) was seen only in a reprint. J1's source is missing. See note 15. |

Every highlighted word and every character on screen carries exactly what its line says. Highlights: 15 of 47.

## Notes

| # | Sev | Where | Problem → fix | Route to | Owner note |
|---|---|---|---|---|---|
| 1 | must | **Hook H1–H4**, 0.00–13.25 | **Problem 1.** The 预期违背 that holds viewers is 「偏偏"钱"，是金字旁」, and it arrives at 10.75 s. CR: 「真正让我留下来的是第11秒…如果刷得快，前4秒可能就划走了」, with a swipe risk at 4.75. The frame-0 line is 「熟悉的东西加一点反常识」. Paper money a thousand years ago is half-known.<br>**Problem 2.** H1 is ambiguous on its own (CR 0.0: is it "money then was paper" or "your money is like paper"?).<br>**Topic-picker data.** It ranks 预期违背 above 自我参照, and B_twist with E_barrier 0 is what holds the first 5 s.<br>**Fix (new default, order B).** Put the twist on frame 0, keep your own phone in the picture, and make the two time-jumps one rewind:<br>· **H1 0.00–4.50** 「财、货、贵，都带个"贝"，\n偏偏"钱"，是[金]字旁。」 (one subtitle, two rows, 14 字; row 2 is on screen by ~2.3 s)<br>· **H2 4.50–9.00** 「你扫码付的钱，\n倒回一千年，只是一张[纸]。」 (15 字; same facts as §0/H1. It names the title's 二维码 with no number, and 「只是」 sets up P2a)<br>· **H3 9.00–12.75** 「倒回三千多年，钱是一枚贝壳。」 (12 字, B1)<br>· **Title** on the drop (≈ 12.75–13.25, editor).<br>**Picture.** Frame 0 is first person at the stall: your phone over the code. The four characters stamp onto the screen one per beat: the 贝 of 财 货 贵 glows, and the 钅 of 钱 glints cold. On 「倒回一千年」 the payment ✓ and the phone peels into the paper slip (◀◀, counter 2026 → 1024). Then it rewinds to the cowrie (约前1300).<br>**Fallback (order A, v1 order).** Keep H1–H4 as they are, but make H1 「你扫码付的钱，\n倒回一千年，只是一张[纸]。」 and H2 「倒回三千多年，钱是一枚贝壳。」 so the ambiguity goes.<br>**Owner.** The producer shows A and B as text at the gate-1 touchpoint. I recommend B. | screenwriter (lines); art-director (frame 0); producer (show A/B) | rows 22, 45, 47, 48; topic-picker §3/§6 |
| 2 | must | **T1a/T1b** 125.25–130.25 | **Problem 1.** 「有[10.17亿]。」 alone doesn't say what it is (row 13; open decision 6).<br>**Problem 2.** The today block runs three big numbers in 13 s (10.17亿 · 1700多亿 · 七千多). CR: 「连着三个大数字…记不住…另外两个会被忽略」. The user count also tells viewers what they already know.<br>**Fix (preferred).** Cut T1a/T1b. The note becomes the phone at the stall during R1's tail, as a picture with no line, and T2 follows directly. This frees ~5 s for note 3.<br>**If the owner wants the user count,** use one line: 「如今，[10.17亿]人用网络支付。」 (4.25 s). | screenwriter | rows 12, 13, 79 |
| 3 | must | **M1b → M2** 103.50–111.50 | **Problem.** The 宝钞 goes from 1000 文 to 「不到一文」 with no cause. CR 107.25: 「一贯不是等于一千文吗？怎么会一文都不值？…印太多了？没讲」. That leaves the trust takeaway (P2b) resting on one example (交子) instead of two.<br>**Fix, researcher.** Find a ✓ source for why 宝钞 lost its value (over-issue, and/or not redeemable for coin or silver). Try 《明史·食货志五》 itself, 人民论坛 (郑备军), 光明日报 (任双伟) or 徐瑾 (文摘报). Add a row with the exact wording.<br>**Fix, screenwriter.** Insert one N line between M1b and M2, worded to that row. Templates:<br>· if 滥发 is ✓: 「可官府越印越多，」 (7 字, 2.25 s)<br>· if both are ✓: 「可钞越印越多，又换不回银子，」 (12 字, 3.75 s)<br>The M2 gloss stays.<br>**If nothing is ✓,** leave M2 as it is, and say so in the revision note. | researcher → screenwriter | row 128, row 109 |
| 4 | must | **S1 stamp** (68.00) + facts **H5** | **Problem.** The stamp 「十枚铁钱抵一枚铜钱」 sits next to the 25斤8两 string. The source says 铜钱一当**小**铁钱十. I believe the full 《宋史·食货志下二》 sentence describes the 嘉/邛 coins as 景德**大铁钱**: 「每一当铜钱一、小铁钱十」. If so, the string was worth 1000 copper coins, and the stamp misleads.<br>**Fix, researcher.** Re-open the passage (gushiwen, or ctext via the asset farm) and update H5 with the full sentence and which coin it describes.<br>**Fix, screenwriter.** Either way, change the stamp line 2 to 「**蜀地用铁钱**」 (5 字), or 「据《宋史·食货志》」. S2's line stays: 1000 coins = 1 贯 is true under both readings. | researcher; screenwriter | row 32 (never state more than the source) |
| 5 | should | **C4a** 36.50–39.75 | **Problem.** The hook asks why 钱 is 金字旁, and the answer given is "it was a spade". The metal step is never said. CR 36.5: 「为什么铲子能变成货币？…因为是金属？视频没说」.<br>**Fix, researcher.** Confirm with a ✓ source (国博 object page or 光明日报) that 布币 were **cast in bronze**.<br>**Fix, screenwriter.** If it is confirmed, C4a becomes 「东周时，人们照着铲子铸铜币，」 (12 字, 3.75 s, +0.5 s). C4b stays, and the 钅 glint answers H1.<br>**Don't** claim the farm spade itself was bronze (Shang–Zhou farm tools were often not metal; no row supports it). | researcher → screenwriter | row 128 |
| 6 | should | **G2** 64.75–68.00 | **Problem.** CR 64.75: 「不再是重量。那变成了什么？…像讲了一半」.<br>**Fix.** Use 「**新钱的名字，不再是[重量]。**」 (9 字, the same window). This is G4's own wording (不再以重量命名), and 「名字」 tells the viewer what took the weight's place.<br>**Optional.** Seed the trust idea in the stamp: line 1 「— 621年 · 唐」, line 2 「据《人民周刊》：更靠信用」 (K3 ⚠, attributed). | screenwriter | row 13 |
| 7 | should | **S4b, S5b** 81.25–90.25 | **Problem.** The paper is never said to be a promise, so 「兑不出钱」 lands as jargon. CR 83.75: 「没解释"兑不出钱"是什么意思」.<br>**Fix.** S4b → 「一张纸，**能换**一千文。」 (same length). S5b → 「后来**换不回钱**，官司不断。」 (same length; = 不能偿所负).<br>**Why.** 「能换 → 换不回」 is the trust mechanism in plain words, and P2b then pays it off. | screenwriter | rows 79, 128 |
| 8 | should | **B1** 16.25–18.50 | **Problem.** Right after a hook about 金, 「为什么是贝壳？」 asks a question nobody asked. The answer is textbook. CR 18.5: 「刚被金字旁吊起来的好奇，被这段先拉回去了」.<br>**Fix.** Cut B1. B2a becomes 「贝壳从很远的海边运来，」 (10 字), starting on the walker's first step after the title. This saves ~2 s. B3 (bronze shells) stays: it is the bridge to 金. | screenwriter | row 12 |
| 9 | should | **D1a/D1b** 42.25–47.50 | **Problem.** CR names 42–60 s as the likeliest swipe zone (「开始像历史课」). The four-word list also has only 1.75 s to be spoken with its pauses.<br>**Fix.** Make it one line: 「**战国时，各国的钱有刀、铲、圆、贝。**」 (12 字, 3.75 s; saves ~1.5 s). The fanned-four picture stays. | screenwriter; editor | row 14 |
| 10 | optional | **F1b** 57.75–60.50 | CR 57.75: 「七百多年…不知道这有多厉害」. Option: 「一用七百多年，从汉用到[唐]。」 (11 字, +0.65 s, F2 + G1). It names dynasties the viewer knows, and the counter race 前118 → 621 shows the same thing. | screenwriter | — |
| 11 | must | **vo_lines** readings | Add these to the first-take listen list:<br>· **得 děi** (E2 「就得重半两」; a TTS reading of dé changes the meaning)<br>· **称 chēng** (M4a)<br>· **重 zhòng** (E2, S2, S3)<br>Already listed and confirmed right: **铫 yáo** (古田器, not diào), 行 xíng, 便 biàn, 直 zhí. Also listen to M4b 「看重量」, which must parse as 看·重量, not 看重·量; if it doesn't, use 「钱又按重量算了。」. | producer (voice); editor | — |
| 12 | carry-fwd | **Coin and note faces** (E2, F1a, G1/G2, M1a) | Era props (row 121): the legends on the coins are in the period's script (半兩, 五銖, 開元通寶), and the Ming note reads 壹貫. Subtitles, labels and the balance tags stay 简体. The H1 characters 财 货 贵 钱 stay 简体 (that is the point), as overlays on your phone, not as props inside the Shang set. | art-director, animator | rows 121, 125 |
| 13 | carry-fwd | **B2b, B3 pictures** | 「稀少」 is not one shell alone on a beach (shells are common at the coast; they were rare inland): show one cowrie traded for a big load in an inland market. B3 carries no 「最早」 label (B4 ⚠). | art-director | rows 11, 32 |
| 14 | carry-fwd | **Counter / M2 tag** | E1: the counter lands on 前221 on 「秦统一六国」 and **holds**. Ticking on would show unsourced years under 「也统一了钱」. F1b: the race skips year 0 (前1 → 1). M2: the value tag must not stop on labelled 100 and 10 (unsourced steps); roll 1000 → 「不到1」 with no labelled stops. | animator | row 77 |
| 15 | must | **Sources line** | Replace 「中国人民银行 2025年支付体系运行情况」 with 「CNNIC 第57次报告（引人民银行数据）」, which is already listed, so just drop the PBOC item, or name 「人民银行 2025年第三季度支付体系运行总体情况」 (A3, opened). Add 「中新网 2015」 for J1 (1948). If note 16 confirms A4, the annual report can go back in. | screenwriter | brand/platform safety |
| 16 | should | **T2** + facts **A4** | Open decision 3. 「前九个月」 is accurate but sounds arbitrary, and a full year is what people expect.<br>**Fix, producer/researcher.** Ask the owner (or a browser that can reach pbc.gov.cn) to check the 2025 annual line (2314.64亿笔).<br>**If it is ✓,** T2 becomes 「去年一年，移动支付[2300多亿笔]。」 (12 字, −0.5 s) with the stamp 「— 2025年 / 人民银行数据」. T3 is unchanged (≈ 7,340/s, still 七千多).<br>**If not,** keep 「去年前九个月」 (the stamp carries 2025年1–9月); no need for 「2025年」 in the line. | researcher; producer → screenwriter | row 32 |
| 17 | owner | **End card** | Keep the default 「你手机里的那串数字，凭什么算[钱]？」. It echoes frame 0, applies the takeaway to the viewer's own phone, and CR wanted to answer it (「我微信里的钱，到底算什么？」).<br>**Show the owner the alternative** 「你上一次用纸币，是什么时候？」 (easier to answer, but it drops the trust idea).<br>**Tone option for the owner:** 「为什么能算钱」 is softer than 「凭什么」, if he worries that 凭什么 sounds like a challenge to the currency. I'd keep 凭什么. | producer | rubric 1 (end-card question) |

**Net time.** Note 1 is −0.5 s, 2 is −5, 3 is +2.25…3.75, 5 is +0.5, 8 is −2, 9 is −1.5 and 16 is −0.5, so the film comes to ≈ 2:30. The 宝钞 pause and the title keep their lengths.

## Answers to the screenwriter's open decisions
1. **E1 counter.** Keep 「前221」: land it on 「秦统一六国」 and hold it, with no ticking (note 14). The stamp's 「后」 carries the hedge.
2. **Era-only counters.** Accepted. The art director gives era names a different face from the numerals (e.g. the 文楷 body vs the Cormorant years), so a name never looks like a missing number. 「约前1300」 keeps its 约.
3. **「去年前九个月」.** Keep it unless A4 is confirmed, in which case use 去年一年 (note 16).
4. **4th Q line.** Keep 《旧唐书》 「废五铢钱，行开元通宝钱」. The 六斤四两 comparison would add a number pile, and the bent walker already makes 25斤8两 heavy.
5. **End card.** Keep the default and show the owner the alternative (note 17).
6. **T1b.** Cut T1, or use the single line (note 2).

## Hook, story, voice and safety
- **Hook and title.**
  - v1 grips in 3 s, but only weakly: there is a subtitle on frame 0, your phone, and the ✓ on the first beat.
  - The two twists back to back are not too much. They are in the wrong order. The phone→paper→shell move is one rewind, and the 贝/金 paradox is the twist, so the twist goes first (note 1).
  - Muted clarity is fine: everything is in the subtitles, and [金] carries the punch.
  - The title 「钱是怎么从贝壳 / 变成二维码的？」 doesn't overclaim, because the film walks the whole way. CR noted that no line ever says 二维码; note 1's 「你扫码付的钱」 closes that gap with no number attached.
  - The 3-s 「blank」 CR felt at 13.25 is the title card itself, which the cold reader didn't see. Keep it.
- **Story.** The walk carries the film. Each era adds one new idea: shells → bronze copies → the spade's name → a weight on the coin → a name on the coin → too heavy, so paper → private paper fails → state paper fails → back to weight → numbers.
  - The best beats: C3 (CR's 「最大的惊喜，我会想转给朋友」), E2, S2 → S4b, and M4a/b (CR: 「整个视频最聪明的一句」).
  - Weak spots: the B1 detour (note 8), the 42–60 s run (note 9) and the cause gaps (notes 3, 5, 7).
  - The trust insight is half-earned now. With notes 3 and 7 it is earned twice: 交子 「换不回钱」 and 宝钞 「越印越多」.
  - 「钱越变越轻」 is a trend line with honest exceptions (iron, silver). The picture already shows the bumps, and CR picked it as the screenshot line. **Keep it.**
- **Voice.**
  - Every comma-split pair reads as one natural sentence.
  - Numbers are spelled right: 一零二四年, 一九四八年, 十六家, 十点一七亿, 一千七百多亿笔, 二十五斤八两, 七千多笔.
  - The Q lines are inside their windows with their glosses, but with no slack. On the retime, the editor may add bars there and never cut them (the same as ep48 note 11).
  - Add the readings in note 11.
- **Safety.**
  - No brands: a generic phone and a generic code.
  - No bordered map: B2a is a road and a sea line, and 战国 is four stalls.
  - No real banknote design: 交子, 宝钞 and the modern note are our own generic designs.
  - No portraits (no 袁大头), no tomb or bones (妇好 dropped).
  - R1 is a neutral date.
  - The end question is about the viewer's phone, not policy. Fine.

## Douyin title
I agree with option 1: 「钱是怎么从贝壳变成二维码的？财货贵都带贝，偏偏钱是金字旁」 (28 字). It has the search words plus the ✓ twist, and spends no answer. If note 1 order B is taken, the 标题 and frame 0 say the same thing, which is good. The cover kicker 「偏偏钱是金字旁」 keeps the puzzle. 「钱，原来是把铲子」 gives away C3: per row 105, don't use it on the cover.

## What must not change (it works)
- **The 金字旁 paradox and its payoff chain:** H3/H4 wording (moved to frame 0 by note 1), C1 「那"钱"，为什么是金字旁？」 as the callback, the C2 Q line with 《说文解字》 / 据《太平御览》引, C3 「原来，"钱"是一把[铲子]。」 with the walk pausing to dig, and C4b with the label hopping onto the coin.
- **The balance motif:** E2 「钱上写着"半两"，就得重[半两]。」 (level) → F1a → G2 (no label on the pan) → M1b's three pans → M2 (the pan flies up) → M4b (silver with 半两's ghost, 「钱又回到了看重量」).
- **The 交子 sequence:** S2 「一串一千文，重[二十五斤八两]。」 with the bent walker, S3 《宋史》 Q, S4a/S4b, the 16 lanterns going out, S6 1024 with the phone ghost, S7 「最早的[纸币之一]」 **with 之一 highlighted**, and the S8 print shop.
- **The 宝钞 collapse** with the Q line 「钞一贯不能直钱一文」, and the 2.0 s near-silent pause (the film's one hush) before M3.
- **The ending:** P1a/P1b 「钱越变越轻：贝壳、铜、纸，最后是一串数字。」, P2a/P2b 「纸和数字本身不值钱，值钱的是，大家都[信]它。」 on the biggest image, the end question, and the Juno card per house style.
- **The walk** as the spine (one walker, era wipes on downbeats, the money in his hand as the only accent), and the loop back to the hook's stall.
- **The voices:** four Q lines, never two in a row, each with an unspoken gloss shown with row 1.
- **Wording that stays out:** none of 最早的货币, 第一张纸币, 祖宗, 扫码 next to a number, 500斤, kg, 734/739, 天圆地方, 张咏, 2314 (unless note 16 confirms it), 「增长」 for 网络支付 appears. Keep it that way.
