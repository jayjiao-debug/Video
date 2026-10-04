import {beatAt, mulberry} from './lib';

/* Kuramoto oscillators, simulated once at load from a fixed seed so every frame and every render chunk
   agrees: dθᵢ/dt = ωᵢ + K_in(t)·r_g·sin(ψ_g − θᵢ) + K_out(t)·r·sin(ψ − θᵢ). Each oscillator is pulled
   toward its own group's average phase ψ_g (a tree of fireflies) and, more weakly, toward everyone's ψ
   (the whole riverbank), each pull stronger the more that crowd already agrees (r ∈ [0,1]).
   Phases are stored per frame; ψ is stored unwrapped so the crowd's beat can be pinned to the music. */
export type Run = {n: number; frames: number; fps: number; th: Float32Array; r: Float32Array; psi: Float64Array};

const gauss = (rnd: () => number) => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());

export const kuramoto = (o: {n: number; seconds: number; fps?: number; hz: number; spread: number; K: (t: number) => number; Kin?: (t: number) => number; groups?: Int32Array; seed: number}): Run => {
  const fps = o.fps ?? 30;
  const frames = Math.ceil(o.seconds * fps) + 1;
  const sub = 8;
  const dt = 1 / fps / sub;
  const rnd = mulberry(o.seed);
  const w = Float64Array.from({length: o.n}, () => 2 * Math.PI * (o.hz + gauss(rnd) * o.spread));
  const th = new Float32Array(o.n * frames);
  const cur = Float64Array.from({length: o.n}, () => rnd() * 2 * Math.PI);
  const r = new Float32Array(frames);
  const psi = new Float64Array(frames);
  const G = o.groups ? Math.max(...o.groups) + 1 : 0;
  const gx = new Float64Array(G);
  const gy = new Float64Array(G);
  const gn = new Float64Array(G);
  if (o.groups) for (let i = 0; i < o.n; i++) gn[o.groups[i]]++;
  let prev = 0;
  for (let f = 0; f < frames; f++) {
    let cx = 0;
    let cy = 0;
    for (let i = 0; i < o.n; i++) {
      th[f * o.n + i] = cur[i];
      cx += Math.cos(cur[i]);
      cy += Math.sin(cur[i]);
    }
    r[f] = Math.hypot(cx, cy) / o.n;
    // unwrapped mean phase: follow the mean frequency between frames
    const a = Math.atan2(cy, cx);
    if (f === 0) psi[0] = a;
    else {
      const guess = prev + (2 * Math.PI * o.hz) / fps;
      psi[f] = guess + ((((a - guess) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
    }
    prev = psi[f];
    for (let s = 0; s < sub; s++) {
      let sx = 0;
      let sy = 0;
      gx.fill(0);
      gy.fill(0);
      for (let i = 0; i < o.n; i++) {
        const c = Math.cos(cur[i]);
        const d = Math.sin(cur[i]);
        sx += c;
        sy += d;
        if (o.groups) {
          gx[o.groups[i]] += c;
          gy[o.groups[i]] += d;
        }
      }
      sx /= o.n;
      sy /= o.n;
      const t = (f + s / sub) / fps;
      const K = o.K(t);
      const Kin = o.Kin ? o.Kin(t) : 0;
      for (let i = 0; i < o.n; i++) {
        const c = Math.cos(cur[i]);
        const d = Math.sin(cur[i]);
        let v = w[i] + K * (sy * c - sx * d);
        if (o.groups) {
          const g = o.groups[i];
          v += (Kin * (gy[g] * c - gx[g] * d)) / gn[g];
        }
        cur[i] += v * dt;
      }
    }
  }
  return {n: o.n, frames, fps, th, r, psi};
};

const at = (run: Run, arr: ArrayLike<number>, t: number) => {
  const f = Math.max(0, Math.min(run.frames - 1.001, t * run.fps));
  const a = Math.floor(f);
  return arr[a] + (arr[a + 1] - arr[a]) * (f - a);
};
/** phase of oscillator i at time t (seconds into the run), interpolated between stored frames */
export const phase = (run: Run, i: number, t: number) => {
  const f = Math.max(0, Math.min(run.frames - 1.001, t * run.fps));
  const a = Math.floor(f);
  const k = f - a;
  const p0 = run.th[a * run.n + i];
  const p1 = run.th[(a + 1) * run.n + i];
  return p0 + (p1 - p0) * k;
};
export const order = (run: Run, t: number) => at(run, run.r, t);

/** a phase shift that pins the crowd's common beat to the music once it has formed: added to every
    oscillator alike, so it never changes how in-step they are, only when the shared flash lands.
    `per` = music beats per cycle. */
export const pin = (run: Run, T: number, T0: number, per = 1, from = 0.35, to = 0.85) => {
  const t = T - T0;
  const r = order(run, t);
  const w = Math.max(0, Math.min(1, (r - from) / (to - from)));
  const s = w * w * (3 - 2 * w);
  return s * ((2 * Math.PI * beatAt(T)) / per - at(run, run.psi, t));
};

/** a firefly's flash each time its phase passes 0: a quick rise and a soft fall. At one cycle per beat
    (≈0.5 s) that is ~0.03 s up and ~0.1 s down: several frames, never a one-frame strobe. */
export const flash = (th: number) => {
  const u = ((th % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  return Math.exp(-u * 1.3) + Math.exp(-(2 * Math.PI - u) * 3);
};
