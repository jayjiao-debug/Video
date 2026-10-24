import {fkPose, Pose} from '../qq44/figure44';
/* ep45 body logic (figure-rules R1–R8 for the figure44 rig). Positions come FROM the body:
   - standing/walking poses are re-based so the lowest sole is exactly on the ground (R3);
   - seated poses give the seat height under the hip (R3) and feet on the floor;
   - props are placed from hand joints (R8); every figure is registered in FIGS so check45.mjs can test it. */
type FK = Parameters<typeof fkPose>[0];
export const BUTT = 0.045;   // hip joint sits this far (body units) above the seat top
export const jointAt = (pose: Pose, n: string, x: number, ground: number, h: number, flip = false): [number, number] => [x + (flip ? -1 : 1) * pose[n][0] * h, ground - pose[n][1] * h];
/** fk pose with the hip raised/lowered so the lower sole touches y = 0 */
export const grounded = (k: Omit<FK, 'hip'>): Pose => { const p = fkPose({...k, hip: 1} as FK), low = Math.min(p.LToe[1], p.RToe[1]); return fkPose({...k, hip: 1 - low} as FK); };
/** a seated pose (thighs ~horizontal, shins down); returns the pose and the seat height (body units) */
export const seated = (k: Partial<FK> = {}): {pose: Pose; seat: number} => {
	const base: FK = {hip: 0.5, lean: 6, neck: 6, lt: 86, lk: 90, rt: 84, rk: 86, la: 10, le: 50, ra: 30, re: 60, ...k} as FK;
	const p = fkPose(base), low = Math.min(p.LToe[1], p.RToe[1]), q = fkPose({...base, hip: base.hip - low});
	return {pose: q, seat: q.Hips[1] - BUTT};
};
/* ---------- registry for the checker ---------- */
export type FigSpec = {frame: string; who: string; x: number; ground: number; h: number; pose: Pose; flip?: boolean;
	intent: 'stand' | 'walk' | 'sit'; seatY?: number; hands?: {joint: 'LHand' | 'RHand'; at: [number, number]; tol?: number}[]};
export const FIGS: FigSpec[] = [];
export const reg = (f: FigSpec) => { FIGS.push(f); return f; };
