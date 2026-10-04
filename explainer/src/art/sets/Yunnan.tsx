import React, {useMemo} from 'react';
import {random} from 'remotion';
import {noise2D} from '@remotion/noise';
import {CAM0, Layer, type Cam} from './Airfield';

const ridge = (seed: string, base: number, amp: number, step = 24, f = 1) => {
	let d = `M-600,${base + 400} `;
	for (let x = -600; x <= 2600; x += step) d += `L${x},${base - amp * (0.5 + 0.5 * noise2D(seed, (x / 700) * f, 0)) - 0.3 * amp * noise2D(seed + 'b', (x / 160) * f, 1)} `;
	return d + `L2600,${base + 400} Z`;
};

/**
 * Pu'er, Yunnan, at dawn: ridges fading into blue haze, mist lying in the
 * valleys, terraced rows of coffee bushes on the near slope. `season` puts white
 * blossom (spring) or red cherries (picking season, Nov–Mar) on the bushes.
 * `t` drives mist and sun (rewindable).
 */
export const Yunnan: React.FC<{t: number; cam?: Cam; season?: 'bloom' | 'harvest'; children?: React.ReactNode; front?: React.ReactNode; sunUp?: number}> = ({
	t,
	cam = CAM0,
	season = 'harvest',
	children,
	front,
	sunUp = 1,
}) => {
	const r1 = useMemo(() => ridge('yr1', 470, 160, 30, 0.8), []);
	const r2 = useMemo(() => ridge('yr2', 560, 170, 26, 1), []);
	const r3 = useMemo(() => ridge('yr3', 660, 150, 22, 1.3), []);
	const bushes = useMemo(
		() =>
			Array.from({length: 7}, (_, row) =>
				Array.from({length: 22 + row * 3}, (_, i) => ({
					x: -300 + i * (130 - row * 9) + (row % 2) * 60 + random(`yb${row}${i}`) * 30,
					y: 1040 - row * 42,
					s: 1 - row * 0.12,
					row,
				})),
			).flat(),
		[],
	);
	const sunY = 520 - 140 * sunUp;
	const accent = season === 'bloom' ? '#fbf7ee' : '#c0302a';
	return (
		<g>
			<Layer cam={cam} depth={0.05}>
				<rect x={-400} y={-200} width={2720} height={1500} fill="url(#sky-dawn)" />
				<circle cx={1240} cy={sunY} r={420} fill="url(#glow-sun)" />
				<circle cx={1240} cy={sunY} r={56} fill="#fff4d6" />
			</Layer>
			<Layer cam={cam} depth={0.15}>
				<path d={r1} fill="#7a7a9e" opacity={0.75} />
				<rect x={-600} y={420 + 10 * Math.sin(t / 90)} width={3200} height={150} fill="url(#mist)" transform={`translate(${(t * 0.3) % 400 - 200},0)`} />
			</Layer>
			<Layer cam={cam} depth={0.3}>
				<path d={r2} fill="#5a6a7e" opacity={0.9} />
				<rect x={-600} y={540 + 8 * Math.sin(t / 70)} width={3200} height={130} fill="url(#mist)" transform={`translate(${-((t * 0.5) % 400)},0)`} />
			</Layer>
			<Layer cam={cam} depth={0.5}>
				<path d={r3} fill="#3e5a46" />
				{/* terraces cut into the slope */}
				{Array.from({length: 8}, (_, i) => (
					<path key={i} d={`M-600,${700 + i * 40} C200,${680 + i * 40} 900,${720 + i * 38} 2600,${690 + i * 42}`} stroke="#2e4636" strokeWidth={3} fill="none" opacity={0.6} />
				))}
			</Layer>
			<Layer cam={cam} depth={0.75}>
				<rect x={-600} y={760} width={3200} height={700} fill="#2f4a36" />
				{bushes
					.slice()
					.reverse()
					.map((b, i) => (
						<g key={i} transform={`translate(${b.x},${b.y - 30}) scale(${b.s})`}>
							<ellipse cx={0} cy={0} rx={70} ry={52} fill={b.row % 2 ? '#2a4a30' : '#30553a'} />
							<ellipse cx={-18} cy={-18} rx={36} ry={22} fill="#3f6a48" />
							{Array.from({length: 8}, (_, k) => (
								<circle key={k} cx={-50 + random(`ybk${i}${k}`) * 100} cy={-30 + random(`ybj${i}${k}`) * 50} r={season === 'bloom' ? 5 : 4.5} fill={accent} opacity={0.9} />
							))}
						</g>
					))}
			</Layer>
			<Layer cam={cam} depth={1}>{children}</Layer>
			<Layer cam={cam} depth={1.3}>{front}</Layer>
		</g>
	);
};
