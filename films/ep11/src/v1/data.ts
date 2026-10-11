import { beats } from '../lib';

/* Data for 《它在瞄准谁》: a deterministic London of bomb hits that matches Clarke (1946) exactly. */

export const mulberry = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/* study area: 12 km x 12 km of south London, 24 x 24 cells of 0.5 km (1 world unit = 1 km) */
export const SQ = { x0: -6, z0: -6, size: 12, n: 24 };
export const CELL = SQ.size / SQ.n;
export const OBSERVED = [229, 211, 93, 35, 7, 1]; // squares with 0,1,2,3,4,5+ hits
export const EXPECTED = [226.74, 211.39, 98.54, 30.62, 7.14, 1.57];
export const TOP_HITS = 7; // the single 5+ square: 537 - (211 + 2*93 + 3*35 + 4*7)

export type Cell = { i: number; r: number; c: number; x: number; z: number; count: number; bucket: number; rank: number; order: number };
export type Hit = { x: number; z: number; t: number; inSquare: boolean; cell: number; intro: boolean };

const rng = mulberry(19440613);

const counts: number[] = [];
OBSERVED.forEach((n, k) => {
  for (let j = 0; j < n; j++) counts.push(k === 5 ? TOP_HITS : k);
});
for (let i = counts.length - 1; i > 0; i--) {
  const j = Math.floor(rng() * (i + 1));
  [counts[i], counts[j]] = [counts[j], counts[i]];
}

export const CELLS: Cell[] = counts.map((count, i) => {
  const r = Math.floor(i / SQ.n), c = i % SQ.n;
  return {
    i, r, c,
    x: SQ.x0 + (c + 0.5) * CELL,
    z: SQ.z0 + (r + 0.5) * CELL,
    count,
    bucket: Math.min(count, 5),
    rank: 0,
    order: rng(),
  };
});
// position of each cell inside its histogram column
const fill = [0, 0, 0, 0, 0, 0];
[...CELLS].sort((a, b) => a.order - b.order).forEach((cl) => {
  cl.rank = fill[cl.bucket]++;
});

/* the most crowded cell and the emptiest 3x3 neighbourhood, for the "rumours" shot */
export const HOT = CELLS.find((c) => c.count === TOP_HITS)!;
export let COLD = CELLS[0]; // kept for compatibility; rings use HOT_SPOT / COLD_SPOT below

/* hits: 537 inside the square (matching the table) + others across London */
export const INTRO_T = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]; // beat indices, like Ep1's cards
const hits: Hit[] = [];
CELLS.forEach((cl) => {
  for (let k = 0; k < cl.count; k++) {
    hits.push({ x: cl.x + (rng() - 0.5) * CELL * 0.92, z: cl.z + (rng() - 0.5) * CELL * 0.92, t: 0, inSquare: true, cell: cl.i, intro: false });
  }
});
// 2,419 V-1s came down on London in all; 537 of them inside Clarke's square
export const LONDON_TOTAL = 2419;
for (let k = 0; k < LONDON_TOTAL - 537; k++) {
  const x = -17 + rng() * 34, z = -14 + rng() * 25;
  if (x > SQ.x0 && x < SQ.x0 + SQ.size && z > SQ.z0 && z < SQ.z0 + SQ.size) { k--; continue; }
  if (Math.abs(z - thamesZ(x)) < 0.45) { k--; continue; }
  hits.push({ x, z, t: 0, inSquare: false, cell: -1, intro: false });
}
export function thamesZ(x: number) {
  return -8.2 + 1.6 * Math.sin(x * 0.23) + 0.7 * Math.sin(x * 0.61 + 1.3);
}
// timing: the first ten land on the intro beats near the glide path, the rest across 20.7 - 36 s
export const INTRO_PATH = (u: number) => ({ x: 7 - 9 * u, z: 5.5 - 6.5 * u });
export const intro: Hit[] = [];
{
  const pool = hits.filter((h) => h.inSquare);
  for (let k = 0; k < 10; k++) {
    const p = INTRO_PATH(k / 9);
    let best = pool[0], bd = 1e9;
    for (const h of pool) {
      if (h.intro) continue;
      const d = Math.hypot(h.x - (p.x - 0.6), h.z - (p.z - 1.4));
      if (d < bd) { bd = d; best = h; }
    }
    best.intro = true;
    best.t = beats[INTRO_T[k]];
    intro.push(best);
  }
}
const rest = hits.filter((h) => !h.intro);
rest.forEach((h) => { h.t = 20.9 + Math.pow(rng(), 0.8) * 15.2; });
export const HITS = hits;
export const N_IN = hits.filter((h) => h.inSquare).length;

/* rings for the "rumours" shot, computed from the hits so the labels are true by construction */
const inner = HITS.filter((h) => h.inSquare);
export const HOT_R = 0.75;
export const HOT_SPOT = (() => {
  let best = { x: 0, z: 0, n: -1 };
  for (const cl of CELLS) {
    const n = inner.filter((h) => Math.hypot(h.x - cl.x, h.z - cl.z) < HOT_R).length;
    if (n > best.n) best = { x: cl.x, z: cl.z, n };
  }
  return best;
})();
export const COLD_SPOT = (() => {
  let best = { x: 0, z: 0, d: 0 };
  for (let x = SQ.x0 + 1.2; x <= SQ.x0 + SQ.size - 1.2; x += 0.1) {
    for (let z = SQ.z0 + 1.2; z <= SQ.z0 + SQ.size - 1.2; z += 0.1) {
      let d = 1e9;
      for (const h of HITS) d = Math.min(d, Math.hypot(h.x - x, h.z - z));
      if (d > best.d) best = { x, z, d };
    }
  }
  return { x: best.x, z: best.z, r: Math.min(0.85, best.d * 0.85), clearance: best.d };
})();
