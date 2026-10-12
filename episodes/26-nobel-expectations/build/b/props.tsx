import React from 'react';
import {C, SANS, SERIF, NUM} from './kit';
import {Bread} from './OpenB';

/* ep26 v3 props (director notes v2 §5): look B, one warm key light from the upper left, gold = ideas, crimson = fear. */
export const PAPER = '#ece2c8', INKB = '#4a3420', INKD = '#2e1f12', CRIMSON = '#c4503d';
export const rnd = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

/** guilloche rosette: n rotated ellipses */
export const Rosette: React.FC<{x: number; y: number; r: number; col?: string; o?: number; n?: number}> = ({x, y, r, col = INKB, o = 0.4, n = 8}) => (
	<g opacity={o}>{Array.from({length: n}, (_, i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.42} fill="none" stroke={col} strokeWidth={0.8} transform={`rotate(${(i * 180) / n} ${x} ${y})`} />)}</g>
);
/** paper fibre texture filter + deckled edge, keyed by id */
export const PaperFx: React.FC<{id: string}> = ({id}) => (
	<defs>
		<filter id={`${id}fib`} x="0" y="0" width="100%" height="100%">
			<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" />
			<feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.22  0 0 0 0 0.12  0 0 0 0.09 0" />
			<feComposite in2="SourceGraphic" operator="in" />
		</filter>
		<linearGradient id={`${id}lit`} x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stopColor="#fff6dc" stopOpacity={0.14} />
			<stop offset="0.55" stopColor="#000" stopOpacity={0.04} />
			<stop offset="1" stopColor="#000" stopOpacity={0.38} />
		</linearGradient>
	</defs>
);
const deckle = (x: number, y: number, w: number, h: number, seed = 3) => {
	const r = rnd(seed);
	let d = `M${x} ${y + 4}`;
	for (let i = 0; i <= 40; i++) d += ` L${x + (w * i) / 40} ${y + r() * 5}`;
	d += ` L${x + w} ${y + h} L${x} ${y + h} Z`;
	return d;
};

/* ---------- IOU bond with 5 tear-off coupons ---------- */
export const Bond: React.FC<{x: number; y: number; s?: number; name: string; stamps?: number[]; o?: number; nameShift?: number; id: string}> = ({x, y, s = 1, name, stamps = [], o = 1, nameShift = 0, id}) => {
	const w = 760, h = 440, x0 = -w / 2, y0 = -h / 2, cpH = 96;
	return (
		<g opacity={o} transform={`translate(${x} ${y}) scale(${s})`}>
			<PaperFx id={id} />
			<rect x={x0 + 22} y={y0 + 30} width={w} height={h} fill="#000" opacity={0.55} style={{filter: 'blur(18px)'}} />
			<path d={deckle(x0, y0, w, h)} fill={PAPER} />
			<path d={deckle(x0, y0, w, h)} fill="#fff" filter={`url(#${id}fib)`} />
			<rect x={x0 + 16} y={y0 + 18} width={w - 32} height={h - cpH - 30} fill="none" stroke={INKB} strokeWidth={3} />
			<rect x={x0 + 24} y={y0 + 26} width={w - 48} height={h - cpH - 46} fill="none" stroke={INKB} strokeWidth={0.8} />
			<Rosette x={x0 + 110} y={y0 + 140} r={62} />
			<Rosette x={x0 + 110} y={y0 + 140} r={40} o={0.3} />
			<text x={nameShift + 70} y={y0 + 92} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 40, fontWeight: 700, letterSpacing: '0.6em'}} fill={INKB}>借 条</text>
			<text x={nameShift + 70} y={y0 + 218} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 120, fontWeight: 900}} fill={INKD}>{name}</text>
			{/* coupons */}
			{Array.from({length: 5}, (_, i) => {
				const cx0 = x0 + 16 + (i * (w - 32)) / 5, cw = (w - 32) / 5, cy0 = y0 + h - cpH - 6;
				const sl = stamps[i] ?? 0;
				return (
					<g key={i}>
						<line x1={cx0} x2={cx0} y1={cy0} y2={cy0 + cpH} stroke={INKB} strokeOpacity={0.5} strokeDasharray="3 5" />
						<rect x={cx0 + 6} y={cy0 + 8} width={cw - 12} height={cpH - 16} fill="none" stroke={INKB} strokeOpacity={0.6} strokeWidth={1.2} />
						<text x={cx0 + cw / 2} y={cy0 + 58} textAnchor="middle" style={{fontFamily: NUM, fontSize: 34, fontWeight: 700}} fill={INKB}>{2012 + i}</text>
						{sl > 0 && (
							<g opacity={Math.min(1, sl * 3)} transform={`translate(${cx0 + cw / 2} ${cy0 + cpH / 2}) rotate(-12) scale(${1.25 - 0.25 * Math.min(1, sl)})`}>
								<rect x={-56} y={-26} width={112} height={52} rx={6} fill="none" stroke={CRIMSON} strokeWidth={4} />
								<text x={0} y={13} textAnchor="middle" style={{fontFamily: SANS, fontSize: 34, fontWeight: 900}} fill={CRIMSON}>到期</text>
							</g>
						)}
					</g>
				);
			})}
			<line x1={x0 + 16} x2={x0 + w - 16} y1={y0 + h - cpH - 6} y2={y0 + h - cpH - 6} stroke={INKB} strokeOpacity={0.5} strokeDasharray="4 6" />
			<path d={deckle(x0, y0, w, h)} fill={`url(#${id}lit)`} />
		</g>
	);
};

/* ---------- reeded coin stack, lit by distance from the key light ---------- */
export const Stack: React.FC<{x: number; y: number; n?: number; r?: number; lit?: number; o?: number}> = ({x, y, n = 10, r = 46, lit = 1, o = 1}) => {
	const hgt = 9;
	return (
		<g opacity={o} transform={`translate(${x} ${y})`} style={{filter: `brightness(${0.35 + 0.65 * lit})`}}>
			<ellipse cx={8} cy={8} rx={r * 1.15} ry={r * 0.3} fill="#000" opacity={0.6} style={{filter: 'blur(8px)'}} />
			{Array.from({length: n}, (_, i) => {
				const yy = -i * hgt, dx = ((i * 7) % 5) - 2;
				return (
					<g key={i} transform={`translate(${dx} ${yy})`}>
						<path d={`M${-r} 0 L${-r} ${-hgt} A${r} ${r * 0.32} 0 0 1 ${r} ${-hgt} L${r} 0 A${r} ${r * 0.32} 0 0 1 ${-r} 0 Z`} fill="#8a6424" />
						{Array.from({length: 14}, (_, k) => <line key={k} x1={-r + (k + 0.5) * (2 * r) / 14} x2={-r + (k + 0.5) * (2 * r) / 14} y1={-1} y2={-hgt + 1} stroke="#e8c98a" strokeOpacity={0.35} strokeWidth={1} />)}
						<ellipse cx={0} cy={-hgt} rx={r} ry={r * 0.32} fill="url(#coinTop2)" />
					</g>
				);
			})}
			<ellipse cx={0} cy={-(n - 1) * hgt - hgt} rx={r * 0.72} ry={r * 0.22} fill="none" stroke="#7a5520" strokeOpacity={0.5} />
			<path d={`M${-r * 0.6} ${-(n - 1) * hgt - hgt - r * 0.18} A${r * 0.7} ${r * 0.2} 0 0 1 ${r * 0.2} ${-(n - 1) * hgt - hgt - r * 0.26}`} stroke="#fff3d0" strokeOpacity={0.6} strokeWidth={2} fill="none" />
		</g>
	);
};
export const CoinDefs = () => (
	<defs>
		<radialGradient id="coinTop2" cx="0.4" cy="0.3" r="0.8"><stop offset="0" stopColor="#f6dfa6" /><stop offset="1" stopColor="#b98a3c" /></radialGradient>
	</defs>
);

/* ---------- a paper slip for a loop node ---------- */
export const Slip: React.FC<{x: number; y: number; text: string; rot?: number; col?: string; o?: number; dy?: number; size?: number}> = ({x, y, text, rot = 0, col = INKD, o = 1, dy = 0, size = 52}) => {
	const w = [...text].length * size + 70, h = size + 50;
	return (
		<g opacity={o} transform={`translate(${x} ${y + dy}) rotate(${rot})`}>
			<rect x={-w / 2 + 10} y={-h / 2 + 14} width={w} height={h} fill="#000" opacity={0.5} style={{filter: 'blur(10px)'}} />
			<rect x={-w / 2} y={-h / 2} width={w} height={h} fill={PAPER} />
			<rect x={-w / 2} y={-h / 2} width={w} height={h} fill="url(#slipLit)" />
			<text x={0} y={size * 0.36} textAnchor="middle" style={{fontFamily: SANS, fontSize: size, fontWeight: 900}} fill={col}>{text}</text>
		</g>
	);
};
export const SlipDefs = () => (
	<defs>
		<linearGradient id="slipLit" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff6dc" stopOpacity={0.12} /><stop offset="1" stopColor="#000" stopOpacity={0.3} /></linearGradient>
	</defs>
);

/* ---------- lectern with one gooseneck microphone ---------- */
export const Lectern: React.FC<{x: number; y: number; o?: number}> = ({x, y, o = 1}) => (
	<g opacity={o} transform={`translate(${x} ${y})`}>
		<defs>
			<linearGradient id="lecW" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#4a3622" /><stop offset="0.5" stopColor="#3a2a1a" /><stop offset="1" stopColor="#1e150c" /></linearGradient>
		</defs>
		<ellipse cx={0} cy={330} rx={240} ry={26} fill="#000" opacity={0.6} style={{filter: 'blur(10px)'}} />
		<path d="M-170 0 L170 0 L130 320 L-130 320 Z" fill="url(#lecW)" />
		<path d="M-190 -24 L190 -24 L170 0 L-170 0 Z" fill="#5a4330" />
		<line x1={-190} x2={190} y1={-24} y2={-24} stroke="#e8c98a" strokeOpacity={0.55} strokeWidth={2} />
		<rect x={-60} y={60} width={120} height={120} fill="none" stroke="#e2c27f" strokeOpacity={0.35} strokeWidth={1.5} />
		<circle cx={0} cy={120} r={34} fill="none" stroke="#e2c27f" strokeOpacity={0.35} strokeWidth={1.5} />
		{/* gooseneck mic */}
		<path d="M40 -24 C 40 -90, 10 -120, -30 -150" stroke="#2a2a2c" strokeWidth={6} fill="none" strokeLinecap="round" />
		<path d="M40 -24 C 40 -90, 10 -120, -30 -150" stroke="#8a8a8e" strokeOpacity={0.4} strokeWidth={2} fill="none" strokeLinecap="round" />
		<rect x={-58} y={-178} width={40} height={22} rx={10} fill="#1a1a1c" transform="rotate(-38 -38 -167)" />
	</g>
);

/* ---------- ECB: dark glass twin towers, floors light on beats ---------- */
export const Towers: React.FC<{x: number; y: number; s?: number; floorsLit?: number; spec?: number; o?: number}> = ({x, y, s = 1, floorsLit = 0, spec = 0.5, o = 1}) => {
	const floors = 40;
	const tower = (tx0: number, w: number, top: number, skew: number, key: string, lit: number) => {
		const bot = 0;
		const pts = `${tx0},${bot} ${tx0 + w},${bot} ${tx0 + w + skew},${top} ${tx0 + skew * 0.4},${top + 30}`;
		return (
			<g key={key}>
				<polygon points={pts} fill="url(#glass)" stroke="#6a7686" strokeOpacity={0.35} strokeWidth={1.5} />
				{Array.from({length: floors}, (_, i) => {
					const fy = bot - 14 - i * ((bot - top - 40) / floors) * -1 * -1;
					const yy = bot - 20 - i * ((-top - 40) / floors);
					const on = i < floorsLit * floors;
					return <line key={i} x1={tx0 + 4 + (skew * (bot - yy)) / (bot - top) * 0.4} x2={tx0 + w - 4 + (skew * (bot - yy)) / (bot - top)} y1={yy} y2={yy} stroke={on ? '#e8c27a' : '#8090a4'} strokeOpacity={on ? 0.7 * lit : 0.18} strokeWidth={on ? 5 : 1.5} />;
				})}
				{Array.from({length: 6}, (_, k) => <line key={`v${k}`} x1={tx0 + (w * (k + 1)) / 7} x2={tx0 + (w * (k + 1)) / 7 + skew * 0.7} y1={bot} y2={top + 20} stroke="#8090a4" strokeOpacity={0.12} strokeWidth={1} />)}
				<polygon points={`${tx0 + w * 0.62},${bot} ${tx0 + w * 0.7},${bot} ${tx0 + w * 0.7 + skew * 0.9},${top + 6} ${tx0 + w * 0.62 + skew * 0.9},${top + 8}`} fill="#fff" opacity={0.1 * spec} />
			</g>
		);
	};
	return (
		<g opacity={o} transform={`translate(${x} ${y}) scale(${s})`}>
			<defs>
				<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2a3240" /><stop offset="0.6" stopColor="#151a22" /><stop offset="1" stopColor="#0c0f14" /></linearGradient>
			</defs>
			<ellipse cx={180} cy={10} rx={420} ry={30} fill="#000" opacity={0.6} style={{filter: 'blur(12px)'}} />
			{tower(0, 170, -820, 30, 'a', 1)}
			{tower(210, 150, -720, -20, 'b', 1)}
			<polygon points="-40,0 420,0 400,-150 -20,-150" fill="url(#glass)" stroke="#6a7686" strokeOpacity={0.3} />
			{Array.from({length: 5}, (_, i) => <line key={i} x1={-30} x2={410} y1={-30 - i * 26} y2={-30 - i * 26} stroke={i < floorsLit * 40 ? '#e8c27a' : '#8090a4'} strokeOpacity={0.25} />)}
		</g>
	);
};

/* ---------- engraved note (film palette, not a real euro design) ---------- */
export const Note: React.FC<{x: number; y: number; rot?: number; s?: number; serial?: string}> = ({x, y, rot = 0, s = 1, serial = '2012726'}) => (
	<g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
		<rect x={-110} y={-52} width={220} height={104} fill={PAPER} />
		<rect x={-102} y={-44} width={204} height={88} fill="none" stroke={INKB} strokeWidth={1.4} />
		<rect x={-98} y={-40} width={196} height={80} fill="none" stroke={INKB} strokeWidth={0.6} />
		<Rosette x={-58} y={0} r={30} o={0.45} />
		<text x={48} y={14} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 48, fontWeight: 700}} fill={INKD}>€</text>
		<text x={60} y={-22} textAnchor="middle" style={{fontFamily: NUM, fontSize: 16, fontWeight: 600}} fill={INKB}>{serial}</text>
		<rect x={-110} y={-52} width={220} height={104} fill="url(#slipLit)" />
	</g>
);
/** a banded brick of notes */
export const Brick: React.FC<{x: number; y: number; s?: number; o?: number}> = ({x, y, s = 1, o = 1}) => (
	<g opacity={o} transform={`translate(${x} ${y}) scale(${s})`}>
		<ellipse cx={8} cy={70} rx={140} ry={16} fill="#000" opacity={0.55} style={{filter: 'blur(8px)'}} />
		{Array.from({length: 10}, (_, i) => <rect key={i} x={-112} y={60 - i * 7} width={224} height={7} fill={i % 2 ? '#e2d6b8' : '#d8cba9'} stroke="#8a7a5a" strokeWidth={0.5} />)}
		<Note x={0} y={-20} />
		<rect x={-30} y={-72} width={60} height={136} fill="#b84a36" opacity={0.92} />
		<text x={0} y={-2} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 40, fontWeight: 900}} fill="#f4e6c8">€</text>
	</g>
);

/* ---------- round steel vault door (2.5D) ---------- */
export const VaultDoor: React.FC<{wheel: number; bolts: number; open: number; inside: number}> = ({wheel, bolts, open, inside}) => {
	const R = 300;
	return (
		<div style={{position: 'absolute', left: 960 - 420, top: 470 - 380, width: 840, height: 760}}>
			{/* wall + frame */}
			<svg width={840} height={760} style={{position: 'absolute', inset: 0}}>
				<defs>
					<radialGradient id="vin" cx="0.5" cy="0.35" r="0.7"><stop offset="0" stopColor="#f3d9a0" stopOpacity={0.55} /><stop offset="0.6" stopColor="#6a5232" stopOpacity={0.35} /><stop offset="1" stopColor="#0d0b09" stopOpacity={1} /></radialGradient>
					<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1d1c1b" /><stop offset="1" stopColor="#0e0d0c" /></linearGradient>
				</defs>
				<rect x={40} y={20} width={760} height={720} fill="url(#wall)" stroke="#3a3836" strokeWidth={2} />
				<rect x={40} y={20} width={760} height={3} fill="#e2c27f" opacity={0.5} />
				<circle cx={420} cy={380} r={R + 22} fill="#0a0908" stroke="#4a4846" strokeWidth={6} />
				{/* interior: empty shelves */}
				<g opacity={inside}>
					<circle cx={420} cy={380} r={R + 4} fill="url(#vin)" />
					{[260, 380, 500].map((yy, i) => (
						<g key={i}>
							<line x1={420 - Math.sqrt(Math.max(0, (R - 10) ** 2 - (yy - 380) ** 2))} x2={420 + Math.sqrt(Math.max(0, (R - 10) ** 2 - (yy - 380) ** 2))} y1={yy} y2={yy} stroke="#b8b4ac" strokeOpacity={0.55} strokeWidth={5} />
							<line x1={420 - Math.sqrt(Math.max(0, (R - 10) ** 2 - (yy - 380) ** 2))} x2={420 + Math.sqrt(Math.max(0, (R - 10) ** 2 - (yy - 380) ** 2))} y1={yy + 5} y2={yy + 5} stroke="#000" strokeOpacity={0.6} strokeWidth={3} />
						</g>
					))}
				</g>
			</svg>
			{/* the door, hinged at its right edge */}
			<div style={{position: 'absolute', left: 420 - R, top: 380 - R, width: 2 * R, height: 2 * R, transformOrigin: `${2 * R + 18}px ${R}px`, transform: `perspective(2200px) rotateY(${-78 * open}deg)`}}>
				<svg width={2 * R + 40} height={2 * R} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
					<defs>
						<radialGradient id="steel" cx="0.4" cy="0.3" r="0.8"><stop offset="0" stopColor="#5a5a5e" /><stop offset="0.6" stopColor="#3a3a3c" /><stop offset="1" stopColor="#1a1a1c" /></radialGradient>
						<linearGradient id="bolt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c8c6c0" /><stop offset="1" stopColor="#5e5c58" /></linearGradient>
					</defs>
					{/* thickness: a darker band behind */}
					<circle cx={R + 14} cy={R} r={R} fill="#121214" />
					<circle cx={R} cy={R} r={R} fill="url(#steel)" />
					{Array.from({length: 22}, (_, i) => <circle key={i} cx={R} cy={R} r={R * (0.25 + i * 0.033)} fill="none" stroke="#fff" strokeOpacity={0.025} />)}
					<path d={`M${R - R * 0.92} ${R - R * 0.38} A${R} ${R} 0 0 1 ${R + R * 0.6} ${R - R * 0.8}`} stroke="#e2c27f" strokeOpacity={0.55} strokeWidth={3} fill="none" />
					<circle cx={R} cy={R} r={R * 0.86} fill="none" stroke="#1a1a1c" strokeWidth={6} />
					{/* bolts: retract inward */}
					{Array.from({length: 12}, (_, i) => {
						const a = (i / 12) * Math.PI * 2, bb = bolts;
						const r0 = R * 0.93 - 30 * bb;
						return <rect key={i} x={-14} y={-26} width={28} height={52} rx={6} fill="url(#bolt)" transform={`translate(${R + Math.cos(a) * r0} ${R + Math.sin(a) * r0}) rotate(${(a * 180) / Math.PI + 90})`} />;
					})}
					{/* wheel */}
					<g transform={`rotate(${wheel} ${R} ${R})`}>
						{Array.from({length: 5}, (_, i) => <line key={i} x1={R} y1={R} x2={R + Math.cos((i / 5) * Math.PI * 2) * R * 0.42} y2={R + Math.sin((i / 5) * Math.PI * 2) * R * 0.42} stroke="#b8b4ac" strokeWidth={10} strokeLinecap="round" />)}
						<circle cx={R} cy={R} r={R * 0.42} fill="none" stroke="#9a968e" strokeWidth={8} />
						<circle cx={R} cy={R} r={34} fill="#2a2a2c" stroke="#b8b4ac" strokeWidth={4} />
					</g>
					{/* hinge block */}
					<rect x={2 * R - 6} y={R - 120} width={40} height={240} rx={8} fill="#2a2a2c" stroke="#5e5c58" />
				</svg>
			</div>
		</div>
	);
};

/* ---------- open hardcover ledger ---------- */
export const Ledger: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<rect x={-600} y={-330} width={1200} height={660} rx={14} fill="#3a2418" />
		<ellipse cx={0} cy={340} rx={620} ry={30} fill="#000" opacity={0.5} style={{filter: 'blur(14px)'}} />
		{[-1, 1].map((sd) => (
			<g key={sd}>
				<path d={sd < 0 ? 'M-6 -310 L-570 -300 Q-584 0 -570 306 L-6 312 Z' : 'M6 -310 L570 -300 Q584 0 570 306 L6 312 Z'} fill="#efe6d0" />
				{Array.from({length: 11}, (_, i) => <line key={i} x1={sd < 0 ? -540 : 40} x2={sd < 0 ? -40 : 540} y1={-200 + i * 46} y2={-200 + i * 46} stroke="#6a8ab8" strokeOpacity={0.35} strokeWidth={1.2} />)}
				<line x1={sd < 0 ? -420 : 160} x2={sd < 0 ? -420 : 160} y1={-240} y2={290} stroke="#c45a4a" strokeOpacity={0.45} strokeWidth={1.4} />
			</g>
		))}
		<rect x={-40} y={-312} width={80} height={624} fill="url(#spine)" />
		<defs>
			<linearGradient id="spine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#000" stopOpacity={0} /><stop offset="0.5" stopColor="#000" stopOpacity={0.35} /><stop offset="1" stopColor="#000" stopOpacity={0} /></linearGradient>
		</defs>
		<text x={-300} y={-236} textAnchor="middle" style={{fontFamily: SANS, fontSize: 48, fontWeight: 900}} fill={INKD}>借款记录</text>
		<text x={300} y={-236} textAnchor="middle" style={{fontFamily: SANS, fontSize: 40, fontWeight: 700}} fill={INKB}>欧洲央行 · 2012 起</text>
	</g>
);

/* ---------- a hardcover at 3/4 ---------- */
export const Hardcover: React.FC<{o?: number}> = ({o = 1}) => (
	<div style={{position: 'absolute', left: 300, top: 180, width: 420, height: 580, opacity: o, transform: 'perspective(1600px) rotateY(18deg) rotateZ(-3deg)', transformStyle: 'preserve-3d'}}>
		<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#2f4f40,#1d3328 70%,#15241d)', boxShadow: '30px 40px 60px rgba(0,0,0,0.7)', borderRadius: '2px 8px 8px 2px'}}>
			<div style={{position: 'absolute', inset: 0, opacity: 0.08, background: 'repeating-linear-gradient(45deg,#fff 0 1px,transparent 1px 4px),repeating-linear-gradient(-45deg,#fff 0 1px,transparent 1px 4px)'}} />
			<div style={{position: 'absolute', left: 30, right: 30, top: 30, bottom: 30, border: '1.5px solid rgba(226,194,127,0.6)'}} />
			<div style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center', fontFamily: SERIF, fontSize: 64, fontWeight: 900, color: '#e8c98a', textShadow: '0 1px 0 rgba(255,240,200,0.6), 0 -1px 0 rgba(0,0,0,0.5)'}}>利息与价格</div>
			<div style={{position: 'absolute', top: 250, left: '25%', width: '50%', height: 1.5, background: 'rgba(226,194,127,0.6)'}} />
			<div style={{position: 'absolute', top: 280, width: '100%', textAlign: 'center', fontFamily: SANS, fontSize: 34, fontWeight: 600, color: '#e8dcc0'}}>伍德福德 著</div>
			<div style={{position: 'absolute', bottom: 70, width: '100%', textAlign: 'center', fontFamily: NUM, fontSize: 48, fontWeight: 700, color: '#e8c98a'}}>2003</div>
		</div>
		<div style={{position: 'absolute', left: -24, top: 0, width: 24, height: '100%', background: 'linear-gradient(90deg,#0f1c16,#1d3328)', transform: 'rotateY(-90deg)', transformOrigin: '100% 50%'}} />
		<div style={{position: 'absolute', right: -14, top: 6, width: 14, bottom: 6, background: 'repeating-linear-gradient(0deg,#e8dfc8 0 2px,#cfc4a8 2px 3px)'}} />
	</div>
);

/* ---------- brass balance ---------- */
export const Balance: React.FC<{cx: number; cy: number; tilt: number; left: React.ReactNode; right: React.ReactNode; o?: number}> = ({cx, cy, tilt, left, right, o = 1}) => {
	const arm = 420, la = (tilt * Math.PI) / 180;
	const L = [cx - arm * Math.cos(la), cy - arm * Math.sin(la)], R = [cx + arm * Math.cos(la), cy + arm * Math.sin(la)];
	const chain = (x: number, y: number, dx: number) => <line x1={x} y1={y} x2={x + dx} y2={y + 220} stroke="#c9a45c" strokeWidth={2.5} strokeDasharray="6 4" />;
	const pan = (x: number, y: number, content: React.ReactNode, key: string) => (
		<g key={key}>
			{chain(x, y, -130)}{chain(x, y, 0)}{chain(x, y, 130)}
			<g transform={`translate(${x} ${y + 220})`}>{content}</g>
			<path d={`M${x - 170} ${y + 222} Q ${x} ${y + 300} ${x + 170} ${y + 222} Z`} fill="url(#brass)" />
			<ellipse cx={x} cy={y + 222} rx={170} ry={14} fill="#f0d79a" opacity={0.5} />
		</g>
	);
	return (
		<g opacity={o}>
			<defs>
				<linearGradient id="brass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6e4a14" /><stop offset="0.35" stopColor="#f0d79a" /><stop offset="0.5" stopColor="#d9b46a" /><stop offset="1" stopColor="#6e4a14" /></linearGradient>
			</defs>
			<ellipse cx={cx} cy={cy + 610} rx={330} ry={26} fill="#000" opacity={0.55} style={{filter: 'blur(10px)'}} />
			<path d={`M${cx - 260} ${cy + 600} h520 l-40 -40 h-440 z`} fill="url(#brass)" />
			<rect x={cx - 140} y={cy + 520} width={280} height={40} fill="url(#brass)" />
			<rect x={cx - 18} y={cy - 10} width={36} height={530} fill="url(#brass)" />
			<circle cx={cx} cy={cy - 40} r={22} fill="url(#brass)" />
			<path d={`M${L[0]} ${L[1]} L${cx} ${cy - 10} L${R[0]} ${R[1]} L${cx} ${cy + 16} Z`} fill="url(#brass)" />
			<circle cx={L[0]} cy={L[1]} r={14} fill="#d9b46a" />
			<circle cx={R[0]} cy={R[1]} r={14} fill="#d9b46a" />
			{pan(L[0], L[1], left, 'l')}
			{pan(R[0], R[1], right, 'r')}
		</g>
	);
};

/* ---------- pendant lamp ---------- */
export const Lamp: React.FC<{x: number; y: number; on: number}> = ({x, y, on}) => (
	<g>
		<defs>
			<linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe3a0" stopOpacity={0.5} /><stop offset="1" stopColor="#ffe3a0" stopOpacity={0} /></linearGradient>
		</defs>
		<line x1={x} y1={0} x2={x} y2={y - 60} stroke="#8a7a5a" strokeWidth={2} />
		<path d={`M${x - 380} ${y + 640} L${x - 70} ${y + 20} L${x + 70} ${y + 20} L${x + 380} ${y + 640} Z`} fill="url(#cone)" opacity={on} />
		<path d={`M${x - 90} ${y + 20} L${x - 40} ${y - 60} L${x + 40} ${y - 60} L${x + 90} ${y + 20} Z`} fill="url(#brass)" />
		<ellipse cx={x} cy={y + 20} rx={90} ry={14} fill={on > 0.5 ? '#fff1c8' : '#3a3022'} />
		<text x={x} y={y - 4} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 56, fontWeight: 900}} fill="#5a3e10">信</text>
	</g>
);

/* ---------- City: three layers with haze, rooftops, 2:3 windows, some with phone glow ---------- */
type Win = {x: number; y: number; w: number; h: number; lit: number; cool: boolean; d: number};
type Bld = {x: number; y: number; w: number; layer: number; roof: number};
export const CITY_B: Bld[] = [];
export const CITY_W: Win[] = [];
{
	const r = rnd(29);
	for (const layer of [0, 1, 2]) {
		let x = -1600;
		while (x < 3500) {
			const w = [100, 150, 210][layer] + r() * [80, 120, 170][layer];
			const top = [360, 300, 220][layer] + r() * [160, 220, 300][layer];
			CITY_B.push({x, y: top, w, layer, roof: Math.floor(r() * 4)});
			const ww = [8, 13, 20][layer], wh = ww * 1.5, gx = ww * 2, gy = wh * 1.7;
			for (let wy = top + 30; wy < 1080; wy += gy) for (let wx = x + 14; wx < x + w - ww - 8; wx += gx) {
				CITY_W.push({x: wx, y: wy, w: ww, h: wh, lit: r(), cool: r() < 0.17, d: Math.hypot(wx - 960, wy - 600)});
			}
			x += w + [4, 10, 22][layer];
		}
	}
}
export const City: React.FC<{lit: number; outR?: number; ripple?: number; o?: number; force?: number}> = ({lit, outR = 1e9, ripple = -1, o = 1, force = -1}) => (
	<g opacity={o}>
		<defs>
			<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a2016" stopOpacity={0} /><stop offset="1" stopColor="#2a2016" stopOpacity={0.55} /></linearGradient>
		</defs>
		{[0, 1, 2].map((layer) => (
			<g key={layer}>
				{CITY_B.filter((b) => b.layer === layer).map((b, i) => (
					<g key={i}>
						<rect x={b.x} y={b.y} width={b.w} height={1200 - b.y} fill={['#100d0a', '#14100c', '#19140f'][layer]} />
						<rect x={b.x} y={b.y} width={b.w} height={1.5} fill="#e2c27f" opacity={0.25} />
						<rect x={b.x} y={b.y} width={2} height={1200 - b.y} fill="#e2c27f" opacity={0.12} />
						{b.roof === 1 && <rect x={b.x + b.w * 0.2} y={b.y - 26} width={b.w * 0.18} height={26} fill={['#100d0a', '#14100c', '#19140f'][layer]} />}
						{b.roof === 2 && <line x1={b.x + b.w * 0.7} x2={b.x + b.w * 0.7} y1={b.y} y2={b.y - 60} stroke="#3a3026" strokeWidth={2} />}
						{b.roof === 3 && <ellipse cx={b.x + b.w * 0.5} cy={b.y - 14} rx={b.w * 0.12} ry={16} fill={['#100d0a', '#14100c', '#19140f'][layer]} />}
					</g>
				))}
				{CITY_W.map((w, i) => {
					if (w.w !== [8, 13, 20][layer]) return null;
					const isLit = (w.lit < lit || i === force) && w.d <= outR;
					const rp = ripple >= 0 ? Math.max(0, 1 - Math.abs(w.d - ripple) / 120) : 0;
					return isLit ? (
						<g key={i}>
							<rect x={w.x} y={w.y} width={w.w} height={w.h} fill={w.cool ? '#aebfdc' : '#e8c27a'} opacity={0.62 + 0.3 * rp} />
							<rect x={w.x} y={w.y + w.h * 0.5} width={w.w} height={w.h * 0.5} fill="#a8763a" opacity={w.cool ? 0 : 0.4} />
							{layer === 2 && <line x1={w.x + w.w / 2} x2={w.x + w.w / 2} y1={w.y} y2={w.y + w.h} stroke="#3a2a1a" strokeWidth={1.2} />}
						</g>
					) : <rect key={i} x={w.x} y={w.y} width={w.w} height={w.h} fill="#221a12" opacity={0.8} />;
				})}
				{layer < 2 && <rect x={-1600} y={300} width={5100} height={800} fill="url(#haze)" />}
			</g>
		))}
	</g>
);

/* ---------- noodle shop ---------- */
export const Shop: React.FC<{x: number; y: number; shutter: number; lit: number; notice: number; t: number}> = ({x, y, shutter, lit, notice, t}) => (
	<g transform={`translate(${x} ${y})`}>
		<ellipse cx={0} cy={250} rx={420} ry={70} fill="#ffcf7a" opacity={0.14 * lit} style={{filter: 'blur(20px)'}} />
		<rect x={-300} y={-260} width={600} height={500} fill="#15110d" stroke="#3a3026" strokeWidth={3} />
		{/* lightbox sign */}
		<rect x={-110} y={-370} width={220} height={120} rx={8} fill="#f1e6cc" />
		<rect x={-110} y={-370} width={220} height={120} rx={8} fill="#ffcf7a" opacity={0.25 * lit} style={{filter: 'blur(14px)'}} />
		<text x={0} y={-278} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 90, fontWeight: 900}} fill="#b8402e">面</text>
		{/* warm interior */}
		<rect x={-250} y={-200} width={500} height={400} fill={`rgba(255,196,120,${0.55 * lit})`} />
		<rect x={-200} y={60} width={400} height={30} fill="#3a2a1a" />
		<ellipse cx={-60} cy={50} rx={60} ry={18} fill="#5a4636" />
		{[0, 1, 2].map((i) => <path key={i} d={`M${-80 + i * 20} ${30} q ${-20 - i * 6} ${-40} ${0} ${-80} q ${18} ${-40} ${-4} ${-90}`} stroke="#fff" strokeOpacity={0.18 * lit} strokeWidth={6} fill="none" transform={`translate(0 ${-((t * 30 + i * 20) % 30)})`} />)}
		{/* roll-up shutter */}
		<g>
			<rect x={-250} y={-200} width={500} height={400 * shutter} fill="#5a5a5e" />
			{Array.from({length: Math.floor(12 * shutter)}, (_, i) => <line key={i} x1={-250} x2={250} y1={-200 + (i + 1) * (400 * shutter) / (12 * shutter + 0.001)} y2={-200 + (i + 1) * (400 * shutter) / (12 * shutter + 0.001)} stroke="#2a2a2c" strokeWidth={2} />)}
			<rect x={-250} y={-200 + 400 * shutter - 10} width={500} height={10} fill="#3a3a3c" />
		</g>
		{/* stools */}
		{[-160, 150].map((sx, i) => <g key={i}><rect x={sx - 30} y={200} width={60} height={14} rx={4} fill="#c4503d" opacity={0.8} /><line x1={sx - 20} x2={sx - 26} y1={214} y2={250} stroke="#8a3a2c" strokeWidth={4} /><line x1={sx + 20} x2={sx + 26} y1={214} y2={250} stroke="#8a3a2c" strokeWidth={4} /></g>)}
		{/* notice */}
		{notice > 0 && (
			<g opacity={Math.min(1, notice * 2)} transform={`translate(0 ${-60 + (1 - notice) * -40}) rotate(${-5 + 5 * (1 - notice)})`}>
				<rect x={-190} y={-60} width={380} height={150} fill={PAPER} />
				<rect x={-90} y={-72} width={70} height={22} fill="#e8dfc8" opacity={0.85} transform="rotate(-8 -55 -61)" />
				<rect x={30} y={-72} width={70} height={22} fill="#e8dfc8" opacity={0.85} transform="rotate(6 65 -61)" />
				<text x={0} y={0} textAnchor="middle" style={{fontFamily: SANS, fontSize: 52, fontWeight: 900}} fill={INKD}>暂停招聘</text>
				<text x={0} y={58} textAnchor="middle" style={{fontFamily: SANS, fontSize: 34, fontWeight: 700}} fill={INKB}>下月起不招人了</text>
			</g>
		)}
	</g>
);

/* ---------- the safety net: a gold diamond lattice with a catenary sag ---------- */
export const Net: React.FC<{x: number; y: number; w?: number; sag: number; p: number}> = ({x, y, w = 760, sag, p}) => {
	const cols = 9, rows = 4, cw = w / cols, rh = 26;
	const sy = (u: number) => sag * (1 - (2 * u - 1) ** 2); // 0..sag
	const pts: React.ReactNode[] = [];
	for (let r0 = 0; r0 <= rows; r0++) {
		const d = Array.from({length: cols * 2 + 1}, (_, i) => {
			const u = i / (cols * 2);
			return `${i ? 'L' : 'M'}${x - w / 2 + u * w} ${y + r0 * rh + sy(u) * (0.6 + r0 * 0.1) + ((i + r0) % 2 ? rh / 2 : 0)}`;
		}).join(' ');
		pts.push(<path key={r0} d={d} stroke="#e2c27f" strokeWidth={2.5} fill="none" pathLength={1} strokeDasharray={`${p} 1`} />);
	}
	return (
		<g>
			<line x1={x - w / 2} x2={x - w / 2} y1={y - 20} y2={y + rows * rh + 60} stroke="#8a6424" strokeWidth={8} />
			<line x1={x + w / 2} x2={x + w / 2} y1={y - 20} y2={y + rows * rh + 60} stroke="#8a6424" strokeWidth={8} />
			{pts}
		</g>
	);
};

/** the 饼 snapped into 3 pieces */
export const Broken: React.FC<{x: number; y: number; r: number; split: number; grey: number; id: string}> = ({x, y, r, split, grey, id}) => {
	const paths = [
		`M${x} ${y} L${x - r * 1.2} ${y - r * 0.2} L${x - r * 1.2} ${y - r * 1.2} L${x + r * 0.1} ${y - r * 1.2} L${x + r * 0.05} ${y - r * 0.5} Z`,
		`M${x} ${y} L${x + r * 0.05} ${y - r * 0.5} L${x + r * 0.1} ${y - r * 1.2} L${x + r * 1.2} ${y - r * 1.2} L${x + r * 1.2} ${y + r * 0.3} Z`,
		`M${x} ${y} L${x + r * 1.2} ${y + r * 0.3} L${x + r * 1.2} ${y + r * 1.2} L${x - r * 1.2} ${y + r * 1.2} L${x - r * 1.2} ${y - r * 0.2} Z`,
	];
	const off = [[-1, -0.6, -4], [1, -0.7, 4], [0.1, 1, -2]];
	return (
		<g style={{filter: `grayscale(${grey}) brightness(${1 - 0.35 * grey})`}}>
			<defs>{paths.map((d, i) => <clipPath key={i} id={`${id}c${i}`}><path d={d} /></clipPath>)}</defs>
			{paths.map((_, i) => (
				<g key={i} transform={`translate(${off[i][0] * 10 * split} ${off[i][1] * 10 * split}) rotate(${off[i][2] * split} ${x} ${y})`}>
					<g clipPath={`url(#${id}c${i})`}><Bread x={x} y={y} r={r} bite={1} id={`${id}b${i}`} /></g>
				</g>
			))}
		</g>
	);
};
