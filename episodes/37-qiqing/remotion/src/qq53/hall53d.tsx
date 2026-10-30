import React from 'react';
import {W, H, rnd, lerp, cl, seg} from '../qq50/kit50';
import {Pool} from '../qq50/styleB';
import {Figure4, POSES, Look4} from '../qq44/figure44';
import {Cam, V3, proj, poly, mix} from './parts53';
import {WPool, Museum} from './take53';
import {sstep, DEG} from './cam53';
import {CASE_X} from './scene53d';
/* ep53 · TakeD, the museum of the end (95–109 s): the SAME hall as the start of the film (take53.tsx `Museum`): the walls with their wall
   labels and the vitrine, the rope on its posts, the visitors, the lit case. take53's `Museum` is used for the case itself (hall = 0);
   the hall around it is the same drawing (copied: take53 does not export the pieces), with a floor that can be drawn in front of the pit.
   The case stands on the section plane: world metres, the case is shifted by CASE_X (the museum frame is mm, centred on the case). */
const SHIFT = CASE_X * 1000;
const VIS: {a: number; r: number; look: Look4; h: number; tint: number}[] = [
	{a: 14, r: 4500, look: {dress: 'coat', head: 'short'}, h: 1.74, tint: 0}, {a: 38, r: 4800, look: {dress: 'jacket', head: 'bob', legs: 'trousers'}, h: 1.62, tint: 1},
	{a: 62, r: 4500, look: {dress: 'coat', head: 'cap'}, h: 1.78, tint: 2}, {a: 84, r: 4900, look: {dress: 'dress', head: 'long'}, h: 1.6, tint: 0},
	{a: 104, r: 4600, look: {dress: 'jacket', head: 'short', legs: 'trousers'}, h: 1.72, tint: 1}, {a: 128, r: 4800, look: {dress: 'coat', head: 'glasses'}, h: 1.7, tint: 2},
	{a: 96, r: 5200, look: {dress: 'shirt', head: 'child', legs: 'trousers'}, h: 1.12, tint: 0}];
const Visitor: React.FC<{c: Cam; v: typeof VIS[0]; o: number; lite: number}> = ({c, v, o, lite}) => { const a = v.a * DEG, fx = v.r * Math.cos(a), fy = v.r * Math.sin(a);
	const foot = proj(c, [fx, fy, 0]), head = proj(c, [fx, fy, v.h * 1000]); if (foot[2] < 300 || head[2] < 300) return null;
	const hpx = Math.hypot(head[0] - foot[0], head[1] - foot[1]); if (hpx < 8) return null;
	const cen = proj(c, [0, 0, 1000]), flip = cen[0] < foot[0];
	const col = mix(['#1C100A', '#1F120C', '#190E09'][v.tint], '#26180F', lite);   // opaque, a tone darker than the wall
	const k = Math.max(1, hpx / 450);
	return <g opacity={o} transform={`translate(${foot[0]},${foot[1]}) scale(${flip ? -1 : 1},1) translate(${-foot[0]},${-foot[1]})`}>
		<g transform={`translate(${-2.6 * k},${-2 * k})`} opacity={0.45 - 0.27 * lite}><Figure4 x={foot[0]} ground={foot[1]} h={hpx} pose={POSES.stand} look={v.look} col="#E8A860" /></g>
		<Figure4 x={foot[0]} ground={foot[1]} h={hpx} pose={POSES.stand} look={v.look} col={col} /></g>; };
const faceVis = (c: Cam, q: V3, n: V3) => (c.p[0] - q[0]) * n[0] + (c.p[1] - q[1]) * n[1] + (c.p[2] - q[2]) * n[2] > 0;
type WallDef = {q: (u0: number, u1: number, z0: number, z1: number) => V3[]; n: V3; panels: [number, number][]};
const WALLS: WallDef[] = [
	{q: (u0, u1, z0, z1) => [[6495, u0, z0], [6495, u1, z0], [6495, u1, z1], [6495, u0, z1]], n: [-1, 0, 0], panels: [[-3800, -1800], [1800, 3800]]},
	{q: (u0, u1, z0, z1) => [[-6495, u0, z0], [-6495, u1, z0], [-6495, u1, z1], [-6495, u0, z1]], n: [1, 0, 0], panels: [[-3800, -1800], [1800, 3800]]},
	{q: (u0, u1, z0, z1) => [[u0, 5495, z0], [u1, 5495, z0], [u1, 5495, z1], [u0, 5495, z1]], n: [0, -1, 0], panels: [[-5200, -3000], [-1000, 1000], [3000, 5200]]},
	{q: (u0, u1, z0, z1) => [[u0, -5495, z0], [u1, -5495, z0], [u1, -5495, z1], [u0, -5495, z1]], n: [0, 1, 0], panels: [[-5200, -3000], [-1000, 1000], [3000, 5200]]}];
const HallDetail: React.FC<{c: Cam; lite: number}> = ({c, lite}) => <g>
	{WALLS.map((w, wi) => { const wp = w.q(0, 0, 0, 0)[0]; if (!faceVis(c, wp, w.n)) return null;
		return <g key={wi}>
			{poly(c, w.q(-6400, 6400, 0, 260)) && <path d={poly(c, w.q(-6400, 6400, 0, 260))} fill="#5A3C28" opacity={0.5 * lite} />}
			{poly(c, w.q(-6400, 6400, 258, 266)) && <path d={poly(c, w.q(-6400, 6400, 258, 266))} fill="#E8B878" opacity={0.35 * lite} />}
			{w.panels.map(([u0, u1], pi) => <g key={pi}>
				<path d={poly(c, w.q(u0, u1, 950, 2450))} fill="#4A3122" opacity={0.7 * lite} />
				<path d={poly(c, w.q(u0 + 120, u1 - 120, 1070, 2330))} fill="#8A6444" opacity={0.3 * lite} />
				{[0, 1, 2, 3, 4, 5].map((k) => { const z = 2160 - k * 170, d = poly(c, [[...w.q(u0 + 280, u0 + 280, z, z)[0]] as V3, [...w.q(u1 - 280 - (k === 5 ? 500 : 0), u1 - 280, z, z)[1]] as V3], false); return d ? <path key={k} d={d} stroke="#F2D9AE" strokeOpacity={0.3 * lite} strokeWidth={Math.max(2, 70 * c.f / 8000 / 3)} fill="none" /> : null; })}
			</g>)}
			{wi >= 2 && poly(c, w.q(-700, 700, 520, 1500)) && <g><path d={poly(c, w.q(-780, 780, 480, 1560))} fill="#2A1A10" opacity={0.8 * lite} /><path d={poly(c, w.q(-700, 700, 520, 1500))} fill="#C8905A" opacity={0.3 * lite} /></g>}
		</g>; })}
</g>;

/** the hall's walls, washers, rope and visitors in the museum frame (no floor); `hall` 0..1 */
export const HallBack: React.FC<{cm: Cam; hall: number; lite: number}> = ({cm, hall, lite}) => { const cM: Cam = {...cm, p: [cm.p[0] - SHIFT, cm.p[1], cm.p[2]]}, c = cM;
	if (hall < 0.01) return null;
	const walls: [V3[], V3][] = [[[[6500, -5500, 0], [6500, 5500, 0], [6500, 5500, 4500], [6500, -5500, 4500]], [-1, 0, 0]], [[[-6500, 5500, 0], [-6500, -5500, 0], [-6500, -5500, 4500], [-6500, 5500, 4500]], [1, 0, 0]],
		[[[-6500, 5500, 0], [6500, 5500, 0], [6500, 5500, 4500], [-6500, 5500, 4500]], [0, -1, 0]], [[[6500, -5500, 0], [-6500, -5500, 0], [-6500, -5500, 4500], [6500, -5500, 4500]], [0, 1, 0]]];
	const washers: V3[] = [[6490, -2600, 2400], [6490, 2600, 2400], [-2800, 5490, 2400], [2800, 5490, 2400], [-6490, -2600, 2400], [-6490, 2600, 2400]];
	const posts = Array.from({length: 12}, (_, i) => { const a = (i / 12) * 2 * Math.PI + 0.31; return [3900 * Math.cos(a), 3900 * Math.sin(a)] as [number, number]; });
	return <g opacity={hall}>
		{walls.map(([q, n], i) => faceVis(c, q[0], n) ? <path key={`w${i}`} d={poly(c, q)} fill={mix('#120A07', '#34221A', lite)} /> : null)}
		<HallDetail c={c} lite={lite} />
		{washers.map((q, i) => { const p = proj(c, q); if (p[2] < 600) return null; const r = Math.min(1400, c.f * 900 / p[2]); if (p[0] < -r || p[0] > W + r || p[1] < -2 * r || p[1] > H + 2 * r) return null;
			return <Pool key={i} id={`dmw${i}`} x={p[0]} y={p[1]} rx={r * 0.55} ry={r * 1.1} a={0.09 + 0.08 * lite} col="#FFB060" />; })}
		{VIS.map((v, i) => <Visitor key={i} c={c} v={v} o={1} lite={lite} />)}
		{posts.map(([x, y], i) => { const a = proj(c, [x, y, 0]), b = proj(c, [x, y, 900]); if (a[2] < 200 || b[2] < 200) return null;
			return <path key={`p${i}`} d={`M${a[0]},${a[1]} L${b[0]},${b[1]}`} stroke="#3A2618" strokeWidth={Math.max(1.5, c.f * 40 / a[2])} strokeLinecap="round" />; })}
		{posts.map(([x, y], i) => { const [x2, y2] = posts[(i + 1) % posts.length], pts: V3[] = Array.from({length: 9}, (_, k) => { const u = k / 8; return [lerp(x, x2, u), lerp(y, y2, u), 880 - 160 * Math.sin(Math.PI * u)]; });
			const d = poly(c, pts, false); return d ? <path key={`rp${i}`} d={d} fill="none" stroke="#6A2C1A" strokeOpacity={0.55} strokeWidth={Math.max(1, c.f * 16 / Math.max(300, proj(c, pts[4])[2]))} /> : null; })}
	</g>; };

/** the case itself, exactly take53's `Museum` case (lit), without its hall */
export const CaseHall: React.FC<{cm: Cam; t: number; hood: number; lite: number; pool?: number}> = ({cm, t, hood, lite, pool}) =>
	<Museum c={{...cm, p: [cm.p[0] - SHIFT, cm.p[1], cm.p[2]]}} t={t} hall={0} hood={hood} ppl={0} lite={lite} pool={pool} />;

/** the floor (world metres): the 夯土 top while the camera rises through it, the museum floor once it is above; no grid, no wire */
export const FloorD: React.FC<{c: Cam; cm: Cam; k: number; lite: number}> = ({c, cm, k, lite}) => {
	const FL = '#18100A', col = mix('#241A13', FL, k), colP = mix('#54402A', FL, k);
	const big: V3[] = [[-40, -40, 0], [40, -40, 0], [40, 40, 0], [-40, 40, 0]], pit: V3[] = [[-3.5, -14, 0], [3.5, -14, 0], [3.5, 3.5, 0], [-3.5, 3.5, 0]];
	const mot = ['#8A6E40', '#6E6A5C', '#7A4A30', '#9A8458', '#4A3A28'];
	const cM: Cam = {...cm, p: [cm.p[0] - SHIFT, cm.p[1], cm.p[2]]};
	return <g>
		<path d={poly(c, big)} fill={col} />
		<path d={poly(c, pit)} fill={colP} />
		{k < 0.98 && Array.from({length: 420}, (_, i) => { const x = lerp(-3.4, 3.4, rnd(i, 11)), y = lerp(-9, 3.4, rnd(i, 12)), p = proj(c, [x, y, 0]); if (p[2] < 1.2) return null;
			const r = Math.max(1.2, c.f * (0.007 + 0.02 * rnd(i, 13)) / p[2]); return <ellipse key={i} cx={p[0]} cy={p[1]} rx={r} ry={r * 0.6} fill={mot[i % 5]} opacity={0.4 * (1 - k)} />; })}
		<g opacity={k}>
			<WPool c={cM} x={0} y={0} z={1} rx={2600} ry={2600} col="#FFB868" a={0.11 + 0.1 * lite} />
			{lite > 0.01 && <WPool c={cM} x={0} y={0} z={2} rx={1700} ry={1700} col="#FFD494" a={0.3 * lite} n={26} />}
		</g>
	</g>; };
void cl; void sstep; void seg;
