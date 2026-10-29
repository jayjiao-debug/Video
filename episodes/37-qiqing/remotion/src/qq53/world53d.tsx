import React from 'react';
import {W, H, rnd, lerp, cl, seg, SANS} from '../qq50/kit50';
import {B, Pool} from '../qq50/styleB';
import {Cam, V3, P2, proj, poly, mix, Tag, lookAt} from './parts53';
import {LB, SW, bladeHW, BZ, GLS} from './props53';
import {frameOf} from './master53';
/* ep53 · TakeD, the world of legs 14–16 (81.954 → ~102 s): ONE metric world (metres), cut by the section plane y = 0
   (everything with y < 0 is cut away, the camera lives on that open side). z = 0 is the ground at the top of the pit fill AND
   the museum floor; the sword's tomb is at z = −10.4, the museum case stands directly above it (case53d).
   KF12's geometry: 椁 5.0 × 1.9 m, outer coffin 2.64 × 1.04, inner coffin 2.24 × 0.86, the sword (55.6 cm) in its black lacquer
   sheath on the inner floor. Everything here is a pure function of (camera, t). */
export const SX0 = -0.27, SYA = 0.15, SZ = -10.445;
/** the layers close one per beat from DA(40) (MUSIC_NOTES): the times of the hits */
export const LAY = {sheath: 91.0112, inner: 91.5773, outer: 92.1433, guo: 92.7094, bai: 93.2754, hang: 93.8415};
const hitT = (tb: number) => frameOf(tb) / 30;
/** a drop that is COMPLETE on the frame of its beat: 0 → 1, gravity-like */
export const drop = (t: number, tb: number, dur = 0.34) => { const tf = hitT(tb), u = seg(t, tf - dur, tf); return u; };
const R = (x0: number, x1: number, z0: number, z1: number, y = 0): V3[] => [[x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0]];
export const swAt = (a: number, w: number, dz = 0, draw = 0): V3 => [SX0 - a / 100 + draw / 100, SYA + w / 100, SZ + dz / 100];
const pp = (c: Cam, q: V3): P2 => { const p = proj(c, q); return [p[0], p[1]]; };

/* ---------- the open box (cut by y = 0) ---------- */
type BoxP = {x: number; z0: number; z1: number; yb: number; t: number; ring: string; inside: string; floor: string; edge?: string; line?: string};
const Box: React.FC<BoxP & {c: Cam}> = ({c, x, z0, z1, yb, t, ring, inside, floor, edge = '#C89A60', line}) => { const xi = x - t, zi0 = z0 + t;
	const wall = (xa: number, xb: number, ya: number, yb2: number): V3[] => [[xa, ya, z1], [xb, ya, z1], [xb, yb2, z1], [xa, yb2, z1]];
	return <g>
		<path d={poly(c, R(-xi, xi, zi0, z1, yb))} fill={inside} />
		<path d={poly(c, [[-xi, 0, z1], [-xi, yb, z1], [-xi, yb, zi0], [-xi, 0, zi0]])} fill={mix(inside, '#000000', 0.12)} />
		<path d={poly(c, [[xi, 0, z1], [xi, yb, z1], [xi, yb, zi0], [xi, 0, zi0]])} fill={mix(inside, '#000000', 0.2)} />
		<path d={poly(c, [[-xi, 0, zi0], [xi, 0, zi0], [xi, yb, zi0], [-xi, yb, zi0]])} fill={floor} />
		<path d={poly(c, R(-x, x, z0, z1)) + poly(c, R(-xi, xi, zi0, z1))} fill={ring} fillRule="evenodd" />
		{[wall(-x, -xi, 0, yb + t), wall(xi, x, 0, yb + t), wall(-xi, xi, yb, yb + t)].map((q, i) => <path key={i} d={poly(c, q)} fill={mix(ring, '#FFFFFF', 0.06)} stroke={edge} strokeOpacity={0.5} strokeWidth={1.3} />)}
		{line && <path d={poly(c, R(-x + t * 0.45, x - t * 0.45, z0 + t * 0.45, z1 - t * 0.2))} fill="none" stroke={line} strokeWidth={1.6} strokeOpacity={0.75} />}
		<path d={poly(c, R(-x, x, z0, z1))} fill="none" stroke={edge} strokeOpacity={0.45} strokeWidth={1.4} />
	</g>; };
/** a lid / roof slab lying on a box: x half-length, y 0..yb, z0..z1; dz lifts it (a closing drop) */
const Slab: React.FC<{c: Cam; x: number; yb: number; z0: number; z1: number; dz: number; col: string; line?: string; o?: number}> = ({c, x, yb, z0, z1, dz, col, line, o = 1}) => {
	const a = z0 + dz, b = z1 + dz;
	return <g opacity={o}>
		<path d={poly(c, [[x, 0, b], [x, yb, b], [x, yb, a], [x, 0, a]])} fill={mix(col, '#000000', 0.25)} />
		<path d={poly(c, [[-x, 0, b], [x, 0, b], [x, yb, b], [-x, yb, b]])} fill={mix(col, '#FFFFFF', 0.05)} />
		<path d={poly(c, R(-x, x, a, b))} fill={col} stroke="#C89A60" strokeOpacity={0.45} strokeWidth={1.3} />
		{line && <path d={poly(c, [[-x + 0.08, yb * 0.55, b], [x - 0.08, yb * 0.55, b]], false)} stroke={line} strokeWidth={1.6} strokeOpacity={0.8} fill="none" />}
	</g>; };

/* ---------- the sword in its sheath (the sheath drawn as an x-ray shell) ---------- */
const SwordSheath: React.FC<{c: Cam; draw: number; lit: number; plank: number; plankDz: number}> = ({c, draw, lit, plank, plankDz}) => { const n = 40;
	const blade = [...Array.from({length: n + 1}, (_, i) => { const s = LB * i / n; return swAt(SW.bladeA + s, bladeHW(s), 0, draw); }), ...Array.from({length: n + 1}, (_, i) => { const s = LB * (n - i) / n; return swAt(SW.bladeA + s, -bladeHW(s), 0, draw); })];
	const shAt = (a: number, w: number, dz = 0.4) => swAt(a, w, dz);
	const sheath = [...Array.from({length: n + 1}, (_, i) => { const a = lerp(SW.bladeA + 0.6, SW.L + 1.6, i / n), s = Math.min(LB - 0.4, a - SW.bladeA); return shAt(a, i === n ? 0.5 : bladeHW(s) + 0.7); }),
		...Array.from({length: n + 1}, (_, i) => { const a = lerp(SW.L + 1.6, SW.bladeA + 0.6, i / n), s = Math.min(LB - 0.4, a - SW.bladeA); return shAt(a, i === 0 ? -0.5 : -(bladeHW(s) + 0.7)); })];
	const guard = [swAt(SW.gripA, -2.78, 0.6, draw), swAt(SW.gripA, 2.78, 0.6, draw), swAt(SW.guardA, 2.6, 0.6, draw), swAt(SW.guardA, -2.6, 0.6, draw)];
	const grip = [swAt(SW.pomA, -0.86, 0.5, draw), swAt(SW.pomA, 0.86, 0.5, draw), swAt(SW.gripA, 0.86, 0.5, draw), swAt(SW.gripA, -0.86, 0.5, draw)];
	const pom = [swAt(0, -1.86, 0.8, draw), swAt(0, 1.86, 0.8, draw), swAt(SW.pomA, 1.86, 0.8, draw), swAt(SW.pomA, -1.86, 0.8, draw)];
	const a0 = pp(c, swAt(0, 0, 0, draw)), a1 = pp(c, swAt(SW.L, 0, 0, draw)), mid: P2 = [(a0[0] + a1[0]) / 2, (a0[1] + a1[1]) / 2];
	const span = Math.hypot(a1[0] - a0[0], a1[1] - a0[1]);
	const gl = Math.max(4, Math.min(14, span * 0.03));
	return <g>
		<defs><filter id="w53gl" x="-60%" y="-300%" width="220%" height="700%"><feGaussianBlur stdDeviation={gl} /></filter></defs>
		<Pool id="w53sw" x={mid[0]} y={mid[1]} rx={Math.max(120, span * 0.62)} ry={Math.max(50, span * 0.2)} a={0.55 * lit} col="#FFC870" />
		<path d={poly(c, blade)} fill="#FFD68A" filter="url(#w53gl)" opacity={0.95 * lit} />
		<path d={poly(c, blade)} fill="#F2C878" stroke="#FFF3CF" strokeWidth={1.2} />
		<path d={poly(c, [swAt(SW.bladeA + 0.5, 0, 0.1, draw), swAt(SW.L - 1.2, 0, 0.1, draw)], false)} stroke="#FFF8E0" strokeWidth={1.4} fill="none" />
		<path d={poly(c, grip)} fill={BZ.mid} /><path d={poly(c, pom)} fill={BZ.body} stroke={BZ.line} strokeWidth={1} />
		<path d={poly(c, guard)} fill={GLS.body} stroke={BZ.lit} strokeWidth={1.2} />
		<path d={poly(c, sheath)} fill="#080404" opacity={0.5 + 0.35 * plank} />
		<path d={poly(c, sheath)} fill="none" stroke="#8A6650" strokeWidth={1.6} strokeOpacity={0.85} />
		<path d={poly(c, sheath.slice(4, n - 3), false)} fill="none" stroke="#B8432A" strokeWidth={1.2} strokeOpacity={0.6} transform="translate(0,-2)" />
		{plank > 0 && plankDz > 0.001 && <path d={poly(c, sheath.map((q) => [q[0], q[1], q[2] + plankDz] as V3))} fill="#0A0505" stroke="#B8432A" strokeWidth={1.2} strokeOpacity={0.7} />}
	</g>; };
/** one of the tomb's other swords, lying flat on the chamber floor (E1): lit = 0..1 */
const OtherSword: React.FC<{c: Cam; x0: number; y: number; ang: number; lit: number; id: number}> = ({c, x0, y, ang, lit, id}) => {
	const L = 0.7, z = -10.58, ca = Math.cos(ang), sa = Math.sin(ang), at = (a: number, w: number): V3 => [x0 + ca * a - sa * w, y + sa * a + ca * w, z];
	const n = 12, blade = [...Array.from({length: n + 1}, (_, i) => at(0.05 + L * i / n, 0.045 * (1 - Math.pow(i / n, 3)))), ...Array.from({length: n + 1}, (_, i) => at(0.05 + L * (n - i) / n, -0.045 * (1 - Math.pow((n - i) / n, 3))))];
	const a0 = pp(c, at(0, 0)), a1 = pp(c, at(L, 0)), mid: P2 = [(a0[0] + a1[0]) / 2, (a0[1] + a1[1]) / 2], span = Math.hypot(a1[0] - a0[0], a1[1] - a0[1]);
	if (lit <= 0.001) return <path d={poly(c, blade)} fill="#2A1C12" opacity={0.7} />;
	return <g>
		<Pool id={`w53o${id}`} x={mid[0]} y={mid[1]} rx={span * 0.75} ry={span * 0.4} a={0.6 * lit} col="#FFC870" />
		<path d={poly(c, blade)} fill={mix('#2A1C12', '#E8BC66', 0.85 * lit)} stroke={mix('#2A1C12', '#FFF3CF', lit)} strokeWidth={1.1} />
		<path d={poly(c, [at(0.05, 0), at(0.05 + L, 0)], false)} stroke="#FFF3CF" strokeOpacity={0.7 * lit} strokeWidth={1.2} fill="none" />
		<path d={poly(c, [at(-0.02, -0.038), at(-0.02, 0.038), at(0.06, 0.038), at(0.06, -0.038)])} fill={mix('#2A1C12', '#4A8CD8', 0.7 * lit)} />
		<path d={poly(c, [at(-0.12, -0.012), at(-0.12, 0.012), at(-0.02, 0.012), at(-0.02, -0.012)])} fill={mix('#2A1C12', BZ.mid, lit)} />
	</g>; };
export const OTHERS: {x0: number; y: number; ang: number; tb: number}[] = [{x0: 1.42, y: 0.18, ang: 0.0, tb: 86.483}, {x0: 1.45, y: 0.62, ang: 0.0, tb: 87.615}, {x0: -2.05, y: 0.35, ang: 0.0, tb: 88.747}];

/* ---------- the pit, the chamber, the closing layers ---------- */
const FILL_X = 3.5, ZF0 = -11.3, ZCLAY = -8.2, ZY = -7.0;
const mot = ['#8A6E40', '#6E6A5C', '#7A4A30', '#9A8458', '#4A3A28'];
/** fill heights: the 白膏泥 level rises to −8.2 and the 夯土 level to 0, each ending ON its beat */
export const hClay = (t: number) => { const u = drop(t, LAY.bai, 0.46); return lerp(ZF0, ZCLAY, 1 - Math.pow(1 - u, 2.2)) * (t >= 0 ? 1 : 1); };
export const hRam = (t: number) => { const u = drop(t, LAY.hang, 0.5); return lerp(ZCLAY, 0, 1 - Math.pow(1 - u, 2.2)); };
export const Pit: React.FC<{c: Cam; t: number}> = ({c, t}) => { const hc = t < LAY.bai - 0.5 ? ZF0 : hClay(t), hr = t < LAY.hang - 0.55 ? ZCLAY : hRam(t), clayOn = hc > ZF0 + 0.001, ramOn = hr > ZCLAY + 0.001;
	const pt = (x: number, z: number) => pp(c, [x, 0, z]);
	return <g>
		<defs><linearGradient id="w53wc" gradientUnits="userSpaceOnUse" x1={0} y1={pt(0, ZCLAY)[1]} x2={0} y2={pt(0, ZF0)[1]}><stop offset="0" stopColor="#9E9A8B" /><stop offset="1" stopColor="#77736A" /></linearGradient></defs>
		{/* natural soil: the cut face, dark; the pit's void in it */}
		<path d={poly(c, R(-60, 60, -60, 0))} fill="#241A13" />
		{[-2.6, -4.3, -5.9, -7.6, -9.2, -10.8, -12.6, -14.8].map((z, i) => <g key={i}>{[[-30, -3.5], [3.5, 30]].map(([a, b], k) => <path key={k} d={poly(c, Array.from({length: 9}, (_, j) => [lerp(a, b, j / 8), 0, z + 0.08 * Math.sin(j * 1.7 + i)] as V3), false)} stroke="#3A2A1E" strokeWidth={2} fill="none" />)}</g>)}
		<path d={poly(c, R(-FILL_X, FILL_X, ZF0, 0))} fill="#0A0605" />
		{clayOn && <path d={poly(c, R(-FILL_X, FILL_X, ZF0, hc))} fill="url(#w53wc)" />}
		{clayOn && Array.from({length: 90}, (_, i) => { const z = lerp(-11.25, -8.25, rnd(i, 82)); if (z > hc) return null; const [sx, sy] = pt(lerp(-3.45, 3.45, rnd(i, 81)), z); return <circle key={i} cx={sx} cy={sy} r={1.5 + 2.5 * rnd(i, 83)} fill={rnd(i, 84) > 0.5 ? '#B4B0A0' : '#68645A'} opacity={0.3} />; })}
		{ramOn && <>
			<path d={poly(c, R(-FILL_X, FILL_X, ZCLAY, Math.min(hr, ZY)))} fill="#434C4B" />
			{hr > ZY && <path d={poly(c, R(-FILL_X, FILL_X, ZY, hr))} fill="#54402A" />}
			{Array.from({length: 150}, (_, i) => { const z = lerp(ZY, 0, rnd(i, 12)); if (z > hr) return null; const [sx, sy] = pt(lerp(-3.45, 3.45, rnd(i, 11)), z), r = 4 + 9 * rnd(i, 13); return <ellipse key={i} cx={sx} cy={sy} rx={r} ry={r * 0.6} fill={mot[i % 5]} opacity={0.4} />; })}
			{Array.from({length: 28}, (_, i) => -ZY - i * 0.25 - 0.25).map((zz) => { const z = -zz + 0; return z > hr || z < ZY ? null : <path key={zz} d={poly(c, [[-FILL_X, 0, z], [FILL_X, 0, z]], false)} stroke="#1E140C" strokeOpacity={0.4} strokeWidth={1.2} fill="none" />; })}
		</>}
		{clayOn && <path d={poly(c, [[-FILL_X, 0, Math.min(hc, ZCLAY)], [FILL_X, 0, Math.min(hc, ZCLAY)]], false)} stroke="#EDE6D2" strokeOpacity={0.7 * seg(hc, ZCLAY - 0.4, ZCLAY)} strokeWidth={2.4} fill="none" />}
		{[-FILL_X, FILL_X].map((x) => <path key={x} d={poly(c, [[x, 0, 0], [x, 0, ZF0]], false)} stroke="#140C08" strokeWidth={3} strokeOpacity={0.8} fill="none" />)}
	</g>; };
export const Chamber: React.FC<{c: Cam; t: number; draw: number; lit: number}> = ({c, t, draw, lit}) => {
	const dIn = 0.9 * (1 - Math.pow(drop(t, LAY.inner), 2)), dOut = 0.9 * (1 - Math.pow(drop(t, LAY.outer), 2)), dGuo = 1.1 * (1 - Math.pow(drop(t, LAY.guo), 2)), dSh = 0.18 * (1 - Math.pow(drop(t, LAY.sheath, 0.3), 2));
	const lidIn = t >= LAY.inner - 0.34, lidOut = t >= LAY.outer - 0.34, roof = t >= LAY.guo - 0.34, plank = t >= LAY.sheath - 0.3 ? 1 : 0;
	return <g>
		<Box c={c} x={2.5} z0={-10.8} z1={-8.9} yb={1.3} t={0.18} ring="#56402E" inside="#2A1D14" floor="#3A2A1E" />
		{OTHERS.map((o, i) => <OtherSword key={i} c={c} x0={o.x0} y={o.y} ang={o.ang} lit={frameOf(t) >= frameOf(o.tb) ? 1 - 0.25 * seg(t, o.tb, o.tb + 3) : 0} id={i} />)}
		<Box c={c} x={1.32} z0={-10.62} z1={-9.58} yb={0.44} t={0.08} ring="#120A08" inside="#1A0E0B" floor="#24150F" line="#7A2A1C" />
		<Box c={c} x={1.12} z0={-10.54} z1={-9.68} yb={0.31} t={0.07} ring="#160C0A" inside="#3A140D" floor="#2E100B" line="#8A3020" />
		<SwordSheath c={c} draw={draw} lit={lit} plank={plank} plankDz={dSh} />
		{lidIn && <Slab c={c} x={1.12} yb={0.38} z0={-9.68} z1={-9.6} dz={dIn} col="#1A0E0B" line="#8A3020" />}
		{lidOut && <Slab c={c} x={1.32} yb={0.52} z0={-9.58} z1={-9.48} dz={dOut} col="#140A08" line="#7A2A1C" />}
		{roof && <Slab c={c} x={2.5} yb={1.48} z0={-8.9} z1={-8.72} dz={dGuo} col="#56402E" />}
	</g>; };

/* ---------- air: dots that fall through the fill and bounce off the white clay; two get through to the blade ---------- */
export const AIR_T0 = 93.7;
const LEAKS: {path: V3[]; t0: number}[] = [
	{path: [[-0.75, 0, -4.2], [-0.72, 0, -8.0], [-0.68, 0, -8.6], [-0.58, 0, -9.2], [-0.62, 0.05, -9.85], [-0.55, SYA, -10.43]], t0: 94.0},
	{path: [[-0.2, 0, -3.4], [-0.15, 0, -8.0], [-0.1, 0, -8.55], [-0.2, 0, -9.3], [-0.32, 0.06, -9.95], [-0.4, SYA, -10.43]], t0: 94.45}];
const pathAt = (path: V3[], u: number): V3 => { const segs = path.slice(1).map((q, i) => Math.hypot(q[0] - path[i][0], q[2] - path[i][2])), tot = segs.reduce((a, b) => a + b, 0); let d = u * tot;
	for (let i = 0; i < segs.length; i++) { if (d <= segs[i] || i === segs.length - 1) { const k = cl(d / segs[i]); return [lerp(path[i][0], path[i + 1][0], k), lerp(path[i][1], path[i + 1][1], k), lerp(path[i][2], path[i + 1][2], k)]; } d -= segs[i]; }
	return path[path.length - 1]; };
export const Air: React.FC<{c: Cam; t: number}> = ({c, t}) => { if (t < AIR_T0) return null;
	const hr = hRam(t), n = 22;
	return <g>
		{Array.from({length: n}, (_, i) => { const xw = lerp(-3.2, 2.9, (i + 0.5) / n + (rnd(i, 61) - 0.5) * 0.04), per = 1.5 + 0.9 * rnd(i, 62), s = ((t - AIR_T0) / per + rnd(i, 63)) % 1, zTop = Math.min(hr, -2.4) - 0.2 - 1.0 * rnd(i, 64), fall = 0.62;
			let q: V3, a = 1, tail: V3 | null = null;
			if (s < fall) { const u = s / fall; q = [xw + 0.05 * Math.sin(u * 5 + i), 0, lerp(zTop, ZCLAY + 0.03, u * u)]; tail = [q[0], 0, q[2] + 0.22 * Math.min(1, u * 3)]; }
			else { const u = (s - fall) / (1 - fall); q = [xw + 0.3 * u + 0.06, 0, ZCLAY + 0.03 + 0.55 * Math.sin(Math.PI * Math.min(1, u * 0.9)) * (1 - u * 0.4)]; a = 1 - u * u; }
			if (q[2] > hr - 0.05) return null;
			const [sx, sy] = pp(c, q), r = Math.max(2.2, 5.5 * 1380 / (6.0 * 1380) * 3.2), t2 = tail ? pp(c, tail) : null;
			return <g key={i} opacity={0.9 * a}>{t2 && <path d={`M${t2[0]},${t2[1]} L${sx},${sy}`} stroke="#D8ECF2" strokeOpacity={0.3} strokeWidth={1.6} />}
				<circle cx={sx} cy={sy} r={r} fill="#E6F4F8" />
				{s >= fall && s < fall + 0.1 && <circle cx={sx - 4} cy={sy + 3} r={7} fill="none" stroke="#D8ECF2" strokeOpacity={0.5} strokeWidth={1.4} />}</g>; })}
		{LEAKS.map((L, i) => { const u = seg(t, L.t0, L.t0 + 1.25), q = pathAt(L.path, u), end = pp(c, L.path[L.path.length - 1]);
			if (t < L.t0) return null;
			const trail = Array.from({length: 12}, (_, k) => pathAt(L.path, u * k / 11)).map((qq) => pp(c, qq));
			return <g key={`l${i}`}>
				<path d={'M' + trail.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L')} fill="none" stroke="#E6F4F8" strokeWidth={2} strokeOpacity={0.6} strokeDasharray="5 6" />
				{u < 1 && <circle cx={pp(c, q)[0]} cy={pp(c, q)[1]} r={5.5} fill="#E6F4F8" />}
				{u >= 1 && <><circle cx={end[0]} cy={end[1]} r={4.2} fill="#7E9A5A" stroke="#E6F4F8" strokeWidth={1.4} /><circle cx={end[0]} cy={end[1]} r={13 + 14 * (1 - Math.exp(-(t - L.t0 - 1.25) * 3))} fill="none" stroke="#E6F4F8" strokeOpacity={0.6 * Math.exp(-(t - L.t0 - 1.25) * 1.5)} strokeWidth={1.4} /></>}
			</g>; })}
	</g>; };

/* ---------- labels: each layer is named as it closes ---------- */
const lbl = (t: number, tb: number) => (frameOf(t) >= frameOf(tb) ? 1 : 0);
export const Labels: React.FC<{c: Cam; t: number}> = ({c, t}) => { if (t < LAY.sheath || t > 95.0) return null;
	const fo = 1 - seg(t, 94.5, 95.0), lx = 1500, dy = 52, L = (q: V3) => pp(c, q);
	const o1 = L([-1.32 + 0.04, 0, -9.85]), o2 = L([-1.12 + 0.035, 0, -10.05]);
	return <g opacity={fo}>
		{lbl(t, LAY.bai) > 0 && <Tag id="w53a" x={lx} y={424 + dy} s="白膏泥" fs={52} col={B.cream} to={L([-3.05, 0, -8.55])} />}
		{lbl(t, LAY.guo) > 0 && <Tag id="w53b" x={lx} y={560 + dy} s="木椁" fs={52} col={B.cream} to={L([-2.41, 0, -9.5])} />}
		{lbl(t, LAY.inner) > 0 && <Tag id="w53c" x={lx} y={696 + dy} s="两层棺" fs={52} col={B.cream} to={o1} />}
		{lbl(t, LAY.outer) > 0 && <><path d={`M${o2[0]},${o2[1]} L${lx - 52 * 0.35},${696 + dy - 52 * 0.36}`} fill="none" stroke={B.lac} strokeWidth={5} strokeOpacity={0.6} /><path d={`M${o2[0]},${o2[1]} L${lx - 52 * 0.35},${696 + dy - 52 * 0.36}`} fill="none" stroke={B.goldL} strokeWidth={2.2} /><circle cx={o2[0]} cy={o2[1]} r={5} fill={B.goldL} stroke={B.lac} strokeWidth={1.5} /></>}
		{lbl(t, LAY.sheath) > 0 && <Tag id="w53d" x={lx} y={832 + dy} s="剑鞘" fs={52} col={B.goldL} to={L(swAt(SW.L - 4, -bladeHW(LB - 4) - 1.2, 0.6))} />}
		{lbl(t, LAY.hang) > 0 && <Tag id="w53e" x={lx} y={288 + dy} s="夯土" fs={52} col={B.cream} to={L([-3.0, 0, -5.0])} />}
	</g>; };
export {lookAt, R, W, H, SANS};
