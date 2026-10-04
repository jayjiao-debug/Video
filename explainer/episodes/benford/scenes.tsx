import React from 'react';
import {AbsoluteFill, Sequence, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Figure, POSES, blinkAt, lerpPose, type Pose} from '../../src/art/Figure';
import {Materials} from '../../src/art/materials';
import {P} from '../../src/art/palette';
import {lookAt} from '../../src/art/sets/Airfield';
import {TANK_DEFS} from '../../src/art/Tank';
import type {VideoCfg} from '../../src/brand/Brand';
import {JUNO} from '../../src/brand/identity';
import {FullFrame, camMix} from '../../src/components/FullFrame';
import {ease, prog, useCue, useScene, useTimeline} from '../../src/lib/context';
import {color, font} from '../../src/lib/theme';
import type {SceneMap, SceneProps} from '../../src/lib/types';
import {BookMotif, DeskBook, EdgeMacro, Exterior1881, GOLD, H, LogRows, NEWCOMB, OilLamp, Snow, Study1881, W, WINDOW_LIT} from './art';

/**
 * 《第一位数字》 (Benford's law). Act one is built: hook → title card → 1881 office →
 * thumb tabs → twist. Later scenes are listed in episode.yaml and still to come.
 */

export const EPISODE: VideoCfg = {
	id: 'benford',
	src: '',
	title: '第一位数字',
	kicker: "BENFORD'S LAW · NEWCOMB · MDCCCLXXXI",
	tagline: '为什么1开头的数字最多？',
	taglineEn: 'Why does the world start with 1?',
	motif: 'cards', // drawn by BookMotif in this episode (the brand Motif union is for re-branded videos)
	card: [0, 4.1],
	hit: 4.07,
	extend: 0,
	question: '你的手机余额，第一位是几？评论区验一验',
	sources: '参考 · Newcomb, Am. J. Math. (1881) · Benford, Proc. APS (1938) · Nigrini, J. Accountancy (1999) · Rauch et al. (2011)',
	duration: 0,
};

const LN: React.CSSProperties = {fontVariantNumeric: 'lining-nums'};

/** light that falls across the fore-edge: warm at the front-left, cooler at the back */
const EdgeLight: React.FC = () => (
	<defs>
		<linearGradient id="em-light" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stopColor="#ffcf8a" stopOpacity="0.6" />
			<stop offset="0.45" stopColor="#ffb54d" stopOpacity="0" />
			<stop offset="1" stopColor="#3a4566" stopOpacity="0.7" />
		</linearGradient>
	</defs>
);

/** world → screen for a lookAt() camera (for shots drawn without Layer parallax) */
const camT = (cam: {x: number; y: number; zoom: number}) => `translate(960,540) scale(${cam.zoom}) translate(${-(cam.x / cam.zoom + 960)},${-(cam.y / cam.zoom + 540)})`;

/** a decaying 2–3 frame camera shake */
const shakeAt = (f: number, at: number, amp = 10) => (f >= at ? Math.exp(-(f - at) / 3.5) * amp : 0);

// ---------------------------------------------------------------- 1. hook: the thumbed fore-edge

const Hook: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const scene = useScene();
	const end = scene.duration;
	const diveAt = end - 22;
	// already moving on frame 0: a slide along the fore-edge, front (black) to back (clean)
	const slide = interpolate(f, [0, diveAt], [560, 3150], {extrapolateRight: 'clamp', easing: ease.out});
	const dive = prog(f, diveAt, 22, ease.in);
	const cam = lookAt(slide, 540, 1.22 + 6 * dive * dive);
	// the thumb riffles the front pages; the camera outruns it
	const tx = interpolate(f, [0, 64], [330, 1080], {extrapolateRight: 'clamp', easing: ease.inOut});
	const lift = prog(f, 56, 14, ease.in);
	return (
		<FullFrame fadeIn={0} fadeOut={0} motes={0.6}>
			<EdgeLight />
			<rect width={W} height={H} fill="#140d08" />
			<g transform={`translate(960,540) scale(${cam.zoom}) translate(${-slide},-540)`}>
				<rect x={-800} y={-400} width={5200} height={1900} fill="#1e140c" />
				<EdgeMacro x={0} y={190} w={4200} h={700} id="hook" />
				{/* riffled leaves springing back behind the thumb */}
				{Array.from({length: 7}, (_, k) => {
					const ph = ((f * 0.9 + k * 0.6) % 4) / 4;
					const x = tx + 26 + k * 9;
					const bend = Math.sin(ph * Math.PI) * 26 * (1 - lift);
					return <path key={k} d={`M${x},200 C${x + bend},420 ${x + bend},660 ${x},880`} stroke="#fff6e0" strokeWidth={2.2} fill="none" opacity={0.55 * Math.sin(ph * Math.PI) * (1 - lift)} />;
				})}
				{/* the thumb */}
				<g transform={`translate(${tx},${620 + 260 * lift}) rotate(-12)`}>
					<rect x={-70} y={-120} width={140} height={560} rx={70} fill={P.skin1} />
					<rect x={-70} y={-120} width={140} height={560} rx={70} fill="#7a3a20" opacity={0.2} transform="translate(16,8)" />
					<rect x={-46} y={-98} width={92} height={120} rx={44} fill="#f8e2cc" />
					<path d="M-54,140 C-18,128 18,128 54,140" stroke="#b07a58" strokeWidth={5} fill="none" opacity={0.5} />
					<rect x={-70} y={-120} width={140} height={560} rx={70} fill="url(#glow-lamp)" opacity={0.25} />
				</g>
			</g>
			{/* the dive goes into the pages: they fill the frame, paper-bright */}
			<rect width={W} height={H} fill="#e9dcc0" opacity={Math.max(0, (dive - 0.55) / 0.45)} />
		</FullFrame>
	);
};

// ---------------------------------------------------------------- the title card, printed into the log table

/**
 * The hook dives into the pages; the card opens on a page of the same book (the
 * paper fills the frame) and pulls back to the open log table under the lamp. The
 * lamp turns down, the logarithms fade, and 《第一位数字》 is pressed into the page
 * like 1881 metal type, one character per half-beat, then gold is poured in.
 */
const BenfordTitle: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const tempo = useTimeline().music.tempo;
	const half = (60 / tempo / 2) * fps;
	const pull = prog(f, 0, 16, ease.out);
	const zoom = 3.2 + (1 - 3.2) * pull;
	const dusk = prog(f, 12, 40, ease.inOut); // the lamp turns down; the page goes deep brown
	const chars = [...'《第一位数字》'];
	const stampAt = (i: number) => 18 + i * half;
	const last = stampAt(chars.length - 1);
	const kick = chars.reduce((k, _, i) => k + (f >= stampAt(i) ? Math.exp(-(f - stampAt(i)) / 2.5) : 0), 0);
	const gild = prog(f, last + 6, 20, ease.inOut);
	const out = prog(f, dur - 14, 14, ease.inOut);
	const size = 150;
	const step = size * 1.0;
	const ty = 470;
	const page = (o: number) => `rgba(${Math.round(233 - 190 * o)},${Math.round(220 - 186 * o)},${Math.round(192 - 172 * o)},1)`;
	return (
		<AbsoluteFill style={{opacity: 1 - out}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={LN}>
				<Materials />
				<TANK_DEFS />
				<defs>
					<linearGradient id="bt-gold" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#fff1c4" />
						<stop offset="0.45" stopColor="#f1c56d" />
						<stop offset="1" stopColor="#a8742a" />
					</linearGradient>
					<clipPath id="bt-gild">
						<rect x={0} y={0} width={W * gild} height={H} />
					</clipPath>
					<radialGradient id="bt-pool" cx="50%" cy="42%" r="60%">
						<stop offset="0" stopColor="#ffcf8a" stopOpacity="0.22" />
						<stop offset="1" stopColor="#000" stopOpacity="0" />
					</radialGradient>
				</defs>
				<rect width={W} height={H} fill={JUNO.colors.night} />
				<g transform={`translate(${960 + kick * 3 * (random(`kx${f}`) - 0.5)},${540 + kick * 3 * (random(`ky${f}`) - 0.5)}) scale(${zoom}) translate(-960,-540)`}>
					{/* the open book: two pages and the gutter */}
					<path d="M150,110 L950,96 L950,990 L140,1004 Z" fill={page(dusk)} />
					<path d="M970,96 L1770,110 L1780,1004 L970,990 Z" fill={page(dusk * 0.96)} />
					<rect x={944} y={92} width={32} height={902} fill="#000" opacity={0.25} />
					<LogRows x={200} y={190} n0={100} rows={21} size={30} gap={39} fill={dusk > 0.5 ? '#6a5236' : '#3a2a1a'} o={0.75 - 0.55 * dusk} />
					<LogRows x={1020} y={190} n0={121} rows={21} size={30} gap={39} fill={dusk > 0.5 ? '#6a5236' : '#3a2a1a'} o={0.75 - 0.55 * dusk} />
				</g>
				<rect width={W} height={H} fill="url(#bt-pool)" />
				{/* kicker, printed small caps above the title */}
				<text x={960} y={300} textAnchor="middle" opacity={prog(f, 14, 14) * 0.9} style={{fontFamily: font.latin, fontWeight: 700, fontSize: 28, letterSpacing: '0.42em', fill: '#c8913a'}}>
					{EPISODE.kicker}
				</text>
				{/* the title, pressed character by character */}
				<g transform={`translate(${kick * 2 * (random(`tx${f}`) - 0.5)},0)`}>
					{chars.map((c, i) => {
						if (f < stampAt(i)) return null;
						const s = spring({frame: f - stampAt(i), fps, config: {damping: 14, stiffness: 320}});
						const x = 960 + (i - (chars.length - 1) / 2) * step;
						return (
							<g key={i} transform={`translate(${x},${ty}) scale(${1 + 0.45 * (1 - s)})`} opacity={Math.min(1, s * 2)}>
								<text x={2.5} y={3.5} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: size, fill: '#0e0904'}}>
									{c}
								</text>
								<text x={-2} y={-2} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: size, fill: '#f6dfa0', opacity: 0.28}}>
									{c}
								</text>
								<text textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: size, fill: '#3a2814'}}>
									{c}
								</text>
							</g>
						);
					})}
					{chars.map((_, i) => {
						const k = f - stampAt(i);
						if (k < 0 || k > 14) return null;
						return <circle key={`d${i}`} cx={960 + (i - (chars.length - 1) / 2) * step} cy={ty - 50} r={30 + k * 4} fill="#f6dfa0" opacity={0.22 * (1 - k / 14)} />;
					})}
					<g clipPath="url(#bt-gild)" filter="url(#blur-sm)" opacity={0.7}>
						{chars.map((c, i) => (
							<text key={i} x={960 + (i - (chars.length - 1) / 2) * step} y={ty} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: size, fill: GOLD}}>
								{c}
							</text>
						))}
					</g>
					<g clipPath="url(#bt-gild)">
						{chars.map((c, i) => (
							<text key={i} x={960 + (i - (chars.length - 1) / 2) * step} y={ty} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: size, fill: 'url(#bt-gold)'}}>
								{c}
							</text>
						))}
					</g>
				</g>
				<g transform="translate(960,600)">
					<BookMotif id="title" p={prog(f, last + 2, 22, ease.out)} />
				</g>
				<text x={960} y={746} textAnchor="middle" opacity={prog(f, last + 10, 14)} style={{fontFamily: font.serif, fontWeight: 600, fontSize: 46, fill: color.text, letterSpacing: '0.1em'}}>
					{EPISODE.tagline}
				</text>
				<text x={960} y={796} textAnchor="middle" opacity={prog(f, last + 16, 14)} style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 32, fill: 'rgba(243,237,226,0.6)'}}>
					{EPISODE.taglineEn}
				</text>
				<text x={960} y={872} textAnchor="middle" opacity={prog(f, last + 22, 16)} style={{fontFamily: font.sans, fontSize: 22, letterSpacing: '0.42em', fill: 'rgba(241,197,109,0.78)'}}>
					{`— ${JUNO.credit} · ${JUNO.series} —`}
				</text>
				{/* the opening frames are paper-bright, matching the dive */}
				<rect width={W} height={H} fill="#e9dcc0" opacity={1 - prog(f, 0, 8)} />
			</svg>
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------- 2. office: Washington, 1881

/** the sheet Newcomb is filling with figures, on the desk (world coords) */
const Ledger: React.FC<{rows: number}> = ({rows}) => (
	<g transform="translate(830,748) skewX(-28) scale(1,0.42)">
		<rect x={0} y={-120} width={250} height={120} fill="#efe4c8" />
		{Array.from({length: Math.floor(rows)}, (_, r) => (
			<text key={r} x={12} y={-100 + r * 15} style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 15, fill: '#3a2a1a', ...LN}}>
				{`${(1 + random(`lg${r}`) * 8.9).toFixed(4)}   ${(random(`lh${r}`) * 1).toFixed(4)}`}
			</text>
		))}
	</g>
);

const Office: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const scene = useScene();
	const titleLen = cue(0) - 6;
	const cutIn = cue(1) - 4; // through the window into the room
	if (f < cutIn) {
		// exterior: a slow push on the one lit window, then a dive through it
		const push = prog(f, titleLen - 20, cutIn - titleLen - 6, ease.inOut);
		const dive = prog(f, cutIn - 22, 22, ease.in);
		const cam = camMix(camMix(lookAt(960, 560, 1.0), lookAt(WINDOW_LIT[0], WINDOW_LIT[1] + 30, 1.55), push), lookAt(WINDOW_LIT[0] + 32, WINDOW_LIT[1] + 65, 9), dive * dive);
		return (
			<FullFrame
				fadeIn={0}
				fadeOut={0}
				motes={0}
				overlay={
					<Sequence durationInFrames={titleLen + 14} layout="none">
						<BenfordTitle dur={titleLen + 14} />
					</Sequence>
				}
			>
				<g opacity={f < 8 ? 0 : 1}>
					<Exterior1881 f={f + 400} cam={cam} />
					<Snow f={f + 400} n={70} seed="fg" size={2.2} speed={1.6} o={0.8 * (1 - dive)} />
					<Snow f={f + 400} n={120} seed="mg" size={1} speed={1} o={0.7} />
					<rect width={W} height={H} fill="#ffcf7a" opacity={Math.max(0, (dive - 0.6) / 0.4) * 0.9} />
				</g>
			</FullFrame>
		);
	}
	// interior: out of the lamp's glow into Newcomb's study
	const g = f - cutIn;
	const c1 = cue(1) - cutIn;
	const c2 = cue(2) - cutIn;
	const len = scene.duration - cutIn;
	const LAMP: [number, number] = [1400, 760];
	const reveal = prog(g, 0, 46, ease.out);
	const toBook = prog(g, c2 + 6, len - c2 - 10, ease.inOut);
	const cam = camMix(camMix(lookAt(LAMP[0], LAMP[1] - 130, 2.6), lookAt(900, 560, 1.04), reveal), lookAt(1040, 680, 1.9), toBook);
	// Newcomb: writing; glances up at the dome; then reaches for the book, pulls it over and opens it
	const NX = 760;
	const NY = 1130;
	const S = 2.0;
	const fig = (wx: number, wy: number): [number, number] => [(wx - NX) / S, (wy - NY) / S];
	const lookUp = prog(g, c1 + 40, 14, ease.inOut) * (1 - prog(g, c1 + 84, 16, ease.inOut));
	const pose: Pose = {...POSES.write, head: 22 - 30 * lookUp, lean: 16 - 6 * lookUp};
	const writing = g < c2 + 4 && lookUp < 0.5;
	const penX = 900 + 70 * ((g * 0.035) % 1) + 4 * Math.sin(g * 1.3);
	const penY = 730 + 4 * Math.cos(g * 0.9) + 10 * Math.floor((g * 0.035) % 3);
	const reachT = prog(g, c2 + 4, 16, ease.inOut);
	const pullT = prog(g, c2 + 24, 22, ease.inOut);
	const openT = prog(g, c2 + 50, 22, ease.inOut);
	const flickT = prog(g, c2 + 74, 40, (x) => x);
	const bookX = 1080 - 110 * pullT;
	const grip: [number, number] = [bookX + 230 - 260 * openT + 120 * prog(g, c2 + 74, 10), 725 - 70 * Math.sin(openT * Math.PI)];
	const nearHand = writing ? fig(penX, penY) : reachT < 1 ? fig(penX + (grip[0] - penX) * reachT, penY + (grip[1] - penY) * reachT) : fig(grip[0], grip[1]);
	const pen = writing || reachT === 0;
	return (
		<FullFrame fadeIn={0} fadeOut={0} motes={1}>
			<Study1881
				f={f + 400}
				cam={cam}
				desk={
					<>
						<g transform={`translate(${NX},${NY}) scale(${S})`}>
							<Figure
								look={NEWCOMB}
								pose={pose}
								reach={{near: nearHand, far: fig(800, 752)}}
								expression={lookUp > 0.5 ? 'thinking' : 'neutral'}
								blink={blinkAt(f, 'nwc')}
								rim="warm"
								shadow={false}
								holdNear={pen ? <rect x={-2} y={-34} width={4} height={40} rx={2} fill="#1a1410" transform="rotate(-30)" /> : undefined}
							/>
						</g>
						{/* the desk top is drawn in front of him: re-lay the edge so his legs stay hidden */}
						<rect x={-300} y={760} width={2520} height={40} fill="#4a2e1a" />
						<rect x={-300} y={760} width={2520} height={6} fill="#7a5232" />
						<rect x={-300} y={800} width={2520} height={600} fill="#2c1a0e" />
						{Array.from({length: 6}, (_, i) => (
							<rect key={i} x={-200 + i * 420} y={830} width={360} height={200} fill="none" stroke="#1a0e06" strokeWidth={4} />
						))}
						<Ledger rows={Math.min(8, 1 + g * 0.035)} />
						{/* inkwell, stacked ledgers */}
						<g transform="translate(620,760)">
							{Array.from({length: 4}, (_, i) => (
								<rect key={i} x={-120 + i * 4} y={-18 - i * 16} width={200} height={16} fill={['#3a2418', '#2a2c34', '#4a2a22', '#24302a'][i]} />
							))}
						</g>
						<g transform="translate(1180,760)">
							<path d="M-22,0 L22,0 L18,-30 L-18,-30 Z" fill="#14181e" />
							<rect x={-8} y={-36} width={16} height={8} fill="#2a2e36" />
						</g>
						<g transform={`translate(${bookX},768)`}>
							<DeskBook id="desk" open={openT} flick={flickT} />
						</g>
						<g transform={`translate(${LAMP[0]},${LAMP[1]})`}>
							<OilLamp f={f} />
						</g>
					</>
				}
				deskY={760}
			/>
			{/* the lamp glow we came in through */}
			<rect width={W} height={H} fill="#ffcf7a" opacity={0.9 * (1 - prog(g, 0, 12, ease.out))} />
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 3. tabs: sorted by first digit; "should be even"

const Tabs: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const scene = useScene();
	const tempo = useTimeline().music.tempo;
	const cut = cue(1) - 2;
	if (f < cut) {
		// the thumb index, in the room's dim light: the camera walks the tabs 1 → 9
		const pan = prog(f, 4, cut - 10, ease.inOut);
		const cam = camMix(lookAt(560, 540, 1.85), lookAt(1400, 540, 1.85), pan);
		return (
			<FullFrame fadeIn={0} fadeOut={0} motes={0.5}>
				<EdgeLight />
				<rect width={W} height={H} fill="#0e0a07" />
				<g transform={camT(cam)}>
					<g>
						<rect x={-600} y={-400} width={3200} height={1900} fill="#160f0a" />
						<EdgeMacro x={-20} y={330} w={1960} h={420} id="tabs" tabs={1} wear={0.32} lit={0.5} dim={0.15} />
						{/* a cool sliver of moonlight across the tabs */}
						<rect x={-200} y={240} width={2400} height={120} fill="#9cc0ee" opacity={0.06} />
					</g>
				</g>
			</FullFrame>
		);
	}
	// Newcomb's working sheet under the lamp: 1…9 in a row, then nine equal bars
	const g = f - cut;
	const c2 = cue(2) - cut;
	const len = scene.duration - cut;
	const push = prog(g, 0, len, ease.inOut);
	const digitAt = (i: number) => 6 + i * 5;
	const barAt = (i: number) => c2 + 8 + i * 4;
	const bracketAt = c2 + 52;
	// the pencil follows whatever is being drawn
	let hx = 520;
	let hy = 650;
	if (g < c2) {
		const i = Math.min(8, Math.max(0, Math.floor((g - 6) / 5)));
		hx = 560 + i * 100 + 30 * prog(g, digitAt(i), 5);
		hy = 650;
	} else if (g < bracketAt) {
		const i = Math.min(8, Math.max(0, Math.floor((g - c2 - 8) / 4)));
		hx = 560 + i * 100 + 20;
		hy = 560 - 160 * prog(g, barAt(i), 4);
	} else if (g < bracketAt + 26) {
		hx = 560 + 860 * prog(g, bracketAt, 16, ease.inOut);
		hy = 360 - 10 * Math.sin(prog(g, bracketAt, 16) * Math.PI);
	} else {
		// back to the "1" bar and two taps on it, on the beat: is it really one ninth?
		const back = prog(g, bracketAt + 26, 14, ease.inOut);
		const beatF = (60 / tempo) * fps;
		const k = g - (bracketAt + 42);
		const tap = k > 0 && k < beatF * 2 ? Math.max(0, Math.sin((k / beatF) * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.5) : 0;
		hx = 1420 + (590 - 1420) * back;
		hy = 360 + (470 - 360) * back - 26 * tap;
	}
	const away = prog(g, len - 10, 10, ease.in);
	return (
		<FullFrame fadeIn={0} fadeOut={0} motes={0.6}>
			<g transform={`translate(960,540) scale(${1.02 + 0.05 * push}) translate(-960,-540)`}>
				<rect width={W} height={H} fill="#3a2414" />
				{Array.from({length: 9}, (_, i) => (
					<path key={i} d={`M-40,${80 + i * 120} C600,${70 + i * 122} 1300,${92 + i * 118} 1960,${76 + i * 121}`} stroke="#000" strokeOpacity={0.12} strokeWidth={4} fill="none" />
				))}
				<g transform="rotate(-2,960,520)">
					<rect x={380} y={160} width={1160} height={700} fill="#000" opacity={0.35} filter="url(#blur-md)" transform="translate(14,18)" />
					<rect x={380} y={160} width={1160} height={700} fill="#efe6d0" />
					{Array.from({length: 18}, (_, i) => (
						<line key={i} x1={380} y1={200 + i * 36} x2={1540} y2={200 + i * 36} stroke="#9cb0c8" strokeWidth={1} opacity={0.35} />
					))}
					{/* the digits */}
					{Array.from({length: 9}, (_, i) => {
						const p = prog(g, digitAt(i), 5);
						if (p <= 0) return null;
						return (
							<g key={i}>
								<clipPath id={`dg${i}`}>
									<rect x={560 + i * 100} y={560} width={60 * p} height={120} />
								</clipPath>
								<text x={590 + i * 100} y={660} textAnchor="middle" clipPath={`url(#dg${i})`} style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontWeight: 600, fontSize: 84, fill: '#2a2a30', ...LN}}>
									{i + 1}
								</text>
							</g>
						);
					})}
					{/* nine equal bars: the expectation */}
					{Array.from({length: 9}, (_, i) => {
						const p = prog(g, barAt(i), 5, ease.out);
						if (p <= 0) return null;
						const hgt = 160 * p;
						return (
							<g key={`b${i}`}>
								<rect x={560 + i * 100} y={560 - hgt} width={60} height={hgt} fill="#5a5a62" opacity={0.25} />
								<rect x={560 + i * 100} y={560 - hgt} width={60} height={hgt} fill="none" stroke="#3a3a42" strokeWidth={3} />
							</g>
						);
					})}
					{g >= bracketAt ? (
						<g>
							<clipPath id="brk">
								<rect x={540} y={300} width={900 * prog(g, bracketAt, 16, ease.inOut)} height={120} />
							</clipPath>
							<path d="M560,380 L560,360 L1420,360 L1420,380" stroke="#3a3a42" strokeWidth={3} fill="none" clipPath="url(#brk)" />
							<text x={990} y={340} textAnchor="middle" opacity={prog(g, bracketAt + 12, 8)} style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontWeight: 600, fontSize: 48, fill: '#2a2a30', ...LN}}>
								1/9 · 1/9 · 1/9 …
							</text>
						</g>
					) : null}
				</g>
				{/* hand + pencil */}
				<g transform={`translate(${hx + 200 * away},${hy + 400 * away}) rotate(152)`}>
					<rect x={-6} y={-150} width={12} height={150} fill="#c8913a" />
					<path d="M-6,0 L6,0 L0,22 Z" fill="#e9d6b0" />
					<path d="M-2,14 L2,14 L0,22 Z" fill="#2a2a30" />
					<path d="M-40,-150 C-50,-100 -10,-60 30,-70 C70,-80 80,-140 60,-170 L-20,-190 Z" fill={P.skin1} />
					<path d="M-30,-180 L70,-170 L90,-420 L-50,-420 Z" fill="#262a33" />
					<rect x={-30} y={-196} width={100} height={20} fill="#e9e4da" transform="rotate(4)" />
				</g>
			</g>
			{/* the room light around the sheet */}
			<rect width={W} height={H} fill="url(#vignette-hard)" opacity={0.55} />
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 4. twist: under the lamp the edge is black at the front

const Twist: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const scene = useScene();
	const cut = cue(2) - 2;
	if (f < cut) {
		// shot / reaction / shot: the edge meets the lamp → Newcomb's face → the pan from 9 to 1
		const reactAt = 40;
		const backAt = cue(1) - 6;
		if (f >= reactAt && f < backAt) {
			const g = f - reactAt;
			const push = prog(g, 0, backAt - reactAt, ease.out);
			return (
				<FullFrame fadeIn={0} fadeOut={0} motes={0.8}>
					<rect width={W} height={H} fill="#0c0806" />
					<rect x={1240} y={90} width={420} height={560} fill={P.night2} opacity={0.55} />
					<rect x={1240} y={90} width={420} height={560} fill="url(#glow-moon)" opacity={0.25} />
					<circle cx={1200} cy={1180} r={900} fill="url(#glow-lamp)" opacity={0.75} />
					<g transform={`translate(960,540) scale(${1 + 0.05 * push}) translate(-960,-540)`}>
						<g transform="translate(760,2150) scale(5.2)">
							<Figure look={NEWCOMB} pose={{...POSES.stand, head: -6, lean: -4}} expression="surprise" blink={blinkAt(f, 'nwr')} rim="warm" shadow={false} />
						</g>
					</g>
				</FullFrame>
			);
		}
		const insert2 = f >= backAt;
		const lift = spring({frame: f, fps, config: {damping: 15, stiffness: 80}});
		const show = insert2 ? 1 : prog(f, 8, 30, ease.inOut); // the wear comes up as the edge meets the light
		const y = 470 + 260 * (1 - lift);
		const pan = insert2 ? prog(f, backAt, cut - backAt - 4, ease.inOut) : 0;
		const cam = insert2 ? camMix(lookAt(1500, 470, 1.7), lookAt(430, 470, 1.7), pan) : lookAt(960, 500, 1 + 0.06 * prog(f, 0, reactAt));
		const flame = 1 + 0.05 * Math.sin(f / 2.3);
		return (
			<FullFrame fadeIn={0} fadeOut={0} motes={0.8}>
				<EdgeLight />
				<rect width={W} height={H} fill="#0a0705" />
				<g transform={camT(cam)}>
					<rect x={-800} y={-600} width={3600} height={2400} fill="#0d0907" />
					<circle cx={960} cy={1240} r={1100 * flame} fill="url(#glow-lamp)" opacity={0.85} />
					<EdgeMacro x={210} y={y - 190} w={1500} h={380} id="twist" wear={0.32 + 0.68 * show} lit={0.4 + 0.6 * show} />
					{/* his hands at both ends: sleeves from below, fingers over the covers */}
					{[-1, 1].map((sd) => {
						const hx = 960 + sd * 790;
						return (
							<g key={sd} transform={`translate(${hx},${y + 40}) scale(${sd},1)`}>
								<path d="M-40,120 C-60,300 -120,520 -160,760 L120,760 C80,520 60,300 70,120 Z" fill="#1e2027" />
								<rect x={-46} y={96} width={124} height={40} rx={10} fill="#e9e4da" transform="rotate(-6)" />
								<path d="M-30,110 C-60,40 -50,-120 -10,-170 C30,-200 80,-160 80,-80 C80,0 70,80 60,110 Z" fill={P.skin1} />
								{[0, 1, 2, 3].map((k) => (
									<rect key={k} x={-64} y={-150 + k * 52} width={70} height={46} rx={22} fill={P.skin1} stroke="#c99a7a" strokeWidth={2} />
								))}
								<path d="M-30,110 C-60,40 -50,-120 -10,-170 C30,-200 80,-160 80,-80 C80,0 70,80 60,110 Z" fill="#7a3a20" opacity={0.15} />
							</g>
						);
					})}
				</g>
				<rect width={W} height={H} fill="#000" opacity={0.15 * (1 - show)} />
			</FullFrame>
		);
	}
	// he writes it down; the two pages go into a journal on an archive shelf, and dust settles
	const g = f - cut;
	const len = scene.duration - cut;
	const title = prog(g, 2, 26, (x) => x);
	const body = prog(g, 26, 26, (x) => x);
	const away = prog(g, 56, len - 56, ease.inOut);
	const sepia = prog(g, 60, len - 60, ease.in);
	const z = 1 - 0.78 * away;
	return (
		<FullFrame fadeIn={0} fadeOut={10} motes={1.2}>
			<rect width={W} height={H} fill="#120c08" />
			{/* the archive, revealed as we pull back */}
			<g opacity={away}>
				{Array.from({length: 4}, (_, r) => (
					<g key={r}>
						<rect x={-20} y={150 + r * 250} width={1960} height={14} fill="#2a1e14" />
						{Array.from({length: 46}, (_, i) => {
							const h = 150 + random(`ah${r}${i}`) * 60;
							return <rect key={i} x={10 + i * 42} y={150 + r * 250 - h} width={38} height={h} fill={['#2a2018', '#33281c', '#241c16', '#3a2c20'][Math.floor(random(`ac${r}${i}`) * 4)]} />;
						})}
					</g>
				))}
				<text x={960} y={1010} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 30, letterSpacing: '0.4em', fill: '#8a7660'}} opacity={0.6}>
					AMERICAN JOURNAL OF MATHEMATICS · VOL. IV · 1881
				</text>
			</g>
			<g transform={`translate(960,${520 - 160 * away}) scale(${z}) translate(-960,-520)`}>
				<g transform="rotate(-3,960,520)">
					<rect x={560} y={110} width={800} height={840} fill="#000" opacity={0.4} filter="url(#blur-md)" transform="translate(12,16)" />
					<rect x={560} y={110} width={800} height={840} fill="#ece2c8" />
					<clipPath id="nt">
						<rect x={600} y={150} width={720 * title} height={150} />
					</clipPath>
					<g clipPath="url(#nt)">
						<text x={960} y={210} textAnchor="middle" style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontWeight: 600, fontSize: 36, fill: '#2a1d10'}}>
							Note on the Frequency of Use of the
						</text>
						<text x={960} y={258} textAnchor="middle" style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontWeight: 600, fontSize: 36, fill: '#2a1d10'}}>
							Different Digits in Natural Numbers.
						</text>
					</g>
					{Array.from({length: 13}, (_, i) => {
						const p = Math.max(0, Math.min(1, body * 13 - i));
						const w = 640 - (i % 4) * 40;
						return <path key={i} d={`M620,${330 + i * 42} ${Array.from({length: 16}, (_, k) => `q${w / 32},${-6 + random(`hw${i}${k}`) * 12} ${w / 16},0`).join(' ')}`} stroke="#3a2a1a" strokeWidth={2.4} fill="none" strokeDasharray={1400} strokeDashoffset={1400 * (1 - p)} opacity={0.75} />;
					})}
					<text x={1300} y={900} textAnchor="end" opacity={prog(g, 52, 8)} style={{fontFamily: font.latin, fontWeight: 700, fontSize: 30, letterSpacing: '0.2em', fill: '#2a1d10'}}>
						SIMON NEWCOMB.
					</text>
					<rect x={560} y={110} width={800} height={840} fill="#8a6a3a" opacity={0.45 * sepia} style={{mixBlendMode: 'multiply'}} />
				</g>
			</g>
			<Snow f={g} n={90} seed="dust" size={0.9} speed={0.25} o={0.5 * away} />
			<rect width={W} height={H} fill="#000" opacity={0.55 * sepia} />
		</FullFrame>
	);
};

export const scenes: SceneMap = {Hook, Office, Tabs, Twist};
