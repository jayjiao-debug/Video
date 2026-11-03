import React from 'react';
import {GAITS} from '../qq/gaits';

/* ep59 figure rig (copied from qq44/figure44 "Figure v4", owner-approved, + qq47/pose47 body logic), for the rest of ep59 to reuse.
   One-tone human silhouettes: a skeleton (mocap walk, or a designed pose by 2D forward kinematics on the same bone lengths) dressed in
   smooth outlines (thighs, calves, shoes, shaped torso, mitten hands, a faceless profile head), then clothing and kit.
   ep59 additions: `pack` (the traveller's big expedition pack with a rolled mat on top, strapped to the torso axis), new heads
   ('perm' for his mother, 'beanie'), `withArms` (override the mocap arms, e.g. thumbs in the pack straps), and `Lit` (one figure with
   up to two rims of light, e.g. dusk from the left and the open door from the right).
   Body units: height ≈ 1 (crown ≈ 0.98), y up, feet at 0, facing +x. `h` = screen px per body unit. */
type P = [number, number];
export type Pose = Record<string, P>;
/** what a part of a figure (or of its kit) is: Lit paints each role with `paint[role]` (default: the figure colour) */
export type Role = 'body' | 'hair' | 'beard' | 'coat' | 'pack' | 'hat' | 'gear' | 'load' | 'frame';
export type Paint = Partial<Record<Role, string>>;
export type Part = {d: string; role: Role; fill?: string};
export type Look59 = {
	dress: 'robe' | 'coat' | 'jacket' | 'shirt' | 'dress' | 'tunic' | 'parka' | 'fleece' | 'duster' | 'poncho' | 'suit' | 'wetsuit';
	legs?: 'bare' | 'trousers';
	head: 'short' | 'cap' | 'hat' | 'bob' | 'perm' | 'beanie' | 'young' | 'bald' | 'long' | 'cowboy' | 'swept' | 'hood';
	beard?: 'short' | 'full' | 'stubble'; build?: number;
	pack?: 'big' | 'small' | 'none';
	/** muted tints for hair / beard / coat / pack… (the rest stays the figure colour) */
	paint?: Paint;
};
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const MAP: Record<string, string> = {Hips: 'Hips', LUp: 'LeftUpLeg', LKnee: 'LeftLeg', LAnk: 'LeftFoot', LToe: 'LToeTip', RUp: 'RightUpLeg', RKnee: 'RightLeg', RAnk: 'RightFoot', RToe: 'RToeTip',
	Spine1: 'Spine1', Neck1: 'Neck1', Head: 'Head', Top: 'HeadTop', LSh: 'LeftArm', LElb: 'LeftForeArm', LHand: 'LeftHand', RSh: 'RightArm', RElb: 'RightForeArm', RHand: 'RightHand'};
/** the mocap walk at phase u (loops) */
export const gaitPose = (g: string, u: number): Pose => { const out: Pose = {};
	for (const [k, n] of Object.entries(MAP)) { const a = GAITS[g].j[n], N = a.length / 2, x = (((u % 1) + 1) % 1) * N, i = Math.floor(x), f = x - i, j = (i + 1) % N; out[k] = [lerp(a[2 * i], a[2 * j], f), lerp(a[2 * i + 1], a[2 * j + 1], f)]; }
	return out; };
/* designed poses by FK (degrees; legs/arms measured from straight down, + = forward) */
export type FK = {hip: number; hipX?: number; lean: number; neck?: number; lt: number; lk: number; rt: number; rk: number; lf?: number; rf?: number; la: number; le: number; ra: number; re: number};
export const BL = {thigh: 0.264, shin: 0.269, foot: 0.11, ankle: 0.045, spine: 0.155, neck: 0.0625, head: 0.0618, top: 0.066, sh: 0.058, upper: 0.194, fore: 0.135};
const DEG = Math.PI / 180, dir = (deg: number, l: number): P => [Math.sin(deg * DEG) * l, -Math.cos(deg * DEG) * l];
const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
export const fkPose = (k: FK): Pose => {
	const hips: P = [k.hipX ?? 0, k.hip], up = (a: number, l: number): P => [Math.sin(a * DEG) * l, Math.cos(a * DEG) * l];
	const leg = (t: number, kn: number, ft = 0, side = 1) => { const u: P = add(hips, [0.028 * side * 0.3, -0.066]), kneeP = add(u, dir(t, BL.thigh)), ank = add(kneeP, dir(t - kn, BL.shin)), toe = add(ank, [Math.cos(ft * DEG) * BL.foot, -BL.ankle + Math.sin(ft * DEG) * BL.foot]); return [u, kneeP, ank, toe]; };
	const [LUp, LKnee, LAnk, LToe] = leg(k.lt, k.lk, k.lf ?? 0, 1), [RUp, RKnee, RAnk, RToe] = leg(k.rt, k.rk, k.rf ?? 0, -1);
	const sp = add(hips, up(k.lean, BL.spine)), n1 = add(sp, up(k.lean + (k.neck ?? 0) * 0.5, BL.neck)), hd = add(n1, up(k.lean + (k.neck ?? 0), BL.head)), top = add(hd, up(k.lean + (k.neck ?? 0), BL.top));
	const sh = add(sp, up(k.lean, BL.sh));
	const arm = (a: number, e: number): [P, P] => { const el = add(sh, dir(a, BL.upper)); return [el, add(el, dir(a + e, BL.fore))]; };
	const [LElb, LHand] = arm(k.la, k.le), [RElb, RHand] = arm(k.ra, k.re);
	return {Hips: hips, LUp, LKnee, LAnk, LToe, RUp, RKnee, RAnk, RToe, Spine1: sp, Neck1: n1, Head: hd, Top: top, LSh: sh, LElb, LHand, RSh: add(sh, [0.008, -0.01]), RElb, RHand};
};
export const mixPose = (a: Pose, b: Pose, k: number): Pose => { const o: Pose = {}; for (const n of Object.keys(a)) o[n] = [lerp(a[n][0], b[n][0], k), lerp(a[n][1], b[n][1], k)]; return o; };
/** fk pose with the hip set so the lower sole touches y = 0 (qq47 R3: positions come from the body) */
export const grounded = (k: Omit<FK, 'hip'>): Pose => { const p = fkPose({...k, hip: 1} as FK), low = Math.min(p.LToe[1], p.RToe[1], p.LAnk[1] - BL.ankle, p.RAnk[1] - BL.ankle); return fkPose({...k, hip: 1 - low} as FK); };
/** replace the arms of any pose (mocap or FK) by FK angles from its own shoulders; null keeps that arm */
export const withArms = (p: Pose, L: [number, number] | null, R: [number, number] | null): Pose => {
	const o: Pose = {...p};
	if (L) { const el = add(p.LSh, dir(L[0], BL.upper)); o.LElb = el; o.LHand = add(el, dir(L[0] + L[1], BL.fore)); }
	if (R) { const el = add(p.RSh, dir(R[0], BL.upper)); o.RElb = el; o.RHand = add(el, dir(R[0] + R[1], BL.fore)); }
	return o; };
/** tilt the head (degrees, + = chin down) about the neck, for looks and nods on a mocap pose */
export const nod = (p: Pose, deg: number): Pose => { if (Math.abs(deg) < 0.01) return p;
	const o: Pose = {...p}, c = Math.cos(-deg * DEG), s = Math.sin(-deg * DEG), n = p.Neck1, r = (q: P): P => { const x = q[0] - n[0], y = q[1] - n[1]; return [n[0] + x * c - y * s, n[1] + x * s + y * c]; };
	o.Head = r(p.Head); o.Top = r(p.Top); return o; };

/* ---------- walking (qq47): the mocap gait re-grounded every frame; the body advances stride·h per cycle so feet don't slide ---------- */
export const GAIT = '08_04', STRIDE = GAITS[GAIT].stride, GAIT_S = GAITS[GAIT].seconds;
/** the brisk walk (CMU 08_01: longer stride, quicker cycle) for the driven stretches */
export const BRISK = '08_01', STRIDE_B = GAITS[BRISK].stride, GAIT_B_S = GAITS[BRISK].seconds;
export const walkPose = (phase: number, g = GAIT): Pose => { const p = gaitPose(g, phase), low = Math.min(p.LToe[1], p.RToe[1], p.LAnk[1] - 0.045, p.RAnk[1] - 0.045);
	const o: Pose = {}; for (const k of Object.keys(p)) o[k] = [p[k][0], p[k][1] - low]; return o; };
/** a steady walk on gait g: x and pose at time t (starts at t0 from x0; v = the gait's own speed × pace, so the feet never slide) */
export const walkG = (t: number, t0: number, x0: number, h: number, g = BRISK, pace = 1, dir1: 1 | -1 = 1) => {
	const st = GAITS[g].stride, sec = GAITS[g].seconds / pace, tt = Math.max(0, t - t0), ph = tt / sec;
	return {x: x0 + dir1 * ph * st * h, pose: walkPose(ph, g), phase: ph, dist: ph * st}; };
/** natural-speed walk from x0 starting at time t0, heading dir, stopping at t1 (holds `still` outside); `pace` < 1 = slower */
export const walkNat = (t: number, t0: number, t1: number, x0: number, dir1: 1 | -1, h: number, still: Pose, pace = 1) => {
	const v = STRIDE * h / GAIT_S * pace, tt = Math.max(0, Math.min(t1, t) - t0), x = x0 + dir1 * v * tt;
	if (t <= t0 || t >= t1) return {x, pose: still, moving: false, phase: 0};
	const ph = v * tt / (STRIDE * h); return {x, pose: walkPose(ph), moving: true, phase: ph};
};
/** a walk that eases into a stop: covers `dist` px from t0 to t1, the last ~0.35 s blends into `still` */
export const walkTo = (t: number, t0: number, t1: number, x0: number, x1: number, h: number, still: Pose) => {
	const T = t1 - t0, d = x1 - x0, k = Math.max(0, Math.min(1, (t - t0) / T));
	const ease = (u: number) => (u < 0.82 ? u / 0.91 : 0.9011 + (1 - Math.pow(1 - (u - 0.82) / 0.18, 2)) * 0.0989);   // constant speed, then decelerate
	const x = x0 + d * Math.min(1, ease(k)), ph = Math.abs(x - x0) / (STRIDE * h);
	if (t <= t0) return {x: x0, pose: still, moving: false};
	const blend = Math.max(0, Math.min(1, (t - (t1 - 0.32)) / 0.32));
	const wp = walkPose(ph);
	return {x, pose: blend > 0 ? mixPose(wp, still, blend * blend * (3 - 2 * blend)) : wp, moving: k < 1};
};

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

/** the big pack's outline in the torso frame (P(s, w): s up the spine, w toward the back, both × h): body, mat roll, side pocket, shoulder strap */
export const packD = (P: (s: number, w: number) => string, bw = 1): string[] => [
	`M${P(0.02, 0.05 * bw)} Q${P(-0.02, 0.12 * bw)} ${P(0.0, 0.2 * bw)} Q${P(0.02, 0.235 * bw)} ${P(0.08, 0.235 * bw)} L${P(0.33, 0.215 * bw)} Q${P(0.4, 0.21 * bw)} ${P(0.405, 0.15 * bw)} L${P(0.41, 0.07 * bw)} Q${P(0.4, 0.045 * bw)} ${P(0.36, 0.05 * bw)} L${P(0.24, 0.055 * bw)} Q${P(0.12, 0.06 * bw)} ${P(0.02, 0.05 * bw)} Z`,
	`M${P(0.395, 0.03 * bw)} Q${P(0.43, 0.025 * bw)} ${P(0.465, 0.04 * bw)} L${P(0.475, 0.235 * bw)} Q${P(0.44, 0.255 * bw)} ${P(0.405, 0.235 * bw)} Z`,
	`M${P(0.06, 0.215 * bw)} L${P(0.06, 0.262 * bw)} Q${P(0.1, 0.27 * bw)} ${P(0.18, 0.262 * bw)} L${P(0.18, 0.218 * bw)} Z`,
	`M${P(0.31, 0.035 * bw)} Q${P(0.34, -0.02 * bw)} ${P(0.3, -0.06 * bw)} L${P(0.27, -0.055 * bw)} Q${P(0.3, -0.015 * bw)} ${P(0.28, 0.035 * bw)} Z`,
];
/** the same pack as a loose prop: centre (x, y) = its torso-frame point (s 0.195, w 0.14), `a` = tilt (deg, 0 = upright), h = the wearer's scale */
export const PackProp: React.FC<{x: number; y: number; h: number; a?: number; col?: string; rims?: Rim[]}> = ({x, y, h, a = 0, col = '#0c0b0e', rims = []}) => {
	const P = (s: number, w: number) => `${f1(-(w - 0.14) * h)},${f1(-(s - 0.195) * h)}`, ds = packD(P).slice(0, 3);
	return <g transform={`translate(${f1(x)},${f1(y)}) rotate(${f1(a)})`}>
		{rims.map((r, i) => <g key={i} opacity={r.o} transform={`translate(${r.dx * h / 450},${r.dy * h / 450})`}>{ds.map((d, j) => <path key={j} d={d} fill={r.c} />)}</g>)}
		{ds.map((d, j) => <path key={j} d={d} fill={col} />)}</g>;
};
/** a small daypack in the torso frame */
const packSmallD = (P: (s: number, w: number) => string, bw = 1): string[] => [
	`M${P(0.1, 0.05 * bw)} Q${P(0.06, 0.12 * bw)} ${P(0.09, 0.16 * bw)} L${P(0.3, 0.165 * bw)} Q${P(0.36, 0.15 * bw)} ${P(0.35, 0.09 * bw)} L${P(0.34, 0.05 * bw)} Z`,
	`M${P(0.31, 0.035 * bw)} Q${P(0.33, -0.02 * bw)} ${P(0.29, -0.055 * bw)} L${P(0.27, -0.05 * bw)} Q${P(0.29, -0.015 * bw)} ${P(0.28, 0.035 * bw)} Z`,
];
/** the parts of one figure (screen coordinates, unflipped), each tagged with its role */
export const figParts = (x: number, ground: number, h: number, pose: Pose, look: Look59): Part[] => {
	const S = (p: P): P => [x + p[0] * h, ground - p[1] * h];
	const J = (n: string) => S(pose[n]);
	const b = look.build ?? 1, trousers = look.legs !== 'bare' && look.dress !== 'robe' && look.dress !== 'dress' && look.dress !== 'tunic' && look.dress !== 'wetsuit';
	const bulk = look.dress === 'suit' ? 1.12 : look.dress === 'wetsuit' ? 0.92 : 1;
	const parts: Part[] = [], push = (d: string, role: Role = 'body') => parts.push({d, role});
	const hips = J('Hips'), sp = J('Spine1'), n1 = J('Neck1'), hd = J('Head'), top = J('Top');
	/* the torso frame: s along the spine (up), w toward the back */
	const ax0 = sp[0] - hips[0], ay0 = sp[1] - hips[1], al = Math.hypot(ax0, ay0) || 1, ax = ax0 / al, ay = ay0 / al, bkx = ay, bky = -ax;
	const tq = (s: number, w: number) => { const p: P = [hips[0] + (ax * s + bkx * w) * h, hips[1] + (ay * s + bky * w) * h]; return `${f1(p[0])},${f1(p[1])}`; };
	// the pack first (behind)
	if (look.pack === 'big') packD(tq, b).forEach((d) => push(d, 'pack'));
	else if (look.pack === 'small') packSmallD(tq, b).forEach((d) => push(d, 'pack'));
	// the head's frame (used by the long hair that falls behind the body)
	const ang = Math.atan2(top[1] - n1[1], top[0] - n1[0]) + Math.PI / 2, hc: P = [lerp(hd[0], top[0], 0.45), lerp(hd[1], top[1], 0.45)], hs = h * 0.93;
	const R = (px: number, py: number): P => { const c = Math.cos(ang), sn = Math.sin(ang); return [hc[0] + px * hs * c - py * hs * sn, hc[1] + px * hs * sn + py * hs * c]; };
	const Q = (px: number, py: number) => { const p = R(px, py); return `${f1(p[0])},${f1(p[1])}`; };
	const longHair = () => push(`M${Q(0.062, -0.012)} Q${Q(0.074, -0.07)} ${Q(0.012, -0.092)} Q${Q(-0.074, -0.094)} ${Q(-0.09, -0.02)} Q${Q(-0.1, 0.07)} ${Q(-0.082, 0.14)} Q${Q(-0.072, 0.158)} ${Q(-0.058, 0.146)} Q${Q(-0.05, 0.1)} ${Q(-0.042, 0.06)} Q${Q(-0.03, 0.0)} ${Q(0.0, -0.03)} Q${Q(0.04, -0.05)} ${Q(0.062, -0.012)} Z`, 'hair');
	// legs: thigh + shin as one smooth chain, shoe
	const leg = (s: 'L' | 'R') => { const hip = J(`${s}Up`), kn = J(`${s}Knee`), an = J(`${s}Ank`), toe = J(`${s}Toe`);
		const tl = Math.hypot(hip[0] - kn[0], hip[1] - kn[1]) || 1, ext: P = [hip[0] + (hip[0] - kn[0]) / tl * 0.05 * h, hip[1] + (hip[1] - kn[1]) / tl * 0.05 * h];
		const pts = [ext, ...along(hip, kn, 6), ...along(kn, an, 6).slice(1)], n = pts.length - 1;
		const backW = prof(n, (u) => (trousers ? (u < 0.5 ? lerp(0.064, 0.038, u * 2) : lerp(0.038, 0.032, (u - 0.5) * 2)) : (u < 0.5 ? lerp(0.07, 0.03, (u * 2) ** 0.8) : 0.03 + 0.016 * Math.sin(Math.PI * Math.min(1, (u - 0.5) * 2.6)) - 0.012 * Math.max(0, (u - 0.85) / 0.15))) * h * b * bulk);
		const frontW = prof(n, (u) => (trousers ? lerp(0.05, 0.03, u) : (u < 0.5 ? lerp(0.058, 0.03, u * 2) : lerp(0.03, 0.02, (u - 0.5) * 2))) * h * b * bulk);
		push(chain(pts, backW, frontW));
		const fx = toe[0] - an[0], fy = toe[1] - an[1], fl = Math.hypot(fx, fy) || 1, ux = fx / fl, uy = fy / fl, nx = -uy, ny = ux;
		const boot = look.pack === 'big' || look.dress === 'suit' || look.dress === 'poncho' ? 1.12 : 1;   // the walker wears boots: a little higher and rounder
		const at = (p: P, du: number, dn: number) => `${f1(p[0] + (ux * du + nx * dn * boot) * h)},${f1(p[1] + (uy * du + ny * dn * boot) * h)}`, mid: P = [(an[0] + toe[0]) / 2, (an[1] + toe[1]) / 2];
		push(`M${at(an, -0.022, -0.03)} Q${at(an, 0.02, -0.034)} ${at(mid, 0, -0.019)} Q${at(toe, -0.004, -0.019)} ${at(toe, 0.016, 0.003)} Q${at(toe, 0.008, 0.02)} ${at(toe, -0.03, 0.018)} L${at(an, -0.028, 0.042)} Q${at(an, -0.052, 0.03)} ${at(an, -0.022, -0.03)} Z`);
	};
	leg('R'); leg('L');
	{ const lu = J('LUp'), ru = J('RUp'), pm: P = [(lu[0] + ru[0]) / 2, (lu[1] + ru[1]) / 2 + 0.012 * h]; push(chain([[hips[0], hips[1] - 0.02 * h], hips, pm], [0.07 * h * b, 0.076 * h * b, 0.066 * h * b], [0.062 * h * b, 0.064 * h * b, 0.058 * h * b])); }
	const tPts = [...along(hips, sp, 5), ...along(sp, n1, 3).slice(1)], tn = tPts.length - 1, tb = b * bulk;
	push(chain([[hips[0], hips[1] + 0.03 * h], ...tPts], [0.074, ...prof(tn, (u) => (u < 0.35 ? lerp(0.074, 0.06, u / 0.35) : u < 0.75 ? lerp(0.06, 0.07, (u - 0.35) / 0.4) : lerp(0.07, 0.026, (u - 0.75) / 0.25)))].map((v) => v * h * tb),
		[0.062, ...prof(tn, (u) => (u < 0.4 ? lerp(0.064, 0.058, u / 0.4) : u < 0.78 ? lerp(0.058, 0.072, (u - 0.4) / 0.38) : lerp(0.072, 0.024, (u - 0.78) / 0.22)))].map((v) => v * h * tb)));
	// a long coat (duster / cardigan) hangs from the shoulders to the knees, behind the arms
	if (look.dress === 'coat' || look.dress === 'duster') {
		const LS = (n: string) => S(pose[n]), kn = [LS('LKnee'), LS('RKnee')], ky = Math.max(kn[0][1], kn[1][1]), fx = Math.max(kn[0][0], kn[1][0]) + 0.02 * h, bx = Math.min(kn[0][0], kn[1][0]) - 0.04 * h;
		push(`M${tq(0.06, 0.066)} L${tq(0.06, -0.06)} Q${f1(hips[0] + 0.068 * h)},${f1(hips[1])} ${f1(hips[0] + 0.072 * h)},${f1(hips[1] + 0.03 * h)} L${f1(fx)},${f1(ky - 0.05 * h)} Q${f1((fx + bx) / 2)},${f1(ky + 0.0 * h)} ${f1(bx)},${f1(ky - 0.02 * h)} Q${f1(hips[0] - 0.085 * h)},${f1(hips[1] + 0.06 * h)} ${f1(hips[0] - 0.076 * h)},${f1(hips[1])} Q${tq(0.03, 0.078)} ${tq(0.06, 0.066)} Z`, 'coat');
		if (look.dress === 'duster') push(`M${tq(0.205, 0.068)} Q${tq(0.1, 0.084)} ${tq(0.0, 0.08)} L${tq(0.0, -0.07)} Q${tq(0.1, -0.078)} ${tq(0.2, -0.072)} Z`, 'coat'); }
	if (look.dress === 'poncho') {   // a camo poncho: a cape from the shoulders to mid-thigh, hem fluttering on its own clock (pose-driven)
		const hy = hips[1] + 0.2 * h, sw = Math.sin((pose.LKnee[0] - pose.RKnee[0]) * 9) * 0.012 * h;
		push(`M${tq(0.235, -0.01)} Q${tq(0.225, -0.085)} ${tq(0.17, -0.1)} Q${f1(hips[0] + 0.15 * h)},${f1(hips[1] - 0.05 * h)} ${f1(hips[0] + 0.17 * h + sw)},${f1(hy)} Q${f1(hips[0])},${f1(hy + 0.03 * h)} ${f1(hips[0] - 0.19 * h - sw)},${f1(hy - 0.01 * h)} Q${f1(hips[0] - 0.16 * h)},${f1(hips[1] - 0.06 * h)} ${tq(0.17, 0.105)} Q${tq(0.228, 0.09)} ${tq(0.235, -0.01)} Z`, 'coat'); }
	// arms with a tapered mitten hand
	const arm = (s: 'L' | 'R') => { const sh = J(`${s}Sh`), el = J(`${s}Elb`), ha = J(`${s}Hand`);
		const pts = [...along(sh, el, 5), ...along(el, ha, 5).slice(1)], n = pts.length - 1, sl = (look.dress === 'parka' || look.dress === 'fleece' || look.dress === 'suit' ? 1.15 : look.dress === 'wetsuit' ? 0.9 : 1);
		push(chain(pts, prof(n, (u) => (u < 0.5 ? lerp(0.036, 0.024, u * 2) : lerp(0.024, 0.017, (u - 0.5) * 2)) * h * b * sl), prof(n, (u) => (u < 0.15 ? 0.04 : u < 0.5 ? lerp(0.036, 0.022, (u - 0.15) / 0.35) : lerp(0.022, 0.016, (u - 0.5) * 2)) * h * b * sl)), look.dress === 'suit' ? 'coat' : 'body');
		const dx = ha[0] - el[0], dy = ha[1] - el[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
		const h1: P = [ha[0] + ux * 0.022 * h, ha[1] + uy * 0.022 * h], h2: P = [ha[0] + ux * 0.05 * h, ha[1] + uy * 0.05 * h], h3: P = [ha[0] + ux * 0.066 * h, ha[1] + uy * 0.066 * h];
		push(chain([ha, h1, h2, h3], [0.015 * h, 0.02 * h, 0.017 * h, 0.004 * h], [0.015 * h, 0.017 * h, 0.014 * h, 0.004 * h]));
	};
	if (look.head === 'long' || look.head === 'cowboy') longHair();
	arm('R'); arm('L');
	// head: a faceless profile, oriented neck → top
	push(`M${Q(-0.02, 0.07)} C${Q(-0.066, 0.05)} ${Q(-0.072, -0.045)} ${Q(-0.018, -0.066)} C${Q(0.028, -0.08)} ${Q(0.058, -0.046)} ${Q(0.055, -0.014)} L${Q(0.058, 0.002)} L${Q(0.074, 0.024)} L${Q(0.058, 0.03)} L${Q(0.06, 0.041)} L${Q(0.055, 0.047)} C${Q(0.057, 0.064)} ${Q(0.041, 0.072)} ${Q(0.025, 0.068)} L${Q(0.022, 0.09)} L${Q(-0.025, 0.095)} Z`);
	if (look.beard === 'full') push(`M${Q(0.056, 0.032)} Q${Q(0.07, 0.092)} ${Q(0.027, 0.106)} Q${Q(-0.027, 0.082)} ${Q(-0.04, 0.018)} Z`, 'beard');
	else if (look.beard === 'short') push(`M${Q(0.052, 0.036)} Q${Q(0.058, 0.077)} ${Q(0.022, 0.08)} Q${Q(-0.018, 0.064)} ${Q(-0.032, 0.027)} Z`, 'beard');
	else if (look.beard === 'stubble') push(`M${Q(0.054, 0.04)} Q${Q(0.056, 0.07)} ${Q(0.024, 0.074)} Q${Q(-0.01, 0.062)} ${Q(-0.024, 0.03)} Z`, 'beard');
	switch (look.head) {
		case 'short': push(`M${Q(-0.066, 0.012)} Q${Q(-0.068, -0.072)} ${Q(0.01, -0.071)} Q${Q(0.055, -0.066)} ${Q(0.058, -0.032)} Q${Q(0.01, -0.047)} ${Q(-0.012, 0)} Z`, 'hair'); break;
		case 'cap': push(`M${Q(-0.068, -0.012)} Q${Q(-0.058, -0.084)} ${Q(0.01, -0.081)} Q${Q(0.056, -0.076)} ${Q(0.06, -0.046)} L${Q(0.112, -0.036)} Q${Q(0.1, -0.026)} ${Q(0.056, -0.027)} Z`, 'hat'); break;
		case 'hat': push(`M${Q(-0.104, -0.03)} Q${Q(0, -0.052)} ${Q(0.104, -0.03)} Q${Q(0.106, -0.022)} ${Q(0.096, -0.02)} Q${Q(0.06, -0.034)} ${Q(0.058, -0.05)} Q${Q(0.06, -0.1)} ${Q(0.004, -0.108)} Q${Q(-0.058, -0.104)} ${Q(-0.062, -0.05)} Q${Q(-0.07, -0.034)} ${Q(-0.098, -0.02)} Q${Q(-0.108, -0.022)} ${Q(-0.104, -0.03)} Z`, 'hat'); break;
		case 'cowboy':   // a cowboy hat over the long hair: a wide brim curled up at both ends, a pinched crown
			push(`M${Q(-0.135, -0.062)} Q${Q(-0.112, -0.036)} ${Q(-0.06, -0.044)} L${Q(0.07, -0.046)} Q${Q(0.124, -0.04)} ${Q(0.15, -0.066)} Q${Q(0.142, -0.032)} ${Q(0.072, -0.024)} L${Q(-0.06, -0.022)} Q${Q(-0.128, -0.026)} ${Q(-0.135, -0.062)} Z`, 'hat');
			push(`M${Q(-0.06, -0.04)} L${Q(-0.058, -0.112)} Q${Q(-0.044, -0.14)} ${Q(-0.012, -0.122)} Q${Q(0.004, -0.114)} ${Q(0.02, -0.124)} Q${Q(0.052, -0.14)} ${Q(0.058, -0.108)} L${Q(0.062, -0.042)} Z`, 'hat'); break;
		case 'beanie': push(`M${Q(-0.07, -0.004)} Q${Q(-0.076, -0.09)} ${Q(0.0, -0.094)} Q${Q(0.062, -0.088)} ${Q(0.062, -0.03)} L${Q(0.05, -0.024)} Q${Q(0.0, -0.04)} ${Q(-0.06, -0.0)} Z`, 'hat'); break;
		case 'bob': push(`M${Q(-0.07, 0.07)} Q${Q(-0.09, -0.03)} ${Q(-0.04, -0.07)} Q${Q(0.02, -0.088)} ${Q(0.06, -0.03)} Q${Q(0.02, -0.035)} ${Q(0.0, 0.02)} Q${Q(-0.02, 0.07)} ${Q(-0.07, 0.07)} Z`, 'hair'); break;
		case 'perm': {   // short curled hair: a scalloped cap a little bigger than the skull, down to the nape
			const pts: P[] = [[-0.03, 0.05], [-0.082, 0.034], [-0.092, -0.02], [-0.078, -0.07], [-0.036, -0.094], [0.016, -0.092], [0.056, -0.066], [0.066, -0.03]];
			let d = `M${Q(-0.01, 0.04)} L${Q(pts[0][0], pts[0][1])}`;
			for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], c = pts[i], mx = (a[0] + c[0]) / 2, my = (a[1] + c[1]) / 2, nx = -(c[1] - a[1]), ny = c[0] - a[0], nl = Math.hypot(nx, ny) || 1; d += ` Q${Q(mx - nx / nl * 0.016, my - ny / nl * 0.016)} ${Q(c[0], c[1])}`; }
			d += ` Q${Q(0.03, -0.044)} ${Q(0.0, -0.02)} Z`; push(d, 'hair'); break; }
		case 'young': push(`M${Q(-0.072, 0.035)} Q${Q(-0.095, -0.085)} ${Q(0.0, -0.092)} Q${Q(0.068, -0.088)} ${Q(0.066, -0.036)} Q${Q(0.02, -0.058)} ${Q(-0.01, 0.0)} Z`, 'hair'); break;
		case 'swept':   // thick hair swept back from a high forehead, down to the collar (2026)
			push(`M${Q(0.058, -0.04)} Q${Q(0.06, -0.086)} ${Q(0.0, -0.092)} Q${Q(-0.074, -0.088)} ${Q(-0.084, -0.024)} Q${Q(-0.088, 0.04)} ${Q(-0.07, 0.086)} Q${Q(-0.06, 0.088)} ${Q(-0.06, 0.056)} Q${Q(-0.058, -0.012)} ${Q(-0.03, -0.058)} Q${Q(0.02, -0.074)} ${Q(0.058, -0.04)} Z`, 'hair'); break;
		case 'hood': {   // a parka hood (a little bigger than the skull, reaching the shoulders) with a ragged fur ruff along its front edge
			push(`M${Q(0.08, -0.07)} Q${Q(0.03, -0.112)} ${Q(-0.03, -0.106)} Q${Q(-0.098, -0.094)} ${Q(-0.1, -0.02)} Q${Q(-0.1, 0.06)} ${Q(-0.064, 0.096)} L${Q(0.046, 0.09)} Q${Q(0.088, 0.02)} ${Q(0.08, -0.07)} Z`, 'hat');
			let d = `M${Q(0.062, -0.088)}`; const n = 12;
			for (let i = 0; i <= n; i++) { const u = i / n, x0 = lerp(0.078, 0.066, u) + (i % 2 ? 0.022 : 0.004) * Math.sin(Math.PI * (0.15 + 0.7 * u)), y0 = lerp(-0.088, 0.088, u); d += ` L${Q(x0 + 0.01, y0)}`; }
			d += ` L${Q(0.036, 0.09)} Q${Q(0.056, 0.0)} ${Q(0.044, -0.084)} Z`; push(d, 'gear'); break; }
		default: break;
	}
	// clothing over the torso
	if (look.dress === 'jacket' || look.dress === 'parka' || look.dress === 'fleece') { const e = look.dress === 'parka' ? 0.012 : look.dress === 'fleece' ? 0.016 : 0;
		push(`M${tq(0.1, 0.064 + e)} Q${tq(0.02, 0.08 + e)} ${tq(-0.055 - e * 3, 0.08 + e)} Q${tq(-0.08 - e * 3, 0.079 + e)} ${tq(-0.078 - e * 3, 0.06)} L${tq(-0.078 - e * 3, -0.07 - e)} Q${tq(-0.072 - e * 3, -0.078 - e)} ${tq(-0.05, -0.076 - e)} Q${tq(0.02, -0.076 - e)} ${tq(0.1, -0.064 - e)} Z`, 'coat');
		if (look.dress === 'parka') push(`M${tq(0.2, 0.05)} Q${tq(0.27, 0.075)} ${tq(0.25, 0.02)} L${tq(0.22, -0.02)} Z`, 'coat');
		if (look.dress === 'fleece') push(`M${tq(0.17, 0.07)} Q${tq(0.2, 0.08)} ${tq(0.235, 0.045)} L${tq(0.24, -0.03)} Q${tq(0.2, -0.07)} ${tq(0.17, -0.072)} Z`, 'coat'); }
	if (look.dress === 'suit') push(`M${tq(0.08, 0.082)} Q${tq(0.2, 0.09)} ${tq(0.235, 0.05)} L${tq(0.24, -0.04)} Q${tq(0.2, -0.08)} ${tq(0.08, -0.07)} Z`, 'coat');
	if (look.dress === 'dress') {
		const LS = (n: string) => S(pose[n]), kn = [LS('LKnee'), LS('RKnee')], hem = Math.max(kn[0][1], kn[1][1]) + 0.08 * h, fx = Math.max(kn[0][0], kn[1][0]) + 0.05 * h, bx = Math.min(kn[0][0], kn[1][0]) - 0.06 * h;
		push(`M${tq(0.08, 0.068)} L${tq(0.08, -0.064)} Q${f1(fx)},${f1(hips[1] + 0.05 * h)} ${f1(fx)},${f1(hem)} Q${f1((fx + bx) / 2)},${f1(hem + 0.015 * h)} ${f1(bx)},${f1(hem)} Q${f1(bx)},${f1(hips[1] + 0.05 * h)} ${tq(0.02, 0.08)} Q${tq(0.06, 0.076)} ${tq(0.08, 0.068)} Z`, 'coat'); }
	return parts;
};
/** the outline paths of one figure (screen coordinates, unflipped) — kept for callers that draw one tone */
export const figPaths = (x: number, ground: number, h: number, pose: Pose, look: Look59): string[] => figParts(x, ground, h, pose, look).map((p) => p.d);

export const Fig59: React.FC<{x: number; ground: number; h: number; pose: Pose; look: Look59; col?: string; flip?: boolean}> = ({x, ground, h, pose, look, col = '#0d0b10', flip}) =>
	<g transform={flip ? `translate(${2 * x},0) scale(-1,1)` : undefined}>{figPaths(x, ground, h, pose, look).map((d, i) => <path key={i} d={d} fill={col} />)}</g>;

export type Rim = {c: string; o: number; dx: number; dy: number};
/** draw role-tagged parts with rims of light hugging the outer contour (each rim = the shapes offset toward the light, drawn underneath) */
export const LitParts: React.FC<{parts: Part[]; rims: Rim[]; k: number; col: string; paint?: Paint; flipX?: number}> = ({parts, rims, k, col, paint = {}, flipX}) =>
	<g transform={flipX !== undefined ? `translate(${2 * flipX},0) scale(-1,1)` : undefined}>
		{rims.map((r, i) => <g key={i} opacity={r.o} transform={`translate(${(flipX !== undefined ? -1 : 1) * r.dx * k},${r.dy * k})`}>{parts.map((p, j) => <path key={j} d={p.d} fill={r.c} />)}</g>)}
		{parts.map((p, j) => <path key={j} d={p.d} fill={p.fill ?? paint[p.role] ?? col} />)}</g>;
/** one figure with rims of light (dx/dy in screen px at h = 450, scaled with h; a rim from the right has dx > 0) */
export const Lit: React.FC<React.ComponentProps<typeof Fig59> & {rims?: Rim[]; extra?: Part[]; under?: Part[]}> = ({rims = [{c: '#ffd9a8', o: 0.4, dx: -2.2, dy: -1.6}], extra = [], under = [], ...p}) => {
	const k = Math.max(0.6, p.h / 450), parts = [...under, ...figParts(p.x, p.ground, p.h, p.pose, p.look), ...extra];
	return <LitParts parts={parts} rims={rims} k={k} col={p.col ?? '#0d0b10'} paint={p.look.paint} flipX={p.flip ? p.x : undefined} />;
};
/** a screen point of a joint (accounts for flip) */
export const jointAt = (pose: Pose, n: string, x: number, ground: number, h: number, flip = false): P => [x + (flip ? -1 : 1) * pose[n][0] * h, ground - pose[n][1] * h];

/* ---------- the kit he hauls: the cart (a two-wheeled trailer hitched to his hip belt) and, on the sea ice, a sled on a line ---------- */
export type CartKind = 'hivis' | 'box' | 'orange';
/** a thin bar between two screen points (a filled quad, so it takes the rims like everything else) */
const bar = (a: P, b: P, w: number) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l * w / 2, ny = dx / l * w / 2;
	return `M${f1(a[0] + nx)},${f1(a[1] + ny)} L${f1(b[0] + nx)},${f1(b[1] + ny)} L${f1(b[0] - nx)},${f1(b[1] - ny)} L${f1(a[0] - nx)},${f1(a[1] - ny)} Z`; };
const ring = (c: P, r1: number, r0: number) => `M${f1(c[0] - r1)},${f1(c[1])} a${f1(r1)},${f1(r1)} 0 1,0 ${f1(2 * r1)},0 a${f1(r1)},${f1(r1)} 0 1,0 ${f1(-2 * r1)},0 Z M${f1(c[0] - r0)},${f1(c[1])} a${f1(r0)},${f1(r0)} 0 1,1 ${f1(2 * r0)},0 a${f1(r0)},${f1(r0)} 0 1,1 ${f1(-2 * r0)},0 Z`;
const disc = (c: P, r: number) => `M${f1(c[0] - r)},${f1(c[1])} a${f1(r)},${f1(r)} 0 1,0 ${f1(2 * r)},0 a${f1(r)},${f1(r)} 0 1,0 ${f1(-2 * r)},0 Z`;
/** the cart's colours (muted: they read as gear in low light, never as flat poster colour) */
export const CART_PAINT: Record<CartKind, {load: string; hi: string; dark: string}> = {
	hivis: {load: '#7d8424', hi: '#a9ab8e', dark: '#2a2c22'},     // 1998: a jogging-stroller frame under a hi-vis yellow cover
	box: {load: '#77736a', hi: '#9c978a', dark: '#2a2a2c'},       // the Americas: a white box with a Union Jack on its side
	orange: {load: '#8a4a22', hi: '#b8703c', dark: '#26302a'},    // Russia and after: orange bags, a green and a blue roll
};
/** the cart hitched to a hip point (body units, y up, relative to the walker's x): returns parts in screen px (unflipped).
    The shafts are rigid with the cart, which pivots on its axle: the hips set both where the axle is and how the cart tilts. */
export const cartParts = (x: number, ground: number, h: number, hip: P, dist: number, kind: CartKind): {back: Part[]; front: Part[]; axle: P; at: (u: number, v: number) => P} => {
	const Rw = kind === 'orange' ? 0.165 : 0.15, Ls = 0.74, a0 = Math.atan2(0.45, 0.58);
	const hy = hip[1] - 0.02, dy = hy - Rw, axX = hip[0] - Math.sqrt(Math.max(0.01, Ls * Ls - dy * dy)), th = Math.atan2(dy, hip[0] - axX) - a0;
	const S = (p: P): P => [x + p[0] * h, ground - p[1] * h];
	const C = (u: number, v: number): P => { const c = Math.cos(th), s = Math.sin(th); return S([axX + u * c - v * s, Rw + u * s + v * c]); };   // cart frame: u toward the walker, v up
	const cp = (u: number, v: number) => { const p = C(u, v); return `${f1(p[0])},${f1(p[1])}`; };
	const pal = CART_PAINT[kind], back: Part[] = [], front: Part[] = [];
	const A = S([axX, Rw]), rw = Rw * h, spin = dist / Rw;
	// far wheel (a little offset up-back, darker), the frame, the load, then the near wheel and the near shaft
	back.push({d: ring([A[0] - 0.012 * h, A[1] - 0.008 * h], rw, rw * 0.86), role: 'frame'});
	back.push({d: bar(C(-0.3, 0.06), C(0.26, 0.08), 0.022 * h), role: 'frame'});
	back.push({d: bar(C(0.22, 0.08), S([hip[0] - 0.02, hy]), 0.016 * h), role: 'frame'});
	if (kind === 'hivis') {
		back.push({d: `M${cp(-0.3, 0.07)} Q${cp(-0.33, 0.3)} ${cp(-0.18, 0.33)} L${cp(0.12, 0.33)} Q${cp(0.24, 0.32)} ${cp(0.24, 0.16)} L${cp(0.22, 0.07)} Z`, role: 'load'});
		back.push({d: bar(C(-0.31, 0.17), C(0.235, 0.17), 0.026 * h), role: 'load', fill: pal.hi});
		back.push({d: bar(C(-0.3, 0.1), C(-0.36, 0.36), 0.014 * h), role: 'frame'});   // the stroller's push bar (at the back)
	} else if (kind === 'box') {
		back.push({d: `M${cp(-0.27, 0.08)} L${cp(-0.27, 0.35)} L${cp(0.21, 0.35)} L${cp(0.21, 0.08)} Z`, role: 'load'});
		back.push({d: bar(C(-0.275, 0.355), C(0.215, 0.355), 0.02 * h), role: 'load', fill: pal.hi});
		// the Union Jack on the box's side (simplified, muted)
		const f0 = C(-0.05, 0.16), f1p = C(0.15, 0.29), fw = f1p[0] - f0[0], fh = f0[1] - f1p[1], fx0 = f0[0], fy0 = f1p[1];
		const F = (u: number, v: number) => `${f1(fx0 + u * fw)},${f1(fy0 + v * fh)}`;
		back.push({d: `M${F(0, 0)} L${F(1, 0)} L${F(1, 1)} L${F(0, 1)} Z`, role: 'gear', fill: '#2a3560'});
		back.push({d: `M${F(0, 0)} L${F(0.1, 0)} L${F(1, 0.86)} L${F(1, 1)} L${F(0.9, 1)} L${F(0, 0.14)} Z M${F(1, 0)} L${F(1, 0.14)} L${F(0.1, 1)} L${F(0, 1)} L${F(0, 0.86)} L${F(0.9, 0)} Z`, role: 'gear', fill: '#cfc9ba'});
		back.push({d: `M${F(0.4, 0)} L${F(0.6, 0)} L${F(0.6, 0.36)} L${F(1, 0.36)} L${F(1, 0.64)} L${F(0.6, 0.64)} L${F(0.6, 1)} L${F(0.4, 1)} L${F(0.4, 0.64)} L${F(0, 0.64)} L${F(0, 0.36)} L${F(0.4, 0.36)} Z`, role: 'gear', fill: '#cfc9ba'});
		back.push({d: `M${F(0.44, 0)} L${F(0.56, 0)} L${F(0.56, 0.42)} L${F(1, 0.42)} L${F(1, 0.58)} L${F(0.56, 0.58)} L${F(0.56, 1)} L${F(0.44, 1)} L${F(0.44, 0.58)} L${F(0, 0.58)} L${F(0, 0.42)} L${F(0.44, 0.42)} Z`, role: 'gear', fill: '#9a3430'});
		back.push({d: `M${cp(-0.22, 0.08)} Q${cp(-0.24, -0.02)} ${cp(-0.14, -0.03)} L${cp(-0.08, -0.02)} Q${cp(-0.06, 0.04)} ${cp(-0.08, 0.08)} Z`, role: 'frame'});   // a bag slung under
	} else {
		back.push({d: `M${cp(-0.32, 0.07)} Q${cp(-0.36, 0.26)} ${cp(-0.24, 0.31)} Q${cp(-0.1, 0.36)} ${cp(0.0, 0.3)} Q${cp(0.14, 0.34)} ${cp(0.22, 0.24)} Q${cp(0.27, 0.14)} ${cp(0.22, 0.07)} Z`, role: 'load'});
		back.push({d: `M${cp(-0.26, 0.3)} Q${cp(-0.28, 0.4)} ${cp(-0.18, 0.41)} L${cp(0.04, 0.41)} Q${cp(0.12, 0.4)} ${cp(0.1, 0.31)} Z`, role: 'load', fill: '#2c3a52'});   // a blue roll
		back.push({d: `M${cp(-0.1, 0.39)} Q${cp(-0.12, 0.47)} ${cp(-0.04, 0.47)} L${cp(0.14, 0.45)} Q${cp(0.2, 0.42)} ${cp(0.14, 0.37)} Z`, role: 'load', fill: '#33402a'});   // a green roll
		back.push({d: bar(C(-0.33, 0.2), C(0.25, 0.2), 0.018 * h), role: 'load', fill: pal.hi});
	}
	// the near wheel: tyre, rim, hub and five spokes that turn with the distance walked
	front.push({d: ring(A, rw, rw * 0.84), role: 'frame'});
	for (let i = 0; i < 5; i++) { const a = spin + i * Math.PI * 2 / 5; front.push({d: bar(A, [A[0] + Math.cos(a) * rw * 0.86, A[1] + Math.sin(a) * rw * 0.86], 0.008 * h), role: 'frame'}); }
	front.push({d: disc(A, rw * 0.16), role: 'frame'});
	front.push({d: bar(C(0.2, 0.09), S([hip[0] + 0.01, hy - 0.01]), 0.018 * h), role: 'frame'});   // the near shaft to the hip belt
	return {back, front, axle: A, at: C};
};
/** the sled (a pulk) on two traces from the hip belt; `bump` lifts its nose over the ice (0..1) */
export const sledParts = (x: number, ground: number, h: number, hip: P, bump = 0, len = 1.15): Part[] => {
	const S = (p: P): P => [x + p[0] * h, ground - p[1] * h], fx = hip[0] - len, a = -bump * 0.18;
	const C = (u: number, v: number): P => { const c = Math.cos(a), s = Math.sin(a); return S([fx + u * c - v * s, u * s + v * c]); };
	const cp = (u: number, v: number) => { const p = C(u, v); return `${f1(p[0])},${f1(p[1])}`; };
	const out: Part[] = [];
	out.push({d: `M${cp(-0.62, 0.0)} L${cp(-0.02, 0.0)} Q${cp(0.06, 0.01)} ${cp(0.08, 0.08)} L${cp(0.04, 0.1)} Q${cp(0.02, 0.05)} ${cp(-0.04, 0.05)} L${cp(-0.62, 0.05)} Z`, role: 'frame'});
	out.push({d: `M${cp(-0.6, 0.04)} Q${cp(-0.62, 0.15)} ${cp(-0.5, 0.16)} L${cp(-0.12, 0.155)} Q${cp(-0.02, 0.14)} ${cp(-0.03, 0.05)} Z`, role: 'load', fill: '#6a1e1c'});
	for (const u of [-0.48, -0.32, -0.16]) out.push({d: bar(C(u, 0.05), C(u + 0.02, 0.158), 0.01 * h), role: 'frame'});
	const Hs = S([hip[0] - 0.02, hip[1] - 0.03]), T = C(0.06, 0.07), Ms: P = [(Hs[0] + T[0]) / 2, (Hs[1] + T[1]) / 2 + 0.035 * h];
	out.push({d: `M${f1(T[0])},${f1(T[1] - 0.004 * h)} Q${f1(Ms[0])},${f1(Ms[1])} ${f1(Hs[0])},${f1(Hs[1])} L${f1(Hs[0])},${f1(Hs[1] + 0.008 * h)} Q${f1(Ms[0])},${f1(Ms[1] + 0.008 * h)} ${f1(T[0])},${f1(T[1] + 0.004 * h)} Z`, role: 'frame'});
	return out;
};
/** a ski pole from a hand back to the snow (screen px, unflipped) */
export const poleParts = (hand: P, ground: number, h: number, back = 0.2): Part[] => { const tip: P = [hand[0] - back * h, ground - 0.01 * h];
	return [{d: bar(hand, tip, 0.012 * h), role: 'frame'}, {d: bar([tip[0] + 0.012 * h, tip[1] - 0.06 * h], [tip[0] - 0.02 * h, tip[1] - 0.05 * h], 0.01 * h), role: 'frame'}]; };
/** a machete held in a hand, blade along the forearm direction (elbow → hand) */
export const macheteParts = (elb: P, hand: P, h: number): Part[] => { const dx = hand[0] - elb[0], dy = hand[1] - elb[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, nx = -uy, ny = ux;
	const p = (u: number, v: number) => `${f1(hand[0] + (ux * u + nx * v) * h)},${f1(hand[1] + (uy * u + ny * v) * h)}`;
	return [{d: `M${p(0.03, -0.012)} L${p(0.3, -0.02)} Q${p(0.36, 0.0)} ${p(0.3, 0.03)} L${p(0.03, 0.014)} Z`, role: 'frame'}]; };

/** one walker with his kit: the figure, plus a cart or a sled hitched to his hips, poles or a machete in hand */
export const Walker: React.FC<{x: number; ground: number; h: number; pose: Pose; look: Look59; rims: Rim[]; col?: string; flip?: boolean;
	cart?: CartKind; dist?: number; sled?: number; poles?: boolean; machete?: boolean; extra?: Part[]}> = ({x, ground, h, pose, look, rims, col = '#0c0b0e', flip, cart, dist = 0, sled, poles, machete, extra = []}) => {
	const hipB: P = [pose.Hips[0] + 0.01, pose.Hips[1] - 0.02];
	const fig = figParts(x, ground, h, pose, look), under: Part[] = [], over: Part[] = [];
	if (cart) { const c = cartParts(x, ground, h, hipB, dist, cart); under.push(...c.back.map((p) => ({...p, fill: p.fill ?? (p.role === 'load' ? CART_PAINT[cart].load : undefined)}))); over.push(...c.front); }
	if (sled !== undefined) under.push(...sledParts(x, ground, h, hipB, sled));
	if (poles) { under.push(...poleParts(jointAt(pose, 'RHand', x, ground, h), ground, h, 0.16)); over.push(...poleParts(jointAt(pose, 'LHand', x, ground, h), ground, h, 0.2)); }
	if (machete) over.push(...macheteParts(jointAt(pose, 'LElb', x, ground, h), jointAt(pose, 'LHand', x, ground, h), h));
	return <LitParts parts={[...under, ...fig, ...over, ...extra]} rims={rims} k={Math.max(0.6, h / 450)} col={col} paint={look.paint} flipX={flip ? x : undefined} />;
};

/* ---------- ep59 cast ---------- */
/** his looks stage by stage (from the photos: …/scratchpad/ep59photos/clean_sheet.jpg). Faceless; the hair, gear and kit carry the likeness. */
export const STAGE = {
	/** 1998, 29: short fair hair, a fleece, a big pack, the hi-vis stroller cart */
	k1998: {dress: 'fleece', head: 'young', beard: 'stubble', pack: 'big', build: 0.97, paint: {hair: '#5a4a2c', coat: '#1e1a1a'}} as Look59,
	/** the Americas, 30–36: long fair hair under a cowboy hat, a long light duster, a daypack, the white box cart */
	kAmericas: {dress: 'duster', head: 'cowboy', beard: 'stubble', pack: 'small', build: 0.98, paint: {hair: '#5e4c2c', hat: '#4a4436', coat: '#2c2a24'}} as Look59,
	/** the Darién, 31: long hair, a shirt, the big pack (no cart in the jungle) */
	kJungle: {dress: 'shirt', head: 'long', beard: 'short', pack: 'big', build: 0.98, paint: {hair: '#3a3020'}} as Look59,
	/** the Bering Strait, 37: hood with a fur ruff, the red insulated suit, a sled on a line, ski poles */
	kIce: {dress: 'suit', head: 'hood', beard: 'full', pack: 'none', build: 1.02, paint: {body: '#240d0e', coat: '#44151a', hat: '#2a1012', gear: '#6a6258'}} as Look59,
	/** Russia and the long waits, 37–47: camo poncho, cap, full beard, the cart with orange bags */
	kRussia: {dress: 'poncho', head: 'cap', beard: 'full', pack: 'none', build: 1.02, paint: {coat: '#23271c', beard: '#2e2618'}} as Look59,
	/** the 2012 protest walk across the US, 43: cap, beard, jacket, the cart */
	k2012: {dress: 'jacket', head: 'cap', beard: 'full', pack: 'small', build: 1.02, paint: {coat: '#1c1c20', beard: '#2e2618'}} as Look59,
	/** the swims (2024, 2026): a black wetsuit, wet hair */
	kSwim: {dress: 'wetsuit', head: 'swept', beard: 'short', pack: 'none', build: 1.0, paint: {hair: '#3a3632', beard: '#3a3632'}} as Look59,
	/** 2026, 57: grey hair swept back, a grey beard, a dark jacket */
	k2026: {dress: 'jacket', head: 'swept', beard: 'short', pack: 'none', build: 1.04, paint: {hair: '#302e34', beard: '#29272d', coat: '#121216'}} as Look59,
	/** his mother (七十多岁): short grey hair, a long cardigan */
	mum: {dress: 'coat', head: 'perm', build: 0.97, paint: {hair: '#6a6670', coat: '#1a1618'}} as Look59,
};
export const LOOK = {
	/** Karl at 57 (2026): grey hair swept back, grey beard, dark jacket, the big pack (pack: 'none' at the door) */
	karlOld: {...STAGE.k2026, pack: 'big'} as Look59,
	/** Karl at 29 (1998) */
	karlYoung: STAGE.k1998,
	karlYoungNoPack: {...STAGE.k1998, pack: 'none'} as Look59,
	/** his mother (七十多岁): short curled grey hair, a long cardigan over trousers */
	mum: STAGE.mum,
	/** neighbours / bystanders */
	man: {dress: 'jacket', head: 'short'} as Look59, woman: {dress: 'coat', head: 'bob'} as Look59,
};
/* named poses (all grounded) */
export const PZ = {
	stand: grounded({lean: 3, lt: 2, lk: 2, rt: -3, rk: 3, la: -3, le: 10, ra: 4, re: 14}),
	/** standing with thumbs in the pack straps */
	straps: grounded({lean: 6, neck: 2, lt: 2, lk: 2, rt: -4, rk: 4, la: 12, le: 128, ra: 8, re: 132}),
	lookUp: grounded({lean: -3, neck: -26, lt: 2, lk: 2, rt: -4, rk: 3, la: 10, le: 125, ra: 6, re: 130}),
	/** head bowed (moved) */
	bow: grounded({lean: 8, neck: 22, lt: 2, lk: 3, rt: -4, rk: 4, la: 2, le: 12, ra: -3, re: 16}),
	/** looking up, arms loose at the sides (no pack) */
	lookUpFree: grounded({lean: -3, neck: -24, lt: 2, lk: 2, rt: -4, rk: 3, la: 4, le: 14, ra: -6, re: 18}),
	/** hand on the gate / reaching forward low */
	reach: grounded({lean: 10, neck: 6, lt: 4, lk: 5, rt: -6, rk: 5, la: 52, le: 20, ra: 4, re: 16}),
};
