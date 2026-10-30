import React from 'react';
import {lerp} from '../qq50/kit50';
import {Cam, V3, proj, poly, toCam, mix} from './parts53';
import {GLS, TQS, bladeHW, LB} from './props53';
import {A, R_POM, R_GRIP, R_HOOP, HOOPS, HOOP_HL, POM_PROF, GUARD_OUT, guardT, inlayPanel, inlayCells, METAL as BZ, SwordPose} from './swordspec53s';
import {BladeLand, LandOpts, Light} from './land53';
import {PommelFace} from './face53';
/* ep53 · the sword as a 3-D model drawn in SVG through the look-at camera (parts53). Units: mm; every dimension from
   swordspec53s (B1–B6): the local axis a runs from the pommel's end face (a = 0) to the tip (a = 556), lying level, the front
   face (blue glass) up. World placement: pommel end at (x0, ya, z0), axis along dir·x.
   - Blade3D = land53.BladeLand (the same lit lattice as the one take), clipped at the guard's inverted V;
   - Guard3D = the guard outline extruded to its thickness, faces back-culled and painted far → near; glass on the front face,
     turquoise on the back face;
   - Hilt3D = the grip, its two hoops and the pommel as surfaces of revolution (silhouettes taken per station, so they stay right
     when the camera looks along the axis), the end face with its 11 rings drawn by face53.PommelFace (the dive's ring match);
   - Sword3D paints the three in the order the camera's place along the axis gives (no part ever pokes through another). */
export type {SwordPose};
const A_BLADE = A.blade0, LEN = A.L;
const W = (sp: SwordPose, a: number, y: number, z: number): V3 => [sp.x0 + sp.dir * a, sp.ya + y, sp.z0 + z];
const circleYZ = (sp: SwordPose, a: number, r: number, n = 40): V3[] => Array.from({length: n}, (_, i) => { const t = (i / n) * 2 * Math.PI; return W(sp, a, r * Math.cos(t), r * Math.sin(t)); });
const pathOf = (pts: [number, number, number][]) => 'M' + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L') + 'Z';
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/** the camera's place along the sword's axis (mm from the pommel's end face) */
const axialOf = (c: Cam, sp: SwordPose) => (c.p[0] - sp.x0) * sp.dir;

/** the default light of the 3-D views: the case spot from above-front and a soft fill */
export const LIGHTS3D: Light[] = [{dir: [0.08, -0.28, 0.96], k: 0.95}, {dir: [-0.55, -0.6, 0.5], k: 0.45}];
/** the blade: BladeLand (lit lattice, ridge, edge strips) — `land` overrides its options; sheen = position 0..1 of a wash */
export const Blade3D: React.FC<{c: Cam; sp: SwordPose; id: string; lit?: number; sheen?: number; sheenCol?: string; fog?: (d: number) => number; fogCol?: string; rust?: number; land?: Partial<LandOpts>}> = ({c, sp, id, lit = 1, sheen = -1, land}) =>
	<BladeLand c={c} sp={sp} id={id} o={{lights: LIGHTS3D, shin: 90, lift: 0.18 * lit, sheen: sheen >= 0 ? {pos: sheen, k: 0.62} : undefined, guardCut: true, ...land}} />;

/** guard: the shared outline extruded to ±guardT(a); the front face (z+) carries the blue glass, the back face turquoise */
export const Guard3D: React.FC<{c: Cam; sp: SwordPose; id: string; lite?: number}> = ({c, sp, id, lite = 0}) => {
	const O = GUARD_OUT, n = O.length, F = (k: number, s: 1 | -1) => W(sp, O[k][0], O[k][1], s * guardT(O[k][0]));
	type Face = {d: string; z: number; kind: 'front' | 'back' | 'side'; shade: number};
	const faces: Face[] = [];
	const depth = (pts: V3[]) => pts.reduce((m, q) => m + toCam(c, q)[2], 0) / pts.length;
	const front = O.map((_, k) => F(k, 1)), back = O.map((_, k) => F(k, -1));
	if (c.p[2] > sp.z0 + guardT(92)) faces.push({d: poly(c, front), z: depth(front), kind: 'front', shade: 0});
	if (c.p[2] < sp.z0 - guardT(92)) faces.push({d: poly(c, back), z: depth(back), kind: 'back', shade: 0});
	for (let k = 0; k < n; k++) { const k1 = (k + 1) % n, da = O[k1][0] - O[k][0], dw = O[k1][1] - O[k][1];
		/* the outline runs clockwise in (a, w): the outward normal of an edge is (−dw, da) */
		const nw: V3 = [sp.dir * -dw, da, 0], q = [F(k, 1), F(k1, 1), F(k1, -1), F(k, -1)], m = q.reduce((s, p) => [s[0] + p[0] / 4, s[1] + p[1] / 4, s[2] + p[2] / 4] as V3, [0, 0, 0] as V3);
		if (dot(nw, [c.p[0] - m[0], c.p[1] - m[1], c.p[2] - m[2]]) <= 0) continue;
		const ln = Math.hypot(nw[0], nw[1]) || 1, shade = 0.5 + 0.5 * (-nw[1] / ln);       // faces toward −y (the front of the case) are lit
		faces.push({d: poly(c, q), z: depth(q), kind: 'side', shade}); }
	faces.sort((a, b) => b.z - a.z);
	const P = (pts: [number, number][], s: 1 | -1, lift = 0.25) => pts.map(([a, w]) => W(sp, a, w, s * (guardT(a) + lift)));
	return <g>
		<defs><linearGradient id={`gg${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={GLS.lit} /><stop offset="0.55" stopColor={GLS.body} /><stop offset="1" stopColor={GLS.deep} /></linearGradient>
			<linearGradient id={`gt${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={TQS.lit} /><stop offset="0.55" stopColor={TQS.body} /><stop offset="1" stopColor={TQS.deep} /></linearGradient></defs>
		{faces.map((f, i) => f.d ? <g key={i}>
			{(() => { const fc = f.kind === 'side' ? mix(mix(BZ.deep, BZ.mid, f.shade), '#E8B878', 0.25 * lite) : mix(BZ.mid, BZ.lit, 0.15 + 0.2 * lite);
				return <path d={f.d} fill={fc} stroke={f.kind === 'side' ? fc : BZ.line} strokeOpacity={f.kind === 'side' ? 1 : 0.55} strokeWidth={f.kind === 'side' ? 0.8 : 1} strokeLinejoin="round" />; })()}
			{f.kind !== 'side' && ([1, -1] as const).map((s) => { const sd = f.kind === 'front' ? 1 : -1;
				return <g key={s}><path d={poly(c, P(inlayPanel(s), sd))} fill={f.kind === 'front' ? `url(#gg${id})` : `url(#gt${id})`} />
					{inlayCells(s).map((ln, k) => <path key={k} d={poly(c, P(ln, sd, 0.35), false)} stroke={BZ.lit} strokeWidth={Math.max(0.8, c.f * 1.1 / Math.max(1, toCam(c, W(sp, 92, 0, 0))[2]))} fill="none" strokeOpacity={0.9} />)}</g>; })}
			{f.kind === 'front' && <path d={poly(c, [W(sp, 82.4, -22.6, guardT(82) + 0.3), W(sp, 82.4, 22.6, guardT(82) + 0.3)], false)} stroke={BZ.hi} strokeWidth={Math.max(0.8, c.f * 0.7 / Math.max(1, toCam(c, W(sp, 92, 0, 0))[2]))} fill="none" opacity={0.75} />}
		</g> : null)}
	</g>; };

/** grip (cylinder with two raised hoops) and the pommel disc; its end face with the 11 rings is face53.PommelFace */
export const Hilt3D: React.FC<{c: Cam; sp: SwordPose; id: string; ringGlow?: number; hi?: number}> = ({c, sp, id, ringGlow = 0, hi}) => {
	/* the silhouette of a surface of revolution: at each station a, the two points of radius r perpendicular to the view */
	const perp = (a: number) => { const q = W(sp, a, 0, 0), v = [q[0] - c.p[0], q[1] - c.p[1], q[2] - c.p[2]], n = Math.hypot(v[1], v[2]) || 1; return [-v[2] / n, v[1] / n]; };
	const rev = (prof: [number, number][]) => { const L: V3[] = [], R: V3[] = []; for (const [a, r] of prof) { const [oy, oz] = perp(a); L.push(W(sp, a, oy * r, oz * r)); R.push(W(sp, a, -oy * r, -oz * r)); } return poly(c, [...L, ...R.reverse()]); };
	const [oy, oz] = perp(45), p0 = proj(c, W(sp, 45, oy * R_HOOP, oz * R_HOOP)), p1 = proj(c, W(sp, 45, -oy * R_HOOP, -oz * R_HOOP));
	const ac = axialOf(c, sp), PF = W(sp, 0, 0, 0), fd = toCam(c, PF)[2];
	const facePt = (r: number, th: number): [number, number] => { const p = proj(c, W(sp, -0.2, r * Math.cos(th), r * Math.sin(th))); return [p[0], p[1]]; };
	/* a shading line across the silhouette at a (the edge of a hoop seen from the side) */
	const edgeAt = (a: number, r: number) => { const [py, pz] = perp(a), d = poly(c, [W(sp, a, py * r, pz * r), W(sp, a, -py * r, -pz * r)], false); return d ? <path d={d} stroke={BZ.line} strokeOpacity={0.35} strokeWidth={0.8} fill="none" /> : null; };
	/* the grip, with its end where it meets the pommel's flare drawn round (seen when the view runs along the axis) */
	const gEnd = ac > 8 ? poly(c, circleYZ(sp, A.grip0, R_GRIP + 0.4, 36)) : '';
	const grip = <g key="grip"><path d={rev([[A.grip0 - 0.5, R_GRIP], [A.grip1, R_GRIP]])} fill={`url(#hg${id})`} />{gEnd && <path d={gEnd} fill={`url(#hg${id})`} />}</g>;
	/* a hoop: its silhouette, then the end cap that faces the camera (seen when the view runs along the axis) */
	const hoop = (a: number) => { const capA = ac < a ? a - HOOP_HL : a + HOOP_HL, cap = poly(c, circleYZ(sp, capA, R_HOOP, 36)), capIn = poly(c, circleYZ(sp, capA, R_GRIP, 36));
		return <g key={`h${a}`}><path d={rev([[a - HOOP_HL, R_HOOP], [a + HOOP_HL, R_HOOP]])} fill={`url(#hg${id})`} />{edgeAt(a - HOOP_HL, R_HOOP)}{edgeAt(a + HOOP_HL, R_HOOP)}
			{Math.abs(ac - a) > 40 && cap && <><path d={cap + capIn} fillRule="evenodd" fill={BZ.mid} /><path d={cap} fill="none" stroke={BZ.line} strokeOpacity={0.45} strokeWidth={0.8} /><path d={capIn} fill="none" stroke={BZ.deep} strokeOpacity={0.6} strokeWidth={0.8} /></>}</g>; };
	const hoops = HOOPS.slice().sort((x, y) => Math.abs(ac - y) - Math.abs(ac - x)).map(hoop);
	const pommel = <path key="pom" d={rev(POM_PROF)} fill={`url(#hg${id})`} stroke={BZ.line} strokeOpacity={0.5} strokeWidth={1} />;
	/* seen from the blade side, the disc's rolled rim shows as a lit ring round the flare */
	/* seen from the blade side, the disc's back: the rolled rim, then the flare narrowing into the grip (solid surfaces) */
	const rimBack = ac > 8 ? (() => { const d = poly(c, circleYZ(sp, 1.6, R_POM, 56)), d2 = poly(c, circleYZ(sp, 2.4, POM_PROF[2][1], 56)), d3 = poly(c, circleYZ(sp, 4.6, POM_PROF[4][1], 48)); if (!d) return null;
		return <g key="rim"><path d={d} fill={BZ.dark} stroke={BZ.line} strokeOpacity={0.5} strokeWidth={1} /><path d={d2} fill={`url(#hg${id})`} /><path d={d3} fill={BZ.mid} opacity={0.55} /></g>; })() : null;
	const face = ac < -0.5 && fd > 1 ? <PommelFace key="face" id={id} pt={facePt} ppm={c.f / fd} hi={hi ?? 0.4 + ringGlow} /> : null;
	const parts = ac < 0 ? [grip, ...hoops, pommel, face] : [pommel, rimBack, grip, ...hoops];
	return <g>
		<defs><linearGradient id={`hg${id}`} gradientUnits="userSpaceOnUse" x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]}><stop offset="0" stopColor={BZ.deep} /><stop offset="0.3" stopColor={BZ.lit} /><stop offset="0.5" stopColor={BZ.mid} /><stop offset="1" stopColor={BZ.deep} /></linearGradient></defs>
		{parts}
	</g>; };

/** the whole sword: blade, guard and hilt painted in the order the camera's place along the axis gives */
export const Sword3D: React.FC<{c: Cam; sp: SwordPose; id: string; sheen?: number; fog?: (d: number) => number; fogCol?: string; ringGlow?: number; hi?: number; land?: Partial<LandOpts>; lite?: number}> = ({c, sp, id, sheen, ringGlow, hi, land, lite}) => {
	const ac = axialOf(c, sp);
	const blade = <Blade3D key="b" c={c} sp={sp} id={id} sheen={sheen} land={land} />, guard = <Guard3D key="g" c={c} sp={sp} id={id} lite={lite} />, hilt = <Hilt3D key="h" c={c} sp={sp} id={id} ringGlow={ringGlow} hi={hi} />;
	return <g>{ac > A.guard1 ? [hilt, guard, blade] : ac < A.guard0 ? [blade, guard, hilt] : [hilt, blade, guard]}</g>; };
export {A_BLADE, LEN, R_POM, bladeHW, LB, lerp, pathOf};
