import React from 'react';
import {lerp, cl, rnd} from '../qq50/kit50';
import {Cam, proj, V3} from './parts53';
import {SW, LB, bladeHW, BZ, GLS, LAT, PALE} from './props53';
/* ep53 · TakeC: the one blade look for legs 8–12 (43.5 → 75.2 s). LATTICE is the 8.2 s look of props53.Sword (tan diamonds, #22140A
   lines, #FFF0CC pale cells, a dark core in the tan ones); BladeFlat draws that look through any camera (the paper test's 3/4 view
   and the face-on views), MarkSet draws the eight 鸟篆 marks through any (a, w) → screen map, so the chamber, the paper test and the
   macro all show the same sword. Blade-local: a cm from the pommel end (+ toward the tip), w cm across (+ = up on the blade's face). */
export const LATTICE = {La: 2.05, Lw: 1.18, line: LAT, pale: PALE, gold: '#E2B464', paleOp: 0.2};
export type Map2 = (a: number, w: number) => [number, number];
const f1 = (v: number) => v.toFixed(1);
export const mapOf = (c: Cam, world: (a: number, w: number) => V3): Map2 => (a, w) => { const p = proj(c, world(a, w)); return [p[0], p[1]]; };
export const BladeFlat: React.FC<{S: Map2; id: string; spec?: number; hilt?: boolean}> = ({S, id, spec = 0.5, hilt = true}) => {
	const A0 = SW.bladeA, N = 70, ss = Array.from({length: N + 1}, (_, i) => LB * i / N);
	const P = (a: number, w: number) => { const q = S(a, w); return `${f1(q[0])},${f1(q[1])}`; };
	const edgeW = (s: number) => 0.34 * cl(bladeHW(s) / 1.4, 0.25, 1);
	const R = ss.map((s) => P(A0 + s, bladeHW(s))), Lf = ss.map((s) => P(A0 + s, -bladeHW(s)));
	const RI = ss.map((s) => P(A0 + s, Math.max(0, bladeHW(s) - edgeW(s)))), LI = ss.map((s) => P(A0 + s, -Math.max(0, bladeHW(s) - edgeW(s))));
	const outline = `M${R.join('L')}L${[...Lf].reverse().join('L')}Z`, inner = `M${RI.join('L')}L${[...LI].reverse().join('L')}Z`;
	const flankL = `M${LI.join('L')}L${P(SW.L, 0)}L${P(A0, 0)}Z`, flankR = `M${RI.join('L')}L${P(SW.L, 0)}L${P(A0, 0)}Z`;
	const stripL = `M${Lf.join('L')}L${[...LI].reverse().join('L')}Z`, stripR = `M${R.join('L')}L${[...RI].reverse().join('L')}Z`;
	const km = (() => { const a = S(A0 + 12, 0), b = S(A0 + 13, 0); return Math.hypot(a[0] - b[0], a[1] - b[1]); })();
	const {La, Lw} = LATTICE, cells: React.ReactNode[] = [];
	const pMin = Math.floor(A0 / La - 3 / Lw) - 1, pMax = Math.ceil(SW.L / La + 3 / Lw) + 1;
	const D = (i: number, j: number, sc: number) => { const ca = (i + j + 1) / 2 * La, cw = (i - j) / 2 * Lw;
		return `M${P(ca - La / 2 * sc, cw)}L${P(ca, cw + Lw / 2 * sc)}L${P(ca + La / 2 * sc, cw)}L${P(ca, cw - Lw / 2 * sc)}Z`; };
	for (let i = pMin; i <= pMax; i++) for (let j = pMin; j <= pMax; j++) { const ca = (i + j + 1) / 2 * La, cw = (i - j) / 2 * Lw;
		if (ca < A0 - La || ca > SW.L + La || Math.abs(cw) > 3.2) continue;
		const pale = (i + j) % 2 === 0, inscr = ca > A0 + 1.2 && ca < A0 + 7.6;
		cells.push(<g key={`${i}_${j}`}>
			{pale && <path d={D(i, j, 0.86)} fill={LATTICE.pale} opacity={inscr ? 0.08 : LATTICE.paleOp} />}
			<path d={D(i, j, 1)} fill="none" stroke={LATTICE.line} strokeWidth={0.13 * km} strokeOpacity={inscr ? 0.3 : 0.85} />
			<path d={D(i, j, 0.78)} fill="none" stroke={LATTICE.line} strokeWidth={0.045 * km} strokeOpacity={inscr ? 0.15 : 0.55} />
			{!pale && !inscr && <path d={D(i, j, 0.4)} fill={LATTICE.line} opacity={0.7} />}
		</g>); }
	const g0 = S(A0 + 20, -2.4), g1 = S(A0 + 20, 2.4), s0 = S(A0, 0), s1 = S(SW.L, 0);
	const gA = SW.gripA, gB = SW.guardA;
	const pom = `M${P(0, -1.86)}L${P(0, 1.86)}L${P(0.22, 1.92)}Q${P(0.42, 1.5)} ${P(0.56, 1.0)}L${P(0.8, 0.88)}L${P(0.8, -0.88)}L${P(0.56, -1.0)}Q${P(0.42, -1.5)} ${P(0.22, -1.92)}Z`;
	const guard = `M${P(gA, -2.3)}L${P(gA, 2.3)}L${P(gB - 0.15, 2.78)}L${P(gB, 2.7)}Q${P(gB - 0.3, 1.2)} ${P(A0, 0)}Q${P(gB - 0.3, -1.2)} ${P(gB, -2.7)}L${P(gB - 0.15, -2.78)}Z`;
	const inlay = (s: number) => <g key={s}>
		<path d={`M${P(gA + 0.22, s * 0.24)}L${P(gA + 0.22, s * 2.18)}L${P(gB - 0.3, s * 2.5)}Q${P(gB - 0.5, s * 1.1)} ${P(A0 - 0.2, s * 0.24)}Z`} fill={`url(#bgl${id})`} />
		<path d={`M${P(gA + 0.22, s * 1.05)}L${P(gA + 0.95, s * 1.05)}L${P(gA + 0.95, s * 1.75)}M${P(gA + 0.95, s * 1.05)}L${P(gB - 0.42, s * 0.55)}M${P(gA + 0.6, s * 1.75)}L${P(gB - 0.32, s * 2.12)}M${P(gA + 0.22, s * 0.6)}L${P(gA + 0.6, s * 0.6)}L${P(gA + 0.6, s * 0.24)}`} stroke={BZ.mid} strokeWidth={0.12 * km} fill="none" strokeLinejoin="miter" />
	</g>;
	const cy0 = S(0, 0), cy1 = S(0, 0), gw0 = S(0, -2), gw1 = S(0, 2);
	void cy0; void cy1;
	return <g>
		<defs>
			<linearGradient id={`bbl${id}`} gradientUnits="userSpaceOnUse" x1={g0[0]} y1={g0[1]} x2={g1[0]} y2={g1[1]}><stop offset="0" stopColor="#B07A38" /><stop offset="0.28" stopColor={LATTICE.gold} /><stop offset="0.49" stopColor="#D6A456" /><stop offset="0.53" stopColor="#A87436" /><stop offset="1" stopColor="#7A4E24" /></linearGradient>
			<linearGradient id={`bcy${id}`} gradientUnits="userSpaceOnUse" x1={gw0[0]} y1={gw0[1]} x2={gw1[0]} y2={gw1[1]}><stop offset="0" stopColor={BZ.deep} /><stop offset="0.28" stopColor={BZ.mid} /><stop offset="0.42" stopColor={BZ.lit} /><stop offset="0.7" stopColor={BZ.dark} /><stop offset="1" stopColor={BZ.deep} /></linearGradient>
			<linearGradient id={`bgl${id}`} gradientUnits="userSpaceOnUse" x1={gw0[0]} y1={gw0[1]} x2={gw1[0]} y2={gw1[1]}><stop offset="0" stopColor={GLS.lit} /><stop offset="0.55" stopColor={GLS.body} /><stop offset="1" stopColor={GLS.deep} /></linearGradient>
			<linearGradient id={`bsp${id}`} gradientUnits="userSpaceOnUse" x1={s0[0]} y1={s0[1]} x2={s1[0]} y2={s1[1]}><stop offset="0" stopColor="#FFF8E0" stopOpacity="0" /><stop offset="0.38" stopColor="#FFF8E0" stopOpacity={spec} /><stop offset="0.55" stopColor="#FFF8E0" stopOpacity={spec * 0.6} /><stop offset="0.8" stopColor="#FFF8E0" stopOpacity="0" /></linearGradient>
			<clipPath id={`bin${id}`}><path d={inner} /></clipPath>
		</defs>
		<path d={outline} fill={`url(#bbl${id})`} />
		<g clipPath={`url(#bin${id})`}>{cells}</g>
		<path d={stripL} fill={BZ.hi} opacity={0.62} /><path d={stripR} fill={BZ.lit} opacity={0.42} />
		<path d={flankR} fill="#140902" opacity={0.3} /><path d={flankL} fill={`url(#bsp${id})`} />
		<path d={`M${P(A0 + 0.2, -0.05)}L${P(SW.L - 1.2, -0.03)}`} stroke={BZ.hi} strokeWidth={0.1 * km} strokeLinecap="round" />
		<path d={`M${P(A0 + 0.2, 0.08)}L${P(SW.L - 1.2, 0.05)}`} stroke={BZ.deep} strokeWidth={0.07 * km} strokeOpacity={0.7} strokeLinecap="round" />
		<path d={outline} fill="none" stroke="#FFF3CF" strokeWidth={Math.max(2, 0.05 * km)} strokeOpacity={0.9} />
		{hilt && <g>
			<path d={`M${P(SW.pomA, -0.86)}L${P(SW.pomA, 0.86)}L${P(gA + 0.05, 0.86)}L${P(gA + 0.05, -0.86)}Z`} fill={`url(#bcy${id})`} />
			{[3.3, 6.0].map((a, i) => <path key={i} d={`M${P(a - 0.26, -1.06)}L${P(a - 0.26, 1.06)}L${P(a + 0.26, 1.06)}L${P(a + 0.26, -1.06)}Z`} fill={`url(#bcy${id})`} stroke={BZ.line} strokeOpacity={0.5} strokeWidth={0.04 * km} />)}
			<path d={pom} fill={`url(#bcy${id})`} stroke={BZ.line} strokeOpacity={0.5} strokeWidth={0.04 * km} />
			<path d={guard} fill={`url(#bcy${id})`} stroke={BZ.line} strokeOpacity={0.6} strokeWidth={0.05 * km} />
			{inlay(-1)}{inlay(1)}
			<path d={`M${P(gA + 0.06, -2.3)}L${P(gA + 0.06, 2.3)}`} stroke={BZ.hi} strokeWidth={0.06 * km} strokeOpacity={0.6} />
		</g>}
	</g>;
};
/* ---------- the eight 鸟篆 marks: long vertical strokes with curled ends, a bird's head with beak and crest on top. Box: x ±0.4, y −0.9 … +0.95 (cm) ---------- */
const birdScript = (seed: number) => { const r = (k: number) => rnd(seed * 13 + k, 29), f = (v: number) => v.toFixed(3), d: string[] = [];
	const m = r(1) > 0.5 ? 1 : -1, a = 0.12 + 0.1 * r(2), y1 = -0.25 + 0.25 * r(3), y2 = 0.12 + 0.25 * r(4), tail = 0.5 + 0.25 * r(5);
	/* the spine: one long S-curved vertical from the neck down to a coiled tail */
	d.push(`M0,-0.58 C${f(m * a)},-0.3 ${f(-m * a)},-0.02 0,0.26 C${f(m * a * 0.8)},0.46 ${f(m * 0.02)},${f(tail)} ${f(-m * 0.16)},${f(tail - 0.02)} q${f(-m * 0.1)},-0.02 ${f(-m * 0.08)},-0.13 q${f(m * 0.03)},-0.08 ${f(m * 0.1)},-0.04`);
	/* a second long stroke beside it, hooked at both ends */
	const x2 = m * (0.3 + 0.06 * r(6)), t2 = -0.4 + 0.2 * r(7), b2 = 0.55 + 0.3 * r(8);
	d.push(`M${f(x2)},${f(t2)} C${f(x2 + m * 0.07)},${f(t2 + 0.3)} ${f(x2 - m * 0.07)},${f(b2 - 0.3)} ${f(x2)},${f(b2 - 0.1)} q0,0.1 ${f(-m * 0.14)},0.09 q${f(-m * 0.1)},-0.01 ${f(-m * 0.08)},-0.1`);
	d.push(`M${f(x2)},${f(t2)} q0,-0.1 ${f(m * 0.12)},-0.1 q${f(m * 0.09)},0 ${f(m * 0.07)},0.1`);
	/* wings: feather-like ribbons that leave the spine and end in spirals, one on each side */
	d.push(`M${f(m * 0.02)},${f(y1)} C${f(-m * 0.16)},${f(y1 - 0.12)} ${f(-m * 0.34)},${f(y1 - 0.06)} ${f(-m * 0.33)},${f(y1 + 0.1)} q0,0.1 ${f(m * 0.1)},0.08 q${f(m * 0.06)},-0.03 ${f(m * 0.02)},-0.09`);
	d.push(`M${f(-m * 0.01)},${f(y2)} C${f(m * 0.1)},${f(y2 + 0.14)} ${f(m * 0.2)},${f(y2 + 0.04)} ${f(m * 0.17)},${f(y2 - 0.08)}`);
	/* the bird's head on the neck: beak, crest curl, eye */
	const hy = -0.7;
	d.push(`M${f(m * 0.07)},${f(hy - 0.02)} l${f(m * 0.15)},0.03 l${f(-m * 0.14)},0.045`);
	d.push(`M${f(-m * 0.02)},${f(hy - 0.08)} q${f(-m * 0.05)},-0.14 ${f(-m * 0.18)},-0.09 q${f(-m * 0.05)},0.05 ${f(-m * 0.01)},0.09`);
	return {d, eye: [0, hy] as [number, number]}; };
/** the mark rows: side +1 = 自作用剑 (above the ridge), −1 = 越王鸠浅 (below); n 0–3 along the blade. Centres in blade-local (a, w). */
export const markAt = (side: number, n: number): [number, number] => [SW.bladeA + 2.3 + n * 1.5, side * 1.1];
export const MarkSet: React.FC<{S: Map2; o: number; col: (side: number, n: number) => string; lit: (side: number, n: number) => number; id: string}> = ({S, o, col, lit, id}) => {
	const mat = (a: number, w: number) => { const c = S(a, w), A = S(a + 1, w), Wv = S(a, w + 1);
		return {m: `matrix(${f1((c[0] - A[0]) * 1000 / 1000)} ${f1(c[1] - A[1])} ${f1(c[0] - Wv[0])} ${f1(c[1] - Wv[1])} ${f1(c[0])} ${f1(c[1])})`, k: Math.hypot(A[0] - c[0], A[1] - c[1])}; };
	const marks = [1, -1].flatMap((side) => [0, 1, 2, 3].map((n) => ({side, n, seed: n + (side < 0 ? 4 : 0) + 3, b: lit(side, n), ...(() => { const [a, w] = markAt(side, n); return mat(a, w); })()})));
	return <g>
		<defs><filter id={`mg${id}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={Math.max(2, marks[0].k * 0.12)} /></filter></defs>
		<g filter={`url(#mg${id})`}>{marks.filter((q) => q.b > 0.02).map((q) => <ellipse key={`${q.side}${q.n}`} transform={q.m} cx={0} cy={0} rx={0.62} ry={0.95} fill="#FFC860" opacity={0.6 * q.b} />)}</g>
		{marks.map((q) => { const g = birdScript(q.seed), c = col(q.side, q.n);
			return <g key={`${q.side}${q.n}`} transform={q.m} opacity={o * (0.9 + 0.1 * q.b)}>{g.d.map((p, i) => <path key={i} d={p} fill="none" stroke={c} strokeWidth={0.085} strokeLinecap="round" strokeLinejoin="round" />)}
				<circle cx={g.eye[0]} cy={g.eye[1]} r={0.075} fill="none" stroke={c} strokeWidth={0.07} /><circle cx={g.eye[0] + 0.01} cy={g.eye[1]} r={0.025} fill={c} /></g>; })}
	</g>; };
void lerp;
