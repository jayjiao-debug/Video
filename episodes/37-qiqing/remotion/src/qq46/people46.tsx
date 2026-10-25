import React from 'react';
import {Figure4, Rimmed, fkPose, gaitPose, gaitStride, POSES, Pose, Look4} from '../qq44/figure44';
import {C} from './kit46';
/* ep46 cast (figure-rules R1–R8). Every person is placed FROM its body: standing/walking poses are re-based so the
   lowest sole is on the ground; hands that hold or touch something are solved by two-bone IK to a target point;
   every figure is registered in FIGS so scripts/check46.mjs can test the body logic on every sampled frame. */
export {POSES, gaitPose, gaitStride};
type FK = Parameters<typeof fkPose>[0];
type P2 = [number, number];
const D = Math.PI / 180;
/** fk pose with the hip raised/lowered so the lower sole touches y = 0 */
export const grounded = (k: FK): Pose => { const p = fkPose({...k, hip: 1}), low = Math.min(p.LToe[1], p.RToe[1]); return fkPose({...k, hip: 1 - low}); };
export const reground = (p: Pose): Pose => { const low = Math.min(p.LToe[1], p.RToe[1]); const o: Pose = {}; for (const n of Object.keys(p)) o[n] = [p[n][0], p[n][1] - low]; return o; };
const UPPER = 0.194, FORE = 0.135;
/** two-bone IK: arm angles (degrees, 0 = down, + = forward) so the hand reaches target (body units, y up) from the shoulder */
export const ikArm = (sh: P2, target: P2): {a: number; e: number; reach: number} => {
	const vx = target[0] - sh[0], vy = target[1] - sh[1], d0 = Math.hypot(vx, vy), d = Math.min(d0, (UPPER + FORE) * 0.985);
	const th = Math.atan2(vx, -vy) / D, al = Math.acos((UPPER * UPPER + d * d - FORE * FORE) / (2 * UPPER * d)) / D, be = Math.acos((UPPER * UPPER + FORE * FORE - d * d) / (2 * UPPER * FORE)) / D;
	return {a: th - al, e: 180 - be, reach: d0 / (UPPER + FORE)};
};
/** a standing pose whose right hand reaches `target` (body units relative to the feet origin, y up) */
export const reachPose = (base: FK, target: P2, hand: 'R' | 'L' = 'R'): Pose => {
	let p = grounded(base); const sh = p[hand === 'R' ? 'RSh' : 'LSh'];
	const {a, e} = ikArm(sh, target);
	p = grounded(hand === 'R' ? {...base, ra: a, re: e} : {...base, la: a, le: e});
	return p;
};

/* ---------- registry for the checker ---------- */
export type FigSpec = {who: string; t: number; x: number; ground: number; h: number; pose: Pose; flip?: boolean; intent: 'stand' | 'walk';
	hands?: {joint: 'LHand' | 'RHand'; at: P2; tol?: number}[]};
export const FIGS: FigSpec[] = [];
export const reg = (f: FigSpec) => { if (FIGS.length < 20000) FIGS.push(f); return f; };

export const LOOK: Record<string, Look4> = {
	emperor: {dress: 'robe', head: 'bald', sleeves: 'wide', beard: 'moustache'}, attendant: {dress: 'robe', head: 'bald'},
	soldier: {dress: 'coat', head: 'short', legs: 'trousers'}, soldier2: {dress: 'coat', head: 'short', legs: 'trousers', build: 1.05},
	vendor: {dress: 'jacket', head: 'bowl'}, buyer: {dress: 'robe', head: 'short'}, buyer2: {dress: 'dress', head: 'bob'},
	tourist: {dress: 'jacket', head: 'short'}, tourist2: {dress: 'dress', head: 'long'}, tourist3: {dress: 'shirt', head: 'cap'}, child: {dress: 'shirt', head: 'child', build: 0.9},
};
/** one person: draws the figure (one tone + warm rim) and registers it */
/** Qing court summer hat (凉帽): a wide low cone with a red fringe and a finial, drawn on the head (same head frame as the rig) */
/** Republican army cap: a flat crown wider than the head, a band, a short visor; plus a belt line at the waist */
const ArmyCap: React.FC<{x: number; ground: number; h: number; pose: Pose; flip?: boolean; col: string}> = ({x, ground, h, pose, flip, col}) => {
	const S = (n: string): P2 => [x + pose[n][0] * h, ground - pose[n][1] * h], n1 = S('Neck1'), hd = S('Head'), top = S('Top'), hips = S('Hips'), sp = S('Spine1');
	const ang = Math.atan2(top[1] - n1[1], top[0] - n1[0]) + Math.PI / 2, hc: P2 = [hd[0] + (top[0] - hd[0]) * 0.45, hd[1] + (top[1] - hd[1]) * 0.45], s = h * 0.93;
	const R = (px: number, py: number) => { const c = Math.cos(ang), sn = Math.sin(ang); return `${(hc[0] + px * s * c - py * s * sn).toFixed(1)},${(hc[1] + px * s * sn + py * s * c).toFixed(1)}`; };
	const wx = hips[0] + (sp[0] - hips[0]) * 0.35, wy = hips[1] + (sp[1] - hips[1]) * 0.35;
	return <g transform={flip ? `translate(${2 * x},0) scale(-1,1)` : undefined}>
		<path d={`M${R(-0.06, -0.035)} L${R(-0.075, -0.1)} L${R(0.07, -0.1)} L${R(0.058, -0.035)} Z`} fill={col} />
		<path d={`M${R(0.05, -0.035)} L${R(0.11, -0.022)} L${R(0.05, -0.02)} Z`} fill={col} />
		<path d={`M${R(-0.062, -0.05)} L${R(0.062, -0.05)}`} stroke="#6E6658" strokeWidth={h * 0.008} />
		<line x1={wx - h * 0.075} y1={wy} x2={wx + h * 0.075} y2={wy} stroke="#7A6A55" strokeWidth={h * 0.012} />
	</g>;
};
const QingHat: React.FC<{x: number; ground: number; h: number; pose: Pose; flip?: boolean; col: string}> = ({x, ground, h, pose, flip, col}) => {
	const S = (n: string): P2 => [x + pose[n][0] * h, ground - pose[n][1] * h], n1 = S('Neck1'), hd = S('Head'), top = S('Top');
	const ang = Math.atan2(top[1] - n1[1], top[0] - n1[0]) + Math.PI / 2, hc: P2 = [hd[0] + (top[0] - hd[0]) * 0.45, hd[1] + (top[1] - hd[1]) * 0.45], s = h * 0.93;
	const R = (px: number, py: number) => { const c = Math.cos(ang), sn = Math.sin(ang); return `${(hc[0] + px * s * c - py * s * sn).toFixed(1)},${(hc[1] + px * s * sn + py * s * c).toFixed(1)}`; };
	return <g transform={flip ? `translate(${2 * x},0) scale(-1,1)` : undefined}>
		<path d={`M${R(-0.095, -0.03)} Q${R(0, -0.05)} ${R(0.095, -0.03)} L${R(0.012, -0.112)} L${R(-0.012, -0.112)} Z`} fill={col} />
		<path d={`M${R(-0.07, -0.05)} L${R(0, -0.11)} L${R(0.07, -0.05)} Z`} fill="#9E3A2C" opacity={0.85} />
		<circle cx={Number(R(0, -0.124).split(',')[0])} cy={Number(R(0, -0.124).split(',')[1])} r={0.011 * s} fill="#C9A24A" />
	</g>;
};
export const Person: React.FC<{who: string; t: number; x: number; ground: number; h: number; pose: Pose; look: Look4; flip?: boolean; intent?: 'stand' | 'walk'; col?: string; rim?: string; rimOp?: number; o?: number; hat?: 'qing' | 'army';
	hands?: {joint: 'LHand' | 'RHand'; at: P2; tol?: number}[]}> = ({who, t, x, ground, h, pose, look, flip, intent = 'stand', col = C.fig, rim = C.figRim, rimOp = 0.5, o = 1, hands, hat}) => {
	reg({who, t, x, ground, h, pose, flip, intent, hands});
	return <g opacity={o}><ellipse cx={x} cy={ground + 1} rx={0.17 * h} ry={0.024 * h} fill="#2A2218" opacity={0.32} filter="url(#k3)" /><Rimmed x={x} ground={ground} h={h} pose={pose} look={look} col={col} flip={flip} T={t} rim={rim} rimOp={rimOp} />{hat === 'qing' && <QingHat x={x} ground={ground} h={h} pose={pose} flip={flip} col={col} />}{hat === 'army' && <ArmyCap x={x} ground={ground} h={h} pose={pose} flip={flip} col={col} />}</g>;
};
/** world position of a joint */
export const jointAt = (pose: Pose, n: string, x: number, ground: number, h: number, flip = false): P2 => [x + (flip ? -1 : 1) * pose[n][0] * h, ground - pose[n][1] * h];
/** walking person: x advances with the gait so feet don't skate */
export const walkAt = (x0: number, dir: 1 | -1, t: number, t0: number, h: number, g = '08_04', phase = 0): {x: number; pose: Pose} => {
	const stride = gaitStride(g), cyc = 1.1, u = Math.max(0, t - t0) / cyc + phase;
	return {x: x0 + dir * u * stride * h, pose: reground(gaitPose(g, u))};
};
export {Figure4};
