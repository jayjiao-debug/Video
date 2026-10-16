import React from 'react';
import {K, Air, W, H} from './kit27';
import {Car, Plume} from './Car27';

/* the test site: a track that bends up and over into a flat ceiling, hung from a gantry */
export const CURL = {cx: 1180, cy: 560, r: 380, band: 54, lipX: 420};
export const CEIL_Y = CURL.cy - CURL.r;
export const onCurl = (deg: number, c = CURL) => {
	const a = (deg * Math.PI) / 180;
	return {x: c.cx + c.r * Math.cos(a), y: c.cy + c.r * Math.sin(a), rot: deg - 90};
};

export const Horizon: React.FC<{hy: number; dx?: number}> = ({hy, dx = 0}) => (
	<g opacity={0.9}>
		{/* distant test stands and light towers */}
		<g fill="#1b2638" transform={`translate(${dx} 0)`}>
			<path d={`M 120 ${hy} L 150 ${hy - 120} L 180 ${hy - 120} L 210 ${hy} Z`} />
			<rect x={240} y={hy - 210} width={34} height={210} />
			<rect x={226} y={hy - 230} width={62} height={22} />
			<path d={`M 1500 ${hy} L 1530 ${hy - 160} L 1590 ${hy - 160} L 1620 ${hy} Z`} />
			<rect x={1660} y={hy - 90} width={190} height={90} />
			<rect x={1740} y={hy - 260} width={18} height={170} />
		</g>
		{[250, 1750, 640].map((x, i) => (
			<g key={i} transform={`translate(${dx} 0)`}>
				<circle cx={x + 8} cy={hy - 232 + i * 70} r={5} fill="#fff1d6" />
				<circle cx={x + 8} cy={hy - 232 + i * 70} r={26} fill="#ffd9a0" opacity={0.18} />
			</g>
		))}
	</g>
);

/** the curl ramp: quarter-pipe up the right side, then a flat ceiling running left to the lip */
export const Curl: React.FC<{c?: typeof CURL; id: string}> = ({c = CURL, id}) => {
	const R = c.r + c.band, top = c.cy - c.r, topO = top - c.band;
	const arcBand = `M ${c.cx} ${c.cy + c.r} A ${c.r} ${c.r} 0 0 0 ${c.cx} ${top} L ${c.cx} ${topO} A ${R} ${R} 0 0 1 ${c.cx} ${c.cy + R} Z`;
	const flatBand = `M ${c.lipX} ${top} L ${c.cx + 1} ${top} L ${c.cx + 1} ${topO} L ${c.lipX} ${topO} Z`;
	const ribs = [] as React.ReactNode[];
	for (let d = 90; d >= -90; d -= 10) {
		const a = (d * Math.PI) / 180;
		ribs.push(<line key={d} x1={c.cx + c.r * Math.cos(a)} y1={c.cy + c.r * Math.sin(a)} x2={c.cx + R * Math.cos(a)} y2={c.cy + R * Math.sin(a)} stroke="rgba(20,26,36,0.5)" strokeWidth={3} />);
	}
	for (let x = c.cx - 66; x > c.lipX; x -= 66) ribs.push(<line key={'f' + x} x1={x} y1={top} x2={x} y2={topO} stroke="rgba(20,26,36,0.5)" strokeWidth={3} />);
	const lattice = (x: number, w: number, y0: number, y1: number) => {
		const parts: React.ReactNode[] = [<rect key="a" x={x} y={y0} width={8} height={y1 - y0} />, <rect key="b" x={x + w - 8} y={y0} width={8} height={y1 - y0} />];
		for (let y = y0, i = 0; y < y1; y += w, i++) parts.push(<line key={i} x1={x + 4} y1={y} x2={x + w - 4} y2={y + w} stroke="#1b2738" strokeWidth={4} />, <line key={'r' + i} x1={x + w - 4} y1={y} x2={x + 4} y2={y + w} stroke="#1b2738" strokeWidth={4} />);
		return parts;
	};
	return (
		<g>
			<defs>
				<radialGradient id={`${id}-band`} cx={c.cx} cy={c.cy} r={R} gradientUnits="userSpaceOnUse">
					<stop offset={(c.r - 2) / R} stopColor={K.steelHi} />
					<stop offset={(c.r + 12) / R} stopColor={K.steel} />
					<stop offset="1" stopColor={K.steelDk} />
				</radialGradient>
				<linearGradient id={`${id}-flat`} x1="0" y1={topO} x2="0" y2={top} gradientUnits="userSpaceOnUse">
					<stop offset="0" stopColor={K.steelDk} />
					<stop offset={1 - 12 / c.band} stopColor={K.steel} />
					<stop offset="1" stopColor={K.steelHi} />
				</linearGradient>
			</defs>
			{/* gantry behind: two lattice towers and a top beam, hangers down to the ceiling */}
			<g fill="#1b2738">
				{lattice(250, 60, 40, 944)}
				{lattice(1660, 60, 40, 944)}
				<rect x={250} y={40} width={1470} height={26} />
				{[520, 760, 1000].map((x) => <rect key={x} x={x - 4} y={60} width={8} height={topO - 60} />)}
			</g>
			<path d={arcBand} fill={`url(#${id}-band)`} />
			<path d={flatBand} fill={`url(#${id}-flat)`} />
			{ribs}
			<path d={`M ${c.cx} ${c.cy + c.r} A ${c.r} ${c.r} 0 0 0 ${c.cx} ${top} L ${c.lipX} ${top}`} fill="none" stroke="#f3f7fb" strokeWidth={3} opacity={0.9} />
			<path d={`M ${c.cx} ${c.cy + c.r - 5} A ${c.r - 5} ${c.r - 5} 0 0 0 ${c.cx} ${top + 5} L ${c.lipX} ${top + 5}`} fill="none" stroke={K.amber} strokeWidth={4} strokeDasharray="34 30" opacity={0.75} />
			<path d={`M ${c.lipX} ${topO} L ${c.lipX} ${top}`} stroke={K.amber} strokeWidth={6} />
		</g>
	);
};

/** one floodlight from (sx, sy) aimed at (tx, ty): a soft volume, the only key light */
export const Flood: React.FC<{sx: number; sy: number; tx: number; ty: number; spread?: number; o?: number; id: string; motes?: number; t?: number}> = ({sx, sy, tx, ty, spread = 0.2, o = 1, id, motes = 0, t = 0}) => {
	const dx = tx - sx, dy = ty - sy, L = Math.hypot(dx, dy) * 1.25;
	const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
	return (
		<g opacity={o}>
			<defs>
				<linearGradient id={`${id}-beam`} x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stopColor="#fff3dc" stopOpacity="0.55" />
					<stop offset="0.6" stopColor="#ffe2b8" stopOpacity="0.16" />
					<stop offset="1" stopColor="#ffe2b8" stopOpacity="0" />
				</linearGradient>
				<filter id={`${id}-bb`} x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="22" /></filter>
				<clipPath id={`${id}-bc`}><path d={`M 0 -10 L ${L} ${-L * spread} L ${L} ${L * spread} L 0 10 Z`} /></clipPath>
			</defs>
			<g transform={`translate(${sx} ${sy}) rotate(${ang})`}>
				<path d={`M 0 -14 L ${L} ${-L * spread} L ${L} ${L * spread} L 0 14 Z`} fill={`url(#${id}-beam)`} filter={`url(#${id}-bb)`} style={{mixBlendMode: 'screen'}} />
				{motes > 0 && <g clipPath={`url(#${id}-bc)`}><Air x={0} y={-L * spread} w={L} h={L * spread * 2} n={motes} seed={11} t={t} col="#fff4e0" r={2} o={0.6} density={(x) => 1 - x / (L * 1.4)} /></g>}
			</g>
			{/* lamp head on a short stand, lens facing the target */}
			<rect x={sx - 6} y={sy} width={12} height={90} fill="#141a22" />
			<g transform={`rotate(${ang} ${sx} ${sy})`}>
				<path d={`M ${sx - 46} ${sy - 30} L ${sx + 6} ${sy - 40} L ${sx + 6} ${sy + 40} L ${sx - 46} ${sy + 30} Z`} fill="#202833" stroke="#3a4656" strokeWidth={2} />
				<rect x={sx + 4} y={sy - 40} width={10} height={80} rx={4} fill="#fffaf0" />
			</g>
			<circle cx={sx} cy={sy} r={90} fill="#fff6e6" opacity={0.3} filter={`url(#${id}-bb)`} />
		</g>
	);
};

/** contact sheet of the vehicles the car jumps over: generic silhouettes (cab, pickup, semi, two sedans) */
export const Lineup: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => {
	const fill = '#151c27', rim = 'rgba(190,210,235,0.35)';
	const wheel = (cx: number, r = 18) => <circle cx={cx} cy={-r} r={r} fill="#0b0f15" />;
	const shapes = [
		{w: 230, d: 'M 0 -22 C 10 -60, 50 -88, 120 -90 C 180 -88, 220 -60, 230 -22 Z', wh: [40, 190]},
		{w: 300, d: 'M 0 -24 L 8 -62 L 110 -70 L 160 -104 L 250 -98 L 300 -66 L 300 -24 Z', wh: [55, 245]},
		{w: 520, d: 'M 0 -26 L 0 -170 L 360 -170 L 360 -40 L 380 -40 L 380 -120 L 470 -124 L 512 -84 L 520 -26 Z', wh: [40, 110, 300, 430, 490]},
		{w: 260, d: 'M 0 -24 C 4 -50, 30 -60, 70 -64 L 110 -94 L 190 -94 L 230 -64 C 252 -60, 260 -46, 260 -24 Z', wh: [50, 210]},
		{w: 270, d: 'M 0 -24 C 4 -54, 24 -66, 60 -70 L 104 -104 L 190 -104 L 236 -70 C 258 -64, 270 -50, 270 -24 Z', wh: [52, 218]},
	];
	let cx = 0;
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`}>
			{shapes.map((sh, i) => {
				const g = (
					<g key={i} transform={`translate(${cx} 0)`}>
						<path d={sh.d} fill={fill} stroke={rim} strokeWidth={2} />
						{sh.wh.map((w) => <React.Fragment key={w}>{wheel(w)}</React.Fragment>)}
					</g>
				);
				cx += sh.w + 40;
				return g;
			})}
		</g>
	);
};

export {Car, Plume, W, H};
