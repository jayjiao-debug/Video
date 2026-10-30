# ep53 fix4 · TakeG (勾践 thread) self-check

Started 09:46 UTC, finished 10:04 UTC, 2026-10-30. Files changed: `cam53g.ts`, `shadow53g.tsx`, `take53g.tsx` (all mine). No new files were needed and no exports were renamed or removed. `EP53V3.tsx` is the only other importer and is untouched. `tsc --noEmit` shows no errors in these files; the 2 errors it does report are old casing errors in qq45/qq46. Renders were made only under /tmp.

## #6 MAJOR: the story only reads through the subtitles: **done**
- **Lattice over the reflection.** Each vignette's glow is now an ellipse over the lower half of the blade, from the ground to just above the ridge. Inside the glow the bronze is backed off (radial backing at 0.97 → 0), and the spec lattice (`latCells`/`cellQuad`, LAT colours) is redrawn at o = 0.24, masked by the same glow. That gives ink strokes at about 20 % and cores at about 17 % inside the glow. Outside the glow the blade's own `BladeFlat` lattice stays at full strength. The old full-window backing at 0.72 is gone. Checked on stills at 59.5, 69.5, 75.2 and 85.
- **Figure size.** The glide runs 15 % lower (d 19 → 16.2 cm), as the review allowed, and looks a little lower (w −0.15 → −0.42). Each scene now stands on the blade's lower inner edge (`fitG`: ground = inner half-width − 0.1 cm) and is scaled as large as its head limit and its window allow. Measured on full-res stills: 勾践 in G4 ≈ 280 px (was ≈ 185), the seated 勾践 in G5 ≈ 270 px, G2's envoy and 夫差 ≈ 200–230 px, G7's soldiers ≈ 215 px to the head, and G1's climbers ≈ 150 px (G1 is the wide siege shot).
- **Heads below the ridge.** Each scene's tallest head is kept at least 0.17 cm below the ridge (`HEAD` per scene). Checked at 59.5, 64.5, 69.5, 75.2 (the reviewer's frame: the ridge now passes above his cap) and 79. Some tall props still cross the ridge: 会稽山's peak, the palace roof, the chariot canopy and the 戈 tips. To make this fit, G3's 伍子胥 went from 1.2 to 1.0 in scene units, G4's chariot from 0.95 to 0.8, G2's screen was shortened, and in G1 the mountain is now mid-tone so the dark figures read in front of it.
- **No double exposure.**
  - G4: the half-opacity second horse is gone.
  - G7: one solid rank of 3 with a second row of 3 behind it, all full ink (no 0.6-opacity rank). The leftmost column was dropped because it sat in the window's edge fade and looked ghosted.
  - Scene changes: the scenes now sit closer together along the blade, so `vigK` was made sequential. The old scene fades out over the last 0.45 s of its line, then the new one fades in from 0.05 s after the line starts. Checked at 57.0, 57.3, 61.6, 62.0, 81.3 and 81.6: never two scenes on screen together.
- **G7 steps on the beat.** The ranks advance one pace per beat on the P3 grid (0.4432 + 0.56605·n, n = 144…151). Each pace moves over the 3 frames before the beat frame and lands on it, then holds; the legs alternate per pace. Checked on frames 2522–2528 around the beat at 84.218 (frame 2527): crop differences are 5.7 on held frames and 11–12.5 on frames 2524–2527.
- **Cap and sword.**
  - The cap is now `MianG`, a 冕 tipped over: a crown, a flat board across its top, and three-bead strings (旒) hanging from both ends of the board.
  - The sword is now `SwordDown`: a pointed blade, a guard bar, a grip and a round pommel. It lies tilted 8°, so it reads against the light and not against the ground bar.
  - Both sit on a lit patch (a radial ellipse, #FFE2A6 → 0).
  - Sizes at 85.0 full-res: board ≈ 140 px wide, sword ≈ 180 px long (both ≥ 60 px).
  - Fact-check fixes kept: no rope and no blade at a throat; the envoy kneels alone; 勾践 walks ahead of the horse; the gall sits on its stand.

## #10 MINOR: G8 「还亮着」: **done**
- **Blade height.** The camera stays closer through G8: d 16.2 → 23.5 by 87.6 → 25 by 89.6 → 27 by 91.4, then the hand-off d = 30.26. f 2900 → 2600 → 2520 → 2300. Probe values (blade height / frame height at the centre column): 87.5: 50 %, 88.5: 48 %, 89.8: 46 %, 91.0: 42 %, 91.5: 40 %, 92.5: 35 % (the hand-off view). Before this fix: 34 % across 88–92, with the review reading about 13 %.
- **Lobe.** `LobeG` in `shadow53g`: a broad screen-blended lobe that rides with the camera, plus the pale (tin) diamonds lit inside it. The dark lattice still breaks it, as in KFK_H1. It rises from 89.1 and peaks ON 89.8 (frame 2694), then fades out over 91.5–92.55, so the hand-off frame stays pure. The sweeping glint band it replaces is gone. Checked on the full-res still at 89.8.
- **Rise into the hand-off view.** w goes 0.12 (89.6) → 0.6 (91.4) → 1.3 (hand-off), and the tilt returns to 0.
- To keep the slide back to a = 21.1 from getting jumpy while the camera is close, the glide drifts more slowly (base speed 0.48 → 0.34 cm/s; the start still carries on the inscription glide's 0.83 cm/s) and the return starts at 85.4 (was 86.2). The return slide is now 10.5 cm (was 14.3).

## Hand-offs and motion (0.25-scale videos, mean grey difference per frame, new vs the pre-fix baseline from git HEAD)
- **51.954:** frame 1559 is still `TakeC(56.482)` (unchanged code path). Difference at 51.967: 6.76 new vs 6.80 baseline.
- **92.709:** frame 2781 is still `TakeC(56.482)`. Difference at 92.733: 6.27 new vs 6.15 baseline. 92.5–92.7: ≤ 3.7.
- **Mean per second vs baseline:**
  - Most seconds are within ±0.5.
  - The descent at 53.5–55: 5.5–6.3 vs 4.3–4.9 (the drop is lower now).
  - G7's end and the start of G8 at 85–89: 4.3–5.8 vs 2.8–5.1 (the camera pulls back and slides while closer).
  - No new spikes. The only spikes above 7 are the subtitle line changes, which the baseline has too: 57.067, 61.6, 67.267, 71.767, 77.433, 81.4, 87.067.
  - The baseline's 14.7 spike at 59.57 is gone.
- **Not met:** the brief's "≤ 3 per frame" is not met in the moving stretches, by this version or by the baseline (baseline medians 3.7–5 in 81–90).

## Outside my files
Nothing needed. The tags, stamp and subtitles belong to the overlay engineer; I draw no tags.
