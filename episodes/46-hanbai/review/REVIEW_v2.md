# Review: 汉柏的孩子，去守汉武帝 v2 — verdict: FIX FIRST

The film works. The locked camera at the tree carries the story, every number on screen traces to facts.md, the title lands on the 13.588 crash and the peak line lands on the 118.307 drop to the frame. One owner-rejected pattern is still in the cut: at 1:48 there is **1.1 s of digital silence over a frozen picture**, in the middle of an ordinary line. It is a small animation fix and the music does not need to change. Three gate-3 r2 / logic-check r2 items are also still open in the render.

Reviewer, 2026-10-25. Master `/tmp/claude-0/r46/汉柏的孩子_v2.mp4`. I looked at all 16 sheets (`review/v2/sheet_01–16.png`) plus about 60 extra full-res frames and crops (`review/v2/x/`). Automatic output is in `review/v2/auto_checks.md` and `review/v2/probe.json`. Raw audio for the analysis was kept under `/tmp/claude-0/review46/` and is not in the repo.

## Fix list

| # | Sev | Time | What's wrong | Evidence | Suggested fix |
|---|-----|------|--------------|----------|---------------|
| 1 | **BLOCKING** | 1:48.40–1:49.49 | **Dead stop with a frozen picture.** The mix drops to digital silence (−85 dB) for 1.09 s. This is the song's own stop bar (bgm2 ≈180.6–181.7 s), carried in by SPAN 2 of build46. For the same stretch the picture barely moves: the mean frame difference is 0.08–0.13 from 1:47.6 to 1:49.2, against 5–18 elsewhere. The basket stands alone and nobody is collecting. The line 「人们收集了你的[种子]。」 is already read (pace.py: WAIT, held 1.6 s past reading). On a phone this reads as the video lagging. Owner rows: "不用那一段awkward的卡顿 → no dead stop before a drop: a silent gap plus frozen picture reads as the video lagging" (ep29), and "keep a deliberate silence short (≤ ~1 s, and only as a joke beat)" (ep14). The music re-enters at 1:49.245, right on the 2024 cut at 1:49.27, so the pause itself is usable as a "pause before the hit" (row 112, pauses.md). The frozen picture is the problem. | `x/f_108.0.jpg`; sheet_12 frames 4–5 (1:47.27, 1:49.07); audio envelope 108.40→109.49 at −83…−88 dB; frame-diff trace in this review's notes | Keep the music as it is and animate into the silence. From about 1:47.8, cones drop from the **living** east crown (x ≥ 1300, small cones, not orange-sized) into the basket. Add one crouching collector, or a pair of hands steadying the basket, so 「人们」 is shown. In the last beat before 1:49.25 a glow gathers in the basket. On the re-entry hit at 1:49.25, cut to 2024 as now and launch the six lights. Also remove the stray seed beside the dead trunk (x ≈ 1000–1060 at 1:48). |
| 2 | SHOULD | 2:18.35–2:20.58 | **2.2 s with almost no music and no subtitle.** After 「你一直在。」 the coda dead stop rings out, falling from −31 to −45 dB over 1.7 s. The intro's first note does not come back until about 2:20.59, and the next subtitle starts at 2:20.58. The night grade falls slowly over it (frame diff 0.3–2), so it is not frozen. It is still more than twice the owner's "≤ ~1 s" for a deliberate silence (row 50). On a phone speaker it reads as the music breaking just before the end card. | `x/f_138.6.jpg`, `x/f_139.2.jpg`, `x/f_140.0.jpg`; envelope 138.4–140.4 | Shorten the gap in `build46.py` SPANS from `('gap', 1.70)` to about 0.6 s (one beat). Move the last two lines and the end card 1.1 s earlier, so the film becomes about 155.3 s. Or keep the gap and start 「它真是汉武帝种的吗？」 typing at 2:19.2 over the night fall, so the eye has something to read. The second option needs no music change. |
| 3 | SHOULD | 1:58.3–2:02.9 (peak) | **「你」 is cropped in the film's biggest frame.** The ghost tree behind the mound now has its two trunks (r2 B2a, the 相传 tag, is fixed). But its crown runs off the top of the frame (y < 0–170), and both text lines sit on top of its trunks (y 190–400). What reads is six young trees, rays, and half a tree behind the text. Gate 3 r2 B2(b) asked for the crown to be fully in frame on the mound top, with the text moved down to y 440–620. Neither change is in this render. Owner row 88: the emotional peak "should be the most spectacular frame of the film". | `x/f120.png` (2:00.5); sheet_14 frames 2–3 | Apply B2(b) as written: the sky tree's base at y ≈ 285 on the mound top, trunks visible to y ≈ 140, the crown fully inside the frame (y ≈ 15–170, about 520 px wide, 35 % opacity, warm glow). Move the two lines to y 440–620 over the mound face. Check that 守他 (gold) stays crisp on the tan. |
| 4 | SHOULD | 1:21–1:25 | **The kneeling soldier's hand is still not on the fire stick** (logic r2 #2, BLOCKING there; the crew log says it was applied). In every frame from 1:21.0 to 1:24.2 the stick rests on his thigh, and his open hand floats about 25 px above its upper end with no contact. It reads as warming his hands, with a stick lying by the fire. This is the owner's "hands floating / is he feeding the fish" family. Caps and queues are fixed (r2 B3). | `x/kneel.png` (1:21.0 / 21.8 / 22.6 / 23.4), `x/c82k.png` | Put his near hand on the stick's upper end (IK to the stick point) and push it in and out on a 2–3 s cycle with a small spark burst. Or delete the stick and let him warm his hands, since the stirrer already says 做饭. Re-run pose_check. |
| 5 | SHOULD | 1:27.2–1:31 | **The 唐槐 is see-through.** The hall roof's slats and ridge show through its trunk and main branches. The 「唐槐」 label sits on the branches. Gate 3 r2 B4 bullet 2 (trunk and branches solid #6B5A4A, only the crown may fade) is not applied. The courtyard smoke excuses some haze, but a solid tree is never transparent while the stele beside it is opaque. | `x/c89.png`, `x/f89.png` (1:29.0) | Draw the trunk and branches at full opacity behind the wall line, and let only the leaf crown fade as it dies. Put the smoke layer over the tree, not into its alpha. Move the label above the crown (y ≈ 230). |
| 6 | SHOULD | 2:06–2:13 (visitors) | **Limbs with no body.** At 2:09.0 a walker's torso is hidden by the pavilion's red pillar, and only the legs show, directly above the left photographer's cap. It reads as legs on his head. This is logic r2 #5 / gate r2 S11, still open. The photographers themselves are good. | `x/vis2.png` (left: 2:09.0), `x/vis.png` | Apply the lane rule: no walker within ±50 px of a standing figure unless the feet are ≥ 60 px higher and the head clears. A walker behind a pillar or stele is either fully hidden or shows head and torso. Shift this lane to x 1080–1150 or feet y ≥ 880. |
| 7 | NICE | 1:32.3, 2:00, 2:15 | Centred punch lines ending in 。 sit 7–9 px left of centre (ink centre 952.5 / 952.5 / 951 against 960). Lines ending in ？ are centred (957, 959) and the end card is centred (962 / 959.5). Owner row 97 asks for a measured ink centre. | measured on `x/f_92.6.png`, `x/f120.png`, `x/f_136.0.png` | Pull trailing 。 back a little less, or apply the same pull-back used for ？. |
| 8 | NICE | 2:14.3–2:18 | 「你一直在。」 sits across the dead trunk's broken tip and the pavilion roof (gate r2 P13 still open). | sheet_15 frames 5–6 | Move it up about 90 px (y ≈ 360–450). |
| 9 | NICE | 1:37.6 | 「西干 · 死了」 now has a leader that touches the trunk (r2 S9 fixed). But 「死了」 sits on the top arch of the carved stele. | `x/c97.png` | Raise the label about 70 px (y ≈ 430) so it clears the stele top. |
| 10 | NICE | 0:41.3–0:44 | The six-seal row first appears small: names about 22 px and years about 16 px at 1080p. It grows to 40 px from about 0:45. Owner rows 69/76: labels ≥ 40 px on a phone. | `x/c42.png` (0:42.7) | Bring the seals in at their final size, or grow them in 0.3 s. |
| 11 | NICE | 2:02.9–2:04.0 | The peak dissolves into the courtyard over about 1 s. The six seedlings and the faint 「两千多年后」 ghost over the courtyard while the subtitle is still up. Owner row 86: nothing from scene A may still be fading once scene B is on screen. | `x/s1235.png` (2:03.2–2:04.1) | Clear the seedlings and the subtitle first (by 2:03.4), then bring the courtyard in, or use a motivated move (the lights travel back east into the crown). |
| 12 | NICE | 1:15–1:18, 1:21 | Polish carried over from gate 3 r2 / logic r2: the stele poem runs over the carved tree's crown (logic #23). The soldiers have no belt, leg wraps or rifle stack (optional parts of r2 B3; the caps alone now read as army). Tortoise bases still read as pebbles (P16). | `x/poem.png`, `x/cmp82.png` | Optional. Poem into the stele's right margin, a 3-rifle tripod by fire 1. |

## Automatic checks (summary)

- **Format:** 1920×1080, 30 fps, 156.445 s. **4693 frames** in both the master and the send file (= 156.43 s × 30). The audio length equals the bed's 156.445 s.
- **Loudness:**
  - Master: −14.01 LUFS, −2.19 dBTP, LRA 4.4.
  - Send file: −14.0 LUFS, −2.3 dBFS peak.
  - Within the −14 / ≤ −1.5 target.
- **Glitches / black / frozen (probe):** 0 / 0 / 0. That matches the earlier glitch scan (0 of 4693). probe's "frozen" check didn't catch #1 because it looks for a fully static picture.
- **Silences (≥ 1.2 s at −45 dB):** none flagged. The two quiet stretches above (#1 at 1.09 s, #2 at about 2.2 s ringing) were found by hand on a 10 ms envelope.
- **Joins:** the six bed joins have no clicks and no level jumps. The largest sample step at a join, 0.217 at 91.136 s, is inside the film's normal loud-passage range of 0.20–0.24.
- **Bitrate:**
  - Master: 3.86 Mbps (CRF 17). probe flags it MAJOR as "≥ 8 Mbps to upload". I dismiss that flag: owner rows 21 and 44 set the delivery at about 1.5–2 Mbps in one file ≤ 28 MB, so the master is only the HD file.
  - Send file: video 1.30 Mbps, AAC 128 kbps. That is inside the account's proven 1.2–1.8 Mbps range.
  - Send-file size: 28,099,088 bytes = **26.8 MiB / 28.1 MB (decimal)**. That is fine for the 30 MB chat limit. If "28 MB" is meant in decimal MB it is 0.1 MB over; re-encode at 25.5 MiB in that case.
  - Send-file picture: flat vector art and the night gradient hold up. I compared the 1:22 crop between master and send file and saw no banding at 2:19.
- **Pace (pace.py):** 9 % waiting (target ≤ 12 %), 0 lines too fast. The WAITs are 1:45.3 (#1), the peak (2.6 s, fine on the drop), 「2135岁」, 「你一直在」 (a payoff hold, fine) and the end question (on the end card, fine). Subtitle-free spans: 0:13.6–0:15.8 is the title card. 0:56.0–0:59.4 is the named time-lapse (counter 1142 → 1843, snow, seasons). 2:18.3–2:20.6 is #2.
- **Sources (facts.py):** no problems. **Brand:** no 「Juno 出品」, no Wikipedia in src.

## Music on the title and the peak

- **Title:** the onset rises from −20 to −8 dB at 13.58–13.62 s (crash at 13.588). The cold-open text is fading at 13.55, and the plaque is fully in by 13.65, with the year counter rewinding 2026 → 2021 → 1914 → 1392 → 前68 → 前110 under it. On the hit. ✔
- **Peak:** a −5 dB breath from 117.2 s (−23 dB), then the drop onset at 118.30–118.31 (−22 → −11 dB). The line 「两千多年后，」 starts at 118.307 and the hard cut is at 118.33. On the hit. ✔
- **Final hit:** 149.097 → the end card's J/title appears at about 149.0 (frame-diff jump). Fade over the last 2 bars, ending under the end card. ✔
- **2024 re-entry:** music returns at 109.245, cut at 109.27. ✔ (The silence before it is #1.)

## Subtitles against lines.json and facts.md

- The on-screen text at every sampled line midpoint matches `lines.json` (v3, 47 lines; `lines_v2.json` is the stale 赤眉 version and is not used).
- Every claim traces to a verified row:
  - 2100多 / 2135 (row 13: 110 + 2026 − 1)
  - 8 visits and no tree in 《汉书·武帝纪》 (12, 14)
  - 盖汉武所植也 (9)
  - six 封禅 emperors (22)
  - Qianlong 10 times / 1762 / 数千年神物 / 1771 stele (26–28)
  - poem 名實賓主誰是乎, the 故宫-fragment variant (29)
  - 1928 中山市场, soldiers cooking (30)
  - dozens of cypresses dead, 齐鲁晚报 stamp shown (31)
  - 唐槐 dead in 民国 wars (33)
  - west trunk burned, 32 cm strip, 11.5 m (5, 6)
  - seeds (44)
  - 2024年4月, 6 of the 8 seedlings from 汉柏连理 to 茂陵 (43)
  - 800万 three years running (41)
- Counter arithmetic is right at every stamp: 56 → 165, 725 → 834, 1008 → 1117, 1762 → 1871, 1771 → 1880, 1928 → 2037, 2024 → 2133, 2026 → 2135, 前89 → 21. 「?」 for the undated fire and 「—」 at 秦始皇.
- 相传 is on the counter throughout, so the legend is never stated as fact.
- One wording nit, no fix needed: 「北魏《水经注》写」 — the words are a quotation from 《从征记》 inside 《水经注》. The tablet's caption 《水經注》卷二十四 is accurate and the plain reading doesn't mislead.

## Owner-notes pass (rows that apply)

- Row 22/47/115, opening: frame 0 is the tight two-trunk shot with 「假如说，」 already typed; music's first note at 0.56 s; the counter is on the picture. ✔ (r2 B1 fixed.)
- Row 26/133, title on the drop: on the first crash. ✔ Row 88, peak: see #3.
- Rows 50/91/112, silences and dead stops: **#1 (BLOCKING), #2 (SHOULD).**
- Row 17, Juno end card: J monogram, gold title, question, follow pill 「关注 Juno · 一起看懂世界」, sources line; never 出品. ✔
- Row 121, era props: 民国 peaked caps, no queues. ✔ Row 74/77/98, body logic and actions read: #4, #6.
- Row 86, nothing fading into the next scene: #11; the r2 "props grow instead of fading" changes landed elsewhere (0:53 hall rises, 1:07 pavilion).
- Row 89/97, punctuation centring: ？ lines centred; 。 lines #7.
- Row 99, named categories in order: the six seals are labelled in spoken order. ✔ Row 77, counts match the picture: six lights, six young trees. ✔ (r2 lollipop row gone.)
- Row 40, something new: the camera that never leaves the tree, with history coming to it. ✔
- **Risk, not graded:** owner rows 51/64/66 ("1 coherent untouched BGM… don't cut or process anything") were given on ep14. The ep46 bed is the ep42 plan-A edit of bgm2 (4 jumps, reverb tails, −5 dB breath, −3 dB bookend return) plus a new 2-bar intro loop. The joins are clean, but I couldn't find a record that the owner accepted plan A. The producer should know this before he hears it.

## Fixed since gate 3 r2 / logic check r2 (looked at in v2 frames)

- r2 B1: subtitle on frame 0.
- r2 B2a: the 相传 tag is gone before the drop (2:00.5).
- r2 B3: peaked caps, no queues (1:22).
- r2 B5: the counter is clear of the cooks at 1:29.
- r2 S6: no plaque cords.
- r2 S7a: young trees have a single slim trunk with no hollow.
- r2 S7b: the legend figure is a dashed outline, with its 相传 tag clear of the subtitle (1:56.5).
- r2 S8: no lollipop row on the journey.
- r2 S9: the 西干 leader touches the trunk.
- r2 P14: name labels fade before 谁是主谁是客.
- Logic #6, #7: fire 2 is clear of the pavilion; the counter is clear of the cooking.

**Still open:** logic #2 (#4 here), r2 B4 唐槐 (#5), S11 / logic #5 (#6), B2b (#3), P13 (#8), P15 seeds (folded into #1).

## What works (keep)

- The device: the camera stays at the tree, the world and the counter run past it, and the cold open lists the fates fast and lands on the bark strip.
- The title plaque slamming in on the crash, with the year counter rewinding 2026 → 前110 under it.
- The record sequence: the slip table with the empty 「种树 · 无」 slip, then the 水经注 tablet with 蓋 circled, then 「盖 = 大概」.
- The 32 cm dimension bar on the glowing strip, and the 11.5 m bar.
- Qianlong's group, the pavilion stele, and the 望着 sight-line.
- The drop landing on 「两千多年后」, and the honest 相传 counter all the way to the end card.

## Not checked / can't judge

- The music's taste (only levels and timing were measured), and whether the owner has accepted the bgm2 plan-A edit.
- How it plays on a real phone speaker.
- pose_check: I didn't re-run the code checker. #4 and #6 are from frames.
- The covers and the publish package (out of scope).
