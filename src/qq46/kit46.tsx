import React from 'react';
import {W, H, rnd, lerp, Glow} from '../qq42/kit42';
/* ep46 《汉柏的孩子，去守汉武帝》 — look "岱庙 · 同一个机位" (one camera position for 2,100 years).
   A warm, coloured flat-gouache world lit from the upper left: vermilion temple wall with yellow-glazed coping,
   grey steles on turtle bases, 泰山 rising in blue layers behind. The camera stays at the tree; the sky, the season,
   the buildings and the people change behind it. 「你」 (the cypress) is the only thing that glows (warm gold-green).
   NOT: ep45's engraved slate plate, ep41–44's dark dusk silhouettes, the reference's red chips / seal furniture. */
export {W, H, rnd, lerp, Glow};
export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const ease = (u: number) => { const v = clamp(u); return v * v * (3 - 2 * v); };
export const easeOut = (u: number) => 1 - Math.pow(1 - clamp(u), 3);
export const easeIn = (u: number) => Math.pow(clamp(u), 3);
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const mixC = (c1: string, c2: string, u: number) => {
	const p = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
	const a = p(c1), b = p(c2), v = clamp(u);
	return '#' + a.map((x, i) => Math.round(lerp(x, b[i], v)).toString(16).padStart(2, '0')).join('');
};

/* ---------- palette ---------- */
export const C = {
	wall: '#B4473A', wallSh: '#8C3329', wallLit: '#C9604F', cope: '#E0A73C', copeSh: '#A9741F', copeLit: '#F2C766',
	roof: '#D9A23A', roofSh: '#9E6E1E', roofLit: '#F0C462', ridge: '#7A4E18', eave: '#5B3A1A', col: '#9E3B2E', base: '#CFC5B3',
	pave: '#CDBFA3', pave2: '#A99A7D', paveLine: '#8E8068',
	stele: '#B7B1A4', steleSh: '#8B8579', steleLit: '#D3CEC2', steleInk: '#5F5A50',
	bark: '#76604E', barkSh: '#4D3E33', barkLit: '#A08673', dead: '#BDB8AE', deadSh: '#8E8A82', char: '#2A2522',
	leaf: '#2E5A3C', leafM: '#447A4C', leafL: '#78A65E', leafHi: '#B5D27E',
	nbLeaf: '#4A655B', nbLeafM: '#5E7B6E', nbLeafL: '#7C978A',   // neighbour cypresses: cooler, never glowing
	greyLeaf: '#8C877C', greyLeafM: '#A29C90',
	glow: '#F6E7A0', glowCore: '#FFF6CF', glowDeep: '#D9C35E',
	fig: '#2B2732', figRim: '#F3DDB4',
	ink: '#2B2620', paper: '#EFE6D2', paperSh: '#D6C9AE', silk: '#E8DCC0',
	jade: '#8FC7A6', jadeD: '#4F8A6B', fire: '#FF9A3C', fireCore: '#FFE08A', smoke: '#8E847B',
	earth: '#B49A72', earthSh: '#8C7552', grass: '#8FA36E', grassD: '#6D8455',
};
/** sky presets: [top, bottom] */
export const SKY: Record<string, [string, string]> = {
	dawn: ['#7486AE', '#F3C99A'], day: ['#86B2D3', '#EEDDBD'], noon: ['#7FB0D8', '#E4E6D6'], dusk: ['#4F5E8A', '#EAA57B'],
	night: ['#16213A', '#34456A'], snow: ['#A9B6C4', '#ECEFF0'], smoke: ['#6F665E', '#C7AE8E'], han: ['#9AB4C8', '#F0D9AE'],
	blossom: ['#9DB8D6', '#F4E2D6'], autumn: ['#8EA7C2', '#F0CF9C'], gold: ['#6E7FA8', '#F7D9A0'],
};
export const skyMix = (a: string, b: string, u: number): [string, string] => [mixC(SKY[a][0], SKY[b][0], u), mixC(SKY[a][1], SKY[b][1], u)];

/* ---------- shared defs (once per svg) ---------- */
export const Defs46: React.FC = () => <defs>
	<filter id="k6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={6} /></filter>
	<filter id="k14" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={14} /></filter>
	<filter id="k30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={30} /></filter>
	<filter id="k3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={2.5} /></filter>
	<filter id="paper46" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves={3} seed={5} /><feColorMatrix values="0 0 0 0 0.42  0 0 0 0 0.36  0 0 0 0 0.28  0 0 0 0.55 0" /></filter>
	<linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.wallLit} /><stop offset="0.25" stopColor={C.wall} /><stop offset="1" stopColor={C.wallSh} /></linearGradient>
	<linearGradient id="copeG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.copeLit} /><stop offset="1" stopColor={C.copeSh} /></linearGradient>
	<linearGradient id="roofG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.roofLit} /><stop offset="0.6" stopColor={C.roof} /><stop offset="1" stopColor={C.roofSh} /></linearGradient>
	<linearGradient id="paveG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D8CCB2" /><stop offset="1" stopColor="#A89878" /></linearGradient>
	<linearGradient id="earthG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C9B289" /><stop offset="1" stopColor="#957C57" /></linearGradient>
	<linearGradient id="steleG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={C.steleLit} /><stop offset="0.55" stopColor={C.stele} /><stop offset="1" stopColor={C.steleSh} /></linearGradient>
	<linearGradient id="barkG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={C.barkLit} /><stop offset="0.45" stopColor={C.bark} /><stop offset="1" stopColor={C.barkSh} /></linearGradient>
	<linearGradient id="deadG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#CFC6B8" /><stop offset="0.45" stopColor="#ABA294" /><stop offset="1" stopColor="#7C746A" /></linearGradient>
	<linearGradient id="paperG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F5EEDD" /><stop offset="1" stopColor={C.paperSh} /></linearGradient>
	<linearGradient id="hazeG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F2E6CF" stopOpacity="0" /><stop offset="1" stopColor="#F2E6CF" stopOpacity="0.6" /></linearGradient>
</defs>;

/** soft contact shadow */
export const Shadow: React.FC<{x: number; y: number; rx: number; ry: number; o?: number}> = ({x, y, rx, ry, o = 0.32}) => <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#2A2218" opacity={o} filter="url(#k14)" />;

/* ---------- sky: gradient, soft clouds, optional stars / sun ---------- */
export const Sky46: React.FC<{id: string; c: [string, string]; y0?: number; y1?: number; clouds?: number; drift?: number; seed?: number; stars?: number; sun?: [number, number, number]}> = ({id, c, y0 = -2400, y1 = H, clouds = 5, drift = 0, seed = 1, stars = 0, sun}) => <g>
	<defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse" gradientTransform={`translate(0,${y0})`}><stop offset="0" stopColor={c[0]} /><stop offset={(-y0 + 200) / (y1 - y0 + 800)} stopColor={c[0]} /><stop offset="1" stopColor={c[1]} /></linearGradient>
		<linearGradient id={id + 'v'} x1="0" y1={y0} x2="0" y2={y1} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor={c[0]} /><stop offset="0.62" stopColor={c[0]} /><stop offset="1" stopColor={c[1]} /></linearGradient></defs>
	<rect x={-1400} y={y0} width={W + 2800} height={y1 - y0 + 600} fill={`url(#${id}v)`} />
	{stars > 0 && Array.from({length: 120}, (_, i) => <circle key={i} cx={-400 + rnd(i, 21) * (W + 800)} cy={y0 + rnd(i, 22) * (H * 0.75 - y0)} r={0.8 + 1.6 * rnd(i, 23)} fill="#FFF8E6" opacity={stars * (0.3 + 0.7 * rnd(i, 24))} />)}
	{sun && <Glow x={sun[0]} y={sun[1]} r={sun[2]} c="#FFF1C8" o={0.55} id={id + 'sun'} />}
	{Array.from({length: clouds}, (_, i) => { const cx = ((-300 + rnd(i, seed) * 2600 + drift * (20 + 30 * rnd(i, seed + 5))) % 2600) - 300, cy = 70 + rnd(i, seed + 1) * 300, w = 240 + 260 * rnd(i, seed + 2);
		return <g key={i} opacity={0.5} filter="url(#k6)">{Array.from({length: 5}, (_, j) => <ellipse key={j} cx={cx + (j - 2) * w * 0.22} cy={cy - Math.sin(j / 4 * Math.PI) * 24} rx={w * 0.22} ry={26 + 14 * Math.sin(j / 4 * Math.PI)} fill="#FBF6EA" />)}</g>; })}
</g>;

/* ---------- 泰山: three blue layers, the climbing path (十八盘) and the summit gate ---------- */
export const PATH: [number, number][] = [[1010, 640], [960, 560], [1040, 470], [930, 380], [990, 280], [880, 170], [930, 60], [840, -60], [880, -170], [800, -280], [820, -360]];
export const pathAt = (u: number): [number, number] => { const n = PATH.length - 1, x = clamp(u) * n, i = Math.min(n - 1, Math.floor(x)), f = x - i; return [lerp(PATH[i][0], PATH[i + 1][0], f), lerp(PATH[i][1], PATH[i + 1][1], f)]; };
export const SUMMIT: [number, number] = [820, -380];
export const Mountain46: React.FC<{id: string; tint?: number; snow?: number; night?: number; path?: number}> = ({id, tint = 0, snow = 0, night = 0, path = 1}) => {
	const far = mixC(mixC('#A9B9C7', '#C9B39A', tint), '#2A3550', night), mid = mixC(mixC('#8399AB', '#A88F78', tint), '#222C45', night), near = mixC(mixC('#6E8597', '#8C7663', tint), '#1B2339', night);
	const hill = mixC(mixC('#6F8670', '#7E7360', tint), '#1A2433', night);
	return <g>
		<path d="M-600,660 L-300,420 L-60,300 L180,120 L420,-60 L620,-260 L760,-360 L820,-410 L880,-370 L1040,-230 L1260,-40 L1520,140 L1800,300 L2100,420 L2500,600 L2500,700 L-600,700 Z" fill={far} />
		{snow > 0 && <path d="M700,-310 L760,-360 L820,-410 L880,-370 L960,-300 L900,-290 L850,-320 L800,-300 L760,-280 Z" fill="#F4F6F6" opacity={snow} />}
		<path d="M-600,700 L-200,520 L120,360 L380,220 L560,110 L700,0 L760,-60 L860,40 L1060,160 L1300,300 L1600,420 L1900,500 L2500,640 L2500,720 L-600,720 Z" fill={mid} />
		{/* cliff shading on the lit-left / shade-right faces */}
		<path d="M820,-410 L880,-370 L1040,-230 L1260,-40 L1100,-60 L960,-200 Z" fill="#000" opacity={0.08} />
		<path d="M760,-60 L860,40 L1060,160 L940,150 L820,40 Z" fill="#000" opacity={0.08} />
		{/* rock bands and ridges on the massif, pines on the mid slopes */}
		{Array.from({length: 9}, (_, i) => { const y = -300 + i * 95, half = 160 + i * 150; return <path key={'rb' + i} d={`M${820 - half * 0.7},${y + 30} Q${820 - half * 0.3},${y - 14} ${820 + half * 0.1},${y + 18} T${820 + half * 0.8},${y + 6}`} stroke={mixC(far, '#ffffff', 0.18)} strokeWidth={3} fill="none" opacity={0.35} />; })}
		{Array.from({length: 7}, (_, i) => <path key={'rd' + i} d={`M${700 + i * 40},${-200 + i * 60} L${560 + i * 70},${120 + i * 70}`} stroke="#000" strokeWidth={2} opacity={0.06} />)}
		{Array.from({length: 60}, (_, i) => { const u = rnd(i, 71), x = 300 + rnd(i, 72) * 1300, y = 120 + u * 450; const top = 820 - Math.abs(x - 800) * 0.75; if (y < -380 + Math.abs(x - 820) * 0.7) return null;
			return <path key={'pn' + i} d={`M${x},${y} l-9,18 l18,0 Z M${x},${y + 8} l-12,20 l24,0 Z`} fill={mixC(mid, '#203028', 0.45)} opacity={0.55} />; })}
		{/* the climbing path */}
		{path > 0 && <polyline points={PATH.map((p) => p.join(',')).join(' ')} fill="none" stroke={mixC('#E9DCC2', '#4A5470', night)} strokeWidth={2.5} strokeDasharray="5 5" opacity={0.6 * path} strokeLinejoin="round" />}
		{/* 南天门: the summit gate */}
		<g transform={`translate(${SUMMIT[0]},${SUMMIT[1]})`} opacity={0.95}>
			<rect x={-34} y={-10} width={68} height={30} fill={mixC('#B4473A', '#3A2A33', night)} /><rect x={-10} y={0} width={20} height={20} fill={mixC('#4A3428', '#140F14', night)} />
			<path d="M-46,-10 L46,-10 L36,-30 L-36,-30 Z" fill={mixC(C.roof, '#5A4A2A', night)} /><rect x={-24} y={-44} width={48} height={14} fill={mixC('#B4473A', '#3A2A33', night)} /><path d="M-34,-44 L34,-44 L26,-58 L-26,-58 Z" fill={mixC(C.roof, '#5A4A2A', night)} />
		</g>
		<path d="M-600,720 L-200,640 L200,610 L520,560 L760,600 L1000,580 L1300,600 L1700,560 L2100,600 L2500,620 L2500,760 L-600,760 Z" fill={near} />
		<path d="M-600,760 L-100,700 L400,690 L800,700 L1200,690 L1700,700 L2500,690 L2500,800 L-600,800 Z" fill={hill} />
		<rect x={-1400} y={560} width={W + 2800} height={240} fill="url(#hazeG)" opacity={0.7 * (1 - night)} />
	</g>;
};
/** torches climbing the path (a procession seen from far below); u = how far the head of the line has climbed */
export const Torches: React.FC<{u: number; n?: number; spread?: number; o?: number; seed?: number}> = ({u, n = 14, spread = 0.18, o = 1, seed = 0}) => <g opacity={o}>
	{Array.from({length: n}, (_, i) => { const v = u - (i / n) * spread; if (v < 0 || v > 1) return null; const [x, y] = pathAt(v), fl = 0.8 + 0.2 * Math.sin(i * 3 + u * 90 + seed);
		return <g key={i}><circle cx={x + (rnd(i, seed) - 0.5) * 10} cy={y - 4} r={9 * fl} fill={C.fire} opacity={0.35} filter="url(#k3)" /><circle cx={x + (rnd(i, seed) - 0.5) * 10} cy={y - 4} r={3.2 * fl} fill={C.fireCore} /></g>; })}
</g>;
/** summit altar with rising smoke (the 封 rite on the top) */
export const Altar: React.FC<{o?: number; t: number}> = ({o = 1, t}) => <g opacity={o} transform={`translate(${SUMMIT[0] + 70},${SUMMIT[1] + 30})`}>
	<rect x={-40} y={-16} width={80} height={16} fill="#C9BFA9" /><rect x={-28} y={-30} width={56} height={14} fill="#D8CFBB" /><rect x={-16} y={-42} width={32} height={12} fill="#E4DCCA" />
	{Array.from({length: 8}, (_, i) => { const k = ((t * 0.5 + i / 8) % 1); return <ellipse key={i} cx={Math.sin(k * 6 + i) * 10 + k * 30} cy={-50 - k * 220} rx={10 + k * 40} ry={8 + k * 26} fill="#EDE6DA" opacity={(1 - k) * 0.55} filter="url(#k6)" />; })}
</g>;

/* ---------- the temple: back wall, coping, halls behind ---------- */
export const WALL_TOP = 600, WALL_BASE = 760;
export const Wall46: React.FC<{x0?: number; x1?: number; top?: number; base?: number; gate?: number}> = ({x0 = -600, x1 = 2500, top = WALL_TOP, base = WALL_BASE, gate}) => <g>
	<rect x={x0} y={top} width={x1 - x0} height={base - top} fill="url(#wallG)" />
	{/* coping: glazed tiles */}
	<path d={`M${x0},${top} L${x1},${top} L${x1},${top - 16} L${x0},${top - 16} Z`} fill={C.copeSh} />
	<path d={`M${x0},${top - 14} L${x1},${top - 14} L${x1},${top - 30} L${x0},${top - 30} Z`} fill="url(#copeG)" />
	{Array.from({length: Math.round((x1 - x0) / 22)}, (_, i) => <line key={i} x1={x0 + i * 22} y1={top - 30} x2={x0 + i * 22} y2={top - 2} stroke={C.copeSh} strokeWidth={2} opacity={0.6} />)}
	<path d={`M${x0},${top - 30} L${x1},${top - 30} L${x1},${top - 38} L${x0},${top - 38} Z`} fill={C.ridge} />
	{/* plinth + weathering */}
	<rect x={x0} y={base - 26} width={x1 - x0} height={26} fill="#9C8E7A" /><rect x={x0} y={base - 26} width={x1 - x0} height={4} fill="#B8AB96" />
	<rect x={x0} y={top} width={x1 - x0} height={18} fill="#000" opacity={0.12} />
	{gate !== undefined && <g transform={`translate(${gate},0)`}>
		<rect x={-80} y={top - 70} width={160} height={base - top + 70} fill={C.wall} />
		<path d={`M${-120},${top - 70} L120,${top - 70} L96,${top - 116} L-96,${top - 116} Z`} fill="url(#roofG)" />
		<path d={`M-54,${base - 26} L-54,${top + 40} A54,54 0 0 1 54,${top + 40} L54,${base - 26} Z`} fill="#3A2A24" />
	</g>}
</g>;
/** a hall roof behind the wall (double eaves, yellow glaze). k = how much of it stands (0..1, rises from behind the wall) */
export const Hall46: React.FC<{cx: number; base?: number; w?: number; k?: number; double?: boolean; night?: number}> = ({cx, base = WALL_TOP - 30, w = 900, k = 1, double = true, night = 0}) => {
	if (k <= 0) return null;
	const rise = (1 - easeOut(k)) * 260, b = base + rise, h1 = 120, colH = 70, h2 = 110, hw = w / 2;
	const roof = mixC(C.roof, '#4A3E2A', night), roofSh = mixC(C.roofSh, '#2A2218', night), red = mixC(C.col, '#2C1E22', night);
	return <g>
		<clipPath id={`hallclip${cx}`}><rect x={cx - hw - 200} y={-400} width={w + 400} height={WALL_TOP - 30 + 400} /></clipPath>
		<g clipPath={`url(#hallclip${cx})`}>
			{/* lower eave */}
			<path d={`M${cx - hw - 60},${b} Q${cx - hw + 40},${b - 10} ${cx - hw + 90},${b - h1 * 0.55} L${cx + hw - 90},${b - h1 * 0.55} Q${cx + hw - 40},${b - 10} ${cx + hw + 60},${b} Z`} fill={roof} />
			<path d={`M${cx - hw - 60},${b} L${cx + hw + 60},${b} L${cx + hw + 40},${b + 10} L${cx - hw - 40},${b + 10} Z`} fill={roofSh} />
			<rect x={cx - hw + 110} y={b - h1 * 0.55 - colH} width={w - 220} height={colH} fill={red} />
			{Array.from({length: 9}, (_, i) => <rect key={i} x={cx - hw + 120 + i * (w - 240) / 8} y={b - h1 * 0.55 - colH} width={10} height={colH} fill={roofSh} opacity={0.5} />)}
			{double && <>
				<path d={`M${cx - hw + 40},${b - h1 * 0.55 - colH} Q${cx - hw + 130},${b - h1 * 0.55 - colH - 10} ${cx - hw + 180},${b - h1 * 0.55 - colH - h2} L${cx + hw - 180},${b - h1 * 0.55 - colH - h2} Q${cx + hw - 130},${b - h1 * 0.55 - colH - 10} ${cx + hw - 40},${b - h1 * 0.55 - colH} Z`} fill={roof} />
				<rect x={cx - hw + 170} y={b - h1 * 0.55 - colH - h2 - 14} width={w - 340} height={16} fill={mixC(C.ridge, '#1A1410', night)} />
				<path d={`M${cx - hw + 160},${b - h1 * 0.55 - colH - h2 - 14} q-14,-26 -4,-40 q6,18 20,26 Z M${cx + hw - 160},${b - h1 * 0.55 - colH - h2 - 14} q14,-26 4,-40 q-6,18 -20,26 Z`} fill={mixC(C.ridge, '#1A1410', night)} />
				{Array.from({length: 26}, (_, i) => { const x = cx - hw + 190 + i * (w - 380) / 25; return <line key={i} x1={x} y1={b - h1 * 0.55 - colH - h2 + 4} x2={x - (x - cx) * 0.18} y2={b - h1 * 0.55 - colH - 6} stroke={roofSh} strokeWidth={2.4} opacity={0.5} />; })}
			</>}
			{Array.from({length: 40}, (_, i) => { const x = cx - hw - 30 + i * (w + 60) / 39; return <line key={i} x1={x} y1={b - h1 * 0.5} x2={x - (x - cx) * 0.06} y2={b - 2} stroke={roofSh} strokeWidth={2} opacity={0.45} />; })}
		</g>
	</g>;
};
/** courtyard pavement (stone slabs in perspective) from the wall base to the frame bottom */
export const Pave46: React.FC<{y?: number; earth?: number; snow?: number; night?: number}> = ({y = WALL_BASE, earth = 0, snow = 0, night = 0}) => <g>
	<rect x={-1400} y={y} width={W + 2800} height={H - y + 1400} fill="url(#paveG)" />
	{earth > 0 && <rect x={-1400} y={y} width={W + 2800} height={H - y + 1400} fill="url(#earthG)" opacity={earth} />}
	<g opacity={0.55 * (1 - earth)}>
		{Array.from({length: 12}, (_, i) => { const yy = y + 6 + Math.pow(i / 11, 1.5) * (H - y + 300); return <line key={i} x1={-1400} y1={yy} x2={W + 1400} y2={yy} stroke={C.paveLine} strokeWidth={1.4} />; })}
		{Array.from({length: 40}, (_, i) => <line key={'v' + i} x1={960 + (i - 20) * 70} y1={y} x2={960 + (i - 20) * 260} y2={H + 300} stroke={C.paveLine} strokeWidth={1.2} />)}
	</g>
	{snow > 0 && <rect x={-1400} y={y} width={W + 2800} height={H - y + 1400} fill="#F4F6F6" opacity={0.85 * snow} />}
	{night > 0 && <rect x={-1400} y={y} width={W + 2800} height={H - y + 1400} fill="#0E1426" opacity={0.62 * night} />}
</g>;

/* ---------- a stele on a turtle base (赑屃); optional carved tree picture or a poem column ---------- */
export const Stele46: React.FC<{x: number; g: number; s?: number; carve?: 'tree' | 'text' | 'none'; glowText?: number; k?: number; night?: number}> = ({x, g, s = 1, carve = 'text', glowText = 0, k = 1, night = 0}) => {
	if (k <= 0) return null;
	const rise = (1 - easeOut(k)) * 1, w = 120 * s, h = 300 * s, top = g - 70 * s - h;
	return <g opacity={clamp(k * 3)} transform={`translate(0,${rise * 40 * s})`}>
		<Shadow x={x + 30 * s} y={g + 2} rx={110 * s} ry={14 * s} o={0.3} />
		{/* turtle */}
		<path d={`M${x - 100 * s},${g} Q${x - 100 * s},${g - 70 * s} ${x},${g - 76 * s} Q${x + 100 * s},${g - 70 * s} ${x + 100 * s},${g} Z`} fill={mixC(C.stele, '#2A2D3A', night)} />
		<path d={`M${x - 100 * s},${g} Q${x - 128 * s},${g - 22 * s} ${x - 124 * s},${g - 40 * s} Q${x - 110 * s},${g - 44 * s} ${x - 96 * s},${g - 26 * s} Z`} fill={mixC(C.steleSh, '#1E212C', night)} />
		<path d={`M${x - 70 * s},${g - 52 * s} Q${x},${g - 66 * s} ${x + 70 * s},${g - 52 * s}`} stroke={C.steleSh} strokeWidth={3 * s} fill="none" opacity={0.6} />
		{/* the tablet */}
		<rect x={x - w / 2} y={top} width={w} height={h} fill="url(#steleG)" />
		<path d={`M${x - w / 2 - 6 * s},${top + 4 * s} Q${x - w / 2},${top - 70 * s} ${x},${top - 74 * s} Q${x + w / 2},${top - 70 * s} ${x + w / 2 + 6 * s},${top + 4 * s} Z`} fill="url(#steleG)" />
		<path d={`M${x - 34 * s},${top - 44 * s} q16,-14 34,0 q18,-14 34,0`} stroke={C.steleSh} strokeWidth={3 * s} fill="none" opacity={0.5} />
		<rect x={x + w / 2 - 14 * s} y={top} width={14 * s} height={h} fill="#000" opacity={0.12} />
		{carve === 'text' && Array.from({length: 4}, (_, c) => <line key={c} x1={x - 36 * s + c * 24 * s} y1={top + 24 * s} x2={x - 36 * s + c * 24 * s} y2={top + h * (0.7 + 0.25 * rnd(c, x))} stroke={C.steleInk} strokeWidth={7 * s} strokeDasharray={`${10 * s} ${5 * s}`} opacity={0.32} />)}
		{carve === 'tree' && <g transform={`translate(${x},${top + h * 0.9}) scale(${s * 0.16})`} opacity={0.9}><InkTree stroke={C.steleInk} fill="none" /></g>}
		{glowText > 0 && <g opacity={glowText}><VText x={x + 38 * s} y={top + 18 * s} s="名實賓主誰是乎" size={30 * s} fill={C.glowCore} gap={1.15} /></g>}
		{night > 0 && <rect x={x - w / 2 - 10} y={top - 80 * s} width={w + 20} height={h + 80 * s} fill="#0E1426" opacity={0.5 * night} />}
	</g>;
};
/** an ink drawing of our tree (Qianlong's painting / the carving): origin at the base, ~1000 units tall */
export const InkTree: React.FC<{stroke?: string; fill?: string; u?: number}> = ({stroke = C.ink, fill = 'none', u = 1}) => {
	const P = [
		'M-60,0 C-70,-160 -40,-300 -90,-420 C-120,-500 -170,-560 -160,-640',
		'M40,0 C60,-140 30,-260 70,-380 C110,-480 60,-560 90,-660 C110,-740 60,-820 20,-900',
		'M-10,0 C-6,-120 -20,-220 0,-320',
		'M70,-380 C140,-420 200,-460 260,-520', 'M60,-520 C-20,-580 -80,-620 -120,-700', 'M90,-660 C170,-700 220,-760 240,-840',
	];
	const blobs = [[-160, -660, 90], [-110, -760, 80], [20, -920, 110], [120, -820, 100], [240, -860, 90], [270, -560, 100], [-30, -660, 90], [150, -680, 90]];
	const L = P.length + blobs.length, shown = Math.floor(u * L);
	return <g fill={fill} stroke={stroke} strokeLinecap="round" strokeLinejoin="round">
		{P.map((d, i) => i < shown && <path key={i} d={d} strokeWidth={i < 2 ? 22 : 12} fill="none" />)}
		{blobs.map(([x, y, r], i) => P.length + i < shown && <g key={'b' + i}>{Array.from({length: 7}, (_, j) => <path key={j} d={`M${x - r + j * r * 0.3},${y + 20 - (j % 2) * 30} q${r * 0.2},-${r * 0.5} ${r * 0.45},0`} strokeWidth={9} fill="none" />)}</g>)}
	</g>;
};

/* ---------- other trees (never glowing) ---------- */
/** a neighbour cypress: tall irregular crown on a straight trunk; grey = dying (0..1) */
export const Cypress46: React.FC<{x: number; g: number; h: number; seed?: number; grey?: number; night?: number; bare?: number}> = ({x, g, h, seed = 1, grey = 0, night = 0, bare = 0}) => {
	const d = mixC(mixC(C.nbLeaf, C.greyLeaf, grey), '#151B26', night), m = mixC(mixC(C.nbLeafM, C.greyLeafM, grey), '#1C2330', night), l = mixC(mixC(C.nbLeafL, '#BAB3A6', grey), '#262E3C', night);
	const clumps = Array.from({length: 14}, (_, i) => { const v = rnd(i, seed), a = (rnd(i, seed + 1) - 0.5) * 2; return {x: x + a * h * 0.16 * (1 - v * 0.5), y: g - h * (0.35 + 0.6 * v), r: h * (0.07 + 0.05 * rnd(i, seed + 2)) * (1 - v * 0.35)}; });
	return <g>
		<Shadow x={x + h * 0.06} y={g + 3} rx={h * 0.18} ry={h * 0.03} o={0.28} />
		<path d={`M${x - h * 0.03},${g} C${x - h * 0.02},${g - h * 0.4} ${x - h * 0.015},${g - h * 0.6} ${x},${g - h * 0.9} C${x + h * 0.015},${g - h * 0.6} ${x + h * 0.02},${g - h * 0.4} ${x + h * 0.035},${g} Z`} fill={mixC('#6B5545', '#141820', night)} />
		<g opacity={1 - bare * 0.85}>
			{clumps.map((c, i) => <ellipse key={'d' + i} cx={c.x + 5} cy={c.y + 8} rx={c.r * 1.25} ry={c.r * 0.5} fill={d} />)}
			{clumps.map((c, i) => <ellipse key={'m' + i} cx={c.x} cy={c.y} rx={c.r * 1.15} ry={c.r * 0.44} fill={m} />)}
			{clumps.map((c, i) => i % 2 === 0 && <ellipse key={'l' + i} cx={c.x - c.r * 0.35} cy={c.y - c.r * 0.16} rx={c.r * 0.6} ry={c.r * 0.22} fill={l} opacity={0.85} />)}
		</g>
		{bare > 0 && [[-0.12, 0.55], [0.1, 0.62], [-0.08, 0.75], [0.07, 0.8]].map(([dx, dy], i) => <path key={i} d={`M${x},${g - h * dy} L${x + dx * h},${g - h * (dy + 0.08)}`} stroke={mixC('#7A6A5C', '#141820', night)} strokeWidth={4} opacity={bare} />)}
	</g>;
};
/** the 唐槐 (pagoda tree): round spreading crown; dead = 0..1 */
export const Huai46: React.FC<{x: number; g: number; h: number; dead?: number}> = ({x, g, h, dead = 0}) => {
	const leaf = mixC('#6E9A55', '#9A9285', dead), leafD = mixC('#4E7642', '#7D766A', dead);
	return <g>
		<Shadow x={x + h * 0.1} y={g + 3} rx={h * 0.4} ry={h * 0.05} o={0.3} />
		<path d={`M${x - h * 0.06},${g} C${x - h * 0.05},${g - h * 0.3} ${x - h * 0.12},${g - h * 0.45} ${x - h * 0.25},${g - h * 0.55} L${x - h * 0.2},${g - h * 0.58} C${x - h * 0.08},${g - h * 0.5} ${x},${g - h * 0.46} ${x + h * 0.04},${g - h * 0.6} L${x + h * 0.08},${g - h * 0.58} C${x + h * 0.06},${g - h * 0.4} ${x + h * 0.09},${g - h * 0.2} ${x + h * 0.08},${g} Z`} fill={mixC('#5D4A3A', '#857C70', dead)} />
		<g opacity={1 - dead * 0.8}>{Array.from({length: 12}, (_, i) => { const a = rnd(i, 41) * Math.PI, r = h * (0.12 + 0.06 * rnd(i, 42)); return <ellipse key={i} cx={x + Math.cos(a) * h * 0.32 - h * 0.05} cy={g - h * 0.68 - Math.sin(a) * h * 0.2} rx={r} ry={r * 0.75} fill={i % 3 ? leaf : leafD} />; })}</g>
		{dead > 0.3 && [[-0.3, 0.75], [0.2, 0.8], [0.32, 0.66], [-0.2, 0.86]].map(([dx, dy], i) => <path key={i} d={`M${x},${g - h * 0.58} Q${x + dx * h * 0.5},${g - h * (dy - 0.05)} ${x + dx * h},${g - h * dy}`} stroke="#857C70" strokeWidth={5} fill="none" opacity={dead} />)}
	</g>;
};

/* ---------- 1928: market stalls, cooking fire ---------- */
export const Stall46: React.FC<{x: number; g: number; s?: number; c?: string}> = ({x, g, s = 1, c = '#C9B27E'}) => <g>
	<Shadow x={x} y={g + 2} rx={90 * s} ry={10 * s} o={0.3} />
	<rect x={x - 70 * s} y={g - 70 * s} width={140 * s} height={70 * s} fill="#7A6450" /><rect x={x - 70 * s} y={g - 70 * s} width={140 * s} height={10 * s} fill="#5C4A3A" />
	{[-60, 60].map((dx) => <rect key={dx} x={x + dx * s - 3 * s} y={g - 150 * s} width={6 * s} height={150 * s} fill="#4A3B2E" />)}
	<path d={`M${x - 90 * s},${g - 138 * s} L${x + 90 * s},${g - 138 * s} L${x + 74 * s},${g - 168 * s} L${x - 74 * s},${g - 168 * s} Z`} fill={c} />
	{Array.from({length: 6}, (_, i) => <path key={i} d={`M${x - 90 * s + i * 30 * s},${g - 138 * s} q${15 * s},${12 * s} ${30 * s},0`} fill={c} />)}
	{Array.from({length: 5}, (_, i) => <circle key={i} cx={x - 50 * s + i * 25 * s} cy={g - 78 * s} r={9 * s} fill={['#C7713C', '#D9B04A', '#8C9A55', '#B85A3C', '#D6C38C'][i]} />)}
</g>;
export const Fire46: React.FC<{x: number; g: number; s?: number; t: number; o?: number}> = ({x, g, s = 1, t, o = 1}) => <g opacity={o}>
	<Glow x={x} y={g - 20 * s} r={120 * s} c={C.fire} o={0.35} id={`fg${Math.round(x)}`} />
	{[-1, 1].map((sg) => <line key={sg} x1={x + sg * 40 * s} y1={g} x2={x} y2={g - 90 * s} stroke="#3A2E26" strokeWidth={5 * s} />)}
	<path d={`M${x - 26 * s},${g - 66 * s} L${x + 26 * s},${g - 66 * s} L${x + 22 * s},${g - 34 * s} L${x - 22 * s},${g - 34 * s} Z`} fill="#2E2A28" />
	{Array.from({length: 5}, (_, i) => { const f = Math.sin(t * 13 + i * 2.1) * 0.25 + 1; return <path key={i} d={`M${x - 18 * s + i * 9 * s},${g} q${-6 * s},${-24 * s * f} ${4 * s},${-40 * s * f} q${6 * s},${18 * s * f} ${6 * s},${40 * s * f} Z`} fill={i % 2 ? C.fire : C.fireCore} />; })}
	{Array.from({length: 4}, (_, i) => { const k = (t * 0.35 + i / 4) % 1; return <ellipse key={i} cx={x + k * 160 * s} cy={g - 90 * s - k * 300 * s} rx={(20 + 60 * k) * s} ry={(14 + 34 * k) * s} fill={C.smoke} opacity={(1 - k) * 0.4} filter="url(#k6)" />; })}
</g>;
/** a wide bank of drifting smoke across the frame */
export const SmokeBank: React.FC<{o: number; t: number; y?: number}> = ({o, t, y = 520}) => o <= 0 ? null : <g opacity={o} filter="url(#k30)">
	{Array.from({length: 9}, (_, i) => <ellipse key={i} cx={((i * 320 + t * 40) % 2600) - 340} cy={y + Math.sin(i * 1.7) * 120} rx={260} ry={110} fill={i % 2 ? '#857A70' : '#9A8F82'} />)}
</g>;

/* ---------- 2024: road, truck with six potted saplings, the 茂陵 mound ---------- */
export const Pot46: React.FC<{x: number; g: number; s?: number; glow?: number; id: string; grow?: number}> = ({x, g, s = 1, glow = 0, id, grow = 1}) => <g>
	{glow > 0 && <Glow x={x} y={g - 70 * s} r={110 * s} c={C.glow} o={0.5 * glow} id={id} />}
	<path d={`M${x - 22 * s},${g - 40 * s} L${x + 22 * s},${g - 40 * s} L${x + 17 * s},${g} L${x - 17 * s},${g} Z`} fill="#6B4A36" /><rect x={x - 24 * s} y={g - 44 * s} width={48 * s} height={8 * s} fill="#83604A" />
	<g transform={`translate(${x},${g - 40 * s}) scale(${s * grow})`}>
		<path d="M-2,0 L-1,-70 L2,-70 L3,0 Z" fill={C.bark} />
		{[[0, -95, 22], [-12, -76, 16], [12, -72, 16], [0, -60, 14]].map(([cx, cy, r], i) => <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r * 1.2} fill={i % 2 ? C.leafM : C.leaf} />)}
		<ellipse cx={-5} cy={-100} rx={9} ry={11} fill={C.leafL} opacity={0.8} />
		{glow > 0 && <ellipse cx={0} cy={-84} rx={26} ry={34} fill="none" stroke={C.glowCore} strokeWidth={2.5} opacity={glow * 0.8} />}
	</g>
</g>;
export const Truck46: React.FC<{x: number; g: number; s?: number; pots?: number; t: number}> = ({x, g, s = 1, pots = 6, t}) => <g>
	<Shadow x={x} y={g + 4} rx={220 * s} ry={14 * s} o={0.35} />
	<rect x={x - 200 * s} y={g - 60 * s} width={280 * s} height={20 * s} fill="#5C6B73" />
	<path d={`M${x + 80 * s},${g - 40 * s} L${x + 80 * s},${g - 130 * s} L${x + 160 * s},${g - 130 * s} L${x + 200 * s},${g - 80 * s} L${x + 200 * s},${g - 40 * s} Z`} fill="#E6E1D4" />
	<path d={`M${x + 112 * s},${g - 120 * s} L${x + 154 * s},${g - 120 * s} L${x + 184 * s},${g - 84 * s} L${x + 112 * s},${g - 84 * s} Z`} fill="#3E4E5A" />
	<rect x={x - 200 * s} y={g - 44 * s} width={400 * s} height={14 * s} fill="#3A3F44" />
	{[x - 140 * s, x + 140 * s].map((wx, i) => <g key={i}><circle cx={wx} cy={g - 18 * s} r={22 * s} fill="#1F2226" /><circle cx={wx} cy={g - 18 * s} r={9 * s} fill="#8A8F94" /><line x1={wx} y1={g - 18 * s} x2={wx + Math.cos(t * 12) * 9 * s} y2={g - 18 * s + Math.sin(t * 12) * 9 * s} stroke="#1F2226" strokeWidth={3 * s} /></g>)}
	{Array.from({length: pots}, (_, i) => <Pot46 key={i} x={x - 180 * s + i * 46 * s} g={g - 60 * s} s={0.62 * s} id={`tp${i}`} glow={0.4} />)}
</g>;
export const Mound46: React.FC<{x: number; g: number; s?: number; night?: number; rim?: number}> = ({x, g, s = 1, night = 0, rim = 0}) => {
	const fill = mixC('#A88E66', '#2A2A30', night), top = g - 300 * s;
	return <g>
		<path d={`M${x - 600 * s},${g} L${x - 310 * s},${top} L${x + 310 * s},${top} L${x + 600 * s},${g} Z`} fill={fill} />
		<path d={`M${x + 310 * s},${top} L${x + 600 * s},${g} L${x + 230 * s},${g} L${x + 150 * s},${top} Z`} fill="#000" opacity={0.13} />
		<path d={`M${x - 600 * s},${g} L${x - 310 * s},${top} L${x - 250 * s},${top} L${x - 480 * s},${g} Z`} fill="#fff" opacity={0.08} />
		{[0.33, 0.66].map((u, i) => <line key={i} x1={x - lerp(310, 600, u) * s} y1={top + u * 300 * s} x2={x + lerp(310, 600, u) * s} y2={top + u * 300 * s} stroke="#000" strokeWidth={2} opacity={0.08} />)}
		<rect x={x - 310 * s} y={top - 8 * s} width={620 * s} height={10 * s} fill={mixC('#8FA36E', '#22282C', night)} />
		{Array.from({length: 40}, (_, i) => { const u = rnd(i, 61), yy = top + u * 290 * s, half = lerp(300, 580, u) * s; const xx = x + (rnd(i, 62) - 0.5) * 2 * half * 0.92, r = (10 + 8 * rnd(i, 63)) * s;
			return <g key={i}><ellipse cx={xx + 3} cy={yy + 3} rx={r} ry={r * 1.3} fill="#000" opacity={0.12} /><ellipse cx={xx} cy={yy} rx={r} ry={r * 1.3} fill={mixC(i % 3 ? '#6F8A55' : '#5A7448', '#1E2626', night)} /></g>; })}
		{rim > 0 && <path d={`M${x - 600 * s},${g} L${x - 310 * s},${top} L${x + 310 * s},${top}`} stroke={C.glowCore} strokeWidth={4} fill="none" opacity={rim} filter="url(#k3)" />}
	</g>;
};

/* ---------- documents: bamboo slips, a book page, a scroll ---------- */
/** vertical text drawn char by char; u reveals */
export const VText: React.FC<{x: number; y: number; s: string; size: number; fill?: string; u?: number; gap?: number; hl?: Record<number, string>}> = ({x, y, s, size, fill = C.ink, u = 1, gap = 1.12, hl = {}}) => {
	const chars = [...s], n = Math.ceil(u * chars.length);
	return <g>{chars.map((ch, i) => i < n && <text key={i} x={x} y={y + i * size * gap} textAnchor="middle" dominantBaseline="hanging" style={{fontFamily: "'Noto Serif CJK SC','Noto Serif CJK',serif", fontWeight: 700, fontSize: size}} fill={hl[i] ?? fill}>{ch}</text>)}</g>;
};
export const HANSHU = ['元封元年登封泰山', '元封二年還祠泰山', '元封五年至泰山增封', '太初元年行幸泰山', '太初三年修封泰山', '天漢三年行幸泰山', '太始四年行幸泰山', '征和四年還幸泰山'];
export const Slips46: React.FC<{x: number; y: number; s?: number; u?: number; lit?: number; grey?: number}> = ({x, y, s = 1, u = 1, lit = 8, grey = 0}) => <g transform={`translate(${x},${y}) scale(${s})`}>
	<Shadow x={20} y={560} rx={420} ry={24} o={0.35} />
	{HANSHU.map((txt, i) => { const sx = 360 - i * 92, show = clamp(u * 8 - i); if (show <= 0) return null;
		return <g key={i} opacity={show}>
			<rect x={sx - 36} y={0} width={72} height={540} rx={6} fill={mixC('#D9C08A', '#B9AE98', grey)} /><rect x={sx + 22} y={0} width={14} height={540} fill="#000" opacity={0.08} />
			<VText x={sx} y={26} s={txt} size={46} fill={i < lit ? mixC('#3A2A18', '#7A7266', grey) : '#9C8E70'} />
		</g>; })}
	{[100, 440].map((yy) => <line key={yy} x1={-330} y1={yy} x2={400} y2={yy} stroke="#6B4A2A" strokeWidth={5} opacity={clamp(u * 8)} />)}
</g>;
export const Book46: React.FC<{x: number; y: number; s?: number; u?: number; hl?: number}> = ({x, y, s = 1, u = 1, hl = 0}) => <g transform={`translate(${x},${y}) scale(${s})`}>
	<Shadow x={0} y={620} rx={420} ry={26} o={0.35} />
	<rect x={-380} y={0} width={760} height={600} fill="url(#paperG)" /><line x1={0} y1={0} x2={0} y2={600} stroke="#B6A684" strokeWidth={4} />
	{Array.from({length: 7}, (_, c) => <line key={c} x1={-340 + c * 100} y1={30} x2={-340 + c * 100} y2={570} stroke="#C9A98A" strokeWidth={1.5} opacity={0.6} />)}
	{['柏樹夾兩階', '大二十餘圍'].map((t, i) => <VText key={i} x={300 - i * 100} y={50} s={t} size={56} fill="#5A4A38" u={clamp(u * 3 - i)} />)}
	<VText x={100} y={50} s="蓋漢武所植也" size={64} fill={C.ink} u={clamp(u * 3 - 2)} hl={hl > 0 ? {0: mixC(C.ink, '#C0542F', hl)} : {}} />
	{hl > 0 && <circle cx={100} cy={86} r={52} fill="none" stroke="#C0542F" strokeWidth={5} opacity={hl} strokeDasharray={`${hl * 330} 400`} />}
	<text x={-190} y={560} textAnchor="middle" style={{fontFamily: "'Noto Serif CJK SC',serif", fontSize: 30, fontWeight: 700}} fill="#7A6A52" opacity={clamp(u * 3)}>北魏 郦道元《水经注》卷二十四</text>
</g>;
export const Scroll46: React.FC<{x: number; y: number; s?: number; open?: number; ink?: number; inscr?: number}> = ({x, y, s = 1, open = 1, ink = 1, inscr = 0}) => {
	const w = 420, h = 1000 * open;
	return <g transform={`translate(${x},${y}) scale(${s})`}>
		<Shadow x={20} y={h + 30} rx={260} ry={20} o={0.3} />
		<rect x={-w / 2 - 20} y={0} width={w + 40} height={h} fill="#C9B78F" />
		<rect x={-w / 2} y={20} width={w} height={Math.max(0, h - 40)} fill={C.silk} />
		<clipPath id="scrollclip"><rect x={-w / 2} y={20} width={w} height={Math.max(0, h - 40)} /></clipPath>
		<g clipPath="url(#scrollclip)">
			<g transform={`translate(0,${930}) scale(0.34)`}><InkTree u={ink} /></g>
			{inscr > 0 && <VText x={150} y={60} s="數千年神物" size={36} fill="#3A2E22" u={inscr} />}
		</g>
		<rect x={-w / 2 - 34} y={h - 14} width={w + 68} height={26} rx={12} fill="#6B4A2E" /><rect x={-w / 2 - 34} y={-12} width={w + 68} height={24} rx={12} fill="#6B4A2E" />
	</g>;
};

/** film finish: soft light rays from the upper left, paper grain, vignette */
export const Finish46: React.FC<{rays?: number; vig?: number; grain?: number; seed?: number}> = ({rays = 0.5, vig = 0.35, grain = 0.12}) => <g pointerEvents="none">
	<defs>
		<linearGradient id="ray46" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFF2D2" stopOpacity="0.55" /><stop offset="1" stopColor="#FFF2D2" stopOpacity="0" /></linearGradient>
		<radialGradient id="vig46" cx="0.5" cy="0.48" r="0.78"><stop offset="0.6" stopColor="#1A140E" stopOpacity="0" /><stop offset="1" stopColor="#1A140E" stopOpacity={vig} /></radialGradient>
	</defs>
	{rays > 0 && <g opacity={rays} filter="url(#k30)">{[[-200, 220], [80, 160], [380, 120]].map(([x0, w], i) => <path key={i} d={`M${x0},-60 L${x0 + w},-60 L${x0 + w + 1300},1200 L${x0 + 900},1200 Z`} fill="url(#ray46)" opacity={0.35 - i * 0.07} />)}</g>}
	<rect x={0} y={0} width={W} height={H} filter="url(#paper46)" opacity={grain} style={{mixBlendMode: 'multiply'}} />
	<rect x={0} y={0} width={W} height={H} fill="url(#vig46)" />
</g>;

/** Han-era open ground: grass tufts, rocks, shrubs (no buildings yet) */
export const Field46: React.FC<{o?: number; y?: number}> = ({o = 1, y = WALL_BASE}) => o <= 0 ? null : <g opacity={o}>
	<rect x={-1400} y={y - 40} width={W + 2800} height={60} fill="#9FA772" opacity={0.6} filter="url(#k6)" />
	{Array.from({length: 26}, (_, i) => { const x = -300 + rnd(i, 91) * 2500, yy = y + 20 + Math.pow(rnd(i, 92), 1.4) * 300, k = 0.6 + (yy - y) / 300;
		return <g key={i}>{Array.from({length: 6}, (_, j) => <path key={j} d={`M${x + j * 6 * k},${yy} q${(j - 2.5) * 3 * k},${-18 * k} ${(j - 2.5) * 6 * k},${-26 * k}`} stroke={j % 2 ? C.grassD : C.grass} strokeWidth={3 * k} fill="none" />)}</g>; })}
	{[[260, 860, 60], [700, 820, 36], [1650, 880, 70], [80, 960, 90], [1880, 980, 80]].map(([x, yy, r], i) => <g key={'r' + i}><Shadow x={x + r * 0.2} y={yy + 4} rx={r * 1.1} ry={r * 0.2} o={0.3} /><path d={`M${x - r},${yy} Q${x - r * 0.8},${yy - r * 0.8} ${x - r * 0.1},${yy - r * 0.75} Q${x + r * 0.9},${yy - r * 0.6} ${x + r},${yy} Z`} fill="#A49884" /><path d={`M${x + r * 0.2},${yy - r * 0.7} Q${x + r * 0.9},${yy - r * 0.5} ${x + r},${yy} L${x + r * 0.3},${yy} Z`} fill="#000" opacity={0.15} /></g>)}
	{[[420, 800, 70], [1000, 790, 60], [1780, 800, 80]].map(([x, yy, r], i) => <g key={'b' + i}>{Array.from({length: 5}, (_, j) => <ellipse key={j} cx={x + (j - 2) * r * 0.35} cy={yy - Math.sin(j / 4 * Math.PI) * r * 0.3} rx={r * 0.4} ry={r * 0.3} fill={j % 2 ? '#6E8A5A' : '#5A7650'} />)}</g>)}
</g>;

/** a young cypress planted in the ground (no pot), with its soil ring; glow = 0..1 */
export const Sapling46: React.FC<{x: number; g: number; s?: number; glow?: number; id: string; t?: number}> = ({x, g, s = 1, glow = 0, id, t = 0}) => <g>
	{glow > 0 && <Glow x={x} y={g - 90 * s} r={160 * s} c={C.glow} o={0.65 * glow} id={id} />}
	<ellipse cx={x} cy={g} rx={40 * s} ry={9 * s} fill="#6E5638" /><ellipse cx={x} cy={g - 2 * s} rx={30 * s} ry={6 * s} fill="#8A6E48" />
	<path d={`M${x - 3 * s},${g} L${x - 2 * s},${g - 80 * s} L${x + 2 * s},${g - 80 * s} L${x + 3 * s},${g} Z`} fill={C.bark} />
	{[[0, -150, 26, 36], [-16, -122, 22, 24], [16, -116, 22, 24], [0, -96, 22, 20], [-4, -176, 16, 22], [10, -140, 16, 18]].map(([cx, cy, rx, ry], i) => <ellipse key={i} cx={x + (cx + Math.sin(t * 1.4 + i) * 1.5) * s} cy={g + cy * s} rx={rx * s} ry={ry * s} fill={[C.leaf, C.leafM, C.leaf, C.leafM, C.leafL, C.leafL][i]} />)}
	{glow > 0 && <ellipse cx={x} cy={g - 132 * s} rx={40 * s} ry={58 * s} fill="none" stroke={C.glowCore} strokeWidth={3 * s} opacity={0.75 * glow} filter="url(#k3)" />}
</g>;
