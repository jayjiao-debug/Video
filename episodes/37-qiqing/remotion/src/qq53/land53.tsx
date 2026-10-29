import React from 'react';
import {rnd, cl} from '../qq50/kit50';
import {Cam, V3, toCam, poly, proj, mix} from './parts53';
import {bladeHW, LB} from './props53';
import {SwordPose} from './sword3d';
/* ep53 · BladeLand: the approved MACRO look (macro53 / KF02) rebuilt in world units so ONE renderer serves every distance
   of the one take: the camera skimming 2 cm above the lattice (KF02), the whole sword in its case (KF03) and the axis push
   (KF04). Units mm; the blade lies on the sword pose (sword3d): base at a = 97 from the pommel, s = distance from the base
   toward the tip, w = across (+y). The face is a shallow roof: the raised ridge on the axis, polished edge strips at the sides.
   Lighting is physical (Blinn–Phong on the face normal, per cell), so highlights slide when the camera moves. */
export const A_BL = 97, LBM = LB * 10, LA = 15, LW = 6.2, RIDGE = 3.4, E0 = 0.6, STRIP = 2.4;
export const hwAt = (s: number) => (s < 0 ? bladeHW(0) * 10 : bladeHW(s / 10) * 10);
/** height of the face above the sword's axis plane at (s, w) */
export const hAt = (s: number, w: number) => { const hw = Math.max(0.01, hwAt(s)), a = Math.min(1, Math.abs(w) / hw);
	const bev = Math.abs(w) > hw - STRIP ? 0.8 * (Math.abs(w) - (hw - STRIP)) / STRIP : 0;
	return E0 + RIDGE * Math.pow(1 - a, 1.12) - bev; };
export const bw = (sp: SwordPose, s: number, w: number, h = hAt(s, w)): V3 => [sp.x0 + sp.dir * (A_BL + s), sp.ya + w, sp.z0 + h];
const nrm = (v: V3): V3 => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export type Light = {dir: V3; k: number};
export type LandOpts = {
	lights: Light[];
	shin?: number;
	fog?: {d0: number; D: number; col: string};
	/** depth of field: depths (camera z, mm) below `near` go to the blurred near group, above `far` to the far group */
	dof?: {near: number; far: number; nb: string; fb: number};
	sheen?: {pos: number; k: number};   // a silvery wash at pos (0 base … 1 tip)
	exposure?: number;                  // 0..1, the whole blade's brightness (1 = as lit)
	lift?: number;                      // 0..1, a warm lift toward bright gold (far views read as THE bright sword)
	sMin?: number;                      // draw only s ≥ sMin (cells behind the camera in the glide)
};
type CellD = {d: string; dIn: string; core: string; col: string; line: string; lw: number; rim: number; pale: boolean; z: number; px: number};
const corner = (p: number, q: number): [number, number] => [(p + q) / 2 * LA + (rnd(p * 131 + q, 5) - 0.5) * LA * 0.09, (p - q) / 2 * LW + (rnd(p * 131 + q, 6) - 0.5) * LW * 0.12];
export const BladeLand: React.FC<{c: Cam; sp: SwordPose; id: string; o: LandOpts}> = ({c, sp, id, o}) => {
	const lights = o.lights.map((l) => ({dir: nrm(l.dir), k: l.k})), shin = o.shin ?? 70, ex = o.exposure ?? 1;
	const fogOf = (z: number) => (o.fog ? 1 - Math.exp(-Math.max(0, z - o.fog.d0) / o.fog.D) : 0), FOG = o.fog?.col ?? '#1E100B';
	const sMin = o.sMin ?? -20;
	const shade = (s: number, w: number, P: V3) => { const hw = Math.max(0.01, hwAt(s)), a = Math.min(0.999, Math.abs(w) / hw);
		const dh = -RIDGE * 1.12 * Math.pow(1 - a, 0.12) / hw * Math.sign(w || 1e-6), n = nrm([0, -dh, 1]);
		const V = nrm([c.p[0] - P[0], c.p[1] - P[1], c.p[2] - P[2]]);
		let sp = 0, df = 0; for (const L of lights) { const Hh = nrm([V[0] + L.dir[0], V[1] + L.dir[1], V[2] + L.dir[2]]); sp += L.k * Math.pow(Math.max(0, dot(n, Hh)), shin); df += L.k * Math.max(0, dot(n, L.dir)); }
		return {sp: Math.min(1.2, sp), df: Math.min(1, df)}; };
	/* ---- cells ---- */
	const cells: CellD[] = [];
	const sub = (z: number, px: number) => (px > 60 ? 6 : px > 18 ? 3 : 1);
	for (let p = -3; p <= Math.ceil(2 * (LBM + LA) / LA); p++) for (let q = -10; q <= 10; q++) { if ((p + q) % 2 !== 0) continue;
		const i = (p + q) / 2, j = (p - q) / 2, ca = (p + 1) / 2 * LA, cw = q / 2 * LW, hw = hwAt(ca);
		if (ca < sMin - LA || ca > LBM + LA / 2 || hw - STRIP < 1 || Math.abs(cw) > hw - STRIP + LW / 2) continue;
		const Pc = bw(sp, ca, cw), kc = toCam(c, Pc); if (kc[2] < 2) continue;
		const pxSize = c.f * LA / kc[2]; if (pxSize < 0.6) continue;
		const sx = c.cx + c.f * kc[0] / kc[2], sy = c.cy - c.f * kc[1] / kc[2]; if (sx < -pxSize * 2 - 200 || sx > 2120 + pxSize * 2 || sy < -pxSize * 2 - 200 || sy > 1280 + pxSize * 2) continue;
		const n = sub(kc[2], pxSize);
		const quad = (sc: number) => { const cs = ([[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]] as [number, number][]).map(([a, b]) => { const [u, v] = corner(a, b); return [ca + (u - ca) * sc, cw + (v - cw) * sc] as [number, number]; });
			const pts: V3[] = [];
			for (let e = 0; e < 4; e++) { const [a0, b0] = cs[e], [a1, b1] = cs[(e + 1) % 4];
				for (let k = 0; k < n; k++) { const tt = k / n, uu = a0 + (a1 - a0) * tt, lim = Math.max(0, hwAt(Math.max(uu, 0)) - STRIP), vv = Math.max(-lim, Math.min(lim, b0 + (b1 - b0) * tt)); pts.push(bw(sp, Math.max(uu, 0), vv)); } }
			return poly(c, pts); };
		const d = quad(1); if (!d) continue;
		const pale = ((i + j) % 2 + 2) % 2 === 0, {sp: spec, df} = shade(ca, cw, Pc), fog = fogOf(kc[2]);
		const jit = (rnd(i * 31 + j, 71) - 0.5) * 0.12;
		const base = mix(pale ? '#D2B886' : '#B98443', pale ? '#8A6A3E' : '#6E4824', 0.2 + jit);
		let col = mix(base, '#3A2410', cl(0.36 - 0.5 * df));
		if (o.lift) col = mix(col, pale ? '#FFF0CC' : '#E2AE5C', o.lift);
		col = mix(col, '#FFF8E4', cl(spec * (pale ? 0.86 : 0.3)));
		if (o.sheen && o.sheen.k > 0) col = mix(col, '#F2F6F8', o.sheen.k * Math.exp(-Math.pow((ca / LBM - o.sheen.pos) / 0.07, 2)) * (pale ? 0.85 : 0.6));
		col = mix(col, '#120804', 1 - ex);
		col = mix(col, FOG, fog * 0.94);
		cells.push({d, dIn: pxSize > 7 ? quad(0.84) : '', core: !pale && pxSize > 3 ? quad(0.3) : '', col, line: mix(mix('#22140A', FOG, fog * 0.8), '#120804', 0), lw: Math.max(0.35, c.f * 0.36 / kc[2]), rim: cl(spec) * (1 - fog), pale, z: kc[2], px: pxSize}); }
	cells.sort((a, b) => b.z - a.z);
	const CellG = (k: CellD, i: number) => <g key={i}>
		<path d={k.d} fill={k.col} stroke={k.line} strokeWidth={k.lw} strokeLinejoin="round" />
		{k.dIn && <path d={k.dIn} fill="none" stroke={k.line} strokeWidth={k.lw * 0.38} strokeOpacity={0.8} />}
		{k.core && <path d={k.core} fill={k.line} opacity={0.72} />}
		{k.pale && k.dIn && k.rim > 0.05 && <path d={k.dIn} fill="none" stroke="#FFFBEE" strokeWidth={k.lw * (0.3 + 0.4 * k.rim)} strokeOpacity={cl(0.15 + 0.85 * k.rim)} />}
	</g>;
	const nearG = o.dof ? cells.filter((k) => k.z < o.dof!.near) : [], farG = o.dof ? cells.filter((k) => k.z > o.dof!.far) : [], midG = o.dof ? cells.filter((k) => k.z >= o.dof!.near && k.z <= o.dof!.far) : cells;
	/* ---- edge strips, ridge, outline ---- */
	const NS = 72, ss = Array.from({length: NS + 1}, (_, k) => Math.max(sMin, -2) + (LBM - Math.max(sMin, -2)) * k / NS);
	const strips = [1, -1].flatMap((side) => ss.slice(0, -1).map((s0, k) => { const s1 = ss[k + 1], a0 = hwAt(s0), a1 = hwAt(s1), P = bw(sp, s0, side * (a0 - STRIP / 2));
		const d = poly(c, [bw(sp, s0, side * (a0 - STRIP)), bw(sp, s0, side * a0), bw(sp, s1, side * a1), bw(sp, s1, side * Math.max(0, a1 - STRIP))]); if (!d) return null;
		const z = toCam(c, P)[2]; if (z < 2) return null;
		const V = nrm([c.p[0] - P[0], c.p[1] - P[1], c.p[2] - P[2]]), n = nrm([0, side * 0.45, 1]);
		let spc = 0; for (const L of lights) { const Hh = nrm([V[0] + L.dir[0], V[1] + L.dir[1], V[2] + L.dir[2]]); spc += L.k * Math.pow(Math.max(0, dot(n, Hh)), shin * 0.7); }
		let col = mix(side > 0 ? '#E8C886' : '#B88A48', '#FFFBEA', cl(spc * 0.9));
		if (o.sheen && o.sheen.k > 0) col = mix(col, '#F6FAFC', o.sheen.k * Math.exp(-Math.pow((s0 / LBM - o.sheen.pos) / 0.07, 2)));
		col = mix(mix(col, '#120804', 1 - ex), FOG, fogOf(z) * 0.92);
		return <path key={`st${side}_${k}`} d={d} fill={col} stroke={col} strokeWidth={0.6} />; }));
	const ridgePts = ss.filter((s) => s < LBM - 8).map((s) => bw(sp, s, 0, hAt(s, 0) + 0.05));
	const rz = toCam(c, bw(sp, LBM * 0.5, 0))[2];
	const ridge = poly(c, ridgePts, false);
	const outline = poly(c, [...ss.map((s) => bw(sp, s, hwAt(s), E0 - 0.8)), ...ss.slice().reverse().map((s) => bw(sp, s, -hwAt(s), E0 - 0.8))]);
	return <g>
		<defs>{o.dof && <filter id={`ln${id}`} x="-10%" y="-20%" width="120%" height="140%"><feGaussianBlur stdDeviation={o.dof.nb} /></filter>}
			{o.dof && o.dof.fb > 0 && <filter id={`lf${id}`} x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation={o.dof.fb} /></filter>}</defs>
		{outline && <path d={outline} fill="#2A180A" opacity={0.85 * ex} />}
		{farG.length > 0 && <g filter={o.dof!.fb > 0 ? `url(#lf${id})` : undefined}>{farG.map(CellG)}</g>}
		{midG.map(CellG)}
		{nearG.length > 0 && <g filter={`url(#ln${id})`}>{nearG.map(CellG)}</g>}
		{strips}
		{ridge && <path d={ridge} fill="none" stroke="#FFF2D0" strokeOpacity={0.75 * ex} strokeWidth={Math.max(0.8, c.f * 0.32 / Math.max(5, rz))} />}
	</g>;
};
/** screen point of a blade location (for tags, glints) */
export const bladePt = (c: Cam, sp: SwordPose, s: number, w: number) => proj(c, bw(sp, s, w));
