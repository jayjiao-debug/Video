// hud/ms/fit_E.ts: SCENE E's FITS of skin A's items (hud/ms/fit.ts says what a fit may set). Owned by the scene E
// builder (with shots/segE.ts and shots/segE_parts.ts); hud/ms/when.ts lays it over the items at import.
// Scene E's items: lunch (E02: the game bar 午饭进度 over the plate's far rim; its 2 % tick stays on fork clink 2).
// THE v5 REBUILD (15 Nov), refitted to the one take (shots/segE.ts):
//   lunch   REFITTED, no longer provisional; frames unchanged (E02 end + 0.45 s .. E03 start - 2 frames, f2662-2710; the
//           tick stays absolute on clink 2, f2686). Over the whole hold (f2662-2694) the lens stands still on the
//           TWO-THING (B2): the plate low left, its far rim at (332, 995), his face high right (head centre about
//           (690, 645), r 261, chin y 873-880). fx.tsx lunchAnchor puts the bar's bottom middle 12 px above the far rim,
//           clamped into this box (kept tight round the bar so hudRectsAt gives the checkers its true place, inside the
//           plan's zone): x 120-524 pins the bar's middle at x 322 (the plate's middle is x 310), so the bar
//           lies at x 133-511, y 915-983 (about 378 x 68): below his chin and his head's circle (58 px clear at the
//           bar's top-right corner), above the subtitle band (no caption runs f2662-2717), inside x 120-900 and
//           y 900-1290, and its right end 65 px clear of his gown's left edge at the bar's height (x 576-582,
//           rows y 940-980; director r1 note 8 asks 12). His right arm is a thin line that crosses the bar's right part
//           on the clink-2 stab (f2682-2686, the fork's tines show below it on the chop) and his elbow passes under its
//           right end between the bites (about x 475-511, f2670-2678): accepted, the arm moves through, the gown never.
//           From f2694 (M4, the step in) the plate grows and rises; the bar's bottom stays clamped at y 971 under it on
//           the cloth until it goes (its out starts f2705), over the plate's near rim for at most 20 px on its last
//           two frames.
// 9:16 (15 Nov, the frame stage): the box below is the 9:15 one + 60 in y (the lens kept its width of view: a 9:15
// point (x, y) is (x, y + 60) now), pulled inside the 9:16 rules (hud/style.ts FRAME: x 110-970 from y 340, x <= 890
// below y 1000, nothing below 1490) where it crossed them; FRAME.md (newton_work/film/f916) has the allowed areas.
// 9:16 scene refit (15 Nov): checked, the box stands. The picture of the hold f2662-2694 did not move, so the bar lies at
// x 133-511, y 975-1043 (9:15 + 60): inside x 110-890 where it reaches below y 1000, under his chin (about y 935-940),
// no subtitle f2662-2717; faces and check.sh clean (newton_work/film/f916/E/NOTES.md).
import type { MsFit } from "./fit";

export const FIT_E: MsFit = {
  lunch: {
    box: [{ x0: 120, y0: 960, x1: 524, y1: 1060 }],   // 9:15 + 60
    provisional: false,
  },
};
