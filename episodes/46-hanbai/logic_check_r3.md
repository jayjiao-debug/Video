# ep46 汉柏 — logic check r3 (illustration and human behaviour, rendered cut)

Scope: the rendered cut `/tmp/claude-0/r46/ep46_v2_pic.mp4` (156.4 s, 30 fps).
- Read all 156 one-second stills in `review/qa/frames/cut_v2/`.
- Pulled 4 fps runs for 59–68 s (`qa_*`), 77–91 s (`mk_*`), 105–124 s (`pk_*`) and 124–136 s (`vi_*`), all in `review/qa/frames/logic_r3/`. A file named `xx_NNN` is at the run's start + NNN/4 s.
- Pulled 10–30 fps runs and zoomed crops where people move (`crop_*`, `sheet_*`, `full_*`, `stele_head_*`, `left_*`, `stall*`, `kneeler_hand_zoom.png`, same folder).
- Measured pixel change between frames to see who actually moves and who pops in or out, and tracked walkers' feet frame by frame to look for sliding.

Items from r1/r2 that are now fixed are listed at the end and not raised again. Coordinates are on the 1920×1080 frame.

Severity: **BLOCKING** = the owner will catch it (one of his named complaints). **SHOULD** = fix this round. **NICE** = polish.

---

## BLOCKING

**1. Walkers keep "standing on" the two photographers' heads.** 124–135 s
- Wrong: both photographers stand still in the walkers' lane, and the walkers along the wall (feet y≈760–790) pass straight behind them. On screen, the walker's feet land on the photographer's cap or phone, so it reads as one person standing on another's head, or as a two-headed totem.
  - Right photographer (x≈1700–1760):
    - 124.0 s: a woman's front foot sits on the photographer's head (`crop_stacking_right.jpg` panel 1, `full_124.0.jpg`).
    - 128.5 s: a man's foot sits on the phone.
    - 132.25 s: a man's feet sit on the cap and phone.
  - Left photographer (x≈1180–1240):
    - 125.5 s: a man's foot sits on the cap (`crop_stacking_left.jpg`).
    - 130.0 s: a man's feet sit on the cap.
    - 134.5 s: a woman's legs cross the phone.
- How often: in the 4 fps run this happens in about 1 frame out of 6 across the whole "来了，又走了" section, right in the climax. r2 #4 raised it, and the rule was not applied to these two lanes.
- Fix (any one of these works):
  - (a) Move both photographers forward to feet y≈960–990. Then a wall-lane walker's feet (y≈780) end ≥120 px above their heads (y≈820).
  - (b) Shrink the wall-lane walkers to ~70 % scale, so their feet are always above the photographers' heads.
  - (c) Give the wall lane a gap: no walker within ±70 px of x≈1210 or x≈1730 while their feet are below y≈800.
  - Re-run the stacking check frame by frame from 124 to 136 s, not at 1 fps.

---

## SHOULD

**2. Heads and shoulders sit on top of the far-right stele like a bust on a plinth.** 126.25, 127.75, 130.0, 133.0 s (`stele_head_126.25.jpg`, `stele_head_133.0.jpg`, x≈1740–1790, y≈720–760)
- Wrong: the wall-lane walkers pass behind the stele, whose top (y≈725) is only a head below their head line. A head, or a head plus shoulders, appears sitting on the stele's rounded top, with the legs hidden. It looks like someone stuck in the stone or a bust on top of it. This is the same family as r2 #5 (limbs from stone), now with heads.
- Fix: in the 2024 shot, push the wall lane up (smaller walkers, feet y≤760) so the head clears the stele top by ≥30 px. Or end the lane before x≈1700, or make walkers cross behind this stele in ≤0.2 s. The same check applies to stele 2 (x≈640) at 128.5 s.

**3. The fire-feeding stick still comes out of the kneeler's knee. His visible hand warms itself in the air.** 80.5–87 s, x≈560–700, y≈700–890 (`kneeler_hand_zoom.png`, `crop_cooks_82.png`)
- Improved: the stick now pushes into the fire in a cycle (good).
- Still wrong: the visible near arm reaches out flat over the pot with an open palm. The stick's upper end disappears into the thigh and knee silhouette, and no fist is visible on it. In motion, the stick slides in and out of his knee by itself. This is the r2 #2 complaint (prop with no hand).
- Fix: put the visible hand on the stick, with ikArm to the stick end and the stick end showing 10–15 px past the fist, and drop the warming gesture. Or bring the stick in front of the thigh, so the far hand's fist on it is drawn on top. One small spark on each push.

**4. The 1762 group and table pop in all at once, then stand frozen.** 59.47 s (`crop_qianlong_pop_59.jpg`), 59.5–62.5 s and 62.8–65.7 s
- Wrong: at 59.43 → 59.47 s, three full figures and the table appear in one frame on an unchanged background. Nobody walks in (r1 still had an entrance). After that, the two attendants change by 0 px for about 6 s. Qianlong's brush hand is the only thing that moves.
- Why: people popping in, and they read as cardboard cut-outs.
- Fix: either a 0.3 s fade with a small rise, or bring back the entrance walk: the emperor first, attendants half a step behind, stopping at their marks by 61.5 s. Give the attendants a slow idle (a head tilt toward the paper, a small weight shift) every 2–3 s.

**5. The painting still builds on a free-standing scroll he never touches.** 62.8–66.0 s (`crop_painter_63_65.jpg`)
- Improved: the brush now travels over the table sheet and leaves ink.
- Still wrong: the marks on the table are three short dashes, like a line of writing. The tree, and then 「數千年神物」, grow on the upright mounted scroll ~250 px to the right. That scroll is a real object with floor feet, a frame and a shadow. So the drawing still has no visible cause (r2 #3).
- Fix: use r2 option (a) properly. The table sheet shows the same small tree stroke for stroke. The standing scroll loses its feet and shadow and becomes an inset (soft frame, a thin leader line from the table sheet to it). Or remove the stand and mount the finished sheet at 66.8 s.

**6. The soldiers and the fires vanish mid-pan while the stalls stay.** 87.2–88.2 s (`sheet_cooks_dissolve_87.jpg`)
- Wrong: on the pan toward the 唐槐, the four soldiers, both fires and pots dissolve in place (translucent bodies at 87.4–87.8 s, partly over the counter). The two stalls and their vendors stay solid, and by 88.0 s they have moved to x≈1150–1300. Same courtyard, same moment, so half the people evaporate.
- Fix: keep the soldiers and fires on the camera layer, so they slide out of frame with the pan like the stalls. Or start the pan's crossfade only after they have left frame. Do not fade people in place while their neighbours stay solid.

**7. The 1928 soldiers wear baseball caps, and the "rifle stack" reads as an easel.** 80.5–87 s (`crop_cooks_82.png`, `crop_rifle_stack_82.png`)
- Wrong:
  - The new caps have a round crown and a long forward visor, the same outline as the 2024 visitors' caps (compare the left photographer at 126 s). No belt, cross strap or leg wraps.
  - The three thin dark sticks at x≈460–500, y≈650–790 have no stocks, barrels or bayonets. They read as a camera tripod or easel.
  - So "军队住进大殿" still isn't shown: they read as workmen in caps cooking.
- Fix:
  - Cap: a flat-topped crown (top edge horizontal, slightly wider than the band) with a short stiff peak, so the head's silhouette is boxy, not round.
  - Belt: a 4 px light belt line at the waist on all four soldiers.
  - Rifles: three rifles in a pyramid, each with a wider stock at the foot (~14 px) and a thin barrel, leaned together with barrels crossing at the top. Put the stack in the open, not next to the kneeler's back leg.

**8. "人们收集了你的种子" with no people.** 105.3–109.2 s (`pk_000`–`pk_016`)
- Wrong: cones drop from the crown into a glowing basket that stands alone on the floor. The line names people, and the picture shows none (r1 #27 and r2 #18, now in the cut).
- Fix: add one crouching collector beside the basket (`crouch`, one hand in the basket, the other picking a cone off the floor). Or two hands holding the basket up under the falling cones. Everything else in the shot reads.

---

## NICE

9. **Frozen extras in the market and the cooking shot.** 78.2–79.8 s: the stall vendors and the reaching buyer change by ~28 px in 1.5 s. 81–83.5 s: the bowl soldier and the second stall's buyer change by 0 px. Give each a 2–3 s idle (the buyer lifts a fruit, the bowl soldier raises the bowl a little as the stirrer ladles).
10. **Stall cross-bars cut through the vendors' necks.** 79 s (`crop_stalls_79.jpg`), x≈330 and x≈1590: the shade pole runs exactly through the standing vendor's shoulder line, so it reads like a yoke through the neck. Drop the vendor 20 px lower (or seat him on a stool, r2 #13), or raise the pole above head height.
11. **Crossfade ghosts are still there.**
    - 80.3–80.7 s: the close cooks fade in over the far stalls framing, with two sets of people half-transparent at once.
    - 123.6–124 s: the Maoling seedlings show through the courtyard.

    Cut or move the camera for these hand-overs.
12. **"你一直在。" sits on the dead trunk's tip.** 133.6–138 s: the "。" overlaps the broken top of the west trunk (x≈1150–1190, y≈380). Move the line ~60 px left or up (r1 #29).
13. **Trees on the 茂陵 mound** are still trunkless green ovals on the slope (r1 #28). Give them short trunks or a ground contact shadow.
14. **The pavilion grows up out of the floor** at 66.9–67.5 s (`crop_pavilion_grow_67.jpg`), with the roof rising like a lift. The director asked for props to grow, so this is a taste call. A drop-in from above, or a build-up of posts then roof, reads more like construction.
15. **The people fade out mid-stride at 135–136 s.** This one is fine because it is the point of "来了，又走了" against "你一直在". Keep it, and let the photographers lower their phones in the last 0.3 s before they go.

---

## Fixed since r2 (don't touch)

- **Walk cycles:** feet stay planted. Frame-by-frame foot tracking at 126.0–127.0 s shows the stance foot locked while the swing foot moves, with no sliding. Walkers face the way they move.
- **Cooking:** two stirrers hold their ladles at the end, tips inside the pot rim, with a stir motion. The bowl is in hand. Steam and fire flicker. Fire 2 has moved off the pavilion pillar onto open floor.
- **Counter vs action:** the "2037" counter no longer covers fires or soldiers (r2 #7).
- **Climbers** stay on the mountain path behind the roofs, and none run down the wall (r2 #8).
- **Peak:**
  - Exactly 6 lights leave the crown, travel west and land as 6 spots, which grow into 6 trees. No lollipop row to miscount (r2 #11).
  - The legend figure stands on the mound top, clear of the subtitle, and its 相传 tag is gone before the next line (r2 #9).
  - The sky tree now has a trunk behind the mound (r2 #10).
- **Seeds:** the cones fall from the live crown into a basket on open floor, not behind a pillar (r2 #12).
- **Market:** two stalls with standing vendors and a buyer reaching into the goods (r2 #13, only the person-count and idle notes remain above).
- **Painter:** the brush tip moves over the table sheet in a stroke rhythm. He stands beside the table, not in its leg.
- **Shadows** under all people, **scale** of people vs wall and tree, the **西干** label pointing at the trunk, and the **1771 hand-over** (the table and figures gone before the stele) all hold.
