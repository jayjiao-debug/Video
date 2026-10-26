# ep24 《先别慌》 — Worlds 2026 LPL follow-up (after Swiss Round 3, day 1)

Look A (dark desk, torn newsprint, red pen), S2 paper-strip subtitles, series track s130f (118.5 bpm, untouched),
slam SFX variant C. Owner decisions: `analysis/DECISIONS.md`.

- `film/film.html` — the whole film; `renderAt(t)` is pure in t. Numbers live in `D` at the top, lines in `LINES`.
  `node rec.mjs [from] [to]` writes frames to `fr/` and `events.json`; `python3 sfx24.py` builds `mix24.wav`
  (needs `../../ep23/film/s130f.wav`, not committed). Font: copy `InterDisplay-Black.otf` next to the page.
- `analysis/sim4.py` — the ep23 model (ratings `BL`) conditioned on all games through R3 day 1 → `sim4_out.json`.
  `sim3.py` is the after-Round-2 version. `margin.py` = in-game gold-margin rating (cross-check).
- `analysis/backtest.py` (+ `tune.py`, `live2026.py`, `chain.py`) — 2023–2025 backtest; owner chose to keep the ep23
  model for the film, so the backtest is reference only. `hist.py` — Swiss-era base rates (gol.gg match lists).
- Videos, WAVs and frames are not committed.
