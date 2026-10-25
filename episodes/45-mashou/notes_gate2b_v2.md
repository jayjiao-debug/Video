# Gate 2b notes, round 2: 假如你是圆明园马首 (Look 1 铜灯影), storyboard r2 + style/v4. Verdict: REVISE

Director, 2026-10-25. I compared this round with notes_gate2b_v1.md. I read all 11 stills at full size and at 400 px, and cropped the C1 head, the h1b doorway, the b3 carry and the A4 front-left brothers.

## Scores (gate 2b covers Visual, Info, Edit and Motion)
| Area | r1 | r2 | Evidence |
|---|---|---|---|
| Visual | 3 | **3** | **Better:**<br>• h1b is now a Qing 隔扇/菱花 hall. Mean luma is 62, you are about 180 px tall, the opening is 73 % of frame height, and the spill runs to the lens.<br>• b3's water reads as water.<br>• e2a is fixed.<br><br>**Held at 3:**<br>• The hero still reads as a generic stylised horse or a chess knight (note 1).<br>• The h1b staff are slabs with arms like bars (note 2). |
| Info | 4 | **4** | I checked the counter dots in every frame (12, 11, 4, 7, 7) and they are right. 猴 still fails (note 3). |
| Edit | 4 | **5** | n5 and n6 landed: #8 is a door move, #28 and #29 fly right and then left, and #31 is the 翼角 → ear match. The gate is now frontal with no 90° turn, and no move repeats. |
| Motion | 4 | **4** | The build load was cut as asked. Stale text still describes some of the cut features (note 6). |

## Round-1 notes: status
| # | Status | What's left |
|---|---|---|
| 1 Hero | **Partly** | **Gained:** the window band on the ridge, the open mouth, the collar ring, and mane locks rooted on the crest.<br>**Still open:** the cheek disc, the ball muzzle, the outline-hook ear and the striped mane. Note 1. |
| 2 「今」/2026/copper in Hangzhou | Fixed | — |
| 3 H1b | **Partly** | Luma, size, architecture, pines and spill are all done. The staff and the hero's contrast are not. Note 2. |
| 4 Brothers | **Partly** | 牛, 蛇 and 狗 are better in isolation. 猴 still reads as a person in a peaked cap. In A4, 猴 covers 狗's muzzle. B5 has not been run. Note 3. |
| 5 Repeated moves | Fixed | — |
| 6 Gate | Fixed | — |
| 7 Frame fixes | a–e fixed; **f open** | 7f is the 海晏堂 façade, waiting on the researcher. Note 4. |
| 8 T5, C2b, D10a | Fixed | Two stale numbers remain in the timing flag. Note 6. |
| 9 Build load | Fixed in the rows | Stale mentions remain in other sections. Note 6. |
| 10 D3 | Fixed | — |

## Remaining notes
| # | Sev | Where | Note | Route |
|---|---|---|---|---|
| 1 | **High** | Hero: C1, and every shot it appears in | **It reads as a stylised horse or a chess knight, not as the 马首.** The zebra worry is confirmed. At 400 px the mane is alternating dark and copper bands across the neck. In A4 and d6a the orange head with dark diagonal stripes reads as a **tiger**, and the 虎 brother stands beside it.<br><br>**Fix in one pass, in hero2.js:**<br>**(a) Mane.** The locks run **along** the neck: long S-wave locks hanging from the crest down its back edge, overlapping like flames.<br>• Each lock is mid-copper, with 3–4 fine grooves running along its length.<br>• Near-black only in the narrow gaps between locks, ≤ 15 % of the mane's area.<br>• Test at 400 px: the mane's mean luma is within 25 of the face, with no light/dark banding across the neck.<br>**(b) Face.** Make it longer: muzzle tip to ear base ≈ 2.3 × the jaw depth.<br>• The muzzle tapers; no ball. The nostril is a flared comma.<br>• Replace the cheek disc with an angular cheek plate: a hard plane edge from the throat to the mouth corner, and no circle outline.<br>**(c) Eye.** Remove the dark eyebrow stroke. Use a bulging cast eye with lid rims; the brow is a lit plane edge.<br>**(d) Ears.** Both are pricked. On the near ear, the top third curls forward as a **solid copper form** as thick as the far ear, not a white-outlined hook.<br>**(e) Base.** The neck ends in a cut edge with a slight flare. The ring is no wider than the neck, in the same copper, with no separate bright rim. A wide puck reads as a chess piece.<br><br>**Proof:** c1_proof with the real photo in its slot, plus A4 and d6a at 400 px, where nobody should see stripes. Send only C1 to the owner (row 75). | art-director |
| 1b | **High** | Reference photo | **The AD needs the photo before redrawing, not after.**<br>• Fetch it through the asset farm (`{"type":"url"}`, row 60): an official or press photo of the head, from 新华社, 国家文物局 or 圆明园管理处. No Wikipedia or 百科 (row 19).<br>• Put the 文殊亭 photo and the 「海晏堂西面」 plate in the same request (note 4). | researcher (producer runs the farm) |
| 2 | **High** | h1b, the hardest drop | **(a) The staff are flat slabs.** Each has a stepped notch at the neck, and both arms are parallel bars coming out of the chest.<br>• Rebuild them with `<Person>`: the near shoulder at the top of the torso (row 75), the near arm running from the shoulder to the leaf's free edge, the far arm mostly hidden, mid-step backward.<br>• `pose_check.mjs` must print PASS before this still goes to the owner.<br>**(b) You are darker than your own spill.** I measured the face at 132 and the wall behind it at 158–166 (row 81).<br>• Let the back wall fall off to ≤ 110 around the head, so the glow is brightest at you.<br>• Target: the face is ≥ 20 luma above the wall behind it.<br>• Keep the frame mean ≥ 60. | animator (staff), art-director (light) |
| 3 | Med | Brothers: bros_blind, A4, b3 | **(a) 猴.** The flat brow bar reads as a cap visor, which is fatal in a film full of human profiles. Remove it. Draw a deep concave face, a protruding rounded muzzle with the open mouth (the AD's fallback), a large round ear set mid-head and a cheek fringe.<br>**(b) A4 and b3.** The two nearest heads on the left must not overlap each other's defining feature: 狗's long muzzle has to be fully visible.<br>**(c) Run B5 after the A4 re-render:**<br>• the cold reader names ≥ 10/11 from bros_blind at 400 px;<br>• the cold reader finds 狗 and 猴 in A4 at 400 px. | art-director (cold reader for B5) |
| 4 | Med | 7f: the 海晏堂 set (A, B, K) | It is still a generic town-hall façade with a clock pediment. Redraw it once from the 「海晏堂西面」 plate (note 1b), with the double curved stair, **before the POOL build**. The owner does not need to see it first. | art-director, after the researcher |
| 5 | Med | Voice-over (new) | **The pictures stand. These board items are tied to exact line times; recheck each against the measured VO clips:**<br>• **Teaser hard cuts at b4.5, b5.5, b6.5 and b7.75.** Each VO clip ends before the next cut: T1 ≤ 2.26 s, T2 ≤ 2.26 s, T3 ≤ 2.83 s, T4 ≤ 2.26 s.<br>• **C2b (n8b).** The VO ends by 8.96 (the cloth wipe), so no voice runs over the title slam. The title, rewind and end-card stretches have no voice.<br>• **T5.** The VO ends before the ◀◀ at 25.2.<br>• **D3 roll call (b28–b28.75).** Each head lands on or just after the VO saying its name, in the order 牛 猴 虎 猪 (row 99). If the voice runs ahead, move the heads to the words, not to the beats.<br>• **D10a.** 「未付款」 lands on the VO's 「不能付」, not blindly on b43.<br>• **Q.** The VO ends before 169.50, when Q slides into the card.<br>• **The duck.** Duck with a ≥ 120 ms attack so the hit transients play at full level. This matters most at 118.87, the hardest drop, which is also the H1b line start; also at b17, b21.5, b25, b35.75, b40, b58 and b69.<br>• **Board.** Add one VO line to the engine-layer table that says this. | editor (art-director adds the board line) |
| 6 | Low | Stale board text | These contradict the r2 rows; an animator could build from them. Delete or update:<br>• L365: 「a fine mist」;<br>• L309: 「winding queue」;<br>• L431: 「steps down the terrace steps」;<br>• L455–456: 「phone-bank clerks」 and 「Ho walking in and sitting」;<br>• L338: T5 「3.85 s」 → 3.94;<br>• L343: 「fade out by 9.55」 → 9.37;<br>• sheet.png's title says 《马首回家，用了160年》 but the film is 「假如你是圆明园马首」. | art-director |
| 7 | Low | Counter `r` dots | `#EE4B3B` is a second saturated accent, which breaks "one copper accent" and "you are the only saturated colour".<br>• Fill `r` with solid ivory `#FFF1DC`. `h` appears only under 在家 before 1860, so the two never share a frame.<br>• Update the D3, D11 and H3c wording ("fill red", "land red"). | art-director |

**Gate 3 check (no action now):** in b3, the far mitten at the collar's front merges with the 羊 seat behind it. Separate it when the carry is built.

## Don't change (it works)
- **Everything on the r1 list still holds.**
- **h1b's set:**
  - the 隔扇/菱花 doors, 裙板, lit rafters, needle-pad pines;
  - the low, close camera;
  - the spill to the lens with no flash;
  - chip 当代 and 回国 7/12.
- **The caption layer.** b3's water reflections and coping, e2a's chair, window, star and ember, and d6a's lamps. Every frame meets the house corners:
  - subtitle x 150;
  - stamp and seal 120 px from the right;
  - stamp 62 px from the top, seal 60 px from the bottom;
  - copper tags.
- **The hero's metal cues:** the cool window band along the ridge, the open mouth, mane locks rooted on the crest, and the collar visible in C1. Keep them through the redraw.
- **Transitions #8, #26, #28, #29 and #31 as written.** The F33/F34 handling: 当代 chip, no K2 stamp, cool light in Hangzhou, the unplaced sky at T5.

## Process
- Notes 1 and 2 change pictures. Send the owner only the corrected C1 (full size and 400 px, next to the photo) and h1b (row 75).
- Notes 3–7 are frame and board fixes.
- Round 3 checks only these items. If the hero still reads as generic after this pass, I will ESCALATE with two options for the owner: a flat-vector hero, or a model-based hero baked to sprites.
- Producer: the owner's VO request supersedes owner-notes row 28. Add a row for it.
