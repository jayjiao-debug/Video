import React from 'react';
import {V, M, T, R, chain, ap, mx, sp, poly, Pt, PAL, Role, lerp} from './geo60';

/* ep60 props in the tomb-painting style (same ink/fill conventions as the rig): the balance of the Weighing of the Heart,
   Osiris's shrine and throne, Ammit's mat, decorative hieroglyph columns (generic signs, no sentences). Units: grid squares. */
type C = {OW: number; LW: number};
const ctx = (s: number): C => ({OW: 2.7 / s, LW: 1.5 / s});
const Solid: React.FC<{d: string; r: Role | string; c: C; m?: M; k?: number}> = ({d, r, c, m, k = 1}) => <g transform={m && mx(m)}>
	<path d={d} fill={PAL.ink} stroke={PAL.ink} strokeWidth={2 * c.OW * k} strokeLinejoin="round" /><path d={d} fill={(PAL as Record<string, string>)[r] ?? r} /></g>;
const rect = (x0: number, y0: number, x1: number, y1: number) => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);

/* ---------------- the Ma'at feather (ostrich plume, tip curled back) ---------------- */
export const featherD = (h = 3.2) => { const k = h / 3.2;
	return sp(([[0, 0, 1], [0.3, -0.5], [0.34, -1.6], [0.22, -2.5], [0.0, -3.0], [-0.42, -3.22], [-0.7, -2.98], [-0.42, -2.82], [-0.22, -2.4], [-0.24, -1.4], [-0.2, -0.4], [-0.16, 0, 1]] as Pt[]).map((p) => [p[0] * k, p[1] * k, p[2] ?? 0] as Pt).map((p) => (p[2] ? p : [p[0], p[1]] as Pt)), true, 0.18); };
export const Feather: React.FC<{c: C; h?: number}> = ({c, h = 3.2}) => <g>
	<Solid d={featherD(h)} r="linen" c={c} />
	<path d={sp([[0.02, -0.1], [0.06, -1.4], [0.0, -2.5], [-0.25, -2.95]], false)} fill="none" stroke={PAL.line} strokeWidth={c.LW} />
	{[0.5, 1.0, 1.5, 2.0].map((y) => <path key={y} d={`M0.05 ${-y}L0.28 ${-y + 0.28}`} stroke={PAL.line} strokeWidth={c.LW * 0.8} opacity={0.6} />)}
	<path d={sp([[-0.2, -0.05], [0.28, -0.05], [0.3, -0.45], [-0.18, -0.45]])} fill={PAL.blue} opacity={0.9} />
</g>;

/* ---------------- the heart (ib jar) ---------------- */
export const heartD = sp([[-0.42, 0, 1], [0.42, 0, 1], [0.7, -0.35], [0.78, -0.95], [0.6, -1.32], [0.4, -1.42], [0.48, -1.62], [0.32, -1.78], [0.18, -1.6], [-0.18, -1.6], [-0.32, -1.78], [-0.48, -1.62], [-0.4, -1.42], [-0.6, -1.32], [-0.78, -0.95], [-0.7, -0.35]], true, 0.16);
export const Heart: React.FC<{c: C}> = ({c}) => <g>
	<Solid d={heartD} r="red" c={c} />
	<path d="M-0.38 -1.42Q0 -1.32 0.38 -1.42" fill="none" stroke={PAL.gold} strokeWidth={c.LW * 2.2} />
	<path d="M-0.5 -0.45Q0 -0.3 0.5 -0.45" fill="none" stroke={PAL.red2} strokeWidth={c.LW * 1.6} />
	<path d="M-0.55 -1.1Q-0.6 -0.7 -0.4 -0.35" fill="none" stroke="#E0705A" strokeWidth={c.LW * 1.6} />
</g>;

/* ---------------- the baboon of Thoth (squatting, with lunar disc), facing +x, seat at 0 ---------------- */
export const Baboon: React.FC<{c: C; t?: number; look?: number}> = ({c, look = 0}) => {
	const legs = sp([[-1.05, 0, 1], [1.45, 0, 1], [1.7, -0.45], [1.55, -1.25], [0.85, -1.6], [-0.2, -1.45], [-1.05, -0.95]]);
	const cape = sp([[-1.15, -0.35], [-1.55, -1.55], [-1.42, -2.85], [-0.75, -3.75], [0.2, -4.0], [0.85, -3.55], [1.05, -2.6], [0.85, -1.75], [0.15, -1.3], [-0.55, -0.7]]);
	const face = sp([[0.3, -3.5], [0.9, -3.62], [1.5, -3.42], [2.2, -3.18, 1], [2.32, -2.92], [2.22, -2.6, 1], [1.55, -2.5], [0.95, -2.46], [0.5, -2.7]], true, 0.16);
	const arm = sp([[0.15, -2.35], [0.75, -2.45], [1.55, -1.35], [1.75, -1.1], [1.35, -0.95], [0.3, -1.65]]);
	const tail = sp([[-0.95, -0.2], [-0.72, -0.1], [-0.95, 1.2], [-0.82, 2.1], [-1.12, 2.15], [-1.25, 1.2]]);
	return <g>
		<Solid d={tail} r="baboon2" c={c} />
		<Solid d={legs} r="baboon2" c={c} />
		<Solid d={cape} r="baboon" c={c} />
		{[-1.15, -0.8, -0.45, -0.1, 0.25].map((x, i) => <path key={x} d={`M${x + 0.35} ${-3.55 + i * 0.05}Q${x - 0.25} -2.3 ${x - 0.05} -0.85`} fill="none" stroke={PAL.baboon2} strokeWidth={c.LW * 1.3} />)}
		<g transform={`rotate(${look} 0.6 -3.0)`}>
			<Solid d={face} r="baboon2" c={c} />
			<path d="M0.7 -3.4Q1.1 -3.62 1.55 -3.36" fill="none" stroke={PAL.baboon} strokeWidth={c.LW * 2.4} />
			<path d="M2.24 -3.0Q2.3 -2.8 2.2 -2.66" fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.2} /><ellipse cx={2.2} cy={-2.98} rx={0.07} ry={0.05} fill={PAL.ink} />
			<path d="M2.2 -2.7L1.5 -2.66" stroke={PAL.ink} strokeWidth={c.LW} />
			<ellipse cx={0.88} cy={-3.15} rx={0.17} ry={0.11} fill={PAL.eye} stroke={PAL.ink} strokeWidth={c.LW * 0.8} /><circle cx={0.92} cy={-3.15} r={0.07} fill={PAL.ink} />
			<path d={sp([[-0.25, -4.15], [0.35, -3.82], [1.05, -3.92], [1.45, -4.42, 1], [0.95, -4.12], [0.38, -4.05], [-0.05, -4.32, 1]], true, 0.2)} fill={PAL.linen} stroke={PAL.ink} strokeWidth={c.LW} />
			<circle cx={0.58} cy={-4.82} r={0.64} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.OW * 1.2} />
		</g>
		<Solid d={arm} r="baboon2" c={c} />
	</g>;
};

/* ---------------- the balance ----------------
   origin: ground under the upright; tilt (deg, + = heart pan down), swing (pan pendulum, deg), plumb (bob swing, deg). */
export type BalancePose = {tilt: number; swingL?: number; swingR?: number; plumb?: number; look?: number};
export const BAL = {beamY: -19.0, half: 8.6, cord: 5.6, postTop: -20.6, plumbY: -18.55, plumbX: 0.78, plumbL: 4.6};
export const balanceGeo = (p: BalancePose) => {
	const beam = chain(T(0, BAL.beamY), R(-p.tilt));
	const eL = ap(beam, [-BAL.half, 0]), eR = ap(beam, [BAL.half, 0]);
	const panL = chain(T(eL[0], eL[1]), R(p.swingL ?? 0), T(0, BAL.cord)), panR = chain(T(eR[0], eR[1]), R(p.swingR ?? 0), T(0, BAL.cord));
	const pb = (p.plumb ?? 0) * Math.PI / 180, bob: V = [BAL.plumbX + Math.sin(pb) * BAL.plumbL, BAL.plumbY + Math.cos(pb) * BAL.plumbL];
	return {beam, eL, eR, panL, panR, bob};
};
export const Balance: React.FC<{p: BalancePose; x: number; y: number; s: number; t?: number; front?: boolean}> = ({p, x, y, s, t = 0}) => {
	const c = ctx(s), g = balanceGeo(p);
	const post = poly([[-0.36, -1.75], [0.36, -1.75], [0.3, BAL.postTop + 0.6], [-0.3, BAL.postTop + 0.6]]);
	const capital = sp([[-0.3, BAL.postTop + 0.62, 1], [0.3, BAL.postTop + 0.62, 1], [0.95, BAL.postTop + 0.05], [1.05, BAL.postTop - 0.1, 1], [-1.05, BAL.postTop - 0.1, 1], [-0.95, BAL.postTop + 0.05]]);
	const abacus = rect(-1.3, BAL.postTop - 0.45, 1.3, BAL.postTop - 0.1);
	const beamD = sp([[-BAL.half - 0.2, -0.24, 1], [BAL.half + 0.2, -0.24, 1], [BAL.half + 0.2, 0.24, 1], [-BAL.half - 0.2, 0.24, 1]]);
	const bud = (sg: number) => sp([[sg * (BAL.half + 0.15), -0.32], [sg * (BAL.half + 0.65), -0.42], [sg * (BAL.half + 0.98), 0], [sg * (BAL.half + 0.65), 0.42], [sg * (BAL.half + 0.15), 0.32]]);
	const panD = sp([[-2.05, 0, 1], [2.05, 0, 1], [1.6, 0.5], [0.7, 0.74], [-0.7, 0.74], [-1.6, 0.5]], true, 0.2);
	const cords = (pm: M, e: V, k: string) => <g key={k}>{[-1.85, -0.6, 0.6, 1.85].map((u) => { const q = ap(pm, [u, 0]); return <line key={u} x1={e[0]} y1={e[1]} x2={q[0]} y2={q[1]} stroke={PAL.ink} strokeWidth={c.LW * 1.25} />; })}</g>;
	const bands = [-4.5, -8.5, -12.5, -16.5].map((yy) => <g key={yy}><rect x={-0.37} y={yy} width={0.74} height={0.55} fill={PAL.blue} stroke={PAL.ink} strokeWidth={c.LW * 0.8} /><rect x={-0.37} y={yy + 0.55} width={0.74} height={0.22} fill={PAL.red} stroke={PAL.ink} strokeWidth={c.LW * 0.8} /></g>);
	return <g transform={`translate(${x},${y}) scale(${s})`}>
		{/* plinth */}
		<Solid d={rect(-2.5, -0.9, 2.5, 0)} r="linen" c={c} /><Solid d={rect(-1.7, -1.75, 1.7, -0.9)} r="linen" c={c} />
		{[-2.0, -1.0, 0, 1.0].map((xx, i) => <rect key={xx} x={xx + 0.08} y={-0.72} width={0.84} height={0.55} fill={[PAL.blue, PAL.red, PAL.green, PAL.blue][i]} stroke={PAL.ink} strokeWidth={c.LW * 0.8} />)}
		<rect x={-1.5} y={-1.5} width={3.0} height={0.22} fill={PAL.red} />
		{/* upright, capital, abacus, the baboon on top */}
		<Solid d={post} r="gold" c={c} />{bands}
		<Solid d={capital} r="green" c={c} />{[-0.6, -0.2, 0.2, 0.6].map((xx) => <line key={xx} x1={xx * 0.4} y1={BAL.postTop + 0.6} x2={xx * 1.5} y2={BAL.postTop - 0.05} stroke={PAL.ink} strokeWidth={c.LW * 0.8} />)}
		<Solid d={abacus} r="gold" c={c} />
		<g transform={`translate(0.15,${BAL.postTop - 0.45}) scale(-1,1)`}><Baboon c={c} t={t} look={p.look ?? 0} /></g>
		{/* plumb: bracket, cord and bob (hangs in front of the upright) */}
		<path d={rect(0, BAL.plumbY - 0.12, BAL.plumbX + 0.12, BAL.plumbY + 0.12)} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW} />
		<line x1={BAL.plumbX} y1={BAL.plumbY} x2={g.bob[0]} y2={g.bob[1]} stroke={PAL.ink} strokeWidth={c.LW * 1.2} />
		<g transform={`translate(${g.bob[0]},${g.bob[1]}) rotate(${-(p.plumb ?? 0)})`}><Solid d={sp([[0, -0.1], [0.32, 0.22], [0.36, 0.55], [0, 0.95, 1], [-0.36, 0.55], [-0.32, 0.22]])} r="gold" c={c} /><circle cx={0} cy={0.45} r={0.12} fill={PAL.red} /></g>
		{/* pans with the heart and the feather */}
		{cords(g.panL, g.eL, 'cl')}{cords(g.panR, g.eR, 'cr')}
		<g transform={mx(g.panL)}><g transform="translate(0,0.02)"><Heart c={c} /></g><Solid d={panD} r="gold" c={c} /><path d="M-1.7 0.28Q0 0.5 1.7 0.28" fill="none" stroke={PAL.blue} strokeWidth={c.LW * 2.2} /></g>
		<g transform={mx(g.panR)}><g transform="translate(0.05,0.02)"><Feather c={c} h={3.0} /></g><Solid d={panD} r="gold" c={c} /><path d="M-1.7 0.28Q0 0.5 1.7 0.28" fill="none" stroke={PAL.blue} strokeWidth={c.LW * 2.2} /></g>
		{/* beam on its pivot, the tongue, and the feather-shaped peg */}
		<g transform={mx(g.beam)}>
			<Solid d={beamD} r="gold" c={c} />
			{[-1, 1].map((sg) => <g key={sg}><Solid d={bud(sg)} r="green" c={c} /><rect x={sg > 0 ? BAL.half - 1.2 : -BAL.half + 0.6} y={-0.24} width={0.6} height={0.48} fill={PAL.blue} /></g>)}
			{[-6.4, -4.6, -2.8, 2.8, 4.6, 6.4].map((xx) => <rect key={xx} x={xx - 0.12} y={-0.24} width={0.24} height={0.48} fill={PAL.red} />)}
			<Solid d={sp([[-0.12, 0.2, 1], [0.12, 0.2, 1], [0.05, 2.2], [0, 2.4, 1], [-0.05, 2.2]])} r="gold" c={c} />
		</g>
		<circle cx={0} cy={BAL.beamY} r={0.32} fill={PAL.red} stroke={PAL.ink} strokeWidth={c.LW * 1.2} />
		<g transform={`translate(0,${BAL.beamY - 0.3})`}><Feather c={c} h={1.6} /></g>
	</g>;
};

/* ---------------- Ammit's mat ---------------- */
export const Mat: React.FC<{x0: number; x1: number; y: number; s: number}> = ({x0, x1, y, s}) => {
	const c = ctx(s), h = 0.55, n = Math.round((x1 - x0) / s / 0.42);
	return <g>
		<path d={poly([[x0, y - h * s], [x1, y - h * s], [x1, y], [x0, y]])} fill={PAL.mat} stroke={PAL.ink} strokeWidth={c.OW * 2 * s * 0.5} />
		{Array.from({length: n}, (_, i) => <line key={i} x1={x0 + ((i + 0.5) * (x1 - x0)) / n} x2={x0 + ((i + 0.5) * (x1 - x0)) / n} y1={y - h * s + 2} y2={y - 2} stroke={PAL.mat2} strokeWidth={1.4} />)}
		<line x1={x0} x2={x1} y1={y - h * s * 0.5} y2={y - h * s * 0.5} stroke={PAL.red} strokeWidth={3} />
	</g>;
};

/* ---------------- Osiris's shrine (kiosk) and throne, opening to -x ----------------
   origin: ground at the front column; W = depth (units). Draw `back` before Osiris and `front` after him. */
export const SHRINE = {plinth: 1.0, colTop: -22.9, W: 11.6};
const column = (x: number, c: C) => {
	const top = SHRINE.colTop, shaft = poly([[x - 0.26, -SHRINE.plinth], [x + 0.26, -SHRINE.plinth], [x + 0.2, top + 1.6], [x - 0.2, top + 1.6]]);
	const capital = sp([[x - 0.2, top + 1.62, 1], [x + 0.2, top + 1.62, 1], [x + 0.75, top + 0.9], [x + 0.95, top + 0.2], [x + 0.75, top, 1], [x - 0.75, top, 1], [x - 0.95, top + 0.2], [x - 0.75, top + 0.9]]);
	return <g>
		<Solid d={shaft} r="gold" c={c} />
		{[0.18, 0.36, 0.54, 0.72, 0.9].map((u) => { const yy = lerp(-SHRINE.plinth, top + 1.6, u); return <g key={u}><rect x={x - 0.26} y={yy - 0.2} width={0.52} height={0.16} fill={PAL.blue} /><rect x={x - 0.26} y={yy} width={0.52} height={0.1} fill={PAL.red} /></g>; })}
		<Solid d={capital} r="green" c={c} />
		{[-0.5, -0.2, 0.2, 0.5].map((dx) => <line key={dx} x1={x + dx * 0.3} y1={top + 1.5} x2={x + dx * 1.5} y2={top + 0.15} stroke={PAL.ink} strokeWidth={c.LW * 0.8} />)}
		<rect x={x - 0.78} y={top + 0.05} width={1.56} height={0.2} fill={PAL.blue} />
	</g>;
};
export const ShrineBack: React.FC<{x: number; y: number; s: number; face?: 1 | -1}> = ({x, y, s, face = 1}) => {
	const c = ctx(s), W = SHRINE.W;
	return <g transform={`translate(${x},${y}) scale(${s * face},${s})`}>
		{/* inner wall: a painted panel of feather pattern behind the throne */}
		<path d={rect(0.4, SHRINE.colTop + 0.3, W - 0.4, -SHRINE.plinth)} fill="#EFE0BC" stroke={PAL.ink} strokeWidth={c.LW} />
		{Array.from({length: 13}, (_, i) => <g key={i}>{Array.from({length: 22}, (_, j) => <path key={j} d={`M${0.7 + i * 0.85} ${SHRINE.colTop + 1.2 + j * 1.05}q0.42 0.75 0.85 0`} fill="none" stroke={[PAL.green, PAL.blue, PAL.red][(i + j) % 3]} strokeWidth={c.LW * 1.1} opacity={0.32} />)}</g>)}
		{column(W, c)}
	</g>;
};
export const Throne: React.FC<{x: number; y: number; s: number; face?: 1 | -1}> = ({x, y, s, face = 1}) => {
	/* block throne with a low back, on the Ma'at plinth; origin = front-bottom corner of the seat block (on the plinth) */
	const c = ctx(s), seat = rect(0, -5.0, 5.2, 0), back = sp([[4.4, -5.0, 1], [5.2, -5.0, 1], [5.2, -8.2, 1], [4.7, -8.1, 1]]);
	return <g transform={`translate(${x},${y}) scale(${s * face},${s})`}>
		<Solid d={back} r="red" c={c} />
		<Solid d={seat} r="blue" c={c} />
		{/* feather pattern side panel framed in gold */}
		<path d={rect(0.45, -4.55, 4.75, -0.45)} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW} />
		{Array.from({length: 5}, (_, i) => <g key={i}>{Array.from({length: 5}, (_, j) => <path key={j} d={`M${0.7 + j * 0.8} ${-4.25 + i * 0.78}l0.4 0.5l0.4 -0.5z`} fill={[PAL.blue, PAL.red, PAL.green][(i + j) % 3]} stroke={PAL.ink} strokeWidth={c.LW * 0.6} />)}</g>)}
		<path d={rect(-0.1, -5.25, 5.3, -4.95)} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW} />
		{/* cushion */}
		<path d={sp([[0.0, -5.25, 1], [4.6, -5.25, 1], [4.7, -5.6], [0.2, -5.62]])} fill={PAL.red} stroke={PAL.ink} strokeWidth={c.LW} />
	</g>;
};
export const ShrineFront: React.FC<{x: number; y: number; s: number; face?: 1 | -1; t?: number}> = ({x, y, s, face = 1}) => {
	const c = ctx(s), W = SHRINE.W, top = SHRINE.colTop;
	const plinth = sp([[-1.2, 0, 1], [W + 0.6, 0, 1], [W + 0.6, -SHRINE.plinth, 1], [-0.2, -SHRINE.plinth, 1]]);
	const cornice = sp([[-0.9, top - 0.65, 1], [W + 0.9, top - 0.65, 1], [W + 1.5, top - 2.0, 1], [-1.5, top - 2.0, 1]]);
	const uraei = Array.from({length: 9}, (_, i) => { const ux = -0.8 + i * ((W + 1.6) / 8);
		return <g key={i} transform={`translate(${ux},${top - 2.0})`}>
			<path d={sp([[-0.3, 0, 1], [0.3, 0, 1], [0.32, -0.6], [0.2, -1.05], [0.36, -1.35], [0.15, -1.55], [-0.12, -1.35], [-0.25, -0.9], [-0.35, -0.5]])} fill={PAL.ink} stroke={PAL.ink} strokeWidth={c.OW * 2} />
			<path d={sp([[-0.3, 0, 1], [0.3, 0, 1], [0.32, -0.6], [0.2, -1.05], [0.36, -1.35], [0.15, -1.55], [-0.12, -1.35], [-0.25, -0.9], [-0.35, -0.5]])} fill={PAL.gold} />
			<path d="M-0.1 -0.2L-0.1 -0.95" stroke={PAL.blue} strokeWidth={c.LW * 2} />
			<circle cx={0.05} cy={-1.9} r={0.3} fill={PAL.red} stroke={PAL.ink} strokeWidth={c.LW} />
		</g>; });
	return <g transform={`translate(${x},${y}) scale(${s * face},${s})`}>
		<Solid d={plinth} r="linen" c={c} />
		<path d={`M-0.9 ${-SHRINE.plinth * 0.5}L${W + 0.6} ${-SHRINE.plinth * 0.5}`} stroke={PAL.ink} strokeWidth={c.LW} />
		{Array.from({length: 12}, (_, i) => <rect key={i} x={-0.4 + i * ((W + 0.6) / 12)} y={-SHRINE.plinth * 0.45} width={(W + 0.6) / 12 - 0.15} height={SHRINE.plinth * 0.35} fill={[PAL.blue, PAL.red, PAL.green][i % 3]} />)}
		{column(0, c)}
		{/* architrave + cavetto cornice with leaf stripes + the uraeus frieze */}
		<Solid d={rect(-0.9, top - 0.65, W + 0.9, top + 0.05)} r="gold" c={c} />
		<Solid d={cornice} r="linen" c={c} />
		{Array.from({length: 22}, (_, i) => { const u = (i + 0.5) / 22, x0 = lerp(-0.9, W + 0.9, u), x1 = lerp(-1.5, W + 1.5, u);
			return <path key={i} d={poly([[x0 - 0.18, top - 0.68], [x0 + 0.18, top - 0.68], [x1 + 0.22, top - 1.98], [x1 - 0.22, top - 1.98]])} fill={[PAL.blue, PAL.red, PAL.green][i % 3]} stroke={PAL.ink} strokeWidth={c.LW * 0.6} />; })}
		<rect x={-0.9} y={top - 0.78} width={W + 1.8} height={0.16} fill={PAL.ink} />
		{uraei}
		<path d={rect(-0.9, top - 0.45, W + 0.9, top - 0.15)} fill={PAL.blue} />
	</g>;
};

/* ---------------- hieroglyphs: generic decorative signs (no text) in a 1 × 1 cell, centred at 0.5 ---------------- */
const G: Record<string, {d: string; r: Role}> = {
	reed: {d: sp([[0.45, 0.95, 1], [0.58, 0.95, 1], [0.6, 0.5], [0.72, 0.18], [0.62, 0.04], [0.45, 0.3], [0.42, 0.6]]), r: 'green'},
	water: {d: 'M0.05 0.55L0.18 0.42L0.3 0.55L0.42 0.42L0.55 0.55L0.68 0.42L0.8 0.55L0.95 0.42L0.95 0.52L0.8 0.65L0.68 0.52L0.55 0.65L0.42 0.52L0.3 0.65L0.18 0.52L0.05 0.65Z', r: 'blue'},
	loaf: {d: sp([[0.2, 0.75, 1], [0.8, 0.75, 1], [0.72, 0.5], [0.5, 0.4], [0.28, 0.5]]), r: 'gold'},
	mouth: {d: sp([[0.1, 0.5], [0.5, 0.36], [0.9, 0.5], [0.5, 0.64]], true, 0.22), r: 'red'},
	disc: {d: sp([[0.5, 0.22], [0.78, 0.5], [0.5, 0.78], [0.22, 0.5]], true, 0.27), r: 'red'},
	bolt: {d: poly([[0.2, 0.62], [0.8, 0.62], [0.8, 0.38], [0.2, 0.38]]), r: 'blue'},
	ankh: {d: 'M0.44 0.95L0.56 0.95L0.56 0.52L0.75 0.52L0.75 0.42L0.56 0.42Q0.72 0.3 0.64 0.15Q0.5 0.0 0.36 0.15Q0.28 0.3 0.44 0.42L0.25 0.42L0.25 0.52L0.44 0.52Z', r: 'gold'},
	djed: {d: 'M0.4 0.95L0.6 0.95L0.6 0.4L0.75 0.4L0.75 0.33L0.6 0.33L0.6 0.27L0.75 0.27L0.75 0.2L0.6 0.2L0.6 0.12L0.75 0.12L0.75 0.05L0.25 0.05L0.25 0.12L0.4 0.12L0.4 0.2L0.25 0.2L0.25 0.27L0.4 0.27L0.4 0.33L0.25 0.33L0.25 0.4L0.4 0.4Z', r: 'blue'},
	bird: {d: sp([[0.2, 0.75, 1], [0.32, 0.5], [0.52, 0.32], [0.62, 0.15], [0.78, 0.18], [0.85, 0.24, 1], [0.72, 0.3], [0.72, 0.5], [0.85, 0.72, 1], [0.6, 0.72], [0.4, 0.8]]), r: 'blue'},
	eye: {d: sp([[0.12, 0.5, 1], [0.35, 0.38], [0.65, 0.38], [0.88, 0.5, 1], [0.65, 0.6], [0.35, 0.6]]), r: 'linen'},
	basket: {d: sp([[0.12, 0.42, 1], [0.88, 0.42, 1], [0.75, 0.65], [0.5, 0.72], [0.25, 0.65]]), r: 'green'},
	viper: {d: 'M0.1 0.72L0.9 0.72L0.9 0.64L0.75 0.64Q0.72 0.45 0.6 0.55Q0.5 0.62 0.4 0.55Q0.3 0.42 0.2 0.5L0.1 0.5Z', r: 'gold'},
	cloth: {d: poly([[0.35, 0.9], [0.6, 0.9], [0.6, 0.35], [0.7, 0.18], [0.45, 0.1], [0.35, 0.25]]), r: 'red'},
	house: {d: 'M0.15 0.75L0.15 0.3L0.85 0.3L0.85 0.75L0.6 0.75L0.6 0.65L0.75 0.65L0.75 0.4L0.25 0.4L0.25 0.75Z', r: 'blue'},
	arm: {d: sp([[0.08, 0.6, 1], [0.5, 0.56], [0.7, 0.48], [0.9, 0.42, 1], [0.92, 0.52], [0.72, 0.6], [0.5, 0.66], [0.08, 0.68, 1]]), r: 'red'},
	feather: {d: sp([[0.48, 0.95, 1], [0.56, 0.95, 1], [0.6, 0.5], [0.55, 0.15], [0.4, 0.06], [0.35, 0.14], [0.45, 0.3], [0.44, 0.6]]), r: 'linen'},
};
export const GLYPHS = Object.keys(G);
/** columns of decorative glyphs between ruled lines; `seed` picks the signs */
export const GlyphColumns: React.FC<{x: number; y: number; cols: number; rows: number; cell: number; seed?: number}> = ({x, y, cols, rows, cell, seed = 1}) => {
	let r = seed * 9301 + 49297; const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
	const out: React.ReactNode[] = [], lw = 1.3 / cell;
	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			const k = GLYPHS[Math.floor(rnd() * GLYPHS.length)], g = G[k];
			out.push(<g key={`${i}-${j}`} transform={`translate(${i * 1.25 + 0.12},${j * 1.08})`}><path d={g.d} fill={PAL[g.r]} stroke={PAL.ink} strokeWidth={lw * 1.4} strokeLinejoin="round" /></g>);
		}
		out.push(<line key={`l${i}`} x1={i * 1.25 - 0.05} x2={i * 1.25 - 0.05} y1={-0.1} y2={rows * 1.08} stroke={PAL.ink} strokeWidth={lw * 1.2} />);
	}
	out.push(<line key="lend" x1={cols * 1.25 - 0.05} x2={cols * 1.25 - 0.05} y1={-0.1} y2={rows * 1.08} stroke={PAL.ink} strokeWidth={lw * 1.2} />);
	return <g transform={`translate(${x},${y}) scale(${cell})`}>{out}</g>;
};
export {ctx};

/* ---------------- the winged sun disc (Behdety): disc, two uraei, long feathered wings ---------------- */
export const WingedSun: React.FC<{x: number; y: number; s: number; span?: number; t?: number}> = ({x, y, s, span = 7, t = 0}) => {
	const c = ctx(s), rows: [number, number, Role][] = [[0.0, 0.62, 'red'], [0.62, 1.25, 'blue'], [1.25, 2.0, 'green']];
	const wing = (sg: number) => <g key={sg} transform={`scale(${sg},1)`}>
		{rows.slice().reverse().map(([a, b, col], ri) => { const n = Math.round(span * (ri === 0 ? 1.6 : 2.2)), out: React.ReactNode[] = [];
			for (let i = 0; i < n; i++) { const u0 = 1.0 + (i / n) * span, u1 = 1.0 + ((i + 1) / n) * span, droop = (u: number) => -0.35 + 0.42 * Math.pow((u - 1) / span, 1.6) + 0.06 * Math.sin(t * 1.7 + i * 0.4);
				const lenK = 1 - 0.25 * ((u0 - 1) / span);
				out.push(<path key={i} d={poly([[u0, droop(u0) + a * lenK], [u1, droop(u1) + a * lenK], [u1 + 0.1, droop(u1) + b * lenK], [u0 + 0.1, droop(u0) + b * lenK]])} fill={PAL[col]} stroke={PAL.ink} strokeWidth={c.LW} />); }
			return <g key={col}>{out}</g>; })}
		<path d={`M1.0 -0.4L${1 + span} ${0.07}`} stroke={PAL.ink} strokeWidth={c.LW * 2} />
	</g>;
	const uraeus = (sg: number) => <g transform={`translate(${sg * 0.95},0.15) scale(${sg},1)`}><Solid d={sp([[-0.2, 0.9, 1], [0.2, 0.9, 1], [0.25, 0.1], [0.12, -0.45], [0.35, -0.8], [0.12, -1.0], [-0.12, -0.75], [-0.22, -0.2]])} r="gold" c={c} /></g>;
	return <g transform={`translate(${x},${y}) scale(${s})`}>
		{wing(1)}{wing(-1)}
		{uraeus(1)}{uraeus(-1)}
		<circle cx={0} cy={0} r={1.05} fill={PAL.ink} /><circle cx={0} cy={0} r={0.95} fill={PAL.red} /><circle cx={0} cy={0} r={0.7} fill="none" stroke={PAL.gold} strokeWidth={c.LW * 2} />
	</g>;
};
/* ---------------- a gateway (pylon door): jambs with glyph columns, cavetto cornice, winged sun on the lintel ---------------- */
export const Gateway: React.FC<{x0: number; x1: number; top: number; gy: number; s: number; t?: number}> = ({x0, x1, top, gy, s, t = 0}) => {
	const c = ctx(s), jw = 64, lint = 86;
	return <g>
		<rect x={x0 + jw} y={top + lint} width={x1 - x0 - 2 * jw} height={gy - top - lint} fill="#DCC497" />
		<rect x={x0 + jw} y={top + lint} width={x1 - x0 - 2 * jw} height={gy - top - lint} fill="url(#doorShade)" />
		{[x0, x1 - jw].map((jx) => <g key={jx}><rect x={jx} y={top + lint} width={jw} height={gy - top - lint} fill="#EFDFBA" stroke={PAL.ink} strokeWidth={2.4} />
			<rect x={jx + 6} y={top + lint + 6} width={jw - 12} height={gy - top - lint - 12} fill="none" stroke={PAL.red} strokeWidth={2} />
			<GlyphColumns x={jx + 12} y={top + lint + 22} cols={1} rows={Math.floor((gy - top - lint - 40) / 38)} cell={34} seed={Math.round(jx)} /></g>)}
		<path d={poly([[x0 - 14, top + lint], [x1 + 14, top + lint], [x1 + 14, top + 40], [x0 - 14, top + 40]])} fill="#EFDFBA" stroke={PAL.ink} strokeWidth={2.4} />
		<path d={poly([[x0 - 14, top + 40], [x1 + 14, top + 40], [x1 + 34, top], [x0 - 34, top]])} fill={PAL.linen} stroke={PAL.ink} strokeWidth={2.4} />
		{Array.from({length: 26}, (_, i) => { const u = (i + 0.5) / 26, a = x0 - 14 + u * (x1 - x0 + 28), b = x0 - 34 + u * (x1 - x0 + 68);
			return <path key={i} d={poly([[a - 4, top + 38], [a + 4, top + 38], [b + 5, top + 2], [b - 5, top + 2]])} fill={[PAL.blue, PAL.red, PAL.green][i % 3]} stroke={PAL.ink} strokeWidth={1} />; })}
		<WingedSun x={(x0 + x1) / 2} y={top + lint - 22} s={s * 0.95} span={(x1 - x0) / (s * 0.95) / 2 - 1.6} t={t} />
	</g>;
};
