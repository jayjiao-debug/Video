import React from 'react';
import {GAITS} from '../qq/gaits';

/* Figure v4 — one-tone human silhouettes (owner 2026-10-24: "1 tone but still recognizable", "more human looking").
   A skeleton (mocap walk, or a designed pose built by 2D forward kinematics on the same bone lengths) is dressed in
   smooth outlines: thighs with buttocks, calves with a real bulge, shoes, a shaped torso, mitten hands, a profile head,
   then era clothing. Everything is one colour; an optional rim of light hugs only the outer contour. */
type P = [number, number];
export type Pose = Record<string, P>;   // body units, y up, feet at 0, facing +x
export type Look4 = {
	dress: 'robe' | 'coat' | 'jacket' | 'shirt' | 'dress' | 'tunic' | 'himation' | 'cloak' | 'pelt';
	legs?: 'bare' | 'trousers'; sleeves?: 'wide';
	head: 'bun' | 'futou' | 'tophat' | 'short' | 'cap' | 'bowl' | 'glasses' | 'long' | 'bald' | 'bob' | 'bowler' | 'cylcap' | 'hat' | 'egwig' | 'meso' | 'guan' | 'baldf' | 'child' | 'wild' | 'young';
	beard?: 'short' | 'long' | 'full' | 'moustache' | 'square' | 'mous2'; gait?: '08_04' | '08_01' | '08_11'; build?: number;
};
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const MAP: Record<string, string> = {Hips: 'Hips', LUp: 'LeftUpLeg', LKnee: 'LeftLeg', LAnk: 'LeftFoot', LToe: 'LToeTip', RUp: 'RightUpLeg', RKnee: 'RightLeg', RAnk: 'RightFoot', RToe: 'RToeTip',
	Spine1: 'Spine1', Neck1: 'Neck1', Head: 'Head', Top: 'HeadTop', LSh: 'LeftArm', LElb: 'LeftForeArm', LHand: 'LeftHand', RSh: 'RightArm', RElb: 'RightForeArm', RHand: 'RightHand'};
/** the mocap walk at phase u (loops) */
export const gaitPose = (g: string, u: number): Pose => { const out: Pose = {};
	for (const [k, n] of Object.entries(MAP)) { const a = GAITS[g].j[n], N = a.length / 2, x = (((u % 1) + 1) % 1) * N, i = Math.floor(x), f = x - i, j = (i + 1) % N; out[k] = [lerp(a[2 * i], a[2 * j], f), lerp(a[2 * i + 1], a[2 * j + 1], f)]; }
	return out; };
export const gaitStride = (g = '08_04') => GAITS[g].stride;
/* designed poses by FK (angles in degrees; legs/arms measured from straight down, + = forward) */
type FK = {hip: number; hipX?: number; lean: number; neck?: number; lt: number; lk: number; rt: number; rk: number; lf?: number; rf?: number; la: number; le: number; ra: number; re: number};
const BL = {thigh: 0.264, shin: 0.269, foot: 0.11, ankle: 0.045, spine: 0.155, neck: 0.0625, head: 0.0618, top: 0.066, sh: 0.058, upper: 0.194, fore: 0.135};
const D = Math.PI / 180, dir = (deg: number, l: number): P => [Math.sin(deg * D) * l, -Math.cos(deg * D) * l];   // 0 = down (y up coords → minus)
const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
export const fkPose = (k: FK): Pose => {
	const hips: P = [k.hipX ?? 0, k.hip], up = (a: number, l: number): P => [Math.sin(a * D) * l, Math.cos(a * D) * l];   // along the spine, up
	const leg = (t: number, kn: number, ft = 0, side = 1) => { const u: P = add(hips, [0.028 * side * 0.3, -0.066]), kneeP = add(u, dir(t, BL.thigh)), ank = add(kneeP, dir(t - kn, BL.shin)), toe = add(ank, [Math.cos(ft * D) * BL.foot, -BL.ankle + Math.sin(ft * D) * BL.foot]); return [u, kneeP, ank, toe]; };
	const [LUp, LKnee, LAnk, LToe] = leg(k.lt, k.lk, k.lf ?? 0, 1), [RUp, RKnee, RAnk, RToe] = leg(k.rt, k.rk, k.rf ?? 0, -1);
	const sp = add(hips, up(k.lean, BL.spine)), n1 = add(sp, up(k.lean + (k.neck ?? 0) * 0.5, BL.neck)), hd = add(n1, up(k.lean + (k.neck ?? 0), BL.head)), top = add(hd, up(k.lean + (k.neck ?? 0), BL.top));
	const sh = add(sp, up(k.lean, BL.sh));
	const arm = (a: number, e: number): [P, P] => { const el = add(sh, dir(a, BL.upper)); return [el, add(el, dir(a + e, BL.fore))]; };
	const [LElb, LHand] = arm(k.la, k.le), [RElb, RHand] = arm(k.ra, k.re);
	return {Hips: hips, LUp, LKnee, LAnk, LToe, RUp, RKnee, RAnk, RToe, Spine1: sp, Neck1: n1, Head: hd, Top: top, LSh: sh, LElb, LHand, RSh: add(sh, [0.008, -0.01]), RElb, RHand};
};
export const POSES = {
	stand: fkPose({hip: 0.655, lean: 3, lt: 2, lk: 2, rt: -3, rk: 3, la: -3, le: 10, ra: 4, re: 14}),
	lookUp: fkPose({hip: 0.655, lean: -4, neck: -28, lt: 2, lk: 2, rt: -4, rk: 3, la: -4, le: 8, ra: 3, re: 10}),
	speak: fkPose({hip: 0.65, lean: 12, neck: 4, lt: 6, lk: 8, rt: -8, rk: 5, la: 40, le: 50, ra: 20, re: 30}),
	listen: fkPose({hip: 0.65, lean: 8, neck: 8, lt: 3, lk: 4, rt: -4, rk: 4, la: 28, le: 128, ra: 6, re: 16}),
	sit: fkPose({hip: 0.37, lean: 6, lt: 88, lk: 92, rt: 84, rk: 86, la: 10, le: 40, ra: 6, re: 46}),
	type: fkPose({hip: 0.37, lean: 14, neck: 6, lt: 88, lk: 92, rt: 84, rk: 86, la: 34, le: 58, ra: 30, re: 62}),
	phoneSit: fkPose({hip: 0.37, lean: 2, neck: 10, lt: 86, lk: 90, rt: 92, rk: 96, la: 20, le: 140, ra: 18, re: 50}),
	phoneStand: fkPose({hip: 0.655, lean: 6, neck: 10, lt: 4, lk: 4, rt: -6, rk: 4, la: 24, le: 132, ra: 2, re: 12}),
	kneel: fkPose({hip: 0.36, lean: 14, neck: 8, lt: 94, lk: 94, rt: 0, rk: 90, rf: 160, la: 50, le: 40, ra: 40, re: 50}),
};
export const mixPose = (a: Pose, b: Pose, k: number): Pose => { const o: Pose = {}; for (const n of Object.keys(a)) o[n] = [lerp(a[n][0], b[n][0], k), lerp(a[n][1], b[n][1], k)]; return o; };

/* ---------- drawing ---------- */
const f1 = (v: number) => v.toFixed(1);
/** a smooth outline around a chain of points with per-point back/front half-widths (screen px) */
const chain = (pts: P[], back: number[], front: number[]) => {
	const L: P[] = [], R: P[] = [];
	for (let i = 0; i < pts.length; i++) {
		const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
		L.push([pts[i][0] + nx * back[i], pts[i][1] + ny * back[i]]); R.push([pts[i][0] - nx * front[i], pts[i][1] - ny * front[i]]);
	}
	const ring = [...L, ...R.reverse()];
	let d = `M${f1((ring[0][0] + ring[1][0]) / 2)},${f1((ring[0][1] + ring[1][1]) / 2)}`;
	for (let i = 1; i <= ring.length; i++) { const p = ring[i % ring.length], q = ring[(i + 1) % ring.length]; d += ` Q${f1(p[0])},${f1(p[1])} ${f1((p[0] + q[0]) / 2)},${f1((p[1] + q[1]) / 2)}`; }
	return d + ' Z';
};
const along = (a: P, b: P, n: number): P[] => Array.from({length: n + 1}, (_, i) => [lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)]);
const prof = (n: number, f: (s: number) => number) => Array.from({length: n + 1}, (_, i) => f(i / n));

export const Figure4: React.FC<{x: number; ground: number; h: number; pose: Pose; look: Look4; col?: string; flip?: boolean; T?: number; lag?: Pose}> = ({x, ground, h, pose, look, col = '#0b0a12', flip, T = 0, lag}) => {
	const S = (p: P): P => [x + p[0] * h, ground - p[1] * h];
	const J = (n: string) => S(pose[n]);
	const b = look.build ?? 1, trousers = look.legs !== 'bare' && look.dress !== 'robe' && look.dress !== 'dress' && look.dress !== 'tunic' && look.dress !== 'himation' && look.dress !== 'cloak' && look.dress !== 'pelt';
	const parts: string[] = [];
	// legs: thigh + shin as one smooth chain (buttock and calf bulge at the back), shoe
	const leg = (s: 'L' | 'R') => { const hip = J(`${s}Up`), kn = J(`${s}Knee`), an = J(`${s}Ank`), toe = J(`${s}Toe`);
		const tl = Math.hypot(hip[0] - kn[0], hip[1] - kn[1]) || 1, ext: P = [hip[0] + (hip[0] - kn[0]) / tl * 0.05 * h, hip[1] + (hip[1] - kn[1]) / tl * 0.05 * h];   // reach up into the pelvis
		const pts = [ext, ...along(hip, kn, 6), ...along(kn, an, 6).slice(1)], n = pts.length - 1;
		const backW = prof(n, (u) => (trousers ? (u < 0.5 ? lerp(0.064, 0.038, u * 2) : lerp(0.038, 0.032, (u - 0.5) * 2)) : (u < 0.5 ? lerp(0.07, 0.03, (u * 2) ** 0.8) : 0.03 + 0.016 * Math.sin(Math.PI * Math.min(1, (u - 0.5) * 2.6)) - 0.012 * Math.max(0, (u - 0.85) / 0.15))) * h * b);
		const frontW = prof(n, (u) => (trousers ? lerp(0.05, 0.03, u) : (u < 0.5 ? lerp(0.058, 0.03, u * 2) : lerp(0.03, 0.02, (u - 0.5) * 2))) * h * b);
		parts.push(chain(pts, backW, frontW));
		const fx = toe[0] - an[0], fy = toe[1] - an[1], fl = Math.hypot(fx, fy) || 1, ux = fx / fl, uy = fy / fl, nx = -uy, ny = ux;   // shoe along ankle→toe; n points to the sole
		const at = (p: P, du: number, dn: number) => `${f1(p[0] + (ux * du + nx * dn) * h)},${f1(p[1] + (uy * du + ny * dn) * h)}`, mid: P = [(an[0] + toe[0]) / 2, (an[1] + toe[1]) / 2];
		parts.push(`M${at(an, -0.022, -0.026)} Q${at(an, 0.02, -0.03)} ${at(mid, 0, -0.017)} Q${at(toe, -0.004, -0.017)} ${at(toe, 0.014, 0.003)} Q${at(toe, 0.006, 0.018)} ${at(toe, -0.03, 0.016)} L${at(an, -0.026, 0.042)} Q${at(an, -0.05, 0.03)} ${at(an, -0.022, -0.026)} Z`);
	};
	leg('R'); leg('L');
	// torso: pelvis → chest → neck, shaped
	const hips = J('Hips'), sp = J('Spine1'), n1 = J('Neck1'), hd = J('Head'), top = J('Top');
	{ const lu = J('LUp'), ru = J('RUp'), pm: P = [(lu[0] + ru[0]) / 2, (lu[1] + ru[1]) / 2 + 0.012 * h]; parts.push(chain([[hips[0], hips[1] - 0.02 * h], hips, pm], [0.07 * h * b, 0.076 * h * b, 0.066 * h * b], [0.062 * h * b, 0.064 * h * b, 0.058 * h * b])); }
	const tPts = [...along(hips, sp, 5), ...along(sp, n1, 3).slice(1)], tn = tPts.length - 1;
	parts.push(chain([[hips[0], hips[1] + 0.03 * h], ...tPts], [0.074, ...prof(tn, (u) => (u < 0.35 ? lerp(0.074, 0.06, u / 0.35) : u < 0.75 ? lerp(0.06, 0.07, (u - 0.35) / 0.4) : lerp(0.07, 0.026, (u - 0.75) / 0.25)))].map((v) => v * h * b),
		[0.062, ...prof(tn, (u) => (u < 0.4 ? lerp(0.064, 0.058, u / 0.4) : u < 0.78 ? lerp(0.058, 0.072, (u - 0.4) / 0.38) : lerp(0.072, 0.024, (u - 0.78) / 0.22)))].map((v) => v * h * b)));
	// arms with a mitten hand
	const arm = (s: 'L' | 'R') => { const sh = J(`${s}Sh`), el = J(`${s}Elb`), ha = J(`${s}Hand`);
		const pts = [...along(sh, el, 5), ...along(el, ha, 5).slice(1)], n = pts.length - 1;
		parts.push(chain(pts, prof(n, (u) => (u < 0.5 ? lerp(0.036, 0.024, u * 2) : lerp(0.024, 0.017, (u - 0.5) * 2)) * h * b), prof(n, (u) => (u < 0.15 ? 0.04 : u < 0.5 ? lerp(0.036, 0.022, (u - 0.15) / 0.35) : lerp(0.022, 0.016, (u - 0.5) * 2)) * h * b)));
		const dx = ha[0] - el[0], dy = ha[1] - el[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;   // a tapered mitten hand
		const h1: P = [ha[0] + ux * 0.022 * h, ha[1] + uy * 0.022 * h], h2: P = [ha[0] + ux * 0.05 * h, ha[1] + uy * 0.05 * h], h3: P = [ha[0] + ux * 0.066 * h, ha[1] + uy * 0.066 * h];
		parts.push(chain([ha, h1, h2, h3], [0.015 * h, 0.02 * h, 0.017 * h, 0.004 * h], [0.015 * h, 0.017 * h, 0.014 * h, 0.004 * h]));
		return {sh, el, ha};
	};
	const AR = arm('R'), AL = arm('L');
	// head: profile oriented neck → top
	const ang = Math.atan2(top[1] - n1[1], top[0] - n1[0]) + Math.PI / 2, hc: P = [lerp(hd[0], top[0], 0.45), lerp(hd[1], top[1], 0.45)], s = h * 0.93;
	const R = (px: number, py: number): P => { const c = Math.cos(ang), sn = Math.sin(ang); return [hc[0] + px * s * c - py * s * sn, hc[1] + px * s * sn + py * s * c]; };
	const Q = (px: number, py: number) => { const p = R(px, py); return `${f1(p[0])},${f1(p[1])}`; };
	parts.push(`M${Q(-0.02, 0.07)} C${Q(-0.066, 0.05)} ${Q(-0.072, -0.045)} ${Q(-0.018, -0.066)} C${Q(0.028, -0.08)} ${Q(0.058, -0.046)} ${Q(0.055, -0.014)} L${Q(0.058, 0.002)} L${Q(0.074, 0.024)} L${Q(0.058, 0.03)} L${Q(0.06, 0.041)} L${Q(0.055, 0.047)} C${Q(0.057, 0.064)} ${Q(0.041, 0.072)} ${Q(0.025, 0.068)} L${Q(0.022, 0.09)} L${Q(-0.025, 0.095)} Z`);
	switch (look.head) {
		case 'bun': parts.push(`M${Q(-0.06, -0.08)} a${f1(0.026 * s)},${f1(0.026 * s)} 0 1,0 ${f1(0.052 * s)},0 a${f1(0.026 * s)},${f1(0.026 * s)} 0 1,0 ${f1(-0.052 * s)},0 Z`, `M${Q(-0.066, 0.01)} Q${Q(-0.07, -0.07)} ${Q(0.0, -0.07)} Q${Q(0.05, -0.066)} ${Q(0.054, -0.03)} Q${Q(0.0, -0.05)} ${Q(-0.02, 0.0)} Z`); break;
		case 'futou': parts.push(`M${Q(-0.064, 0)} Q${Q(-0.064, -0.09)} ${Q(0, -0.09)} Q${Q(0.055, -0.086)} ${Q(0.055, -0.026)} Z`, `M${Q(-0.034, -0.08)} Q${Q(-0.02, -0.136)} ${Q(0.028, -0.09)} Z`,
			`M${Q(-0.05, -0.05)} Q${Q(-0.11, 0.0 + 0.01 * Math.sin(T * 3))} ${Q(-0.1 + 0.012 * Math.sin(T * 3.4), 0.11)} L${Q(-0.088 + 0.012 * Math.sin(T * 3.4), 0.112)} Q${Q(-0.095, 0.01)} ${Q(-0.04, -0.035)} Z`); break;
		case 'tophat': parts.push(`M${Q(-0.082, -0.04)} Q${Q(0, -0.058)} ${Q(0.078, -0.04)} L${Q(0.054, -0.058)} L${Q(0.058, -0.18)} L${Q(-0.05, -0.18)} L${Q(-0.05, -0.058)} Z`); break;
		case 'short': case 'glasses': parts.push(`M${Q(-0.066, 0.012)} Q${Q(-0.068, -0.072)} ${Q(0.01, -0.071)} Q${Q(0.055, -0.066)} ${Q(0.058, -0.032)} Q${Q(0.01, -0.047)} ${Q(-0.012, 0)} Z`); break;
		case 'cap': parts.push(`M${Q(-0.066, -0.016)} Q${Q(-0.056, -0.082)} ${Q(0.01, -0.079)} Q${Q(0.056, -0.074)} ${Q(0.06, -0.046)} L${Q(0.106, -0.038)} L${Q(0.056, -0.029)} Z`); break;
		case 'bowl': parts.push(`M${Q(-0.068, 0.02)} Q${Q(-0.07, -0.079)} ${Q(0.004, -0.077)} Q${Q(0.062, -0.07)} ${Q(0.062, -0.016)} L${Q(0.018, -0.026)} Q${Q(-0.018, -0.008)} ${Q(-0.028, 0.028)} Z`); break;
		case 'long': parts.push(`M${Q(-0.066, 0.15)} Q${Q(-0.094, -0.02)} ${Q(-0.046, -0.068)} Q${Q(0.012, -0.09)} ${Q(0.06, -0.028)} Q${Q(0.012, -0.04)} ${Q(-0.004, 0.028)} Q${Q(-0.018, 0.115)} ${Q(-0.066, 0.15)} Z`); break;
		case 'bowler': parts.push(`M${Q(-0.09, -0.03)} Q${Q(0, -0.05)} ${Q(0.085, -0.032)} Q${Q(0.06, -0.044)} ${Q(0.055, -0.06)} Q${Q(0.05, -0.122)} ${Q(-0.004, -0.124)} Q${Q(-0.06, -0.12)} ${Q(-0.064, -0.056)} Q${Q(-0.08, -0.044)} ${Q(-0.09, -0.03)} Z`); break;
		case 'hat': parts.push(`M${Q(-0.1, -0.034)} Q${Q(0, -0.05)} ${Q(0.1, -0.034)} L${Q(0.058, -0.056)} L${Q(0.054, -0.13)} Q${Q(0, -0.142)} ${Q(-0.052, -0.13)} L${Q(-0.058, -0.056)} Z`); break;
		case 'cylcap': parts.push(`M${Q(-0.062, -0.03)} L${Q(-0.058, -0.112)} Q${Q(0, -0.124)} ${Q(0.056, -0.112)} L${Q(0.056, -0.03)} Q${Q(0, -0.046)} ${Q(-0.062, -0.03)} Z`, `M${Q(-0.066, 0.0)} Q${Q(-0.09, 0.06)} ${Q(-0.06, 0.1)} Q${Q(-0.04, 0.06)} ${Q(-0.05, 0.0)} Z`); break;
		case 'bob': parts.push(`M${Q(-0.07, 0.07)} Q${Q(-0.09, -0.03)} ${Q(-0.04, -0.07)} Q${Q(0.02, -0.088)} ${Q(0.06, -0.03)} Q${Q(0.02, -0.035)} ${Q(0.0, 0.02)} Q${Q(-0.02, 0.07)} ${Q(-0.07, 0.07)} Z`); break;
		case 'egwig': parts.push(`M${Q(-0.08, 0.085)} Q${Q(-0.094, -0.07)} ${Q(-0.004, -0.086)} Q${Q(0.056, -0.084)} ${Q(0.06, -0.03)} L${Q(0.026, -0.024)} L${Q(0.022, 0.072)} Z`); break;
		case 'meso': parts.push(`M${Q(-0.068, 0.01)} Q${Q(-0.072, -0.076)} ${Q(0.0, -0.078)} Q${Q(0.056, -0.072)} ${Q(0.06, -0.034)} Q${Q(0.01, -0.046)} ${Q(-0.012, 0.0)} Z`, `M${Q(-0.05, -0.03)} Q${Q(-0.13, 0.02)} ${Q(-0.11, 0.15)} Q${Q(-0.08, 0.17)} ${Q(-0.05, 0.12)} Q${Q(-0.06, 0.04)} ${Q(-0.02, 0.0)} Z`, `M${Q(-0.07, -0.05)} L${Q(0.062, -0.05)} L${Q(0.062, -0.036)} L${Q(-0.07, -0.034)} Z`); break;
		case 'guan': parts.push(`M${Q(-0.066, 0.012)} Q${Q(-0.068, -0.072)} ${Q(0.01, -0.071)} Q${Q(0.055, -0.066)} ${Q(0.058, -0.032)} Q${Q(0.01, -0.047)} ${Q(-0.012, 0)} Z`, `M${Q(-0.036, -0.066)} L${Q(-0.03, -0.112)} Q${Q(0.0, -0.12)} ${Q(0.026, -0.112)} L${Q(0.03, -0.066)} Z`, `M${Q(-0.052, -0.094)} L${Q(0.05, -0.098)} L${Q(0.05, -0.091)} L${Q(-0.052, -0.087)} Z`); break;
		case 'baldf': parts.push(`M${Q(-0.069, 0.04)} Q${Q(-0.08, -0.02)} ${Q(-0.056, -0.05)} L${Q(-0.042, -0.03)} Q${Q(-0.05, 0.0)} ${Q(-0.04, 0.045)} Z`); break;
		case 'child': parts.push(`M${Q(-0.07, 0.03)} Q${Q(-0.075, -0.08)} ${Q(0.0, -0.08)} Q${Q(0.06, -0.075)} ${Q(0.062, -0.02)} Q${Q(0.02, -0.04)} ${Q(-0.01, 0.01)} Z`); break;
		case 'wild': parts.push(`M${Q(-0.07, 0.05)} Q${Q(-0.135, -0.0)} ${Q(-0.112, -0.075)} Q${Q(-0.13, -0.142)} ${Q(-0.055, -0.135)} Q${Q(-0.02, -0.178)} ${Q(0.035, -0.135)} Q${Q(0.095, -0.15)} ${Q(0.082, -0.09)} Q${Q(0.11, -0.068)} ${Q(0.06, -0.042)} L${Q(0.022, -0.05)} Q${Q(-0.03, -0.012)} ${Q(-0.028, 0.05)} Z`, `M${Q(-0.07, 0.0)} Q${Q(-0.145, 0.045)} ${Q(-0.102, 0.095)} Q${Q(-0.08, 0.065)} ${Q(-0.058, 0.055)} Z`); break;
		case 'young': parts.push(`M${Q(-0.072, 0.035)} Q${Q(-0.095, -0.085)} ${Q(0.0, -0.092)} Q${Q(0.068, -0.088)} ${Q(0.066, -0.036)} Q${Q(0.02, -0.058)} ${Q(-0.01, 0.0)} Z`); break;
		default: break;
	}
	if (look.beard) parts.push(look.beard === 'mous2' ? `M${Q(0.054, 0.02)} Q${Q(0.082, 0.028)} ${Q(0.074, 0.046)} Q${Q(0.052, 0.054)} ${Q(0.038, 0.036)} Z` : look.beard === 'square' ? `M${Q(0.056, 0.03)} L${Q(0.066, 0.17)} Q${Q(0.02, 0.2)} ${Q(-0.03, 0.17)} L${Q(-0.034, 0.03)} Z` : look.beard === 'long' ? `M${Q(0.036, 0.036)} Q${Q(0.064, 0.11)} ${Q(0.018, 0.17)} Q${Q(-0.018, 0.09)} ${Q(-0.027, 0.036)} Z` : look.beard === 'full' ? `M${Q(0.056, 0.032)} Q${Q(0.068, 0.09)} ${Q(0.027, 0.104)} Q${Q(-0.027, 0.08)} ${Q(-0.04, 0.018)} Z` : look.beard === 'moustache' ? `M${Q(0.056, 0.027)} Q${Q(0.07, 0.038)} ${Q(0.045, 0.04)} Z` : `M${Q(0.052, 0.036)} Q${Q(0.058, 0.077)} ${Q(0.022, 0.08)} Q${Q(-0.018, 0.064)} ${Q(-0.032, 0.027)} Z`);
	// clothing — lagging a little behind the body for the swing
	const LP = lag ?? pose, LS = (n: string) => S(LP[n]);
	const front = (p: P, d: number): P => [p[0] + d * h, p[1]];
	/* final pass (logic note 13, "backpack"): jackets and coat tops follow the torso axis, with one smooth back curve from
	   shoulder to hem, instead of an axis-aligned box whose back corner jutted out whenever the figure leaned */
	const ax0 = sp[0] - hips[0], ay0 = sp[1] - hips[1], al = Math.hypot(ax0, ay0) || 1, ax = ax0 / al, ay = ay0 / al, bkx = ay, bky = -ax;
	const TP = (s: number, w: number): P => [hips[0] + (ax * s + bkx * w) * h, hips[1] + (ay * s + bky * w) * h];
	const tq = (s: number, w: number) => { const p = TP(s, w); return `${f1(p[0])},${f1(p[1])}`; };
	if (look.dress === 'robe' || look.dress === 'dress') {   // long robe: follows the back, belted waist, moderate flare at the hem
		const hem = ground - (look.dress === 'robe' ? 0.06 : 0.2) * h, kn = [LS('LKnee'), LS('RKnee')], an = [LS('LAnk'), LS('RAnk')];
		const at = (K: P, A: P) => lerp(K[0], A[0], Math.min(1, Math.max(0, (hem - K[1]) / Math.max(1, A[1] - K[1]))));
		const fx = Math.max(at(kn[0], an[0]), at(kn[1], an[1])) + 0.03 * h, bx = Math.min(at(kn[0], an[0]), at(kn[1], an[1])) - 0.035 * h;
		const ch = J('Spine1'), wy = hips[1] - 0.05 * h, kx = Math.max(kn[0][0], kn[1][0]), ky = Math.max(kn[0][1], kn[1][1]), bkx = Math.min(kn[0][0], kn[1][0]);
		parts.push(`M${f1(hips[0] - 0.064 * h)},${f1(wy - 0.06 * h)} L${f1(hips[0] + 0.058 * h)},${f1(wy - 0.06 * h)} Q${f1(hips[0] + 0.062 * h)},${f1(wy)} ${f1(hips[0] + 0.068 * h)},${f1(hips[1])} Q${f1(kx + 0.05 * h)},${f1(ky - 0.12 * h)} ${f1(Math.max(kx + 0.035 * h, fx - 0.02 * h))},${f1(ky)} L${f1(fx)},${f1(hem)} Q${f1((fx + bx) / 2)},${f1(hem + 0.015 * h)} ${f1(bx)},${f1(hem + 0.004 * h)} L${f1(Math.min(bkx - 0.04 * h, bx + 0.02 * h))},${f1(ky)} Q${f1(hips[0] - 0.09 * h)},${f1(hips[1] + 0.05 * h)} ${f1(hips[0] - 0.074 * h)},${f1(hips[1] - 0.01 * h)} Q${f1(hips[0] - 0.068 * h)},${f1(wy)} ${f1(hips[0] - 0.064 * h)},${f1(wy - 0.06 * h)} Z`);
		void ch;
	}
	if (look.dress === 'coat') {   // frock coat: a fuller skirt to the knee, open a little in front
		const kn = [LS('LKnee'), LS('RKnee')], ky = Math.max(kn[0][1], kn[1][1]), fx = Math.max(kn[0][0], kn[1][0]) + 0.02 * h, bx = Math.min(kn[0][0], kn[1][0]) - 0.04 * h, wy = hips[1] - 0.06 * h;
		void wy; parts.push(`M${tq(0.06, 0.062)} L${tq(0.06, -0.056)} Q${f1(hips[0] + 0.066 * h)},${f1(hips[1])} ${f1(hips[0] + 0.07 * h)},${f1(hips[1] + 0.03 * h)} L${f1(fx)},${f1(ky - 0.04 * h)} Q${f1((fx + bx) / 2)},${f1(ky + 0.03 * h)} ${f1(bx)},${f1(ky + 0.01 * h)} Q${f1(hips[0] - 0.085 * h)},${f1(hips[1] + 0.06 * h)} ${f1(hips[0] - 0.074 * h)},${f1(hips[1])} Q${tq(0.03, 0.074)} ${tq(0.06, 0.062)} Z`);
	}
	if (look.dress === 'jacket') parts.push(`M${tq(0.1, 0.064)} Q${tq(0.02, 0.08)} ${tq(-0.055, 0.08)} Q${tq(-0.076, 0.079)} ${tq(-0.074, 0.06)} L${tq(-0.074, -0.068)} Q${tq(-0.072, -0.076)} ${tq(-0.05, -0.074)} Q${tq(0.02, -0.074)} ${tq(0.1, -0.062)} Z`);
	if (look.dress === 'tunic') { const kn = [LS('LKnee'), LS('RKnee')], hem = Math.max(kn[0][1], kn[1][1]) - 0.02 * h, fx = Math.max(kn[0][0], kn[1][0]) + 0.04 * h, bx = Math.min(kn[0][0], kn[1][0]) - 0.05 * h;
		parts.push(`M${tq(0.08, 0.066)} L${tq(0.08, -0.064)} Q${f1(fx)},${f1(hips[1] + 0.05 * h)} ${f1(fx)},${f1(hem)} L${f1(bx)},${f1(hem + 0.01 * h)} Q${f1(bx)},${f1(hips[1] + 0.05 * h)} ${tq(0.02, 0.078)} Q${tq(0.06, 0.074)} ${tq(0.08, 0.066)} Z`); }
	if (look.dress === 'himation' || look.dress === 'cloak' || look.dress === 'pelt') {   // ep42: a robe/tunic with a mantle hanging down the back
		const kn = [LS('LKnee'), LS('RKnee')], an = [LS('LAnk'), LS('RAnk')], ky = Math.max(kn[0][1], kn[1][1]), sh = J('LSh');
		const hemY = look.dress === 'himation' ? Math.max(an[0][1], an[1][1]) - 0.05 * h : ky - 0.02 * h;
		const fx = Math.max(kn[0][0], kn[1][0]) + 0.04 * h, bx = Math.min(kn[0][0], kn[1][0]) - 0.05 * h;
		parts.push(`M${f1(hips[0] - 0.08 * h)},${f1(hips[1] - 0.1 * h)} L${f1(hips[0] + 0.07 * h)},${f1(hips[1] - 0.1 * h)} Q${f1(fx)},${f1(hips[1] + 0.05 * h)} ${f1(fx)},${f1(hemY)} Q${f1((fx + bx) / 2)},${f1(hemY + 0.015 * h)} ${f1(bx)},${f1(hemY + 0.01 * h)} Q${f1(bx - 0.01 * h)},${f1(hips[1] + 0.05 * h)} ${f1(hips[0] - 0.08 * h)},${f1(hips[1] - 0.1 * h)} Z`);
		const cy = look.dress === 'himation' ? hemY - 0.08 * h : look.dress === 'cloak' ? ground - 0.28 * h : ky - 0.06 * h;
		const jag = look.dress === 'pelt' ? Array.from({length: 6}, (_, i) => `L${f1(lerp(hips[0] - 0.16 * h, hips[0] - 0.05 * h, i / 5))},${f1(cy + (i % 2 ? -0.04 : 0.02) * h)}`).join(' ') : `L${f1(hips[0] - 0.05 * h)},${f1(cy + 0.02 * h)}`;
		parts.push(`M${f1(sh[0] + 0.045 * h)},${f1(sh[1] - 0.02 * h)} Q${f1(sh[0] - 0.12 * h)},${f1(sh[1] + 0.0 * h)} ${f1(hips[0] - 0.16 * h)},${f1(cy)} ${jag} Q${f1(hips[0] - 0.06 * h)},${f1(hips[1] - 0.05 * h)} ${f1(sh[0] + 0.01 * h)},${f1(sh[1] + 0.07 * h)} Z`);
		if (look.dress === 'pelt') { const c: P = [sh[0] + 0.05 * h, sh[1] + 0.03 * h]; parts.push(`M${f1(c[0] - 0.02 * h)},${f1(c[1])} Q${f1(c[0] + 0.03 * h)},${f1(c[1] + 0.06 * h)} ${f1(c[0] + 0.01 * h)},${f1(c[1] + 0.13 * h)} L${f1(c[0] + 0.04 * h)},${f1(c[1] + 0.15 * h)} L${f1(c[0] - 0.02 * h)},${f1(c[1] + 0.155 * h)} Q${f1(c[0] - 0.01 * h)},${f1(c[1] + 0.06 * h)} ${f1(c[0] - 0.05 * h)},${f1(c[1] + 0.01 * h)} Z`); }
		if (look.dress === 'himation') parts.push(`M${f1(sh[0] + 0.05 * h)},${f1(sh[1] - 0.015 * h)} Q${f1(sh[0] + 0.07 * h)},${f1(sh[1] + 0.12 * h)} ${f1(hips[0] + 0.075 * h)},${f1(hips[1] + 0.02 * h)} L${f1(hips[0] + 0.02 * h)},${f1(hips[1] + 0.03 * h)} Q${f1(sh[0] + 0.0 * h)},${f1(sh[1] + 0.08 * h)} ${f1(sh[0] - 0.02 * h)},${f1(sh[1] - 0.01 * h)} Z`);
	}
	if (look.sleeves === 'wide') for (const A of [AR, AL]) { const lagH = A.ha; parts.push(`M${f1(A.el[0])},${f1(A.el[1] - 0.02 * h)} Q${f1(lagH[0] - 0.03 * h)},${f1(lagH[1] + 0.06 * h)} ${f1(lagH[0] - 0.075 * h)},${f1(lagH[1] + 0.075 * h)} L${f1(lagH[0] - 0.004 * h)},${f1(lagH[1] + 0.012 * h)} L${f1(lagH[0] + 0.004 * h)},${f1(lagH[1] - 0.024 * h)} Z`); }
	void front; void AL;
	return <g transform={flip ? `translate(${2 * x},0) scale(-1,1)` : undefined}>{parts.map((d, i) => <path key={i} d={d} fill={col} />)}</g>;
};

/** one-tone figure with a thin rim of light on its outer contour only */
export const Rimmed: React.FC<React.ComponentProps<typeof Figure4> & {rim?: string; rimOp?: number; rimDx?: number; rimDy?: number}> = ({rim = '#ffe2b0', rimOp = 0.35, rimDx = -2.2, rimDy = -1.6, ...p}) => { const k = Math.max(1, p.h / 450);
	return <g><g transform={`translate(${rimDx * k},${rimDy * k})`} opacity={rimOp}><Figure4 {...p} col={rim} /></g><Figure4 {...p} /></g>; };
