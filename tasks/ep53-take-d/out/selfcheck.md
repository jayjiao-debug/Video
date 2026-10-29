# ep53 TakeD (legs 13–18, 75.162 → 113.633) — self-check

Files (in `episodes/37-qiqing/remotion/src/qq53/`): `take53d.tsx` (router, TakeD), `macro53d.tsx` (leg 13), `world53d.tsx` (tomb world, layers, air, labels), `scene53d.tsx` (camera poses, ground→museum floor, case, glass pass), `end53d.tsx` (kitchen + end card). No shared file edited. Only stills were rendered (to /tmp/r53, outside the repo); the full film was NOT rendered as video. About 120 stills across the range rendered without errors; tsc shows no errors in these files.

## Status: all six legs + end card built
- **13 T1/T2 (75.162–81.954):** first frame = `HandoffMacro` with bloom 1 + veil (frame 2255); blooms 2, 3 switch on at their frames; KF11's pose held about 2 s, then eased back; blooms shrink to specks beside a thin scale bar drawn on the blade (no number, to stay on ✓ facts). Match 4: bloom 1's find-ring widens (ellipse to round) into a portal showing the sheath's mouth and blade; it covers the frame by 81.954.
- **14 T3/E1 (81.954–90.445):** pull-out from the sheath mouth to over the inner coffin; the sword slides back into its sheath, settling on 84.219; three other swords light at 86.483 / 87.615 / 88.747 (the 勾践 sword stays brightest); camera rises and arcs to the cut-away front.
- **15 L1 (90.445–95.54):** layers close on the beats, each complete on its frame: 剑鞘 91.011, 内棺 91.577, 外棺 92.143, 木椁 92.709, 白膏泥 93.275 (fill rises), 夯土 93.841; a label pops with each; KF12's camera at 93.5; air dots bounce off the white clay, two leak to the blade and leave green specks; depth tag = camera depth (8.0 m at 90.445, 6.9 at 93.5, 0.0 at 95.54).
- **16 R2/R3 (95.54–102.332):** the top of the fill becomes the museum floor as the camera passes z = 0 (Match 5, a colour morph of one plane); the case stands on the floor directly above the tomb; gauge slips, blade dulls a shade, one faint bloom (R3); in through the front glass (dark posts + streak) to 8 cm over the blade.
- **17 P1/AIR (102.332–109.125):** back out through the glass; frame 0's kitchen (CAM0: window, rack, your cleaver) fades up as a screen-blended reflection (0.9 at 106.861) and becomes real; the case's sword is carried by a similarity transform onto the kitchen sword's position and fades into the faint window glow (one sword at a time); the glow fades last.
- **18 END (109.125–113.633):** J stamp present from f3274 exactly (absent on f3273), small damped jolt; title +0.35, question +0.7, pill +1.2, sources +1.3 (SOURCES53); dim to 0.72 from 109.025; 0.5 s fade to black 113.1–113.6.

## Checks done
- Camera: probe anchors deeper than 0.6 m move at most 24.8 px/frame over 81.954–108 (scratch script). Near-field sweeps are faster during the push through the glass and the 5 cm approach (101.4–103.9), a deliberate zoom-through.
- Seams viewed: 75.13 vs 75.17 (drop), 80.6 / 81.2 (portal), 94.2–95.6 (surface), 106–109.3 (kitchen, card).
- Labels ≥ 120 px from the sides; subtitle corner has a local dark scrim; the hollow seal is drawn by the master until 109.125.

## Changes vs storyboard / weak spots
- L1 depth tag starts at 8.0 m (camera depth), not 10.8, because the camera is already above the coffin. TakeD draws it (the master's DepthLayer stops at 43.463).
- The tomb is one cut-away world (everything with y < 0 removed); from above it reads as a dark diorama with a straight cut edge.
- The tomb sword is mirrored relative to the case sword; never both on screen.
- The sword is small (~100 px) in L1 at KF12's pose; kept to match KF12.
- E1's other swords are schematic blades; no extra rewind streak in T3 beyond the slide-back and fast pull-out.
- Not done: full video render, strobe/flicker check on motion, video-reviewer pass.
