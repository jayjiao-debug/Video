import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {B17Side, HoleDecal} from './art/B17';
import {CAST} from './art/cast';
import {Figure, POSES, blinkAt, lerpPose, walkPose} from './art/Figure';
import {Materials} from './art/materials';
import {Airfield, lookAt, type Cam} from './art/sets/Airfield';
import {ease, prog} from './lib/context';

/**
 * 5-second motion test for the art direction: camera dolly with parallax, walk
 * cycle into a sprung pose change, holes punching in with hit-flash and camera
 * shake, idling props, searchlights, blinking.
 */
const HOLES = [
	{x: 120, y: -20, t: 78},
	{x: -40, y: -30, t: 86},
	{x: 60, y: 14, t: 92},
	{x: -200, y: 20, t: 98},
	{x: -330, y: -70, t: 104},
	{x: -250, y: -6, t: 108},
	{x: 200, y: -36, t: 112},
];

export const MotionTest: React.FC = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();

	// camera: slow dolly in, then push toward the damaged fuselage
	const push = prog(f, 60, 70, ease.inOut);
	const wide = lookAt(interpolate(f, [0, 150], [900, 980]), 560, 1 + 0.06 * prog(f, 0, 150, ease.inOut));
	const close = lookAt(960, 820, 1.7);
	let cam: Cam = {x: wide.x + (close.x - wide.x) * push, y: wide.y + (close.y - wide.y) * push, zoom: wide.zoom + (close.zoom - wide.zoom) * push};
	// impact shake: each hole kicks the camera, decaying fast
	let shake = 0;
	for (const h of HOLES) if (f >= h.t) shake += Math.exp(-(f - h.t) / 3) * 10;
	cam = {...cam, x: cam.x + shake * (random(`sx${f}`) - 0.5), y: cam.y + shake * (random(`sy${f}`) - 0.5)};

	// mechanic walks in, stops, swings his arm up to point (spring with overshoot)
	const walkEnd = 52;
	const walking = f < walkEnd;
	const mx = interpolate(f, [0, walkEnd], [380, 640], {extrapolateRight: 'clamp', easing: ease.out});
	const point = spring({frame: f - walkEnd, fps, config: {damping: 9, stiffness: 110, mass: 0.8}});
	const mechPose = walking ? walkPose(f * 0.32, 0.9) : lerpPose(POSES.stand, POSES.pointUp, point);
	// officer looks over when the first hole appears
	const look = spring({frame: f - 80, fps, config: {damping: 14}});

	const flash = HOLES.reduce((a, h) => a + (f >= h.t ? Math.exp(-(f - h.t) / 2.5) : 0), 0);

	return (
		<AbsoluteFill style={{background: '#000'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080">
				<Materials />
				<Airfield frame={f} cam={cam}>
					<g transform="translate(1000, 860) scale(0.86)">
						<B17Side prop={f * 0.55} gear lights damage={[]} />
						<g transform="rotate(-6.8, 262, 150)">
							{HOLES.map((h, i) => {
								if (f < h.t) return null;
								const p = spring({frame: f - h.t, fps, config: {damping: 10, stiffness: 200}});
								return (
									<g key={i}>
										<HoleDecal x={h.x} y={h.y} r={7 * p} glow={Math.exp(-(f - h.t) / 8)} seed={i * 1.7} />
										{/* sparks */}
										{Array.from({length: 6}, (_, k) => {
											const a = random(`sp${i}${k}`) * Math.PI * 2;
											const d = (f - h.t) * (4 + random(`sd${i}${k}`) * 5);
											const o = Math.max(0, 1 - (f - h.t) / 10);
											return <circle key={k} cx={h.x + Math.cos(a) * d} cy={h.y + Math.sin(a) * d} r={2} fill="#ffd38a" opacity={o} />;
										})}
									</g>
								);
							})}
						</g>
					</g>
					<g transform={`translate(${mx}, 989) scale(0.3)`}>
						<Figure look={CAST.mechanic} pose={mechPose} expression={walking ? 'neutral' : 'surprise'} blink={blinkAt(f, 'mech')} rim="warm" />
					</g>
					<g transform="translate(560, 989) scale(0.3)">
						<Figure look={CAST.officer} pose={lerpPose(POSES.hold, POSES.stand, look)} expression={look > 0.5 ? 'stern' : 'neutral'} blink={blinkAt(f, 'off')} rim="warm" />
					</g>
					<g transform="translate(1260, 989) scale(0.3)">
						<Figure look={CAST.pilot} pose={lerpPose(POSES.stand, POSES.recoil, spring({frame: f - 84, fps, config: {damping: 12}}) * 0.6)} expression={f > 84 ? 'worried' : 'neutral'} blink={blinkAt(f, 'pil')} rim="warm" flip />
					</g>
				</Airfield>
				<rect width={1920} height={1080} fill="#fff4dc" opacity={Math.min(0.35, flash * 0.18)} />
				{/* letterbox for a cinematic frame */}
				<rect width={1920} height={70} fill="#000" />
				<rect y={1010} width={1920} height={70} fill="#000" />
			</svg>
		</AbsoluteFill>
	);
};
