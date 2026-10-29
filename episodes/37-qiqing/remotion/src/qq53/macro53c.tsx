import React from 'react';
import {W, H, rnd, lerp, cl, seg} from '../qq50/kit50';
import {B, LacDefs, Lacquer, Vignette} from '../qq50/styleB';
import {Tag, P2} from './parts53';
import {MacroSpec, MacroCam, macroProj} from './macro53';
import {BladeMacroC} from './macrob53c';
import {MarkSet} from './blade53c';
import {litOf, hexMix, LATC} from './inscr53c';
import {SW, bladeHW} from './props53';
import {SP11} from './kfF53';
import {HandoffMacro} from './handoff53';
import {spline, sstep, sstep5} from './cam53';
import {frameOf, DA} from './master53';
/* ep53 · TakeC leg 12 (61.577 → 75.162): the macro over the blade's flat (KF10 → KF11).
   M1  61.577–66.105  the push-in over the lattice (la 15 → 40); 「原因之一：料好」 lands on DA(28) = 63.841 and leaves before M2
   M2  66.105–70.633  「镀铬？」 returns; the section cut opens at one pale diamond on 67.237; 「热镀锡 · 2025研究」 lands beside it on
                      DA(30) = 68.369; the camera goes on lowering and carries past (the question is left behind, never struck)
   M3  70.633–74.412  the hush: the cut fades, the camera eases back to KF11's picture (cells 40 → 15) and stops by 74.0; from
                      74.412 TakeC shows HandoffMacro itself. The cut's geometry is fixed to the (la 40, lw 17, seed 2) lattice, so
                      la stays 40 from 66.0 to 70.6. */
const SH10 = SW.bladeA * 10, LA10 = 20.5, LW10 = 11.8, S10 = 2, RID10 = 4, HW10 = 24;
const CAM10_0: MacroCam = {v: 16, z: 11, pitch: Math.atan(11 / 44), yaw: -2 * Math.PI / 180, f: 900, cx: 960, cy: 620, rot: -2};
const z10 = (u: number, v: number) => { const a = Math.min(1, Math.abs(v) / HW10); return RID10 * Math.pow(1 - a, 1.12); };
/** the same jittered lattice corners as BladeMacro (seed S10), so the cut's skin stops exactly at the drawn lattice lines */
const corner10 = (p: number, q: number): [number, number] => [(p + q) / 2 * LA10 - SH10, (p - q) / 2 * LW10];
/** where the lattice lines cross the line u = uc, between v0 and v1 → segments with their pale (tin) flag */
const segsAt = (uc: number, v0: number, v1: number) => { const xs: number[] = [];
	for (let p = -4; p <= 8; p++) for (let q = -4; q <= 8; q++) { const A = corner10(p, q);
		for (const Bq of [corner10(p + 1, q), corner10(p, q + 1)]) { if ((A[0] - uc) * (Bq[0] - uc) > 0 || A[0] === Bq[0]) continue; const t = (uc - A[0]) / (Bq[0] - A[0]), v = lerp(A[1], Bq[1], t); if (v > v0 && v < v1) xs.push(v); } }
	const cuts = [v0, ...xs.sort((a, b) => a - b), v1];
	return cuts.slice(0, -1).map((a, i) => { const b = cuts[i + 1], vm = (a + b) / 2, I = Math.floor((uc + SH10) / LA10 + vm / LW10), J = Math.floor((uc + SH10) / LA10 - vm / LW10);
		return {a, b, pale: ((I + J) % 2 + 2) % 2 === 0, edgeA: i > 0, edgeB: i < cuts.length - 2}; }); };
/** rotate a point of the macro group by its rot (the group is rotated about 960,540) */
const rotPt = (x: number, y: number, deg: number): P2 => { const r = deg * Math.PI / 180, dx = x - 960, dy = y - 540; return [960 + dx * Math.cos(r) - dy * Math.sin(r), 540 + dx * Math.sin(r) + dy * Math.cos(r)]; };
const UC = 30, UN = 9, V0 = 5, V1 = 20, ZF = -4.4, SKIN = 0.85;
const SectionCut: React.FC<{m: MacroCam; op: number}> = ({m, op}) => { const P = (u: number, v: number, z: number) => macroProj(m, u, v, z);
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
	return <g opacity={op}>
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

/* ---------- the camera and the land, a pure function of t ---------- */
const CAM11_: MacroCam = SP11.cam;
const T_BAR = DA(28), T_Q = 66.105, T_CUT10 = 67.237, T_TIN = DA(30), T_M3 = 70.633;
const laOf = (t: number) => (t < 70.1 ? LA10 : lerp(LA10, 15, sstep(seg(t, 70.1, 74.3))));
const B3 = (t: number) => sstep(seg(t, 70.1, 74.3));   /* producer r2: slower, cubic (was 70.9–74.1 quintic: the hush swooped) */   // 0 = KF10's land, 1 = KF11's
/* M1: the camera starts straight above the blade's flat (the paper test's last view: blade across the frame, tip left), then tips
   down and turns to look along the blade (rot −90° → −2°, pitch 90° → 14°) while it comes down onto the surface (z 105 → 11) */
export const camOf = (t: number): MacroCam => { const a = CAM10_0, b = CAM11_, u = B3(t), s = sstep5(seg(t, 61.577, 68.4)), sp2 = sstep5(seg(t, 61.9, 66.8)), push = sstep(seg(t, 66.0, 70.6)), cyS = sstep(seg(t, 61.577, 66.8));
	const zA = lerp(Math.exp(lerp(Math.log(167), Math.log(11), s)), 10.5, push), vA = lerp(0, 16, s) + 3 * push;
	const pitch = lerp(Math.PI / 2, a.pitch, sp2), rot = lerp(-90, a.rot ?? 0, sp2), cy = lerp(1580, a.cy, cyS);
	return {v: lerp(vA, b.v, u), z: lerp(zA, b.z, u), pitch: pitch * (1 - u) + b.pitch * u, yaw: lerp(0, a.yaw, s) * (1 - u) + b.yaw * u, f: a.f * (1 - u) + b.f * u, cx: 960, cy: cy * (1 - u) + b.cy * u, rot: rot * (1 - u) + (b.rot ?? 0) * u}; };
const specOf = (t: number): MacroSpec => { const u = B3(t), m = camOf(t), la = laOf(t);
	return {cam: m, hw: (x: number) => lerp(bladeHW(Math.min(Math.max(x, 0), 380) / 10) * 10, 24 - 0.006 * x, u), ridge: lerp(RID10, 5, u), strip: lerp(4, 2.2, u), la, lw: la * (u > 0 ? lerp(LW10 / LA10, 6.2 / 15, u) : LW10 / LA10), fogD: lerp(300, 220, u), lightU: lerp(44, 40, u), uMax: lerp(900, 1300, u), nearU: lerp(21, 14, u), seed: 2}; };
export const Leg12: React.FC<{t: number}> = ({t}) => { const sp = specOf(t), m = sp.cam, u = B3(t), s0 = seg(t, 61.577, 66.0);
	const cutOp = sstep(seg(t, T_CUT10, T_CUT10 + 0.35)) * (1 - sstep(seg(t, 69.5, 70.1)));
	const markO = 1 - sstep(seg(t, 62.0, 63.6));
	/* tags */
	const barIn = frameOf(t) >= frameOf(T_BAR) ? 1 : 0, barOut = sstep(seg(t, 65.35, 65.95)), barO = barIn * (1 - barOut);
	const qOn = frameOf(t) >= frameOf(T_Q) ? 1 : 0, qLeave = sstep(seg(t, 68.7, 71.0)), qO = qOn * (1 - seg(t, 70.4, 71.2));
	const tinOn = frameOf(t) >= frameOf(T_TIN) ? 1 : 0, tinO = tinOn * (1 - seg(t, 70.3, 70.95));
	const best = segsAt(UC, V0, V1).filter((s) => s.pale).sort((a, b) => (b.b - b.a) - (a.b - a.a))[0], vm = best ? (best.a + best.b) / 2 : 16;
	const sk = macroProj(m, UC, vm, z10(UC, vm) - SKIN / 2), skin = rotPt(sk[0], sk[1], m.rot ?? 0);
	const dx = -140 * qLeave;
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		<LacDefs /><Lacquer sheen={lerp(0.1, 0.06, u)} id="ho" />
		<BladeMacroC sp={sp} id="ho" pal={u} shift={-SH10 * (1 - u)}>{markO > 0.004 && <MarkSet id="ml" S={(a, w) => { const q = macroProj(m, (a - SW.bladeA) * 10, w * 10, 2.2); return [q[0], q[1]]; }} o={markO} col={(side, n) => hexMix(LATC, '#FFF2C8', Math.min(1, litOf(side, n, t)))} lit={(side, n) => Math.min(1, litOf(side, n, t))} />}{cutOp > 0.004 && <SectionCut m={m} op={cutOp} />}</BladeMacroC>
		{barO > 0.004 && <g opacity={barO} transform={`translate(${130 * barOut},${-40 * barOut})`}>
			<defs><filter id="m1blur" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="20" /></filter></defs>
			<rect x={500} y={540} width={860} height={230} rx={40} fill="rgb(18,9,6)" opacity={0.55} filter="url(#m1blur)" />
			<Tag id="m1a" x={560} y={620} s="原因之一：料好" fs={72} anchor="start" col={B.goldL} />
			<Tag id="m1b" x={560} y={720} s="铜 · 锡 约18–20% · 铅 ≈ 0" fs={56} anchor="start" col={B.cream} scrim={0.4} />
		</g>}
		{qO > 0.004 && <g opacity={qO} transform={`translate(${dx},0)`}><Tag id="k10a" x={700} y={492} s="镀铬？" fs={62} anchor="end" col={B.cream} o={0.88} /></g>}
		{tinO > 0.004 && <g opacity={tinO}><Tag id="k10b" x={846 + dx * 0.6} y={492} s="热镀锡 · 2025研究" fs={62} anchor="start" col={B.goldL} to={[skin[0], skin[1] - 4]} /></g>}
		<Vignette id="ho" a={lerp(0.6, 0.66, u)} />
	</svg>; };
void H; void cl; void B; void HandoffMacro; void frameOf;
