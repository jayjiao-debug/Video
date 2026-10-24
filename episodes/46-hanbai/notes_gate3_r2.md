# Gate 3 · round 2 · ep46 泰山汉柏

Director, 2026-10-25. I looked at all 37 stills in `review/qa/frames/r2/`, checking each against `notes_gate3_r1.md`, `logic_check_r1.md`, the brief and the owner-notes rows. I zoomed in on 82.0, 89.0, 104.0, 119.0, 129.0, 14.4, 63.8 and 112.5. Coordinates are in pixels on the 1920×1080 frame.

## Verdict: **REVISE (short round)**

This is a big step up. The r1 fixes listed below have landed and I am not raising them again. Five items are still blocking, and each is a small, local fix. Once B1–B5 are done and the stills are re-shot, I expect to approve. The should-fix items (S) can go in the same pass. The polish items (P) are optional.

**Confirmed fixed (r1 → r2):**
- Night boxes and block flames are gone (7.9, 139.2), and the white wash at 124 s is gone.
- West trunk follows the rule: dead and grey only in today/2026 frames (0.0, 94.0+), whole in history frames (9.9, 63.8, 92.0). There is no fire at E1/E2. The 民国 → 今天 cut works: 2037 at 92.0, then 2135 at 94.0.
- Frame 0 is now a tight shot of the two trunks, and it eases back to the wide shot by 2.0. The bark strip stays unlit until C6.
- Steles are now slabs on plinths or tortoise bases, and Qianlong's stele has its pavilion. The mountain is a massif with a solid stair path.
- The slips stand on a table below the subtitle (29.5). The 水经注 tablet stands on the ground (34.9). The summit shot keeps the sapling in frame (19.9).
- The 唐槐 is beyond the left wall with no pan, and the wrong-place props are gone.
- The title is a plaque. The 32 cm and 11.5 m marks read as measurements. The roof is toned down and the seals are bronze.
- The age-0 tree is a sapling. The stamp reads 北魏 · 郦道元 with no century, and the counter shows 「?」 there.
- Qianlong's group is clear of the counter, with the scroll on a stand. The soldiers really cook: stirring, holding bowls, kneeling to feed the fire. The stalls are bamboo. There are climbers on the path at 124 s.
- The scrim behind text is lighter on bright skies. The truck is gone. Six lights leave the crown. The seedlings are drawn in the hero style. The peak line is set in two lines.

---

## Notes, ranked (B = blocking, S = should fix this pass, P = polish)

| # | Still(s) | Sev | Role | What to change |
|---|---|---|---|---|
| B1 | **f_0.0** | B | animator | **There is no subtitle on frame 0.** Owner rows 22 and 115 and script C1 all say the first words must already be on screen at frame 0, then typed on. At 0.0 the frame has no text at all. At 2.0 the full line is there. **Fix:** start the type-on at t = 0 with 「假如说，」 already drawn on frame 0, and finish the line by about 1.2 s. Position and size stay as they are at 2.0. |
| B2 | **f_119.0, f_120.5, f_122.5** (peak) | B | animator | **(a) Text over text at the peak.** The grey 「相传」 tag from the Han ghost figure shows through right behind 「两千多年后，」 (x 1050–1160, y 170–260). Fade the tag and the Han figure out over the breath bar so they are gone by 118.3. F5 has already said 相传.<br>**(b) 「你」 doesn't read in the peak frame yet.** The ghost tree behind the mound is only a hazy crown behind the text, with no trunks, so it reads as cloud. Stand it on the mound top: base y ≈ 285, both trunks visible (the dead west one #BEB5A6, the living one #6F5A49) up to y ≈ 140, crown y ≈ 15–170, about 520 px wide, 35 % opacity, with the hero's warm glow #F3E3A0. Then move the two text lines down to y 440–620, over the mound face, keeping the current halo. Check that 守他 (gold) is still crisp over the tan. |
| B3 | **f_82.0, f_85.5, f_89.0** (民国) | B | animator / art-director | **The 1928 soldiers have the wrong era's look** (owner row 121). Two problems:<br>- Each has a **queue (辫子)** hanging behind the head (zoom on 82.0, x ≈ 700, y ≈ 560). Queues were cut after 1912, so they have to come off every 民国 figure. They belong only on the 1762 Qing figures.<br>- The caps are **tall flat-top cylinders**. Next to cooking pots they read as chef's hats or stovepipe hats.<br>**Fix:** a Republican army peaked cap. The crown is about 0.45× head height, the top is flat and a little wider than the band, with a short visor forward. Add a belt and leg wraps. A stack of 3 rifles by one fire (logic #12) would close the "soldiers or cooks?" question. |
| B4 | **f_14.4, f_57.5**; f_89.0; f_52.8 | B | animator | **Half-transparent props are still there** (r1 note 2c).<br>- f_14.4 and f_57.5: the right-hand stele and its tortoise at x 1720–1815, y 740–990 are a ghost at about 30 %. Draw them fully opaque or remove them.<br>- f_89.0: the 唐槐's trunk and branches are see-through, and the hall roof shows through the trunk. The crown may fade as it dies, but trunk and branches stay solid #6B5A4A, behind the wall line.<br>- f_52.8: the courtyard (wall, stele, tiles) cross-dissolves over the field at about 40 %. Build the temple instead: the wall rises from the ground line, then the hall rises, about 0.5 s each, on the 宋真宗 beat. |
| B5 | **f_89.0** | B | animator | **The counter sits on the cooking group.** 「2037」 covers the kneeling soldier and fire 1 (x 250–620, y 930–1060). For the 唐槐 framing, move the cooking group up and right so every foot and flame is above y 900 and right of x 680, or keep the 85.5 framing (group at y ≤ 910). Do not move the counter. |
| S6 | f_14.4 | S | animator | The title plaque hangs on two thin cords (x ≈ 750 and 1170) that go up into empty sky, so it floats. Either delete the cords and let it slam in as a free card, or draw an eave beam across the top (#5A3A22, y ≈ 120) for them to hang from. |
| S7 | f_115.5–f_122.5 | S | animator | **(a)** The six "小树" have the hero tree's **fire hollow** (the dark slit) and its gnarled twin trunks, so they read as six old trees, not 2024 seedlings. Keep the pad crowns and the glow, but give them one slender trunk with no hollow, about 70 % of their current trunk thickness.<br>**(b)** The Han legend figure (115.5, 117.5) is a solid pale fill. The legend code is a dashed outline: 2 px dashes #F3E3A0, fill ≤ 15 %. |
| S8 | f_112.5 | S | animator | The journey plain still has a row of 7 identical lollipop trees (the clip-art I flagged in r1) and a **symmetric cone mountain** at the right edge (x 1500–1920). Replace the trees with low field strips or a few pad-style cypress clumps of varied size, and the cone with a low two-hump ridge. Keep the lights moving one way (owner row 67). |
| S9 | f_97.5 | S | animator | 「西干 · 死了」 sits on Qianlong's carved stele, far from the trunk (x 210–640), and its thin vertical line at x 695 doesn't touch anything. Move the label to x ≈ 330–640, y ≈ 540, with a short horizontal leader that ends on the west trunk's edge (x ≈ 790). Nothing should sit on the carved stele. |
| S10 | f_104.0 | S | animator | The top guide of the 11.5 m bar runs at y ≈ 70 from x 1430 to 1670, under the corner mark 「◆ Juno · VIBE知识大赏」. Put the guide at the true crown top (y ≈ 88), 2 px, dotted, and stop it at x 1500. Keep the bar and the 「11.5米」 label. |
| S11 | f_126.0, f_129.0, f_82.0 | S | animator | Same-tone overlaps are still there (logic #3, #17, #18):<br>- 129.0 (x 1490–1545) and 126.0 (x 1590–1640): the photographer and a walker fuse into one body with two heads.<br>- 129.0: legs only show left of the west trunk at x 1130–1160.<br>- 82.0: an arm and ladle poke out from behind the carved stele at x 1270–1320.<br>Apply the ≥ 60 px / different-depth rule, and route walkers so they never show limbs without a head. |
| S12 | f_7.9 → f_9.9 | S | animator | Continuity check (stills can't show it). If the C4 fire shot ends on a grey west trunk, the 1762 shot 1.7 s later shows it whole again. End C4 on the flames, with no grey after-state, so the undated fire never contradicts the next shot. |
| P13 | f_135.5 | P | animator | 「你一直在。」 sits on the dead trunk's broken tip and the pavilion roof. Move it up about 90 px (y ≈ 360–450) so the hero stays clear (logic #29). |
| P14 | f_75.6 | P | animator | During the Q7 punch line there are three labels on screen (「真的你」, 「石碑里的你」 and the poem). Fade the two name labels out as 「谁是主，谁是客」 lands. They have done their job at Q6. |
| P15 | f_108.0 | P | animator | The seeds in the basket are orange-sized, and two seeds float on or beside the dead trunk (x 995–1060). Use small cones, and let them drop from the living crown (x 1300–1700) only (logic #27). |
| P16 | all courtyard stills | P | art-director | The tortoise bases read as pebbles with an eye. Give the head and neck a clear 30–40 px reach forward and a domed shell line, or use plain plinths. |

## Don't change (adds to the r1 list)
- **Frame 0:** the tight two-trunk framing (grey dead trunk beside the living brown one), eased out to the wide shot by 2.0 s.
- **Title plaque:** design, colours and size (14.4), apart from S6.
- **Slips and tablet:** the slip table with the empty 「种树 · 无」 slip, and the standing 水经注 tablet with 蓋 circled.
- **Qianlong:** the pavilion stele, the scroll on a stand, the clear spacing of his group, and the 望着 sight-line.
- **民国 cooking:** the actions themselves (kneeling feeder, stirrer, man with a bowl) and the steam. Only the cap and queue change.
- **The 92.0 → 94.0 cut:** 民国 2037 to 今天 2135, with the stamp 高11.5米 · 胸围3.4米.
- **Measurements:** the 32 cm band with its dimension bar; the 11.5 m bar (bar and label).
- **The seed lights leaving the crown** (109.8); climbers' lights on the stair path (124.0); the night grade at 139.2.
- **The peak** (119–122.5): six glowing seedlings in a row before the mound, light rays, two-line peak text with 守他 in gold.

## For round 3, send only these stills
0.0 and 0.6; 14.4; 52.8; 57.5; 82.0; 89.0; 97.5; 104.0; 112.5; 117.5, 118.5, 120.5; 129.0. Re-run pose_check on the re-capped soldiers.
