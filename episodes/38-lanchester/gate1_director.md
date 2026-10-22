# Gate 1 notes: 为什么要"集中优势兵力" script v3 (shot list), round 1. Verdict: REVISE

Read: brief.md, script.md v3 (v2/v1 for comparison), lines.json, lines_pace_flags.json, facts.md (27 lines, no new
Trafalgar rows yet), gate1_coldread.md, owner-notes.md (all rows), rubric.md, the 3D look stills (b3d/s.jpg), and
review/music/rynos_bars.png + rynos_zoom_hits.png (because the title/drop ruling depends on the track).

Scores (only what this gate covers). Script **4**: the paradox has a number at 0:00, ★1 and ★4 land (cold read),
and the takeaway and end question are good. ★3 asserts instead of explaining, and Trafalgar contradicts ★4.
Info design as planned **2**: the key visual, the squares "made of the soldiers", is mathematically wrong (note 1).
Editing as planned **3**: the rewind is used twice, the split screen is a cut, sea→land is unmotivated, and the music
shape doesn't match the candidate track. Motion as planned **4**. Visual from the stills **3**: clean, but generic and
toy-like (see "forward to gate 2a"). Sound: n/a.
Compared with v2, v3 is better in every area: 63→24 lines, a real sim instead of dots, one ★ thread, music
shape planned. v2 already had the same square error.
Overall: the owner would send this back for notes 1–4. All of them can be fixed without changing the spine.

## Notes (ranked; Sev = must / should / could)

| # | Sev | Where | Note | Route to | Owner rows |
|---|---|---|---|---|---|
| 1 | must | 11, 12, 14, 17, 19 | **The squares are dishonest as written.** A solid block of N men has side ∝ √N and area ∝ N. A 500-man block fits only **2×** into a 1000-man block, not 4×, so "squares made of the soldiers themselves, side ∝ headcount" contradicts what a viewer can count. Fix: the **side** of each square is a **line of men** (the firing line itself, same number of ranks on both sides, so length ∝ N). The square is the glowing ground area drawn off that line. Then red's square tiles blue's 4× honestly. In ★3 the survivors re-form into a line that is the 866 square's edge. At Trafalgar the line of battle *is* the edge, so cutting the line cuts the side into 13/5/15 and three small squares. Rewrite the shot 11 text: "边长 = 一排人的长度". | screenwriter (picture column), art-director | 31 honest maths, 110, 11 |
| 2 | must | 11–12, ⑫ | **★3 shows no reason, and part of the picture teaches the wrong law.** "Pairs of soldiers fall together" in the overlap is one-for-one, i.e. the sword law. The cold reader "couldn't say why it's subtraction". Replace the slide-and-overlap with the reason the viewer can redo: replay 1000 v 500 overhead with both squares live (edge = live line length). **At every moment both squares lose the same area.** Blue loses a thin L-sliver and red a thick one; peel them off side by side and they match (maths: d(B²)/dt = −2kBR = d(R²)/dt). When red's square is gone, blue has lost exactly red's whole square: 1,000,000 − 250,000 = 750,000 → edge ≈ 866. ⑫ → **"每一刻，两边掉的面积[一样多]"** (13 字) or equivalent. | screenwriter, art-director | 110, 109, 111 |
| 3 | must | 17–19, ⑲ | **Trafalgar contradicts ★4.** The film has just taught that splitting halves your strength, then the British split into two columns (cold read: "so why did Nelson split?"). Show that both columns hit the **same stretch** (centre + rear) **at the same time** while the van has nobody to fight: a gold bracket on the water over the attacked part and a grey one over the van. Researcher: verify the memorandum [5] and add a T5 row with Nelson's own words: overpower "from two or three Ships ahead of their Commander in Chief … to the Rear"; "twenty Sail of the Enemy's line to be untouched … some time before they could … bring their force compact"; the lee line of 16 for the rear 12. ⑲ then carries that idea without a fake quote (e.g. "两列，全压向[同一段]"), and ⑳ pays it off. | researcher → screenwriter | 109, 11 |
| 4 | must | 19, facts | **13 · 5 · 15 is unverified as placed** (Q9). Chan's front piece may include *Bucentaure*/*Santísima Trinidad*, which fought and were taken, so greying all 13 as "赶不回来" could be false. Researcher: confirm the order and which ships actually stood off. The picture greys out only those. Label the numbers as ships (13艘 · 5艘 · 15艘). Also replace source [7] (Wikipedia, row 19) with primaries: Collingwood's despatch (Gazette [4]) for the van, plus Beatty's *Authentic Narrative* (1807) only if any Nelson line survives note 12. | researcher | 19, 11 |
| 5 | must | 02–04, music | **The title goes ON the measured hardest drop** (Q2). 866 lands on the strongest hit before it, with the slow-mo still moving, so there is no dead stop. 866 stays above the title as one composition. "只倒下 134" leaves before the drop. The title is built from the smoke. The candidate track (rynos) has **no drop at ~14 s**: its big lifts are bar 16 (~30 s) and bars 63–64 (~120 s), its loudest stretch is 30–60 s (no hush at ~41 s), and its trough is bars 50–56 (~95–106 s, ~14 dB under the body). Editor locks the track **first**. The script is then re-laid on it, not the other way round. If the hardest drop is ~30 s, use: hook → 866 on the bar-8 lift (~15 s) → rewind → swords → ★1 → **title on the 30 s drop** → guns. The ~95–106 s trough must carry continuous motion (the sky-bridge in note 11), and must not be held on a still shot or text. | editor, then screenwriter | 26, 84, 64, 66, 91, 50 |
| 6 | must | 05–07 | **Melee staging, given no sword animation** (Q7/Q11). Cut the low sideways tracking shot along the duels at 2 m: two static mannequins facing each other is the "cheap" frame. Shoot it mid/high (≥ 25 m up, ≥ 40 m off). The idea is the contact strip plus the idle back half, and that reads best from above. Each duel: both step in (marching pose + translation), a 0.25 s procedural lunge (instance-matrix pitch ~15° + 0.3 m forward), a small spark/dust puff at contact, then one falls. Never hold a static face-off. Falls play at 1× even while the sim clock runs ~8×, so men don't pop. Weapon: if the GLB's musket is a separate node, hide it and rigid-attach an instanced sabre to the hand (static pose → fixed offset). If it isn't, keep fixed bayonets in the rest pose and reword ③ to 拼刺刀 (not 刀). No aiming pose in melee. ⑤ stays verbatim either way. | animator, art-director, screenwriter (③ only) | 77, 98, 72, 46 |
| 7 | must | 01–02, 08–10 | **Gun beats in lines, sword beats in columns.** Deep blocks firing means tracers pass through their own front ranks (row 43) and kills note 1. Use 2–3-rank lines for every gun beat and deep columns only in the sword replay. Shot 08 becomes the picture of ⑥: the rim-lit back half that queued in 06 **fans out into the line**, then everyone fires (needs ~6–7 s). The hook stills (deep blue block) change accordingly. | screenwriter, art-director, animator | 43, 111, 33 |
| 8 | should | 10 | "Red melts from its front" is the sword picture. Aimed fire at random targets (what `sim.ts` does) opens **holes across the whole red line**. Make that the visible contrast with 06 (sword: losses only at the contact line). Label the ratio tag **人数比** and take the ×4 off screen before the move: two different multipliers on screen at once is a misread. Re-form ×4 in 11 from the four ghost squares counting 1-2-3-4. | screenwriter, animator | 86, 11 |
| 9 | should | 09 | The cold reader stalled on ⑦ + tag (a) together, and on "= 4 倍" — 4 times *what*? Keep ⑦⑧⑨. Make the tags counts on the objects instead of sentences: "1, 2" ticks at the two tracer tips on the red man, "½" on the lit blue pair. Replace the scrim board with labels on the sheaves ("火力 ×2" on blue's, "÷2" on red's) that merge into **"战斗力 ×4"**. | screenwriter, art-director | 82, 29, 111 |
| 10 | should | 13, Q3 | **No split screen.** On a phone each half is ~1/8 of the screen, and pre-printed "1000 → 866 → 707" kills the 7-s fight's suspense (cold read). Play it in sequence on one field. First 1000 v 1000 with live counters. Then, on ⑮, red visibly **divides** and one 500 marches behind the forest. Blue beats the first wave (866 appears when reached), wheels, and beats the second (707). Add the relatable line during the second wave: **"打团最忌：[一拨一拨上]"** (or the screenwriter's "打团，别一个一个上"). | screenwriter, art-director | 24, 45, 109 |
| 11 | should | 15–17 | **No 2D inserts** (ruling below). 竹简 → **"以十攻其一" written in gold brush strokes across the empty half of the 1000-square on the grass** (overhead, on the beat). Keep ⑰ as the readable setup and add the small tag 《孙子·虚实篇》. **Cut the book page**: its heading is English for 3 s and "这一仗" points at nothing yet. Bridge land→sea with the camera: rise into the evening clouds over the field and descend through them onto the fleet (same sky). Lanchester becomes a tag over the approach, *after* the header: "兰彻斯特专门算过这一仗 · 1916". **Cut the handwritten memo overlay** (two languages in 2.5 s). Draw the plan as gold dashed tracks on the water from each column to its cut point (data on the object). | screenwriter, art-director | 29, 33, 72, 82, 86 |
| 12 | should | 20, ㉒ | **Cut ㉒ "纳尔逊本人，中弹身亡"** (Q4) and the 1805.10.21 tag (the header already says 1805). Shot 20 stays as ~3 s of quiet drift with no text, and its smoke bank crossing the lens carries the cut to the dusk field. That fixes the unmotivated sea→land jump. | screenwriter, editor | 109, 107, 86, 95 |
| 13 | should | 21 | The dial is the most PPT frame of the film (cold read). Put the limit in the world instead. Same field at dusk, a messy fight: a hedge and a ridge break the lines, smoke banks hang, companies arrive at different times, and rim-lit men who can't see a target stand idle (an echo of 06). ㉓ stays. Researcher: add a row from Chan [2] on the law's assumptions (all in range and visible, fire spread evenly), so the picture rests on a source. | screenwriter, art-director, researcher | 29, 72, 11 |
| 14 | should | 22 | "The light turns gold" must not brighten after the climax (row 95). Light falls instead: the sun touches the forest line and the merged block goes to silhouette while the music falls apart. | art-director, editor | 95, 88 |
| 15 | should | 12 | 866² = 749,956, so write **1000² − 500² ≈ 866²** (honest maths). Put each number along its square's edge instead of a floating equation. | screenwriter, animator | 31 |
| 16 | should | 01–02 | The ghost "直觉：500？" enters **after** ② has been read (~6.6 s), so the viewer guesses first (cold read). Make 500 a tick on a thin bar under the blue counter, so "blue stops far above 500" reads by ~9 s. | screenwriter, animator | 47 |
| 17 | should | 05/08, 12→13, 20→21 | The tape-rewind is used twice within 15 s (05 and 08). Keep it for 05; 08 needs a different motivated move (e.g. ★1's last sabre glint becomes the sun flare on a fresh field, then the fan-out of note 7). Plan motivated hand-overs for 12→13 and 20→21 in the storyboard. Outgoing tags ("500 ✓", "拼刀：剩 500", the Lanchester tag, "两块加起来 = 一半", the tally) leave **before** each move. | art-director, editor | 86 |
| 18 | should | 03–05 | ~6 s with nothing new after the 866 payoff is the cold reader's first swipe point. Hold the title ≤ 2 bars. Start the rewind as its letters dissolve back into the smoke. ③ comes in on the first sabre frame. | editor, screenwriter | 14, 91 |
| 19 | could | ②, ⑭, ⑮, title, end card | ？-centring in the shared subtitle component; also check 》 at the end of the title (it carries right-side space too). Measure the ink centre on a rendered frame. | animator | 89, 97 |
| 20 | could | 17–20 | Light progression: the approach in late-morning haze, the climax in hard afternoon light with smoke, the quiet at sunset. Golden hour on the approach is ahistorical, and the progression also tells time passing into the fall-apart. | art-director | 81 |

## The screenwriter's 12 questions: rulings (in the owner's place)

1. **Question in the hook: keep ②.** Row 47 forbids asking the "为什么" question. ② is a guess prompt, and the "why" is left to the viewer when 866 hits. Only change the timing of the ghost "500？" so it comes after ② (note 16).
2. **866 vs title: title ON the hardest drop.** Rows 26 and 84 say this explicitly (and ep28 "even if that is 40 s in"). 866 goes on the hit before it, no dead stop (row 91), and the title is built from the smoke (row 90). The emotional peak, a different point in the track, gets Trafalgar (row 88). See note 5 for the rynos layout.
3. **Relatable line: yes, add it, but in the divide section, not at the end.** Row 45: a 20-year-old must think 这说的就是我. Here it is a 原来如此 about their own team fights, set up by ★4 right after it. The cold reader's own comment was "所以打团别一个一个上去送". At the end it would undercut the quiet fall-apart (row 95). It is not a fact claim, since it applies L5.
4. **Nelson's death: cut.** Row 109: "cut every fact that does not serve that thread, however good". Row 107: the example must not take over. It also opens a new human question during the falling-apart. Keep the quiet sea picture without text. This is reversible if the owner misses it.
5. **Why before snowball: approved.** Only the first volley gives exact 2 / ½ counts, and ★2 depends on that.
6. **Seeds: approved, with one rule: counters always show the live sim value, never a forced number.** Exact 866 (rifle) and exact 500 (melee, 50/50 duels, sd ≈ 30) are reachable by seed search. 1000 v 1000 almost never ends at 0:0, because the last kill leaves the killer standing. Use 同归于尽 only if a seed truly gives 0:0, otherwise ⑭ → "两边一样多？[两败俱伤]". Same for 707 in the second wave.
7. **Melee time-lapse ~8×: approved**, with falls played at 1× and the staging in note 6.
8. **Every soldier fires: approved** (L3 idealisation, and note 13 is the honest limit). It requires the line formation in note 7.
9. **13 / 5 / 15 order: not approved yet.** The researcher must confirm the order and which ships left (note 4).
10. **Trafalgar not claimed as a pure square-law result: approved.** "硬拼该输" is fine because the squares on screen show it as the 27² v 33² reading.
11. **Swords on Napoleonic infantry: allowed only as staged in note 6.** Sabre swap if the musket node is separable, otherwise bayonets with ③ reworded. No aiming poses in melee.
12. **Cuts (Jellicoe, L6, the rounds table, 两千多年前): approved.**

## The specific rulings asked for

- **Question in the hook:** keep it (Q1).
- **866 vs title:** title on the hardest drop; 866 one hit before (Q2, note 5).
- **Relatable line:** add it in shot 13 (Q3, note 10).
- **Nelson's death:** cut (Q4, note 12).
- **Melee feasibility:** feasible at mid/high distance with procedural lunges, contact puffs, and existing falls at 1×. Not feasible as a low close tracking shot (note 6).
- **2D inserts → 3D world:** yes, all three. The quote goes on the grass of the empty half-square. Cut the page and the memo overlay. Bridge to the sea with the sky. A paper insert in the middle of the only 3D world this series has built at this scale is the "PPT / cheap" break the owner keeps flagging (rows 29, 33, 72), and the cold reader skipped both texts (note 11).
- **Lecture?** No line is a lecture: 24 short lines and no calculation in a subtitle. The lecture *feel* comes from four things: on-screen furniture (the step board, the floating label "边长 = 人数 · 面积 = 战斗力", the floating equation, the dial) and ⑪+⑫ as two rule statements back to back. Notes 2, 9, 13 and 15 move all of them onto objects, and ⑫ becomes the reason.

## Facts check (every number in the lines → facts.md)

1000/500 L4 · 866/134 L4 (≈, note 15) · 两倍/一半/4倍 L3 arithmetic · 707 L5 · 27/33/1805 T1 · 一艘没丢/一半以上 T4 ·
我专为一，敌分为十 S1 verbatim · 1914/1916 L1 · 没这么夸张 L8. **Open:** 13·5·15 mapping (note 4); 0:0 depends on the
seed (Q6); ⑲ is a paraphrase with a colon that reads as a quote (note 3); T3/T4 lean on a Wikipedia cross-check (note 4).
All other numbers trace to ✓ rows.

## Forward to gate 2a (from the stills; not blocking the script)

The red army is a hairline in the wide shot and would vanish on a phone. The ground plane's edge shows as a flat grey
band at the left horizon. Every soldier stands in the identical rest pose on a perfect grid (toy army): add per-instance
yaw/scale jitter and aiming poses in the firing ranks. The tree line is one repeated tree in a row. Ground tiling is
visible. Light is flat noon overcast: use one low motivated sun (row 81), with the red line against it as the script says.
The climax only works if it is the best-looking frame of the film (cold read); the 2a style frame must prove it.

## What must not change (it works)

- Frame 0 = the first volley on the downbeat, with ① on frame 0; live counters from the sim.
- ★1: the idle back half in rim light, and ⑤ "你的直觉，属于[冷兵器时代]" (the cold reader's best line).
- ★2: the bullet-time freeze counting tracers on the **first** volley, music hush → ×4 on the drums' return.
- ★4: two half-squares fill only half the whole one, then 孙子 ⑰.
- Trafalgar's line-break as the biggest image on the emotional peak, the waterline camera, and the 1.5-s slow-mo echo of the bullet time.
- 24 short lines, no 公式/课本 framing, the safe-phrasing checklist, the cuts of Jellicoe/L6.
- Ending line ㉔ "同一时刻、同一地方，[比他多]", the end-card question, and title option 1 (ranking: 1 > 2 > 3; option 2 would repeat the answered puzzle on a post-866 title card).
