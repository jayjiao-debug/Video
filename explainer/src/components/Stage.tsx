import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ease, prog, useLayout, useScene} from '../lib/context';
import {color, font} from '../lib/theme';

/**
 * The box a scene draws into. Children are an SVG in stage coordinates
 * (W x H of the stage), with a scene-long slow push-in and soft cross-fades.
 */
export const Stage: React.FC<{
	children: React.ReactNode;
	push?: number;
	fadeIn?: number;
	fadeOut?: number;
	html?: React.ReactNode;
}> = ({children, push = 0.035, fadeIn = 12, fadeOut = 10, html}) => {
	const f = useCurrentFrame();
	const scene = useScene();
	const L = useLayout();
	const {x, y, w, h} = L.stage;
	const o = prog(f, 0, fadeIn, ease.inOut) * (1 - prog(f, scene.duration - fadeOut, fadeOut, ease.inOut));
	const s = 1 + push * prog(f, 0, scene.duration, ease.inOut);
	return (
		<div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: o, transform: `scale(${s})`}}>
			<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', overflow: 'visible'}}>
				{children}
			</svg>
			{html}
		</div>
	);
};

/** SVG text with the theme's type. */
export const T: React.FC<
	React.SVGProps<SVGTextElement> & {size?: number; weight?: number; family?: keyof typeof font; tone?: keyof typeof color; track?: number}
> = ({size = 40, weight = 600, family = 'serif', tone = 'text', track = 0, style, children, ...rest}) => (
	<text
		textAnchor="middle"
		dominantBaseline="middle"
		fill={color[tone]}
		style={{fontFamily: font[family], fontWeight: weight, fontSize: size, letterSpacing: `${track}em`, ...style}}
		{...rest}
	>
		{children}
	</text>
);

/** Number that counts up to `to` between frames [at, at+dur]. */
export const countUp = (frame: number, to: number, at: number, dur = 30, decimals = 0, from = 0) =>
	(from + (to - from) * prog(frame, at, dur, ease.out)).toFixed(decimals);

/** Soft glow filter defs; reference with filter="url(#glow-gold)" etc. */
export const GlowDefs: React.FC = () => (
	<defs>
		{(
			[
				['gold', color.gold],
				['red', color.red],
				['white', '#fff4dc'],
			] as const
		).map(([id, c]) => (
			<filter key={id} id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur stdDeviation="6" result="b" />
				<feFlood floodColor={c} floodOpacity="0.8" />
				<feComposite in2="b" operator="in" result="g" />
				<feMerge>
					<feMergeNode in="g" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
		))}
		<radialGradient id="hole-red">
			<stop offset="0%" stopColor="#ffd2c8" />
			<stop offset="35%" stopColor={color.red} />
			<stop offset="100%" stopColor={color.red} stopOpacity="0" />
		</radialGradient>
		<radialGradient id="spot-gold">
			<stop offset="0%" stopColor={color.gold} stopOpacity="0.55" />
			<stop offset="100%" stopColor={color.gold} stopOpacity="0" />
		</radialGradient>
	</defs>
);
