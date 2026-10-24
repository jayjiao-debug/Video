# ep46 汉柏 — logic check r2 (illustration and human behaviour)

Scope: every JPG in `review/qa/frames/people_r2/` (42 stills, 59.6–135.2 s) and `review/qa/frames/r2/` (37 stills, 0.0–152.5 s). Each was read at full size, and suspect areas were cropped and enlarged. I also measured how many pixels change between neighbouring stills, to see whether figures actually move.
Items fixed since r1 are listed at the end and not raised again. Coordinates are pixels on the 1920×1080 frame.

Severity: **BLOCKING** = the owner will catch it (it falls in one of his named complaints). **SHOULD** = fix this round. **NICE** = polish.

---

## BLOCKING

**1. The 1928 soldiers wear chef hats and queues.** f_81.4 → f_90.4 (people_r2), r2/f_82.0, f_85.5, f_89.0
- Wrong: all four soldiers have a tall flat-topped cylinder hat (it reads as a chef's toque or a top hat) and a small ponytail or queue curling at the nape. Zoomed crops of the heads at x≈700, 1090 and 520 show it clearly. They also have no belt, leg wraps or rifle.
- Why it breaks: wrong era. Queues were cut after 1912, and Republican troops wore a peaked army cap. Because the men are cooking, the tall hat reads as "chefs", not "an army moved into the hall".
- Ironically, the 1762 Qing men have no queue, and the 1928 soldiers do.
- Fix:
  - Swap the hat for a Republican army cap: a low flat crown, a short visor, a slight forward tilt, no taller than ~0.15 of head-to-foot.
  - Remove the nape tuft on all soldiers.
  - Add a waist belt and leg-wrap bands to the silhouette.
  - Stand 3 rifles leaning together in a tripod at open floor beside fire 1 (x≈250, y≈800). That says "army" without a word.
  - Optional: give the two standing Qing attendants a queue down the back instead.

**2. The fire stick lies across the kneeling soldier's thigh; his hand isn't on it.** f_81.4 → f_90.4 (soldier at x≈480–600, then x≈300–420 after the pull-back)
- Wrong: the stick's upper end rests on his thigh near the knee (x≈540, y≈690). His near hand is held open in the air above the pot (x≈590, y≈705). No hand touches the stick. Pixel motion shows the kneeler barely moves across 81.4–83.2.
- Why it breaks: a prop with no hand holding it, and a hand floating with no purpose. It is the "hands floating" complaint again, and "烧火" then doesn't read.
- Fix: put his near hand on the stick's upper end with ikArm to the stick point, so the stick runs from hand to flame base (y≈790). Give it a slow push-in / pull-back cycle (2–3 s), with a small spark burst on each push. The far hand can rest on his front knee. If he is meant to warm his hands, remove the stick entirely, but then nobody is feeding the fire.

---

## SHOULD

**3. The painting appears on a separate standing scroll he never touches.** f_62.8 → f_66.0, r2/f_63.8
- Wrong: Qianlong paints on a flat white strip on the table (x 860–970, y≈712), and that strip stays blank. The tree drawing builds stroke by stroke on an upright mounted scroll on a stand ~200 px to his right (x 1040–1290). The stand is drawn as a real object in the courtyard, with feet on the floor and a shadow.
- Why it breaks: the contact doesn't connect, because the strokes appear on paper nobody is touching. In r1 it was a speech bubble, which read as an inset. Now it reads as a magic scroll.
- Fix, choose one:
  - (a) Draw the strokes on the table sheet too, at small size. Turn the stand into an obvious magnified inset: no feet, a thin leader line from the table sheet to the inset, and a soft frame.
  - (b) Remove the stand. Let the drawing build on the table sheet with the camera pushed in on his hands. At 66.8 s, lift the finished sheet and hang it, just before it becomes the stele.

**4. Walkers merge with the two stationary photographers.** people_r2 f_128.2, f_129.2, f_131.2 (right photographer, x≈1580–1640); f_133.2 (left photographer, x≈990–1030); f_124.2 (x≈770–850, man + woman + child)
- Wrong:
  - Visitors pass straight behind the standing photographers. At 129.2 a walking woman's head sits just above the right photographer's shoulder, and her legs splay below the photographer's waist.
  - At 133.2 a woman's head is stacked directly over the left photographer's head, like a totem pole.
  - At 124.2 three figures form one dark mass with three heads.
- Why it breaks: same-tone silhouettes fuse into a body with two heads and extra legs. This is r1 #3's rule, and it was not applied to walkers passing behind people who stand still.
- Fix:
  - Code rule: no walker may pass within ±50 px horizontally of a stationary figure unless its feet are ≥60 px higher on screen and its head clears the stationary head by ≥20 px.
  - Route the walkers' lanes along the wall (feet y≈800) through the gaps x 1080–1150 and x 1650–1700.
  - At 124.2, offset the woman and child ≥70 px right of the man.

**5. Arms and legs still stick out of steles with no body.** f_124.2 (x≈285), f_125.2 (x≈860), f_127.2 and f_129.2 (x≈575), f_130.2 (x≈800, beside the pavilion stele), f_134.2 (x≈475)
- Wrong: a striding leg and an arm appear at a stele's edge while the torso is hidden. Seen frame by frame, it is the r1 #17 "limb from stone" read.
- Why it breaks: hands and feet with no body. The code's R4 check confirms nobody stands *inside* a stele, but it cannot see this occlusion read.
- Fix: before the head is visible, hide a walker completely, or show at least head plus torso, never only the leading limbs. Re-time paths so each walker crosses behind a stele in ≤0.3 s, or lay the lanes in front of the steles (feet y≥880).

**6. The fire-2 cook is only a head and an arm coming out of the pavilion stele.** f_81.4 → f_83.2 (x≈1280–1330), f_84.1 → f_90.4 (x≈800–830 after the pull-back)
- Wrong: the cook at fire 2 stands behind the 1771 pavilion stele. Only his head and his ladle arm stick out past its left edge, and the ladle crosses behind the red pillar into the pot.
- Why it breaks: it reads as an arm growing out of the stone. The fire also sits right against the pavilion's wooden pillar, so the pillar seems to be burning.
- Fix: move fire 2 + tripod + cook to open floor in front, clear of the pavilion: x≈1500–1650 before the pull-back (x≈1150 after it). Put the cook on the near side of the pot, whole body visible. The bowl soldier (x≈1090, which works) can then face that pot.

**7. The age counter covers the cooking.** f_87.7 → f_90.4, r2/f_89.0
- Wrong: after the camera pans to the 唐槐, "相传 · 你 2037 岁" (y 945–1015) sits directly on the kneeling soldier, fire 1 and pot 1 (x 360–620). "2037" cuts through the flame.
- Why it breaks: text collides with the action the subtitle just named. In r1 the 1762 version of this was fixed, and it is back here.
- Fix: in the 唐槐 pan, end the camera move ≥120 px lower in the picture (so the soldiers sit at y≤900), or let the soldiers and fires leave the frame before the counter zone. Keep the counter where it is.

**8. The stream of climbers on the mountain path runs down over the hall roof, the pavilion roof and the red wall.** f_125.2 → f_133.2, r2/f_126.0, f_129.0
- Wrong: the white dots climb the zig-zag path (good). The lower end of the stream continues past where the path goes behind the hall roof: dots sit on the pavilion roof edge (x≈920, y≈512), below the eave (x≈877, y≈562) and on the red wall face (x≈910–1000, y≈600–640).
- Why it breaks: impossible layering. Far-away people on the mountain are drawn in front of a nearer wall and roof, so they float down the wall.
- Fix: put the dots on the mountain layer (behind the hall and wall), or clip them with the hall-roof + wall silhouette as a mask. Start and end the stream where the path disappears behind the roof (y≈450).

**9. Text collides with the 茂陵 legend figure.** people_r2 f_115.7, f_116.5 (r2/f_115.5); r2/f_119.0 → f_122.5
- Wrong:
  - The translucent 汉武帝 stands at x≈940–990. His head is exactly on the "，" that ends subtitle line 1 ("出发了，").
  - At 119.0–122.5, his faded "相传" tag (x≈1050–1150, y≈170–215) still shows through the subtitle "两千多年后，".
- Why it breaks: text on the subject's face, and text on text.
- Fix: stand him at x≈1180–1230 on the mound top (it spans 590–1330), or start him rising only after line 2 is set. Fade the "相传" tag out fully before 118.3 s.

**10. A trunkless ghost crown floats over the mound.** r2/f_119.0, f_120.5, f_122.5
- Wrong: a large translucent cypress crown hangs in the sky above the mound top (y 20–330) with no trunk. The ghost figure is still faintly inside it.
- Why it breaks: an object floating without support. It reads as a cloud of leaves.
- Fix: draw a faint trunk from the crown down to the mound top (x≈960, y≈285), so it reads as the "big tree" spirit standing on the tomb. Or dissolve it fully before the seedlings' light rays start.

**11. You can count 7–8 trees when the line says "6棵小树".** r2/f_112.5 (7 round trees on the horizon, x 135 → 1695); people_r2/f_114.9 (8 trees, x 75 → 1895)
- Wrong: evenly spaced lollipop trees along the horizon are the most countable things in frame, while the subtitle says 6. The 6 travelling lights are smaller and dimmer than the trees.
- Why it breaks: the picture's count doesn't match the line (owner note: "counters must match what the picture shows").
- Fix: remove the lollipop row, or make it irregular, far and pale (varied sizes, clumps, 40 % opacity). Let the 6 lights be the brightest, largest countable objects, and land each light on one seedling spot.

**12. The seed shot: a cone grows on the dead trunk, and the basket is drawn behind a pillar it stands in front of.** r2/f_108.0
- Wrong:
  - One cone (x≈1058, y≈143) sits on the dead west trunk. A dead trunk bears no cones; they come from the live crown.
  - The basket's bottom (y≈815) is nearer than the pavilion pillar's foot (y≈800), yet the red pillar is drawn over the basket's left end (x 795–820).
- Why it breaks: biology, and impossible layering.
- Fix:
  - Hang and drop the cones from the live east crown only (x≥1300).
  - Draw the basket after the pillar, or move it to x≥840 clear of the pillar.
  - (r1 #27 is still open, see NICE: nobody is collecting.)

**13. The 1928 market doesn't read as a market.** f_77.8 → f_80.5, r2 f_82.0 back row
- Wrong: the 3 stalls are mostly hidden behind steles 1 and 3 (x 215–260, x 560–590), with one stall at far right (x 1580–1700) that has nobody at it. Only 2–3 back-row figures stand still, half behind steles. Nobody sells, buys or carries goods.
- Why it breaks: "成了市场" isn't shown. The action doesn't read in one glance.
- Fix:
  - Bring one stall into open floor in the clear zone right of the tree (x≈1550–1750, feet y≈850).
  - Seat a vendor on a stool behind its baskets (`sit` on a declared stool surface).
  - Have one buyer bend toward a basket holding out a coin or bag, and send one porter with a shoulder pole and two baskets walking across.
  - Keep the hidden stalls as background.

**14. The "西干 · 死了" label sits on the carved stele, not the dead trunk.** r2/f_97.5
- Wrong: the label (x 210–650, y 640–720) covers the stele's carved tree. The leader line at x≈695 doesn't touch the label.
- Why it breaks: text on an important picture part, pointing at the wrong object. It reads as "the carving is dead".
- Fix: put the label just left of the dead trunk at its mid-height (x≈420–680, y≈470), clear of the stele. Run a short horizontal leader that touches the trunk outline (x≈720), like the "东干 · 活着 / 32厘米" layout at 100.5, which works.

---

## NICE

15. **Painter.** f_65.2 → f_66.0: his body is frozen (pixel diff 0) while "物" is written on the scroll, and the brush stays at the paper's left end for the whole shot. Give the brush a short travel to the right end and lift it on the last character.
16. **Seedlings copy the old tree's scars.** people_r2 f_115.7 → f_118.1, r2 f_119–122.5: twin trunks, a cavity, a broken stub. A seedling has a single slim stem, so these read as bonsai clones. If the director wants "small copies", keep the twin-lean silhouette but drop the cavity and stub, and keep the trunks slim.
17. **The legend figure is ~30 m tall** next to a 46 m mound (230 px vs 355 px). That is fine as an apparition, but make it read as one: a soft glow edge, lower opacity toward the feet, a slow rise. Keep him facing right toward the far mountain (Mount Tai, east), which is a good touch.
18. **Nobody collects the seeds** (r1 #27, still open). r2/f_108.0 has a basket and no person. Add one crouching collector, or a pair of hands holding the basket. The cones are still ~10× too big for cypress cones.
19. **People peek through the V between the two trunks.** f_79.6 (x≈1265), f_127.2 (x≈1255): a head shows in the gap, which reads as someone inside the tree. Shift those paths ±60 px.
20. **Crossfade ghosts.** f_80.5: translucent soldiers from the next framing show through stele 2 and its turtle. f_114.9: two mound outlines overlap. r2/f_14.4 and f_57.5: a half-transparent stele at right. Use cuts or camera moves for these hand-overs, or fade the people layer out before the background crossfade.
21. **Caption crosses the page edge** (r1 #30, still open). r2/f_34.9: "《水經注》卷二十四" starts at x≈420 and crosses the page's inner frame line (≈452). Start it at x≥470.
22. **Light direction** (r1 #31, still open). The mountain's lit face is on the right, while the steles and trunks are lit from the left.
23. **Inscription over the carving.** r2/f_75.6: the vertical inscription on the stele runs over the carved tree. Set it in the stele's right margin.
24. **Tree height.** Next to the now true-scale people (170 px), the tree reads ~8 m against the 11.5 m label. Optional: raise the crown by ~25 % in the 2024 wide shot.

---

## Fixed since r1 (don't touch)

- **Cooking reads (r1 #1):** one soldier kneels at fire 1, one stirs with a long ladle whose tip is inside the pot rim, one holds a bowl toward fire 2, and steam rises from the pots. Only the stick contact (#2) and the hats (#1) remain.
- **Nobody stands in a pot (r1 #2).**
- **Contact shadows under every person (r1 #11).** Soft ellipses under the Qing group, the soldiers and the visitors.
- **Photographers (r1 #4):** both stand on open floor, phones in hand at head height, facing the tree (left one faces right, right one faces left) with a clear line of sight, and the phone glow pulses. Keep the poses.
- **The 1762 group (r1 #6–9):**
  - Three figures spaced apart with no merging.
  - Attendants in straight robes, standing half a step back, facing the emperor.
  - The emperor marked by a gold rim and standing beside the table (not in its leg), bent from the hips with the brush upright on the paper.
  - The group stands on a ground line clear of the counter.
- **The 1771 hand-over (r1 #10):** at 66.8 the 1762 figures and table are gone before the stele arrives.
- **Stalls (r1 #13):** bamboo poles, flat shade, round baskets. No European awnings.
- **Scale (r1 #16):** back-row people are ~110 px against a ~165 px wall. Foreground people are ~170 px against ~270–300 px steles and the tree.
- **The 唐槐 now stands beyond the wall (r1 #15, #33),** with its trunk hidden by the wall top and branches joined to the crown. It loses its leaves to a bare skeleton.
- **Subtitles vs pictures:** the bamboo slips start below the subtitle (r1 #19). The 11.5 m bar runs from the tree base to the crown top (r1 #20). The "32厘米" bracket sits on the bark strip.
- **Era continuity:** no pavilion in 1762 or earlier, the pavilion from 1771 on, the bare smoke-killed cypresses still there at 92.0. The dotted "望着" eye-line now runs from the carved tree to the live tree's branch.
- **茂陵:** the legend figure's feet are on the mound top with a Han topknot and cap. The seedlings stand on the ground with shadows.
