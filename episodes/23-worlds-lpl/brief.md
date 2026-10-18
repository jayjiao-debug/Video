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

## In-depth data pass (2026-10-18 evening) — analysis/ folder
Sources: gol.gg (team pages, match logs, tournament match lists and champion lists; pulled via asset-farm lol-worlds26-02/03/04), Leaguepedia MatchSchedule 2017–Oct 2024 (its game tables were rate-limited, UNVERIFIED there), Riot GPR. Dashboard: claude.ai/artifact/K7cUsiPAtdHtw8BVXsYjpZ.

- **Play-in final: KC 3-0 MVK** → pot 4 = CFO, IG, DK, KC. Round 1 draw still pending.
- **Model, 4 ratings × 100k runs (KC fixed):** LPL 17.9–22.5% (Riot GPR 22.3, results-fit 17.9 raw / 22.5 squeezed, blend 21.0). LCK 60–79%. BLG ≈15–18% of it; AL ≈2%, TES/IG <1% each. Headline 《五分之一》 holds.
- **T1 vs LPL at Worlds Bo5: 10-0** (2017 RNG, 2022 RNG/JDG, 2023 LNG/JDG/WBG, 2024 TES/BLG, 2025 AL/TES). Strongest single fact for the script.
- **LPL vs LCK Bo5 at internationals:** 2025 **0-7**; 2026 **3-2** (BLG beat T1 3-2 and HLE 3-1 at MSI, lost the MSI final 2-3 to HLE; JDG 0-3 GEN at First Stand). Worlds Bo5 since 2017: LPL 6-13.
- **2026 internationals:** BLG won First Stand (3-1 G2), runner-up at MSI; HLE won MSI; DK won EWC. LPL as a region 14-8 in series in 2026 (vs 17-15 in 2025); LCK 22-9.
- **Domestic:** AL won LPL Grand Finals 3-1 over BLG (BLG had swept AL 3-0 a week earlier). GEN won LCK playoffs 3-1 over HLE. G2 won LEC, TL won LCS, LOS won CBLOL.
- **BLG:** 125-52 (70.6%) in 2026, best record and best gold lead at 15 (+1023) of any Worlds team, Baron rate 72.8%. Knight on Ryze 19-3 (86%), Viper on Ashe 17-1 (94%), ON on Seraphine 18-1 (95%).
- **Meta on 26.16–26.20:** Cassiopeia (89% presence, 84% banned) and Nocturne (83%) are the bans; Vi, Olaf, J4, Orianna, Ezreal, Lee Sin next. Play-in on 26.20: Nocturne banned in 18 of 19 games; Seraphine, Olaf, Vi and Cassiopeia unbeaten when picked; K'Sante 0-5 after its nerf. LPL playoffs ban Vi far more than LCK (78% vs 51%); LCK bans Bard and Camille more (T1's Keria: Bard banned against T1 in 64% of games).
- Caveats: gol.gg notes its per-game detail stats may be incomplete after an April Riot match-history bug; Swiss Bo1 coin-flips, draft and Fearless are not modelled.
