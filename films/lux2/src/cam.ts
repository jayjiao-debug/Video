/* Camera path: Catmull-Rom through keyed shots so moves flow into each other; a key can ask for a hard
   expo-out move instead (the whip-back on the lock). Each key: time, position, look-at, fov, focus distance, aperture, bloom. */
import type { Cam } from './Stage';

export type Key = { t: number; pos: number[]; look: number[]; fov: number; ap: number; bloom: number; focus?: number; whip?: boolean };
const cr = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
const ss = (u: number) => u * u * (3 - 2 * u);

export const camAt = (keys: Key[], T: number): Cam => {
  let i = keys.findIndex((k, j) => j < keys.length - 1 && T >= k.t && T < keys[j + 1].t);
  if (T < keys[0].t) i = 0; if (i < 0) i = keys.length - 2;
  const b = keys[i], c = keys[i + 1];
  // a whip is a hard cut in velocity: the smooth segments on either side of it don't look through it
  const a = b.whip ? b : keys[Math.max(0, i - 1)], d = keys[i + 2]?.whip ? c : keys[Math.min(keys.length - 1, i + 2)];
  const u = Math.max(0, Math.min(1, (T - b.t) / (c.t - b.t)));
  const v3 = (f: (k: Key) => number[]) => [0, 1, 2].map((n) => c.whip ? f(b)[n] + (f(c)[n] - f(b)[n]) * (1 - Math.pow(1 - u, 4)) : cr(f(a)[n], f(b)[n], f(c)[n], f(d)[n], u));
  const s = (f: (k: Key) => number) => (c.whip ? f(b) + (f(c) - f(b)) * (1 - Math.pow(1 - u, 4)) : f(b) + (f(c) - f(b)) * ss(u));
  const pos = v3((k) => k.pos) as [number, number, number], look = v3((k) => k.look) as [number, number, number];
  const dist = Math.hypot(pos[0] - look[0], pos[1] - look[1], pos[2] - look[2]);
  return { pos, look, fov: s((k) => k.fov), focus: b.focus !== undefined || c.focus !== undefined ? s((k) => k.focus ?? dist) : dist, aperture: s((k) => k.ap), bloom: s((k) => k.bloom) };
};
