# ep53 越王勾践剑 v3: continuity review (场记)

Scope: review only, nothing edited. I rendered all 33 `KFV3` key frames (KF index 0–32, "leg" = the storyboard leg number), plus
76 `EP53` stills every 1.5 s from 0.3 to 112.8 s, plus extra stills at 40.0, 44.6, 45.0, 81.7, 82.1, 82.4 and 83.2 s. I compared
full-size crops and read the drawing code. Times are **v2 film seconds** (EP53) unless marked KF. Renders are in /tmp only; no
images are committed.

How the KF list maps to the film: KF 0–12 and 21–32 are the v2 picture (`V2Pic`) at the v2 time given in `kfH53.tsx`. Only
KF 13–20 (the 勾践 thread, `kfG53.tsx`) are new pictures. So the inconsistencies below are in the film as built, except the 勾践
thread, which only exists in the KF frames.

## Verdict

**Not consistent yet.** The museum, the dive, the draw, the inscription, the paper test and the macro legs all draw the sword from
the one spec (`swordspec53s`), so the hero matches itself there. **Two scene blocks fall outside that system and break the sword
badly:** the second chamber (82–95 s, legs 17–19, KF 27–29), where `world53d.tsx` draws a different, primitive sword, sheath and
coffins, mirror-flipped and with no skeleton; and the new 勾践 thread (KF 13–20), where `kfG53.tsx` draws its own lattice and its
own inscription glyphs. The furniture (subtitles, stamp, seal, depth tag) is consistent.

## The five worst inconsistencies

1. **Second chamber (81.7–95 s; KF 27 T3, 28 E1, 29 L1): a different sword, a different sheath, and the shot is mirrored.**
   `world53d.tsx` `SwordSheath` draws the hero as a flat yellow lozenge (`#F2C878`, with a glow): no lattice, no ridge, no marks.
   The guard is a plain blue rectangle (no cloisons), the grip is a flat bar with no hoops, and the pommel is a thin T with no disc.
   The sheath is a brown lozenge with a bright cream outline and a gold halo, but no soil spots and no red pin-lines. The hilt
   points **screen-left**, while in the draw it points screen-right (40.8, 43.8, 44.6 s: sheath left, hilt right). So the
   「倒带：剑回鞘」 rewind plays as a mirror image of the draw, not as the draw run backwards. **The skeleton is missing**, though
   the storyboard asks for "the same art as leg 10".
2. **The 勾践 thread blade (KF 13–20) is drawn by a separate renderer.** The lattice in `kfG53.LatticeOver` has no corner jitter,
   draws its lines across whole rows (so it reads as plaid, with doubled lines where rows cross), and fills the pale diamonds with
   `PALE #FFF0CC` at 16 % instead of `LAT.pale/paleHi`. The 8 marks use `kfE53.birdGlyph` (round head circles, strokes 0.85 mm
   thick, 14.2 mm tall) instead of the spec's `birdScript` (12.5 mm). So **the inscription changes shape between KF 12 (47.8, the
   spec glyphs) and KF 13 (50.5, the kfE glyphs, very large on screen)**. This is the cut where the viewer is looking hardest at
   those marks.
3. **Two incompatible tombs.** First chamber (`scene53c.tsx`, 36–47 s, KF 9–10): outer coffin 2.12 × 0.84 m, inner 1.80 × 0.60 m,
   room about 3.2 × 2.3 m; dark-brown lids with gold edges and a red inset line; warm brown interior; a large bone-cream
   skeleton. Second chamber (`world53d.tsx`, 82–95 s): 椁 5.0 × 2.6 m, outer 2.64 × 0.88 m, inner 2.24 × 0.62 m; near-black
   boxes with **oxblood-red interiors** (`#3A140D`, `#2E100B`) that fill half the frame, which also breaks style B; no skeleton. The
   header comment in `world53d.tsx` says the outer coffin is 2.64 × **1.04** m and the inner 2.24 × **0.86** m, so even that file
   disagrees with itself. **The 铜削 (bronze knife) that facts A9 places beside the sword is not drawn in either chamber.**
4. **The tomb's other swords (E1, 86.5–90 s, KF 28) carry the hero's blue glass.** `OtherSword` tints their guards toward
   `#4A8CD8`. Blue glass belongs to this one sword (B5), and it is one of the film's only two saturated colours. With the hero also
   reduced to a flat gold stick (item 1), the hero and the ordinary swords now differ only by their glow, which weakens the
   film's logic beat (E11).
5. **At the end the sword is brighter than at the start, though the line says it has dulled (95.8–101.4 s, KF 30).**
   `scene53d.CaseW` adds a 2 px cream outline and a 16 px gold halo round the blade (`rim`). The opening museum shots never have
   them (compare 7.8 and 99.3). They fade out at 100.4–101.4, which works against the storyboard's "the gleam dulls a shade" on
   「出土时是亮的，如今没那么亮了」. The kitchen bookend does not rhyme either: the last kitchen (106.8–113 s) is framed wider than
   frame 0, and its sword sits inside a thin rectangle with cross lines (the KitchenEnd "window"). Frame 0 has no such rectangle.

## Tables per element

### 1. The sword

| Appearance | What it looks like | Inconsistency | File | Fix |
|---|---|---|---|---|
| 0.3 (KF 0), far glint in the kitchen | small 3-D sword in a warm halo, lattice visible, guard blue | none; the reference for the bookend | take53 → sword3d | none |
| 1.8–3.3 (KF 1), the glide | land53 lattice: cream pale diamonds, dark cores, jittered; **the ridge is a white hairline** | the ridge is white here, a cream line in the flat views, a wide soft band in the G thread and white lines in the macro: four different ridges | land53 `BladeLand` | one ridge for all renderers: a thin gold crease (`METAL.lit`, highlight `METAL.hi` only inside the specular lobe), as the v3 storyboard asks |
| 4.8, over the guard | guard blue glass with gold cloisons, hoops, disc | none | sword3d | — |
| 6.3–16.8 (KF 2–5), on the display | 3-D sword, two rests, marks faint, no rim | reference for the 3-D sword | sword3d `Sword3D` | — |
| 18.3–21.3 (KF 5), the pommel | 11 grooves + boss + rim (I counted 13 dark bands on a scan line = boss outline + 11 grooves + edge) | none: **exactly 11 rings** ✓ | face53 `PommelFace` | — |
| 36–40 s (KF 9), in the sheath | flat spec sword (`props53.Sword` → flat53s): guard with cloisons, 2 hoops, disc | lies **on top of the skeleton's upper arm**, hilt at the shoulder (storyboard: beside the body, hilt by the hip). It is on the occupant's correct side (screen top = the occupant's left when the head is at screen right) | scene53c `Occupant`, cam53c `swordAt` | move the sword about 8 cm toward the coffin wall, off the humerus, and slide it so the guard is level with the pelvis |
| 43.8–56.5 (KF 10–12), the draw and the inscription | flat53s: small jittered lattice, the half beyond the ridge darker, cream ridge line, 8 spec marks in two columns of four | reference for the flat views | flat53s / blade53c / inscr53c | — |
| **KF 13–20, the 勾践 thread** | **plaid lattice, no jitter, thick lines; kfE glyphs 14.2 mm, thick strokes; ridge a wide soft band** | lattice style, glyph shape, glyph size and ridge all differ from KF 12 | kfG53 `LatticeOver`, `Mark`, `bladePath` | rebuild the panel from the spec: cells from `latCells` + `cellQuad` (the jitter), colours `LAT.ink/pale/paleHi/paleOp`, line weight `LAT.line`; marks via `markAt` + `birdScript(markSeed)` × `MARK_K` (12.5 mm). Keep the reflection overlay at ~20 % on top of that |
| 57.3–61.6 (KF 21), paper test | flat sword, guard blue, lattice OK | none | paper53c | — |
| 61.8–75.2 (KF 22–24), macro M1–M3 | macro53 lattice, thick dark ink, a lit pale diamond | the pale cells cool down to grey-white (`#C2B499`, `#8F7E63`, against `#D9BA85` in the flat views). The "duller" veil (kfF53/macro53d) is motivated in T1/T2, but it already looks grey in the hush | macro53, kfF53 veil | tint the veil warm (`#5A4630` at the same opacity, not grey) so the bronze stays gold; no veil before 101.25 v3 |
| 75.2–81.9 (KF 25–26), blooms | blooms drawn on the surface, find-rings | none between appearances | blooms53s | — |
| **81.7–95 (KF 27–29), second chamber** | **flat gold lozenge, rectangular blue guard, T-pommel, no lattice, mirrored** | see worst #1 | world53d `SwordSheath` | draw the sword with `Sword3D` (`sword3d.tsx`) in the world (pose `x0 = SX0·1000`, `dir` chosen so the hilt points screen-right as at 43.8), the sheath as in scene53c, keep the glow only as a Pool *under* it. When it is very small, `Sword3D`'s lattice simply goes to texture, as on the display |
| 86.5–90, the other swords (KF 28) | gold sticks, **blue guards** | see worst #4 | world53d `OtherSword` | guard mix toward `BZ.dark`/`BZ.mid`, never blue; keep them a shade dimmer than the hero (they already light at 0.6) |
| 95.8–101.4 (KF 30), back on the display | Sword3D + **cream outline + gold halo** | see worst #5 | scene53d `CaseW` (`rim`) | drop `rim` (or keep it ≤ 0.2 and only before 95.8, as the "lift" out of the tomb); dulling = `dull` only |
| 102.3, close-up of the guard | blue glass and cloisons, disc pommel | none | sword3d | — |
| 106.8–113 (KF 31–32), the kitchen glow / end card | blurred sword inside a thin rectangle with cross lines | the rectangle exists only at the end; the framing ≠ frame 0 | end53d `KitchenEnd` (the `wn` window quad) | remove the window strokes, or add the same window to frame 0; land the end camera on frame 0's framing (`CAM0` at 0.0) so the bookend rhymes |
| Guard faces, everywhere | always the front (blue) face toward the camera | consistent; turquoise is never seen | sword3d `Guard3D` | optional: show the turquoise face once, in the draw (the hand turns the sword) |

### 2. The black lacquer sheath

| Appearance | What it looks like | Inconsistency | File | Fix |
|---|---|---|---|---|
| 39.3–42.3 (KF 9), in the coffin | near-black `#0A0605`, two red pin-lines `#7A2A1A`, a dark mouth band, **9 large beige soil blobs** (`#6A5236`, 85 %) | the blobs are so large and pale that the sheath reads as spotted, not black lacquer | scene53c `Sheath` (`dirt`) | halve the blob radius and drop them to 45 %, colour `#4A3826`, so "black lacquer" still reads |
| 42.3–45 (KF 10), washed and drawn | black, wet streak, red lines | reference | scene53c | — |
| 81.3, Match 4: the "mouth" | the find-ring grows into a **dark red disc** | a sheath mouth is a flat lens-shaped slot, not a red circle, and nothing like it appears on the sheath anywhere else | macro53d (the portal) | make the portal the sheath's lens-shaped mouth: black lacquer with a red pin-line rim, the same as the scene53c mouth band |
| 81.7–95 (KF 27–29), second chamber | brown lozenge `#1A0C08`, **cream outline, gold halo**, no red lines, no spots, shown as an "x-ray shell" over a visible blade | colour, outline, glow and shape all differ; mirrored | world53d `SwordSheath` | reuse the scene53c `Sheath` geometry and colours, washed state (no dirt); if the blade must show through, use 70 % opacity, not a glowing outline |

### 3. Coffins, 椁, skeleton, knife

| Appearance | What it looks like | Inconsistency | File | Fix |
|---|---|---|---|---|
| 36.3–37.8, 椁 roof and lids lifted | dark-brown lids `#33211A`, gold edges, red inset line; diggers lift them | reference for the coffin look | scene53c `Lid`, parts53c `OpenCoffin` | — |
| 39.3–45 (KF 9–10), open inner coffin | outer 2.12 × 0.84, inner 1.80 × 0.60, warm brown interior `#46201A`; skeleton in bone-cream outline at 50 % with a dark inner line; label 「墓主人」 28 px, no leader line | the storyboard's tag 「剑在墓主人左侧」 is not in the film (only in the kfJ stand-in) | scene53c | add the tag (Tag, fs 44 as in kfJ53) |
| 82–95 (KF 27–29), second chamber | 椁 5.0 × 2.6, outer 2.64 × 0.88, inner 2.24 × 0.62; black boxes, **red interiors**; **no skeleton** | sizes about 25 % larger; colours differ; skeleton missing | world53d `Chamber`, `Box`, `Slab` | one set of dimensions for both (take scene53c's outer 2.12 × 0.84 / inner 1.80 × 0.60, or update both to one documented set); interiors `#2A1D14` / `#46201A` as in scene53c, red only as the inset line; port `Occupant` from scene53c into world53d (it only needs `proj`, so it can be shared via parts53c) |
| both chambers | — | **铜削 (bronze knife, facts A9) never drawn** | — | add one small knife (about 25 cm, curved back, ring pommel, dull bronze `BZ.dark`) beside the sheath in both chambers, from one shared component |

### 4. Display, glass hood, plinth, hall

| Appearance | What it looks like | Inconsistency | File | Fix |
|---|---|---|---|---|
| 6.3–16.8 (KF 2–5) | display53k lectern: dark plinth, 22° deck, two acrylic rests, low hood, spot cone, visitors, rope | reference | take53 `Museum` + display53k | — |
| 10.8 (KF 3), the title | a **tall clear leaf** (up to 1475 mm) stands on the hood's front pane to carry the title: it fades in over 6.6–8.4 s and out over 11.7–12.5 s (`leafAt`) | the display is a different object only during the title, and the leaf never comes back at the end. The v3 storyboard puts the title on the top pane; display53k "v3-e" moved it to the front leaf on purpose | display53k `TitleLeaf`, take53 `leafAt` | accepted as a title device if the owner agrees; otherwise go back to the top pane as in the storyboard. Either way, don't let the leaf show in the wide hall shots (it is still partly up at 12.3) |
| 93.3–96.3 | rising through the floor: striped 夯土 top with dots (94.8), then the plain museum floor (96.3); the hall with lit wall labels; the display on its tall plinth | a transition, motivated ✓; the hall walls, labels and rope match the start | hall53d `FloorD`, `HallBack` | — |
| 95.8–107 (KF 30–31) | the same display53k (via CaseHall + CaseW), same rests, same hall and visitors | geometry ✓ the same object; but the extra blade rim (worst #5) and the 106.2–107.9 similarity warp, which tilts the hood and hall into a tall, slanted box at 106.8 | scene53d `CaseW`, take53d `swordFit` | drop the rim; fade the hall and hood out *before* the warp starts (they are what reads as distorted), keep only the sword through the warp |
| visitors (13.8, 96.3, 105.3) | faceless one-tone, semi-transparent (the rope shows through their legs) | consistent start ↔ end; the transparency makes them read as ghosts | take53 `Visitor` | make them opaque, one tone darker than the wall |

### 5. The cleaver

| Appearance | What it looks like | Inconsistency | File | Fix |
|---|---|---|---|---|
| 0.3 (KF 0) | `CleaverK` (cleaver53k): blue-grey blade, hole, rust specks, water beads, dark handle (off frame) | reference | take53 → end53d `CleaverD` = cleaver53k | — |
| 106.8–113 (KF 31–32) | the same `CleaverK`, smaller, handle in frame | ✓ same model; only the framing differs (see sword, last row) | end53d `KitchenEnd` | land the end camera on frame 0's camera |
| — | `props53.Knife` (an older flat cleaver) is still exported and used by KF53 / kfF53 stand-ins | not in the film; risk of reuse | props53 | delete it, or mark it as a stand-in only |

### 6. People

| World | Look | Inconsistency | File | Fix |
|---|---|---|---|---|
| 1965 dig (24–28 s) | Figure4 near-black silhouettes, caps, tools | — | tomb53 (qq44 Figure4) | reference for 1965 |
| lid lifters (36.3–37.8) | dark-brown silhouettes, caps, thin warm rim | close to the diggers: one tone browner, plus a rim | parts53c `Digger` | use the Figure4 fill colour (or give the diggers the same rim) |
| gloved hands, wash, draw (42.3–45) | dark-brown mitts with rib lines, banded sleeves, a black ladle hand | same family as the lifters ✓ | parts53c `Glove`, inscr53c | — |
| museum visitors | translucent brown, faceless | translucency (see section 4) | take53 `Visitor` | opaque |
| 1977 film set | only a clapper and a light, no people | — | paper53c | — |
| shadow play (KF 13–20) | `INK #160904` with a warm `RIM #FFC26A` rim and slits; consistent across G1–G8 ✓ | its own world, which is motivated | kfG53 `Sil` | — |

### 7. Screen furniture

| Item | Finding | File | Fix |
|---|---|---|---|
| Subtitles | same layout D, top-left, scrim in EP and KF; the Q line (inscription) centred with a gloss in both ✓ | master53 / KF53V3 `OverV3` | — |
| Stamp | rule at x ≈ 1760 in every frame I checked (0.3, 1.8, 22.8, 30.3, 45.3, 58.8, 76.8, 93.3, 105.3, KF 5/13/27) ✓; numeric years in the YEAR serif, era words (战国中期, 前494年, 春秋末年) in Kai, by design | parts53 `Stamp53` | — |
| Hollow J seal | same size and place everywhere, absent on the end card ✓; over the bright macro and G-thread frames (66–81 s, KF 13–26) it almost disappears | qq51 `SealHollow` | add a 40 % dark disc under it on bright frames, or brighten its stroke |
| Depth tag | same component and place in EP and KF; 0.0 → 10.8 → back up to about 1.3 ✓ | parts53 `DepthTag` | — |
| Tags and leaders | font sizes 28 (墓主人, no leader), 34 (剑首 · 11道同心圆), 44, 48/56 (paper), 52 (section labels), 62/64 (镀铬？), 72 (40多封信, 原因之一), 104 (鸠浅＝勾践) | scene53c, take53, paper53c, macro53c, world53d, inscr53c | set three sizes: label 44 (with a leader), callout 62, headline 88; 墓主人 → 44 with a leader; 镀铬？ 64 → 62 |
| Element tiles (KF only) | the Cr tile sits at (1500, 640) at 18.6 v3 and at (1330, 735) at 94.8 v3; Cu, Pb and Sn share the 735 row. KF 22 shows the tiles *and* the film's 「铜 · 锡 约18–20% · 铅 ≈ 0」 tag, so the same information appears twice | kfH53 | put every tile on one row (y 735, x 1330 / 1550); in M1 drop the film's text tag once the tiles land |
| Safe area | subtitles, stamp and seal sit in the same place in every frame ✓ | — | — |

### 8. Light and palette

| Where | Finding | Fix |
|---|---|---|
| 0–75 s | style B holds: dark warm ground, the sword the brightest thing, only gold and blue saturated ✓. The dig's grey-blue 青灰泥 is motivated (soil) | — |
| 75–82 s (T1/T2) | the "duller" veil reads grey-cool | warm veil (see section 1) |
| **82–93 s, second chamber** | big oxblood-red coffin interiors and a red portal disc: a third saturated colour that dominates the frame | brown interiors as in scene53c; red only as thin lacquer lines |
| 95.8–101.4 | the sword gets an outline and halo: brighter than at the start | drop `rim` |
| Light direction | top or top-front key in every scene ✓ | — |

## Reference sheet: the one model per element

| Element | The model appearance | Time / KF |
|---|---|---|
| Sword, flat views (outline, lattice, ridge, guard, hoops, pommel, 8 marks) | the drawn sword, top-down, beside the inscription (flat53s / blade53c from `swordspec53s`) | 45.0–49.8 s · KF 11 (leg 12 I0) |
| Sword, 3-D views | on the display, before the title (`Sword3D`) | 7.8 s · KF 2 |
| Pommel, 11 rings | the push along the axis | 19.8 s · KF 5 |
| Guard (blue glass and cloisons) | the close 3-D pass | 4.8 s and 102.3 s |
| Lattice colour in macro | the M1 frame before any veil | 63.3–64.8 s · KF 22 |
| Sheath | washed, in the hands, just before the draw | 42.3–43.8 s · KF 10 |
| Coffins, skeleton | the open inner coffin from above (scene53c) | 40.0–40.8 s · KF 9 |
| Display, hood, plinth, hall | the orbit | 13.8–15.3 s · KF 4 |
| Cleaver | the opening | 0.3 s · KF 0 |
| People (1965) | the diggers at the shaft | 24.3 s · KF 7 |
| Shadow play | G2 | KF 14 |
| Furniture | any mid-film frame, e.g. the dig | 30.3 s · KF 8 |
| Palette | the inscription glide | 46.8 s · KF 12 |
