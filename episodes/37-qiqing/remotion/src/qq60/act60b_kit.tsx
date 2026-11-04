import React from 'react';
import {God, CAST, POSES, Cast, Pose, solve, Rig, AmmitPose, AMMIT_PIV, wristTo, holdAt, SHAPES} from './rig60';
import {Feather, Heart, Baboon, BAL, balanceGeo, BalancePose, GLYPH_D, GLYPHS, featherD} from './props60';
import {Glow, rng, Stars} from './frame60';
import {KhekherFrieze, RegisterLine, Dado} from './frame60';
import {Ceiling} from './sets60';
import {FeatherCornice} from './props60b';
import {V, M, T, R, chain, ap, mx, sp, poly, Pt, PAL, Role, lerp, cl, sm} from './geo60';

/* act60b helpers (shots 15–33): timing envelopes, figure-frame overlays (brows, horns, tongues, beaks), the gold check and the
   floating glyph columns, the crocodile, the beetles, the baby, the ba bird and its shrine, a clearer Ammit (bigger lion mane,
   claws, a hippo rump that wiggles), a balance copy whose heart / feather / plumb / baboon the shots can drive, the hall wall. */

/* ---------------- timing ---------------- */
/** 0 before t0, eases to 1 over d */
export const up = (t: number, t0: number, d = 0.25) => sm((t - t0) / d);
/** a hit: quick rise just before t0, peak at t0, exponential decay */
export const hit = (t: number, t0: number, d = 0.3, a = 0.05) => (t < t0 - a ? 0 : t < t0 ? sm((t - t0 + a) / a) : Math.exp(-(t - t0) / d));
/** a 0 → 1 → 0 bump between a and b */
export const bell = (t: number, a: number, b: number) => (t <= a || t >= b ? 0 : Math.sin((Math.PI * (t - a)) / (b - a)));
/** keyframed value: keys [t, v] with ease-in-out between */
export const keys = (t: number, k: [number, number][]) => {
	if (t <= k[0][0]) return k[0][1];
	for (let i = 1; i < k.length; i++) if (t <= k[i][0]) return lerp(k[i - 1][1], k[i][1], sm((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0])));
	return k[k.length - 1][1];
};
/** paper wear that does not grow with zoom */
export const wearFor = (z: number, base = 0.35) => Math.max(0.08, base - 0.3 * Math.max(0, z - 1));

/* ---------------- figure frames ---------------- */
/** world position of a point given in a bone frame of a figure drawn by God at (x, y, s, face) */
export const figXY = (pose: Pose, x: number, y: number, s: number, face: 1 | -1, bone: keyof Rig, p: V, female = false): V => {
	const q = ap(solve(pose, female)[bone], p); return [x + face * s * q[0], y + s * q[1]]; };
/** draw children in a bone frame of a figure (same transform as God) */
export const InBone: React.FC<{pose: Pose; x: number; y: number; s: number; face?: 1 | -1; bone: keyof Rig; female?: boolean; children?: React.ReactNode; o?: number}> = ({pose, x, y, s, face = 1, bone, female, children, o}) =>
	<g opacity={o} transform={`translate(${x},${y}) scale(${s * face},${s})`}><g transform={mx(solve(pose, female)[bone])}>{children}</g></g>;
/** (x, y) for a figure so that the head-frame point `p` lands on world point `at` */
export const placeBy = (pose: Pose, s: number, face: 1 | -1, bone: keyof Rig, p: V, at: V, female = false): V => {
	const q = ap(solve(pose, female)[bone], p); return [at[0] - face * s * q[0], at[1] - s * q[1]]; };
export const gripOf = (pose: Pose, side: 'b' | 'f', female = false): V => ap(solve(pose, female)[side === 'b' ? 'bH' : 'fH'], [0.02, 0.6]);

type C = {OW: number; LW: number};
const cx = (s: number): C => ({OW: 2.7 / s, LW: 1.5 / s});
const col = (r: Role | string) => (PAL as Record<string, string>)[r] ?? r;
const Solid: React.FC<{d: string; r: Role | string; c: C; m?: M; k?: number; o?: number}> = ({d, r, c, m, k = 1, o}) => <g transform={m && mx(m)} opacity={o}>
	<path d={d} fill={PAL.ink} stroke={PAL.ink} strokeWidth={2 * c.OW * k} strokeLinejoin="round" /><path d={d} fill={col(r)} /></g>;

/* ---------------- the judges ---------------- */
const J = (o: Partial<Cast>): Cast => ({...CAST.ani, name: 'judge', wig: 'tri', crown: 'maat', dress: 'mummy', collar: 'god', bHand: 'fist', fHand: 'fist', bProp: 'none', fProp: 'none', ...o});
export const JUDGE: Record<'red' | 'green' | 'gold' | 'jackal' | 'falcon' | 'ibis' | 'horned', Cast> = {
	red: J({name: 'jr', skin: 'skinM', skin2: 'skinM2'}),
	green: J({name: 'jg', skin: 'skinO', skin2: 'skinO2'}),
	gold: J({name: 'jy', skin: 'skinF', skin2: 'gold2'}),
	jackal: {...CAST.anubis, crown: 'maat', dress: 'mummy', bProp: 'none', fProp: 'none'},
	falcon: {...CAST.horus, crown: 'maat', dress: 'mummy', bProp: 'none', fProp: 'none'},
	ibis: {...CAST.thoth, crown: 'maat', dress: 'mummy', bProp: 'none', fProp: 'none'},
	horned: J({name: 'jh', skin: 'skinM2', skin2: 'skinM2', crown: 'none', wigColor: 'wigH'}),
};
/** a seated judge: hands at the chest, the front fist a little forward so a held knife / feather stays clear of the face */
export const jPose = (t = 0, k = 0, o: {lean?: number; head?: number; neck?: number} = {}): Pose => {
	let p: Pose = {...POSES.throne, y: 5.95, lean: o.lean ?? -2, neck: o.neck ?? 0, head: (o.head ?? 0) + 0.8 * Math.sin(t * 0.9 + k * 1.7)};
	p = wristTo(holdAt(p, 'f', [2.3, -4.2]), 'f', 92);
	return wristTo(holdAt(p, 'b', [1.1, -4.6]), 'b', 98);
};
/** a knife held blade-up at the grip (figure units), longer than the rig's, with an optional glint (0..1) */
export const BigKnife: React.FC<{at: V; c: C; L?: number; glint?: number; a?: number}> = ({at, c, L = 3.8, glint = 0, a = 0}) => <g transform={`translate(${at[0]},${at[1]}) rotate(${a})`}>
	<Solid d={sp([[-0.18, 1.0, 1], [0.18, 1.0, 1], [0.18, -0.2, 1], [-0.18, -0.2, 1]])} r="wood" c={c} />
	<rect x={-0.3} y={-0.36} width={0.6} height={0.18} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW} />
	<Solid d={sp([[-0.22, -0.34, 1], [0.3, -0.34, 1], [0.4, -L * 0.55], [0.12, -L, 1], [-0.14, -L * 0.6]], true, 0.16)} r="#E9E4D8" c={c} />
	<path d={`M0.08 -0.5L0.2 ${-L * 0.55}L0.1 ${-L * 0.92}`} fill="none" stroke="#FFFFFF" strokeWidth={c.LW * 2} opacity={0.5 + 0.5 * glint} />
	{glint > 0.01 && <g style={{mixBlendMode: 'screen'}}>
		<ellipse cx={0.15} cy={-L * 0.8} rx={2.2 * glint} ry={2.2 * glint} fill="url(#g60-white)" opacity={0.9 * glint} />
		<path d={`M0.15 ${-L * 0.8 - 2.6 * glint}L0.3 ${-L * 0.8 - 0.15}L${0.15 + 2.6 * glint} ${-L * 0.8}L0.3 ${-L * 0.8 + 0.15}L0.15 ${-L * 0.8 + 2.6 * glint}L0 ${-L * 0.8 + 0.15}L${0.15 - 2.6 * glint} ${-L * 0.8}L0 ${-L * 0.8 - 0.15}Z`} fill="#FFFDF0" opacity={glint} />
	</g>}
</g>;
/** a seated judge on a block throne, with a feather or a knife in the front fist (props drawn clear of the face) */
export const Judge: React.FC<{id: string; cast: Cast; pose: Pose; x: number; y: number; s: number; face?: 1 | -1; t: number; hold?: 'knife' | 'feather' | 'none'; glint?: number; seat?: string; children?: React.ReactNode}> = ({id, cast, pose, x, y, s, face = -1, t, hold = 'knife', glint = 0, seat = PAL.blue, children}) => {
	const c = cx(s), G = gripOf(pose, 'f');
	return <g>
		<g transform={`translate(${x},${y}) scale(${s * face},${s})`}>
			<path d={poly([[-2.3, -5.9], [1.6, -5.9], [1.6, 0], [-2.3, 0]])} fill={seat} stroke={PAL.ink} strokeWidth={c.OW * 1.6} />
			<path d={poly([[-2.6, -6.4], [-1.7, -6.4], [-1.7, 0], [-2.6, 0]])} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.OW * 1.2} />
			<path d={poly([[-2.3, -1.0], [1.6, -1.0], [1.6, -0.75], [-2.3, -0.75]])} fill={PAL.gold} />
		</g>
		<God id={id} cast={cast} pose={pose} x={x} y={y} s={s} face={face} sec={{t}} />
		<g transform={`translate(${x},${y}) scale(${s * face},${s})`}>
			{hold === 'knife' && <BigKnife at={G} c={c} L={3.2} glint={glint} />}
			{hold === 'feather' && <g transform={`translate(${G[0]},${G[1] + 0.4}) rotate(${4 * Math.sin(t * 1.3)})`}><Feather c={c} h={3.0} /></g>}
			{children}
		</g>
	</g>;
};

/** a cheap seated mummiform judge for far rows (no bead net): seat, shroud silhouette, collar, fists, head, wig, Ma'at feather, knife or feather */
export const MiniJudge: React.FC<{cast: Cast; s: number; seat?: string; hold?: 'knife' | 'feather'}> = ({cast, s, seat = PAL.blue, hold = 'knife'}) => {
	const c = cx(s), SHp = SHAPES as Record<string, string>, head = cast.head, H = `translate(0.32,-13.62) scale(1.13)`;
	const body = sp([[-1.6, -5.4, 1], [-1.75, -9.5], [-1.5, -11.7], [-0.6, -12.5], [1.3, -12.5], [2.2, -11.8], [2.3, -10.2], [1.9, -8.2], [1.6, -6.7], [3.6, -6.5], [4.4, -6.0], [4.4, -4.9], [4.1, -1.2], [4.9, -0.5], [5.0, 0, 1], [3.0, 0, 1], [3.1, -1.4], [3.0, -4.7], [0.2, -4.9], [-1.5, -4.9]], true, 0.14);
	const wig = head === 'human' ? SHp.wigTri : SHp.wigTriAnimal, hs = head === 'jackal' ? SHp.jackal : head === 'ibis' ? SHp.ibis : head === 'falcon' ? SHp.falcon : SHp.human;
	const hf = head === 'human' ? col(cast.skin) : col(cast.headFill ?? cast.skin);
	return <g transform={`scale(${s})`}>
		<path d={poly([[-2.3, -5.9], [1.6, -5.9], [1.6, 0], [-2.3, 0]])} fill={seat} stroke={PAL.ink} strokeWidth={c.OW * 1.6} />
		<path d={poly([[-2.6, -6.4], [-1.7, -6.4], [-1.7, 0], [-2.6, 0]])} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.OW * 1.2} />
		<path d={body} fill={PAL.linen} stroke={PAL.ink} strokeWidth={c.OW * 2} />
		{[-9.5, -7.5, -3.5, -1.8].map((y, i) => <path key={i} d={`M${i < 2 ? -1.4 : 3.2} ${y}L${i < 2 ? 1.9 : 4.2} ${y - 0.5}`} stroke={PAL.turq} strokeWidth={c.LW * 1.4} opacity={0.8} />)}
		<path d="M-1.6 -6.4L1.7 -6.4" stroke={PAL.red} strokeWidth={c.LW * 4} />
		<path d={`M-1.3 -12.2A1.9 1.4 0 0 0 2.1 -12.2`} fill="none" stroke={PAL.ink} strokeWidth={c.OW * 4.6} />
		<path d={`M-1.3 -12.2A1.9 1.4 0 0 0 2.1 -12.2`} fill="none" stroke={PAL.blue} strokeWidth={c.OW * 2.6} />
		<path d={`M-0.9 -12.3A1.5 1.0 0 0 0 1.7 -12.3`} fill="none" stroke={PAL.red} strokeWidth={c.OW * 1.4} />
		{hold === 'knife' ? <path d="M2.55 -9.6L2.62 -12.1L2.82 -9.6Z" fill="#E9E4D8" stroke={PAL.ink} strokeWidth={c.LW} /> : <path d={featherD(2.6)} transform="translate(2.5,-9.4)" fill={PAL.linen} stroke={PAL.ink} strokeWidth={c.LW} />}
		<circle cx={2.25} cy={-9.4} r={0.45} fill={col(cast.skin)} stroke={PAL.ink} strokeWidth={c.LW} /><circle cx={1.6} cy={-8.9} r={0.42} fill={col(cast.skin)} stroke={PAL.ink} strokeWidth={c.LW} />
		<g transform={H}>
			{head !== 'human' && <path d={wig} fill={col(cast.wigColor ?? 'wig')} stroke={PAL.ink} strokeWidth={c.OW * 1.6} />}
			<path d={hs} fill={hf} stroke={PAL.ink} strokeWidth={c.OW * 1.8} />
			{head === 'human' && <path d={wig} fill={col(cast.wigColor ?? 'wig')} stroke={PAL.ink} strokeWidth={c.OW * 1.6} />}
			<ellipse cx={head === 'ibis' ? 0.62 : head === 'jackal' ? 1.4 : 1.0} cy={head === 'ibis' ? -1.32 : -1.25} rx={0.2} ry={0.12} fill={head === 'human' ? PAL.eye : PAL.gold} />
			{cast.crown === 'maat' && <path d={featherD(2.8)} transform="translate(-0.6,-1.95)" fill={PAL.linen} stroke={PAL.ink} strokeWidth={c.LW * 1.2} />}
		</g>
	</g>;
};

/* ---------------- head-frame overlays (human head: eye at (0.98, -1.17), L 0.48) ---------------- */
/** the horns of the horned judge (head frame, profile): two long ibex horns sweeping up and back; far horn first */
export const Horns: React.FC<{c: C; t?: number}> = ({c, t = 0}) => {
	const horn = (dx: number, k: number, fill: string) => { const w = 0.02 * Math.sin(t * 1.1);
		const d = sp([[0.25 + dx, -2.2, 1], [0.6 + dx, -2.55], [0.7 + dx, -3.4], [0.45 + dx, -4.4], [-0.15 + dx, -5.3 + w], [-0.95 + dx, -5.85], [-1.6 + dx, -5.75, 1], [-1.0 + dx, -5.45], [-0.45 + dx, -4.85], [-0.05 + dx, -4.0], [0.05 + dx, -3.1], [-0.25 + dx, -2.35, 1]].map((p) => [p[0] * k, p[1] * k + (1 - k) * -2.2, p[2]] as Pt), true, 0.18);
		const Y = (yy: number) => yy * k + (1 - k) * -2.2;
		const knobs = [[0.68, -2.7], [0.72, -3.25], [0.62, -3.8], [0.42, -4.35], [0.1, -4.9], [-0.35, -5.35]].map(([xx, yy], i) => <path key={i} d={`M${(xx + dx) * k - 0.02} ${Y(yy) - 0.16}Q${(xx + dx) * k + 0.2} ${Y(yy)} ${(xx + dx) * k - 0.05} ${Y(yy) + 0.16}`} fill={fill} stroke={PAL.ink} strokeWidth={c.LW * 1.4} />);
		const rings = [[0.05, -2.75, 0.66, -2.95], [0.05, -3.3, 0.7, -3.5], [-0.02, -3.85, 0.6, -4.0], [-0.2, -4.35, 0.4, -4.55], [-0.5, -4.8, 0.08, -5.1], [-0.9, -5.2, -0.38, -5.55]].map(([a, b, c2, d2], i) => <path key={'r' + i} d={`M${(a + dx) * k} ${Y(b)}L${(c2 + dx) * k} ${Y(d2)}`} stroke="#6A5A3A" strokeWidth={c.LW * 2.2} />);
		return <g><Solid d={d} r={fill} c={c} />
			<path d={d} fill="#8A7650" opacity={0.35} transform={`translate(0,${0.25 * k}) scale(1,0.92)`} />{rings}{knobs}</g>; };
	return <g>{horn(-0.55, 0.94, '#A8956A')}{horn(0, 1, '#E6D6A8')}
		<circle cx={-1.45} cy={-5.72} r={0.16} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW} /></g>;
};
/** paint over the rig's brow and draw it again, raised by `raise` (0..1) and arched */
export const BrowRaise: React.FC<{c: C; raise: number; skin: string}> = ({c, raise, skin}) => {
	const x = 0.98, y = -1.17, L = 0.48, dy = -0.5 * raise, arch = 0.18 * raise;
	return <g>
		<path d={poly([[x - L * 1.0, y - L * 0.72], [x + L * 0.55, y - L * 0.72], [x + L * 0.55, y - L * 0.4], [x - L * 1.0, y - L * 0.4]])} fill={skin} />
		<path d={sp([[x + L * 0.55, y - L * 0.5 + dy * 0.6], [x - L * 0.1, y - L * 0.72 + dy - arch], [x - L * 0.8, y - L * 0.56 + dy * 0.8], [x - L * 1.0, y - L * 0.4 + dy * 0.7, 1], [x - L * 0.55, y - L * 0.44 + dy * 0.85], [x - L * 0.05, y - L * 0.5 + dy - arch], [x + L * 0.45, y - L * 0.36 + dy * 0.6, 1]], true, 0.15)} fill={PAL.black} />
		{raise > 0.3 && [0, 1].map((k) => <path key={k} d={`M${x - L * 0.55} ${y - L * (0.95 + k * 0.22) + dy}Q${x - L * 0.1} ${y - L * (1.05 + k * 0.22) + dy} ${x + L * 0.3} ${y - L * (0.95 + k * 0.22) + dy}`} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 0.9} opacity={0.5 * (raise - 0.3)} />)}
	</g>;
};
/** an eyelid that narrows the rig's human eye: squint 0..1 */
export const Squint: React.FC<{c: C; k: number; skin: string; x?: number; y?: number; L?: number}> = ({c, k, skin, x = 0.98, y = -1.17, L = 0.48}) => {
	const h = L * 0.36, top = y - h * 1.3, lid = y - h + 1.45 * h * k;
	return <g><path d={poly([[x - L * 0.62, top], [x + L * 0.52, top], [x + L * 0.52, lid], [x - L * 0.62, lid + h * 0.15]])} fill={skin} />
		<path d={`M${x - L * 0.6} ${lid + h * 0.15}L${x + L * 0.48} ${lid}`} stroke={PAL.black} strokeWidth={c.LW * 2.2} strokeLinecap="round" /></g>;
};
/** a tongue flicking out of a jackal's snout (head frame), out 0..1 */
export const JackalTongue: React.FC<{c: C; out: number}> = ({c, out}) => out <= 0.01 ? null : <g>
	<Solid d={sp([[2.6, -0.62], [2.6 + 0.9 * out, -0.55 + 0.25 * out], [2.75 + 1.05 * out, -0.25 + 0.45 * out], [2.55 + 0.75 * out, -0.2 + 0.4 * out], [2.45, -0.45]], true, 0.2)} r="#E0566A" c={c} />
	<path d={`M2.6 -0.5Q${2.6 + 0.5 * out} ${-0.35 + 0.2 * out} ${2.65 + 0.8 * out} ${-0.2 + 0.35 * out}`} fill="none" stroke="#9E2B3A" strokeWidth={c.LW} />
</g>;
/** an ibis's lower beak opening (head frame): open 0..1 (degrees ×22) */
export const IbisGape: React.FC<{c: C; open: number}> = ({c, open}) => {
	const a = 22 * open, base: V = [1.05, -0.92];
	const lower = sp([[1.0, -0.9], [1.6, -0.86], [2.3, -0.58], [2.95, -0.22], [3.36, 0.14, 1], [3.1, 0.12], [2.6, -0.12], [1.9, -0.45], [1.25, -0.62], [0.95, -0.7]], true, 0.16);
	return <g>
		{open > 0.02 && <path d={poly([[1.0, -0.9], [3.4, 0.15], ap(chain(T(base[0], base[1]), R(a), T(-base[0], -base[1])), [3.36, 0.14])])} fill="#3A0E14" />}
		<Solid d={lower} r={PAL.ibis2} c={c} m={chain(T(base[0], base[1]), R(a), T(-base[0], -base[1]))} />
	</g>;
};

/* ---------------- gold glyphs, the check mark, sweat ---------------- */
/** a vertical stack of n gold signs (cell px), centred on x, top y; o = opacity, glow behind */
export const GlyphStack: React.FC<{x: number; y: number; cell: number; n: number; seed: number; o?: number; color?: string; glow?: number}> = ({x, y, cell, n, seed, o = 1, color = '#F4C84E', glow = 0.6}) => {
	const R_ = rng(seed);
	return <g opacity={o}>
		{glow > 0 && <Glow x={x} y={y + (n * cell * 1.05) / 2} r={cell * 1.2} ry={n * cell * 0.75} c="gold" o={glow} />}
		<g transform={`translate(${x - cell / 2},${y}) scale(${cell})`}>
			{Array.from({length: n}, (_, j) => { const g = GLYPH_D[GLYPHS[Math.floor(R_() * GLYPHS.length)]];
				return <path key={j} d={g.d} transform={`translate(0,${j * 1.05})`} fill={color} stroke="#5A3A08" strokeWidth={1.6 / cell} strokeLinejoin="round" />; })}
		</g></g>;
};
/** the gold tick: pops at t0 (overshoot), a ring flies out */
export const Check: React.FC<{x: number; y: number; t: number; t0: number; s?: number}> = ({x, y, t, t0, s = 1}) => {
	if (t < t0 - 0.03) return null;
	const u = t - t0, k = u < 0.09 ? lerp(0.3, 1.35, sm((u + 0.03) / 0.12)) : 1 + 0.35 * Math.exp(-(u - 0.09) / 0.1), ring = cl(u / 0.45);
	const d = 'M-20 2L-6 16L22 -18';
	return <g transform={`translate(${x},${y}) scale(${s * k})`}>
		<circle r={34 + 70 * ring} fill="none" stroke="#FFE7A0" strokeWidth={5 * (1 - ring)} opacity={1 - ring} />
		<circle r={56} fill="url(#g60-gold)" opacity={0.8} style={{mixBlendMode: 'screen'}} />
		<circle r={30} fill="#1B2652" stroke={PAL.gold} strokeWidth={4} />
		<path d={d} fill="none" stroke={PAL.ink} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
		<path d={d} fill="none" stroke="#F8D04A" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
	</g>;
};
/** a cartoon sweat drop, sliding down from (x, y) by `slide` px */
export const Sweat: React.FC<{x: number; y: number; k: number; slide?: number; s?: number}> = ({x, y, k, slide = 0, s = 1}) => k <= 0 ? null :
	<g transform={`translate(${x},${y + slide}) scale(${s * (0.6 + 0.4 * k)})`} opacity={k}>
		<path d="M0 -26C8 -12 14 -2 14 7A14 14 0 0 1 -14 7C-14 -2 -8 -12 0 -26Z" fill="#BFE6FF" stroke={PAL.ink} strokeWidth={3} />
		<path d="M-6 2Q-6 8 -1 10" fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
	</g>;

/* ---------------- the crocodile (flat, side view, facing +x; ground y = 0; snout tip at x ≈ 8.6) ---------------- */
export const Croc: React.FC<{x: number; y: number; s: number; face?: 1 | -1; t: number; jaw?: number; walk?: number; lift?: number}> = ({x, y, s, face = 1, t, jaw = 0, walk = 0, lift = 0}) => {
	const c = cx(s), tw = 0.35 * Math.sin(t * 3.1), lg = (k: number) => 0.35 * Math.sin(walk + k * Math.PI);
	const tail = sp([[-3.0, -2.1], [-5.0, -1.7 + tw * 0.3], [-7.2, -1.1 + tw * 0.7], [-9.4, -0.55 + tw], [-9.6, -0.42 + tw, 1], [-7.2, -0.62 + tw * 0.7], [-5.0, -0.7 + tw * 0.3], [-3.0, -0.75]], true, 0.18);
	const body = sp([[-3.4, -0.8], [-3.3, -1.95], [-1.0, -2.45], [1.6, -2.4], [3.4, -2.1], [4.2, -1.9], [4.3, -1.0], [3.2, -0.6], [0.5, -0.45], [-2.0, -0.55]], true, 0.18);
	const leg = (bx: number, k: number) => { const sw = lg(k); return sp([[bx - 0.5, -1.0], [bx + 0.5, -1.0], [bx + 0.6 + sw, -0.35], [bx + 1.25 + sw, -0.05], [bx + 1.3 + sw, 0, 1], [bx - 0.15 + sw, 0, 1], [bx - 0.2 + sw, -0.4]], true, 0.18); };
	const hinge: V = [4.1, -1.35], jm = chain(T(hinge[0], hinge[1]), R(jaw), T(-hinge[0], -hinge[1]));
	const upper = sp([[3.9, -2.0], [4.6, -2.45], [5.3, -2.3], [7.2, -1.85], [8.3, -1.6], [8.75, -1.35], [8.6, -1.1, 1], [4.3, -1.3, 1], [3.8, -1.5]], true, 0.16);
	const lower = sp([[4.0, -1.3, 1], [8.5, -1.12, 1], [8.45, -0.85], [7.0, -0.8], [5.0, -0.8], [4.0, -0.95]], true, 0.16);
	const teeth = (y0: number, dir: number, m?: M) => <g transform={m && mx(m)}>{Array.from({length: 10}, (_, i) => { const xx = 4.6 + i * 0.4; return <path key={i} d={`M${xx} ${y0}L${xx + 0.13} ${y0 + dir * 0.28}L${xx + 0.26} ${y0}Z`} fill={PAL.white} stroke={PAL.ink} strokeWidth={c.LW * 0.6} />; })}</g>;
	return <g transform={`translate(${x},${y - lift * s}) scale(${s * face},${s})`}>
		<path d={leg(-2.2, 1)} fill={PAL.croc2} stroke={PAL.ink} strokeWidth={c.OW * 2} /><path d={leg(2.3, 0)} fill={PAL.croc2} stroke={PAL.ink} strokeWidth={c.OW * 2} />
		<Solid d={tail} r="croc" c={c} />
		<Solid d={body} r="croc" c={c} />
		<path d="M-3.2 -0.85Q0.5 -0.45 4.1 -1.05" fill="none" stroke="#C9C27A" strokeWidth={c.LW * 5} opacity={0.8} />
		{Array.from({length: 16}, (_, i) => { const xx = -8.6 + i * 0.75, yy = xx < -3 ? lerp(-0.6 + tw, -2.05, (xx + 9.4) / 6.4) : -2.35 - 0.1 * Math.sin(xx); return <path key={i} d={`M${xx - 0.22} ${yy + 0.05}L${xx} ${yy - 0.32}L${xx + 0.22} ${yy + 0.05}Z`} fill={PAL.croc2} stroke={PAL.ink} strokeWidth={c.LW * 0.7} />; })}
		{[-1.6, -0.4, 0.8, 2.0].map((xx) => <path key={xx} d={`M${xx} -2.3L${xx + 0.1} -0.7`} stroke={PAL.croc2} strokeWidth={c.LW * 1.2} />)}
		<path d={leg(-1.6, 0)} fill={PAL.croc} stroke={PAL.ink} strokeWidth={c.OW * 2} /><path d={leg(2.9, 1)} fill={PAL.croc} stroke={PAL.ink} strokeWidth={c.OW * 2} />
		{jaw > 1 && <path d={poly([[4.1, -1.3], [8.6, -1.12], ap(jm, [8.5, -1.0])])} fill="#7A1E1A" />}
		{teeth(-1.12, -1, jm)}
		<Solid d={lower} r="croc" c={c} m={jm} />
		{teeth(-1.28, 1)}
		<Solid d={upper} r="croc" c={c} />
		<ellipse cx={5.0} cy={-2.42} rx={0.42} ry={0.3} fill={PAL.croc} stroke={PAL.ink} strokeWidth={c.LW * 1.2} />
		<ellipse cx={5.05} cy={-2.45} rx={0.22} ry={0.16} fill="#FFD95A" stroke={PAL.ink} strokeWidth={c.LW * 0.8} /><ellipse cx={5.08} cy={-2.45} rx={0.05} ry={0.14} fill={PAL.ink} />
		<ellipse cx={8.45} cy={-1.65} rx={0.1} ry={0.06} fill={PAL.ink} />
	</g>;
};
/** scarab beetles scattering away from (x, y) after t0 (they sit still before); n beetles, world px */
export const Beetles: React.FC<{x: number; y: number; t: number; t0: number; n?: number; seed?: number; r?: number; s?: number; floor?: number}> = ({x, y, t, t0, n = 10, seed = 3, r = 140, s = 1, floor}) => {
	const R_ = rng(seed);
	return <g>{Array.from({length: n}, (_, i) => {
		const a = (R_() - 0.5) * Math.PI * 1.1 + (i % 2 ? 0 : Math.PI), sp_ = 620 + R_() * 420, u = Math.max(0, t - t0 - R_() * 0.08), d = r * 0.4 + R_() * r * 0.6 + sp_ * u;
		const bx = x + Math.cos(a) * d, by = (floor ?? y) + (floor !== undefined ? (R_() - 0.5) * 30 : Math.sin(a) * d * 0.35), dir = Math.cos(a) > 0 ? 0 : 180, leg = Math.sin(t * 40 + i) * (u > 0 ? 1 : 0.15);
		return <g key={i} transform={`translate(${bx},${by}) rotate(${dir}) scale(${s * (0.8 + R_() * 0.4)})`}>
			{[-1, 1].map((sg) => [-5, 0, 5].map((lx) => <line key={`${sg}${lx}`} x1={lx} y1={0} x2={lx + 3 * leg} y2={sg * 9} stroke={PAL.ink} strokeWidth={2.2} />))}
			<ellipse cx={0} cy={0} rx={10} ry={7} fill="#2E6A5A" stroke={PAL.ink} strokeWidth={2} />
			<path d="M-9 0L9 0" stroke={PAL.ink} strokeWidth={1.5} />
			<ellipse cx={11} cy={0} rx={4} ry={4.5} fill="#24504A" stroke={PAL.ink} strokeWidth={2} />
			<ellipse cx={-3} cy={-3} rx={4.5} ry={1.8} fill="#9FE0C0" opacity={0.7} />
			<ellipse cx={-3} cy={3} rx={4.5} ry={1.8} fill="#9FE0C0" opacity={0.4} />
		</g>; })}</g>;
};

/* ---------------- the baby (seated, swaddled in linen, sidelock of youth, a milk cup in both hands); faces +x; origin = seat ---------------- */
export const Baby: React.FC<{x: number; y: number; s: number; t: number; bounce?: number; giggle?: number}> = ({x, y, s, t, bounce = 0, giggle = 0}) => {
	const c = cx(s), b = bounce * Math.abs(Math.sin(t * 14)) * 0.25;
	return <g transform={`translate(${x},${y - b * s}) scale(${s})`}>
		<Solid d={sp([[-1.9, 0, 1], [1.9, 0, 1], [2.0, -1.2], [1.4, -2.8], [0.2, -3.4], [-1.2, -3.0], [-1.95, -1.6]], true, 0.2)} r="linen" c={c} />
		{[-1.0, -0.2, 0.6].map((xx) => <path key={xx} d={`M${xx} -0.1Q${xx + 0.3} -1.6 ${xx + 0.9} -2.8`} fill="none" stroke={PAL.linen2} strokeWidth={c.LW * 1.4} />)}
		<path d="M-1.9 -0.15L1.9 -0.15" stroke={PAL.red} strokeWidth={c.LW * 3} />
		<g transform={`rotate(${4 * Math.sin(t * 3) + 6 * giggle} 0.3 -3.4)`}>
			<Solid d={sp([[-1.1, -3.6], [-1.4, -4.8], [-0.7, -5.9], [0.6, -6.1], [1.6, -5.4], [1.9, -4.75], [2.2, -4.42], [1.95, -4.2], [1.9, -3.8], [1.4, -3.35], [0.4, -3.2]], true, 0.2)} r="#C8683C" c={c} />
			<path d="M0.05 -4.75Q-0.3 -4.6 -0.25 -4.2Q-0.1 -3.95 0.15 -4.15" fill="#B0552E" stroke={PAL.ink} strokeWidth={c.LW * 1.2} />
			{/* sidelock of youth */}
			<path d="M-0.9 -5.6Q-1.9 -5.0 -1.7 -3.8Q-1.6 -3.0 -2.0 -2.6" fill="none" stroke={PAL.ink} strokeWidth={c.LW * 7} strokeLinecap="round" />
			<path d="M-0.9 -5.6Q-1.9 -5.0 -1.7 -3.8Q-1.6 -3.0 -2.0 -2.6" fill="none" stroke="#2B2224" strokeWidth={c.LW * 4.5} strokeLinecap="round" />
			<path d="M0.95 -4.75Q1.2 -4.95 1.45 -4.72" fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.8} strokeLinecap="round" />
			<ellipse cx={1.2} cy={-4.55} rx={0.13} ry={0.17} fill={PAL.ink} />
			<path d={`M1.35 -3.85Q1.62 ${-3.65 + 0.12 * giggle} 1.85 -3.9`} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.6} strokeLinecap="round" />
			<circle cx={1.0} cy={-3.95} r={0.25} fill="#F09A80" opacity={0.5} />
		</g>
		{/* the milk cup in both hands */}
		<Solid d={sp([[0.9, -2.4], [2.3, -2.4], [2.15, -1.55], [1.6, -1.25], [1.05, -1.55]], true, 0.2)} r="#E9DDBF" c={c} />
		<path d={poly([[0.95, -2.4], [2.25, -2.4], [2.2, -2.2], [1.0, -2.2]])} fill="#FFFFFF" />
		<path d="M0.95 -2.25Q1.6 -2.0 2.25 -2.25" fill="none" stroke={PAL.blue} strokeWidth={c.LW * 2} />
		{[0.75, 2.35].map((hx) => <ellipse key={hx} cx={hx} cy={-1.85} rx={0.33} ry={0.4} fill="#C8683C" stroke={PAL.ink} strokeWidth={c.LW * 1.2} />)}
	</g>;
};

/* ---------------- the ba bird (human-headed falcon) and a little shrine (naos) ---------------- */
export const BaBird: React.FC<{x: number; y: number; s: number; t: number; face?: 1 | -1; tilt?: number; beak?: number}> = ({x, y, s, t, face = 1, tilt = 0, beak = 0}) => {
	const c = cx(s), br = 0.04 * Math.sin(t * 3);
	return <g transform={`translate(${x},${y}) scale(${s * face},${s})`}>
		<Solid d={sp([[-2.6, -1.2], [-1.4, -2.0], [0.4, -2.3], [1.1, -1.7], [1.0, -0.8], [0.2, -0.3], [-1.2, -0.4], [-2.8, -0.75]], true, 0.18)} r="gold" c={c} />
		{[0, 1, 2].map((i) => <path key={i} d={sp([[-2.4 + i * 0.4, -1.2 - i * 0.2], [-0.4 + i * 0.3, -1.85 + br], [0.6, -1.5 + i * 0.25], [-0.6 + i * 0.3, -0.9 + i * 0.15]], true, 0.2)} fill={[PAL.blue, PAL.green, PAL.red][i]} stroke={PAL.ink} strokeWidth={c.LW} opacity={0.95} />)}
		<path d="M-2.7 -0.9L-3.9 -0.55L-3.7 -0.2L-2.4 -0.4Z" fill={PAL.blue} stroke={PAL.ink} strokeWidth={c.LW * 1.2} />
		{[[-0.3, 0], [0.4, 0]].map(([lx], i) => <path key={i} d={`M${lx} -0.35L${lx + 0.1} 0M${lx + 0.1} 0L${lx + 0.45} 0`} stroke="#D8902E" strokeWidth={c.LW * 2} />)}
		<g transform={`rotate(${tilt} 0.8 -1.9)`}>
			<Solid d={sp([[0.35, -1.85], [0.4, -2.9], [1.0, -3.35], [1.6, -3.15], [1.75, -2.65], [1.9, -2.35], [1.7, -2.15], [1.55, -1.8], [1.0, -1.6]], true, 0.18)} r="skinM" c={c} />
			<Solid d={sp([[1.25, -3.05], [0.6, -3.45], [-0.05, -3.2], [-0.25, -2.4], [-0.15, -1.4], [0.45, -1.35], [0.6, -2.3], [1.0, -2.75]], true, 0.18)} r="wigH" c={c} />
			<ellipse cx={1.35} cy={-2.72} rx={0.16} ry={0.1} fill={PAL.eye} stroke={PAL.ink} strokeWidth={c.LW * 0.8} /><circle cx={1.38} cy={-2.72} r={0.07} fill={PAL.ink} />
			<path d={`M1.62 ${-2.12 - 0.08 * beak}Q1.75 -2.05 1.7 ${-1.98 + 0.1 * beak}`} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.2} />
			<path d="M0.95 -3.1L1.7 -2.95" stroke={PAL.red} strokeWidth={c.LW * 2} />
		</g>
	</g>;
};
/** a small shrine (naos) on a plinth: cavetto cornice, gold door frame; door opening dark (things peek out of it); x = centre, y = ground */
export const Naos: React.FC<{x: number; y: number; w: number; h: number; front?: boolean; children?: React.ReactNode}> = ({x, y, w, h, front = false, children}) => {
	const top = y - h, dw = w * 0.5, dh = h * 0.55;
	if (front) return <g>{/* the front jamb drawn over whatever peeks out */}
		<path d={poly([[x + dw / 2, y - h * 0.18], [x + w / 2, y - h * 0.18], [x + w / 2, top + h * 0.2], [x + dw / 2, top + h * 0.2]])} fill="#D9C08C" stroke={PAL.ink} strokeWidth={2} />
		<path d={`M${x + dw / 2} ${y - h * 0.18}L${x + dw / 2} ${y - h * 0.18 - dh}`} stroke={PAL.gold} strokeWidth={5} /></g>;
	return <g>
		<rect x={x - w * 0.6} y={y - h * 0.18} width={w * 1.2} height={h * 0.18} fill={PAL.linen} stroke={PAL.ink} strokeWidth={2} />
		{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={x - w * 0.55 + i * w * 0.22} y={y - h * 0.14} width={w * 0.16} height={h * 0.1} fill={[PAL.blue, PAL.red, PAL.green][i % 3]} />)}
		<path d={poly([[x - w / 2, y - h * 0.18], [x + w / 2, y - h * 0.18], [x + w / 2, top + h * 0.2], [x - w / 2, top + h * 0.2]])} fill="#D9C08C" stroke={PAL.ink} strokeWidth={2.4} />
		<rect x={x - dw / 2} y={y - h * 0.18 - dh} width={dw} height={dh} fill="#0E0A14" stroke={PAL.gold} strokeWidth={5} />
		<path d={poly([[x - w / 2 - 6, top + h * 0.2], [x + w / 2 + 6, top + h * 0.2], [x + w / 2 + 16, top], [x - w / 2 - 16, top]])} fill={PAL.linen} stroke={PAL.ink} strokeWidth={2.4} />
		{Array.from({length: 9}, (_, i) => { const u = (i + 0.5) / 9; return <path key={i} d={`M${x - w / 2 - 6 + u * (w + 12)} ${top + h * 0.2 - 3}L${x - w / 2 - 16 + u * (w + 32)} ${top + 3}`} stroke={[PAL.blue, PAL.red, PAL.green][i % 3]} strokeWidth={6} />; })}
		<rect x={x - w / 2 - 16} y={top - 8} width={w + 32} height={8} fill={PAL.gold} stroke={PAL.ink} strokeWidth={2} />
		{children}
	</g>;
};

/* ---------------- Ammit v2 (shared by acts B and C): croc head with long toothy jaws, a lion mane and lion forelegs, hippo hindquarters, crouched.
   One body silhouette with ONE outline (hippo rump and lion forepart meet as fur, no seam); draw order back → front: rim light, far
   hind leg, far foreleg, tail, body, near hind foot, near foreleg (their outlines are masked out inside the body, so legs grow out of it
   without joint lines), mane over the neck joint, mouth, lower jaw, upper teeth, skull, eye.
   Same pivots as the rig's Ammit (facing +x, units, ground y = 0), so poses carry over.
   mr = mane ripple, wig = rump wiggle (deg), look = pupil direction (rad), rim = red rim light,
   roar 0..1 = jaws wide, head thrown forward, body lunges, mane bristles. ---------------- */
export const ammit2Solve = (p: AmmitPose, roar = 0) => {
	const lean = p.lean + 5 * roar, B = chain(T(AMMIT_PIV.hip[0], AMMIT_PIV.hip[1]), R(-lean));
	const N = chain(B, T(AMMIT_PIV.neck[0] + 0.85 * roar, AMMIT_PIV.neck[1] + 0.1 * roar), R(-(p.neck + 4 * roar) + lean * 0.6));
	const J_ = chain(N, T(AMMIT_PIV.jaw[0], AMMIT_PIV.jaw[1]), R(Math.max(p.jaw, 46 * roar)));
	return {B, N, J: J_};
};
const AM_BODY = (br: number) => sp([[-2.6, 2.38, 1], [-3.15, 1.0], [-3.1, -0.7], [-2.45, -2.1], [-0.9, -2.95], [0.9, -3.2], [2.2, -3.5], [3.2, -3.9], [4.2, -3.65], [4.85 + br * 0.08, -2.6], [4.8 + br * 0.1, -1.0], [4.1, 0.3], [2.9, 0.95], [1.7, 1.3], [0.2, 1.9], [-1.4, 2.32]], true, 0.17);
export const Ammit2: React.FC<{pose: AmmitPose; x: number; y: number; s: number; face?: 1 | -1; t?: number; mr?: number; wig?: number; look?: number; rim?: number; roar?: number; id?: string}> = ({pose, x, y, s, face = 1, t = 0, mr = 0, wig = 0, look = 0.6, rim = 0, roar = 0, id = 'am2'}) => {
	const c = cx(s), g = ammit2Solve(pose, roar), br = pose.breathe, bristle = Math.max(roar, 0.35 * mr);
	const W = chain(g.B, T(3.0, -1.6), R(wig), T(-3.0, 1.6));
	const body = AM_BODY(br), paw = pose.paw ?? 0, rimC = '#FF3A1E', ink = PAL.ink;
	const S0 = ap(g.B, [AMMIT_PIV.shoulder[0], AMMIT_PIV.shoulder[1]]);
	// forelegs between the (moving) shoulder and the (planted) paw: fill shape grows up into the chest; outline only below
	const fore = (dx: number, pw: number) => { const S: V = [S0[0] + dx * 0.5, S0[1]], P: V = [3.35 + dx + pw, 0];
		const fill = sp([[S[0] - 1.05, S[1] - 0.5], [S[0] + 0.95, S[1] - 0.7], [S[0] + 0.85, S[1] + 1.2], [P[0] + 0.5, P[1] - 1.6], [P[0] + 0.62, P[1] - 0.62], [P[0] + 1.5, P[1] - 0.45], [P[0] + 1.66, P[1], 1], [P[0] - 0.58, P[1], 1], [P[0] - 0.52, P[1] - 1.5], [S[0] - 0.62, S[1] + 1.4]], true, 0.17);
		const edge = sp([[S[0] + 0.85, S[1] + 1.2], [P[0] + 0.5, P[1] - 1.6], [P[0] + 0.62, P[1] - 0.62], [P[0] + 1.5, P[1] - 0.45], [P[0] + 1.66, P[1], 1], [P[0] - 0.58, P[1], 1], [P[0] - 0.52, P[1] - 1.5], [S[0] - 0.62, S[1] + 1.4]], false, 0.17);
		const claws = [0.62, 1.02, 1.42].map((k) => <path key={k} d={`M${P[0] + k} -0.1L${P[0] + k + 0.36} 0.04L${P[0] + k + 0.04} 0.07Z`} fill="#F8F3E7" stroke={ink} strokeWidth={c.LW * 0.7} />);
		const toes = [0.45, 0.85].map((k) => <path key={k} d={`M${P[0] + k + 0.15} -0.02L${P[0] + k + 0.05} -0.34`} stroke={ink} strokeWidth={c.LW} />);
		return {fill, edge, claws, toes}; };
	const far = fore(-0.95, 0), near = fore(0, paw);
	// near hind foot, planted forward under the belly (fill grows up into the haunch)
	const hf = ap(W, [0.45, 2.4]), hind = {fill: sp([[hf[0] - 1.6, hf[1] - 2.2], [hf[0] + 0.5, hf[1] - 2.0], [hf[0] + 1.35, hf[1] - 0.62], [hf[0] + 1.55, hf[1] - 0.1], [hf[0] + 1.5, 0, 1], [hf[0] - 1.0, 0, 1], [hf[0] - 1.5, -0.6]], true, 0.17),
		edge: sp([[hf[0] + 0.62, hf[1] - 1.75], [hf[0] + 1.35, hf[1] - 0.62], [hf[0] + 1.55, hf[1] - 0.1], [hf[0] + 1.5, 0, 1], [hf[0] - 1.0, 0, 1], [hf[0] - 1.5, -0.6], [hf[0] - 1.62, hf[1] - 1.3]], false, 0.17)};
	const farHind = sp([[1.0, 0.9], [2.4, 0.8], [2.5, 1.9], [2.8, 2.4, 1], [1.1, 2.4, 1], [0.95, 1.8]], true, 0.17);
	const tailM = chain(W, T(-3.0, -0.5), R(30 + pose.tail + 5 * Math.sin(t * 1.7)));
	const tail = sp([[-0.2, -0.1], [0.22, -0.05], [0.24, 0.7], [0.34, 1.25], [-0.12, 1.32], [-0.3, 0.7]]);
	// the mane: a ruff of locks round the neck joint (back, top, chin), bristling on the roar
	const NL = 22, a0 = 62, a1 = 336, mane = sp([...Array.from({length: NL * 2 + 1}, (_, i) => { const a = (a0 + (i / (NL * 2)) * (a1 - a0)) * Math.PI / 180, out = i % 2 === 0;
		const rr = out ? 2.55 + 0.28 * Math.sin(i * 1.7) + 0.75 * bristle + 0.2 * mr * Math.sin(t * 17 + i) + 0.06 * bristle * Math.sin(t * 40 + i * 2) : 1.95 + 0.25 * bristle;
		return [-0.5 + Math.cos(a) * rr * 0.95, 0.55 + Math.sin(a) * rr * 1.12] as Pt; }), [0.9, 0.0], [0.55, 1.4]], true, 0.1);
	const maneIn = sp(Array.from({length: NL * 2 + 1}, (_, i) => { const a = (a0 + 8 + (i / (NL * 2)) * (a1 - a0 - 16)) * Math.PI / 180, out = i % 2 === 0;
		const rr = out ? 1.9 + 0.18 * Math.sin(i * 2.3) + 0.45 * bristle + 0.15 * mr * Math.sin(t * 17 + i + 1) : 1.4;
		return [-0.4 + Math.cos(a) * rr * 0.95, 0.5 + Math.sin(a) * rr * 1.1] as Pt; }), true, 0.1);
	// the head: long croc skull and lower jaw, interlocking teeth, a raised eye under a heavy brow
	const skull = sp([[-0.55, -1.15], [0.2, -1.78], [1.1, -2.08], [1.75, -2.38], [2.45, -2.0], [3.4, -1.64], [4.8, -1.34], [6.0, -1.16], [6.42, -1.32], [6.86, -1.06], [6.95, -0.6, 1], [6.6, -0.16, 1], [4.0, -0.1], [1.2, -0.08, 1], [0.3, 0.15], [-0.45, 0.25]], true, 0.16);
	const jawD = sp([[-1.05, -0.12, 1], [5.95, -0.14, 1], [6.18, 0.08], [5.6, 0.44], [3.0, 0.64], [0.6, 0.74], [-0.5, 0.56], [-1.1, 0.2]], true, 0.16);
	const jawTip = ap(chain(T(AMMIT_PIV.jaw[0], AMMIT_PIV.jaw[1]), R(Math.max(pose.jaw, 46 * roar))), [5.95, -0.14]), jawBack = ap(chain(T(AMMIT_PIV.jaw[0], AMMIT_PIV.jaw[1]), R(Math.max(pose.jaw, 46 * roar))), [0.2, 0.3]);
	const open = Math.max(pose.jaw, 46 * roar);
	const upT = Array.from({length: 14}, (_, i) => { const xx = 1.35 + i * 0.38, L = i === 2 || i === 9 || i === 12 ? 0.46 : 0.27; return <path key={i} d={`M${xx} -0.16L${xx + 0.09} ${-0.1 + L}L${xx + 0.19} -0.16Z`} fill={PAL.white} stroke={ink} strokeWidth={c.LW * 0.6} />; });
	const loT = Array.from({length: 13}, (_, i) => { const xx = 0.6 + i * 0.4, L = i === 1 || i === 8 || i === 12 ? 0.44 : 0.26; return <path key={i} d={`M${xx} -0.06L${xx + 0.1} ${-0.12 - L}L${xx + 0.2} -0.06Z`} fill={PAL.white} stroke={ink} strokeWidth={c.LW * 0.6} />; });
	const lion = poly([[1.0, -4.6], [6.0, -4.6], [6.0, 2.5], [1.45, 2.5], [1.2, 1.4], [1.55, 0.6], [1.05, -0.2], [1.5, -1.0], [1.0, -1.8], [1.45, -2.6], [0.95, -3.4], [1.35, -4.0]]);
	const tufts = [[1.2, 1.4], [1.05, -0.2], [1.0, -1.8], [0.95, -3.4]].map(([a, b], i) => <path key={i} d={`M${a + 0.3} ${b - 0.35}L${a - 0.45} ${b + 0.1}L${a + 0.35} ${b + 0.4}Z`} fill={PAL.lion} />);
	const pid = `${id}-${face}`;
	const rimStroke = (d: string, m: M, k = 8) => <path d={d} transform={mx(m)} fill="none" stroke={rimC} strokeWidth={c.OW * k} strokeLinejoin="round" />;
	return <g transform={`translate(${x},${y}) scale(${s * face},${s})`}>
		<defs>
			<clipPath id={`${pid}-clip`}><path d={body} transform={mx(W)} /></clipPath>
			<mask id={`${pid}-mask`} maskUnits="userSpaceOnUse" x={-20} y={-20} width={40} height={40}><rect x={-20} y={-20} width={40} height={40} fill="white" /><path d={body} transform={mx(W)} fill="black" /></mask>
		</defs>
		{/* rim light: thick red strokes behind the whole silhouette, only their outer half shows */}
		{rim > 0 && <g opacity={rim} style={{mixBlendMode: 'screen'}}>
			{rimStroke(body, W)}{rimStroke(mane, g.N, 7)}{rimStroke(skull, g.N, 7)}{rimStroke(jawD, g.J, 7)}
			<path d={near.fill} fill="none" stroke={rimC} strokeWidth={c.OW * 7} /><path d={far.fill} fill="none" stroke={rimC} strokeWidth={c.OW * 7} />
		</g>}
		{/* far legs and the tail, behind the body */}
		<path d={farHind} transform={mx(W)} fill={PAL.hippo2} stroke={ink} strokeWidth={c.OW * 2} strokeLinejoin="round" />
		<path d={far.fill} fill={PAL.lion2} stroke={ink} strokeWidth={c.OW * 2} strokeLinejoin="round" />{far.claws}
		<g transform={mx(tailM)}><Solid d={tail} r="hippo" c={c} />{[-0.2, 0.0, 0.2].map((dx) => <path key={dx} d={`M${dx * 0.8} 1.2L${dx * 1.6} 1.75`} stroke={ink} strokeWidth={c.LW * 2.2} strokeLinecap="round" />)}</g>
		{/* the body: one silhouette, hippo rump into lion forepart without a seam */}
		<path d={body} transform={mx(W)} fill={PAL.hippo} stroke={ink} strokeWidth={c.OW * 2} strokeLinejoin="round" />
		<g clipPath={`url(#${pid}-clip)`}><g transform={mx(W)}>
			<ellipse cx={-1.4} cy={0.3} rx={1.9} ry={1.7} fill={PAL.hippo2} opacity={0.35} />
			<ellipse cx={-1.0} cy={-0.2} rx={1.5} ry={1.3} fill={PAL.hippo} />
			<path d="M-2.9 -0.9Q-1.9 -2.5 -0.2 -2.85" fill="none" stroke="#D27A55" strokeWidth={c.LW * 3.4} opacity={0.75} />
			<path d={lion} fill={PAL.lion} />{tufts}
			<ellipse cx={3.6} cy={0.4} rx={1.6} ry={0.7} fill={PAL.lion2} opacity={0.5} />
			{([[2.9, -2.6], [3.7, -1.7], [3.2, -0.6], [4.1, -0.3], [2.3, -1.6], [2.6, -0.2]] as V[]).map(([a, b], i) => <ellipse key={i} cx={a} cy={b} rx={0.2} ry={0.13} fill={PAL.lion2} />)}
			<path d="M-2.3 1.1Q-0.6 2.1 1.1 1.55" fill="none" stroke={PAL.hippo2} strokeWidth={c.LW * 3} opacity={0.6} />
		</g></g>
		{/* near legs in front of the body: fills overlap it, outlines only outside it */}
		<path d={hind.fill} fill={PAL.hippo} />
		<path d={near.fill} fill={PAL.lion} />
		<g mask={`url(#${pid}-mask)`}>
			<path d={hind.edge} fill="none" stroke={ink} strokeWidth={c.OW * 2} strokeLinejoin="round" strokeLinecap="round" />
			<path d={near.edge} fill="none" stroke={ink} strokeWidth={c.OW * 2} strokeLinejoin="round" strokeLinecap="round" />
		</g>
		{[0.45, 0.85].map((k) => <line key={k} x1={hf[0] + k} y1={-0.02} x2={hf[0] + k - 0.1} y2={-0.32} stroke={ink} strokeWidth={c.LW} />)}
		{near.toes}{near.claws}
		{/* the mane over the neck joint */}
		<g transform={mx(g.N)}>
			<path d={mane} fill={PAL.lion2} stroke={ink} strokeWidth={c.OW * 2} strokeLinejoin="round" />
			<path d={maneIn} fill={PAL.lion} />
			{Array.from({length: 11}, (_, i) => { const a = (75 + i * 25) * Math.PI / 180, r0 = 0.9, r1 = 2.05 + 0.45 * bristle + 0.15 * mr * Math.sin(t * 17 + i * 2);
				return <path key={i} d={`M${-0.45 + Math.cos(a) * r0 * 0.95} ${0.5 + Math.sin(a) * r0 * 1.1}Q${-0.45 + Math.cos(a + 0.12) * (r0 + r1) / 2 * 0.95} ${0.5 + Math.sin(a + 0.12) * (r0 + r1) / 2 * 1.1} ${-0.45 + Math.cos(a) * r1 * 0.95} ${0.5 + Math.sin(a) * r1 * 1.1}`} fill="none" stroke={PAL.lion2} strokeWidth={c.LW * 2.2} />; })}
			{/* the mouth (behind both jaws), the lower jaw and its teeth */}
			{open > 1.5 && <path d={poly([[0.5, -0.05], [6.55, -0.14], ap(T(0, 0), jawTip), ap(T(0, 0), jawBack)])} fill="#4A0A10" />}
			{open > 6 && <path d={sp([[0.9, 0.0], [jawTip[0] * 0.55, jawTip[1] * 0.55 - 0.05], [jawTip[0] * 0.62, jawTip[1] * 0.62 + 0.12], [1.0, 0.3]], true, 0.2)} fill="#C4505A" />}
		</g>
		<g transform={mx(g.J)}>{loT}<Solid d={jawD} r="croc" c={c} />
			<path d="M0.2 0.4Q2.6 0.56 5.2 0.32" fill="none" stroke={PAL.croc2} strokeWidth={c.LW * 1.8} />
			{[1.4, 2.4, 3.4, 4.4].map((xx) => <path key={xx} d={`M${xx} 0.12L${xx + 0.25} 0.5`} stroke={PAL.croc2} strokeWidth={c.LW * 1.2} />)}</g>
		<g transform={mx(g.N)}>
			{upT}
			<Solid d={skull} r="croc" c={c} />
			{[2.7, 3.3, 3.9, 4.5, 5.1].map((xx, i) => <path key={xx} d={`M${xx - 0.16} ${-1.55 + i * 0.065 + 0.05}Q${xx} ${-1.75 + i * 0.065} ${xx + 0.16} ${-1.55 + i * 0.065 + 0.05}`} fill={PAL.croc2} stroke={ink} strokeWidth={c.LW * 0.8} />)}
			{[2.4, 3.0, 3.6, 4.2, 4.8, 5.4].map((xx) => <path key={'l' + xx} d={`M${xx} ${-1.3 + (xx - 2.4) * 0.05}Q${xx + 0.16} -0.75 ${xx} -0.3`} fill="none" stroke={PAL.croc2} strokeWidth={c.LW * 1.3} />)}
			<ellipse cx={6.55} cy={-1.2} rx={0.13} ry={0.08} fill={ink} />
			{/* the eye on its raised socket, under a heavy brow, glowing */}
			<ellipse cx={1.8} cy={-1.6} rx={0.56} ry={0.42} fill={PAL.croc2} stroke={ink} strokeWidth={c.LW * 1.2} />
			<circle cx={1.85} cy={-1.58} r={0.55} fill="url(#g60-gold)" opacity={0.55} style={{mixBlendMode: 'screen'}} />
			<ellipse cx={1.86} cy={-1.57} rx={0.33} ry={0.24} fill="#FFC21A" stroke={ink} strokeWidth={c.LW * 1.4} />
			<ellipse cx={1.86 + 0.1 * Math.cos(look)} cy={-1.57 - 0.05 * Math.sin(look)} rx={0.065} ry={0.21} fill={ink} />
			<circle cx={1.78} cy={-1.65} r={0.05} fill="#FFFFFF" />
			<path d={sp([[1.15, -2.05, 1], [2.45, -1.86], [2.6, -1.68, 1], [2.1, -1.74], [1.3, -1.82]], true, 0.2)} fill={PAL.croc2} stroke={ink} strokeWidth={c.LW * 1.2} />
			<path d="M0.15 -1.75Q0.4 -0.8 0.1 0.12" fill="none" stroke={PAL.gold} strokeWidth={c.LW * 3.2} /><path d="M0.15 -1.75Q0.4 -0.8 0.1 0.12" fill="none" stroke={ink} strokeWidth={c.LW * 0.8} />
		</g>
	</g>;
};

/* ---------------- the balance, driveable: heart / feather offsets, plumb, baboon facing, a glint on the beam ---------------- */
export type Bal2 = BalancePose & {heartDy?: number; heartK?: number; heartO?: number; featherDy?: number; featherRot?: number; featherO?: number; featherDx?: number; baboonFace?: 1 | -1; glint?: number; tick?: number};
const rect = (x0: number, y0: number, x1: number, y1: number) => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
export const Balance2: React.FC<{p: Bal2; x: number; y: number; s: number; t?: number}> = ({p, x, y, s, t = 0}) => {
	const c = cx(s), g = balanceGeo(p);
	const post = poly([[-0.36, -1.75], [0.36, -1.75], [0.3, BAL.postTop + 0.6], [-0.3, BAL.postTop + 0.6]]);
	const capital = sp([[-0.3, BAL.postTop + 0.62, 1], [0.3, BAL.postTop + 0.62, 1], [0.95, BAL.postTop + 0.05], [1.05, BAL.postTop - 0.1, 1], [-1.05, BAL.postTop - 0.1, 1], [-0.95, BAL.postTop + 0.05]]);
	const abacus = rect(-1.3, BAL.postTop - 0.45, 1.3, BAL.postTop - 0.1);
	const beamD = sp([[-BAL.half - 0.2, -0.24, 1], [BAL.half + 0.2, -0.24, 1], [BAL.half + 0.2, 0.24, 1], [-BAL.half - 0.2, 0.24, 1]]);
	const bud = (sg: number) => sp([[sg * (BAL.half + 0.15), -0.32], [sg * (BAL.half + 0.65), -0.42], [sg * (BAL.half + 0.98), 0], [sg * (BAL.half + 0.65), 0.42], [sg * (BAL.half + 0.15), 0.32]]);
	const panD = sp([[-2.05, 0, 1], [2.05, 0, 1], [1.6, 0.5], [0.7, 0.74], [-0.7, 0.74], [-1.6, 0.5]], true, 0.2);
	const cords = (pm: M, e: V, k: string) => <g key={k}>{[-1.85, -0.6, 0.6, 1.85].map((u) => { const q = ap(pm, [u, 0]); return <line key={u} x1={e[0]} y1={e[1]} x2={q[0]} y2={q[1]} stroke={PAL.ink} strokeWidth={c.LW * 1.25} />; })}</g>;
	const bands = [-4.5, -8.5, -12.5, -16.5].map((yy) => <g key={yy}><rect x={-0.37} y={yy} width={0.74} height={0.55} fill={PAL.blue} stroke={PAL.ink} strokeWidth={c.LW * 0.8} /><rect x={-0.37} y={yy + 0.55} width={0.74} height={0.22} fill={PAL.red} stroke={PAL.ink} strokeWidth={c.LW * 0.8} /></g>);
	const hk = p.heartK ?? 1, bf = p.baboonFace ?? -1, gl = p.glint ?? 0, tk = p.tick ?? 0;
	return <g transform={`translate(${x},${y}) scale(${s})`}>
		<Solid d={rect(-2.5, -0.9, 2.5, 0)} r="linen" c={c} /><Solid d={rect(-1.7, -1.75, 1.7, -0.9)} r="linen" c={c} />
		{[-2.0, -1.0, 0, 1.0].map((xx, i) => <rect key={xx} x={xx + 0.08} y={-0.72} width={0.84} height={0.55} fill={[PAL.blue, PAL.red, PAL.green, PAL.blue][i]} stroke={PAL.ink} strokeWidth={c.LW * 0.8} />)}
		<rect x={-1.5} y={-1.5} width={3.0} height={0.22} fill={PAL.red} />
		<Solid d={post} r="gold" c={c} />{bands}
		<Solid d={capital} r="green" c={c} />{[-0.6, -0.2, 0.2, 0.6].map((xx) => <line key={xx} x1={xx * 0.4} y1={BAL.postTop + 0.6} x2={xx * 1.5} y2={BAL.postTop - 0.05} stroke={PAL.ink} strokeWidth={c.LW * 0.8} />)}
		<Solid d={abacus} r="gold" c={c} />
		<g transform={`translate(${bf < 0 ? 0.15 : -0.15},${BAL.postTop - 0.45}) scale(${bf},1)`}><Baboon c={c} t={t} look={p.look ?? 0} /></g>
		<path d={rect(0, BAL.plumbY - 0.12, BAL.plumbX + 0.12, BAL.plumbY + 0.12)} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW} />
		<line x1={BAL.plumbX} y1={BAL.plumbY} x2={g.bob[0]} y2={g.bob[1]} stroke={PAL.ink} strokeWidth={c.LW * 1.2} />
		<g transform={`translate(${g.bob[0]},${g.bob[1]}) rotate(${-(p.plumb ?? 0)})`}><Solid d={sp([[0, -0.1], [0.32, 0.22], [0.36, 0.55], [0, 0.95, 1], [-0.36, 0.55], [-0.32, 0.22]])} r="gold" c={c} /><circle cx={0} cy={0.45} r={0.12} fill={PAL.red} /></g>
		{tk > 0.01 && <g style={{mixBlendMode: 'screen'}} opacity={tk}><circle cx={0.36} cy={g.bob[1] + 0.4} r={1.4} fill="url(#g60-white)" /><path d={`M0.36 ${g.bob[1] - 0.6}L0.45 ${g.bob[1] + 0.3}L1.3 ${g.bob[1] + 0.4}L0.45 ${g.bob[1] + 0.5}L0.36 ${g.bob[1] + 1.4}L0.27 ${g.bob[1] + 0.5}L-0.6 ${g.bob[1] + 0.4}L0.27 ${g.bob[1] + 0.3}Z`} fill="#FFFBE8" /></g>}
		{cords(g.panL, g.eL, 'cl')}{cords(g.panR, g.eR, 'cr')}
		<g transform={mx(g.panL)}>
			{(p.heartO ?? 1) > 0 && <g opacity={p.heartO ?? 1} transform={`translate(0,${0.02 + (p.heartDy ?? 0)}) scale(${hk})`}><Heart c={{OW: c.OW / hk, LW: c.LW / hk}} /></g>}
			<Solid d={panD} r="gold" c={c} /><path d="M-1.7 0.28Q0 0.5 1.7 0.28" fill="none" stroke={PAL.blue} strokeWidth={c.LW * 2.2} /></g>
		<g transform={mx(g.panR)}>
			{(p.featherO ?? 1) > 0 && <g opacity={p.featherO ?? 1} transform={`translate(${0.05 + (p.featherDx ?? 0)},${0.02 + (p.featherDy ?? 0)}) rotate(${p.featherRot ?? 0})`}><Feather c={c} h={3.0} /></g>}
			<Solid d={panD} r="gold" c={c} /><path d="M-1.7 0.28Q0 0.5 1.7 0.28" fill="none" stroke={PAL.blue} strokeWidth={c.LW * 2.2} /></g>
		<g transform={mx(g.beam)}>
			<Solid d={beamD} r="gold" c={c} />
			{[-1, 1].map((sg) => <g key={sg}><Solid d={bud(sg)} r="green" c={c} /><rect x={sg > 0 ? BAL.half - 1.2 : -BAL.half + 0.6} y={-0.24} width={0.6} height={0.48} fill={PAL.blue} /></g>)}
			{[-6.4, -4.6, -2.8, 2.8, 4.6, 6.4].map((xx) => <rect key={xx} x={xx - 0.12} y={-0.24} width={0.24} height={0.48} fill={PAL.red} />)}
			<Solid d={sp([[-0.12, 0.2, 1], [0.12, 0.2, 1], [0.05, 2.2], [0, 2.4, 1], [-0.05, 2.2]])} r="gold" c={c} />
			{gl > 0.01 && <g style={{mixBlendMode: 'screen'}}>
				<rect x={-BAL.half} y={-0.2} width={2 * BAL.half} height={0.16} fill="#FFF6D0" opacity={0.6 * gl} transform={`translate(${(gl - 0.5) * 6},0)`} />
				<circle cx={-BAL.half - 0.6} cy={0} r={3.2 * gl} fill="url(#g60-white)" opacity={gl} />
				<path d={`M${-BAL.half - 0.6} ${-3.2 * gl}L${-BAL.half - 0.4} -0.2L${-BAL.half - 0.6 + 3.2 * gl} 0L${-BAL.half - 0.4} 0.2L${-BAL.half - 0.6} ${3.2 * gl}L${-BAL.half - 0.8} 0.2L${-BAL.half - 0.6 - 3.2 * gl} 0L${-BAL.half - 0.8} -0.2Z`} fill="#FFFDF2" opacity={gl} />
			</g>}
		</g>
		<circle cx={0} cy={BAL.beamY} r={0.32} fill={PAL.red} stroke={PAL.ink} strokeWidth={c.LW * 1.2} />
		<g transform={`translate(0,${BAL.beamY - 0.3})`}><Feather c={c} h={1.6} /></g>
	</g>;
};
/** world positions of the balance's pans (centre of the pan floor) */
export const panAt = (p: BalancePose, x: number, y: number, s: number) => { const g = balanceGeo(p); const L = ap(g.panL, [0, 0]), Rr = ap(g.panR, [0, 0]), b = g.bob;
	return {L: [x + L[0] * s, y + L[1] * s] as V, R: [x + Rr[0] * s, y + Rr[1] * s] as V, bob: [x + b[0] * s, y + b[1] * s] as V, beam: [x, y + BAL.beamY * s] as V}; };

/* ---------------- the Hall of Two Truths: lapis wall, star ceiling, feather cornice, gold glyph bands, floor dado ---------------- */
export const HallWall: React.FC<{x0: number; x1: number; t: number; ceil?: number; gy?: number; glyphY?: number; bg?: string; dado?: boolean}> = ({x0, x1, t, ceil = 112, gy = 852, glyphY, bg = '#16214F', dado = true}) => <g>
	<rect x={x0} y={-600} width={x1 - x0} height={gy + 600} fill={bg} />
	<Ceiling x0={x0} x1={x1} y0={-600} y1={ceil} bg="#121C46" />
	<FeatherCornice x0={x0} x1={x1} y={ceil + 14} s={0.95} t={t} />
	{glyphY !== undefined && <g opacity={0.85}>{Array.from({length: Math.ceil((x1 - x0) / 300)}, (_, i) => <GlyphStack key={i} x={x0 + 90 + i * 300} y={glyphY} cell={30} n={5} seed={300 + i} glow={0} color="#C9A23E" o={0.7} />)}</g>}
	{dado && <Dado x0={x0} x1={x1} y={gy} h={80} />}
</g>;
export const _keep = {God, KhekherFrieze, RegisterLine, Stars, featherD};
