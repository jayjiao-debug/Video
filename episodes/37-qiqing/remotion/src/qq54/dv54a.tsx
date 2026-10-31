import React from 'react';
import {W, H} from '../qq50/kit50';
import {RimF, P, rnd, f1, strand, qpts} from './cao54b';
import {limb, Qun} from './set54bs';
import {RunnerF, runTop, Flame3, FIRE, RunKind} from './front54s';
/* ep54 · D1 design variant A 「突刺」 (owner: "冲出屏幕的感觉，镜头在剑前面看后面" — the camera in front of the sword looking back at him;
   the old D1 was "太弱了"). D1V = the whole D1 shot for film 100.256–102.248 (t = film time).
   A one-handed thrust at a dutch angle (about −13°): the camera sits low, a hand's breadth from the 宝剑's point. The sword is built
   and projected in 3D (pinhole, f = 1500 px), so the point and the first third of the blade are huge in the lower left and cut into
   the bottom bar, and the blade recedes hard to his fist at mid-frame right. Behind the fist: the bracer, the 披膊, his hunched,
   leaning body; his face upper right under a Han lamellar iron 兜鍪 with a small red crest, eyes narrowed on the lens over the blade;
   the cape blown out behind him; the off hand clenched back at his hip. Behind him: the charge with torches rushing at the lens,
   乌巢 burning on the horizon, embers and smoke streaming past toward the camera.
   Timeline: black + the blade flash, the bars snap open from a slit (100.256 → ~100.40, the overlay hidden until 100.406), the thrust
   snaps the point at the lens in ~6 frames, then a strong push-in to the end of the shot. Bottom bar stays (the point crosses it). */
const T1 = 100.256;
const cl = (v: number) => Math.min(1, Math.max(0, v));
const ease = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
const eout = (u: number) => 1 - Math.pow(1 - cl(u), 3);
const ROLL = -13, CX = 960, CY = 540, BAR_REST = 930;
const FP = {skin: '#B9784F', skinS: '#6E4130', skinD: '#452619', skinH: '#F2A86C', skinHH: '#FFD39E', hair: '#15100E', grey: '#A09486',
	metal: '#3A3534', metalS: '#161212', metalH: '#D88A4C', lace: '#7A2C20', under: '#5A2C24', underS: '#2A1512', underH: '#C8643C',
	cape: '#2E1716', capeS: '#140A0A', capeH: '#C0542C', line: '#24140E', white: '#D8CDB8', acc: '#8FD0DC'};
const pp = (a: P[]) => a.map((p) => f1(p[0]) + ',' + f1(p[1])).join(' ');
const q = (a: P) => `${f1(a[0])},${f1(a[1])}`;

/* ---------- 3D: camera at the origin looking +Z, x right, y down (cm) ---------- */
type V3 = [number, number, number];
const va = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const vs = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const vdot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const vx = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const vn = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const FS = 1500;
const prj = (p: V3): P => [CX + (FS * p[0]) / p[2], CY + (FS * p[1]) / p[2]];
const pxk = (p: V3) => FS / p[2];                          /* px per cm at p */
/** a screen point (pre-roll) at depth z → 3D */
const un = (s: P, z: number): V3 => [((s[0] - CX) * z) / FS, ((s[1] - CY) * z) / FS, z];

/* the sword at rest (after the thrust): the guard behind the fist, the point a hand's breadth from the lens */
const G0 = un([1080, 612], 90), T0 = un([600, 858], 15);
const AX = vn(vs(T0, G0)), LB = Math.hypot(...vs(T0, G0));
/** the pose at t: k = how far the whole arm + sword is still back along the axis (cm), the tremble, the body lunge */
const pose = (t: number) => { const d = Math.max(0, t - T1);
	const k = 30 * (1 - eout(d / 0.19)) - 1.8 * ease((d - 0.2) / 1.8);
	const tr: V3 = [Math.sin(t * 11) * 0.05 * cl(d / 0.3), Math.sin(t * 9 + 1) * 0.04 * cl(d / 0.3), 0];
	const G = va(va(G0, AX, -k), tr);
	return {d, k, G, T: va(G, AX, LB)}; };
/** blade half-width (cm) at s from the guard; the point's edges curve in (slightly convex) to the tip */
const PT = 7.2;
const hwAt = (s: number) => { const u = (s - (LB - PT)) / PT; return u <= 0 ? 2.2 - 0.25 * (s / (LB - PT)) : 1.95 * (1 - Math.pow(cl(u), 1.18)); };
const htAt = (s: number) => (0.5 - 0.18 * cl(s / LB)) * (s > LB - PT ? 1 - Math.pow(cl((s - (LB - PT)) / PT), 1.2) : 1);
const swordGeo = (t: number) => { const {G, T} = pose(t), a = vn(vs(T, G)), mid = va(G, a, LB * 0.5);
	let w = vn(vx(a, mid)); let n = vn(vx(w, a));
	/* roll the flat a little about the axis so the two visible faces differ in width (reads as a ridge, not a plank) */
	const r = 0.38, w2 = vn(va(va([0, 0, 0], w, Math.cos(r)), n, Math.sin(r))), n2 = vn(vx(w2, a)); w = w2; n = n2;
	if (vdot(n, mid) > 0) n = [-n[0], -n[1], -n[2]];           /* n = the ridge facing the camera */
	const c = (s: number) => va(G, a, s);
	const S: number[] = [0, LB - PT]; for (let i = 1; i <= 12; i++) S.push(LB - PT + (PT * i) / 12);
	const eL = S.map((s) => prj(va(c(s), w, hwAt(s)))), eR = S.map((s) => prj(va(c(s), w, -hwAt(s)))), rg = S.map((s) => prj(va(c(s), n, htAt(s))));
	return {G, T, a, w, n, c, S, eL, eR, rg, tip: prj(T), g: prj(G)}; };

/* ---------- the 宝剑 (over the letterbox): two faces meeting at the ridge, edge lights, fire reflections, the gold inlay, the guard ---------- */
const Sword: React.FC<{t: number}> = ({t}) => { const s = swordGeo(t), {c, w, n, a} = s;
	/* screen-upper face = toward the fire (warm, bright to the point); the other = cool steel */
	const upL = (s.eL[0][1] + s.eL[1][1]) < (s.eR[0][1] + s.eR[1][1]);
	const eW = upL ? s.eL : s.eR, eC = upL ? s.eR : s.eL, sgW = upL ? 1 : -1;
	const face = (e: P[]) => `M${pp(e)} L${pp(s.rg.slice().reverse())} Z`;
	const band = (s0: number, s1: number) => { const A = [prj(va(c(s0), w, sgW * hwAt(s0))), prj(va(c(s1), w, sgW * hwAt(s1))), prj(va(c(s1), n, htAt(s1))), prj(va(c(s0), n, htAt(s0)))];
		return `M${pp(A)} Z`; };
	/* a strip along the blade between fractions f0..f1 of the half-width (on the warm side, or the cool side with sd = −1) */
	const strip = (s0: number, s1: number, a0: number, a1: number, sd = 1) => { const ss = Array.from({length: 9}, (_, i) => s0 + ((s1 - s0) * i) / 8);
		const A = ss.map((x) => prj(va(va(c(x), n, htAt(x) * (1 - a0)), w, sd * sgW * hwAt(x) * a0))), B = ss.map((x) => prj(va(va(c(x), n, htAt(x) * (1 - a1)), w, sd * sgW * hwAt(x) * a1)));
		return `M${pp(A)} L${pp(B.reverse())} Z`; };
	const g = s.g, tp = s.tip;
	/* the guard: a flattened hexagonal bar (plain dark bronze), its front face toward the lens */
	const hex: [number, number][] = [[3.4, 0], [2.2, 1.45], [-2.2, 1.45], [-3.4, 0], [-2.2, -1.45], [2.2, -1.45]];
	const cap = (sa: number) => hex.map(([x, y]) => prj(va(va(c(sa), w, x), n, y)));
	const back = cap(-2.0), front = cap(0.15);
	const sides = hex.map((_, i) => { const j = (i + 1) % 6; return [back[i], back[j], front[j], front[i]]; });
	const lit = (qd: P[]) => { const mx = (qd[0][0] + qd[1][0]) / 2 - g[0], my = (qd[0][1] + qd[1][1]) / 2 - g[1]; return (mx * 0.6 - my * 0.8) / (Math.hypot(mx, my) || 1); };
	void a;
	return <g>
		<defs>
			<linearGradient id="dvaSW" gradientUnits="userSpaceOnUse" x1={f1(g[0])} y1={f1(g[1])} x2={f1(tp[0])} y2={f1(tp[1])}>
				<stop offset="0" stopColor="#5E4638" /><stop offset="0.35" stopColor="#B07650" /><stop offset="0.7" stopColor="#F0B478" /><stop offset="1" stopColor="#FFEBC4" /></linearGradient>
			<linearGradient id="dvaSC" gradientUnits="userSpaceOnUse" x1={f1(g[0])} y1={f1(g[1])} x2={f1(tp[0])} y2={f1(tp[1])}>
				<stop offset="0" stopColor="#1A1D22" /><stop offset="0.5" stopColor="#2C3A44" /><stop offset="0.85" stopColor="#4E6C78" /><stop offset="1" stopColor="#86AEB8" /></linearGradient>
			<linearGradient id="dvaGB" gradientUnits="userSpaceOnUse" x1={f1(g[0] - 60)} y1={f1(g[1] + 40)} x2={f1(g[0] + 60)} y2={f1(g[1] - 40)}>
				<stop offset="0" stopColor="#1C1612" /><stop offset="1" stopColor="#5A4430" /></linearGradient>
		</defs>
		{/* the guard behind the blade root */}
		{sides.map((qd, i) => <polygon key={i} points={pp(qd)} fill={lit(qd) > 0.2 ? '#6A5034' : lit(qd) > -0.3 ? '#3A2C20' : '#1E1712'} />)}
		<polygon points={pp(front)} fill="url(#dvaGB)" />
		<polyline points={pp([front[5], front[0], front[1]])} fill="none" stroke="#C89A5A" strokeWidth={2} opacity={0.8} />
		<polyline points={pp([front[2], front[3], front[4]])} fill="none" stroke={FP.acc} strokeWidth={1.4} opacity={0.5} />
		<line x1={front[0][0]} y1={front[0][1]} x2={front[3][0]} y2={front[3][1]} stroke="#8A6A40" strokeWidth={1.2} opacity={0.6} />
		{/* the blade */}
		<path d={face(eC)} fill="url(#dvaSC)" />
		<path d={face(eW)} fill="url(#dvaSW)" />
		{/* the fire's reflection: one long gleam along the warm face toward the point, one thin streak */}
		<path d={strip(LB * 0.3, LB - PT * 0.5, 0.22, 0.5)} fill="#FFF2D6" opacity={0.42} />
		<path d={strip(LB * 0.55, LB - PT * 0.3, 0.62, 0.74)} fill="#FFF6E2" opacity={0.5 + 0.05 * Math.sin(t * 4)} />
		<path d={strip(LB * 0.2, LB * 0.7, 0.3, 0.55, -1)} fill="#7FA6B2" opacity={0.3} />
		{/* the ridge, the edges */}
		<polyline points={pp(s.rg)} fill="none" stroke="#FFF2DA" strokeWidth={2.2} opacity={0.95} />
		<polyline points={pp(eW)} fill="none" stroke="#FFF4DE" strokeWidth={3} opacity={0.95} />
		<polyline points={pp(eC)} fill="none" stroke={FP.acc} strokeWidth={2.2} opacity={0.85} />
		{/* one thin gold inlay line along the ridge just past the guard */}
		<line x1={prj(va(va(c(1.6), n, htAt(1.6) * 0.8), w, sgW * 0.32))[0]} y1={prj(va(va(c(1.6), n, htAt(1.6) * 0.8), w, sgW * 0.32))[1]}
			x2={prj(va(va(c(11), n, htAt(11) * 0.8), w, sgW * 0.32))[0]} y2={prj(va(va(c(11), n, htAt(11) * 0.8), w, sgW * 0.32))[1]} stroke="#E8B860" strokeWidth={2.6} strokeLinecap="round" />
	</g>; };

/* ---------- the sword hand, seen from the point's side and a little behind (cm; u = from the guard back toward his arm, v across):
   the cord-wrapped grip out of the guard, the fingers wrapped round it, the thumb over the index finger, the lit knuckles, the wrist and
   the bracer going back to the shoulder ---------- */
const FistGrip: React.FC = () => { const c = {...FP, ...HP};
	return <g>
		{/* the pommel at the heel of the hand, just behind the fist */}
		<ellipse cx={6.6} cy={3.9} rx={1.5} ry={1.8} fill="#3A2E22" /><path d="M5.6,2.6 C6.6,2.2 7.8,2.8 8,4" fill="none" stroke="#B08A50" strokeWidth={0.3} opacity={0.8} />
		{/* the grip between the guard and the fingers: dark cord wound diagonally */}
		<path d={limb([[0, 0], [2.2, 0]], [1.7, 1.7])} fill="#2A1C14" />
		{[0.2, 0.75, 1.3, 1.85].map((u) => <path key={u} d={`M${u},-1.65 L${u + 0.55},1.65`} stroke="#8A6440" strokeWidth={0.26} />)}
		<path d="M0,-1.7 L2.2,-1.7" stroke="#C89A6A" strokeWidth={0.25} opacity={0.6} />
		{/* the fist: the back of the hand toward us, the fingers folded round the grip below */}
		<g transform="translate(1.2,0) scale(0.86,1)">
		<path d="M1.2,-3.6 C1.6,-4.9 3.4,-5.2 5,-5 C6.6,-4.8 7.6,-3.8 7.6,-2.2 L7.4,2.6 C7.2,4.4 5.8,5.2 4,5.2 L2.2,5.2 C1.2,5.2 0.8,4.4 0.9,3.2 Z" fill={c.skin} />
		{/* the shade under the folded fingers, the cool rim */}
		<path d="M0.9,1.4 C2.6,2.2 5.4,2.3 7.5,1.6 L7.4,2.6 C7.2,4.4 5.8,5.2 4,5.2 L2.2,5.2 C1.2,5.2 0.8,4.4 0.9,3.2 Z" fill={c.skinS} />
		<path d="M2.4,5 L2.6,2.1 M4.2,5.1 L4.3,2.3 M5.9,4.8 L5.9,2.2" stroke="#4A2A1C" strokeWidth={0.26} opacity={0.55} />
		{/* the knuckles: one lit ridge with soft bumps */}
		<path d="M1.3,-3.7 C1.7,-4.9 2.6,-5.2 3.2,-4.8 C3.8,-5.3 4.7,-5.3 5.2,-4.8 C5.8,-5.2 6.8,-4.9 7.3,-3.9 C7.6,-3.2 7.6,-2.6 7.6,-2.2 C5.6,-2.9 3.4,-3 1.3,-2.4 Z" fill={c.skinH} />
		<path d="M2.1,-4.5 C2.5,-4.9 2.9,-4.9 3.2,-4.6 M4,-4.9 C4.4,-5.1 4.8,-5 5.1,-4.7" fill="none" stroke={c.skinHH} strokeWidth={0.4} strokeLinecap="round" opacity={0.85} />
		{/* the line of the middle joints */}
		<path d="M1,0.2 C3,0.7 5.4,0.7 7.5,0.1" fill="none" stroke="#7A4630" strokeWidth={0.3} opacity={0.6} />
		{/* the thumb lying over the index finger toward the guard */}
		<path d="M5.4,-1.6 C4.2,-1.9 2.6,-1.8 1.4,-1.2 C0.6,-0.8 0.4,0.4 1,1 C2.4,1.2 4.4,0.9 5.8,0.4 C6.6,0.1 6.6,-1.3 5.4,-1.6 Z" fill={c.skinH} />
		<path d="M1,1 C2.4,1.2 4.4,0.9 5.8,0.4 C5.6,0.9 4.6,1.4 3.2,1.6 C2.2,1.7 1.4,1.5 1,1 Z" fill={c.skinS} opacity={0.85} />
		<path d="M0.9,3.2 C0.8,0 1,-2.4 1.2,-3.6" fill="none" stroke={c.acc} strokeWidth={0.3} opacity={0.6} />
		</g>
	</g>; };

/* ---------- the head: the HeadF face design (Han, 46: an oval-rectangular face, a strong square jaw, level almond single-lidded eyes,
   a straight refined nose, a full greying beard), under an Eastern Han iron 兜鍪 of small laced lamellae with a short red 缨.
   Head units ≈ 10 per cm; chin at (0, 34). part 'back' = the hood behind and the neck; 'front' = the face, beard and helmet ---------- */
const FACE = 'M-76,-156 C-82,-134 -84,-112 -84,-92 C-86,-74 -87,-56 -82,-36 C-78,-16 -70,2 -58,14 C-44,28 -22,34 0,34 C22,34 44,28 58,14 C70,2 78,-16 82,-36 C87,-56 86,-74 84,-92 C84,-112 82,-134 76,-156 C52,-176 -52,-176 -76,-156 Z';
/* the beard along the jaw (short, hugging it; the cheek and jaw planes show above it), the chin covered */
const BEARDJ = 'M-80,-96 L-89,-96 C-91,-62 -89,-30 -79,-4 C-69,16 -44,34 -14,41 C-6,43 6,43 14,41 C44,34 69,16 79,-4 C89,-30 91,-62 89,-96 L80,-96 C80,-68 78,-44 72,-24 C64,-4 50,8 32,12 C20,14 10,12 0,12 C-10,12 -20,14 -32,12 C-50,8 -64,-4 -72,-24 C-78,-44 -80,-68 -80,-96 Z';
/** the head palette: the kit's warm Han skin (cao54b / set54bs PAL) warmed by the fire; the shadow in the cel tone */
const HP = {skin: '#CC9168', skinS: '#9C6848', skinD: '#6E4130', skinH: '#F2B482', skinHH: '#FFD8A8'};
const HOOD = 'M-142,30 C-130,0 -122,-30 -120,-70 L-120,-140 C-120,-204 -74,-244 0,-246 C74,-244 120,-204 120,-140 L120,-70 C122,-30 130,0 142,30 C106,40 70,34 44,14 L-44,14 C-70,34 -106,40 -142,30 Z';
const DOME = 'M-120,-140 C-120,-204 -74,-244 0,-246 C74,-244 120,-204 120,-140 C76,-152 -76,-152 -120,-140 Z';
const CHEEK = (s: number) => `M${s * -120},-140 L${s * -88},-142 C${s * -90},-116 ${s * -92},-86 ${s * -90},-56 C${s * -88},-36 ${s * -90},-20 ${s * -94},-8 C${s * -108},0 ${s * -124},8 ${s * -140},22 C${s * -130},-8 ${s * -122},-36 ${s * -120},-70 Z`;
const hx2 = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mixc = (a: string, b: string, k: number) => { const A = hx2(a), B = hx2(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * cl(k)).toString(16).padStart(2, '0')).join(''); };
const HeadB: React.FC<{t: number; part: 'back' | 'front'}> = ({t, part}) => { const c = {...FP, ...HP};
	if (part === 'back') return <g>
		<defs><pattern id="dvaHL" width={13} height={18} patternUnits="userSpaceOnUse"><rect width={13} height={18} fill="#1A1615" />
			<path d="M0.8,0.8 L12.2,0.8 L12.2,13.6 C9.6,15.8 3.4,15.8 0.8,13.6 Z" fill="#3A3432" /><rect x={0.8} y={0.8} width={11.4} height={2.2} fill="#9A8A80" opacity={0.28} />
			<rect x={0} y={15.8} width={13} height={2.2} fill={c.lace} opacity={0.7} /></pattern></defs>
		{/* the hood and the flared neck guard behind */}
		<path d={HOOD} fill="url(#dvaHL)" /><path d={HOOD} fill="#000" opacity={0.3} />
		{/* the neck: strong, shaded under the jaw, lit on his left */}
		<path d="M-76,-10 C-80,50 -88,110 -108,180 L108,180 C88,110 80,50 76,-10 Z" fill={c.skinS} />
		<path d="M40,0 C52,60 62,120 72,180 L108,180 C88,110 80,50 76,-10 Z" fill={c.skinH} opacity={0.8} />
		<path d="M-76,-10 C-80,50 -88,110 -108,180 L-62,180 C-56,110 -52,50 -48,0 Z" fill="#000" opacity={0.3} />
		<path d="M76,-10 C80,50 88,110 108,180" fill="none" stroke="#FFB070" strokeWidth={3} opacity={0.7} />
		<path d="M-76,-10 C-80,50 -88,110 -108,180" fill="none" stroke={c.acc} strokeWidth={2.4} opacity={0.6} />
		<path d="M-26,40 C-16,60 -14,90 -18,120 M24,40 C16,60 14,90 18,120" fill="none" stroke={c.skinD} strokeWidth={2.2} opacity={0.45} />
	</g>;
	const eye = (s: number) => { const x = s * 37, y = -86, ALM = 'M-18,1.5 C-10,-4.4 8,-6.4 19,-4 C11,2.4 -8,4.4 -18,1.5 Z', T = `translate(${x},${y}) scale(${s},1)`;
		return <g key={s}>
			<defs><clipPath id={`dvaE${s}`}><path d={ALM} transform={T} /></clipPath></defs>
			<g transform={T}>
				<path d="M-24,-13 C-10,-20 12,-21 27,-15 L26,-2 C10,-6 -10,-6 -24,0 Z" fill={c.skinD} opacity={s < 0 ? 0.62 : 0.46} />
				<path d={ALM} fill={s < 0 ? '#B8A48E' : '#E8D6BE'} />
			</g>
			<g clipPath={`url(#dvaE${s})`}>
				<circle cx={x - s} cy={y - 0.6} r={7} fill="#2E1C12" /><circle cx={x - s} cy={y - 0.6} r={3.8} fill="#050302" />
				<rect x={x - 22} y={y - 9} width={44} height={6.4} fill="#000" opacity={0.55} /></g>
			<circle cx={x - s + 2.2} cy={y - 2.6} r={1.5} fill={s < 0 ? '#D8F0F4' : '#FFF2D8'} />
			<g transform={T}>
				{/* the upper lid: flat and heavy across the top of the iris, its outer end lifting (凤眼) */}
				<path d="M-19.5,2 C-10,-5.4 8,-7.6 20.5,-4.6 L24,-7" fill="none" stroke={c.line} strokeWidth={5.4} strokeLinecap="round" strokeLinejoin="round" />
				<path d="M-13,4.4 C-4,5.4 7,3.8 15,0.4" fill="none" stroke={c.line} strokeWidth={1.2} opacity={0.5} />
				{/* the brow: a hard V — the inner end driven down and in, the outer end raised */}
				<path d="M-28,1 C-15,-8 6,-17 30,-23 L31,-16 C10,-11 -10,-4 -23,7 Z" fill={c.hair} transform="translate(0,-9)" />
			</g>
		</g>; };
	/* the dome: rows of small overlapping plates following the skull, lit toward screen right */
	const ext = (y: number) => 120 * Math.sqrt(Math.max(0, 1 - Math.pow((y + 140) / 108, 2)));
	const rows = [-244, -228, -212, -196, -180, -164];
	const sw = Math.sin(t * 4.3) * 3, sw2 = Math.sin(t * 5.7 + 1) * 2.5;
	return <g>
		<defs><clipPath id="dvaHf"><path d={FACE} /></clipPath><clipPath id="dvaHd"><path d={DOME} /></clipPath></defs>
		<path d={FACE} fill={c.skin} />
		<g clipPath="url(#dvaHf)">
			{/* cel planes: the shadow side (far left), broad lit cheek and jaw planes toward the fire */}
			<path d="M-40,-176 C-36,-130 -46,-100 -48,-72 C-50,-50 -46,-30 -42,-10 C-38,10 -32,24 -26,40 L-110,40 L-110,-176 Z" fill={c.skinS} />
			<path d="M28,-170 C52,-168 72,-158 80,-140 L80,-120 C60,-130 42,-136 28,-138 Z" fill={c.skinH} opacity={0.7} />
			<path d="M38,-74 C58,-72 78,-78 87,-86 C88,-66 85,-46 81,-30 C70,-40 52,-56 38,-74 Z" fill={c.skinH} opacity={0.6} />
			<path d="M58,-28 C68,-22 76,-12 80,-4 C72,6 64,12 56,14 C60,2 61,-12 58,-28 Z" fill={c.skinH} opacity={0.4} />
			<path d="M-90,-176 L90,-176 L90,-128 C50,-136 -50,-136 -90,-128 Z" fill="#1A0C08" opacity={0.45} />
		</g>
		{/* the frown between the brows */}
		<path d="M-5,-110 C-6,-103 -6,-98 -3,-93 M5,-110 C6,-103 6,-98 3,-93 M-7,-91 C-2,-89 2,-89 7,-91" fill="none" stroke={c.line} strokeWidth={2.2} opacity={0.75} />
		{eye(-1)}{eye(1)}
		{/* the nose: shorter, a low bridge, a soft broad tip */}
		<path d="M-7,-86 C-8,-74 -10,-62 -15,-52" fill="none" stroke={c.skinS} strokeWidth={2.6} opacity={0.65} />
		<path d="M2,-82 C3,-72 5,-62 7,-56 L3,-55 C1,-63 0,-72 -1,-81 Z" fill={c.skinH} opacity={0.5} />
		<path d="M-20,-48 C-17,-38 -6,-36 0,-38 C6,-36 17,-38 20,-48 C14,-43 6,-43 0,-45 C-6,-43 -14,-43 -20,-48 Z" fill={c.skinD} opacity={0.6} />
		<path d="M-19,-47 C-24,-51 -23,-58 -16,-61 M19,-47 C24,-51 23,-58 16,-61" fill="none" stroke={c.skinS} strokeWidth={2.2} opacity={0.65} />
		<ellipse cx={-8} cy={-42} rx={4.6} ry={2} fill="#2A140C" /><ellipse cx={8} cy={-42} rx={4.6} ry={2} fill="#3A1C10" />
		<ellipse cx={4} cy={-52} rx={6.4} ry={4.6} fill={c.skinHH} opacity={0.55} />
		{/* the set mouth: a short straight line, the lower lip tensed */}
		<path d="M-14,-13 C-6,-14 6,-14 14,-13" fill="none" stroke="#2A120C" strokeWidth={2.8} strokeLinecap="round" />
		<path d="M-14,-13 L-17,-10.5 M14,-13 L17,-10.5" fill="none" stroke="#2A120C" strokeWidth={1.6} strokeLinecap="round" opacity={0.8} />
		<path d="M-9,-10 C-4,-11 4,-11 9,-10 C5,-7.8 -5,-7.8 -9,-10 Z" fill="#A0603E" />
		<path d="M-8,-4 C-3,-2.6 3,-2.6 8,-4" fill="none" stroke={c.skinS} strokeWidth={1.6} opacity={0.6} />
		{/* 美髯: a short beard along the jaw and over the chin; three long locks (三绺) falling from the chin and the jaw; a drooping 八字 moustache */}
		<path d={BEARDJ} fill="#25201D" />
		<path d="M-6,-6 C-3,-4 3,-4 6,-6 L4,8 C1,10 -1,10 -4,8 Z" fill="#25201D" />
		<path d="M-84,-80 C-84,-50 -78,-20 -64,0 M84,-80 C84,-50 78,-20 64,0 M-40,22 C-24,32 -10,36 0,36 M40,22 C24,32 10,36 0,36" fill="none" stroke="#9A9086" strokeWidth={1.6} opacity={0.6} />
		<path d="M79,-4 C69,16 44,34 14,41" fill="none" stroke="#FFB070" strokeWidth={2.2} opacity={0.6} />
		{(() => { const sw = Math.sin(t * 2.6) * 4, sw2 = Math.sin(t * 2.2 + 1.3) * 3.5;
			const lock = (a: P, cc: P, b: P) => qpts(a, cc, b, 12);
			const L: [P[], number, boolean][] = [
				[lock([-50, 10], [-56, 70], [-46 + sw2, 122]), 11, false],
				[lock([50, 10], [56, 70], [48 + sw2, 120]), 11, true],
				[lock([0, 22], [3 + sw * 0.3, 92], [4 + sw, 160]), 16, true]];
			return L.map(([pts, w0, lit], i) => <g key={i}>
				<path d={strand(pts, (u) => w0 * Math.pow(1 - u, 0.75) + 1.2)} fill="#2A2421" />
				<path d={strand(pts.map((q) => [q[0] - w0 * 0.25, q[1]] as P), (u) => w0 * 0.3 * (1 - u) + 0.4)} fill="#000" opacity={0.3} />
				{[-0.45, -0.1, 0.25, 0.55].map((o, j) => <path key={j} d={'M' + pts.slice(0, 11).map((q, k) => `${f1(q[0] + o * w0 * Math.pow(1 - k / 12, 0.75))},${f1(q[1])}`).join(' L')} fill="none" stroke={j === 2 ? '#D2C8BA' : '#8E847A'} strokeWidth={j === 2 ? 1.6 : 1.2} opacity={0.75} />)}
				{lit && <path d={'M' + pts.slice(0, 10).map((q, k) => `${f1(q[0] + w0 * 0.95 * Math.pow(1 - k / 12, 0.75))},${f1(q[1])}`).join(' L')} fill="none" stroke="#FFB070" strokeWidth={1.8} opacity={0.55} />}
			</g>); })()}
		{/* the 八字 moustache: from under the nose out and down, its ends falling past the mouth corners */}
		{[-1, 1].map((sg) => { const pts = qpts([sg * 2, -35], [sg * 24, -34], [sg * 33, 8], 10);
			return <g key={sg}><path d={strand(pts, (u) => 6.4 * (1 - u) + 1.2)} fill="#2C2522" />
				<path d={'M' + pts.slice(0, 9).map((q) => `${f1(q[0])},${f1(q[1] - 1)}`).join(' L')} fill="none" stroke="#A89C8E" strokeWidth={1.3} opacity={0.7} /></g>; })}
		{/* the lamellar cheek guards, flaring at the lower edge */}
		{[-1, 1].map((s) => <g key={s}><path d={CHEEK(s)} fill="url(#dvaHL)" />
			<path d={CHEEK(s)} fill={s < 0 ? '#000' : '#FFB070'} opacity={s < 0 ? 0.42 : 0.16} />
			<path d={`M${s * -88},-142 C${s * -90},-116 ${s * -92},-86 ${s * -90},-56 C${s * -88},-30 ${s * -90},-6 ${s * -96},14`} fill="none" stroke={s < 0 ? FP.acc : '#FFB070'} strokeWidth={2.4} opacity={0.6} />
			<path d={`M${s * -94},-8 C${s * -108},0 ${s * -124},8 ${s * -140},22`} fill="none" stroke="#2A1810" strokeWidth={5} /></g>)}
		{/* the dome: small overlapping lamellae laced in rows */}
		<path d={DOME} fill="#181413" />
		<g clipPath="url(#dvaHd)">
			{rows.map((y0, r) => { const y1 = y0 + 21, e = ext(y0 + 12) + 8, n = Math.max(4, Math.round(e / 11)), out: React.ReactNode[] = [];
				for (let i = 0; i < n; i++) { const a0 = -Math.PI / 2 + (Math.PI * i) / n, a1 = a0 + Math.PI / n, x0 = e * Math.sin(a0), x1 = e * Math.sin(a1), k = (Math.sin((a0 + a1) / 2) + 1) / 2;
					const col = k > 0.5 ? mixc('#3E3634', '#8A6A54', (k - 0.5) * 2) : mixc('#1C1817', '#3E3634', k * 2);
					out.push(<path key={i} d={`M${f1(x0 + 0.7)},${y0} L${f1(x1 - 0.7)},${y0} L${f1(x1 - 0.7)},${y1 - 4} C${f1(x1 - 1.6)},${y1 + 1} ${f1(x0 + 1.6)},${y1 + 1} ${f1(x0 + 0.7)},${y1 - 4} Z`} fill={col} />,
						<rect key={'l' + i} x={(x0 + x1) / 2 - 1.2} y={y0 + 3} width={2.4} height={2.4} fill="#8A2A20" opacity={0.75} />); }
				return <g key={r}>{out}</g>; })}
			<path d="M-120,-140 C-120,-204 -74,-244 0,-246 L0,-234 C-62,-230 -104,-196 -106,-140 Z" fill="#000" opacity={0.32} />
		</g>
		<path d="M-120,-140 C-120,-204 -74,-244 0,-246" fill="none" stroke={FP.acc} strokeWidth={2.4} opacity={0.5} />
		<path d="M0,-246 C74,-244 120,-204 120,-140" fill="none" stroke="#FFB070" strokeWidth={3} opacity={0.8} />
		{/* the brow edge banded in dark leather, stitched */}
		<path d="M-124,-156 C-76,-168 76,-168 124,-156 L124,-132 C76,-144 -76,-144 -124,-132 Z" fill="#2A1A12" />
		<path d="M-124,-156 C-76,-168 76,-168 124,-156 L124,-152 C76,-164 -76,-164 -124,-152 Z" fill="#7A5236" opacity={0.6} />
		<path d="M-118,-144 C-74,-155 74,-155 118,-144" fill="none" stroke="#9A7454" strokeWidth={1.4} strokeDasharray="5 5" opacity={0.7} />
		<path d="M40,-164 C80,-162 108,-158 124,-154 L124,-134 C100,-140 76,-143 40,-145 Z" fill="#FFB070" opacity={0.18} />
		{/* a small knob at the top, a short red 缨 rising from it, stirred by the wind */}
		<ellipse cx={0} cy={-248} rx={13} ry={7} fill="#2E2826" /><ellipse cx={3} cy={-250} rx={7} ry={3} fill="#8A6A54" opacity={0.6} />
		<path d={`M-9,-252 C-11,-262 ${-6 + sw},-272 ${2 + sw},-278 C${8 + sw},-274 ${14 + sw2},-271 ${19 + sw2},-267 C${12 + sw2},-261 11,-256 9,-252 Z`} fill="#9C2A22" />
		<path d={`M-3,-252 C-4,-261 ${0 + sw},-270 ${5 + sw},-275 C${9 + sw2},-270 ${12 + sw2},-266 ${15 + sw2},-265 C${9},-259 7,-256 5,-252 Z`} fill="#C8402E" />
		<path d={`M1,-254 C2,-261 ${5 + sw},-268 ${8 + sw},-272`} fill="none" stroke="#F07040" strokeWidth={2} opacity={0.8} />
	</g>; };
/** the robe at the throat (body units): 交领 右衽 — his left panel over his right, white inner collars, a "y" under the beard; the cuirass's laced neck edge */
const Collar: React.FC = () => { const c = FP;
	return <g>
		<path d="M-100,10 C-74,40 -34,58 4,60 C44,58 84,38 106,10 C90,62 50,92 4,96 C-44,92 -84,62 -100,10 Z" fill={c.under} />
		<path d="M-84,16 C-60,34 -30,48 4,56 C-20,66 -40,76 -56,90 C-74,72 -86,48 -84,16 Z" fill={c.underS} />
		<path d="M-80,18 C-56,36 -26,50 6,58" fill="none" stroke={c.white} strokeWidth={9} opacity={0.85} />
		<path d="M90,16 C62,36 30,52 0,62 C-20,70 -38,80 -54,94" fill="none" stroke="#24120E" strokeWidth={15} />
		<path d="M86,10 C58,30 26,46 -4,56 C-24,64 -42,74 -58,88" fill="none" stroke={c.white} strokeWidth={9} />
		<path d="M-112,14 C-82,72 -36,100 6,102 C48,100 92,70 116,14" fill="none" stroke="#5E2219" strokeWidth={9} />
	</g>; };

/* ---------- the body behind the arm (local units ≈ 8.9 per cm at scale 1, chin at 0,0): hunched, the sword shoulder forward ---------- */
const TORSO = 'M-252,76 C-226,40 -164,22 -100,12 C-74,44 -34,62 4,64 C44,62 84,42 106,12 C164,20 222,38 246,74 C258,160 232,250 178,330 L-110,330 C-182,250 -248,160 -252,76 Z';
const SKIRT = 'M-112,312 L178,312 C206,380 222,440 236,520 L-150,520 C-138,440 -126,380 -112,312 Z';
const Body: React.FC<{t: number}> = ({t}) => { const c = FP, w1 = Math.sin(t * 3.4) * 22, w2 = Math.sin(t * 4.1 + 1.2) * 28, w3 = Math.sin(t * 2.9 + 2.1) * 18;
	/* the cape: thrown back from the shoulders by the wind of the charge, a great wing out to screen right with a scalloped trailing edge */
	const E = (x: number, y: number, k: number) => `${f1(x + k * w1 * 0.5)},${f1(y + k * w2 * 0.4)}`;
	const CAPER = `M140,30 C260,-30 420,-70 ${E(600, -90, 0.6)} C${E(720, -100, 0.8)} ${E(820, -80, 1)} ${E(900, -40, 1)} C${E(860, 0, 1)} ${E(880, 40, 1)} ${E(940, 90, 1.2)}`
		+ ` C${E(870, 110, 1)} ${E(860, 160, 1)} ${E(880, 220, 1.1)} C${E(800, 220, 0.9)} ${E(770, 260, 0.9)} ${E(760, 320, 1)} C${E(680, 300, 0.8)} ${E(620, 330, 0.7)} ${E(580, 390, 0.7)}`
		+ ` C${E(500, 360, 0.5)} 430,400 380,470 C330,330 260,160 140,30 Z`;
	return <g>
		<defs><clipPath id="dvaCR"><path d={CAPER} /></clipPath><clipPath id="dvaT"><path d={TORSO} /></clipPath>
			<radialGradient id="dvaTv" cx="-40" cy="80" r="340" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset="0.7" stopColor="#000" stopOpacity="0.18" /><stop offset="1" stopColor="#000" stopOpacity="0.5" /></radialGradient>
			<pattern id="dvaLm" width={17} height={30} patternUnits="userSpaceOnUse"><rect width={17} height={30} fill="#161211" />
				<path d="M1,1 L16,1 L16,24 C12.6,27 4.4,27 1,24 Z" fill="#26201E" /><rect x={1} y={1} width={15} height={3.2} fill="#8A7A70" opacity={0.14} />
				<rect x={0} y={27} width={17} height={3} fill="#5E2219" opacity={0.8} /></pattern></defs>
		<path d={CAPER} fill={c.cape} />
		<g clipPath="url(#dvaCR)">
			{/* folds radiating from the shoulder: lit crests, dark troughs; the trailing edge glowing with the fire behind */}
			{[[0.0, 0.5], [0.33, 0.22], [0.62, 0.42]].map(([u, o], i) => { const ex = 900 - u * 340, ey = -40 + u * 380;
				return <path key={i} d={`M170,60 C${f1(330 + u * 40)},${f1(-10 + u * 160)} ${f1(560 - u * 120 + w1 * 0.4)},${f1(-40 + u * 280)} ${f1(ex + w2 * 0.5)},${f1(ey + w3 * 0.4)} L${f1(ex - 40 + w2 * 0.5)},${f1(ey + 40 + w3 * 0.4)} C${f1(520 - u * 120)},${f1(10 + u * 300)} ${f1(320 + u * 40)},${f1(30 + u * 180)} 190,110 Z`} fill={c.capeH} opacity={o} />; })}
			{[[0.18], [0.48], [0.8]].map(([u], i) => { const ex = 900 - u * 340, ey = -40 + u * 380;
				return <path key={i} d={`M180,80 C${f1(330 + u * 40)},${f1(0 + u * 170)} ${f1(560 - u * 120 + w1 * 0.4)},${f1(-30 + u * 290)} ${f1(ex + w2 * 0.5)},${f1(ey + w3 * 0.4)}`} fill="none" stroke={c.capeS} strokeWidth={16} opacity={0.75} />; })}
			<path d={CAPER} fill="none" stroke="#FFB04E" strokeWidth={22} opacity={0.55} />
		</g>
		{/* the lamellar skirt below the belt, far and dark */}
		<path d={SKIRT} fill="url(#dvaLm)" /><path d={SKIRT} fill="#000" opacity={0.45} />
		{/* the cuirass, turned, the chest near and the waist far: dark, backlit, the plates catching the fire on its right */}
		<path d={TORSO} fill="url(#dvaLm)" />
		<path d={TORSO} fill="url(#dvaTv)" />
		<g clipPath="url(#dvaT)">
			<path d="M-262,-20 L-70,-20 C-96,100 -110,220 -90,330 L-300,330 Z" fill="#000" opacity={0.42} />
			<path d="M160,0 C206,100 210,220 170,330 L280,330 L280,0 Z" fill="#FF9A50" opacity={0.2} />
		</g>
		{/* the leather belt and its bronze 带钩 */}
		<path d="M-122,290 C-40,276 90,276 190,290 L184,322 C90,310 -40,310 -116,322 Z" fill="#24160E" />
		<path d="M-122,290 C-40,276 90,276 190,290 L190,296 C90,282 -40,282 -122,296 Z" fill="#5A3A22" opacity={0.8} />
		<g transform="translate(30,300) scale(0.8)"><path d="M38,-6 C44,-3 46,7 38,12 C14,16 -14,12 -28,8 C-36,6 -42,5 -47,3 C-52,0 -51,-5 -46,-6 C-42,-6 -40,-3 -42,0 C-36,1 -30,0 -24,-1 C-8,-5 14,-8 38,-6 Z" fill="#7A5A30" />
			<path d="M38,-6 C14,-8 -8,-5 -24,-1 C-30,0 -36,1 -42,0 L-41,-3 C-34,-3 -26,-4 -18,-5 C0,-8 20,-10 38,-6 Z" fill="#D6A456" opacity={0.85} /></g>
		{/* the far 披膊 (screen right), hunched up beside the helmet */}
		<g transform="translate(0,0)"><path d="M104,0 C164,-30 244,-10 270,52 C284,104 280,156 266,192 C230,206 184,202 148,188 C144,126 132,56 104,0 Z" fill="url(#dvaLm)" />
		<path d="M200,-10 C238,6 262,34 270,64 C280,114 278,156 266,192 L248,194 C256,146 252,86 224,34 Z" fill="#FFB070" opacity={0.3} />
		<path d="M266,192 C230,206 184,202 148,188" fill="none" stroke="#5E2219" strokeWidth={8} /></g>
	</g>; };
/** the near 披膊 over the sword shoulder (local units, drawn over the head's neck guard) */
const PaulNear: React.FC = () => { const c = FP;
	return <g>
		<path d="M-120,10 C-170,-34 -270,-32 -318,30 C-346,80 -346,150 -326,206 C-280,228 -210,226 -160,206 C-140,140 -128,70 -120,10 Z" fill="url(#dvaLm)" />
		<path d="M-120,10 C-170,-34 -270,-32 -318,30 C-346,80 -346,150 -326,206 C-280,228 -210,226 -160,206 C-140,140 -128,70 -120,10 Z" fill="#000" opacity={0.38} />
		<path d="M-318,30 C-346,80 -346,150 -326,206" fill="none" stroke={c.acc} strokeWidth={4} opacity={0.6} />
		<path d="M-150,-6 C-136,40 -132,110 -150,190 L-164,200 C-146,130 -146,60 -164,6 Z" fill={c.metalH} opacity={0.35} />
		<path d="M-326,206 C-280,228 -210,226 -160,206" fill="none" stroke={c.lace} strokeWidth={9} />
		<path d="M-120,10 C-170,-34 -270,-32 -318,30" fill="none" stroke="#7A2C20" strokeWidth={7} />
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
		const X = e.X + Math.sin(t * e.fq + i) * 0.15, Y = e.Y + 1.1 + Math.cos(t * e.fq * 0.7 + i) * 0.12;
		const a: P = [CX + (FB * X) / z, HZ + (FB * Y) / z], b: P = [CX + (FB * X) / z2, HZ + (FB * Y) / z2];
		if (a[0] < -200 || a[0] > W + 200 || a[1] < -200 || a[1] > H + 200) return null;
		const r = Math.min(9, (FB * e.r) / z), o = cl((26 - z) / 6) * (0.7 + 0.3 * Math.sin(t * 6 + i)) * cl(z / 1.2);
		return <g key={i} opacity={o}><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={e.hot > 0.5 ? FIRE.core : FIRE.mid} strokeWidth={r} strokeLinecap="round" />
			<circle cx={a[0]} cy={a[1]} r={r * 2.4} fill="url(#dvaEm)" /></g>; })}</g>; };

/* ---------- the shot ---------- */
/** the camera: the dutch roll, a strong push-in toward his face and fist (parallax p: 0 = the sky … 1 = him), the hit's shake */
const camT = (t: number, p: number) => { const d = Math.max(0, t - T1), z = 0.11 * ease(d / 2.0) + 0.025 * eout(d / 0.4), s = 1 + z * (0.3 + 0.7 * p);
	const roll = ROLL - 1.4 * ease(d / 2.0) * (0.4 + 0.6 * p), FX = 940, FY = 690;
	return `translate(${FX},${FY}) scale(${s.toFixed(5)}) translate(${-FX},${-FY}) rotate(${roll.toFixed(3)},${CX},${CY})`; };
/** where the body sits: its sword shoulder on the projected shoulder of the arm */
const armPts = (t: number) => { const {G} = pose(t), a = vn(vs(pose(t).T, G)), b = (s: number, o: V3): V3 => va(va(G, a, -s), o);
	const fist = b(4.8, [0, 0, 0]), wrist = b(11, [0.6, -0.4, 0]), elbow = b(38, [4.6, -0.6, 0]), sh = b(64, [10, 0, 0]);
	return {fist, wrist, elbow, sh}; };
const SB = 0.96;   /* body px per local unit (pre-push) */
const Hero: React.FC<{t: number}> = ({t}) => { const {d} = pose(t), A = armPts(t), F = prj(A.fist), Wr = prj(A.wrist), E = prj(A.elbow), S = prj(A.sh);
	const lunge = 1 + 0.06 * (1 - eout(d / 0.25)) * -1, bob = Math.sin(t * 3.1) * 2;
	const O: P = [S[0] + 206 * SB, S[1] + 70 * SB + bob], fk = pxk(A.fist) * 0.88, Gs = prj(pose(t).G), Sh: P = [S[0] - 4, S[1] + 96];
	const ang = Math.atan2(prj(pose(t).T)[1] - prj(pose(t).G)[1], prj(pose(t).T)[0] - prj(pose(t).G)[0]) * 180 / Math.PI;
	return <g>
		<g filter="url(#dvaHero)">
			<g transform={`translate(${f1(O[0])},${f1(O[1])}) scale(${(SB * lunge).toFixed(4)}) translate(-214,-46) rotate(-8) translate(214,46)`}>
				<Body t={t} />
				<g transform="translate(-4,-90) rotate(-5)"><HeadB t={t} part="back" /></g>
				<Collar />
				<g transform="translate(-4,-90) rotate(-5)"><HeadB t={t} part="front" /></g>
			</g>
			{/* the thrust arm as one limb: the lamellar sleeve out of the shoulder, the iron bracer narrowing to the wrist, the fist */}
			{(() => { const L = Math.hypot(Sh[0] - Gs[0], Sh[1] - Gs[1]), ux = (Sh[0] - Gs[0]) / L, uy = (Sh[1] - Gs[1]) / L, at = (dd: number, vv = 0): P => [Gs[0] + ux * dd - uy * vv, Gs[1] + uy * dd + ux * vv];
				const d0 = 5.6 * fk, d1 = d0 + (L + 30 - d0) * 0.5, d2 = L + 40, w0 = 3.5 * fk, w1 = 4.7 * fk, w2 = 6.6 * fk, up = -ux < 0 ? 1 : -1;
				const band = (dd: number, ww: number, k: number) => `M${q(at(dd, -ww))} Q${q(at(dd - ww * k, 0))} ${q(at(dd, ww))}`;
				return <g>
					<path d={limb([at(d1 - 6), at(d2)], [w1 + 2, w2])} fill="url(#dvaLm)" />
					<path d={limb([at(d1 - 6), at(d2)], [w1 + 2, w2])} fill="#000" opacity={0.25} />
					<path d={limb([at(d1, up * w1 * 0.7), at(d2, up * w2 * 0.7)], [w1 * 0.18, w2 * 0.18])} fill="#FFB070" opacity={0.3} />
					<path d={limb([at(d0), at(d1)], [w0, w1])} fill="#2E2A28" />
					<path d={limb([at(d0, up * w0 * 0.62), at(d1, up * w1 * 0.62)], [w0 * 0.16, w1 * 0.16])} fill="#D88A4C" opacity={0.75} />
					<path d={limb([at(d0, -up * w0 * 0.7), at(d1, -up * w1 * 0.7)], [w0 * 0.1, w1 * 0.1])} fill={FP.acc} opacity={0.45} />
					{[0.35, 0.72].map((k) => { const dd = d0 + (d1 - d0) * k, ww = w0 + (w1 - w0) * k; return <path key={k} d={band(dd, ww, 0.35)} fill="none" stroke="#141010" strokeWidth={2.4} opacity={0.75} />; })}
					<path d={band(d1, w1 + 2, 0.35)} fill="none" stroke="#5A2018" strokeWidth={5} />
					<path d={band(d0 + 2, w0, 0.35)} fill="none" stroke="#6E2A1E" strokeWidth={4} />
				</g>; })()}
			<g transform={`translate(${f1(O[0])},${f1(O[1])}) scale(${(SB * lunge).toFixed(4)}) translate(-214,-46) rotate(-8) translate(214,46)`}>
				<g transform="translate(10,-40)"><PaulNear /></g>
			</g>
			{/* the sword arm toward the lens: the sleeve under the 披膊, the bracer, the cuff */}

			<path d={limb([[E[0] + 2.4 * pxk(A.elbow), E[1] - 3.6 * pxk(A.elbow)], [Wr[0] + 2 * pxk(A.wrist), Wr[1] - 3 * pxk(A.wrist)]], [1 * pxk(A.elbow), 0.9 * pxk(A.wrist)])} fill={FP.metalH} opacity={0.6} />
			<g transform={`translate(${f1(Gs[0])},${f1(Gs[1])}) rotate(${f1(Math.atan2(Sh[1] - Gs[1], Sh[0] - Gs[0]) * 180 / Math.PI)}) scale(${fk.toFixed(3)})`}><FistGrip /></g>
		</g>
	</g>; };

/** the letterbox: black, then the bars snap open from a slit in ~4 frames; the bottom bar stays */
const Letterbox: React.FC<{t: number}> = ({t}) => { const d = t - T1, u = eout((d - 0.03) / 0.12), top = 540 * (1 - u), bot = 540 + (BAR_REST - 540) * u;
	return <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
		{top > 0.5 && <rect x={0} y={0} width={W} height={top} fill="#000" />}
		<rect x={0} y={bot} width={W} height={H - bot} fill="#000" />
	</svg>; };

export const D1V: React.FC<{t: number}> = ({t}) => { const d = Math.max(0, t - T1);
	const A = 11 * Math.exp(-d / 0.12) * cl((0.5 - d) / 0.1), shx = A * Math.sin(d * 97 + 0.7) * Math.cos(d * 31), shy = A * 0.7 * Math.sin(d * 83 + 2.1);
	const shake = {position: 'absolute' as const, inset: 0, transform: `translate(${f1(shx)}px,${f1(shy)}px) scale(1.02)`, transformOrigin: '50% 50%'};
	const open = eout((d - 0.03) / 0.12);
	const tip = (() => { const s = swordGeo(t); return s.tip; })();
	/* the glint: big on the black first frames, then a short star on the point */
	const ga = d < 0.05 ? 1.7 : 0.6 + 0.5 * Math.exp(-(d - 0.05) / 0.3), gl = 0.85 + 0.15 * Math.sin(t * 9), L = 90 * ga, V = 56 * ga;
	return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#0A0605'}}>
		<div style={shake}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
				<defs><WorldDefs />
					<RimF id="dvaHero" lx={1} ly={-0.4} k={5} c={FIRE.mid} o={0.95} lx2={-1} ly2={-0.2} k2={4} c2={FP.acc} o2={0.85} blur={1} />
<radialGradient id="dvaPf"><stop offset="0" stopColor="#7A3A24" stopOpacity="0.5" /><stop offset="0.6" stopColor="#4A2420" stopOpacity="0.22" /><stop offset="1" stopColor="#3A2224" stopOpacity="0" /></radialGradient>
					<radialGradient id="dvaEm"><stop offset="0" stopColor="#FFE9B0" stopOpacity="1" /><stop offset="0.35" stopColor="#FFB04E" stopOpacity="0.55" /><stop offset="1" stopColor="#EA6028" stopOpacity="0" /></radialGradient>
					<radialGradient id="dvaVig" cx="0.6" cy="0.45" r="0.8"><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.6" /></radialGradient>
				</defs>
				<g transform={camT(t, 0.15)}><World d={d} t={t} /></g>
				{/* embers and smoke streaming toward the lens: all behind him and his sword */}
				{open > 0.001 && <g opacity={open} transform={camT(t, 0.6)}><Embers t={t} /></g>}
				<g transform={camT(t, 1)}><Hero t={t} /></g>
				<rect width={W} height={H} fill="url(#dvaVig)" />
			</svg>
		</div>
		<Letterbox t={t} />
		<div style={shake}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
				<defs><radialGradient id="dvaTip"><stop offset="0" stopColor="#FFF6E0" stopOpacity="1" /><stop offset="0.2" stopColor="#FFD08A" stopOpacity="0.55" /><stop offset="1" stopColor="#FF8A3A" stopOpacity="0" /></radialGradient></defs>
				<g transform={camT(t, 1)}>
					<Sword t={t} />
					<g opacity={gl}><circle cx={tip[0]} cy={tip[1]} r={80 * ga} fill="url(#dvaTip)" />
						<path d={`M${tip[0] - L},${tip[1]} L${tip[0]},${tip[1] - 3.4} L${tip[0] + L},${tip[1]} L${tip[0]},${tip[1] + 3.4} Z M${tip[0]},${tip[1] - V} L${tip[0] + 3},${tip[1]} L${tip[0]},${tip[1] + V} L${tip[0] - 3},${tip[1]} Z`} fill="#FFF6E0" transform={`rotate(${-ROLL},${f1(tip[0])},${f1(tip[1])})`} /></g>
				</g>
			</svg>
		</div>
	</div>; };
void q;
