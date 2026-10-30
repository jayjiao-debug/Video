import {spline, sstep, sstep5} from './cam53';
/* ep53 v3 · TakeB3 camera, time maps and the sword's motion (20.821 → 38.935 film s), pure functions of t.
   One camera in the shaft world of tomb53 (metres: x right, y away, z up, ground z = 0, chamber floor z = −10.8):
   20.821 → 22.6   the dive (tomb53's morph, unchanged, so the first frame is v2 TakeB's / TakeA's hand-over)
   22.6   → 29.45  the 1965 dig: the fall slows over the snow, tilts to 62° and drops into the shaft mouth (it never hovers)
   29.45  → 33.839 the descent (peak ≈ 2.4 m/s, eased into the roof), ending on v2 TakeC's camera at 36.104 (value and slope)
   33.839 → 38.935 the chamber = v2 TakeC's chamber on a time map tau(t): tau = t + 2.2646 up to the top-down settle on DA(16)
                   36.670 (roof, lid ①, lid ②, settle all one bar early), then a faster fill bar (the hands come in, lift and
                   rinse the sheath, the draw starts at 38.322) that lands on v2 43.463 at 38.935 with slope 1, so the master's
                   switch to TakeC(t + 4.528) continues the same move.
   The sword in this chamber rests BESIDE the occupant on the occupant's LEFT (supine, head to screen right: their left is the
   screen-bottom / near side, chamber −y), hilt by the hip, guard level with the pelvis; the bronze knife lies between it and
   the shins. Chamber-local x' is mirrored as in cam53c (screen right = −x'). */
export type TC = {x: number; y: number; z: number; p: number; f: number; cx: number; cy: number; roll: number};
export const CH_Z = 10.8, B3_0 = 20.821, B3_1 = 38.935;
const D = Math.PI / 180;
export const F_TOP = 900;
/* ---------- the chamber's clock ---------- */
export const T_SET3 = 36.6704;                                  // DA(16): top-down over the inner coffin
/** one bar early (v2 − 2.2642) plus 0.2 frame, so each v2 event lands ON its v3 frame: roof f1015 (33.840), lid ① f1032 (34.406),
    lid ② f1066 (35.538), top-down f1100 (36.670) */
export const TAU_OFF = 2.2708;
const TAU_END = spline([[T_SET3, T_SET3 + TAU_OFF, 1], [38.322, 42.85], [B3_1, 43.463, 1]]);
/** v3 film time → v2 TakeC chamber time */
export const tau = (t: number) => (t <= T_SET3 ? t + TAU_OFF : t >= B3_1 ? t + 4.528 : TAU_END(t));
/* ---------- the sword (v2 chamber time u): rest beside the body, then the same carry as v2 ---------- */
/** rest: pommel end at x' = −0.04 (guard x' 0.06, level with the pelvis), axis y = −0.30 (the occupant's left, off the arm) */
export const SWP3 = {rest: {xp: -0.04, y: -0.30, z: 0.06}, carry: {xp: -0.28, y: 0.03, z: 0.30}};
export const T_LIFT: [number, number] = [41.199, 42.55];
export const T_DRAW0 = 42.85, T_DRAW = 43.463;
export const carry = (u: number) => sstep5((u - T_LIFT[0]) / (T_LIFT[1] - T_LIFT[0]));
export const swordAt3 = (u: number) => { const k = carry(u), r = SWP3.rest, c = SWP3.carry;
	return {xp: r.xp + (c.xp - r.xp) * k, y: r.y + (c.y - r.y) * k, z: r.z + (c.z - r.z) * k + 0.012 * Math.sin(u * 2.3) * k}; };
/* the coffins (chamber metres), centred on the occupant + sword (y = CYC); the reference set for both chamber scenes */
export const CYC = -0.055;
export const OUT3 = {x: 1.06, y: 0.47, z: 0.84, t: 0.06}, INN3 = {x: 0.9, y: 0.355, z: 0.7, t: 0.05};
/* ---------- the plan regime (as cam53c, sword-relative anchors): only the settle node differs (it frames the inner coffin,
   not the sword); from 39.9 the nodes are v2's, so from 40.5 on planPos/planK equal cam53c's (the inscr53c layers stay true) ---------- */
type Plan = {t: number; K: number; a: number; w: number; sx: number; sy: number};
const VIEW0 = {x: 0.05, y: -0.08};   // chamber point under the lens at the settle
const PLAN: Plan[] = [
	{t: 38.935, K: 743, a: (VIEW0.x - SWP3.rest.xp) * 100, w: (VIEW0.y - SWP3.rest.y) * 100, sx: 960, sy: 540},
	{t: 39.9, K: 1250, a: 34, w: -1.5, sx: 930, sy: 575},
	{t: 40.5, K: 1600, a: 28, w: 0, sx: 900, sy: 600},
	{t: 41.199, K: 1700, a: 28, w: 0, sx: 900, sy: 600},
	{t: 43.463, K: 2700, a: 4.6, w: 0, sx: 1610, sy: 650},
	{t: 47.4, K: 7600, a: 13.8, w: 0, sx: 960, sy: 640},
];
const lnK = spline(PLAN.map((p) => [p.t, Math.log(p.K), 0] as [number, number, number]));
const aC = spline(PLAN.map((p) => [p.t, p.a + (p.sx - 960) / (p.K / 100)] as [number, number]));
const wC = spline(PLAN.map((p) => [p.t, p.w + (p.sy - 540) / (p.K / 100)] as [number, number]));
/* the tilt over the coffin (v2 chamber time): cam53c's nodes, the end moved to VIEW0 */
const T0C = 33.274;
const xT = spline([[T0C, 0.12, 0], [36.104, 0.0], [38.935, -VIEW0.x, 0]]);
const yT = spline([[T0C, -0.95, 0], [36.104, -0.90], [36.7, -0.90], [38.935, VIEW0.y, 0]]);
const zT = spline([[T0C, -1.2 * (T0C - 28.746), -1.2], [36.104, -7.25], [36.6, -7.4], [38.935, SWP3.rest.z - CH_Z + F_TOP / 743, 0]]);
const pT = spline([[T0C, 62, 0], [36.104, 55], [37.6, 70], [38.935, 90, 0]]);
const fT = spline([[T0C, 860, 0], [36.104, 700], [38.935, F_TOP, 0]]);
const cyT = spline([[T0C, 300, 0], [36.104, 400], [37.4, 470], [38.935, 540, 0]]);
/** the chamber camera at v2 chamber time u (≥ 36.104) */
export const camU = (u: number): TC => {
	if (u < 38.935) { const v = Math.min(38.935, u + 0.267 * sstep((u - 37.2) / 1.468)); return {x: xT(v), y: yT(v), z: zT(v), p: pT(v) * D, f: fT(v), cx: 960, cy: cyT(v), roll: 0}; }
	const K = Math.exp(lnK(u)), s = swordAt3(u), xs = s.xp + aC(u) / 100, ys = s.y + wC(u) / 100;
	return {x: -xs, y: ys, z: s.z - CH_Z + F_TOP / K, p: 90 * D, f: F_TOP, cx: 960, cy: 540, roll: 0};
};
export const planK3 = (u: number) => Math.exp(lnK(u)) / 100;
export const planPos3 = (u: number, a: number, w: number): [number, number] => { const k = planK3(u); return [960 + (aC(u) - a) * k, 540 + (wC(u) - w) * k]; };
/* ---------- 20.821 → 33.839: the dive, the dig and the descent (v3 film time) ---------- */
export const DIVE_T = 20.821, T_M = 22.6, T_IN = 29.45;
/* the descent's end = v2 TakeC's camera at 36.104 (value) with its one-sided slope (tau' = 1 there) */
const R0 = camU(36.104), h = 0.002, R1 = camU(36.104 + h), sl = (k: keyof TC) => (R1[k] - R0[k]) / h;
const T_RF = 36.104 - TAU_OFF;   // 33.833
const CZ = spline([[DIVE_T, 12.4], [T_M, 11.5], [24.217, 9.5], [25.9, 6.9], [27.75, 3.2], [T_IN, 0, -2.3], [30.9, -3.45], [32.1, -6.0], [T_RF, R0.z, sl('z')]]);
const CYW = spline([[DIVE_T, 0, 0], [T_M, 0, 0], [24.217, -0.55], [25.9, -0.88], [T_IN, -0.95, 0], [T_RF, R0.y, sl('y')]]);
const CXW = spline([[DIVE_T, 0, 0], [T_M, 0, 0], [25.9, 0.07], [T_IN, 0.12, 0], [T_RF, R0.x, sl('x')]]);
const CP = spline([[DIVE_T, 90, 0], [T_M, 90, 0], [24.217, 77], [25.9, 64.5], [27.75, 62.3], [T_IN, 62, 0], [31.5, 61.5], [T_RF, R0.p / D, sl('p') / D]]);
const CF = spline([[DIVE_T, 1650, 0], [T_M, 1650, 0], [24.217, 1340], [25.9, 1050], [27.75, 895], [T_IN, 860, 0], [T_RF, R0.f, sl('f')]]);
const CCY = spline([[DIVE_T, 540, 0], [T_M, 540, 0], [24.217, 500], [25.9, 425], [27.75, 338], [T_IN, 300, 0], [T_RF, R0.cy, sl('cy')]]);
/** the one camera, v3 film time */
export const camB3 = (t: number): TC => t < T_RF ? {x: CXW(t), y: CYW(t), z: CZ(t), p: CP(t) * D, f: CF(t), cx: 960, cy: CCY(t), roll: 0} : camU(tau(t));
/** the depth the picture shows (m, for the overlay's tag): 0 until 29.9, then 2.4 m/s, 8.8 (the 椁 roof) at 33.57, 10.8 (the floor) at 34.4 */
export const DEPTH_B3 = {T0: 29.9, V: 2.4};
export const depthB3 = (t: number) => Math.min(10.8, Math.max(0, DEPTH_B3.V * (t - DEPTH_B3.T0)));
/** v3.1: the CAMERA's depth below ground (m, ≥ 0) at film time t — what the overlay's depth tag now reads from (0 above ground) */
export const camDepthB3 = (t: number) => Math.max(0, -camB3(t).z);
