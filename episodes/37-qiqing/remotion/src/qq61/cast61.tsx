import React from 'react';
import {God, CAST, POSES, Cast, Pose, solve, crown} from '../qq60/rig60';
import {ap} from '../qq60/geo60';
import {CAST2} from '../qq60/cast60';
import {mx, sp, poly, PAL, Pt, lerp} from '../qq60/geo60';
import {AnimalHead, AnimalKind} from './heads61';

/* ep61 · the Ennead cast on the ep60 god rig.
   The ep60 rig draws five head kinds (human, jackal, ibis, falcon + crowns). ep61 needs a lioness, a cat and the Set animal, and a few
   more headdresses (throne sign, nu-jar, house-and-basket, goose). Rather than fork the rig, `God61` draws the ep60 `God` with a bare
   human head and then paints the new head / headdress on top, in the SAME head frame (solve(pose).head), so every pose, lean and
   head-nod of the ep60 rig carries over. ep60 casts (CAST, CAST2.ra) are used unchanged. */

export type Head61 = 'lioness' | 'cat' | 'seth';
export type Hat61 = 'throne' | 'nu' | 'house' | 'goose';
export type Cast61 = {base: Cast; head?: Head61; hat?: Hat61; crown?: Cast['crown']; color?: string; color2?: string};
type Ctx = {OW: number; LW: number};

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

/* ---------------- head overlays (head frame: face +x, neck pivot at 0,0, crown base at y ≈ -2.5) ----------------
   Animal heads (lioness, cat, Set animal, and the ep60 jackal / ibis / falcon when drawn by God61) are the layered heads of heads61.tsx,
   handed to the rig as `headArt` so they sit in the rig's own head layer (arms in front, wig / lappet behind, crown on top).
   Human heads with a headdress (throne, nu-jar, house, goose) keep the ep60 face; the headdress is painted on top. */
const Sol: React.FC<{d: string; f: string; c: Ctx; k?: number}> = ({d, f, c, k = 1}) => <><path d={d} fill={PAL.ink} stroke={PAL.ink} strokeWidth={2 * c.OW * k} strokeLinejoin="round" /><path d={d} fill={f} /></>;
/** the animal head kind of a cast (undefined = human head) */
export const animalOf = (k: Cast61): AnimalKind | undefined => k.head ?? (k.base.head !== 'human' ? k.base.head : undefined);
/** head colours: ep61 heads from the cast61 entry, ep60 heads from the ep60 cast (headFill / headFill2) */
export const animalCols = (k: Cast61): [string, string] => { const P = PAL as Record<string, string>;
	return k.head ? [k.color ?? PAL.lion, k.color2 ?? PAL.lion2] : [P[k.base.headFill ?? 'jackal'], P[k.base.headFill2 ?? 'jackal2']]; };
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
	bProp?: Cast['bProp']; fProp?: Cast['fProp']; /** old ep61 film param: = jaw */ open?: number; roar?: number; sneer?: number; jaw?: number; ear?: number; /** animal heads: eyes / look / brow (human heads use expr61 FaceOver) */ look?: {eyes?: number; look?: number; brow?: number}; pivots?: boolean; basket?: boolean; wings?: boolean; dress?: Cast['dress']; hide?: {bArm?: boolean; fArm?: boolean; props?: boolean}};
/** an ep61 god: the ep60 `God` with the layered animal head (headArt) or the ep60 human head + a headdress painted on top */
export const God61: React.FC<God61Props> = ({id, who, pose, x, y, s, face = 1, t = 0, vel, bProp, fProp, open = 0, roar = 0, sneer = 0, jaw = 0, ear = 0, look, pivots = false, basket, wings, dress, hide}) => {
	const k = CAST61[who], c: Ctx = {OW: 2.7 / s, LW: 1.5 / s}, kind = animalOf(k), rr = Math.max(0, Math.min(1, roar));
	// a roar throws the head back a little
	const P: Pose = kind && rr > 0 ? {...pose, head: pose.head - 7 * rr} : pose;
	const extra = {...(wings !== undefined ? {wings} : {}), ...(dress ? {dress} : {})};
	let cast: Cast, headArt: React.ReactNode = undefined;
	if (kind) { const [col, col2] = animalCols(k);
		// the sun disc (lioness, Ra's falcon): it sits ON TOP of the head, behind the ears / skull, so it is drawn here, behind the head
		const cr = k.crown ?? k.base.crown, own = cr === 'sun', off = kind === 'lioness' ? 'translate(-0.3,-0.78)' : 'translate(-0.1,-0.24)';
		headArt = <g>{own && <g transform={off}>{crown(cr, c, t, 1)}</g>}
			<AnimalHead kind={kind} col={col} col2={col2} st={{jaw: Math.max(jaw, open), roar: rr, ear, sneer, ...look}} c={c} id={`${id}-ah`} fillet={kind !== 'cat' && k.base.wig === 'tri'} /></g>;
		// a non-human HeadKind so the rig draws the animal-head wig, lappet and fillet; the crown is drawn by the rig on top of the head
		cast = {...k.base, head: k.base.head === 'human' ? 'jackal' : k.base.head, wig: kind === 'cat' ? 'none' : k.base.wig, crown: k.head || (k.crown ?? k.base.crown) === 'sun' ? 'none' : k.base.crown, mask: false, faceless: false, ...extra};
	} else cast = {...k.base, ...(k.hat ? {crown: 'none' as const} : {}), ...extra};
	const g = solve(P, cast.female);
	const bh = g.bH, grip: [number, number] = [bh[0] * 0.02 + bh[2] * 0.6 + bh[4], bh[1] * 0.02 + bh[3] * 0.6 + bh[5]];
	return <g>
		<God id={id} cast={cast} pose={P} x={x} y={y} s={s} face={face} sec={{t, vel}} bProp={bProp} fProp={fProp} hide={hide} jaw={kind ? 0 : jaw} ear={kind ? 0 : ear} pivots={pivots} headArt={headArt} />
		{(k.hat || basket || (!kind && k.crown)) && <g transform={`translate(${x},${y}) scale(${s * face},${s})`}>
			<g transform={mx(g.head)}>
				{k.hat && hat(k.hat, c)}
				{!kind && k.crown && k.crown !== 'none' && crown(k.crown, c, t, 1)}
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
