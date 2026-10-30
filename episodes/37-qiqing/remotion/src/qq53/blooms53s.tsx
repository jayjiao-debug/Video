import React from 'react';
import {rnd, lerp, cl} from '../qq50/kit50';
import {MacroCam, MacroSpec, macroProj, macroZ} from './macro53';
import {LAT, MACRO_S0} from './swordspec53s';
import {frameOf} from './master53';
/* ep53 · the three rust blooms ON the blade (T1, 75.162 → 81.954; KF11). Each bloom is anchored to a fixed spot of the lattice
   (a cell (p, q) of swordspec53s and an offset inside it) and every point of it — the dull patch, the stain, the olive crust,
   its specks and its find-ring — lies on the blade's face (macro53.macroZ) and goes through the same camera as the lattice
   (macroProj, inside BladeMacro's rotated group) every frame, fogged by the same fog as the cells round it. Soft edges are made
   in world units (stacked blobs), the ring's dashes and line width are world lengths, so nothing is a screen-space overlay:
   the blooms move, foreshorten and shrink exactly with the surface. */
export const BLOOM_T = [75.162, 75.728, 76.860];
/** anchors: lattice cell (p, q), offset inside it (fractions of the half-pitch), crust radius (mm) */
export const BLOOM_CELLS: {p: number; q: number; du: number; dw: number; r: number}[] = [
	{p: 10, q: 2, du: 0.1, dw: 0.15, r: 1.7}, {p: 14, q: -2, du: -0.25, dw: -0.1, r: 1.45}, {p: 16, q: 0, du: 0.07, dw: 0.24, r: 1.6}];   // v3.1: on the design-C cells, s 68–106 (u 19–56 past MACRO_S0), clear of the characters' columns
/** bloom i in macro coordinates (u = s − s0) */
export const bloomUV = (i: number, s0 = MACRO_S0): [number, number, number] => { const b = BLOOM_CELLS[i]; return [(b.p + 1) / 2 * LAT.A + b.du * LAT.A / 2 - s0, b.q / 2 * LAT.W + b.dw * LAT.W / 2, b.r]; };
/** the find-ring's radius on the surface (mm) */
export const RING_K = 2.9;
const hx = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mixC = (a: string, b: string, t: number) => { const A = hx(a), B = hx(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], cl(t))).toString(16).padStart(2, '0')).join(''); };
type Surf = {m: MacroCam; z: (u: number, v: number) => number};
const P = (s: Surf, u: number, v: number, dz = 0) => macroProj(s.m, u, v, s.z(u, v) + 0.02 + dz);
/** a soft blob lying on the surface, projected */
const blobS = (s: Surf, u: number, v: number, r: number, seed: number, rough = 0.5, n = 12, dz = 0) => {
	const pts = Array.from({length: n}, (_, i) => { const a = (i / n) * 2 * Math.PI, rr = r * (1 - rough / 2 + rough * rnd(seed * 31 + i, 5)); return P(s, u + rr * Math.cos(a), v + rr * Math.sin(a) * 0.85, dz); });
	if (pts.some((p) => p[2] <= 1)) return '';
	let d = ''; for (let i = 0; i < n; i++) { const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], m0 = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], m1 = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
		d += (i === 0 ? `M${m0[0].toFixed(1)},${m0[1].toFixed(1)}` : '') + `Q${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${m1[0].toFixed(1)},${m1[1].toFixed(1)}`; }
	return d + 'Z'; };
/** an arc of a circle lying on the surface, projected */
const arcS = (s: Surf, u: number, v: number, r: number, a0: number, a1: number, n = 8) => 'M' + Array.from({length: n + 1}, (_, i) => { const a = lerp(a0, a1, i / n), p = P(s, u + r * Math.cos(a), v + r * Math.sin(a), 0.03); return `${p[0].toFixed(1)},${p[1].toFixed(1)}`; }).join('L');
/** the find-ring: 18 dashes (each 72 % of its slot) on the surface; px width from a world width at the ring's depth */
const Ring: React.FC<{s: Surf; u: number; v: number; r: number; o: number; px: number}> = ({s, u, v, r, o, px}) => <g opacity={o}>
	{Array.from({length: 18}, (_, k) => { const a0 = (k / 18) * 2 * Math.PI, a1 = a0 + 0.72 * 2 * Math.PI / 18, d = arcS(s, u, v, r, a0, a1);
		return <g key={k}><path d={d} fill="none" stroke="#120804" strokeOpacity={0.4} strokeWidth={px * 2} strokeLinecap="round" /><path d={d} fill="none" stroke="#FFF2D8" strokeOpacity={0.92} strokeWidth={px} strokeLinecap="round" /></g>; })}</g>;
/** bloom i is there from the frame of BLOOM_T[i] (t = the film time; at = the frame test time) */
export const BloomsS: React.FC<{m: MacroCam; sp: MacroSpec; t: number; ringK?: number}> = ({m, sp, t, ringK = 1}) => { const f = frameOf(t), s: Surf = {m, z: macroZ(sp)};
	const FOGD = sp.fogD ?? 200, FOG = sp.fog ?? '#1E100B', fogOf = (u: number) => 1 - Math.exp(-Math.max(0, u - 30) / FOGD);
	return <g>{BLOOM_CELLS.map((_, i) => { if (f < frameOf(BLOOM_T[i])) return null;
		const [u, v, r0] = bloomUV(i, sp.s0 ?? 0), age = t - BLOOM_T[i], fog = fogOf(u), fc = (c: string) => mixC(c, FOG, fog * 0.94);
		const pulse = age >= 0 && age < 1.2 ? 1 + 0.12 * Math.sin(Math.PI * age / 1.2) : 1, r = r0 * pulse, h = 0.3 * r;
		const dc = P(s, u, v)[2]; if (dc <= 2) return null;
		const ppm = m.f / dc, rr = r0 * RING_K, ping = age < 0.6 && age > 0.01 ? age / 0.6 : -1;
		return <g key={i} opacity={1 - 0.5 * fog}>
			{/* the dull patch round it: the bronze has lost a little of its shine (soft edge = stacked blobs, world units) */}
			{[3.2, 2.7, 2.2, 1.8].map((k, j) => <path key={`d${j}`} d={blobS(s, u, v, r0 * k, 40 + i * 7 + j, 0.4)} fill={fc('#5A5242')} opacity={0.07} />)}
			{/* the stain round its foot: a weak rust-brown (the knife's colour, much weaker) */}
			{[1.75, 1.45].map((k, j) => <path key={`s${j}`} d={blobS(s, u, v, r * k, 10 + i, 0.6)} fill={fc('#7A5434')} opacity={0.18} />)}
			{/* the crust: an olive-green foot with a rust rim, a lighter raised cap, a highlight */}
			<path d={blobS(s, u, v, r * 1.1, 20 + i, 0.5)} fill={fc('#7A5434')} />
			<path d={blobS(s, u, v, r, 20 + i, 0.55)} fill={fc('#4E5E38')} />
			<path d={blobS(s, u + r * 0.1, v - r * 0.05, r * 0.72, 30 + i, 0.5, 12, h)} fill={fc('#6E7E46')} />
			<path d={blobS(s, u + r * 0.2, v - r * 0.15, r * 0.3, 50 + i, 0.4, 9, h * 1.1)} fill={fc('#9AA668')} opacity={0.85} />
			{Array.from({length: 8}, (_, k) => { const a = rnd(i * 9 + k, 3) * 6.28, dd = r0 * (1.45 + 0.9 * rnd(i * 9 + k, 4));
				return <path key={`k${k}`} d={blobS(s, u + dd * Math.cos(a), v + dd * Math.sin(a), r0 * (0.09 + 0.08 * rnd(i * 9 + k, 5)), 70 + i * 9 + k, 0.4, 7)} fill={fc('#55663E')} opacity={0.8} />; })}
			<Ring s={s} u={u} v={v} r={rr} o={(1 - fog) * ringK} px={Math.max(1.1, Math.min(4.2, ppm * 0.3))} />
			{ping > 0 && <path d={arcS(s, u, v, rr * (1 + 0.5 * ping), 0, 2 * Math.PI, 48)} fill="none" stroke="#FFF2D8" strokeOpacity={0.5 * (1 - ping) * (1 - fog)} strokeWidth={Math.max(1, ppm * 0.22)} />}
		</g>; })}</g>; };
