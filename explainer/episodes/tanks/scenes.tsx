import React from 'react';
import {Sequence, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CAST} from '../../src/art/cast';
import {Figure, POSES, blinkAt, lerpPose, walkPose} from '../../src/art/Figure';
import {Embers, Smoke, Torch} from '../../src/art/fx';
import {P} from '../../src/art/palette';
import {lookAt, type Cam} from '../../src/art/sets/Airfield';
import {Battlefield} from '../../src/art/sets/Battlefield';
import {LondonOffice} from '../../src/art/sets/LondonOffice';
import {Jar, Panther, Panzer, SerialPlate} from '../../src/art/Tank';
import {EndCard, TitleCard, type BrandCfg, type VideoCfg} from '../../src/brand/Brand';
import {FullFrame, camMix} from '../../src/components/FullFrame';
import {T, countUp} from '../../src/components/Stage';
import {ease, prog, useBeat, useCue, useScene} from '../../src/lib/context';
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
	sources: '参考 · Ruggles & Brodie, JASA (1947) · 豹式负重轮与 iPhone 案例见同类文献转述',
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
	const point = spring({frame: f - cue(1) + 4, fps, config: {damping: 12}});
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
					pins={prog(f, cue(1), 40)}
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
						const jitter = f > cue(1) + 40 ? Math.sin(f / 3 + i) * 1.5 : 0;
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
			<FullFrame fadeIn={12} fadeOut={8}>
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
	// the ledger: every captured tank adds a line
	const g = f - ledgerAt;
	const rows = 14;
	const shown = Math.min(rows * 2, Math.floor((g / Math.max(1, sceneLen - ledgerAt - 20)) * rows * 2));
	const glow = prog(f, cue(3), 40);
	return (
		<FullFrame fadeIn={8}>
			<rect width={W} height={H} fill="#120d09" />
			<ellipse cx={960} cy={180} rx={900} ry={520} fill="url(#glow-lamp)" opacity={0.5} />
			<g transform={`translate(960,470) rotate(-3) scale(${1 + 0.04 * prog(g, 0, 200)})`}>
				<Paper x={0} y={0} w={1180} h={720}>
					<text x={-540} y={-300} style={{fontFamily: 'monospace', fontWeight: 700, fontSize: 24, fill: P.ink, letterSpacing: '0.12em'}}>
						CAPTURED EQUIPMENT · SERIAL LOG · 1943
					</text>
					{['Fgst.Nr.', 'Motor', 'Getriebe'].map((h, i) => (
						<text key={h} x={-500 + i * 360} y={-240} style={{fontFamily: 'monospace', fontSize: 22, fill: P.ink, opacity: 0.7}}>
							{h}
						</text>
					))}
					<line x1={-540} y1={-226} x2={540} y2={-226} stroke={P.ink} strokeOpacity={0.4} />
					{Array.from({length: shown}, (_, i) => {
						const r = i % rows;
						const col = Math.floor(i / rows);
						const base = 82600 + Math.floor(random(`lg${i}`) * 560);
						return (
							<g key={i}>
								<Hand x={-500 + col * 560} y={-190 + r * 34} size={24} anchor="start" tone={glow > 0 && random(`gl${i}`) < glow ? '#9a6a12' : P.ink}>
									{`${base}   ·   ${40000 + Math.floor(random(`m${i}`) * 9000)}   ·   ${7000 + Math.floor(random(`t${i}`) * 900)}`}
								</Hand>
							</g>
						);
					})}
				</Paper>
			</g>
			<T x={960} y={520} size={420} family="latin" weight={600} tone="gold" opacity={0.18 * glow}>
				?
			</T>
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
		x: -160 + (i % 6) * 62 + (Math.floor(i / 6) % 2) * 30 + Math.sin(f / 20 + i) * (1.5 + 2.5 * rolling),
		y: 60 - Math.floor(i / 6) * 54 + Math.cos(f / 7 + i * 1.7) * 2.5 * rolling,
	}));
	const pop = spring({frame: f - askAt, fps, config: {damping: 12}});
	const land = f >= settle ? Math.exp(-(f - settle) / 5) : 0;
	const fillGap = Math.max(2, (cue(1) - 30) / others.length);
	const filled = others
		.map((b, i) => ({...b, t: 8 + i * fillGap}))
		.filter((b) => f >= b.t)
		.map(({t, ...b}) => ({...b, out: 1 - spring({frame: f - t, fps, config: {damping: 14, stiffness: 140}}), lit: 0}));
	const lean = prog(f, settle, 70, ease.inOut);
	return (
		<FullFrame fadeIn={14}>
			<g transform={`translate(1370,520) scale(${1 + 0.08 * lean}) translate(-1370,-520)`}>
			<rect width={W} height={H} fill="#07080c" />
			<polygon points={`${jx - 90},-40 ${jx + 90},-40 ${jx + 360},${H} ${jx - 360},${H}`} fill="url(#beam-warm)" opacity={0.55} />
			<ellipse cx={jx} cy={790} rx={330} ry={44} fill="#000" opacity={0.6} />
			<g transform={`translate(${jx},${jy}) scale(1.05)`} opacity={prog(f, 0, 24)}>
				<Jar balls={filled} />
			</g>
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
				return (
					<g key={n} transform={`translate(${sx + (ex - sx) * p},${sy + (ey - sy) * p + arc}) scale(${1 + 0.5 * Math.min(1, p) + 0.15 * hot})`}>
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
	// where does the jar really end? a ghost marker searching beyond 60 until the extra gap settles it
	const ghostX = 70 + 8 * Math.sin(f / 16) + 3 * Math.sin(f / 7);
	const ghost = prog(f, cue(0) + 10, 20) * (1 - extra);
	const scan = Math.floor(f / 14) % 4;
	const real: [number, number][] = [
		[0, 19],
		[19, 40],
		[40, 42],
		[42, 60],
	];
	return (
		<FullFrame fadeIn={12} fadeOut={6}>
			<rect width={W} height={H} fill="#090b12" />
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
			<T x={(px(60) + px(80)) / 2} y={y - 70} size={52} family="latin" weight={600} tone="gold" opacity={(0.4 + 0.4 * Math.sin(f / 8)) * (1 - extra)}>
				?
			</T>
			{/* the unseen last ball, somewhere past 60 */}
			<g opacity={ghost}>
				<line x1={px(60)} y1={y} x2={px(ghostX)} y2={y} stroke={color.gold} strokeWidth={3} strokeDasharray="4 8" opacity={0.6} />
				<circle cx={px(ghostX)} cy={y - 40} r={22} fill="none" stroke={color.gold} strokeWidth={2.5} strokeDasharray="5 5" opacity={0.7} />
				<circle cx={px(ghostX)} cy={y - 40} r={30} fill="url(#glow-lamp)" opacity={0.35} />
			</g>
			{/* picks drop in */}
			{PICKS.map((n, i) => {
				const p = spring({frame: f - 6 - i * 6, fps, config: {damping: 10}});
				return (
					<g key={n} transform={`translate(${px(n)},${y - 40 - (1 - p) * 300 + 3 * Math.sin(f / 11 + i * 1.3)})`}>
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
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 6. the formula, then the real numbers (the drop)

const Formula: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const toks = ['60', '+', '60 ÷ 4', '−', '1', '≈', '74'];
	const toChart = prog(f, cue(2) - 10, 24, ease.inOut);
	const bars: [string, number, string, number][] = [
		['情报部门估计', 1550, P.red, cue(2)],
		['编号统计', 327, color.gold, cue(3)],
		['德国档案', 342, P.paper, cue(4)],
	];
	const flash = Math.exp(-f / 7);
	const focusX = interpolate(f, [cue(2), cue(3) - 10, cue(3) + 10, cue(4) - 10, cue(4) + 10], [600, 600, 960, 960, 1140], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.inOut});
	const chartZoom = 1 + 0.05 * prog(f, cue(2), 60, ease.inOut) + 0.05 * prog(f, cue(3), 60, ease.inOut) + 0.04 * prog(f, cue(4), 60, ease.inOut);
	const chartCam = `translate(960,540) scale(${chartZoom}) translate(${-960 - (focusX - 960) * 0.35},-540)`;
	const shake = Math.exp(-Math.max(0, f - 2) / 4) * 10 * (f >= 2 ? 1 : 0);
	return (
		<FullFrame fadeIn={2}>
			<rect width={W} height={H} fill="#07080c" />
			<ellipse cx={960} cy={500} rx={900} ry={420} fill="url(#glow-lamp)" opacity={0.25 + 0.4 * flash} />
			<g transform={`translate(${shake * (random(`fx${f}`) - 0.5)},${shake * (random(`fy${f}`) - 0.5)})`}>
				{/* the jar sum, token by token on the beat */}
				<g opacity={1 - toChart} transform={`translate(0,${-260 * prog(f, cue(1), 30, ease.inOut)}) translate(960,430) scale(${1 + 0.07 * prog(f, 40, cue(1) - 40, ease.inOut)}) translate(-960,-430)`}>
					{toks.map((t, i) => {
						const p = spring({frame: f - 4 - i * 7, fps, config: {damping: 10, stiffness: 160}});
						const x = 960 + (i - 3) * 190 + (i === 2 ? 0 : 0);
							const hero = i === 6;
							const wave = f > 60 ? 0.05 * Math.exp(-(((f / 5) % 14 - i) ** 2)) : 0;
							return (
								<g key={i} transform={`translate(${x},430) scale(${(hero ? 1.4 * p : p) * (1 + wave)})`} opacity={Math.min(1, p)}>
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
										<g opacity={p} transform={`translate(${12 * Math.sin(f / 30 + i)},0) scale(${0.28 * p})`}>
											<Panzer travel={f * 3} />
									</g>
									<text y={70} textAnchor="middle" opacity={p} style={{fontFamily: 'monospace', fontWeight: 700, fontSize: 24, fill: color.gold}}>
										{`Nr. ${82000 + n * 11}`}
									</text>
								</g>
							);
						})}
					</g>
				) : null}
				{/* August 1942: three bars; the camera leans toward whichever bar the line is about */}
				<g opacity={toChart} transform={chartCam}>
					<T x={960} y={170} size={30} family="sans" tone="dim" track={0.3}>
						1942 年 8 月 · 德国坦克月产量
					</T>
					{/* the factories never stop: a faint line of tanks rolling past behind the bars */}
					<g opacity={0.16}>
						{Array.from({length: 9}, (_, k) => (
							<g key={k} transform={`translate(${((k * 260 + f * 2.2) % 2340) - 210},330) scale(0.16)`}>
								<Panzer travel={f * 3} />
							</g>
						))}
					</g>
					{bars.map(([label, v, c, at], i) => {
						const p = prog(f, at, 34, ease.out);
						const h = (v / 1550) * 500 * p;
						const x = 600 + i * 360;
						return (
							<g key={label} opacity={prog(f, at - 4, 10)}>
								<rect x={x - 80} y={780 - h} width={160} height={h} rx={6} fill={c} opacity={0.88} />
								<T x={x} y={760 - h - 30} size={72} family="latin" weight={600} tone={i === 0 ? 'red' : i === 1 ? 'gold' : 'text'}>
									{countUp(f, v, at, 34)}
								</T>
								<T x={x} y={830} size={30} weight={700} tone={i === 0 ? 'red' : i === 1 ? 'gold' : 'text'}>
									{label}
								</T>
							</g>
						);
					})}
					{f >= cue(3) + 20 ? (
						// the intelligence guess, struck out once the serials answer
						<line x1={520} y1={300} x2={520 + 160 * prog(f, cue(3) + 20, 14, ease.out)} y2={300 + 480 * prog(f, cue(3) + 20, 14, ease.out)} stroke="#fff4dc" strokeWidth={8} strokeLinecap="round" opacity={0.85} />
					) : null}
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

const PantherScene: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const pan = prog(f, cue(1) - 20, 50, ease.inOut);
	const cam = camMix(lookAt(860, 700, 1.25), lookAt(1080, 560, 1.0), pan);
	const wheelsOut = Math.min(64, Math.max(0, Math.floor((f - 20) / 2.4)));
	const est = prog(f, cue(1) + 30, 40, ease.out);
	const rec = prog(f, cue(2), 24, ease.out);
	const reading = Math.floor(Math.max(0, f - cue(1) - 60) / 3) % 64;
	return (
		<FullFrame fadeIn={12}>
			<Battlefield frame={f + 500} cam={cam} fires={0}>
				<g transform="translate(700, 900) scale(0.82)">
					<Panther wheelGlow={0.6} />
				</g>
				<g transform="translate(330, 905) scale(0.4)">
					<Figure look={CAST.mechanic} pose={lerpPose(POSES.hold, POSES.stand, 0.25 + 0.25 * Math.sin(f / 18))} reach={{near: [140 + 24 * Math.sin(f / 18), -120 + 30 * Math.cos(f / 18)]}} expression="neutral" rim="warm" blink={blinkAt(f, 'me')} />
				</g>
				<g transform="translate(1080, 760)">
					<circle r={220} fill="url(#glow-lamp)" opacity={0.45} />
				</g>
			</Battlefield>
			{/* 64 wheels, laid out as evidence */}
			<g transform="translate(1180,250)">
				{Array.from({length: wheelsOut}, (_, i) => {
					const c = i % 8;
					const r = Math.floor(i / 8);
					const lit = prog(f, cue(1) + i * 0.8, 10);
					return (
						<g key={i} transform={`translate(${c * 74},${r * 74})`}>
							<circle r={30} fill="#1d1d1b" />
							<circle r={24} fill="#7a6a40" />
							<circle r={9} fill="#22221f" />
							{lit > 0 ? (
								<text y={-34} textAnchor="middle" opacity={lit} style={{fontFamily: 'monospace', fontSize: 14, fontWeight: 700, fill: color.gold}}>
									{`M${10 + Math.floor(random(`w${i}`) * 40)}`}
								</text>
							) : null}
						</g>
					);
				})}
				{f > cue(1) + 60 ? (
					// reading the mould numbers, wheel by wheel
					<circle cx={(reading % 8) * 74} cy={Math.floor(reading / 8) * 74} r={36} fill="none" stroke={color.gold} strokeWidth={3} opacity={0.9} />
				) : null}
				<T x={258} y={-60} size={34} weight={700} tone="gold" opacity={prog(f, 20, 20)}>
					{`${wheelsOut} 个负重轮`}
				</T>
			</g>
			<g opacity={est} transform="translate(520,300)">
				<T x={-160} y={-40} size={28} family="sans" tone="dim" track={0.2}>
					1944 年 2 月 · 估算
				</T>
				<T x={-160} y={40} size={96} family="latin" weight={600} tone="gold">
					{`≈${countUp(f, 270, cue(1) + 30, 40)}`}
				</T>
				<g opacity={rec}>
					<T x={160} y={-40} size={28} family="sans" tone="dim" track={0.2}>
						德国档案
					</T>
					<T x={160} y={40} size={96} family="latin" weight={600} tone="text">
						276
					</T>
				</g>
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
	const posts = Array.from({length: 60}, (_, i) => ({
		x: 1080 + (i % 3) * 270,
		y: 230 + Math.floor(i / 3) * 170,
		at: cue(0) + 10 + i * 9,
		sn: `SN ${8 + (i % 2)}${Math.floor(10000 + random(`sn${i}`) * 89999)}…`,
	}));
	return (
		<FullFrame fadeIn={12}>
			<rect width={W} height={H} fill="#06080e" />
			<g opacity={1 - name}>
				{/* a generic 2008 smartphone */}
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
						{`8${Math.floor(1000 + (f % 9000))}…`}
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
				<g transform={`translate(0,${-170 * Math.max(0, (f - cue(0) - 10) / 27 - 2.4)})`}>
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
						{`≈${countUp(f, 910, cue(1), 40)}万部`}
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
			fadeIn={12}
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
