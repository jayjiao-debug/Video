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

/**
 * An impact at frame `t` (local frame `f`): a ring that blasts outward, radial speed
 * streaks, and a hot core. Put it on the music's accent so the hit is felt.
 */
export const Impact: React.FC<{f: number; t?: number; x: number; y: number; size?: number; color?: string; seed?: string}> = ({
	f,
	t = 0,
	x,
	y,
	size = 1,
	color = '#fff1cf',
	seed = 'imp',
}) => {
	const k = f - t;
	if (k < 0 || k > 26) return null;
	const ring = 1 - Math.pow(1 - Math.min(1, k / 18), 3);
	const fade = Math.exp(-k / 7);
	return (
		<g transform={`translate(${x},${y})`} style={{mixBlendMode: 'screen'}}>
			<circle r={60 + 900 * size * ring} fill="none" stroke={color} strokeWidth={26 * fade * size + 1} opacity={0.9 * fade} />
			<circle r={40 + 520 * size * ring} fill="none" stroke={color} strokeWidth={8 * fade} opacity={0.6 * fade} />
			{Array.from({length: 22}, (_, i) => {
				const a = (i / 22) * Math.PI * 2 + random(`${seed}a${i}`) * 0.2;
				const r0 = (120 + 500 * ring) * size;
				const len = (160 + 260 * random(`${seed}l${i}`)) * size * fade;
				return (
					<line
						key={i}
						x1={Math.cos(a) * r0}
						y1={Math.sin(a) * r0}
						x2={Math.cos(a) * (r0 + len)}
						y2={Math.sin(a) * (r0 + len)}
						stroke={color}
						strokeWidth={3 + 4 * fade}
						strokeLinecap="round"
						opacity={0.8 * fade}
					/>
				);
			})}
			<circle r={180 * size} fill="url(#glow-lamp)" opacity={1.4 * fade} />
		</g>
	);
};
