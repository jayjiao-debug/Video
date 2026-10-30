I fixed all three of my review items (#4, #5, #9) and checked each one on rendered stills and frame-difference measurements. One leftover pop at the 38.935 hand-off comes from the overlay, which is another engineer's file. Everything was rendered under /tmp only and nothing is committed. The type check passes.

**#4 MAJOR: 「②内棺」 drawn over the J seal (35.6–36.5) — fixed.**
- The tag code now stops every tag box from entering the seal zone (x ≥ 1663, y ≥ 887) or the depth-tag zone (x ≤ 520, y ≥ 940). The limit eases in over 100 px, so a moving tag never jumps.
- It applies to 「①外棺」, 「②内棺」 and 「剑在墓主人左侧」.
- At 36.2–36.3, 「②内棺」 now sits at about x 1700–1790 with its baseline at y 840–860, clear of the seal. The other tags are clear at every frame I checked from 34.5 to 37.3.

**#5 MAJOR: lid lifters drawn as side-view giants (34.9–36.0) — fixed.**
- The flat side-view figures are replaced by lifters built in the chamber's 3D space and seen through the same camera (new file `lifter53b4.tsx`). Both gloved hands sit on the lid's corner, so they rise with it. Same brown fill and warm rim, same timing and fade as before.
- In the wide shot (34.7–35.1) you see two people from above leaning over the lid corners. From about 35.3, as the camera drops in, their bodies leave the frame and only arms and gloves reach in from the sides.
- Motion compared with the old code: no single-frame jumps. During the lid lift (f1049–1064) the frame-to-frame difference is a little higher, 4.7–6.4 against 3.9–4.7, because bigger shapes move with the lid during a fast camera move. I looked at frames 1040–1090 and saw no flicker.
- I dropped the old 120 px sideways shift that kept the right lifter clear of the stamp, because it would pull the hands off the lid. At 35.1–35.3 that lifter's head is just left of the stamp and does not cover the stamp text.

**#9 MINOR: colour pop at the hand-off (f1168 → f1169) — fixed in the picture.**
- The inner-coffin walls now change from `#3A2418` to v2's `#46201A` over 38.3–38.93, so they already match at f1168.
- Measured without the overlay, f1168 → f1169 drops from 2.32 to 1.24, about the same as a normal frame (0.96 and 1.11 either side). The wall band at the top went from 4.2 / 4.7 to 0.2 / 0.0.
- **Small leftover in my picture:** the bottom strip still differs by 3.6. v2's inner coffin is a little narrower, so its near wall shows as a dark band about 50 px tall at the bottom edge after the switch. I left the coffin size alone because it is the reference for the second chamber. Easing that wall into place over 38.3–38.93 would be a one-line change if wanted.
- **Not mine to fix (overlay, `master53v3.tsx`):** with the overlay on, the hand-off frame still jumps by 8.1. At 38.935 the long subtitle changes to 「洗」 and the stamp 「1965 · 望山1号墓 / 内棺 · 人骨架左侧」 disappears, taking their dark backing with them. Easing those out over 3–4 frames would remove most of it.

To measure the picture alone I made a temporary composition without the overlay and deleted it afterwards.

Files:
- `episodes/37-qiqing/remotion/src/qq53/chamber53b3.tsx` (edited)
- `episodes/37-qiqing/remotion/src/qq53/lifter53b4.tsx` (new)
- `tasks/ep53-fix4-b/out/selfcheck.md` (per-item notes with all the times and numbers)
