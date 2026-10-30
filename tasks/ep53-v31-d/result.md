# ep53 v3.1 · TakeD3 owner notes: result

I made all three of the owner's changes. I checked each one by eye on still frames and by measuring frame-to-frame differences on low-res videos of the film (`EP53V3`). Renders went only to /tmp, and I committed nothing.

**Changed files:** `macro53c.tsx` (M2 only), `world53d.tsx` and `take53d3.tsx` in `episodes/37-qiqing/remotion/src/qq53/`. I left `scene53d.tsx` and `hall53d.tsx` alone, and the L1 camera (125.5–130.069) is exactly as before. The type check shows no errors in my files; the only errors are older ones in qq45/qq46.

## 1 · 1:43 M2: top view
- **Camera:** it now cranes up and tips down to look nearly straight down (74°) at the subject diamond. The diamond stays the same size and in the same place throughout. The move starts during M1 and is complete just after 102.332. The hush takes it back to the original M3 view and still lands on `<HandoffMacro />`.
- **Hand-off:** frames 3316–3318 differ from frame 3320 by 0.17 mean grey outside the subtitle box, under your 0.3 limit.
- **The cut:** from straight above, a vertical cut would be invisible, so it is now a shallow ramp ground into the blade. From above you see a broad white tin band, only under the pale diamond, with the grained gold bronze below it.
- **Hits:** 「镀铬？」 on 102.332, the cut on 103.464 (already partly open on that frame, then growing) and 「热镀锡 · 2025研究」 on 104.597 all land on their frames.
- **Tags:** they sit either side of the diamond with leader lines. 「镀铬？」 points at the pale surface above the cut, 「热镀锡」 at the tin band.
- **Outside the item:** I changed both tags from 62 px to 56 px to follow the 44/56/72 rule.
- **Smoothness:** no jumps, but this stretch changes faster than the 3-per-frame guideline. The crane peaks at 16.5 per frame, against 10.8 in the old version at the same moment. The way back peaks at about 11, against under 3 before. The whole frame is high-contrast lattice and the view genuinely turns about 60°, so some of this can't be avoided.

## 2 · 2:03 E1: the other swords
- **Look:** the three swords stay on the 椁 floor at real size. When lit they now have a warm bronze-gold body clearly lighter than the boards, a dark-plus-gold outline, a lit ridge and a soft warm glow under each.
- **Timing:** they still light one per half-bar from 122.711.
- **Hero:** the hero sword gets a larger, stronger glow during E1, which eases out early in L1.
- **Tag:** a 44 px 「其他剑」 appears on the first sword's frame, with a thin leader that fans out to each sword as it lights. It fades out before the L1 move starts.

## 3 · 2:13 R2 → P1: one calm move
- **The move:** up to 131.9 the camera follows its old path. From there it is one continuous move:
  - it comes in, without stopping, to a close view of the dulling blade on 134.031 (the P1 start is kept);
  - it drifts down the blade's own line toward the tip, pulling back and turning 34° to look back along the sword;
  - it comes to rest on frame 0's exact camera at 138.5 and holds.
- **No arc, no swing:** the old wide swing at 136.1 is gone. The whole sword stays in frame on every frame, and motion peaks at 13.3 px per frame (limit 25).
- **The transition:** the plinth no longer pops away; it dissolves with the hall. A glass reflection streak from the case cover sweeps across the frame (at most 21 px per frame), and the kitchen appears first inside that streak, as a reflection, before taking over everywhere. The end card at 140.824 is untouched.
- **Measured:** frame differences are lower than the old version almost everywhere. For example, at 134.05–135.0 the peak is now 3.35, against 6.76 before. The dissolve stretch (135.0–136.5) peaks at 4.27, against 2.67 before; most frames there sit around 3, and the highest jumps (f4032/4035/4051) are the overlay's subtitle reveal, not the picture.
- **Two rendering glitches fixed along the way:**
  - Two blur effects (the far blur and the kitchen wall) were cutting the picture off at a hard rectangle during the dissolve.
  - The display stand's light pool (in `display53k`, which isn't my file) breaks up when the camera passes low over it. The old version hid that by popping the plinth away. I now fade just the stand's light first, so the plinth itself can dissolve smoothly.

## For the other engineers
- `world53d.tsx` has a new export `otherAt`, and the hero sword component has a new optional prop `e1`. Nothing was renamed or removed.
- The `DeckPool` break-up in `display53k` is still there for anyone else whose camera passes low over the stand.

The full self-check, with every time checked and all the numbers, is in `tasks/ep53-v31-d/out/selfcheck.md`.
