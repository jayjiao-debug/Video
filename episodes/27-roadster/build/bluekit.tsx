import React from 'react';
import {AbsoluteFill} from 'remotion';
import {W, H, SANS} from './kit27';
import {BODY, WHEELS} from './Car27';

/* ep27 v4 look "蓝图": one huge engineering sheet. Lines draw themselves, parts explode out, sections cut open,
   forces are vectors, the spec is the drawing's title block. White ink on blueprint blue, one hot colour for force. */
export const B = {
	paper: '#0c3a86', paperDk: '#082a66', ink: '#eaf3ff', inkMute: 'rgba(234,243,255,0.62)', faint: 'rgba(234,243,255,0.16)',
	cyan: '#7fe3ff', force: '#ff7a45', amber: '#ffc95c', stamp: '#ff5a4a',
};
const GLASS = 'M 628 116 C 590 84, 552 74, 470 72 C 410 72, 352 88, 300 112 C 296 116, 300 120, 308 120 L 612 124 C 624 124, 632 120, 628 116 Z';
const TANKS: [number, number, number, number][] = [[300, 196, 420, 24], [120, 140, 160, 30], [130, 176, 150, 26], [690, 166, 210, 30], [520, 152, 100, 26]];
const NOZ: [number, number][] = [[118, 232], [330, 232], [690, 232], [905, 232], [26, 186], [996, 204]];

/** the sheet: paper, grid, drawing border */
export const Paper: React.FC<{children?: React.ReactNode}> = ({children}) => (
	<AbsoluteFill style={{background: `radial-gradient(1400px 900px at 45% 40%, ${B.paper}, ${B.paperDk} 100%)`}}>
		<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
			<defs>
				<pattern id="gMin" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(234,243,255,0.06)" strokeWidth="1" /></pattern>
				<pattern id="gMaj" width="120" height="120" patternUnits="userSpaceOnUse"><rect width="120" height="120" fill="url(#gMin)" /><path d="M 120 0 L 0 0 0 120" fill="none" stroke="rgba(234,243,255,0.11)" strokeWidth="1.2" /></pattern>
				<filter id="paperN"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0" /></filter>
			</defs>
			<rect width={W} height={H} fill="url(#gMaj)" />
			<rect width={W} height={H} filter="url(#paperN)" />
		</svg>
		{children}
	</AbsoluteFill>
);

/** line-art car (side elevation). Local 1000 × 292, wheel line at y 292. Hidden parts dashed; highlights optional. */
export const LineCar: React.FC<{sw?: number; parts?: number; fan?: number; tanks?: number; nozzles?: number; lift?: number; ghost?: number}> = ({sw = 3, parts = 0.5, fan = 0, tanks = 0, nozzles = 0, lift = 0, ghost = 0}) => (
	<g>
		{/* body shell (lifts away in the exploded view) */}
		<g transform={`translate(0 ${-lift})`} opacity={1 - ghost * 0.6}>
			<path d={BODY} fill="rgba(234,243,255,0.05)" stroke={B.ink} strokeWidth={sw} strokeLinejoin="round" />
			<path d={GLASS} fill="rgba(127,227,255,0.10)" stroke={B.ink} strokeWidth={sw * 0.8} />
			<path d="M 60 150 C 300 128, 640 140, 960 182" stroke={B.inkMute} strokeWidth={sw * 0.6} fill="none" />
			<path d="M 300 128 L 296 214 M 612 126 C 618 160, 616 196, 606 220" stroke={B.inkMute} strokeWidth={sw * 0.6} fill="none" />
			<path d="M 946 176 C 966 180, 984 188, 992 198" stroke={B.ink} strokeWidth={sw} fill="none" />
		</g>
		{/* chassis line + wheels */}
		<path d="M 60 230 L 970 230" stroke={B.ink} strokeWidth={sw} />
		{WHEELS.map(([cx, cy], i) => (
			<g key={i}>
				<circle cx={cx} cy={cy} r={56} fill={B.paperDk} stroke={B.ink} strokeWidth={sw} />
				<circle cx={cx} cy={cy} r={36} fill="none" stroke={B.inkMute} strokeWidth={sw * 0.6} />
				<circle cx={cx} cy={cy} r={6} fill={B.ink} />
				<path d={`M ${cx - 70} ${cy} L ${cx + 70} ${cy} M ${cx} ${cy - 70} L ${cx} ${cy + 70}`} stroke={B.faint} strokeWidth={1.5} strokeDasharray="10 6 2 6" />
			</g>
		))}
		{/* hidden parts */}
		<g opacity={parts}>
			{TANKS.map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} rx={h / 2} fill={tanks ? `rgba(255,201,92,${0.25 * tanks})` : 'none'} stroke={tanks ? B.amber : B.inkMute} strokeWidth={sw * 0.7} strokeDasharray={tanks ? undefined : '10 7'} />)}
			<rect x={420} y={206} width={180} height={22} rx={8} fill={fan ? `rgba(127,227,255,${0.3 * fan})` : 'none'} stroke={fan ? B.cyan : B.inkMute} strokeWidth={sw * 0.7} strokeDasharray={fan ? undefined : '10 7'} />
		</g>
		{nozzles > 0 && NOZ.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={11} fill={B.paperDk} stroke={B.force} strokeWidth={sw * 0.8} opacity={nozzles} />)}
	</g>
);

/** dimension line between two points with a label (blueprint style: ticks + text) */
export const Dim: React.FC<{x1: number; y1: number; x2: number; y2: number; label: string; size?: number; off?: number; col?: string}> = ({x1, y1, x2, y2, label, size = 40, off = 0, col = B.ink}) => {
	const a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a), ny = Math.cos(a);
	const X1 = x1 + nx * off, Y1 = y1 + ny * off, X2 = x2 + nx * off, Y2 = y2 + ny * off;
	const mx = (X1 + X2) / 2, my = (Y1 + Y2) / 2;
	return (
		<g>
			<line x1={x1} y1={y1} x2={X1 + nx * 10} y2={Y1 + ny * 10} stroke={B.inkMute} strokeWidth={1.5} />
			<line x1={x2} y1={y2} x2={X2 + nx * 10} y2={Y2 + ny * 10} stroke={B.inkMute} strokeWidth={1.5} />
			<line x1={X1} y1={Y1} x2={X2} y2={Y2} stroke={col} strokeWidth={2} />
			{[[X1, Y1, 1], [X2, Y2, -1]].map(([px, py, s], i) => <path key={i} d={`M ${px} ${py} l ${Math.cos(a) * 18 * s - nx * 7} ${Math.sin(a) * 18 * s - ny * 7} l ${nx * 14} ${ny * 14} Z`} fill={col} />)}
			<text x={mx} y={my - 12} textAnchor="middle" style={{fontFamily: SANS, fontSize: size, fontWeight: 800}} fill={col} transform={`rotate(${(a * 180) / Math.PI} ${mx} ${my})`}>{label}</text>
		</g>
	);
};
/** force vector */
export const Vec: React.FC<{x: number; y: number; dx: number; dy: number; w?: number; col?: string}> = ({x, y, dx, dy, w = 10, col = B.force}) => {
	const L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, hx = x + dx, hy = y + dy, hw = w * 2.6, hl = w * 3.4;
	return (
		<g>
			<line x1={x} y1={y} x2={hx - ux * hl * 0.8} y2={hy - uy * hl * 0.8} stroke={col} strokeWidth={w} strokeLinecap="round" />
			<path d={`M ${hx} ${hy} L ${hx - ux * hl - uy * hw} ${hy - uy * hl + ux * hw} L ${hx - ux * hl + uy * hw} ${hy - uy * hl - ux * hw} Z`} fill={col} />
		</g>
	);
};
/** numbered callout: circle + leader + label */
export const Call: React.FC<{n: string; x: number; y: number; tx: number; ty: number; label: string; col?: string; size?: number}> = ({n, x, y, tx, ty, label, col = B.ink, size = 48}) => (
	<g>
		<line x1={x} y1={y} x2={tx} y2={ty} stroke={col} strokeWidth={2} />
		<circle cx={x} cy={y} r={7} fill={col} />
		<circle cx={tx} cy={ty} r={34} fill={B.paperDk} stroke={col} strokeWidth={3} />
		<text x={tx} y={ty + 13} textAnchor="middle" style={{fontFamily: SANS, fontSize: 38, fontWeight: 900}} fill={col}>{n}</text>
		<text x={tx + 52} y={ty + 16} style={{fontFamily: SANS, fontSize: size, fontWeight: 900}} fill={col}>{label}</text>
	</g>
);
export const Fig: React.FC<{x: number; y: number; n: string; t: string}> = ({x, y, n, t}) => (
	<g>
		<text x={x} y={y} style={{fontFamily: SANS, fontSize: 34, fontWeight: 700, letterSpacing: '0.18em'}} fill={B.inkMute}>{`FIG. ${n}`}</text>
		<text x={x} y={y + 60} style={{fontFamily: SANS, fontSize: 52, fontWeight: 900}} fill={B.ink}>{t}</text>
		<line x1={x} y1={y + 82} x2={x + 360} y2={y + 82} stroke={B.inkMute} strokeWidth={2} />
	</g>
);

