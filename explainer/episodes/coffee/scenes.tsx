import React from 'react';
import {AbsoluteFill, Sequence, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {noise2D} from '@remotion/noise';
import {CAST} from '../../src/art/cast';
import {Basket, Bean, Bee, Bokeh, Branch, BrassFilterPot, COFFEE_DEFS, CeramicCup, Cherry, CoffeeFlower, CoffeePot18, Leaf, PaperCup, Steam} from '../../src/art/Coffee';
import {Figure, POSES, blinkAt, lerpPose, walkPose, type Pose} from '../../src/art/Figure';
import {Impact} from '../../src/art/fx';
import {P} from '../../src/art/palette';
import {lookAt, type Cam} from '../../src/art/sets/Airfield';
import {CafeStreet} from '../../src/art/sets/CafeStreet';
import {CoffeeHouse} from '../../src/art/sets/CoffeeHouse';
import {Kitchen1908} from '../../src/art/sets/Kitchen1908';
import {Metro} from '../../src/art/sets/Metro';
import {Yunnan} from '../../src/art/sets/Yunnan';
import {EndCard, type BrandCfg, type VideoCfg} from '../../src/brand/Brand';
import {JUNO} from '../../src/brand/identity';
import {FullFrame, camMix} from '../../src/components/FullFrame';
import {T} from '../../src/components/Stage';
import {ease, prog, useCue, useHitFrames, useScene, useSnapBeat} from '../../src/lib/context';
import {color, font} from '../../src/lib/theme';
import type {SceneMap, SceneProps} from '../../src/lib/types';

const W = 1920;
const H = 1080;

const BRAND: BrandCfg = {videos: []};
export const EPISODE: VideoCfg = {
	id: 'coffee',
	src: '',
	title: '续命',
	kicker: 'A CUP OF COFFEE · WHERE IT CAME FROM',
	tagline: '这杯咖啡，比你醒得早',
	taglineEn: 'Your coffee woke up long before you did.',
	motif: 'coffee',
	card: [0, 3.2],
	hit: 0.5,
	extend: 0,
	question: '你今天第几杯了？评论区报个数',
	sources: '参考 · Melitta (1908) · Bach BWV 211 · Wright et al., Science (2013) · 云南咖啡产业数据',
	duration: 0,
};

// ---------------------------------------------------------------- shared pieces

/** Where the lid of a cup held by `holdNear={<HandCup/>}` sits, for a figure at (ox, oy) scaled s with the near hand at `reach`. */
const lidAt = (ox: number, oy: number, s: number, reach: [number, number], flip = false) => ({x: ox + (flip ? -1 : 1) * (reach[0] + 2) * s, y: oy + (reach[1] - 17) * s});

const HandCup: React.FC<{s?: number}> = ({s = 0.15}) => (
	<g transform={`translate(2,14) scale(${s})`}>
		<PaperCup />
	</g>
);

const HandMug: React.FC<{s?: number}> = ({s = 0.3}) => (
	<g transform={`translate(4,10) scale(${s})`}>
		<CeramicCup handle={false} w={80} h={56} />
	</g>
);

/**
 * A clock that runs forward, slows to a stop at `stopAt`, then rewinds faster and
 * faster. Everything that should play backwards in a rewind reads this, not the frame.
 */
const rewindClock = (f: number, stopAt: number) => {
	if (f < stopAt) return f;
	if (f < stopAt + 12) return stopAt + 6 * Math.sin(((f - stopAt) / 12) * (Math.PI / 2));
	return stopAt + 6 - 0.07 * (f - stopAt - 12) ** 2.05;
};

/** The look of tape running: cool tint and lines rolling up for a rewind, warm and down for fast-forward. */
const Tape: React.FC<{amt: number; f: number; dir?: 1 | -1}> = ({amt, f, dir = -1}) =>
	amt <= 0 ? null : (
		<g opacity={amt}>
			<rect width={W} height={H} fill={dir < 0 ? '#2a4a7a' : '#a8641e'} opacity={0.14} style={{mixBlendMode: 'multiply'}} />
			{Array.from({length: 7}, (_, i) => {
				const raw = (f * 34 + i * 160) % 1240;
				const y = dir < 0 ? 1160 - raw : raw - 80;
				return <rect key={i} x={0} y={y} width={W} height={2 + 3 * random(`tp${i}`)} fill="#fff" opacity={0.16} />;
			})}
			<rect width={W} height={H} fill="url(#vignette-hard)" opacity={0.4} />
		</g>
	);

/** The year counter that spins while the tape runs. Upper right, on a dark plate so it reads on any set. */
const YearRoll: React.FC<{f: number; keys: [number, number][]; show: number; label?: string; arrows?: string}> = ({f, keys, show, label, arrows = '◀◀'}) => {
	if (show <= 0) return null;
	const year = Math.round(interpolate(f, keys.map((k) => k[0]), keys.map((k) => k[1]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.inOut}));
	return (
		<g opacity={show}>
			<rect x={1490} y={86} width={330} height={150} rx={20} fill="#0b0806" opacity={0.55} />
			<text x={1655} y={180} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 96, fill: color.gold}}>
				{label ?? year}
			</text>
			<text x={1655} y={222} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 22, letterSpacing: '0.6em', fill: '#efe6d6'}} opacity={0.8}>
				{arrows}
			</text>
		</g>
	);
};

/** Black that swallows the frame as the camera dives into a hole, with the warm pinpoint of the next one. */
const Dark: React.FC<{amt: number; pin?: number}> = ({amt, pin = 0}) =>
	amt <= 0 ? null : (
		<g>
			<rect width={W} height={H} fill="#050302" opacity={amt} />
			{pin > 0 ? <circle cx={960} cy={540} r={8 + 140 * pin} fill="url(#glow-lamp)" opacity={amt} /> : null}
		</g>
	);

const SceneDefs: React.FC = () => (
	<>
		<COFFEE_DEFS />
		<defs>
			<filter id="ink-edge" x="-20%" y="-20%" width="140%" height="140%">
				<feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={3} seed={4} />
				<feDisplacementMap in="SourceGraphic" scale={60} />
			</filter>
		</defs>
	</>
);

// ---------------------------------------------------------------- 1. hook: 8 a.m., the metro

const RIDERS: [number, keyof typeof CAST, boolean][] = [
	[180, 'coworker', false],
	[400, 'officegirl', true],
	[620, 'economist', false],
	[1250, 'clerk', true],
	[1460, 'analyst', false],
	[1700, 'vet', true],
];

/** Coffee-shop signs going by outside, more and more of them. */
const Signs: React.FC<{travel: number; dense: number}> = ({travel, dense}) => (
	<g transform={`translate(${-((travel * 0.45) % 3600)},0)`}>
		{[0, 3600].map((o) =>
			Array.from({length: 18}, (_, i) => {
				if (random(`sg${i}`) > dense) return null;
				const x = o + i * 200 + random(`sx${i}`) * 60;
				const y = 420 + random(`sy${i}`) * 120;
				return (
					<g key={`${o}${i}`} transform={`translate(${x},${y})`}>
						<rect x={-46} y={-30} width={92} height={60} rx={10} fill="#2f5a46" />
						<rect x={-40} y={-24} width={80} height={48} rx={8} fill="#f6d79a" opacity={0.9} />
						<path d="M-12,-12 L12,-12 L9,12 L-9,12 Z" fill="#4a2a18" />
						<path d="M12,-6 C20,-6 20,6 11,6" stroke="#4a2a18" strokeWidth={3} fill="none" />
					</g>
				);
			}),
		)}
	</g>
);

const Hook: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const scene = useScene();
	const hits = useHitFrames(0.5);
	const end = scene.duration;
	const her = {x: 900, y: 1040, s: 1.7};
	// the sip lands on the accent nearest "续命"
	const sipAt = hits.find((h) => h >= cue(1) + 6) ?? cue(1) + 20;
	const sip = spring({frame: f - (sipAt - 14), fps, config: {damping: 14}}) * (1 - prog(f, sipAt + 34, 16, ease.inOut));
	const reach: [number, number] = [70 - 48 * sip, -250 - 40 * sip];
	const lid = lidAt(her.x, her.y, her.s, reach);
	// camera: open tight on the steam, pull back to her, pan the car's cups, back to her, then to the window
	const open = prog(f, 0, 60, ease.inOut);
	const pan = prog(f, cue(0) + 6, cue(1) - cue(0) - 16, ease.inOut);
	const back = prog(f, cue(1) - 14, 16, ease.inOut);
	const win = prog(f, cue(2) - 6, 40, ease.inOut);
	const fog = prog(f, end - 22, 22, ease.in);
	let cam: Cam = camMix(lookAt(lid.x, lid.y - 70, 3.4), lookAt(990, 650, 1.5), open);
	cam = camMix(cam, lookAt(300 + 1200 * pan, 660, 1.55), Math.min(1, pan * 3) * (1 - back));
	cam = camMix(cam, lookAt(1200, 470, 1.7), win);
	cam = camMix(cam, lookAt(lid.x, lid.y - 160, 2.6), fog);
	const travel = f * 14;
	const wake = prog(f, sipAt + 4, 10);
	return (
		<FullFrame fadeIn={1} fadeOut={1}>
			<SceneDefs />
			<Metro
				frame={f}
				travel={travel}
				cam={cam}
				sun={1 + 0.3 * wake}
				outside={
					// coffee shops multiplying outside the window
					<g opacity={0.4 + 0.6 * win}>
						<Signs travel={travel} dense={0.3 + 0.7 * prog(f, cue(2), 120)} />
					</g>
				}
				crowd={RIDERS.map(([x, k, fl], i) => (
					<g key={x} transform={`translate(${x}, 960) scale(1.25)`}>
						<Figure look={CAST[k]} pose={POSES.hold} holdNear={<HandCup />} flip={fl} rim="none" silhouette="#3a4250" shadow={false} />
					</g>
				))}
			>
				<g transform={`translate(${her.x}, ${her.y}) scale(${her.s})`}>
					<Figure
						look={CAST.commuter}
						pose={POSES.hold}
						reach={{near: reach}}
						holdNear={<HandCup />}
						expression={wake > 0.5 ? 'smile' : 'neutral'}
						blink={sip > 0.6 ? 0.1 : blinkAt(f, 'cm')}
						rim="warm"
					/>
				</g>
				{/* the warm little lift after the sip */}
				<circle cx={her.x + 30} cy={her.y - 520} r={160 + 60 * wake} fill="url(#glow-sun)" opacity={0.45 * wake * (1 - prog(f, sipAt + 60, 30))} />
				<g transform={`translate(${lid.x + 6},${lid.y - 4}) scale(${0.55 + 2.2 * fog})`}>
					<Steam t={f * 2} seed="hk" height={220} width={28} opacity={0.55 + 0.4 * fog} />
				</g>
			</Metro>
			{/* the steam thickens until it is the paper the title is brewed on */}
			<rect width={W} height={H} fill="#f3ecdd" opacity={fog ** 1.6} />
		</FullFrame>
	);
};

// ---------------------------------------------------------------- the title: 续命 brewed through filter paper

const CoffeeTitle: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const land = 15; // the drop hits the paper on the track's accent
	const drop = prog(f, 3, land - 3, ease.in);
	const bloom = prog(f, land, 46, ease.out);
	const r = 40 + 760 * bloom;
	const lift = prog(f, dur - 16, 16, ease.in);
	const tag = prog(f, land + 40, 16);
	return (
		<AbsoluteFill style={{transform: `translateY(${-1100 * lift}px)`}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
				<SceneDefs />
				<defs>
					<radialGradient id="stain" cx="50%" cy="50%" r="50%">
						<stop offset="0" stopColor="#c99a62" stopOpacity="0.55" />
						<stop offset="0.75" stopColor="#b98250" stopOpacity="0.35" />
						<stop offset="0.93" stopColor="#8a5428" stopOpacity="0.65" />
						<stop offset="1" stopColor="#8a5428" stopOpacity="0" />
					</radialGradient>
					<clipPath id="bloom-clip">
						<circle cx={960} cy={480} r={r} />
					</clipPath>
				</defs>
				{/* filter paper: cream, fibres, the radial creases of a folded filter */}
				<rect width={W} height={H} fill="#f3ecdd" />
				{Array.from({length: 120}, (_, i) => (
					<line
						key={i}
						x1={random(`fb${i}`) * W}
						y1={random(`fy${i}`) * H}
						x2={random(`fb${i}`) * W + (random(`fl${i}`) - 0.5) * 60}
						y2={random(`fy${i}`) * H + (random(`fm${i}`) - 0.5) * 20}
						stroke="#d8ccb4"
						strokeWidth={1}
						opacity={0.6}
					/>
				))}
				{Array.from({length: 12}, (_, i) => {
					const a = (i / 12) * Math.PI * 2;
					return <line key={`c${i}`} x1={960} y1={480} x2={960 + Math.cos(a) * 1400} y2={480 + Math.sin(a) * 1400} stroke="#e2d6bf" strokeWidth={3} />;
				})}
				{/* the stain spreading from where the drop landed */}
				{f >= land ? (
					<g filter="url(#ink-edge)">
						<circle cx={960} cy={480} r={r} fill="url(#stain)" />
					</g>
				) : null}
				{/* the title, drawn in coffee as the stain reaches it */}
				<g clipPath="url(#bloom-clip)">
					<text x={960} y={560} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 250, fill: '#3a2014', letterSpacing: '0.12em'}} opacity={0.92}>
						续命
					</text>
				</g>
				{/* a crema-gold rim on the letters once they're in */}
				<text x={960} y={560} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 250, fill: 'none', stroke: color.gold, strokeWidth: 2.5, letterSpacing: '0.12em'}} opacity={prog(f, land + 34, 16)}>
					续命
				</text>
				{/* the falling drop */}
				{f < land ? (
					<g transform={`translate(960, ${-60 + (480 + 60) * drop})`}>
						<path d="M0,-34 C10,-14 18,0 18,10 C18,22 9,30 0,30 C-9,30 -18,22 -18,10 C-18,0 -10,-14 0,-34 Z" fill="#3a2014" />
						<ellipse cx={-6} cy={6} rx={4} ry={7} fill="#fff" opacity={0.35} />
					</g>
				) : null}
				<Impact f={f} t={land} x={960} y={480} size={0.45} color="#8a5428" seed="tdrop" />
				<text x={960} y={250} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 600, fontSize: 24, letterSpacing: '0.45em', fill: '#8a6a3a'}} opacity={prog(f, land + 10, 16)}>
					{EPISODE.kicker}
				</text>
				<text x={W / 2} y={720} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 600, fontSize: 42, fill: '#3a2a1c', letterSpacing: '0.12em'}} opacity={tag}>
					{EPISODE.tagline}
				</text>
				<text x={W / 2} y={768} textAnchor="middle" style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 26, fill: '#7a6450'}} opacity={prog(f, land + 46, 16)}>
					{EPISODE.taglineEn}
				</text>
				<text x={W / 2} y={850} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 22, letterSpacing: '0.42em', fill: '#a8803a'}} opacity={prog(f, land + 52, 18)}>
					{`— ${JUNO.credit} · ${JUNO.series} —`}
				</text>
			</svg>
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------- 2. the street at 3 p.m., and the rewind begins

const Street: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const scene = useScene();
	const end = scene.duration;
	const titleLen = cue(0) - 6;
	// the rewind: time stops a beat after "醒得早", runs back, and we dive into her lid
	const stopAt = cue(2) + 52;
	const TT = rewindClock(f, stopAt);
	const rw = prog(f, stopAt, 10) as number;
	const diveAt = end - 14;
	const dive = prog(f, diveAt - 8, 14, ease.in);
	// two colleagues: out of the door, along the pavement; they stop at the café for the close-up
	const walkT = Math.min(TT, cue(2)) - titleLen;
	const gx = 280 + Math.max(0, walkT) * 2.4;
	const bx = gx + 200;
	const stand = f > cue(2) - 10 ? 1 : 0;
	const ask = spring({frame: f - cue(0) + 6, fps, config: {damping: 12}}) * (1 - prog(f, cue(0) + 50, 14));
	const glance = prog(f, cue(1) + 50, 14) * (1 - prog(f, cue(1) + 110, 14));
	const herReach: [number, number] = [70, -250];
	const lid = lidAt(gx, 1000, 1.5, herReach);
	const close = prog(f, cue(2) - 10, 30, ease.inOut);
	let cam = lookAt(gx + 160, 700, 1.25);
	cam = camMix(cam, lookAt(lid.x + 40, lid.y + 40, 2.1), close);
	cam = camMix(cam, lookAt(lid.x, lid.y, 2.1 + 40 * dive ** 3), dive);
	const pose = (phase: number): Pose => (stand ? POSES.hold : walkPose(phase * 0.32, 0.8));
	return (
		<FullFrame
			fadeIn={1}
			fadeOut={1}
			overlay={
				<Sequence durationInFrames={titleLen + 16} layout="none">
					<CoffeeTitle dur={titleLen + 16} />
				</Sequence>
			}
		>
			<SceneDefs />
			<g opacity={f < titleLen - 2 ? 0 : 1}>
				<CafeStreet
					t={TT}
					cam={cam}
					passers={[0, 1, 2].map((i) => {
						const px = ((300 + i * 700 + TT * (i % 2 ? -2 : 2.6)) % 2600 + 2600) % 2600 - 300;
						return (
							<g key={i} transform={`translate(${px}, 930) scale(1.1)`}>
								<Figure look={[CAST.economist, CAST.clerk, CAST.analyst][i]} pose={walkPose(TT * 0.3 + i, 0.8)} flip={i % 2 === 1} rim="none" silhouette="#6a6258" shadow={false} />
							</g>
						);
					})}
				>
					<g transform={`translate(${bx}, 1000) scale(1.5)`}>
						<Figure look={CAST.coworker} pose={pose(walkT + 2)} holdNear={stand ? <HandCup /> : undefined} reach={stand ? {near: herReach} : undefined} expression={ask > 0.3 ? 'smile' : 'neutral'} blink={blinkAt(f, 'cw')} rim="warm" />
					</g>
					<g transform={`translate(${gx}, 1000) scale(1.5)`}>
						<Figure
							look={CAST.officegirl}
							pose={ask > 0.05 ? lerpPose(pose(walkT), POSES.present, ask) : pose(walkT)}
							holdNear={stand ? <HandCup /> : undefined}
							reach={stand ? {near: herReach} : undefined}
							expression={glance > 0.3 || ask > 0.3 ? 'smile' : 'neutral'}
							blink={blinkAt(f, 'og')}
							talk={ask > 0.2 && f % 8 < 4 ? 1 : 0}
							rim="warm"
						/>
					</g>
					{stand ? (
						<g transform={`translate(${lid.x + 6},${lid.y - 4}) scale(0.5)`}>
							<Steam t={TT * 2} seed="st2" height={200} width={26} opacity={0.5} />
						</g>
					) : null}
				</CafeStreet>
			</g>
			<Tape amt={rw * (1 - dive)} f={f} />
			<YearRoll f={f} keys={[[stopAt + 8, 2025], [end, 1975]]} show={prog(f, stopAt + 6, 8)} />
			<Dark amt={prog(f, end - 5, 5)} />
		</FullFrame>
	);
};

export const scenesPart1 = {Hook, Street};
export {CoffeeTitle, Tape, YearRoll, Dark, SceneDefs, rewindClock, lidAt, HandCup, HandMug};


// ---------------------------------------------------------------- 3. Dresden, 1908: the first paper filter

/** A modern V60-style dripper on a glass server; `top` draws it seen from above (for the dive). */
const Dripper: React.FC<{top?: number; drip?: number; t?: number}> = ({top = 0, drip = 0, t = 0}) =>
	top > 0.5 ? (
		<g>
			{Array.from({length: 7}, (_, i) => (
				<circle key={i} r={300 - i * 40} fill={i % 2 ? '#f2eee8' : '#e6e0d6'} />
			))}
			{Array.from({length: 16}, (_, i) => {
				const a = (i / 16) * Math.PI * 2;
				return <path key={i} d={`M${Math.cos(a) * 60},${Math.sin(a) * 60} Q${Math.cos(a + 0.5) * 180},${Math.sin(a + 0.5) * 180} ${Math.cos(a + 0.9) * 290},${Math.sin(a + 0.9) * 290}`} stroke="#d6cfc2" strokeWidth={6} fill="none" />;
			})}
			<circle r={56} fill="#2a160c" />
			<circle r={30} fill="#0a0503" />
		</g>
	) : (
		<g>
			<path d="M-70,-40 L70,-40 L40,120 L-40,120 Z" fill="#cfe0e6" opacity={0.35} stroke="#e6f2f6" strokeWidth={3} />
			<rect x={-60} y={60} width={120} height={60} fill="#4a2a18" opacity={0.85 * drip} />
			<path d="M-110,-200 L110,-200 L30,-60 L-30,-60 Z" fill="url(#ceramic)" />
			<ellipse cx={0} cy={-200} rx={110} ry={16} fill="#f2eee8" />
			<rect x={-60} y={-64} width={120} height={18} rx={6} fill="#e6e0d6" />
			{drip > 0 ? [0, 1].map((k) => <ellipse key={k} cx={0} cy={-40 + (((t / 10 + k / 2) % 1) * 90)} rx={3} ry={6} fill="#4a2a14" opacity={drip} />) : null}
		</g>
	);

const Kettle: React.FC<{tilt?: number; pour?: number; t?: number; modern?: boolean}> = ({tilt = 0, pour = 0, t = 0, modern}) => (
	<g transform={`rotate(${-tilt})`}>
		{modern ? (
			<g>
				<path d="M-60,-10 C-70,-80 60,-80 50,-10 Z" fill="#2a2a2e" />
				<path d="M48,-30 C90,-40 110,-90 150,-110" stroke="#2a2a2e" strokeWidth={8} fill="none" strokeLinecap="round" />
				<path d="M-58,-50 C-100,-50 -100,-10 -60,-12" stroke="#2a2a2e" strokeWidth={10} fill="none" />
			</g>
		) : (
			<g>
				<path d="M-70,0 C-80,-70 80,-70 70,0 Z" fill="#5a5a5e" />
				<path d="M60,-30 C100,-40 110,-70 120,-80" stroke="#5a5a5e" strokeWidth={10} fill="none" />
				<path d="M-40,-60 C-30,-100 30,-100 40,-60" stroke="#2a2a2c" strokeWidth={6} fill="none" />
			</g>
		)}
		{pour > 0 ? <path d={modern ? 'M150,-110 C156,-60 158,20 158,120' : 'M120,-80 C126,-40 130,40 130,140'} stroke="#cfe6f0" strokeWidth={modern ? 3 : 6} opacity={0.75 * pour} fill="none" strokeDasharray="14 6" strokeDashoffset={-t * 4} /> : null}
	</g>
);

const Notebook: React.FC<{tear?: number}> = ({tear = 0}) => (
	<g>
		<rect x={-110} y={-14} width={220} height={14} fill="#3a4a6a" />
		<rect x={-104} y={-24} width={100} height={12} fill="#f4efe2" transform="skewX(-10)" />
		<rect x={4} y={-24} width={100} height={12} fill="#f4efe2" opacity={1 - tear} transform="skewX(10)" />
	</g>
);

const Kitchen: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const scene = useScene();
	const snap = useSnapBeat();
	const end = scene.duration;
	const mel = {x: 760, y: 1060, s: 1.75};
	// K1: out of the dark of her mug; she sips, it's bitter and gritty
	const sip = spring({frame: f - cue(0) - 24, fps, config: {damping: 14}}) * (1 - prog(f, cue(0) + 80, 18, ease.inOut));
	const mugReach: [number, number] = [60 - 34 * sip, -240 - 44 * sip];
	const surface = {x: mel.x + (mugReach[0] + 4) * mel.s, y: mel.y + (mugReach[1] - 7) * mel.s};
	const outP = prog(f, 0, 24, ease.out);
	const yuck = f > cue(0) + 40 && f < cue(1) ? 1 : 0;
	// K2: punching holes, top-down, on the beat
	const holeT = [0, 1, 2, 3, 4].map((k) => snap(cue(1) + 10 + k * 14));
	const punched = holeT.filter((t) => f >= t).length;
	const k2 = f >= cue(1) && f < cue(1) + 86;
	// K3: tearing a page and laying it in
	const k3 = cue(1) + 86;
	const tear = prog(f, k3 + 6, 16, ease.out);
	const lay = prog(f, k3 + 22, 26, ease.inOut);
	// K4: the first pour through paper
	const pour = prog(f, cue(2) - 4, 12) * (1 - prog(f, cue(3) - 8, 10));
	const glint = f >= cue(2) + 40 ? Math.exp(-(f - cue(2) - 40) / 10) : 0;
	// K5: 手冲 today, then the rewind dives into the dripper's hole
	const wipe = prog(f, cue(3) - 6, 22, ease.inOut);
	const stopAt = cue(3) + 46;
	const TT = rewindClock(f, stopAt);
	const rw = prog(f, stopAt, 10);
	const topView = prog(f, stopAt + 14, 14, ease.inOut);
	const dive = prog(f, end - 20, 16, ease.in);

	let cam = lookAt(surface.x + (900 - surface.x) * outP, surface.y + (700 - surface.y) * outP, 1.45 + 30 * (1 - outP) ** 3);
	if (f >= cue(2)) cam = camMix(cam, lookAt(1010, 690, 1.9), prog(f, cue(2) - 4, 20, ease.inOut));

	const kitchenShot = (
		<Kitchen1908
			t={f}
			cam={cam}
			table={
				<>
					<g transform="translate(1000, 860) scale(0.7)">
						<BrassFilterPot holes={1} paper={lay} drip={pour} t={f} />
					</g>
					<g transform={`translate(${1300 - 260 * lay}, ${862 - 120 * Math.sin(Math.PI * lay)}) rotate(${-20 * lay})`} opacity={tear > 0 && lay < 1 ? 1 : 0}>
						<rect x={-50} y={-6} width={100} height={12} fill="#f4efe2" />
					</g>
					<g transform="translate(1300, 862)">
						<Notebook tear={tear} />
					</g>
				</>
			}
		>
			<g transform={`translate(${mel.x}, ${mel.y}) scale(${mel.s})`}>
				<Figure
					look={CAST.melitta}
					pose={f < cue(1) ? POSES.hold : f < cue(2) ? lerpPose(POSES.hold, POSES.write, prog(f, k3, 12)) : POSES.hold}
					reach={f < cue(1) ? {near: mugReach} : f >= cue(2) ? {near: [150, -230]} : {near: [130 - 20 * lay, -200 - 30 * lay]}}
					holdNear={f < cue(1) ? <HandMug /> : f >= cue(2) && pour > 0 ? <g transform="translate(-10,0) scale(0.6)"><Kettle tilt={34 * pour} pour={pour} t={f} /></g> : undefined}
					expression={yuck ? 'worried' : f >= cue(2) + 40 ? 'smile' : 'thinking'}
					blink={sip > 0.6 ? 0.1 : blinkAt(f, 'mel')}
					rim="warm"
					shadow={false}
				/>
			</g>
			{/* grounds in the mug: the reason for all this */}
			{yuck && sip < 0.3 ? <g transform={`translate(${surface.x},${surface.y})`}>{[0, 1, 2, 3].map((i) => <circle key={i} cx={-10 + i * 7} cy={1} r={1.8} fill="#1a0e06" />)}</g> : null}
			<circle cx={1000} cy={640} r={140 * glint} fill="url(#glow-sun)" opacity={glint} />
		</Kitchen1908>
	);

	return (
		<FullFrame fadeIn={1} fadeOut={1}>
			<SceneDefs />
			{k2 ? (
				// top-down: the brass base, a nail and a hammer; each strike lands on a beat
				<g>
					<rect width={W} height={H} fill="#2a1f16" />
					<circle cx={960} cy={540} r={430} fill="url(#brass)" />
					<circle cx={960} cy={540} r={430} fill="none" stroke="#6a4a1e" strokeWidth={22} />
					{Array.from({length: 12}, (_, i) => {
						const a = (i / 12) * Math.PI * 2;
						return <circle key={i} cx={960 + Math.cos(a) * 400} cy={540 + Math.sin(a) * 400} r={9} fill="#6b5328" />;
					})}
					{[
						[0, 0],
						[-90, -40],
						[90, -40],
						[-60, 70],
						[60, 70],
					].map(([dx, dy], i) =>
						i < punched ? (
							<g key={i}>
								<circle cx={960 + dx} cy={540 + dy} r={11} fill="#0a0503" />
								<circle cx={960 + dx} cy={540 + dy} r={26} fill="url(#glow-lamp)" opacity={0.6 * Math.exp(-(f - holeT[i]) / 8)} />
							</g>
						) : null,
					)}
					{(() => {
						const k = Math.min(4, punched);
						const pos = [
							[0, 0],
							[-90, -40],
							[90, -40],
							[-60, 70],
							[60, 70],
						][k];
						const next = holeT[Math.min(4, punched)] ?? holeT[4];
						const lift = punched >= 5 ? 1 : Math.max(0, Math.min(1, (next - f) / 10));
						return (
							<g transform={`translate(${960 + pos[0]},${540 + pos[1]})`}>
								<rect x={-5} y={-150} width={10} height={140} fill="#9aa0a6" />
								<path d="M-5,-10 L5,-10 L0,8 Z" fill="#9aa0a6" />
								<g transform={`translate(0,${-170 - 120 * lift}) rotate(${-25 * lift})`}>
									<rect x={-70} y={-34} width={140} height={44} rx={6} fill="#3a3a3e" />
									<rect x={60} y={-20} width={240} height={18} rx={8} fill="#6a4a2e" />
								</g>
							</g>
						);
					})()}
					{holeT.map((t, i) => (
						<Impact key={i} f={f} t={t} x={960} y={540} size={0.18} seed={`h${i}`} />
					))}
				</g>
			) : f < cue(3) + 50 ? (
				<g>
					{kitchenShot}
					{/* 手冲 today: a wipe from 1908 to a counter now */}
					{wipe > 0 ? (
						<g>
							<defs>
								<clipPath id="wipe-now">
									<rect x={0} y={0} width={W * wipe} height={H} />
								</clipPath>
							</defs>
							<g clipPath="url(#wipe-now)">
								<rect width={W} height={H} fill="#e9e4dc" />
								<rect x={0} y={760} width={W} height={320} fill="#b99a74" />
								<rect x={0} y={740} width={W} height={24} fill="#d6c2a2" />
								<polygon points="0,0 700,0 1300,760 300,760" fill="url(#beam-sun)" opacity={0.6} />
								<g transform="translate(980, 700) scale(1.9)">
									<Dripper drip={1} t={f} />
									<g transform="translate(-150,-120)">
										<Kettle modern tilt={18} pour={1} t={f} />
									</g>
									<g transform="translate(0,-200)">
										<Steam t={f * 2} seed="v60" height={160} width={24} opacity={0.4} />
									</g>
								</g>
								<g transform="translate(1500, 740) scale(0.9)">
									<path d="M-30,0 L30,0 L24,-60 L-24,-60 Z" fill="#c9b9a0" />
									<path d="M0,-60 C-30,-140 -60,-150 -70,-200 M0,-60 C10,-150 40,-170 60,-210 M0,-60 C-6,-120 -2,-170 6,-230" stroke="#4a7a4a" strokeWidth={6} fill="none" />
								</g>
							</g>
							<rect x={W * wipe - 3} y={0} width={6} height={H} fill={color.gold} opacity={wipe < 1 ? 0.9 : 0} />
						</g>
					) : null}
				</g>
			) : (
				// top view of the dripper's hole; the camera dives in
				<g transform={`translate(960,540) scale(${1 + 30 * dive ** 3}) translate(-960,-540)`}>
					<rect width={W} height={H} fill="#e9e4dc" />
					<g transform={`translate(960,540) scale(${0.6 + 0.6 * topView})`}>
						<Dripper top={1} />
					</g>
				</g>
			)}
			<Tape amt={rw * (1 - dive)} f={f} />
			<YearRoll f={f} keys={f < 40 ? [[0, 1960], [24, 1908]] : [[stopAt + 8, 1908], [end, 1760]]} show={f < 40 ? 1 - prog(f, 26, 12) : prog(f, stopAt + 6, 8)} />
			<Tape amt={1 - prog(f, 0, 22)} f={f} />
			<Dark amt={Math.max(1 - prog(f, 0, 8), prog(f, end - 5, 5))} pin={f < 8 ? 1 - f / 8 : 0} />
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 4. Leipzig, 1730s: Bach's coffee song

const Note: React.FC<{x: number; y: number; o: number; s?: number}> = ({x, y, o, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
		<ellipse cx={0} cy={0} rx={11} ry={8} fill={color.gold} transform="rotate(-20)" />
		<rect x={9} y={-46} width={3.5} height={46} fill={color.gold} />
		<path d="M12,-46 C24,-40 28,-30 22,-18" stroke={color.gold} strokeWidth={3.5} fill="none" />
	</g>
);

/** A roast leg of goat, plump and glossy; `dry` shrivels it (Liesgen's threat in the cantata). */
const RoastLeg: React.FC<{dry?: number}> = ({dry = 0}) => {
	const k = 1 - 0.32 * dry;
	return (
		<g transform="rotate(-18)">
			{/* bone */}
			<g stroke="#b9a684" strokeWidth={3}>
				<rect x={40} y={-9} width={80} height={18} rx={9} fill="#f3ead6" />
				<circle cx={122} cy={-12} r={13} fill="#f3ead6" />
				<circle cx={122} cy={12} r={13} fill="#f3ead6" />
			</g>
			{/* meat: a fat teardrop, browned */}
			<g transform={`scale(${k},${1 - 0.22 * dry})`}>
				<path d="M-110,0 C-110,-74 -10,-78 46,-18 L52,-10 L52,10 L46,18 C-10,78 -110,74 -110,0 Z" fill={dry > 0.5 ? '#5a2e14' : '#9a4a22'} />
				<path d="M-96,-20 C-80,-56 -30,-58 10,-30" stroke="#d9894a" strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.7 * (1 - dry)} />
				<path d="M-70,30 C-50,40 -20,40 10,24" stroke="#6a2e12" strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.6} />
				{dry > 0.25
					? [0, 1, 2, 3].map((i) => <path key={i} d={`M${-90 + i * 30},-30 C${-84 + i * 30},-10 ${-96 + i * 30},10 ${-88 + i * 30},30`} stroke="#2a1206" strokeWidth={3} fill="none" opacity={dry} />)
					: null}
			</g>
			{/* a curl of steam while it's still juicy */}
			<path d="M-40,-80 C-50,-100 -30,-110 -40,-130 M0,-76 C-10,-96 10,-106 0,-126" stroke="#fff" strokeOpacity={0.6 * (1 - dry)} strokeWidth={5} fill="none" strokeLinecap="round" />
		</g>
	);
};

const Leipzig: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const scene = useScene();
	const end = scene.duration;
	const lies = {x: 1180, y: 1010, s: 1.6};
	const sipL = prog(f, cue(3) + 20, 14, ease.out) * (1 - prog(f, cue(3) + 70, 16));
	const cupReach: [number, number] = [60 - 30 * sipL, -240 - 40 * sipL];
	const surface = {x: lies.x + (cupReach[0] + 4) * lies.s, y: lies.y + (cupReach[1] - 7) * lies.s};
	const keyhole = prog(f, 0, 26, ease.in);
	const bubble = spring({frame: f - cue(2) + 2, fps, config: {damping: 11}}) * (1 - prog(f, cue(3) + 6, 12));
	const dry = prog(f, cue(2) + 46, 18, ease.inOut);
	const stopAt = end - 50;
	const rw = prog(f, stopAt, 10);
	const dive = prog(f, end - 16, 14, ease.in);
	let cam = lookAt(960, 620, 1.12);
	cam = camMix(cam, lookAt(1340, 640, 1.5), prog(f, cue(1) - 8, 24, ease.inOut));
	cam = camMix(cam, lookAt(surface.x, surface.y, 1.6 + 30 * dive ** 3), prog(f, stopAt, 20, ease.inOut));
	const playing = f < cue(1) + 40 || f > cue(3);
	return (
		<FullFrame fadeIn={1} fadeOut={1}>
			<SceneDefs />
			<CoffeeHouse t={f} kind="leipzig" cam={cam}>
				{/* the composer at the harpsichord, seen side-on, playing */}
				<rect x={196} y={790} width={110} height={16} rx={4} fill="#3a1a10" />
				<rect x={206} y={806} width={12} height={64} fill="#2a140c" />
				<rect x={284} y={806} width={12} height={64} fill="#2a140c" />
				<g transform="translate(250, 870) scale(1.3)">
					<Figure
						look={CAST.bach}
						pose={POSES.sit}
						reach={playing ? {near: [110 + 10 * Math.sin(f / 4), -158 + 5 * Math.abs(Math.sin(f / 3))], far: [90 + 10 * Math.cos(f / 5), -156 + 5 * Math.abs(Math.cos(f / 3.4))]} : {near: [100, -150], far: [86, -150]}}
						expression="thinking"
						blink={blinkAt(f, 'jsb')}
						rim="warm"
						shadow={false}
					/>
				</g>
				{Array.from({length: 7}, (_, i) => {
					const u = ((f / 70 + i / 7) % 1);
					return <Note key={i} x={520 + Math.sin(i * 2 + f / 30) * 80 + u * 120} y={560 - u * 360} o={(playing ? 1 : 0.3) * Math.sin(u * Math.PI) * 0.9} s={0.9 + 0.3 * random(`n${i}`)} />;
				})}
				<g transform={`translate(${lies.x}, ${lies.y}) scale(${lies.s})`}>
					<Figure
						look={CAST.liesgen}
						pose={lerpPose(POSES.hold, POSES.present, f > cue(1) && f < cue(3) ? 0.6 : 0)}
						reach={{near: cupReach}}
						holdNear={<HandMug />}
						expression={f > cue(3) ? 'smile' : f > cue(1) ? 'smile' : 'neutral'}
						talk={f > cue(1) && f < cue(3) + 10 && f % 10 < 5 ? 1 : 0}
						blink={sipL > 0.5 ? 0.1 : blinkAt(f, 'li')}
						rim="warm"
						shadow={false}
					/>
				</g>
				<g transform={`translate(1520, 1010) scale(1.6)`}>
					<Figure
						look={CAST.schlendrian}
						pose={f > cue(3) + 20 ? POSES.shrug : f > cue(2) + 46 ? POSES.think : f > cue(1) ? POSES.point : POSES.stand}
						reach={f > cue(2) + 46 && f < cue(3) + 20 ? {far: [26, -296]} : undefined}
						expression={f > cue(3) + 20 ? 'worried' : f > cue(1) ? 'stern' : 'neutral'}
						flip
						blink={blinkAt(f, 'fa')}
						rim="warm"
						shadow={false}
					/>
				</g>
				{/* her song, as a picture: she'd shrivel like a roast goat */}
				{bubble > 0.02 ? (
					<g transform={`translate(1010, 540) scale(${0.85 * bubble})`}>
						{[
							[0, 0, 150, 100],
							[-120, 30, 60, 50],
							[120, 34, 70, 54],
						].map(([x, y, rx, ry], i) => (
							<ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="#f6efe2" />
						))}
						<circle cx={70} cy={150} r={18} fill="#f6efe2" />
						<circle cx={96} cy={196} r={10} fill="#f6efe2" />
						<g transform="translate(0,6)">
							<RoastLeg dry={dry} />
						</g>
						{dry > 0 && dry < 1 ? <circle cx={-20} cy={-10} r={60 + 80 * dry} fill="#c9b9a0" opacity={0.4 * (1 - dry)} /> : null}
					</g>
				) : null}
				{/* notes curling into her cup when she finally gets it */}
				{f > cue(3)
					? Array.from({length: 5}, (_, i) => {
							const u = prog(f, cue(3) + i * 6, 40, ease.inOut);
							return <Note key={`c${i}`} x={600 + (surface.x - 600) * u + Math.sin(u * 6 + i) * 60 * (1 - u)} y={400 + (surface.y - 400) * u} o={Math.sin(u * Math.PI)} s={0.8} />;
						})
					: null}
			</CoffeeHouse>
			{/* through the keyhole into the room */}
			{keyhole < 1 ? (
				<g>
					<defs>
						<mask id="keyhole">
							<rect width={W} height={H} fill="#fff" />
							<g transform={`translate(960,520) scale(${0.4 + 30 * keyhole ** 2.2})`}>
								<circle cx={0} cy={-20} r={30} fill="#000" />
								<path d="M-16,0 L16,0 L28,70 L-28,70 Z" fill="#000" />
							</g>
						</mask>
					</defs>
					<rect width={W} height={H} fill="#140c06" mask="url(#keyhole)" />
				</g>
			) : null}
			<YearRoll f={f} keys={[[0, 1760], [20, 1735]]} label={f > 20 ? '1730s' : undefined} show={1 - prog(f, 34, 12)} />
			<Tape amt={(1 - prog(f, 6, 20)) + rw * (1 - dive)} f={f} />
			<YearRoll f={f} keys={[[stopAt + 8, 1735], [end, 1670]]} show={prog(f, stopAt + 6, 8)} />
			<Dark amt={prog(f, end - 5, 5)} />
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 5. London, 1652: the penny university

const PATRONS: [keyof typeof CAST, number][] = [
	['gentleman', 700],
	['merchant', 980],
	['schlendrian', 1260],
	['gentleman', 1540],
];

const London: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const scene = useScene();
	const hits = useHitFrames(0.3);
	const snap = useSnapBeat();
	const end = scene.duration;
	const host = {x: 420, y: 1010, s: 1.5};
	const dishReach: [number, number] = [80, -230];
	const surface = {x: host.x + (dishReach[0] + 4) * host.s, y: host.y + (dishReach[1] - 7) * host.s};
	const outP = prog(f, 0, 24, ease.out);
	// patrons come in on the build's accents
	const arrive = PATRONS.map((_, i) => hits.find((h) => h > cue(0) + 10 + i * 24) ?? cue(0) + 20 + i * 30);
	const coinAt = snap(cue(1) + 10);
	const coin = prog(f, coinAt - 14, 14, ease.in);
	const signAt = hits.find((h) => h >= cue(2) - 4) ?? cue(2);
	const sign = spring({frame: f - signAt, fps, config: {damping: 10, stiffness: 180}});
	const k4 = f >= cue(3) - 6;
	const sail = prog(f, cue(3) + 70, end - cue(3) - 70);
	const sun = prog(f, end - 22, 22, ease.in);
	let cam = lookAt(surface.x + (960 - surface.x) * outP, surface.y + (620 - surface.y) * outP, 1.15 + 30 * (1 - outP) ** 3);
	cam = camMix(cam, lookAt(1000, 560, 1.2), prog(f, cue(2) - 10, 20, ease.inOut));
	return (
		<FullFrame fadeIn={1} fadeOut={1}>
			<SceneDefs />
			{!k4 ? (
				<CoffeeHouse
					t={f}
					kind="london"
					cam={cam}
					back={
						// the sign that names the place
						f >= signAt - 2 ? (
							<g transform={`translate(1060, ${100 + 60 * sign}) rotate(${(1 - sign) * -6})`}>
								<rect x={-230} y={-50} width={460} height={100} rx={8} fill="#2a1a0e" stroke="#a8803a" strokeWidth={6} />
								<text y={16} textAnchor="middle" style={{fontFamily: 'serif', fontWeight: 700, fontSize: 40, letterSpacing: '0.12em', fill: '#e9d9b0'}}>
									PENNY UNIVERSITY
								</text>
							</g>
						) : null
					}
					table={
						<>
							{PATRONS.map(([, x], i) => (
								<g key={i} transform={`translate(${x + 60},866) scale(0.45)`} opacity={f > arrive[i] + 10 ? 1 : 0}>
									<CeramicCup handle={false} />
								</g>
							))}
							{/* a penny spins onto the table */}
							{f >= coinAt - 14 ? (
								<g transform={`translate(${860 + 40 * coin},${700 + 160 * coin})`}>
									<ellipse rx={22 * Math.abs(Math.cos(f / 2)) * (1 - (f >= coinAt ? 1 : 0)) + (f >= coinAt ? 22 : 0)} ry={f >= coinAt ? 7 : 22} fill="#b9773a" stroke="#7a4a1e" strokeWidth={2} />
								</g>
							) : null}
							{/* newspapers passed along the table */}
							{f > cue(1) + 30
								? [0, 1].map((i) => {
										const u = prog(f, cue(1) + 30 + i * 30, 30, ease.inOut);
										return (
											<g key={i} transform={`translate(${700 + 500 * u + i * 200},${850 - Math.sin(u * Math.PI) * 60}) rotate(${-6 + 12 * u})`}>
												<rect x={-60} y={-40} width={120} height={80} fill="#e6dac0" />
												{[0, 1, 2, 3].map((k) => (
													<rect key={k} x={-50} y={-28 + k * 16} width={100 - (k % 2) * 30} height={5} fill="#5a4a32" opacity={0.6} />
												))}
											</g>
										);
									})
								: null}
						</>
					}
				>
					<g transform={`translate(${host.x}, ${host.y}) scale(${host.s})`}>
						<Figure look={CAST.pasqua} pose={POSES.hold} reach={{near: f < 30 ? dishReach : [90 + 20 * Math.sin(f / 20), -220]}} holdNear={f < 30 ? <HandMug /> : <g transform="translate(-10,10) scale(0.35)"><CoffeePot18 /></g>} expression="smile" blink={blinkAt(f, 'pq')} rim="warm" shadow={false} />
					</g>
					{PATRONS.map(([k, x], i) => {
						const inn = spring({frame: f - arrive[i], fps, config: {damping: 13}});
						if (f < arrive[i]) return null;
						const g = Math.floor((f + i * 13) / 22) % 4;
						const pose = [POSES.point, POSES.shrug, POSES.present, POSES.think][(g + i) % 4];
						return (
							<g key={i} transform={`translate(${x + (1 - inn) * 500}, 1010) scale(1.45)`}>
								<Figure look={CAST[k]} pose={inn < 0.9 ? walkPose(f * 0.35, 0.8) : pose} flip={i % 2 === 0} expression={g % 2 ? 'surprise' : 'smile'} talk={f % 9 < 4 && (g + i) % 2 === 0 ? 1 : 0} blink={blinkAt(f, `p${i}`)} rim="warm" shadow={false} />
							</g>
						);
					})}
				</CoffeeHouse>
			) : (
				// close-up on the table: a ship insured in a coffeehouse, its drawing setting sail
				<g>
					<rect width={W} height={H} fill="#3a2414" />
					<ellipse cx={960} cy={420} rx={900} ry={520} fill="url(#glow-lamp)" opacity={0.55} />
					<g transform="translate(960,540) rotate(-2)">
						<rect x={-620} y={-360} width={1240} height={720} fill="url(#grain-paper)" />
						<text y={-270} textAnchor="middle" style={{fontFamily: 'serif', fontWeight: 700, fontSize: 52, letterSpacing: '0.2em', fill: P.ink}}>
							EDWARD LLOYD&apos;S · COFFEE HOUSE
						</text>
						{/* waves and the ship, inked; once signed for, it sails */}
						<g transform={`translate(${-380 + 760 * sail},${-30 + 8 * Math.sin(f / 9)})`}>
							<path d="M-150,40 L150,40 L110,90 L-110,90 Z" fill={P.ink} />
							<path d="M-10,40 L-10,-180 M-10,-170 L100,-40 L-10,-40 M-20,-150 L-120,-30 L-20,-30" stroke={P.ink} strokeWidth={6} fill="none" />
						</g>
						{Array.from({length: 4}, (_, i) => (
							<path key={i} d={`M-560,${110 + i * 26} ${Array.from({length: 14}, (_, k) => `Q${-520 + k * 80},${100 + i * 26 + (k % 2 ? 10 : -10) + 4 * Math.sin(f / 7 + k)} ${-480 + k * 80},${110 + i * 26}`).join(' ')}`} stroke={P.ink} strokeOpacity={0.5} strokeWidth={3} fill="none" />
						))}
						{/* the underwriters sign, one after another */}
						{[0, 1, 2].map((i) => {
							const w = prog(f, cue(3) + 6 + i * 18, 18, ease.out);
							return <path key={i} d={`M${-480 + i * 340},260 C${-430 + i * 340},220 ${-400 + i * 340},300 ${-340 + i * 340},250 S${-260 + i * 340},230 ${-220 + i * 340},270`} stroke="#2a1a3a" strokeWidth={4} fill="none" strokeDasharray={400} strokeDashoffset={400 * (1 - w)} />;
						})}
					</g>
				</g>
			)}
			{/* daylight from the window grows into the next scene's sunrise */}
			<rect width={W} height={H} fill="#fff1d6" opacity={sun ** 1.4} />
			<YearRoll f={f} keys={[[0, 1670], [20, 1652]]} show={1 - prog(f, 34, 12)} />
			<Tape amt={1 - prog(f, 6, 20)} f={f} />
			<Dark amt={1 - prog(f, 0, 8)} pin={f < 8 ? 1 - f / 8 : 0} />
		</FullFrame>
	);
};

export const scenesPart2 = {Kitchen, Leipzig, London};

// ---------------------------------------------------------------- 6. Yunnan: where your cup most likely grew

const MISSIONARY = {skin: P.skin1, hair: 'short' as const, hairColor: '#5a4130', outfit: 'suit' as const, top: '#1e1e22', bottom: '#1e1e22', accent: '#1e1e22', mustache: true};

/** 100 beans, 98 of them lit: "九成八". */
const BeanGrid: React.FC<{f: number; at: number}> = ({f, at}) => (
	<g>
		<rect x={-30} y={-90} width={560} height={640} rx={20} fill="#0b0806" opacity={0.55} />
		{Array.from({length: 100}, (_, i) => {
			const q = prog(f, at + i * 0.6, 6, ease.back);
			const lit = i < 98;
			return (
				<g key={i} transform={`translate(${(i % 10) * 50 + 25},${Math.floor(i / 10) * 44 + 10}) scale(${q})`} opacity={lit ? 1 : 0.35}>
					<Bean r={16} rot={30} green={!lit} />
				</g>
			);
		})}
		<text x={250} y={-30} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 64, fill: color.gold}} opacity={prog(f, at + 60, 10)}>
			98%
		</text>
		<text x={250} y={520} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 24, letterSpacing: '0.2em', fill: '#efe6d6'}} opacity={prog(f, at + 64, 10)}>
			中国咖啡 · 云南产
		</text>
	</g>
);

const clusterXY: [number, number] = [1010, 640];
const BRANCH_D = 'M-150,72 C-60,62 60,50 200,20';
/** cherries in three clusters along the branch, nearest her hand first */
const PICK: [number, number][] = [-90, -10, 75].flatMap((x, n) =>
	[
		[-12, 8],
		[11, 10],
		[-1, 24],
		[14, -6],
	].map(([dx, dy]) => [x + dx, 66 - n * 10 + dy] as [number, number]),
);

const Yunnan_: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const scene = useScene();
	const hits = useHitFrames(0.3);
	const end = scene.duration;
	const [clusterX, clusterY] = clusterXY;
	const fromLight = 1 - prog(f, 0, 16, ease.out);
	const flare = Math.exp(-f / 10);
	// Y1 crane down from the sun; Y4 the picker; Y5 the macro of a branch
	const y4 = f >= cue(4) - 4 && f < cue(5) - 4;
	const y5 = f >= cue(5) - 4;
	let cam: Cam = camMix(lookAt(1240, 330, 1.7), lookAt(960, 560, 1.0), prog(f, 8, 170, ease.inOut));
	if (y4) cam = lookAt(900, 760, 1.55);
	// picking: one cherry per heavy kick
	const picks = hits.filter((h) => h >= cue(4) + 6 && h < cue(5) - 10).slice(0, PICK.length);
	const picked = picks.filter((h) => f >= h).length;
	// her hand: to the next cherry, a short dip toward the basket after each pick
	const toReach = (i: number): [number, number] => {
		const [x, y] = PICK[Math.min(i, PICK.length - 1)];
		return [(clusterXY[0] + x - 700) / 1.5, (clusterXY[1] + y - 1000) / 1.5];
	};
	const nxt = Math.min(picked, PICK.length - 1);
	const last = picks[picked - 1];
	const goNext = last === undefined ? 1 : prog(f, last + 4, 8, ease.inOut);
	const from = toReach(Math.max(0, picked - 1));
	const to = toReach(nxt);
	const dip = last === undefined ? 0 : Math.sin(prog(f, last, 12) * Math.PI);
	const handReach: [number, number] = [from[0] + (to[0] - from[0]) * goNext - 40 * dip, from[1] + (to[1] - from[1]) * goNext + 20 * dip];
	const photo = spring({frame: f - cue(3) + 4, fps, config: {damping: 14}}) * (1 - prog(f, cue(4) - 16, 14));
	const grow = prog(f, cue(3) + 20, cue(4) - cue(3) - 40, ease.inOut);
	const dive = prog(f, end - 18, 16, ease.in);
	return (
		<FullFrame fadeIn={1} fadeOut={1}>
			<SceneDefs />
			<defs>
				<filter id="sepia">
					<feColorMatrix type="matrix" values="0.39 0.77 0.19 0 0  0.35 0.69 0.17 0 0  0.27 0.53 0.13 0 0  0 0 0 1 0" />
				</filter>
			</defs>
			{!y5 ? (
				<Yunnan
					t={f}
					cam={cam}
					season="harvest"
					sunUp={0.35 + 0.65 * prog(f, 0, 200, ease.out)}
					front={
						y4 ? (
							// the bush she's picking from: a stem out of the slope, one branch reaching to her hand,
							// cherries in clusters at the leaf nodes (red ones get picked, the green stay)
							<g transform={`translate(${clusterX},${clusterY})`}>
								<ellipse cx={230} cy={60} rx={190} ry={150} fill="#2a4a30" />
								<ellipse cx={300} cy={-40} rx={150} ry={120} fill="#30553a" />
								<path d="M300,520 C280,300 240,140 200,20" stroke="#4a3a28" strokeWidth={16} fill="none" strokeLinecap="round" />
								<path d={BRANCH_D} stroke="#5a4632" strokeWidth={9} fill="none" strokeLinecap="round" />
								<path d="M230,90 C300,40 360,-20 420,-90" stroke="#5a4632" strokeWidth={8} fill="none" strokeLinecap="round" />
								{[
									[-120, 66, -70, 60],
									[-30, 58, -60, 50],
									[60, 46, -65, 45],
									[150, 30, -55, 60],
									[330, -40, -50, 40],
								].map(([x, y, a1, a2], i) => (
									<g key={i} transform={`translate(${x},${y})`}>
										<Leaf len={110} rot={a1 + 3 * Math.sin(f / 30 + i)} />
										<Leaf len={100} rot={a2 + 3 * Math.sin(f / 26 + i)} />
									</g>
								))}
								{/* green ones, left for next month */}
								{[[318, -34], [338, -26], [326, -16], [345, -40]].map(([x, y], i) => (
									<g key={i} transform={`translate(${x},${y})`}>
										<Cherry r={13} ripe={0} />
									</g>
								))}
								{PICK.map(([x0, y0], i) => {
									const pt = picks[i];
									const u = pt !== undefined && f >= pt ? prog(f, pt, 12, ease.inOut) : 0;
									if (u >= 1) return null;
									return (
										<g key={i} transform={`translate(${x0 + (-360 - x0) * u},${y0 + (190 - y0) * u - Math.sin(u * Math.PI) * 90})`}>
											<Cherry r={14} />
										</g>
									);
								})}
							</g>
						) : null
					}
				>
					{y4 ? (
						<g transform="translate(700, 1000) scale(1.5)">
							<Figure look={CAST.farmer} pose={POSES.hold} reach={{near: handReach}} expression="smile" blink={blinkAt(f, 'fm')} rim="warm" />
							<g transform="translate(-50,-110) scale(0.75)">
								<Basket fill={Math.min(1, 0.25 + picked / 14)} />
							</g>
						</g>
					) : null}
				</Yunnan>
			) : (
				// macro: mixed ripeness on one branch; a hand takes only the red ones
				<g transform={`translate(960,540) scale(${1 + 30 * dive ** 3}) translate(${-960 + (960 - 1155) * dive},${-540 + (540 - 527) * dive})`}>
					<rect width={W} height={H} fill="#2c3a24" />
					<Bokeh f={f} n={30} seed="ym" gold={0.6} />
					<path d="M0,620 C400,560 900,520 1920,430" stroke="#5a4632" strokeWidth={22} fill="none" />
					{[
						[420, 580],
						[1500, 470],
					].map(([x, y], i) => (
						<g key={i} transform={`translate(${x},${y})`}>
							<Leaf len={300} rot={-55} />
							<Leaf len={280} rot={55} />
						</g>
					))}
					<g transform="translate(1000,620) scale(1.55) translate(-1000,-620)">
						{Array.from({length: 9}, (_, i) => {
							const ripe = [1, 0, 1, 0.6, 1, 0, 0.6, 1, 1][i];
							const x = 760 + (i % 5) * 92 + Math.floor(i / 5) * 46;
							const y = 600 + Math.floor(i / 5) * 84 - (i % 5) * 14;
							const reds = [0, 2, 4, 7].indexOf(i);
							const t = cue(5) + 14 + reds * 18;
							const ring = reds >= 0 && f > t - 10 && f <= t + 4 ? prog(f, t - 10, 6, ease.back) : 0;
							// picked: a tug, then up and out of frame
							const up = reds >= 0 ? prog(f, t + 2, 14, ease.in) : 0;
							const tug = reds >= 0 ? Math.sin(prog(f, t - 4, 6) * Math.PI) * 8 : 0;
							if (up >= 1) return null;
							return (
								<g key={i} transform={`translate(${x},${y + tug - 760 * up}) rotate(${-20 * up})`}>
									{ring > 0 ? <circle r={58} fill="none" stroke={color.gold} strokeWidth={4} transform={`scale(${ring})`} /> : null}
									<Cherry r={42} ripe={ripe} />
								</g>
							);
						})}
						{/* the last red one, which we dive into */}
						<g transform="translate(1100,560)">
							<Cherry r={42} />
						</g>
					</g>
				</g>
			)}
			{/* "九成八" */}
			{f >= cue(2) - 4 && f < cue(3) ? (
				<g transform="translate(1260,260)" opacity={prog(f, cue(2) - 4, 10) * (1 - prog(f, cue(3) - 10, 10))}>
					<BeanGrid f={f} at={cue(2)} />
				</g>
			) : null}
			{/* 1892: a sepia photograph of the first planting */}
			{photo > 0.01 ? (
				<g transform={`translate(960,${520 + (1 - photo) * 80}) rotate(${-2 + (1 - photo) * 4})`} opacity={Math.min(1, photo * 1.4)}>
					<rect x={-470} y={-300} width={940} height={600} fill="#efe3c8" />
					<g filter="url(#sepia)">
						<rect x={-440} y={-270} width={880} height={500} fill="#c8b48a" />
						<rect x={-440} y={60} width={880} height={170} fill="#8a7a52" />
						<path d="M120,60 L120,-110 L260,-180 L400,-110 L400,60 Z" fill="#9a7a50" />
						<rect x={210} y={-40} width={70} height={100} fill="#5a4630" />
						<g transform="translate(-160,170) scale(1.05)">
							<Figure look={MISSIONARY} pose={POSES.hold} reach={{near: [120, -110]}} rim="none" shadow={false} />
						</g>
						<g transform={`translate(20,170) scale(${0.3 + 0.9 * grow})`}>
							<path d="M0,0 L0,-120" stroke="#4a3a22" strokeWidth={8} />
							{[0, 1, 2, 3].map((i) => (
								<g key={i} transform={`translate(0,${-40 - i * 26})`}>
									<Leaf len={60 - i * 8} rot={-40} />
									<Leaf len={60 - i * 8} rot={220} />
								</g>
							))}
						</g>
					</g>
					<text x={-430} y={280} style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 30, fill: '#5a4630'}}>
						Yunnan · 1892
					</text>
				</g>
			) : null}
			<circle cx={960} cy={380} r={600} fill="url(#glow-sun)" opacity={0.6 * flare} />
			<rect width={W} height={H} fill="#fff1d6" opacity={fromLight} />
			<Dark amt={prog(f, end - 4, 4)} />
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 7. one cherry, two beans back to back

/** One coffee seed: flat face at x=0, round back bulging toward `d`. */
const Seed: React.FC<{d: number; rx?: number; ry?: number; glow?: number}> = ({d, rx = 78, ry = 150, glow = 0}) => (
	<g>
		<path d={`M0,${-ry} A${rx},${ry} 0 0,${d > 0 ? 1 : 0} 0,${ry} Z`} fill="url(#bean-green)" />
		<path d={`M${d * rx * 0.25},${-ry * 0.8} C${d * rx * 0.6},${-ry * 0.3} ${d * rx * 0.6},${ry * 0.3} ${d * rx * 0.25},${ry * 0.8}`} stroke="#fff" strokeOpacity={0.25} strokeWidth={6} fill="none" />
		<path d={`M0,${-ry} A${rx},${ry} 0 0,${d > 0 ? 1 : 0} 0,${ry}`} stroke="#ffe2a0" strokeOpacity={0.5 * glow} strokeWidth={4} fill="none" />
	</g>
);

const CherryScene: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const scene = useScene();
	const snap = useSnapBeat();
	const end = scene.duration;
	const cutAt = snap(cue(0) + 40);
	const meetAt = snap(cue(1));
	const rwAt = end - 60;
	// the rewind undoes everything in reverse order
	const bp = prog(f, rwAt, 50, (x) => x);
	const seg = (a: number, b: number) => ease.inOut(Math.min(1, Math.max(0, (bp - a) / (b - a))));
	const unMeet = seg(0, 0.3);
	const unRise = seg(0.2, 0.5);
	const unCut = seg(0.45, 0.7);
	const cut = spring({frame: f - cutAt, fps, config: {damping: 12, stiffness: 150}}) * 0.55 * (1 - unCut);
	const rise = prog(f, cutAt + 34, 26, ease.inOut) * (1 - unRise);
	const meet = spring({frame: f - meetAt, fps, config: {damping: 11, stiffness: 220}}) * (1 - unMeet);
	const ripe = bp > 0.85 ? 0 : bp > 0.72 ? 0.6 : 1;
	const flash = f >= meetAt ? Math.exp(-(f - meetAt) / 8) * (1 - unMeet) : 0;
	const outP = prog(f, 0, 16, ease.out);
	const push = 1 + 0.1 * prog(f, cutAt, end - cutAt - 60, ease.inOut);
	const zoom = (0.6 + 0.4 * outP) * push * (1 - 0.55 * seg(0.55, 1));
	// a gleam runs down the middle just before the cut
	const gleam = f >= cutAt - 8 && f < cutAt + 2 ? (f - cutAt + 8) / 10 : -1;
	const sep = (176 + 40 * rise) * (1 - meet) + 3 * meet; // seed centre distance from the middle
	return (
		<FullFrame fadeIn={1} fadeOut={1}>
			<SceneDefs />
			<rect width={W} height={H} fill="#1f2a1a" />
			<Bokeh f={f} n={26} seed="cs" gold={0.5} />
			<g transform={`translate(960,520) scale(${zoom})`}>
				{cut <= 0.001 ? (
					<g transform={`scale(5) rotate(${(-4 + Math.sin(f / 30) * 2) * (1 - unCut)})`}>
						<Cherry r={42} ripe={ripe} />
					</g>
				) : (
					<g transform={`translate(0,${60 * rise})`} opacity={1 - 0.75 * rise}>
						<g transform="scale(5)">
							<Cherry r={42} cut={cut} ripe={ripe} />
						</g>
					</g>
				)}
				{gleam >= 0 ? <rect x={-3} y={-230} width={6} height={460 * gleam} fill="#fff8e0" opacity={0.9} filter="url(#blur-sm)" /> : null}
				{/* juice */}
				{f >= cutAt && f < cutAt + 20
					? Array.from({length: 12}, (_, i) => {
							const a = random(`j${i}`) * Math.PI * 2;
							const d = (f - cutAt) * (6 + random(`jd${i}`) * 8);
							return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d + (f - cutAt) ** 2 * 0.3} r={6 + random(`jr${i}`) * 6} fill="#c0302a" opacity={1 - (f - cutAt) / 20} />;
						})
					: null}
				{/* the two seeds rise out of the fruit and come together, flat face to flat face */}
				{rise > 0
					? [-1, 1].map((d) => (
							<g key={d} transform={`translate(${d * sep},${-50 * rise + 4 * Math.sin(f / 14 + d)})`} opacity={Math.min(1, rise * 2)}>
								<Seed d={d} glow={rise} />
							</g>
						))
					: null}
				{flash > 0.01 ? (
					<g>
						<ellipse cx={0} cy={-50} rx={60 + 120 * (1 - flash)} ry={220} fill="url(#glow-lamp)" opacity={flash} />
						{Array.from({length: 10}, (_, i) => {
							const a = (i / 10) * Math.PI * 2;
							const r0 = 170 + 260 * (1 - flash);
							return <line key={i} x1={Math.cos(a) * r0} y1={-50 + Math.sin(a) * r0} x2={Math.cos(a) * (r0 + 40)} y2={-50 + Math.sin(a) * (r0 + 40)} stroke={color.gold} strokeWidth={5} strokeLinecap="round" opacity={flash} />;
						})}
					</g>
				) : null}
				{meet > 0.5 ? <ellipse cx={0} cy={-50} rx={26} ry={160} fill="url(#glow-lamp)" opacity={0.5 * (1 - unMeet)} /> : null}
			</g>
			<Tape amt={prog(f, rwAt, 10)} f={f} />
			<Dark amt={1 - prog(f, 0, 6)} />
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 8. a flower, and a bee that remembers it

const CaffeineMolecule: React.FC<{o: number}> = ({o}) => (
	<g opacity={o} stroke="#f3cf7a" strokeWidth={5} fill="none" strokeLinejoin="round">
		<path d="M-60,-35 L0,-70 L60,-35 L60,35 L0,70 L-60,35 Z" />
		<path d="M60,-35 L120,-55 L150,0 L120,55 L60,35" />
		<path d="M0,-70 L0,-110 M-60,35 L-100,60 M0,70 L0,110 M150,0 L190,0" />
		<text x={-8} y={-118} style={{fontFamily: font.latin, fontSize: 22, fill: '#f3cf7a', stroke: 'none'}}>O</text>
		<text x={-8} y={136} style={{fontFamily: font.latin, fontSize: 22, fill: '#f3cf7a', stroke: 'none'}}>O</text>
	</g>
);

const Flower: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const scene = useScene();
	const end = scene.duration;
	const open = prog(f, 4, 60, ease.out);
	const wide = prog(f, cue(1) - 6, 30, ease.inOut) * (1 - prog(f, cue(2) - 10, 26, ease.inOut));
	const macro = prog(f, cue(2) - 10, 26, ease.inOut);
	const nectar = prog(f, cue(2) + 10, 20);
	const mol = prog(f, cue(2) + 40, 20);
	// the bee: in along a curve, lands, drinks; later lifts off, loops, and comes at the camera
	const inT = prog(f, cue(3) - 10, 50, ease.out);
	const offT = prog(f, cue(4) + 40, end - cue(4) - 40, ease.in);
	const landed = inT >= 1 && offT <= 0;
	const bx = offT > 0 ? 1050 + Math.cos(offT * 7) * 260 * (1 - offT) + (960 - 1050) * offT : -200 + (1050 + 200) * inT;
	const by = offT > 0 ? 480 + Math.sin(offT * 7) * 150 * (1 - offT) - 60 * offT : 300 + (480 - 300) * inT - Math.sin(inT * Math.PI) * 140;
	const bs = offT > 0 ? 1.6 + 14 * offT ** 3 : 1.6;
	const panel = prog(f, cue(3) + 70, 14) * (1 - prog(f, cue(4) - 10, 12));
	const trail = Array.from({length: 24}, (_, i) => {
		const o = Math.max(0, offT - i * 0.012);
		return [1050 + Math.cos(o * 7) * 260 * (1 - o) + (960 - 1050) * o, 480 + Math.sin(o * 7) * 150 * (1 - o) - 60 * o];
	});
	const ff = prog(f, end - 26, 22);
	return (
		<FullFrame fadeIn={1} fadeOut={1}>
			<SceneDefs />
			<rect width={W} height={H} fill="#3a4a2e" />
			<rect width={W} height={H} fill="url(#sky-morning)" opacity={0.25} />
			<Bokeh f={f} n={34} seed="fl" gold={0.5} />
			{/* the branch in bloom, wide */}
			<g opacity={wide} transform={`translate(${-80 * prog(f, cue(1) - 6, cue(2) - cue(1), ease.inOut)},0)`}>
				{/* a far branch, soft, and a near one across the frame */}
				<g transform="translate(2100,180) rotate(160) scale(1.6)" opacity={0.55} filter="url(#blur-sm)">
					<Branch mode="flower" f={f} seed="wf2" len={900} />
				</g>
				<g transform="translate(-120,900) rotate(-18) scale(3)">
					<Branch mode="flower" f={f} seed="wf" len={760} open={prog(f, cue(1) - 6, 40, ease.out)} />
				</g>
				{Array.from({length: 24}, (_, i) => {
					const u = ((f / 120 + i / 24) % 1);
					return <circle key={i} cx={200 + random(`fx${i}`) * 1500 + Math.sin(u * 8 + i) * 30} cy={800 - u * 600} r={3 + random(`fr${i}`) * 3} fill="#fff4dc" opacity={0.6 * Math.sin(u * Math.PI)} />;
				})}
			</g>
			{/* the one flower: opens out of the rewind, then the camera goes into its heart */}
			<g opacity={1 - wide}>
				<g transform={`translate(1000,500) scale(${(3.2 + 3 * macro) * (0.5 + 0.5 * open) * (1 + 0.025 * Math.sin(f / 22))})`}>
					<CoffeeFlower r={60} open={open} rot={8 + 10 * prog(f, 0, end, ease.inOut) + 2 * Math.sin(f / 37)} />
				</g>
				{/* pollen and scent drifting up out of the flower */}
				{Array.from({length: 18}, (_, i) => {
					const u = (f / 90 + i / 18) % 1;
					const x = 1000 + (random(`pl${i}`) - 0.5) * 260 + Math.sin(u * 6 + i) * 60 * u;
					return <circle key={i} cx={x} cy={500 - u * 520} r={2.5 + 3 * random(`plr${i}`)} fill="#ffe7a8" opacity={0.8 * Math.sin(u * Math.PI) * open} />;
				})}
				<circle cx={1000} cy={500} r={40 + 120 * nectar} fill="url(#glow-lamp)" opacity={nectar * (landed ? 0.6 : 1)} />
				{mol > 0 ? (
					<g opacity={mol * (1 - prog(f, cue(3) - 10, 12))}>
						<line x1={1040} y1={470} x2={1040 + 370 * mol} y2={470 - 110 * mol} stroke={color.gold} strokeWidth={3} strokeDasharray="6 8" />
						<g transform={`translate(1560,340) scale(${0.6 + 0.4 * spring({frame: f - cue(2) - 40, fps, config: {damping: 12}})})`}>
							<circle r={210} fill="#0b0806" opacity={0.6} />
							<g transform="translate(-40,0) scale(1.1)">
								<CaffeineMolecule o={1} />
							</g>
							<text x={0} y={190} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 30, letterSpacing: '0.3em', fill: color.gold}}>
								咖啡因
							</text>
						</g>
					</g>
				) : null}
			</g>
			{/* the memory trail as the bee circles */}
			{offT > 0 ? <polyline points={trail.map((p) => p.join(',')).join(' ')} fill="none" stroke={color.gold} strokeWidth={4} strokeLinecap="round" opacity={0.7} /> : null}
			{inT > 0 ? (
				<g transform={`translate(${bx},${by}) scale(${bs})`}>
					<Bee flap={f * 3} fly={landed ? 0.15 : 1} />
				</g>
			) : null}
			{/* 24 h later, who still remembers the scent */}
			{panel > 0 ? (
				<g transform={`translate(60,${240 + 30 * (1 - panel)}) scale(1.08)`} opacity={panel}>
					<rect x={0} y={0} width={560} height={360} rx={22} fill="#0b0806" opacity={0.6} />
					<text x={280} y={60} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 26, letterSpacing: '0.15em', fill: '#efe6d6'}}>
						24 小时后 · 还记得花香
					</text>
					<text x={40} y={160} style={{fontFamily: font.sans, fontSize: 26, fill: '#c9c1b4'}}>
						普通蜜蜂
					</text>
					<g transform="translate(270,150) scale(0.85)">
						<Bee flap={0} fly={0} />
					</g>
					<text x={40} y={280} style={{fontFamily: font.sans, fontSize: 26, fill: color.gold}}>
						喝过咖啡因
					</text>
					{[0, 1, 2].map((i) => (
						<g key={i} transform={`translate(${270 + i * 86},270) scale(${0.85 * spring({frame: f - cue(3) - 90 - i * 8, fps, config: {damping: 12}})})`}>
							<Bee flap={0} fly={0} />
						</g>
					))}
					<text x={530} y={286} textAnchor="end" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 40, fill: color.gold}} opacity={prog(f, cue(3) + 120, 10)}>
						×3
					</text>
				</g>
			) : null}
			<Tape amt={1 - prog(f, 0, 30)} f={f} />
			<Tape amt={ff} f={f} dir={1} />
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 9. fast-forward home; good morning; end card

const Callback: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const scene = useScene();
	const end = scene.duration;
	const endAt = cue(3) - 6;
	const her = {x: 900, y: 1040, s: 1.7};
	const sip = spring({frame: f - cue(1) + 4, fps, config: {damping: 14}}) * (1 - prog(f, cue(1) + 40, 16, ease.inOut));
	const reach: [number, number] = [70 - 48 * sip, -250 - 40 * sip];
	const lid = lidAt(her.x, her.y, her.s, reach);
	const glow = prog(f, cue(1) + 20, 30);
	const bloom = prog(f, cue(1) + 30, 50, ease.out);
	// the fast-forward montage: every stop flicks past in a few frames
	const MONT = 44;
	const shot = Math.floor(f / 8);
	const montage = f < MONT;
	const cam = camMix(lookAt(990, 640, 1.5), lookAt(lid.x, lid.y - 40, 1.9), prog(f, cue(0), end - cue(0), ease.inOut));
	return (
		<FullFrame
			fadeIn={1}
			fadeOut={1}
			overlay={
				<Sequence from={endAt} layout="none">
					<EndCard v={EPISODE} cfg={BRAND} dur={end - endAt} />
				</Sequence>
			}
		>
			<SceneDefs />
			{montage ? (
				<g>
					{shot === 0 ? <Yunnan t={f} season="harvest" /> : null}
					{shot === 1 ? <CoffeeHouse t={f} kind="london" /> : null}
					{shot === 2 ? <CoffeeHouse t={f} kind="leipzig" /> : null}
					{shot === 3 ? <Kitchen1908 t={f} /> : null}
					{shot >= 4 ? <CafeStreet t={f} /> : null}
				</g>
			) : (
				<Metro
					frame={f}
					travel={f * 14}
					cam={cam}
					sun={1.2 + 0.4 * glow}
					crowd={RIDERS.map(([x, k, fl], i) => (
						<g key={x} transform={`translate(${x}, 960) scale(1.25)`}>
							<Figure look={CAST[k]} pose={POSES.hold} holdNear={<HandCup />} flip={fl} rim="none" silhouette="#3a4250" shadow={false} />
						</g>
					))}
				>
					<g transform={`translate(${her.x}, ${her.y}) scale(${her.s})`}>
						<Figure look={CAST.commuter} pose={POSES.hold} reach={{near: reach}} holdNear={<HandCup />} expression={glow > 0.3 ? 'smile' : 'neutral'} blink={sip > 0.6 ? 0.1 : blinkAt(f, 'cm2')} rim="warm" />
					</g>
					<circle cx={her.x + 40} cy={her.y - 520} r={260} fill="url(#glow-sun)" opacity={0.55 * glow} />
					<g transform={`translate(${lid.x + 6},${lid.y - 4}) scale(0.55)`}>
						<Steam t={f * 2} seed="cb" height={220} width={28} opacity={0.55 * (1 - bloom)} />
					</g>
					{/* the steam curls into the shape of the flower it came from */}
					{bloom > 0 ? (
						<g transform={`translate(${lid.x + 6},${lid.y - 80 - 70 * bloom}) scale(${0.8 + 0.9 * bloom}) rotate(${30 * bloom})`} opacity={Math.min(1, Math.sin(bloom * Math.PI) * 1.4)}>
							{Array.from({length: 5}, (_, i) => (
								<path key={i} d="M0,0 C14,-16 14,-44 0,-56 C-14,-44 -14,-16 0,0 Z" fill="#fff8ec" fillOpacity={0.25} stroke="#fff8ec" strokeWidth={4} transform={`rotate(${i * 72})`} />
							))}
						</g>
					) : null}
				</Metro>
			)}
			<Tape amt={montage ? 1 - prog(f, MONT - 6, 6) : 0} f={f} dir={1} />
			<YearRoll f={f} keys={[[0, 1652], [MONT - 4, 2025]]} show={montage ? 1 : 1 - prog(f, MONT, 10)} arrows="▶▶" />
		</FullFrame>
	);
};

export const scenesPart3 = {Yunnan: Yunnan_, CherryScene, Flower, Callback};
export const scenes: SceneMap = {...scenesPart1, ...scenesPart2, ...scenesPart3};
