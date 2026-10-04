import React from 'react';
import {random} from 'remotion';
import {noise2D} from '@remotion/noise';
import {Liquid} from '../../src/art/glow/Liquid';
import {CAFFEINE} from '../../src/art/glow/molecules';
import {font} from '../../src/lib/theme';

/**
 * Drawing kit for 《续命》 v3 (the reference's craft rules): rooms lit by one soft
 * source, fine glowing branches, thin-walled receptors and cups, lit molecule
 * models, beans, line flowers and bees, clocks, ridges, silhouette trees, rays.
 * Shared by the storyboard and the episode's scenes.
 */

export const W = 1920;
export const H = 1080;
export const F = 120;

// ---------------------------------------------------------------- shared pieces

/** a dark room lit by one soft source */
export const Room: React.FC<{x?: number; y?: number; r?: number; c: string; base?: string; o?: number}> = ({x = 960, y = 540, r = 900, c, base = '#07060a', o = 1}) => {
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

export const Glow: React.FC<{x: number; y: number; r: number; o?: number}> = ({x, y, r, o = 1}) => (
	<g opacity={o}>
		<circle cx={x} cy={y} r={r} fill="url(#ember)" />
		<circle cx={x} cy={y} r={Math.max(2, r * 0.08)} fill="#fff8ea" />
	</g>
);

export const Thin: React.FC<{text: string; x?: number; y?: number; size?: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; w?: number; ls?: string}> = ({
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

export const Num: React.FC<{text: string; x?: number; y?: number; size?: number; fill?: string; anchor?: 'start' | 'middle' | 'end'}> = ({text, x = 960, y = 540, size = 140, fill = 'url(#gold-text)', anchor = 'middle'}) => (
	<text x={x} y={y} textAnchor={anchor} style={{fontFamily: font.latin, fontWeight: 500, fontSize: size, fill, letterSpacing: '0.04em'}} filter="url(#g-sm)">
		{text}
	</text>
);

/** fine glowing branches: neurons, trees, roots */
export const Branches: React.FC<{x: number; y: number; s?: number; color: string; seed: string; n?: number; up?: boolean; w?: number; len?: number}> = ({x, y, s = 1, color, seed, n = 7, up, w = 5, len = 190}) => {
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
export const Receptor: React.FC<{x: number; y: number; s?: number; gold?: boolean; docked?: boolean}> = ({x, y, s = 1, gold, docked}) => {
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
export const Caf: React.FC<{x: number; y: number; s?: number; c?: string}> = ({x, y, s = 1, c = '#ffd896'}) => {
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

export const ELEM: Record<string, string> = {N: '#7fb8ff', O: '#ff8a7a', C: '#e8e2d4'};
export const elemOf = (label?: string) => (!label ? 'C' : label.startsWith('N') ? 'N' : label.startsWith('O') || label === 'HO' ? 'O' : 'C');
/** ball-and-stick, lit: small luminous atoms on thin bonds, slight perspective */
export const Model: React.FC<{mol: typeof CAFFEINE; hl?: (id: string) => boolean; o?: number; tint?: string}> = ({mol, hl, o = 1, tint}) => {
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
export const CORE = new Set(['C5', 'C4', 'N3', 'C2', 'N1', 'C6', 'N9', 'C8', 'N7']);

export const Synapse: React.FC<{docked?: number; gold?: number; dense?: number; children?: React.ReactNode}> = ({docked = 0, gold = 0, dense = 1, children}) => (
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

export const Cup: React.FC<{x: number; y: number; s?: number; level?: number; rim?: string}> = ({x, y, s = 1, level = 0.7, rim = '#f6e7c8'}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d={`M-110,${-140 + 280 * (1 - level)} L110,${-140 + 280 * (1 - level)} L92,140 L-92,140 Z`} fill="url(#ember)" opacity={0.85} />
		<path d="M-120,-150 L-96,150 L96,150 L120,-150" fill="none" stroke={rim} strokeWidth={2.4} />
		<ellipse cx={0} cy={-150} rx={120} ry={10} fill="none" stroke={rim} strokeWidth={1.4} opacity={0.6} />
		<path d="M118,-90 C190,-90 190,40 104,50" fill="none" stroke={rim} strokeWidth={2.4} />
	</g>
);

export const Bean: React.FC<{x: number; y: number; r: number; c0: string; c1: string; rot?: number; blur?: boolean; crack?: boolean}> = ({x, y, r, c0, c1, rot = 0, blur, crack}) => {
	const id = `bn${(c0 + c1).replace(/[^a-zA-Z0-9]/g, '')}`;
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

export const leafD = (l: number, w = 0.3) => `M0,0 C${l * 0.25},${-l * w} ${l * 0.75},${-l * w * 0.8} ${l},0 C${l * 0.75},${l * w * 0.8} ${l * 0.25},${l * w} 0,0 Z`;

export const LineFlower: React.FC<{x: number; y: number; s?: number; o?: number}> = ({x, y, s = 1, o = 1}) => (
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

export const LineBee: React.FC<{x: number; y: number; s?: number; o?: number}> = ({x, y, s = 1, o = 1}) => (
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

export const Clock: React.FC<{x: number; y: number; r: number; h: number; m?: number; c?: string}> = ({x, y, r, h, m = 0, c = '#f6e7c8'}) => {
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

export const ridgeD = (base: number, amp: number, seed: string, fq = 700) => {
	let d = `M-40,${H + 40} `;
	for (let x = -40; x <= W + 40; x += 12) d += `L${x},${base - amp * (0.5 + 0.5 * noise2D(seed, x / fq, 0))} `;
	return d + `L${W + 40},${H + 40} Z`;
};

/** fine silhouette trees: thin trunks and many small leaf clusters */
export const Trees: React.FC<{y: number; n: number; s: number; c: string; seed: string; o?: number}> = ({y, n, s, c, seed, o = 1}) => (
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

export const Rays: React.FC<{x: number; y: number; n?: number; o?: number; c?: string}> = ({x, y, n = 8, o = 0.12, c = '#ffe2a0'}) => (
	<g opacity={o} filter="url(#b8)">
		{Array.from({length: n}, (_, i) => {
			const a = 1.2 + (i / (n - 1)) * 0.75;
			return <polygon key={i} points={`${x},${y} ${x + Math.cos(a - 0.03) * 1800},${y + Math.sin(a - 0.03) * 1800} ${x + Math.cos(a + 0.03) * 1800},${y + Math.sin(a + 0.03) * 1800}`} fill={c} />;
		})}
	</g>
);

export const CupLiquid: React.FC<{r: number; swirl?: number; t?: number}> = ({r, swirl = 3, t = 12}) => (
	<div style={{position: 'absolute', left: 960 - r, top: 540 - r, width: r * 2, height: r * 2, borderRadius: '50%', overflow: 'hidden'}}>
		<div style={{position: 'absolute', left: r - 960, top: r - 540, width: W, height: H}}>
			<Liquid t={t} swirl={swirl} scale={3.2} light={[0.5, 0.42, 0.5]} gain={1.05} />
		</div>
	</div>
);
export const CupRim: React.FC<{r: number}> = ({r}) => (
	<g>
		<circle cx={960} cy={556} r={r + 90} fill="#000" opacity={0.6} filter="url(#b8)" />
		<circle cx={960} cy={540} r={r + 34} fill="none" stroke="#efe2c8" strokeWidth={46} opacity={0.07} />
		<circle cx={960} cy={540} r={r + 58} fill="none" stroke="#f6e7c8" strokeWidth={1.4} opacity={0.55} />
		<circle cx={960} cy={540} r={r + 4} fill="none" stroke="#f6e7c8" strokeWidth={1} opacity={0.35} />
	</g>
);


/** gradients and filters the kit expects; put once in each <svg> (after GlowDefs) */
export const Defs3: React.FC = () => (
	<defs>
		<filter id="b8" x="-50%" y="-50%" width="200%" height="200%">
			<feGaussianBlur stdDeviation="8" />
		</filter>
		<filter id="b3" x="-50%" y="-50%" width="200%" height="200%">
			<feGaussianBlur stdDeviation="3" />
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
);
