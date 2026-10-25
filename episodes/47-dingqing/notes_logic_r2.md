# ep47 illustration-logic check, round 2: rendered film `out/ep47_v2.mp4`

Checker: independent logic pass on the actual render (145.13 s, 30 fps). I made 726 stills every 0.2 s, plus frame-by-frame or 0.1–0.15 s sheets through every action. Contact sheets are in `/tmp/claude-0/-home-claude/80d4d845-657a-5caf-b801-b3009dd8b8fb/scratchpad/logic3/`:
- `sheets/s5_01–25.jpg`: the whole film at 0.2 s.
- `det/*.jpg`: toss, fence, rings, crack, raise, gate, stall, return, return_end, moon, pin, pin_pop, tang_give, turn, emperor, drop_hit, open_rise.
- `full/*.jpg`: full-resolution crops.

Rig convention: an unflipped figure faces right, `flip` makes it face left, and LHand is the near hand.

**Verdict: one BLOCKER (the reunion), five MAJOR.** Most round-1 items are really fixed. See the table at the end.

---

## BLOCKER

### B1. 63.40–63.97 (Return): the reunion mirror joins in mid-air, with nobody holding it
- **What I see:** At 63.75 (`full/r.jpg`, middle) the princess is still in mid-stride with her front foot lifted. 徐德言's arms hang at his sides the whole scene. Their two halves leave their hands at 63.46 and close into a whole mirror that floats between them. The push-in (63.6–63.97) then frames two figures with their arms down and a glowing disc hanging in the air. This is the payoff of the 破镜重圆 story.
- **Why:** `t1 = 0.8 + (1300-960)/v` ends after the scene does. At h=360 the natural walk covers 340 px in more than 1.4 s, so `t1 > d - 0.05` (d = 2.264). As a result she never reaches the `stand` state, and `raise` (which starts at t1+0.05) never starts. That is also why his pose (`mixPose(stand, offer, raise)`) never lifts. `join` (from d−0.5) runs anyway and pulls both halves out of their hands.
- **Fix (`Return` in `scenes47.tsx`):** Have them walk toward each other so that each covers half the distance, and finish early.
  ```ts
  const open = ease(seg(u, 0, 0.5));
  const gapHands = 2 * PZ.offer.LHand[0] * h + R + 8;          // both offer hands meet, as in CodaCouple
  const xuX0 = 1640, prX0 = 960, half = (xuX0 - prX0 - gapHands) / 2;
  const tw0 = 0.5, t1 = tw0 + half / v;                         // ASSERT t1 <= d - 0.75; if not, start Xu at 1500
  const wk = walkNat(u, tw0, t1, prX0, 1, h, PZ.stand), xw = walkNat(u, tw0, t1, xuX0, -1, h, PZ.stand);
  const raise = ease(seg(u, t1, t1 + 0.3)), join = ease(seg(u, t1 + 0.3, t1 + 0.55));
  prPose = wk.moving ? wk.pose : mixPose(PZ.stand, PZ.offer, raise); xuPose = xw.moving ? xw.pose : mixPose(PZ.stand, PZ.offer, raise);
  ```
  Draw Xu at `xw.x`, not at 1640. Because the hands meet, M (the hand midpoint) is within about 10 px of each hand, so the halves stay in the hands while they close. Keep the push at `seg(u, d-0.35, d)`. Re-run check47 afterwards.

---

## MAJOR

### M1. 67.90–68.15 (Tang): the hairpin teleports from her bun to above her hand
- **What I see:** From 67.8 her hand hovers about 60 px above and in front of the bun, never on the pin. At 68.150 (`det/pin_pop.jpg`) the pin jumps in a single frame from the bun, tilted −60°, to upright above her raised hand: a jump of about 70 px plus a 60° snap. This is the "draws it from her bun" beat that gate-1 asked for.
- **Why:** `wornAt` switches from `bun` to `yL-20` at U=1.9, and `rot` switches from −60 to 0 at the same instant.
- **Fix:**
  1. Tune `PZ.reachHead` (la/le) so that `jointAt(reachHead,'LHand')` lands on `bun` (±8 px) at U=1.8.
  2. Add `const pull = ease(seg(U,1.8,2.2))`.
  3. Set `wornAt = U<1.8 ? bun : U<3.0 ? lerp2(lerp2(bun, [yL[0], yL[1]-20], pull), pinMid, draw) : pinMid`.
  4. Pass `rot={lerp(-60, 0, pull)}` while U<2.2.

### M2. 120.26–123.61 (Tang coda, and 77.8–79.8): the subtitle sits on 杨贵妃 and her hall
- **What I see:** At 121.5 (`full/x.jpg`, bottom-left) the cloud-terrace figure and her hall are directly behind 「…后来重圆了。」 and 「一个人间。」 (her body is at x≈880, y 50–270). The hall roof is also cut by the top edge. The same crowding shows at 78.4, where the scrim edge falls on her.
- **Fix (`Tang`):** Add a horizontal camera target. Replace `translate(${-960},${-cy})` with `translate(${-cx},${-cy})`, using `cx = tag==='coda' ? 280 : lerp(960, 280, back)` and `cy = tag==='coda' ? 900 : lerp(camY, 900, back)`. With z=0.5 she lands at about (1200, ground 370, head 180), her hall at 1350, the emperor at 1310 / ground 910, and the lower hall at 1100. Everything is then clear of the text box (x<1100).

### M3. 103.4–105.2 (LookBack): the four drifters pile into one heap, and the bike rolls backwards
- **What I see:** At 104.3 (`full/x.jpg`, top-right) the bike, pager, quince and rings all overlap one another at x≈960, on top of the left mirror half. The pager runs through the bike, and the quince sits inside its wheel. The bike faces right (handlebars on the right) but drifts right-to-left, so it rolls backwards.
- **Fix:**
  - Use two lanes below the halves, which reach down to y≈710. Objects moving left-to-right (quince, pager) go at y=800. Objects moving right-to-left (rings, bike) go at y=930.
  - Stagger the windows so that objects in the same lane are never within 500 px of each other: quince 6.6–8.6, pager 7.4–9.4, rings 6.8–8.8, bike 7.6–9.6 (local u).
  - Mirror the bike so it rolls forward: `<g transform={`translate(${bx},740) scale(-1,1) translate(${-bx},-740)`}>`.

### M4. 48.1–51.5 (Market): the halves swell 1.5× and stand on the stall roofs
- **What I see:** Over 0.45 s, r goes from 64 to 96: a held object growing in mid-air. Each half ends up on the trapezoid stall top, which reads as an awning or roof. The lacquer rest has the same colour and shape as the brick awning of stall 2, so that half looks stuck into the roof. At r=96, each half is about 2/3 of the stall's width.
- **Fix:**
  - Keep `r = 64`, with no lerp on r. The match cut from Pojing1 then holds its size.
  - Turn each stall into a roof on posts: roof trapezoid from y 520 to 580, two posts from 580 to 700, counter box from 700 to 800.
  - Stand each half on a 镜架 on the counter top: draw the rest as a thin two-leg A-frame from y 668 to 700 in `PP.ink` or ochre, not lacquer. Put the half centre at y≈600.

### M5. 110.4–116.0 (Drop): the story line runs over the left avatar bubble, and the bubbles belong to the wrong people
- **What I see:** During the 1.25→1.0 pull-back (110.5–111.3), 「东西换了又换，这一招还在：」 passes over the left bubble. After that, the 「：」 sits on the bubble's top edge (112.5, `full/drop2.jpg`), and the moon sits on the end of the line. Separately, the left window holds the man but his bubble shows the girl, and the right window holds the woman but her bubble shows the boy. With split couple avatars, each person uses their own half.
- **Fix:**
  - Set `Cam y 520 → 460` in `Drop`. This moves all content down by 60 px, putting the bubble top at about 232 even at z=1.25.
  - Move the moon to `(1500, 200)`.
  - Put the woman (`LK.woman`, unflipped, facing right) in the left window and the man (`LK.man`, `flip`) in the right one, so that each person's bubble shows them.

---

## MINOR

1. **5.66–6.9 (Open):** The mirror half rises up through the tabletop (`det/open_rise.jpg`), then hangs in the air above the table for 3 s. **Fix:** Slide it in from the right edge at its final height, `x: lerp(2100, 1030, mirrorIn)`, and stand it on a small 镜架 on the table (rest at y≈840, half centre ≈ 670 so its bottom sits on the rest), or keep it as a faint ghost overlay at opacity 0.6.
2. **14.89 (Shijing):** The jade pendant pops into his hand from nothing at u=3.0. **Fix:** Hang it on his belt from u=0 (`JadeBi` at `jointAt(pose,'Hips')` +[10,10], s 0.36). Move it to `RHand` over 2.9–3.2.
3. **22–25.4 (Shijing close):** The big quince and the jade, whose cord hangs from nothing, float in the empty field. **Fix:** Lay them on a low stone or the fence's top rail at y≈700, or end the jade's cord in a small hand-held loop.
4. **39.06–41.5 (Pojing1), also 38.9 (Donghan lock):** The "whole" mirror already shows the zigzag crack before it breaks. **Fix:** Give `Mirror` a `seam` prop (opacity 0–1). Set it to `crack` in Pojing1 and Donghan, and to 1 in Title, Meet and CodaMirror.
5. **47.0–47.3 (Pojing1):** The raised halves top out at y≈240 and touch the right edge of the scrim. **Fix:** Aim the `showFace` hands about 40 px lower, or keep the scrim at text width (gate3 note 6).
6. **49–51.5 (Market):** The lantern rope's left end stops in the sky at (1120,250). **Fix:** Run it from x=−40, or tie it to a pole at x=1120 that reaches down to the stall roof.
7. **52.0–54.2 (Gate):** The guards walk left along the wall face and fade at x≈1000, so they read as passing across the doorway rather than going through it. **Fix:** Once a guard is inside the opening (x<1160), turn him to face in. Use a 0.2 s shrink to 0.85 with a slight y lift of −10 px before the fade, so he reads as walking away into the depth.
8. **62.50 (Return):** Her half mirror pops into her hand when the walk starts (`u>=0.8`). **Fix:** Draw it from u=0, in the same draw-order branch as her figure.
9. **59.4–61.7 (Poem):** The paper "lying on the desk" stands upright, 650 px tall, and its bottom edge hangs over the front of the desk. **Fix:** Foreshorten it into a trapezoid lying on the desk (y 760–900), with the text skewed to match. Or prop it on a small book stand (书架).
10. **79.8–88.3 (Seventies):** The bike still stands upright with no kickstand (round-1 #23). **Fix:** Add a rear 双撑 kickstand, two struts from the rear axle to the ground. Also, the couple's hands sit exactly on the 囍 door's edges, so they read as carrying a placard. **Fix:** Use gx 740 / bx 1180.
11. **106.4–106.97 (LookBack→DropClose):** The hairpin prongs fade out in flight instead of landing (only the halves land). **Fix:** Fly the prongs to the seam too, `T ± 20`, and fade only over the last 2 frames, or let them land as the gold seam line in DropClose.
12. **14–20 (Shijing), the fence:** It is still a short end-on stub (round-1 #14). It works in perspective but reads as a small crate at phone size. It is also drawn over the boy's rear leg at 15.1. **Fix:** Draw the fence before the figure who stands behind it (the boy), or lengthen it toward the camera (`y` up to g+140).

---

## Round-1 items: checked on the render

| r1 | Status | Evidence |
|---|---|---|
| 1 Drop phones | **Fixed** | Real-size phone at the chest, both people looking down (112.5) |
| 2 Hairpin size | **Fixed** (scale). New pop → M1 | Prong ≈ 60 px; reads as a flower pin (69.8) |
| 3 Return order | **Fixed** | She is behind the leaves until they open (61.86–62.4). Join is broken → B1 |
| 4 Stall roof | **Fixed** | Roof at y 320–380, clear of his head (55.6) |
| 5 Mirror sizes | Gate/Stall **fixed**. Market swells → M4 | Stall halves are equal (56.9) |
| 6 Gate | **Mostly** → minor 7 | Studs on leaves, figures go in one by one |
| 7 Market | **Partly** → M4, minor 6 | Lanterns on a rope. Halves on roofs |
| 8 Rings off tray | **Fixed** | Rings rise and lock into the mirror, match cut at 39.06 |
| 9 Messenger arm | **Fixed** | Arm down by 77.2 |
| 10 Open text | **Fixed** | Phones clear of the text (8.0) |
| 11 Quince toss | **Fixed** | Arc stays below the text, caught at 13.8 |
| 12 杨素 vs Xu | **Fixed** | Plum robe, 幞头, taller |
| 13 LookBack prong | **Fixed** | Prongs at y≈560 |
| 14 Fence | Not done (end-on variant) → minor 12 | |
| 15 Ring scale | **Fixed** | |
| 16 雙 highlights | **Fixed** | Gold only on 雙 (36.0) |
| 17 Pojing moon | **Fixed** | Moon at (1640,330) |
| 18 Market moon | **Fixed** | Between the halves |
| 19 Messenger turn | **Fixed** | 0.3 s stand, flip at 73.38 |
| 20 Messenger pop-in | **Fixed** | Enters from the right edge |
| 21 Messenger look | **Fixed** | Tunic, trousers, beard |
| 22 Return halves | Done, but the join floats → B1 | |
| 23 Seventies | Rack, chain guard, tag and watch bubble done. Kickstand missing → minor 10 | |
| 24 Pager | **Fixed** | Rests on the band with a shadow |
| 25 Phone stands | **Fixed** | |
| 26 Poem desk | Desk added. Paper upright → minor 9 | |
| 27 Shijing close | **Fixed** | People fade out first |
| 28 Drifters | Added, but they collide and the bike rolls backwards → M3 | |
| 29 guan hat | **Fixed** (bun) | |
| 30 Drop punch | **Fixed** | DropClose now carries the punch, on the dark band |

Walk directions match facing in every walk (Shijing, Gate, Stall, Return, both messenger walks). I saw no foot sliding at natural speed, and nobody passes through a closed door.
