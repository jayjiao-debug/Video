import {fkPose, Pose} from '../qq44/figure44';
/* ep47 body logic (figure-rules R1–R8 for the figure44 rig). Positions come FROM the body:
   standing poses are re-based so the lowest sole is on the ground (R3); seated poses give the seat height;
   props hang from hand joints (R8); every figure is registered in FIGS so scripts/check47.mjs can test it. */
type FK = Parameters<typeof fkPose>[0];
export const BUTT = 0.045;
export const jointAt = (pose: Pose, n: string, x: number, ground: number, h: number, flip = false): [number, number] => [x + (flip ? -1 : 1) * pose[n][0] * h, ground - pose[n][1] * h];
/** fk pose with the hip set so the lower sole touches y = 0 */
export const grounded = (k: Omit<FK, 'hip'>): Pose => { const p = fkPose({...k, hip: 1} as FK), low = Math.min(p.LToe[1], p.RToe[1]); return fkPose({...k, hip: 1 - low} as FK); };
export const seated = (k: Partial<FK> = {}): {pose: Pose; seat: number} => {
	const base: FK = {hip: 0.5, lean: 6, neck: 6, lt: 86, lk: 90, rt: 84, rk: 86, la: 10, le: 50, ra: 30, re: 60, ...k} as FK;
	const p = fkPose(base), low = Math.min(p.LToe[1], p.RToe[1]), q = fkPose({...base, hip: base.hip - low});
	return {pose: q, seat: q.Hips[1] - BUTT};
};
export type FigSpec = {frame: string; who: string; x: number; ground: number; h: number; pose: Pose; flip?: boolean;
	intent: 'stand' | 'walk' | 'sit'; seatY?: number};
export const FIGS: FigSpec[] = [];
export const reg = (f: FigSpec) => { FIGS.push(f); return f; };

/* ---------- walking: the mocap gait, re-grounded every frame; the body advances stride·h per cycle so feet don't slide ---------- */
import {gaitPose, gaitStride} from '../qq44/figure44';
export const STRIDE = gaitStride('08_04');
export const walkPose = (phase: number): Pose => { const p = gaitPose('08_04', phase), low = Math.min(p.LToe[1], p.RToe[1], p.LAnk[1] - 0.045, p.RAnk[1] - 0.045);
	const o: Pose = {}; for (const k of Object.keys(p)) o[k] = [p[k][0], p[k][1] - low]; return o; };
/** a walk from x0 to x1 over the interval [t0, t1] of local time u; returns x and the pose (stands still outside) */
export const walk = (u: number, t0: number, t1: number, x0: number, x1: number, h: number, still: Pose): {x: number; pose: Pose; moving: boolean} => {
	const k = Math.max(0, Math.min(1, (u - t0) / (t1 - t0))), x = x0 + (x1 - x0) * k, dist = Math.abs(x - x0);
	if (k <= 0 || k >= 1) return {x, pose: still, moving: false};
	return {x, pose: walkPose(dist / (STRIDE * h)), moving: true};
};
/** natural-speed walk: starts at x0 at local time t0, heading dir (+1 right / −1 left), stops at time t1 */
export const GAIT_S = 1.325;
export const walkNat = (u: number, t0: number, t1: number, x0: number, dir: 1 | -1, h: number, still: Pose) => {
	const v = STRIDE * h / GAIT_S, tt = Math.max(0, Math.min(t1, u) - t0), x = x0 + dir * v * tt;
	if (u <= t0 || u >= t1) return {x, pose: still, moving: false};
	return {x, pose: walkPose(v * tt / (STRIDE * h)), moving: true};
};
/* ---------- named poses for this film (all grounded) ---------- */
export const PZ = {
	stand: grounded({lean: 3, lt: 2, lk: 2, rt: -3, rk: 3, la: -3, le: 10, ra: 4, re: 14}),
	/** toss: near arm up and forward over the head, far arm down */
	toss: grounded({lean: -2, neck: -6, lt: 10, lk: 6, rt: -14, rk: 4, la: 115, le: 20, ra: -6, re: 12}),
	/** catch: both hands forward at chest height */
	catch_: grounded({lean: 8, neck: 4, lt: 6, lk: 8, rt: -8, rk: 6, la: 70, le: 40, ra: 62, re: 46}),
	/** offer: near arm forward at chest height, palm up; far arm relaxed */
	offer: grounded({lean: 6, neck: 6, lt: 4, lk: 4, rt: -6, rk: 5, la: 74, le: 22, ra: 6, re: 16}),
	/** offer with the OTHER (right) arm; left arm down at the side */
	offerR: grounded({lean: 6, neck: 6, lt: 4, lk: 4, rt: -6, rk: 5, ra: 74, re: 22, la: 6, le: 16}),
	/** hold up: near arm raised forward, holding something to eye level */
	holdUp: grounded({lean: 0, neck: -6, lt: 3, lk: 3, rt: -5, rk: 4, la: 110, le: 30, ra: 4, re: 14}),
	/** walk-ish stride (static) */
	stride: grounded({lean: 6, lt: 22, lk: 8, rt: -20, rk: 22, la: -18, le: 20, ra: 20, re: 24}),
	/** look up, hands at sides */
	lookUp: grounded({lean: -4, neck: -28, lt: 2, lk: 2, rt: -4, rk: 3, la: -4, le: 8, ra: 3, re: 10}),
	/** hold with both hands at chest (receiving / looking at something held) */
	holdChest: grounded({lean: 6, neck: 18, lt: 3, lk: 4, rt: -4, rk: 4, la: 40, le: 100, ra: 34, re: 104}),
	/** look up while holding something up in the near hand */
	lookUpHold: grounded({lean: -4, neck: -26, lt: 3, lk: 3, rt: -5, rk: 4, la: 120, le: 26, ra: 4, re: 14}),
	/** hold something forward at face height (showing it / looking at it) */
	showFace: grounded({lean: 2, neck: -4, lt: 3, lk: 3, rt: -5, rk: 4, la: 86, le: 26, ra: 4, re: 14}),
	/** near hand raised to the back of the head (to pull out a hairpin) */
	reachHead: grounded({lean: 4, neck: 10, lt: 3, lk: 3, rt: -5, rk: 4, la: 165, le: 95, ra: 4, re: 14}),
	/** phone held low at the chest, looking down at it */
	phoneLow: grounded({lean: 6, neck: 24, lt: 4, lk: 4, rt: -6, rk: 4, la: 28, le: 92, ra: 2, re: 12}),
	/** phone: near hand holds a phone in front of the face */
	phone: grounded({lean: 6, neck: 12, lt: 4, lk: 4, rt: -6, rk: 4, la: 24, le: 128, ra: 2, re: 12}),
};
