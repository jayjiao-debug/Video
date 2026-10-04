# 《第一位数字》 · video engine V1

Remotion 4 + three r169 project built from `.claude/skills/video-engine-v1/templates` (default branch).
Every frame is a pure function of the global time T; timing is written as `b(i)` on the beat grid of the owner's
track (`public/bgm.mp3`, not in git; grid in `src/music.json`, 118 bpm, 323 beats).

- `src/countries.json`: 215 countries and territories, World Bank 2025 population (github.com/datasets/population)
  joined with coordinates (github.com/mledoze/countries). First digits: 65 × 1 … 9 × 9.
- `public/models/*.glb`: Sketchfab CC-BY models fetched by the asset farm (`benford-models-01`), not in git;
  credits in `public/models/credits.json`.
- Stills: `COMP=Benford SCALE=0.5 node scripts/stills.mjs <dir> <t…>` then `python3 scripts/sheet.py <dir> <png>`.
