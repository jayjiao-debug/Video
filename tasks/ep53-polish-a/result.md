I fixed all four weak spots in `take53.tsx` and `tomb53.tsx`, and nothing after 31 s changed. The film still renders: a still every second from 0.5 to 32.5 s gave no errors. I committed nothing.

**Identity check (31 / 32 / 33.2 s).** 33.2 s is identical to before, and so are the 9.5 s title frame and the 3.0 s frame. 31.0 s and 32.0 s are identical to the original baseline in my final render. On 31 s and 32 s the Chromium blur raster varies from session to session: the original code alone also renders two slightly different states (≤ 6 levels on a few thousand blob-edge pixels). My renders equal one of those two states exactly.

**What each fix looks like now:**
1. **Museum hall, 10.5–17 s.**
   - **Camera:** the pull-back is closer (peak 2450 mm instead of 3150 mm), so the sword at the widest moment is 349 px long instead of 240 px, and the case is 88 % of frame width.
   - **Light:** the case top, floor and walls are brighter. Visitors are lighter faceless silhouettes at real scale, and the sword stays the brightest object.
   - **Gallery look:** wall label panels, a wall vitrine, skirting and floor tile joints.
   - **Subtitle:** a soft dark patch behind the top-left subtitle.
2. **Rise over the guard, ~4.7–8.5 s.** The lens zooms in, so the guard, blade and blue glass fill the lower two thirds of the frame (guard about 550–600 px wide at 5.6 s, was about 310). A soft sheen slides over the blue glass, and one star glint lands on beat 10 (5.66 s).
3. **5.3–5.6 s near-stop.** Sideways drift, yaw, pitch and zoom now run continuously from 4.2 to 6.6 s. The lowest median on-screen sword-point speed in 4.8–7.0 s went from 1.6 to 5.4 px/frame. The camera is still a pure function of time.
4. **Leg 7 soil stripes.** The mouth's terrace bands are softened, half the wall course lines are gone, most of the speckle blobs are gone, and the colour bands are less contrasty. The depth marks, diggers and snow are untouched. The calming is released back to exactly zero by 31.0 s.

**Weaker than the key frames:**
- The camera peaks at 26 px/frame in the central part of the frame at 5.2 s, about 1 px over your limit. The old camera was 24.7 at about 4 s.
- At 5.2 s the pommel disc touches the full stop of the second subtitle line, but no glyph is crossed.
- The sword is still only 18 % of the frame width at the widest moment. I stopped pulling in, because closer would lose the visitors and the walls.
- The rise lacks KF02's near-corner blur.
- The leg 7 texture fades back in slowly over 29.8–31.0 s.

Everything is in `tasks/ep53-polish-a/out/selfcheck.md`. Before and after renders are under `/tmp/r53/` (not in the repo).
