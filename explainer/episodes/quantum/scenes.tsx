import React from 'react';
import {AbsoluteFill, Sequence, random, spring, useCurrentFrame} from 'remotion';
import {camPath} from '../../src/art/camera';
import {EndCard, QubitMotif} from '../../src/brand/Brand';
import {JUNO} from '../../src/brand/identity';
import {FullFrame} from '../../src/components/FullFrame';
import {ease, prog, useCue, useScene, useTimeline} from '../../src/lib/context';
import {font} from '../../src/lib/theme';
import type {SceneMap, SceneProps} from '../../src/lib/types';
import {AnswerBars, Battery, ChipTop, CoinTable, GOLD, ICE, LabSet, Molecule, Padlock, Q_DEFS, TABLE_Y, TableCoin, Waves} from './art';
import {BRAND, EPISODE} from './brand';

/**
 * 《旋转的硬币》. Google's quantum lab: the gold "chandelier" with a chip at the bottom, a race the
 * chip wins (under 5 minutes vs 10^25 years). A coin spins up into the title on the first hit. Bits
 * are coins lying flat; a qubit is a coin still spinning; looking stops it. Many spinning coins hold
 * every combination, so is it trying every answer at once? On the drop: no. Looking gives one random
 * answer; the trick is interference (waves, noise-cancelling headphones, wrong answers cancelling).
 * What it is for, how far there is to go, three things to remember, and the coin, still spinning.
 *
 * End card: 你觉得量子计算机多少年后能真正用上？评论区说说
 */

const W = 1920;
const H = 1080;
const NUM = {fontVariantNumeric: 'lining-nums' as const};
const INK = JUNO.colors.ink;
const DIM = 'rgba(243,237,226,0.6)';
const RED = '#ff7a6e';

const CHIP = {x: 960, y: 150 + 690 + 29}; // the chip on the chandelier, in the lab's hero plane
const HALF_BEAT = 0.2545;

// ---------------------------------------------------------------- shared pieces

/** The track's accent nearest a frame (within ±win), scene-local; the beat grid sits ~3 frames after the onset. */
const useAccent = () => {
	const tl = useTimeline();
	const scene = useScene();
	return (at: number, min = 0.8, win = 8) => {
		const hits = (tl.music.hits ?? []).filter(([, s]) => s >= min).map(([t]) => t - scene.from);
		const near = hits.filter((h) => Math.abs(h - at) <= win).sort((a, b) => Math.abs(a - at) - Math.abs(b - at));
		return near.length ? near[0] : at;
	};
};

/** A coin standing on its edge at contact point (x, y), turning about its vertical axis. Fast spins blur
 * into a soft sphere (a few sub-frames), and the digit can't be read, which is the point. */
const SpinCoin: React.FC<{x: number; y: number; r: number; ph: number; speed?: number; gold?: boolean; shadow?: boolean}> = ({x, y, r, ph, speed = 0, gold = true, shadow = true}) => {
	const N = speed > 0.3 ? 5 : speed > 0.12 ? 3 : 1;
	const fill = gold ? 'url(#q-coin-gold)' : 'url(#q-coin)';
	const edge = gold ? '#7a5418' : '#5a606a';
	const ink = gold ? '#6a4310' : '#2a2e36';
	const cy = y - r;
	const blurA = Math.min(1, Math.max(0, (speed - 0.12) / 0.3));
	return (
		<g>
			{shadow ? <ellipse cx={x} cy={y + 2} rx={r * 0.85} ry={r * 0.16} fill="#000" opacity={0.45} /> : null}
			{blurA > 0 ? <ellipse cx={x} cy={cy} rx={r} ry={r} fill={gold ? '#ffd98a' : '#dfe6ee'} opacity={0.16 * blurA} /> : null}
			{Array.from({length: N}, (_, k) => {
				const p = ph - (k * speed) / N;
				const c = Math.cos(p);
				const w = Math.max(0.07, Math.abs(c));
				const th = r * 0.09 * Math.abs(Math.sin(p));
				const o = N === 1 ? 1 : 1.5 / N;
				return (
					<g key={k} opacity={o}>
						<ellipse cx={x} cy={cy} rx={r * w + th} ry={r} fill={edge} />
						<ellipse cx={x + (c >= 0 ? -th / 2 : th / 2)} cy={cy} rx={r * w} ry={r * 0.985} fill={fill} />
						{N === 1 && w > 0.25 ? (
							<>
								<ellipse cx={x} cy={cy} rx={r * w * 0.78} ry={r * 0.78} fill="none" stroke={edge} strokeWidth={r * 0.04} opacity={0.5} />
								<text x={x} y={cy + r * 0.36} textAnchor="middle" transform={`translate(${x},${cy}) scale(${w},1) translate(${-x},${-cy})`} style={{fontFamily: font.latin, fontWeight: 700, fontSize: r * 1.05, fill: ink, ...NUM}}>
									{c >= 0 ? '1' : '0'}
								</text>
							</>
						) : null}
					</g>
				);
			})}
		</g>
	);
};

/** A dark glass panel for numbers (HUD). */
const Panel: React.FC<{x: number; y: number; w: number; h: number; o?: number; accent?: string; children?: React.ReactNode}> = ({x, y, w, h, o = 1, accent = ICE, children}) => (
	<g opacity={o}>
		<rect x={x} y={y} width={w} height={h} rx={14} fill="#060a12" opacity={0.78} />
		<rect x={x} y={y} width={w} height={h} rx={14} fill="none" stroke={accent} strokeOpacity={0.4} strokeWidth={2} />
		<rect x={x} y={y + 18} width={4} height={h - 36} fill={accent} opacity={0.85} />
		{children}
	</g>
);

const T: React.FC<{x: number; y: number; size: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; weight?: number; serif?: boolean; latin?: boolean; ls?: string; o?: number; children: React.ReactNode}> = ({
	x,
	y,
	size,
	fill = INK,
	anchor = 'start',
	weight = 700,
	serif = false,
	latin = false,
	ls = '0.04em',
	o = 1,
	children,
}) => (
	<text x={x} y={y} textAnchor={anchor} opacity={o} style={{fontFamily: latin ? font.latin : serif ? font.serif : font.sans, fontWeight: weight, fontSize: size, fill, letterSpacing: ls, ...NUM}}>
		{children}
	</text>
);

const pop = (f: number, at: number, damping = 13) => (f < at ? 0 : spring({frame: f - at, fps: 30, config: {damping, stiffness: 150}}));

/** an svg overlay in screen space (above the camera) */
const Screen: React.FC<{children: React.ReactNode}> = ({children}) => (
	<AbsoluteFill>
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={NUM}>
			<Q_DEFS />
			{children}
		</svg>
	</AbsoluteFill>
);

// ---------------------------------------------------------------- 1. hook: the race

/** 10^25 written out, digit by digit (n of the 25 zeros shown) */
const bigYears = (n: number) => {
	const s = '1' + '0'.repeat(Math.max(0, Math.min(25, Math.floor(n))));
	return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// line 0 is the leading pause, so the first subtitle is cue(1)
const Hook: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const D = scene.duration;
	const A = f + scene.from;
	const TOSS = D - 50;
	const cam = camPath(
		[
			[0, CHIP.x, CHIP.y - 20, 3.6],
			[40, CHIP.x, CHIP.y - 40, 3.1],
			[cue(2) - 10, 960, 560, 1.28],
			[cue(4), 960, 520, 1.12],
			[TOSS, 960, 700, 1.5],
			[D, CHIP.x, CHIP.y - 10, 3.2],
		],
		f,
	);
	// the race: Willow's clock stops under 5 minutes; the supercomputer's years keep growing
	const t1 = cue(2) + 10;
	const secs = Math.min(296, Math.max(0, (f - t1) * 4.2));
	const done = prog(f, t1 + 72, 10);
	const t2 = cue(3) + 8;
	const zeros = Math.max(0, (f - t2) / 3.1);
	const left = prog(f, cue(2) - 4, 16);
	const right = prog(f, cue(3) - 4, 16);
	const hudOut = 1 - prog(f, TOSS - 30, 24);
	const k = f - TOSS;
	const up = prog(k, 0, 40, ease.out);
	const black = prog(f, D - 10, 10);
	return (
		<FullFrame
			fadeIn={0}
			fadeOut={0}
			overlay={
				<Screen>
					<g opacity={hudOut}>
						<g transform={`translate(${-40 * (1 - left)},0)`}>
							<Panel x={110} y={250} w={560} h={250} o={left} accent={GOLD}>
								<T x={150} y={310} size={26} fill={GOLD} ls="0.2em">
									量子芯片 · WILLOW
								</T>
								<T x={150} y={420} size={96} latin fill={INK}>
									{`${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(Math.floor(secs % 60)).padStart(2, '0')}`}
								</T>
								<T x={150} y={470} size={28} fill={done > 0 ? GOLD : DIM} o={0.4 + 0.6 * done}>
									{done > 0 ? '✓ 算完了 · 不到 5 分钟' : '计算中…'}
								</T>
							</Panel>
						</g>
						<g transform={`translate(${40 * (1 - right)},0)`}>
							<Panel x={1110} y={250} w={700} h={250} o={right} accent={RED}>
								<T x={1150} y={310} size={26} fill={RED} ls="0.2em">
									最快的超级计算机
								</T>
								<T x={1150} y={400} size={zeros > 18 ? 30 : 40} latin fill={INK}>
									{bigYears(zeros)}
								</T>
								<T x={1150} y={452} size={30} fill={DIM}>
									年
									<tspan dx={18} fill={RED} opacity={prog(f, t2 + 25 * 3.1, 12)}>
										≈ 10²⁵ 年 · 宇宙才 138 亿岁
									</tspan>
								</T>
							</Panel>
						</g>
					</g>
					{k >= 0 ? (
						<>
							<rect width={W} height={H} fill="#05060b" opacity={0.55 * up + black} />
							<SpinCoin x={960 + 30 * Math.sin(k / 9)} y={1220 - 760 * up} r={50 + 90 * up} ph={k * 0.5} speed={0.5} shadow={false} />
						</>
					) : null}
				</Screen>
			}
		>
			<Q_DEFS />
			<LabSet f={A} cam={cam} chip={1 - 0.5 * prog(f, cue(2), 40)} light={0.4 + 0.6 * prog(f, 20, 120)} />
		</FullFrame>
	);
};

// ---------------------------------------------------------------- the title: the coin lands on its edge and keeps spinning

const CHARS = [...`《${EPISODE.title}》`];

const QTitle: React.FC<{dur: number; hitAt: number}> = ({dur, hitAt}) => {
	const f = useCurrentFrame();
	const stampAt = (i: number) => hitAt + Math.round(i * HALF_BEAT * 30);
	const goldAt = stampAt(CHARS.length - 1) + Math.round(2 * HALF_BEAT * 30);
	const out = prog(f, dur - 14, 14, ease.inOut);
	let shake = 0;
	for (let i = 0; i < CHARS.length; i++) {
		const kk = f - stampAt(i);
		if (kk >= 0 && kk < 6) shake = Math.max(shake, (i === 0 ? 10 : 4) * Math.exp(-kk / 1.6));
	}
	const sx = shake * (random(`tsx${f}`) - 0.5);
	const sy = shake * (random(`tsy${f}`) - 0.5);
	const fall = Math.min(1, Math.max(0, f / Math.max(1, hitAt)));
	const cy = -160 + (880 + 160) * fall * fall;
	const motif = prog(f, hitAt + 10, 30, ease.out);
	const size = 140;
	const width = CHARS.length * size * 0.98;
	const gx = (i: number) => W / 2 - width / 2 + (i + 0.5) * (width / CHARS.length);
	const pour = prog(f, goldAt, 12, ease.inOut);
	const gloss = prog(f, goldAt + 16, 26, ease.inOut);
	const bloom = f >= goldAt ? 0.3 + 0.7 * Math.exp(-(f - goldAt) / 10) : 0;
	const land = f >= hitAt ? Math.exp(-(f - hitAt) / 7) : 0;
	const push = 1 + 0.1 * (1 - prog(f, 0, hitAt + 26, ease.out));
	// after landing the coin spins on its edge, slowing a little but never stopping
	const ph = f < hitAt ? f * 0.5 : hitAt * 0.5 + (f - hitAt) * (0.16 + 0.34 * Math.exp(-(f - hitAt) / 18));
	return (
		<AbsoluteFill style={{opacity: 1 - out}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
				<Q_DEFS />
				<defs>
					<radialGradient id="qt-light" cx="50%" cy="80%" r="70%">
						<stop offset="0" stopColor="#ffcf86" stopOpacity="0.22" />
						<stop offset="0.5" stopColor="#c8913a" stopOpacity="0.05" />
						<stop offset="1" stopColor="#000" stopOpacity="0" />
					</radialGradient>
					<radialGradient id="qt-bloom">
						<stop offset="0" stopColor="#ffe7b0" stopOpacity="0.55" />
						<stop offset="0.45" stopColor="#f1c56d" stopOpacity="0.18" />
						<stop offset="1" stopColor="#f1c56d" stopOpacity="0" />
					</radialGradient>
					<radialGradient id="brand-glow">
						<stop offset="0" stopColor="#ffe7b0" stopOpacity="0.9" />
						<stop offset="0.35" stopColor="#f1c56d" stopOpacity="0.35" />
						<stop offset="1" stopColor="#f1c56d" stopOpacity="0" />
					</radialGradient>
					<linearGradient id="qt-gold" x1="0" y1={470 - size * 0.8} x2="0" y2={470 + size * 0.2} gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#fff3cf" />
						<stop offset="0.45" stopColor="#f3cd7a" />
						<stop offset="0.7" stopColor="#c99140" />
						<stop offset="1" stopColor="#8a5a22" />
					</linearGradient>
					<linearGradient id="qt-gloss" x1={W / 2 - 900 + 1800 * gloss - 140} y1="0" x2={W / 2 - 900 + 1800 * gloss + 140} y2="0" gradientUnits="userSpaceOnUse">
						<stop offset="0" stopColor="#fff" stopOpacity="0" />
						<stop offset="0.5" stopColor="#fff" stopOpacity="0.8" />
						<stop offset="1" stopColor="#fff" stopOpacity="0" />
					</linearGradient>
					<clipPath id="qt-pour">
						<rect x={0} y={470 + 40 - (size + 60) * pour} width={W} height={size + 80} />
					</clipPath>
				</defs>
				<rect width={W} height={H} fill={JUNO.colors.night} />
				<rect width={W} height={H} fill="url(#qt-light)" opacity={1 + 1.4 * land} />
				<g transform={`translate(${sx},${sy}) translate(960,540) scale(${push}) translate(-960,-540)`}>
					{/* a dark tabletop edge catching the light */}
					<ellipse cx={960} cy={890} rx={760} ry={90} fill="#1a1410" opacity={0.9} />
					<ellipse cx={960} cy={890} rx={560} ry={150} fill="url(#qt-bloom)" opacity={0.5 + 1.4 * land} />
					<ellipse cx={960} cy={440} rx={640} ry={170} fill="url(#qt-bloom)" opacity={bloom} />
					{/* sparks from the edge striking the table */}
					{f >= hitAt && f < hitAt + 30
						? Array.from({length: 26}, (_, i) => {
								const t = f - hitAt;
								const a = -Math.PI * random(`sp${i}`);
								const v = 5 + random(`spv${i}`) * 10;
								return <circle key={i} cx={960 + Math.cos(a) * v * t * 1.6} cy={880 + Math.sin(a) * v * t * 0.8 + 0.25 * t * t} r={1.5 + random(`spr${i}`) * 2.5} fill={i % 3 ? GOLD : '#fff3cc'} opacity={0.85 * (1 - t / 30)} />;
							})
						: null}
					<g opacity={1 - motif}>
						<SpinCoin x={960} y={Math.min(cy, 880)} r={64} ph={ph} speed={f < hitAt ? 0.5 : 0.16 + 0.34 * Math.exp(-(f - hitAt) / 18)} />
					</g>
					<g transform="translate(960,836) scale(1.3)" opacity={motif}>
						<QubitMotif p={motif} f={f} gold={JUNO.colors.gold} />
					</g>
					{CHARS.map((ch, i) => {
						const kk = f - stampAt(i);
						if (kk < 0) return null;
						const press = kk < 3 ? 1.9 - 0.9 * (kk / 3) : kk < 6 ? 1 - 0.04 * Math.sin(((kk - 3) / 3) * Math.PI) : 1;
						return (
							<g key={i} transform={`translate(${gx(i)},470) scale(${press}) translate(${-gx(i)},-470)`}>
								<text x={gx(i)} y={470} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: size, fill: '#8a6534'}} opacity={kk < 1 ? 0.5 : 1 - 0.6 * pour}>
									{ch}
								</text>
								<text x={gx(i)} y={470} textAnchor="middle" clipPath="url(#qt-pour)" style={{fontFamily: font.serif, fontWeight: 900, fontSize: size, fill: 'url(#qt-gold)'}} opacity={pour > 0 ? 1 : 0}>
									{ch}
								</text>
								<text x={gx(i)} y={470} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: size, fill: 'url(#qt-gloss)'}} opacity={pour * (gloss > 0 && gloss < 1 ? 1 : 0)}>
									{ch}
								</text>
								{kk < 16
									? Array.from({length: 14}, (_, j) => {
											const a = random(`sd${i}${j}`) * Math.PI * 2;
											const d = kk * (4 + random(`sv${i}${j}`) * 7) * Math.exp(-kk / 12);
											return <circle key={j} cx={gx(i) + Math.cos(a) * d * 1.7} cy={440 + Math.sin(a) * d * 0.8} r={1.5 + random(`sz${i}${j}`) * 2.5} fill={j % 3 ? '#8a6534' : GOLD} opacity={0.85 * (1 - kk / 16)} />;
										})
									: null}
							</g>
						);
					})}
					<text x={W / 2} y={300} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 600, fontSize: 24, letterSpacing: '0.45em', fill: GOLD}} opacity={0.85 * prog(f, hitAt + 12, 18)}>
						{EPISODE.kicker}
					</text>
					<text x={W / 2} y={600 + 14 * (1 - prog(f, goldAt + 10, 16))} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 600, fontSize: 40, fill: INK, letterSpacing: '0.12em'}} opacity={prog(f, goldAt + 10, 16)}>
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

// ---------------------------------------------------------------- 2. the lab: the chandelier, the cold, the chip

const PLATES = [
	{y: 0, w: 300, t: '室温 · 300 K'},
	{y: 150, w: 250, t: '50 K'},
	{y: 290, w: 205, t: '4 K'},
	{y: 420, w: 165, t: '0.8 K'},
	{y: 540, w: 130, t: '0.1 K'},
	{y: 650, w: 96, t: '0.01 K'},
];

const Lab: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const tl = useTimeline();
	const D = scene.duration;
	const A = f + scene.from;
	const hitAt = Math.round((tl.music.markers.hit ?? scene.from) - scene.from);
	const titleLen = cue(0) - 8;
	const ZOOM = cue(3) + 4;
	const cam = camPath(
		[
			[titleLen - 24, 960, 120, 2.2],
			[cue(0) + 10, 960, 470, 0.94],
			[cue(1) - 6, 960, 450, 0.98],
			[cue(1) + 70, 1020, 760, 1.5],
			[cue(2) + 20, 1060, 800, 1.62],
			[ZOOM, 1000, 840, 2.2],
			[ZOOM + 34, CHIP.x, CHIP.y, 14],
			[D, CHIP.x, CHIP.y, 16],
		],
		f,
	);
	const lab = f < titleLen - 14 ? 0 : 1;
	// plate labels appear as the camera passes them on the way down
	const plateAt = (i: number) => cue(1) + 6 + i * 9;
	// the temperature readout: 300 K → 0.01 K on a log scale
	const temp = Math.pow(10, Math.log10(300) + (Math.log10(0.01) - Math.log10(300)) * prog(f, cue(1) + 6, 60, ease.inOut));
	const tempTxt = temp >= 10 ? temp.toFixed(0) : temp >= 1 ? temp.toFixed(1) : temp >= 0.1 ? temp.toFixed(2) : temp.toFixed(3);
	const readout = prog(f, cue(1) - 4, 14) * (1 - prog(f, ZOOM - 6, 12));
	const cmp = prog(f, cue(2) - 2, 16);
	const chip = prog(f, ZOOM + 18, 14);
	const lit = prog(f, ZOOM + 28, 60, ease.inOut);
	const callout = prog(f, cue(0) + 6, 16) * (1 - prog(f, cue(1) - 8, 10));
	return (
		<FullFrame
			fadeIn={0}
			fadeOut={0}
			overlay={
				<>
					<Sequence durationInFrames={titleLen + 14} layout="none">
						<QTitle dur={titleLen + 14} hitAt={hitAt} />
					</Sequence>
					<Screen>
						{/* the chandelier's name */}
						<g opacity={callout}>
							<line x1={830} y1={330} x2={600} y2={270} stroke={GOLD} strokeWidth={2} />
							<circle cx={830} cy={330} r={6} fill={GOLD} />
							<T x={585} y={258} size={44} serif fill={INK} anchor="end">
								稀释制冷机
							</T>
							<T x={585} y={304} size={24} fill={DIM} ls="0.16em" anchor="end">
								一层比一层冷 · 芯片在最底下
							</T>
						</g>
						{/* the readout */}
						<Panel x={1300} y={170} w={520} h={250} o={readout} accent={ICE}>
							<T x={1340} y={228} size={24} fill={ICE} ls="0.2em">
								芯片温度
							</T>
							<T x={1340} y={330} size={92} latin>
								{tempTxt}
								<tspan fontSize={50} dx={12}>
									K
								</tspan>
							</T>
							<T x={1340} y={388} size={30} fill={ICE} o={prog(f, cue(1) + 60, 12)}>
								= −273.14 ℃
							</T>
						</Panel>
						{/* colder than space */}
						<g opacity={cmp * (1 - prog(f, ZOOM - 6, 12))}>
							<Panel x={1300} y={450} w={520} h={190} accent={ICE}>
								<T x={1340} y={512} size={30} fill={DIM}>
									外太空
									<tspan dx={20} fill={INK} fontFamily={font.latin}>
										2.7 K
									</tspan>
								</T>
								<T x={1340} y={566} size={30} fill={DIM}>
									芯片
									<tspan dx={50} fill={ICE} fontFamily={font.latin}>
										0.01 K
									</tspan>
								</T>
								<g transform={`translate(1700,540) scale(${0.6 + 0.4 * pop(f, cue(2) + 14)})`} opacity={prog(f, cue(2) + 14, 6)}>
									<T x={0} y={18} size={56} anchor="middle" latin fill={ICE}>
										×270
									</T>
								</g>
							</Panel>
						</g>
						{/* the chip from above: 105 qubits */}
						<g opacity={chip}>
							<rect width={W} height={H} fill="#05070c" />
							<circle cx={960} cy={520} r={620} fill="url(#q-cold)" opacity={0.5} />
							<g transform={`translate(960,${500}) scale(${1.25 + 0.06 * prog(f, ZOOM + 18, 120, (x) => x)})`}>
								<ChipTop n={105} lit={lit} f={f} />
							</g>
							<T x={960} y={850} size={34} anchor="middle" fill={ICE} ls="0.2em" o={prog(f, ZOOM + 30, 14)}>
								WILLOW · {Math.round(105 * lit)} 个量子比特
							</T>
						</g>
					</Screen>
				</>
			}
		>
			<Q_DEFS />
			<g opacity={lab}>
				<LabSet f={A} cam={cam} chip={prog(f, cue(1) + 50, 30)}>
					<g transform="translate(960,150)">
						{PLATES.map((p, i) => (
							<g key={i} opacity={prog(f, plateAt(i), 12) * (1 - prog(f, ZOOM - 6, 12)) * Math.min(1, Math.max(0, ((150 + p.y - 540) * cam.zoom + 540 - cam.y - 130) / 60))}>
								<line x1={-p.w / 2 - 14} y1={p.y + 4} x2={-p.w / 2 - 70} y2={p.y + 4} stroke={i === 5 ? ICE : GOLD} strokeWidth={2} />
								<T x={-p.w / 2 - 82} y={p.y + 14} size={30} anchor="end" fill={i === 5 ? ICE : INK} latin={false}>
									{p.t}
								</T>
							</g>
						))}
					</g>
				</LabSet>
			</g>
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 3. bits: coins lying flat

const BYTE = '01000001';
const CR = 74; // a bit's coin radius on the table
const ROW_X = (i: number, n = 8, gap = 180) => 960 + (i - (n - 1) / 2) * gap;

/** A flat coin flipping over: t 0..1, face before and after. */
const Flip: React.FC<{x: number; y: number; r: number; t: number; from: '0' | '1'; to: '0' | '1'; gold?: boolean}> = ({x, y, r, t, from, to, gold}) => {
	if (t <= 0 || t >= 1) return <TableCoin x={x} y={y} r={r} face={t >= 1 ? to : from} gold={gold} />;
	const lift = Math.sin(Math.PI * t);
	return (
		<g transform={`translate(0,${-r * 1.6 * lift})`}>
			<TableCoin x={x} y={y} r={r} upright={lift * 0.9} spin={t < 0.5 ? (from === '1' ? 0 : Math.PI) : to === '1' ? 0 : Math.PI} face={t < 0.5 ? from : to} gold={gold} />
		</g>
	);
};

/** The field of bits (a phone's worth, schematically): rows of small flat coins receding on the table. */
const FIELD = (() => {
	const out: {x: number; y: number; r: number; b: number; seed: number}[] = [];
	for (let j = 0; j < 17; j++) {
		const s = 0.3 * Math.pow(1.13, j);
		const y = 430 + 210 * s;
		const gap = 180 * s;
		const n = Math.ceil(3600 / gap);
		for (let i = 0; i < n; i++) {
			const x = 960 + (i - (n - 1) / 2) * gap + (j % 2) * gap * 0.5;
			out.push({x, y, r: CR * s, b: random(`fb${i}-${j}`) > 0.5 ? 1 : 0, seed: random(`fs${i}-${j}`)});
		}
	}
	return out;
})();

const MiniFlat: React.FC<{x: number; y: number; r: number; face: number; flip?: number; o?: number}> = ({x, y, r, face, flip = 1, o = 1}) => (
	<g opacity={o}>
		<ellipse cx={x} cy={y + r * 0.06} rx={r * flip} ry={r * 0.32} fill="#5a606a" />
		<ellipse cx={x} cy={y} rx={r * flip} ry={r * 0.32} fill="url(#q-coin)" />
		{r > 13 && flip > 0.5 ? (
			<text x={x} y={y + r * 0.12} textAnchor="middle" transform={`translate(${x},${y}) scale(${flip},0.32) translate(${-x},${-y})`} style={{fontFamily: font.latin, fontWeight: 700, fontSize: r * 1.05, fill: '#2a2e36', ...NUM}}>
				{face}
			</text>
		) : null}
	</g>
);

const Bits: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const D = scene.duration;
	const cam = camPath(
		[
			[0, 960, 560, 1.5],
			[cue(0) + 30, 960, 600, 1.08],
			[cue(1) + 40, 990, 615, 1.16],
			[cue(2) - 6, 975, 610, 1.12],
			[cue(2) + 50, 960, 660, 0.62],
			[D, 960, 660, 0.58],
		],
		f,
	);
	const field = prog(f, cue(2) - 2, 40, ease.inOut);
	// line 2: the fourth coin flips 0 → 1 → 0 so the two faces are seen
	const flipA = prog(f, cue(1) + 20, 22, (x) => x);
	const flipB = prog(f, cue(1) + 60, 22, (x) => x);
	const heroFace = (i: number): '0' | '1' => (BYTE[i] === '1' ? '1' : '0');
	// line 4: everything flips, fast
	const fast = f >= cue(3) + 6;
	const tag = prog(f, cue(0) + 20, 14) * (1 - prog(f, cue(2) - 4, 12));
	const ram = prog(f, cue(2) + 34, 16);
	const speed = prog(f, cue(3) + 20, 16);
	return (
		<FullFrame
			fadeIn={14}
			fadeOut={0}
			overlay={
				<Screen>
					<g opacity={tag}>
						<T x={960} y={260} size={44} anchor="middle" serif>
							比特
							<tspan dx={18} fontFamily={font.latin} fill={GOLD} fontSize={40}>
								bit
							</tspan>
						</T>
						<T x={960} y={308} size={26} anchor="middle" fill={DIM} ls="0.3em" o={prog(f, cue(1), 14)}>
							不是 0，就是 1
						</T>
					</g>
					<g opacity={ram * (1 - prog(f, D - 12, 12))}>
						<Panel x={1240} y={130} w={580} h={200} accent={ICE}>
							<T x={1280} y={190} size={26} fill={ICE} ls="0.2em">
								一部手机 · 8 GB 内存
							</T>
							<T x={1280} y={280} size={70} latin>
								≈ 640亿
								<tspan fontSize={34} dx={14} fontFamily={font.sans} fill={DIM}>
									个比特
								</tspan>
							</T>
						</Panel>
						<g opacity={speed}>
							<Panel x={1240} y={350} w={580} h={120} accent={GOLD}>
								<T x={1280} y={428} size={34} fill={INK}>
									每秒翻
									<tspan fill={GOLD} fontFamily={font.latin} fontSize={46} dx={10}>
										几十亿
									</tspan>
									<tspan dx={10}>次</tspan>
								</T>
							</Panel>
						</g>
					</g>
				</Screen>
			}
		>
			<Q_DEFS />
			<CoinTable cam={cam}>
				{/* the field: hundreds of coins further out (a phone has billions) */}
				{field > 0
					? FIELD.map((c, i) => {
							if (Math.abs(c.y - TABLE_Y) < 18 && Math.abs(c.x - 960) < 760) return null;
							const ph = fast ? (f - cue(3) + c.seed * 400) / (18 + c.seed * 22) : 0;
							const flipping = fast ? Math.abs(Math.cos(ph * Math.PI)) : 1;
							const face = fast ? (Math.floor(ph) + c.b) % 2 : c.b;
							return <MiniFlat key={i} x={c.x} y={c.y} r={c.r} face={face} flip={Math.max(0.1, flipping)} o={field * Math.min(1, (field * 2.2 - c.seed * 0.8) * 1.6)} />;
						})
					: null}
				{BYTE.split('').map((b, i) => {
					const at = cue(0) - 6 + i * 4;
					const drop = prog(f, at, 14, ease.out);
					if (drop <= 0) return null;
					const x = ROW_X(i);
					if (fast) {
						const ph = (f - cue(3) + i * 7) / 13;
						const t = ph - Math.floor(ph);
						const n = Math.floor(ph);
						const from: '0' | '1' = (n + Number(b)) % 2 ? '1' : '0';
						const to: '0' | '1' = from === '1' ? '0' : '1';
						return <Flip key={i} x={x} y={TABLE_Y} r={CR} t={Math.min(1, t * 1.6)} from={from} to={to} />;
					}
					if (i === 3) {
						if (flipB > 0) return <Flip key={i} x={x} y={TABLE_Y} r={CR} t={flipB} from="1" to="0" />;
						return <Flip key={i} x={x} y={TABLE_Y} r={CR} t={flipA} from="0" to="1" />;
					}
					return (
						<g key={i} transform={`translate(0,${-120 * (1 - drop)})`} opacity={Math.min(1, drop * 3)}>
							<TableCoin x={x} y={TABLE_Y} r={CR} face={heroFace(i)} />
						</g>
					);
				})}
			</CoinTable>
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 4. the qubit: a coin that keeps spinning

const Qubit: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const D = scene.duration;
	const LOOK = cue(4) + 26; // "一旦去看它" → the flash
	const cam = camPath(
		[
			[0, 960, 640, 0.9],
			[cue(0) + 10, 960, 600, 1.15],
			[cue(1) + 30, 960, 560, 1.5],
			[cue(2) + 40, 960, 540, 1.6],
			[cue(3) + 30, 960, 560, 1.4],
			[LOOK, 960, 560, 1.5],
			[D, 960, 590, 1.62],
		],
		f,
	);
	const set = prog(f, cue(0) - 4, 16, ease.out);
	// spin speed (rad / frame): wound up on line 2, flat out on line 3, stopped by the look
	const sp = (t: number) => (t < cue(0) ? 0.06 : t < cue(1) ? 0.06 + 0.12 * prog(t, cue(0), 40) : 0.18 + 0.4 * prog(t, cue(1), 50, ease.inOut));
	let ph = 0;
	for (let t = 0; t < Math.min(f, LOOK); t++) ph += sp(t);
	const k = f - LOOK;
	const flash = k >= 0 ? Math.exp(-k / 5) : 0;
	const fall = prog(k, 0, 9, ease.in);
	const bounce = k >= 9 && k < 22 ? 14 * Math.sin(((k - 9) / 13) * Math.PI) * Math.exp(-(k - 9) / 8) : 0;
	const others = 1 - prog(f, 0, 30);
	const lamp = 1 - 0.55 * prog(f, 6, 30) + 0.4 * prog(f, cue(0), 20);
	const notTags = prog(f, cue(2) + 16, 14) * (1 - prog(f, cue(3) - 4, 12));
	const word = prog(f, cue(3) - 2, 16) * (1 - prog(f, LOOK - 6, 10));
	const result = prog(k, 14, 14);
	return (
		<FullFrame
			fadeIn={0}
			fadeOut={0}
			overlay={
				<Screen>
					{/* neither 0 nor 1 */}
					{['0', '1'].map((d, i) => {
						const x = i ? 1340 : 580;
						return (
							<g key={d} opacity={notTags} transform={`translate(${x},430) scale(${0.8 + 0.2 * pop(f, cue(2) + 16 + i * 6)})`}>
								<circle r={70} fill="#060a12" opacity={0.7} stroke={DIM} strokeWidth={2} />
								<T x={0} y={30} size={88} anchor="middle" latin fill={DIM}>
									{d}
								</T>
								<line x1={-56} y1={56} x2={56} y2={-56} stroke={RED} strokeWidth={8} strokeLinecap="round" strokeDasharray={160} strokeDashoffset={160 * (1 - prog(f, cue(2) + 34 + i * 6, 8))} />
							</g>
						);
					})}
					<g opacity={word} transform={`translate(960,200) scale(${0.85 + 0.15 * pop(f, cue(3) - 2)})`}>
						<T x={0} y={0} size={110} anchor="middle" serif fill={GOLD} ls="0.12em">
							叠加
						</T>
						<T x={0} y={50} size={26} anchor="middle" latin fill={DIM} ls="0.5em">
							SUPERPOSITION
						</T>
					</g>
					<g opacity={result * (1 - prog(f, D - 10, 10))}>
						<T x={960} y={220} size={40} anchor="middle" fill={INK} ls="0.2em">
							一看
							<tspan dx={14} fill={GOLD}>
								→ 停成
							</tspan>
							<tspan dx={14} fontFamily={font.latin} fontSize={60} fill={GOLD}>
								1
							</tspan>
						</T>
						<T x={960} y={270} size={24} anchor="middle" fill={DIM} ls="0.3em">
							（也可能是 0，随机的）
						</T>
					</g>
					<rect width={W} height={H} fill="#fff8e6" opacity={0.85 * flash} />
				</Screen>
			}
		>
			<Q_DEFS />
			<CoinTable cam={cam} lamp={lamp}>
				<g opacity={others}>
					{BYTE.split('').map((b, i) => (
						<TableCoin key={i} x={ROW_X(i)} y={TABLE_Y + 30 * (1 - others)} r={CR} face={b === '1' ? '1' : '0'} />
					))}
				</g>
				<circle cx={960} cy={TABLE_Y - 60} r={260} fill="url(#q-warm)" opacity={0.7 * set} />
				{set > 0 ? (
					k < 0 ? (
						<g opacity={Math.min(1, set * 2)} transform={`translate(0,${-40 * (1 - set)})`}>
							<SpinCoin x={960} y={TABLE_Y} r={110} ph={ph} speed={sp(f)} />
						</g>
					) : (
						<g transform={`translate(0,${-bounce})`}>
							<TableCoin x={960} y={TABLE_Y} r={110} upright={1 - fall} spin={0} face="1" gold />
						</g>
					)
				) : null}
			</CoinTable>
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 5. many coins

/** 300 coins in perspective on the table (20 × 15). */
const MANY = (() => {
	const out: {x: number; y: number; r: number; seed: number; b: number}[] = [];
	for (let j = 0; j < 15; j++) {
		const s = 0.42 * Math.pow(1.085, j);
		const y = 430 + 210 * s;
		const gap = 96 * s;
		for (let i = 0; i < 20; i++) out.push({x: 960 + (i - 9.5) * gap, y, r: 36 * s, seed: random(`m${i}-${j}`), b: random(`mb${i}-${j}`) > 0.5 ? 1 : 0});
	}
	return out;
})();

/** a cheap spinning coin for the crowd: one phase plus a soft halo */
const CrowdCoin: React.FC<{x: number; y: number; r: number; ph: number; fallen?: number; face?: number}> = ({x, y, r, ph, fallen = 0, face = 0}) => {
	if (fallen >= 1) return <MiniFlatGold x={x} y={y} r={r} face={face} />;
	const w = Math.max(0.1, Math.abs(Math.cos(ph)));
	const up = 1 - fallen;
	const rx = r * (w * up + fallen);
	const ry = r * (up + 0.32 * fallen);
	return (
		<g>
			<ellipse cx={x} cy={y + 2} rx={r * 0.8} ry={r * 0.15} fill="#000" opacity={0.4} />
			<ellipse cx={x} cy={y - r * up} rx={r * up} ry={r * up} fill="#ffd98a" opacity={0.13 * up} />
			<ellipse cx={x} cy={y - ry} rx={rx} ry={ry} fill="url(#q-coin-gold)" />
		</g>
	);
};

const MiniFlatGold: React.FC<{x: number; y: number; r: number; face: number}> = ({x, y, r, face}) => (
	<g>
		<ellipse cx={x} cy={y + r * 0.06} rx={r} ry={r * 0.32} fill="#7a5418" />
		<ellipse cx={x} cy={y} rx={r} ry={r * 0.32} fill="url(#q-coin-gold)" />
		{r > 12 ? (
			<text x={x} y={y + r * 0.12} textAnchor="middle" transform={`translate(${x},${y}) scale(1,0.32) translate(${-x},${-y})`} style={{fontFamily: font.latin, fontWeight: 700, fontSize: r * 1.05, fill: '#6a4310', ...NUM}}>
				{face}
			</text>
		) : null}
	</g>
);

/** binary tags floating above the coins (all the combinations, glowing at once) */
const TAGS = Array.from({length: 70}, (_, i) => ({
	x: 120 + random(`tx${i}`) * 1680,
	y: 90 + random(`ty${i}`) * 520,
	s: 0.6 + random(`ts${i}`) * 0.8,
	txt: Array.from({length: 10}, (_, k) => (random(`tb${i}-${k}`) > 0.5 ? '1' : '0')).join(''),
	d: random(`td${i}`),
}));

const Many: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const D = scene.duration;
	const A = f + scene.from;
	const cam = camPath(
		[
			[0, 960, 590, 1.62],
			[cue(0) + 10, 960, 560, 1.4],
			[cue(1) - 4, 960, 560, 1.28],
			[cue(1) + 30, 960, 600, 1.0],
			[cue(2) + 40, 960, 600, 0.92],
			[cue(3), 960, 580, 0.95],
			[D, 960, 560, 1.12],
		],
		f,
	);
	const two = prog(f, cue(0) - 6, 14) * (1 - prog(f, cue(1) - 2, 12));
	const ten = prog(f, cue(1) - 2, 14) * (1 - prog(f, cue(2) - 2, 14));
	const crowd = prog(f, cue(2) - 4, 24, ease.inOut);
	const tagsAll = prog(f, cue(3) - 4, 30);
	const tense = prog(f, cue(4), D - cue(4), (x) => x * x);
	const spinRate = 0.26 + 0.16 * tense;
	// overlays
	const combos = ['00', '01', '10', '11'];
	const count10 = Math.round(Math.pow(2, 10 * prog(f, cue(1) + 6, 30)));
	const atoms = prog(f, cue(2) + 30, 14);
	return (
		<FullFrame
			fadeIn={14}
			fadeOut={0}
			overlay={
				<Screen>
					<g opacity={two}>
						{combos.map((c, i) => {
							const a = cue(0) + 30 + i * 8;
							return (
								<g key={c} opacity={prog(f, a, 8)} transform={`translate(${660 + i * 200},230) scale(${0.7 + 0.3 * pop(f, a)})`}>
									<rect x={-74} y={-50} width={148} height={84} rx={14} fill="#1b140a" stroke={GOLD} strokeWidth={2} opacity={0.9} />
									<T x={0} y={14} size={50} anchor="middle" latin fill={GOLD}>
										{c}
									</T>
								</g>
							);
						})}
						<T x={960} y={340} size={28} anchor="middle" fill={DIM} ls="0.3em" o={prog(f, cue(0) + 70, 14)}>
							4 种组合 · 同时都在
						</T>
					</g>
					<g opacity={ten}>
						<T x={960} y={250} size={110} anchor="middle" latin fill={GOLD}>
							{count10.toLocaleString('en-US')}
						</T>
						<T x={960} y={310} size={30} anchor="middle" fill={DIM} ls="0.3em">
							种组合 · 10 枚硬币
						</T>
					</g>
					<g opacity={crowd * (1 - tagsAll)}>
						<Panel x={560} y={110} w={800} h={210} accent={GOLD}>
							<T x={610} y={190} size={46} fill={INK}>
								300 枚：
								<tspan fontFamily={font.latin} fill={GOLD} fontSize={64} dx={10}>
									2³⁰⁰ ≈ 10⁹⁰
								</tspan>
								<tspan dx={10}>种</tspan>
							</T>
							<T x={610} y={270} size={34} fill={DIM} o={atoms}>
								宇宙里的原子：约
								<tspan fontFamily={font.latin} fill={INK} fontSize={44} dx={10}>
									10⁸⁰
								</tspan>
								<tspan dx={6}>个</tspan>
							</T>
						</Panel>
					</g>
					{/* every combination at once, glowing */}
					{tagsAll > 0
						? TAGS.map((t, i) => {
								const o = Math.min(1, Math.max(0, tagsAll * 2.4 - t.d * 1.4)) * (0.45 + 0.35 * Math.sin(f / 7 + i));
								return (
									<T key={i} x={t.x + 10 * Math.sin((f + i * 20) / 40)} y={t.y - ((f * (0.2 + 0.3 * t.d)) % 60)} size={26 * t.s} latin fill={GOLD} o={o} anchor="middle">
										{t.txt}
									</T>
								);
							})
						: null}
					<g opacity={prog(f, cue(4) + 4, 14)} transform={`translate(960,${300})`}>
						<rect x={-440} y={-80} width={880} height={130} rx={18} fill="#05060b" opacity={0.7} />
						<T x={0} y={14} size={60} anchor="middle" serif fill={INK} ls="0.08em">
							所有答案，同时算一遍？
						</T>
					</g>
					<rect width={W} height={H} fill="url(#vignette-hard)" opacity={0.9 * tense} />
				</Screen>
			}
		>
			<Q_DEFS />
			<CoinTable cam={cam} lamp={1 - 0.3 * crowd}>
				<g opacity={two}>
					{[0, 1].map((i) => (
						<SpinCoin key={i} x={820 + i * 280} y={TABLE_Y} r={90} ph={A * 0.45 + i * 1.3} speed={0.45} />
					))}
				</g>
				<g opacity={ten}>
					{Array.from({length: 10}, (_, i) => (
						<SpinCoin key={i} x={ROW_X(i, 10, 125)} y={TABLE_Y} r={48} ph={A * 0.45 + i * 0.9} speed={0.45} />
					))}
				</g>
				{crowd > 0 ? (
					<g opacity={crowd}>
						{MANY.map((c, i) => (
							<CrowdCoin key={i} x={c.x} y={c.y} r={c.r} ph={A * spinRate + c.seed * 9} />
						))}
					</g>
				) : null}
			</CoinTable>
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 6. reveal: no. interference.

const RAND1 = '0110100111';
const RAND2 = '1101001010';

/** a readout that rolls random digits and lands on `final` at frame `at` */
const Roll: React.FC<{f: number; start: number; at: number; final: string; x: number; y: number; size: number}> = ({f, start, at, final, x, y, size}) => {
	if (f < start) return null;
	const txt = f >= at ? final : final.split('').map((_, k) => (random(`roll${Math.floor(f / 2)}-${k}`) > 0.5 ? '1' : '0')).join('');
	const land = f >= at ? pop(f, at, 10) : 0;
	return (
		<g transform={`translate(${x},${y}) scale(${1 + 0.12 * (1 - land) * (f >= at ? 1 : 0)})`}>
			<T x={0} y={0} size={size} anchor="middle" latin fill={f >= at ? GOLD : DIM} ls="0.12em">
				{txt}
			</T>
		</g>
	);
};

/** noise-cancelling headphones (a simple line drawing) */
const Headphones: React.FC = () => (
	<g fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round">
		<path d="M-120,40 L-120,-10 A120,120 0 0 1 120,-10 L120,40" />
		<rect x={-150} y={20} width={56} height={110} rx={24} fill="#1a2232" />
		<rect x={94} y={20} width={56} height={110} rx={24} fill="#1a2232" />
	</g>
);

const AMPS0 = Array.from({length: 16}, () => 0.25);
const GOLD_I = 11;

const Reveal: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const D = scene.duration;
	const A = f + scene.from;
	const WAVE = cue(2) - 10; // cut to the wave tank
	// part 1: the crowd falls flat on the drop
	const camA = camPath(
		[
			[0, 960, 560, 1.12],
			[24, 960, 600, 0.98],
			[WAVE, 960, 620, 1.05],
		],
		f,
	);
	const shake = f < 10 ? 12 * Math.exp(-f / 2.5) : 0;
	const flash = Math.exp(-f / 4);
	const partA = 1 - prog(f, WAVE, 12, ease.inOut);
	const partB = prog(f, WAVE, 12, ease.inOut);
	const heard = cue(5); // headphones
	const bars = cue(6) - 6;
	// wave phase: in step on line 4, out of step on line 5, headphones keep it out of step
	const phase = Math.PI * prog(f, cue(4) - 4, 30, ease.inOut);
	const wavesOut = prog(f, bars - 10, 14);
	const wavesP = prog(f, cue(2) + 14, 70, ease.inOut);
	// answer bars: wrong ones cancel (line 7), the right one grows (line 8), then we look
	const cancel = prog(f, cue(6) + 10, 50, ease.inOut);
	const grow = prog(f, cue(7) + 6, 40, ease.inOut);
	const LOOK = cue(7) + 70;
	const amps = AMPS0.map((a, i) => (i === GOLD_I ? a + 0.75 * grow : a * (1 - 0.92 * cancel)));
	return (
		<FullFrame
			fadeIn={0}
			fadeOut={10}
			overlay={
				<Screen>
					<rect width={W} height={H} fill="#fff8e6" opacity={0.5 * flash * partA} />
					{/* part 1: look, and you get one random answer */}
					<g opacity={partA * prog(f, cue(1) + 10, 12)}>
						<Panel x={560} y={140} w={800} h={190} accent={GOLD}>
							<T x={960} y={198} size={26} anchor="middle" fill={DIM} ls="0.3em">
								看一眼 · 得到
							</T>
							<Roll f={f} start={cue(1) + 14} at={cue(1) + 44} final={RAND1} x={960} y={292} size={76} />
						</Panel>
						<g opacity={prog(f, cue(1) + 70, 12)}>
							<Panel x={660} y={350} w={600} h={110} accent={DIM}>
								<T x={720} y={420} size={28} fill={DIM}>
									再来一次：
								</T>
								<Roll f={f} start={cue(1) + 72} at={cue(1) + 96} final={RAND2} x={1090} y={424} size={44} />
							</Panel>
						</g>
					</g>
				</Screen>
			}
		>
			<Q_DEFS />
			{partA > 0 ? (
				<g opacity={partA} transform={`translate(${shake * (random(`rx${f}`) - 0.5)},${shake * (random(`ry${f}`) - 0.5)})`}>
					<CoinTable cam={camA} lamp={0.7}>
						{MANY.map((c, i) => {
							const fl = prog(f, Math.floor(c.seed * 4), 6, ease.in);
							return <CrowdCoin key={i} x={c.x} y={c.y} r={c.r} ph={A * 0.26 + c.seed * 9} fallen={fl} face={c.b} />;
						})}
					</CoinTable>
				</g>
			) : null}
			{partB > 0 ? (
				<g opacity={partB}>
					<rect width={W} height={H} fill="#060c18" />
					<circle cx={960} cy={540} r={900} fill="url(#q-cold)" opacity={0.35} />
					{/* the name */}
					<g transform={`translate(960,${150}) scale(${0.85 + 0.15 * pop(f, cue(2) - 2)})`} opacity={prog(f, cue(2) - 2, 12)}>
						<T x={0} y={0} size={84} anchor="middle" serif fill={GOLD} ls="0.12em">
							干涉
						</T>
						<T x={0} y={44} size={24} anchor="middle" latin fill={DIM} ls="0.5em">
							INTERFERENCE
						</T>
					</g>
					{/* the waves */}
					<g opacity={prog(f, cue(2) + 14, 14) * (1 - wavesOut)} transform="translate(960,560)">
						<Waves phase={phase} p={wavesP} w={1200} />
						<T x={-640} y={-160} size={26} anchor="end" fill={ICE}>
							{f >= heard ? '噪音' : '波'}
						</T>
						<T x={-640} y={-10} size={26} anchor="end" fill="#ff9a7a">
							{f >= heard ? '反向声波' : '波'}
						</T>
						<T x={-640} y={170} size={26} anchor="end" fill={GOLD}>
							{f >= heard ? '安静' : '合起来'}
						</T>
						<g opacity={prog(f, cue(3) + 50, 12) * (1 - prog(f, cue(4) - 6, 8))}>
							<T x={660} y={170} size={30} fill={GOLD}>
								更高
							</T>
						</g>
						<g opacity={prog(f, cue(4) + 30, 12)}>
							<T x={660} y={170} size={30} fill={GOLD}>
								抵消
							</T>
						</g>
						<g opacity={prog(f, heard - 4, 16)} transform="translate(800,-110) scale(0.62)">
							<Headphones />
						</g>
					</g>
					{/* the answers: wrong ones cancel, the right one builds up, then we look */}
					<g opacity={prog(f, bars, 16)} transform="translate(960,760)">
						<AnswerBars amps={amps} gold={GOLD_I} pick={f >= LOOK ? GOLD_I : -1} />
						<T x={0} y={-420} size={30} anchor="middle" fill={DIM} ls="0.24em" o={1 - grow}>
							16 个可能的答案
						</T>
						<g opacity={prog(f, LOOK, 10)}>
							<T x={0} y={-420} size={40} anchor="middle" fill={GOLD} ls="0.12em">
								再看一眼 → 1011 ✓
							</T>
						</g>
					</g>
					<rect width={W} height={H} fill="#fff8e6" opacity={f >= LOOK ? 0.5 * Math.exp(-(f - LOOK) / 4) : 0} />
				</g>
			) : null}
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 7. not a faster computer

/** three small icons: chat, video, game */
const AppIcon: React.FC<{k: number}> = ({k}) => (
	<g fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round">
		{k === 0 ? <path d="M-50,-34 h100 a14,14 0 0 1 14,14 v40 a14,14 0 0 1 -14,14 h-58 l-24,20 v-20 h-18 a14,14 0 0 1 -14,-14 v-40 a14,14 0 0 1 14,-14 z" /> : null}
		{k === 1 ? (
			<>
				<rect x={-62} y={-42} width={124} height={84} rx={16} />
				<path d="M-14,-20 L22,0 L-14,20 Z" fill={INK} />
			</>
		) : null}
		{k === 2 ? (
			<>
				<path d="M-60,-24 h120 a26,26 0 0 1 26,30 l-8,30 a18,18 0 0 1 -30,6 l-16,-18 h-64 l-16,18 a18,18 0 0 1 -30,-6 l-8,-30 a26,26 0 0 1 26,-30 z" />
				<path d="M-40,-6 v20 M-50,4 h20" />
				<circle cx={36} cy={0} r={4} fill={INK} />
				<circle cx={50} cy={12} r={4} fill={INK} />
			</>
		) : null}
	</g>
);

const Why: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const D = scene.duration;
	const A = f + scene.from;
	const accent = useAccent();
	const SLAM = accent(cue(0));
	const cam = camPath(
		[
			[0, 960, 520, 1.3],
			[SLAM, 960, 480, 1.0],
			[D, 960, 470, 1.08],
		],
		f,
	);
	const k = f - SLAM;
	const slam = k >= 0 ? spring({frame: k, fps: 30, config: {damping: 12, stiffness: 200}}) : 0;
	const shake = k >= 0 && k < 8 ? 8 * Math.exp(-k / 2.2) : 0;
	const strike = prog(f, SLAM + 10, 10);
	const dimLab = prog(f, 0, 16);
	const up = prog(f, cue(1) - 6, 16, ease.inOut);
	const out = 1 - prog(f, D - 12, 12);
	return (
		<FullFrame
			fadeIn={10}
			fadeOut={0}
			overlay={
				<Screen>
					<g opacity={out} transform={`translate(${shake * (random(`wx${f}`) - 0.5)},${shake * (random(`wy${f}`) - 0.5)})`}>
						<g opacity={Math.min(1, Math.max(0, k) / 3)} transform={`translate(960,${300 - 90 * up}) scale(${(1.4 - 0.4 * slam) * (1 - 0.25 * up)})`}>
							<rect x={-440} y={-100} width={880} height={160} rx={20} fill="#07080c" opacity={0.65} />
							<T x={0} y={14} size={96} anchor="middle" serif fill={INK} ls="0.08em">
								“更快的电脑”
							</T>
							<line x1={-380} y1={-14} x2={-380 + 760 * strike} y2={-14} stroke={RED} strokeWidth={10} strokeLinecap="round" />
						</g>
						<g opacity={up} transform={`translate(960,${400 + 20 * (1 - up)})`}>
							<T x={0} y={0} size={56} anchor="middle" serif fill={GOLD} ls="0.08em">
								某些题：快得不可思议
							</T>
						</g>
						{[0, 1, 2].map((i) => {
							const a = cue(2) + 4 + i * 10;
							const x = 960 + (i - 1) * 300;
							const xo = prog(f, a + 14, 8);
							return (
								<g key={i} opacity={prog(f, a, 10)} transform={`translate(${x},${600}) scale(${0.8 + 0.2 * pop(f, a)})`}>
									<circle r={100} fill="#0a0e16" opacity={0.75} stroke="#2a3446" strokeWidth={3} />
									<AppIcon k={i} />
									<T x={0} y={150} size={32} anchor="middle" fill={DIM}>
										{['聊天', '刷视频', '打游戏'][i]}
									</T>
									<g opacity={xo}>
										<circle cx={70} cy={-70} r={28} fill={RED} />
										<path d="M58,-82 L82,-58 M82,-82 L58,-58" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
									</g>
								</g>
							);
						})}
					</g>
				</Screen>
			}
		>
			<Q_DEFS />
			<LabSet f={A} cam={cam} light={0.6} chip={0.6} />
			<rect width={W} height={H} fill="#05060b" opacity={0.72 * dimLab} />
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 7b. what it's for, and how far

const UseCard: React.FC<{x: number; y: number; t: number; title: string; sub: string; children: React.ReactNode}> = ({x, y, t, title, sub, children}) => {
	if (t <= 0) return null;
	const sp = spring({frame: t, fps: 30, config: {damping: 14, stiffness: 140}});
	return (
		<g opacity={Math.min(1, t / 5)} transform={`translate(${x},${y + 40 * (1 - sp)})`}>
			<rect x={-190} y={-210} width={380} height={420} rx={22} fill="#0a0e16" opacity={0.85} stroke="rgba(241,197,109,0.4)" strokeWidth={2} />
			<g transform="translate(0,-50)">{children}</g>
			<T x={0} y={130} size={44} anchor="middle" serif fill={INK}>
				{title}
			</T>
			<T x={0} y={176} size={26} anchor="middle" fill={DIM} ls="0.14em">
				{sub}
			</T>
		</g>
	);
};

/** the road: log scale from 10 to 10^6 qubits */
const ROAD = {x0: 260, x1: 1660, y: 640};
const roadX = (n: number) => ROAD.x0 + ((Math.log10(n) - 1) / 5) * (ROAD.x1 - ROAD.x0);

const Uses: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const D = scene.duration;
	const A = f + scene.from;
	const accent = useAccent();
	const C0 = accent(cue(0));
	const cam = camPath(
		[
			[0, 960, 470, 1.08],
			[cue(2), 980, 520, 1.16],
			[D, 1000, 560, 1.26],
		],
		f,
	);
	const cardsOut = prog(f, cue(2) - 10, 16, ease.inOut);
	const road = prog(f, cue(2) - 2, 30, ease.inOut);
	const flag = prog(f, cue(2) + 24, 14);
	const today = prog(f, cue(3) + 6, 14);
	const stamp = prog(f, cue(4) + 6, 10);
	const go = prog(f, cue(4) + 44, 60, ease.inOut);
	const out = 1 - prog(f, D - 12, 12);
	const ticks: [number, string][] = [
		[10, '10'],
		[100, '100'],
		[1e3, '1000'],
		[1e4, '1万'],
		[1e5, '10万'],
		[1e6, '100万'],
	];
	return (
		<FullFrame
			fadeIn={0}
			fadeOut={0}
			overlay={
				<Screen>
					<g opacity={(1 - cardsOut) * out} transform={`translate(0,${-60 * cardsOut})`}>
						<UseCard x={560} y={480} t={f - C0} title="新药" sub="模拟分子">
							<Molecule f={f} />
						</UseCard>
						<UseCard x={960} y={480} t={f - C0 - 12} title="新电池" sub="模拟材料">
							<Battery charge={0.3 + 0.6 * prog(f, C0 + 20, 60, ease.inOut)} />
						</UseCard>
						<UseCard x={1360} y={480} t={f - cue(1) + 2} title="破解密码" sub="分解大数">
							<Padlock open={prog(f, cue(1) + 44, 16, ease.back)} />
						</UseCard>
					</g>
					<g opacity={road * out}>
						<T x={960} y={250} size={42} anchor="middle" fill={INK} ls="0.16em">
							需要多少个量子比特？
							<tspan dx={20} fontSize={24} fill="rgba(243,237,226,0.4)">
								（每格 ×10）
							</tspan>
						</T>
						{/* the road */}
						<line x1={ROAD.x0} y1={ROAD.y} x2={ROAD.x0 + (ROAD.x1 - ROAD.x0) * road} y2={ROAD.y} stroke="#2a3446" strokeWidth={16} strokeLinecap="round" />
						<line x1={roadX(105)} y1={ROAD.y} x2={roadX(105) + (ROAD.x1 - roadX(105)) * go} y2={ROAD.y} stroke={GOLD} strokeWidth={6} strokeLinecap="round" strokeDasharray="18 14" opacity={0.9} />
						{ticks.map(([n, l], i) => (
							<g key={n} opacity={prog(f, cue(2) + 4 + i * 4, 10)}>
								<line x1={roadX(n)} y1={ROAD.y - 22} x2={roadX(n)} y2={ROAD.y + 22} stroke="#5a6a80" strokeWidth={3} />
								<T x={roadX(n)} y={ROAD.y + 74} size={36} anchor="middle" latin={i < 3} fill={DIM}>
									{l}
								</T>
							</g>
						))}
						{/* the goal */}
						<g opacity={flag} transform={`translate(${roadX(1e6)},${ROAD.y})`}>
							<line x1={0} y1={0} x2={0} y2={-150} stroke={INK} strokeWidth={4} />
							<path d={`M0,-150 L${70 * flag},-130 L0,-110 Z`} fill={RED} />
							<T x={0} y={-176} size={36} anchor="middle" fill={INK}>
								约 100 万个
							</T>
							<T x={0} y={-222} size={28} anchor="middle" fill={DIM}>
								破解常用密码
							</T>
						</g>
						{/* today */}
						<g opacity={today} transform={`translate(${roadX(105)},${ROAD.y})`}>
							<circle r={20 + 4 * Math.sin(f / 6)} fill={GOLD} opacity={0.3} />
							<circle r={14} fill={GOLD} />
							<T x={0} y={-50} size={40} anchor="middle" fill={GOLD}>
								今天 ≈ 100
							</T>
						</g>
						{/* the benchmark was useless; the road is real */}
						<g opacity={stamp} transform={`translate(${roadX(105) + 40},${ROAD.y + 190}) rotate(-3) scale(${0.8 + 0.2 * pop(f, cue(4) + 6)})`}>
							<rect x={-10} y={-44} width={520} height={64} rx={8} fill="none" stroke={DIM} strokeWidth={3} />
							<T x={250} y={0} size={28} anchor="middle" fill={DIM}>
								谷歌那道题：本身没有用处
							</T>
						</g>
						<g opacity={prog(f, cue(4) + 50, 14)}>
							<T x={roadX(3e3)} y={ROAD.y - 50} size={44} anchor="middle" serif fill={GOLD}>
								路走得通 →
							</T>
						</g>
					</g>
				</Screen>
			}
		>
			<Q_DEFS />
			<defs>
				<filter id="uses-soft" x="-5%" y="-5%" width="110%" height="110%">
					<feGaussianBlur stdDeviation={6} />
				</filter>
			</defs>
			<g filter="url(#uses-soft)">
				<LabSet f={A} cam={cam} light={0.5} chip={0.5} />
			</g>
			<rect width={W} height={H} fill="#05060b" opacity={0.76} />
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 8. three takeaways, on screen

const TIPS: [string, string][] = [
	['不是什么题', '都快'],
	['靠的是干涉', '不是同时试所有答案'],
	['离真正有用', '还有一段路'],
];

const TipCards: React.FC<{f: number; cues: number[]; out: number}> = ({f, cues, out}) => {
	const leave = prog(f, out, 12, ease.in);
	const head = prog(f, cues[0] - 8, 14, ease.out);
	if (head <= 0) return null;
	return (
		<g opacity={1 - leave} transform={`translate(0,${-30 * leave})`}>
			<g opacity={head} transform={`translate(0,${16 * (1 - head)})`}>
				<text x={960} y={250} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 52, fill: INK, letterSpacing: '0.18em'}}>
					关于量子计算机，记住三件事：
				</text>
				<line x1={960 - 220 * head} y1={286} x2={960 + 220 * head} y2={286} stroke={GOLD} strokeWidth={2} opacity={0.8} />
			</g>
			{TIPS.map(([a, b], i) => {
				const t = f - cues[i + 1] + 2;
				if (t < 0) return null;
				const sp = spring({frame: t, fps: 30, config: {damping: 13, stiffness: 140}});
				const y = 410 + i * 150;
				const ring = prog(t, 0, 12, ease.out);
				return (
					<g key={i} opacity={Math.min(1, t / 4)} transform={`translate(${-70 * (1 - sp)},0)`}>
						<circle cx={540} cy={y - 16} r={44} fill="none" stroke={GOLD} strokeWidth={3} strokeDasharray={280} strokeDashoffset={280 * (1 - ring)} />
						<text x={540} y={y + 2} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 52, fill: GOLD, ...NUM}}>
							{i + 1}
						</text>
						<text x={620} y={y} style={{fontFamily: font.serif, fontWeight: 700, fontSize: 56, fill: INK, letterSpacing: '0.06em'}}>
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

const Tips: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const D = scene.duration;
	const A = f + scene.from;
	const cam = camPath(
		[
			[0, 1000, 560, 1.26],
			[D, 960, 520, 1.0],
		],
		f,
	);
	const dim = prog(f, cue(0) - 14, 14, ease.inOut) * (1 - prog(f, D - 18, 14, ease.inOut));
	return (
		<FullFrame fadeIn={0} fadeOut={0}>
			<Q_DEFS />
			<defs>
				<filter id="tips-soft" x="-5%" y="-5%" width="110%" height="110%">
					<feGaussianBlur stdDeviation={7 * dim} />
				</filter>
			</defs>
			<g filter={dim > 0.02 ? 'url(#tips-soft)' : undefined}>
				<LabSet f={A} cam={cam} light={0.7} chip={0.6} />
			</g>
			<rect width={W} height={H} fill="#05060b" opacity={0.68 - 0.1 * dim + 0.0} />
			<TipCards f={f} cues={[cue(0), cue(1), cue(2), cue(3)]} out={D - 22} />
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 9. callback: the coin is still spinning

const Callback: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const D = scene.duration;
	const A = f + scene.from;
	const endAt = cue(2) - 4;
	const cam = camPath(
		[
			[0, 960, 560, 1.7],
			[cue(1), 960, 560, 1.4],
			[D, 960, 520, 1.0],
		],
		f,
	);
	return (
		<FullFrame
			fadeIn={14}
			fadeOut={0}
			scrim={0.6}
			overlay={
				<Sequence from={endAt} layout="none">
					<EndCard v={EPISODE} cfg={BRAND} dur={D - endAt} />
				</Sequence>
			}
		>
			<Q_DEFS />
			<CoinTable cam={cam} lamp={0.8}>
				<circle cx={960} cy={TABLE_Y - 60} r={260} fill="url(#q-warm)" opacity={0.6} />
				<SpinCoin x={960} y={TABLE_Y} r={110} ph={A * 0.22} speed={0.22} />
			</CoinTable>
		</FullFrame>
	);
};

export const scenes: SceneMap = {Hook, Lab, Bits, Qubit, Many, Reveal, Why, Uses, Tips, Callback};
