# Gate 4 notes: 汉柏的孩子，去守汉武帝, full cut v3: APPROVE (ship)

Director, 2026-10-25. Master `/tmp/claude-0/r46/汉柏的孩子_v3.mp4` (156.445 s, 4.15 Mbps). Send file `/tmp/claude-0/r46/汉柏的孩子_v3_发送版.mp4` (27,059,457 B = 27.1 MB / 25.8 MiB, 1.38 Mbps total, so under the 28 MB rule).

What I checked:
- All 313 half-second frames in `review/qa/frames/cut_v3/`, as 20 contact sheets.
- Extra full-res frames, crops and 4 fps strips under `/tmp/claude-0/gate4/`:
  - the kneeling cook (81–84 s)
  - the peak and its exit (118.5–124 s)
  - the visitors' lanes (124–137 s)
  - the 唐槐 (89 s)
  - the transitions at 2.6, 77, 93, 110.6 and 13.3–13.8 s
- A 50 ms audio envelope over 104–144 s, and the frame difference through the 108 s stop.

I read: rubric, all owner-notes rows, brief, lines.json, gate 3 r1/r2, logic r1–r3, REVIEW_v2, crew_log.

**Scores** (rubric 1–5): script **4** · visual **4** · info **4** · edit **4** · motion **3** · sound **3** · overall **4**. The owner can post this as it is; my notes are polish he might mention, not reasons to send it back.

## Verdict

**APPROVE.** I found nothing in v3 that the owner would reject on a phone.
- The one BLOCKING item from REVIEW_v2 is fixed: the 1:48 dead stop now plays as a pause before the hit.
- The two SHOULDs that mattered most are fixed: the peak framing and the end gap.
- Everything left is small, and none of it reads at phone size. Do the polish list below only if the morning schedule allows one more render. I would not hold delivery for it.

## Fixed since REVIEW_v2 / gate 3 r2 (checked on v3; don't re-raise)

| Item | v3 evidence |
|---|---|
| REVIEW #1 (BLOCKING), 1:48 silence over a frozen picture | The music is still digital silence from 108.25 to 109.20 (0.95 s, ≤ 1 s, so row 50 is met). The picture keeps moving now: frame diff runs 8.3 → 1.7 as the camera push eases in, cones fall from the living crown, a kneeling collector steadies the basket and a glow gathers in it (f 108.6). The re-entry at 109.245 hits the cut to 2024 (diff 12.0) and the six lights launch. It now plays as the pause before the hit (row 112), and no longer looks like the video lagging (row 91). |
| REVIEW #2, 2.2 s near-silence before the end card | The ring-out runs from 138.35 (about −28 → −48 dB). 「它真是汉武帝种的吗？」 starts typing at 139.0, so the eye has text to follow while the music fades. The music comes back at 140.59. |
| REVIEW #3 / gate 3 B2(b), 你 cropped at the peak | The sky tree now stands on the mound with both trunks and the whole crown in frame (y ≈ 70–390). The two lines sit lower (y 400–610) over the mound face, and 守他 in gold is crisp (f 119.5). |
| REVIEW #6 / logic r3 #1, legs on heads (visitors) | The photographers have moved forward (feet at y ≈ 985) and walkers' feet are at y ≈ 780. Across the 4 fps strip over 124–137 s, no walker lands on a head or a phone. |
| REVIEW #8 / P13, 「你一直在。」 on the trunk tip | The line has moved up to y ≈ 200–290 and clears the crown and the tip (f 135.0). |
| Gate 3 B1, frame 0 | 「假如说，」 is on frame 0 over the tight two-trunk shot, and the counter reads 2100多. |
| Gate 3 B3, 民国 look | Peaked caps with a band, belts, a 3-rifle tripod by fire 1, and no queues (f 82.0). |
| Logic r3 #5–#8 | The painting is a linked inset off the table sheet. The market and soldiers fade into the smoke together. The seed collector is in. Visitors stand further back. |
| Title on the crash | The cold-open text clears by 13.55 and the plaque is fully in at about 13.62. The year counter rewinds 2026 → 前110 under it. |
| Peak on the drop | 「两千多年后，」 and the hard cut land at 118.31–118.33. |

## Notes (all polish, none blocking)

| # | Sev | Time | What's wrong | Buildable fix | Route | Owner row |
|---|---|---|---|---|---|---|
| 1 | polish (top) | 2:03.0–2:03.97 | **The peak's exit is a plain double exposure.** The mound, the six seedlings and the sky tree cross-dissolve into the courtyard over about 0.8 s. At 123.4 both scenes are on screen at about 50 % (`/tmp/claude-0/gate4/peakout.png`). From about 123.5 the peak line still sits over the courtyard. It is smooth and short, but it is the one transition out of the film's biggest image, and it is the pattern of row 86 (scene A still fading once B is up). | Keep the peak picture untouched until 123.6. Fade the two peak lines out over 123.6–123.95. Then **hard cut on 123.97** to the courtyard (the 124.0 frame as now; 「如今」 types from 124.0). The better, costlier version: the six seedlings' glows lift off and fly east (right) out of frame over 123.4–123.97, then cut. Either way, nothing from the mound is visible once the courtyard is. Only about 1 s of frames needs a re-render. | animator, editor | 86 |
| 2 | polish | 1:21–1:24 | **The kneeling cook's hand still isn't on the stick.** This was logic r2 #2, r3 #3 and REVIEW #4, and the crew log says it was applied, but v3 still shows it: the open near hand hovers above the knee, and the stick comes out of the thigh into the fire with no fist on it (`/tmp/claude-0/gate4/kneel2.png`, `kneelmo.png`). At phone size it reads as a soldier warming his hands, which is a valid action, so it is not blocking. | Cheapest fix: **delete the stick**. The standing stirrer already says 做饭, and the warming hands then read cleanly. If the stick stays, use ikArm from the near shoulder to the stick's upper end with 10–15 px of stick past the fist, and drop the open palm. Re-run pose_check. | animator | 74, 77 |
| 3 | polish | 1:27.2–1:31 | **The 唐槐's trunk is still see-through.** The hall roof's slats show through the trunk and branches (`/tmp/claude-0/gate4/tanghuai.png`). The smoke covers most of it at phone size. | Draw the trunk and branches at full opacity (#6B5A4A) behind the wall line. Only the leaf crown fades. Put the smoke as a layer **over** the tree, not into its alpha. | animator | 85 (fade from inside, not see-through), gate 3 B4 |
| 4 | polish | 2:07–2:16 | **The far-right wall lane passes just over the right stele.** At 129.0 and 132.3 a walker's feet (y ≈ 775) touch the stele top (y ≈ 785, x ≈ 1770–1800), so she reads as standing on it. This is logic r3 #2 in a milder form: it is now feet, not heads. Each time it lasts under 0.5 s. | End the wall lane at x ≤ 1690, or start walkers there after they have passed behind the tree. Alternatively, raise the lane so feet are at y ≤ 745 (≥ 40 px above the stele top). | animator | 43 (no 穿模) |
| 5 | polish | 1:36.5–1:39 | **「西干 · 死了」 sits on the carved stele's arch.** The label runs y 500–580 and the stele top is at about 490 (f 97.5). The leader to the trunk is good. | Raise the label about 90 px (top at y ≈ 400), so it sits over the red wall between the pavilion posts. | animator | 99/121 (labels clear of props) |
| 6 | polish | 0:41.3–0:43.9 | **The six-seal row first comes in small.** Names are about 22 px and years about 16 px (f 42.5). They grow to about 40 px only from 0:44. | Bring the row in at its 0:44 size (or grow it within 0.3 s). Names ≥ 40 px, years ≥ 32 px. | animator | 69, 76 |
| 7 | polish | 1:42.8–1:43.4 | **「11.5米」 is clipped at the right edge** while the camera eases out (sheet 13, 103.0). It is fully in from about 103.5. | Anchor the label in screen space: x ≤ 1840 for its right edge for the whole E5 window, or let it fade in only once the move settles (103.5). | animator | 69 |
| 8 | polish | 1:50.6–1:51.0 | **The courtyard dissolves to an empty plain** while the six lights are already off-frame right (f 111.0). For half a second there is just sand. | Keep the six lights in frame through the dissolve. They should cross the frame left to right as the plain comes in, not arrive from the right edge a beat later. | animator | 86 |

Not raised: I checked these and they are acceptable or out of scope.
- The 1762 group now fades in (0.3 s) instead of walking in (logic r3 #4 accepted that option).
- 。 centring: 「谁是主，谁是客？」 measures 957 / 960.
- Tortoise bases.
- The poem margin.

**Risk for the producer (not a note):** the bed is the ep42 plan-A cut of bgm2 plus a 2-bar intro loop. The owner asked for the cut at the start of this session ("Cut it with the scripts in episodes/42-yiyi/music/", per the ep47 log), so the cut itself is covered. The intro loop is our own addition. REVIEW_v2 measured its join as clean, and owner rows 51/56/64 make any audible splice a reject. If he hears one in the first 5 s, that is where it came from.

## Don't change (it works)
- **The device:** the camera stays at the tree while 2,100 years pass behind it, with the 「相传 · 你 N 岁」 counter honest throughout. It shows 「?」 at the undated fire and at 水经注, and 「—」 at 秦始皇.
- **Frame 0 and the cold open:** the tight dead-plus-living trunks, the fast fates, and the payoff of the bark strip lighting up at 0:11.
- **The title plaque** slamming on the 13.588 crash, with the year rewind underneath it.
- **The record sequence:** the slip table with the empty 「种树 · 无」 slip, then the 水经注 tablet writing itself with 蓋 circled, then 「盖 = 大概」, then 「你的出生，是个"大概"」.
- **The six-seal counter** with the empty 7th seal, and the seasons time-lapse (snow at 0:57).
- **Qianlong:** the painting, the pavilion stele, and the 「石碑里的你 → 真的你」 sight-line into 「谁是主，谁是客？」.
- **The 民国 → 今天 cut** at 93.3: 2037 → 2135, and the west trunk turns grey.
- **The measurements:** the 32 cm band and the 11.5 m bar.
- **The 1:48 pause** with the glow gathering in the basket, then the six lights leaving on the re-entry.
- **The peak:** the sky tree over six young cypresses on 茂陵, with rays and 守他 in gold, on the drop.
- **The ending:** visitors with phones under 「来了，又走了」, 「你一直在。」 on the night fall, the question typed in during the ring-out, and the Juno end card (J, gold title, question, follow pill, sources, no 出品).

## Summary for the owner

《汉柏的孩子，去守汉武帝》 (2:36) is the 2,100-year life of the 汉柏 cypress at 岱庙, told in the second person: 「假如说，你是棵2100多岁的柏树」. The camera never leaves the tree. Emperors, fires, Qianlong, 民国 soldiers and today's tourists all come and go behind it, while a 「相传 · 你 N 岁」 counter keeps the legend honest. The strongest moments are:
- the opening, which ends on 「今天，你只靠一条树皮活着」 as the 32 cm bark strip lights up, with the title plaque slamming in on the music's first crash;
- the 原来如此 turn, where 《汉书》 records all eight of Han Wudi's visits but not a word about planting a tree, and 《水经注》's 「盖汉武所植也」 turns out to mean 「大概」, so 「你的出生，是个"大概"」;
- Qianlong carving the tree into a stele beside it and asking 「谁是主，谁是客？」;
- a held pause on the seeds, and then the drop: in 2024 six of its seedlings travel to 茂陵, and 「两千多年后，轮到你的孩子守他了」.

It ends on tourists with phones, 「你一直在」, and the comment question 「它真是汉武帝种的吗？你信吗？」.
