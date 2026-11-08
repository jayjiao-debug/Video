# Gate 2b notes: 《水浒人物志 · 壹 · 林冲》 storyboard v2 — verdict: REVISE

Reviewed: storyboard.md, chars/scenes16.mjs, manhua.mjs, fullbody2.mjs, fullbody.mjs (silhouettes), render6.mjs, all 20 frames at full size in /dev/shm/shz01/sb16, script.md v3, lines.json, facts.md, every row of owner-notes.md, and the v1 contact sheet (/dev/shm/shz01/sb) for comparison. There is no brief.md in the episode folder, so I used the owner direction from the producer's task.

Scores (gate 2b covers visual, info, edit and motion as planned): visual **1** · info **2** · edit **1** · motion **1** · sound n/a (no cues planned; the template needs a sound column). The script was scored at gate 1, but §6 lists where it conflicts with facts.md.

**Compared with v1** (portrait board): v2 is better on format (16:9 as the owner asked), the z/depth layer structure and the automatic checker. The shots, environments, the S09 arm and the S10 fist are unchanged, so nothing moved on the owner's three complaints. The 16:9 reframe also *introduced* a new fault: the busts now stop inside the frame (in v1's portrait frames they reached the bottom edge).

---

## 1. Verdict and the biggest problems

**REVISE.** The face design is the one strong asset. Everything around it fails on at least one blocking rule: floating heads, an arm growing out of the chin, mitten hands, props at the wrong scale, 15 script lines with no picture, and 20 hard cuts with no transition plan.

**P1. Body logic is broken in 8 of 20 frames, and the checker reports 0 issues.** (a) *Floating heads.* The neck in `front()` ends at local y = 618 with a stroked bottom edge, but the collar starts at 640. When `noScarf` is set (the 东京 look), the background shows through. Measured gaps: S18 55 px (y 784–839 at x = 1260); S06 22–33 px (y 245–295 at x = 560–580) through the hollow collar V in `fullbody2.mjs`. (b) *Busts that stop mid-frame.* `front()`/`side()` bodies end at local y = 800, only 0.62 head below the chin. The result is hard bottom edges in S03 (y≈948), S08 Gao (≈980), S09 Lin (1070) and Gao (1058), S11 (1018), S13 (912, slanted) and S18 (1000). (c) *S09 arm.* It is a 110-px stroked tube that starts at (790,860), in front of the goatee rather than at the shoulder, and ends in a 250-px sleeve block, with no elbow. This is the exact complaint in owner row 75. (d) *S12.* The wine flask pours by itself, with no hand. render6.mjs passed all of this because it only checks layers that cross the frame without permission. It never checks for a body that *fails* to reach the frame edge, for neck continuity, or for hand contact.

**P2. Proportions are off in ways a viewer feels as "wrong" without knowing why.** The full figure is 6.55 heads, not the 7.5 its header claims, so it reads as a big head on a narrow, short-armed body. The profile head is 25 % too shallow at the back. Necks are 0.40 of face width. Fists are 60 % of true size, and the hands in S02 are about half size against the paper. Gao's head is 2.3× the wife's at the same depth. The S19 hat is about 3× too big, and both spears are shorter than the man carrying them. All numbers are in §2.

**P3. The pictures don't stage the emotion of the line.** Most frames are a centred, flat-lit, ID-photo bust or a placeholder set: a box house, a plank on two posts for the temple, pegs for the crowd, pyramids for mountains, and a branch that reads as a power line. The wife is a pink capsule with a black ball for a head in four frames. The key actions are missing: 扳过 (spinning Gao round), the fist going soft, the stone pushed against the door from inside, the door bursting open. One frame is also logically wrong: S14 puts the stone *outside* an open door and shows the fire before the line says it starts. Lighting is uniform fill plus a vignette. No frame has a motivated key light on the hero.

**P4. 15 of 38 lines have no picture, including the film's two structural moments.** The missing lines are V08, V15, V16, V18, V19 (the promise, which is the thread of the whole film), V20, V21, V23, V24, V28 (the door on the drop at 93.7, the film's hardest hit), V30, V34, V35 and V37, plus the end card. The loudest music (128–142) sits on a static empty room (S19 holds 14 s) and a dimmed paper.

**P5. Every transition is a hard cut (20), and none is planned.** storyboard.md has 3 columns and no motion, transition or sound columns, which the template requires. The owner's notes ask for one continuous moving camera, motivated hand-overs and no repeated transition type (rows 15, 33, 56, 67, 86). See §4 for a budget of 2 hard cuts and 3 match cuts.

---

## 2. Proportions (measured from the code and the frames)

Units: H = head height, skull top to chin (in `front()`: y 206→572 = 366 units). Face width = cheek to cheek (196→404 = 208 units).

| Item | Where measured | Now | Target | File / function |
|---|---|---|---|---|
| Head-to-body | fullbody2 `fullFront`: head k = 0.73 → H = 267; skull top 169 → soles 1918 = 1749 | **6.55 H** (header says 7.5) | 7.3–7.5 H for 林冲 (L1 「八尺长短身材」: tallest in the cast); 高衙内/陆谦 ≈ 7 H; wife ≈ 6.8–7 H | fullbody2.mjs line 44: `k = 0.73 → ≈0.63` (H ≈ 231); keep the chin on the neck line and re-check total/H |
| Shoulder width | arm outer edges 282–722 = 440 units; face width 152 | 2.9 face widths | 3.3–3.5 face widths (bideltoid). Setting k = 0.63 alone gives ≈ 3.3 | fullbody2.mjs (no change needed once the head is rescaled) |
| Hanging arm | shoulder (640,504) → wrist (≈685,980) = 478 | 1.79 H; wrist at the sash, fingertips at y 1052 | 2.45 H (≈ 570 units at H = 231): wrist at the crotch (≈ y 1043), fingertips mid-thigh (≈ y 1230) | fullbody2.mjs lines 41–42 |
| Raised arm | upper arm (362,506) → elbow (≈300,775) = 276; forearm → wrist (≈395,655) = 150 | upper 1.03 H, **forearm 0.56 H** (stub) | upper 1.4 H (≈ 325), forearm 1.15 H (≈ 265) | fullbody2.mjs line 48 (and the same in fullbody.mjs lines 61, 112) |
| Hands (fist) | fullbody2 fists 66 × 78 units | 0.25 × 0.29 H | fist ≈ 0.38 W × 0.42 H of head (≈ 90 × 98); open hand, wrist crease to fingertip ≈ 0.75 H ≈ 0.9 × face height (chin→hairline) | fullbody2.mjs lines 42, 64 |
| Thighs | trouser width at the coat hem 86 units | 0.37 H (stilts) | ≥ 0.5 H (≈ 115) at the hem; shin with 绑腿 ≈ 0.38 H | fullbody2.mjs line 28 |
| Neck, front | `front()` neck path 258–342 | width 84 = **0.40 face width**; visible length 0.13–0.19 H | narrowest ≥ 0.6 face width (≈ 125), flaring to ≈ 0.85 (≈ 180) at the base with trapezius lines; length stays ≤ 0.3 H | manhua.mjs line 57: widen, extend to y ≈ 700, draw *before* the coat, no stroke on the bottom edge, fill the collar V (中衣 or skin) |
| Neck, profile | `side()` neck 262–330 (top), 256–338 (base) | depth 68–82 = 0.34–0.41 of head depth, vertical, starts under the ear | ≥ 0.55 of head depth (≈ 110), axis tilted forward 12–18°, back line from the occiput, trapezius slope into the shoulder | manhua.mjs line 200 |
| Profile skull | `side()` head path: back of head x = 208, ear centre ≈ 252, nose tip 410 | 44 units behind the ear (0.14 H); depth/height 0.63 | ≈ 0.35–0.38 H behind the ear; depth/height ≈ 0.85. Extend cranium and headscarf back ≈ 70–80 units. **Do not touch the eye, brow, nose, mouth or beard.** | manhua.mjs line 204 (head), 259 (tokyo headscarf), 264 (gao cap) |
| Bust length | `front()`/`side()` body paths end at local y = 800 | 0.62 H below the chin → visible bottom edges in 7 frames | body paths to local y ≥ 1150 (≈ 1.6 H below the chin); placed so bottom ≥ H_frame + 40, or cut by a foreground object | manhua.mjs lines 47–51, 193–198 |
| S09 raised arm | scenes16 `fistArm` (line 189): tube from (790,860); fist 197 px wide; tube 110 px; sleeve block 211–252 px; Lin H = 348 px | attached at the chin; no elbow; fist 0.57 H wide | shoulder at the top-centre of the torso (profile: under the back of the jaw, ≈ (630,905)); upper arm ≈ 490 px, elbow 90–110°, forearm ≈ 400 px; sleeve 0.45–0.5 H tapering to a 0.22–0.25 H wrist; fist ≈ 0.4 H (≈ 140 px), cocked beside the ear, not raised overhead. Solve with two-bone IK from the contact points (owner row 101) | scenes16.mjs S09 + a shared `arm()` |
| S10 fist shape | scenes16 `fist()` | 4 fingers straight up with nails showing: reads as an open hand / "4" | 3/4 side view: curled fingers, knuckle row on top, thumb across the middle phalanges; tremble, then the fingers loosen | scenes16.mjs lines 70–85 |
| S02 hands vs paper | `gripHand` k = 1.15: hand ≈ 235 px; sheet 1080 × 640 | hand ≈ 0.22 × sheet width; the sheet is landscape although S01's is portrait | woman's hand ≈ 0.45–0.5 × the sheet's long side; same portrait 700 × 900 sheet as S01; thumbs in front, fingers behind | scenes16.mjs lines 61–68, 106–107 |
| Cast scale | S08: Gao profile H = 306 px; wife's head (r = 66) = 132 px, same depth | 2.3× | same-depth adults share one head size (wife ≈ 0.93× a man's head, height ≈ 0.9× 林冲); 林冲 ≈ 1.06–1.1× 高衙内/陆谦; in S09 put Gao's eye line ≈ 0.3 H below Lin's (the shorter man holds the power) | scenes16.mjs S08, S09 |
| Spear (S06) | fullbody2 sp0 (770,1210) → sp1 (96,118) + 120 tip = 1403 units vs 1749 figure | **0.80× his height**; butt floating at thigh level | ≥ 1.2× height; butt on the ground, or trailing behind in a drill pose | fullbody2.mjs line 19 |
| Spear + gourd + hat (S05/S16 silhouette) | fullbody.mjs `fullSide` sp0 (250,820) → sp1 (900,190) + 110; frame S16: spear ≈ 245 px vs figure 406 px; gourd ≈ 25 px vs head ≈ 55 px; hat brim ≈ 70 px vs head width ≈ 35 px | spear 0.6×; gourd 0.45 head; brim 2× head width | spear ≥ 1.2× height (butt low behind the calf, tip well past the head); gourd ≈ 1 H tall; brim ≈ 2.7× head width (matching the manhua 毡笠: 560/208) | fullbody.mjs line 88; rebuild on the manhua `side()` head (note 12) |
| S19 hat vs room | brim 420 px vs bed 520 px | 0.81× the bed length (≈ 1.5 m hat) | ≈ 0.27–0.29× the bed (≈ 140–150 px); spear leaning *on* the door frame or wall, not on air | scenes16.mjs lines 283–284 |
| S12 table, ewer, cups | table top y = 860; Lu's chin y = 680; Lu H = 384 px; flask 170 × 210 px; cups 90 × 60 px | table 0.47 H below the chin (hits the sternum); flask 0.55 H, unheld, base 30 px below the table line | table top ≈ 1.6 H below the chin (lower ribs): reframe wider; Song 注子 ≈ 1 H with a handle, held by Lu; cups → 酒盏 on a foot (size is fine) | scenes16.mjs lines 212–214 |
| Cangue | `front()` cangue 84–516 = 432 units, front face 108 units tall | 2.08 face widths (≈ 30 cm); reads as a box or shelf | wait for the researcher's row (note 28b: 「七斤半团头铁叶护身枷」 and its period size). Provisional: ≥ 3 face widths wide, drawn as a flat board (top face in perspective plus a thin edge), long-board 团头 shape, iron strips; keep the 封皮 strip | manhua.mjs lines 59–64 |
| S04 figure scale | Lin and guards at the vanishing point ≈ 84 px | 7.8 % of frame height (≈ 21 px on a phone) | the emotional subject at 25–30 % of frame height | scenes16.mjs S04 |
| Consistent props (keep) | S01 brush 460 / inkstone 300 × 220 / paper 900 tall; S06 weapon rack vs troops (horizon ≈ y 617, rack ≈ 0.75 person tall); S14 stone 108 × 62 vs door 140 × 240 (≈ knee-high, fine) | ok | — | — |

---

## 3. Emphasis per shot (what the viewer must read in the first second)

| Shot / line | Must read in 1 s | Delivers? | Fix |
|---|---|---|---|
| **S01** V01 0.5 | A man's own hand ends a marriage on paper | Partly: an old letter with no hand and no action; 休书 lost in 8 dense columns | Close-up from slightly above, portrait sheet ≈ 70 % of height. Frame 0: his hand (green sleeve, edge of the cangue at frame top) finishes the 花押 at 年月日. On the first strong beat (~2.5 s) the inked palm presses the red **手模** (L8), with 2–4 frames of shake. One key: an oil lamp at frame left, with 「休书」 in its brightest pool as the camera pushes in. Nothing on the table but brush, inkstone and lamp |
| **S02** V02 5.5 | Her hands shaking; a tear hits the word 休 | No: mitten hands, the sheet changed shape, the tear hangs in the air, the "bleed" sits on blank paper, half the sheet is empty | Same sheet, continuous from S01 (her hands lift it into frame). Correct grip, slim hands with joints, crumple lines radiating from the grips. The tear falls on a beat and lands **on 「休」**; the ink blooms. Only the paper trembles (1–2 px). Her sleeve or hair edge at frame top says "her" (face stays out, per the script) |
| **S03** V03 9.8 | He is a prisoner holding back tears | Partly: good face; ID-photo symmetry, floating bust, thin neck, box cangue, the wife is a blurred capsule with a halo ring | Medium close-up, face 45–55 % of height, right third. The cangue bleeds off the frame bottom (this also fixes the bust edge). Red-rimmed lower lids; the tear gathers and falls only on 「误了她一辈子」. Warm key from her side, his far cheek in shadow. She is a drawn soft-focus shoulder and hair (Song 高髻 with a hairpin) in the foreground left; rack focus from her to him |
| **S04** V04 14.6 | The distance: he is taken away, she is left | No: he is 84 px at the vanishing point; she is a faceless capsule; the houses are wedges with floating window cards | Over her shoulder: her back and her hand on the door frame, foreground left, bleeding off frame. He walks between two guards with 水火棍, 25–30 % of height, **turning to look back**. Camera slowly pulls back through the doorway until 18.3. Make it a real 东京 street (tiled eaves, 酒旆, lattice). Season depends on note 20 (probably summer: no snow) |
| **S05** V05 18.3 | His name, as a title, on the music turn | Partly: readable, but the seal is broken (人物志 spills out), the series name is cut to 人物志, the figure is a grey ghost from the old rig | The title stamps or brushes in on 18.3 (not 19.5). Red seal 「水浒人物志 · 壹」 stamps on a beat, with its text inside. Near-black silhouette against a lighter snow sky, rebuilt on the manhua rig (note 12). Wind-blown snow and cloak; slow push through the dip |
| **S06** V06 27.0 | A master at the height of his skill | No: stands to attention, short floating spear, paper-doll body, 7 identical pegs | Spear thrust **on the 27.1 downbeat**: wind-up, thrust with the spear horizontal across the frame and the tassel flaring, recovery. Low camera at knee height; two rows of soldiers mirroring him (he is the 教头). Sun from the right with cast shadows on the sand; flags moving |
| **S07** V07 31.5 | Warmth: home, her, three quiet years | Partly: one warm window inside a 70 %-cold box house; Western glass panes; she is a blob; he is absent | Interior (recommended): she mends his green robe (the S06 green) by the lamp and looks up at 你. Or exterior with a paper lattice window carrying both their shadows. The warm lamp is the key; frame ≥ 80 % warm; tiled eaves outside. Show her face here (note 16) |
| **S08** V09 38.8 | A rich man blocks her; the crowd watches; she is afraid | No: Gao's head 2.3× hers and floating; he stands far off with a placid face; plank temple, peg crowd, bucket burner | Medium-wide, full figures at one scale. Gao steps into her path, arm barring her or reaching for her sleeve. She turns away, hand to chest, 3/4 face showing fear. Onlookers in a half-circle turning heads. Hall with steps, red columns, upturned eaves; heavy smoke from a 鼎 as foreground framing. Keep his magenta (it pops) |
| **S09** V10–V11 42.4 / 45.8 | (a) Rage: he spins the man round, fist cocked. (b) Recognition: that face is his boss's son | No: chin-arm, fist raised like a cheer, no 扳过, both busts float, Gao's smirk unreadable | One continuous shot. 42.4: Lin's far hand grabs Gao's shoulder and spins him (whip-turn with smear on the beat); near arm cocked as in §2. 45.8: Gao's face completes the turn into a 3/4 smug grin (brows up, lids half down, one mouth corner up; the hair-flower catches the light); push toward Gao over Lin's fist; Lin's eyes widen from 怒 to shock |
| **S10** V12 49.0 | The fist gives way | No: reads as an open "4"; the tremble lines are invisible (line 198 sets `stroke` twice, so the dark first value wins) | 3/4 fist with Gao's smirk soft behind it (the cause stays in frame). Tremble 1–2 px, then the fingers uncurl a little and the fist sinks out of frame over ~1.5 s (slow, then slower); cold light creeps in |
| **S11** V13 50.8 | He swallows it | No: small profile in a dark field, neutral glance, no jaw clench in `side()`, floating bust | Tight close-up, face 65–75 % of height; masseter bulge and pressed lips (add `jaw` to `side()`), eyes lowered, one Adam's-apple swallow. Hard side light. 「忍」 in gold. The three 忍 shots escalate: S11 close-up warm-grey → S12b extreme close-up, eyes shut, cooler → S13 bowed head, cold blue |
| **S12** V14 52.4 | His best friend smiles while selling him out | Partly: the half-shadow idea reads, but the hard vertical split looks like a mask; flask pours by itself; table at the sternum; Lin's back is a blob | Lu raises his cup to the camera (to 你) with a warm smile, lamp-lit from the left. On 「害你」 he turns and a soft-edged form shadow slides across half his face. The trap is visible: 高衙内 at a window behind him, or reflected in the wine (L5). Lin's foreground shoulder carries the headscarf, wings and rings so it reads as him even blurred; Lu holds the ewer |
| **S13** V17 60.3 | Branded, bowed, beaten | Partly: tattoo and cangue are there; floating slanted bust; the head is only tilted −5°; fake glyphs; still in the instructor's jade-ring headscarf | Head pitched down (chin to chest; profile or a new front "bow" pose). Long-board cangue crossing the frame bottom. Non-text ink mark (note 18). Exile costume (note 17). Cold top light |
| **S14** V22 75.1 | Shelter in a storm: he barricades himself in | No: stone outside an open doorway, fire already burning, power-line branch, shed temple | Two beats. Exterior wide: collapsed thatched hut in the foreground, small temple beyond, heavy snow, him in 毡笠 with spear and gourd trudging to the door, **no fire**. Then interior: he pushes a knee-high stone against the closed door from inside (side view, contact solved per rows 100–101), the god statue dim behind, blue light through the cracks |
| **S15** V25–V27 86.9–93.7 | His eyes in the dark: recognition, then resolve | Partly: the letterbox and the hold are right; evenly lit, cartoon-surprised eyes, tattoo cut by the bar | Face in near darkness (mean luma ≈ 25) with **one slit of orange fire light through the door crack** lying across the eyes only. Push from close-up (V25) to extreme close-up (V26); dead still 92.0–93.7. Brows go from 隐忍 knit to flat and low (resolve); pupils narrow. Tattoo fully in or fully out of the band |
| **S16** V29 96.2 | Alone, walking into the storm: the iconic silhouette | Partly: right props; pyramid mountains, mid-size grey figure, stick legs, static stride, footprints detached | Pick one: tiny figure (≤ 12–15 % of height) in an immense ink-wash landscape (irregular ridgelines, 3 fog layers), recommended; or a low-angle hero silhouette. Walk cycle with footprints leading to his heels. Snow slants the way the cloak blows. Faint fire glow behind him at left (the past) as he walks right (forward) |
| **S17** V31–V32 105.7–113.6 | The news arrives, and he is waiting for it | Partly: good calligraphy; the boat and its figure are pegs; he is absent | His back in the foreground right third, soft; the boat comes out of the mist. On V32, rack focus to him. 「已故半载」 brushed stroke by stroke in the 2 s of music alone, after the subtitle clears (never both at once). Real reeds with plumes. Desaturate as the words land. The death is said once, never shown (keep) |
| **S18** V33 113.6 | A hard man crying without a sound | Partly: tears and grief brows; floating head (55 px gap), bust edge, 东京 jade-ring headscarf at 梁山 | Close-up, face ≈ 60 % of height, 3/4. One tear rolls (animated); mouth pressed shut; shoulders sink. Cold side light. Neck fixed; 梁山-period costume |
| **S19** V36 124.8 | His life ended here; what is left is his hat and spear | Partly: the idea is right; hat ≈ 3× too big; spear leans on nothing; the light misses both | Correct hat scale; spear against the door frame; the window light pool lands **on** the hat and spear (brightest things), dust in the beam; lattice window with a branch shadow; slow push. Ends by 128 (see S20a) |
| **S20** V37–V38 129.6 / 138.8 | (a) The promise that never came true. (b) The question, to you | No: V37 has no picture; the question sits on top of the ink columns; the "thumbprint" contradicts 手模 and was never set up; the loudest music sits on a dimmed paper | Build the film's biggest image here (owner row 88): see S20a in §5. The question goes in clean space beside the red handprint, the last thing on screen |

---

## 4. Transitions

v2: **20 hard cuts** (19 between shots plus 1 into the end card); no transition is planned. v3 budget: **2 hard cuts + at most 3 match cuts**. Every other hand-over is a continuous camera move or a motivated dissolve. No type is repeated (the window rhyme in T18 is the one deliberate motif). Outgoing subtitles and props clear *before* each move (row 86).

| # | Cut (v2 time) | Keep hard? | Proposed transition (v3) | Motivation |
|---|---|---|---|---|
| T1 | S01→S02 (5.5) | no | continuous tilt-up: her hands lift the same sheet off the table | same object |
| T2 | S02→S03 (9.8) | no | rack focus through the lowering paper edge to him behind it | her eye-line |
| T3 | S03→S04 (14.6) | no | dolly-out through the doorway: his close-up becomes the walking figure; the door frame slides in as foreground | the separation itself |
| **T4** | S04→S05 (18.3) | **HARD CUT #1** | title stamps on the 18.3 downbeat | music turn + narration turn 「这个人」 |
| T5 | S05→S06 (27.1) | match cut | the silhouette's spear diagonal becomes his training spear, thrusting on the main-theme downbeat | shape + music hit |
| T6 | S06→S07 (31.5) | no | the nearest red flag becomes the red lantern at the same screen spot; sky goes dusk→night over one bar | colour/shape match |
| T7 | S07→S07b→S08 (35.9 / 38.8) | no | push through the paper window into the room (S07b two cups); the cups' steam rises and becomes the temple's incense smoke | rising smoke; 「直到那天」 turn |
| T8 | S08→S09 (42.4) | no | Lin's hand enters and spins Gao: a whip-turn with smear, on the beat | the action |
| T9 | S09→S10 (49.0) | no | push-in along the arm to the fist; Gao stays soft behind it | the line names the fist |
| T10 | S10→S11 (50.8) | no | tilt down with the sinking fist onto his clenched jaw | follow the motion |
| T11 | S11→S12 (52.4) | no | foreground wipe: a 樊楼 pillar or curtain crosses as the camera trucks right | change of place |
| T12 | S12→S12b→S12c→S13 (55.8 / 57.4 / 60.3) | no | push into the wine cup; the wine darkens into ink (S12b) → eyelid wipe: his eyes shut, then open onto the 白虎节堂 (S12c) → pull back from the tattooed cheek to the bowed head (S13) | betrayal → branding; ink is the film's material |
| T13 | S13→S13b→S13c→S14a (62.4 / 65.3 / 69.2) | no | continuous pull back to the road → follow his look back into the memory (S13c, tinted) → tilt up into the sky; the first snow starts on 67.1 → crane down over the 草料场 | eye-line; second theme 67.1 |
| T14 | S14→S15 (86.9) | no | one interior take: crack light flares (S14d) → push to the crack, POV (S14e) → pull back to his eye in the dark (S15) | the light through the crack |
| **T15** | S15→S15b (93.7) | **HARD CUT #2** | from the dead-still extreme close-up to the door bursting open (stone scrapes, fire and blizzard) → a diegetic snow whiteout eased over ≥ 1 beat (not a flash, row 55) → S16 comes out of the white | the drop after the near-silence (pauses.md: picture hold + music stop → hit); the whiteout hides the killing |
| T16 | S16→S16b→S17 (101.0 / 105.7) | no | continuous truck right; the snow melts into 梁山泊 reeds; the seasons pass in one composition; the boat comes out of the mist | 「一拖再拖」 made visible |
| T17 | S17→S18 (113.6) | match cut | the last ink stroke of 已故半载 drips → his tear (vertical motion match) | ink → tear |
| T18 | S18→S18b→S18c→S19 (115.4 / 119.2 / 124.8) | 1 match cut | his eye-line lifts to the dark window (S18b, the same lattice as S07) → banquet lanterns bloom in the window paper (S18c) → match on the window frame to the 六和寺 window | window motif |
| T19 | S19→S20a (128) | no | the window's light pool on the floor brightens into the glow of the 休书 | bright-rectangle match on the loudest-section entry |
| T20 | S20b→End (142) | no | the red handprint becomes the red J seal, stamping on the 142 downbeat | colour/shape; outro |

Editor: snap every transition peak and every hit to the measured grid (143.6 BPM, bar = 1.671 s; main-theme downbeat 27.1 → bars at 27.1 + n·1.671). The hits are: 手模 press (~2.5), 18.3, 27.1, 49.0, 67.1, 93.7 and 142.

---

## 5. Missing shots and merges

| New shot | Line / time | Picture | Why |
|---|---|---|---|
| S07b | V08 35.9 | two cups steaming on the table; her hand pours into his | no picture yet; sets up the steam→incense move |
| S12b | V15 55.8 | 忍 2: extreme close-up, eyes shut, ink-dark background, a vein at the temple | the second 忍 has no picture; the three must escalate |
| S12c | V16 57.4 | 白虎节堂 plaque above; the blade in his hands (L6); 高俅's silhouette pointing → the tattoo brushed onto the cheek (no blood) | the frame-up is the plot's hinge and is skipped |
| S13b | V18 62.4 | road out of 东京, city gate behind, he looks back | the hope 「就能回去」 needs an image |
| S13c | V19 65.3 | memory (tinted): the S01 tavern table, 张教头's hand on his shoulder, the 休书 between them; 「依旧夫妻完聚」 brushed beside them | the film's thread, returning at V37; L11 is the same 第八回 scene as the 休书, not a gate |
| S14a (+ S14b) | V20–V21 69.2–75.1 | 草料场 establishing: thatched sheds and fodder stacks, him with keys and spear; crane up into vast snow, the roof sagging | no establishing shot for 沧州 |
| S14d | V23 79.9 | orange light flares through the door crack onto his face | the fire's start (S14 showed it early) |
| S14e | V24 82.4 | POV through the crack: three silhouettes against the fire | the voices need bodies |
| S15b | V28 94.0 | the stone scrapes away, the door bursts into fire and blizzard, whiteout | the film's hardest hit has no frame |
| S16b | V30 101.0 | 梁山泊 seasons in one composition; his small figure keeps waiting | 「一拖再拖」 |
| S18b | V34 115.4 | the S07 window, now dark and empty | callback: 再没有可挂念的人 |
| S18c | V35 119.2 | banquet lanterns; 高俅 (silhouette) sent off by boat, lanterns receding. **No shot of Lin glaring** (L23/L26) | line has no picture |
| S20a | V37 129.6–138.8 | **Peak image:** gather, then release. The film's images (window, cup, fist, door, snow) drift in and converge into the 休书 at centre; 「依旧夫妻完聚」 brushed huge across it. Around 134–136 the ink lifts off as snow and ink motes into the night, leaving the red handprint alone, glowing | the loudest music currently has the weakest picture (row 88) |
| S20b | V38 138.8 | the question in clean space beside the handprint. Optional rhyme: the open palm print next to the S10 fist (open hand = 忍) | resolves the script/storyboard mismatch (fist vs 休书) |
| End | 142–148.5 | Juno end card: J monogram, gold title, the question, `关注 Juno · 一起看懂世界`, sources line, 下回：鲁智深 | required (row 17) |

**Merges (fewer setups, more 运镜):** S01+S02(+S03) as one move on the paper. S08+S09+S10 as one continuous temple shot (V09–V12). S14a+S14b as one crane. S14c→S15→S15b as one interior take: this is the episode's set-piece (2.5D layered camera, row 33). S16+S16b+S17 as one truck. That gives about 34 frames from about 14 camera setups.

---

## 6. Logic, period and facts.md conflicts

1. **V01 「亲手写一封休书」 vs L8.** Per L8 he "has a 休书 written" (a hired scribe wrote it); his own hand signed (押个花字) and pressed the **手模**. S01's brush-on-his-table staging implies he wrote it. → screenwriter: e.g. 「如果有一天，你要亲手签下一封休书，给你最爱的人。」, with the hand signing and pressing the print in S01.
2. **Thumbprint vs 手模 (handprint).** S20 draws a thumbprint ellipse; script V03/V37 say thumb. L8 says 打个手模 (palm). It is also never set up in S01. → palm print in S01, the same print fades in S20.
3. **休书 prop text.** The tail 「恐后无凭 立此文约为照 年月日」 is not in L8. The researcher adds and verifies it, or it comes off the prop.
4. **S14:** stone outside an open door vs L14/L16 (stone moved against the door from inside, later moved away from inside; 「一手拽开庙门」). The fire burns before V23.
5. **S12:** flask pours with no hand (R5/R8). Song wine service is a 注子 with handle and spout.
6. **S04 season.** The departure is drawn in snow. 第八回 appears to say 「时遇六月天气，炎暑正热」 during the journey. Not in facts.md: researcher to verify. If confirmed, no snow before 沧州.
7. **Costume.** The instructor's green 战袍 and headscarf with 白玉圈 are worn after the sentence (S13) and at 梁山 (S18). The rings are drawn at the temples; 第七回 says 「脑后」. The 毡笠 (第十回) exists in `front()` but no frame uses it. Researcher to add the costume rows.
8. **Tattoo.** 「田メ丰日」 are fake characters; L7 gives only 「文了面」.
9. **Period props.** S07 Western 8-pane glass window (Song: paper lattice); S04 window cards floating across the roofline; S14 branch reads as a power line; S08 burner reads as a bucket (rows 121, 125).
10. **V24 「拾他几块骨头」.** The source says 「一两块骨头」 (L15). → screenwriter: use the source's number.
11. **V35:** keep it to 「大小头领都来相见」 (L23). No Lin 怒目而视 (L26 ✗).
12. **Text/render bugs:** S05 seal text overflows; S20 question over ink columns (text over text); S10 tremble lines invisible (duplicate `stroke`); subtitle trailing 。？， not pulled back, so the measured ink centres are 938–946 px (14–22 px left of 960) on S01, S02, S13, S16 and S20 (row 97). Subtitles are 54 px / 700 with a hard stroke vs the 64 px bold, soft-edge standard (rows 63, 87).

---

## Notes table (routed)

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | Block | manhua.mjs `front()` l.57; fullbody2.mjs l.34–37 | Floating head: neck ends at 618 with a stroked edge, collar at 640; hollow collar V. Draw the neck first, extend it to y ≈ 700, no bottom stroke, fill the V. S18 gap 55 px, S06 22–33 px | animator | 74, 75, 98 |
| 2 | Block | `front()`/`side()` bodies; S03, S08, S09, S11, S13, S18 | Busts stop at local y = 800. Extend to ≥ 1150; placed bottom ≥ frame + 40 or cut by a foreground object | animator | 43 (no clipping), 24 |
| 3 | Block | scenes16 S09 `fistArm` | Rebuild the arm: shoulder at the top-centre of the torso, jointed, IK-solved, fist cocked by the ear at 0.4 H, far hand gripping Gao's shoulder (numbers in §2) | animator | 75, 101, 77 |
| 4 | Block | `gripHand`, `fist()`; S02, S09, S10 | Redraw hands: S02 female grip (thumbs front), ≈ 0.45–0.5× the sheet; S10 true 3/4 fist. If a hand can't hold up at a size, frame it out | art-director | 9 |
| 5 | Block | S12 | Flask pours unheld and sinks below the table line. Lu holds a 注子 by the handle | animator | 74 (R5/R8), 77 |
| 6 | Block | render6.mjs | Checker passed broken frames. Add: bleed layers must reach the edge; neck-continuity samples; seals as containers; text-over-text; held-prop handle ≤ 4 px from a hand. Stills go out only on PASS | animator | 74, 18 |
| 7 | Major | fullbody2.mjs | 6.55 → 7.4 heads (k 0.73 → 0.63); arms, forearm, fists, thighs to the §2 targets | art-director | 98, 124 |
| 8 | Major | `side()` | Profile skull +70–80 units at the back; neck depth ≥ 0.55, tilted forward 12–18°. Face features unchanged | art-director | 98 |
| 9 | Major | `front()` neck | Width ≥ 0.6 face width, flaring to 0.85 with trapezius; length ≤ 0.3 H | art-director | 98 |
| 10 | Major | S08, S09, all shots | One scale per depth; wife ≈ 0.93× head, 0.9× height; 林冲 1.06–1.1× the others | art-director | 98 |
| 11 | Major | S06, S05/S16, S19, S12, S02 | Props to true scale: spears ≥ 1.2× height and grounded; gourd ≈ 1 H; brim ≈ 2.7× head width; S19 hat ≈ 0.28× the bed and spear on the wall; table at the lower ribs; S02 sheet stays portrait | art-director | 98, 18 |
| 12 | Major | S05, S16 | Silhouettes use the old styles.mjs rig. Rebuild on the manhua `side()` head with 毡笠, shaped legs, a real walk with footprints to the heels | art-director | 124, 129 |
| 13 | Major | S04, S07, S08, S14, S16, S19 | Replace placeholder geometry with one 国风 language: tiled eaves, paper lattice, Song props, ink-wash back layers with fog, paper texture | art-director | 72, 121, 125 |
| 14 | Major | all | One motivated key light per shot on the hero; consistent cel shadows; lift backgrounds to mid-tones (S11 38, S15 40, S10 41, S20 46, S05 48, S12 50, S03 57 mean luma) while keeping subjects lit | art-director | 71, 81 |
| 15 | Major | §3 table | Restage every shot per §3 (priority S04, S08, S09, S11, S14, S15, S20) | art-director | 77, 47, 130 |
| 16 | Major | S03, S04, S07, S08 | Design 张氏 with the manhua rig (高髻, 褙子, hands); show her face in S07/S08 (recommended) or withhold it by framing, never as a capsule | art-director | 49 (placeholder), 52 |
| 17 | Major | S13, S15, S18 | Two costume looks: 东京 (S06–S12) and exile (S13 on; 毡笠 + cloak at 沧州). 白玉圈 behind the head | art-director | 121 |
| 18 | Major | S13, S15, S18 | Remove the fake glyphs; non-text ink mark unless the researcher sources the words; keep it whole in S15 | art-director | 11, 125 |
| 19 | Major | S14 | Stone inside against a closed door; no fire until V23; real branch | art-director | 77, 125 |
| 20 | Major | S03–S04 | If note 28c confirms summer, no snow at the farewell; snow first appears at 67.1 / V20 | art-director | 121 |
| 21 | Major | 128–142 | Build the peak image S20a (gather → release) on the loudest section | art-director | 88 |
| 22 | Major | storyboard.md | Use the template: shot/camera, key visual, text placement, motion beats on beats, transition out + motivation, sound cue. Add the §5 shots and the Juno end card | art-director | 15, 17, 29 |
| 23 | Minor | S05 | Seal text inside the seal; 「水浒人物志 · 壹」; title built from ink and seal, landing on a beat | art-director | 38, 90 |
| 24 | Minor | S20 | Question in clean space, not over ink columns | art-director | rubric (text over text) |
| 25 | Major | whole film | Transition plan §4: 2 hard cuts (18.3, 93.7) + ≤ 3 match cuts; all else continuous or motivated; no repeats; clear text before moves | editor | 15, 33, 56, 67, 86 |
| 26 | Major | timing | Title on 18.3 (V05 voice may stay at 19.5); hits on the grid (2.5 / 27.1 / 49.0 / 67.1 / 93.7 / 142); S15 dead still 92.0–93.7; V28 whiteout eased ≥ 1 beat, no flash | editor | 26, 55, 112 |
| 27 | Minor | scenes16 `subtitle()` | 64 px bold (or a deliberate serif call), soft edge + feathered shade, gold key words (休书, 林冲, 忍, 依旧夫妻完聚); ½-em pull-back on trailing 。？， (now 14–22 px off-centre) | animator | 63, 87, 97 |
| 28 | Major | facts.md | Add sourced rows: (a) scribe wrote the 休书, he signed and pressed the 手模, plus the text tail; (b) 「七斤半团头铁叶护身枷」, 封皮 and the period cangue size; (c) the departure season (「时遇六月天气」?); (d) 第七回 costume (抓角儿头巾, 脑后白玉圈, 绿罗战袍) and 第十回 毡笠; (e) tattoo wording, if any. Mark UNVERIFIED if not found | researcher | 19, 121 |
| 29 | Major | script.md | V01 写 → 签 (L8); picture column: thumb → 手模 (V03, V37); V19 picture = the tavern table, not a gate (L11); V24 几块 → 一两块 (L15); choose one picture for V38 (recommend the hand rhyme) | screenwriter | 11, 32 |

**Owner taste calls** (the producer can ask; they don't block the rig fixes): (1) show the wife's face, or keep withholding it by framing; (2) if 六月 is confirmed, a summer farewell (accurate) or snow (current mood); (3) simplified characters on the 休书 (legible) or traditional (period).

**Order of work:** fix the rig first (notes 1–3, 7–9), then send the owner **3 corrected stills** (S06 full body, S09 two-shot, S18 bust) and wait for his OK (owner row 75 / SKILL rule) before rebuilding the ~34-frame board.

## What must not change (it works)
- The manhua face rig: eyes, brows, beard, nose, mouth and the 隐忍/怒/悲 expressions (the owner liked them). Change only the neck, the back of the skull and the body.
- 16:9; the z/depth layer architecture in `compose()`; the checker as a base (extend it, don't drop it); subtitle safe areas and the no-subtitle-over-face test.
- The 休书 prop with the L8 text in vertical columns, and the S01↔S20 callback.
- The 封皮 strip on the cangue.
- S15's letterbox extreme close-up and its hold into the near-silence before the drop.
- S16's signature props: 毡笠, spear over the shoulder, gourd at the tip (L14).
- S17's brush calligraphy 「已故半载」; the death said once and never depicted; the killing never shown (door → whiteout).
- S12's idea of the friend's face half in shadow (re-execute with soft form shadow).
- S19's idea of the objects left behind instead of a body.
- S01 prop scale (brush, inkstone, paper) and S06's perspective (horizon ≈ y 617).
