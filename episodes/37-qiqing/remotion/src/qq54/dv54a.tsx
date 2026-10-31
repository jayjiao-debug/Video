import React from 'react';
import {W, H} from '../qq50/kit50';
import {RimF, P, rnd, f1} from './cao54b';
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

/* ---------- the sword hand: a fist round the grip seen from the point's side (cm, origin = the grip axis behind the guard) ---------- */
const FistFront: React.FC = () => { const c = FP;
	return <g>
		{/* the fist mass: the back of the hand rising behind, the curled fingers under the grip */}
		<path d="M-5.6,-2.6 C-5.8,-5.2 -3.2,-6.6 0,-6.6 C3.4,-6.6 6,-5.4 6.1,-2.4 C6.3,1 5.6,4.2 3.6,5.6 C1.2,6.8 -2.6,6.8 -4.6,5.4 C-6,4 -6,0.6 -5.6,-2.6 Z" fill={c.skin} />
		<path d="M-5.6,-2.6 C-5.8,-5.2 -3.2,-6.6 0,-6.6 L-0.6,-4.6 C-2.8,-4.4 -4.4,-3 -4.6,-0.6 C-4.8,1.8 -4.4,4 -3.6,5.6 C-5.4,4.6 -6.1,1.6 -5.6,-2.6 Z" fill={c.skinS} />
		{/* the knuckle ridge on top, lit */}
		<path d="M-4.6,-4.6 C-3.6,-6.3 -2.2,-6.6 -1.2,-5.8 C-0.2,-6.7 1.2,-6.8 2.2,-5.9 C3.2,-6.6 4.6,-6.2 5.4,-4.9 C5.9,-4.1 6,-3.4 6,-2.8 C4,-3.6 1,-4.2 -1.6,-4 C-3,-3.9 -4,-3.6 -4.9,-3.1 Z" fill={c.skinH} />
		{/* the curled index finger across the front, the other fingers stacked under it */}
		<path d="M-5.2,-0.2 C-3,-1.4 2,-1.6 5.8,-0.4 C6.2,1.2 5.8,2.4 5.2,2.9 C2,2.2 -2.4,2.2 -5.2,2.8 C-5.6,1.8 -5.6,0.6 -5.2,-0.2 Z" fill="#C88660" />
		<path d="M-5.2,2.8 C-2.4,2.2 2,2.2 5.2,2.9 C5,3.9 4.4,4.7 3.6,5.2 C1,4.6 -2,4.7 -4.4,5.1 C-4.9,4.4 -5.2,3.6 -5.2,2.8 Z" fill="#A86A48" />
		<path d="M-5.2,2.8 C-2.4,2.2 2,2.2 5.2,2.9 M-4.4,5.1 C-2,4.7 1,4.6 3.6,5.2" fill="none" stroke={c.skinD} strokeWidth={0.18} opacity={0.75} />
		<path d="M1.2,-1.2 C1.4,0.4 1.4,1.6 1.1,2.4 M3.6,-0.9 C3.8,0.6 3.7,1.8 3.4,2.6" fill="none" stroke={c.skinD} strokeWidth={0.14} opacity={0.5} />
		{/* the thumb over the index finger, its nail toward the guard */}
		<path d="M5.9,-3.4 C6.6,-1.6 6.2,0.2 4.6,0.9 C2.6,1.6 -0.4,1.4 -2.2,0.9 C-3.2,0.6 -3.3,-0.6 -2.4,-1 C-0.4,-1.6 2.2,-1.8 3.6,-2.6 C4.4,-3 5.2,-3.6 5.9,-3.4 Z" fill={c.skinH} />
		<path d="M-2.2,0.9 C-0.4,1.4 2.6,1.6 4.6,0.9 C3.4,1.9 0.4,2.1 -2.2,0.9 Z" fill={c.skinS} opacity={0.8} />
		<path d="M-2.3,-0.9 C-1.6,-1.3 -0.6,-1.3 0,-0.9 C-0.4,-0.3 -1.6,-0.2 -2.3,-0.9 Z" fill={c.skinHH} opacity={0.85} />
		{/* the cool 石青 rim on the shaded side, the warm rim on the lit side */}
		<path d="M-4.6,5.4 C-6,4 -6,0.6 -5.6,-2.6 C-5.8,-5.2 -3.2,-6.6 0,-6.6" fill="none" stroke={c.acc} strokeWidth={0.28} opacity={0.75} />
		<path d="M0,-6.6 C3.4,-6.6 6,-5.4 6.1,-2.4 C6.3,1 5.6,4.2 3.6,5.6" fill="none" stroke="#FFC890" strokeWidth={0.3} opacity={0.9} />
	</g>; };

/* ---------- the head under a Han lamellar iron 兜鍪, front view (the face design of HeadF: chin at 0,0; brow −110) ---------- */
const FACE = 'M-74,-150 C-80,-130 -82,-110 -80,-92 C-79,-74 -77,-54 -73,-36 C-68,-20 -58,-6 -42,6 C-30,14 -16,18 0,18 C16,18 30,14 42,6 C58,-6 68,-20 73,-36 C77,-54 79,-74 80,-92 C82,-110 80,-130 74,-150 C50,-172 -50,-172 -74,-150 Z';
const BEARD = 'M-83,-76 C-82,-52 -76,-30 -64,-10 C-50,12 -28,32 0,36 C28,32 50,12 64,-10 C76,-30 82,-52 83,-76 L73,-74 C71,-54 64,-38 52,-26 C44,-18 36,-13 27,-10 C20,-8 15,-3 12,1 C6,-1 -6,-1 -12,1 C-15,-3 -20,-8 -27,-10 C-36,-13 -44,-18 -52,-26 C-64,-38 -71,-54 -73,-74 Z';
const BSTR = Array.from({length: 34}, (_, i) => { const side = i % 2 ? 1 : -1, k = Math.floor(i / 2) / 16, a = -1.45 + k * 1.45;
	const x0 = side * (78 - k * 46) * 0.98, y0 = -70 + k * 96 - (k > 0.8 ? (k - 0.8) * 60 : 0), dx = side * -Math.sin(a + 1.5) * 7, dy = 9 + k * 3;
	return `M${f1(x0)},${f1(y0)} l${f1(dx)},${f1(dy)}`; }).join(' ');
/* the helmet: a hood of small iron plates laced in rows, a forehead band, cheek and neck guards framing the face */
const HOOD = 'M-158,96 C-140,52 -122,8 -118,-56 L-118,-140 C-116,-212 -70,-258 0,-262 C70,-258 116,-212 118,-140 L118,-56 C122,8 140,52 158,96 C110,104 60,92 30,70 L-30,70 C-60,92 -110,104 -158,96 Z';
const DOME = 'M-118,-138 C-116,-212 -70,-258 0,-262 C70,-258 116,-212 118,-138 C74,-150 -74,-150 -118,-138 Z';
const CHEEK = (s: number) => `M${s * -118},-136 L${s * -86},-138 C${s * -88},-112 ${s * -90},-84 ${s * -86},-52 C${s * -82},-30 ${s * -74},-12 ${s * -60},4 C${s * -64},22 ${s * -84},48 ${s * -112},66 C${s * -130},76 ${s * -146},86 ${s * -158},96 C${s * -140},52 ${s * -122},8 ${s * -118},-56 Z`;
const HeadA: React.FC<{t: number}> = ({t}) => { const c = FP;
	const eye = (s: number) => { const x = s * 37, y = -84;
		/* narrowed: a flat heavy upper lid low over the iris, the lower lid raised */
		const alm = `M${x - 21},${y + 1} C${x - 12},${y - 3.6} ${x + 8},${y - 4.6} ${x + 21},${y - 1.6} C${x + 11},${y + 3.8} ${x - 9},${y + 4.8} ${x - 21},${y + 1} Z`;
		return <g key={s}>
			<defs><clipPath id={`dvaE${s}`}><path d={alm} /></clipPath></defs>
			<path d={`M${x - 28},${y - 9} C${x - 14},${y - 18} ${x + 12},${y - 19} ${x + 28},${y - 10} L${x + 26},${y + 6} C${x + 10},${y + 1} ${x - 12},${y + 2} ${x - 26},${y + 7} Z`} fill={c.skinD} opacity={s < 0 ? 0.85 : 0.62} />
			<path d={alm} fill={s < 0 ? '#B4A08A' : '#F0DCC0'} />
			<g clipPath={`url(#dvaE${s})`}><circle cx={x - s * 1.5} cy={y + 0.4} r={7.4} fill="#3A2214" /><circle cx={x - s * 1.5} cy={y + 0.4} r={4.4} fill="#070403" />
				<circle cx={x - s * 1.5 + 2.6} cy={y + 2.6} r={2.2} fill="#E07A3A" opacity={0.7} />
				<rect x={x - 24} y={y - 8} width={48} height={5.6} fill="#000" opacity={0.45} /></g>
			<circle cx={x - s * 1.5 + 2.4} cy={y - 1.2} r={1.7} fill={s < 0 ? '#CFF0F4' : '#FFF0D0'} />
			<path d={`M${x - 23},${y + 1.6} C${x - 12},${y - 4.8} ${x + 9},${y - 5.8} ${x + 23},${y - 2.6}`} fill="none" stroke={c.line} strokeWidth={5.2} strokeLinecap="round" />
			<path d={`M${x - 17},${y + 4} C${x - 6},${y + 6.4} ${x + 8},${y + 5.6} ${x + 17},${y + 2}`} fill="none" stroke={c.line} strokeWidth={1.6} opacity={0.7} />
			<path d={`M${x - 15},${y + 11} C${x - 5},${y + 15} ${x + 8},${y + 14} ${x + 17},${y + 9}`} fill="none" stroke={c.line} strokeWidth={1.3} opacity={0.4} />
		</g>; };
	/* the dome rows: small plates, curving with the skull, lit toward screen right */
	const rows = [-252, -232, -212, -192, -172, -152];
	const ext = (y: number) => 118 * Math.sqrt(Math.max(0, 1 - Math.pow((y + 140) / 122, 2)));
	const crestW = Math.sin(t * 7.3) * 5, crestW2 = Math.sin(t * 9.1 + 1) * 4;
	return <g>
		<defs><clipPath id="dvaHf"><path d={FACE} /></clipPath><clipPath id="dvaHb"><path d={BEARD} /></clipPath><clipPath id="dvaHd"><path d={DOME} /></clipPath>
			<pattern id="dvaHL" width={14} height={20} patternUnits="userSpaceOnUse"><rect width={14} height={20} fill="#1E1A19" />
				<path d="M0.8,0.8 L13.2,0.8 L13.2,15.6 C10.4,18 3.6,18 0.8,15.6 Z" fill="#3E3836" /><rect x={0.8} y={0.8} width={12.4} height={2.4} fill="#8A7A70" opacity={0.3} />
				<rect x={0} y={17.6} width={14} height={2.4} fill={c.lace} opacity={0.75} /></pattern></defs>
		{/* the hood behind the face: lining, neck guard */}
		<path d={HOOD} fill="url(#dvaHL)" />
		<path d={HOOD} fill="#000" opacity={0.25} />
		<path d="M-30,70 C-20,40 20,40 30,70 Z" fill="#0A0605" />
		{/* the face */}
		<path d="M-56,-14 C-58,14 -60,36 -64,60 L64,60 C60,36 58,14 56,-14 Z" fill={c.skinS} />
		<path d={FACE} fill={c.skin} />
		<g clipPath="url(#dvaHf)">
			<path d="M-4,-172 C-2,-128 -12,-96 -10,-70 C-8,-52 -16,-44 -14,-30 C-12,-14 -16,0 -12,20 L-110,20 L-110,-172 Z" fill={c.skinS} />
			<ellipse cx={-38} cy={-90} rx={32} ry={18} fill={c.skinD} opacity={0.6} />
			<ellipse cx={38} cy={-90} rx={30} ry={17} fill={c.skinS} opacity={0.6} />
			<path d="M50,-78 C62,-80 74,-84 80,-90 C80,-72 78,-56 74,-40 C70,-30 64,-22 56,-16 C58,-34 56,-56 50,-78 Z" fill={c.skinH} />
			<path d="M60,-88 C70,-90 78,-94 81,-102 C82,-94 81,-88 80,-84 C74,-82 66,-82 60,-84 Z" fill={c.skinHH} opacity={0.8} />
			<path d="M4,-98 C8,-80 10,-62 14,-48 L6,-46 C4,-62 2,-80 0,-96 Z" fill={c.skinH} opacity={0.9} />
			{/* the band's shadow on the forehead */}
			<path d="M-90,-172 L90,-172 L90,-118 C50,-128 -50,-128 -90,-118 Z" fill="#1A0C08" opacity={0.55} />
			<path d="M-74,-140 C-78,-110 -80,-80 -72,-50 L-82,-50 L-82,-140 Z" fill="#000" opacity={0.3} />
		</g>
		{/* furrowed brows: thick, driven down to the nose */}
		<path d="M-82,-118 C-64,-126 -40,-118 -14,-97 L-9,-89 C-18,-92 -26,-95 -34,-99 C-50,-107 -64,-110 -80,-109 Z" fill={c.hair} />
		<path d="M82,-118 C64,-126 40,-118 14,-97 L9,-89 C18,-92 26,-95 34,-99 C50,-107 64,-110 80,-109 Z" fill={c.hair} />
		<path d="M-74,-115 C-60,-120 -44,-118 -30,-108 M74,-115 C60,-120 44,-118 30,-108" fill="none" stroke={c.grey} strokeWidth={1} opacity={0.4} />
		<path d="M-6,-112 C-8,-104 -8,-96 -5,-88 M6,-112 C8,-104 8,-96 5,-88 M-9,-80 C-3,-78 3,-78 9,-80" fill="none" stroke={c.line} strokeWidth={2.4} opacity={0.75} />
		{eye(-1)}{eye(1)}
		<path d="M-8,-96 C-10,-76 -12,-60 -18,-46" fill="none" stroke={c.skinD} strokeWidth={2.6} opacity={0.65} />
		<path d="M-20,-44 C-16,-34 -6,-32 0,-35 C6,-32 16,-34 20,-44 C14,-40 8,-40 0,-42 C-8,-40 -14,-40 -20,-44 Z" fill={c.skinD} opacity={0.85} />
		<ellipse cx={-9} cy={-40} rx={5} ry={2.6} fill="#1A0C08" /><ellipse cx={9} cy={-40} rx={5} ry={2.6} fill="#2A140C" />
		<ellipse cx={7} cy={-52} rx={6} ry={4.4} fill={c.skinHH} opacity={0.75} />
		<path d="M-22,-46 C-34,-36 -38,-24 -38,-12" fill="none" stroke={c.skinD} strokeWidth={2.2} opacity={0.7} />
		<path d="M22,-46 C34,-36 38,-24 38,-12" fill="none" stroke={c.skinS} strokeWidth={2} opacity={0.7} />
		{/* the set mouth: pressed lips, the corners down */}
		<path d="M-22,-12 C-12,-17 12,-17 22,-12 C12,-15 -12,-15 -22,-12 Z" fill="#1E0C08" />
		<path d="M-22,-12 C-12,-17 12,-17 22,-12" fill="none" stroke="#1E0C08" strokeWidth={3} strokeLinecap="round" />
		<path d="M-12,-8 C-6,-10 6,-10 12,-8 C8,-4 -8,-4 -12,-8 Z" fill={c.skinS} /><path d="M2,-8 C6,-9 10,-8 12,-7 C9,-5 5,-4 2,-5 Z" fill={c.skinH} opacity={0.7} />
		{/* the beard */}
		<path d={BEARD} fill="#2E2824" />
		<g clipPath="url(#dvaHb)">
			<path d="M-90,-80 L-6,-80 C-8,-40 -10,0 -8,40 L-90,40 Z" fill="#000" opacity={0.38} />
			<path d="M50,-60 C70,-60 84,-70 86,-80 L90,40 L30,40 C52,20 62,0 66,-20 C62,-36 56,-50 50,-60 Z" fill="#6A4A34" opacity={0.55} />
			<path d={BSTR} fill="none" stroke={c.grey} strokeWidth={2} strokeLinecap="round" opacity={0.9} />
			<path d="M-30,14 C-20,22 -10,26 0,27 M-16,24 l3,7 M-4,26 l1,8 M8,26 l-1,8 M20,22 l-2,7 M30,16 l-3,7" fill="none" stroke={c.grey} strokeWidth={1.6} strokeLinecap="round" opacity={0.7} />
		</g>
		<path d="M83,-76 C82,-52 76,-30 64,-10 C50,12 28,32 0,36" fill="none" stroke={c.metalH} strokeWidth={2.4} opacity={0.75} />
		<path d="M-2,-31 C-14,-34 -28,-29 -34,-10 C-30,-14 -20,-21 -3,-22 Z M2,-31 C14,-34 28,-29 34,-10 C30,-14 20,-21 3,-22 Z" fill="#2E2824" />
		<path d="M-28,-24 C-22,-27 -14,-28 -8,-27 M28,-24 C22,-27 14,-28 8,-27" fill="none" stroke={c.grey} strokeWidth={1.2} opacity={0.6} />
		{/* the cheek and neck guards over the face's sides */}
		{[-1, 1].map((s) => <g key={s}><path d={CHEEK(s)} fill="url(#dvaHL)" />
			<path d={CHEEK(s)} fill={s < 0 ? '#000' : FP.metalH} opacity={s < 0 ? 0.45 : 0.22} />
			<path d={`M${s * -86},-138 C${s * -88},-112 ${s * -90},-84 ${s * -86},-52 C${s * -82},-30 ${s * -74},-12 ${s * -60},4`} fill="none" stroke={s < 0 ? FP.acc : '#FFB070'} strokeWidth={2.4} opacity={0.6} /></g>)}
		{/* the dome: rows of plates */}
		<path d={DOME} fill="#191514" />
		<g clipPath="url(#dvaHd)">
			{rows.map((y0, r) => { const y1 = y0 + 24, ym = (y0 + y1) / 2, e = ext(ym) + 6, n = Math.max(3, Math.round(e / 15)), out: React.ReactNode[] = [];
				for (let i = 0; i < n; i++) { const a0 = -Math.PI / 2 + (Math.PI * i) / n, a1 = a0 + Math.PI / n, x0 = e * Math.sin(a0), x1 = e * Math.sin(a1), sh = (Math.sin((a0 + a1) / 2) + 1) / 2;
					const col = sh > 0.78 ? '#7A5E4C' : sh > 0.55 ? '#4E4442' : sh > 0.3 ? '#38302E' : '#221C1B';
					out.push(<path key={i} d={`M${f1(x0 + 0.8)},${y0} L${f1(x1 - 0.8)},${y0} L${f1(x1 - 0.8)},${y1 - 6} C${f1(x1 - 2)},${y1 - 1} ${f1(x0 + 2)},${y1 - 1} ${f1(x0 + 0.8)},${y1 - 6} Z`} fill={col} />); }
				return <g key={r}>{out}<path d={`M${-e},${y1 - 2} C${-e * 0.5},${y1 + 3} ${e * 0.5},${y1 + 3} ${e},${y1 - 2}`} fill="none" stroke={c.lace} strokeWidth={3} opacity={0.8} /></g>; })}
			<path d="M40,-258 C90,-240 116,-200 118,-140 L96,-140 C96,-190 76,-226 40,-246 Z" fill="#FFB070" opacity={0.25} />
			<path d="M-118,-140 C-116,-212 -70,-258 0,-262 L0,-250 C-60,-246 -100,-206 -104,-140 Z" fill="#000" opacity={0.35} />
		</g>
		<path d="M-118,-140 C-116,-212 -70,-258 0,-262" fill="none" stroke={FP.acc} strokeWidth={2.6} opacity={0.55} />
		<path d="M0,-262 C70,-258 116,-212 118,-140" fill="none" stroke="#FFB070" strokeWidth={3} opacity={0.8} />
		{/* the forehead band: plain iron, riveted */}
		<path d="M-122,-152 C-74,-164 74,-164 122,-152 L122,-128 C74,-140 -74,-140 -122,-128 Z" fill="#2A2422" />
		<path d="M-122,-152 C-74,-164 74,-164 122,-152 L122,-147 C74,-159 -74,-159 -122,-147 Z" fill="#9A8070" opacity={0.55} />
		<path d="M40,-160 C80,-158 106,-154 122,-150 L122,-130 C100,-136 74,-139 40,-141 Z" fill="#FFB070" opacity={0.22} />
		{[-96, -60, -20, 20, 60, 96].map((x) => <circle key={x} cx={x} cy={-142 - 4 * Math.cos(x / 80)} r={3} fill={x > 0 ? '#C08A5A' : '#5A4A44'} />)}
		{/* the crest: an iron knob and a small red tuft, streaming back in the wind */}
		<path d="M-9,-262 L-7,-282 L7,-282 L9,-262 Z" fill="#2E2826" /><ellipse cx={0} cy={-284} rx={10} ry={5} fill="#4A3E38" />
		{[[-10, -300, -26], [-2, -312, -6], [6, -306, 14], [12, -296, 30], [0, -296, 4]].map(([dx, y, sw], i) => <path key={i}
			d={`M${-4 + i * 2},-285 C${dx - 4 + crestW * 0.5},${-290 - i} ${dx + sw * 0.4 + crestW},${y + 8} ${dx + sw + crestW + (i % 2 ? crestW2 : 0)},${y} C${dx + sw * 0.5 + crestW * 0.6},${y + 10} ${dx + 6},${-288} ${2 + i * 2},-285 Z`}
			fill={i === 1 ? '#E0603A' : i % 2 ? '#9C2A22' : '#C23A2C'} />)}
	</g>; };

/* ---------- the body behind the arm (local units ≈ 8.9 per cm at scale 1, chin at 0,0): hunched, the sword shoulder forward ---------- */
const TORSO = 'M-250,40 C-220,0 -160,-6 -96,14 C-70,48 -30,70 8,72 C48,68 84,44 104,14 C160,-14 220,-6 244,40 C256,130 230,230 176,318 L-110,318 C-180,240 -246,140 -250,40 Z';
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
		{/* the off arm, the elbow driven back, the fist clenched at the hip */}
		<path d={limb([[200, 60], [262, 210], [206, 300]], [56, 44, 38])} fill={c.underS} />
		<path d={limb([[226, 66], [288, 212], [230, 302]], [12, 10, 8])} fill={c.underH} opacity={0.5} />
		<path d={limb([[262, 214], [206, 300]], [42, 38])} fill="#1E1A19" />
		<path d={limb([[282, 222], [226, 306]], [8, 7])} fill={c.metalH} opacity={0.5} />
		<g transform="translate(196,330) rotate(-30) scale(0.8)">
			<path d="M-46,-30 C-30,-44 30,-46 46,-30 C56,-10 56,22 42,38 C20,50 -24,50 -42,38 C-56,20 -58,-12 -46,-30 Z" fill={c.skinS} />
			<path d="M-40,-32 C-24,-44 26,-46 42,-32 L40,-20 C20,-30 -22,-30 -40,-20 Z" fill={c.skinH} opacity={0.9} />
			{[-30, -10, 10, 30].map((x) => <path key={x} d={`M${x - 9},-24 C${x - 10},-4 ${x - 9},12 ${x - 7},22 L${x + 7},22 C${x + 9},12 ${x + 10},-4 ${x + 9},-24 Z`} fill={x > 0 ? c.skin : '#9A6040'} />)}
			<path d="M-44,26 C-24,18 10,16 30,22 C40,26 42,36 34,42 C10,48 -24,46 -42,38 Z" fill={c.skin} />
			<path d="M-30,24 C-10,20 12,20 28,24" fill="none" stroke={c.skinHH} strokeWidth={3} opacity={0.6} />
		</g>
		{/* the cuirass, turned, the chest near and the waist far: dark, backlit, the plates catching the fire on its right */}
		<path d={TORSO} fill="url(#dvaLm)" />
		<path d={TORSO} fill="url(#dvaTv)" />
		<g clipPath="url(#dvaT)">
			<path d="M-262,-20 L-70,-20 C-96,100 -110,220 -90,330 L-300,330 Z" fill="#000" opacity={0.42} />
			<path d="M160,0 C206,100 210,220 170,330 L280,330 L280,0 Z" fill="#FF9A50" opacity={0.2} />
			{[110, 190, 262].map((y) => <path key={y} d={`M-280,${y + 26} C-120,${y - 8} 80,${y - 10} 260,${y + 14}`} fill="none" stroke="#5E2219" strokeWidth={6} opacity={0.8} />)}
		</g>
		{/* the leather belt and its bronze 带钩 */}
		<path d="M-122,290 C-40,276 90,276 190,290 L184,322 C90,310 -40,310 -116,322 Z" fill="#24160E" />
		<path d="M-122,290 C-40,276 90,276 190,290 L190,296 C90,282 -40,282 -122,296 Z" fill="#5A3A22" opacity={0.8} />
		<g transform="translate(30,300) scale(0.8)"><path d="M38,-6 C44,-3 46,7 38,12 C14,16 -14,12 -28,8 C-36,6 -42,5 -47,3 C-52,0 -51,-5 -46,-6 C-42,-6 -40,-3 -42,0 C-36,1 -30,0 -24,-1 C-8,-5 14,-8 38,-6 Z" fill="#7A5A30" />
			<path d="M38,-6 C14,-8 -8,-5 -24,-1 C-30,0 -36,1 -42,0 L-41,-3 C-34,-3 -26,-4 -18,-5 C0,-8 20,-10 38,-6 Z" fill="#D6A456" opacity={0.85} /></g>
		{/* the robe at the throat: 交领 右衽, a "y" of white collars under the beard */}
		<path d="M-96,14 C-70,48 -30,70 8,72 C48,68 84,44 104,14 C80,30 50,40 8,42 C-34,40 -70,30 -96,14 Z" fill={c.under} />
		<path d="M-70,24 C-46,40 -22,50 2,56" fill="none" stroke={c.white} strokeWidth={9} opacity={0.85} />
		<path d="M78,22 C50,40 24,52 -2,58 C-22,64 -40,72 -56,84" fill="none" stroke="#24120E" strokeWidth={15} />
		<path d="M72,16 C46,34 20,46 -6,52 C-26,58 -44,66 -60,78" fill="none" stroke={c.white} strokeWidth={9} />
		<path d="M-262,70 C-232,24 -170,8 -96,14 C-70,48 -30,70 8,72 C48,68 84,44 104,14 C160,6 214,26 238,70" fill="none" stroke="#5E2219" strokeWidth={8} />
		{/* the far 披膊 (screen right), hunched up beside the helmet */}
		<g transform="translate(0,-46)"><path d="M104,0 C164,-30 244,-10 270,52 C284,104 280,156 266,192 C230,206 184,202 148,188 C144,126 132,56 104,0 Z" fill="url(#dvaLm)" />
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
	const fist = b(4.8, [0, 0, 0]), wrist = b(11, [0.6, -0.8, 0]), elbow = b(38, [4.6, -3.6, 0]), sh = b(64, [10, -7, 0]);
	return {fist, wrist, elbow, sh}; };
const SB = 0.96;   /* body px per local unit (pre-push) */
const Hero: React.FC<{t: number}> = ({t}) => { const {d} = pose(t), A = armPts(t), F = prj(A.fist), Wr = prj(A.wrist), E = prj(A.elbow), S = prj(A.sh);
	const lunge = 1 + 0.06 * (1 - eout(d / 0.25)) * -1, bob = Math.sin(t * 3.1) * 2;
	const O: P = [S[0] + 206 * SB, S[1] + 70 * SB + bob], fk = pxk(A.fist) * 0.78;
	const ang = Math.atan2(prj(pose(t).T)[1] - prj(pose(t).G)[1], prj(pose(t).T)[0] - prj(pose(t).G)[0]) * 180 / Math.PI;
	return <g>
		<g filter="url(#dvaHero)">
			<g transform={`translate(${f1(O[0])},${f1(O[1])}) scale(${(SB * lunge).toFixed(4)}) translate(-214,-46) rotate(-8) translate(214,46)`}>
				<Body t={t} />
				<g transform="translate(-4,-2) rotate(-5)"><HeadA t={t} /></g>
				<g transform="translate(10,-84)"><PaulNear /></g>
			</g>
			{/* the sword arm toward the lens: the sleeve under the 披膊, the bracer, the cuff */}
			<path d={limb([S, E], [6.2 * pxk(A.sh), 5.4 * pxk(A.elbow)])} fill={FP.under} />
			<path d={limb([E, Wr], [5.2 * pxk(A.elbow), 4.4 * pxk(A.wrist)])} fill={FP.metal} />
			<path d={limb([[E[0] + 2.4 * pxk(A.elbow), E[1] - 3.6 * pxk(A.elbow)], [Wr[0] + 2 * pxk(A.wrist), Wr[1] - 3 * pxk(A.wrist)]], [1 * pxk(A.elbow), 0.9 * pxk(A.wrist)])} fill={FP.metalH} opacity={0.6} />
			<circle cx={Wr[0]} cy={Wr[1]} r={4.9 * pxk(A.wrist)} fill={FP.lace} />
			<g transform={`translate(${f1(F[0])},${f1(F[1])}) scale(${fk.toFixed(3)}) rotate(${f1(ang + 152)})`}><FistFront /></g>
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
					<radialGradient id="dvaVig" cx="0.6" cy="0.45" r="0.8"><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.6" /></radialGradient>
				</defs>
				<g transform={camT(t, 0.15)}><World d={d} t={t} /></g>
				<g transform={camT(t, 1)}><Hero t={t} /></g>
				<rect width={W} height={H} fill="url(#dvaVig)" />
			</svg>
			{open > 0.001 && <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', mixBlendMode: 'screen', opacity: open}}>
				<defs><radialGradient id="dvaPf"><stop offset="0" stopColor="#7A3A24" stopOpacity="0.5" /><stop offset="0.6" stopColor="#4A2420" stopOpacity="0.22" /><stop offset="1" stopColor="#3A2224" stopOpacity="0" /></radialGradient>
					<radialGradient id="dvaEm"><stop offset="0" stopColor="#FFE9B0" stopOpacity="1" /><stop offset="0.35" stopColor="#FFB04E" stopOpacity="0.55" /><stop offset="1" stopColor="#EA6028" stopOpacity="0" /></radialGradient></defs>
				<g transform={camT(t, 0.6)}><Embers t={t} /></g>
			</svg>}
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
