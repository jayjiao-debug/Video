import React from 'react';
import {AbsoluteFill, Sequence, interpolateColors, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {noise2D} from '@remotion/noise';
import {Liquid} from '../../src/art/glow/Liquid';
import {AMBER, Ember, Finish, GlowDefs, Label, Motes, Night, Ring} from '../../src/art/glow/kit';
import {ADENOSINE, CAFFEINE, Molecule} from '../../src/art/glow/molecules';
import {EndCard, type BrandCfg, type VideoCfg} from '../../src/brand/Brand';
import {JUNO} from '../../src/brand/identity';
import {ease, prog, useAbsoluteFrame, useBeat, useCue, useHitFrames, useScene, useSnapBeat} from '../../src/lib/context';
import {font} from '../../src/lib/theme';
import type {SceneMap, SceneProps} from '../../src/lib/types';
import {BeanLine, Forest, Relief, Shrub, Tree, ridge} from './look';

/**
 * 《续命》 v2, in the Amber Night look: no characters. Light, liquid, molecules,
 * silhouettes and carved stone carry the story; every shot hands an object to the
 * next (the liquid → the cup → the brain → the sun of the forest → a leaf → a
 * flower → the bee's trail → a carved crescent → a map → a bean → a curve → the cup).
 */

const W = 1920;
const H = 1080;

const BRAND: BrandCfg = {videos: []};
export const EPISODE: VideoCfg = {
	id: 'xuming',
	src: '',
	title: '续命',
	kicker: 'CAFFEINE · ADENOSINE · 600,000 YEARS',
	tagline: '它续的，到底是什么？',
	taglineEn: 'What does your morning cup actually renew?',
	motif: 'coffee',
	card: [0, 3.2],
	hit: 0.5,
	extend: 0,
	question: '你今天第几杯了？评论区报个数',
	sources: '参考 · Denoeud et al., Science (2014) · Nathanson, Science (1984) · Wright et al., Science (2013) · Nature Genetics (2024) · Hattox (1985)',
	duration: 0,
};

// ---------------------------------------------------------------- shared pieces

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/**
 * The stage every scene draws on: an optional HTML layer underneath (WebGL
 * liquid), the SVG art, a soft band under the subtitles, vignette and grain,
 * and HTML overlays on top (title / end card).
 */
const Stage: React.FC<{children: React.ReactNode; under?: React.ReactNode; over?: React.ReactNode; scrim?: number; vig?: number; defs?: React.ReactNode}> = ({
	children,
	under,
	over,
	scrim = 0.55,
	vig = 1,
	defs,
}) => (
	<AbsoluteFill style={{background: AMBER.ink}}>
		{under}
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
			<GlowDefs />
			<defs>
				<linearGradient id="sub-band" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#000" stopOpacity="0" />
					<stop offset="1" stopColor="#000" stopOpacity="0.9" />
				</linearGradient>
				<radialGradient id="ember-red" cx="50%" cy="50%" r="50%">
					<stop offset="0" stopColor="#ffb08a" />
					<stop offset="0.35" stopColor="#d5452e" />
					<stop offset="1" stopColor="#d5452e" stopOpacity="0" />
				</radialGradient>
				<radialGradient id="ember-green" cx="50%" cy="50%" r="50%">
					<stop offset="0" stopColor="#e6ffc0" />
					<stop offset="0.35" stopColor="#9cc46a" />
					<stop offset="1" stopColor="#9cc46a" stopOpacity="0" />
				</radialGradient>
				<radialGradient id="ember-white" cx="50%" cy="50%" r="50%">
					<stop offset="0" stopColor="#ffffff" />
					<stop offset="0.3" stopColor="#fff4dc" stopOpacity="0.7" />
					<stop offset="1" stopColor="#fff4dc" stopOpacity="0" />
				</radialGradient>
				{defs}
			</defs>
			{children}
			<rect x={0} y={830} width={W} height={250} fill="url(#sub-band)" opacity={scrim} />
			<Finish vig={vig} />
		</svg>
		{over}
	</AbsoluteFill>
);

/** The cup's liquid: the WebGL field clipped to a circle of radius `rim` around the centre. */
const CupLiquid: React.FC<{rim: number; t: number; swirl?: number; dim?: number; cool?: number; light?: [number, number, number]; scale?: number; gain?: number; veins?: number}> = ({
	rim,
	t,
	swirl = 0,
	dim = 1,
	cool = 0,
	light = [0.5, 0.42, 0.5],
	scale = 2.2,
	gain = 1.1,
	veins = 1,
}) => (
	<div style={{position: 'absolute', left: 960 - rim, top: 540 - rim, width: rim * 2, height: rim * 2, borderRadius: '50%', overflow: 'hidden', opacity: dim}}>
		<div style={{position: 'absolute', left: rim - 960, top: rim - 540, width: W, height: H}}>
			<Liquid t={t} swirl={swirl} scale={scale} light={light} gain={gain} cool={cool} veins={veins} />
		</div>
	</div>
);

/** Rim, glaze ring and shadow of the cup seen from above. */
const CupRim: React.FC<{rim: number; o?: number}> = ({rim, o = 1}) => (
	<g opacity={o}>
		<circle cx={960} cy={552} r={rim + 80} fill="#000" opacity={0.55} filter="url(#g-lg)" />
		<circle cx={960} cy={540} r={rim + 38} fill="none" stroke="#efe2c8" strokeWidth={58} opacity={0.1} />
		<circle cx={960} cy={540} r={rim + 66} fill="none" stroke={AMBER.cream} strokeWidth={2} opacity={0.4} />
		<circle cx={960} cy={540} r={rim + 6} fill="none" stroke={AMBER.cream} strokeWidth={2} opacity={0.3} />
	</g>
);

/** A small caffeine sign: the purine rings only, as a glowing token. */
const CafToken: React.FC<{s?: number; o?: number; color?: string}> = ({s = 1, o = 1, color = AMBER.gold}) => {
	const B = 18;
	const hex = Array.from({length: 6}, (_, i) => {
		const a = ((-30 + i * 60) * Math.PI) / 180;
		return [-B * 0.866 + B * Math.cos(a), B * Math.sin(a)];
	});
	const pc = 0.688 * B;
	const pent = [-144, -72, 0, 72, 144].map((d) => [pc + 0.8507 * B * Math.cos((d * Math.PI) / 180), 0.8507 * B * Math.sin((d * Math.PI) / 180)]);
	return (
		<g transform={`scale(${s})`} opacity={o} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" filter="url(#g-sm)">
			<polygon points={hex.map((p) => p.join(',')).join(' ')} />
			<polyline points={pent.map((p) => p.join(',')).join(' ')} />
		</g>
	);
};

/** Pointed leaf outline along +x, length `l`. */
const leafD = (l: number, w = 0.32) => `M0,0 C${l * 0.25},${-l * w} ${l * 0.75},${-l * w * 0.8} ${l},0 C${l * 0.75},${l * w * 0.8} ${l * 0.25},${l * w} 0,0 Z`;

/**
 * n event frames inside [a, b): the track's accents first, topped up with beats
 * `step` frames apart, so an animation always lands on the music inside its window.
 */
const useEvents = () => {
	const hits = useHitFrames(0.3);
	const snap = useSnapBeat();
	return (a: number, b: number, n: number, step = 16) => {
		const out = hits.filter((h) => h >= a && h < b).slice(0, n);
		let t = out.length ? out[out.length - 1] : a - step;
		while (out.length < n) {
			t = Math.max(snap(t + step), t + 8);
			out.push(t);
		}
		return out.sort((x, y) => x - y);
	};
};

/** "It never moves once it has landed": a fade-up for text, no drift afterwards. */
const landed = (f: number, at: number, out?: number, outLen = 10) => prog(f, at, 12) * (out === undefined ? 1 : 1 - prog(f, out, outLen));

// ---------------------------------------------------------------- 1. hook: liquid gold, two billion cups, a heartbeat

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

const Hook: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const cue0 = useCue();
	const cue = (i: number, o = 0) => cue0(i + 1, o); // line 0 is the opening pause
	const scene = useScene();
	const snap = useSnapBeat();
	const beat = useBeat(8);
	const end = scene.duration;
	const t = af / 30 + 10;
	// pull back: the frame of liquid turns out to be one cup
	const backStart = cue(2) + 40;
	const back = prog(f, backStart, end - backStart - 2, ease.inOut);
	const rim = mix(1300, 380, back);
	const swirl = 0.3 + 4.6 * prog(f, backStart, end - backStart, ease.in);
	// two billion
	const cAt = cue(0) + 6;
	const count = prog(f, cAt, 54, ease.out);
	const cO = landed(f, cAt - 4, cue(1) - 10);
	// the heartbeat: a gold ECG line, one spike per beat
	const ecgO = prog(f, cue(1) - 4, 14) * (1 - prog(f, cue(2) + 30, 20));
	const beats: number[] = [];
	for (let b = snap(cue(1)); b < cue(2) + 60; b += 0) {
		beats.push(b);
		const nb = snap(b + 18);
		b = nb > b ? nb : b + 15;
	}
	const head = 1460;
	const ecg = (() => {
		let d = '';
		for (let x = head - 1400; x <= head; x += 4) {
			const tx = f - (head - x) / 9;
			let v = 0;
			for (const b of beats) {
				const k = tx - b;
				if (k >= 0 && k < 9) v += k < 2 ? -0.15 * k : k < 4 ? 1.0 * Math.sin(((k - 2) / 2) * Math.PI) : k < 6 ? -0.35 * Math.sin(((k - 4) / 2) * Math.PI) : 0;
			}
			d += `${d ? 'L' : 'M'}${x},${540 - v * 170} `;
		}
		return d;
	})();
	return (
		<Stage
			under={
				<>
					<CupLiquid rim={rim} t={t} swirl={swirl} gain={0.95 + 0.18 * beat * ecgO} veins={0.85} scale={2.2 + 1.2 * back} light={[mix(0.66, 0.5, back), mix(0.36, 0.45, back), mix(0.55, 0.35, back)]} />
				</>
			}
		>
			<CupRim rim={rim} o={prog(f, backStart + 20, 30)} />
			<Motes f={af} n={60} seed="hk" ring o={0.7 * (1 - back)} />
			{/* a dark pool behind the number so it reads */}
			<ellipse cx={960} cy={500} rx={760} ry={230} fill="#000" opacity={0.55 * cO} filter="url(#g-lg)" />
			<g opacity={cO}>
				<text x={960} y={540} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 168, fill: 'url(#gold-text)', letterSpacing: '0.02em'}} filter="url(#g-sm)">
					{fmt(2e9 * count)}
				</text>
				<text x={960} y={610} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 30, letterSpacing: '0.5em', fill: AMBER.cream}} opacity={0.8 * prog(f, cAt + 40, 14)}>
					杯 / 每一天 · 全世界
				</text>
			</g>
			{/* heartbeat */}
			<rect x={0} y={330} width={W} height={420} fill="#000" opacity={0.5 * ecgO} filter="url(#g-lg)" />
			<g opacity={ecgO}>
				<path d={ecg} fill="none" stroke={AMBER.gold} strokeWidth={4} strokeLinejoin="round" filter="url(#g-md)" />
				<Ember x={head} y={540} r={46} />
			</g>
		</Stage>
	);
};

// ---------------------------------------------------------------- 2. sleep: the title, then adenosine, receptors and the key

/** The title gathering out of the stirred cup (lands on the scene's first frame, the music's hit). */
const XTitle: React.FC<{f: number}> = ({f}) => {
	const gather = prog(f, -2, 26, ease.out);
	const ripple = prog(f, 0, 40, ease.out);
	const meta = (d: number) => prog(f, d, 16);
	const out = 1 - prog(f, 140, 14);
	return (
		<g opacity={out}>
			<defs>
				<filter id="pour" x="-30%" y="-60%" width="160%" height="220%">
					<feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves={2} seed={5} />
					<feDisplacementMap in="SourceGraphic" scale={140 * (1 - gather)} xChannelSelector="R" yChannelSelector="G" />
				</filter>
			</defs>
			{ripple < 1 ? (
				<g fill="none" stroke={AMBER.gold}>
					<circle cx={960} cy={540} r={60 + 900 * ripple} strokeWidth={3} opacity={0.7 * (1 - ripple)} filter="url(#g-sm)" />
					<circle cx={960} cy={540} r={40 + 600 * ripple} strokeWidth={2} opacity={0.5 * (1 - ripple)} />
				</g>
			) : null}
			<text x={960} y={592} textAnchor="middle" filter="url(#pour)" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 210, fill: 'url(#gold-text)', letterSpacing: '0.12em'}} opacity={prog(f, -2, 10)}>
				续命
			</text>
			<text x={960} y={592} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 210, fill: AMBER.gold, letterSpacing: '0.12em'}} opacity={0.35 * gather} filter="url(#g-lg)">
				续命
			</text>
			<text x={960} y={330} textAnchor="middle" opacity={meta(10)} style={{fontFamily: font.sans, fontSize: 20, letterSpacing: '0.42em', fill: AMBER.amber, fontWeight: 600}}>
				{EPISODE.kicker}
			</text>
			<text x={960} y={720} textAnchor="middle" opacity={meta(18)} style={{fontFamily: font.serif, fontWeight: 700, fontSize: 40, fill: AMBER.cream, letterSpacing: '0.1em'}}>
				{EPISODE.tagline}
			</text>
			<text x={960} y={768} textAnchor="middle" opacity={0.7 * meta(24)} style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 28, fill: AMBER.cream}}>
				{EPISODE.taglineEn}
			</text>
			<text x={960} y={850} textAnchor="middle" opacity={0.75 * meta(30)} style={{fontFamily: font.sans, fontSize: 22, letterSpacing: '0.3em', fill: JUNO.colors.gold}}>
				— {JUNO.credit} · {JUNO.series} —
			</text>
		</g>
	);
};

const RECEPTORS = [300, 640, 980, 1320, 1640].map((x, i) => ({x, y: 790 - 26 * Math.sin(i * 1.3 + 0.4)}));
const membraneD = 'M-40,800 C400,740 900,850 1960,770';

/** Sleepiness as eyelids: dark bands closing from top and bottom. */
const Eyelids: React.FC<{k: number}> = ({k}) =>
	k <= 0 ? null : (
		<g>
			<rect x={-50} y={-200} width={W + 100} height={200 + 300 * k} fill="#000" filter="url(#g-lg)" />
			<rect x={-50} y={H - 300 * k} width={W + 100} height={300 * k + 200} fill="#000" filter="url(#g-lg)" />
			<rect width={W} height={H} fill="#000" opacity={0.35 * k} />
		</g>
	);

const Sleep: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const scene = useScene();
	const events = useEvents();
	const end = scene.duration;
	const t = af / 30 + 10;
	// title in the cup, then the dive into it: coffee turns into the cool dark of the brain
	const dive = prog(f, 140, 36, ease.in);
	const rim = mix(380, 1400, dive);
	const cool = prog(f, 150, 40, ease.inOut);
	const swirl = mix(4.9, 1.2, prog(f, 0, 60, ease.out)) * (1 - dive);
	const brain = prog(f, 168, 20);
	// membrane and receptors arrive
	const mem = prog(f, 172, 30, ease.inOut);
	// adenosine: a dot at a time while you're awake
	const A0 = cue(0) + 4;
	const dots = Array.from({length: 64}, (_, i) => ({
		at: A0 + i * 2.3,
		x: 120 + random(`ax${i}`) * 1680,
		y: 170 + random(`ay${i}`) * 520,
	}));
	// the first five sink into the receptors during line 1
	const dockAt = (k: number) => cue(1) + 10 + k * 16;
	// molecules shot
	const molIn = prog(f, cue(2) - 10, 12);
	const molOut = prog(f, cue(3) - 12, 12);
	const molShot = f >= cue(2) - 10 && f < cue(3);
	const slide = prog(f, cue(2) + 84, 30, ease.inOut);
	// caffeine docks on the beats after line 3
	const cafHits = events(cue(3) + 4, cue(4) - 4, 5, 14);
	const cafAt = (k: number) => cafHits[k];
	// sleepiness rises during line 1, is snapped off by the molecules, then fades for good as caffeine docks
	const sleepy = prog(f, cue(1), cue(2) - cue(1) - 16, ease.inOut) * (1 - prog(f, cue(2) - 14, 8));
	// adenosine leaves during line 4; light comes back
	const leave = prog(f, cue(4), 70, ease.in);
	const warm = prog(f, cue(4), 60);
	// pull back into the network, then the network flares into a sun
	const pull = prog(f, cue(5), end - cue(5) - 20, ease.inOut);
	const flare = prog(f, end - 22, 22, ease.in);
	const netScale = mix(1, 0.32, pull);
	return (
		<Stage
			under={
				<>
					<CupLiquid rim={rim} t={t} swirl={swirl} cool={cool} dim={mix(1, 0.5, brain) * (1 - 0.6 * warm)} gain={mix(1.1, 0.62, brain)} veins={mix(1, 0.6, brain)} scale={mix(3.4, 2.0, dive)} light={[0.5, 0.45, mix(0.35, 0.8, dive)]} />
				</>
			}
			over={
				<Sequence durationInFrames={170} layout="none">
					<AbsoluteFill>
						<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
							<GlowDefs />
							<XTitle f={f} />
						</svg>
					</AbsoluteFill>
				</Sequence>
			}
		>
			<CupRim rim={rim} o={1 - prog(f, 140, 20)} />
			{/* warm light returning once the receptors are blocked */}
			<circle cx={960} cy={500} r={900} fill="url(#warm-pool)" opacity={warm * (1 - flare)} />
			{!molShot && brain > 0 ? (
				<g transform={`translate(960,${mix(540, 470, pull)}) scale(${netScale}) translate(-960,-540)`} opacity={brain}>
					{/* the wider network appears as we pull back */}
					{pull > 0
						? Array.from({length: 46}, (_, i) => {
								const a = random(`na${i}`) * Math.PI * 2;
								const r = 900 + random(`nr${i}`) * 1600;
								const x = 960 + Math.cos(a) * r * 1.4;
								const y = 540 + Math.sin(a) * r * 0.9;
								const j = (i * 7 + 3) % 46;
								const a2 = random(`na${j}`) * Math.PI * 2;
								const r2 = 900 + random(`nr${j}`) * 1600;
								return (
									<g key={i} opacity={pull}>
										<line x1={x} y1={y} x2={960 + Math.cos(a2) * r2 * 1.4} y2={540 + Math.sin(a2) * r2 * 0.9} stroke={AMBER.gold} strokeWidth={6} opacity={0.25} />
										<Ember x={x} y={y} r={90} o={0.8} />
									</g>
								);
							})
						: null}
					{/* the membrane of one neuron, receptors along it */}
					<path d={membraneD} stroke={warm > 0.5 ? AMBER.gold : AMBER.cyan} strokeWidth={3} fill="none" opacity={0.65 * (1 - 0.5 * pull)} filter="url(#g-sm)" strokeDasharray={2400} strokeDashoffset={2400 * (1 - mem)} />
					<path d={`${membraneD} L1960,1200 L-40,1200 Z`} fill="#081a20" opacity={0.65 * mem * (1 - pull)} />
					{RECEPTORS.map((r, k) => {
						const pop = spring({frame: f - 186 - k * 6, fps, config: {damping: 12}});
						const caf = f >= cafAt(k);
						const docked = f >= dockAt(k) + 18 && !caf;
						const c = caf ? AMBER.gold : AMBER.cyan;
						return (
							<g key={k} transform={`translate(${r.x},${r.y}) scale(${pop})`}>
								<Ring x={0} y={0} r={50} color={c} dash={caf ? undefined : '10 9'} w={3} fill={caf ? 0.15 : 0.05} />
								{docked ? <Ember x={0} y={0} r={34} /> : null}
								{caf ? (
									<g transform={`scale(${1 + 0.4 * Math.exp(-(f - cafAt(k)) / 6)})`}>
										<CafToken s={1.1} />
									</g>
								) : null}
							</g>
						);
					})}
					{/* adenosine */}
					{dots.map((d, i) => {
						if (f < d.at) return null;
						const o = prog(f, d.at, 8);
						let x = d.x + 18 * noise2D(`dn${i}`, f / 90, 0);
						let y = d.y + 14 * noise2D(`dm${i}`, 0, f / 80);
						if (i < 5) {
							// sinks into receptor i, later kicked out by caffeine
							const r = RECEPTORS[i];
							const sink = prog(f, dockAt(i), 18, ease.inOut);
							const kick = prog(f, cafAt(i), 20, ease.out);
							x = mix(x, r.x, sink * (1 - kick)) + kick * 120 * (i % 2 ? 1 : -1);
							y = mix(y, r.y, sink * (1 - kick)) - kick * 260;
							if (sink >= 1 && kick <= 0) return null; // drawn as the receptor's ember
						}
						y -= leave * (700 + 300 * random(`lv${i}`));
						return <circle key={i} cx={x} cy={y} r={7 + 3 * random(`ar${i}`)} fill={AMBER.amber} opacity={o * (1 - leave)} filter="url(#g-sm)" />;
					})}
					{/* caffeine tokens falling into place */}
					{RECEPTORS.map((r, k) => {
						const at = cafAt(k);
						if (f < at - 24 || f >= at) return null;
						const u = prog(f, at - 24, 24, ease.in);
						return (
							<g key={k} transform={`translate(${r.x + (1 - u) * 60 * (k % 2 ? -1 : 1)},${mix(-60, r.y, u)}) rotate(${(1 - u) * 90})`}>
								<CafToken s={1.1} />
							</g>
						);
					})}
				</g>
			) : null}
			{/* the key and the lock */}
			{molShot ? (
				<g opacity={molIn * (1 - molOut)}>
					<rect width={W} height={H} fill={AMBER.ink} opacity={0.92} />
					<circle cx={960} cy={480} r={700} fill="url(#warm-pool)" opacity={0.6} />
					<g transform="translate(640,430) scale(1.3)">
						<Molecule mol={ADENOSINE} draw={prog(f, cue(2) - 6, 34, ease.inOut)} color={AMBER.cream} coreColor={AMBER.cyan} coreGlow={prog(f, cue(2) + 56, 16)} w={3.5} />
					</g>
					<g transform={`translate(${mix(1360, 640, slide)},${mix(470, 430, slide)}) scale(1.3)`} opacity={1 - 0.15 * slide}>
						<Molecule mol={CAFFEINE} draw={prog(f, cue(2) + 14, 34, ease.inOut)} color={AMBER.gold} coreColor={AMBER.cyan} coreGlow={prog(f, cue(2) + 56, 16)} w={3.5} />
					</g>
					{slide >= 1 ? <circle cx={640 - 31 * 1.3} cy={430} r={60 + 200 * prog(f, cue(2) + 114, 20)} fill="none" stroke={AMBER.cyan} strokeWidth={3} opacity={1 - prog(f, cue(2) + 114, 20)} /> : null}
					<text x={600} y={880} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 40, fill: AMBER.cream}} opacity={prog(f, cue(2) + 20, 12) * (1 - slide)}>
						腺苷
					</text>
					<text x={1320} y={880} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 40, fill: AMBER.gold}} opacity={prog(f, cue(2) + 40, 12) * (1 - slide)}>
						咖啡因
					</text>
					<Label en="Purine core" zh="同一个嘌呤骨架 · 青色部分" o={prog(f, cue(2) + 60, 12)} />
				</g>
			) : (
				<>
					<Label en="Adenosine" zh="腺苷 · 清醒时在脑中慢慢积累" o={landed(f, cue(0), cue(2) - 14)} />
					<Label en="Adenosine receptor" zh="腺苷受体 · 咖啡因占位" o={landed(f, cue(3), cue(5))} />
				</>
			)}
			<Eyelids k={sleepy} />
			<rect width={W} height={H} fill="#fff1d0" opacity={flare} />
		</Stage>
	);
};

export const scenesPart1 = {Hook, Sleep};
export {Stage, CupLiquid, CupRim, CafToken, leafD, landed, clamp, mix, W, H, BRAND};

// ---------------------------------------------------------------- 3. origin: the forest, two wild coffees, arabica

const Origin: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const scene = useScene();
	const events = useEvents();
	const end = scene.duration;
	const fromFlare = 1 - prog(f, 0, 22, ease.out);
	const crane = prog(f, 0, 210, ease.inOut);
	const dy = mix(460, 0, crane);
	// the key (the caffeine rings) sinks with the camera into the forest
	const keyY = mix(380, 800, prog(f, 30, 190, ease.inOut));
	const keyO = prog(f, 4, 16) * (1 - prog(f, 200, 24));
	// the cross
	const parents = prog(f, cue(2) - 24, 24);
	const pollen = prog(f, cue(2) + 2, 44, ease.inOut);
	const burstAt = events(cue(2) + 40, cue(2) + 70, 1, 12)[0];
	const burst = f >= burstAt ? Math.exp(-(f - burstAt) / 10) : 0;
	const grow = spring({frame: f - burstAt, fps, config: {damping: 16, stiffness: 70}});
	const eq = landed(f, burstAt + 10, end - 24);
	// push into the new plant's leaves
	const push = prog(f, end - 20, 20, ease.in);
	return (
		<Stage>
			<g transform={`translate(960,520) scale(${1 + 5 * push ** 2}) translate(-960,-520)`}>
				<g transform={`translate(0,${dy})`}>
					<Forest f={af} />
					{/* parents: Coffea eugenioides (left) and C. canephora (right) */}
					<g opacity={parents}>
						<g transform="translate(330,1090) scale(0.95)">
							<Shrub f={af} glow={0.8} />
						</g>
						<g transform="translate(1590,1090) scale(-0.95,0.95)">
							<Shrub f={af + 40} glow={0.8} />
						</g>
					</g>
					{f >= burstAt ? (
						<g transform={`translate(960,1095) scale(${1.25 * grow})`}>
							<Shrub f={af + 80} glow={1} />
						</g>
					) : null}
				</g>
				<Motes f={af} n={60} seed="or" o={0.7} />
				{/* pollen drifting from both parents to the middle */}
				{pollen > 0 && pollen < 1
					? Array.from({length: 36}, (_, i) => {
							const side = i % 2 ? 1 : -1;
							const u = clamp(pollen * 1.4 - (i / 36) * 0.4);
							if (u <= 0 || u >= 1) return null;
							const x0 = 960 + side * 600;
							const x = mix(x0 + 40 * Math.sin(i), 960, u);
							const y = mix(640 + 60 * Math.cos(i), 760, u) - Math.sin(u * Math.PI) * 180;
							return <circle key={i} cx={x} cy={y} r={4 + 3 * random(`pl${i}`)} fill={AMBER.gold} opacity={Math.sin(u * Math.PI)} filter="url(#g-sm)" />;
						})
					: null}
				{burst > 0.01 ? (
					<g>
						<Ember x={960} y={760} r={120 + 200 * (1 - burst)} o={burst} />
						<circle cx={960} cy={760} r={40 + 500 * (1 - burst)} fill="none" stroke={AMBER.gold} strokeWidth={3} opacity={burst} />
					</g>
				) : null}
				{keyO > 0 ? (
					<g transform={`translate(960,${keyY}) scale(${mix(3, 0.8, prog(f, 30, 190))})`} opacity={keyO}>
						<CafToken s={1} />
					</g>
				) : null}
			</g>
			{/* tags */}
			<g opacity={parents * (1 - prog(f, end - 24, 12))}>
				{[
					[330, 'Coffea eugenioides'],
					[1590, 'Coffea canephora'],
				].map(([x, n]) => (
					<g key={n as string}>
						<text x={x as number} y={500} textAnchor="middle" style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 34, fill: AMBER.cream}} opacity={0.85}>
							{n}
						</text>
						<text x={x as number} y={544} textAnchor="middle" style={{fontFamily: font.latin, fontSize: 28, fill: AMBER.gold, letterSpacing: '0.1em'}}>
							2n = 22
						</text>
					</g>
				))}
			</g>
			<g opacity={eq}>
				<text x={960} y={250} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 92, fill: 'url(#gold-text)', letterSpacing: '0.06em'}} filter="url(#g-sm)">
					22 + 22 → 44
				</text>
				<text x={960} y={304} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 26, letterSpacing: '0.3em', fill: AMBER.cream}} opacity={0.8}>
					染色体 · 阿拉比卡是四倍体
				</text>
			</g>
			<Label en="Coffea arabica · SW Ethiopia" zh="埃塞俄比亚西南高地森林 · 约 60 万年前" o={landed(f, cue(1), end - 20)} />
			<rect width={W} height={H} fill="#fff1d0" opacity={fromFlare} />
			<rect width={W} height={H} fill="#0b0806" opacity={push} />
		</Stage>
	);
};

// ---------------------------------------------------------------- 4. defense: a leaf, a caterpillar, the soil, three inventions

const LEAF_L = 1400;
const LEAF_W = 0.3;
/** a point on the leaf's upper edge, u from base (0) to tip (1) */
const leafEdge = (u: number): [number, number] => {
	const l = LEAF_L;
	const w = LEAF_W;
	const p = [
		[0, 0],
		[l * 0.25, -l * w],
		[l * 0.75, -l * w * 0.8],
		[l, 0],
	];
	const v = 1 - u;
	const b = [v ** 3, 3 * v * v * u, 3 * v * u * u, u ** 3];
	return [b.reduce((s, k, i) => s + k * p[i][0], 0), b.reduce((s, k, i) => s + k * p[i][1], 0)];
};

const Caterpillar: React.FC<{f: number; curl?: number; twitch?: number}> = ({f, curl = 0, twitch = 0}) => (
	<g>
		{Array.from({length: 9}, (_, i) => {
			const wave = Math.sin(f / 4 - i * 0.8) * 7 * (1 - curl);
			const a = (i / 9) * Math.PI * 1.7 * curl;
			const x = mix(i * 34, 60 * Math.sin(a), curl) + twitch * (random(`tw${i}${Math.floor(f / 2)}`) - 0.5) * 14;
			const y = mix(-wave, -60 + 60 * Math.cos(a), curl);
			return (
				<g key={i}>
					<circle cx={x} cy={y} r={i === 0 ? 24 : 21} fill="#120c06" stroke={AMBER.amber} strokeWidth={2} strokeOpacity={0.7} />
					{i === 0 ? <circle cx={x - 8} cy={y - 6} r={3.5} fill={AMBER.cream} /> : null}
				</g>
			);
		})}
	</g>
);

const Defense: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const scene = useScene();
	const events = useEvents();
	const end = scene.duration;
	const veins = prog(f, 0, 50, ease.inOut);
	// caterpillar along the upper edge toward the base, bite, twitch, curl, fall
	const crawl = prog(f, cue(1) - 4, 60, ease.inOut);
	const biteAt = cue(1) + 64;
	const bite = prog(f, biteAt, 8);
	const twitch = f > biteAt + 10 && f < biteAt + 42 ? 1 : 0;
	const curl = prog(f, biteAt + 40, 14, ease.inOut);
	const fall = prog(f, biteAt + 50, 34, ease.in);
	const cu = mix(0.94, 0.6, crawl);
	const [ex, ey] = leafEdge(cu);
	// tilt down to the soil
	const tilt = prog(f, cue(2) - 6, 32, ease.inOut);
	const soilOut = prog(f, cue(3) - 12, 14);
	const treeIn = prog(f, cue(3) - 4, 20);
	const tipHits = events(cue(3) + 30, end - 30, 3, 16);
	const lit = tipHits.map((h) => spring({frame: f - h, fps, config: {damping: 14}}));
	const dive = prog(f, end - 18, 18, ease.in);
	const leafSway = Math.sin(af / 40) * 0.8;
	return (
		<Stage
			defs={
				<mask id="bite">
					<rect x={-200} y={-600} width={1800} height={1200} fill="#fff" />
					<circle cx={leafEdge(0.6)[0]} cy={leafEdge(0.6)[1] - 6} r={64 * bite} fill="#000" />
					<circle cx={leafEdge(0.57)[0]} cy={leafEdge(0.57)[1] - 2} r={44 * bite} fill="#000" />
				</mask>
			}
		>
			<Night x={960} y={500} r={900} />
			<g opacity={1 - soilOut}>
				<g transform={`translate(0,${-1080 * tilt})`}>
					{/* the leaf, close up, veins lit with the caffeine it carries */}
					<g transform={`translate(240,600) rotate(${-8 + leafSway})`}>
						<g mask="url(#bite)">
							<path d={leafD(LEAF_L, LEAF_W)} fill="#0e170c" stroke={AMBER.amber} strokeWidth={2} strokeOpacity={0.5} />
							<g stroke={AMBER.gold} fill="none" strokeLinecap="round" filter="url(#g-sm)" opacity={0.85}>
								<path d={`M0,0 C${LEAF_L * 0.3},-10 ${LEAF_L * 0.7},-6 ${LEAF_L},0`} strokeWidth={4} strokeDasharray={1500} strokeDashoffset={1500 * (1 - veins)} />
								{Array.from({length: 9}, (_, i) => {
									const x = LEAF_L * (0.1 + i * 0.09);
									const len = 260 * Math.sin(((i + 1) / 10) * Math.PI) + 40;
									const k = clamp(veins * 1.6 - i * 0.07);
									return (
										<g key={i} strokeWidth={2.5}>
											<path d={`M${x},-4 Q${x + len * 0.5},${-len * 0.25} ${x + len * 0.8},${-len * 0.55}`} strokeDasharray={400} strokeDashoffset={400 * (1 - k)} />
											<path d={`M${x},4 Q${x + len * 0.5},${len * 0.25} ${x + len * 0.8},${len * 0.55}`} strokeDasharray={400} strokeDashoffset={400 * (1 - k)} />
										</g>
									);
								})}
							</g>
							{/* caffeine riding the veins */}
							{Array.from({length: 14}, (_, i) => {
								const u = ((af / 160 + i / 14) % 1) * 0.95;
								return <circle key={i} cx={u * LEAF_L} cy={Math.sin(u * 30 + i) * 3} r={5} fill={AMBER.gold} opacity={veins * Math.sin(u * Math.PI)} filter="url(#g-sm)" />;
							})}
						</g>
						{f >= cue(1) - 4 && fall < 1 ? (
							<g transform={`translate(${ex},${ey + 900 * fall}) rotate(${-14 + 200 * fall})`}>
								<Caterpillar f={af} curl={curl} twitch={twitch} />
								{twitch
									? Array.from({length: 8}, (_, i) => {
											const a = random(`sp${i}${Math.floor(f / 3)}`) * Math.PI * 2;
											return <line key={i} x1={Math.cos(a) * 30} y1={Math.sin(a) * 30 - 10} x2={Math.cos(a) * 70} y2={Math.sin(a) * 70 - 10} stroke={AMBER.cyan} strokeWidth={3} opacity={0.8} />;
										})
									: null}
							</g>
						) : null}
					</g>
					{/* the soil below */}
					<g transform="translate(0,1080)">
						<rect y={330} width={W} height={900} fill="#21140b" />
						<rect y={330} width={W} height={900} filter="url(#stone)" opacity={0.18} />
						<path d={`M0,330 ${Array.from({length: 25}, (_, i) => `L${i * 80},${330 + 8 * Math.sin(i * 1.7)}`).join(' ')} L1920,330`} stroke={AMBER.amber} strokeWidth={2} fill="none" opacity={0.6} />
						{/* leaves falling and lying on the ground */}
						{[0, 1, 2, 3].map((i) => {
							if (f < cue(2) - 6) return null;
							const u = prog(f, cue(2) + i * 14, 70, ease.out);
							const x = 300 + i * 430 + 60 * Math.sin(u * 6 + i);
							const y = mix(-500, 318, u);
							return (
								<g key={i} transform={`translate(${x},${y}) rotate(${mix(40 + i * 30, 175 + i * 4, u)})`}>
									<path d={leafD(150, 0.3)} fill="#16200f" stroke={AMBER.amber} strokeWidth={1.5} strokeOpacity={0.6} />
								</g>
							);
						})}
						{/* caffeine seeping down */}
						{Array.from({length: 40}, (_, i) => {
							const s0 = cue(2) + 60 + (i % 10) * 4;
							const u = prog(f, s0, 110, (x) => x);
							if (u <= 0) return null;
							const x = 300 + (i % 4) * 430 + 120 * (random(`sx${i}`) - 0.5);
							return <circle key={i} cx={x} cy={330 + u * 420 * (0.6 + 0.6 * random(`sy${i}`))} r={4} fill={AMBER.gold} opacity={0.8 * Math.sin(u * Math.PI) + 0.2} filter="url(#g-sm)" />;
						})}
						{/* seeds trying to sprout and stopping */}
						{Array.from({length: 6}, (_, i) => {
							const x = 220 + i * 300;
							const y = 560 + 70 * Math.sin(i * 2.1);
							const g = prog(f, cue(2) + 30 + i * 8, 40, ease.out);
							const stop = prog(f, cue(2) + 100 + i * 6, 30, ease.inOut);
							const len = 70 * g;
							const droop = 50 * stop;
							return (
								<g key={i} transform={`translate(${x},${y}) scale(1.7)`} opacity={1 - 0.6 * stop}>
									<ellipse rx={22} ry={14} fill="#3a2a16" stroke={AMBER.amber} strokeWidth={2} />
									<path d={`M0,-10 Q${droop * 0.3},${-len} ${droop},${-len + droop * 0.6}`} stroke={AMBER.green} strokeWidth={4} fill="none" strokeLinecap="round" />
									<path d={`M0,10 L${4 * g},${10 + 50 * g}`} stroke={AMBER.dim} strokeWidth={3} />
								</g>
							);
						})}
					</g>
				</g>
				<Label en="Caffeine · a natural pesticide" zh="咖啡因 · 天然的杀虫剂 · Nathanson, Science 1984" o={landed(f, cue(1), cue(2) - 6)} />
				<Label en="Allelopathy" zh="化感作用 · 树下的土壤抑制别的种子发芽" o={landed(f, cue(2) + 20, cue(3) - 12)} />
			</g>
			{treeIn > 0 ? (
				<g opacity={treeIn}>
					<g transform={`translate(1360,420) scale(${1 + 7 * dive ** 2}) translate(-1360,-420)`}>
						<g transform="translate(1000,420)">
							<Tree lit={lit} draw={prog(f, cue(3) - 4, 34)} />
						</g>
					</g>
					<Label en="Convergent evolution" zh="趋同演化 · Denoeud et al., Science 2014" o={landed(f, cue(3) + 10, end - 16)} />
				</g>
			) : null}
			<rect width={W} height={H} fill="#fff4dc" opacity={dive ** 2} />
		</Stage>
	);
};

// ---------------------------------------------------------------- 5. bees: a flower, a little caffeine, three times the memory

const GlowFlower: React.FC<{open: number; f: number; r?: number; o?: number}> = ({open, f, r = 230, o = 1}) => (
	<g opacity={o} transform={`rotate(${6 * Math.sin(f / 70)})`}>
		{Array.from({length: 5}, (_, i) => (
			<g key={i} transform={`rotate(${i * 72 - 90 + (1 - open) * 40}) scale(${0.15 + 0.85 * open})`}>
				<path d={leafD(r, 0.24)} fill="#fff8ea" fillOpacity={0.14} stroke="#fff4dc" strokeWidth={3} filter="url(#g-sm)" />
				<path d={`M20,0 L${r * 0.8},0`} stroke="#fff4dc" strokeWidth={1.2} opacity={0.4} />
			</g>
		))}
		{Array.from({length: 5}, (_, i) => {
			const a = ((i * 72 - 54) * Math.PI) / 180;
			const l = 90 * open;
			return (
				<g key={i}>
					<line x1={0} y1={0} x2={Math.cos(a) * l} y2={Math.sin(a) * l} stroke={AMBER.gold} strokeWidth={2.5} />
					<ellipse cx={Math.cos(a) * l} cy={Math.sin(a) * l} rx={6} ry={12} transform={`rotate(${(a * 180) / Math.PI + 90},${Math.cos(a) * l},${Math.sin(a) * l})`} fill={AMBER.gold} opacity={open} />
				</g>
			);
		})}
	</g>
);

const GlowBee: React.FC<{f: number; s?: number; face?: 1 | -1}> = ({f, s = 1, face = 1}) => {
	const flap = 0.25 + 0.75 * Math.abs(Math.sin(f * 1.3));
	return (
		<g transform={`scale(${s * face},${s})`} strokeLinecap="round">
			<g opacity={0.75}>
				<ellipse cx={-6} cy={-30} rx={34} ry={20 * flap} transform="rotate(-20,-6,-30)" fill="#fff4dc" fillOpacity={0.18} stroke="#fff4dc" strokeWidth={2} />
				<ellipse cx={14} cy={-26} rx={26} ry={15 * flap} transform="rotate(10,14,-26)" fill="#fff4dc" fillOpacity={0.14} stroke="#fff4dc" strokeWidth={2} />
			</g>
			<g filter="url(#g-sm)">
				<ellipse cx={-10} cy={0} rx={42} ry={25} fill="#2a1a08" stroke={AMBER.gold} strokeWidth={3} />
				{[-28, -12, 4].map((x) => (
					<path key={x} d={`M${x},-23 Q${x + 6},0 ${x},23`} stroke={AMBER.gold} strokeWidth={5} fill="none" />
				))}
				<circle cx={42} cy={-4} r={17} fill="#2a1a08" stroke={AMBER.gold} strokeWidth={3} />
				<path d="M52,-18 Q60,-40 72,-44 M46,-20 Q48,-42 58,-50" stroke={AMBER.gold} strokeWidth={2} fill="none" />
				<path d="M-52,0 L-64,2" stroke={AMBER.gold} strokeWidth={3} />
			</g>
		</g>
	);
};

const Bees: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const scene = useScene();
	const events = useEvents();
	const end = scene.duration;
	const fromWhite = 1 - prog(f, 0, 16, ease.out);
	const open = prog(f, 2, 50, ease.out);
	const C = {x: 960, y: 500};
	// flower slides left for the chart, and back
	const side = prog(f, cue(2) - 10, 30, ease.inOut) * (1 - prog(f, cue(3) - 8, 26, ease.inOut));
	const fx = C.x - 430 * side;
	// the bee: in along a curve, lands; later circles the flower and leaves its trail as a crescent
	const land = {x: fx + 60, y: C.y - 40};
	const inU = prog(f, cue(0) + 4, 60, ease.inOut);
	const offStart = cue(3) + 10;
	const offEnd = end - 34;
	const beeAt = (g: number): [number, number] => {
		if (g < offStart) {
			const u = prog(g, cue(0) + 4, 60, ease.inOut);
			const x0 = -120;
			const y0 = 260;
			const lx = C.x - 430 * (prog(g, cue(2) - 10, 30, ease.inOut) * (1 - prog(g, cue(3) - 8, 26, ease.inOut))) + 60;
			return [mix(x0, lx, u), mix(y0, C.y - 40, u) - Math.sin(u * Math.PI) * 220 + 6 * Math.sin(g / 9) * (u >= 1 ? 1 : 0)];
		}
		const u = prog(g, offStart, offEnd - offStart, ease.inOut);
		const th = -0.4 + u * Math.PI * 2.6;
		const r = 320 + 60 * Math.sin(u * Math.PI);
		const lift = u > 0.8 ? (u - 0.8) / 0.2 : 0;
		return [C.x + Math.cos(th) * r * (1 - 0.6 * lift), C.y + Math.sin(th) * r * 0.75 * (1 - lift) + mix(0, -200, lift)];
	};
	const [bx, by] = beeAt(f);
	const [px, py] = beeAt(f - 1);
	const face: 1 | -1 = bx >= px - 0.01 ? 1 : -1;
	const trail = f >= offStart ? Array.from({length: 70}, (_, k) => beeAt(f - k)) : [];
	// nectar
	const nectar = prog(f, cue(1), 16);
	// chart: bars grow on the hits
	const barHits = events(cue(2) + 24, cue(3) - 30, 2, 20);
	const bar1 = spring({frame: f - barHits[0], fps, config: {damping: 15}});
	const bar2 = spring({frame: f - barHits[1], fps, config: {damping: 15}});
	const chart = landed(f, cue(2) + 6, cue(3) - 8);
	// the crescent the trail leaves
	const cres = prog(f, offEnd - 26, 30, ease.inOut);
	const fade = prog(f, offEnd - 10, 30);
	return (
		<Stage>
			<Night x={960} y={500} r={900} />
			<Motes f={af} n={50} seed="be" o={0.6} />
			<g transform={`translate(${fx},${C.y})`} opacity={1 - 0.7 * fade}>
				<path d={`M0,40 C-40,200 -30,400 -60,700`} stroke="#3a2a16" strokeWidth={10} fill="none" />
				<path d={leafD(260, 0.3)} transform="translate(-40,240) rotate(160)" fill="#101a0c" stroke={AMBER.amber} strokeWidth={1.5} strokeOpacity={0.5} />
				<path d={leafD(240, 0.3)} transform="translate(-45,300) rotate(20)" fill="#101a0c" stroke={AMBER.amber} strokeWidth={1.5} strokeOpacity={0.5} />
				<circle r={300} fill="url(#ember-white)" opacity={0.12 * open} />
				<GlowFlower open={open} f={af} />
				{nectar > 0 ? <Ember x={0} y={0} r={(46 + 10 * Math.sin(f / 6)) * nectar} o={nectar * (1 - 0.5 * fade)} /> : null}
				{/* nectar to the bee */}
				{f > cue(1) + 10 && f < cue(2)
					? Array.from({length: 8}, (_, i) => {
							const u = ((f - cue(1)) / 30 + i / 8) % 1;
							return <circle key={i} cx={mix(0, 50, u)} cy={mix(0, -36, u) - Math.sin(u * Math.PI) * 20} r={3} fill={AMBER.gold} opacity={Math.sin(u * Math.PI)} />;
						})
					: null}
			</g>
			{trail.length ? <polyline points={trail.map((p) => p.join(',')).join(' ')} fill="none" stroke={AMBER.gold} strokeWidth={4} strokeLinecap="round" opacity={0.75 * (1 - cres)} filter="url(#g-sm)" /> : null}
			{inU > 0 && cres < 1 ? (
				<g transform={`translate(${bx},${by})`} opacity={1 - cres}>
					<GlowBee f={af} s={1.1} face={face} />
				</g>
			) : null}
			{/* 24 h later, who still remembers */}
			{chart > 0 ? (
				<g opacity={chart} transform="translate(1040,330)">
					<text x={0} y={0} style={{fontFamily: font.sans, fontSize: 26, letterSpacing: '0.2em', fill: AMBER.cream}} opacity={0.85}>
						24 小时后 · 还记得这种花香
					</text>
					<line x1={0} y1={40} x2={0} y2={300} stroke={AMBER.dim} strokeWidth={2} />
					<text x={0} y={110} style={{fontFamily: font.serif, fontWeight: 700, fontSize: 30, fill: AMBER.dim}}>
						没喝过
					</text>
					<rect x={160} y={84} width={170 * bar1} height={30} rx={4} fill={AMBER.dim} />
					<text x={170 + 170 * bar1} y={110} style={{fontFamily: font.latin, fontWeight: 700, fontSize: 36, fill: AMBER.dim}} opacity={bar1}>
						×1
					</text>
					<text x={0} y={230} style={{fontFamily: font.serif, fontWeight: 700, fontSize: 30, fill: AMBER.gold}}>
						喝过
					</text>
					<rect x={160} y={204} width={510 * bar2} height={30} rx={4} fill={AMBER.gold} filter="url(#g-sm)" />
					<text x={180 + 510 * bar2} y={232} style={{fontFamily: font.latin, fontWeight: 700, fontSize: 52, fill: AMBER.gold}} opacity={bar2}>
						×3
					</text>
					<text x={0} y={320} style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 22, fill: AMBER.dim}}>
						Wright et al., Science 2013
					</text>
				</g>
			) : null}
			{/* the crescent: where the bee's trail ends */}
			{cres > 0 ? (
				<g transform="translate(960,300)">
					<path d={CRESCENT} fill={AMBER.gold} fillOpacity={cres} stroke={AMBER.gold} strokeWidth={4} strokeDasharray={900} strokeDashoffset={900 * (1 - cres)} filter="url(#g-md)" />
				</g>
			) : null}
			<Label en="Nectar" zh="花蜜里的咖啡因 · 浓度低，蜜蜂尝不出苦" o={landed(f, cue(1) + 6, cue(2) - 6)} />
			<rect width={W} height={H} fill="#fff4dc" opacity={fromWhite} />
		</Stage>
	);
};

/** a crescent moon, centred on its bounding circle (r 110) */
const CRESCENT = 'M30,-104 A110,110 0 1,0 30,104 A86,86 0 1,1 30,-104 Z';

export const scenesPart2 = {Origin, Defense, Bees};
export {CRESCENT};

// ---------------------------------------------------------------- 6. Yemen: carved in stone, then out along the routes

const proj = (lon: number, lat: number): [number, number] => [960 + (lon - 30) * 7, 520 - (lat - 20) * 7.5];
const MOCHA = proj(43.25, 13.3);
const CITIES: {n: string; p: [number, number]; dx: number; dy: number; a?: 'start' | 'end'}[] = [
	{n: '开罗', p: proj(31.2, 30.0), dx: 18, dy: 34},
	{n: '伊斯坦布尔', p: proj(29.0, 41.0), dx: 22, dy: -8},
	{n: '威尼斯', p: proj(12.3, 45.4), dx: -20, dy: 36, a: 'end'},
	{n: '伦敦', p: proj(-0.1, 51.5), dx: -20, dy: -10, a: 'end'},
	{n: '爪哇', p: proj(106.8, -6.2), dx: 22, dy: 10},
	{n: '巴西', p: proj(-43.2, -22.9), dx: -20, dy: 10, a: 'end'},
	{n: '云南', p: proj(102.7, 25.0), dx: 22, dy: 10},
];
const arcD = (a: [number, number], b: [number, number]) => {
	const mx = (a[0] + b[0]) / 2;
	const my = (a[1] + b[1]) / 2;
	const dx = b[0] - a[0];
	const dy = b[1] - a[1];
	const l = Math.hypot(dx, dy);
	return {d: `M${a[0]},${a[1]} Q${mx + (dy / l) * l * 0.22},${my - (dx / l) * l * 0.22 - l * 0.12} ${b[0]},${b[1]}`, l};
};
const Star5: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => (
	<polygon points={Array.from({length: 10}, (_, i) => {
		const a = (i * Math.PI) / 5 - Math.PI / 2;
		const rr = i % 2 ? r * 0.45 : r;
		return `${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}`;
	}).join(' ')} />
);

const Yemen: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const cue = useCue();
	const scene = useScene();
	const events = useEvents();
	const end = scene.duration;
	const stone = prog(f, 4, 36, ease.inOut);
	const goldMoon = 1 - prog(f, 26, 30);
	const pour = prog(f, cue(1) + 10, 30, ease.inOut);
	const cup1 = prog(f, cue(1) + 30, 60);
	const cup2 = prog(f, cue(1) + 80, 60);
	const lamp = 0.75 + 0.25 * noise2D('lamp', af / 6, 0);
	const toMap = prog(f, cue(2) - 16, 24, ease.inOut);
	const routes = events(cue(2) + 8, end - 30, CITIES.length, 13);
	const yn = CITIES[CITIES.length - 1].p;
	const dive = prog(f, end - 22, 22, ease.in);
	const azimuth = 215 + 30 * prog(f, 0, end);
	const spout: [number, number] = [1352, 512];
	return (
		<Stage>
			<rect width={W} height={H} fill={AMBER.ink} />
			{toMap < 1 ? (
				<g opacity={stone * (1 - toMap)}>
					<defs>
						<filter id="relief2" x="-10%" y="-10%" width="120%" height="120%">
							<feGaussianBlur in="SourceAlpha" stdDeviation="3.5" result="b" />
							<feDiffuseLighting in="b" surfaceScale={7} lightingColor="#f0c890" result="lit">
								<feDistantLight azimuth={azimuth} elevation={40} />
							</feDiffuseLighting>
							<feComposite in="lit" in2="SourceAlpha" operator="in" />
						</filter>
					</defs>
					<rect width={W} height={H} fill="#5a3e28" />
					<rect width={W} height={H} filter="url(#stone)" opacity={0.85} />
					<g filter="url(#relief2)" style={{mixBlendMode: 'overlay'}} fill="#000">
						<rect x={160} y={150} width={1600} height={18} />
						<rect x={160} y={820} width={1600} height={22} />
						<path transform="translate(960,300)" d={CRESCENT} />
						{[
							[700, 230, 16],
							[1220, 210, 12],
							[820, 360, 10],
							[1120, 380, 14],
							[560, 300, 10],
							[1400, 300, 11],
						].map(([x, y, r], i) => (
							<Star5 key={i} x={x} y={y} r={r} />
						))}
						{/* the lodge: a row of arches */}
						{[0, 1, 2, 3].map((i) => (
							<path key={i} d={`M${230 + i * 120},800 L${230 + i * 120},560 A50,50 0 0,1 ${330 + i * 120},560 L${330 + i * 120},800 L${318 + i * 120},800 L${318 + i * 120},565 A38,38 0 0,0 ${242 + i * 120},565 L${242 + i * 120},800 Z`} />
						))}
						{/* the dallah */}
						<g transform="translate(1240,640)">
							<path d="M-60,160 L60,160 L80,40 C80,-20 40,-50 30,-80 L-30,-80 C-40,-50 -80,-20 -80,40 Z" />
							<path d="M70,30 C150,0 170,-70 210,-110 L222,-98 C190,-60 170,10 86,70 Z" />
							<path d="M-28,-80 L28,-80 L18,-130 L0,-150 L-18,-130 Z" />
							<path d="M-80,10 C-140,10 -140,100 -74,110" stroke="#000" strokeWidth={14} fill="none" />
						</g>
						{[1500, 1620].map((x) => (
							<path key={x} d={`M${x - 36},760 L${x + 36},760 L${x + 26},810 L${x - 26},810 Z`} />
						))}
						{/* lamp */}
						<path d="M860,800 L940,800 L930,770 C960,760 960,740 930,740 L870,740 C840,740 840,760 870,770 Z" />
					</g>
					<circle cx={760} cy={300} r={900} fill="url(#warm-pool)" opacity={0.5} style={{mixBlendMode: 'screen'}} />
					{/* lamp flame and its light */}
					<Ember x={900} y={724} r={70 * lamp} o={0.9} />
					<circle cx={900} cy={724} r={500} fill="url(#warm-pool)" opacity={0.35 * lamp} style={{mixBlendMode: 'screen'}} />
					{/* stars twinkle */}
					{[
						[700, 230],
						[1220, 210],
						[1120, 380],
					].map(([x, y], i) => (
						<Ember key={i} x={x} y={y} r={26} o={0.4 + 0.4 * Math.sin(af / 11 + i * 2)} />
					))}
					{/* the pour: a stream of light from the spout into the cups */}
					{pour > 0 ? (
						<g>
							<path d={`M${spout[0]},${spout[1]} C${spout[0] + 90},${spout[1] + 40} ${1490},${640} ${1500},${756}`} fill="none" stroke={AMBER.gold} strokeWidth={6} strokeDasharray="18 14" strokeDashoffset={-af * 3} opacity={pour * (1 - prog(f, cue(1) + 70, 16))} filter="url(#g-md)" />
							<path d={`M${spout[0]},${spout[1]} C${spout[0] + 120},${spout[1] + 30} ${1610},${640} ${1620},${756}`} fill="none" stroke={AMBER.gold} strokeWidth={6} strokeDasharray="18 14" strokeDashoffset={-af * 3} opacity={prog(f, cue(1) + 74, 12) * (1 - prog(f, cue(1) + 130, 16))} filter="url(#g-md)" />
							<Ember x={1500} y={780} r={60 * cup1} o={cup1} />
							<Ember x={1620} y={780} r={60 * cup2} o={cup2} />
						</g>
					) : null}
					<rect x={120} y={96} width={520} height={80} rx={10} fill="#140d08" opacity={0.55 * landed(f, cue(1), cue(2) - 16)} />
					<Label en="Yemen · Sufi lodges" zh="也门 · 苏菲派修道所 · 15 世纪" o={landed(f, cue(1), cue(2) - 16)} />
				</g>
			) : null}
			{/* the moon the bee left, laid into the stone */}
			{goldMoon > 0 ? (
				<g transform="translate(960,300)" opacity={goldMoon}>
					<path d={CRESCENT} fill={AMBER.gold} filter="url(#g-md)" />
				</g>
			) : null}
			{/* the routes out of Mocha */}
			{toMap > 0 ? (
				<g opacity={toMap}>
					<g transform={`translate(${yn[0]},${yn[1]}) scale(${1 + 9 * dive ** 2}) translate(${-yn[0]},${-yn[1]})`}>
						<g stroke={AMBER.dim} strokeWidth={1} opacity={0.35}>
							{Array.from({length: 13}, (_, i) => {
								const x = proj(-150 + i * 30, 0)[0];
								return <line key={`v${i}`} x1={x} y1={60} x2={x} y2={1020} />;
							})}
							{Array.from({length: 8}, (_, i) => {
								const y = proj(0, 80 - i * 20)[1];
								return <line key={`h${i}`} x1={0} y1={y} x2={W} y2={y} />;
							})}
						</g>
						<Ember x={MOCHA[0]} y={MOCHA[1]} r={70} />
						<text x={MOCHA[0] + 26} y={MOCHA[1] + 40} style={{fontFamily: font.serif, fontWeight: 900, fontSize: 32, fill: AMBER.gold}}>
							摩卡
						</text>
						{CITIES.map((c, i) => {
							const at = routes[i];
							const k = prog(f, at - 16, 16, ease.inOut);
							if (k <= 0) return null;
							const {d, l} = arcD(MOCHA, c.p);
							const arrive = f >= at ? Math.exp(-(f - at) / 8) : 0;
							return (
								<g key={c.n}>
									<path d={d} fill="none" stroke={AMBER.gold} strokeWidth={3} strokeDasharray={l * 1.4} strokeDashoffset={l * 1.4 * (1 - k)} opacity={0.75} filter="url(#g-sm)" />
									{k >= 1 ? (
										<g>
											<Ember x={c.p[0]} y={c.p[1]} r={34 + 40 * arrive} />
											<text x={c.p[0] + c.dx} y={c.p[1] + c.dy} textAnchor={c.a ?? 'start'} style={{fontFamily: font.serif, fontWeight: 700, fontSize: 28, fill: AMBER.cream}} opacity={prog(f, at, 10)}>
												{c.n}
											</text>
										</g>
									) : null}
								</g>
							);
						})}
					</g>
					<Label en="The coffee routes" zh="从也门的摩卡港出发" o={landed(f, cue(2), end - 24)} />
				</g>
			) : null}
			<rect width={W} height={H} fill={AMBER.ink} opacity={dive} />
		</Stage>
	);
};

// ---------------------------------------------------------------- 7. roast: green bean, first crack, Maillard, a thousand aromas

const AROMAS = ['焦糖', '坚果', '巧克力', '花香', '莓果', '烤面包', '柑橘'];

const Roast: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const scene = useScene();
	const events = useEvents();
	const end = scene.duration;
	const inB = spring({frame: f - 2, fps, config: {damping: 16}});
	// heat
	const gauge = landed(f, cue(1) - 6, cue(2) - 10);
	const heat = prog(f, cue(1), 80, ease.in);
	const temp = mix(150, 196, heat);
	const crackAt = events(cue(1) + 80, cue(1) + 130, 1, 10)[0];
	const crack = f >= crackAt ? Math.exp(-(f - crackAt) / 7) : 0;
	const shake = crack * 12;
	const sx = shake * (random(`rx${f}`) - 0.5);
	const sy = shake * (random(`ry${f}`) - 0.5);
	const beanCol = interpolateColors(heat + 0.4 * prog(f, crackAt, 60), [0, 0.35, 0.7, 1, 1.4], ['#9cc46a', '#d6c46a', '#c88a3a', '#8a4e22', '#5a3015']);
	// Maillard: inside the bean
	const inside = prog(f, cue(2) - 10, 30, ease.inOut);
	const reacts = events(cue(2) + 16, cue(3) - 8, 5, 14);
	// a thousand aromas
	const burst = prog(f, cue(3), 50, ease.out);
	const wordAt = events(cue(3) + 20, end - 40, AROMAS.length, 9);
	const gather = prog(f, end - 26, 22, ease.in);
	const drop = prog(f, end - 14, 14, ease.in);
	return (
		<Stage>
			<Night x={960} y={540} r={760} />
			<circle cx={960} cy={560} r={700} fill="url(#ember)" opacity={0.25 * heat * (1 - inside)} />
			<g transform={`translate(${sx},${sy})`}>
				{/* the bean (and the gauge around it) */}
				<g opacity={1 - inside} transform={`translate(960,${mix(560, 540, inside)}) scale(${(0.6 + 0.4 * inB) * (1 + 0.14 * crack + 3 * inside ** 2)})`}>
					<BeanLine r={150} color={beanCol} fill="#160d06" w={6} />
					{/* green and grassy at first */}
					{Array.from({length: 18}, (_, i) => {
						const u = ((af / 120 + i / 18) % 1);
						return <path key={i} d={leafD(26, 0.3)} transform={`translate(${(random(`gx${i}`) - 0.5) * 420},${200 - u * 460}) rotate(${-90 + 40 * Math.sin(u * 5 + i)})`} fill={AMBER.green} opacity={0.5 * Math.sin(u * Math.PI) * (1 - heat)} />;
					})}
					{crack > 0.02
						? Array.from({length: 16}, (_, i) => {
								const a = (i / 16) * Math.PI * 2 + 0.2;
								const r0 = 180 + 300 * (1 - crack);
								return <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0 * 1.2} x2={Math.cos(a) * (r0 + 70)} y2={Math.sin(a) * (r0 + 70) * 1.2} stroke={AMBER.gold} strokeWidth={5} strokeLinecap="round" opacity={crack} />;
							})
						: null}
					{/* chaff flying off */}
					{f >= crackAt
						? Array.from({length: 14}, (_, i) => {
								const k = (f - crackAt) / 40;
								if (k > 1) return null;
								const a = random(`ch${i}`) * Math.PI * 2;
								const d = 160 + 520 * k * (0.5 + random(`cd${i}`));
								return <ellipse key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d + 300 * k * k} rx={10} ry={5} transform={`rotate(${k * 600 + i * 40},${Math.cos(a) * d},${Math.sin(a) * d + 300 * k * k})`} fill="#c8a070" opacity={1 - k} />;
							})
						: null}
				</g>
				{/* temperature arc */}
				{gauge > 0 ? (
					<g transform="translate(960,560) scale(0.95)" opacity={gauge}>
						{Array.from({length: 41}, (_, k) => {
							const a = (-210 + (k / 40) * 240) * (Math.PI / 180);
							const big = k % 5 === 0;
							const c = ['#8ab04a', '#c9b45a', '#c88a3a', '#9a5a26', '#5a3418'][Math.min(4, Math.floor(k / 9))];
							return <line key={k} x1={Math.cos(a) * 380} y1={Math.sin(a) * 380} x2={Math.cos(a) * (big ? 340 : 356)} y2={Math.sin(a) * (big ? 340 : 356)} stroke={c} strokeWidth={big ? 4 : 2} />;
						})}
						{[150, 170, 190, 210, 230].map((tc) => {
							const a = (-210 + ((tc - 150) / 80) * 240) * (Math.PI / 180);
							return (
								<text key={tc} x={Math.cos(a) * 300} y={Math.sin(a) * 300 + 8} textAnchor="middle" style={{fontFamily: font.latin, fontSize: 26, fill: AMBER.dim}}>
									{tc}°
								</text>
							);
						})}
						{(() => {
							const a = (-210 + ((temp - 150) / 80) * 240) * (Math.PI / 180);
							return (
								<g>
									<line x1={Math.cos(a) * 200} y1={Math.sin(a) * 200} x2={Math.cos(a) * 340} y2={Math.sin(a) * 340} stroke={AMBER.gold} strokeWidth={4} filter="url(#g-sm)" />
									<Ember x={Math.cos(a) * 380} y={Math.sin(a) * 380} r={50 + 50 * crack} />
								</g>
							);
						})()}
					</g>
				) : null}
			</g>
			{f >= crackAt ? (
				<g opacity={landed(f, crackAt, cue(2) - 10)}>
					<text x={1560} y={540} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 84, fill: AMBER.gold}} filter="url(#g-sm)">
						一爆
					</text>
					<text x={1560} y={604} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 40, fill: AMBER.cream}} opacity={0.8}>
						≈ 196 °C
					</text>
				</g>
			) : null}
			{/* inside: sugars meet amino acids, each meeting throws off an aroma */}
			{inside > 0 && burst < 1 ? (
				<g opacity={inside * (1 - burst)}>
					{reacts.map((at, i) => {
						const cx = 480 + i * 240;
						const cy = 540 + 120 * Math.sin(i * 2.3);
						const meet = prog(f, at - 30, 30, ease.in);
						const hit = f >= at ? Math.exp(-(f - at) / 8) : 0;
						return (
							<g key={i}>
								{meet < 1 ? (
									<>
										<g transform={`translate(${cx - 130 * (1 - meet)},${cy - 60 * (1 - meet)}) rotate(${f * 2}) scale(1.6)`}>
											<polygon points={Array.from({length: 6}, (_, k) => `${Math.cos((k * Math.PI) / 3) * 26},${Math.sin((k * Math.PI) / 3) * 26}`).join(' ')} fill="none" stroke={AMBER.cream} strokeWidth={3} filter="url(#g-sm)" />
										</g>
										<path d="M0,0 l14,-12 l14,12 l14,-12 l14,12" transform={`translate(${cx + 100 * (1 - meet) - 40},${cy + 70 * (1 - meet)}) scale(1.6)`} fill="none" stroke={AMBER.cyan} strokeWidth={3} filter="url(#g-sm)" />
									</>
								) : (
									<Ember x={cx} y={cy} r={24 + 60 * hit} />
								)}
							</g>
						);
					})}
					<text x={760} y={330} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 700, fontSize: 36, fill: AMBER.cream}} opacity={landed(f, cue(2), cue(3))}>
						糖
					</text>
					<text x={1160} y={330} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 700, fontSize: 36, fill: AMBER.cyan}} opacity={landed(f, cue(2) + 6, cue(3))}>
						氨基酸
					</text>
					<Label en="Maillard reaction" zh="美拉德反应 · 糖 + 氨基酸" o={landed(f, cue(2), cue(3))} />
				</g>
			) : null}
			{/* the thousand */}
			{burst > 0 ? (
				<g opacity={1 - gather} transform={`translate(${mix(0, 300 - 960, drop)},${mix(0, 820 - 540, drop)})`}>
					{Array.from({length: 260}, (_, i) => {
						const a = random(`ba${i}`) * Math.PI * 2;
						const r = (120 + random(`br${i}`) * 820) * burst * (1 - gather);
						const tw = 0.5 + 0.5 * Math.sin(af / 7 + i);
						return <circle key={i} cx={960 + Math.cos(a) * r * 1.3} cy={540 + Math.sin(a) * r * 0.8} r={1.5 + 2.5 * random(`bs${i}`)} fill={i % 5 ? AMBER.gold : AMBER.cream} opacity={0.4 + 0.5 * tw} />;
					})}
					<text x={960} y={560} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 150, fill: 'url(#gold-text)'}} filter="url(#g-sm)" opacity={prog(f, cue(3) + 6, 14)}>
						1,000+
					</text>
					<text x={960} y={630} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 30, letterSpacing: '0.4em', fill: AMBER.cream}} opacity={0.8 * prog(f, cue(3) + 18, 14)}>
						种挥发性香气物质
					</text>
					{AROMAS.map((w, i) => {
						const a = -2.4 + i * 0.8;
						return (
							<text key={w} x={960 + Math.cos(a) * 560} y={520 + Math.sin(a) * 300} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 700, fontSize: 38, fill: AMBER.amber}} opacity={prog(f, wordAt[i], 10)}>
								{w}
							</text>
						);
					})}
				</g>
			) : null}
			{drop > 0 ? <Ember x={mix(960, 300, drop)} y={mix(540, 820, drop)} r={40} /> : null}
			<Label en="Green coffee" zh="生豆 · 闻起来像青草" o={landed(f, cue(0), cue(1) - 6)} />
			<Label en="First crack" zh="一爆 · 水汽撑破细胞壁" o={f >= crackAt ? landed(f, crackAt, cue(2) - 10) : 0} />
			<Label en="Volatile compounds" zh="已鉴定的咖啡香气物质 · 一千多种" o={landed(f, cue(3) + 10, end - 26)} />
		</Stage>
	);
};

// ---------------------------------------------------------------- 8. body: the curve of one cup through the day

const X0 = 300;
const X1 = 1620;
const Y0 = 820;
const YP = 330;
const HOURS = 10;
const KA = 5;
const KE = Math.LN2 / 5;
const TMAX = Math.log(KA / KE) / (KA - KE);
const conc = (t: number) => (Math.exp(-KE * t) - Math.exp(-KA * t)) / (Math.exp(-KE * TMAX) - Math.exp(-KA * TMAX));
const gx = (t: number) => X0 + (t / HOURS) * (X1 - X0);
const gy = (c: number) => Y0 - c * (Y0 - YP);

const Body: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const cue = useCue();
	const scene = useScene();
	const end = scene.duration;
	const axes = prog(f, 0, 20);
	// the curve draws through the day: fast to the peak, then the slow decline
	const tNow = f < cue(1) ? mix(0, 2.2, prog(f, cue(0), cue(1) - cue(0) - 10, ease.inOut)) : mix(2.2, 9.6, prog(f, cue(1) - 10, 120, ease.inOut));
	const pts: string[] = [];
	for (let t = 0; t <= tNow; t += 0.05) pts.push(`${gx(t)},${gy(conc(t))}`);
	const half = TMAX + 5;
	const halfO = prog(f, cue(1) + 70, 16);
	const peakO = prog(f, cue(0) + 70, 16);
	const out = prog(f, end - 26, 22, ease.inOut);
	const head = [gx(tNow), gy(conc(tNow))];
	const hx = mix(head[0], 960, out);
	const hy = mix(head[1], 540, out);
	return (
		<Stage>
			<Night x={900} y={560} r={900} />
			<Motes f={af} n={30} seed="bo" o={0.4} />
			<g opacity={1 - out}>
				<g opacity={axes} stroke={AMBER.dim} strokeWidth={2}>
					<line x1={X0} y1={Y0} x2={X1 + 40} y2={Y0} />
					<line x1={X0} y1={Y0} x2={X0} y2={YP - 60} />
				</g>
				{Array.from({length: 6}, (_, i) => {
					const t = i * 2;
					return (
						<g key={i} opacity={axes}>
							<line x1={gx(t)} y1={Y0} x2={gx(t)} y2={Y0 + 12} stroke={AMBER.dim} strokeWidth={2} />
							<text x={gx(t)} y={Y0 + 54} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 34, fill: AMBER.cream}} opacity={0.75}>
								{`${8 + t}:00`}
							</text>
						</g>
					);
				})}
				<text x={X0 - 20} y={YP - 80} style={{fontFamily: font.sans, fontSize: 24, letterSpacing: '0.2em', fill: AMBER.cream}} opacity={0.75 * axes}>
					血液里的咖啡因
				</text>
				{/* 30–60 minutes band */}
				<rect x={gx(0.5)} y={YP - 40} width={gx(1) - gx(0.5)} height={Y0 - YP + 40} fill={AMBER.gold} opacity={0.12 * peakO} />
				<polyline points={pts.join(' ')} fill="none" stroke={AMBER.gold} strokeWidth={5} strokeLinejoin="round" filter="url(#g-md)" />
				<Ember x={head[0]} y={head[1]} r={44} />
				<g opacity={peakO * (1 - halfO * 0.4)}>
					<text x={gx(1) + 24} y={YP - 6} style={{fontFamily: font.serif, fontWeight: 900, fontSize: 40, fill: AMBER.gold}}>
						顶峰
					</text>
					<text x={gx(1) + 24} y={YP + 36} style={{fontFamily: font.sans, fontSize: 24, fill: AMBER.cream}} opacity={0.8}>
						喝下后约 30–60 分钟
					</text>
				</g>
				<g opacity={halfO}>
					<line x1={X0} y1={gy(0.5)} x2={gx(half)} y2={gy(0.5)} stroke={AMBER.cream} strokeWidth={2} strokeDasharray="8 10" opacity={0.6} />
					<line x1={gx(half)} y1={gy(0.5)} x2={gx(half)} y2={Y0} stroke={AMBER.cream} strokeWidth={2} strokeDasharray="8 10" opacity={0.6} />
					<Ember x={gx(half)} y={gy(0.5)} r={40} />
					<text x={gx(half) + 24} y={gy(0.5) - 24} style={{fontFamily: font.serif, fontWeight: 900, fontSize: 44, fill: AMBER.gold}}>
						一半
					</text>
					<text x={gx(half) + 24} y={gy(0.5) + 18} style={{fontFamily: font.sans, fontSize: 24, fill: AMBER.cream}} opacity={0.8}>
						约 5 小时后（因人而异）
					</text>
					<text x={X0 - 16} y={gy(0.5) + 8} textAnchor="end" style={{fontFamily: font.latin, fontSize: 28, fill: AMBER.cream}} opacity={0.7}>
						50%
					</text>
				</g>
				<Label en="Caffeine in the blood" zh="假如早上八点喝一杯 · 示意曲线" o={landed(f, cue(0), end - 24)} />
			</g>
			{out > 0 ? <Ember x={hx} y={hy} r={44 + 300 * out ** 2} /> : null}
		</Stage>
	);
};

// ---------------------------------------------------------------- 9. coda: back to the cup, good morning

const Coda: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const cue = useCue();
	const scene = useScene();
	const end = scene.duration;
	const endAt = cue(2) + 40;
	const t = af / 30 + 10;
	const rimIn = prog(f, 0, 24, ease.out);
	const rim = mix(60, 380, rimIn);
	const morning = prog(f, cue(2) - 20, 60, ease.inOut);
	const shrub = landed(f, cue(0) + 10, cue(1) - 4, 20);
	const flower = landed(f, cue(1) + 6, cue(2) + 20, 20);
	const ring = prog(f, cue(1) + 20, 70, ease.inOut);
	const steam = prog(f, cue(2) - 10, 40);
	return (
		<Stage
			under={<CupLiquid rim={rim} t={t} swirl={1.2} gain={1.0 + 0.25 * morning} scale={3.2} light={[0.42, 0.36, 0.5 + 0.2 * morning]} />}
			defs={
				<clipPath id="cup-clip">
					<circle cx={960} cy={540} r={rim} />
				</clipPath>
			}
			over={
				<Sequence from={endAt} layout="none">
					<EndCard v={EPISODE} cfg={BRAND} dur={end - endAt} />
				</Sequence>
			}
		>
			<CupRim rim={rim} o={rimIn} />
			{/* the light of morning across the table */}
			<polygon points="-200,-100 700,-100 1500,1180 600,1180" fill="#fff1d0" opacity={0.07 * morning} filter="url(#g-lg)" />
			<g clipPath="url(#cup-clip)">
				{/* reflections in the coffee: the plant, then the flower */}
				<g transform="translate(960,860) scale(1.15)" opacity={0.3 * shrub}>
					<Shrub f={af} glow={0.9} />
				</g>
				<g transform="translate(960,540) scale(0.95)" opacity={flower}>
					<GlowFlower open={1} f={af} />
				</g>
			</g>
			{/* the bee's trail, once around the rim */}
			{ring > 0 && ring < 1 ? (
				<g>
					<circle cx={960} cy={540} r={rim + 66} fill="none" stroke={AMBER.gold} strokeWidth={4} strokeDasharray={2 * Math.PI * (rim + 66)} strokeDashoffset={2 * Math.PI * (rim + 66) * (1 - ring)} transform="rotate(-90,960,540)" filter="url(#g-sm)" opacity={Math.sin(ring * Math.PI)} />
				</g>
			) : null}
			{/* steam */}
			{steam > 0
				? Array.from({length: 5}, (_, i) => {
						const x0 = 860 + i * 50;
						let d = `M${x0},${540}`;
						for (let k = 1; k <= 14; k++) d += ` L${x0 + 50 * noise2D(`st${i}`, k / 5, af / 50) * (k / 14)},${540 - k * 34 * steam}`;
						return <path key={i} d={d} fill="none" stroke="#fff4dc" strokeWidth={10} strokeLinecap="round" opacity={0.18 * steam} filter="url(#g-md)" />;
					})
				: null}
			<Motes f={af} n={30} seed="co" o={0.5} />
		</Stage>
	);
};

export const scenesPart3 = {Yemen, Roast, Body, Coda};
export const scenes: SceneMap = {...scenesPart1, ...scenesPart2, ...scenesPart3};
