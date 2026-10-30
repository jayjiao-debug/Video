I've built TakeG (51.954–92.709) as one continuous camera move. Both hand-off frames are pixel-identical to v2 `TakeC` at 56.482 (mean difference 0.000), the camera drift peaks at 16.2 px per frame (limit 25), and all eight scenes are in with the fact-check fixes. One check is only partly met: the frame-difference test passes during the glide but not during the drop, the G6 push-in and the return (details below).

**The move:** it starts from exactly the paper test's face-on view and keeps the incoming glide speed (0.83 cm/s). It drops low and tilts toward the tip over 52.1–56.2, then glides slowly toward the tip at 0.48 cm/s (0.2 cm/s on the G5/G6 seat). G6 pushes in on 勾践 at 77.5. From 85.0 the camera rises and slides back, arriving with zero speed on the hand-off view at 92.7. The v2 hand-off picture is a 50/50 blend of the chamber and paper-test renderers, so the chamber half fades out over the first 0.4 s and back in over the last 0.4 s.

**The shadow play:** one scene per line, mirrored in the blade face inside the bright edge strips, with the shared lattice over it at about 30% and the ridge as a thin gold crease.
- **G1:** 会稽山 with the two rings of 戈 closing; the deep break at the end of the line holds still apart from the slow glide.
- **G2:** the envoy kneels alone before 夫差; the bow completes on 59.312 (frame 1779). No 勾践, no wife.
- **G3:** 伍子胥 walks away while the palace sinks into rippling water.
- **G4:** 夫差 rides a chariot with a turning wheel behind two walking horses; 勾践 walks a pace ahead, hands free, not holding the bridle.
- **G5:** the gall is placed on a small stemmed stand beside his mat, above his eye line; he reaches it on 75.159 (frame 2255).
- **G6:** the push-in, with 会稽 and the 戈 faint behind him like a memory.
- **G7:** 越's ranks advance and the palace goes fully under on 86.484 (frame 2595). 夫差 appears only as a fallen cap and a dropped sword: no rope, no blade.
- **G8:** the reflection clears to bright bronze and a soft glint crosses the blade.

**Continuity #2:** the blade and the eight marks use the shared spec renderers (`BladeFlat`, `MarkSet`, `birdScript` at 12.5 mm). Crops of frames 1558–1561 show the marks keep their shape across the cut and only move about 2 px per frame. The reflection's lattice comes from `latCells`/`cellQuad` and lines up cell for cell with the blade's own lattice.

**What is only partly met:** the mean-grey-difference test (≤ 3 per frame) passes during the glide (about 2.6–3.2, mostly 3.0), on the seat (1.3) and at the hand-offs (0.5–1.6). It does not pass during the camera moves the brief asks for:

| Move | Peak difference |
|---|---|
| Drop low (around 54.7) | 5.8 |
| G6 push-in and back out | 4.1 |
| Return to the hand-off view (88–89) | 5.1 |

These moves are smooth, with no single-frame jumps; the high-contrast lattice makes any move score high. For comparison, v2's own paper-test move right after 92.709 scores 7.8–8.6 on the same test. Getting under 3 would mean a much shorter glide or no return.

**Other things to know:**
- Scenes sit only 2–3 cm apart on the blade because the glide is slow, so at each line change the old scene cross-fades out over about 1.6 s inside the reflection; the camera itself never cuts.
- The storyboard's 90° roll at the tip is not built, because the brief asks for the return to the inscription view instead.
- My picture has no tags or text.
- I edited nothing outside my own files and committed nothing; every render stayed under `/tmp`.
- The type checker reports no errors in my files.

Files are in `episodes/37-qiqing/remotion/src/qq53/`:
- `take53g.tsx` (stub body replaced, same export)
- `cam53g.ts` (new; the camera)
- `shadow53g.tsx` (new; the scenes and the reflection)

The self-check with all the measurements is in `tasks/ep53-v3-g/out/selfcheck.md`.
