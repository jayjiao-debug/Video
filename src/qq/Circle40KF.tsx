import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {MANDEL} from './mandel';

/* ep40 《同一个圆》 key frames: one still per beat of the film (frame index = key frame).
   One world: the same night sky, the same horizon line (HZ), a small figure looking up, the scene's circle
   floating above the horizon. Label top-left (red dash, year, name); subtitles bottom (native over Chinese). */
const W = 1920, H = 1080, HZ = 820, CX = 960, CY = 410;
const SERIF = '"Noto Serif CJK SC", serif', SANS = '"Noto Sans CJK SC", "Noto Serif CJK SC", sans-serif', LAT = '"DejaVu Sans", sans-serif', LATS = '"DejaVu Serif", serif';
const GOLD = '#f2cf7a', CYAN = '#8fe8ff', VIOLET = '#b48cff', RED = '#e0453a', INK = '#05040a';
const cl01 = (x: number) => Math.max(0, Math.min(1, x));
const rnd = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
const P = (a: number, r: number): [number, number] => [Math.cos((a - 90) * Math.PI / 180) * r, Math.sin((a - 90) * Math.PI / 180) * r];
const poly = (n: number, r: number, rot = 0, step = 1) => Array.from({length: n}, (_, i) => { const [x, y] = P(rot + (i * step * 360) / n, r); return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`; }).join(' ') + ' Z';
const star = (n: number, r1: number, r2: number, rot = 0) => Array.from({length: 2 * n}, (_, i) => { const [x, y] = P(rot + i * 180 / n, i % 2 ? r2 : r1); return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`; }).join(' ') + ' Z';
const circ = (r: number) => `M${r},0 A${r},${r} 0 1,1 ${-r},0 A${r},${r} 0 1,1 ${r},0`;

/** a glowing line (fully drawn, or partly with u) */
const G: React.FC<{d: string; w?: number; col?: string; u?: number; glow?: number; fill?: string; op?: number}> = ({d, w = 2.4, col = GOLD, u = 1, glow = 1, fill = 'none', op = 1}) => <g opacity={op}>
	{glow > 0 && <path d={d} fill="none" stroke={col} strokeWidth={w * 5} opacity={0.3 * glow} filter="url(#gM)" strokeDasharray={5000} strokeDashoffset={5000 * (1 - u)} />}
	<path d={d} fill={fill} stroke={col} strokeWidth={w} strokeDasharray={u < 1 ? 5000 : undefined} strokeDashoffset={u < 1 ? 5000 * (1 - u) : undefined} strokeLinejoin="round" strokeLinecap="round" />
</g>;

/* ---------------- the world ---------------- */
const SKY: Record<string, [string, string, string]> = {
	open: ['#1e1638', '#0a0816', '#020104'], luo: ['#10283a', '#081420', '#02060a'], gre: ['#1c2c52', '#0b1428', '#03060d'],
	zhou: ['#232833', '#10131a', '#040507'], isf: ['#0f2f45', '#081a2a', '#02070c'], vin: ['#3a2a1c', '#1a120b', '#070504'],
	kep: ['#151a40', '#080b20', '#020308'], sand: ['#2a1a40', '#120b20', '#05030a'], man: ['#0a1c40', '#050d22', '#01030a'],
};
const Sky: React.FC<{k: string}> = ({k}) => { const [a, b, c] = SKY[k]; return <>
	<defs><radialGradient id={`sky${k}`} cx="0.5" cy="0.78" r="0.9"><stop offset="0" stopColor={a} /><stop offset="0.5" stopColor={b} /><stop offset="1" stopColor={c} /></radialGradient></defs>
	<rect width={W} height={H} fill={`url(#sky${k})`} />
	{Array.from({length: 110}, (_, i) => <circle key={i} cx={rnd(i) * W} cy={rnd(i, 1) * HZ} r={0.6 + 1.5 * rnd(i, 2)} fill="#eef" opacity={0.12 + 0.45 * rnd(i, 3)} />)}
	{/* horizon glow: the one line every scene shares */}
	<rect x={0} y={HZ - 60} width={W} height={60} fill={GOLD} opacity={0.05} filter="url(#gL)" />
</>; };

const ridge = (seed: number, base: number, amp: number, step = 40) => { let d = `M0,${H} L0,${base}`; for (let x = 0; x <= W; x += step) d += ` L${x},${(base - amp * (0.5 + 0.5 * Math.sin(x * 0.004 + seed) * Math.cos(x * 0.011 + seed * 2)) - amp * 0.25 * rnd(x, seed)).toFixed(1)}`; return d + ` L${W},${H} Z`; };
const Ground: React.FC<{col?: string}> = ({col = INK}) => <rect x={0} y={HZ} width={W} height={H - HZ} fill={col} />;
const Water: React.FC = () => <g>
	<rect x={0} y={HZ} width={W} height={H - HZ} fill="#03070c" />
	{Array.from({length: 26}, (_, i) => { const y = HZ + 8 + i * i * 0.36; return <line key={i} x1={CX - 30 - 260 * rnd(i, 4) - i * 6} x2={CX + 30 + 260 * rnd(i, 5) + i * 6} y1={y} y2={y} stroke={GOLD} strokeWidth={1 + i * 0.08} opacity={0.32 - i * 0.011} />; })}
</g>;

/** the small figure on the horizon, looking up at the circle */
const Figure: React.FC<{x?: number; hat?: 'yu' | 'gre' | 'zhou' | 'tur' | 'cap' | 'ruff' | 'monk' | 'suit'; s?: number}> = ({x = 600, hat = 'gre', s = 1}) => <g transform={`translate(${x},${HZ}) scale(${s})`} fill={INK}>
	<path d={hat === 'suit' ? 'M-16,0 L-14,-52 Q0,-60 14,-52 L16,0 Z' : 'M-24,0 Q-20,-40 -13,-56 Q0,-62 13,-56 Q20,-40 24,0 Z'} />
	<circle cx={4} cy={-70} r={11} />
	{hat === 'yu' && <path d="M-10,-78 L18,-84 L16,-88 L-8,-83 Z" />}
	{hat === 'zhou' && <path d="M-6,-80 L12,-80 L10,-92 L-4,-92 Z" />}
	{hat === 'tur' && <ellipse cx={4} cy={-78} rx={14} ry={8} />}
	{hat === 'cap' && <path d="M-9,-76 Q4,-90 17,-76 Z" />}
	{hat === 'ruff' && <ellipse cx={2} cy={-58} rx={16} ry={5} />}
	{hat === 'monk' && <path d="M-26,0 Q-30,-30 -12,-50 L18,-30 L26,0 Z" />}
	<path d="M10,-48 Q30,-60 36,-80" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" opacity={hat === 'gre' || hat === 'cap' ? 1 : 0} />
</g>;

const Horizon: React.FC<{k: string}> = ({k}) => {
	switch (k) {
		case 'luo': return <g>
			<path d={ridge(1, HZ, 70, 30)} fill="#060b12" opacity={0.9} />
			<Water />
			{/* the turtle rising from the river */}
			<g transform={`translate(1290,${HZ + 6})`}><path d="M-130,0 Q-120,-62 0,-66 Q120,-62 130,0 Z" fill={INK} />
				{[-80, -27, 27, 80].map((x) => <path key={x} d={`M${x - 26},-14 L${x - 16},-44 L${x + 16},-44 L${x + 26},-14 Z`} fill="none" stroke={GOLD} strokeWidth={1.6} opacity={0.55} />)}
				<ellipse cx={-150} cy={-14} rx={26} ry={16} fill={INK} /><circle cx={-162} cy={-18} r={3} fill={GOLD} /></g>
			{Array.from({length: 22}, (_, i) => <path key={i} d={`M${120 + i * 9},${HZ + 30} Q${120 + i * 9 + 6},${HZ - 40} ${120 + i * 9 + 14 * rnd(i, 7)},${HZ - 60 - 60 * rnd(i, 8)}`} stroke={INK} strokeWidth={3} fill="none" />)}
			<Figure x={560} hat="yu" />
		</g>;
		case 'gre': return <g>
			<Water />
			<path d={`M900,${HZ} Q1200,${HZ - 70} 1500,${HZ - 110} Q1700,${HZ - 120} ${W},${HZ - 100} L${W},${H} L900,${H} Z`} fill={INK} />
			<g transform={`translate(1560,${HZ - 118})`} fill={INK}>
				<rect x={-150} y={-12} width={300} height={14} /><rect x={-140} y={-24} width={280} height={12} />
				{Array.from({length: 6}, (_, i) => <rect key={i} x={-122 + i * 46} y={-120} width={16} height={96} />)}
				<rect x={-140} y={-140} width={280} height={20} /><path d="M-150,-140 L0,-196 L150,-140 Z" />
			</g>
			{[1340, 1380, 1760].map((x, i) => <ellipse key={x} cx={x} cy={HZ - 95 - i * 6} rx={11} ry={48} fill={INK} />)}
			<path d={`M0,${HZ} L520,${HZ} L700,${H} L0,${H} Z`} fill={INK} />
			<Figure x={600} hat="gre" />
		</g>;
		case 'zhou': return <g>
			<path d={ridge(3, HZ - 40, 110, 24)} fill="#1b2029" opacity={0.85} filter="url(#gS)" />
			<path d={ridge(5, HZ - 10, 80, 24)} fill="#0e1117" opacity={0.95} />
			<Ground col="#06070a" />
			<g transform={`translate(1360,${HZ - 4})`} fill={INK}><path d="M-120,4 L-60,-60 L80,-56 L130,4 Z" />
				<g transform="translate(0,-60)"><rect x={-44} y={-60} width={6} height={60} /><rect x={38} y={-60} width={6} height={60} /><path d="M-90,-56 Q-50,-70 0,-96 Q50,-70 90,-56 Q100,-50 108,-62 L84,-50 L-84,-50 L-108,-62 Q-100,-50 -90,-56 Z" /></g></g>
			<Figure x={600} hat="zhou" />
		</g>;
		case 'isf': return <g>
			<Ground />
			<g transform={`translate(1500,${HZ})`} fill={INK}>
				<rect x={-130} y={-160} width={260} height={160} /><path d="M-150,-160 C-150,-280 -40,-330 0,-400 C40,-330 150,-280 150,-160 Z" />
				{[-240, 240].map((x) => <g key={x}><rect x={x - 12} y={-330} width={24} height={330} /><rect x={x - 18} y={-300} width={36} height={10} /><path d={`M${x - 14},-330 L${x},-370 L${x + 14},-330 Z`} /></g>)}
				<rect x={-420} y={-210} width={190} height={210} /><path d="M-395,0 L-395,-120 Q-325,-200 -255,-120 L-255,0 Z" fill="#0b2233" />
			</g>
			{[260, 360].map((x, i) => <g key={x} transform={`translate(${x},${HZ})`}><path d={`M-4,0 Q${6 - i * 10},-90 ${4 - i * 6},-170 L${10 - i * 6},-170 Q${12 - i * 8},-90 4,0 Z`} fill={INK} />
				{[0, 60, 120, 180, 240, 300].map((a) => <path key={a} transform={`translate(${7 - i * 6},-170) rotate(${a})`} d="M0,0 Q30,-14 62,6 Q30,-4 0,0 Z" fill={INK} />)}</g>)}
			<Figure x={620} hat="tur" />
		</g>;
		case 'vin': return <g>
			<Ground col="#080604" />
			<g transform={`translate(1450,${HZ})`} fill={INK}>
				<rect x={-260} y={-150} width={520} height={150} /><path d="M-260,-150 L0,-210 L260,-150 Z" />
				{Array.from({length: 15}, (_, i) => { const x = -250 + i * 36, h = 60 + (i % 2) * 30 + (i === 7 ? 120 : 0); return <path key={i} d={`M${x - 6},-150 L${x},${-150 - h} L${x + 6},-150 Z`} />; })}
			</g>
			<g transform={`translate(380,${HZ})`} fill={INK}><rect x={-60} y={-90} width={120} height={90} /><path d="M-70,-90 Q0,-200 70,-90 Z" /><rect x={-6} y={-220} width={12} height={40} /></g>
			<Figure x={620} hat="cap" />
		</g>;
		case 'kep': return <g>
			<path d={`M0,${HZ} L${W},${HZ} L${W},${H} L0,${H} Z`} fill={INK} />
			<path d={`M1150,${HZ} Q1300,${HZ - 150} 1450,${HZ - 160} Q1600,${HZ - 150} 1750,${HZ} Z`} fill={INK} />
			<g transform={`translate(1450,${HZ - 158})`} fill={INK}><rect x={-26} y={-110} width={52} height={110} /><path d="M-34,-110 L0,-160 L34,-110 Z" /><circle cy={-80} r={16} fill="#151a40" /><line x1={0} y1={-80} x2={0} y2={-92} stroke={GOLD} strokeWidth={2} /></g>
			{Array.from({length: 22}, (_, i) => { const x = 60 + i * 50, h = 30 + 40 * rnd(i, 9); return <path key={i} d={`M${x - 24},${HZ} L${x - 24},${HZ - h} L${x},${HZ - h - 26} L${x + 24},${HZ - h} L${x + 24},${HZ} Z`} fill={INK} />; })}
			<Figure x={1180} hat="ruff" />
		</g>;
		case 'sand': return <g>
			<path d={`M0,${HZ} L180,${HZ - 260} L330,${HZ - 150} L520,${HZ - 330} L720,${HZ - 120} L900,${HZ} Z`} fill="#140f22" />
			<path d={`M180,${HZ - 260} L215,${HZ - 205} L190,${HZ - 210} L160,${HZ - 230} Z M520,${HZ - 330} L570,${HZ - 260} L530,${HZ - 270} L490,${HZ - 290} Z`} fill="#cfc8e8" opacity={0.6} />
			<path d={`M1000,${HZ} L1250,${HZ - 300} L1420,${HZ - 180} L1600,${HZ - 360} L1800,${HZ - 170} L${W},${HZ - 220} L${W},${HZ} Z`} fill="#140f22" />
			<path d={`M1600,${HZ - 360} L1650,${HZ - 290} L1610,${HZ - 300} L1570,${HZ - 320} Z`} fill="#cfc8e8" opacity={0.6} />
			<Ground />
			<g transform={`translate(1460,${HZ})`} fill={INK}><path d="M-220,0 L-200,-120 L200,-120 L220,0 Z" /><path d="M-140,-120 L-125,-200 L125,-200 L140,-120 Z" /><rect x={-60} y={-240} width={120} height={40} />
				{Array.from({length: 9}, (_, i) => <rect key={i} x={-180 + i * 42} y={-90} width={14} height={20} fill="#3a2a10" />)}</g>
			{[0, 1].map((j) => <g key={j}><path d={`M${j ? 1000 : 300},${HZ - 150} Q${j ? 1150 : 450},${HZ - 90} ${j ? 1300 : 600},${HZ - 170}`} stroke="#2a2238" strokeWidth={1.5} fill="none" />
				{Array.from({length: 14}, (_, i) => { const u = (i + 0.5) / 14, x = (j ? 1000 : 300) + 300 * u, y = HZ - 150 - 20 * u + 4 * 60 * u * (1 - u) - (j ? 0 : 0); return <path key={i} d={`M${x - 7},${y} L${x + 7},${y} L${x},${y + 16} Z`} fill={['#2f5fb3', '#efe6d2', '#c8372d', '#2e9a5e', '#e8b830'][i % 5]} opacity={0.75} />; })}</g>)}
			<Figure x={640} hat="monk" />
		</g>;
		case 'man': return <g>
			<path d={`M0,${HZ} L0,${HZ - 120} L60,${HZ - 110} L90,${HZ - 140} L150,${HZ - 120} L170,${HZ - 150} L240,${HZ - 130} L260,${HZ - 90} L300,${HZ - 70} L330,${HZ - 40} L380,${HZ} Z`} fill={INK} />
			<Ground />
			{Array.from({length: 26}, (_, i) => { const x = 900 + i * 40, w = 30 + 14 * rnd(i, 10), h = 60 + 220 * rnd(i, 11) * (1 - Math.abs(i - 13) / 20); return <g key={i}><rect x={x} y={HZ - h} width={w} height={h} fill={INK} />
				{Array.from({length: Math.floor(h / 22)}, (_, r) => Array.from({length: 2}, (_, c) => rnd(i * 31 + r * 3 + c, 12) > 0.6 ? <rect key={`${r}${c}`} x={x + 6 + c * (w / 2)} y={HZ - h + 10 + r * 22} width={6} height={8} fill="#ffd77a" opacity={0.7} /> : null))}</g>; })}
			<Figure x={600} hat="suit" />
		</g>;
	}
	return <Ground />;
};

const Label: React.FC<{year: string; name: string}> = ({year, name}) => <g>
	<rect x={110} y={112} width={44} height={6} fill={RED} />
	<text x={168} y={124} style={{fontFamily: SANS, fontWeight: 700, fontSize: 32}} fill="#fff" opacity={0.92}>{year}</text>
	<text x={110} y={182} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 48}} fill="#fff">{name}</text>
</g>;
const Subs: React.FC<{nat?: string; zh: string; rtl?: boolean; lat?: string}> = ({nat, zh, rtl, lat = LAT}) => <g>
	{nat && <text x={CX} y={948} textAnchor="middle" direction={rtl ? 'rtl' : undefined} style={{fontFamily: lat, fontSize: 40, fontWeight: 600}} fill="#fff" opacity={0.95} stroke="#000" strokeWidth={6} paintOrder="stroke">{nat}</text>}
	<text x={CX} y={nat ? 1012 : 990} textAnchor="middle" style={{fontFamily: SANS, fontSize: 50, fontWeight: 700}} fill={GOLD} stroke="#000" strokeWidth={7} paintOrder="stroke">{zh}</text>
</g>;

/* ---------------- the circles ---------------- */
const LUO = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];
const Luoshu: React.FC<{s?: number; lines?: boolean}> = ({s = 1, lines = true}) => {
	const cell = 150, pos = (r: number, c: number): [number, number] => [(c - 1) * cell, (r - 1) * cell];
	const dots = (n: number) => n === 5 ? [[0, 0], [-22, 0], [22, 0], [0, -22], [0, 22]] : Array.from({length: n}, (_, i) => [(i - (n - 1) / 2) * 15, 0]);
	const L = (a: [number, number], b: [number, number], ext = 70) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); return `M${a[0] - dx / l * ext},${a[1] - dy / l * ext} L${b[0] + dx / l * ext},${b[1] + dy / l * ext}`; };
	return <g transform={`scale(${s})`}>
		<G d={circ(300)} w={2.4} /><G d={poly(4, 300 * 0.98, 45)} w={1.4} op={0.6} />
		{lines && <><G d={L(pos(0, 0), pos(0, 2))} w={3} col={CYAN} /><G d={L(pos(0, 1), pos(2, 1))} w={3} col={CYAN} /><G d={L(pos(0, 0), pos(2, 2))} w={3} col={CYAN} />
			{[[pos(0, 2), 0, -1, 'r'], [pos(2, 1), 0, 1, 'b'], [pos(2, 2), 1, 1, 'd']].map(([p, , , k]) => { const [x, y] = p as [number, number]; const dx = k === 'r' ? 110 : k === 'd' ? 92 : 0, dy = k === 'b' ? 112 : k === 'd' ? 92 : 12; return <text key={k as string} x={x + dx} y={y + dy} textAnchor="middle" style={{fontFamily: LAT, fontWeight: 700, fontSize: 34}} fill={CYAN}>15</text>; })}</>}
		{LUO.map((row, r) => row.map((n, c) => { const [x, y] = pos(r, c), odd = n % 2 === 1, d = dots(n); return <g key={n} transform={`translate(${x},${y})`}>
			{n !== 5 && n > 1 && <line x1={d[0][0]} y1={0} x2={d[d.length - 1][0]} y2={0} stroke={GOLD} strokeWidth={1.6} opacity={0.8} />}
			{d.map(([dx, dy], i) => <circle key={i} cx={dx} cy={dy} r={6} fill={odd ? '#fff6dc' : INK} stroke={GOLD} strokeWidth={2} />)}
		</g>; }))}
	</g>;
};

const Penta: React.FC<{s?: number}> = ({s = 1}) => {
	const R = 280, letters = ['Υ', 'Γ', 'Ι', 'Θ', 'Α'];
	const p0 = P(0, R), p2 = P(144, R), ri = R * Math.cos(72 * Math.PI / 180) / Math.cos(36 * Math.PI / 180);
	const q1 = P(36 + 180, ri), q2 = P(108 + 180, ri);           // the two crossings on the chord p0–p2 (inner pentagon vertices)
	return <g transform={`scale(${s})`}>
		<G d={circ(R)} w={2.4} /><G d={poly(5, R, 0, 2)} w={3} /><G d={poly(5, ri, 180)} w={1.4} col={CYAN} op={0.8} />
		{letters.map((l, i) => { const [x, y] = P(i * 72, R + 52); return <g key={l} transform={`translate(${x},${y})`}><circle r={30} fill={INK} stroke={GOLD} strokeWidth={1.6} /><text y={12} textAnchor="middle" style={{fontFamily: LATS, fontSize: 34, fontWeight: 700}} fill="#fff6dc">{l}</text></g>; })}
		{/* the golden ratio on one chord */}
		{[[p0, q1, CYAN], [q1, q2, VIOLET]].map(([a, b, col], i) => { const A = a as [number, number], B = b as [number, number]; return <g key={i}><line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={col as string} strokeWidth={7} opacity={0.9} strokeLinecap="round" /></g>; })}
		{[p0, q1, q2, p2].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={7} fill="#fff" />)}
		<text x={(p0[0] + q1[0]) / 2 + 40} y={(p0[1] + q1[1]) / 2 + 6} style={{fontFamily: LATS, fontSize: 46, fontStyle: 'italic'}} fill={CYAN}>φ</text>
		<text x={-R - 40} y={R + 20} style={{fontFamily: LATS, fontSize: 30}} fill={GOLD} opacity={0.85}>φ = 1.618…</text>
	</g>;
};

/** 周敦颐《太极图》: five stacked circles (not the later yin-yang fish) */
const Taijitu: React.FC<{s?: number}> = ({s = 1}) => {
	const r = 54, ys = [-300, -160, -10, 150, 280];
	const halves = (rr: number[]) => rr.map((q, i) => <g key={i}>
		<path d={`M0,${-q} A${q},${q} 0 0,0 0,${q}`} fill={i % 2 ? '#e9e2cf' : '#14161c'} stroke={GOLD} strokeWidth={1.4} />
		<path d={`M0,${-q} A${q},${q} 0 0,1 0,${q}`} fill={i % 2 ? '#14161c' : '#e9e2cf'} stroke={GOLD} strokeWidth={1.4} />
	</g>);
	const el: [string, number, number][] = [['火', -78, -60], ['水', 78, -60], ['土', 0, 0], ['木', -78, 60], ['金', 78, 60]];
	return <g transform={`scale(${s})`}>
		<line x1={0} y1={ys[0]} x2={0} y2={ys[4]} stroke={GOLD} strokeWidth={1.2} opacity={0.5} />
		<G d={circ(r)} w={2.6} fill={INK} />
		<g transform={`translate(0,${ys[0]})`}><G d={circ(r)} w={2.8} fill="#0d0f14" /></g>
		<g transform={`translate(0,${ys[1]})`}>{halves([r + 6, r - 10, r - 26])}<circle r={14} fill="#0d0f14" stroke={GOLD} strokeWidth={1.4} /></g>
		<g transform={`translate(0,${ys[2]})`}>
			{[[0, 1], [1, 2], [0, 3], [1, 4], [3, 2], [4, 2], [0, 4], [1, 3]].map(([a, b], i) => <line key={i} x1={el[a][1]} y1={el[a][2]} x2={el[b][1]} y2={el[b][2]} stroke={GOLD} strokeWidth={1.6} opacity={0.8} />)}
			{el.map(([c, x, y]) => <g key={c} transform={`translate(${x},${y})`}><circle r={28} fill="#0d0f14" stroke={GOLD} strokeWidth={2} /><text y={11} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 30}} fill="#fff6dc">{c}</text></g>)}
			<circle cy={110} r={12} fill="#0d0f14" stroke={GOLD} strokeWidth={1.6} />
		</g>
		{[[ys[3], '乾道成男', '坤道成女'], [ys[4], '万物化生', '']].map(([y, a, b], i) => <g key={i} transform={`translate(0,${y})`}><G d={circ(r)} w={2.6} fill="#0d0f14" />
			<text x={-r - 18} y={10} textAnchor="end" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 28}} fill={GOLD}>{a}</text>
			{b && <text x={r + 18} y={10} style={{fontFamily: SERIF, fontWeight: 700, fontSize: 28}} fill={GOLD}>{b}</text>}</g>)}
		<text x={-r - 18} y={ys[0] + 10} textAnchor="end" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 28}} fill={GOLD}>无极而太极</text>
		<text x={r + 18} y={ys[1] - 10} style={{fontFamily: SERIF, fontWeight: 700, fontSize: 28}} fill={GOLD}>阳动</text>
		<text x={-r - 18} y={ys[1] + 30} textAnchor="end" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 28}} fill={GOLD}>阴静</text>
	</g>;
};

/** a 10-fold girih rosette */
const Rosette: React.FC<{r: number; strap?: number; tone?: number}> = ({r, strap = 1, tone = 0}) => <g>
	<path d={star(10, r, r * 0.62)} fill={tone ? '#1f6f8b' : '#2a9bb0'} />
	<path d={poly(10, r * 0.5, 18)} fill="#123a6b" />
	<path d={star(10, r * 0.42, r * 0.22)} fill={GOLD} opacity={0.9} />
	<path d={poly(10, r, 0, 3)} fill="none" stroke={GOLD} strokeWidth={5 * strap} /><path d={poly(10, r, 0, 3)} fill="none" stroke="#0a1a28" strokeWidth={1.6 * strap} />
	<path d={poly(10, r * 0.62, 18, 3)} fill="none" stroke={GOLD} strokeWidth={3 * strap} />
</g>;
const Girih: React.FC<{s?: number}> = ({s = 1}) => {
	const arch = 'M-300,330 L-300,-80 Q-300,-250 0,-360 Q300,-250 300,-80 L300,330 Z';
	return <g transform={`scale(${s})`}>
		<defs><clipPath id="archC"><path d={arch} /></clipPath></defs>
		<path d={arch} fill="#0c2f4c" />
		<g clipPath="url(#archC)">
			{Array.from({length: 7}, (_, i) => Array.from({length: 5}, (_, j) => { const x = (j - 2) * 190 + (i % 2) * 95, y = (i - 3) * 110; return Math.hypot(x, y) < 120 ? null : <g key={`${i}${j}`} transform={`translate(${x},${y})`}><Rosette r={88} strap={0.6} tone={(i + j) % 2} /></g>; }))}
		</g>
		<Rosette r={150} />
		<G d={arch} w={4} />
		<G d={'M-326,330 L-326,-90 Q-326,-272 0,-390 Q326,-272 326,-90 L326,330'} w={1.6} op={0.7} />
		<g transform="translate(350,-150)"><line x1={0} y1={0} x2={60} y2={-40} stroke={CYAN} strokeWidth={1.6} />
			<text x={70} y={-44} style={{fontFamily: SANS, fontWeight: 700, fontSize: 30}} fill={CYAN}>比彭罗斯早 500 年</text>
			<text x={70} y={-8} style={{fontFamily: SANS, fontSize: 22}} fill="#cfe" opacity={0.8}>永不重复的拼图</text></g>
	</g>;
};

const Vitruvian: React.FC<{s?: number}> = ({s = 1}) => {
	const h = 560, top = -h / 2, feet = h / 2, R = 0.6 * h, cy = feet - R, sh = top + 0.18 * h, hip = top + 0.52 * h;
	const limb = (d: string, op = 1) => <path d={d} stroke="#e9d9b8" strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={op} />;
	return <g transform={`scale(${s})`}>
		<G d={`M${-h / 2},${top} L${h / 2},${top} L${h / 2},${feet} L${-h / 2},${feet} Z`} w={2.6} />
		<g transform={`translate(0,${cy})`}><G d={circ(R)} w={2.6} col={CYAN} /></g>
		<circle cx={0} cy={cy} r={6} fill={CYAN} />
		{/* pose 2 (ghost): arms raised to the circle, legs apart */}
		{limb(`M${P(-58, R)[0]},${cy + P(-58, R)[1]} L0,${sh} L${P(58, R)[0]},${cy + P(58, R)[1]}`, 0.35)}
		{limb(`M${P(-150, R)[0]},${cy + P(-150, R)[1]} L0,${hip} L${P(150, R)[0]},${cy + P(150, R)[1]}`, 0.35)}
		{/* pose 1: arms out to the square, legs together */}
		{limb(`M${-h / 2},${sh} L${h / 2},${sh}`)}
		{limb(`M-18,${feet} L-12,${hip} M18,${feet} L12,${hip}`)}
		<rect x={-34} y={sh - 14} width={68} height={hip - sh + 20} rx={26} fill="#e9d9b8" />
		<circle cx={0} cy={top + 40} r={38} fill="#e9d9b8" />
		<text x={-h / 2} y={feet + 50} style={{fontFamily: LATS, fontSize: 24, fontStyle: 'italic'}} fill={GOLD} opacity={0.8}>homo ad circulum · homo ad quadratum</text>
	</g>;
};

/* Platonic solids as wireframes, rotated in 3D and projected */
const PHI = (1 + Math.sqrt(5)) / 2;
type V3 = [number, number, number];
const norm = (vs: V3[]) => { const m = Math.max(...vs.map((v) => Math.hypot(...v))); return vs.map((v) => v.map((c) => c / m) as V3); };
const SOLIDS: Record<string, V3[]> = (() => {
	const cube: V3[] = []; for (const a of [-1, 1]) for (const b of [-1, 1]) for (const c of [-1, 1]) cube.push([a, b, c]);
	const tet: V3[] = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
	const oct: V3[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
	const ico: V3[] = []; for (const a of [-1, 1]) for (const b of [-1, 1]) { ico.push([0, a, b * PHI], [a, b * PHI, 0], [b * PHI, 0, a]); }
	const dod: V3[] = [...cube]; for (const a of [-1, 1]) for (const b of [-1, 1]) { dod.push([0, a / PHI, b * PHI], [a / PHI, b * PHI, 0], [b * PHI, 0, a / PHI]); }
	return {cube: norm(cube), tet: norm(tet), oct: norm(oct), ico: norm(ico), dod: norm(dod)};
})();
const edges = (vs: V3[]) => { const d = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); let m = 9; for (let i = 0; i < vs.length; i++) for (let j = i + 1; j < vs.length; j++) m = Math.min(m, d(vs[i], vs[j])); const e: [number, number][] = []; for (let i = 0; i < vs.length; i++) for (let j = i + 1; j < vs.length; j++) if (d(vs[i], vs[j]) < m * 1.01) e.push([i, j]); return e; };
const rot = (v: V3, ax: number, ay: number): V3 => { const [x, y, z] = v; const x1 = x * Math.cos(ay) + z * Math.sin(ay), z1 = -x * Math.sin(ay) + z * Math.cos(ay); return [x1, y * Math.cos(ax) - z1 * Math.sin(ax), y * Math.sin(ax) + z1 * Math.cos(ax)]; };
const Solid: React.FC<{k: string; r: number; ax: number; ay: number; col: string; w?: number}> = ({k, r, ax, ay, col, w = 2}) => { const vs = SOLIDS[k].map((v) => rot(v, ax, ay)); return <g>{edges(SOLIDS[k]).map(([i, j], n) => <line key={n} x1={vs[i][0] * r} y1={vs[i][1] * r} x2={vs[j][0] * r} y2={vs[j][1] * r} stroke={col} strokeWidth={w * (0.75 + 0.25 * (vs[i][2] + vs[j][2]) / 2)} opacity={0.55 + 0.45 * (vs[i][2] + vs[j][2] + 2) / 4} strokeLinecap="round" />)}</g>; };
const IN: Record<string, number> = {cube: 1 / Math.sqrt(3), tet: 1 / 3, dod: 0.7947, ico: 0.7947, oct: 1 / Math.sqrt(3)};
const Kepler: React.FC<{s?: number; ellipse?: number; T?: number}> = ({s = 1, ellipse = 0.6, T = 0.6}) => {
	const order: [string, string][] = [['cube', GOLD], ['tet', CYAN], ['dod', VIOLET], ['ico', '#7dffb0'], ['oct', '#ff9d7a']];
	const planets = ['♄', '♃', '♂', '♁', '♀', '☿'];
	let r = 330; const rs: number[] = [r]; order.forEach(([k]) => { r *= IN[k]; rs.push(r); });
	// stretch the inner spheres so the tiny ones read: Kepler's own drawing does the same
	const vis = (x: number) => 330 * Math.pow(x / 330, 0.55);
	return <g transform={`scale(${s})`}>
		{rs.map((q, i) => <G key={i} d={circ(vis(q))} w={1.4} col="#cfd8ff" op={0.55} glow={0.4} />)}
		{order.map(([k, col], i) => <Solid key={k} k={k} r={vis(rs[i])} ax={0.5 + T * 0.4 + i * 0.3} ay={0.7 + T * 0.6 - i * 0.4} col={col} w={2.2} />)}
		{rs.map((q, i) => { const [x, y] = P(40 + i * 61, vis(q)); return <text key={i} x={x} y={y + 9} textAnchor="middle" style={{fontFamily: LAT, fontSize: 26}} fill="#fff" stroke={INK} strokeWidth={4} paintOrder="stroke">{planets[i]}</text>; })}
		{/* the twist: the orbit he finally found is an ellipse */}
		{ellipse > 0 && <g opacity={ellipse}><ellipse cx={40} cy={0} rx={360} ry={300} fill="none" stroke={RED} strokeWidth={3.5} strokeDasharray="14 10" /><circle cx={40 - Math.sqrt(360 * 360 - 300 * 300)} cy={0} r={9} fill="#ffd77a" />
			<text x={330} y={-300} style={{fontFamily: SANS, fontWeight: 700, fontSize: 28}} fill={RED}>其实是椭圆</text></g>}
	</g>;
};

const SANDC = ['#c8372d', '#e8b830', '#2f5fb3', '#2e9a5e', '#efe6d2'];
const Mandala: React.FC<{s?: number; swept?: number}> = ({s = 1, swept = 0}) => {
	const R = 330, sq = 175, g = 34;
	const gate = (a: number) => <g key={a} transform={`rotate(${a})`}><path d={`M${-g * 1.6},${-sq} L${-g * 1.6},${-sq - 34} L${-g * 0.7},${-sq - 34} L${-g * 0.7},${-sq - 58} L${g * 0.7},${-sq - 58} L${g * 0.7},${-sq - 34} L${g * 1.6},${-sq - 34} L${g * 1.6},${-sq} Z`} fill={SANDC[1]} stroke="#fff" strokeWidth={2} /></g>;
	const sector = (a0: number, a1: number, r = 420) => { const [x0, y0] = P(a0, r), [x1, y1] = P(a1, r); return `M0,0 L${x0},${y0} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0},1 ${x1},${y1} Z`; };
	return <g transform={`scale(${s})`}>
		<defs><mask id="sweepM" maskUnits="userSpaceOnUse" x={-500} y={-500} width={1000} height={1000}><rect x={-500} y={-500} width={1000} height={1000} fill="#fff" />{swept > 0 && <path d={sector(-10, -10 + 360 * swept)} fill="#000" />}</mask>
			<filter id="grain" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves={2} seed={4} result="n" /><feColorMatrix in="n" type="saturate" values="0" result="m" /><feComposite in="SourceGraphic" in2="m" operator="arithmetic" k1={0.9} k2={0.35} k3={0} k4={0} /></filter></defs>
		<g mask="url(#sweepM)" filter="url(#grain)">
			{/* fire ring, vajra ring, lotus ring */}
			{Array.from({length: 60}, (_, i) => <path key={i} d={sector(i * 6, i * 6 + 6, R)} fill={SANDC[i % 4]} />)}
			<circle r={R - 26} fill="#1b1430" />
			{Array.from({length: 48}, (_, i) => <path key={i} transform={`rotate(${i * 7.5})`} d={`M-9,${-R + 30} L0,${-R + 52} L9,${-R + 30} Z`} fill={SANDC[4]} />)}
			<circle r={R - 60} fill={SANDC[2]} />
			{Array.from({length: 32}, (_, i) => <path key={i} transform={`rotate(${i * 11.25})`} d={`M0,${-R + 60} Q16,${-R + 82} 0,${-R + 100} Q-16,${-R + 82} 0,${-R + 60} Z`} fill={SANDC[(i % 2) ? 0 : 1]} />)}
			<circle r={R - 100} fill="#efe6d2" />
			{/* the palace: square with four T gates, quarters in the four colours */}
			{[0, 90, 180, 270].map((a, i) => <path key={a} transform={`rotate(${a})`} d={`M0,0 L${-sq},${-sq} L${sq},${-sq} Z`} fill={SANDC[i]} />)}
			{[0, 90, 180, 270].map(gate)}
			<path d={`M${-sq},${-sq} L${sq},${-sq} L${sq},${sq} L${-sq},${sq} Z`} fill="none" stroke="#fff" strokeWidth={4} />
			<circle r={110} fill="#1b1430" stroke={SANDC[1]} strokeWidth={6} />
			{Array.from({length: 8}, (_, i) => <path key={i} transform={`rotate(${i * 45})`} d="M0,-14 Q30,-55 0,-100 Q-30,-55 0,-14 Z" fill={SANDC[i % 2 ? 0 : 4]} />)}
			<circle r={22} fill={SANDC[1]} />
		</g>
		{/* swept part: the colours pulled into one grey-brown spiral of sand */}
		{swept > 0 && Array.from({length: 900}, (_, i) => { const u = rnd(i, 20), a = -10 + 360 * swept * rnd(i, 21), rr = (1 - u) * 330 * (0.35 + 0.65 * rnd(i, 22)); const [x, y] = P(a + 90 * u, rr * (1 - 0.6 * u)); return <circle key={i} cx={x} cy={y} r={1.4 + 2 * rnd(i, 23)} fill={u > 0.6 ? '#9c8f80' : SANDC[i % 5]} opacity={0.8} />; })}
	</g>;
};

const Mandel: React.FC<{s?: number}> = ({s = 1}) => <g transform={`scale(${s})`}>
	<image href={MANDEL.full} x={-500} y={-410} width={1000} height={820} />
	<rect x={-105} y={-210} width={34} height={34} fill="none" stroke={CYAN} strokeWidth={2} />
	<line x1={-71} y1={-210} x2={330} y2={-330} stroke={CYAN} strokeWidth={1.4} opacity={0.8} /><line x1={-71} y1={-176} x2={330} y2={-90} stroke={CYAN} strokeWidth={1.4} opacity={0.8} />
	<g transform="translate(330,-330)"><rect width={240} height={240} fill={INK} stroke={CYAN} strokeWidth={2} /><image href={MANDEL.zoom} width={240} height={240} />
		<text x={120} y={272} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 700, fontSize: 24}} fill={CYAN}>放大 250 倍，又是新的圆</text></g>
</g>;

/** the finished giant circle: every scene's emblem as one ring */
const Giant: React.FC<{T?: number}> = ({T = 0}) => {
	const fr = Array.from({length: 361}, (_, i) => { const a = i * Math.PI / 180, r = 440 + 12 * Math.sin(24 * a) + 6 * Math.sin(72 * a + 1) + 3 * Math.sin(216 * a); return `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`; }).join(' ');
	return <g>
		<circle r={520} fill={GOLD} opacity={0.07} filter="url(#gL)" />
		<G d={fr} w={1.6} col={CYAN} />
		{Array.from({length: 60}, (_, i) => <path key={i} transform={`rotate(${i * 6 + T * 4})`} d="M0,-425 L0,-400" stroke={SANDC[i % 5]} strokeWidth={22} opacity={0.85} />)}
		<G d={circ(398)} w={2} />
		<g opacity={0.8}><Solid k="cube" r={380} ax={0.6 + T * 0.3} ay={0.8 + T * 0.4} col={CYAN} w={1.4} /></g>
		<g transform={`rotate(${-T * 6})`}><path d={poly(10, 330, 0, 3)} fill="none" stroke="#2a9bb0" strokeWidth={5} /><path d={poly(10, 330, 0, 3)} fill="none" stroke={GOLD} strokeWidth={1.4} /></g>
		<G d={circ(262)} w={2.4} col={GOLD} /><G d={poly(4, 262, 45)} w={2} col={GOLD} />
		<g transform={`rotate(${T * 10})`}><G d={poly(5, 185, 0, 2)} w={2.6} col={VIOLET} /></g>
		<G d={circ(185)} w={1.6} col={VIOLET} />
		{[-1, 0, 1].map((r) => [-1, 0, 1].map((c) => <circle key={`${r}${c}`} cx={c * 46} cy={r * 46} r={9} fill={(r + c) % 2 ? INK : '#fff6dc'} stroke={GOLD} strokeWidth={2} />))}
		<G d={circ(95)} w={2} />
		<circle r={150} fill="url(#core)" opacity={0.55} />
	</g>;
};

/** the finale: emblems lie flat and stack up a pillar of light */
const Stack: React.FC = () => {
	const layers: [React.ReactNode, number][] = [[<Mandala key="m" s={1.1} />, 1], [<Kepler key="k" s={1.05} ellipse={0} />, 0.9], [<Vitruvian key="v" s={0.9} />, 0.8], [<Girih key="g" s={0.85} />, 0.7], [<Penta key="p" s={0.9} />, 0.6], [<Luoshu key="l" s={0.9} lines={false} />, 0.5]];
	return <g transform={`translate(${CX},770)`}>
		<rect x={-260} y={-1000} width={520} height={1000} fill="url(#pillarX)" opacity={0.55} mask="url(#pillarM)" />
		{layers.map(([el, sc], j) => <g key={j} transform={`translate(0,${-j * 120}) scale(${sc},${sc * 0.34}) rotate(${j * 17})`} opacity={1 - j * 0.08}>{el}</g>)}
		{[0, 1].map((r) => <ellipse key={r} rx={620 + r * 260} ry={(620 + r * 260) * 0.34} fill="none" stroke={r ? CYAN : GOLD} strokeWidth={6 - r * 3} opacity={0.6 - r * 0.3} />)}
		{Array.from({length: 160}, (_, i) => { const a = rnd(i, 6) * Math.PI * 2, rr = 100 + 420 * rnd(i, 7), up = rnd(i, 9) * 800; return <circle key={i} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr * 0.34 - up} r={1 + 2.4 * rnd(i, 8)} fill={i % 3 ? GOLD : CYAN} opacity={0.4 + 0.6 * rnd(i, 10)} />; })}
	</g>;
};

/* ---------------- the key frames ---------------- */
type KF = {sky: string; hor?: string; label?: [string, string]; nat?: string; zh?: string; rtl?: boolean; lat?: string; hero: React.ReactNode; front?: boolean; over?: React.ReactNode; title?: string};
const at = (el: React.ReactNode, s = 1, dx = 0, dy = 0) => <g transform={`translate(${CX + dx},${CY + dy}) scale(${s})`}>{el}</g>;
const FRAMES: KF[] = [
	{sky: 'open', hor: 'none', hero: at(<Giant T={0.4} />, 0.86, 0, 30), zh: '几千年来，人类一直在画同一个圆。', title: '冷开场 0:00'},
	{sky: 'kep', hor: 'kep', label: ['1596', '开普勒 · 格拉茨'], hero: at(<Kepler ellipse={0} />, 0.95), title: '倒带 0:05',
		over: <g><rect width={W} height={H} fill="#000" opacity={0.25} />{Array.from({length: 14}, (_, i) => <rect key={i} x={0} y={rnd(i, 30) * H} width={W} height={2 + 6 * rnd(i, 31)} fill="#fff" opacity={0.08 + 0.1 * rnd(i, 32)} />)}
			<text x={W - 120} y={190} textAnchor="end" style={{fontFamily: LAT, fontWeight: 900, fontSize: 150}} fill="#fff" opacity={0.95}>1596</text>
			<text x={W - 120} y={250} textAnchor="end" style={{fontFamily: SANS, fontWeight: 700, fontSize: 40}} fill={GOLD}>◀◀  1980 → 传说</text></g>},
	{sky: 'luo', hor: 'luo', label: ['传说', '大禹 · 洛水'], hero: at(<Luoshu />, 0.95), nat: '二九四，七五三，六一八。', lat: SANS, zh: '横、竖、斜，加起来都是十五。', title: '1 洛书'},
	{sky: 'gre', hor: 'gre', label: ['约公元前 500 年', '毕达哥拉斯学派'], hero: at(<Penta />, 0.92), nat: 'Ἆρα πάντα ἀριθμός;', lat: LATS, zh: '万物，都是数吗？', title: '2 毕达哥拉斯'},
	{sky: 'zhou', hor: 'zhou', label: ['约 1070 年', '周敦颐《太极图说》'], hero: at(<Taijitu />, 0.9, 0, -20), front: true, nat: '无极而太极。', lat: SANS, zh: '一个圆，从「无」里转出来。', title: '3 周敦颐'},
	{sky: 'isf', hor: 'isf', label: ['1453 年', '伊斯法罕 · 伊玛目礼拜堂'], hero: at(<Girih />, 0.95, -60, 0), nat: 'آیا می‌شود بی‌نهایت را روی دیوار کشید؟', rtl: true, zh: '能把「无限」画在墙上吗？', title: '4 伊斯法罕'},
	{sky: 'vin', hor: 'vin', label: ['约 1490 年', '达·芬奇 · 米兰'], hero: at(<Vitruvian />, 0.95, 0, 10), nat: "L'uomo sta nel cerchio, o nel quadrato?", lat: LATS, zh: '人，是在圆里，还是在方里？', title: '5 达·芬奇'},
	{sky: 'kep', hor: 'kep', label: ['1596 年', '开普勒 · 格拉茨'], hero: at(<Kepler ellipse={1} />, 0.95), nat: 'Hat Gott die Welt nach Geometrie gebaut?', lat: LATS, zh: '上帝，是照着几何造的世界吗？', title: '6 开普勒'},
	{sky: 'sand', hor: 'sand', label: ['延续至今', '藏地 · 沙坛城'], hero: at(<Mandala swept={0.42} />, 0.95), zh: '画了几周的阵，几秒钟就扫掉。', title: '7 沙坛城（静音）'},
	{sky: 'man', hor: 'man', label: ['1980 年', '曼德博 · IBM'], hero: at(<Mandel />, 0.8, -40, 0), nat: 'How long is the coast of Britain?', lat: LATS, zh: '一条海岸线，到底有多长？', title: '8 曼德博'},
	{sky: 'open', hor: 'none', hero: <Stack />, zh: '几千年来，人类一直在画同一个圆。', title: '叠阵 DROP 1:33'},
	{sky: 'open', hor: 'none', hero: <g opacity={0.45}>{at(<Giant T={1.2} />, 0.9, 0, 40)}</g>, title: '结尾 2:03',
		over: <g><text x={CX} y={470} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 76}} fill="#fff" stroke="#000" strokeWidth={8} paintOrder="stroke">如果你能画一个阵，</text>
			<text x={CX} y={580} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 76}} fill={GOLD} stroke="#000" strokeWidth={8} paintOrder="stroke">你会把什么画进去？</text>
			<text x={CX} y={680} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 700, fontSize: 34}} fill="#fff" opacity={0.8}>评论区画给我看</text></g>},
];

export const Circle40KF: React.FC = () => {
	const f = useCurrentFrame(), k = FRAMES[Math.min(FRAMES.length - 1, f)];
	return <AbsoluteFill style={{background: '#020104'}}>
		<svg width={W} height={H}>
			<defs>
				<filter id="gM" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7" /></filter>
				<filter id="gL" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40" /></filter>
				<filter id="gS" x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation="3" /></filter>
				<filter id="rew" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="10 0" /></filter>
				<radialGradient id="core"><stop offset="0" stopColor="#fff6dc" /><stop offset="0.25" stopColor={GOLD} stopOpacity="0.8" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></radialGradient>
				<linearGradient id="pillarX" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={GOLD} stopOpacity="0" /><stop offset="0.5" stopColor="#fff2c8" stopOpacity="0.9" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></linearGradient>
				<linearGradient id="pillarV" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#fff" /><stop offset="0.7" stopColor="#fff" stopOpacity="0.35" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
				<mask id="pillarM" maskUnits="userSpaceOnUse" x={-600} y={-1100} width={1200} height={1200}><rect x={-600} y={-1100} width={1200} height={1200} fill="url(#pillarV)" /></mask>
			</defs>
			<g filter={f === 1 ? 'url(#rew)' : undefined}>
				<Sky k={k.sky} />
				{!k.front && k.hero}
				{k.hor !== 'none' && <Horizon k={k.hor ?? ''} />}
				{k.front && k.hero}
			</g>
			{k.label && <Label year={k.label[0]} name={k.label[1]} />}
			{k.zh && <Subs nat={k.nat} zh={k.zh} rtl={k.rtl} lat={k.lat} />}
			{k.over}
			<text x={W - 40} y={H - 30} textAnchor="end" style={{fontFamily: SANS, fontSize: 22}} fill="#fff" opacity={0.35}>{k.title}</text>
		</svg>
	</AbsoluteFill>;
};
registerRoot(() => <Composition id="KF40" component={Circle40KF} durationInFrames={12} fps={30} width={W} height={H} />);
