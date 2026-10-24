# Gate 2a notes: 假如你是清明上河图, looks A/B/C, r2. Verdict: APPROVE

**The sheet can go to the owner once two quick fixes are done** (R1: the B table leg; R2: the C hat brim). The producer checks those two crops; no r3 is needed. All blocking items from r1 are fixed (A1, B1, C1, C2), and every cold-read complaint that was fixable in a still has been addressed.

**Ranking:** 1 · A, 2 · B, 3 · C. A and B swap places against r1, because of the cold read (reasons below).

**Inputs read:**
- the r2 frames and sheet, and style/looks.md (r2);
- coldread_gate2a.json, which was run on the **r1** frames;
- facts.md rows C5, C6, C9, C11, C15–C32, O5, O8, L1, P2, P3, P7.

**Checks run:**
- phone test at 480 px (`/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/phone480_r2.png`);
- detail crops (`…/scratchpad/r2_*.png`);
- pixel measurements quoted below.

## Scores, r2 vs r1 (gate-2a areas; edit and motion judged from the written plans)

| Look | visual | info | edit (plan) | motion (plan) | What changed |
|---|---|---|---|---|---|
| A | 3 → **4** | 3 → **4** | 3 | 3 | **Better.** The hand lies on the silk, the head is bowed to it, and the 虹桥 reads on both scrolls. The key frame has figures at 54 % of frame height and a 436 px scroll that reads as a painting on a phone. The ripple light is fixed. Stamp lines 1–2 read on a phone; line 3 (34 px) is borderline. |
| B | hook 4 · key 2 → **4** | 3 → **4** | 5 | 4 | **Better.** The figures are opaque, have no eyes or mouths, have shoes and shadows, and stand in front of the table. The haze band clears the stamp and corner mark, the colophon is gone, the seals are down to 3, and the black bar is now a lacquer table. **Left over:** the table leg floats (R1), and two full-strength seals still pull the eye before the figures (R3). |
| C | 3 | 2 → **3** | 2 → **3** | 3 → **4** | **Better.** You are in frame (warm silk with the grey copy laid over half). The lid, its bar and the lantern roll with the box. The lining is a tone-on-tone 云纹, and a 10-move list now exists. **Left over:** the brim still has beak points (R2), and the red box still covers about 40 % of the frame. |

## r1 notes: status

| r1 note | Status | Evidence |
|---|---|---|
| **S1** stamp sizes | ✓ | Line 1 is 56 px, line 2 is 40 px (`裱画匠以假换真（杨准记）`, 12 字), line 3 is 34 px on held beats, and the dimensions line is gone. |
| **S2** hair | ✓ | Plain cloth cap, with hats drawn as separate shapes. Leftover: small detached rim slivers at the C craftsman's forehead (R5). |
| **S3** looks log | ✓ | The producer added the ep41/42 row ("should not be a third silhouette-on-dusk film in a row unless the owner picks it"). A's sheet caption says 与近两期同属剪影系. |
| **S4** cold read | ✓ (on r1 frames) | See R9. |
| **A1** hand (blocking) | ✓ | Shoulder at the top of the torso, elbow on the tabletop, forearm along it, hand flat on the real silk. |
| **A2** handover size | ✓ | Figures are 520 px tall; the scroll is 436 px wide. |
| **A3** reflection | ✓ | Soft ripple dashes. |
| **B1** figures (blocking) | ✓, except R1 | The figures are fixed, but the table leg ends at **y 907**, while the wall/floor junction is at **y 924**, the screen base at 933 and the figures' feet at 971. It floats about 20 px. |
| **B2** text over linework | ✓ | The haze band covers the top; the stamp and corner mark are clean. |
| **B3** handover set + seal run | ✓ | Written into looks.md; real seal names only where facts C21/C23 list them. |
| **B4** scan, colophon, seals | ✓ / carry | **Scan:** none (L1 forbids reuse), so the city stays code-drawn. **Colophon:** removed from the key. **Carry to 2b if B is picked:** the 虹桥 must follow the real timber woven-arch bridge, not a riveted arch. |
| **B5** separate sheet | ✓ | Askew sheet with a wedge of table showing under its edge. |
| **B6** 20th-century proof vignette | open | Required before 2b if B is picked. |
| **C1** you in frame | ✓ | |
| **C2** lid roll (blocking) | ✓ | |
| **C3** move list | ✓ | 10 moves, each tied to a facts row. It sensibly avoids the unverified 1127 looting (C5) and gives no place for 1945 (C28). |
| **C4** teaser still | open | Required before 2b if C is picked. |

The placeholder stamps trace to verified rows: 元 · 宫中 and 至正年间 (C9), 杨准记 (C9: his account, adopted by the Palace Museum, so attribution replaces 相传), and 1351 (C11).

## Ranking (final for the owner sheet)

1. **A 汴河暮影.**
   - **For:** the cold reader's pick for 3 minutes: "every frame gives me one clear thing… it feels like a film", and its key frame is the one they'd screenshot. All r1 fixes landed. It is the most legible and cheapest to build well.
   - **Against:** it is the third silhouette-on-dusk film after ep41/42 and the most iwanau-like. The sheet says so, and the owner weighs it.
   - **Option:** if he likes A but wants more of the painting, A can cut to B-style full-frame painting close-ups (B's colour/grey split is the cold reader's best real-vs-fake image) through its own push into the glowing silk. No new look is needed.
2. **B 长卷.**
   - **For:** the most original and subject-native. Seals and colophons are the real record of every owner, frame 0 is the painting itself, and transitions come from the scroll.
   - **Against:** the cold reader felt it drift toward "museum explainer / textbook", and "some friends would swipe at 'school painting'". That is an intrinsic risk, not a fixable detail, and the r2 de-cluttering only softens it. It would also be the first light ground (no data; the owner said "stick to dark toned" at ep36), and it is the heaviest build.
3. **C 开盒的人.**
   - **For:** now coherent (you're in frame, the lid behaves, 10 distinct moves) and still the boldest.
   - **Against:** the cold reader would not watch it for 3 minutes ("claustrophobic, nearly horror", red walls over about 40 % of the frame), and every story beat still has to be read through a lid.

**Why A and B swapped since r1.** In r1 I ranked B first on its subject-native device and built-in transitions. I had to guess whether a viewer would take it as a story or as a lesson. The cold read is direct evidence on that guess, and it came back leaning "textbook". The owner's standing complaints (PPT, slideshow, "museum" boredom) are the same failure, so A moves up. The cold read was taken on r1 frames, but B's key was de-cluttered in r2, so the gap may be narrower now. The order holds.

## Corner-mark ruling

**Accepted for ep43.** The change is 30 px bold, 0.06 em tracking, 92 % opacity, a red ◆, and the same text (no 出品).

It is an engine-layer readability fix with evidence:
- the cold reader could not read the old 21 px / 0.3 em mark in any frame;
- the new one reads in all six at 480 px (`…/scratchpad/corner_phone.png`).

It is still separate from the stamp: the mark's ink spans y 44–73, the stamp's text starts at y 101 and its red rule at y 92. Keep that gap of at least 19 px to the rule and at least 28 px to line 1. The ◆ takes each look's own red: #E2493B in A and C, #B5362A in B.

**Series-wide: the owner decides.** It is his brand mark on every future film, and the only time he has ruled on branding he removed it ("Remove my logo", 七宗罪 covers). At this touchpoint the producer asks him one yes/no question with a before/after crop of the top-right corner.
- **If yes:** it becomes the engine default.
- **If no:** ep43 reverts to the old mark. That is a one-line engine change and does not affect the look pick.

## Notes

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| R1 | Med (fix before sending) | B key, right table leg | **The leg floats.** It ends at y 907; the floor begins at y 924 (screen base 933, figures' feet 971). Extend it to the floor at the table's depth, y ≈ 945–950, with a small contact shadow. | art-director | ep41 "nothing floats"; figure rules R3 |
| R2 | Med (fix before sending) | C key, the 权贵's hat | **The brim still reads as a beak** (the cold reader said "beak or horn… plague doctor"). It ends in tapering points: one at x ≈ 1160, y ≈ 350 aimed at his face, one at x ≈ 1380–1480, y ≈ 235–275. A round brim seen from below is a flattened ellipse with round ends. Draw it that way. This also clears the point that now sits behind stamp line 3 ("杨准：1351年"). | art-director | ep41 "No prop the viewer can't recognise in a second"; cold read lookC_key |
| R3 | Low (optional before sending; required in the storyboard if B) | B key, seals | **Two full-strength seals** (x ≈ 1260–1365 and 1455–1585) are the most saturated things in the frame. They pull the eye before the figures (cold read: "the figures are the LAST thing I look at"). On a handover beat only the newest seal is at full strength; older ones are at ≤ 40 %. | art-director | ep15 "make the elements weaker… centre of attention somewhere else" |
| R4 | Low (optional) | B key, counter | **The floor line at y 933 runs along the top of "240".** Start the floor lines right of the counter (x ≥ 520). | art-director | rubric 2 "text over text" |
| R5 | Low (optional) | C hook and C key, craftsman | **A detached rim sliver** sits at the forehead (hook x ≈ 775–800, y ≈ 462–482; key x ≈ 495–520, y ≈ 535–550). Remove it. | art-director | ep9 "every prop renders whole" |
| R6 | Gate 1 | Counter number | **约240 was chosen to dodge 二百五**, but the number belongs to the script. On O8 (anchor c. 1100), the swap in 至正 before 杨准's 1351 purchase gives 241–251, and 1352 gives 252. So 约240 sits at the edge of the honest range. The screenwriter sets each counter value from O8 and decides, on purpose, whether to avoid or use the 二百五 joke the cold reader predicts. The frames are placeholders, so this does not block the sheet. | screenwriter, researcher | "never state a result the source doesn't" (ep13) |
| R7 | Storyboard, if A | 虹桥 handover set | **"A secret swap in the middle of a public bridge feels staged"** (cold read). Let the stage's mood follow the deal. Secret sales: night, lanterns out, figures close, the scroll's glow the only light. Official transfers: dusk or day, with people on the bank. | art-director | "every scene adds something" |
| R8 | Storyboard, if A | Hand-overs | **Write a move list like C's**: at least 8 distinct, motivated hand-overs; looks.md names only 3. Include the full-frame painting insert entered through the glowing silk. | art-director | ep28 "transitions too repetitive"; ep41 "be creative with 运镜，转场" |
| R9 | Process | Owner sheet | **Show the owner the cold read with its date.** Show its 5-second reads and preference (A), with one line per look on what r2 fixed. A: empty bottom, gaze at the window, Qing-looking hair. B: black bar, clutter, dimensions, watermark. C: missing scroll, red diamonds. Don't run another cold read; the owner's pick takes 1 minute. | producer | SKILL gate 2a |
| R10 | Process | Corner mark | Ask the owner the one yes/no question above, with the before/after crop. | producer | "Remove my logo" (七宗罪 covers) |

## What must not change (it works)

**Shared.**
- Top-left serif subtitle, fixed position, shown fully revealed in stills.
- Stamp at 56 / 40 / 34 px in plain language: `年代 · 地点` / `事件（谁记）` / `谁是记录者`. Attribution instead of a source code. The dimensions line stays out.
- Counter: red era chip plus "你 约N 岁". The cold reader called it "the best device across all looks… it makes the painting a character".
- Ink variants on silk.
- Code-drawn, no scan (L1).
- Every historical detail on screen traces to facts.md.

**A.**
- The bowed craftsman with his hand on the glowing silk.
- Both scrolls showing the 虹桥, so "same painting, one dead" reads instantly.
- Key-frame scale: figures at 54 %, a 436 px scroll.
- The round window and White Dagoba; the Yuan brim; lanterns and the lowering mast.
- The teal→amber sky; mean luma 86 / 100.

**B.**
- The haze band under all furniture.
- The separate, askew grey sheet over a wedge of lacquer table.
- Opaque 界画 figures with no facial features, on a floor line with shadows.
- The reusable 界画 room and the seal run.
- The muted mineral palette.

**C.**
- You in frame as the light source; the swap as grey covering light.
- Box, lid, lantern and silk rolling as one.
- The tone-on-tone 云纹 lining.
- Profiles only.
- The 10-move list and its fact-careful choices (no looting shown in 1127, no place given in 1945).
