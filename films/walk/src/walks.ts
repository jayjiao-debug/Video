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

const visits = (w: Walk, i: number, upto: number, tx = 0, ty = 0, tz = 0) => {
  const out: number[] = [];
  for (let k = 1; k <= upto; k++) {
    const o = (i * (w.steps + 1) + k) * w.d;
    if (w.pos[o] === tx && (w.d < 2 || w.pos[o + 1] === ty) && (w.d < 3 || w.pos[o + 2] === tz)) out.push(k);
  }
  return out;
};
const reach = (w: Walk, upto: number) => {
  let far = 0;
  for (let k = 0; k <= upto; k++) {
    let d = 0;
    for (let j = 0; j < w.d; j++) d += w.pos[k * w.d + j] ** 2;
    far = Math.max(far, Math.sqrt(d));
  }
  return far;
};

const search = <R,>(name: string, f: (seed: number) => R | null): R => {
  for (let seed = 1; seed < 400000; seed++) {
    const r = f(seed);
    if (r) return r;
  }
  throw new Error('no walk for ' + name);
};

/** S2 left: a walker on the plane that comes home 4–5 times in 48 steps, well spread out, and wanders ≥ 3.5 blocks */
export const HOMER = search('HOMER', (seed) => {
  const w = simulate(2, 1, 48, seed * 104729);
  const v = visits(w, 0, 48);
  return v.length >= 4 && v.length <= 5 && reach(w, 48) >= 3.5 && v[0] >= 6 && v.every((x, k) => k === 0 || x - v[k - 1] >= 6) ? {w, visits: v} : null;
});
/** S2 right: a bird that never comes back in 60 steps and ends ≥ 8 away */
export const LOST = search('LOST', (seed) => {
  const w = simulate(3, 1, 60, seed * 15485863);
  return w.back[0] < 0 && Math.hypot(w.pos[180], w.pos[181], w.pos[182]) >= 8 ? {w} : null;
});
/** S4: the couple (a) and Pólya (b, starting 3 right and 1 down: same parity, or they could never meet),
    meeting 4–5 times in 64 steps */
export const WOODS = search('WOODS', (seed) => {
  const a = simulate(2, 1, 64, seed * 7907);
  const b = simulate(2, 1, 64, seed * 7907 + 3);
  const meet: number[] = [];
  let far = 0;
  for (let k = 1; k <= 64; k++) {
    const dx = a.pos[k * 2] - (b.pos[k * 2] + 3);
    const dy = a.pos[k * 2 + 1] - (b.pos[k * 2 + 1] + 1);
    if (dx === 0 && dy === 0 && (meet.length === 0 || k - meet[meet.length - 1] >= 5)) meet.push(k);
    far = Math.max(far, Math.abs(dx) + Math.abs(dy));
  }
  return meet.length >= 4 && meet.length <= 5 && meet[0] >= 6 && meet[0] <= 16 && far >= 5 ? {a, b, meet, off: [3, 1] as [number, number]} : null;
});
/** S7: one long walk on the plane and one in space, for the footprint picture */
export const LONG2 = simulate(2, 1, 2000, 2024);
export const LONG3 = simulate(3, 1, 2000, 3036);

/* Readable versions for the film: 100 walkers each, few enough to follow one by one. Seeds are
   searched so that each small group matches its big simulation (and the theory) to the percent:
   1D 97% home by step 900, 2D 68% by step 900, 3D 34% by step 600. */
const matching = (d: 1 | 2 | 3, steps: number, want: number, base: number) => {
  for (let seed = 1; seed < 20000; seed++) {
    const w = simulate(d, 100, steps, base + seed * 7);
    if (homeBy(w, steps) === want) return w;
  }
  throw new Error(`no ${d}D group with ${want} home`);
};
export const H1 = matching(1, 900, 97, 1000);
export const H2 = matching(2, 900, 68, 2000);
export const H3 = matching(3, 600, 34, 3000);
