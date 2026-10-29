**Verdict: fix first.** The full review is in `tasks/ep53-review/out/review.md`. I did not edit the film, and no renders are in the repo (they are in /tmp/rv).

**Method:** I viewed the 140 requested stills on contact sheets, with about 30 full-size zooms. I also rendered 344 half-scale frames by frame number and compared consecutive frames at every leg join, every second, the hush and the dive. Every subtitle, stamp, tag and count I checked agrees with `facts.md`, and 「镀铬？」 is never struck through.

**The three things that hurt most**
1. **The one take is broken.**
   - At 95.533→95.567 s (frames 2866→2867) there is a hard cut, from looking up through the fill to an empty dark museum floor. Cause: the ground-plane flip in `take53d.tsx` / `scene53d.tsx`.
   - At 107.967 s (frame 3240) the whole frame drops in brightness in one frame, mean luma 42→29. Cause: `mixBlendMode` switches from `screen` to `normal` at t=108.0 in `take53d.tsx`.
   - From 80.2 to 81.95 s an opaque dark disc grows over the lattice and wipes to the sheath scene. It does not start from a rust bloom.
   - At 56.15–56.48 s and 61.24–61.58 s there are crossfades, and the blade changes between the two sides.
2. **The payoff pictures are too small or missing.**
   - At 59 s the blade never cuts the paper stack, and the cream stack is the brightest object in frame.
   - The rust blooms at 75–81 s are about 60 px, roughly 12 px on a phone.
   - The sword is tiny or a speck at 11.8–16.3, 83–91 and 95.6–99 s.
3. **The sword is not the same sword in every leg, and the people look cheap.** The blade lattice differs between legs. The excavators' arms at 41–52 s are stiff navy sticks with block fists, off-palette.

**Other items in the fix list (20 rows in all, with file, time and a concrete fix for each)**
- At 36.5–36.75 s the 椁 roof is never lifted, and the men and lid pop in.
- The hush (70.6–75.16 s) is a dead freeze, with zero pixel change for 29 frames.
- The 98–99.5 s stamp reads 「1965 → 2016」.
- Several tag, stamp and shaft-wall issues are minor.

**Script:** I propose three line changes with timing kept, and no fact outside the ✓ rows.
- Line 1: 「这把剑埋两千多年，出土还是[亮]的。」 so the hook matches the later "dulled" line. The 亮 pulse timing on that line needs re-checking.
- Line 3: 「它的主人，是卧薪尝胆的越王勾践。」
- 66.1 s row 2: 「剑身花纹是热镀[锡]，报告没提铬。」 Without this, "热镀锡" can be heard as "so it is plated after all", which contradicts the later 「主要是那座墓」.
- I flagged the repetition across lines 19–23 but proposed no text change there.

`review.md` also has six visual upgrades (not defects), led by a hero rim light on the sword in wide shots.
