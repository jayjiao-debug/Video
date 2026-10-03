import React from 'react';
import {P} from './palette';

export type CatPose = 'sit' | 'fall' | 'right' | 'land' | 'walk';

const FUR = '#d98a4a';
const FUR_DARK = '#a8612e';
const BELLY = '#f3e3cf';

/**
 * A ginger tabby with the poses the high-rise story needs. Origin at the feet,
 * facing right, ~110 units long. The head always overlaps the body at the neck,
 * so every pose reads as one animal.
 */
export const Cat: React.FC<{pose?: CatPose; tail?: number; blink?: number; ghost?: boolean; tone?: string; look?: number}> = ({
	pose = 'sit',
	tail = 0,
	blink = 1,
	ghost,
	tone,
	look = 0,
}) => {
	const fur = ghost ? 'none' : tone ?? FUR;
	const dark = tone ? tone : FUR_DARK;
	const ghostStroke = ghost ? {stroke: tone ?? P.red, strokeWidth: 3, strokeDasharray: '6 6'} : {};
	const st = {fill: fur, ...ghostStroke};

	const Head: React.FC<{x: number; y: number; r?: number; tilt?: number}> = ({x, y, r = 0, tilt = 0}) => (
		<g transform={`translate(${x},${y}) rotate(${r + tilt})`}>
			<path d="M-15,-8 L-13,-30 L-2,-15 Z M4,-15 L15,-30 L17,-8 Z" {...st} />
			{!ghost ? <path d="M-12,-12 L-11,-24 L-5,-15 Z M7,-15 L13,-24 L14,-12 Z" fill="#f0b8a0" /> : null}
			<ellipse cx={0} cy={0} rx={19} ry={16} {...st} />
			{!ghost ? (
				<>
					<path d="M-6,-14 L-5,-8 M0,-16 L0,-9 M6,-14 L5,-8" stroke={dark} strokeWidth={2.4} strokeLinecap="round" />
					<ellipse cx={3 + look} cy={7} rx={9} ry={6.5} fill={BELLY} />
					<ellipse cx={-5 + look} cy={-2} rx={2.6} ry={3.6 * blink} fill="#2f2a17" />
					<ellipse cx={8 + look} cy={-2} rx={2.6} ry={3.6 * blink} fill="#2f2a17" />
					<path d={`M${1 + look},5 L${5 + look},5 L${3 + look},8 Z`} fill="#c45a5a" />
					<path d={`M${10 + look},8 L24,6 M${10 + look},10 L24,12`} stroke="#f3e3cf" strokeWidth={1} opacity={0.7} />
				</>
			) : null}
		</g>
	);
	const Tail: React.FC<{x: number; y: number; d: string}> = ({x, y, d}) => (
		<path d={`M${x},${y} ${d}`} fill="none" stroke={ghost ? tone ?? P.red : fur} strokeWidth={ghost ? 3 : 10} strokeDasharray={ghost ? '6 6' : undefined} strokeLinecap="round" />
	);
	const Leg: React.FC<{x1: number; y1: number; x2: number; y2: number}> = ({x1, y1, x2, y2}) => (
		<path d={`M${x1},${y1} L${x2},${y2}`} stroke={ghost ? tone ?? P.red : fur} strokeWidth={ghost ? 3 : 10} strokeLinecap="round" strokeDasharray={ghost ? '6 6' : undefined} />
	);
	const stripes = (x: number, y: number) =>
		!ghost ? <path d={`M${x},${y} l6,10 M${x + 12},${y - 2} l6,10 M${x + 24},${y - 1} l5,9`} stroke={dark} strokeWidth={3} strokeLinecap="round" /> : null;

	switch (pose) {
		case 'sit':
			return (
				<g>
					<Tail x={-24} y={-6} d={`C-50,-4 -48,${-34 - tail * 10} -36,${-46 - tail * 14}`} />
					<path d="M-30,0 C-34,-34 -16,-60 10,-62 C26,-62 34,-50 34,-34 L36,0 Z" {...st} />
					{!ghost ? <path d="M22,-50 C32,-36 32,-14 30,0 L18,0 C22,-16 20,-36 22,-50 Z" fill={BELLY} /> : null}
					{stripes(-24, -40)}
					<Leg x1={26} y1={-10} x2={28} y2={0} />
					<Head x={28} y={-70} />
				</g>
			);
		case 'walk':
			return (
				<g>
					<Tail x={-40} y={-44} d={`C-62,-50 -66,${-72 - tail * 8} -56,${-88 - tail * 10}`} />
					<Leg x1={-30} y1={-30} x2={-34 + Math.sin(tail * 6) * 6} y2={0} />
					<Leg x1={28} y1={-30} x2={32 - Math.sin(tail * 6) * 6} y2={0} />
					<ellipse cx={0} cy={-40} rx={44} ry={17} {...st} />
					{stripes(-24, -54)}
					<Leg x1={-22} y1={-30} x2={-20 - Math.sin(tail * 6) * 6} y2={0} />
					<Leg x1={36} y1={-30} x2={38 + Math.sin(tail * 6) * 6} y2={0} />
					<Head x={46} y={-60} />
				</g>
			);
		case 'fall':
			// tumbling, belly up, paws flailing
			return (
				<g transform="translate(0,-40)">
					<Tail x={-38} y={-4} d="C-60,6 -70,-20 -60,-38" />
					{[-26, -10, 14, 28].map((x, i) => (
						<Leg key={x} x1={x} y1={-10} x2={x + (i % 2 ? 10 : -10)} y2={-36} />
					))}
					<ellipse cx={0} cy={0} rx={42} ry={17} {...st} />
					{!ghost ? <ellipse cx={0} cy={-6} rx={30} ry={8} fill={BELLY} /> : null}
					<Head x={42} y={10} r={150} />
				</g>
			);
		case 'right':
			// mid-air righting: back up, legs spread like a parachute
			return (
				<g transform="translate(0,-40)">
					<Tail x={-40} y={-6} d="C-60,-18 -64,-40 -52,-56" />
					{[-30, -14, 16, 32].map((x) => (
						<Leg key={x} x1={x} y1={4} x2={x * 1.5} y2={30} />
					))}
					<ellipse cx={0} cy={-2} rx={42} ry={16} {...st} />
					{stripes(-24, -16)}
					<Head x={44} y={-10} tilt={-6} />
				</g>
			);
		default:
			// land: crouched, absorbing the impact
			return (
				<g>
					<Tail x={-44} y={-16} d={`C-64,-14 -70,${-30 - tail * 10} -62,${-46 - tail * 10}`} />
					{[-34, -20, 22, 36].map((x) => (
						<Leg key={x} x1={x} y1={-12} x2={x + (x < 0 ? -8 : 8)} y2={0} />
					))}
					<ellipse cx={0} cy={-20} rx={46} ry={15} {...st} />
					{stripes(-26, -32)}
					<Head x={46} y={-30} />
				</g>
			);
	}
};
