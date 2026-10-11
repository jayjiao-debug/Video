import { beats } from '../lib';
import { SQ, CELL, CELLS, HITS, HOT, mulberry, type Hit } from '../v1/data';
import { SIM } from './cases';

/* V3 timing and derived data. Every time is a beat from music.json, so cuts and pops sit on the music. */
export const b = (i: number) => beats[i];
export const DROP1 = b(32), CUT = b(40), CLARKE = b(80), BD = b(96), BUILD = b(124), GAP = b(156), DROP2 = b(160);
export const BACK = b(168), NAME = b(176), CASES = b(184), TEX = b(228), FIN = b(240), END_IN = 124.482, V3_END = 130.5;

/* the two boards of the opening question: left = the real hits of Clarke's square, right = an arranged layout */
export const BOARD_Y = 5.0;
export const RB_X = 14;

/* hits with V3 timing (copies, so V1/V2 keep their own) */
const r = mulberry(31337);
export type Hit3 = Hit & { delay: number; hero?: boolean };
export const HERO_AT = { x: 8.6, z: 4.0 };
let heroIdx = -1;
{
  let d = 1e9;
  HITS.forEach((h, i) => {
    if (h.inSquare) return;
    const e = Math.hypot(h.x - HERO_AT.x, h.z - HERO_AT.z);
    if (e < d) { d = e; heroIdx = i; }
  });
}
export const FALL = 0.5; // seconds from the board to the ground
export const HITS3: Hit3[] = HITS.map((h, i) => {
  const delay = r();
  if (h.inSquare) return { ...h, delay, t: DROP1 + delay * 0.55 + FALL };
  if (i === heroIdx) return { ...h, delay, t: b(54), hero: true };
  // the rest of London: a rain that speeds up from the cut to 24.5 s
  return { ...h, delay, t: CUT + 0.15 + 3.65 * Math.pow(r(), 0.6) };
});
export const HERO = HITS3[heroIdx];
export const IN_SQ = HITS3.filter((h) => h.inSquare);

/* counting: the first eight squares are counted one per beat, then a wave counts the rest */
export const COUNT_RUN = (() => {
  let best = { row: 12, col: 6, score: -1 };
  for (let row = 8; row <= 15; row++) {
    for (let col = 4; col <= 12; col++) {
      const cs = Array.from({ length: 8 }, (_, k) => CELLS[row * SQ.n + col + k].count);
      const distinct = new Set(cs).size;
      const score = distinct * 10 + (cs.some((c) => c >= 3) ? 5 : 0) + (cs[0] !== 0 ? 2 : 0);
      if (score > best.score) best = { row, col, score };
    }
  }
  return best;
})();
const run0 = CELLS[COUNT_RUN.row * SQ.n + COUNT_RUN.col];
export const RUN_CENTER = { x: run0.x + 3.5 * CELL, z: run0.z };
export const countAt: number[] = CELLS.map((cl) => {
  if (cl.r === COUNT_RUN.row && cl.c >= COUNT_RUN.col && cl.c < COUNT_RUN.col + 8) return b(97 + (cl.c - COUNT_RUN.col));
  const d = Math.hypot(cl.x - RUN_CENTER.x, cl.z - RUN_CENTER.z);
  return b(104) + 0.2 + 3.0 * Math.min(1, d / 13);
});

/* sorting into piles: pile k sits behind the square */
export const TILE_H = 0.013;
export const PILE_Z = -7.8, PILE_Y = 0.95;
export const PX = (k: number) => -5.25 + 2.1 * k;
export const SIM_DX = 0.62;
export const flyAt = (bucket: number, order: number) => BUILD + 0.1 + bucket * 0.55 + order * 0.9;

/* the computer's scatter: 537 dots fall onto the empty grid, faster and faster through the build */
export type SimCell = { x: number; z: number; count: number; bucket: number; rank: number; order: number };
export const SIM_T = SIM.map((_, i) => b(132) + 0.1 + 3.6 * Math.pow((i + 1) / SIM.length, 0.55));
export const SIM_CELL_OF = SIM.map(([x, z]) => Math.min(SQ.n - 1, Math.floor((z - SQ.z0) / CELL)) * SQ.n + Math.min(SQ.n - 1, Math.floor((x - SQ.x0) / CELL)));
export const SIM_CELLS: SimCell[] = (() => {
  const rr = mulberry(4242);
  const cells: SimCell[] = CELLS.map((cl) => ({ x: cl.x, z: cl.z, count: 0, bucket: 0, rank: 0, order: rr() }));
  SIM_CELL_OF.forEach((i) => cells[i].count++);
  cells.forEach((c) => (c.bucket = Math.min(5, c.count)));
  const fill = [0, 0, 0, 0, 0, 0];
  [...cells].sort((a, c) => a.order - c.order).forEach((c) => (c.rank = fill[c.bucket]++));
  return cells;
})();
export const simFlyAt = (bucket: number, order: number) => b(140) + 0.1 + bucket * 0.45 + order * 0.7;

export { HOT };
