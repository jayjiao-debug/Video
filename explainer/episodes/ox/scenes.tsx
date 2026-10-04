import React from 'react';
import {AbsoluteFill, Sequence, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CAST} from '../../src/art/cast';
import {Figure, POSES, addPose, blinkAt, idle, keyPoses, lerpPose, walkPose, type Pose} from '../../src/art/Figure';
import {BOX_PLATE, BallotBox, OX_DEFS, OX_PATHS, Ox, Signboard, Ticket, TicketMotif} from '../../src/art/Ox';
import {getLength, getPointAtLength} from '@remotion/paths';
import {EndCard} from '../../src/brand/Brand';
import {camPath, camSpeed, type CamKey} from '../../src/art/camera';
import {lookAt, type Cam} from '../../src/art/sets/Airfield';
import {Fair1906} from '../../src/art/sets/Fair1906';
import {JUNO} from '../../src/brand/identity';
import {FullFrame, camMix} from '../../src/components/FullFrame';
import {ease, prog, useCue, useScene, useSnapBeat, useTimeline} from '../../src/lib/context';
import {font} from '../../src/lib/theme';
import {P} from '../../src/art/palette';
import type {SceneMap, SceneProps} from '../../src/lib/types';
import {BUTCHER, ButcherPosting, DroverWithRope, GALTON, slotFor} from './acting';
import {BeanMachine, DeskTop, LAB, LabZurich, OfficialCard, TOP, TicketBack, TicketSwarm} from './art';
import {GUESSES, MEDIAN_INDEX, SPREAD} from './guesses';
import {DESK_Y, BOARD_AT, Study1906} from '../../src/art/sets/Study1906';
import {BRAND, EPISODE} from './brand';

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
					pose={addPose(i === 0 ? BUTCHER.read : k === 'galton' ? GALTON.stand : POSES.stand, idle(f, `q${k}`))}
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
	// gold pours up into the stamped letters (bottom to top), with a bloom behind them
	const pour = prog(f, goldAt, 12, ease.inOut);
	const gold = pour;
	const bloom = f >= goldAt ? 0.3 + 0.7 * Math.exp(-(f - goldAt) / 10) : 0;
	const gloss = prog(f, goldAt + 16, 26, ease.inOut);
	// the card arrives as a slow push that settles by the time the title is stamped
	const push = 1 + 0.1 * (1 - prog(f, 0, hitAt + 26, ease.out));
	// the landing: light flares where the ticket hits the heap
	const land = f >= hitAt ? Math.exp(-(f - hitAt) / 7) : 0;
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
					<clipPath id="gold-pour">
						<rect x={0} y={470 + 40 - (size + 60) * pour} width={W} height={size + 80} />
					</clipPath>
					<radialGradient id="title-bloom">
						<stop offset="0" stopColor="#ffe7b0" stopOpacity="0.55" />
						<stop offset="0.45" stopColor="#f1c56d" stopOpacity="0.18" />
						<stop offset="1" stopColor="#f1c56d" stopOpacity="0" />
					</radialGradient>
					<filter id="ink-rough" x="-10%" y="-10%" width="120%" height="120%">
						<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
						<feDisplacementMap in="SourceGraphic" scale="3" />
					</filter>
				</defs>
				<rect width={W} height={H} fill={JUNO.colors.night} />
				<rect width={W} height={H} fill="url(#box-light)" opacity={1 + 1.2 * land} />
				<g transform={`translate(${sx},${sy}) translate(960,540) scale(${push}) translate(-960,-540)`}>
					<ellipse cx={960} cy={880} rx={520} ry={200} fill="url(#title-bloom)" opacity={1.6 * land} />
					<ellipse cx={960} cy={440} rx={640} ry={170} fill="url(#title-bloom)" opacity={bloom} />
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
					{f >= hitAt && f < hitAt + 44
						? Array.from({length: 26}, (_, i) => {
								const t = f - hitAt;
								const vx = (random(`bx${i}`) - 0.5) * 22;
								const vy = -(10 + random(`by${i}`) * 14);
								const x = 960 + (random(`b0${i}`) - 0.5) * 160 + vx * t;
								const y = 900 + vy * t + 0.75 * t * t;
								if (y > 1000) return null;
								return (
									<g key={i} transform={`translate(${x},${y}) rotate(${random(`br${i}`) * 360 + t * (random(`bs${i}`) - 0.5) * 30}) scale(0.3)`} opacity={0.85}>
										<rect x={-100} y={-62} width={200} height={124} rx={6} fill={random(`bc${i}`) > 0.5 ? '#c9b48a' : '#9a8762'} />
									</g>
								);
							})
						: null}
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
						const press = k < 3 ? 1.9 - 0.9 * (k / 3) : k < 6 ? 1 - 0.04 * Math.sin(((k - 3) / 3) * Math.PI) : 1;
						return (
							<g key={i} transform={`translate(${gx(i)},470) scale(${press}) translate(${-gx(i)},-470)`}>
								<text x={gx(i)} y={470} textAnchor="middle" filter="url(#ink-rough)" style={{fontFamily: font.serif, fontWeight: 900, fontSize: size, fill: '#8a6534'}} opacity={k < 1 ? 0.5 : 1 - 0.6 * gold}>
									{ch}
								</text>
								<text x={gx(i)} y={470} textAnchor="middle" clipPath="url(#gold-pour)" style={{fontFamily: font.serif, fontWeight: 900, fontSize: size, fill: 'url(#ox-gold)'}} opacity={gold > 0 ? 1 : 0}>
									{ch}
								</text>
								<text x={gx(i)} y={470} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: size, fill: 'url(#ox-gloss)'}} opacity={gold * (gloss > 0 && gloss < 1 ? 1 : 0)}>
									{ch}
								</text>
								{/* ink dust off the stamp */}
								{k < 16
									? Array.from({length: 14}, (_, j) => {
											const a = random(`sd${i}${j}`) * Math.PI * 2;
											const d = k * (4 + random(`sv${i}${j}`) * 7) * Math.exp(-k / 12);
											return <circle key={j} cx={gx(i) + Math.cos(a) * d * 1.7} cy={440 + Math.sin(a) * d * 0.8} r={1.5 + random(`sz${i}${j}`) * 2.5} fill={j % 3 ? '#8a6534' : '#f1c56d'} opacity={0.85 * (1 - k / 16)} />;
										})
									: null}
							</g>
						);
					})}
					<text x={W / 2} y={300} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 600, fontSize: 24, letterSpacing: '0.45em', fill: JUNO.colors.gold}} opacity={0.85 * prog(f, hitAt + 12, 18)}>
						{EPISODE.kicker}
					</text>
					<text x={W / 2} y={600 + 14 * (1 - prog(f, goldAt + 10, 16))} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 600, fontSize: 40, fill: JUNO.colors.ink, letterSpacing: '0.12em'}} opacity={prog(f, goldAt + 10, 16)}>
						{EPISODE.tagline}
					</text>
					<text x={W / 2} y={646 + 14 * (1 - prog(f, goldAt + 18, 16))} textAnchor="middle" style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 26, fill: 'rgba(243,237,226,0.55)'}} opacity={prog(f, goldAt + 18, 16)}>
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
	const A = f + scene.from; // one clock for the whole show ground, so nothing jumps across a cut
	const oxPose = {head: Math.sin(A / 70) * 4, tail: Math.sin(A / 11) * 0.7, breath: 0.5 + 0.5 * Math.sin(A / 22)};
	return (
		<FullFrame
			fadeIn={0}
			fadeOut={0}
			overlay={
				<Sequence durationInFrames={titleLen + 14} layout="none">
					<OxTitle dur={titleLen + 14} hitAt={hitAt} />
				</Sequence>
			}
		>
			<OX_DEFS />
			{/* hidden until the card lifts, so nothing flashes under it */}
			<g opacity={f < titleLen - 14 ? 0 : 1}>
				<Fair1906 frame={A + 92} cam={cam} postX={1660} front={<FrontCrowd f={A - 168} />}>
					<g transform="translate(250,890)">
						<Signboard />
					</g>
					<Queue f={A - 468} who={['shopgirl', 'farmwife', 'galton']} x0={430} />
					<g transform={`translate(${OX.x},${OX.y}) scale(${OX.s})`}>
						<Ox pose={oxPose} blink={blinkAt(A, 'oxg')} lit={0.9} />
					</g>
					<DroverWithRope f={A - 168} x={DROVER_AT.x} y={DROVER_AT.y} s={0.95} ox={{...OX, pose: oxPose}} expression="smile" />
					{/* the clerk is next: he posts his on the second line */}
					<ButcherPosting f={f} t0={cue(1) + 12} x={POSTER.x} y={POSTER.y} s={POSTER.s} who="clerk06" />
				</Fair1906>
			</g>
		</FullFrame>
	);
};


// ---------------------------------------------------------------- 3. Galton (in the queue → the show is over → he carries the box off)

const BOX_BASE = {x: SLOT[0], y: SLOT[1] + 195 * 0.9}; // the trestle's feet
const P_ = (p: Partial<Pose>): Pose => ({...POSES.stand, ...p});
// arm angles solved for the box (fk solve; checked against CMU 26_10 bend-and-lift, frames 24–40 and 104–120)
const GB = {
	stand: P_({lean: 0, head: 6, armNear: [6, 12], armFar: [-4, 14]}),
	reach: P_({lean: 14, head: 14, armNear: [20, 30], armFar: [30, 10], legNear: [8, 10], legFar: [-2, 8]}),
	grip: P_({lean: 36, head: 18, armNear: [7, 52], armFar: [41, 1], legNear: [12, 16], legFar: [2, 12], drop: 6}),
	lift: P_({lean: -6, head: 2, armNear: [-15, 82], armFar: [1, 70]}),
	hold: P_({lean: -4, head: 0, armNear: [-15, 78], armFar: [1, 66]}),
};

const Galton: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const snap = useSnapBeat();
	const D = scene.duration;
	const A = f + scene.from;
	// the show is over: a time cut on the beat nearest the third line
	const CUT = snap(cue(2) - 2);
	const k = f - CUT;
	const night = f >= CUT;
	// --- before the cut: find him at the back of the queue; he strokes his whiskers, unconvinced
	const gIdle = idle(A - 468, 'qgalton');
	const chin = keyPoses(f - cue(1), [
		[0, GALTON.stand],
		[6, P_({...GALTON.stand, lean: -2, armFar: [-10, 20]})],
		[16, GALTON.chin],
	]);
	const shake = f > cue(1) + 22 ? 5 * Math.sin((f - cue(1) - 22) / 4) * Math.exp(-(f - cue(1) - 22) / 30) : 0;
	const galtonA = addPose({...chin, head: chin.head + shake}, gIdle, 1 - 0.5 * prog(f, cue(1), 10));
	// --- after the cut: he lifts the box off its trestle and carries it off toward us
	const lifted = k >= 22;
	const carry = Math.max(0, k - 40);
	const pick = keyPoses(k, [
		[0, GB.stand],
		[8, GB.reach],
		[16, GB.grip],
		[22, GB.grip],
		[34, GB.lift],
		[40, GB.hold],
	]);
	const walking = carry > 0;
	const wp = walkPose(carry * 0.26, 0.8);
	const galtonB = walking ? {...GB.hold, lean: wp.lean - 4, legNear: wp.legNear, legFar: wp.legFar, lift: wp.lift} : addPose(pick, idle(f, 'gb'), 0.3);
	const tWalk = Math.min(1, carry / Math.max(1, D - CUT - 40));
	const gx = night ? POSTER.x + 430 * tWalk : 240;
	const gy = night ? POSTER.y + 120 * tWalk : POSTER.y - 14;
	const gs = night ? 0.95 + 0.25 * tWalk : 0.9;
	// the box: on its trestle until he lifts it, then in front of his belly
	const hand = (() => {
		// near hand grip, in scene space (Galton faces right, no flip)
		const pose = galtonB;
		const a = pose.armNear;
		const r = (d: number) => (d * Math.PI) / 180;
		const sx = 14 + Math.sin(r(a[0])) * 58 + Math.sin(r(a[0] + a[1])) * 68;
		const sy = -258 + Math.cos(r(a[0])) * 58 + Math.cos(r(a[0] + a[1])) * 68;
		const hy = -150;
		const L = r(pose.lean);
		const x = sx * Math.cos(L) - (sy - hy) * Math.sin(L);
		const y = hy + sx * Math.sin(L) + (sy - hy) * Math.cos(L);
		return [gx + x * gs, gy + y * gs];
	})();
	const liftT = prog(k, 22, 14, ease.inOut);
	const boxOnStand = {x: BOX_BASE.x, y: BOX_BASE.y - 98 * 0.9};
	const boxInHands = {x: hand[0] + 34 * gs, y: hand[1] + 40 * gs};
	const box = lifted ? {x: boxOnStand.x + (boxInHands.x - boxOnStand.x) * liftT, y: boxOnStand.y + (boxInHands.y - boxOnStand.y) * liftT} : boxOnStand;
	const boxS = lifted ? 0.9 + (gs * 0.95 - 0.9) * liftT : 0.9;
	const plate = {x: box.x + BOX_PLATE.x * boxS, y: box.y + (BOX_PLATE.y + 98) * boxS};
	// camera: one path; the night part ends pushed into the brass plate (the next scene opens on it)
	const keys: CamKey[] = night
		? [
				[CUT, 620, 720, 1.55],
				[CUT + 40, 700, 740, 1.6],
				[D - 26, plate.x, plate.y, 2.2],
				[D, plate.x, plate.y, 9],
			]
		: [
				[0, 960, 600, 1.08],
				[cue(0) + 24, 330, 690, 1.75],
				[cue(1) + 10, 270, 680, 2.05],
				[CUT, 262, 676, 2.12],
			];
	// the plate key must follow the box as it moves: re-aim the last two keys each frame
	const cam = camPath(keys, f);
	const oxPose = {head: Math.sin(A / 70) * 4, tail: Math.sin(A / 11) * 0.7, breath: 0.5 + 0.5 * Math.sin(A / 22)};
	return (
		<FullFrame fadeIn={0} fadeOut={0}>
			<OX_DEFS />
			<Fair1906 frame={A + 92} cam={cam} postX={1660} lamp={night ? 0.42 : 1} crowd={!night} front={night ? null : <FrontCrowd f={A - 168} />}>
				<g transform="translate(250,890)">
					<Signboard />
				</g>
				{!night ? (
					<>
						<Queue f={A - 468} who={['shopgirl', 'farmwife']} x0={430} />
						<ButcherPosting f={A - 468} t0={-10000} x={POSTER.x} y={POSTER.y} s={POSTER.s} who="clerk06" box={false} />
					</>
				) : null}
				<g transform={`translate(${OX.x},${OX.y}) scale(${OX.s})`}>
					<Ox pose={oxPose} blink={blinkAt(A, 'oxg')} lit={night ? 0.4 : 0.9} />
				</g>
				<DroverWithRope f={A - 168} x={DROVER_AT.x} y={DROVER_AT.y} s={0.95} ox={{...OX, pose: oxPose}} />
				{/* the trestle stays; the box leaves it */}
				<g transform={`translate(${BOX_BASE.x},${BOX_BASE.y}) scale(0.9)`}>
					<path d="M-60,0 L-48,-90 M60,0 L48,-90 M-56,-40 L56,-40" stroke="#3a2618" strokeWidth={8} strokeLinecap="round" />
					<rect x={-70} y={-100} width={140} height={14} fill="url(#wood)" />
				</g>
				<g transform={`translate(${gx},${gy}) scale(${gs})`}>
					<Figure
						look={CAST.galton}
						pose={night ? galtonB : galtonA}
						hands={night ? {near: k >= 14 ? 'grip' : 'relaxed', far: k >= 14 ? 'grip' : 'relaxed'} : {far: 'relaxed'}}
						rim="warm"
						blink={blinkAt(f, 'galton')}
						expression={night ? 'neutral' : f > cue(1) ? 'stern' : 'neutral'}
					/>
				</g>
				<g transform={`translate(${box.x},${box.y}) scale(${boxS})`}>
					<BallotBox stand={false} lit={night ? 0.9 : 0.6} />
				</g>
			</Fair1906>
		</FullFrame>
	);
};

// ---------------------------------------------------------------- the study: elevation ↔ top view through the lamp

const NUM = {fontVariantNumeric: 'lining-nums' as const};
/** the box on Galton's desk (elevation): its plate is where the fair's last shot pushed in */
const DESK_BOX = {x: 520, y: DESK_Y};
const DESK_PLATE = {x: DESK_BOX.x, y: DESK_BOX.y + (BOX_PLATE.y + 98) * 0.9};
const LAMP_GLOBE = {x: 1300, y: DESK_Y + 6 - 150};

/** A card on the desk seen from above, its guess written in. */
const DeskCard: React.FC<{i: number; x: number; y: number; r: number; s?: number; o?: number; ring?: number}> = ({i, x, y, r, s = 0.62, o = 1, ring = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`} opacity={o}>
		<Ticket no={i + 1} name={NAMES[i % NAMES.length]} guess={GUESSES[i]} />
		{ring > 0 ? (
			<ellipse cx={30} cy={34} rx={78} ry={34} fill="none" stroke="#e5484d" strokeWidth={4} strokeDasharray={`${ring * 380} 400`} transform="rotate(-4)" />
		) : null}
	</g>
);
const NAMES = ['J. Hext', 'W. Pengelly', 'T. Rowe', 'M. Coombe', 'R. Luscombe', 'A. Tozer', 'H. Mudge', 'E. Petherick', 'S. Hosking', 'G. Widdicombe'];

const Spread: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const D = scene.duration;
	// elevation: out of the brass plate (the box now sits on his desk), across to the lamp
	const SWAP = 70; // the lamp's globe fills the frame; the top view opens out of it
	const elev = camPath(
		[
			[0, DESK_PLATE.x, DESK_PLATE.y, 11.4],
			[34, 860, 640, 1.35],
			[58, LAMP_GLOBE.x, LAMP_GLOBE.y, 2.6],
			[SWAP + 6, LAMP_GLOBE.x, LAMP_GLOBE.y, 12],
		],
		f,
	);
	const top = camPath(
		[
			[SWAP - 6, TOP.lamp.x, TOP.lamp.y, 10],
			[SWAP + 26, 1250, 420, 1.9],
			[cue(0) + 70, 1180, 520, 2.0],
			[cue(1) + 10, 1010, 600, 1.15],
			[cue(2) + 2, 900, 600, 1.15],
			[cue(2) + 30, (SPREAD[0].x + SPREAD[1].x) / 2, (SPREAD[0].y + SPREAD[1].y) / 2 + 10, 2.3],
			[D, (SPREAD[0].x + SPREAD[1].x) / 2 + 20, (SPREAD[0].y + SPREAD[1].y) / 2 + 10, 2.4],
		],
		f,
	);
	const mix = prog(f, SWAP - 8, 14, ease.inOut);
	// the blank card under the lamp; its weight field cycles (you guess too)
	const roll = f > cue(0) && f < cue(1) ? 980 + Math.floor(random(`roll${Math.floor(f / 5)}`) * 420) : null;
	// dealt by hand: slow at first, quicker as he gets into it, never even (edit-rhythm §2)
	const dealAt = (k: number) => {
		let t = cue(1) + 4;
		for (let j = 0; j < k; j++) t += (3 + 9 * Math.pow(0.84, j)) * (0.85 + 0.3 * random(`deal${j}`));
		return t;
	};
	const dealt = (k: number) => prog(f, dealAt(k), 10, ease.out);
	return (
		<FullFrame fadeIn={0} fadeOut={0}>
			<OX_DEFS />
			<g opacity={1 - mix}>
				<Study1906
					frame={f}
					cam={elev}
					desk={
						<g transform={`translate(${DESK_BOX.x},${DESK_BOX.y}) scale(0.9)`}>
							<BallotBox stand={false} lit={0.9} />
						</g>
					}
				/>
			</g>
			<g opacity={mix}>
				<FlatLayer cam={top}>
					<DeskTop f={f}>
						{/* the blank card, then the others dealt across the desk one by one */}
						<g transform="translate(1180,520) rotate(-3) scale(0.9)" opacity={1 - prog(f, cue(1), 10)}>
							<Ticket no={795} name="" guess={roll ?? ''} write={1} />
						</g>
						{SPREAD.map((c, k) => {
							const d = dealt(k);
							if (d <= 0) return null;
							const ring = c.i === 8 || c.i === 782 ? prog(f, cue(2) + 6 + (c.i === 782 ? 10 : 0), 16) : 0;
							return <DeskCard key={k} i={c.i} x={c.x} y={c.y + 60 * (1 - d)} r={c.r} s={0.62 * (1.12 - 0.12 * d)} o={d} ring={ring} />;
						})}
					</DeskTop>
				</FlatLayer>
			</g>
			<LampBloom f={f} at={SWAP - 1} />
		</FullFrame>
	);
};

/** Warm light filling the frame as the camera passes through the lamp's globe (a light-to-light match). */
const LampBloom: React.FC<{f: number; at: number}> = ({f, at}) => {
	const o = Math.exp(-(((f - at) / 9) ** 2));
	if (o < 0.01) return null;
	return (
		<g>
			<defs>
				<radialGradient id={`bloom${at}`} cx="50%" cy="50%" r="75%">
					<stop offset="0" stopColor="#fff6e0" stopOpacity="1" />
					<stop offset="0.5" stopColor="#ffd9a0" stopOpacity="0.9" />
					<stop offset="1" stopColor="#c98a4a" stopOpacity="0.75" />
				</radialGradient>
			</defs>
			<rect width={1920} height={1080} fill={`url(#bloom${at})`} opacity={0.92 * o} />
		</g>
	);
};

/** One flat layer under a camera (the top view has no parallax). */
const FlatLayer: React.FC<{cam: Cam; children: React.ReactNode}> = ({cam, children}) => (
	<g transform={`translate(${960 - cam.x},${540 - cam.y}) scale(${cam.zoom}) translate(-960,-540)`}>{children}</g>
);

// ---------------------------------------------------------------- the line of 787, and the middle one

const ROW_STEP = 9;
const rowX = (i: number) => 960 + (i - MEDIAN_INDEX) * ROW_STEP;

const Line: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const D = scene.duration;
	const sortStart = cue(0) + 6;
	const sortLen = cue(1) - sortStart - 6;
	// the camera rides along the forming row, then whips to its middle
	const keys: CamKey[] = [
		[0, (SPREAD[0].x + SPREAD[1].x) / 2 + 20, (SPREAD[0].y + SPREAD[1].y) / 2 + 10, 2.4],
		[sortStart + 10, 300, 640, 0.62],
		[sortStart + sortLen * 0.6, 1700, 640, 0.6],
		[cue(1) - 2, 2600, 640, 0.75],
		[cue(1) + 16, 960, 620, 2.1],
		[cue(2), 960, 600, 2.2],
		[D, 960, 560, 2.5],
	];
	const cam = camPath(keys, f);
	const blur = Math.min(14, camSpeed(keys, f) / 9);
	const spreadIdx = new Map(SPREAD.map((c) => [c.i, c]));
	const rise = prog(f, cue(2), 26, ease.out);
	const hl = prog(f, cue(1) + 20, 12) * (1 - rise);
	const hover = f > cue(2) + 26 ? Math.sin((f - cue(2)) / 18) * 3 * (1 - prog(f, D - 10, 8)) : 0;
	// it turns over in the scene's last 6 frames: the face lands on the drop (the next scene's frame 0)
	const flipX = Math.cos(Math.PI * prog(f, D - 7, 7, ease.in));
	return (
		<FullFrame fadeIn={0} fadeOut={0}>
			<OX_DEFS />
			<defs>
				<filter id="whip" x="-10%" y="-10%" width="120%" height="120%">
					<feGaussianBlur stdDeviation={`${blur} 0`} />
				</filter>
			</defs>
			<g filter={blur > 0.6 ? 'url(#whip)' : undefined}>
				<FlatLayer cam={cam}>
					<DeskTop f={f + 500}>
						{GUESSES.map((g, i) => {
							const t = prog(f, sortStart + (i / GUESSES.length) * sortLen, 18, ease.inOut);
							const from = spreadIdx.get(i);
							const sx = from ? from.x : rowX(i) + (random(`fx${i}`) - 0.5) * 900;
							const sy = from ? from.y : random(`fy${i}`) < 0.5 ? -300 - random(`fz${i}`) * 300 : 1400 + random(`fz${i}`) * 300;
							if (!from && t <= 0) return null;
							const x = sx + (rowX(i) - sx) * t;
							const y = sy + (TOP.rowY - sy) * t;
							const r = (from ? from.r : random(`fr${i}`) * 80 - 40) * (1 - t) + 90 * t;
							const s = (from ? 0.62 : 0.5) * (1 - t) + 0.36 * t;
							if (i === MEDIAN_INDEX && rise > 0) return null;
							if (from && t < 0.5) return <DeskCard key={i} i={i} x={x} y={y} r={r} s={s} ring={i === 8 || i === 782 ? 1 - 2 * t : 0} />;
							const mid = i === MEDIAN_INDEX ? hl : 0;
							return (
								<g key={i} transform={`translate(${x},${y - 14 * mid}) rotate(${r}) scale(${s})`} opacity={rise > 0 ? 1 - 0.55 * rise : 1}>
									{mid > 0 ? <circle r={160} fill="url(#lantern-glow)" opacity={0.8 * mid} /> : null}
									<Ticket lod="mid" />
								</g>
							);
						})}
						{rise > 0 ? (
							<g transform={`translate(960,${TOP.rowY - 80 * rise}) rotate(${90 - 90 * rise + hover}) scale(${(0.36 + 0.8 * rise) * flipX},${0.36 + 0.8 * rise})`}>
								<ellipse cx={14} cy={26 + 30 * rise} rx={110} ry={70} fill="#000" opacity={0.25 + 0.2 * rise} filter="url(#blur-md)" />
								{flipX >= 0 ? <TicketBack no={MEDIAN_INDEX + 1} /> : <g transform="scale(-1,1)"><Ticket no={MEDIAN_INDEX + 1} name="W. Pengelly" guess={GUESSES[MEDIAN_INDEX]} /></g>}
							</g>
						) : null}
					</DeskTop>
				</FlatLayer>
			</g>
			{/* a counter rides with the row as it forms: how many are in line */}
			<text
				x={960}
				y={170}
				textAnchor="middle"
				style={{...NUM, fontFamily: font.latin, fontWeight: 600, fontSize: 40, letterSpacing: '0.2em', fill: '#efe6d2'}}
				opacity={prog(f, sortStart, 10) * (1 - prog(f, cue(1) + 4, 10))}
			>
				{`${Math.min(787, Math.max(1, Math.round(prog(f, sortStart, sortLen + 18, (x) => x) * 787)))} / 787`}
			</text>
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 6. the reveal (on the drop)

const RV = {ticket: {x: 960, y: TOP.rowY - 80, s: 1.16}};

const Reveal: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const D = scene.duration;
	// the impact: the card's face lands on the drop
	const shake = Math.exp(-f / 3.5) * 14;
	const sx = shake * (random(`rx${f}`) - 0.5);
	const sy = shake * (random(`ry${f}`) - 0.5);
	const flare = Math.exp(-f / 9);
	// the drop's second hit (82.17 s): the handwritten 1207 lights up gold
	const tlm = useTimeline().music.markers;
	const d2 = Math.round((tlm.drop2 ?? scene.from + 24) - scene.from);
	const gold2 = prog(f, d2 - 1, 4);
	const pop2 = f >= d2 ? Math.exp(-(f - d2) / 6) : 0;
	// layout: the card moves left as the show's card slides in; the notebook rises later
	const apart = prog(f, cue(1) - 4, 24, ease.inOut);
	const tk = {x: RV.ticket.x - 330 * apart, y: RV.ticket.y + 100 * apart, s: RV.ticket.s + 0.5 * apart};
	const card = {x: 2600 - (2600 - 1320) * prog(f, cue(1) + 2, 22, ease.out), y: 640, s: 0.95};
	const book = {x: 1050, y: 1500 - (1500 - 1000) * prog(f, cue(3) - 2, 24, ease.out)};
	const bracket = prog(f, cue(2) + 4, 18, ease.inOut);
	const SWAP = cue(4) - 8; // back up through the lamp to Galton at his desk
	const keys: CamKey[] = [
		[0, 960, 560, 2.3],
		[cue(0) + 20, 960, 556, 2.5],
		[cue(1) - 4, 960, 556, 2.5],
		[cue(1) + 24, 1000, 620, 1.45],
		[cue(3) - 6, 1000, 640, 1.45],
		[cue(3) + 22, 1010, 760, 1.3],
		[SWAP - 14, 1010, 760, 1.3],
		[SWAP + 8, TOP.lamp.x, TOP.lamp.y, 9],
	];
	const cam = camPath(keys, f);
	const toElev = prog(f, SWAP - 4, 12, ease.inOut);
	const elev = camPath(
		[
			[SWAP, LAMP_GLOBE.x, LAMP_GLOBE.y, 12],
			[SWAP + 26, 1060, 520, 2.0],
			[D, 1040, 520, 2.1],
		],
		f,
	);
	// Galton reading what he has written: stern → surprised → a small smile
	const g = f - SWAP;
	const READ = P_({lean: 1, head: 12, armNear: [10, 86], armFar: [12, 96], wristNear: 28, wristFar: 24});
	const readPose = addPose(READ, idle(f, 'g-read'), 0.6);
	const face = g < 34 ? 'stern' : g < 70 ? 'surprise' : 'smile';
	const lift = g >= 34 && g < 70 ? -6 * Math.sin(((g - 34) / 36) * Math.PI) : 0;
	const mean = f < cue(3) + 22 ? null : f < cue(3) + 40 ? 1150 + Math.floor(random(`mn${Math.floor(f / 3)}`) * 90) : 1197;
	return (
		<FullFrame fadeIn={0} fadeOut={0}>
			<OX_DEFS />
			<g opacity={1 - toElev} transform={`translate(${sx},${sy})`}>
				<FlatLayer cam={cam}>
					<DeskTop f={f + 900} flare={flare}>
						{/* the row, dimmed, with a jolt on the impact */}
						{GUESSES.map((_, i) =>
							i === MEDIAN_INDEX ? null : (
								<g key={i} transform={`translate(${rowX(i)},${TOP.rowY - Math.max(0, 1 - Math.abs(i - MEDIAN_INDEX) / 30) * 14 * Math.exp(-f / 5)}) rotate(90) scale(0.36)`} opacity={0.45}>
									<Ticket lod="mid" />
								</g>
							),
						)}
						<g transform={`translate(${book.x},${book.y}) rotate(-2)`}>
							<rect x={-330} y={-170} width={660} height={340} rx={6} fill="#000" opacity={0.35} transform="translate(12,14)" />
							<rect x={-330} y={-170} width={660} height={340} rx={6} fill="#efe6d2" />
							<line x1={0} y1={-170} x2={0} y2={170} stroke="#b9ab8a" strokeWidth={3} />
							{Array.from({length: 9}, (_, k) => (
								<line key={k} x1={-310} y1={-120 + k * 34} x2={310} y2={-120 + k * 34} stroke="#9fb4c8" strokeOpacity={0.5} />
							))}
							<g style={{...NUM, fontFamily: font.latinItalic, fontStyle: 'italic', fill: P.ink}}>
								<text x={-290} y={-80} style={{fontSize: 30}}>787 cards</text>
								<text x={-290} y={-12} style={{fontSize: 30}}>middlemost: 1207</text>
								<text x={30} y={-80} style={{fontSize: 30}}>mean of all</text>
								<text x={30} y={10} style={{fontSize: 64, fontWeight: 700, fill: mean === 1197 ? '#6a4310' : P.ink}}>
									{mean ?? ''}
								</text>
								{mean === 1197 ? <text x={200} y={10} style={{fontSize: 30}}>lbs.</text> : null}
							</g>
							{mean === 1197 ? <path d="M28,24 L260,24" stroke="#f1c56d" strokeWidth={5} strokeLinecap="round" strokeDasharray={240} strokeDashoffset={240 * (1 - prog(f, cue(3) + 40, 10))} /> : null}
						</g>
						<g transform={`translate(${card.x},${card.y}) scale(${card.s})`}>
							<OfficialCard write={prog(f, cue(1) + 20, 8)} />
						</g>
						<g transform={`translate(${tk.x},${tk.y}) scale(${tk.s})`}>
							<ellipse cx={14} cy={56} rx={110} ry={70} fill="#000" opacity={0.4} filter="url(#blur-md)" />
							<circle cx={30} cy={34} r={140} fill="url(#lantern-glow)" opacity={0.5 * flare} />
							<Ticket no={MEDIAN_INDEX + 1} name="W. Pengelly" guess={GUESSES[MEDIAN_INDEX]} glow={gold2} />
							{gold2 > 0 ? <circle cx={20} cy={40} r={60 + 90 * pop2} fill="url(#lantern-glow)" opacity={0.9 * pop2} /> : null}
						</g>
						{/* 9 lbs apart: a gold bracket between the two numbers */}
						{bracket > 0 ? (
							<g opacity={bracket}>
								<path
									d={`M${tk.x + 40 * tk.s},${tk.y - 70 * tk.s} C${tk.x + 140},${tk.y - 260} ${card.x - 200},${card.y - 270} ${card.x - 40},${card.y - 130}`}
									fill="none"
									stroke="#f1c56d"
									strokeWidth={4}
									strokeDasharray={900}
									strokeDashoffset={900 * (1 - bracket)}
								/>
								<text x={(tk.x + card.x) / 2 + 10} y={tk.y - 236} textAnchor="middle" style={{...NUM, fontFamily: font.latin, fontWeight: 700, fontSize: 44, fill: '#f1c56d'}}>
									9 lbs · 0.8%
								</text>
							</g>
						) : null}
					</DeskTop>
				</FlatLayer>
			</g>
			{toElev > 0 ? (
				<g opacity={toElev}>
					<Study1906
						frame={f + 300}
						cam={elev}
						behind={
							<g transform={`translate(1000,${DESK_Y + 200 + lift}) scale(1.4)`}>
								<Figure
									look={CAST.galton}
									pose={readPose}
									hands={{near: 'pinch', far: 'pinch'}}
									expression={face}
									blink={blinkAt(f, 'gr')}
									rim="warm"
									shadow={false}
									holdNear={
										<g transform="rotate(-6)">
											<rect x={-4} y={-92} width={84} height={108} fill="#efe6d2" stroke="#b9ab8a" />
											<text x={38} y={-70} textAnchor="middle" style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontWeight: 700, fontSize: 13, fill: P.ink}}>
												Vox Populi
											</text>
											{Array.from({length: 6}, (_, k) => (
												<line key={k} x1={6} y1={-54 + k * 10} x2={72 - (k % 3) * 9} y2={-54 + k * 10} stroke={P.ink} strokeOpacity={0.45} strokeWidth={1.6} />
											))}
										</g>
									}
								/>
							</g>
						}
						desk={
							<g transform={`translate(${DESK_BOX.x},${DESK_BOX.y}) scale(0.9)`}>
								<BallotBox stand={false} lit={0.9} />
							</g>
						}
					/>
				</g>
			) : null}
			<LampBloom f={f} at={SWAP + 1} />
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 7. the name: Galton's own bean machine

/** camera target on the hero plane that centres a point on the back-wall layer (depth d) */
const wallAim = (wx: number, wy: number, d = BOARD_AT.depth) => [960 + (wx - 960) / d, 540 + (wy - 540) / d] as const;
const BOARD_C = wallAim(BOARD_AT.x, BOARD_AT.y - 150);

const Why: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const tl = useTimeline();
	const D = scene.duration;
	const hit = Math.round(tl.music.hits?.find(([t, s]) => s > 0.85 && t >= scene.from - 2)?.[0] ?? scene.from + 15) - scene.from;
	const keys: CamKey[] = [
		[0, 1040, 520, 2.1],
		[hit - 6, BOARD_C[0], BOARD_C[1], 4.2],
		[cue(1), BOARD_C[0], BOARD_C[1] + 6, 4.4],
		[D, BOARD_C[0], BOARD_C[1] + 6, 4.5],
	];
	const cam = camPath(keys, f);
	const blur = Math.min(16, camSpeed(keys, f) / 8);
	const glow = prog(f, cue(1) + 50, 20);
	const meet = prog(f, cue(1) + 6, 30, ease.inOut);
	return (
		<FullFrame fadeIn={0} fadeOut={0}>
			<OX_DEFS />
			<defs>
				<filter id="whip2" x="-10%" y="-10%" width="120%" height="120%">
					<feGaussianBlur stdDeviation={`${blur} 0`} />
				</filter>
			</defs>
			<g filter={blur > 0.6 ? 'url(#whip2)' : undefined}>
				<Study1906
					frame={f + 600}
					cam={cam}
					boardNode={<BeanMachine f={f} start={hit} every={3} n={80} glow={glow} />}
					behind={
						<g transform={`translate(1000,${DESK_Y + 200}) scale(1.4)`}>
							<Figure look={CAST.galton} pose={addPose(P_({lean: 1, head: -4, armNear: [10, 86], armFar: [12, 96]}), idle(f, 'gw'))} hands={{near: 'pinch', far: 'pinch'}} expression="smile" blink={blinkAt(f, 'gw')} rim="warm" shadow={false} />
						</g>
					}
				/>
			</g>
			{/* the misses from both sides meet in the middle */}
			{f > cue(1) + 6 ? (
				<g opacity={prog(f, cue(1) + 6, 14) * (1 - prog(f, D - 10, 10))} stroke="#efe6d2" strokeWidth={4} fill="none" strokeLinecap="round">
					<path d={`M${960 - 330},${560} L${960 - 60 - 120 * (1 - meet)},${560}`} />
					<path d={`M${960 - 90 - 120 * (1 - meet)},${545} l20,15 l-20,15`} />
					<path d={`M${960 + 330},${560} L${960 + 60 + 120 * (1 - meet)},${560}`} />
					<path d={`M${960 + 90 + 120 * (1 - meet)},${545} l-20,15 l20,15`} />
				</g>
			) : null}
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 7b. the condition, then Zurich 2011

const OTHERS = [-108, -86, -60, -44, -20, 6, 22, 38, 64, 82, 100, 116];
const OWN = [-60, 22, 100, -86];
const TYPED = ['420', '180', '960', '260'];
const TRUTH_X = -40;

/** One lab monitor's content (screen-centred, LAB.w × LAB.h). */
const LabScreen: React.FC<{i: number; f: number; on: number; social: number; converge: number; sure: number; round: number; truth: number; ring: number}> = ({i, f, on, social, converge, sure, round, truth, ring}) => {
	const W2 = LAB.w / 2;
	const H2 = LAB.h / 2;
	const dot = (x: number, k: number) => x + (44 + ((k * 37) % 21) - 10 - x) * converge;
	const typed = TYPED[i].slice(0, Math.max(0, Math.min(TYPED[i].length, Math.floor((f - (on > 0 ? 0 : 99999)) / 1))));
	return (
		<g opacity={on}>
			<rect x={-W2} y={-H2} width={LAB.w} height={22} fill="#2f4a6e" />
			<text x={-W2 + 10} y={-H2 + 16} style={{...NUM, fontFamily: font.sans, fontSize: 13, fill: '#e9eef5', letterSpacing: '0.1em'}}>
				{`ROUND ${round} / 5`}
			</text>
			<text x={-W2 + 14} y={-H2 + 48} style={{fontFamily: font.sans, fontSize: 13, fill: '#5a6474'}}>
				your estimate
			</text>
			<rect x={-W2 + 14} y={-H2 + 56} width={120} height={30} fill="#fff" stroke="#9aa4b5" />
			<text x={-W2 + 22} y={-H2 + 78} style={{...NUM, fontFamily: font.sans, fontWeight: 600, fontSize: 20, fill: '#1d2330'}}>
				{typed}
			</text>
			{social > 0 ? (
				<g opacity={social}>
					<text x={-W2 + 14} y={10} style={{fontFamily: font.sans, fontSize: 12, fill: '#5a6474'}}>
						everyone's estimates
					</text>
					<line x1={-125} y1={44} x2={125} y2={44} stroke="#9aa4b5" strokeWidth={2} />
					{OTHERS.map((x, k) => (
						<circle key={k} cx={dot(x, k)} cy={44} r={5} fill="#5f7aa3" opacity={0.85} />
					))}
					<circle cx={dot(OWN[i], OTHERS.indexOf(OWN[i]))} cy={44} r={7} fill="none" stroke="#1d2330" strokeWidth={2.5} />
					{truth > 0 ? <line x1={TRUTH_X} y1={30} x2={TRUTH_X} y2={58} stroke="#c8913a" strokeWidth={4} opacity={truth} /> : null}
					{ring > 0 ? <ellipse cx={44} cy={44} rx={34} ry={16} fill="none" stroke="#e5484d" strokeWidth={3} strokeDasharray={`${ring * 170} 200`} /> : null}
				</g>
			) : null}
			{sure > 0 ? (
				<g opacity={Math.min(1, sure * 3)}>
					<text x={-W2 + 14} y={H2 - 14} style={{fontFamily: font.sans, fontSize: 12, fill: '#5a6474'}}>
						how sure?
					</text>
					<rect x={-40} y={H2 - 26} width={150} height={12} fill="#d5dbe4" />
					<rect x={-40} y={H2 - 26} width={150 * (0.35 + 0.55 * sure)} height={12} fill="#e5484d" />
				</g>
			) : null}
		</g>
	);
};

const STUDENTS: (keyof typeof CAST)[] = ['coworker', 'officegirl', 'commuter', 'economist'];

const Zurich: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const D = scene.duration;
	// part A: the full bell; one gold bead falls on its own, on the accent
	const glassIn = prog(f, cue(1) - 34, 12, ease.in);
	const study: CamKey[] = [
		[0, BOARD_C[0], BOARD_C[1] + 6, 4.5],
		[cue(0) + 30, BOARD_C[0], BOARD_C[1] - 10, 5.0],
		[cue(1) - 30, BOARD_C[0], BOARD_C[1], 5.0],
		[cue(1) - 6, BOARD_C[0], BOARD_C[1] - 30, 22],
	];
	const toLab = prog(f, cue(1) - 12, 12, ease.inOut);
	const S = LAB.screens[1];
	const lab: CamKey[] = [
		[cue(1) - 12, S.x, S.y, 7],
		[cue(1) + 44, 960, 560, 1.12],
		[cue(2) + 8, 960, 545, 1.2],
		[cue(3) + 10, 960, 540, 1.38],
		[cue(4) + 14, 960, 600, 1.16],
		[D - 16, 960, 600, 1.14],
		[D, LAB.screens[2].x, LAB.screens[2].y, 6.5],
	];
	const on = prog(f, cue(1) - 2, 14);
	const social = prog(f, cue(2) + 4, 14);
	const converge = prog(f, cue(3) - 10, 44, ease.inOut);
	const round = f < cue(2) ? 1 : f < cue(3) - 10 ? 2 : f < cue(3) + 6 ? 3 : f < cue(3) + 22 ? 4 : 5;
	const truth = prog(f, cue(3) + 10, 12);
	const ring = prog(f, cue(3) + 36, 14);
	const sure = prog(f, cue(4) + 2, 40, ease.inOut);
	// students: hunched over the keyboards, then sitting back, sure of themselves
	const sit = (k: number) => {
		const up = prog(f, cue(4) + 6 + k * 5, 18, ease.out);
		return addPose(P_({...POSES.sit, lean: 10 - 16 * up, head: 12 - 18 * up, armNear: [4, 10], armFar: [4, 10]}), idle(f, `st${k}`), 0.6);
	};
	return (
		<FullFrame fadeIn={0} fadeOut={0}>
			<OX_DEFS />
			{toLab < 1 ? (
				<g opacity={1 - toLab}>
					<Study1906
						frame={f + 900}
						cam={camPath(study, f)}
						boardNode={<BeanMachine f={f + 400} start={0} every={2} n={80} glow={1} heroAt={400 + cue(0)} />}
					/>
					<rect width={1920} height={1080} fill="#0b0d12" opacity={glassIn} />
				</g>
			) : null}
			{toLab > 0 ? (
				<g opacity={toLab}>
					<LabZurich
						f={f}
						power={on}
						cam={camPath(lab, f)}
						screen={(i) => <LabScreen i={i} f={Math.max(0, f - cue(1) - 20 - i * 6) / 4} on={on} social={social} converge={converge} sure={sure} round={round} truth={truth} ring={ring} />}
						students={
							<g>
								{LAB.screens.map((sc, k) => (
									<g key={k} transform={`translate(${sc.x + (k % 2 ? 14 : -10)},1110) scale(1.25)`}>
										<Figure look={CAST[STUDENTS[k]]} pose={sit(k)} facing="back" rim="cool" shadow={false} />
									</g>
								))}
							</g>
						}
					/>
				</g>
			) : null}
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 8. three takeaways, back at the show

const LANTERN = {x: 1660 - 164, y: 190 + 54 * 1.5};
const LINE_UP: (keyof typeof CAST)[] = ['shopgirl', 'gent', 'lad', 'butcher', 'clerk06'];
const lineX = (k: number) => POSTER.x - 135 * (k + 1);

const Tips: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const D = scene.duration;
	const keys: CamKey[] = [
		[0, LANTERN.x, LANTERN.y, 8],
		[26, 700, 640, 1.35],
		[cue(0) - 4, 300, 690, 1.5],
		[cue(2) + 10, 420, 680, 1.45],
		[D - 18, 640, 660, 1.3],
		[D, 820, 640, 1.2],
	];
	const cam = camPath(keys, f);
	// ③ the loudest voice: the gent shouts, nobody turns; the middle ticket rises out of the box
	const shout = f > cue(2) + 2;
	const shoutPose = keyPoses(f - cue(2), [
		[0, P_({...POSES.stand})],
		[5, P_({lean: -6, head: -8, armNear: [70, 30], armFar: [-4, 16]})],
		[11, P_({lean: 2, head: -14, armNear: [120, 20], armFar: [-6, 18]})],
		[16, P_({lean: 0, head: -12, armNear: [112, 22], armFar: [-6, 18]})],
	]);
	const rise = prog(f, cue(2) + 26, 30, ease.out);
	const A = f + scene.from; // one clock for the whole show ground, so nothing jumps across a cut
	const oxPose = {head: Math.sin(A / 70) * 4, tail: Math.sin(A / 11) * 0.7, breath: 0.5 + 0.5 * Math.sin(A / 22)};
	// the takeaways go up on screen: the scene dims and softens behind them, then comes back
	const dim = prog(f, cue(0) - 10, 12, ease.inOut) * (1 - prog(f, D - 18, 14, ease.inOut));
	return (
		<FullFrame fadeIn={0} fadeOut={0}>
			<OX_DEFS />
			<defs>
				<filter id="tips-soft" x="-5%" y="-5%" width="110%" height="110%">
					<feGaussianBlur stdDeviation={7 * dim} />
				</filter>
			</defs>
			<g filter={dim > 0.02 ? 'url(#tips-soft)' : undefined}>
			<Fair1906 frame={A + 92} cam={cam} postX={1660} front={<FrontCrowd f={A - 168} />}>
				<g transform="translate(250,890)">
					<Signboard />
				</g>
				<g transform={`translate(${OX.x},${OX.y}) scale(${OX.s})`}>
					<Ox pose={oxPose} blink={blinkAt(A, 'oxg')} lit={0.9} />
				</g>
				<DroverWithRope f={A - 168} x={DROVER_AT.x} y={DROVER_AT.y} s={0.95} ox={{...OX, pose: oxPose}} expression="smile" />
				{/* ① each one writes their own, heads down; ② all sorts of people; the front one posts */}
				{LINE_UP.map((who, k) => {
					const loud = who === 'gent' && shout;
					const pose = loud ? addPose(shoutPose, idle(A, 'gent'), 0.3) : addPose(BUTCHER.read, idle(A, `w${who}`));
					return (
						<g key={who} transform={`translate(${lineX(k)},${POSTER.y - 4 - k * 3}) scale(0.92)`}>
							<Figure
								look={CAST[who]}
								pose={pose}
								hands={loud ? {near: 'open'} : {near: 'pinch'}}
								holdNear={
									loud ? undefined : (
										<g transform="rotate(-70) scale(0.13)">
											<Ticket lod="mid" />
										</g>
									)
								}
								expression={loud ? 'surprise' : 'thinking'}
								talk={loud ? 1 : 0}
								rim="warm"
								blink={blinkAt(f, who)}
							/>
							{loud ? (
								<g transform="translate(46,-300)" stroke="#efe6d2" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.8}>
									{[0, 1, 2].map((r) => (
										<path key={r} d={`M${10 + r * 14},${-18 - r * 6} q${10 + r * 4},${18 + r * 6} 0,${36 + r * 12}`} opacity={(Math.sin(f / 3 + r) + 1) / 2} />
									))}
								</g>
							) : null}
						</g>
					);
				})}
				<ButcherPosting f={A} t0={scene.from + cue(1) + 30} x={POSTER.x} y={POSTER.y} s={POSTER.s} who="farmwife" />
				{rise > 0 ? (
					<g transform={`translate(${SLOT[0]},${SLOT[1] - 10 - 190 * rise}) scale(${0.3 + 0.7 * rise})`} opacity={Math.min(1, rise * 2)}>
						<circle r={200} fill="url(#lantern-glow)" opacity={0.8 * rise} />
						<rect x={-92} y={-52} width={184} height={104} rx={8} fill="#05060b" opacity={0.75} />
						<TicketMotif p={rise} gold={JUNO.colors.gold} />
					</g>
				) : null}
			</Fair1906>
			</g>
			<rect width={1920} height={1080} fill="#05060b" opacity={0.66 * dim} />
			<TipCards f={f} cues={[cue(0), cue(1), cue(2)]} out={D - 18} />
		</FullFrame>
	);
};

const TIPS: [string, string][] = [
	['先各自写下答案', '再开口讨论'],
	['多找几个', '背景不同的人'],
	['取中间的数', '别听嗓门最大的'],
];

/** The three takeaways on screen: a header, then one row per line, each landing on its line and then still. */
const TipCards: React.FC<{f: number; cues: number[]; out: number}> = ({f, cues, out}) => {
	const leave = prog(f, out, 12, ease.in);
	const head = prog(f, cues[0] - 8, 14, ease.out);
	if (head <= 0) return null;
	return (
		<g opacity={1 - leave} transform={`translate(0,${-30 * leave})`}>
			<g opacity={head} transform={`translate(0,${16 * (1 - head)})`}>
				<text x={960} y={250} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 52, fill: JUNO.colors.ink, letterSpacing: '0.18em'}}>
					下次一群人做决定
				</text>
				<line x1={960 - 200 * head} y1={286} x2={960 + 200 * head} y2={286} stroke={JUNO.colors.gold} strokeWidth={2} opacity={0.8} />
			</g>
			{TIPS.map(([a, b], i) => {
				const t = f - cues[i] + 2; // the row may lead its subtitle by 2 frames
				if (t < 0) return null;
				const sp = spring({frame: t, fps: 30, config: {damping: 13, stiffness: 140}});
				const y = 410 + i * 150;
				const ring = prog(t, 0, 12, ease.out);
				return (
					<g key={i} opacity={Math.min(1, t / 4)} transform={`translate(${-70 * (1 - sp)},0)`}>
						<circle cx={600} cy={y - 16} r={44} fill="none" stroke={JUNO.colors.gold} strokeWidth={3} strokeDasharray={280} strokeDashoffset={280 * (1 - ring)} />
						<text x={600} y={y + 2} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 52, fill: JUNO.colors.gold, fontVariantNumeric: 'lining-nums'}}>
							{i + 1}
						</text>
						<text x={680} y={y} style={{fontFamily: font.serif, fontWeight: 700, fontSize: 56, fill: JUNO.colors.ink, letterSpacing: '0.06em'}}>
							{a}
							<tspan dx={18} style={{fill: 'rgba(243,237,226,0.62)', fontWeight: 600, fontSize: 44}}>
								{b}
							</tspan>
						</text>
					</g>
				);
			})}
		</g>
	);
};

// ---------------------------------------------------------------- 9. callback: 800 guesses weigh the ox; end card

/** points along the ox's outline (scene space), for the tickets to settle on */
const oxOutline = (n: number) => {
	const pts: [number, number][] = [];
	const add = (d: string, k: number, map: (x: number, y: number) => [number, number]) => {
		const L = getLength(d);
		for (let i = 0; i < k; i++) {
			const p = getPointAtLength(d, (i / k) * L);
			if (p) pts.push(map(p.x, p.y));
		}
	};
	const toScene = (x: number, y: number): [number, number] => [OX.x + x * OX.s, OX.y + y * OX.s];
	const th = (-12 * Math.PI) / 180;
	const head = (x: number, y: number): [number, number] => toScene(240 + 1.3 * (x * Math.cos(th) - y * Math.sin(th)), -252 + 1.3 * (x * Math.sin(th) + y * Math.cos(th)));
	add(OX_PATHS.body, Math.round(n * 0.56), toScene);
	add(OX_PATHS.head, Math.round(n * 0.16), head);
	for (const [d, dx] of [
		[OX_PATHS.front, 0],
		[OX_PATHS.front, -28],
		[OX_PATHS.hind, 0],
		[OX_PATHS.hind, 30],
	] as const)
		add(d, Math.round(n * 0.07), (x, y) => toScene(x + dx, y));
	return pts;
};
const OUTLINE = oxOutline(150);

const Callback: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const D = scene.duration;
	const endAt = cue(2) - 4;
	const keys: CamKey[] = [
		[0, 820, 640, 1.2],
		[cue(0) + 20, 1000, 620, 1.06],
		[cue(1) + 30, 1060, 640, 1.18],
		[D, 1060, 640, 1.22],
	];
	const cam = camPath(keys, f);
	const settle = (i: number) => prog(f, cue(1) + 6 + i * 0.5 + 6 * random(`cj${i}`), 30, ease.inOut);
	const glow = prog(f, cue(1) + 70, 20);
	const A = f + scene.from;
	const oxPose = {head: Math.sin(A / 70) * 4, tail: Math.sin(A / 11) * 0.7, breath: 0.5 + 0.5 * Math.sin(A / 22)};
	return (
		<FullFrame
			fadeIn={0}
			fadeOut={1}
			scrim={0.6}
			overlay={
				<Sequence from={endAt} layout="none">
					<EndCard v={EPISODE} cfg={BRAND} dur={D - endAt} />
				</Sequence>
			}
		>
			<OX_DEFS />
			<Fair1906 frame={A + 92} cam={cam} postX={1660} lamp={1 - 0.35 * glow} front={<FrontCrowd f={A - 168} />}>
				<g transform={`translate(${OX.x},${OX.y}) scale(${OX.s})`}>
					<Ox pose={oxPose} blink={blinkAt(A, 'oxg')} lit={0.9 - 0.4 * glow} />
				</g>
				<DroverWithRope f={A - 168} x={DROVER_AT.x} y={DROVER_AT.y} s={0.95} ox={{...OX, pose: oxPose}} expression="smile" />
				<g transform="translate(250,890)">
					<Signboard />
				</g>
				{LINE_UP.map((who, k) => {
					const calm = prog(f, 0, 16, ease.inOut);
					const shouted = P_({lean: 0, head: -12, armNear: [112, 22], armFar: [-6, 18]});
					const pose = who === 'gent' ? addPose(lerpPose(shouted, BUTCHER.read, calm), idle(A, 'gent'), 0.3 + 0.7 * calm) : addPose(BUTCHER.read, idle(A, `w${who}`));
					return (
						<g key={who} transform={`translate(${lineX(k)},${POSTER.y - 4 - k * 3}) scale(0.92)`}>
							<Figure
								look={CAST[who]}
								pose={pose}
								hands={who === 'gent' && calm < 0.5 ? {near: 'open'} : {near: 'pinch'}}
								holdNear={
									who === 'gent' && calm < 0.5 ? undefined : (
										<g transform="rotate(-70) scale(0.13)">
											<Ticket lod="mid" />
										</g>
									)
								}
								expression={who === 'gent' && calm < 0.5 ? 'surprise' : 'thinking'}
								rim="warm"
								blink={blinkAt(f, who)}
							/>
						</g>
					);
				})}
				<ButcherPosting f={A} t0={-10000} x={POSTER.x} y={POSTER.y} s={POSTER.s} who="farmwife" />
				{f < 14 ? (
					<g transform={`translate(${SLOT[0]},${SLOT[1] - 200}) scale(1)`} opacity={1 - f / 14}>
						<circle r={200} fill="url(#lantern-glow)" opacity={0.8} />
						<rect x={-92} y={-52} width={184} height={104} rx={8} fill="#05060b" opacity={0.75} />
						<TicketMotif p={1} gold={JUNO.colors.gold} />
					</g>
				) : null}
				{/* the guesses come down onto the ox's outline and turn gold */}
				{OUTLINE.map(([x, y], i) => {
					const t = settle(i);
					if (t <= 0) return null;
					// out of the box's slot, up in an arc, down onto the outline
					const sx = SLOT[0];
					const sy = SLOT[1];
					const px = sx + (x - sx) * t;
					const py = sy + (y - sy) * t - (220 + 160 * random(`ch${i}`)) * Math.sin(Math.PI * t);
					return (
						<g key={i} transform={`translate(${px},${py}) rotate(${(1 - t) * 300 * (random(`cs${i}`) - 0.5)}) scale(${0.16 - 0.06 * t})`}>
							<Ticket lod="tiny" tone={t > 0.98 && glow > 0 ? 'gold' : 'paper'} />
							{t > 0.98 ? <circle r={70} fill="url(#lantern-glow)" opacity={0.6 * glow} /> : null}
						</g>
					);
				})}
			</Fair1906>
		</FullFrame>
	);
};

export const scenes: SceneMap = {Hook, Fair, Galton, Spread, Line, Reveal, Why, Zurich, Tips, Callback};
