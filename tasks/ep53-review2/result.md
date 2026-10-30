**Verdict: fix first.** The full review is in `tasks/ep53-review2/out/review.md`. It has the ranked fix list (20 rows), the table of the 20 round-1 items, one script change and six visual upgrades. I rendered all 3409 frames at ¼ scale and diffed them frame to frame, plus about 175 full-size stills. Nothing was written into the repo besides `review.md`.

**Where round 1 stands**
- 9 FIXED: #1, #2, #5, #6, #9, #13, #14, #15, #17 and #20.
- 8 PARTLY: #3, #4, #7, #8, #10, #12, #16, #19.
- 2 NOT FIXED: #11 (roof still vanishes) and #18 (stamp second line still about 28 px).
- That is 19 of the 20 accounted for; I did not log #13's regression as a separate item, it is new row 4 below.
- The 95.53 s cut is now a smooth exit from the ground, and the 107.97 s pop is down to under 1 luma level per frame.

**The three things that hurt most**
1. **The one take still breaks in four places**, each a single-frame jump:
   - 38.433 s: the near-black lid frame cuts to the lit chamber (`scene53c.tsx`).
   - 57.033 s: the whole paper stack appears at full opacity in one frame (`paper53c.tsx`, `light ? setOn : 0`).
   - 61.600 s: the blade swaps lattice style and a dark block appears at its left end (`paper53c.tsx`, `macro53c.tsx`).
   - 74.433 s: the blur snaps sharp in the middle of the hush (`handoff53.tsx`).
2. **The macro blade at 62–64.6 s looks like a torn ribbon.** Its left end is a hard vertical edge, and its right end frays into 3–4 strips (`macro53c.tsx`, `blade53c.tsx`). The roof at 36.2–36.35 s also still vanishes in four frames instead of being lifted (`scene53c.tsx`).
3. **The proof shots are still tiny.**
   - At 83–91 s the sword is 4–19 % of the frame width.
   - At 95.5–99 s the sword in the case is small, next to an 80 px grey placeholder square and a stray unlabelled scale bar (`scene53d.tsx`).
   - The paper cut at 59.3 s is understated (a gap under 25 px).

**Other findings**
- There is no strobing. I checked 3.0, 61.0, 64.5 and 72.0 s one frame apart at full size.
- No fact on screen falls outside the ✓ rows in `facts.md`.
- The only script change worth making is the hook: 「这把剑埋两千多年，出土还是[亮]的。」. It is 16 字 with the same timing, and it stops the opening line contradicting 「如今没那么亮了」 at 95.5 s.

**Blocked:** nothing.
