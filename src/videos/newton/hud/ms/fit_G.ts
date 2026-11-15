// hud/ms/fit_G.ts: SCENE G's FITS of skin A's items (hud/ms/fit.ts says what a fit may set). Owned by the scene G
// builder (with shots/segG.ts and shots/segG_parts.ts); hud/ms/when.ts lays it over the items at import.
// Scene G's items: meter1 (G02: the compass closes the circle, 0 becomes 1/1, 证毕 under it).
// THE v5 REBUILD (15 Nov), refitted to the one take (shots/segG.ts):
//   meter1  REFITTED to THE LOW-LEFT PLACE, no longer provisional; frames unchanged (G02 end + 0.05 s .. G02 end +
//           1.33 s - 1, f5019-5057: gone the frame before the sack's thump, f5058, where the pan to the door starts).
//           Over the whole hold the lens stands dead still on HOLD (segG.ts: kneeling, her eye 1.15 m, level with his
//           seated eyes). His wig's right locks reach x 940 and come down to y 900 at this size, so the slot (x 740-1026,
//           y 146-416) can not be kept clear of his hair. meter.tsx draws the whole piece low left (LOW_LEFT: x 80,
//           y 1078, at 0.8) on each frame his head box (centre +- r + 8) meets the slot (752-1026, 155-300); segG.ts
//           HOLD keeps that true on every frame of the hold (head ball f5019-5057: top y 249-274, right edge x 769-811,
//           so the box's top is 34 px or more above the slot's bottom and its right edge 25 px or more past the slot's
//           left), so the 1/1 never jumps between the places. The piece lies at x 72-306, y 1070-1290 (the slip
//           x 80-296, y 1078-1188, 证毕 and its swash under it): over the fireplace, left of his right hand, below his chin
//           (y 853-874), clear of the subtitle band and the app's buttons.
// 9:16 (15 Nov, the frame stage): the box below is the 9:15 one + 60 in y (the lens kept its width of view: a 9:15
// point (x, y) is (x, y + 60) now), pulled inside the 9:16 rules (hud/style.ts FRAME: x 110-970 from y 340, x <= 890
// below y 1000, nothing below 1490) where it crossed them; FRAME.md (newton_work/film/f916) has the allowed areas.
// Scene G check on 9:16 (15 Nov): the head box meets the new slot (696-970, 349-494) on every hold frame, so the piece is
// always low left; masked still f5040: the slip about 30 px left of his right arm, 证毕 clear of his hand, nothing under
// his chin; skin check 0 findings; no subtitle shows over the hold.
import type { MsFit } from "./fit";

export const FIT_G: MsFit = {
  meter1: {
    box: [{ x0: 110, y0: 1100, x1: 380, y1: 1320 }],   // 9:16: meter.tsx LOW_LEFT (118, 1108): the piece x 110-344, y 1100-1320, above G02's subtitle block (y 1325)
    provisional: false,
  },
};
