import React from 'react';
import {AbsoluteFill} from 'remotion';

/* ep27 look "看得见的空气": a floodlit night test site at dusk (mid-tone blues, not black), a pearl-white car as the
   brightest thing in frame, the air drawn as drifting particles; cut-aways turn the car into x-ray glass.
   Accent: amber for numbers, frost-white for gas. 思源黑体 for every label. */
export const W = 1920, H = 1080, FPS = 30;
export const SANS = '"Noto Sans CJK SC", sans-serif';
export const SERIF = '"Noto Serif CJK SC", serif';
export const K = {
	skyTop: '#16233a', skyMid: '#2b3f5c', skyLow: '#56637c', glow: '#c99272',
	ground: '#232a35', groundHi: '#3a4452',
	steel: '#8d99a8', steelDk: '#4a5462', steelHi: '#c9d3de',
	ink: '#f4f6f8', mute: 'rgba(236,241,247,0.76)',
	amber: '#ffb547', frost: '#e9f6ff', air: '#bfe3ff', xray: '#7fd1ff', red: '#ff6b5a',
};

/* deterministic random */
export const rng = (seed: number) => () => {
	seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** air particles inside a box; density(x,y) in 0..1 thins them out; drift moves them with time */
export const Air: React.FC<{x: number; y: number; w: number; h: number; n: number; seed?: number; density?: (x: number, y: number) => number; t?: number; col?: string; r?: number; o?: number; drift?: [number, number]}> = ({x, y, w, h, n, seed = 7, density, t = 0, col = K.air, r = 2.4, o = 0.75, drift = [6, -3]}) => {
	const R = rng(seed);
	const out: React.ReactNode[] = [];
	for (let i = 0; i < n; i++) {
		const px = R(), py = R(), pr = R(), ph = R() * Math.PI * 2, keep = R();
		let xx = x + ((px * w + drift[0] * t + Math.sin(t * 0.7 + ph) * 6) % w + w) % w;
		let yy = y + ((py * h + drift[1] * t + Math.cos(t * 0.6 + ph) * 6) % h + h) % h;
		if (density && keep > density(xx, yy)) continue;
		out.push(<circle key={i} cx={xx} cy={yy} r={r * (0.55 + pr * 0.9)} fill={col} opacity={o * (0.35 + pr * 0.65)} />);
	}
	return <g>{out}</g>;
};

/** series subtitle: 黑体 900, white, gold/amber key words, on its own dark rounded strip */
export const Sub: React.FC<{t: string}> = ({t}) => {
	if (!t) return null;
	const parts = t.split(/(\[[^\]]+\])/).filter(Boolean);
	return (
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', justifyContent: 'center'}}>
			<div style={{background: 'rgba(6,8,13,0.80)', borderRadius: 18, padding: '10px 34px', fontFamily: SANS, fontWeight: 900, fontSize: 64, color: '#fff', letterSpacing: '0.03em'}}>
				{parts.map((p, i) => (p.startsWith('[') ? <span key={i} style={{color: K.amber}}>{p.slice(1, -1)}</span> : <span key={i}>{p}</span>))}
			</div>
		</div>
	);
};

/** a label on a feathered scrim (no box) */
export const Lab: React.FC<{x: number; y: number; children: React.ReactNode; size?: number; col?: string; weight?: number; anchor?: 'start' | 'middle' | 'end'; o?: number; scrim?: number}> = ({x, y, children, size = 52, col = K.ink, weight = 800, anchor = 'middle', o = 1, scrim = 0.5}) => {
	const len = typeof children === 'string' ? [...children].length : 8;
	const ww = len * size * 1.0 + size;
	const x0 = anchor === 'middle' ? x - ww / 2 : anchor === 'end' ? x - ww + size / 2 : x - size / 2;
	return (
		<g opacity={o}>
			{scrim > 0 && <rect x={x0} y={y - size * 1.05} width={ww} height={size * 1.55} rx={size * 0.7} fill="#0b1220" opacity={scrim} style={{filter: 'blur(16px)'}} />}
			<text x={x} y={y} textAnchor={anchor} style={{fontFamily: SANS, fontSize: size, fontWeight: weight, letterSpacing: '0.02em', paintOrder: 'stroke'}} stroke="rgba(8,12,20,0.55)" strokeWidth={size * 0.06} fill={col}>{children}</text>
		</g>
	);
};

/** dusk sky + wet concrete ground with a horizon line at hy */
export const Site: React.FC<{hy?: number; children?: React.ReactNode}> = ({hy = 860, children}) => (
	<AbsoluteFill>
		<AbsoluteFill style={{background: `linear-gradient(180deg, ${K.skyTop} 0%, ${K.skyMid} 52%, ${K.skyLow} ${(hy / H) * 100 - 4}%, ${K.glow} ${(hy / H) * 100}%, ${K.ground} ${(hy / H) * 100 + 0.2}%, #1a2029 100%)`}} />
		<AbsoluteFill style={{background: `radial-gradient(900px 200px at 70% ${hy}px, rgba(255,190,140,0.28), rgba(255,190,140,0) 70%)`}} />
		{children}
	</AbsoluteFill>
);
export const Vignette: React.FC = () => <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 55%, rgba(4,8,16,0.55) 100%)', pointerEvents: 'none'}} />;
