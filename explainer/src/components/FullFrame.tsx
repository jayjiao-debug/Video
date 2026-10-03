import React from 'react';
import {AbsoluteFill, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Materials} from '../art/materials';
import {TANK_DEFS} from '../art/Tank';
import {ease, prog, useScene} from '../lib/context';
import {GlowDefs} from './Stage';

/**
 * A full-bleed 1920×1080 scene canvas for illustrated sets (the art library draws
 * in these coordinates). Cross-fades with the neighbouring scenes and lays a soft
 * scrim under the subtitle band so text stays readable over busy art.
 *
 * The frame is never still: the whole shot drifts slowly (a push plus a little
 * float), every new subtitle line gives it a small push, and dust motes hang in
 * the light. Scenes still own their real action; this keeps the holds alive.
 */
export const FullFrame: React.FC<{
	children: React.ReactNode;
	fadeIn?: number;
	fadeOut?: number;
	scrim?: number;
	/** HTML layers above the art (e.g. a title card in its own <Sequence>) */
	overlay?: React.ReactNode;
	/** strength of the ambient camera drift (0 = locked off) */
	drift?: number;
	/** dust motes in the air */
	motes?: number;
}> = ({children, fadeIn = 10, fadeOut = 10, scrim = 0.7, overlay, drift = 1, motes = 1}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const scene = useScene();
	const o = prog(f, 0, fadeIn, ease.inOut) * (1 - prog(f, scene.duration - fadeOut, fadeOut, ease.inOut));
	const seed = scene.from % 97;
	const push = scene.lines.reduce((n, ln) => n + 0.014 * spring({frame: f - ln.from, fps, config: {damping: 20, stiffness: 60}}), 0);
	const zoom = 1 + drift * (0.02 + 0.04 * (f / scene.duration) + push);
	const dx = drift * 14 * Math.sin((f + seed * 9) / 80);
	const dy = drift * 8 * Math.cos((f + seed * 7) / 105);
	return (
		<AbsoluteFill style={{opacity: o}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080">
				<Materials />
				<TANK_DEFS />
				<GlowDefs />
				<defs>
					<linearGradient id="sub-scrim" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#000" stopOpacity="0" />
						<stop offset="1" stopColor="#000" stopOpacity="1" />
					</linearGradient>
				</defs>
				<g transform={`translate(${960 + dx},${540 + dy}) scale(${zoom}) translate(-960,-540)`}>
					{children}
					{motes > 0 ? <Motes f={f} seed={seed} o={motes} /> : null}
				</g>
				<rect x={0} y={800} width={1920} height={280} fill="url(#sub-scrim)" opacity={scrim} />
			</svg>
			{overlay}
		</AbsoluteFill>
	);
};

/** Dust hanging in the light, drifting up and sideways. */
const Motes: React.FC<{f: number; seed: number; o: number}> = ({f, seed, o}) => (
	<g>
		{Array.from({length: 46}, (_, i) => {
			const z = random(`mz${i}`);
			const x = ((random(`mx${i}${seed}`) * 2100 + Math.sin((f + i * 31) / (50 + z * 40)) * 30 + f * (0.15 + z * 0.3)) % 2100) - 90;
			const y = (((random(`my${i}${seed}`) * 1150 - f * (0.25 + z * 0.55)) % 1150) + 1150) % 1150 - 40;
			const tw = 0.6 + 0.4 * Math.sin(f / (9 + z * 12) + i);
			return <circle key={i} cx={x} cy={y} r={1 + z * 2.2} fill="#ffe7b0" opacity={o * (0.1 + 0.28 * z) * tw} />;
		})}
	</g>
);

/** Blend two cameras. */
export const camMix = <T extends {x: number; y: number; zoom: number}>(a: T, b: T, t: number) => ({
	x: a.x + (b.x - a.x) * t,
	y: a.y + (b.y - a.y) * t,
	zoom: a.zoom + (b.zoom - a.zoom) * t,
});
