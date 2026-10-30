**Verdict: fix first.** One fact error is still on screen, and two of the owner's notes aren't met yet. Most of the film is now good, and each of the three main fixes should take under an hour. I didn't edit anything. The full review is in `tasks/ep53-v3-review/out/review.md`.

**What I checked:** 218 stills (one every second, every line start + 0.6 s, every music hit), looked at on contact sheets and zoomed where something looked wrong. I also checked the three frames around each of the six hand-offs, and ran a frame-to-frame jump scan over a quarter-scale render of the whole film. All renders stayed in /tmp; nothing was committed.

**The three worst problems**
1. **BLOCKER: in the second chamber the sword lies on the occupant's right (117.6–126 s).** The head is at screen right and we look down into the coffin, but the sheath is on the far side of the skeleton. In the first chamber (36.7 s) it is correctly on the left. This contradicts the line 「墓主人左边」, the stamp and the tag 「剑在墓主人左侧」. The cause is that the camera in `world53d.tsx` shows a mirror image of the same layout. Fix: un-mirror that camera and turn the occupant, sword and knife end for end. Quick alternative: move the sword to the camera side (`SYA = YC − 0.2`).
2. **MAJOR: the owner's 0:03 note is still open (1.5–5.5 s, `land53.tsx`).** The ridge is still a white hairline, and there is no real highlight on 「[亮]」. Fix: a gold ridge line, plus a soft highlight about 460 × 170 px on the pale diamonds, peaking at 2.707 s.
3. **MAJOR: the "other swords" beat looks cheap and misses its point (122–125.5 s, `world53d.tsx`).** Three flat, glowing swords hover in mid-air. The hero sword is dimmer than they are and half hidden at the bottom edge. Fix: lay them on a visible floor with shadows, and make the hero the brightest thing in frame.

**Other fixes in the list**
- **MAJOR:**
  - The 「②内棺」 tag sits on the J seal (35.6–36.5 s).
  - The lid lifters are drawn as giant side-view legs in a top-down shot (35–36 s).
  - The 勾践 shadow-play is hard to read. The figures are small and the diamond pattern is at full strength over them. G7 (82–87 s) blurs, and the fallen cap reads as an anvil.
  - In the layers sequence there is a black hole-like wedge at 126–127 s, and the white clay floods the frame at 128 s.
  - A star sparkle sits on the sword during 「慢慢变暗」 (131–135 s).
- **MINOR (7 items):**
  - A colour pop on the draw frame (38.967 s).
  - The G8 frame is mostly empty (88–92.7 s).
  - The M1 tag repeats the Cu/Pb tiles.
  - The slice turns the blade into a white flash.
  - The tiny 「剑首 · 11道同心圆」 tag appears at the wrong time.
  - The back of the guard is plain gold at 19.2 s.
  - The stamp blanks out at the start of G2 and G8.

**Hand-offs and jumps:** apart from that colour pop at the draw, there are no camera jumps. The scan found only three single-frame jumps in 4360 frames: the title slam (9.5 s, intended), the draw pop (38.967 s) and the slice flash (95.533 s).

**Earlier reviews:**
- **`factcheck.md`:** every item is fixed. The envoy kneels alone, the end-card sources match the proposed text word for word, the gall sits on a stand, the subtitle says 「怕要」, and 勾践 walks ahead of the horses.
- **`continuity.md`:** most items are fixed:
  - the second-chamber sword and skeleton
  - the 勾践 thread now uses the same lattice and marks as the inscription view
  - one set of tomb sizes, with the 铜削 in both chambers
  - no blue guards on the other swords
  - no rim on the display sword at the end
  - the kitchen framing matches frame 0
  - the left-side tag is added and the seal has its halo

  Still open: the white ridge stripe and the duplicated M1 tag.
