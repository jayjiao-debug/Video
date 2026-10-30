import React from 'react';
import {rnd, lerp, cl} from '../qq50/kit50';
import {Cam, V3, proj, poly as polyN, blobOn, toCam} from './parts53';
/* ep53 · your cleaver (菜刀), v3: the unmistakable Chinese cleaver, drawn in the kitchen frame (mm), lying flat on the counter.
   Same footprint and edge line as v2 (edge on y = 0 from the heel x = 0 to the front x = 205, spine at y = −96), so the opening
   glide still lands on the bronze: a broad rectangular blade (20.5 × 9.6 cm) with a slightly curved edge and a flat spine, a small
   hanging hole, a short steel neck, a metal ferrule and a short ROUND wooden handle with two rivets.
   Brushed steel with a polished edge band; small rust spots that bloom with rho; water beads (the hook: it rusts).
   Cool and dark on purpose: lower in contrast than the bronze (the sword stays the brightest thing). */
export const KF = 205, KS = -96;
/** a polygon only when all of it is in front of the lens (the glide passes over the handle: no near-plane slivers) */
const poly = (c: Cam, pts: V3[], close = true) => (pts.every((q) => toCam(c, q)[2] > 25) ? polyN(c, pts, close) : '');
/** the edge, slightly curved (convex, 2.5 mm at the middle) */
const edgeY = (x: number) => 2.5 * Math.sin(Math.PI * cl(x / KF));
const outline = (dz = 0): V3[] => { const pts: V3[] = [[1.5, 0, dz]];
	for (let i = 1; i <= 16; i++) { const x = lerp(1.5, KF - 6, i / 16); pts.push([x, edgeY(x), dz]); }
	for (let i = 1; i <= 5; i++) { const a = (i / 5) * Math.PI / 2; pts.push([KF - 6 + 6 * Math.sin(a), edgeY(KF - 6) - 6 + 6 * Math.cos(a), dz]); }
	pts.push([KF, KS + 10, dz]);
	for (let i = 1; i <= 6; i++) { const a = (i / 6) * Math.PI / 2; pts.push([KF - 10 + 10 * Math.cos(a), KS + 10 - 10 * Math.sin(a), dz]); }
	pts.push([3, KS, dz], [0, KS + 3, dz]); return pts; };
/** rust: [x, y, r, birth 0..1], small clusters along the spine, round the hole, at the heel and pitting on the edge band */
const RUST: [number, number, number, number][] = (() => { const out: [number, number, number, number][] = [];
	const cl0: [number, number, number, number][] = [[186, -82, 11, 9], [132, -90, 8, 6], [78, -90, 9, 7], [22, -86, 9, 7], [10, -34, 10, 8], [100, -50, 6, 4], [150, -28, 5, 3], [52, -8, 5, 4], [170, -7, 4, 3], [120, -6, 4, 3]];
	cl0.forEach(([x, y, r, n], c) => { for (let i = 0; i < n; i++) { const a = rnd(c * 40 + i, 71) * 6.283, d = r * Math.sqrt(rnd(c * 40 + i, 72));
		out.push([x + d * Math.cos(a), y + d * Math.sin(a) * 0.9, (1.0 + 2.6 * rnd(c * 40 + i, 73)) * (1 - 0.45 * d / r), rnd(c * 40 + i, 74)]); } });
	return out; })();
const RUST_COL = ['#7A3E1C', '#8E4A22', '#5E2E16', '#9A5628', '#6A3518'];
const BEADS: [number, number, number][] = [[62, -54, 4.6], [104, -30, 3.2], [142, -58, 4.0], [30, -42, 2.8], [118, -72, 2.4], [46, -66, 2.2], [172, -42, 2.6], [84, -20, 2.0]];
/* the handle: a round wooden grip on an axis along x at y = HY, z = HZ; neck (steel) x 0 → −14, ferrule −14 → −32, wood −32 → −142 */
const HY = -74, HZ = 9, X_NECK = -14, X_FER = -32, X_END = -142;
const wR = (x: number) => 12.5 + 1.8 * Math.sin(Math.PI * cl((X_FER - x) / (X_FER - X_END)));   // a slight swell
export const CleaverK: React.FC<{c: Cam; rho: number}> = ({c, rho}) => {
	const top = polyN(c, outline()), p0 = proj(c, [10, KS, 0]), p1 = proj(c, [KF * 0.8, 0, 0]);
	/* the round handle's silhouette: offset ⟂ to the axis and the view */
	const mid: V3 = [(X_FER + X_END) / 2, HY, HZ], v = [mid[0] - c.p[0], mid[1] - c.p[1], mid[2] - c.p[2]], nn = Math.hypot(v[1], v[2]) || 1, oy = -v[2] / nn, oz = v[1] / nn;
	const ty = -v[1] / nn, tz = -v[2] / nn;   // toward the camera, in the y–z plane
	const ax = (x: number, r: number, s: number): V3 => [x, HY + s * r * oy, HZ + s * r * oz];
	const sil = (x0: number, x1: number, r0: (x: number) => number, n = 10) => { const A: V3[] = [], Bq: V3[] = [];
		for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n); A.push(ax(x, r0(x), 1)); Bq.push(ax(x, r0(x), -1)); } return poly(c, [...A, ...Bq.reverse()]); };
	const g0 = proj(c, ax(-80, 14, 1)), g1 = proj(c, ax(-80, 14, -1)), f0 = proj(c, ax(-23, 14, 1)), f1 = proj(c, ax(-23, 14, -1));
	const wood = sil(X_FER, X_END, wR, 16), fer = sil(X_NECK, X_FER, () => 13.6, 4);
	const butt = poly(c, Array.from({length: 20}, (_, i) => { const a = i / 20 * 2 * Math.PI, r = wR(X_END); return [X_END - 1.5, HY + r * Math.cos(a), HZ + r * Math.sin(a)] as V3; }));
	const neck = poly(c, [[1, -90, 0.2], [X_NECK, -84, HZ - 3], [X_NECK, -64, HZ - 3], [1, -58, 0.2]]);
	const band = polyN(c, [...Array.from({length: 14}, (_, i) => { const x = lerp(2, KF - 7, i / 13); return [x, edgeY(x) - 0.4, 0.06] as V3; }), ...Array.from({length: 14}, (_, i) => { const x = lerp(KF - 9, 3, i / 13); return [x, edgeY(x) - 12, 0.06] as V3; })]);
	const spine = polyN(c, [[3, KS, 0.06], [KF - 10, KS, 0.06], [KF - 10, KS + 4.5, 0.06], [3, KS + 4.5, 0.06]]);
	const spots = RUST.map(([x, y, r, b], i) => { const k = cl((rho - b * 0.7) / 0.3); if (k <= 0) return null; const d = blobOn(c, x, y, r * (0.4 + 0.6 * k), i, 0.08, 9, 0.7);
		return d ? <path key={i} d={d} fill={RUST_COL[i % 5]} opacity={0.45 + 0.35 * k * rnd(i, 76)} /> : null; });
	const rivet = (x: number) => { const q = proj(c, [x, HY + 13.2 * (0.55 * oy + 0.84 * ty), HZ + 13.2 * (0.55 * oz + 0.84 * tz)]), R = c.f * 3.2 / Math.max(1, q[2]); if (q[2] < 25) return null;
		return <g key={x}><ellipse cx={q[0]} cy={q[1]} rx={R} ry={R * 0.8} fill="#6E7274" stroke="#1E2022" strokeWidth={1} /><circle cx={q[0] - R * 0.3} cy={q[1] - R * 0.3} r={Math.max(0.8, R * 0.3)} fill="#C4CACC" opacity={0.6} /></g>; };
	const hole = poly(c, Array.from({length: 24}, (_, i) => { const a = i / 24 * 2 * Math.PI; return [186 + 5.5 * Math.cos(a), -80 + 5.5 * Math.sin(a), 0.1] as V3; }));
	return <g>
		<defs><linearGradient id="ckS" gradientUnits="userSpaceOnUse" x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]}><stop offset="0" stopColor="#2C3134" /><stop offset="0.45" stopColor="#454C50" /><stop offset="0.7" stopColor="#525A5E" /><stop offset="1" stopColor="#363C40" /></linearGradient>
			<linearGradient id="ckW" gradientUnits="userSpaceOnUse" x1={g0[0]} y1={g0[1]} x2={g1[0]} y2={g1[1]}><stop offset="0" stopColor="#6A452C" /><stop offset="0.3" stopColor="#58381F" /><stop offset="0.7" stopColor="#3A2414" /><stop offset="1" stopColor="#1E130B" /></linearGradient>
			<linearGradient id="ckF" gradientUnits="userSpaceOnUse" x1={f0[0]} y1={f0[1]} x2={f1[0]} y2={f1[1]}><stop offset="0" stopColor="#2A2E30" /><stop offset="0.3" stopColor="#7A8184" /><stop offset="0.55" stopColor="#4A5054" /><stop offset="1" stopColor="#1E2224" /></linearGradient>
			<filter id="ckR" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1" /></filter>
			<filter id="ckSh" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="5" /></filter>
			<clipPath id="ckC"><path d={top} /></clipPath></defs>
		{/* contact shadows */}
		<g filter="url(#ckSh)"><path d={polyN(c, outline(-3).map(([x, y, z]) => [x + 3, y + 5, z] as V3))} fill="#000" opacity={0.5} />
			<path d={poly(c, [[X_NECK, HY - 12, -2.9], [X_END, HY - 13, -2.9], [X_END, HY + 15, -2.9], [X_NECK, HY + 14, -2.9]])} fill="#000" opacity={0.45} /></g>
		{/* the blade: brushed steel, the flat spine, the polished edge band, the shoulder line */}
		<path d={top} fill="url(#ckS)" />
		<g clipPath="url(#ckC)">
			{Array.from({length: 26}, (_, i) => { const y = lerp(KS + 6, -14, i / 25) + 1.2 * (rnd(i, 7) - 0.5); return <path key={i} d={poly(c, [[2, y, 0.05], [KF - 2, y, 0.05]], false)} stroke="#C8D2D6" strokeOpacity={0.035 + 0.045 * rnd(i, 3)} strokeWidth={1} fill="none" />; })}
			<path d={spine} fill="#7E878B" opacity={0.42} />
			<path d={band} fill="#7C8588" opacity={0.5} />
			<path d={poly(c, Array.from({length: 14}, (_, i) => { const x = lerp(3, KF - 9, i / 13); return [x, edgeY(x) - 12, 0.07] as V3; }), false)} stroke="#1C2022" strokeOpacity={0.45} strokeWidth={1.2} fill="none" />
			<g filter="url(#ckR)">{spots}</g>
		</g>
		{hole && <path d={hole} fill="#0C0907" stroke="#5A6266" strokeOpacity={0.6} strokeWidth={1.2} />}
		<path d={poly(c, Array.from({length: 18}, (_, i) => { const x = lerp(2.5, KF - 6, i / 17); return [x, edgeY(x) - 0.3, 0.1] as V3; }), false)} stroke="#D2D9DB" strokeWidth={1.8} strokeOpacity={0.5} fill="none" />
		{BEADS.map(([x, y, rr], i) => { const p = proj(c, [x, y, 0.2]), R = c.f * rr / p[2], q = proj(c, [x - rr * 0.3, y - rr * 0.35, 0.5]); if (p[2] < 25) return null;
			return <g key={`w${i}`}><ellipse cx={p[0]} cy={p[1]} rx={R} ry={R * 0.62} fill="#6E777A" opacity={0.5} /><ellipse cx={p[0] + R * 0.15} cy={p[1] + R * 0.18} rx={R * 0.7} ry={R * 0.38} fill="#1E2426" opacity={0.25} />
				<circle cx={q[0]} cy={q[1]} r={Math.max(1.1, R * 0.24)} fill="#EEF4F6" opacity={0.8} /></g>; })}
		{/* the neck, the ferrule, the round wooden handle with two rivets */}
		{neck && <path d={neck} fill="#3A4043" stroke="#1A1D1F" strokeWidth={1} />}
		{fer && <path d={fer} fill="url(#ckF)" stroke="#16191A" strokeWidth={1} />}
		{[X_NECK - 2, X_FER + 2].map((x) => { const d = poly(c, [ax(x, 13.6, 1), ax(x, 13.6, -1)], false); return d ? <path key={x} d={d} stroke="#9AA2A5" strokeOpacity={0.35} strokeWidth={1.2} fill="none" /> : null; })}
		{wood && <path d={wood} fill="url(#ckW)" />}
		{Array.from({length: 5}, (_, i) => { const s = -0.7 + 0.35 * i, d = poly(c, Array.from({length: 9}, (_, k) => { const x = lerp(X_FER - 4, X_END + 4, k / 8); return ax(x, wR(x) * Math.abs(s), Math.sign(s) || 1); }), false);
			return d ? <path key={i} d={d} stroke="#8A6040" strokeOpacity={0.22} strokeWidth={1} fill="none" /> : null; })}
		{butt && <path d={butt} fill="#2A1A10" opacity={0.85} />}
		{[-62, -112].map(rivet)}
	</g>; };
