# ep20 · 快乐，还是意义？ — script v1 (2026-10-10)

**Owner brief (2026-10-10):** "人应该追求快乐，还是追求意义？从科学的角度解剖这个问题，最后让观众自己做决定. 需要是个 master piece，大制作的感觉. 全程由你自己控制，我不管了"

**Reading taken (unattended):**
- The film opens on the viewer's own situation (two doors tonight), not on the novel.
- The science runs in two halves, 快乐 then 意义, each one dissected with primary studies.
- A summary panel of the evidence on both sides follows.
- Gide's line returns at the end as the extreme pole only.
- The choice is handed back to the viewer. The film does not give a verdict.

**Length / music:** 130 s on s130f, untouched. Title at bar 8 (16.6 s), drop bar 40 (81.4 s), end card at 125.4 s.

**Feed title:** 人该追求快乐，还是追求意义？ · **Plaque:** 快乐，还是意义？ / HAPPINESS OR MEANING

## Structure and picture
| Time | Scene | Medium |
|---|---|---|
| 0–21.6 | Two doors of light on a black mirror floor: rose-gold 快乐 (flickers like a screen, sparkles) and gold 意义 (stairs rising into light). A faceless figure stands between them. The camera flies into the left door. | 3D (doors.js) |
| 20.9–41.2 | 2,250 points of light; 5 pings. About 47 % drift up and cool to blue (mind wandering), the rest warm up (present). The camera dives into one warm point, 此刻. | 3D (phones.js) |
| 40.9–53.0 | Lottery: a gold ticket, 22 winners and 22 others. Overall-happiness bars ≈. Everyday-pleasure bars show winners lower (bar heights illustrative). | 2D |
| 53.0–73.0 | Income chart on a log scale: Kahneman–Deaton flatten at $75k, Killingsworth straight line, the 2023 adversarial collaboration. The line then fans into percentiles: the happiest accelerate, the least happy ~20 % flatten at $100k (curves illustrative). | 2D canvas |
| 72.6–75.3 | Back to the doors; rush into the right door. | 3D |
| 74.7–89.9 | World at night (NASA Black Marble, no borders). A card compares 富裕国家 and 贫穷国家: 对生活满意 ↑↓, then on the drop 觉得有意义 ↓↑, then the 宗教信仰 chip. | 3D map + card |
| 89.5–101.6 | Two rings, 快乐 and 意义, overlap. A stress slider grows 意义 and shrinks 快乐. Particles flow in (得到) and out (给出). | 2D canvas |
| 101.6–109.7 | 14-year survival curves: 人生有目标 vs 目标感低 (illustrative). | 2D canvas |
| 109.7–117.6 | Summary: 快乐 column (46.9 % · 22位 · 20 %/$10万) vs 意义 column (132国 · 压力↑ · 14年), then a big “?” | 2D |
| 117.3–125.4 | Doors again; the figure steps forward. End card: 你会推开哪一扇门？A 快乐 · B 意义 | 3D |

SFX: 5 soft two-tone pings at 24.9, 25.6, 26.3, 27.0 and 27.7 s (the app's random prompts). The song is untouched; SFX is limited only where the sum would pass −0.3 dBFS (mix17.py).

## Lines (window.LINES in main.js)
| # | Time | Line | Fact |
|---|---|---|---|
| 1 | 0 | 今晚，你面前有[两扇门] | — |
| 2 | 4.4 | 一扇：刷两小时手机，[很开心] | — |
| 3 | 8.5 | 一扇：去做那件[很难的事] | — |
| 4 | 12.5 | 哪一扇，会让你[过得更好]？ | — |
| 5 | 20.6 | 先拆“快乐”。哈佛做过一个[手机实验] | F1 |
| 6 | 24.7 | 随机提醒2250人：你[现在]开心吗？ | F1 |
| 7 | 28.7 | 结果，人有[46.9%]的清醒时间在走神 | F1 |
| 8 | 32.8 | 而走神的时候，人通常[更不开心] | F1 |
| 9 | 36.8 | 快乐，只住在[此刻] | F1, F8 (happiness present-oriented) |
| 10 | 40.9 | 那中大奖呢？研究者找来[22位]彩票得主 | F2 |
| 11 | 44.9 | 他们并不比普通人[更快乐] | F2 |
| 12 | 49.0 | 从日常小事里得到的快乐，反而[更少] | F2 |
| 13 | 53.0 | 诺奖得主卡尼曼说：年入[7.5万美元]，快乐到顶 | F3 |
| 14 | 57.0 | 做手机实验的那位学者说：[没有顶] | F4 |
| 15 | 61.1 | 结论打架，两人决定[一起重算] | F5 |
| 16 | 65.2 | 结果：大多数人，钱越多[越快乐] | F5 |
| 17 | 69.2 | 只有最不快乐的约20%，过了[10万美元]就不涨 | F5 |
| 18 | 73.2 | 再拆“意义”。一份调查，横跨[132个国家] | F6 |
| 19 | 77.2 | 富裕国家的人，对生活[更满意] | F6 |
| 20 | 81.4 | 可穷国的人，反而觉得人生[更有意义] | F6 |
| 21 | 85.4 | 原因之一：他们[更虔诚] | F6 |
| 22 | 89.5 | 另一项研究发现：快乐和意义，大部分[重叠] | F7 |
| 23 | 93.5 | 但压力越大：意义[越高]，快乐[越低] | F7 |
| 24 | 97.6 | 快乐更像[得到]，意义更像[给出] | F7 |
| 25 | 101.6 | 还有一项研究，跟踪了成年人[14年] | F8 |
| 26 | 105.7 | 觉得人生有目标的人，[活得更久] | F8 |
| 27 | 109.7 | 快乐，是此刻的[感受]；意义，是一生的[故事] | F7 (present vs past–future) — reflective wording |
| 28 | 113.8 | 科学能算出代价，但[选不了答案] | reflection |
| 29 | 117.8 | 一百多年前，有本小说写：“我们生来[不是为了幸福]” | F9 |
| 30 | 121.9 | 你呢？今晚，[推开哪一扇]？ | — |

## Facts (primary sources; copies in sources/)
- **F1** Killingsworth & Gilbert (2010) *Science* 330(6006):932, doi:10.1126/science.1192439.
  - Abstract: people think about what is not happening almost as often as what is, "and … doing so typically makes them unhappy."
  - Harvard Gazette (11 Nov 2010): an iPhone app "contacted 2,250 volunteers at random intervals to ask how happy they were …"; "People spend 46.9 percent of their waking hours thinking about something other than what they're doing."
- **F2** Brickman, Coates & Janoff-Bulman (1978) *JPSP* 36(8):917–927.
  - "22 major lottery winners with 22 controls … lottery winners were not happier than controls and took significantly less pleasure from a series of mundane events."
- **F3** Kahneman & Deaton (2010) *PNAS* 107(38):16489–93.
  - More than 450,000 Gallup-Healthways responses: "Emotional well-being also rises with log income, but there is no further progress beyond an annual income of ~$75,000."
  - Life evaluation keeps rising.
  - Kahneman won the 2002 Nobel in economic sciences.
- **F4** Killingsworth (2021) *PNAS* 118(4):e2016976118.
  - 1,725,994 experience-sampling reports from 33,391 employed US adults; "no evidence for an experienced well-being plateau above $75,000/y."
- **F5** Killingsworth, Kahneman & Mellers (2023) *PNAS* 120(10):e2208661120 — an adversarial collaboration.
  - "the flattening pattern exists but is restricted to the least happy 20% of the population."
  - "The happiness of the least happy 15% … leveling off abruptly at $100,000."
  - "Happiness increases steadily with log(income) among happier people, and even accelerates in the happiest group."
- **F6** Oishi & Diener (2014) *Psychological Science* 25(2):422–430.
  - Gallup World Poll, 132 nations: life satisfaction higher in wealthy nations, meaning in life higher in poor nations; "In part … because people in those nations were more religious."
- **F7** Baumeister, Vohs, Aaker & Garbinsky (2013) *J. Positive Psychology* 8(6):505–516 (abstract on the Stanford GSB publication page).
  - Overlap: the two "overlap, but there are important differences."
  - Present vs time: happiness is present-oriented; meaningfulness integrates past, present and future.
  - Taker vs giver: happiness goes with taker, meaning with giver.
  - Stress: worry, stress and anxiety go with higher meaning and lower happiness.
- **F8** Hill & Turiano (2014) *Psychological Science* 25(7):1482–6 (MIDUS).
  - "purposeful individuals lived longer than their counterparts did during the 14 years after the baseline assessment, even when controlling for other markers of psychological and affective well-being."
- **F9** Gide, *La Porte étroite* (1909), Ch. VII (Bussy tr. 1924, Gutenberg #79693): "we were not born for happiness."
  - Gide won the 1947 Nobel Prize in Literature (nobelprize.org).

## Honesty notes
- Every chart shape is illustrative and labelled 示意; only the numbers quoted above appear as numbers.
- The 46.9 % visual is a snapshot of the field; the HUD says 清醒时间里，在走神, matching the time-share statistic.
- The 132-nation card shows directions only. No country is singled out and the map shows no borders.
- These are correlational studies. Lines use 研究发现 / 更… / 通常, never 证明.
- Lines 27–28 are reflection, and the film gives no verdict: the end card asks the viewer.

## Delivery v1 (2026-10-10 21:23)
Farm run 38078749691 → join 38079272102 (md5 6718fa8d…). Mix = s130f untouched + 5 pings (sfx20.py, mix17.py). Send version 快乐还是意义_v1.mp4 (2-pass 1500k, 27.7 MB); HD master made locally (64.8 MB), link on request. Checks: 3899 frames / 129.97 s, no black runs ≥0.4 s, review contact sheets at ~3 s spacing.

## v2 (2026-10-10 22:10) — owner: meaning half strong; happiness half not intriguing/easy; visuals too long, generic, boring
- Happiness half rewritten for plain words and surprise.
  - Kept: the App (2250 people, near half the time "人在这儿，心不在").
  - New: the chocolate experiment. Small, Zatorre, Dagher, Evans & Jones-Gotman (2001) *Brain* 124(9):1720–33: people "ate chocolate to beyond satiety", rating each piece from very pleasant to unpleasant ("from pleasure to aversion"). Lines: 第一块：真好吃 / 吃到吃不下还在吃：变成难受 / 同一种快乐，会越用越淡 (interpretation, consistent with habituation in Brickman 1978).
  - Then the lottery (3 lines), and money in 2 plain lines; the Kahneman-vs-Killingsworth back-story was cut.
- Every beat is now its own lit 3D diorama on the same black mirror floor:
  - desk + lamp, with the person's blue light-double drifting away;
  - a chocolate bar on a plinth vanishing piece by piece, beside a pleasure gauge;
  - a winner under falling gold coins next to an ordinary person, equal halos, small joys dimming at the winner;
  - gold coin towers per income step with two rows of people (blue row stops brightening at $10万);
  - the world-at-night map with gold light columns that collapse on the drop;
  - two orbs of light under a stress weight, with particles taken in vs given out;
  - a 14-lamp road walked by two groups;
  - the doors again, with the evidence columns beside them.
- Fix: the floor glaze now draws first (renderOrder −10). Before, it darkened the lower half of additive objects.
- Delivered 快乐还是意义_v2.mp4 (farm run 38082145311, md5 cfeaaff2…).
