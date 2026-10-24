import React from 'react';
import {C, Glow, rnd, lerp, clamp, mixC, seg, ease, Shadow} from './kit46';
/* 「你」: the 汉柏连理 — one root, two trunks. West (left) trunk: dead, silver-grey, broken top, charred hollow
   (when west = 1). East (right) trunk: alive, twisting up into the crown, fed by one strip of bark on its north
   (right) side. Drawn in tree units: base at (0,0), crown top at about y = −720; s scales to pixels.
   It is the only glowing thing in the film (warm gold-green halo + rim light). legend > 0 → dashed outline, thin fill:
   the film's code for 相传 (tradition, not fact). */
type P = [number, number];
const bez = (p0: P, p1: P, p2: P, p3: P, u: number): P => { const v = 1 - u; return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]; };
const curve = (pts: P[], n = 18): P[] => { const out: P[] = []; for (let k = 0; k + 3 < pts.length; k += 3) for (let i = k ? 1 : 0; i <= n; i++) out.push(bez(pts[k], pts[k + 1], pts[k + 2], pts[k + 3], i / n)); return out; };
/** ribbon around a centre line with a width profile (left/right half widths) */
const ribbon = (c: P[], wl: (u: number) => number, wr: (u: number) => number) => {
	const L: P[] = [], R: P[] = [];
	c.forEach((p, i) => { const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, u = i / (c.length - 1);
		L.push([p[0] - nx * wl(u), p[1] - ny * wl(u)]); R.push([p[0] + nx * wr(u), p[1] + ny * wr(u)]); });
	return 'M' + [...L, ...R.reverse()].map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L') + ' Z';
};
const line = (c: P[]) => 'M' + c.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L');
const offsetLine = (c: P[], off: (u: number) => number) => c.map((p, i): P => { const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [p[0] - dy / l * off(i / (c.length - 1)), p[1] + dx / l * off(i / (c.length - 1))]; });

export const WEST_C = curve([[-40, 0], [-50, -110], [-120, -200], [-140, -300], [-158, -380], [-150, -440], [-172, -480]]);
export const EAST_C = curve([[45, 0], [70, -130], [20, -250], [70, -360], [110, -450], [60, -520], [70, -600]]);
/** where the 32 cm bark strip runs (north / right side of the east trunk) */
export const STRIP_C = offsetLine(EAST_C, (u) => lerp(56, 24, u) - 22);
const westW = (u: number) => lerp(70, 30, Math.pow(u, 0.8)) * (1 - 0.08 * Math.sin(u * 9));
const eastWl = (u: number) => lerp(70, 30, u) + 6 * Math.sin(u * 7), eastWr = (u: number) => lerp(66, 28, u) + 5 * Math.cos(u * 6);
const BRANCHES: P[][] = [
	curve([[70, -520], [130, -560], [190, -590], [250, -640]]), curve([[70, -560], [20, -610], [-30, -640], [-80, -690]]),
	curve([[70, -600], [80, -650], [60, -700], [40, -740]]), curve([[90, -470], [150, -480], [220, -470], [280, -500]]),
];
const WEST_BR: P[][] = [curve([[-140, -410], [-180, -430], [-220, -460], [-240, -500]]), curve([[-120, -330], [-160, -340], [-200, -330], [-230, -350]])];
/** crown: flattened pads (old cypress sprays in tiers) at the branch tips; each pad has a dark underside, a mid body,
   a scalloped lit top and fine spray strokes */
type Pad = {x: number; y: number; w: number; h: number; lit: number; seed: number};
const PADS: Pad[] = ([
	[250, -650, 190, 70], [180, -700, 170, 64], [60, -760, 200, 74], [-60, -720, 170, 66], [-110, -650, 150, 58],
	[120, -610, 230, 80], [-10, -620, 200, 70], [300, -560, 160, 60], [210, -520, 180, 62], [40, -540, 160, 56],
	[-80, -580, 140, 52], [330, -490, 120, 46], [150, -470, 150, 50], [90, -690, 150, 56], [-20, -800, 120, 50], [120, -800, 110, 46],
] as [number, number, number, number][]).map(([x, y, w, h], i) => ({x, y, w, h, lit: -((x - 70) / 260) * 0.6 + (-(y + 600) / 200) * 0.6, seed: i}))
	.sort((a, b) => a.y - b.y).reverse();
const WPADS: Pad[] = ([[-210, -500, 130, 50], [-160, -450, 120, 44], [-250, -440, 100, 40], [-130, -520, 100, 40]] as [number, number, number, number][]).map(([x, y, w, h], i) => ({x, y, w, h, lit: 0.3, seed: 40 + i}));
const padTop = (p: Pad, k = 1, dy = 0) => { const n = 9 + (p.seed % 4), L = p.x - p.w / 2 * k, R = p.x + p.w / 2 * k, base = p.y + p.h * 0.35 * k + dy;
	let d = `M${L.toFixed(1)},${base.toFixed(1)}`;
	for (let i = 0; i < n; i++) { const x0 = lerp(L, R, i / n), x1 = lerp(L, R, (i + 1) / n), bump = p.h * k * (0.55 + 0.45 * rnd(i, p.seed + 3)) * Math.sin(Math.PI * (i + 0.5) / n) ** 0.6;
		d += ` Q${((x0 + x1) / 2).toFixed(1)},${(base - bump * 1.15).toFixed(1)} ${x1.toFixed(1)},${(base - bump * 0.62).toFixed(1)}`; }
	d += ` Q${(R - p.w * 0.1 * k).toFixed(1)},${(base + p.h * 0.25 * k).toFixed(1)} ${p.x.toFixed(1)},${(base + p.h * 0.18 * k).toFixed(1)} Q${(L + p.w * 0.1 * k).toFixed(1)},${(base + p.h * 0.25 * k).toFixed(1)} ${L.toFixed(1)},${base.toFixed(1)} Z`;
	return d; };
const PadG: React.FC<{p: Pad; leaf: string; leafM: string; leafL: string; hi: string; dx: number; glow: number; snow: number; night: number; dash?: string; fillO: number}> = ({p, leaf, leafM, leafL, hi, dx, glow, snow, night, fillO}) => <g transform={`translate(${dx},0)`} opacity={fillO}>
	<path d={padTop(p, 1.02, p.h * 0.28)} fill={leaf} />
	<path d={padTop(p, 0.98)} fill={leafM} />
	<ellipse cx={p.x - p.w * 0.12} cy={p.y - p.h * 0.05} rx={p.w * 0.3} ry={p.h * 0.28} fill={leafL} opacity={0.5 + 0.4 * clamp(p.lit + 0.5)} filter="url(#k3)" />
	{Array.from({length: 7}, (_, i) => { const x = p.x - p.w * 0.38 + i * p.w * 0.12, y = p.y + p.h * (0.05 + 0.18 * rnd(i, p.seed + 11)); return <path key={i} d={`M${x - p.w * 0.05},${y} q${p.w * 0.05},${p.h * 0.12} ${p.w * 0.1},0`} stroke={leaf} strokeWidth={2.4} fill="none" opacity={0.6} />; })}
	{Array.from({length: 5}, (_, i) => { const x = p.x - p.w * 0.3 + i * p.w * 0.12, y = p.y - p.h * (0.2 + 0.12 * rnd(i, p.seed + 13)); return <path key={'h' + i} d={`M${x - p.w * 0.04},${y} q${p.w * 0.04},-${p.h * 0.1} ${p.w * 0.08},0`} stroke={hi} strokeWidth={2} fill="none" opacity={0.45 * (1 - night) * clamp(p.lit + 0.6)} />; })}
	{snow > 0 && <path d={padTop({...p, y: p.y - p.h * 0.32}, 0.8, -p.h * 0.05)} fill="#F6F8F8" opacity={snow * 0.95} />}
</g>;
export type TreeProps = {x: number; g: number; s?: number; age?: number; west?: number; burn?: number; legend?: number; glow?: number; sap?: number; t?: number; snow?: number; night?: number; id: string; wind?: number; autumn?: number};
export const HanBai: React.FC<TreeProps> = ({x, g, s = 1, age = 1, west = 1, burn = 0, legend = 0, glow = 1, sap = 0, t = 0, snow = 0, night = 0, id, wind = 1, autumn = 0}) => {
	const mature = seg(age, 0.12, 0.32), sap0 = 1 - mature, k = lerp(0.32, 1, ease(age));
	const fillO = 1 - 0.78 * legend, dash = legend > 0 ? '14 10' : undefined;
	const leaf = mixC(mixC(C.leaf, '#4F6A3A', autumn), '#16241E', night * 0.8), leafM = mixC(mixC(C.leafM, '#7A8A44', autumn), '#1E3026', night * 0.8), leafL = mixC(mixC(C.leafL, '#B5A653', autumn), '#2C4434', night * 0.8);
	const sway = (i: number) => wind * Math.sin(t * 1.3 + i * 0.7) * 3;
	return <g transform={`translate(${x},${g})`}>
		{glow > 0 && <g opacity={glow}>
			<Glow x={70 * k * s} y={-600 * k * s} r={560 * k * s} c={C.glow} o={0.62} id={`${id}h1`} />
			<Glow x={90 * k * s} y={-640 * k * s} r={300 * k * s} c={C.glowCore} o={0.35} id={`${id}h3`} />
			<Glow x={40 * k * s} y={-300 * k * s} r={300 * k * s} c={C.glowDeep} o={0.25} id={`${id}h2`} />
		</g>}
		<Shadow x={120 * k * s} y={4} rx={360 * k * s} ry={34 * k * s} o={0.3 * (1 - night * 0.5)} />
		{/* ---- sapling form ---- */}
		{sap0 > 0 && <g transform={`scale(${s * lerp(1, 2.2, seg(age, 0, 0.3))})`} opacity={sap0}>
			<path d="M-4,0 C-3,-50 -6,-90 -1,-130 L3,-130 C1,-90 5,-50 5,0 Z" fill="url(#barkG)" opacity={fillO} stroke={legend > 0 ? C.glowCore : 'none'} strokeWidth={legend * 2.4} strokeDasharray={dash} />
			{[[0, -150, 34, 40], [-16, -118, 26, 26], [16, -112, 26, 26], [0, -92, 24, 22], [-6, -176, 20, 24]].map(([cx, cy, rx, ry], i) => <ellipse key={i} cx={cx + sway(i) * 0.4} cy={cy} rx={rx} ry={ry} fill={i % 2 ? leafM : leaf} opacity={fillO} stroke={legend > 0 ? C.glowCore : 'none'} strokeWidth={legend * 2.4} strokeDasharray={dash} />)}
			<ellipse cx={-8} cy={-160} rx={12} ry={14} fill={leafL} opacity={0.8 * fillO} />
			{glow > 0 && <ellipse cx={0} cy={-135} rx={52} ry={66} fill="none" stroke={C.glowCore} strokeWidth={2} opacity={0.5 * glow} />}
		</g>}
		{/* ---- mature form ---- */}
		{mature > 0 && <g transform={`scale(${s * k})`} opacity={mature}>
			{/* root flare */}
			<path d="M-170,4 C-120,-10 -90,-40 -70,-70 L110,-70 C130,-40 160,-12 210,4 Z" fill="url(#barkG)" opacity={fillO} />
			{/* west trunk: alive (bark) → dead (silver) */}
			<g opacity={fillO}>
				<path d={ribbon(WEST_C, westW, westW)} fill={west > 0.5 ? 'url(#deadG)' : 'url(#barkG)'} stroke={west > 0.5 ? '#5E574E' : C.barkSh} strokeWidth={3.5} />
				{west > 0.5 && Array.from({length: 5}, (_, i) => <path key={'ck' + i} d={line(offsetLine(WEST_C, (u) => -34 + i * 16 + 10 * Math.sin(u * 12 + i * 1.3)).slice(2 + i * 2, 42 - i))} stroke={i % 2 ? '#6E675C' : '#E2DCD0'} strokeWidth={i % 2 ? 3 : 2} fill="none" opacity={i % 2 ? 0.7 : 0.45} />)}
				{west > 0 && west < 1 && <path d={ribbon(WEST_C, westW, westW)} fill="url(#deadG)" opacity={west} />}
				{WEST_BR.map((b, i) => <path key={i} d={ribbon(b, (u) => lerp(16, 4, u), (u) => lerp(16, 4, u))} fill={west > 0.5 ? C.dead : C.bark} />)}
				{/* broken top */}
				{west > 0 && <path d="M-196,-468 L-186,-492 L-174,-476 L-162,-500 L-148,-470 L-140,-452 Z" fill={C.deadSh} opacity={west} />}
				{/* charred hollow + scorch */}
				<path d="M-70,-70 C-92,-100 -98,-150 -94,-200 C-90,-232 -80,-244 -74,-226 C-70,-190 -62,-150 -50,-120 C-44,-100 -54,-80 -70,-70 Z" fill={C.char} opacity={0.9 * west} />
				<path d="M-94,-200 C-90,-232 -80,-244 -74,-226" stroke="#4A433B" strokeWidth={5} fill="none" opacity={0.8 * west} />
				{Array.from({length: 6}, (_, i) => <path key={i} d={line(offsetLine(WEST_C, (u) => -20 + i * 8 + 6 * Math.sin(u * 8 + i)).slice(4 + i, 30))} stroke={west > 0.5 ? '#9C978E' : C.barkSh} strokeWidth={3} fill="none" opacity={0.55} />)}
			</g>
			{/* east trunk: living, twisted */}
			<g opacity={fillO}>
				<path d={ribbon(EAST_C, eastWl, eastWr)} fill="url(#barkG)" stroke={C.barkSh} strokeWidth={3} />
				{Array.from({length: 7}, (_, i) => <path key={i} d={line(offsetLine(EAST_C, (u) => -52 + i * 16 + 14 * Math.sin(u * 10 + i * 0.9)))} stroke={i % 2 ? C.barkSh : C.barkLit} strokeWidth={i % 2 ? 4 : 2.5} fill="none" opacity={0.5} />)}
				<path d="M20,-120 C10,-170 12,-210 30,-240 C40,-200 40,-160 34,-120 Z" fill={C.char} opacity={0.6} />
				{BRANCHES.map((b, i) => <path key={i} d={ribbon(b, (u) => lerp(18, 5, u), (u) => lerp(18, 5, u))} fill={C.bark} />)}
			</g>
			{/* the strip of living bark (sap) */}
			{sap > 0 && <g>
				<path d={line(STRIP_C)} stroke={C.glowCore} strokeWidth={46} fill="none" opacity={0.25 * sap} filter="url(#k6)" />
				<path d={line(STRIP_C)} stroke="#F3D27A" strokeWidth={30} fill="none" opacity={(0.55 + 0.15 * Math.sin(t * 4)) * sap} strokeLinecap="round" />
				<path d={line(STRIP_C)} stroke={C.glowCore} strokeWidth={6} fill="none" opacity={0.9 * sap} />
				{Array.from({length: 7}, (_, i) => { const u = ((t * 0.32 + i / 7) % 1), p = STRIP_C[Math.floor(u * (STRIP_C.length - 1))]; return <circle key={i} cx={p[0]} cy={p[1]} r={7} fill={C.glowCore} opacity={sap * Math.sin(u * Math.PI)} />; })}
			</g>}
			{/* west crown (only while the west trunk is alive) */}
			{west < 1 && <g opacity={1 - west}>{WPADS.map((p, i) => <PadG key={i} p={p} leaf={leaf} leafM={leafM} leafL={leafL} hi={C.leafHi} dx={sway(i)} glow={glow * 0.6} snow={snow} night={night} fillO={fillO} />)}</g>}
			{/* bloom: the crown's warm light, behind the pads */}
			{glow > 0 && <g filter="url(#k14)" opacity={0.75 * Math.min(1, glow)}>{PADS.map((p, i) => <path key={i} d={padTop(p, 1.12, -6)} fill={C.glow} />)}</g>}
			{/* main crown: pads back to front */}
			{PADS.map((p, i) => <PadG key={i} p={p} leaf={leaf} leafM={leafM} leafL={leafL} hi={C.leafHi} dx={sway(i)} glow={glow} snow={snow} night={night} fillO={fillO} />)}
			{/* legend: dashed outline */}
			{legend > 0 && <g fill="none" stroke={C.glowCore} strokeWidth={4} strokeDasharray={dash} opacity={legend}>
				<path d={ribbon(EAST_C, eastWl, eastWr)} /><path d={ribbon(WEST_C, westW, westW)} />
				{PADS.filter((_, i) => i % 2 === 0).map((p, i) => <path key={i} d={padTop(p)} />)}
			</g>}
			{/* fire on the west trunk */}
			{burn > 0 && <g opacity={burn}>
				<Glow x={-110} y={-260} r={460} c={C.fire} o={0.55} id={`${id}fire`} />
				{/* one flame body wrapping the west trunk: an outer orange envelope with tongues, an inner yellow core */}
				{[[1, '#E8642A', 0.92, 46], [0.72, C.fire, 0.95, 30], [0.42, C.fireCore, 0.95, 16]].map(([k, col, op, extra], j) => {
					const K = k as number, E = extra as number, n = WEST_C.length, L: P[] = [], Rr: P[] = [];
					for (let i = 0; i < n; i += 2) { const u = i / (n - 1), p = WEST_C[i], w = (westW(u) + E) * K * (1 + 0.12 * Math.sin(t * 9 + i * 0.7 + j));
						L.push([p[0] - w, p[1] + 10]); Rr.push([p[0] + w * 0.8, p[1] + 10]); }
					const top = WEST_C[n - 1], tongues = Array.from({length: 5}, (_, q) => { const ph = t * (7 + q) + q * 1.3, hx = top[0] - 50 * K + q * 25 * K + Math.sin(ph) * 10, hy = top[1] - (90 + 70 * Math.abs(Math.sin(ph * 0.7))) * K; return `${hx.toFixed(1)},${hy.toFixed(1)} ${(hx + 12 * K).toFixed(1)},${(top[1] - 20 * K).toFixed(1)}`; }).join(' L');
					const d = 'M' + L.map((q) => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' L') + ' L' + tongues + ' L' + Rr.reverse().map((q) => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' L') + ' Z';
					return <path key={j} d={d} fill={col as string} opacity={op as number} filter="url(#k3)" strokeLinejoin="round" />; })}
				{Array.from({length: 14}, (_, i) => { const kk = (t * 0.6 + rnd(i, 35)) % 1; return <circle key={'e' + i} cx={-120 + (rnd(i, 36) - 0.5) * 200 + Math.sin(kk * 6 + i) * 20} cy={-200 - kk * 520} r={3} fill={C.fireCore} opacity={(1 - kk)} />; })}
				{Array.from({length: 6}, (_, i) => { const kk = (t * 0.4 + i / 6) % 1; return <ellipse key={'s' + i} cx={-130 + kk * 120} cy={-480 - kk * 420} rx={50 + 90 * kk} ry={36 + 50 * kk} fill="#4E4640" opacity={(1 - kk) * 0.5} filter="url(#k6)" />; })}
			</g>}
		</g>}
	</g>;
};
/** world position of a point given in tree units (for labels: the strip, the crown top) */
export const treeAt = (x: number, g: number, s: number, age: number, p: P): P => { const k = lerp(0.32, 1, ease(age)); return [x + p[0] * s * k, g + p[1] * s * k]; };
export const STRIP_MID: P = STRIP_C[Math.floor(STRIP_C.length * 0.35)];
export const CROWN_TOP: P = [60, -740];
export const WEST_MID: P = WEST_C[Math.floor(WEST_C.length * 0.5)];
void clamp;
