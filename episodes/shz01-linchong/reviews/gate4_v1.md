# Gate 4 review: 《水浒人物志 · 壹 · 林冲》 v1 (first full cut)

**Verdict: FIX FIRST.** 9 MUST items block sending. Most of them are broken renders or body-logic errors that the owner has rejected before. The sound, the structure, the title sequence and the temple set-piece work.

Reviewed: `/dev/shm/shz01/out/林冲_v1_高清原片.mp4`. I looked at all 33 contact sheets (1 frame/s, plus every subtitle midpoint, both sides of every cut and every glitch). I also pulled full-size frames around every flagged event. Evidence lives in `/dev/shm/shz01/review/` (`v1/sheet_NN.png`, `v1/auto_checks.md`, `detail/*.jpg`). To check whether a fresh render would fix things, I rendered engine stills from the **current** code (`review/stills/t_012.47, t_043.00, t_062.00, t_115.99`). They show the same face seams, cangue and 高衙内 hood as the master, so items 2–4 need code changes, not just a re-render. Times are film seconds; take files are `film/takes/tNN.mjs` (SLOTS in film.mjs; a transition belongs to the incoming take's `enter`).

## Automatic checks (all measured)

| Check | Result |
|---|---|
| Format | 1920×1080, 30 fps, 4455 frames = 148.500 s, h264 3.75 Mbps + AAC 48 kHz stereo. OK |
| Loudness | −14.2 LUFS integrated, true peak −1.49 dBTP, LRA 5.1. OK (target −14 / ≤ −1) |
| Loudness curve | No dead stretch. Short-term stays within −12…−17 except the two planned silences (25.8–26.9, 92.4–93.5) and the end fade. The door hit comes in at 93.6 (M −22 → −14 by 94.1) |
| Black / silence | None. Sound starts at 0.40 s, flute on beat 0.337 |
| Segment join f2228 (74.27) | Clean: frame diff 7.85 inside a steady 7.6–7.9 run (snow crane), no jump |
| Cuts detected | 18.67 (HC1, planned), 59.90 (MC2), 115.23 (MC3), **58.40 (unplanned, item 7)**. Single-frame "glitches": **77.57, 128.57** (item 7). HC2 93.565 confirmed by eye |
| Hits vs grid | Structural hits land within ±1 frame of beats.json: 18.657, 59.87, 61.125, 75.256, 79.83, 93.565, 115.217, 128.534, 141.862; spin 42.79 and lantern bloom 120.27 by eye. Small acting hits (grip 49.457, shadow 53.626, release 136.03) can't be measured from frame diffs |
| Subtitles | All rows ≤ 16 字. No overlap with the brushed 已故半载 (sub ends 112.00, brush 112.10) or 依旧夫妻完聚 (134.05 / 134.21). Pace: only V26 「你终于明白，」 is short (1.54 s on screen vs 1.8 s needed; voice-locked, leave it). Waiting time 7 % |
| Facts / brand | facts.py clean; no 「Juno 出品」; end card has J seal, gold title, question, pill, 下回, sources |

## Ranked fix list (most visible first)

### MUST

**1. 0.00–0.90 · t01.mjs: the first frame (the cover) shows a hand writing with no brush.**
- *What's wrong:* the hand that finishes 「冲」 holds only a dark nib at the fingertip, with no shaft, so it reads as finger-painting. The back of the hand has a pale knuckle cap with a straight edge that reads as a mitten. There is also no subtitle on frame 0 (V01 appears at 0.22 s), against owner row 22.
- *Evidence:* `detail/brush0.jpg` (frames 0/6/12/20/27), `detail/crops1.jpg` (frame 0, full size).
- *Fix:* draw the whole brush (23 cm, shaft rising past the knuckles) held between thumb and index, tip on the end of the stroke. Simplify the knuckle patch into the hand's own cel shade. Start V01 at 0 (`subs.mjs` LINES, owned by main).

**2. Front-view close-ups have seams and boxes: 10.0–14.5 (S03, t01.mjs) · 59.9–61.1 (S16, t08.mjs) · 115.2–116.9 (S29 「你哭了」, t12.mjs). Cause is in the rig front view (`chars/rig/linchong.mjs`).**
- *What's wrong:* a vertical skin strip with straight edges at his left jaw, a white rectangle and a dark square beside the collar, and the head-cloth side ties cut off by a straight vertical edge. They are most visible on the film's most emotional close-up (S29).
- *Evidence:* `detail/crops1.jpg` (12.467, 115.99, master). The current-code stills `stills/t_012.47.jpg` and `t_115.99.jpg` show the same artefacts.
- *Fix:* in front(), clip the jaw/ear patch and the side ties with the head-outline path instead of a rect, and draw the collar pieces after the neck. Then re-check one CU at H ≈ 540 with check_rig before re-rendering T01, T08 and T12.

**3. The cangue is wrong in four shots: 10–14.5 (S03, t01) · 61.1–64.4 (S17, t08) · 14.5–18.66 (S04, t01) · 64.45–67.8 (S18, t08).**
- *What's wrong:*
  - S03 and S17: the board sits like a box in front of his chest. The neck hole is an empty ellipse in front of his chin: in S03 you see the collar inside it, in S17 the beard tip dangles into it. The head floats behind the hole and the neck never goes through. This is the "body logic" error the owner keeps rejecting (row 74).
  - S04: he has no cangue at all as he is led away (back view of the middle walker), so continuity breaks from S03 to S04.
  - S18: in profile the cangue reads as a thin stick pointing up, not a 90 cm board angled 25–35° down (model sheet §6).
- *Evidence:* `detail/cangue.jpg` (12.47, 62.0), `detail/farewell.jpg` (16.5, 66.7). The current-code still `stills/t_062.00.jpg` is unchanged.
- *Fix:* centre the hole under the chin and split the board at the hole: draw the far half before the neck and the near lip after it, so the neck passes through. Add the board across his shoulders in S04 (≈ 150 × 70 px at that scale). In S18, draw the long end forward and down, at least 3 face widths.

**4. 高衙内 has a purple "hood" over his head: 42.5–45.7 (S10, t05.mjs).**
- *What's wrong:* a pointed purple shape rises from his back over the back and side of his head up to eye level. It reads as a monk's cowl or a broken render. In the same shot, 林冲's fist (44.4–45.3) rises on a bare forearm from the bottom frame edge instead of from his shoulder.
- *Evidence:* `detail/gao.jpg` (43.0, 44.567). The current-code still `stills/t_043.00.jpg` still has the hood.
- *Fix:* end the robe back and wide sleeve below the shoulder line so the flower cap and ear read clean. Drive the fist arm from the shoulder joint (two-bone IK), with the fist beside the ear rather than overhead (model sheet §2).

**5. Double exposures on a hand and on bodies.**
- *What's wrong:*
  - 50.0–50.5 (t05): the fist and the open hand cross-fade, giving a ghost thumb at 50.0 and a see-through hand at 50.43. This is "拳头，软了", a hand close-up, and hands are the owner's sore point.
  - 80.9–81.7 (t10): the foreground stone turns translucent and his cloak shows through it.
  - 99.8–100.3 (t11): two 林冲 at once (the snow walker and the pier figure, both at about 50 %).
- *Evidence:* `detail/fist50.jpg`, `detail/ghost81.jpg`, `detail/ghosts.jpg` (100.0).
- *Fix:* open the fist by animating the fingers (or switch poses on a 2-frame smear), never by opacity. Keep the stone opaque and let the push move it out of frame. At 100.0, take the walker out before the pier figure appears (owner row 86).

**6. Subtitle on the face: 50.0–51.7 (S11→S12, t05.mjs).**
- *What's wrong:* during the tilt down his face sits in the subtitle band. At 51.0 「拳头，软了。」 lies directly on his moustache and mouth.
- *Evidence:* `detail/fist50.jpg` (51.0), `v1/sheet_11.png`.
- *Fix:* `subYc(t)` → band at y ≈ 160 for 49.1–51.7, or raise the camera so the jaw ends above y 800 (see item 15 for the smaller cases).

**7. Four transitions read as hard cuts or pops (the owner's "too many hard cuts"; the plan allows 2).**
- *What's wrong:*
  - 58.40 eyelid wipe (t07): the face drops 40 % in brightness in one frame, then goes black with a slit at 58.47. It reads as a cut to black. The probe counts it as a cut.
  - 77.43–77.63 door-leaf wipe (t10 `enter`): the door goes from half-open to filling the frame in 3 frames (≈ 300–460 px/frame against the 25 px limit), then 2 frames of flat brown. Flagged as a glitch at 77.57.
  - 128.567 light bloom (t13): the 休书 pops in at about 50 % in one frame (diff 64.5 vs base 3). Flagged as a glitch.
  - 115.217 MC3 (t11→t12): the drip ends at y ≈ 980 but the tear starts at the eye (y ≈ 370), so nothing matches. It is also the biggest brightness jump in the film (pale grey → navy, diff 117.7).
- *Evidence:* `detail/e58.jpg`, `e77.jpg`, `e128.jpg`, `e115.jpg`.
- *Fix:*
  - Eyelid: close over 8–10 frames, then open the slit over 10.
  - Door: swing over 10 or more frames with ease-in and no flat-brown hold.
  - Bloom: grow the floor light pool into the paper over 12–15 frames.
  - MC3: end the drip where his eye will be (x ≈ 630, y ≈ 370) or frame S29 so the tear starts under the drip, with a 3–4 frame crossover.

**8. The S16 tattoo tool reads as a giant finger poking his cheek: 59.9–61.1 (t08.mjs).**
- *What's wrong:* the 文笔匠's hand and slim tool merge into one tan cone wider than half his face, so the action ("脸上刺字") does not read (owner rows 77, 125).
- *Evidence:* `detail/tattoo_father.jpg` (60.0).
- *Fix:* make the dark wooden tool with its metal tip clearly stick out past the fingertips, make the hand smaller (0.78 H) and give it a distinct sleeve colour. Or crop to the tool tip and the blooming marks only.

**9. The final fist is off-model: 136.9–141.9 (S33, t13.mjs).**
- *What's wrong:* thick black outline, rubbery sausage fingers, a tube forearm narrower than the fist, and the thumb wrapped across the middle of the fingers. It is the film's last image, under the closing question, and the owner has said "这个手好奇怪".
- *Evidence:* `v1/sheet_31.png`, `v1/sheet_32.png`, `detail/ghosts.jpg` (138.0).
- *Fix:* redraw it in the rig's line and two-tone cel style (#2A1C17 line), fist 0.40 × 0.42 H, forearm tapering into a visible green sleeve. Or backlight it as a near-silhouette against the paper so the hand detail can't look wrong.

### SHOULD

**10. Flat clip-art scenes and clone crowds.**
- *What's wrong:*
  - 14.5–18.66 street (t01): box houses; 林冲 is about 120 px tall between two guards, so "he looks back" (17.0) doesn't read. This is the payoff of the hook.
  - 27–32 parade ground (t03): every soldier is the same figure at the same height in the same pose with equal spacing.
  - 38.6–42.4 temple crowd (t05) and 64.45–67.8 road (t08): the same problem.
- *Owner notes:* row 72 "very cheap looking"; storyboard §1 "must not look like … peg crowds".
- *Evidence:* `v1/sheet_04/06/07/09/15.png`, `detail/train.jpg`.
- *Fix (tonight-sized):* vary crowd height ±4 %, mirror half of them, offset arm and spear angles, add a blurred foreground layer and depth haze on the back rows. In S04, bring him closer (FS scale) and make the look-back a clear head turn.

**11. Proportions to re-measure with the checker.**
- *What's wrong:* in S06 (28.0, t03), measured by eye on a full-size crop, he is about 8.4 H tall against 7.5 H in the model sheet (the head reads small, the legs long). In S22 (79.0, t10), his profile torso is about 0.6 H deep, so he reads paper-thin.
- *Evidence:* `detail/s06_body.png`, `detail/temple.jpg`.
- *Fix:* run the model-sheet §8 checker on S06 and S22 and fix the head scale (k) and the profile torso depth.

**12. Dissolves where the old scene ghosts over the new one (owner row 86).**
- *What's wrong:*
  - 72.95–73.6 (t09 `enter`): the father's arm turns into a pale band.
  - 116.9–117.3 (t12): the face hangs over the window.
  - 124.8–125.6 (t13 `enter`): the two windows sit at different screen positions, so the dissolve doesn't match and the spear line crosses his face.
- *Evidence:* `detail/tattoo_father.jpg` (73.0), `detail/ghosts.jpg` (117.0, 125.0).
- *Fix:* put the S31 window on the S30 window's rectangle for a true match-dissolve. Do S29→S30 as the planned rack focus.

**13. The season flips have hard vertical seams: 101.9–104.8 (t11.mjs).**
- *What's wrong:* hard-edged wipes leave a visible stripe (102.0, 105.0) and look like PowerPoint (owner row 29).
- *Fix:* feather the wipe edge (≥ 200 px) or recolour the whole frame.

**14. Snow falls indoors at the summer farewell: 71.5–73.6 (t08.mjs).**
- *What's wrong:* the first snow falls inside 张教头's tavern, so it reads as snow at the farewell, against L29 (summer).
- *Fix:* start the snow only inside the 72.95 dissolve on the 沧州 side, or only on his shoulder after the hand fades.

**15. Smaller subtitle-on-face cases.**
- *What's wrong:* 115.3–116.8 (t12): the beard sits in the band and the text touches it. 57.1–58.6 (S14 ECU, t07): the text crosses the nose and mouth.
- *Fix:* lift the S29 head about 90 px; set `subYc` to about 1000 in S14.

**16. Red streak artefact: 41.9–42.3 (t05.mjs).**
- *What's wrong:* a translucent orange-red striped column and a dark disc lie over the 鼎 and two worshippers at lower left, followed by a 4-frame milky haze (42.27–42.40).
- *Evidence:* `detail/ghosts.jpg` (42.0).
- *Fix:* keep the foreground incense layer out of frame or make it a soft shape, and stretch the haze to 8 frames or more.

**17. Calligraphy written over text: 134.2–136.0 (t13.mjs).**
- *What's wrong:* 「依旧夫妻完聚」 is brushed on top of the 休书's own columns, and 「聚」 runs off the paper (model sheet §8.9).
- *Evidence:* `v1/sheet_31.png`.
- *Fix:* fade the L8 columns to about 20 % before 134.2, or brush on a clean band.

**18. S14 / S15 look: 56.9–59.9 (t07.mjs).**
- *What's wrong:* in the eyes-shut ECU, the face at this size becomes a lumpy flat shape (a band across the forehead, a crumpled cheek outline), the "塑壳" ugliness the owner rejected. In S15 the 白虎节堂 tiger screen is an unreadable black hook.
- *Fix:* pull back to a CU (face ≈ 50 % of frame height), where the rig holds up. Draw a recognisable tiger (or plain screen) on the screen.

**19. The 沧州 stamp is small and pale: 73.9–77.2 (film.mjs overlay, owned by main).**
- *What's wrong:* the second line 「那年冬天，大雪」 is 34 px, white on a pale grey sky (owner row 76: tags ≥ 40 px).
- *Fix:* 44 px or more, with a feathered scrim or a darker stroke.

**20. The world slide is a dip to white: 63.6–64.45 (t08.mjs).**
- *What's wrong:* the hall fades through white haze, and he jumps from a centred MS to a tiny figure in a WS. The plan was "he stays, the world changes".
- *Fix:* keep his screen position and scale while the hall layers slide out and the road layers slide in.

**21. Script vs facts (needs a VO re-record, so it is the owner's call).**
- *What's wrong:*
  - V29 「那一夜雪越下越大，你一个人，上了梁山。」 reads as the same night as the temple. In the novel he flees east (L16, 第十回) and reaches 梁山 only in 第十一回, on a later snowy night (L18).
  - V03 「你说不出口」: in L10 he does tell her 「娘子，我是好意…」.
- *Fix:* V29 → 「又一个雪夜，你一个人，上了梁山。」. V03 → 「你只说：我是好意——你是怕自己回不来，误了她一辈子。」 (two subtitles).

**22. Delivery file: `林冲_v1_发送版.mp4` (producer).**
- *What's wrong:* it is 1280×720 at 1.2 Mbps (25.5 MB). Owner rows 21/44 ask for 1080p at about 1.5–2 Mbps in one file ≤ 28 MB.
- *Fix:* 1080p at about 1.35 Mbps video + 128 kbps audio comes to ≈ 27 MB.

## What works (keep)

- The title (18.66–26.97): 林冲 brushed with the tear drops becoming the 冫 dots, the seal, and the hat/spear/gourd silhouette. The paper tear along the thrust at 26.97 is the best transition in the film.
- The temple set-piece (79.8–93.6): fire through the crack, the three silhouettes, and the eye slit with letterbox in near-silence. Then the door on the drop at 93.565, landing within 0.1 frame.
- The 休书 motif: the real L8 text and red palm print, coming back at S19 and S32. 「已故半载」 is brushed in sync with the voice, with no subtitle clash.
- Sound: −14.2 LUFS / −1.49 dBTP, both planned silences intact, hits on the grid, clean segment join.
- Care rules hold: the wife's face is never shown, the killing is hidden by the whiteout, no gore. The end card is on brand.

## Not checked / can't judge

- Voice quality, pronunciation and the music's taste: I measured levels only and did not listen critically.
- 「半夜」 (V23) is not a facts.md row. I could not verify the hour against the text.
- Proportions were measured by eye on full-size crops, not with the rig checker. Layer speeds were only spot-checked (the door wipe fails; the 35.2 push-through and the 64.0 slide look fast but are transitions).
- The 发送版 was not reviewed frame by frame, only probed.
- Hat continuity: the brief says the hat is off inside the temple from S22. He wears it while pushing the stone and visibly puts it on the altar at 79.5. I'd keep that, since it is a readable action, not a pop.
