import React from 'react';
import {rnd, Glow} from './kit44';
/* ep44 set dressing (owner note 7): one flat-vector family — layered planes, period props, soft light shapes, dust.
   Everything is desaturated; rose-gold stays reserved for "you". */
type Pt = [number, number];
/** a light shaft from a window down to the floor: a soft quad with a fading gradient */
export const Shaft: React.FC<{id: string; a: Pt; b: Pt; c: Pt; d: Pt; col?: string; o?: number}> = ({id, a, b, c, d, col = '#f2e6d2', o = 0.09}) => <g>
	<defs><linearGradient id={id} x1={a[0]} y1={a[1]} x2={(c[0] + d[0]) / 2} y2={(c[1] + d[1]) / 2} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor={col} stopOpacity={1} /><stop offset="1" stopColor={col} stopOpacity={0} /></linearGradient></defs>
	<path d={`M${a[0]},${a[1]} L${b[0]},${b[1]} L${c[0]},${c[1]} L${d[0]},${d[1]} Z`} fill={`url(#${id})`} opacity={o} /></g>;
/** dust motes drifting inside a box */
export const Motes: React.FC<{t: number; x: number; y: number; w: number; h: number; n?: number; seed?: number; o?: number; col?: string}> = ({t, x, y, w, h, n = 24, seed = 0, o = 0.5, col = '#fff2dc'}) => <g>
	{Array.from({length: n}, (_, i) => { const px = x + ((rnd(i, 1 + seed) * w + t * (6 + 8 * rnd(i, 3 + seed))) % w), py = y + ((rnd(i, 2 + seed) * h + t * (3 + 5 * rnd(i, 4 + seed))) % h);
		return <circle key={i} cx={px} cy={py} r={1 + 1.8 * rnd(i, 5 + seed)} fill={col} opacity={o * (0.35 + 0.65 * Math.abs(Math.sin(t * 0.9 + i * 1.7)))} />; })}</g>;
/** a hanging lamp with a soft pool of light */
export const Pendant: React.FC<{x: number; y: number; len?: number; id: string; o?: number; col?: string}> = ({x, y, len = 160, id, o = 1, col = '#ffe6c0'}) => <g>
	<line x1={x} y1={y - len} x2={x} y2={y} stroke="#0e0c0c" strokeWidth={3} />
	<Glow x={x} y={y + 30} r={260} c={col} o={0.18 * o} id={`${id}a`} />
	<path d={`M${x - 46},${y + 26} Q${x},${y - 18} ${x + 46},${y + 26} Z`} fill="#1a1816" /><ellipse cx={x} cy={y + 27} rx={40} ry={6} fill={col} opacity={0.85 * o} />
	<path d={`M${x - 40},${y + 28} L${x - 220},${y + 520} L${x + 220},${y + 520} L${x + 40},${y + 28} Z`} fill={col} opacity={0.045 * o} /></g>;
/** a wall shelf with silhouetted jars / bottles / books / binders */
export const Shelf: React.FC<{x: number; y: number; w: number; kind: 'jars' | 'books' | 'files'; seed?: number; col?: string; tone?: string}> = ({x, y, w, kind, seed = 0, col = '#141414', tone = '#3a3836'}) => {
	const items: React.ReactNode[] = []; let cx = x + 10, i = 0;
	while (cx < x + w - 20) { const r = rnd(i, 11 + seed);
		if (kind === 'jars') { const ww = 34 + 30 * r, hh = 50 + 50 * rnd(i, 12 + seed); items.push(<g key={i}><rect x={cx} y={y - hh} width={ww} height={hh} rx={6} fill={col} /><rect x={cx + 4} y={y - hh - 8} width={ww - 8} height={10} rx={2} fill={col} /></g>); cx += ww + 10 + 16 * rnd(i, 13 + seed); }
		else { const ww = kind === 'files' ? 26 + 8 * r : 14 + 12 * r, hh = kind === 'files' ? 96 + 10 * rnd(i, 12 + seed) : 50 + 40 * rnd(i, 12 + seed), lean = rnd(i, 14 + seed) > 0.9 ? 8 : 0;
			const shade = ['#3a3836', '#2e2c2a', '#454240', '#33302c', '#3c3a34'][i % 5];
			items.push(<g key={i} transform={`rotate(${lean} ${cx} ${y})`}><rect x={cx} y={y - hh} width={ww} height={hh} fill={kind === 'files' ? shade : col} />{kind === 'files' && <rect x={cx + 5} y={y - hh + 16} width={ww - 10} height={14} fill="#c8c2b4" opacity={0.35} />}</g>); cx += ww + 2; }
		i++; }
	return <g><rect x={x} y={y} width={w} height={10} fill={tone} />{items}</g>;
};
/** a picture frame with a dim, indistinct picture */
export const Frame: React.FC<{x: number; y: number; w: number; h: number; oval?: boolean; col?: string}> = ({x, y, w, h, oval, col = '#2a1e16'}) => oval
	? <g><ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} fill={col} /><ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2 - 9} ry={h / 2 - 9} fill="#6a5a4a" opacity={0.55} /><ellipse cx={x + w / 2} cy={y + h * 0.42} rx={w * 0.16} ry={h * 0.18} fill={col} opacity={0.7} /></g>
	: <g><rect x={x} y={y} width={w} height={h} fill={col} /><rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} fill="#6a6250" opacity={0.5} /><path d={`M${x + 10},${y + h - 10} L${x + w * 0.4},${y + h * 0.5} L${x + w * 0.6},${y + h * 0.65} L${x + w - 10},${y + h * 0.4} L${x + w - 10},${y + h - 10} Z`} fill={col} opacity={0.45} /></g>;
/** a wallpaper motif fill (very low contrast) */
export const Wallpaper: React.FC<{id: string; x: number; y: number; w: number; h: number; col?: string; o?: number; s?: number}> = ({id, x, y, w, h, col = '#5a4436', o = 0.4, s = 1}) => <g>
	<defs><pattern id={id} x={0} y={0} width={60 * s} height={80 * s} patternUnits="userSpaceOnUse">
		<path d={`M${30 * s},${10 * s} q${10 * s},${14 * s} 0,${28 * s} q${-10 * s},${-14 * s} 0,${-28 * s} Z`} fill={col} /><circle cx={0} cy={60 * s} r={3 * s} fill={col} /><circle cx={60 * s} cy={60 * s} r={3 * s} fill={col} />
		<path d={`M${30 * s},${42 * s} v${30 * s}`} stroke={col} strokeWidth={1.4 * s} /></pattern></defs>
	<rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} opacity={o} /></g>;
/** a curtain hanging beside a window */
export const Curtain: React.FC<{x: number; y: number; w: number; h: number; flip?: boolean; col?: string}> = ({x, y, w, h, flip, col = '#3a2a22'}) => <g transform={flip ? `translate(${2 * x + w},0) scale(-1,1)` : undefined}>
	<path d={`M${x},${y} L${x + w},${y} Q${x + w * 0.7},${y + h * 0.5} ${x + w * 0.85},${y + h} L${x},${y + h} Z`} fill={col} />
	{[0.3, 0.55, 0.78].map((k, i) => <path key={i} d={`M${x + w * k},${y} Q${x + w * k * 0.85},${y + h * 0.5} ${x + w * k * 0.95},${y + h}`} stroke="#000" strokeWidth={3} opacity={0.22} fill="none" />)}
	<rect x={x - 12} y={y - 12} width={w + 40} height={10} rx={4} fill="#1e1612" /></g>;
/** a tall tiled stove (Kachelofen), Munich 1880s */
export const Stove: React.FC<{x: number; y: number; t: number; id: string}> = ({x, y, t, id}) => <g>
	<Glow x={x + 90} y={y - 120} r={240} c="#ffcf9a" o={0.12 + 0.02 * Math.sin(t * 5)} id={id} />
	<rect x={x} y={y - 420} width={180} height={420} fill="#2e2620" /><rect x={x - 14} y={y - 440} width={208} height={26} fill="#241c16" /><path d={`M${x + 10},${y - 440} Q${x + 90},${y - 500} ${x + 170},${y - 440} Z`} fill="#241c16" />
	{Array.from({length: 7}, (_, r) => Array.from({length: 3}, (_, c) => <rect key={`${r}_${c}`} x={x + 8 + c * 56} y={y - 410 + r * 52} width={52} height={48} rx={4} fill="#3a3028" />))}
	<rect x={x + 56} y={y - 120} width={68} height={52} rx={4} fill="#120e0c" /><rect x={x + 62} y={y - 112} width={56} height={10} fill="#ffcf9a" opacity={0.35 + 0.1 * Math.sin(t * 7)} /></g>;
/** flat cloud */
export const Cloud: React.FC<{x: number; y: number; s?: number; col?: string; o?: number}> = ({x, y, s = 1, col = '#5a626a', o = 0.6}) => <g transform={`translate(${x},${y}) scale(${s})`} opacity={o} fill={col}>
	<path d="M-160,20 Q-150,-20 -100,-18 Q-80,-60 -20,-50 Q20,-80 70,-46 Q130,-50 140,-8 Q180,0 170,20 Z" /><path d="M-150,10 Q-60,-6 160,12" stroke="#d8c8b8" strokeWidth={2} opacity={0.3} fill="none" /></g>;
/** a Swiss farmhouse (chalet): wide roof, dark timber */
export const Farm: React.FC<{x: number; y: number; s?: number; col?: string; win?: boolean}> = ({x, y, s = 1, col = '#2e3634', win = true}) => <g transform={`translate(${x},${y}) scale(${s})`}>
	<rect x={-70} y={-70} width={140} height={70} fill={col} /><path d="M-100,-62 L0,-130 L100,-62 Z" fill={col} /><path d="M-100,-62 L0,-130 L100,-62" stroke="#e2d0bc" strokeWidth={2.5} fill="none" opacity={0.35} />
	{win && [-40, 0, 40].map((wx, i) => <rect key={i} x={wx - 9} y={-50} width={18} height={16} fill="#d8c8a8" opacity={0.35} />)}
	<rect x={90} y={-46} width={50} height={46} fill={col} /><path d="M84,-40 L115,-66 L146,-40 Z" fill={col} /></g>;
/** a split-rail fence, scrolling */
export const Fence: React.FC<{y: number; scroll: number; col?: string; gap?: number; h?: number; x0?: number; x1?: number}> = ({y, scroll, col = '#1a1e1c', gap = 150, h = 70, x0 = -240, x1 = 2160}) => {
	const off = ((scroll % gap) + gap) % gap, posts: number[] = []; for (let x = x0 - off; x < x1 + gap; x += gap) posts.push(x);
	return <g fill={col}>{posts.map((x, i) => <rect key={i} x={x - 5} y={y - h} width={10} height={h + 6} />)}<rect x={x0} y={y - h + 12} width={x1 - x0} height={7} /><rect x={x0} y={y - h + 40} width={x1 - x0} height={7} /></g>;
};
/** wall clock */
export const Clock: React.FC<{x: number; y: number; r: number; t: number}> = ({x, y, r, t}) => <g transform={`translate(${x},${y})`}>
	<circle r={r + 6} fill="#262422" /><circle r={r} fill="#cfc8b8" opacity={0.55} />
	{Array.from({length: 12}, (_, i) => { const a = i * Math.PI / 6; return <line key={i} x1={Math.cos(a) * r * 0.8} y1={Math.sin(a) * r * 0.8} x2={Math.cos(a) * r * 0.92} y2={Math.sin(a) * r * 0.92} stroke="#262422" strokeWidth={2} />; })}
	<line x1={0} y1={0} x2={0} y2={-r * 0.55} stroke="#262422" strokeWidth={4} transform="rotate(300)" /><line x1={0} y1={0} x2={0} y2={-r * 0.8} stroke="#262422" strokeWidth={2.5} transform={`rotate(${t * 36})`} /></g>;
