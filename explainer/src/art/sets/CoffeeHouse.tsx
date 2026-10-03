import React from 'react';
import {random} from 'remotion';
import {noise2D} from '@remotion/noise';
import {CAM0, Layer, type Cam} from './Airfield';

/**
 * A coffeehouse by candlelight. `kind: 'london'` is the 1650s–1700s penny
 * university: a long communal table, a price board ("COFFEE · 1d"), notices and
 * news pinned up, pipe smoke. `kind: 'leipzig'` is Zimmermann's, 1730s: the
 * Collegium Musicum's corner with a harpsichord and a music stand.
 * `t` drives smoke and flames (rewindable).
 */
export const CoffeeHouse: React.FC<{t: number; kind?: 'london' | 'leipzig'; cam?: Cam; children?: React.ReactNode; back?: React.ReactNode; table?: React.ReactNode}> = ({
	t,
	kind = 'london',
	cam = CAM0,
	children,
	back,
	table,
}) => {
	const flame = (i: number) => 1 + 0.08 * noise2D('fl', i, t / 8);
	return (
		<g>
			<Layer cam={cam} depth={0.45}>
				{/* panelled walls */}
				<rect x={-400} y={-200} width={2720} height={1500} fill="#3a2618" />
				{Array.from({length: 16}, (_, i) => (
					<g key={i}>
						<rect x={-380 + i * 180} y={120} width={150} height={300} fill="none" stroke="#2a1a10" strokeWidth={6} />
						<rect x={-380 + i * 180} y={470} width={150} height={260} fill="none" stroke="#2a1a10" strokeWidth={6} />
					</g>
				))}
				<rect x={-400} y={440} width={2720} height={14} fill="#5a3a22" />
				{/* small-paned window: grey London daylight / Leipzig dusk */}
				<g transform="translate(1320,140)">
					<rect width={360} height={420} fill={kind === 'london' ? '#9aa6b0' : '#4a5a7a'} />
					{Array.from({length: 4}, (_, i) => (
						<line key={`v${i}`} x1={i * 90} y1={0} x2={i * 90} y2={420} stroke="#2a1a10" strokeWidth={6} />
					))}
					{Array.from({length: 5}, (_, i) => (
						<line key={`h${i}`} x1={0} y1={i * 84} x2={360} y2={i * 84} stroke="#2a1a10" strokeWidth={6} />
					))}
					<rect width={360} height={420} fill="none" stroke="#2a1a10" strokeWidth={18} />
				</g>
				{kind === 'london' ? (
					<g>
						{/* price board and pinned notices */}
						<g transform="translate(260,170) rotate(-1.5)">
							<rect width={300} height={170} fill="#1d140d" stroke="#8a6a3a" strokeWidth={6} />
							<text x={150} y={72} textAnchor="middle" style={{fontFamily: 'serif', fontWeight: 700, fontSize: 40, fill: '#e9d9b0', letterSpacing: '0.08em'}}>
								COFFEE
							</text>
							<text x={150} y={136} textAnchor="middle" style={{fontFamily: 'serif', fontStyle: 'italic', fontSize: 48, fill: '#e9c46a'}}>
								1d
							</text>
						</g>
						{[
							[640, 190, -4],
							[760, 230, 3],
							[880, 180, -2],
						].map(([x, y, r], i) => (
							<g key={i} transform={`translate(${x},${y}) rotate(${r})`}>
								<rect width={100} height={130} fill="#e6dac0" />
								{Array.from({length: 6}, (_, k) => (
									<rect key={k} x={12} y={20 + k * 16} width={76 - (k % 3) * 14} height={5} fill="#5a4a32" opacity={0.6} />
								))}
							</g>
						))}
					</g>
				) : (
					<g>
						{/* harpsichord and music stand in the corner */}
						<g transform="translate(330,700)">
							<path d="M0,0 L520,0 L520,-40 C420,-60 300,-130 120,-140 L0,-140 Z" fill="#5a2a1a" />
							<rect x={0} y={-40} width={160} height={40} fill="#2a140c" />
							{Array.from({length: 18}, (_, i) => (
								<rect key={i} x={6 + i * 8.5} y={-36} width={6} height={22} fill={i % 3 === 1 ? '#1a1a1a' : '#efe6d0'} />
							))}
							{[30, 250, 480].map((x) => (
								<rect key={x} x={x} y={0} width={14} height={120} fill="#3a1a10" />
							))}
						</g>
						<g transform="translate(980,700)">
							<line x1={0} y1={0} x2={0} y2={-220} stroke="#2a1a10" strokeWidth={6} />
							<rect x={-60} y={-300} width={120} height={84} fill="#e9dcc0" transform="rotate(-8,0,-260)" />
						</g>
					</g>
				)}
				{back}
			</Layer>
			{/* candles and their light */}
			<Layer cam={cam} depth={0.7}>
				{[
					[420, 520],
					[1060, 480],
					[1600, 540],
				].map(([x, y], i) => (
					<g key={i} transform={`translate(${x},${y})`}>
						<circle r={320 * flame(i)} fill="url(#glow-lamp)" opacity={0.5} />
						<rect x={-10} y={0} width={20} height={60} fill="#efe6d0" />
						<path d={`M0,-2 C-8,-14 -4,-30 0,${-38 * flame(i)} C4,-30 8,-14 0,-2 Z`} fill="#ffd27a" />
						<rect x={-26} y={58} width={52} height={10} rx={4} fill="url(#brass)" />
					</g>
				))}
				{/* pipe smoke drifting under the ceiling */}
				{Array.from({length: 10}, (_, i) => {
					const u = ((t / 260 + i / 10) % 1 + 1) % 1;
					return <circle key={i} cx={-200 + u * 2400} cy={150 + 60 * Math.sin(i * 1.7)} r={90 + 50 * random(`cs${i}`)} fill="#c9b9a0" opacity={0.08} filter="url(#blur-md)" />;
				})}
			</Layer>
			<Layer cam={cam} depth={1}>{children}</Layer>
			<Layer cam={cam} depth={1.1}>
				{/* the long table */}
				<rect x={-400} y={860} width={2720} height={40} fill="#6a4426" />
				<rect x={-400} y={898} width={2720} height={400} fill="#3a2414" />
				{table}
			</Layer>
		</g>
	);
};
