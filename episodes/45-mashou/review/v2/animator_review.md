# ep45 《马首回家，用了160年》 v2: animator / logic-check review (round 2)

Reviewer: animator + logic checker. I reviewed only and changed no project file except this one.
Film: `ep45_film_v2_review.mp4` (154.17 s, untrimmed; times below are film seconds and match lines.json).
Method: 26 contact sheets at 2 fps; 4–10 fps strips of every action beat (carry, march, fountain noon, B4, auctions, 2007 withdrawal, Ho's walk, museum, both unveilings, truck, K5); about 20 full-res frames and crops; an automated edge-band scan (10 fps, all four edges); a frozen-frame scan (10 fps). Evidence is in `/tmp/claude-0/-home-claude/7db4c2b1-160e-5062-86b7-9eb552e585fb/scratchpad/anim2/`.

---

## Round-1 status

| v1 | Status | Note |
|---|---|---|
| B1 curled ear | **FIXED** | The near ear is curled in C1, every post-1989 shot and H7/H8, and the ring lands on it. The ear is straight in 1760 and 1860 shots, which tells the story well. |
| B2 spout from back of head | **FIXED** | The horse faces the pool and the arc leaves the mouth (A6, A7, K1–K4). |
| B3 navy edge bands | **FIXED** | The edge scan found no canvas band. The only flags were scenes that are dark by design (number card, end card, ear close-up vignette). |
| M1 2007 drawn as a live auction | Mostly fixed | C4 is now a 私下成交 card, and D7 has paddles down, the hammer lifted and the 撤拍 stamp. Two leftovers are in MINOR 3 and 4. |
| M2 paddle arm from the head | **FIXED** | |
| M3 frozen ceremonies | Partly | D14 (certificate, four hands on it) and D5 (handshake with a pump) are fixed. C5/E2 has a new problem: see MAJOR 4. |
| M4 Ho frozen reach | Partly | He now walks and signs, but he overshoots and pops into the signing pose: see MAJOR 5. |
| M5 museum walk-through | **FIXED** | The man stops and looks, and the bodies no longer overlap. MINOR 7 covers what's left. |
| M6 looters / fire / counter | (b) fire **FIXED**, (c) counter sync **FIXED**, (a) **NOT FIXED and worse** | See BLOCKER 1. |
| M7 casting | Partly | Hands are on the ladle now, and the mould breaks instead of opening. Scale and shards are wrong: see MAJOR 2. |
| M8 head floats off | **FIXED** | The soldier carries the head in both hands. The smoke is still stacked ellipses (MINOR 10). |
| M9 soldier costume | Partly | The ponytail and top hats are gone, but the "kepi" still reads as a 1940s fedora: see MAJOR 3. |
| M10 drop / home design | **FIXED** | One 正觉寺 design is used at C6, H1b, H3 and H5, with a camera push on the drop and no 西洋楼 arch. |
| M11 museums on the lawn | **FIXED** | They now sit behind the wall in a city layer. |
| M12 「今天」 over the intact fountain | Partly | K1 is now 「记忆里的水力钟」, but K2–K4 still stamp 今天 over it: see MAJOR 6. |
| M13 dragon sale | Mostly fixed | A paddle is up, the hammer falls on 146.82 and the outline has antlers. The flicker is missing (MINOR 12). |
| M14 static stretches | **FIXED** | D3 is now a bidding war and E4 breathes. |

---

## BLOCKER

### 1. 0:40.2–0:48.4 (B1–B4): soldiers walk on the pool water, a looter's leg passes through you, then you vanish by yourself on 「你被带走了」
- **What's wrong**
  - **(a) Walking on water.** All three soldiers (B1) and all three looters (B2) have their feet on the pool surface, between the two rows of heads. At 41.8 the middle soldier's foot lands on the rat head's stone body. At 45.2 two looters stride across the water (feet at y ≈ 860, inside the pool, whose near edge is at y ≈ 930).
  - **(b) Wrong z-order.** At 45.2 and 47.85–48.05 the right-hand looter's leg is drawn **over** your head, so his leg cuts through the bronze. Your stone seat is at y ≈ 1050, nearer the camera than his feet at y ≈ 860, so you should be drawn on top.
  - **(c) Nobody takes you.** Three looters carry crates and a vase straight past you (still M6a). Then at 48.30 you disappear between two frames (48.25 present, 48.35 gone): a pure pop-out, timed to 「你被带走了」. The other eleven pop out the same way while the counter runs.
- **Why a viewer notices:** this is the film's crime scene. The men look like they are wading across the fountain, one kicks through you, and you evaporate. The line says 「带走」 and nobody carries anything.
- **Fix**
  - Walk the soldiers and looters on the paving **in front of** the near ends of both rows: ground y ≥ 1000 at 1080p, smaller scale (h ≈ 380). Or walk them behind the far end of the pool, on the terrace at y ≈ 590, at h ≈ 200. Never between the rows.
  - In `March` (film45.tsx ~l.86), `g = 860` is the problem. Use a ground line outside the pool polygon, and register the pool polygon as a no-walk zone in the pose/ground check.
  - Sort every figure and every statue by its ground y each frame.
  - Change the B2 carry kinds to crate / vase / **horse**. The third (right-hand) looter walks to your seat (B2, about 46.0), stops, puts both hands under your jaw and neck (R8: the head stays at his hands every frame), lifts you and walks off right with you at chest height. Your seat is empty from that moment.
  - In B4 (`B4_ORDER` starts with 马) drop 马 from the list, because you are already gone. Give the other eleven a 6–8-frame lift + fade + dust puff instead of a one-frame cut.

---

## MAJOR

### 1. 0:32.27–0:34.53 (A6 「你是午时」): you never spout alone
- **What's wrong:** under 「你是午时」 the picture shows someone else's hour. From 32.2 to 33.3 a **left-row** head is the one spouting while you sit dry. At 33.45 the whole right row starts at once, then everyone joins. Facts F3: during 午时 only the horse spouts, and the other eleven join at 12:00 exactly. The intended beat (your arc alone, then the ripple at 34.53) never appears. The cause is in `F_A3`: `ripA = TL.A7 - 2*P_` starts the "all" ripple about 1 s before A7, while `hourAt` is still on 巳 during the A6 push.
- **Fix:** from TL.A6 to TL.A7 − 0.1, use `arcs='one'` with `active='马'` at full height (snap `hourAt` to 6 at TL.A6). Start the ripple at ≥ 34.40 so the others join on the 34.53 downbeat.

### 2. 0:21.0–0:24.9 (A1 casting): the head is half a man's height and the mould shatters into floating glass panes
- **What's wrong**
  - **Scale.** At 23.2–24.9 the finished head is about 330 px tall next to a caster about 600 px tall, so it is 55 % of a person's height (rule: about ¼). It is the biggest head in the film.
  - **Shards.** The mould breaks into flat, **translucent** grey rectangles (you can see the head through them), and they hang in the air around it at 23.0–23.3. Clay is opaque and falls.
  - **Stream.** The molten stream curls upward into a hook (21.0–22.0) instead of falling into the sprue.
  - **Cap.** The caster wears a forward-peaked cap that reads as a baseball cap. A Qing 匠人 should be bare-headed with a queue, or wear a 瓜皮帽.
- **Fix:** scale the head (and the mould with it) to about 0.27 × the caster's height, or bring the caster forward. Make the shards opaque terracotta, irregular with curved faces, falling under gravity (accelerating) and coming to rest on the floor or bench by 23.6. Draw the stream as a straight, slightly tapering fall. Swap the cap.

### 3. 0:03.4–0:05.6, 0:40.2–0:48.1 (1860 soldiers): the "kepi" reads as a fedora, so they look like 1940s gangsters
- **What's wrong:** `Kepi` (sets45.tsx:194) draws a rounded crown with a light hatband stripe across it and a pointed down-swept brim, which is a trilby. The long knee-length overcoats complete the look. M9 is only half fixed.
- **Fix:** kepi silhouette. Flat top tilted **forward**, crown taller at the back than the front, short flat square visor, no band stripe; an optional thin lighter line at the very bottom only. Shell jacket to the hip with cross-belts, trousers below. Keep the coat only if it is a short greatcoat with a belt.

### 4. 0:10.4–0:12.4 (C5) and 1:40.3–1:42.4 (E2): the unveiling cloth hangs over the official's head with no arm holding it
- **What's wrong:** after the pull, the red cloth hangs straight down **in front of the right man's head and face** for about 2 s. The only sign of his hand is a small dark knob above the cloth, and his arm is never visible (full frame 11.2). It reads as a red hood or a floating cloth. The left man holds the same outstretched presenting arm, frozen, for the whole 2.6 s.
- **Fix:** he pulls the cloth sideways and down to his side: right arm visible from shoulder to hand, cloth bunched in the hand, its lower half draping to knee height beside him. Never raise it above shoulder height. After the reveal, the left man lowers his arm and both turn toward the horse (ceremony photo), or they shake hands over the plinth (the v1 M3 suggestion).

### 5. 1:16.7–1:18.3 (D8): Ho overshoots the desk, then pops into the signing pose
- **What's wrong:** Ho walks behind the desk and keeps striding past the paper. His feet poke out beyond the desk's right edge at 77.2–78.1. Then in a single frame (78.12 → 78.25) he snaps from mid-stride into a bent signing pose about 110 px further left. This is a visible pose and position pop.
- **Fix:** end the walk with the stance foot at the paper's x by 77.4. Then do a 0.5 s settle: stop, weight shift, lean forward and bring the hand to the paper. Interpolate the pose; don't swap it. Show the pen in the hand.

### 6. 2:21.7–2:26.8 (K2–K4): 「今天」 stamped over the intact 海晏堂, with you back on your seat spouting
- **What's wrong:** K1 now reads as a memory, but from 141.73 the stamp is 「今天 · 保利4 · 国博2」 / 「今天 · 龙蛇羊鸡狗」. The picture is still the intact palace, a full pool, and you on your original seat spouting. Literally, it says you are back at 海晏堂 today. Facts correction 1: you are in 正觉寺, and 海晏堂 is a ruin. The "memory" treatment is only a mild desaturation, with no sepia, grain or ruin underneath.
- **Fix:** either (a) at K2, cross-dissolve the palace and pool to the present-day ruin (broken arches, dry basin) and keep you only as a warm ghost outline with your arc, or (b) keep the memory look through K4 and change the stamp to 「记忆里 · 正午」 with the counts on a second line. Either way, no solid you on a real seat under 「今天」.

---

## MINOR

1. **2:01.1–2:05.0 (H3, 「回到中国的有七个」):** the six brothers float in mid-air around the 正觉寺 gate, at roof and door height and over the wall. Visually they hover. Logically, during 「回到中国」 the picture puts them at *your* home, three seconds before the twist says they are not there. **Fix:** bring them in over a Beijing skyline layer (the same one H4 uses), already on the far side of the wall, and leave only you at the gate.
2. **Every auction (52.0–56.8, 59.5–64.0, 84.5–88.9):** the auctioneer holds the gavel straight up for 4–5 s at a time while bidding goes on. Real auctioneers keep it low and lift it only for the last call. **Fix:** gavel at rest or chest height. Lift it about 0.6 s before each strike, with an open-hand point toward the active bidder in between.
3. **0:08.0–0:10.0 (C4) and 1:19.5–1:20.6 (D9):** the 私下成交 card counts up (2446万 → 6362万 → 6910万), which reads as live bidding, the very thing the private sale wasn't. The man behind the desk in C4 has no arms (head and shoulders only). **Fix:** the card lands showing 6910万, and the number does not roll. Give him a forearm and pen on the paper.
4. **1:10.5–1:13.2 (D6/D7):** paddles 23 and 41 are both up through 「这一次，锤子没有落下」, so a bidding round is shown for a lot that was never offered. **Fix:** paddles stay on laps (one bidder can half-lift and lower it), and the drop happens at 73.2 as now.
5. **1:14.9–1:15.3 (D7 → D8 push):** the 撤拍 board slides into the top-right corner and overlaps the date stamp and logo for about 0.4 s, which looks like a collision. **Fix:** push toward the plinth only, or fade the board before it reaches y < 340.
6. **0:59.5–1:00.3 (D3):** paddle 23 is up while the table is still empty, and then the three heads fade in on the table with nobody placing them. **Fix:** a porter in gloves sets each one down on its beat, or start the paddles only after the 虎 lands.
7. **1:38.2–1:39.4 (E1):** a stray partial limb flickers at the left frame edge, a third visitor who never enters. The woman walks past without once turning toward you. **Fix:** let the third visitor enter fully or not at all, and turn her head toward the case for about 0.5 s as she passes.
8. **0:12.5–0:14.7, 1:56–2:11 (正觉寺 gate):** the head on its plinth fills about 40 % of the doorway height, which makes it about 1 m tall. **Fix:** scale it to about ¼ of a person standing in that doorway (about 15 % of the door height), or move the plinth forward of the gate.
9. **2:18.3–2:31.0 (K1–K5):** the bottom-left counter sits on top of the front-left statue (K1–K4) and on bidder 41's legs (K5). **Fix:** give it a scrim, or keep figures and statues above y ≈ 880 in these shots.
10. **0:03.4–0:05.6 (C2):** the background smoke is still rows of grey ellipses (dumplings/clouds). **Fix:** soft rising plumes with a flame-orange underlight.
11. **0:25–0:40, 2:18–2:26 (fountain order):** the horse is the end seat, with the sheep beside it, and two heads read as rats (one per row). Sources (澎湃 2019) put the horse's row as 鼠·虎·龙·马·猴·狗. **Fix:** check the row order against the source and make each head design unique.
12. **2:26.8–2:31.3 (K5):** the dashed dragon is static and larger than the plinth top, with a dashed line trailing off its left edge. **Fix:** scale it to the horse's size, keep it on the plinth, and flicker it between dashed and half-lit about every 0.5 s through 「真假，说不清」.
13. **0:26.6–0:28.8 (A3 wide):** 2.2 s with no motion at all. **Fix:** a slow 2 % drift, or let the first hour's arc begin here.

---

## What works (keep)
- **The ear:** curled from 1989 on and straight in 1760/1860. It quietly tells the story of the journey, and the H8 ring lands right on it.
- **Fountain fix:** mouths aim inward and the arcs read as water.
- **D14 certificate:** four hands on one sheet, both men facing each other, the rat and rabbit on the plinth. Use it as the model for C5/E2.
- **D3/D1 bidding:** paddles alternate on the beat, losers drop at the strike and the winner's paddle stays up. Bidders' arms come from the shoulder.
- **The 2007 beat:** the hammer lifts and does not fall, then 撤拍. It's clear.
- **Ho's walk-in:** heel-planted steps, and he passes correctly behind the plinth (apart from MAJOR 5).
- **H1a truck:** wheels turn and the scenery scrolls. Night turns to dusk as you reach 圆明园.
- **H4:** the brothers settle in two museums behind the wall, and the 回国 7 / 回家 1 counter reads instantly.
- **The fire behind 海晏堂 (B2)** finally pays off 「一把火」.
