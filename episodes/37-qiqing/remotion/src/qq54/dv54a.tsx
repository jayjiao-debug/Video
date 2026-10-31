import React from 'react';
import {W, H} from '../qq50/kit50';
import {RimF, P, rnd, f1} from './cao54b';
import {Qun} from './set54bs';
import {RunnerF, runTop, Flame3, FIRE, RunKind} from './front54s';
import {HDefs, CapeA, CapeFarA, MantleA, TorsoA, CollarA, PaulA, SleeveA, VambA, FistA} from './d1hero54a';
import {HeadT, HeadDefs} from './d1head54a';
/* ep54 · D1 variant A 「突刺」, rebuilt to the owner's target picture (his repaint of our 101.60 frame; drawn in code, look B).
   D1V = the whole D1 shot for film 100.256–102.248 (t = film time).
   The camera sits in front of the 宝剑 looking back along it: the broad blade in extreme perspective (built and projected in 3D,
   pinhole f = 1500 px, fitted so its rest pose lands on the target's wedge: the point at (340, 860) over the bottom bar, the shoulders
   at (650, 475) / (737, 1074), the guard at (1130, 600)). Behind it the big fist, the vambrace and the laced 披膊; 曹操 a strong
   diagonal leaning in from the bottom-right corner, his head up at (1390, 280), turned 3/4 to screen right with the eyes cut back
   at the lens; the great maroon cape billowing up-left behind him to x ≈ 540. The world behind (the charge, torches, 乌巢 burning)
   keeps its own rolled camera.
   Timeline: black + the blade flash, the bars snap open from a slit (100.256 → ~100.40); the thrust 100.40 → 100.72 (the point
   drives at the lens, the body leans in, the cape whips out up-left with an overshoot, a short decaying shake on the hit at 100.60);
   then the hold to the hard cut at 102.248: a slow push-in (~5%), the cape billowing, the plume fluttering, a glint sliding down
   the blade edge at ~101.2, a 1–2 px tremor in the sword. */
const T1 = 100.256, TA = 100.40, TB = 100.72, TH = 100.60;
const cl = (v: number) => Math.min(1, Math.max(0, v));
const ease = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
const eout = (u: number) => 1 - Math.pow(1 - cl(u), 3);
const ROLL = -13, CX = 960, CY = 540, BAR_REST = 930;
const ACC = '#8FD0DC';
const pp = (a: P[]) => a.map((p) => f1(p[0]) + ',' + f1(p[1])).join(' ');

/* ---------- 3D: camera at the origin looking +Z, x right, y down (cm); the hero layer's screen space ---------- */
type V3 = [number, number, number];
const va = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const vs = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const vdot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const vx = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const vn = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const FS = 1500;
const prj = (p: V3): P => [CX + (FS * p[0]) / p[2], CY + (FS * p[1]) / p[2]];

/* the sword at rest (fitted to the target): the guard 90 cm out, the point 11 cm from the lens; a broad blade (8 cm), the point 7 cm */
const G0: V3 = [9.884, 3.962, 85.795], T0: V3 = [-4.730, 2.459, 11.351], HW = 4.033, PHI = 0.161, PT = 6.996;
const AX = vn(vs(T0, G0)), LB = Math.hypot(...vs(T0, G0));
/** the thrust: 0 → 1 over 100.40 → 100.72 (the arm and the sword start 42 cm back along the axis) */
const thr = (t: number) => eout((t - TA) / (TB - TA));
const pose = (t: number) => { const k = 42 * (1 - thr(t)), G = va(G0, AX, -k); return {k, G, T: va(G, AX, LB)}; };
/** the blade half-width (cm) at s from the guard: near-parallel to the shoulder, then the point */
const hwAt = (s: number) => { const u = (s - (LB - PT)) / PT; return u <= 0 ? HW * (1 - 0.08 * (s / (LB - PT))) : HW * 0.92 * (1 - Math.pow(cl(u), 1.1)); };
const htAt = (s: number) => 0.85 * (1 - 0.3 * cl(s / LB)) * (s > LB - PT ? 1 - Math.pow(cl((s - (LB - PT)) / PT), 1.1) : 1);
const swordGeo = (t: number) => { const {G, T} = pose(t), a = vn(vs(T, G)), mid = va(G, a, LB * 0.5);
	let w = vn(vx(a, mid)); let n = vn(vx(w, a));
	const w2 = vn(va(va([0, 0, 0], w, Math.cos(PHI)), n, Math.sin(PHI))), n2 = vn(vx(w2, a)); w = w2; n = n2;
	if (vdot(n, mid) > 0) n = [-n[0], -n[1], -n[2]];           /* n = the ridge facing the camera */
	const c = (s: number) => va(G, a, s);
	const S: number[] = [0, (LB - PT) * 0.5, LB - PT]; for (let i = 1; i <= 10; i++) S.push(LB - PT + (PT * i) / 10);
	const eL = S.map((s) => prj(va(c(s), w, hwAt(s)))), eR = S.map((s) => prj(va(c(s), w, -hwAt(s)))), rg = S.map((s) => prj(va(c(s), n, htAt(s))));
	return {G, T, a, w, n, c, S, eL, eR, rg, tip: prj(T), g: prj(G)}; };

/* ---------- the 宝剑 (over the letterbox): the light bevel up (toward the fires), the steel-blue bevel down, the ridge, the glint ---------- */
const Sword: React.FC<{t: number}> = ({t}) => { const s = swordGeo(t), {c, w, n} = s;
	const upL = (s.eL[2][1]) < (s.eR[2][1]);
	const eW = upL ? s.eL : s.eR, eC = upL ? s.eR : s.eL, sgW = upL ? 1 : -1;
	const face = (e: P[]) => `M${pp(e)} L${pp(s.rg.slice().reverse())} Z`;
	/* a strip along the blade between fractions a0..a1 of the way from the ridge to the edge (sd = −1: the cool side) */
	const strip = (s0: number, s1: number, a0: number, a1: number, sd = 1) => { const ss = Array.from({length: 9}, (_, i) => s0 + ((s1 - s0) * i) / 8);
		const A = ss.map((x) => prj(va(va(c(x), n, htAt(x) * (1 - a0)), w, sd * sgW * hwAt(x) * a0))), B = ss.map((x) => prj(va(va(c(x), n, htAt(x) * (1 - a1)), w, sd * sgW * hwAt(x) * a1)));
		return `M${pp(A)} L${pp(B.reverse())} Z`; };
	const g = s.g, tp = s.tip;
	/* the guard: a plain flattened hexagonal bar (dark bronze), its front face toward the lens */
	const hex: [number, number][] = [[HW + 1.3, 0], [HW * 0.7, 1.6], [-HW * 0.7, 1.6], [-HW - 1.3, 0], [-HW * 0.7, -1.6], [HW * 0.7, -1.6]];
	const cap = (sa: number) => hex.map(([x, y]) => prj(va(va(c(sa), w, x), n, y)));
	const back = cap(-2.2), front = cap(0.1);
	const sides = hex.map((_, i) => { const j = (i + 1) % 6; return [back[i], back[j], front[j], front[i]]; });
	const lit = (qd: P[]) => { const mx = (qd[0][0] + qd[1][0]) / 2 - g[0], my = (qd[0][1] + qd[1][1]) / 2 - g[1]; return (-mx * 0.7 - my * 0.7) / (Math.hypot(mx, my) || 1); };
	/* the glint: once, sliding down the lit edge from the guard to the point (~101.0 → 101.4) */
	const gu = (t - 101.0) / 0.42, gs = LB * (0.1 + 0.9 * ease(gu)), gOn = gu > 0 && gu < 1.05;
	const gp = prj(va(c(Math.min(gs, LB - 0.2)), w, sgW * hwAt(Math.min(gs, LB - 0.2)) * 0.97));
	return <g>
		<defs>
			<linearGradient id="dvaSW" gradientUnits="userSpaceOnUse" x1={f1(g[0])} y1={f1(g[1])} x2={f1(tp[0])} y2={f1(tp[1])}>
				<stop offset="0" stopColor="#8A6A54" /><stop offset="0.25" stopColor="#C8A688" /><stop offset="0.6" stopColor="#E8D2B4" /><stop offset="1" stopColor="#FFF4E2" /></linearGradient>
			<linearGradient id="dvaSC" gradientUnits="userSpaceOnUse" x1={f1(g[0])} y1={f1(g[1])} x2={f1(tp[0])} y2={f1(tp[1])}>
				<stop offset="0" stopColor="#2A3A48" /><stop offset="0.4" stopColor="#3A5266" /><stop offset="0.85" stopColor="#5E7C94" /><stop offset="1" stopColor="#86A4B8" /></linearGradient>
			<linearGradient id="dvaGB" gradientUnits="userSpaceOnUse" x1={f1(g[0] - 60)} y1={f1(g[1] + 40)} x2={f1(g[0] + 60)} y2={f1(g[1] - 40)}>
				<stop offset="0" stopColor="#1C1612" /><stop offset="1" stopColor="#5A4430" /></linearGradient>
			<radialGradient id="dvaGl"><stop offset="0" stopColor="#FFFFFF" stopOpacity="1" /><stop offset="0.25" stopColor="#FFF0D0" stopOpacity="0.7" /><stop offset="1" stopColor="#FFD08A" stopOpacity="0" /></radialGradient>
		</defs>
		{/* the guard behind the blade root */}
		{sides.map((qd, i) => <polygon key={i} points={pp(qd)} fill={lit(qd) > 0.2 ? '#6A5034' : lit(qd) > -0.3 ? '#3A2C20' : '#1E1712'} />)}
		<polygon points={pp(front)} fill="url(#dvaGB)" />
		<polyline points={pp([front[3], front[4], front[5]])} fill="none" stroke="#C89A5A" strokeWidth={2} opacity={0.8} />
		<polyline points={pp([front[0], front[1], front[2]])} fill="none" stroke={ACC} strokeWidth={1.4} opacity={0.5} />
		{/* the blade: two flat bevels meeting at the ridge */}
		<path d={face(eC)} fill="url(#dvaSC)" />
		<path d={face(eW)} fill="url(#dvaSW)" />
		{/* the bevels' inner planes: a soft light streak along the ridge on the light face, a darker band on the steel face */}
		{/* the two parallel highlight streaks on the upper bevel, bending round the shoulder toward the point */}
		<path d={strip(LB * 0.1, LB - PT * 0.42, 0.7, 0.8)} fill="#FFF0DC" opacity={0.6 + 0.05 * Math.sin(t * 4)} />
		<path d={strip(LB * 0.14, LB - PT * 0.62, 0.36, 0.47)} fill="#FFF0DC" opacity={0.5} />
		<path d={strip(LB * 0.1, LB - PT * 0.4, 0.35, 0.6, -1)} fill="#2E4458" opacity={0.45} />
		<path d={strip(LB * 0.4, LB - PT * 0.3, 0.75, 0.88, -1)} fill="#9CB8C8" opacity={0.3} />
		{/* the ridge, the edges */}
		<polyline points={pp(s.rg)} fill="none" stroke="#FFF6E4" strokeWidth={2.4} opacity={0.9} />
		<polyline points={pp(eW)} fill="none" stroke="#FFF4DE" strokeWidth={3.2} opacity={0.95} />
		<polyline points={pp(eC)} fill="none" stroke={ACC} strokeWidth={2.4} opacity={0.85} />
		{/* one thin gold inlay line along the ridge just past the guard */}
		<path d={strip(1.2, 12, 0.12, 0.2)} fill="#E8B860" opacity={0.9} />
		{gOn && <g opacity={Math.sin(Math.PI * cl(gu))}><circle cx={gp[0]} cy={gp[1]} r={46} fill="url(#dvaGl)" />
			<path d={`M${gp[0] - 40},${gp[1]} L${gp[0]},${gp[1] - 2.4} L${gp[0] + 40},${gp[1]} L${gp[0]},${gp[1] + 2.4} Z M${gp[0]},${gp[1] - 26} L${gp[0] + 2},${gp[1]} L${gp[0]},${gp[1] + 26} L${gp[0] - 2},${gp[1]} Z`} fill="#FFFFFF" /></g>}
	</g>; };

/* ---------- the world behind him: the fire sky, 乌巢 burning on the horizon, the charge, smoke ---------- */
const HZ = 640, FB = 1100, HC = 1.15;
type Man = {X: number; Z: number; ph: number; kind: RunKind; i: number};
const MEN: Man[] = Array.from({length: 190}, (_, i) => { const side = rnd(i, 3) < 0.58 ? -1 : 1, Z = 3 + Math.pow(rnd(i, 5), 1.3) * 66, q = rnd(i, 6);
	return {X: side * (1.5 + rnd(i, 4) * (2.5 + Z * 0.08)), Z, ph: rnd(i, 7) * 6.28, kind: q < 0.6 ? 'torch' : q < 0.88 ? 'ji' : 'plain', i}; });
const placeM = (X: number, z: number): {x: number; y: number; k: number} => ({x: CX + (FB * X) / z, y: HZ + (FB * HC) / z, k: FB / (100 * z)});
const Charge: React.FC<{d: number; t: number}> = ({d, t}) => { const v = 4.4;
	const live = MEN.map((m) => ({m, z: m.Z - v * d})).filter((o) => o.z > 4.2).sort((a, b) => b.z - a.z);
	const far = live.filter((o) => o.z > 26), near = live.filter((o) => o.z <= 26);
	const fl = (o: {m: Man; z: number}) => { if (o.m.kind !== 'torch') return null; const p = placeM(o.m.X, o.z), ph = o.m.ph + t * 7.6, tp = runTop(ph, 'torch');
		const sg = o.m.X < 0 ? -1 : 1, x = p.x + sg * tp[0] * p.k, y = p.y + tp[1] * p.k, s = p.k * 100;
		return <g key={'f' + o.m.i}><circle cx={x} cy={y - 0.12 * s} r={0.6 * s} fill="url(#dvaTg)" /><Flame3 x={x} y={y} w={0.17 * s} h={0.46 * s} t={(t + o.m.i * 0.37) * 0.5} seed={o.m.i} /></g>; };
	return <g>
		{far.map((o) => { const p = placeM(o.m.X, o.z), fk = 0.82 + 0.18 * Math.sin(t * 5 + o.m.i * 1.7);
			return <g key={o.m.i}><rect x={p.x - 0.13 * p.k * 100} y={p.y - 1.7 * p.k * 100} width={Math.max(1, 0.26 * p.k * 100)} height={1.7 * p.k * 100} fill="#160A08" opacity={0.9} />
				{o.m.kind === 'torch' && <><circle cx={p.x} cy={p.y - 2.15 * p.k * 100} r={p.k * 60 + 4} fill="url(#dvaTg)" opacity={fk} /><circle cx={p.x} cy={p.y - 2.15 * p.k * 100} r={Math.max(1.5, p.k * 9)} fill={FIRE.core} /></>}</g>; })}
		<g fill="#140A08" filter="url(#dvaRn)">{near.map((o) => { const p = placeM(o.m.X, o.z), ph = o.m.ph + t * 7.6;
			return <g key={o.m.i} transform={`translate(${f1(p.x)},${f1(p.y)}) scale(${(o.m.X < 0 ? -p.k : p.k).toFixed(4)},${p.k.toFixed(4)})`}><RunnerF ph={ph} kind={o.m.kind} /></g>; })}</g>
		{near.map(fl)}
	</g>; };
const SMK = Array.from({length: 26}, (_, i) => ({x: -300 + rnd(i, 61) * 2500, y: -200 + rnd(i, 62) * 700, r: 110 + rnd(i, 63) * 170, vx: 8 + rnd(i, 64) * 20, vy: -(10 + rnd(i, 65) * 24), lit: rnd(i, 66)}));
const World: React.FC<{d: number; t: number}> = ({d, t}) => <g>
	{/* sky: dark at the top, a hot band at the horizon, a great glow behind him (the backlight) */}
	<rect x={-700} y={-700} width={W + 1400} height={HZ + 760} fill="url(#dvaSky)" />
	<rect x={-700} y={-700} width={W + 1400} height={H + 1400} fill="url(#dvaBack)" />
	<g filter="url(#dvaSb)">{SMK.map((s, i) => { const x = s.x + s.vx * (d + 2), y = s.y + s.vy * (d + 2), lit = cl((y + 100) / 700) * (0.4 + 0.6 * s.lit);
		return <g key={i}><circle cx={x} cy={y} r={s.r} fill={FIRE.smoke} opacity={0.85} /><ellipse cx={x} cy={y + s.r * 0.5} rx={s.r * 0.8} ry={s.r * 0.4} fill="#A4441E" opacity={lit * 0.7} /></g>; })}</g>
	{/* the horizon: a band of fire, 乌巢's granaries burning */}
	<ellipse cx={CX + 200} cy={HZ} rx={1700} ry={110} fill="url(#dvaHg)" />
	<path d={`M-700,${HZ} L${W + 700},${HZ} L${W + 700},${H + 700} L-700,${H + 700} Z`} fill="url(#dvaGd)" />
	{Array.from({length: 96}, (_, i) => { const x = -560 + i * 32 + rnd(i, 81) * 20, h = 10 + rnd(i, 82) * 26; return <Flame3 key={i} x={x} y={HZ + 2} w={h * 0.7} h={h} t={t * 0.5} seed={i * 1.3} />; })}
	{[[-260, 0.9], [-60, 0.75], [140, 1.0], [520, 0.8], [760, 0.95], [1620, 0.85], [1860, 1.0], [2120, 0.8]].map(([x, s], i) => <g key={x}>
		<g transform={`translate(${x},${HZ + 4}) scale(${s})`}><Qun drum="#1C0E0A" thatch="#160A08" edge="#E0702A" /></g>
		<Flame3 x={x + 6 * s} y={HZ - 150 * s} w={120 * s} h={210 * s} t={t * 0.45} seed={i * 7 + 1} />
		<Flame3 x={x - 44 * s} y={HZ - 86 * s} w={74 * s} h={120 * s} t={t * 0.45 + 0.3} seed={i * 7 + 3} />
		<Flame3 x={x + 50 * s} y={HZ - 70 * s} w={60 * s} h={96 * s} t={t * 0.45 + 0.6} seed={i * 7 + 5} />
	</g>)}
	<Charge d={d} t={t} />
</g>;
const WorldDefs: React.FC = () => <>
	<linearGradient id="dvaSky" x1="0" y1={-300} x2="0" y2={HZ + 40} gradientUnits="userSpaceOnUse">
		<stop offset="0" stopColor="#0A0606" /><stop offset="0.35" stopColor="#1C0D0C" /><stop offset="0.65" stopColor="#4A1C14" /><stop offset="0.86" stopColor="#B04A1E" /><stop offset="1" stopColor="#F08A3A" /></linearGradient>
	<radialGradient id="dvaBack" cx="1440" cy="600" r="760" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFC870" stopOpacity="0.62" /><stop offset="0.35" stopColor="#FF9A40" stopOpacity="0.32" /><stop offset="0.7" stopColor="#EA6028" stopOpacity="0.1" /><stop offset="1" stopColor="#EA6028" stopOpacity="0" /></radialGradient>
	<radialGradient id="dvaHg"><stop offset="0" stopColor="#FFC060" stopOpacity="0.7" /><stop offset="0.5" stopColor="#EA6028" stopOpacity="0.26" /><stop offset="1" stopColor="#EA6028" stopOpacity="0" /></radialGradient>
	<linearGradient id="dvaGd" x1="0" y1={HZ} x2="0" y2={H + 300} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#4A2010" /><stop offset="0.1" stopColor="#24100A" /><stop offset="1" stopColor="#0A0605" /></linearGradient>
	<radialGradient id="dvaTg"><stop offset="0" stopColor="#FFD08A" stopOpacity="0.75" /><stop offset="0.3" stopColor="#FF9A40" stopOpacity="0.3" /><stop offset="1" stopColor="#EA6028" stopOpacity="0" /></radialGradient>
	<filter id="dvaSb" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={24} /></filter>
	<RimF id="dvaRn" lx={1} ly={-0.3} k={2.4} c={FIRE.mid} o={0.95} lx2={-1} ly2={-0.3} k2={2} c2={FIRE.out} o2={0.8} blur={0.9} />
</>;

/* ---------- embers and smoke streaming past toward the lens (3D, the background lens) ---------- */
const EM = Array.from({length: 110}, (_, i) => ({X: (rnd(i, 21) - 0.45) * 12, Y: -0.6 - rnd(i, 22) * 4.2, Z0: rnd(i, 23) * 26, v: 6 + rnd(i, 24) * 9, r: 0.012 + rnd(i, 25) * 0.025, hot: rnd(i, 26), fq: 2 + rnd(i, 27) * 4}));
const PUFF = [[-5.2, -2.6, 9, 3.2], [4.8, -3.4, 15, 3.6], [-6.5, -0.4, 21, 2.8], [6.2, -1.2, 5, 3.0], [-3.8, -4.4, 13, 3.4]];
const Embers: React.FC<{t: number}> = ({t}) => { const d = t - 99;
	return <g>
		{PUFF.map(([X, Y, Z0, R], i) => { const span = 22, z = 1.2 + ((((Z0 - 4.2 * d) % span) + span) % span), x = CX + (FB * X) / z, y = HZ + (FB * (Y + 1.1)) / z, r = (FB * R) / z;
			return <circle key={'p' + i} cx={x} cy={y} r={r} fill="url(#dvaPf)" opacity={cl((22 - z) / 5) * cl((z - 1.2) / 2.5) * 0.9} />; })}{EM.map((e, i) => { const span = 25.4, z = 0.6 + ((((e.Z0 - e.v * d) % span) + span) % span), z2 = z + e.v * 0.05;
		const age = (span - (z - 0.6)) / e.v, X = e.X + Math.sin(t * e.fq + i) * 0.15 + 0.06 * age, Y = e.Y + 1.1 + Math.cos(t * e.fq * 0.7 + i) * 0.12 - 0.22 * age;
		const a: P = [CX + (FB * X) / z, HZ + (FB * Y) / z], b: P = [CX + (FB * X) / z2, HZ + (FB * Y) / z2];
		if (a[0] < -200 || a[0] > W + 200 || a[1] < -200 || a[1] > H + 200) return null;
		const r = Math.min(4.5, (FB * e.r) / z), o = cl((26 - z) / 6) * (0.7 + 0.3 * Math.sin(t * 6 + i)) * cl((z - 1.2) / 1.5);
		const sl = Math.hypot(b[0] - a[0], b[1] - a[1]); if (sl > 70) { b[0] = a[0] + ((b[0] - a[0]) * 70) / sl; b[1] = a[1] + ((b[1] - a[1]) * 70) / sl; }
		if (o <= 0.02) return null;
		return <g key={i} opacity={o}><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={e.hot > 0.5 ? FIRE.core : FIRE.mid} strokeWidth={r} strokeLinecap="round" />
			<circle cx={a[0]} cy={a[1]} r={r * 2.4} fill="url(#dvaEm)" /></g>; })}</g>; };

/** the letterbox: black, then the bars snap open from a slit in ~4 frames; the bottom bar stays */
const Letterbox: React.FC<{t: number}> = ({t}) => { const d = t - T1, u = eout((d - 0.03) / 0.12), top = 540 * (1 - u), bot = 540 + (BAR_REST - 540) * u;
	return <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
		{top > 0.5 && <rect x={0} y={0} width={W} height={top} fill="#000" />}
		<rect x={0} y={bot} width={W} height={H - bot} fill="#000" />
	</svg>; };

/** a fixed paper/brush grain multiplied into a layer (applied once per layer): fractal noise mapped to 0.86–1.06 */
const Grain: React.FC<{id: string}> = ({id}) => <filter id={id} x="0" y="0" width="1920" height="1080" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
	<feTurbulence type="fractalNoise" baseFrequency="0.8 0.55" numOctaves={2} seed={11} result="n" />
	<feColorMatrix in="n" type="saturate" values="0" result="g" />
	<feComponentTransfer in="g" result="gm"><feFuncR type="linear" slope={0.4} intercept={0.76} /><feFuncG type="linear" slope={0.4} intercept={0.75} /><feFuncB type="linear" slope={0.4} intercept={0.74} /><feFuncA type="linear" slope={0} intercept={1} /></feComponentTransfer>
	<feBlend in="SourceGraphic" in2="gm" mode="multiply" result="m" />
	<feComposite in="m" in2="SourceAlpha" operator="in" />
</filter>;

/* ---------- the shot ---------- */
/** the world's camera: the dutch roll, a push-in (parallax p: 0 = the sky … 1 = near) */
const camT = (t: number, p: number) => { const d = Math.max(0, t - T1), z = 0.11 * ease(d / 2.0) + 0.025 * eout(d / 0.4), s = 1 + z * (0.3 + 0.7 * p);
	const roll = ROLL - 1.4 * ease(d / 2.0) * (0.4 + 0.6 * p), FX = 940, FY = 690;
	return `translate(${FX},${FY}) scale(${s.toFixed(5)}) translate(${-FX},${-FY}) rotate(${roll.toFixed(3)},${CX},${CY})`; };
/** the hero's camera: drawn at the 101.60 pose; a constant slow push toward his face and fist (≈5.3% over the hold) */
const FOC: P = [1290, 440];
const heroS = (t: number) => Math.exp(0.034 * (t - 101.6));
const heroT = (t: number) => `translate(${FOC[0]},${FOC[1]}) scale(${heroS(t).toFixed(5)}) translate(${-FOC[0]},${-FOC[1]})`;
/** the body's lean: pulled back and more upright before the thrust (λ = 1), driving in with it (λ = 0); pivot at the hip */
const PIV: P = [1700, 1000];
const leanL = (t: number) => 1 - eout((t - TA - 0.03) / (TB - TA + 0.05));
const leanT = (t: number) => { const l = leanL(t), s = 1 - 0.05 * l, r = 5 * l, b = Math.sin(t * 3.1) * 1.6;
	return {s, r, dx: 26 * l, dy: -8 * l + b, str: `translate(${f1(26 * l)},${f1(-8 * l + b)}) translate(${PIV[0]},${PIV[1]}) rotate(${r.toFixed(3)}) scale(${s.toFixed(4)}) translate(${-PIV[0]},${-PIV[1]})`}; };
const leanP = (t: number, p: P): P => { const {s, r, dx, dy} = leanT(t), a = (r * Math.PI) / 180, x = (p[0] - PIV[0]) * s, y = (p[1] - PIV[1]) * s;
	return [PIV[0] + x * Math.cos(a) - y * Math.sin(a) + dx, PIV[1] + x * Math.sin(a) + y * Math.cos(a) + dy]; };
/** the cape's unfurl: furled at the shoulders → whipped out up-left with an overshoot (100.42 → ~100.85) */
const capeU = (t: number) => { const x = (t - 100.42) / 0.4; return x <= 0 ? 0 : 1 - Math.exp(-4.5 * x) * Math.cos(5.5 * x); };
/** the tremor (screen px) in the sword hand */
const trem = (t: number): P => { const k = cl((t - TB) / 0.3); return [k * (1.1 * Math.sin(t * 11.3) + 0.5 * Math.sin(t * 23 + 1)), k * (0.9 * Math.sin(t * 9.1 + 1) + 0.4 * Math.sin(t * 19 + 2))]; };
/** the fist/vambrace follow the guard: screen-space similarity from the rest guard to the current one */
const G0S = prj(G0);
const handT = (t: number) => { const {G} = pose(t), g = prj(G), k = G0[2] / G[2], tr = trem(t);
	return {g, k, str: `translate(${f1(g[0] + tr[0])},${f1(g[1] + tr[1])}) scale(${k.toFixed(4)}) translate(${f1(-G0S[0])},${f1(-G0S[1])})`,
		map: (p: P): P => [g[0] + tr[0] + (p[0] - G0S[0]) * k, g[1] + tr[1] + (p[1] - G0S[1]) * k]}; };
const Hero: React.FC<{t: number}> = ({t}) => { const L = leanT(t), hT = handT(t), cu = capeU(t);
	const sq: P[] = [leanP(t, [1424, 404]), leanP(t, [1428, 592]), hT.map([1300, 598]), hT.map([1298, 418])];
	return <g filter="url(#dvaHero)">
		<g transform={L.str}>
			<CapeA t={t} cu={cu} />
			<CapeFarA t={t} />
			<TorsoA t={t} />
			<MantleA t={t} cu={cu} />
			<CollarA />
			<HeadT t={t} />
		</g>
		<SleeveA q={sq} />
		<g transform={L.str}><PaulA /></g>
		<g transform={hT.str}><VambA /><FistA /></g>
	</g>; };

export const D1V: React.FC<{t: number}> = ({t}) => { const d = Math.max(0, t - T1), dh = t - TH;
	/* the hit: a short decaying shake (≤ 12 px) */
	const A = dh < 0 ? 0 : 12 * Math.exp(-dh / 0.09) * cl((0.45 - dh) / 0.1), shx = A * Math.sin(dh * 97 + 0.7) * Math.cos(dh * 31), shy = A * 0.7 * Math.sin(dh * 83 + 2.1);
	const shake = {position: 'absolute' as const, inset: 0, transform: `translate(${f1(shx)}px,${f1(shy)}px) scale(1.02)`, transformOrigin: '50% 50%'};
	const open = eout((d - 0.03) / 0.12);
	const tr = trem(t), tip0 = swordGeo(t).tip, tip: P = [tip0[0] + tr[0], tip0[1] + tr[1]];
	/* the glint: big on the black first frames, then a short star on the point; it flares again as the edge glint arrives (~101.42) */
	const ga = (d < 0.05 ? 1.7 : 0.6 + 0.5 * Math.exp(-(d - 0.05) / 0.3)) + 0.5 * Math.exp(-Math.pow((t - 101.44) / 0.07, 2)), gl = 0.85 + 0.15 * Math.sin(t * 9), Lg = 90 * ga, V = 56 * ga;
	return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#0A0605'}}>
		<div style={shake}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
				<defs><WorldDefs /><HDefs /><HeadDefs /><Grain id="d1Gr" />
					<RimF id="dvaHero" lx={1} ly={-0.5} k={4} c={FIRE.mid} o={0.8} lx2={-1} ly2={0.2} k2={3} c2={ACC} o2={0.75} blur={1} />
					<radialGradient id="dvaPf"><stop offset="0" stopColor="#7A3A24" stopOpacity="0.5" /><stop offset="0.6" stopColor="#4A2420" stopOpacity="0.22" /><stop offset="1" stopColor="#3A2224" stopOpacity="0" /></radialGradient>
					<radialGradient id="dvaEm"><stop offset="0" stopColor="#FFE9B0" stopOpacity="1" /><stop offset="0.35" stopColor="#FFB04E" stopOpacity="0.55" /><stop offset="1" stopColor="#EA6028" stopOpacity="0" /></radialGradient>
					<radialGradient id="dvaVig" cx="0.55" cy="0.45" r="0.8"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></radialGradient>
				</defs>
				<g transform={camT(t, 0.15)}><World d={d} t={t} /></g>
				{/* embers and smoke streaming toward the lens: all behind him and his sword */}
				{open > 0.001 && <g opacity={open} transform={camT(t, 0.6)}><Embers t={t} /></g>}
				<g transform={heroT(t)}><g filter="url(#d1Gr)"><Hero t={t} /></g></g>
				<rect width={W} height={H} fill="url(#dvaVig)" />
			</svg>
		</div>
		<Letterbox t={t} />
		<div style={shake}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
				<defs><Grain id="d1Gr2" /><radialGradient id="dvaTip"><stop offset="0" stopColor="#FFF6E0" stopOpacity="1" /><stop offset="0.2" stopColor="#FFD08A" stopOpacity="0.55" /><stop offset="1" stopColor="#FF8A3A" stopOpacity="0" /></radialGradient></defs>
				<g transform={heroT(t)}>
					<g transform={`translate(${f1(tr[0])},${f1(tr[1])})`} filter="url(#d1Gr2)"><Sword t={t} /></g>
					<g opacity={gl}><circle cx={tip[0]} cy={tip[1]} r={80 * ga} fill="url(#dvaTip)" />
						<path d={`M${tip[0] - Lg},${tip[1]} L${tip[0]},${tip[1] - 3.4} L${tip[0] + Lg},${tip[1]} L${tip[0]},${tip[1] + 3.4} Z M${tip[0]},${tip[1] - V} L${tip[0] + 3},${tip[1]} L${tip[0]},${tip[1] + V} L${tip[0] - 3},${tip[1]} Z`} fill="#FFF6E0" transform={`rotate(-8,${f1(tip[0])},${f1(tip[1])})`} /></g>
				</g>
			</svg>
		</div>
	</div>; };
