import React, {useMemo} from 'react';
import {random} from 'remotion';
import {noise2D} from '@remotion/noise';
import {CAM0, Layer, type Cam} from './Airfield';

/**
 * 3 p.m., the street under an office tower: glass curtain walls catching the
 * afternoon sky, a small coffee shop with an awning and a warm window, plane
 * trees throwing leaf shadows that move in the breeze, a wide pavement.
 * `t` drives the breeze (rewindable).
 */
export const CafeStreet: React.FC<{t: number; cam?: Cam; children?: React.ReactNode; passers?: React.ReactNode}> = ({t, cam = CAM0, children, passers}) => {
	const towers = useMemo(() => Array.from({length: 7}, (_, i) => ({x: -300 + i * 420, w: 300 + random(`ct${i}`) * 120, h: 700 + random(`ch${i}`) * 300})), []);
	return (
		<g>
			<Layer cam={cam} depth={0.1}>
				<rect x={-400} y={-200} width={2720} height={1500} fill="url(#sky-afternoon)" />
				<circle cx={300} cy={120} r={300} fill="url(#glow-sun)" opacity={0.6} />
			</Layer>
			<Layer cam={cam} depth={0.3}>
				{towers.map((tw, i) => (
					<g key={i}>
						<rect x={tw.x} y={720 - tw.h} width={tw.w} height={tw.h + 400} fill={i % 2 ? '#8ea4b8' : '#a7b8c6'} />
						{Array.from({length: Math.floor(tw.h / 60)}, (_, k) => (
							<rect key={k} x={tw.x} y={740 - tw.h + k * 60} width={tw.w} height={3} fill="#6f8496" opacity={0.6} />
						))}
						{Array.from({length: Math.floor(tw.w / 70)}, (_, k) => (
							<rect key={`v${k}`} x={tw.x + k * 70} y={720 - tw.h} width={3} height={tw.h + 400} fill="#6f8496" opacity={0.4} />
						))}
						<rect x={tw.x} y={720 - tw.h} width={tw.w * 0.4} height={tw.h + 400} fill="#fff" opacity={0.12} />
					</g>
				))}
			</Layer>
			<Layer cam={cam} depth={0.6}>
				{/* ground floor: the coffee shop */}
				<rect x={-400} y={430} width={2720} height={420} fill="#d9cfbf" />
				<g transform="translate(980,430)">
					<rect x={0} y={60} width={760} height={360} fill="#2b231d" />
					<rect x={30} y={100} width={460} height={300} fill="#f2c98a" opacity={0.85} />
					<rect x={30} y={100} width={460} height={300} fill="url(#glow-lamp)" opacity={0.6} />
					{/* inside: counter and a hanging lamp */}
					<rect x={60} y={300} width={400} height={100} fill="#6a4a30" />
					<line x1={260} y1={100} x2={260} y2={170} stroke="#2a1a10" strokeWidth={3} />
					<path d="M230,170 L290,170 L274,150 L246,150 Z" fill="#2a1a10" />
					<rect x={520} y={110} width={200} height={310} fill="#3a2a20" />
					<circle cx={690} cy={270} r={8} fill="url(#brass)" />
					{/* striped awning */}
					<path d="M-20,60 L780,60 L800,0 L-40,0 Z" fill="#2f5a46" />
					{Array.from({length: 14}, (_, i) => (
						<path key={i} d={`M${-40 + i * 60},0 L${-10 + i * 60},0 L${8 + i * 57},60 L${-22 + i * 57},60 Z`} fill="#e9e2d2" />
					))}
					<text x={380} y={-24} textAnchor="middle" style={{fontFamily: 'serif', fontWeight: 700, fontSize: 40, letterSpacing: '0.3em', fill: '#2f5a46'}}>
						COFFEE
					</text>
				</g>
				{/* pavement */}
				<rect x={-400} y={850} width={2720} height={450} fill="#b9b0a2" />
				{Array.from({length: 30}, (_, i) => (
					<line key={i} x1={-400 + i * 100} y1={850} x2={-600 + i * 120} y2={1300} stroke="#a39a8c" strokeWidth={2} />
				))}
			</Layer>
			{/* leaf shadows dappling the pavement, moving with the breeze */}
			<Layer cam={cam} depth={0.8}>
				{Array.from({length: 26}, (_, i) => {
					const x = random(`ls${i}`) * 2200 - 200 + noise2D('br', i, t / 70) * 18;
					const y = 870 + random(`ly${i}`) * 260;
					return <ellipse key={i} cx={x} cy={y} rx={40 + random(`lr${i}`) * 60} ry={14 + random(`lq${i}`) * 16} fill="#2a2620" opacity={0.18} filter="url(#blur-sm)" />;
				})}
				{passers}
			</Layer>
			<Layer cam={cam} depth={1}>{children}</Layer>
			{/* a plane tree in the foreground */}
			<Layer cam={cam} depth={1.35}>
				<path d="M120,1300 C130,1000 110,700 150,420" stroke="#5a4a3a" strokeWidth={46} fill="none" />
				{Array.from({length: 40}, (_, i) => {
					const a = random(`tl${i}`) * Math.PI * 2;
					const r = 80 + random(`tr${i}`) * 260;
					const x = 150 + Math.cos(a) * r * 1.4 + noise2D('tb', i, t / 50) * 10;
					const y = 300 + Math.sin(a) * r * 0.7;
					return <ellipse key={i} cx={x} cy={y} rx={70} ry={46} fill={i % 3 ? '#4a6a3a' : '#5f8448'} opacity={0.95} />;
				})}
			</Layer>
		</g>
	);
};
