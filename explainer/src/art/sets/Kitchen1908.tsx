import React from 'react';
import {random} from 'remotion';
import {Steam} from '../Coffee';
import {CAM0, Layer, type Cam} from './Airfield';

/**
 * Dresden, 1908: Melitta Bentz's kitchen in the morning. Light falls through a
 * lace-curtained window from the left onto a tiled wall; a cast-iron range with a
 * steaming kettle; jars on a shelf; a scrubbed wooden table in front.
 * `t` drives the steam and the dust so a rewind can run them backwards.
 */
export const Kitchen1908: React.FC<{t: number; cam?: Cam; children?: React.ReactNode; table?: React.ReactNode; sun?: number}> = ({t, cam = CAM0, children, table, sun = 1}) => (
	<g>
		<Layer cam={cam} depth={0.5}>
			{/* wall: plaster above, tiles below with a blue border */}
			<rect x={-400} y={-200} width={2720} height={1500} fill="#e9dfcc" />
			<rect x={-400} y={430} width={2720} height={900} fill="url(#tile)" />
			{Array.from({length: 36}, (_, i) => (
				<line key={`v${i}`} x1={-400 + i * 80} y1={430} x2={-400 + i * 80} y2={1300} stroke="#b9b09c" strokeWidth={1.5} />
			))}
			{Array.from({length: 12}, (_, i) => (
				<line key={`h${i}`} x1={-400} y1={430 + i * 80} x2={2320} y2={430 + i * 80} stroke="#b9b09c" strokeWidth={1.5} />
			))}
			<rect x={-400} y={420} width={2720} height={20} fill="#3f5f8a" />
			{/* window with lace and the morning outside */}
			<g transform="translate(80,90)">
				<rect width={460} height={560} fill="url(#sky-morning)" />
				<path d="M0,420 C80,380 160,400 240,370 C320,340 400,380 460,360 L460,560 L0,560 Z" fill="#9aa88a" opacity={0.7} />
				<rect x={222} y={0} width={16} height={560} fill="#6a4a30" />
				<rect x={0} y={270} width={460} height={14} fill="#6a4a30" />
				<rect x={-16} y={-16} width={492} height={592} fill="none" stroke="#6a4a30" strokeWidth={24} />
				{/* lace curtains */}
				{[0, 1].map((k) => (
					<path
						key={k}
						d={k ? `M460,-10 C400,140 430,320 380,580 L470,580 L470,-10 Z` : `M0,-10 C60,140 30,320 80,580 L-10,580 L-10,-10 Z`}
						fill="#fbf6ea"
						opacity={0.75}
					/>
				))}
				<rect x={-40} y={560} width={540} height={28} fill="#8a6a46" />
				<g transform="translate(330,560)">
					<path d="M-20,0 L20,0 L16,-40 L-16,-40 Z" fill="#b5553a" />
					<path d="M0,-40 C-30,-90 -10,-120 0,-130 C10,-120 30,-90 0,-40 Z" fill="#5a8a4a" />
				</g>
			</g>
			{/* shelf with jars and a coffee grinder */}
			<g transform="translate(760,300)">
				<rect x={0} y={0} width={520} height={18} fill="#7a5636" />
				{[0, 1, 2, 3].map((i) => (
					<g key={i} transform={`translate(${40 + i * 110},0)`}>
						<rect x={-26} y={-90 + (i % 2) * 14} width={52} height={90 - (i % 2) * 14} rx={8} fill={['#e8dcc0', '#c9d6d9', '#e8dcc0', '#d9c9a8'][i]} />
						<rect x={-28} y={-100 + (i % 2) * 14} width={56} height={14} rx={4} fill="#8a6a46" />
					</g>
				))}
				<g transform="translate(470,0)">
					<rect x={-30} y={-70} width={60} height={70} fill="#6a4a2e" />
					<path d="M-26,-70 L26,-70 L18,-100 L-18,-100 Z" fill="url(#brass)" />
					<path d="M0,-100 L0,-120 L36,-128" stroke="#3a2a1a" strokeWidth={5} fill="none" />
				</g>
			</g>
			{/* cast-iron range and kettle */}
			<g transform="translate(1500,860)">
				<rect x={-180} y={-330} width={360} height={330} rx={10} fill="#2a2a2c" />
				<rect x={-200} y={-350} width={400} height={30} rx={6} fill="#3a3a3e" />
				<rect x={-130} y={-260} width={110} height={90} rx={6} fill="#1a1a1c" />
				<rect x={-122} y={-252} width={94} height={74} fill="#e2662a" opacity={0.35} />
				<rect x={20} y={-260} width={110} height={90} rx={6} fill="#1a1a1c" />
				<rect x={-80} y={-560} width={60} height={210} fill="#2a2a2c" />
				<g transform="translate(60,-350)">
					<path d="M-70,0 C-80,-70 80,-70 70,0 Z" fill="#5a5a5e" />
					<path d="M60,-30 C100,-40 110,-70 120,-80" stroke="#5a5a5e" strokeWidth={10} fill="none" />
					<path d="M-40,-60 C-30,-100 30,-100 40,-60" stroke="#2a2a2c" strokeWidth={6} fill="none" />
					<g transform="translate(120,-82)">
						<Steam t={t} seed="kettle" height={260} width={30} opacity={0.45} />
					</g>
				</g>
			</g>
		</Layer>
		{/* the sunbeam with dust */}
		<Layer cam={cam} depth={0.7}>
			<polygon points="200,90 640,90 1300,1000 380,1000" fill="url(#beam-sun)" opacity={0.85 * sun} />
			{Array.from({length: 40}, (_, i) => {
				const u = random(`kd${i}`);
				const x = 300 + u * 700 + Math.sin(t / 50 + i) * 20;
				const y = ((random(`ky${i}`) * 900 - t * (0.15 + 0.2 * u)) % 900 + 900) % 900 + 100;
				return <circle key={i} cx={x + (y - 100) * 0.55} cy={y} r={1.4 + u * 2} fill="#fff6dc" opacity={0.5 * sun * (0.4 + 0.6 * Math.sin(t / 13 + i) ** 2)} />;
			})}
		</Layer>
		<Layer cam={cam} depth={0.9}>
			{/* the table */}
			<rect x={-400} y={840} width={2720} height={50} fill="#b48a5a" />
			<rect x={-400} y={888} width={2720} height={400} fill="#8a6440" />
			{Array.from({length: 10}, (_, i) => (
				<line key={i} x1={-400} y1={895 + i * 40} x2={2320} y2={900 + i * 40} stroke="#6e4c30" strokeWidth={2} opacity={0.5} />
			))}
			{table}
		</Layer>
		<Layer cam={cam} depth={1}>{children}</Layer>
	</g>
);
