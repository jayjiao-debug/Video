import React from 'react';
import {W, H, rnd, lerp, cl, seg, SANS} from '../qq50/kit50';
import {B, Pool} from '../qq50/styleB';
import {Cam, V3, P2, proj, poly, mix, Tag, lookAt, blobOn} from './parts53';
import {LB, SW, bladeHW, BZ} from './props53';
import {Sword3D, SwordPose} from './sword3d';
import {BronzeKnife53} from './knife53x';
import {RED_LINE} from './parts53c';
import {frameOf} from './master53';
import {sstep} from './cam53';
/* ep53 · TakeD (v2) / TakeD3 (v3), the world of the second chamber (v3 117.6 → 130.1): ONE metric world (metres), cut by the section
   plane y = 0 (everything with y < 0 is cut away, the camera lives on that open side). z = 0 is the ground at the top of the pit fill
   AND the museum floor; the museum case stands directly above the tomb (scene53d).
   v3 continuity (tasks/ep53-v3-d): the SAME tomb as the first chamber (scene53c): 椁 interior 3.2 × 2.3 m (walls 0.12, 2.0 high),
   outer coffin 2.12 × 0.84 (0.84 high), inner coffin 1.80 × 0.60 (0.70 high), dark lacquer with gold edges and a red inset line,
   interiors #2A1D14 / chamber53b3's inner coffin (walls #3A2418, floor #46201A × 0.55; fix4-d); scene53c's skeleton (head toward −x), the hero drawn by Sword3D with its hilt toward −x (screen-right,
   as in the draw), in scene53c's black lacquer sheath on the occupant's left (screen bottom, the camera side: y = YC − 0.22; fix4-d #1),
   the bronze knife between it and the shins.
   Everything here is a pure function of (camera, t). */
/** the coffins' centre line (y), the 椁 floor, the inner coffin's floor (z) */
export const YC = 0.3, ZG = -10.68, ZI = -10.57;
/* fix4-d #1: the sheath lies on the camera (cut) side of the skeleton, 0.22 m off the body axis, as in the first chamber (chamber53b3:
   sword 0.23 off the axis on the camera side, knife 0.158): on screen at the bottom, the occupant's left, hilt screen-right at the hip */
export const SX0 = -0.165, SYA = YC - 0.22, SZ = ZI + 0.012;
/** the layers close one per beat from DA(40) (MUSIC_NOTES): the times of the hits */
export const LAY = {sheath: 91.0112, inner: 91.5773, outer: 92.1433, guo: 92.7094, bai: 93.2754, hang: 93.8415};
const hitT = (tb: number) => frameOf(tb) / 30;
/** a drop that is COMPLETE on the frame of its beat: 0 → 1, gravity-like */
export const drop = (t: number, tb: number, dur = 0.34) => { const tf = hitT(tb), u = seg(t, tf - dur, tf); return u; };
const R = (x0: number, x1: number, z0: number, z1: number, y = 0): V3[] => [[x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0]];
export const swAt = (a: number, w: number, dz = 0, draw = 0): V3 => [SX0 + a / 100 - draw / 100, SYA + w / 100, SZ + dz / 100];
const pp = (c: Cam, q: V3): P2 => { const p = proj(c, q); return [p[0], p[1]]; };
const toMM = (c: Cam): Cam => ({...c, p: [c.p[0] * 1000, c.p[1] * 1000, c.p[2] * 1000]});

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

/* ---------- the sword in its sheath: the shared 3-D sword (sword3d), the sheath as scene53c's black lacquer sheath (washed) ---------- */
/** the sheath's half-width (cm) at a cm from the pommel: scene53c's sheathHW with nothing drawn */
const sheathHW = (a: number) => (a - SW.bladeA > LB ? 0.3 : bladeHW(Math.min(LB - 0.5, Math.max(0, a - SW.bladeA))) + 0.55);
/** the hero: Sword3D lying on the inner floor, hilt toward −x (screen-right, as in the draw); `draw` cm out of the sheath;
    the sheath (fixed) on top of it, at `sho` opacity until its beat (then a top shell drops onto it: the sheath closes) */
const SwordSheath: React.FC<{c: Cam; draw: number; lit: number; plank: number; plankDz: number; sho: number}> = ({c, draw, lit, plank, plankDz, sho}) => { const n = 36, cm = toMM(c);
	const sp: SwordPose = {x0: (SX0 - draw / 100) * 1000, ya: SYA * 1000, z0: SZ * 1000, dir: 1};
	const am = SW.guardA, at = SW.L + 2.2, aa = (i: number) => lerp(am, at, i / n);
	const edge = (sgn: number, k = 1, dz = 0.45) => Array.from({length: n + 1}, (_, i) => swAt(aa(i), sgn * sheathHW(aa(i)) * k * (i === n ? 0.5 : 1), dz));
	const outline = [...edge(1), ...[...edge(-1)].reverse()];
	const a0 = pp(c, swAt(0, 0, 0, draw)), a1 = pp(c, swAt(SW.L, 0, 0, draw)), mid: P2 = [(a0[0] + a1[0]) / 2, (a0[1] + a1[1]) / 2], span = Math.hypot(a1[0] - a0[0], a1[1] - a0[1]);
	const mouth = [swAt(am - 0.8, -(sheathHW(am) + 0.3), 0.55), swAt(am - 0.8, sheathHW(am) + 0.3, 0.55), swAt(am + 0.4, sheathHW(am) + 0.3, 0.55), swAt(am + 0.4, -(sheathHW(am) + 0.3), 0.55)];
	const shell = (o: number, dz: number) => <g opacity={o}>
		<path d={poly(c, outline.map((q) => [q[0], q[1], q[2] + dz] as V3))} fill="#0A0605" stroke="#060403" strokeWidth={2} />
		<path d={poly(c, edge(1, 0.86, 0.5).slice(2, n - 2).map((q) => [q[0], q[1], q[2] + dz] as V3), false)} fill="none" stroke="#FFFFFF" strokeOpacity={0.12} strokeWidth={2.5} />
		{[1, -1].map((s) => <path key={s} d={poly(c, edge(s, 0.55, 0.5).slice(1, n - 1).map((q) => [q[0], q[1], q[2] + dz] as V3), false)} fill="none" stroke="#7A2A1A" strokeOpacity={0.7} strokeWidth={2.2} />)}
		<path d={poly(c, mouth.map((q) => [q[0], q[1], q[2] + dz] as V3))} fill="#1E1410" stroke="#5A3A28" strokeWidth={2} />
	</g>;
	return <g>
		<Pool id="w53sw" x={mid[0]} y={mid[1]} rx={Math.max(90, span * 0.62)} ry={Math.max(36, span * 0.2)} a={0.42 * lit} col="#FFC870" />
		{/* fix4-d #7: when the sword is small in frame (L1), a broader warm glow keeps it the brightest point over the layers */}
		{span < 300 && <Pool id="w53sw2" x={mid[0]} y={mid[1]} rx={Math.max(150, span * 1.1)} ry={Math.max(64, span * 0.42)} a={0.32 * cl((300 - span) / 120)} col="#FFC870" />}
		<Sword3D c={cm} sp={sp} id="w53h" />
		{shell(plank > 0 && plankDz < 0.0005 ? 1 : sho, 0)}
		{plank > 0 && plankDz >= 0.0005 && shell(1, plankDz)}
	</g>; };
/** one of the tomb's other swords (E1): real size (58 cm), lying flat on the 椁's floor boards in the side compartment behind the coffins;
    dull bronze, the guard bronze too (blue glass is the hero's alone); lit = 0..1. fix4-d #3: no halo: a contact shadow and a small
    Pool (a 0.18) on the boards, the metal at most ~0.6 of the hero's light */
const OtherSword: React.FC<{c: Cam; x0: number; y: number; ang: number; lit: number; id: number}> = ({c, x0, y, ang, lit, id}) => {
	const L = 0.5, z = ZG + 0.012, ca = Math.cos(ang), sa = Math.sin(ang), at = (a: number, w: number, zz = z): V3 => [x0 + ca * a - sa * w, y + sa * a + ca * w, zz];
	const n = 12, bladeQ = (zz: number, k = 1, dw = 0) => [...Array.from({length: n + 1}, (_, i) => at(0.08 + L * i / n, (0.022 * k + dw) * (1 - Math.pow(i / n, 3)), zz)), ...Array.from({length: n + 1}, (_, i) => at(0.08 + L * (n - i) / n, -(0.022 * k + dw) * (1 - Math.pow((n - i) / n, 3)), zz))];
	const blade = bladeQ(z), m0 = proj(c, at(0.3, 0)); if (m0[2] < 0.2) return null;
	const a0 = pp(c, at(0, 0)), a1 = pp(c, at(L, 0)), mid: P2 = [(a0[0] + a1[0]) / 2, (a0[1] + a1[1]) / 2], span = Math.hypot(a1[0] - a0[0], a1[1] - a0[1]), ppm = c.f / m0[2];
	const guard = poly(c, [at(0.065, -0.026), at(0.065, 0.026), at(0.085, 0.026), at(0.085, -0.026)]), grip = poly(c, [at(0.005, -0.009), at(0.005, 0.009), at(0.065, 0.009), at(0.065, -0.009)]), pom = poly(c, [at(-0.004, -0.018), at(-0.004, 0.018), at(0.008, 0.018), at(0.008, -0.018)]);
	const sh = (q: V3): V3 => [q[0], q[1] + 0.012, ZG + 0.001], shadow = poly(c, bladeQ(ZG + 0.001, 1.3, 0.01).map(sh)) + poly(c, [at(-0.01, -0.03), at(-0.01, 0.03), at(0.09, 0.03), at(0.09, -0.03)].map(sh));
	const base = '#2A1C12', k = 0.45 * lit;
	return <g>
		<defs><filter id={`w53os${id}`} x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation={Math.max(1.2, 0.008 * ppm)} /></filter></defs>
		{lit > 0.001 && <Pool id={`w53o${id}`} x={mid[0]} y={mid[1]} rx={span * 0.62} ry={span * 0.2} a={0.18 * lit} col="#FFC870" />}
		<path d={shadow} fill="#070403" opacity={0.75} filter={`url(#w53os${id})`} />
		<path d={poly(c, blade)} fill={mix(base, '#C49A58', k)} stroke="#E8BC78" strokeOpacity={0.08 + 0.3 * lit} strokeWidth={1.2} />
		<path d={poly(c, [at(0.08, 0), at(0.08 + L, 0)], false)} stroke={BZ.lit} strokeOpacity={0.35 * lit} strokeWidth={1} fill="none" />
		<path d={grip} fill={mix(base, BZ.mid, 0.3 + 0.3 * lit)} /><path d={guard} fill={mix(base, BZ.dark, 0.5 + 0.4 * lit)} stroke={mix(base, BZ.mid, 0.7 * lit)} strokeWidth={1} /><path d={pom} fill={mix(base, BZ.mid, 0.3 + 0.3 * lit)} />
	</g>; };
/** E1: the three other swords lie side by side on the 椁's floor boards in the side compartment behind the coffins (between the
    outer coffin's far wall, y ≈ YC + 0.42, and the 椁's far wall, YC + 1.15), hilts toward −x like the hero; they light one per half-bar */
export const OTHERS: {x0: number; y: number; ang: number; tb: number}[] = [{x0: -0.74, y: YC + 0.76, ang: 0.03, tb: 86.483}, {x0: -0.62, y: YC + 0.88, ang: -0.025, tb: 87.615}, {x0: -0.8, y: YC + 1.0, ang: 0.02, tb: 88.747}];
/** fix4-d #3: the 椁's floor as lit boards (so the side compartment reads as a floor the swords lie on): planks along x, a warm pool */
const GuoFloor: React.FC<{c: Cam; lit: number}> = ({c, lit}) => { const xi = 1.6, z = ZG + 0.001, yb = YC + 1.15, nb = 8, w = yb / nb;
	const q0 = pp(c, [-0.5, YC + 0.88, z]), q1 = pp(c, [0.1, YC + 0.88, z]), sp = Math.hypot(q1[0] - q0[0], q1[1] - q0[1]);
	return <g>
		{Array.from({length: nb}, (_, i) => <path key={i} d={poly(c, [[-xi, i * w, z], [xi, i * w, z], [xi, (i + 1) * w, z], [-xi, (i + 1) * w, z]])} fill={mix('#3A2A1C', '#4A3624', rnd(i, 71))} />)}
		{Array.from({length: nb + 1}, (_, i) => <path key={`s${i}`} d={poly(c, [[-xi, i * w, z], [xi, i * w, z]], false)} stroke="#140C07" strokeOpacity={0.7} strokeWidth={1.6} fill="none" />)}
		{Array.from({length: 14}, (_, i) => { const y = (Math.floor(rnd(i, 72) * nb) + 0.5) * w, x = lerp(-1.4, 1.4, rnd(i, 73)); return <path key={`g${i}`} d={poly(c, [[x, y - w * 0.3, z], [x + 0.3 + 0.4 * rnd(i, 74), y - w * 0.3 + 0.02 * (rnd(i, 75) - 0.5), z]], false)} stroke="#20150D" strokeOpacity={0.35} strokeWidth={1} fill="none" />; })}
		<Pool id="w53gf" x={(q0[0] + q1[0]) / 2} y={(q0[1] + q1[1]) / 2} rx={sp * 1.5} ry={sp * 0.7} a={0.22 * lit} col="#FFC070" />
	</g>; };

/* ---------- the occupant: scene53c's skeleton (the same drawing, ported: scene53c does not export it), on the inner floor; head toward
   −x (screen-right); the sword lies on the camera side (screen bottom = the occupant's left on screen, as in chamber 1), guard at the pelvis ---------- */
const OX = -0.065, OY = YC;
const Occupant: React.FC<{c: Cam}> = ({c}) => {
	const P = (x: number, s: number, dz = 0): V3 => [OX + x, OY + s, ZI + 0.003 + dz], m = proj(c, P(0, 0)); if (m[2] < 0.2) return null;
	const ppm = c.f / m[2], S = (x: number, s: number) => { const p = proj(c, P(x, s)); return `${p[0].toFixed(1)},${p[1].toFixed(1)}`; };
	const BONE = '#E4D4B0', HOL = '#3A1C14';
	const bone = (k: string, a: [number, number], b: [number, number], w: number, knob = 1.35) => { const pa = proj(c, P(a[0], a[1])), pb = proj(c, P(b[0], b[1])), W0 = w * ppm;
		return <g key={k}>
			<path d={`M${pa[0]},${pa[1]} L${pb[0]},${pb[1]}`} stroke={BONE} strokeOpacity={0.5} strokeWidth={W0} strokeLinecap="round" />
			{[pa, pb].map((q, i) => <circle key={i} cx={q[0]} cy={q[1]} r={W0 * knob / 2} fill={BONE} opacity={0.5} />)}
			<path d={`M${pa[0]},${pa[1]} L${pb[0]},${pb[1]}`} stroke={HOL} strokeOpacity={0.72} strokeWidth={Math.max(0.8, W0 * 0.42)} strokeLinecap="round" /></g>; };
	const line = (k: string, d: string, w = 0.008, o = 0.5) => <path key={k} d={d} fill="none" stroke={BONE} strokeOpacity={o} strokeWidth={Math.max(1.2, w * ppm)} strokeLinecap="round" strokeLinejoin="round" />;
	const ell = (x: number, sC: number, a: number, b: number, n = 28) => 'M' + Array.from({length: n}, (_, i) => { const th = i / n * 2 * Math.PI; return S(x + a * Math.cos(th), sC + b * Math.sin(th)); }).join('L') + 'Z';
	const sides = [1, -1];
	const stains = Array.from({length: 16}, (_, i) => { const x = lerp(-0.8, 0.8, rnd(i, 81)), y = OY + (rnd(i, 82) - 0.5) * 0.36, d = blobOn(c, OX + x, y, 0.05 + 0.1 * rnd(i, 83), i + 301, ZI + 0.001, 9, 0.7);
		return d ? <path key={i} d={d} fill={['#7A4E2A', '#6A4224', '#8A5A30'][i % 3]} opacity={0.22 + 0.2 * rnd(i, 84)} /> : null; });
	const cloth: [number, number, number][] = [[0.06, 0.0, 0.17], [0.24, 0.05, 0.15], [0.3, -0.07, 0.13], [0.55, 0.02, 0.12], [-0.33, -0.1, 0.08], [0.72, -0.05, 0.08]];
	return <g>
		<defs><filter id="w53oT" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={Math.max(2, 0.02 * ppm)} /></filter>
			<filter id="w53oS" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={Math.max(1.5, 0.012 * ppm)} /></filter></defs>
		<g filter="url(#w53oS)">{stains}</g>
		<path d={ell(-0.72, 0, 0.092, 0.076)} fill={BONE} fillOpacity={0.14} stroke={BONE} strokeOpacity={0.55} strokeWidth={Math.max(1.4, 0.008 * ppm)} />
		{line('jaw', `M${S(-0.655, -0.052)} Q${S(-0.6, -0.03)} ${S(-0.6, 0)} Q${S(-0.6, 0.03)} ${S(-0.655, 0.052)}`, 0.009)}
		{Array.from({length: 19}, (_, i) => { const x = lerp(-0.6, -0.04, i / 18), w = i < 5 ? 0.02 : 0.028; const a = proj(c, P(x - 0.009, 0)), b = proj(c, P(x + 0.009, 0));
			return <path key={`v${i}`} d={`M${a[0]},${a[1]} L${b[0]},${b[1]}`} stroke={BONE} strokeOpacity={0.42} strokeWidth={w * ppm} strokeLinecap="round" />; })}
		{sides.map((s) => line(`cl${s}`, `M${S(-0.565, s * 0.015)} Q${S(-0.58, s * 0.1)} ${S(-0.55, s * 0.16)}`, 0.011))}
		{sides.flatMap((s) => Array.from({length: 6}, (_, i) => { const x0 = -0.535 + i * 0.042, r = 0.115 + 0.02 * Math.sin(Math.PI * (i + 0.5) / 6);
			return line(`r${s}${i}`, `M${S(x0, s * 0.016)} Q${S(x0 - 0.02, s * r * 1.12)} ${S(x0 + 0.075, s * r * 0.95)}`, 0.007, 0.4 - 0.03 * i); }))}
		{sides.map((s) => <path key={`p${s}`} d={`M${S(-0.03, s * 0.02)} C${S(-0.07, s * 0.1)} ${S(-0.02, s * 0.16)} ${S(0.05, s * 0.14)} C${S(0.1, s * 0.12)} ${S(0.11, s * 0.06)} ${S(0.07, s * 0.025)}`} fill={BONE} fillOpacity={0.1} stroke={BONE} strokeOpacity={0.48} strokeWidth={Math.max(1.3, 0.009 * ppm)} />)}
		{line('sac', `M${S(-0.035, -0.02)} L${S(0.06, 0)} L${S(-0.035, 0.02)}`, 0.008, 0.42)}
		{sides.flatMap((s) => [bone(`h${s}`, [-0.54, s * 0.165], [-0.27, s * 0.175], 0.024),
			bone(`ra${s}`, [-0.255, s * 0.168], [-0.03, s * 0.142], 0.012, 1.2), bone(`ul${s}`, [-0.25, s * 0.185], [-0.025, s * 0.162], 0.011, 1.2),
			...[0.132, 0.144, 0.156, 0.167].map((y, i) => line(`f${s}${i}`, `M${S(-0.01, s * y)} L${S(0.055 + 0.01 * Math.sin(i), s * (y - 0.006))}`, 0.006, 0.38))])}
		{sides.flatMap((s) => [bone(`fe${s}`, [0.04, s * 0.095], [0.42, s * 0.085], 0.03),
			<circle key={`k${s}`} cx={proj(c, P(0.44, s * 0.085))[0]} cy={proj(c, P(0.44, s * 0.085))[1]} r={0.022 * ppm} fill="none" stroke={BONE} strokeOpacity={0.45} strokeWidth={Math.max(1.2, 0.007 * ppm)} />,
			bone(`ti${s}`, [0.46, s * 0.08], [0.77, s * 0.072], 0.024), bone(`fi${s}`, [0.47, s * 0.108], [0.765, s * 0.098], 0.01, 1.2),
			...[0.055, 0.07, 0.085, 0.1].map((y, i) => line(`t${s}${i}`, `M${S(0.785, s * (0.07 + (y - 0.075) * 0.4))} L${S(0.85, s * y)}`, 0.006, 0.36))])}
		<g filter="url(#w53oT)">{cloth.map(([x, y, r], i) => { const d = blobOn(c, OX + x, OY + y, r, i + 401, ZI + 0.01, 10, 0.6); return d ? <path key={i} d={d} fill="#1E0E09" opacity={0.5} /> : null; })}</g>
	</g>; };
/** the bronze knife (铜削, facts A9) between the sheath and the shins, as chamber53b3's KNIFE3 (ring end at body x 0.40, back toward the sheath) */
const Knife: React.FC<{c: Cam}> = ({c}) => { const x0 = OX + 0.40, y0 = YC - 0.158, M = (x: number, y: number): [number, number] => { const p = proj(c, [x0 + x / 1000, y0 + y / 1000, ZI + 0.006]); return [p[0], p[1]]; };
	return proj(c, [x0, y0, ZI])[2] > 0.05 ? <BronzeKnife53 M={M} id="w53k" /> : null; };

/* ---------- the pit, the chamber, the closing layers ---------- */
const FILL_X = 3.5, ZF0 = -11.3, ZCLAY = -8.2, ZY = -7.0, PB = YC + 1.4;
const mot = ['#8A6E40', '#6E6A5C', '#7A4A30', '#9A8458', '#4A3A28'];
/** fill heights: the 白膏泥 level rises to −8.2 and the 夯土 level to 0, each ending ON its beat */
export const hClay = (t: number) => { const u = drop(t, LAY.bai, 0.76); return lerp(ZF0, ZCLAY, 1 - Math.pow(1 - u, 2.2)) * (t >= 0 ? 1 : 1); };
export const hRam = (t: number) => { const u = drop(t, LAY.hang, 0.8); return lerp(ZCLAY, 0, 1 - Math.pow(1 - u, 2.2)); };
export const Pit: React.FC<{c: Cam; t: number}> = ({c, t}) => { const hc = t < LAY.bai - 0.8 ? ZF0 : hClay(t), hr = t < LAY.hang - 0.85 ? ZCLAY : hRam(t), oc = sstep(seg(t, hitT(LAY.bai) - 0.76, hitT(LAY.bai) - 0.46)), orr = sstep(seg(t, hitT(LAY.hang) - 0.8, hitT(LAY.hang) - 0.5)), clayOn = hc > ZF0 + 0.001, ramOn = hr > ZCLAY + 0.001;
	const pt = (x: number, z: number) => pp(c, [x, 0, z]);
	return <g>
		<defs><linearGradient id="w53wc" gradientUnits="userSpaceOnUse" x1={0} y1={pt(0, ZCLAY)[1]} x2={0} y2={pt(0, ZF0)[1]}><stop offset="0" stopColor="#8E877A" /><stop offset="1" stopColor="#6A645A" /></linearGradient></defs>
		{/* natural soil: the cut face, dark; the pit's void in it */}
		<path d={poly(c, R(-60, 60, -60, 0))} fill="#241A13" />
		{[-2.6, -4.3, -5.9, -7.6, -9.2, -10.8, -12.6, -14.8].map((z, i) => <g key={i}>{[[-30, -3.5], [3.5, 30]].map(([a, b], k) => <path key={k} d={poly(c, Array.from({length: 9}, (_, j) => [lerp(a, b, j / 8), 0, z + 0.08 * Math.sin(j * 1.7 + i)] as V3), false)} stroke="#3A2A1E" strokeWidth={2} fill="none" />)}</g>)}
		{/* fix4-d #7: the open shaft is no flat black hole: its far wall, side walls and floor in the dig's 五花土 (clipped to the cut) */}
		<defs><clipPath id="w53hole"><path d={poly(c, R(-FILL_X, FILL_X, ZF0, 0))} /></clipPath></defs>
		<path d={poly(c, R(-FILL_X, FILL_X, ZF0, 0))} fill="#0E0906" />
		<g clipPath="url(#w53hole)">
			<path d={poly(c, R(-FILL_X, FILL_X, ZF0, 0, PB))} fill="#3A2A1D" />
			{Array.from({length: 130}, (_, i) => { const p = proj(c, [lerp(-3.45, 3.45, rnd(i, 91)), PB, lerp(ZF0 + 0.05, -0.1, rnd(i, 92))]); if (p[2] < 0.2) return null; const r = (0.05 + 0.1 * rnd(i, 93)) * c.f / p[2];
				return <ellipse key={i} cx={p[0]} cy={p[1]} rx={r * 0.8} ry={r * 0.4} fill={mot[i % 5]} opacity={0.2} />; })}
			{[-1.6, -3.1, -4.7, -6.2, -7.9, -9.6].map((z, i) => <path key={`b${i}`} d={poly(c, Array.from({length: 9}, (_, j) => [lerp(-FILL_X, FILL_X, j / 8), PB, z + 0.07 * Math.sin(j * 1.9 + i)] as V3), false)} stroke="#241912" strokeWidth={2} strokeOpacity={0.7} fill="none" />)}
			{[-FILL_X, FILL_X].map((x) => <g key={`w${x}`}><path d={poly(c, [[x, 0, 0], [x, PB, 0], [x, PB, ZF0], [x, 0, ZF0]])} fill="#2C2016" />
				{Array.from({length: 40}, (_, i) => { const p = proj(c, [x, lerp(0.05, PB - 0.05, rnd(i, 94 + x)), lerp(ZF0 + 0.05, -0.1, rnd(i, 95 + x))]); if (p[2] < 0.2) return null; const r = (0.05 + 0.1 * rnd(i, 96)) * c.f / p[2];
					return <ellipse key={i} cx={p[0]} cy={p[1]} rx={r * 0.4} ry={r * 0.3} fill={mot[(i + 2) % 5]} opacity={0.16} />; })}</g>)}
			<path d={poly(c, [[-FILL_X, 0, ZF0], [FILL_X, 0, ZF0], [FILL_X, PB, ZF0], [-FILL_X, PB, ZF0]])} fill="#251A12" />
		</g>
		<g opacity={oc}>{clayOn && <path d={poly(c, R(-FILL_X, FILL_X, ZF0, hc))} fill="url(#w53wc)" />}
		{clayOn && Array.from({length: 260}, (_, i) => { const z = lerp(-11.25, -8.25, rnd(i, 82)); if (z > hc) return null; const [sx, sy] = pt(lerp(-3.45, 3.45, rnd(i, 81)), z); return <circle key={i} cx={sx} cy={sy} r={1.2 + 2.4 * rnd(i, 83)} fill={rnd(i, 84) > 0.55 ? '#A29A8A' : '#5A554C'} opacity={0.32} />; })}</g>
		<g opacity={orr}>{ramOn && <>
			<path d={poly(c, R(-FILL_X, FILL_X, ZCLAY, Math.min(hr, ZY)))} fill="#434C4B" />
			{hr > ZY && <path d={poly(c, R(-FILL_X, FILL_X, ZY, hr))} fill="#54402A" />}
			{Array.from({length: 150}, (_, i) => { const z = lerp(ZY, 0, rnd(i, 12)); if (z > hr) return null; const [sx, sy] = pt(lerp(-3.45, 3.45, rnd(i, 11)), z), r = 4 + 9 * rnd(i, 13); return <ellipse key={i} cx={sx} cy={sy} rx={r} ry={r * 0.6} fill={mot[i % 5]} opacity={0.4} />; })}
			{Array.from({length: 28}, (_, i) => -ZY - i * 0.25 - 0.25).map((zz) => { const z = -zz + 0; return z > hr || z < ZY ? null : <path key={zz} d={poly(c, [[-FILL_X, 0, z], [FILL_X, 0, z]], false)} stroke="#1E140C" strokeOpacity={0.4} strokeWidth={1.2} fill="none" />; })}
		</>}</g>
		{clayOn && <path d={poly(c, [[-FILL_X, 0, Math.min(hc, ZCLAY)], [FILL_X, 0, Math.min(hc, ZCLAY)]], false)} stroke="#CFC6B0" strokeOpacity={0.55 * oc * seg(hc, ZCLAY - 0.4, ZCLAY)} strokeWidth={2.4} fill="none" />}
		{[-FILL_X, FILL_X].map((x) => <path key={x} d={poly(c, [[x, 0, 0], [x, 0, ZF0]], false)} stroke="#140C08" strokeWidth={3} strokeOpacity={0.8} fill="none" />)}
	</g>; };
export const Chamber: React.FC<{c: Cam; t: number; draw: number; lit: number}> = ({c, t, draw, lit}) => {
	const dIn = 0.9 * (1 - Math.pow(drop(t, LAY.inner), 2)), dOut = 0.9 * (1 - Math.pow(drop(t, LAY.outer), 2)), dGuo = 1.1 * (1 - Math.pow(drop(t, LAY.guo), 2)), dSh = 0.18 * (1 - Math.pow(drop(t, LAY.sheath, 0.3), 2));
	const lidIn = t >= LAY.inner - 0.34, lidOut = t >= LAY.outer - 0.34, roof = t >= LAY.guo - 0.34, plank = t >= LAY.sheath - 0.3 ? 1 : 0;
	const LID = '#33211A', LACQ = '#1A110D', EDGE = '#F0C080';
	return <g>
		<Box c={c} x={1.72} z0={ZG - 0.12} z1={ZG + 2.0} yb={YC + 1.15} t={0.12} ring="#4A3424" inside="#3A281C" floor="#2E2218" />
		<GuoFloor c={c} lit={sstep(seg(t, 85.6, 86.483))} />
		{OTHERS.map((o, i) => <OtherSword key={i} c={c} x0={o.x0} y={o.y} ang={o.ang} lit={frameOf(t) >= frameOf(o.tb) ? 1 - 0.25 * seg(t, o.tb, o.tb + 3) : 0} id={i} />)}
		<Box c={c} x={1.06} z0={ZG} z1={ZG + 0.84} yb={YC + 0.36} t={0.06} ring={LACQ} inside="#2A1D14" floor="#24170F" edge={EDGE} line={RED_LINE} />
		<Box c={c} x={0.9} z0={ZG + 0.06} z1={ZG + 0.76} yb={YC + 0.25} t={0.05} ring={LACQ} inside="#3A2418" floor={mix('#46201A', '#000000', 0.45)} edge={EDGE} line={RED_LINE} />
		<g opacity={0.62 * (0.12 + 0.88 * cl((Math.hypot(c.p[0] - OX, c.p[1] - YC, c.p[2] - ZI) - 0.45) / 0.7))}><Occupant c={c} /></g>
		<Knife c={c} />
		<SwordSheath c={c} draw={draw} lit={lit} plank={plank} plankDz={dSh} sho={lerp(1, 0.72, sstep(seg(t, 84.219, 85.0)))} />
		{lidIn && <Slab c={c} x={0.9} yb={YC + 0.3} z0={ZG + 0.76} z1={ZG + 0.83} dz={dIn} col={LID} line={RED_LINE} />}
		{lidOut && <Slab c={c} x={1.06} yb={YC + 0.42} z0={ZG + 0.84} z1={ZG + 0.91} dz={dOut} col={LID} line={RED_LINE} />}
		{roof && <Slab c={c} x={1.72} yb={YC + 1.27} z0={ZG + 2.0} z1={ZG + 2.18} dz={dGuo} col="#4A3426" />}
	</g>; };

/* ---------- air: dots that fall through the fill and bounce off the white clay; two get through to the blade ---------- */
export const AIR_T0 = 93.7;
const LEAKS: {path: V3[]; t0: number}[] = [
	{path: [[0.0, 0, -4.2], [0.03, 0, -8.0], [0.07, 0, -8.6], [0.17, 0, -9.2], [0.13, 0.05, -9.85], [0.2, SYA, SZ + 0.006]], t0: 94.0},
	{path: [[0.55, 0, -3.4], [0.6, 0, -8.0], [0.65, 0, -8.55], [0.55, 0, -9.3], [0.43, 0.06, -9.95], [0.33, SYA, SZ + 0.006]], t0: 94.45}];
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
export const Labels: React.FC<{c: Cam; t: number}> = ({c, t}) => { if (t < LAY.sheath || t > 94.8) return null;
	const fo = 1 - seg(t, 94.3, 94.8), lx = 1500, dy = 52, L = (q: V3) => pp(c, q);
	const o1 = L([-1.06 + 0.03, 0, ZG + 0.45]), o2 = L([-0.9 + 0.025, 0, ZG + 0.35]);
	return <g opacity={fo}>
		{lbl(t, LAY.bai) > 0 && <Tag id="w53a" x={lx} y={424 + dy} s="白膏泥" fs={56} col={B.cream} to={L([-3.05, 0, -8.55])} />}
		{lbl(t, LAY.guo) > 0 && <Tag id="w53b" x={lx} y={560 + dy} s="木椁" fs={56} col={B.cream} to={L([-1.66, 0, ZG + 1.2])} />}
		{lbl(t, LAY.inner) > 0 && <Tag id="w53c" x={lx} y={696 + dy} s="两层棺" fs={56} col={B.cream} to={o1} />}
		{lbl(t, LAY.outer) > 0 && <><path d={`M${o2[0]},${o2[1]} L${lx - 56 * 0.35},${696 + dy - 56 * 0.36}`} fill="none" stroke={B.lac} strokeWidth={5} strokeOpacity={0.6} /><path d={`M${o2[0]},${o2[1]} L${lx - 56 * 0.35},${696 + dy - 56 * 0.36}`} fill="none" stroke={B.goldL} strokeWidth={2.2} /><circle cx={o2[0]} cy={o2[1]} r={5} fill={B.goldL} stroke={B.lac} strokeWidth={1.5} /></>}
		{lbl(t, LAY.sheath) > 0 && <Tag id="w53d" x={lx} y={832 + dy} s="剑鞘" fs={56} col={B.goldL} to={L(swAt(SW.guardA + 6, -sheathHW(SW.guardA + 6) - 0.4, 0.6))} />}
		{lbl(t, LAY.hang) > 0 && <Tag id="w53e" x={lx} y={288 + dy} s="夯土" fs={56} col={B.cream} to={L([-3.0, 0, -5.0])} />}
	</g>; };
export {lookAt, R, W, H, SANS};
