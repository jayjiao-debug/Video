# ep53 v3 「越王勾践剑 / 真的没锈吗？」: final picture review

Reviewer: independent, 2026-10-30. Review only, nothing edited. Composition `EP53V3` (4360 f, 145.333 s) as built on branch
`api-task/ep53-v3-review`.

**What I rendered (all in /tmp, nothing committed):** 218 stills, made up of one every 1.0 s from 0.2 to 145.2, every line start + 0.6 s,
and every hit in `MUSIC_NOTES_v3.md` (+0.05 s). Plus the three frames around each of the six hand-offs (f624–626, 1168–1170,
1558–1560, 2781–2783, 3319–3321, 3341–3343) with per-region pixel diffs, and a quarter-scale video of the whole film for a jump scan.
I looked at all 218 stills on contact sheets and zoomed to full size wherever something looked wrong.

## Verdict: **FIX FIRST**

Most of the film is now good. The furniture is consistent, the sword is drawn from one spec in every leg I checked, the 勾践 thread
uses the same lattice and marks as the inscription view, and every factcheck item has been fixed. One fact error remains on screen,
and two of the owner's own notes are not met yet. Each of the three can be fixed in under an hour.

## The three worst problems

1. **BLOCKER: in the second chamber the sword lies on the occupant's RIGHT (117.6–126 s).** The head is at screen right and the
   coffin is seen from above, but the sheath lies on the *far* side of the skeleton (screen top, 120.5 s). In the first chamber
   (36.7 s) it lies on the near side (screen bottom), which is the occupant's left. So the picture contradicts line D3
   「墓主人左边」, the stamp 「内棺 · 人骨架左侧」 and the tag 「剑在墓主人左侧」, and the sword switches sides between the two visits.
   `world53d.tsx` says "+y = the occupant's left", which is true in its world coordinates. But the camera/projection there shows the
   world mirrored (head toward −x appears at screen right), so on screen +y reads as the right side.
2. **MAJOR: the owner's 0:03 note is still open: a white ridge stripe and no real specular at 「[亮]」 (1.5–5.5 s).** At 2.8 s the
   ridge is a bright white hairline with small cross-sparkles. There is no broad soft lobe on the pale diamonds. The storyboard asked
   for "a gold crease, not a white stripe" and "a REAL specular highlight".
3. **MAJOR: the second-chamber evidence beat looks cheap and does not make its point (122.1–125.5 s).** The tomb's three other swords
   are flat gold side views with glow halos. They hover in mid-air against the back wall of the 椁, with no floor, contact or shadow.
   Meanwhile the hero sits dim at the bottom edge, half hidden by the coffin wall. The storyboard says "this sword the brightest".
   The viewer sees floating daggers, not "other swords in the same tomb, also unrusted".

## Ranked fix list

Times are film seconds. "Owner" is the file, following the routing in `EP53V3.tsx`.

| # | Sev | Time | Owner | What is wrong | Fix |
|---|---|---|---|---|---|
| 1 | **BLOCKER** | 117.6–126.1 (T3, E1; also visible small in L1 to 129.6) | `world53d.tsx` (`SYA`, `swAt`, knife position) via `take53d3` | Sheath and sword lie on the far side of the skeleton, i.e. on the occupant's **right** on screen. The first chamber (`chamber53b3`, 36.2–38.3) has them on the near side (left) ✓. The line, stamp and tag all say left. | Root cause: `chamber53b3`/`scene53c` and `world53d` use the same world layout (head −x, sword +y = left). Chamber 1's top-down camera is a proper view (screen-right −x × screen-down +y = −z, looking down), but TakeD3's camera in `world53d` gives a **mirror image** (screen-right −x × screen-down ≈ −y = +z, so it would have to be looking up, yet we see the coffin from above). Either un-mirror that camera (better: it also fixes any lettering or asymmetric props there). In that case also turn the occupant, sword and knife end for end (head toward +x, sword at `YC − 0.2`) so the head and hilt stay screen-right. Or do the quick fix: put the sword on the camera side of the skeleton, so on screen it is where it is at 36.7: `SYA = YC − 0.2` (now `YC + 0.2`). Move the bronze knife to the same side, between the sheath and the arm, as at 37.5 (y ≈ `YC − 0.12`). Keep the hilt screen-right. The rewind path (`swAt`) and the L1 leader 「剑鞘」 follow from `SYA`. Check 119.2–121.2 to make sure the inner coffin's near wall top does not hide the sheath; if it does, use `YC − 0.15` or raise the T3 camera 5 cm. Re-check that the hilt stays at the pelvis. |
| 2 | MAJOR | 1.5–5.5 (peak 2.707) | `take53` → `land53.tsx` (`BladeLand`) | Ridge = 1–2 px **white** line along the whole blade, plus small "+" sparkles. No broad specular lobe on the pale (tin) diamonds. Owner note 0:03 not answered. | Ridge stroke `METAL.lit` gold, 1.5 px, going to `METAL.hi` only inside the lobe. Add the lobe: a soft elliptical highlight about 460 × 170 px, centred on the pale cells about 2–3 diamonds ahead of the lens (≈ x 960, y 640 at 2.707). Clip it to the pale cells only (the dark lattice breaks it), peak at 2.707 (in over 0.25 s, out over 0.8 s). Thin bright line on the edge strips only. Drop the "+" sparkles. |
| 3 | MAJOR | 122.1–125.5 (E1) | `world53d.tsx` (`OTHERS`, `OtherSword`, `Chamber`) | Other swords hover in mid-air against the 椁's back wall: flat side views, glow halos, no floor, no shadow. The hero is dimmer than they are and half hidden by the coffin wall at the bottom edge. | Lay the three swords on a visible 椁 floor (side compartment), foreshortened by the same camera, each with a contact shadow and a `Pool` (a ≈ 0.18) under it instead of a halo. Draw the floor boards as a lit plane so the support reads. Light level of the others ≤ 0.6 × hero. Frame E1 so the hero (sheath + guard) is fully in shot with a `Pool` a ≈ 0.3 under it: tilt the camera down about 6° or start the arc 0.3 s later. |
| 4 | MAJOR | 35.6–36.5 | `chamber53b3.tsx` (`SafeTag` 「②内棺」, line 239) | The 56 px tag 「②内棺」 is drawn **on top of the J seal**: the seal sits over 「棺」 at 36.2. | Clamp every tag box out of the seal zone (x ≥ 1663 and y ≥ 887, the seal plus its halo) and out of the depth-tag zone (x ≤ 520, y ≥ 940). Simplest fix: anchor 「②内棺」 at the lid's top-left corner, or cap its right edge at x 1600 and its baseline at y 860. |
| 5 | MAJOR | 34.9–36.0 | `chamber53b3.tsx` (the lid lifters / `Digger`) | In a **top-down** shot, the two lid lifters are drawn as side-profile walking legs, cut at the waist and as tall as the coffin is wide. They read as giants standing in the coffin. Wrong projection, and cheap. | Either draw them top-down (heads, shoulders and arms reaching to the lid edge, foreshortened, Figure4 fill) or keep the bodies out of frame and show only the two gloved hands gripping the lid's long edges as it lifts. |
| 6 | MAJOR | 51.954–92.709 (the 勾践 thread), worst 82–87 | `shadow53g.tsx` (vignettes), `take53g.tsx` (lattice over reflection), `cam53g.ts` | The story only reads through the subtitles. Figures are about 90–130 px tall on a 1080 frame. The lattice runs at near full contrast across the reflection (storyboard: about 20 %), and the ridge highlight cuts through the heads (75.2). In G7 (82–87) the advancing ranks ghost into a blur, and the "fallen cap and dropped sword" reads as an anvil. | Inside each vignette's glow, fade the lattice over the reflection to 20–25 % opacity, and keep it full outside. Scale the vignettes ×1.3 (or lower the glide 15 %) so the figures are about 150 px. Keep the heads below the ridge line. G7: no motion blur or double exposure on the ranks; step them on the beat. Make the cap a clear 冕 board shape with the sword lying next to it, both at least 60 px, on a lit patch. |
| 7 | MAJOR | 125.5–129.6 (L1) | `world53d.tsx` (`Pit`, layer fills) | 126.1–127.3: the right ~30 % of the frame is a flat **black** wedge (it reads as an unrendered hole). 128.0–128.9: 白膏泥 is a flat pale grey field over about 55 % of the frame, the brightest thing in shot, so the sword is lost. | Fill the right wedge with the section's soil face (五花土 texture, the same as the dig) or swing the camera 8° so it leaves the frame. Tone 白膏泥 down to about `#8E877A` (value ≤ 55 %) with a light speckle, and vignette the frame edges, so the warm sword glow stays the brightest point. |
| 8 | MAJOR | 130.9–140.8 | `take53d3.tsx` / `scene53d.tsx` (the `Glint` on the display sword) | A 4-point star sparkle sits on the guard during 「出了墓…也挡不住它慢慢[变暗]」 (132.2, 133.2), then on the blade through P1. A twinkle on the word "dulls" contradicts the line and looks like stock lens flare. | No star from 130.069 to 134.031. Show the dulling instead: specular −25 % and the faint olive spot (already at 135.2) by 133.0. In the kitchen keep only the frame-0 glint (the same size and place as at 0.2). |
| 9 | MINOR | 38.933 → 38.967 (f1168 → f1169, the draw) | `chamber53b3.tsx` end state vs v2 `TakeC`/`Chamber53` | Colour pop at the TakeB3 → TakeC hand-off: the coffin wall band across the top third turns from `#352113` to `#4D281C` in one frame (mean diff in that band R 17 / G 8.5; the frame after is 0.4). Everything else matches. | Give chamber53b3's inner-coffin wall `Chamber53`'s colour and light by 38.6, or ease it over 38.3–38.93. A warm pop is not the storyboard's "cold flash". |
| 10 | MINOR | 88.2–92.7 (G8) | `cam53g.ts` / `take53g.tsx` | 「还亮着」 lands on a thin blade sliver (about 13 % of frame height) with ~60 % of the frame empty dark. The promised specular lobe never returns. | Keep the blade at ≥ 30 % of frame height until 91.5 and bring back a soft lobe on 「还亮着」 (~89.8). Then rise into the hand-off view. |
| 11 | MINOR | 100.07–102.2 (M1) | `macro53c.tsx` (v2 TakeC tag) + `master53v3` tiles | The same facts appear twice: the tag 「铜 · 锡 约18–20% · 铅 ≈ 0」 and the Cu/Pb tiles (Pb "≈ 0"). The tag's 「铅 ≈ 0」 runs into the Cu tile. (Continuity item, still open.) | From 100.068 cut the tag's second row to 「锡 约18–20%」 under 「原因之一：料好」, and let the tiles carry Cu and Pb ≈ 0. |
| 12 | MINOR | 95.5–95.7 (the slice) | `paper53c.tsx` | On the cut the whole blade bleaches to a translucent white ghost and a large 4-point star appears. It reads as a cheap flash, and the lattice vanishes. | Keep the blade drawn. Put the flash on one thin bright line along the edge at the paper contact, ≤ 3 frames, no star. |
| 13 | MINOR | 12.0–16.3 | `take53.tsx` (pommel tag) | The tag 「剑首 · 11道同心圆」 (about 26 px, unreadable on a phone) points at the pommel during 「如今它在湖北省博物馆…」. The 11 rings themselves fill the frame at 19.3–20.8 with no label. | Move the tag to the ring close-up at 19.3–20.7, at 44 px (the label size), clear of the Cr tile. |
| 14 | MINOR | 18.9–19.6 | `sword3d.tsx` (`Guard3D`) | Seen from the pommel side, the guard is a plain gold box: no glass and no cloisons on the face toward the camera. | Draw the back face with the turquoise inlay and cloisons, the same as the front. |
| 15 | MINOR | 57.05–58.3, 87.05–89.0 | `master53v3.tsx` (`stampAt53v3`) | At G2 and G8 the stamp drops to the year alone (or to nothing) for 1.2–2 s before retyping. It flickers more than in the rest of the film. | Hold the previous place and note until the new ones type (the samePlace/sameNote path), instead of clearing at the line start. |

Checked and OK: the title on the glass (9.5–11.7) · stamp 2026 → 1965 roll and press · the depth tag (0.0 hold, 0.7 → 10.3 → 10.8 by
34.4, 10.8 → 1.3 → 0.0 on the surface, gone by 130.6) · first chamber: skeleton, the sheath on its left at the hip, the 铜削, the tag
「剑在墓主人左侧」 · the wash and the draw (hilt screen-right) · 8 marks in two columns of four, identical from the draw through the 勾践
thread to the paper test · Cr tile at 18.6 and the M2 tiles in one zone (y 790) · blooms on the surface on 111.389 / 111.955 / 113.087 ·
the find-ring opens to the sheath (no red disc) · L1 labels in the right order on the beats · R2 floor → hall → display · the kitchen
bookend now matches frame 0's framing, with no window rectangle · end card: J, title, question, pill, two-row sources · seal halo.
Hand-offs: 20.821 (moving camera, no jump), 51.954 and 92.709 (diff equal to normal motion, no jump), 110.639 → still (0.0 diff),
111.389 (only the blooms and the subtitle change). The only pop is the draw (#9).
Jump scan over the whole quarter-scale video (frame-to-frame mean difference of the picture band against its ±6-frame median, flag at > 3×):
only three single-frame jumps in 4360 frames. 9.500 is the title slam (intended), 38.967 is the draw pop (#9), and 95.533 is the
slice flash (#12, intended hit, but see the fix).

## Earlier reviews: what is fixed now

### `continuity.md`

| Item | Status in v3 | Evidence |
|---|---|---|
| 1. Second chamber: primitive flat sword, mirrored, no skeleton | **Fixed in drawing, new error in placement**: Sword3D with lattice and blue guard in the sheath, hilt screen-right, skeleton and knife present. But the sword is now on the occupant's right (fix #1) | 118.2, 120.5 |
| 2. 勾践 thread drawn by a separate renderer (plaid lattice, kfE glyphs) | **Fixed**: TakeG uses `blade53c.BladeFlat` + `MarkSet`. Lattice and marks are identical to 51.2 | 53.2, 54.2, 92.2 |
| 3. Two incompatible tombs; red interiors; no 铜削 | **Mostly fixed**: one set of dimensions (`world53d` header = `scene53c`), gold edges and red inset line in both, 铜削 in both. Both inner coffins are still a strong red-brown inside (`#46201A`); consistent, acceptable | 36.7, 120.5 |
| 4. Other swords with blue guards | **Fixed** (bronze guards). New problem: they float (fix #3) | 124.2 |
| 5. Display rim/halo at the end; kitchen window; framing ≠ frame 0 | **Fixed** (no rim, no window, framing matches). New: star glint during 「变暗」 (fix #8) | 132.2, 138.2 vs 0.2 |
| Ridge: white hairline (land53) | **Not fixed** (fix #2) | 2.8 |
| Sword on the skeleton's upper arm (first chamber) | **Fixed**: beside the body, hilt at the hip | 36.7 |
| Sheath soil blobs too big and pale | **Fixed**: smaller, darker spots; it reads as black lacquer | 37.5 |
| Match 4 portal = red disc | **Fixed**: a thin gold find-ring widens onto the sheath | 117.2 |
| Tag 「剑在墓主人左侧」 missing | **Fixed** (56 px with a leader) | 36.7, 37.2 |
| Tag sizes (three sizes) | Partly: 「②内棺」 is now 56 px but sits on the seal (fix #4). The pommel tag is still tiny (fix #13) | 36.2, 12.4 |
| Seal disappears on bright frames | **Fixed** (soft dark halo) | 53–92, 100 |
| Element tiles on one row | **Fixed** (one zone, y 790, slots L/R; Cr in slot L both times) | 18.6, 100.2, 104.6 |
| M1 text tag duplicates the tiles | **Not fixed** (fix #11) | 100.2 |
| Title leaf showing in the wide hall shot | **Fixed**: gone by 12.2 | 12.2 |
| Lid lifters' colour | Moot: the lifters now have a projection problem (fix #5) | 35.6 |
| Grey-cool veil in the hush / T1 | Looks warm enough at 107–116; not a problem now | 109.2, 114.2 |
| Visitors translucent | Not re-checked at full size; they read as dark silhouettes at phone size | 13.2, 130.7 |

### `factcheck.md`

| Item | Status | Evidence |
|---|---|---|
| MUST 1: G2 envoy alone before 夫差, no 勾践, no wife | **Fixed** | 57.6–61.2 |
| MUST 2: end-card sources incl. 《左传》《国语》《史记》 | **Fixed**, word for word as proposed | 141.4–145 |
| SHOULD 3: the gall placed on a stand at his seat, not hung | **Fixed** (a pear-shaped gall on a tall stand; he leans to it) | 74.2–77.2 |
| SHOULD 4: G3 「吴国怕要变成沼泽」 | **Fixed** in the subtitle | 63.2 |
| SHOULD 5: 勾践 on foot ahead of the horses, chariot | **Fixed** | 68.2–71.2 |
| Note: 夫差's death, no rope or blade on a throat | OK (a fallen cap and a sword only) | 84.3 |
| Note: other swords, 2–4, not a rack | OK (3) | 124.2 |
| Sword on the occupant's left (A9) | **OK in chamber 1, WRONG in chamber 2** (fix #1) | 36.7 vs 120.5 |
| Stamps (55.6 cm / 875 g, 1965 → 望山1号墓, 1966 letters, 前494 / 前473, 1977 《古剑》, 江旭东, 2017–2025, 后德俊) | As in the fact check ✓ | 7.2, 26.2, 49.2, 54.2, 83.2, 94.2, 99.2, 104.2, 113.1, 119.2, 132.2 |
