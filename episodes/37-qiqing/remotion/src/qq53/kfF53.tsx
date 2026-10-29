import React from 'react';
import {Img} from 'remotion';
import {W, H, rnd, lerp, cl, SANS, SERIF, SAFE_X} from '../qq50/kit50';
import {B, Pool, thB} from '../qq50/styleB';
import {SealHollow} from '../qq51/master51';
import {SEAL_SRC} from '../qq44/skin44';
import {Frame53, Sub53, Stamp53, Tag, DepthTag, Cam, lookAt, proj, poly, V3, mix, P2} from './parts53';
import {BladeMacro, MacroSpec, MacroCam, macroProj} from './macro53';
import {Knife, BZ, GLS, bladeHW, LB, SW} from './props53';
import {Sword3D} from './sword3d';
import {Cleaver, Kitchen, Glint, CAM0, SW_HOOK} from './kfA53';
import {CaseSet, SP_CASE, CAM_T} from './kfB53';
import {TITLE53, SOURCES53, lineById} from './lines53';
/* ep53 key frames, part F (final timeline, lines_bars.json):
   KF10 M2  68.4  the macro over the diamond pattern: a section cut at the edge of a pale diamond shows the thin tin skin on the
                  bronze body; 「镀铬？」 and 「热镀锡 · 2025研究」 side by side, the first never struck (director note 2).
   KF11 T1  76.9  the hardest drop: the same land, a shade duller, three tiny blooms (olive-green, a weak rust-brown rim: the knife's
                  colour, much weaker), each with a thin find-ring. Not a rusty sword.
   KF12 L1  93.5  the way up as the answer: a cut-away section of the tomb, every layer closed and named (剑鞘 · 两层棺 · 木椁 ·
                  白膏泥), air dots bouncing off the white clay, two getting through to the blade (director note 8).
   KF13 P1 106.9  the pull-back out through the case glass: the sword on its holders, and in the glass your kitchen resolving —
                  the window and the rusty cleaver lying on the sword's own edge line (Match 6, the loop closes on frame 0's line).
   KF14 END 110.6 the Juno end card over the dimmed kitchen (ep51 layout: red J stamp, gold title, question, pill, sources). */

/* ======================================================================================================================
   KF10 · M2 — 「镀铬？博物馆研究了7年多，\n结论是：菱形花纹，热镀[锡]。」
   ====================================================================================================================== */
const LA10 = 40, LW10 = 17, S10 = 5, RID10 = 4, HW10 = 36;
const CAM10: MacroCam = {v: 16, z: 11, pitch: Math.atan(11 / 44), yaw: -2 * Math.PI / 180, f: 900, cx: 960, cy: 620, rot: -2};
const z10 = (u: number, v: number) => { const a = Math.min(1, Math.abs(v) / HW10); return RID10 * Math.pow(1 - a, 1.12); };
/** the same jittered lattice corners as BladeMacro (seed S10), so the cut's skin stops exactly at the drawn lattice lines */
const corner10 = (p: number, q: number): [number, number] => [(p + q) / 2 * LA10 + (rnd(p * 131 + q, 5 + S10) - 0.5) * LA10 * 0.09, (p - q) / 2 * LW10 + (rnd(p * 131 + q, 6 + S10) - 0.5) * LW10 * 0.12];
/** where the lattice lines cross the line u = uc, between v0 and v1 → segments with their pale (tin) flag */
const segsAt = (uc: number, v0: number, v1: number) => { const xs: number[] = [];
	for (let p = -4; p <= 8; p++) for (let q = -4; q <= 8; q++) { const A = corner10(p, q);
		for (const Bq of [corner10(p + 1, q), corner10(p, q + 1)]) { if ((A[0] - uc) * (Bq[0] - uc) > 0 || A[0] === Bq[0]) continue; const t = (uc - A[0]) / (Bq[0] - A[0]), v = lerp(A[1], Bq[1], t); if (v > v0 && v < v1) xs.push(v); } }
	const cuts = [v0, ...xs.sort((a, b) => a - b), v1];
	return cuts.slice(0, -1).map((a, i) => { const b = cuts[i + 1], vm = (a + b) / 2, I = Math.floor(uc / LA10 + vm / LW10), J = Math.floor(uc / LA10 - vm / LW10);
		return {a, b, pale: ((I + J) % 2 + 2) % 2 === 0, edgeA: i > 0, edgeB: i < cuts.length - 2}; }); };
/** rotate a point of the macro group by its rot (the group is rotated about 960,540) */
const rotPt = (x: number, y: number, deg: number): P2 => { const r = deg * Math.PI / 180, dx = x - 960, dy = y - 540; return [960 + dx * Math.cos(r) - dy * Math.sin(r), 540 + dx * Math.sin(r) + dy * Math.cos(r)]; };
const UC = 30, UN = 9, V0 = 8, V1 = 26, ZF = -4.4, SKIN = 0.85;
const SectionCut: React.FC = () => { const m = CAM10, P = (u: number, v: number, z: number) => macroProj(m, u, v, z);
	const pt = (q: [number, number, number]) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`;
	const vs = Array.from({length: 27}, (_, i) => lerp(V0, V1, i / 26));
	const farTop = vs.map((v) => P(UC, v, z10(UC, v))), farBot = vs.map((v) => P(UC, v, ZF));
	const opening = 'M' + [...vs.map((v) => P(UN, v, z10(UN, v))), ...[...farTop].reverse()].map(pt).join('L') + 'Z';
	const floor = 'M' + [P(UN, V0, ZF), P(UN, V1, ZF), P(UC, V1, ZF), P(UC, V0, ZF)].map(pt).join('L') + 'Z';
	const side = (v: number) => 'M' + [...Array.from({length: 12}, (_, i) => { const u = lerp(UN, UC, i / 11); return P(u, v, z10(u, v)); }), P(UC, v, ZF), P(UN, v, ZF)].map(pt).join('L') + 'Z';
	const far = 'M' + [...farTop, ...[...farBot].reverse()].map(pt).join('L') + 'Z';
	const f0 = P(UC, (V0 + V1) / 2, z10(UC, 13)), f1 = P(UC, (V0 + V1) / 2, ZF);
	/* the tin skin: only where the cut runs under a pale diamond, trimmed back from the dark lattice line */
	const skins = segsAt(UC, V0, V1).filter((s) => s.pale).map((s, k) => { const a = s.a + (s.edgeA ? 0.45 : 0), b = s.b - (s.edgeB ? 0.45 : 0), n = 12;
		const top = Array.from({length: n + 1}, (_, i) => { const v = lerp(a, b, i / n); return P(UC, v, z10(UC, v)); }), bot = Array.from({length: n + 1}, (_, i) => { const v = lerp(a, b, i / n); return P(UC, v, z10(UC, v) - SKIN); });
		return <g key={k}><path d={'M' + [...top, ...[...bot].reverse()].map(pt).join('L') + 'Z'} fill="#FFFFFF" opacity={0.55} filter="url(#k10glow)" />
			<path d={'M' + [...top, ...[...bot].reverse()].map(pt).join('L') + 'Z'} fill="url(#k10skin)" />
			<path d={'M' + top.map(pt).join('L')} stroke="#FFFFFF" strokeWidth={2.4} strokeOpacity={0.9} fill="none" />
			<path d={'M' + bot.map(pt).join('L')} stroke="#6E6A60" strokeWidth={1.2} strokeOpacity={0.6} fill="none" /></g>; });
	/* where a dark lattice line meets the cut: a thin dark notch at the top of the wall (bare bronze, no skin) */
	const notches = segsAt(UC, V0, V1).filter((s) => s.edgeA).map((s, k) => { const a = P(UC, s.a, z10(UC, s.a)), b = P(UC, s.a, z10(UC, s.a) - 1.1); return <path key={k} d={`M${pt(a)}L${pt(b)}`} stroke="#2A180A" strokeWidth={5} strokeOpacity={0.55} strokeLinecap="round" />; });
	/* the cast bronze body in section: fine crystalline grain */
	const grain = Array.from({length: 160}, (_, i) => { const v = lerp(V0 + 0.6, V1 - 0.6, rnd(i, 31)), z = lerp(ZF + 0.3, z10(UC, v) - SKIN - 0.3, rnd(i, 32)), q = P(UC - 0.01, v, z), r = 1.2 + 3.2 * rnd(i, 33);
		return <circle key={i} cx={q[0]} cy={q[1]} r={r} fill={rnd(i, 34) > 0.5 ? '#FFE4A8' : '#6A4218'} opacity={0.14 + 0.18 * rnd(i, 35)} />; });
	return <g>
		<defs>
			<linearGradient id="k10far" gradientUnits="userSpaceOnUse" x1={f0[0]} y1={f0[1]} x2={f1[0]} y2={f1[1]}><stop offset="0" stopColor="#F0C878" /><stop offset="0.35" stopColor="#D69E50" /><stop offset="1" stopColor="#7A4E22" /></linearGradient>
			<linearGradient id="k10skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.55" stopColor="#EEF0EC" /><stop offset="1" stopColor="#C4C8C2" /></linearGradient>
			<filter id="k10fl" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="5" /></filter>
			<filter id="k10glow" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="6" /></filter>
		</defs>
		<path d={opening} fill="#1A0E07" />
		<path d={floor} fill="#3A220E" filter="url(#k10fl)" />
		<path d={side(V0)} fill="#6A4420" />
		<path d={side(V1)} fill="#3E2812" />
		<path d={far} fill="url(#k10far)" />
		{grain}{notches}{skins}
		<path d={'M' + farTop.map(pt).join('L')} stroke="#2A180A" strokeWidth={1.2} strokeOpacity={0.5} fill="none" />
	</g>; };
export const KF10: React.FC = () => {
	const sp: MacroSpec = {cam: CAM10, hw: () => HW10, ridge: RID10, strip: 4, la: LA10, lw: LW10, fogD: 300, lightU: 44, uMax: 900, nearU: 21, seed: S10};
	/* the leader goes to the middle of the widest skin segment */
	const best = segsAt(UC, V0, V1).filter((s) => s.pale).sort((a, b) => (b.b - b.a) - (a.b - a.a))[0], vm = best ? (best.a + best.b) / 2 : 16;
	const sk = macroProj(CAM10, UC, vm, z10(UC, vm) - SKIN / 2), skin = rotPt(sk[0], sk[1], CAM10.rot ?? 0);
	return <Frame53 id="k10" sheen={0.1} vig={0.6} over={<><Sub53 id="M2" /><Stamp53 id="M2" /><SealHollow /></>}>
		<BladeMacro sp={sp} id="k10"><SectionCut /></BladeMacro>
		{/* the two tags side by side, the question left behind (dimmer, drifting left), the finding pointing at the skin */}
		<Tag id="k10a" x={700} y={492} s="镀铬？" fs={62} anchor="end" col={B.cream} o={0.88} />
		<Tag id="k10b" x={846} y={492} s="热镀锡 · 2025研究" fs={62} anchor="start" col={B.goldL} to={[skin[0], skin[1] - 4]} />
	</Frame53>; };

/* ======================================================================================================================
   KF11 · T1 — 「其实，它也[锈]了。」 on the hardest drop (75.162); 76.9 = after the 3rd bloom (76.860)
   ====================================================================================================================== */
const CAM11: MacroCam = {v: -2, z: 14, pitch: 28 * Math.PI / 180, yaw: 2.5 * Math.PI / 180, f: 820, cx: 960, cy: 790, rot: -3};   // optical centre low: a steeper look at the blooms, the horizon still at ~350 for the subtitle
const RID11 = 5, ST11 = 2.2;
const hw11 = (u: number) => 24 - 0.006 * u;
const z11 = (u: number, v: number) => { const hw = hw11(u), a = Math.min(1, Math.abs(v) / hw); return RID11 * Math.pow(1 - a, 1.12) - (Math.abs(v) > hw - ST11 ? 0.9 * (Math.abs(v) - (hw - ST11)) / ST11 : 0); };
/** a soft blob lying on the blade surface (macro coordinates), projected; dz lifts it (a crust's cap) */
const blobM = (m: MacroCam, zf: (u: number, v: number) => number, u: number, v: number, r: number, seed: number, rough = 0.5, n = 11, dz = 0) => {
	const pts = Array.from({length: n}, (_, i) => { const a = (i / n) * 2 * Math.PI, rr = r * (1 - rough / 2 + rough * rnd(seed * 31 + i, 5)), uu = u + rr * Math.cos(a), vv = v + rr * Math.sin(a) * 0.8; return macroProj(m, uu, vv, zf(uu, vv) + 0.02 + dz); });
	let d = ''; for (let i = 0; i < n; i++) { const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], m0 = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], m1 = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
		d += (i === 0 ? `M${m0[0].toFixed(1)},${m0[1].toFixed(1)}` : '') + `Q${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${m1[0].toFixed(1)},${m1[1].toFixed(1)}`; }
	return d + 'Z'; };
/** a circle lying on the surface (the find-ring), projected */
const ringM = (m: MacroCam, zf: (u: number, v: number) => number, u: number, v: number, r: number) => 'M' + Array.from({length: 48}, (_, i) => { const a = (i / 48) * 2 * Math.PI, uu = u + r * Math.cos(a), vv = v + r * Math.sin(a); const p = macroProj(m, uu, vv, zf(uu, vv) + 0.05); return `${p[0].toFixed(1)},${p[1].toFixed(1)}`; }).join('L') + 'Z';
/* the three blooms in switch-on order (75.162, 75.728, 76.860): the first in the lower-right corner of the frame */
const BLOOMS: [number, number, number][] = [[22, 7.2, 1.1], [37, -6.6, 0.85], [52, 1.4, 0.95]];   // u, v, radius (macro units)
const Blooms: React.FC = () => { const m = CAM11;
	return <g>
		<defs><filter id="k11d" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" /></filter>
			<filter id="k11s" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="0.7" /></filter></defs>
		{/* the faint dulling: soft, slightly grey patches where the bronze has lost a little of its shine */}
		<g filter="url(#k11d)">{[[22, 6, 4.2], [37, -5.5, 3.6], [52, 1, 4], [30, 12, 3]].map(([u, v, r], i) => <path key={i} d={blobM(m, z11, u, v, r, 40 + i, 0.6)} fill="#5A5242" opacity={0.26} />)}</g>
		{BLOOMS.map(([u, v, r], i) => { const h = 0.32 * r;
			return <g key={i}>
				<g filter="url(#k11s)">
					{/* the stain round its foot: a weak rust-brown (the knife's colour, much weaker) */}
					<path d={blobM(m, z11, u, v, r * 1.6, 10 + i, 0.7)} fill="#7A5434" opacity={0.3} />
					{/* the crust: an olive-green foot and a lighter raised cap */}
					<path d={blobM(m, z11, u, v, r, 20 + i, 0.55)} fill="#4E5E38" opacity={0.95} />
					<path d={blobM(m, z11, u + r * 0.1, v - r * 0.05, r * 0.72, 30 + i, 0.5, 11, h)} fill="#6E7E46" />
					<path d={blobM(m, z11, u + r * 0.2, v - r * 0.15, r * 0.3, 50 + i, 0.4, 9, h * 1.1)} fill="#9AA668" opacity={0.85} />
					{Array.from({length: 6}, (_, k) => { const a = rnd(i * 9 + k, 3) * 6.28, d = r * (1.45 + 0.9 * rnd(i * 9 + k, 4)), uu = u + d * Math.cos(a), vv = v + d * Math.sin(a), p = macroProj(m, uu, vv, z11(uu, vv)); return <circle key={k} cx={p[0]} cy={p[1]} r={1.8 + 1.6 * rnd(i * 9 + k, 5)} fill="#55663E" opacity={0.75} />; })}
				</g>
				{/* the find-ring: thin, cream, broken, so it reads as a marking, not an object */}
				<path d={ringM(m, z11, u, v, r * 3.1)} fill="none" stroke="#120804" strokeWidth={5} strokeOpacity={0.35} strokeDasharray="40 12" />
				<path d={ringM(m, z11, u, v, r * 3.1)} fill="none" stroke="#FFF2D8" strokeWidth={2.8} strokeOpacity={0.85} strokeDasharray="40 12" />
			</g>; })}
	</g>; };
export const KF11: React.FC = () => {
	const sp: MacroSpec = {cam: CAM11, hw: hw11, ridge: RID11, strip: ST11, fogD: 220, lightU: 40, uMax: 1300, nearU: 14, seed: 2};
	return <Frame53 id="k11" sheen={0.06} vig={0.66} over={<><Sub53 id="T1" /><Stamp53 id="T1" /><SealHollow /></>}>
		<BladeMacro sp={sp} id="k11"><Blooms /></BladeMacro>
		{/* a shade duller than the hook's surface: a thin warm-grey veil over the whole blade */}
		<rect x={0} y={340} width={W} height={H - 340} fill="#4A4234" opacity={0.07} />
	</Frame53>; };

/* ======================================================================================================================
   KF12 · L1 — 「剑鞘、两层棺、木椁、白膏泥，\n一层层，把空气隔绝在外。」  93.5: the 白膏泥 has closed on 93.275 (beat 5),
   the 夯土 closes next (93.841). The camera has swung from E1's view over the coffin round to the front of the section face and
   is pulling back as it rises (depth on an ease-in clock: 10.8 → 6.9 m here → 0 at the surface, 95.54). World: metres, the
   section plane y = 0 (everything with y < 0 is cut away), z = 0 at the rim; the camera mirrors x (world −x is screen right).
   Sizes: 椁 5.0 × 1.9 m (KF06), outer coffin 2.64 × 1.04, inner 2.24 × 0.86, the sword 55.6 cm in its sheath on the inner floor.
   ====================================================================================================================== */
const C12 = lookAt([-1.0, -6.0, -6.9], [-1.25, 0.6, -9.45], 1380, 960, 622);
const R = (x0: number, x1: number, z0: number, z1: number, y = 0): V3[] => [[x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0]];
const pp = (q: V3): P2 => { const p = proj(C12, q); return [p[0], p[1]]; };
/** an open box cut by the section plane: walls t thick, interior visible to depth yb; colours: ring (section), inside, floor, top */
const CutBox: React.FC<{x: number; z0: number; z1: number; yb: number; t: number; ring: string; inside: string; floor: string; top: string; edge?: string; line?: string; buried?: boolean}> = ({x, z0, z1, yb, t, ring, inside, floor, top, edge = '#C89A60', line, buried}) => {
	const c = C12, xi = x - t, zi0 = z0 + t, zi1 = z1 - t;
	return <g>
		{/* the top is only seen when the box stands free in a void (the coffins in the chamber); the 椁 is buried in clay */}
		{!buried && <path d={poly(c, [[-x, 0, z1], [x, 0, z1], [x, yb + t, z1], [-x, yb + t, z1]])} fill={top} />}
		{!buried && <path d={poly(c, [[-x, yb + t, z1], [x, yb + t, z1]], false)} stroke={edge} strokeOpacity={0.35} strokeWidth={1.5} fill="none" />}
		<path d={poly(c, R(-xi, xi, zi0, zi1, yb))} fill={inside} />
		<path d={poly(c, [[-xi, 0, zi1], [-xi, yb, zi1], [-xi, yb, zi0], [-xi, 0, zi0]])} fill={mix(inside, '#000000', 0.12)} />
		<path d={poly(c, [[xi, 0, zi1], [xi, yb, zi1], [xi, yb, zi0], [xi, 0, zi0]])} fill={mix(inside, '#000000', 0.2)} />
		<path d={poly(c, [[-xi, 0, zi0], [xi, 0, zi0], [xi, yb, zi0], [-xi, yb, zi0]])} fill={floor} />
		<path d={poly(c, R(-x, x, z0, z1)) + poly(c, R(-xi, xi, zi0, zi1))} fill={ring} fillRule="evenodd" />
		{line && <path d={poly(c, R(-x + t * 0.45, x - t * 0.45, z0 + t * 0.45, z1 - t * 0.45))} fill="none" stroke={line} strokeWidth={1.6} strokeOpacity={0.75} />}
		<path d={poly(c, R(-x, x, z0, z1))} fill="none" stroke={edge} strokeOpacity={0.45} strokeWidth={1.4} />
	</g>; };
/** the sword lying flat on the inner coffin's floor in its black lacquer sheath (the sheath drawn as an x-ray shell) */
const SX0 = -0.27, SYA = 0.15, SZ = -10.445;   // pommel end x (world), axis y, top-face height
const swAt = (a: number, w: number, dz = 0): V3 => [SX0 - a / 100, SYA + w / 100, SZ + dz / 100];   // a, w, dz in cm
const SwordInSheath: React.FC<{lit?: number}> = ({lit = 1}) => { const c = C12, n = 40;
	const blade = [...Array.from({length: n + 1}, (_, i) => { const s = LB * i / n; return swAt(SW.bladeA + s, bladeHW(s)); }), ...Array.from({length: n + 1}, (_, i) => { const s = LB * (n - i) / n; return swAt(SW.bladeA + s, -bladeHW(s)); })];
	const sheath = [...Array.from({length: n + 1}, (_, i) => { const a = lerp(SW.bladeA + 0.6, SW.L + 1.6, i / n), s = Math.min(LB - 0.4, a - SW.bladeA); return swAt(a, i === n ? 0.5 : bladeHW(s) + 0.7, 0.4); }),
		...Array.from({length: n + 1}, (_, i) => { const a = lerp(SW.L + 1.6, SW.bladeA + 0.6, i / n), s = Math.min(LB - 0.4, a - SW.bladeA); return swAt(a, i === 0 ? -0.5 : -(bladeHW(s) + 0.7), 0.4); })];
	const guard = [swAt(SW.gripA, -2.78, 0.6), swAt(SW.gripA, 2.78, 0.6), swAt(SW.guardA, 2.6, 0.6), swAt(SW.guardA, -2.6, 0.6)];
	const grip = [swAt(SW.pomA, -0.86, 0.5), swAt(SW.pomA, 0.86, 0.5), swAt(SW.gripA, 0.86, 0.5), swAt(SW.gripA, -0.86, 0.5)];
	const pom = [swAt(0, -1.86, 0.8), swAt(0, 1.86, 0.8), swAt(SW.pomA, 1.86, 0.8), swAt(SW.pomA, -1.86, 0.8)];
	const a0 = pp(swAt(0, 0)), a1 = pp(swAt(SW.L, 0)), mid: P2 = [(a0[0] + a1[0]) / 2, (a0[1] + a1[1]) / 2];
	return <g>
		<defs><filter id="k12gl" x="-60%" y="-300%" width="220%" height="700%"><feGaussianBlur stdDeviation="9" /></filter></defs>
		<Pool id="k12sw" x={mid[0]} y={mid[1]} rx={260} ry={80} a={0.6 * lit} col="#FFC870" />
		<path d={poly(c, blade)} fill="#FFD68A" filter="url(#k12gl)" opacity={0.95 * lit} />
		<path d={poly(c, [swAt(0, 0, 1), swAt(SW.L, 0, 1)], false)} stroke="#FFD68A" strokeWidth={12} strokeLinecap="round" filter="url(#k12gl)" opacity={0.9 * lit} />
		<path d={poly(c, blade)} fill="#F2C878" stroke="#FFF3CF" strokeWidth={1.2} />
		<path d={poly(c, [swAt(SW.bladeA + 0.5, 0, 0.1), swAt(SW.L - 1.2, 0, 0.1)], false)} stroke="#FFF8E0" strokeWidth={1.4} fill="none" />
		<path d={poly(c, grip)} fill={BZ.mid} /><path d={poly(c, pom)} fill={BZ.body} stroke={BZ.line} strokeWidth={1} />
		<path d={poly(c, guard)} fill={GLS.body} stroke={BZ.lit} strokeWidth={1.2} />
		{/* the sheath: black lacquer, closed over the blade, drawn as a translucent shell so the blade still glows through */}
		<path d={poly(c, sheath)} fill="#080404" opacity={0.5} />
		<path d={poly(c, sheath)} fill="none" stroke="#8A6650" strokeWidth={1.6} strokeOpacity={0.85} />
		<path d={poly(c, sheath.slice(4, n - 3), false)} fill="none" stroke="#B8432A" strokeWidth={1.2} strokeOpacity={0.6} transform="translate(0,-2)" />
	</g>; };
/** the mottle of rammed earth on the section face */
const Mottle12: React.FC<{z0: number; z1: number; n: number; seed: number}> = ({z0, z1, n, seed}) => <g>{Array.from({length: n}, (_, i) => {
	const x = lerp(-3.45, 3.45, rnd(i, seed)), z = lerp(z0, z1, rnd(i, seed + 1)), [sx, sy] = pp([x, 0, z]), r = 4 + 9 * rnd(i, seed + 2);
	if (sx < -40 || sx > W + 40 || sy < -40 || sy > H + 40) return null;
	return <ellipse key={i} cx={sx} cy={sy} rx={r} ry={r * 0.6} fill={['#8A6E40', '#6E6A5C', '#7A4A30', '#9A8458', '#4A3A28'][i % 5]} opacity={0.4} />; })}</g>;
export const KF12: React.FC = () => { const c = C12;
	const clayTop = (x: number) => pp([x, 0, -8.2])[1];
	/* air: pale dots drifting down through the fill; almost all bounce off the white clay (a short V: in, touch, out) */
	const bounces = Array.from({length: 17}, (_, i) => { const xw = lerp(-3.3, 2.0, (i + 0.5) / 17 + (rnd(i, 61) - 0.5) * 0.05), [sx] = pp([xw, 0, -8.2]), ty = clayTop(xw) - 3;
		const inn: P2 = [sx - 26 - 20 * rnd(i, 62), ty - 46 - 40 * rnd(i, 63)], out: P2 = [sx + 22 + 26 * rnd(i, 64), ty - 30 - 50 * rnd(i, 65)], ph = rnd(i, 66);
		if (sx < 1010 || out[0] > 1720) return null;   // keep the subtitle's corner and the right column clear
		void ph;
		return <g key={i} opacity={0.9}>
			<path d={`M${inn[0]},${inn[1]} L${sx},${ty} L${out[0]},${out[1]}`} fill="none" stroke="#D8ECF2" strokeWidth={1.6} strokeOpacity={0.35} strokeDasharray="3 5" />
			<circle cx={sx} cy={ty} r={7} fill="none" stroke="#D8ECF2" strokeOpacity={0.35} strokeWidth={1.4} />
			<circle cx={out[0]} cy={out[1]} r={5.5} fill="#E6F4F8" /></g>; });
	const falling = Array.from({length: 16}, (_, i) => { const x = lerp(1010, 1700, rnd(i, 71)), y = lerp(232, 372, rnd(i, 72));
		return <g key={i}><path d={`M${x - 8},${y - 26} L${x},${y}`} stroke="#D8ECF2" strokeOpacity={0.3} strokeWidth={1.6} /><circle cx={x} cy={y} r={5} fill="#E6F4F8" opacity={0.85} /></g>; });
	/* two get through: thin dashed paths down through the clay, the 椁 roof and both lids to the blade, ending in a tiny green speck */
	const leak = (pts: V3[], i: number) => { const sp = pts.map(pp), end = sp[sp.length - 1];
		return <g key={`l${i}`}><path d={'M' + sp.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L')} fill="none" stroke="#E6F4F8" strokeWidth={2} strokeOpacity={0.75} strokeDasharray="5 6" />
			<circle cx={sp[0][0]} cy={sp[0][1]} r={5.5} fill="#E6F4F8" />
			<circle cx={end[0]} cy={end[1]} r={4.2} fill="#7E9A5A" stroke="#E6F4F8" strokeWidth={1.4} />
			<circle cx={end[0]} cy={end[1]} r={13} fill="none" stroke="#E6F4F8" strokeOpacity={0.6} strokeWidth={1.4} /></g>; };
	const leaks = [leak([[-0.75, 0, -7.95], [-0.68, 0, -8.6], [-0.58, 0, -9.2], [-0.62, 0.05, -9.85], [-0.55, SYA, -10.43]], 0),
		leak([[-0.2, 0, -7.95], [-0.1, 0, -8.55], [-0.2, 0, -9.3], [-0.32, 0.06, -9.95], [-0.4, SYA, -10.43]], 1)];
	/* the labels: a column over the dark natural soil at the right, leaders to each closed layer */
	const L = (q: V3) => pp(q);
	const lx = 1500, o1 = L([-1.32 + 0.04, 0, -9.85]), o2 = L([-1.12 + 0.035, 0, -10.05]), dy = 52;
	return <Frame53 id="k12" ground={false} vig={0.5} over={<><Sub53 id="L1" /><Stamp53 id="L1" /><DepthTag v={6.9} /><SealHollow /></>}>
		<defs><linearGradient id="k12wc" gradientUnits="userSpaceOnUse" x1={0} y1={clayTop(0)} x2={0} y2={pp([0, 0, -11.3])[1]}><stop offset="0" stopColor="#9E9A8B" /><stop offset="1" stopColor="#77736A" /></linearGradient></defs>
		{/* natural soil, then the pit's fill: 夯土 (rammed courses), 青灰泥, 白膏泥 around the chamber */}
		<path d={poly(c, R(-9, 9, -14, -3))} fill="#2A1E16" />
		{[-5.3, -6.4, -7.6, -8.9, -10.1, -11.2].map((z, i) => <g key={i}>{[[-9, -3.5], [3.5, 9]].map(([a, b], k) => <path key={k} d={poly(c, Array.from({length: 9}, (_, j) => [lerp(a, b, j / 8), 0, z + 0.08 * Math.sin(j * 1.7 + i)] as V3), false)} stroke="#3E2E22" strokeWidth={2} fill="none" />)}</g>)}
		<path d={poly(c, R(-3.5, 3.5, -7.0, -3))} fill="#54402A" />
		<Mottle12 z0={-3.2} z1={-6.95} n={160} seed={12} />
		{Array.from({length: 16}, (_, i) => -3.25 - i * 0.25).map((z) => <path key={z} d={poly(c, [[-3.5, 0, z], [3.5, 0, z]], false)} stroke="#1E140C" strokeOpacity={0.4} strokeWidth={1.2} fill="none" />)}
		<path d={poly(c, R(-3.5, 3.5, -8.2, -7.0))} fill="#434C4B" />
		{[-7.4, -7.8].map((z) => <path key={z} d={poly(c, [[-3.5, 0, z], [3.5, 0, z]], false)} stroke="#2E3534" strokeOpacity={0.6} strokeWidth={1.2} fill="none" />)}
		<path d={poly(c, R(-3.5, 3.5, -11.3, -8.2))} fill="url(#k12wc)" />
		{Array.from({length: 120}, (_, i) => { const [sx, sy] = pp([lerp(-3.45, 3.45, rnd(i, 81)), 0, lerp(-11.25, -8.25, rnd(i, 82))]); return <circle key={i} cx={sx} cy={sy} r={1.5 + 2.5 * rnd(i, 83)} fill={rnd(i, 84) > 0.5 ? '#B4B0A0' : '#68645A'} opacity={0.3} />; })}
		{/* the clay's top: the seal line the air stops at */}
		<path d={poly(c, [[-3.5, 0, -8.2], [3.5, 0, -8.2]], false)} stroke="#EDE6D2" strokeOpacity={0.7} strokeWidth={2.4} fill="none" />
		{[-3.5, 3.5].map((x) => <path key={x} d={poly(c, [[x, 0, -3], [x, 0, -11.3]], false)} stroke="#140C08" strokeWidth={3} strokeOpacity={0.8} fill="none" />)}
		{/* the wooden chamber (椁), closed, cut: plank section, the chamber's dark interior behind */}
		<CutBox x={2.5} z0={-10.8} z1={-8.9} yb={1.3} t={0.18} ring="#56402E" inside="#2A1D14" floor="#3A2A1E" top="#4A3626" buried />
		{[-9.0, -10.71].map((z) => <path key={z} d={poly(c, [[-2.5, 0, z], [2.5, 0, z]], false)} stroke="#2A1C12" strokeOpacity={0.7} strokeWidth={1.2} fill="none" />)}
		{/* two of the tomb's other swords, faint, on the chamber floor (E1; positions schematic) */}
		{[[1.95, 0.5], [1.6, 0.95]].map(([x, y], i) => { const a = pp([x, y, -10.6]), b = pp([x - 0.5, y + 0.05, -10.6]); return <g key={i} opacity={0.55}><path d={`M${a[0]},${a[1]} L${b[0]},${b[1]}`} stroke="#E8BC66" strokeWidth={3} strokeLinecap="round" /><path d={`M${a[0]},${a[1]} L${b[0]},${b[1]}`} stroke="#FFD890" strokeWidth={9} strokeOpacity={0.18} strokeLinecap="round" /></g>; })}
		{/* the two coffins, closed, cut: black lacquer with the painted red line; the inner one lacquered red inside */}
		<CutBox x={1.32} z0={-10.62} z1={-9.58} yb={0.44} t={0.08} ring="#120A08" inside="#1A0E0B" floor="#24150F" top="#2A1B15" line="#7A2A1C" />
		<CutBox x={1.12} z0={-10.54} z1={-9.68} yb={0.31} t={0.07} ring="#160C0A" inside="#3A140D" floor="#2E100B" top="#2E1D16" line="#8A3020" />
		<SwordInSheath />
		{/* air */}
		{falling}{bounces}{leaks}
		{/* the names, each on the layer it closed (one per beat from 91.011) */}
		<Tag id="k12a" x={lx} y={424 + dy} s="白膏泥" fs={52} col={B.cream} to={L([-3.05, 0, -8.55])} />
		<Tag id="k12b" x={lx} y={560 + dy} s="木椁" fs={52} col={B.cream} to={L([-2.41, 0, -9.5])} />
		<Tag id="k12c" x={lx} y={696 + dy} s="两层棺" fs={52} col={B.cream} to={o1} />
		<path d={`M${o2[0]},${o2[1]} L${lx - 52 * 0.35},${696 + dy - 52 * 0.36}`} fill="none" stroke={B.lac} strokeWidth={5} strokeOpacity={0.6} />
		<path d={`M${o2[0]},${o2[1]} L${lx - 52 * 0.35},${696 + dy - 52 * 0.36}`} fill="none" stroke={B.goldL} strokeWidth={2.2} />
		<circle cx={o2[0]} cy={o2[1]} r={5} fill={B.goldL} stroke={B.lac} strokeWidth={1.5} />
		<Tag id="k12d" x={lx} y={832 + dy} s="剑鞘" fs={52} col={B.goldL} to={L(swAt(SW.L - 4, -bladeHW(LB - 4 - SW.bladeA + SW.bladeA) - 1.2, 0.6))} />
	</Frame53>; };

/* ======================================================================================================================
   KF13 · P1 — 「它不是不会锈，\n是那座墓，替它挡了[两千多年]。」  106.9 = DA(47) 106.861: the camera has backed out through
   the case glass; in the glass the reflection has resolved into your kitchen — the night window, the rack, and your cleaver lying
   on the sword's own edge line, tip to tip (the frame-0 match, reversed). The sword is real and brightest; the kitchen is
   reflection (screen blend, ~55 %). Next: the camera keeps backing until the kitchen is real and the sword is only a glow.
   ====================================================================================================================== */
export const KF13: React.FC = () => { const c = CAM_T;
	const tip = proj(c, [SP_CASE.x0 + 556, 0, SP_CASE.z0]), edgeY = proj(c, [SP_CASE.x0 + 520, -24, SP_CASE.z0 + 2])[1];
	const k = 19, sq = 0.42, kx = tip[0] - 22 - 20.4 * k, ky = edgeY - 9.6 * k * sq;   // the cleaver: front end just short of the sword's tip, edge on its edge line
	return <Frame53 id="k13" ground={false} vig={0.6} over={<><Sub53 id="P1" /><Stamp53 id="P1" /><SealHollow /></>}>
		<CaseSet c={c} id="k13" />
		<Sword3D c={c} sp={SP_CASE} id="k13s" />
		<Glint x={proj(c, [-170, 22, 1002])[0]} y={proj(c, [-170, 22, 1002])[1]} r={12} o={0.7} />
		{/* the reflection in the front glass: your kitchen, behind the camera */}
		<g style={{mixBlendMode: 'screen'}} opacity={0.9}>
			<defs><filter id="k13r" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.4" /></filter>
				<linearGradient id="k13w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2A3E5A" /><stop offset="1" stopColor="#16243A" /></linearGradient></defs>
			<g filter="url(#k13r)">
				{/* the window over the sink: night outside, a few far lights, the muntins */}
				<g transform="translate(860,176)" opacity={0.55}>
					<rect x={0} y={0} width={520} height={360} fill="url(#k13w)" />
					{Array.from({length: 22}, (_, i) => <circle key={i} cx={20 + 480 * rnd(i, 91)} cy={210 + 130 * rnd(i, 92)} r={2 + 2.5 * rnd(i, 93)} fill="#FFD9A0" opacity={0.5 + 0.4 * rnd(i, 94)} />)}
					<path d="M260,0 V360 M0,180 H520" stroke="#0C0A08" strokeWidth={12} /><rect x={0} y={0} width={520} height={360} fill="none" stroke="#0C0A08" strokeWidth={16} />
					<rect x={-30} y={360} width={580} height={22} fill="#3A3430" />
				</g>
				{/* the drying rack and your cleaver, lying on the sword's edge line */}
				{[-1, 0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${kx - 120 + i * 78},${ky + 92} L${kx - 60 + i * 78},${ky + 8}`} stroke="#8A8E8E" strokeWidth={3} strokeOpacity={0.6} />)}
				<path d={`M${kx - 170},${ky + 70} L${kx + 520},${ky + 70}`} stroke="#8A8E8E" strokeWidth={3} strokeOpacity={0.5} />
				<Knife x={kx} y={ky} k={k} squash={sq} id="k13k" rust={1} />
			</g>
		</g>
		{/* the glass itself: the reflection streaks and the frame posts at both edges, as on the way in (KF03) */}
		<defs><filter id="k13b" x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation="14" /></filter></defs>
		<g filter="url(#k13b)"><rect x={-60} y={-40} width={110} height={H + 80} fill="#050302" opacity={0.85} /><rect x={W - 50} y={-40} width={110} height={H + 80} fill="#050302" opacity={0.85} />
			<rect x={56} y={-40} width={8} height={H + 80} fill="#E9EEF0" opacity={0.2} /><rect x={W - 62} y={-40} width={6} height={H + 80} fill="#E9EEF0" opacity={0.15} /></g>
		<path d="M1480,-40 L1640,-40 L1080,1120 L920,1120 Z" fill="#F4F8FA" opacity={0.04} />
		<path d="M1650,-40 L1676,-40 L1116,1120 L1090,1120 Z" fill="#F4F8FA" opacity={0.07} />
	</Frame53>; };

/* ======================================================================================================================
   KF14 · END — 109.125 → 113.125 (4.0 s), then the 0.5 s fade. The camera is back at frame 0's framing (your knife on the rack,
   the faint reflected glow of the sword); the card dims it to ~30 %. Layout = ep51 (partB EndCard / KF51A KF16): the red J stamp
   pressed on 109.125 (f3274), title (gold, two rows) +0.35, the question (76 px, one row, ？ pulled back) +0.7, the pill by +1.2,
   sources +1.3; no subtitle, stamp or corner seal. 110.6 = everything in.
   ====================================================================================================================== */
export const END_Q53 = lineById('END').s;
export const EndCard53: React.FC<{o?: number}> = ({o = 1}) => { const fs = 76, q = END_Q53, tw = fs * q.length * 1.03, [t1, t2] = TITLE53;
	return <div style={{position: 'absolute', inset: 0, opacity: o}}>
		<div style={{position: 'absolute', inset: 0, background: 'rgba(8,4,3,0.72)'}} />
		<Img src={SEAL_SRC} style={{position: 'absolute', left: 960 - 70, top: 120, width: 140, height: 140, transform: 'rotate(-6deg)', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 60, lineHeight: 1.35, letterSpacing: '0.05em', color: B.gold, textShadow: thB.halo, whiteSpace: 'nowrap'}}>
			{t1.slice(0, -1)}<span style={{marginRight: '-0.05em'}}>{t1.slice(-1)}</span><br />{t2.slice(0, -1)}<span style={{marginRight: '-0.55em'}}>{t2.slice(-1)}</span></div>
		<div style={{position: 'absolute', left: 960 - tw / 2 - 260, top: 560 - 150, width: tw + 520, height: fs * 1.5 + 300, background: 'radial-gradient(closest-side, rgba(16,7,4,0.42), rgba(16,7,4,0.36) 45%, rgba(16,7,4,0.15) 80%, rgba(16,7,4,0))'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: fs, lineHeight: 1.5, letterSpacing: '0.03em', color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap'}}>{q.slice(0, -1)}<span style={{marginRight: '-0.53em'}}>{q.slice(-1)}</span></div>
		<div style={{position: 'absolute', left: 760, top: 790, width: 400, height: 58, borderRadius: 29, border: `2px solid ${B.gold}`, background: 'rgba(255,217,138,0.08)', textAlign: 'center', lineHeight: '58px', fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: '0.1em', color: B.gold}}>关注 Juno · 一起看懂世界</div>
		<div style={{position: 'absolute', left: SAFE_X, right: SAFE_X, top: 905, textAlign: 'center', fontFamily: SANS, fontSize: 24, lineHeight: 1.6, color: '#F2E6CC', opacity: 0.78, whiteSpace: 'nowrap'}}>{SOURCES53}</div>
	</div>; };
/** frame 0's framing, at the end: the knife on the rack (more rust than at frame 0), the sword only a faint glow in the window */
const KitchenEnd: React.FC = () => { const c = CAM0, mid = proj(c, [480, -19, 0]);
	return <g>
		<defs><filter id="k14Far" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4" /></filter></defs>
		<Kitchen c={c} />
		<Pool id="k14d" x={mid[0]} y={mid[1]} rx={560} ry={330} a={0.75} col="#080403" />
		<Pool id="k14s" x={mid[0] - 20} y={mid[1] + 10} rx={300} ry={170} a={0.2} col="#FFB868" />
		<g filter="url(#k14Far)" opacity={0.4}><Sword3D c={c} sp={SW_HOOK} id="k14s" /></g>
		<Cleaver c={c} rho={0.95} />
	</g>; };
export const KF14: React.FC = () => <Frame53 id="k14" sheen={0.1} vig={0.6} over={<EndCard53 />}><KitchenEnd /></Frame53>;
void H; void cl;
