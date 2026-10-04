import React from 'react';
import {P} from './palette';

/**
 * Shared SVG <defs>: gradients, filters and patterns for every material in the
 * art bible. Mount <Materials/> once per <svg>; reference with url(#id).
 *
 *   metal-od, metal-od-v, metal-alu  painted / bare aluminium, lit from above
 *   paper, brass, wood, glass         surface fills
 *   rim-warm / rim-cool               edge-light filters (light from upper left / right)
 *   soft-shadow, glow-lamp, glow-fire blur-based light and shadow
 *   haze                              atmospheric fade for distant layers
 *   grain-paper                       paper texture pattern
 */
export const Materials: React.FC = () => (
	<defs>
		<linearGradient id="metal-od" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor={P.odLight} />
			<stop offset="0.45" stopColor={P.odGreen} />
			<stop offset="0.62" stopColor={P.odDark} />
			<stop offset="0.7" stopColor={P.neutralGray} stopOpacity="0.9" />
			<stop offset="1" stopColor="#5d6168" />
		</linearGradient>
		<linearGradient id="metal-od-v" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stopColor={P.odDark} />
			<stop offset="0.35" stopColor={P.odLight} />
			<stop offset="0.6" stopColor={P.odGreen} />
			<stop offset="1" stopColor={P.odDark} />
		</linearGradient>
		<linearGradient id="metal-alu" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#e3e7ec" />
			<stop offset="0.5" stopColor={P.alu} />
			<stop offset="1" stopColor={P.aluDark} />
		</linearGradient>
		<linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stopColor="#f6efdf" />
			<stop offset="1" stopColor={P.paperShade} />
		</linearGradient>
		<linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stopColor="#f6d58c" />
			<stop offset="0.4" stopColor={P.brass} />
			<stop offset="1" stopColor={P.brassDark} />
		</linearGradient>
		<linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#6b4a30" />
			<stop offset="1" stopColor={P.woodDark} />
		</linearGradient>
		<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stopColor="#d7ebff" stopOpacity="0.85" />
			<stop offset="0.5" stopColor={P.glass} stopOpacity="0.55" />
			<stop offset="1" stopColor="#3d5a80" stopOpacity="0.7" />
		</linearGradient>
		<linearGradient id="sky-night" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor={P.night0} />
			<stop offset="0.55" stopColor={P.night2} />
			<stop offset="0.85" stopColor={P.night4} />
			<stop offset="1" stopColor={P.horizon} />
		</linearGradient>
		<linearGradient id="sky-dusk" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor={P.night1} />
			<stop offset="0.5" stopColor={P.night3} />
			<stop offset="0.82" stopColor={P.horizon} />
			<stop offset="1" stopColor={P.dusk} />
		</linearGradient>
		<radialGradient id="glow-lamp">
			<stop offset="0" stopColor={P.candle} stopOpacity="0.95" />
			<stop offset="0.25" stopColor={P.lamp} stopOpacity="0.45" />
			<stop offset="1" stopColor={P.lamp} stopOpacity="0" />
		</radialGradient>
		<radialGradient id="glow-fire">
			<stop offset="0" stopColor="#fff1c4" stopOpacity="1" />
			<stop offset="0.3" stopColor={P.ember} stopOpacity="0.7" />
			<stop offset="1" stopColor={P.fire} stopOpacity="0" />
		</radialGradient>
		<radialGradient id="glow-moon">
			<stop offset="0" stopColor={P.moon} stopOpacity="0.5" />
			<stop offset="1" stopColor={P.moon} stopOpacity="0" />
		</radialGradient>
		<radialGradient id="glow-red">
			<stop offset="0" stopColor="#ffd2c8" />
			<stop offset="0.35" stopColor={P.red} />
			<stop offset="1" stopColor={P.red} stopOpacity="0" />
		</radialGradient>
		<linearGradient id="beam-warm" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor={P.candle} stopOpacity="0.5" />
			<stop offset="1" stopColor={P.candle} stopOpacity="0" />
		</linearGradient>
		<linearGradient id="beam-cool" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor={P.moon} stopOpacity="0.32" />
			<stop offset="1" stopColor={P.moon} stopOpacity="0" />
		</linearGradient>
		<linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor={P.night4} stopOpacity="0" />
			<stop offset="1" stopColor={P.night4} stopOpacity="0.55" />
		</linearGradient>
		<filter id="soft-shadow" x="-30%" y="-30%" width="160%" height="160%">
			<feGaussianBlur stdDeviation="10" />
		</filter>
		<filter id="blur-sm" x="-20%" y="-20%" width="140%" height="140%">
			<feGaussianBlur stdDeviation="3" />
		</filter>
		<filter id="blur-md" x="-30%" y="-30%" width="160%" height="160%">
			<feGaussianBlur stdDeviation="8" />
		</filter>
		<filter id="blur-lg" x="-50%" y="-50%" width="200%" height="200%">
			<feGaussianBlur stdDeviation="22" />
		</filter>
		{/* rim light: offset the alpha, subtract, colour the sliver that remains */}
		{(
			[
				['rim-cool', P.rim, 1.6, -1.2],
				['rim-warm', P.lamp, -1.6, -1.2],
				['rim-moon', P.moon, 1.4, -1],
			] as const
		).map(([id, c, dx, dy]) => (
			<filter key={id} id={id} x="-10%" y="-10%" width="120%" height="120%">
				<feOffset in="SourceAlpha" dx={dx} dy={dy} result="off" />
				<feComposite in="SourceAlpha" in2="off" operator="out" result="edge" />
				<feFlood floodColor={c} floodOpacity="0.75" />
				<feComposite in2="edge" operator="in" result="rim" />
				<feMerge>
					<feMergeNode in="SourceGraphic" />
					<feMergeNode in="rim" />
				</feMerge>
			</filter>
		))}
		{/* night grade for lit subjects: pull down, cool the shadows (apply to a whole layer) */}
		<filter id="grade-night" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
			<feColorMatrix type="matrix" values="0.62 0.04 0.02 0 0.01  0.03 0.64 0.05 0 0.02  0.04 0.08 0.78 0 0.05  0 0 0 1 0" />
		</filter>
		<filter id="haze" x="0" y="0" width="100%" height="100%">
			<feColorMatrix type="matrix" values="0.55 0 0 0 0.09  0 0.55 0 0 0.11  0 0 0.6 0 0.17  0 0 0 1 0" />
		</filter>
		<pattern id="grain-paper" width="120" height="120" patternUnits="userSpaceOnUse">
			<rect width="120" height="120" fill="url(#paper)" />
			{Array.from({length: 40}, (_, i) => (
				<circle key={i} cx={(i * 53) % 120} cy={(i * 97) % 120} r={0.6 + (i % 3) * 0.4} fill={P.ink} opacity={0.05} />
			))}
		</pattern>
		<pattern id="rivets" width="22" height="22" patternUnits="userSpaceOnUse">
			<circle cx="11" cy="11" r="0.9" fill="#000" opacity="0.25" />
		</pattern>
	</defs>
);
