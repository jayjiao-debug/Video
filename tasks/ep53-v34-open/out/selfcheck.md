# ep53 v3.4: the new opening (0 → 7.0 s), self-check

**Files changed**
- `episodes/37-qiqing/remotion/src/qq53/open53o4.tsx` (new): the opening's camera, the sword's rigid move, the paper (stack, halves, strips, slit flash, edge glint) and the set.
- `episodes/37-qiqing/remotion/src/qq53/take53.tsx`: `TakeA` and `camAt` before the join. The kitchen and the cleaver are removed.

Nothing outside these two files was changed. No renders are in the repo; everything was rendered under `/tmp/r`.

**Join time J_O = 7.0 s (f210).** From f210 on, `camAt` is today's camera: `camOld`, built from the spherical channels, none of which changed. `TakeA` draws exactly today's picture. I checked this pixel by pixel against an unchanged checkout of HEAD at f210, f211, f240, f282, f285, f300 and f360: the max difference is 0 on every frame.

## How it's built
- **One world** (the case frame, mm), so there is no cut and no dissolve. The sword is always the shared `Sword3D` / `Blade3D` / `Guard3D` / `Hilt3D` at its rest pose `SP`. I move it by drawing it through the world camera re-expressed in the sword's own frame (`camToSword`, exact yaw/pitch/roll), so no sword, lattice or marks are drawn here. Lights are carried into the sword's frame the same way.
- **The rigid move** is M = Rz(psi)·Ry(th)·Rx(phi), plus a slide along the sword's own axis (the draw of the stroke) and a translation T.
  - At the cut the blade is edge-down: phi = 90°.
  - It is tilted th ≈ 1.2° (tip down) so the tapered edge is level over the stack.
  - It is turned psi = 28° (tip away) so the stack's near end, where the cut/uncut notch shows, faces the lens.
  - All of these unwind on the way home. At 6.45 s the move is exactly identity, with zero velocity (T_z, psi, phi, th, slide and T_y all end with slope 0).
- **Camera.** Cartesian keys (position, target, f, cx, cy) up to TS = 2.6 s, then ONE Hermite segment per channel that ends at J_O on today's camera's value and slope (finite differences of `camOld`). The join is therefore C1, and the camera's rotation rate rises smoothly into today's 10.9°/s. f and cy have one or two inner keys, which keep the lifting blade below the subtitles.
- **Paper** (new code; `paper53c` is not imported).
  - 30 sheets of 1.1 mm, 210 × 140 mm, on a dark warm "film set": a lacquer void with a warm pool and a contact shadow.
  - Sheets cut by the edge (decided per sheet from the edge's actual lowest point) are drawn as two halves, one each side of the blade's plane. Uncut sheets are one slab with no seam.
  - Paint order: far halves, blade, near halves, guard, hilt (the camera stays on the hilt side of the guard while the paper is near). Once the set has gone, the shared `Sword3D` order is used.

## Items
1. **Frame 0 says "sword + paper": done.** A close three-quarter view, ≈30° up, with the bright edge-down blade over a neat cream stack in the warm pool. The guard and its blue glass are in frame; the pommel is at the right edge. Frame 0 is already moving: a slow push of 1.7 px/frame (on-screen sword points), plus a 1.2 mm hover breath. No black frame, no fade-in. At 480×270 it reads as a sword over paper (`/tmp/r/fin_thumb.png`).
2. **The cut on f13: done.**
   - The stroke runs f7 → f13, 0.2 s, smoothstep, with a 36 mm draw toward the hilt. Its deepest point is ON f13: the edge is 11 mm above the set's ground at the stack's ends (10.05 mm mid-stack), so sheets 10–29 are cut through and 0–9 stay whole.
   - The halves part in a V (wider at the top), their inner edges lift a little (peak ≈0.35 s) and settle by ≈1.5 s, and the cut halves fan out slightly at their outer faces.
   - Seven strips fly up from the slit and drift down slowly with a flutter, settling flat on the stack or the ground by ≈2–2.5 s (their own clock).
   - A short bright glint runs base → tip along the edge f5 → f11, while the edge is still above the paper. On f13–f15 a thin slit flash fades (1, 0.6, 0.28). No streaks, no blur.
   - The blade enters the slit behind the near halves (checked at f10, f12, f13, f14 at full res).
3. **f47: done.** The sword rises after the cut to 30 mm above the stack, settles by 1.4 s and holds still until 3.25 s. The halves settle; the strips keep drifting.
4. **f81: done.** The land53 `lobe` (soft ellipse, clipped to the pale diamonds, so the dark lattice breaks it) slides along the blade from guard to tip. It comes in over 0.25 s, peaks ON f81 and goes out over 0.8 s. No stripe, no star; pale-cell glints stay off until 6.2 s. I lowered the cut key light and the lift a little so the lobe has headroom (checked at f70, f81, f90).
5. **Transition ≈2.6 → 7.0: done.**
   - The camera starts its move slowly at 2.6 s.
   - From 3.25 the sword lifts, rolls level (edge-down → blue glass up, 3.45–5.95), un-yaws (2.95–6.4) and drifts back to the case axis (3.45–6.25). It settles onto the two rests at 6.45 with zero velocity; nothing goes through a rest or the deck (it is still ≥26 mm up when phi reaches ≈8°).
   - The set sinks away (−260 mm, easing in from 3.3) and fades as a group (3.9–4.9). Around 3.8–4.2 the stack's near end shows the V notch clearly: 20 sheets parted, 10 whole.
   - The case and plinth fade in around the settling sword (4.7–6.3), and the deck's warm pool takes over from the set's.
   - Today's hood (6.6–8.4), hall (7.2–9.2) and title (f285) run unchanged.
6. **World of the cut: done.** The same lacquer ground (`Ground53`) and warm pools as the case: one continuous dark space, and the case comes out of the dark.
7. **Kitchen and cleaver removed: done.** Gone: `KitchenW`, `kit`/`toKitchen`/`kitInv`, the `CleaverD` import, the frame-0 bokeh, glint and dark pools, the focus-pull blurs, and the old glide's Cartesian camera keys and blend. `GuardGlints` (4.6–6.8, drawn at the rest pose) is also removed: it would have floated beside the moving sword. All exports other files import are kept (`TakeA`, `camAt`, `titleQuad`, `SP`, `PF`, `Ground53`, `Museum`, `WPool`, `Glint`, `faceD`, `facePt`, `TITLE_*`, `PANE_Y`).

## Checks
- **Stills** (full res, `/tmp/r/fin/`): 0.0, 0.2, 0.4, 0.443 (f13), 0.6, 1.0, 1.575, 2.0, 2.707, 3.5, 4.5, 5.5, 6.5, 6.967 / 7.000 / 7.033 (f209 / f210 / f211), 8.0, 9.4, 9.5, 10.0. Contact sheet: `/tmp/r/fin_sheet.jpg`. Extra sheets for 0.5–6.2 and close-ups of f7–f14, f70/f81/f90 and 1.575 are also in `/tmp/r`. I looked at all of them. The join frames are normal, continuous frames.
- **Screen speed** (numeric probe: max per-frame displacement of on-screen points along the sword and the stack, falling-set drop included):
  - The camera/transition peaks at 25.7 px/f, at f122, and only on the tip as it crosses the left frame edge. Every other on-screen point stays ≤ 25. The camera alone is ≈20 px/f at peak and its rotation peaks at 14°/s.
  - The falling stack is ≤ 21.8 px/f.
  - The stroke f8–f12 is the planned hit (the guard moves up to ≈46 px/f).
- **Frame differences** (quarter-res video 0–12 s, mean grey abs diff per frame; full list in `/tmp/r/q3_diffs.txt`, with v3.3 measured the same way alongside):

| frames | what | new: max / mean | v3.3: max / mean |
|---|---|---|---|
| f1–6 | hover | 0.61 / 0.53 | 1.66 / 1.48 |
| f7–13 | stroke → f13 | 5.09 / 3.61 | 1.44 / 1.39 |
| f14–46 | halves part, strips | 4.50 / 2.86 | 5.78 / 3.26 |
| f47–77 | hold | 0.91 / 0.66 | 8.51 / 6.77 |
| f78–104 | lobe, camera starts | 3.97 / 2.58 | 10.01 / 9.54 |
| f105–149 | lift, roll, set falls | 9.28 / 7.67 | 9.44 / 7.41 |
| f150–194 | home, settle | 8.69 (f167) / 3.99 | 8.10 / 3.70 |
| f195–209 | into the join | 3.28 / 2.98 | 3.62 / 3.46 |
| f210+ | after the join | identical to v3.3 | |

  - **Single-frame pops** (> 1.6 × both neighbours): only f167 and f285.
    - f167 is the overlay's H1 → H2 subtitle change: in the subtitle zone the diff is 20 vs 7 elsewhere, and v3.3 has the same spike (8.10).
    - f285 is the title slam, unchanged.
  - The join frames f209–f212 diff 3.28, 3.51, 3.42, 3.44 (v3.3: 3.47, 3.56, 3.42, 3.43).
  - **Not met: "≤ 3 per frame".** The stroke frames f8–f12 (3.1–5.1) are the planned cut, which needs several frames of motion. The transition runs 5–9 per frame because the bright high-contrast lattice fills much of the frame and moves up to ~25 px/f. That is the same level as today's v3.3 glide over the same frames (mean 7.4); I did not find a way to get it under 3 without breaking the 25 px/f rule or the join.
- `tsc --noEmit`: no errors in the touched files. The only errors are the two existing file-name casing errors in qq45/qq46.

## Outside my files (for the producer)
- `take53d3.tsx` (TakeD3) renders `<TakeA t={0} />` under the end card and uses `camAt(0)` as its "home" camera. Both now give the paper-test frame and its camera, not the kitchen. The brief says another engineer is replacing this; until then the end card's background and home move are different.
- `COVER53`, `COVERPIC53`, `kfH53`, `EP53` and `demo53k` also call `TakeA` / `camAt`. Any of them sampled at t < 7 now shows the new opening.
- `end53d.tsx` still exports `CleaverD`; nothing in TakeA uses it now.
