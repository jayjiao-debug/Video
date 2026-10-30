# ep53 fix4-d self-check (TakeD3: second chamber, layers, museum)

Started 2026-10-30 09:46 UTC. Edited only my files: `world53d.tsx`, `scene53d.tsx`, `take53d3.tsx`. No exports renamed or removed
(`CaseW` gained two optional props, `glint` (default 0.7, as before) and `dim` (default 0), so v2 `take53d` renders as before).
All renders under /tmp only.

| # | Status | What I did / checked |
|---|---|---|
| 1 BLOCKER | **done** | Took the quick fix (no un-mirroring: `worldCam` drives T3 → L1 → museum → P1, and the macro portal; flipping it would flip the display and lattice too). `SYA = YC − 0.22` (was `YC + 0.2`): the sheath is on the camera side of the skeleton, 0.22 m off the body axis (chamber53b3: 0.23). Knife moved to chamber53b3's place relative to the body (`KNIFE3`: ring end at body x 0.40, y = axis − 0.158), i.e. between the sheath and the shins, back toward the sheath. `swAt`, the leaks' end points and the L1 「剑鞘」 leader follow from `SYA` (checked at 126.6: the leader ends on the sheath). The T3 poses 80.3 / 81.954 (scene53d `POSES`) moved by the same −0.42 m in y as the sword, so the macro portal (117.616) and the first rewind close-ups show the sword exactly as before (hand-off diff 4.43 → 4.41). Pose 83 moved −0.35 / −0.36 and the settle pose 84.219 was re-aimed to frame body + sword, easing the settle. Side by side 36.8 vs 120.5 (full res): head screen-right, sheath at screen bottom (near side), hilt screen-right with the guard at the pelvis, knife between sheath and shins, in both. The sheath is fully visible at 119.0–121.5 (there is no near wall: the section cuts it; the floor edge is ~5 cm in front of the sheath). Inner-coffin interior now uses chamber53b3's colours (walls #3A2418, floor #46201A × 0.55): median floor RGB 36.8 = (42,21,15), 120.5 before = (59,33,20), now close to chamber 1. |
| 3 MAJOR | **done** | `GuoFloor`: the 椁 floor as 8 lit boards (seams, grain, a warm Pool a 0.22 on the side compartment, fading in 85.6 → 86.483 v2 = before the first sword lights). `OtherSword`: halo removed; each lies on the boards with a blurred contact shadow and a Pool a 0.18; metal level 0.45 (was 0.72), edge stroke 0.08 + 0.3·lit (was 0.15 + 0.6): visibly duller than the hero's lit guard/grip. Swords moved into the side compartment right of the subtitle box (x0 −0.62…−0.8, y YC + 0.76…1.0, beyond the outer coffin wall's occlusion). E1 poses (86.483 / 88.5 / 89.0) re-aimed: higher, square on, the hero (sheath + guard, Pool a 0.42, ≥ 0.3) fully in shot at the bottom, the three swords top-right, all foreshortened by the same camera. Checked 122.2 / 122.8 / 123.9 / 124.2 / 125.0: swords clear of the subtitle zone (x < 1150, y < 280) and of the depth tag. The camera stays on the cut side (y < 0) from T3 through L1, so it never crosses the section plane (my first try crossed it at 120.6 and made a one-frame pop; fixed). |
| 7 MAJOR | **done** | The open shaft is no longer a flat black void: its far wall, both side walls and floor are drawn in 五花土 (base #3A2A1D / #2C2016, mottles in the dig's palette, strata lines), clipped to the cut opening (checked 126.2 / 126.8 / 127.3: the right wedge is the soil face of the shaft). 白膏泥 toned to #8E877A → #6A645A with 260 light/dark speckles; its top line #CFC6B0 at 0.55 (was #EDE6D2 0.7). Measured at 128.5: clay RGB (81,77,68) ≈ 32 % value (was (110,106,95)). Added an L1 edge vignette (radial, up to 0.62, 125.3 → 126.0 in, 129.6 → 130.3 out) and a broader warm Pool round the hero when it is small in frame (span < 300 px), so the sword glow is the brightest point. |
| 8 MAJOR | **done** | `CaseW` star removed in TakeD3 (`glint={0}`): no star anywhere from 130.069 to the kitchen; the only glint left is frame 0's (take53d3 `g0`, r 26, same place as take53 at 0.2), from 137.4. Dulling: a multiply layer (#D2C4AC) over the blade, in 131.4 → 133.0 (complete by 133.0), on top of the existing warm veil; the olive spot is already full at 132.6. Measured on the blade at 133.2 (half-res): 99th-percentile luminance 170 → 150 and max 201 → 181 against the old (already veiled) build, ≈ −25 % against the un-dulled blade. The multiply eases off 137.0 → 138.3 as frame 0's kitchen returns, so there is no brightness pop at the home cross-fade. |

## Continuity / hand-offs
Quarter-scale video of 110.5 → 145.333, before (HEAD, rendered from a /tmp worktree) and after, frame-to-frame mean grey difference with
the subtitle band and depth tag masked:
- 111.389 (TakeD3's first frame): 0.83 before / 0.83 after (unchanged; macro leg untouched).
- 117.616 (portal → tomb world): 4.43 / 4.41 (unchanged: the camera moved with the sword).
- Line starts (subtitle band masked) 125.540: 7.38 → 5.52 · 130.069: 4.38 → 4.53 · 134.031: 5.13 → 4.81 · 122.144: 2.95 → 3.49. No new spikes anywhere.
- 138.2–138.5 home cross-fade (4148–4153): 1.64 / 0.48 → 1.61 / 0.47. Card 140.824: unchanged.
- Window statistics (max / mean per frame, after vs before):
  T3 rewind 117.6–119.0: 5.69 / 4.59 vs 4.79 / 3.98 (planned fast slide, as before) · settle 119.0–120.67: 3.15 / 2.46 vs 2.65 / 1.64 ·
  E1 120.67–123.3: 3.84 / 2.41 vs 3.65 / 1.99 · 123.3–125.8: 5.52 / 1.61 vs 7.38 / 1.56 · L1 125.6–130.0: 4.92 / 1.96 vs 6.20 / 2.29 ·
  R2 130.2–134.0: 4.91 / 2.60 vs 4.92 / 2.64 · P1 134.1–138.3: 8.12 / 1.98 vs 8.67 / 2.14.
  The settle and E1 now move a little more (the camera travels from the near-side sword up to the side compartment), smooth with no
  single-frame jumps; the over-3 frames there are steady camera motion, at the level the film already has in T3.

## Notes for others
- Nothing outside my files needed changing.
- `CaseW` (scene53d) has new optional props `glint` (default 0.7 = old behaviour) and `dim` (default 0); v2 `take53d` is unaffected.
- The world camera is still mirrored as the reviewer described (I took the quick fix). Nothing asymmetric with lettering is shown
  through it in TakeD3's tomb part. The museum part was already approved and is unchanged.

Finished about 10:10 UTC.
