import React from 'react';
import {lerp, rnd, cl} from '../qq50/kit50';
/* ep53 越王勾践剑 · style frames (B「漆」 night). Shared props: the sword (drawn from the verified specs in
   episodes/53-goujian/facts.md, B1–B6, C1), the kitchen knife, the ring disc of the pommel.
   The sword's bronze-gold and the blue glass of its guard are the only saturated colours in the film.

   Sword geometry (cm, measured along the axis from the pommel end):
   - total 55.6 (B1); blade base width ≈ 4.8 (B2 「约5厘米」), slim, straight, double-edged, a raised central ridge, two slight
     curves on each edge (widest at the base, a gentle waist about 3/5 up, a convex point);
   - pommel 0–1.0: a disc flared outward (B6), 11 concentric rings cast in its end face (seen only in the mirror);
   - grip 1.0–8.4 with two raised bands (round grip of the Wu–Yue type);
   - guard 8.4–9.9: blue glass inlay on the front face, turquoise on the back (B5);
   - blade 9.5–55.6: dark diamond lattice 菱形暗格纹 (B4) on a gold ground, polished edge strips, the 8-character bird-script
     inscription near the guard as two columns of 4 abstract marks (C1; NOT readable glyphs: no rubbing was traced). */

export const BZ = {hi: '#FFF3CF', lit: '#F4D088', body: '#DCAA5E', mid: '#BC8744', dark: '#80552A', deep: '#4A2E14', line: '#2A180A'};
export const LAT = '#22140A';                      // the dark of the lattice
export const PALE = '#FFF0CC';                     // the tin-rich (whitish) diamonds
export const GLS = {hi: '#D8ECFF', lit: '#6AA8F0', body: '#2F6CC8', deep: '#163C84'};   // blue glass
export const TQS = {lit: '#86D8C8', body: '#3FA89A', deep: '#1E6A62'};                  // turquoise (back face)

export const SW = {L: 55.6, pomA: 1.0, gripA: 8.4, guardA: 9.9, bladeA: 9.5};
export const LB = SW.L - SW.bladeA;
const PROF: [number, number][] = [[0, 2.4], [0.1, 2.37], [0.35, 2.2], [0.6, 1.97], [0.76, 2.04], [0.88, 1.9]];
/** blade half-width (cm) at s cm from the blade base */
export const bladeHW = (s: number) => { const x = s / LB; if (x >= 1) return 0; if (x <= 0) return PROF[0][1];
	if (x >= 0.88) { const u = (x - 0.88) / 0.12; return 1.9 * Math.pow(1 - Math.pow(u, 1.8), 0.85); }
	for (let i = 0; i < PROF.length - 1; i++) { const [x0, h0] = PROF[i], [x1, h1] = PROF[i + 1]; if (x <= x1) { const u = (x - x0) / (x1 - x0); return lerp(h0, h1, (1 - Math.cos(Math.PI * u)) / 2); } }
	return 1.9; };
/** edge-strip (刃) width, cm */
const edgeW = (s: number) => 0.34 * cl(bladeHW(s) / 1.4, 0.25, 1);

const f1 = (v: number) => v.toFixed(1);

/** an abstract bird-script mark (NOT a character): a curled head, a body stroke, a tail hook, a dot. Local units ≈ 1 = mark height. */
const birdMark = (cx: number, cy: number, s: number, seed: number) => { const r = (k: number) => rnd(seed * 17 + k, 9);
	const h = s, w = s * 0.62, dir = r(1) > 0.5 ? 1 : -1;
	const head = `M${f1(cx - dir * w * 0.1)},${f1(cy - h * 0.38)} q${f1(dir * w * 0.32)},${f1(-h * 0.16)} ${f1(dir * w * 0.36)},${f1(h * 0.02)} q${f1(-dir * w * 0.04)},${f1(h * 0.1)} ${f1(-dir * w * 0.18)},${f1(h * 0.04)}`;
	const body = `M${f1(cx - dir * w * 0.06)},${f1(cy - h * 0.3)} c${f1(-dir * w * 0.3)},${f1(h * 0.2)} ${f1(dir * w * (0.1 + 0.2 * r(2)))},${f1(h * 0.35)} ${f1(-dir * w * 0.12)},${f1(h * 0.66)}`;
	const tail = `M${f1(cx - dir * w * 0.36)},${f1(cy + h * 0.1 * r(3))} q${f1(dir * w * 0.4)},${f1(h * 0.1)} ${f1(dir * w * 0.62)},${f1(-h * 0.06)}`;
	const hook = `M${f1(cx + dir * w * 0.2)},${f1(cy + h * 0.26)} q${f1(dir * w * 0.14)},${f1(h * 0.14)} ${f1(-dir * w * 0.06)},${f1(h * 0.16)}`;
	return {d: `${head} ${body} ${tail} ${hook}`, dot: [cx + dir * w * 0.3, cy - h * 0.18] as [number, number]}; };

/** THE sword, front face (blue-glass side), pommel end at (x, y), pointing up (rot = degrees clockwise). k = px per cm. */
export const Sword: React.FC<{x: number; y: number; k: number; rot?: number; id: string; spec?: number}> = ({x, y, k, rot = 0, id, spec = 0.42}) => {
	const P = (a: number, w: number) => `${f1(w * k)},${f1(-a * k)}`;
	const N = 90, A0 = SW.bladeA;
	const ss = Array.from({length: N + 1}, (_, i) => LB * i / N);
	const R = ss.map((s) => P(A0 + s, bladeHW(s))), Lf = ss.map((s) => P(A0 + s, -bladeHW(s)));
	const RI = ss.map((s) => P(A0 + s, Math.max(0, bladeHW(s) - edgeW(s)))), LI = ss.map((s) => P(A0 + s, -Math.max(0, bladeHW(s) - edgeW(s))));
	const outline = `M${R.join('L')}L${[...Lf].reverse().join('L')}Z`;
	const inner = `M${RI.join('L')}L${[...LI].reverse().join('L')}Z`;
	const flankL = `M${LI.join('L')}L${P(SW.L, 0)}L${P(A0, 0)}Z`, flankR = `M${RI.join('L')}L${P(SW.L, 0)}L${P(A0, 0)}Z`;
	const stripL = `M${Lf.join('L')}L${[...LI].reverse().join('L')}Z`, stripR = `M${R.join('L')}L${[...RI].reverse().join('L')}Z`;
	/* the lattice: p = a/La + w/Lw, q = a/La − w/Lw; cells i,j; dark double lines on the cell edges, alternate cells pale
	   (tin-rich), a small dark diamond in the gold cells */
	const La = 2.7, Lw = 1.75, cells: React.ReactNode[] = [];
	const pMin = Math.floor(A0 / La - 3 / Lw) - 1, pMax = Math.ceil(SW.L / La + 3 / Lw) + 1;
	const D = (i: number, j: number, sc: number) => { const ca = (i + j + 1) / 2 * La, cw = (i - j) / 2 * Lw;
		return `M${P(ca - La / 2 * sc, cw)}L${P(ca, cw + Lw / 2 * sc)}L${P(ca + La / 2 * sc, cw)}L${P(ca, cw - Lw / 2 * sc)}Z`; };
	for (let i = pMin; i <= pMax; i++) for (let j = pMin; j <= pMax; j++) { const ca = (i + j + 1) / 2 * La, cw = (i - j) / 2 * Lw;
		if (ca < A0 - La || ca > SW.L + La || Math.abs(cw) > 3.2) continue;
		const pale = (i + j) % 2 === 0, inscr = ca > A0 + 1.2 && ca < A0 + 7.6;   // the inscription zone keeps a calmer ground
		cells.push(<g key={`${i}_${j}`}>
			{pale && <path d={D(i, j, 0.86)} fill={PALE} opacity={inscr ? 0.12 : 0.34} />}
			<path d={D(i, j, 1)} fill="none" stroke={LAT} strokeWidth={0.17 * k} strokeOpacity={inscr ? 0.35 : 0.82} />
			<path d={D(i, j, 0.78)} fill="none" stroke={LAT} strokeWidth={0.06 * k} strokeOpacity={inscr ? 0.2 : 0.6} />
			{!pale && !inscr && <path d={D(i, j, 0.34)} fill={LAT} opacity={0.62} />}
		</g>); }
	/* inscription: two columns of four abstract marks flanking the ridge, just above the guard */
	const marks = [-1, 1].flatMap((side) => [0, 1, 2, 3].map((n) => birdMark(side * 0.95 * k, -(A0 + 2.0 + n * 1.45) * k, 1.15 * k, n + (side > 0 ? 4 : 0))));
	/* guard */
	const gA = SW.gripA, gB = SW.guardA;
	const guard = `M${P(gA, -2.32)}L${P(gA, 2.32)}L${P(gB - 0.1, 2.72)}L${P(gB, 2.66)}Q${P(gB - 0.2, 1.2)} ${P(9.48, 0)}Q${P(gB - 0.2, -1.2)} ${P(gB, -2.66)}L${P(gB - 0.1, -2.72)}Z`;
	const inlay = (side: number) => { const s = side;
		return <g>
			<path d={`M${P(gA + 0.2, s * 0.26)}L${P(gA + 0.2, s * 2.15)}L${P(gB - 0.3, s * 2.42)}Q${P(gB - 0.42, s * 1.1)} ${P(9.36, s * 0.26)}Z`} fill={`url(#gl${id})`} />
			<path d={`M${P(gA + 0.62, s * 0.62)}L${P(gA + 0.62, s * 1.36)}L${P(gA + 1.02, s * 1.36)}L${P(gA + 1.02, s * 0.62)}Z`} fill={BZ.mid} />
			<path d={`M${P(gA + 0.2, s * 1.64)}L${P(gB - 0.3, s * 1.88)}`} stroke={BZ.mid} strokeWidth={0.12 * k} />
			<circle cx={s * 1.0 * k} cy={-(gA + 0.82) * k} r={0.13 * k} fill={GLS.hi} />
			<path d={`M${P(gA + 0.4, s * 1.85)}l${f1(s * 0.15 * k)},${f1(-0.3 * k)}`} stroke={GLS.hi} strokeWidth={0.06 * k} strokeOpacity={0.8} />
		</g>; };
	/* grip and pommel */
	const pom = `M${P(0, -1.9)}L${P(0, 1.9)}C${P(0.25, 1.95)} ${P(0.45, 1.3)} ${P(1.0, 0.95)}L${P(1.0, -0.95)}C${P(0.45, -1.3)} ${P(0.25, -1.95)} ${P(0, -1.9)}Z`;
	return <g transform={`translate(${x},${y}) rotate(${rot})`}>
		<defs>
			<linearGradient id={`bl${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={BZ.mid} /><stop offset="0.3" stopColor={BZ.lit} /><stop offset="0.5" stopColor={BZ.body} /><stop offset="0.55" stopColor={BZ.mid} /><stop offset="1" stopColor={BZ.dark} /></linearGradient>
			<linearGradient id={`cy${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={BZ.deep} /><stop offset="0.28" stopColor={BZ.mid} /><stop offset="0.42" stopColor={BZ.lit} /><stop offset="0.7" stopColor={BZ.dark} /><stop offset="1" stopColor={BZ.deep} /></linearGradient>
			<linearGradient id={`gl${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={GLS.lit} /><stop offset="0.55" stopColor={GLS.body} /><stop offset="1" stopColor={GLS.deep} /></linearGradient>
			<linearGradient id={`sp${id}`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#FFF8E0" stopOpacity="0" /><stop offset="0.38" stopColor="#FFF8E0" stopOpacity={spec} /><stop offset="0.55" stopColor="#FFF8E0" stopOpacity={spec * 0.6} /><stop offset="0.8" stopColor="#FFF8E0" stopOpacity="0" /></linearGradient>
			<clipPath id={`in${id}`}><path d={inner} /></clipPath>
		</defs>
		{/* blade */}
		<path d={outline} fill={`url(#bl${id})`} />
		<g clipPath={`url(#in${id})`}>{cells}</g>
		<path d={stripL} fill={BZ.hi} opacity={0.62} /><path d={stripR} fill={BZ.lit} opacity={0.42} />
		<path d={flankR} fill="#140902" opacity={0.3} />
		<path d={flankL} fill={`url(#sp${id})`} />
		{marks.map((m, i) => <g key={i}><path d={m.d} fill="none" stroke={LAT} strokeWidth={0.11 * k} strokeLinecap="round" opacity={0.85} /><circle cx={m.dot[0]} cy={m.dot[1]} r={0.1 * k} fill={LAT} opacity={0.85} /></g>)}
		{/* the raised ridge: a lit line on the left, a shadow line on the right */}
		<path d={`M${P(A0 + 0.2, -0.05)}L${P(SW.L - 1.2, -0.03)}`} stroke={BZ.hi} strokeWidth={0.1 * k} strokeLinecap="round" />
		<path d={`M${P(A0 + 0.2, 0.08)}L${P(SW.L - 1.2, 0.05)}`} stroke={BZ.deep} strokeWidth={0.07 * k} strokeOpacity={0.7} strokeLinecap="round" />
		<path d={outline} fill="none" stroke={BZ.line} strokeWidth={Math.max(1, 0.05 * k)} strokeOpacity={0.6} />
		{/* grip, two bands, pommel */}
		<rect x={-0.86 * k} y={-gA * k} width={1.72 * k} height={(gA - SW.pomA) * k} fill={`url(#cy${id})`} />
		<path d={Array.from({length: 14}, (_, i) => `M${f1(-0.86 * k)},${f1(-(1.2 + i * 0.52) * k)}l${f1(1.72 * k)},${f1(-0.36 * k)}`).join('')} stroke={BZ.deep} strokeWidth={0.05 * k} strokeOpacity={0.45} />
		{[3.3, 6.0].map((a, i) => <rect key={i} x={-1.06 * k} y={-(a + 0.26) * k} width={2.12 * k} height={0.52 * k} rx={0.12 * k} fill={`url(#cy${id})`} stroke={BZ.line} strokeOpacity={0.5} strokeWidth={0.04 * k} />)}
		<path d={pom} fill={`url(#cy${id})`} stroke={BZ.line} strokeOpacity={0.5} strokeWidth={0.04 * k} />
		<path d={`M${P(0.05, -1.86)}L${P(0.05, 1.86)}`} stroke={BZ.hi} strokeWidth={0.07 * k} strokeOpacity={0.7} />
		{/* guard with the blue glass */}
		<path d={guard} fill={`url(#cy${id})`} stroke={BZ.line} strokeOpacity={0.6} strokeWidth={0.05 * k} />
		{inlay(-1)}{inlay(1)}
		<path d={`M${P(gA + 0.06, -2.3)}L${P(gA + 0.06, 2.3)}`} stroke={BZ.hi} strokeWidth={0.06 * k} strokeOpacity={0.6} />
	</g>;
};

/** the pommel's end face: a flared disc with 11 concentric rings (B6), radius r, seen at an ellipse ratio */
export const RingDisc: React.FC<{x: number; y: number; r: number; ry?: number; id: string}> = ({x, y, r, ry = 1, id}) => <g transform={`translate(${x},${y}) scale(1,${ry})`}>
	<defs><radialGradient id={`rd${id}`} cx="0.42" cy="0.38" r="0.7"><stop offset="0" stopColor={BZ.hi} /><stop offset="0.5" stopColor={BZ.body} /><stop offset="1" stopColor={BZ.dark} /></radialGradient></defs>
	<circle r={r} fill={`url(#rd${id})`} stroke={BZ.line} strokeWidth={1.2} />
	{Array.from({length: 11}, (_, i) => <circle key={i} r={r * (0.22 + 0.73 * (i + 0.5) / 11)} fill="none" stroke={i % 2 ? BZ.hi : BZ.deep} strokeWidth={Math.max(0.8, r * 0.028)} strokeOpacity={i % 2 ? 0.55 : 0.75} />)}
	<circle r={r * 0.2} fill={BZ.mid} stroke={BZ.deep} strokeWidth={1} />
</g>;

/** a soft-edged blob (rust spot / clod), radius r, seeded */
export const blob = (cx: number, cy: number, r: number, seed: number, n = 9, rough = 0.35) => { const pts: [number, number][] = [];
	for (let i = 0; i < n; i++) { const a = (i / n) * 2 * Math.PI, rr = r * (1 - rough / 2 + rough * rnd(seed * 31 + i, 5)); pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
	let d = ''; for (let i = 0; i < n; i++) { const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
		const m0 = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], m1 = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
		d += (i === 0 ? `M${f1(m0[0])},${f1(m0[1])}` : '') + `Q${f1(p1[0])},${f1(p1[1])} ${f1(m1[0])},${f1(m1[1])}`; }
	return d + 'Z'; };

/** your kitchen knife (a Chinese cleaver: square blade, a hanging hole, a wooden handle with two rivets), lying flat.
    Local frame in cm: blade x 0..20 (heel → front), y 0..9.6 (spine → edge); handle x −12..0. rust 0..1 */
export const Knife: React.FC<{x: number; y: number; k: number; rot?: number; squash?: number; id: string; rust?: number}> = ({x, y, k, rot = 0, squash = 0.6, id, rust = 1}) => {
	const P = (a: number, b: number) => `${f1(a * k)},${f1(b * k)}`;
	const blade = `M${P(0, 0.2)}L${P(19.4, 0)}Q${P(20.2, 0)} ${P(20.2, 0.8)}L${P(20.4, 8.6)}Q${P(20.3, 9.7)} ${P(19.0, 9.8)}Q${P(9.5, 10.0)} ${P(0.4, 9.4)}Q${P(-0.3, 9.3)} ${P(-0.3, 8.6)}L${P(-0.3, 2.6)}Q${P(-0.6, 1.6)} ${P(-0.6, 0.9)}Z`;
	const bevel = `M${P(0, 8.0)}Q${P(9.5, 8.6)} ${P(20.32, 7.4)}L${P(20.4, 8.6)}Q${P(20.3, 9.7)} ${P(19.0, 9.8)}Q${P(9.5, 10.0)} ${P(0.4, 9.4)}Q${P(-0.3, 9.3)} ${P(-0.3, 8.6)}L${P(-0.3, 8.0)}Z`;
	const handle = `M${P(-0.6, 0.7)}L${P(-11.6, 0.9)}Q${P(-12.4, 1.0)} ${P(-12.4, 2.1)}L${P(-12.3, 3.3)}Q${P(-12.2, 4.2)} ${P(-11.4, 4.2)}L${P(-0.6, 3.6)}Z`;
	const spots: React.ReactNode[] = [];
	if (rust > 0) {
		const along = [[2.2, 1.0, 1.0], [4.1, 0.8, 0.7], [6.6, 1.4, 1.2], [9.4, 0.9, 0.6], [11.5, 1.6, 0.9], [14.8, 1.0, 0.8], [17.2, 1.8, 1.0], [18.6, 3.6, 0.7], [1.2, 3.8, 0.8], [3.0, 6.0, 0.6], [8.0, 4.6, 0.45], [12.6, 6.2, 0.5], [16.0, 8.6, 0.55], [6.0, 8.9, 0.45], [10.6, 9.2, 0.4]];
		along.forEach(([a, b, r], i) => { spots.push(<path key={`r${i}`} d={blob(a * k, b * k, r * k, i + 3, 10, 0.5)} fill={i % 3 === 0 ? '#5A321C' : '#74462A'} opacity={0.88 * rust} />);
			spots.push(<path key={`h${i}`} d={blob(a * k + 0.15 * k, b * k - 0.1 * k, r * 0.55 * k, i + 40, 8, 0.6)} fill="#94603A" opacity={0.55 * rust} />); });
		for (let i = 0; i < 60; i++) { const a = 0.4 + 19.4 * rnd(i, 21), b = 0.3 + 9 * Math.pow(rnd(i, 22), 1.6); spots.push(<circle key={`p${i}`} cx={a * k} cy={b * k} r={(0.07 + 0.12 * rnd(i, 23)) * k} fill="#5E3620" opacity={0.75 * rust} />); }
		spots.push(<path key="run" d={`M${P(17.2, 2.6)}q${f1(0.3 * k)},${f1(1.6 * k)} ${f1(-0.1 * k)},${f1(3.2 * k)}`} stroke="#6A3E24" strokeWidth={0.32 * k} strokeLinecap="round" opacity={0.6 * rust} fill="none" />);
	}
	return <g transform={`translate(${x},${y}) rotate(${rot}) scale(1,${squash})`}>
		<defs>
			<linearGradient id={`st${id}`} x1="0" y1="0" x2="0.25" y2="1"><stop offset="0" stopColor="#6C6E6E" /><stop offset="0.45" stopColor="#585B5C" /><stop offset="0.8" stopColor="#4A4D4F" /><stop offset="1" stopColor="#3C3F41" /></linearGradient>
			<linearGradient id={`wd${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4A3022" /><stop offset="0.5" stopColor="#36221A" /><stop offset="1" stopColor="#24160F" /></linearGradient>
			<clipPath id={`kc${id}`}><path d={blade} /></clipPath>
		</defs>
		<path d={blade} transform={`translate(${0.5 * k},${0.9 * k})`} fill="#000" opacity={0.45} />
		<path d={handle} transform={`translate(${0.5 * k},${0.9 * k})`} fill="#000" opacity={0.45} />
		<path d={blade} fill={`url(#st${id})`} />
		<path d={bevel} fill="#8C8F8E" opacity={0.55} />
		<path d={`M${P(0, 8.0)}Q${P(9.5, 8.6)} ${P(20.32, 7.4)}`} stroke="#A8AAA8" strokeWidth={0.08 * k} strokeOpacity={0.6} fill="none" />
		<g clipPath={`url(#kc${id})`}>{spots}</g>
		<circle cx={17.4 * k} cy={1.9 * k} r={0.8 * k} fill="#0E0A08" stroke="#3A3C3D" strokeWidth={0.1 * k} />
		<path d={`M${P(0.2, 0.32)}L${P(19.4, 0.12)}`} stroke="#8A8C8B" strokeWidth={0.12 * k} strokeOpacity={0.55} />
		<path d={handle} fill={`url(#wd${id})`} stroke="#140C08" strokeWidth={0.08 * k} />
		<path d={`M${P(-1.2, 1.4)}L${P(-11.2, 1.5)}`} stroke="#5A3C2A" strokeWidth={0.1 * k} strokeOpacity={0.6} />
		{[-3.2, -8.6].map((a, i) => <circle key={i} cx={a * k} cy={2.35 * k} r={0.42 * k} fill="#77797A" stroke="#2E3031" strokeWidth={0.08 * k} />)}
		<rect x={-1.4 * k} y={0.66 * k} width={1.0 * k} height={3.0 * k} fill="#4E5152" />
		{/* water beads on the blade (why it rusts) */}
		{[[5.2, 5.4, 0.36], [7.0, 6.6, 0.24], [13.4, 4.2, 0.3], [15.0, 6.9, 0.2]].map(([a, b, r], i) => <g key={`w${i}`}><ellipse cx={a * k} cy={b * k} rx={r * k} ry={r * k * 0.9} fill="#7E8486" opacity={0.6} /><circle cx={(a - r * 0.3) * k} cy={(b - r * 0.3) * k} r={r * 0.28 * k} fill="#D8DCDC" opacity={0.8} /></g>)}
	</g>;
};
