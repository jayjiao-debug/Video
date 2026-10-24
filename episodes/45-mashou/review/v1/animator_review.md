# ep45 《马首回家，用了160年》 v1: animator / logic-check review

Reviewer: animator + logic checker (review only; no project file changed except this one).
Sources: all 46 contact sheets, about 25 single frames enlarged 2–5× (crops in the scratchpad), owner-notes.md (all rows), figure-rules.md R1–R8, script.md (v3), facts.md.
Times are film seconds (m:ss in brackets).

---

## BLOCKER

### B1. 2:11.5–2:17.6 (131.5–137.6): the "curled ear" is not curled
- **What's wrong:** H7 says 「你的一只耳朵卷了」 and H8 puts a highlight ring on the ear. In the drawing, both ears are identical, straight, pointed leaves. The ring circles a perfectly normal left ear (checked at 4×).
- **Why a viewer notices:** the line tells them to look at the ear, they look, and nothing is wrong. This is the film's most personal detail (the scar of the journey), and the picture contradicts it. Owner row 11: no line whose plain reading isn't what the film shows.
- **Fix:** redraw one ear (the near/left one, the one the ring targets) with its top third folded outward and down: a soft "dog-ear" curl, a crease line where it bends, a darker inner face showing, and the tip pointing about 100° from the other ear. Keep the other ear straight so the asymmetry reads. At 131.33 start on the head; at 133.0 push in 15 % toward the ear; let the ring land at 134.72 (H8) on the fold itself. Use the same curled ear in every later shot of the head (C1 at 0:00, the end card) so it stays consistent. C1 can keep the curl too; it is the 2026 head.

### B2. 0:25–0:40 and 2:18–2:26: the horse spouts water from the back of its head and faces away from the pool
- **What's wrong:** on the right-hand row, the horse's muzzle points right, out of the garden and away from the pool. Its water arc starts at the mane and back of the skull and falls left into the pool (enlarged at 0:34.00 and 0:38.00). A4/A6/A7 and K1/K2 all show this. The real heads sat in two rows facing each other across the pool, and each spouted from its **mouth**.
- **Why a viewer notices:** A6 「你是午时」 is the one shot where the camera pushes in on your own spout, and the water visibly comes out of the back of your neck. It's the emotional key image (noon = you) and it reads as a mistake.
- **Fix:** mirror the horse (and check each right-row head: every head's muzzle must point toward the pool centre). Start the arc emitter at the mouth tip and launch it up and inward. The left row is already roughly right; match it. Re-check 0:25 (close-up), 0:33.4 (A6 push), 0:34.7–40 (A7), 2:18–2:26 (K1/K2/K4).

### B3. Frame edges exposed (the navy canvas shows): about 10 shots
The scene layer pans or pushes without overscan, so a flat navy band appears at the frame edge (measured on the frames, then × 3 for 1080p):

| Time | Edge | Size at 1080p |
|---|---|---|
| 0:33.0–0:34.3 (A6 push) | right + bottom | right ≈ 180 px, bottom ≈ 48 px: very visible |
| 0:48.3–0:50.1 (B4 close) | right + bottom | right ≈ 63 px, bottom ≈ 145 px: very visible |
| 2:11.5–2:17.6 (ear close-up) | right + top | right 85→265 px |
| 0:08.0–0:10.0, 0:52.3–0:59.3, 1:09.8–1:14, 1:25–1:33.2, 2:27–2:30.6 (auction rooms) | left | 18–60 px |
| 1:37–1:39.4 (museum) | left, right, top | 30–75 px |
| 1:42.7–1:49 (armchair room) | left | 15–57 px |

- **Why a viewer notices:** it looks like an unfinished render, the "prop didn't render whole" class of error (owner row 18). The A6 and B4 bands take up about 10 % of the frame.
- **Fix:** render every scene canvas at ≥ 112 % of the frame, or clamp the camera so `scale × canvas ≥ frame` on every frame of every move. Add an edge check to QA: sample the 4 edge columns/rows for the navy RGB on every frame and fail if more than 3 px in a row match.

---

## MAJOR

### M1. 0:08–0:10 (C4) and 1:09.8–1:15.1 (D6–D7): the 2007 sale is drawn as a live auction it never was
- **What's wrong:** C4 shows paddles 23 and 41 up, the hammer raised, and the LOT board counting up to "HK$ 6910万". In D6–D7 the same paddles stay up while 「锤子没有落下」. Facts F12/F13: the public sale was stopped, and Ho bought the head **privately before the auction** (D8 says so). The picture in C4 says it was bid up to 6910万 in the room.
- **Why a viewer notices:** at D8 they hear 「拍卖前…买下了你」 after already seeing a bidding war reach 6910万 in C4. The two shots contradict each other.
- **Fix:** C4: no paddles and no rising LOT board. Show the price on a closed contract or a private-sale tag (a folded card with "HK$ 6910万" sliding across a desk), with the hammer resting unused on the lectern. D6–D7: open on the room with paddles going **down**. The auctioneer raises the hammer at 72.46, holds it (a slight hesitation tremor of 2–3 px, not frozen), then lowers it without striking as the LOT board flips to 「撤拍 / WITHDRAWN」 on the stamp's 国家文物局 beat. Staff can carry the horse off the stand at 75.0, which cuts naturally to Ho at 75.3.

### M2. 0:52–1:15 and 2:27–2:31: bidders raise the paddle from the top of the head
- **What's wrong:** every raised-paddle arm starts at the crown or back of the skull, not at the shoulder (enlarged at 0:54.00 and 1:10.00). Shoulder and upper arm are missing, and the arm grows straight out of the head.
- **Why a viewer notices:** the owner has flagged this exact class of error (rows 74–75: "why is his hand below his neck", "shouldn't his arm be like here"). It's in every auction shot, which is about 35 s of the film.
- **Fix:** shoulder joint at the top-centre of the torso. Upper arm goes up and slightly forward at about 160°, elbow nearly straight, hand gripping the paddle handle at the bottom of the stick, with the paddle disc above head height and clear of the head by ≥ 15 px. Keep the gap between head and arm visible in silhouette (light shows through). Run `pose_check.mjs` on the auction shots.

### M3. 0:10.4–0:12.3, 1:33.6–1:36.6, 1:39.8–1:42.3 (donations) and 1:06.4–1:09.4 (handshake): frozen figures reaching at nothing
- **What's wrong:** each donation is the same rig. Two men stand either side of a plinth, each with one arm stretched out, and both hands stop in mid-air short of the object and of each other. The frames are identical for 2.5–3 s (no motion at all). D5's handshake is also frozen for 3 s, with both men turned away from the pig head they're dealing with. Standing men also carry a rectangular block on the back of the torso (the coat tail) that reads as a backpack (enlarged at 0:11.00).
- **Why a viewer notices:** R5/R6, hand with no purpose. "Is he feeding the fish? He's just waving" (owner row 77). The same pose three times reads as copy-paste, and it's a static shot each time.
- **Fix:** give each one a real ceremony action:
  - **C5/E2 2019 (国博):** an official on the right holds a framed **捐赠证书**. Ho's representative steps in, the two shake hands *over* the plinth (right hand to right hand, hands meeting), and both turn their heads to the horse, then to the camera, as in a ceremony photo.
  - **D14 2013:** the two men pull a cloth off the rat and rabbit together (cloth slides off, both hands on the cloth).
  - **D5 2003:** keep the handshake but animate it (two pumps, about 0.4 s each), with the bodies angled so the pig head on its stand is between and in front of them.

  Remove the back block: let the coat end in a smooth line at the hip. Owner row 124 asks for a silhouette that reads as human in one tone.

### M4. 1:15.5–1:21.3 (D8–D9): Ho frozen with his arm out for 6 s, hand hovering beside the artefact
- **What's wrong:** same frozen reach for 5.8 s (probe-flagged 75.6–79.2). The hand floats about 60 px from the bronze. Collectors don't paw a lot either.
- **Fix:** Ho walks in from the left (3 steps), stops at a small desk beside the plinth, and signs (pen in hand, paper on the desk). On D9's slam (79.25) the number lands as he lifts the pen. The horse's glow warms one step. Eyes and face are toward the horse after signing.

### M5. 1:36.8–1:39.6 (E1): museum visitors ignore the exhibit and walk through each other
- **What's wrong:** both visitors walk past without once turning toward the horse. At 1:38.21 they overlap: one walks left, one walks right, and their bodies and hands merge (enlarged). At 1:39.0 their legs interleave.
- **Why a viewer notices:** people at an exhibition look at the exhibit. Two bodies passing through each other is 穿模 (owner row 43).
- **Fix:** time-lapse of 3–4 groups at different depths (scale 0.9/1.0/1.1 with clear z-order). Each group walks in, **stops** facing the case, turns heads to the horse (one points, one holds up a phone: 2007–2019, so a slab phone is fine), holds about 0.6 s, then walks on. Never let two figures share the same depth when crossing; pass one behind the other with the near one drawn on top.

### M6. 0:43.8–0:52.1 (B2–B4): looters leave every bronze head behind, there's no fire, and the counter disagrees with the picture
- **What's wrong:**
  - **(a)** Three men carry boxes and a vase straight past twelve glowing bronze heads. 「能搬走的都被搬走」 sits over a picture where the most portable treasure stays put.
  - **(b)** 「然后一把火」 shows only darker sky. The building stays white and intact, with no flame.
  - **(c)** In B4 (48.3–52.0) the counter drops 12 → 10 → 2 → 0 while 11 heads are still sitting on their bodies.
- **Fix:**
  - **(a)** The last looter (right) stops at the horse, lifts it with both hands under the jaw and neck, and walks off holding it at chest height (R8: head at the hands every frame). The counter can stay 12 until B4.
  - **(b)** At 46.5 orange light rises behind the building: flame tongues above the roofline and windows glowing, with smoke drifting, peaking at 47.9 (B4 cut). This pays off C2.
  - **(c)** In B4, remove the heads one by one in sync with the counter (each fades and lifts out with a small dust puff), so 0/12 = twelve empty necks.

### M7. 0:21–0:24.7 (A1): ladle pours by itself; the horse then hangs in mid-air
- **What's wrong:** the long-handled ladle tilts with no one holding it. The handle end swings free in the air (enlarged at 0:22.00). The "mould" is a two-door cabinet that opens like a wardrobe. At 0:24.0 the finished head hangs in the air between the doors, with no stand and no ground contact.
- **Fix:** either show the caster's hands and forearms (sleeves of a Qing artisan's 短褂) gripping the ladle handle with both hands, or crop to the lip of the ladle and the stream only, so no free handle is visible. For lost-wax casting (F5), the mould is **broken** away, not opened. A clay shell cracks on the beat and falls in pieces, revealing the head standing on its base on the workbench. Its base plate sits on a surface.

### M8. 0:03.6–0:05.5 (C2): the head floats up off its body by itself
- **What's wrong:** "你被抢走" shows the head rising off the stone body and out of the top of the frame with nothing carrying it. Owner rule: nothing floats (row 121).
- **Fix:** two dark gloved hands (sleeve cuffs of a 1860 uniform) enter from the top, close on the jaw and neck, and lift. Or a silhouette shoulder passes in front, wiping the head away. Add a flame-orange reflection sweeping across the copper as the script planned. The current grey stacked ellipses read as clouds or dumplings, not smoke.

### M9. 0:40.4–0:47.9 (B1–B2): 1860 soldiers drawn as civilians, one in a baseball cap
- **What's wrong:** two of the three wear top hats (civilian gentlemen's hats) and have a ponytail or queue sticking out behind the head (enlarged at 0:43.00), which on an Anglo-French soldier reads as a Qing queue or a woman. The middle man's round cap with a forward brim reads as a modern baseball cap.
- **Fix:** British: a forage cap (flat round cap, small peak) or a shako (tall, flat-topped, with a peak); French: a **kepi** (flat top tilted forward, short square visor). Short hair, no ponytail. Shell jackets to the hip, plus cross-belts as a strong silhouette cue. Owner row 121 covers era-consistent props.

### M10. 1:56–2:05 (H1b–H3): the film's biggest drop lands on a still pavilion, and the home doesn't match
- **What's wrong:**
  - **(a)** 116.04 is the DROP. H1b and H3 are one fixed frame of a small open kiosk on a lawn for about 9 s (probe-flagged 121.2–125.1; 116.3–121.0 is also static). Owner row 88: the emotional peak needs the most spectacular image.
  - **(b)** "正觉寺 · 文殊亭" is drawn as an open-sided garden kiosk with the head exposed to weather. Twelve seconds later H5 shows 正觉寺 as a red-walled temple compound. The same home is drawn as two different buildings. The 文殊亭 exhibit is indoors.
  - **(c)** A ruined European arch stands beside it, which places it at the 西洋楼 ruins. facts.md correction 1: it is **not** at the original site.
- **Fix:** build one 正觉寺 design (the H5 red wall plus a gate) and use it at C6, H1b, H3 and H5. On the drop, the truck from H1a pulls up and the gate swings open. Push in through the gate into the hall, where the head under its case lights up (the brightest frame of the film). From there, crane up and out over the garden for H2/H3, so the camera is moving the whole time. Drop the arch, or put the 西洋楼 ruin far in the distance across water.

### M11. 2:06–2:08 (H4): the "museums in the city" stand on the same lawn as you
- **What's wrong:** the 保利 and 国家博物馆 cards sit 20 m from the pavilion on the same grass, overlapping the willow. The twist is that they're **not** in the garden, but the picture puts them in it. The labels are about 27 px at 1080p.
- **Fix:** split the frame. The garden is on the left; a wall or road (or a city skyline layer far behind, lower contrast) is on the right. The six glows sit in two buildings across that boundary. Labels ≥ 40 px (owner row 69).

### M12. 2:18–2:26 (K1–K4): "今天 · 正午" over an intact fountain with all twelve heads
- **What's wrong:** the stamp says 今天, but the picture is the 1760s fountain, intact, with every head spouting and the horse back on its seat. Today 海晏堂 is a ruin and the horse is in 正觉寺, so read literally the picture says the opposite of the facts (correction 1). The script asked for "a translucent memory".
- **Fix:** draw it as a memory: desaturated or sepia, 60 % opacity, a faint paper grain, with the present-day ruin (broken columns, empty basin) showing through underneath. Change the stamp to 「本该 · 正午」 or 「乾隆年间 · 正午」. When the memory fades at K2 (141.17), the ruin remains, and only your arc (from the mouth) glows over it.

### M13. 2:27–2:31 (K5): the "疑似龙首" sale has no bidders, no hammer fall and no motion, and the outline reads as the rabbit
- **What's wrong:**
  - It's sold, but no paddle is raised at any point.
  - The hammer is already down when the shot opens, so the strike is never seen, although 146.82 is the FINAL HIT.
  - Frames 147.1–150.8 are identical.
  - The dashed "?" outline has two tall curved ears, which reads as the rabbit the viewer saw sold in Paris a minute earlier.
- **Fix:** open at 146.3 with the hammer raised and one paddle up (or a telephone-bidder clerk at the side holding a receiver with the other hand raised). The hammer strikes on 146.82. The outline is a dragon: two branching antlers, a long snout, whiskers. Then it flickers between half-lit and dashed every ~0.5 s through 150.8, which carries "真假说不清" and kills the still.

### M14. Other static stretches (owner: no still frames)
- **59.7–64.0 (D3):** the hammer arm is frozen up and the paddles are fixed for 4.3 s. Fix: a bidding war. Paddles 23/41/17 alternate up and down on the beats, the LOT board ticks, and the auctioneer's open hand swings to each bidder. The paddles drop as the hammer lands on 63.97.
- **105.6–110.4 (E4):** the deliberate pause is right, but 4.8 s of identical frame reads as a freeze (owner row 91). Keep it still only through the silence (105.98–106.96). Then do a very slow 3 % push-in on the empty chair, the star in the window brightening, and a curtain edge stirring, so the picture breathes into H1a.

---

## MINOR

1. **0:56.5–0:57 and 1:03.97:** the gavel lands at or over the front edge of the lectern, in air. Add a sound block on the lectern top and land the gavel head on it, with a two-frame squash.
2. **Auction scale:** the lectern is about 87 % of a standing bidder's height and the auctioneer's torso rises far above it, making him about 1.4× the bidders. Add a visible two-step dais under the rostrum, or lower the lectern to waist height.
3. **1:03.97 (D4):** ox, monkey and tiger sold under one hammer in one room, but the stamp says 佳士得 · 苏富比 (two houses, two sales). Either show two quick hammers in two wall colours, or keep one and drop the second house from the stamp. The three heads are also an indistinct brown pile: give the ox horns, the monkey's round ears and the tiger's stripes, spaced apart.
4. **0:17.6–0:18.0 rewind:** the year counter reads 1908 / 1892 / 1861 over auction rooms, which implies auctions in those years. Run the years over the rewind tracking noise only, or show them on shots from their own era.
5. **0:33.0 (A6):** the 「水力钟」 plaque slides into the bottom-left counter and overlaps "12/12". Fade the plaque before the push, or move it to the pool's front-centre.
6. **0:40.4–0:47.9:** the walkers' legs pass over the counter dial. Keep figures above y ≈ 900 at 1080p, or draw the counter on top with its own scrim.
7. **2:28–2:30.6 (K5):** the subtitle's 「清。」 runs into the stamp 「2018.12.17 · 法国」. Shorten the stamp (「2018 · 法国」) or let the subtitle wrap. Same risk at 1:46–1:50: the centred E4 line sits on the window bars, and the stamp overlaps the window frame (move the window left).
8. **1:29–1:33:** the €31,490,000 lot card is propped half off the table front at an angle, so it looks stuck to the table edge. Stand it upright on the table, or hold it in a clerk's hand.
9. **2:08–2:11 (H5):** the ghost fire around the temple is drawn as orange cones and reads as traffic cones. Use flame tongues with a flicker, fading as they meet the wall.
10. **2:06:** the stamp says 「回园 1」 but the counter says 「回家 1」. Use one word, 回家 (as the device plan says).
11. **0:39.0 (A7):** a thick, flat white band drops vertically into the pool from the right-hand arcs, a stroke-width spike. Clamp the stroke width.
12. **1:21.7 / 0:45:** the 0:45 vase is fine for the era (Qing blue-and-white). The armchair, lamp and truck are fine for their eras. Noted so nobody "fixes" them.

---

## What works (keep)
- The auction device reads right: paddles go up **before** the hammer, the losers drop theirs at the strike, the winner's stays up, the auctioneer faces the room, and the wall colour changes per city and year.
- The 未付款 stamp landing on the lot card (1:32) is instantly clear.
- Bidders sit properly: chair under the hips, thighs forward, feet on the floor (R3 passes).
- The H1a truck drives forward with its beam in front, and the beam enters before the truck; night turns to dawn across the cut.
- The lamp switching off at 1:43.9 is a quiet, true image for E3.
- The counter matches the story at every step (12 → 0 → 3 → 4 → 5 → 7, then 回家 1). The stamps agree with the subtitles everywhere except the two noted (M1 picture and M12 「今天」).
- C7's twelve-slot board (lit, dashed, horse glowing) and K4's five dashed outlines are the clearest "count" images in the film.
- The rewind (◀◀ + tracking lines + years running back) is fast and reads as a rewind (owner row 123).
