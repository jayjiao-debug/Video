# ep24 《先别慌》 — owner decisions (2026-10-25)

- Look A (dark desk, torn newsprint, red pen), 4 clippings incl. GosuGamers 「LPL内战见血 TES击败AL」 (10.25).
- Subtitles: S2 paper strip (torn newsprint, dark serif, red keywords). Not the black strip.
- Intro: headlines 0–4.4 s (8 slams, accelerating), big 0–4 slam at 4.4 s → slow motion; title 《先别慌》 on bar 8 (16.58 s).
- Slam SFX: not picked yet → default C_电影重击.
- **Model: keep the ep23 model (ratings 'BL' = GPR + BT blend, sim3.py).** Owner chose this at 21:34 over the
  backtest-tuned 'V2'. Consequences for the script:
  - Callback 「上期10万次：五分之一」 stays.
  - Do NOT claim the model is backtested/validated or "很准". The backtest (backtest_out*.json) showed the ep23
    model is overconfident at the extremes; keep any accuracy wording modest (e.g. this year's 16 Swiss games:
    favourite won 11). Keep the on-screen line 「模型看不到：状态、心态、临场BP」.
  - Cross-checks that may appear: Riot GPR, margin rating, history base rates (hist.py) — they are independent of
    the choice above.
- Fun facts confirmed (gol.gg match lists): Swiss-era champions all came from 1-1 after R2 (T1 2023/24/25);
  2-0 teams 0/12 titles; 0-2 teams 0/12 QF; LPL R1: 2023 4-0, 2024 3-1, 2025 2-1, 2026 0-4 (first in Swiss era).
- 「不是因为种子」 beat: even with AL rated = BLG, BLG holds 65% of LPL's title chance (AL is 0-2).
