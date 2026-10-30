勾践 now stands in the empty lattice to the left of the advancing 越 ranks in G7 (81.388–87.049). He draws the sword in one motion that lands on the DA(37) downbeat (84.219, frame 2527) and holds it raised while the palace goes under at 86.484. Every frame I compared outside G7 is pixel-identical to v3, including both hand-off frames.

**The figure**
- A one-tone faceless silhouette in the same style and rim light as the other figures, in a long robe and a king's flat-board cap with bead strings. It's the same kind of cap he wears on his mat in G5 and that 夫差 drops in G7.
- He is about 1.2× the front-rank soldiers. The top of his cap is well below the ridge line (1.07 vs 1.30 scene units), and the raised sword tip reaches about 1.27.
- G7's glow and its ~20 % lattice layer now reach 2.0 cm further left, so he stands in the light with the lattice over him. The right-hand edge of the glow and every other scene are unchanged.

**The motion**
- The draw takes 1.1 s: pull along the scabbard, sweep up and over, stop upright at 72°.
- It arrives on frame 2527 (74° at frame 2526, 71.6° at 2527, settles to 72° by 2540), with a short glint on the blade at that frame.
- He then holds still and fades out with the scene as before.
- 夫差's fallen cap and dropped sword are untouched (no rope, no blade), and nothing enters the subtitle area.

**The sword**
- It is built from the shared design-C spec (`swordspec53x`), not drawn freehand: blade outline, V guard, dish pommel, grip and two hoops, in design-C colours. The hilt is near-black, the blade light with one thin gold crease.
- **Owner call:** I enlarged the hilt (about 1.7× in length and width, the guard's V point 2.2× deeper). At true size the V and the pommel dish were 2–8 px and didn't read in renders. Now the dish hangs visibly below his fist in the held pose. Say if the owner would rather keep true proportions.

**Checks** (all renders stayed in /tmp)
- I looked at stills across G7 at full size and zoomed, and at a contact sheet of every second frame through the draw.
- Old v3 vs new stills: 51.9, 52.0, 60.0, 75.0, 80.5 and 92.7 differ by exactly 0. 92.6 differs on a few pixels (mean 0.0003), which is rendering noise.
- Smoothness, half-res video 80.5–89.6: the new version never changes more between consecutive frames than v3 did by over 0.6 grey levels (worst +0.13). The existing 3–6 steps in this stretch come from the v3 camera move and are the same in both versions.
- The type check shows no errors in my two files; the errors it reports are in other files.

Nothing outside my files needed to change.

**Files**
- New: `episodes/37-qiqing/remotion/src/qq53/king53g5.tsx` (the figure, the sword and the draw timing)
- Changed: `episodes/37-qiqing/remotion/src/qq53/shadow53g.tsx` (places him in G7 and widens G7's glow)
- Self-check: `tasks/ep53-v31-g/out/selfcheck.md`
