import React from 'react';
import {Sequence, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CAST} from '../../src/art/cast';
import {Figure, POSES, blinkAt, lerpPose, walkPose} from '../../src/art/Figure';
import {Embers, Impact, Smoke, Torch} from '../../src/art/fx';
import {P} from '../../src/art/palette';
import {lookAt, type Cam} from '../../src/art/sets/Airfield';
import {Battlefield} from '../../src/art/sets/Battlefield';
import {LondonOffice} from '../../src/art/sets/LondonOffice';
import {Jar, Panther, Panzer, SerialPlate} from '../../src/art/Tank';
import {EndCard, TitleCard, type BrandCfg, type VideoCfg} from '../../src/brand/Brand';
import {FullFrame, camMix} from '../../src/components/FullFrame';
import {T, countUp} from '../../src/components/Stage';
import {ease, prog, useBeat, useCue, useHitFrames, useScene, useSnapBeat, useTimeline} from '../../src/lib/context';
import {color, font} from '../../src/lib/theme';
import type {SceneMap, SceneProps} from '../../src/lib/types';

const W = 1920;
const H = 1080;
const BROWSER_SAFE_GOLD = color.gold;

// the channel package: the identity itself lives in src/brand/identity.ts
const BRAND: BrandCfg = {videos: []};
const EPISODE: VideoCfg = {
	id: 'tanks',
	src: '',
	title: '德国坦克问题',
	kicker: 'THE GERMAN TANK PROBLEM · 1943',
	tagline: '只看编号，能算出敌人造了多少坦克吗？',
	taglineEn: 'Counting tanks from their serial numbers.',
	motif: 'serials',
	card: [0, 3.2],
	hit: 0.25,
	extend: 0,
	question: '你还见过哪些"藏在编号里"的秘密？',
	sources: '参考 · Ruggles & Brodie, JASA (1947) · Fortune (2008) iPhone 3G 序列号估算',
	duration: 0,
};


/** A soldier's torch pool over everything outside it. */
const TorchVignette: React.FC<{x: number; y: number; r?: number; dark?: number}> = ({x, y, r = 760, dark = 0.92}) => (
	<>
		<defs>
			<radialGradient id={`pool-${Math.round(x)}-${Math.round(y)}`} cx={x} cy={y} r={r} gradientUnits="userSpaceOnUse">
				<stop offset="0" stopColor="#000" stopOpacity="0" />
				<stop offset="0.55" stopColor="#000" stopOpacity={dark * 0.35} />
				<stop offset="1" stopColor="#000" stopOpacity={dark} />
			</radialGradient>
		</defs>
		<rect width={W} height={H} fill={`url(#pool-${Math.round(x)}-${Math.round(y)})`} />
	</>
);

/** Riveted, scorched dunkelgelb armour filling the frame (behind close-ups). */
const Armour: React.FC = () => (
	<g>
		<rect width={W} height={H} fill="#7d6c44" />
		<rect width={W} height={H} fill="url(#rivets)" opacity={0.9} />
		{[180, 900].map((y) => (
			<path key={y} d={`M0,${y} L${W},${y + 14}`} stroke="#3e3420" strokeWidth={10} opacity={0.6} />
		))}
		{Array.from({length: 26}, (_, i) => (
			<circle key={i} cx={60 + i * 72} cy={150} r={9} fill="#4d4128" />
		))}
		<ellipse cx={1600} cy={260} rx={520} ry={300} fill="url(#scorch)" />
		<ellipse cx={250} cy={900} rx={420} ry={240} fill="url(#scorch)" opacity={0.8} />
	</g>
);

const Paper: React.FC<{x: number; y: number; w: number; h: number; r?: number; children?: React.ReactNode; o?: number}> = ({x, y, w, h, r = 0, children, o = 1}) => (
	<g transform={`translate(${x},${y}) rotate(${r})`} opacity={o}>
		<rect x={-w / 2 + 6} y={-h / 2 + 8} width={w} height={h} fill="#000" opacity={0.35} filter="url(#blur-sm)" />
		<rect x={-w / 2} y={-h / 2} width={w} height={h} fill="url(#grain-paper)" />
		{children}
	</g>
);

const Hand: React.FC<{x: number; y: number; size?: number; children: React.ReactNode; tone?: string; o?: number; anchor?: 'start' | 'middle' | 'end'}> = ({
	x,
	y,
	size = 30,
	children,
	tone = P.ink,
	o = 1,
	anchor = 'middle',
}) => (
	<text x={x} y={y} textAnchor={anchor} opacity={o} style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontWeight: 600, fontSize: size, fill: tone}}>
		{children}
	</text>
);

// ---------------------------------------------------------------- 1. hook

const Hook: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const scene = useScene();
	const beat = useBeat(8);
	const cutA = cue(1) + 54; // wide → plate close-up
	const cutB = cue(2) - 6; // plate → wall of plates
	if (f < cutA) {
		const walkEnd = 52;
		const walking = f < walkEnd;
		const sx = interpolate(f, [0, walkEnd], [1720, 1500], {extrapolateRight: 'clamp', easing: ease.out});
		const stop = spring({frame: f - walkEnd, fps, config: {damping: 11}});
		const pose = walking ? walkPose(f * 0.3, 0.8) : lerpPose(POSES.stand, POSES.hold, stop);
		const beam = interpolate(f, [24, 66, cue(1)], [202, 168, 176], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.inOut});
		const push = prog(f, cue(1) - 6, cutA - cue(1) + 6, ease.in);
		const cam = camMix(lookAt(1000, 600, 1.02 + 0.03 * prog(f, 0, cue(1))), lookAt(1250, 780, 2.7), push);
		return (
			<FullFrame fadeIn={24} fadeOut={1}>
				<Battlefield frame={f + 200} cam={cam}>
					<g transform="translate(980, 880) scale(0.9)">
						<Panzer wreck plateGlow={prog(f, cue(1) - 4, 16)} />
						<g transform="translate(-80,-230)">
							<circle r={90} fill="url(#glow-fire)" opacity={0.45 + 0.15 * Math.sin(f / 3)} />
							<Embers frame={f} />
							<Smoke frame={f + 120} seed="hero" height={600} wind={0.6} lit="#ff8a3d" />
						</g>
					</g>
					<g transform={`translate(${sx}, 900) scale(0.42)`}>
						<Figure look={CAST.soldier} pose={pose} reach={walking ? undefined : {near: [96, -236]}} flip rim="moon" blink={blinkAt(f, 'sol')} />
					</g>
					<g transform={`translate(${sx - 40}, 801)`}>
						<Torch angle={beam} reach={300} spread={12} power={prog(f, 18, 10)} />
					</g>
				</Battlefield>
			</FullFrame>
		);
	}
	if (f < cutB) {
		const g = f - cutA;
		const torch = 0.35 + 0.65 * prog(g, 0, 12) + 0.04 * Math.sin(g / 2.3);
		const lx = 960 + 40 * Math.sin(g / 17) - 60 * (1 - prog(g, 0, 20, ease.out));
		const ly = 500 + 20 * Math.cos(g / 13);
		return (
			<FullFrame fadeIn={1} fadeOut={1}>
				<g transform={`translate(960,540) scale(${1 + 0.06 * prog(g, 0, cutB - cutA, ease.out)}) translate(-960,-540)`}>
					<Armour />
					<g transform="translate(960,500) scale(1.85) rotate(-2)">
						<SerialPlate serial="82731" torch={torch} reveal={prog(g, 4, 24, ease.out)} />
					</g>
				</g>
				<TorchVignette x={lx} y={ly} />
				<rect width={W} height={H} fill="#fff4dc" opacity={Math.max(0, 0.45 - g / 9)} />
			</FullFrame>
		);
	}
	// the one plate becomes many: every captured tank leaves a number. The wall keeps growing
	// as the camera pulls back, a torch sweeps across it, then we slam back into 82731 for the title.
	const g = f - cutB;
	const end = scene.duration;
	const slam = prog(f, end - 18, 18, ease.in);
	const pull = interpolate(g, [0, 70, end - cutB - 18], [3.1, 1, 0.64], {extrapolateRight: 'clamp', easing: ease.inOut});
	const zoom = pull + (4.2 - pull) * slam;
	const sweep = interpolate(g, [80, end - cutB - 30], [-500, 2400], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<FullFrame fadeIn={1} fadeOut={1}>
			<rect width={W} height={H} fill="#0b0c11" />
			<g transform={`translate(960,470) scale(${zoom}) translate(-960,-470)`}>
				{WALL.map(({n, c, r, d}, i) => {
					const hero = n === '82731';
					const x = 960 + c * 330;
					const y = 470 + r * 190;
					// the first ring lands during the zoom-out; the outer rings ripple in as we pull back
					const t0 = d <= 1 ? 10 + ((i * 7) % 15) * 3 : 70 + (d - 1) * 26 + ((i * 5) % 9) * 3;
					const q = hero ? 1 : prog(g, t0, 14, ease.back);
					const lit = Math.exp(-(((x - sweep) / 240) ** 2));
					return (
						<g key={n} transform={`translate(${x},${y}) scale(${0.42 * (0.85 + 0.15 * q)}) rotate(${(random(`pr${i}`) - 0.5) * 6})`} opacity={q * (hero ? 1 : 1 - 0.7 * slam)}>
							<SerialPlate serial={n} torch={hero ? 1 : 0.45 + 0.15 * random(`pt${i}`) + 0.45 * lit} />
						</g>
					);
				})}
			</g>
			<rect width={W} height={H} fill="#000" opacity={0.25 - 0.1 * beat} />
			<rect width={W} height={H} fill="#fff4dc" opacity={0.6 * prog(f, end - 4, 4, ease.in)} />
		</FullFrame>
	);
};

// 9 × 5 plates around 82731; d = ring distance from the centre
const WALL = Array.from({length: 45}, (_, i) => {
	const c = (i % 9) - 4;
	const r = Math.floor(i / 9) - 2;
	const n = c === 0 && r === 0 ? '82731' : String(82600 + Math.floor(random(`wall${i}`) * 560));
	return {n, c, r, d: Math.max(Math.abs(c), Math.abs(r))};
});

// ---------------------------------------------------------------- 2. London: the conventional estimate

const London: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const titleLen = cue(0) - 6;
	const pan = prog(f, titleLen - 30, 80, ease.inOut);
	const cam = camMix(lookAt(1560, 340, 1.7), lookAt(960, 600, 1.04), pan);
	const point = spring({frame: f - cue(0) - 24, fps, config: {damping: 12}}); // the analyst turns to the map as the question is asked
	const doubt = spring({frame: f - cue(2) - 20, fps, config: {damping: 14}});
	const stamp = spring({frame: f - cue(2) - 6, fps, config: {damping: 9, stiffness: 160}});
	const shake = f >= cue(2) + 6 ? Math.exp(-(f - cue(2) - 6) / 4) * 8 : 0;
	const reports: [number, number, number, string, string][] = [
		[520, 250, -6, 'AGENT REPORT', '≈ 1000?'],
		[700, 360, 4, 'P.O.W. INTERVIEW', '≈ 1800?'],
		[880, 230, -3, 'AERIAL RECON', '≈ 1200?'],
	];
	return (
		<FullFrame
			fadeIn={1}
			fadeOut={8}
			exit={14}
			overlay={
				<Sequence durationInFrames={titleLen + 14} layout="none">
					<TitleCard v={EPISODE} cfg={BRAND} dur={titleLen + 14} />
				</Sequence>
			}
		>
			{/* hidden while the title card fades up, so the office never flashes before it */}
			<g transform={`translate(${shake * (random(`sx${f}`) - 0.5)},${shake * (random(`sy${f}`) - 0.5)})`} opacity={f < 8 ? 0 : 1}>
				<LondonOffice
					frame={f + 300}
					cam={cam}
					pins={prog(f, cue(0) + 12, 50)}
					staff={
						<>
							<g transform="translate(760, 1010) scale(1.45)">
								<Figure look={CAST.analyst} pose={lerpPose(POSES.stand, POSES.pointUp, point)} reach={point > 0.3 ? {near: [160, -420]} : undefined} expression={f > cue(2) ? 'stern' : 'neutral'} blink={blinkAt(f, 'an')} rim="warm" shadow={false} />
							</g>
							<g transform="translate(1290, 1010) scale(1.45)">
								<Figure look={CAST.economist} pose={lerpPose(POSES.stand, POSES.think, doubt)} reach={doubt > 0.3 ? {near: [22, -292]} : undefined} expression={doubt > 0.5 ? 'thinking' : 'neutral'} blink={blinkAt(f, 'ec')} rim="warm" flip shadow={false} />
							</g>
						</>
					}
				>
					{reports.map(([x, y, r, head, guess], i) => {
						const p = spring({frame: f - cue(1) - i * 10, fps, config: {damping: 10, stiffness: 140}});
						const jitter = 0;
						return (
							<g key={head} transform={`translate(${x + (1 - p) * -300},${y + (1 - p) * 120}) scale(${0.6 + 0.4 * p})`} opacity={Math.min(1, p * 2)}>
								<Paper x={0} y={0} w={190} h={130} r={r + jitter}>
									<text x={-80} y={-34} style={{fontFamily: 'monospace', fontSize: 15, fontWeight: 700, fill: P.ink, letterSpacing: '0.08em'}}>
										{head}
									</text>
									<rect x={-80} y={-20} width={150} height={3} fill={P.ink} opacity={0.3} />
									<rect x={-80} y={-8} width={120} height={3} fill={P.ink} opacity={0.3} />
									<Hand x={0} y={44} size={38} tone={P.redDeep}>
										{guess}
									</Hand>
								</Paper>
							</g>
						);
					})}
					{f >= cue(2) + 6 ? (
						<g transform={`translate(690,330) rotate(-8) scale(${2.2 - 1.2 * stamp})`} opacity={Math.min(1, stamp * 1.5)}>
							<rect x={-190} y={-62} width={380} height={124} rx={8} fill="none" stroke={P.red} strokeWidth={7} />
							<text y={-12} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 34, fill: P.red, letterSpacing: '0.2em'}}>
								情报估计
							</text>
							<text y={42} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 52, fill: P.red}}>
								≈1400 / 月
							</text>
						</g>
					) : null}
				</LondonOffice>
			</g>
		</FullFrame>
	);
};


// ---------------------------------------------------------------- 3. serial numbers everywhere

const PARTS: [string, string, number, number, number, number][] = [
	// label, serial, part x, part y (tank space), tag x, tag y (screen)
	['底盘', 'Fgst.Nr. 82731', -60, -120, 520, 300],
	['发动机', 'Motor 46205', -300, -150, 300, 560],
	['变速箱', 'Getriebe 7718', 300, -112, 1500, 300],
	['负重轮', 'Laufrolle 3302', 100, -24, 1420, 660],
];

const Serials: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const ledgerAt = cue(2) - 8;
	const sceneLen = useScene().duration;
	if (f < ledgerAt) {
		const tx = interpolate(f, [0, cue(1) - 6], [640, 900], {extrapolateRight: 'clamp', easing: ease.out});
		const ty = 690;
		const s = 1.05;
		return (
			<FullFrame fadeIn={8} enter={16} fadeOut={6} exit={10} endAt={ledgerAt}>
				<rect width={W} height={H} fill="#0d1830" />
				{Array.from({length: 40}, (_, i) => (
					<line key={`v${i}`} x1={i * 50} y1={0} x2={i * 50} y2={H} stroke="#5f7aa3" strokeOpacity={i % 5 ? 0.08 : 0.18} />
				))}
				{Array.from({length: 24}, (_, i) => (
					<line key={`h${i}`} x1={0} y1={i * 50} x2={W} y2={i * 50} stroke="#5f7aa3" strokeOpacity={i % 5 ? 0.08 : 0.18} />
				))}
				<text x={120} y={240} style={{fontFamily: 'monospace', fontSize: 22, fill: '#9cc0ee', letterSpacing: '0.2em'}} opacity={0.6}>
					PZ.KPFW. IV · SEITENANSICHT
				</text>
				<g transform={`translate(${tx},${ty}) scale(${s})`} opacity={prog(f, 0, 20)}>
					<Panzer travel={f * 2} />
				</g>
				{PARTS.map(([label, serial, px, py, gx, gy], i) => {
					const p = spring({frame: f - cue(1) - i * 9, fps, config: {damping: 11, stiffness: 150}});
					if (f < cue(1) + i * 9) return null;
					const ax = tx + px * s;
					const ay = ty + py * s;
					return (
						<g key={label} opacity={Math.min(1, p * 1.5)}>
							<circle cx={ax} cy={ay} r={10 + 4 * p} fill="none" stroke={BROWSER_SAFE_GOLD} strokeWidth={2.5} />
							<line x1={ax} y1={ay} x2={ax + (gx - ax) * p} y2={ay + (gy - ay) * p} stroke={BROWSER_SAFE_GOLD} strokeWidth={1.6} strokeDasharray="5 5" />
							<g transform={`translate(${gx},${gy}) scale(${0.6 + 0.4 * p})`}>
								<rect x={-150} y={-46} width={300} height={92} rx={8} fill="rgba(8,14,28,0.88)" stroke={BROWSER_SAFE_GOLD} strokeOpacity={0.7} />
								<T y={-14} size={30} weight={900} tone="gold">
									{label}
								</T>
								<text y={26} textAnchor="middle" style={{fontFamily: 'monospace', fontSize: 24, fontWeight: 700, fill: '#e9e2cf'}}>
									{serial}
								</text>
							</g>
						</g>
					);
				})}
			</FullFrame>
		);
	}
	// the ledger: a handful of big serials written fast, then highlighted when the question lands
	const g = f - ledgerAt;
	const LOG = ['82731', '82654', '82917', '83044', '82788', '82992', '83106', '82863'];
	const written = Math.min(LOG.length, Math.floor(Math.max(0, g - 4) / 5) + (g >= 4 ? 1 : 0));
	// on the last accent before the break the numbers come loose and fall (into the jar, next scene)
	const fallStart = sceneLen - 16;
	const fallOf = (i: number) => {
		const t = f - fallStart - Math.floor(random(`fd${i}`) * 9);
		return t > 0 ? 1.9 * t * t : 0;
	};
	return (
		<FullFrame fadeIn={6} enter={14} startAt={ledgerAt} fadeOut={1}>
			<rect width={W} height={H} fill="#120d09" />
			<ellipse cx={960} cy={180} rx={900} ry={520} fill="url(#glow-lamp)" opacity={0.5} />
			<g transform="translate(960,470) rotate(-3)">
				<Paper x={0} y={0} w={1180} h={720}>
					<text x={-520} y={-290} style={{fontFamily: 'monospace', fontWeight: 700, fontSize: 26, fill: P.ink, letterSpacing: '0.12em'}}>
						CAPTURED EQUIPMENT · SERIAL LOG · 1943
					</text>
					<text x={-520} y={-238} style={{fontFamily: 'monospace', fontSize: 24, fill: P.ink, opacity: 0.7}}>
						Fgst.Nr. · 底盘编号
					</text>
					<line x1={-520} y1={-222} x2={520} y2={-222} stroke={P.ink} strokeOpacity={0.4} />
					{LOG.slice(0, written).map((n, i) => {
						const x = -470 + Math.floor(i / 4) * 520;
						const y = -140 + (i % 4) * 110;
						const ink = prog(g, 4 + i * 5, 6, ease.out);
						const mark = prog(f, cue(3) + i * 4, 10, ease.out);
						return (
							<g key={n} transform={`translate(0,${fallOf(i)}) rotate(${fallOf(i) * 0.02 * (random(`fr${i}`) - 0.5)})`}>
								{/* highlighter swipe behind the number */}
								<rect x={x - 14} y={y - 52} width={340 * mark} height={66} rx={8} fill={color.gold} opacity={0.45} />
								<g opacity={ink}>
									<Hand x={x} y={y} size={64} anchor="start" tone={mark > 0.5 ? '#5a3a06' : P.ink}>
										{n}
									</Hand>
								</g>
							</g>
						);
					})}
				</Paper>
			</g>
			<rect width={W} height={H} fill="#030305" opacity={0.92 * prog(f, fallStart + 2, 14, ease.in)} />
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 4. the jar (the music goes quiet)

const PICKS = [19, 40, 42, 60];

const JarScene: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const jx = 760;
	const jy = 660;
	// "how many balls?": a counter spins through guesses, then settles, unsure, on the largest pick
	const askAt = cue(2) - 4;
	const settle = cue(3) - 2;
	const rolling = f >= askAt && f < settle ? 1 : 0;
	const others = Array.from({length: 26}, (_, i) => ({
		n: [3, 11, 27, 33, 51, 8, 66, 14, 72, 25, 47, 5, 58, 36, 22, 9, 31, 54, 17, 63, 2, 45, 29, 70, 12, 38][i],
		x: -150 + (i % 6) * 58 + (Math.floor(i / 6) % 2) * 26,
		y: 60 - Math.floor(i / 6) * 54,
	}));
	const pop = spring({frame: f - askAt, fps, config: {damping: 12}});
	const land = f >= settle ? Math.exp(-(f - settle) / 5) : 0;
	const fillGap = Math.max(2, (cue(1) - 30) / others.length);
	const FALL = 18;
	const timed = others.map((b, i) => ({...b, t: 10 + i * fillGap}));
	const lid = prog(f, 0, 12, ease.out);
	/** where a ball is: dropped from above into the mouth, then rolled down to its place */
	const ballAt = (b: (typeof timed)[number]) => {
		const k = f - b.t;
		const mx = Math.max(-95, Math.min(95, b.x));
		if (k < 8) {
			const p = prog(k, 0, 8, ease.in);
			return {x: mx, y: -760 + (-300 + 760) * p, morph: p};
		}
		const p = prog(k, 8, FALL - 8, ease.out);
		const bounce = Math.sin(Math.min(1, p) * Math.PI) * -18 * (1 - p);
		return {x: mx + (b.x - mx) * p, y: -300 + (b.y + 300) * p + bounce, morph: 1};
	};
	const lean = prog(f, settle, 70, ease.inOut);
	const sceneEnd = useScene().duration;
	return (
		<FullFrame fadeIn={1} fadeOut={8}>
			<g transform={`translate(1370,520) scale(${1 + 0.08 * lean}) translate(-1370,-520)`}>
			<rect width={W} height={H} fill="#07080c" />
			<polygon points={`${jx - 90},-40 ${jx + 90},-40 ${jx + 360},${H} ${jx - 360},${H}`} fill="url(#beam-warm)" opacity={0.55} />
			<ellipse cx={jx} cy={790} rx={330} ry={44} fill="#000" opacity={0.6} />
			<g transform={`translate(${jx},${jy}) scale(1.05)`} opacity={prog(f, 0, 24)}>
				<Jar balls={[]} lid={lid} />
				<defs>
					{/* the inside of the glass plus the column above the mouth: balls never cross the glass */}
					<clipPath id="jar-inside">
						<path d="M-146,-326 L146,-326 L146,-298 C186,-278 196,-240 196,-200 L196,40 C196,78 168,96 130,96 L-130,96 C-168,96 -196,78 -196,40 L-196,-200 C-196,-240 -186,-278 -146,-298 Z" />
						<rect x={-146} y={-1200} width={292} height={880} />
					</clipPath>
				</defs>
				<g clipPath="url(#jar-inside)">
					{timed
						.filter((b) => f >= b.t)
						.map((b) => {
							const {x, y, morph} = ballAt(b);
							// a loose number from the ledger, rounding into a ball as it drops in
							return (
								<g key={b.n} transform={`translate(${x},${y})`}>
									<circle r={26 * Math.min(1, 0.3 + morph)} fill="#d9cfb6" />
									<circle cx={-8} cy={-9} r={7} fill="#fff" opacity={0.5 * morph} />
									<text y={9} textAnchor="middle" style={{fontFamily: 'monospace', fontWeight: 700, fontSize: 24, fill: '#3a2f1e'}}>
										{b.n}
									</text>
								</g>
							);
						})}
				</g>
			</g>
			{/* the rest of the ledger still falling through the dark */}
			{f < 22
				? Array.from({length: 26}, (_, i) => {
						const x = 200 + random(`rx${i}`) * 1520;
						const y = -60 + (f + random(`ry${i}`) * 10) ** 2 * 1.9;
						return (
							<text key={i} x={x} y={y} opacity={0.7 * (1 - f / 22)} style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontWeight: 600, fontSize: 26, fill: '#e9dcc0'}}>
								{82600 + Math.floor(random(`rn${i}`) * 560)}
							</text>
						);
					})
				: null}
			{/* the four picks fly out to a velvet tray */}
			<rect x={1060} y={690} width={620} height={90} rx={18} fill="#3a1418" opacity={prog(f, cue(1) - 10, 20)} />
			{PICKS.map((n, i) => {
				const t0 = cue(1) + 6 + i * 15;
				const p = spring({frame: f - t0, fps, config: {damping: 13, stiffness: 120}});
				if (f < t0) return null;
				const sx = jx - 40 + i * 30;
				const sy = jy - 120;
				const ex = 1140 + i * 150;
				const ey = 730;
				const arc = Math.sin(Math.min(1, p) * Math.PI) * -180;
				const hot = n === 60 ? land : 0;
				const drop = Math.max(0, f - (sceneEnd - 12 + i * 2)) ** 2 * 3.2;
				return (
					<g key={n} transform={`translate(${sx + (ex - sx) * p},${sy + (ey - sy) * p + arc + drop}) scale(${1 + 0.5 * Math.min(1, p) + 0.15 * hot})`}>
						<circle r={48} fill="url(#glow-lamp)" opacity={0.8} />
						<circle r={30} fill="#f6e3b0" />
						<circle cx={-9} cy={-10} r={8} fill="#fff" opacity={0.6} />
						<text y={10} textAnchor="middle" style={{fontFamily: 'monospace', fontWeight: 700, fontSize: 28, fill: '#3a2f1e'}}>
							{n}
						</text>
					</g>
				);
			})}
			{f >= askAt ? (
				<g transform={`translate(1370,470) scale(${0.85 + 0.15 * pop})`} opacity={prog(f, askAt, 10)}>
					<T x={-50} y={4} size={60} family="latin" weight={600} tone="dim">
						N =
					</T>
					<g transform={`translate(80,0) scale(${1 + 0.25 * land})`}>
						<T x={0} y={0} size={120} family="latin" weight={700} tone={rolling ? 'text' : 'gold'} opacity={rolling ? 0.7 : 1}>
							{rolling ? String(30 + Math.floor(random(`roll${Math.floor(f / 3)}`) * 90)) : '60'}
						</T>
					</g>
					<line x1={10} y1={74} x2={150} y2={74} stroke={color.gold} strokeWidth={3} strokeDasharray="10 8" opacity={rolling ? 0.35 : 0.45 + 0.45 * Math.abs(Math.cos((f - settle) / 10))} />
				</g>
			) : null}
			{f >= settle ? (
				// the guess comes from the biggest ball on the tray
				<path d="M1590,676 C1590,600 1560,560 1530,548" fill="none" stroke={color.gold} strokeWidth={2.5} strokeDasharray="6 7" opacity={0.8 * prog(f, settle, 12)} />
			) : null}
			</g>
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 5. the gaps (the music builds)

const px = (n: number) => 240 + ((n - 0) / 80) * 1440;

const Gaps: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const scene = useScene();
	const y = 600;
	const even = prog(f, cue(2), 40, ease.inOut);
	const extra = prog(f, cue(3) + 6, 50, ease.out);
	const tension = prog(f, cue(3), scene.duration - cue(3), ease.in);
	const pulse = useBeat(6);
	const end = scene.duration;
	const dive = prog(f, cue(3), end - 10 - cue(3), ease.in);
	const suck = prog(f, end - 8, 8, ease.in);
	const camZ = 1 + 0.5 * dive - 0.12 * suck;
	const shiver = 0;
	// where does the jar really end? a ghost marker searching beyond 60 until the extra gap settles it
	const ghostX = interpolate(f, [cue(0) + 10, cue(0) + 46, cue(0) + 70], [60, 79, 72], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.inOut});
	const ghost = prog(f, cue(0) + 10, 20) * (1 - extra);
	const scan = Math.floor(f / 14) % 4;
	const real: [number, number][] = [
		[0, 19],
		[19, 40],
		[40, 42],
		[42, 60],
	];
	return (
		<FullFrame fadeIn={5} fadeOut={1}>
			<rect width={W} height={H} fill="#090b12" />
			<g transform={`translate(${px(67.5) + shiver},${y + 40}) scale(${camZ}) translate(${-px(67.5) + (px(67.5) - 960) * (1 - dive) * 0},${-(y + 40)})`}>
			<ellipse cx={960} cy={560} rx={900} ry={380} fill="url(#glow-lamp)" opacity={0.12 + 0.18 * tension + 0.08 * pulse * tension} />
			{/* the ruler */}
			<line x1={px(0)} y1={y} x2={px(0) + (px(80) - px(0)) * prog(f, 0, 30, ease.out)} y2={y} stroke={color.gold} strokeWidth={3} />
			{Array.from({length: 9}, (_, i) => (
				<g key={i} opacity={prog(f, i * 3, 14)}>
					<line x1={px(i * 10)} y1={y - 10} x2={px(i * 10)} y2={y + 10} stroke={color.gold} strokeWidth={2} />
					<T x={px(i * 10)} y={y + 44} size={26} family="latin" tone="dim">
						{i * 10}
					</T>
				</g>
			))}
			<rect x={px(60)} y={y - 40} width={px(80) - px(60)} height={80} fill="none" stroke={color.gold} strokeDasharray="8 8" opacity={0.35 * (1 - extra)} />
			{/* the unknown end is shown by the searching marker, not a question mark */}
			{/* the unseen last ball, somewhere past 60 */}
			<g opacity={ghost}>
				<line x1={px(60)} y1={y} x2={px(ghostX)} y2={y} stroke={color.gold} strokeWidth={3} strokeDasharray="4 8" opacity={0.6} />
				<circle cx={px(ghostX)} cy={y - 40} r={22} fill="none" stroke={color.gold} strokeWidth={2.5} strokeDasharray="5 5" opacity={0.7} />
				<circle cx={px(ghostX)} cy={y - 40} r={30} fill="url(#glow-lamp)" opacity={0.35} />
			</g>
			{/* picks drop in */}
			{PICKS.map((n, i) => {
				const p = spring({frame: f - i * 2, fps, config: {damping: 10}});
				return (
					<g key={n} transform={`translate(${px(n)},${y - 40 - (1 - p) * 300})`}>
						<circle r={22} fill="#f6e3b0" />
						<text y={8} textAnchor="middle" style={{fontFamily: 'monospace', fontWeight: 700, fontSize: 20, fill: '#3a2f1e'}}>
							{n}
						</text>
					</g>
				);
			})}
			{/* the gaps: uneven, then their average */}
			{real.map(([a, b], i) => {
				const show = prog(f, cue(1) + i * 8, 16);
				const ea = i * 15;
				const eb = (i + 1) * 15;
				const A = a + (ea - a) * even;
				const B = b + (eb - b) * even;
				const yy = y + 110 + (i % 2) * 0;
				const hot = f > cue(1) + 40 && scan === i ? 1 : 0;
				return (
					<g key={i} opacity={show}>
						<path d={`M${px(A) + 4},${yy} Q${(px(A) + px(B)) / 2},${yy + 60} ${px(B) - 4},${yy}`} fill="none" stroke={even > 0.5 ? color.gold : color.steel} strokeWidth={3 + 2 * hot} opacity={0.75 + 0.25 * hot} />
						<T x={(px(A) + px(B)) / 2} y={yy + 86} size={34} family="latin" weight={600} tone={even > 0.5 ? 'gold' : 'text'}>
							{even > 0.5 ? '15' : `${b - a}`}
						</T>
					</g>
				);
			})}
			{/* one more gap of the same width, past the largest number */}
			<g opacity={extra}>
				<path d={`M${px(60) + 4},${y + 110} Q${(px(60) + px(60 + 15 * extra)) / 2},${y + 170} ${px(60 + 15 * extra) - 4},${y + 110}`} fill="none" stroke={color.gold} strokeWidth={4} strokeDasharray="10 6" />
				<T x={px(67.5)} y={y + 196} size={34} family="latin" weight={600} tone="gold">
					+15
				</T>
				<circle cx={px(60 + 15 * extra)} cy={y} r={14 + 10 * pulse * tension} fill="url(#glow-lamp)" />
			</g>
			</g>
			{/* the frame closes in before the drop */}
			<rect width={W} height={H} fill="url(#vignette-hard)" opacity={dive} />
			<rect width={W} height={H} fill="#000" opacity={0.85 * suck} />
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 6. the formula, then the real numbers (the drop)

const Formula: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const toks = ['60', '+', '60 ÷ 4', '−', '1', '≈', '74'];
	const tempo = useTimeline().music.tempo;
	const toChart = prog(f, cue(2) - 10, 24, ease.inOut);
	const bars: [string, number, string, number][] = [
		['情报部门估计', 1550, P.red, cue(2)],
		['编号统计', 327, color.gold, cue(3)],
		['德国档案', 342, P.paper, cue(4)],
	];
	const flash = Math.exp(-f / 7);
	const half = 60 / tempo / 2 * fps; // the sum lands term by term on half-beats from the drop
	const heroAt = 6 * half;
	const stampAt = cue(3) + 22;
	const snap = useSnapBeat();
	const stamp = spring({frame: f - stampAt, fps, config: {damping: 9, stiffness: 200}});
	const kick = (t: number) => (f >= t ? Math.exp(-(f - t) / 4) : 0);
	const shake = 16 * kick(0) + 9 * kick(Math.round(heroAt)) + 10 * kick(cue(3) + 22);
	return (
		<FullFrame fadeIn={2} fadeOut={8} exit={12}>
			<rect width={W} height={H} fill="#07080c" />
			<ellipse cx={960} cy={500} rx={900} ry={420} fill="url(#glow-lamp)" opacity={0.25 + 0.4 * flash} />
				<Impact f={f} x={960} y={430} size={1.2} seed="drop" />
				<Impact f={f} t={Math.round(heroAt)} x={960 + 3 * 190} y={430} size={0.6} seed="74" />
				<g transform={`translate(${shake * (random(`fx${f}`) - 0.5)},${shake * (random(`fy${f}`) - 0.5)})`}>
					{/* the jar sum, token by token on the beat */}
				<g opacity={1 - toChart} transform={`translate(0,${-260 * prog(f, cue(1), 30, ease.inOut)}) translate(960,430) scale(${1 + 0.07 * prog(f, 40, cue(1) - 40, ease.inOut)}) translate(-960,-430)`}>
					{toks.map((t, i) => {
							const p = spring({frame: f - i * half, fps, config: {damping: 9, stiffness: 220}});
						const x = 960 + (i - 3) * 190 + (i === 2 ? 0 : 0);
							const hero = i === 6;
							const wave = 0;
							return (
								<g key={i} transform={`translate(${x},430) scale(${(hero ? 1.4 * p : p) * (1 + wave)})`} opacity={Math.min(1, p * 3)}>
								{hero ? <circle r={110} fill="url(#glow-lamp)" opacity={0.8} /> : null}
								<T size={i === 2 ? 80 : 104} family="latin" weight={600} tone={hero ? 'gold' : 'text'}>
									{t}
								</T>
							</g>
						);
					})}
					<g opacity={prog(f, 50, 24)}>
						<T x={960} y={600} size={46} family="latinItalic" tone="gold">
							N ≈ m + m / k − 1
						</T>
						<T x={960} y={656} size={26} family="sans" tone="dim" track={0.2}>
							m = 最大编号 · k = 样本数
						</T>
					</g>
				</g>
				{/* balls become tanks */}
				{f >= cue(1) && f < cue(2) + 20 ? (
					<g opacity={prog(f, cue(1), 16) * (1 - toChart)}>
						{PICKS.map((n, i) => {
							const p = prog(f, cue(1) + 10 + i * 6, 24, ease.inOut);
							const x = 480 + i * 320;
							return (
								<g key={n} transform={`translate(${x},620)`}>
									<g opacity={1 - p}>
										<circle r={34} fill="#f6e3b0" />
										<text y={10} textAnchor="middle" style={{fontFamily: 'monospace', fontWeight: 700, fontSize: 28, fill: '#3a2f1e'}}>
											{n}
										</text>
									</g>
										<g opacity={p} transform={`scale(${0.28 * p})`}>
											<Panzer />
									</g>
									<text y={70} textAnchor="middle" opacity={p} style={{fontFamily: 'monospace', fontWeight: 700, fontSize: 24, fill: color.gold}}>
										{`Nr. ${82000 + n * 11}`}
									</text>
								</g>
							);
						})}
					</g>
				) : null}
				{/* August 1942: each bar stacks up out of tanks, fast; the wrong one gets stamped */}
				<g opacity={toChart}>
					<T x={960} y={170} size={30} family="sans" tone="dim" track={0.3}>
						1942 年 8 月 · 德国坦克月产量
					</T>
					{bars.map(([label, v, c, at], i) => {
						const rowsAll = Math.max(1, Math.round((v / 1550) * 20));
						const shown = Math.min(rowsAll, Math.floor(Math.max(0, f - at) / 1.6));
						const top = 780 - rowsAll * 25;
						const x = 600 + i * 360;
						const tone = i === 0 ? 'red' : i === 1 ? 'gold' : 'text';
						return (
							<g key={label} opacity={prog(f, at - 4, 8)}>
								<rect x={x - 84} y={top - 4} width={168} height={rowsAll * 25 + 4} rx={6} fill="none" stroke={c} strokeOpacity={0.35} strokeWidth={2} />
								{Array.from({length: shown}, (_, r) =>
									[0, 1, 2, 3].map((k) => (
										<g key={`${r}-${k}`} transform={`translate(${x - 60 + k * 40},${780 - r * 25 - 6})`}>
											<rect x={-17} y={-8} width={34} height={11} rx={3} fill={c} />
											<rect x={-9} y={-15} width={16} height={8} rx={2} fill={c} />
											<rect x={6} y={-13} width={16} height={3} fill={c} />
										</g>
									)),
								)}
								<T x={x} y={top - 50} size={72} family="latin" weight={600} tone={tone}>
									{Math.round((v * shown) / rowsAll)}
								</T>
								<T x={x} y={830} size={30} weight={700} tone={tone}>
									{label}
								</T>
							</g>
						);
					})}
					{/* where 1550 came from: the London reports pile in beside it, then clear for the answer */}
					{([
						['AGENT REPORT', '≈ 1000?', -5],
						['P.O.W. INTERVIEW', '≈ 1800?', 4],
						['AERIAL RECON', '≈ 1200?', -2],
					] as [string, string, number][]).map(([head, guess, r], k) => {
						const t = snap(cue(2) + 46 + k * 16);
						if (f < t || f > cue(3) + 4) return null;
						const inP = spring({frame: f - t, fps, config: {damping: 11, stiffness: 150}});
						const outP = prog(f, cue(3) - 8, 12, ease.in);
						return (
							<g key={head} transform={`translate(${1000 + k * 250 + (1 - inP) * 500},${450 - 380 * outP})`} opacity={Math.min(1, inP * 2) * (1 - outP)}>
								<Paper x={0} y={0} w={220} h={150} r={r}>
									<text x={-92} y={-38} style={{fontFamily: 'monospace', fontSize: 17, fontWeight: 700, fill: P.ink, letterSpacing: '0.06em'}}>
										{head}
									</text>
									<rect x={-92} y={-24} width={170} height={3} fill={P.ink} opacity={0.3} />
									<Hand x={0} y={44} size={44} tone={P.redDeep}>
										{guess}
									</Hand>
								</Paper>
							</g>
						);
					})}
					{f >= stampAt ? (
						<g transform={`translate(600,560) rotate(-12) scale(${2.4 - 1.4 * stamp})`} opacity={Math.min(1, stamp * 1.6)}>
							<rect x={-110} y={-110} width={220} height={220} rx={22} fill="rgba(20,4,4,0.35)" stroke={P.red} strokeWidth={10} />
							<text y={58} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 168, fill: P.red}}>
								错
							</text>
						</g>
					) : null}
					<Impact f={f} t={stampAt} x={600} y={560} size={0.4} color="#ffb4a8" seed="stamp" />
					{f >= cue(4) + 30 ? (
						<g opacity={prog(f, cue(4) + 30, 20)}>
							<path d={`M${960 + 90},${780 - (327 / 1550) * 500 - 70} C1120,${560} 1220,${560} ${1320 - 90},${780 - (342 / 1550) * 500 - 70}`} fill="none" stroke={color.gold} strokeWidth={2.5} strokeDasharray="6 6" />
							<T x={1140} y={520} size={30} weight={700} tone="gold">
								只差 4%
							</T>
						</g>
					) : null}
				</g>
			</g>
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 7. Panther road wheels

/** A road wheel as a prop: rubber tyre, steel disc, bolt ring, hub. */
const RoadWheel: React.FC<{r: number; spin?: number; chalk?: number}> = ({r, spin = 0, chalk = 0}) => (
	<g transform={`rotate(${spin})`}>
		<circle r={r} fill="#1b1b19" />
		<circle r={r * 0.84} fill="#6d6040" />
		<circle r={r * 0.84} fill="url(#rivets)" opacity={0.35} />
		<circle r={r * 0.34} fill="#2a2924" />
		{Array.from({length: 8}, (_, i) => (
			<circle key={i} cx={Math.cos((i * Math.PI) / 4) * r * 0.48} cy={Math.sin((i * Math.PI) / 4) * r * 0.48} r={r * 0.06} fill="#22211d" />
		))}
		<circle r={r * 0.12} fill="#11110f" />
		{chalk > 0 ? <path d={`M${-r * 0.5},${-r * 0.05} l${r * 0.25},${r * 0.28} l${r * 0.6},${-r * 0.62}`} fill="none" stroke="#f3eee2" strokeWidth={Math.max(2, r * 0.09)} strokeLinecap="round" strokeDasharray={r * 2} strokeDashoffset={r * 2 * (1 - chalk)} opacity={0.9} /> : null}
	</g>
);

const MOULDS = ['M 23', 'M 41', 'M 17', 'M 36'];

const PantherScene: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const scene = useScene();
	const snap = useSnapBeat();
	const hits = useHitFrames(0.5);
	const end = scene.duration;

	// shot B (close-ups) cut on the heavy kicks after the second line starts; shot C follows the last one
	// four quick close-ups, each cut on a heavy kick (or a beat when no kick is near): ~3.5 s in all
	const closeAt: number[] = [];
	for (let k = 0; k < 4; k++) {
		const want = (closeAt[k - 1] ?? cue(1) - 26) + 26;
		const kick = hits.find((h) => h >= want - 3 && h <= want + 8);
		closeAt.push(kick ?? snap(want));
	}
	const wideAt = closeAt[3] + 26;

	// ---- shot A: the crew strip the wheels off a knocked-out Panther, one per two beats
	if (f < closeAt[0]) {
		const tank = {x: 640, y: 905, s: 0.86};
		const xs = [260, 180, 100, 20];
		const pops = xs.map((_, k) => snap(14 + k * 31));
		const missing = pops.filter((t) => f >= t).length;
		const k = Math.min(3, pops.findIndex((t) => f < t) === -1 ? 3 : pops.findIndex((t) => f < t));
		const wx = (i: number) => tank.x + xs[i] * tank.s;
		const wy = tank.y - 40 * tank.s;
		const target = wx(k);
		// the mechanic walks from the last wheel to the next one between pops
		const walkFrom = k === 0 ? -1 : pops[k - 1] + 6;
		const walkTo = pops[k] - 8;
		const mx = k === 0 || walkTo <= walkFrom ? target + 46 : interpolate(f, [walkFrom, walkTo], [wx(k - 1) + 46, target + 46], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
		const walking = f > (pops[k - 1] ?? 0) + 6 && f < pops[k] - 8 && k > 0;
		const grab = prog(f, pops[k] - 8, 6);
		const cam = camMix(lookAt(860, 800, 2.1), lookAt(940, 810, 1.85), prog(f, 0, closeAt[0], ease.inOut));
		return (
			<FullFrame fadeIn={8} enter={16} fadeOut={1}>
				<Battlefield frame={f + 500} cam={cam} fires={0}>
					<g transform={`translate(${tank.x}, ${tank.y}) scale(${tank.s})`}>
						<Panther missing={missing} />
					</g>
					{/* a work lamp on a crate */}
					<g transform="translate(1080, 905)">
						<rect x={-26} y={-40} width={52} height={40} fill="#3b2c1c" />
						<circle cy={-52} r={10} fill="#ffe2a0" />
						<circle cy={-52} r={160} fill="url(#glow-lamp)" opacity={0.55} />
					</g>
					{/* wheels that came off roll out into the row */}
					{xs.map((x, i) => {
						const t = pops[i];
						if (f < t) return null;
						const out = spring({frame: f - t, fps, config: {damping: 9, stiffness: 170}});
						const roll = prog(f, t + 6, 34, ease.out);
						const ex = 1180 + i * 64;
						const x0 = wx(i) + 26 * out;
						const xNow = x0 + (ex - x0) * roll;
						const r = 33 * tank.s;
						return (
							<g key={x} transform={`translate(${xNow},${wy + 6 * out})`}>
								<RoadWheel r={r} spin={((xNow - wx(i)) / r) * (180 / Math.PI)} />
							</g>
						);
					})}
					<g transform={`translate(${mx}, 905) scale(0.42)`}>
						<Figure
							look={CAST.mechanic}
							pose={walking ? walkPose(f * 0.32, 0.7) : lerpPose(POSES.stand, POSES.hold, grab)}
							reach={!walking && grab > 0.2 ? {near: [100, -150 + 20 * Math.max(0, 1 - (f - pops[k]) / 6)]} : undefined}
							flip
							expression={grab > 0.5 ? 'stern' : 'neutral'}
							rim="warm"
							blink={blinkAt(f, 'me')}
						/>
					</g>
					<g transform="translate(1520, 905) scale(0.42)">
						<Figure look={CAST.soldier} pose={lerpPose(POSES.stand, POSES.point, prog(f, pops[1], 12))} flip rim="moon" blink={blinkAt(f, 'so2')} />
					</g>
				</Battlefield>
			</FullFrame>
		);
	}

	// ---- shot B: four close-ups, one per heavy kick; a torch finds the mould number, chalk rings it
	if (f < wideAt) {
		const i = closeAt.filter((t) => f >= t).length - 1;
		const g = f - closeAt[i];
		const len = (closeAt[i + 1] ?? wideAt) - closeAt[i];
		const sweep = interpolate(g, [0, len * 0.7], [-0.6, 0.5], {extrapolateRight: 'clamp', easing: ease.out});
		const lit = Math.max(0, 1 - Math.abs(sweep - 0) * 2.2);
		const ring = prog(g, len * 0.45, 10, ease.out);
		const tilt = [-8, 6, -3, 9][i];
		return (
			<FullFrame fadeIn={1} fadeOut={1}>
				<rect width={W} height={H} fill="#0d0c0a" />
				<g transform={`translate(1080,520) rotate(${tilt}) scale(${1.02 + 0.02 * prog(g, 0, len)})`}>
					<RoadWheel r={430} />
					{/* the cast number on the disc, raised metal: shadow + highlight */}
					<g transform="translate(-150,-170)">
						<text textAnchor="middle" x={4} y={6} style={{fontFamily: 'monospace', fontWeight: 700, fontSize: 120, fill: '#2a2418'}}>
							{MOULDS[i]}
						</text>
						<text textAnchor="middle" style={{fontFamily: 'monospace', fontWeight: 700, fontSize: 120, fill: '#a8955f'}} opacity={0.25 + 0.75 * lit}>
							{MOULDS[i]}
						</text>
						<ellipse cx={0} cy={-40} rx={210} ry={110} fill="none" stroke="#f3eee2" strokeWidth={9} strokeDasharray={1100} strokeDashoffset={1100 * (1 - ring)} strokeLinecap="round" opacity={0.85} transform="rotate(-6)" />
					</g>
				</g>
				{/* torch pool sweeping across */}
				<ellipse cx={1080 - 150 + sweep * 900} cy={360} rx={360} ry={260} fill="url(#glow-lamp)" opacity={0.85} style={{mixBlendMode: 'screen'}} />
				<rect width={W} height={H} fill="url(#vignette-hard)" opacity={0.75} />
				<T x={300} y={170} size={30} family="sans" tone="dim" track={0.2}>
					{`负重轮 ${i + 1} / 64`}
				</T>
				<rect width={W} height={H} fill="#fff4dc" opacity={0.35 * Math.exp(-g / 2.5)} />
			</FullFrame>
		);
	}

	// ---- shot C: all 64 laid out in rows, ticked off; the estimate lands and holds
	const g = f - wideAt;
	const rows = [
		{y: 880, r: 28, x0: 700, dx: 70},
		{y: 834, r: 24, x0: 745, dx: 62},
		{y: 796, r: 21, x0: 785, dx: 55},
		{y: 764, r: 18, x0: 820, dx: 49},
	];
	const wheels = rows.flatMap((row, ri) => Array.from({length: 16}, (_, i) => ({x: row.x0 + i * row.dx, y: row.y, r: row.r, col: i, idx: ri * 16 + i}))).reverse();
	// the analyst walks the front row with chalk; each column is ticked as he passes it
	const walkEnd = Math.max(60, Math.min(100, cue(2) - wideAt - 60));
	const ax = interpolate(g, [6, walkEnd], [640, 700 + 15 * 70 + 50], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const strolling = g > 6 && g < walkEnd;
	// "约270辆" lands on the beat nearest the end of the second line, after the count has run
	const estAt = Math.min(cue(2) - 24, Math.max(snap(cue(1) + 195), wideAt + walkEnd + 8));
	const estLand = spring({frame: f - estAt, fps, config: {damping: 11, stiffness: 160}});
	const rec = spring({frame: f - cue(2), fps, config: {damping: 11, stiffness: 160}});
	// the match cut out: dive into one front-row hub, which becomes the phone's home button
	const hub = {x: 700 + 9 * 70, y: 880 - 28};
	const dive = prog(f, end - 16, 16, ease.in);
	const diveZ = Math.pow(30, dive);
	return (
		<FullFrame fadeIn={1} fadeOut={1}>
			<g transform={`translate(${hub.x},${hub.y}) scale(${diveZ}) translate(${-hub.x},${-hub.y})`}>
				<Battlefield frame={f + 700} cam={lookAt(960, 540, 1)} fires={0}>
					<g transform="translate(250, 905) scale(0.62)">
						<Panther missing={8} />
					</g>
					{wheels.map((w) => {
						const passAt = 6 + ((w.x - 640) / (700 + 15 * 70 + 50 - 640)) * (walkEnd - 6);
						const tick = prog(g, passAt, 6, ease.out);
						return (
							<g key={w.idx} transform={`translate(${w.x},${w.y - w.r})`}>
								<RoadWheel r={w.r} chalk={tick} />
							</g>
						);
					})}
					<circle cx={1300} cy={860} r={420} fill="url(#glow-lamp)" opacity={0.3} />
					<g transform={`translate(${ax}, 935) scale(0.46)`}>
						<Figure look={CAST.analyst} pose={strolling ? walkPose(g * 0.34, 0.75) : lerpPose(POSES.stand, POSES.write, prog(g, walkEnd, 12))} expression={rec > 0.5 ? 'thinking' : 'neutral'} rim="warm" blink={blinkAt(f, 'an2')} />
					</g>

				</Battlefield>
				{/* the numbers: they land once and stay still */}
				<g transform="translate(1250,260)">
					<T x={0} y={-58} size={28} family="sans" tone="dim" track={0.2} opacity={prog(f, estAt - 10, 10)}>
						1944 年 2 月 · 编号估算
					</T>
					<g transform={`scale(${f >= estAt ? 1 + 0.35 * (1 - estLand) : 0})`}>
						<T x={0} y={20} size={104} family="latin" weight={600} tone="gold">
							≈270
						</T>
					</g>
					<T x={320} y={-58} size={28} family="sans" tone="dim" track={0.2} opacity={prog(f, cue(2) - 4, 10)}>
						德国档案
					</T>
					<g transform={`translate(320,0) scale(${f >= cue(2) ? 1 + 0.35 * (1 - rec) : 0})`}>
						<T x={0} y={20} size={104} family="latin" weight={600} tone="text">
							276
						</T>
					</g>
				</g>
				<Impact f={f} t={estAt} x={1250} y={280} size={0.35} seed="270" />
			</g>
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 8. 2008, phones; the name

const IPhone: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const name = prog(f, cue(2) - 6, 30, ease.inOut);
	const open = prog(f, 0, 20, ease.out);
	// the feed steps up one row at a time (and holds), like a real feed, instead of crawling
	const rowT = (f - cue(0) - 10) / 27;
	const feedStep = Math.max(0, Math.floor(rowT) - 2 + prog((rowT % 1) * 27, 0, 9, ease.out));
	const openZ = Math.pow(26, 1 - open);
	const posts = Array.from({length: 60}, (_, i) => ({
		x: 1080 + (i % 3) * 270,
		y: 230 + Math.floor(i / 3) * 170,
		at: cue(0) + 10 + i * 9,
		sn: `SN ${8 + (i % 2)}${Math.floor(10000 + random(`sn${i}`) * 89999)}…`,
	}));
	return (
		<FullFrame fadeIn={1} fadeOut={10} exit={14}>
			<rect width={W} height={H} fill="#06080e" />
			<g opacity={1 - name} transform={`translate(560,782) scale(${openZ}) translate(-560,-782)`}>
				{/* an iPhone 3G-era phone */}
				<g transform="translate(560,520)">
					<rect x={-150} y={-300} width={300} height={600} rx={46} fill="#14161b" stroke="#3a3e46" strokeWidth={4} />
					<rect x={-128} y={-240} width={256} height={460} rx={8} fill="#0f1e33" />
					<rect x={-128} y={-240} width={256} height={460} rx={8} fill="url(#glow-lamp)" opacity={0.25} />
					<circle cy={262} r={20} fill="none" stroke="#3a3e46" strokeWidth={3} />
					<text y={-180} textAnchor="middle" style={{fontFamily: 'monospace', fontSize: 20, fill: '#9cc0ee'}}>
						Settings › About
					</text>
					<text y={-40} textAnchor="middle" style={{fontFamily: 'monospace', fontSize: 22, fill: '#9cc0ee'}}>
						Serial Number
					</text>
					<text y={0} textAnchor="middle" style={{fontFamily: 'monospace', fontWeight: 700, fontSize: 26, fill: color.gold}}>
						{'88218…'}
					</text>
				</g>
				<defs>
					<clipPath id="feed">
						<rect x={940} y={150} width={820} height={560} />
					</clipPath>
				</defs>
				<T x={1350} y={110} size={30} family="sans" tone="dim" track={0.15} opacity={prog(f, cue(0) + 10, 20)}>
					{`已收集序列号 ${posts.filter((p) => f >= p.at).length}`}
				</T>
				<g clipPath="url(#feed)">
				<g transform={`translate(0,${-170 * feedStep})`}>
				{posts.map((p, i) => {
					const s = spring({frame: f - p.at, fps, config: {damping: 12}});
					if (f < p.at) return null;
					return (
						<g key={i} transform={`translate(${p.x},${p.y + (1 - s) * 40})`} opacity={Math.min(1, s)}>
							<rect x={-120} y={-56} width={240} height={112} rx={12} fill="#141a26" stroke="#2c3546" />
							<circle cx={-90} cy={-26} r={14} fill="#2c3546" />
							<rect x={-66} y={-34} width={90} height={10} rx={5} fill="#2c3546" />
							<text x={-100} y={22} style={{fontFamily: 'monospace', fontSize: 20, fill: '#d9e2f0'}}>
								{p.sn}
							</text>
						</g>
					);
				})}
				</g>
				</g>
				<g opacity={prog(f, cue(1), 20)} transform="translate(1350,830)">
					<T y={0} size={110} weight={900} tone="gold" filter="url(#glow-gold)">
						{`≈${countUp(f, 919, cue(1), 40)}万部`}
					</T>
				</g>
			</g>
			{/* the name of the thing */}
			<g opacity={name}>
				<g transform={`translate(${interpolate(f, [cue(2) - 6, cue(2) + 240], [700, 1220], {extrapolateRight: 'clamp'})},330) scale(0.42)`}>
					<Panzer travel={f * 3} />
				</g>
				<ellipse cx={interpolate(f, [cue(2) + 10, cue(2) + 70], [300, 1620], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.inOut})} cy={520} rx={200} ry={90} fill="url(#glow-lamp)" opacity={0.5 * prog(f, cue(2) + 10, 10) * (1 - prog(f, cue(2) + 60, 10))} />
				<T x={960} y={520} size={140} weight={900} tone="gold" filter="url(#glow-gold)" track={0.08}>
					德国坦克问题
				</T>
				<T x={960} y={620} size={40} family="latin" weight={600} tone="dim" track={0.4}>
					THE GERMAN TANK PROBLEM
				</T>
				<T x={960} y={710} size={46} family="latinItalic" tone="gold">
					N ≈ m + m / k − 1
				</T>
			</g>
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 9. callback + end card

const Callback: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const scene = useScene();
	const cue = useCue();
	const pull = prog(f, 0, cue(1) + 40, ease.inOut);
	const cam: Cam = camMix(lookAt(1250, 780, 2.4), lookAt(960, 560, 1.0), pull);
	const endAt = cue(2) - 6;
	const dots = Math.floor(prog(f, cue(1), 90) * 22);
	return (
		<FullFrame
			fadeIn={10}
			enter={20}
			fadeOut={1}
			scrim={0.6}
			overlay={
				<Sequence from={endAt} layout="none">
					<EndCard v={EPISODE} cfg={BRAND} dur={scene.duration - endAt} />
				</Sequence>
			}
		>
			<Battlefield frame={f + 800} cam={cam}>
				<g transform="translate(980, 880) scale(0.9)">
					<Panzer wreck plateGlow={0.9} />
					<g transform="translate(-80,-230)">
						<Smoke frame={f + 400} seed="cb" height={560} wind={0.6} tone="#23252d" />
					</g>
				</g>
				{/* every wreck on the horizon is a number someone wrote down */}
				{Array.from({length: dots}, (_, i) => (
					<g key={i} transform={`translate(${120 + random(`dx${i}`) * 1700},${745 + random(`dy${i}`) * 30})`}>
						<circle r={18} fill="url(#glow-lamp)" opacity={0.7} />
						<circle r={2.5} fill="#ffe7b0" />
					</g>
				))}
			</Battlefield>
		</FullFrame>
	);
};


export const scenes: SceneMap = {Hook, London, Serials, Jar: JarScene, Gaps, Formula, Panther: PantherScene, IPhone, Callback};
