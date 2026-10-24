# Gate 3 notes: 假如你是清明上河图, scenes 27–29, r2 — verdict: APPROVE (three small fixes to fold into the render, no re-review)

Scores: visual 4 (r1: 3) · info 4 (3) · edit 4 (3) · motion 4 (4).

The owner would post it. The climax now reads as rich colour under lamplight, and the homecoming reads as a careful carry.

**Stills:** g3r3 114.70–133.40 and the debug frame t0999.38, all GPU renders. The contact check PASSes on 289 frames. No re-render.

## r1 notes: status

| # | Status | Evidence |
|---|---|---|
| B1 relay read | **Resolved** | 131.2–133.4: the two staff are in different leg phases, the strides are short, and the roll is cradled at the chest under the near arm. It reads as carrying something precious. |
| B2 near-white | **Resolved** | Strip at 124.30: p50 180, p95 218, linework clear. Relief: means 141 / 143 / 141 (128.30 / 129.30 / 129.90), p95 ≤ 206, with a warm pool on the bridge and dark edges. There is no step at b56 (141 at 128.30). |
| B3 bridge match | **Accepted** | t0999.38: the real deck curve sits on the painted arch at the apex. It is about 60 px high at the left shoulder and about 110 px at the right one, where the ramps descend. Within a 0.18-s dissolve, after a tone pre-match (130.30–130.45 mean 141, sat 24), it reads as one arch. Don't spend more on it. |
| B4 text over text | **Resolved for the same row**; a residue remains → C1 | |
| B5 day contrast | **Resolved** | R1 7.5 : 1, red 2.3 : 1, stamp 7.9 : 1, counter 7.7–13 : 1, tally 6.1 : 1. |
| B6 battered roll | **Resolved** | 114.76: matte and stained on the pile, glow faint. |
| B7 passage | **Partly done** | Glow now drawn after the haze. The iris and the motive are still owed to scene 30. |
| B8 ”。 gap | **Resolved** | |
| B9 dive seam | **Resolved** | 124.72 / 124.80: mean 121 / 122. |

## Rulings

- **Day crest mean 107 against the 110–150 day target.** Accepted. The 0.55 top band and the 0.8 lower band I asked for in B5 account for it, and the sky and water still read as day.
- **130.55 to ≈ 130.9, mean 85–91.** Accepted: this is the match camera settling.

## Remaining (fold into the render; send me nothing unless a fix changes the picture)

| # | Sev | Where | Note | Route to |
|---|---|---|---|---|
| C1 | Low-Med | engine (hud.ts): 114.70–114.86, and 128.24–128.44 | **Outgoing lines still linger for 0.2 s in other cases.**<br>(a) 114.76 reads 「几年后，/ 混乱中，你下落不明。」: V3 is still fading in row 1 while Y1 types in row 0. For 6 frames the screen shows a wrong sentence.<br>(b) At 128.30, Y3/Y4 fade at **2.4 : 1** over the bright relief, because the lamplight band has already gone at b56.<br>Rule: every line on screen (any row) is fully gone when the next line starts or when the furniture hides. Otherwise keep the 0.2-s tail. | animator |
| C2 | Low | 29, 131.2–133.4 | **The roll only ties the horizon as the brightest area** (21-px smoothed: 184 vs. 184), because the cradle hides half of it.<br>Raise the halo by ≈ 15 % or more, or lower the horizon water by ≈ 10 luma, so the roll leads. Still 5 tests this. | animator |
| C3 | Low | 29, 130.55–131.0 | **The near-bank fill has hard vertical inner edges** at x ≈ 155 and 1465, running to the frame bottom. For about 0.5 s they read as two black slabs.<br>Slope or feather those inner edges into an embankment, or let the roofline vary down to the water. | animator |

B7 still has to be met when scene 30 lands:
- the passage warm (≥ +30 luma over the wall) with its far opening visible;
- the iris opening from your glow or from that lit opening, with you in frame on the way in.

## What must not change

- r1's list.
- B2's lamplit pool on the relief, and the strip cap.
- B1's carry: quarter-cycle phase, 0.7 stride, the cradle.
- The tone pre-match and the camera roll in the bridge match.
- B5's day bands, B6's matte roll, B9's matched grade.
