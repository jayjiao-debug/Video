import React from 'react';
import {cl, lerp, rnd} from '../qq50/kit50';
import {Cam, V3, proj, poly, camBasis, mix, bladeOutline, latticeCells} from './parts53';
import {BZ, LAT, PALE, GLS, TQS, bladeHW, LB} from './props53';
/* ep53 · the sword as a 3-D model drawn in SVG through the look-at camera (parts53). Units: mm.
   Local axis a from the pommel end (a = 0) to the tip (a = 556), lying level, front face (blue glass) up.
   World placement: pommel end at (x0, ya, z0), axis along dir·x. Parts (B1–B6): pommel disc ⌀37 mm with 11 rings on its end
   face, grip ⌀17 mm with two raised bands, guard 56 mm wide with blue glass up (turquoise on the underside), blade 459 mm,
   base half-width 24 mm, diamond lattice (pale = tin-rich), polished edge strips, a raised ridge. */
export type SwordPose = {x0: number; ya: number; z0: number; dir: 1 | -1};
const A_GRIP0 = 8, A_GRIP1 = 82, A_GUARD1 = 102, A_BLADE = 97, R_POM = 18.6, R_GRIP = 8.6;
const LEN = 556;
const W = (sp: SwordPose, a: number, y: number, z: number): V3 => [sp.x0 + sp.dir * a, sp.ya + y, sp.z0 + z];
const circleYZ = (sp: SwordPose, a: number, r: number, n = 40): V3[] => Array.from({length: n}, (_, i) => { const t = (i / n) * 2 * Math.PI; return W(sp, a, r * Math.cos(t), r * Math.sin(t)); });
const pathOf = (pts: [number, number, number][]) => 'M' + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L') + 'Z';

/** the blade: outline, lattice, edge strips, ridge, a moving sheen band (sheen = position 0..1 along the blade, −1 = none) */
export const Blade3D: React.FC<{c: Cam; sp: SwordPose; id: string; lit?: number; sheen?: number; sheenCol?: string; fog?: (d: number) => number; fogCol?: string; rust?: number}> = ({c, sp, id, lit = 1, sheen = -1, sheenCol = '#F2F6F8', fog, fogCol = '#120906', rust = 0}) => {
	const zf = sp.z0 + 2.2, xb = sp.x0 + sp.dir * A_BLADE;
	const outer = poly(c, bladeOutline(xb, sp.dir, sp.ya, zf)), inner = poly(c, bladeOutline(xb, sp.dir, sp.ya, zf, 3.4));
	const cells = latticeCells(xb, sp.dir, sp.ya, zf);
	const fogAt = (q: V3) => (fog ? fog(proj(c, q)[2]) : 0);
	const inscr = (s: number) => s > 12 && s < 76;
	const {F} = camBasis(c);
	/* light: a key from above-front; the lattice is darker on the far flank */
	const body = mix(BZ.body, '#FFF0C8', 0.22 * lit);
	return <g>
		<defs><clipPath id={`bc${id}`}><path d={inner} /></clipPath>
			<linearGradient id={`bs${id}`} gradientUnits="userSpaceOnUse" x1={proj(c, W(sp, A_BLADE, 0, 0))[0]} y1={proj(c, W(sp, A_BLADE, 0, 0))[1]} x2={proj(c, W(sp, LEN, 0, 0))[0]} y2={proj(c, W(sp, LEN, 0, 0))[1]}>
				<stop offset="0" stopColor={sheenCol} stopOpacity="0" /><stop offset={cl(sheen - 0.08)} stopColor={sheenCol} stopOpacity="0" /><stop offset={cl(sheen)} stopColor={sheenCol} stopOpacity="0.62" /><stop offset={cl(sheen + 0.08)} stopColor={sheenCol} stopOpacity="0" /><stop offset="1" stopColor={sheenCol} stopOpacity="0" /></linearGradient></defs>
		<path d={outer} fill={BZ.hi} opacity={0.9} />
		<path d={inner} fill={body} />
		<g clipPath={`url(#bc${id})`}>
			{cells.map((cc, i) => { const fo = fogAt(cc.q[0]), ink = mix(LAT, fogCol, fo * 0.85), ins = inscr(cc.s);
				return <g key={i}>
					{cc.pale && <path d={poly(c, cc.inner)} fill={mix(PALE, fogCol, fo * 0.8)} opacity={ins ? 0.14 : 0.5} />}
					{!cc.pale && <path d={poly(c, cc.inner)} fill={mix('#C8913E', fogCol, fo * 0.8)} opacity={ins ? 0.1 : 0.4} />}
					<path d={poly(c, cc.q)} fill="none" stroke={ink} strokeWidth={Math.max(0.6, c.f * 1.3 / Math.max(1, proj(c, cc.q[0])[2]))} strokeOpacity={ins ? 0.3 : 0.8} strokeLinejoin="round" />
					{!cc.pale && !ins && <path d={poly(c, cc.core)} fill={ink} opacity={0.72} />}
				</g>; })}
			{/* the far flank is a touch darker (the ridge splits the light) */}
			<path d={poly(c, [W(sp, A_BLADE, 0, 2.3), W(sp, LEN, 0, 2.3), W(sp, LEN, -30 * sp.dir * (F[1] >= 0 ? 1 : -1), 2.3), W(sp, A_BLADE, -30 * sp.dir * (F[1] >= 0 ? 1 : -1), 2.3)])} fill="#140902" opacity={0.16} />
			{sheen >= 0 && <path d={inner} fill={`url(#bs${id})`} />}
			{rust > 0 && Array.from({length: 7}, (_, i) => { const s = 120 + 300 * rnd(i, 41), w = (rnd(i, 42) - 0.5) * 30, p = proj(c, W(sp, A_BLADE + s, w, 2.3)); return p[2] > 1 ? <circle key={i} cx={p[0]} cy={p[1]} r={Math.max(0.8, c.f * 1.2 / p[2])} fill="#4E7A62" opacity={0.5 * rust} /> : null; })}
		</g>
		{/* the ridge: a lit hairline */}
		<path d={poly(c, [W(sp, A_BLADE + 4, -0.6, 2.4), W(sp, LEN - 12, -0.3, 2.4)], false)} stroke={BZ.hi} strokeWidth={Math.max(1, c.f * 0.9 / Math.max(1, proj(c, W(sp, 250, 0, 0))[2]))} strokeOpacity={0.85} fill="none" />
		<path d={outer} fill="none" stroke={BZ.line} strokeOpacity={0.55} strokeWidth={1} />
	</g>; };

/** guard: box a 82–102, half-width 27.8, thickness ±8; front face (z+) carries the blue glass, the underside turquoise */
export const Guard3D: React.FC<{c: Cam; sp: SwordPose; id: string}> = ({c, sp, id}) => {
	const a0 = A_GRIP1, a1 = A_GUARD1, hw = 27.8, t = 6;
	const top = [W(sp, a0, -hw + 3, t), W(sp, a0, hw - 3, t), W(sp, a1, hw, t * 0.6), W(sp, a1, -hw, t * 0.6)];
	const endNear = [W(sp, a0, -hw + 3, t), W(sp, a0, hw - 3, t), W(sp, a0, hw - 3, -t), W(sp, a0, -hw + 3, -t)];
	const side = (s: 1 | -1) => [W(sp, a0, s * (hw - 3), t), W(sp, a1, s * hw, t * 0.6), W(sp, a1, s * hw, -t * 0.6), W(sp, a0, s * (hw - 3), -t)];
	const glass = (s: 1 | -1) => [W(sp, a0 + 2.5, s * 2.6, t + 0.2), W(sp, a0 + 2.5, s * (hw - 5), t + 0.2), W(sp, a1 - 3, s * (hw - 3), t * 0.6 + 0.2), W(sp, a1 - 3, s * 2.6, t * 0.6 + 0.2)];
	const cloison = (s: 1 | -1) => [[W(sp, a0 + 2.5, s * 10, t + 0.3), W(sp, a0 + 9, s * 10, t + 0.3), W(sp, a0 + 9, s * 17, t + 0.3)], [W(sp, a0 + 9, s * 10, t + 0.3), W(sp, a1 - 4, s * 5, t * 0.6 + 0.3)], [W(sp, a0 + 6, s * 17, t + 0.3), W(sp, a1 - 3, s * 21, t * 0.6 + 0.3)]];
	const camFromPommel = (c.p[0] - sp.x0) * sp.dir < A_GRIP1;
	return <g>
		<defs><linearGradient id={`gg${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={GLS.lit} /><stop offset="0.55" stopColor={GLS.body} /><stop offset="1" stopColor={GLS.deep} /></linearGradient></defs>
		{[1, -1].map((s) => <path key={s} d={poly(c, side(s as 1 | -1))} fill={BZ.dark} stroke={BZ.line} strokeOpacity={0.5} strokeWidth={1} />)}
		{camFromPommel && <path d={poly(c, endNear)} fill={BZ.dark} stroke={BZ.line} strokeOpacity={0.5} strokeWidth={1} />}
		{/* underside turquoise shows as a thin line along the lower edge when seen from the side */}
		{c.p[2] < sp.z0 - t && <path d={poly(c, [W(sp, a0, -hw + 3, -t), W(sp, a1, -hw, -t * 0.6), W(sp, a1, hw, -t * 0.6), W(sp, a0, hw - 3, -t)])} fill={TQS.body} opacity={0.8} />}
		<path d={poly(c, top)} fill={BZ.mid} stroke={BZ.line} strokeOpacity={0.6} strokeWidth={1} />
		{[1, -1].map((s) => <g key={`g${s}`}><path d={poly(c, glass(s as 1 | -1))} fill={`url(#gg${id})`} />
			{cloison(s as 1 | -1).map((ln, k) => <path key={k} d={poly(c, ln, false)} stroke={BZ.lit} strokeWidth={1.6} fill="none" strokeOpacity={0.9} />)}</g>)}
		<path d={poly(c, [W(sp, a0 + 3, -12, t + 0.4), W(sp, a0 + 6, -16, t + 0.4)], false)} stroke={GLS.hi} strokeWidth={2.4} fill="none" strokeLinecap="round" />
		<path d={poly(c, [W(sp, a0, -hw + 3, t), W(sp, a0, hw - 3, t)], false)} stroke={BZ.hi} strokeWidth={1.6} fill="none" opacity={0.8} />
	</g>; };

/** grip (cylinder with two raised bands) and the pommel disc with 11 rings on its end face */
export const Hilt3D: React.FC<{c: Cam; sp: SwordPose; id: string; ringGlow?: number}> = ({c, sp, id, ringGlow = 0}) => {
	const mid = W(sp, (A_GRIP0 + A_GRIP1) / 2, 0, 0), v = [mid[0] - c.p[0], mid[1] - c.p[1], mid[2] - c.p[2]], n = Math.hypot(v[1], v[2]) || 1, oy = -v[2] / n, oz = v[1] / n;
	const silh = (a0: number, a1: number, r: number) => [W(sp, a0, oy * r, oz * r), W(sp, a1, oy * r, oz * r), W(sp, a1, -oy * r, -oz * r), W(sp, a0, -oy * r, -oz * r)];
	const p0 = proj(c, W(sp, 40, oy * R_GRIP, oz * R_GRIP)), p1 = proj(c, W(sp, 40, -oy * R_GRIP, -oz * R_GRIP));
	const faceVisible = (c.p[0] - sp.x0) * sp.dir < 0;
	const face = circleYZ(sp, 0, R_POM, 56);
	const rings = Array.from({length: 11}, (_, i) => circleYZ(sp, -0.2, R_POM * (0.16 + 0.8 * (i + 0.5) / 11), 48));
	const pF = proj(c, W(sp, 0, 0, 0));
	return <g>
		<defs><linearGradient id={`hg${id}`} gradientUnits="userSpaceOnUse" x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]}><stop offset="0" stopColor={BZ.deep} /><stop offset="0.3" stopColor={BZ.lit} /><stop offset="0.5" stopColor={BZ.mid} /><stop offset="1" stopColor={BZ.deep} /></linearGradient>
			<radialGradient id={`pg${id}`} gradientUnits="userSpaceOnUse" cx={pF[0]} cy={pF[1]} r={Math.max(4, c.f * R_POM / Math.max(1, pF[2]))}><stop offset="0" stopColor={BZ.lit} /><stop offset="0.6" stopColor={BZ.body} /><stop offset="1" stopColor={BZ.dark} /></radialGradient></defs>
		<path d={poly(c, silh(A_GRIP0, A_GRIP1, R_GRIP))} fill={`url(#hg${id})`} />
		{[33, 60].map((a) => <path key={a} d={poly(c, silh(a - 2.6, a + 2.6, R_GRIP * 1.22))} fill={`url(#hg${id})`} stroke={BZ.line} strokeOpacity={0.5} strokeWidth={1} />)}
		{/* the pommel's flared side (frustum) then its end face */}
		<path d={poly(c, [W(sp, A_GRIP0, oy * 9, oz * 9), W(sp, 3.5, oy * R_POM * 0.82, oz * R_POM * 0.82), W(sp, 3.5, -oy * R_POM * 0.82, -oz * R_POM * 0.82), W(sp, A_GRIP0, -oy * 9, -oz * 9)])} fill={`url(#hg${id})`} />
		<path d={poly(c, [W(sp, 3.5, oy * R_POM * 0.82, oz * R_POM * 0.82), W(sp, 2.6, oy * R_POM, oz * R_POM), W(sp, 0, oy * R_POM, oz * R_POM), W(sp, 0, -oy * R_POM, -oz * R_POM), W(sp, 2.6, -oy * R_POM, -oz * R_POM), W(sp, 3.5, -oy * R_POM * 0.82, -oz * R_POM * 0.82)])} fill={BZ.mid} stroke={BZ.line} strokeOpacity={0.5} strokeWidth={1} />
		{faceVisible && <g>
			<path d={poly(c, face)} fill={`url(#pg${id})`} stroke={BZ.line} strokeWidth={1.2} />
			{rings.map((r, i) => <g key={i}><path d={poly(c, r)} fill="none" stroke={BZ.deep} strokeWidth={Math.max(0.8, c.f * 0.32 / Math.max(1, pF[2]))} strokeOpacity={0.9} />
				<path d={poly(c, r.slice(30, 44), false)} fill="none" stroke={mix(BZ.hi, '#FFFFFF', ringGlow)} strokeWidth={Math.max(0.6, c.f * 0.2 / Math.max(1, pF[2]))} strokeOpacity={0.6 + 0.4 * ringGlow} /></g>)}
			<path d={poly(c, circleYZ(sp, -0.3, R_POM * 0.1, 24))} fill={BZ.mid} stroke={BZ.deep} strokeWidth={1} />
		</g>}
	</g>; };

/** the whole sword, parts sorted far → near */
export const Sword3D: React.FC<{c: Cam; sp: SwordPose; id: string; sheen?: number; fog?: (d: number) => number; fogCol?: string; ringGlow?: number}> = ({c, sp, id, sheen, fog, fogCol, ringGlow}) => {
	const dBlade = proj(c, W(sp, 300, 0, 0))[2], dHilt = proj(c, W(sp, 40, 0, 0))[2];
	const blade = <Blade3D key="b" c={c} sp={sp} id={id} sheen={sheen} fog={fog} fogCol={fogCol} />, guard = <Guard3D key="g" c={c} sp={sp} id={id} />, hilt = <Hilt3D key="h" c={c} sp={sp} id={id} ringGlow={ringGlow} />;
	return <g>{dBlade > dHilt ? [blade, guard, hilt] : [hilt, guard, blade]}</g>; };
export {A_BLADE, LEN, R_POM, bladeHW, LB, lerp, pathOf};
