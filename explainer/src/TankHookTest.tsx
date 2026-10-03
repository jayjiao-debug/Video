import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CAST} from './art/cast';
import {Figure, POSES, blinkAt, lerpPose, walkPose} from './art/Figure';
import {Materials} from './art/materials';
import {Embers, Smoke, Torch} from './art/fx';
import {lookAt, type Cam} from './art/sets/Airfield';
import {Battlefield} from './art/sets/Battlefield';
import {Panzer, SerialPlate, TANK_DEFS} from './art/Tank';
import {ease, prog} from './lib/context';

/**
 * Motion test for 《德国坦克问题》's hook: a soldier walks up to a burning wreck,
 * his torch sweeps the hull and finds the gearbox plate, the camera pushes in,
 * hard cut to the plate where the serial number surfaces under the beam.
 */
export const TankHookTest: React.FC = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const CUT = 96;
	if (f >= CUT) {
		const g = f - CUT;
		const torch = 0.35 + 0.65 * prog(g, 0, 12) + 0.04 * Math.sin(g / 2.3);
		const push = 1 + 0.07 * prog(g, 0, 54, ease.out);
		// handheld torch: the pool of light drifts a little
		const lx = 960 + 40 * Math.sin(g / 17) - 60 * (1 - prog(g, 0, 20, ease.out));
		const ly = 520 + 20 * Math.cos(g / 13);
		return (
			<AbsoluteFill style={{background: '#000'}}>
				<svg width={1920} height={1080} viewBox="0 0 1920 1080">
					<Materials />
					<TANK_DEFS />
					<defs>
						<radialGradient id="torch-pool" cx={lx} cy={ly} r={760} gradientUnits="userSpaceOnUse">
							<stop offset="0" stopColor="#000" stopOpacity="0" />
							<stop offset="0.55" stopColor="#000" stopOpacity="0.35" />
							<stop offset="1" stopColor="#000" stopOpacity="0.92" />
						</radialGradient>
					</defs>
					<g transform={`translate(960,540) scale(${push}) translate(-960,-540)`}>
						{/* armour plate: dunkelgelb, scorched, riveted, welded */}
						<rect width={1920} height={1080} fill="#7d6c44" />
						<rect width={1920} height={1080} fill="url(#rivets)" opacity={0.9} />
						{[180, 900].map((y) => (
							<path key={y} d={`M0,${y} L1920,${y + 14}`} stroke="#3e3420" strokeWidth={10} opacity={0.6} />
						))}
						{Array.from({length: 26}, (_, i) => (
							<circle key={i} cx={60 + i * 72} cy={150} r={9} fill="#4d4128" />
						))}
						<ellipse cx={1600} cy={260} rx={520} ry={300} fill="url(#scorch)" />
						<ellipse cx={250} cy={900} rx={420} ry={240} fill="url(#scorch)" opacity={0.8} />
						{[
							'M300,420 l220,30',
							'M1320,760 l260,-40',
							'M1500,520 l120,60',
						].map((d) => (
							<path key={d} d={d} stroke="#c9b98f" strokeWidth={2} opacity={0.35} />
						))}
						<g transform={`translate(960,540) scale(1.85) rotate(-2)`}>
							<SerialPlate serial="82731" torch={torch} reveal={prog(g, 6, 26, ease.out)} />
						</g>
					</g>
					<rect width={1920} height={1080} fill="url(#torch-pool)" />
					<rect width={1920} height={1080} fill="#fff4dc" opacity={Math.max(0, 0.5 - g / 8)} />
					<rect width={1920} height={70} fill="#000" />
					<rect y={1010} width={1920} height={70} fill="#000" />
				</svg>
			</AbsoluteFill>
		);
	}
	// wide: the wreck, the soldier walking in, the torch searching the hull
	const walkEnd = 48;
	const walking = f < walkEnd;
	const sx = interpolate(f, [0, walkEnd], [1700, 1500], {extrapolateRight: 'clamp', easing: ease.out});
	const stop = spring({frame: f - walkEnd, fps, config: {damping: 11}});
	const pose = walking ? walkPose(f * 0.3, 0.8) : lerpPose(POSES.stand, POSES.hold, stop);
	const beamAngle = interpolate(f, [20, 60, 80], [200, 168, 176], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.inOut});
	const push = prog(f, 50, 46, ease.in);
	const wide = lookAt(1000, 600, 1.02);
	const close = lookAt(1240, 780, 2.6);
	const cam: Cam = {x: wide.x + (close.x - wide.x) * push, y: wide.y + (close.y - wide.y) * push, zoom: wide.zoom + (close.zoom - wide.zoom) * push};
	const plate = prog(f, 62, 14);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080">
				<Materials />
				<Battlefield frame={f + 200} cam={cam}>
					<g transform="translate(980, 880) scale(0.9)">
						<Panzer wreck plateGlow={plate} />
						<g transform="translate(-80,-230)">
							<circle r={90} fill="url(#glow-fire)" opacity={0.45 + 0.15 * Math.sin(f / 3)} />
							<Embers frame={f} />
							<Smoke frame={f + 120} seed="hero" height={600} wind={0.6} lit="#ff8a3d" />
						</g>
					</g>
					<g transform={`translate(${sx}, 900) scale(0.42)`}>
						<Figure look={CAST.soldier} pose={pose} reach={walking ? undefined : {near: [96, -236]}} facing="side" flip rim="moon" blink={blinkAt(f, 'sol')} />
					</g>
					<g transform={`translate(${sx - 40}, 801)`}>
						<Torch angle={beamAngle} reach={300} spread={12} power={prog(f, 14, 10)} />
					</g>
				</Battlefield>
				<rect width={1920} height={1080} fill="#000" opacity={Math.max(0, 1 - f / 12)} />
				<rect width={1920} height={70} fill="#000" />
				<rect y={1010} width={1920} height={70} fill="#000" />
			</svg>
		</AbsoluteFill>
	);
};
