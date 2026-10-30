# Storyboard v3: 越王勾践剑 / 真的没锈吗？ (ep53 · one take · about 2:14)

Art director, 2026-10-30. Answers the owner's notes on v2 and adds the 勾践 thread.

**Timeline:** `lines_v3_draft.json` (provisional seconds, 133.75 s). Music hits to keep: **title 9.50**, **dive 20.75**,
**draw 36.50**, **the turn 「其实，它也锈了」 101.25** (the big drop), **end card 129.25**. Every exact time follows the music re-cut
(±0.5 s). The v2 ranges are on `lines_bars.json` (113.633 s), so the rebuild can lift the v2 legs and retime them.

**Key frames:** `episodes/37-qiqing/remotion/src/qq53/KF53V3.tsx`, composition **`KFV3`**, 33 frames (one per leg, one per line in
the 勾践 thread). Pictures are in `kfG53.tsx` (勾践 thread), `kfH53.tsx` (the frame list, v2 pictures for KEPT legs, element tiles),
`kfI53.tsx` (display plinth + hood, title, hall), `kfJ53.tsx` (coffin + skeleton), `kfK53.tsx` (blade surface: specular, blooms,
focal diamond). The frame list with labels is in `tasks/ep53-kf3/out/kf_list.md`.

The look, palette, type, furniture (layout D subtitles, two-line stamp, hollow J seal, depth tag) and the single continuous camera
are unchanged from `storyboard.md` (v2). Only the legs below change.

## The legs

Status: **KEPT** = the v2 leg, retimed (the "v2 range" column is what to lift) · **CHANGED** = v2 camera path, new or changed
picture · **NEW** = new leg. KF = frame number in `KFV3`.

| # | Lines · v3 time | Status · v2 range | Camera start → end | What moves, on which hit | Match move into the next leg | KF |
|---|---|---|---|---|---|---|
| 1 | H1 row 1 · 0.00–1.50 | KEPT · v2 0.000–1.575 | 19 cm over your wet cleaver, looking down its edge toward the far bronze glint (~88° lens) | rust blooms on beat 1 (0.44); water beads glint. The cleaver becomes the more iconic broad rectangular Chinese cleaver (wooden handle, rivets) once the other engineer's component lands; it stays secondary to the bronze glint | **Match 1** at 1.50: edge line carries on from steel into bronze, 1:1 | 0 |
| 2 | H1 · 1.50–5.50 | CHANGED · v2 1.575–5.538 | skimming ~1.5 cm over the face, looking tip → guard along the ridge, guard blue glass on the horizon | **[亮] on DA(1) ≈ 2.7: a REAL specular highlight**, a broad soft lobe where the museum spot reflects, living on the pale (tin) diamonds and broken by the dark lattice, with the edge strips carrying a thin line. The ridge is a gold crease, not a white stripe (owner note 0:03; final look from the specular engineer's renderer) | the guard rises; the camera lifts over it | 1 |
| 3 | H2 · 5.50–9.50 | CHANGED · v2 5.538–9.500 | over the guard 5 cm → rise and pull back to ~1.9 m, front-left and above the **new sloped lectern plinth** | the sword lies on two clear acrylic rests (under the blade and under the grip) on the 23°-tilted dark plinth, **55 % of the frame width**; low glass hood, all its edges inside the frame; spot from above. Stand-in drawn in `kfI53` until `display53k.tsx` exists | the hood's top pane comes up to the lens | 2 |
| 4 | TITLE · 9.50–11.75 | CHANGED · v2 9.500–11.764 | ~1.8 m, steeper, looking down onto the hood's top pane | **the title etched on the hood's top pane: 「越王勾践剑」 behind the sword, 「真的没锈吗？」 in front of it**, so the sword sits between the two rows; contact on f285 (9.50), damped jolt, no flash; frosted, never brighter than the blade | the camera keeps backing and starts the orbit | 3 |
| 5 | S1 · 11.75–16.25 | CHANGED · v2 11.764–16.293 (camera kept) | orbit to ~6 m, 3/4 high | dark hall, faceless one-tone modern visitors outside the rope, the plinth + hood lit in the middle (the old glass case is gone) | the orbit ends on the sword's axis behind the pommel | 4 |
| 6 | S3 · 16.25–20.75 | CHANGED · v2 16.293–20.821 (picture kept, plinth swap) | 4 m → 3 cm along the axis from the pommel side | the silvery sheen and 「镀铬？」 on the lull hit (~18.6), **plus the Cr tile (24 · Cr · 铬 · Chromium, "？" corner) on 「镀了铬」**: a question, never struck; the push ends on the **11 rings** filling the frame | **Match 2** on the dive 20.75: through the ring centre, the rings harden into the shaft's stepped rim | 5 |
| 7 | S4 · 20.75–23.75 | KEPT · v2 20.821–24.217 (trim 0.4 s from the hover) | falling straight down on the constant log-zoom | stamp rolls 2026 → 1965, pressed on ~23.6 | the fall slows over the canal | 6 |
| 8 | D1 · 23.75–28.00 | CHANGED · v2 22.6–28.746, compressed | hover over the snowy canal cut → into the shaft mouth | the dig, workers' lamp; **the depth tag appears at 0.0 at once** (「10.8米」 is in this line now) | the camera sinks into the shaft | 7 |
| 9 | D2 · 28.00–32.00 | CHANGED · v2 28.746–36.104 at ~2× | down the shaft at ~2.7 m/s, pitched 62° | 五花土 → 青灰泥 → 白膏泥 stream up unbroken (从没被盗); **depth 0 → 10.8 m by 32.0** | the walls open into the chamber, 10.8 m | 8 |
| 10 | D3 · 32.00–36.50 | CHANGED · v2 36.104–43.463, compressed | eased tilt from the shaft → **top-down 0.6–1 m over the open inner coffin by ~34.2** | 椁 roof 32.0, outer lid ① 32.6, inner lid ② 33.4; **the occupant is a respectful, simplified skeleton**: bone-cream line art at ~40 % opacity, no gore, shroud remnants; head to the right, so the occupant's LEFT is the near side, and **the black lacquer sheath lies there**, hilt by the hip, pommel to the right (the draw's direction); tag 「剑在墓主人左侧」; gloved hand lifts the sheath for the rinse ~35.6 | the draw on 36.50 | 9 |
| 11 | D6 · 36.50–40.50 | KEPT · v2 43.463–47.425 | 5 cm over the blade, riding the draw | cold flash on the draw hit 36.50 | glide guard → tip | 10 |
| 12 | I0, I1 · 40.50–49.50 | KEPT · v2 47.425–56.482 | top-down 5 cm, gliding guard → tip at ~3 cm/s | marks light per half-bar; the 1966 letters in the polish; **鸠浅 ＝ 勾践** under the 3rd–4th marks ~48.3 | the camera drops low over the polish beside the inscription and slows: the letters' reflections hand over to the shadow play | 11, 12 |
| 13 | **G1–G8 · 49.50–82.75** | **NEW** | **one glide, low (~10–14 cm) over the front face, blade level, gentle recession toward the tip; ~12 cm of blade across the frame; guard → tip at ~1.1 cm/s** (from 15 cm to ~51 cm from the pommel end) | **the polished bronze is a mirror and the story plays in it as a shadow play** (see the next table); one vignette per line, 4.2 cm apart along the blade, each sliding into the centre as its line starts, the last one dimming as it slides out right | at 82.75 the glide reaches the edge near the tip; the camera rolls 90° to look along the edge (**Match 3**) | 13–20 |
| 14 | B1 · 82.75–87.75 | KEPT · v2 56.482–61.577 | profile along the edge, crane up to 3/4 | film light on, clapper 「古剑 1977」, the cut: 20多 of 30多 sheets | the film light falls across the flat; push in | 21 |
| 15 | M1, M2, M3, HUSH · 87.75–101.25 | CHANGED · v2 61.577–75.162 | macro push 10 cm → ~0.1 mm, horizon held high | **tiles:** Cu (29 · 铜 · Copper) on 「铜质好」 ~90.0, Pb (82 · 铅 · Lead, "≈ 0", faint) on 「铅几乎为零」 ~91.0, both leave before M2; Cr returns with 「镀铬？」 92.25; Sn (50 · 锡 · Tin) lands on 「热镀锡」 ~95.5 beside the tin skin, Cr and Sn side by side for a beat, then Cr drifts out, never struck. **Focal point (owner note 1:07):** one lit pale diamond is the subject (the cut opens at its edge), the rest falls off into the dark; in the hush only that diamond keeps the warm key | the drop on a held frame (no camera change on 101.25) | 22, 23, 24 |
| 16 | T1, T2 · 101.25–107.75 | CHANGED · v2 75.162–81.954 | raking macro over a few cells, easing back a notch | **the blooms sit ON the surface (owner note 1:15):** olive blots drawn in the face's own coordinates, foreshortened with it, each with a thin cream find-ring; the 1st on 101.25, then 101.8, 102.95; T2: they shrink to specks beside a 1 mm scale bar. They move with the surface, never slide over it | **Match 4:** one find-ring widens into the sheath's mouth as the zoom pulls out | 25, 26 |
| 17 | T3 · 107.75–112.00 | CHANGED · v2 81.954–86.483 | fast pull-out from the sheath mouth to ~1 m over the inner coffin | ◀◀ the sword slides back into its sheath beside the **skeleton** (same art as leg 10), stamp rewinds to 战国中期 | rise and arc to the section front | 27 |
| 18 | E1 · 112.00–115.75 | KEPT · v2 86.483–90.445 | the chamber as a dark cutaway | the tomb's other swords light one per half-bar; this sword the brightest | arc to the section face | 28 |
| 19 | L1 · 115.75–120.25 | KEPT · v2 90.445–95.540 (trim 0.6 s) | in front of the section, pulling back as it rises | layers close and are named on the beats; air dots bounce off the white clay, two get through | **Match 5:** the top fill layer becomes the museum floor | 29 |
| 20 | R2 · 120.25–123.75 | CHANGED · v2 95.540–102.332 (R2 + R3 in one move, half the time) | up through the floor to ~0.9 m over the plinth's hood | stamp runs 1965 → 2026; the gleam dulls a shade; one faint olive bloom with its find-ring on the blade (no separate in-case hold) | the camera starts backing out along the same line | 30 |
| 21 | P1, AIR · 123.75–129.25 | CHANGED · v2 102.332–109.125 (shorter) | backing out to ~2.3 m in front of the plinth, then on to frame 0's framing | **the hood's top pane** catches the reflection that resolves into your kitchen (the cleaver on the sword's edge line); as the camera keeps backing, the kitchen becomes real, the sword a glow in the window; AIR 128.50–129.25 holds | none: the card lays over the held frame | 31 |
| 22 | END · 129.25–133.75 | KEPT · v2 109.125–113.633 | held kitchen, dimmed | red J stamp on 129.25, title, 「你第一次见到它，是在哪？」, pill, sources; 4.0 s + 0.5 s fade | — | 32 |

**Durations vs v2:** dive → open coffin (leg 7 start to the top-down settle in leg 10) 20.75 → ~34.2 s = **13.5 s, of which the dive
end to the coffin is ~11 s** (v2 18.1 s). The ending (R2 → film end) is 13.5 s (v2 18.1 s). The middle grows by the 33.25 s 勾践 thread.

## The 勾践 thread (leg 13, 49.50–82.75): one glide, the story in the mirror

**How it reads:** after 「鸠浅，就是勾践」 the camera does not leave the sword. It drops low over the polished face beside the
inscription and keeps gliding toward the tip. The bronze is a mirror: in it, as if lit by a lamp behind a 皮影 screen, the story
plays in one-tone near-black silhouettes with a thin warm firelight rim and a few cut-out slits (皮影 hollow carving, in our flat
style). The **diamond lattice stays over the reflection at ~20 %**: it is in the metal, it keeps the picture reading as a
reflection, and it gives the scale (each scene spans about two diamonds). The polished edge strips stay bright gold, so the
blade's outline is never lost. Faceless, dignified, Spring and Autumn dress kept generic (深衣 robes, topknot caps, a 冕-like
board cap for the kings), **chariots, not riders** (no cavalry in 494 BC), straight hip roofs (no upturned eaves), no maps, no
borders, no blood. 夫差's death is shown only by a fallen cap and a dropped sword.

| Line · time | Where on the blade (cm from the blade base) | The vignette in the mirror | The hit | KF |
|---|---|---|---|---|
| G1 · 49.50–54.00 | 12.4 (the inscription still at frame right, 鸠浅 lit) | the reflection darkens to firelight: **会稽山**; the broken 越 army climbs its slope; besiegers with 戈 close round its foot from both sides | the ring of 戈 closes on 「被围在会稽山」 (~52.6) | 13 |
| G2 · 54.00–58.25 | 16.6 | **the envoy on his knees (顿首, hands to the ground)** before 夫差 seated on a dais with a screen behind; behind the envoy, 勾践 and his wife stand, heads bowed | the envoy bows down on the downbeat after 「求和」 | 14 |
| G3 · 58.25–62.75 | 20.8 | **伍子胥** walks away from the throne (toward frame left); behind him **吴's palace sinks into rippling water** | the water rises over the palace on 「沼泽」 (~61.5), then the ripple settles | 15 |
| G4 · 62.75–66.75 | 25.0 | **勾践 on foot leads the horse** of 夫差's chariot; 夫差 stands under the canopy (《国语》「亲为夫差前马」) | the chariot rolls in step with the glide (wheel turning) | 16 |
| G5 · 66.75–71.00 | 29.2 | alone on his mat, **he leans to the gall hung by his seat** and tastes it; a low table with a 豆 behind him | on **[尝]** (~69.6) his hand reaches the gall and the firelight dims a shade | 17 |
| G6 · 71.00–74.25 | 33.4 | **push in ×1.25 on the same seat**: he sits still; **会稽山 and the ring of 戈 rise behind him, faint, like memory** | the memory fades in on 「会稽之耻」 | 18 |
| G7 · 74.25–78.75 | 37.6 | **越's ranks surge on** with their 戈; **the palace from G3 goes under for good**; at the water's edge only **a fallen cap and a dropped sword** | the roof goes under on **[应验了]** (~77.0), a natural music lift | 19 |
| G8 · 78.75–82.75 | 41.8 → the tip | the last figure walks off and fades; **the reflection clears to plain bright bronze**, the specular lobe returns | the clearing completes on 「还亮着」 (~80.5); the glide arrives at the edge near the tip at 82.75 | 20 |

Movement rules inside the leg: the camera never cuts or stops; the vignettes do not move by themselves except the one event per
line (bow, water, wheel, hand, memory, roof). Each vignette fades in over ~0.6 s as it slides in from the left (tip side) and dims
to ~20 % as it slides out right. The push-in for G6 and the pull-back for G7 are eased (≤ 25 px/frame at the frame edge).

## Owner notes → where they are answered
| Note | Answer | KF |
|---|---|---|
| 0:03 the white-stripe shine | real specular lobe on the pale diamonds, gold ridge crease | 1 |
| 0:10 glass case cut, sword small | sloped lectern plinth, low hood inside the frame, sword 55 % of frame width | 2, 3 |
| 0:25–0:36 slow descent | dive end → open coffin ~11 s (legs 7–10) | 6–9 |
| 0:39 dashed-oval occupant | simplified bone-cream skeleton, sword at its left | 9, 27 |
| 1:07 no focal point | one lit pale diamond, the rest falls off | 23, 24 |
| 1:15 spots slide like a filter | blooms drawn in the surface's coordinates | 25, 26 |
| 锡 etc. unknown | element tiles Cu · Sn · Pb · Cr (Cr never struck) | 5, 22, 23 |
| ending too long | R2+R3 merged, P1 shorter | 30, 31 |
| cleaver more iconic | the other engineer's cleaver component; shown via the v2 frame for now | 0 |
| sword impeccable | every new frame draws the props53 Sword: 55.6 cm, ~4.8 cm base, the waist ~3/5 up, the dark diamond lattice, blue glass guard, two grip bands, outturned disc pommel (11 rings in the v2 S3 frame), 8 abstract marks in two columns of four by the guard | all |

## Notes for the rebuild
- The 勾践 vignettes are pure functions of the blade's own panel coordinates (`kfG53`: `VA`, `Vignette53`, `BladeGlide`); the film
  only needs to move the glide camera (`Glide.a` from ~15 to ~51) and fade each vignette by time.
- The plinth in `kfI53` is a stand-in; swap it for `display53k` and keep the cameras `CAM_H2`, `CAM_TITLE`, `CAM_S1`, `CAM_R2`, `CAM_P1`.
- KEPT legs in the key frames are rendered from the v2 takes (`V2Pic`), so they still show v2 details that other engineers are
  replacing (the stripe in the v2 macro legs M1–M3, the old cleaver in leg 1).
- The key-frame overlay adds a soft scrim behind the stamp (the macro and reflection frames are bright at top right); the film's
  `StampLayer53` should get the same.
