import React from 'react';
import {AbsoluteFill, Composition, useVideoConfig} from 'remotion';
import {Banner} from '../../src/looks26/Open26';
import {Bread} from '../../src/looks26/b/OpenB';
import {useFonts} from '../../src/looks26/b/kit';
import {JUNO} from '../../src/brand/identity';

/**
 * Douyin covers for 《画饼，到底有没有用？》 (ep26): the film's own hero objects — the boss's message
 * "明年给你涨工资" and the golden 饼 with one bite taken — on look B's black stage with one warm key light,
 * and a two-line gold hook built on the film's first number: 工资没涨 / 先花了32块.
 * Wide 4:3 (1440×1080) and tall 3:4 (1080×1440); the tall one keeps its lower 18 % free for Douyin's UI.
 */
const SERIF = '"Noto Serif CJK SC", serif', SANS = '"Noto Sans CJK SC", sans-serif';
export const NobelCover: React.FC<{layout: 'wide' | 'tall'}> = ({layout}) => {
	useFonts();
	const {width: Wd, height: Hd} = useVideoConfig();
	const tall = layout === 'tall';
	const bread = tall ? {x: 640, y: 470, r: 230} : {x: 1040, y: 560, r: 300};
	const key = tall ? {x: 640, y: 470} : {x: 1040, y: 520};
	const banner = tall ? {x: 70, y: 120, s: 1.75} : {x: 80, y: 110, s: 1.6};
	const hook = tall ? {left: 70, top: 750, size: 132} : {left: 80, top: 430, size: 140};
	return (
		<AbsoluteFill style={{background: '#0a0a0b'}}>
			<AbsoluteFill style={{background: `radial-gradient(${tall ? 900 : 1000}px ${tall ? 900 : 800}px at ${key.x}px ${key.y}px, rgba(140,104,60,0.6), rgba(10,10,11,0) 70%)`}} />
			<svg width={Wd} height={Hd} style={{position: 'absolute', inset: 0}}>
				<defs>
					<radialGradient id="cv-halo"><stop offset="0" stopColor="#e2c27f" stopOpacity={0.35} /><stop offset="1" stopColor="#e2c27f" stopOpacity={0} /></radialGradient>
				</defs>
				<circle cx={bread.x} cy={bread.y} r={bread.r * 2} fill="url(#cv-halo)" />
				<Bread x={bread.x} y={bread.y} r={bread.r} bite={1} id="cv" />
				{/* a few crumbs falling from the bite */}
				{[[1.0, -0.2, 7], [1.08, 0.05, 5], [0.95, 0.25, 6], [1.15, 0.4, 4]].map(([dx, dy, r], i) => (
					<circle key={i} cx={bread.x + bread.r * dx} cy={bread.y + bread.r * dy} r={r} fill="#e2b866" opacity={0.85} />
				))}
				<path d={`M${bread.x - bread.r - 20} ${bread.y - bread.r * 0.3} L ${banner.x + 372 * banner.s - 10} ${banner.y + 60 * banner.s}`} stroke="#e2c27f" strokeOpacity={0.75} strokeWidth={2.5} strokeDasharray="8 10" fill="none" />
			</svg>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.75) 100%)'}} />
			{/* the boss's message, as in the film */}
			<div style={{position: 'absolute', left: banner.x, top: banner.y, width: 372, transform: `scale(${banner.s})`, transformOrigin: '0 0', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))'}}>
				<Banner y={0} light />
			</div>
			{/* the hook */}
			<div style={{position: 'absolute', left: hook.left, top: hook.top, fontFamily: SERIF, fontWeight: 900, fontSize: hook.size, lineHeight: 1.16, letterSpacing: '0.03em',
				background: 'linear-gradient(180deg,#fff3cf 0%,#f3cd7a 50%,#c99140 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 8px 26px rgba(0,0,0,0.95))'}}>
				<div>工资没涨</div>
				<div>先花了32块</div>
			</div>
			<div style={{position: 'absolute', left: hook.left + 4, top: hook.top + hook.size * 2.42, fontFamily: SANS, fontWeight: 700, fontSize: tall ? 40 : 42, color: 'rgba(243,237,226,0.85)', letterSpacing: '0.06em', textShadow: '0 2px 12px rgba(0,0,0,0.9)'}}>
				《画饼，到底有没有用？》
			</div>
			<div style={{position: 'absolute', left: hook.left + 4, top: hook.top + hook.size * 2.42 + (tall ? 60 : 62), fontFamily: SANS, fontWeight: 500, fontSize: 26, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.6)', textShadow: '0 2px 10px rgba(0,0,0,0.9)'}}>
				{`◆ ${JUNO.mark}`}
			</div>
		</AbsoluteFill>
	);
};
export const NobelCoverRoot: React.FC = () => (
	<>
		<Composition id="CoverWide" component={NobelCover} defaultProps={{layout: 'wide' as const}} durationInFrames={1} fps={30} width={1440} height={1080} />
		<Composition id="CoverTall" component={NobelCover} defaultProps={{layout: 'tall' as const}} durationInFrames={1} fps={30} width={1080} height={1440} />
	</>
);
