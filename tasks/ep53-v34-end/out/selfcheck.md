# ep53 v3.4: B1 edge close-up + museum ending. Self-check
Started 2026-10-30 19:55 UTC, finished 20:10 UTC. All renders are under /tmp only. Nothing is committed by me.
For the numbers I compared against a baseline. I rendered HEAD (aebf01c) in a temporary worktree, for the same ranges and with the same script (quarter-res, CRF 20, mean grey |Δ| per frame).

## Files
- `paper53c.tsx`: changed (the `Paper53` body only). `camAt`, `BladeEnd53`, `P0`/`P1`/`T_*` and the camera constants are unchanged; cam53g and macro53c import them.
- `take53d3.tsx`: changed (P1 camera, the ending, the kitchen removed). `TakeD3`, `camD3`, `v2Of` and `T3` are still exported.
- `end53d3.tsx`: header comment only ("held kitchen" → "held museum picture"). The card's texts, layout and timing are untouched.
- new `edge53e4.tsx`: `EdgeGlint53`, the edge glint/sheen through any blade map. The glint is one gradient per path, so there is no stack of faint layers (8-bit safe).
- new `museum53e4.tsx`: `MuseumA53` (TakeA's picture at T_TITLE = 10.4 for any case-frame camera), `EndAir53` (the dim and the last glint), `T_TITLE`.
- `world53d.tsx`, `scene53d.tsx`, `hall53d.tsx`: no change needed.

## Item 1: B1 92.709–97.804, the edge and no paper. DONE
- Removed: the paper stack (and its table plane and shadow), the cut halves, the cut flash, the clapper 「古剑 1977」, the 「划破20多张 / 共30多张」 tags and brackets, and the film light (switch, wash, beam).
- Kept: the blade (BladeFlat + MarkSet), today's camera (`camAt` untouched), the lacquer, the warm pool, the top dim, the vignette.
- The old fast 3 cm drop of the blade "into the stack" (v2 59.15–59.45) is now a calm 2.2 s ease (v2 57.0–59.2). Without paper the drop would have been a jolt, and the blade is at rest when the glint comes.
- Glint: it first appears exactly on the hit frame, f2866 (DA(42) 95.540). The check is frame-based (`frameOf(t) − frameOf(T_CUT)`), so f2865 has no glint. It runs along the lower cutting edge (edge down), guard → tip, in 0.5 s, then fades over 0.12 s.
- Resting sheen: there before and after the glint (fades in v3 93.4–94.6). It fades out 96.78–97.53 as the camera rises, so the M1 hand-off frame is unchanged.
- Stills checked: 92.6, 92.709, 93.3, 94.4, 95.4, 95.540, 95.633, 95.733, 95.8, 96.2, 97.0, 97.8, with full-res crops of the glint frames.
- Hand-off frames f2780–2783 and f2933–2936: the picture is continuous. The Δ 6.14 at f2782 and 6.17 at f2935 come from the overlay's subtitle and stamp switch. The baseline has the same values (6.19 / 6.17).
- Video 92–99 s (f2760–2969):
  - Max Δ is 19.67 at f2924. The baseline has 19.90 there: it is today's camera rise to leg 12, with the textured blade crossing the frame.
  - The values over 3 at f2761–2850 come from today's swing from face-on to the 3/4 view. They are unchanged camera moves.
  - **No frame is busier than the baseline by more than 0.3.** Removing the paper lowered Δ through 93.1–94.4 (e.g. 10.1 → 7.6).
  - f2866 (the hit): Δ 0.38 at quarter res (planned).
- Not done / for the producer:
  - The over-3 frame differences in B1 come from the camera kept as the brief asked (swing and rise). I did not retime them.
  - B1's stamp 「1977 科教片《古剑》/ 30多张纸划破20多张」 is the overlay's (lines53v3), and I left it as is.

## Item 2: the ending 134.031–145.333, staying in the museum. DONE
- Kitchen removed from `TakeD3`: `KitchenW`, `kit`/`toKitchen`, the `CleaverK` import and draw, the masked `refl` layer and its `d3km` mask, the `d3swB` streak, the kitchen pools `d3k1`/`d3k2`, the far blur `d3far`, frame 0's tip glint, and the `<TakeA t={0} />` hold.
  - grep: there is no kitchen, cleaver, refl or streak left in my files.
  - The deck pool still goes only through `CaseHall … pool={caseL}` (DisplayBack group opacity). It is now held at 1 because the pull-back moves away from the deck.
- P1 camera: the same look-at Hermite channels as before.
  - It eases to rest on the R2 close view (the knot `m`) at TURN = 134.381, then pulls straight back and up out of the hood.
  - It settles with zero slope on `camAt(10.4)` (converted to world metres) at HOME = 138.7. From TURN, every channel is one monotone Hermite segment: no swing.
  - At 140 the camera equals TakeA's camera to float precision: case mm (−69.15, −1318.63, 1797.26) for both.
- Speed (my probe projects sword and deck points per frame, on-screen points only):
  - P1 peaks at 6.6 px/frame.
  - Overall max is 23.4 px/frame at f4004 (R2's tail). The old cut had 23.3 at f3997.
  - My first try stopped exactly on 134.031 and gave 26.2 px/frame, so I moved the turn 0.35 s into P1.
- Look: `MuseumA53` (TakeA's own hall, case, light, sword lighting, hood + title glass, scrim and vignette at T_TITLE, drawn with the same camera) crossfades in over 134.6–137.4. Then `<TakeA t={10.4} />` dissolves in over 138.7–139.2 with the camera at rest.
  - **The hand-off is invisible:** f4161 (MuseumA53 only) vs 139.2 (TakeA only), full res, mean |Δ| = 0.002.
  - Video Δ is 0.08 / 0.04 / 0.01 at f4161–4163 and 0.00 at f4175–4177.
- Air 139.692–140.824 (`EndAir53` over the held TakeA):
  - A radial darkening (62 % at the edges) that leaves the case centre, the sword and its spot clear. It ramps in over 1.0 s and stays under the card.
  - One glint along the near edge, guard → tip, from 139.95 to 140.65, peaking on 140.3 (full-res crops at 140.1, 140.3 and 140.5 checked).
- Card 140.824–145.333: `EndCard3` unchanged over the held museum picture. J on f4225, fade to black as before.
- Stills checked: 133.9, 134.031, 135, 136, 137, 138, 138.667/138.7/138.733 (f4160–4162), 139.0, 139.692, 140.3, 140.824, 142, 145.0.
- Video 130–145.333 (f3900–4359):
  - The values over 3 are f3903–3927 (R2's rise, identical to the baseline), f4021 = 7.89 and f4191 = 4.93.
  - f4021 is the overlay's R2 → P1 subtitle switch while the camera turns. The baseline has 6.98 there.
  - f4191 is the P1 subtitle leaving. The baseline has 5.01.
  - In P1 every other frame is ≤ 2.8. The air is ≤ 0.6 per frame. The J seal f4225 is 1.40 at quarter res, the only planned spike.
- Notes for the producer:
  - R2's last segment (131.9–134.381) changed shape. The old move carried on past the close view toward the kitchen, and all its slopes at 134.031 point away from the title camera, so the camera must ease to rest before pulling back.
    - Effect: R2's tail reaches the close view a little later. The camera enters the hood around 134.0 and P1 brings it back out through the glass by about 135; the thin hood edges sweep the frame borders twice.
  - `MuseumA53` copies TakeA's light parameters at 10.4 from take53 (TakeA's look formulas evaluated at T_TITLE). If the engineer rebuilding the opening changes TakeA's light, case or light timing around 10.4, re-check f4161 vs 139.2.
    - The camera and the final picture come straight from `camAt` and `TakeA`, so they always match. Only the 134.6–138.7 look could drift, and the 0.5 s dissolve hides small differences.
  - MUSIC_NOTES_v3 rows 29 and "air" still describe the kitchen hold. They should read "the title shot (TakeA 10.4) holds from 138.7; the hall dims, last glint ≈140.3".
