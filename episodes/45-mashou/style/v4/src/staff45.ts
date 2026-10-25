// ep45 H1b staff (gate 2b r2 note 2a): two museum staff walking the 文殊亭's centre leaves fully open, built on the FILM's own rig
// (45-mashou/film/src/figures.ts: fkPose + analytic arm IK `reach` + planted soles), so the still and the build share one body.
// Each figure: in profile facing his leaf, leaning into it (push stance: front knee bent, rear leg back, both soles on the floor),
// the near arm from the shoulder (top of the torso) to the leaf's free edge at chest height, the far arm to the same edge lower,
// mostly hidden behind the torso. Every rule is checked in body units and in screen px (staff_check.mjs prints the verdict).
import {fkPose, reach, rimmedSVG, toBody, handAt, soleOf, reachGap, BL, type Pose, type LookQ, type FK} from '../../../film/src/figures';

type P = [number, number];
export type StaffOpts = {x: number; ground: number; h: number; face: 1 | -1; edgeX: number; col?: string; rim?: string};
const LOOK: LookQ = {head: 'modern', dress: 'jacket', build: 1.02};   // 2020 museum staff: plain work jacket, short hair
const D = 180 / Math.PI;

/** one staff member: returns svg + the numbers the checker needs */
export const staff = (o: StaffOpts) => {
	const flip = o.face < 0, place = {x: o.x, ground: o.ground, h: o.h, flip};
	// push stance; pick the front-knee bend that puts BOTH soles on the floor line (R3)
	let best: {pose: Pose; fk: FK; err: number} | null = null;
	for (let lk = 10; lk <= 60; lk += 1) {
		const fk: FK = {hip: 0.6, lean: 13, neck: 2, lt: 20, lk, rt: -13, rk: 6, rf: 14, la: 30, le: 40, ra: 30, re: 40};   // r4: a shorter push stance (rear foot ~45 px back, not 80) so the two men's rear feet stay clear of each other and of the plinth
		const p = fkPose(fk), e = Math.abs(soleOf(p, 'L')[1] - soleOf(p, 'R')[1]);
		if (!best || e < best.err) best = {pose: p, fk, err: e};
	}
	let pose = best!.pose;
	// hands on the leaf's free edge (a vertical line at edgeX). r4 (gate 2b r3 n4): the man stands back from his leaf so the near
	// (pushing) arm reaches out, elbow bend ≤ 60°, forearm visible; each palm is a VERTICAL mitten (fingers up) flat on the edge,
	// the far hand just under the near one so it is hidden by / overlaps it (no folded hands, no flat discs at the chest).
	const sh = pose.LSh, chestY = sh[1] - 0.1, lowY = sh[1] - 0.118;
	const edgeB = toBody(place, [o.edgeX, 0])[0], PALM = 0.014;            // palm centre sits half a hand's thickness off the edge
	const tNear: P = [edgeB - PALM, chestY], tFar: P = [edgeB - PALM, lowY];
	pose = reach(reach(pose, 'L', tNear, {dir: 90}), 'R', tFar, {dir: 90});
	const svg = rimmedSVG({x: o.x, ground: o.ground, h: o.h, flip, pose, look: LOOK, col: o.col ?? '#140D0A', rim: o.rim ?? '#FFB070', rimOp: 0.55, rimDx: flip ? 2.6 : -2.6, rimDy: -1.2});
	// ---- numbers for the checks
	const scr = (b: P): P => [o.x + (flip ? -1 : 1) * b[0] * o.h, o.ground - b[1] * o.h];
	const handN = handAt({...place, pose}, 'L'), handF = handAt({...place, pose}, 'R');
	const elbow = (s: 'L' | 'R') => { const a = pose[`${s}Sh`], e = pose[`${s}Elb`], w = pose[`${s}Hand`]; const u = [a[0] - e[0], a[1] - e[1]], v = [w[0] - e[0], w[1] - e[1]];
		return 180 - Math.acos((u[0] * v[0] + u[1] * v[1]) / (Math.hypot(u[0], u[1]) * Math.hypot(v[0], v[1]))) * D; };   // 0 = straight
	const legStart = Math.hypot(pose.LUp[0] - pose.Hips[0], pose.LUp[1] - pose.Hips[1]);
	const feet = [scr(soleOf(pose, 'L')), scr(soleOf(pose, 'R'))];
	return {svg, pose, fk: best!.fk, checks: {
		R1_legs_at_hip_bu: legStart,                                           // ≤ 0.08 body units from the hip joint
		R2_elbow_deg: [elbow('L'), elbow('R')],                                // 0–150, natural side
		R2_knee_deg: [best!.fk.lk, best!.fk.rk], R2_lean_deg: best!.fk.lean,
		R3_soles_px: feet.map((f) => +(f[1] - o.ground).toFixed(2)),           // both on the floor (|·| ≤ 3 px)
		R5_hands_px: [Math.hypot(handN[0] - scr(tNear)[0], handN[1] - scr(tNear)[1]), Math.hypot(handF[0] - scr(tFar)[0], handF[1] - scr(tFar)[1])],   // ≤ 4 px
		R5_hands_on_edge_px: [Math.abs(handN[0] - o.edgeX), Math.abs(handF[0] - o.edgeX)],
		R6_reach_gap_bu: [reachGap(pose, 'L', tNear, {dir: 90}), reachGap(pose, 'R', tFar, {dir: 90})],
		push_elbow_deg: elbow('L'),                                            // r4: the pushing (near) arm reaches: bend ≤ 70°
		R7_chest_vs_feet_px: scr(pose.Neck1)[0] - (feet[0][0] + feet[1][0]) / 2,   // a push lean: chest ahead of the feet, hands on the leaf
		near_shoulder_at_torso_top: scr(pose.LSh), neck: scr(pose.Neck1), hands: [handN, handF],
	}};
};
(globalThis as any).STAFF45 = staff;
