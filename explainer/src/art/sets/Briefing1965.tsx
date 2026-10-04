import React from 'react';
import {random} from 'remotion';
import {TrainerJet} from '../Jet';
import {P} from '../palette';
import {CAM0, Layer, type Cam} from './Airfield';

/**
 * The flight school's briefing room, a night in the mid-1960s: a corrugated prefab hall,
 * a long chalkboard, a window onto the flight line, one hanging lamp (the warm key; the
 * window is the cool rim). Rows of instructors seen from behind fill the foreground.
 * `board` draws on the chalkboard (local coords 0..800 × 0..340, origin top-left);
 * `children` stands on the hero plane (floor at y = FLOOR_Y); `front` replaces the audience.
 */

export const FLOOR_Y = 900;
export const BOARD = {x: 520, y: 250, w: 800, h: 340, depth: 0.62};

export const BRIEFING_DEFS: React.FC = () => (
	<defs>
		<linearGradient id="br-wall" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#14171c" />
			<stop offset="0.5" stopColor="#2a2c28" />
			<stop offset="1" stopColor="#23241f" />
		</linearGradient>
		<linearGradient id="br-board" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stopColor="#24382e" />
			<stop offset="1" stopColor="#18261f" />
		</linearGradient>
		<radialGradient id="br-cone" cx="50%" cy="0%" r="100%">
			<stop offset="0" stopColor="#ffe2a8" stopOpacity="0.5" />
			<stop offset="0.55" stopColor="#ffb54d" stopOpacity="0.1" />
			<stop offset="1" stopColor="#ffb54d" stopOpacity="0" />
		</radialGradient>
		<linearGradient id="br-dusk" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#1d2a48" />
			<stop offset="0.7" stopColor="#6a5266" />
			<stop offset="1" stopColor="#d48d5a" />
		</linearGradient>
	</defs>
);

/** One seated instructor seen from behind: shoulders, neck and a forage cap (or bare head). */
export const SeatedBack: React.FC<{f: number; seed: string; cap?: boolean; s?: number; tone?: string}> = ({f, seed, cap = random(`${seed}c`) > 0.4, s = 1, tone = '#0b0c10'}) => {
	const turn = 5 * Math.sin(f / (60 + random(`${seed}t`) * 50) + random(`${seed}p`) * 6);
	const breathe = 1.5 * Math.sin(f / (22 + random(`${seed}b`) * 10) + random(`${seed}q`) * 6);
	return (
		<g transform={`scale(${s})`}>
			<path d={`M-92,0 C-92,-70 -70,-${96 + breathe} 0,-${100 + breathe} C70,-${96 + breathe} 92,-70 92,0 Z`} fill={tone} />
			<g transform={`translate(${turn},${-118 - breathe}) rotate(${turn * 0.6})`}>
				<rect x={-14} y={0} width={28} height={22} fill={tone} />
				<ellipse cx={0} cy={-24} rx={34} ry={40} fill={tone} />
				{cap ? <path d="M-36,-36 C-30,-66 30,-66 36,-36 L36,-28 L-36,-28 Z" fill={tone} /> : null}
				{/* a cool rim from the window on the right */}
				<path d="M30,-50 C40,-30 38,-6 26,8" stroke="#9cc0ee" strokeWidth={3} fill="none" opacity={0.35} />
			</g>
			<path d={`M60,-${88 + breathe} C84,-70 90,-40 92,0`} stroke="#9cc0ee" strokeWidth={3} fill="none" opacity={0.3} />
		</g>
	);
};

/** The default audience: two rows of instructors from behind. */
export const Audience: React.FC<{f: number; x0?: number}> = ({f, x0 = 0}) => (
	<g>
		{[-120, 180, 470, 1350, 1640, 1940].map((x, i) => (
			<g key={`b${i}`} transform={`translate(${x + x0},${1010})`}>
				<SeatedBack f={f} seed={`ra${i}`} s={1.25} />
			</g>
		))}
		{[40, 330, 1500, 1790].map((x, i) => (
			<g key={`c${i}`} transform={`translate(${x + x0},${1180})`}>
				<SeatedBack f={f + 30} seed={`rb${i}`} s={1.6} tone="#06070a" />
			</g>
		))}
	</g>
);

/** The hanging lamp: enamel shade, bulb, cone of light. Origin: the bulb. */
const HangingLamp: React.FC<{f: number; on: number}> = ({f, on}) => {
	const swing = 1.6 * Math.sin(f / 50);
	return (
		<g transform={`rotate(${swing},0,-260)`}>
			<line x1={0} y1={-260} x2={0} y2={-30} stroke="#1a1a1a" strokeWidth={3} />
			<path d="M-40,0 L-620,820 L620,820 L40,0 Z" fill="url(#br-cone)" opacity={0.5 * on} filter="url(#blur-lg)" />
			<path d="M-70,0 C-60,-28 -30,-38 0,-38 C30,-38 60,-28 70,0 Z" fill="#2f4a3c" />
			<path d="M-70,0 C-60,-28 -30,-38 0,-38 C30,-38 60,-28 70,0 Z" fill="none" stroke="#dfe6dc" strokeWidth={2} opacity={0.4} />
			<ellipse cx={0} cy={2} rx={18} ry={10} fill="#fff6dc" opacity={0.5 + 0.5 * on} />
			<circle cy={10} r={120} fill="url(#glow-lamp)" opacity={0.7 * on} />
		</g>
	);
};

export const Briefing1965: React.FC<{
	frame: number;
	cam?: Cam;
	board?: React.ReactNode;
	children?: React.ReactNode;
	front?: React.ReactNode;
	lamp?: number;
	/** 0 = dusk in the window, 1 = night */
	night?: number;
}> = ({frame: f, cam = CAM0, board, children, front, lamp = 1, night = 0}) => (
	<g>
		<Layer cam={cam} depth={BOARD.depth}>
			{/* the corrugated hall */}
			<rect x={-700} y={-500} width={3300} height={1900} fill="url(#br-wall)" />
			{Array.from({length: 46}, (_, i) => (
				<line key={i} x1={-700 + i * 72} y1={-500} x2={-700 + i * 72} y2={760} stroke="#000" strokeWidth={10} opacity={0.12} />
			))}
			<path d="M-700,-120 Q960,-420 2620,-120 L2620,-500 L-700,-500 Z" fill="#0d0f12" />
			<rect x={-700} y={700} width={3300} height={70} fill="#1c1d1a" />
			{/* chalkboard */}
			<g transform={`translate(${BOARD.x},${BOARD.y})`}>
				<rect x={-18} y={-18} width={BOARD.w + 36} height={BOARD.h + 36} fill="#4a3624" />
				<rect x={0} y={0} width={BOARD.w} height={BOARD.h} fill="url(#br-board)" />
				{/* old chalk dust */}
				{Array.from({length: 18}, (_, i) => (
					<ellipse key={i} cx={random(`cd${i}`) * BOARD.w} cy={random(`ce${i}`) * BOARD.h} rx={30 + random(`cf${i}`) * 80} ry={8 + random(`cg${i}`) * 14} fill="#dfe8e0" opacity={0.035} />
				))}
				<rect x={-10} y={BOARD.h + 8} width={BOARD.w + 20} height={10} fill="#5a432c" />
				{board}
			</g>
			{/* window onto the flight line */}
			<g transform="translate(1500,240)">
				<rect x={0} y={0} width={300} height={260} fill="url(#br-dusk)" />
				<rect x={0} y={0} width={300} height={260} fill={P.night1} opacity={0.75 * night} />
				<path d="M0,214 L300,206 L300,260 L0,260 Z" fill="#2a2430" />
				{[60, 170].map((x, i) => (
					<g key={i} transform={`translate(${x},212) scale(0.12)`} opacity={0.75}>
						<TrainerJet lod="far" gear warm={0.3} />
					</g>
				))}
				<rect x={146} y={0} width={8} height={260} fill="#2a2620" />
				<rect x={0} y={126} width={300} height={8} fill="#2a2620" />
				<rect x={-14} y={-14} width={328} height={288} fill="none" stroke="#2a2620" strokeWidth={22} />
			</g>
			<path d="M1500,240 L1800,240 L1600,1000 L1200,1000 Z" fill="url(#beam-cool)" opacity={0.12} filter="url(#blur-md)" />
			{/* a wall chart of aircraft silhouettes and a clock */}
			<g transform="translate(130,290)">
				<rect x={0} y={0} width={240} height={300} fill="#d9cfb6" opacity={0.85} />
				{[0, 1, 2, 3].map((i) => (
					<g key={i} transform={`translate(120,${50 + i * 68}) scale(0.32)`}>
						<g opacity={0.8} style={{filter: 'brightness(0.15)'}}>
							<TrainerJet lod="far" />
						</g>
					</g>
				))}
			</g>
			<g transform="translate(1660,110)">
				<circle r={42} fill="#e8e0cc" />
				<circle r={42} fill="none" stroke="#2a2620" strokeWidth={6} />
				<line x1={0} y1={0} x2={0} y2={-28} stroke="#2a2620" strokeWidth={4} />
				<line x1={0} y1={0} x2={18} y2={10} stroke="#2a2620" strokeWidth={4} />
			</g>
		</Layer>
		<Layer cam={cam} depth={0.85}>
			{/* floorboards */}
			<polygon points={`-800,760 2720,760 2720,1400 -800,1400`} fill="#2a1e16" />
			{Array.from({length: 22}, (_, i) => (
				<line key={i} x1={960 + (i - 11) * 60} y1={760} x2={960 + (i - 11) * 260} y2={1400} stroke="#1a120c" strokeWidth={3} opacity={0.6} />
			))}
			<ellipse cx={960} cy={880} rx={760} ry={110} fill="#ffcf8a" opacity={0.1 * lamp} />
		</Layer>
		<Layer cam={cam} depth={1} filter="url(#grade-night)">
			{children}
		</Layer>
		<Layer cam={cam} depth={0.95}>
			<g transform="translate(960,90)">
				<HangingLamp f={f} on={lamp} />
			</g>
		</Layer>
		<Layer cam={cam} depth={1.3}>
			{front ?? <Audience f={f} />}
		</Layer>
	</g>
);
