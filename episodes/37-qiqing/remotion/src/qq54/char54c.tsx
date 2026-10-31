import React from 'react';
import {lerp} from '../qq50/kit50';
/* ep54 look C 「全角色」(the 马首 family, characters drawn): the Han man rig. Local units = cm, facing right, feet at (0, 0), y down.
   Cel shading: every part is filled in its shade tone, its lit copy shifted toward the key (so the terminator falls on the side away
   from the light), and a thin rim strip on the side facing the rim light. Faces: 3/4 profile, small almond eyes, a brow stroke, a
   nostril and a mouth line; no outlines. Layers that move: the near arm (prop), the head (tilt), the sleeve drape (sway). */
export type P = [number, number];
const hx = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mixc = (a: string, b: string, t: number) => { const A = hx(a), B = hx(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], Math.max(0, Math.min(1, t)))).toString(16).padStart(2, '0')).join(''); };
/** light: L = unit 2-D vector toward the key, s = terminator shift (cm), rim = unit vector toward the rim light, r = rim width (cm) */
export type Lite = {L: P; s: number; rim: P; r: number; rimC: string; dark: string; k: number};
const f = (v: number) => v.toFixed(2);

export const Cel: React.FC<{id: string; d: string; c: string; lt: Lite; sh?: string; s?: number; norim?: boolean}> = ({id, d, c, lt, sh, s, norim}) => {
	const shade = sh ?? mixc(c, lt.dark, lt.k), so = s ?? lt.s;
	return <g>
		<clipPath id={id}><path d={d} /></clipPath>
		<g clipPath={`url(#${id})`}>
			<path d={d} fill={norim ? shade : lt.rimC} />
			<g transform={norim ? undefined : `translate(${f(-lt.rim[0] * lt.r)},${f(-lt.rim[1] * lt.r)})`}>
				<path d={d} fill={shade} />
				<path d={d} fill={c} transform={`translate(${f(lt.L[0] * so)},${f(lt.L[1] * so)})`} />
			</g>
		</g>
	</g>;
};

/* ---------- geometry helpers ---------- */
const nrm = (a: P): P => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; };
const prp = (a: P, b: P): P => nrm([-(b[1] - a[1]), b[0] - a[0]]);
const ad = (a: P, b: P, k = 1): P => [a[0] + b[0] * k, a[1] + b[1] * k];
const pt = (p: P) => `${f(p[0])},${f(p[1])}`;
/** a wide Han sleeve from shoulder S over elbow E to the wrist Hd; the cuff opens to w2 and the sleeve bag sags by drape */
export const sleeve = (S: P, E: P, Hd: P, w1: number, w2: number, drape: number) => {
	const n1 = prp(S, E), n2 = prp(E, Hd), nE = nrm(ad(n1, n2));
	const a1 = ad(S, n1, w1 / 2), b1 = ad(S, n1, -w1 / 2), aE = ad(E, nE, w1 * 0.5), bE = ad(E, nE, -w1 * 0.5), aH = ad(Hd, n2, w2 / 2), bH = ad(Hd, n2, -w2 / 2);
	// the lower side (screen down) gets the bag
	const lowA = aH[1] > bH[1];
	const cuffLow = lowA ? aH : bH, elbLow = lowA ? aE : bE;
	const c1: P = [cuffLow[0], cuffLow[1] + drape * 1.25], c2: P = [lerp(cuffLow[0], elbLow[0], 0.55), Math.max(cuffLow[1], elbLow[1]) + drape * 0.9];
	if (lowA) return `M${pt(b1)} Q${pt(bE)} ${pt(bH)} L${pt(aH)} C${pt(c1)} ${pt(c2)} ${pt(aE)} Q${pt(ad(aE, [a1[0] - aE[0], a1[1] - aE[1]], 0.5))} ${pt(a1)} Z`;
	return `M${pt(a1)} Q${pt(aE)} ${pt(aH)} L${pt(bH)} C${pt(c1)} ${pt(c2)} ${pt(bE)} Q${pt(ad(bE, [b1[0] - bE[0], b1[1] - bE[1]], 0.5))} ${pt(b1)} Z`;
};
/** a simple mitten hand at the wrist Hd, pointing along E→Hd */
export const hand = (E: P, Hd: P, len = 6.4, w = 5.2) => { const d = nrm([Hd[0] - E[0], Hd[1] - E[1]]), n: P = [-d[1], d[0]];
	const tip = ad(Hd, d, len), c1 = ad(ad(Hd, n, w / 2), d, len * 0.5), c2 = ad(ad(Hd, n, -w / 2), d, len * 0.5);
	return `M${pt(ad(Hd, n, w * 0.42))} Q${pt(c1)} ${pt(ad(tip, n, w * 0.12))} Q${pt(ad(tip, d, 0.6))} ${pt(ad(tip, n, -w * 0.18))} Q${pt(c2)} ${pt(ad(Hd, n, -w * 0.42))} Z`; };

/* ---------- the rig ---------- */
export type Kit = {skin: string; hair: string; robe: string; trim: string; under: string; belt: string; shoe: string; cap: 'wu' | 'ze' | 'jx';
	capC: string; zeC?: string; beard: 0 | 1 | 2; armor?: string; lam?: string; slim?: number};
export type Arm = {S: P; E: P; H: P; w1?: number; w2?: number; drape?: number};
export type Pose = {near: Arm; far: Arm; propBehind?: React.ReactNode; propFront?: React.ReactNode; propUnder?: React.ReactNode; gripFar?: React.ReactNode; gripNear?: React.ReactNode};

const HEAD = 'M-6.5,-162 C-6.8,-169 -1.5,-173.5 4.5,-173 C9.5,-172.5 11.6,-168.5 11.8,-163.5 C11.9,-161.5 11.7,-160.2 12.1,-158.8 L13.8,-155.4 C14,-154.9 13.6,-154.5 13,-154.4 L12.2,-154.3 C12.5,-153.4 12.4,-152.6 12,-152 C12.4,-151.4 12.2,-150.4 11.4,-149.8 C10.6,-147.6 8.4,-145.6 5.4,-145.2 C2.4,-145 -0.6,-146.4 -2.8,-149 C-5.2,-152 -6.4,-156.5 -6.5,-162 Z';
const HAIR = 'M-7.2,-157 C-8,-166 -3.5,-174 4,-174.2 C9,-174.2 11.8,-171 12,-166.5 C9.6,-167.6 6.4,-168 3.4,-167.6 C1,-166.6 -0.6,-164.6 -1.6,-162 L-2.4,-158.6 C-3,-156 -4,-153.8 -5.2,-152.6 Z';
const EAR = 'M-1.8,-161 C-4.6,-162.2 -6.2,-159 -5.4,-156.2 C-4.8,-154.2 -3,-153.6 -1.6,-154.6 Z';
const NECK = 'M-3,-152 L5.6,-147 L6.4,-138.5 L-4,-138.5 Z';
const ROBE = (k: number) => `M${f(-15.5 * k)},-133 C${f(-19 * k)},-124 ${f(-19.5 * k)},-112 ${f(-18.5 * k)},-98 C${f(-19.5 * k)},-70 -22,-36 -24.5,-5 C-12,-3 6,-3 19.5,-5 C17.5,-34 ${f(15.5 * k)},-66 ${f(14.5 * k)},-98 C${f(15.5 * k)},-112 ${f(16 * k)},-124 ${f(13 * k)},-133.5 C10,-138.6 6.4,-141.6 1.6,-142.2 C-4.4,-142.4 -10.6,-139.4 ${f(-15.5 * k)},-133 Z`;
const HEM = 'M-24.5,-5 C-12,-3 6,-3 19.5,-5 L19.1,-11 C6,-9.2 -12,-9.2 -24,-11 Z';
const VEST = 'M-16.6,-139.5 C-20.2,-126 -20.6,-108 -19.8,-90 L16.4,-90 C16.6,-108 17,-124 13.6,-139.5 C6,-144 -9,-144 -16.6,-139.5 Z';
const SKIRT = 'M-20.2,-93 L16.6,-93 L18.2,-70 C6,-67.6 -10,-67.6 -22.2,-70 Z';
const PAULD = 'M-19.6,-141 C-24.4,-136 -26,-127 -25,-118 L-13.6,-120.4 C-12.8,-128 -13.2,-135 -14.4,-139.8 Z';

/** lamellae rows inside a band [y0, y1] between x0(y) .. x1(y) */
const lamRows = (y0: number, y1: number, xl: (y: number) => number, xr: (y: number) => number, row = 3.4, col = 3.1) => {
	const dk: string[] = [], hi: string[] = [];
	for (let y = y0, i = 0; y < y1 - 0.5; y += row, i++) { const a = xl(y), b = xr(y);
		dk.push(`M${f(a)},${f(y)} L${f(b)},${f(y)}`); hi.push(`M${f(a)},${f(y + 0.7)} L${f(b)},${f(y + 0.7)}`);
		for (let x = a + (i % 2 ? col / 2 : 0); x < b; x += col) dk.push(`M${f(x)},${f(y)} L${f(x)},${f(y + row)}`); }
	return {dk: dk.join(' '), hi: hi.join(' ')}; };

/** sil: the same rig as a one-tone warm-black silhouette with only the rim (the masses: guards, crowds, armies) */
export const Han: React.FC<{id: string; x: number; y: number; k: number; flip?: boolean; kit: Kit; pose: Pose; lt: Lite; shadow?: number; sil?: string}> = ({id, x, y, k, flip, kit: kit0, pose, lt: lt1, shadow = 0.5, sil}) => {
	const kit: Kit = sil ? {...kit0, skin: sil, hair: sil, robe: sil, trim: sil, under: sil, belt: sil, shoe: sil, capC: sil, zeC: sil, armor: kit0.armor ? sil : undefined, lam: sil} : kit0;
	const lt0: Lite = sil ? {...lt1, k: 0, dark: sil} : lt1;
	const lt: Lite = flip ? {...lt0, L: [-lt0.L[0], lt0.L[1]], rim: [-lt0.rim[0], lt0.rim[1]]} : lt0;
	let n = 0; const I = () => `${id}_${n++}`;
	const C = (d: string, c: string, o: {s?: number; sh?: string; norim?: boolean} = {}) => <Cel key={I()} id={I()} d={d} c={c} lt={lt} {...o} />;
	const sl = kit.slim ?? 1, dark = lt.dark;
	const arm = (a: Arm, front: boolean, grip?: React.ReactNode) => { const w1 = a.w1 ?? 11, w2 = a.w2 ?? 13, dr = a.drape ?? 7;
		return <g key={I()}>
			{C(sleeve(a.S, a.E, a.H, w1, w2, dr), front ? kit.robe : mixc(kit.robe, dark, 0.25), {s: 3})}
			<path d={`M${pt(ad(a.H, prp(a.E, a.H), w2 / 2))} L${pt(ad(a.H, prp(a.E, a.H), -w2 / 2))}`} stroke={kit.trim} strokeWidth={1.6} />
			{grip}
			{C(hand(a.E, a.H), kit.skin, {s: 1.4})}
		</g>; };
	const lam = kit.armor ? lamRows(-138, -91, (yy) => lerp(-16.6, -19.8, (yy + 139.5) / 49.5) + 0.6, (yy) => lerp(13.6, 16.4, (yy + 139.5) / 49.5) - 0.6) : null;
	const lamS = kit.armor ? lamRows(-92, -71, (yy) => lerp(-20.2, -22.2, (yy + 93) / 23) + 0.5, (yy) => lerp(16.6, 18.2, (yy + 93) / 23) - 0.5, 3.4, 2.6) : null;
	const lamP = kit.armor ? lamRows(-138, -120, (yy) => lerp(-21, -25, (yy + 138) / 18), (yy) => lerp(-14.2, -13.6, (yy + 138) / 18), 3.2, 2.8) : null;
	const capEl = () => {
		const ze = <>{C('M-7.8,-160.5 C-8.6,-168.6 -3.4,-175.6 4,-175.4 C8.8,-175.2 11.8,-172.4 12.4,-167.6 C9.6,-169 6.2,-169.4 3,-168.8 L-1.8,-165.6 L-7.8,-160.5 Z', kit.zeC ?? kit.capC, {s: 1.2})}
			{C('M-8.6,-163 L-9.8,-170.8 C-7.2,-173 -3,-173.4 0.2,-172.6 L0.6,-169 Z', kit.zeC ?? kit.capC, {s: 1.2})}</>;
		if (kit.cap === 'ze') return ze;
		if (kit.cap === 'wu') return <>{ze}
			{C('M-10.2,-166 C-11.8,-170.4 -11.2,-175.4 -7.4,-178 C-2.6,-180.6 5,-180.8 8.8,-178.6 C11.4,-176.6 12.2,-173.4 11.8,-170.2 C4.8,-171.2 -2.6,-169.8 -10.2,-166 Z', kit.capC, {s: 1.6})}
			<path d="M-10.6,-170.6 C-3,-173.4 4,-174.4 11.8,-174 M-6,-178.6 C-7,-175 -7.4,-172 -7,-168.6 M0.6,-180.4 C0.2,-177 0.2,-174 0.6,-170.8 M6.4,-180 C6.8,-177 7.2,-174.4 7.8,-171.4" stroke={mixc(kit.capC, '#9a8e80', 0.35)} strokeWidth={0.3} fill="none" opacity={0.45} /><path d="M-8.6,-176.8 C-3,-180.4 4,-180.6 9,-178.2" stroke="#8C9C98" strokeWidth={0.45} fill="none" opacity={0.6} />
			<path d="M-5.4,-166.4 C-4.6,-160 -2.2,-152 1.2,-146.6" stroke={kit.capC} strokeWidth={0.6} fill="none" opacity={0.85} /></>;
		return <>{ze}{C('M-6.8,-170.6 L10.4,-171.4 L11.2,-189 L-5.4,-179.6 Z', kit.capC, {s: 1.6})}<path d="M10.6,-188 L-4.6,-179.8" stroke="#6b625a" strokeWidth={0.5} /></>;
	};
	const face = <g key="face">
		<path d="M5.3,-158.6 Q7.5,-160.5 10,-158.9 Q7.7,-157.4 5.3,-158.6 Z" fill="#F0E2CC" opacity={0.55} /><path d="M6.6,-158.7 Q7.9,-160.2 9.6,-158.95 Q8,-157.5 6.6,-158.7 Z" fill="#1A110C" />
		<path d="M5,-158.8 Q7.5,-161 10.2,-159.1" stroke="#1A110C" strokeWidth={0.75} strokeLinecap="round" fill="none" />
		<path d="M11.5,-159.1 Q11.95,-159.6 12.35,-159.1 Q11.95,-158.65 11.5,-159.1 Z" fill="#1A110C" />
		<path d="M4.8,-161.8 Q7.8,-163.4 11.2,-162.3" stroke={kit.hair} strokeWidth={kit.beard === 2 ? 1.15 : 0.95} strokeLinecap="round" fill="none" />
		<path d="M11.4,-155.4 Q12.4,-154.6 13.1,-155" stroke={mixc(kit.skin, '#1a0e08', 0.5)} strokeWidth={0.45} fill="none" />
		<path d="M9.8,-151.9 Q11,-151.5 12.1,-151.95" stroke={mixc(kit.skin, '#3a140c', 0.55)} strokeWidth={0.6} strokeLinecap="round" fill="none" />
		<path d="M8.4,-155.8 Q9.4,-153.8 9.2,-152.8" stroke={mixc(kit.skin, '#3a1a10', 0.35)} strokeWidth={0.4} fill="none" opacity={kit.beard === 2 ? 0.9 : 0.4} />
		{kit.beard === 1 && <path d="M10.1,-153.1 Q11.3,-153.7 12.5,-153.2" stroke={kit.hair} strokeWidth={0.45} fill="none" opacity={0.55} />}
		{kit.beard === 2 && <>
			<path d="M8.8,-152.5 C10.2,-154 12,-154 12.9,-153 C12.1,-152.7 10.6,-152.5 8.8,-152.5 Z" fill={kit.hair} />
			{C('M6.4,-149.6 C8.6,-148.6 10.8,-149 11.8,-150.4 C11.9,-147 10.4,-143.6 7.2,-141.2 C6.2,-144 5.6,-147 6.4,-149.6 Z', kit.hair, {s: 0.8})}
			<path d="M-1.6,-153.2 C0,-148.6 3,-146.2 6.6,-146 L6.8,-149 C4,-149.4 1.4,-151.2 -0.4,-154.4 Z" fill={kit.hair} opacity={0.82} />
			<path d="M10.6,-150.2 L12,-150.6" stroke={kit.hair} strokeWidth={0.5} /></>}
	</g>;
	const T = `translate(${x},${y}) scale(${flip ? -k : k},${k})`;
	return <g>
		{shadow > 0 && <ellipse cx={x} cy={y + 1} rx={34 * k} ry={5 * k} fill="#0A0605" opacity={shadow} />}
		<g transform={T}>
			{pose.propBehind}
			{arm(pose.far, false, pose.gripFar)}
			{C('M-19.5,-5 L-8,-5.5 L-8,0 L-20.5,0 Z', mixc(kit.shoe, dark, 0.3), {s: 1})}
			{C(ROBE(sl), kit.robe, {s: 5})}
			{C(HEM, kit.trim, {s: 5})}
			<path d="M9.6,-110 C10.8,-80 11.6,-44 12.4,-10" stroke={mixc(kit.robe, '#000000', 0.45)} strokeWidth={0.7} fill="none" />
			<path d="M-6,-90 C-7,-60 -9,-34 -11,-12 M2,-88 C2.4,-60 2,-36 1.4,-12 M-14,-86 C-15.6,-62 -17.4,-38 -19.6,-14" stroke={mixc(kit.robe, '#000000', 0.4)} strokeWidth={0.8} fill="none" opacity={0.7} />
			<path d="M-5.2,-90 C-6.2,-60 -8.2,-34 -10.2,-12 M2.8,-88 C3.2,-60 2.8,-36 2.2,-12" stroke={mixc(kit.robe, '#ffffff', 0.18)} strokeWidth={0.5} fill="none" opacity={0.5} />
			{C('M6.4,-5.4 C12,-6 18,-6 22,-5 C24.6,-4.2 25.6,-2 24.6,-0.4 L6.4,0 Z', kit.shoe, {s: 1})}
			{kit.armor && lamS && <>{C(SKIRT, kit.armor, {s: 4})}<path d={lamS.hi} stroke={kit.lam} strokeWidth={0.4} opacity={0.7} /><path d={lamS.dk} stroke="#0e0a08" strokeWidth={0.45} /></>}
			{C(NECK, kit.skin, {s: 2})}
			{!kit.armor && <>
				<path d="M8.4,-141 C7.4,-136 6,-131 4.6,-127.4" stroke={kit.under} strokeWidth={2.4} fill="none" />
				<path d="M-4,-141.6 C0,-134 5,-124 10.6,-108.6" stroke={kit.trim} strokeWidth={3.4} fill="none" />
				<path d="M-4,-141.6 C0,-134 5,-124 10.6,-108.6" stroke={mixc(kit.trim, '#ffffff', 0.25)} strokeWidth={0.5} fill="none" transform="translate(0.9,-0.6)" opacity={0.7} /></>}
			{kit.armor && lam && <>{C(VEST, kit.armor, {s: 4.5})}<path d={lam.hi} stroke={kit.lam} strokeWidth={0.42} opacity={0.75} /><path d={lam.dk} stroke="#0e0a08" strokeWidth={0.45} />
				<path d="M-6,-142.6 C-2,-140.4 3,-140.4 8.6,-142.8" stroke={kit.trim} strokeWidth={2.6} fill="none" />
				<path d="M8.6,-142.6 L6.4,-135" stroke={kit.under} strokeWidth={2} /></>}
			{C('M-19.4,-101 C-5,-98.6 6,-98.6 15.2,-101 L15.2,-95.8 C6,-93.6 -5,-93.6 -19.4,-95.8 Z', kit.belt, {s: 2})}
			<path d="M11,-99.4 L15.6,-98.6 L15.6,-96.6 L11,-97.4 Z" fill="#B49A62" />
			{pose.propUnder}
			{kit.armor && lamP && <>{C(PAULD, kit.armor, {s: 2.6})}<path d={lamP.dk} stroke="#0e0a08" strokeWidth={0.42} /></>}
			{arm(pose.near, true, pose.gripNear)}
			{pose.propFront}
			<g transform="translate(1.2,2.6) translate(3,-150) scale(1.08) translate(-3,150)">
			{C(HEAD, kit.skin, {s: 2.2})}
			{C(HAIR, kit.hair, {s: 1.2})}
			{C(EAR, kit.skin, {s: 0.8})}
			<path d="M-2.4,-159.6 C-4.2,-159.6 -4.6,-157.4 -3.6,-156" stroke={mixc(kit.skin, '#2a120a', 0.45)} strokeWidth={0.45} fill="none" />
			{!sil && face}
			{capEl()}
			</g>
		</g>
	</g>;
};
