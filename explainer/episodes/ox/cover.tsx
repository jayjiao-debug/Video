import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {Materials} from '../../src/art/materials';
import {OX_DEFS, Ox, Signboard, Ticket} from '../../src/art/Ox';
import {lookAt} from '../../src/art/sets/Airfield';
import {Fair1906} from '../../src/art/sets/Fair1906';
import {GlowDefs} from '../../src/components/Stage';
import {JUNO} from '../../src/brand/identity';
import {loadEpisodeFonts} from '../../src/lib/fonts';
import {color, font} from '../../src/lib/theme';
import {ButcherPosting, DroverWithRope} from './acting';
import {TicketSwarm} from './art';

/**
 * Douyin covers for 《八百人猜牛》: the show ring at night, the ox under the lantern,
 * the 800 guesses circling it, and the one gold ticket (the middle one, 1207) lit.
 * Hook: 800个人瞎猜 / 只差不到1%. Same art and blocking as the video.
 * Wide 4:3 (1440×1080) and tall 3:4 (1080×1440).
 */

const OX = {x: 1050, y: 880, s: 0.95};
const POSTER = {x: 560, y: 892, s: 0.95};
const F = 420; // a frame of the fair's clock: swarm fully gathered, idle mid-breath

const Stage: React.FC = () => {
	const oxPose = {head: -9, tail: 0.4, breath: 0.6};
	return (
		<g>
			<Fair1906 frame={F} cam={lookAt(1000, 560, 1)} postX={1660}>
				<TicketSwarm f={F} cx={1050} cy={700} n={70} side={-1} />
				<g transform="translate(250,890)">
					<Signboard />
				</g>
				<g transform={`translate(${OX.x},${OX.y}) scale(${OX.s})`}>
					<Ox pose={oxPose} lit={1} />
				</g>
				<DroverWithRope f={F} x={1530} y={885} s={0.95} ox={{...OX, pose: oxPose}} expression="smile" />
				<ButcherPosting f={F} t0={F - 120} x={POSTER.x} y={POSTER.y} s={POSTER.s} />
				<TicketSwarm f={F} cx={1050} cy={700} n={70} side={1} />
			</Fair1906>
		</g>
	);
};

/** The middle ticket, gold and glowing: the motif. */
const HeroTicket: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
	<g>
		<ellipse cx={x} cy={y} rx={300 * s} ry={220 * s} fill="url(#glow-lamp)" opacity={0.95} />
		<g transform={`translate(${x},${y}) rotate(-7) scale(${s})`}>
			<Ticket tone="gold" glow={1} lod="full" />
		</g>
	</g>
);

export const OxCover: React.FC<{layout: 'wide' | 'tall'}> = ({layout}) => {
	loadEpisodeFonts('ox');
	const {width: W, height: H} = useVideoConfig();
	const tall = layout === 'tall';
	// which part of the 1920×1080 stage each cover shows
	const view = tall ? '730 -78 900 1200' : '300 -60 1500 1125';
	const head = tall ? 140 : 132;
	return (
		<AbsoluteFill style={{background: '#05060b'}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
				<Materials />
				<GlowDefs />
				<OX_DEFS />
				<defs>
					<radialGradient id="cv-vig" cx="50%" cy="58%" r="72%">
						<stop offset="0.35" stopColor="#000" stopOpacity="0" />
						<stop offset="1" stopColor="#000" stopOpacity="0.9" />
					</radialGradient>
					<linearGradient id="cv-top" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#04050a" stopOpacity="0.92" />
						<stop offset="1" stopColor="#04050a" stopOpacity="0" />
					</linearGradient>
				</defs>
				<svg x={0} y={0} width={W} height={H} viewBox={view} preserveAspectRatio="xMidYMid slice">
					<Stage />
					<HeroTicket x={tall ? 1240 : 1290} y={tall ? 540 : 400} s={tall ? 1.05 : 1.15} />
				</svg>
				<rect width={W} height={tall ? 720 : 560} fill="url(#cv-top)" />
				<rect width={W} height={H} fill="url(#cv-vig)" />
			</svg>
			{/* type */}
			<div style={{position: 'absolute', left: tall ? 0 : 88, right: tall ? 0 : undefined, top: tall ? 96 : 80, textAlign: tall ? 'center' : 'left'}}>
				<div style={{fontFamily: font.sans, fontWeight: 700, fontSize: tall ? 34 : 32, letterSpacing: '0.3em', color: color.gold}}>{tall ? `${JUNO.mark} · 1906` : '1906 · 真实实验 · 统计学'}</div>
				<div style={{fontFamily: font.serif, fontWeight: 900, fontSize: head, lineHeight: 1.16, color: '#fff7e6', marginTop: 22, textShadow: '0 6px 30px rgba(0,0,0,0.95)'}}>
					<span style={{fontFamily: font.latin, fontWeight: 700, color: color.gold, fontVariantNumeric: 'lining-nums', fontSize: head * 1.12}}>800</span>个人瞎猜
					<br />
					只差<span style={{color: color.gold}}>不到</span>
					<span style={{fontFamily: font.latin, fontWeight: 700, color: color.gold, fontVariantNumeric: 'lining-nums', fontSize: head * 1.12}}>1%</span>
				</div>
				{tall ? (
					<div style={{fontFamily: font.serif, fontWeight: 900, fontSize: 46, letterSpacing: '0.1em', color: color.gold, marginTop: 24, textShadow: '0 4px 20px rgba(0,0,0,0.95)'}}>
						《八百人猜牛》
					</div>
				) : null}
			</div>
			{tall ? null : (
				<div style={{position: 'absolute', left: 0, right: 0, bottom: 34, textAlign: 'center', fontFamily: font.serif, fontWeight: 900, fontSize: 42, letterSpacing: '0.1em', color: color.gold, textShadow: '0 4px 20px rgba(0,0,0,0.95)'}}>
					《八百人猜牛》
					<span style={{fontFamily: font.sans, fontWeight: 500, fontSize: 22, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.65)', marginLeft: 24}}>{`◆ ${JUNO.mark}`}</span>
				</div>
			)}
		</AbsoluteFill>
	);
};
