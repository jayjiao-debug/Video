/* ep60 act C (shots 34–55) · shared pieces for this act only:
   - wobIn: the hand-painted wobble switched off while a shot dissolves in (two Stage60s share the filter id `f60-wob`; the first one in
     the document wins, so an incoming shot would be clipped to the outgoing camera's filter region) and eased back on after its start;
   - camE: a one-segment camera move with its own easing (camPath eases in AND out at every key);
   - EyeFx: an eye drawn over the rig's own (human heads): pupil slide, lid (wink / closed), smirk / deadpan mouth;
   - BalanceC: the balance of the weighing with a replaceable heart / feather, a gold glow option;
   - HallBg: the Hall of Two Truths backdrop (lapis or blood), starry ceiling, feather cornice, columns, dado;
   - Sparkle / Wisp / Drops: small life. */
import React from 'react';
import {Pose, Cast, solve, SHAPES, band} from './rig60';
import {BAL, balanceGeo, BalancePose, Heart, Feather, Baboon, GlyphColumns} from './props60';
import {Ceiling} from './sets60';
import {FeatherCornice, Column} from './props60b';
import {Dado, RegisterLine, Stars, Cam} from './frame60';
import {PAL, sp, poly, mx, ap, sm, cl, lerp, V, M, chain, T as Tm, R as Rm, RAD} from './geo60';

export const wobIn = (t: number) => (t < 0 ? 0 : 2.4 * sm(t / 0.45));
export const eOut = (u: number) => 1 - Math.pow(1 - cl(u), 3);
export const eIn = (u: number) => Math.pow(cl(u), 2);
/** a single camera move a → b between t0 and t1 with an easing (default smooth); holds outside */
export const camE = (t: number, t0: number, t1: number, a: [number, number, number], b: [number, number, number], ease: (u: number) => number = sm): Cam => {
	const u = ease((t - t0) / (t1 - t0));
	return {x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), z: lerp(a[2], b[2], u)};
};
/** wear / stain lowered as the camera zooms in (the paper texture grows with zoom) */
export const wearZ = (z: number, w = 0.9) => w * cl(1.35 - 0.6 * (z - 1), 0.25, 1);
/** a smooth bump 0 → 1 → 0 over [a, b] */
export const bump = (t: number, a: number, b: number) => { const u = cl((t - a) / (b - a)); return Math.sin(Math.PI * u); };

/* ---------------- the eye overlay ---------------- */
/** draw after the figure with the same pose / x / y / s / face. look: 0 painted (forward) → 1 slid back toward the viewer;
    lid: 0 open → 1 shut (a lash curve); smile: smirk at the mouth corner; flat: a deadpan mouth */
export const EyeFx: React.FC<{pose: Pose; x: number; y: number; s: number; face?: 1 | -1; skin: string; female?: boolean; look?: number; lid?: number; smile?: number; flat?: number; id: string}> = ({pose, x, y, s, face = 1, skin, female, look = 0, lid = 0, smile = 0, flat = 0, id}) => {
	const g = solve(pose, female), H = g.head, LW = 1.5 / s;
	const ex = 0.98, ey = -1.17, L = 0.48, h = L * 0.36;
	const al = sp([[ex - L * 0.55, ey, 1], [ex - L * 0.2, ey - h], [ex + L * 0.25, ey - h * 0.9], [ex + L * 0.45, ey + h * 0.05, 1], [ex + L * 0.15, ey + h * 0.75], [ex - L * 0.25, ey + h * 0.6]], true, 0.2);
	const px = lerp(ex + L * 0.08, ex - L * 0.1, look), py = ey - h * 0.05 + h * 0.12 * look, pr = h * lerp(0.82, 0.9, look);
	const lidY = lerp(ey - h * 1.1, ey + h * 0.85, cl(lid));
	return <g transform={`translate(${x},${y}) scale(${s * face},${s})`}><g transform={mx(H)}>
		<defs><clipPath id={`${id}-al`}><path d={al} /></clipPath></defs>
		{/* cover the painted eye, then the new one */}
		<path d={al} fill={skin} stroke={skin} strokeWidth={LW * 3.2} />
		<path d={al} fill={PAL.eye} />
		<g clipPath={`url(#${id}-al)`}>
			<circle cx={px} cy={py} r={pr} fill={PAL.black} />
			<circle cx={px + pr * 0.35} cy={py - pr * 0.35} r={pr * 0.3} fill="#FFFFFF" opacity={0.85 * look} />
			{lid > 0 && <path d={`M${ex - 0.4} ${ey - h * 2}L${ex + 0.4} ${ey - h * 2}L${ex + 0.4} ${lidY}Q${ex} ${lidY + h * 0.35} ${ex - 0.4} ${lidY}Z`} fill={skin} />}
		</g>
		{lid < 0.92 ? <path d={al} fill="none" stroke={PAL.black} strokeWidth={LW * 1.5} strokeLinejoin="round" />
			: <path d={`M${ex - L * 0.55} ${ey}Q${ex - L * 0.05} ${ey + h * 1.05} ${ex + L * 0.45} ${ey + h * 0.05}`} fill="none" stroke={PAL.black} strokeWidth={LW * 2.2} strokeLinecap="round" />}
		{lid > 0.05 && lid < 0.92 && <path d={`M${ex - L * 0.5} ${lidY + h * 0.05}Q${ex} ${lidY + h * 0.45} ${ex + L * 0.42} ${lidY + h * 0.05}`} fill="none" stroke={PAL.black} strokeWidth={LW * 1.8} />}
		{/* mouth: smirk (corner up) or deadpan (flat, a touch longer) */}
		{smile > 0 && <path d={`M1.3 -0.5Q1.16 -0.47 ${1.16 - 0.14 * smile} ${-0.5 - 0.1 * smile}`} fill="none" stroke={PAL.ink} strokeWidth={LW * 1.6} strokeLinecap="round" opacity={cl(smile * 2)} />}
		{flat > 0 && <path d="M1.32 -0.5L1.02 -0.5" fill="none" stroke={PAL.ink} strokeWidth={LW * 1.8} strokeLinecap="round" opacity={flat} />}
	</g></g>;
};

/* ---------------- the balance (copy of props60 Balance with replaceable heart / feather) ---------------- */
type C = {OW: number; LW: number};
const ctx = (s: number): C => ({OW: 2.7 / s, LW: 1.5 / s});
const Solid: React.FC<{d: string; r: string; c: C; k?: number}> = ({d, r, c, k = 1}) => <g>
	<path d={d} fill={PAL.ink} stroke={PAL.ink} strokeWidth={2 * c.OW * k} strokeLinejoin="round" /><path d={d} fill={(PAL as Record<string, string>)[r] ?? r} /></g>;
const rect = (x0: number, y0: number, x1: number, y1: number) => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
export {ctx as ctxC, Solid as SolidC};
/** heart: null = the painted heart; a node = drawn in the left pan frame (units, base at y = 0); feather: false hides it */
export const BalanceC: React.FC<{p: BalancePose; x: number; y: number; s: number; t?: number; heart?: React.ReactNode; feather?: boolean; baboon?: boolean}> = ({p, x, y, s, t = 0, heart, feather = true, baboon = true}) => {
	const c = ctx(s), g = balanceGeo(p);
	const post = poly([[-0.36, -1.75], [0.36, -1.75], [0.3, BAL.postTop + 0.6], [-0.3, BAL.postTop + 0.6]]);
	const capital = sp([[-0.3, BAL.postTop + 0.62, 1], [0.3, BAL.postTop + 0.62, 1], [0.95, BAL.postTop + 0.05], [1.05, BAL.postTop - 0.1, 1], [-1.05, BAL.postTop - 0.1, 1], [-0.95, BAL.postTop + 0.05]]);
	const abacus = rect(-1.3, BAL.postTop - 0.45, 1.3, BAL.postTop - 0.1);
	const beamD = sp([[-BAL.half - 0.2, -0.24, 1], [BAL.half + 0.2, -0.24, 1], [BAL.half + 0.2, 0.24, 1], [-BAL.half - 0.2, 0.24, 1]]);
	const bud = (sg: number) => sp([[sg * (BAL.half + 0.15), -0.32], [sg * (BAL.half + 0.65), -0.42], [sg * (BAL.half + 0.98), 0], [sg * (BAL.half + 0.65), 0.42], [sg * (BAL.half + 0.15), 0.32]]);
	const panD = sp([[-2.05, 0, 1], [2.05, 0, 1], [1.6, 0.5], [0.7, 0.74], [-0.7, 0.74], [-1.6, 0.5]], true, 0.2);
	const cords = (pm: number[], e: V, k: string) => <g key={k}>{[-1.85, -0.6, 0.6, 1.85].map((u) => { const q: V = [pm[0] * u + pm[4], pm[1] * u + pm[5]]; return <line key={u} x1={e[0]} y1={e[1]} x2={q[0]} y2={q[1]} stroke={PAL.ink} strokeWidth={c.LW * 1.25} />; })}</g>;
	const bands = [-4.5, -8.5, -12.5, -16.5].map((yy) => <g key={yy}><rect x={-0.37} y={yy} width={0.74} height={0.55} fill={PAL.blue} stroke={PAL.ink} strokeWidth={c.LW * 0.8} /><rect x={-0.37} y={yy + 0.55} width={0.74} height={0.22} fill={PAL.red} stroke={PAL.ink} strokeWidth={c.LW * 0.8} /></g>);
	return <g transform={`translate(${x},${y}) scale(${s})`}>
		<Solid d={rect(-2.5, -0.9, 2.5, 0)} r="linen" c={c} /><Solid d={rect(-1.7, -1.75, 1.7, -0.9)} r="linen" c={c} />
		{[-2.0, -1.0, 0, 1.0].map((xx, i) => <rect key={xx} x={xx + 0.08} y={-0.72} width={0.84} height={0.55} fill={[PAL.blue, PAL.red, PAL.green, PAL.blue][i]} stroke={PAL.ink} strokeWidth={c.LW * 0.8} />)}
		<rect x={-1.5} y={-1.5} width={3.0} height={0.22} fill={PAL.red} />
		<Solid d={post} r="gold" c={c} />{bands}
		<Solid d={capital} r="green" c={c} />{[-0.6, -0.2, 0.2, 0.6].map((xx) => <line key={xx} x1={xx * 0.4} y1={BAL.postTop + 0.6} x2={xx * 1.5} y2={BAL.postTop - 0.05} stroke={PAL.ink} strokeWidth={c.LW * 0.8} />)}
		<Solid d={abacus} r="gold" c={c} />
		{baboon && <g transform={`translate(0.15,${BAL.postTop - 0.45}) scale(-1,1)`}><Baboon c={c} t={t} look={p.look ?? 0} /></g>}
		<path d={rect(0, BAL.plumbY - 0.12, BAL.plumbX + 0.12, BAL.plumbY + 0.12)} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW} />
		<line x1={BAL.plumbX} y1={BAL.plumbY} x2={g.bob[0]} y2={g.bob[1]} stroke={PAL.ink} strokeWidth={c.LW * 1.2} />
		<g transform={`translate(${g.bob[0]},${g.bob[1]}) rotate(${-(p.plumb ?? 0)})`}><Solid d={sp([[0, -0.1], [0.32, 0.22], [0.36, 0.55], [0, 0.95, 1], [-0.36, 0.55], [-0.32, 0.22]])} r="gold" c={c} /><circle cx={0} cy={0.45} r={0.12} fill={PAL.red} /></g>
		{cords(g.panL, g.eL, 'cl')}{cords(g.panR, g.eR, 'cr')}
		<g transform={mx(g.panL)}><g transform="translate(0,0.02)">{heart ?? <Heart c={c} />}</g><Solid d={panD} r="gold" c={c} /><path d="M-1.7 0.28Q0 0.5 1.7 0.28" fill="none" stroke={PAL.blue} strokeWidth={c.LW * 2.2} /></g>
		<g transform={mx(g.panR)}>{feather && <g transform="translate(0.05,0.02)"><Feather c={c} h={3.0} /></g>}<Solid d={panD} r="gold" c={c} /><path d="M-1.7 0.28Q0 0.5 1.7 0.28" fill="none" stroke={PAL.blue} strokeWidth={c.LW * 2.2} /></g>
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
/** world positions of the beam ends / pan tops for a balance at (x, y, s) */
export const balW = (p: BalancePose, x: number, y: number, s: number) => { const g = balanceGeo(p), w = (v: V): V => [x + v[0] * s, y + v[1] * s];
	return {eL: w(g.eL), eR: w(g.eR), panL: w([g.panL[4], g.panL[5]]), panR: w([g.panR[4], g.panR[5]]), pivot: w([0, BAL.beamY])}; };

/* ---------------- the hall backdrop ---------------- */
export const HallBg: React.FC<{t: number; x0: number; x1: number; gy?: number; red?: boolean; cols?: number[]; glyphs?: boolean; ceilY?: number; stars?: boolean}> = ({t, x0, x1, gy = 852, red, cols = [], glyphs = true, ceilY = 118, stars = true}) => {
	const wall = red ? '#4A120C' : '#18245A', ceil = red ? '#2A0806' : '#141F52', gold = red ? '#C9873A' : '#E8B83E';
	return <g>
		<rect x={x0} y={-200} width={x1 - x0} height={gy + 200} fill={wall} />
		<Ceiling x0={x0} x1={x1} y0={-200} y1={ceilY} bg={ceil} />
		{stars && <Stars t={t} box={[x0, -150, x1, ceilY - 14]} n={Math.round((x1 - x0) / 14)} seed={61} o={red ? 0.5 : 0.9} />}
		<FeatherCornice x0={x0} x1={x1} y={ceilY + 8} s={0.95} t={t} />
		{glyphs && <g opacity={red ? 0.45 : 0.55}>
			<GlyphColumns x={x0 + 60} y={ceilY + 60} cols={Math.max(1, Math.floor((x1 - x0 - 120) / 42))} rows={2} cell={34} seed={71} mono={gold} /></g>}
		<RegisterLine x0={x0} x1={x1} y={ceilY + 150} h={12} />
		{cols.map((c) => <Column key={c} x={c} gy={gy} top={ceilY + 26} w={52} />)}
		<Dado x0={x0} x1={x1} y={gy} h={80} />
	</g>;
};

/* ---------------- small life ---------------- */
/** a four-point twinkle (screen) */
export const Sparkle: React.FC<{x: number; y: number; r: number; o?: number; rot?: number; c?: string}> = ({x, y, r, o = 1, rot = 0, c = '#FFF4C8'}) => o <= 0 ? null : <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={o} style={{mixBlendMode: 'screen'}}>
	<circle r={r * 0.9} fill="url(#g60-gold)" opacity={0.8} />
	<path d={`M0 ${-r}L${r * 0.16} ${-r * 0.16}L${r} 0L${r * 0.16} ${r * 0.16}L0 ${r}L${-r * 0.16} ${r * 0.16}L${-r} 0L${-r * 0.16} ${-r * 0.16}Z`} fill={c} />
</g>;
/** a cartoon sweat drop */
export const Drop: React.FC<{x: number; y: number; r: number; o?: number; a?: number}> = ({x, y, r, o = 1, a = 0}) => <g transform={`translate(${x},${y}) rotate(${a})`} opacity={o}>
	<path d={`M0 ${-r * 1.7}Q${r} ${-r * 0.2} ${r} ${r * 0.3}A${r} ${r} 0 0 1 ${-r} ${r * 0.3}Q${-r} ${-r * 0.2} 0 ${-r * 1.7}Z`} fill="#BFE6FF" stroke={PAL.ink} strokeWidth={Math.max(1.2, r * 0.18)} />
	<ellipse cx={-r * 0.35} cy={-r * 0.1} rx={r * 0.2} ry={r * 0.35} fill="#FFFFFF" opacity={0.85} />
</g>;
/* ---------------- layering fixes over the shared rig ---------------- */
/** an arm redrawn over a finished figure (same pose / x / y / s / face). behindTorso: hidden where the torso and collar are, so the far
    arm of an adoring figure rises from the front of the chest IN FRONT of the face (the Egyptian convention) instead of out of the wig;
    shoulder: hidden in the shoulder disc (the rig's own seam-free joint); only 'hand' = just the hand (a fist over a held object). */
export const ArmOver: React.FC<{cast: Cast; pose: Pose; x: number; y: number; s: number; face?: 1 | -1; side: 'b' | 'f'; behindTorso?: boolean; shoulder?: boolean; only?: 'hand'; id: string}> = ({cast, pose, x, y, s, face = 1, side, behindTorso, shoulder, only, id}) => {
	const g = solve(pose, cast.female), OW = 2.7 / s, LW = 1.5 / s;
	const [U, F, H] = side === 'b' ? [g.bU, g.bF, g.bH] : [g.fU, g.fF, g.fH];
	const hand = side === 'b' ? cast.bHand : cast.fHand, skin = (PAL as Record<string, string>)[cast.skin] ?? cast.skin;
	const hs = SHAPES[hand === 'open' ? 'open' : hand === 'palm' ? 'palm' : 'fist'], sh = ap(U, [0, 0]);
	const torso = cast.female ? SHAPES.torsoF : SHAPES.torsoM, cy = cast.female ? -6.78 : -6.86, k = cast.female ? 0.9 : 1;
	const parts: [string, M][] = only === 'hand' ? [[hs, H]] : [[SHAPES.upper, U], [SHAPES.fore, F], [hs, H]];
	return <g transform={`translate(${x},${y}) scale(${s * face},${s})`}>
		{(behindTorso || shoulder) && <defs><mask id={`${id}-m`} maskUnits="userSpaceOnUse" x={-60} y={-60} width={120} height={120}>
			<rect x={-60} y={-60} width={120} height={120} fill="white" />
			{behindTorso && <g transform={mx(g.torso)} fill="black" stroke="black" strokeWidth={2.2 * OW}><path d={torso} /><path d={band(0.18, cy, 0, 2.96 * k)} /></g>}
			{shoulder && <circle cx={sh[0]} cy={sh[1]} r={1.05} fill="black" />}
		</mask></defs>}
		<g mask={behindTorso || shoulder ? `url(#${id}-m)` : undefined}>
			{parts.map(([d, m], i) => <path key={'i' + i} d={d} transform={mx(m)} fill={PAL.ink} stroke={PAL.ink} strokeWidth={2 * OW} strokeLinejoin="round" />)}
			{parts.map(([d, m], i) => <path key={'f' + i} d={d} transform={mx(m)} fill={skin} />)}
			{hand === 'fist' ? <path d="M0.42 0.32Q0.12 0.42 -0.05 0.72" transform={mx(H)} fill="none" stroke={PAL.line} strokeWidth={LW} opacity={0.75} />
				: <path d="M0.36 0.62Q0.36 0.36 0.3 0.2" transform={mx(H)} fill="none" stroke={PAL.line} strokeWidth={LW * 0.9} opacity={0.7} />}
			{only !== 'hand' && <><g transform={mx(U)}><rect x={-0.62} y={1.0} width={1.26} height={0.42} fill={PAL.gold} stroke={PAL.ink} strokeWidth={LW} /><rect x={-0.62} y={1.12} width={1.26} height={0.17} fill={PAL.blue} /></g>
				<g transform={mx(F)}><rect x={-0.42} y={2.7} width={0.86} height={0.58} fill={PAL.gold} stroke={PAL.ink} strokeWidth={LW} />
					{[0, 1, 2].map((i) => <rect key={i} x={-0.42} y={2.78 + i * 0.16} width={0.86} height={0.07} fill={[PAL.blue, PAL.red, PAL.blue][i]} />)}</g></>}
		</g>
	</g>;
};
/** an adoring figure fixed: the far arm in front of the face (rising from the chest), the near arm over it */
export const AdoreArms: React.FC<{cast: Cast; pose: Pose; x: number; y: number; s: number; face?: 1 | -1; id: string}> = (p) => <>
	<ArmOver {...p} side="b" behindTorso id={p.id + 'b'} />
	<ArmOver {...p} side="f" shoulder id={p.id + 'f'} />
</>;
/* Osiris's crook and flail, own copies (rig60 draws them over the head): the flail is hidden behind the head and crown */
type Cx = {OW: number; LW: number};
const SolidX: React.FC<{d: string; r: string; c: Cx}> = ({d, r, c}) => <><path d={d} fill={PAL.ink} stroke={PAL.ink} strokeWidth={2 * c.OW} strokeLinejoin="round" /><path d={d} fill={(PAL as Record<string, string>)[r] ?? r} /></>;
const CrookC: React.FC<{at: V; a: number; c: Cx}> = ({at, a, c}) => {
	const d = sp([[-0.15, 1.2, 1], [0.15, 1.2, 1], [0.15, -2.4], [0.2, -2.95], [0.55, -3.3], [1.0, -3.25], [1.2, -2.9], [1.12, -2.62, 1], [0.92, -2.62, 1], [0.95, -2.88], [0.75, -3.05], [0.45, -2.95], [-0.15, -2.4]], true, 0.16);
	return <g transform={`translate(${at[0]},${at[1]}) rotate(${a})`}><SolidX d={d} r="gold" c={c} />{[-2.1, -1.5, -0.9, -0.3, 0.3, 0.9].map((y) => <rect key={y} x={-0.16} y={y} width={0.32} height={0.28} fill={PAL.blue} />)}</g>;
};
const FlailC: React.FC<{at: V; a: number; c: Cx; t: number}> = ({at, a, c, t}) => {
	const k = 1.25, top: V = [Math.sin(a * RAD) * 3.6 * k, -Math.cos(a * RAD) * 3.6 * k];
	const handle = poly([[-0.15, 0.9], [0.15, 0.9], [0.15, -3.6], [-0.15, -3.6]]);
	const strands = [0, 1, 2].map((i) => { const sw = (i - 1) * 9 + 5 * Math.sin(t * 2.1 + i * 0.8) + 2 * Math.sin(t * 4.7 + i), out: V[] = [top];
		for (let j = 1; j <= 5; j++) { const aa = (sw + j * 2) * RAD; out.push([top[0] + Math.sin(aa) * 0.5 * j * k, top[1] + Math.cos(aa) * 0.5 * j * k]); }
		return out; });
	return <g transform={`translate(${at[0]},${at[1]})`}>
		<g transform={`rotate(${a}) scale(${k})`}><SolidX d={handle} r="gold" c={{OW: c.OW / k, LW: c.LW / k}} />{[-3.0, -2.4, -1.8, -1.2, -0.6, 0.0].map((y) => <rect key={y} x={-0.16} y={y} width={0.32} height={0.26} fill={PAL.blue} />)}</g>
		{strands.map((sg, i) => <g key={i}><polyline points={sg.map((p) => p.join(',')).join(' ')} fill="none" stroke={PAL.ink} strokeWidth={0.3} strokeLinecap="round" />
			{sg.slice(1).map((p, j) => <ellipse key={j} cx={p[0]} cy={p[1]} rx={0.2} ry={0.26} fill={[PAL.blue, PAL.red, PAL.gold, PAL.green][(j + i) % 4]} stroke={PAL.ink} strokeWidth={c.LW * 0.9} />)}</g>)}
		<circle cx={top[0]} cy={top[1]} r={0.3} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW} />
	</g>;
};
/** draw after a God rendered with hide={{props: true}} (mummiform, crook in the front hand, flail in the back): the flail passes BEHIND
    the head, beard and crown; the crook in front; the fists closed over both */
export const OsirisProps: React.FC<{pose: Pose; x: number; y: number; s: number; face?: 1 | -1; t: number; id: string; skin?: string}> = ({pose, x, y, s, face = 1, t, id, skin = PAL.skinO}) => {
	const g = solve(pose), c: Cx = {OW: 2.7 / s, LW: 1.5 / s}, gp = (h: M): V => ap(h, [0.02, 0.6]), bG = gp(g.bH), fG = gp(g.fH);
	return <g transform={`translate(${x},${y}) scale(${s * face},${s})`}>
		<defs><mask id={`${id}-hm`} maskUnits="userSpaceOnUse" x={-60} y={-60} width={120} height={120}>
			<rect x={-60} y={-60} width={120} height={120} fill="white" />
			<g transform={mx(g.head)} fill="black" stroke="black" strokeWidth={2.4 * c.OW}>
				<path d={SHAPES.human} /><path d={SHAPES.beard} /><path d={SHAPES.hedjet} /><path d={SHAPES.horns} />
				<path d={SHAPES.plume} transform="translate(-0.62,-1.85)" /><path d={SHAPES.plume} transform="translate(1.0,-1.85) scale(-1,1)" />
			</g></mask></defs>
		<g mask={`url(#${id}-hm)`}><FlailC at={bG} a={-30} c={c} t={t} /></g>
		<g transform={`translate(${fG[0]},${fG[1]}) scale(1.25) translate(${-fG[0]},${-fG[1]})`}><CrookC at={fG} a={16} c={{OW: c.OW / 1.25, LW: c.LW / 1.25}} /></g>
		{[g.bH, g.fH].map((h, i) => <g key={i}><path d={SHAPES.fist} transform={mx(h)} fill={PAL.ink} stroke={PAL.ink} strokeWidth={2 * c.OW} strokeLinejoin="round" /><path d={SHAPES.fist} transform={mx(h)} fill={skin} />
			<path d="M0.42 0.32Q0.12 0.42 -0.05 0.72" transform={mx(h)} fill="none" stroke={PAL.line} strokeWidth={c.LW} /></g>)}
	</g>;
};
export const _keepC = {eIn, chain, Tm, Rm, Heart};
