import React from 'react';
import {AbsoluteFill} from 'remotion';

/* ep28 look "灯下纸影" (paper cut-outs under one desk lamp).
   The circle of lamplight IS the circle of care: whatever stands inside it, we see and feel for;
   whatever stands outside fades into the dusk-blue paper. Creatures are cut from dark brown paper and
   cast a soft shadow; the one accent is a vermilion brush line (the "line" each thinker draws).
   Warm, handmade, quiet. NOT: glossy 3D, neon, cartoon faces, black backgrounds. */
export const W = 1920, H = 1080, FPS = 30;
export const SANS = '"Noto Sans CJK SC", sans-serif';
export const SERIF = '"Noto Serif CJK SC", serif';
export const P = {
	duskTop: '#2b2a3a', dusk: '#3a3646', duskLow: '#4a4252',
	lampHi: '#fbeccb', lamp: '#f0d6a6', lampLo: '#c99b6c',
	cut: '#3a2721', cutSoft: '#5a4036', cutDim: '#5b5566',
	ink: '#2c1f1b', cream: '#f6ead2', mute: 'rgba(246,234,210,0.72)',
	red: '#cf3f28', gold: '#f1c56d', water: '#5f7d8c',
};

/** the paper grain + shadow filters, put once per frame */
export const PaperDefs: React.FC = () => (
	<defs>
		<filter id="cutShadow" x="-20%" y="-20%" width="140%" height="160%">
			<feDropShadow dx="7" dy="9" stdDeviation="5" floodColor="#1a1012" floodOpacity="0.38" />
		</filter>
		<filter id="grain" x="0" y="0" width="100%" height="100%">
			<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" />
			<feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.36  0 0 0 0 0.3  0 0 0 0.55 0" />
		</filter>
		<filter id="fiber" x="0" y="0" width="100%" height="100%">
			<feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves="3" seed="9" />
			<feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.22  0 0 0 0 0.2  0 0 0 0.35 0" />
		</filter>
		<filter id="soft"><feGaussianBlur stdDeviation="2" /></filter>
	</defs>
);

/** dusk-blue paper with one or more pools of lamplight; pools = [cx, cy, rx, ry, strength] */
export const Table: React.FC<{pools: [number, number, number, number, number][]; children?: React.ReactNode}> = ({pools, children}) => (
	<AbsoluteFill style={{background: `linear-gradient(180deg, ${P.duskTop}, ${P.dusk} 55%, ${P.duskLow})`}}>
		<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
			<PaperDefs />
			<defs>
				<radialGradient id="pool">
					<stop offset="0" stopColor={P.lampHi} stopOpacity="1" />
					<stop offset="0.45" stopColor={P.lamp} stopOpacity="0.92" />
					<stop offset="0.8" stopColor={P.lampLo} stopOpacity="0.35" />
					<stop offset="1" stopColor={P.lampLo} stopOpacity="0" />
				</radialGradient>
			</defs>
			{pools.map(([cx, cy, rx, ry, k], i) => <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#pool)" opacity={k} />)}
			{children}
			<rect width={W} height={H} filter="url(#fiber)" opacity={0.55} style={{mixBlendMode: 'multiply'}} />
			<rect width={W} height={H} filter="url(#grain)" opacity={0.22} style={{mixBlendMode: 'multiply'}} />
		</svg>
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(18,14,24,0.45) 100%)'}} />
	</AbsoluteFill>
);

type C = {x: number; y: number; s?: number; f?: string; o?: number; flip?: boolean};
/** a cut-out: places a silhouette with its baseline at y, centred at x, facing right (flip faces left) */
const Cut: React.FC<C & {children: React.ReactNode; shadow?: boolean}> = ({x, y, s = 1, f = P.cut, o = 1, flip, children, shadow = true}) => (
	<g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} fill={f} stroke={f} strokeWidth={0} opacity={o} filter={shadow ? 'url(#cutShadow)' : undefined}>{children}</g>
);
const ln = (d: string, w: number, f?: string) => <path d={d} fill="none" stroke={f ?? 'currentColor'} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />;

export const Cat: React.FC<C> = (p) => (
	<Cut {...p}><g style={{color: p.f ?? P.cut}}>
		{ln('M -24 -6 C -58 -4 -64 -46 -44 -58', 10)}
		<ellipse cx={0} cy={-36} rx={26} ry={34} /><ellipse cx={-6} cy={-14} rx={27} ry={15} />
		<rect x={8} y={-38} width={10} height={38} rx={5} /><rect x={-2} y={-36} width={9} height={36} rx={4} />
		<circle cx={10} cy={-76} r={18} />
		<polygon points="-4,-86 0,-106 10,-90" /><polygon points="14,-90 26,-104 27,-82" />
	</g></Cut>
);
export const Rhino: React.FC<C> = (p) => (
	<Cut {...p}><g style={{color: p.f ?? P.cut}}>
		<ellipse cx={-10} cy={-84} rx={100} ry={56} /><ellipse cx={46} cy={-100} rx={50} ry={44} />
		<path d="M 70 -128 C 110 -122 140 -100 160 -66 L 176 -42 C 172 -30 150 -30 136 -36 L 100 -50 Z" />
		<polygon points="150,-62 176,-120 166,-56" /><polygon points="124,-82 134,-108 140,-78" />
		<polygon points="86,-122 80,-148 98,-126" />
		<rect x={-86} y={-58} width={30} height={58} rx={8} /><rect x={-50} y={-58} width={28} height={56} rx={8} />
		<rect x={30} y={-58} width={30} height={58} rx={8} /><rect x={66} y={-60} width={28} height={56} rx={8} />
		{ln('M -106 -96 L -118 -60', 5)}
	</g></Cut>
);
export const Fly: React.FC<C> = (p) => (
	<Cut {...p}><g style={{color: p.f ?? P.cut}}>
		<ellipse cx={-6} cy={-30} rx={20} ry={8} transform="rotate(-28 -6 -30)" opacity={0.55} />
		<ellipse cx={2} cy={-32} rx={18} ry={7} transform="rotate(-50 2 -32)" opacity={0.4} />
		<ellipse cx={0} cy={-14} rx={16} ry={9} /><circle cx={17} cy={-17} r={8} />
		{ln('M -8 -8 L -16 0 M 0 -7 L 0 0 M 8 -8 L 14 0', 2.6)}
	</g></Cut>
);
export const Human: React.FC<C> = (p) => (
	<Cut {...p}>
		<circle cx={0} cy={-158} r={17} />
		<path d="M -24 -136 Q 0 -146 24 -136 L 30 -64 L 18 -62 L 14 0 L 3 0 L 0 -58 L -3 0 L -14 0 L -18 -62 L -30 -64 Z" />
	</Cut>
);
export const Ape: React.FC<C> = (p) => (
	<Cut {...p}><g style={{color: p.f ?? P.cut}}>
		<ellipse cx={0} cy={-58} rx={36} ry={44} /><circle cx={20} cy={-110} r={20} />
		{ln('M 22 -86 L 48 -36 L 50 0', 14)}{ln('M -20 -86 L -40 -40 L -40 0', 13)}
		<ellipse cx={-4} cy={-12} rx={34} ry={13} />
	</g></Cut>
);
export const Dog: React.FC<C> = (p) => (
	<Cut {...p}><g style={{color: p.f ?? P.cut}}>
		<ellipse cx={0} cy={-56} rx={46} ry={20} />
		<ellipse cx={50} cy={-80} rx={18} ry={15} /><rect x={56} y={-82} width={24} height={13} rx={5} />
		<polygon points="40,-90 46,-112 56,-92" />
		<rect x={-40} y={-56} width={11} height={56} rx={5} /><rect x={-24} y={-56} width={11} height={54} rx={5} />
		<rect x={22} y={-56} width={11} height={56} rx={5} /><rect x={36} y={-58} width={11} height={56} rx={5} />
		{ln('M -44 -62 Q -64 -84 -58 -98', 8)}
	</g></Cut>
);
export const Chicken: React.FC<C> = (p) => (
	<Cut {...p}><g style={{color: p.f ?? P.cut}}>
		<ellipse cx={0} cy={-42} rx={32} ry={24} /><polygon points="-26,-52 -50,-86 -40,-40" />
		<polygon points="14,-54 22,-80 36,-74 32,-46" /><circle cx={28} cy={-76} r={11} />
		<polygon points="37,-80 50,-75 37,-70" /><circle cx={24} cy={-89} r={5} /><circle cx={31} cy={-88} r={5} />
		{ln('M -6 -20 L -8 0 M 6 -20 L 8 0', 4)}
	</g></Cut>
);
export const Lizard: React.FC<C> = (p) => (
	<Cut {...p}><g style={{color: p.f ?? P.cut}}>
		{ln('M -36 -10 Q -80 -6 -100 -16', 7)}
		<ellipse cx={0} cy={-12} rx={40} ry={10} /><ellipse cx={44} cy={-14} rx={14} ry={8} />
		{ln('M -20 -6 L -30 2 M 20 -6 L 30 2 M -22 -16 L -32 -24 M 22 -16 L 30 -24', 4)}
	</g></Cut>
);
export const Frog: React.FC<C> = (p) => (
	<Cut {...p}>
		<ellipse cx={-4} cy={-8} rx={30} ry={10} /><ellipse cx={0} cy={-24} rx={26} ry={18} />
		<circle cx={10} cy={-42} r={8} /><circle cx={22} cy={-39} r={7} />
	</Cut>
);
export const Fish: React.FC<C> = (p) => (
	<Cut {...p}>
		<ellipse cx={0} cy={-20} rx={36} ry={15} /><polygon points="-30,-20 -54,-36 -50,-20 -54,-4" />
		<circle cx={20} cy={-23} r={3.5} fill={P.lamp} />
	</Cut>
);
export const Octopus: React.FC<C> = (p) => (
	<Cut {...p}><g style={{color: p.f ?? P.cut}}>
		<ellipse cx={0} cy={-58} rx={24} ry={28} />
		{[-18, -9, 0, 9, 18].map((dx, i) => <React.Fragment key={i}>{ln(`M ${dx * 0.6} -36 Q ${dx * 1.6} -18 ${dx * 1.2 + (i % 2 ? 6 : -6)} -8 Q ${dx * 2.1} 0 ${dx * 2.4} -4`, 7)}</React.Fragment>)}
	</g></Cut>
);
export const Bee: React.FC<C> = (p) => (
	<Cut {...p}>
		<ellipse cx={-4} cy={-40} rx={14} ry={9} transform="rotate(-30 -4 -40)" opacity={0.5} />
		<ellipse cx={0} cy={-22} rx={18} ry={11} /><circle cx={19} cy={-24} r={8} />
		<rect x={-8} y={-33} width={4} height={22} fill={P.lamp} opacity={0.7} /><rect x={1} y={-33} width={4} height={22} fill={P.lamp} opacity={0.7} />
	</Cut>
);
export const Worm: React.FC<C> = (p) => (
	<Cut {...p}><g style={{color: p.f ?? P.cut}}>{ln('M -40 -6 Q -26 -22 -12 -8 T 16 -8 T 40 -12', 9)}</g></Cut>
);
export const Jelly: React.FC<C> = (p) => (
	<Cut {...p}><g style={{color: p.f ?? P.cut}}>
		<path d="M -28 -50 Q -28 -86 0 -86 Q 28 -86 28 -50 Q 14 -56 0 -50 Q -14 -56 -28 -50 Z" />
		{[-18, -6, 6, 18].map((dx, i) => <React.Fragment key={i}>{ln(`M ${dx} -50 Q ${dx + 8} -30 ${dx - 4} -14 Q ${dx + 6} -6 ${dx} 0`, 3)}</React.Fragment>)}
	</g></Cut>
);
export const Mushroom: React.FC<C> = (p) => (
	<Cut {...p}>
		<path d="M -40 -46 Q 0 -100 40 -46 Z" /><rect x={-9} y={-48} width={18} height={48} rx={6} />
	</Cut>
);
export const Bat: React.FC<C> = (p) => (
	<Cut {...p}>
		<path d="M 0 -60 L -18 -66 Q -60 -90 -110 -70 Q -96 -58 -92 -44 Q -78 -54 -66 -44 Q -54 -54 -42 -42 Q -24 -52 -8 -40 Z" />
		<path d="M 0 -60 L 18 -66 Q 60 -90 110 -70 Q 96 -58 92 -44 Q 78 -54 66 -44 Q 54 -54 42 -42 Q 24 -52 8 -40 Z" />
		<ellipse cx={0} cy={-52} rx={12} ry={18} /><circle cx={0} cy={-74} r={9} />
		<polygon points="-7,-80 -9,-92 -2,-82" /><polygon points="7,-80 9,-92 2,-82" />
	</Cut>
);
/** a robed figure (shadow-play), arm raised optional */
export const Robe: React.FC<C & {point?: boolean}> = (p) => (
	<Cut {...p}><g style={{color: p.f ?? P.cut}}>
		<path d="M -14 -122 Q 0 -128 14 -122 L 34 0 L -30 0 Z" />
		<circle cx={2} cy={-138} r={15} /><ellipse cx={0} cy={-156} rx={7} ry={6} />
		{p.point ? ln('M 10 -112 L 40 -96 L 66 -100', 9) : ln('M 10 -112 L 26 -80 L 20 -60', 9)}
	</g></Cut>
);
export const Hippo: React.FC<C> = (p) => (
	<Cut {...p}>
		<ellipse cx={0} cy={0} rx={70} ry={26} /><ellipse cx={62} cy={-6} rx={30} ry={20} />
		<circle cx={52} cy={-24} r={7} /><circle cx={66} cy={-24} r={7} />
		<ellipse cx={44} cy={-28} rx={5} ry={7} />
	</Cut>
);

/** label: dark ink on the lit paper, or cream on the dusk (size ≥ 52 for labels, ≥ 40 for tags) */
export const Lab: React.FC<{x: number; y: number; children: React.ReactNode; size?: number; col?: string; w?: number; a?: 'start' | 'middle' | 'end'; o?: number; serif?: boolean}> = ({x, y, children, size = 52, col = P.ink, w = 800, a = 'middle', o = 1, serif}) => (
	<text x={x} y={y} textAnchor={a} opacity={o} style={{fontFamily: serif ? SERIF : SANS, fontSize: size, fontWeight: w, letterSpacing: '0.04em'}} fill={col}>{children}</text>
);
/** paper tag: a small torn cream slip with dark text */
export const Tag: React.FC<{x: number; y: number; children: string; size?: number; rot?: number; col?: string; bg?: string}> = ({x, y, children, size = 42, rot = -2, col = P.ink, bg = P.cream}) => {
	const w = [...children].length * size * 0.95 + size * 1.1;
	return (
		<g transform={`translate(${x} ${y}) rotate(${rot})`} filter="url(#cutShadow)">
			<path d={`M ${-w / 2} ${-size * 0.95} L ${w / 2 - 6} ${-size} L ${w / 2} ${size * 0.55} L ${-w / 2 + 4} ${size * 0.6} Z`} fill={bg} />
			<text x={0} y={size * 0.12} textAnchor="middle" style={{fontFamily: SANS, fontSize: size, fontWeight: 800}} fill={col}>{children}</text>
		</g>
	);
};
/** a hand-painted vermilion brush stroke from (x1,y1) to (x2,y2) */
export const Brush: React.FC<{d: string; w?: number; col?: string; o?: number; dash?: string}> = ({d, w = 12, col = P.red, o = 0.92, dash}) => (
	<g opacity={o}>
		<path d={d} fill="none" stroke={col} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} />
		<path d={d} fill="none" stroke={col} strokeWidth={w * 0.45} strokeLinecap="round" opacity={0.5} transform="translate(2 -3)" strokeDasharray={dash} />
	</g>
);
export const CatLying: React.FC<C> = (p) => (
	<Cut {...p}><g style={{color: p.f ?? P.cut}}>
		<ellipse cx={0} cy={-20} rx={58} ry={20} /><circle cx={58} cy={-22} r={17} />
		<polygon points="58,-36 62,-54 70,-38" /><polygon points="68,-34 80,-48 78,-28" />
		{ln('M -54 -14 C -84 -10 -92 -2 -76 4', 9)}
		{ln('M 30 -6 L 62 2 M 20 -4 L 50 4', 8)}
	</g></Cut>
);
