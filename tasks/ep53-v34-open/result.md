The new opening is in and renders. It starts on the 1977 paper test, cuts on f13, and the same sword goes home to its case in one continuous move. From 7.0 s (f210) on the picture is pixel-identical to today's v3.3. One check is not met: the "≤ 3 mean grey difference per frame" rule (details below).

**Files**
- `episodes/37-qiqing/remotion/src/qq53/open53o4.tsx` (new): the opening camera, the sword's move, the paper stack, the set.
- `episodes/37-qiqing/remotion/src/qq53/take53.tsx`: `TakeA` and `camAt` before 7.0 s now use the new opening. The kitchen and cleaver are gone. All exports other files import are kept.
- Self-check: `tasks/ep53-v34-open/out/selfcheck.md`. Renders are only under `/tmp/r`; nothing rendered is in the repo.

**How the sword moves:** it is always the shared `Sword3D` at its rest pose, drawn through the camera re-expressed in the sword's own frame. No sword, lattice or marks are drawn in my code, and I did not import `paper53c`. At the cut it is edge-down, tilted about 1.2° so the tapered edge is level over the stack, and turned 28° so the stack's cut end faces the lens.

**The beats**
- **Frame 0:** a three-quarter view of the bright blade over a neat cream stack in a warm pool, guard and blue glass in frame. It is already pushing in at 1.7 px/frame. At 480×270 it reads as a sword over paper.
- **f13 (0.443 s):** the stroke runs f7→f13 with a short draw toward the hilt, deepest point on f13. The top 20 sheets are cut and the bottom 10 stay whole. The halves part in a V, lift a little and settle; seven strips flutter down. A glint runs along the edge just before it enters the paper, and a thin flash shows at the slit on f13–f15.
- **f47 (1.575 s):** the sword holds still 30 mm above the cut stack.
- **f81 (2.707 s):** one soft highlight slides guard→tip on the pale diamonds, with no stripe and no sparkle.
- **2.6–7.0 s:** the sword lifts, rolls level and settles on the two rests at 6.45 s at zero speed, never touching a rest or the deck. The paper sinks and fades by 4.9 s, and the case comes out of the dark at 4.7–6.3 s. The camera meets today's camera at 7.0 s with matching speed, then today's hood, hall and title slam on f285 run unchanged.

**Checks**
- **From 7.0 s on:** compared with an unchanged checkout at f210, 211, 240, 282, 285, 300 and 360, the max pixel difference is 0.
- **Camera speed:** the transition peaks at 25.7 px/frame, only on the sword's tip as it leaves the left edge at f122. Everything else in frame stays ≤ 25. The falling stack stays ≤ 21.8; the stroke itself is the planned hit.
- **Single-frame pops:** only f167 and f285. f167 is the overlay's H1→H2 subtitle change, and v3.3 has the same spike. f285 is the title slam.
- **Join frames:** f209–f212 differ by 3.28 / 3.51 / 3.42 / 3.44, against v3.3's 3.47 / 3.56 / 3.42 / 3.43.
- **Not met, "≤ 3 per frame":**
  - The stroke frames f8–f12 measure 3.1–5.1, because the cut needs several frames of motion.
  - The transition measures 5–9 per frame because the bright lattice fills much of the frame while moving near 25 px/frame. Today's v3.3 is at the same level over the same frames (mean 7.4 vs my 7.7). I couldn't get under 3 without breaking the 25 px rule or the join.
- I looked at every still and contact sheet: the full brief list including 6.967 / 7.000 / 7.033, plus close-ups of the stroke, the lobe and the settled cut.

**Outside my files**
- `take53d3.tsx` (the ending) shows `<TakeA t={0} />` under the end card and uses `camAt(0)` as its home camera. Both now give the paper-test frame instead of the kitchen; the brief says another engineer is replacing that.
- `COVER53`, `COVERPIC53`, `kfH53`, `EP53` and `demo53k` also call `TakeA` / `camAt`, so anything they sample before 7 s now shows the new opening.
