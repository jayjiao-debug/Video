import React from 'react';
import {W, H, rnd, lerp, cl, seg, SANS} from '../qq50/kit50';
import {Pool, Vignette, B} from '../qq50/styleB';
import {Cam, poly, proj, blobOn, V3, mix} from './parts53';
import {sstep, sstep5} from './cam53';
import {Shaft, PitLamps, Snow, pj, dOf, TC as ShaftTC} from './shaft53c';
import {box, OpenCoffin, Digger, Glove, RED_LINE} from './parts53c';
import {camC, TC, CH_Z, swordAt, drawn, planK, planPos, T_DRAW, T_LIFT} from './cam53c';
import {Sword, SW, LB, bladeHW, BZ, GLS} from './props53';

import {frameOf, DA} from './master53';
import {Marks, Letters, BladeClip, Reading, Water} from './inscr53c';
/* ep53 · TakeC legs 8–9 (33.274 → 43.463) and 10 (→ 56.482): the descent's tail, the opened chamber, the lids, the sword in its
   sheath, the wash and the draw, the inscription. One camera (cam53c.camC), all in metres; chamber-local x' is mirrored (screen right = −x'). */
export const T_ROOF = 36.104, T_LID1 = DA(16), T_LID2 = 37.803, T_TOP = 38.935;
const toCam = (c: TC): Cam => ({p: [-c.x, c.y, c.z + CH_Z], yaw: Math.PI / 2, pitch: c.p, f: c.f, cx: c.cx, cy: c.cy, roll: c.roll});
/* the room (the opened 椁): interior ±RX × ±RY, walls to the roof plane z = 2.0 */
const RX = 1.6, RY = 1.15, WH = 2.0;
const OUT = {x: 1.06, y: 0.42, z: 0.84, t: 0.06}, INN = {x: 0.9, y: 0.3, z: 0.7, t: 0.05};
type Lean = {by: number; bh: number; ty: number; th: number};
const LEAN1: Lean = {by: 0.9, bh: 0.03, ty: 1.1, th: 0.83}, LEAN2: Lean = {by: 0.74, bh: 0.03, ty: 0.9, th: 0.56};
/** a lid (slab) as its two long edges: near edge N = (y, h), far edge F = (y, h); u 0 → 1 = lifted by the two diggers and leaned */
const lidEdges = (u: number, rest: number, hy: number, L: Lean, lift = 0.62, hmp = 0.5) => { const a = sstep(u / 0.4), b = sstep5((u - 0.38) / 0.62), hump = Math.sin(Math.PI * b);
	return {Ny: lerp(-hy + 0.1 * a, L.by, b), Nh: lerp(rest + lift * a, L.bh, b) + hmp * hump, Fy: lerp(hy, L.ty, b), Fh: lerp(rest + 0.05 * a, L.th, b) + 0.12 * hump}; };
const lidAt = (t: number) => ({u1: seg(t, T_LID1, 37.55), u2: seg(t, T_LID2, 38.5)});
const Lid: React.FC<{c: Cam; u: number; rest: number; hx: number; hy: number; L: Lean; id: string; o?: number; lift?: number; hmp?: number}> = ({c, u, rest, hx, hy, L, id, o = 1, lift, hmp}) => { const e = lidEdges(u, rest, hy, L, lift, hmp), th = 0.07;
	const P = (x: number, y: number, h: number, top: boolean): V3 => [x, y, h + (top ? th : 0)];
	const top = [P(-hx, e.Ny, e.Nh, true), P(hx, e.Ny, e.Nh, true), P(hx, e.Fy, e.Fh, true), P(-hx, e.Fy, e.Fh, true)];
	const front = [P(-hx, e.Ny, e.Nh, true), P(hx, e.Ny, e.Nh, true), P(hx, e.Ny, e.Nh, false), P(-hx, e.Ny, e.Nh, false)];
	const endL = [P(-hx, e.Ny, e.Nh, true), P(-hx, e.Fy, e.Fh, true), P(-hx, e.Fy, e.Fh, false), P(-hx, e.Ny, e.Nh, false)];
	const endR = [P(hx, e.Ny, e.Nh, true), P(hx, e.Fy, e.Fh, true), P(hx, e.Fy, e.Fh, false), P(hx, e.Ny, e.Nh, false)];
	const inset = [P(-hx + 0.1, lerp(e.Ny, e.Fy, 0.12), lerp(e.Nh, e.Fh, 0.12), true), P(hx - 0.1, lerp(e.Ny, e.Fy, 0.12), lerp(e.Nh, e.Fh, 0.12), true), P(hx - 0.1, lerp(e.Ny, e.Fy, 0.88), lerp(e.Nh, e.Fh, 0.88), true), P(-hx + 0.1, lerp(e.Ny, e.Fy, 0.88), lerp(e.Nh, e.Fh, 0.88), true)];
	return <g opacity={o}><path d={poly(c, endL)} fill="#2A1C14" /><path d={poly(c, endR)} fill="#241811" /><path d={poly(c, front)} fill="#2A1C14" />
		<path d={poly(c, top)} fill="#33211A" stroke="#F0C080" strokeOpacity={0.85} strokeWidth={3.5} /><path d={poly(c, front)} fill="none" stroke="#F0C080" strokeOpacity={0.6} strokeWidth={2.5} /><path d={poly(c, inset)} fill="none" stroke={RED_LINE} strokeOpacity={0.6} strokeWidth={2} /><title>{id}</title></g>; };
/** the sword's point, chamber-local: a, w, h in cm */
const swP = (t: number, a: number, w: number, h = 0): V3 => { const s = swordAt(t); return [s.xp + a / 100, s.y + w / 100, s.z + h / 100]; };
/** the sheath: rigid, its mouth at the guard when nothing is drawn; black lacquer, wet */
const sheathHW = (a: number, dl: number) => (a - dl - SW.bladeA > LB ? 0.3 : bladeHW(Math.min(LB - 0.5, Math.max(0, a - dl - SW.bladeA))) + 0.55);
const Sheath: React.FC<{c: Cam; t: number; dl: number; wash: number}> = ({c, t, dl, wash}) => { const am = SW.guardA + dl, at = SW.L + 2.2 + dl, n = 36, aa = (i: number) => lerp(am, at, i / n);
	const edge = (sgn: number, k = 1, dz = 0.45) => Array.from({length: n + 1}, (_, i) => swP(t, aa(i), sgn * sheathHW(aa(i), dl) * k * (i === n ? 0.5 : 1), dz));
	const outline = [...edge(1), ...[...edge(-1)].reverse()], sw = swordAt(t), wet = wash;
	const dirt = Array.from({length: 9}, (_, i) => { const a = lerp(am + 3, at - 4, rnd(i, 3)), w = (rnd(i, 4) - 0.5) * 2.6, p = swP(t, a, w, 0.5); return {d: blobOn(c, p[0], p[1], 0.012 + 0.016 * rnd(i, 5), i + 11, p[2], 8, 0.7), i}; });
	void sw;
	return <g>
		<path d={poly(c, outline)} fill="#0A0605" stroke="#060403" strokeWidth={2} />
		<path d={poly(c, edge(1, 0.86, 0.5).slice(2, n - 2), false)} fill="none" stroke="#FFFFFF" strokeOpacity={0.28 * wet} strokeWidth={3} />
		<path d={poly(c, edge(1, 0.55, 0.5).slice(1, n - 1), false)} fill="none" stroke="#7A2A1A" strokeOpacity={0.7} strokeWidth={2.2} />
		<path d={poly(c, edge(-1, 0.55, 0.5).slice(1, n - 1), false)} fill="none" stroke="#7A2A1A" strokeOpacity={0.7} strokeWidth={2.2} />
		{dirt.map((q) => q.d ? <path key={q.i} d={q.d} fill="#6A5236" opacity={0.85 * (1 - wet)} /> : null)}
		<path d={poly(c, [swP(t, am - 0.8, -(sheathHW(am, dl) + 0.3), 0.55), swP(t, am - 0.8, sheathHW(am, dl) + 0.3, 0.55), swP(t, am + 0.4, sheathHW(am, dl) + 0.3, 0.55), swP(t, am + 0.4, -(sheathHW(am, dl) + 0.3), 0.55)])} fill="#1E1410" stroke="#5A3A28" strokeWidth={2} />
	</g>; };
/** hilt, guard and pommel as plain polygons, for the frames where the camera is not yet straight above */
const HiltLite: React.FC<{c: Cam; t: number}> = ({c, t}) => { const q = (a: number, w: number, h: number) => swP(t, a, w, h);
	return <g><path d={poly(c, [q(0, -1.86, 0.8), q(0, 1.86, 0.8), q(SW.pomA, 1.86, 0.8), q(SW.pomA, -1.86, 0.8)])} fill={BZ.body} stroke={BZ.line} strokeWidth={1} />
		<path d={poly(c, [q(SW.pomA, -0.86, 0.5), q(SW.pomA, 0.86, 0.5), q(SW.gripA, 0.86, 0.5), q(SW.gripA, -0.86, 0.5)])} fill={BZ.mid} />
		<path d={poly(c, [q(SW.gripA, -2.78, 0.6), q(SW.gripA, 2.78, 0.6), q(SW.guardA, 2.6, 0.6), q(SW.guardA, -2.6, 0.6)])} fill={GLS.body} stroke={BZ.lit} strokeWidth={1.2} /></g>; };
/** the occupant (facts A9: the sword lay on the skeleton's left): a respectful, simplified skeleton lying supine on the inner floor,
   pale bone-cream line art at low contrast (skull and jaw only as outlines, spine, a few curved ribs, pelvis, the long bones of arms and
   legs), ochre-brown soil stains under it and decayed textile as soft dark shapes over the pelvis and legs. Chamber metres: head at
   x = −0.72, feet toward +x, body axis y = OY; supine with the head toward −x, the occupant's LEFT is +y, where the sword rests (y 0.15). */
const OY = -0.07, OZ = 0.05;
const Occupant: React.FC<{c: Cam}> = ({c}) => {
	const P = (x: number, s: number, dz = 0): V3 => [x, OY + s, OZ + dz], m = proj(c, P(0, 0)); if (m[2] < 0.2) return null;
	const ppm = c.f / m[2], S = (x: number, s: number) => { const p = proj(c, P(x, s)); return `${p[0].toFixed(1)},${p[1].toFixed(1)}`; };
	const BONE = '#E4D4B0', HOL = '#3A1C14';
	/** a long bone: a capsule with knobbed ends, drawn as an outline (cream stroke, hollowed with the floor colour) */
	const bone = (k: string, a: [number, number], b: [number, number], w: number, knob = 1.35) => { const pa = proj(c, P(a[0], a[1])), pb = proj(c, P(b[0], b[1])), W0 = w * ppm;
		return <g key={k}>
			<path d={`M${pa[0]},${pa[1]} L${pb[0]},${pb[1]}`} stroke={BONE} strokeOpacity={0.5} strokeWidth={W0} strokeLinecap="round" />
			{[pa, pb].map((q, i) => <circle key={i} cx={q[0]} cy={q[1]} r={W0 * knob / 2} fill={BONE} opacity={0.5} />)}
			<path d={`M${pa[0]},${pa[1]} L${pb[0]},${pb[1]}`} stroke={HOL} strokeOpacity={0.72} strokeWidth={Math.max(0.8, W0 * 0.42)} strokeLinecap="round" /></g>; };
	const line = (k: string, d: string, w = 0.008, o = 0.5) => <path key={k} d={d} fill="none" stroke={BONE} strokeOpacity={o} strokeWidth={Math.max(1.2, w * ppm)} strokeLinecap="round" strokeLinejoin="round" />;
	const ell = (x: number, sC: number, a: number, b: number, n = 28) => 'M' + Array.from({length: n}, (_, i) => { const th = i / n * 2 * Math.PI; return S(x + a * Math.cos(th), sC + b * Math.sin(th)); }).join('L') + 'Z';
	const sides = [1, -1];
	/* soil stains (ochre-brown) and the decayed textile (soft dark) */
	const stains = Array.from({length: 16}, (_, i) => { const x = lerp(-0.8, 0.8, rnd(i, 81)), y = OY + (rnd(i, 82) - 0.5) * 0.36, d = blobOn(c, x, y, 0.05 + 0.1 * rnd(i, 83), i + 301, OZ - 0.002, 9, 0.7);
		return d ? <path key={i} d={d} fill={['#7A4E2A', '#6A4224', '#8A5A30'][i % 3]} opacity={0.22 + 0.2 * rnd(i, 84)} /> : null; });
	const cloth: [number, number, number][] = [[0.06, 0.0, 0.17], [0.24, 0.05, 0.15], [0.3, -0.07, 0.13], [0.55, 0.02, 0.12], [-0.33, -0.1, 0.08], [0.72, -0.05, 0.08]];
	return <g>
		<defs><filter id="ocT" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={Math.max(2, 0.02 * ppm)} /></filter>
			<filter id="ocS" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={Math.max(1.5, 0.012 * ppm)} /></filter></defs>
		<g filter="url(#ocS)">{stains}</g>
		{/* skull (outline only) and jaw */}
		<path d={ell(-0.72, 0, 0.092, 0.076)} fill={BONE} fillOpacity={0.14} stroke={BONE} strokeOpacity={0.55} strokeWidth={Math.max(1.4, 0.008 * ppm)} />
		{line('jaw', `M${S(-0.655, -0.052)} Q${S(-0.6, -0.03)} ${S(-0.6, 0)} Q${S(-0.6, 0.03)} ${S(-0.655, 0.052)}`, 0.009)}
		{/* spine: vertebrae as short rounded dashes, neck to sacrum */}
		{Array.from({length: 19}, (_, i) => { const x = lerp(-0.6, -0.04, i / 18), w = i < 5 ? 0.02 : 0.028; const a = proj(c, P(x - 0.009, 0)), b = proj(c, P(x + 0.009, 0));
			return <path key={`v${i}`} d={`M${a[0]},${a[1]} L${b[0]},${b[1]}`} stroke={BONE} strokeOpacity={0.42} strokeWidth={w * ppm} strokeLinecap="round" />; })}
		{/* clavicles and ribs (a few curved strokes each side) */}
		{sides.map((s) => line(`cl${s}`, `M${S(-0.565, s * 0.015)} Q${S(-0.58, s * 0.1)} ${S(-0.55, s * 0.16)}`, 0.011))}
		{sides.flatMap((s) => Array.from({length: 6}, (_, i) => { const x0 = -0.535 + i * 0.042, r = 0.115 + 0.02 * Math.sin(Math.PI * (i + 0.5) / 6);
			return line(`r${s}${i}`, `M${S(x0, s * 0.016)} Q${S(x0 - 0.02, s * r * 1.12)} ${S(x0 + 0.075, s * r * 0.95)}`, 0.007, 0.4 - 0.03 * i); }))}
		{/* pelvis: two wings and the sacrum */}
		{sides.map((s) => <path key={`p${s}`} d={`M${S(-0.03, s * 0.02)} C${S(-0.07, s * 0.1)} ${S(-0.02, s * 0.16)} ${S(0.05, s * 0.14)} C${S(0.1, s * 0.12)} ${S(0.11, s * 0.06)} ${S(0.07, s * 0.025)}`} fill={BONE} fillOpacity={0.1} stroke={BONE} strokeOpacity={0.48} strokeWidth={Math.max(1.3, 0.009 * ppm)} />)}
		{line('sac', `M${S(-0.035, -0.02)} L${S(0.06, 0)} L${S(-0.035, 0.02)}`, 0.008, 0.42)}
		{/* arms: humerus, the two forearm bones, a few hand bones */}
		{sides.flatMap((s) => [bone(`h${s}`, [-0.54, s * 0.165], [-0.27, s * 0.175], 0.024),
			bone(`ra${s}`, [-0.255, s * 0.168], [-0.03, s * 0.142], 0.012, 1.2), bone(`ul${s}`, [-0.25, s * 0.185], [-0.025, s * 0.162], 0.011, 1.2),
			...[0.132, 0.144, 0.156, 0.167].map((y, i) => line(`f${s}${i}`, `M${S(-0.01, s * y)} L${S(0.055 + 0.01 * Math.sin(i), s * (y - 0.006))}`, 0.006, 0.38))])}
		{/* legs: femur, kneecap, tibia and fibula, a few foot bones */}
		{sides.flatMap((s) => [bone(`fe${s}`, [0.04, s * 0.095], [0.42, s * 0.085], 0.03),
			<circle key={`k${s}`} cx={proj(c, P(0.44, s * 0.085))[0]} cy={proj(c, P(0.44, s * 0.085))[1]} r={0.022 * ppm} fill="none" stroke={BONE} strokeOpacity={0.45} strokeWidth={Math.max(1.2, 0.007 * ppm)} />,
			bone(`ti${s}`, [0.46, s * 0.08], [0.77, s * 0.072], 0.024), bone(`fi${s}`, [0.47, s * 0.108], [0.765, s * 0.098], 0.01, 1.2),
			...[0.055, 0.07, 0.085, 0.1].map((y, i) => line(`t${s}${i}`, `M${S(0.785, s * (0.07 + (y - 0.075) * 0.4))} L${S(0.85, s * y)}`, 0.006, 0.36))])}
		{/* the decayed textile, soft and dark, over the pelvis, thighs and chest */}
		<g filter="url(#ocT)">{cloth.map(([x, y, r], i) => { const d = blobOn(c, x, OY + y, r, i + 401, OZ + 0.01, 10, 0.6); return d ? <path key={i} d={d} fill="#1E0E09" opacity={0.5} /> : null; })}</g>
	</g>; };
const clampP = (p: [number, number, number]): [number, number, number] => [cl(p[0], 260, 1660), cl(p[1], 300, 860), p[2]];
const TagC: React.FC<{p: [number, number, number]; n: string; o: number}> = ({p, n, o}) => o <= 0.01 ? null : <g opacity={o}><circle cx={p[0]} cy={p[1]} r={34} fill="#120A06" opacity={0.6} /><circle cx={p[0]} cy={p[1]} r={30} fill="none" stroke={B.goldL} strokeWidth={3} />
	<text x={p[0]} y={p[1] + 18} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={50} fill={B.goldL}>{n}</text></g>;
const Planks: React.FC<{c: Cam; tc: ShaftTC; t: number}> = ({c, tc, t}) => { const z0 = WH, lift0 = seg(t, T_ROOF, T_ROOF + 0.5), ps = Array.from({length: 8}, (_, i) => { const ti = T_ROOF + 0.1 * (Math.abs(i - 3.5) - 0.5), e = sstep(seg(t, ti, ti + 0.85)), h = 0.6 * e, sl = (i < 4 ? -1 : 1) * 2.3 * e;
	const x0 = -1.6 + 0.4 * i + sl, x1 = x0 + 0.4, hn = h * 1.25, hf = h * 0.8, rot = h > 0 ? 0.03 * Math.sin(i * 2.3 + t * 3) * Math.min(1, h) : 0;
	return {i, h, d: poly(c, [[x0, -1.0, z0 + hn], [x1 + rot, -1.0, z0 + hn], [x1 + rot, 1.3, z0 + hf], [x0, 1.3, z0 + hf]]), side: poly(c, [[x0, -1.0, z0 + hn], [x1, -1.0, z0 + hn], [x1, -1.0, z0 + hn - 0.1], [x0, -1.0, z0 + hn - 0.1]])}; });
	const F = -8.8, fc = pj(tc, [0, 0.15, F]), dd = Math.max(2, dOf(tc, [0, 0.15, F])), rect = poly(c, [[-1.6, -1.0, z0], [1.6, -1.0, z0], [1.6, 1.3, z0], [-1.6, 1.3, z0]]), rect2 = poly(c, [[-1.62, -1.02, z0], [1.62, -1.02, z0], [1.62, 1.32, z0], [-1.62, 1.32, z0]]);
	return <g>{ps.map((p) => <g key={p.i}><path d={p.d} fill="#2A1A10" stroke="#140C06" strokeOpacity={0.6} strokeWidth={1.5} />{p.h > 0 && <path d={p.side} fill="#4A3220" />}</g>)}
		<g opacity={1 - lift0}><path d={rect} fill="#B8B4A6" opacity={0.12} /><path d={rect} fill="none" stroke="#8A6A44" strokeOpacity={0.6} strokeWidth={1.5} />
			{fc && <ellipse cx={fc[0]} cy={fc[1]} rx={130 * 8.8 / dd} ry={80 * 8.8 / dd} fill="url(#tbGlow)" />}<path d={rect2} fill="none" stroke="#FFB868" strokeOpacity={0.55} strokeWidth={2} /></g></g>; };

const defs = <defs>
	<radialGradient id="tbGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFB060" stopOpacity="0.55" /><stop offset="0.5" stopColor="#FF9A48" stopOpacity="0.2" /><stop offset="1" stopColor="#FF9040" stopOpacity="0" /></radialGradient>
	<radialGradient id="tbLampG" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFC878" stopOpacity="0.8" /><stop offset="0.4" stopColor="#FFA850" stopOpacity="0.25" /><stop offset="1" stopColor="#FF9040" stopOpacity="0" /></radialGradient>
	<filter id="tbN" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.5 4" /></filter>
	<filter id="tbM" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.4 2.2" /></filter>
	<filter id="tbSh" x="-20%" y="-300%" width="140%" height="700%"><feGaussianBlur stdDeviation="10" /></filter>
	<filter id="tbS" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.2" /></filter>
	<linearGradient id="cwk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#E8F4FF" stopOpacity="0" /><stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.9" /><stop offset="1" stopColor="#D8ECFF" stopOpacity="0" /></linearGradient>
</defs>;

export const Chamber53: React.FC<{t: number}> = ({t}) => {
	const tc = camC(t), c = toCam(tc), cl2: Cam = c, roofOn = t < T_ROOF, top = t >= T_TOP, planar = tc.p > 89.9 * Math.PI / 180;
	const {u1, u2} = lidAt(t), dl = drawn(t), wash = seg(t, 41.45, 43.0), hold = frameOf(t) >= frameOf(T_DRAW);
	const far = box(-RX - 0.12, RX + 0.12, RY, RY + 0.12, 0, WH), left = box(-RX - 0.12, -RX, -RY - 0.12, RY + 0.12, 0, WH), right = box(RX, RX + 0.12, -RY - 0.12, RY + 0.12, 0, WH), near = box(-RX - 0.12, RX + 0.12, -RY - 0.12, -RY, 0, 0.42);
	const planks = (y: number, n: number) => Array.from({length: n - 1}, (_, i) => { const z = lerp(0, WH, (i + 1) / n); return <path key={`${y}${i}`} d={poly(c, [[-RX, y, z], [RX, y, z]], false)} stroke="#120A06" strokeOpacity={0.55} strokeWidth={1.5} fill="none" />; });
	const d0 = proj(c, [0, 0, 0.9]), dist = Math.max(0.6, d0[2]), pr = (r: number) => c.f * r / dist;
	const lidDone = (u: number) => u > 0.85;
	const grip1 = (e: ReturnType<typeof lidEdges>, hx: number): V3 => [hx, e.Ny, e.Nh + 0.04];
	const e1 = lidEdges(u1, OUT.z, OUT.y, LEAN1), e2 = lidEdges(u2, INN.z, INN.y, LEAN2, 0.34, 0.22), o2 = 1 - 0.85 * sstep(seg(t, 38.0, 38.25)) * (1 - sstep(seg(t, 38.45, 38.8)));
	const act = lerp(0, 1, sstep(seg(t, 37.5, 37.8)));
	const gx = (side: number): V3 => { const a = grip1(e1, 1.06 * side), b = grip1(e2, 0.9 * side); return [lerp(a[0], b[0], act), lerp(a[1], b[1], act), lerp(a[2], b[2], act)]; };
	const dOp = (1 - seg(t, 38.2, 38.75)) * seg(t, 36.7, 37.1);
	const rightS = proj(c, gx(1))[0] > proj(c, gx(-1))[0] ? 1 : -1, stampDodge = sstep(seg(t, 37.15, 37.4)) * (1 - sstep(seg(t, 38.0, 38.4)));
	const digY = (side: number) => cl(gx(side)[1] - 0.12, -0.3, 0.62);
	const lampP = proj(c, [0.25, -0.15, 2.35]), skull = proj(c, [-0.72, OY, 0.05]), capO = sstep(seg(t, 38.6, 38.95)) * (1 - sstep(seg(t, 40.8, 41.15)));
	const liftU = sstep(seg(t, T_LIFT[0], T_LIFT[1]));   // the sword rises off the floor: the occupant falls out of focus and dims
	const sw = swordAt(t), ringO = 0.62 * sstep(seg(t, 34.4, 36.0));
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		{defs}
		<clipPath id="cInner"><path d={poly(c, [[-INN.x + INN.t, -INN.y + INN.t, INN.z], [INN.x - INN.t, -INN.y + INN.t, INN.z], [INN.x - INN.t, INN.y - INN.t, INN.z], [-INN.x + INN.t, INN.y - INN.t, INN.z]])} /></clipPath>
		<filter id="ocDof" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={0.01 + 4 * liftU} /></filter>
		<clipPath id="cFloor"><path d={poly(c, [[-INN.x + INN.t, -INN.y + INN.t, OZ], [INN.x - INN.t, -INN.y + INN.t, OZ], [INN.x - INN.t, INN.y - INN.t, OZ], [-INN.x + INN.t, INN.y - INN.t, OZ]])} /></clipPath>
		<clipPath id="cOpen"><path d={poly(c, [[-RX, -1.0, WH], [RX, -1.0, WH], [RX, 1.3, WH], [-RX, 1.3, WH]])} /></clipPath>
		<Shaft c={tc} dW={1} t={t} roof={roofOn} />
		{roofOn && <PitLamps c={tc} t={t} o={1} />}
		{ringO > 0.01 && <g>
			<path d={poly(c, [[-1.9, -1.5, WH], [1.9, -1.5, WH], [1.9, 1.5, WH], [-1.9, 1.5, WH]]) + poly(c, [[-RX, -1.0, WH], [RX, -1.0, WH], [RX, 1.3, WH], [-RX, 1.3, WH]])} fill="#140A06" fillRule="evenodd" opacity={ringO} />
			{Array.from({length: 46}, (_, i) => { const side = rnd(i, 5), x = side < 0.5 ? lerp(-1.85, 1.85, rnd(i, 6)) : (rnd(i, 7) < 0.5 ? lerp(-1.85, -1.65, rnd(i, 6)) : lerp(1.65, 1.85, rnd(i, 6))), y = side < 0.5 ? (rnd(i, 8) < 0.5 ? lerp(-1.47, -1.05, rnd(i, 9)) : lerp(1.33, 1.47, rnd(i, 9))) : lerp(-1.4, 1.4, rnd(i, 9)), d = blobOn(c, x, y, 0.05 + 0.1 * rnd(i, 10), i + 77, WH, 8, 0.7);
				return d ? <path key={i} d={d} fill={i % 3 ? '#6E6A5C' : '#3A2E22'} opacity={ringO * 0.55} /> : null; })}
		</g>}
		{/* the opened chamber: seen through the roof opening while the camera is above the roof plane */}
		{!roofOn && <g clipPath={c.p[2] > WH + 0.01 ? 'url(#cOpen)' : undefined}>
			<path d={poly(c, [[-RX, -RY, 0], [RX, -RY, 0], [RX, RY, 0], [-RX, RY, 0]])} fill="#2E2218" />
			<path d={poly(c, far.front)} fill="#4A3426" />{planks(RY - 0.001, 6)}
			<path d={poly(c, left.right)} fill="#3A281C" /><path d={poly(c, right.left)} fill="#32221A" />
			<Pool id="c1" x={d0[0]} y={d0[1]} rx={pr(2.1)} ry={pr(1.2)} a={roofOn ? 0.2 : 0.42} col="#FFB060" />
			{!lidDone(u1) && null}
			{lidDone(u1) && <Lid c={c} u={u1} rest={OUT.z} hx={1.06} hy={OUT.y} L={LEAN1} id="lid1" />}
			{lidDone(u2) && <Lid c={c} u={u2} rest={INN.z} hx={0.9} hy={INN.y} L={LEAN2} id="lid2" o={o2} lift={0.34} hmp={0.22} />}
			<OpenCoffin c={c} x={OUT.x} y={OUT.y} z={OUT.z} t={OUT.t} id="outer" inner="#1E0C08" />
			<OpenCoffin c={c} x={INN.x} y={INN.y} z={INN.z} t={INN.t} id="inner" inner="#46201A" />
			{/* the occupant on the inner floor: clipped to the floor (and to the coffin's rim while the lens is above it) */}
			<g clipPath={c.p[2] > INN.z + 0.02 ? 'url(#cInner)' : undefined}><g clipPath="url(#cFloor)" opacity={0.62 * (1 - 0.4 * liftU)} filter={liftU > 0.02 ? 'url(#ocDof)' : undefined}><Occupant c={c} /></g></g>
			<g clipPath="url(#cInner)">
				{!top && <><Sheath c={c} t={t} dl={0} wash={0} /><HiltLite c={c} t={t} /></>}
			</g>
			{top && <PlanSword t={t} dl={dl} wash={wash} c={c} hold={hold} />}
			{!lidDone(u2) && <Lid c={c} u={u2} rest={INN.z} hx={0.9} hy={INN.y} L={LEAN2} id="lid2" o={o2} lift={0.34} hmp={0.22} />}
			{!lidDone(u1) && <Lid c={c} u={u1} rest={OUT.z} hx={1.06} hy={OUT.y} L={LEAN1} id="lid1" />}
			<g opacity={dOp}>{t > T_ROOF + 0.3 && [-1, 1].map((s) => <g key={s} transform={`translate(${s === rightS ? -120 * stampDodge : 0} 0)`}><Digger c={c} xw={s * 1.42} yw={digY(s)} dir={(s > 0 ? -1 : 1) as 1 | -1} grip={gx(s)} id={`dig${s}`} /></g>)}</g>
			<path d={poly(c, near.top)} fill="#4A3424" /><path d={poly(c, near.front)} fill="#2A1C14" />
			<path d={poly(c, left.top)} fill="#4A3424" /><path d={poly(c, right.top)} fill="#4A3424" /><path d={poly(c, far.top)} fill="#4A3424" />
		</g>}
		{!roofOn && capO > 0.01 && skull[2] > 0.3 && <text x={skull[0]} y={skull[1] - 0.2 * c.f / skull[2] - 6} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={28} fill="#E8C9A0" opacity={capO * 0.9} style={{paintOrder: 'stroke'}} stroke="#140A06" strokeWidth={5}>墓主人</text>}
		{!roofOn && <Planks c={c} tc={tc} t={t} />}
		{!roofOn && t < T_ROOF + 1.0 && <PitLamps c={tc} t={t} o={1} lift={[Math.max(0, 6 * (t - T_ROOF) ** 2), Math.max(0, 6 * (t - T_ROOF - 0.35) ** 2)]} />}
		{lampP[2] > 0.4 && lampP[1] > -200 && t > T_ROOF && t < 38.9 && <g><Pool id="cl" x={lampP[0]} y={lampP[1]} rx={150} ry={130} a={0.5 * seg(t, T_ROOF, T_ROOF + 0.6)} col="#FFD490" /><ellipse cx={lampP[0]} cy={lampP[1]} rx={15} ry={22} fill="#FFE8B8" opacity={0.95 * seg(t, T_ROOF, T_ROOF + 0.6)} /></g>}
		{[[-0.35, e1, 1, T_LID1, 38.6, 38.9], [0.35, e2, 2, T_LID2, 38.9, 39.2]].map(([x, e, n, t0, f0, f1]) => { const q = proj(c, [x as number, (e as ReturnType<typeof lidEdges>).Fy, (e as ReturnType<typeof lidEdges>).Fh + 0.2]), dist = Math.max(0, 300 - q[1], q[1] - 860, 260 - q[0], q[0] - 1660);
			return <TagC key={n as number} p={clampP(q)} n={String(n)} o={seg(t, t0 as number, (t0 as number) + 0.01) * (1 - seg(t, f0 as number, f1 as number)) * (1 - cl(dist / 120))} />; })}
		{roofOn && <Snow c={tc} t={t} g={1} />}
		<Vignette id="cC" a={0.6} />
		{cl2 && sw && null}
	</svg>; };

/* ---------- plan regime (camera straight above): the sword in 2-D on its plane, the sheath, the hands, the water ---------- */
const PlanSword: React.FC<{t: number; dl: number; wash: number; c: Cam; hold: boolean}> = ({t, dl, wash, c, hold}) => { const k = planK(t), [px, py] = planPos(t, 0, 0);
	const mouth = SW.guardA + dl, gl = planPos(t, mouth + 4, 0), gr = planPos(t, 4.6, 0);
	const enter = sstep(seg(t, 40.7, 41.3)), slide = (1 - enter) * 520, exR = sstep5(seg(t, 43.8, 46.0)), exL = sstep5(seg(t, 44.1, 47.0));
	const flash = seg(t, T_DRAW, T_DRAW + 0.9);
	const hw = sheathHW(mouth + 4, dl) * k;
	const [hx, hy] = planPos(t, 28, 0), hp = seg(t, 38.2, 39.3) * (1 - seg(t, 44.0, 46.0));
	return <g>
		{hp > 0.01 && <Pool id="hero" x={hx} y={hy} rx={Math.min(1500, 62 * k)} ry={Math.min(700, 26 * k)} a={0.42 * hp} col="#FFB868" />}
		<ellipse cx={(px + planPos(t, SW.L, 0)[0]) / 2} cy={py + 20} rx={SW.L * k / 2 + 10} ry={Math.max(10, 2.6 * k)} fill="#000" opacity={0.35 * (1 - sstep5(seg(t, T_LIFT[0], T_LIFT[1]))) * sstep(seg(t, 38.935, 39.4))} filter="url(#tbSh)" />
		<BladeClip t={t} />
		<Sword x={px} y={py} k={k} rot={-90} id="sw" spec={0.5} marks={false} />
		<Marks t={t} />
		{hold && flash < 1 && <g><rect x={planPos(t, SW.L, 0)[0] - 0 } y={py - 4 * k} width={1} height={1} fill="none" />
			<rect x={lerp(planPos(t, mouth, 0)[0], planPos(t, SW.L, 0)[0], flash) - 90} y={py - 2.2 * k} width={180} height={4.4 * k} fill="url(#cwk)" opacity={0.8 * (1 - flash)} /></g>}
		<Sheath c={c} t={t} dl={dl} wash={wash} />
		<Water t={t} dl={dl} />
		{enter > 0.01 && t < 47.3 && <g>
			<g transform={`translate(0 ${exL * 1000})`}><Glove x={gl[0]} y={gl[1] + slide} w={8 * k} bar={hw} sleeveTo={[gl[0] - 12 * k, H + 160]} id="gl" /></g>
			<g transform={`translate(${exR * 320} ${exR * 1000})`}><Glove x={gr[0]} y={gr[1] + slide} w={7 * k} bar={1.9 * k} sleeveTo={[gr[0] + 5 * k, H + 160]} id="gr" /></g>
		</g>}
		<Letters t={t} />
		<Reading t={t} />
	</g>; };
void mix; void lerp;
