import React, {useMemo} from 'react';
import {random} from 'remotion';
import {noise2D} from '@remotion/noise';
import {CAM0, Layer, type Cam} from './Airfield';

/**
 * A metro car at 8 a.m.: the line runs above ground here, so low sun and the
 * city slide past the windows; light bars sweep the car each time a pillar
 * passes; hand straps sway with the motion. `travel` is how far the train has
 * gone (px), so a rewind can run it backwards.
 */
export const Metro: React.FC<{frame: number; travel: number; cam?: Cam; children?: React.ReactNode; crowd?: React.ReactNode; sun?: number}> = ({
	frame: f,
	travel,
	cam = CAM0,
	children,
	crowd,
	sun = 1,
}) => {
	const towers = useMemo(
		() => Array.from({length: 40}, (_, i) => ({x: i * 150 + random(`mt${i}`) * 60, w: 70 + random(`mw${i}`) * 90, h: 180 + random(`mh${i}`) * 300})),
		[],
	);
	const near = useMemo(() => Array.from({length: 30}, (_, i) => ({x: i * 260 + random(`mn${i}`) * 80, w: 120 + random(`mnw${i}`) * 140, h: 260 + random(`mnh${i}`) * 260})), []);
	const windows = [180, 620, 1060, 1500];
	const sway = Math.sin(f / 23) * 4 + noise2D('sway', f / 40, 0) * 3;
	// a pillar passes every 900px of travel and throws a dark bar through the car
	const pillar = ((travel % 900) + 900) % 900;
	return (
		<g>
			{/* outside: sky, sun, far city and near blocks moving at different speeds */}
			<Layer cam={cam} depth={0.12}>
				<rect x={-400} y={-200} width={2720} height={1400} fill="url(#sky-morning)" />
				<circle cx={1450} cy={420} r={380} fill="url(#glow-sun)" opacity={0.9 * sun} />
				<circle cx={1450} cy={420} r={60} fill="#fff6dc" opacity={sun} />
				<g transform={`translate(${-((travel * 0.15) % 6000)},0)`}>
					{[0, 6000].map((o) =>
						towers.map((t, i) => <rect key={`${o}${i}`} x={o + t.x} y={700 - t.h} width={t.w} height={t.h + 200} fill="#9aa6b8" opacity={0.55} />),
					)}
				</g>
				<g transform={`translate(${-((travel * 0.45) % 7800)},0)`}>
					{[0, 7800].map((o) =>
						near.map((t, i) => (
							<g key={`${o}${i}`}>
								<rect x={o + t.x} y={760 - t.h} width={t.w} height={t.h + 300} fill="#6e7a8e" />
								{Array.from({length: 8}, (_, k) => (
									<rect key={k} x={o + t.x + 14 + (k % 2) * (t.w / 2 - 8)} y={780 - t.h + Math.floor(k / 2) * 46} width={t.w / 2 - 28} height={22} fill="#f6e2b8" opacity={0.25} />
								))}
							</g>
						)),
					)}
				</g>
			</Layer>
			{/* the car: wall between windows, seats, ceiling */}
			<Layer cam={cam} depth={0.55}>
				<path
					d={`M-400,-200 L2320,-200 L2320,1300 L-400,1300 Z ${windows.map((x) => `M${x},250 L${x + 360},250 L${x + 360},560 L${x},560 Z`).join(' ')}`}
					fill="#cfd5d8"
					fillRule="evenodd"
				/>
				{windows.map((x) => (
					<g key={x}>
						<rect x={x} y={250} width={360} height={310} fill="none" stroke="#7d868d" strokeWidth={14} rx={18} />
						<rect x={x + 20} y={262} width={140} height={60} fill="#fff" opacity={0.08} transform={`skewX(-20)`} />
					</g>
				))}
				<rect x={-400} y={120} width={2720} height={50} fill="#b9c1c6" />
				<rect x={-400} y={196} width={2720} height={40} fill="#e2a33a" />
				<text x={300} y={224} style={{fontFamily: 'sans-serif', fontSize: 24, fontWeight: 700, fill: '#2a2a2a', letterSpacing: '0.2em'}}>
					下一站 · NEXT STATION
				</text>
				{/* bench seats */}
				<rect x={-400} y={640} width={2720} height={70} rx={20} fill="#3f5f86" />
				<rect x={-400} y={700} width={2720} height={160} fill="#2f4766" />
				<rect x={-400} y={860} width={2720} height={500} fill="#8f9396" />
				{/* sun patches from the windows sliding across the floor and seats */}
				<g opacity={0.5 * sun}>
					{windows.map((x) => (
						<polygon key={x} points={`${x + 60},560 ${x + 420},560 ${x + 560},1000 ${x + 200},1000`} fill="url(#beam-sun)" />
					))}
				</g>
				{/* a passing pillar darkens the car for a beat */}
				<rect x={2200 - pillar * 3} y={-200} width={260} height={1500} fill="#20242c" opacity={0.22 * sun} filter="url(#blur-lg)" transform="skewX(-14)" />
			</Layer>
			{/* other riders, a little softer */}
			<Layer cam={cam} depth={0.75}>{crowd}</Layer>
			<Layer cam={cam} depth={0.8}>
				{/* overhead rail and swaying straps */}
				<rect x={-400} y={80} width={2720} height={14} rx={7} fill="#c2c8cc" />
				{Array.from({length: 16}, (_, i) => {
					const x = -200 + i * 150;
					const a = sway * (0.8 + 0.4 * random(`sp${i}`));
					return (
						<g key={i} transform={`translate(${x},94) rotate(${a})`}>
							<rect x={-5} y={0} width={10} height={44} fill="#e6e9ea" />
							<path d="M-22,50 C-22,84 22,84 22,50 C22,38 -22,38 -22,50 Z" fill="none" stroke="#e8c84a" strokeWidth={9} />
						</g>
					);
				})}
			</Layer>
			<Layer cam={cam} depth={1}>{children}</Layer>
			{/* foreground pole */}
			<Layer cam={cam} depth={1.5}>
				<rect x={1700} y={-200} width={34} height={1500} fill="#d6dadc" />
				<rect x={1706} y={-200} width={8} height={1500} fill="#fff" opacity={0.5} />
			</Layer>
		</g>
	);
};
