# ep53 越王勾践剑 / 真的没锈吗？ — round-2 verification review (113.633 s, 3409 f)

Method: 139 full-size stills (every 1.0 s from 0.2 plus the 32 listed times) on contact sheets, **all 3409 frames rendered at 1/4 scale** and diffed frame-to-frame (subtitle, stamp, seal and depth-tag zones masked), ~36 full-size frames for every suspected jump. Renders are in /tmp/rv (not in the repo). Frame = sec × 30. Owner files are in `episodes/37-qiqing/remotion/src/qq53/`.

## Verdict: FIX FIRST

Round 1's two worst problems are gone (the 95.53 s cut is now a smooth exit from the ground; the 107.97 s luminance pop is down to ≤ 1 level per frame), and the sword, hands, rust blooms, paper cut and hall shots are clearly better. But the one take still breaks in **four places** (38.43, 57.03, 61.58, 74.43 s), the roof at 36.3 s still vanishes, and the macro blade at 62–64.5 s looks torn. Facts on screen are clean (details at the end).

**The three things that hurt most**
1. **Four remaining cuts/pops in the one-take**: 38.433 (lid-dark frame → lit chamber), 57.033 (the paper stack appears in one frame), 61.600 (blade swaps style in one frame), 74.433 (the hush sharpens in one frame, right where it must be still). Each is one frame with a mean frame difference of 6–15 (neighbours ≈ 1).
2. **The macro blade (61.6–64.6 s) is drawn as a torn ribbon**: a hard vertical left end with a dark ribbed strip, and a right end that frays into 3–4 tongues. It is also a different lattice from the paper leg just before it.
3. **The "proof" shots are still tiny** (83–91 s coffin: sword 4–19 % of frame width; 95.5–96 s case: sword about 15–20 % of width beside a grey placeholder square). The sword is not the hero in the film's argument beat.

No strobing: I checked 61.0, 64.5, 72.0 and 3.0 s at full size one frame apart; the high frame differences there (up to 19 at 1/4 scale) are slow slides of fine lattice, not flicker.

## Ranked fix list

| # | Sev | Time (s) | Owner | What is wrong (seen) | Fix |
|---|---|---|---|---|---|
| 1 | BLOCKER | 61.567 → 61.600 (f1847→1848) | `paper53c.tsx` (END_CAM, BladeFlat), `macro53c.tsx` (Leg12 first frames), `take53c.tsx` | Hard cut between legs 11 and 12. f1847: wide pale lattice (tan diamonds, cream lower half) with lit inscription, stamp present. f1848: a different blade: dark chain-link lattice, new bright triangle glyph marks, an opaque dark block at the left end (x 0–40 px at full size). Mean diff 15.4, luma −8. The stamp and stack vanish at the same frame. | Draw leg 12's first 1.5 s with the **same `BladeFlat` / `MarkSet`** (same lattice pitch, colours, inscription band) that Paper53 uses at END_CAM, and only then cross-fade to the macro texture over ≥ 0.6 s while the camera zooms in (53.9 px/cm → macro scale). Keep the stamp alive until 62.0 and fade it out over 0.3 s. Acceptance: diff 61.50–61.70 ≤ 3 per frame. |
| 2 | BLOCKER | 57.033 (f1710→1711) | `paper53c.tsx` (`light ? setOn : 0`) | The whole 30-sheet stack (a cream block ≈ 45 % of the frame width) appears at full opacity in one frame when `light` flips at `frameOf(T_LIGHT)` = 57.048. Mean diff 31, luma +22. The beam fades in over 0.25 s, the stack does not. | Make the stack opacity `sstep(seg(t, 56.75, 57.35))`, and let it rise from below the frame edge by ~60 px with the camera swing. Keep `T_LIGHT` for the beam and the lamp glint only. Acceptance: diff 56.9–57.5 ≤ 3 per frame. |
| 3 | BLOCKER | 38.400 → 38.433 (f1152→1153) | `scene53c.tsx` (`Chamber53`, lid pass) | At f1152 the picture is a near-black brown field (the lid fills the frame; only two trouser legs at the edges, luma ≈ 20). At f1153 the lit coffin interior with the sheathed sword appears. Mean diff 11.5, luma −9.9 (it reads as a cut, and 38.2–38.4 is a dark hole). | Do not let the lid fill the frame: keep ≥ 25 % of the frame lit (rim light on the lid edge, 1 px #C9A06A) and make the camera pass the lid edge over ≥ 0.5 s, with the interior fading up behind the edge from 38.0. Or end the lid pass by 38.2 and start the interior move there. Acceptance: diff 38.0–38.8 ≤ 3, luma change ≤ 2 per frame. |
| 4 | MAJOR | 74.400 → 74.433 (f2232→2233) | `handoff53.tsx` (`HandoffMacro`), `take53c.tsx` | The hush is blurred (soft depth-of-field, the cell edges are smeared) up to f2232. At f2233 the whole lattice snaps sharp and the centre ridge line moves ~6 px. Mean diff 6.0 between frames that are 0.0 on either side (f2229–2232 and f2234–2254). It is a visible "focus snap" at the very moment the picture must be still, 0.75 s before the drop. | Ease the blur and the camera to zero by 74.1 and then hold identical frames until 75.162; or hold the blurred state to 75.162 and drop the blur on the beat (75.162). Acceptance: diff = 0.0 for every frame from 74.2 to 75.15 except the intended bloom start on 75.162. |
| 5 | MAJOR | 36.20 → 36.35 (f1086→1090) | `scene53c.tsx` (`Chamber53`) | r1 #11 not fixed. At 36.2 the planked 椁 roof with its central strip fills the frame; by f1090 (36.33) the roof is gone and the empty chamber with the outer lid ① is there (diff 8.8 at f1090, 5–8 for the next 6 frames). The roof is never lifted; it dissolves. | Lift two roof planks off-frame (rising 120 px and sliding 400 px, 36.1–36.6) with the camera still moving; fade the men in from the dark only after 36.7. |
| 6 | MAJOR | 61.9 → 64.6 | `macro53c.tsx` (blade strip), `blade53c.tsx` | The macro blade is a finite ribbon. At 62.0–63.2 its **left end is a hard vertical edge** (x ≈ 60 px at full size) with a dark ribbed strip to its left. At 62.4, 63.5 and 64.5 the **right end frays into 3–4 pointed strips** (the row end-caps), which looks like a torn ribbon, not a sword. | Extend the lattice geometry ≥ 2 blade lengths beyond both frame edges (clamp, do not cap) so no end is visible; if an end must show, draw the real guard (blue glass, gold) there, not the strip caps. |
| 7 | MAJOR | 95.54 → 99.0 | `scene53d.tsx` (`CaseW`, `Ground`) | r1 #8 partly fixed: the cut is gone (good), but at 95.5–95.8 the case is a dark plinth with the sword a thin strip about 15–20 % of the frame width, and an 80 × 80 px **grey square** (placeholder look) on the plinth front. 96–99 s: the case is still small, with a stray unlabelled scale bar + dot at lower left (97–101). | Remove the grey square (or make it a lit rounded panel #E6F4F8 at 25 %, no text). Reach glass level by 95.6 (rise ~1 s earlier) so the sword is ≥ 35 % of the width by 95.8. Remove the scale bar, or label it 「10厘米」. |
| 8 | MAJOR | 83.0 → 91.0 | `world53d.tsx` (Chamber, OTHERS), `take53d.tsx` | r1 #7 partly fixed. The coffin now fills 55 % of the frame, but the sword is a 150 px strip at 86–88 s and a 80 px hairline at 92 s; the "other swords" are ~100–200 px thin leaf shapes, half hidden by the coffin at 86.5–88. The proof beat ("同一座墓里的其他剑，也几乎没锈") has no readable picture. The sword inside is drawn pale-tan with no black lacquer. | Camera 35 % closer between 84.2 and 90.4. Pull the other swords out of the coffin's shadow and draw them at 50–60 cm relative to the coffin with a 2 px rim #F4D088; keep the 勾践 sword the brightest. At 83–84 draw the sheath black (#1A0C08) with the guard outside it, as at 39–43. |
| 9 | MAJOR | 59.15 → 60.0 | `paper53c.tsx` (cut) | r1 #4 partly fixed. The blade now passes through and the top 20 sheets lean away, but at phone size the "cut" is a thin gap (< 25 px) between two slabs whose top faces are plain tan; the 40 px sparkle at 59.31 is the only event. The line "一下划破20多张" is understated. | Increase the lean/sag ×2.5 (`2.0 * e * fi` → 5.0, `1.5` → 3.5), draw the sheet edges on the offcut (1 px #6A5535 every sheet), enlarge the glint to r = 70 for 0.2 s, hold the picture 0.5 s longer before the lift (60.35 → 60.7). |
| 10 | MINOR | 80.40 → 81.95 | `macro53d.tsx` (Match 4), `take53d.tsx` | r1 #3 partly fixed: the dark-red disc now starts inside the third bloom's find-ring (80.6) and has a soft edge, but it still grows to fill the frame (81.0–81.6) with a ~1000× scale change, i.e. it is a wipe. | Accept as a transition, but lengthen the growth to 1.4 s with an ease-in (start slower at 80.6), keep the ring visible until the disc passes it, and add a thin cream rim (#F4D088, 3 px) to the disc edge so it reads as a lens/hole. |
| 11 | MINOR | 63.833 (f1914→1915) | `macro53c.tsx` (tag) | Tag 「原因之一：料好 / 铜·锡约18–20%·铅≈0」 appears at full opacity in one frame (diff 15.9). | Fade the tag and its scrim in over 0.3 s from 63.6. |
| 12 | MINOR | 92.83 (f2785) and 93.37 (f2801) | `take53d.tsx` / `world53d.tsx` (strata) | Layer panels appear in 1–2 frames: the pale 白膏泥 slab at 92.83 and the blue-grey 青灰泥 band at 93.37 (luma +4.3 / +4.4 in one frame). | Fade each layer in over 0.3 s (opacity `sstep`), starting 0.3 s earlier. |
| 13 | MINOR | 82.0 → 91.0 | `master53.tsx` (depth tag) | The depth tag disappears at 82 s while the camera is on the chamber floor, then reappears at 91.0 as 「深 8.2 米」. The floor is 10.8 m. | Keep 「深 10.8 米」 from 83.0 to 91.0, then count down from 91.0. |
| 14 | MINOR | 20.1 → 20.9 | `take53.tsx`, `master53.tsx` | The gold pommel disc (very bright) sits under the second subtitle row 「它表面镀了铬，所以不锈」; white on gold is low contrast (the disc edge crosses 「所以不锈」). | Add a subtitle scrim (see Visual upgrade 1), or keep the disc ≥ 80 px below row 2 until 20.5. |
| 15 | MINOR | whole film (stamp) | `master53.tsx` (`stampAt`) | r1 #18 not fixed: the second stamp line is still ≈ 28 px (≈ 8 px on a phone). | 38 px, 2 px dark text shadow. |
| 16 | MINOR | 37.4 → 38.1 | `master53.tsx`, `scene53c.tsx` | The stamp (x 1440–1740, y 40–100) overlaps the right excavator's cap at 37.8. | Move the men 120 px left, or fade the stamp to 30 % while a figure is under it. |
| 17 | MINOR | 38.9 → 41.0 | `scene53c.tsx` (chamber plan) | The skeleton outline is a faint dashed line (≈ 25 % opacity); the sword is drawn above it with no floor contact or shadow, so 「墓主人左边」 cannot be read from the picture, and the sheath hovers until the hands arrive at 41.2. | Outline 3 px #E8C9A0 at 55 % with a 「墓主人」 caption (28 px) at the skull circle; draw the sword on the same plane (contact shadow 20 px, #000 at 35 %) on the left side of the outline as the viewer sees it. |
| 18 | MINOR | 5.5 → 11.7 | `master53.tsx` (stamp text) | The stamp's first line ends with a lone 「越」 (「春秋末年 · 越」), which reads as truncated. | 「春秋末年 · 越国」. |
| 19 | MINOR | 109.2 → 113.1 | `end53d.tsx` | The sources line is ≈ 14 px high; unreadable on a phone. | 22 px, #CFC3AE at 80 %. |
| 20 | MINOR | 62–82 vs rest | `macro53c.tsx`, `macro53d.tsx`, `blade53c.tsx` | r1 #12 partly fixed. Legs 1–3, 44–61 and 102–105 now share a tan diamond lattice, but 62–82 (macro) uses a wider dark-centred diamond with white outlined cells, and 102–105 has thin dark lines with big pale cells. | One `LATTICE` constant (pitch, line width, fill pair) used by `Blade3D`, `BladeFlat`, the macro and `CaseW`. |

Things I looked for and did **not** find: strobing; blank canvas at the join to leg 2 (20.8) or leg 3 (33.27) — both are smooth; text outside the safe area (subtitle x ≥ 150, labels end ≤ 1800 at 54.8; seal 134 px from the right); the 「镀铬？」 tag struck through or mocked (it is dimmed beside 「热镀锡 · 2025研究」, not struck); anything outside the ✓ rows. At 103.0–103.3 the mirror is ≈ 90 px from the end of the subtitle: close, not touching.

## r1 items

| # | Status | Evidence now |
|---|---|---|
| 1 | FIXED | 94.8–95.6 is a continuous exit through the ground into the museum; no diff spike near f2866 (≤ 3.6). Leftovers are in rows 7 and 12. |
| 2 | FIXED | f3237 and f3240 change luma by +0.97 / +0.88 (was 12.7); fine. |
| 3 | PARTLY | The disc is born inside the third bloom's ring (80.6) with a soft edge, but still grows into a full-frame wipe 81.0–81.6 (row 10). |
| 4 | PARTLY | Blade now passes the stack and 20 top sheets lean away; labels sit beside the stack; stack dimmed to tan. The cut is small and the stack pops in at 57.03 (rows 2, 9). |
| 5 | FIXED | Blooms are ~135 × 75 px green ovals with a 300 px dashed find-ring on 75.2–81 (were 60 px olive dots). |
| 6 | FIXED | Sword is 36–50 % of the frame width at 12.2–16.2 with a warm rim; visitors as silhouettes at the rope. |
| 7 | PARTLY | Coffin fills 55 % of the frame, sword still 4–19 % wide (row 8). |
| 8 | PARTLY | No cut any more; sword still small, grey square still there (row 7). |
| 9 | FIXED | Hands are brown tapered sleeves with a wrist, holding sheath and pommel at 41.2–45; gone by 46. (Fists are still blocky; not worth more time.) |
| 10 | PARTLY | 56.15–56.5 is now continuous (same blade); but 57.03 (stack pop) and 61.6 (blade swap, hard cut) remain (rows 1, 2). |
| 11 | NOT FIXED | The roof vanishes in four frames at 36.3 (row 5). |
| 12 | PARTLY | Common tan lattice in most legs; macro 62–82 and 102–105 differ (row 20). |
| 13 | FIXED | Motion eases to zero by ~74.0 and the frames are identical to 75.15 (diff 0.0). Regression: the focus snap at 74.433 (row 4). |
| 14 | FIXED | 29–33.3: mottled brown walls, then grey, then pale clay, with the stamp text. |
| 15 | FIXED | Stamp reads 「1965 → 今 / 据后德俊 · 渐失光泽」. |
| 16 | PARTLY | Tags ①② no longer float; but 38.2–38.43 is still a near-black hole ending in a cut (row 3). |
| 17 | FIXED | Tag has a feathered scrim, row 2 about 44 px. |
| 18 | NOT FIXED | Second line still ≈ 28 px (row 15). |
| 19 | PARTLY | Cleaver now has a handle and a tapered back, and the sword ghost sits in a framed window square (108.2). Still a plain grey slab; acceptable. |
| 20 | FIXED | Mirror has a stand, caption 「剑首 · 11道同心圆」 from 12.2, the 「镀铬？」 tag fades before the ring covers it. |

## Script (26 lines)

Only one change is clearly worth making; the timing stays the same:

| Line (start s) | Old → New | Reason |
|---|---|---|
| 0.000 | 「这把剑埋了两千多年，还是[亮]的。」 → 「这把剑埋两千多年，出土还是[亮]的。」 (16 字) | The hook says the sword is bright now; the film's own turn at 95.54 says 「如今没那么亮了」. 「出土还是亮的」 is the true claim (facts E8) and sets up the payoff. Keep 「[亮]」 underlined. |

The payoff lands: 「它不是不会锈，是那座墓，替它挡了两千多年」 then 「你第一次见到它，是在哪？」. Lines 95.5–102.3 repeat "it rusted / dulled / can't be stopped"; with row 7's close case shot the repetition is carried by pictures, so I do not propose a text change. Facts check: every number and stamp on screen matches a ✓ row (A1–A9, B1/B3, C4/C5/C7, E1/E5/E8/E10/E11, F1/F2); the counter 20 → 30 → 40多封信 matches 「40多封信」; depth reaches 10.8 at 37.8; the 「1985 → 1967 → 1965」 and 「2008/2021」 year ticks at 22–24 and 21.3–21.6 are decoration only.

## Visual upgrades (not defects)

1. **Subtitle scrim everywhere**: a left-to-right gradient (rgba 18,9,6, 45 % → 0 over x 0–1100, y 80–320). It protects row 2 over the bright pommel (20 s), the lit paper (57–61 s) and the pale lattice (62–70 s).
2. **Hero light on the sword in every wide shot** (83–95.8, 96–101): 2 px #FFF3CF rim and a 30 px soft bloom so the sword is the brightest pixel group even when small.
3. **Paper cut as the film's action shot** (59.15–60.7): 0.5× speed through the cut, bigger lean, a cold flash #F2F6F8 for 3 frames at 59.312.
4. **Rust-bloom pulse**: a 1.2 s slow scale pulse (100 → 112 %) on each new bloom at 75.2, 76.2, 77.0 with a faint olive trail between bloom 1 and 2 on the beat.
5. **Stamp legibility**: second line 38 px, dark shadow; tag second rows ≥ 44 px.
6. **One lacquer-brown family for people**: give the 41–45 s hands a sleeve cuff in the colour of the lid-lifters' clothes at 37 s, with a #4A2E14 rim light, so people read as one cast.
