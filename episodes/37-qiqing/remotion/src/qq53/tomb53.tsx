import React from 'react';
import {W, H, rnd, lerp, cl, seg, KAI} from '../qq50/kit50';
import {Pool, Vignette, B} from '../qq50/styleB';
import {YEAR} from '../qq44/skin44';
import {Figure4, fkPose, Look4} from '../qq44/figure44';
import {mix} from './parts53';
import {blob} from './props53';
import {spline, sstep, sstep5, DEG} from './cam53';
import {Ground53, faceD} from './take53';
import {FaceGrad, RING_R, R_FACE, BOSS_R, GROOVE, FACE_GROOVE, FACE_HI} from './face53';
/* ep53 · THE ONE TAKE, legs 7–8 (20.821 → 33.274 s): the dive.
   Match 2 (storyboard): the camera falls through the centre of the pommel's 11 rings; the rings harden into the stepped mouth
   of a tomb shaft seen from straight above (one set of concentric shapes at all times: each ring groove becomes one riser,
   the bronze between the grooves becomes the treads, the boss becomes the chamber roof far below; never a cross-dissolve of
   two pictures). The fall slows over the 1965 dig in the snow (other shaft mouths, the half-dug canal, workers with spades and
   a lamp), the camera tilts and sinks into the shaft, and from 28.746 descends inside it at 1.2 m/s (KF05: the section face,
   the survey pole, depth marks; the depth tag in the corner runs on the same clock).
   World: metres, z = 0 the ground (top of the fill), the shaft 3.8 × 3.0 m (KF05) from z = −0.9 down to the chamber roof at
   −8.8; above it 11 shallow steps out to the rim. Camera: KF05's projector (looking +y, pitched p down, x to the right). */
export const DIVE_T = 20.821, T_M = 22.6;
type V3 = [number, number, number];
type TC = {x: number; y: number; z: number; p: number; f: number; cx: number; cy: number};
/* ---------- camera ---------- */
const CZ = spline([[DIVE_T, 12.4], [T_M, 11.5], [24.2, 9.7], [25.6, 7.7], [27.2, 3.5], [28.746, 0, -1.2]]);
const CYW = spline([[DIVE_T, 0, 0], [T_M, 0, 0], [24.2, -0.55], [25.6, -0.88], [28.746, -0.95, 0]]);
const CXW = spline([[DIVE_T, 0, 0], [T_M, 0, 0], [25.6, 0.07], [28.746, 0.12, 0]]);
const CP = spline([[DIVE_T, 90, 0], [T_M, 90, 0], [24.2, 77], [25.6, 64.5], [27.2, 62.3], [28.746, 62, 0]]);
const CF = spline([[DIVE_T, 1650, 0], [T_M, 1650, 0], [24.2, 1350], [25.6, 1060], [27.2, 900], [28.746, 860, 0]]);
const CCY = spline([[DIVE_T, 540, 0], [T_M, 540, 0], [24.2, 500], [25.6, 430], [27.2, 340], [28.746, 300, 0]]);
export const tombCam = (t: number): TC => t < 28.746 ? {x: CXW(t), y: CYW(t), z: CZ(t), p: CP(t) * DEG, f: CF(t), cx: 960, cy: CCY(t)}
	: {x: 0.12, y: -0.95, z: -1.2 * (t - 28.746), p: 62 * DEG, f: 860, cx: 960, cy: 300};
const dOf = (c: TC, q: V3) => (q[1] - c.y) * Math.cos(c.p) - (q[2] - c.z) * Math.sin(c.p);
const pj = (c: TC, q: V3): [number, number] => { const ry = q[1] - c.y, rz = q[2] - c.z, d = dOf(c, q), yc = ry * Math.sin(c.p) + rz * Math.cos(c.p);
	return [c.cx + c.f * (q[0] - c.x) / d, c.cy - c.f * yc / d]; };
const NEAR = 0.06;
const poly3 = (c: TC, pts: V3[], close = true) => { const out: V3[] = [];
	for (let i = 0; i < pts.length; i++) { const A = pts[i], Bq = pts[(i + 1) % pts.length], da = dOf(c, A) - NEAR, db = dOf(c, Bq) - NEAR;
		if (da >= 0) out.push(A);
		if (!close && i === pts.length - 1) break;
		if ((da >= 0) !== (db >= 0)) { const u = da / (da - db); out.push([lerp(A[0], Bq[0], u), lerp(A[1], Bq[1], u), lerp(A[2], Bq[2], u)]); } }
	if (out.length < 2) return '';
	return 'M' + out.map((q) => pj(c, q).map((v) => v.toFixed(1)).join(',')).join('L') + (close ? 'Z' : ''); };

/* ---------- the stepped mouth: level k (outer → inner) = a rectangle (half sizes A, B) at height z ---------- */
const SA = 1.9, SB = 1.5, SF = -8.8, WT = 0.18, DT = 0.09;
type Level = {r: number; A: number; B: number; z: number; cyw?: number; fillRing: string; fillTer: string; band?: boolean};
const RISER = '#1E1610', OUT0 = '#140B07', GROUND = '#2D251E';
const treadCol = (j: number) => mix('#4A4238', '#6C655A', j / 9);
export const LEVELS: Level[] = (() => { const L: Level[] = [];
	for (let i = 10; i >= 0; i--) { const A = SA + WT * i, Bb = SB + WT * i, zt = -DT * (10 - i), zb = i > 0 ? -DT * (11 - i) : SF;
		L.push({r: RING_R[i] + GROOVE / 2, A, B: Bb, z: zt, fillRing: FACE_GROOVE, fillTer: i > 0 ? RISER : '#2A1E15'});
		L.push({r: RING_R[i] - GROOVE / 2, A, B: Bb, z: zb, fillRing: 'face', fillTer: i > 0 ? treadCol(i - 1) : '#8E8A7C', band: true}); }
	L.push({r: BOSS_R, A: 1.6, B: 1.15, z: SF + 0.01, cyw: 0.15, fillRing: '#A8783C', fillTer: '#2A1A10'});
	return L; })();
/* in the tread rows above, a band level's rectangle is the next riser's bottom = that tread's inner edge; the tread itself is
   the area between riser i's bottom (inner edge of tread i−1 … ) — drawn by nesting: each level paints everything inside it. */

/* the virtual distance to the pommel face during the fall (continues the museum push: −0.62 /s, easing off) */
const KAP = (t: number) => 0.62 * 0.35 * (1 - Math.exp(-Math.max(0, t - DIVE_T) / 0.35));
const ringScale = (t: number) => 1650 / (faceD(DIVE_T) * Math.exp(-KAP(t)));   // px per mm at the face

/* ---------- ground details (fade in after 22.5, once the rim reads) ---------- */
const HEAPS: [number, number, number, number][] = [[-5.4, 3.6, 1.0, 0.8], [5.4, -1.0, 1.0, 0.7], [-0.4, 8.2, 1.4, 0.7], [6.6, 5.4, 1.2, 0.8], [-8.4, -2.8, 1.2, 0.9], [3.6, 8.6, 1.0, 0.6]];
type Mouth = {x: number; y: number; a: number; b: number; n: number; dug: number};
const OTHERS: Mouth[] = [{x: -6.6, y: 1.2, a: 1.4, b: 1.2, n: 5, dug: 1}, {x: 6.5, y: 2.1, a: 1.25, b: 1.5, n: 4, dug: 0.7}, {x: -4.8, y: 8.6, a: 1.3, b: 1.1, n: 4, dug: 0.5}, {x: 6.0, y: -7.0, a: 1.3, b: 1.1, n: 3, dug: 0.5}];
const CANAL = {y0: 6.3, y1: 5.7, w: 2.0, x0: -16, x1: 3.4};   // a straight trench, half-dug: it stops at x1
type Worker = {x: number; y: number; face: 1 | -1; dig: number; look: Look4; lamp?: boolean};
const WORKERS: Worker[] = [{x: 1.15, y: 3.9, face: 1, dig: 1, look: {dress: 'coat', head: 'cap'}}, {x: 2.95, y: 4.1, face: -1, dig: 1, look: {dress: 'jacket', head: 'cap', legs: 'trousers'}},
	{x: 4.55, y: 3.7, face: -1, dig: 0, look: {dress: 'coat', head: 'cap'}, lamp: true}, {x: 6.3, y: 4.5, face: -1, dig: 1, look: {dress: 'coat', head: 'short'}},
	{x: 2.3, y: 7.4, face: 1, dig: 0.6, look: {dress: 'jacket', head: 'short', legs: 'trousers'}}, {x: -4.4, y: 2.6, face: 1, dig: 1, look: {dress: 'coat', head: 'cap'}}];
const LAMP: V3 = [4.83, 3.66, 0.62];
const POSE_DIG = (u: number) => fkPose({hip: lerp(0.64, 0.58, u), lean: lerp(8, 34, u), neck: lerp(4, 16, u), lt: lerp(4, 18, u), lk: lerp(4, 30, u), rt: -12, rk: lerp(4, 14, u), la: lerp(20, 58, u), le: lerp(40, 20, u), ra: lerp(30, 66, u), re: lerp(30, 10, u)});
const POSE_LAMP = fkPose({hip: 0.655, lean: 4, neck: 6, lt: 2, lk: 2, rt: -4, rk: 3, la: 30, le: 70, ra: 4, re: 12});
const blob3 = (c: TC, x: number, y: number, r: number, seed: number, z = 0, n = 9) => { const pts: V3[] = [];
	for (let i = 0; i < n; i++) { const a = (i / n) * 2 * Math.PI, rr = r * (0.75 + 0.5 * rnd(seed * 31 + i, 5)); pts.push([x + rr * Math.cos(a), y + rr * Math.sin(a), z]); }
	return poly3(c, pts); };
const rect3 = (cx0: number, cy0: number, a: number, b: number, z: number): V3[] => [[cx0 - a, cy0 - b, z], [cx0 + a, cy0 - b, z], [cx0 + a, cy0 + b, z], [cx0 - a, cy0 + b, z]];
const Field: React.FC<{c: TC; g: number; t: number}> = ({c, g, t}) => { if (g <= 0.004 || c.z < 0.02) return null;
	const ground = poly3(c, rect3(0, 0, 40, 40, 0));
	const snow = Array.from({length: 150}, (_, i) => { const x = -14 + 28 * rnd(i, 11), y = -10 + 24 * rnd(i, 12); if (Math.abs(x) < 4.1 && Math.abs(y) < 3.7) return null; const d = blob3(c, x, y, 0.25 + 0.9 * rnd(i, 13), i + 3, 0.002); return d ? <path key={i} d={d} fill="#BEBAB0" opacity={0.1 + 0.16 * rnd(i, 14)} /> : null; });
	const canal = (() => { const {y0, y1, w, x0, x1} = CANAL, yy = (x: number) => lerp(y0, y1, (x - x0) / (x1 - x0)), pts = (o: number, z: number) => [x0, x1].map((x) => [x, yy(x) + o, z] as V3);
		const top = poly3(c, [...pts(-w / 2, 0.003), ...pts(w / 2, 0.003).reverse()]), bot = poly3(c, [...pts(-w / 2 + 0.25, -1.4), ...pts(w / 2 - 0.25, -1.4).reverse()]);
		const farWall = poly3(c, [...pts(w / 2, 0.003), ...pts(w / 2 - 0.25, -1.4).reverse()]), water = poly3(c, [...pts(-w / 2 + 0.3, -1.35), ...pts(w / 2 - 0.3, -1.35).reverse()]);
		const bankN = poly3(c, [...pts(-w / 2 - 1.1, 0.004), ...pts(-w / 2 - 0.1, 0.004).reverse()]), bankF = poly3(c, [...pts(w / 2 + 0.1, 0.004), ...pts(w / 2 + 1.2, 0.004).reverse()]);
		return <g>{bankN && <path d={bankN} fill="#3A3027" />}{bankF && <path d={bankF} fill="#3A3027" />}{top && <path d={top} fill="#120C08" />}{farWall && <path d={farWall} fill="#4A3E30" />}{bot && <path d={bot} fill="#1A130E" />}{water && <path d={water} fill="#5E6E76" opacity={0.35} />}
			{poly3(c, [[x1, yy(x1) - w / 2, 0.004], [x1, yy(x1) + w / 2, 0.004]], false) && <path d={poly3(c, [[x1, yy(x1) - w / 2, 0.004], [x1, yy(x1) + w / 2, 0.004]], false)} stroke="#6A5E50" strokeWidth={2} />}</g>; })();
	const heaps = HEAPS.map(([x, y, r, h], i) => { const d = blob3(c, x, y, r, 40 + i, 0.01, 11), d2 = blob3(c, x - r * 0.15, y + r * 0.12, r * 0.62, 60 + i, h * 0.5, 9); return d ? <g key={`h${i}`}><path d={d} fill="#3E3328" />{d2 && <path d={d2} fill="#8E8A80" opacity={0.55} />}</g> : null; });
	const others = OTHERS.map((m, k) => { const out: React.ReactNode[] = [];
		for (let s = 0; s <= m.n; s++) { const a = m.a + 0.16 * (m.n - s), b = m.b + 0.16 * (m.n - s), z = -0.09 * s * m.dug, d = poly3(c, rect3(m.x, m.y, a, b, z));
			if (d) out.push(<path key={`o${k}_${s}`} d={d} fill={s === m.n ? '#120C08' : s % 2 ? '#2A2219' : mix('#4A4238', '#625B50', s / m.n)} />); }
		return <g key={`m${k}`}>{out}</g>; });
	const pool = (q: V3, r: number, a: number, key: string) => <g key={key}>{Array.from({length: 14}, (_, k) => { const rr = r * (1 - k / 14), d = poly3(c, Array.from({length: 22}, (_, i) => { const th = i / 22 * 2 * Math.PI; return [q[0] + rr * Math.cos(th), q[1] + rr * Math.sin(th), 0.005] as V3; })); return d ? <path key={k} d={d} fill="#FFB868" opacity={a / 14} /> : null; })}</g>;
	void t;
	return <g opacity={g}>
		{ground && <path d={ground} fill={GROUND} />}
		{snow}
		{canal}
		{heaps}
		{others}
		{pool(LAMP, 3.2, 0.42, 'lp')}
	</g>; };
/* the workers stand on the ground; seen from above they are foreshortened billboards (one tone, faceless) with spades */
const Workers: React.FC<{c: TC; g: number; t: number}> = ({c, g, t}) => { if (g <= 0.004 || c.z < 0.3) return null;
	return <g opacity={g}>{WORKERS.map((w, i) => { const foot = pj(c, [w.x, w.y, 0]), head = pj(c, [w.x, w.y, 1.7]), d = dOf(c, [w.x, w.y, 0.8]); if (d < 0.5) return null;
		const hn = c.f * 1.7 / d, vx = head[0] - foot[0], vy = head[1] - foot[1], vl = Math.hypot(vx, vy); if (vl < 2 || hn < 6) return null;
		const ang = 0.45 * Math.atan2(vx, -vy) / DEG, k = Math.max(0.55, vl / hn);   // the wide lens' lean, eased so nobody reads as falling
		const u = w.dig ? 0.5 + 0.5 * Math.sin((t - 22.5) * 2.6 + i * 1.7) * w.dig : 0;   // digging on their own clock
		const pose = w.lamp ? POSE_LAMP : POSE_DIG(u), S = (p: [number, number]): [number, number] => [foot[0] + w.face * p[0] * hn, foot[1] - p[1] * hn];
		const hand = S(pose.RHand), tip: [number, number] = [foot[0] + w.face * hn * lerp(0.42, 0.3, u), foot[1] - hn * lerp(0.06, 0, u)];
		const lh = S(pose.LHand);
		return <g key={i} transform={`translate(${foot[0]},${foot[1]}) rotate(${ang}) scale(1,${k}) translate(${-foot[0]},${-foot[1]})`}>
			<g transform={`translate(${foot[0]},0) scale(${w.face},1) translate(${-foot[0]},0)`}>
				<g transform={`translate(${-hn * 0.006},${-hn * 0.006})`} opacity={0.5}><Figure4 x={foot[0]} ground={foot[1]} h={hn} pose={pose} look={w.look} col="#C8C4B8" /></g>
				<Figure4 x={foot[0]} ground={foot[1]} h={hn} pose={pose} look={w.look} col="#17110C" /></g>
			{!w.lamp && <><path d={`M${hand[0]},${hand[1]} L${tip[0]},${tip[1]}`} stroke="#2A1E14" strokeWidth={Math.max(1.2, hn * 0.018)} strokeLinecap="round" />
				<path d={`M${tip[0] - hn * 0.03},${tip[1] - hn * 0.07} L${tip[0] + hn * 0.03},${tip[1] - hn * 0.07} L${tip[0] + hn * 0.02},${tip[1] + hn * 0.01} L${tip[0] - hn * 0.02},${tip[1] + hn * 0.01} Z`} fill="#4A4A48" /></>}
			{w.lamp && <g><path d={`M${lh[0]},${lh[1]} l0,${hn * 0.05}`} stroke="#2A1E14" strokeWidth={Math.max(1, hn * 0.008)} /></g>}
		</g>; })}
		{(() => { const p = pj(c, LAMP), d = dOf(c, LAMP); if (d < 0.5) return null; const r = c.f * 0.09 / d; const fl = 0.92 + 0.08 * Math.sin(t * 13.1) * Math.sin(t * 7.3);
			return <g><circle cx={p[0]} cy={p[1]} r={r * 9} fill="url(#tbLampG)" opacity={0.55 * fl} /><rect x={p[0] - r * 0.8} y={p[1] - r * 1.2} width={r * 1.6} height={r * 2.2} rx={r * 0.4} fill="#FFE6B0" opacity={fl} /><circle cx={p[0]} cy={p[1]} r={r * 0.55} fill="#FFFFFF" /></g>; })()}
	</g>; };

/* ---------- inside the shaft: KF05's section, walls, pole, floor and lamps (with the camera's own position) ---------- */
const BANDS: [number, number, string][] = [[-0.9, -7.0, '#5A452E'], [-7.0, -8.2, '#46504F'], [-8.2, -8.8, '#A9A595']];
const WALLP: Record<string, (u: number) => [number, number]> = {far: (u) => [lerp(-SA, SA, u), SB], right: (u) => [SA, lerp(SB, -SB, u)], near: (u) => [lerp(SA, -SA, u), -SB], left: (u) => [-SA, lerp(-SB, SB, u)]};
const WK: Record<string, number> = {far: 1, left: 1.16, right: 0.74, near: 0.66};
const wallQ = (w: string, z0: number, z1: number, u0 = 0, u1 = 1): V3[] => { const [x0, y0] = WALLP[w](u0), [x1, y1] = WALLP[w](u1); return [[x0, y0, z0], [x1, y1, z0], [x1, y1, z1], [x0, y0, z1]]; };
const shadeW = (col: string, k: number, z: number) => { const glow = cl((z + 5.5) / -3.2); const base = k >= 1 ? mix(col, '#E8C090', (k - 1) * 0.5) : mix(col, '#0A0503', (1 - k) * 0.9); return mix(base, '#8A5A30', glow * 0.3); };
const visW = (c: TC, w: string) => { const [x0, y0] = WALLP[w](0.5), n = w === 'far' ? [0, -1] : w === 'near' ? [0, 1] : w === 'left' ? [1, 0] : [-1, 0]; return (c.x - x0) * n[0] + (c.y - y0) * n[1] > 0; };
const Shaft: React.FC<{c: TC; dW: number; t: number}> = ({c, dW, t}) => {
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
		{flo && <path d={flo} fill="#8E8A7C" />}
		{koR(1.6, 1.15) && <path d={koR(1.6, 1.15)} fill="#2A1A10" />}
		<g opacity={dW}>
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
const PitLamps: React.FC<{c: TC; t: number; o: number}> = ({c, t, o}) => o <= 0.004 ? null : <g opacity={o}>{[[-1.35, -0.85], [1.35, 1.1]].map(([x, y], i) => { const q: V3 = [x, y, SF + 0.25]; if (dOf(c, q) < 0.3) return null;
	const [sx, sy] = pj(c, q), k = 8.8 / Math.max(2, dOf(c, q)), fl = 0.93 + 0.07 * Math.sin(t * 11.3 + i * 2) * Math.sin(t * 5.1 + i);
	return <g key={`l${i}`}><Pool id={`tbl${i}`} x={sx} y={sy} rx={150 * k} ry={110 * k} a={0.5 * fl} col="#FFB868" /><circle cx={sx} cy={sy} r={Math.max(2, 6 * k)} fill="#FFF0C8" /></g>; })}</g>;

/* ---------- snow, on its own clock (world flakes in a box round the camera; none underground) ---------- */
const Snow: React.FC<{c: TC; t: number; g: number}> = ({c, t, g}) => { if (g <= 0.004) return null; const BX = 14, BY = 14, BZ = 11;
	const md = (v: number, m: number) => ((v % m) + m) % m;
	return <g opacity={g}>{Array.from({length: 170}, (_, i) => { const fx = BX * rnd(i, 81) + 0.35 * Math.sin(t * 0.9 + i), fy = BY * rnd(i, 82) + 0.25 * Math.sin(t * 0.7 + i * 1.3), fz = BZ * rnd(i, 83) - 0.85 * t;
		const rx = md(fx - c.x, BX) - BX / 2, ry = md(fy - c.y, BY) - BY / 2, rz = md(fz - c.z, BZ) - BZ / 2, q: V3 = [c.x + rx, c.y + ry, c.z + rz];
		if (q[2] < 0 && (Math.abs(q[0]) > SA - 0.05 || Math.abs(q[1]) > SB - 0.05)) return null;
		const d = dOf(c, q); if (d < 0.25) return null; const [sx, sy] = pj(c, q); if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) return null;
		const edge = Math.max(Math.abs(rx) / (BX / 2), Math.abs(ry) / (BY / 2), Math.abs(rz) / (BZ / 2)), o = (1 - Math.pow(edge, 6)) * (0.35 + 0.45 * rnd(i, 84));
		const r = Math.min(9, Math.max(0.9, c.f * 0.011 / d));
		return <circle key={i} cx={sx} cy={sy} r={r} fill="#F4F2EC" opacity={o} filter={r > 4.5 ? 'url(#tbS)' : undefined} />; })}</g>; };

/* ---------- the stepped mouth in 3-D (after the hand-over): treads and risers as depth-sorted faces; at T_M they tile exactly
   the same regions as the morph's nested shapes, with the same colours; the per-side light and the snow come in after ---------- */
const Terraces3D: React.FC<{c: TC; dW: number}> = ({c, dW}) => {
	type Q = {pts: V3[]; col: string; d: number};
	const qs: Q[] = [], push = (pts: V3[], col: string) => { const cz = pts.reduce((a, q) => a + dOf(c, q), 0) / pts.length; qs.push({pts, col, d: cz}); };
	const lit = (col: string, side: number) => mix(col, side > 0 ? '#8A8478' : '#0E0A07', dW * Math.abs(side) * 0.22);
	for (let i = 1; i <= 10; i++) { const A = SA + WT * i, Bb = SB + WT * i, zt = -DT * (10 - i), zb = zt - DT;
		if (c.y < Bb) push([[-A, Bb, zt], [A, Bb, zt], [A, Bb, zb], [-A, Bb, zb]], lit(RISER, 0.6));
		if (c.y > -Bb) push([[A, -Bb, zt], [-A, -Bb, zt], [-A, -Bb, zb], [A, -Bb, zb]], lit(RISER, -0.6));
		if (c.x > -A) push([[-A, -Bb, zt], [-A, Bb, zt], [-A, Bb, zb], [-A, -Bb, zb]], lit(RISER, 0.3));
		if (c.x < A) push([[A, Bb, zt], [A, -Bb, zt], [A, -Bb, zb], [A, Bb, zb]], lit(RISER, -0.3)); }
	for (let j = 0; j <= 9; j++) { const z = -DT * (10 - j); if (c.z <= z + 0.02) continue;
		const Ao = SA + WT * (j + 1), Bo = SB + WT * (j + 1), Ai = SA + WT * j, Bi = SB + WT * j, col = treadCol(j);
		push([[-Ao, Bo, z], [Ao, Bo, z], [Ai, Bi, z], [-Ai, Bi, z]], lit(col, 0.5));
		push([[Ao, -Bo, z], [-Ao, -Bo, z], [-Ai, -Bi, z], [Ai, -Bi, z]], lit(col, -0.2));
		push([[-Ao, -Bo, z], [-Ao, Bo, z], [-Ai, Bi, z], [-Ai, -Bi, z]], lit(col, 0.25));
		push([[Ao, Bo, z], [Ao, -Bo, z], [Ai, -Bi, z], [Ai, Bi, z]], lit(col, -0.1)); }
	qs.sort((a, b) => b.d - a.d);
	const snow = dW > 0.01 ? Array.from({length: 70}, (_, i) => { const j = Math.floor(rnd(i, 31) * 10), z = -DT * (10 - j) + 0.003; if (c.z <= z + 0.02) return null;
		const side = Math.floor(rnd(i, 32) * 4), u = rnd(i, 33) * 2 - 1, wv = SA + WT * (j + 0.5) - 0.02, hv = SB + WT * (j + 0.5) - 0.02, x = side < 2 ? u * wv : (side === 2 ? -wv : wv), y = side < 2 ? (side === 0 ? hv : -hv) : u * hv;
		const d = blob3(c, x, y, 0.05 + 0.08 * rnd(i, 34), i + 7, z, 7); return d ? <path key={`ts${i}`} d={d} fill="#D8D4CA" opacity={dW * (0.18 + 0.25 * rnd(i, 35))} /> : null; }) : null;
	return <g>{qs.map((q, i) => { const d = poly3(c, q.pts); return d ? <path key={i} d={d} fill={q.col} stroke={q.col} strokeWidth={0.7} strokeLinejoin="round" /> : null; })}{snow}</g>; };

/* ---------- the morph (20.821 → 22.6) and the 3-D dig (22.6 →) as ONE nested set of shapes ---------- */
const NA = 96;
const levelPath = (t: number, c: TC, L: Level, m: number, k: number) => {
	const cx = 960, cy = 540, rho = L.r * k;
	/* the rectangle as the straight-down camera sees it (centre and half sizes in px) */
	const dz = c.z - L.z, a = c.f * L.A / dz, b = c.f * L.B / dz, oy = -c.f * (L.cyw ?? 0) / dz;
	if (m <= 0) return 'M' + Array.from({length: NA}, (_, i) => { const th = i / NA * 2 * Math.PI; return `${(cx + rho * Math.cos(th)).toFixed(1)},${(cy - rho * Math.sin(th)).toFixed(1)}`; }).join('L') + 'Z';
	const tc = Math.atan2(b, a), ths = [...Array.from({length: NA}, (_, i) => i / NA * 2 * Math.PI), tc, Math.PI - tc, Math.PI + tc, 2 * Math.PI - tc].sort((u, v) => u - v);
	return 'M' + ths.map((th) => { const co = Math.cos(th), si = Math.sin(th), s = Math.min(Math.abs(co) > 1e-9 ? a / Math.abs(co) : 1e9, Math.abs(si) > 1e-9 ? b / Math.abs(si) : 1e9);
		const x = lerp(cx + rho * co, cx + s * co, m), y = lerp(cy - rho * si, cy + oy - s * si, m); return `${x.toFixed(1)},${y.toFixed(1)}`; }).join('L') + 'Z'; };
export const TakeB: React.FC<{t: number}> = ({t}) => {
	const c = tombCam(t), k = ringScale(t);
	const m = t >= T_M ? 1 : sstep5(seg(t, 20.95, 22.45));          // shape: rings → rectangles
	const cc = sstep(seg(t, 21.0, 22.35));                            // colour: bronze → earth
	const cOut = sstep(seg(t, 20.85, 21.35));                         // the face beyond ring 10 sinks into the dark
	const hi = 1 - sstep(seg(t, 20.85, 21.3));                        // the ring highlights go first
	const g = sstep(seg(t, 22.5, 23.7));                              // the dig, the snow (only once the rim reads)
	const dW = sstep(seg(t, 22.6, 24.0));                             // the shaft's section detail
	const ppm = k, facePt = (r: number, th: number): [number, number] => [960 + r * ppm * Math.cos(th), 540 - r * ppm * Math.sin(th)];
	const morph = t < T_M;
	/* the 3-D path of a level (after the morph): its rectangle through the camera (clipped); skipped once above the camera */
	const mouthClip = c.z > -0.9 + 0.3 ? poly3(c, rect3(0, 0, SA, SB, -0.9)) : '';   // no clip in the last 0.3 m above the mouth plane (the clipped quad degenerates there)
	const shapes = !morph ? null : LEVELS.map((L, i) => { const d = levelPath(t, c, L, m, k); if (!d) return null;
		if (L.fillRing === 'face') return <g key={i}><path d={d} fill="url(#tbFace)" opacity={1 - cc} /><path d={d} fill={L.fillTer} opacity={cc} /></g>;
		if (i === LEVELS.length - 1 && morph) return <path key={i} d={d} fill={mix(L.fillRing, L.fillTer, cc)} stroke={FACE_GROOVE} strokeWidth={Math.max(0.8, ppm * 0.2)} strokeOpacity={1 - cc} />;
		return <path key={i} d={d} fill={mix(L.fillRing, L.fillTer, cc)} />; });
	/* the shaft interior and the chamber roof sit inside the innermost levels: draw them with the mouth as a clip */
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		<defs>
			<FaceGrad id="tbFace" pt={facePt} ppm={ppm} />
			<radialGradient id="tbGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFB060" stopOpacity="0.55" /><stop offset="0.5" stopColor="#FF9A48" stopOpacity="0.2" /><stop offset="1" stopColor="#FF9040" stopOpacity="0" /></radialGradient>
			<radialGradient id="tbLampG" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFC878" stopOpacity="0.8" /><stop offset="0.4" stopColor="#FFA850" stopOpacity="0.25" /><stop offset="1" stopColor="#FF9040" stopOpacity="0" /></radialGradient>
			<filter id="tbN" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4 9" /></filter>
			<filter id="tbM" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.4 2.2" /></filter>
			<filter id="tbS" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.2" /></filter>
			{mouthClip && <clipPath id="tbMouth"><path d={mouthClip} /></clipPath>}
		</defs>
		<Ground53 id="tB" k={0.35 * (1 - g)} sheen={0.3} />
		<Field c={c} g={g} t={t} />
		{morph && <g>
			{/* the disc: the face beyond ring 10 sinks into the dark as the rim takes over */}
			<path d={levelPath(t, c, {r: R_FACE, A: 0, B: 0, z: 0, fillRing: '', fillTer: ''}, 0, k)} fill="url(#tbFace)" opacity={1 - cOut} />
			<path d={levelPath(t, c, {r: R_FACE, A: 0, B: 0, z: 0, fillRing: '', fillTer: ''}, 0, k)} fill="none" stroke="#2A180A" strokeWidth={Math.max(1, ppm * 0.12)} opacity={1 - cOut} />
		</g>}
		{shapes}
		{!morph && <Terraces3D c={c} dW={dW} />}
		{!morph && mouthClip && <path d={mouthClip} fill="#2A1E15" />}
		{!morph && <g clipPath={mouthClip ? 'url(#tbMouth)' : undefined}><Shaft c={c} dW={dW} t={t} /><PitLamps c={c} t={t} o={1} /></g>}
		{morph && <PitLamps c={c} t={t} o={sstep(seg(t, 21.7, 22.55))} />}
		{morph && hi > 0.01 && RING_R.map((r, i) => <path key={`h${i}`} d={'M' + Array.from({length: 25}, (_, j) => facePt(r + GROOVE * 0.75, Math.PI * (0.08 + 0.47 * j / 24)).map((v) => v.toFixed(1)).join(',')).join('L')} fill="none" stroke={FACE_HI} strokeWidth={Math.max(0.6, ppm * 0.16)} strokeOpacity={0.55 * 0.9 * hi} strokeLinecap="round" />)}
		<Workers c={c} g={g} t={t} />
		<Snow c={c} t={t} g={g} />
		<Vignette id="tB" a={0.6} />
	</svg>; };
void OUT0;
