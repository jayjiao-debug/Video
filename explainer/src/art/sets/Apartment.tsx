import React, {useMemo} from 'react';
import {interpolateColors, random} from 'remotion';
import {CAM0, Layer, type Cam} from './Airfield';

/**
 * A small rented room in a Chinese city, 2026, 1 a.m. (《越难越爱》).
 * Back wall (dusty lilac paint, a string of fairy lights and photos, a shelf) and the
 * window (the city still awake, the moon) → the bed on the hero plane, a nightstand
 * with a warm bedside lamp (the key), a flat-pack storage box she built herself →
 * foreground: the duvet's edge and a plant, soft.
 *
 * `dawn` 0..1 turns the window from night to sunrise and the room's fill from cool
 * to rose; `lamp` dims the bedside lamp; `phone` is the extra cool fill from a screen.
 * The bed's mattress top is BED_TOP; a person sitting on its edge is placed with seatY().
 */

export const BED = {x0: 220, x1: 1160, top: 742};
export const FLOOR_Y = 930;
/** y for a rig figure (scale s) sitting on the bed edge with POSES.sit-like lift −66 */
export const seatY = (s: number) => BED.top + 216 * s;
export const NIGHTSTAND = {x: 120, top: 760};
export const BOX_AT = {x: 1470, y: FLOOR_Y};

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** the storage box she assembled (IKEA-style), front view with a fabric drawer; origin at the floor, centre */
export const StorageBox: React.FC<{w?: number; h?: number; built?: number}> = ({w = 260, h = 230}) => (
	<g>
		<ellipse cx={0} cy={4} rx={w * 0.6} ry={10} fill="#000" opacity={0.35} />
		<rect x={-w / 2} y={-h} width={w} height={h} rx={4} fill="#e8dfcf" />
		<rect x={-w / 2} y={-h} width={w} height={h} rx={4} fill="url(#apt-shade-r)" />
		<rect x={-w / 2 + 14} y={-h + 14} width={w - 28} height={h - 28} rx={3} fill="#3a3f52" />
		<rect x={-w / 2 + 22} y={-h + 22} width={w - 44} height={h - 44} rx={3} fill="#5a6278" />
		<rect x={-26} y={-h / 2 - 8} width={52} height={14} rx={7} fill="#2a2e3c" />
		{/* a little cam-lock screw head at each corner: built by hand */}
		{[-1, 1].map((sx) => [-1, 1].map((sy) => <circle key={`${sx}${sy}`} cx={sx * (w / 2 - 7)} cy={-h / 2 + sy * (h / 2 - 7)} r={2.6} fill="#9a9080" />))}
	</g>
);

/** the bedside lamp: ceramic base, fabric shade; on 0..1. Origin at its base. */
export const BedsideLamp: React.FC<{on?: number}> = ({on = 1}) => (
	<g>
		<circle cy={-150} r={560} fill="url(#lantern-glow)" opacity={0.55 * on} />
		<ellipse cx={0} cy={0} rx={30} ry={6} fill="#2a2026" />
		<path d="M-22,0 C-34,-40 -30,-80 -8,-96 L8,-96 C30,-80 34,-40 22,0 Z" fill="#c9b8a4" />
		<path d="M-22,0 C-34,-40 -30,-80 -8,-96 L-2,-96 C-16,-80 -20,-40 -12,0 Z" fill="#a8927e" opacity={0.6} />
		<rect x={-3} y={-128} width={6} height={34} fill="#6a5a4a" />
		<path d="M-58,-128 L58,-128 L40,-196 L-40,-196 Z" fill={interpolateColors(on, [0, 1], ['#4a4048', '#ffe2b0'])} />
		<path d="M-58,-128 L58,-128 L54,-136 L-54,-136 Z" fill="#fff4dc" opacity={0.7 * on} />
		<ellipse cx={0} cy={-128} rx={58} ry={9} fill="#fff6e0" opacity={0.85 * on} />
	</g>
);

const CityWindow: React.FC<{f: number; dawn: number; w: number; h: number}> = ({f, dawn, w, h}) => {
	const towers = useMemo(
		() =>
			Array.from({length: 11}, (_, i) => {
				const tw = 40 + random(`tw${i}`) * 50;
				const th = 120 + random(`th${i}`) * 230;
				return {x: i * (w / 10) - 20 + random(`tx${i}`) * 20, w: tw, h: th};
			}),
		[w],
	);
	return (
		<g>
			<rect width={w} height={h} fill="url(#apt-sky)" />
			<rect width={w} height={h} fill="url(#apt-dawn)" opacity={dawn} />
			{/* the moon, gone at dawn; the sun's glow low on the right */}
			<g opacity={1 - dawn}>
				<circle cx={w * 0.72} cy={h * 0.2} r={22} fill="#eef2fb" />
				<circle cx={w * 0.72} cy={h * 0.2} r={80} fill="url(#glow-moon)" opacity={0.6} />
			</g>
			<circle cx={w * 0.8} cy={h * 0.86} r={260} fill="#ffb37a" opacity={0.45 * dawn} filter="url(#blur-lg)" />
			{/* far towers with lit windows */}
			{towers.map((t, i) => (
				<g key={i}>
					<rect x={t.x} y={h - t.h} width={t.w} height={t.h} fill={interpolateColors(dawn, [0, 1], ['#151a2c', '#5a3a4a'])} />
					{Array.from({length: Math.floor(t.h / 22)}, (_, r) =>
						Array.from({length: Math.floor(t.w / 14)}, (_, c) => {
							const on = random(`win${i}-${r}-${c}`) > 0.72;
							const flick = random(`wf${i}-${r}-${c}`) > 0.97 ? 0.5 + 0.5 * Math.sin(f / 9 + i) : 1;
							return on ? <rect key={`${r}-${c}`} x={t.x + 5 + c * 14} y={h - t.h + 10 + r * 22} width={6} height={8} fill="#ffcf8a" opacity={0.75 * flick * (1 - 0.8 * dawn)} /> : null;
						}),
					)}
				</g>
			))}
			{/* a near rooftop, darker */}
			<path d={`M0,${h - 70} L${w * 0.3},${h - 70} L${w * 0.3},${h - 110} L${w * 0.45},${h - 110} L${w * 0.45},${h - 60} L${w},${h - 60} L${w},${h} L0,${h} Z`} fill={interpolateColors(dawn, [0, 1], ['#0c0f1c', '#3a2430'])} />
		</g>
	);
};

const FairyLights: React.FC<{f: number; x0: number; x1: number; y: number; on: number}> = ({f, x0, x1, y, on}) => {
	const n = 16;
	return (
		<g>
			<path d={`M${x0},${y} Q${(x0 + x1) / 2},${y + 70} ${x1},${y}`} fill="none" stroke="#3a3440" strokeWidth={2} />
			{Array.from({length: n}, (_, i) => {
				const t = (i + 0.5) / n;
				const x = mix(x0, x1, t);
				const yy = y + 4 * 70 * t * (1 - t) * 0.5 * 2;
				const tw = 0.75 + 0.25 * Math.sin(f / 13 + i * 1.7);
				return (
					<g key={i}>
						<circle cx={x} cy={yy + 8} r={14} fill="url(#lantern-glow)" opacity={0.7 * on * tw} />
						<circle cx={x} cy={yy + 8} r={3.6} fill="#ffe7b0" opacity={0.4 + 0.6 * on * tw} />
					</g>
				);
			})}
			{/* polaroids pegged on the string */}
			{[0.22, 0.47, 0.71].map((t, i) => {
				const x = mix(x0, x1, t);
				const yy = y + 4 * 70 * t * (1 - t);
				return (
					<g key={i} transform={`translate(${x},${yy + 6}) rotate(${(i - 1) * 6})`}>
						<rect x={-26} y={0} width={52} height={60} fill="#efe8dc" />
						<rect x={-21} y={5} width={42} height={40} fill={['#5a6a8a', '#8a6a5a', '#6a7a6a'][i]} />
						<circle cx={-6} cy={22} r={7} fill="#e8c8a8" opacity={0.7} />
					</g>
				);
			})}
		</g>
	);
};

export const Apartment: React.FC<{
	frame: number;
	cam?: Cam;
	/** 0 night → 1 sunrise */
	dawn?: number;
	/** the bedside lamp */
	lamp?: number;
	/** cool fill from a phone screen, at (phone.x, phone.y) on the hero plane */
	phone?: {x: number; y: number; o: number};
	/** on the bed (hero plane): people sitting on it */
	bed?: React.ReactNode;
	/** on the hero plane in front of the bed (floor props) */
	children?: React.ReactNode;
	front?: React.ReactNode;
	/** show the storage box by the window (hide it for the IKEA scene that builds it) */
	box?: boolean;
}> = ({frame: f, cam = CAM0, dawn = 0, lamp = 1, phone, bed, children, front, box = true}) => {
	const wall = interpolateColors(dawn, [0, 1], ['#24222f', '#4a3a44']);
	const wallLow = interpolateColors(dawn, [0, 1], ['#1a1822', '#352a32']);
	return (
		<g>
			<defs>
				<linearGradient id="apt-sky" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#0a1024" />
					<stop offset="0.7" stopColor="#1e2848" />
					<stop offset="1" stopColor="#3a3456" />
				</linearGradient>
				<linearGradient id="apt-dawn" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#3a3a6a" />
					<stop offset="0.55" stopColor="#d47a6a" />
					<stop offset="1" stopColor="#ffc08a" />
				</linearGradient>
				<linearGradient id="apt-shade-r" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stopColor="#fff" stopOpacity="0.12" />
					<stop offset="1" stopColor="#000" stopOpacity="0.35" />
				</linearGradient>
				<linearGradient id="duvet" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#7a86a8" />
					<stop offset="1" stopColor="#3e4664" />
				</linearGradient>
				<radialGradient id="phone-glow">
					<stop offset="0" stopColor="#c8d2ff" stopOpacity="0.8" />
					<stop offset="0.4" stopColor="#8a9aff" stopOpacity="0.25" />
					<stop offset="1" stopColor="#8a9aff" stopOpacity="0" />
				</radialGradient>
				<linearGradient id="window-beam" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={dawn > 0.5 ? '#ffc08a' : '#9cc0ee'} stopOpacity="0.5" />
					<stop offset="1" stopColor={dawn > 0.5 ? '#ffc08a' : '#9cc0ee'} stopOpacity="0" />
				</linearGradient>
			</defs>
			{/* ------------------------------------------------ back wall */}
			<Layer cam={cam} depth={0.6}>
				<rect x={-800} y={-600} width={3520} height={2200} fill={wall} />
				<rect x={-800} y={700} width={3520} height={900} fill={wallLow} />
				<rect x={-800} y={884} width={3520} height={14} fill="#15131a" />
				{/* the window, curtains half drawn */}
				<g transform="translate(1180,150)">
					<CityWindow f={f} dawn={dawn} w={520} h={520} />
					<rect x={256} y={0} width={10} height={520} fill="#e6dfd2" />
					<rect x={0} y={250} width={520} height={8} fill="#e6dfd2" />
					<rect x={-14} y={-14} width={548} height={548} fill="none" stroke="#e6dfd2" strokeWidth={22} />
					<rect x={-30} y={530} width={580} height={18} fill="#d8d0c2" />
					{/* curtains: linen with folds */}
					<path d="M-90,-50 C-40,130 -70,330 -20,600 L-150,600 L-150,-50 Z" fill="#c8b8a0" />
					<path d="M-110,-50 C-80,140 -100,330 -80,600" fill="none" stroke="#a8967c" strokeWidth={6} opacity={0.6} />
					<path d="M610,-50 C560,140 590,340 540,600 L670,600 L670,-50 Z" fill="#c8b8a0" />
					<path d="M630,-50 C600,140 620,340 600,600" fill="none" stroke="#a8967c" strokeWidth={6} opacity={0.6} />
					<rect x={-170} y={-62} width={860} height={10} rx={5} fill="#5a4a3a" />
				</g>
				{/* light from the window falling across the wall and floor */}
				<path d="M1180,150 L1700,150 L1900,1400 L1000,1400 Z" fill="url(#window-beam)" opacity={0.18 + 0.3 * dawn} filter="url(#blur-md)" />
				{/* fairy lights and photos over the bed */}
				<FairyLights f={f} x0={260} x1={1020} y={250} on={lamp} />
				{/* a shelf: books, a small plant, a candle */}
				<g transform="translate(300,520)">
					<rect x={0} y={0} width={340} height={10} fill="#4a3a30" />
					{[0, 1, 2, 3, 4, 5].map((i) => (
						<rect key={i} x={10 + i * 22} y={-70 + (i % 3) * 6} width={18} height={70 - (i % 3) * 6} fill={['#6a4a5a', '#3a4a6a', '#8a7a5a', '#4a5a4a', '#7a5040', '#5a5a7a'][i]} />
					))}
					<path d="M220,0 C214,-20 230,-40 222,-60 M232,0 C240,-24 226,-44 244,-62 M244,0 C256,-18 250,-36 264,-48" stroke="#4a6a4a" strokeWidth={6} fill="none" strokeLinecap="round" />
					<rect x={212} y={-14} width={44} height={14} rx={3} fill="#c87a5a" />
					<rect x={300} y={-26} width={16} height={26} fill="#efe6d6" />
				</g>
			</Layer>
			{/* ------------------------------------------------ mid: the box by the window, the nightstand */}
			<Layer cam={cam} depth={0.85}>
				<rect x={-800} y={FLOOR_Y} width={3520} height={700} fill={interpolateColors(dawn, [0, 1], ['#2a2026', '#4a3530'])} />
				{Array.from({length: 18}, (_, i) => (
					<line key={i} x1={-800 + i * 220} y1={FLOOR_Y} x2={-800 + i * 220 - 120} y2={FLOOR_Y + 700} stroke="#1a1418" strokeWidth={2} opacity={0.5} />
				))}
				{box ? (
					<g transform={`translate(${BOX_AT.x},${BOX_AT.y})`}>
						<StorageBox />
					</g>
				) : null}
			</Layer>
			{/* ------------------------------------------------ hero: bed, nightstand + lamp */}
			<Layer cam={cam} depth={1}>
				{/* lamp pool on the wall and bed */}
				<ellipse cx={NIGHTSTAND.x + 40} cy={NIGHTSTAND.top - 200} rx={620} ry={420} fill="#ffcf8a" opacity={0.12 * lamp} filter="url(#blur-md)" />
				{/* headboard */}
				<rect x={BED.x0 - 40} y={BED.top - 230} width={60} height={330} rx={14} fill="#4a3a36" />
				<rect x={BED.x0 - 40} y={BED.top - 230} width={60} height={330} rx={14} fill="url(#apt-shade-r)" />
				{/* mattress + duvet */}
				<rect x={BED.x0} y={BED.top} width={BED.x1 - BED.x0} height={150} rx={18} fill="#d8d0c4" />
				<path d={`M${BED.x0 + 10},${BED.top - 6} C${BED.x0 + 200},${BED.top - 40} ${BED.x0 + 420},${BED.top + 10} ${BED.x0 + 620},${BED.top - 24} C${BED.x0 + 760},${BED.top - 44} ${BED.x1 - 40},${BED.top - 10} ${BED.x1},${BED.top + 20} L${BED.x1 + 10},${BED.top + 140} L${BED.x0 + 10},${BED.top + 140} Z`} fill="url(#duvet)" />
				<path d={`M${BED.x0 + 160},${BED.top + 20} C${BED.x0 + 240},${BED.top + 60} ${BED.x0 + 300},${BED.top + 120} ${BED.x0 + 320},${BED.top + 140} M${BED.x0 + 560},${BED.top + 10} C${BED.x0 + 600},${BED.top + 70} ${BED.x0 + 640},${BED.top + 110} ${BED.x0 + 700},${BED.top + 140}`} stroke="#2e3450" strokeWidth={4} fill="none" opacity={0.6} />
				{/* pillows */}
				<path d={`M${BED.x0 + 6},${BED.top - 20} C${BED.x0 + 0},${BED.top - 70} ${BED.x0 + 30},${BED.top - 96} ${BED.x0 + 90},${BED.top - 90} C${BED.x0 + 170},${BED.top - 84} ${BED.x0 + 200},${BED.top - 50} ${BED.x0 + 180},${BED.top - 16} Z`} fill="#ece6dc" />
				<path d={`M${BED.x0 + 120},${BED.top - 14} C${BED.x0 + 110},${BED.top - 56} ${BED.x0 + 140},${BED.top - 78} ${BED.x0 + 200},${BED.top - 72} C${BED.x0 + 260},${BED.top - 66} ${BED.x0 + 290},${BED.top - 40} ${BED.x0 + 270},${BED.top - 10} Z`} fill="#c8bcb0" />
				<rect x={BED.x0} y={BED.top + 140} width={BED.x1 - BED.x0} height={FLOOR_Y - BED.top - 140} fill="#2a2228" />
				{/* nightstand + lamp */}
				<g transform={`translate(${NIGHTSTAND.x},${NIGHTSTAND.top})`}>
					<rect x={-70} y={0} width={140} height={FLOOR_Y - NIGHTSTAND.top} fill="#5a4436" />
					<rect x={-70} y={0} width={140} height={10} fill="#7a5c46" />
					<rect x={-58} y={40} width={116} height={60} rx={3} fill="none" stroke="#3a2a20" strokeWidth={3} />
					<circle cx={0} cy={70} r={4} fill="#c9a95e" />
					<g transform="translate(-18,0)">
						<BedsideLamp on={lamp} />
					</g>
					<rect x={22} y={-8} width={34} height={8} rx={2} fill="#2a2e3c" />
				</g>
				{bed}
				{phone && phone.o > 0 ? <circle cx={phone.x} cy={phone.y} r={420} fill="url(#phone-glow)" opacity={phone.o} /> : null}
				{children}
			</Layer>
			<Layer cam={cam} depth={1.4}>
				{front}
			</Layer>
		</g>
	);
};
