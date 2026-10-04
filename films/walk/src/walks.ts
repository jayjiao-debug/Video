import {mulberry} from './lib';

/* Lattice random walks, simulated once at load from fixed seeds (so every frame and every render
   chunk sees the same walkers). Positions are stored per step; drawing interpolates between steps. */

export type Walk = {d: 1 | 2 | 3; n: number; steps: number; pos: Int16Array; back: Int32Array};

/** n walkers, `steps` steps each, in d dimensions. back[i] = first step at which walker i is home again (or -1). */
export const simulate = (d: 1 | 2 | 3, n: number, steps: number, seed: number): Walk => {
  const r = mulberry(seed);
  const pos = new Int16Array(n * (steps + 1) * d);
  const back = new Int32Array(n).fill(-1);
  for (let i = 0; i < n; i++) {
    const p = [0, 0, 0];
    for (let s = 1; s <= steps; s++) {
      const k = Math.floor(r() * 2 * d);
      p[k >> 1] += k & 1 ? 1 : -1;
      const o = (i * (steps + 1) + s) * d;
      for (let j = 0; j < d; j++) pos[o + j] = p[j];
      if (back[i] < 0 && p[0] === 0 && p[1] === 0 && p[2] === 0) back[i] = s;
    }
  }
  return {d, n, steps, pos, back};
};

/** position of walker i at fractional step s (linear between lattice points) */
export const at = (w: Walk, i: number, s: number, out: number[]) => {
  const s0 = Math.max(0, Math.min(w.steps, Math.floor(s)));
  const s1 = Math.min(w.steps, s0 + 1);
  const f = Math.max(0, Math.min(1, s - s0));
  const a = (i * (w.steps + 1) + s0) * w.d;
  const c = (i * (w.steps + 1) + s1) * w.d;
  for (let j = 0; j < 3; j++) out[j] = j < w.d ? w.pos[a + j] + (w.pos[c + j] - w.pos[a + j]) * f : 0;
  return out;
};

/** how many walkers have come home by step s */
export const homeBy = (w: Walk, s: number) => {
  let k = 0;
  for (let i = 0; i < w.n; i++) if (w.back[i] >= 0 && w.back[i] <= s) k++;
  return k;
};

export const W1 = simulate(1, 400, 900, 11);
export const W2 = simulate(2, 2000, 900, 22);
export const W3 = simulate(3, 1600, 900, 33);

/** the drunk man: one 2D walk that wanders far (≥ 5 blocks) and comes home between steps 70 and 110 */
export const DRUNK = (() => {
  for (let seed = 1; seed < 100000; seed++) {
    const w = simulate(2, 1, 140, seed * 7919);
    const s = w.back[0];
    if (s < 70 || s > 110) continue;
    let far = 0;
    for (let k = 0; k <= s; k++) far = Math.max(far, Math.abs(w.pos[k * 2]) + Math.abs(w.pos[k * 2 + 1]));
    if (far >= 5 && far <= 7) return {w, home: s};
  }
  throw new Error('no drunk path');
})();
