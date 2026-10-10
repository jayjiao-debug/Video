/* The contract every scene follows. A scene is one diorama on the long foil stage, placed at world x = `x`.
   Its Set draws in LOCAL coordinates (origin on the floor at the centre of its stage, +y up, +z toward the
   audience, 1 unit = 1 m; the hero bag is ~0.32 m wide). Its camera keys are LOCAL too; the film adds x.
   T is always FILM time in seconds (so scenes can land things on beats from beats.ts). */
import type React from 'react';
import type { Line } from './art';

export type Key = {
  t: number;                          // film time
  pos: [number, number, number];      // local
  look: [number, number, number];     // local
  fov: number;
  ap?: number;                        // depth-of-field aperture (0.001 deep … 0.02 very shallow)
  bloom?: number;                     // 0.4 … 1.2
  roll?: number;                      // radians
  focus?: number;                     // override focus distance (m); default = distance to look
};

export type SceneDef = {
  id: string;
  t0: number; t1: number;             // when this scene is on screen (film time); neighbours overlap by the transition
  x: number;                          // world x of this stage
  /** how the camera arrives from the previous scene at t0: 'whip' = fast lateral move, fastest exactly at t0
      (motion blur + chromatic split), 'cut' = hard cut on t0 (match cut + flash) */
  enter: 'whip' | 'cut';
  Set: React.FC<{ T: number }>;
  keys: Key[];                        // at least 2; first key.t ≈ t0 (+0.3 for whip), last key.t ≈ t1 (-0.3 for whip)
  lines: Line[];                      // subtitles that belong to this scene (film time)
  /** extra flash/shake hits inside the scene (film time, 0..1 strength); A-tier music hits are added globally */
  hits?: [number, number][];
  /** background colour of the void for this scene */
  bg?: string;
  /** environment light strength for this scene (club strips), default 1 */
  env?: number;
  exposure?: number;
  /** optional 2D HTML layer drawn over the 3D picture (under the subtitles), e.g. end-card small print */
  Overlay?: React.FC<{ T: number }>;
};

/* ------------------------------------------------------------------ timing helpers for scene authors */
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeIn = (x: number) => x * x * x;
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const backOut = (x: number) => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** springy pop-in that lands exactly at time a + d (overshoot then settle) */
export const pop = (T: number, a: number, d = 0.3) => (T < a ? 0 : T > a + d * 2.2 ? 1 : backOut(clamp((T - a) / d)));
/** a slam: big → 1 with a hard landing at time a (use for numbers/titles on a beat) */
export const slam = (T: number, a: number, d = 0.12) => (T < a - d ? 0 : T >= a ? 1 : easeIn(clamp((T - (a - d)) / d)));
/** decaying shake/impulse after a hit */
export const impulse = (T: number, a: number, decay = 0.18) => (T < a ? 0 : Math.exp(-(T - a) / decay));
/** a pendulum swing kicked at time a */
export const swing = (T: number, a: number, amp = 14) => { const d = T - a; return d < 0 ? 0 : amp * Math.exp(-d * 1.6) * Math.sin(d * 7.5); };
