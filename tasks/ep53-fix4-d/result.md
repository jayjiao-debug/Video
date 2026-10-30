All four of my review items (#1, #3, #7, #8) are fixed in `take53d3.tsx`, `world53d.tsx` and `scene53d.tsx`, and the film renders. I checked them with stills at 0.5 and full scale and with a quarter-scale video of 110.5–145.3 s, measured against a render of the code as it was before this round. Nothing outside my files needed changing, and nothing rendered is in the repository.

**#1 BLOCKER: sword on the wrong side (117.6–129.6 s): done.**
- I took the quick fix rather than un-mirroring the camera. The same camera drives the rewind, the layers, the museum and the macro portal, so flipping it would also flip the approved museum shots.
- The sword now lies on the camera side of the skeleton (`SYA = YC − 0.22`; chamber 1 uses 0.23). The bronze knife moved to chamber 1's place relative to the body, between the sheath and the shins.
- The rewind path, the air leaks and the 「剑鞘」 leader follow the sword. The first two rewind camera positions moved with the sword, so the portal hand-off at 117.616 is unchanged (frame difference 4.43 before, 4.41 after).
- At full resolution, 36.8 and 120.5 now match: head screen-right, sheath at screen bottom, hilt screen-right with the guard at the pelvis, knife between sheath and shins.
- There is no coffin wall hiding the sheath, because the section cut removes the near wall.
- The inner-coffin interior now uses chamber 1's colours.

**#3 MAJOR: the other swords float (122.1–125.5 s): done.**
- The outer burial chamber (椁) now has a floor of lit wooden boards.
- The three swords lie on it beside the coffins, foreshortened by the same camera. Each has a soft shadow and a small warm pool of light (a 0.18) instead of a halo.
- They are clearly duller than the hero: metal level 0.45, down from 0.72.
- I re-aimed the camera for this beat: the hero (sheath and guard, with its pool of light) is fully in shot at the bottom, and the other swords sit top-right, clear of the subtitles and the depth tag.
- My first version made the camera cross the section plane at 120.6, which caused a one-frame pop. The camera now stays on the cut side from the rewind through the layers, and the pop is gone.

**#7 MAJOR: black wedge and bright white clay (125.5–129.6 s): done.**
- The flat black wedge is now the pit's own soil walls and floor, in the same mixed-soil (五花土) texture as the dig.
- The 白膏泥 is toned to `#8E877A`→`#6A645A` with a light speckle. At 128.5 it measures about 32 % brightness; it was about 43 %.
- During this beat the frame edges darken further, and a wider warm glow surrounds the sword when it is small, so the sword stays the brightest point.

**#8 MAJOR: star sparkle while the line says 「变暗」 (130.9–140.8 s): done.**
- There is no star on the display sword from 130.069 onward. The only glint left is frame 0's, which returns in the kitchen at the same size and place as at 0.2.
- The dulling is now visible: the blade darkens over 131.4–133.0. At 133.2 its brightest pixels are about 12 % darker than in the old build, or about 25 % against the un-dulled blade. The olive spot is already in place by 132.6.
- The darkening eases off over 137.0–138.3, so the cross-fade back to frame 0 doesn't jump in brightness.

**Smoothness check (quarter-scale video, subtitles and depth tag masked out):**
- My first frame (111.389), the 117.616 portal and the kitchen cross-fade are unchanged.
- Two line starts got smoother: 125.54 went from 7.38 to 5.52 and 134.03 from 5.13 to 4.81. 130.07 moved slightly (4.38 → 4.53), and nothing new spikes anywhere.
- The settle (119–120.7 s) and the swords beat (120.7–123.3 s) now have a little more camera travel than before, because the camera moves from the near-side sword up to the other swords. This is smooth motion with no single-frame jumps. The settle peaks at 3.15 per frame (it was 2.65), and the swords beat at 3.84 (it was 3.65), against the brief's guide of 3.

**For the other engineers:**
- `CaseW` in `scene53d.tsx` has two new optional settings, `glint` and `dim`. Their defaults keep the old behaviour, so the v2 `take53d` is unaffected.
- The world camera is still mirrored, as the reviewer described. Nothing with lettering is seen through it in the tomb part of TakeD3.

The per-item details and all measurements are in `tasks/ep53-fix4-d/out/selfcheck.md`.
