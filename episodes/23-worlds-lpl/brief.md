# ep23 brief: LPL 夺冠概率（S16 / Worlds 2026）— owner idea 2026-10-18

Angle: simulate the whole Worlds 100,000 times from Riot's official Global Power Rankings → LPL wins ≈ 22%.
Principle: even the strongest team must win three Bo5s in a row; probabilities multiply (60%×60%×60% ≈ 22%).
Publish before the Swiss stage starts (Oct 24 01:00 Beijing). Re-run once the Round 1 draw (after the Oct 19 play-in final) is known.
No odds/betting wording (Douyin), no team logos, no player likenesses, generic trophy.

## Facts (checked 2026-10-18)
| Claim | Source |
|---|---|
| Play-In Oct 16–19 (LA, Bo5 double elim); Swiss Oct 24–Nov 1 (Allen, TX); QF Nov 4–7, SF Nov 8–9, Final Nov 15 Brooklyn (Beijing time) | IT之家 2026; Inven Global cheat sheet |
| LPL: AL, BLG, TES, IG; LCK: GEN, HLE, T1, DK; LEC: G2, MKOI, KC; LCS: TLAW, LYON, C9; LCP: TSW, CFO, MVK; CBLOL: LOS, FUR | Inven Global |
| Round 1 pots: T1 GEN AL TLAW G2 / T2 LOS TSW HLE BLG / T3 LYON MKOI T1 TES / T4 CFO IG DK PI-winner; T1 v T4, T2 v T3, no same region in R1 | Inven Global; sina guide |
| Swiss: 3 wins advance, 3 losses out; qualify/eliminate matches Bo3, others Bo1; KO all Bo5; Fearless in Bo3/Bo5 | loltheory.gg; Inven |
| QF draw: 3-0 teams vs 3-2 teams; other four random | Inven; IT之家 |
| Play-In: MVK 3-0 FUR; KC beat C9 3-2; KC 3-0 MVK; FUR beat C9; MVK 3-1 FUR → final KC vs MVK (Oct 18 PT) | GosuGamers, egamersworld |
| GPR 2026-10-18: HLE 1540, GEN 1519, BLG 1513, G2 1478, T1 1471, LYON 1424, DK 1409, AL 1409, KC 1396, TSW 1370, TLAW 1369, TES 1364, IG 1348, MKOI 1320, CFO 1316, MVK 1269, LOS 1183 | lolesports.com/en-US/gpr/2026/current |
| GPR is Elo-based (team 80% + league 20%), higher K for international/playoffs | lolesports news "Introducing GPR" |
| MSI 2026 final: HLE 3-2 BLG (comeback) | rft.gg, rdy.gg |
| Worlds 2025: T1 3-2 KT, T1 three-peat | sheepesports, esports.gg |
| LPL last title 2021 (EDG); 2022 DRX, 2023–2025 T1 | to cite from lolesports/news archives before script lock |

## Model (sim.py) — 估算
Elo win prob per game 1/(1+10^(-Δ/400)), per-run rating noise σ=40, KC wins play-in 85%. 100k runs:
LPL ≈ 22% (21.8–22.9% across scale 300–500, noise 0–80); LCK ≈ 55–64%; HLE ≈ 28%, GEN ≈ 21%, BLG ≈ 18%, G2 ≈ 11%, T1 ≈ 9%.
