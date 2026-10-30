All three owner notes are fixed in the film except the hoops in the coffin-draw scene (41/44 s): that grip is drawn by `flat53s.tsx`, which isn't one of my files. The fix for it is written and needs one line changed there. I checked every still on the list. The frame-to-frame check is mostly met: no new jumps, smoother than v2 frame for frame, but a few stretches of the rise are still a little above the ≤ 3 target (details under note 1). The film renders, and there are no type errors in the qq53 files.

**1. The 5.6 s camera** (`take53.tsx`, `camAt`)
- **Now:** after the glide, the camera rises off the blade and swings to the front. From about 5.0 s it looks down at the guard and grip from a three-quarter angle (about 40° above). The sword runs gently from lower left to upper right and nothing points at the lens. The camera then pulls back onto the whole sword: whole sword in frame from about 7.8 s, settled by 9.0 s.
- **Unchanged:** the glide up to 4.2 s, the 9.5 s title framing and every move after it. The guard-glass glint on 5.66 s still lands on the guard.
- **Speed:** the hilt moves at most 22 px per frame. For about 4 frames around 5.0 s, the blade right under the lens leaves the lower-left corner at about 40 px per frame (the glide before it does the same).
- **Frame-to-frame check (4.0–9.6 s):** the only spikes are the title slam on f285 and the subtitle change on f167, which v2 also has. Two stretches are still above the ≤ 3 target: about 4.27–5.0 s (3.4–5.6) and 5.6–6.7 s (2.8–4.1). Both are lower than v2 at every frame (v2: 4.6–6.2), and every frame after 6.7 s is at most 3.3.
- **Weak spot:** 4.4–4.8 s is still the end of the glide, looking along the sword at the guard with the grip going away up the frame. It doesn't point at the lens.

**2. The hoops** (`sword3d.tsx`)
- Each hoop is now a solid band seated on the grip: lit top edge, shaded side, dark lower edge, a lit rim on its end ring, and a thin shadow on the grip beside it. The grip hides the back half of each hoop.
- The grip has a faint wrapped-cord texture. I put it on all three grip sections, with the hoops sitting on top of the binding.
- This applies to every 3-D view: the opening, the museum, the case and the end hall.
- **Coffin draw (41/44 s), not done in the film:** the same layered grip for that flat view is ready in a new file, `hiltflat53e.tsx`. Whoever owns `flat53s.tsx` needs to replace its grip path and its `HOOPS.map(…)` line with `<GripFlat53E M={M} kmm={kmm} id={id} />`.

**3. Title and mirror** (`display53k.tsx`, `take53.tsx`, `scene53d.tsx`)
- **Title:** it is etched on the front glass again, facing the camera, in front of the sword. At 9.6 s it is about 1215 px wide in the upper middle of the frame, with the sword below it. The slam on f285, the hold to 11.764 and the fade are unchanged (`master53.tsx` untouched).
- **Choice I made:** the v3 glass hood is only 115 mm tall, too low to carry a title that size at the 9.5 s framing. So I added a tall clear glass leaf on the hood's front pane, like v2's tall front glass. It fades in with the hood (6.6–8.4 s) and out as the orbit starts (11.7–12.5 s), so it only exists for the title and isn't in the end hall.
- **Mirror:** removed from the start hall, the title and the end hall. Nothing draws it any more; the old exports are kept so other files don't break.
- **Caption:** 「剑首 · 11道同心圆」 now sits below and to the right of the real pommel, with a thin leader to the pommel disc. It shows from 11.9 to 16.3 s.
- **16.3–20.8 s without the mirror:** the push to the pommel still reads; the rings are clearly in view at 17.5, 18.6, 19.5 and 20.5 s.

I also added `hilt53e.tsx`, a test-only composition (`Hilt53E`) with close-ups of the hilt; it isn't used by the film.

The self-check, with the frame-by-frame numbers and every still time, is at `tasks/ep53-fix-e/out/selfcheck.md`. All renders are under `/tmp/r53`; nothing rendered is in the repository.
