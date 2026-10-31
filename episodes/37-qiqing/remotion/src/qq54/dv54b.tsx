import React from 'react';
import {W, H} from '../qq50/kit50';
import {RimF, P, rnd, f1} from './cao54b';
import {HeadF, RunnerF, runTop, Flame3, FIRE, RunKind} from './front54s';
import {Qun, limb} from './set54bs';
/* ep54 · D1 design variant B 「双手持剑」 (owner: "冲出屏幕的感觉，镜头在剑前面看后面").
   A symmetrical poster shot: the camera sits right in front of the 宝剑's point, dead centre. The point is huge at the bottom centre
   (crossing the bottom bar); the blade runs straight back up the middle in hard perspective to both fists on the grip; behind the
   fists 曹操 (46) leans in, framed symmetrically, glaring down the blade at us from under low brows, in an iron 兜鍪 with a small red
   crest. His cape spreads like wings in the wind; behind him the torch charge streams out to both sides in two lanes that converge on
   him, and the 乌巢 granaries burn on the horizon as a wall of fire.
   Timing: 100.256 black + the blade flash → the bars snap open from a slit (~4 frames; the bottom bar stays, the point crosses it) →
   a strong push-in to 102.248. D1V = the whole shot (t = film time). */
const T1 = 100.256;
const cl = (v: number) => Math.min(1, Math.max(0, v));
const eout = (u: number) => 1 - Math.pow(1 - cl(u), 3);
const ease = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
const CX = 960, HZ = 540, FL = 1500, CAMH = 1.25;
const BAR_REST = 930;
const pp = (a: P[]) => a.map((p) => f1(p[0]) + ',' + f1(p[1])).join(' ');
const mir = (a: P[]): P[] => a.map((p) => [2 * CX - p[0], p[1]] as P);
const FP = {skin: '#B9784F', skinS: '#6E4130', skinD: '#452619', skinH: '#F2A86C', skinHH: '#FFD39E', hair: '#15100E',
	metal: '#3A3534', metalS: '#161212', metalH: '#D88A4C', metalC: '#5E8E98', lace: '#7A2C20', under: '#5A2C24', underS: '#2A1512', underH: '#C8643C',
	cape: '#2E1716', capeS: '#140A0A', capeH: '#C0542C', gold: '#D6A456', line: '#24140E', white: '#D8CDB8', acc: '#8FD0DC'};

/* ---------- the camera on the hit: the thrust, the push-in, the shake ---------- */
const cam = (t: number) => { const d = t - T1;
	const th = eout(d / 0.17), Z0 = 0.33 - 0.11 * th + 0.003 * Math.sin(t * 23) * cl(d / 0.3);   /* the point's distance to the lens (m) */
	const z = 0.09 * eout((d - 0.12) / 1.95);                                                    /* the push-in after the bars open */
	const A = 10 * Math.exp(-d / 0.14) * cl((0.5 - d) / 0.1) * (d > 0 ? 1 : 0);
	return {d, Z0, z, sx: A * Math.sin(d * 97 + 0.7) * Math.cos(d * 31), sy: A * 0.7 * Math.sin(d * 83 + 2.1)}; };
/** a layer push about the focus (CX, 470) by depth weight p */
const FY = 520;
const pl = (z: number, p: number) => { const s = 1 + z * p; return `translate(${CX},${FY}) scale(${s.toFixed(5)}) translate(${-CX},${-FY})`; };

/* ---------- the 宝剑 in perspective (metres; camera at the origin looking down +Z, screen y down) ---------- */
const BY = 0.046, LB = 0.80, SC = 0.02, HWG = 0.024, HWC = 0.021, PK = 0.58;
const pj = (X: number, Y: number, Z: number): P => [CX + (FL * X) / Z, HZ + (FL * Y) / Z];
const hwAt = (s: number) => s >= SC ? HWC + (HWG - HWC) * (s - SC) / (LB - SC) : HWC * Math.pow(s / SC, 0.82);
const lerpP = (a: P, b: P, u: number): P => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
const bladeGeo = (Z0: number) => {
	const at = (s: number, k: number) => pj(k * hwAt(s), BY, Z0 + s);
	const shL = at(SC, -1), shR = at(SC, 1), wS = shR[0] - shL[0], T: P = [CX, shL[1] + PK * wS];
	const side = (k: number): P[] => { const a = at(SC, k), c: P = [a[0] - k * 0.02 * wS, a[1] + 0.5 * PK * wS];
		return [at(LB, k), ...Array.from({length: 11}, (_, i) => { const u = i / 10, m = 1 - u; return [m * m * a[0] + 2 * m * u * c[0] + u * u * T[0], m * m * a[1] + 2 * m * u * c[1] + u * u * T[1]] as P; })]; };
	return {G: pj(0, BY, Z0 + LB), T, side, at, Zg: Z0 + LB};
};
const Blade: React.FC<{Z0: number}> = ({Z0}) => { const g = bladeGeo(Z0), {G, T} = g, L = g.side(-1), R = g.side(1);
	const band = (k0: number, k1: number) => { const a = g.side(Math.sign(k0)).map((p, i) => lerpP(g.side(Math.sign(k0))[i], [CX, p[1]], 1 - Math.abs(k0))), b = g.side(Math.sign(k1)).map((p) => lerpP(p, [CX, p[1]], 1 - Math.abs(k1))); return pp(a.concat(b.reverse())); };
	const gy = (s: number, k: number, z = 0) => pj(k, BY - z, g.Zg + s);
	/* the guard (剑格): a plain dark-bronze bar, its top face and front face */
	const GX = 0.047, GY = 0.013, GD = 0.012;
	const fTL = gy(-GD, -GX, GY), fTR = gy(-GD, GX, GY), fBR = gy(-GD, GX, -GY), fBL = gy(-GD, -GX, -GY), fBM = gy(-GD, 0, -GY - 0.004);
	const bTL = gy(GD, -GX, GY), bTR = gy(GD, GX, GY);
	return <g>
		<defs>
			<linearGradient id="dvbL" x1={f1(G[0])} y1={f1(G[1])} x2={f1(T[0])} y2={f1(T[1])} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#1E2228" /><stop offset="0.45" stopColor="#34444E" /><stop offset="0.8" stopColor="#58767F" /><stop offset="1" stopColor="#8FB4BC" /></linearGradient>
			<linearGradient id="dvbR" x1={f1(G[0])} y1={f1(G[1])} x2={f1(T[0])} y2={f1(T[1])} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#6A5244" /><stop offset="0.4" stopColor="#B07A52" /><stop offset="0.78" stopColor="#E8AE74" /><stop offset="1" stopColor="#FFE6BE" /></linearGradient>
			<linearGradient id="dvbRf" x1={f1(G[0])} y1={f1(G[1])} x2={f1(T[0])} y2={f1(T[1])} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFE9B0" stopOpacity="0" /><stop offset="0.5" stopColor="#FFE9B0" stopOpacity="0.55" /><stop offset="1" stopColor="#FFF6E0" stopOpacity="0.9" /></linearGradient>
		</defs>
		{/* the two faces of the blade meeting at the ridge: cool on his right (screen left), the fire on the other */}
		<polygon points={pp([G, ...L])} fill="url(#dvbL)" />
		<polygon points={pp([G, ...R])} fill="url(#dvbR)" />
		{/* the bevelled edges (锷): narrow lighter strips */}
		<polygon points={band(-1, -0.86)} fill="#9CC6CE" opacity={0.55} />
		<polygon points={band(0.86, 1)} fill="#FFF0D0" opacity={0.85} />
		{/* the fire's reflection on the lit face, near the ridge */}
		<polygon points={band(0.1, 0.34)} fill="url(#dvbRf)" />
		{/* the ridge (脊) */}
		<path d={`M${f1(G[0])},${f1(G[1])} L${f1(T[0])},${f1(T[1])}`} stroke="#FFF4DC" strokeWidth={2.6} opacity={0.95} />
		<path d={`M${f1(G[0] - 1.5)},${f1(G[1])} L${f1(T[0] - 2)},${f1(T[1] - 6)}`} stroke="#1A1E22" strokeWidth={1.2} opacity={0.5} />
		<polyline points={pp(L)} fill="none" stroke={FP.acc} strokeWidth={2} opacity={0.8} />
		<polyline points={pp(R)} fill="none" stroke="#FFF6E0" strokeWidth={2.6} />
		{/* one thin gold inlay line along the ridge just past the guard */}
		{(() => { const a = pj(0, BY, g.Zg - 0.02), b = pj(0, BY, g.Zg - 0.15);
			return <path d={`M${f1(a[0])},${f1(a[1])} L${f1(b[0])},${f1(b[1])}`} stroke="#E8B860" strokeWidth={3.4} />; })()}
		{/* the guard */}
		<polygon points={pp([bTL, bTR, fTR, fTL])} fill="#7A6040" />
		<polygon points={pp([fTL, fTR, fBR, fBM, fBL])} fill="#2E261E" />
		<polygon points={pp([fTL, fTR, gy(-GD, GX, GY - 0.004), gy(-GD, -GX, GY - 0.004)])} fill="#B08A50" opacity={0.75} />
		<polygon points={pp([[CX, fTL[1]], fTR, fBR, fBM])} fill="#C07040" opacity={0.22} />
		<path d={`M${f1(fTL[0])},${f1(fTL[1])} L${f1(fBL[0])},${f1(fBL[1])}`} stroke={FP.acc} strokeWidth={1.6} opacity={0.6} />
	</g>; };
/** the point's glint: big on the black first frames, then a short star */
const Glint: React.FC<{Z0: number; d: number; t: number}> = ({Z0, d, t}) => { const T = bladeGeo(Z0).T, ga = d < 0.05 ? 1.7 : 0.6 + 0.5 * Math.exp(-(d - 0.05) / 0.3);
	const o = 0.85 + 0.15 * Math.sin(t * 9), L = 90 * ga, V = 60 * ga;
	return <g opacity={o}>
		<defs><radialGradient id="dvbTg"><stop offset="0" stopColor="#FFF6E0" stopOpacity="1" /><stop offset="0.2" stopColor="#FFD08A" stopOpacity="0.55" /><stop offset="1" stopColor="#FF8A3A" stopOpacity="0" /></radialGradient></defs>
		<circle cx={T[0]} cy={T[1] - 4} r={90 * ga} fill="url(#dvbTg)" />
		<path d={`M${T[0] - L},${T[1] - 4} L${T[0]},${T[1] - 7.5} L${T[0] + L},${T[1] - 4} L${T[0]},${T[1] - 0.5} Z M${T[0]},${T[1] - 4 - V} L${T[0] + 3.2},${T[1] - 4} L${T[0]},${T[1] - 4 + V} L${T[0] - 3.2},${T[1] - 4} Z`} fill="#FFF6E0" />
	</g>; };

/* ---------- the fists on the grip (screen px; the grip runs up the middle above the guard) ---------- */
/** one fist round a vertical grip: four fingers wrapped across it, the knuckles on the outer side (ko = −1 screen left), the thumb over
    the index finger next to the guard (the lowest band); centre x CX, bottom yb, width w, height h */
const Fist: React.FC<{yb: number; w: number; h: number; ko: number}> = ({yb, w, h, ko}) => { const c = FP, x0 = CX - w / 2, x1 = CX + w / 2, fh = (h - 8) / 4;
	const ox = ko < 0 ? x0 : x1, ix = ko < 0 ? x1 : x0, top = yb - h;
	const mass = `M${x0 + 18},${top} C${x0 - 2},${top} ${x0 - 10},${top + 14} ${x0 - 10},${top + h * 0.5} C${x0 - 10},${yb - 10} ${x0 + 2},${yb + 2} ${x0 + 22},${yb + 2} L${x1 - 22},${yb + 2} C${x1 - 2},${yb + 2} ${x1 + 10},${yb - 10} ${x1 + 10},${top + h * 0.5} C${x1 + 10},${top + 14} ${x1 + 2},${top} ${x1 - 18},${top} Z`;
	return <g>
		<path d={mass} fill={c.skin} />
		{/* the shadow side (screen left, away from the fire) and the lit side */}
		<path d={`M${x0 - 10},${top + 6} L${x0 + w * 0.3},${top} C${x0 + w * 0.26},${top + h * 0.5} ${x0 + w * 0.28},${yb - 6} ${x0 + w * 0.3},${yb + 2} L${x0 + 6},${yb + 2} C${x0 - 6},${yb - 8} ${x0 - 10},${top + h * 0.5} ${x0 - 10},${top + 6} Z`} fill={c.skinS} opacity={0.85} />
		<path d={`M${x1 - 26},${top + 4} C${x1 - 4},${top + 8} ${x1 + 8},${top + 20} ${x1 + 9},${top + h * 0.5} C${x1 + 8},${yb - 14} ${x1 - 2},${yb - 2} ${x1 - 14},${yb} C${x1 - 6},${yb - 20} ${x1 - 6},${top + 24} ${x1 - 26},${top + 4} Z`} fill={c.skinH} />
		{/* four fingers wrapped across the grip: the creases between them, the knuckles bulging on the outer side, the tips tucked in */}
		{[1, 2, 3].map((i) => { const y = top + 4 + i * fh; return <path key={i} d={`M${ox - ko * 6},${y} C${ox - ko * w * 0.3},${y + 3} ${ix + ko * w * 0.3},${y + 3} ${ix + ko * 18},${y}`} fill="none" stroke={c.skinD} strokeWidth={2.4} opacity={0.75} />; })}
		{[0, 1, 2, 3].map((i) => { const y = top + 4 + (i + 0.5) * fh; return <g key={i}>
			<ellipse cx={ox + ko * 2} cy={y} rx={13} ry={fh * 0.46} fill={ko < 0 ? '#8E5638' : c.skinHH} opacity={0.9} />
			<path d={`M${ix + ko * 22},${y - fh * 0.34} C${ix + ko * 14},${y - fh * 0.2} ${ix + ko * 14},${y + fh * 0.2} ${ix + ko * 22},${y + fh * 0.34}`} fill="none" stroke={c.skinD} strokeWidth={2} opacity={0.6} /></g>; })}
		{/* the thumb: laid over the index finger along the bottom, its nail toward the knuckles */}
		<path d={`M${ix + ko * 4},${yb - fh * 1.3} C${ix - ko * 30},${yb - fh * 1.2} ${ox + ko * 50},${yb - fh * 0.9} ${ox + ko * 26},${yb - fh * 0.8} C${ox + ko * 14},${yb - fh * 0.4} ${ox + ko * 22},${yb} ${ox + ko * 40},${yb + 2} L${ix - ko * 2},${yb + 2} C${ix + ko * 8},${yb - fh * 0.4} ${ix + ko * 10},${yb - fh} ${ix + ko * 4},${yb - fh * 1.3} Z`} fill={c.skin} />
		<path d={`M${ix + ko * 4},${yb - fh * 1.3} C${ix - ko * 30},${yb - fh * 1.2} ${ox + ko * 50},${yb - fh * 0.9} ${ox + ko * 26},${yb - fh * 0.8}`} fill="none" stroke={c.skinD} strokeWidth={2.4} opacity={0.8} />
		<path d={`M${ox + ko * 30},${yb - fh * 0.66} C${ox + ko * 22},${yb - fh * 0.3} ${ox + ko * 28},${yb - 4} ${ox + ko * 44},${yb - 2} C${ox + ko * 50},${yb - fh * 0.3} ${ox + ko * 46},${yb - fh * 0.6} ${ox + ko * 30},${yb - fh * 0.66} Z`} fill={c.skinHH} opacity={0.7} />
		<path d={`M${CX - 30},${yb - fh * 0.96} C${CX},${yb - fh * 1.06} ${CX + 30},${yb - fh * 1.04} ${CX + 50},${yb - fh * 0.96}`} fill="none" stroke={c.skinHH} strokeWidth={3} opacity={0.5} />
		{/* rims */}
		<path d={`M${x0 - 8},${top + 14} C${x0 - 11},${top + h / 2} ${x0 - 9},${yb - 14} ${x0 + 4},${yb}`} fill="none" stroke={FP.acc} strokeWidth={2.6} opacity={0.6} />
		<path d={`M${x1 + 8},${top + 14} C${x1 + 11},${top + h / 2} ${x1 + 9},${yb - 14} ${x1 - 4},${yb}`} fill="none" stroke={FIRE.mid} strokeWidth={3.4} opacity={0.9} />
	</g>; };

/* ---------- 曹操, front, symmetrical, leaning in (screen px) ---------- */
const LamP: React.FC<{id: string; s: number}> = ({id, s}) => <pattern id={id} width={12 * s} height={22 * s} patternUnits="userSpaceOnUse">
	<rect width={12 * s} height={22 * s} fill="#241E1C" />
	<path d={`M${s * 0.6},${s * 0.6} L${11.6 * s},${s * 0.6} L${11.6 * s},${17.5 * s} C${9 * s},${19.6 * s} ${3 * s},${19.6 * s} ${s * 0.6},${17.5 * s} Z`} fill={FP.metal} />
	<rect x={s * 0.6} y={s * 0.6} width={11 * s} height={2.4 * s} fill="#8A7A70" opacity={0.3} />
	<rect x={0} y={19.8 * s} width={12 * s} height={2.2 * s} fill={FP.lace} opacity={0.7} />
</pattern>;
/** the cape as two wings in the wind, behind the shoulders (left wing; the right is its mirror with its own flutter) */
const wing = (t: number, sg: number) => { const ph = sg > 0 ? 0 : 1.7, w1 = Math.sin(t * 5.3 + ph) * 16, w2 = Math.sin(t * 6.7 + ph + 1) * 20, w3 = Math.sin(t * 4.4 + ph + 2) * 14;
	const m = (x: number) => (sg > 0 ? 2 * CX - x : x);
	const X = (p: number[]) => `${f1(m(p[0]))},${f1(p[1])}`;
	/* heavy cloth thrown out sideways by the wind: from the shoulder, a top edge lifting out, the outer edge rippling down, a waving hem
	   back to the hip; long folds from the shoulder down into the hem */
	const sh = [806, 452], tc = [318 + w1, 322 + w2 * 0.5], m1 = [404 + w3, 552 + w1 * 0.3], bc = [318 + w2 * 0.6, 846 + w3 * 0.5], hip = [716, 912];
	const top = `M${X(sh)} C${X([730, 392 + w1 * 0.2])} ${X([520, 396 + w1 * 0.4])} ${X(tc)}`;
	const outer = `C${X([344 + w2 * 0.5, 380])} ${X([440 + w3 * 0.5, 470])} ${X(m1)} C${X([376 + w3, 650])} ${X([300 + w2 * 0.4, 760])} ${X(bc)}`;
	const hem = `C${X([410 + w1 * 0.4, 880 + w2 * 0.3])} ${X([470, 846 + w3 * 0.4])} ${X([530 + w2 * 0.3, 880 + w1 * 0.3])} C${X([590, 914 + w3 * 0.3])} ${X([640, 880])} ${X(hip)}`;
	const d = `${top} ${outer} ${hem} Z`;
	const folds = [[400 + w1 * 0.4, 868, 30], [530 + w2 * 0.3, 880, 24], [460 + w3 * 0.5, 700, 20]].map(([x, y, k], i) => `M${X([800 - i * 6, 470])} C${X([660 - i * 30, 560])} ${X([x + k * 2, y - 200])} ${X([x - k, y])} L${X([x + k, y])} C${X([x + k * 3, y - 200])} ${X([690 - i * 30, 560])} ${X([808 - i * 6, 480])} Z`);
	return {d, folds, top, outer: `M${X(tc)} ${outer}`};
};
const TORSO: P[] = [[724, 478], [800, 446], [872, 432], [960, 470], [1048, 432], [1120, 446], [1196, 478], [1222, 640], [1236, 950], [684, 950], [698, 640]];
const PAUL: P[] = [[598, 506], [628, 462], [700, 440], [792, 448], [804, 520], [792, 600], [770, 664], [700, 680], [628, 668], [590, 640], [584, 570]];
const Hero: React.FC<{t: number; Z0: number}> = ({t, Z0}) => { const c = FP, g = bladeGeo(Z0);
	/* the fists sit on the grip just behind the guard (they follow the thrust) */
	const gTop = pj(0, BY - 0.013, g.Zg + 0.012)[1], f1b = gTop + 4, f1h = 84, f2b = f1b - f1h + 8, f2h = 72;
	const WR: P = [880, f1b - 30], WL: P = [1040, f2b - 30];
	const EL: P = [652, 730], ER: P = [1268, 712], SL: P = [700, 520], SR: P = [1220, 520];
	const wl = wing(t, -1), wr = wing(t, 1), brth = Math.sin(t * 3.1) * 1.5;
	const sm = (d: string) => <path d={d} />;
	return <g>
		<defs>
			<LamP id="dvbLm" s={1.9} />
			<clipPath id="dvbTo"><polygon points={pp(TORSO)} /></clipPath>
			<linearGradient id="dvbLow" x1="0" y1="560" x2="0" y2="960" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset="0.5" stopColor="#0A0505" stopOpacity="0.45" /><stop offset="1" stopColor="#0A0505" stopOpacity="0.7" /></linearGradient>
			<clipPath id="dvbNk"><path d="M872,432 L960,470 L1048,432 L1060,420 L860,420 Z" /></clipPath>
			<linearGradient id="dvbCape" x1="0" y1="360" x2="0" y2="920" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#6A2018" /><stop offset="0.4" stopColor="#3E1410" /><stop offset="1" stopColor="#1A0907" /></linearGradient>
		</defs>
		{/* the cape: two wings in the wind, backlit by the fire (glowing at the thin edges) */}
		{[wl, wr].map((w, i) => <g key={i}>
			<clipPath id={`dvbW${i}`}><path d={w.d} /></clipPath>
			<path d={w.d} fill="url(#dvbCape)" />
			<g clipPath={`url(#dvbW${i})`}>
				{w.folds.map((d, j) => <path key={j} d={d} fill={c.capeS} opacity={0.7} />)}
				{/* the fire glowing through the thin cloth along the outer edge */}
				<path d={w.outer} fill="none" stroke={FIRE.out} strokeWidth={60} opacity={0.32} />
				<path d={w.outer} fill="none" stroke={FIRE.mid} strokeWidth={18} opacity={0.4} />
				<path d={w.top} fill="none" stroke={c.capeH} strokeWidth={26} opacity={0.45} />
			</g>
			<path d={w.outer} fill="none" stroke={FIRE.mid} strokeWidth={3} opacity={0.8} />
			<path d={w.top} fill="none" stroke={i ? FIRE.core : FIRE.mid} strokeWidth={3.5} opacity={0.9} />
		</g>)}
		{/* the upper arms under the 披膊, the sleeves of the robe */}
		<path d={limb([SL, [676, 620], EL], [64, 60, 52])} fill={c.under} />
		<path d={limb([SR, [1244, 610], ER], [64, 60, 52])} fill={c.under} />
		<path d={limb([[SR[0] + 40, SR[1]], [1286, 610], [ER[0] + 34, ER[1]]], [12, 12, 10])} fill={c.underH} opacity={0.7} />
		<path d={limb([[SL[0] - 40, SL[1]], [636, 620], [EL[0] - 34, EL[1]]], [10, 10, 9])} fill="#6FA8B4" opacity={0.35} />
		{/* the cuirass: lamellar, leaning toward us; shaded away from the fire, lit toward it, laced rows */}
		<g transform={`translate(0,${f1(brth)})`}>
			<polygon points={pp(TORSO)} fill="url(#dvbLm)" />
			<g clipPath="url(#dvbTo)">
				<path d="M930,440 C924,600 920,780 916,960 L660,960 L660,440 Z" fill="#000" opacity={0.42} />
				<path d="M1080,440 C1110,600 1120,780 1124,960 L1260,960 L1260,440 Z" fill={c.metalH} opacity={0.3} />
				<path d="M1150,450 C1170,600 1180,780 1184,960 L1260,960 L1260,450 Z" fill="#FFC890" opacity={0.25} />
				{[560, 660, 760].map((y) => <rect key={y} x={660} y={y} width={600} height={5} fill={c.lace} opacity={0.6} />)}
				<rect x={660} y={560} width={600} height={400} fill="url(#dvbLow)" />
				{/* the leather belt and its bronze 带钩 at the front */}
				<rect x={660} y={850} width={600} height={46} fill="#2A1A10" /><rect x={660} y={850} width={600} height={7} fill="#5A3A22" opacity={0.8} />
				<path d="M1000,858 C1010,862 1012,880 1000,888 C970,893 930,890 912,884 C900,880 896,872 904,868 C930,862 972,856 1000,858 Z" fill="#7A5A30" />
				<path d="M1000,858 C972,856 930,862 904,868 L906,873 C930,867 970,862 998,864 Z" fill={c.gold} opacity={0.85} />
			</g>
			<polyline points={pp(TORSO.slice(0, 7))} fill="none" stroke={c.lace} strokeWidth={8} />
		</g>
		{/* the forearms toward the lens: sleeve → bracer → the cuff, foreshortened (wider near the fists) */}
		<path d={limb([EL, WR], [50, 58])} fill={c.metal} />
		<path d={limb([[EL[0] + 4, EL[1] - 40], [WR[0] - 4, WR[1] - 36]], [8, 9])} fill="#8FB8C0" opacity={0.5} />
		<path d={limb([[EL[0] + 6, EL[1] + 40], [WR[0], WR[1] + 36]], [7, 8])} fill="#000" opacity={0.35} />
		<path d={limb([ER, WL], [50, 54])} fill={c.metal} />
		<path d={limb([[ER[0] - 4, ER[1] - 40], [WL[0] + 4, WL[1] - 36]], [9, 9])} fill={c.metalH} opacity={0.6} />
		{[0.35, 0.62].map((u) => <g key={u}>
			<path d={limb([[EL[0] + (WR[0] - EL[0]) * u, EL[1] + (WR[1] - EL[1]) * u], [EL[0] + (WR[0] - EL[0]) * (u + 0.03), EL[1] + (WR[1] - EL[1]) * (u + 0.03)]], [52 + u * 4, 52 + u * 4])} fill={c.lace} opacity={0.85} />
			<path d={limb([[ER[0] + (WL[0] - ER[0]) * u, ER[1] + (WL[1] - ER[1]) * u], [ER[0] + (WL[0] - ER[0]) * (u + 0.03), ER[1] + (WL[1] - ER[1]) * (u + 0.03)]], [52 + u * 3, 52 + u * 3])} fill={c.lace} opacity={0.85} /></g>)}
		{/* the 披膊 over both shoulders */}
		<polygon points={pp(PAUL)} fill="url(#dvbLm)" /><polygon points={pp(PAUL)} fill="#000" opacity={0.42} />
		<polygon points={pp(mir(PAUL))} fill="url(#dvbLm)" /><polygon points={pp(mir(PAUL))} fill={c.metalH} opacity={0.18} />
		<path d="M590,640 C640,676 720,684 770,664" fill="none" stroke={c.lace} strokeWidth={9} /><path d="M1330,640 C1280,676 1200,684 1150,664" fill="none" stroke={c.lace} strokeWidth={9} />
		<path d="M598,506 C612,470 650,450 700,440" fill="none" stroke={c.acc} strokeWidth={3.5} opacity={0.6} />
		<path d="M1322,506 C1308,470 1270,450 1220,440 M1336,580 C1338,540 1334,520 1322,506" fill="none" stroke={FIRE.mid} strokeWidth={4} opacity={0.75} />
		{/* the iron 兜鍪's neck guard behind the head, then the head (the kit's face, 46, short greying beard), then the helmet */}
		<g transform="translate(960,410) scale(1.1)">
			<path d="M-104,-150 L-112,20 C-96,40 -72,46 -56,40 L-62,-150 Z M104,-150 L112,20 C96,40 72,46 56,40 L62,-150 Z" fill="url(#dvbLm)" />
			<path d="M-104,-150 L-112,20 C-96,40 -72,46 -56,40 L-62,-150 Z" fill="#000" opacity={0.45} />
			<path d="M112,20 C96,40 72,46 56,40 M-112,20 C-96,40 -72,46 -56,40" fill="none" stroke={c.lace} strokeWidth={6} />
			<HeadF id="dvbH" />
			<Helmet t={t} />
			<Glare />
		</g>
		{/* the robe at the throat: 交领 右衽 (his left panel over his right: a "y"), over the base of the neck */}
		<g clipPath="url(#dvbNk)">
			<path d="M850,410 L1070,410 L1070,480 L850,480 Z" fill={c.under} />
			<path d="M870,428 C900,440 930,452 958,462" fill="none" stroke="#24120E" strokeWidth={14} />
			<path d="M872,422 C902,434 932,446 960,456" fill="none" stroke={c.white} strokeWidth={8} opacity={0.85} />
			<path d="M1050,420 C1010,436 970,452 930,476 L1070,476 Z" fill={c.under} />
			<path d="M1054,428 C1014,444 974,460 936,484" fill="none" stroke="#24120E" strokeWidth={14} />
			<path d="M1048,418 C1008,434 968,450 928,474" fill="none" stroke={c.white} strokeWidth={8} />
		</g>
		<path d="M872,432 L960,470 L1048,432" fill="none" stroke={c.lace} strokeWidth={8} />
		{/* the grip and the pommel above the rear fist, then the rear fist (his left), then the front fist (his right) */}
		<rect x={CX - 22} y={f2b - f2h - 22} width={44} height={30} fill="#2A1C14" />
		{[0, 1, 2].map((i) => <path key={i} d={`M${CX - 22},${f2b - f2h - 18 + i * 9} l44,6`} stroke="#6A4A30" strokeWidth={2.4} />)}
		<ellipse cx={CX} cy={f2b - f2h - 24} rx={30} ry={15} fill="#3A2E22" />
		<ellipse cx={CX + 8} cy={f2b - f2h - 28} rx={14} ry={6} fill="#9A7A4A" opacity={0.7} />
		<path d={limb([[WL[0] + 40, WL[1] + 6], WL], [40, 38])} fill={c.lace} />
		<Fist yb={f2b} w={146} h={f2h} ko={1} />
		<path d={limb([[WR[0] - 40, WR[1] + 8], WR], [44, 42])} fill={c.lace} />
		<Fist yb={f1b} w={168} h={f1h} ko={-1} />
		{void sm}
	</g>; };
/** the Han iron 兜鍪: a dome of narrow lamellae, a brow band, cheek guards over the ears, a short spike with a small red crest (HeadF units) */
const Helmet: React.FC<{t: number}> = ({t}) => { const c = FP, sw = Math.sin(t * 6.1) * 5 + Math.sin(t * 9.7) * 2;
	const DOME = 'M-98,-150 C-104,-212 -62,-256 0,-260 C62,-256 104,-212 98,-150 Z';
	return <g>
		<defs><clipPath id="dvbDm"><path d={DOME} /></clipPath></defs>
		{/* the crest: a tuft of red on a bronze spike, tugged by the wind */}
		<g transform="translate(0,16)"><path d={`M-4,-272 L-3,-300 L3,-300 L4,-272 Z`} fill="#7A6040" />
		<path d={`M0,-298 C-16,-306 ${-14 + sw},-330 ${-4 + sw * 1.6},-352 C${2 + sw},-336 ${10 + sw * 0.6},-322 ${16 + sw * 0.4},-318 C14,-306 8,-298 0,-298 Z`} fill="#9A2A1E" />
		<path d={`M2,-300 C${8 + sw * 0.5},-312 ${10 + sw},-326 ${-2 + sw * 1.6},-350 C${6 + sw},-334 ${14 + sw * 0.6},-322 ${16 + sw * 0.4},-318 C14,-308 9,-302 2,-300 Z`} fill="#E0503A" opacity={0.85} />
		<ellipse cx={0} cy={-298} rx={10} ry={4} fill="#B08A50" /></g>
		<path d={DOME} fill="#26221F" />
		<g clipPath="url(#dvbDm)">
			{Array.from({length: 13}, (_, i) => { const x = -96 + i * 16; return <path key={i} d={`M${x},-150 C${x * 0.96},-200 ${x * 0.6},-246 0,-276`} fill="none" stroke="#0E0B0A" strokeWidth={2.6} />; })}
			{Array.from({length: 13}, (_, i) => { const x = -90 + i * 16; return <path key={i} d={`M${x},-152 C${x * 0.96},-200 ${x * 0.6},-246 ${x * 0.05},-272`} fill="none" stroke="#5A524C" strokeWidth={1.4} opacity={0.5} />; })}
			<path d="M-104,-210 C-60,-226 60,-226 104,-210" fill="none" stroke={c.lace} strokeWidth={5} opacity={0.8} />
			<path d="M-110,-150 C-104,-220 -60,-270 0,-276 L-20,-276 C-70,-260 -96,-216 -96,-150 Z" fill="#000" opacity={0.35} />
			<path d="M36,-262 C70,-246 92,-212 96,-160 L78,-160 C76,-206 60,-238 30,-256 Z" fill={c.metalH} opacity={0.45} />
		</g>
		<path d="M30,-254 C70,-240 98,-206 98,-150" fill="none" stroke={FIRE.mid} strokeWidth={3.4} opacity={0.9} />
		<path d="M-30,-254 C-70,-240 -98,-206 -98,-150" fill="none" stroke={c.acc} strokeWidth={2.4} opacity={0.7} />
		{/* the cheek guards over the ears, down to the jaw */}
		<path d="M-102,-156 L-108,-50 C-100,-34 -88,-32 -80,-40 L-80,-150 Z" fill="url(#dvbLm)" />
		<path d="M-102,-156 L-108,-50 C-100,-34 -88,-32 -80,-40 L-80,-150 Z" fill="#000" opacity={0.4} />
		<path d="M102,-156 L108,-50 C100,-34 88,-32 80,-40 L80,-150 Z" fill="url(#dvbLm)" />
		<path d="M98,-150 L104,-52 C102,-44 100,-40 96,-38 L92,-150 Z" fill={c.metalH} opacity={0.55} />
		<path d="M-108,-50 C-100,-34 -88,-32 -80,-40 M108,-50 C100,-34 88,-32 80,-40" fill="none" stroke={c.lace} strokeWidth={4} />
		{/* the brow band */}
		<path d="M-104,-144 C-60,-160 60,-160 104,-144 L104,-166 C60,-182 -60,-182 -104,-166 Z" fill="#1A1614" />
		<path d="M-104,-166 C-60,-182 60,-182 104,-166" fill="none" stroke="#8A7A70" strokeWidth={2.4} opacity={0.6} />
		<path d="M30,-174 C60,-172 86,-166 104,-158 L104,-150 C84,-158 60,-164 30,-166 Z" fill={c.metalH} opacity={0.5} />
		<path d="M-104,-144 C-60,-160 60,-160 104,-144" fill="none" stroke="#000" strokeWidth={3} opacity={0.5} />
	</g>; };
/** the glare: low, knitted brows over the kit's eyes, the upper lids pressed down, the eyes on us (HeadF units) */
const Glare: React.FC = () => { const c = FP;
	const eye = (s: number) => { const x = s * 37, y = -86, alm = `M${x - 20},${y + 1} C${x - 12},${y - 6} ${x + 8},${y - 7} ${x + 20},${y - 2} C${x + 11},${y + 5} ${x - 9},${y + 6} ${x - 20},${y + 1} Z`;
		return <g key={s}>
			<defs><clipPath id={`dvbE${s}`}><path d={alm} /></clipPath></defs>
			<g clipPath={`url(#dvbE${s})`}><rect x={x - 22} y={y - 10} width={44} height={7.4} fill="#1A0C08" opacity={0.75} /></g>
			<path d={`M${x - 22},${y - 1} C${x - 12},${y - 6.5} ${x + 9},${y - 7.5} ${x + 22},${y - 3}`} fill="none" stroke={c.line} strokeWidth={5} strokeLinecap="round" />
			<circle cx={x + 2.2} cy={y - 0.6} r={1.6} fill={s < 0 ? '#CFF2F6' : '#FFF0D0'} />
		</g>; };
	return <g>
		{/* the brow ridge's shadow over the eyes */}
		<path d="M-78,-104 C-50,-110 -24,-104 -8,-90 L-8,-82 C-24,-92 -50,-96 -78,-92 Z M78,-104 C50,-110 24,-104 8,-90 L8,-82 C24,-92 50,-96 78,-92 Z" fill={c.skinD} opacity={0.55} />
		{eye(-1)}{eye(1)}
		{/* the brows: heavy, low, knitted down toward the nose */}
		<path d="M-82,-110 C-64,-122 -38,-118 -10,-96 L-8,-86 C-30,-100 -54,-106 -80,-100 Z" fill={c.hair} />
		<path d="M82,-110 C64,-122 38,-118 10,-96 L8,-86 C30,-100 54,-106 80,-100 Z" fill={c.hair} />
		<path d="M-78,-112 C-60,-118 -40,-116 -24,-106 M78,-112 C60,-118 40,-116 24,-106" fill="none" stroke="#A09486" strokeWidth={1.2} opacity={0.45} />
		{/* the knit between the brows */}
		<path d="M-7,-112 C-9,-104 -9,-96 -6,-88 M7,-112 C9,-104 9,-96 6,-88" fill="none" stroke={c.line} strokeWidth={2.6} opacity={0.7} />
		{/* the set jaw: the masseter shadow */}
		<path d="M-70,-52 C-66,-40 -60,-30 -52,-22 M70,-52 C66,-40 60,-30 52,-22" fill="none" stroke={c.skinD} strokeWidth={2.4} opacity={0.4} />
	</g>; };

/* ---------- the world: the fire sky, smoke, the burning 乌巢 granaries as a wall of fire, the charge in two lanes ---------- */
type Blob = {x: number; y: number; r: number; vx: number; vy: number; lit: number};
const SMK: Blob[] = Array.from({length: 28}, (_, i) => ({x: -200 + rnd(i, 3) * 2300, y: -180 + rnd(i, 4) * 560, r: 110 + rnd(i, 5) * 150, vx: (rnd(i, 6) - 0.5) * 30, vy: -(10 + rnd(i, 7) * 22), lit: rnd(i, 8)}));
const Smoke: React.FC<{d: number}> = ({d}) => <g filter="url(#dvbSb)">
	{SMK.map((s, i) => { const x = s.x + s.vx * d + (s.x < CX ? -1 : 1) * 14 * d, y = s.y + s.vy * d, lit = cl((y + 80) / 520) * (0.35 + s.lit * 0.6);
		return <g key={i}><circle cx={x} cy={y} r={s.r} fill={FIRE.smoke} /><ellipse cx={x} cy={y + s.r * 0.5} rx={s.r * 0.8} ry={s.r * 0.42} fill="#A4441E" opacity={lit * 0.8} /></g>; })}
</g>;
const QX: [number, number][] = [[60, 1.25], [230, 1.0], [470, 0.85], [700, 0.9], [960, 1.05], [1220, 0.9], [1450, 0.85], [1690, 1.0], [1866, 1.25]];
const FireWall: React.FC<{t: number}> = ({t}) => <g>
	<ellipse cx={CX} cy={HZ - 40} rx={1300} ry={260} fill="url(#dvbHg)" />
	{/* the wall: tall tongues all along the horizon, tallest round the granaries */}
	{Array.from({length: 64}, (_, i) => { const x = -80 + i * 33 + rnd(i, 21) * 20, q = QX.reduce((m, [qx, s]) => Math.max(m, s * cl(1 - Math.abs(qx - x) / 150)), 0), h = 60 + rnd(i, 22) * 70 + q * 150;
		return <Flame3 key={i} x={x} y={HZ + 4} w={h * 0.42} h={h} t={t + i * 0.11} seed={i * 1.7 + 5} />; })}
	{QX.map(([x, s], i) => <g key={x}>
		<g transform={`translate(${x},${HZ + 6}) scale(${s * 0.72})`}><Qun drum="#1C0E0A" thatch="#140906" edge="#FFB04E" /></g>
		<Flame3 x={x + 6} y={HZ - 112 * s * 0.72} w={130 * s * 0.72} h={230 * s * 0.72} t={t + i * 0.3} seed={i * 7 + 1} />
		<Flame3 x={x - 34 * s} y={HZ - 60 * s * 0.72} w={80 * s * 0.72} h={130 * s * 0.72} t={t + 0.4 + i * 0.2} seed={i * 7 + 3} />
	</g>)}
	{/* the low band of fire in front of the depot */}
	{Array.from({length: 80}, (_, i) => { const x = -60 + i * 26 + rnd(i, 31) * 14, h = 18 + rnd(i, 32) * 30;
		return <Flame3 key={'l' + i} x={x} y={HZ + 14} w={h * 0.7} h={h} t={t + i * 0.07} seed={i * 2.3 + 40} />; })}
</g>;
/** a man in a lane: side sg, lateral offset dx (m), depth at the hit z0 (m), run phase, kind */
type Man = {sg: number; dx: number; z0: number; ph: number; kind: RunKind; i: number};
const MEN: Man[] = Array.from({length: 150}, (_, i) => { const q = rnd(i, 74);
	return {sg: i % 2 ? 1 : -1, dx: rnd(i, 71) * 1.6, z0: 3.2 + Math.pow(rnd(i, 72), 1.25) * 110, ph: rnd(i, 73) * 6.28, kind: q < 0.6 ? 'torch' : q < 0.9 ? 'ji' : 'plain', i}; });
const VR = 5.2;
const place = (m: Man, z: number) => { const X = m.sg * (1.5 + m.dx + 0.17 * z); return {x: CX + (FL * X) / z, y: HZ + (FL * CAMH) / z, k: FL / (100 * z)}; };
const Charge: React.FC<{t: number; d: number}> = ({t, d}) => {
	const live = MEN.map((m) => ({m, z: m.z0 - VR * (d + 0.6)})).filter((o) => { if (o.z < 2.2) return false; const p = place(o.m, o.z); return p.x + 60 * p.k > -20 && p.x - 60 * p.k < W + 20; }).sort((a, b) => b.z - a.z);
	const far = live.filter((o) => o.z > 30), near = live.filter((o) => o.z <= 30);
	const run = (o: {m: Man; z: number}) => { const p = place(o.m, o.z), ph = o.m.ph + t * 7.6, sgn = o.m.sg < 0 ? -1 : 1;
		return <g key={o.m.i} transform={`translate(${f1(p.x)},${f1(p.y)}) scale(${(sgn * p.k).toFixed(4)},${p.k.toFixed(4)})`}><RunnerF ph={ph} kind={o.m.kind} /></g>; };
	const fl = (o: {m: Man; z: number}) => { if (o.m.kind !== 'torch') return null; const p = place(o.m, o.z), ph = o.m.ph + t * 7.6, q = runTop(ph, 'torch'), sgn = o.m.sg < 0 ? -1 : 1;
		const x = p.x + sgn * q[0] * p.k, y = p.y + q[1] * p.k, s = p.k * 100;
		return <g key={'f' + o.m.i}><circle cx={x} cy={y - 0.12 * s} r={0.6 * s} fill="url(#dvbTo2)" /><Flame3 x={x} y={y} w={0.17 * s} h={0.46 * s} t={t + o.m.i * 0.37} seed={o.m.i} /></g>; };
	return <g>
		{far.map((o) => { const p = place(o.m, o.z), fk = 0.75 + 0.25 * Math.sin(t * 11 + o.m.i * 1.7), hh = 1.75 * p.k * 100;
			return <g key={o.m.i}><rect x={p.x - 0.13 * p.k * 100} y={p.y - hh} width={Math.max(1.2, 0.26 * p.k * 100)} height={hh} fill="#140A08" />
				{o.m.kind === 'torch' && <><circle cx={p.x} cy={p.y - 2.2 * p.k * 100} r={7 + 0.3 * p.k * 100} fill="url(#dvbTo2)" opacity={fk} /><circle cx={p.x} cy={p.y - 2.2 * p.k * 100} r={Math.max(1.6, 0.05 * p.k * 100)} fill={FIRE.core} /></>}</g>; })}
		<g fill="#140A08" filter="url(#dvbRn)">{near.map(run)}</g>
		{near.map(fl)}
	</g>; };

/* ---------- embers and sparks rushing out of the fire toward the lens ---------- */
const EMB = Array.from({length: 90}, (_, i) => ({a: -Math.PI / 2 + (0.55 + rnd(i, 61) * 0.9) * Math.PI * (i % 2 ? 1 : -1), sp: 0.45 + rnd(i, 63) * 0.55, r: 1.2 + rnd(i, 64) * 2.4, spark: rnd(i, 65) < 0.3, off: rnd(i, 66), r0: 1.9 + rnd(i, 67) * 1.6, hot: rnd(i, 68)}));
const Embers: React.FC<{t: number}> = ({t}) => <svg width={W} height={H} style={{position: 'absolute', inset: 0, mixBlendMode: 'screen'}}>
	<defs><radialGradient id="dvbEm"><stop offset="0" stopColor="#FFE9B0" stopOpacity="1" /><stop offset="0.35" stopColor="#FFB04E" stopOpacity="0.6" /><stop offset="1" stopColor="#EA6028" stopOpacity="0" /></radialGradient></defs>
	{EMB.map((e, i) => { const u = (t * e.sp * 0.55 + e.off) % 1, z = 1.25 - u * 1.05, R = (e.r0 * 150) / z, x = CX + Math.cos(e.a) * R * 1.3, y = 470 + Math.sin(e.a) * R * 0.75;
		const o = cl(u / 0.15) * cl((1 - u) / 0.1) * (0.6 + 0.4 * Math.sin(t * 13 + i)), s = e.r / z;
		if (o < 0.02 || x < -40 || x > W + 40 || y < -40 || y > H + 40) return null;
		if (e.spark) { const z2 = z + 0.07, R2 = (e.r0 * 150) / z2; return <line key={i} x1={x} y1={y} x2={CX + Math.cos(e.a) * R2 * 1.3} y2={470 + Math.sin(e.a) * R2 * 0.75} stroke={e.hot > 0.5 ? FIRE.core : FIRE.mid} strokeWidth={Math.min(4, s * 0.7)} strokeLinecap="round" opacity={o} />; }
		return <circle key={i} cx={x} cy={y} r={Math.min(14, s * 3)} fill="url(#dvbEm)" opacity={o} />; })}
</svg>;

/* ---------- the shot ---------- */
const Scene: React.FC<{t: number}> = ({t}) => { const {d, Z0, z} = cam(t);
	return <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
		<defs>
			<filter id="dvbSb" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={24} /></filter>
			<linearGradient id="dvbSky" x1="0" y1="-200" x2="0" y2={HZ} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#070404" /><stop offset="0.35" stopColor="#160A0A" /><stop offset="0.68" stopColor="#401812" /><stop offset="0.9" stopColor="#A8401A" /><stop offset="1" stopColor="#E87A30" /></linearGradient>
			<linearGradient id="dvbGd" x1="0" y1={HZ} x2="0" y2={H} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#5A2612" /><stop offset="0.08" stopColor="#2A120A" /><stop offset="0.5" stopColor="#140A07" /><stop offset="1" stopColor="#080504" /></linearGradient>
			<radialGradient id="dvbHg"><stop offset="0" stopColor="#FFB04E" stopOpacity="0.6" /><stop offset="0.45" stopColor="#EA6028" stopOpacity="0.25" /><stop offset="1" stopColor="#EA6028" stopOpacity="0" /></radialGradient>
			<radialGradient id="dvbTo2"><stop offset="0" stopColor="#FFD08A" stopOpacity="0.7" /><stop offset="0.3" stopColor="#FF9A40" stopOpacity="0.28" /><stop offset="1" stopColor="#EA6028" stopOpacity="0" /></radialGradient>
			<RimF id="dvbRn" lx={1} ly={-0.3} k={2.4} c={FIRE.mid} o={0.95} lx2={-1} ly2={-0.3} k2={2} c2={FIRE.out} o2={0.8} blur={0.8} />
			<RimF id="dvbHero" lx={1} ly={-0.4} k={5} c={FIRE.mid} o={0.95} lx2={-1} ly2={-0.3} k2={4} c2={FP.acc} o2={0.85} blur={1} />
			<radialGradient id="dvbBack" cx={CX} cy={360} r={620} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFB04E" stopOpacity="0.5" /><stop offset="0.45" stopColor="#EA6028" stopOpacity="0.18" /><stop offset="1" stopColor="#EA6028" stopOpacity="0" /></radialGradient>
			<radialGradient id="dvbVig" cx="0.5" cy="0.46" r="0.75"><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.66" /></radialGradient>
		</defs>
		<g transform={pl(z, 0.25)}><rect x={-300} y={-300} width={W + 600} height={HZ + 300} fill="url(#dvbSky)" /><Smoke d={d + 1} /></g>
		<g transform={pl(z, 0.35)}><rect x={-300} y={HZ} width={W + 600} height={H} fill="url(#dvbGd)" /><FireWall t={t} /></g>
		<g transform={pl(z, 0.55)}><Charge t={t} d={d} /></g>
		<g transform={pl(z, 0.85)}><rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#dvbBack)" /></g>
		<g transform={pl(z, 1)}><g filter="url(#dvbHero)"><Hero t={t} Z0={Z0} /></g></g>
		<rect width={W} height={H} fill="url(#dvbVig)" />
	</svg>; };
/** the sword over the letterbox (the point crosses the bottom bar), with its glint */
const SwordLayer: React.FC<{t: number}> = ({t}) => { const {d, Z0, z} = cam(t);
	return <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
		<g transform={pl(z, 1)}><Blade Z0={Z0} />{d >= 0 && <Glint Z0={Z0} d={d} t={t} />}</g>
	</svg>; };
/** black, then the bars snap open from a slit in about 4 frames; the bottom bar stays */
const Letterbox: React.FC<{t: number}> = ({t}) => { const d = t - T1, u = eout((d - 0.03) / 0.12);
	const top = 540 * (1 - u), bot = 540 + (BAR_REST - 540) * u;
	return <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
		{top > 0.5 && <rect x={0} y={0} width={W} height={top} fill="#000" />}
		<rect x={0} y={bot} width={W} height={H - bot} fill="#000" />
	</svg>; };
/** faint speed lines on the thrust, converging on the point */
const Streaks: React.FC<{t: number}> = ({t}) => { const d = t - T1, o = cl((d - 0.1) / 0.06) * cl((0.6 - d) / 0.35);
	if (o <= 0.01) return null;
	return <svg width={W} height={H} style={{position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: o * 0.5}}>
		{Array.from({length: 26}, (_, i) => { const a = (i / 26) * Math.PI * 2 + rnd(i, 91) * 0.2, r0 = 640 + rnd(i, 92) * 200, r1 = r0 + 300 + rnd(i, 93) * 500;
			return <line key={i} x1={CX + Math.cos(a) * r0} y1={470 + Math.sin(a) * r0 * 0.7} x2={CX + Math.cos(a) * r1} y2={470 + Math.sin(a) * r1 * 0.7} stroke="#FFD8A0" strokeWidth={1.4 + rnd(i, 94) * 2} />; })}
	</svg>; };
export const D1V: React.FC<{t: number}> = ({t}) => { const {d, sx, sy} = cam(t), open = eout((d - 0.03) / 0.12);
	const shake = {position: 'absolute' as const, inset: 0, transform: `translate(${f1(sx)}px,${f1(sy)}px) scale(1.02)`, transformOrigin: '50% 50%'};
	return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#000'}}>
		<div style={shake}><Scene t={t} /></div>
		{open > 0.001 && <div style={{opacity: open}}><Embers t={t} /><Streaks t={t} /></div>}
		<Letterbox t={t} />
		<div style={shake}><SwordLayer t={t} /></div>
	</div>; };
void ease;
