import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {geoGraticule10, geoOrthographic, geoPath, geoInterpolate} from 'd3-geo';
import {feature} from 'topojson-client';
import land110 from 'world-atlas/land-110m.json';
import {Liquid} from '../../src/art/glow/Liquid';
import {AMBER, Ember, Finish, GlowDefs, Motes} from '../../src/art/glow/kit';
import {ADENOSINE, CAFFEINE} from '../../src/art/glow/molecules';
import {loadEpisodeFonts} from '../../src/lib/fonts';
import {font} from '../../src/lib/theme';
import {Forest, Shrub, ridge} from './look';
import {GlowBee, GlowFlower, leafD} from './scenes';

/**
 * 《续命》 v3 storyboard: one key frame per shot, in the section's colour, with the
 * camera move (white arrows) and the beat it lands on (♪) drawn over it.
 * Render: COMPOSITION=XumingBoard node scripts/stills.mjs xuming <dir> 0 1 2 ...
 */

const W = 1920;
const H = 1080;

// ---------------------------------------------------------------- annotation

const Arrow: React.FC<{d: string; label?: string; lx?: number; ly?: number}> = ({d, label, lx = 0, ly = 0}) => (
	<g>
		<defs>
			<marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
				<path d="M0,0 L10,5 L0,10 z" fill="#ffffff" />
			</marker>
		</defs>
		<path d={d} fill="none" stroke="#ffffff" strokeWidth={6} strokeDasharray="22 14" markerEnd="url(#ah)" opacity={0.92} />
		{label ? (
			<g>
				<rect x={lx - 8} y={ly - 40} width={label.length * 34 + 24} height={54} rx={10} fill="#000" opacity={0.6} />
				<text x={lx + 4} y={ly} style={{fontFamily: font.sans, fontWeight: 700, fontSize: 32, fill: '#ffffff'}}>
					{label}
				</text>
			</g>
		) : null}
	</g>
);

const Beat: React.FC<{x: number; y: number; label: string}> = ({x, y, label}) => (
	<g>
		<rect x={x - 10} y={y - 44} width={label.length * 34 + 76} height={60} rx={30} fill="#ff4d6d" opacity={0.92} />
		<text x={x + 10} y={y} style={{fontFamily: font.sans, fontWeight: 800, fontSize: 34, fill: '#fff'}}>
			♪ {label}
		</text>
	</g>
);

const Big: React.FC<{text: string; x?: number; y?: number; size?: number; fill?: string; anchor?: 'middle' | 'start' | 'end'}> = ({text, x = 960, y = 540, size = 120, fill = AMBER.gold, anchor = 'middle'}) => (
	<text x={x} y={y} textAnchor={anchor} style={{fontFamily: font.serif, fontWeight: 900, fontSize: size, fill}} filter="url(#g-sm)">
		{text}
	</text>
);

// ---------------------------------------------------------------- art helpers

const ELEM: Record<string, string> = {N: '#4a7dff', O: '#ff4a4a', C: '#2b2b30', H: '#e8e8e8'};
const elemOf = (label?: string) => (!label ? 'C' : label.startsWith('N') ? 'N' : label.startsWith('O') || label === 'HO' ? 'O' : 'C');

/** pseudo-3D ball-and-stick model of a Molecule's atoms */
const BallStick: React.FC<{mol: typeof CAFFEINE; tilt?: number; hl?: (id: string) => boolean; dim?: number}> = ({mol, tilt = 0.35, hl, dim = 1}) => {
	const pts = Object.entries(mol.atoms).map(([id, a]) => ({id, x: a.p[0], y: a.p[1] * (1 - tilt * 0.3), z: a.p[0] * tilt * 0.4, e: elemOf(a.label)}));
	const by = Object.fromEntries(pts.map((p) => [p.id, p]));
	return (
		<g>
			<defs>
				{Object.entries(ELEM).map(([e, c]) => (
					<radialGradient key={e} id={`ball-${e}`} cx="35%" cy="30%" r="70%">
						<stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
						<stop offset="0.25" stopColor={c} />
						<stop offset="1" stopColor="#000" />
					</radialGradient>
				))}
			</defs>
			{mol.bonds.map(([a, b], i) => (
				<line key={i} x1={by[a].x} y1={by[a].y} x2={by[b].x} y2={by[b].y} stroke="#c9ced8" strokeWidth={9} strokeLinecap="round" opacity={0.85 * dim} />
			))}
			{pts
				.slice()
				.sort((p, q) => p.z - q.z)
				.map((p) => {
					const on = hl ? hl(p.id) : true;
					return (
						<g key={p.id} opacity={on ? 1 : 0.28}>
							{hl && on ? <circle cx={p.x} cy={p.y} r={30} fill="#3fd0e0" opacity={0.35} filter="url(#g-md)" /> : null}
							<circle cx={p.x} cy={p.y} r={p.e === 'C' ? 17 : 19} fill={`url(#ball-${p.e})`} />
						</g>
					);
				})}
		</g>
	);
};

const CORE = new Set(['C5', 'C4', 'N3', 'C2', 'N1', 'C6', 'N9', 'C8', 'N7']);

/** a glowing neuron: soma and branching dendrites */
const Neuron: React.FC<{x: number; y: number; s?: number; color?: string; seed?: string}> = ({x, y, s = 1, color = '#3fd0e0', seed = 'n'}) => {
	const branches: React.ReactNode[] = [];
	const grow = (x0: number, y0: number, a: number, len: number, w: number, depth: number, key: string) => {
		if (depth > 5 || len < 14) return;
		const x1 = x0 + Math.cos(a) * len;
		const y1 = y0 + Math.sin(a) * len;
		branches.push(<line key={key} x1={x0} y1={y0} x2={x1} y2={y1} stroke={color} strokeWidth={w} strokeLinecap="round" />);
		const n = depth < 2 ? 2 : random(key) > 0.4 ? 2 : 1;
		for (let i = 0; i < n; i++) grow(x1, y1, a + (random(`${key}a${i}`) - 0.5) * 1.2, len * (0.62 + 0.2 * random(`${key}l${i}`)), w * 0.68, depth + 1, `${key}${i}`);
	};
	for (let k = 0; k < 7; k++) grow(0, 0, (k / 7) * Math.PI * 2 + random(`${seed}${k}`) * 0.5, 170, 12, 0, `${seed}${k}`);
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			<g filter="url(#g-md)" opacity={0.95}>
				{branches}
			</g>
			<circle r={70} fill={color} opacity={0.35} filter="url(#g-lg)" />
			<circle r={46} fill="#e8ffff" opacity={0.9} filter="url(#g-sm)" />
		</g>
	);
};

/** a keyhole-shaped receptor ("lock") */
const Lock: React.FC<{x: number; y: number; s?: number; color?: string; filled?: string}> = ({x, y, s = 1, color = '#3fd0e0', filled}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M-90,60 C-90,-40 -60,-110 0,-110 C60,-110 90,-40 90,60 Z" fill={color} opacity={0.14} />
		<path d="M-90,60 C-90,-40 -60,-110 0,-110 C60,-110 90,-40 90,60" fill="none" stroke={color} strokeWidth={6} filter="url(#g-sm)" />
		<circle cx={0} cy={-40} r={26} fill="#05040f" stroke={color} strokeWidth={4} />
		<path d="M-14,-24 L-22,30 L22,30 L14,-24 Z" fill="#05040f" stroke={color} strokeWidth={4} />
		{filled ? <circle cx={0} cy={-30} r={34} fill={filled} filter="url(#g-md)" /> : null}
	</g>
);

const Mol: React.FC<{x: number; y: number; r?: number; c: string}> = ({x, y, r = 16, c}) => (
	<g>
		<circle cx={x} cy={y} r={r * 1.8} fill={c} opacity={0.25} filter="url(#g-md)" />
		<circle cx={x - r * 0.5} cy={y} r={r} fill={c} />
		<circle cx={x + r * 0.6} cy={y - r * 0.3} r={r * 0.75} fill={c} opacity={0.85} />
	</g>
);

const Clock: React.FC<{x: number; y: number; r: number; h: number; m?: number; label?: string; color?: string}> = ({x, y, r, h, m = 0, label, color = AMBER.cream}) => {
	const ah = (((h % 12) + m / 60) / 12) * Math.PI * 2 - Math.PI / 2;
	const am = (m / 60) * Math.PI * 2 - Math.PI / 2;
	return (
		<g transform={`translate(${x},${y})`}>
			<circle r={r} fill="#000" opacity={0.35} />
			<circle r={r} fill="none" stroke={color} strokeWidth={5} />
			{Array.from({length: 12}, (_, i) => {
				const a = (i / 12) * Math.PI * 2;
				return <line key={i} x1={Math.cos(a) * r * 0.82} y1={Math.sin(a) * r * 0.82} x2={Math.cos(a) * r * 0.94} y2={Math.sin(a) * r * 0.94} stroke={color} strokeWidth={4} />;
			})}
			<line x1={0} y1={0} x2={Math.cos(ah) * r * 0.5} y2={Math.sin(ah) * r * 0.5} stroke={color} strokeWidth={10} strokeLinecap="round" />
			<line x1={0} y1={0} x2={Math.cos(am) * r * 0.75} y2={Math.sin(am) * r * 0.75} stroke={color} strokeWidth={6} strokeLinecap="round" />
			{label ? (
				<text y={r + 70} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 64, fill: color}}>
					{label}
				</text>
			) : null}
		</g>
	);
};

const Bean3D: React.FC<{x: number; y: number; r: number; c0: string; c1: string; rot?: number}> = ({x, y, r, c0, c1, rot = 0}) => {
	const id = `bean${Math.round(x)}${Math.round(y)}`;
	return (
		<g transform={`translate(${x},${y}) rotate(${rot})`}>
			<defs>
				<radialGradient id={id} cx="35%" cy="30%" r="80%">
					<stop offset="0" stopColor={c0} />
					<stop offset="1" stopColor={c1} />
				</radialGradient>
			</defs>
			<ellipse rx={r * 0.72} ry={r} fill={`url(#${id})`} />
			<path d={`M${-r * 0.05},${-r * 0.9} C${r * 0.28},${-r * 0.4} ${-r * 0.28},${r * 0.4} ${r * 0.05},${r * 0.9}`} fill="none" stroke="#000" strokeOpacity={0.45} strokeWidth={r * 0.08} />
		</g>
	);
};

// globe, real coastlines
const LAND = feature(land110 as never, (land110 as never as {objects: {land: never}}).objects.land) as never;
const Globe: React.FC<{rot: [number, number]; scale: number; cx?: number; cy?: number; routes?: [[number, number], [number, number]][]; points?: {p: [number, number]; n: string}[]}> = ({
	rot,
	scale,
	cx = 960,
	cy = 560,
	routes = [],
	points = [],
}) => {
	const proj = geoOrthographic().rotate([-rot[0], -rot[1]]).scale(scale).translate([cx, cy]).clipAngle(90);
	const path = geoPath(proj);
	return (
		<g>
			<circle cx={cx} cy={cy} r={scale * 1.06} fill="#2f6f9a" opacity={0.25} filter="url(#g-lg)" />
			<circle cx={cx} cy={cy} r={scale} fill="#071a30" />
			<path d={path(geoGraticule10()) ?? ''} fill="none" stroke="#2f6f9a" strokeWidth={1} opacity={0.4} />
			<path d={path(LAND) ?? ''} fill="#1c3f5c" stroke="#7fb8d8" strokeWidth={1.5} />
			{routes.map(([a, b], i) => {
				const ip = geoInterpolate(a, b);
				const line = {type: 'LineString' as const, coordinates: Array.from({length: 41}, (_, k) => ip(k / 40))};
				return <path key={i} d={path(line) ?? ''} fill="none" stroke="#ffd27a" strokeWidth={6} filter="url(#g-sm)" />;
			})}
			{points.map((q) => {
				const xy = proj(q.p);
				if (!xy) return null;
				return (
					<g key={q.n}>
						<Ember x={xy[0]} y={xy[1]} r={40} />
						<text x={xy[0] + 26} y={xy[1] - 16} style={{fontFamily: font.serif, fontWeight: 900, fontSize: 40, fill: '#fff4dc'}}>
							{q.n}
						</text>
					</g>
				);
			})}
			<circle cx={cx - scale * 0.35} cy={cy - scale * 0.4} r={scale * 0.9} fill="url(#globe-shine)" />
		</g>
	);
};

const Sky: React.FC<{c: string[]}> = ({c}) => (
	<g>
		<defs>
			<linearGradient id={`sky${c.join('')}`} x1="0" y1="0" x2="0" y2="1">
				{c.map((col, i) => (
					<stop key={i} offset={i / (c.length - 1)} stopColor={col} />
				))}
			</linearGradient>
		</defs>
		<rect width={W} height={H} fill={`url(#sky${c.join('')})`} />
	</g>
);

const Rays: React.FC<{x: number; y: number; n?: number; color?: string; o?: number}> = ({x, y, n = 7, color = '#ffe2a0', o = 0.18}) => (
	<g opacity={o} filter="url(#g-md)">
		{Array.from({length: n}, (_, i) => {
			const a = 1.15 + (i / (n - 1)) * 0.9;
			return <polygon key={i} points={`${x},${y} ${x + Math.cos(a - 0.05) * 1800},${y + Math.sin(a - 0.05) * 1800} ${x + Math.cos(a + 0.05) * 1800},${y + Math.sin(a + 0.05) * 1800}`} fill={color} />;
		})}
	</g>
);

// ---------------------------------------------------------------- the panels

type Panel = {liquid?: {light?: [number, number, number]; cool?: number; gain?: number; swirl?: number; cup?: number}; art: () => React.ReactNode};

const INDIGO = ['#05040f', '#120d3a', '#1d1650'];
const P: Panel[] = [
	// ---- A hook
	{liquid: {}, art: () => <Arrow d="M700,620 C900,600 1100,640 1300,600" label="缓慢漂移" lx={760} ly={720} />},
	{liquid: {gain: 0.9}, art: () => (
		<>
			<ellipse cx={960} cy={500} rx={780} ry={230} fill="#000" opacity={0.55} filter="url(#g-lg)" />
			<text x={960} y={560} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 168, fill: 'url(#gold-text)'}}>2,000,000,000</text>
			<Beat x={1300} y={760} label="数字停在重拍" />
		</>
	)},
	{liquid: {gain: 0.45}, art: () => (
		<>
			<g stroke="#2a6a4a" strokeWidth={1.5} opacity={0.6}>
				{Array.from({length: 33}, (_, i) => <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={H} />)}
				{Array.from({length: 19}, (_, i) => <line key={`h${i}`} x1={0} y1={i * 60} x2={W} y2={i * 60} />)}
			</g>
			<line x1={0} y1={560} x2={W} y2={560} stroke="#7dffb0" strokeWidth={6} filter="url(#g-md)" />
			<text x={1700} y={170} textAnchor="end" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 120, fill: '#7dffb0'}}>0</text>
			<text x={1710} y={170} style={{fontFamily: font.sans, fontSize: 32, fill: '#7dffb0'}}>BPM</text>
			<circle cx={960} cy={300} r={22} fill={AMBER.amber} filter="url(#g-sm)" />
			<Arrow d="M960,340 L960,520" label="一滴咖啡落下" lx={1000} ly={420} />
		</>
	)},
	{liquid: {gain: 0.85}, art: () => (
		<>
			<g stroke="#2a6a4a" strokeWidth={1.5} opacity={0.4}>
				{Array.from({length: 33}, (_, i) => <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={H} />)}
			</g>
			<circle cx={960} cy={560} r={420} fill="none" stroke={AMBER.gold} strokeWidth={8} opacity={0.6} filter="url(#g-md)" />
			<path d="M0,560 L760,560 L800,540 L840,560 L900,560 L930,600 L960,160 L995,700 L1020,560 L1100,560 L1150,520 L1200,560 L1920,560" fill="none" stroke="#7dffb0" strokeWidth={8} filter="url(#g-md)" />
			<text x={1700} y={170} textAnchor="end" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 120, fill: '#7dffb0'}}>72</text>
			<text x={1710} y={170} style={{fontFamily: font.sans, fontSize: 32, fill: '#7dffb0'}}>BPM</text>
			<Beat x={1060} y={260} label="重拍：心跳弹起，冲击波推开液态金" />
		</>
	)},
	{liquid: {cup: 380, swirl: 3}, art: () => <Arrow d="M260,240 L560,420 M1660,240 L1360,420" label="后拉：原来是一杯咖啡" lx={620} ly={140} />},
	{liquid: {cup: 380, swirl: 4}, art: () => (
		<>
			<text x={960} y={592} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 210, fill: 'url(#gold-text)', letterSpacing: '0.12em'}}>续命</text>
			<Beat x={1300} y={980} label="片名在重拍上聚出" />
		</>
	)},
	// ---- B brain
	{art: () => (
		<>
			<Sky c={INDIGO} />
			<Neuron x={960} y={560} s={2.2} />
			<Arrow d="M960,120 L960,380" label="穿过漩涡，俯冲进神经元（一镜到底）" lx={420} ly={110} />
		</>
	)},
	{art: () => (
		<>
			<Sky c={INDIGO} />
			<path d="M-40,300 C500,200 1400,200 1960,300 L1960,-40 L-40,-40 Z" fill="#3fd0e0" opacity={0.18} />
			<path d="M-40,300 C500,200 1400,200 1960,300" fill="none" stroke="#3fd0e0" strokeWidth={6} filter="url(#g-sm)" />
			<path d="M-40,860 C500,800 1400,800 1960,860 L1960,1200 L-40,1200 Z" fill="#3fd0e0" opacity={0.16} />
			{[480, 960, 1440].map((x) => <Lock key={x} x={x} y={790} s={1.6} />)}
			{Array.from({length: 22}, (_, i) => <Mol key={i} x={160 + random(`b2${i}`) * 1600} y={360 + random(`b2y${i}`) * 300} c="#ffb347" />)}
			<Clock x={1720} y={170} r={90} h={23} m={0} />
			<text x={1720} y={330} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 40, fill: AMBER.cream}}>08:00 → 23:00</text>
			<Arrow d="M300,620 L600,560" label="慢推" lx={140} ly={720} />
		</>
	)},
	{art: () => (
		<>
			<Sky c={INDIGO} />
			<path d="M-40,860 C500,800 1400,800 1960,860 L1960,1200 L-40,1200 Z" fill="#3fd0e0" opacity={0.12} />
			{[480, 960, 1440].map((x, i) => <Lock key={x} x={x} y={790} s={1.6} filled={i < 2 ? '#ffb347' : undefined} />)}
			<Mol x={1440} y={520} r={20} c="#ffb347" />
			<Arrow d="M1440,560 L1440,700" />
			<path d="M-40,-40 L1960,-40 L1960,260 C1400,420 520,420 -40,260 Z" fill="#000" opacity={0.85} filter="url(#g-lg)" />
			<path d="M-40,1120 L1960,1120 L1960,900 C1400,760 520,760 -40,900 Z" fill="#000" opacity={0.7} filter="url(#g-lg)" />
			<Beat x={1100} y={480} label="每卡进一个，世界暗一档" />
		</>
	)},
	{art: () => (
		<>
			<Sky c={INDIGO} />
			<g transform="translate(980,560) scale(3.1)">
				<BallStick mol={ADENOSINE} />
			</g>
			<Big text="腺苷" x={260} y={200} size={90} fill={AMBER.cream} anchor="start" />
			<Arrow d="M1700,160 L1500,320" label="推进 + 拉焦" lx={1480} ly={130} />
		</>
	)},
	{art: () => (
		<>
			<Sky c={INDIGO} />
			<g transform="translate(980,560) scale(3.1)">
				<BallStick mol={ADENOSINE} hl={(id) => CORE.has(id)} dim={0.6} />
			</g>
			<g transform="translate(1000,540) scale(3.1)" opacity={0.65}>
				<BallStick mol={CAFFEINE} hl={(id) => CORE.has(id)} />
			</g>
			<Big text="同一个骨架" x={960} y={170} size={96} fill="#3fd0e0" />
			<Beat x={1300} y={980} label="相同的原子逐个亮青色" />
		</>
	)},
	{art: () => (
		<>
			<Sky c={INDIGO} />
			<path d="M-40,860 C500,800 1400,800 1960,860 L1960,1200 L-40,1200 Z" fill="#f4c46a" opacity={0.12} />
			{[480, 960, 1440].map((x) => <Lock key={x} x={x} y={790} s={1.6} color="#f4c46a" filled="#f4c46a" />)}
			{[480, 960, 1440].map((x) => <circle key={x} cx={x} cy={760} r={230} fill="none" stroke="#f4c46a" strokeWidth={5} opacity={0.6} />)}
			<Mol x={760} y={380} c="#ffb347" r={22} />
			<Arrow d="M700,560 C680,480 720,430 760,410" label="被弹开" lx={520} ly={360} />
			<Beat x={1150} y={260} label="每锁一拍" />
		</>
	)},
	{art: () => (
		<>
			<Sky c={['#07061a', '#1b1745', '#2a2460']} />
			{[480, 960, 1440].map((x) => <Lock key={x} x={x} y={790} s={1.6} color="#f4c46a" filled="#f4c46a" />)}
			{Array.from({length: 60}, (_, i) => <Mol key={i} x={100 + random(`b6${i}`) * 1720} y={330 + random(`b6y${i}`) * 260} c="#ffb347" r={13} />)}
			<Arrow d="M300,980 L1600,980" label="横移" lx={820} ly={940} />
		</>
	)},
	{art: () => (
		<>
			<Sky c={INDIGO} />
			<circle cx={960} cy={540} r={520} fill="#ffb347" opacity={0.22} filter="url(#g-lg)" />
			<ellipse cx={960} cy={520} rx={430} ry={330} fill="#140f3a" stroke="#f4c46a" strokeWidth={6} filter="url(#g-sm)" />
			<path d="M960,200 C930,360 990,600 960,850" stroke="#f4c46a" strokeWidth={5} fill="none" />
			{Array.from({length: 14}, (_, i) => {
				const a = (i / 14) * Math.PI * 2;
				return <path key={i} d={`M${960 + Math.cos(a) * 80},${520 + Math.sin(a) * 60} Q${960 + Math.cos(a + 0.4) * 250},${520 + Math.sin(a + 0.4) * 190} ${960 + Math.cos(a) * 400},${520 + Math.sin(a) * 300}`} stroke="#f4c46a" strokeWidth={4} fill="none" opacity={0.8} filter="url(#g-sm)" />;
			})}
			<text x={260} y={190} style={{fontFamily: font.serif, fontWeight: 900, fontSize: 58, fill: '#ffb347'}}>疲惫雾：被挡在外面</text>
			<Arrow d="M960,470 L960,330" label="一路后拉 → 神经分叉匹配成树枝" lx={560} ly={1010} />
		</>
	)},
	// ---- C origin
	{art: () => (
		<>
			<Sky c={['#04140e', '#0f3d2a', '#7fbf6a']} />
			<Neuron x={960} y={430} s={2.4} color="#ffd890" seed="tree" />
			<rect x={950} y={430} width={20} height={700} fill="#06100a" />
			<path d={ridge('cg', 980, 60, 1.2)} fill="#04100a" />
			<text x={960} y={140} textAnchor="middle" style={{fontFamily: font.sans, fontWeight: 700, fontSize: 40, fill: '#fff'}}>匹配剪辑：神经元的分叉 = 咖啡树的枝杈</text>
		</>
	)},
	{art: () => (
		<>
			<Sky c={['#04140e', '#1d5a3a', '#b9d88a']} />
			<Rays x={1250} y={-80} n={9} o={0.22} />
			<Forest f={60} />
			<rect width={W} height={H} fill="#0f3d2a" opacity={0.35} style={{mixBlendMode: 'color'}} />
			<Big text="60 万年前" x={960} y={360} size={140} fill="#ffe7b0" />
			<Arrow d="M960,860 L960,700" label="五层视差前推" lx={1000} ly={790} />
			<Beat x={1260} y={240} label="大字落在重拍" />
		</>
	)},
	{art: () => (
		<>
			<Sky c={['#04140e', '#0f3d2a', '#3c7a4a']} />
			<g transform="translate(380,560) scale(1.5)">
				<GlowFlower open={1} f={0} />
			</g>
			<g transform="translate(1540,560) scale(1.5)">
				<GlowFlower open={1} f={30} />
			</g>
			<text x={380} y={920} textAnchor="middle" style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 44, fill: '#fff4dc'}}>C. eugenioides</text>
			<text x={1540} y={920} textAnchor="middle" style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 44, fill: '#fff4dc'}}>C. canephora</text>
			<Ember x={960} y={460} r={60} />
			<Arrow d="M520,480 C700,380 900,420 1380,500" label="横移跟着一颗花粉" lx={700} ly={300} />
		</>
	)},
	{art: () => (
		<>
			<Sky c={['#04140e', '#0b2a1e']} />
			{Array.from({length: 44}, (_, i) => {
				const x = 300 + (i % 11) * 132;
				const y = 330 + Math.floor(i / 11) * 140;
				const c = i < 22 ? '#7fd4d8' : '#f4c46a';
				const h = 90 - (i % 11) * 5;
				return (
					<g key={i} transform={`translate(${x},${y})`} stroke={c} strokeWidth={14} strokeLinecap="round" filter="url(#g-sm)">
						<line x1={-12} y1={-h / 2} x2={12} y2={h / 2} />
						<line x1={12} y1={-h / 2} x2={-12} y2={h / 2} />
					</g>
				);
			})}
			<Big text="22 + 22 = 44" x={960} y={190} size={110} />
			<Beat x={1250} y={1010} label="染色体按拍落位" />
		</>
	)},
	// ---- D defense
	{art: () => (
		<>
			<Sky c={['#07120a', '#163a16', '#07120a']} />
			<circle cx={960} cy={540} r={700} fill="#b8e07a" opacity={0.25} filter="url(#g-lg)" />
			<g transform="translate(120,560) rotate(-6)">
				<path d={leafD(1700, 0.28)} fill="#5c9a2a" opacity={0.85} />
				<path d="M0,0 L1700,0" stroke="#f4ffc0" strokeWidth={8} filter="url(#g-sm)" />
				{Array.from({length: 10}, (_, i) => {
					const x = 140 + i * 145;
					return (
						<g key={i} stroke="#f4ffc0" strokeWidth={4} fill="none" filter="url(#g-sm)">
							<path d={`M${x},0 Q${x + 120},-80 ${x + 200},-200`} />
							<path d={`M${x},0 Q${x + 120},80 ${x + 200},200`} />
						</g>
					);
				})}
				{[300, 700, 1100].map((x) => (
					<g key={x} transform={`translate(${x},-6) scale(0.9)`}>
						<BallStick mol={CAFFEINE} />
					</g>
				))}
			</g>
			<Big text="防身术" x={1500} y={220} size={120} fill="#fff4c0" />
			<Arrow d="M300,900 L1500,900" label="沿叶脉平移" lx={760} ly={1000} />
		</>
	)},
	{art: () => (
		<>
			<Sky c={['#07120a', '#163a16']} />
			<g transform="translate(-200,700) rotate(-4)">
				<path d={leafD(2400, 0.22)} fill="#4a8a22" />
			</g>
			{Array.from({length: 9}, (_, i) => (
				<circle key={i} cx={760 + i * 70} cy={470 + Math.sin(i) * 12} r={i === 0 ? 46 : 40} fill="#1a1208" stroke="#ff4d3a" strokeWidth={3} />
			))}
			<path d="M760,470 L1320,470" stroke="#ff4d3a" strokeWidth={8} filter="url(#g-md)" strokeDasharray="30 10" />
			{Array.from({length: 10}, (_, i) => {
				const a = (i / 10) * Math.PI * 2;
				return <line key={i} x1={760 + Math.cos(a) * 60} y1={470 + Math.sin(a) * 60} x2={760 + Math.cos(a) * 120} y2={470 + Math.sin(a) * 120} stroke="#ff4d3a" strokeWidth={6} />;
			})}
			<text x={1150} y={330} style={{fontFamily: font.serif, fontWeight: 900, fontSize: 56, fill: '#ff8a7a'}}>X 光：神经乱闪</text>
			<Arrow d="M1400,520 C1500,640 1520,800 1540,1000" label="抽搐、掉出画面" lx={1450} ly={760} />
		</>
	)},
	{art: () => (
		<>
			<Sky c={['#1a2a14', '#0c140a']} />
			<rect y={360} width={W} height={720} fill="#3a2414" />
			<rect y={360} width={W} height={720} filter="url(#stone)" opacity={0.25} />
			<path d="M0,360 L1920,360" stroke="#ffd890" strokeWidth={4} />
			{[480, 960, 1440].map((x, i) => (
				<g key={x}>
					<ellipse cx={x} cy={720} rx={70} ry={46} fill="#7a5a30" stroke="#ffd890" strokeWidth={4} />
					<path d={`M${x},680 Q${x + 20},${600 - i * 10} ${x + (i === 1 ? 60 : 10)},${i === 1 ? 600 : 560}`} stroke={i === 1 ? '#8a7a40' : '#9cc46a'} strokeWidth={10} fill="none" strokeLinecap="round" />
				</g>
			))}
			{Array.from({length: 40}, (_, i) => <circle key={i} cx={300 + random(`sx${i}`) * 1320} cy={380 + random(`sy${i}`) * 250} r={7} fill="#f4c46a" filter="url(#g-sm)" />)}
			{[300, 900, 1500].map((x, i) => <path key={i} d={leafD(200, 0.3)} transform={`translate(${x},350) rotate(${170 + i * 6})`} fill="#3a5a1e" />)}
			<Arrow d="M1780,120 L1780,330" label="下摇" lx={1560} ly={90} />
		</>
	)},
	{art: () => (
		<>
			<Sky c={['#0b0806', '#1a120a']} />
			{[
				['茶', '中国', '#7fbf6a', 320],
				['可可', '美洲', '#c8803a', 960],
				['咖啡', '非洲', '#d5452e', 1600],
			].map(([n, r, c, x]) => (
				<g key={n as string}>
					<rect x={(x as number) - 290} y={140} width={580} height={600} rx={20} fill={c as string} opacity={0.14} stroke={c as string} strokeWidth={4} />
					<text x={x as number} y={690} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 80, fill: c as string}}>{n}</text>
					<text x={x as number} y={240} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 36, fill: AMBER.cream}}>{r}</text>
					<circle cx={x as number} cy={440} r={130} fill={c as string} opacity={0.5} filter="url(#g-md)" />
				</g>
			))}
			<g transform="translate(960,900) scale(1.4)">
				<BallStick mol={CAFFEINE} />
			</g>
			<Beat x={1250} y={1040} label="三格依次亮" />
		</>
	)},
	// ---- E bloom (daylight)
	{art: () => (
		<>
			<Sky c={['#9fd0ec', '#e8f4f8', '#ffffff']} />
			<path d={ridge('e1', 760, 260, 0.7)} fill="#6a9a5a" />
			<path d={ridge('e2', 900, 220, 1)} fill="#4a7a3a" />
			{Array.from({length: 260}, (_, i) => {
				const x = random(`fx${i}`) * W;
				const y = 560 + random(`fy${i}`) * 520;
				return x < 1200 ? <circle key={i} cx={x} cy={y} r={8 + random(`fr${i}`) * 10} fill="#ffffff" opacity={0.95} /> : null;
			})}
			<path d="M1200,1080 C1250,800 1300,650 1360,520" stroke="#ffffff" strokeWidth={14} strokeDasharray="4 18" strokeLinecap="round" />
			<text x={1260} y={460} style={{fontFamily: font.sans, fontWeight: 800, fontSize: 40, fill: '#2a4a2a'}}>花浪从山脚涌到山顶 →</text>
			<Beat x={140} y={170} label="硬切：全片最亮的一拍" />
			<Arrow d="M960,1040 L960,820" label="航拍前推 + 抬升" lx={1000} ly={960} />
		</>
	)},
	{art: () => (
		<>
			<Sky c={['#cfe6f2', '#f8f6ee']} />
			<circle cx={960} cy={540} r={380} fill="#fff" opacity={0.6} filter="url(#g-lg)" />
			<g transform="translate(960,540) scale(2.4)">
				<GlowFlower open={1} f={10} />
			</g>
			<circle cx={960} cy={540} r={44} fill="#ffd27a" filter="url(#g-md)" />
			<g transform="translate(1180,360) scale(0.8)">
				<BallStick mol={CAFFEINE} />
			</g>
			<Arrow d="M260,140 C500,300 700,420 880,500" label="俯冲穿过花枝到花芯（一镜到底）" lx={120} ly={110} />
		</>
	)},
	{art: () => (
		<>
			<Sky c={['#cfe6f2', '#f8f6ee']} />
			<Clock x={520} y={500} r={260} h={9} m={0} label="24 h" color="#2a3a4a" />
			<g transform="translate(1320,480) scale(3)">
				<GlowBee f={3} />
			</g>
			<Arrow d="M820,500 C1000,380 1100,380 1200,420" label="侧跟蜜蜂" lx={860} ly={300} />
		</>
	)},
	{art: () => (
		<>
			<Sky c={['#cfe6f2', '#f8f6ee']} />
			<g transform="translate(1500,600) scale(1.6)">
				<GlowFlower open={1} f={0} />
			</g>
			{[0, 1, 2].map((i) => (
				<g key={i}>
					<path d={`M${100 + i * 40},${220 + i * 140} C700,${200 + i * 160} 1100,${380 + i * 80} 1440,${560 + i * 30}`} stroke="#f4b43a" strokeWidth={8} fill="none" />
					<g transform={`translate(${1240 + i * 60},${520 + i * 50}) scale(1.4)`}>
						<GlowBee f={i} />
					</g>
				</g>
			))}
			<path d="M300,880 C400,780 520,980 620,860 C700,760 560,700 480,800" stroke="#8a9aaa" strokeWidth={5} fill="none" strokeDasharray="12 10" />
			<text x={330} y={1000} style={{fontFamily: font.sans, fontSize: 36, fill: '#4a5a6a'}}>普通蜜蜂：迷路</text>
			<Big text="×3" x={960} y={300} size={220} fill="#e0902e" />
			<Beat x={1100} y={1010} label="三只依次落花，×3 落在第三拍" />
		</>
	)},
	{art: () => (
		<>
			<Sky c={['#0a1240', '#3a5aa0', '#cfe6f2']} />
			{Array.from({length: 70}, (_, i) => {
				const y = random(`py${i}`) * 1000;
				const star = y < 420;
				return star ? <circle key={i} cx={random(`px${i}`) * W} cy={y} r={4} fill="#fff" filter="url(#g-sm)" /> : <ellipse key={i} cx={random(`px${i}`) * W} cy={y} rx={14} ry={8} fill="#fff" transform={`rotate(${i * 37},${random(`px${i}`) * W},${y})`} />;
			})}
			<text x={960} y={560} textAnchor="middle" style={{fontFamily: font.sans, fontWeight: 800, fontSize: 44, fill: '#fff'}}>花瓣飘起 → 变成星星</text>
			<Arrow d="M1700,900 L1700,400" label="镜头上升" lx={1440} ly={980} />
		</>
	)},
	// ---- F journey
	{art: () => (
		<>
			<Sky c={['#050a24', '#16246a', '#3a3060']} />
			{Array.from({length: 80}, (_, i) => <circle key={i} cx={random(`st${i}`) * W} cy={random(`sty${i}`) * 500} r={2 + random(`sr${i}`) * 3} fill="#fff" />)}
			<path d={ridge('ym', 760, 200, 0.8)} fill="#0a0c20" />
			{Array.from({length: 9}, (_, i) => (
				<g key={i}>
					<rect x={200 + i * 170} y={640 - (i % 3) * 60} width={90} height={260 + (i % 3) * 60} fill="#07081a" />
					{[0, 1, 2].map((k) => <rect key={k} x={220 + i * 170} y={680 - (i % 3) * 60 + k * 70} width={22} height={30} fill="#ff9a3c" filter="url(#g-sm)" />)}
				</g>
			))}
			<rect y={900} width={W} height={180} fill="#081030" />
			<path d="M1500,900 L1680,900 L1650,940 L1520,940 Z M1590,900 L1590,760 L1660,880 Z" fill="#05060f" />
			<text x={140} y={150} style={{fontFamily: font.serif, fontWeight: 900, fontSize: 64, fill: '#ffe0a0'}}>摩卡港 · 夜</text>
			<Arrow d="M960,120 L960,380" label="从星空下降到港口" lx={1000} ly={240} />
		</>
	)},
	{art: () => (
		<>
			<Sky c={['#1a0a04', '#3a1608']} />
			<circle cx={560} cy={760} r={260} fill="#ff7a1e" opacity={0.4} filter="url(#g-lg)" />
			<Bean3D x={560} y={560} r={150} c0="#4a3020" c1="#0a0503" rot={20} />
			<path d="M1140,820 L1740,820 L1700,380 C1660,330 1220,330 1180,380 Z" fill="#c8a070" />
			<circle cx={1440} cy={600} r={150} fill="none" stroke="#a8200c" strokeWidth={22} />
			<text x={1440} y={630} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 90, fill: '#a8200c'}}>禁</text>
			<text x={560} y={940} textAnchor="middle" style={{fontFamily: font.sans, fontWeight: 700, fontSize: 40, fill: '#ffd0a0'}}>烘过 → 种不活</text>
			<Beat x={1150} y={180} label="印章落在拍上" />
		</>
	)},
	{art: () => (
		<>
			<Sky c={['#020814', '#0c2440']} />
			<Globe rot={[60, 15]} scale={440} cx={1180} cy={600} routes={[[[43.25, 13.3], [75.7, 13.4]]]} points={[{p: [43.25, 13.3], n: '摩卡'}, {p: [75.7, 13.4], n: '印度'}]} />
			{Array.from({length: 7}, (_, i) => (
				<g key={i} transform={`translate(${120 + i * 70},240)`}>
					<Bean3D x={0} y={0} r={28} c0="#d6f0a0" c1="#6a8a3a" rot={i * 20} />
					<circle r={44} fill="#ffd27a" opacity={0.3} filter="url(#g-md)" />
				</g>
			))}
			<text x={120} y={150} style={{fontFamily: font.serif, fontWeight: 900, fontSize: 52, fill: '#ffe0a0'}}>七颗生豆 · 1670（传说）</text>
			<Beat x={120} y={360} label="七颗豆，一颗一个音符" />
			<Arrow d="M500,700 C640,640 760,620 900,620" label="拉起成地球" lx={300} ly={820} />
		</>
	)},
	{art: () => (
		<>
			<Sky c={['#020814', '#0c2440']} />
			<Globe
				rot={[-30, 20]}
				scale={470}
				cx={1000}
				cy={580}
				routes={[
					[[4.9, 52.4], [2.35, 48.85]],
					[[2.35, 48.85], [-61.0, 14.6]],
					[[-61.0, 14.6], [-75, 5]],
					[[-61.0, 14.6], [-47, -15]],
					[[-61.0, 14.6], [-90, 15]],
				]}
				points={[{p: [2.35, 48.85], n: '巴黎'}, {p: [-61.0, 14.6], n: '马提尼克'}]}
			/>
			<text x={120} y={150} style={{fontFamily: font.serif, fontWeight: 900, fontSize: 52, fill: '#ffe0a0'}}>一棵树 → 半个美洲</text>
			<Arrow d="M1700,300 C1600,240 1480,230 1380,260" label="地球转 + 越拉越远" lx={1320} ly={170} />
		</>
	)},
	// ---- G roast
	{art: () => (
		<>
			<Sky c={['#0c1a10', '#1e3a22']} />
			{Array.from({length: 26}, (_, i) => (
				<Bean3D key={i} x={160 + (i % 9) * 200 + (Math.floor(i / 9) % 2) * 100} y={420 + Math.floor(i / 9) * 210} r={110} c0="#cfe8a8" c1="#5a7a3a" rot={i * 33} />
			))}
			{Array.from({length: 10}, (_, i) => <path key={i} d={leafD(70, 0.3)} transform={`translate(${200 + i * 170},${200 - (i % 3) * 40}) rotate(-80)`} fill="#b8e07a" opacity={0.7} filter="url(#g-sm)" />)}
			<text x={140} y={140} style={{fontFamily: font.serif, fontWeight: 900, fontSize: 56, fill: '#e6ffc0'}}>生豆 · 闻起来像青草</text>
			<Arrow d="M300,1000 L1600,1000" label="从地球推进云南 → 微距平移" lx={600} ly={960} />
		</>
	)},
	{art: () => (
		<>
			<Sky c={['#080302', '#2a0a04']} />
			<circle cx={760} cy={600} r={380} fill="#120806" stroke="#8a8a8a" strokeWidth={18} />
			{Array.from({length: 22}, (_, i) => {
				const a = random(`dr${i}`) * Math.PI + 0.2;
				const r = 120 + random(`drr${i}`) * 210;
				return <Bean3D key={i} x={760 + Math.cos(a) * r} y={600 + Math.sin(a) * r * 0.9} r={44} c0="#c88a3a" c1="#5a3015" rot={i * 47} />;
			})}
			{Array.from({length: 9}, (_, i) => <path key={i} d={`M${520 + i * 60},1080 Q${540 + i * 60},${1000 - (i % 3) * 30} ${520 + i * 60},${960 - (i % 2) * 40}`} stroke="#ff8a1e" strokeWidth={30} fill="none" filter="url(#g-md)" />)}
			<text x={1560} y={600} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 230, fill: '#ff8a1e'}} filter="url(#g-sm)">196°</text>
			<Arrow d="M300,260 C500,120 1000,120 1200,260" label="绕滚筒环绕" lx={480} ly={110} />
		</>
	)},
	{art: () => (
		<>
			<Sky c={['#080302', '#3a0e04']} />
			<circle cx={960} cy={540} r={520} fill="#ff8a1e" opacity={0.45} filter="url(#g-lg)" />
			<g transform="translate(960,560) scale(3.2)">
				<Bean3D x={-18} y={0} r={110} c0="#a8602a" c1="#3a1808" rot={-8} />
			</g>
			{Array.from({length: 22}, (_, i) => {
				const a = (i / 22) * Math.PI * 2;
				return <line key={i} x1={960 + Math.cos(a) * 420} y1={560 + Math.sin(a) * 420} x2={960 + Math.cos(a) * 620} y2={560 + Math.sin(a) * 620} stroke="#ffd27a" strokeWidth={10} strokeLinecap="round" />;
			})}
			<Big text="啪" x={1650} y={300} size={200} fill="#fff1d0" />
			<Beat x={140} y={980} label="慢动作爆裂 + 震动，落在重拍" />
		</>
	)},
	{art: () => (
		<>
			<Sky c={['#05020a', '#120818']} />
			{Array.from({length: 300}, (_, i) => {
				const a = random(`ne${i}`) * Math.PI * 2;
				const r = 60 + random(`ner${i}`) * 820;
				const c = ['#ffb347', '#a0602a', '#ff4d6d', '#c070ff', '#6a3a1a', '#ffd27a'][i % 6];
				return <circle key={i} cx={960 + Math.cos(a) * r * 1.2} cy={540 + Math.sin(a) * r * 0.7} r={4 + random(`nes${i}`) * 9} fill={c} opacity={0.85} />;
			})}
			<text x={960} y={590} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 200, fill: 'url(#gold-text)'}}>1,000+</text>
			{[
				['焦糖', '#ffb347', 380, 300],
				['坚果', '#c88a5a', 1500, 280],
				['莓果', '#ff4d6d', 1560, 800],
				['花香', '#c070ff', 360, 820],
				['巧克力', '#a0603a', 960, 200],
			].map(([t, c, x, y]) => (
				<text key={t as string} x={x as number} y={y as number} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 60, fill: c as string}}>
					{t}
				</text>
			))}
			<Beat x={140} y={1010} label="香气星云爆开" />
			<Arrow d="M960,700 L960,980" label="推进到蜂窝细胞 → 爆开时急速后拉" lx={1000} ly={1040} />
		</>
	)},
	// ---- H body
	{art: () => (
		<>
			<Sky c={['#0a0a20', '#2a1a40']} />
			<rect x={1100} y={160} width={640} height={560} fill="#0a1030" stroke="#c9ced8" strokeWidth={10} />
			<circle cx={1600} cy={300} r={50} fill="#f4f0e0" />
			<Clock x={540} y={460} r={300} h={0} m={0} color="#ffd27a" />
			<text x={540} y={880} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 70, fill: '#ffd27a'}}>15:00 → 24:00</text>
			<path d="M1260,980 L1300,760 L1540,760 L1580,980 Z" fill="none" stroke="#fff" strokeWidth={6} />
			<path d="M1290,980 L1300,920 L1540,920 L1560,980 Z" fill="#6a3a14" />
			<text x={1420} y={1050} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 48, fill: '#ffd27a'}}>还剩 ≈ 1/3</text>
			<Arrow d="M300,1000 L420,900" label="慢推" lx={140} ly={1050} />
		</>
	)},
	{art: () => (
		<>
			<Sky c={['#12030a', '#3a0a1e']} />
			<line x1={960} y1={60} x2={960} y2={1020} stroke="#fff" strokeWidth={4} opacity={0.5} />
			{[480, 1440].map((cx, s) => (
				<g key={cx}>
					{Array.from({length: 40}, (_, i) => {
						const y = 150 + i * 18;
						const x1 = cx + Math.sin(i * 0.45) * 160;
						const x2 = cx - Math.sin(i * 0.45) * 160;
						return (
							<g key={i}>
								<circle cx={x1} cy={y} r={9} fill="#ff6a7a" />
								<circle cx={x2} cy={y} r={9} fill="#7fd4d8" />
								{i % 2 ? <line x1={x1} y1={y} x2={x2} y2={y} stroke="#fff" strokeWidth={3} opacity={0.5} /> : null}
							</g>
						);
					})}
					{Array.from({length: s ? 30 : 6}, (_, i) => <circle key={i} cx={cx - 300 + random(`dn${s}${i}`) * 600} cy={200 + random(`dny${s}${i}`) * 700} r={10} fill="#ffd27a" filter="url(#g-sm)" />)}
					<text x={cx} y={1000} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 60, fill: s ? '#ffd27a' : '#e8e8e8'}}>{s ? '慢：失眠到天亮' : '快：倒头就睡'}</text>
				</g>
			))}
			<Arrow d="M200,90 L700,90 M1220,90 L1720,90" label="两边同步横移" lx={760} ly={60} />
		</>
	)},
	{art: () => (
		<>
			<Sky c={INDIGO} />
			{Array.from({length: 12}, (_, i) => <Lock key={i} x={200 + (i % 6) * 304} y={430 + Math.floor(i / 6) * 330} s={0.9} filled={i < 4 ? '#f4c46a' : undefined} />)}
			<text x={960} y={140} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 80, fill: '#3fd0e0'}}>3 → 6 → 12 把锁</text>
			<Beat x={1250} y={1040} label="每多一批锁一拍" />
			<Arrow d="M1840,980 L1700,880" label="后拉" lx={1600} ly={1050} />
		</>
	)},
	// ---- I coda
	{art: () => (
		<>
			<Sky c={['#2a1408', '#e8945a', '#ffd7b0']} />
			<rect x={260} y={80} width={1400} height={620} fill="#ffe8c8" opacity={0.35} stroke="#5a3418" strokeWidth={16} />
			<line x1={960} y1={80} x2={960} y2={700} stroke="#5a3418" strokeWidth={14} />
			<rect y={760} width={W} height={320} fill="#4a2a14" />
			<path d="M800,940 L1120,940 L1100,740 L820,740 Z" fill="#f6ead2" />
			<ellipse cx={960} cy={742} rx={140} ry={18} fill="#3a1f0e" />
			<path d="M1120,800 C1200,800 1200,880 1110,890" stroke="#f6ead2" strokeWidth={18} fill="none" />
			<g opacity={0.55} transform="translate(960,620) scale(0.6)">
				<Shrub f={0} glow={0.4} />
			</g>
			{[900, 960, 1020].map((x) => <path key={x} d={`M${x},720 C${x - 30},640 ${x + 30},560 ${x},460`} stroke="#fff" strokeWidth={10} fill="none" opacity={0.4} filter="url(#g-md)" />)}
			<text x={960} y={150} textAnchor="middle" style={{fontFamily: font.sans, fontWeight: 700, fontSize: 40, fill: '#3a1f0e'}}>锁的圆 → 杯口（匹配剪辑）· 热气里浮现森林</text>
			<Arrow d="M300,1000 C700,1060 1200,1060 1620,1000" label="缓慢环绕杯子" lx={720} ly={1060} />
		</>
	)},
	{art: () => (
		<>
			<Sky c={['#2a1408', '#e8945a', '#ffd7b0']} />
			<rect y={760} width={W} height={320} fill="#4a2a14" />
			<path d="M800,940 L1120,940 L1100,740 L820,740 Z" fill="#f6ead2" />
			<g transform="translate(960,420) scale(1.2)" opacity={0.7}>
				<GlowFlower open={1} f={0} />
			</g>
			{Array.from({length: 7}, (_, i) => (
				<g key={i} transform={`translate(${660 + i * 100},680)`}>
					<Bean3D x={0} y={0} r={26} c0="#ffe0a0" c1="#c08030" rot={i * 20} />
				</g>
			))}
			<text x={960} y={150} textAnchor="middle" style={{fontFamily: font.sans, fontWeight: 700, fontSize: 40, fill: '#3a1f0e'}}>热气里：花海 → 七颗金豆</text>
		</>
	)},
	{art: () => (
		<>
			<Sky c={['#e8945a', '#ffd7b0', '#fff6e8']} />
			<circle cx={1500} cy={260} r={300} fill="#fff" opacity={0.8} filter="url(#g-lg)" />
			<Rays x={1500} y={260} n={8} color="#fff" o={0.35} />
			<rect y={760} width={W} height={320} fill="#6a3a1a" />
			<path d="M800,940 L1120,940 L1100,740 L820,740 Z" fill="#fff8ec" />
			<Big text="早安。" x={960} y={560} size={130} fill="#5a2a0a" />
			<Beat x={140} y={180} label="阳光照到杯子，泛起光晕" />
		</>
	)},
];

export const BOARD_N = P.length;

export const XumingBoard: React.FC = () => {
	loadEpisodeFonts('xuming');
	const i = useCurrentFrame();
	const p = P[i] ?? P[0];
	const L = p.liquid;
	return (
		<AbsoluteFill style={{background: AMBER.ink}}>
			{L ? (
				L.cup ? (
					<div style={{position: 'absolute', left: 960 - L.cup, top: 540 - L.cup, width: L.cup * 2, height: L.cup * 2, borderRadius: '50%', overflow: 'hidden'}}>
						<div style={{position: 'absolute', left: L.cup - 960, top: L.cup - 540, width: W, height: H}}>
							<Liquid t={12} swirl={L.swirl ?? 0} scale={3.2} light={[0.5, 0.42, 0.5]} gain={L.gain ?? 1.1} />
						</div>
					</div>
				) : (
					<Liquid t={12 + i} light={L.light ?? [0.66, 0.36, 0.55]} gain={L.gain ?? 1} cool={L.cool ?? 0} />
				)
			) : null}
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
				<GlowDefs />
				<defs>
					<radialGradient id="globe-shine" cx="50%" cy="50%" r="50%">
						<stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
						<stop offset="1" stopColor="#ffffff" stopOpacity="0" />
					</radialGradient>
					<radialGradient id="ember-red" cx="50%" cy="50%" r="50%">
						<stop offset="0" stopColor="#ffb08a" />
						<stop offset="0.35" stopColor="#d5452e" />
						<stop offset="1" stopColor="#d5452e" stopOpacity="0" />
					</radialGradient>
				</defs>
				{L?.cup ? (
					<g>
						<circle cx={960} cy={540} r={L.cup + 38} fill="none" stroke="#efe2c8" strokeWidth={58} opacity={0.12} />
						<circle cx={960} cy={540} r={L.cup + 66} fill="none" stroke={AMBER.cream} strokeWidth={2} opacity={0.4} />
					</g>
				) : null}
				{p.art()}
				<Motes f={i * 40} n={20} seed={`m${i}`} o={0.4} />
				<Finish vig={0.6} grain={0.04} />
			</svg>
		</AbsoluteFill>
	);
};
