import React from 'react';
import {rnd, lerp, cl, seg} from '../qq50/kit50';
import {Cam, V3, proj, poly, camBasis, mix} from './parts53';
import {Blade3D, Guard3D, Hilt3D, Sword3D} from './sword3d';
import {bw, hwAt, A_BL, Light, LandOpts} from './land53';
import {A} from './swordspec53s';
import {spline, sstep, sstep5} from './cam53';
/* ep53 v3.4 · the new opening (0 → J_O = 7.0 s), owner: "get into the subject at once". 1977, the paper test for 《古剑》 (F1, F2):
   frame 0 is a close, low three-quarter view from the hilt side — the bright blade, edge down, poised over a neat stack of 30 cream
   sheets in a dark warm void, the guard in frame; ON f13 (DA(0) = 0.443) one stroke down (a short draw toward the hilt) cuts the top
   20 sheets; their halves part and lift a little, seven strips flutter off and drift down; the bottom 10 stay whole. f47: the sword
   holds just above the cut stack. f81: one soft lobe slides along the blade. 3.3 → 6.4: the sword lifts away (the set sinks away below
   frame and is gone), rolls level (edge down → blue glass up), drifts back and settles on the case's two rests while the camera rises
   and pulls back; the case comes out of the dark around it. From J_O on the camera is exactly today's TakeA (`camOld`), joined C1.
   One world (the case frame, mm). The sword is always the shared Sword3D at its rest pose SP: it is moved by drawing it through the
   camera seen from the sword's own frame (`camToSword`), so the sword, its lattice and its marks are never redrawn here.
   The paper geometry is new code (paper53c is not imported). Everything is a pure function of t. */
export const J_O = 7.0;
export const T_CUT = 13 / 30;                    // f13: the deepest point of the stroke (DA(0) = 0.443)
const T_IN0 = 7 / 30;                            // the stroke starts (6 frames, 0.2 s)
const T_LOBE = 81 / 30;                          // [亮] 2.707 → f81
const DEG = Math.PI / 180;

/* ---------- the rigid move of the sword: q_world = M·(q_sword + (sl, 0, 0) − O) + O + T, M = Rz(psi)·Ry(th)·Rx(phi)
   (sl slides the sword along its own axis: the draw of the stroke) ---------- */
const O: V3 = [0, 0, 1000];
type XF = {phi: number; th: number; psi: number; sl: number; T: V3};
type M3 = [V3, V3, V3];
const matOf = (x: XF): M3 => { const cf = Math.cos(x.phi), sf = Math.sin(x.phi), ct = Math.cos(x.th), st = Math.sin(x.th), cp = Math.cos(x.psi), sp = Math.sin(x.psi);
	/* Rx(phi): (x, y cf − z sf, y sf + z cf); then Ry(th): (x ct + z st, y, −x st + z ct); then Rz(psi): (x cp − y sp, x sp + y cp, z) */
	const r: M3 = [[ct, st * sf, st * cf], [0, cf, -sf], [-st, ct * sf, ct * cf]];
	return [[cp * r[0][0] - sp * r[1][0], cp * r[0][1] - sp * r[1][1], cp * r[0][2] - sp * r[1][2]], [sp * r[0][0] + cp * r[1][0], sp * r[0][1] + cp * r[1][1], sp * r[0][2] + cp * r[1][2]], r[2]]; };
const mul = (m: M3, v: V3): V3 => [m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2], m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2], m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2]];
const mulT = (m: M3, v: V3): V3 => [m[0][0] * v[0] + m[1][0] * v[1] + m[2][0] * v[2], m[0][1] * v[0] + m[1][1] * v[1] + m[2][1] * v[2], m[0][2] * v[0] + m[1][2] * v[1] + m[2][2] * v[2]];
export const toWorld = (x: XF, q: V3): V3 => { const r = mul(matOf(x), [q[0] + x.sl - O[0], q[1] - O[1], q[2] - O[2]]); return [r[0] + O[0] + x.T[0], r[1] + O[1] + x.T[1], r[2] + O[2] + x.T[2]]; };
const toSwordPt = (x: XF, q: V3): V3 => { const r = mulT(matOf(x), [q[0] - O[0] - x.T[0], q[1] - O[1] - x.T[1], q[2] - O[2] - x.T[2]]); return [r[0] + O[0] - x.sl, r[1] + O[1], r[2] + O[2]]; };
/** the world camera as seen from the sword's own frame (the sword then sits at SP): same picture, any rotation (roll kept exact) */
export const camToSword = (c: Cam, x: XF): Cam => { if (!x.phi && !x.th && !x.psi && !x.sl && !x.T[0] && !x.T[1] && !x.T[2]) return c;
	const m = matOf(x), {F, R, U} = camBasis(c), r = c.roll ?? 0;
	const Re: V3 = [R[0] * Math.cos(r) - U[0] * Math.sin(r), R[1] * Math.cos(r) - U[1] * Math.sin(r), R[2] * Math.cos(r) - U[2] * Math.sin(r)];
	const Fs = mulT(m, F), Rs = mulT(m, Re), yaw = Math.atan2(Fs[1], Fs[0]), pitch = Math.asin(cl(-Fs[2], -1, 1));
	const R0: V3 = [-Math.sin(yaw), Math.cos(yaw), 0], U0: V3 = [Math.sin(pitch) * Math.cos(yaw), Math.sin(pitch) * Math.sin(yaw), Math.cos(pitch)];
	const roll = Math.atan2(-(Rs[0] * U0[0] + Rs[1] * U0[1] + Rs[2] * U0[2]), Rs[0] * R0[0] + Rs[1] * R0[1] + Rs[2] * R0[2]);
	return {...c, p: toSwordPt(x, c.p), yaw, pitch, roll}; };
const lightToSword = (x: XF, l: Light): Light => ({...l, dir: mulT(matOf(x), l.dir), pos: l.pos ? toSwordPt(x, l.pos) : undefined});

/* the stack (world, mm): 30 sheets of 1.1 mm on the set's ground ZB, 210 × 140 mm, its long side under the blade (s 110 → 320) */
const NS = 30, NC = 20, SHT = 1.1, ZB = 990, ZT = ZB + NS * SHT, SY = 70, X0 = -71, X1 = 139;
const S0 = X0 + 278 - A_BL, S1 = X1 + 278 - A_BL;
/* the blade tapers, so the sword is tilted by TH (tip down) to bring the edge level over the stack */
const TH = Math.atan((hwAt(S0) - hwAt(S1)) / (S1 - S0));
const TY0 = -60;                                 // the blade's plane at the cut (y), just in front of the case axis
const xs = (s: number) => -278 + A_BL + s;       // the sword-frame x of blade station s
/** the edge's height (world z) at blade station s for a pose (phi = 90°) — used to place the stroke */
const edgeZ0 = (s: number, tz: number) => O[2] + tz - xs(s) * Math.sin(TH) - hwAt(s) * Math.cos(TH);
const Z_DEEP = ZB + 11.0;                        // the edge's deepest point at the stack's ends (sheets 10–29 cut, 0–9 whole)
const TZ_CUT = Z_DEEP - edgeZ0(S0, 0), HOVER0 = 16, HOVER1 = 30;
/* the pose channels */
const TZ_A = spline([[T_CUT, TZ_CUT, 0], [1.4, TZ_CUT + 22 + HOVER1, 0], [3.25, TZ_CUT + 22 + HOVER1, 0], [4.3, TZ_CUT + 22 + HOVER1 + 14], [5.5, 26], [6.45, 0, 0]]);
const tzAt = (t: number) => { if (t <= T_IN0) return TZ_CUT + 22 + HOVER0 + 1.2 * Math.sin(t * 2.1);
	if (t < T_CUT) { const u = seg(t, T_IN0, T_CUT); return lerp(TZ_CUT + 22 + HOVER0 + 1.2 * Math.sin(T_IN0 * 2.1), TZ_CUT, u * u * (3 - 2 * u)); }
	return TZ_A(t); };
const SL_A = spline([[T_CUT, -18, 0], [3.4, -18, 0], [6.2, 0, 0]]);
const slAt = (t: number) => (t < T_IN0 ? 18 : t < T_CUT ? lerp(18, -18, sstep(seg(t, T_IN0, T_CUT))) : SL_A(t));
/* at the cut the sword (and the stack under it) is turned PSI0 about the vertical, tip away from the lens, so the stack's near end
   (where the cut shows: 20 sheets parted, 10 whole) faces the camera; the turn unwinds on the way home */
const PSI0 = 6 * DEG;   // v3.5 (owner: "inconsistency between the first and second frame"): was 28°, which showed the guard edge-on as a dark block; now the blade and the guard face the lens as everywhere else
const PSI_A = spline([[2.95, PSI0, 0], [6.4, 0, 0]]);
const TY_A = spline([[3.45, TY0, 0], [6.25, 0, 0]]);
const PHI_A = spline([[3.45, 90 * DEG, 0], [5.95, 0, 0]]);
const TH_A = spline([[3.45, TH, 0], [5.95, 0, 0]]);
export const xfAt = (t: number): XF => t >= 6.45 ? {phi: 0, th: 0, psi: 0, sl: 0, T: [0, 0, 0]} : {phi: PHI_A(t), th: TH_A(t), psi: PSI_A(t), sl: slAt(t), T: [0, TY_A(t), tzAt(t)]};
/** the stack's frame: built square to the axis (x along the blade, the blade's plane y = TY0), turned PSI0 about the vertical through (0, TY0) */
const stw = (q: V3): V3 => { const c = Math.cos(PSI0), s = Math.sin(PSI0), y = q[1] - TY0; return [q[0] * c - y * s, TY0 + q[0] * s + y * c, q[2]]; };
const stPoly = (c: Cam, q: V3[], close = true) => poly(c, q.map(stw), close);

/* ---------- the camera: Cartesian keys (position, target, lens) joined C1 to today's camera at J_O ---------- */
type CF = (t: number) => Cam;
let OPEN: ((t: number) => Cam) | null = null;
export const openCam = (t: number, old: CF): Cam => { if (!OPEN) OPEN = buildCam(old); return OPEN(t); };
const D_T = 600, TS = 2.6;                // TS: the camera starts the move home (slowly: the lobe peaks on f81)
const buildCam = (old: CF) => { const h = 1e-3;
	const tg = (c: Cam): V3 => { const {F} = camBasis(c); return [c.p[0] + F[0] * D_T, c.p[1] + F[1] * D_T, c.p[2] + F[2] * D_T]; };
	const cJ = old(J_O), cA = old(J_O - h), cB = old(J_O + h), gJ = tg(cJ), gA = tg(cA), gB = tg(cB);
	const end = (v: number, a: number, b: number): [number, number, number] => [J_O, v, (b - a) / (2 * h)];
	const ch = (keys: [number, number, number?][], e: [number, number, number]) => spline([...keys, e]);
	/* frame 0: ≈30° up, ≈10° off the front toward the hilt (the sword itself is turned PSI0, so the view is a three-quarter one), a slow
	   push (≤ 2 px per frame) to TS; then ONE Hermite segment per channel onto today's camera at J_O (value and slope), so the rise and
	   pull-back has no kink; the zoom and the principal point get one or two inner keys (the lifting blade stays clear of the subtitles) */
	const PX = ch([[0, -31, 2.2], [TS, -25, 2.2]], end(cJ.p[0], cA.p[0], cB.p[0]));
	const PY = ch([[0, -434, 10], [TS, -406.5, 10]], end(cJ.p[1], cA.p[1], cB.p[1]));
	const PZ = ch([[0, 1245, -6], [TS, 1228.5, -6]], end(cJ.p[2], cA.p[2], cB.p[2]));
	const GX = ch([[0, 35, 0], [TS, 35, 0]], end(gJ[0], gA[0], gB[0]));
	const GY = ch([[0, -60, 0], [TS, -60, 0]], end(gJ[1], gA[1], gB[1]));
	const GZ = ch([[0, 1026, 0], [TS, 1026, 0]], end(gJ[2], gA[2], gB[2]));
	const FF = ch([[0, 1120, 4], [TS, 1131, 4], [4.4, 1150], [5.4, 1250]], end(cJ.f, cA.f, cB.f));
	const CY = ch([[0, 560, 0], [TS, 560, 0], [4.25, 690], [5.4, 680]], end(cJ.cy, cA.cy, cB.cy));
	const CX = ch([[0, 930, 0], [TS, 930, 0]], end(cJ.cx, cA.cx, cB.cx));
	return (t: number): Cam => { const p: V3 = [PX(t), PY(t), PZ(t)], g: V3 = [GX(t), GY(t), GZ(t)], d = [g[0] - p[0], g[1] - p[1], g[2] - p[2]];
		return {p, yaw: Math.atan2(d[1], d[0]), pitch: Math.atan2(-d[2], Math.hypot(d[0], d[1])), f: FF(t), cx: CX(t), cy: CY(t), roll: 0}; }; };

/** a soft pool of light on a horizontal plane (take53.WPool, copied to keep the import one-way): stacked faint ellipses, faded as a group */
const WPool: React.FC<{c: Cam; x: number; y: number; z: number; rx: number; ry: number; col: string; a: number; n?: number}> = ({c, x, y, z, rx, ry, col, a, n = 22}) => <g>
	{Array.from({length: n}, (_, k) => { const r = 1 - k / n, d = poly(c, Array.from({length: 28}, (_, i) => { const th = i / 28 * 2 * Math.PI; return [x + rx * r * Math.cos(th), y + ry * r * Math.sin(th), z] as V3; }));
		return d ? <path key={k} d={d} fill={col} opacity={a / n} /> : null; })}</g>;

/* ---------- the paper ---------- */
const cutAt = (i: number, t: number) => { if (i < NS - NC || t < T_IN0) return false; const zMin = edgeZ0(S0, tzAt(Math.min(t, T_CUT))); return zMin <= ZB + i * SHT + 1e-6; };
/** sheet i's place among the cut sheets (0 at the lowest cut one … 1 at the top): the slit is darker deeper down */
const fi = (i: number) => cl((i - (NS - NC) + 1) / NC);
const sheetTone = (i: number) => mix('#C4B28C', '#B29E78', rnd(i, 71) * 0.9);
/** sheet i's half (sgn +1 behind the blade's plane, −1 in front): bottom/top z, inner/outer y, its inner edge lifted by lz */
const halfGeo = (i: number, sgn: 1 | -1, t: number) => { const cut = cutAt(i, t), ii = i - (NS - NC), fi = (ii + 1) / NC;
	const tau = t - T_CUT, e = cut && tau > 0 ? 1 - Math.exp(-tau / 0.16) : 0;
	/* the halves part (a V, wider at the top) and their inner edges lift a little (peak ≈ 0.35 s), then settle by ≈ 1.5 s */
	const bump = cut && tau > 0 ? Math.sin(Math.PI * cl(tau / 0.75)) * Math.exp(-tau / 0.9) : 0;
	const gap = cut ? 1.6 + fi * 7.5 * e : 0, lz = cut ? fi * (1.1 * e + 3.2 * bump) : 0;
	const jx = (rnd(i, 72) - 0.5) * 1.6, jy = (rnd(i, 73) - 0.5) * 1.2;
	/* the cut halves also fan out a little at their outer faces (the cut/uncut step shows on the stack's sides) */
	const fan = cut ? e * (1.0 + 2.2 * fi) : 0;
	return {z0: ZB + i * SHT, z1: ZB + (i + 1) * SHT - 0.12, yIn: TY0 + sgn * gap, yOut: TY0 + sgn * (SY + fan) + jy, lz, x0: X0 + jx, x1: X1 + jx, cut}; };
const Half: React.FC<{c: Cam; i: number; sgn: 1 | -1; t: number; dz: number}> = ({c, i, sgn, t, dz}) => { const g = halfGeo(i, sgn, t);
	const z0 = g.z0 + dz, z1 = g.z1 + dz, zi0 = z0 + g.lz, zi1 = z1 + g.lz;
	const top = stPoly(c, [[g.x0, g.yIn, zi1], [g.x1, g.yIn, zi1], [g.x1, g.yOut, z1], [g.x0, g.yOut, z1]]);
	const end = stPoly(c, [[g.x0, g.yIn, zi1], [g.x0, g.yOut, z1], [g.x0, g.yOut, z0], [g.x0, g.yIn, zi0]]);
	/* the face toward the camera: the outer face for the near half, the fresh cut face for the far half */
	const face = sgn < 0 ? stPoly(c, [[g.x0, g.yOut, z1], [g.x1, g.yOut, z1], [g.x1, g.yOut, z0], [g.x0, g.yOut, z0]]) : g.cut ? stPoly(c, [[g.x0, g.yIn, zi1], [g.x1, g.yIn, zi1], [g.x1, g.yIn, zi0], [g.x0, g.yIn, zi0]]) : '';
	const tone = sheetTone(i), fresh = sgn > 0 && g.cut;
	return <g>{face && <path d={face} fill={fresh ? mix(tone, '#2A180C', 0.55 - 0.35 * fi(i)) : mix(tone, '#3A2414', 0.3)} stroke="#5C4528" strokeWidth={0.8} strokeOpacity={0.6} />}
		{end && <path d={end} fill={mix(tone, '#3A2414', 0.18)} stroke="#5C4528" strokeWidth={0.8} strokeOpacity={0.55} />}
		{top && <path d={top} fill={tone} stroke="#8A7048" strokeWidth={0.8} strokeOpacity={0.45} />}</g>; };

/** an uncut sheet: one slab (no seam), drawn under the blade */
const Whole: React.FC<{c: Cam; i: number; dz: number}> = ({c, i, dz}) => { const g = halfGeo(i, -1, 0), y0 = TY0 - SY + (g.yOut - (TY0 - SY)), y1 = TY0 + SY + (rnd(i, 74) - 0.5) * 1.2;
	const z0 = g.z0 + dz, z1 = g.z1 + dz;
	const top = stPoly(c, [[g.x0, y0, z1], [g.x1, y0, z1], [g.x1, y1, z1], [g.x0, y1, z1]]), end = stPoly(c, [[g.x0, y0, z1], [g.x0, y1, z1], [g.x0, y1, z0], [g.x0, y0, z0]]);
	const face = stPoly(c, [[g.x0, y0, z1], [g.x1, y0, z1], [g.x1, y0, z0], [g.x0, y0, z0]]), tone = sheetTone(i);
	return <g>{face && <path d={face} fill={mix(tone, '#3A2414', 0.3)} stroke="#5C4528" strokeWidth={0.8} strokeOpacity={0.6} />}
		{end && <path d={end} fill={mix(tone, '#3A2414', 0.18)} stroke="#5C4528" strokeWidth={0.8} strokeOpacity={0.55} />}
		{top && <path d={top} fill={tone} stroke="#8A7048" strokeWidth={0.8} strokeOpacity={0.45} />}</g>; };

/* seven strips shaved off at the cut: up and out, then down slowly with a flutter, settling flat on the stack or the set's ground */
type Strip = {x: number; sgn: 1 | -1; vz: number; vy: number; vx: number; L: number; w: number; psi: number; spin: number; vT: number; ph: number};
const STRIPS: Strip[] = Array.from({length: 7}, (_, k) => ({x: lerp(X0 + 25, X1 - 25, (k + 0.5) / 7 + (rnd(k, 81) - 0.5) * 0.08), sgn: k % 2 ? 1 : -1,
	vz: 300 + 180 * rnd(k, 82), vy: 70 + 120 * rnd(k, 83), vx: (rnd(k, 84) - 0.5) * 90, L: 34 + 30 * rnd(k, 85), w: 5 + 4 * rnd(k, 86),
	psi: (rnd(k, 87) - 0.5) * 1.2, spin: (rnd(k, 88) - 0.5) * 2.4, vT: 62 + 26 * rnd(k, 89), ph: rnd(k, 90) * 6.28}));
const KD = 0.3;
const stripAt = (s: Strip, t: number, dz: number) => { const tau = Math.max(0, t - T_CUT - 0.02), ex = 1 - Math.exp(-tau / KD);
	const x = s.x + s.vx * KD * ex, y = TY0 + s.sgn * (2 + s.vy * KD * ex + 9 * Math.sin(tau * 2.6 + s.ph) * ex);
	const onStack = Math.abs(y - TY0) < SY && x > X0 && x < X1, zs = (onStack ? ZT : ZB) + 0.4;
	const zf = ZT + 1 + (s.vz + s.vT) * KD * ex - s.vT * tau, z = Math.max(zs, zf), air = cl((z - zs) / 45);
	const psi = s.psi + s.spin * KD * ex * 2 + 0.25 * Math.sin(tau * 1.7 + s.ph) * air, beta = (0.9 * Math.sin(tau * 5.2 + s.ph) + 0.25) * air;
	return {p: [x, y, z + dz] as V3, psi, beta}; };
const StripP: React.FC<{c: Cam; s: Strip; t: number; dz: number}> = ({c, s, t, dz}) => { const {p, psi, beta} = stripAt(s, t, dz);
	const u: V3 = [Math.cos(psi), Math.sin(psi), 0], v: V3 = [-Math.sin(psi) * Math.cos(beta), Math.cos(psi) * Math.cos(beta), Math.sin(beta)];
	const at = (a: number, b: number): V3 => [p[0] + u[0] * a + v[0] * b, p[1] + u[1] * a + v[1] * b, p[2] + u[2] * a + v[2] * b];
	const d = stPoly(c, [at(-s.L / 2, -s.w / 2), at(s.L / 2, -s.w / 2), at(s.L / 2, s.w / 2), at(-s.L / 2, s.w / 2)]); if (!d) return null;
	const lit = 0.55 + 0.45 * Math.abs(Math.cos(beta));
	return <path d={d} fill={mix('#5E4830', '#CDBD98', lit)} stroke="#5C4528" strokeWidth={0.7} strokeOpacity={0.5} />; };

/** the set falls away (3.3 → 5.2, slow at first) and is gone (its group fades 3.9 → 4.9) */
export const setDrop = (t: number) => -260 * Math.pow(seg(t, 3.3, 5.2), 2);
export const setOn = (t: number) => 1 - sstep(seg(t, 3.9, 4.9));

/* ---------- the lights of the cut (world): a warm key from above-front-right, a low rake from the hilt side for the edge ---------- */
const L_KEY: V3 = [0.35, -0.55, 0.76], L_EDGE: V3 = [-0.75, -0.55, -0.1];

export type OpenProps = {c: Cam; t: number; land: LandOpts; lights: Light[]; id: string; ringGlow?: number; lite?: number};
/** the opening's picture layers: the set (under everything) and the sword with the paper around it */
export const OpenSet: React.FC<{c: Cam; t: number}> = ({c, t}) => { const o = setOn(t); if (o < 0.004) return null; const dz = setDrop(t);
	const sh = stPoly(c, [[X0 - 4, TY0 - SY + 6, ZB + dz], [X1 + 8, TY0 - SY + 6, ZB + dz], [X1 + 14, TY0 + SY + 10, ZB + dz], [X0 + 2, TY0 + SY + 10, ZB + dz]]);
	return <g opacity={o}>
		<defs><filter id="o4sh" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="9" /></filter></defs>
		<WPool c={c} x={stw([(X0 + X1) / 2 + 30, TY0 + 10, 0])[0]} y={stw([(X0 + X1) / 2 + 30, TY0 + 10, 0])[1]} z={ZB + dz} rx={620} ry={420} col="#FFB868" a={0.42} />
		<WPool c={c} x={stw([(X0 + X1) / 2 + 20, TY0, 0])[0]} y={stw([(X0 + X1) / 2 + 20, TY0, 0])[1]} z={ZB + dz + 0.2} rx={300} ry={210} col="#FFD8A0" a={0.16} n={14} />
		{sh && <path d={sh} fill="#050201" opacity={0.6} filter="url(#o4sh)" />}
	</g>; };

export const OpenSword: React.FC<OpenProps> = ({c, t, land, lights, id, ringGlow, lite}) => {
	const xf = xfAt(t), cs = camToSword(c, xf), k0 = 1 - sstep(seg(t, 4.4, 6.4));   // k0: the cut's own light, handing over to today's lights
	const lt = lights.map((l) => lightToSword(xf, {...l, k: l.k * (1 - k0)}));
	const cutL: Light[] = k0 > 0.004 ? [lightToSword(xf, {dir: L_KEY, k: 0.82 * k0}), lightToSword(xf, {dir: L_EDGE, k: 0.7 * k0})] : [];
	/* f81 [亮]: a broad soft lobe slides along the blade, guard → tip (in 0.25 s before f81, peak ON f81, out over 0.8 s) */
	const lk = t < T_LOBE ? sstep(seg(t, T_LOBE - 0.25, T_LOBE)) : 1 - sstep(seg(t, T_LOBE, T_LOBE + 0.8));
	const lobePt = (u: number) => proj(c, toWorld(xf, bw({x0: -278, ya: 0, z0: 1000, dir: 1}, lerp(60, 400, u), 0)));
	const lp = lobePt(sstep(seg(t, T_LOBE - 0.35, T_LOBE + 0.6)));
	const lobe = lk > 0.004 ? {y: lp[1], k: lk, rx: 200, ry: 80} : undefined;
	const o: LandOpts = {...land, lights: [...lt, ...cutL], lobe: lobe ?? land.lobe, guardCut: true};
	const sp = {x0: -278, ya: 0, z0: 1000, dir: 1 as const};
	const dz = setDrop(t), so = setOn(t), pap = so > 0.004;
	/* the paper in front of / behind the blade's plane */
	const back = pap ? Array.from({length: NS}, (_, i) => cutAt(i, t) ? <Half key={`b${i}`} c={c} i={i} sgn={1} t={t} dz={dz} /> : <Whole key={`w${i}`} c={c} i={i} dz={dz} />) : null;
	const front = pap ? Array.from({length: NS}, (_, i) => cutAt(i, t) ? <Half key={`f${i}`} c={c} i={i} sgn={-1} t={t} dz={dz} /> : null) : null;
	const strips = (side: 1 | -1) => pap && t > T_CUT ? STRIPS.filter((s) => s.sgn === side).map((s, k) => <StripP key={`s${side}${k}`} c={c} s={s} t={t} dz={dz} />) : null;
	/* the edge catching the light: a thin warm line along the lower edge; the stroke runs a short bright glint along it (f5 → f11, while
	   the edge is still above the paper, base → tip) */
	const edgeO = 1 - sstep(seg(t, 3.4, 4.2));
	const edgePts = (s0: number, s1: number, n = 16) => Array.from({length: n + 1}, (_, k) => { const s = lerp(s0, s1, k / n); return toWorld(xf, bw(sp, s, -hwAt(s) + 0.3, 0.2)); });
	const edgeD = edgeO > 0.01 ? poly(c, edgePts(10, 440, 30), false) : '';
	const gu = seg(t, 5 / 30, 11.5 / 30), gk = t > 5 / 30 && t < 11.5 / 30 ? Math.sin(Math.PI * gu) : 0;
	const glintD = gk > 0.02 ? poly(c, edgePts(lerp(40, 380, gu) - 70, lerp(40, 380, gu) + 70, 14), false) : '';
	const flashN = Math.round(t * 30) - 13;
	const slit = flashN >= 0 && flashN < 3 ? stPoly(c, Array.from({length: 13}, (_, k) => [X0 + 2 + (X1 - X0 - 4) * k / 12, TY0, ZT + 0.2 + dz] as V3), false) : '';
	const swordLayer = <g>
		<Blade3D c={cs} sp={sp} id={id} land={o} />
		{edgeD && <path d={edgeD} fill="none" stroke="#FFE9B8" strokeOpacity={0.55 * edgeO} strokeWidth={1.6} strokeLinecap="round" />}
		{glintD && <g opacity={gk}><path d={glintD} fill="none" stroke="#FFE7B0" strokeOpacity={0.45} strokeWidth={11} strokeLinecap="round" /><path d={glintD} fill="none" stroke="#FFFBEE" strokeWidth={3.2} strokeLinecap="round" /></g>}
	</g>;
	/* while the paper is near, the blade sits between the far and the near halves; the guard and the hilt (nearer the lens) go on top.
	   Once the set has fallen away the shared Sword3D paints the whole sword in its own order. */
	if (!pap) return <Sword3D c={cs} sp={sp} id={id} ringGlow={ringGlow} land={o} lite={lite} />;
	return <g>
		<g opacity={so}>{back}{strips(1)}</g>
		{swordLayer}
		<g opacity={so}>{front}{strips(-1)}
			{slit && <g opacity={[1, 0.6, 0.28][flashN]}><path d={slit} fill="none" stroke="#FFE7B0" strokeOpacity={0.35} strokeWidth={6} strokeLinecap="round" /><path d={slit} fill="none" stroke="#FFFBEE" strokeWidth={2} strokeLinecap="round" /></g>}</g>
		{/* v3.5 (owner: "the handle is not one body with the sword, it overlaps"): the guard and the hilt in Sword3D's own order for
		   where the camera is along the sword (seen from the blade side, the guard covers the grip's root) */}
		{(cs.p[0] - sp.x0) * sp.dir > A.apex
			? <><Hilt3D c={cs} sp={sp} id={id} ringGlow={ringGlow} /><Guard3D c={cs} sp={sp} id={id} lite={lite} /></>
			: <><Guard3D c={cs} sp={sp} id={id} lite={lite} /><Hilt3D c={cs} sp={sp} id={id} ringGlow={ringGlow} /></>}
	</g>; };
void A; void sstep5;
