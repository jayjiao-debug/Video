# Overnight report — 2026-10-26 (ep24 《先别慌》)

Scheduled run fired 00:30 UTC (02:30 SAST). Reading taken: the owner's approved intro, look A, S2 subtitles and the
ep23 model ('BL') as decided at 21:34; slam SFX = C (owner had not picked).

## Done
- **Tonight's results** (Swiss R3, day 1). Checked against two sources: GosuGamers article 79416 and the gol.gg match list.
  - IG 1-0 HLE (upset; the model gave IG 25%).
  - TES 1-0 G2.
  - DK 2-0 MKOI. DK is 3-0 and qualified.
  - GEN 2-1 LYON. GEN is 3-0 and qualified.
  - TES and IG are now both 2-1.
- **Model re-run** (`analysis/sim4.py`, 200k runs, ep23 ratings 'BL', every game so far re-weighted) → `sim4_out.json`.
  - LPL title chance: **20.0%**, back to one in five. Locking in the results without the rating update gives 21.1%.
  - Chain for the film: 21.1% before the event → 14.8% after R1 → 16.5% after R2 → 20.0% now.
  - BLG: QF 77.4%, title 16.8%. BLG holds **84%** of LPL's title chance.
  - BLG vs KC (Bo1, BLG 69%):
    - BLG win → LPL 22.9%.
    - BLG loss → LPL 13.7%.
  - AL vs TL (Bo3, AL 57%): barely matters (20.4% vs 19.4%).
  - Best case for tomorrow: BLG, AL and CFO (over T1, 16%) all win → **27.6%**, higher than before the event.
  - Worst case: BLG and AL both lose → **13%**.
  - If BLG beats KC, its R4 opponent splits about evenly between TES, IG, LYON and T1. About half the time that is an LPL team.
  - The demo's "revenge vs MKOI" path was impossible: BLG already played MKOI, and Swiss has no rematches. It is not in the draft.
- **"First time" fact-check.** LPL's Round 1 record in the Swiss era (gol.gg match lists) was 4-0 in 2023, 3-1 in 2024, 2-1 in 2025 and 0-4 in 2026. Confirmed.
- **Film updated and rendered.** `film/film.html`, 29 lines in `lines.json`:
  - The R2 scene now includes the early hours of the 26th: IG beats HLE, TES beats G2.
  - The correction sheet is now a hand-drawn chart of the four numbers.
  - The drop shows 8 of 10 chips as BLG (84%).
  - Best and worst cases are tomorrow's real ones.
  - Close: 赢 22.9% / 输 13.7%.
  - The 示意 tag is removed.
- **QA.**
  - 3,899 frames, 129.97 s.
  - Largest brightness jump is 17.9 per frame, at the two large sheets sliding in. No white flashes.
  - No banned words (赔率, 押注, 竞猜). Reading pace is within budget.
  - Loudness −9.9 LUFS integrated, the same as the ep23 delivery. True peak is +1.8 dBFS after AAC encoding, because the series track is mastered hot (ep23 was +2.6). I can give the whole mix 2 dB of headroom if wanted.
- **Commit.** Code committed and pushed to `claude/ep23-overnight` (episodes/24-worlds-lpl-followup). No videos or WAVs.

## Files for the owner
- Send version: `先别慌_初稿.mp4` (27 MB).
- HD draft: `先别慌_初稿_高清.mp4` (41 MB). Not yet on a download branch; say if wanted.
- Frame overview: `先别慌_画面总览.jpg`.

## Needs the owner
1. Watch the draft. BLG vs KC is **Monday 20:00 SAST** (Beijing 10.27 02:00), so publish before then.
2. Slam sound: C is in. Say A or B to switch.
3. The 「26日凌晨」 wording assumes the video goes out on the 26th (Beijing time).
4. The Douyin package (title, description, covers, 合集) is ready to make once the cut is confirmed final.

## UNVERIFIED / not done
- Hotspawn's day-3 page refused the fetch. It was replaced by gol.gg as the second source.
