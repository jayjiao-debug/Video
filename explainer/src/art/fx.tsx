import React from 'react';
import {random} from 'remotion';
import {noise2D} from '@remotion/noise';

/** Rising smoke column: puffs born at (0,0), drifting up and downwind, growing and thinning. */
export const Smoke: React.FC<{frame: number; seed?: string; height?: number; wind?: number; tone?: string; lit?: string; density?: number}> = ({
	frame: f,
	seed = 'sm',
	height = 520,
	wind = 0.6,
	tone = '#1c1c22',
	lit,
	density = 26,
}) => {
	const life = 150;
	return (
		<g filter="url(#blur-md)">
			{Array.from({length: density}, (_, i) => {
				const born = (i * life) / density;
				const t = (((f - born) % life) + life) % life / life;
				const y = -t * height;
				const x = t * height * wind * 0.5 + noise2D(seed, i, f / 90) * 40 * t;
				const r = 18 + t * 110 * (0.7 + 0.6 * random(`${seed}r${i}`));
				const o = Math.sin(Math.PI * Math.min(1, t * 1.4)) * (0.55 - 0.35 * t);
				return (
					<g key={i}>
						<circle cx={x} cy={y} r={r} fill={tone} opacity={o} />
						{lit ? <circle cx={x - r * 0.25} cy={y + r * 0.3} r={r * 0.7} fill={lit} opacity={o * 0.25} /> : null}
					</g>
				);
			})}
		</g>
	);
};

/** Flashlight cone from (0,0) toward `angle` degrees (0 = right), with a soft hotspot at `reach`. */
export const Torch: React.FC<{angle: number; reach?: number; spread?: number; power?: number}> = ({angle, reach = 520, spread = 16, power = 1}) => {
	const a = (angle * Math.PI) / 180;
	const s = (spread * Math.PI) / 180;
	const p1 = [Math.cos(a - s) * reach, Math.sin(a - s) * reach];
	const p2 = [Math.cos(a + s) * reach, Math.sin(a + s) * reach];
	const hx = Math.cos(a) * reach;
	const hy = Math.sin(a) * reach;
	return (
		<g opacity={power}>
			<defs>
				<radialGradient id="torch-beam" cx="0" cy="0" r={reach} gradientUnits="userSpaceOnUse">
					<stop offset="0" stopColor="#fff3cf" stopOpacity="0.55" />
					<stop offset="1" stopColor="#fff3cf" stopOpacity="0.05" />
				</radialGradient>
			</defs>
			<polygon points={`0,0 ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`} fill="url(#torch-beam)" />
			<ellipse cx={hx} cy={hy} rx={reach * Math.tan(s) * 1.1} ry={reach * Math.tan(s) * 0.8} fill="url(#glow-lamp)" opacity={0.8} />
		</g>
	);
};

/** Embers drifting up from a fire. */
export const Embers: React.FC<{frame: number; seed?: string; n?: number; height?: number}> = ({frame: f, seed = 'em', n = 24, height = 300}) => (
	<g>
		{Array.from({length: n}, (_, i) => {
			const life = 60 + random(`${seed}l${i}`) * 60;
			const t = ((f + random(`${seed}o${i}`) * life) % life) / life;
			const x = (random(`${seed}x${i}`) - 0.5) * 80 + noise2D(seed, i, f / 30) * 30;
			return <circle key={i} cx={x} cy={-t * height} r={1.5 + random(`${seed}s${i}`) * 2} fill="#ffb15a" opacity={(1 - t) * 0.9} />;
		})}
	</g>
);
