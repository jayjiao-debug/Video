import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, random, staticFile} from 'remotion';
import {noise2D} from '@remotion/noise';
import {useAbsoluteFrame, useBeat, useEnergy, useTimeline} from '../lib/context';

/**
 * The persistent world behind every scene: night gradient, a warm key light that
 * breathes with the music, drifting fog, depth-of-field dust motes. The light
 * drops automatically through the track's quiet "break" and flares on the "drop".
 */
export const Backdrop: React.FC = () => {
	const {width: W, height: H, music} = useTimeline();
	const f = useAbsoluteFrame();
	const energy = useEnergy();
	const beat = useBeat(9, 1);
	const m = music.markers;

	// dramatic lighting curve from the music structure
	let key = 0.55 + 0.45 * energy;
	if (m.break !== undefined && m.build !== undefined) {
		key *= interpolate(f, [m.break - 6, m.break + 18, m.build, m.drop ?? m.build + 300], [1, 0.35, 0.5, 0.9], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
	}
	const flash = m.drop !== undefined ? Math.exp(-Math.max(0, f - m.drop) / 10) * (f >= m.drop ? 1 : 0) : 0;

	const motes = useMemo(
		() =>
			new Array(70).fill(0).map((_, i) => ({
				x: random(`mx${i}`) * W,
				y: random(`my${i}`) * H,
				z: random(`mz${i}`),
				speed: 0.25 + random(`ms${i}`) * 0.9,
				phase: random(`mp${i}`) * 100,
			})),
		[W, H],
	);

	const fog = [0, 1, 2, 3].map((i) => {
		const x = 0.5 + 0.38 * noise2D(`fx${i}`, f / 900, i);
		const y = 0.35 + 0.4 * noise2D(`fy${i}`, i, f / 1100);
		return `radial-gradient(ellipse 60% 26% at ${x * 100}% ${y * 100}%, rgba(150,160,190,${0.035 + 0.02 * i / 3}), transparent 70%)`;
	});

	return (
		<AbsoluteFill style={{background: 'linear-gradient(180deg, #0b0d15 0%, #07080d 55%, #040406 100%)'}}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse 75% 42% at 50% 20%, rgba(241,197,109,${0.07 + 0.11 * key + 0.04 * beat * energy}), transparent 72%)`,
				}}
			/>
			<AbsoluteFill
				style={{background: 'radial-gradient(ellipse 90% 35% at 25% 100%, rgba(127,167,216,0.07), transparent 70%)'}}
			/>
			<AbsoluteFill style={{background: fog.join(',')}} />
			<svg width={W} height={H} style={{position: 'absolute'}}>
				<defs>
					<radialGradient id="mote">
						<stop offset="0%" stopColor="#ffe3a8" stopOpacity="1" />
						<stop offset="100%" stopColor="#ffe3a8" stopOpacity="0" />
					</radialGradient>
				</defs>
				{motes.map((p, i) => {
					const y = (((p.y - f * p.speed * (0.4 + p.z)) % H) + H) % H;
					const x = p.x + 30 * Math.sin((f + p.phase * 30) / (120 + p.z * 80));
					const r = 1.4 + p.z * p.z * 9;
					const tw = 0.5 + 0.5 * Math.sin(f / 23 + p.phase);
					const o = (0.12 + 0.5 * (1 - p.z)) * (0.4 + 0.6 * tw) * (0.4 + 0.6 * key) * (p.z > 0.8 ? 0.35 : 1);
					return <circle key={i} cx={x} cy={y} r={r} fill="url(#mote)" opacity={o} />;
				})}
			</svg>
			{flash > 0.01 ? (
				<AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, rgba(255,236,200,${0.35 * flash}), transparent 65%)`}} />
			) : null}
		</AbsoluteFill>
	);
};

/** Film grain + vignette, laid over everything. */
export const Grade: React.FC = () => {
	const f = useAbsoluteFrame();
	return (
		<>
			<AbsoluteFill
				style={{
					backgroundImage: `url(${staticFile('static/grain.png')})`,
					backgroundPosition: `${Math.floor(random(`gx${f}`) * 256)}px ${Math.floor(random(`gy${f}`) * 256)}px`,
					opacity: 0.11,
					mixBlendMode: 'overlay',
				}}
			/>
			<AbsoluteFill
				style={{background: 'radial-gradient(ellipse 85% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.62) 100%)'}}
			/>
		</>
	);
};
