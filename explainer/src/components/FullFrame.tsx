import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Materials} from '../art/materials';
import {TANK_DEFS} from '../art/Tank';
import {ease, prog, useScene} from '../lib/context';
import {GlowDefs} from './Stage';

/**
 * A full-bleed 1920×1080 scene canvas for illustrated sets (the art library draws
 * in these coordinates). Cross-fades with the neighbouring scenes and lays a soft
 * scrim under the subtitle band so text stays readable over busy art.
 */
export const FullFrame: React.FC<{
	children: React.ReactNode;
	fadeIn?: number;
	fadeOut?: number;
	scrim?: number;
	/** HTML layers above the art (e.g. a title card in its own <Sequence>) */
	overlay?: React.ReactNode;
}> = ({children, fadeIn = 10, fadeOut = 10, scrim = 0.7, overlay}) => {
	const f = useCurrentFrame();
	const scene = useScene();
	const o = prog(f, 0, fadeIn, ease.inOut) * (1 - prog(f, scene.duration - fadeOut, fadeOut, ease.inOut));
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
				{children}
				<rect x={0} y={800} width={1920} height={280} fill="url(#sub-scrim)" opacity={scrim} />
			</svg>
			{overlay}
		</AbsoluteFill>
	);
};

/** Blend two cameras. */
export const camMix = <T extends {x: number; y: number; zoom: number}>(a: T, b: T, t: number) => ({
	x: a.x + (b.x - a.x) * t,
	y: a.y + (b.y - a.y) * t,
	zoom: a.zoom + (b.zoom - a.zoom) * t,
});
