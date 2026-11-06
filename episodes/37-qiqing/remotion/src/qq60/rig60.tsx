import React from 'react';
import {V, M, T, R, I, Sc, mul, chain, ap, rot, mx, sp, poly, Pt, PAL, Role, RAD, lv, lerp, tf} from './geo60';

/* ep60 god rig — ONE skeleton for every god (Anubis, Thoth, Osiris, Horus, Isis) and the deceased, in the Egyptian canon:
   profile head, frontal shoulders, profile legs; proportions on the 18/19-square grid (soles 0, knee 6, hip 9.5, shoulder 16, crown 19).
   Units: 1 = one grid square; figure faces +x, y down, soles on y = 0. `s` = px per unit on screen.
   Joints (degrees; limbs measured from straight down, + = forward / flexed):
     lean (torso about the hip), neck, head (+ = chin down),
     back arm bs/be/bw (shoulder, elbow, wrist), front arm fs/fe/fw,
     rear leg rt/rk/rf (thigh, knee, foot), advanced leg at/ak/af (feet auto-level when rf/af are omitted).
   Every bone has a real pivot (see PIVOTS); parts are drawn in their bone frame, so any pose deforms cleanly.
   Garments that span bones (kilt, robe, sheath, shroud) are rebuilt each frame from the bone frames.
   Secondary motion: `t` (s) drives lappets, streamers, bull tail, sash ends, flail strands and wing feathers on their own clocks;
   `vel` (head / torso angular velocity, deg/s) makes hanging parts lag behind a turn (follow-through). */

export const BONE = {hipY: 0.15, thigh: 3.4, shin: 5.0, ank: 0.72, spine: 6.55, neck: 1.12, headK: 1.13, shX: 2.75, shXF: 2.4, shY: -6.15, upper: 3.85, fore: 3.3, hand: 1.5};
export type Pose = {
	lean: number; neck: number; head: number;
	bs: number; be: number; bw: number; fs: number; fe: number; fw: number;
	rt: number; rk: number; rf?: number; at: number; ak: number; af?: number;
	/** pelvis height override (units above the ground, negative y); grounded on soles/knees when omitted */
	y?: number; dx?: number;
};
export type Rig = {root: M; torso: M; neck: M; head: M; bU: M; bF: M; bH: M; fU: M; fF: M; fH: M; rT: M; rS: M; rF: M; aT: M; aS: M; aF: M};

/* ---------------- body types (ep61+, owner 2026-11-06: "female more feminine, male more masculine") ----------------
   Egyptian canon draws the sexes very distinctly. A cast's optional `body` ('f' | 'm') switches the figure to a sexed body type;
   without it (every ep60 cast) the figure is the ep60 drawing, number for number. The body type lives in the skeleton, so poses, IK,
   grips, the dress and every helper that calls solve() agree:
     k      whole-figure height (root scale; 'f' 0.94 × the gods)          shX    shoulder pivot half-width (f ≈ 80 % of the male width)
     neck   neck bone length ('f' long and slender)                          hand / foot   size of hands and feet (bone-frame scale)
     stride the gap between the legs in standing / walking poses (lunges, kneeling and sitting poses are left alone) */
export type Body = 'f' | 'm';
/** what solve() and the IK helpers take as their body argument: the ep60 `female` flag, or an ep61 body type */
export type BodyArg = boolean | Body | undefined;
export type BodySpec = {k: number; shX: number; neck: number; hand: number; foot: number; stride: number};
export const BODY: Record<Body, BodySpec> = {
	m: {k: 1, shX: 3.0, neck: 1.12, hand: 1, foot: 1, stride: 1.18},
	f: {k: 0.94, shX: 2.52, neck: 1.34, hand: 0.86, foot: 0.86, stride: 0.7},
};
export const bodySpec = (b: BodyArg): BodySpec | undefined => (typeof b === 'string' ? BODY[b] : undefined);
/** the body argument of a cast: its body type, else the ep60 female flag */
export const castBody = (c: Cast): BodyArg => c.body ?? c.female;
/** standing / walking poses: scale the stride (thigh spread about its mean); fades out above 30° so lunges, kneels and seats keep their angles */
const strideK = (p: Pose, k: number): Pose => {
	const big = Math.max(Math.abs(p.rt), Math.abs(p.at)), w = Math.max(0, Math.min(1, (45 - big) / 15));
	if (k === 1 || w === 0) return p;
	const m = (p.rt + p.at) / 2, h = ((p.at - p.rt) / 2) * (1 + (k - 1) * w);
	return {...p, rt: m - h, at: m + h};
};
const build = (p: Pose, female: BodyArg, rootY: number): Rig => {
	const B = bodySpec(female);
	if (B) p = strideK(p, B.stride);
	const sx = B ? B.shX : female ? BONE.shXF : BONE.shX, nk = B ? B.neck : BONE.neck;
	const root = B && B.k !== 1 ? mul(T(p.dx ?? 0, rootY), Sc(B.k)) : T(p.dx ?? 0, rootY), torso = mul(root, R(p.lean));
	const neck = chain(torso, T(0.22, -BONE.spine), R(p.neck)), head = chain(neck, T(0.1, -nk), R(p.head), [BONE.headK, 0, 0, BONE.headK, 0, 0]);
	const arm = (side: number, s: number, e: number, w: number): [M, M, M] => {
		const U = chain(torso, T(side * sx, BONE.shY), R(-s)), F = chain(U, T(0, BONE.upper), R(-e)), H = chain(F, T(0, BONE.fore), R(-w));
		return [U, F, B && B.hand !== 1 ? mul(H, Sc(B.hand)) : H]; };
	const leg = (t: number, k: number, f: number | undefined, x: number): [M, M, M] => {
		const Th = chain(root, T(x, BONE.hipY), R(-t)), Sh = chain(Th, T(0, BONE.thigh), R(k));
		const ang = f === undefined ? rot(Sh) : f, Ft = chain(Sh, T(0, BONE.shin), R(-ang));
		return [Th, Sh, B && B.foot !== 1 ? mul(Ft, Sc(B.foot)) : Ft]; };
	const [bU, bF, bH] = arm(-1, p.bs, p.be, p.bw), [fU, fF, fH] = arm(1, p.fs, p.fe, p.fw);
	const [rT, rS, rF] = leg(p.rt, p.rk, p.rf, -0.12), [aT, aS, aF] = leg(p.at, p.ak, p.af, 0.15);
	return {root, torso, neck, head, bU, bF, bH, fU, fF, fH, rT, rS, rF, aT, aS, aF};
};
/** lowest contact (soles, toes, knee caps) */
const contactY = (g: Rig, kk = 1) => Math.max(...[g.rF, g.aF].flatMap((f) => [ap(f, [-0.6, BONE.ank])[1], ap(f, [2.25, BONE.ank])[1], ap(f, [1.2, BONE.ank])[1]]), ap(g.rS, [0, 0])[1] + 0.62 * kk, ap(g.aS, [0, 0])[1] + 0.62 * kk);
/** forward kinematics: every bone frame, grounded so the lowest contact sits on y = 0 */
export const solve = (p: Pose, female: BodyArg = false): Rig => {
	if (p.y !== undefined) return build(p, female, -p.y);
	const g = build(p, female, 0); return build(p, female, -contactY(g, bodySpec(female)?.k ?? 1));
};
/** 2-bone IK: angles for one arm so its wrist reaches `target` (figure units). bend = 1 elbow down/back (natural) */
export const reach = (p: Pose, side: 'b' | 'f', target: V, female: BodyArg = false, bend = 1): Pose => {
	const kk = bodySpec(female)?.k ?? 1, g = solve(p, female), sh = ap(side === 'b' ? g.bU : g.fU, [0, 0]), l1 = BONE.upper * kk, l2 = BONE.fore * kk;
	const dx = target[0] - sh[0], dy = target[1] - sh[1], d = Math.max(Math.abs(l1 - l2) + 0.01, Math.min(l1 + l2 - 0.01, Math.hypot(dx, dy)));
	const phi = Math.atan2(dx, dy) / RAD, a = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)) / RAD;
	const u = phi - a * bend, E: V = [sh[0] + l1 * Math.sin(u * RAD), sh[1] + l1 * Math.cos(u * RAD)];
	const v = Math.atan2(target[0] - E[0], target[1] - E[1]) / RAD;
	const s = u + p.lean, e = v - u;
	return side === 'b' ? {...p, bs: s, be: e} : {...p, fs: s, fe: e};
};
/** IK with the target given in the torso frame (e.g. a hand on the chest) */
export const holdAt = (p: Pose, side: 'b' | 'f', local: V, female: BodyArg = false, bend = 1): Pose => reach(p, side, ap(solve(p, female).torso, local), female, bend);
/** aim the hand: world angle of the hand bone (from straight down, + = forward; 90 = pointing forward, 180 = up) */
/** put the reed-pen tip at `tip` (figure units) with the hand aimed at world angle A */
export const penReach = (p: Pose, tip: V, A: number, female: BodyArg = false): Pose => {
	const th = -A * RAD, o: V = [PEN_TIP[0] * Math.cos(th) - PEN_TIP[1] * Math.sin(th), PEN_TIP[0] * Math.sin(th) + PEN_TIP[1] * Math.cos(th)];
	return wristTo(reach(p, 'f', [tip[0] - o[0], tip[1] - o[1]], female), 'f', A);
};
export const wristTo = (p: Pose, side: 'b' | 'f', a: number): Pose => (side === 'b' ? {...p, bw: a - (p.bs - p.lean + p.be)} : {...p, fw: a - (p.fs - p.lean + p.fe)});
/** the rig's pivots in figure units (for the rig sheet) */
export const PIVOTS = (g: Rig) => ({
	hip: ap(g.root, [0, 0]), neck: ap(g.neck, [0, 0]), head: ap(g.head, [0, 0]),
	bShoulder: ap(g.bU, [0, 0]), bElbow: ap(g.bF, [0, 0]), bWrist: ap(g.bH, [0, 0]),
	fShoulder: ap(g.fU, [0, 0]), fElbow: ap(g.fF, [0, 0]), fWrist: ap(g.fH, [0, 0]),
	rHip: ap(g.rT, [0, 0]), rKnee: ap(g.rS, [0, 0]), rAnkle: ap(g.rF, [0, 0]),
	aHip: ap(g.aT, [0, 0]), aKnee: ap(g.aS, [0, 0]), aAnkle: ap(g.aF, [0, 0]),
});
export const lerpPose = (a: Pose, b: Pose, u: number): Pose => {
	const o: Record<string, number | undefined> = {};
	for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) { const x = (a as Record<string, number | undefined>)[k], y = (b as Record<string, number | undefined>)[k]; o[k] = x === undefined || y === undefined ? (x ?? y) : lerp(x, y, u); }
	return o as unknown as Pose; };

/* ---------------- poses ---------------- */
export const POSES = {
	/** canon standing stride: back hand low (ankh), front hand forward on a staff */
	rest: {lean: 0, neck: 0, head: 0, bs: -3, be: 6, bw: 0, fs: 14, fe: 34, fw: -8, rt: -9, rk: 4, at: 13, ak: 2} as Pose,
	/** Anubis kneeling on one knee at the balance */
	kneel: {lean: 4, neck: 2, head: -6, bs: 22, be: 62, bw: 6, fs: 70, fe: 46, fw: -30, rt: -2, rk: 104, rf: 66, at: 84, ak: 92} as Pose,
	/** Thoth writing: palette held forward in the back hand, reed pen in the front hand */
	write: {lean: 3, neck: 4, head: 10, bs: 50, be: 52, bw: -10, fs: 30, fe: 92, fw: 10, rt: -7, rk: 3, at: 11, ak: 2} as Pose,
	/** Osiris enthroned (mummiform): hands at the chest with crook and flail */
	throne: {lean: -2, neck: 0, head: 0, bs: 16, be: 118, bw: -12, fs: -4, fe: 128, fw: -20, rt: 88, rk: 90, at: 88, ak: 90, y: 5.15} as Pose,
	/** standing mummiform (rest of Osiris on the sheet) */
	mummy: {lean: 0, neck: 0, head: 0, bs: 16, be: 118, bw: -12, fs: -4, fe: 128, fw: -20, rt: 0, rk: 0, at: 2, ak: 0} as Pose,
	/** winged Isis spreading her wings: front arm high, back arm low */
	protect: {lean: 2, neck: 0, head: 0, bs: 64, be: 8, bw: -18, fs: 112, fe: 6, fw: -20, rt: -5, rk: 2, at: 8, ak: 1} as Pose,
	/** the deceased bowing, hands raised in adoration */
	adore: {lean: 7, neck: 2, head: 2, bs: 58, be: 40, bw: -62, fs: 72, fe: 36, fw: -64, rt: -8, rk: 4, at: 11, ak: 2} as Pose,
	/** walking (leading / being led) */
	walk: {lean: 2, neck: 0, head: 0, bs: -24, be: 10, bw: 0, fs: 26, fe: 20, fw: -8, rt: -16, rk: 10, at: 18, ak: 4} as Pose,
};

/* ---------------- the cast ---------------- */
export type HeadKind = 'human' | 'jackal' | 'ibis' | 'falcon';
export type Crown = 'none' | 'atef' | 'pschent' | 'moon' | 'isis' | 'maat' | 'cone' | 'sun';
export type Hand = 'open' | 'fist' | 'palm';
export type PropKind = 'none' | 'ankh' | 'was' | 'palette' | 'pen' | 'crook' | 'flail' | 'sickle' | 'sistrum' | 'hoe' | 'knife' | 'stalks' | 'menat';
export type Cast = {
	name: string; skin: Role; skin2: Role; head: HeadKind; headFill?: Role; headFill2?: Role;
	wig: 'tri' | 'duplex' | 'none'; crown: Crown; dress: 'kilt' | 'robe' | 'sheath' | 'mummy' | 'gown' | 'longkilt';
	/** ep60 4:3 cast: wig colour override, a jackal mask edge (priest), kilt without the royal apron */
	wigColor?: Role; mask?: boolean; apron?: boolean;
	/** ep61 lioness roar: skip the bare human face under an overlaid head */ faceless?: boolean; female?: boolean; beard?: boolean; wings?: boolean; tail?: boolean; collar?: 'god' | 'plain';
	bHand?: Hand; fHand?: Hand; bProp?: PropKind; fProp?: PropKind;
	/** ep61 body type (see BODY): 'f' = the goddess body (narrow shoulders, slim limbs, small hands / feet, long neck, waist and hip,
	 *  ankle-length kalasiris over the bust with straps, deep collar, long lappets, short stride, 0.94 tall); 'm' = the god body (broad
	 *  shoulders, pectorals, deltoids and biceps, thick neck, V torso, sturdy calves, long stride). Undefined = the ep60 drawing. */
	body?: Body;
	/** body 'f': the dress colour (default red) and whether it carries the gold bead-net (default true) */
	dressCol?: Role | string; net?: boolean;
};
export const CAST: Record<'anubis' | 'thoth' | 'osiris' | 'horus' | 'isis' | 'ani', Cast> = {
	anubis: {name: 'Anubis', skin: 'skinM', skin2: 'skinM2', head: 'jackal', headFill: 'jackal', headFill2: 'jackal2', wig: 'tri', crown: 'none', dress: 'kilt', tail: true, collar: 'god', bHand: 'fist', fHand: 'fist', bProp: 'ankh', fProp: 'was'},
	thoth: {name: 'Thoth', skin: 'skinM', skin2: 'skinM2', head: 'ibis', headFill: 'ibis', headFill2: 'ibis2', wig: 'tri', crown: 'moon', dress: 'kilt', tail: true, collar: 'god', bHand: 'fist', fHand: 'fist', bProp: 'ankh', fProp: 'was'},
	osiris: {name: 'Osiris', skin: 'skinO', skin2: 'skinO2', head: 'human', wig: 'none', crown: 'atef', dress: 'mummy', beard: true, collar: 'god', bHand: 'fist', fHand: 'fist', bProp: 'flail', fProp: 'crook'},
	horus: {name: 'Horus', skin: 'skinM', skin2: 'skinM2', head: 'falcon', headFill: 'falcon', headFill2: 'falcon2', wig: 'tri', crown: 'pschent', dress: 'kilt', tail: true, collar: 'god', bHand: 'fist', fHand: 'fist', bProp: 'ankh', fProp: 'was'},
	isis: {name: 'Isis', skin: 'skinF', skin2: 'gold2', head: 'human', wig: 'tri', crown: 'isis', dress: 'sheath', female: true, wings: true, collar: 'god', bHand: 'open', fHand: 'open'},
	ani: {name: 'Ani', skin: 'skinM', skin2: 'skinM2', head: 'human', wig: 'duplex', crown: 'none', dress: 'robe', collar: 'plain', bHand: 'palm', fHand: 'palm'},
};

/* ---------------- part shapes (bone frames, units) ---------------- */
const limb = (len: number, r0: number, r1: number, fb = 0, bb = 0, mid = 0.42): Pt[] => [
	[0, -r0], [r0 * 0.74, -r0 * 0.7], [r0, 0.05], [(r0 + r1) / 2 + fb, len * mid], [r1, len], [r1 * 0.72, len + r1 * 0.7], [0, len + r1],
	[-r1 * 0.72, len + r1 * 0.7], [-r1, len], [-(r0 + r1) / 2 - bb, len * mid], [-r0, 0.05], [-r0 * 0.74, -r0 * 0.7]];
const SH = {
	thigh: sp(limb(BONE.thigh, 0.98, 0.6, 0.14, 0.02)),
	shin: sp([[0, -0.6], [0.42, -0.45], [0.6, 0.05], [0.52, 1.4], [0.38, 3.2], [0.3, 4.6], [0.32, 5.05], [0, 5.3], [-0.34, 5.05], [-0.38, 4.5], [-0.52, 3.3], [-0.8, 1.7], [-0.72, 0.5], [-0.45, -0.4]]),
	foot: sp([[-0.38, -0.12], [0.3, -0.15], [0.62, 0.14], [1.35, 0.36], [2.05, 0.47], [2.3, 0.58], [2.26, 0.73, 1], [-0.5, 0.73, 1], [-0.68, 0.5], [-0.62, 0.1]]),
	upper: sp(limb(BONE.upper, 0.7, 0.48, 0.1, 0.06)),
	fore: sp(limb(BONE.fore, 0.5, 0.32, 0.08, 0.03, 0.35)),
	torsoM: sp([[-1.28, 0.6], [-1.2, -0.7], [-0.98, -2.05], [-1.18, -3.3], [-1.75, -4.55], [-2.55, -5.3], [-3.3, -5.75], [-3.3, -6.45], [-2.7, -6.86], [-1.6, -6.92], [-0.6, -6.98], [0.75, -6.98], [1.9, -6.92], [2.85, -6.86], [3.45, -6.45], [3.4, -5.75], [2.65, -5.25], [1.85, -4.85], [1.62, -4.2], [1.58, -3.55], [1.2, -2.9], [0.9, -2.05], [1.05, -0.9], [1.2, 0.6]]),
	torsoF: sp([[-1.35, 0.6], [-1.2, -0.8], [-0.92, -2.1], [-1.05, -3.4], [-1.55, -4.6], [-2.25, -5.3], [-2.95, -5.75], [-2.95, -6.4], [-2.4, -6.78], [-1.5, -6.86], [-0.5, -6.92], [0.7, -6.92], [1.75, -6.86], [2.55, -6.78], [3.08, -6.4], [3.05, -5.75], [2.35, -5.3], [1.6, -4.95], [1.55, -4.5], [1.95, -3.95], [1.85, -3.5], [1.2, -3.25], [0.85, -2.1], [1.05, -0.9], [1.25, 0.6]]),
	neck: sp([[-0.55, 0.6, 1], [-0.5, -0.4], [-0.46, -1.45], [0.55, -1.5], [0.62, -0.3], [0.7, 0.6, 1]]),
	human: sp([[0.52, 0.12], [0.92, 0.1], [1.18, -0.05], [1.27, -0.3], [1.33, -0.42], [1.27, -0.5], [1.36, -0.6], [1.31, -0.74], [1.56, -0.86], [1.5, -0.98], [1.38, -1.24], [1.34, -1.42], [1.32, -1.62], [1.18, -2.02], [0.62, -2.42], [-0.18, -2.5], [-0.82, -2.12], [-1.0, -1.35], [-0.72, -0.5], [-0.5, 0.14]], true, 0.16),
	jackal: sp([[0.5, 0.15], [1.2, 0.02], [1.95, -0.25], [2.55, -0.5], [2.84, -0.6], [2.92, -0.78], [2.78, -0.93], [2.3, -1.05], [1.72, -1.22], [1.32, -1.5], [1.02, -1.84], [0.84, -2.08], [0.58, -3.1], [0.36, -4.15, 1], [0.08, -3.0], [-0.26, -2.12], [-0.72, -1.62], [-0.84, -0.9], [-0.62, -0.2], [-0.48, 0.15]], true, 0.16),
	jackalEar: sp([[0.62, -2.3], [0.42, -3.75, 1], [0.12, -2.4]], true, 0.12),
	ibis: sp([[0.45, 0.12], [0.72, -0.35], [0.95, -0.72], [1.25, -0.9], [1.85, -0.82], [2.5, -0.6], [3.05, -0.28], [3.38, 0.02], [3.46, 0.2, 1], [3.24, 0.08], [2.85, -0.26], [2.25, -0.62], [1.65, -0.94], [1.2, -1.16], [1.0, -1.46], [0.62, -1.88], [0.02, -1.98], [-0.55, -1.65], [-0.72, -0.9], [-0.58, -0.2], [-0.45, 0.12]], true, 0.16),
	ibisBeak: sp([[1.05, -0.86], [1.25, -0.9], [1.85, -0.82], [2.5, -0.6], [3.05, -0.28], [3.38, 0.02], [3.46, 0.2, 1], [3.24, 0.08], [2.85, -0.26], [2.25, -0.62], [1.65, -0.94], [1.2, -1.16], [1.0, -1.12]], true, 0.16),
	falcon: sp([[0.5, 0.15], [0.98, -0.12], [1.22, -0.52], [1.45, -0.72], [1.7, -0.62], [1.77, -0.48, 1], [1.88, -0.78], [1.76, -1.06], [1.52, -1.24], [1.3, -1.4], [1.05, -1.8], [0.4, -2.06], [-0.35, -1.98], [-0.8, -1.55], [-0.86, -0.85], [-0.62, -0.2], [-0.48, 0.15]], true, 0.16),
	falconBeak: sp([[1.28, -0.66], [1.45, -0.72], [1.7, -0.62], [1.77, -0.48, 1], [1.88, -0.78], [1.76, -1.06], [1.52, -1.24], [1.36, -1.12], [1.3, -0.9]], true, 0.16),
	wigTri: sp([[0.74, -1.62], [0.92, -2.12], [0.55, -2.64], [-0.2, -2.8], [-0.95, -2.47], [-1.42, -1.6], [-1.58, -0.3], [-1.58, 1.1], [-1.42, 1.9, 1], [-0.12, 1.9, 1], [-0.02, 0.4], [0.25, -0.6], [0.44, -1.2]]),
	wigTriAnimal: sp([[-0.25, -2.0], [-0.95, -2.0], [-1.32, -1.4], [-1.42, -0.3], [-1.42, 1.0], [-1.3, 1.75, 1], [-0.25, 1.75, 1], [-0.15, 0.4], [0.05, -0.6], [0.15, -1.3], [0.05, -1.85]]),
	wigDuplex: sp([[1.14, -1.66], [1.22, -2.15], [0.82, -2.7], [-0.1, -2.92], [-0.98, -2.56], [-1.48, -1.6], [-1.62, -0.2], [-1.5, 1.05], [-0.85, 1.32], [0.15, 1.2], [0.8, 1.05, 1], [0.62, 0.0], [0.5, -0.6], [0.62, -1.25], [0.92, -1.55]]),
	lappet: sp([[-0.4, 0, 1], [0.4, 0, 1], [0.44, 1.8], [0.52, 3.35, 1], [-0.32, 3.35, 1], [-0.42, 1.8]]),
	hedjet: sp([[-0.78, -1.72, 1], [-0.86, -2.6], [-0.7, -3.6], [-0.46, -4.7], [-0.22, -5.5], [0.04, -5.86], [0.28, -5.9], [0.52, -5.58], [0.74, -4.7], [0.96, -3.5], [1.12, -2.55], [1.16, -1.8, 1]]),
	plume: sp([[0, 0, 1], [-0.42, -0.6], [-0.62, -1.9], [-0.7, -3.2], [-0.82, -4.0], [-1.18, -4.3], [-1.42, -4.08], [-1.24, -3.75], [-1.08, -3.0], [-1.05, -1.8], [-0.88, -0.45], [-0.5, 0.05, 1]]),
	horns: sp([[-2.0, -1.78, 1], [-1.35, -2.1], [-0.45, -1.92], [0.5, -2.12], [1.5, -1.95], [2.3, -2.28], [2.56, -2.12, 1], [1.72, -1.72], [0.6, -1.86], [-0.42, -1.68], [-1.3, -1.86]], true, 0.2),
	uraeus: sp([[1.02, -1.95], [1.1, -2.62], [1.34, -2.98], [1.62, -2.88], [1.58, -2.62], [1.38, -2.58], [1.32, -2.2], [1.4, -1.92]]),
	redBack: sp([[-1.0, -1.68, 1], [-1.0, -4.75, 1], [-0.46, -4.8, 1], [-0.42, -2.6], [-0.2, -1.7, 1]]),
	redBase: sp([[-1.0, -1.66, 1], [-1.0, -2.95, 1], [-0.1, -3.02, 1], [1.1, -2.88, 1], [1.2, -1.72, 1]]),
	whiteCrown: sp([[-0.45, -2.9, 1], [-0.5, -3.6], [-0.3, -4.6], [-0.02, -5.25], [0.22, -5.32], [0.45, -4.95], [0.64, -4.0], [0.8, -2.95, 1]]),
	modius: poly([[-0.75, -2.55], [-0.75, -3.12], [1.0, -3.12], [1.0, -2.55]]),
	vulture: sp([[1.08, -1.66], [0.82, -2.42], [0.0, -2.66], [-0.92, -2.36], [-1.38, -1.3], [-1.48, 0.25], [-0.86, 0.5], [-0.32, -0.42], [0.34, -1.32]]),
	vultureHead: sp([[1.0, -1.62], [1.18, -1.92], [1.48, -1.98], [1.72, -1.84], [1.76, -1.66, 1], [1.5, -1.62], [1.3, -1.5]]),
	hornL: sp([[0.0, -3.12], [-0.85, -3.4], [-1.22, -4.2], [-1.06, -5.15], [-0.78, -5.62, 1], [-0.9, -5.08], [-0.98, -4.25], [-0.66, -3.62], [0.02, -3.36]]),
	hornR: sp([[0.25, -3.12], [1.1, -3.4], [1.47, -4.2], [1.31, -5.15], [1.03, -5.62, 1], [1.15, -5.08], [1.23, -4.25], [0.91, -3.62], [0.23, -3.36]]),
	beard: sp([[1.02, -0.12, 1], [1.24, -0.06], [1.32, 0.5], [1.4, 1.05], [1.6, 1.18], [1.62, 1.36], [1.36, 1.38], [1.18, 1.2], [1.08, 0.5]]),
	// hands: wrist at 0, fingers along +y, thumb on +x (front)
	// (ep60 v3, owner 17:07: "hands like their sculpture"): long flat fingers held together and a separate thumb; the fist a squared
	// grip, curled fingers under the thumb (finger lines in HAND_LINES), no nails
	open: sp([[-0.34, -0.12], [0.32, -0.12], [0.42, 0.16], [0.62, 0.4], [0.74, 0.66], [0.72, 0.84], [0.58, 0.84], [0.42, 0.64], [0.41, 1.06], [0.39, 1.48], [0.3, 1.64, 1], [0.04, 1.71], [-0.22, 1.64, 1], [-0.37, 1.3], [-0.42, 0.6]], true, 0.14),
	fist: sp([[-0.36, -0.12], [0.33, -0.12], [0.43, 0.1], [0.6, 0.3], [0.67, 0.55], [0.56, 0.74], [0.52, 0.95], [0.34, 1.1, 1], [-0.22, 1.13], [-0.45, 0.99, 1], [-0.49, 0.56], [-0.43, 0.15]], true, 0.15),
	palm: sp([[-0.34, -0.12], [0.32, -0.12], [0.42, 0.16], [0.64, 0.38], [0.73, 0.64], [0.66, 0.79], [0.52, 0.78], [0.43, 0.62], [0.42, 1.06], [0.39, 1.48], [0.3, 1.63, 1], [0.04, 1.69], [-0.22, 1.62, 1], [-0.37, 1.26], [-0.42, 0.6]], true, 0.14),
};
export const SHAPES = SH;
/** the sexed body shapes (body types 'm' / 'f'; bone frames, units). Joint ends match their neighbours (upper r1 ≈ fore r0, thigh r1 ≈
 *  shin top), so the shared ink pass keeps every joint seamless at any angle. band = half-widths of the arm band, bracelet and anklet. */
export type BodyShapes = {torso: string; neck: string; upper: string; fore: string; thigh: string; shin: string; band: {u: number; f: number; a: number}};
export const BSH: Record<Body, BodyShapes> = {
	/** the god: broad shoulders (±3.75), pectorals over a narrow waist (V torso), deltoid cap + biceps, thick short neck, sturdy calves */
	m: {
		torso: sp([[-1.3, 0.6], [-1.2, -0.7], [-0.88, -2.15], [-1.22, -3.3], [-1.85, -4.6], [-2.8, -5.3], [-3.66, -5.72], [-3.74, -6.45], [-3.08, -6.9], [-1.75, -6.98], [-0.6, -7.02], [0.75, -7.02], [2.0, -6.98], [3.28, -6.9], [3.88, -6.45], [3.78, -5.72], [2.95, -5.2], [2.15, -4.85], [2.0, -4.25], [1.86, -3.6], [1.22, -3.1], [0.84, -2.15], [1.05, -0.9], [1.2, 0.6]]),
		neck: sp([[-0.64, 0.6, 1], [-0.6, -0.4], [-0.55, -1.38], [0.6, -1.44], [0.7, -0.3], [0.82, 0.6, 1]]),
		upper: sp([[0, -0.86], [0.62, -0.64], [0.86, 0.0], [0.9, 0.75], [0.72, 1.5], [0.8, 2.25], [0.66, 3.2], [0.55, 3.85], [0.4, 4.25], [0, 4.4], [-0.4, 4.25], [-0.55, 3.85], [-0.66, 3.1], [-0.78, 2.1], [-0.86, 1.0], [-0.88, 0.0], [-0.62, -0.64]]),
		fore: sp(limb(BONE.fore, 0.58, 0.36, 0.14, 0.06, 0.3)),
		thigh: sp(limb(BONE.thigh, 1.04, 0.66, 0.18, 0.04)),
		shin: sp([[0, -0.64], [0.46, -0.48], [0.64, 0.05], [0.56, 1.4], [0.42, 3.2], [0.33, 4.6], [0.35, 5.05], [0, 5.32], [-0.37, 5.05], [-0.42, 4.5], [-0.6, 3.3], [-0.96, 1.7], [-0.84, 0.5], [-0.5, -0.42]]),
		band: {u: 0.76, f: 0.47, a: 0.5}},
	/** the goddess: narrow shoulders (±3.1 × 0.94 ≈ 80 % of the god), slim arms, long slender neck, small waist, gentle hip, bust in profile */
	f: {
		torso: sp([[-1.62, 0.6], [-1.5, -0.6], [-0.84, -2.4], [-0.98, -3.4], [-1.38, -4.6], [-2.1, -5.32], [-2.95, -5.72], [-3.08, -6.38], [-2.55, -6.78], [-1.55, -6.88], [-0.5, -6.94], [0.7, -6.94], [1.8, -6.88], [2.65, -6.78], [3.12, -6.38], [3.02, -5.72], [2.25, -5.3], [1.5, -4.95], [1.55, -4.55], [2.08, -3.98], [1.98, -3.42], [1.28, -3.12], [0.72, -2.4], [1.3, -0.8], [1.55, 0.6]]),
		neck: sp([[-0.46, 0.6, 1], [-0.42, -0.4], [-0.38, -1.72], [0.46, -1.76], [0.5, -0.3], [0.6, 0.6, 1]]),
		upper: sp(limb(BONE.upper, 0.6, 0.41, 0.04, 0.02)),
		fore: sp(limb(BONE.fore, 0.43, 0.27, 0.03, 0.02, 0.35)),
		thigh: sp(limb(BONE.thigh, 0.94, 0.55, 0.1, 0.06)),
		shin: sp([[0, -0.56], [0.4, -0.42], [0.54, 0.05], [0.46, 1.4], [0.33, 3.2], [0.26, 4.6], [0.28, 5.05], [0, 5.26], [-0.3, 5.05], [-0.33, 4.5], [-0.45, 3.3], [-0.68, 1.7], [-0.62, 0.5], [-0.4, -0.38]]),
		band: {u: 0.5, f: 0.36, a: 0.4}},
};

/* ---------------- drawing context ---------------- */
type Ctx = {OW: number; LW: number};
const Ink: React.FC<{d: string; m?: M; c: Ctx; k?: number}> = ({d, m, c, k = 1}) => <path d={d} transform={m && mx(m)} fill={PAL.ink} stroke={PAL.ink} strokeWidth={2 * c.OW * k} strokeLinejoin="round" />;
const Fl: React.FC<{d: string; m?: M; r: Role | string; o?: number}> = ({d, m, r, o}) => <path d={d} transform={m && mx(m)} fill={(PAL as Record<string, string>)[r] ?? r} opacity={o} />;
const Ln: React.FC<{d: string; m?: M; c: Ctx; w?: number; col?: string; o?: number}> = ({d, m, c, w = 1, col = PAL.line, o}) => <path d={d} transform={m && mx(m)} fill="none" stroke={col} strokeWidth={c.LW * w} strokeLinecap="round" strokeLinejoin="round" opacity={o} />;
/** a shape with its own outline (ink pass + fill) */
const Solid: React.FC<{d: string; m?: M; r: Role | string; c: Ctx; k?: number}> = ({d, m, r, c, k}) => <><Ink d={d} m={m} c={c} k={k} /><Fl d={d} m={m} r={r} /></>;

/** finger and thumb lines of a hand (hand frame), after Egyptian sculpture: three finger divisions and the thumb; no nails */
export const HandLines: React.FC<{m: M; kind?: Hand; c: Ctx}> = ({m, kind, c}) => kind === 'open' || kind === 'palm'
	? <g transform={mx(m)} fill="none" stroke={PAL.line} strokeWidth={c.LW * 1.05} strokeLinecap="round" opacity={0.85}>
		<path d="M0.41 0.62Q0.38 0.36 0.3 0.18" /><path d="M0.2 0.98L0.21 1.52" /><path d="M-0.01 1.0L-0.01 1.6" /><path d="M-0.21 0.98L-0.22 1.48" /></g>
	: <g transform={mx(m)} fill="none" stroke={PAL.line} strokeWidth={c.LW * 1.05} strokeLinecap="round" opacity={0.85}>
		<path d="M-0.46 0.68Q0 0.75 0.53 0.71" /><path d="M-0.2 0.73Q-0.24 0.92 -0.2 1.11" /><path d="M0.06 0.74Q0.02 0.94 0.06 1.12" /><path d="M0.3 0.74Q0.26 0.9 0.3 1.05" />
		<path d="M0.37 0.14Q0.6 0.38 0.53 0.7" /></g>;
/** the curled fingers of a fist drawn again over a held prop (hand frame), so the hand grips it */
export const FingersOver: React.FC<{m: M; skin: string; c: Ctx}> = ({m, skin, c}) => <g transform={mx(m)}>
	<path d="M-0.48 0.66Q0 0.74 0.54 0.7L0.52 0.95Q0.34 1.1 -0.22 1.13Q-0.46 1.0 -0.48 0.66Z" fill={skin} />
	<path d="M0.52 0.95Q0.34 1.1 -0.22 1.13Q-0.46 1.0 -0.49 0.62" fill="none" stroke={PAL.ink} strokeWidth={c.OW * 2} strokeLinecap="round" strokeLinejoin="round" />
	<path d="M-0.47 0.67Q0 0.75 0.53 0.71" fill="none" stroke={PAL.ink} strokeWidth={c.OW * 1.1} strokeLinecap="round" />
	<g fill="none" stroke={PAL.line} strokeWidth={c.LW * 1.05} strokeLinecap="round" opacity={0.85}><path d="M-0.2 0.75Q-0.24 0.93 -0.2 1.11" /><path d="M0.06 0.76Q0.02 0.95 0.06 1.12" /><path d="M0.3 0.76Q0.26 0.9 0.3 1.05" /></g>
</g>;
const GRIPS: PropKind[] = ['ankh', 'knife', 'sistrum', 'stalks', 'menat'];
/** half-elliptic band (collar rows): angles 0..180 below the centre */
export const band = (cx: number, cy: number, r0: number, r1: number, k = 0.78, a0 = 0, a1 = 180, n = 28): string => {
	const pts: V[] = [];
	for (let i = 0; i <= n; i++) { const a = (a0 + ((a1 - a0) * i) / n) * RAD; pts.push([cx + r1 * Math.cos(a), cy + k * r1 * Math.sin(a)]); }
	for (let i = n; i >= 0; i--) { const a = (a0 + ((a1 - a0) * i) / n) * RAD; pts.push([cx + r0 * Math.cos(a), cy + k * r0 * Math.sin(a)]); }
	return poly(pts);
};

/** Egyptian eye: almond, iris, kohl tail and brow (head frame) */
export const Eye: React.FC<{x: number; y: number; L?: number; c: Ctx; brow?: boolean; rim?: string; tail?: number}> = ({x, y, L = 0.5, c, brow = true, rim = PAL.black, tail = 0.36}) => {
	const h = L * 0.36;
	const al = sp([[x - L * 0.55, y, 1], [x - L * 0.2, y - h], [x + L * 0.25, y - h * 0.9], [x + L * 0.45, y + h * 0.05, 1], [x + L * 0.15, y + h * 0.75], [x - L * 0.25, y + h * 0.6]], true, 0.2);
	return <g>
		<path d={al} fill={PAL.eye} stroke={rim} strokeWidth={c.LW * 1.5} strokeLinejoin="round" />
		<circle cx={x + L * 0.08} cy={y - h * 0.05} r={h * 0.82} fill={PAL.black} />
		<path d={sp([[x - L * 0.55, y - h * 0.08], [x - L * 0.55 - tail * 0.6, y + h * 0.05], [x - L * 0.55 - tail, y + h * 0.35, 1], [x - L * 0.55 - tail * 0.5, y + h * 0.4], [x - L * 0.5, y + h * 0.18]], true, 0.15)} fill={rim} />
		{brow && <path d={sp([[x + L * 0.5, y - L * 0.52], [x - L * 0.1, y - L * 0.66], [x - L * 0.8, y - L * 0.52], [x - L * 0.95, y - L * 0.44, 1], [x - L * 0.55, y - L * 0.52], [x - L * 0.05, y - L * 0.56], [x + L * 0.42, y - L * 0.44, 1]], true, 0.15)} fill={rim} />}
	</g>;
};

/** the broad collar (wesekh) in the torso frame */
const Collar: React.FC<{m: M; c: Ctx; female?: boolean; plain?: boolean; /** body types: [cy, size] */ fit?: [number, number]}> = ({m, c, female, plain, fit}) => {
	const cx = 0.18, cy = fit ? fit[0] : female ? -6.78 : -6.86, s = fit ? fit[1] : female ? 0.9 : 1;
	const rows: [number, number, Role][] = plain
		? [[0.8, 1.05, 'gold'], [1.05, 1.45, 'blue'], [1.45, 1.6, 'gold'], [1.6, 1.95, 'red'], [1.95, 2.25, 'green']]
		: [[0.8, 1.02, 'gold'], [1.02, 1.42, 'blue'], [1.42, 1.56, 'gold'], [1.56, 1.92, 'red'], [1.92, 2.06, 'gold'], [2.06, 2.42, 'turq'], [2.42, 2.54, 'gold']];
	const outer = rows[rows.length - 1][1] * s, drops: React.ReactNode[] = [];
	if (!plain) {
		const n = 17;
		for (let i = 0; i < n; i++) {
			const a = ((i + 0.5) / n) * Math.PI, ca = Math.cos(a), sa = Math.sin(a);
			const bx = cx + outer * ca, by = cy + 0.78 * outer * sa, L = 0.46 * s, nx = ca, ny = 0.78 * sa / Math.hypot(ca, 0.78 * sa) * 1, nn = Math.hypot(nx, ny);
			const ux = nx / nn, uy = ny / nn, px = -uy, py = ux, w = 0.15 * s;
			const d = sp([[bx + px * w * 0.6, by + py * w * 0.6], [bx + ux * L * 0.7 + px * w, by + uy * L * 0.7 + py * w], [bx + ux * L, by + uy * L], [bx + ux * L * 0.7 - px * w, by + uy * L * 0.7 - py * w], [bx - px * w * 0.6, by - py * w * 0.6]], true, 0.2);
			drops.push(<path key={i} d={d} fill={(['blue', 'red', 'green'] as Role[]).map((r) => PAL[r])[i % 3]} stroke={PAL.ink} strokeWidth={c.LW} />);
		}
	}
	const beads: React.ReactNode[] = [];
	rows.forEach(([r0, r1, col], j) => { if (col === 'gold') return; const n = Math.round(10 + r1 * 7);
		for (let i = 1; i < n; i++) { const a = (i / n) * Math.PI; beads.push(<line key={`${j}-${i}`} x1={cx + r0 * s * Math.cos(a)} y1={cy + 0.78 * r0 * s * Math.sin(a)} x2={cx + r1 * s * Math.cos(a)} y2={cy + 0.78 * r1 * s * Math.sin(a)} stroke={PAL.ink} strokeWidth={c.LW * 0.7} opacity={0.55} />); } });
	return <g transform={mx(m)}>
		<path d={band(cx, cy, 0.62 * s, outer + (plain ? 0 : 0.42 * s))} fill={PAL.ink} stroke={PAL.ink} strokeWidth={c.OW * 1.6} strokeLinejoin="round" />
		{drops}
		{rows.map(([r0, r1, col], j) => <path key={j} d={band(cx, cy, r0 * s, r1 * s)} fill={PAL[col]} stroke={PAL.ink} strokeWidth={c.LW * 0.9} />)}
		{beads}
		<path d={band(cx, cy, 0.62 * s, 0.8 * s)} fill={PAL.gold} />
	</g>;
};

/* ---------------- held props (hand frame: wrist at 0, grip at (0, 0.6)) ---------------- */
/** a prop drawn upright in world space at the grip of hand frame `h` */
const gripPt = (h: M): V => ap(h, [0.02, 0.6]);
export const Ankh: React.FC<{at: V; s?: number; c: Ctx; a?: number}> = ({at, s = 1, c, a = 0}) => {
	const d = sp([[0, -0.15], [0.42, -0.5], [0.52, -1.05], [0.3, -1.45], [0, -1.55], [-0.3, -1.45], [-0.52, -1.05], [-0.42, -0.5]], true, 0.2);
	const hole = sp([[0, -0.42], [0.22, -0.72], [0.26, -1.05], [0.12, -1.3], [0, -1.33], [-0.12, -1.3], [-0.26, -1.05], [-0.22, -0.72]], true, 0.2);
	const bar = poly([[-0.85, -0.2], [0.85, -0.2], [0.85, 0.2], [-0.85, 0.2]]), stem = poly([[-0.2, 0.0], [0.2, 0.0], [0.3, 1.9], [-0.3, 1.9]]);
	return <g transform={`translate(${at[0]},${at[1] + 0.9 * s}) rotate(${a}) scale(${s})`}>
		<g>{[d, bar, stem].map((p, i) => <path key={i} d={p} fill={PAL.ink} stroke={PAL.ink} strokeWidth={2 * c.OW / s} strokeLinejoin="round" />)}</g>
		<g>{[d, bar, stem].map((p, i) => <path key={i} d={p} fill={PAL.gold} />)}</g>
		<path d={hole} fill={PAL.plaster} stroke={PAL.ink} strokeWidth={c.LW / s} />
		<line x1={-0.85} x2={0.85} y1={0} y2={0} stroke={PAL.gold2} strokeWidth={0.08} />
	</g>;
};
/** was-sceptre: Set-animal head on top, forked foot on the ground */
export const Was: React.FC<{at: V; top: number; c: Ctx}> = ({at, top, c}) => {
	const x = at[0], y0 = top, y1 = 0;
	const shaft = poly([[x - 0.16, y0 + 0.4], [x + 0.16, y0 + 0.4], [x + 0.16, y1 - 0.9], [x - 0.16, y1 - 0.9]]);
	const head = sp([[x - 0.16, y0 + 0.5, 1], [x - 0.2, y0 - 0.1], [x + 0.25, y0 - 0.45], [x + 1.1, y0 - 0.45], [x + 1.25, y0 - 0.25, 1], [x + 0.55, y0 - 0.12], [x + 0.2, y0 + 0.1], [x + 0.16, y0 + 0.5, 1]], true, 0.18);
	const fork = poly([[x - 0.16, y1 - 1.0], [x + 0.16, y1 - 1.0], [x + 0.45, y1 - 0.4], [x + 0.45, y1], [x + 0.25, y1], [x + 0.15, y1 - 0.45], [x - 0.15, y1 - 0.45], [x - 0.25, y1], [x - 0.45, y1], [x - 0.45, y1 - 0.4]]);
	return <g>{[shaft, head, fork].map((p, i) => <path key={'i' + i} d={p} fill={PAL.ink} stroke={PAL.ink} strokeWidth={2 * c.OW} strokeLinejoin="round" />)}
		{[shaft, head, fork].map((p, i) => <path key={'f' + i} d={p} fill={i === 0 ? PAL.gold : PAL.gold} />)}
		{[0.25, 0.5, 0.75].map((u) => <rect key={u} x={x - 0.17} y={lerp(y0 + 0.6, y1 - 1.0, u) - 0.12} width={0.34} height={0.24} fill={PAL.blue} />)}
	</g>;
};
/** Thoth's scribal palette: a long tablet with a red and a black ink well and a pen slot (palette frame: centre, along +x) */
export const Palette: React.FC<{m: M; c: Ctx}> = ({m, c}) => {
	const d = sp([[-1.75, -0.32, 1], [1.75, -0.32, 1], [1.75, 0.32, 1], [-1.75, 0.32, 1]]);
	return <g transform={mx(m)}><Solid d={d} r="linen" c={c} />
		<rect x={-1.1} y={-0.07} width={2.5} height={0.14} rx={0.07} fill={PAL.linen2} stroke={PAL.line} strokeWidth={c.LW * 0.7} />
		<circle cx={-1.42} cy={-0.1} r={0.15} fill={PAL.red} stroke={PAL.ink} strokeWidth={c.LW * 0.7} />
		<circle cx={-1.42} cy={0.16} r={0.12} fill={PAL.black} />
		<line x1={-1.75} x2={1.75} y1={0.32} y2={0.32} stroke={PAL.ink} strokeWidth={c.LW} />
	</g>;
};
/** reed pen held at the grip, along the hand's axis */
export const PEN_TIP: V = [0.05 - 1.4 * Math.sin(40 * RAD), 0.62 + 1.4 * Math.cos(40 * RAD)];
export const Pen: React.FC<{h: M; c: Ctx}> = ({h, c}) => <g transform={mx(chain(h, T(0.05, 0.62), R(40)))}>
	<path d={poly([[-0.06, -1.25], [0.06, -1.25], [0.06, 1.15], [0, 1.4], [-0.06, 1.15]])} fill={PAL.wood} stroke={PAL.ink} strokeWidth={c.LW} strokeLinejoin="round" />
	<path d={poly([[-0.065, 1.08], [0.065, 1.08], [0, 1.4]])} fill={PAL.black} />
</g>;
/** crook (heka): striped staff with a hook above the fist (world upright, tilted by a) */
export const Crook: React.FC<{at: V; a: number; c: Ctx}> = ({at, a, c}) => {
	const shaft: Pt[] = [[-0.15, 1.2, 1], [0.15, 1.2, 1], [0.15, -2.4], [0.2, -2.95], [0.55, -3.3], [1.0, -3.25], [1.2, -2.9], [1.12, -2.62, 1], [0.92, -2.62, 1], [0.95, -2.88], [0.75, -3.05], [0.45, -2.95], [-0.15, -2.4]];
	const d = sp(shaft, true, 0.16);
	return <g transform={`translate(${at[0]},${at[1]}) rotate(${a})`}><Solid d={d} r="gold" c={c} />
		{[-2.1, -1.5, -0.9, -0.3, 0.3, 0.9].map((y) => <rect key={y} x={-0.16} y={y} width={0.32} height={0.28} fill={PAL.blue} />)}
	</g>;
};
/** flail (nekhakha): handle with three bead strands that swing (secondary motion) */
export const Flail: React.FC<{at: V; a: number; c: Ctx; t: number}> = ({at, a, c, t}) => {
	const k = 1.25, top: V = [Math.sin(a * RAD) * 3.6 * k, -Math.cos(a * RAD) * 3.6 * k];
	const handle = poly([[-0.15, 0.9], [0.15, 0.9], [0.15, -3.6], [-0.15, -3.6]]);
	const strands = [0, 1, 2].map((i) => { const sw = (i - 1) * 9 + 5 * Math.sin(t * 2.1 + i * 0.8) + 2 * Math.sin(t * 4.7 + i), out: V[] = [top];
		for (let j = 1; j <= 5; j++) { const aa = (sw + j * 2) * RAD; out.push([top[0] + Math.sin(aa) * 0.5 * j * k, top[1] + Math.cos(aa) * 0.5 * j * k]); }
		return out; });
	return <g transform={`translate(${at[0]},${at[1]})`}>
		<g transform={`rotate(${a}) scale(${k})`}><Solid d={handle} r="gold" c={{OW: c.OW / k, LW: c.LW / k}} />{[-3.0, -2.4, -1.8, -1.2, -0.6, 0.0].map((y) => <rect key={y} x={-0.16} y={y} width={0.32} height={0.26} fill={PAL.blue} />)}</g>
		{strands.map((sg, i) => <g key={i}><polyline points={sg.map((p) => p.join(',')).join(' ')} fill="none" stroke={PAL.ink} strokeWidth={0.3} strokeLinecap="round" />
			{sg.slice(1).map((p, j) => <ellipse key={j} cx={p[0]} cy={p[1]} rx={0.2} ry={0.26} fill={[PAL.blue, PAL.red, PAL.gold, PAL.green][(j + i) % 4]} stroke={PAL.ink} strokeWidth={c.LW * 0.9} />)}</g>)}
		<circle cx={top[0]} cy={top[1]} r={0.3} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW} />
	</g>;
};

/* ---------------- ep60 4:3 props ---------------- */
/** sickle / hoe gripped across the fist (hand frame: the shaft passes through the fist along +x, the thumb side) */
const HeldTool: React.FC<{kind: 'sickle' | 'hoe'; h: M; c: Ctx}> = ({kind, h, c}) => {
	if (kind === 'sickle') {
		const handle = sp([[-0.55, 0.42, 1], [0.75, 0.42, 1], [0.75, 0.8, 1], [-0.55, 0.8, 1]]);
		const blade = sp([[0.7, 0.45], [1.25, 0.05], [2.0, -0.05], [2.65, 0.35], [2.95, 1.0], [2.85, 1.6, 1], [2.55, 1.05], [2.15, 0.62], [1.55, 0.5], [0.75, 0.8]], true, 0.18);
		return <g transform={mx(h)}><Solid d={blade} r="linen" c={c} /><path d="M1.0 0.5Q2.0 0.12 2.7 0.75" fill="none" stroke={PAL.line} strokeWidth={c.LW} opacity={0.6} />
			<Solid d={handle} r="wood" c={c} />{[0.6, 0.66].map((y) => <line key={y} x1={0.75} x2={0.95} y1={y} y2={y} stroke={PAL.ink} strokeWidth={c.LW * 0.7} />)}</g>;
	}
	const handle = sp([[-0.75, 0.46, 1], [3.6, 0.46, 1], [3.6, 0.76, 1], [-0.75, 0.76, 1]]);
	const blade = sp([[3.35, 0.55, 1], [3.65, 0.75], [2.75, 2.6], [2.35, 3.25, 1], [2.25, 2.95], [3.05, 0.95]], true, 0.16);
	return <g transform={mx(h)}><Solid d={blade} r="wood" c={c} /><Solid d={handle} r="wood" c={c} /><path d="M1.6 0.76L2.9 1.9" stroke={PAL.ink} strokeWidth={c.LW * 1.4} /></g>;
};
/** sistrum (Hathor rattle), held upright: loop frame with jingling bars */
export const Sistrum: React.FC<{at: V; c: Ctx; t: number}> = ({at, c, t}) => {
	const loop = sp([[-0.42, -1.25, 1], [-0.62, -2.2], [-0.5, -3.1], [0, -3.45], [0.5, -3.1], [0.62, -2.2], [0.42, -1.25, 1], [0.24, -1.3, 1], [0.38, -2.2], [0.3, -2.9], [0, -3.15], [-0.3, -2.9], [-0.38, -2.2], [-0.24, -1.3, 1]], true, 0.18);
	return <g transform={`translate(${at[0]},${at[1]})`}>
		<Solid d={poly([[-0.14, 1.3], [0.14, 1.3], [0.14, -0.6], [-0.14, -0.6]])} r="gold" c={c} />
		<Solid d={sp([[-0.42, -0.55], [0.42, -0.55], [0.5, -1.0], [0.3, -1.32], [-0.3, -1.32], [-0.5, -1.0]])} r="gold" c={c} />
		<circle cx={0} cy={-0.95} r={0.17} fill={PAL.blue} />
		<Solid d={loop} r="gold" c={c} />
		{[-1.9, -2.35, -2.8].map((y, i) => { const j = 0.08 * Math.sin(t * 9 + i * 2); return <g key={y}><line x1={-0.5} x2={0.5} y1={y + j} y2={y - j} stroke={PAL.ink} strokeWidth={c.LW * 1.6} />{[-0.22, 0.22].map((x) => <circle key={x} cx={x + j} cy={y} r={0.09} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW * 0.7} />)}</g>; })}
	</g>;
};
/** knife held blade-up (guardians, judges) */
const Knife: React.FC<{at: V; c: Ctx}> = ({at, c}) => <g transform={`translate(${at[0]},${at[1]})`}>
	<Solid d={sp([[-0.16, 0.9, 1], [0.16, 0.9, 1], [0.16, -0.2, 1], [-0.16, -0.2, 1]])} r="wood" c={c} />
	<Solid d={sp([[-0.2, -0.2, 1], [0.26, -0.2, 1], [0.34, -1.6], [0.1, -2.9, 1], [-0.12, -1.7]], true, 0.16)} r="linen" c={c} />
</g>;
/** a sheaf of grain stalks held at the grip */
const Stalks: React.FC<{at: V; c: Ctx; t: number}> = ({at, c, t}) => <g transform={`translate(${at[0]},${at[1]})`}>
	{[-28, -14, 0, 12, 24].map((a, i) => { const aa = a + 3 * Math.sin(t * 1.7 + i), r = aa * Math.PI / 180, L = 3.2 + (i % 2) * 0.6, x1 = Math.sin(r) * L, y1 = -Math.cos(r) * L;
		return <g key={i}><line x1={0} y1={0.6} x2={x1} y2={y1} stroke={PAL.gold2} strokeWidth={c.LW * 1.8} />
			<g transform={`translate(${x1},${y1}) rotate(${aa})`}><Solid d={sp([[0, 0.3], [0.22, -0.3], [0.18, -1.0], [0, -1.35, 1], [-0.18, -1.0], [-0.22, -0.3]])} r="gold" c={c} />{[-0.3, -0.65, -1.0].map((y) => <path key={y} d={`M-0.18 ${y}L0 ${y - 0.14}L0.18 ${y}`} fill="none" stroke={PAL.gold2} strokeWidth={c.LW} />)}</g></g>; })}
	<line x1={-0.1} y1={0.9} x2={0.1} y2={2.0} stroke={PAL.gold2} strokeWidth={c.LW * 1.8} />
</g>;
/** menat (necklace counterpoise) hanging from the hand */
const Menat: React.FC<{at: V; c: Ctx; t: number}> = ({at, c, t}) => { const a = 6 * Math.sin(t * 1.9);
	return <g transform={`translate(${at[0]},${at[1] + 0.4}) rotate(${a})`}>
		{[-0.3, 0, 0.3].map((x, i) => <path key={i} d={`M${x * 0.4} 0Q${x} 1.0 ${x * 0.5} 1.9`} fill="none" stroke={[PAL.blue, PAL.red, PAL.green][i]} strokeWidth={c.LW * 2.4} />)}
		<Solid d={sp([[-0.2, 1.8, 1], [0.2, 1.8, 1], [0.22, 2.6], [0.55, 3.0], [0.4, 3.5], [0, 3.62], [-0.4, 3.5], [-0.55, 3.0], [-0.22, 2.6]])} r="green" c={c} />
	</g>; };

/* ---------------- wings (Isis): feathers hung along the arm, procedural for any arm pose ---------------- */
const Wing: React.FC<{U: M; F: M; c: Ctx; t: number; seed: number}> = ({U, F, c, t, seed}) => {
	const at = (u: number) => (u < 0.45 ? chain(U, T(0, (u / 0.45) * BONE.upper)) : chain(F, T(0, ((u - 0.45) / 0.55) * (BONE.fore + 1.1))));
	const rows = [
		{L0: 3.3, L1: 5.6, w: 0.62, n: 13, off: -0.55, cols: ['blue', 'green'] as Role[], tip: true},
		{L0: 2.0, L1: 2.5, w: 0.58, n: 12, off: -0.5, cols: ['green', 'blue'] as Role[], tip: false},
		{L0: 1.0, L1: 1.15, w: 0.52, n: 11, off: -0.45, cols: ['red', 'blue'] as Role[], tip: false}];
	const out: React.ReactNode[] = [];
	rows.forEach((r, ri) => { for (let i = 0; i < r.n; i++) {
		const u = (i + 0.5) / r.n, L = lerp(r.L0, r.L1, Math.pow(u, 1.4)), ang = lerp(8, -34, u) + 2.6 * Math.sin(t * 2.1 + i * 0.6 + seed + ri) * (0.3 + u);
		const fm = chain(at(u), T(r.off, 0), R(90 + ang));
		const d = sp([[-r.w / 2, -0.1, 1], [r.w / 2, -0.1, 1], [r.w * 0.5, L * 0.82], [r.w * 0.28, L], [-r.w * 0.28, L], [-r.w * 0.5, L * 0.82]], true, 0.16);
		out.push(<g key={`${ri}-${i}`} transform={mx(fm)}>
			<path d={d} fill={PAL[r.cols[i % 2]]} stroke={PAL.ink} strokeWidth={c.OW * 1.25} strokeLinejoin="round" />
			{ri < 2 && <line x1={0} y1={0.15} x2={0} y2={L * 0.8} stroke={PAL.ink} strokeWidth={c.LW * 0.7} opacity={0.5} />}
			{r.tip && <path d={sp([[-r.w * 0.5, L * 0.74, 1], [r.w * 0.5, L * 0.74, 1], [r.w * 0.28, L], [-r.w * 0.28, L]])} fill={PAL.gold} />}
		</g>); } });
	const lead = (m: M, len: number, k: string) => <g key={k} transform={mx(m)}><path d={sp([[0.0, -0.3, 1], [0.0, len + 0.3, 1], [-0.7, len + 0.2, 1], [-0.72, -0.2, 1]])} fill={PAL.red} stroke={PAL.ink} strokeWidth={c.OW * 1.25} />
		{Array.from({length: Math.round(len * 2.6)}, (_, i) => <path key={i} d={`M-0.7 ${i * 0.38 + 0.05}Q-0.35 ${i * 0.38 + 0.36} 0 ${i * 0.38 + 0.05}`} fill="none" stroke={PAL.gold} strokeWidth={c.LW * 1.1} />)}</g>;
	return <g>{out}{lead(U, BONE.upper, 'u')}{lead(F, BONE.fore + 0.9, 'f')}</g>;
};

/* ---------------- the figure ---------------- */
export type Sec = {t?: number; amp?: number; vel?: {head?: number; torso?: number}};
export type FigProps = {cast: Cast; pose: Pose; x: number; y: number; s: number; face?: 1 | -1; sec?: Sec; id: string; explode?: number; pivots?: boolean; hide?: Partial<Record<'bArm' | 'fArm' | 'props', boolean>>; bProp?: PropKind; fProp?: PropKind; propTop?: number; paletteA?: number; /** open the jaw / beak 0..1 (jackal, ibis, falcon heads); default closed = the ep60 drawing */ jaw?: number; /** jackal ear fold, degrees (+ = back); 0 = ep60 drawing */ ear?: number; /** ep61: a complete head drawn in the head frame in place of the head shape and its face (wig, lappet, beard, crown still drawn by the rig); undefined = the ep60 drawing */ headArt?: React.ReactNode};

/* ---------------- opening jaws / beaks / ear fold (jaw, ear props; zero = the original single head shape) ---------------- */
type JawSpec = {hinge: V; mouth: V[]; max: number; inner: string};
const JAWS: Record<'jackal' | 'ibis', JawSpec> = {
	jackal: {hinge: [1.22, -0.36], mouth: [[1.3, -0.46], [1.8, -0.52], [2.4, -0.58], [2.86, -0.66], [3.05, -0.7]], max: 36, inner: '#7A1F2B'},
	ibis: {hinge: [1.05, -1.0], mouth: [[1.12, -1.02], [1.8, -0.88], [2.45, -0.62], [3.0, -0.3], [3.36, 0.06], [3.62, 0.22]], max: 17, inner: '#B8384A'},
};
const earXf = (a: number) => mx(chain(T(0.3, -2.1), R(-a), T(-0.3, 2.1)));
/** the head drawn as separate parts: the head without its lower jaw, the lower jaw turned about the hinge, and the ear folded about its root */
const SplitHead: React.FC<{kind: HeadKind; jaw: number; ear: number; d: string; r: Role | string; c: Ctx; id: string}> = ({kind, jaw, ear, d, r, c, id}) => {
	const fill = (PAL as Record<string, string>)[r] ?? r;
	const earClip = poly([[-2, -9], [3, -9], [3, -2.1], [-2, -2.1]]);
	const stroke = (k = 1) => ({fill: PAL.ink, stroke: PAL.ink, strokeWidth: 2 * c.OW * k, strokeLinejoin: 'round' as const});
	if (kind === 'falcon') { // the rig's falcon has one beak solid: add a hinged lower mandible and a dark mouth
		const a = 40 * jaw, rm = chain(T(1.0, -0.42), R(a), T(-1.0, 0.42));
		const low = sp([[0.98, -0.5, 1], [1.4, -0.56], [1.82, -0.46], [1.88, -0.38, 1], [1.6, -0.24], [1.2, -0.14], [0.98, -0.1, 1]], true, 0.14);
		return <g><path d={d} {...stroke()} /><path d={d} fill={fill} />
			{jaw > 0.04 && <><path d={poly([[0.98, -0.52], [1.8, -0.5], ap(rm, [1.86, -0.44]), ap(rm, [0.98, -0.1])])} fill="#6A1A22" />
				<g transform={mx(rm)}><path d={low} {...stroke(0.9)} /><path d={low} fill={PAL.ink} /></g>
				<path d="M1.05 -0.55Q1.45 -0.5 1.78 -0.5" fill="none" stroke={PAL.ink} strokeWidth={c.OW * 1.4} strokeLinecap="round" /></>}
		</g>;
	}
	const sp_ = JAWS[kind as 'jackal' | 'ibis'], a = sp_.max * jaw, rm = chain(T(sp_.hinge[0], sp_.hinge[1]), R(a), T(-sp_.hinge[0], -sp_.hinge[1]));
	const last = sp_.mouth[sp_.mouth.length - 1];
	const lowR = poly([sp_.hinge, ...sp_.mouth, [last[0] + 0.3, 3], [sp_.hinge[0], 3]]);
	const cut = sp(sp_.mouth, false, 0.1), cid = `${id}-hd`;
	const earA = ear !== 0 && kind === 'jackal';
	return <g>
		<defs>
			<clipPath id={`${cid}-up`}><path clipRule="evenodd" d={`M-3 -9H8V6H-3Z${jaw > 0 ? lowR : ''}${earA ? earClip : ''}`} /></clipPath>
			<clipPath id={`${cid}-lo`}><path d={lowR} /></clipPath>
			{earA && <clipPath id={`${cid}-ear`}><path d={earClip} /></clipPath>}
		</defs>
		{earA && <g transform={earXf(ear)} clipPath={`url(#${cid}-ear)`}><path d={d} {...stroke()} /><path d={d} fill={fill} /></g>}
		{jaw > 0.02 && <path d={poly([sp_.hinge, ...sp_.mouth, ap(rm, last), ap(rm, sp_.mouth[0])])} fill={sp_.inner} />}
		{jaw > 0 && <g clipPath={`url(#${cid}-lo)`} transform={mx(rm)}><path d={d} {...stroke()} /><path d={d} fill={fill} />
			<path d={cut} fill="none" stroke={PAL.ink} strokeWidth={c.OW * 1.6} strokeLinecap="round" /></g>}
		<g clipPath={`url(#${cid}-up)`}><path d={d} {...stroke()} /><path d={d} fill={fill} /></g>
		{jaw > 0 && <path d={cut} fill="none" stroke={PAL.ink} strokeWidth={c.OW * 1.6} strokeLinecap="round" />}
		{jaw > 0.3 && kind === 'jackal' && [0, 1, 2].map((i) => { const x0 = 2.3 + i * 0.22, y0 = -0.58 - (x0 - 2.3) * 0.12; return <path key={i} d={`M${x0} ${y0}l0.07 ${0.22 * Math.min(1, jaw * 1.3)}l0.07 ${-0.22 * Math.min(1, jaw * 1.3)}Z`} fill={PAL.white} stroke={PAL.ink} strokeWidth={c.LW * 0.6} />; })}
	</g>;
};

export const God: React.FC<FigProps> = ({cast, pose, x, y, s, face = 1, sec = {}, id, hide = {}, bProp, fProp, propTop, paletteA = -12, explode = 0, pivots = false, jaw = 0, ear = 0, headArt}) => {
	const c: Ctx = {OW: 2.7 / s, LW: 1.5 / s};
	const g0 = solve(pose, castBody(cast)), g = explode ? explodeRig(g0, explode) : g0, t = sec.t ?? 0, amp = sec.amp ?? 1, vh = sec.vel?.head ?? 0, vt = sec.vel?.torso ?? 0;
	const skin = cast.skin, skin2 = cast.skin2, mummy = cast.dress === 'mummy';
	// body type (undefined = the ep60 drawing): its shapes, and the outline compensation for the scaled hand / foot frames
	const BT = cast.body, BS = BT ? BSH[BT] : undefined, BD = BT ? BODY[BT] : undefined, hk = BD ? 1 / BD.hand : 1, fk = BD ? 1 / BD.foot : 1;
	const shThigh = BS ? BS.thigh : SH.thigh, shShin = BS ? BS.shin : SH.shin, shUpper = BS ? BS.upper : SH.upper, shFore = BS ? BS.fore : SH.fore;
	const bandU = BS ? BS.band.u : 0.62, bandF = BS ? BS.band.f : 0.42, bandA = BS ? BS.band.a : 0.46;
	const wU = BS ? bandU * 2 + 0.02 : 1.26, wF = BS ? bandF * 2 + 0.02 : 0.86, wA = BS ? bandA * 2 : 0.92;
	const bp = bProp ?? cast.bProp ?? 'none', fp = fProp ?? cast.fProp ?? 'none';
	// ---- secondary clocks ----
	const sway = (f: number, ph: number, a: number) => amp * a * (Math.sin(t * f + ph) + 0.35 * Math.sin(t * f * 2.3 + ph * 1.7));
	const headRot = rot(g.head), torsoRot = rot(g.torso);
	// ---- limbs ----
	const leg = (T_: M, S_: M, F_: M, k: string) => <g key={k}>
		<Ink d={shThigh} m={T_} c={c} /><Ink d={shShin} m={S_} c={c} /><Ink d={SH.foot} m={F_} c={c} k={fk} />
		<Fl d={shThigh} m={T_} r={skin} /><Fl d={shShin} m={S_} r={skin} /><Fl d={SH.foot} m={F_} r={skin} />
		<g transform={mx(S_)}><rect x={-bandA} y={4.42} width={wA} height={0.34} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW} /><rect x={-bandA} y={4.53} width={wA} height={0.12} fill={PAL.blue} /></g>
		<path d={sp([[1.55, 0.42], [1.82, 0.56], [1.95, 0.73]], false)} transform={mx(F_)} fill="none" stroke={PAL.line} strokeWidth={c.LW * 0.9} opacity={0.7} />
	</g>;
	const handShape = (kind: Hand | undefined) => SH[kind === 'open' ? 'open' : kind === 'palm' ? 'palm' : 'fist'];
	const armInk = (U: M, F: M, H: M, hand: Hand | undefined, k: string) => <g key={k}><Ink d={shUpper} m={U} c={c} /><Ink d={shFore} m={F} c={c} /><Ink d={handShape(hand)} m={H} c={c} k={hk} /></g>;
	const armFill = (U: M, F: M, H: M, hand: Hand | undefined, k: string) => <g key={k}><Fl d={shUpper} m={U} r={skin} /><Fl d={shFore} m={F} r={skin} /><Fl d={handShape(hand)} m={H} r={skin} /></g>;
	const armDetail = (U: M, F: M, H: M, hand: Hand | undefined, k: string) => <g key={k}>
		<HandLines m={H} kind={hand} c={c} />
		<g transform={mx(U)}><rect x={-bandU} y={1.0} width={wU} height={0.42} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW} /><rect x={-bandU} y={1.12} width={wU} height={0.17} fill={PAL.blue} /></g>
		<g transform={mx(F)}><rect x={-bandF} y={2.7} width={wF} height={0.58} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW} />
			{[0, 1, 2].map((i) => <rect key={i} x={-bandF} y={2.78 + i * 0.16} width={wF} height={0.07} fill={[PAL.blue, PAL.red, PAL.blue][i]} />)}</g>
		{BT === 'm' && <path d="M0.86 1.62Q0.45 1.5 0.2 1.72" transform={mx(U)} fill="none" stroke={PAL.line} strokeWidth={c.LW} opacity={0.6} />}
	</g>;
	// ---- garments ----
	const tP = (m: M, p: V) => ap(m, p);
	const kilt = () => {
		const wb = tP(g.torso, [-1.16, -1.95]), wf = tP(g.torso, [0.98, -1.95]), bt = tP(g.torso, [-1.5, 0.15]);
		const long = cast.dress === 'longkilt', backs = long ? [tP(g.rS, [-0.85, 2.7]), tP(g.aS, [-0.85, 2.7])] : [tP(g.rT, [-1.0, 2.75]), tP(g.aT, [-1.0, 2.75])], fronts = long ? [tP(g.rS, [0.95, 2.4]), tP(g.aS, [0.95, 2.4])] : [tP(g.rT, [1.04, 2.55]), tP(g.aT, [1.04, 2.55])];
		const hb = backs[0][0] < backs[1][0] ? backs[0] : backs[1], hf = fronts[0][0] > fronts[1][0] ? fronts[0] : fronts[1];
		const mid = lv(hb, hf, 0.5), dropMid: V = [mid[0], mid[1] + 0.12];
		const d = sp([[wb[0], wb[1], 1], bt, [hb[0], hb[1], 1], dropMid, [hf[0], hf[1], 1], lv(hf, wf, 0.55), [wf[0], wf[1], 1]], true, 0.15);
		const pleats: React.ReactNode[] = [];
		for (let i = 1; i < 9; i++) { const u = i / 9; const a = lv(wb, wf, lerp(0.25, 1, u)), b = u < 0.5 ? lv(hb, dropMid, u * 2) : lv(dropMid, hf, (u - 0.5) * 2);
			pleats.push(<line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={PAL.linen2} strokeWidth={c.LW * 1.1} />); }
		// apron (sporran) hanging from the belt front, with a uraeus fringe
		const ap0 = tP(g.torso, [0.42, -1.75]), dir = ((pose.at + pose.rt) / 2) * 0.55 - pose.lean * 0.2;
		const am = chain(T(ap0[0], ap0[1]), R(-dir));
		const apron = poly([[-0.42, 0], [0.42, 0], [0.55, 3.55], [-0.55, 3.55]]);
		return <g key="kilt">
			<Solid d={d} r="linen" c={c} />{pleats}
			{cast.apron !== false && <g transform={mx(am)}><Solid d={apron} r="gold" c={c} />
				{[0.5, 1.1, 1.7, 2.3].map((yy, i) => <rect key={yy} x={-0.48} y={yy} width={0.96 + (yy / 3.55) * 0.15} height={0.3} fill={[PAL.blue, PAL.red, PAL.blue, PAL.green][i]} transform={`translate(${-(yy / 3.55) * 0.07},0)`} />)}
				{[-0.36, 0, 0.36].map((xx) => <path key={xx} d={`M${xx - 0.14} 3.55L${xx - 0.14} 3.05Q${xx} 2.8 ${xx + 0.14} 3.05L${xx + 0.14} 3.55Z`} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW} />)}
			</g>}
			{/* belt */}
			<g transform={mx(g.torso)}><path d={poly([[-1.22, -2.2], [1.02, -2.2], [1.02, -1.7], [-1.26, -1.7]])} fill={cast.apron === false ? PAL.linen : PAL.gold} stroke={PAL.ink} strokeWidth={c.LW * 1.2} />
				{cast.apron !== false && [-0.9, -0.45, 0, 0.45].map((xx, i) => <rect key={xx} x={xx} y={-2.1} width={0.3} height={0.3} fill={[PAL.blue, PAL.red][i % 2]} />)}
				{cast.apron === false && <path d={sp([[0.75, -1.8], [1.15, -0.6], [1.0, 0.4], [0.75, 0.45], [0.82, -0.6], [0.5, -1.75]])} fill={PAL.linen} stroke={PAL.ink} strokeWidth={c.LW} />}</g>
		</g>; };
	const bullTail = () => { if (!cast.tail || cast.dress !== 'kilt') return null; const o = tP(g.torso, [-1.25, -1.8]), a = -0.85 * (torsoRot) + sway(1.7, 0.4, 4) - vt * 0.05;
		const d = sp([[-0.13, 0], [0.13, 0], [0.12, 4.2], [0.25, 5.0], [0.05, 5.6, 1], [-0.25, 5.0], [-0.12, 4.2]], true, 0.16);
		return <g key="tail" transform={`translate(${o[0]},${o[1]}) rotate(${a + 6})`}><Solid d={d} r="gold" c={c} />
			{[1, 2, 3].map((k) => <rect key={k} x={-0.14} y={k * 1.1} width={0.28} height={0.25} fill={PAL.blue} />)}</g>; };
	const robe = () => { // the deceased: sheer pleated linen to the shins over a short kilt
		const wb = tP(g.torso, [-1.16, -2.0]), wf = tP(g.torso, [1.0, -2.0]), bt = tP(g.torso, [-1.55, 0.2]);
		const hb0 = [tP(g.rS, [-0.95, 3.7]), tP(g.aS, [-0.95, 3.7])], hf0 = [tP(g.rS, [0.9, 3.5]), tP(g.aS, [0.9, 3.5])];
		const hb = hb0[0][0] < hb0[1][0] ? hb0[0] : hb0[1], hf = hf0[0][0] > hf0[1][0] ? hf0[0] : hf0[1];
		const kb = tP(g.rT, [-1.0, 2.0]), kf = tP(g.aT, [1.4, 1.6]);
		const d = sp([[wb[0], wb[1], 1], bt, kb, [hb[0], hb[1], 1], [hf[0], hf[1], 1], kf, [wf[0], wf[1], 1]], true, 0.15);
		const inner = sp([[wb[0], wb[1], 1], bt, [tP(g.rT, [-1.0, 1.8])[0], tP(g.rT, [-1.0, 1.8])[1], 1], [tP(g.aT, [1.05, 1.7])[0], tP(g.aT, [1.05, 1.7])[1], 1], [wf[0], wf[1], 1]], true, 0.15);
		const pleats: React.ReactNode[] = [];
		for (let i = 1; i < 14; i++) { const u = i / 14, a = lv(wb, wf, lerp(0.2, 1, u)), b = lv(hb, hf, u); pleats.push(<line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={PAL.linen2} strokeWidth={c.LW} opacity={0.9} />); }
		return <g key="robe"><Solid d={inner} r="linen" c={c} />
			<path d={d} fill={PAL.ink} opacity={0.0} />
			<path d={d} fill="none" stroke={PAL.ink} strokeWidth={c.OW * 1.4} strokeLinejoin="round" />
			<path d={d} fill={PAL.linen} opacity={0.62} />{pleats}
			<g transform={mx(g.torso)}><path d={poly([[-1.2, -2.25], [1.04, -2.25], [1.04, -1.8], [-1.22, -1.8]])} fill={PAL.linen} stroke={PAL.ink} strokeWidth={c.LW * 1.2} />
				<path d={sp([[0.6, -1.85], [1.1, -0.9], [1.55, -0.4], [1.25, -0.2], [0.5, -1.0]])} fill={PAL.linen} stroke={PAL.ink} strokeWidth={c.LW} /></g>
		</g>; };
	const sheath = () => { // Isis: red sheath dress with a gold bead-net, from under the breast to the ankles
		const P = (m: M, p: V): Pt => tP(m, p);
		const pts: Pt[] = [P(g.torso, [-1.22, -3.95]), P(g.torso, [-1.0, -2.1]), P(g.torso, [-1.55, 0.2]), P(g.rT, [-1.0, 2.0]), P(g.rS, [-0.8, 1.2]), P(g.rS, [-0.55, 4.75]), [...P(g.rS, [-0.42, 5.0]), 1] as Pt,
			[...P(g.aS, [0.55, 5.0]), 1] as Pt, P(g.aS, [0.7, 1.4]), P(g.aT, [1.05, 1.4]), P(g.torso, [1.25, -0.6]), P(g.torso, [0.95, -2.1]), [...P(g.torso, [1.55, -3.45]), 1] as Pt];
		const d = sp(pts, true, 0.15), cid = `${id}-dress`;
		const net: React.ReactNode[] = [];
		for (let i = -14; i < 14; i++) { net.push(<line key={'a' + i} x1={i * 0.7 - 8} y1={-12} x2={i * 0.7 + 8} y2={4} stroke={PAL.gold} strokeWidth={c.LW * 1.1} />, <line key={'b' + i} x1={i * 0.7 + 8} y1={-12} x2={i * 0.7 - 8} y2={4} stroke={PAL.gold} strokeWidth={c.LW * 1.1} />); }
		const top = P(g.torso, [1.55, -3.45]), back = P(g.torso, [-1.22, -3.95]);
		return <g key="sheath"><clipPath id={cid}><path d={d} /></clipPath><Solid d={d} r="red" c={c} />
			<g clipPath={`url(#${cid})`}>{net}</g>
			<line x1={top[0]} y1={top[1]} x2={tP(g.torso, [1.2, -6.4])[0]} y2={tP(g.torso, [1.2, -6.4])[1]} stroke={PAL.red} strokeWidth={c.LW * 3} />
			<line x1={back[0]} y1={back[1]} x2={tP(g.torso, [-0.9, -6.5])[0]} y2={tP(g.torso, [-0.9, -6.5])[1]} stroke={PAL.red} strokeWidth={c.LW * 3} />
			<path d={sp([[top[0], top[1], 1], [lv(back as V, top as V, 0.5)[0], lv(back as V, top as V, 0.5)[1] + 0.12], [back[0], back[1], 1]], false)} fill="none" stroke={PAL.gold} strokeWidth={c.LW * 2.2} />
		</g>; };
	const kalasiris = () => { // body 'f': the ankle-length close-fitting sheath (kalasiris) from above the bust, on two shoulder straps;
		// its line gives the bust, waist and hip in the canonical profile; the hem rides on the shins so it follows the legs in the walk
		const P = (m: M, p: V): Pt => tP(m, p), col = cast.dressCol ?? 'red', dc = (PAL as Record<string, string>)[col] ?? col;
		// the hem and the leg-side outline take the envelope of both legs (back-most leg behind, front-most in front), so the dress never
		// twists or lets a leg through when the legs cross mid-stride
		const bk = (m1: M, m2: M, p: V): V => { const a = tP(m1, p), b = tP(m2, p); return a[0] < b[0] ? a : b; }, fr = (m1: M, m2: M, p: V): V => { const a = tP(m1, p), b = tP(m2, p); return a[0] > b[0] ? a : b; };
		const pts: Pt[] = [[...P(g.torso, [-1.72, -5.02]), 1] as Pt, P(g.torso, [-1.1, -3.4]), P(g.torso, [-0.94, -2.4]), P(g.torso, [-1.98, 0.4]), bk(g.rT, g.aT, [-1.08, 2.0]), bk(g.rS, g.aS, [-0.74, 1.2]), bk(g.rS, g.aS, [-0.48, 4.75]), [...bk(g.rS, g.aS, [-0.4, 5.02]), 1] as Pt,
			[...fr(g.rS, g.aS, [0.5, 5.02]), 1] as Pt, fr(g.rS, g.aS, [0.6, 1.4]), fr(g.rT, g.aT, [1.02, 1.4]), P(g.torso, [1.6, -0.5]), P(g.torso, [0.84, -2.4]), P(g.torso, [1.4, -3.06]), P(g.torso, [2.12, -3.42]), P(g.torso, [2.22, -3.98]), [...P(g.torso, [1.62, -5.0]), 1] as Pt];
		const d = sp(pts, true, 0.15), cid = `${id}-dress`, net: React.ReactNode[] = [];
		if (cast.net !== false) for (let i = -22; i < 22; i++) net.push(<line key={'a' + i} x1={i * 0.7 - 11} y1={-17} x2={i * 0.7 + 11} y2={5} stroke={PAL.gold} strokeWidth={c.LW * 1.1} />, <line key={'b' + i} x1={i * 0.7 + 11} y1={-17} x2={i * 0.7 - 11} y2={5} stroke={PAL.gold} strokeWidth={c.LW * 1.1} />);
		const strap = (a: V, b: V, k: string) => { const A = tP(g.torso, a), Bq = tP(g.torso, b); return <line key={k} x1={A[0]} y1={A[1]} x2={Bq[0]} y2={Bq[1]} stroke={dc} strokeWidth={c.LW * 3.4} strokeLinecap="round" />; };
		// the fold between the legs and the advanced leg's line under the linen
		const lead = tP(g.aS, [0, 4])[0] > tP(g.rS, [0, 4])[0] ? [g.aT, g.aS] : [g.rT, g.rS], fold = sp([P(lead[0], [-0.62, 1.5]), P(lead[1], [-0.42, 0.6]), P(lead[1], [-0.3, 4.4])], false);
		const edge = [P(g.torso, [-1.72, -5.02]), P(g.torso, [1.62, -5.0])] as V[];
		return <g key="sheath"><clipPath id={cid}><path d={d} /></clipPath>
			{strap([-1.3, -5.0], [-0.95, -6.62], 'sb')}
			<Solid d={d} r={dc} c={c} />
			<g clipPath={`url(#${cid})`}>{net}<path d={fold} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.1} opacity={0.35} /></g>
			{strap([1.25, -4.98], [1.05, -6.6], 'sf')}
			<line x1={edge[0][0]} y1={edge[0][1]} x2={edge[1][0]} y2={edge[1][1]} stroke={PAL.gold} strokeWidth={c.LW * 2.2} />
		</g>; };
	const gown = () => { // ep60 Tutu: a sheer white linen gown from the shoulders to the ankles, legs showing through
		const P = (m: M, p: V): Pt => tP(m, p);
		const pts: Pt[] = [P(g.torso, [-2.6, -6.2]), P(g.torso, [-1.5, -4.2]), P(g.torso, [-1.1, -2.1]), P(g.torso, [-1.65, 0.2]), P(g.rT, [-1.05, 2.0]), P(g.rS, [-0.95, 1.4]), P(g.rS, [-0.9, 4.8]), [...P(g.rS, [-0.8, 5.1]), 1] as Pt,
			[...P(g.aS, [1.0, 5.1]), 1] as Pt, P(g.aS, [0.95, 1.6]), P(g.aT, [1.2, 1.4]), P(g.torso, [1.35, -0.6]), P(g.torso, [1.0, -2.1]), P(g.torso, [2.1, -3.9]), P(g.torso, [2.9, -6.1])];
		const d = sp(pts, true, 0.15), hb = P(g.rS, [-0.8, 5.1]) as V, hf = P(g.aS, [1.0, 5.1]) as V, wb = P(g.torso, [-1.1, -2.1]) as V, wf = P(g.torso, [1.0, -2.1]) as V;
		const pleats: React.ReactNode[] = [];
		for (let i = 1; i < 12; i++) { const u = i / 12, a = lv(wb, wf, u), b = lv(hb, hf, u); pleats.push(<line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={PAL.linen2} strokeWidth={c.LW} opacity={0.85} />); }
		const sash = [P(g.torso, [-1.15, -2.3]), P(g.torso, [1.05, -2.3])] as V[];
		return <g key="gown"><path d={d} fill="none" stroke={PAL.ink} strokeWidth={c.OW * 1.4} strokeLinejoin="round" />
			<path d={d} fill={PAL.linen} opacity={0.66} />{pleats}
			<line x1={sash[0][0]} y1={sash[0][1]} x2={sash[1][0]} y2={sash[1][1]} stroke={PAL.red} strokeWidth={c.LW * 2.6} />
			<g transform={`translate(${sash[1][0]},${sash[1][1]}) rotate(${-torsoRot * 0.8 + sway(1.3, 0.6, 3)})`}><path d={sp([[-0.1, 0, 1], [0.14, 0, 1], [0.22, 2.4], [0.0, 2.7, 1], [-0.16, 2.4]])} fill={PAL.red} stroke={PAL.ink} strokeWidth={c.OW * 1.1} /></g>
		</g>; };
	const shroud = () => { // Osiris: mummiform wrapping over body and legs, legs together
		const P = (m: M, p: V): Pt => tP(m, p);
		const wx = BT === 'm' ? 1.1 : 1, W = (x: number, y: number): V => [x * wx, y]; // body 'm': the wrapped body keeps the broad shoulders
		const pts: Pt[] = [P(g.torso, [-0.5, -6.9]), P(g.torso, W(-2.6, -6.3)), P(g.torso, W(-2.2, -4.6)), P(g.torso, [-1.6, -2.2]), P(g.torso, [-1.6, 0.3]), P(g.rT, [-0.95, 1.6]), P(g.rT, [-0.9, 3.0]), P(g.rS, [-0.8, 1.0]), P(g.rS, [-0.62, 4.3]), P(g.rF, [-0.5, 0.5]), [...P(g.rF, [-0.35, 0.73]), 1] as Pt,
			[...P(g.aF, [2.2, 0.73]), 1] as Pt, P(g.aF, [2.0, 0.35]), P(g.aF, [0.7, 0.0]), P(g.aS, [0.62, 3.6]), P(g.aS, [0.75, 0.6]), P(g.aT, [0.55, 3.75]), P(g.aT, [1.0, 1.5]), P(g.torso, [1.45, -0.6]), P(g.torso, [1.6, -2.6]), P(g.torso, W(2.0, -4.6)), P(g.torso, W(2.75, -6.3)), P(g.torso, [0.8, -6.9])];
		const d = sp(pts, true, 0.15), cid = `${id}-shroud`;
		const net: React.ReactNode[] = [];
		for (let i = -18; i < 18; i++) net.push(<line key={'a' + i} x1={i * 0.62 - 12} y1={-14} x2={i * 0.62 + 12} y2={6} stroke={PAL.turq} strokeWidth={c.LW * 0.9} opacity={0.75} />, <line key={'b' + i} x1={i * 0.62 + 12} y1={-14} x2={i * 0.62 - 12} y2={6} stroke={PAL.turq} strokeWidth={c.LW * 0.9} opacity={0.75} />);
		const dots: React.ReactNode[] = [];
		for (let i = -24; i < 24; i++) for (let j = -26; j < 12; j++) { const xx = (i + j) * 0.31 * 1.2, yy = (j - i) * 0.31 * 0.833 * 1.2; if (Math.abs(xx) < 9 && yy > -14 && yy < 6) dots.push(<circle key={`${i}.${j}`} cx={xx} cy={yy} r={0.07} fill={PAL.red} opacity={0.8} />); }
		// red sash with hanging ends (secondary)
		const sb = P(g.torso, [-1.5, -2.6]) as V, sf = P(g.torso, [1.6, -2.6]) as V, ends = P(g.torso, [1.2, -2.5]) as V, a = -torsoRot * 0.8 + sway(1.4, 1.1, 3);
		return <g key="shroud"><clipPath id={cid}><path d={d} /></clipPath><Solid d={d} r="linen" c={c} />
			<g clipPath={`url(#${cid})`}>{net}{dots}<path d={sp([[sb[0], sb[1] - 0.3], [sf[0], sf[1] - 0.3], [sf[0], sf[1] + 0.3], [sb[0], sb[1] + 0.3]])} fill={PAL.red} stroke={PAL.ink} strokeWidth={c.LW} /></g>
			<g transform={`translate(${ends[0]},${ends[1]}) rotate(${a})`}>{[0, 1].map((k) => <path key={k} d={sp([[-0.15 + k * 0.32, 0, 1], [0.15 + k * 0.32, 0, 1], [0.22 + k * 0.38, 3.2 - k * 0.5], [0.0 + k * 0.38, 3.55 - k * 0.5, 1], [-0.18 + k * 0.3, 3.2 - k * 0.5]])} fill={PAL.red} stroke={PAL.ink} strokeWidth={c.OW * 1.2} />)}</g>
		</g>; };
	// ---- head ----
	const H = g.head, lapA = -headRot * 0.9 + sway(1.25, 0.2, 2.2) - vh * 0.06, lapO: V = cast.head === 'human' ? [0.26, -1.22] : [-0.12, -1.0], lapM = chain(H, T(lapO[0], lapO[1]), R(lapA), cast.head === 'human' ? (BT === 'f' ? [0.94, 0, 0, 1.22, 0, 0] : I) : [0.82, 0, 0, 0.92, 0, 0]);
	const wigFill: Role = cast.wigColor ?? (cast.wig === 'duplex' ? 'wigH' : 'wig'), wigLine = cast.mask ? PAL.gold : wigFill === 'wig' ? PAL.wig2 : '#3a3436';
	const lappet = cast.wig === 'tri' && <g key="lappet" transform={mx(lapM)}><Solid d={SH.lappet} r={wigFill} c={c} />
		{[-0.2, 0.0, 0.2].map((xx) => <line key={xx} x1={xx} y1={0.15} x2={xx * 1.15} y2={2.7} stroke={wigLine} strokeWidth={c.LW * 1.1} />)}
		<rect x={-0.4} y={2.72} width={0.92} height={0.18} fill={PAL.gold} /><rect x={-0.38} y={3.02} width={0.88} height={0.18} fill={PAL.gold} /></g>;
	const headShape = cast.head === 'jackal' ? SH.jackal : cast.head === 'ibis' ? SH.ibis : cast.head === 'falcon' ? SH.falcon : SH.human;
	const headFill = cast.head === 'human' ? skin : cast.headFill ?? skin;
	// headband streamers (fillet ribbons at the back of the head) for gods with tri wig
	const strA = -headRot * 0.9 + sway(1.6, 0.9, 5) - vh * 0.1, strM = chain(H, T(-1.15, -1.9), R(strA + 12));
	const streamers = (cast.wig === 'tri' || cast.wig === 'duplex') && <g key="str" transform={mx(strM)}>{[0, 1].map((k) => <path key={k} d={sp([[-0.12 + k * 0.1, 0, 1], [0.14 + k * 0.1, 0, 1], [0.2 + k * 0.3, 2.0 - k * 0.4], [0.02 + k * 0.3, 2.35 - k * 0.4, 1], [-0.16 + k * 0.25, 2.0 - k * 0.4]])} fill={cast.wig === 'duplex' ? PAL.red : PAL.red} stroke={PAL.ink} strokeWidth={c.OW * 1.1} />)}</g>;
	const headGroup = <g key="head">
		{streamers}
		{cast.wig === 'tri' && cast.head !== 'human' && <g transform={mx(H)}><Solid d={SH.wigTriAnimal} r={wigFill} c={c} /></g>}
		{cast.mask && <g transform={mx(g.neck)}><path d={sp([[-0.75, -0.55, 1], [-0.62, -1.25, 1], [0.7, -1.18, 1], [0.86, -0.5, 1]])} fill={PAL.jackal} stroke={PAL.ink} strokeWidth={c.LW * 1.2} />
			<path d="M-0.72 -0.62L0.84 -0.56" stroke={PAL.gold} strokeWidth={c.LW * 2.6} /><path d="M-0.66 -0.9L0.78 -0.84" stroke={PAL.blue} strokeWidth={c.LW * 1.6} /></g>}
		{cast.head !== 'human' && lappet}
		<g transform={mx(H)}>
			{headArt !== undefined ? headArt : <>
			{cast.faceless ? null : (jaw > 0 || ear !== 0) && (cast.head === 'jackal' || cast.head === 'ibis' || cast.head === 'falcon') ? <SplitHead kind={cast.head} jaw={jaw} ear={ear} d={headShape} r={headFill} c={c} id={id} /> : <Solid d={headShape} r={headFill} c={c} />}
			{cast.head === 'human' && !cast.faceless && cast.wig === 'none' && <path d="M0.12 -1.22Q0.42 -1.3 0.42 -0.95Q0.42 -0.62 0.12 -0.62Z" fill={PAL[skin2]} stroke={PAL.ink} strokeWidth={c.LW} />}
			{cast.head === 'human' && !cast.faceless && <><Eye x={0.98} y={-1.17} L={0.48} c={c} /><path d="M1.31 -0.5L1.16 -0.5" stroke={PAL.ink} strokeWidth={c.LW} strokeLinecap="round" /><path d="M1.36 -0.78Q1.28 -0.72 1.3 -0.82" stroke={PAL.ink} strokeWidth={c.LW * 0.8} fill="none" /></>}
			{cast.head === 'jackal' && <><g transform={ear ? earXf(ear) : undefined}><Fl d={SH.jackalEar} r="gold" /></g>{jaw <= 0 && <path d={sp([[2.86, -0.66], [2.4, -0.55], [1.8, -0.42], [1.55, -0.45]], false)} fill="none" stroke={PAL.jackal2} strokeWidth={c.LW * 1.4} />}
				<path d={sp([[2.75, -0.95], [2.2, -1.06], [1.65, -1.25], [1.32, -1.52]], false)} fill="none" stroke={PAL.jackal2} strokeWidth={c.LW * 1.6} />
				<Eye x={1.4} y={-1.38} L={0.46} c={c} rim={PAL.gold} brow={false} tail={0.3} /><ellipse cx={2.84} cy={-0.8} rx={0.1} ry={0.07} fill={PAL.jackal2} /></>}
			{cast.head === 'ibis' && <>{jaw <= 0 && <><Fl d={SH.ibisBeak} r={PAL.ibis2} /><path d={sp([[1.12, -1.02], [1.8, -0.88], [2.45, -0.62], [3.0, -0.3], [3.36, 0.06]], false)} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.1} /></>}
				<Eye x={0.62} y={-1.32} L={0.4} c={c} rim={PAL.gold} brow={false} tail={0.22} /></>}
			{cast.head === 'falcon' && <><path d={sp([[0.52, 0.1], [0.98, -0.14], [1.2, -0.52], [1.1, -0.9], [0.72, -0.95], [0.5, -0.5]])} fill={PAL.white} />
				<Fl d={SH.falconBeak} r={PAL.ink} /><path d={sp([[1.05, -1.05], [0.98, -0.6], [0.86, -0.22, 1], [0.74, -0.6], [0.8, -1.05]])} fill={PAL.falcon2} />
				<Eye x={1.04} y={-1.3} L={0.5} c={c} rim={PAL.ink} brow={false} tail={0.25} /></>}
			</>}
			{cast.beard && <><Solid d={SH.beard} r="skinO2" c={c} />{[0.15, 0.4, 0.65, 0.9].map((yy) => <line key={yy} x1={1.1 + yy * 0.12} y1={yy} x2={1.36 + yy * 0.08} y2={yy + 0.04} stroke={PAL.ink} strokeWidth={c.LW * 0.8} />)}
				<path d="M1.08 -0.1Q0.5 -0.25 0.2 -0.85" fill="none" stroke={PAL.ink} strokeWidth={c.LW} /></>}
			{cast.wig === 'tri' && cast.head === 'human' && <><Solid d={SH.wigTri} r={wigFill} c={c} />{[-1.2, -0.85, -0.5].map((xx) => <path key={xx} d={`M${xx + 0.8} -2.5Q${xx} -1.6 ${xx - 0.1} 1.6`} fill="none" stroke={wigLine} strokeWidth={c.LW * 1.1} />)}
				<path d="M0.74 -1.62Q0.95 -2.0 0.6 -2.5" fill="none" stroke={PAL.gold} strokeWidth={c.LW * 2.4} /></>}
			{cast.wig === 'duplex' && <><Solid d={SH.wigDuplex} r={wigFill} c={c} />{[-0.3, 0.2, 0.7].map((yy) => <path key={yy} d={`M${0.75} ${yy - 0.6}Q${-0.5} ${yy - 0.2} ${-1.5} ${yy - 0.65}`} fill="none" stroke="#3a3436" strokeWidth={c.LW * 1.1} />)}
				<path d="M1.1 -1.72Q0.2 -1.55 -1.2 -2.15" fill="none" stroke={PAL.red} strokeWidth={c.LW * 2.6} /></>}
			{cast.wig === 'tri' && cast.head !== 'human' && headArt === undefined && <path d="M0.42 -1.25Q-0.4 -1.7 -1.35 -1.5" fill="none" stroke={PAL.gold} strokeWidth={c.LW * 2.2} />}
		</g>
		{cast.head === 'human' && lappet}
		<g transform={mx(H)}>{crown(cast.crown, c, t, amp)}</g>
	</g>;
	// ---- props ----
	const bG = gripPt(g.bH), fG = gripPt(g.fH);
	const prop = (k: PropKind, G: V, Hm: M, key: string) => {
		if (hide.props) return null;
		if (k === 'ankh') return <Ankh key={key} at={G} c={c} />;
		if (k === 'was') return <Was key={key} at={G} top={propTop ?? G[1] - 6.2} c={c} />;
		if (k === 'pen') return <Pen key={key} h={Hm} c={c} />;
		if (k === 'palette') return <Palette key={key} m={chain(T(G[0], G[1]), R(paletteA), T(1.45, 0))} c={c} />;
		if (k === 'crook') return <g key={key} transform={`translate(${G[0]},${G[1]}) scale(1.25) translate(${-G[0]},${-G[1]})`}><Crook at={G} a={16} c={{OW: c.OW / 1.25, LW: c.LW / 1.25}} /></g>;
		if (k === 'flail') return <Flail key={key} at={G} a={-30} c={c} t={t} />;
		if (k === 'sickle' || k === 'hoe') return <HeldTool key={key} kind={k} h={Hm} c={c} />;
		if (k === 'sistrum') return <Sistrum key={key} at={G} c={c} t={t} />;
		if (k === 'knife') return <Knife key={key} at={G} c={c} />;
		if (k === 'stalks') return <Stalks key={key} at={G} c={c} t={t} />;
		if (k === 'menat') return <Menat key={key} at={G} c={c} t={t} />;
		return null; };
	// ---- assemble (back → front) ----
	const female = BT ? BT === 'f' : cast.female;
	const torsoD = BS ? BS.torso : female ? SH.torsoF : SH.torsoM, neckD = BS ? BS.neck : SH.neck;
	const collarFit: [number, number] | undefined = BT === 'f' ? [-6.84, 0.98] : BT === 'm' ? [-6.9, 1.06] : undefined;
	const parts: React.ReactNode[] = [];
	const showB = !mummy && !hide.bArm, showF = !mummy && !hide.fArm, fsh = ap(g.fU, [0, 0]), mid = `${id}-shm`;
	if (cast.wings) parts.push(<Wing key="wb" U={g.bU} F={g.bF} c={c} t={t} seed={1.3} />);
	if (!mummy) parts.push(prop(bp, bG, g.bH, 'bpb'));
	parts.push(bullTail());
	if (!mummy) { parts.push(leg(g.rT, g.rS, g.rF, 'rleg')); parts.push(leg(g.aT, g.aS, g.aF, 'aleg')); }
	// torso pass: back arm, torso, neck and front arm share one outline, so the shoulders join without seams
	parts.push(<g key="torso">
		{showB && armInk(g.bU, g.bF, g.bH, cast.bHand, 'bi')}<Ink d={neckD} m={g.neck} c={c} /><Ink d={torsoD} m={g.torso} c={c} />{showF && armInk(g.fU, g.fF, g.fH, cast.fHand, 'fi')}
		{showB && armFill(g.bU, g.bF, g.bH, cast.bHand, 'bf')}<Fl d={torsoD} m={g.torso} r={skin} /><Fl d={neckD} m={g.neck} r={skin} />{showF && armFill(g.fU, g.fF, g.fH, cast.fHand, 'ff')}
		{showB && armDetail(g.bU, g.bF, g.bH, cast.bHand, 'bd')}
		{BT === 'm' && <g transform={mx(g.torso)} fill="none" stroke={PAL.line} strokeLinecap="round">{/* pectoral, sternum and the abdominal line of the canon */}
			<path d="M2.0 -4.3Q1.7 -3.3 0.75 -3.42" strokeWidth={c.LW * 1.1} opacity={0.75} /><path d="M0.3 -4.6Q0.38 -3.9 0.32 -3.3" strokeWidth={c.LW} opacity={0.4} /><path d="M0.55 -2.95Q0.62 -2.55 0.56 -2.2" strokeWidth={c.LW} opacity={0.45} />
			<circle cx={1.62} cy={-3.78} r={0.075} fill={PAL.ink} stroke="none" /></g>}
		{!female && !BT && <><circle cx={1.42} cy={-3.62} r={0.07} fill={PAL.ink} transform={mx(g.torso)} /><path d="M0.62 -1.2Q0.7 -1.05 0.58 -0.95" transform={mx(g.torso)} fill="none" stroke={PAL.ink} strokeWidth={c.LW} /></>}</g>);
	if (cast.dress === 'kilt') parts.push(kilt());
	if (cast.dress === 'robe') parts.push(robe());
	if (cast.dress === 'sheath') parts.push(BT === 'f' ? kalasiris() : sheath());
	if (cast.dress === 'gown') parts.push(gown());
	if (cast.dress === 'longkilt') parts.push(kilt());
	if (mummy) parts.push(shroud());
	parts.push(<Collar key="collar" m={g.torso} c={c} female={female} plain={cast.collar === 'plain'} fit={collarFit} />);
	if (cast.dress === 'robe') parts.push(<path key="shirt" d={(BT === 'm' ? (q: Pt[]) => sp(tf(q, [1.12, 0, 0, 1, 0, 0])) : sp)([[-3.3, -5.9], [-3.0, -6.7], [3.3, -6.7], [3.45, -5.8], [2.4, -5.0], [1.7, -4.4], [1.3, -2.4], [-1.0, -2.3], [-1.6, -4.6], [-2.6, -5.2]])} transform={mx(g.torso)} fill={PAL.linen} opacity={0.3} />);
	parts.push(headGroup);
	if (mummy) { // hands only, emerging from the shroud
		parts.push(prop(bp, bG, g.bH, 'bpb'));
		parts.push(prop(fp, fG, g.fH, 'fp'));
		parts.push(<g key="mh"><Solid d={SH.fist} m={g.bH} r={skin} c={c} /><Solid d={SH.fist} m={g.fH} r={skin} c={c} />
			<HandLines m={g.bH} kind="fist" c={c} /><HandLines m={g.fH} kind="fist" c={c} /></g>);
	} else {
		if (cast.wings) parts.push(<Wing key="wf" U={g.fU} F={g.fF} c={c} t={t + 0.4} seed={0.2} />);
		const holdsTop = fp === 'was';
		if (holdsTop) parts.push(prop(fp, fG, g.fH, 'fp'));
		if (showF) parts.push(<g key="farm"><mask id={mid} maskUnits="userSpaceOnUse" x={-60} y={-60} width={120} height={120}><rect x={-60} y={-60} width={120} height={120} fill="white" /><circle cx={fsh[0]} cy={fsh[1]} r={1.05} fill="black" /></mask>
			<g mask={`url(#${mid})`}>{armInk(g.fU, g.fF, g.fH, cast.fHand, 'oi')}{armFill(g.fU, g.fF, g.fH, cast.fHand, 'of')}</g>{armDetail(g.fU, g.fF, g.fH, cast.fHand, 'od')}</g>);
		if (!holdsTop) parts.push(prop(fp, fG, g.fH, 'fp'));
		// the curled fingers close over whatever the front fist holds (staff, ankh loop, knife, sistrum handle, stalks)
		if (showF && cast.fHand === 'fist' && (holdsTop || GRIPS.includes(fp))) parts.push(<FingersOver key="fistover" m={g.fH} skin={(PAL as Record<string, string>)[skin]} c={c} />);
	}
	if (explode) { // rig sheet: bare parts pulled apart, every pivot marked, the bone chain dashed
		const bare: React.ReactNode[] = [];
		bare.push(<g key="bw">{armInk(g.bU, g.bF, g.bH, cast.bHand, 'x1')}{armFill(g.bU, g.bF, g.bH, cast.bHand, 'x2')}</g>);
		bare.push(leg(g.rT, g.rS, g.rF, 'xr'), leg(g.aT, g.aS, g.aF, 'xa'));
		bare.push(<g key="xt"><Solid d={neckD} m={g.neck} r={skin} c={c} /><Solid d={torsoD} m={g.torso} r={skin} c={c} /></g>);
		bare.push(<Collar key="xc" m={g.torso} c={c} female={female} plain={cast.collar === 'plain'} fit={collarFit} />);
		bare.push(headGroup);
		bare.push(<g key="xf">{armInk(g.fU, g.fF, g.fH, cast.fHand, 'x3')}{armFill(g.fU, g.fF, g.fH, cast.fHand, 'x4')}{armDetail(g.fU, g.fF, g.fH, cast.fHand, 'x5')}</g>);
		parts.length = 0; parts.push(...bare);
	}
	if (pivots) { const P = PIVOTS(g), lnk: [keyof ReturnType<typeof PIVOTS>, keyof ReturnType<typeof PIVOTS>][] = [['hip', 'neck'], ['neck', 'head'], ['hip', 'bShoulder'], ['hip', 'fShoulder'], ['bShoulder', 'bElbow'], ['bElbow', 'bWrist'], ['fShoulder', 'fElbow'], ['fElbow', 'fWrist'], ['hip', 'rHip'], ['rHip', 'rKnee'], ['rKnee', 'rAnkle'], ['hip', 'aHip'], ['aHip', 'aKnee'], ['aKnee', 'aAnkle']];
		parts.push(<g key="piv">{lnk.map(([a, b]) => <line key={a + b} x1={P[a][0]} y1={P[a][1]} x2={P[b][0]} y2={P[b][1]} stroke={PAL.red2} strokeWidth={c.LW * 1.3} strokeDasharray={`${0.25} ${0.18}`} />)}
			{Object.entries(P).map(([k, v]) => <g key={k}><circle cx={v[0]} cy={v[1]} r={0.3} fill={PAL.white} stroke={PAL.ink} strokeWidth={c.LW * 1.2} /><circle cx={v[0]} cy={v[1]} r={0.17} fill={PAL.red} /></g>)}
			{[lapM, strM].map((m, i) => { const v = ap(m, [0, 0]); return <g key={'s' + i}><circle cx={v[0]} cy={v[1]} r={0.26} fill={PAL.white} stroke={PAL.ink} strokeWidth={c.LW} /><circle cx={v[0]} cy={v[1]} r={0.14} fill={PAL.blue} /></g>; })}
		</g>); }
	return <g transform={`translate(${x},${y}) scale(${s * face},${s})`}>{parts}</g>;
};
/** pull every bone frame away from the hip by k (rig sheet) */
export const explodeRig = (g: Rig, k: number): Rig => { const o = ap(g.root, [0, 0]), out = {} as Rig;
	(Object.keys(g) as (keyof Rig)[]).forEach((n) => { const m = g[n], d: V = [(m[4] - o[0]) * k, (m[5] - o[1]) * k]; out[n] = [m[0], m[1], m[2], m[3], m[4] + d[0], m[5] + d[1]]; });
	return out; };

/* ---------------- crowns (head frame) ---------------- */
function crown(k: Crown, c: Ctx, t: number, amp: number): React.ReactNode {
	if (k === 'atef') {
		const front = tf([[0, 0, 1], [-0.42, -0.6], [-0.62, -1.9], [-0.7, -3.2], [-0.82, -4.0], [-1.18, -4.3], [-1.42, -4.08], [-1.24, -3.75], [-1.08, -3.0], [-1.05, -1.8], [-0.88, -0.45], [-0.5, 0.05, 1]], [-1, 0, 0, 1, 0, 0]);
		const bands = (sgn: number, ox: number) => [-0.8, -1.6, -2.4, -3.2].map((yy, i) => <path key={yy} d={`M${ox + sgn * -0.45 * (1 + i * 0.12)} ${-1.85 + yy}Q${ox + sgn * -0.7} ${-1.95 + yy} ${ox + sgn * -0.98 * (1 + i * 0.04)} ${-1.85 + yy}`} fill="none" stroke={[PAL.red, PAL.blue, PAL.green, PAL.red][i]} strokeWidth={c.LW * 2.6} />);
		return <g>
			<g transform="translate(-0.62,-1.85)"><Solid d={SH.plume} r="linen" c={c} /></g>
			<g transform="translate(-0.62,0)">{bands(1, 0)}</g>
			<Solid d={SH.hedjet} r="linen" c={c} />
			{[-3.0, -4.2].map((yy) => <path key={yy} d={`M${-0.62 + (yy + 3) * -0.12} ${yy}Q0.2 ${yy + 0.25} ${1.0 + (yy + 3) * 0.1} ${yy}`} fill="none" stroke={PAL.gold} strokeWidth={c.LW * 1.6} />)}
			<circle cx={0.16} cy={-6.05} r={0.3} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW * 1.2} />
			<g transform="translate(1.0,-1.85)"><Solid d={sp(front)} r="linen" c={c} /></g>
			<g transform="translate(1.0,0)">{bands(-1, 0)}</g>
			<Solid d={SH.horns} r="gold" c={c} />
			<path d="M-1.8 -1.95Q-1.2 -2.05 -0.4 -1.88Q0.6 -2.05 1.6 -1.9Q2.1 -2.05 2.4 -2.2" fill="none" stroke={PAL.gold2} strokeWidth={c.LW * 1.2} />
			<Solid d={SH.uraeus} r="gold" c={c} /><circle cx={1.45} cy={-3.12} r={0.17} fill={PAL.red} stroke={PAL.ink} strokeWidth={c.LW} />
		</g>;
	}
	if (k === 'pschent') return <g>
		<Solid d={SH.redBack} r="red" c={c} />
		<Solid d={SH.whiteCrown} r="linen" c={c} /><circle cx={0.12} cy={-5.35} r={0.18} fill={PAL.linen} stroke={PAL.ink} strokeWidth={c.LW} />
		<Solid d={SH.redBase} r="red" c={c} />
		<path d={sp([[0.75, -2.9], [1.15, -3.45], [1.62, -3.62], [1.82, -3.32], [1.55, -3.12]], false)} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 3.4} strokeLinecap="round" />
		<path d={sp([[0.75, -2.9], [1.15, -3.45], [1.62, -3.62], [1.82, -3.32], [1.55, -3.12]], false)} fill="none" stroke={PAL.gold} strokeWidth={c.LW * 1.7} strokeLinecap="round" />
		<Solid d={SH.uraeus} r="gold" c={c} />
	</g>;
	if (k === 'moon') {
		const cres = sp([[-1.1, -3.25], [-0.75, -2.55], [0.1, -2.22], [0.95, -2.55], [1.3, -3.25, 1], [0.85, -2.82], [0.1, -2.6], [-0.65, -2.82]], true, 0.18);
		return <g><Solid d={sp([[-0.55, -2.35, 1], [0.75, -2.35, 1], [0.7, -2.05, 1], [-0.5, -2.05, 1]])} r="gold" c={c} />
			<circle cx={0.1} cy={-3.55} r={0.92} fill={PAL.ink} stroke={PAL.ink} strokeWidth={c.OW * 2} /><circle cx={0.1} cy={-3.55} r={0.92} fill={PAL.gold} />
			<circle cx={0.1} cy={-3.55} r={0.62} fill="none" stroke={PAL.gold2} strokeWidth={c.LW * 1.4} />
			<Solid d={cres} r="linen" c={c} /></g>;
	}
	if (k === 'isis') {
		const fe: React.ReactNode[] = [];
		for (let i = 0; i < 6; i++) fe.push(<path key={i} d={`M${0.6 - i * 0.32} ${-2.3 + i * 0.1}Q${0.2 - i * 0.35} ${-1.0 + i * 0.25} ${-0.5 - i * 0.18} ${0.2 + i * 0.02}`} fill="none" stroke={i % 2 ? PAL.blue : PAL.red} strokeWidth={c.LW * 2} />);
		return <g>
			<Solid d={SH.hornL} r="black" c={c} />
			<circle cx={0.12} cy={-4.4} r={1.02} fill={PAL.ink} stroke={PAL.ink} strokeWidth={c.OW * 2} /><circle cx={0.12} cy={-4.4} r={1.02} fill={PAL.red} />
			<circle cx={0.12} cy={-4.4} r={0.8} fill="none" stroke={PAL.gold} strokeWidth={c.LW * 1.6} />
			<Solid d={SH.hornR} r="black" c={c} />
			<Solid d={SH.modius} r="gold" c={c} />
			{[-0.5, -0.1, 0.3, 0.7].map((xx) => <path key={xx} d={`M${xx} -2.6L${xx} -2.92Q${xx + 0.12} -3.08 ${xx + 0.24} -2.92L${xx + 0.24} -2.6Z`} fill={PAL.blue} stroke={PAL.ink} strokeWidth={c.LW * 0.8} />)}
			<Solid d={SH.vulture} r="gold" c={c} />{fe}
			<Solid d={SH.vultureHead} r="gold" c={c} /><circle cx={1.36} cy={-1.84} r={0.06} fill={PAL.ink} />
			<g transform="translate(1.12,-3.2)"><Solid d={sp([[-0.12, 0.65], [-0.05, -0.1], [0.12, -0.38], [0.36, -0.3], [0.3, -0.08], [0.14, -0.04], [0.12, 0.65]])} r="gold" c={c} /></g>
		</g>;
	}
	if (k === 'cone') return <g>{/* perfume cone on the wig + a lotus bud over the brow */}
		<Solid d={sp([[-0.75, -2.62, 1], [0.55, -2.68, 1], [0.42, -3.3], [-0.05, -3.62], [-0.55, -3.36]])} r="#F1E1B2" c={c} />
		{[-0.45, -0.1, 0.25].map((x) => <path key={x} d={`M${x} -3.35Q${x + 0.08} -3.0 ${x - 0.05} -2.66`} fill="none" stroke="#D98A3A" strokeWidth={c.LW * 1.6} />)}
		<path d="M0.62 -2.25Q1.05 -2.05 1.2 -1.75" fill="none" stroke={PAL.green} strokeWidth={c.LW * 2} />
		<Solid d={sp([[1.12, -1.82, 1], [1.5, -1.6], [1.62, -1.2, 1], [1.3, -1.36], [1.16, -1.05, 1], [1.0, -1.42]], true, 0.2)} r="blue" c={c} />
	</g>;
	if (k === 'sun') return <g>{/* Ra's sun disc with the uraeus */}
		<circle cx={0.0} cy={-3.15} r={1.22} fill={PAL.ink} stroke={PAL.ink} strokeWidth={c.OW * 2} /><circle cx={0.0} cy={-3.15} r={1.22} fill={PAL.red} />
		<circle cx={0.0} cy={-3.15} r={0.95} fill="none" stroke={PAL.gold} strokeWidth={c.LW * 1.6} />
		<g transform="translate(-0.15,-0.25)"><Solid d={SH.uraeus} r="gold" c={c} /></g>
	</g>;
	if (k === 'maat') return <g transform="translate(-0.6,-1.95)"><Solid d={sp([[0, 0, 1], [0.24, -0.7], [0.18, -2.0], [0.05, -2.6], [-0.42, -2.82], [-0.62, -2.55], [-0.35, -2.4], [-0.25, -1.8], [-0.2, -0.6], [-0.18, 0, 1]])} r="linen" c={c} /></g>;
	return null;
}

/* =================== Ammit: her own small rig (crocodile head, lion forepart, hippopotamus hindquarters) ===================
   Seated like a dog on her mat, facing +x. Pivots: hip (body rocks about it: weight shift), neck base (head lunge / tilt), jaw hinge,
   tail root; the forepaws stay planted on the ground (legs re-fit each frame), breathing swells the chest. */
export type AmmitPose = {lean: number; neck: number; jaw: number; tail: number; breathe: number; paw?: number};
export const AMMIT_REST: AmmitPose = {lean: 0, neck: 0, jaw: 5, tail: 0, breathe: 0};
export const AMMIT_PIV = {hip: [-1.4, -2.4] as V, shoulder: [3.0, -1.6] as V, neck: [3.3, -4.3] as V, jaw: [0.7, 0.05] as V, tail: [-2.55, -1.0] as V};
export const ammitSolve = (p: AmmitPose) => {
	const B = chain(T(AMMIT_PIV.hip[0], AMMIT_PIV.hip[1]), R(-p.lean));
	const N = chain(B, T(AMMIT_PIV.neck[0], AMMIT_PIV.neck[1]), R(-p.neck + p.lean * 0.6));
	const J = chain(N, T(AMMIT_PIV.jaw[0], AMMIT_PIV.jaw[1]), R(p.jaw));
	return {B, N, J, S: ap(B, AMMIT_PIV.shoulder)};
};
export const Ammit: React.FC<{pose: AmmitPose; x: number; y: number; s: number; face?: 1 | -1; t?: number; pivots?: boolean}> = ({pose, x, y, s, face = 1, t = 0, pivots}) => {
	const c: Ctx = {OW: 2.7 / s, LW: 1.5 / s}, g = ammitSolve(pose), br = pose.breathe;
	const hippo = sp([[-2.55, 2.4, 1], [-2.85, 1.0], [-2.75, -0.6], [-2.1, -1.9], [-0.8, -2.75], [0.9, -3.2], [2.2, -3.0], [2.0, -0.6], [1.6, 1.3], [0.2, 1.75], [-1.2, 2.2]]);
	const lion = sp([[1.2, -3.15], [2.6, -3.7], [4.0, -3.6], [4.75 + br * 0.08, -2.6], [4.7 + br * 0.1, -1.0], [4.1, 0.3], [2.9, 0.9], [1.7, 1.2], [1.1, -0.6]]);
	const thigh = sp([[-2.1, 0.6], [-1.6, -0.9], [-0.2, -1.35], [1.0, -0.8], [1.35, 0.5], [1.1, 1.6], [0.0, 2.0], [-1.4, 1.9]]);
	// hind foot planted forward under the belly
	const hf = ap(g.B, [0.6, 2.4]);
	const hindFoot = sp([[hf[0] - 1.1, hf[1] - 1.3], [hf[0] + 0.3, hf[1] - 1.45], [hf[0] + 1.25, hf[1] - 0.6], [hf[0] + 1.45, hf[1] - 0.1], [hf[0] + 1.4, 0, 1], [hf[0] - 0.9, 0, 1], [hf[0] - 1.3, -0.6]]);
	// forelegs: from the (moving) shoulder to the (planted) paw
	const leg = (dx: number, lift = 0) => { const S = ap(g.B, [AMMIT_PIV.shoulder[0] + dx * 0.5, AMMIT_PIV.shoulder[1]]), P: V = [3.35 + dx + (pose.paw ?? 0) * (dx === 0 ? 1 : 0), -lift];
		return sp([[S[0] - 0.95, S[1] - 0.2], [S[0] + 0.8, S[1] - 0.5], [S[0] + 0.75, S[1] + 1.2], [P[0] + 0.5, P[1] - 1.6], [P[0] + 0.55, P[1] - 0.55], [P[0] + 1.35, P[1] - 0.35], [P[0] + 1.45, P[1], 1], [P[0] - 0.55, P[1], 1], [P[0] - 0.5, P[1] - 1.5], [S[0] - 0.6, S[1] + 1.4]], true, 0.17); };
	const tailM = chain(g.B, T(AMMIT_PIV.tail[0], AMMIT_PIV.tail[1]), R(14 + pose.tail + 5 * Math.sin(t * 1.7)));
	const tail = sp([[-0.18, -0.1], [0.2, -0.05], [0.0, 1.3], [-0.1, 2.3], [0.15, 2.9], [-0.25, 3.0], [-0.45, 2.4], [-0.35, 1.2]]);
	// head (neck frame N): mane, skull and the hinged lower jaw
	const mane = sp([[-0.7, -1.8], [0.4, -1.85], [1.05, -1.1], [1.15, 0.3], [0.95, 1.3], [0.4, 2.0], [-0.6, 2.05], [-1.6, 1.6], [-2.25, 0.7], [-2.1, -0.4], [-1.5, -1.3]]);
	const skull = sp([[-0.7, -1.2], [0.4, -1.65], [1.25, -1.62], [1.6, -1.98], [2.1, -1.75], [2.9, -1.45], [4.4, -1.18], [5.3, -0.98], [5.62, -0.62], [5.5, -0.22, 1], [0.9, -0.12, 1], [-0.5, 0.2]], true, 0.16);
	const jaw = sp([[-0.1, -0.12, 1], [4.75, -0.12, 1], [4.95, 0.12], [4.55, 0.45], [2.4, 0.62], [0.5, 0.62], [-0.25, 0.32]], true, 0.16);
	const teethU: React.ReactNode[] = [], teethL: React.ReactNode[] = [];
	for (let i = 0; i < 10; i++) { const xx = 1.35 + i * 0.4; teethU.push(<path key={i} d={`M${xx} -0.14L${xx + 0.12} 0.2L${xx + 0.24} -0.14Z`} fill={PAL.white} stroke={PAL.ink} strokeWidth={c.LW * 0.6} />);
		teethL.push(<path key={i} d={`M${xx - 0.85} -0.1L${xx - 0.73} -0.42L${xx - 0.61} -0.1Z`} fill={PAL.white} stroke={PAL.ink} strokeWidth={c.LW * 0.6} />); }
	const spots: V[] = [[2.9, -2.6], [3.7, -1.7], [3.2, -0.6], [4.1, -0.3], [2.3, -1.6]];
	return <g transform={`translate(${x},${y}) scale(${s * face},${s})`}>
		<g transform={mx(tailM)}><Solid d={tail} r="hippo" c={c} /></g>
		<Ink d={leg(-0.9)} c={c} /><Fl d={leg(-0.9)} r="lion2" />
		<g transform={mx(g.B)}><Ink d={hippo} c={c} /><Ink d={lion} c={c} /><Fl d={hippo} r="hippo" /><Fl d={lion} r="lion" />
			<path d="M1.25 -3.1Q2.0 -1.0 1.6 1.2" fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.2} />
			{spots.map(([a, b], i) => <ellipse key={i} cx={a} cy={b} rx={0.22} ry={0.15} fill={PAL.lion2} />)}
			<path d="M-2.2 0.9Q-0.4 2.0 1.3 1.4" fill="none" stroke={PAL.hippo2} strokeWidth={c.LW * 2} />
			<Solid d={thigh} r="hippo" c={c} /><path d="M-1.5 -0.5Q-0.2 -1.0 0.9 -0.3" fill="none" stroke={PAL.hippo2} strokeWidth={c.LW * 2} />
		</g>
		<Solid d={hindFoot} r="hippo" c={c} />
		{[0.45, 0.85].map((k) => <line key={k} x1={hf[0] + k} y1={-0.02} x2={hf[0] + k - 0.1} y2={-0.32} stroke={PAL.ink} strokeWidth={c.LW} />)}
		<Ink d={leg(0)} c={c} /><Fl d={leg(0)} r="lion" />
		{[0.15, 0.55, 0.95].map((k) => <line key={k} x1={3.35 + k + (pose.paw ?? 0)} y1={-0.02} x2={3.25 + k + (pose.paw ?? 0)} y2={-0.3} stroke={PAL.ink} strokeWidth={c.LW} />)}
		<g transform={mx(g.N)}>
			<Solid d={mane} r="lion" c={c} />
			{[-1.75, -1.25, -0.75, -0.25, 0.25, 0.7].map((xx, i) => <path key={xx} d={`M${xx + 0.6} -1.45Q${xx + 0.05} 0.4 ${xx - 0.1} ${1.85 - Math.abs(xx + 0.5) * 0.3}`} fill="none" stroke={[PAL.blue, PAL.red2, PAL.blue, PAL.lion2][i % 4]} strokeWidth={c.LW * 2.4} />)}
		</g>
		<g transform={mx(g.J)}><path d={sp([[-0.1, -0.1], [4.6, -0.1], [4.5, -0.6], [0.4, -0.75]])} fill={PAL.red2} /><Solid d={jaw} r="croc" c={c} />{teethL}
			<path d="M0.4 0.38Q2.4 0.5 4.4 0.32" fill="none" stroke={PAL.croc2} strokeWidth={c.LW * 1.6} /></g>
		<g transform={mx(g.N)}><Solid d={skull} r="croc" c={c} />{teethU}
			{[2.4, 3.0, 3.6, 4.2, 4.8].map((xx) => <path key={xx} d={`M${xx} ${-1.48 + (xx - 2.4) * 0.2}Q${xx + 0.18} -0.7 ${xx} -0.25`} fill="none" stroke={PAL.croc2} strokeWidth={c.LW * 1.3} />)}
			<path d="M0.6 -1.55Q1.6 -1.3 2.6 -1.4" fill="none" stroke={PAL.croc2} strokeWidth={c.LW * 1.2} />
			<Eye x={1.6} y={-1.38} L={0.5} c={c} brow={false} tail={0.28} /><ellipse cx={5.38} cy={-0.78} rx={0.11} ry={0.07} fill={PAL.ink} />
			{/* the wig-band where the mane meets the head */}
			<path d="M0.95 -1.6Q1.25 -0.7 0.95 0.1" fill="none" stroke={PAL.gold} strokeWidth={c.LW * 3} /><path d="M0.95 -1.6Q1.25 -0.7 0.95 0.1" fill="none" stroke={PAL.ink} strokeWidth={c.LW * 0.8} />
		</g>
		{pivots && <g>{[ap(g.B, [0, 0]), g.S, ap(g.N, [0, 0]), ap(g.J, [0, 0]), ap(tailM, [0, 0]), [3.35 + (pose.paw ?? 0), -0.2] as V, [hf[0], -0.2] as V].map((v, i) => <g key={i}><circle cx={v[0]} cy={v[1]} r={0.3} fill={PAL.white} stroke={PAL.ink} strokeWidth={c.LW * 1.2} /><circle cx={v[0]} cy={v[1]} r={0.17} fill={i > 4 ? PAL.blue : PAL.red} /></g>)}</g>}
	</g>;
};

/* ep61: crowns are reused by the qq61 casts */
export {crown};
