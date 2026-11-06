import React from 'react';
import {God, CAST, POSES, Cast, Pose, solve, crown, castBody, Body, BodyArg, Hand, LapFit} from '../qq60/rig60';
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
/** round 3 headdress pieces worn with / under the hat: Isis' vulture cap, a gold fillet (Nephthys), a red headband (Ma'at) */
export type Band61 = 'vulture' | 'fillet' | 'redband';
export type Cast61 = {base: Cast; head?: Head61; hat?: Hat61; band?: Band61; crown?: Cast['crown']; color?: string; color2?: string; /** Sekhmet: the fuller, darker mane */ mane?: boolean; /** design test (WIGTEST61): front lappet in front of the shoulder; default off */ wigFront?: boolean};

/* ---------------- signature colours (owner 2026-11-06, round 3) ----------------
   One colour per character, used for the dress / kilt (or the dominant accent) and repeated on the node ring of the family tree
   (TREE61, the BOARD61 mini-tree), on the tree name tag edge and on the 「辨识」 row of the character sheet. c = main, c2 = second colour. */
export type Sig = {c: string; c2: string; zh: string};
export const SIG61: Record<string, Sig> = {
	atum: {c: '#F8F3E7', c2: '#B8371F', zh: '白 + 红'}, ra: {c: '#ECB637', c2: '#B8371F', zh: '金'}, shu: {c: '#6FB2E0', c2: '#ECB637', zh: '天蓝'},
	tefnut: {c: '#C98C1E', c2: '#ECB637', zh: '赭金'}, geb: {c: '#7A4E2A', c2: '#3A9160', zh: '土褐 + 绿'}, nut: {c: '#1D2E6E', c2: '#F2C649', zh: '星空深蓝'},
	osiris: {c: '#2F8E62', c2: '#F8F3E7', zh: '绿 + 白'}, isis: {c: '#B8371F', c2: '#ECB637', zh: '红'}, set: {c: '#8E3519', c2: '#ECB637', zh: '红赭'},
	nephthys: {c: '#3A9160', c2: '#ECB637', zh: '绿'}, horus: {c: '#2E58A6', c2: '#ECB637', zh: '蓝 + 金'}, anubis: {c: '#1F1B1C', c2: '#ECB637', zh: '黑 + 金'},
	thoth: {c: '#1E3A7C', c2: '#F8F3E7', zh: '深蓝 + 白'}, sekhmet: {c: '#7A1424', c2: '#ECB637', zh: '深绯红亚麻'}, bastet: {c: '#36A39B', c2: '#ECB637', zh: '绿松石'},
	maat: {c: '#F8F3E7', c2: '#ECB637', zh: '白 + 金'}, ani: {c: '#F8F3E7', c2: '#B8371F', zh: '亚麻白'},
};
export const sigOf = (who: string): Sig => SIG61[who] ?? SIG61.ani;
type Ctx = {OW: number; LW: number};

const mk = (name: string, o: Partial<Cast>): Cast => ({name, skin: 'skinM', skin2: 'skinM2', head: 'human', wig: 'tri', crown: 'none', dress: 'kilt', collar: 'god', bHand: 'fist', fHand: 'fist', body: o.female ? 'f' : 'm', ...o});

/** an ep60 cast with an ep61 body type (ep60 itself keeps using CAST / CAST2 without one, so its films draw the old bodies) */
const bd = (c: Cast, body: Body): Cast => ({...c, body});
/** the ep61 cast. Keys: ep60 gods are re-used (anubis, thoth, osiris, horus, ra, ani) with the god body; the rest are built the same way.
 *  Body types (rig60 BODY / BSH): 'm' = Atum, Ra, Shu, Geb, Osiris, Set, Horus, Anubis, Thoth, Ani; 'f' = Isis, Nephthys, Nut, Tefnut, Sekhmet, Bastet, Ma'at. */
export const CAST61: Record<string, Cast61> = {
	ani: {base: bd(CAST.ani, 'm')}, osiris: {base: bd(CAST.osiris, 'm')},
	/** the animal-headed gods keep the lapis-blue wig; the kilt carries the signature colour (round 3) */
	anubis: {base: {...bd(CAST.anubis, 'm'), kiltCol: SIG61.anubis.c, kiltCol2: 'gold'}}, thoth: {base: {...bd(CAST.thoth, 'm'), kiltCol2: SIG61.thoth.c}},
	horus: {base: {...bd(CAST.horus, 'm'), kiltCol: SIG61.horus.c, kiltCol2: 'gold'}}, ra: {base: {...bd(CAST2.ra, 'm'), kiltCol: SIG61.ra.c, kiltCol2: 'red'}},
	/** Atum: man in the red-and-white double crown, was sceptre + ankh (I1) */
	atum: {base: mk('Atum', {crown: 'pschent', wigColor: 'wigH', tail: true, bProp: 'ankh', fProp: 'was', kiltCol2: 'red'})},
	/** Shu: man with the ostrich feather (I3) */
	shu: {base: mk('Shu', {wigColor: 'wigH', crown: 'maat', tail: true, bProp: 'ankh', fProp: 'was', kiltCol: SIG61.shu.c, kiltCol2: 'gold'})},
	/** Tefnut: lioness head, sun disc + uraeus, sheath dress, ankh + was (I4) */
	tefnut: {base: mk('Tefnut', {skin: 'skinF', skin2: 'gold2', dress: 'sheath', female: true, bProp: 'ankh', fProp: 'was', bHand: 'fist', dressCol: SIG61.tefnut.c, net: false}), head: 'lioness', crown: 'sun'},
	/** Geb: man, green skin, the goose (gb, the sign that writes his name) on a black wig (owner round 3), earth-brown kilt (I5) */
	geb: {base: mk('Geb', {skin: 'skinO', skin2: 'skinO2', wig: 'tri', wigColor: 'wigH', tail: true, bProp: 'ankh', fProp: 'was', kiltCol: SIG61.geb.c, kiltCol2: 'green'}), hat: 'goose'},
	/** Nut: woman, plain black wig; her deep-blue starry dress is the identifier (owner round 3; the nu-jar hat is no longer worn) (I6) */
	nut: {base: mk('Nut', {skin: 'skinF', skin2: 'gold2', dress: 'sheath', female: true, bHand: 'open', fHand: 'open', wigColor: 'wigH', dressCol: SIG61.nut.c, net: false, stars: true})},
	/** Isis: woman, vulture headdress under the throne sign on a black wig, red dress, wings (I8; vulture cap: tomb of Nefertari QV66) */
	isis: {base: {...CAST.isis, crown: 'none', body: 'f', wigColor: 'wigH', dressCol: SIG61.isis.c, net: false}, hat: 'throne', band: 'vulture'},
	/** Set: the Set animal head, kilt, was + ankh (I9) */
	set: {base: mk('Set', {tail: true, bProp: 'ankh', fProp: 'was', kiltCol: SIG61.set.c, kiltCol2: 'gold'}), head: 'seth', color: '#9A4A2A', color2: '#6E2F1A'},
	/** Nephthys: woman, house-and-basket sign on the head (I10) */
	nephthys: {base: mk('Nephthys', {skin: 'skinF', skin2: 'gold2', dress: 'sheath', female: true, bHand: 'open', fHand: 'open', dressCol: SIG61.nephthys.c, net: false, wigColor: 'wigH'}), hat: 'house', band: 'fillet'},
	/** Sekhmet: lioness head with the fuller, darker mane + sun disc, dark crimson sheath ("Lady of the Red Linen") (I14) */
	sekhmet: {base: mk('Sekhmet', {skin: 'skinF', skin2: 'gold2', dress: 'sheath', female: true, bProp: 'ankh', fProp: 'was', dressCol: SIG61.sekhmet.c, net: false}), head: 'lioness', crown: 'sun', color: '#CF8E34', color2: '#7A4314', mane: true},
	/** Bastet: cat head, sheath dress, sistrum + basket (I15) */
	bastet: {base: mk('Bastet', {skin: 'skinF', skin2: 'gold2', dress: 'sheath', female: true, fProp: 'sistrum', bHand: 'fist', dressCol: SIG61.bastet.c, net: false}), head: 'cat', color: '#A8957A', color2: '#7A6A54'},
	/** Ma'at: woman, the feather on her head, wings (I16) */
	maat: {base: mk('Maat', {skin: 'skinF', skin2: 'gold2', dress: 'sheath', female: true, crown: 'maat', wings: true, bProp: 'ankh', fProp: 'was', wigColor: 'wigH', dressCol: 'linen', netCol: 'gold'}), band: 'redband'},
};

/* ---------------- head overlays (head frame: face +x, neck pivot at 0,0, crown base at y ≈ -2.5) ----------------
   Animal heads (lioness, cat, Set animal, and the ep60 jackal / ibis / falcon when drawn by God61) are the layered heads of heads61.tsx,
   handed to the rig as `headArt` so they sit in the rig's own head layer (arms in front, wig / lappet behind, crown on top).
   Human heads with a headdress (throne, house, goose; Isis' vulture cap, Nephthys' fillet, Ma'at's headband) keep the ep60 face; the
   headdress is handed to the rig as `hatArt` (over the wig, under the crown, behind the front arm). */
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

/** headdress pieces on the wig (round 3). Isis' vulture cap (New Kingdom, e.g. the tomb of Nefertari, QV66): the bird's body over the
 *  crown of the wig, its wing hanging down the side (gold with blue and red feather rows), its head over the brow, the tail at the back,
 *  and a low gold modius on top that carries the throne sign. Nephthys' gold fillet and Ma'at's red headband run round the wig at the
 *  brow (the feather is tucked into the band at the back). */
const band = (k: Band61, c: Ctx) => {
	if (k === 'vulture') {
		const wing = sp([[0.84, -2.12], [0.5, -2.74], [-0.2, -2.92], [-0.98, -2.62], [-1.5, -1.76], [-1.7, -0.62, 1], [-1.36, -0.84], [-0.9, -1.36], [-0.22, -1.8], [0.42, -1.92], [0.8, -1.8, 1]], true, 0.16);
		const tips: React.ReactNode[] = [];
		for (let i = 0; i < 7; i++) { const u = i / 6, x = lerp(0.62, -1.56, u), y = lerp(-1.9, -0.76, u * u * 0.6 + u * 0.4); tips.push(<path key={i} d={`M${x + 0.14} ${y - 0.04}Q${x} ${y + 0.22} ${x - 0.16} ${y + 0.02}`} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 0.9} />); }
		return <g>
			<Sol d={sp([[-1.0, -2.56], [-1.62, -2.66], [-1.98, -2.36, 1], [-1.56, -2.1]], true, 0.2)} f={PAL.gold} c={c} /><path d="M-1.3 -2.5L-1.82 -2.38" stroke={PAL.blue} strokeWidth={c.LW * 1.4} />{/* tail */}
			<Sol d={wing} f={PAL.gold} c={c} />
			<path d={sp([[0.62, -2.18], [-0.2, -2.12], [-0.96, -1.68], [-1.46, -1.0]], false)} fill="none" stroke={PAL.blue} strokeWidth={c.LW * 3.2} />
			<path d={sp([[0.56, -2.46], [-0.24, -2.44], [-1.06, -2.04], [-1.52, -1.4]], false)} fill="none" stroke={PAL.red} strokeWidth={c.LW * 2.6} />
			<path d={sp([[0.36, -2.7], [-0.26, -2.72], [-0.98, -2.38]], false)} fill="none" stroke={PAL.blue} strokeWidth={c.LW * 2.2} />
			{tips}
			{/* the vulture's head and neck over the brow, hooked beak forward */}
			<Sol d={sp([[0.62, -2.0], [0.98, -2.34], [1.1, -2.62], [1.32, -2.7], [1.5, -2.56], [1.56, -2.4, 1], [1.4, -2.42], [1.28, -2.36], [1.08, -2.12], [0.92, -1.86, 1]], true, 0.16)} f={PAL.gold} c={c} />
			<path d="M1.5 -2.56Q1.62 -2.44 1.54 -2.34" fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.2} /><circle cx={1.26} cy={-2.54} r={0.055} fill={PAL.ink} />
			<path d="M0.92 -2.08Q1.0 -2.3 1.1 -2.5" fill="none" stroke={PAL.blue} strokeWidth={c.LW * 1.6} />
			{/* the modius that carries the throne sign */}
			<Sol d={poly([[-0.82, -2.82], [0.82, -2.82], [0.74, -3.22], [-0.74, -3.22]])} f={PAL.gold} c={c} />
			<path d="M-0.76 -3.02L0.78 -3.02" stroke={PAL.blue} strokeWidth={c.LW * 1.8} />
		</g>; }
	const col = k === 'fillet' ? PAL.gold : PAL.red, d = 'M0.88 -1.98Q-0.3 -2.08 -1.5 -1.7';
	return <g><path d={d} fill="none" stroke={PAL.ink} strokeWidth={c.LW * 5.2} strokeLinecap="round" /><path d={d} fill="none" stroke={col} strokeWidth={c.LW * 3.0} strokeLinecap="round" />
		{k === 'fillet' && <circle cx={-1.42} cy={-1.72} r={0.2} fill={PAL.gold} stroke={PAL.ink} strokeWidth={c.LW} />}</g>;
};
/** Sekhmet's fuller, darker mane: a tufted ruff round the back of the skull and under the jaw, behind the head (the blue wig still shows) */
const MANE = (() => { const pts: Pt[] = []; for (let i = 0; i <= 22; i++) { const a = (-72 - i * 10.5) * Math.PI / 180, r = i % 2 ? 0.86 : 1;
	pts.push([-0.12 + 1.26 * r * Math.cos(a), -1.0 + 1.82 * r * Math.sin(a)]); } pts.push([0.7, 0.2], [0.3, -1.0], [0.4, -2.4]); return sp(pts, true, 0.12); })();

/** basket held in the hand (Bastet's aegis basket) */
const Basket: React.FC<{p: [number, number]; c: Ctx}> = ({p, c}) => <g transform={`translate(${p[0]},${p[1]})`}>
	<Sol d={poly([[-0.8, 0.1], [0.8, 0.1], [0.6, 1.5], [-0.6, 1.5]])} f={PAL.mat} c={c} />
	{[0.45, 0.85, 1.2].map((y) => <path key={y} d={`M-0.75 ${y}L0.75 ${y}`} stroke={PAL.mat2} strokeWidth={c.LW} />)}
	<path d="M-0.7 0.1Q0 -1.2 0.7 0.1" fill="none" stroke={PAL.ink} strokeWidth={c.LW * 1.6} /></g>;

/* ---------------- wigFront design test (WIGTEST61): where the front lappet sits on each animal head ----------------
   Head frame (face +x, neck pivot 0,0). f / b = the strip's front / back edge from its (hidden) top to the head-neck join; the front edge
   stays BEHIND the jaw hinge and below / behind the eye (falcon: below the white cheek patch too), so the muzzle or beak, the eye, the ears and the open mouth stay clear.
   tuck = the jowl line: above it the skull is in front (the lappet's top slips behind the cheek and the ear), below it the lappet lies
   over the throat, the jaw hinge, the neck (and Sekhmet's mane) and then over the collar. The cat head wears no wig (canon §0.2). */
export const LAPFIT61: Partial<Record<AnimalKind, LapFit>> = {
	lioness: {f: [[0.22, -1.25], [0.42, -0.5], [0.46, 0.5]], b: [[-0.78, -1.25], [-0.56, -0.5], [-0.46, 0.5]], tuck: [[-1.7, -0.78], [-0.9, -0.64], [-0.2, -0.68], [0.3, -0.62], [0.72, -0.42]]},
	seth: {f: [[0.4, -1.2], [0.7, -0.56], [0.72, 0.45]], b: [[-0.6, -1.2], [-0.28, -0.56], [-0.2, 0.45]], tuck: [[-1.7, -0.82], [-0.8, -0.7], [0.0, -0.74], [0.55, -0.7], [1.0, -0.52]]},
	jackal: {f: [[0.5, -1.2], [0.84, -0.56], [0.84, 0.45]], b: [[-0.5, -1.2], [-0.14, -0.56], [-0.08, 0.45]], tuck: [[-1.7, -0.82], [-0.8, -0.7], [0.1, -0.74], [0.7, -0.7], [1.15, -0.52]]},
	ibis: {f: [[0.2, -1.0], [0.5, -0.55], [0.56, 0.4]], b: [[-0.6, -1.0], [-0.48, -0.55], [-0.36, 0.4]], tuck: [[-1.6, -0.8], [-0.7, -0.76], [0.0, -0.86], [0.45, -0.86], [0.9, -0.76]]},
	falcon: {f: [[0.1, -0.9], [0.4, -0.3], [0.5, 0.42]], b: [[-0.9, -0.9], [-0.58, -0.3], [-0.42, 0.42]], tuck: [[-1.6, -0.6], [-0.7, -0.5], [0.05, -0.55], [0.32, -0.38], [0.56, -0.1]]},
};
export type God61Props = {id: string; who: string; pose: Pose; x: number; y: number; s: number; face?: 1 | -1; t?: number; vel?: {head?: number; torso?: number};
	bProp?: Cast['bProp']; fProp?: Cast['fProp']; /** hand shapes override; by default a goddess opens an empty hand (no fist unless she holds something) */ hands?: {b?: Hand; f?: Hand}; /** old ep61 film param: = jaw */ open?: number; roar?: number; sneer?: number; jaw?: number; ear?: number; /** animal heads: eyes / look / brow (human heads use expr61 FaceOver) */ look?: {eyes?: number; look?: number; brow?: number}; pivots?: boolean; basket?: boolean; wings?: boolean; dress?: Cast['dress']; hide?: {bArm?: boolean; fArm?: boolean; props?: boolean}; /** design test: the tripartite wig's near front lappet in front of the shoulder / over the collar (default: the cast's wigFront, else off) */ wigFront?: boolean};
/** an ep61 god: the ep60 `God` with the layered animal head (headArt) or the ep60 human head + a headdress painted on top */
export const God61: React.FC<God61Props> = ({id, who, pose, x, y, s, face = 1, t = 0, vel, bProp, fProp, hands, open = 0, roar = 0, sneer = 0, jaw = 0, ear = 0, look, pivots = false, basket, wings, dress, hide, wigFront}) => {
	const k = CAST61[who], wf = wigFront ?? k.wigFront ?? false, c: Ctx = {OW: 2.7 / s, LW: 1.5 / s}, kind = animalOf(k), rr = Math.max(0, Math.min(1, roar));
	// a roar throws the head back a little
	const P: Pose = kind && rr > 0 ? {...pose, head: pose.head - 7 * rr} : pose;
	// goddesses: an empty hand is open and elegant (a fist only round a prop, the basket handle or an explicit override)
	const fem = k.base.body === 'f', bEmpty = (bProp ?? k.base.bProp ?? 'none') === 'none' && !basket, fEmpty = (fProp ?? k.base.fProp ?? 'none') === 'none';
	const hb: Hand | undefined = hands?.b ?? (fem && bEmpty && k.base.bHand === 'fist' ? 'open' : undefined), hf: Hand | undefined = hands?.f ?? (fem && fEmpty && k.base.fHand === 'fist' ? 'open' : undefined);
	const extra = {...(wings !== undefined ? {wings} : {}), ...(dress ? {dress} : {}), ...(hb ? {bHand: hb} : {}), ...(hf ? {fHand: hf} : {})};
	let cast: Cast, headArt: React.ReactNode = undefined;
	if (kind) { const [col, col2] = animalCols(k);
		// the sun disc (lioness, Ra's falcon): it sits ON TOP of the head, behind the ears / skull, so it is drawn here, behind the head
		const cr = k.crown ?? k.base.crown, own = cr === 'sun', off = kind === 'lioness' ? 'translate(-0.3,-0.78)' : 'translate(-0.1,-0.24)';
		headArt = <g>{own && <g transform={off}>{crown(cr, c, t, 1)}</g>}
			{k.mane && <Sol d={MANE} f={col2} c={c} />}
			<AnimalHead kind={kind} col={col} col2={col2} st={{jaw: Math.max(jaw, open), roar: rr, ear, sneer, ...look}} c={c} id={`${id}-ah`} fillet={kind !== 'cat' && k.base.wig === 'tri'} /></g>;
		// a non-human HeadKind so the rig draws the animal-head wig, lappet and fillet; the crown is drawn by the rig on top of the head
		cast = {...k.base, head: k.base.head === 'human' ? 'jackal' : k.base.head, wig: kind === 'cat' ? 'none' : k.base.wig, crown: k.head || (k.crown ?? k.base.crown) === 'sun' ? 'none' : k.base.crown, mask: false, faceless: false, ...extra};
	} else cast = {...k.base, ...(k.hat ? {crown: 'none' as const} : {}), ...extra};
	// human heads: the band / vulture cap and the hat go in the rig's own head layer (over the wig, behind the front arm)
	const hatArt = !kind && (k.hat || k.band) ? <g>{k.band && band(k.band, c)}{k.hat && <g transform={k.band === 'vulture' ? 'translate(0,-0.8)' : undefined}>{hat(k.hat, c)}</g>}</g> : undefined;
	const g = solve(P, castBody(cast));
	const bh = g.bH, grip: [number, number] = [bh[0] * 0.02 + bh[2] * 0.6 + bh[4], bh[1] * 0.02 + bh[3] * 0.6 + bh[5]];
	return <g>
		<God id={id} cast={cast} pose={P} x={x} y={y} s={s} face={face} sec={{t, vel}} bProp={bProp} fProp={fProp} hide={hide} jaw={kind ? 0 : jaw} ear={kind ? 0 : ear} pivots={pivots} headArt={headArt} hatArt={hatArt} wigFront={wf} lapFit={kind ? LAPFIT61[kind] : undefined} />
		{(basket || (!kind && k.crown)) && <g transform={`translate(${x},${y}) scale(${s * face},${s})`}>
			<g transform={mx(g.head)}>
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
	const g = solve(pose, bodyOf(who)), q = ap(g.head, p); return [x + q[0] * s * face, y + q[1] * s]; };
/** the body argument for solve() / reach() of an ep61 character (its body type) */
export const bodyOf = (who: string): BodyArg => castBody(CAST61[who].base);
