import React, {useMemo} from 'react';
import {noise2D} from '@remotion/noise';
import {P} from '../palette';
import {CAM0, Layer, type Cam} from './Airfield';

/**
 * 1943, the Economic Warfare Division's office in London at night: blackout
 * curtains open on a skyline with St Paul's dome, searchlights and barrage
 * balloons; a green banker's lamp is the warm key; a wall map with pins and
 * string; filing cabinets, paper stacks, a typewriter, cigarette smoke.
 */
export const LondonOffice: React.FC<{
	frame: number;
	cam?: Cam;
	children?: React.ReactNode;
	/** people standing or sitting behind the desk (drawn between the wall and the desk) */
	staff?: React.ReactNode;
	lamp?: number;
	pins?: number;
}> = ({frame: f, cam = CAM0, children, staff, lamp = 1, pins = 1}) => {
	const sky = useMemo(() => {
		let d = 'M0,420 ';
		for (let x = 0; x <= 520; x += 14) d += `L${x},${330 - 40 * (0.5 + 0.5 * noise2D('lon', x / 60, 0)) - (x > 210 && x < 300 ? 20 : 0)} `;
		return d + 'L520,420 Z';
	}, []);
	return (
		<g>
			<Layer cam={cam} depth={0.5}>
				{/* back wall + wainscot */}
				<rect x={-300} y={-200} width={2520} height={1500} fill="#1b2026" />
				<rect x={-300} y={640} width={2520} height={700} fill="#211a16" />
				<rect x={-300} y={632} width={2520} height={10} fill="#2f251e" />
				{Array.from({length: 18}, (_, i) => (
					<rect key={i} x={-280 + i * 150} y={660} width={120} height={300} fill="none" stroke="#2c231c" strokeWidth={3} />
				))}
				{/* window onto the Blitz-era skyline */}
				<g transform="translate(1300,120)">
					<rect x={0} y={0} width={520} height={420} fill="url(#sky-night)" />
					{[0, 1].map((i) => {
						const a = Math.sin(f / (80 + i * 30) + i * 2) * 0.35 + (i ? -0.25 : 0.2);
						return <polygon key={i} points={`${150 + i * 240},420 ${170 + i * 240},420 ${160 + i * 240 + Math.sin(a) * 600},-200 ${120 + i * 240 + Math.sin(a) * 600},-200`} fill="url(#beam-cool)" opacity={0.7} />;
					})}
					{[
						[90, 120],
						[380, 90],
						[260, 170],
					].map(([x, y], i) => (
						<g key={i} transform={`translate(${x},${y + Math.sin(f / 50 + i) * 4})`}>
							<ellipse rx={22} ry={10} fill="#2b3346" />
							<path d="M-22,0 L-32,-8 L-32,8 Z" fill="#2b3346" />
							<line x1={0} y1={10} x2={0} y2={300} stroke="#2b3346" strokeWidth={0.8} />
						</g>
					))}
					<path d={sky} fill="#0b0f1a" />
					{/* St Paul's dome */}
					<g transform="translate(255,300)" fill="#0b0f1a">
						<path d="M-50,40 L-50,0 C-50,-60 50,-60 50,0 L50,40 Z" />
						<rect x={-8} y={-80} width={16} height={30} />
						<circle cx={0} cy={-86} r={6} />
					</g>
					{/* blackout curtains, mullions */}
					<rect x={255} y={0} width={10} height={420} fill="#141a22" />
					<rect x={0} y={205} width={520} height={10} fill="#141a22" />
					<path d="M-40,-20 L90,-20 C70,120 90,300 60,440 L-40,440 Z" fill="#101318" />
					<path d="M560,-20 L430,-20 C450,120 430,300 460,440 L560,440 Z" fill="#101318" />
				</g>
				{/* wall map of Europe: parchment, grid, pins and string (stylised, not a real map) */}
				<g transform="translate(380,120)">
					<rect x={0} y={0} width={620} height={420} fill="url(#grain-paper)" />
					<rect x={0} y={0} width={620} height={420} fill="#000" opacity={0.35} />
					{Array.from({length: 7}, (_, i) => (
						<line key={`v${i}`} x1={i * 100 + 10} y1={0} x2={i * 100 + 10} y2={420} stroke={P.ink} strokeOpacity={0.15} />
					))}
					{Array.from({length: 5}, (_, i) => (
						<line key={`h${i}`} x1={0} y1={i * 100 + 10} x2={620} y2={i * 100 + 10} stroke={P.ink} strokeOpacity={0.15} />
					))}
					<path d="M80,90 C140,60 220,80 260,130 C310,100 380,110 420,160 C470,150 540,190 560,250 C520,300 470,330 420,340 C360,380 300,360 260,330 C200,350 140,320 120,270 C80,240 60,170 80,90 Z" fill="#7d6d4e" opacity={0.55} />
					<text x={310} y={40} textAnchor="middle" style={{fontFamily: 'serif', fontSize: 22, letterSpacing: '0.4em', fill: P.ink}} opacity={0.6}>
						EUROPA · 1943
					</text>
					{[
						[230, 180],
						[300, 210],
						[360, 160],
						[280, 270],
						[420, 230],
					].map(([x, y], i) => (
						<g key={i} opacity={Math.min(1, Math.max(0, pins * 6 - i))}>
							<circle cx={x} cy={y} r={7} fill={P.red} />
							<circle cx={x - 2} cy={y - 2} r={2.5} fill="#fff" opacity={0.6} />
						</g>
					))}
					<polyline points="230,180 300,210 360,160 420,230 280,270" fill="none" stroke={P.red} strokeWidth={1.5} opacity={0.6 * pins} />
				</g>
				{/* filing cabinets */}
				{[60, 210].map((x) => (
					<g key={x} transform={`translate(${x},420)`}>
						<rect width={130} height={420} fill="#30353b" />
						{[0, 1, 2, 3].map((k) => (
							<g key={k}>
								<rect x={10} y={14 + k * 100} width={110} height={88} fill="#3a4047" />
								<rect x={50} y={50 + k * 100} width={30} height={8} rx={3} fill="#8f9399" />
							</g>
						))}
					</g>
				))}
			</Layer>
			<Layer cam={cam} depth={0.72} filter="url(#grade-night)">
				{staff}
			</Layer>
			<Layer cam={cam} depth={0.8}>
				{/* desk, lamp, paper, typewriter */}
				<rect x={-200} y={820} width={2400} height={60} fill="url(#wood)" />
				<rect x={-200} y={878} width={2400} height={400} fill="#1a120c" />
				<g transform="translate(1080,820)">
					<ellipse cx={0} cy={-40} rx={420} ry={260} fill="url(#glow-lamp)" opacity={0.55 * lamp} />
					<g transform="scale(0.7)">
						<rect x={-8} y={-170} width={16} height={170} fill="url(#brass)" />
						<ellipse cx={0} cy={-2} rx={70} ry={12} fill="url(#brass)" />
						<path d="M-110,-176 C-110,-220 110,-220 110,-176 L96,-160 L-96,-160 Z" fill="#1f5a3e" />
						<path d="M-96,-160 L96,-160" stroke={P.candle} strokeWidth={4} opacity={lamp} />
					</g>
				</g>
				{[0, 1, 2, 3, 4].map((k) => (
					<rect key={k} x={700 + k * 3} y={800 - k * 6} width={200} height={10} fill={k % 2 ? P.paper : P.paperShade} transform={`rotate(${k * 1.5 - 3}, 800, 800)`} />
				))}
				<g transform="translate(1420,820)">
					<rect x={-120} y={-70} width={240} height={70} rx={10} fill="#191b1f" />
					<rect x={-130} y={-96} width={260} height={30} rx={14} fill="#25282d" />
					<rect x={-70} y={-170} width={140} height={90} fill={P.paper} />
					{Array.from({length: 12}, (_, i) => (
						<circle key={i} cx={-100 + (i % 6) * 40} cy={-40 + Math.floor(i / 6) * 22} r={8} fill="#2f3238" />
					))}
				</g>
				<g transform="translate(560,812)">
					<rect x={-26} y={-6} width={52} height={10} rx={4} fill="#3b3d42" />
					{Array.from({length: 7}, (_, i) => {
						const t = ((f / 120 + i / 7) % 1);
						return <circle key={i} cx={noise2D('cig', i, f / 60) * 20 * t} cy={-10 - t * 220} r={6 + t * 30} fill="#c9ced6" opacity={(1 - t) * 0.12} filter="url(#blur-sm)" />;
					})}
				</g>
			</Layer>
			<Layer cam={cam} depth={1}>{children}</Layer>
			<Layer cam={cam} depth={1.6}>
				<rect x={-400} y={980} width={2800} height={300} fill="#0b0806" filter="url(#blur-md)" />
			</Layer>
		</g>
	);
};
