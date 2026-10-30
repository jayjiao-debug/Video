import React from 'react';
import {cl} from '../qq50/kit50';
import {GripFlat53E} from './hiltflat53e';
import {A, LBLADE, hwS, edgeS, LAT, latCells, cellQuad, GUARD_OUT, inlayPanel, inlayCells, POM_PROF, R_GRIP, R_HOOP, HOOPS, HOOP_HL, markAt, markSeed, birdScript, MARK_K, METAL} from './swordspec53s';
/* ep53 · the sword's FRONT face drawn through any (a, w) → screen map (cm, as the callers use): props53.Sword (a plain rotation
   and scale) and blade53c.BladeFlat (the chamber, the paper test, any camera) both draw this, so the flat views are one sword.
   Geometry, lattice and inscription come from swordspec53s. Paint order is front-to-back correct for a face-on view: blade,
   lattice, edge strips, ridge, marks; then the grip, its two hoops and the pommel; the guard last (it covers the blade base and
   the grip's end). */
export type Map2 = (a: number, w: number) => [number, number];
const f1 = (v: number) => v.toFixed(1);
const GLS = {hi: '#D8ECFF', lit: '#6AA8F0', body: '#2F6CC8', deep: '#163C84'};
export const SwordFlat: React.FC<{S: Map2; id: string; spec?: number; hilt?: boolean; marks?: boolean; lw?: number; edge?: string; markCol?: string}> = ({S, id, spec = 0.3, hilt = true, marks = true, lw = 1, edge, markCol = LAT.ink}) => {
	const M = (a: number, w: number) => S(a / 10, w / 10);                     // mm → the caller's cm map
	const P = (a: number, w: number) => { const q = M(a, w); return `${f1(q[0])},${f1(q[1])}`; };
	const km = (() => { const p = M(A.blade0 + 120, 0), q = M(A.blade0 + 130, 0); return Math.hypot(p[0] - q[0], p[1] - q[1]); })();   // px per cm
	const kmm = km / 10;
	const N = 96, ss = Array.from({length: N + 1}, (_, i) => LBLADE * i / N), a0 = A.blade0;
	const R = ss.map((s) => P(a0 + s, hwS(s))), L = ss.map((s) => P(a0 + s, -hwS(s)));
	const RI = ss.map((s) => P(a0 + s, Math.max(0, hwS(s) - edgeS(s)))), LI = ss.map((s) => P(a0 + s, -Math.max(0, hwS(s) - edgeS(s))));
	const outline = `M${R.join('L')}L${[...L].reverse().join('L')}Z`, inner = `M${RI.join('L')}L${[...LI].reverse().join('L')}Z`;
	const flankL = `M${LI.join('L')}L${P(A.L, 0)}L${P(a0, 0)}Z`, flankR = `M${RI.join('L')}L${P(A.L, 0)}L${P(a0, 0)}Z`;
	const stripL = `M${L.join('L')}L${[...LI].reverse().join('L')}Z`, stripR = `M${R.join('L')}L${[...RI].reverse().join('L')}Z`;
	const quad = (pts: [number, number][]) => 'M' + pts.map(([s, w]) => P(a0 + s, w)).join('L') + 'Z';
	/* the lattice; the inscription zone (s 12–76) keeps a calmer ground so the marks read */
	const cells = latCells().map((c) => { const ins = c.s > 12 && c.s < 76;
		return <g key={`${c.p}_${c.q}`}>
			{c.pale && <path d={quad(cellQuad(c, 0.9))} fill={LAT.paleHi} opacity={(ins ? 0.4 : 1) * LAT.paleOp} />}
			<path d={quad(cellQuad(c))} fill="none" stroke={LAT.ink} strokeWidth={Math.max(0.5, LAT.line * kmm * lw)} strokeOpacity={ins ? 0.35 : 0.85} strokeLinejoin="round" />
			{kmm > 0.9 && <path d={quad(cellQuad(c, LAT.inSc))} fill="none" stroke={LAT.ink} strokeWidth={Math.max(0.35, LAT.lineIn * kmm * lw)} strokeOpacity={ins ? 0.18 : 0.55} />}
			{!c.pale && !ins && <path d={quad(cellQuad(c, LAT.coreSc))} fill={LAT.ink} opacity={0.7} />}
		</g>; });
	const g0 = M(a0 + 200, -24), g1 = M(a0 + 200, 24), s0 = M(a0, 0), s1 = M(A.L, 0), h0 = M(40, -R_HOOP), h1 = M(40, R_HOOP);
	/* hilt */
	const grip = `M${P(A.grip0 - 0.5, -R_GRIP)}L${P(A.grip0 - 0.5, R_GRIP)}L${P(A.grip1 + 1, R_GRIP)}L${P(A.grip1 + 1, -R_GRIP)}Z`;
	const hoop = (a: number) => `M${P(a - HOOP_HL, -R_HOOP)}L${P(a - HOOP_HL, R_HOOP)}L${P(a + HOOP_HL, R_HOOP)}L${P(a + HOOP_HL, -R_HOOP)}Z`;
	const pom = 'M' + [...POM_PROF.map(([a, r]) => P(a, r)), ...POM_PROF.slice().reverse().map(([a, r]) => P(a, -r))].join('L') + 'Z';
	const poly = (pts: [number, number][], close = true) => 'M' + pts.map(([a, w]) => P(a, w)).join('L') + (close ? 'Z' : '');
	const sw = (v: number) => Math.max(0.6, v * kmm);
	return <g>
		<defs>
			<linearGradient id={`fbl${id}`} gradientUnits="userSpaceOnUse" x1={g0[0]} y1={g0[1]} x2={g1[0]} y2={g1[1]}><stop offset="0" stopColor="#B07A38" /><stop offset="0.28" stopColor="#E2B464" /><stop offset="0.49" stopColor="#D6A456" /><stop offset="0.53" stopColor="#A87436" /><stop offset="1" stopColor="#7A4E24" /></linearGradient>
			<linearGradient id={`fcy${id}`} gradientUnits="userSpaceOnUse" x1={h0[0]} y1={h0[1]} x2={h1[0]} y2={h1[1]}><stop offset="0" stopColor={METAL.deep} /><stop offset="0.28" stopColor={METAL.mid} /><stop offset="0.42" stopColor={METAL.lit} /><stop offset="0.7" stopColor={METAL.dark} /><stop offset="1" stopColor={METAL.deep} /></linearGradient>
			<linearGradient id={`fgl${id}`} gradientUnits="userSpaceOnUse" x1={h0[0]} y1={h0[1]} x2={h1[0]} y2={h1[1]}><stop offset="0" stopColor={GLS.lit} /><stop offset="0.55" stopColor={GLS.body} /><stop offset="1" stopColor={GLS.deep} /></linearGradient>
			<linearGradient id={`fsp${id}`} gradientUnits="userSpaceOnUse" x1={s0[0]} y1={s0[1]} x2={s1[0]} y2={s1[1]}><stop offset="0" stopColor="#FFF8E0" stopOpacity="0" /><stop offset="0.38" stopColor="#FFF8E0" stopOpacity={spec} /><stop offset="0.55" stopColor="#FFF8E0" stopOpacity={spec * 0.6} /><stop offset="0.8" stopColor="#FFF8E0" stopOpacity="0" /></linearGradient>
			<clipPath id={`fin${id}`}><path d={inner} /></clipPath>
		</defs>
		{/* blade */}
		<path d={outline} fill={`url(#fbl${id})`} />
		<g clipPath={`url(#fin${id})`}>{cells}</g>
		<path d={stripL} fill={METAL.hi} opacity={0.62} /><path d={stripR} fill={METAL.lit} opacity={0.42} />
		<path d={flankR} fill="#140902" opacity={0.3} />
		<path d={flankL} fill={`url(#fsp${id})`} />
		{marks && <MarksFlat M={M} col={markCol} kmm={kmm} />}
		{/* the raised ridge: a lit line on one flank, a shadow line on the other, ending before the point */}
		<path d={`M${P(a0 + 2, -0.5)}L${P(A.L - 12, -0.3)}`} stroke={METAL.hi} strokeWidth={sw(0.9)} strokeLinecap="round" />
		<path d={`M${P(a0 + 2, 0.8)}L${P(A.L - 12, 0.5)}`} stroke={METAL.deep} strokeWidth={sw(0.6)} strokeOpacity={0.7} strokeLinecap="round" />
		<path d={outline} fill="none" stroke={edge ?? METAL.line} strokeWidth={Math.max(1, 0.05 * km)} strokeOpacity={edge ? 0.9 : 0.6} />
		{hilt && <g>
			<GripFlat53E M={M} kmm={kmm} id={id} />{/* layered hoops + cord (fix-e); was the flat grip + outline hoops */}
			<path d={pom} fill={`url(#fcy${id})`} stroke={METAL.line} strokeOpacity={0.5} strokeWidth={sw(0.4)} />
			<path d={`M${P(0.5, -18.2)}L${P(0.5, 18.2)}`} stroke={METAL.hi} strokeWidth={sw(0.7)} strokeOpacity={0.7} />
			<path d={poly(GUARD_OUT)} fill={`url(#fcy${id})`} stroke={METAL.line} strokeOpacity={0.6} strokeWidth={sw(0.5)} />
			{[-1, 1].map((s) => <g key={s}>
				<path d={poly(inlayPanel(s))} fill={`url(#fgl${id})`} />
				{inlayCells(s).map((ln, k) => <path key={k} d={poly(ln, false)} stroke={METAL.mid} strokeWidth={sw(1.2)} fill="none" strokeLinejoin="miter" />)}
				<path d={`M${P(86.5, s * 19.5)}L${P(88.5, s * 18.3)}`} stroke={GLS.hi} strokeWidth={sw(0.6)} strokeOpacity={0.85} />
			</g>)}
			<path d={`M${P(A.guard0 + 0.6, -23)}L${P(A.guard0 + 0.6, 23)}`} stroke={METAL.hi} strokeWidth={sw(0.6)} strokeOpacity={0.6} />
		</g>}
	</g>;
};
/** the eight marks on a flat view (the same glyphs, places and orientation as blade53c.MarkSet) */
const MarksFlat: React.FC<{M: Map2; col: string; kmm: number}> = ({M, col, kmm}) => <g>
	{[1, -1].flatMap((side) => [0, 1, 2, 3].map((n) => { const [a, w] = markAt(side, n), c = M(a, w), Ap = M(a + 1, w), Wp = M(a, w + 1), g = birdScript(markSeed(side, n));
		const m = `matrix(${((Wp[0] - c[0]) * MARK_K).toFixed(3)} ${((Wp[1] - c[1]) * MARK_K).toFixed(3)} ${((Ap[0] - c[0]) * MARK_K).toFixed(3)} ${((Ap[1] - c[1]) * MARK_K).toFixed(3)} ${f1(c[0])} ${f1(c[1])})`;
		return <g key={`${side}${n}`} transform={m} opacity={cl(0.4 + kmm, 0, 0.85)}>{g.d.map((p, i) => <path key={i} d={p} fill="none" stroke={col} strokeWidth={0.085} strokeLinecap="round" strokeLinejoin="round" />)}
			<circle cx={g.eye[0]} cy={g.eye[1]} r={0.06} fill={col} /></g>; }))}</g>;

