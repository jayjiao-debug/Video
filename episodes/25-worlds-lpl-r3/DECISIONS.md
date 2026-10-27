# ep25 — Worlds 2026 LPL, after Swiss Round 3 (owner decisions, 2026-10-26)

- ep24 《先别慌》 is NOT published (too late for the news cycle). This new episode uses the full Round 3 results
  (10.26/27 games: CFO–T1, BLG–KC, LOS–TSW, TL–AL) and aims to go out Tuesday 10.27 daytime, before Round 4
  (Wed 10.28, 22:00 SAST).
- Analyses chosen: (1) where LPL lost, game by game; (2) BP and champion pools; (3) Round 4/5 paths + QF draw;
  (4) ask the AI models again.
- Main visual: 3D Galton/pinball "Swiss machine" (balls = simulated runs, red LPL, blue LCK). Look **A 黑金决赛场**
  (`looks/machine.html?look=A`). The intro may reuse ep24's newspaper-clipping open.
- Assets: the owner said "use everything" (team logos, champion icons, broadcast stills). What is done:
  - Champion icons from Riot Data Dragon 16.20.1 (Riot fan-content policy), with the end-card notice
    "Riot Games does not endorse or sponsor this project." Official minimap (map11.png) allowed the same way.
  - **Not used:** team logos (club trademarks, no licence), broadcast screenshots/footage (rights-holder content;
    Riot's policy excludes reposting matches), player photos. Teams = abbreviation + team colour plates
    (not imitating logos). Key moments are rebuilt from real per-game data (gold curve, objectives).
- Model: the ep23 model (ratings 'BL') as before; no claims that it is validated. Keep 「模型看不到：状态、心态、临场BP」.
- No 赔率 / 押注 / 竞猜.

## Update 2026-10-26 17:00 — look changed to Manim style
- Owner: the 3D gold version was too bright in places; wants the Manim (3Blue1Brown) feel. **Main film = 2D Manim
  look** (`m2/film.html`): pure black, thin strokes, Create/Write animations, CMU Serif (OFL) + Noto Serif SC,
  Manim palette (LPL red #FC6255, LCK blue #58C4DD, yellow #F7D96F, green #83C167), no glow, no camera travel.
- **Intro keeps the newspaper clippings** (`intro/intro.html`), a little darker, fading to black at bar 10.
- The 3D version (`film/`) is shelved.

## Update 2026-10-27 07:40 — back to the ep24 newspaper design, model only
- Owner: go back to the original design (ep24 newspaper desk, look A, S2 paper-strip subtitles) and drop champ select,
  dragons, economy etc. Content = simulation data + model + a review of what happened. Build: `news/film.html`.
- Dropped: BP/champion icons, gold curves, objectives, the AI poll (not simulation/model; can come back).
- New review scene: the model's report card on LPL's 10 games against other regions (pre-match odds from 'BL'
  ratings before the event): single-game calls 5/10, expected wins 5.0 vs actual 5 (R1 1.9→0, R2 1.3→2, R3 1.9→3).
- R4 opponents are not published; R4 numbers use simulated Swiss pairings (UNVERIFIED pairings).

## Update 2026-10-27 09:10 — full original song
- Owner sent the full song (164.5 s). s130f is its first 130 s with a fade, so the grid is unchanged
  (bar n = 0.383 + 2.0248 n). The film now runs to the end of the song: end card at bar 78 (158.3 s).
- Used the extra 16 bars to restore the best/worst-path lines, give the 12-draw scene 4 lines, and add
  "who each LPL team wants in Round 4" (QF % by opponent, averaged over the draws in draw25_out.json).
- Music file is not committed (copyright); it lives in the session scratchpad as ep25/full/full.wav.
