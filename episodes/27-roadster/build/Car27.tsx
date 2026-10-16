import React from 'react';
import {K} from './kit27';

/* A generic low two-seat sports car in side view (original design, no brand marks).
   Local space: 1000 × 292, ground contact centre at (510, 292). Faces right (+x). */
export const BODY = 'M 30 212 C 22 190, 24 160, 40 140 C 90 128, 160 120, 230 112 C 300 98, 360 70, 440 62 C 520 56, 575 66, 642 112 C 700 132, 820 150, 930 168 C 975 176, 998 192, 996 210 C 994 222, 985 228, 970 230 L 862 230 A 72 72 0 0 0 718 230 L 292 230 A 72 72 0 0 0 148 230 L 60 230 C 44 228, 34 222, 30 212 Z';
const GLASS = 'M 628 116 C 590 84, 552 74, 470 72 C 410 72, 352 88, 300 112 C 296 116, 300 120, 308 120 L 612 124 C 624 124, 632 120, 628 116 Z';
export const WHEELS: [number, number][] = [[220, 236], [790, 236]];
/** nozzle positions (local) and their outward direction in degrees (0 = +x, 90 = down) */
export const NOZZLES: [number, number, number][] = [[118, 232, 90], [330, 232, 90], [690, 232, 90], [905, 232, 90], [26, 186, 180], [996, 204, 0]];
export const TANKS: [number, number, number, number][] = [[300, 196, 420, 24], [120, 140, 160, 30], [130, 176, 150, 26], [690, 166, 210, 30], [520, 152, 100, 26]];

export type CarProps = {id: string; x: number; y: number; s?: number; rot?: number; fx?: number; fy?: number; py?: number; shadow?: number; tankN?: number; nozN?: number; xray?: number; spin?: number; tanks?: number; nozzles?: number; fan?: number; o?: number; lightFrom?: 'below' | 'above'};

const Wheel: React.FC<{cx: number; cy: number; id: string; spin: number; ghost: number}> = ({cx, cy, id, spin, ghost}) => (
	<g opacity={1 - ghost * 0.55}>
		<circle cx={cx} cy={cy} r={56} fill="#121418" />
		<circle cx={cx} cy={cy} r={54} fill="none" stroke="#2c3038" strokeWidth={6} />
		<circle cx={cx} cy={cy} r={38} fill={`url(#${id}-rim)`} />
		<g transform={`rotate(${spin} ${cx} ${cy})`}>
			{[0, 72, 144, 216, 288].map((a) => (
				<path key={a} d={`M ${cx} ${cy - 8} L ${cx - 5} ${cy - 35} L ${cx + 5} ${cy - 35} Z`} fill="#d7dde5" transform={`rotate(${a} ${cx} ${cy})`} opacity={0.9} />
			))}
		</g>
		<circle cx={cx} cy={cy} r={9} fill="#9aa4b1" />
		<circle cx={cx} cy={cy} r={38} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={2} />
	</g>
);

export const Car: React.FC<CarProps> = ({id, x, y, s = 1, rot = 0, fx = 1, fy = 1, py = 292, shadow = 1, tankN = 99, nozN = 99, xray = 0, spin = 0, tanks = 1, nozzles = 0, fan = 0, o = 1, lightFrom = 'above'}) => {
	const lit = lightFrom === 'below';
	return (
		<g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * fx} ${s * fy}) translate(-510 ${-py})`} opacity={o}>
			<defs>
				<linearGradient id={`${id}-paint`} x1="0" y1={lit ? '1' : '0'} x2="0" y2={lit ? '0' : '1'}>
					<stop offset="0" stopColor="#ffffff" />
					<stop offset="0.3" stopColor="#e6ebf1" />
					<stop offset="0.5" stopColor="#c3ccd7" />
					{/* horizon reflection band: what makes painted metal read as glossy */}
					<stop offset="0.535" stopColor="#4f5b6c" />
					<stop offset="0.56" stopColor="#e9b48f" />
					<stop offset="0.585" stopColor="#8d97a6" />
					<stop offset="0.8" stopColor="#a6b0bd" />
					<stop offset="1" stopColor="#4b5563" />
				</linearGradient>
				<linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#3b4a60" />
					<stop offset="0.5" stopColor="#141b26" />
					<stop offset="1" stopColor="#0b1018" />
				</linearGradient>
				<radialGradient id={`${id}-rim`}>
					<stop offset="0" stopColor="#4a525e" />
					<stop offset="1" stopColor="#1d2128" />
				</radialGradient>
				<linearGradient id={`${id}-x`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={K.xray} stopOpacity="0.30" />
					<stop offset="1" stopColor={K.xray} stopOpacity="0.10" />
				</linearGradient>
				<linearGradient id={`${id}-copv`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#5b6573" />
					<stop offset="0.45" stopColor="#2a3039" />
					<stop offset="1" stopColor="#14181e" />
				</linearGradient>
				<pattern id={`${id}-weave`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
					<rect width="10" height="10" fill="none" />
					<path d="M0 5 H10" stroke="rgba(255,255,255,0.10)" strokeWidth="4" />
				</pattern>
				<clipPath id={`${id}-clip`}><path d={BODY} /></clipPath>
				<filter id={`${id}-soft`} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="10" /></filter>
			</defs>
			{/* contact shadow */}
			<ellipse cx={510} cy={294} rx={470} ry={14} fill="#000" opacity={0.45 * (1 - xray) * shadow} filter={`url(#${id}-soft)`} />
			{/* solid body */}
			<g opacity={1 - xray}>
				<path d={BODY} fill={`url(#${id}-paint)`} />
				<path d={GLASS} fill={`url(#${id}-glass)`} />
				<path d="M 470 76 C 420 78, 380 88, 340 104" stroke="rgba(255,255,255,0.35)" strokeWidth={5} fill="none" strokeLinecap="round" />
				{/* shoulder line + door + intake */}
				<path d="M 60 150 C 300 128, 640 140, 960 182" stroke="rgba(255,255,255,0.75)" strokeWidth={3} fill="none" />
				<path d="M 300 128 L 296 214 M 612 126 C 618 160, 616 196, 606 220" stroke="rgba(40,48,60,0.45)" strokeWidth={2.5} fill="none" />
				<path d="M 250 176 C 270 166, 300 164, 330 168 L 318 196 C 296 194, 272 192, 252 194 Z" fill="#1a1f27" opacity={0.85} />
				<path d="M 40 214 L 980 214 L 970 230 L 60 230 Z" fill="#1c2129" opacity={0.85} />
				{/* lights */}
				<path d="M 946 176 C 966 180, 984 188, 992 198 L 984 200 C 972 192, 958 186, 944 182 Z" fill="#fff8e8" />
				<path d="M 31 150 L 44 146 L 44 176 L 30 180 Z" fill={K.red} />
			</g>
			{/* x-ray body */}
			{xray > 0 && (
				<g opacity={xray}>
					<path d={BODY} fill={`url(#${id}-x)`} stroke={K.xray} strokeWidth={3} />
					<path d={GLASS} fill="none" stroke={K.xray} strokeWidth={2} opacity={0.6} />
					<path d="M 60 150 C 300 128, 640 140, 960 182" stroke={K.xray} strokeWidth={1.5} fill="none" opacity={0.5} />
					{/* seats */}
					<path d="M 380 200 L 400 120 L 420 118 L 410 196 Z M 470 204 L 520 204 L 520 190 L 470 190 Z" fill={K.xray} opacity={0.25} />
					{/* fan in the floor */}
					<g opacity={fan}>
						<rect x={420} y={206} width={180} height={24} rx={8} fill="#0d2233" stroke={K.xray} strokeWidth={2.5} />
						{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
							const p = ((i / 8 + spin / 360) % 1 + 1) % 1;
							const xx = 430 + p * 160;
							return <path key={i} d={`M ${xx} 210 L ${xx + 14} 226`} stroke={K.xray} strokeWidth={3} opacity={0.4 + 0.6 * Math.sin(p * Math.PI)} />;
						})}
						<path d="M 420 218 C 300 220, 160 214, 40 204" stroke={K.xray} strokeWidth={10} fill="none" opacity={0.35} strokeLinecap="round" />
					</g>
				</g>
			)}
			{/* tanks (COPVs) */}
			{tanks > 0 && xray > 0 && (
				<g opacity={tanks * xray} clipPath={`url(#${id}-clip)`}>
					{TANKS.map(([tx, ty, tw, th], i) => (
						<g key={i} opacity={Math.max(0, Math.min(1, tankN - i))} transform={`translate(${tx + tw / 2} ${ty + th / 2}) scale(${0.6 + 0.4 * Math.max(0, Math.min(1, tankN - i))}) translate(${-(tx + tw / 2)} ${-(ty + th / 2)})`}>
							<rect x={tx} y={ty} width={tw} height={th} rx={th / 2} fill={`url(#${id}-copv)`} stroke={K.frost} strokeWidth={2} />
							<rect x={tx} y={ty} width={tw} height={th} rx={th / 2} fill={`url(#${id}-weave)`} />
							<rect x={tx + th / 2} y={ty + 4} width={tw - th} height={3} rx={1.5} fill="rgba(255,255,255,0.35)" />
						</g>
					))}
				</g>
			)}
			<Wheel cx={WHEELS[0][0]} cy={WHEELS[0][1]} id={id} spin={spin} ghost={xray} />
			<Wheel cx={WHEELS[1][0]} cy={WHEELS[1][1]} id={id} spin={spin} ghost={xray} />
			{/* nozzles */}
			{nozzles > 0 && NOZZLES.map(([nx, ny, a], i) => (
				<g key={i} opacity={nozzles * Math.max(0, Math.min(1, nozN - i))} transform={`rotate(${a - 90} ${nx} ${ny})`}>
					<circle cx={nx} cy={ny} r={13} fill="#0b1520" stroke={K.amber} strokeWidth={3} />
					<circle cx={nx} cy={ny} r={5} fill={K.amber} />
				</g>
			))}
		</g>
	);
};

/** a cold-gas plume from (x, y) along angle a (deg, 0 = +x, 90 = down), length L, in world space */
export const Plume: React.FC<{id: string; x: number; y: number; a: number; L: number; w?: number; o?: number; seed?: number}> = ({id, x, y, a, L, w = 0.32, o = 1, seed = 3}) => {
	const R = (() => { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
	const dots = Array.from({length: 26}, () => [R(), R(), R()]);
	return (
		<g transform={`translate(${x} ${y}) rotate(${a})`} opacity={o}>
			<defs>
				<linearGradient id={`${id}-pl`} x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
					<stop offset="0.35" stopColor={K.frost} stopOpacity="0.6" />
					<stop offset="1" stopColor={K.frost} stopOpacity="0" />
				</linearGradient>
				<filter id={`${id}-pb`} x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation={L * 0.03} /></filter>
			</defs>
			{/* billowing puffs: cold gas expands and turns to mist */}
			{Array.from({length: 9}, (_, k) => {
				const u = (k + 1) / 9, wob = (dots[k][0] - 0.5) * L * w * 0.5;
				return <circle key={k} cx={u * L * 0.92} cy={wob * u} r={6 + u * L * w * 0.95} fill={K.frost} opacity={0.42 * (1 - u * 0.85)} filter={`url(#${id}-pb)`} />;
			})}
			<path d={`M 0 -5 L ${L * 0.38} ${-L * w * 0.32} L ${L * 0.38} ${L * w * 0.32} L 0 5 Z`} fill={`url(#${id}-pl)`} filter={`url(#${id}-pb)`} />
			<path d={`M 0 -2.5 L ${L * 0.22} ${-L * w * 0.12} L ${L * 0.22} ${L * w * 0.12} L 0 2.5 Z`} fill="#fff" opacity={0.95} />
			{dots.map(([u, v, r], i) => <circle key={i} cx={u * L} cy={(v - 0.5) * 2 * u * L * w} r={1.5 + r * 3} fill="#fff" opacity={0.55 * (1 - u)} />)}
		</g>
	);
};
