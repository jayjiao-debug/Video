All four of the owner's v3.1 notes are done and checked on renders made under /tmp. Nothing outside my files needed changing; the one thing that may need someone else is the KF03 key frame (last section).

**1. New title 「越王勾践剑 / 为什么两千多年不生锈？」**
- `TITLE53` in `lines53.ts` is updated.
- On the glass (`TitleOnGlass` in `master53.tsx`), the first row is unchanged: 124 px, gold-white. The longer second row is in the accent gold at 89 px so it fits inside the plaque, and both rows sit centred between the decorative rules. The slam on f285, the jolt and the fade are unchanged.
- The end card reads `TITLE53`, so it updated without edits; checked at 142.0.

**2. S3 camera (16.293–20.821), in `take53.tsx`**
- **New path:** the camera starts where the hall orbit ends, then glides in low beside the blade at a three-quarter angle. The whole blade lies across the frame with the diamond pattern visible through the 「镀铬」 line, the sheen on 18.557 and the 「镀铬？」 tag. From 19.0 it swings round the guard to behind the pommel.
- **Dive unchanged:** the new path joins the old one smoothly at 20.5, so the ring close-up and the dive at 20.821 are identical to before.
- **Speed:** at most 24.8 px per frame (the blade tip during the swing); the pommel stays under 12.
- **Frame differences:** through the glide, mean difference per frame stays at or under 3.1. The frames above 3 are subtitle/stamp changes (also above 3 in the old cut) and the sheen. The swing is calmer than the old cut on every frame.
- **Framing:** the sword stays clear of the Cr tile and the subtitle area.
- **「镀铬？」 tag:** it is placed from the camera's view, so the new path pushed it outside the safe area (x ≈ 90). I moved it back inside and changed its size from 64 px to 56 px, because the brief allows only 44/56/72.

**3. Depth tags**
- `cam53b3.ts` now exports `camDepthB3`, the camera's depth below ground. The tag in `master53v3.tsx` no longer counts on its own clock.
- **Descent: my interpretation.** The camera looks about 62° down, so the pole marks on screen are always deeper than the camera itself. Reading the camera's depth alone would still disagree with the marks in view (2.3 while −6 is on screen). So the reading is the pole depth at the top edge of the frame, which is the shallowest mark visible, worked out from the camera's position and angle. It starts from the camera's own depth over the first 3.2 m so it leaves 0.0 smoothly.
- **Descent readings:** 0.0 until the camera breaks the ground at 29.45, then 4.0 as the −4 m mark leaves the top of the frame, 6.2 just after −6 m leaves, 8.4 at the 椁 roof, and 10.8 at 35.6 as the view tilts onto the 椁 floor. It changes by at most 0.16 m per frame, so nothing jumps at the bottom.
- **Rise (L1):** the tag holds 10.8 until the camera's lowest point at 125.8, then counts down in proportion to the camera's own depth from `camD3` (read only). It reaches 0.0 on f3902 (130.069), the frame the camera breaks the surface.

**4. Paper-test lamp (`paper53c.tsx`)**
- The lamp and its stand are gone. When the light switches on at 93.275, a warm glow comes in from beyond the top-right corner.
- The light beam is kept, with its narrow end faded out so no source shows.
- Frame differences there match the old cut to within 0.5.

**5. Tiles, stamps, seal and subtitles:** not touched.

**One thing to flag:** the old v2 version and the KF03 key frame also read `TITLE53`. In v2 the title on the glass gets the new fit automatically. KF03 (`kfB53.tsx`, not my file) draws its own plaque at 124 px, so its second row will probably overflow there.

The full per-item record with times and numbers is in `tasks/ep53-v31-a/out/selfcheck.md`.
