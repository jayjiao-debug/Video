import React from 'react';
import {Easing, interpolate, random} from 'remotion';
import TL from './timeline.json';

/**
 * 《量子计算机不是同时算》 (ep12, voice-over) · Look A "Phosphor Scope": the shared instrument.
 * Palette, type, helpers (traces with phosphor glow and persistence, readouts with lock-on, stamps, cursors),
 * the scope frame (graticule, chapter label, status strip, corner mark, raster, vignette, grain) and the
 * subtitle band. Everything is a pure function of the film clock T (seconds).
 */

export const FPS = 30;
export const W = 1920;
export const H = 1080;

export const C = {
	screen: '#020604',
	grat: '#1C3D2C',
	gratRows: '#173323',
	frame: '#2A5A40',
	trace: '#7DFFB3',
	dim: '#3E9D6C',
	tex: '#5FD99A',
	hot: '#E9FFF2',
	ro: '#F4FFF8',
	red: '#FF3B30',
	redL: '#FF6B5F',
	redHot: '#FFE3E0',
	plate: '#04100A',
	gold: '#F1C56D',
	ink: '#F3EDE2',
};
export const MONO = '"DejaVu Sans Mono", monospace';
export const SANS = '"Noto Sans CJK SC", sans-serif';
export const SERIF = '"Noto Serif CJK SC", serif';

// ---------------------------------------------------------------- the clock

export type Line = {id: string; section: string; from: number; to: number; vo: string; sub: string; screen: string[]};
export const LINES = TL.lines as Line[];
export const TLX = TL;
const byId: Record<string, Line> = Object.fromEntries(LINES.map((l) => [l.id, l]));
/** start (or end) of a VO line, seconds */
export const S = (id: string, off = 0) => byId[id].from + off;
export const E = (id: string, off = 0) => byId[id].to + off;

export const ez = {
	arrive: Easing.bezier(0.2, 0.8, 0.2, 1),
	io: Easing.inOut(Easing.cubic),
	in: Easing.in(Easing.cubic),
	lin: (x: number) => x,
};
/** 0..1 progress from second `a` over `d` seconds */
export const pr = (T: number, a: number, d = 0.4, e: (x: number) => number = ez.arrive) =>
	interpolate(T, [a, a + Math.max(1 / FPS, d)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));

/** readout lock-on: flicker 2 frames at 40 %, 1 at 100 %, 1 at 70 %, then hold */
export const lock = (T: number, at: number) => {
	const k = Math.floor((T - at) * FPS + 1e-6);
	if (k < 0) return 0;
	return [0.4, 0.4, 1, 0.7][k] ?? 1;
};
/** stamp scale: 2–4 frames in from 1.6, settle 1.06 → 1 */
export const stampK = (T: number, at: number) => {
	const k = (T - at) * FPS;
	if (k < 0) return 0;
	if (k < 3) return 1.6 - 0.54 * (k / 3);
	return 1 + 0.06 * Math.exp(-(k - 3) / 3);
};

// ---------------------------------------------------------------- drawing helpers

export const path = (fn: (x: number) => number, x0: number, x1: number, step = 3) => {
	let d = '';
	for (let x = x0; x <= x1 + 0.01; x += step) d += `${d ? 'L' : 'M'}${x.toFixed(1)},${fn(x).toFixed(1)}`;
	return d;
};
export const xyPath = (pts: [number, number][], close = false) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('') + (close ? 'Z' : '');

/** a phosphor trace: blurred underlay + core + hot core; `ghosts` are earlier frames' paths (persistence) */
export const Tr: React.FC<{d: string; color?: string; w?: number; o?: number; glow?: boolean; hot?: boolean; ghosts?: string[]; dash?: string}> = ({
	d,
	color = C.trace,
	w = 2.6,
	o = 1,
	glow = true,
	hot = false,
	ghosts,
	dash,
}) => (
	<g opacity={o}>
		{ghosts?.map((g, i) => <path key={i} d={g} fill="none" stroke={color} strokeWidth={w} opacity={[0.35, 0.18, 0.08][i] ?? 0} strokeLinejoin="round" />)}
		{glow ? <path d={d} fill="none" stroke={color} strokeWidth={w * 4} opacity={0.2} filter="url(#phos)" strokeLinejoin="round" strokeDasharray={dash} /> : null}
		<path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={dash} />
		{hot ? <path d={d} fill="none" stroke={color === C.red ? C.redHot : C.hot} strokeWidth={1.2} opacity={0.8} strokeLinejoin="round" /> : null}
	</g>
);

/** the beam head: a hot dot with a glow */
export const Beam: React.FC<{x: number; y: number; red?: boolean; o?: number}> = ({x, y, red, o = 1}) => (
	<g opacity={o}>
		<circle cx={x} cy={y} r={18} fill={red ? C.red : C.trace} opacity={0.35} filter="url(#phos)" />
		<circle cx={x} cy={y} r={5} fill={red ? C.redHot : C.hot} />
	</g>
);

const SUP: Record<string, string> = {'⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', 'ⁿ': 'n'};
/** split text into normal / superscript runs (Noto CJK has no ⁵⁹⁰ glyphs, so exponents are drawn as tspans) */
export const runs = (s: string) => {
	const out: {t: string; sup: boolean}[] = [];
	for (const ch of s) {
		const sup = ch in SUP;
		const c = sup ? SUP[ch] : ch;
		if (out.length && out[out.length - 1].sup === sup) out[out.length - 1].t += c;
		else out.push({t: c, sup});
	}
	return out;
};

/** SVG text with superscripts and an optional glow halo */
export const Tx: React.FC<{
	x: number;
	y: number;
	size: number;
	children: string;
	fill?: string;
	font?: string;
	weight?: number;
	anchor?: 'start' | 'middle' | 'end';
	o?: number;
	halo?: boolean;
	ls?: number;
	scale?: number;
	rot?: number;
}> = ({x, y, size, children, fill = C.ro, font = MONO, weight = 700, anchor = 'start', o = 1, halo = false, ls = 0, scale = 1, rot = 0}) => {
	const rs = runs(children);
	const body = (k: string, extra: React.SVGProps<SVGTextElement>) => (
		<text key={k} x={x} y={y} textAnchor={anchor} style={{fontFamily: font, fontWeight: weight, fontSize: size, letterSpacing: ls}} fill={fill} {...extra}>
			{rs.map((r, i) =>
				r.sup ? (
					<tspan key={i} fontSize={size * 0.62} dy={-size * 0.42}>
						{r.t}
					</tspan>
				) : (
					<tspan key={i} dy={i > 0 && rs[i - 1].sup ? size * 0.42 : 0}>
						{r.t}
					</tspan>
				),
			)}
		</text>
	);
	if (o <= 0) return null;
	return (
		<g opacity={o} transform={scale !== 1 || rot ? `translate(${x},${y}) rotate(${rot}) scale(${scale}) translate(${-x},${-y})` : undefined}>
			{halo ? body('h', {filter: 'url(#phosHero)', opacity: 0.55}) : null}
			{body('c', {})}
		</g>
	);
};

/** a stamp: text in a 3 px box, rotated, slammed in */
export const Stamp: React.FC<{x: number; y: number; T: number; at: number; text: string; size: number; color?: string; rot?: number; w?: number; font?: string; o?: number}> = ({
	x,
	y,
	T,
	at,
	text,
	size,
	color = C.ro,
	rot = -4,
	w,
	font = SANS,
	o = 1,
}) => {
	const k = stampK(T, at);
	if (k <= 0 || o <= 0) return null;
	const bw = w ?? [...text].reduce((n, ch) => n + (/[\x00-\x7f]/.test(ch) ? 0.6 : 1) * size, 0) + size * 0.9;
	const bh = size * 1.45;
	return (
		<g transform={`translate(${x},${y}) rotate(${rot}) scale(${k})`} opacity={o * clamp((T - at) * FPS / 2)}>
			<rect x={-bw / 2} y={-bh / 2} width={bw} height={bh} rx={6} fill={C.plate} fillOpacity={0.85} stroke={color} strokeWidth={3} />
			<text x={0} y={size * 0.36} textAnchor="middle" style={{fontFamily: font, fontWeight: 900, fontSize: size}} fill={color}>
				{text}
			</text>
		</g>
	);
};

/** a backing plate behind labels that sit over traces */
export const Plate: React.FC<{x: number; y: number; w: number; h: number; o?: number}> = ({x, y, w, h, o = 1}) => (
	<rect x={x} y={y} width={w} height={h} rx={8} fill={C.plate} opacity={0.92 * o} />
);

/** vertical cursor */
export const VCursor: React.FC<{x: number; y0?: number; y1?: number; o?: number; solid?: boolean}> = ({x, y0 = 100, y1 = 800, o = 1, solid}) => (
	<g opacity={o}>
		<line x1={x} y1={y0} x2={x} y2={y1} stroke={C.red} strokeWidth={solid ? 16 : 8} opacity={0.2} filter="url(#phos)" />
		<line x1={x} y1={y0} x2={x} y2={y1} stroke={C.red} strokeWidth={solid ? 4 : 2} strokeDasharray={solid ? undefined : '10 8'} opacity={0.9} />
		<path d={`M${x - 12},${y0 - 2} L${x + 12},${y0 - 2} L${x},${y0 + 20} Z`} fill={C.red} />
	</g>
);
export const HCursor: React.FC<{y: number; x0?: number; x1?: number; o?: number}> = ({y, x0 = 60, x1 = 1860, o = 1}) => (
	<g opacity={o}>
		<line x1={x0} y1={y} x2={x1} y2={y} stroke={C.red} strokeWidth={8} opacity={0.2} filter="url(#phos)" />
		<line x1={x0} y1={y} x2={x1} y2={y} stroke={C.red} strokeWidth={2} strokeDasharray="10 8" opacity={0.9} />
		<path d={`M${x0 - 2},${y - 12} L${x0 - 2},${y + 12} L${x0 + 20},${y} Z`} fill={C.red} />
	</g>
);

/** a fixed-width mono readout whose digits light left → right (ghost digits keep the width) */
export const Counter: React.FC<{x: number; y: number; size: number; text: string; lit: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; halo?: boolean}> = ({
	x,
	y,
	size,
	text,
	lit,
	fill = C.ro,
	anchor = 'start',
	halo = true,
}) => {
	const chars = [...text];
	const digits = chars.filter((c) => /\d/.test(c)).length;
	const n = Math.floor(lit * digits + 1e-6);
	return (
		<g>
			<text x={x} y={y} textAnchor={anchor} style={{fontFamily: MONO, fontWeight: 700, fontSize: size}} fill={C.grat}>
				{text}
			</text>
			{[halo ? 'h' : '', 'c'].filter(Boolean).map((key) => {
				let k = 0;
				return (
				<text key={key} x={x} y={y} textAnchor={anchor} style={{fontFamily: MONO, fontWeight: 700, fontSize: size}} filter={key === 'h' ? 'url(#phosHero)' : undefined} opacity={key === 'h' ? 0.5 : 1}>
					{chars.map((c, i) => {
						const isD = /\d/.test(c);
						const on = isD ? k++ < n : k <= n && n > 0;
						return (
							<tspan key={i} fill={on ? fill : 'transparent'}>
								{c}
							</tspan>
						);
					})}
				</text>
				);
			})}
		</g>
	);
};

// ---------------------------------------------------------------- the scope frame

export const Defs: React.FC<{f: number}> = ({f}) => (
	<defs>
		<filter id="phos" filterUnits="userSpaceOnUse" x={-200} y={-200} width={2320} height={1480}>
			<feGaussianBlur stdDeviation={6} />
		</filter>
		<filter id="phosHero" filterUnits="userSpaceOnUse" x={-200} y={-200} width={2320} height={1480}>
			<feGaussianBlur stdDeviation={9} />
		</filter>
		<filter id="soft" filterUnits="userSpaceOnUse" x={-200} y={-200} width={2320} height={1480}>
			<feGaussianBlur stdDeviation={14} />
		</filter>
		<radialGradient id="scrGlow" cx="50%" cy="45%" r="75%">
			<stop offset="0" stopColor="#07140D" />
			<stop offset="0.6" stopColor="#030A06" />
			<stop offset="1" stopColor="#010302" />
		</radialGradient>
		<radialGradient id="vig" cx="50%" cy="50%" r="72%">
			<stop offset="0.6" stopColor="#000" stopOpacity="0" />
			<stop offset="1" stopColor="#000" stopOpacity="0.45" />
		</radialGradient>
		<pattern id="raster" width={4} height={4} patternUnits="userSpaceOnUse">
			<rect width={4} height={1} fill="#000" opacity={0.08} />
		</pattern>
		<clipPath id="scr">
			<rect x={60} y={0} width={1800} height={800} />
		</clipPath>
		<filter id="grain" x={0} y={0} width="100%" height="100%">
			<feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={f % 6} result="n" />
			<feColorMatrix type="saturate" values="0" />
		</filter>
		<radialGradient id="brand-glow">
			<stop offset="0" stopColor="#ffe7b0" stopOpacity="0.9" />
			<stop offset="0.35" stopColor="#f1c56d" stopOpacity="0.35" />
			<stop offset="1" stopColor="#f1c56d" stopOpacity="0" />
		</radialGradient>
		<linearGradient id="wallBand" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor={C.trace} stopOpacity="0" />
			<stop offset="0.5" stopColor={C.trace} stopOpacity="0.25" />
			<stop offset="1" stopColor={C.trace} stopOpacity="0" />
		</linearGradient>
	</defs>
);

export type GratKind = 'full' | 'rows' | 'xy' | 'split' | 'none' | 'logy';

/** the graticule: 10 × 8 dotted divisions in x 60–1860, y 100–800 */
export const Graticule: React.FC<{kind?: GratKind; o?: number; pulse?: number}> = ({kind = 'full', o = 1, pulse = 0}) => {
	if (kind === 'none' || o <= 0) return null;
	const x0 = 60;
	const x1 = 1860;
	const y0 = 100;
	const y1 = 800;
	const col = kind === 'rows' ? C.gratRows : C.grat;
	const lines: React.ReactNode[] = [];
	for (let i = 1; i < 10; i++) {
		const x = x0 + ((x1 - x0) * i) / 10;
		lines.push(<line key={`v${i}`} x1={x} y1={y0} x2={x} y2={y1} stroke={col} strokeWidth={1.5} strokeDasharray="2 7" />);
	}
	for (let j = 1; j < 8; j++) {
		const y = y0 + ((y1 - y0) * j) / 8;
		lines.push(<line key={`h${j}`} x1={x0} y1={y} x2={x1} y2={y} stroke={col} strokeWidth={1.5} strokeDasharray="2 7" />);
	}
	const cy = (y0 + y1) / 2;
	const cx = (x0 + x1) / 2;
	const ticks: React.ReactNode[] = [];
	if (kind !== 'rows') {
		for (let i = 0; i <= 50; i++) {
			const x = x0 + ((x1 - x0) * i) / 50;
			ticks.push(<line key={`tx${i}`} x1={x} y1={cy - 7} x2={x} y2={cy + 7} stroke={col} strokeWidth={2} />);
		}
		for (let j = 0; j <= 40; j++) {
			const y = y0 + ((y1 - y0) * j) / 40;
			ticks.push(<line key={`ty${j}`} x1={cx - 7} y1={y} x2={cx + 7} y2={y} stroke={col} strokeWidth={2} />);
		}
	}
	return (
		<g opacity={o}>
			{lines}
			{kind !== 'rows' ? (
				<>
					<line x1={x0} y1={cy} x2={x1} y2={cy} stroke={col} strokeWidth={2} />
					<line x1={cx} y1={y0} x2={cx} y2={y1} stroke={col} strokeWidth={2} />
				</>
			) : null}
			{ticks}
			<rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="none" stroke={pulse > 0 ? C.dim : C.frame} strokeWidth={2.5 + 2 * pulse} />
			{kind === 'split' ? <line x1={900} y1={y0} x2={900} y2={y1} stroke={C.frame} strokeWidth={2.5} /> : null}
		</g>
	);
};

const GLYPHS = '0123456789ABCDEF#$%&*+=<>?';
/** chapter label (top-left, 34 px) with a 6-frame scramble when it changes */
export const Chapter: React.FC<{text: string; T: number; since: number; o?: number}> = ({text, T, since, o = 1}) => {
	const k = since <= 0 ? 99 : Math.floor((T - since) * FPS);
	const chars = [...text];
	const shown = chars.map((c, i) => (k >= 6 || c === ' ' || c === '·' ? c : k < 0 ? '' : i <= k * 2 ? GLYPHS[Math.floor(random(`g${i}${k}`) * GLYPHS.length)] : ''));
	return (
		<text x={64} y={78} style={{fontFamily: `${MONO}, ${SANS}`, fontWeight: 500, fontSize: 34, letterSpacing: 2}} fill={C.trace} opacity={0.85 * o}>
			{k >= 6 ? text : shown.join('')}
		</text>
	);
};

export const Status: React.FC<{text: string; o?: number}> = ({text, o = 1}) => (
	<text x={980} y={70} textAnchor="middle" style={{fontFamily: MONO, fontWeight: 500, fontSize: 24}} fill={C.tex} opacity={0.55 * o}>
		{text}
	</text>
);

export const Corner: React.FC<{o?: number}> = ({o = 1}) => (
	<text x={W - 56} y={70} textAnchor="end" style={{fontFamily: SANS, fontWeight: 500, fontSize: 24, letterSpacing: 3}} fill={C.ro} opacity={0.55 * o}>
		◆ Juno · VIBE知识大赏
	</text>
);

/** full-frame finishing: raster inside the graticule, vignette, grain */
export const Finish: React.FC<{f: number}> = ({f}) => (
	<>
		<rect x={60} y={100} width={1800} height={700} fill="url(#raster)" />
		<rect width={W} height={H} fill="url(#vig)" />
		<rect width={W} height={H} filter="url(#grain)" opacity={0.06} style={{mixBlendMode: 'overlay'}} />
	</>
);

// ---------------------------------------------------------------- subtitles (HTML)

/** the subtitle band: white Noto Serif Bold 46 px on a dark soft band; [keywords] underlined; exponents as <sup> */
export const Subtitle: React.FC<{T: number}> = ({T}) => {
	const i = LINES.findIndex((l, k) => {
		const next = LINES[k + 1];
		const end = next && next.from - l.to < 1.0 ? next.from : Math.max(l.to + 0.12, l.from + 1.2);
		return T >= (k === 0 ? 0 : l.from - 1 / FPS) && T < end;
	});
	if (i < 0) return null;
	const l = LINES[i];
	const o = i === 0 ? 1 : clamp((T - l.from + 1 / FPS) * 15);
	const parts = l.sub.split(/(\[[^\]]+\])/).filter(Boolean);
	const width = Math.min(1400, Math.max(900, [...l.sub].length * 50 + 180));
	return (
		<div style={{position: 'absolute', left: 0, top: 820, width: W, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: o}}>
			<div style={{position: 'absolute', width, height: 104, borderRadius: 60, background: 'rgba(2,6,4,.85)', filter: 'blur(14px)'}} />
			<div style={{position: 'relative', fontFamily: SERIF, fontWeight: 700, fontSize: 46, letterSpacing: 2, color: '#FFFFFF', textShadow: '0 2px 10px rgba(0,0,0,.65)', whiteSpace: 'nowrap'}}>
				{parts.map((p, j) => {
					const kw = p.startsWith('[');
					const txt = kw ? p.slice(1, -1) : p;
					return (
						<span key={j} style={kw ? {textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,.6)', textDecorationThickness: 3, textUnderlineOffset: 8} : undefined}>
							{runs(txt).map((r, k) => (r.sup ? <sup key={k} style={{fontSize: '0.62em'}}>{r.t}</sup> : <React.Fragment key={k}>{r.t}</React.Fragment>))}
						</span>
					);
				})}
			</div>
		</div>
	);
};
