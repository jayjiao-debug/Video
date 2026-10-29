import {spline, sstep, sstep5} from './cam53';
/* ep53 · TakeC camera + the sword's motion for 33.274 → 56.482 (legs 8–10), pure functions of t.
   The camera is TakeB's camera at 33.274 (position, pitch, lens and velocity), then it sinks through the opened roof, tips
   over the coffin (top-down from 38.935), pushes in, rides the draw (KF07 at 43.5) and glides over the blade (KF08 at 54.8).
   Shaft world for the camera: x right, y away, z up (metres, ground z = 0, chamber floor z = −10.8). The chamber and the sword
   are written chamber-local with x' mirrored (screen right = −x'), as in the KF06 code. */
export type TC = {x: number; y: number; z: number; p: number; f: number; cx: number; cy: number; roll: number};
export const CH_Z = 10.8, T0C = 33.274;
const D = Math.PI / 180;
export const F_TOP = 900;
/* the sword: local a (cm from the pommel end, + toward the tip = screen left), w (cm across, + = screen up) */
export const SWP = {rest: {xp: -0.46, y: 0.15, z: 0.06}, carry: {xp: -0.28, y: 0.03, z: 0.30}};
export const T_LIFT: [number, number] = [41.199, 42.55];
export const T_DRAW0 = 42.85, T_DRAW = 43.463;
/** the carry: 0 at rest on the coffin floor, 1 held in the hands */
export const carry = (t: number) => sstep5((t - T_LIFT[0]) / (T_LIFT[1] - T_LIFT[0]));
export const swordAt = (t: number) => { const u = carry(t), r = SWP.rest, c = SWP.carry;
	return {xp: r.xp + (c.xp - r.xp) * u, y: r.y + (c.y - r.y) * u, z: r.z + (c.z - r.z) * u + 0.012 * Math.sin(t * 2.3) * u}; };
/** how far the blade is out of the sheath, cm (the sheath mouth sits at the guard when 0): 17.0 on the draw's beat 43.463 */
const DRAWK = spline([[T_DRAW0, 0, 0], [T_DRAW, 17.0, 24], [44.15, 36, 20], [44.9, 51, 0]]);
export const drawn = (t: number) => (t < T_DRAW0 ? 0 : Math.max(0, DRAWK(t)));
/* ---------- the plan (top-down) regime: K px per metre on the sword's plane; anchor = sword-local (a, w) cm held at screen (sx, sy) ---------- */
type Plan = {t: number; K: number; a: number; w: number; sx: number; sy: number};
const PLAN: Plan[] = [
	{t: 38.935, K: 743, a: 46, w: -6.9, sx: 960, sy: 540},
	{t: 39.9, K: 1250, a: 34, w: -1.5, sx: 930, sy: 575},
	{t: 40.5, K: 1600, a: 28, w: 0, sx: 900, sy: 600},
	{t: 41.199, K: 1700, a: 28, w: 0, sx: 900, sy: 600},
	{t: 43.463, K: 2700, a: 4.6, w: 0, sx: 1610, sy: 650},
	{t: 47.4, K: 7600, a: 13.8, w: 0, sx: 960, sy: 640},
	{t: 54.8, K: 7600, a: 19.7, w: 0, sx: 960, sy: 640},
	{t: 56.482, K: 7600, a: 21.1, w: 0, sx: 960, sy: 640},
];
const lnK = spline(PLAN.map((p) => [p.t, Math.log(p.K), 0] as [number, number, number]));
const aC = spline(PLAN.map((p) => [p.t, p.a + (p.sx - 960) / (p.K / 100)] as [number, number]));     // sword-local a at the screen's x centre, cm
const wC = spline(PLAN.map((p) => [p.t, p.w + (p.sy - 540) / (p.K / 100)] as [number, number]));      // sword-local w at the screen's y centre, cm
const xT = spline([[T0C, 0.12, 0], [36.104, 0.0], [38.935, 0.0, 0]]);
const yT = spline([[T0C, -0.95, 0], [36.104, -0.90], [36.7, -0.90], [38.935, 0.081, 0]]);
const zT = spline([[T0C, -1.2 * (T0C - 28.746), -1.2], [36.104, -7.25], [36.6, -7.4], [38.935, SWP.rest.z - CH_Z + F_TOP / 743, 0]]);
const pT = spline([[T0C, 62, 0], [36.104, 55], [37.6, 70], [38.935, 90, 0]]);
const fT = spline([[T0C, 860, 0], [36.104, 700], [38.935, F_TOP, 0]]);
const cyT = spline([[T0C, 300, 0], [36.104, 400], [37.4, 470], [38.935, 540, 0]]);
export const camC = (t: number): TC => {
	if (t < 38.935) { const u = Math.min(38.935, t + 0.267 * sstep((t - 37.2) / 1.468)); return {x: xT(u), y: yT(u), z: zT(u), p: pT(u) * D, f: fT(u), cx: 960, cy: cyT(u), roll: 0}; }
	const K = Math.exp(lnK(t)), s = swordAt(t), xs = s.xp + aC(t) / 100, ys = s.y + wC(t) / 100;
	return {x: -xs, y: ys, z: s.z - CH_Z + F_TOP / K, p: 90 * D, f: F_TOP, cx: 960, cy: 540, roll: 0};
};
/** px per cm on the sword's plane in the plan regime */
export const planK = (t: number) => Math.exp(lnK(t)) / 100;
/** screen position of the sword's local point (a cm, w cm) on the sword plane (plan regime) */
export const planPos = (t: number, a: number, w: number): [number, number] => { const k = planK(t); return [960 + (aC(t) - a) * k, 540 + (wC(t) - w) * k]; };
/** sword-local a (cm) at the screen's x centre (plan regime) */
export const aCenter = (t: number) => aC(t);
