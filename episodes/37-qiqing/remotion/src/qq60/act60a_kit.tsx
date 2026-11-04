import React from 'react';
import {Cam, FW, PIC_CY, rng} from './frame60';
import {PAL, sp, poly, lerp, cl, sm, V, M, T, R, chain, ap, mx, Pt} from './geo60';
import {band} from './rig60';
import {Heart, Feather, Baboon, BAL, balanceGeo, BalancePose, GLYPH_D} from './props60';
import {Mummy} from './props60b';

/* ep60 act A (shots 1–14) · shared helpers: cameras, pulses, the frontal Anubis mask (hook), the cartoon puff, the giant balance
   (a copy of props60 Balance with an optional heart, glow and beaded cords), the big mummy whose heart glows through the linen,
   the ba bird, a simple reed pen and an arm. */

/* ---------------- time helpers ---------------- */
/** 0 before t0, quick rise over `a`, exponential decay with time constant `d` */
export const pulse = (t: number, t0: number, a = 0.05, d = 0.3) => (t < t0 ? 0 : sm((t - t0) / a) * Math.exp(-Math.max(0, t - t0 - a) / d));
export const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
/** camera that keeps world point (wx, wy) at screen point (sx, sy) at zoom z */
export const aim = (wx: number, wy: number, sx: number, sy: number, z: number): Cam => ({x: wx - (sx - FW / 2) / z, y: wy - (sy - PIC_CY) / z, z});
/** keys [t, wx, wy, sx, sy, z]: interpolates the aimed world point and its screen point linearly and the zoom in log space (smooth ease) */
export type AimKey = [number, number, number, number, number, number];
export const aimPath = (t: number, keys: AimKey[], ease: (u: number) => number = sm): Cam => {
	const k0 = keys[0];
	if (t <= k0[0]) return aim(k0[1], k0[2], k0[3], k0[4], k0[5]);
	for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const a = keys[i - 1], b = keys[i], u = ease((t - a[0]) / (b[0] - a[0]));
		return aim(lerp(a[1], b[1], u), lerp(a[2], b[2], u), lerp(a[3], b[3], u), lerp(a[4], b[4], u), Math.exp(lerp(Math.log(a[5]), Math.log(b[5]), u))); }
	const k = keys[keys.length - 1]; return aim(k[1], k[2], k[3], k[4], k[5]);
};
/** wear/stain that do not grow with zoom (build60: lower them when cam.z > 1.3) */
export const wearAt = (z: number, w: number) => w * cl(1.3 / Math.max(1, z), 0.25, 1);

/* ---------------- gold & lacquer gradients (prefix per shot so dissolves never share ids) ---------------- */
export const GoldDefs: React.FC<{id: string}> = ({id}) => <defs>
	<linearGradient id={`${id}-gold`} x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stopColor="#FFF3BE" /><stop offset="0.28" stopColor="#F6CB55" /><stop offset="0.62" stopColor="#C98B1C" /><stop offset="0.85" stopColor="#F0C860" /><stop offset="1" stopColor="#A86F12" /></linearGradient>
	<linearGradient id={`${id}-goldH`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#B57A14" /><stop offset="0.3" stopColor="#FBE08A" /><stop offset="0.55" stopColor="#E0A93A" /><stop offset="1" stopColor="#9C6810" /></linearGradient>
	<radialGradient id={`${id}-lacq`} cx="0.36" cy="0.3" r="0.85"><stop offset="0" stopColor="#3E4566" /><stop offset="0.45" stopColor="#17161F" /><stop offset="1" stopColor="#08070B" /></radialGradient>
	<radialGradient id={`${id}-iris`} cx="0.45" cy="0.45" r="0.6"><stop offset="0" stopColor="#FFF4B0" /><stop offset="0.35" stopColor="#FFC93C" /><stop offset="0.8" stopColor="#D9761A" /><stop offset="1" stopColor="#7A3A08" /></radialGradient>
	<radialGradient id={`${id}-shade`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#01030C" stopOpacity={0.92} /><stop offset="0.6" stopColor="#01030C" stopOpacity={0.6} /><stop offset="1" stopColor="#01030C" stopOpacity={0} /></radialGradient>
	<radialGradient id={`${id}-heart`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFF0B0" /><stop offset="0.25" stopColor="#FFB040" /><stop offset="0.6" stopColor="#E0401C" stopOpacity={0.75} /><stop offset="1" stopColor="#900A0A" stopOpacity={0} /></radialGradient>
</defs>;

/* ---------------- the hook's frontal Anubis mask (units; origin between the eyes, y down; ears to y ≈ -4.4, chin y ≈ 3) ---------------- */
const MIR = (pts: Pt[]): Pt[] => pts.map((p) => (p[2] ? [-p[0], p[1], 1] : [-p[0], p[1]]) as Pt);
const earL: Pt[] = [[-1.58, -0.45, 1], [-1.86, -1.7], [-1.95, -3.0], [-1.8, -4.45, 1], [-1.26, -3.2], [-0.78, -2.15], [-0.34, -1.45, 1]];
const earInL: Pt[] = [[-1.44, -0.95, 1], [-1.66, -2.0], [-1.72, -3.05], [-1.68, -3.92, 1], [-1.26, -2.95], [-0.88, -2.05], [-0.6, -1.56, 1]];
const headPts: Pt[] = [[0, -1.72], [0.48, -1.62], [1.12, -1.32], [1.58, -0.62], [1.56, 0.25], [1.2, 0.95], [0.86, 1.6], [0.66, 2.2], [0.5, 2.72], [0.22, 3.0], [0, 3.04], [-0.22, 3.0], [-0.5, 2.72], [-0.66, 2.2], [-0.86, 1.6], [-1.2, 0.95], [-1.56, 0.25], [-1.58, -0.62], [-1.12, -1.32], [-0.48, -1.62]];
const lappetL: Pt[] = [[-0.9, -1.45], [-1.7, -1.05], [-2.25, 0.0], [-2.5, 1.5], [-2.66, 3.2], [-2.78, 4.6, 1], [-1.36, 4.7, 1], [-1.24, 3.4], [-1.0, 2.4], [-1.12, 1.3], [-1.4, 0.5]];
const eyeL = (o = 0): Pt[] => [[-0.3, 0.14 + o, 1], [-0.58, -0.12 + o], [-0.92, -0.26 + o], [-1.18, -0.36 + o, 1], [-0.98, -0.02 + o], [-0.62, 0.15 + o]];
export const MaskFront: React.FC<{x: number; y: number; s: number; t: number; id: string; glint?: number; flare?: number}> = ({x, y, s, t, id, glint = 0, flare = 0}) => {
	const lw = 2.6 / s, gold = `url(#${id}-gold)`, lacq = `url(#${id}-lacq)`;
	const head = sp(headPts, true, 0.17), lap = (k: number) => sp(k > 0 ? MIR(lappetL) : lappetL, true, 0.16);
	const ear = (k: number) => <g key={k}>
		<path d={sp(k > 0 ? MIR(earL) : earL, true, 0.16)} fill={lacq} stroke={PAL.ink} strokeWidth={lw * 2} strokeLinejoin="round" />
		<path d={sp(k > 0 ? MIR(earInL) : earInL, true, 0.16)} fill={gold} stroke={PAL.ink} strokeWidth={lw} />
		<path d={`M${k * 1.18} -1.4Q${k * 1.5} -2.5 ${k * 1.58} -3.6`} fill="none" stroke="#7A4A10" strokeWidth={lw * 2.2} strokeLinecap="round" opacity={0.7} />
		<path d={`M${k * 1.02} -1.55L${k * 1.42} -2.9`} stroke={PAL.blue} strokeWidth={lw * 3} strokeLinecap="round" opacity={0.8} />
	</g>;
	// lappets: lapis and gold stripes clipped to the shape
	const stripes = (k: number) => { const out: React.ReactNode[] = []; for (let i = 0; i < 26; i++) { const yy = -1.6 + i * 0.25;
		out.push(<path key={i} d={poly([[k * 0.6, yy + 0.04 * k], [k * 3.0, yy - 0.18], [k * 3.0, yy - 0.06], [k * 0.6, yy + 0.16]])} fill={gold} />); } return out; };
	const eyeC = [-0.74, -0.1] as V;
	const eye = (k: number) => { const pts = eyeL(); const d = sp(k > 0 ? MIR(pts) : pts, true, 0.18), ex = eyeC[0] * (k > 0 ? -1 : 1);
		return <g key={k}>
			{/* gold rim + kohl tail toward the ear */}
			<path d={sp(k > 0 ? MIR([[-0.22, 0.2, 1], [-0.6, -0.22], [-1.0, -0.4], [-1.52, -0.72, 1], [-1.3, -0.38], [-1.06, 0.06], [-0.62, 0.26]]) : [[-0.22, 0.2, 1], [-0.6, -0.22], [-1.0, -0.4], [-1.52, -0.72, 1], [-1.3, -0.38], [-1.06, 0.06], [-0.62, 0.26]], true, 0.16)} fill={gold} stroke={PAL.ink} strokeWidth={lw} />
			<path d={d} fill={`url(#${id}-iris)`} stroke={PAL.ink} strokeWidth={lw * 1.3} />
			<ellipse cx={ex} cy={eyeC[1] - 0.02} rx={0.13} ry={0.16} fill="#160A04" />
			<circle cx={ex + 0.08 * (k > 0 ? -1 : 1) + 0.02 * Math.sin(t * 2.1)} cy={eyeC[1] - 0.09} r={0.055} fill="#FFFFFF" />
			{/* brow */}
			<path d={sp(k > 0 ? MIR([[-0.26, -0.3, 1], [-0.7, -0.56], [-1.2, -0.72], [-1.5, -0.96, 1], [-1.14, -0.86], [-0.68, -0.72], [-0.3, -0.44, 1]]) : [[-0.26, -0.3, 1], [-0.7, -0.56], [-1.2, -0.72], [-1.5, -0.96, 1], [-1.14, -0.86], [-0.68, -0.72], [-0.3, -0.44, 1]], true, 0.16)} fill={gold} stroke={PAL.ink} strokeWidth={lw * 0.8} />
		</g>; };
	const gl = 0.55 + 0.25 * Math.sin(t * 7.3) * Math.sin(t * 3.1) + flare;
	return <g transform={`translate(${x},${y}) scale(${s})`}>
		<clipPath id={`${id}-lapL`}><path d={lap(-1)} /></clipPath><clipPath id={`${id}-lapR`}><path d={lap(1)} /></clipPath>
		{/* neck, lappets, ears behind the head */}
		<path d={poly([[-1.15, 1.8], [1.15, 1.8], [1.3, 4.8], [-1.3, 4.8]])} fill={lacq} stroke={PAL.ink} strokeWidth={lw * 2} />
		{[-1, 1].map((k) => <g key={k}><path d={lap(k)} fill="#1C3A92" stroke={PAL.ink} strokeWidth={lw * 2} strokeLinejoin="round" />
			<g clipPath={`url(#${id}-lap${k > 0 ? 'R' : 'L'})`}>{stripes(k)}<rect x={k > 0 ? 1.2 : -2.9} y={4.1} width={1.7} height={0.22} fill={PAL.red} /></g>
			<path d={lap(k)} fill="none" stroke={PAL.ink} strokeWidth={lw * 2} strokeLinejoin="round" /></g>)}
		{/* the broad collar under the chin */}
		{([[0.9, 1.15, gold], [1.15, 1.55, '#2C52B0'], [1.55, 1.7, gold], [1.7, 2.1, '#C2381E'], [2.1, 2.24, gold], [2.24, 2.65, '#2FA39A'], [2.65, 2.82, gold]] as [number, number, string][]).map(([r0, r1, c], i) =>
			<path key={i} d={band(0, 2.62, r0, r1, 0.62)} fill={c} stroke={PAL.ink} strokeWidth={lw} />)}
		{ear(-1)}{ear(1)}
		{/* the head: black lacquer, gold fillet, gold muzzle lines */}
		<path d={head} fill={lacq} stroke={PAL.ink} strokeWidth={lw * 2.4} strokeLinejoin="round" />
		<path d={head} fill="none" stroke="#5A6390" strokeWidth={lw * 1.2} opacity={0.5} transform="translate(-0.03,-0.03)" />
		<path d="M-1.36 -0.92Q0 -1.62 1.36 -0.92L1.4 -0.7Q0 -1.36 -1.4 -0.7Z" fill={gold} stroke={PAL.ink} strokeWidth={lw} />
		{[-0.9, -0.3, 0.3, 0.9].map((xx) => <rect key={xx} x={xx - 0.08} y={-1.22 + Math.abs(xx) * 0.27} width={0.16} height={0.14} fill={xx % 0.6 ? '#2C52B0' : '#C2381E'} transform={`rotate(${xx * 18} ${xx} ${-1.15 + Math.abs(xx) * 0.27})`} />)}
		<path d="M0 -0.82L0 2.2" stroke={gold} strokeWidth={lw * 2.4} strokeLinecap="round" />
		{[-1, 1].map((k) => <path key={k} d={`M${k * 0.3} 0.32Q${k * 0.56} 1.3 ${k * 0.44} 2.28`} fill="none" stroke={gold} strokeWidth={lw * 2} strokeLinecap="round" />)}
		{[-1, 1].map((k) => <path key={'c' + k} d={`M${k * 1.5} 0.3Q${k * 1.05} 1.0 ${k * 0.74} 1.95`} fill="none" stroke={gold} strokeWidth={lw * 1.6} strokeLinecap="round" opacity={0.85} />)}
		{eye(-1)}{eye(1)}
		{/* nose and mouth */}
		<path d={sp([[-0.42, 2.18], [0, 2.08], [0.42, 2.18], [0.36, 2.48], [0, 2.66], [-0.36, 2.48]], true, 0.2)} fill="#0B0A0E" stroke={gold} strokeWidth={lw * 1.4} />
		<ellipse cx={-0.12} cy={2.22} rx={0.13} ry={0.05} fill="#9FB0E0" opacity={0.7} />
		<path d="M0 2.66L0 2.86M-0.34 2.92Q0 2.82 0.34 2.92" fill="none" stroke={gold} strokeWidth={lw * 1.4} strokeLinecap="round" />
		{/* torchlight in the eyes + the frame-0 glint */}
		<g style={{mixBlendMode: 'screen'}}>
			{[-1, 1].map((k) => <ellipse key={k} cx={k * 0.74} cy={-0.1} rx={0.62} ry={0.42} fill="url(#g60-gold)" opacity={cl(gl, 0, 1.4) * 0.75} />)}
			{glint > 0 && <g opacity={glint} transform={`translate(-1.12,-0.36) rotate(${18 * glint}) scale(${0.35 + 0.75 * glint})`}><path d="M0 -1L0.1 -0.1L1 0L0.1 0.1L0 1L-0.1 0.1L-1 0L-0.1 -0.1Z" fill="#FFFBE6" /><circle r={0.35} fill="url(#g60-white)" /></g>}
		</g>
	</g>;
};

/* ---------------- the cartoon grey puff (no anatomy: a cloud knot with a squiggle) ---------------- */
export const Puff: React.FC<{x: number; y: number; r: number; a?: number; sq?: number; o?: number}> = ({x, y, r, a = 0, sq = 0, o = 1}) => {
	const pts: Pt[] = Array.from({length: 12}, (_, i) => { const an = (i / 12) * Math.PI * 2, rr = i % 2 ? 0.8 : 1.04; return [Math.cos(an) * rr * 1.15, Math.sin(an) * rr * 0.92] as Pt; });
	return <g transform={`translate(${x},${y}) rotate(${a}) scale(${r * (1 + sq)},${r * (1 - sq)})`} opacity={o}>
		<path d={sp(pts, true, 0.24)} fill="#AEB4BE" stroke={PAL.ink} strokeWidth={0.09} strokeLinejoin="round" />
		<path d="M-0.7 -0.1Q-0.45 -0.5 -0.15 -0.15Q0.1 0.2 0.35 -0.2Q0.55 -0.5 0.75 -0.1" fill="none" stroke="#6E7682" strokeWidth={0.09} strokeLinecap="round" />
		<path d="M-0.45 0.35Q-0.2 0.1 0.05 0.38Q0.3 0.62 0.5 0.32" fill="none" stroke="#6E7682" strokeWidth={0.08} strokeLinecap="round" />
		<ellipse cx={-0.42} cy={-0.5} rx={0.3} ry={0.14} fill="#E6E9EE" opacity={0.8} transform="rotate(-20 -0.42 -0.5)" />
	</g>;
};

/* ---------------- the giant balance (copy of props60 Balance): optional heart, glow, beaded cords ---------------- */
type C = {OW: number; LW: number};
const Solid: React.FC<{d: string; r: string; c: C; k?: number}> = ({d, r, c, k = 1}) => <g>
	<path d={d} fill={PAL.ink} stroke={PAL.ink} strokeWidth={2 * c.OW * k} strokeLinejoin="round" /><path d={d} fill={(PAL as Record<string, string>)[r] ?? r} /></g>;
const rect = (x0: number, y0: number, x1: number, y1: number) => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
export const BigBalance: React.FC<{p: BalancePose; x: number; y: number; s: number; t?: number; heart?: boolean; heartGlow?: number; featherA?: number; gold?: string; baboon?: boolean}> = ({p, x, y, s, t = 0, heart = true, heartGlow = 0, featherA = 0, gold, baboon = true}) => {
	const c = {OW: 2.7 / s, LW: 1.5 / s}, g = balanceGeo(p), G = gold ?? PAL.gold;
	const post = poly([[-0.36, -1.75], [0.36, -1.75], [0.3, BAL.postTop + 0.6], [-0.3, BAL.postTop + 0.6]]);
	const capital = sp([[-0.3, BAL.postTop + 0.62, 1], [0.3, BAL.postTop + 0.62, 1], [0.95, BAL.postTop + 0.05], [1.05, BAL.postTop - 0.1, 1], [-1.05, BAL.postTop - 0.1, 1], [-0.95, BAL.postTop + 0.05]]);
	const abacus = rect(-1.3, BAL.postTop - 0.45, 1.3, BAL.postTop - 0.1);
	const beamD = sp([[-BAL.half - 0.2, -0.24, 1], [BAL.half + 0.2, -0.24, 1], [BAL.half + 0.2, 0.24, 1], [-BAL.half - 0.2, 0.24, 1]]);
	const bud = (sg: number) => sp([[sg * (BAL.half + 0.15), -0.32], [sg * (BAL.half + 0.65), -0.42], [sg * (BAL.half + 0.98), 0], [sg * (BAL.half + 0.65), 0.42], [sg * (BAL.half + 0.15), 0.32]]);
	const panD = sp([[-2.05, 0, 1], [2.05, 0, 1], [1.6, 0.5], [0.7, 0.74], [-0.7, 0.74], [-1.6, 0.5]], true, 0.2);
	const cords = (pm: M, e: V, k: string) => <g key={k}>{[-1.85, -0.6, 0.6, 1.85].map((u) => { const q = ap(pm, [u, 0]);
		const n = 12, beads = Array.from({length: n}, (_, i) => { const f = (i + 0.5) / n; return <circle key={i} cx={lerp(e[0], q[0], f)} cy={lerp(e[1], q[1], f)} r={0.075} fill={G} stroke={PAL.ink} strokeWidth={c.LW * 0.5} />; });
		return <g key={u}><line x1={e[0]} y1={e[1]} x2={q[0]} y2={q[1]} stroke={PAL.ink} strokeWidth={c.LW * 1.4} />{beads}</g>; })}</g>;
	const bands = [-4.5, -8.5, -12.5, -16.5].map((yy) => <g key={yy}><rect x={-0.37} y={yy} width={0.74} height={0.55} fill={PAL.blue} stroke={PAL.ink} strokeWidth={c.LW * 0.8} /><rect x={-0.37} y={yy + 0.55} width={0.74} height={0.22} fill={PAL.red} stroke={PAL.ink} strokeWidth={c.LW * 0.8} /></g>);
	return <g transform={`translate(${x},${y}) scale(${s})`}>
		<Solid d={rect(-2.5, -0.9, 2.5, 0)} r="linen" c={c} /><Solid d={rect(-1.7, -1.75, 1.7, -0.9)} r="linen" c={c} />
		{[-2.0, -1.0, 0, 1.0].map((xx, i) => <rect key={xx} x={xx + 0.08} y={-0.72} width={0.84} height={0.55} fill={[PAL.blue, PAL.red, PAL.green, PAL.blue][i]} stroke={PAL.ink} strokeWidth={c.LW * 0.8} />)}
		<rect x={-1.5} y={-1.5} width={3.0} height={0.22} fill={PAL.red} />
		<Solid d={post} r={G} c={c} />{bands}
		<Solid d={capital} r="green" c={c} />{[-0.6, -0.2, 0.2, 0.6].map((xx) => <line key={xx} x1={xx * 0.4} y1={BAL.postTop + 0.6} x2={xx * 1.5} y2={BAL.postTop - 0.05} stroke={PAL.ink} strokeWidth={c.LW * 0.8} />)}
		<Solid d={abacus} r={G} c={c} />
		{baboon && <g transform={`translate(0.15,${BAL.postTop - 0.45}) scale(-1,1)`}><Baboon c={c} t={t} look={p.look ?? 0} /></g>}
		<path d={rect(0, BAL.plumbY - 0.12, BAL.plumbX + 0.12, BAL.plumbY + 0.12)} fill={G} stroke={PAL.ink} strokeWidth={c.LW} />
		<line x1={BAL.plumbX} y1={BAL.plumbY} x2={g.bob[0]} y2={g.bob[1]} stroke={PAL.ink} strokeWidth={c.LW * 1.2} />
		<g transform={`translate(${g.bob[0]},${g.bob[1]}) rotate(${-(p.plumb ?? 0)})`}><Solid d={sp([[0, -0.1], [0.32, 0.22], [0.36, 0.55], [0, 0.95, 1], [-0.36, 0.55], [-0.32, 0.22]])} r={G} c={c} /><circle cx={0} cy={0.45} r={0.12} fill={PAL.red} /></g>
		{cords(g.panL, g.eL, 'cl')}{cords(g.panR, g.eR, 'cr')}
		<g transform={mx(g.panL)}>
			{heart && heartGlow > 0 && <ellipse cx={0} cy={-0.9} rx={1.8 * (0.8 + 0.4 * heartGlow)} ry={1.6 * (0.8 + 0.4 * heartGlow)} fill="url(#g60-red)" opacity={0.75 * heartGlow} style={{mixBlendMode: 'screen'}} />}
			{heart && <g transform="translate(0,0.02)"><Heart c={c} /></g>}
			{heart && heartGlow > 0 && <ellipse cx={0} cy={-0.9} rx={0.55} ry={0.6} fill="url(#g60-gold)" opacity={0.6 * heartGlow} style={{mixBlendMode: 'screen'}} />}
			<Solid d={panD} r={G} c={c} /><path d="M-1.7 0.28Q0 0.5 1.7 0.28" fill="none" stroke={PAL.blue} strokeWidth={c.LW * 2.2} /></g>
		<g transform={mx(g.panR)}><g transform={`translate(0.05,0.02) rotate(${featherA})`}><Feather c={c} h={3.0} /></g><Solid d={panD} r={G} c={c} /><path d="M-1.7 0.28Q0 0.5 1.7 0.28" fill="none" stroke={PAL.blue} strokeWidth={c.LW * 2.2} /></g>
		<g transform={mx(g.beam)}>
			<Solid d={beamD} r={G} c={c} />
			{[-1, 1].map((sg) => <g key={sg}><Solid d={bud(sg)} r="green" c={c} /><rect x={sg > 0 ? BAL.half - 1.2 : -BAL.half + 0.6} y={-0.24} width={0.6} height={0.48} fill={PAL.blue} /></g>)}
			{[-6.4, -4.6, -2.8, 2.8, 4.6, 6.4].map((xx) => <rect key={xx} x={xx - 0.12} y={-0.24} width={0.24} height={0.48} fill={PAL.red} />)}
			<Solid d={sp([[-0.12, 0.2, 1], [0.12, 0.2, 1], [0.05, 2.2], [0, 2.4, 1], [-0.05, 2.2]])} r={G} c={c} />
		</g>
		<circle cx={0} cy={BAL.beamY} r={0.32} fill={PAL.red} stroke={PAL.ink} strokeWidth={c.LW * 1.2} />
		<g transform={`translate(0,${BAL.beamY - 0.3})`}><Feather c={c} h={1.6} /></g>
	</g>;
};
/** world position of the left pan centre (for aiming cameras / dropping the heart) */
export const panPos = (p: BalancePose, x: number, y: number, s: number, side: 'L' | 'R' = 'L'): V => { const g = balanceGeo(p), q = ap(side === 'L' ? g.panL : g.panR, [0, 0]); return [x + q[0] * s, y + q[1] * s]; };

/* ---------------- the mummy, big (copy of props60b Mummy's body), the heart glowing through the linen ---------------- */
export const MUMMY_BODY = sp([[0.3, 0, 1], [0.0, -0.9], [0.25, -2.3], [0.85, -2.75], [1.6, -2.3], [3.2, -2.05], [5.6, -2.25], [7.6, -2.55], [9.8, -2.7], [11.8, -3.05], [13.2, -3.35], [14.3, -3.2], [15.0, -2.85], [15.4, 0, 1]], true, 0.16);
export const HEART_AT: V = [12.4, -1.75];
/** body + wraps + heart glow (glow = 0..1.5) + a gold mask at the head; origin = bed surface under the feet (units), head to +x */
export const BigMummy: React.FC<{x: number; y: number; s: number; t: number; id: string; glow?: number; heartShow?: number; rings?: number[]}> = ({x, y, s, t, id, glow = 1, heartShow = 0.6, rings = []}) => {
	const lw = 1.6 / s, cid = `${id}-mb`;
	const wraps: React.ReactNode[] = [];
	for (let i = -8; i < 34; i++) { const x0 = i * 0.56;
		wraps.push(<path key={'a' + i} d={poly([[x0, 0.2], [x0 + 0.34, 0.2], [x0 + 2.74, -4.2], [x0 + 2.4, -4.2]])} fill={i % 3 ? '#F4ECD8' : '#E4D6B6'} stroke="#B9A57E" strokeWidth={lw * 0.8} opacity={0.82} />);
		if (i % 2 === 0) wraps.push(<path key={'b' + i} d={poly([[x0 + 2.4, 0.2], [x0 + 2.66, 0.2], [x0 + 0.26, -4.2], [x0, -4.2]])} fill="#EADFC6" stroke="#B9A57E" strokeWidth={lw * 0.7} opacity={0.7} />); }
	const hp = HEART_AT, g = glow;
	const heartM = `translate(${hp[0]},${hp[1] + 1.05}) scale(1.25)`;
	// the kit mummy gives the gold mask; its false beard (which would float above the chest when lying face up) is clipped out
	const hole = `M${x - 5 * s} ${y - 12 * s}H${x + 25 * s}V${y + 5 * s}H${x - 5 * s}Z M${x + 13.4 * s} ${y - 4.4 * s}H${x + 15.2 * s}V${y - 3.36 * s}H${x + 13.4 * s}Z`;
	return <g><clipPath id={`${id}-kb`}><path d={hole} clipRule="evenodd" /></clipPath><g clipPath={`url(#${id}-kb)`}><Mummy x={x} y={y} s={s} t={t} masked /></g><g transform={`translate(${x},${y}) scale(${s})`}>
		<clipPath id={cid}><path d={MUMMY_BODY} /></clipPath><clipPath id={`${id}-mx`}><rect x={-2} y={-6} width={16.75} height={8} /></clipPath>
		<g clipPath={`url(#${id}-mx)`}>
		<path d={MUMMY_BODY} fill="#E3D5B4" stroke={PAL.ink} strokeWidth={lw * 2.2} />
		<g clipPath={`url(#${cid})`}>
			{/* the glow under the linen, the heart's shape seen through it */}
			<ellipse cx={hp[0]} cy={hp[1]} rx={2.6 * (0.7 + 0.3 * g)} ry={1.9 * (0.7 + 0.3 * g)} fill={`url(#${id}-heart)`} opacity={cl(g)} />
			<g transform={heartM} opacity={heartShow * cl(g)}><path d={HEART_D} fill="#E8452A" /></g>
			<g opacity={0.72}>{wraps}</g>
			{/* straps (red-brown) and the linen shroud lines */}
			{[3.4, 7.6].map((xx) => <rect key={xx} x={xx} y={-4} width={0.34} height={4.2} fill="#A8452A" opacity={0.85} />)}
			<path d="M0.4 -1.3Q7 -1.0 14.8 -1.55" fill="none" stroke="#A8452A" strokeWidth={0.22} opacity={0.75} />
			{/* glow passing through the wraps */}
			<ellipse cx={hp[0]} cy={hp[1]} rx={2.0 * (0.6 + 0.4 * g)} ry={1.5 * (0.6 + 0.4 * g)} fill={`url(#${id}-heart)`} opacity={0.75 * cl(g)} style={{mixBlendMode: 'screen'}} />
			<g transform={heartM} opacity={0.7 * heartShow * cl(g)} style={{mixBlendMode: 'screen'}}><path d={HEART_D} fill="#FF6A2A" /><path d={HEART_D} fill="none" stroke="#FFE08A" strokeWidth={0.07} /><path d="M-0.38 -1.42Q0 -1.32 0.38 -1.42" fill="none" stroke="#FFE08A" strokeWidth={0.1} /></g>
			{rings.map((u, i) => u > 0 && u < 1 ? <path key={i} d={HEART_D} fill="none" stroke="#FFC080" strokeWidth={0.12 * (1 - u)} opacity={0.8 * (1 - u)} transform={`translate(${hp[0]},${hp[1] + 1.05 + 0.9 * u}) scale(${1.25 + 2.2 * u})`} style={{mixBlendMode: 'screen'}} /> : null)}
		</g>
		<path d={MUMMY_BODY} fill="none" stroke={PAL.ink} strokeWidth={lw * 2.2} />
		</g>
		{/* a broad collar laid over the chest, below the mask */}
		{([[13.35, '#2A1912', 0.5], [13.4, `url(#${id}-gold)`, 0.4], [13.75, PAL.blue, 0.26], [14.05, PAL.red, 0.24], [14.32, '#2FA39A', 0.24], [14.58, `url(#${id}-gold)`, 0.22]] as [number, string, number][]).map(([xx, c, w], i) =>
			<path key={i} d={`M${xx - 0.25} -3.3Q${xx + 0.45} -1.6 ${xx + 0.1} 0.05`} fill="none" stroke={c} strokeWidth={w} />)}
	</g></g>;
};
/** the jar-shaped heart (props60 heart outline, units: base at 0, ~1.8 tall) */
export const HEART_D = sp([[-0.42, 0, 1], [0.42, 0, 1], [0.7, -0.35], [0.78, -0.95], [0.6, -1.32], [0.4, -1.42], [0.48, -1.62], [0.32, -1.78], [0.18, -1.6], [-0.18, -1.6], [-0.32, -1.78], [-0.48, -1.62], [-0.4, -1.42], [-0.6, -1.32], [-0.78, -0.95], [-0.7, -0.35]], true, 0.16);
/** the heart as a glowing object (units as props60 Heart, scaled by s; origin = base centre) */
export const GlowHeart: React.FC<{x: number; y: number; s: number; glow?: number; a?: number}> = ({x, y, s, glow = 1, a = 0}) => <g transform={`translate(${x},${y}) rotate(${a}) scale(${s})`}>
	<ellipse cx={0} cy={-0.9} rx={2.2} ry={2.0} fill="url(#g60-red)" opacity={0.7 * glow} style={{mixBlendMode: 'screen'}} />
	<Heart c={{OW: 2.7 / s, LW: 1.5 / s}} />
	<ellipse cx={-0.2} cy={-1.0} rx={0.5} ry={0.55} fill="url(#g60-gold)" opacity={0.55 * glow} style={{mixBlendMode: 'screen'}} />
</g>;

/* ---------------- the ba bird: human head (striped wig), falcon body, wings flapping (ph radians); faces +x; origin = body centre ---------------- */
export const BaBird: React.FC<{x: number; y: number; s: number; ph: number; a?: number}> = ({x, y, s, ph, a = 0}) => {
	const lw = 1.6 / s, f = Math.sin(ph), wing = (back: boolean) => { const up = back ? f * 0.9 + 0.1 : f; const tipY = -2.4 * up, tipX = -1.2 + 0.4 * Math.abs(up);
		const d = sp([[0.3, -0.2, 1], [0.6, -0.5 + tipY * 0.35], [tipX + 0.6, tipY - 0.1], [tipX - 0.3, tipY + 0.15, 1], [-0.6, -0.05 + tipY * 0.2], [-0.5, 0.2, 1]], true, 0.18);
		const rows = [0.25, 0.55, 0.8].map((u) => <path key={u} d={`M${lerp(0.3, tipX, u * 0.9)} ${lerp(-0.25, tipY, u * 0.9)}L${lerp(-0.4, tipX - 0.2, u)} ${lerp(0.15, tipY + 0.2, u)}`} stroke={PAL.ink} strokeWidth={lw} opacity={0.6} />);
		return <g opacity={back ? 0.85 : 1}><path d={d} fill={back ? '#2E6FA8' : PAL.blue} stroke={PAL.ink} strokeWidth={lw * 1.6} strokeLinejoin="round" />
			<path d={d} fill="none" stroke={PAL.gold} strokeWidth={lw * 2} transform="translate(0.04,0.06) scale(0.92)" opacity={0.8} />{rows}</g>; };
	const body = sp([[-1.6, 0.25, 1], [-0.9, -0.05], [0.4, -0.35], [1.05, -0.2], [1.2, 0.3], [0.7, 0.75], [-0.4, 0.62], [-1.45, 0.62, 1]], true, 0.18);
	const tail = sp([[-1.3, 0.3, 1], [-2.3, 0.15], [-2.45, 0.6, 1], [-1.3, 0.62, 1]], true, 0.18);
	return <g transform={`translate(${x},${y}) rotate(${a}) scale(${s})`}>
		{wing(true)}
		<path d={tail} fill={PAL.gold} stroke={PAL.ink} strokeWidth={lw * 1.6} strokeLinejoin="round" />
		<path d={body} fill={PAL.gold} stroke={PAL.ink} strokeWidth={lw * 1.6} strokeLinejoin="round" />
		{[-0.8, -0.3, 0.2].map((xx) => <path key={xx} d={`M${xx} 0.1Q${xx + 0.2} 0.35 ${xx + 0.05} 0.58`} fill="none" stroke="#9C6A12" strokeWidth={lw} />)}
		{/* legs tucked */}
		<path d="M0.1 0.7L0.0 1.05M0.45 0.68L0.4 1.0" stroke={PAL.ink} strokeWidth={lw * 2} strokeLinecap="round" />
		{/* human head with a striped wig and a beard */}
		<g transform="translate(1.05,-0.55)">
			<path d={sp([[-0.15, 0.35], [-0.55, 0.0], [-0.6, -0.55], [-0.2, -0.9], [0.35, -0.88], [0.62, -0.5], [0.66, -0.25], [0.78, -0.1, 1], [0.62, 0.02], [0.6, 0.25], [0.3, 0.42]], true, 0.18)} fill={PAL.skinM} stroke={PAL.ink} strokeWidth={lw * 1.5} />
			<path d={sp([[-0.68, 0.5], [-0.72, -0.3], [-0.4, -0.88], [0.25, -0.98], [0.5, -0.72], [0.1, -0.62], [-0.05, -0.2], [-0.1, 0.55]], true, 0.18)} fill={PAL.wig} stroke={PAL.ink} strokeWidth={lw * 1.4} />
			{[-0.5, -0.32, -0.16].map((xx) => <path key={xx} d={`M${xx} -0.7L${xx - 0.05} 0.45`} stroke={PAL.gold} strokeWidth={lw * 1.2} />)}
			<ellipse cx={0.36} cy={-0.42} rx={0.12} ry={0.06} fill={PAL.eye} stroke={PAL.ink} strokeWidth={lw} /><circle cx={0.39} cy={-0.42} r={0.045} fill={PAL.ink} />
			<path d="M0.52 0.3L0.62 0.62L0.5 0.66L0.4 0.36Z" fill={PAL.ink} />
		</g>
		{wing(false)}
	</g>;
};

/* ---------------- a reed pen (world px): tip at (x, y), held at angle a (deg from vertical, + = leaning right) ---------------- */
export const ReedPen: React.FC<{x: number; y: number; len: number; a: number; w?: number; ink?: string}> = ({x, y, len, a, w = 7, ink = '#1A0E08'}) => <g transform={`translate(${x},${y}) rotate(${a})`}>
	<path d={poly([[-w / 2, -len], [w / 2, -len], [w / 2, -w * 2.2], [0, 0], [-w / 2, -w * 2.2]])} fill="#C9A060" stroke={PAL.ink} strokeWidth={1.8} strokeLinejoin="round" />
	<path d={poly([[-w / 2 + 1, -w * 2.2], [w / 2 - 1, -w * 2.2], [0, -1]])} fill={ink} />
	{[0.3, 0.55, 0.8].map((u) => <line key={u} x1={-w / 2} x2={w / 2} y1={-len * u} y2={-len * u} stroke="#8A6630" strokeWidth={1.4} />)}
</g>;

/** glyph strings for Ani's name and the book's title (signs from props60's 1 × 1 glyph cells, drawn upright) */
export const GlyphRun: React.FC<{x: number; y: number; cell: number; keys: string[]; color?: string; vertical?: boolean; o?: number; stroke?: string}> = ({x, y, cell, keys, color, vertical = true, o = 1, stroke}) => <g opacity={o}>
	{keys.map((k, i) => { const g = GLYPH_D[k]; if (!g) return null;
		return <path key={i} d={g.d} fill={color ?? (PAL as Record<string, string>)[g.r]} stroke={stroke ?? 'none'} strokeWidth={stroke ? 1.6 / cell : 0} transform={`translate(${vertical ? x : x + i * cell * 1.05},${vertical ? y + i * cell * 1.05 : y}) scale(${cell})`} />; })}
</g>;

/* ---------------- sparkle: a 4-point star ---------------- */
export const Sparkle: React.FC<{x: number; y: number; r: number; o?: number; a?: number; c?: string}> = ({x, y, r, o = 1, a = 0, c = '#FFF6D8'}) => <g transform={`translate(${x},${y}) rotate(${a}) scale(${r})`} opacity={o} style={{mixBlendMode: 'screen'}}>
	<path d="M0 -1L0.12 -0.12L1 0L0.12 0.12L0 1L-0.12 0.12L-1 0L-0.12 -0.12Z" fill={c} /><circle r={0.3} fill="url(#g60-white)" />
</g>;

/** a ring of gold dust flying out from (x, y) after t0 */
export const DustBurst: React.FC<{t: number; t0: number; x: number; y: number; rx: number; ry: number; n?: number; seed?: number; c?: string; life?: number}> = ({t, t0, x, y, rx, ry, n = 60, seed = 3, c = '#FFE29A', life = 1.6}) => {
	if (t < t0 || t > t0 + life) return null; const R = rng(seed), u = (t - t0) / life;
	return <g style={{mixBlendMode: 'screen'}}>{Array.from({length: n}, (_, i) => { const an = R() * Math.PI * 2, sp_ = 0.6 + R() * 0.8, d = 1 - Math.pow(1 - u, 2.2), rr = 1.2 + R() * 2.6;
		return <circle key={i} cx={x + Math.cos(an) * rx * (1 + d * 0.9 * sp_)} cy={y + Math.sin(an) * ry * (1 + d * 1.4 * sp_) + 30 * u * u} r={rr * (1 - u * 0.5)} fill={c} opacity={(1 - u) * (0.5 + 0.5 * R())} />; })}</g>;
};
export const _k = {T, R, chain};

/* ---------------- v2 (owner 15:10): parallax layers and the title inside the world ---------------- */
/** a layer scaled by k about world point c (parallax inside one Stage camera) */
export const layerT = (k: number, c: V) => `translate(${c[0]},${c[1]}) scale(${k}) translate(${-c[0]},${-c[1]})`;
export const TITLE_TXT = '死后称心脏';
/** where the title sits on screen at the 3 → 5 dissolve (shot 3 settles on it, shot 5 starts on it): centre x, y and the title width */
export const TS = {x: 640, y: 268, w: 700};
/** the gilded title in its cartouche, drawn in SCREEN space (put it in Stage60's `screen` layer, projected from its world anchor).
    lit 0..1: molten gold runs into the carved signs left to right; flash 0..1: the landing. */
export const GildedTitle: React.FC<{x: number; y: number; w: number; lit: number; flash?: number; t: number; id: string; o?: number}> = ({x, y, w, lit, flash = 0, t, id, o = 1}) => {
	const fs = w / 5.5, ls = fs * 0.1, hw = w * 0.57, hh = fs * 0.8, r = hh;
	const cart = `M${x - hw + r} ${y - hh}L${x + hw - r} ${y - hh}A${r} ${r} 0 0 1 ${x + hw - r} ${y + hh}L${x - hw + r} ${y + hh}A${r} ${r} 0 0 1 ${x - hw + r} ${y - hh}Z`;
	const ty = y + fs * 0.36, tx = x + ls / 2, front = x - hw - 20 + lit * (2 * hw + 60);
	const txt = (p: React.SVGProps<SVGTextElement>) => <text x={tx} y={ty} textAnchor="middle" fontFamily={"'Noto Serif CJK SC','Noto Serif CJK',serif"} fontWeight={900} fontSize={fs} letterSpacing={ls} {...p}>{TITLE_TXT}</text>;
	const sh = Math.sin(t * 2.2);
	return <g opacity={o}>
		<defs>
			<linearGradient id={`${id}-tg`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF6CF" /><stop offset="0.38" stopColor="#F9D46A" /><stop offset="0.6" stopColor="#D79A2A" /><stop offset="0.82" stopColor="#F4CF6C" /><stop offset="1" stopColor="#B07816" /></linearGradient>
			<linearGradient id={`${id}-ti`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1B2C74" /><stop offset="1" stopColor="#0B1238" /></linearGradient>
			<clipPath id={`${id}-tl`}><rect x={x - hw - 40} y={y - hh - 80} width={Math.max(0, front - (x - hw - 40))} height={2 * hh + 160} /></clipPath>
		</defs>
		<path d={cart} fill="#000" opacity={0.35} transform="translate(6,9)" />
		<rect x={x + hw + 6} y={y - hh - 5} width={fs * 0.2} height={2 * hh + 10} rx={5} fill={`url(#${id}-tg)`} stroke="#2A1608" strokeWidth={3} opacity={0.55 + 0.45 * lit} />
		<path d={cart} fill={`url(#${id}-ti)`} stroke="#2A1608" strokeWidth={fs * 0.14} />
		<path d={cart} fill="none" stroke={`url(#${id}-tg)`} strokeWidth={fs * 0.09} opacity={0.5 + 0.5 * lit} />
		<path d={cart} fill="none" stroke="#7A4C10" strokeWidth={fs * 0.025} strokeDasharray={`${fs * 0.07} ${fs * 0.06}`} opacity={0.75} />
		<path d={cart} fill="none" stroke={PAL.red} strokeWidth={2.5} transform={`translate(${x},${y}) scale(0.95,0.86) translate(${-x},${-y})`} opacity={0.85} />
		{/* the carved signs (before the gold): dark incised, a light bevel */}
		{txt({fill: '#0A0F2A', stroke: '#5A6AAA', strokeWidth: fs * 0.022, opacity: 0.95})}
		{/* the gold, running in from the left */}
		<g clipPath={`url(#${id}-tl)`}>
			{txt({fill: 'none', stroke: '#FFD87A', strokeWidth: fs * 0.14, opacity: 0.2 + 0.1 * sh})}
			{txt({fill: '#1A0C02', stroke: '#1A0C02', strokeWidth: fs * 0.07, strokeLinejoin: 'round', transform: `translate(0,${fs * 0.035})`})}
			{txt({fill: `url(#${id}-tg)`, stroke: '#3A1E06', strokeWidth: fs * 0.02})}
		</g>
		{lit > 0 && lit < 1 && <g style={{mixBlendMode: 'screen'}}><rect x={front - 34} y={y - hh} width={68} height={2 * hh} fill="url(#g60-gold)" opacity={0.9} /><circle cx={front} cy={y} r={hh * 0.9} fill="url(#g60-white)" opacity={0.5} /></g>}
		{flash > 0.01 && <g style={{mixBlendMode: 'screen'}}><ellipse cx={x} cy={y} rx={hw * (1 + 0.25 * (1 - flash))} ry={hh * (1.6 + 0.6 * (1 - flash))} fill="url(#g60-gold)" opacity={0.85 * flash} />
			<Sparkle x={x - hw + r * 0.6} y={y - hh * 0.7} r={60 * flash} a={20} /><Sparkle x={x + hw - r * 0.6} y={y + hh * 0.6} r={48 * flash} a={-10} /></g>}
		{lit >= 1 && [[x - hw + r * 0.55, y - hh * 0.62], [x + hw - r * 0.7, y + hh * 0.55]].map(([sx, sy], i) => <Sparkle key={i} x={sx} y={sy} r={fs * (0.14 + 0.06 * Math.sin(t * 3 + i * 2))} o={0.75} a={t * 30} />)}
	</g>;
};
/** a bronze brazier on three legs with a big flame (world px; origin = floor under it) */
export const Brazier: React.FC<{x: number; y: number; s?: number; t: number; seed?: number}> = ({x, y, s = 1, t, seed = 0}) => <g transform={`translate(${x},${y}) scale(${s})`}>
	<path d="M-60 0L-34 -150M60 0L34 -150M0 6L0 -150" stroke={PAL.ink} strokeWidth={12} /><path d="M-60 0L-34 -150M60 0L34 -150M0 6L0 -150" stroke="#B07A2A" strokeWidth={7} />
	<path d={sp([[-96, -190, 1], [96, -190, 1], [70, -150], [0, -136], [-70, -150]], true, 0.2)} fill="#C98A2A" stroke={PAL.ink} strokeWidth={4} />
	<path d="M-90 -186L90 -186" stroke="#F2C46A" strokeWidth={4} />
	{[-54, -20, 16, 50].map((fx, i) => <g key={i} transform={`translate(${fx},-188) scale(${1.3 + 0.25 * Math.sin(t * 6 + i * 1.7 + seed)})`}><path d={`M-14 0Q-18 -40 ${-2 + 6 * Math.sin(t * 7 + i)} -78Q16 -40 14 0Z`} fill="#E8642A" stroke={PAL.ink} strokeWidth={2} /><path d="M-7 0Q-8 -24 0 -44Q8 -24 7 0Z" fill="#F8C24A" /></g>)}
</g>;
