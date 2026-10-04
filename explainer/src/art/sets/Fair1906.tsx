import React, {useMemo} from 'react';
import {random} from 'remotion';
import {Figure, POSES, walkPose} from '../Figure';
import {CAST} from '../cast';
import {Bale, Lantern} from '../Ox';
import {P} from '../palette';
import {CAM0, Layer, type Cam} from './Airfield';

/**
 * Plymouth, autumn 1906: the West of England Fat Stock show at blue hour.
 * Sky (cool) → Devon hills with Smeaton's Tower on the Hoe → marquees glowing from
 * inside, bunting → hurdle pens, bales and a far crowd → the trampled show ground
 * (hero plane, `children`) under one big hurricane lantern (the warm key) →
 * foreground rope and posts (`front`, e.g. backs of the crowd).
 * Every zoomable layer carries its own ground so a push-in never opens a seam.
 */

const BUNTING = ['#d9cfb2', '#5a6f8a', '#b88a3a', '#6a7a5a', '#8a7a9a'];

const Bunting: React.FC<{x1: number; y1: number; x2: number; y2: number; sag?: number; f: number; seed: string}> = ({x1, y1, x2, y2, sag = 60, f, seed}) => {
	const n = Math.max(4, Math.round(Math.hypot(x2 - x1, y2 - y1) / 46));
	const pt = (t: number) => [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t + sag * 4 * t * (1 - t)] as const;
	return (
		<g>
			<path d={`M${x1},${y1} Q${(x1 + x2) / 2},${(y1 + y2) / 2 + sag * 2} ${x2},${y2}`} stroke="#2a2622" strokeWidth={1.5} fill="none" />
			{Array.from({length: n - 1}, (_, i) => {
				const t = (i + 0.5) / n;
				const [x, y] = pt(t);
				const sway = 6 * Math.sin(f / 14 + i * 0.9 + random(seed + i) * 6);
				return <path key={i} d={`M${x - 13},${y} L${x + 13},${y} L${x + sway * 0.4},${y + 30} Z`} fill={BUNTING[(i + Math.floor(random(seed) * 5)) % BUNTING.length]} opacity={0.85} />;
			})}
		</g>
	);
};

/** A marquee: lit canvas, darker stripes, a scalloped valance, an open door with the warm inside. */
const Marquee: React.FC<{x: number; y: number; w: number; h: number; f: number; door?: boolean; seed: string}> = ({x, y, w, h, f, door = true, seed}) => {
	const roof = h * 0.42;
	const fl = 0.94 + 0.04 * Math.sin(f / 5 + x);
	return (
		<g transform={`translate(${x},${y})`}>
			<ellipse cx={0} cy={0} rx={w * 0.9} ry={h * 0.5} fill="url(#lantern-glow)" opacity={0.35 * fl} />
			{/* walls */}
			<rect x={-w / 2} y={-h + roof} width={w} height={h - roof} fill="url(#canvas-lit)" opacity={fl} />
			{Array.from({length: Math.floor(w / 44)}, (_, i) => (
				<rect key={i} x={-w / 2 + i * 44 + 22} y={-h + roof} width={22} height={h - roof} fill="#7a5a3a" opacity={0.18} />
			))}
			{/* roof */}
			<path d={`M${-w / 2 - 14},${-h + roof} L${-w / 4},${-h} L${w / 4},${-h} L${w / 2 + 14},${-h + roof} Z`} fill="#e8cf98" opacity={0.92 * fl} />
			<path d={`M${-w / 4},${-h} L${-w / 4},${-h - 30} M${w / 4},${-h} L${w / 4},${-h - 30}`} stroke="#3a2a1e" strokeWidth={4} />
			<path d={`M${-w / 4},${-h - 30} l26,8 l-26,8 Z M${w / 4},${-h - 30} l26,8 l-26,8 Z`} fill={BUNTING[Math.floor(random(seed) * 5)]} />
			{/* scalloped valance */}
			{Array.from({length: Math.floor((w + 28) / 36)}, (_, i) => (
				<path key={i} d={`M${-w / 2 - 14 + i * 36},${-h + roof} a18,14 0 0,0 36,0 Z`} fill={i % 2 ? '#3f5a4a' : '#efe0bc'} />
			))}
			{door ? (
				<g>
					<path d={`M-44,0 L-44,${-h + roof + 22} L44,${-h + roof + 22} L44,0 Z`} fill="#ffcf86" opacity={0.95 * fl} />
					{/* silhouettes inside */}
					{[-20, 14].map((dx, i) => (
						<g key={i} transform={`translate(${dx},0) scale(0.22)`}>
							<Figure look={i ? CAST.gent : CAST.farmwife} pose={POSES.stand} silhouette="#5a3a22" shadow={false} rim="none" flip={i === 1} />
						</g>
					))}
					<path d={`M-44,${-h + roof + 22} C-30,${-h * 0.4} -40,-20 -60,0 L-44,0 Z M44,${-h + roof + 22} C30,${-h * 0.4} 40,-20 60,0 L44,0 Z`} fill="#c99a5a" />
				</g>
			) : null}
			{/* base shadow */}
			<rect x={-w / 2 - 20} y={-4} width={w + 40} height={10} fill="#000" opacity={0.25} />
		</g>
	);
};

const Hurdle: React.FC<{x: number; y: number; n?: number}> = ({x, y, n = 4}) => (
	<g transform={`translate(${x},${y})`} stroke="#4a3626" strokeLinecap="round">
		{Array.from({length: n + 1}, (_, i) => (
			<line key={i} x1={i * 60} y1={0} x2={i * 60} y2={-74} strokeWidth={7} />
		))}
		{[-20, -44, -66].map((yy) => (
			<line key={yy} x1={-6} y1={yy} x2={n * 60 + 6} y2={yy} strokeWidth={5} />
		))}
		<line x1={0} y1={-66} x2={60} y2={-20} strokeWidth={4} />
	</g>
);

export const Fair1906: React.FC<{
	frame: number;
	cam?: Cam;
	children?: React.ReactNode;
	/** foreground layer: backs of the crowd, rope */
	front?: React.ReactNode;
	/** the key lantern's brightness */
	lamp?: number;
	/** far crowd milling */
	crowd?: boolean;
}> = ({frame: f, cam = CAM0, children, front, lamp = 1, crowd = true}) => {
	const stars = useMemo(() => Array.from({length: 90}, (_, i) => ({x: random(`fs${i}`) * 2700 - 390, y: random(`fy${i}`) * 380 - 120, r: 0.6 + random(`fr${i}`) * 1.3})), []);
	return (
		<g>
			{/* sky: blue hour, the last warmth on the horizon */}
			<Layer cam={cam} depth={0}>
				<rect x={-400} y={-500} width={2720} height={1400} fill="url(#sky-dusk)" />
				{stars.map((s, i) => (
					<circle key={i} cx={s.x} cy={s.y} r={s.r} fill={P.moon} opacity={0.25 + 0.35 * Math.abs(Math.sin(f / 40 + i))} />
				))}
				<g transform="translate(1600,150)">
					<circle r={120} fill="url(#glow-moon)" opacity={0.7} />
					<path d="M0,-26 A26,26 0 1,1 -18,19 A20,20 0 1,0 0,-26 Z" fill={P.moon} opacity={0.9} />
				</g>
			</Layer>
			{/* far: Devon hills, the Hoe with Smeaton's Tower, a church tower */}
			<Layer cam={cam} depth={0.12}>
				<path d="M-400,560 C-200,500 40,520 260,500 C480,480 640,530 900,512 C1160,494 1300,520 1560,500 C1800,482 2000,520 2320,506 L2320,900 L-400,900 Z" fill="#2a3048" />
				<g transform="translate(330,506)">
					<path d="M-9,0 L-7,-56 L7,-56 L9,0 Z" fill="#3a3a52" />
					{[-12, -26, -40].map((y) => (
						<rect key={y} x={-8} y={y} width={16} height={7} fill="#6a5866" />
					))}
					<rect x={-6} y={-66} width={12} height={10} fill="#ffe2a0" opacity={0.85} />
					<circle cy={-61} r={22} fill="url(#lantern-glow)" opacity={0.6} />
					<path d="M-8,-66 L0,-76 L8,-66 Z" fill="#3a3a52" />
				</g>
				<g transform="translate(1420,500)">
					<rect x={-14} y={-70} width={28} height={70} fill="#262b42" />
					<path d="M-14,-70 L-14,-80 L-8,-80 L-8,-74 L-3,-74 L-3,-80 L3,-80 L3,-74 L8,-74 L8,-80 L14,-80 L14,-70 Z" fill="#262b42" />
				</g>
				<rect x={-400} y={540} width={2720} height={60} fill="url(#fog)" />
			</Layer>
			{/* mid: the marquees and bunting */}
			<Layer cam={cam} depth={0.45}>
				<rect x={-400} y={600} width={2720} height={700} fill="#262634" />
				<Marquee x={200} y={640} w={460} h={230} f={f} seed="m1" />
				<Marquee x={760} y={630} w={300} h={170} f={f} door={false} seed="m2" />
				<Marquee x={1640} y={644} w={540} h={250} f={f} seed="m3" />
				<Bunting x1={-200} y1={420} x2={430} y2={400} f={f} seed="b1" />
				<Bunting x1={430} y1={400} x2={1100} y2={420} sag={70} f={f} seed="b2" />
				<Bunting x1={1100} y1={420} x2={1900} y2={390} sag={80} f={f} seed="b3" />
				{[430, 1100].map((x) => (
					<line key={x} x1={x} y1={380} x2={x} y2={640} stroke="#2a2420" strokeWidth={6} />
				))}
				<rect x={-400} y={620} width={2720} height={60} fill="url(#fog)" opacity={0.6} />
			</Layer>
			{/* near-mid: pens, bales, the far crowd, lanterns on posts */}
			<Layer cam={cam} depth={0.72}>
				<rect x={-400} y={690} width={2720} height={700} fill="#2e2b2c" />
				<Hurdle x={-120} y={740} n={5} />
				<Hurdle x={1460} y={742} n={6} />
				<g transform="translate(470,744)">
					<Bale />
				</g>
				<g transform="translate(600,744)">
					<Bale w={130} />
				</g>
				<g transform="translate(540,672)">
					<Bale w={120} />
				</g>
				{crowd
					? [
							[260, 'drover', 0],
							[330, 'farmwife', 1],
							[860, 'gent', 0],
							[1010, 'clerk06', 1],
							[1080, 'shopgirl', 0],
							[1330, 'lad', 1],
							[1400, 'drover', 0],
						].map(([x, who, flip], i) => {
							const walkX = i === 3 ? ((f * 0.9) % 400) - 200 : 0;
							return (
								<g key={i} transform={`translate(${(x as number) + walkX},752) scale(0.5)`}>
									<Figure look={CAST[who as string]} pose={i === 3 ? walkPose(f * 0.22, 0.7) : POSES.stand} flip={flip === 1} silhouette="#1c1f2c" rim="none" shadow={false} />
								</g>
							);
						})
					: null}
				{[
					[120, 470],
					[1760, 480],
				].map(([x, y], i) => (
					<g key={i}>
						<line x1={x} y1={y} x2={x} y2={760} stroke="#241e1a" strokeWidth={8} />
						<line x1={x} y1={y} x2={x + 40} y2={y} stroke="#241e1a" strokeWidth={6} />
						<g transform={`translate(${x + 36},${y})`}>
							<Lantern f={f} seed={i * 3} glow={0.8} />
						</g>
					</g>
				))}
			</Layer>
			{/* hero: the show ground under the key lantern */}
			<Layer cam={cam} depth={1}>
				<rect x={-400} y={760} width={2720} height={700} fill="#352d26" />
				<ellipse cx={1000} cy={900} rx={900} ry={170} fill="#8a6a40" opacity={0.42 * lamp} />
				<ellipse cx={1000} cy={900} rx={520} ry={100} fill="#c9985a" opacity={0.28 * lamp} />
				{Array.from({length: 70}, (_, i) => {
					const x = random(`st${i}`) * 2400 - 240;
					const y = 790 + random(`sy${i}`) * 300;
					const a = random(`sa${i}`) * 60 - 30;
					return <line key={i} x1={x} y1={y} x2={x + 16 * Math.cos((a * Math.PI) / 180)} y2={y + 16 * Math.sin((a * Math.PI) / 180)} stroke="#c9a95e" strokeWidth={2} opacity={0.35} />;
				})}
				{/* the key: a big lantern on a gallows post over the ring */}
				<g>
					<line x1={1420} y1={180} x2={1420} y2={880} stroke="#211b17" strokeWidth={12} />
					<line x1={1420} y1={190} x2={1250} y2={190} stroke="#211b17" strokeWidth={9} />
					<line x1={1380} y1={190} x2={1420} y2={240} stroke="#211b17" strokeWidth={6} />
					<g transform="translate(1256,190) scale(1.5)">
						<Lantern f={f} seed={7} on={lamp} glow={1.6} />
					</g>
				</g>
				{children}
			</Layer>
			{/* foreground */}
			<Layer cam={cam} depth={1.4}>
				{front}
			</Layer>
		</g>
	);
};
