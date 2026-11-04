import React from 'react';
import {God, CAST, Cast, POSES, SHAPES} from './rig60';
const MK = 1.18; // mummy mask scale (head units)
import {V, M, T, R, chain, ap, mx, sp, poly, Pt, PAL, Role, lerp, sm, cl} from './geo60';
import {Flame, Glow, rng} from './frame60';
import {GLYPH_D} from './props60';
import {judgePose} from './cast60';

/* ep60 · 4:3 set props in the tomb-painting paint (ink outline under a flat fill, like the rig).
   Units: most props take `s` = px per grid unit (the figures' unit) so they sit at the same scale as the cast. */
type C = {OW: number; LW: number};
const cx = (s: number): C => ({OW: 2.7 / s, LW: 1.5 / s});
const col = (r: Role | string) => (PAL as Record<string, string>)[r] ?? r;
export const Solid: React.FC<{d: string; r: Role | string; c: C; m?: M; k?: number; o?: number}> = ({d, r, c, m, k = 1, o}) => <g transform={m && mx(m)} opacity={o}>
	<path d={d} fill={PAL.ink} stroke={PAL.ink} strokeWidth={2 * c.OW * k} strokeLinejoin="round" /><path d={d} fill={col(r)} /></g>;
const rect = (x0: number, y0: number, x1: number, y1: number) => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
const at = (x: number, y: number, s: number, flip = 1) => `translate(${x},${y}) scale(${s * flip},${s})`;
export const STONE = {alab: '#EDE3CC', alab2: '#D8C9A8', scarab: '#3F7F5C', scarab2: '#2C5E43', scarabHi: '#8CC49A', faience: '#3FA6A0', night: '#0E1630', night2: '#18234A', river: '#14264F', fire: '#E8642A'};

/* ---------------- the mummy, lying on its back (profile), head to +x; origin = bed surface under the feet ---------------- */
export const MUMMY_LEN = 17.6;
export const Mummy: React.FC<{x: number; y: number; s: number; heart?: number; t?: number; flip?: 1 | -1; masked?: boolean}> = ({x, y, s, heart = 0, t = 0, flip = 1, masked = true}) => {
	const c = cx(s);
	const body = sp([[0.3, 0, 1], [0.0, -0.9], [0.25, -2.3], [0.85, -2.75], [1.6, -2.3], [3.2, -2.05], [5.6, -2.25], [7.6, -2.55], [9.8, -2.7], [11.8, -3.05], [13.2, -3.35], [14.3, -3.2], [15.0, -2.85], [15.4, 0, 1]], true, 0.16);
		// the head lies on its back: crown toward +x, the face's profile looking up (nose at -y); striped headcloth framing a gold mask
		const cloth = sp([[14.95, 0, 1], [14.85, -1.6], [15.15, -2.75], [15.7, -3.0], [16.6, -3.05], [17.5, -3.2], [17.98, -3.38], [18.42, -2.7], [18.68, -1.4], [18.58, 0, 1]], true, 0.16);
	const face = sp([[15.3, -2.92], [15.55, -3.24, 1], [15.85, -3.36], [16.0, -3.3, 1], [16.15, -3.44], [16.32, -3.48, 1], [16.52, -3.98, 1], [16.86, -3.62], [17.05, -3.53], [17.3, -3.65], [17.66, -3.53], [17.9, -3.3], [17.62, -2.72], [16.8, -2.52], [15.9, -2.58]], true, 0.18);
	const wrapHead = sp([[14.7, 0, 1], [14.55, -2.3], [15.05, -3.1], [16.0, -3.45], [16.7, -3.75], [17.0, -3.95], [17.6, -3.85], [18.25, -3.3], [18.62, -1.6], [18.55, 0, 1]], true, 0.16);
	const hid = `mumh${Math.round(x)}_${Math.round(y)}`;
	const cid = `mum${Math.round(x)}_${Math.round(y)}`;
	const wraps: React.ReactNode[] = [];
	for (let i = -6; i < 30; i++) { const x0 = i * 0.62; wraps.push(<line key={'a' + i} x1={x0} y1={0} x2={x0 + 2.6} y2={-4} stroke={PAL.linen2} strokeWidth={c.LW * 1.6} />, <line key={'b' + i} x1={x0 + 2.6} y1={0} x2={x0} y2={-4} stroke="#CFC2A2" strokeWidth={c.LW * 1.1} opacity={0.8} />); }
	const net: React.ReactNode[] = [];
	for (let i = 0; i < 13; i++) for (let j = 0; j < 3; j++) { const bx = 3.0 + i * 0.68 + (j % 2) * 0.34, by = -0.5 - j * 0.62 - (bx > 8 ? (bx - 8) * 0.06 : 0);
		net.push(<path key={`${i}.${j}`} d={poly([[bx, by - 0.3], [bx + 0.3, by], [bx, by + 0.3], [bx - 0.3, by]])} fill="none" stroke={STONE.faience} strokeWidth={c.LW * 1.7} />); }
	return <g transform={at(x, y, s, flip)}>
		<clipPath id={cid}><path d={body} /></clipPath>
		<Solid d={body} r="#E9DDBF" c={c} />
		<g clipPath={`url(#${cid})`}>{wraps}{net}
			{[[6.0, '#B8371F'], [10.6, '#B8371F']].map(([xx, cc]) => <rect key={xx as number} x={xx as number} y={-4} width={0.32} height={4} fill={cc as string} opacity={0.8} />)}
			{heart > 0 && <g opacity={heart}><circle cx={12.6} cy={-1.9} r={1.6} fill="url(#g60-red)" style={{mixBlendMode: 'screen'}} /><path d={sp([[12.6, -1.15, 1], [12.0, -1.7], [12.05, -2.45], [12.6, -2.3], [13.15, -2.45], [13.2, -1.7]], true, 0.2)} fill="#D6402A" opacity={0.9} /></g>}
		</g>
		{/* broad collar across the chest, the cloth and gold mask */}
		<path d={sp([[13.2, -3.32], [14.6, -3.15], [15.1, -2.2], [14.9, -0.9], [14.3, -1.0], [14.4, -2.2], [13.6, -2.7]])} fill={PAL.blue} stroke={PAL.ink} strokeWidth={c.LW * 1.2} />
		{[0.25, 0.5, 0.75].map((u) => <path key={u} d={`M${13.2 + u * 0.8} ${-3.3 + u * 0.4}Q${14.3 + u * 0.3} ${-2.6} ${14.3 + u * 0.3} ${-1.0}`} fill="none" stroke={[PAL.red, PAL.gold, PAL.green][Math.round(u * 4) - 1]} strokeWidth={c.LW * 2} />)}
				{masked ? <g>
			{/* the gold mask = the cast's own head + tripartite wig, laid face-up: head frame (x, y) → (-y, -x) (a mirrored quarter turn) */}
			<Solid d={sp([[14.9, 0, 1], [14.95, -1.3], [15.6, -1.5], [17.6, -1.6], [18.3, -1.2], [18.45, 0, 1]], true, 0.16)} r={PAL.blue} c={c} />
			{[15.4, 15.9, 16.4, 16.9, 17.4, 17.9].map((xx) => <rect key={xx} x={xx} y={-1.45} width={0.24} height={1.45} fill={PAL.gold} />)}
			<g transform={`matrix(0,${-MK},${-MK},0,15.25,-2.2)`}>
				<Solid d={SHAPES.human} r="gold" c={{OW: c.OW / MK, LW: c.LW / MK}} />
				<clipPath id={hid}><path d={SHAPES.wigTri} /></clipPath>
				<Solid d={SHAPES.wigTri} r="gold" c={{OW: c.OW / MK, LW: c.LW / MK}} />
				<g clipPath={`url(#${hid})`}>{Array.from({length: 14}, (_, i) => <path key={i} d={`M${0.9 - i * 0.2} -2.9L${0.2 - i * 0.2} 2.2`} stroke={PAL.blue} strokeWidth={0.11} />)}</g>
				<path d="M0.74 -1.62Q0.95 -2.0 0.6 -2.5" fill="none" stroke={PAL.gold2} strokeWidth={0.1} />
				<path d={sp([[0.52, -1.17, 1], [0.78, -1.35], [1.08, -1.32], [1.22, -1.16, 1], [1.02, -1.02], [0.72, -1.04]], true, 0.2)} fill={PAL.white} stroke={PAL.ink} strokeWidth={c.LW / MK * 1.4} />
				<circle cx={0.96} cy={-1.18} r={0.12} fill={PAL.ink} />
				<path d="M0.52 -1.17L0.12 -1.08L0.2 -0.98Z M1.25 -1.5Q0.8 -1.62 0.36 -1.5" fill={PAL.ink} stroke={PAL.ink} strokeWidth={c.LW / MK * 1.4} />
				<path d="M1.2 -0.5L1.0 -0.5M1.31 -0.8Q1.24 -0.74 1.26 -0.84" fill="none" stroke={PAL.ink} strokeWidth={c.LW / MK} />
				<Solid d={sp([[1.0, -0.06, 1], [1.24, 0.0], [1.3, 0.55], [1.38, 1.0], [1.5, 1.12], [1.5, 1.28], [1.28, 1.28], [1.12, 1.1], [1.04, 0.5]])} r="blue" c={{OW: c.OW / MK, LW: c.LW / MK}} />
				<rect x={-0.15} y={-2.62} width={0.9} height={0.14} fill={PAL.blue} transform="rotate(-8)" />
			</g>
		</g> : <g><Solid d={wrapHead} r="#E9DDBF" c={c} />{[15.4, 16.0, 16.6, 17.2, 17.8].map((xx) => <path key={xx} d={`M${xx} ${-3.6 + Math.abs(xx - 17) * 0.1}L${xx + 0.6} 0`} stroke={PAL.linen2} strokeWidth={c.LW * 1.6} />)}</g>}
	</g>;
};
/** the lion bier: lion head at +x end, lion legs, tail at the foot end; origin = floor under the foot end; bed top at -BIER_H */
export const BIER_H = 5.2;
export const LionBier: React.FC<{x: number; y: number; s: number; len?: number; flip?: 1 | -1}> = ({x, y, s, len = 20.2, flip = 1}) => {
	const c = cx(s), top = -BIER_H;
	const leg = (lx: number, front: boolean) => sp([[lx - 0.55, top + 0.6, 1], [lx + 0.65, top + 0.6, 1], [lx + 0.55, top + 2.2], [lx + 0.3, top + 3.4], [lx + 0.45, -0.6], [lx + 1.25 * (front ? 1 : -1), -0.45], [lx + 1.3 * (front ? 1 : -1), 0, 1], [lx - 0.35 * (front ? 1 : -1), 0, 1], [lx - 0.3, top + 3.2], [lx - 0.62, top + 1.8]], true, 0.16);
		const head = sp([[len - 0.5, top + 0.1, 1], [len - 0.6, top - 1.6], [len - 0.1, top - 2.8], [len + 0.7, top - 3.25], [len + 1.5, top - 3.05], [len + 2.0, top - 2.55], [len + 2.15, top - 2.0], [len + 2.05, top - 1.55, 1], [len + 1.6, top - 1.3], [len + 1.45, top - 0.75], [len + 0.9, top + 0.15, 1]], true, 0.16);
	const mane = sp([[len - 1.4, top + 0.1, 1], [len - 1.75, top - 1.4], [len - 1.3, top - 2.9], [len - 0.4, top - 3.65], [len + 0.55, top - 3.6], [len + 0.3, top - 2.4], [len + 0.0, top - 1.0], [len + 0.3, top + 0.15, 1]], true, 0.16);
	const tail = sp([[-0.2, top + 0.2], [-1.0, top - 0.6], [-1.5, top - 1.8], [-1.1, top - 2.7], [-0.75, top - 2.5], [-1.1, top - 1.8], [-0.7, top - 0.9], [0.1, top + 0.55]], true, 0.18);
	return <g transform={at(x, y, s, flip)}>
		<Solid d={tail} r="lion" c={c} />
		<Solid d={leg(1.0, false)} r="lion" c={c} /><Solid d={leg(len - 1.6, true)} r="lion" c={c} />
		{/* rail */}
		<Solid d={rect(-0.2, top, len + 0.6, top + 0.9)} r="lion" c={c} />
		<path d={`M0 ${top + 0.45}L${len + 0.4} ${top + 0.45}`} stroke={PAL.lion2} strokeWidth={c.LW * 2.4} />
		{Array.from({length: 9}, (_, i) => <rect key={i} x={1.5 + i * 1.8} y={top + 0.25} width={0.9} height={0.4} fill={[PAL.blue, PAL.red, PAL.green][i % 3]} opacity={0.85} />)}
				<Solid d={mane} r="lion2" c={c} />
		{[-150, -120, -90, -60, -35].map((a, i) => { const r = a * Math.PI / 180; return <path key={i} d={`M${len - 0.4} ${top - 1.6}L${len - 0.4 + Math.cos(r) * 1.9} ${top - 1.6 + Math.sin(r) * 1.9}`} stroke={PAL.ink} strokeWidth={c.LW} opacity={0.55} />; })}
		<Solid d={sp([[len + 0.15, top - 3.0], [len + 0.3, top - 3.7], [len + 0.85, top - 3.55], [len + 0.85, top - 3.15]], true, 0.2)} r="lion" c={c} />
		<Solid d={head} r="lion" c={c} />
		<path d={`M${len + 0.95} ${top - 2.55}Q${len + 1.2} ${top - 2.72} ${len + 1.45} ${top - 2.55}Q${len + 1.2} ${top - 2.45} ${len + 0.95} ${top - 2.55}Z`} fill={PAL.white} stroke={PAL.ink} strokeWidth={c.LW * 1.2} />
		<circle cx={len + 1.22} cy={top - 2.57} r={0.08} fill={PAL.ink} />
		<path d={`M${len + 0.85} ${top - 2.8}Q${len + 1.2} ${top - 2.95} ${len + 1.55} ${top - 2.78}`} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.3} />
		<ellipse cx={len + 2.05} cy={top - 1.98} rx={0.16} ry={0.12} fill={PAL.ink} />
		<path d={`M${len + 2.05} ${top - 1.58}Q${len + 1.75} ${top - 1.5} ${len + 1.45} ${top - 1.62}`} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.2} />
		{[0, 1, 2].map((k) => <circle key={k} cx={len + 1.65 + k * 0.16} cy={top - 1.85 + k * 0.05} r={0.045} fill={PAL.ink} />)}
	</g>;
};
/* ---------------- canopic jar (alabaster) with one of the Four Sons of Horus on the lid; origin = base centre ---------------- */
export type JarHead = 'human' | 'baboon' | 'jackal' | 'falcon';
export const CanopicJar: React.FC<{x: number; y: number; s: number; head: JarHead; t?: number; glow?: number}> = ({x, y, s, head, glow = 0}) => {
	const c = cx(s);
	const body = sp([[-0.85, 0, 1], [0.85, 0, 1], [1.05, -0.5], [1.32, -1.8], [1.35, -2.9], [1.15, -3.55], [0.95, -3.7, 1], [-0.95, -3.7, 1], [-1.15, -3.55], [-1.35, -2.9], [-1.32, -1.8], [-1.05, -0.5]], true, 0.16);
	const sk: Record<JarHead, {d: string; r: string}> = {
		human: {d: sp([[-1.0, -3.7, 1], [1.0, -3.7, 1], [1.05, -4.6], [0.85, -5.6], [0.0, -6.05], [-0.85, -5.6], [-1.05, -4.6]], true, 0.18), r: PAL.blue},
		baboon: {d: sp([[-1.0, -3.7, 1], [1.0, -3.7, 1], [1.2, -4.4], [1.45, -4.9], [1.2, -5.25], [0.5, -5.9], [-0.4, -5.9], [-1.0, -5.2], [-1.1, -4.4]], true, 0.18), r: PAL.baboon},
		jackal: {d: sp([[-1.0, -3.7, 1], [1.0, -3.7, 1], [1.1, -4.3], [1.9, -4.75], [1.95, -5.0], [0.95, -5.2], [0.62, -5.55], [0.55, -6.6, 1], [0.15, -5.7], [-0.45, -5.6], [-1.0, -5.0]], true, 0.18), r: PAL.jackal},
		falcon: {d: sp([[-1.0, -3.7, 1], [1.0, -3.7, 1], [1.05, -4.3], [1.4, -4.55], [1.5, -4.9], [1.25, -5.3], [0.6, -5.75], [-0.3, -5.75], [-1.0, -5.1]], true, 0.18), r: PAL.falcon},
	};
	const h = sk[head];
	return <g transform={at(x, y, s)}>
		{glow > 0 && <circle cx={0} cy={-3} r={4} fill="url(#g60-gold)" opacity={glow * 0.6} style={{mixBlendMode: 'screen'}} />}
		<Solid d={body} r={STONE.alab} c={c} />
		<path d="M-0.9 -3.2Q-1.1 -2.0 -0.7 -0.4" fill="none" stroke={STONE.alab2} strokeWidth={c.LW * 3} opacity={0.8} />
		<path d="M0.5 -3.4Q0.2 -2.4 0.7 -1.2Q0.9 -0.6 0.6 -0.2" fill="none" stroke={STONE.alab2} strokeWidth={c.LW * 1.4} opacity={0.7} />
		<rect x={-0.28} y={-3.3} width={0.56} height={2.8} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 0.8} opacity={0.7} />
		{[-2.9, -2.35, -1.8, -1.25].map((yy, i) => <rect key={yy} x={-0.17 + (i % 2) * 0.05} y={yy} width={0.3} height={0.28} rx={0.06} fill={[PAL.blue, PAL.red, PAL.ink, PAL.blue][i]} opacity={0.75} />)}
		<Solid d={h.d} r={h.r} c={c} />
		{head === 'human' && <><path d={sp([[0.35, -4.0], [1.05, -4.1], [1.15, -4.8], [0.95, -5.25], [0.45, -5.2]])} fill={PAL.skinF} stroke={PAL.ink} strokeWidth={c.LW} /><circle cx={0.78} cy={-4.85} r={0.09} fill={PAL.ink} /></>}
		{head !== 'human' && <circle cx={head === 'jackal' ? 0.95 : 0.65} cy={-5.0} r={0.11} fill={head === 'jackal' ? PAL.gold : PAL.ink} />}
		{head === 'falcon' && <path d="M1.42 -4.6Q1.3 -4.4 1.1 -4.42" fill="none" stroke={PAL.ink} strokeWidth={c.LW} />}
		<rect x={-1.02} y={-3.85} width={2.04} height={0.18} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW * 0.6} />
	</g>;
};
/* ---------------- offering table: pedestal stand heaped with bread, a duck, fruit, lettuce and lotus; jars on ring stands ---------------- */
export const OfferingTable: React.FC<{x: number; y: number; s: number; t?: number}> = ({x, y, s, t = 0}) => {
	const c = cx(s), top = -4.2;
	const loaf = (lx: number, ly: number, w: number, h: number, r: Role | string, k: string) => <Solid key={k} d={sp([[lx - w, ly, 1], [lx + w, ly, 1], [lx + w * 0.7, ly - h * 0.6], [lx, ly - h], [lx - w * 0.7, ly - h * 0.6]], true, 0.2)} r={r} c={c} />;
	const lotus = (lx: number, ly: number, a: number, k: string) => <g key={k} transform={`translate(${lx},${ly}) rotate(${a + 4 * Math.sin(t * 1.3 + lx)})`}>
		<path d="M0 0Q0.2 1.5 0 3" fill="none" stroke={PAL.green} strokeWidth={c.LW * 2} />
		<Solid d={poly([[-0.75, -0.9], [-0.35, 0.05], [0.35, 0.05], [0.75, -0.9], [0.3, -0.45], [0, -1.15], [-0.3, -0.45]])} r="blue" c={c} /></g>;
	return <g transform={at(x, y, s)}>
		{/* jars on ring stands at the side */}
		{[[-4.6, 0], [4.6, 1]].map(([jx, k]) => <g key={k}>
			<Solid d={rect(jx - 0.9, -0.8, jx + 0.9, 0)} r="wood" c={c} />
			<Solid d={sp([[jx - 0.35, -0.8, 1], [jx + 0.35, -0.8, 1], [jx + 1.0, -2.0], [jx + 0.95, -3.4], [jx + 0.45, -4.0], [jx + 0.5, -4.5, 1], [jx - 0.5, -4.5, 1], [jx - 0.45, -4.0], [jx - 0.95, -3.4], [jx - 1.0, -2.0]], true, 0.18)} r={k ? PAL.red : '#C9874A'} c={c} />
			<path d={`M${jx - 0.95} -2.9Q${jx} -2.6 ${jx + 0.95} -2.9`} fill="none" stroke={PAL.blue} strokeWidth={c.LW * 2.2} />
			{lotus(jx + 0.1, -4.4, k ? 12 : -12, 'jl' + k)}</g>)}
		{/* stand */}
		<Solid d={sp([[-0.5, 0, 1], [0.5, 0, 1], [0.38, top + 0.4], [1.2, top + 0.05, 1], [-1.2, top + 0.05, 1], [-0.38, top + 0.4]], true, 0.2)} r="gold" c={c} />
		<Solid d={rect(-3.4, top - 0.35, 3.4, top + 0.1)} r="gold" c={c} />
		{/* heap */}
		<Solid d={sp([[-3.0, top - 0.35, 1], [-1.0, top - 0.35, 1], [-1.4, top - 1.5], [-2.4, top - 1.6]], true, 0.2)} r="green" c={c} />
		{loaf(-1.6, top - 0.35, 1.0, 1.4, '#D9A050', 'l1')}{loaf(0.6, top - 0.35, 1.25, 1.0, '#C98A3E', 'l2')}
		<Solid d={sp([[1.6, top - 0.35, 1], [3.2, top - 0.35, 1], [3.1, top - 1.6], [2.4, top - 4.0, 1], [1.8, top - 1.6]], true, 0.2)} r="#E0B060" c={c} />
		{/* the trussed duck */}
		<Solid d={sp([[-1.8, top - 1.4], [0.5, top - 1.1], [1.6, top - 1.6], [1.75, top - 2.2], [1.2, top - 2.7], [-0.6, top - 2.9], [-1.6, top - 2.5]], true, 0.2)} r="#E9DDBF" c={c} />
		<path d={`M-1.7 ${top - 2.2}Q-2.4 ${top - 2.0} -2.6 ${top - 1.4}`} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 2.4} />
		<path d={`M0.2 ${top - 2.85}L0.6 ${top - 1.15}M-0.7 ${top - 2.85}L-0.4 ${top - 1.2}`} stroke={PAL.red} strokeWidth={c.LW * 1.6} />
		{/* grapes, figs */}
		{[[-0.6, -3.5], [-0.2, -3.7], [0.2, -3.5], [-0.4, -3.25], [0.0, -3.2], [-0.2, -2.95]].map(([gx, gy], i) => <circle key={i} cx={gx + 0.3} cy={top + gy - 0.1} r={0.24} fill="#5A3A7A" stroke={PAL.ink} strokeWidth={c.LW * 0.8} />)}
		{[[1.2, -3.2], [1.7, -3.0]].map(([fx, fy], i) => <ellipse key={i} cx={fx} cy={top + fy} rx={0.36} ry={0.3} fill="#7A4A6A" stroke={PAL.ink} strokeWidth={c.LW * 0.8} />)}
		{lotus(-2.6, top - 3.4, -24, 'a')}{lotus(0.0, top - 4.2, 0, 'b')}{lotus(2.4, top - 3.6, 22, 'c')}
	</g>;
};
/** a standing torch (gold stem, bowl, living flame); origin = floor */
export const Torch: React.FC<{x: number; y: number; s?: number; t: number; seed?: number; h?: number}> = ({x, y, s = 1, t, seed = 0, h = 230}) => <g>
	<path d={poly([[x - 5 * s, y], [x + 5 * s, y], [x + 3 * s, y - h * s], [x - 3 * s, y - h * s]])} fill={PAL.gold} stroke={PAL.ink} strokeWidth={2} />
	{[0.25, 0.5, 0.75].map((u) => <rect key={u} x={x - 4.2 * s} y={y - h * s * u - 4} width={8.4 * s} height={8} fill={PAL.blue} stroke={PAL.ink} strokeWidth={1.2} />)}
	<path d={poly([[x - 26 * s, y], [x + 26 * s, y], [x + 18 * s, y - 10 * s], [x - 18 * s, y - 10 * s]])} fill={PAL.gold} stroke={PAL.ink} strokeWidth={2} />
	<path d={sp([[x - 28 * s, y - h * s - 18 * s, 1], [x + 28 * s, y - h * s - 18 * s, 1], [x + 16 * s, y - h * s, 1], [x - 16 * s, y - h * s, 1]])} fill={PAL.gold} stroke={PAL.ink} strokeWidth={2} />
	<Flame x={x} y={y - h * s - 16 * s} s={s * 1.15} t={t} seed={seed} />
</g>;
/** a small oil lamp (bowl on a low stand) */
export const Lamp: React.FC<{x: number; y: number; s?: number; t: number; seed?: number}> = ({x, y, s = 1, t, seed = 0}) => <g>
	<path d={poly([[x - 9 * s, y], [x + 9 * s, y], [x + 5 * s, y - 26 * s], [x - 5 * s, y - 26 * s]])} fill="#C9874A" stroke={PAL.ink} strokeWidth={1.8} />
	<path d={sp([[x - 24 * s, y - 34 * s, 1], [x + 24 * s, y - 34 * s, 1], [x + 14 * s, y - 24 * s], [x - 14 * s, y - 24 * s]], true, 0.2)} fill="#C9874A" stroke={PAL.ink} strokeWidth={1.8} />
	<Flame x={x} y={y - 34 * s} s={s * 0.62} t={t} seed={seed} glow={0.8} />
</g>;

/* ---------------- the heart scarab (green stone, gold mount): top view, or the inscribed base; origin = centre ---------------- */
/** horizontal lines of incised glyphs inside a clip; reveal 0..1 writes them line by line */
const GlyphLines: React.FC<{x0: number; x1: number; y0: number; rows: number; cell: number; seed: number; color: string; reveal?: number; rowGap?: number}> = ({x0, x1, y0, rows, cell, seed, color, reveal = 1, rowGap = 1.18}) => {
	const R = rng(seed), keys = Object.keys(GLYPH_D), out: React.ReactNode[] = [];
	for (let j = 0; j < rows; j++) { const show = cl(reveal * rows - j); if (show <= 0) continue;
		for (let x = x0; x < x1 - cell * 0.8; x += cell * (0.82 + R() * 0.3)) { const g = GLYPH_D[keys[Math.floor(R() * keys.length)]];
			out.push(<path key={`${j}.${x}`} d={g.d} fill={color} transform={`translate(${x},${y0 + j * cell * rowGap}) scale(${cell})`} opacity={show} />); } }
	return <g>{out}</g>;
};
export const HeartScarab: React.FC<{x: number; y: number; s: number; flip?: number; t?: number; lines?: number; glint?: number; id?: string}> = ({x, y, s, flip = 0, t = 0, lines = 1, glint = 0, id = 'hs'}) => {
	// flip 0 = back up (beetle), 1 = base up (inscription); the turn is a horizontal squash through 0.5
	const kx = Math.abs(Math.cos(flip * Math.PI)), base = flip > 0.5, c = cx(s);
		const oval = sp([[0, -4.75], [2.25, -4.25], [3.25, -2.4], [3.62, 0.2], [3.35, 2.8], [2.05, 4.35], [0, 4.8], [-2.05, 4.35], [-3.35, 2.8], [-3.62, 0.2], [-3.25, -2.4], [-2.25, -4.25]], true, 0.2);
	const clyp = sp([[-2.0, -3.3, 1], [-1.4, -4.25], [0, -4.72], [1.4, -4.25], [2.0, -3.3, 1], [1.0, -3.05], [-1.0, -3.05]], true, 0.2);
	const prono = sp([[-3.25, -1.05, 1], [-2.85, -2.6], [-2.0, -3.3, 1], [-1.0, -3.05], [1.0, -3.05], [2.0, -3.3, 1], [2.85, -2.6], [3.25, -1.05, 1], [0, -0.8]], true, 0.2);
	const gid = `${id}-g`, bid = `${id}-c`;
	return <g transform={`translate(${x},${y}) scale(${s * Math.max(0.04, kx)},${s})`}>
		<defs>
			<radialGradient id={gid} cx="0.4" cy="0.36" r="0.72"><stop offset="0" stopColor={base ? '#5FAE7E' : '#86D69C'} /><stop offset="0.5" stopColor="#2F9160" /><stop offset="1" stopColor="#144A2E" /></radialGradient>
			<clipPath id={bid}><path d={oval} /></clipPath>
		</defs>
		<ellipse cx={0.5} cy={0.7} rx={4.5} ry={5.3} fill="#000" opacity={0.3} />
		<path d={oval} fill={PAL.ink} stroke={PAL.ink} strokeWidth={c.OW * 2.4} />
		<path d={oval} fill={`url(#${gid})`} />
		{!base ? <g>
			{/* carved: clypeus with its serrated edge and the eyes, the pronotum, the split of the wing cases, the humeral notches */}
			<path d={clyp} fill="#2E5E43" stroke={PAL.ink} strokeWidth={c.LW * 2} strokeLinejoin="round" />
			{[-1.3, -0.65, 0, 0.65, 1.3].map((xx) => <path key={xx} d={`M${xx - 0.24} ${-4.42 + Math.abs(xx) * 0.22}L${xx} ${-4.95 + Math.abs(xx) * 0.24}L${xx + 0.24} ${-4.42 + Math.abs(xx) * 0.22}Z`} fill="#2E5E43" stroke={PAL.ink} strokeWidth={c.LW * 1.2} strokeLinejoin="round" />)}
			{[-1, 1].map((sg) => <ellipse key={sg} cx={sg * 1.75} cy={-3.15} rx={0.32} ry={0.22} fill="#173323" stroke={PAL.ink} strokeWidth={c.LW} />)}
			<path d={prono} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 2.2} strokeLinejoin="round" />
			<path d="M-3.1 -0.85Q0 -0.5 3.1 -0.85" fill="none" stroke={STONE.scarabHi} strokeWidth={c.LW * 1.4} opacity={0.6} />
			<path d="M0 -0.78L0 4.72" stroke={PAL.ink} strokeWidth={c.LW * 2.2} /><path d="M0.12 -0.6L0.12 4.6" stroke={STONE.scarabHi} strokeWidth={c.LW} opacity={0.5} />
			{[-1, 1].map((sg) => <path key={sg} d={`M${sg * 0.18} -0.75L${sg * 0.55} -0.2L${sg * 0.18} 0.25`} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.6} />)}
			{[-1, 1].map((sg) => <path key={'e' + sg} d={`M${sg * 0.35} 4.55Q${sg * 2.8} 3.6 ${sg * 3.25} 0.2`} fill="none" stroke={PAL.ink} strokeWidth={c.LW} opacity={0.5} />)}
			{/* polished sheen */}
			<path d="M-2.4 -2.4Q-1.0 -3.0 0.4 -2.6" fill="none" stroke="#E8FFF0" strokeWidth={c.LW * 3} opacity={0.5} strokeLinecap="round" />
			<path d="M-2.5 0.4Q-2.5 2.4 -1.2 3.6" fill="none" stroke="#E8FFF0" strokeWidth={c.LW * 4.5} opacity={0.35} strokeLinecap="round" />
			<path d="M1.1 0.4Q1.6 2.0 1.0 3.4" fill="none" stroke="#E8FFF0" strokeWidth={c.LW * 2.2} opacity={0.25} strokeLinecap="round" />
		</g> : <g>
			<g clipPath={`url(#${bid})`}><GlyphLines x0={-3.3} x1={3.4} y0={-4.1} rows={8} cell={0.86} seed={30} color="#10241A" reveal={lines} />
				{Array.from({length: 9}, (_, j) => <line key={j} x1={-4} x2={4} y1={-4.15 + j * 0.86 * 1.18} y2={-4.15 + j * 0.86 * 1.18} stroke="#10241A" strokeWidth={c.LW * 1.2} opacity={0.55} />)}</g>
			<path d={oval} fill="none" stroke={STONE.scarabHi} strokeWidth={c.LW * 1.4} opacity={0.5} transform="scale(0.94)" />
		</g>}
		{/* gold mount band around the rim */}
		<path d={oval} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 5.6} />
		<path d={oval} fill="none" stroke={PAL.gold} strokeWidth={c.LW * 3.8} />
		<path d={oval} fill="none" stroke={PAL.goldHi} strokeWidth={c.LW * 1.0} opacity={0.8} />
		{glint > 0 && <g style={{mixBlendMode: 'screen'}} opacity={glint}><ellipse cx={-1.6 + 0.8 * Math.sin(t * 0.7)} cy={-2.0} rx={1.5} ry={0.7} fill="url(#g60-white)" /><circle cx={2.3} cy={-3.0 + 0.3 * Math.sin(t)} r={0.6} fill="url(#g60-white)" /></g>}
	</g>;
};

/* ---------------- Duat: the solar barque, gates, serpents, the river ---------------- */
/** papyriform barque with a shrine (Ra seated inside, Mehen arching over), steering oar at the stern; faces +x; origin = waterline centre */
export const Barque: React.FC<{x: number; y: number; s: number; t: number; ra?: Cast; glow?: number; children?: React.ReactNode}> = ({x, y, s, t, ra, glow = 1, children}) => {
	const c = cx(s), rock = 1.2 * Math.sin(t * 1.1), bob = 0.25 * Math.sin(t * 1.6);
	const hull = sp([[-15.5, -6.2], [-14.6, -3.8], [-12.5, -1.6], [-8, -0.2], [0, 0.5], [8, -0.2], [12.5, -1.6], [14.8, -4.0], [15.8, -6.6], [16.3, -7.0], [16.0, -5.6], [14.8, -2.6], [12.8, -0.3], [8, 1.3], [0, 1.8], [-8, 1.3], [-12.8, -0.3], [-14.8, -3.0], [-15.9, -5.9], [-16.4, -6.6]], true, 0.18);
	const umbel = (ux: number, uy: number, sg: number) => <Solid d={poly([[ux, uy], [ux + sg * 1.6, uy - 1.6], [ux + sg * 0.9, uy - 1.9], [ux - sg * 0.2, uy - 0.6]])} r="green" c={c} />;
	return <g transform={`translate(${x},${y + bob * s}) rotate(${rock}) scale(${s})`}>
		{glow > 0 && <circle cx={0} cy={-10} r={22} fill="url(#g60-gold)" opacity={0.55 * glow} style={{mixBlendMode: 'screen'}} />}
		{/* steering oar */}
		<path d="M-11.5 -7.5L-14.5 3.5" stroke={PAL.ink} strokeWidth={c.OW * 2.6} /><path d="M-11.5 -7.5L-14.5 3.5" stroke={PAL.wood} strokeWidth={c.OW * 1.4} />
		<Solid d={sp([[-14.2, 1.6], [-13.4, 2.0], [-14.0, 5.0], [-14.9, 5.2], [-15.0, 4.0]])} r="wood" c={c} />
		<Solid d={hull} r="gold" c={c} />
		{[-9, -5, -1, 3, 7, 11].map((xx) => <path key={xx} d={`M${xx} ${0.3 + Math.abs(xx) * -0.03}L${xx + 0.6} ${1.4 - Math.abs(xx) * 0.03}`} stroke={PAL.ink} strokeWidth={c.LW * 1.3} />)}
		<path d="M-12.5 -0.9Q0 1.4 12.5 -0.9" fill="none" stroke={PAL.blue} strokeWidth={c.LW * 3} />
		{umbel(16.1, -6.8, 1)}{umbel(-16.2, -6.4, -1)}
		{/* shrine (cabin) */}
		<Solid d={rect(-4.2, -12.4, 4.2, 0.2)} r="#E9DDBF" c={c} />
		<Solid d={rect(-4.8, -13.2, 4.8, -12.2)} r="gold" c={c} />
		{Array.from({length: 8}, (_, i) => <rect key={i} x={-4.1 + i * 1.05} y={-13.05} width={0.6} height={0.7} fill={[PAL.blue, PAL.red][i % 2]} />)}
		<g>{children}</g>
		{/* Mehen: the coiled serpent arching over the shrine */}
		<path d="M-5.2 -0.4Q-6.8 -16.2 0 -16.6Q6.6 -16.8 5.4 -2.6" fill="none" stroke={PAL.ink} strokeWidth={c.OW * 5.4} strokeLinecap="round" />
		<path d="M-5.2 -0.4Q-6.8 -16.2 0 -16.6Q6.6 -16.8 5.4 -2.6" fill="none" stroke={PAL.green} strokeWidth={c.OW * 3.6} strokeLinecap="round" />
		<path d="M-5.2 -0.4Q-6.8 -16.2 0 -16.6Q6.6 -16.8 5.4 -2.6" fill="none" stroke={PAL.gold} strokeWidth={c.OW * 1.2} strokeDasharray="0.5 0.7" />
		<Solid d={sp([[5.0, -2.8], [5.9, -2.6], [6.4, -3.5], [6.0, -4.2], [5.3, -4.0]])} r="green" c={c} />
	</g>;
};
/** rearing cobra guarding a gate: body coils on the ground, raised hood, flickering tongue; faces +x (flip -1 to face left) */
export const Serpent: React.FC<{x: number; y: number; s: number; t: number; flip?: 1 | -1; fire?: number; rear?: number}> = ({x, y, s, t, flip = 1, fire = 0, rear = 1}) => {
	const c = cx(s), sw = 2.5 * Math.sin(t * 1.3), nod = 3 * Math.sin(t * 2.1 + 1), h = lerp(2.5, 9.5, rear);
	const spine: V[] = [[-9, 0], [-6.5, -0.8], [-4, 0], [-1.6, -0.9], [0.5, -0.2], [1.6, -h * 0.35], [1.2 + sw * 0.05, -h * 0.7], [2.0 + sw * 0.1, -h]];
	const pts: Pt[] = [], back: Pt[] = [];
	spine.forEach((p, i) => { const w = i < 5 ? 0.85 - i * 0.02 : i === 7 ? 1.4 : 1.0, q = spine[Math.min(spine.length - 1, i + 1)], pp = spine[Math.max(0, i - 1)], dx = q[0] - pp[0], dy = q[1] - pp[1], L = Math.hypot(dx, dy) || 1;
		pts.push([p[0] - (dy / L) * w, p[1] + (dx / L) * w]); back.unshift([p[0] + (dy / L) * w, p[1] - (dx / L) * w]); });
	const body = sp([[-10.2, 0.4, 1], ...pts, ...back], true, 0.18);
	const hd = spine[7];
	const hood = sp([[hd[0] - 1.4, hd[1] + 2.4], [hd[0] - 1.9, hd[1] + 0.2], [hd[0] - 1.2, hd[1] - 1.4], [hd[0] + 0.2, hd[1] - 1.8], [hd[0] + 1.0, hd[1] - 0.8], [hd[0] + 1.3, hd[1] + 1.2], [hd[0] + 0.8, hd[1] + 2.6]], true, 0.2);
	const head = sp([[hd[0] - 0.3, hd[1] - 1.6], [hd[0] + 1.0, hd[1] - 2.2], [hd[0] + 2.3, hd[1] - 2.0], [hd[0] + 2.55, hd[1] - 1.55], [hd[0] + 1.6, hd[1] - 1.15], [hd[0] + 0.4, hd[1] - 0.9]], true, 0.2);
	const tongue = Math.sin(t * 7) > 0.3;
	return <g transform={`translate(${x},${y}) scale(${s * flip},${s})`}>
		{fire > 0 && <g><circle cx={hd[0] + 6} cy={hd[1] - 1.5} r={7 * fire} fill="url(#g60-warm)" opacity={0.7} style={{mixBlendMode: 'screen'}} />
			{[0, 1, 2].map((i) => { const u = ((t * 1.6 + i / 3) % 1); return <path key={i} d={sp([[hd[0] + 2.6, hd[1] - 1.7], [hd[0] + 2.6 + u * 6, hd[1] - 2.4 - u * 1.2 + Math.sin(t * 9 + i) * 0.4], [hd[0] + 3.2 + u * 7.5, hd[1] - 1.6], [hd[0] + 2.6 + u * 6, hd[1] - 0.9 - u * 0.4]], true, 0.2)} fill={['#F8C24A', '#E8642A', '#FFE7A0'][i]} opacity={fire * (1 - u) * 0.9} />; })}</g>}
		<g transform={`rotate(${nod} ${hd[0]} ${hd[1] + 3})`}>
			<Solid d={body} r="gold" c={c} />
			{spine.slice(0, 6).map((p, i) => <path key={i} d={`M${p[0] - 0.3} ${p[1] - 0.8}L${p[0] + 0.3} ${p[1] + 0.8}`} stroke={PAL.red} strokeWidth={c.LW * 4} />)}
			<Solid d={hood} r="green" c={c} />
			<path d={`M${hd[0] - 0.5} ${hd[1] + 2.2}L${hd[0] - 0.2} ${hd[1] - 0.8}`} stroke={PAL.gold} strokeWidth={c.LW * 2.4} />
			<path d={`M${hd[0] + 0.4} ${hd[1] + 2.3}L${hd[0] + 0.45} ${hd[1] - 0.6}`} stroke={PAL.red} strokeWidth={c.LW * 2.4} />
			<Solid d={head} r="green" c={c} />
			<circle cx={hd[0] + 1.25} cy={hd[1] - 1.75} r={0.2} fill="#FFE07A" stroke={PAL.ink} strokeWidth={c.LW} />
			{tongue && <path d={`M${hd[0] + 2.4} ${hd[1] - 1.45}L${hd[0] + 3.4} ${hd[1] - 1.5}L${hd[0] + 3.8} ${hd[1] - 1.8}M${hd[0] + 3.4} ${hd[1] - 1.5}L${hd[0] + 3.8} ${hd[1] - 1.25}`} fill="none" stroke={PAL.red} strokeWidth={c.LW * 1.6} />}
		</g>
	</g>;
};
/** a pylon gate of the Duat: two towers, the dark doorway with a fire glow inside; x = centre, gy = ground, w = doorway width (px) */
export const DuatGate: React.FC<{x: number; gy: number; h: number; w: number; t: number; seed?: number; glow?: number}> = ({x, gy, h, w, t, seed = 0, glow = 1}) => {
	const tw = w * 1.15, top = gy - h, k = flickK(t, seed);
	const tower = (x0: number, sg: number) => <g>
				<path d={poly([[x0, gy], [x0 + sg * tw, gy], [x0 + sg * tw * 0.86, top], [x0, top]])} fill="#34447E" stroke={PAL.ink} strokeWidth={3} />
		<path d={poly([[x0 + sg * 6, gy - 4], [x0 + sg * (tw - 8), gy - 4], [x0 + sg * (tw * 0.86 - 6), top + 6], [x0 + sg * 6, top + 6]])} fill="none" stroke={PAL.gold} strokeWidth={2} opacity={0.75} />
		<path d={poly([[x0, top], [x0 + sg * tw * 0.86, top], [x0 + sg * tw * 0.9, top - 26], [x0, top - 26]])} fill="#4A5CA0" stroke={PAL.ink} strokeWidth={2.4} />
		{Array.from({length: 6}, (_, i) => <path key={i} d={`M${x0 + sg * (10 + i * tw * 0.14)} ${top - 4}L${x0 + sg * (10 + i * tw * 0.14)} ${top - 22}`} stroke={[PAL.gold, PAL.red, PAL.turq][i % 3]} strokeWidth={3} opacity={0.7} />)}
		{Array.from({length: 4}, (_, i) => <g key={i} opacity={0.55}><rect x={sg > 0 ? x0 + 14 : x0 - 14 - 26} y={top + 30 + i * 60} width={26} height={44} fill="none" stroke={PAL.gold} strokeWidth={1.5} />
			<circle cx={sg > 0 ? x0 + 27 : x0 - 27} cy={top + 52 + i * 60} r={6} fill={PAL.gold} opacity={0.7} /></g>)}
	</g>;
	return <g>
		<rect x={x - w / 2} y={top + 40} width={w} height={h - 40} fill="#05070F" />
		<ellipse cx={x} cy={gy - 40} rx={w * 0.7} ry={h * 0.45} fill="url(#g60-warm)" opacity={0.5 * glow * (0.85 + 0.15 * k)} style={{mixBlendMode: 'screen'}} />
		<path d={poly([[x - w / 2 - 6, top + 40], [x + w / 2 + 6, top + 40], [x + w / 2 + 6, top + 12], [x - w / 2 - 6, top + 12]])} fill="#2A3768" stroke={PAL.ink} strokeWidth={2.4} />
		{tower(x - w / 2, -1)}{tower(x + w / 2, 1)}
	</g>;
};
const flickK = (t: number, seed: number) => 0.5 * Math.sin(t * 11.3 + seed) + 0.3 * Math.sin(t * 23.9 + seed * 2) + 0.2 * Math.sin(t * 41 + seed * 3);
/** a river band with the water sign's zigzag lines, drifting; dark for the Duat */
export const River: React.FC<{x0: number; x1: number; y: number; h: number; t: number; dark?: boolean; speed?: number}> = ({x0, x1, y, h, t, dark, speed = 14}) => {
	const rows = Math.max(2, Math.round(h / 22)), step = 26, off = (t * speed) % step, lines: React.ReactNode[] = [];
	for (let r = 0; r < rows; r++) { const yy = y + (r + 0.6) * (h / rows), sh = r % 2 ? step / 2 : 0; let d = '';
		for (let xx = x0 - step * 2 + off + sh; xx < x1 + step; xx += step) d += `${d ? 'L' : 'M'}${xx} ${yy}L${xx + step / 2} ${yy - 7}`;
		lines.push(<path key={r} d={d} fill="none" stroke={dark ? '#3D5FA8' : '#BFD8F0'} strokeWidth={2.2} opacity={dark ? 0.75 : 0.9} />); }
	return <g><rect x={x0} y={y} width={x1 - x0} height={h} fill={dark ? STONE.river : PAL.blue} /><rect x={x0} y={y} width={x1 - x0} height={3} fill={PAL.ink} />{lines}</g>;
};

/* ---------------- plants ---------------- */
/** a strip of wheat / emmer: stalks with ears that sway; cut 0..1 leaves stubble from the left */
export const Wheat: React.FC<{x0: number; x1: number; y: number; h: number; t: number; seed?: number; cut?: number; dense?: number}> = ({x0, x1, y, h, t, seed = 1, cut = 0, dense = 1}) => {
	const R = rng(seed), out: React.ReactNode[] = [], n = Math.round(((x1 - x0) / 9) * dense);
	for (let i = 0; i < n; i++) { const bx = x0 + (i + R() * 0.8) * ((x1 - x0) / n), hh = h * (0.8 + R() * 0.3), ph = R() * 6, sway = 4 * Math.sin(t * 1.4 + bx * 0.013 + ph) + 2 * Math.sin(t * 3.1 + ph);
		if ((bx - x0) / (x1 - x0) < cut) { out.push(<path key={i} d={`M${bx} ${y}L${bx + 1} ${y - h * 0.12}`} stroke={PAL.gold2} strokeWidth={2.2} />); continue; }
		const tx = bx + sway, ty = y - hh;
		out.push(<g key={i}><path d={`M${bx} ${y}Q${bx + sway * 0.3} ${y - hh * 0.5} ${tx} ${ty}`} fill="none" stroke={i % 3 ? '#B88A2E' : '#7E9A3A'} strokeWidth={2.2} />
			<path d={sp([[tx - 3.2, ty + 2], [tx - 3.6, ty - 10], [tx, ty - 22, 1], [tx + 3.6, ty - 10], [tx + 3.2, ty + 2]], true, 0.2)} fill={PAL.gold} stroke={PAL.ink} strokeWidth={1.3} />
			<path d={`M${tx} ${ty - 22}L${tx + sway * 0.4} ${ty - 34}`} stroke={PAL.gold2} strokeWidth={1} /></g>); }
	return <g>{out}</g>;
};
/** a date palm (trunk scales, fronds, date bunches), swaying; origin = foot of the trunk */
export const Palm: React.FC<{x: number; y: number; h: number; t: number; seed?: number}> = ({x, y, h, t, seed = 0}) => {
	const sw = 6 * Math.sin(t * 0.9 + seed), tx = x + sw * 0.6 + h * 0.06, ty = y - h;
	const trunk = sp([[x - 11, y, 1], [x + 11, y, 1], [x + 8 + sw * 0.3, y - h * 0.5], [tx + 6, ty, 1], [tx - 6, ty, 1], [x - 7 + sw * 0.3, y - h * 0.5]], true, 0.18);
	const fronds = [-150, -120, -95, -70, -40, -15, 15].map((a, i) => { const aa = (a + 5 * Math.sin(t * 1.3 + i + seed)) * Math.PI / 180, L = h * 0.42, ex = tx + Math.cos(aa) * L, ey = ty + Math.sin(aa) * L * 0.75 + L * 0.28;
		const mx_ = tx + Math.cos(aa) * L * 0.55, my = ty + Math.sin(aa) * L * 0.6 - 4;
		return <g key={i}><path d={sp([[tx, ty], [mx_ - 6, my - 8], [ex, ey, 1], [mx_ + 6, my + 8]], true, 0.2)} fill={i % 2 ? PAL.green : '#2E7A4E'} stroke={PAL.ink} strokeWidth={1.6} />
			<path d={`M${tx} ${ty}Q${mx_} ${my} ${ex} ${ey}`} fill="none" stroke={PAL.ink} strokeWidth={1} opacity={0.6} /></g>; });
	return <g><path d={trunk} fill="#9A6A3A" stroke={PAL.ink} strokeWidth={2} />
		{Array.from({length: Math.floor(h / 16)}, (_, i) => { const yy = y - 10 - i * 16, xx = lerp(x, tx, (y - yy) / h); return <path key={i} d={`M${xx - 8} ${yy}L${xx} ${yy - 6}L${xx + 8} ${yy}`} fill="none" stroke="#6A4626" strokeWidth={1.6} />; })}
		{fronds}
		{[-1, 1].map((sg) => <g key={sg}>{[0, 1, 2, 3, 4].map((k) => <circle key={k} cx={tx + sg * (10 + (k % 2) * 6)} cy={ty + 10 + k * 6} r={4.4} fill="#B8371F" stroke={PAL.ink} strokeWidth={1} />)}</g>)}
	</g>;
};
/** papyrus clump (stems with umbels) at the water's edge */
export const PapyrusClump: React.FC<{x: number; y: number; h: number; t: number; n?: number; seed?: number}> = ({x, y, h, t, n = 7, seed = 2}) => {
	const R = rng(seed);
	return <g>{Array.from({length: n}, (_, i) => { const a = ((i / (n - 1)) - 0.5) * 34 + 3 * Math.sin(t * 1.2 + i), hh = h * (0.75 + R() * 0.3), r = a * Math.PI / 180, ex = x + Math.sin(r) * hh, ey = y - Math.cos(r) * hh;
		return <g key={i}><path d={`M${x + (i - n / 2) * 3} ${y}L${ex} ${ey}`} stroke={PAL.green} strokeWidth={3} />
			<path d={poly([[ex, ey], [ex - 14 + Math.sin(r) * 6, ey - 22], [ex + 14 + Math.sin(r) * 6, ey - 22]])} fill={i % 2 ? PAL.green : '#2E7A4E'} stroke={PAL.ink} strokeWidth={1.6} strokeLinejoin="round" />
			<path d={`M${ex - 13 + Math.sin(r) * 6} ${ey - 22}Q${ex + Math.sin(r) * 6} ${ey - 27} ${ex + 13 + Math.sin(r) * 6} ${ey - 22}`} fill="none" stroke={PAL.gold} strokeWidth={2} /></g>; })}</g>;
};

/* ---------------- architecture ---------------- */
/** papyrus-bundle column with an open capital; x = centre, from gy up to top */
export const Column: React.FC<{x: number; gy: number; top: number; w?: number}> = ({x, gy, top, w = 46}) => {
	const cap = 70, sh = sp([[x - w / 2, gy, 1], [x + w / 2, gy, 1], [x + w * 0.44, top + cap], [x + w * 0.5, top + cap + 8, 1], [x - w * 0.5, top + cap + 8, 1], [x - w * 0.44, top + cap]], true, 0.18);
	const capD = sp([[x - w * 0.5, top + cap + 8, 1], [x + w * 0.5, top + cap + 8, 1], [x + w * 1.05, top + 18], [x + w * 1.1, top, 1], [x - w * 1.1, top, 1], [x - w * 1.05, top + 18]], true, 0.2);
	return <g>
		<path d={sh} fill="#E7D3A6" stroke={PAL.ink} strokeWidth={2.4} />
		{[-0.25, 0, 0.25].map((u) => <line key={u} x1={x + u * w} x2={x + u * w * 0.9} y1={gy - 4} y2={top + cap + 10} stroke="#B89A66" strokeWidth={1.4} />)}
		{[0.12, 0.16, 0.2].map((u, i) => <rect key={u} x={x - w * 0.5} y={top + cap + 8 + (gy - top - cap) * u - 30} width={w} height={7} fill={[PAL.blue, PAL.red, PAL.blue][i]} stroke={PAL.ink} strokeWidth={1} />)}
		<path d={capD} fill={PAL.green} stroke={PAL.ink} strokeWidth={2.4} />
		{[-0.8, -0.4, 0, 0.4, 0.8].map((u) => <path key={u} d={`M${x + u * w * 0.4} ${top + cap + 6}L${x + u * w * 1.05} ${top + 4}`} stroke={PAL.ink} strokeWidth={1.3} opacity={0.7} />)}
		<rect x={x - w * 1.1} y={top - 10} width={w * 2.2} height={10} fill={PAL.blue} stroke={PAL.ink} strokeWidth={2} />
	</g>;
};
/** the Hall of Two Truths' cornice: Ma'at feathers alternating with uraei over a band */
export const FeatherCornice: React.FC<{x0: number; x1: number; y: number; s?: number; t?: number}> = ({x0, x1, y, s = 1, t = 0}) => {
	const step = 34 * s, out: React.ReactNode[] = [];
	for (let i = 0, x = x0 + step / 2; x < x1; i++, x += step) out.push(i % 2 === 0
		? <g key={i} transform={`translate(${x},${y}) scale(${s})`}><path d={sp([[-2, 0, 1], [3, 0, 1], [5, -14], [3, -40], [-3, -46], [-9, -42], [-5, -37], [-3, -20]], true, 0.2)} fill={PAL.linen} stroke={PAL.ink} strokeWidth={1.8} /><path d="M0 -2Q2 -20 -1 -40" fill="none" stroke={PAL.line} strokeWidth={1} /></g>
		: <g key={i} transform={`translate(${x},${y}) scale(${s})`}><path d={sp([[-6, 0, 1], [6, 0, 1], [6, -12], [3, -22], [7, -30], [2, -34], [-4, -28], [-5, -16]], true, 0.2)} fill={PAL.gold} stroke={PAL.ink} strokeWidth={1.8} /><circle cx={1} cy={-40} r={6} fill={PAL.red} stroke={PAL.ink} strokeWidth={1.6} /><path d="M-2 -4L-2 -18" stroke={PAL.blue} strokeWidth={3} /></g>);
	return <g><rect x={x0} y={y} width={x1 - x0} height={14 * s} fill={PAL.gold} stroke={PAL.ink} strokeWidth={2} />
		{Array.from({length: Math.ceil((x1 - x0) / (22 * s))}, (_, i) => <rect key={i} x={x0 + i * 22 * s + 3} y={y + 3 * s} width={14 * s} height={8 * s} fill={[PAL.blue, PAL.red, PAL.green][i % 3]} />)}
		{out}</g>;
};
/** a row of seated judges built from symbols (one figure per head kind, repeated with <use>); each holds a knife, a feather on the head */
export const JUDGE_CASTS: Cast[] = [
	{...CAST.ani, name: 'jh', wig: 'tri', crown: 'maat', dress: 'mummy', collar: 'god', skin: 'skinM', bHand: 'fist', fHand: 'fist'},
	{...CAST.anubis, crown: 'maat', dress: 'mummy'}, {...CAST.horus, crown: 'maat', dress: 'mummy'},
	{...CAST.ani, name: 'jg', wig: 'tri', crown: 'maat', dress: 'mummy', collar: 'god', skin: 'skinO', skin2: 'skinO2', bHand: 'fist', fHand: 'fist'},
	{...CAST.thoth, crown: 'maat', dress: 'mummy'},
	{...CAST.ani, name: 'jy', wig: 'tri', crown: 'maat', dress: 'mummy', collar: 'god', skin: 'skinF', skin2: 'gold2', bHand: 'fist', fHand: 'fist'},
];
export const JudgeDefs: React.FC<{s: number; t?: number; prefix?: string}> = ({s, t = 0, prefix = 'jd'}) => <defs>{JUDGE_CASTS.map((cst, i) =>
	<g key={i} id={`${prefix}${i}`}>
		<path d={rect(-1.6 * s, -5.9 * s, 3.2 * s, 0)} fill={[PAL.blue, PAL.red, PAL.green][i % 3]} stroke={PAL.ink} strokeWidth={2} transform="translate(-3,0)" />
		<path d={rect(-1.9 * s, -6.3 * s, -1.0 * s, 0)} fill={PAL.gold} stroke={PAL.ink} strokeWidth={1.6} transform="translate(-3,0)" />
				<God id={`${prefix}g${i}`} cast={cst} pose={judgePose()} x={0} y={0} s={s} sec={{t: t + i * 0.7}} bProp="none" fProp={i % 2 ? 'knife' : 'none'} />
	</g>)}</defs>;
/** a row of n judges on a dais from x0 with spacing dx, ground gy; uses JudgeDefs symbols (render JudgeDefs once per scene) */
export const JudgeRow: React.FC<{x0: number; gy: number; n: number; dx: number; t?: number; face?: 1 | -1; prefix?: string; seed?: number; s: number}> = ({x0, gy, n, dx, t = 0, face = 1, prefix = 'jd', seed = 0, s}) => <g>
	<rect x={x0 - dx * 0.7} y={gy} width={dx * (n + 0.4)} height={14} fill={PAL.linen} stroke={PAL.ink} strokeWidth={2} />
	{Array.from({length: n}, (_, i) => { const k = (i * 5 + seed) % JUDGE_CASTS.length, x = x0 + i * dx, nod = 1.2 * Math.sin(t * 0.9 + i * 1.7);
		return <use key={i} href={`#${prefix}${k}`} transform={`translate(${x},${gy}) scale(${face},1) rotate(${nod} 0 ${-10 * s})`} />; })}
</g>;
/* ---------------- scrolls & the scribe's shop ---------------- */
/** a rolled papyrus lying on its side (ends visible), tied with a cord; x, y = centre; len px */
export const ScrollRoll: React.FC<{x: number; y: number; len: number; r?: number; a?: number; tie?: string}> = ({x, y, len, r = 11, a = 0, tie = PAL.red}) => <g transform={`translate(${x},${y}) rotate(${a})`}>
	<rect x={-len / 2} y={-r} width={len} height={r * 2} rx={r * 0.35} fill="#E8D19A" stroke={PAL.ink} strokeWidth={2} />
	<path d={`M${-len / 2 + 6} ${-r * 0.4}L${len / 2 - 6} ${-r * 0.4}`} stroke="#F6E7BE" strokeWidth={2.4} opacity={0.8} />
	<ellipse cx={len / 2} cy={0} rx={r * 0.42} ry={r} fill="#D9BC7A" stroke={PAL.ink} strokeWidth={1.8} /><ellipse cx={len / 2} cy={0} rx={r * 0.18} ry={r * 0.45} fill="none" stroke="#9A7A3A" strokeWidth={1.2} />
	<rect x={-len * 0.12} y={-r - 1} width={5} height={r * 2 + 2} fill={tie} stroke={PAL.ink} strokeWidth={1} />
	<rect x={len * 0.18} y={-r - 1} width={5} height={r * 2 + 2} fill={tie} stroke={PAL.ink} strokeWidth={1} />
</g>;
/** an unrolled Book of the Dead sheet: a vignette strip on top, columns of text, and BLANK spaces where the buyer's name goes
    (blank = 0..1 how strongly the empty spaces are pointed out) */
export const OpenScroll: React.FC<{x: number; y: number; w: number; h: number; t?: number; blank?: number; name?: number}> = ({x, y, w, h, t = 0, blank = 1, name = 0}) => {
		const R = rng(7), GK = Object.keys(GLYPH_D), cols: React.ReactNode[] = [], colW = 22, n = Math.floor((w - 40) / colW), vH = h * 0.34;
	const gaps = [4, 5, 12, 13].filter((g) => g < n), gapStarts = [4, 12].filter((g) => g + 1 < n);
	for (let i = 0; i < n; i++) { const cx_ = x + 24 + i * colW + colW / 2; cols.push(<line key={'r' + i} x1={x + 24 + i * colW} x2={x + 24 + i * colW} y1={y + vH + 16} y2={y + h - 16} stroke={PAL.ink} strokeWidth={1} opacity={0.55} />);
		for (let yy = y + vH + 24; yy < y + h - 28; yy += 18 + R() * 8) {
			const gap = gaps.includes(i) && yy > y + vH + 60 && yy < y + vH + 150;
			if (gap) continue;
						const g = GLYPH_D[GK[Math.floor(R() * GK.length)]];
			cols.push(<path key={`${i}.${yy}`} d={g.d} fill={i % 7 === 0 ? PAL.red : '#2A1912'} transform={`translate(${cx_ - 9},${yy - 9}) scale(18)`} />); } }
	const pulse = 0.6 + 0.4 * Math.sin(t * 3);
	return <g>
		<path d={sp([[x, y + 4, 1], [x + w, y, 1], [x + w + 3, y + h, 1], [x + 2, y + h + 4, 1]])} fill="#EBD7A4" stroke={PAL.ink} strokeWidth={2.4} />
		<rect x={x + 16} y={y + 14} width={w - 32} height={vH} fill="none" stroke={PAL.ink} strokeWidth={1.6} />
		{/* the vignette in ink and red: a tiny weighing (balance, a jackal, a figure) */}
		<g transform={`translate(${x + w * 0.5},${y + 14 + vH}) scale(${vH / 120})`} fill="none" stroke={PAL.ink} strokeWidth={2.4}>
			<path d="M0 0L0 -96M-50 -88L50 -84M-50 -88L-62 -58M-50 -88L-38 -58M50 -84L38 -54M50 -84L62 -54M-68 -58L-32 -58M32 -54L68 -54" />
			<circle cx={-50} cy={-66} r={6} fill={PAL.red} /><path d="M50 -58Q56 -74 46 -80" />
			<path d="M-120 0L-118 -60L-104 -78L-96 -66L-104 -52L-104 0M-130 -44L-104 -50" /><circle cx={-110} cy={-84} r={8} />
			<path d="M96 0L98 -56L112 -70L132 -78L120 -64L116 -50L118 0" /><path d="M-24 0L-16 -40L-8 0" stroke={PAL.red} />
		</g>
		{cols}
		{gapStarts.map((g, i) => { const gx = x + 24 + g * colW2 + 2, gy = y + vH + 56, colW2 = colW * 2;
			return <g key={i}>
												<rect x={gx} y={gy} width={colW2 - 4} height={96} rx={4} fill={name > 0 ? 'none' : '#FFF6DC'} stroke={PAL.ink} strokeWidth={5} opacity={blank * (0.35 + 0.3 * pulse)} />
				<rect x={gx} y={gy} width={colW2 - 4} height={96} rx={4} fill="none" stroke="#FFFFFF" strokeWidth={3} opacity={blank * (0.5 + 0.5 * pulse)} />
				{name <= 0 && <ellipse cx={gx + colW2 / 2 - 2} cy={gy + 48} rx={12} ry={38} fill="none" stroke={PAL.red} strokeWidth={1.4} opacity={blank * 0.45} />}
				{blank > 0 && <rect x={gx - 3} y={gy - 3} width={colW2 + 2} height={102} rx={6} fill="url(#g60-gold)" opacity={blank * 0.6 * pulse} style={{mixBlendMode: 'screen'}} />}
				{name > 0 && <g opacity={name}>{[0, 1, 2].map((k) => <ellipse key={k} cx={gx + colW2 / 2 - 2} cy={gy + 18 + k * 28} rx={6} ry={4} fill="none" stroke={PAL.red} strokeWidth={2} />)}</g>}
			</g>; })}
		{/* the rolled ends */}
		<rect x={x - 12} y={y - 6} width={20} height={h + 16} rx={9} fill="#D9BC7A" stroke={PAL.ink} strokeWidth={2} />
		<rect x={x + w - 6} y={y - 8} width={20} height={h + 16} rx={9} fill="#D9BC7A" stroke={PAL.ink} strokeWidth={2} />
	</g>;
};
/** wooden pigeonhole shelf full of rolled scrolls */
export const ScrollShelf: React.FC<{x: number; y: number; w: number; h: number; rows?: number; cols?: number; seed?: number}> = ({x, y, w, h, rows = 4, cols = 3, seed = 4}) => {
	const R = rng(seed), cw = w / cols, rh = h / rows, out: React.ReactNode[] = [];
	for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const n = 2 + Math.floor(R() * 3);
		for (let k = 0; k < n; k++) out.push(<ScrollRoll key={`${i}.${j}.${k}`} x={x + i * cw + cw / 2 + (R() - 0.5) * 8} y={y + j * rh + rh - 12 - k * 14} len={cw - 22 - R() * 10} r={7} tie={[PAL.red, PAL.blue, PAL.green][Math.floor(R() * 3)]} />); }
	return <g>
		<rect x={x - 10} y={y - 14} width={w + 20} height={h + 22} fill="#8A5A2E" stroke={PAL.ink} strokeWidth={2.4} />
		<rect x={x} y={y} width={w} height={h} fill="#3A2416" />
		{out}
		{Array.from({length: rows + 1}, (_, j) => <rect key={'h' + j} x={x - 10} y={y + j * rh - 4} width={w + 20} height={8} fill="#A86E3A" stroke={PAL.ink} strokeWidth={1.6} />)}
		{Array.from({length: cols + 1}, (_, i) => <rect key={'v' + i} x={x + i * cw - 4} y={y - 4} width={8} height={h + 8} fill="#A86E3A" stroke={PAL.ink} strokeWidth={1.6} />)}
	</g>;
};
/** a striped linen awning on two poles */
export const Awning: React.FC<{x0: number; x1: number; y: number; gy: number; t: number}> = ({x0, x1, y, gy, t}) => {
	const n = 10, w = (x1 - x0) / n, wave = (i: number) => 4 * Math.sin(t * 1.6 + i * 0.7);
	return <g>
		{[x0 + 14, x1 - 14].map((px) => <path key={px} d={poly([[px - 6, gy], [px + 6, gy], [px + 5, y], [px - 5, y]])} fill="#9A6A3A" stroke={PAL.ink} strokeWidth={2} />)}
		<path d={poly([[x0 - 20, y], [x1 + 20, y], [x1 + 30, y - 40], [x0 - 30, y - 40]])} fill="#F1E3C2" stroke={PAL.ink} strokeWidth={2.4} />
		{Array.from({length: n + 2}, (_, i) => i % 2 ? <path key={i} d={poly([[x0 - 30 + i * (w + 5), y - 40], [x0 - 30 + (i + 1) * (w + 5), y - 40], [x0 - 20 + (i + 1) * w, y], [x0 - 20 + i * w, y]])} fill={PAL.red} opacity={0.85} /> : null)}
		{Array.from({length: n + 1}, (_, i) => <path key={'v' + i} d={`M${x0 - 20 + i * w + w * 0.0} ${y}Q${x0 - 20 + i * w + w / 2} ${y + 18 + wave(i)} ${x0 - 20 + (i + 1) * w} ${y}`} fill={i % 2 ? PAL.red : '#F1E3C2'} stroke={PAL.ink} strokeWidth={1.8} />)}
	</g>;
};
/** a woven basket (side view) */
export const Basket: React.FC<{x: number; y: number; w: number; h: number; fill?: string}> = ({x, y, w, h, fill}) => <g>
	{fill && <ellipse cx={x} cy={y - h} rx={w * 0.48} ry={h * 0.3} fill={fill} stroke={PAL.ink} strokeWidth={1.6} />}
	<path d={sp([[x - w / 2, y - h, 1], [x + w / 2, y - h, 1], [x + w * 0.42, y - h * 0.3], [x + w * 0.3, y, 1], [x - w * 0.3, y, 1], [x - w * 0.42, y - h * 0.3]], true, 0.2)} fill="#C08A3E" stroke={PAL.ink} strokeWidth={2} />
	{[0.25, 0.5, 0.75].map((u) => <path key={u} d={`M${x - w * (0.5 - u * 0.12)} ${y - h + u * h}L${x + w * (0.5 - u * 0.12)} ${y - h + u * h}`} stroke="#8A5A2E" strokeWidth={1.6} />)}
	{Array.from({length: 7}, (_, i) => <path key={i} d={`M${x - w * 0.45 + i * w * 0.15} ${y - h + 2}L${x - w * 0.3 + i * w * 0.1} ${y - 2}`} stroke="#8A5A2E" strokeWidth={1.2} opacity={0.7} />)}
</g>;
export {POSES};
export const _unused = {T, R, chain, ap, sm};

/* ---------------- the Field of Reeds: oxen, the plough, a papyrus skiff ---------------- */
/** an ox in profile facing +x (Egyptian cattle: white hide with black patches, lyre horns), walking (ph radians); origin = ground under the chest */
export const Ox: React.FC<{x: number; y: number; s: number; ph?: number; t?: number; hide?: 'spot' | 'red'; flip?: 1 | -1}> = ({x, y, s, ph = 0, t = 0, hide = 'spot', flip = 1}) => {
	const c = cx(s), bob = 0.12 * Math.cos(ph * 2), nod = 3 * Math.sin(ph * 2 + 0.6);
	const body = sp([[-7.2, -7.6], [-4.2, -8.3], [-0.6, -8.2], [1.6, -8.9], [3.2, -8.6], [3.6, -7.0], [3.4, -5.2], [2.8, -4.2], [0.4, -4.0], [-3.2, -4.1], [-6.4, -4.6], [-7.6, -5.8]], true, 0.18);
	const leg = (hx: number, a: number, k: string, front: boolean) => { const knee = front ? -2.4 : -2.6;
		return <g key={k} transform={`translate(${hx},-4.6) rotate(${a})`}><Solid d={sp([[-0.55, -0.4, 1], [0.55, -0.4, 1], [0.42, 2.2], [0.3, 4.0], [0.42, 4.6, 1], [-0.42, 4.6, 1], [-0.28, 4.0], [front ? -0.3 : -0.55, 2.2 + knee * 0.05]], true, 0.18)} r={hide === 'red' ? '#A85A32' : '#EFE6D2'} c={c} />
			<path d={poly([[-0.42, 4.25], [0.44, 4.25], [0.46, 4.62], [-0.44, 4.62]])} fill={PAL.ink} /></g>; };
	const sw = (o: number) => 16 * Math.sin(ph + o);
	const head = sp([[0, 0], [0.9, -0.6], [2.6, 0.2], [3.4, 1.4], [3.3, 2.1], [2.6, 2.3], [1.6, 1.9], [0.2, 1.6], [-0.6, 0.8]], true, 0.2);
	const tail = sp([[-7.3, -7.2], [-7.0, -7.4], [-7.9, -4.6], [-7.6, -3.0], [-8.1, -2.6], [-8.3, -3.2], [-8.25, -4.6]], true, 0.2);
	const fill = hide === 'red' ? '#B5643A' : '#F1E9D6';
	return <g transform={`translate(${x},${y - bob * s}) scale(${s * flip},${s})`}>
		<Solid d={tail} r={fill} c={c} />
		{leg(-5.6, sw(Math.PI) * 0.8, 'lb', false)}{leg(1.8, sw(0) * 0.8, 'lf', true)}
		<Solid d={body} r={fill} c={c} />
		{hide === 'spot' && [[-5.0, -6.8, 1.2, 0.9], [-1.8, -7.4, 1.5, 0.8], [0.8, -5.4, 1.0, 0.7], [-3.6, -5.1, 0.9, 0.6]].map(([a, b, rx, ry], i) => <ellipse key={i} cx={a} cy={b} rx={rx} ry={ry} fill="#2A2224" />)}
		<path d="M-6.8 -5.0Q-3 -3.6 2.6 -4.4" fill="none" stroke={PAL.ink} strokeWidth={c.LW} opacity={0.5} />
		{leg(-4.6, sw(0) * 0.8, 'rb', false)}{leg(2.6, sw(Math.PI) * 0.8, 'rf', true)}
		<g transform={`translate(3.0,-7.4) rotate(${nod + 18})`}>
			<path d={sp([[0.2, 0.0], [-0.6, -1.2], [-0.2, -2.4], [0.5, -2.9], [0.8, -2.6], [0.3, -2.2], [0.1, -1.2], [0.8, -0.2]], true, 0.2)} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.OW * 1.3} />
			<path d={sp([[1.0, 0.0], [1.6, -1.2], [1.4, -2.5], [0.9, -3.0], [0.75, -2.7], [1.1, -2.3], [1.15, -1.2], [0.6, -0.2]], true, 0.2)} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.OW * 1.3} />
			<Solid d={head} r={fill} c={c} />
			<circle cx={1.5} cy={0.5} r={0.18} fill={PAL.ink} />
			<path d="M3.0 1.6L3.25 1.75" stroke={PAL.ink} strokeWidth={c.LW * 1.4} />
			<ellipse cx={0.4} cy={0.15} rx={0.5} ry={0.25} fill={fill} stroke={PAL.ink} strokeWidth={c.LW} transform="rotate(-30 0.4 0.15)" />
		</g>
	</g>;
};
/** the ard plough: beam from the yoke (front) down to the share, two handles back to the ploughman; px points */
export const Plough: React.FC<{yoke: V; share: V; grip: V}> = ({yoke, share, grip}) => <g>
	<path d={`M${yoke[0]} ${yoke[1]}L${share[0]} ${share[1]}`} stroke={PAL.ink} strokeWidth={9} strokeLinecap="round" /><path d={`M${yoke[0]} ${yoke[1]}L${share[0]} ${share[1]}`} stroke={PAL.wood} strokeWidth={5.5} strokeLinecap="round" />
	{[0, 9].map((o) => <g key={o}><path d={`M${share[0]} ${share[1]}L${grip[0] + o} ${grip[1] - o * 0.3}`} stroke={PAL.ink} strokeWidth={8} strokeLinecap="round" /><path d={`M${share[0]} ${share[1]}L${grip[0] + o} ${grip[1] - o * 0.3}`} stroke={PAL.wood} strokeWidth={4.5} strokeLinecap="round" /></g>)}
	<path d={poly([[share[0] - 4, share[1] - 6], [share[0] + 26, share[1] + 4], [share[0] - 2, share[1] + 8]])} fill="#8A8278" stroke={PAL.ink} strokeWidth={2} />
	<path d={`M${yoke[0] - 34} ${yoke[1] - 6}Q${yoke[0]} ${yoke[1] + 8} ${yoke[0] + 30} ${yoke[1] - 8}`} fill="none" stroke={PAL.ink} strokeWidth={8} /><path d={`M${yoke[0] - 34} ${yoke[1] - 6}Q${yoke[0]} ${yoke[1] + 8} ${yoke[0] + 30} ${yoke[1] - 8}`} fill="none" stroke={PAL.wood} strokeWidth={4.5} />
</g>;
/** a papyrus skiff (no shrine), faces +x; origin = waterline centre; len in units */
export const Skiff: React.FC<{x: number; y: number; s: number; t: number; len?: number}> = ({x, y, s, t, len = 11}) => {
	const c = cx(s), L = len / 2, rock = 1.5 * Math.sin(t * 1.2), bob = 0.15 * Math.sin(t * 1.7);
	const hull = sp([[-L - 1.2, -3.2], [-L, -1.2], [-L * 0.6, 0.2], [0, 0.6], [L * 0.6, 0.2], [L, -1.2], [L + 1.4, -3.6], [L + 1.7, -3.9], [L + 1.5, -2.8], [L + 0.6, -0.2], [L * 0.6, 1.2], [0, 1.6], [-L * 0.6, 1.2], [-L - 0.4, -0.2], [-L - 1.4, -3.0], [-L - 1.6, -3.4]], true, 0.18);
	return <g transform={`translate(${x},${y + bob * s}) rotate(${rock}) scale(${s})`}>
		<Solid d={hull} r="green" c={c} />
		{Array.from({length: Math.round(len)}, (_, i) => <path key={i} d={`M${-L + 0.5 + i} ${0.1 + Math.abs(-L + 0.5 + i) * -0.04}L${-L + 0.8 + i} ${1.2 - Math.abs(-L + 0.5 + i) * 0.05}`} stroke={PAL.ink} strokeWidth={c.LW * 1.6} />)}
		<path d={`M${-L} -0.4Q0 1.0 ${L} -0.4`} fill="none" stroke={PAL.gold} strokeWidth={c.LW * 3} />
	</g>;
};
