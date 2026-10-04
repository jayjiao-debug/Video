import React from 'react';
import {AbsoluteFill, Sequence, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CAST} from '../../src/art/cast';
import {Figure, POSES, addPose, blinkAt, idle} from '../../src/art/Figure';
import {OX_DEFS, Ox, Signboard, Ticket, TicketMotif} from '../../src/art/Ox';
import {lookAt, type Cam} from '../../src/art/sets/Airfield';
import {Fair1906} from '../../src/art/sets/Fair1906';
import {JUNO} from '../../src/brand/identity';
import {FullFrame, camMix} from '../../src/components/FullFrame';
import {ease, prog, useCue, useScene, useTimeline} from '../../src/lib/context';
import {font} from '../../src/lib/theme';
import type {SceneMap, SceneProps} from '../../src/lib/types';
import {BUTCHER, ButcherPosting, DroverWithRope, slotFor} from './acting';
import {TicketSwarm} from './art';
import {EPISODE} from './brand';

/**
 * 《八百人猜牛》. The cold open is sized by its lines (what we're looking at → the
 * guessing → the question), then the camera follows the last-posted ticket into the
 * ballot box; inside, it lands on the heap on the track's first big hit (16.10 s) and
 * the title is stamped one character per half-beat.
 */

const W = 1920;
const H = 1080;

// the show ring's blocking, shared by every fair shot so the cuts match
const OX = {x: 1050, y: 880, s: 0.95};
const POSTER = {x: 560, y: 892, s: 0.95};
const SLOT = slotFor(POSTER.x, POSTER.y, POSTER.s);
const DROVER_AT = {x: 1530, y: 885};

/** The crowd's backs in the foreground, breathing. */
const FrontCrowd: React.FC<{f: number}> = ({f}) => (
	<g>
		{(
			[
				[150, 'gent'],
				[390, 'shopgirl'],
				[1600, 'butcher'],
				[1830, 'drover'],
			] as const
		).map(([x, who], i) => (
			<g key={i} transform={`translate(${x},1260) scale(1.3)`}>
				<Figure look={CAST[who]} pose={addPose(POSES.stand, idle(f, `fg${i}`), 1.4)} facing="back" silhouette="#07080d" rim="none" shadow={false} />
			</g>
		))}
	</g>
);

/** People waiting their turn at the box: reading their tickets, shifting their weight. */
const Queue: React.FC<{f: number; who: (keyof typeof CAST)[]; x0: number; step?: number}> = ({f, who, x0, step = -95}) => (
	<g>
		{who.map((k, i) => (
			<g key={k} transform={`translate(${x0 + i * step},${POSTER.y - 6 - i * 4}) scale(0.9)`}>
				<Figure
					look={CAST[k]}
					pose={addPose(i === 0 ? BUTCHER.read : POSES.stand, idle(f, `q${k}`))}
					hands={i === 0 ? {near: 'pinch'} : undefined}
					holdNear={
						i === 0 ? (
							<g transform="rotate(-70) scale(0.13)">
								<Ticket lod="mid" />
							</g>
						) : undefined
					}
					rim="warm"
					blink={blinkAt(f, k)}
					expression={i === 0 ? 'thinking' : 'neutral'}
				/>
			</g>
		))}
	</g>
);

// ---------------------------------------------------------------- 1. hook

const Hook: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const scene = useScene();
	const D = scene.duration;
	// shots: the wide establishing shot (what are we looking at?) → the box and the guessing →
	// the ox's face (the question) → a whip into the slot after the last ticket
	const camA = camMix(lookAt(980, 600, 1.05), lookAt(1000, 630, 1.16), prog(f, 0, cue(2), ease.inOut));
	const camB = lookAt(840, 680, 1.5);
	const camC = lookAt(1290, 650, 2.0);
	const toB = prog(f, cue(2) - 10, 30, ease.inOut);
	const toC = prog(f, cue(3) + 4, 40, ease.inOut);
	const DIVE = D - 36;
	const pan = prog(f, DIVE, 16, ease.inOut);
	const plunge = prog(f, DIVE + 10, 26, ease.inOut);
	const base = camMix(camMix(camA, camB, toB), camC, toC);
	const cam: Cam = plunge > 0 ? lookAt(SLOT[0], SLOT[1] + 2.25, 2.4 * Math.pow(140, plunge)) : camMix(base, lookAt(SLOT[0], SLOT[1] + 2.25, 2.4), pan);

	const postAt = cue(2) + 14; // he posts as the line says "写下数字"
	const look = spring({frame: f - cue(3) - 10, fps, config: {damping: 14}});
	const oxPose = {head: -9 * look, tail: Math.sin(f / 9) * 0.8, breath: 0.5 + 0.5 * Math.sin(f / 22)};
	// the last ticket: from the swarm, into the slot, just ahead of the camera
	const last = prog(f, DIVE - 4, 26, ease.inOut);
	const lx = SLOT[0] + 260 * (1 - last);
	const ly = SLOT[1] - 6 - 230 * (1 - last) - 40 * Math.sin(Math.PI * last);
	const black = prog(f, D - 6, 6);
	return (
		<FullFrame fadeIn={0} fadeOut={0}>
			<OX_DEFS />
			<Fair1906 frame={f + 80} cam={cam} postX={1660} front={<FrontCrowd f={f} />}>
				<TicketSwarm f={f} cx={1050} cy={720} side={-1} emerge={{x: SLOT[0], y: SLOT[1], at: postAt + 20, spread: 110}} />
				<g transform="translate(250,890)">
					<Signboard />
				</g>
				<Queue f={f} who={['clerk06', 'shopgirl']} x0={430} />
				<g transform={`translate(${OX.x},${OX.y}) scale(${OX.s})`}>
					<Ox pose={oxPose} blink={blinkAt(f, 'ox')} lit={0.9} />
				</g>
				<DroverWithRope f={f} x={DROVER_AT.x} y={DROVER_AT.y} s={0.95} ox={{...OX, pose: oxPose}} expression={f > cue(3) ? 'smile' : 'neutral'} />
				<ButcherPosting f={f} t0={postAt} x={POSTER.x} y={POSTER.y} s={POSTER.s} />
				<TicketSwarm f={f} cx={1050} cy={720} side={1} emerge={{x: SLOT[0], y: SLOT[1], at: postAt + 20, spread: 110}} />
				{last > 0 && last < 1 ? (
					<g transform={`translate(${lx},${ly}) rotate(${-90 * last + 30 * (1 - last)}) scale(${0.3 - 0.16 * last})`}>
						<Ticket lod="mid" />
					</g>
				) : null}
			</Fair1906>
			<rect width={W} height={H} fill="#05060b" opacity={black} />
		</FullFrame>
	);
};

// ---------------------------------------------------------------- the title, stamped inside the box

const CHARS = [...`《${EPISODE.title}》`];
const HALF_BEAT = 0.2545;

/**
 * Inside the ballot box. The posted ticket tumbles down through the dark and lands on
 * the heap of guesses on the hit; the title is stamped above it like the sixpenny stamp,
 * one character per half-beat, in brass ink, then fills with gold and catches one gloss.
 * The ticket becomes the gold motif. `hitAt` is the card-local frame of the hit.
 */
const OxTitle: React.FC<{dur: number; hitAt: number}> = ({dur, hitAt}) => {
	const f = useCurrentFrame();
	const fps = 30;
	const stampAt = (i: number) => hitAt + Math.round(i * HALF_BEAT * fps);
	const lastStamp = stampAt(CHARS.length - 1);
	const goldAt = lastStamp + Math.round(2 * HALF_BEAT * fps);
	const out = prog(f, dur - 14, 14, ease.inOut);
	// a stamp shakes the card a little
	let shake = 0;
	for (let i = 0; i < CHARS.length; i++) {
		const k = f - stampAt(i);
		if (k >= 0 && k < 6) shake = Math.max(shake, (i === 0 ? 10 : 4) * Math.exp(-k / 1.6));
	}
	const sx = shake * (random(`tsx${f}`) - 0.5);
	const sy = shake * (random(`tsy${f}`) - 0.5);
	// the ticket falls (gravity), tumbling, and settles on the heap at the hit
	const fall = Math.min(1, Math.max(0, f / hitAt));
	const tx = 960 + 70 * Math.sin(fall * 5) * (1 - fall);
	const ty = -140 + (860 + 140) * fall * fall;
	const settle = f >= hitAt ? spring({frame: f - hitAt, fps, config: {damping: 9, stiffness: 180}}) : 0;
	const rot = f < hitAt ? 160 * (1 - fall) - 6 : -6 + 4 * (1 - settle);
	const flip = f < hitAt ? Math.cos(fall * 9) : 1;
	const motif = prog(f, hitAt + 10, 30, ease.out);
	const size = 132;
	const width = CHARS.length * size * 0.98;
	const gx = (i: number) => W / 2 - width / 2 + (i + 0.5) * (width / CHARS.length);
	const gold = prog(f, goldAt, 10, ease.inOut);
	const gloss = prog(f, goldAt + 14, 26, ease.inOut);
	return (
		<AbsoluteFill style={{opacity: 1 - out}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
				<defs>
					<radialGradient id="box-light" cx="50%" cy="0%" r="75%">
						<stop offset="0" stopColor="#ffcf86" stopOpacity="0.28" />
						<stop offset="0.5" stopColor="#c8913a" stopOpacity="0.07" />
						<stop offset="1" stopColor="#000" stopOpacity="0" />
					</radialGradient>
					<radialGradient id="brand-glow">
						<stop offset="0" stopColor="#ffe7b0" stopOpacity="0.9" />
						<stop offset="0.35" stopColor="#f1c56d" stopOpacity="0.35" />
						<stop offset="1" stopColor="#f1c56d" stopOpacity="0" />
					</radialGradient>
					<linearGradient id="ox-gold" x1="0" y1={470 - size * 0.8} x2="0" y2={470 + size * 0.2} gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#fff3cf" />
						<stop offset="0.45" stopColor="#f3cd7a" />
						<stop offset="0.7" stopColor="#c99140" />
						<stop offset="1" stopColor="#8a5a22" />
					</linearGradient>
					<linearGradient id="ox-gloss" x1={W / 2 - 900 + 1800 * gloss - 140} y1="0" x2={W / 2 - 900 + 1800 * gloss + 140} y2="0" gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#fff" stopOpacity="0" />
						<stop offset="0.5" stopColor="#fff" stopOpacity="0.8" />
						<stop offset="1" stopColor="#fff" stopOpacity="0" />
					</linearGradient>
					<linearGradient id="heap-fade" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#05060b" stopOpacity="0" />
						<stop offset="1" stopColor="#05060b" stopOpacity="0.85" />
					</linearGradient>
					<filter id="ink-rough" x="-10%" y="-10%" width="120%" height="120%">
						<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
						<feDisplacementMap in="SourceGraphic" scale="3" />
					</filter>
				</defs>
				<rect width={W} height={H} fill={JUNO.colors.night} />
				<rect width={W} height={H} fill="url(#box-light)" />
				<g transform={`translate(${sx},${sy})`}>
					{/* the heap of guesses at the bottom of the box */}
					{Array.from({length: 150}, (_, i) => {
						const x = random(`hx${i}`) * 2200 - 140;
						const y = 905 + random(`hy${i}`) * 200 + Math.abs(x - 960) * 0.04;
						const puff = f >= hitAt ? Math.exp(-(f - hitAt) / 8) * (1 - Math.min(1, Math.abs(x - 960) / 500)) * 10 : 0;
						const lum = Math.max(0, 1 - Math.hypot(x - 960, y - 860) / 900);
						return (
							<g key={i} transform={`translate(${x},${y - puff}) rotate(${random(`hr${i}`) * 360}) scale(0.36)`} opacity={0.1 + 0.42 * lum * lum}>
								<rect x={-100} y={-62} width={200} height={124} rx={6} fill={random(`hc${i}`) > 0.5 ? '#6a5c46' : '#55493a'} />
							</g>
						);
					})}
					<rect x={0} y={940} width={W} height={140} fill="url(#heap-fade)" />
					{/* the posted ticket: paper while it falls, then the gold motif */}
					<g transform={`translate(${tx},${ty}) rotate(${rot}) scale(${0.62 * flip},0.62)`} opacity={1 - motif}>
						<Ticket lod="mid" />
					</g>
					<g transform={`translate(960,860) rotate(-2)`} opacity={motif}>
						<TicketMotif p={motif} gold={JUNO.colors.gold} />
					</g>
					{/* stamped title: brass ink, then gold */}
					{CHARS.map((ch, i) => {
						const k = f - stampAt(i);
						if (k < 0) return null;
						const press = k < 3 ? 1.22 - 0.22 * (k / 3) : 1;
						return (
							<g key={i} transform={`translate(${gx(i)},470) scale(${press}) translate(${-gx(i)},-470)`}>
								<text x={gx(i)} y={470} textAnchor="middle" filter="url(#ink-rough)" style={{fontFamily: font.serif, fontWeight: 900, fontSize: size, fill: '#8a6534'}} opacity={1 - gold}>
									{ch}
								</text>
								<text x={gx(i)} y={470} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: size, fill: 'url(#ox-gold)'}} opacity={gold}>
									{ch}
								</text>
								<text x={gx(i)} y={470} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: size, fill: 'url(#ox-gloss)'}} opacity={gold * (gloss > 0 && gloss < 1 ? 1 : 0)}>
									{ch}
								</text>
								{/* ink dust off the stamp */}
								{k < 14
									? Array.from({length: 7}, (_, j) => {
											const a = random(`sd${i}${j}`) * Math.PI;
											const d = k * (3 + random(`sv${i}${j}`) * 5);
											return <circle key={j} cx={gx(i) + Math.cos(a) * d * 1.6 - 0} cy={480 - Math.sin(a) * d * 0.5} r={2} fill="#f1c56d" opacity={0.7 * (1 - k / 14)} />;
										})
									: null}
							</g>
						);
					})}
					<text x={W / 2} y={300} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 600, fontSize: 24, letterSpacing: '0.45em', fill: JUNO.colors.gold}} opacity={0.85 * prog(f, hitAt + 12, 18)}>
						{EPISODE.kicker}
					</text>
					<text x={W / 2} y={600} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 600, fontSize: 40, fill: JUNO.colors.ink, letterSpacing: '0.12em'}} opacity={prog(f, goldAt + 10, 16)}>
						{EPISODE.tagline}
					</text>
					<text x={W / 2} y={646} textAnchor="middle" style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 26, fill: 'rgba(243,237,226,0.55)'}} opacity={prog(f, goldAt + 18, 16)}>
						{EPISODE.taglineEn}
					</text>
					<text x={W / 2} y={712} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 22, letterSpacing: '0.42em', fill: 'rgba(241,197,109,0.75)'}} opacity={prog(f, goldAt + 26, 18)}>
						{`— ${JUNO.credit} · ${JUNO.series} —`}
					</text>
				</g>
			</svg>
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------- 2. the fair (out of the slot)

const Fair: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const tl = useTimeline();
	const hitAt = Math.round((tl.music.markers.hit ?? scene.from) - scene.from);
	const titleLen = cue(0) - 8;
	// the camera comes back out of the slot as the card lifts, then follows the lines
	const outOf = prog(f, titleLen - 14, 40, ease.out);
	const wide = lookAt(900, 650, 1.32);
	const sign = lookAt(470, 700, 1.7);
	const crowd = lookAt(960, 600, 1.08);
	let cam: Cam = lookAt(SLOT[0], SLOT[1] + 2.25, 2.4 * Math.pow(140, 1 - outOf));
	cam = camMix(cam, wide, prog(f, titleLen + 6, 30, ease.inOut));
	cam = camMix(cam, sign, prog(f, cue(0) + 6, 34, ease.inOut));
	cam = camMix(cam, wide, prog(f, cue(1), 34, ease.inOut));
	cam = camMix(cam, crowd, prog(f, cue(2), 50, ease.inOut));
	const oxPose = {head: Math.sin(f / 70) * 4, tail: Math.sin(f / 11) * 0.7, breath: 0.5 + 0.5 * Math.sin(f / 22)};
	return (
		<FullFrame
			fadeIn={0}
			fadeOut={10}
			overlay={
				<Sequence durationInFrames={titleLen + 14} layout="none">
					<OxTitle dur={titleLen + 14} hitAt={hitAt} />
				</Sequence>
			}
		>
			<OX_DEFS />
			{/* hidden until the card lifts, so nothing flashes under it */}
			<g opacity={f < titleLen - 14 ? 0 : 1}>
				<Fair1906 frame={f + 560} cam={cam} postX={1660} front={<FrontCrowd f={f + 300} />}>
					<TicketSwarm f={f + 470} cx={1050} cy={720} side={-1} />
					<g transform="translate(250,890)">
						<Signboard />
					</g>
					<Queue f={f} who={['shopgirl', 'farmwife', 'lad']} x0={430} />
					<g transform={`translate(${OX.x},${OX.y}) scale(${OX.s})`}>
						<Ox pose={oxPose} blink={blinkAt(f, 'ox2')} lit={0.9} />
					</g>
					<DroverWithRope f={f + 300} x={DROVER_AT.x} y={DROVER_AT.y} s={0.95} ox={{...OX, pose: oxPose}} expression="smile" />
					{/* the clerk is next: he posts his on the second line */}
					<ButcherPosting f={f} t0={cue(1) + 12} x={POSTER.x} y={POSTER.y} s={POSTER.s} who="clerk06" />
					<TicketSwarm f={f + 470} cx={1050} cy={720} side={1} />
				</Fair1906>
			</g>
		</FullFrame>
	);
};

export const scenes: SceneMap = {Hook, Fair};
