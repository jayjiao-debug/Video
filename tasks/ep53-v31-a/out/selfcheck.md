# ep53 v3.1 · a — self-check

Started 13:16 UTC. All renders were made under /tmp only; nothing rendered is in the repo. Files changed: `lines53.ts` (TITLE53 only), `master53.tsx` (TitleOnGlass row 2 only), `take53.tsx` (S3 camera + the 「镀铬？」 tag placement), `cam53b3.ts` (one new export), `master53v3.tsx` (depth only), `paper53c.tsx` (lamp only). No exports were renamed or removed. `npx tsc --noEmit` reports no errors in qq53.

## 1. New title — DONE
- `TITLE53 = ['越王勾践剑', '为什么两千多年不生锈？']`.
- **On the glass** (`TitleOnGlass`, master53.tsx): row 1 is unchanged (124 px, gold-white). Row 2 is the accent gold `B.gold` and gets its own size so it fits inside the plaque: `fs2 = floor((pw − 100) / ((n − 0.5)·1.04))` = 89 px with 0.04 em spacing, about 980 px wide on a 1080 px plaque. The two rows are centred vertically between the lattice rules. The slam on f285, the jolt, the fade and the mapping onto the pane are unchanged.
- **End card** (`end53d3.tsx` reads `TITLE53`, so the file needed no change): the two rows at 60 px fit easily; checked at 142.0.
- Stills checked: 9.6 and 10.5 (both rows inside the plaque, clear of both lattice rules), 142.0.
- Side effect: v2 (EP53, KF03 / kfB53, end53d, kfF53) also reads `TITLE53`, so it shows the new title too. On the glass it gets the new fitting, because it uses the same `TitleOnGlass`. KF03 (kfB53) draws its own plaque at 124 px and is not my file, so its second row may overflow there.

## 2. S3 camera (16.293–20.821) — DONE
- `take53.tsx`: new channels `AL3/BE3/LND3/TX3/TY3/TZ3/FF3/CX3/CY3` replace the old ones only on (16.293, 20.5). At both ends they take the old spline's value and slope (C1). So everything up to 16.293 and the whole 20.5 → 20.821 approach into the rings, and with it the dive at 20.821, are bit-identical: the frame differences from 20.567 on match the old cut to ±0.03. `faceD(DIVE_T)` (used by tomb53/tomb53b3) is unchanged.
- **Path:**
  - Starts where the S1 orbit ends (16.293).
  - Glides in low beside the blade (about 46° off the axis, 23–25° up, 730 → 520 mm from the pommel face). The whole blade lies across the frame with the lattice open through 「有一种流传很广的说法：它表面镀了铬，所以不锈。」, the 18.557 sheen and 「镀铬？」.
  - From 19.0 to 20.5 it swings round the guard onto the axis behind the pommel; the 11 rings fill the frame from about 20.3.
  - The principal point carries the sword up and left, so the hilt stays clear of the overlay's Cr tile (x ≥ 1345, y ≥ 683) and the sword clear of the subtitle zone.
- **Motion:**
  - Screen speed of pommel / guard / blade middle / tip (occluded points excluded): max 11.5 / 7.8 / 17.6 / 24.8 px per frame. The old path was 14 / 6 / 4 / 7, but it never showed the blade side-on.
  - Mean grey difference per frame, quarter-scale video 15.5–21.6, new vs old: ≤ 3.1 through the glide. The exceptions are the subtitle/stamp events at 16.3 (5.8 vs 5.8), 17.4 (4.1 vs 3.0) and 18.33 (5.0 vs 4.2), and the sheen wash at 18.73 (3.3).
  - The swing 19.5–20.2 is lower than the old cut on every frame (for example 20.1: 4.7 vs 6.1). From 20.5 the ring zoom is the same as before (11–16 per frame, the existing ring close-up).
- **「镀铬？」 tag** (DuoTag, same file): it is placed from the camera's projection, so with the new camera it would have started at x ≈ 90, outside the safe area. It is now anchored below-left of its blade point with its left end at x ≥ 120. I also changed its size from 64 px to 56 px, because the brief allows only 44/56/72. Leader, timing and fade are unchanged.
- Stills checked: 16.8, 17.4, 18.0, 18.6, 18.8, 18.9, 19.0, 19.2, 19.5, 19.8, 20.1, 20.4, 20.8, 21.0.

## 3. Depth tags — DONE
- `cam53b3.ts`: new export `camDepthB3(t) = max(0, −camB3(t).z)`. The old `DEPTH_B3`/`depthB3` are kept.
- `master53v3.tsx` `depth53v3` no longer has a clock of its own.
- **Descent:**
  - 0.0 while the camera is above the ground. It breaks the ground at 29.45 (f884).
  - The camera looks about 62° down, so every pole mark in view is below it. The reading is therefore the depth of the survey pole at the frame's top edge (`topDepthB3`, solved from the same camera and projection as tomb53b3), which is the shallowest depth in view. Each −2/−4/−6/−8 m tick leaves the top edge just as the tag passes 2/4/6/8.
  - This is blended in from the camera's own depth over its first 3.2 m, so it leaves 0.0 smoothly.
  - Readings: 29.5 → 0.1, 30.0 → 2.1, 30.4 → 4.0 (the −4 tick at the top edge), 31.2 → 6.2 (−6 just gone, −8 in view), 32.0 → 7.7, 33.84 (椁 roof) → 8.4, 35.0 → 9.5, 35.6 → 10.8 (the 椁 floor as the view tilts down), then held at 10.8 to the draw.
  - Max change 0.16 m per frame; nothing jumps at the bottom.
- **Rise (L1):**
  - `camD3` (take53d3, read-only import) gives the camera depth.
  - The tag holds 10.8 from 118.2 to the camera's deepest point in L1 (125.8, found numerically, 8.20 m), then reads 10.8 · D / 8.20: 126.5 → 10.7, 127.5 → 10.2, 128.4 → 9.3, 129.0 → 6.3, 129.5 → 4.3, 129.9 → 1.3, 130.033 → 0.2.
  - It reads 0.0 from f3902 (130.069), the frame where the camera breaks the surface (camD3 z = −0.009 m on f3902, +0.113 on f3903). Fades out by 130.6 as before.
- Stills checked: 29.5, 29.6, 30.4, 31.2, 32.0, 32.5, 33.0, 34.0, 35.5, 35.6, 36.7, 126.0, 128.5, 129.5, 130.0, 130.1.

## 4. Paper-test lamp — DONE
- `paper53c.tsx`: the lamp fixture group and its stand are removed.
- The light stays. On DA(25) (v3 93.275) a soft warm pool fades in from beyond the top-right corner, and the beam's narrow end is feathered to nothing (the gradient is 0 for the first 28%), so no source or fixture is drawn.
- Stills 93.0, 93.3, 93.5, 93.6, 95.0: no fixture, no beam shard.
- Frame differences 92.9–94.2: the same as the old cut within about 0.5 (the leg's own camera swing gives 7–9 per frame in both).

## 5. Tiles, stamps, seal, subtitles — UNCHANGED
None of their code was touched.

## Hand-offs
- 20.821 (TakeA → TakeB3): unchanged, because the camera after 20.5 is identical to before.
- 9.5 and 11.764 (title): the picture is unchanged.
- The depth tags fade in and out at the same times as before.

## Outside my files
Nothing needed changing. Note for whoever owns KF03 (kfB53): the new long second row may overflow its own plaque.
