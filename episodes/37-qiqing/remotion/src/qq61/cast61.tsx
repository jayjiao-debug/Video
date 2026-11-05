import React from 'react';
import {God, CAST, POSES, Cast, Pose, solve, crown} from '../qq60/rig60';
import {ap} from '../qq60/geo60';
import {CAST2} from '../qq60/cast60';
import {mx, sp, poly, PAL, Pt, lerp, T, R, chain} from '../qq60/geo60';

/* ep61 · the Ennead cast on the ep60 god rig.
   The ep60 rig draws five head kinds (human, jackal, ibis, falcon + crowns). ep61 needs a lioness, a cat and the Set animal, and a few
   more headdresses (throne sign, nu-jar, house-and-basket, goose). Rather than fork the rig, `God61` draws the ep60 `God` with a bare
   human head and then paints the new head / headdress on top, in the SAME head frame (solve(pose).head), so every pose, lean and
   head-nod of the ep60 rig carries over. ep60 casts (CAST, CAST2.ra) are used unchanged. */

export type Head61 = 'lioness' | 'cat' | 'seth';
export type Hat61 = 'throne' | 'nu' | 'house' | 'goose';
export type Cast61 = {base: Cast; head?: Head61; hat?: Hat61; crown?: Cast['crown']; color?: string; color2?: string};
type Ctx = {OW: number; LW: number};

const bare = (c: Cast): Cast => ({...c, head: 'human', headFill: undefined, headFill2: undefined, crown: 'none', mask: false});
const mk = (name: string, o: Partial<Cast>): Cast => ({name, skin: 'skinM', skin2: 'skinM2', head: 'human', wig: 'tri', crown: 'none', dress: 'kilt', collar: 'god', bHand: 'fist', fHand: 'fist', ...o});

/** the ep61 cast. Keys: ep60 gods are re-used as they are (anubis, thoth, osiris, horus, ra); the rest are built the same way. */
export const CAST61: Record<string, Cast61> = {
	ani: {base: CAST.ani}, anubis: {base: CAST.anubis}, thoth: {base: CAST.thoth}, osiris: {base: CAST.osiris}, horus: {base: CAST.horus}, ra: {base: CAST2.ra},
	/** Atum: man in the red-and-white double crown, was sceptre + ankh (I1) */
	atum: {base: mk('Atum', {crown: 'pschent', tail: true, bProp: 'ankh', fProp: 'was'})},
	/** Shu: man with the ostrich feather (I3) */
	shu: {base: mk('Shu', {wig: 'none', crown: 'maat', tail: true, bProp: 'ankh', fProp: 'was'})},
	/** Tefnut: lioness head, sun disc + uraeus, sheath dress, ankh + was (I4) */
	tefnut: {base: mk('Tefnut', {skin: 'skinF', skin2: 'gold2', dress: 'sheath', female: true, bProp: 'ankh', fProp: 'was', bHand: 'fist'}), head: 'lioness', crown: 'sun'},
	/** Geb: man, green skin (design choice: no object found; the goose is NOT attested in the researched records, so it is not drawn) (I5) */
	geb: {base: mk('Geb', {skin: 'skinO', skin2: 'skinO2', wig: 'tri', tail: true, bProp: 'ankh', fProp: 'was'})},
	/** Nut: woman with the red nu-jar on her head (I6) */
	nut: {base: mk('Nut', {skin: 'skinF', skin2: 'gold2', dress: 'sheath', female: true, bHand: 'open', fHand: 'open'}), hat: 'nu'},
	/** Isis: woman, throne sign on the head, wings (I8) */
	isis: {base: {...CAST.isis, crown: 'none'}, hat: 'throne'},
	/** Set: the Set animal head, kilt, was + ankh (I9) */
	set: {base: mk('Set', {tail: true, bProp: 'ankh', fProp: 'was'}), head: 'seth', color: '#9A4A2A', color2: '#6E2F1A'},
	/** Nephthys: woman, house-and-basket sign on the head (I10) */
	nephthys: {base: mk('Nephthys', {skin: 'skinF', skin2: 'gold2', dress: 'sheath', female: true, bHand: 'open', fHand: 'open'}), hat: 'house'},
	/** Sekhmet: lioness head + sun disc, red sheath dress (I14) */
	sekhmet: {base: mk('Sekhmet', {skin: 'skinF', skin2: 'gold2', dress: 'sheath', female: true, bProp: 'ankh', fProp: 'was'}), head: 'lioness', crown: 'sun'},
	/** Bastet: cat head, sheath dress, sistrum + basket (I15) */
	bastet: {base: mk('Bastet', {skin: 'skinF', skin2: 'gold2', dress: 'sheath', female: true, fProp: 'sistrum', bHand: 'fist'}), head: 'cat', color: '#A8957A', color2: '#7A6A54'},
	/** Ma'at: woman, the feather on her head, wings (I16) */
	maat: {base: mk('Maat', {skin: 'skinF', skin2: 'gold2', dress: 'sheath', female: true, crown: 'maat', wings: true, bProp: 'ankh', fProp: 'was'})},
};

/* ---------------- head overlays (head frame: face +x, neck pivot at 0,0, crown base at y ≈ -2.5) ---------------- */
const Sol: React.FC<{d: string; f: string; c: Ctx; k?: number}> = ({d, f, c, k = 1}) => <><path d={d} fill={PAL.ink} stroke={PAL.ink} strokeWidth={2 * c.OW * k} strokeLinejoin="round" /><path d={d} fill={f} /></>;
const eyeAt = (x: number, y: number, c: Ctx, L = 0.52, rim = PAL.ink) => <g>
	<path d={`M${x - L * 0.5} ${y}Q${x} ${y - L * 0.36} ${x + L * 0.55} ${y - 0.02}Q${x} ${y + L * 0.2} ${x - L * 0.5} ${y}Z`} fill={PAL.eye} stroke={rim} strokeWidth={c.LW} />
	<circle cx={x + 0.1} cy={y - 0.03} r={L * 0.14} fill={PAL.ink} /><path d={`M${x - L * 0.5} ${y}L${x - L * 1.15} ${y + 0.05}`} stroke={PAL.ink} strokeWidth={c.LW * 1.4} /></g>;

const lioness = (c: Ctx, col: string, col2: string, open: number, uid = 'lio', roar = 0) => {
	if (roar > 0.02) open = roar;
	const head = sp([[0.5, 0.14], [1.1, 0.1], [1.7, -0.02], [2.1, -0.3], [2.2, -0.62], [2.05, -0.9], [1.6, -1.02], [1.3, -1.35], [1.2, -1.85], [0.95, -2.25], [0.4, -2.58], [-0.2, -2.62], [-0.75, -2.35], [-0.95, -1.7], [-0.9, -0.9], [-0.7, -0.2], [-0.2, 0.1]]);
	// the roar (open > 0): the muzzle is cut along the mouth line; the lower jaw turns about a hinge behind the mouth corner (30 deg per unit of `open`),
	// the mouth shows a dark red inside, a tongue, and the fangs of both jaws
	const hinge: [number, number] = [0.95, -0.3], a = 42 * open, rm = chain(T(hinge[0], hinge[1]), R(a), T(-hinge[0], -hinge[1]));
	const lowR = poly([hinge, [2.8, -0.3], [2.8, 3], [hinge[0], 3]]), ink = {fill: PAL.ink, stroke: PAL.ink, strokeWidth: 2 * c.OW, strokeLinejoin: 'round' as const};
	const jawD = sp([[0.9, -0.3, 1], [2.2, -0.3, 1], [2.38, -0.04], [2.12, 0.3], [1.5, 0.55], [0.95, 0.42]], true, 0.14);
	const cut = 'M0.95 -0.3L2.15 -0.3', fang = (x: number, y: number, L: number, up: boolean) => <path d={`M${x - 0.07} ${y}L${x} ${y + (up ? L : -L)}L${x + 0.07} ${y}Z`} fill={PAL.white} stroke={PAL.ink} strokeWidth={c.LW * 0.7} strokeLinejoin="round" />;
	const eyebrow = <><path d="M2.05 -0.86Q2.3 -0.7 2.08 -0.46Q1.9 -0.62 2.05 -0.86Z" fill={PAL.ink} />{eyeAt(1.2, -1.55, c, 0.56, PAL.gold2)}<path d="M1.1 -1.85Q1.4 -1.95 1.6 -1.78" fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.4} /></>;
	if (roar > 0.02) { return <g>
		<defs><clipPath id={`${uid}-up`}><path clipRule="evenodd" d={`M-3 -9H8V6H-3Z${lowR}`} /></clipPath><clipPath id={`${uid}-lo`}><path d={lowR} /></clipPath></defs>
		<circle cx={-0.35} cy={-2.5} r={0.4} fill={PAL.ink} stroke={PAL.ink} strokeWidth={c.OW * 2} /><circle cx={-0.35} cy={-2.5} r={0.4} fill={col2} />
		<path d={poly([hinge, [2.15, -0.3], ap(rm, [2.15, -0.3]), ap(rm, [1.3, -0.3])])} fill={PAL.red2} />
		<g transform={mx(rm)}>
			<Sol d={jawD} f={col} c={c} k={0.9} />
			<path d="M1.05 -0.3Q1.5 -0.55 2.1 -0.44Q1.9 -0.3 1.5 -0.27Q1.2 -0.25 1.05 -0.3Z" fill="#E0566A" stroke={PAL.ink} strokeWidth={c.LW * 0.7} />
			{fang(2.12, -0.32, 0.34 * Math.min(1, open), false)}{fang(1.75, -0.32, 0.22 * Math.min(1, open), false)}
			<path d="M0.95 -0.3L2.15 -0.3" stroke={PAL.ink} strokeWidth={c.OW * 1.2} strokeLinecap="round" /></g>
		<g clipPath={`url(#${uid}-up)`}><path d={head} {...ink} /><path d={head} fill={col} /></g>
		<path d={cut} stroke={PAL.ink} strokeWidth={c.OW * 1.6} strokeLinecap="round" />{fang(2.0, -0.3, 0.3 * Math.min(1, open), true)}{fang(1.72, -0.3, 0.22 * Math.min(1, open), true)}{fang(1.45, -0.3, 0.16 * Math.min(1, open), true)}
		<path d={sp([[0.1, -1.2], [0.5, -0.9], [1.0, -0.55], [1.5, -0.45]], false)} fill="none" stroke={col2} strokeWidth={c.LW * 1.2} />
		{eyebrow}
	</g>; }
	return <g>
		<circle cx={-0.35} cy={-2.5} r={0.4} fill={PAL.ink} stroke={PAL.ink} strokeWidth={c.OW * 2} /><circle cx={-0.35} cy={-2.5} r={0.4} fill={col2} />
		{open > 0 && <g><path d={poly([[2.12, -0.48], [1.25, -0.32], [1.5, 0.15 + 0.85 * open], [2.1, 0.1 + 0.95 * open]])} fill={PAL.red2} stroke={PAL.ink} strokeWidth={c.LW} />
			<g transform={`rotate(${28 * open} 0.7 0)`}><Sol d={sp([[0.7, 0.0, 1], [2.0, -0.28, 1], [2.1, 0.0], [1.5, 0.34], [0.9, 0.3, 1]], true, 0.1)} f={col} c={c} k={0.8} /></g>
			{[1.95, 1.75, 1.55].map((x) => <path key={x} d={`M${x} -0.46L${x - 0.06} -0.2L${x + 0.1} -0.44`} fill={PAL.white} stroke={PAL.ink} strokeWidth={c.LW * 0.6} />)}</g>}
		<Sol d={head} f={col} c={c} />
		{open <= 0 && <path d="M2.06 -0.34Q1.6 -0.22 1.1 -0.3" fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.1} strokeLinecap="round" />}
		<path d={sp([[0.1, -1.2], [0.5, -0.9], [1.0, -0.55], [1.5, -0.45]], false)} fill="none" stroke={col2} strokeWidth={c.LW * 1.2} />
		<path d="M2.05 -0.86Q2.3 -0.7 2.08 -0.46Q1.9 -0.62 2.05 -0.86Z" fill={PAL.ink} />
		{eyeAt(1.2, -1.55, c, 0.56, PAL.gold2)}
		<path d="M1.1 -1.85Q1.4 -1.95 1.6 -1.78" fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.4} />
	</g>;
};
const cat = (c: Ctx, col: string, col2: string, ear = 0) => {
	const head = sp([[0.5, 0.14], [1.0, 0.1], [1.45, -0.1], [1.8, -0.4], [1.85, -0.65], [1.62, -0.85], [1.3, -1.0], [1.15, -1.4], [1.0, -1.9], [0.85, -2.3], [0.5, -2.6], [0, -2.62], [-0.6, -2.4], [-0.95, -1.7], [-0.9, -0.9], [-0.6, -0.2]]);
	return <g>
		<g transform={`rotate(${-ear} -0.4 -2.3)`}><Sol d={poly([[-0.75, -2.2], [-0.62, -3.6], [0.0, -2.5]])} f={col2} c={c} /></g>
		<Sol d={head} f={col} c={c} />
		<g transform={`rotate(${-ear} 0.6 -2.35)`}><Sol d={poly([[0.1, -2.45], [0.62, -3.75], [1.1, -2.2]])} f={col} c={c} />
		<path d={poly([[0.35, -2.5], [0.62, -3.3], [0.85, -2.45]])} fill="#E8A0A0" /></g>
		{[-0.2, 0.2, 0.6].map((y) => <path key={y} d={`M${-0.4} ${-1.6 + y * 0.5}Q0.0 ${-1.7 + y * 0.5} 0.4 ${-1.9 + y * 0.5}`} fill="none" stroke={col2} strokeWidth={c.LW * 1.2} />)}
		{eyeAt(1.1, -1.5, c, 0.6, PAL.ink)}
		<path d="M1.78 -0.68L1.9 -0.55L1.7 -0.5Z" fill="#C07070" stroke={PAL.ink} strokeWidth={c.LW * 0.7} />
		<path d="M1.7 -0.5Q1.55 -0.3 1.3 -0.34" fill="none" stroke={PAL.ink} strokeWidth={c.LW} />
		{[-0.12, 0.06, 0.24].map((y) => <path key={y} d={`M1.5 ${-0.55 + y}L2.5 ${-0.75 + y * 2.2}`} stroke={PAL.ink} strokeWidth={c.LW * 0.6} />)}
	</g>;
};
const seth = (c: Ctx, col: string, col2: string, sneer: number, ear = 0) => {
	const head = sp([[0.5, 0.14], [0.95, 0.05], [1.3, -0.2], [1.5, -0.62], [2.2, -0.88], [2.9, -0.72], [3.35, -0.4], [3.5, -0.05, 1], [3.2, -0.2], [2.7, -0.42], [2.0, -0.52], [1.6, -0.5], [1.5, -1.0], [1.55, -1.5], [1.1, -1.95], [0.9, -2.3], [0.3, -2.6], [-0.4, -2.45], [-0.9, -1.8], [-0.95, -0.9], [-0.6, -0.15]], true, 0.14);
	const earP = (dx: number, f: string) => <g transform={`translate(${dx},0) rotate(${-ear} 0 -2.4)`}><Sol d={poly([[-0.3, -2.35], [-0.78, -3.95], [-0.2, -4.1], [0.28, -3.95], [0.32, -2.4]])} f={f} c={c} /></g>;
	return <g>
		{earP(-0.45, col2)}
		<Sol d={head} f={col} c={c} />
		{earP(0.2, col)}
		<path d={poly([[-0.02, -3.7], [0.24, -3.78], [0.35, -2.7], [0.1, -2.62]])} fill={col2} opacity={0.6} />
		<path d="M0.9 -2.25Q1.4 -1.5 1.55 -1.1" fill="none" stroke={col2} strokeWidth={c.LW * 1.2} />
		{sneer > 0 && <path d={`M2.2 -0.55Q1.8 ${-0.5 + 0.1 * sneer} 1.5 -0.55`} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.3} />}
		<path d="M0.9 -1.62Q1.2 -1.9 1.55 -1.55Q1.2 -1.4 0.9 -1.62Z" fill={PAL.red} stroke={PAL.ink} strokeWidth={c.LW} /><path d="M0.85 -1.78L1.5 -1.72" stroke={PAL.ink} strokeWidth={c.LW * 1.3} />
		<path d="M3.45 -0.1Q3.55 0.05 3.4 0.12" fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.2} />
	</g>;
};
const hat = (k: Hat61, c: Ctx) => {
	if (k === 'throne') return <g>
		<Sol d={poly([[-0.85, -2.4], [-0.85, -4.5], [-0.15, -4.5], [-0.15, -3.55], [0.85, -3.55], [0.85, -2.4]])} f={PAL.blue} c={c} />
		<path d="M-0.7 -2.7L0.7 -2.7M-0.7 -3.0L0.7 -3.0" stroke={PAL.gold} strokeWidth={c.LW * 1.6} /><path d="M-0.7 -4.2L-0.3 -4.2M-0.7 -3.8L-0.3 -3.8" stroke={PAL.gold} strokeWidth={c.LW * 1.6} />
		<path d="M0.2 -3.55L0.2 -2.4" stroke={PAL.ink} strokeWidth={c.LW} /></g>;
	if (k === 'nu') return <g>
		<Sol d={sp([[-0.55, -2.45, 1], [0.7, -2.45, 1], [0.98, -3.05], [0.92, -3.7], [0.62, -3.95], [-0.45, -3.95], [-0.78, -3.7], [-0.82, -3.05]], true, 0.16)} f={PAL.red} c={c} />
		<rect x={-0.5} y={-4.1} width={1.1} height={0.2} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW} />
		<path d="M-0.55 -3.3Q-0.3 -3.45 0 -3.3T0.6 -3.3M-0.6 -3.0Q-0.35 -3.15 0 -3.0T0.65 -3.0" fill="none" stroke={PAL.blue2} strokeWidth={c.LW * 1.3} /></g>;
	if (k === 'house') return <g>
		<Sol d={poly([[-0.8, -2.42], [0.85, -2.42], [0.65, -2.95], [-0.6, -2.95]])} f={PAL.gold} c={c} />
		<Sol d={poly([[-0.75, -2.95], [0.8, -2.95], [0.8, -4.25], [-0.75, -4.25]])} f={PAL.linen} c={c} />
		<path d="M-0.5 -3.1L-0.5 -4.0L0.55 -4.0L0.55 -3.1" fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.2} /><path d="M-0.15 -3.1L-0.15 -3.7L0.3 -3.7L0.3 -3.1" fill="none" stroke={PAL.ink} strokeWidth={c.LW} /></g>;
	return <g>{/* goose on the head */}
		<Sol d={sp([[-1.0, -2.95, 1], [-0.5, -3.3], [0.3, -3.35], [0.85, -3.1], [0.7, -2.55], [-0.2, -2.45], [-0.8, -2.6]])} f={PAL.linen} c={c} />
		<Sol d={sp([[0.5, -3.15], [0.95, -3.9], [0.95, -4.3], [1.2, -4.5], [1.35, -4.3], [1.2, -4.1], [1.15, -3.8], [0.9, -3.0]], true, 0.14)} f={PAL.linen} c={c} />
		<path d="M1.3 -4.38L1.7 -4.28L1.28 -4.2Z" fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW * 0.8} /><circle cx={1.18} cy={-4.36} r={0.05} fill={PAL.ink} />
		<path d="M-0.6 -3.0Q-0.1 -2.8 0.4 -3.0" fill="none" stroke={PAL.line} strokeWidth={c.LW} /></g>;
};

/** basket held in the hand (Bastet's aegis basket) */
const Basket: React.FC<{p: [number, number]; c: Ctx}> = ({p, c}) => <g transform={`translate(${p[0]},${p[1]})`}>
	<Sol d={poly([[-0.8, 0.1], [0.8, 0.1], [0.6, 1.5], [-0.6, 1.5]])} f={PAL.mat} c={c} />
	{[0.45, 0.85, 1.2].map((y) => <path key={y} d={`M-0.75 ${y}L0.75 ${y}`} stroke={PAL.mat2} strokeWidth={c.LW} />)}
	<path d="M-0.7 0.1Q0 -1.2 0.7 0.1" fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.6} /></g>;

export type God61Props = {id: string; who: string; pose: Pose; x: number; y: number; s: number; face?: 1 | -1; t?: number; vel?: {head?: number; torso?: number};
	bProp?: Cast['bProp']; fProp?: Cast['fProp']; open?: number; roar?: number; sneer?: number; jaw?: number; ear?: number; pivots?: boolean; basket?: boolean; wings?: boolean; dress?: Cast['dress']; hide?: {bArm?: boolean; fArm?: boolean; props?: boolean}};
/** an ep61 god: the ep60 `God` plus the new head / headdress painted in the head frame */
export const God61: React.FC<God61Props> = ({id, who, pose, x, y, s, face = 1, t = 0, vel, bProp, fProp, open = 0, roar = 0, sneer = 0, jaw = 0, ear = 0, pivots = false, basket, wings, dress, hide}) => {
	const k = CAST61[who], c: Ctx = {OW: 2.7 / s, LW: 1.5 / s};
	const base = k.head ? bare({...k.base, wig: k.head === 'cat' ? 'none' : k.base.wig}) : k.hat ? {...k.base, wig: k.base.wig} : k.base;
	const cast: Cast = {...base, ...(k.head === 'lioness' && roar > 0 ? {faceless: true} : {}), ...(k.head || k.hat ? {crown: 'none' as const} : {}), ...(wings !== undefined ? {wings} : {}), ...(dress ? {dress} : {})};
	const g = solve(pose, cast.female), col = k.color ?? PAL.lion, col2 = k.color2 ?? PAL.lion2;
	const bh = g.bH, grip: [number, number] = [bh[0] * 0.02 + bh[2] * 0.6 + bh[4], bh[1] * 0.02 + bh[3] * 0.6 + bh[5]];
	return <g>
		<God id={id} cast={cast} pose={pose} x={x} y={y} s={s} face={face} sec={{t, vel}} bProp={bProp} fProp={fProp} hide={hide} jaw={jaw} ear={ear} pivots={pivots} />
		{(k.head || k.hat || k.crown) && <g transform={`translate(${x},${y}) scale(${s * face},${s})`}>
			<g transform={mx(g.head)}>
				{k.head === 'lioness' && lioness(c, col, col2, open, `${id}-lio`, roar)}{k.head === 'cat' && cat(c, col, col2, ear)}{k.head === 'seth' && seth(c, col, col2, sneer, ear)}
				{k.hat && hat(k.hat, c)}
				{k.crown && k.crown !== 'none' && crown(k.crown, c, t, 1)}
			</g>
			{basket && <Basket p={grip} c={c} />}
		</g>}
	</g>;
};

/* ---------------- poses (figure units) ---------------- */
export const P61 = {
	/** standing, front hand on the sceptre, back hand low (ep60 canon) */
	rest: (t = 0): Pose => ({...POSES.rest, lean: 0.6 * Math.sin(t * 1.2), head: 0.8 * Math.sin(t * 0.9)}),
	/** both arms straight up (Shu holding up the sky) */
	lift: (t = 0): Pose => ({lean: -1, neck: -3, head: -6, bs: 168, be: 6, bw: -8, fs: 176, fe: 4, fw: -8, rt: -6 + Math.sin(t * 1.4), rk: 8, at: 9, ak: 6}),
	/** arms spread wide, palms out (Ma'at / Isis welcome, wings fan) */
	wide: (): Pose => ({lean: 0, neck: 0, head: 0, bs: 78, be: 6, bw: -10, fs: 84, fe: 6, fw: -10, rt: -5, rk: 2, at: 8, ak: 1}),
	/** a striding menace: front arm back, chin up (Set) */
	menace: (): Pose => ({...POSES.rest, lean: -4, neck: -3, head: -3, bs: -18, be: 14, fs: 36, fe: 40, fw: -10, rt: -16, rk: 6, at: 18, ak: 3}),
	/** roaring: chin up, arms down and a little out */
	roar: (u = 1): Pose => ({lean: -3 * u, neck: -4 * u, head: -10 * u, bs: -10, be: 14, bw: 0, fs: 20, fe: 20, fw: -6, rt: -8, rk: 4, at: 11, ak: 2}),
	/** hand to the face (licking the paw): front forearm raised to the mouth */
	lick: (): Pose => ({lean: 1, neck: 4, head: 10, bs: -3, be: 6, bw: 0, fs: 36, fe: 128, fw: 40, rt: -6, rk: 3, at: 10, ak: 2}),
	/** arm up shaking a sistrum */
	shake: (t = 0): Pose => ({lean: 0, neck: 0, head: 2, bs: -4, be: 8, bw: 0, fs: 62 + 6 * Math.sin(t * 14), fe: 70, fw: -30, rt: -7, rk: 3, at: 10, ak: 2}),
	lerp,
};
export type {Pt};

/** world position (px) of a point given in the head frame of a posed figure (mouth, ear tip, …) */
export const headPt = (who: string, pose: Pose, x: number, y: number, s: number, face: 1 | -1, p: [number, number]): [number, number] => {
	const g = solve(pose, CAST61[who].base.female), q = ap(g.head, p); return [x + q[0] * s * face, y + q[1] * s]; };
