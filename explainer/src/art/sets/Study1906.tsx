import React, {useMemo} from 'react';
import {random} from 'remotion';
import {P} from '../palette';
import {CAM0, Layer, type Cam} from './Airfield';

/**
 * 42 Rutland Gate, London, a night in 1906: Francis Galton's study.
 * Back wall (dark green paper, books, a fogged window with a street lamp) →
 * the long desk (hero plane) lit by one oil lamp, the warm key; the moon through the
 * window is the cool rim. A Galton board (his own bean machine) stands on the shelf.
 * `desk` draws on the desktop (top edge y = DESK_Y); `children` in front of the desk.
 */

export const DESK_Y = 760;
/** where the bean machine stands, on the back-wall layer (depth 0.55): base centre */
export const BOARD_AT = {x: 720, y: 600, depth: 0.55};

/** Galton's bean machine: pins in a triangle, beads piling into a bell. Origin at its base centre. */
export const Quincunx: React.FC<{fill?: number; glow?: number}> = ({fill = 1, glow = 0}) => {
	const bins = [1, 3, 7, 12, 15, 12, 7, 3, 1];
	return (
		<g>
			<rect x={-96} y={-300} width={192} height={300} rx={6} fill="url(#wood)" />
			<rect x={-84} y={-288} width={168} height={276} fill="#1a1612" />
			<rect x={-84} y={-288} width={168} height={276} fill="url(#glass)" opacity={0.12} />
			<path d="M-20,-288 L-6,-268 L6,-268 L20,-288 Z" fill="#3a2a1e" />
			{Array.from({length: 7}, (_, r) =>
				Array.from({length: r + 1}, (_, c) => <circle key={`${r}-${c}`} cx={(c - r / 2) * 18} cy={-252 + r * 16} r={2.2} fill="#c9a95e" />),
			)}
			{bins.map((n, i) => {
				const x = (i - 4) * 18;
				return (
					<g key={i}>
						<line x1={x - 9} y1={-120} x2={x - 9} y2={-12} stroke="#5a4632" strokeWidth={2} />
						{Array.from({length: Math.round(n * fill)}, (_, k) => (
							<circle key={k} cx={x} cy={-17 - k * 7.4} r={3.6} fill={glow > 0 && i === 4 ? '#f1c56d' : '#d8cdb4'} />
						))}
					</g>
				);
			})}
			<line x1={76} y1={-120} x2={76} y2={-12} stroke="#5a4632" strokeWidth={2} />
		</g>
	);
};

const Books: React.FC<{x: number; y: number; w: number; seed: string}> = ({x, y, w, seed}) => {
	const items = useMemo(() => {
		const out: {x: number; w: number; h: number; c: string; lean: number}[] = [];
		let cx = 0;
		let i = 0;
		const cols = ['#4a2a24', '#2f3a2c', '#3a3448', '#5a4630', '#2a2e3a', '#6a5a3a', '#3e2a22'];
		while (cx < w - 10) {
			const bw = 12 + random(`${seed}w${i}`) * 16;
			const lean = random(`${seed}l${i}`) > 0.93 ? 8 : 0;
			out.push({x: cx, w: bw, h: 70 + random(`${seed}h${i}`) * 40, c: cols[Math.floor(random(`${seed}c${i}`) * cols.length)], lean});
			cx += bw + 1 + lean;
			i++;
		}
		return out;
	}, [seed, w]);
	return (
		<g transform={`translate(${x},${y})`}>
			{items.map((b, i) => (
				<g key={i} transform={`translate(${b.x},0) rotate(${b.lean})`}>
					<rect x={0} y={-b.h} width={b.w} height={b.h} fill={b.c} />
					<rect x={2} y={-b.h + 10} width={b.w - 4} height={3} fill="#c9a95e" opacity={0.5} />
					<rect x={2} y={-18} width={b.w - 4} height={2} fill="#c9a95e" opacity={0.35} />
				</g>
			))}
		</g>
	);
};

/** The desk lamp: brass font, glass chimney, a white globe; `on` 0..1. Origin at its base. */
export const OilLamp: React.FC<{f?: number; on?: number}> = ({f = 0, on = 1}) => {
	const fl = 0.95 + 0.03 * Math.sin(f / 3.3) + 0.02 * Math.sin(f / 1.9);
	return (
		<g>
			<circle cy={-150} r={620} fill="url(#lantern-glow)" opacity={0.55 * on * fl} />
			<ellipse cx={0} cy={0} rx={46} ry={8} fill="url(#brass)" />
			<path d="M-10,0 L-6,-60 L6,-60 L10,0 Z" fill="url(#brass)" />
			<ellipse cx={0} cy={-80} rx={34} ry={26} fill="url(#brass)" />
			<rect x={-8} y={-118} width={16} height={18} fill="#e8f0f4" opacity={0.6} />
			<ellipse cx={0} cy={-150} rx={44} ry={40} fill="#fff6e0" opacity={0.55 + 0.4 * on * fl} />
			<ellipse cx={0} cy={-150} rx={30} ry={26} fill="#fffaf0" opacity={0.6 * on} />
			<rect x={-7} y={-196} width={14} height={16} fill="#e8f0f4" opacity={0.5} />
		</g>
	);
};

export const Study1906: React.FC<{
	frame: number;
	cam?: Cam;
	desk?: React.ReactNode;
	children?: React.ReactNode;
	front?: React.ReactNode;
	lamp?: number;
	/** bean machine on the shelf: how full, and whether its middle bin glows */
	board?: number;
	boardGlow?: number;
	/** replace the static bean machine (e.g. an animated one); drawn at its base centre */
	boardNode?: React.ReactNode;
	/** on the hero plane but behind the desk (a person standing at it, seen from the waist up) */
	behind?: React.ReactNode;
}> = ({frame: f, cam = CAM0, desk, children, front, lamp = 1, board = 1, boardGlow = 0, boardNode, behind}) => (
	<g>
		<Layer cam={cam} depth={0.55}>
			{/* wall: dark green paper with a faint damask, wainscot below */}
			<rect x={-500} y={-400} width={2920} height={1700} fill="#1c2620" />
			{Array.from({length: 14}, (_, i) =>
				Array.from({length: 8}, (_, j) => (
					<path key={`${i}-${j}`} d={`M${-400 + i * 200 + (j % 2) * 100},${-120 + j * 110} c14,-20 34,-20 40,0 c-6,20 -26,20 -40,0 Z`} fill="#2a3a30" opacity={0.6} />
				)),
			)}
			<rect x={-500} y={620} width={2920} height={700} fill="#2a1c14" />
			<rect x={-500} y={610} width={2920} height={14} fill="#3a281c" />
			{/* bookcase */}
			<g transform="translate(60,0)">
				<rect x={0} y={60} width={520} height={600} fill="#2a1c12" />
				{[200, 340, 480, 620].map((y) => (
					<g key={y}>
						<Books x={14} y={y} w={492} seed={`bk${y}`} />
						<rect x={6} y={y} width={508} height={12} fill="#3e2a1a" />
					</g>
				))}
				<rect x={0} y={44} width={520} height={20} fill="#3e2a1a" />
			</g>
			{/* the bean machine on a side cabinet */}
			<g transform="translate(720,600)">
				<rect x={-130} y={0} width={260} height={30} fill="#3e2a1a" />
				{boardNode ?? <Quincunx fill={board} glow={boardGlow} />}
			</g>
			{/* window: London fog, roofs, a gas lamp */}
			<g transform="translate(1400,130)">
				<rect x={0} y={0} width={400} height={470} fill="#1a2438" />
				<rect x={0} y={0} width={400} height={470} fill="url(#sky-night)" opacity={0.9} />
				<path d="M0,330 L40,330 L40,290 L90,290 L90,310 L150,310 L150,270 L170,250 L190,270 L190,320 L260,320 L260,280 L330,280 L330,300 L400,300 L400,470 L0,470 Z" fill="#141a28" />
				<g transform="translate(300,360)">
					<line x1={0} y1={0} x2={0} y2={110} stroke="#0e121c" strokeWidth={6} />
					<circle r={60} fill="url(#glow-moon)" opacity={0.8} />
					<rect x={-9} y={-14} width={18} height={20} fill="#dfe8f5" opacity={0.75} />
				</g>
				<rect x={0} y={0} width={400} height={470} fill={P.night4} opacity={0.25} />
				<rect x={194} y={0} width={12} height={470} fill="#2a1c12" />
				<rect x={0} y={230} width={400} height={12} fill="#2a1c12" />
				<rect x={-18} y={-18} width={436} height={506} fill="none" stroke="#2a1c12" strokeWidth={26} />
				<path d="M-60,-40 C-20,120 -50,320 -20,520 L-90,520 L-90,-40 Z M460,-40 C420,120 450,320 420,520 L490,520 L490,-40 Z" fill="#4a1e22" />
			</g>
			{/* moonlight from the window across the wall */}
			<path d="M1400,130 L1800,130 L1360,1000 L960,1000 Z" fill="url(#beam-cool)" opacity={0.14} filter="url(#blur-md)" />
		</Layer>
		<Layer cam={cam} depth={1}>
			{behind}
			{/* the desk */}
			<rect x={-400} y={DESK_Y + 300} width={2720} height={400} fill="#120c08" />
			<rect x={-300} y={DESK_Y} width={2520} height={26} fill="#5a3d27" />
			<rect x={-300} y={DESK_Y} width={2520} height={8} fill="#7a5636" />
			<rect x={-300} y={DESK_Y + 26} width={2520} height={400} fill="url(#wood)" />
			{[0, 1, 2, 3, 4].map((i) => (
				<g key={i} transform={`translate(${-100 + i * 520},${DESK_Y + 70})`}>
					<rect x={0} y={0} width={420} height={120} rx={4} fill="none" stroke="#2a1a10" strokeWidth={4} />
					<rect x={190} y={52} width={40} height={10} rx={4} fill="url(#brass)" />
				</g>
			))}
			{/* the lamp pool on the desktop */}
			<ellipse cx={1300} cy={DESK_Y + 12} rx={700} ry={40} fill="#ffcf8a" opacity={0.16 * lamp} />
			{/* inkwell, pen, a magnifier */}
			<g transform={`translate(1560,${DESK_Y + 6})`}>
				<rect x={-26} y={-30} width={52} height={30} rx={4} fill="#1a2430" />
				<rect x={-12} y={-40} width={24} height={12} fill="url(#brass)" />
				<line x1={10} y1={-36} x2={70} y2={-110} stroke="#2a1e14" strokeWidth={4} />
			</g>
			<g transform={`translate(1700,${DESK_Y + 4})`}>
				<ellipse cx={0} cy={0} rx={44} ry={10} fill="none" stroke="url(#brass)" strokeWidth={6} />
				<line x1={40} y1={2} x2={110} y2={8} stroke="#3a2a1e" strokeWidth={9} strokeLinecap="round" />
			</g>
			{desk}
			<g transform={`translate(1300,${DESK_Y + 6})`}>
				<OilLamp f={f} on={lamp} />
			</g>
			{children}
		</Layer>
		<Layer cam={cam} depth={1.35}>
			{front}
		</Layer>
	</g>
);
