import React, {useMemo} from 'react';
import {random} from 'remotion';
import {TrainerJet} from '../Jet';
import {P} from '../palette';
import {CAM0, Layer, type Cam} from './Airfield';

/**
 * An air force flight school in the Negev, mid-1960s, from dusk into night.
 * Sky (desert afterglow → night) → flat-topped mesas → hangars, control tower, the
 * flight line of parked trainers → the apron → hero plane (`children`) → foreground (`front`).
 * One warm key: the open hangar and the apron floodlight; the cool rim: the sky.
 * `night` 0 = afterglow on the horizon, 1 = full night. The horizon sits at y ≈ 700.
 */

export const AIRBASE_DEFS: React.FC = () => (
	<defs>
		<linearGradient id="ab-sky" x1="0" y1="-300" x2="0" y2="760" gradientUnits="userSpaceOnUse">
			<stop offset="0" stopColor="#0b1222" />
			<stop offset="0.38" stopColor="#1d2a48" />
			<stop offset="0.62" stopColor="#4a4a66" />
			<stop offset="0.8" stopColor="#a7705a" />
			<stop offset="0.9" stopColor="#e09a5e" />
			<stop offset="1" stopColor="#f2bf7a" />
		</linearGradient>
		<linearGradient id="ab-sky-night" x1="0" y1="-300" x2="0" y2="760" gradientUnits="userSpaceOnUse">
			<stop offset="0" stopColor="#060914" />
			<stop offset="0.6" stopColor="#111a30" />
			<stop offset="0.9" stopColor="#24304d" />
			<stop offset="1" stopColor="#3a3a52" />
		</linearGradient>
		<linearGradient id="ab-tarmac" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#3a3640" />
			<stop offset="1" stopColor="#1a1a22" />
		</linearGradient>
		<linearGradient id="ab-sand" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#7a5c48" />
			<stop offset="1" stopColor="#3a2c26" />
		</linearGradient>
		<radialGradient id="ab-flood" cx="50%" cy="0%" r="100%">
			<stop offset="0" stopColor="#ffd59a" stopOpacity="0.55" />
			<stop offset="0.5" stopColor="#ffb54d" stopOpacity="0.12" />
			<stop offset="1" stopColor="#ffb54d" stopOpacity="0" />
		</radialGradient>
		<linearGradient id="ab-hangar-light" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#ffcf8a" stopOpacity="0.9" />
			<stop offset="1" stopColor="#ff9a3d" stopOpacity="0.6" />
		</linearGradient>
	</defs>
);

/** A flat-topped desert ridge line (mesas), deterministic. */
const ridge = (seed: string, y0: number, amp: number) => {
	let d = `M-600,${y0 + 200} L-600,${y0} `;
	let x = -600;
	let i = 0;
	while (x < 2700) {
		const w = 120 + random(`${seed}w${i}`) * 260;
		const h = amp * (0.3 + random(`${seed}h${i}`) * 0.7);
		const flat = random(`${seed}f${i}`) > 0.45;
		if (flat) {
			d += `L${x + w * 0.2},${y0 - h} L${x + w * 0.8},${y0 - h} L${x + w},${y0} `;
		} else {
			d += `Q${x + w * 0.5},${y0 - h * 1.4} ${x + w},${y0} `;
		}
		x += w;
		i++;
	}
	return d + `L2700,${y0 + 200} Z`;
};

/** The arched hangar with its doors open and light spilling out. Origin: centre of the door sill. */
export const Hangar: React.FC<{w?: number; h?: number; lit?: number; f?: number}> = ({w = 520, h = 230, lit = 1, f = 0}) => (
	<g>
		<path d={`M${-w / 2},0 L${-w / 2},${-h * 0.45} Q0,${-h * 1.25} ${w / 2},${-h * 0.45} L${w / 2},0 Z`} fill="#26283a" />
		{Array.from({length: 9}, (_, i) => {
			const x = -w / 2 + ((i + 1) * w) / 10;
			const t = (x / (w / 2)) ** 2;
			return <line key={i} x1={x} y1={-h * 0.62} x2={x} y2={-h * 0.45 - h * 0.4 * (1 - t) + 3} stroke="#30334a" strokeWidth={2} />;
		})}
		{/* the open door: warm interior, a parked jet's silhouette inside */}
		<rect x={-w * 0.36} y={-h * 0.62} width={w * 0.72} height={h * 0.62} fill="url(#ab-hangar-light)" opacity={0.25 + 0.75 * lit} />
		<g transform={`translate(${-w * 0.04},${-h * 0.18}) scale(${w / 1400})`} opacity={0.55}>
			<g style={{filter: 'brightness(0.25)'}}>
				<TrainerJet lod="far" gear />
			</g>
		</g>
		{[0.18, 0.5, 0.82].map((k, i) => (
			<circle key={i} cx={-w * 0.36 + w * 0.72 * k} cy={-h * 0.55} r={6} fill="#fff1cf" opacity={(0.6 + 0.3 * Math.sin(f / 13 + i)) * lit} />
		))}
		{/* door leaves pushed aside */}
		<rect x={-w * 0.5} y={-h * 0.45} width={w * 0.14} height={h * 0.45} fill="#20222f" />
		<rect x={w * 0.36} y={-h * 0.45} width={w * 0.14} height={h * 0.45} fill="#20222f" />
		{/* light spill on the apron */}
		<path d={`M${-w * 0.36},0 L${w * 0.36},0 L${w * 0.7},${h * 0.5} L${-w * 0.7},${h * 0.5} Z`} fill="#ffb54d" opacity={0.12 * lit} />
	</g>
);

/** The control tower: concrete stem, glass cab lit from inside, a beacon. Origin: base centre. */
export const Tower: React.FC<{f?: number; lit?: number}> = ({f = 0, lit = 1}) => (
	<g>
		<rect x={-34} y={-250} width={68} height={250} fill="#2c2e40" />
		<rect x={-34} y={-250} width={12} height={250} fill="#34374c" />
		<rect x={-70} y={-306} width={140} height={58} fill="#30334a" />
		<rect x={-62} y={-298} width={124} height={40} fill={P.lamp} opacity={0.35 + 0.55 * lit} />
		{[-40, -10, 20, 50].map((x) => (
			<rect key={x} x={x - 2} y={-298} width={4} height={40} fill="#30334a" />
		))}
		<rect x={-78} y={-314} width={156} height={10} fill="#3a3d55" />
		<rect x={-80} y={-252} width={160} height={6} fill="#3a3d55" />
		<line x1={0} y1={-314} x2={0} y2={-360} stroke="#3a3d55" strokeWidth={4} />
		<circle cx={0} cy={-362} r={5} fill={P.red} opacity={0.4 + 0.6 * Math.max(0, Math.sin(f / 10))} />
		<circle cx={0} cy={-362} r={22} fill="url(#glow-red)" opacity={0.5 * Math.max(0, Math.sin(f / 10))} />
		<circle cx={0} cy={-280} r={200} fill="url(#glow-lamp)" opacity={0.2 * lit} />
	</g>
);

/** The briefing hut: a prefab barrack with lit windows, a door and a step. Origin: centre of its base. */
export const BriefingHut: React.FC<{lit?: number; door?: number}> = ({lit = 1, door = 1}) => (
	<g>
		<path d="M-260,0 L-260,-150 L0,-196 L260,-150 L260,0 Z" fill="#3a3330" />
		<path d="M-276,-146 L0,-206 L276,-146 L276,-136 L0,-194 L-276,-136 Z" fill="#2a2322" />
		{[-200, -110, 110, 200].map((x) => (
			<g key={x}>
				<rect x={x - 32} y={-118} width={64} height={56} fill="#1e1a1a" />
				<rect x={x - 28} y={-114} width={56} height={48} fill={P.lamp} opacity={0.3 + 0.6 * lit} />
				<line x1={x} y1={-114} x2={x} y2={-66} stroke="#3a3330" strokeWidth={3} />
				<line x1={x - 28} y1={-90} x2={x + 28} y2={-90} stroke="#3a3330" strokeWidth={3} />
			</g>
		))}
		<rect x={-34} y={-130} width={68} height={130} fill="#1e1a1a" />
		<rect x={-30} y={-126} width={60} height={126} fill={P.lamp} opacity={(0.25 + 0.65 * lit) * door} />
		<rect x={-46} y={0} width={92} height={10} fill="#4a4440" />
		<path d="M-30,0 L30,0 L90,90 L-90,90 Z" fill="#ffb54d" opacity={0.12 * lit * door} />
		<circle cx={0} cy={-80} r={240} fill="url(#glow-lamp)" opacity={0.2 * lit} />
		{/* sign over the door */}
		<rect x={-58} y={-158} width={116} height={22} rx={3} fill="#e8e0cc" opacity={0.85} />
		<text x={0} y={-142} textAnchor="middle" style={{fontFamily: 'sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: '0.14em', fill: '#2a2320'}}>
			BRIEFING
		</text>
	</g>
);

export const Airbase1965: React.FC<{
	frame: number;
	cam?: Cam;
	children?: React.ReactNode;
	front?: React.ReactNode;
	/** something flying, drawn in the sky layer (at depth 0.25 so it parallaxes less than the ground) */
	sky?: React.ReactNode;
	night?: number;
	/** the hangar and floodlights */
	lamp?: number;
}> = ({frame: f, cam = CAM0, children, front, sky, night = 0, lamp = 1}) => {
	const stars = useMemo(() => Array.from({length: 110}, (_, i) => ({x: random(`abs${i}`) * 2800 - 440, y: random(`aby${i}`) * 460 - 140, r: 0.6 + random(`abr${i}`) * 1.4})), []);
	const far = useMemo(() => ridge('mesa1', 704, 70), []);
	const far2 = useMemo(() => ridge('mesa2', 712, 40), []);
	const glow = 1 - night;
	return (
		<g>
			<Layer cam={cam} depth={0.02}>
				<rect x={-500} y={-400} width={2920} height={1500} fill="url(#ab-sky)" />
				<rect x={-500} y={-400} width={2920} height={1500} fill="url(#ab-sky-night)" opacity={night} />
				{stars.map((s, i) => (
					<circle key={i} cx={s.x} cy={s.y} r={s.r} fill={P.moon} opacity={(0.1 + 0.6 * night) * (0.5 + 0.5 * Math.abs(Math.sin(f / 40 + i)))} />
				))}
				{/* thin clouds lit from below by the afterglow */}
				{[
					[260, 470, 380, 22],
					[560, 500, 260, 14],
					[1180, 430, 460, 26],
					[1460, 470, 300, 16],
					[1760, 520, 340, 18],
				].map(([x, y, w, h], i) => (
					<g key={i} transform={`translate(${x + f * 0.1 * (1 + i * 0.2)},${y})`} filter="url(#blur-md)">
						<ellipse cx={0} cy={0} rx={w} ry={h} fill={P.night3} opacity={0.5} />
						<ellipse cx={-w * 0.1} cy={h * 0.45} rx={w * 0.8} ry={h * 0.45} fill="#e39a72" opacity={0.45 * glow} />
					</g>
				))}
				{/* crescent moon */}
				<g transform="translate(1540,170)">
					<circle r={110} fill="url(#glow-moon)" opacity={0.45 + 0.4 * night} />
					<path d="M0,-24 A24,24 0 1,1 -16,18 A18,18 0 1,0 0,-24 Z" fill={P.moon} opacity={0.9} />
				</g>
			</Layer>
			{sky ? (
				<Layer cam={cam} depth={0.25}>
					{sky}
				</Layer>
			) : null}
			<Layer cam={cam} depth={0.1}>
				<path d={far2} fill="#4a3e48" opacity={0.75 - 0.3 * night} />
				<path d={far2} fill="#1d2236" opacity={night * 0.8} />
				<path d={far} fill="#322a36" />
				<path d={far} fill="#141a2c" opacity={night * 0.7} />
				<rect x={-500} y={690} width={2920} height={60} fill="url(#fog)" opacity={0.5} />
			</Layer>
			{/* mid: hangars, tower, the flight line */}
			<Layer cam={cam} depth={0.38}>
				<rect x={-700} y={736} width={3300} height={500} fill="url(#ab-sand)" />
				<rect x={-700} y={736} width={3300} height={500} fill="#10141f" opacity={0.35 + 0.5 * night} />
				<g transform="translate(240,742)">
					<Hangar lit={lamp} f={f} />
				</g>
				<g transform="translate(820,742)">
					<Hangar w={440} h={200} lit={lamp * 0.7} f={f + 40} />
				</g>
				<g transform="translate(1380,744)">
					<Tower f={f} lit={lamp} />
				</g>
				{/* water tower */}
				<g transform="translate(1700,744)">
					<line x1={-30} y1={0} x2={-20} y2={-170} stroke="#2c2e40" strokeWidth={5} />
					<line x1={30} y1={0} x2={20} y2={-170} stroke="#2c2e40" strokeWidth={5} />
					<path d="M-24,-60 L24,-110 M24,-60 L-24,-110" stroke="#2c2e40" strokeWidth={3} />
					<rect x={-44} y={-226} width={88} height={60} rx={10} fill="#2c2e40" />
				</g>
				{/* wind sock */}
				<g transform="translate(1560,744)">
					<line x1={0} y1={0} x2={0} y2={-120} stroke="#3a3d55" strokeWidth={3} />
					<path d={`M0,-120 L${54 + 4 * Math.sin(f / 9)},${-112 + 3 * Math.sin(f / 7)} L${50 + 4 * Math.sin(f / 9)},${-104} L0,-108 Z`} fill="#e07a3a" />
				</g>
				{/* the flight line: three trainers parked, nose toward us */}
				{[1040, 1210, 1880].map((x, i) => (
					<g key={i} transform={`translate(${x},${752 - i * 2}) scale(${0.24 - i * 0.01})`}>
						<TrainerJet lod="far" gear warm={0.4 * lamp} no={String(11 + i)} />
					</g>
				))}
				{/* edge lights along the taxiway */}
				{Array.from({length: 26}, (_, i) => (
					<circle key={i} cx={-300 + i * 110} cy={760} r={2.4} fill={i % 2 ? P.candle : '#7fb0ff'} opacity={0.5 + 0.4 * night} />
				))}
			</Layer>
			{/* the apron */}
			<Layer cam={cam} depth={0.72}>
				<polygon points="-700,770 2700,770 2700,1500 -700,1500" fill="url(#ab-tarmac)" />
				<polygon points="-700,770 2700,770 2700,1500 -700,1500" fill="#0c0f18" opacity={0.3 + 0.4 * night} />
				{/* taxi line converging into the distance */}
				<path d="M960,772 C980,860 1100,980 1400,1300" stroke="#d9b34a" strokeWidth={6} fill="none" opacity={0.55} />
				{Array.from({length: 7}, (_, i) => (
					<rect key={i} x={-500 + i * 420} y={800 + (i % 2) * 6} width={160} height={4} fill="#9a958a" opacity={0.18} />
				))}
				{/* floodlight pool */}
				<ellipse cx={700} cy={900} rx={900} ry={170} fill="url(#ab-flood)" opacity={lamp} />
			</Layer>
			<Layer cam={cam} depth={1} filter="url(#grade-night)">
				{children}
			</Layer>
			<Layer cam={cam} depth={1.4}>
				<rect x={-700} y={900} width={3300} height={400} fill="url(#fog)" opacity={0.45} />
				{front}
			</Layer>
		</g>
	);
};
