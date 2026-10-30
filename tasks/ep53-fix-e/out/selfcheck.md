# ep53 fix-e self-check
Start 07:53 UTC, last update about 08:15 UTC (2026-10-30). All stills were rendered under /tmp/r53 only. Nothing rendered went into the repo. The film renders.
Changed files: `take53.tsx`, `sword3d.tsx`, `display53k.tsx`, `scene53d.tsx`. New files: `hilt53e.tsx` (a QA composition `Hilt53E`, not part of the film) and `hiltflat53e.tsx` (`GripFlat53E`, see 2b). Running `tsc` gives no errors in qq53. Its only errors are old filename-case errors in qq45/qq46.

## 1. Hook camera (owner's note on the 5.6 s angle): done
- **`take53.tsx` `camAt`:**
  - The glide (Cartesian keys) is unchanged up to 4.2 s.
  - The spherical channels now start at 4.2 s and blend in over 4.2–5.1 s (before: 5.538–6.238 s).
  - New keys from 4.2 to 9.5 s: the camera rises off the blade and swings out to the front. It looks down at the guard and grip from about 37–42° above, 35–60° off the axis. The sword axis runs gently from lower left to upper right, and nothing points at the lens.
  - The camera then pulls back and up onto the whole sword. The whole sword is in frame from about 7.8 s and settled by 9.0 s.
  - The target moves from the guard to the middle of the sword. The principal point stays centred: the old CX swing to 1150 is gone.
- **What stays the same:**
  - The 9.5 s title framing and every move after it. The 9.5 s knots keep their old slopes (AL −6.543, LND 0.07107, BE −1.4954, the others 0).
  - The glide before 4.2 s. FF keeps its old slope of 107.84 at 4.4 s, so it doesn't change.
  - The guard-glass glint on 5.6605 s still lands on the guard, which is in frame.
- **Speed** (node harness, 15 points along the sword, on-screen points only):
  - The hilt moves ≤ 22 px/frame. Blade points at the frame edge reach about 27 px/frame.
  - Exception: for about 4 frames at 4.97–5.03 s, the blade directly under the lens leaves the lower-left corner at about 40 px/frame. The glide just before does the same.
- **Mean grey difference between frames** (consecutive frames f120–f288 at half scale, compared with v2 rendered from the stashed code):
  - Mean over f120–f210: v2 4.74, v3 about 3.7 (3.30 over f120–f288). Peaks: f285 = 14.3 (the planned title slam) and f167 = 9.0 (the subtitle change; v2 has 11.0 there).
  - f121–f127 (4.03–4.23 s) is still about 6, but that is the unchanged glide.
  - f128–f150 is 3.4–5.6 and f168–f200 is 2.8–4.1. That is above the ≤ 3 target but lower than v2 frame for frame (v2: 4.6–6.2 there). Every frame after 6.7 s is ≤ 3.3.
- **Stills checked:** 4.0, 4.4, 4.6, 4.8, 5.0, 5.2, 5.6 (full size), 6.2, 7.0, 8.0, 8.6, 9.0, 9.6 (full size).
- **Weak point:** 4.4–4.8 s is still the end of the glide, looking along the axis at the guard with the grip going away up the frame. The grip doesn't point at the lens, and from 5.0 s it is the three-quarter view.

## 2. Hoops and grip cord: done for every 3-D view; the coffin draw needs a one-line swap in a file that isn't mine
- **`sword3d.tsx` `Hilt3D`:**
  - The grip is split into three sections between the hoops. Sections and hoops are painted far to near along the axis, each as the convex hull of its two end circles, so the nearer grip section hides the back half of each hoop's end ring.
  - Each hoop is a solid band (R_HOOP over R_GRIP). The spot light shades it round the cylinder: lit top, shaded side, dark lower edge.
  - The hoop's end ring facing the camera has a gradient, a lit rim on the light side and a dark inner edge. There is a thin dark line along its two long silhouette edges and a thin curved contact shadow on the grip on either side.
  - The grip sections have a low-contrast wrapped cord: one helical groove per 2.4 mm, drawn only when it is ≥ 3 px per turn. I put it on all three sections, with the hoops sitting on the binding.
  - The pommel is unchanged.
- **Views covered:** hook, museum, case and end, because `take53` / `scene53d` / `hall53d` / `kf*` all draw `Sword3D`.
- **Checked:** 5.6 s (full size, zoomed in), 13 s, 104 s, 18.6 s and the four views of `Hilt53E`.
- **2b, coffin draw (41/44 s): not done in the film.** That grip is drawn by `flat53s.tsx` `SwordFlat`, which isn't my file.
  - I wrote the same layered build for the flat view: `hiltflat53e.tsx` `GripFlat53E` (hoop bands with a lit top edge, shaded side, dark lower edge, lit and dark end lines, a shadow on the grip, and the cord). It was checked against the current flat grip in `Hilt53E` frame 4.
  - **Change needed in flat53s.tsx:** replace its `<path d={grip} …/>` and the `HOOPS.map(…)` line with `<GripFlat53E M={M} kmm={kmm} id={id} />`, importing it from `./hiltflat53e`.

## 3. Title on the front glass, mirror removed, pommel caption: done
- **(a) Title, in `display53k.tsx`:**
  - New `TitleLeaf`: a tall clear glass leaf standing on the hood's front pane (y = HY0, full hood width, up to z = 1475 mm). It has a faint fill, a bright top edge and fainter sides.
  - `titleQuadOn` now puts the title on this leaf, facing the camera and in front of the sword. At 9.6 s the plaque frame is about 1215 px wide and the plaque is about 1180–1260 px wide. It sits in the upper middle (y ≈ 250–640) with the sword below it at y ≈ 745.
  - The slam on f285, the hold to 11.764 and the master's fade are unchanged (`master53` untouched). The title rides the glass as the camera backs off: about 1180 px at 10.5 s, about 1020 px at 11.5 s.
  - The leaf is drawn over the sword when the camera is in front of it (`DisplayFront` `leaf`) and under it from behind (`DisplayBack` `leaf`). It dissolves near the lens.
  - `take53` fades the leaf in with the hood (6.6–8.4 s) and out over 11.7–12.5 s as the orbit begins, so it exists only for the title. It is not drawn in the end hall.
  - Exports kept: `DTITLE_W/H/Y`, plus a new `DTITLE_Z`; `TITLE_C` is updated.
  - Reasoning: the v3 hood is only 115 mm tall, so it can't carry a large title in the upper middle of the 9.5 s frame without changing that framing. The leaf brings back the v2 look of a tall front glass just for the title.
- **(b) Mirror:**
  - `DisplayBack` no longer draws `PommelMirror`. The prop is still accepted but ignored, and the `PommelMirror` / `mirrorAt` exports are kept.
  - `scene53d` `CaseW` no longer draws it, and `take53` no longer passes it.
  - Checked gone at 7.0, 8.0, 9.0, 9.6, 13, 15, 96, 98, 100 and 104 s.
- **Caption:**
  - 「剑首 · 11道同心圆」 now sits below and to the right of the real pommel, with the thin gold leader of the existing Tag running to the pommel disc.
  - It shows 11.9–16.3 s (same fades as before), only while the pommel is on screen.
  - Checked at 12.0, 12.2, 12.4, 13 (full size) and 15 s; gone at 16.3 s.
- **16.3–20.8 s without the mirror:** the push to the pommel reads on its own. At 17.5 s and 18.6 s the pommel and its rings are in view, at 19.5 s the ringed face fills the right half, and at 20.5 s the full-frame rings are unchanged.

## 4. Still list
All checked: 4.0, 4.6, 5.2, 5.6, 6.2, 7.0, 8.0, 9.0, 9.6, 10.5, 11.5, 13, 15, 16.3, 18.6, 20.5, 41, 44, 96, 98, 100, 104 s, plus 4.4, 4.8, 5.0, 8.6, 12.0, 12.2, 12.4, 17.5 and 19.5 s. I also checked every frame from f120 to f288 (4.0–9.6 s) for jumps; results are in item 1.
41 s and 44 s are unchanged by this fix: they use `flat53s` (see 2b).
