# Overnight report — 2026-10-27 (ep25 《0-4之后》)

Scheduled run fired 00:31 UTC (02:31 SAST). Reading taken: the stored prompt said "look A / ep25/film" (3D), but the
owner switched to the **Manim look** at 17:00 (newspaper intro kept) — DECISIONS.md wins, so the film is `manim/` + `intro/`.

## Done
- **Round 3 day 2** (GosuGamers 79422 + gol.gg match list, both agree): T1 1-0 CFO · BLG 1-0 KC · LOS 2-0 TSW ·
  TL 2-0 AL (AL eliminated). After R3: 3-0 DK, GEN · 2-1 BLG, TES, IG, T1, MKOI, LYON · 1-2 HLE, G2, KC, TL, CFO, LOS ·
  out AL, TSW.
- **Game data**: 29 Swiss games parsed (gol.gg). Vi banned 22/29 (97% presence); LPL on Nocturne 6 games, 4 wins;
  team ahead at 15 min won 16/29; blue side 16/29. LPL R1: dragons 4:13, barons 0:6; LPL's 6 wins since: dragons 19:9,
  barons 6:1.
- **Model** (sim5.py, ep23 ratings, all R3 games locked, 200k runs): **LPL 21.8%** — above the pre-tournament 21.1%.
  Chain 21.1 → 14.8 → 16.5 → 20.0 → 21.8. BLG QF 90.4%, title 19.5% (89% of LPL's chance); TES 1.2%, IG 1.1%.
  LPL civil war in R4: 66.8%. BLG's QF opponent most likely T1 (20%). Best R4 for LPL (all three win) 27.6%, worst 13.7%.
- **AI poll** (Modal, same 6 open models, current standings embedded): 5 of 6 put BLG in their top 3; none picks an LPL
  team first; DK is the most common first pick (20 of 32 valid answers).
- **Film**: newspaper intro (title 《0-4之后》, darker, fades to black) + Manim main film, 26 lines, 129.97 s.
  QA: max luma jump 7.1/frame (no flashes), −9.9 LUFS (same as ep23/ep24), reading pace OK, no banned words.
  Send file `0-4之后_初稿.mp4` 17 MB (CRF 16; the 1500k two-pass version was bigger and worse on these black frames).
- Code committed to `claude/ep23-overnight` (episodes/25-worlds-lpl-r3). No video, no icons.

## UNVERIFIED / not done
- **Round 4 pairings**: not published on any page I could open (sheepesports body empty, egamersworld/Leaguepedia
  refused). The model uses the Swiss draw rules instead, so "who BLG meets" is ~25% each of T1/IG/TES/LYON. Re-run with
  the real draw once it's out (put it in ep23/an/r3b.json "r4" and run sim5 + mkdata + assemble, ~10 min).
- Title 《0-4之后》 is my pick (alternatives: 《比开赛前还高》, 《先别慌》 from the unpublished ep24).

## Needs the owner
1. Watch `0-4之后_初稿.mp4`; Round 4 starts **Wed 10.28 22:00 SAST** (Beijing 10.29 04:00), so publish today.
2. OK the title, then I'll make the Douyin package.
