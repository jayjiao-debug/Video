// ep45 proof (drop): the two 正觉寺 staff on the film rig, with time states. push = the H1b push stance of staff45.ts (same
// numbers, so at walk = 0 the figure is identical to the approved still); walk = blend toward the mocap walk (08_04) at phase u,
// for "the staff step aside out of the light" (R2). The caller advances x by gaitStride * h per cycle so the feet do not slide.
import {fkPose, reach, rimmedSVG, toBody, soleOf, walkFor, gaitStride, mixPose, handAt, type Pose, type LookQ, type FK} from '../film/src/figures';

type P = [number, number];
const LOOK: LookQ = {head: 'modern', dress: 'jacket', build: 1.02};
let BEST: {pose: Pose; fk: FK} | null = null;
const stance = () => {
	if (BEST) return BEST;
	let best: {pose: Pose; fk: FK; err: number} | null = null;
	for (let lk = 10; lk <= 60; lk += 1) {
		const fk: FK = {hip: 0.6, lean: 13, neck: 2, lt: 20, lk, rt: -13, rk: 6, rf: 14, la: 30, le: 40, ra: 30, re: 40};
		const p = fkPose(fk), e = Math.abs(soleOf(p, 'L')[1] - soleOf(p, 'R')[1]);
		if (!best || e < best.err) best = {pose: p, fk, err: e};
	}
	BEST = {pose: best!.pose, fk: best!.fk}; return BEST;
};
export type StaffW = {x: number; ground: number; h: number; face: 1 | -1; edgeX: number; col?: string; rim?: string; walk?: number; u?: number; rimOp?: number};
export const staffW = (o: StaffW) => {
	const flip = o.face < 0, place = {x: o.x, ground: o.ground, h: o.h, flip};
	let pose = stance().pose;
	const sh = pose.LSh, chestY = sh[1] - 0.1, lowY = sh[1] - 0.118;
	const edgeB = toBody(place, [o.edgeX, 0])[0], PALM = 0.014;
	pose = reach(reach(pose, 'L', [edgeB - PALM, chestY], {dir: 90}), 'R', [edgeB - PALM, lowY], {dir: 90});
	const w = o.walk ?? 0;
	if (w > 0) pose = mixPose(pose, walkFor(LOOK, o.u ?? 0), w);
	const svg = rimmedSVG({x: o.x, ground: o.ground, h: o.h, flip, pose, look: LOOK, col: o.col ?? '#140D0A', rim: o.rim ?? '#FFB070', rimOp: o.rimOp ?? 0.55, rimDx: flip ? 2.6 : -2.6, rimDy: -1.2});
	const soles = [soleOf(pose, 'L'), soleOf(pose, 'R')].map((s) => o.ground - s[1] * o.h);
	return {svg, hands: [handAt({...place, pose}, 'L'), handAt({...place, pose}, 'R')], soles};
};
(globalThis as any).STAFFW = staffW;
(globalThis as any).STAFF_STRIDE = gaitStride('08_04', 1);

// ---- a general one-tone walker on the same rig (film): the 1860 soldiers, the looters, the 2013 staff. u = gait phase (cycles),
// the caller advances x by gaitStride * h per cycle; stand (0..1) blends to a standing pose; carry = arms around a load at the
// chest (carryArmful), reach = [x, y] screen target for the near hand (a lift). Returns svg + head centre/radius + the load point.
import {carryArmful, armfulAt, armsFrom, toScreen} from '../film/src/figures';
const LOOKS2: Record<string, LookQ> = {soldier: {head: 'short', dress: 'greatcoat', build: 1.06}, staff: {head: 'modern', dress: 'jacket', build: 1.0}, suit: {head: 'short', dress: 'jacket', build: 1.0}};
const STANDP = fkPose({hip: 0.655, lean: 3, lt: 2, lk: 2, rt: -3, rk: 3, la: -3, le: 10, ra: 4, re: 14});
export const walker = (o: {x: number; ground: number; h: number; face: 1 | -1; u?: number; look?: string; col?: string; rim?: string; rimOp?: number; stand?: number; carry?: number; reach?: [number, number] | null}) => {
	const flip = o.face < 0, look = LOOKS2[o.look ?? 'soldier'], place = {x: o.x, ground: o.ground, h: o.h, flip};
	let pose = walkFor(look, o.u ?? 0);
	if ((o.stand ?? 0) > 0) pose = mixPose(pose, STANDP, o.stand!);
	if ((o.carry ?? 0) > 0) pose = mixPose(pose, armsFrom(pose, carryArmful(pose)), o.carry!);
	if (o.reach) { const tb = toBody(place, o.reach); pose = reach(reach(pose, 'L', tb, {dir: 90}), 'R', [tb[0] - 0.02, tb[1] - 0.03], {dir: 90}); }
	const svg = rimmedSVG({x: o.x, ground: o.ground, h: o.h, flip, pose, look, col: o.col ?? '#140C09', rim: o.rim ?? '#FFB070', rimOp: o.rimOp ?? 0.45, rimDx: flip ? 2.4 : -2.4, rimDy: -1.2});
	const head = toScreen(place, pose.Head), top = toScreen(place, pose.Top), a = armfulAt(pose);
	return {svg, head, r: Math.hypot(top[0] - head[0], top[1] - head[1]) * 0.95, load: toScreen(place, a.c), loadR: a.r * o.h, soles: [soleOf(pose, 'L'), soleOf(pose, 'R')].map((s) => o.ground - s[1] * o.h)};
};
(globalThis as any).WALKER = walker;
