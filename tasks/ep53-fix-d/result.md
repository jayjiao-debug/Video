I fixed seven of the eight items for TakeD; item 3 (the 80.2–81.95 wipe) only partly, using the brief's fallback. The two blockers are gone. I checked everything by rendering stills and consecutive frames and comparing them with PIL.

- **1 (95.5 s cut):** done. The camera now rises through the fill and crosses z = 0 at 95.4 with the hall and case already visible above the cut edge. Frame diff at the crossing is 2.0–2.4, against 15.8 before.
- **2 (luma pop at 107.97):** done. The blend-mode switch is replaced by one normal-mode kitchen layer, and luma now changes by at most 0.9 per frame from 107.0 to 109.1. The picture holds still from 107.9 to 109.125.
- **3 (disc wipe 80.2–81.95):** partly. I did not build the camera pull-out. The first bloom's cream find-ring is tracked from 75.162, and from 80.3 a soft-edged dissolve (feather over 120 px) opens on that ring into the tomb world. It is still a transition, with a peak diff of about 4.7 per frame.
- **5 (blooms):** done. Sized ×2.5 (about 150 px for the first at f2255), with a rust-brown rim, olive halo, 4.2 px find-ring and a pulse on each new bloom. Three blooms only.
- **8 (case 95.6–99):** done.
  - The case is the same lit hall as at the start of the film, with no grid anywhere.
  - Case ≥ 35 % of frame height from 95.6. The sword is about 29 % of frame width at 96.0 and 32–35 % from 96.3 to 101 (measured by eye on stills).
  - The grey rectangle is now a small lit panel. The glass is crossed at about 100.6, over a second earlier than before.
  - The case sword gets a 2 px `#FFF3CF` rim and a soft glow.
- **7 (coffin 83.2–91):** done. The coffin is about 55 % of frame width, the other swords are at real 55 cm scale with a 2 px `#F4D088` rim, and the 勾践 sword stays brightest. At that coffin size the sword inside is only about 11 % of the frame width.
- **19 (closing pull-out):** done. The cleaver is redrawn tapered with a wooden handle. A night window now sits behind the sword so it reads as a glow in a window.

**Loop closure:** the end frame is close to frame 0 but not identical, so it does not match exactly. Frame 0 still uses `Cleaver` from `kfA53.tsx`, which I don't own. My version has the same footprint and camera, with a slightly stronger taper and a longer handle. The window exists only at the end. To match exactly, TakeA would import `CleaverD` from `end53d.tsx`.

**Not done:**
- **Frames 3050–3100 (101.7–103.4):** the lattice close-up and back-out still move more than 25 px per frame. The old code measured the same 3–8.5 diff there, and it wasn't an assigned item.
- **Subtitle step at 108.0:** the one remaining luma step comes from the subtitle leaving. That is in `master53.tsx`, not mine.

**New in the repo:**
- `hall53d.tsx` is a new helper file.
- I changed `take53d.tsx`, `macro53d.tsx`, `world53d.tsx`, `scene53d.tsx` and `end53d.tsx`.
- Nothing is committed and no renders are in the repo.

The self-check with per-item details and numbers is `tasks/ep53-fix-d/out/selfcheck.md`.
