import React from 'react';
import {sm, tube, ik, sleeve, mitten, P} from './kf55h';
/* ep55 · 何尊 — a jointed silhouette rig for the all-key-frames board (kfall55h). Units cm, ground y = 0, y down, facing +x.
   A pose is a skeleton (hip, shoulder, head, knees, ankles, hands; elbows by two-bone IK unless given), so every limb bends
   only at its joints. The dress is a smooth hull over the joints (robes) or tubes (trousers). Drawn in warm black and rim-lit
   by the same filter as kf55h's Person. Adult proportions: about 170 cm standing, head 23 cm (7.4 heads). */
export type Sk = {hip: P; sh: P; hd: P; kN: P; fN: P; kF: P; fF: P; hN: P; hF: P; eN?: P; eF?: P;
	toeN?: number; toeF?: number;   // foot direction along the ground: +1 forward (standing), -1 back (kneeling, instep down)
	tilt?: number;                  // head tilt, degrees (+ = nod down / forward)
	elbowUpN?: boolean; elbowUpF?: boolean};
export type Dress = 'robe' | 'kingrobe' | 'jacket' | 'zsz' | 'labcoat';
export type Hat = 'guan' | 'mian' | 'towel' | 'cadre' | 'none';
const add = (a: P, b: P, k = 1): P => [a[0] + b[0] * k, a[1] + b[1] * k];
const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]];
const len = (a: P) => Math.hypot(a[0], a[1]) || 1;
const nz = (a: P): P => { const l = len(a); return [a[0] / l, a[1] / l]; };
const lerpP = (a: P, b: P, u: number): P => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
/** convex hull (monotone chain) */
const hull = (pts: P[]): P[] => { const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]); if (p.length < 3) return p;
	const cr = (o: P, a: P, b: P) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
	const lo: P[] = []; for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
	const up: P[] = []; for (const q of [...p].reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
	return [...lo.slice(0, -1), ...up.slice(0, -1)]; };
/** an elbow: two-bone IK, the bend below the shoulder→hand line (or above it when up) */
const elbow = (s: P, h: P, up = false): P => { if (!up) return ik(s, h, 30, 28); const m: P = [h[0], -h[1]], ms: P = [s[0], -s[1]], e = ik(ms, m, 30, 28); return [e[0], -e[1]]; };
/** a foot from the ankle a along the ground, direction d (+1 forward, −1 back) */
const foot = (a: P, d: number) => sm([[a[0] - d * 6, a[1] - 5], [a[0] + d * 13, a[1] - 2], [a[0] + d * 17, a[1] + 4], [a[0] + d * 15, a[1] + 6], [a[0] - d * 7, a[1] + 6]]);
/** the head, profile facing +x, rotated by tilt about its centre */
const headPts = (hd: P, tilt: number): P[] => { const a = tilt * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
	return ([[-10, -2], [-7, -12], [3, -14], [10, -7], [12, 1], [9, 9], [2, 12], [-7, 8]] as P[]).map(([x, y]) => [hd[0] + x * c - y * s, hd[1] + x * s + y * c] as P); };
const rotAt = (hd: P, tilt: number) => (x: number, y: number): P => { const a = tilt * Math.PI / 180; return [hd[0] + x * Math.cos(a) - y * Math.sin(a), hd[1] + x * Math.sin(a) + y * Math.cos(a)]; };
/** a wide 西周 sleeve (袂) hanging from the forearm */
const drape = (e: P, h: P, D: number) => { const m = lerpP(e, h, 0.55), lo = Math.max(e[1], h[1]);
	return sm([add(e, [0, -3]), add(h, [-2, -4]), add(h, [1, 6]), [h[0] - 4, lo + D * 0.75], [m[0] - 2, lo + D], [e[0] + 2, Math.max(e[1] + 6, lo + D * 0.55)], add(e, [-4, 4])]); };

export const Body: React.FC<{s: Sk; dress: Dress; hat: Hat; part?: 'all' | 'back' | 'front'; wide?: number}> = ({s, dress, hat, part = 'all', wide = 1}) => {
	const sp = nz(sub(s.sh, s.hip)), n: P = [-sp[1], sp[0]], L = len(sub(s.sh, s.hip));
	const shF = add(add(s.sh, n, -1.5), sp, -1);
	const eN = s.eN ?? elbow(s.sh, s.hN, s.elbowUpN), eF = s.eF ?? elbow(shF, s.hF, s.elbowUpF);
	const robe = dress === 'robe' || dress === 'kingrobe';
	const W = wide * (dress === 'kingrobe' ? 1.12 : 1);
	const torso = sm([add(s.hip, n, -11 * W), add(add(s.hip, sp, L * 0.5), n, -10.5 * W), add(add(s.sh, n, -10 * W), sp, -1), add(s.sh, sp, 5), add(s.sh, n, 10 * W),
		add(add(s.hip, sp, L * 0.66), n, 12.5 * W), add(s.hip, n, 11.5 * W), add(add(s.hip, n, 9 * W), sp, -6), add(add(s.hip, n, -9 * W), sp, -6)]);
	const legW = dress === 'jacket' || dress === 'zsz' ? 1.08 : 1;
	const leg = (k: P, f: P, d: number, key: string) => <g key={key}><path d={tube(s.hip, k, 9 * legW, 7 * legW)} /><path d={tube(k, f, 6.8 * legW, 5 * legW)} /><path d={foot(f, d)} /></g>;
	const arm = (sh: P, e: P, h: P, key: string, ww = 1) => <g key={key}><path d={sleeve(sh, e, h, 6.4 * ww, 5.4 * ww, 4.8 * ww)} /><path d={mitten(e, h)} />
		{robe && <path d={drape(e, h, dress === 'kingrobe' ? 34 : 26)} />}</g>;
	/* the dress */
	let dressEl: React.ReactNode = null;
	if (robe) {   /* 上衣下裳: a hull from the shoulders over the hips, knees and to a flared hem at the feet */
		const pts: P[] = [add(s.sh, n, -11 * W), add(s.sh, n, 11 * W), add(s.sh, sp, 4), add(s.hip, n, -13 * W), add(s.hip, n, 13 * W)];
		for (const k of [s.kN, s.kF]) pts.push(add(k, [-9, 0]), add(k, [9, 0]), add(k, [0, -6]));
		for (const f of [s.fN, s.fF]) { const kneel = f[1] > -14 && Math.abs(f[1] - s.kN[1]) < 12; pts.push(add(f, [-11, kneel ? 4 : 6]), add(f, [11, kneel ? 4 : 6]), add(f, [0, -8])); }
		dressEl = <path d={sm(hull(pts))} />;
		/* the 蔽膝 (knee cover) hanging from the belt in front, and the belt line as a notch of light (rim catches it) */
	} else if (dress === 'jacket' || dress === 'zsz' || dress === 'labcoat') {
		const drop = dress === 'labcoat' ? 40 : dress === 'zsz' ? 14 : 12;
		const hemB = add(add(s.hip, n, -13 * W), sp, -drop), hemF = add(add(s.hip, n, 13 * W), sp, -drop);
		dressEl = <path d={sm([add(s.sh, n, -12 * W), add(s.hip, n, -13.5 * W), hemB, add(hemB, n, 4), add(hemF, n, -4), hemF, add(s.hip, n, 13.5 * W), add(s.sh, n, 11.5 * W), add(s.sh, sp, 4)])} />;
	}
	/* head + hat */
	const tilt = s.tilt ?? 0, R = rotAt(s.hd, tilt);
	const head = <path d={sm(headPts(s.hd, tilt))} />;
	let hatEl: React.ReactNode = null;
	if (hat === 'guan') hatEl = <><path d={sm([R(-6, -11), R(-5, -21), R(2, -23), R(5, -15)])} /><path d={sm([R(-14, -17), R(10, -19), R(10, -16.5), R(-14, -14.5)])} /></>;   // a small cap over the topknot, a hairpin across it
	else if (hat === 'mian') hatEl = <>   {/* 冕: the cap body, the board (綖) tilted forward, the bead strings (旒) front and back */}
		<path d={sm([R(-9, -9), R(-8, -19), R(4, -21), R(9, -12)])} />
		<path d={sm([R(-20, -22), R(22, -27), R(22, -24), R(-20, -19)], true)} />
		{[17, 19.5, 22].map((x, i) => <path key={i} d={tube(R(x, -25 + 0.1 * x), R(x + 0.4, -5), 0.55, 0.55)} />)}
		{[-15, -17.5, -20].map((x, i) => <path key={`b${i}`} d={tube(R(x, -20), R(x - 0.3, -2), 0.55, 0.55)} />)}</>;
	else if (hat === 'towel') hatEl = <><path d={sm([R(-11, -3), R(-10, -13), R(0, -16), R(9, -13), R(12, -6), R(5, -7), R(-4, -6)])} /><path d={sm([R(6, -13), R(12, -20), R(15, -16), R(11, -10)])} /><path d={sm([R(3, -14), R(4, -22), R(8, -20), R(8, -13)])} /></>;   // 羊肚手巾, knotted over the brow
	else if (hat === 'cadre') hatEl = <path d={sm([R(-11, -3), R(-10, -14), R(1, -18), R(10, -13), R(19, -8), R(18, -6), R(8, -6)])} />;
	const neck = <path d={tube(add(add(s.sh, sp, 1), n, 2), add(s.hd, [-(sp[0]) * 0, 7]), 5.4, 5)} />;
	const back = <>{arm(shF, eF, s.hF, 'aF')}{leg(s.kF, s.fF, s.toeF ?? 1, 'lF')}{robe && dressEl}<path d={torso} />{leg(s.kN, s.fN, s.toeN ?? 1, 'lN')}{!robe && dressEl}{neck}{head}{hatEl}</>;
	const front = arm(s.sh, eN, s.hN, 'aN', dress === 'jacket' ? 1.1 : 1);
	return <g>{part !== 'front' && back}{part !== 'back' && front}</g>; };

/** place a body on screen: feet at (x, y), k px per cm, flip = facing left; rimmed by a key from (lx, ly) like kf55h's Person */
export const Sil: React.FC<{id: string; x: number; y: number; k: number; flip?: boolean; rim: string; lx: number; ly: number; fill?: string; o?: number; rimW?: number; children: React.ReactNode}> =
	({id, x, y, k, flip, rim, lx, ly, fill = '#120C09', o = 1, rimW = 3.2, children}) => <g opacity={o}>
	<defs><filter id={id} x="-30%" y="-15%" width="160%" height="130%" colorInterpolationFilters="sRGB">
		<feOffset in="SourceAlpha" dx={-lx * rimW} dy={-ly * rimW} result="o" /><feComposite in="SourceAlpha" in2="o" operator="out" result="band" />
		<feGaussianBlur in="band" stdDeviation={0.9} result="bb" /><feFlood floodColor={rim} result="fc" /><feComposite in="fc" in2="bb" operator="in" result="r" />
		<feComposite in="r" in2="SourceAlpha" operator="in" result="r2" /><feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="r2" /></feMerge></filter></defs>
	<g filter={`url(#${id})`}><g transform={`translate(${x},${y}) scale(${flip ? -k : k},${k})`} fill={fill}>{children}</g></g></g>;
/** screen → body-local cm for a body placed at (x, y), k, flip */
export const toLocal = (q: P, x: number, y: number, k: number, flip = false): P => [(q[0] - x) / (flip ? -k : k), (q[1] - y) / k];

/* ============================== poses ============================== */
const deg = Math.PI / 180;
const fromHip = (hip: P, L: number, a: number): P => [hip[0] + L * Math.sin(a * deg), hip[1] - L * Math.cos(a * deg)];
/** 跽: kneeling upright on both knees, the insteps flat behind, bowing `bow` degrees, hands joined (拱手) before the face */
export const kneel = (bow = 12, hands: 'gong' | 'down' = 'gong'): Sk => { const hip: P = [10, -50], sh = fromHip(hip, 50, bow), hd = fromHip(sh, 17, bow + 14);
	const hN: P = hands === 'gong' ? [sh[0] + 30, sh[1] + 6] : [sh[0] + 22, sh[1] + 52], hF: P = hands === 'gong' ? [sh[0] + 31, sh[1] + 3] : [sh[0] + 18, sh[1] + 50];
	return {hip, sh, hd, kN: [20, -7], kF: [16, -7], fN: [-24, -6], fF: [-27, -6], toeN: -1, toeF: -1, hN, hF, tilt: bow * 0.6}; };
/** standing; lean forward in degrees, stride 0..1, hands given */
export const stand = (lean: number, stride: number, hN: P, hF: P, tilt = 0): Sk => { const hip: P = [0, -92], sh = fromHip(hip, 50, lean), hd = fromHip(sh, 18, lean + 6);
	return {hip, sh, hd, kN: [10 * stride + 3, -48], fN: [24 * stride + 4, -8], kF: [-8 * stride, -48], fF: [-22 * stride, -8], hN, hF, tilt}; };
/** crouched on the far knee, the near foot planted forward, leaning in to work at something low in front */
export const crouch = (lean: number, hN: P, hF: P, tilt = 20): Sk => { const hip: P = [-4, -46], sh = fromHip(hip, 50, lean), hd = fromHip(sh, 17, lean + 12);
	return {hip, sh, hd, kN: [32, -48], fN: [34, -8], kF: [10, -7], fF: [-32, -6], toeF: -1, hN, hF, tilt}; };
