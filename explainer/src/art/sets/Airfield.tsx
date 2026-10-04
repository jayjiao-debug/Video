import React, {useMemo} from 'react';
import {random} from 'remotion';
import {noise2D} from '@remotion/noise';
import {B17Side} from '../B17';
import {P} from '../palette';

export type Cam = {x: number; y: number; zoom: number};
export const CAM0: Cam = {x: 0, y: 0, zoom: 1};

/** Camera that frames the hero-layer point (tx, ty) at screen centre with the given zoom. */
export const lookAt = (tx: number, ty: number, zoom: number, cx = 960, cy = 540): Cam => ({x: (tx - cx) * zoom, y: (ty - cy) * zoom, zoom});

/** Parallax layer: depth 0 = infinitely far (static), 1 = the hero plane, >1 = foreground. */
export const Layer: React.FC<{cam: Cam; depth: number; children: React.ReactNode; cx?: number; cy?: number; filter?: string; opacity?: number}> = ({
	cam,
	depth,
	children,
	cx = 960,
	cy = 540,
	filter,
	opacity,
}) => {
	const z = 1 + (cam.zoom - 1) * depth;
	return (
		<g filter={filter} opacity={opacity} transform={`translate(${cx - (cam.x * depth * z) / cam.zoom},${cy - (cam.y * depth * z) / cam.zoom}) scale(${z}) translate(${-cx},${-cy})`}>
			{children}
		</g>
	);
};

/** WWII English bomber field at dusk: sky, treeline, watch office, Nissen huts, runway lights, fog. */
export const Airfield: React.FC<{frame: number; cam?: Cam; children?: React.ReactNode; beams?: number; dusk?: boolean}> = ({
	frame: f,
	cam = CAM0,
	children,
	beams = 1,
	dusk = true,
}) => {
	const stars = useMemo(
		() => Array.from({length: 140}, (_, i) => ({x: random(`as${i}`) * 2600 - 340, y: random(`ay${i}`) * 520, r: 0.6 + random(`ar${i}`) * 1.6})),
		[],
	);
	const tree = useMemo(() => {
		let d = 'M-400,760 ';
		for (let x = -400; x <= 2400; x += 18) {
			const h = 40 + 28 * noise2D('tree', x / 140, 0) + 14 * noise2D('tree2', x / 40, 1);
			d += `L${x},${700 - h} `;
		}
		return d + 'L2400,760 Z';
	}, []);
	const vp = {x: 1010, y: 742};
	return (
		<g>
			{/* sky */}
			<Layer cam={cam} depth={0.02}>
				<rect x={-400} y={-200} width={2720} height={1300} fill={dusk ? 'url(#sky-dusk)' : 'url(#sky-night)'} />
				{stars.map((s, i) => (
					<circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={(0.25 + 0.5 * random(`at${i}`)) * (0.75 + 0.25 * Math.sin(f / 17 + i))} />
				))}
				<circle cx={1520} cy={190} r={150} fill="url(#glow-moon)" />
				<circle cx={1520} cy={190} r={34} fill={P.moon} />
				<circle cx={1508} cy={182} r={8} fill="#c9d3e3" opacity={0.6} />
				{[0, 1, 2].map((i) => (
					<ellipse
						key={i}
						cx={((300 + i * 700 + f * (0.3 + i * 0.1)) % 2600) - 300}
						cy={300 + i * 90}
						rx={420}
						ry={22}
						fill={P.night4}
						opacity={0.35}
						filter="url(#blur-md)"
					/>
				))}
			</Layer>
			{/* searchlights */}
			{beams > 0 ? (
				<Layer cam={cam} depth={0.1}>
					{[
						[260, 0.35],
						[1700, -0.4],
					].map(([x, k], i) => {
						const a = Math.sin(f / (70 + i * 20) + i * 2) * 0.35 + k;
						const tipX = x + Math.sin(a) * -900;
						return <polygon key={i} points={`${x - 14},740 ${x + 14},740 ${tipX + 90},-100 ${tipX - 90},-100`} fill="url(#beam-cool)" opacity={0.7 * beams} />;
					})}
				</Layer>
			) : null}
			{/* far treeline, church spire, distant hangars */}
			<Layer cam={cam} depth={0.15}>
				<path d={tree} fill={P.night3} />
				<path d="M1720,690 L1736,600 L1752,690 Z M1724,700 L1748,700 L1748,640 L1724,640 Z" fill={P.night3} />
				<path d="M180,712 C180,670 320,670 320,712 Z M330,714 C330,676 450,676 450,714 Z" fill="#202a42" />
				<rect x={-400} y={700} width={2800} height={80} fill="url(#fog)" />
			</Layer>
			{/* mid: watch office, Nissen huts, parked bombers */}
			<Layer cam={cam} depth={0.4}>
				<rect x={-600} y={742} width={3200} height={400} fill="#161b28" />
				<g transform="translate(1260,744)">
					<rect x={0} y={-150} width={260} height={150} fill="#232838" />
					<rect x={30} y={-210} width={190} height={62} fill="#262c3d" />
					<rect x={-8} y={-152} width={276} height={6} fill="#30374a" />
					<rect x={22} y={-214} width={206} height={5} fill="#30374a" />
					{Array.from({length: 14}, (_, i) => (
						<line key={i} x1={-6 + i * 20} y1={-152} x2={-6 + i * 20} y2={-170} stroke="#3a4157" strokeWidth={2} />
					))}
					<line x1={-8} y1={-170} x2={268} y2={-170} stroke="#3a4157" strokeWidth={2} />
					{[0, 1, 2, 3].map((i) => (
						<g key={i}>
							<rect x={44 + i * 44} y={-196} width={30} height={30} fill={P.lamp} opacity={0.85 - (i === 2 ? 0.6 : 0) + 0.1 * Math.sin(f / 9 + i)} />
							<rect x={24 + i * 58} y={-110} width={34} height={40} fill={P.lamp} opacity={i === 1 ? 0.2 : 0.75} />
						</g>
					))}
					<circle cx={130} cy={-140} r={220} fill="url(#glow-lamp)" opacity={0.28} />
					<line x1={300} y1={0} x2={300} y2={-160} stroke="#3a4157" strokeWidth={4} />
					<path d={`M300,-160 L${370 + 6 * Math.sin(f / 11)},${-150 + 4 * Math.sin(f / 7)} L300,-138 Z`} fill="#c9773f" opacity={0.9} />
				</g>
				{[
					[140, 1],
					[460, 0],
				].map(([x, lit], i) => (
					<g key={i} transform={`translate(${x},746)`}>
						<path d="M0,0 C0,-110 260,-110 260,0 Z" fill="#1f2536" />
						{[50, 100, 150, 200].map((rx) => (
							<path key={rx} d={`M${rx},0 C${rx},-60 ${rx + 4},-80 ${rx + 4},-90`} stroke="#2a3146" strokeWidth={2} fill="none" />
						))}
						{lit ? (
							<>
								<rect x={100} y={-56} width={60} height={56} fill={P.lamp} opacity={0.85} />
								<circle cx={130} cy={-28} r={140} fill="url(#glow-lamp)" opacity={0.35} />
								<rect x={112} y={-40} width={10} height={40} fill="#1f2536" />
							</>
						) : null}
					</g>
				))}
				<g transform="translate(860,728) scale(0.22)" opacity={0.75}>
					<B17Side prop={0} />
				</g>
				<g transform="translate(1100,722) scale(0.16) scale(-1,1)" opacity={0.6}>
					<B17Side prop={0} />
				</g>
			</Layer>
			{/* tarmac + runway lights converging on the vanishing point */}
			<Layer cam={cam} depth={0.7}>
				<polygon points={`-600,760 2600,760 2600,1400 -600,1400`} fill="#161b28" />
				<polygon points={`${vp.x - 40},760 ${vp.x + 40},760 2200,1200 -200,1200`} fill="#1d2232" />
				{Array.from({length: 12}, (_, i) => {
					const t = Math.pow(i / 11, 1.8);
					const y = 762 + t * 440;
					const xl = vp.x - 40 + (-200 - (vp.x - 40)) * t;
					const xr = vp.x + 40 + (2200 - (vp.x + 40)) * t;
					const r = 1.5 + t * 7;
					const on = 0.6 + 0.4 * Math.sin(f / 6 - i * 0.7);
					return (
						<g key={i}>
							{[xl, xr].map((x, k) => (
								<g key={k}>
									<circle cx={x} cy={y} r={r * 6} fill="url(#glow-lamp)" opacity={0.5 * on} />
									<circle cx={x} cy={y} r={r} fill={P.candle} opacity={on} />
								</g>
							))}
							<rect x={vp.x - 3 - t * 30} y={y} width={6 + t * 60} height={2 + t * 10} fill="#d9d4c6" opacity={0.15} />
						</g>
					);
				})}
			</Layer>
			{/* hero layer, graded into the night */}
			<Layer cam={cam} depth={1} filter="url(#grade-night)">
				{children}
			</Layer>
			{/* foreground: fog and silhouettes */}
			<Layer cam={cam} depth={1.5}>
				<rect x={-600} y={820} width={3200} height={400} fill="url(#fog)" opacity={0.8} />
				{/* oil drums and a tool cart, rim-lit by the runway */}
				{[
					[-60, 950, 1],
					[40, 975, 0.9],
				].map(([x, y, s], i) => (
					<g key={i} transform={`translate(${x},${y}) scale(${s})`}>
						<rect x={-48} y={0} width={96} height={150} fill="#0a0d15" />
						<ellipse cx={0} cy={0} rx={48} ry={13} fill="#151a26" />
						{[40, 100].map((ry) => (
							<rect key={ry} x={-48} y={ry} width={96} height={5} fill="#141a28" />
						))}
						<line x1={46} y1={4} x2={46} y2={150} stroke={P.lamp} strokeOpacity={0.35} strokeWidth={3} />
					</g>
				))}
				<g transform="translate(1790,1000)" fill="#080b12">
					<rect x={-70} y={0} width={150} height={60} rx={6} />
					<circle cx={-40} cy={70} r={18} />
					<circle cx={50} cy={70} r={18} />
					<line x1={80} y1={10} x2={140} y2={-40} stroke="#080b12" strokeWidth={8} />
				</g>
			</Layer>
		</g>
	);
};
