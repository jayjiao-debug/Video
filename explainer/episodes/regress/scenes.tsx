import React from 'react';
import {AbsoluteFill, Sequence, random, spring, useCurrentFrame} from 'remotion';
import {CAST} from '../../src/art/cast';
import {Figure, POSES, addPose, blinkAt, idle} from '../../src/art/Figure';
import {JET_DEFS, SmokeTrail, TrainerJet} from '../../src/art/Jet';
import {PersonCard} from '../../src/art/PersonCard';
import {camPath, type CamKey} from '../../src/art/camera';
import {P} from '../../src/art/palette';
import {lookAt, type Cam} from '../../src/art/sets/Airfield';
import {AIRBASE_DEFS, Airbase1965, BriefingHut} from '../../src/art/sets/Airbase1965';
import {BRIEFING_DEFS, Briefing1965, FLOOR_Y} from '../../src/art/sets/Briefing1965';
import {CoinMotif, EndCard} from '../../src/brand/Brand';
import {JUNO} from '../../src/brand/identity';
import {FullFrame} from '../../src/components/FullFrame';
import {ease, prog, useCue, useScene, useTimeline} from '../../src/lib/context';
import {font} from '../../src/lib/theme';
import type {SceneMap, SceneProps} from '../../src/lib/types';
import {BEST, COINS, Coin, Desk, GradeBoard, HangarFloor, HeightChart, LUCK_R, Logbook, MEAN_D, REGRESS_DEFS, TGT, TopPerson, WORST, WriteOn, dist, throwerAt, type GradeRow} from './art';
import {BRAND, EPISODE} from './brand';

/**
 * 《夸完就翻车》. A flight school in the Negev at dusk: one cadet is praised and does worse,
 * another is shouted at and does better (the grade board). A coin is tossed (夸 or 骂?) and
 * falls into the title on the track's first big hit. Kahneman's lecture, the instructor's
 * logbook, the coin experiment on the hangar floor, the answer on the drop (aim + luck),
 * the name, Galton's heights, three takeaways, back to the flight line at night.
 */

const W = 1920;
const H = 1080;
const NUM = {fontVariantNumeric: 'lining-nums' as const};

const Defs: React.FC = () => (
	<>
		<JET_DEFS />
		<AIRBASE_DEFS />
		<BRIEFING_DEFS />
		<REGRESS_DEFS />
	</>
);

// ---------------------------------------------------------------- the flight line's blocking (shared so cuts match)

const HUT = {x: 330, y: 900};
const BOARD_AT = {x: 1240, y: 960, s: 0.95};
const INSTR_AT = {x: 1650, y: 935, s: 0.95};
const KAHNEMAN_AT = {x: 1420, y: FLOOR_Y, s: 1.05};

// ---------------------------------------------------------------- jets: a loop, clean or sloppy

type Pass = {f0: number; dur: number; cx: number; cy: number; R: number; wob?: number; seed: string; no: string};
const ENTRY = 0.206;

const passPos = (p: Pass, u: number): [number, number] => {
	const L = p.R * 2.2;
	const w = p.wob ?? 0;
	const ph = random(`${p.seed}ph`) * 6;
	if (u <= ENTRY) {
		const k = u / ENTRY;
		return [p.cx - L * (1 - k), p.cy + p.R + w * 18 * Math.sin(k * 9 + ph)];
	}
	if (u >= 1 - ENTRY) {
		const k = (u - (1 - ENTRY)) / ENTRY;
		return [p.cx + L * k * 1.3, p.cy + p.R + w * (70 * k * k + 16 * Math.sin(k * 11 + ph))];
	}
	const th = ((u - ENTRY) / (1 - 2 * ENTRY)) * Math.PI * 2;
	const r = p.R * (1 + w * (0.24 * Math.sin(2 * th + ph) * Math.sin(th / 2) + 0.05 * Math.sin(9 * th + ph)));
	return [p.cx + r * Math.sin(th), p.cy + r * Math.cos(th)];
};

const Jet: React.FC<{p: Pass; f: number}> = ({p, f}) => {
	const u = (f - p.f0) / p.dur;
	const fade = 1 - prog(f, p.f0 + p.dur, 40);
	if (u < -0.02 || fade <= 0) return null;
	const uu = Math.min(1.25, u);
	const pts: [number, number][] = [];
	const n = 80;
	for (let i = 0; i < n; i++) {
		const q = uu - 0.62 + (0.62 * i) / (n - 1);
		if (q < 0 || q > 1.25) continue;
		pts.push(passPos(p, q));
	}
	const [x, y] = passPos(p, uu);
	const [x0, y0] = passPos(p, uu - 0.004);
	const ang = (Math.atan2(y - y0, x - x0) * 180) / Math.PI;
	const w = p.wob ?? 0;
	const roll = w > 0 ? Math.cos((f - p.f0) / 5 + random(`${p.seed}r`) * 6) : 1;
	const sy = w > 0 ? Math.sign(roll || 1) * Math.max(0.35, Math.abs(roll)) : 1;
	return (
		<g>
			<g opacity={fade}>
				<SmokeTrail points={pts} width={13} opacity={0.75} />
			</g>
			{u <= 1.2 ? (
				<g transform={`translate(${x},${y}) rotate(${ang}) scale(0.4,${0.4 * sy})`}>
					<TrainerJet burn={0.8} no={p.no} />
				</g>
			) : null}
		</g>
	);
};

/** What the instructor says over the radio, at a point in the sky. */
const RadioCall: React.FC<{f: number; at: number; x: number; y: number; text: string; color: string; dur?: number}> = ({f, at, x, y, text, color, dur = 60}) => {
	const k = f - at;
	if (k < 0 || k > dur + 12) return null;
	const pop = spring({frame: k, fps: 30, config: {damping: 11, stiffness: 160}});
	const o = Math.min(1, k / 4) * (1 - prog(k, dur, 12));
	return (
		<g transform={`translate(${x},${y}) scale(${0.7 + 0.3 * pop})`} opacity={o}>
			{[0, 1, 2].map((i) => (
				<path key={i} d={`M${-26 - i * 14},${-22 - i * 10} a${30 + i * 16},${30 + i * 16} 0 0 0 0,${44 + i * 20}`} stroke={color} strokeWidth={3} fill="none" opacity={0.7 - i * 0.18} />
			))}
			<text x={0} y={14} style={{fontFamily: font.serif, fontWeight: 900, fontSize: 52, fill: color, letterSpacing: '0.04em'}}>
				{text}
			</text>
			<text x={4} y={44} style={{fontFamily: font.sans, fontWeight: 500, fontSize: 18, fill: 'rgba(243,237,226,0.6)', letterSpacing: '0.2em'}}>
				教官 · 无线电
			</text>
		</g>
	);
};

/** The grade board's two rows at a given frame (each write lands with its line). */
const boardRows = (f: number, t: {a0: number; n0: number; b0: number; a1: number; n1: number; b1: number}, erase = 0): GradeRow[] => [
	{cadet: '07', a: '92', b: '71', note: '夸', pa: prog(f, t.a0, 16), pn: prog(f, t.n0, 10) * (1 - erase), pb: prog(f, t.b0, 18)},
	{cadet: '12', a: '48', b: '76', note: '骂', pa: prog(f, t.a1, 16), pn: prog(f, t.n1, 10) * (1 - erase), pb: prog(f, t.b1, 18)},
];

// ---------------------------------------------------------------- 1. hook

const Hook: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const D = scene.duration;
	// four passes: a clean loop (praised), a sloppy one (worse); a messy one (shouted at), a clean one (better)
	const passes: Pass[] = [
		{f0: -36, dur: 120, cx: 600, cy: 300, R: 170, seed: 'p1', no: '07'},
		{f0: cue(2) - 18, dur: 92, cx: 700, cy: 290, R: 150, wob: 0.8, seed: 'p2', no: '07'},
		{f0: cue(3) - 16, dur: 104, cx: 560, cy: 310, R: 160, wob: 1.2, seed: 'p3', no: '12'},
		{f0: cue(4) - 22, dur: 96, cx: 660, cy: 300, R: 170, seed: 'p4', no: '12'},
	];
	const rows = boardRows(f, {a0: cue(1) + 34, n0: cue(1) + 62, b0: cue(2) + 22, a1: cue(3) + 40, n1: cue(3) + 72, b1: cue(4) + 24});
	const TOSS = D - 52;
	const keys: CamKey[] = [
		[0, 700, 430, 1.22],
		[cue(1) + 70, 860, 500, 1.06],
		[cue(3), 840, 490, 1.04],
		[cue(4) + 30, 900, 510, 1.05],
		[cue(5) + 14, 1240, 660, 1.62],
		[TOSS, 1250, 650, 1.78],
		[D, 1250, 520, 2.3],
	];
	const cam = camPath(keys, f);
	const A = f; // the flight line's clock starts here
	// the toss: a coin, 夸 on one face and 骂 on the other, flicked up from the board's ledge past the lens
	const k = f - TOSS;
	const up = prog(k, 0, 40, ease.out);
	const black = prog(f, D - 8, 8);
	return (
		<FullFrame
			fadeIn={0}
			fadeOut={0}
			overlay={
				k >= 0 ? (
					<AbsoluteFill>
						<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
							<REGRESS_DEFS />
							<rect width={W} height={H} fill="#05060b" opacity={0.55 * up + black} />
							<Coin x={960 + 40 * Math.sin(k / 9)} y={1180 - 760 * up} h={40 + 260 * up} spin={k * 0.62} r={46 + 60 * up} face="夸" back="骂" gold />
						</svg>
					</AbsoluteFill>
				) : null
			}
		>
			<Defs />
			<Airbase1965
				frame={A}
				cam={cam}
				night={0.1}
				sky={
					<g>
						{passes.map((p, i) => (
							<Jet key={i} p={p} f={f} />
						))}
						<RadioCall f={f} at={cue(1) + 30} x={760} y={140} text="漂亮！" color={P.gold} />
						<RadioCall f={f} at={cue(3) + 32} x={720} y={150} text="你在干什么！" color="#ff7a6e" />
					</g>
				}
			>
				<g transform={`translate(${HUT.x},${HUT.y})`}>
					<BriefingHut />
				</g>
				<g transform={`translate(${BOARD_AT.x},${BOARD_AT.y}) scale(${BOARD_AT.s})`}>
					<GradeBoard rows={rows} />
				</g>
				<g transform={`translate(${INSTR_AT.x},${INSTR_AT.y}) scale(${INSTR_AT.s})`}>
					<Figure look={CAST.instructor} pose={addPose(POSES.stand, idle(A, 'instr'))} flip rim="warm" blink={blinkAt(A, 'instr')} expression={f > cue(3) + 30 && f < cue(4) ? 'stern' : 'neutral'} />
				</g>
			</Airbase1965>
		</FullFrame>
	);
};

// ---------------------------------------------------------------- the title: the coin lands on the chalk target

const CHARS = [...`《${EPISODE.title}》`];
const HALF_BEAT = 0.2545;

const RegressTitle: React.FC<{dur: number; hitAt: number}> = ({dur, hitAt}) => {
	const f = useCurrentFrame();
	const fps = 30;
	const stampAt = (i: number) => hitAt + Math.round(i * HALF_BEAT * fps);
	const lastStamp = stampAt(CHARS.length - 1);
	const goldAt = lastStamp + Math.round(2 * HALF_BEAT * fps);
	const out = prog(f, dur - 14, 14, ease.inOut);
	let shake = 0;
	for (let i = 0; i < CHARS.length; i++) {
		const kk = f - stampAt(i);
		if (kk >= 0 && kk < 6) shake = Math.max(shake, (i === 0 ? 10 : 4) * Math.exp(-kk / 1.6));
	}
	const sx = shake * (random(`tsx${f}`) - 0.5);
	const sy = shake * (random(`tsy${f}`) - 0.5);
	// the coin falls out of the dark, spinning, and lands on the bullseye on the hit
	const fall = Math.min(1, Math.max(0, f / hitAt));
	const cy = -120 + (860 + 120) * fall * fall;
	const settle = f >= hitAt ? f - hitAt : 0;
	const spin = f < hitAt ? f * 0.7 : 0.7 * Math.exp(-settle / 5) * Math.sin(settle * 1.3);
	const bounce = f >= hitAt && settle < 8 ? 26 * Math.sin((Math.PI * settle) / 8) * Math.exp(-settle / 6) : 0;
	const motif = prog(f, hitAt + 10, 30, ease.out);
	const size = 140;
	const width = CHARS.length * size * 0.98;
	const gx = (i: number) => W / 2 - width / 2 + (i + 0.5) * (width / CHARS.length);
	const pour = prog(f, goldAt, 12, ease.inOut);
	const gold = pour;
	const bloom = f >= goldAt ? 0.3 + 0.7 * Math.exp(-(f - goldAt) / 10) : 0;
	const gloss = prog(f, goldAt + 16, 26, ease.inOut);
	const push = 1 + 0.1 * (1 - prog(f, 0, hitAt + 26, ease.out));
	const land = f >= hitAt ? Math.exp(-(f - hitAt) / 7) : 0;
	return (
		<AbsoluteFill style={{opacity: 1 - out}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
				<REGRESS_DEFS />
				<defs>
					<radialGradient id="rt-light" cx="50%" cy="80%" r="70%">
						<stop offset="0" stopColor="#ffcf86" stopOpacity="0.22" />
						<stop offset="0.5" stopColor="#c8913a" stopOpacity="0.05" />
						<stop offset="1" stopColor="#000" stopOpacity="0" />
					</radialGradient>
					<radialGradient id="rt-bloom">
						<stop offset="0" stopColor="#ffe7b0" stopOpacity="0.55" />
						<stop offset="0.45" stopColor="#f1c56d" stopOpacity="0.18" />
						<stop offset="1" stopColor="#f1c56d" stopOpacity="0" />
					</radialGradient>
					<radialGradient id="brand-glow">
						<stop offset="0" stopColor="#ffe7b0" stopOpacity="0.9" />
						<stop offset="0.35" stopColor="#f1c56d" stopOpacity="0.35" />
						<stop offset="1" stopColor="#f1c56d" stopOpacity="0" />
					</radialGradient>
					<linearGradient id="rt-gold" x1="0" y1={470 - size * 0.8} x2="0" y2={470 + size * 0.2} gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#fff3cf" />
						<stop offset="0.45" stopColor="#f3cd7a" />
						<stop offset="0.7" stopColor="#c99140" />
						<stop offset="1" stopColor="#8a5a22" />
					</linearGradient>
					<linearGradient id="rt-gloss" x1={W / 2 - 900 + 1800 * gloss - 140} y1="0" x2={W / 2 - 900 + 1800 * gloss + 140} y2="0" gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#fff" stopOpacity="0" />
						<stop offset="0.5" stopColor="#fff" stopOpacity="0.8" />
						<stop offset="1" stopColor="#fff" stopOpacity="0" />
					</linearGradient>
					<clipPath id="rt-pour">
						<rect x={0} y={470 + 40 - (size + 60) * pour} width={W} height={size + 80} />
					</clipPath>
					<filter id="rt-ink" x="-10%" y="-10%" width="120%" height="120%">
						<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} />
						<feDisplacementMap in="SourceGraphic" scale={3} />
					</filter>
				</defs>
				<rect width={W} height={H} fill={JUNO.colors.night} />
				<rect width={W} height={H} fill="url(#rt-light)" opacity={1 + 1.4 * land} />
				<g transform={`translate(${sx},${sy}) translate(960,540) scale(${push}) translate(-960,-540)`}>
					{/* the chalk target on the floor, seen at a low angle */}
					<g transform="translate(960,880)" filter="url(#chalk)">
						{[50, 110, 170, 230, 290].map((r, i) => (
							<ellipse key={r} rx={r * 2.1} ry={r * 0.42} fill="none" stroke="#e9efe6" strokeWidth={3} opacity={(0.45 - i * 0.07) * (1 + 1.2 * land)} />
						))}
					</g>
					<ellipse cx={960} cy={880} rx={560} ry={160} fill="url(#rt-bloom)" opacity={1.6 * land} />
					<ellipse cx={960} cy={440} rx={640} ry={170} fill="url(#rt-bloom)" opacity={bloom} />
					{/* chalk dust kicked up by the landing */}
					{f >= hitAt && f < hitAt + 40
						? Array.from({length: 30}, (_, i) => {
								const t = f - hitAt;
								const a = random(`cd${i}`) * Math.PI * 2;
								const v = 4 + random(`cv${i}`) * 9;
								return <circle key={i} cx={960 + Math.cos(a) * v * t * 2} cy={878 + Math.sin(a) * v * t * 0.4 - t * 0.6} r={2 + random(`cr${i}`) * 3} fill="#e9efe6" opacity={0.7 * (1 - t / 40)} />;
							})
						: null}
					<g opacity={1 - motif}>
						<Coin x={960} y={Math.min(cy, 860)} h={bounce + (f < hitAt ? 120 * (1 - fall) : 0)} spin={spin} r={64} face="夸" back="骂" gold />
					</g>
					<g transform="translate(960,850) scale(1.3)" opacity={motif}>
						<CoinMotif p={motif} gold={JUNO.colors.gold} />
					</g>
					{CHARS.map((ch, i) => {
						const kk = f - stampAt(i);
						if (kk < 0) return null;
						const press = kk < 3 ? 1.9 - 0.9 * (kk / 3) : kk < 6 ? 1 - 0.04 * Math.sin(((kk - 3) / 3) * Math.PI) : 1;
						return (
							<g key={i} transform={`translate(${gx(i)},470) scale(${press}) translate(${-gx(i)},-470)`}>
								<text x={gx(i)} y={470} textAnchor="middle" filter="url(#rt-ink)" style={{fontFamily: font.serif, fontWeight: 900, fontSize: size, fill: '#8a6534'}} opacity={kk < 1 ? 0.5 : 1 - 0.6 * gold}>
									{ch}
								</text>
								<text x={gx(i)} y={470} textAnchor="middle" clipPath="url(#rt-pour)" style={{fontFamily: font.serif, fontWeight: 900, fontSize: size, fill: 'url(#rt-gold)'}} opacity={gold > 0 ? 1 : 0}>
									{ch}
								</text>
								<text x={gx(i)} y={470} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: size, fill: 'url(#rt-gloss)'}} opacity={gold * (gloss > 0 && gloss < 1 ? 1 : 0)}>
									{ch}
								</text>
								{kk < 16
									? Array.from({length: 14}, (_, j) => {
											const a = random(`sd${i}${j}`) * Math.PI * 2;
											const d = kk * (4 + random(`sv${i}${j}`) * 7) * Math.exp(-kk / 12);
											return <circle key={j} cx={gx(i) + Math.cos(a) * d * 1.7} cy={440 + Math.sin(a) * d * 0.8} r={1.5 + random(`sz${i}${j}`) * 2.5} fill={j % 3 ? '#8a6534' : '#f1c56d'} opacity={0.85 * (1 - kk / 16)} />;
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

// ---------------------------------------------------------------- 2. the flight school → the briefing room

const Kahneman: React.FC<{f: number; talk?: number}> = ({f, talk = 0}) => (
	<g transform={`translate(${KAHNEMAN_AT.x},${KAHNEMAN_AT.y}) scale(${KAHNEMAN_AT.s})`}>
		<Figure look={CAST.kahneman} pose={addPose(POSES.stand, idle(f, 'dk'))} flip rim="warm" blink={blinkAt(f, 'dk')} talk={talk} />
	</g>
);

const BoardText: React.FC<{f: number; at: number}> = ({f, at}) => (
	<g>
		<WriteOn x={400} y={160} text="表扬 > 惩罚" size={100} p={prog(f, at, 30)} anchor="middle" id="bt1" />
		<WriteOn x={400} y={262} text="（学技术时）" size={40} p={prog(f, at + 34, 16)} anchor="middle" id="bt2" />
	</g>
);

const Base: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const tl = useTimeline();
	const D = scene.duration;
	const hitAt = Math.round((tl.music.markers.hit ?? scene.from) - scene.from);
	const titleLen = cue(0) - 8;
	const A = f + scene.from;
	// outside: the flight school at dusk, then in through the briefing hut's door
	const IN = cue(1) - 4;
	const extKeys: CamKey[] = [
		[titleLen - 20, 900, 330, 1.12],
		[cue(0) + 10, 820, 560, 1.02],
		[IN - 30, 420, 760, 1.6],
		[IN + 12, HUT.x, HUT.y - 64, 7],
	];
	const intKeys: CamKey[] = [
		[IN - 12, 960, 600, 3.2],
		[IN + 30, 980, 560, 1.1],
		[cue(2) - 10, 1000, 520, 1.12],
		[cue(2) + 40, 940, 450, 1.32],
		[D, 950, 450, 1.36],
	];
	const ext = camPath(extKeys, f);
	const intc = camPath(intKeys, f);
	const x = prog(f, IN - 6, 14, ease.inOut);
	const cardAt = cue(1) + 6;
	return (
		<FullFrame
			fadeIn={0}
			fadeOut={0}
			overlay={
				<>
					<Sequence durationInFrames={titleLen + 14} layout="none">
						<RegressTitle dur={titleLen + 14} hitAt={hitAt} />
					</Sequence>
					<AbsoluteFill>
						<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={NUM}>
							<PersonCard
								t={f - cardAt}
								dur={cue(2) + 8 - cardAt}
								name="DANIEL KAHNEMAN"
								zh="丹尼尔·卡尼曼"
								years="1934 – 2024"
								role="心理学家 · 2002年诺贝尔经济学奖"
								profile={{hair: 'short'}}
								x={96}
								y={130}
								facts={[
									{year: '1954', text: '在以色列国防军设计新兵面试法', at: 14},
									{year: '1961', text: '获伯克利心理学博士', at: 31},
									{text: '回国任教于希伯来大学，三十出头', at: 50},
								]}
							/>
						</svg>
					</AbsoluteFill>
				</>
			}
		>
			<Defs />
			<g opacity={f < titleLen - 14 ? 0 : 1 - x}>
				<Airbase1965 frame={A} cam={ext} night={0.35}>
					<g transform={`translate(${HUT.x},${HUT.y})`}>
						<BriefingHut />
					</g>
					<g transform={`translate(${BOARD_AT.x},${BOARD_AT.y}) scale(${BOARD_AT.s})`}>
						<GradeBoard rows={boardRows(1e5, {a0: 0, n0: 0, b0: 0, a1: 0, n1: 0, b1: 0})} lit={0.6} />
					</g>
				</Airbase1965>
			</g>
			{x > 0 ? (
				<g opacity={x}>
					<Briefing1965 frame={A} cam={intc} night={0.4} board={<BoardText f={f} at={cue(2) + 14} />}>
						<Kahneman f={A} talk={f > cue(2) && f < cue(2) + 70 ? 1 : 0} />
					</Briefing1965>
				</g>
			) : null}
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 3. the objection: the instructor and his logbook

const LOG_AT = {x: 120, y: 150};
/** frames each logbook row starts being written, relative to a start (uneven, like a hand) */
const ROW_T = [0, 22, 50, 104, 126, 152, 176];
const TICK_T = [0, 13, 29, 40, 58, 69, 86];

const rowsAt = (f: number, at: number) => ROW_T.reduce((n, t) => n + Math.min(1, Math.max(0, (f - at - t) / 24)), 0);
const ticksAt = (f: number, at: number) => TICK_T.reduce((n, t) => n + Math.min(1, Math.max(0, (f - at - t) / 10)), 0);

const Instructor: React.FC<{f: number; talk?: number}> = ({f, talk = 0}) => (
	<g transform={`translate(560,${FLOOR_Y + 10}) scale(1.05)`}>
		<Figure look={CAST.instructor} pose={addPose(POSES.stand, idle(f, 'ins'))} rim="warm" blink={blinkAt(f, 'ins')} expression="stern" talk={talk} />
	</g>
);

const Objection: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const D = scene.duration;
	const A = f + scene.from;
	const CUT = cue(1);
	const room: CamKey[] = [
		[0, 950, 450, 1.36],
		[cue(0) + 30, 700, 560, 1.4],
		[CUT, 640, 600, 1.55],
	];
	const book: CamKey[] = [
		[CUT, 760, 470, 1.55],
		[cue(2), 820, 560, 1.22],
		[cue(3), 880, 560, 1.12],
		[D, 900, 560, 1.1],
	];
	const inBook = f >= CUT;
	return (
		<FullFrame fadeIn={0} fadeOut={0}>
			<Defs />
			{!inBook ? (
				<Briefing1965 frame={A} cam={camPath(room, f)} night={0.5} board={<BoardText f={1e5} at={0} />}>
					<Kahneman f={A} />
					<Instructor f={A} talk={f > cue(0) && f < cue(0) + 60 ? 1 : 0} />
				</Briefing1965>
			) : (
				<Flat cam={camPath(book, f)}>
					<Desk f={A}>
						<g transform={`translate(${LOG_AT.x},${LOG_AT.y})`}>
							<Logbook rows={rowsAt(f, CUT + 4)} ticks={ticksAt(f, cue(3) + 8)} />
						</g>
					</Desk>
				</Flat>
			)}
		</FullFrame>
	);
};

/** Apply a lookAt camera to a flat (top-view) world. */
const Flat: React.FC<{cam: Cam; children: React.ReactNode}> = ({cam, children}) => (
	<g transform={`translate(960,540) scale(${cam.zoom}) translate(${-960 - cam.x / cam.zoom},${-540 - cam.y / cam.zoom})`}>{children}</g>
);

// ---------------------------------------------------------------- 4. the twist (the break)

const Twist: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const D = scene.duration;
	const A = f + scene.from;
	const CUT = cue(2);
	const room = camPath(
		[
			[0, 940, 520, 1.08],
			[CUT, 1240, 560, 1.5],
		],
		f,
	);
	const book = camPath(
		[
			[CUT, 1080, 540, 1.5],
			[D, 1110, 560, 1.68],
		],
		f,
	);
	return (
		<FullFrame fadeIn={0} fadeOut={0}>
			<Defs />
			{f < CUT ? (
				<Briefing1965 frame={A} cam={room} night={0.85} lamp={0.85} board={<BoardText f={1e5} at={0} />}>
					<Kahneman f={A} talk={f > cue(0) + 10 && f < cue(0) + 60 ? 1 : 0} />
					<Instructor f={A} />
				</Briefing1965>
			) : (
				<Flat cam={book}>
					<Desk f={A} on={0.85}>
						<g transform={`translate(${LOG_AT.x},${LOG_AT.y})`}>
							<Logbook rows={7} ticks={7} strike={prog(f, CUT + 14, 34, ease.inOut)} />
						</g>
					</Desk>
				</Flat>
			)}
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 5. the coin experiment (the build)

/** When each instructor's coin leaves the hand (frames after the round starts): uneven, like people. */
const THROW1 = [0, 9, 15, 27, 31, 44, 52, 61, 69, 80];
const THROW2 = [4, 0, 19, 11, 30, 26, 47, 40, 63, 57];
const FLY = 22;

/** One coin from the hand to the floor: an arc, spinning, a small bounce, then it settles face up. */
const coinState = (k: number, from: [number, number], to: [number, number]) => {
	if (k < 0) return null;
	const u = Math.min(1, k / FLY);
	const x = from[0] + (to[0] - from[0]) * u;
	const y = from[1] + (to[1] - from[1]) * u;
	if (k < FLY) {
		return {x, y, h: 70 * (1 - u) + 4 * 230 * u * (1 - u), spin: k * 0.55};
	}
	const s = k - FLY;
	const h = s < 7 ? 16 * Math.sin((Math.PI * s) / 7) : 0;
	const spin = 0.9 * Math.exp(-s / 5) * Math.sin(s * 1.4);
	return {x, y, h, spin};
};

const tgt = (p: [number, number]): [number, number] => [TGT.x + p[0], TGT.y + p[1]];

/** The ten instructors, their two coins, and the chalk numbers; `t1`/`t2` are the rounds' start frames. */
const Experiment: React.FC<{f: number; A: number; t1: number; t2: number; people?: number}> = ({f, A, t1, t2, people = 1}) => (
	<g>
		{COINS.map((c, i) => {
			const [px, py] = throwerAt(i);
			const from: [number, number] = [px, py - 30];
			const s1 = coinState(f - t1 - THROW1[i], from, tgt(c.a));
			const s2 = coinState(f - t2 - THROW2[i], from, tgt(c.b));
			const tag = (s: {x: number; y: number} | null, k: number, key: string) =>
				s && k > FLY + 4 ? (
					<text key={key} x={s.x + 24} y={s.y - 16} style={{fontFamily: font.latin, fontWeight: 700, fontSize: 24, fill: '#e9efe6', ...NUM}} opacity={Math.min(0.85, (k - FLY - 4) / 8)} filter="url(#chalk)">
						{i + 1}
					</text>
				) : null;
			return (
				<g key={i}>
					{s1 ? <Coin x={s1.x} y={s1.y} h={s1.h} spin={s1.spin} r={26} /> : null}
					{tag(s1, f - t1 - THROW1[i], 'a')}
					{s2 ? <Coin x={s2.x} y={s2.y} h={s2.h} spin={s2.spin} r={26} copper /> : null}
					{tag(s2, f - t2 - THROW2[i], 'b')}
				</g>
			);
		})}
		<g opacity={people}>
			{COINS.map((_, i) => {
				const [x, y] = throwerAt(i);
				return (
					<g key={i}>
						<TopPerson x={x} y={y} f={A} seed={`th${i}`} />
						<text x={x} y={y + 84} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 28, fill: '#e9efe6', ...NUM}} opacity={0.7} filter="url(#chalk)">
							{i + 1}
						</text>
					</g>
				);
			})}
		</g>
	</g>
);

const Coins: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const D = scene.duration;
	const A = f + scene.from;
	const cam = camPath(
		[
			[0, 960, 560, 0.62],
			[cue(1), 960, 620, 0.88],
			[cue(2), 960, 560, 0.95],
			[cue(3) + 50, 960, 480, 1.08],
			[cue(4), 960, 450, 1.16],
			[D, 960, 440, 1.2],
		],
		f,
	);
	return (
		<FullFrame fadeIn={0} fadeOut={0}>
			<Defs />
			<Flat cam={cam}>
				<HangarFloor f={A} rings={prog(f, 4, 44, ease.inOut)}>
					<Experiment f={f} A={A} t1={cue(2) + 6} t2={cue(3) + 8} />
				</HangarFloor>
			</Flat>
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 6. the answer (the drop)

/** A chalk arrow from a to b on the floor, drawn on with p; gold when it carries the answer. */
const FloorArrow: React.FC<{a: [number, number]; b: [number, number]; p: number; gold?: boolean}> = ({a, b, p, gold}) => {
	if (p <= 0) return null;
	const dx = b[0] - a[0];
	const dy = b[1] - a[1];
	const L = Math.hypot(dx, dy);
	const ux = dx / L;
	const uy = dy / L;
	const s: [number, number] = [a[0] + ux * 26, a[1] + uy * 26];
	const e: [number, number] = [b[0] - ux * 28, b[1] - uy * 28];
	const q = Math.min(1, p);
	const tip: [number, number] = [s[0] + (e[0] - s[0]) * q, s[1] + (e[1] - s[1]) * q];
	const col = gold ? P.gold : '#e9efe6';
	return (
		<g stroke={col} strokeWidth={gold ? 5 : 3} strokeLinecap="round" fill="none" opacity={gold ? 0.95 : 0.45} filter="url(#chalk)">
			<line x1={s[0]} y1={s[1]} x2={tip[0]} y2={tip[1]} />
			{q > 0.85 ? <path d={`M${tip[0] - ux * 16 - uy * 10},${tip[1] - uy * 16 + ux * 10} L${tip[0]},${tip[1]} L${tip[0] - ux * 16 + uy * 10},${tip[1] - uy * 16 - ux * 10}`} /> : null}
		</g>
	);
};

const ChalkRing: React.FC<{x: number; y: number; r: number; p: number; color?: string; dash?: string; w?: number; o?: number}> = ({x, y, r, p, color = '#e9efe6', dash, w = 3, o = 0.8}) => {
	if (p <= 0) return null;
	const L = 2 * Math.PI * r;
	return <circle cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth={w} opacity={o} strokeDasharray={dash ?? `${L}`} strokeDashoffset={dash ? 0 : L * (1 - Math.min(1, p))} filter="url(#chalk)" transform={`rotate(-90,${x},${y})`} style={dash ? {opacity: o * Math.min(1, p)} : undefined} />;
};

/** All of the answer's floor marks at a given set of progress values. */
const Marks: React.FC<{best: number; bestArrow: number; worstArrow: number; rest: number; aims: number; focus?: number}> = ({best, bestArrow, worstArrow, rest, aims, focus = -1}) => (
	<g>
		{COINS.map((c, i) => {
			const a = tgt(c.a);
			const b = tgt(c.b);
			const isBest = BEST.includes(i);
			const isWorst = WORST.includes(i);
			const p = isBest ? bestArrow - BEST.indexOf(i) * 0.25 : isWorst ? worstArrow - WORST.indexOf(i) * 0.25 : rest - i * 0.05;
			const dim = focus >= 0 && focus !== i ? 0.3 : 1;
			return (
				<g key={i} opacity={dim}>
					{aims > 0 ? (
						<g>
							<ChalkRing x={TGT.x + c.aim[0]} y={TGT.y + c.aim[1]} r={LUCK_R} p={aims - i * 0.04} color={P.gold} dash="10 9" w={2.5} o={0.6} />
							<g opacity={Math.min(1, Math.max(0, (aims - i * 0.04) * 2))} stroke={P.gold} strokeWidth={3}>
								<line x1={TGT.x + c.aim[0] - 9} y1={TGT.y + c.aim[1] - 9} x2={TGT.x + c.aim[0] + 9} y2={TGT.y + c.aim[1] + 9} />
								<line x1={TGT.x + c.aim[0] + 9} y1={TGT.y + c.aim[1] - 9} x2={TGT.x + c.aim[0] - 9} y2={TGT.y + c.aim[1] + 9} />
							</g>
						</g>
					) : null}
					{isBest ? <ChalkRing x={a[0]} y={a[1]} r={34} p={best - BEST.indexOf(i) * 0.2} /> : null}
					{isWorst ? <ChalkRing x={a[0]} y={a[1]} r={34} p={worstArrow * 2 - WORST.indexOf(i) * 0.2} color="#ff8a80" /> : null}
					<FloorArrow a={a} b={b} p={p} gold={isBest || isWorst} />
				</g>
			);
		})}
	</g>
);

const Reveal: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const D = scene.duration;
	const A = f + scene.from;
	const hero = BEST[0];
	const h = COINS[hero];
	const ha = tgt(h.a);
	const hb = tgt(h.b);
	const aimX = TGT.x + h.aim[0];
	const aimY = TGT.y + h.aim[1];
	const cam = camPath(
		[
			[0, 960, 440, 1.2],
			[cue(0), 960, 440, 1.24],
			[cue(2) - 20, 960, 440, 1.16],
			[cue(2) + 60, 960, 420, 1.1],
			[cue(3), aimX - 90, aimY + 30, 1.8],
			[cue(4) + 30, aimX - 100, aimY + 10, 1.85],
			[D - 30, aimX + 60, aimY + 60, 1.6],
			[D, 960, 430, 1.15],
		],
		f,
	);
	// on the drop: the floor's lamp flares, a short kick
	const flash = f < 30 ? Math.exp(-f / 7) : 0;
	const kick = f < 10 ? 10 * Math.exp(-f / 2.5) : 0;
	const eq = prog(f, cue(2) + 8, 12) * (1 - prog(f, cue(3) - 10, 12));
	const eqPop = spring({frame: f - cue(2) - 8, fps: 30, config: {damping: 12, stiffness: 170}});
	return (
		<FullFrame
			fadeIn={0}
			fadeOut={0}
			overlay={
				eq > 0 ? (
					<AbsoluteFill>
						<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={NUM}>
							<g opacity={eq} transform={`translate(960,160) scale(${0.85 + 0.15 * eqPop})`}>
								<rect x={-560} y={-84} width={1120} height={150} rx={18} fill="#07080c" opacity={0.6} />
								<text x={0} y={22} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 76, fill: '#f3ede2'}}>
									成绩 = <tspan fill="#f3ede2">实力</tspan> + <tspan fill={P.gold}>运气</tspan>
								</text>
								<text x={-90} y={60} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 22, fill: 'rgba(243,237,226,0.7)', letterSpacing: '0.1em'}}>
									✕ 瞄准的地方
								</text>
								<text x={160} y={60} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 22, fill: P.gold, letterSpacing: '0.1em'}}>
									◌ 落点会偏多少
								</text>
							</g>
						</svg>
					</AbsoluteFill>
				) : null
			}
		>
			<Defs />
			<g transform={`translate(0,${kick * (random(`rk${f}`) - 0.5)})`}>
				<Flat cam={cam}>
					<HangarFloor f={A} rings={1} lamp={1 + 2 * flash}>
						<Marks
							best={prog(f, 2, 12, ease.out) * 1.6}
							bestArrow={prog(f, cue(0) + 8, 26) * 1.6}
							worstArrow={prog(f, cue(1) + 8, 26) * 1.6}
							rest={prog(f, cue(1) + 70, 40) * 1.5}
							aims={prog(f, cue(2) + 2, 40) * 1.4}
							focus={f > cue(3) - 10 && f < D - 30 ? hero : -1}
						/>
						<Experiment f={1e5} A={A} t1={0} t2={0} />
						<rect x={-1400} y={-1100} width={4720} height={3300} fill="#fff1cf" opacity={0.12 * flash} />
						<g opacity={prog(f, cue(3) + 16, 10)} stroke={P.gold} strokeWidth={2.5} filter="url(#chalk)">
							<line x1={690} y1={ha[1] + 40} x2={ha[0] - 28} y2={ha[1] + 6} />
						</g>
						<WriteOn x={680} y={ha[1] + 50} text="第一枚：运气好" size={30} p={prog(f, cue(3) + 20, 22)} anchor="end" id="lk1" fill={P.gold} />
						<g opacity={prog(f, cue(4) + 12, 10)} stroke="#e9efe6" strokeWidth={2.5} filter="url(#chalk)">
							<line x1={690} y1={hb[1] - 50} x2={hb[0] - 28} y2={hb[1] - 8} />
						</g>
						<WriteOn x={680} y={hb[1] - 40} text="第二枚：运气平常" size={30} p={prog(f, cue(4) + 16, 22)} anchor="end" id="lk2" />
					</HangarFloor>
				</Flat>
			</g>
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 7. the name

const Why: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const D = scene.duration;
	const A = f + scene.from;
	const cam = camPath(
		[
			[0, 960, 430, 1.2],
			[cue(0), 960, 440, 1.04],
			[cue(1) + 40, 960, 450, 1.1],
			[D - 16, 960, 430, 1.4],
			[D, 960, 430, 2.6],
		],
		f,
	);
	const ring = prog(f, cue(0) - 2, 26, ease.inOut);
	const k = f - cue(0);
	const slam = k >= 0 ? spring({frame: k, fps: 30, config: {damping: 12, stiffness: 200}}) : 0;
	const shake = k >= 0 && k < 8 ? 8 * Math.exp(-k / 2.2) : 0;
	const titleOut = 1 - prog(f, D - 24, 14);
	return (
		<FullFrame
			fadeIn={0}
			fadeOut={0}
			overlay={
				k >= 0 ? (
					<AbsoluteFill>
						<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={NUM}>
							<g opacity={Math.min(1, k / 3) * titleOut} transform={`translate(960,190) scale(${1.4 - 0.4 * slam})`}>
								<rect x={-420} y={-104} width={840} height={168} rx={20} fill="#07080c" opacity={0.55} />
								<text x={0} y={10} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 104, fill: P.gold, letterSpacing: '0.1em'}}>
									回归均值
								</text>
								<text x={0} y={52} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 600, fontSize: 24, fill: 'rgba(243,237,226,0.7)', letterSpacing: '0.5em'}}>
									REGRESSION TO THE MEAN
								</text>
							</g>
						</svg>
					</AbsoluteFill>
				) : null
			}
		>
			<Defs />
			<g transform={`translate(${shake * (random(`wx${f}`) - 0.5)},${shake * (random(`wy${f}`) - 0.5)})`}>
				<Flat cam={cam}>
					<HangarFloor f={A} rings={1}>
						<Marks best={2} bestArrow={2} worstArrow={2} rest={2} aims={2 * (1 - prog(f, 0, 20))} />
						<Experiment f={1e5} A={A} t1={0} t2={0} />
						<ChalkRing x={TGT.x} y={TGT.y} r={MEAN_D} p={ring} color={P.gold} w={6} o={0.95} />
						<WriteOn x={TGT.x + MEAN_D * 0.72 + 14} y={TGT.y - MEAN_D * 0.72 - 6} text="平均距离" size={28} p={prog(f, cue(0) + 18, 16)} id="mean" fill={P.gold} />
						{/* the extremes: arrows toward the gold ring */}
						{[...BEST, ...WORST].map((i) => {
							const d1 = dist(COINS[i].a);
							const a = tgt(COINS[i].a);
							const ux = (a[0] - TGT.x) / d1;
							const uy = (a[1] - TGT.y) / d1;
							const q = prog(f, cue(1) + 10 + (i % 5) * 4, 20);
							const m: [number, number] = [TGT.x + ux * MEAN_D, TGT.y + uy * MEAN_D];
							return <FloorArrow key={i} a={a} b={m} p={q} gold />;
						})}
					</HangarFloor>
				</Flat>
			</g>
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 7b. Galton, 1886

const GALTON_LAMP = {x: 1660, y: 200};
const CHART = {x: 480, y: 180};

const Galton: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const D = scene.duration;
	const A = f + scene.from;
	const cam = camPath(
		[
			[0, GALTON_LAMP.x, GALTON_LAMP.y, 3.4],
			[34, 1260, 380, 1.3],
			[cue(1), 930, 520, 1.12],
			[cue(3), 1010, 470, 1.28],
			[D, 1020, 470, 1.32],
		],
		f,
	);
	const two = prog(f, cue(3) + 22, 14);
	const tx = CHART.x + 450 + 4 * 70 + 30;
	const ty = CHART.y + 350 - 2.67 * 70;
	return (
		<FullFrame
			fadeIn={0}
			fadeOut={0}
			overlay={
				<AbsoluteFill>
					<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={NUM}>
						<PersonCard t={f - 14} dur={cue(1) - 14} name="FRANCIS GALTON" zh="弗朗西斯·高尔顿" years="1822 – 1911" role="统计学家 · 《八百人猜牛》里的那位" profile={{beard: true, hair: 'bald'}} x={96} y={150} />
					</svg>
				</AbsoluteFill>
			}
		>
			<Defs />
			<Flat cam={cam}>
				<Desk f={A} lamp={GALTON_LAMP}>
					<g transform={`translate(${CHART.x},${CHART.y})`}>
						<HeightChart p={prog(f, cue(1) + 6, 70)} line={prog(f, cue(2) + 2, 26)} fit={prog(f, cue(3), 24)} tall={prog(f, cue(2) + 34, 16)} />
					</g>
					{two > 0 ? (
						<g opacity={two} transform={`translate(${tx + 26},${ty + 40})`}>
							<rect x={-6} y={-46} width={168} height={66} rx={8} fill="#f6ecd6" opacity={0.9} />
							<text x={78} y={2} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 44, fill: '#a0712a', ...NUM}}>
								≈ 2/3
							</text>
						</g>
					) : null}
				</Desk>
			</Flat>
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 8. three takeaways, on screen

const TIPS: [string, string][] = [
	['上一次', '是不是太极端了？'],
	['不做的人', '是不是也变了？'],
	['表扬', '照样给'],
];

const TipCards: React.FC<{f: number; cues: number[]; out: number}> = ({f, cues, out}) => {
	const leave = prog(f, out, 12, ease.in);
	const head = prog(f, cues[0] - 8, 14, ease.out);
	if (head <= 0) return null;
	return (
		<g opacity={1 - leave} transform={`translate(0,${-30 * leave})`}>
			<g opacity={head} transform={`translate(0,${16 * (1 - head)})`}>
				<text x={960} y={250} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 52, fill: JUNO.colors.ink, letterSpacing: '0.18em'}}>
					下次看到“立竿见影”
				</text>
				<line x1={960 - 220 * head} y1={286} x2={960 + 220 * head} y2={286} stroke={JUNO.colors.gold} strokeWidth={2} opacity={0.8} />
			</g>
			{TIPS.map(([a, b], i) => {
				const t = f - cues[i + 1] + 2;
				if (t < 0) return null;
				const sp = spring({frame: t, fps: 30, config: {damping: 13, stiffness: 140}});
				const y = 410 + i * 150;
				const ring = prog(t, 0, 12, ease.out);
				return (
					<g key={i} opacity={Math.min(1, t / 4)} transform={`translate(${-70 * (1 - sp)},0)`}>
						<circle cx={600} cy={y - 16} r={44} fill="none" stroke={JUNO.colors.gold} strokeWidth={3} strokeDasharray={280} strokeDashoffset={280 * (1 - ring)} />
						<text x={600} y={y + 2} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 52, fill: JUNO.colors.gold, ...NUM}}>
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

const NIGHT_ROWS = boardRows(1e5, {a0: 0, n0: 0, b0: 0, a1: 0, n1: 0, b1: 0});

const Tips: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const D = scene.duration;
	const A = f + scene.from;
	const cam = camPath(
		[
			[0, 700, 640, 2.2],
			[30, 860, 600, 1.2],
			[cue(1), 920, 580, 1.14],
			[D - 18, 1100, 620, 1.3],
			[D, 1150, 640, 1.34],
		],
		f,
	);
	const dim = prog(f, cue(0) - 10, 12, ease.inOut) * (1 - prog(f, D - 18, 14, ease.inOut));
	return (
		<FullFrame fadeIn={0} fadeOut={0}>
			<Defs />
			<defs>
				<filter id="tips-soft" x="-5%" y="-5%" width="110%" height="110%">
					<feGaussianBlur stdDeviation={7 * dim} />
				</filter>
			</defs>
			<g filter={dim > 0.02 ? 'url(#tips-soft)' : undefined}>
				<Airbase1965 frame={A} cam={cam} night={1}>
					<g transform={`translate(${HUT.x},${HUT.y})`}>
						<BriefingHut />
					</g>
					<g transform={`translate(${BOARD_AT.x},${BOARD_AT.y}) scale(${BOARD_AT.s})`}>
						<GradeBoard rows={NIGHT_ROWS} lit={0.6} />
					</g>
				</Airbase1965>
			</g>
			<rect width={W} height={H} fill="#05060b" opacity={0.55 * dim} />
			<TipCards f={f} cues={[cue(0), cue(1), cue(2), cue(3)]} out={D - 22} />
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 9. callback + end card

const Callback: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const D = scene.duration;
	const A = f + scene.from;
	const endAt = cue(2) - 4;
	const cam = camPath(
		[
			[0, 1150, 640, 1.34],
			[cue(0) + 20, 1230, 660, 1.6],
			[cue(1) + 10, 1100, 600, 1.2],
			[D, 980, 560, 1.06],
		],
		f,
	);
	// a trainer comes home: down the glide path with its landing light, onto the runway
	const t = prog(f, 0, 300, (x) => x);
	const jx = 1900 - 1100 * t;
	const jy = 250 + 380 * Math.min(1, t * 1.1);
	const erase = prog(f, cue(0) + 26, 30, ease.inOut);
	return (
		<FullFrame
			fadeIn={0}
			fadeOut={0}
			scrim={0.6}
			overlay={
				<Sequence from={endAt} layout="none">
					<EndCard v={EPISODE} cfg={BRAND} dur={D - endAt} />
				</Sequence>
			}
		>
			<Defs />
			<Airbase1965
				frame={A}
				cam={cam}
				night={1}
				sky={
					<g transform={`translate(${jx},${jy}) rotate(${t < 0.9 ? -8 : 0}) scale(-0.3,0.3)`}>
						<circle cx={0} cy={0} r={160} fill="url(#glow-lamp)" opacity={0.8} />
						<TrainerJet gear={t > 0.5} no="07" />
					</g>
				}
			>
				<g transform={`translate(${HUT.x},${HUT.y})`}>
					<BriefingHut />
				</g>
				<g transform={`translate(${BOARD_AT.x},${BOARD_AT.y}) scale(${BOARD_AT.s})`}>
					<GradeBoard rows={boardRows(1e5, {a0: 0, n0: 0, b0: 0, a1: 0, n1: 0, b1: 0}, erase)} lit={0.6} />
				</g>
				{/* the coin, left on the board's ledge */}
				<g opacity={prog(f, cue(1), 20)}>
					<Coin x={BOARD_AT.x - 150} y={BOARD_AT.y - 470 * BOARD_AT.s + 330 * BOARD_AT.s + 26} r={14} face="夸" back="骂" gold spin={1.25} />
				</g>
			</Airbase1965>
		</FullFrame>
	);
};

export const scenes: SceneMap = {Hook, Base, Objection, Twist, Coins, Reveal, Why, Galton, Tips, Callback};

