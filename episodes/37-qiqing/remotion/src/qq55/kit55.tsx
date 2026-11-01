import React from 'react';
import {AbsoluteFill} from 'remotion';
import {W, H, Subs, Stamp, Theme, SANS, Seal, SAFE_X, SAFE_Y} from '../qq50/kit50';
import {rnd} from '../qq54/cao54b';
/* ep55 家书 · look tests: the shared layer. One rig, one set of props and set geometry, one overlay; each look
   (look55a/b/c) only re-skins them, so the three looks are compared on the same three beats with the same staging.
   Units of the rig: cm, hip joint at (0, 0), y down, the figure faces +x. Limb angles are absolute, measured from straight
   down, + = toward +x (forward). Joints rotate; the garments are single continuous shapes built through the joints. */
export {W, H, rnd};
export type P = [number, number];
export const f2 = (v: number) => (Math.round(v * 100) / 100).toString();
export const D2R = Math.PI / 180;
export const dir = (a: number): P => [Math.sin(a * D2R), Math.cos(a * D2R)];
export const add = (p: P, d: P, s = 1): P => [p[0] + d[0] * s, p[1] + d[1] * s];
export const lp = (a: P, b: P, u: number): P => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
export const rot = (p: P, deg: number, o: P = [0, 0]): P => { const c = Math.cos(deg * D2R), s = Math.sin(deg * D2R), x = p[0] - o[0], y = p[1] - o[1]; return [o[0] + x * c - y * s, o[1] + x * s + y * c]; };
/** closed (or open) Catmull-Rom spline through the points, as cubic Béziers; a doubled point makes a corner */
export const sm = (pts: P[], closed = true) => { const n = pts.length, g = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
	let d = `M${f2(pts[0][0])},${f2(pts[0][1])}`;
	for (let i = 0; i < (closed ? n : n - 1); i++) { const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
		d += ` C${f2(p1[0] + (p2[0] - p0[0]) / 6)},${f2(p1[1] + (p2[1] - p0[1]) / 6)} ${f2(p2[0] - (p3[0] - p1[0]) / 6)},${f2(p2[1] - (p3[1] - p1[1]) / 6)} ${f2(p2[0])},${f2(p2[1])}`; }
	return d + (closed ? ' Z' : ''); };
export const poly = (pts: P[]) => 'M' + pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join(' L') + ' Z';
/** a tapered ribbon along a polyline, half-width w(u) */
export const ribbon = (pts: P[], w: (u: number) => number) => { const L: P[] = [], R: P[] = [];
	pts.forEach((p, i) => { const q = pts[Math.min(i + 1, pts.length - 1)], o = pts[Math.max(i - 1, 0)], dx = q[0] - o[0], dy = q[1] - o[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, ww = w(i / (pts.length - 1));
		L.push([p[0] + nx * ww, p[1] + ny * ww]); R.push([p[0] - nx * ww, p[1] - ny * ww]); });
	return sm([...L, ...R.reverse()]); };
/** a limb: a smooth tube from a to b through the joint, rounded ends */
export const tube = (a: P, b: P, wa: number, wb: number) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
	const pts: P[] = [[a[0] + nx * wa, a[1] + ny * wa], [b[0] + nx * wb, b[1] + ny * wb], [b[0] + ux * wb * 0.8 + nx * wb * 0.5, b[1] + uy * wb * 0.8 + ny * wb * 0.5], [b[0] + ux * wb * 0.8 - nx * wb * 0.5, b[1] + uy * wb * 0.8 - ny * wb * 0.5], [b[0] - nx * wb, b[1] - ny * wb], [a[0] - nx * wa, a[1] - ny * wa], [a[0] - ux * wa * 0.8 - nx * wa * 0.5, a[1] - uy * wa * 0.8 - ny * wa * 0.5], [a[0] - ux * wa * 0.8 + nx * wa * 0.5, a[1] - uy * wa * 0.8 + ny * wa * 0.5]];
	return sm(pts); };
/** two-bone IK: the elbow / knee on the side that makes (y − 0.35x) larger (down and back for a figure facing +x) */
export const ik = (a: P, b: P, l1: number, l2: number, flipBend = false): P => { const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.max(1e-3, Math.min(l1 + l2 - 0.01, Math.hypot(dx, dy))), th = Math.atan2(dy, dx);
	const al = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
	const e1: P = [a[0] + l1 * Math.cos(th + al), a[1] + l1 * Math.sin(th + al)], e2: P = [a[0] + l1 * Math.cos(th - al), a[1] + l1 * Math.sin(th - al)];
	const s = (e: P) => e[1] - 0.35 * e[0]; return (s(e1) > s(e2)) !== flipBend ? e1 : e2; };

/* ============================== the rig ============================== */
export type Kind = 'soldier' | 'armour' | 'woman' | 'farmer';
export type Pose = {kind: Kind; seat: 'log' | 'kneel' | 'half'; lean: number; neck: number; thN: number; shN: number; thF: number; shF: number; ftN?: number; ftF?: number;
	hN: P; hF: P; aN?: number; aF?: number; moust?: boolean; old?: boolean};
export const TORSO = 48, NECKL = 51.5, THIGH = 44, SHIN = 42, UA = 29, FA = 24;
export type Arm = {S: P; E: P; Wr: P; ang: number; up: string; lo: string; cuff: string; hand: string};
export type Leg = {K: P; A: P; thigh: string; shin: string; wraps: string; shoe: string};
export type Built = {pose: Pose; S: P; N: P; headT: string; torso: string; skirt: string; collar: string; belt: string; armN: Arm; armF: Arm; legN: Leg; legF: Leg;
	cuirass?: string; flapN?: string; flapF?: string; scarf?: string; floor: number; tr: (p: P) => P};
/** hand (mitten) in hand-local coords: wrist at 0, pointing +x; 'fist' closed round a grip, 'flat' resting */
export const HAND = {fist: 'M-0.6,-3.6 C2.6,-4.6 6.6,-4.6 8.8,-3.2 C10.6,-1.8 10.6,2.6 8.8,3.8 C6.4,5 2.2,4.8 -0.6,3.6 Z', thumb: 'M1.6,-3.6 C3.6,-6 7.2,-6.4 8.8,-4.6 C8.2,-3.4 6.8,-2.8 5.2,-2.8 Z',
	flat: 'M-0.6,-3.6 C4,-4.8 10,-4.4 13.4,-2.2 C14.8,-1.2 14.8,0.8 13.4,1.8 C10,3.6 4,4.2 -0.6,3.6 Z'};
const handPath = (Wr: P, ang: number, flat: boolean, sc = 0.88) => { const r = (p: P) => add(Wr, rot(p, ang));
	const pts0: P[] = flat ? [[-0.6, -3.6], [4, -4.6], [10, -4.2], [13.4, -2.2], [14.2, -0.2], [13.4, 1.8], [10, 3.6], [4, 4.2], [-0.6, 3.6]]
		: [[-0.6, -3.4], [2.6, -4.2], [6.8, -4.2], [9.4, -3], [10.6, -0.2], [9.4, 3], [6.6, 4], [2.2, 4], [-0.6, 3.2]];
	const pts = pts0.map(([x, y]) => [x * sc, y * sc] as P);
	return sm(pts.map(r)); };
export const build = (p: Pose): Built => {
	const H0: P = [0, 0], tr = (q: P) => rot(q, p.lean);
	const S = tr([1.5, -TORSO]), N = tr([0, -NECKL]);
	const KN = add(H0, dir(p.thN), THIGH), AN = add(KN, dir(p.shN), SHIN), KF = add(H0, dir(p.thF), THIGH), AF = add(KF, dir(p.shF), SHIN);
	const floor = p.seat === 'log' ? Math.max(AN[1], AF[1]) + 7 : p.seat === 'kneel' ? 18.5 : Math.max(AN[1], KF[1]) + 6;
	const arm = (sh: P, hand: P, ang: number | undefined, sleeveW: number, flat: boolean): Arm => {
		const E = ik(sh, hand, UA, FA), a = ang ?? Math.atan2(hand[1] - E[1], hand[0] - E[0]) / D2R;
		const cuffA = Math.atan2(hand[1] - E[1], hand[0] - E[0]), cu: P = [Math.cos(cuffA), Math.sin(cuffA)], cn: P = [-cu[1], cu[0]];
		const c0 = add(hand, cu, -3.4), cuff = poly([add(c0, cn, sleeveW * 0.86), add(add(c0, cu, 2.2), cn, sleeveW * 0.86), add(add(c0, cu, 2.2), cn, -sleeveW * 0.86), add(c0, cn, -sleeveW * 0.86)]);
		return {S: sh, E, Wr: hand, ang: a, up: tube(sh, E, sleeveW + 1.2, sleeveW), lo: tube(E, add(hand, cu, -1.2), sleeveW, sleeveW * 0.86), cuff, hand: handPath(hand, a, flat, p.kind === 'woman' ? 0.76 : 0.86)}; };
	const robe = p.kind === 'woman';
	const sw = robe ? 7.2 : 6.6;
	const armN = arm(S, p.hN, p.aN, sw, false), armF = arm(add(S, [-1.5, -0.5]), p.hF, p.aF, sw - 0.3, false);
	const leg = (K: P, A: P, th: number, ft: number | undefined): Leg => {
		const u = dir(th), nUp: P = [u[1], -u[0]], kTop = add(K, nUp, 0);
		const sh = tube(K, A, 5.6, 4.4), thigh = tube(add(H0, u, 2), kTop, 8.2, 6.2);
		const sd = [A[0] - K[0], A[1] - K[1]], sl = Math.hypot(sd[0], sd[1]), su: P = [sd[0] / sl, sd[1] / sl], sn: P = [-su[1], su[0]];
		let wraps = ''; for (let i = 0; i < 7; i++) { const c = lp(K, A, 0.22 + i * 0.1); wraps += `M${f2(c[0] + sn[0] * 5 - su[0] * 1.2)},${f2(c[1] + sn[1] * 5 - su[1] * 1.2)} L${f2(c[0] - sn[0] * 5 + su[0] * 1.6)},${f2(c[1] - sn[1] * 5 + su[1] * 1.6)} `; }
		const fa = ft ?? 0, r = (q: P) => add(A, rot(q, fa));
		/* a 秦 履: low, square toe turned up a little (as on the kneeling archer) */
		const shoe = sm([r([-5.6, -3]), r([-5.8, 3.4]), r([-3, 6.6]), r([12, 6.6]), r([19.4, 6.0]), r([20.6, 3.4]), r([19.4, 2.4]), r([13, 0.6]), r([6, -2.4]), r([0, -4.4])]);
		return {K, A, thigh, shin: sh, wraps, shoe}; };
	const legN = leg(KN, AN, p.thN, p.ftN), legF = leg(KF, AF, p.thF, p.ftF);
	/* torso: one closed shape in the torso frame (x forward, y up the spine), rotated by the lean */
	const torsoPts: P[] = robe
		? [[-11, 4], [-11.6, -12], [-10.4, -28], [-9.8, -40], [-8.6, -47.4], [-5, -51.6], [4.6, -51.8], [9.6, -48], [11.4, -41], [11.4, -32], [10.2, -22], [11.4, -10], [11.8, 2], [0, 6]]
		: [[-11.5, 4], [-12.4, -12], [-11, -28], [-10.6, -40], [-9.6, -47.4], [-5.6, -51.8], [4.8, -52], [10.6, -48], [12.4, -41], [12.2, -31], [11.2, -21], [12.4, -10], [12.6, 2], [0, 6]];
	const torso = sm(torsoPts.map(tr));
	/* the skirt of the 襦 / 袍 over the thighs: from the belt, over the near thigh to the knee, the hem hanging, back under the thigh */
	const u = dir(p.thN), nUp: P = [u[1], -u[0]];
	let skirt: string;
	if (robe) { const K = KN;
		skirt = sm([tr([11.4, -10]), tr([12.4, 0]), add(lp(H0, K, 0.5), nUp, 8.4), add(add(K, nUp, 6.6), u, 3.4), [K[0] + 7.6, floor - 5], [K[0] + 6, floor], [K[0] + 4, floor], [-16, floor], [-17.4, floor - 5], tr([-13, 2]), tr([-12, -10])]);
	} else { const K = KN, hem = p.kind === 'armour' ? 1.0 : 0.92;
		skirt = sm([tr([12.2, -10]), tr([13.2, 1]), add(lp(H0, K, 0.5), nUp, 8.6), add(add(lp(H0, K, hem), nUp, 7.4), u, 1), add(add(lp(H0, K, hem), nUp, -6.6), [0, 7], 1), add(lp(H0, K, 0.52), nUp, -8.6), [-2, 10.5], tr([-12.8, 5]), tr([-12.6, -10])]); }
	const collar = sm([tr([-5.6, -51.4]), tr([0, -53.4]), tr([5.2, -52.4]), tr([9.6, -47.6]), tr([11.8, -40]), tr([9.8, -39.4]), tr([7, -46.2]), tr([3.6, -49.8]), tr([-4.6, -49])]);
	const belt = poly([tr([-12.6, -13.4]), tr([12.4, -11.6]), tr([12.6, -8.2]), tr([-12.6, -9.8])]);
	const b: Built = {pose: p, S, N, headT: `translate(${f2(N[0])},${f2(N[1])}) rotate(${f2(p.lean + p.neck)}) scale(0.92)`, torso, skirt, collar, belt, armN, armF, legN, legF, floor, tr};
	if (p.kind === 'armour') {
		/* 秦 infantry 铠甲: a short lamellar cuirass, longer at the front, over the robe; 披膊 shoulder flaps; a 领巾 scarf */
		b.cuirass = sm([tr([-12.8, -1]), tr([-13.4, -14]), tr([-12.2, -30]), tr([-11, -41]), tr([-9.6, -47.6]), tr([-4, -50.8]), tr([4, -51]), tr([10.8, -47.4]), tr([13.4, -40]), tr([13.6, -29]), tr([13, -18]), tr([14.6, -6]), tr([13.4, 1.6]), tr([6, 2.4]), tr([-4, 0.6])]);
		const flap = (a: Arm) => { const e = lp(a.S, a.E, 0.66), du = [a.E[0] - a.S[0], a.E[1] - a.S[1]], L = Math.hypot(du[0], du[1]), n: P = [-du[1] / L, du[0] / L];
			return sm([add(a.S, n, 8.4), add(add(a.S, [0, -1]), n, 0), add(a.S, n, -8.6), add(e, n, -8.6), add(e, [du[0] / L, du[1] / L], 1.6), add(e, n, 8.6)]); };
		b.flapN = flap(armN); b.flapF = flap(armF);
		b.scarf = sm([tr([-6.4, -49.4]), tr([0, -53.2]), tr([6, -52.2]), tr([7.8, -48.6]), tr([1, -47.6]), tr([-6, -46.8])]); }
	return b; };

/* ---------- the head (head-local: neck base at 0, facing +x, crown ≈ −35.7) ---------- */
export const FACE = (n: number) => `M-6.4,-9.6 C-11.4,-13.6 -12.6,-23.6 -9.2,-29.6 C-5.8,-35 2.8,-35.6 7.4,-31.2 C9.4,-29 10.2,-26.4 10.1,-23.6 L9.6,-22.2 L${n},-17.4 C${n + 0.3},-16.6 ${n - 0.3},-15.8 ${n - 1.3},-15.9 L10.2,-15.1 L10.6,-14.3 L9.9,-13.6 L10.4,-12.8 C10.5,-11.2 10,-9.4 8.2,-8.9 C6,-8.6 3.6,-8.8 2.8,-7.4 L3.6,2.4 L-7,2.4 L-6.6,-9.6 Z`;
export const HEADP = {
	hairM: 'M8.2,-30 C6.6,-29 5.2,-27.6 4.4,-25.6 L3.4,-22.6 L2.6,-19.4 C1.4,-18.6 0.4,-17.4 -0.4,-15.6 L-6.6,-10 C-11.6,-13.8 -12.8,-23.8 -9.4,-29.8 C-5.9,-35.4 2.9,-36 7.6,-31.4 Z',
	hairW: 'M8.6,-29.4 C6.8,-28.6 5,-27.4 4,-25.2 L3,-22 C1.8,-19.6 0.6,-17.2 -0.6,-15 L-6.8,-10.2 C-11.8,-13.8 -13,-23.8 -9.6,-29.9 C-6,-35.6 3,-36.2 7.8,-31.6 Z',
	bunM: 'M-6.6,-34.2 C-7.4,-38.6 -4.6,-41.6 -1.4,-41.2 C1.8,-40.8 3,-37.6 1.6,-34.6 C-0.6,-33.2 -4.4,-33 -6.6,-34.2 Z',
	ribbon: 'M-7,-34.6 C-4.4,-33.2 -0.2,-33.2 2.2,-35 L2.6,-33.6 C0,-31.8 -4.6,-31.8 -7.4,-33.2 Z M-6.8,-34 C-9,-33.4 -10.4,-31.6 -10.6,-29.6 L-9.6,-29.4 C-9.2,-31.2 -8.2,-32.6 -6.6,-33 Z',
	braid: [[-7.2, -11.4], [-11.6, -17], [-12.6, -24], [-10.2, -31], [-5.8, -35.2]] as P[],
	bunW: 'M-15.6,-13.6 C-16.4,-17.6 -13.6,-20.4 -10.4,-19.8 C-7.6,-19.2 -6.6,-15.6 -8,-12.4 C-9.8,-10.2 -14.4,-10.6 -15.6,-13.6 Z',
	pin: 'M-17.6,-17.6 L-5.6,-13.2',
	/* 黔首: the commoner's dark head cloth over the bun */
	wrap: 'M8.4,-30.4 C4,-33.6 -4,-34.6 -9.6,-30.4 L-11.4,-26.6 C-6,-30 2,-30 7.4,-27.6 Z M-6.8,-34 C-7.6,-38.8 -4.4,-42 -1,-41.4 C2.2,-40.8 3.2,-37.4 1.6,-34.4 C-0.8,-33 -4.6,-32.8 -6.8,-34 Z',
	ear: 'M-1.4,-22.6 C0.4,-22.6 1,-20.4 0.6,-18.4 C0.2,-16.4 -0.8,-15.8 -2,-16 C-3.4,-16.6 -3.6,-19 -3.2,-20.8 C-2.8,-22 -2.2,-22.6 -1.4,-22.6 Z',
	eye: 'M6.3,-21.5 C7,-22.15 8.05,-22.15 8.7,-21.55 C8.05,-21.1 7,-21.05 6.3,-21.5 Z',
	brow: 'M5.2,-23.6 C6.8,-24.7 8.6,-24.9 10,-24.1',
	mouth: 'M9.9,-13.6 L8.4,-13.5',
	jaw: 'M8.2,-8.9 C5,-9.4 1.4,-11 -0.6,-14.4',
	moust: 'M10.3,-15.5 C9.2,-14.9 7.8,-14.9 6.9,-15.6 C6.3,-16.1 6.2,-16.9 6.5,-17.5 C6.8,-16.7 7.6,-15.9 9,-15.8 C9.5,-15.8 9.9,-15.9 10.3,-16.1 Z',
	lid: 'M5.8,-22 C6.8,-23 8.2,-23 9,-21.9',
	cheek: 'M6.4,-18.6 C7.6,-17.6 8.4,-16.4 8.6,-15.4',
};

/* ============================== props ============================== */
/** the 木牍: a 23 × 3.4 cm board; drawn in its own frame (bottom-centre at 0, long axis up = −y), columns of brush marks.
    cols = how many columns are written (the rest are blank); age 0 = fresh wood, 1 = the excavated black board */
export const DU_L = 23, DU_W = 3.4;
export const duMarks = (cols: number, seed = 1, colsMax = 4) => { let d = '';
	for (let c = 0; c < cols; c++) { const x = -DU_W / 2 + (c + 0.5) * (DU_W / colsMax); let y = -1.2; let i = 0;
		while (y > -DU_L + 1.6) { const q = rnd(c * 37 + i, seed), h = 0.55 + q * 0.5, w = 0.32 + rnd(c * 11 + i, seed + 2) * 0.2;
			const k = rnd(c * 5 + i * 3, seed + 4);
			d += k < 0.42 ? `M${f2(x - w)},${f2(y - h * 0.3)} L${f2(x + w)},${f2(y - h * 0.38)} ` : k < 0.7 ? `M${f2(x - w * 0.2)},${f2(y)} L${f2(x)},${f2(y - h)} ` : k < 0.86 ? `M${f2(x - w)},${f2(y - h)} L${f2(x + w * 0.8)},${f2(y - h * 0.2)} ` : `M${f2(x - w * 0.6)},${f2(y - h * 0.6)} L${f2(x + w * 0.6)},${f2(y - h * 0.6)} M${f2(x)},${f2(y - h)} L${f2(x)},${f2(y - h * 0.1)} `;
			y -= h + 0.28 + rnd(i, seed + 7) * 0.2; i++; } }
	return d; };
export const DU_OUT = sm([[-DU_W / 2, 0], [-DU_W / 2, 0], [-DU_W / 2, -DU_L], [-DU_W / 2, -DU_L], [DU_W / 2, -DU_L], [DU_W / 2, -DU_L], [DU_W / 2, 0], [DU_W / 2, 0]]);

/* ============================== beats: the staging ============================== */
/** beat 1: 黑夫 (no armour) writes on the 牍 on his knee; 惊 (armoured) leans in. Both on a log, the fire to the right. */
export const B1 = {
	heifu: {x: 1000, y: 868, k: 6.3, pose: {kind: 'soldier', seat: 'log', lean: 15, neck: 26, thN: 76, shN: 14, thF: 81, shF: 20, ftN: -6, ftF: -2, hN: [15.5, -23], hF: [32, -5], aN: 30, aF: -12} as Pose},
	jing: {x: 655, y: 842, k: 5.7, pose: {kind: 'armour', seat: 'log', lean: 21, neck: 14, thN: 79, shN: 10, thF: 84, shF: 16, ftN: -4, ftF: -2, hN: [37, 0], hF: [27, 3], aN: 14, aF: 20, moust: true} as Pose},
	/* the 牍 on 黑夫's far knee (rig cm): bottom centre, tilt (deg, top leaning back toward him) */
	du: {at: [35.2, -2.2] as P, tilt: -12, s: 1.2},
	brush: {a: [13.2, -30.4] as P, b: [29.6, -14.6] as P},
	fire: {x: 1530, y: 1010, s: 1},
};
/** beat 2: 安陆, dusk. The mother (跪坐 on the step, facing −x) holds the 牍; 衷 (one knee down, facing +x) leans in and reads. */
export const B2 = {
	mother: {x: 1450, y: 884, k: 5.6, pose: {kind: 'woman', seat: 'kneel', lean: 8, neck: 16, thN: 71, shN: -95, thF: 74, shF: -97, hN: [27, -17.5], hF: [30, -29], aN: -30, aF: -56, old: true} as Pose},
	zhong: {x: 905, y: 818, k: 5.6, pose: {kind: 'farmer', seat: 'half', lean: 27, neck: 16, thN: 84, shN: 0, thF: 6, shF: -92, ftN: 0, ftF: 90, hN: [42, -5], hF: [55, -21], aN: 18, aF: -18} as Pose},
	/* the 牍 in the mother's hands (her rig cm, before the flip) */
	du: {at: [33.6, -15.6] as P, tilt: 24, s: 1.2},
};
/** beat 3: 睡虎地 4号墓: the board in two gloved hands under the lamp */
export const B3 = {du: {x: 985, y: 610, ang: -7, k: 22}};

/* ============================== overlay ============================== */
export type Beat = {rows: string[]; y: string; place: string; note: string; age: string};
export const BEATS: Beat[] = [
	{rows: ['两千两百年前，', '一个士兵给妈妈写信：[快寄钱来]。'], y: '约前223', place: '淮阳', note: '秦灭楚之战', age: '0'},
	{rows: ['你被送回了安陆。'], y: '约前223', place: '安陆', note: '黑夫、惊的家', age: '0'},
	{rows: ['你，到家了。'], y: '1975–76', place: '云梦', note: '睡虎地 4号秦墓', age: '2197'},
];
export const thDark: Theme = {ink: '#FFF6E6', key: '#E8BC66', rule: '#E8BC66', dim: 0.85, pool: 'rgba(14,8,5,A)', poolA: 0.4, halo: '0 0 2px rgba(14,8,5,0.95), 0 2px 8px rgba(14,8,5,0.8), 0 2px 22px rgba(14,8,5,0.6)'};
export const Overlay: React.FC<{beat: number; th: Theme; label: string; sealDisc?: string}> = ({beat, th, label, sealDisc}) => { const b = BEATS[beat];
	return <>
		<Subs rows={b.rows.map((s) => ({s}))} th={th} />
		<Stamp y={b.y} place={b.place} note={b.note} th={th} />
		<div style={{position: 'absolute', left: SAFE_X + 30, bottom: SAFE_Y + 4, display: 'flex', alignItems: 'baseline', gap: 10, color: th.ink, textShadow: th.halo, fontFamily: SANS, whiteSpace: 'nowrap'}}>
			<span style={{fontSize: 34, fontWeight: 700}}>你</span><span style={{fontSize: 74, fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>{b.age}</span><span style={{fontSize: 34, fontWeight: 700}}>岁</span></div>
		<Seal disc={sealDisc} />
		<div style={{position: 'absolute', left: 0, top: 0, height: 40, padding: '0 16px', background: 'rgba(0,0,0,0.72)', color: '#F2E6CC', fontFamily: SANS, fontWeight: 700, fontSize: 22, lineHeight: '40px'}}>{label}</div>
	</>; };
export const Frame: React.FC<{children: React.ReactNode; bg?: string}> = ({children, bg = '#000'}) => <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>{children}</AbsoluteFill>;
