import React from 'react';
import {rnd, lerp, cl} from '../qq50/kit50';
import {Pool} from '../qq50/styleB';
import {mix} from './parts53';
import {LAT, PALE} from './props53';
import {MacroCam, MacroSpec, macroProj} from './macro53';
import {LATTICE} from './blade53c';
/* ep53 · the approved MACRO look (KF53 style frame 3) as a reusable component: the camera skims a few millimetres above
   the blade; the diamond lattice is the land, draped over the raised central ridge that runs to the vanishing point; the
   polished edge strips fall away on both sides; a raking warm light catches the raised rims of the pale (tin-rich) cells.
   Parameters let the same land serve the hook (glide tip → guard, the blade widens with distance) and the macro zoom. */
export const BladeMacroC: React.FC<{sp: MacroSpec; id: string; pal: number; shift?: number; children?: React.ReactNode; rustU?: [number, number, number][]}> = ({sp, id, pal, shift = 0, children, rustU}) => {
	const m = sp.cam, RIDGE = sp.ridge ?? 5, STRIP = sp.strip ?? 2.2, LA = sp.la ?? 15, LW = sp.lw ?? 6.2, FOGD = sp.fogD ?? 200, FOG = sp.fog ?? '#1E100B', LU = sp.lightU ?? 75, UMAX = sp.uMax ?? 1400, NU = sp.nearU ?? 34, S = sp.seed ?? 0;
	const hwAt = sp.hw;
	const zAt = (u: number, v: number) => { const hw = hwAt(u), a = Math.min(1, Math.abs(v) / hw); return RIDGE * Math.pow(1 - a, 1.12) - (Math.abs(v) > hw - STRIP ? 0.9 * (Math.abs(v) - (hw - STRIP)) / STRIP : 0); };
	const PT = (u: number, v: number) => { const p = macroProj(m, u, v, zAt(u, v)); return `${p[0].toFixed(1)},${p[1].toFixed(1)}`; };
	const fogOf = (u: number) => 1 - Math.exp(-Math.max(0, u - 30) / FOGD);
	type Cell = {u: number; v: number; d: string; dIn: string; dCore: string; pale: boolean; col: string; line: number; lineIn: number; rim: number; fog: number};
	const cells: Cell[] = [];
	const corner = (p: number, q: number): [number, number] => [(p + q) / 2 * LA + shift + (rnd(p * 131 + q, 5 + S) - 0.5) * LA * 0.09 * pal, (p - q) / 2 * LW + (rnd(p * 131 + q, 6 + S) - 0.5) * LW * 0.12 * pal];
	/* the lattice runs on past the base end (both ends beyond the frame) while the camera looks down; U0 = the nearest u still in front of the lens. At pal = 1 it is BladeMacro's 8 */
	/* producer r3: every switch below is continuous in pal (kk2 = 1 up to pal 0.6, 0 at pal 1), so the hush has no one-frame pop where pal reaches 1 */
	const kk2 = cl((1 - pal) / 0.4), U0 = 8 + (Math.min(8, Math.max(-450, -(m.z * Math.sin(m.pitch) - 8) / Math.max(0.02, Math.cos(m.pitch)) * 0.9)) - 8) * kk2;
	const quad = (i: number, j: number, sc: number) => { const pts: string[] = [], ca = (i + j + 1) / 2 * LA + shift, cw = (i - j) / 2 * LW;
		const cs = ([[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]] as [number, number][]).map(([p, q]) => { const [u, v] = corner(p, q); return [ca + (u - ca) * sc, cw + (v - cw) * sc] as [number, number]; });
		for (let e = 0; e < 4; e++) { const [a0, b0] = cs[e], [a1, b1] = cs[(e + 1) % 4];
			for (let s2 = 0; s2 < 6; s2++) { const t = s2 / 6, uu = lerp(a0, a1, t), lim = hwAt(Math.max(uu, U0)) - STRIP, vv = Math.max(-lim, Math.min(lim, lerp(b0, b1, t))); pts.push(PT(Math.max(uu, U0), vv)); } }
		return 'M' + pts.join('L') + 'Z'; };
	const HWM = Math.max(hwAt(10), hwAt(UMAX));
	for (let i = -14; i <= 220; i++) for (let j = -14; j <= 220; j++) {
		const ca = (i + j + 1) / 2 * LA + shift, cw = (i - j) / 2 * LW;
		if (ca < U0 - LA * 0.55 * kk2 || ca > UMAX || Math.abs(cw) > Math.min(HWM, hwAt(ca) + LW) + LW / 2) continue;
		const pale = ((i + j) % 2 + 2) % 2 === 0, side = cw > 0.5 ? 1 : cw < -0.5 ? -0.25 : 0.4;
		const spec = Math.exp(-Math.pow((ca - LU) / 40, 2)) * (0.45 + 0.55 * side), fog = fogOf(ca);
		const jit = (rnd(i * 31 + j, 71 + S) - 0.5) * 0.12, base = mix(pale ? '#D2B886' : '#B98443', pale ? '#8A6A3E' : '#6E4824', 0.2 + jit), lit = side > 0.5 ? 0 : 0.42;
		const nearDim = cl((40 - ca) / 30) * 0.28;
		const col0 = mix(mix(mix(mix(base, '#3A2410', lit), '#FFF8E4', spec * (pale ? 1 : 0.3)), '#120804', nearDim), FOG, fog * 0.94);
		const sideL = cw < -0.5 ? 1 : cw > 0.5 ? -0.25 : 0.4, specL = Math.exp(-Math.pow((ca - LU) / 40, 2)) * (0.45 + 0.55 * sideL), litL = sideL > 0.5 ? 0 : 0.42;
		const baseL = mix(mix(pale ? mix(LATTICE.gold, PALE, 0.22) : LATTICE.gold, '#6A4420', cw > 0.5 ? 0.5 : cw < -0.5 ? 0 : 0.2), '#FFF0CC', cw < -0.5 ? 0.2 : 0), colL = mix(mix(mix(baseL, '#FFF8E4', specL * (pale ? 0.3 : 0.1)), '#120804', nearDim), FOG, fog * 0.94), col = mix(colL, col0, pal);
		void litL;
		const d = macroProj(m, ca, cw, zAt(ca, cw))[2]; if (d <= 1) continue;
		cells.push({u: ca, v: cw, d: quad(i, j, 1), dIn: quad(i, j, 0.84), dCore: quad(i, j, 0.24), pale, col, line: lerp(1.3 * m.f / d, Math.max(0.4, m.f * 0.36 / d), pal), lineIn: lerp(0.45 * m.f / d, Math.max(0.4, m.f * 0.36 / d) * 0.38, pal), rim: spec, fog}); }
	cells.sort((a, b) => b.u - a.u);
	const CellG: React.FC<{c: Cell; o?: number}> = ({c, o = 1}) => <g opacity={o}>
		<path d={c.d} fill={c.col} stroke={mix(LAT, FOG, c.fog * 0.8)} strokeWidth={c.line} strokeLinejoin="round" />
		<path d={c.dIn} fill="none" stroke={mix(LAT, FOG, c.fog * 0.8)} strokeWidth={c.lineIn} strokeOpacity={0.8} />
		{!c.pale && c.u < 160 && <path d={c.dCore} fill={mix(LAT, FOG, c.fog * 0.8)} opacity={0.7} />}
		{c.pale && c.fog < 0.75 && <path d={c.dIn} fill="none" stroke="#FFFBEE" strokeWidth={c.line * (0.3 + 0.4 * c.rim)} strokeOpacity={cl(0.2 + 0.8 * c.rim) * (1 - c.fog)} transform={`translate(${c.line * 0.2},${-c.line * 0.25})`} />}
	</g>;
	/* producer r2: near (blurred) and mid (sharp) overlap in a band and cross over by distance, so no cell pops sharp/blurred as it crosses NU */
	/* …and both soften to BladeMacro's hard split as pal → 1, so the hush lands exactly on HandoffMacro (no focus snap at 74.412) */
	const kk = kk2, nW = (u: number) => (1 - cl((u - NU * (1 - 0.3 * kk)) / (NU * 0.6 * kk + 1e-6))) * cl((u - U0 + LA * 0.55 * kk) / (LA * 0.6 * kk + 1e-6)), near = cells.filter((c) => nW(c.u) > 0.004), mid = cells.filter((c) => c.u >= NU * (1 - 0.3 * kk) && c.u < 220), far = cells.filter((c) => c.u >= 220);
	const pits = Array.from({length: 220}, (_, i) => { const u = 20 + 260 * Math.pow(rnd(i, 81 + S), 1.6), v = (rnd(i, 82 + S) - 0.5) * 2 * (hwAt(u) - STRIP), p = macroProj(m, u, v, zAt(u, v)), r = m.f * (0.08 + 0.16 * rnd(i, 83 + S)) / p[2];
		return p[2] > 1 ? <ellipse key={i} cx={p[0]} cy={p[1]} rx={r} ry={r * 0.45} fill="#2A180C" opacity={0.3 + 0.25 * rnd(i, 84 + S)} /> : null; });
	const strip = (s: 1 | -1) => Array.from({length: 60}, (_, k) => { const u0 = 10 * Math.pow(UMAX / 10, k / 60), u1 = 10 * Math.pow(UMAX / 10, (k + 1) / 60), fog = fogOf(u0);
		const spec = Math.exp(-Math.pow((u0 - LU) / 45, 2));
		const col = mix(mix(s > 0 ? mix('#E4C078', '#F2D79C', pal) : mix('#F6E2B0', '#A97C40', pal), '#FFFBEA', spec * (s > 0 ? 0.7 : 0.25) * (pal > 0.5 ? 1 : 0.5)), FOG, fog * 0.92);
		const a = hwAt(u0) - STRIP, b = hwAt(u0), c = hwAt(u1) - STRIP, d = hwAt(u1);
		return <path key={k} d={`M${PT(u0, s * a)}L${PT(u0, s * b)}L${PT(u1, s * d)}L${PT(u1, s * c)}Z`} fill={col} stroke={col} strokeWidth={0.6} />; });
	const stripExt = (s: 1 | -1) => { if (U0 >= 8) return null; const a = hwAt(8) - STRIP, b = hwAt(8), col = mix(s > 0 ? mix('#E4C078', '#F2D79C', pal) : mix('#F6E2B0', '#A97C40', pal), FOG, fogOf(10) * 0.92);
		return <path key={`se${s}`} d={`M${PT(U0, s * a)}L${PT(U0, s * b)}L${PT(10, s * b)}L${PT(10, s * a)}Z`} fill={col} stroke={col} strokeWidth={0.6} />; };
	const ridge = Array.from({length: 30}, (_, k) => { const us = Array.from({length: 5}, (_, q) => 9 * Math.pow(UMAX / 9, (k + q / 4) / 30)), fog = fogOf(us[0]);
		const pts = us.map((u) => macroProj(m, u, 0, RIDGE)), d0 = pts[0][2];
		return <polyline key={k} points={pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} fill="none" stroke="#FFF2D0" strokeOpacity={0.7 * (1 - fog)} strokeWidth={Math.max(0.8, m.f * 0.12 / d0)} strokeLinecap="butt" />; });
	const polish = Array.from({length: 26}, (_, i) => { const u0 = 26 + 60 * rnd(i, 92 + S), u1 = u0 + 80 + 260 * rnd(i, 93 + S), v = (rnd(i, 91 + S) - 0.5) * 2 * (hwAt(u0) - STRIP - 1);
		const pts = Array.from({length: 8}, (_, q) => { const u = lerp(u0, u1, q / 7); return macroProj(m, u, v, zAt(u, v)); });
		return <polyline key={i} points={pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} fill="none" stroke="#FFF4D8" strokeOpacity={0.07 + 0.06 * rnd(i, 94 + S)} strokeWidth={1.2} />; });
	const glints = cells.filter((c) => c.pale && c.rim > 0.6 && c.u > 45 && c.u < 120 && c.v > 0 && c.v < hwAt(c.u) - STRIP - LW).filter((_, i) => i % 3 === 0).slice(0, 6).map((c, i) => {
		const p = macroProj(m, c.u - LA * 0.22, c.v + LW * 0.12, zAt(c.u - LA * 0.22, c.v + LW * 0.12)), r = 7 + 9 * rnd(i, 77 + S);
		return <path key={i} d={`M${p[0]},${p[1] - r} L${p[0] + r * 0.16},${p[1] - r * 0.16} L${p[0] + r},${p[1]} L${p[0] + r * 0.16},${p[1] + r * 0.16} L${p[0]},${p[1] + r} L${p[0] - r * 0.16},${p[1] + r * 0.16} L${p[0] - r},${p[1]} L${p[0] - r * 0.16},${p[1] - r * 0.16} Z`} fill="#FFFBEE" opacity={0.85} />; });
	const hz = m.cy - m.f * Math.tan(m.pitch);
	/* the guard far away on the axis: a dark bar across the blade with the blue glass catching the light */
	const guard = sp.guardU ? (() => { const u = sp.guardU, l = macroProj(m, u, -hwAt(u) - 4, 6), r = macroProj(m, u, hwAt(u) + 4, 6), b = macroProj(m, u, 0, -6), fog = fogOf(u);
		return <g opacity={1 - fog * 0.6}><path d={`M${l[0]},${l[1]} L${r[0]},${r[1]} L${r[0]},${b[1]} L${l[0]},${b[1]} Z`} fill="#3A2412" />
			<path d={`M${l[0] + 6},${l[1] + 1} L${(l[0] + r[0]) / 2 - 3},${l[1] + 1}`} stroke="#5A9CE8" strokeWidth={3} /><path d={`M${(l[0] + r[0]) / 2 + 3},${r[1] + 1} L${r[0] - 6},${r[1] + 1}`} stroke="#5A9CE8" strokeWidth={3} /></g>; })() : null;
	return <g>
		<defs>
			<filter id={`mNear${id}`} x="-10%" y="-20%" width="120%" height="140%"><feGaussianBlur stdDeviation="2 9" /></filter>
			<filter id={`mFar${id}`} x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation="1.3" /></filter>
		</defs>
		<Pool id={`mh${id}`} x={1000} y={hz + 8} rx={720} ry={70} a={0.22} col="#FFC478" />
		<g transform={`rotate(${m.rot ?? -3.5} 960 540)`}>
			<g filter={`url(#mFar${id})`}>{far.map((c, i) => <CellG key={i} c={c} />)}</g>
			{guard}
			{mid.map((c, i) => <CellG key={i} c={c} />)}
			{pits}
			{rustU && rustU.map(([u, v, r], i) => { const p = macroProj(m, u, v, zAt(u, v)), R = m.f * r / p[2]; return <ellipse key={`ru${i}`} cx={p[0]} cy={p[1]} rx={R} ry={R * 0.45} fill="#4A6E58" opacity={0.6} />; })}
			<g filter={`url(#mNear${id})`}>{near.map((c, i) => <CellG key={i} c={c} o={nW(c.u)} />)}</g>
			{stripExt(1)}{stripExt(-1)}{strip(1)}{strip(-1)}
			{polish}{ridge}{glints}
			{children}
		</g>
		<Pool id={`ml${id}`} x={1240} y={hz + 150} rx={640} ry={110} a={0.16} col="#FFE2A8" />
	</g>; };
