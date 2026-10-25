# ep47 illustration-logic check, round 1

Checker: independent logic pass. Sources: kf_v3 (40 frames), ep47_keyframes_v3.jpg, script.md, scenes47.tsx / kit47.tsx / pose47.ts / timeline47.ts / film47.tsx. I rendered 143 extra stills, every 0.3 s through each hand-over (12.2–19.0, 42.0–46.2, 54.4–57.1, 61.7–64.0, 70.0–78.2) plus spot checks elsewhere. They are in `/tmp/claude-0/-home-claude/80d4d845-657a-5caf-b801-b3009dd8b8fb/scratchpad/logic/` (contact sheets `sheet_*.jpg`) and `.../logic2/`.

Rig convention used below: an unflipped figure faces right and its LHand is the near hand. With `flip` the figure faces left and LHand is still the near hand.

What already works: walk directions all match facing. Every hand-to-hand pass (jade over the fence at 17.3–17.9, the mirror half at 43.2–44.7, the stall join at 56.5–57.1, the hairpin at 72.4–72.8 and 76.3–76.9) meets at real hands with no gap and no teleport. Mirror halves keep the right sides throughout (he keeps L, she and later the servant hold R). The figures stand on the ground, nobody sits in the air, and there are no legs coming out of a chest.

---

## BLOCKER

### 1. 107.0–113.2 (Drop): the phones are tablet-sized, and they face the wrong way
- **What's wrong:** `Phone s={0.22}` is 145 px tall on a 330 px figure, so the phone is 44 % of body height. It covers the whole head and shoulders. The screen also faces the viewer while each person holds it in front of their face. They would be looking at the back of the phone.
- **Norm broken:** A phone is about 9 % of body height, and you look at its screen, not its back.
- **Fix:** In `Drop.fig()`, set the phone to `s≈0.075` (≈50 px) and hold it in the near hand at chest height, below the chin. Turn it to face the person: draw a dark phone back (or a thin edge-on slab) with a screen glow on the face. If the avatar halves must be readable here, show each one as a separate inset bubble (r≈90) over the window corner nearest the other building. DropClose (113.2) already shows the two halves big.

### 2. 66.2–79.8, 98.5–106, 120.3–123.6: the hairpin is sword-sized and reads as a flag
- **What's wrong:** `Hairpin s=0.5` (0.55 for the emperor) makes each prong about 220 px on a 380 px figure (45–58 % of height). With its little pennant head on a long shaft, it reads as a flag on a pole. This is clearest at 72.6 (the kept prong hangs from her hand to her knee), at 76.8 (the two men seem to pass a flagpole) and at 122.0 (it looks like two golf flags planted in a field).
- **Norm broken:** A 钗 is 15–25 cm, about 12 % of a person's height. It is worn or held between the fingers.
- **Fix:** In Tang, set `s≈0.18` on both storeys (prong ≈60 px at h=380). Redraw the head in `kit47 Hairpin` as a flower/phoenix cluster about as wide as the prong is long, not a single swept blade. Hold the pin between thumb and fingers: `keptAt = [yL[0], yL[1]-20]`, `sentAt` offsets −20 instead of −50/−54. In LookBack and CodaPin, keep the larger `s` there (they are symbol close-ups) but use the new head. In CodaPin, don't plant the earth prong in the ground: lay it flat on a windowsill or show it in the emperor's hand, and put the sky prong on the cloud.

### 3. 61.7–62.0 (Return): she is already outside before the gate opens
- **What's wrong:** At 61.9 the doors are still nearly closed (`open` runs 0–0.8 s), yet the princess (x=1000) and 杨素 (x=830) are drawn on top of the door leaves, so they stand outside the shut gate. Then she "walks out" from where she already is.
- **Norm broken:** Things happen in the wrong order, and nobody can pass through a closed door.
- **Fix:** Draw 杨素 and the princess before the door leaves, inside the opening (`x=900` and `x=960`). Make them smaller, `h*0.92`, so they read as just inside. Start her walk at `u=0.8`, once the doors are open, from x=960. Draw her after the leaves only once she is past the door plane (switch the draw order at u≈1.0, or clip her to the door rect until then). Optionally have 杨素 step to the threshold (walk 0.3 s to x=830 after u=0.8).

---

## MAJOR

### 4. 54.3–57.2 (Stall): the stall roof is at the servant's chest
- **What's wrong:** The awning sits at y 540–600 with posts 600–770. The servant (h=520, ground 930) has his head at about 400–460, so his head and shoulders stick up through his own stall roof (see 55.6 and 56.9).
- **Fix:** Raise the awning to `M1040,380 L1000,320 L1660,320 L1620,380 Z` and run the posts from 380 to 770. Alternatively, keep the roof and drop the lanterns, but the roof has to clear his hat by about 30 px.

### 5. 51.5–57.2 (Gate, Stall): the mirror halves are the wrong size and change size in his hand
- **What's wrong:** In the palace the mirror is r=64 on h=600 (ratio 0.107). In Gate her half is r=22 on h=450 (0.049). In Stall Xu's half is r=22 while the servant's is r=60 on h=520, so one half is a third the size of its partner. During the join (55.9–56.8) Xu's half then triples in size (`lerp(22, R, raise)`).
- **Norm broken:** An object can't change scale, and two halves of one mirror must match.
- **Fix:** Use `r = 0.107*h` everywhere: Gate `r≈48`, Stall `r=56` for both halves, and no lerp on r in `stL`. Keep Xu's half at his hand with `+R*0.5` offsets, as Pojing1 does.

### 6. 51.5–54.3 (Gate): they walk across the gate, never into it, and the door studs float in the open doorway
- **What's wrong:** The guards start at 1420 and 1600 and walk left for 2.5 s. They end at about x=580 and 760, in front of the left wall, so they pass the doorway sideways and stop beside it (54.2). The line is "she is led into 杨素's house". Also, the stud circles are drawn after the dark opening rect, so at 53.0 gold dots hang in the empty doorway.
- **Fix:** (a) Draw the studs before the dark opening rect, or only on the leaves. (b) Make the doors swing: draw two leaves that narrow to 0 at the jambs. (c) Walk everyone to the doorway centre (stop the first guard at x=960). Once a figure reaches x≤1000, scale it down to 0.9 and fade it to 0 over 0.4 s, clipped to the door rect, so they go in one by one with the princess last. Her half mirror goes with her.

### 7. 48.1–51.5 (Market): the mirror halves and two lanterns hang from nothing
- **What's wrong:** Both halves (r=110) hover over the stall awnings with nobody holding them, which is exactly the owner's "objects floating" case. The two low lanterns at x=180 and 520 hang from strings that stop in mid-air at y≈430.
- **Fix:** Stand each half upright on the front ledge of a stall counter on a small wooden mirror stand (镜架, a simple two-leg rest, y=700). Left half on stall 2, right half on stall 3, tilts as now. Hang the two low lanterns from the stall awning corners (string from y=640 to 540) or from a second rope running across at y≈420.

### 8. 37.2–38.8 (Donghan): the rings slide off the tray
- **What's wrong:** At u 12.0–13.4 the rings move ±120 px. The right ring ends at x≈1568, past the tray's end at 1530, floating in the air beside the lamp post (38.8). The left ring slides on top of the pearl earrings (x≈1260).
- **Fix:** Use ±40 instead of ±120: left ring to 1340, right ring to 1488, both still on the tray. The script's "one ring slides to a hand" isn't drawn; if a hand is added, it should come in from the right edge and take the right ring.

### 9. 76.9–79.8 (Tang, earth): the messenger keeps his empty arm stretched out
- **What's wrong:** After the hand-over, `f2Pose` stays in `offerR`, so for about 3 s (77.5 to 79.6) the messenger holds an empty arm out toward the emperor while the emperor holds the pin up.
- **Fix:** `f2Pose = fIn.moving ? fIn.pose : u < tIn1+1.0 ? mixPose(PZ.stand, PZ.offerR, hand2) : mixPose(PZ.offerR, PZ.stand, ease(seg(u, tIn1+1.0, tIn1+1.6)))`. Optionally add a slight bow, lean +8, afterwards.

### 10. 5.7–9.0 (Open, 7.5): the subtitles cover the left avatar and the mirror half
- **What's wrong:** Three stacked rows (top 150–380) run across the left phone's avatar half (y 340–560) and the top of the incoming mirror half, so the subject of the shot is under text.
- **Fix:** In Open, lower the content by about 160 px (`Cam y=560 → 400`, or set phones `y=720` and the mirror `y=634`). Or keep at most two rows during C3 and drop C1 from the stack.

### 11. 12.8–13.9 (Shijing): the tossed quince disappears behind the text and off the top of the frame
- **What's wrong:** At 12.9 the quince in her raised hand sits behind 「《诗经》」. In flight (13.1–13.7) the arc (`-300*sin`) takes it to y≈40–130, through the subtitle scrim and the stamp row, nearly out of frame. The one action of the beat can't be seen.
- **Fix:** Lower the toss: arc height 300 → 140, and make the toss pose release forward and up at shoulder height (`la` ≈ 115, not 150), so the quince stays at y > 420 while x < 1000. Or move the scene's ground and figures down (g 900 → 980, h 560 → 520).

### 12. 61.7–64.0 (Return): 杨素 and 徐德言 look like twins
- **What's wrong:** Both use robe, guan, wide sleeves and near-identical height (1.06 vs 1). 杨素's full beard barely shows in silhouette. She walks from one identical man to another, so you can't tell who gives her up and who gets her back.
- **Fix:** Give 杨素 an official's 进贤冠 or a tall black cap, use `h*1.12`, and lighten his robe colour (e.g. `col` = lacquer/plum), so the ink-black figure is her husband. Keep Xu as he looked at the palace (42.9) and the stall.

### 13. 100.8–103.0 (LookBack): the left hairpin's head is under the subtitle exactly as 「金钗」 is spoken
- **What's wrong:** The left hairpin head (x 420, y≈370) sits under row 3 「金钗，一人一股」 and its dark scrim.
- **Fix:** Move both hairpins to `y=560` (head at about 500) and the left one to `x=380`. The fix for #2 also makes it smaller.

---

## MINOR

14. **12–20 s (Shijing), the fence:** The fence is a 140 px stub in an open field (`FX±70`). It separates nothing, so "over the fence" means nothing, and they could walk around it. **Fix:** run the fence across the whole width (`x0=-40, x1=1960`) as a low rail with posts. Her yard is on the left, his path on the right.
15. **28–38 s (Donghan), ring scale:** The finger rings (r=38) are more than half the size of the arm bangle (r=66), so they read as bracelets, while the line is 「银戒指」. **Fix:** rings `r=22`. Keep the pair touching.
16. **36–38.5 s (Donghan), 双 highlights:** The glow circles miss the 雙 characters and sit on 臂 (col 1), 中 (col 5) and 連 (col 7). **Fix:** `cy = 440 + 90 + idx*50 - 18` with `idx` = position of 雙 in each column (2, 3, 2, 3).
17. **41–47 s (Pojing1), the hidden moon:** The moon (1460,170) sits behind the stamp. When they "hold the halves to the light" (45–47), the glow comes from nowhere you can see. **Fix:** move the moon to `(1640, 330)`, clear of the stamp and above her raised hand.
18. **48–51 s (Market):** The full moon (300,170), which stands for 正月望日, is behind the subtitle rows. **Fix:** move it to `(1000, 160)` between the lantern rope and the text, or to the right of the rope.
19. **73.2 (Tang), instant turn:** At u=7.0 the messenger flips from facing left to facing right in one frame, and the prong jumps across his body. **Fix:** spend 0.3 s in `stand` (u 7.0–7.3), change `flip` at 7.15, and keep the prong in the near hand (LHand both before and after).
20. **74.6 (Tang), pop-in:** The messenger appears at world x=1640, which is about 1844 px on screen, already half in view. **Fix:** start `fIn` at x=1900 and lengthen `tIn1` to match.
21. **74.6–76.3 (Tang), messenger looks like her:** The messenger walks in wearing the same flared robe silhouette as 杨贵妃 (75.0), so he can read as her coming down herself. **Fix:** dress the 方士 in tunic + trousers, or give him a Taoist cap and a fly-whisk in the far hand, in both storeys.
22. **61.7–64.0 (Return), no mirror halves:** Neither of them carries their half at the reunion. **Fix:** her R half in her near hand while she walks (r=48), his L half in his near hand. They raise them as she stops at 63.6. This also sets up the whole mirror at 63.97.
23. **79.8–88.3 (Seventies):**
    - The bike stands upright with no stand. **Fix:** add a 1970s rear 双撑 kickstand, or lean it on the wall (rot −6 with the back wheel at the wall).
    - The frame reads as a modern single-speed. **Fix:** add a chain guard, fenders and a rear rack, which a 28" 永久/飞鸽 had.
    - The 「百余元」 tag covers the handlebars and top tube (87.0). **Fix:** move it to y=500.
    - The couple's heads cover the 囍. **Fix:** move the door/囍 up 60 px or put the couple at gx 780 / bx 1140.
    - The magnified watch floating on the wall reads as a wall clock. **Fix:** put it inside a round magnifier bubble with a fine outline.
24. **88.3–91.1 (Nineties):** The pager floats about 55 px above the desk line. **Fix:** set `y` so its bottom sits at 760 (y≈620), with a soft contact shadow.
25. **0–9, 113–145 s, phones on edge:** The phones stand upright on their bottom edges on a table, which can't balance. **Fix:** add a small phone stand or a lean-back wedge under each, or lay them flat with a top-down camera.
26. **59.4–61.7 (Poem):** The paper and the half mirror hang in empty space. **Fix:** add a desk top (band at y≈900). Lay the paper on it, slightly skewed, and stand the half mirror on a small stand.
27. **21–24.5 (Shijing close):** The giant quince and jade (s=1.25) fade in on top of the half-faded figures (23.0: the quince over her head). **Fix:** fade the people out by u≈9.8 before the objects come in, or bring the objects in from the frame edges.
28. **103–106 (LookBack):** Only the quince and two rings drift past; the bike and pager from the script are missing. One ring passes behind the subtitle at 104.5. **Fix:** add the bike and pager as faint drifters and keep all drift paths at y ≥ 480.
29. **Throughout (guan hat):** The `guan` head glyph (Xu, the Zhou boy, the 方士) is a flat brimmed disc on a bun and reads as a tiny Western top hat. **Fix:** draw the brimless 冠 as a small cap over the topknot with a pin through it.
30. **109.5 (Drop):** The centred punch subtitle runs over both figures' feet and the window sills. **Fix:** lift the windows/figures 60 px or drop the punch to `top=900` for this line.
