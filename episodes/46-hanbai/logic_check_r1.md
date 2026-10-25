# ep46 汉柏 — logic check r1 (illustration and human behaviour)

Scope: every JPG in `review/qa/frames/people/` (41 frames, 59.6–135.9 s) and `review/qa/frames/kf/` (38 key frames, 0.4–152.5 s), checked against `lines.json`, figure-rules R1–R8 and the owner-notes rows for art-director/animator. Code checks already pass (feet on the ground, joints, hands not in the torso, balance, hand targets, nobody inside a stele or the tree base). This list covers only what a person sees.
Coordinates are pixels on the 1920×1080 frame.

Severity: **BLOCKING** = the owner will catch it (it is one of his named complaints). **SHOULD** = fix in this round. **NICE** = polish.

---

## BLOCKING

**1. Soldiers "烧火做饭" but nobody cooks.** f_81.4 → f_90.4, kf20–kf22 (80.4–91.1 s)
- Wrong: the three soldiers stand straight with their arms hanging, 40–100 px from the pots. The pose is the same in every frame for 10 s. Nobody feeds the fire, stirs, ladles or holds a bowl, and no steam rises from either pot.
- Why it breaks: the subtitle says 烧火做饭, and the picture shows men standing next to a fire. It is the "feeding the fish / just waving his hands" note again: the action has to read in one glance.
- Fix: give each soldier a job with the prop in hand, using ikArm to the real contact points:
  - (a) soldier at x≈320 crouches (`crouch`), one hand pushing a stick into fire 1 (hand at the flame base, y≈890);
  - (b) soldier at x≈540 stands at the pot and stirs with a long ladle (hand on the ladle end, ladle tip inside the pot rim), with a slow stir loop;
  - (c) soldier at x≈650 holds a bowl at chest height toward pot 2.

  Add a thin steam plume above each pot. If the pose stays the same, give it a full cycle (lift → stir → lift), not a bob.

**2. The stall girl stands in the cooking pot.** f_81.4 → f_86.8 (x≈760, pot 2); f_88.6 → f_90.4 (x≈1550, same girl and pot after the pan)
- Wrong: her feet end exactly on the rim of pot 2. The pot and tripod hide her lower legs, so she reads as standing on top of the pot or inside it.
- Why it breaks: a person seems to be standing inside an object. Code doesn't catch it because her feet are on her own ground line, deeper than the pot. The trouble is that the two outlines meet exactly on screen.
- Fix: keep her soles clearly visible on the floor. Either move fire 2 + tripod ≈70 px right (x≈830), or move the girl ≈60 px left so she stands under the green awning beside the stall table. Check that no foot meets a pot, tripod leg or flame outline in any frame.

**3. Merged one-tone silhouettes make bodies no human has.**
- f_81.4 (80.9–81.8 s), soldier at x≈320: a passer-by walking behind him shows only a forward arm at shoulder height (x≈300, y≈725) and a back foot kicked out at knee height (x≈290, y≈790). He reads as a soldier with three arms and three legs.
- f_82.3 / kf20 (82.4 s): the long-gown woman at x≈700 overlaps soldier 3's head and shoulder and they fuse into one shape.
- f_126.0 (x≈720–800): two visitors walking in opposite directions overlap almost exactly, giving one body with two offset heads and four legs (crop: two heads, four feet, one torso).
- Why it breaks: a body no human could make. Same-colour silhouettes have no inner edge, so any overlap becomes one creature. This is the "legs from the chest" family of mistakes.
- Fix: a rule for every crowd shot. Two figures in the same tone must never overlap by more than ~15 % of their width unless one is clearly in front: feet ≥25 px lower on screen, and a 3–4 px light separation edge (the scene already uses this cream halo on some figures, so apply it to all). Re-time the passer-by so she clears the soldier before or after him. Offset the 126.0 pair by ≥60 px horizontally, or put one 40 px deeper (smaller and higher).

**4. "Two people photographing the tree" doesn't read.** f_125.1 → f_135.0, kf32–kf34
- Right photographer (x≈1810–1840): she stands pressed against the right edge of the far-right stele, face and hands touching the stone. Her phone is hidden by the stele and her body looks glued into it. She reads as someone hiding behind a stone, not taking a photo.
- Left photographer (x≈545–600): the phone is raised to his eye (good), but stele 3 (x 585–655) stands a few px in front of the phone. He is photographing a stone at point-blank range, and the tree (x 1100–1500) is fully blocked.
- Why it breaks: the contact doesn't connect (no visible phone on the right), and he is not facing what he is doing (the line of sight is blocked).
- Fix:
  - Move the right photographer ≈130 px right, clear of the stele (x≈1880–1900, or bring her to x≈1620 in front of the stele on a lower ground line). Turn her to face left at the tree, phone held out at arm's length in profile, screen-glow dot on.
  - Move the left photographer ≈90 px left (x≈455) so the phone has a clear line between steles 2 and 3 toward the tree, or put him on a lower ground line in front of stele 3. Raise the phone slightly above eye level, tilted up toward the crown.
  - Optional: a faint dashed eye-line from each phone to the tree for 1 s, the same style as the "望着" line in kf17.

---

## SHOULD

**5. The painter's hand is frozen while the painting draws itself.** f_62.4 → f_66.6 (62.3–66.8 s)
- Wrong: Qianlong's brush hand stays in the same pixel spot for 4.5 s, while strokes appear one by one in the scroll bubble.
- Why: the stroke has no cause. In a still it reads as writing, but in motion it reads as a statue.
- Fix: drive the brush tip along a small path over the paper strip (x 770–900, y≈805), in sync with each stroke that appears in the bubble. Lift between strokes, plus one dip to an inkstone at the table's right end. Head and shoulders follow the hand slightly.

**6. Qianlong walks into and stands inside the table leg.** f_61.7, f_62.4 → f_67.3
- Wrong: the table is a flat side elevation whose front leg (x≈740) reaches the same floor line as his feet (y≈975).
  - At 61.7 his front foot passes through the left leg.
  - From 62.4 he stands with both feet on top of the leg line, so he is standing where the table is.
- Why: walking through an object. The table has no depth, so his feet share its footprint.
- Fix: stop him with his toes ≈15 px left of the leg (move him ~45 px left, or the table ~45 px right). He can still reach the left end of the paper, since he is already bent ~35°. Better still, give the table a ¾ top with back legs, so it has a depth he can stand beside.

**7. The entrance group merges into one blob, and the emperor can't be told apart.** f_59.6, f_60.3, f_61.0, kf14
- Wrong: the three figures overlap so tightly that 59.6 shows three hats on one dark mass and 60.3 shows two heads on one body. All three wear the identical hat and robe, so nothing says which one is 乾隆.
- Why: a merged crowd, and no way to tell who is who.
- Fix:
  - Space them ≥90 px apart in single file, with the emperor in front. Attendants follow half a step behind with heads slightly bowed and hands in their sleeves.
  - Mark the emperor in silhouette: a taller hat with a larger pearl finial, plus a longer robe with a horse-hoof cuff.
  - Attendants can carry the brush box or rolled paper (see #23).

**8. The attendants' robes change shape and look like Western gowns.** f_59.6 → f_61.7 vs f_62.4 on
- Wrong: while walking, the robes flare into wide bell skirts (crinoline-like) to the floor. As soon as the men stop (62.4) they snap into straight tubes.
- Why: wrong era, because Qing court robes are straight-cut and slit, never belled. The costume pop also reads as a different person.
- Fix: one robe outline for both states: straight-cut, falling to the ankle, with a small kick of the hem on the stride. Add a queue (辫子) down the back of each Qing figure. In profile it is the clearest marker of 1762.

**9. The age counter sits on the characters' feet.** f_60.3 → f_67.3, kf14–kf15
- Wrong: the "相传 · 你 1871 岁" counter (y 950–1015) covers the attendants' feet and hems. At 61.0–61.7 the walkers' legs pass behind "1871".
- Why: text colliding with the main action, and the feet are exactly what tells you whether they stand on the ground.
- Fix: put the 1762 group on a ground line ~60 px higher (feet y≈915, scale 0.92 for depth), or start the group right of x≈680. Do not move the counter, because it is fixed across the film.

**10. The 1771 stele dissolves through the 1762 painter and table.** f_67.3 (66.8–68 s)
- Wrong: under the subtitle "1771年，他把画刻成石碑", the new stele fades in on the table's spot. Its base overlaps the table legs and the painter while all three 1762 figures are still fully visible.
- Why: two objects in one place, and props from the earlier scene still on screen in the next (owner rule: the outgoing scene leaves before the new one arrives).
- Fix: fade the three figures, the table and the scroll bubble out completely over ~0.4 s before the stele starts to appear. Or let the stele rise from the scroll bubble's position after the table is gone.

**11. People cast no shadows, while everything else does.** all people frames
- Wrong: steles, the tree, the table and the fires all have a soft ground shadow or glow. No person has a contact shadow (checked under Qianlong, soldiers, visitors and photographers).
- Why: shadows are inconsistent, and figures look pasted on rather than standing.
- Fix: add a flattened dark ellipse under each figure (width ≈ stance, opacity ≈ that of the stele shadows), offset slightly in the same direction as the stele shadows. Near the fires, add a short shadow pointing away from the flame.

**12. 1928 soldiers and civilians wear 2024 clothes.** f_79.6 → f_90.4, kf19–kf22
- Soldiers' caps have the same rounded crown and short visor as the 2024 tourists' baseball caps (compare f_81.4 x≈320 with f_126.0 x≈560). They have no belt, strap, puttees or rifle, so they read as workers or tourists.
- f_79.6 (x≈1490): a 1928 passer-by wears a rectangular backpack, the same rig as the 2024 visitor at f_134.1.
- Most 1928 men share the modern slim-jacket and trouser rig.
- Why: wrong era (same family as the "cities floating / envelopes in 757" note).
- Fix:
  - Soldiers: a flat-topped peaked cap (Republican army cap) or a padded winter cap with ear flaps, a belt with a cross strap, leg wraps, and a stack of 3 rifles leaning together beside one fire.
  - Civilians: men in 长衫 with a 瓜皮帽 or felt hat, a porter with a shoulder pole and two baskets. Women keep the bob, qipao and 袄裙 (those work).
  - No backpacks before 2024.

**13. The 1928 stalls have European café awnings.** f_77.8 → f_90.4, kf19–kf22
- Wrong: striped awnings with scalloped edges over neat wooden counters look like a European farmers' market.
- Why: wrong era and region.
- Fix: bamboo-pole stalls with a flat cloth or reed-mat shade (no scallops), goods in round baskets and on cloths on the ground, and a vendor seated behind each one on a low stool (`sit` on a declared stool surface).

**14. A woman seems to sit in the air behind the left stele.** f_83.2 (x≈40–95, y 660–810)
- Wrong: the stele hides her standing leg, leaving her upright torso and one leg pointing forward and up. She reads as sitting on nothing, or kicking.
- Why: it looks like sitting in the air.
- Fix: time her walk so she is never cut at that pose: hide her completely behind the stele or show her completely. Alternatively, route her in front of the stele (lower ground line).

**15. 唐槐院: a woman walks into the trunk, and the canopy floats.** f_88.6 (and f_89.5)
- f_88.6 x≈40–110: her feet are on the same floor line as the locust's trunk base (y≈820), and her back half overlaps the trunk edge. In the next frame she is gone, so she has walked into the tree.
- f_88.6: the locust trunk ends in a Y with two flat-cut tops (x≈30–200, y≈480–500), and the round canopy sits above it with no branches joining them. The crown floats. Branch lines only appear at 89.5, after it has started to die.
- Fix: walk her on a ground line ≥40 px lower so she passes in front of the trunk, or ≥40 px higher so she passes behind it, never on the trunk's own floor line. Draw the branch lines from the Y-tops into the canopy from the first frame, then let them stay as the bare skeleton when the leaves fade.

**16. Scale: the wall is one person high, and the tree is far too short.** all courtyard frames
- Back-row people (feet y≈800–840, just in front of the wall base at y≈760) are ~170 px tall. The red wall (y 600–760) is ~160 px, so the palace wall is about 1.7 m, a garden fence, and the hall behind looks like a doll's house.
- The cypress (base y≈900, crown top y≈85) is ~820 px. A person at its depth would be ~230 px, so the tree reads as about 3.5 people (~6 m). kf26 labels it 11.5 m.
- Why: wrong scale between people, the wall, the hall and the tree.
- Fix:
  - Keep the props and shrink the back row: people walking along the wall get 90–110 px (scale ~0.6), and mid-floor people (feet y≈880) get ~150 px.
  - Keep foreground figures (Qianlong, soldiers, the photographer) where they are, but no foreground figure taller than ~1/5 of the tree's drawn height at its depth.

**17. Loose limbs poke out of steles.** f_125.1 (x≈650: a horizontal arm and one foot on the right side of stele 3; x≈940: one foot on the right of the carved stele); f_132.3 (x≈1690: a horizontal leg on the left of the far-right stele while the torso is on its right)
- Why: hands and feet appear with no body, which reads as limbs growing out of the stone (the "hands floating" note).
- Fix: route visitors' paths in the lanes between steles (or fully in front of or behind them), so an arm or leg is never the only visible part. If a figure must pass behind a stele, keep its lead edge hidden until the head appears.

**18. Smaller crowd clumps.** f_126.9 (x≈1480–1560, a woman directly behind a man), f_131.4 (x≈260–330, two caps stacked), f_132.3 (x≈1810–1850, a walker merging into the right photographer), f_134.1 (x≈1460–1720, three walkers almost touching)
- Fix: the same rule as #3. Space them ≥60 px apart, or set them at clearly different depths with a separation halo. "来了，又走了" reads better as a steady stream of separate people in both directions than as pairs glued together.

**19. The subtitle covers the bamboo slips' first characters.** kf08 (29.5 s)
- Wrong: line 2 "却一个字没提种树" (y 235–300) sits over the tops of the slips, hiding 征/太/大/太/太/元… that open each record.
- Fix: start the slips at y≥330 (the line-2 baseline plus 30 px), or shorten them from the top.

**20. The 11.5 m bar measures the stele, not the tree.** kf26 (104.0 s)
- Wrong: the bar sits at x≈1720, beside the far-right stele, and runs from y≈160 to 900. Its top is 75 px below the crown top (y≈85), and the label covers the right-hand tree.
- Fix: place the bar just right of the cypress crown (x≈1700 is fine only if ticks run horizontally to the trunk base at y≈900 and the crown top at y≈85), or put it at x≈1520, beside the trunk. Make both ticks meet the tree.

---

## NICE

21. **Painting bubble vs. table.** f_63.1 → f_66.6: the bubble shows a mounted hanging scroll with rollers, but he paints on a flat sheet. Show unmounted paper in the bubble during 62–66 s, and mount it only at 66.8 s, just before the stele.
22. **The painting table reads as a modern side table** (thin legs, no apron or stretchers). Give it a 画案 silhouette: recessed thick legs, an apron, stretchers, brush rest and inkstone.
23. **Attendants have empty hands.** One holds the brush box, one holds the paper weight or inkstone, which ties them into the action.
24. **Fire light on soldiers.** Add a warm rim on the side facing each fire.
25. **f_124.2 crossfade.** Visitors show through the dissolving dead trunk (x≈880). Bring the visitors in after the trunk close-up has gone.
26. **Passing-pose frames.** f_130.5 (x≈680) and f_133.2 (x≈1440) catch walkers with feet together and knees bent, which reads as crouching. Fine in motion. If stills go to the owner, choose a contact-pose frame.
27. **Seeds.** kf27: the seeds are drawn orange-sized next to a 3–4 m stele, and nobody is collecting them. Scale them to small cones in a basket and add a pair of hands or one crouching collector.
28. **Maoling mound trees.** kf29–kf31: the trees on the mound are trunkless green ovals that float on the slope. Give them short trunks or make them clumps sitting on the surface.
29. **Climax subtitle placement.** kf34 / f_134.1: "你一直在。" sits on the dead trunk's broken tip and the carved stele's top, covering the hero object. Move it ~80 px up into the sky.
30. **Source caption off the page.** kf09: "北魏 郦道元《水经注》卷二十四" starts at x≈318, left of the page edge (x≈340). Move it inside.
31. **Light direction.** The mountain's lit face is on the right, while steles and trunks are lit from the left (dark band on their right edge). Pick one key direction (left matches the steles and tree glow) and flip the mountain shading.
32. **f_85.9 x≈1130–1160.** A figure behind the left trunk shows as a dark lump with one foot. Hide him fully or show his head.
33. **"对面院子" looks like the same courtyard.** 87.7–90.9: the 唐槐 courtyard is the same space panned, with the same steles, soldiers and stalls, including the 1771 carved stele, which belongs to the 汉柏 courtyard. A wall or gate between the two courtyards would make "对面" true.

---

## What works (keep it)

- **Qianlong's painting pose:** bent from the hips over the table, head bowed to the paper, brush upright in the hand, tip on the paper's left end, facing the tree he is drawing. The bubble's tail points to the table, and the drawing builds stroke by stroke, then the 数千年神物 inscription is added. The idea is right; only the hand motion (#5) and foot position (#6) need fixing.
- **Entrance direction and stance:** everyone walks the way they face, feet planted. The attendants stand watching the painter at a respectful distance.
- **Era markers that land:** Qing red-tasselled summer hats in 1762, the bob and qipao on the 1928 woman, caps, backpacks and phones in 2024, the truck and road in 2024.
- **The 1928 shopper (f_78.7, x≈680) reaching into the fruit** reads as buying. Walkers have real strides with alternating arms.
- **Fire, pot and tripod** with a warm floor glow. Smoke thickens into 烟熏火燎, and the background cypress goes bare at 85.9–86.8. The cause and effect is clear. Soldiers face their own fire.
- **The phone-flash glow** on the left photographer (kf33) is a good detail once his line of sight is cleared.
- **2024 crowd:** walkers going both ways, a couple holding hands (f_129.6, x≈1030–1110), "来了，又走了" as movement.
- **The "石头里的你，望着真的你" dotted eye-line** from the carved tree to the real tree (kf17) is a clean way to show "looking".
- **Ground contact:** no one floats or sits in the air in the main cast. Steles, tree and table all stand on the floor with shadows. The wall, hall, mountain and Maoling all sit on ground lines (no "floating cities").
