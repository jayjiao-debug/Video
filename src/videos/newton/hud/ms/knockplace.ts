// hud/ms/knockplace.ts: WHEN AND WHERE THE KNOCK MARK SITS (the owner, 15 Nov, note 1: "knock on the door, with a knocking
// visual effect on the door"), as plain arithmetic (no React), so the piece (hud/ms/knock.tsx) and the checkers' boxes
// (hud/ms/when.ts item "knock": boxAt) come from the same numbers, like bannerplace.ts for Humphrey's banner.
//
// WHAT: on each of the invisible hand's two raps on his door (BEAT.A.knock, knock2) a hand-drawn IMPACT MARK pops ON THE
// LEAF where the hand lands: eight short quill flicks radiating from the knock point (iron-gall ink, each on a sliver of
// the skin's paper so it reads on dark oak), and beside it one 咚 in the crimson display hand on its paper scrap (the
// piece's rubric mark). The second rap's mark is a little bigger and turned.
// WHERE: THE KNOCK POINT IS PROJECTED FROM THE WORLD on every frame: shots/segA.ts knockAt(f) gives the point on the leaf
// (c) and where 10 cm further along the leaf (u) and 10 cm up (v) land on screen, with the frame's camera (its nod on
// each rap, her breath) and the leaf's own shiver and swing. The flicks are laid out IN THE LEAF'S PLANE (metres along
// the leaf and up) and put on screen through c, u, v, so the mark is foreshortened with the door (the gap framing sees
// the leaf at about 30 deg: the mark is a tall oval) and rides it. The two 咚 sit a fixed way off the knock point (px),
// above the first mark and below the second, on the leaf's strip left of the gap: inside the words zone (x >= 110),
// 100 px and more left of his face through the gap, far under the REC display.
// WHEN (frames from the beats, never typed): mark 1 from rap 1 for KN.mark frames, mark 2 from rap 2; 咚 1 from rap 1
// for KN.dong[0] frames, 咚 2 from rap 2 for KN.dong[1]; everything is gone the frame before 「早上好！」 (A01b:
// BEAT.A.morning). Each part pops in 2 frames (it lands a touch large) and leaves over its last KN.leave frames by
// sinking into the paper (the skin's exit).
import type { Rect } from "../../../../kit/overlay/frame";
import { BEAT } from "../../beats";
import { knockAt } from "../../shots/segA";

export type KnPt = { x: number; y: number };
/** the piece's numbers */
export const KN = {
  /** the marks' radius on the leaf (m): rap 1, rap 2 (a little bigger) */ R: [0.07, 0.085],
  /** rap 2's mark is turned this far (deg) so it is not a copy */ turn: [0, 21],
  /** the flicks: direction (deg in the leaf's plane: 0 = toward its free edge, 90 = up), where each starts and ends (in R) */
  rays: [[8, 0.4, 1], [52, 0.44, 0.86], [95, 0.4, 1], [140, 0.46, 0.82], [185, 0.4, 0.96], [228, 0.44, 0.84], [272, 0.4, 1], [318, 0.46, 0.88]] as [number, number, number][],
  /** a flick's half width (px) where the nib lands and at its tip: rap 1, rap 2 */ w0: [7, 8.5], w1: 1.6,
  /** the paper sliver's margin round a flick (px) */ paper: 6.5,
  /** frames a mark lives, frames a 咚 lives (1, 2), frames each takes to leave */ mark: 9, dong: [12, 10], leave: 4,
  /** the two 咚: their middle from the knock point (px), size (px), turn (deg) */
  say: [{ dx: 0, dy: -182, S: 88, rot: -8 }, { dx: 6, dy: 204, S: 100, rot: 6 }],
  /** the paper scrap's outline round a 咚 (px, quillOutline's stroke) */ scrap: 26,
} as const;

/** THE FRAMES: the two raps; the item's first and last frame (gone the frame before A01b) */
export const KNOCK_RAPS: [number, number] = [BEAT.A.knock, BEAT.A.knock2];
export const KNOCK_SPAN: [number, number] = [BEAT.A.knock, BEAT.A.morning[0] - 1];
const lenOf = (i: 0 | 1, n: number) => Math.max(0, Math.min(n, KNOCK_SPAN[1] - KNOCK_RAPS[i] + 1));
/** a part's life on film frame fr: null when it does not show; d = frames since its rap, s = its scale (it lands a touch
 *  large and settles in 2-4 frames), k = its exit's progress (0 until its last KN.leave frames) */
export type KnLife = { d: number; len: number; s: number; k: number };
const lifeOf = (fr: number, on: number, len: number, land: readonly number[]): KnLife | null => {
  const d = fr - on;
  if (d < 0 || d >= len) return null;
  return { d, len, s: land[d] ?? 1, k: Math.min(1, Math.max(0, (d - (len - KN.leave)) / KN.leave)) };
};
const LAND_MARK = [1.16, 1.05], LAND_SAY = [1.22, 1.08, 0.96, 1.02];
export const markLife = (i: 0 | 1, fr: number) => lifeOf(fr, KNOCK_RAPS[i], lenOf(i, KN.mark), LAND_MARK);
export const sayLife = (i: 0 | 1, fr: number) => lifeOf(fr, KNOCK_RAPS[i], lenOf(i, KN.dong[i]), LAND_SAY);

/** THE KNOCK POINT ON SCREEN on film frame fr (film px): c, and the leaf's own axes there: U = px per metre along the
 *  leaf (toward its free edge), V = px per metre up */
export const knockPlace = (fr: number): { c: KnPt; U: KnPt; V: KnPt } => {
  const k = knockAt(fr);
  return { c: k.c, U: { x: (k.u.x - k.c.x) / 0.1, y: (k.u.y - k.c.y) / 0.1 }, V: { x: (k.v.x - k.c.x) / 0.1, y: (k.v.y - k.c.y) / 0.1 } };
};
/** one flick on screen: where the nib lands (a), its tip (b), its outline (a wedge: wide at a, a point at b), half width at a */
export type KnRay = { a: KnPt; b: KnPt; poly: KnPt[]; w: number };
/** MARK i's flicks on film frame fr (null while it does not show): laid out in the leaf's plane, put on screen through
 *  the knock point's axes. On its first frame each flick is 60 % written (from where the nib lands, outward); as it
 *  leaves the flicks drift outward 10 % */
export const markRays = (i: 0 | 1, fr: number): { life: KnLife; rays: KnRay[] } | null => {
  const life = markLife(i, fr);
  if (!life) return null;
  const { c, U, V } = knockPlace(fr), R = KN.R[i] * life.s, grow = life.d === 0 ? 0.6 : 1, out = 1 + 0.1 * life.k;
  const at = (ang: number, r: number): KnPt => { const a = ((ang + KN.turn[i]) * Math.PI) / 180, p = r * R * Math.cos(a), q = r * R * Math.sin(a); return { x: c.x + p * U.x + q * V.x, y: c.y + p * U.y + q * V.y }; };
  const rays = KN.rays.map(([ang, r0, r1]): KnRay => {
    const a = at(ang, r0 * out), b = at(ang, (r0 + (r1 - r0) * grow) * out), L = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = -(b.y - a.y) / L, ny = (b.x - a.x) / L, w = KN.w0[i];
    return { a, b, w, poly: [{ x: a.x + nx * w, y: a.y + ny * w }, { x: b.x + nx * KN.w1, y: b.y + ny * KN.w1 }, { x: b.x - nx * KN.w1, y: b.y - ny * KN.w1 }, { x: a.x - nx * w, y: a.y - ny * w }] };
  });
  return { life, rays };
};
/** 咚 i on film frame fr (null while it does not show): its middle on screen, its size and turn */
export const sayPlace = (i: 0 | 1, fr: number): { life: KnLife; cx: number; cy: number; S: number; rot: number } | null => {
  const life = sayLife(i, fr);
  if (!life) return null;
  const { c } = knockPlace(fr), s = KN.say[i];
  return { life, cx: c.x + s.dx, cy: c.y + s.dy, S: s.S, rot: s.rot };
};

/** THE BOXES the piece takes on film frame fr (film px): each showing mark (its flicks with their paper slivers, the
 *  torn edge and the shadow) and each showing 咚 (its paper scrap, turned, at this frame's scale, with its shadow) */
export const knockRects = (fr: number): Rect[] => {
  const out: Rect[] = [];
  for (const i of [0, 1] as const) {
    const m = markRays(i, fr);
    if (m) {
      const pts = m.rays.flatMap((r) => r.poly), pad = KN.paper + KN.w0[i] * 0.3 + 6;
      out.push({ x0: Math.min(...pts.map((p) => p.x)) - pad, y0: Math.min(...pts.map((p) => p.y)) - pad, x1: Math.max(...pts.map((p) => p.x)) + pad, y1: Math.max(...pts.map((p) => p.y)) + pad + 3 });
    }
    const s = sayPlace(i, fr);
    if (s) {
      const a = (Math.abs(s.rot) * Math.PI) / 180, h = (s.S / 2 + KN.scrap / 2 + 3) * (Math.cos(a) + Math.sin(a)) * s.life.s;
      out.push({ x0: s.cx - h, y0: s.cy - h, x1: s.cx + h + 3, y1: s.cy + h + 5 });
    }
  }
  if (!out.length) { const { c } = knockPlace(fr); out.push({ x0: c.x - 1, y0: c.y - 1, x1: c.x + 1, y1: c.y + 1 }); }
  return out;
};
/** the box round everything the piece draws over its whole life (the item's envelope) */
export const KNOCK_ENVELOPE: Rect = (() => {
  const all: Rect[] = [];
  for (let fr = KNOCK_SPAN[0]; fr <= KNOCK_SPAN[1]; fr++) all.push(...knockRects(fr));
  return { x0: Math.floor(Math.min(...all.map((r) => r.x0))), y0: Math.floor(Math.min(...all.map((r) => r.y0))), x1: Math.ceil(Math.max(...all.map((r) => r.x1))), y1: Math.ceil(Math.max(...all.map((r) => r.y1))) };
})();
