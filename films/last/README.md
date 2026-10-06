# 《最后一面》 — "Last meeting theory", in maths and statistics

BGM-only data film (~97 s, 1920×1080). Subtitles are NOT burned in; `node scripts/srt.mjs out/最后一面.srt` writes
the .srt from `SUBS` in `src/lib.ts` for post-production. Keep y > 880 free of key content (subtitle band).

Camera: `src/camera.tsx` — whip, tilt, zoom-through (push), roll and a shake cut, with 8-sample motion blur during
transitions (`src/Film.tsx`). Stages drift by translation only between moves (no slow scaling of type).

Music: owner's track from beat 16 (`out/bgm_cut.wav`, 3.2 s fade), first drop on the title (8.14 s).
Facts: `research/facts.md`. "5 次" and "≈58 %" are model results under the stated assumption (chance falls 20 %/yr).
