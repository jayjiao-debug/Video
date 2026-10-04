import {mulberry} from './lib';

/* Kuramoto oscillators, simulated once at load from a fixed seed so every frame and every render chunk
   agrees: dθᵢ/dt = ωᵢ + K(t)·r·sin(ψ − θᵢ) (mean field: each one nudged toward the crowd's average
   phase ψ, more strongly the more the crowd already agrees, r ∈ [0,1]). Phases are stored per frame. */
export type Run = {n: number; frames: number; fps: number; th: Float32Array; r: Float32Array};

const gauss = (rnd: () => number) => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());

export const kuramoto = (o: {n: number; seconds: number; fps?: number; hz: number; spread: number; K: (t: number) => number; seed: number}): Run => {
  const fps = o.fps ?? 30;
  const frames = Math.ceil(o.seconds * fps) + 1;
  const sub = 8;
  const dt = 1 / fps / sub;
  const rnd = mulberry(o.seed);
  const w = Float32Array.from({length: o.n}, () => 2 * Math.PI * (o.hz + gauss(rnd) * o.spread));
  const th = new Float32Array(o.n * frames);
  const cur = Float64Array.from({length: o.n}, () => rnd() * 2 * Math.PI);
  const r = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    let cx = 0;
    let cy = 0;
    for (let i = 0; i < o.n; i++) {
      th[f * o.n + i] = cur[i];
      cx += Math.cos(cur[i]);
      cy += Math.sin(cur[i]);
    }
    r[f] = Math.hypot(cx, cy) / o.n;
    for (let s = 0; s < sub; s++) {
      let sx = 0;
      let sy = 0;
      for (let i = 0; i < o.n; i++) {
        sx += Math.cos(cur[i]);
        sy += Math.sin(cur[i]);
      }
      sx /= o.n;
      sy /= o.n;
      const K = o.K((f + s / sub) / fps);
      for (let i = 0; i < o.n; i++) cur[i] += (w[i] + K * (sy * Math.cos(cur[i]) - sx * Math.sin(cur[i]))) * dt;
    }
  }
  return {n: o.n, frames, fps, th, r};
};

/** phase of oscillator i at time t (seconds into the run), interpolated between stored frames */
export const phase = (run: Run, i: number, t: number) => {
  const f = Math.max(0, Math.min(run.frames - 1.001, t * run.fps));
  const a = Math.floor(f);
  const k = f - a;
  const p0 = run.th[a * run.n + i];
  let p1 = run.th[(a + 1) * run.n + i];
  return p0 + (p1 - p0) * k;
};
export const order = (run: Run, t: number) => run.r[Math.max(0, Math.min(run.frames - 1, Math.round(t * run.fps)))];

/** a firefly's flash: a short bright pulse each time its phase passes 0 */
export const flash = (th: number) => {
  const u = ((th % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  return Math.exp(-u * 6) + Math.exp(-(2 * Math.PI - u) * 30);
};
