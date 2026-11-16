// hud/ms/bannerplace.ts: WHERE HUMPHREY'S BANNER SITS on a frame (EFFECTS_PLAN row 2; director r1 note 6), as plain
// arithmetic (no React), so the banner (banner.tsx) and the checkers' boxes (when.ts banner boxAt, from the probed
// track.ts) come from the same numbers.
//
// THE SIZE: the approved slip at scale 1.0 (looks/frames/A_humphrey.png, skin_a.py humphrey(): the slip 344 x 250 at
// 70, 300 turned -2.5 deg; 汉弗莱 96 px, 今日关键证人 36 px = glyphs 31-34 px tall, the 助手 tag 29 px; the manicule 0.95).
// One size for the whole hold: it never breathes as she steps in on him.
// THE PLACE, from his head on THIS frame (centre, radius: screen.ts msFig, or the probed track):
//   beside  (the approved, the A rebuild's frame: a clear 360 x 270 beside his head): the slip beside his head on the
//           side its box is on, its middle a little above his head's middle; the manicule under its corner, its tip
//           on his CHEEK LINE (the head's outline at 150 deg on his left, 30 deg on his right), pointing at his head
//   below   (today's A04: his face reaches x 336-433 on f340-378, so the approved slip has no room beside his head):
//           the slip rides below the lowest point his head reaches (its box's top), on the door left of him, sliding
//           with him (half his head's sideways move); the manicule on his cheek line as in the approved frame (150 deg
//           on his left; further round toward the slip, it would sit on the jaw corner of his drawn features), pointing
//           at his head, above the slip
//   The mode follows the slip's box (when.ts msItem("banner").box[0]): a box whose top is under his head = below.
// The tip: the hand's origin TIP_OUT (7) px outside his outline: the inked fingertip (1.4 px further in, 12 px off the
// aim line) ends about 6 px outside the outline and its paper backing on the outline's ink, never on his skin (the
// skin ends at 0.92 of the radius).
import type { Rect } from "../../../../kit/overlay/frame";

export type Head = { x: number; y: number; r: number };
/** the approved slip's own coordinates (the banner draws in these, then moves them onto the frame) */
export const SLIP = { X0: 70, Y0: 300, W: 344, H: 250, ROT: -2.5 } as const;
/** the slip's scale (the approved size), the manicule's scale, how far outside his outline the hand's origin sits */
export const BAN = { S: 1, HAND_S: 0.95, TIP_OUT: 7 } as const;
export type BannerPlace = {
  /** the slip's top-left (of the unturned slip) and its scale */ x: number; y: number; s: number;
  /** the manicule's tip and turn (deg) */ tip: { x: number; y: number }; rot: number;
  mode: "beside" | "below";
};

const RAD = Math.PI / 180;
/** the hand's origin outside his outline: TIP_OUT, a few px more while his head is small (his skin then ends only
 *  0.08 r = 13-18 px inside the outline, and the hand keeps its size): up to 6 px more under r 230 */
const tipOut = (r: number) => BAN.TIP_OUT + Math.min(6, Math.max(0, (230 - r) * 0.12));
const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), Math.max(a, b));
/** the slip's half size on the frame: turned, laid a touch large (the lay's 1.07), with its torn edge and shadow */
const HALF = (() => {
  const c = Math.cos(SLIP.ROT * RAD), s = Math.abs(Math.sin(SLIP.ROT * RAD));
  return { x: ((SLIP.W * c + SLIP.H * s) / 2) * 1.07 * BAN.S + 8, y: ((SLIP.H * c + SLIP.W * s) / 2) * 1.07 * BAN.S + 8 };
})();
/** the manicule's own extent in parts, so the boxes turned with it hug it (marks.tsx manicule: the pointing finger
 *  x -52..4, y -22..-6, in four pieces; the fist and the cuff x -150..-46, y -30..30; the paper backing's 16 px stroke
 *  round all of them) */
const HAND_PARTS = [{ x0: -6, x1: 13, y0: -27, y1: -1 }, { x0: -16, x1: -4, y0: -29, y1: 1 }, { x0: -34, x1: -14, y0: -30, y1: 2 }, { x0: -58, x1: -30, y0: -31, y1: 3 }, { x0: -160, x1: -38, y0: -40, y1: 40 }];

/** WHERE THE BANNER SITS on this frame: h = his head (null: the slip at the box's corner, the hand beside it) */
export const bannerPlace = (h: Head | null, SB: Rect): BannerPlace => {
  const s = BAN.S, cw = (SLIP.W * s) / 2, ch = (SLIP.H * s) / 2;
  if (!h) return { x: SB.x0 + HALF.x - cw, y: SB.y0 + HALF.y - ch, s, tip: { x: SB.x0 + 2 * HALF.x + 120, y: SB.y0 + 40 }, rot: -45, mode: "below" };
  const R = h.r + tipOut(h.r);
  if (SB.y0 >= h.y + h.r - 2) {
    // BELOW: the slip under his head, sliding with him; the hand from its top-right corner to his outline
    const cx = clamp(SB.x0 + HALF.x + 0.5 * (h.x - 600), SB.x0 + HALF.x, SB.x1 - HALF.x), cy = SB.y0 + HALF.y;
    const side = (SB.x0 + SB.x1) / 2 < h.x ? -1 : 1, a = (side < 0 ? 150 : 30) * RAD;
    const tip = { x: h.x + R * Math.cos(a), y: h.y + R * Math.sin(a) };
    return { x: cx - cw, y: cy - ch, s, tip, rot: side < 0 ? -30 : -150, mode: "below" };
  }
  // BESIDE: the approved relation (A_humphrey: the slip's right edge 46 px left of the tip, its bottom 40 px above it)
  const side = (SB.x0 + SB.x1) / 2 < h.x ? -1 : 1;
  const a = (side < 0 ? 150 : 30) * RAD;
  const tip = { x: h.x + R * Math.cos(a), y: h.y + R * Math.sin(a) };
  const cx = clamp(tip.x + side * (46 + cw), SB.x0 + HALF.x, SB.x1 - HALF.x), cy = clamp(tip.y - 40 - ch, SB.y0 + HALF.y, SB.y1 - HALF.y);
  return { x: cx - cw, y: cy - ch, s, tip, rot: side < 0 ? -30 : -150, mode: "beside" };
};

/** the boxes the banner takes on this frame (film px): the slip (laid a touch large, turned, with its shadow), the
 *  manicule in parts (its finger in four, its fist; each turned with it, with the paper backing) */
export const bannerRects = (pl: BannerPlace): Rect[] => {
  const cx = pl.x + (SLIP.W * pl.s) / 2, cy = pl.y + (SLIP.H * pl.s) / 2;
  const slip = { x0: cx - HALF.x, y0: cy - HALF.y, x1: cx + HALF.x, y1: cy + HALF.y };
  const c = Math.cos(pl.rot * RAD), s = Math.sin(pl.rot * RAD), k = BAN.HAND_S;
  const parts = HAND_PARTS.map((b) => {
    const pts = [[b.x0, b.y0], [b.x1, b.y0], [b.x1, b.y1], [b.x0, b.y1]].map(([x, y]) => ({ x: pl.tip.x + k * (x * c - y * s), y: pl.tip.y + k * (x * s + y * c) }));
    return { x0: Math.min(...pts.map((p) => p.x)), y0: Math.min(...pts.map((p) => p.y)), x1: Math.max(...pts.map((p) => p.x)), y1: Math.max(...pts.map((p) => p.y)) };
  });
  return [slip, ...parts];
};
