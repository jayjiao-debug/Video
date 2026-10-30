# ep53 sword: self-check

Started 2026-10-30 06:59:54 UTC. All stills were rendered under /tmp/r53; nothing was rendered into the repo. `EP53` and `KF53B` typecheck clean, and the film renders at every time checked.

Files I changed (all on my list): `swordspec53s.tsx` (new), `flat53s.tsx` (new), `blooms53s.tsx` (new), `test53s.tsx` (new, a QA composition that is not in the film), `props53.tsx`, `sword3d.tsx`, `land53.tsx`, `face53.tsx` (unchanged, now used everywhere), `macro53.tsx`, `macrob53c.tsx`, `blade53c.tsx`, `macro53c.tsx`, `macro53d.tsx`, `kfF53.tsx` (Blooms11 and SP11, see item 3), and `take53.tsx` (sword code only, see item 2).

## 1. One accurate sword, everywhere: done (with notes for files that aren't mine, below)
- **One spec** in `swordspec53s.tsx`:
  - **Outline** `hwS(s)`: 55.6 cm overall. The blade is 44 mm wide at the guard, widest 50 mm (B2 「约5厘米」) about a third of the way from the guard, narrows to a 39 mm waist at 0.72, swells slightly to 40 mm, then ends in a sharp cosine point.
  - **Blade surface**: edge strips, a face height with the raised ridge, and `SwordPose`.
  - **ONE lattice constant `LAT`**: 20.5 × 11.8 mm diamonds, the outer and inner line widths, the pale (tin-rich) and gold fills, the dark core, and one jitter. Helpers `latCells` / `cellQuad` / `latCorner`.
  - **Guard**: the outline with the inverted V on the blade side, its thickness (9.4 → 7.6 mm, thicker than the grip and the ridge so both sit inside it), the inlay panels and cloisons. Blue glass is on the front face, turquoise on the back.
  - **Grip and pommel**: a round grip with **two hoops** (33 and 60 mm), and a pommel profile for a disc turned outward.
  - **Inscription**: 8 marks in **two columns of four** either side of the ridge, starting 22 mm in front of the blade base, heads toward the guard. The glyphs are abstract, as before.
- **Every renderer now reads the spec:**
  - `props53.Sword` and `blade53c.BladeFlat` both draw the new `flat53s.SwordFlat`. This covers the chamber, the inscription view, the paper test and TakeC.
  - `blade53c.MarkSet` uses the spec's places, glyphs and orientation. The old glyphs ran across the blade; they now run along it.
  - `sword3d` was rewritten. `Blade3D` is now `land53.BladeLand` (lit lattice, ridge, edge strips, and now the marks), clipped at the guard's V so the blade never pokes into the guard. `Guard3D` is the shared outline extruded, with back faces culled and the rest painted far to near. `Hilt3D` is the grip, hoops and pommel as surfaces of revolution, with silhouettes taken per station so they stay right when looking down the axis. The end face is `face53.PommelFace`. `Sword3D` paints the blade, guard and hilt in the order set by where the camera sits along the axis, so the grip can no longer be drawn over the guard.
  - TakeA's sword (`take53` SwordW) is now `Sword3D`. So is TakeD's case sword (`scene53d` already used it), and so is the kitchen glow (`end53d`).
  - `RingDisc` (the mirror image) now draws `PommelFace`: the same 11 rings.
  - `land53`, `macro53.BladeMacro`, `macrob53c.BladeMacroC`, `macro53c` and the KF11 / hand-off spec `SP11` are all on the same lattice, outline and face. The macro was 15 × 6.2 mm before, so its cells now have the same proportions as every other view, and the hush no longer morphs the lattice.
- **Inscription no longer vanishes or floats:**
  - It used to fade out at 62.0–63.6 s. Now the macro camera flies forward 102.5 mm (exactly 5 cells, so the pale/dark parity is kept) during M1, 62.6–65.4 s, and the marks slide out behind it.
  - From 65.4 s on, the macro shows the stretch past the inscription (`MACRO_S0`). Blooms and the M2 subject are anchored there.
  - Marks are now drawn on the face's real height everywhere: no floating.
- **QA sheet `test53s.tsx`** (composition TEST53S): the flat sword and the 3-D sword from straight above, at the same scale. They agree part for part (outline, guard, hoops, pommel, lattice pitch, marks). There are also three 3-D angles; none shows interpenetration.
- **Stills checked** (full size where it mattered): 1, 2, 2.7, 2.8, 3, 4, 4.6, 5, 5.5, 8, 9.6, 13, 18.6, 20.5, 20.8, 41, 44, 49, 54.8, 57.5, 59.6, 62.2, 62.5, 62.8, 63, 63.4, 64.2, 65, 66.2, 66.5, 67.5, 68.4, 69.5, 71, 73, 75.2, 75.8, 76.9, 78, 79.5, 81, 84.5, 87.5, 93.5, 97.5, 101, 103, 106.9. I also rendered the KF53B key frames 0–13.
- **Consecutive-frame scans**, every frame at half size:
  - 150–250 and 540–560: the only spike is the subtitle change at 166→167.
  - 2950–3100: the only spikes are subtitle changes at 2968 and 3069.
  - No sword pops when the part order switches.
- **The original code at the same frames:**
  - The glide moves fast, so frame-to-frame differences are high in both versions (mine 6.5–7.8, original 6.3–8.6).
  - The ring match at 618–628 measures exactly the same as the original.
- **Needed outside my files** (I did not edit these):
  1. `scene53d.tsx` (CaseW, about 97–101 s): the pommel mirror disc is painted over the hilt. Paint it before `Sword3D` when it is farther from the camera than the pommel (depth test on `proj(cm, mirror)[2]` against `proj(cm, pommel)[2]`), or move it off the axis line in screen space.
  2. `scene53c.tsx` (the sheathed sword, about 33–44 s): its hilt is still three rectangles built from `SW`: no hoops, no V guard, a box pommel. Draw `props53.Sword` with `marks={false}` under the sheath, or use the spec's `POM_PROF` / `HOOPS` / `GUARD_OUT`.
  3. `world53d.tsx` (coffin swords, 84–90 s) and `kfF53` KF12 `SwordInSheath`: the same simplified boxes. Their blade outline already follows the shared `bladeHW`.
  4. `inscr53c.tsx` hardcodes the mark centres as `SW.bladeA + 2.2 + n·1.5`, `±0.92` cm. These equal the new `markAt`, but it should import `markAt` from `blade53c`.
  5. `kfE53.tsx` KF08 (key frame only) still draws its own upright `birdMark` glyphs. It should use `MarkSet`.
  6. `take53` Museum at 8 s: the 「长55.6厘米 · 重875克」 tag sits on the mirror.

## 2. Hook "shine" (0:01–0:05): done
- **Cause**: `land53` drew the ridge with width `f·0.32 / (depth of the blade's middle)`. That swelled to about 50 px as the camera passed over the middle, which was the broad blurry white stripe.
- **Now** (`land53`):
  - The ridge is drawn per segment at its true width (at most 2.6 px). Its brightness is Blinn–Phong on both flanks of the crease.
  - The light is a point lamp low and ahead, `L_LAMP` in `take53`, so the highlight travels with the light, is brightest near it and falls off with distance.
  - The two lit inner edges of pale cells catch the lamp as crisp lines.
  - Up to 7 small four-point glints sit on the brightest pale (tin-rich) cells.
  - The cells themselves keep only a low sheen. There is no broad wash.
- **[亮] on 2.707**: the lamp flares on the ridge, rims and glints at that spot and dies away over 0.22 s, with a small star (8–18 px, was 34 px) sitting on the ridge.
- **Checked**: stills 1, 2, 2.7, 2.8, 3, 4, 4.6, 5; frames 76–92 and 118–126 one by one (no added jumps compared with the original).

## 3. Rust blooms (1:15–1:21): done
- **New `blooms53s.BloomsS`**, now the only bloom renderer. `macro53d.BloomsD` and `kfF53.Blooms11` both call it.
  - Each bloom is anchored to a lattice cell (p, q) plus an offset inside it.
  - Every point of the bloom (dull patch, stain, olive crust, specks, find-ring) lies on `macro53.macroZ` and goes through the lattice's camera inside BladeMacro's rotated group, fogged with the cells' fog.
  - Soft edges are stacked blobs in world units. The ring's 18 dashes and its line width are world lengths. There are no screen-space blurs.
  - The blooms no longer shrink in world size; they get small because the camera pulls out.
  - The portal's `ringEllipse` uses the same ring.
- **Kept**: bloom 1 on f2255 (75.162), bloom 2 on 75.728, bloom 3 on 76.860; small (crust 1.45–1.7 mm) and olive.
- **Hand-off**:
  - Frames 2229–2254 are identical in the picture (y > 420): 0.00 on every frame.
  - 2254 → 2255 differs in the picture only by bloom 1 (0.61 mean, a diff image was checked).
  - The full-frame values (2.55 at 2232→2233, 2.04 at 2254→2255) come only from subtitle and stamp changes drawn by `master53`.
  - The dull patch now comes with its own bloom, and the warm veil eases in after f2255 instead of popping on it.
- **kfF53**: `SP11` now uses the shared outline, face and `s0`. The blooms must lie on exactly the surface the hand-off draws, so this is "what Blooms11 needs". The old bloom helpers in kfF53 were removed.
- **Checked**: stills 75.2, 75.8, 76.9, 78, 79.5, 81; frames 2226–2258 and 2260–2266.

## 4. M2 (1:06–1:10): done
- **One pale diamond is the subject** (cell p 12, q 2; u 30.75 mm).
  - The camera holds it at (960, 770), the lower middle third. This is solved each frame on the original move, eased in over 65.3–66.3 and eased out with the hush, so 74.3 still lands on KF11.
  - `BladeMacroC focus` lights it and keeps it sharp. The rest of the lattice darkens with distance from it (light falloff) and goes soft in depth through two depth-of-field groups. There is no hard vignette.
  - Its rim catches the light as crisp lines, with one small glint.
- **Section cut**: the far wall runs 3.5 mm in front of the subject's centre, so the cut opens on it. The wall shows the tin skin under the pale diamond and bare bronze under its dark neighbours.
- **Tags** sit beside the subject, level with each other, with thin gold leaders: 「镀铬？」 on the left, pointing at the diamond; 「热镀锡 · 2025研究」 on the right, pointing at the skin once the cut is open. 「镀铬？」 is never struck through or mocked; it only drifts 60 px left and fades from 68.7 s.
- **Hits kept**: 66.105 「镀铬？」 returns, 67.237 the cut opens, 68.369 「热镀锡」 lands.
- **70.1 → 74.412**: continuous into `HandoffMacro`. The picture of frames 2229–2254 differs by 0.00, under the 0.3 limit.
- **Checked**: stills 66.2, 66.5, 67.5, 68.4, 69.5, 71, 73; frames 1972–1984, 2015–2022, 2033–2037, 2050–2053, 2128–2134 and 2168–2172. The only jumps are the planned hits. The hush is now smoother than in the original (about 4 per frame against about 9), because the lattice no longer morphs.

## Known limits
- From the blade side, the grip hoops read as thin rings, which is physically right for a raised band seen along its axis. They are clearer from the side.
- Mark size and contrast (12.5 mm marks, ink at 85 %) are my reading of the reference ("清晰可见"). Lower `MARK_H` or the opacity in `swordspec53s` / `land53` if the owner wants them quieter.
