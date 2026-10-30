# ep53 v3 TakeD3 (111.389 → 145.333): built

TakeD3 is built end to end and the film renders. Every item in the brief is done. I checked it with stills and three quarter-resolution videos of 110.5–145.333, measuring the mean grey difference between consecutive frames. TypeScript reports no errors in `qq53`. Renders are only in `/tmp`, and I committed nothing.

## What the range now does
- **111.389–117.616 (the rust blooms):** the range opens on `HandoffMacro` plus bloom 1 on f3342. Blooms 2 and 3 land on 111.955 and 113.087. The find-ring then opens onto the real black sheath and its mouth band, not a red disc.
- **Re-timing to v3:** I re-timed v2's TakeD with one smooth time map whose fixed points are the hits, so they land on these frames:
  - the rewind starts at 117.616 and the sword settles in the coffin on 120.446;
  - the other swords light on f3681, f3715 and f3749;
  - the six layers close on f3783, f3800, f3817, f3834, f3851 and f3868, then the air dots;
  - the camera reaches the museum floor on 130.069.
- **The second chamber is now the same tomb as the first** (`scene53c`):
  - the same coffin sizes and colours, with no big oxblood-red interiors;
  - the same skeleton, copied line for line because `scene53c` doesn't export it;
  - the same black sheath, and the bronze knife (`BronzeKnife53`) beside it;
  - the hero sword drawn with the shared `Sword3D`, hilt pointing screen-right, so the rewind reads as the draw run backwards;
  - three other swords at real size (58 cm) with dull bronze guards and no blue;
  - the end case has no outline or halo, the museum visitors are opaque, and no depth tag is drawn;
  - the layer labels (剑鞘 / 两层棺 / 木椁 / 白膏泥 / 夯土) are 56 px and inside the safe area.
- **R2 (130.069–134.031):** the camera rises through the floor to the case. The bronze goes a shade duller under a warm veil, and one small rust spot appears. The shot ends on a close-up of the hilt.
- **P1 (134.031–138.5):** one pull-back that carries on from R2's motion, arcs out in front of the case, then runs down the blade to frame 0's camera.
  - The plinth dissolves on the music's peak; the hall and the glass hood fade after it.
  - The kitchen, cleaver, glow and glint come back as in frame 0.
  - From 138.5 the picture is exactly frame 0: compared with frame 0, the difference is 0.00. There is no window rectangle.
- **End card (140.824):** the J stamp is absent on f4224 and complete on f4225. The title, question, pill and sources come in at +0.35, +0.7, +1.2 and +1.3 s. The sources line is `SOURCES53V3` on 2 rows at 24 px. After 4 s it fades to black, fully black on the last frame, f4359.

## Smoothness
There are no single-frame pops. The camera skimming the plinth used to make it flicker at 134.4–135.5; that is gone. The median difference between consecutive frames is 1.28. Four short runs go above 5:
- the portal opening (117.0–117.3);
- the camera swing between the third sword and the first layer (125.5–125.6);
- the 木椁 lid dropping (127.8);
- the plinth dissolving (134.1–134.4).

## Files
All code is in `episodes/37-qiqing/remotion/src/qq53/`:
- `take53d3.tsx`: rewritten.
- `end53d3.tsx`: new (the end card and the fade).
- `world53d.tsx`: the rebuilt chamber.
- `scene53d.tsx`: camera poses moved to the new sword, two optional props added to the case, warm veil.
- `macro53d.tsx`: warm veil.
- `hall53d.tsx`: opaque visitors.

The self-check is at `tasks/ep53-v3-d/out/selfcheck.md`, with times and numbers for each item. v2's TakeD also uses the edited world files; it still compiles, and I didn't render it.

## For the producer
- **Possible double end card:** the comment in the `master53v3.tsx` stub lists "end card" as part of the overlay. Per my brief, TakeD3 draws the end card. If the overlay builder also draws one, one of them must be removed.
- **Plinth glitch:** the light pool on the plinth top in `display53k.tsx` (`DeckPool`) breaks up when the camera is low and close to it. I worked around it by fading the plinth on the P1 peak. The cause is in that file, which I wasn't allowed to edit.
- **Subtitle backing:** the picture keeps v2's dark backing behind the top-left subtitle area until P1, then fades it out so the held kitchen matches frame 0.
