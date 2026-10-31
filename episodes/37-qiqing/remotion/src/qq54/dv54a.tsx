import React from 'react';
import {W, H} from '../qq50/kit50';
import {RimF, P, rnd, f1} from './cao54b';
import {Qun} from './set54bs';
import {RunnerF, runTop, Flame3, FIRE, RunKind, tongue} from './front54s';
import {HDefs, CapeA, CapeFarA, MantleA, TorsoA, CollarA, PaulA, SleeveA, VambA, FistA} from './d1hero54a';
import {HeadT, HeadDefs} from './d1head54a';
/* ep54 · D1 variant A 「突刺」, rebuilt to the owner's target picture (his repaint of our 101.60 frame; drawn in code, look B).
   D1V = the whole D1 shot for film 99.259–104.240 (t = film time). Round 6 timeline (owner):
   99.259 → 100.12  the sword in the dark (bar 49 beats 3–4, the riser): black; only the blade at its pre-thrust pose, picked out by a
                    thin warm rim on its edges and ridge that builds with the riser (faint → strong by 100.0 → a flare at 100.10); a glint
                    creeps along the edge to the point; the blade inches ~5 cm toward the lens; a few faint embers.
   100.12 → 100.266 the bars open from a slit round the blade, FULLY open on frame 3008 (the drop, 100.256).
   100.256          the hit: the shake (≤ 12 px, decaying), a flash/bloom on the blade; the thrust drives at the lens and lands by 100.60,
                    the body leans in, the cape whips out up-left.
   100.60 → 104.24  the long hold to the hard cut on bar 52: the charge loops on (never thins), fire-arrow volleys arc left → right
                    behind him every 0.5–0.8 s, embers, torches, cape and plume alive; one eased push-in (~9% from 100.6 to 104.24, no
                    speed change at 102.25); the glint runs down the blade at ~101.2 and ~103.3; the tremor and the eyes as approved.
   (Below: the round-5 notes on the build.)
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
/* T0D: the dark starts (bar 49 + 2 beats); T1: the drop; TR0 → TR1 the bars open (TR1 just before frame 3008 = 100.2667, so 3008 is
   fully open); TA → TB the thrust; TH the hit; TEND the hard cut (bar 52) */
const T0D = 99.259, T1 = 100.256, TR0 = 100.12, TR1 = 100.2657, TF = 3008 / 30, TA = 100.256, TB = 100.60, TH = 100.256, TEND = 104.24;
const cl = (v: number) => Math.min(1, Math.max(0, v));
const ease = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
const eout = (u: number) => 1 - Math.pow(1 - cl(u), 3);
/** the bars' opening 0 → 1 (accelerating into the drop, slammed fully open on frame 3008) */
const openU = (t: number) => Math.pow(cl((t - TR0) / (TR1 - TR0)), 1.5);
/** the riser: the blade's rim light in the dark (faint at 99.26, strong by 100.0, a flare at 100.10) */
const riser = (t: number) => 0.1 + 0.62 * Math.pow(cl((t - T0D) / (100.0 - T0D)), 1.6) + 0.18 * cl((t - 100.0) / 0.12) + 0.55 * Math.exp(-Math.pow((t - 100.10) / 0.045, 2));
/** the flash on the blade: up over frames 3006–3008, peak on the drop frame, decaying */
const flash = (t: number) => t < 100.2 ? 0 : t < TF ? Math.pow((t - 100.2) / (TF - 100.2), 2) : Math.exp(-(t - TF) / 0.12);
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
/** the thrust: 0 → 1 over 100.256 → 100.60 (the arm and the sword start 42 cm back along the axis); in the dark the blade inches
    5 cm → 0 toward the lens, slowly gathering speed (a few % in size) */
const thr = (t: number) => eout((t - TA) / (TB - TA));
const inch = (t: number) => 5 * (1 - Math.pow(cl((t - T0D) / (T1 - T0D)), 1.4));
const pose = (t: number) => { const k = 42 * (1 - thr(t)) + inch(t), G = va(G0, AX, -k); return {k, G, T: va(G, AX, LB)}; };
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

/* ---------- the glint along the lit edge: in the dark it creeps from the guard to the point with the riser (99.30 → 100.10);
   in the hold it runs down the blade twice (~101.0 → 101.42 and ~103.1 → 103.52) ---------- */
const GLP = [101.0, 103.1];
const glintAt = (t: number): {s: number; a: number; sz: number} | null => {
	if (t < 100.2) { const gu = (t - 99.30) / 0.80; if (gu <= 0) return null; const I = riser(t);
		return {s: LB * (0.08 + 0.9 * Math.pow(cl(gu), 1.25)), a: cl(0.3 + 0.7 * I) * (1 - cl((t - 100.07) / 0.08)), sz: 0.5 + 0.4 * cl(I)}; }
	for (const g0 of GLP) { const gu = (t - g0) / 0.42; if (gu > 0 && gu < 1.05) return {s: LB * (0.1 + 0.9 * ease(gu)), a: Math.sin(Math.PI * cl(gu)), sz: 1}; }
	return null; };

/* ---------- the 宝剑 (over the letterbox): the light bevel up (toward the fires), the steel-blue bevel down, the ridge, the glint.
   lv = 0: the sword in the dark (near-black planes, a thin warm rim on the edges and the ridge, rim = its strength); 1 = fully lit ---------- */
const Sword: React.FC<{t: number; lv: number; rim: number; fl: number}> = ({t, lv, rim, fl}) => { const s = swordGeo(t), {c, w, n} = s;
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
	const gl = glintAt(t), gs = gl ? Math.min(gl.s, LB - 0.2) : 0, gp = prj(va(c(gs), w, sgW * hwAt(gs) * 0.97)), gz = gl ? gl.sz : 1;
	const rk = cl(rim), rw = 0.8 + 0.45 * rim;
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
		{lv < 1 && <g>
			{/* the sword in the dark: the guard barely there, the two bevels near-black, a thin warm rim on the edges and the ridge */}
			{sides.map((qd, i) => <polygon key={i} points={pp(qd)} fill="#0C0907" />)}
			<polygon points={pp(front)} fill="#110D0A" />
			<polyline points={pp([front[3], front[4], front[5]])} fill="none" stroke="#C89A5A" strokeWidth={1.4} opacity={0.35 * rk} />
			<path d={face(eC)} fill="#0A0C10" /><path d={face(eW)} fill="#17120E" />
			<path d={strip(LB * 0.1, LB - PT * 0.42, 0.7, 0.8)} fill="#FFD8A8" opacity={0.16 * rk} />
			<polyline points={pp(eW)} fill="none" stroke="#FFC890" strokeWidth={1.9 * rw} opacity={rk} />
			<polyline points={pp(eC)} fill="none" stroke="#E0905A" strokeWidth={1.3 * rw} opacity={0.7 * rk} />
			<polyline points={pp(s.rg)} fill="none" stroke="#FFD8A8" strokeWidth={1.4 * rw} opacity={0.8 * rk} />
		</g>}
		{lv > 0 && <g opacity={lv}>
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
		</g>}
		{/* the flash on the drop: the blade blooms white-hot for a moment */}
		{fl > 0.01 && <path d={`${face(eW)} ${face(eC)}`} fill="#FFF8EE" opacity={0.5 * fl} />}
		{gl && gl.a > 0.01 && <g opacity={gl.a}><circle cx={gp[0]} cy={gp[1]} r={46 * gz} fill="url(#dvaGl)" />
			<path d={`M${gp[0] - 40 * gz},${gp[1]} L${gp[0]},${gp[1] - 2.4} L${gp[0] + 40 * gz},${gp[1]} L${gp[0]},${gp[1] + 2.4} Z M${gp[0]},${gp[1] - 26 * gz} L${gp[0] + 2},${gp[1]} L${gp[0]},${gp[1] + 26 * gz} L${gp[0] - 2},${gp[1]} Z`} fill="#FFFFFF" /></g>}
	</g>; };

/* ---------- the world behind him: the fire sky, 乌巢 burning on the horizon, the charge, smoke ---------- */
const HZ = 640, FB = 1100, HC = 1.15;
/* the charge, looping: every runner keeps his lane X and his own pace, runs from the horizon (z = ZF, fading in out of the fire glow)
   toward the lens and leaves the frame at the side (zx = the depth where he is wholly off screen), then comes round again at the
   horizon, so the stream never thins. Depth gives the layers: the near ones big and fast, the far ones small and slow. */
type Man = {X: number; Z0: number; v: number; ph: number; kind: RunKind; i: number; zx: number; zf: number};
const placeM = (X: number, z: number): {x: number; y: number; k: number} => ({x: CX + (FB * X) / z, y: HZ + (FB * HC) / z, k: FB / (100 * z)});
const ZF = 72, RR = (ROLL * Math.PI) / 180, RC = Math.cos(RR), RSN = Math.sin(RR);
const offFrame = (X: number, z: number) => { const p = placeM(X, z);
	const q = [[-64, 8], [64, 8], [-64, -296], [64, -296]].map(([a, b]) => { const dx = p.x + a * p.k - CX, dy = p.y + b * p.k - CY; return [CX + dx * RC - dy * RSN, CY + dx * RSN + dy * RC]; });
	return q.every((v) => v[0] < -40) || q.every((v) => v[0] > W + 40) || q.every((v) => v[1] > BAR_REST + 10); };
const exitZ = (X: number) => { for (let z = 16; z > 1.2; z -= 0.04) if (offFrame(X, z)) return z; return 1.2; };
/* 210 run the whole way from the horizon; 56 more (the near band) loop only from z = 27, fading in inside the thick of the crowd,
   so the near layers stay full */
const MEN: Man[] = Array.from({length: 266}, (_, i) => { const side = rnd(i, 3) < 0.56 ? -1 : 1, q = rnd(i, 6);
	const X = side * ((side < 0 ? 2.5 : 1.9) + 3.9 * Math.sqrt(rnd(i, 4)));
	return {X, Z0: rnd(i, 5) * 90, v: 3.3 + rnd(i, 8) * 1.7, ph: rnd(i, 7) * 6.28, kind: q < 0.6 ? 'torch' : q < 0.88 ? 'ji' : 'plain', i, zx: exitZ(X), zf: i < 210 ? ZF : 27}; });
const manZ = (m: Man, t: number) => { const span = m.zf - m.zx; return m.zx + ((((m.Z0 - m.v * (t - 99)) % span) + span) % span); };
const Charge: React.FC<{t: number}> = ({t}) => {
	const live = MEN.map((m) => ({m, z: manZ(m, t)})).sort((a, b) => b.z - a.z);
	const far = live.filter((o) => o.z > 26), near = live.filter((o) => o.z <= 26);
	const phOf = (m: Man) => m.ph + t * 7.6 * (m.v / 4.1);
	const fl = (o: {m: Man; z: number}) => { const fo = cl((o.m.zf - o.z) / 6); if (o.m.kind !== 'torch' || fo <= 0.01) return null; const p = placeM(o.m.X, o.z), ph = phOf(o.m), tp = runTop(ph, 'torch');
		const sg = o.m.X < 0 ? -1 : 1, x = p.x + sg * tp[0] * p.k, y = p.y + tp[1] * p.k, s = p.k * 100;
		return <g key={'f' + o.m.i} opacity={fo < 1 ? fo : undefined}><circle cx={x} cy={y - 0.12 * s} r={0.6 * s} fill="url(#dvaTg)" /><Flame3 x={x} y={y} w={0.17 * s} h={0.46 * s} t={(t + o.m.i * 0.37) * 0.5} seed={o.m.i} /></g>; };
	return <g>
		{far.map((o) => { const fo = cl((o.m.zf - o.z) / 9); if (fo <= 0.01) return null;
			const p = placeM(o.m.X, o.z), fk = 0.82 + 0.18 * Math.sin(t * 5 + o.m.i * 1.7), by = -3 * Math.abs(Math.cos(phOf(o.m))) * p.k, hh = 1.7 * p.k * 100;
			return <g key={o.m.i} opacity={fo}><rect x={p.x - 0.13 * p.k * 100} y={p.y - hh + by} width={Math.max(1, 0.26 * p.k * 100)} height={hh} fill="#160A08" opacity={0.9} />
				{o.m.kind === 'torch' && <><circle cx={p.x} cy={p.y - 2.15 * p.k * 100 + by} r={p.k * 60 + 4} fill="url(#dvaTg)" opacity={fk} /><circle cx={p.x} cy={p.y - 2.15 * p.k * 100 + by} r={Math.max(1.5, p.k * 9)} fill={FIRE.core} /></>}
				{o.m.kind === 'ji' && <rect x={p.x + 0.1 * p.k * 100} y={p.y - 2.5 * p.k * 100 + by} width={Math.max(0.8, 0.05 * p.k * 100)} height={1.3 * p.k * 100} fill="#160A08" opacity={0.9} />}</g>; })}
		<g fill="#140A08" filter="url(#dvaRn)">{near.map((o) => { const p = placeM(o.m.X, o.z), fo = cl((o.m.zf - o.z) / 6); if (fo <= 0.01) return null;
			return <g key={o.m.i} opacity={fo < 1 ? fo : undefined} transform={`translate(${f1(p.x)},${f1(p.y)}) scale(${(o.m.X < 0 ? -p.k : p.k).toFixed(4)},${p.k.toFixed(4)})`}><RunnerF ph={phOf(o.m)} kind={o.m.kind} /></g>; })}</g>
		{near.map(fl)}
	</g>; };

/* fire arrows: volleys every 0.5–0.8 s (3–5 arrows, staggered), arcing high across the sky left → right toward the burning granaries,
   at varied heights and speeds. Drawn in the world (behind him, his cape and the blade), defined in rest-screen px (the world's roll
   is undone round them). Each: a thin dark shaft, a small flame head streaming back, a short fading trail. */
type Arw = {t0: number; dur: number; xa: number; ya: number; kL: number; kR: number; sz: number; i: number};
/* each arc: y(x) = ya + k·(√((x − xa)² + C²) − C), a rounded apex at (xa, ya), climbing at slope kL from the left, falling at kR
   toward the granaries on the right; x runs at a constant speed from X0 to X1. The high ones clear the subtitle block (y ≥ 335 at
   x = 600) and cross above the cape; the low ones pass behind it. */
const X0 = -230, X1 = 2170, AC = 260;
const ARW: Arw[] = (() => { const a: Arw[] = []; let tv = 97.2;
	for (let j = 0; tv < TEND + 0.2; j++) { const n = 3 + Math.floor(rnd(j, 111) * 3);
		for (let k = 0; k < n; k++) { const i = j * 7 + k, ya = 175 + 165 * rnd(i, 112), xa = 1040 + 260 * rnd(i, 117);
			const need = (335 - ya) / (Math.hypot(xa - 600, AC) - AC), kL = Math.max(0.42 + 0.12 * rnd(i, 114), need);
			a.push({t0: tv + rnd(i, 116) * 0.26, dur: 2.0 + rnd(i, 113) * 0.9, xa, ya, kL, kR: 0.24 + 0.12 * rnd(i, 115), sz: 0.8 + 0.5 * rnd(i, 118), i}); }
		tv += 0.5 + 0.3 * rnd(j, 119); }
	return a; })();
const arcP = (a: Arw, u: number): P => { const x = X0 + (X1 - X0) * u, dx = x - a.xa; return [x, a.ya + (dx < 0 ? a.kL : a.kR) * (Math.hypot(dx, AC) - AC)]; };
const FireArrows: React.FC<{t: number}> = ({t}) => <g>{ARW.map((a) => { const u = (t - a.t0) / a.dur; if (u < -0.01 || u > 1.12) return null;
	const h = arcP(a, u), h2 = arcP(a, u - 0.003), ang = Math.atan2(h[1] - h2[1], h[0] - h2[0]), ca = Math.cos(ang), sa = Math.sin(ang), z = a.sz;
	const tail: P[] = Array.from({length: 7}, (_, k) => arcP(a, u - 0.0105 * k)), L = 56 * z, fk = 1 + 0.2 * Math.sin(t * 23 + a.i * 1.7) + 0.1 * Math.sin(t * 37 + a.i);
	const hb: P = [h[0] - ca * 5 * z, h[1] - sa * 5 * z], rot = `translate(${f1(hb[0])},${f1(hb[1])}) rotate(${((ang * 180) / Math.PI - 90).toFixed(1)})`, sw = 2.8 * z * Math.sin(t * 19 + a.i);
	return <g key={a.i}>
		{tail.slice(1).map((p, k) => <line key={k} x1={f1(tail[k][0])} y1={f1(tail[k][1])} x2={f1(p[0])} y2={f1(p[1])} stroke={k < 1 ? FIRE.core : k < 3 ? FIRE.mid : FIRE.out} strokeWidth={(4 - k * 0.5) * z} strokeLinecap="round" opacity={0.75 * (1 - k / 6.5)} />)}
		<line x1={f1(h[0] - ca * L)} y1={f1(h[1] - sa * L)} x2={f1(h[0] + ca * 8 * z)} y2={f1(h[1] + sa * 8 * z)} stroke="#1A0C08" strokeWidth={2.8 * z} strokeLinecap="round" />
		<circle cx={f1(hb[0])} cy={f1(hb[1])} r={34 * z} fill="url(#dvaAh)" />
		<g transform={rot}><path d={tongue(0, 0, 16 * z, 50 * z * fk, sw)} fill={FIRE.out} /><path d={tongue(0, 0, 10.5 * z, 34 * z * fk, sw * 0.7)} fill={FIRE.mid} /><path d={tongue(0, 0, 5.5 * z, 18 * z * fk, sw * 0.4)} fill={FIRE.core} /></g>
	</g>; })}</g>;

const SMK = Array.from({length: 26}, (_, i) => ({x: -300 + rnd(i, 61) * 2500, y: -200 + rnd(i, 62) * 700, r: 110 + rnd(i, 63) * 170, vx: 8 + rnd(i, 64) * 20, vy: -(10 + rnd(i, 65) * 24), lit: rnd(i, 66)}));
const World: React.FC<{t: number}> = ({t}) => { const d = t - T1; return <g>
	{/* sky: dark at the top, a hot band at the horizon, a great glow behind him (the backlight) */}
	<rect x={-700} y={-700} width={W + 1400} height={HZ + 760} fill="url(#dvaSky)" />
	<rect x={-700} y={-700} width={W + 1400} height={H + 1400} fill="url(#dvaBack)" />
	<g filter="url(#dvaSb)">{SMK.map((s, i) => { const x = s.x + s.vx * (d + 2), y = s.y + s.vy * (d + 2), lit = cl((y + 100) / 700) * (0.4 + 0.6 * s.lit);
		return <g key={i}><circle cx={x} cy={y} r={s.r} fill={FIRE.smoke} opacity={0.85} /><ellipse cx={x} cy={y + s.r * 0.5} rx={s.r * 0.8} ry={s.r * 0.4} fill="#A4441E" opacity={lit * 0.7} /></g>; })}</g>
	{/* the fire arrows, high in the sky behind everything else */}
	<g transform={`rotate(${-ROLL},${CX},${CY})`}><FireArrows t={t} /></g>
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
	<Charge t={t} />
</g>; };
const WorldDefs: React.FC = () => <>
	<linearGradient id="dvaSky" x1="0" y1={-300} x2="0" y2={HZ + 40} gradientUnits="userSpaceOnUse">
		<stop offset="0" stopColor="#0A0606" /><stop offset="0.35" stopColor="#1C0D0C" /><stop offset="0.65" stopColor="#4A1C14" /><stop offset="0.86" stopColor="#B04A1E" /><stop offset="1" stopColor="#F08A3A" /></linearGradient>
	<radialGradient id="dvaBack" cx="1440" cy="600" r="760" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFC870" stopOpacity="0.62" /><stop offset="0.35" stopColor="#FF9A40" stopOpacity="0.32" /><stop offset="0.7" stopColor="#EA6028" stopOpacity="0.1" /><stop offset="1" stopColor="#EA6028" stopOpacity="0" /></radialGradient>
	<radialGradient id="dvaHg"><stop offset="0" stopColor="#FFC060" stopOpacity="0.7" /><stop offset="0.5" stopColor="#EA6028" stopOpacity="0.26" /><stop offset="1" stopColor="#EA6028" stopOpacity="0" /></radialGradient>
	<linearGradient id="dvaGd" x1="0" y1={HZ} x2="0" y2={H + 300} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#4A2010" /><stop offset="0.1" stopColor="#24100A" /><stop offset="1" stopColor="#0A0605" /></linearGradient>
	<radialGradient id="dvaAh"><stop offset="0" stopColor="#FFF4D0" stopOpacity="0.95" /><stop offset="0.3" stopColor="#FFB04E" stopOpacity="0.45" /><stop offset="1" stopColor="#EA6028" stopOpacity="0" /></radialGradient>
	<radialGradient id="dvaTg"><stop offset="0" stopColor="#FFD08A" stopOpacity="0.75" /><stop offset="0.3" stopColor="#FF9A40" stopOpacity="0.3" /><stop offset="1" stopColor="#EA6028" stopOpacity="0" /></radialGradient>
	<filter id="dvaSb" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={24} /></filter>
	<RimF id="dvaRn" lx={1} ly={-0.3} k={2.4} c={FIRE.mid} o={0.95} lx2={-1} ly2={-0.3} k2={2} c2={FIRE.out} o2={0.8} blur={0.9} />
</>;

/* ---------- embers and smoke streaming past toward the lens (3D, the background lens) ---------- */
const EM = Array.from({length: 110}, (_, i) => ({X: (rnd(i, 21) - 0.45) * 12, Y: -0.6 - rnd(i, 22) * 4.2, Z0: rnd(i, 23) * 26, v: 6 + rnd(i, 24) * 9, r: 0.012 + rnd(i, 25) * 0.025, hot: rnd(i, 26), fq: 2 + rnd(i, 27) * 4}));
const PUFF = [[-5.2, -2.6, 9, 3.2], [4.8, -3.4, 15, 3.6], [-6.5, -0.4, 21, 2.8], [6.2, -1.2, 5, 3.0], [-3.8, -4.4, 13, 3.4]];
const Embers: React.FC<{t: number; sub?: number; gid?: string}> = ({t, sub = 0, gid = 'dvaEm'}) => { const d = t - 99;
	return <g>
		{!sub && PUFF.map(([X, Y, Z0, R], i) => { const span = 22, z = 1.2 + ((((Z0 - 4.2 * d) % span) + span) % span), x = CX + (FB * X) / z, y = HZ + (FB * (Y + 1.1)) / z, r = (FB * R) / z;
			return <circle key={'p' + i} cx={x} cy={y} r={r} fill="url(#dvaPf)" opacity={cl((22 - z) / 5) * cl((z - 1.2) / 2.5) * 0.9} />; })}{EM.map((e, i) => { if (sub && i % sub) return null; const span = 25.4, z = 0.6 + ((((e.Z0 - e.v * d) % span) + span) % span), z2 = z + e.v * 0.05;
		const age = (span - (z - 0.6)) / e.v, X = e.X + Math.sin(t * e.fq + i) * 0.15 + 0.06 * age, Y = e.Y + 1.1 + Math.cos(t * e.fq * 0.7 + i) * 0.12 - 0.22 * age;
		const a: P = [CX + (FB * X) / z, HZ + (FB * Y) / z], b: P = [CX + (FB * X) / z2, HZ + (FB * Y) / z2];
		if (a[0] < -200 || a[0] > W + 200 || a[1] < -200 || a[1] > H + 200) return null;
		const r = Math.min(4.5, (FB * e.r) / z), o = cl((26 - z) / 6) * (0.7 + 0.3 * Math.sin(t * 6 + i)) * cl((z - 1.2) / 1.5);
		const sl = Math.hypot(b[0] - a[0], b[1] - a[1]); if (sl > 70) { b[0] = a[0] + ((b[0] - a[0]) * 70) / sl; b[1] = a[1] + ((b[1] - a[1]) * 70) / sl; }
		if (o <= 0.02) return null;
		return <g key={i} opacity={o}><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={e.hot > 0.5 ? FIRE.core : FIRE.mid} strokeWidth={r} strokeLinecap="round" />
			<circle cx={a[0]} cy={a[1]} r={r * 2.4} fill={`url(#${gid})`} /></g>; })}</g>; };

/** the letterbox: black through the dark, then the bars open from a slit round the blade (y = YC) in ~4 frames, fully open on the
    drop frame; the bottom bar stays */
const Letterbox: React.FC<{u: number}> = ({u}) => { const top = YC * (1 - u), bot = YC + (BAR_REST - YC) * u;
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
/** the push's clock Q(t): a slow creep from the dark on (rate 0.35), easing up (100.3 → 101.1) to a steady rate 1 that runs on
    unchanged to the cut: one smooth push, no speed change at 102.25 (∫ of smoothstep: x³ − x⁴/2) */
const Qf = (t: number) => { const L = 0.8, x = (t - 100.3) / L, F = x <= 0 ? 0 : x < 1 ? x * x * x - (x * x * x * x) / 2 : 0.5 + (x - 1);
	return 0.35 * (t - T0D) + 0.65 * L * F; };
const Q1 = Qf(T1), QE = Qf(TEND), QS = Qf(101.6);
/** 0 at the drop → 1 at the cut */
const holdP = (t: number) => cl((Qf(t) - Q1) / (QE - Q1));
/** the world's camera: the dutch roll, a punch-in on the drop and the long push (parallax p: 0 = the sky … 1 = near) */
const camT = (t: number, p: number) => { const d = Math.max(0, t - T1), hp = holdP(t), z = 0.14 * hp + 0.025 * eout(d / 0.4), s = 1 + z * (0.3 + 0.7 * p);
	const roll = ROLL - 1.8 * hp * (0.4 + 0.6 * p), FX = 940, FY = 690;
	return `translate(${FX},${FY}) scale(${s.toFixed(5)}) translate(${-FX},${-FY}) rotate(${roll.toFixed(3)},${CX},${CY})`; };
/** the hero's camera: drawn at the 101.60 pose (scale 1 there); the push, +9% from 100.60 to the cut, centred low on his fist so the
    point keeps clear of the age counter */
const FOC: P = [1260, 640];
const PUSH = Math.log(1.09) / (QE - Qf(TB));
const heroS = (t: number) => Math.exp(PUSH * (Qf(t) - QS));
const heroT = (t: number) => `translate(${FOC[0]},${FOC[1]}) scale(${heroS(t).toFixed(5)}) translate(${-FOC[0]},${-FOC[1]})`;
/** the body's lean: pulled back and more upright before the thrust (λ = 1), driving in with it (λ = 0); pivot at the hip */
const PIV: P = [1700, 1000];
const leanL = (t: number) => 1 - eout((t - TA - 0.03) / (TB - TA + 0.05));
const leanT = (t: number) => { const l = leanL(t), s = 1 - 0.05 * l, r = 5 * l, b = Math.sin(t * 3.1) * 1.6;
	return {s, r, dx: 26 * l, dy: -8 * l + b, str: `translate(${f1(26 * l)},${f1(-8 * l + b)}) translate(${PIV[0]},${PIV[1]}) rotate(${r.toFixed(3)}) scale(${s.toFixed(4)}) translate(${-PIV[0]},${-PIV[1]})`}; };
const leanP = (t: number, p: P): P => { const {s, r, dx, dy} = leanT(t), a = (r * Math.PI) / 180, x = (p[0] - PIV[0]) * s, y = (p[1] - PIV[1]) * s;
	return [PIV[0] + x * Math.cos(a) - y * Math.sin(a) + dx, PIV[1] + x * Math.sin(a) + y * Math.cos(a) + dy]; };
/** the cape's unfurl: furled at the shoulders → whipped out up-left with an overshoot (100.276 → ~100.7) */
const capeU = (t: number) => { const x = (t - (TA + 0.02)) / 0.4; return x <= 0 ? 0 : 1 - Math.exp(-4.5 * x) * Math.cos(5.5 * x); };
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

/** the slit's centre: the blade's middle on screen at the reveal */
const YC = (() => { const g = swordGeo(100.2), k = g.eL.length >> 1, y = (g.eL[k][1] + g.eR[k][1] + g.eL[2][1] + g.eR[2][1]) / 4; return FOC[1] + (y - FOC[1]) * heroS(100.2); })();
const GTIP = GLP.map((g) => g + 0.44);

export const D1V: React.FC<{t: number}> = ({t}) => { const d = Math.max(0, t - T1), dh = t - TH;
	/* the hit on the drop: a short decaying shake (≤ 12 px) */
	const A = dh < 0 ? 0 : 12 * Math.exp(-dh / 0.09) * cl((0.45 - dh) / 0.1), shx = A * Math.sin(dh * 97 + 0.7) * Math.cos(dh * 31), shy = A * 0.7 * Math.sin(dh * 83 + 2.1);
	const shake = {position: 'absolute' as const, inset: 0, transform: `translate(${f1(shx)}px,${f1(shy)}px) scale(1.02)`, transformOrigin: '50% 50%'};
	const u = openU(t), I = riser(t), F = flash(t);
	const tr = trem(t), sg = swordGeo(t), tip: P = [sg.tip[0] + tr[0], sg.tip[1] + tr[1]], bc = prj(sg.c(LB * 0.6));
	/* the star on the point. Dark: a faint spark that flares as the creeping glint arrives (100.10) and holds into the reveal.
	   Lit: the drop flash, then a short star; it flares again as each edge glint arrives (~101.44, ~103.54) */
	const gaD = 0.1 * I + (t < 100.10 ? 1.5 * Math.exp(-Math.pow((t - 100.10) / 0.06, 2)) : 0.8 + 0.7 * Math.exp(-(t - 100.10) / 0.05));
	const gaL = 0.6 + 1.2 * F + 0.4 * Math.exp(-Math.max(0, t - TF) / 0.3) + GTIP.reduce((a, g) => a + 0.5 * Math.exp(-Math.pow((t - g) / 0.07, 2)), 0);
	const ga = u * gaL + (1 - u) * gaD, gl = 0.85 + 0.15 * Math.sin(t * 9), Lg = 90 * ga, V = 56 * ga;
	return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#0A0605'}}>
		{u > 0 && <div style={shake}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
				<defs><WorldDefs /><HDefs /><HeadDefs /><Grain id="d1Gr" />
					<RimF id="dvaHero" lx={1} ly={-0.5} k={4} c={FIRE.mid} o={0.8} lx2={-1} ly2={0.2} k2={3} c2={ACC} o2={0.75} blur={1} />
					<radialGradient id="dvaPf"><stop offset="0" stopColor="#7A3A24" stopOpacity="0.5" /><stop offset="0.6" stopColor="#4A2420" stopOpacity="0.22" /><stop offset="1" stopColor="#3A2224" stopOpacity="0" /></radialGradient>
					<radialGradient id="dvaEm"><stop offset="0" stopColor="#FFE9B0" stopOpacity="1" /><stop offset="0.35" stopColor="#FFB04E" stopOpacity="0.55" /><stop offset="1" stopColor="#EA6028" stopOpacity="0" /></radialGradient>
					<radialGradient id="dvaVig" cx="0.55" cy="0.45" r="0.8"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></radialGradient>
				</defs>
				<g transform={camT(t, 0.15)}><World t={t} /></g>
				{/* embers and smoke streaming toward the lens: all behind him and his sword */}
				<g transform={camT(t, 0.6)}><Embers t={t} /></g>
				<g transform={heroT(t)}><g filter="url(#d1Gr)"><Hero t={t} /></g></g>
				<rect width={W} height={H} fill="url(#dvaVig)" />
			</svg>
		</div>}
		<Letterbox u={u} />
		<div style={shake}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
				<defs><Grain id="d1Gr2" /><radialGradient id="dvaTip"><stop offset="0" stopColor="#FFF6E0" stopOpacity="1" /><stop offset="0.2" stopColor="#FFD08A" stopOpacity="0.55" /><stop offset="1" stopColor="#FF8A3A" stopOpacity="0" /></radialGradient>
					<radialGradient id="dvaEmD"><stop offset="0" stopColor="#FFE0A0" stopOpacity="1" /><stop offset="0.35" stopColor="#FFA040" stopOpacity="0.5" /><stop offset="1" stopColor="#EA6028" stopOpacity="0" /></radialGradient>
					<radialGradient id="dvaBl"><stop offset="0" stopColor="#FFF6E4" stopOpacity="0.85" /><stop offset="0.3" stopColor="#FFD8A0" stopOpacity="0.4" /><stop offset="1" stopColor="#FF9A40" stopOpacity="0" /></radialGradient></defs>
				{/* in the dark: a few embers drifting very faintly (the same ones that carry on behind once the bars open) */}
				{u < 1 && <g opacity={(1 - u) * 0.3 * cl((t - T0D) / 0.25)} transform={camT(t, 0.6)}><Embers t={t} sub={6} gid="dvaEmD" /></g>}
				<g transform={heroT(t)}>
					<g transform={`translate(${f1(tr[0])},${f1(tr[1])})`} filter="url(#d1Gr2)"><Sword t={t} lv={u} rim={I} fl={F} /></g>
					{F > 0.01 && <circle cx={f1(bc[0] + tr[0])} cy={f1(bc[1] + tr[1])} r={360} fill="url(#dvaBl)" opacity={0.75 * F} />}
					{ga > 0.03 && <g opacity={gl}><circle cx={tip[0]} cy={tip[1]} r={80 * ga} fill="url(#dvaTip)" />
						<path d={`M${tip[0] - Lg},${tip[1]} L${tip[0]},${tip[1] - 3.4} L${tip[0] + Lg},${tip[1]} L${tip[0]},${tip[1] + 3.4} Z M${tip[0]},${tip[1] - V} L${tip[0] + 3},${tip[1]} L${tip[0]},${tip[1] + V} L${tip[0] - 3},${tip[1]} Z`} fill="#FFF6E0" transform={`rotate(-8,${f1(tip[0])},${f1(tip[1])})`} /></g>}
				</g>
			</svg>
		</div>
	</div>; };
