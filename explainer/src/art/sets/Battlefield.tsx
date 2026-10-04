import React, {useMemo} from 'react';
import {random} from 'remotion';
import {noise2D} from '@remotion/noise';
import {Smoke} from '../fx';
import {P} from '../palette';
import {Panzer} from '../Tank';
import {CAM0, Layer, type Cam} from './Airfield';

/** Night battlefield after the fighting: moonlit dunes, distant burning wrecks, smoke, debris. */
export const Battlefield: React.FC<{frame: number; cam?: Cam; children?: React.ReactNode; fires?: number}> = ({frame: f, cam = CAM0, children, fires = 1}) => {
	const stars = useMemo(() => Array.from({length: 120}, (_, i) => ({x: random(`bs${i}`) * 2600 - 340, y: random(`by${i}`) * 480, r: 0.6 + random(`br${i}`) * 1.4})), []);
	const ridge = (seed: string, base: number, amp: number, step = 24) => {
		let d = `M-500,${base + 300} `;
		for (let x = -500; x <= 2500; x += step) d += `L${x},${base - amp * (0.5 + 0.5 * noise2D(seed, x / 420, 0))} `;
		return d + `L2500,${base + 300} Z`;
	};
	return (
		<g>
			<Layer cam={cam} depth={0.02}>
				<rect x={-400} y={-200} width={2720} height={1300} fill="url(#sky-night)" />
				{stars.map((s, i) => (
					<circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={0.2 + 0.4 * random(`bt${i}`)} />
				))}
				<circle cx={420} cy={170} r={160} fill="url(#glow-moon)" />
				<circle cx={420} cy={170} r={30} fill={P.moon} />
				<rect x={-400} y={520} width={2720} height={260} fill={P.dusk} opacity={0.18} filter="url(#blur-lg)" />
			</Layer>
			<Layer cam={cam} depth={0.12}>
				<path d={ridge('r1', 690, 70)} fill="#1b2236" />
			</Layer>
			<Layer cam={cam} depth={0.3}>
				<path d={ridge('r2', 730, 50, 30)} fill="#202638" />
				{/* distant wrecks still burning */}
				{[
					[300, 724, 0.18],
					[1450, 732, 0.22],
				].map(([x, y, s], i) => (
					<g key={i}>
						<g transform={`translate(${x},${y}) scale(${s})`} opacity={0.9}>
							<Panzer wreck />
						</g>
						{fires > 0 ? (
							<g transform={`translate(${x + 10},${y - 40})`}>
								<circle r={70} fill="url(#glow-fire)" opacity={0.5 + 0.2 * Math.sin(f / 4 + i)} />
								<Smoke frame={f + i * 40} seed={`ds${i}`} height={420} wind={0.8} tone="#262832" />
							</g>
						) : null}
					</g>
				))}
			</Layer>
			<Layer cam={cam} depth={0.6}>
				<path d={ridge('r3', 800, 40, 36)} fill="#262b3a" />
				<rect x={-600} y={790} width={3200} height={600} fill="#262b3a" />
				{/* tank tracks in the sand */}
				{[0, 1].map((k) => (
					<path key={k} d={`M-200,${880 + k * 34} C400,${850 + k * 30} 1100,${900 + k * 30} 2200,${860 + k * 34}`} stroke="#1d2130" strokeWidth={18} fill="none" strokeDasharray="6 8" opacity={0.7} />
				))}
				<rect x={-600} y={780} width={3200} height={120} fill="url(#fog)" opacity={0.6} />
			</Layer>
			<Layer cam={cam} depth={1} filter="url(#grade-night)">
				{children}
			</Layer>
			<Layer cam={cam} depth={1.45}>
				{/* barbed-wire pickets and debris, rim-lit by the moon */}
				{[-80, 160, 1720, 1960].map((x, i) => (
					<g key={x} transform={`translate(${x},${1010 + (i % 2) * 20}) rotate(${(i % 2 ? 6 : -8)})`}>
						<rect x={-6} y={-150} width={12} height={170} fill="#07090f" />
						<line x1={-6} y1={-150} x2={-6} y2={20} stroke={P.moon} strokeOpacity={0.25} strokeWidth={2} />
					</g>
				))}
				<path d="M-80,880 C0,900 80,870 160,890 M1720,870 C1800,890 1880,860 1960,880" stroke="#07090f" strokeWidth={3} fill="none" strokeDasharray="3 6" />
				<path d="M-300,1100 C200,1040 600,1080 900,1060 C1300,1040 1800,1090 2300,1050 L2300,1300 L-300,1300 Z" fill="#090b12" />
			</Layer>
		</g>
	);
};
