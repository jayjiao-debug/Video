# ep53 polish A (legs 1–7, 0 → 31 s): self-check

Files edited: `episodes/37-qiqing/remotion/src/qq53/take53.tsx`, `tomb53.tsx` only. No images or video are in the repo (renders are under `/tmp/r53/`). Start 20:45, finished well inside the 90 minutes.

## What changed, per weak spot

**1. S1 museum hall (≈ 10.5–17 s) — `take53.tsx`**
- Camera, keys after 10.4 s only (the 9.5 s title frame is pixel-identical to before):
  - Pull-back peak cut from 3150 mm to 2450 mm (peak at 15.4 s).
  - Orbit round to the pommel end slowed (az 89° → 78° → 64° → 50° at 16.3 s instead of 50° at 14.2 s), so the sword is seen more side-on.
  - Elevation lower (21° → 18°), target raised, lens a little tighter, so the hall shows above the case.
  - Slopes at 18.6 s are pinned to their old values, so 19 → 20.8 s and the dive match are unchanged (20.8 s still is pixel-identical; 19.0 s and 19.8 s differ by ≤ 32 levels in about 1100 px).
- Measured at the widest moment (15.4 s):

  | | before | after |
  |---|---|---|
  | sword length on screen | 240 px | 349 px (+45 %) |
  | case top width | 78 % of frame | 88 % of frame (it is ≥ 35 % at every moment of the leg) |

- Light, driven by `lite` (0 at 9.9 s, full by 11.3 s, back to 0 over 17.0–18.8 s, so the title frame and the dive are untouched):
  - Floor, walls, case top and case sides lifted.
  - Wider and brighter pool on the case top, a second large pool on the floor, and a stronger wall-washer light.
  - Sword lit up a little (`lift`) so it stays the brightest object; the case-top pool was kept moderate so the gold keeps its contrast.
- Visitors: one lighter tone (about 20 % lighter than the hall), faceless, with the gold rim copy halved. They are still adults at real scale (1.12–1.78 m) at 4.5–5.2 m from the case.
- Gallery detail (`HallDetail`) so the hall reads as a museum: floor tile joints, skirting with a light strip, lit label panels with text rows on every wall, and a lit wall vitrine on the two far walls. The rope and posts are kept.
- A soft dark scrim behind the top-left subtitle area, fading with `lite`.

**2. KF02 moment (rise over the guard, ≈ 4.7–8.5 s) — `take53.tsx`**
- Lens zoom from 3.6 s (f 820 → 1260 at 5.5 s, 1420 at 6–6.6 s). The guard, blade and blue glass now fill the lower two thirds of the frame.
  - Guard width on screen: about 310 px at 5.6 s before; about 600 px now.
- The rise is a continuous arc: a sideways drift with a yaw, and the pitch rising to 56°. The sword turns into the diagonal by 7 s and the earlier orbit keys (6.6 → 9.5 s) are kept.
- Principal point shifted right (cx 960 → 1150 at 5.5 s, back to 960 by 7.4 s) so the hilt and pommel pass to the right of the subtitle. At 5.2 s the pommel disc's edge just touches the full stop of line 2 (at its right end) but does not cross any glyph.
- Added `GuardGlints`:
  - A soft view-driven specular band slides over each blue glass pane from 4.7 to 6.3 s (continuous, never on a beat).
  - One four-point star glint lands on beat 10 (5.6605 s) and decays over 0.2 s.
- Keys at 9.0 s are pinned to the old slopes, so 9.0 → 9.5 s and the title frame are unchanged.

**3. 5.3–5.6 s near-stop — `take53.tsx`**
- Cause: the camera's own speed was constant, but it was aimed at the guard, and the sideways orbit and lens change only started at about 5.8 s. The picture flow therefore fell to 1.6–3 px/frame at 5.2–5.8 s.
- Fix: the sideways drift, yaw, pitch and zoom now run through 4.2 → 6.6 s. The camera is still a pure function of time, with the old A→B blend kept (5.538 → 6.238).
- Median speed of the sword's on-screen points:

  | | before | after |
  |---|---|---|
  | lowest, 4.8–7.0 s | 1.6 px/frame at 5.33 s | 5.4 px/frame (at 6.4 s) |
  | highest | — | 17 px/frame |

- Peak p90 speed in the central 60 % of the frame, 3–20.8 s: 26 px/frame now (at 5.2 s), 24.7 before (at 4 s).
- Whole leg 3 → 20.8 s: median never above 18 px/frame.
- Outlier points of the blade very near the lens exceed 25 px/frame in the old camera too (for example at 3–4.6 s); I did not treat those as the camera's speed.

**4. Leg 7, soil stripes (≈ 22.8 → 31 s) — `tomb53.tsx`**
- New `calm` factor, 0 → 1 over 22.8–24.0 s and back to exactly 0 by 31.0 s.
- Terraces of the mouth (`Terraces3D`): treads and risers pulled 55 % toward one mid-tone and the side lighting halved. This removes the high-contrast concentric bands from above.
- Shaft wall:
  - The 26 course lines: every second one fades out and the rest drop to 55 % opacity.
  - Mottle blobs: two thirds fade out and the rest drop to 50 %.
  - The blue-grey and white-clay bands are pulled toward the soil colour.
- Depth marks, pole, labels, depth tag, diggers and snow are untouched. Depth-mark logic is unchanged.

## Checks

- `npx tsc --noEmit` has no errors in `qq53/`.
- Sweep of stills every second from 0.5 to 32.5 s: no render errors. Contact sheets checked by eye.
- Before / after pairs for all requested times (1, 3, 5.3, 5.6, 7, 9.5, 11, 12.5, 14, 15.5, 17, 19, 24, 26, 28, 30, 31, 32, 33.2): looked at; the weak spots are fixed.
- **Identity at and after 31 s** (PIL, all 1920×1080 RGB):
  - 33.2 s: identical (0 differing pixels) in every comparison.
  - 32.0 s: identical to the original baseline (0 px).
  - 31.0 s: identical to the original baseline (0 px) in the final run.
  - 9.5 s title frame: identical. 3.0 s: identical.
- Caveat on 31.0 s and 32.0 s:
  - The Chromium blur raster used here is session-dependent. The original code itself renders two states at 31 s and at 32 s (differing in ≤ 6 levels on about 1900 and 1355 pixels at blob edges), depending on which frames were rendered earlier in the same session.
  - Each of my renders of 31 s and 32 s equals one of the two states of the original code **exactly**. Tests: the original code rendered in matching sessions, and my code with `calm` forced to 0 gave the same pixels.
  - So the picture content from 31.0 on is unchanged, and `calm` is exactly 0 from 31.0.
- The camera `tombCam(t)` and the TakeB hand-off are untouched. `faceD(20.821)` is unchanged (LND key and slope at 20.821 are the same).

## Still weaker than the key frames / notes for the next person

- The guard rise is bolder than KF02 (blue glass is bigger), but the lattice is not at KF02's skim-level macro depth of field (no near-corner blur). The pommel disc just touches the end of the subtitle's second line at about 5.2 s, without overlapping a glyph.
- The sword is still only 18 % of the frame width at the widest moment. It is 55.6 cm in a 1.6 m case at about 2.5 m, so I stopped pulling in; closer would lose the visitors and the walls.
- The peak p90 camera speed (26 px/frame, central 60 % of the frame, at 5.2 s) is about 1 px above the 25 px limit.
- At 5.2 s the lens-shift (cx 1150) makes the hilt sit a little right of centre. It is back to centre by 7.4 s.
- The calm in leg 7 is released over 29.8 → 31.0 s, so the courses and blobs fade back in just before the hand-off. This is visible only as a slow return of texture at about 30 s.
- Not done: the leg-7 diggers and the lamp are unchanged (no weak spot was raised there beyond the stripes).
