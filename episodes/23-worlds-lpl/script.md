# ep23 《五分之一》 — LPL 能夺冠吗？（S16 / Worlds 2026）

Unattended run, 2026-10-18 night. The owner asked for "a finished video tomorrow morning", using big data to estimate China's title chances,
the most favourable routes, polls of other AIs, lots of data visualization and simulations, fun facts, and the usual BGM.
**Readings I took (owner was asleep):** title 《五分之一》 (the recommended option); BGM s130f (the series track, 118.5 bpm, untouched);
"ask DeepSeek, ChatGPT, Gemini, Grok…" done with the open-weights models those labs publish, run on Modal with one shared briefing,
because no browser/app or API keys were reachable tonight (see the morning report).

**Length / music:** 129.97 s on s130f, untouched. Bars at 0.383 + 2.0248·n. Title on bar 8 (16.58 s), big drop bar 40 (81.375 s), end card 125.4 s.
**Look:** a bright neon arena runway (plum sky, warm horizon, red LPL vs blue LCK light pillars). LED panels on stands carry the data;
the camera keeps one travel direction (forward-right) and glides from panel to panel on the bar lines. 3D set-pieces: data streams into
the simulator (hook), 16 glass tubes filling with 100,000 simulated champions, and three best-of-five gates the camera flies through.

## Lines (lines.json)
| Time | Line | Picture | Source |
|---|---|---|---|
| 0.00 | 今年世界赛，[LPL]能夺冠吗？ | simulator panel, counter rolling, champion paths flashing | — |
| 4.43 | 我们把S16模拟了[十万次] | counter → 100,000; real running tally LCK/LPL | sim2.py (100k runs, blend ratings) |
| 8.48 | 喂进去本赛季[1746场]比赛 | | gol.gg team match logs, 1,746 unique games of the 17 teams |
| 12.53 | 算出来的答案是—— | tally freezes | |
| 16.58 | TITLE 五分之一 · LPL 夺冠概率 ≈ 21% | plaque + five columns, one red | sim: LPL 21.1% |
| 20.63 | 先给16支队伍各打一个[战力分] | rating bars | blend of Riot GPR (2026-10-18) and 2026 results fit |
| 24.68 | 分差越大，赢下一局越[稳] | Elo curve; BLG v T1 53%, BLG v KC 69% | ratings.json |
| 28.73 | 瑞士轮：[三胜]晋级，[三败]回家 | one simulated Swiss stage (seed 50) | format: Inven Global, loltheory |
| 32.78 | 八强起全是[BO5]，连赢三轮夺冠 | three BO5 boxes | |
| 36.83 | 十万届世界赛，冠军落在哪？ | particles rain into 16 tubes | |
| 40.88 | LCK拿走[71%]，LPL拿到[21%] | region totals | LCK 71.3, LPL 21.1 |
| 44.93 | 中国队的希望，八成在[BLG]身上 | BLG tube glows, 17.8% | 17.8/21.1 = 84% |
| 48.98 | 2017年以来，有个扎心数字 | T1 10:0 LPL | Leaguepedia + gol.gg |
| 53.03 | 世界赛BO5，T1对LPL[十战全胜] | ten series cards | 2017 SF RNG … 2025 SF TES |
| 57.08 | 去年对LCK的BO5：[0胜7负] | seven 2025 cards | gol.gg 2025 FS/MSI/EWC/Worlds |
| 61.13 | 但今年，BLG已[三次]在BO5赢LCK | BLG 3:2 BFX, 3:2 T1, 3:1 HLE (+ MSI final 2:3 HLE, greyed) | gol.gg 2026 |
| 65.18 | 那么，什么样的路线最有利？ | "what if" console | paths.py |
| 69.23 | 第一轮抽到谁？影响[不到1%] | R1 LYON/MKOI/T1 → LPL 21.4/21.3/20.8 | |
| 73.28 | BLG瑞士轮[3:0]出线：[24%] | 3:2 18.3 / 3:1 21.2 / 3:0 24.0 (BLG title) | |
| 77.33 | 半区里一支LCK都不碰：[29%] | 3/2/1/0 LCK teams → 16.3/18.1/22.2/29.4 | |
| 81.38 | 两件事都发生：LPL夺冠[35%] | DROP: LPL 34.9% (BLG 31.3%) | |
| 85.43 | GEN和HLE都没进四强：[46%] | LPL 45.7% | |
| 89.48 | 我们还问了[6个AI]：谁会夺冠？ | six AI terminals | aipoll (Modal) |
| 93.53 | 给它们同一份赛季资料 | answers type in | aipoll/prompt.txt |
| 97.58 | (AI result 1) | first-place tally | |
| 101.63 | (AI result 2) | | |
| 105.68 | 为什么只有五分之一？ | camera heads for the gates | |
| 109.73 | 连赢三个BO5，每个六成：[22%] | flies through three gates on beats; 60%×60%×60% ≈ 22% | 0.6³ = 21.6% |
| 113.78 | 模型不会打比赛，选手会 | 16 team chips ring | |
| 117.83 | 10月24日凌晨，瑞士轮开打 | | Swiss starts Oct 24 01:00 Beijing (IT之家) |
| 121.88 | 你觉得谁会夺冠？评论区见 | | |
| 125.4 | END CARD 五分之一 · 你觉得今年谁会捧杯？ | | |
