import React from 'react';
import {W, H, rnd, lerp, cl, KAI} from '../qq50/kit50';
import {Pool, B} from '../qq50/styleB';
import {YEAR} from '../qq44/skin44';
import {mix} from './parts53';
import {blob} from './props53';
/* ep53 · TakeC helper: the shaft of TakeB (tomb53.tsx lines 21–45, 77, 124–188) copied verbatim with a camera passed in,
   so TakeC's first frame is TakeB's last frame and the camera can leave TakeB's fixed path after 33.274. */
export type V3 = [number, number, number];
export type TC = {x: number; y: number; z: number; p: number; f: number; cx: number; cy: number};
export const dOf = (c: TC, q: V3) => (q[1] - c.y) * Math.cos(c.p) - (q[2] - c.z) * Math.sin(c.p);
export const pj = (c: TC, q: V3): [number, number] => { const ry = q[1] - c.y, rz = q[2] - c.z, d = dOf(c, q), yc = ry * Math.sin(c.p) + rz * Math.cos(c.p);
	return [c.cx + c.f * (q[0] - c.x) / d, c.cy - c.f * yc / d]; };
export const NEAR = 0.06;
export const poly3 = (c: TC, pts: V3[], close = true) => { const out: V3[] = [];
	for (let i = 0; i < pts.length; i++) { const A = pts[i], Bq = pts[(i + 1) % pts.length], da = dOf(c, A) - NEAR, db = dOf(c, Bq) - NEAR;
		if (da >= 0) out.push(A);
		if (!close && i === pts.length - 1) break;
		if ((da >= 0) !== (db >= 0)) { const u = da / (da - db); out.push([lerp(A[0], Bq[0], u), lerp(A[1], Bq[1], u), lerp(A[2], Bq[2], u)]); } }
	if (out.length < 2) return '';
	return 'M' + out.map((q) => pj(c, q).map((v) => v.toFixed(1)).join(',')).join('L') + (close ? 'Z' : ''); };

/* ---------- the stepped mouth: level k (outer → inner) = a rectangle (half sizes A, B) at height z ---------- */
export const SA = 1.9, SB = 1.5, SF = -8.8, WT = 0.18, DT = 0.09;
export const rect3 = (cx0: number, cy0: number, a: number, b: number, z: number): V3[] => [[cx0 - a, cy0 - b, z], [cx0 + a, cy0 - b, z], [cx0 + a, cy0 + b, z], [cx0 - a, cy0 + b, z]];
const BANDS: [number, number, string][] = [[-0.9, -7.0, '#5A452E'], [-7.0, -8.2, '#46504F'], [-8.2, -8.8, '#A9A595']];
const WALLP: Record<string, (u: number) => [number, number]> = {far: (u) => [lerp(-SA, SA, u), SB], right: (u) => [SA, lerp(SB, -SB, u)], near: (u) => [lerp(SA, -SA, u), -SB], left: (u) => [-SA, lerp(-SB, SB, u)]};
const WK: Record<string, number> = {far: 1, left: 1.16, right: 0.74, near: 0.66};
const wallQ = (w: string, z0: number, z1: number, u0 = 0, u1 = 1): V3[] => { const [x0, y0] = WALLP[w](u0), [x1, y1] = WALLP[w](u1); return [[x0, y0, z0], [x1, y1, z0], [x1, y1, z1], [x0, y0, z1]]; };
const shadeW = (col: string, k: number, z: number) => { const glow = cl((z + 5.5) / -3.2); const base = k >= 1 ? mix(col, '#E8C090', (k - 1) * 0.5) : mix(col, '#0A0503', (1 - k) * 0.9); return mix(base, '#8A5A30', glow * 0.3); };
const visW = (c: TC, w: string) => { const [x0, y0] = WALLP[w](0.5), n = w === 'far' ? [0, -1] : w === 'near' ? [0, 1] : w === 'left' ? [1, 0] : [-1, 0]; return (c.x - x0) * n[0] + (c.y - y0) * n[1] > 0; };
export const Shaft: React.FC<{c: TC; dW: number; t: number; roof?: boolean}> = ({c, dW, t, roof = true}) => {
	const walls = ['far', 'left', 'right', 'near'].filter((w) => visW(c, w));
	const zb = Math.min(-0.9, c.z - 2.3);   // the near/far blur boundary moves down with the camera (depth of field)
	const band = (z0: number, z1: number, col: string, key: string) => walls.map((w) => { const d = poly3(c, wallQ(w, z0, z1)); const cc = shadeW(col, WK[w], (z0 + z1) / 2); return d ? <path key={key + w} d={d} fill={cc} stroke={cc} strokeWidth={0.8} /> : null; });
	const split = (z0: number, z1: number, col: string, key: string, near: boolean) => { const a = near ? Math.min(z0, -0.9) : Math.min(z0, zb), b = near ? Math.max(z1, zb) : z1; return a > b ? band(a, b, col, key) : null; };
	const mottle = (near: boolean) => walls.filter((w) => w !== 'near' || near).map((w) => <g key={`mo${w}`}>{Array.from({length: 120}, (_, i) => { const u = rnd(i, 20 + w.length), z = lerp(-1.0, -7.0, rnd(i, 21 + w.length)); if ((z > zb) !== near) return null;
		const [x, y] = WALLP[w](u), q: V3 = [x, y, z], d = dOf(c, q); if (d < NEAR + 0.25) return null;
		const [sx, sy] = pj(c, q), r = c.f * (0.05 + 0.09 * rnd(i, 22 + w.length)) / d; if (sx < -60 || sx > W + 60 || sy < -60 || sy > H + 60) return null;
		return <path key={i} d={blob(sx, sy, r, i + w.length * 50, 8, 0.6)} fill={['#8A6E40', '#6E6A5C', '#7A4A30', '#9A8458', '#4A3A28'][i % 5]} opacity={0.35 * WK[w]} />; })}</g>);
	const courses = Array.from({length: 26}, (_, i) => -1.05 - i * 0.235).map((z) => walls.map((w) => { const d = poly3(c, wallQ(w, z, z).slice(0, 2), false); return d ? <path key={w + z} d={d} stroke="#1E140C" strokeOpacity={0.45} strokeWidth={1.3} fill="none" /> : null; }));
	const F = SF, flo = poly3(c, rect3(0, 0, SA, SB, F));
	const koR = (hx: number, hy: number) => poly3(c, rect3(0, 0.15, hx, hy, F + 0.01));
	const PX = 1.05, PY = SB - 0.03;
	const pole = Array.from({length: 18}, (_, i) => { const z0 = -0.9 - i * 0.5, z1 = Math.max(F, z0 - 0.5); if (z0 <= F) return null; const d = poly3(c, [[PX - 0.05, PY, z0], [PX + 0.05, PY, z0], [PX + 0.05, PY, z1], [PX - 0.05, PY, z1]]); return d ? <path key={i} d={d} fill={i % 2 ? '#E8DCC4' : '#A8402A'} opacity={0.92} /> : null; });
	const ticks = Array.from({length: 8}, (_, i) => -(i + 1)).map((z) => { const d = poly3(c, [[PX + 0.05, PY, z], [PX + 0.3, PY, z]], false); return d ? <path key={z} d={d} stroke="#F2E6CC" strokeWidth={2} strokeOpacity={0.8} fill="none" /> : null; });
	const labels = [-2, -4, -6, -8].map((z) => { const q: V3 = [PX + 0.36, PY, z], d = dOf(c, q); if (d < 0.4) return null; const [x, y] = pj(c, q), fs = Math.max(42, Math.min(60, 260 / d)); if (y < -40 || y > H + 40) return null;
		return <text key={z} x={x} y={y + fs * 0.34} fontFamily={YEAR} fontWeight={700} fontSize={fs} fill="#F6EBD2" stroke="#120A06" strokeWidth={6} strokeOpacity={0.85} style={{paintOrder: 'stroke'}}>{`−${-z}`}<tspan fontFamily={KAI} fontSize={fs * 0.72} dx={4}>米</tspan></text>; });
	const fc = pj(c, [0, 0.15, F]);
	return <g>
		{/* the flat base (identical to the morph's end state): the walls' average, the white-clay floor, the chamber roof */}
		{flo && (roof ? <path d={flo} fill="#8E8A7C" /> : <path d={flo + (koR(1.6, 1.15) || '')} fill="#8E8A7C" fillRule="evenodd" />)}
		{roof && koR(1.6, 1.15) && <path d={koR(1.6, 1.15)} fill="#2A1A10" />}
		<g opacity={roof ? dW : 0}>
			{koR(1.6, 1.15) && <path d={koR(1.6, 1.15)} fill="#2A1A10" stroke="#8A6A44" strokeOpacity={0.6} strokeWidth={1.5} />}
			{Array.from({length: 7}, (_, i) => { const d = poly3(c, [[-1.6 + (i + 1) * 3.2 / 8, -1.0, F + 0.02], [-1.6 + (i + 1) * 3.2 / 8, 1.3, F + 0.02]], false); return d ? <path key={i} d={d} stroke="#140C06" strokeWidth={1.5} strokeOpacity={0.6} fill="none" /> : null; })}
			{koR(1.6, 1.15) && <path d={koR(1.6, 1.15)} fill="#B8B4A6" opacity={0.12} />}
			{fc && <ellipse cx={fc[0]} cy={fc[1]} rx={130 * 8.8 / Math.max(2, dOf(c, [0, 0.15, F]))} ry={80 * 8.8 / Math.max(2, dOf(c, [0, 0.15, F]))} fill="url(#tbGlow)" />}
			{koR(1.62, 1.17) && <path d={koR(1.62, 1.17)} fill="none" stroke="#FFB868" strokeOpacity={0.55} strokeWidth={2} />}
		</g>
		<g opacity={dW}>
			{band(-8.2, -8.8, BANDS[2][2], 'b2')}
			{band(-7.0, -8.2, BANDS[1][2], 'b1')}
			{split(-0.9, -7.0, BANDS[0][2], 'b0f', false)}
			<g filter="url(#tbM)">{mottle(false)}</g>
			<g filter="url(#tbN)">{split(-0.9, -7.0, BANDS[0][2], 'b0n', true)}{mottle(true)}</g>
			{courses}
			{walls.map((w) => { const d = poly3(c, wallQ(w, -8.2, -8.2).slice(0, 2), false); return d ? <path key={`e${w}`} d={d} stroke="#EDE3CC" strokeOpacity={0.45} strokeWidth={1.6} fill="none" /> : null; })}
			{[[-SA, SB], [SA, SB]].map(([x, y], i) => { const d = poly3(c, [[x, y, -0.9], [x, y, F]], false); return d ? <path key={i} d={d} stroke={B.gold} strokeOpacity={0.12} strokeWidth={2} fill="none" /> : null; })}
			{pole}{ticks}{labels}
		</g>
	</g>; };

/* the diggers' two lamps on the chamber roof (they come up as the boss turns into the roof, flicker on their own clock) */
export const PitLamps: React.FC<{c: TC; t: number; o: number; lift?: [number, number]}> = ({c, t, o, lift}) => o <= 0.004 ? null : <g opacity={o}>{[[-1.35, -0.85], [1.35, 1.1]].map(([x, y], i) => { const q: V3 = [x, y, SF + 0.25 + (lift ? lift[i] : 0)]; if (dOf(c, q) < 0.3) return null;
	const [sx, sy] = pj(c, q), k = 8.8 / Math.max(2, dOf(c, q)), fl = 0.93 + 0.07 * Math.sin(t * 11.3 + i * 2) * Math.sin(t * 5.1 + i);
	return <g key={`l${i}`}><Pool id={`tbl${i}`} x={sx} y={sy} rx={150 * k} ry={110 * k} a={0.5 * fl} col="#FFB868" /><circle cx={sx} cy={sy} r={Math.max(2, 6 * k)} fill="#FFF0C8" /></g>; })}</g>;

/* ---------- snow, on its own clock (world flakes in a box round the camera; none underground) ---------- */
export const Snow: React.FC<{c: TC; t: number; g: number}> = ({c, t, g}) => { if (g <= 0.004) return null; const BX = 14, BY = 14, BZ = 11;
	const md = (v: number, m: number) => ((v % m) + m) % m;
	return <g opacity={g}>{Array.from({length: 170}, (_, i) => { const fx = BX * rnd(i, 81) + 0.35 * Math.sin(t * 0.9 + i), fy = BY * rnd(i, 82) + 0.25 * Math.sin(t * 0.7 + i * 1.3), fz = BZ * rnd(i, 83) - 0.85 * t;
		const rx = md(fx - c.x, BX) - BX / 2, ry = md(fy - c.y, BY) - BY / 2, rz = md(fz - c.z, BZ) - BZ / 2, q: V3 = [c.x + rx, c.y + ry, c.z + rz];
		if (q[2] < 0 && (Math.abs(q[0]) > SA - 0.05 || Math.abs(q[1]) > SB - 0.05)) return null;
		const d = dOf(c, q); if (d < 0.25) return null; const [sx, sy] = pj(c, q); if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) return null;
		const edge = Math.max(Math.abs(rx) / (BX / 2), Math.abs(ry) / (BY / 2), Math.abs(rz) / (BZ / 2)), o = (1 - Math.pow(edge, 6)) * (0.35 + 0.45 * rnd(i, 84));
		const r = Math.min(9, Math.max(0.9, c.f * 0.011 / d));
		return <circle key={i} cx={sx} cy={sy} r={r} fill="#F4F2EC" opacity={o} filter={r > 4.5 ? 'url(#tbS)' : undefined} />; })}</g>; };

