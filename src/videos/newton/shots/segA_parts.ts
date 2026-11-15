// SEGMENT A's helpers (v5 rebuild, 15 Nov). THE INVISIBLE REPORTER (Jay, 14 Nov: no mic, no hand; "pretend there is an
// invisible hand like 秦始皇") and HER BODY (the day-in-life-film skill: her eye about 1.5 m, a breathing and walking
// bob). Every function is pure (the frame in, a number or a pose out).
//   EYE_A                  her eye over the floor she stands on (1.5 m; layout.ts EYE is the film's old 1.6)
//   rapPush(f, ons, amp)   the camera's small push on each rap (her weight behind the knock): in over 2 frames, back
//                          over 5; amp[i] metres for rap i (the frame "nods forward a hair": script v5, the knock row)
//   shiver(f, ons)         the leaf's answer to each rap: a damped rattle in its frame (door param units, inward only:
//                          it rattles against its stop), every other frame, over 7 frames
//   jolt(f, on)            THE ONE JOLT of the slam: back 6 cm in 3 frames, a 3 deg tip up and a little roll, settling
//                          over 14 (approved in the camera plan A, M4)
//   breath(f, k)           her breathing at rest: the lens rises and sinks 4 mm and tips 0.12 deg on a 4.2 s breath
//                          (k 0..1 its strength: 0 where the frame must be dead still, e.g. the clock join's tail)
//   stepDip(f, steps)      her walking bob: the lens dips 1.2 cm on each footfall of a step she takes, 6 frames
//   nibAt(t, k)            THE NIB on his page, in HIS frame (x his left, z away from him): lines of small loops, a
//                          carriage return every line, a lift between words; `k` the tempo (1.6 = the fast burst)
//   lightFocus(cam, p)     the film's light focus (amount 3) on a world point
import * as THREE from "three";
import { clamp01, easeInCubic, easeOutCubic, smooth, type CamPose } from "../story";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const posOf = (c: CamPose) => (c.pos instanceof THREE.Vector3 ? c.pos.clone() : V(c.pos[0], c.pos[1], c.pos[2]));

/** HER EYE over the floor she stands on (the format: about 1.5 m) */
export const EYE_A = 1.5;

/** the camera's push on each rap (m): in over 2 frames (ease-in), back over 5 (ease-out) */
export const rapPush = (f: number, ons: number[], amp: number[]) => {
  let k = 0;
  ons.forEach((on, i) => {
    const d = f - on, a = amp[i] ?? amp[amp.length - 1];
    if (d >= -2 && d <= 0) k = Math.max(k, a * easeInCubic((d + 2) / 2));
    else if (d > 0 && d <= 5) k = Math.max(k, a * (1 - easeOutCubic(d / 5)));
  });
  return k;
};
/** the leaf's rattle after each rap (door param units: 0.006 = 0.6 deg, about 9 mm at its free edge) */
export const SHIVER = 0.006;
export const shiver = (f: number, ons: number[]) => {
  let s = 0;
  for (const on of ons) { const d = f - on; if (d >= 0 && d <= 7) s += SHIVER * Math.exp(-d / 2.2) * (d % 2 === 0 ? 1 : 0.25); }
  return s;
};
/** THE JOLT on a hit (the slam): fwd (m, - = back), pitch (deg, + = up), roll (deg) */
export const jolt = (f: number, on: number) => {
  const d = f - on;
  if (d < 0 || d > 17) return { fwd: 0, pitch: 0, roll: 0 };
  const jerk = easeOutCubic(clamp01(d / 3)), settle = smooth(clamp01((d - 3) / 14));
  const k = d < 3 ? jerk : 1 - settle;
  return { fwd: -0.06 * k, pitch: 3 * k, roll: -1.4 * k };
};
/** her breathing at rest: up (m) and pitch (deg); k scales it (0 = dead still) */
export const breath = (f: number, k = 1) => {
  const w = (2 * Math.PI * f) / (4.2 * 30);
  return { up: 0.004 * Math.sin(w) * k, pitch: 0.12 * Math.sin(w + 0.9) * k };
};
/** her walking bob: the lens dips 1.2 cm on each footfall (6 frames each) */
export const stepDip = (f: number, steps: number[]) => {
  let dip = 0;
  for (const s of steps) { const d = f - s; if (d >= 0 && d < 6) dip = Math.max(dip, 0.012 * Math.sin((Math.PI * d) / 6)); }
  return dip;
};
/** THE NIB on his page at time t (s), in HIS frame (x = his left, y up, z = away from him), metres from the page's
 *  middle: lines of small loops from his left to his right, a carriage return every line, a lift between words; k the
 *  tempo (1 = his writing, 1.6 = the burst after the stop). The same hand as segB's nibAt (his desk in the room). */
export const nibAt = (t: number, k = 1) => {
  const tt = t * k, LT = 2.4, RT = 0.38, CY = LT + RT;
  const n = Math.floor(tt / CY), u = tt - n * CY, row = ((n % 9) + 9) % 9, z0 = 0.06 - row * 0.012;
  if (u < LT) {
    const p = u / LT, w = 2 * Math.PI * 4.6 * tt;
    return V(0.05 - 0.1 * p + 0.0032 * Math.sin(w), 0.004 + 0.003 * Math.pow(Math.max(0, Math.sin(2 * Math.PI * 1.45 * tt)), 10), z0 + 0.0045 * Math.max(0, Math.cos(w)) - 0.001);
  }
  const p = smooth((u - LT) / RT);
  return V(-0.05 + 0.1 * p, 0.004 + 0.012 * Math.sin(Math.PI * p), z0 - 0.012 * p);
};
/** the light focus on a world point (the film's dof at amount 3: the subject crisp, the far wall a touch soft) */
export const lightFocus = (cam: CamPose, p: THREE.Vector3) => ({ focus: Math.max(0.2, posOf(cam).distanceTo(p)), amount: 3 });
/** A KEYED CURVE through (frame, value) keys: piecewise linear (`linear`), or a monotone cubic (Fritsch-Carlson: the
 *  inner tangents are the harmonic mean of the two secants, so it never overshoots a key; flat at both ends: a move
 *  from rest to rest). Held before the first key and after the last. */
export const keyed = (f: number, keys: [number, number][], linear = false) => {
  const n = keys.length;
  if (f <= keys[0][0]) return keys[0][1];
  if (f >= keys[n - 1][0]) return keys[n - 1][1];
  let i = 0;
  while (f > keys[i + 1][0]) i++;
  const [x0, y0] = keys[i], [x1, y1] = keys[i + 1], h = x1 - x0, u = (f - x0) / h;
  if (linear) return y0 + (y1 - y0) * u;
  const sec = (k: number) => (keys[k + 1][1] - keys[k][1]) / (keys[k + 1][0] - keys[k][0]);
  const tan = (k: number) => {
    if (k === 0 || k === n - 1) return 0;
    const a = sec(k - 1), b = sec(k);
    return a * b <= 0 ? 0 : (2 * a * b) / (a + b);
  };
  const m0 = tan(i) * h, m1 = tan(i + 1) * h, u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * y0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * y1 + (u3 - u2) * m1;
};
