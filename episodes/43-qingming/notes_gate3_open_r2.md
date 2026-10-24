# Gate 3 notes: 假如你是清明上河图, scenes 01–02 (opening take + title on drop 1), r2 — verdict: REVISE (small; r3 is a measurement check, not a full review)

Scores (rubric 1–5, only the areas this gate covers): script n/a · **visual 4** (r1 3) · **info 4** (r1 3) · **edit 4** (=) · **motion 4** (=) · sound n/a
Overall 4: the owner would post this with one note. The likeliest notes are a render fault on frame 0's edge, and a far-bank shape next to the walkers that reads as a fountain.

**Better than r1, area by area:**
- **Visual.** The hook now reads on frame 0. The wind-up's only light is you, and the moon is gone.
- **Info.** The subtitle, the stamp and the mark are all legible at 480 px. In r1, none of the three passed.
- **Edit and motion.** Unchanged and still right. The glow-locked cut now locks onto an actual glow.

**What I read:** the Director section, the rubric, all owner-notes rows, brief.md, storyboard r3 (Look, Engine, scenes 01–02, transition 1), my r1 notes, s_open.ts, core.ts (the `corners` mask and modes 7/13), crest.ts, draw.ts `willow`, and hud.ts.
**Stills:** I opened all 9 stills in g3o2 and sheet480.jpg, plus 200–400 % crops. I did not re-render. contact_0-9.txt: **PASS, 135 frames**. It now lists `carryB · roll in hand` and `carryB · roll under arm`, worst 0.0.

## r1 notes: status

| r1 # | Status | Evidence (luma: Rec.709 on sRGB, 0–255; contrast: WCAG glyph vs. ring 6–16 px) |
|---|---|---|
| 1 Frame-0 falloff | **Resolved** (side effects → note A1) | Ivory 九百年 / 人人都想 / 你。 at **9.4–10.6 : 1** (r1: 2.6–3.1). Stamp **10 : 1**. Corner mark **4.1 : 1** (r1: 1.37). Frame mean **131** (target 120–160). Red 留住 is 2.8–3.0 : 1 by luma and reads by hue at 480. Centre 190 against ≥ 200: accepted, because the bridge row y 520 sits at 229. |
| 2 Your glow in the wind-up | **Resolved** | At 8.90 the brightest 61-px area is at **(1711, 576)**, on the lock point (1710.5, 579.5): 168 against the next-brightest 100. The sunset is gone (sky beside the walkers: 23). Means **63.8 / 57.7** (aim ≈ 60, floor 45). |
| 3 Carry held | **Resolved** | Drawn body → roll → near arm. At 300 %: the upper arm crosses the roll's middle, the back end shows behind the elbow, and the hand is under the front end. The checker covers it (worst 0.0). |
| 4 Willow | **Not resolved** → A2 | |
| 5 Title ink | **Partial; accepted** (ruling below) | Ink median **74**, p5 65 (r1: 88; target ≤ 45). Ink : paper ≈ 7 : 1, crisp at 100 % and at 480. |
| 6 Moon | **Resolved** | No disc and no halo. The title has one light. |
| 7 Defocus specks | **Resolved** | At 400 % the stars are soft round discs. |
| 8 9.37 kick | **Resolved, but too short** → A3 (low) | The kick starts at b3.5 = 9.3743, so the 9.37 still is 4 ms before it. From the code at 30 fps: the 9.40 frame has the left knob 8.8 px out and the right one 5.9 px out, then 3 px, then gone by 9.47. That is one frame, because τ = 0.05 s (I asked for ≈ 0.15 s). |
| 9 Mast vs. cart | **Resolved** | Mast apex (630, 268) vs. cart (790, 290) at f0; (650, 345) vs. (960, 320) at 1.45. |

## Notes

| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| A1 | **Med** (frame 0) | 01, 0.00 → 3.15 | **Frame 0's edges: the new lamplight mask covers the scroll mounts, and the bottom mount turns two-tone.** The `corners` mask in core.ts is a near-opaque mix (`col·0.03 + warm dark`). Its lower band fades out from x 1150 to x 1650.<br>Result:<br>• the top mount is now brown (RGB 60/50/41);<br>• the bottom mount is brown for x < 1150 and blue (82/104/125) for x > 1300.<br>At full size and at 480 px, the half-blue strip in the bottom-right corner looks like a render fault on the most important frame. It also removes r1's don't-change item "the blue mount bands top and bottom say *scroll*".<br>Do:<br>(a) Give each mount one colour along its whole length. Preferably keep both mounts out of the mask (blue top and bottom, as in r1), dimmed evenly if needed.<br>(b) In scene 01, turn the lower band off, since there is no chip or tally in 01, or run it the full width.<br>(c) Second priority, scene 01 only: end the top band higher, full to y ≈ 240 and clear by y ≈ 420. On the silk only H1's single line (y 132–215) and the stamp (y 92–215) need it. Today's falloff (full to 305, clear at 520) dims the bridge-top crowd and the moving cart (y 230–340; row y 300 = 63 luma). Leave the band as it is on 2-line inserts: Y3/Y4 at 124.8–128.24 need line 2 at y 223–300.<br>Pass on 0.00 / 1.45 / 3.00:<br>• ivory words still ≥ 4.5 : 1, mark visible at 480;<br>• frame mean 120–160;<br>• each mount strip within ±10 luma along x, and the same hue top and bottom;<br>• the cart on the bridge top visible at 480. | animator | 18 (renders whole, check frame edges), 47 / 9 (frame 0 is the hook), 78 (feathered scrim, not a block) |
| A2 | **Med** | 01, 3.71 → 8.96 (and every crest visit) | **The far-bank willow still doesn't read as a tree; now it reads as a fountain.** The redraw in draw.ts is right: the producer's sheet `wil.png` shows trunk, limbs and curtains. In the scene, though, the far-bank fog turns it into pale tan strands that are **lighter than the sky**:<br>• 8.90: willow p95 101 vs. sky 78;<br>• 3.71: 154 vs. 140.<br>The trunk disappears. At 480 px, at the darkest beat, it is the only distinct far-bank shape, about 300 px from the walkers, and it reads as a fountain or a firework.<br>Do: draw far-bank willows **darker than the sky behind them**. Fog them toward the sky colour at their height, not toward the horizon haze, at about sky − 15 luma or darker, and keep the trunk visible. If that can't read at 480, move this willow off the walkers' path or drop far-bank willows from the crest.<br>Pass: on the 480-px crops of 3.71 and 8.90 you see a tree, or nothing.<br>Shared crest.ts, so T2, W2, F1 and E4 inherit the fix. | animator | 125 (no prop the viewer can't recognise), 121 |
| A3 | Low | 02, 9.37 | **The b3.5 kick lasts one frame.** It peaks between frames (u2 = 0), and τ = 0.05 s leaves −9 px, −3 px, 0. At 480 px that is a ~2-px twitch, not a beat.<br>Do: τ ≈ 0.1 s (`exp(-u2 / 0.1)`), same amplitude, so it spans 3–4 frames.<br>No flash. Don't change the main slam. | animator | 84, 26 / 49 |

**Rulings (no action):**
- **Title ink at 74 (r1 target ≤ 45).** Accepted. The ink is off the glow layer now. What is left is the band's own bloom spilling over the letters. At 7 : 1 against the paper, the title reads crisp and dark at 100 % and at 480. Don't darken the band or add a bloom mask for this.
- **b1 dusk at 109 (board 75–100).** The r1 ruling stands.
- **Title mean at 93.5 (board cap ≈ 80).** The r1 ruling stands: no flash, surround 57, and the band is about a quarter of the frame.
- **The vertical falloff instead of the radial one I asked for.** Accepted. It is feathered over about 215 px, tinted with the scene's own warm dark and has no box edge (row 78). A1 only fixes its edges and its height in 01.

**Re-submit for r3** (a measurement check):
- **Stills:** 0.00, 1.45, 3.71 and 8.90.
- **Numbers:** for 0.00 and 1.45, the mount strip luma by x (top and bottom), the per-word contrast on 0.00 and 1.45, and the willow vs. sky luma on 3.71 and 8.90.
- **Checker:** `contact_check 0 9 15` (unchanged).

Row 75 still applies: anything sent to the owner goes as the corrected still of exactly that change.

## What must not change (it works)

Everything on r1's list still holds except the mounts, which A1 restores. In addition:
- **Frame 0's text and mean.** H1, the stamp and the mark sit on full warm dark, with every ivory word ≥ 9 : 1. The frame mean is ≈ 131, and the bridge and boat are lit through the middle.
- **The wind-up's light design:**
  - the world dims through its tint (to ≈ 0.32 by 8.78, plus the 20 % breath);
  - your roll, its halo (+3 % swell from 8.78 to 8.96), its rims and the streak are left out of the dim;
  - the sunglow fades with the lanterns;
  - the brightest area at the cut is you, on the lock point.
- **The carry:** shared `drawCarriedRoll`, drawn body → roll → near arm, with the `roll in hand` and `roll under arm` contacts. T2, F1 and E4 reuse it.
- **The title:** the ink layer off the glow, band emissive at 0.2, no moon or night halo, the round Gaussian defocus, and the slam timing (cut 8.96, hit 9.05, 12 px overshoot).
- **The cart's start (k 0.56)**, clear of the mast tip.
