import React from 'react';
import {AbsoluteFill} from 'remotion';
import {GlowDefs} from '../../src/art/glow/kit';
import {Materials} from '../../src/art/materials';
import type {VideoCfg} from '../../src/brand/Brand';
import {ease, prog} from '../../src/lib/context';
import {Grade} from '../xuming/look3';
import {W, H} from './kit';

/**
 * Shared stage for 《越难越爱》: SVG defs, a camera, the subtitle scrim and the grade.
 *
 * Camera language (owner's notes: stronger camera, stronger transitions, no wobble):
 *  - every shot has a motivated move with an eased start and stop (`lookAt` targets);
 *  - cuts land on the track's accents; impacts get a 2–3 frame decaying shake;
 *  - transitions carry an object across the cut (bubbles → motif → door light →
 *    desk lamp; bar glow → filament; bulb → lantern; card → phone) or push through
 *    a light source;
 *  - text and numbers never move once they have landed (the camera may).
 */

export const EPISODE: VideoCfg = {
	id: 'yuenan',
	src: '',
	title: '越难越爱',
	kicker: 'EFFORT JUSTIFICATION · ARONSON & MILLS · MCMLIX',
	tagline: '为什么越难追到的人，越放不下？',
	taglineEn: 'Why do we love what costs us the most?',
	motif: 'chat',
	card: [0, 4.6],
	hit: 0,
	extend: 0,
	question: '有没有明知不值得、却放不下的人？A 有 / B 没有',
	sources: '参考 · Aronson & Mills (1959) · Gerard & Mathewson (1966) · Festinger (1957) · Norton, Mochon & Ariely (2012) · Whitchurch, Wilson & Gilbert (2011)',
	duration: 0,
};

export type Cam = {x: number; y: number; z: number};
export const cam = (x: number, y: number, z = 1): Cam => ({x, y, z});
/** blend two cameras */
export const camLerp = (a: Cam, b: Cam, t: number): Cam => ({x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z * Math.pow(b.z / a.z, t)});
/** a camera that moves through keyframes [frame, cam], eased between each pair */
export const camPath = (f: number, keys: [number, Cam][], e = ease.inOut): Cam => {
	if (f <= keys[0][0]) return keys[0][1];
	for (let i = 1; i < keys.length; i++) {
		if (f <= keys[i][0]) return camLerp(keys[i - 1][1], keys[i][1], prog(f, keys[i - 1][0], keys[i][0] - keys[i - 1][0], e));
	}
	return keys[keys.length - 1][1];
};
/** a short decaying shake after frame `at` (impacts) */
export const shake = (f: number, at: number, amp = 10): [number, number] => {
	const k = f - at;
	if (k < 0 || k > 10) return [0, 0];
	const d = Math.exp(-k / 2.6) * amp;
	return [d * Math.sin(k * 2.9), d * Math.cos(k * 3.7)];
};

export const View: React.FC<{c: Cam; sh?: [number, number]; children: React.ReactNode; o?: number}> = ({c, sh = [0, 0], children, o = 1}) => (
	<g opacity={o} transform={`translate(${960 + sh[0]},${540 + sh[1]}) scale(${c.z}) translate(${-c.x},${-c.y})`}>
		{children}
	</g>
);

export const Defs: React.FC = () => (
	<>
		<GlowDefs />
		<Materials />
		<defs>
			<filter id="b8" x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur stdDeviation="8" />
			</filter>
			<filter id="b2" x="-10%" y="-50%" width="120%" height="200%">
				<feGaussianBlur stdDeviation="2" />
			</filter>
			<filter id="whip" x="-20%" y="-10%" width="140%" height="120%">
				<feGaussianBlur stdDeviation="28 0" />
			</filter>
			<radialGradient id="vig3" cx="50%" cy="48%" r="72%">
				<stop offset="0.5" stopColor="#000" stopOpacity="0" />
				<stop offset="1" stopColor="#000" stopOpacity="0.85" />
			</radialGradient>
			<radialGradient id="vigHard" cx="50%" cy="45%" r="60%">
				<stop offset="0.3" stopColor="#000" stopOpacity="0" />
				<stop offset="1" stopColor="#000" stopOpacity="0.96" />
			</radialGradient>
			<linearGradient id="dawnSky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#3a2a4a" />
				<stop offset="0.6" stopColor="#c46a5a" />
				<stop offset="1" stopColor="#ffb07a" />
			</linearGradient>
			<linearGradient id="sub-band" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#000" stopOpacity="0" />
				<stop offset="1" stopColor="#000" stopOpacity="0.9" />
			</linearGradient>
		</defs>
	</>
);

/** the scene canvas: art, subtitle scrim, grade; `over` is HTML/SVG drawn above (cards) */
export const Canvas: React.FC<{children: React.ReactNode; over?: React.ReactNode; scrim?: number; bg?: string; flash?: number; flashColor?: string; tension?: number}> = ({
	children,
	over,
	scrim = 0.6,
	bg = '#05050b',
	flash = 0,
	flashColor = '#fff4dc',
	tension = 0,
}) => (
	<AbsoluteFill style={{background: bg}}>
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
			<Defs />
			{children}
			{tension > 0 ? <rect width={W} height={H} fill="url(#vigHard)" opacity={tension} /> : null}
			<rect x={0} y={840} width={W} height={240} fill="url(#sub-band)" opacity={scrim} />
			{flash > 0 ? <rect width={W} height={H} fill={flashColor} opacity={flash} style={{mixBlendMode: 'screen'}} /> : null}
			<Grade />
		</svg>
		{over}
	</AbsoluteFill>
);

/** fade a label in and hold it still; optional fade out */
export const landed = (f: number, at: number, out?: number, len = 12) => prog(f, at, len) * (out === undefined ? 1 : 1 - prog(f, out, len));

/** push-through: 0 → 1 accelerating into the source; returns zoom multiplier and fade */
export const through = (f: number, at: number, len: number) => {
	const k = prog(f, at, len, ease.in);
	return {z: 1 + 3 * k * k, o: 1 - prog(f, at + len * 0.55, len * 0.45)};
};
/** arrive out of a light: 1 → 0 decelerating */
export const arrive = (f: number, at: number, len: number) => {
	const k = 1 - prog(f, at, len, ease.out);
	return {z: 1 + 0.5 * k, flash: 0.9 * Math.pow(k, 2)};
};
