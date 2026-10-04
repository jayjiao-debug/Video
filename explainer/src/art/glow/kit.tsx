import React from 'react';
import {random} from 'remotion';
import {font} from '../../lib/theme';

/**
 * The Amber Night kit: everything lives on near-black, lit by one warm source;
 * objects are light (glowing line-art, liquid gold, embers) rather than drawn
 * characters. Shared by 《续命》 v2 and any later episode in this look.
 */
export const AMBER = {
	ink: '#0b0806',
	ink2: '#140d08',
	brown: '#3a1f0e',
	amber: '#e0902e',
	gold: '#f4c46a',
	cream: '#f6ead2',
	dim: '#8a7660',
	cyan: '#7fd4d8',
	red: '#d5452e',
	green: '#9cc46a',
};

/** Filters and gradients every frame needs. Put once inside each <svg>. */
export const GlowDefs: React.FC = () => (
	<defs>
		<filter id="g-sm" x="-50%" y="-50%" width="200%" height="200%">
			<feGaussianBlur stdDeviation="3" result="b" />
			<feMerge>
				<feMergeNode in="b" />
				<feMergeNode in="SourceGraphic" />
			</feMerge>
		</filter>
		<filter id="g-md" x="-50%" y="-50%" width="200%" height="200%">
			<feGaussianBlur stdDeviation="8" result="b" />
			<feMerge>
				<feMergeNode in="b" />
				<feMergeNode in="b" />
				<feMergeNode in="SourceGraphic" />
			</feMerge>
		</filter>
		<filter id="g-lg" x="-80%" y="-80%" width="260%" height="260%">
			<feGaussianBlur stdDeviation="22" />
		</filter>
		<filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
			<feGaussianBlur stdDeviation="1.2" />
		</filter>
		<filter id="grain" x="0" y="0" width="100%" height="100%">
			<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} />
			<feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0.9 0" />
		</filter>
		<filter id="stone" x="0" y="0" width="100%" height="100%">
			<feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves={5} seed={8} result="n" />
			<feDiffuseLighting in="n" surfaceScale={3.2} lightingColor="#c9a27a" result="l">
				<feDistantLight azimuth={235} elevation={38} />
			</feDiffuseLighting>
			<feComposite in="l" in2="SourceGraphic" operator="in" />
		</filter>
		<radialGradient id="warm-pool" cx="50%" cy="50%" r="50%">
			<stop offset="0" stopColor="#6a3a14" stopOpacity="0.85" />
			<stop offset="0.45" stopColor="#2a160a" stopOpacity="0.5" />
			<stop offset="1" stopColor="#0b0806" stopOpacity="0" />
		</radialGradient>
		<radialGradient id="ember" cx="50%" cy="50%" r="50%">
			<stop offset="0" stopColor="#fff2cc" />
			<stop offset="0.25" stopColor="#f4c46a" />
			<stop offset="0.6" stopColor="#e0902e" stopOpacity="0.35" />
			<stop offset="1" stopColor="#e0902e" stopOpacity="0" />
		</radialGradient>
		<radialGradient id="cyan-pool" cx="50%" cy="50%" r="50%">
			<stop offset="0" stopColor="#7fd4d8" stopOpacity="0.9" />
			<stop offset="1" stopColor="#7fd4d8" stopOpacity="0" />
		</radialGradient>
		<radialGradient id="vig" cx="50%" cy="48%" r="70%">
			<stop offset="0.45" stopColor="#000" stopOpacity="0" />
			<stop offset="1" stopColor="#000" stopOpacity="0.92" />
		</radialGradient>
		<linearGradient id="gold-text" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#fff1c8" />
			<stop offset="0.5" stopColor="#f4c46a" />
			<stop offset="1" stopColor="#c27a26" />
		</linearGradient>
	</defs>
);

/** Near-black room with one warm pool of light at (x, y). */
export const Night: React.FC<{x?: number; y?: number; r?: number; glow?: number; cool?: boolean}> = ({x = 960, y = 560, r = 900, glow = 1, cool}) => (
	<g>
		<rect width={1920} height={1080} fill={cool ? '#05080a' : AMBER.ink} />
		<circle cx={x} cy={y} r={r} fill={cool ? 'url(#cyan-pool)' : 'url(#warm-pool)'} opacity={glow * (cool ? 0.12 : 1)} />
	</g>
);

/** Vignette + film grain, drawn last. */
export const Finish: React.FC<{vig?: number; grain?: number}> = ({vig = 1, grain = 0.06}) => (
	<g pointerEvents="none">
		<rect width={1920} height={1080} fill="url(#vig)" opacity={vig} />
		<rect width={1920} height={1080} filter="url(#grain)" opacity={grain} style={{mixBlendMode: 'overlay'}} />
	</g>
);

/** Floating motes / bubbles drifting up through the light. */
export const Motes: React.FC<{f: number; n?: number; seed?: string; ring?: boolean; color?: string; speed?: number; y0?: number; y1?: number; o?: number}> = ({
	f,
	n = 40,
	seed = 'm',
	ring,
	color = AMBER.gold,
	speed = 1,
	y0 = 1120,
	y1 = -40,
	o = 1,
}) => (
	<g>
		{Array.from({length: n}, (_, i) => {
			const sp = (0.4 + random(`${seed}s${i}`)) * speed;
			const u = (random(`${seed}u${i}`) + (f * sp) / 900) % 1;
			const x = random(`${seed}x${i}`) * 1920 + Math.sin(u * 7 + i) * 24;
			const y = y0 + (y1 - y0) * u;
			const r = 1.5 + random(`${seed}r${i}`) * (ring ? 7 : 3);
			const a = Math.sin(u * Math.PI) * (0.25 + 0.6 * random(`${seed}a${i}`)) * o;
			return ring ? (
				<circle key={i} cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth={1.2} opacity={a} />
			) : (
				<circle key={i} cx={x} cy={y} r={r} fill={color} opacity={a} />
			);
		})}
	</g>
);

/** Specimen label, upper left (inset below Douyin's own watermark): small Latin caps over a Chinese line. */
export const Label: React.FC<{en: string; zh: string; o?: number; x?: number; y?: number}> = ({en, zh, o = 1, x = 150, y = 132}) => (
	<g opacity={o}>
		<text x={x} y={y} style={{fontFamily: font.sans, fontSize: 17, letterSpacing: '0.28em', fill: AMBER.amber, fontWeight: 600}} opacity={0.75}>
			{en.toUpperCase()}
		</text>
		<text x={x} y={y + 32} style={{fontFamily: font.sans, fontSize: 22, letterSpacing: '0.12em', fill: AMBER.cream}} opacity={0.72}>
			{zh}
		</text>
	</g>
);

/**
 * A centred statement in heavy serif; text inside [brackets] is set in amber.
 * `o` fades it; it never moves once it has landed.
 */
export const Statement: React.FC<{text: string; o?: number; y?: number; size?: number; x?: number; anchor?: 'middle' | 'start'}> = ({text, o = 1, y = 560, size = 64, x = 960, anchor = 'middle'}) => {
	const parts = text.split(/(\[[^\]]+\])/).filter(Boolean);
	return (
		<text x={x} y={y} textAnchor={anchor} opacity={o} style={{fontFamily: font.serif, fontWeight: 900, fontSize: size, fill: AMBER.cream, letterSpacing: '0.04em'}} filter="url(#g-sm)">
			{parts.map((p, i) =>
				p.startsWith('[') ? (
					<tspan key={i} fill={AMBER.gold}>
						{p.slice(1, -1)}
					</tspan>
				) : (
					<tspan key={i}>{p}</tspan>
				),
			)}
		</text>
	);
};

/** A glowing ring (cell, receptor, lens). */
export const Ring: React.FC<{x: number; y: number; r: number; o?: number; color?: string; w?: number; dash?: string; fill?: number}> = ({x, y, r, o = 1, color = AMBER.gold, w = 3, dash, fill = 0.08}) => (
	<g opacity={o}>
		<circle cx={x} cy={y} r={r} fill={color} opacity={fill} />
		<circle cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth={w} strokeDasharray={dash} filter="url(#g-sm)" />
	</g>
);

/** A point of light: bright core + soft halo. */
export const Ember: React.FC<{x: number; y: number; r?: number; o?: number}> = ({x, y, r = 30, o = 1}) => <circle cx={x} cy={y} r={r} fill="url(#ember)" opacity={o} />;
