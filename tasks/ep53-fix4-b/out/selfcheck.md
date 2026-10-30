# ep53 fix4-b self-check (TakeB3 first chamber: `chamber53b3.tsx` + new `lifter53b4.tsx`)

Started 09:46 UTC, finished 09:58 UTC. Files changed: `episodes/37-qiqing/remotion/src/qq53/chamber53b3.tsx`. New file: `src/qq53/lifter53b4.tsx`.
No other file touched. No exports removed: `Digger53` is still exported but no longer used. `npx tsc --noEmit` reports no errors in either file.
All renders went to /tmp only.

## #4 MAJOR: 「②内棺」 over the J seal (35.6–36.5): **done**
- New `capY(x0, x1, y)` in chamber53b3. Once a tag box reaches x 1600, its baseline is capped at y 860, so the box bottom stays at or above 868, which is above the seal zone (y ≥ 887). Once a box reaches x 580, its baseline is capped at y 920, keeping it out of the depth-tag zone (x ≤ 520, y ≥ 940). Both caps ease in over 100 px of x, so a moving tag never jumps.
- The cap is used in `SafeTag` (「①外棺」 and 「②内棺」) and in 「剑在墓主人左侧」. The subtitle-box rule (x < 1150, y < 280) and the safe area are unchanged.
- Checked with the overlay on, at 35.6, 35.9, 36.0, 36.2, 36.3 and 36.5. At 36.2–36.3 「②内棺」 sits at about x 1700–1790 with its baseline at about 840–860, clear of the seal (the seal is at about 1750, 975). 「剑在墓主人左侧」 is also clear at 36.9 and 37.3, and 「①外棺」 at 34.5–35.3.

## #5 MAJOR: lid lifters drawn as side-view giants (34.9–36.0): **done**
- The 2-D side-view `Digger53` (figure44 `Rimmed`) is replaced by `Lifter53` (`lifter53b4.tsx`), a figure built in the chamber's 3-D space and projected by the chamber camera:
  - legs, back, shoulders, neck, the top of the head (hair) and two arms with elbows bent outward;
  - each glove has a cuff, and both gloves sit ON the lid: one on the near long edge just inside the corner, one on the end face (`hands()` in chamber53b3, blended from lid ① to lid ② with the existing `act`);
  - the back bends and the hips drop until the hands are within reach.
- Style: the same lacquer-brown people fill `#2B1A12` with a warm `#E0A868` rim, and the same fade (`dOp`) and timing as before.
- What it looks like:
  - at 34.7–35.1 (wide, steep): two people at the coffin ends, seen from above, leaning over the lid corners;
  - from about 35.3, as the camera drops in: the bodies leave the frame and only arms and gloves reach in from the sides, gripping the lid's edges as it lifts;
  - by 36.2 only fading arm stubs are left at the frame edges.
- The old 120 px "stamp dodge" shift is dropped, because shifting the figure would pull the hands off the lid. At 35.1–35.3 the right lifter's head is just left of the stamp (about x 1310–1380, y 140–195) and does not cover the stamp text. Part of its body is dark behind the stamp's second line, under the overlay's own halo.
- Motion: a picture-only quarter-scale video from 33.8 to 39.5, compared with the old code. No single-frame spikes (none above 3× the local median). The largest frame-to-frame difference is 7.01 (old: 7.05), and it is in the roof-plank move, not the lifters. During the lid lift (f1049–1064) the mean difference is 4.7–6.4 against 3.9–4.7 before. That is the bigger figures moving with the lid during the fast camera move, not a jump. I looked at consecutive frames 1040–1090: no flicker and no arm swapping.

## #9 MINOR: colour pop at the TakeB3 → TakeC hand-off (f1168 → f1169): **done (picture)**
- The inner-coffin walls now ease from `#3A2418` to v2 `Chamber53`'s `#46201A` over film 38.3–38.93: `mix(..., sstep(seg(tv, 38.3, 38.93)))`. At f1168 (38.933) the colour is fully v2's.
- Measured on the picture without the overlay, using a temporary picture-only QA entry (`pic53b4.tsx`, deleted afterwards):

  | | old code | fixed |
  |---|---|---|
  | f1168 → f1169, whole frame | 2.32 | 1.24 |
  | f1168 → f1169, rows y 0–360 (the wall band) | 4.2 / 4.7 / 1.0 | 0.2 / 0.0 / 0.0 |
  | normal frames either side | | 0.96 (f1167 → 1168), 1.11 (f1169 → 1170) |

- Residual, left as is: the bottom 120 rows still differ by 3.6. v2's inner coffin is narrower (`INN.y` 0.30, centred on 0) than this chamber's reference coffin (`INN3.y` 0.355, centred on −0.055). So at the switch, v2's near inner wall appears as a dark strip about 50 px tall along the bottom edge (y ≈ 1030+). I did not change the coffin size, because `OUT3`/`INN3` are the reference set for the second chamber. If wanted, the near wall could ease from y −0.41 to −0.30 over 38.3–38.93. That is a one-line change in `Coffin53`'s call.
- **Outside my files (for the overlay owner, `master53v3.tsx`):** with the overlay on, f1168 → f1169 still differs by 8.1 (rows 120–360: 23 / 28). The cause is the overlay, not the picture: at 38.935 the subtitle changes from the long two-line 「打开木椁和两层棺，…」 to 「洗」, and the stamp 「1965 · 望山1号墓 / 内棺 · 人骨架左侧」 disappears. Their dark scrims go with them, so the top band brightens in one frame. Easing the stamp out and the scrim over 3–4 frames would remove most of it.

## Stills checked (all in /tmp/r)
34.5, 34.7, 34.9, 35.1, 35.3, 35.6, 35.9, 36.0, 36.2, 36.3, 36.5, 36.9, 37.3, 38.0, 38.6 (with overlay); f1150–1170 (with overlay and picture-only); quarter-scale video 33.8–39.5 (picture-only, old vs new).
