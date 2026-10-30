import React from 'react';
import {W, H, rnd, lerp, cl, seg} from '../qq50/kit50';
import {B, LacDefs, Lacquer, Vignette} from '../qq50/styleB';
import {Tag, P2} from './parts53';
import {MacroSpec, MacroCam, macroProj, macroZ} from './macro53';
import {BladeMacroC} from './macrob53c';
import {MarkSet, markAt} from './blade53c';
import {BladeEnd53} from './paper53c';
import {litOf, hexMix, LATC} from './inscr53c';
import {SW} from './props53';
import {LAT, latCorner, cellQuad, hwS, RIDGE_H, MACRO_S0} from './swordspec53s';
import {SP11} from './kfF53';
import {HandoffMacro} from './handoff53';
import {spline, sstep, sstep5} from './cam53';
import {frameOf, DA} from './master53';
/* ep53 · TakeC leg 12 (61.577 → 75.162): the macro over the blade's flat (KF10 → KF11).
   M1  61.577–66.105  the push-in: the camera tips down onto the blade and flies forward past the inscription (camU); 「原因之一：料好」
                      lands on DA(28) = 63.841 and leaves before M2
   M2  66.105–70.633  ONE pale diamond is the subject (SUBJ): held in the lower middle third, lit and sharp, the lattice round it
                      darker and softer (BladeMacroC focus: light falloff + depth of field); 「镀铬？」 returns beside it on 66.105;
                      the section cut opens ON it on 67.237 (tin skin over the bronze); 「热镀锡 · 2025研究」 lands on the other side
                      on DA(30) = 68.369; both tags have thin leaders to it (the question is left behind, never struck)
   M3  70.633–74.412  the hush: the cut fades, the focus opens, the camera eases back to KF11's picture and stops by 74.3; from
                      74.412 TakeC shows HandoffMacro itself (the same lattice, outline and face all through: swordspec53s). */
/* the lattice, outline and face are the sword's own (swordspec53s) all through the leg, so the hush lands on HandoffMacro with
   nothing to blend but the camera and the light */
const LA10 = LAT.A, LW10 = LAT.W;
const CAM10_0: MacroCam = {v: 16, z: 11, pitch: Math.atan(11 / 44), yaw: -2 * Math.PI / 180, f: 900, cx: 960, cy: 620, rot: -2};
const SPEC10: MacroSpec = {cam: CAM10_0, hw: (x: number) => hwS(Math.max(0, x + MACRO_S0)), ridge: RIDGE_H, strip: 3.4, s0: MACRO_S0};
/* M1: the camera flies forward along the blade by MACRO_S0 (exactly 5 cells) while it tips down, so the inscription it started
   over slides out behind it (no fade) and the macro land from 65.4 on is the stretch of blade past the inscription */
const camU = (t: number) => MACRO_S0 * sstep(seg(t, 62.6, 65.4));
const z10 = macroZ(SPEC10);
/** where the lattice lines cross the line u = uc, between v0 and v1 → segments with their pale (tin) flag */
const segsAt = (uc: number, v0: number, v1: number) => { const xs: number[] = [];
	for (let p = -4; p <= 20; p++) for (let q = -6; q <= 14; q++) { const A0 = latCorner(p, q), A = [A0[0] - MACRO_S0, A0[1]];
		for (const Bq of [latCorner(p + 1, q), latCorner(p, q + 1)].map((c) => [c[0] - MACRO_S0, c[1]])) { if ((A[0] - uc) * (Bq[0] - uc) > 0 || A[0] === Bq[0]) continue; const t = (uc - A[0]) / (Bq[0] - A[0]), v = lerp(A[1], Bq[1], t); if (v > v0 && v < v1) xs.push(v); } }
	const cuts = [v0, ...xs.sort((a, b) => a - b), v1];
	return cuts.slice(0, -1).map((a, i) => { const b = cuts[i + 1], vm = (a + b) / 2, I = Math.floor((uc + MACRO_S0) / LA10 + vm / LW10), J = Math.floor((uc + MACRO_S0) / LA10 - vm / LW10);
		return {a, b, pale: ((I + J) % 2 + 2) % 2 === 0, edgeA: i > 0, edgeB: i < cuts.length - 2}; }); };
/** rotate a point of the macro group by its rot (the group is rotated about 960,540) */
const rotPt = (x: number, y: number, deg: number): P2 => { const r = deg * Math.PI / 180, dx = x - 960, dy = y - 540; return [960 + dx * Math.cos(r) - dy * Math.sin(r), 540 + dx * Math.sin(r) + dy * Math.cos(r)]; };
/* M2's subject: ONE pale diamond (cell p 12, q 2: s 133.25, w 11.8; u 30.75). The camera holds it centred in the lower middle third
   (SUBJ_XY); it is lit and sharp, the lattice round it falls off in light and goes soft in depth; the section cut's far wall runs
   through it (3.5 mm in front of its centre), so the cut opens ON it: tin skin over the bronze under the pale diamond, bare
   bronze under its dark neighbours. */
const SUBJ = {p: 12, q: 2}, SU = (SUBJ.p + 1) / 2 * LA10 - MACRO_S0, SV = SUBJ.q / 2 * LW10, SUBJ_XY: P2 = [960, 770];
/* v3.1 (owner: "a top view is better here"): M2 looks down onto the subject, so the cut is a TAPER section (as a metallographer
   cuts a thin coating): a shallow ramp ground into the blade from the surface line UC (through the subject's widest point) down
   towards the lens; seen from above the 0.85 mm tin skin opens into a broad white band (under the pale diamond only), the cast
   bronze body below it. It opens ON 67.237: the ramp grows downward from UC (the skin band first, then the bronze). */
const UC = SU + 0.6, CUT_L = 13, CUT_D = 2.6, V0 = SV - 7.4, V1 = SV + 7.4, SKIN = 0.85, BAND = SKIN * CUT_L / CUT_D;
const SectionCut: React.FC<{m: MacroCam; op: number; open: number}> = ({m, op, open}) => { const P = (u: number, v: number, z: number) => macroProj(m, u, v, z);
	const pt = (q: [number, number, number]) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`;
	const L = Math.max(0.05, CUT_L * open), UN = UC - L, zr = (u: number, v: number) => z10(u, v) - CUT_D * (UC - u) / CUT_L;
	const band = Math.min(L, BAND), UB = UC - band;
	const rect = (ua: number, ub: number, va: number, vb: number, n = 10) => 'M' + [...Array.from({length: n + 1}, (_, i) => P(ua, lerp(va, vb, i / n), zr(ua, lerp(va, vb, i / n)))),
		...Array.from({length: n + 1}, (_, i) => P(ub, lerp(vb, va, i / n), zr(ub, lerp(vb, va, i / n))))].map(pt).join('L') + 'Z';
	const g0 = P(UC, SV, zr(UC, SV)), g1 = P(UC - CUT_L, SV, zr(UC - CUT_L, SV));
	const segs = segsAt(UC, V0, V1);
	/* the tin skin: only where the cut line runs under a pale diamond, trimmed back from the dark lattice line */
	const skins = segs.filter((s) => s.pale).map((s, k) => { const a = s.a + (s.edgeA ? 0.45 : 0), b = s.b - (s.edgeB ? 0.45 : 0);
		const top = Array.from({length: 13}, (_, i) => { const v = lerp(a, b, i / 12); return P(UC, v, zr(UC, v)); }), bot = Array.from({length: 13}, (_, i) => { const v = lerp(a, b, i / 12); return P(UB, v, zr(UB, v)); });
		return <g key={k}><path d={rect(UC, UB, a, b, 12)} fill="#FFFFFF" opacity={0.4} filter="url(#k10glow)" />
			<path d={rect(UC, UB, a, b, 12)} fill="url(#k10skin)" />
			<path d={'M' + top.map(pt).join('L')} stroke="#FFFFFF" strokeWidth={3} strokeOpacity={0.95} fill="none" />
			<path d={'M' + bot.map(pt).join('L')} stroke="#7A6A50" strokeWidth={1.6} strokeOpacity={0.7} fill="none" /></g>; });
	/* where a dark lattice line meets the cut: a thin dark line down the band (bare bronze, no skin) */
	const notches = segs.filter((s) => s.edgeA).map((s, k) => { const a = P(UC, s.a, zr(UC, s.a)), b = P(UB, s.a, zr(UB, s.a)); return <path key={k} d={`M${pt(a)}L${pt(b)}`} stroke="#2A180A" strokeWidth={4} strokeOpacity={0.5} strokeLinecap="round" />; });
	/* the cast bronze body in section: fine crystalline grain (fixed in the blade, revealed as the ramp grows) */
	const grain = Array.from({length: 200}, (_, i) => { const u = UC - BAND - (CUT_L - BAND) * rnd(i, 31), v = lerp(V0 + 0.5, V1 - 0.5, rnd(i, 32)); if (u < UN + 0.3) return null;
		const q = P(u, v, zr(u, v)), r = 1.2 + 3.0 * rnd(i, 33);
		return <circle key={i} cx={q[0]} cy={q[1]} r={r} fill={rnd(i, 34) > 0.5 ? '#FFE4A8' : '#6A4218'} opacity={0.16 + 0.2 * rnd(i, 35)} />; });
	const lip = (va: number, vb: number, u: number) => 'M' + Array.from({length: 11}, (_, i) => { const v = lerp(va, vb, i / 10); return P(u, v, z10(u, v)); }).map(pt).join('L');
	const sideL = (v: number) => 'M' + Array.from({length: 11}, (_, i) => { const u = lerp(UN, UC, i / 10); return P(u, v, z10(u, v)); }).map(pt).join('L');
	return <g opacity={op}>
		<defs>
			<linearGradient id="k10far" gradientUnits="userSpaceOnUse" x1={g0[0]} y1={g0[1]} x2={g1[0]} y2={g1[1]}><stop offset="0" stopColor="#F0C878" /><stop offset="0.4" stopColor="#D69E50" /><stop offset="1" stopColor="#7A4E22" /></linearGradient>
			<linearGradient id="k10skin" gradientUnits="userSpaceOnUse" x1={g0[0]} y1={g0[1]} x2={P(UB, SV, zr(UB, SV))[0]} y2={P(UB, SV, zr(UB, SV))[1]}><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.6" stopColor="#EEF0EC" /><stop offset="1" stopColor="#C4C8C2" /></linearGradient>
			<filter id="k10glow" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="6" /></filter>
		</defs>
		<path d={rect(UC, UN, V0, V1)} fill="url(#k10far)" />
		{grain}{skins}{notches}
		{/* the ramp lies below the face round it: a thin shadow inside the near lip and the shadow side, a lit lip on the far-right side */}
		<path d={lip(V0, V1, UN)} stroke="#140A04" strokeWidth={6} strokeOpacity={0.75} fill="none" />
		<path d={sideL(V0)} stroke="#140A04" strokeWidth={6} strokeOpacity={0.7} fill="none" />
		<path d={sideL(V1)} stroke="#FFF0C8" strokeWidth={2} strokeOpacity={0.6} fill="none" />
	</g>; };

/** the subject's raised rim catching the light: a crisp line round its inner edge, brightest on the lit (far, right) side, and one
    small glint at its lit corner — on the surface, through the macro camera */
const SubjectRim: React.FC<{m: MacroCam; q: [number, number][]; k: number}> = ({m, q, k}) => { const P = (uu: number, vv: number) => macroProj(m, uu, vv, z10(uu, vv) + 0.06);
	const edge = (a: [number, number], b: [number, number]) => 'M' + Array.from({length: 7}, (_, i) => { const p = P(lerp(a[0], b[0], i / 6), lerp(a[1], b[1], i / 6)); return `${p[0].toFixed(1)},${p[1].toFixed(1)}`; }).join('L');
	const g = P(q[2][0] - 1.2, q[2][1] + 0.2), r = 9;
	return <g opacity={k}>
		{[0, 1, 2, 3].map((e) => <path key={e} d={edge(q[e], q[(e + 1) % 4])} fill="none" stroke="#FFFBEE" strokeWidth={e === 1 || e === 2 ? 2.4 : 1.3} strokeOpacity={e === 1 || e === 2 ? 0.95 : 0.55} strokeLinecap="round" />)}
		<path d={`M${g[0]},${g[1] - r} L${g[0] + r * 0.14},${g[1] - r * 0.14} L${g[0] + r},${g[1]} L${g[0] + r * 0.14},${g[1] + r * 0.14} L${g[0]},${g[1] + r} L${g[0] - r * 0.14},${g[1] + r * 0.14} L${g[0] - r},${g[1]} L${g[0] - r * 0.14},${g[1] - r * 0.14} Z`} fill="#FFFDF4" opacity={0.9} />
	</g>; };

/* ---------- the camera and the land, a pure function of t ---------- */
const CAM11_: MacroCam = SP11.cam;
const T_BAR = DA(28), T_Q = 66.105, T_CUT10 = 67.237, T_TIN = DA(30), T_M3 = 70.633;
const B3 = (t: number) => sstep(seg(t, 69.6, 74.3));   /* v3.1: from 69.6 (was 70.1, producer r2 cubic): the way back from the top view is longer */   // 0 = KF10's land, 1 = KF11's
/* M1: the camera starts straight above the blade's flat (the paper test's last view: blade across the frame, tip left), then tips
   down and turns to look along the blade (rot −90° → −2°, pitch 90° → 14°) while it comes down onto the surface (z 105 → 11) */
/** the camera holds M2's subject at SUBJ_XY (solved each frame on the base move, eased in before 66.105, out with the hush) */
const lockW = (t: number) => sstep(seg(t, 64.4, 65.9)) * (1 - B3(t));
export const camOf = (t: number): MacroCam => { const base = camBase(t), w = lockW(t); if (w <= 0) return base;
	let m = {...base}; const tgt = rotPt(SUBJ_XY[0], SUBJ_XY[1], -(base.rot ?? 0));
	for (let k = 0; k < 3; k++) { const q = macroProj(m, SU, SV, z10(SU, SV)); m = {...m, v: m.v + (q[0] - tgt[0]) * q[2] / m.f, cy: m.cy + (tgt[1] - q[1])}; }
	return {...base, v: lerp(base.v, m.v, w), cy: lerp(base.cy, m.cy, w)}; };
/* v3.1 M2 top view: the camera cranes up and tips down onto the subject (pitch 14° → 74°) while the subject keeps its place and
   its size (22 px/mm: f grows with the distance), held from 66.5 with a slow push-in; the hush (B3) brings it back to KF11 */
const TOP_P = 74 * Math.PI / 180, TOP_S = 22, ZS = z10(SU, SV);
const CAM_TOP: MacroCam = {v: SV, z: ZS + SU * Math.tan(TOP_P), pitch: TOP_P, yaw: 0, f: TOP_S * SU / Math.cos(TOP_P), cx: 960, cy: SUBJ_XY[1], rot: -2};
const topW = (t: number) => sstep(seg(t, 64.4, 66.6));
/** blend two macro cameras (height and focal length in log, the rest linear) */
const camMix = (a: MacroCam, b: MacroCam, k: number): MacroCam => k <= 0 ? a : {v: lerp(a.v, b.v, k), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), k)), pitch: lerp(a.pitch, b.pitch, k), yaw: lerp(a.yaw, b.yaw, k),
	f: Math.exp(lerp(Math.log(a.f), Math.log(b.f), k)), cx: lerp(a.cx, b.cx, k), cy: lerp(a.cy, b.cy, k), rot: lerp(a.rot ?? 0, b.rot ?? 0, k)};
const camBase = (t: number): MacroCam => { const a = CAM10_0, s = sstep5(seg(t, 61.577, 68.4)), sp2 = sstep5(seg(t, 61.9, 66.8)), push = sstep(seg(t, 66.0, 70.6)), cyS = sstep(seg(t, 61.577, 66.8));
	const zA = lerp(Math.exp(lerp(Math.log(167), Math.log(11), s)), 10.5, push), vA = lerp(0, 16, s) + 3 * push;
	const pitch = lerp(Math.PI / 2, a.pitch, sp2), rot = lerp(-90, a.rot ?? 0, sp2), cy = lerp(1580, a.cy, cyS);
	const m1: MacroCam = {v: vA, z: zA, pitch, yaw: lerp(0, a.yaw, s), f: a.f, cx: 960, cy, rot};
	const top: MacroCam = {...CAM_TOP, f: CAM_TOP.f * (1 + 0.07 * sstep(seg(t, 66.4, 70.4)))};
	return camMix(camMix(m1, top, topW(t)), CAM11_, B3(t)); };
const specOf = (t: number): MacroSpec => { const u = B3(t), m = camOf(t), cu = camU(t);
	 return {cam: m, hw: (x: number) => hwS(Math.max(0, x + cu)), ridge: RIDGE_H, strip: 3.4, la: LA10, lw: LW10, fogD: lerp(300, 220, u), lightU: lerp(44, 40, u), uMax: lerp(900, 1300, u), nearU: lerp(21, 14, u), seed: 2}; };
export const Leg12: React.FC<{t: number}> = ({t}) => { const sp = specOf(t), m = sp.cam, u = B3(t), s0 = seg(t, 61.577, 66.0);
	const cutOpen = 1 - Math.pow(1 - seg(t, T_CUT10 - 0.02, T_CUT10 + 0.6), 3), cutOp = cl(cutOpen * 4) * (1 - sstep(seg(t, 69.5, 70.1)));
	const cu = camU(t), markO = cu < MACRO_S0 - 1 ? 1 : 0;
	/* each mark fades only as it nears the lens plane (it is leaving the bottom of the frame then) */
	const zt = macroZ(sp), markVis = (side: number, n: number) => { const [a, w] = markAt(side, n), uu = (a - SW.bladeA) * 10 - cu, d = macroProj(m, uu, w * 10, zt(uu, w * 10))[2]; return cl((d - 6) / 14); };
	/* the first 1.5 s keep the paper test's own blade (same BladeFlat / MarkSet), riding the macro camera's zoom, then it cross-fades into the macro land */
	const flatO = 1 - sstep(seg(t, 62.0, 62.8)), c0 = camOf(61.577), flatK = c0.z / m.z, flatRot = (m.rot ?? 0) - (c0.rot ?? 0);
	/* tags */
	const barIn = sstep(seg(t, 63.6, 63.9)), barOut = sstep(seg(t, 65.35, 65.95)), barO = barIn * (1 - barOut);
	const qOn = frameOf(t) >= frameOf(T_Q) ? 1 : 0, qLeave = sstep(seg(t, 68.7, 71.0)), qO = qOn * (1 - seg(t, 70.4, 71.2));
	const tinOn = frameOf(t) >= frameOf(T_TIN) ? 1 : 0, tinO = tinOn * (1 - seg(t, 70.3, 70.95));
	const best = segsAt(UC, V0, V1).filter((s) => s.pale && s.a < SV && s.b > SV)[0], vm = best ? (best.a + best.b) / 2 : SV;
	/* M2's focus: the subject is lit and sharp, the lattice round it darker and softer (in from 65.8, out through the hush) */
	const fk = sstep(seg(t, 65.6, 66.3)) * (1 - sstep(seg(t, 69.9, 71.4)));
	const R = m.rot ?? 0, scr = (uu: number, vv: number, dz = 0): P2 => { const q = macroProj(m, uu, vv, z10(uu, vv) + dz); return rotPt(q[0], q[1], R); };
	const subjQ = cellQuad({p: SUBJ.p, q: SUBJ.q, s: SU + MACRO_S0, w: SV, pale: true, i: (SUBJ.p + SUBJ.q) / 2, j: (SUBJ.p - SUBJ.q) / 2}, 0.84).map(([a, b]) => [a - MACRO_S0, b] as [number, number]);
	const leftV = scr(SU + 4.2, SV - 1.2, 0.1)   /* v3.1: on the subject's pale face above the cut (its left corner is in the cut now) */, topV = scr(subjQ[2][0], subjQ[2][1], 0.1);
	const sk = macroProj(m, UC - BAND / 2, vm, z10(UC - BAND / 2, vm) - CUT_D * BAND / 2 / CUT_L), skin = rotPt(sk[0], sk[1], m.rot ?? 0);
	const dx = -60 * qLeave;
	/* the tags sit beside the subject, level with it (placed from M2's held framing so they never wander), thin leaders to it */
	const TY = SUBJ_XY[1] - 170;
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		<LacDefs /><Lacquer sheen={lerp(0.1, 0.06, u)} id="ho" />
		<BladeMacroC sp={sp} id="ho" pal={u} shift={-cu} focus={fk > 0.004 ? {u: SU, v: SV, k: fk} : undefined}>{markO > 0.004 && <MarkSet id="ml" S={(a, w) => { const uu = (a - SW.bladeA) * 10 - cu, vv = w * 10, q = macroProj(m, uu, vv, zt(uu, vv) + 0.05); return [q[0], q[1]]; }} vis={markVis} o={markO} col={(side, n) => hexMix(LATC, '#FFF2C8', Math.min(1, litOf(side, n, t)))} lit={(side, n) => Math.min(1, litOf(side, n, t))} />}{fk > 0.004 && <SubjectRim m={m} q={subjQ} k={fk} />}{cutOp > 0.004 && <SectionCut m={m} op={cutOp} open={cutOpen} />}</BladeMacroC>
		{flatO > 0.004 && <g opacity={flatO} transform={`translate(960 540) rotate(${flatRot}) scale(${flatK}) translate(-960 -540)`}><BladeEnd53 t={t} /></g>}
		{barO > 0.004 && <g opacity={barO} transform={`translate(${130 * barOut},${-40 * barOut})`}>
			<defs><filter id="m1blur" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="20" /></filter></defs>
			<rect x={500} y={540} width={860} height={230} rx={40} fill="rgb(18,9,6)" opacity={0.55} filter="url(#m1blur)" />
			<Tag id="m1a" x={560} y={620} s="原因之一：料好" fs={72} anchor="start" col={B.goldL} />
			{/* fix4-a (#11): the Cu / Pb ≈ 0 facts are the overlay tiles' (master53v3); the tag keeps only the tin share */}
			<Tag id="m1b" x={560} y={720} s="锡 约18–20%" fs={56} anchor="start" col={B.cream} scrim={0.4} />
		</g>}
		{qO > 0.004 && <g opacity={qO}><Tag id="k10a" x={SUBJ_XY[0] - 250 + dx} y={TY} s="镀铬？" fs={56} anchor="end" col={B.cream} o={0.88} to={[leftV[0], leftV[1]]} /></g>}
		{tinO > 0.004 && <g opacity={tinO}><Tag id="k10b" x={SUBJ_XY[0] + 230} y={TY} s="热镀锡 · 2025研究" fs={56} anchor="start" col={B.goldL} to={cutOp > 0.3 ? [skin[0], skin[1] - 4] : [topV[0], topV[1]]} /></g>}
		<Vignette id="ho" a={lerp(0.6, 0.66, u)} />
	</svg>; };
void H; void cl; void B; void HandoffMacro; void frameOf;
