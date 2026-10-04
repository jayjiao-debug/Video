import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {geoGraticule10, geoInterpolate, geoNaturalEarth1, geoPath} from 'd3-geo';
import {Liquid} from '../../src/art/glow/Liquid';
import {GlowDefs} from '../../src/art/glow/kit';
import {ADENOSINE, CAFFEINE} from '../../src/art/glow/molecules';
import {loadEpisodeFonts} from '../../src/lib/fonts';
import {font} from '../../src/lib/theme';
import {Bloom, Grade, Haze, Heartbeat, LAND, MapRoutes, Sub, Tag} from './look3';

/**
 * 《续命》 v3 storyboard, redrawn on the reference's craft rules: one light per shot,
 * everything else near-silhouette; thin lines; depth from many small elements;
 * light (liquid, embers, glow) as the hero material; small type, lots of space.
 * Camera moves are thin white dashed arrows; beats are small red ♪ pills.
 */

const W = 1920;
const H = 1080;
const F = 120;

// ---------------------------------------------------------------- annotation (kept light so it doesn't fight the frame)

const Arrow: React.FC<{d: string; label?: string; lx?: number; ly?: number}> = ({d, label, lx = 0, ly = 0}) => (
	<g opacity={0.85}>
		<path d={d} fill="none" stroke="#fff" strokeWidth={3} strokeDasharray="14 10" markerEnd="url(#ah2)" />
		{label ? (
			<g>
				<rect x={lx - 10} y={ly - 30} width={label.length * 25 + 22} height={42} rx={21} fill="#000" opacity={0.55} />
				<text x={lx + 2} y={ly} style={{fontFamily: font.sans, fontWeight: 600, fontSize: 24, fill: '#fff'}}>
					{label}
				</text>
			</g>
		) : null}
	</g>
);
const Beat: React.FC<{x: number; y: number; label: string}> = ({x, y, label}) => (
	<g>
		<rect x={x - 10} y={y - 32} width={label.length * 25 + 56} height={44} rx={22} fill="#e8455f" opacity={0.9} />
		<text x={x + 8} y={y} style={{fontFamily: font.sans, fontWeight: 700, fontSize: 24, fill: '#fff'}}>
			♪ {label}
		</text>
	</g>
);

// ---------------------------------------------------------------- shared pieces

/** a dark room lit by one soft source */
const Room: React.FC<{x?: number; y?: number; r?: number; c: string; base?: string; o?: number}> = ({x = 960, y = 540, r = 900, c, base = '#07060a', o = 1}) => {
	const id = `room${c.slice(1)}${Math.round(x)}${Math.round(y)}`;
	return (
		<g>
			<defs>
				<radialGradient id={id} cx={x} cy={y} r={r} gradientUnits="userSpaceOnUse">
					<stop offset="0" stopColor={c} stopOpacity={0.9 * o} />
					<stop offset="0.45" stopColor={c} stopOpacity={0.28 * o} />
					<stop offset="1" stopColor={c} stopOpacity="0" />
				</radialGradient>
			</defs>
			<rect width={W} height={H} fill={base} />
			<rect width={W} height={H} fill={`url(#${id})`} />
		</g>
	);
};

const Glow: React.FC<{x: number; y: number; r: number; o?: number}> = ({x, y, r, o = 1}) => (
	<g opacity={o}>
		<circle cx={x} cy={y} r={r} fill="url(#ember)" />
		<circle cx={x} cy={y} r={Math.max(2, r * 0.08)} fill="#fff8ea" />
	</g>
);

const Thin: React.FC<{text: string; x?: number; y?: number; size?: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; w?: number; ls?: string}> = ({
	text,
	x = 960,
	y = 540,
	size = 96,
	fill = '#f6e7c8',
	anchor = 'middle',
	w = 600,
	ls = '0.08em',
}) => (
	<text x={x} y={y} textAnchor={anchor} style={{fontFamily: font.serif, fontWeight: w, fontSize: size, fill, letterSpacing: ls}} filter="url(#g-sm)">
		{text}
	</text>
);

const Num: React.FC<{text: string; x?: number; y?: number; size?: number; fill?: string; anchor?: 'start' | 'middle' | 'end'}> = ({text, x = 960, y = 540, size = 140, fill = 'url(#gold-text)', anchor = 'middle'}) => (
	<text x={x} y={y} textAnchor={anchor} style={{fontFamily: font.latin, fontWeight: 500, fontSize: size, fill, letterSpacing: '0.04em'}} filter="url(#g-sm)">
		{text}
	</text>
);

/** fine glowing branches: neurons, trees, roots */
const Branches: React.FC<{x: number; y: number; s?: number; color: string; seed: string; n?: number; up?: boolean; w?: number; len?: number}> = ({x, y, s = 1, color, seed, n = 7, up, w = 5, len = 190}) => {
	const out: React.ReactNode[] = [];
	const grow = (x0: number, y0: number, a: number, l: number, ww: number, depth: number, key: string) => {
		if (depth > 6 || l < 10) return;
		const bend = (random(`${key}b`) - 0.5) * 0.5;
		const x1 = x0 + Math.cos(a) * l;
		const y1 = y0 + Math.sin(a) * l;
		out.push(<path key={key} d={`M${x0},${y0} Q${x0 + Math.cos(a + bend) * l * 0.5},${y0 + Math.sin(a + bend) * l * 0.5} ${x1},${y1}`} stroke={color} strokeWidth={ww} fill="none" strokeLinecap="round" opacity={0.55 + 0.45 / (depth + 1)} />);
		const k = depth < 2 ? 2 : random(key) > 0.35 ? 2 : 1;
		for (let i = 0; i < k; i++) grow(x1, y1, a + (random(`${key}a${i}`) - 0.5) * 1.0, l * (0.66 + 0.18 * random(`${key}l${i}`)), ww * 0.66, depth + 1, `${key}${i}`);
	};
	for (let k = 0; k < n; k++) {
		const a = up ? -Math.PI / 2 + (k - (n - 1) / 2) * 0.32 : (k / n) * Math.PI * 2 + random(`${seed}${k}`) * 0.4;
		grow(0, 0, a, len, w, 0, `${seed}${k}`);
	}
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			<g filter="url(#g-sm)">{out}</g>
		</g>
	);
};

/** receptor drawn like the reference's vessels: two thin walls of a cup */
const Receptor: React.FC<{x: number; y: number; s?: number; gold?: boolean; docked?: boolean}> = ({x, y, s = 1, gold, docked}) => {
	const c = gold ? '#ffd896' : '#9fe8f0';
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			<ellipse cx={0} cy={-40} rx={150} ry={110} fill={gold ? 'url(#ember)' : 'url(#cyan-soft)'} opacity={gold ? 0.35 : 0.6} />
			<path d="M-74,-96 C-70,-30 -52,10 -30,24 Q0,34 30,24 C52,10 70,-30 74,-96" fill="none" stroke={c} strokeWidth={2.2} />
			<path d="M-86,-92 C-82,-20 -62,26 -34,40 L34,40 C62,26 82,-20 86,-92" fill="none" stroke={c} strokeWidth={1.1} opacity={0.35} />
			{docked ? <Glow x={0} y={-26} r={46} /> : null}
			{gold ? <Caf x={0} y={-30} s={0.55} /> : null}
		</g>
	);
};

/** the purine rings of caffeine as a small glowing glyph */
const Caf: React.FC<{x: number; y: number; s?: number; c?: string}> = ({x, y, s = 1, c = '#ffd896'}) => {
	const B = 40;
	const hex = Array.from({length: 6}, (_, i) => {
		const a = ((-30 + i * 60) * Math.PI) / 180;
		return `${-B * 0.866 + B * Math.cos(a)},${B * Math.sin(a)}`;
	}).join(' ');
	const pent = [-144, -72, 0, 72, 144].map((d) => `${0.688 * B + 0.85 * B * Math.cos((d * Math.PI) / 180)},${0.85 * B * Math.sin((d * Math.PI) / 180)}`).join(' ');
	return (
		<g transform={`translate(${x},${y}) scale(${s})`} fill="none" stroke={c} strokeWidth={3.5} strokeLinejoin="round" filter="url(#g-sm)">
			<polygon points={hex} />
			<polyline points={pent} />
		</g>
	);
};

const ELEM: Record<string, string> = {N: '#7fb8ff', O: '#ff8a7a', C: '#e8e2d4'};
const elemOf = (label?: string) => (!label ? 'C' : label.startsWith('N') ? 'N' : label.startsWith('O') || label === 'HO' ? 'O' : 'C');
/** ball-and-stick, lit: small luminous atoms on thin bonds, slight perspective */
const Model: React.FC<{mol: typeof CAFFEINE; hl?: (id: string) => boolean; o?: number; tint?: string}> = ({mol, hl, o = 1, tint}) => {
	const by = mol.atoms;
	return (
		<g opacity={o}>
			{mol.bonds.map(([a, b], i) => (
				<line key={i} x1={by[a].p[0]} y1={by[a].p[1]} x2={by[b].p[0]} y2={by[b].p[1]} stroke={tint ?? '#d8dce8'} strokeWidth={2.4} opacity={0.6} />
			))}
			{Object.entries(by).map(([id, a]) => {
				const on = hl ? hl(id) : true;
				const c = tint ?? ELEM[elemOf(a.label)];
				return (
					<g key={id} opacity={on ? 1 : 0.25}>
						<circle cx={a.p[0]} cy={a.p[1]} r={on && hl ? 22 : 15} fill={c} opacity={0.25} filter="url(#g-md)" />
						<circle cx={a.p[0]} cy={a.p[1]} r={elemOf(a.label) === 'C' ? 7 : 9} fill={c} />
						<circle cx={a.p[0] - 2.5} cy={a.p[1] - 2.5} r={2.5} fill="#fff" opacity={0.9} />
					</g>
				);
			})}
		</g>
	);
};
const CORE = new Set(['C5', 'C4', 'N3', 'C2', 'N1', 'C6', 'N9', 'C8', 'N7']);

const Synapse: React.FC<{docked?: number; gold?: number; dense?: number; children?: React.ReactNode}> = ({docked = 0, gold = 0, dense = 1, children}) => (
	<g>
		<Room x={960} y={420} r={1000} c="#2a2366" base="#05040e" />
		<path d="M-40,250 C420,150 1500,150 1960,250 L1960,-40 L-40,-40 Z" fill="#9fe8f0" opacity={0.05} />
		<path d="M-40,250 C420,150 1500,150 1960,250" fill="none" stroke="#9fe8f0" strokeWidth={1.6} opacity={0.6} />
		{Array.from({length: 9}, (_, i) => (
			<circle key={i} cx={260 + i * 175 + 30 * Math.sin(i)} cy={150 - 40 * Math.sin((i / 8) * Math.PI)} r={26 + 8 * random(`ves${i}`)} fill="none" stroke="#9fe8f0" strokeWidth={1.2} opacity={0.35} />
		))}
		<path d="M-40,790 C420,860 1500,860 1960,790" fill="none" stroke={gold >= 3 ? '#ffd896' : '#9fe8f0'} strokeWidth={1.6} opacity={0.6} />
		{[560, 960, 1360].map((x, i) => (
			<Receptor key={x} x={x} y={770} gold={i < gold} docked={!(i < gold) && i < docked} />
		))}
		{Array.from({length: Math.round(90 * dense)}, (_, i) => {
			const z = random(`az${i}`);
			const x = random(`ax${i}`) * W + 30 * noise2D('ad', i, F / 150);
			const y = 280 + random(`ay${i}`) * 400;
			const far = z < 0.78;
			const r = far ? 2 + 3 * z : 14 + 60 * (z - 0.78);
			return (
				<g key={i} opacity={far ? 0.55 + 0.45 * z : 0.22}>
					<circle cx={x} cy={y} r={r * 2.2} fill="url(#ember)" opacity={far ? 0.5 : 0.3} filter={far ? undefined : 'url(#b8)'} />
					<circle cx={x} cy={y} r={r * 0.5} fill="#ffe2a8" filter={far ? undefined : 'url(#b8)'} />
				</g>
			);
		})}
		{children}
	</g>
);

const Cup: React.FC<{x: number; y: number; s?: number; level?: number; rim?: string}> = ({x, y, s = 1, level = 0.7, rim = '#f6e7c8'}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d={`M-110,${-140 + 280 * (1 - level)} L110,${-140 + 280 * (1 - level)} L92,140 L-92,140 Z`} fill="url(#ember)" opacity={0.85} />
		<path d="M-120,-150 L-96,150 L96,150 L120,-150" fill="none" stroke={rim} strokeWidth={2.4} />
		<ellipse cx={0} cy={-150} rx={120} ry={10} fill="none" stroke={rim} strokeWidth={1.4} opacity={0.6} />
		<path d="M118,-90 C190,-90 190,40 104,50" fill="none" stroke={rim} strokeWidth={2.4} />
	</g>
);

const Bean: React.FC<{x: number; y: number; r: number; c0: string; c1: string; rot?: number; blur?: boolean; crack?: boolean}> = ({x, y, r, c0, c1, rot = 0, blur, crack}) => {
	const id = `bn${c0.slice(1)}${c1.slice(1)}`;
	return (
		<g transform={`translate(${x},${y}) rotate(${rot})`} filter={blur ? 'url(#b8)' : undefined}>
			<defs>
				<radialGradient id={id} cx="38%" cy="30%" r="80%">
					<stop offset="0" stopColor={c0} />
					<stop offset="1" stopColor={c1} />
				</radialGradient>
			</defs>
			<ellipse rx={r * 0.72} ry={r} fill={`url(#${id})`} />
			<ellipse rx={r * 0.72} ry={r} fill="none" stroke="#fff6e0" strokeWidth={1.2} opacity={0.35} />
			<path d={`M${-r * 0.05},${-r * 0.9} C${r * 0.28},${-r * 0.4} ${-r * 0.28},${r * 0.4} ${r * 0.05},${r * 0.9}`} fill="none" stroke={crack ? '#fff1c8' : '#000'} strokeOpacity={crack ? 1 : 0.45} strokeWidth={crack ? 3 : r * 0.07} filter={crack ? 'url(#g-md)' : undefined} />
		</g>
	);
};

const leafD = (l: number, w = 0.3) => `M0,0 C${l * 0.25},${-l * w} ${l * 0.75},${-l * w * 0.8} ${l},0 C${l * 0.75},${l * w * 0.8} ${l * 0.25},${l * w} 0,0 Z`;

const LineFlower: React.FC<{x: number; y: number; s?: number; o?: number}> = ({x, y, s = 1, o = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
		<circle r={260} fill="url(#ember)" opacity={0.25} />
		{Array.from({length: 5}, (_, i) => (
			<path key={i} d={leafD(220, 0.22)} transform={`rotate(${i * 72 - 90})`} fill="#fff8ea" fillOpacity={0.07} stroke="#fff4dc" strokeWidth={1.8} />
		))}
		{Array.from({length: 5}, (_, i) => {
			const a = ((i * 72 - 54) * Math.PI) / 180;
			return (
				<g key={i}>
					<line x1={0} y1={0} x2={Math.cos(a) * 80} y2={Math.sin(a) * 80} stroke="#ffd896" strokeWidth={1.4} />
					<circle cx={Math.cos(a) * 80} cy={Math.sin(a) * 80} r={4} fill="#ffd896" />
				</g>
			);
		})}
		<Glow x={0} y={0} r={50} o={0.8} />
	</g>
);

const LineBee: React.FC<{x: number; y: number; s?: number; o?: number}> = ({x, y, s = 1, o = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`} opacity={o} fill="none" strokeLinecap="round">
		<ellipse cx={-8} cy={-34} rx={36} ry={16} transform="rotate(-18,-8,-34)" fill="#fff4dc" fillOpacity={0.08} stroke="#fff4dc" strokeWidth={1.2} />
		<ellipse cx={14} cy={-30} rx={28} ry={12} transform="rotate(12,14,-30)" fill="#fff4dc" fillOpacity={0.06} stroke="#fff4dc" strokeWidth={1.2} />
		<ellipse cx={-10} cy={0} rx={40} ry={22} stroke="#ffd896" strokeWidth={2} fill="#1a1006" />
		{[-26, -10, 6].map((x) => (
			<path key={x} d={`M${x},-21 Q${x + 6},0 ${x},21`} stroke="#ffd896" strokeWidth={3} />
		))}
		<circle cx={40} cy={-4} r={15} stroke="#ffd896" strokeWidth={2} fill="#1a1006" />
		<path d="M50,-16 Q58,-36 70,-40 M44,-18 Q46,-38 56,-46" stroke="#ffd896" strokeWidth={1.4} />
	</g>
);

const Clock: React.FC<{x: number; y: number; r: number; h: number; m?: number; c?: string}> = ({x, y, r, h, m = 0, c = '#f6e7c8'}) => {
	const ah = (((h % 12) + m / 60) / 12) * Math.PI * 2 - Math.PI / 2;
	const am = (m / 60) * Math.PI * 2 - Math.PI / 2;
	return (
		<g transform={`translate(${x},${y})`} stroke={c} strokeLinecap="round">
			<circle r={r} fill="none" strokeWidth={1.4} opacity={0.6} />
			{Array.from({length: 60}, (_, i) => {
				const a = (i / 60) * Math.PI * 2;
				const big = i % 5 === 0;
				return <line key={i} x1={Math.cos(a) * r * (big ? 0.88 : 0.93)} y1={Math.sin(a) * r * (big ? 0.88 : 0.93)} x2={Math.cos(a) * r * 0.97} y2={Math.sin(a) * r * 0.97} strokeWidth={big ? 2 : 1} opacity={big ? 0.8 : 0.4} />;
			})}
			<line x1={0} y1={0} x2={Math.cos(ah) * r * 0.5} y2={Math.sin(ah) * r * 0.5} strokeWidth={3} />
			<line x1={0} y1={0} x2={Math.cos(am) * r * 0.78} y2={Math.sin(am) * r * 0.78} strokeWidth={1.6} />
			<circle r={4} fill={c} />
		</g>
	);
};

const ridgeD = (base: number, amp: number, seed: string, fq = 700) => {
	let d = `M-40,${H + 40} `;
	for (let x = -40; x <= W + 40; x += 12) d += `L${x},${base - amp * (0.5 + 0.5 * noise2D(seed, x / fq, 0))} `;
	return d + `L${W + 40},${H + 40} Z`;
};

/** fine silhouette trees: thin trunks and many small leaf clusters */
const Trees: React.FC<{y: number; n: number; s: number; c: string; seed: string; o?: number}> = ({y, n, s, c, seed, o = 1}) => (
	<g opacity={o} fill={c}>
		{Array.from({length: n}, (_, i) => {
			const x = (i / n) * (W + 200) - 100 + random(`${seed}${i}`) * 90;
			const h = (300 + random(`${seed}h${i}`) * 260) * s;
			return (
				<g key={i}>
					<rect x={x - 2 * s} y={y - h} width={4 * s} height={h} />
					{Array.from({length: 26}, (_, k) => {
						const a = random(`${seed}a${i}${k}`) * Math.PI;
						const rr = random(`${seed}r${i}${k}`) * 110 * s;
						return <ellipse key={k} cx={x + Math.cos(a) * rr * 1.4 - 20} cy={y - h + Math.sin(a) * rr * -0.5 + 20 * s} rx={18 * s} ry={7 * s} transform={`rotate(${random(`${seed}t${i}${k}`) * 180},${x + Math.cos(a) * rr * 1.4 - 20},${y - h + Math.sin(a) * rr * -0.5 + 20 * s})`} />;
					})}
				</g>
			);
		})}
	</g>
);

const Rays: React.FC<{x: number; y: number; n?: number; o?: number; c?: string}> = ({x, y, n = 8, o = 0.12, c = '#ffe2a0'}) => (
	<g opacity={o} filter="url(#b8)">
		{Array.from({length: n}, (_, i) => {
			const a = 1.2 + (i / (n - 1)) * 0.75;
			return <polygon key={i} points={`${x},${y} ${x + Math.cos(a - 0.03) * 1800},${y + Math.sin(a - 0.03) * 1800} ${x + Math.cos(a + 0.03) * 1800},${y + Math.sin(a + 0.03) * 1800}`} fill={c} />;
		})}
	</g>
);

const CupLiquid: React.FC<{r: number; swirl?: number; t?: number}> = ({r, swirl = 3, t = 12}) => (
	<div style={{position: 'absolute', left: 960 - r, top: 540 - r, width: r * 2, height: r * 2, borderRadius: '50%', overflow: 'hidden'}}>
		<div style={{position: 'absolute', left: r - 960, top: r - 540, width: W, height: H}}>
			<Liquid t={t} swirl={swirl} scale={3.2} light={[0.5, 0.42, 0.5]} gain={1.05} />
		</div>
	</div>
);
const CupRim: React.FC<{r: number}> = ({r}) => (
	<g>
		<circle cx={960} cy={556} r={r + 90} fill="#000" opacity={0.6} filter="url(#b8)" />
		<circle cx={960} cy={540} r={r + 34} fill="none" stroke="#efe2c8" strokeWidth={46} opacity={0.07} />
		<circle cx={960} cy={540} r={r + 58} fill="none" stroke="#f6e7c8" strokeWidth={1.4} opacity={0.55} />
		<circle cx={960} cy={540} r={r + 4} fill="none" stroke="#f6e7c8" strokeWidth={1} opacity={0.35} />
	</g>
);

// ---------------------------------------------------------------- panels

type Panel = {html?: () => React.ReactNode; art: () => React.ReactNode};

const mapProj = (scale: number, cx: number, cy: number, rot = -10) => geoNaturalEarth1().scale(scale).translate([cx, cy]).rotate([rot, 0]);

const P: Panel[] = [
	// A1
	{html: () => <Liquid t={12} light={[0.66, 0.36, 0.55]} gain={1} />, art: () => <Arrow d="M760,700 C900,680 1060,700 1180,680" label="缓慢漂移" lx={800} ly={780} />},
	// A2
	{
		html: () => <Liquid t={13} light={[0.66, 0.36, 0.55]} gain={0.85} />,
		art: () => (
			<>
				<rect y={300} width={W} height={440} fill="url(#band2)" />
				<Num text="2,000,000,000" y={560} size={150} />
				<text x={960} y={630} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 22, letterSpacing: '0.6em', fill: '#efe4d0'}} opacity={0.7}>
					杯 · 每一天 · 全世界
				</text>
				<Sub text="每天，全世界约有二十亿杯咖啡被端起。" hl="二十亿" />
				<Beat x={1380} y={760} label="数字停在重拍" />
			</>
		),
	},
	// A3a
	{
		html: () => <Liquid t={14} light={[0.66, 0.36, 0.55]} gain={0.8} />,
		art: () => (
			<>
				<rect y={240} width={W} height={600} fill="url(#band2)" />
				<line x1={120} y1={540} x2={1500} y2={540} stroke="#fff1d0" strokeWidth={2.4} opacity={0.8} />
				<Glow x={1500} y={540} r={40} o={0.7} />
				<circle cx={960} cy={330} r={9} fill="#ffcf80" filter="url(#g-sm)" />
				<path d="M960,300 C955,280 965,270 960,250" stroke="#ffcf80" strokeWidth={2} fill="none" opacity={0.5} />
				<text x={1770} y={150} textAnchor="end" style={{fontFamily: font.latin, fontWeight: 600, fontSize: 64, fill: '#ffe7b8'}} opacity={0.6}>
					0
				</text>
				<text x={1770} y={180} textAnchor="end" style={{fontFamily: font.sans, fontSize: 15, letterSpacing: '0.4em', fill: '#c99a5a'}}>
					BPM
				</text>
				<Arrow d="M1010,340 L1010,500" label="一滴咖啡落下" lx={1040} ly={430} />
				<Sub text="你管它叫——" />
			</>
		),
	},
	// A3b
	{html: () => <Liquid t={14.4} light={[0.7, 0.35, 0.6]} gain={0.95} veins={0.9} />, art: () => (
		<>
			<Heartbeat f={F} />
			<Beat x={1100} y={260} label="心跳弹起=重拍" />
		</>
	)},
	// A4
	{html: () => <CupLiquid r={380} swirl={2} />, art: () => (
		<>
			<CupRim r={380} />
			<Arrow d="M300,220 L540,380 M1620,220 L1380,380" label="后拉：原来是一杯咖啡" lx={700} ly={130} />
			<Sub text="可它续的，到底是什么？" />
		</>
	)},
	// A5
	{html: () => <CupLiquid r={380} swirl={4} />, art: () => (
		<>
			<CupRim r={380} />
			<rect x={560} y={400} width={800} height={280} fill="#000" opacity={0.35} filter="url(#b8)" />
			<text x={960} y={330} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 18, letterSpacing: '0.42em', fill: '#e0902e'}}>
				CAFFEINE · ADENOSINE · 600,000 YEARS
			</text>
			<Thin text="续命" y={600} size={200} fill="url(#gold-text)" w={900} ls="0.14em" />
			<text x={960} y={720} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 600, fontSize: 36, fill: '#f6e7c8'}}>
				它续的，到底是什么？
			</text>
			<Beat x={1400} y={980} label="片名聚出=重拍" />
		</>
	)},
	// B1
	{art: () => (
		<>
			<Room x={960} y={540} r={900} c="#2a2366" base="#05040e" />
			<Branches x={960} y={540} s={2.3} color="#9fe8f0" seed="neu" n={8} w={6} />
			<Glow x={960} y={540} r={120} />
			<Haze seed="b1" n={70} color="#cfe8ff" />
			<Arrow d="M960,90 L960,330" label="穿过漩涡，俯冲进神经元（一镜到底）" lx={420} ly={70} />
			<Sub text="你醒着的每一分钟，" />
		</>
	)},
	// B2
	{art: () => (
		<>
			<Synapse />
			<Clock x={1690} y={200} r={70} h={23} c="#cfe8ff" />
			<text x={1690} y={310} textAnchor="middle" style={{fontFamily: font.latin, fontSize: 22, letterSpacing: '0.2em', fill: '#cfe8ff'}} opacity={0.8}>
				08:00 → 23:00
			</text>
			<Tag en="Adenosine" zh="腺苷 · 醒着时一点点积累" />
			<Arrow d="M300,620 L560,560" label="慢推" lx={180} ly={680} />
			<Sub text="大脑都在积攒一种分子：腺苷。" hl="腺苷" />
		</>
	)},
	// B3
	{art: () => (
		<>
			<Synapse docked={2} dense={1.2} />
			<rect width={W} height={300} fill="url(#lidT)" />
			<rect y={780} width={W} height={300} fill="url(#lidB)" />
			<rect width={W} height={H} fill="#000" opacity={0.25} />
			<Beat x={1240} y={470} label="每卡进一个，世界暗一档" />
			<Sub text="它一点点落进受体，你就一点点困下去。" />
		</>
	)},
	// B4a
	{art: () => (
		<>
			<Room x={1000} y={520} r={900} c="#2a2366" base="#05040e" />
			<g transform="translate(1020,540) scale(3.0)">
				<Model mol={ADENOSINE} />
			</g>
			<Haze seed="b4" n={60} color="#cfe8ff" />
			<Tag en="Adenosine · C10H13N5O4" zh="腺苷 · 球棍模型" />
			<Arrow d="M1700,160 L1500,320" label="推进 + 拉焦" lx={1460} ly={120} />
			<Sub text="而咖啡因的骨架，" />
		</>
	)},
	// B4b
	{art: () => (
		<>
			<Room x={1000} y={520} r={900} c="#1f3a6a" base="#05040e" />
			<g transform="translate(1020,540) scale(3.0)">
				<Model mol={ADENOSINE} hl={(id) => CORE.has(id)} o={0.85} />
			</g>
			<g transform="translate(1020,540) scale(3.0)">
				<Model mol={CAFFEINE} tint="#ffd896" o={0.45} />
			</g>
			<Thin text="同一个骨架" x={960} y={170} size={64} fill="#9fe8f0" w={700} />
			<Beat x={1300} y={980} label="相同原子逐个亮" />
			<Sub text="和它几乎一模一样。" hl="几乎一模一样" />
		</>
	)},
	// B5
	{art: () => (
		<>
			<Synapse gold={3} dense={0.8}>
				<Glow x={760} y={420} r={36} />
				<Arrow d="M690,620 C670,520 710,460 750,440" label="被弹开" lx={520} ly={410} />
			</Synapse>
			<Beat x={1240} y={470} label="每锁一拍" />
			<Sub text="它抢先坐进受体，却什么也不做——" />
		</>
	)},
	// B6
	{art: () => (
		<>
			<Synapse gold={3} dense={1.8} />
			<Arrow d="M300,950 L1600,950" label="横移" lx={900} ly={920} />
			<Sub text="困意，就这样被挡在了门外。" />
		</>
	)},
	// B7
	{art: () => (
		<>
			<Room x={960} y={520} r={800} c="#3a2a50" base="#05040e" />
			{Array.from({length: 160}, (_, i) => {
				const a = random(`ba${i}`) * Math.PI * 2;
				const r = Math.sqrt(random(`br${i}`));
				const x = 960 + Math.cos(a) * r * 430;
				const y = 520 + Math.sin(a) * r * 300;
				const j = (i * 7 + 3) % 160;
				const a2 = random(`ba${j}`) * Math.PI * 2;
				const r2 = Math.sqrt(random(`br${j}`));
				return (
					<g key={i}>
						{i % 2 ? <line x1={x} y1={y} x2={960 + Math.cos(a2) * r2 * 430} y2={520 + Math.sin(a2) * r2 * 300} stroke="#ffd896" strokeWidth={0.8} opacity={0.35} /> : null}
						<circle cx={x} cy={y} r={2.5} fill="#ffe7b8" />
					</g>
				);
			})}
			<Glow x={960} y={520} r={300} o={0.5} />
			{/* the fatigue fog, held at the edge */}
			<ellipse cx={960} cy={520} rx={640} ry={460} fill="none" stroke="#7fd4d8" strokeWidth={140} opacity={0.12} filter="url(#b8)" />
			{Array.from({length: 60}, (_, i) => {
				const a = random(`fg${i}`) * Math.PI * 2;
				return <circle key={i} cx={960 + Math.cos(a) * (560 + random(`fgr${i}`) * 160)} cy={520 + Math.sin(a) * (400 + random(`fgr${i}`) * 110)} r={3 + random(`fgs${i}`) * 4} fill="#9fe8f0" opacity={0.6} />;
			})}
			<Tag en="Blocked, not removed" zh="疲惫没有消失 · 只是被挡在外面" />
			<Arrow d="M960,860 L960,1000" label="一路后拉 → 神经分叉匹配成树枝" lx={1000} ly={900} />
			<Sub text="咖啡不给你力气，它替你挡住疲惫。" hl="挡住疲惫" />
		</>
	)},
	// C1
	{art: () => (
		<>
			<Room x={960} y={760} r={1000} c="#9a7a3a" base="#04100a" />
			<rect width={W} height={H} fill="#0f3d2a" opacity={0.35} />
			<path d={ridgeD(860, 60, 'c1')} fill="#030a06" />
			<rect x={955} y={420} width={10} height={460} fill="#030a06" />
			<Branches x={960} y={430} s={1.9} color="#060c08" seed="tree" n={7} up w={10} len={170} />
			<Haze seed="c1" n={70} />
			<Tag en="Match cut" zh="神经元的分叉 = 咖啡树的枝杈" />
			<Sub text="可这把钥匙，最早不是为人类准备的。" />
		</>
	)},
	// C2
	{art: () => (
		<>
			<Room x={1180} y={720} r={1100} c="#e8c27a" base="#03100a" />
			<rect width={W} height={H} fill="#0f3d2a" opacity={0.45} />
			<Rays x={1250} y={-60} n={9} o={0.16} />
			<Trees y={820} n={18} s={0.7} c="#1a3a24" seed="t1" o={0.55} />
			<Trees y={900} n={12} s={1} c="#0b1e12" seed="t2" o={0.85} />
			<path d={ridgeD(960, 50, 'c2')} fill="#030805" />
			<Haze seed="c2" n={90} />
			<Thin text="60 万年前" y={380} size={110} w={500} />
			<Tag en="Coffea arabica · SW Ethiopia" zh="埃塞俄比亚西南高地森林" />
			<Arrow d="M960,860 L960,720" label="五层视差前推" lx={1000} ly={800} />
			<Beat x={1300} y={260} label="大字落在重拍" />
			<Sub text="约六十万年前，埃塞俄比亚的森林里，" />
		</>
	)},
	// C3a
	{art: () => (
		<>
			<Room x={960} y={540} r={1000} c="#3a6a4a" base="#03100a" />
			<LineFlower x={420} y={520} s={1.25} />
			<LineFlower x={1500} y={520} s={1.25} />
			<text x={420} y={880} textAnchor="middle" style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 34, fill: '#efe4d0'}} opacity={0.8}>
				Coffea eugenioides
			</text>
			<text x={1500} y={880} textAnchor="middle" style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 34, fill: '#efe4d0'}} opacity={0.8}>
				Coffea canephora
			</text>
			<path d="M560,440 C760,330 980,330 1140,420" stroke="#ffd896" strokeWidth={6} fill="none" opacity={0.25} filter="url(#b8)" />
			<path d="M560,440 C760,330 980,330 1140,420" stroke="#ffe7b8" strokeWidth={1.4} fill="none" />
			<Glow x={1140} y={420} r={44} />
			<Haze seed="c3" n={60} />
			<Arrow d="M600,250 L1100,250" label="横移跟着一颗花粉" lx={700} ly={210} />
			<Sub text="两种野生咖啡偶然杂交，" />
		</>
	)},
	// C3b
	{art: () => (
		<>
			<Room x={960} y={560} r={900} c="#2a4a3a" base="#03100a" />
			{Array.from({length: 44}, (_, i) => {
				const x = 330 + (i % 11) * 126;
				const y = 360 + Math.floor(i / 11) * 120;
				const c = i < 22 ? '#9fe8f0' : '#ffd896';
				const h = 70 - (i % 11) * 3.5;
				return (
					<g key={i} transform={`translate(${x},${y})`} stroke={c} strokeLinecap="round" filter="url(#g-sm)">
						<path d={`M-9,${-h / 2} Q0,0 -9,${h / 2} M9,${-h / 2} Q0,0 9,${h / 2}`} strokeWidth={5} fill="none" />
					</g>
				);
			})}
			<Num text="22 + 22 → 44" y={230} size={88} />
			<Tag en="Allotetraploid" zh="阿拉比卡 · 四倍体 · 44 条染色体" />
			<Beat x={1300} y={900} label="染色体按拍落位" />
			<Sub text="诞生了阿拉比卡。" hl="阿拉比卡" />
		</>
	)},
	// D1
	{art: () => (
		<>
			<Room x={960} y={540} r={900} c="#a8c86a" base="#040a05" o={0.7} />
			<g transform="translate(140,560) rotate(-5)">
				<path d={leafD(1640, 0.27)} fill="url(#leafLit)" />
				<path d={leafD(1640, 0.27)} fill="none" stroke="#f4ffc8" strokeWidth={1.2} opacity={0.6} />
				<path d="M0,0 C500,-8 1100,-4 1640,0" stroke="#f8ffd8" strokeWidth={2.4} fill="none" filter="url(#g-sm)" />
				{Array.from({length: 13}, (_, i) => {
					const x = 90 + i * 115;
					const L = 300 * Math.sin(((i + 1) / 14) * Math.PI) + 40;
					return (
						<g key={i} stroke="#f4ffc8" strokeWidth={1} fill="none" opacity={0.7}>
							<path d={`M${x},-3 Q${x + L * 0.5},${-L * 0.25} ${x + L * 0.75},${-L * 0.6}`} />
							<path d={`M${x},3 Q${x + L * 0.5},${L * 0.25} ${x + L * 0.75},${L * 0.6}`} />
						</g>
					);
				})}
				{Array.from({length: 18}, (_, i) => (
					<Glow key={i} x={60 + i * 88} y={(i % 3) - 1} r={16} />
				))}
			</g>
			<Thin text="防身术" x={1560} y={230} size={84} w={600} fill="#f8ffd8" />
			<Arrow d="M300,950 L1500,950" label="沿叶脉平移" lx={760} ly={1020} />
			<Sub text="咖啡因，本是它的防身术：" hl="防身术" />
		</>
	)},
	// D2
	{art: () => (
		<>
			<Room x={1200} y={700} r={900} c="#7a9a4a" base="#040a05" o={0.6} />
			<g transform="translate(-200,720) rotate(-4)">
				<path d={leafD(2400, 0.2)} fill="url(#leafLit)" opacity={0.75} />
			</g>
			{Array.from({length: 11}, (_, i) => (
				<circle key={i} cx={720 + i * 46} cy={600 - 10 * Math.sin(i / 1.6)} r={i === 0 ? 30 : 26} fill="#0c0805" stroke="#ffcf9a" strokeWidth={1} opacity={0.95} />
			))}
			<path d={`M720,600 ${Array.from({length: 11}, (_, i) => `L${720 + i * 46},${600 - 10 * Math.sin(i / 1.6)}`).join(' ')}`} stroke="#ff5a46" strokeWidth={2.4} fill="none" filter="url(#g-md)" />
			{Array.from({length: 12}, (_, i) => {
				const a = (i / 12) * Math.PI * 2;
				return <line key={i} x1={720 + Math.cos(a) * 44} y1={600 + Math.sin(a) * 44} x2={720 + Math.cos(a) * 80} y2={600 + Math.sin(a) * 80} stroke="#ff7a62" strokeWidth={1.4} />;
			})}
			<Tag en="Caffeine · natural pesticide" zh="虫子的神经被扰乱 · Nathanson 1984" />
			<Arrow d="M1240,640 C1330,760 1350,880 1360,1000" label="抽搐、掉出画面" lx={1390} ly={820} />
			<Sub text="啃食叶子的虫子，会被它扰乱神经；" />
		</>
	)},
	// D3
	{art: () => (
		<>
			<Room x={960} y={300} r={900} c="#7a5a30" base="#090604" o={0.7} />
			<rect y={360} width={W} height={720} fill="#1a0f08" />
			<rect y={360} width={W} height={720} filter="url(#stone)" opacity={0.12} />
			<path d="M0,360 L1920,360" stroke="#ffd896" strokeWidth={1.4} opacity={0.7} />
			{[300, 900, 1500].map((x, i) => (
				<path key={i} d={leafD(170, 0.3)} transform={`translate(${x},352) rotate(${174 + i * 4})`} fill="#1a2a10" stroke="#c9d88a" strokeWidth={1} />
			))}
			{Array.from({length: 120}, (_, i) => {
				const x = 200 + random(`gx${i}`) * 1520;
				const y = 380 + random(`gy${i}`) * 300;
				return <circle key={i} cx={x} cy={y} r={1.5 + random(`gr${i}`) * 2.5} fill="#ffd896" opacity={0.5 + 0.5 * random(`go${i}`)} />;
			})}
			{[560, 960, 1360].map((x, i) => (
				<g key={x}>
					<ellipse cx={x} cy={760} rx={46} ry={30} fill="#2a1a0e" stroke="#ffd896" strokeWidth={1.4} />
					<path d={`M${x},730 Q${x + 10},${670 - i * 8} ${x + (i === 1 ? 46 : 6)},${i === 1 ? 680 : 640}`} stroke={i === 1 ? '#7a6a3a' : '#b8e07a'} strokeWidth={2.4} fill="none" />
					<path d={`M${x},790 Q${x - 8},840 ${x + 6},880 M${x},790 Q${x + 14},830 ${x + 26},860`} stroke="#c9a070" strokeWidth={1} fill="none" opacity={0.7} />
				</g>
			))}
			<Tag en="Allelopathy" zh="化感作用 · 树下的土壤抑制发芽" />
			<Arrow d="M1780,110 L1780,320" label="下摇" lx={1640} ly={90} />
			<Sub text="落叶里的咖啡因渗进土里，别的种子很难发芽。" />
		</>
	)},
	// D4
	{art: () => (
		<>
			<rect width={W} height={H} fill="#07060a" />
			{[
				{x: 400, n: '茶', r: '中国 · Camellia', c: '#b8e07a'},
				{x: 960, n: '可可', r: '美洲 · Theobroma', c: '#e0a060'},
				{x: 1520, n: '咖啡', r: '非洲 · Coffea', c: '#ff8a6a'},
			].map((t, i) => (
				<g key={t.n}>
					<polygon points={`${t.x - 40},120 ${t.x + 40},120 ${t.x + 220},760 ${t.x - 220},760`} fill={t.c} opacity={0.06} />
					<ellipse cx={t.x} cy={760} rx={240} ry={26} fill={t.c} opacity={0.12} filter="url(#b8)" />
					{i === 0 ? <path d={leafD(320, 0.3)} transform={`translate(${t.x - 160},520) rotate(-30)`} fill="none" stroke={t.c} strokeWidth={2} /> : null}
					{i === 1 ? <ellipse cx={t.x} cy={500} rx={90} ry={170} fill="none" stroke={t.c} strokeWidth={2} /> : null}
					{i === 1 ? <path d={`M${t.x - 40},340 Q${t.x - 50},500 ${t.x - 40},660 M${t.x + 40},340 Q${t.x + 50},500 ${t.x + 40},660 M${t.x},330 L${t.x},670`} fill="none" stroke={t.c} strokeWidth={1} opacity={0.6} /> : null}
					{i === 2 ? (
						<g fill="none" stroke={t.c} strokeWidth={2}>
							<path d={`M${t.x - 200},420 Q${t.x},380 ${t.x + 200},430`} />
							{[-120, -40, 40, 120].map((dx) => (
								<circle key={dx} cx={t.x + dx} cy={470 + (dx % 80 ? 10 : 0)} r={30} />
							))}
						</g>
					) : null}
					<Thin text={t.n} x={t.x} y={850} size={56} fill={t.c} w={700} />
					<text x={t.x} y={890} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 20, letterSpacing: '0.2em', fill: '#efe4d0'}} opacity={0.6}>
						{t.r}
					</text>
				</g>
			))}
			<Caf x={960} y={190} s={0.9} />
			<Tag en="Convergent evolution" zh="趋同演化 · Denoeud et al. 2014" />
			<Beat x={140} y={1000} label="三盏聚光灯依次亮" />
			<Sub text="茶、可可、咖啡，相隔万里，却各自发明了它。" hl="各自" />
		</>
	)},
	// E1
	{art: () => (
		<>
			<Bloom f={F} />
			<Beat x={1300} y={170} label="硬切：全片最亮的一拍" />
			<Arrow d="M960,1040 L960,880" label="航拍前推 + 抬升" lx={1000} ly={960} />
		</>
	)},
	// E2
	{art: () => (
		<>
			<Room x={960} y={520} r={900} c="#c88a4a" base="#0c0705" />
			{Array.from({length: 40}, (_, i) => (
				<circle key={i} cx={random(`bk${i}`) * W} cy={random(`bky${i}`) * H} r={20 + random(`bkr${i}`) * 60} fill="#ffe0b0" opacity={0.05 + 0.06 * random(`bko${i}`)} filter="url(#b8)" />
			))}
			<LineFlower x={960} y={520} s={1.9} />
			<Caf x={1250} y={330} s={0.7} />
			<path d="M1220,350 C1120,400 1040,460 980,510" stroke="#ffd896" strokeWidth={1} strokeDasharray="5 6" fill="none" opacity={0.7} />
			<Tag en="Nectar" zh="花蜜里的咖啡因 · 低于蜜蜂能尝出的苦味" />
			<Arrow d="M220,120 C450,260 680,400 860,480" label="俯冲穿过花枝到花芯（一镜到底）" lx={160} ly={90} />
			<Sub text="花只开三四天。花蜜里，藏着一点点咖啡因。" />
		</>
	)},
	// E3a
	{art: () => (
		<>
			<Room x={960} y={520} r={900} c="#c88a4a" base="#0c0705" />
			<Clock x={600} y={500} r={250} h={9} m={0} c="#f6e7c8" />
			<Thin text="24 h" x={600} y={830} size={48} w={500} />
			<LineBee x={1300} y={480} s={2.4} />
			<path d="M860,500 C1000,420 1120,420 1220,450" stroke="#ffe7b8" strokeWidth={1.4} fill="none" opacity={0.8} />
			<Haze seed="e3" n={60} />
			<Arrow d="M1500,250 L1700,250" label="侧跟蜜蜂" lx={1490} ly={200} />
			<Sub text="喝过的蜜蜂，一天后还记得这朵花的，" />
		</>
	)},
	// E3b
	{art: () => (
		<>
			<Room x={1400} y={560} r={900} c="#c88a4a" base="#0c0705" />
			<LineFlower x={1450} y={560} s={1.3} />
			{[0, 1, 2].map((i) => (
				<g key={i}>
					<path d={`M${80 + i * 30},${240 + i * 150} C620,${220 + i * 170} 1000,${420 + i * 70} 1330,${520 + i * 34}`} stroke="#ffd896" strokeWidth={6} opacity={0.2} fill="none" filter="url(#b8)" />
					<path d={`M${80 + i * 30},${240 + i * 150} C620,${220 + i * 170} 1000,${420 + i * 70} 1330,${520 + i * 34}`} stroke="#ffe7b8" strokeWidth={1.4} fill="none" />
					<LineBee x={1330 + i * 20} y={520 + i * 34} s={1.1} />
				</g>
			))}
			<path d="M300,880 C400,780 520,980 620,860 C700,760 560,700 480,800" stroke="#8a7a6a" strokeWidth={1.2} fill="none" strokeDasharray="6 8" />
			<text x={330} y={960} style={{fontFamily: font.sans, fontSize: 22, letterSpacing: '0.2em', fill: '#9a8a7a'}}>
				没喝过的蜜蜂 · 迷路
			</text>
			<Num text="×3" x={960} y={330} size={200} />
			<Beat x={1100} y={1000 - 70} label="三只依次落花，×3 落第三拍" />
			<Sub text="……是别的蜜蜂的三倍。" hl="三倍" />
		</>
	)},
	// E4
	{art: () => (
		<>
			<rect width={W} height={H} fill="url(#dusk2)" />
			{Array.from({length: 120}, (_, i) => {
				const y = random(`py${i}`) * 1000;
				const x = random(`px${i}`) * W;
				const star = y < 440;
				return star ? <circle key={i} cx={x} cy={y} r={1 + random(`ps${i}`) * 2} fill="#fff" /> : <ellipse key={i} cx={x} cy={y} rx={6} ry={3} fill="#fff4e0" opacity={0.7} transform={`rotate(${i * 37},${x},${y})`} />;
			})}
			<path d={ridgeD(980, 60, 'e4')} fill="#05040a" />
			<Arrow d="M1720,900 L1720,420" label="镜头上升：花瓣变星星" lx={1300} ly={980 - 60} />
			<Sub text="它在对蜜蜂说：记住我。" hl="记住我" />
		</>
	)},
	// F1
	{art: () => (
		<>
			<rect width={W} height={H} fill="url(#night)" />
			{Array.from({length: 140}, (_, i) => <circle key={i} cx={random(`st${i}`) * W} cy={random(`sty${i}`) * 520} r={0.8 + random(`sr${i}`) * 1.8} fill="#fff" opacity={0.4 + 0.6 * random(`so${i}`)} />)}
			<path d={ridgeD(700, 160, 'ym', 500)} fill="#0a0c1a" />
			{/* Yemeni tower houses on a hill: narrow, tall, crenellated, arched windows; a dome and a minaret */}
			{Array.from({length: 16}, (_, i) => {
				const x = 160 + i * 98 + random(`hx${i}`) * 24;
				const h = 150 + random(`hh${i}`) * 170 + (i > 5 && i < 11 ? 80 : 0);
				const w = 52 + random(`hw${i}`) * 20;
				const top = 860 - h;
				return (
					<g key={i}>
						<path d={`M${x},860 L${x},${top} ${Array.from({length: 4}, (_, k) => `L${x + (k * w) / 4},${top} L${x + (k * w) / 4},${top - 8} L${x + ((k + 0.5) * w) / 4},${top - 8} L${x + ((k + 0.5) * w) / 4},${top}`).join(' ')} L${x + w},${top} L${x + w},860 Z`} fill="#05060e" />
						{Array.from({length: 3}, (_, k) =>
							random(`w${i}${k}`) > 0.4 ? (
								<path key={k} d={`M${x + w / 2 - 7},${top + 40 + k * 52} L${x + w / 2 - 7},${top + 26 + k * 52} A7,7 0 0,1 ${x + w / 2 + 7},${top + 26 + k * 52} L${x + w / 2 + 7},${top + 40 + k * 52} Z`} fill="#ffb060" filter="url(#g-sm)" />
							) : null,
						)}
					</g>
				);
			})}
			<path d="M1130,640 A70,70 0 0,1 1270,640 L1270,700 L1130,700 Z" fill="#05060e" />
			<rect x={1320} y={470} width={22} height={390} fill="#05060e" />
			<path d="M1314,470 L1348,470 L1331,430 Z" fill="#05060e" />
			<rect x={1326} y={520} width={10} height={14} fill="#ffb060" filter="url(#g-sm)" />
			<rect y={860} width={W} height={220} fill="#060a1c" />
			{Array.from({length: 30}, (_, i) => <rect key={i} x={200 + random(`rf${i}`) * 1500} y={880 + random(`rfy${i}`) * 140} width={30 + random(`rfw${i}`) * 60} height={2} fill="#ffb060" opacity={0.3} />)}
			<path d="M1500,860 L1700,860 L1670,900 L1530,900 Z M1600,860 L1600,700 L1690,840 Z M1600,700 L1520,840 L1600,840 Z" fill="#03040a" />
			<Glow x={1660} y={850} r={22} />
			<Tag en="Mocha, Yemen" zh="也门 · 摩卡港" />
			<Arrow d="M960,90 L960,330" label="从星空下降到港口" lx={1000} ly={200} />
			<Sub text="后来，人类也记住了它——而且想独占它。" />
		</>
	)},
	// F2
	{art: () => (
		<>
			<Room x={700} y={760} r={700} c="#c8501a" base="#070302" />
			{Array.from({length: 60}, (_, i) => <circle key={i} cx={420 + random(`em${i}`) * 560} cy={820 + random(`emy${i}`) * 140} r={2 + random(`emr${i}`) * 5} fill="#ffb060" opacity={0.6} filter="url(#g-sm)" />)}
			<Bean x={700} y={600} r={170} c0="#4a3020" c1="#0a0503" rot={18} />
			<path d="M590,430 C620,380 600,330 630,290 M760,420 C790,360 760,320 790,270" stroke="#fff" strokeWidth={2} fill="none" opacity={0.18} filter="url(#g-sm)" />
			<g transform="translate(1380,560)">
				<circle r={150} fill="none" stroke="#c8342a" strokeWidth={3} opacity={0.9} />
				<circle r={132} fill="none" stroke="#c8342a" strokeWidth={1} opacity={0.6} />
				<Thin text="禁" x={0} y={34} size={110} fill="#c8342a" w={900} />
			</g>
			<Tag en="Roasted before export" zh="出口前先烘过 · 种不活" />
			<Beat x={1240} y={810} label="印章落在拍上" />
			<Sub text="也门出口的咖啡豆，都要先烘过，种不活。" />
		</>
	)},
	// F3
	{art: () => {
		const proj = mapProj(1500, 960, 900, -58);
		const path = geoPath(proj);
		const a: [number, number] = [43.25, 13.3];
		const b: [number, number] = [75.77, 13.32];
		const ip = geoInterpolate(a, b);
		const line = path({type: 'LineString', coordinates: Array.from({length: 40}, (_, k) => ip(k / 39))}) ?? '';
		const [ax, ay] = proj(a) as [number, number];
		const [bx, by] = proj(b) as [number, number];
		return (
			<>
				<rect width={W} height={H} fill="#07080c" />
				<circle cx={960} cy={560} r={900} fill="url(#warm-pool)" opacity={0.5} />
				<path d={path(geoGraticule10()) ?? ''} fill="none" stroke="#c99a5a" strokeWidth={0.6} opacity={0.12} />
				<path d={path(LAND) ?? ''} fill="#1a140f" stroke="#7a5a3a" strokeWidth={1} />
				<path d={line} stroke="#f2b45a" strokeWidth={8} opacity={0.25} fill="none" filter="url(#b8)" />
				<path d={line} stroke="#ffd896" strokeWidth={2} fill="none" />
				<Glow x={ax} y={ay} r={40} />
				<Glow x={bx} y={by} r={40} />
				<text x={ax - 20} y={ay + 40} textAnchor="end" style={{fontFamily: font.serif, fontWeight: 700, fontSize: 30, fill: '#f3ead8'}}>摩卡</text>
				<text x={bx + 20} y={by + 40} style={{fontFamily: font.serif, fontWeight: 700, fontSize: 30, fill: '#f3ead8'}}>奇克马加卢尔</text>
				{Array.from({length: 7}, (_, i) => (
					<g key={i}>
						<Bean x={160 + i * 64} y={760} r={24} c0="#d8eab0" c1="#5a7a3a" rot={i * 24} />
						<circle cx={160 + i * 64} cy={760} r={36} fill="url(#ember)" opacity={0.35} />
					</g>
				))}
				<text x={130} y={830} style={{fontFamily: font.sans, fontSize: 20, letterSpacing: '0.2em', fill: '#c99a5a'}}>七颗生豆 · 1670 · 传说</text>
				<Beat x={130} y={900} label="七颗豆，一颗一个音符" />
				<Arrow d="M820,250 C900,230 980,230 1060,250" label="拉起成地图" lx={760} ly={200} />
				<Sub text="传说1670年，一位朝圣者把七颗生豆藏进胡子，带去了印度。" />
			</>
		);
	}},
	// F4
	{art: () => (
		<>
			<MapRoutes />
			<Arrow d="M1700,320 C1600,260 1480,250 1380,270" label="镜头跟航线向西，越拉越远" lx={1180} ly={190} />
		</>
	)},
	// G1
	{art: () => (
		<>
			<Room x={1100} y={360} r={900} c="#7a9a5a" base="#050805" o={0.7} />
			{Array.from({length: 22}, (_, i) => {
				const row = Math.floor(i / 8);
				const x = 120 + (i % 8) * 250 + (row % 2) * 120;
				const y = 520 + row * 220;
				return <Bean key={i} x={x} y={y} r={110 + row * 30} c0="#cfe0a8" c1="#3a4a24" rot={i * 37} blur={row === 2} />;
			})}
			{Array.from({length: 14}, (_, i) => (
				<path key={i} d={`M${200 + i * 120},${360 - (i % 3) * 30} q10,-60 0,-120`} stroke="#d8f0a8" strokeWidth={1.4} fill="none" opacity={0.45} filter="url(#g-sm)" />
			))}
			<Tag en="Green coffee" zh="生豆 · 闻起来像青草" />
			<Arrow d="M300,1000 L1600,1000" label="从地图推进云南 → 微距平移" lx={620} ly={960 - 20} />
			<Sub text="刚摘下的生豆是青绿的，闻起来像青草。" />
		</>
	)},
	// G2
	{art: () => (
		<>
			<Room x={760} y={1000} r={900} c="#d8601a" base="#060202" />
			<circle cx={760} cy={560} r={360} fill="none" stroke="#c9a070" strokeWidth={2} opacity={0.7} />
			<circle cx={760} cy={560} r={372} fill="none" stroke="#c9a070" strokeWidth={0.8} opacity={0.4} />
			{Array.from({length: 26}, (_, i) => {
				const a = 0.3 + random(`dr${i}`) * 2.4;
				const r = 120 + random(`drr${i}`) * 200;
				return <Bean key={i} x={760 + Math.cos(a) * r} y={560 + Math.sin(a) * r * 0.85} r={40} c0="#c88a3a" c1="#3a1a08" rot={i * 47} />;
			})}
			<Num text="196°C" x={1560} y={600} size={170} fill="#ffb060" />
			<Tag en="Roasting drum" zh="滚筒 · 热风与热辐射" />
			<Arrow d="M300,240 C500,110 1000,110 1200,240" label="绕滚筒环绕" lx={480} ly={90} />
			<Beat x={1340} y={720} label="温度数字一路跳" />
			<Sub text="两百度，" />
		</>
	)},
	// G3
	{art: () => (
		<>
			<Room x={960} y={560} r={900} c="#e07a2a" base="#060202" />
			<Bean x={960} y={560} r={330} c0="#8a4a1e" c1="#1a0804" rot={-8} crack />
			{Array.from({length: 26}, (_, i) => {
				const a = (i / 26) * Math.PI * 2 + 0.1;
				return <line key={i} x1={960 + Math.cos(a) * 380} y1={560 + Math.sin(a) * 420} x2={960 + Math.cos(a) * (440 + 80 * random(`cr${i}`))} y2={560 + Math.sin(a) * (480 + 80 * random(`cr${i}`))} stroke="#ffe0a0" strokeWidth={1.6} strokeLinecap="round" />;
			})}
			{Array.from({length: 18}, (_, i) => (
				<ellipse key={i} cx={960 + (random(`chx${i}`) - 0.5) * 1200} cy={560 + (random(`chy${i}`) - 0.5) * 900} rx={10} ry={4} fill="#d8b890" opacity={0.6} transform={`rotate(${i * 40},${960 + (random(`chx${i}`) - 0.5) * 1200},${560 + (random(`chy${i}`) - 0.5) * 900})`} />
			))}
			<Thin text="啪" x={1640} y={300} size={140} w={900} fill="#fff1d0" />
			<Beat x={140} y={980 - 60} label="慢动作爆裂 + 震动=重拍" />
			<Sub text="水汽撑破细胞——啪。" hl="啪" />
		</>
	)},
	// G4
	{art: () => (
		<>
			<rect width={W} height={H} fill="#06040a" />
			{Array.from({length: 420}, (_, i) => {
				const a = random(`ne${i}`) * Math.PI * 2;
				const r = Math.pow(random(`ner${i}`), 0.7) * 900;
				const c = ['#ffc070', '#c8906a', '#ff8aa0', '#c8a0ff', '#a07050', '#ffe0a0'][i % 6];
				const big = random(`neb${i}`) > 0.93;
				return <circle key={i} cx={960 + Math.cos(a) * r * 1.2} cy={540 + Math.sin(a) * r * 0.7} r={big ? 10 + random(`nes${i}`) * 14 : 1 + random(`nes${i}`) * 2.6} fill={c} opacity={big ? 0.18 : 0.75} filter={big ? 'url(#b8)' : undefined} />;
			})}
			<Glow x={960} y={540} r={260} o={0.35} />
			<Num text="1,000+" y={570} size={150} />
			{[
				['焦糖', '#ffc070', 400, 300],
				['坚果', '#c8906a', 1520, 300],
				['莓果', '#ff8aa0', 1560, 780],
				['花香', '#c8a0ff', 360, 780],
				['巧克力', '#d0a080', 960, 220],
			].map(([t, c, x, y]) => (
				<text key={t as string} x={x as number} y={y as number} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 600, fontSize: 40, fill: c as string, letterSpacing: '0.1em'}}>
					{t}
				</text>
			))}
			<Tag en="Volatile compounds" zh="已鉴定的咖啡香气物质 · 一千多种" />
			<Beat x={140} y={1000 - 70} label="香气星云爆开" />
			<Sub text="糖和氨基酸相撞，生出一千多种香气。" hl="一千多种" />
		</>
	)},
	// H1
	{art: () => (
		<>
			<Room x={1450} y={330} r={700} c="#3a4a7a" base="#05060c" />
			<rect x={1160} y={150} width={560} height={480} fill="#0a1024" stroke="#c9ced8" strokeWidth={1.4} opacity={0.9} />
			<line x1={1440} y1={150} x2={1440} y2={630} stroke="#c9ced8" strokeWidth={1.4} />
			<circle cx={1600} cy={270} r={36} fill="#f4f0e0" filter="url(#g-sm)" />
			{Array.from({length: 40}, (_, i) => <circle key={i} cx={1170 + random(`ws${i}`) * 540} cy={160 + random(`wsy${i}`) * 460} r={1} fill="#fff" opacity={0.7} />)}
			<Clock x={560} y={480} r={300} h={0} m={0} />
			<text x={560} y={880} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 500, fontSize: 52, fill: '#f6e7c8', letterSpacing: '0.08em'}}>
				15:00 → 24:00
			</text>
			<Cup x={1440} y={830} s={0.7} level={0.33} />
			<text x={1440} y={970} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 22, letterSpacing: '0.2em', fill: '#ffd896'}}>
				还剩 ≈ 1/3
			</text>
			<Tag en="Half-life ≈ 5 h" zh="半衰期约 5 小时 · 因人而异" />
			<Arrow d="M240,1000 L380,900" label="慢推" lx={120} ly={1050 - 20} />
			<Sub text="下午三点那杯，到半夜还剩近三分之一。" hl="近三分之一" />
		</>
	)},
	// H2
	{art: () => (
		<>
			<Room x={480} y={540} r={700} c="#4a2a3a" base="#07040a" />
			<Room x={1440} y={540} r={700} c="#3a2a4a" base="transparent" />
			<line x1={960} y1={80} x2={960} y2={900} stroke="#fff" strokeWidth={1} opacity={0.25} />
			{[480, 1440].map((cx, s) => (
				<g key={cx}>
					{Array.from({length: 70}, (_, i) => {
						const y = 140 + i * 10;
						const x1 = cx + Math.sin(i * 0.22) * 140;
						const x2 = cx - Math.sin(i * 0.22) * 140;
						return (
							<g key={i}>
								<circle cx={x1} cy={y} r={2.4} fill="#ff9aaa" />
								<circle cx={x2} cy={y} r={2.4} fill="#9fe8f0" />
								{i % 4 === 0 ? <line x1={x1} y1={y} x2={x2} y2={y} stroke="#fff" strokeWidth={0.8} opacity={0.4} /> : null}
							</g>
						);
					})}
					{Array.from({length: s ? 40 : 6}, (_, i) => <Glow key={i} x={cx - 320 + random(`dn${s}${i}`) * 640} y={160 + random(`dny${s}${i}`) * 680} r={14} />)}
					<text x={cx} y={940 - 40} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 600, fontSize: 40, fill: s ? '#ffd896' : '#e8e8e8'}}>
						{s ? '慢 · 失眠到天亮' : '快 · 倒头就睡'}
					</text>
				</g>
			))}
			<Tag en="CYP1A2" zh="肝脏里分解咖啡因的基因" />
			<Arrow d="M200,1000 L700,1000 M1220,1000 L1720,1000" label="两边同步横移" lx={760} ly={980} />
			<Sub text="有人一杯倒头就睡，有人失眠到天亮——快慢，部分写在基因里。" />
		</>
	)},
	// H3
	{art: () => (
		<>
			<Room x={960} y={420} r={1000} c="#2a2366" base="#05040e" />
			{Array.from({length: 12}, (_, i) => (
				<Receptor key={i} x={240 + (i % 6) * 288} y={430 + Math.floor(i / 6) * 330} s={0.75} gold={i < 4} />
			))}
			<Num text="3 → 6 → 12" y={150} size={80} fill="#9fe8f0" />
			<Tag en="Tolerance" zh="耐受 · 受体变多" />
			<Beat x={1300} y={980 - 60} label="每多一批锁一拍" />
			<Arrow d="M1840,1000 L1700,900" label="后拉" lx={1600} ly={1050 - 10} />
			<Sub text="喝得越久，大脑会多造几把锁——所以越喝，越不管用。" />
		</>
	)},
	// I1
	{art: () => (
		<>
			<Room x={1300} y={300} r={1000} c="#e8a060" base="#0a0604" />
			<rect x={760} y={60} width={1080} height={680} fill="#ffd8a8" opacity={0.08} stroke="#3a2010" strokeWidth={14} />
			<line x1={1300} y1={60} x2={1300} y2={740} stroke="#3a2010" strokeWidth={12} />
			<polygon points="760,740 1840,740 1500,1080 260,1080" fill="#ffd8a8" opacity={0.08} />
			<rect y={800} width={W} height={280} fill="#140b06" />
			<Cup x={960} y={700} s={0.9} level={0.85} />
			<g opacity={0.5}>
				<Branches x={960} y={520} s={0.9} color="#fff1dc" seed="steam" n={5} up w={3} len={110} />
			</g>
			{[930, 960, 990].map((x) => <path key={x} d={`M${x},560 C${x - 30},480 ${x + 30},400 ${x},300`} stroke="#fff" strokeWidth={6} fill="none" opacity={0.18} filter="url(#b8)" />)}
			<Tag en="Morning" zh="锁的圆 → 杯口 · 热气里浮现咖啡树" />
			<Arrow d="M260,1000 C700,1060 1200,1060 1660,1000" label="缓慢环绕杯子" lx={720} ly={1040 - 60} />
			<Sub text="你每天续的命，是一棵树六十万年的防身术，" />
		</>
	)},
	// I2
	{art: () => (
		<>
			<Room x={1300} y={300} r={1000} c="#e8a060" base="#0a0604" />
			<rect y={800} width={W} height={280} fill="#140b06" />
			<Cup x={960} y={700} s={0.9} level={0.85} />
			<LineFlower x={960} y={360} s={0.9} o={0.6} />
			{Array.from({length: 7}, (_, i) => (
				<g key={i}>
					<Bean x={720 + i * 80} y={560} r={20} c0="#ffe0a0" c1="#a06020" rot={i * 22} />
					<circle cx={720 + i * 80} cy={560} r={30} fill="url(#ember)" opacity={0.4} />
				</g>
			))}
			<Tag en="Morning" zh="热气里：花 → 七颗金豆" />
			<Sub text="一朵花的「记住我」，和七颗偷渡的种子。" hl="「记住我」" />
		</>
	)},
	// I3
	{art: () => (
		<>
			<Room x={1500} y={260} r={1300} c="#ffe0b0" base="#2a1408" />
			<Rays x={1500} y={260} n={9} o={0.22} c="#fff6e0" />
			<rect y={800} width={W} height={280} fill="#3a200e" />
			<Cup x={960} y={700} s={0.9} level={0.85} rim="#fff6e0" />
			<circle cx={1090} cy={570} r={40} fill="#fff" opacity={0.7} filter="url(#b8)" />
			<Thin text="早安。" y={380} size={100} w={600} fill="#fff6e0" />
			<Beat x={140} y={180} label="阳光照到杯口，光晕落拍" />
		</>
	)},
];

export const BOARD2_N = P.length;

export const XumingBoard2: React.FC = () => {
	loadEpisodeFonts('xuming');
	const i = useCurrentFrame();
	const p = P[i] ?? P[0];
	return (
		<AbsoluteFill style={{background: '#07060a'}}>
			{p.html ? p.html() : null}
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
				<GlowDefs />
				<defs>
					<filter id="b8" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="8" />
					</filter>
					<radialGradient id="vig3" cx="50%" cy="48%" r="72%">
						<stop offset="0.5" stopColor="#000" stopOpacity="0" />
						<stop offset="1" stopColor="#000" stopOpacity="0.85" />
					</radialGradient>
					<radialGradient id="cyan-soft" cx="50%" cy="50%" r="50%">
						<stop offset="0" stopColor="#5fd8e6" stopOpacity="0.35" />
						<stop offset="1" stopColor="#5fd8e6" stopOpacity="0" />
					</radialGradient>
					<linearGradient id="band2" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#000" stopOpacity="0" />
						<stop offset="0.5" stopColor="#000" stopOpacity="0.72" />
						<stop offset="1" stopColor="#000" stopOpacity="0" />
					</linearGradient>
					<linearGradient id="lidT" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#000" stopOpacity="0.95" />
						<stop offset="1" stopColor="#000" stopOpacity="0" />
					</linearGradient>
					<linearGradient id="lidB" x1="0" y1="1" x2="0" y2="0">
						<stop offset="0" stopColor="#000" stopOpacity="0.95" />
						<stop offset="1" stopColor="#000" stopOpacity="0" />
					</linearGradient>
					<linearGradient id="leafLit" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0" stopColor="#2a4a18" />
						<stop offset="0.5" stopColor="#6a9a3a" />
						<stop offset="1" stopColor="#2a4a18" />
					</linearGradient>
					<linearGradient id="dusk2" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#05060f" />
						<stop offset="0.55" stopColor="#1a1a3a" />
						<stop offset="1" stopColor="#7a5a4a" />
					</linearGradient>
					<linearGradient id="night" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#03040c" />
						<stop offset="0.7" stopColor="#0e1638" />
						<stop offset="1" stopColor="#1a1a30" />
					</linearGradient>
					<marker id="ah2" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
						<path d="M0,0 L10,5 L0,10 z" fill="#fff" />
					</marker>
				</defs>
				{p.art()}
				<text x={1770} y={64} textAnchor="end" style={{fontFamily: font.sans, fontSize: 18, fill: '#efe4d0', letterSpacing: '0.1em'}} opacity={0.45}>
					◆ Juno · VIBE知识大赏
				</text>
				<Grade />
			</svg>
		</AbsoluteFill>
	);
};
