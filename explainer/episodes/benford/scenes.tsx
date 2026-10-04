import React from 'react';
import {AbsoluteFill, Sequence, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Figure, POSES, blinkAt, lerpPose, type Pose} from '../../src/art/Figure';
import {Materials} from '../../src/art/materials';
import {P} from '../../src/art/palette';
import {Layer, lookAt} from '../../src/art/sets/Airfield';
import {TANK_DEFS} from '../../src/art/Tank';
import type {VideoCfg} from '../../src/brand/Brand';
import {JUNO} from '../../src/brand/identity';
import {FullFrame, camMix} from '../../src/components/FullFrame';
import {ease, prog, useCue, useScene, useTimeline} from '../../src/lib/context';
import {color, font} from '../../src/lib/theme';
import type {SceneMap, SceneProps} from '../../src/lib/types';
import {Motes} from '../../src/art/glow/kit';
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
	motif: 'cards', // this episode draws its own motif: nine gold bars (Benford's staircase)
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

// ---------------------------------------------------------------- 1. hook: the world's numbers pour into nine tubes

/*
 * Track accents used here (seconds, from the analysis of benford-bgm.mp3):
 * 0.33 (1.0) the freeze · 2.37 (0.84) tube 1 brims · 2.88 (0.91) the 5% lands ·
 * 3.90 (0.86) the title card's first stamp · 4.40 (1.0) its third · 8.47 (0.98) cut to 1881.
 */
const FREEZE = 10;
const BRIM = 71;
const LAND9 = 86;
const QUOTA = [0, 63, 37, 26, 20, 17, 14, 12, 11, 10]; // 210 first digits in Benford's proportions
const TUBE_H = 360;
const TUBE_TOP = 480;
const TUBE_BOT = TUBE_TOP + TUBE_H;
const tubeX = (d: number) => 960 + (d - 5) * 150;
const level = (d: number) => (QUOTA[d] / QUOTA[1]) * TUBE_H;

/** every drop: its digit, launch frame, start point (field numbers start where they float) */
const DROPS: {d: number; field: boolean}[] = (() => {
	const all: number[] = [];
	for (let d = 1; d <= 9; d++) for (let k = 0; k < QUOTA[d]; k++) all.push(d);
	return all
		.map((d, i) => ({d, r: random(`drop${i}`)}))
		.sort((a, b) => a.r - b.r)
		.map(({d}, i) => ({d, field: i < 70}));
})();

const UNITS = ['', ' km', ' 元', ' MB', ' 人', ' m', ' kg', '', ' 次', ' 吨'];
/** the numbers floating in the dark: 70 far ones (their first digits will drop), 22 near ones that rush past */
const FIELD = Array.from({length: 92}, (_, i) => {
	const far = i < 70;
	const d = far ? DROPS[i].d : 1 + Math.floor(random(`fd${i}`) * 9);
	const n = 1 + Math.floor(random(`fn${i}`) * 6);
	let rest = '';
	for (let k = 0; k < n; k++) rest += Math.floor(random(`fr${i}${k}`) * 10);
	const digits = `${d}${rest}`;
	const dec = random(`fdec${i}`) > 0.75 && digits.length > 1;
	const int = dec ? digits.slice(0, Math.max(1, digits.length - 2)) : digits;
	const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	const text = dec ? `${withCommas}.${digits.slice(int.length)}` : withCommas;
	return {
		x: (random(`fx${i}`) - 0.5) * (far ? 2600 : 1800),
		y: (random(`fy${i}`) - 0.5) * (far ? 1300 : 1000) - (far ? 120 : 0),
		z: far ? 1250 + random(`fz${i}`) * 2600 : 250 + random(`fz${i}`) * 850,
		d,
		tail: text.slice(1) + UNITS[Math.floor(random(`fu${i}`) * UNITS.length)],
		far,
	};
});
const V = 95; // camera speed (units/frame) until the freeze
const camZ = (f: number) => (f < FREEZE ? V * f : V * FREEZE + 70 * (1 - Math.exp(-(f - FREEZE) / 3)));
const FOCAL = 900;
const project = (p: {x: number; y: number; z: number}, cz: number) => {
	const zr = p.z - cz;
	return {zr, sx: 960 + (p.x * FOCAL) / zr, sy: 500 + (p.y * FOCAL) / zr, k: FOCAL / zr};
};
/** launch frame and flight time of drop i */
const launchAt = (i: number) => (DROPS[i].field ? 12 + i * 0.6 : 16 + (i - 70) * 0.26);
const FLIGHT = 18;
const arrivals = (() => {
	const a: number[][] = Array.from({length: 10}, () => []);
	DROPS.forEach((dr, i) => a[dr.d].push(launchAt(i) + FLIGHT));
	return a.map((l) => l.sort((x, y) => x - y));
})();
const filled = (d: number, f: number) => {
	const l = arrivals[d];
	let n = 0;
	while (n < l.length && l[n] <= f) n++;
	return n;
};

const quad = (a: [number, number], c: [number, number], b: [number, number], t: number): [number, number] => [
	(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
	(1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1],
];

const Hook: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const scene = useScene();
	const end = scene.duration;
	const cz = camZ(f);
	const hit = (at: number, decay = 4) => (f >= at ? Math.exp(-(f - at) / decay) : 0);
	const punch = 0.035 * hit(FREEZE) + 0.025 * hit(BRIM) + 0.02 * hit(LAND9);
	const shake = 9 * hit(FREEZE, 2.5) + 6 * hit(BRIM, 2.5);
	const frozen = f >= FREEZE;
	const dimRest = prog(f, FREEZE, 6) * 0.75 + prog(f, 40, 30) * 0.2;
	const toCard = prog(f, end - 22, 22, ease.inOut); // glass dissolves, the field goes dark: nine gold bars remain
	const tubesIn = (d: number) => spring({frame: f - FREEZE - 2 - d * 1.2, fps: 30, config: {damping: 14, stiffness: 140}});
	return (
		<FullFrame fadeIn={0} fadeOut={0} motes={0} scrim={0.55}>
			<defs>
				<linearGradient id="tube-gold" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#fff1c4" />
					<stop offset="0.25" stopColor="#f1c56d" />
					<stop offset="1" stopColor="#a8742a" />
				</linearGradient>
				<radialGradient id="hook-void" cx="50%" cy="46%" r="70%">
					<stop offset="0" stopColor="#1a1410" />
					<stop offset="1" stopColor="#05060b" />
				</radialGradient>
			</defs>
			<rect width={W} height={H} fill="url(#hook-void)" />
			<g transform={`translate(${960 + shake * (random(`hx${f}`) - 0.5)},${540 + shake * (random(`hy${f}`) - 0.5)}) scale(${1 + punch}) translate(-960,-540)`}>
				{/* the field of numbers, far to near */}
				<g opacity={1 - toCard}>
					{FIELD.map((p, i) => ({p, i, pr: project(p, cz)}))
						.filter(({pr}) => pr.zr > 40 && pr.zr < 4200)
						.sort((a, b) => b.pr.zr - a.pr.zr)
						.map(({p, i, pr}) => {
							const size = Math.min(260, 70 * pr.k);
							const fog = Math.min(1, (4200 - pr.zr) / 1800) * Math.min(1, (pr.zr - 40) / 160);
							const launched = p.far && f >= launchAt(i);
							const prev = project(p, cz - (frozen ? 0 : V));
							const streak = !frozen && pr.k > 0.5;
							return (
								<g key={i} opacity={fog}>
									{streak ? <line x1={prev.sx} y1={prev.sy} x2={pr.sx} y2={pr.sy} stroke="#f3ede2" strokeWidth={size * 0.12} opacity={0.18} strokeLinecap="round" /> : null}
									{/* the first digit (it leaves for its tube) */}
									{!launched ? (
										<text x={pr.sx} y={pr.sy} style={{fontFamily: font.latin, fontWeight: 700, fontSize: size, fill: frozen ? GOLD : '#f3ede2', ...LN}} filter={frozen ? 'url(#g-sm)' : undefined}>
											{p.d}
										</text>
									) : null}
									<text x={pr.sx + size * 0.5} y={pr.sy} style={{fontFamily: font.latin, fontWeight: 600, fontSize: size, fill: '#f3ede2', ...LN}} opacity={(1 - dimRest) * (launched ? 0.6 : 1)}>
										{p.tail}
									</text>
								</g>
							);
						})}
				</g>
				{/* the nine tubes */}
				{Array.from({length: 9}, (_, k) => {
					const d = k + 1;
					const s = tubesIn(k);
					const x = tubeX(d);
					const n = filled(d, f);
					const lv = (n / QUOTA[1]) * TUBE_H;
					const brim = d === 1 ? hit(BRIM, 6) : 0;
					return (
						<g key={d} transform={`translate(0,${(1 - s) * 520})`} opacity={Math.min(1, s * 1.5)}>
							{lv > 0 ? (
								<>
									<rect x={x - 48} y={TUBE_BOT - lv - 10} width={96} height={lv + 20} fill={GOLD} opacity={0.18 + 0.4 * brim} filter="url(#g-lg)" />
									<rect x={x - 42} y={TUBE_BOT - lv} width={84} height={lv} rx={6} fill="url(#tube-gold)" />
									<rect x={x - 42} y={TUBE_BOT - lv} width={84} height={5} fill="#fff6dc" opacity={0.8} />
								</>
							) : null}
							<g opacity={1 - toCard}>
								<rect x={x - 48} y={TUBE_TOP - 20} width={96} height={TUBE_H + 26} rx={14} fill="#f3ede2" opacity={0.05} stroke="#f3ede2" strokeOpacity={0.4} strokeWidth={2.5} />
								<rect x={x - 36} y={TUBE_TOP} width={8} height={TUBE_H - 20} rx={4} fill="#fff" opacity={0.18} />
								<text x={x} y={TUBE_BOT + 56} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 46, fill: d === 1 ? GOLD : '#f3ede2', ...LN}} opacity={0.9}>
									{d}
								</text>
							</g>
							{brim > 0.02 ? <circle cx={x} cy={TUBE_TOP} r={60 + 160 * (1 - brim)} fill="none" stroke={GOLD} strokeWidth={4} opacity={brim} /> : null}
						</g>
					);
				})}
				{/* drops in flight */}
				{DROPS.map((dr, i) => {
					const t0 = launchAt(i);
					const t = (f - t0) / FLIGHT;
					if (t < 0 || t >= 1) return null;
					let a: [number, number];
					if (dr.field) {
						const pr = project(FIELD[i], camZ(t0));
						a = [pr.sx, pr.sy];
					} else {
						a = [120 + random(`rx${i}`) * 1680, -80];
					}
					const b: [number, number] = [tubeX(dr.d), TUBE_TOP - 10];
					const c: [number, number] = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 220];
					const e = t * t * (3 - 2 * t);
					const [x, y] = quad(a, c, b, e);
					const size = 56 - 18 * e;
					return (
						<text key={i} x={x} y={y} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: size, fill: GOLD, ...LN}} opacity={dr.field ? 1 : 0.85} filter="url(#g-sm)">
							{dr.d}
						</text>
					);
				})}
				{/* the two shares, landing on the 2.37 and 2.88 accents; they stay put */}
				{f >= BRIM ? (
					<text
						x={tubeX(1)}
						y={TUBE_TOP - 58}
						textAnchor="middle"
						transform={`translate(${tubeX(1)},${TUBE_TOP - 70}) scale(${1 + 0.6 * hit(BRIM, 3)}) translate(${-tubeX(1)},${-(TUBE_TOP - 70)})`}
						style={{fontFamily: font.latin, fontWeight: 700, fontSize: 92, fill: GOLD, ...LN}}
						filter="url(#g-sm)"
						opacity={1 - toCard}
					>
						30%
					</text>
				) : null}
				{f >= LAND9 ? (
					<text
						x={tubeX(9)}
						y={TUBE_BOT - level(9) - 40}
						textAnchor="middle"
						transform={`translate(${tubeX(9)},${TUBE_BOT - level(9) - 50}) scale(${1 + 0.6 * hit(LAND9, 3)}) translate(${-tubeX(9)},${-(TUBE_BOT - level(9) - 50)})`}
						style={{fontFamily: font.latin, fontWeight: 700, fontSize: 64, fill: '#f3ede2', ...LN}}
						opacity={1 - toCard}
					>
						5%
					</text>
				) : null}
			</g>
			{/* the freeze: a flash and a ring of light */}
			<rect width={W} height={H} fill="url(#glow-lamp)" opacity={0.6 * hit(FREEZE, 3)} />
		</FullFrame>
	);
};

// ---------------------------------------------------------------- the title card, grown out of the nine bars

/**
 * The hook ends on nine gold bars (the tubes' contents, Benford's staircase). The
 * card keeps them: they gather into the episode motif under the title while
 * 《第一位数字》 is struck in, one character per half-beat from the 3.90 accent
 * (the third lands on 4.40, the track's strongest), and gold pours in on 5.93.
 */
const motifBar = (d: number) => ({x: 960 + (d - 5) * 54 - 20, w: 40, bot: 712, h: level(d) * 0.42});
const tubeBar = (d: number) => ({x: tubeX(d) - 42, w: 84, bot: TUBE_BOT, h: level(d)});

const BenfordTitle: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const tempo = useTimeline().music.tempo;
	const half = (60 / tempo / 2) * fps;
	const gather = prog(f, 0, 12, ease.out);
	const chars = [...'《第一位数字》'];
	const stampAt = (i: number) => i * half;
	const last = stampAt(chars.length - 1);
	const kick = chars.reduce((k, _, i) => k + (f >= stampAt(i) ? (i === 2 ? 1.8 : 1) * Math.exp(-(f - stampAt(i)) / 2.5) : 0), 0);
	const gildAt = Math.round(2 * (60 / tempo) * fps * 2 - 0); // 5.93 s = 4 beats after 3.90
	const gild = prog(f, gildAt, 14, ease.inOut);
	const glint = prog(f, gildAt + 8, 16, ease.inOut);
	const out = prog(f, dur - 5, 5, ease.in);
	const size = 150;
	const step = size;
	const ty = 480;
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
					<linearGradient id="bt-bar" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#fff1c4" />
						<stop offset="0.25" stopColor="#f1c56d" />
						<stop offset="1" stopColor="#a8742a" />
					</linearGradient>
					<clipPath id="bt-gild">
						<rect x={0} y={0} width={W * gild} height={H} />
					</clipPath>
					<linearGradient id="bt-glint" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0" stopColor="#fff" stopOpacity="0" />
						<stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
						<stop offset="1" stopColor="#fff" stopOpacity="0" />
					</linearGradient>
					<clipPath id="bt-chars">
						{chars.map((c, i) => (
							<text key={i} x={960 + (i - (chars.length - 1) / 2) * step} y={ty} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: size}}>
								{c}
							</text>
						))}
					</clipPath>
				</defs>
				<rect width={W} height={H} fill={JUNO.colors.night} />
				<ellipse cx={960} cy={540} rx={900} ry={520} fill="url(#glow-lamp)" opacity={0.16 + 0.04 * Math.sin(f / 13)} />
				<Motes f={f * 1.6} n={60} seed="tc" o={0.9} />
				<g transform={`translate(${kick * 2.5 * (random(`kx${f}`) - 0.5)},${kick * 2.5 * (random(`ky${f}`) - 0.5)})`}>
					{/* the nine bars gather into the motif */}
					{Array.from({length: 9}, (_, k) => {
						const d = k + 1;
						const a = tubeBar(d);
						const b = motifBar(d);
						const x = a.x + (b.x - a.x) * gather;
						const w = a.w + (b.w - a.w) * gather;
						const bot = a.bot + (b.bot - a.bot) * gather;
						const h = a.h + (b.h - a.h) * gather;
						return (
							<g key={d}>
								<rect x={x - 4} y={bot - h - 6} width={w + 8} height={h + 12} fill={GOLD} opacity={0.16} filter="url(#g-lg)" />
								<rect x={x} y={bot - h} width={w} height={h} rx={4 + 2 * (1 - gather)} fill="url(#bt-bar)" />
							</g>
						);
					})}
					<line x1={960 - 4.5 * 54} y1={720} x2={960 + 4.5 * 54} y2={720} stroke={GOLD} strokeWidth={2} opacity={0.5 * gather} />
					{(() => {
						const g2 = prog(f, Math.round((6.95 - 3.9) * fps), 18, ease.inOut);
						return g2 > 0 && g2 < 1 ? <rect x={960 - 300 + 600 * g2} y={540} width={60} height={190} fill="url(#bt-glint)" opacity={0.9} transform={`skewX(-18)`} /> : null;
					})()}
					<text x={960} y={300} textAnchor="middle" opacity={prog(f, 4, 14) * 0.9} style={{fontFamily: font.latin, fontWeight: 700, fontSize: 28, letterSpacing: '0.42em', fill: '#c8913a'}}>
						{EPISODE.kicker}
					</text>
					{/* struck characters: dark bronze relief, then gold */}
					{chars.map((c, i) => {
						if (f < stampAt(i)) return null;
						const s = spring({frame: f - stampAt(i), fps, config: {damping: 13, stiffness: 340}});
						const x = 960 + (i - (chars.length - 1) / 2) * step;
						return (
							<g key={i} transform={`translate(${x},${ty}) scale(${1 + 0.55 * (1 - s)})`} opacity={Math.min(1, s * 2.2)}>
								<text x={0} y={4} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: size, fill: '#000'}} opacity={0.6}>
									{c}
								</text>
								<text textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: size, fill: '#4a3418', stroke: '#c8913a', strokeWidth: 1.5, paintOrder: 'stroke'}}>
									{c}
								</text>
							</g>
						);
					})}
					{chars.map((_, i) => {
						const k = f - stampAt(i);
						if (k < 0 || k > 12) return null;
						const x = 960 + (i - (chars.length - 1) / 2) * step;
						return <circle key={`d${i}`} cx={x} cy={ty - 52} r={40 + k * (i === 2 ? 9 : 5)} fill="none" stroke={GOLD} strokeWidth={3} opacity={(i === 2 ? 0.7 : 0.35) * (1 - k / 12)} />;
					})}
					<g clipPath="url(#bt-gild)">
						<g filter="url(#blur-sm)" opacity={0.75}>
							{chars.map((c, i) => (
								<text key={i} x={960 + (i - (chars.length - 1) / 2) * step} y={ty} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: size, fill: GOLD}}>
									{c}
								</text>
							))}
						</g>
						{chars.map((c, i) => (
							<text key={i} x={960 + (i - (chars.length - 1) / 2) * step} y={ty} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: size, fill: 'url(#bt-gold)'}}>
								{c}
							</text>
						))}
					</g>
					{/* one glint across the gold, once */}
					{glint > 0 && glint < 1 ? (
						<g clipPath="url(#bt-chars)">
							<rect x={-300 + 2500 * glint} y={300} width={220} height={240} fill="url(#bt-glint)" transform={`skewX(-20)`} />
						</g>
					) : null}
				</g>
				<text x={960} y={800} textAnchor="middle" opacity={prog(f, gildAt + 4, 12)} style={{fontFamily: font.serif, fontWeight: 600, fontSize: 46, fill: color.text, letterSpacing: '0.1em'}}>
					{EPISODE.tagline}
				</text>
				<text x={960} y={850} textAnchor="middle" opacity={prog(f, gildAt + 10, 12)} style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 32, fill: 'rgba(243,237,226,0.6)'}}>
					{EPISODE.taglineEn}
				</text>
				<text x={960} y={922} textAnchor="middle" opacity={prog(f, gildAt + 16, 14)} style={{fontFamily: font.sans, fontSize: 22, letterSpacing: '0.42em', fill: 'rgba(241,197,109,0.78)'}}>
					{`— ${JUNO.credit} · ${JUNO.series} —`}
				</text>
			</svg>
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------- 2. office: Washington, 1881 (exterior)

/** a hansom cab crossing the snowy street: horse at a trot, wheels turning, a lamp on the cab */
const Cab: React.FC<{f: number}> = ({f}) => {
	const trot = Math.sin(f * 0.55);
	return (
		<g>
			<ellipse cx={20} cy={8} rx={260} ry={14} fill="#000" opacity={0.3} />
			{/* horse */}
			<g transform={`translate(170,${-6 * Math.abs(trot)})`}>
				<ellipse cx={0} cy={-120} rx={78} ry={36} fill="#0d0f14" />
				<path d="M60,-140 L110,-200 L132,-196 L120,-176 L84,-120 Z" fill="#0d0f14" />
				{[-50, -30, 40, 60].map((lx, i) => (
					<line key={i} x1={lx} y1={-96} x2={lx + 18 * Math.sin(f * 0.55 + (i % 2 ? Math.PI : 0))} y2={-10} stroke="#0d0f14" strokeWidth={11} strokeLinecap="round" />
				))}
				<path d="M-74,-128 C-100,-110 -104,-80 -96,-60" stroke="#0d0f14" strokeWidth={8} fill="none" />
			</g>
			{/* cab */}
			<path d="M-200,-190 L-60,-190 L-40,-60 L-210,-60 Z" fill="#11141b" />
			<rect x={-196} y={-170} width={60} height={60} fill="#ffcf8a" opacity={0.18} />
			<line x1={-40} y1={-100} x2={110} y2={-110} stroke="#11141b" strokeWidth={6} />
			{[-150, -40].map((wx, i) => (
				<g key={i} transform={`translate(${wx},-48) rotate(${f * 9})`}>
					<circle r={i ? 30 : 58} fill="none" stroke="#11141b" strokeWidth={7} />
					{Array.from({length: 8}, (_, k) => (
						<line key={k} x1={0} y1={0} x2={(i ? 30 : 58) * Math.cos((k * Math.PI) / 4)} y2={(i ? 30 : 58) * Math.sin((k * Math.PI) / 4)} stroke="#11141b" strokeWidth={3} />
					))}
				</g>
			))}
			<circle cx={-56} cy={-176} r={9} fill="#ffd88a" />
			<circle cx={-56} cy={-176} r={70} fill="url(#glow-lamp)" opacity={0.9} />
		</g>
	);
};

const Office: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const scene = useScene();
	const titleLen = Math.round((8.47 - 3.9) * 30); // the card runs to the 8.47 accent; hard cut to 1881
	const end = scene.duration;
	const g = f - titleLen;
	// crane down out of the snowing sky onto the building, then a slow push to the one lit window and a dive through it on the 16.6 downbeat
	const crane = prog(g, 0, 70, ease.out);
	const push = prog(g, 60, end - titleLen - 90, ease.inOut);
	const dive = prog(f, end - 26, 26, ease.in);
	const cam = camMix(camMix(lookAt(960, 120, 1.25), lookAt(960, 560, 1.0), crane), lookAt(WINDOW_LIT[0], WINDOW_LIT[1] + 30, 1.6), push);
	const camD = camMix(cam, lookAt(WINDOW_LIT[0] + 32, WINDOW_LIT[1] + 65, 9), dive * dive);
	const cabX = interpolate(g, [10, 260], [-600, 2500], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<FullFrame
			fadeIn={0}
			fadeOut={0}
			motes={0}
			overlay={
				<Sequence durationInFrames={titleLen} layout="none">
					<BenfordTitle dur={titleLen} />
				</Sequence>
			}
		>
			<g opacity={f < titleLen - 5 ? 0 : 1}>
				<Exterior1881 f={f + 400} cam={camD} />
				<Layer cam={camD} depth={1.15}>
					<g transform={`translate(${cabX},860)`}>
						<Cab f={g} />
					</g>
				</Layer>
				<Snow f={f + 400} n={70} seed="fg" size={2.2} speed={1.6} o={0.8 * (1 - dive)} />
				<Snow f={f + 400} n={120} seed="mg" size={1} speed={1} o={0.7} />
				<rect width={W} height={H} fill="#ffcf7a" opacity={Math.max(0, (dive - 0.6) / 0.4) * 0.9} />
			</g>
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 3. study: no calculators; logarithms

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

/** close-up of the working sheet: multiplications racing down the page */
const Workings: React.FC<{g: number; len: number}> = ({g, len}) => {
	const rows = Math.min(40, Math.floor(g / 2.2));
	const scroll = Math.max(0, rows - 11) * 60;
	const frac = (g % 2.2) / 2.2;
	return (
		<g>
			<rect width={W} height={H} fill="#3a2414" />
			<g transform={`rotate(-3,960,540) translate(0,${-scroll})`}>
				<rect x={360} y={60} width={1200} height={2600} fill="#efe6d0" />
				{Array.from({length: 48}, (_, i) => (
					<line key={i} x1={360} y1={100 + i * 52} x2={1560} y2={100 + i * 52} stroke="#9cb0c8" strokeWidth={1} opacity={0.35} />
				))}
				{Array.from({length: rows}, (_, r) => {
					const a = (1 + random(`wa${r}`) * 8.99).toFixed(4);
					const b = (1 + random(`wb${r}`) * 8.99).toFixed(4);
					const c = (Number(a) * Number(b)).toFixed(4);
					return (
						<text key={r} x={560} y={160 + r * 60} style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontWeight: 600, fontSize: 46, fill: '#2a2a30', ...LN}} opacity={0.88}>
							{`${a}  ×  ${b}  =  ${c}`}
						</text>
					);
				})}
			</g>
			<g transform={`rotate(-3,960,540) translate(${560 + 720 * frac},${160 + rows * 60 - scroll - 6}) rotate(152)`}>
				<rect x={-5} y={-170} width={10} height={170} fill="#1a1410" />
				<path d="M-5,0 L5,0 L0,20 Z" fill="#8a8a90" />
				<path d="M-40,-170 C-50,-120 -10,-80 30,-90 C70,-100 80,-160 60,-190 L-20,-210 Z" fill={P.skin1} />
				<path d="M-30,-200 L70,-190 L90,-460 L-50,-460 Z" fill="#262a33" />
				<rect x={-30} y={-216} width={100} height={20} fill="#e9e4da" transform="rotate(4)" />
			</g>
			<rect width={W} height={H} fill="url(#vignette-hard)" opacity={0.5} />
			<rect width={W} height={H} fill="#000" opacity={0.0 * len} />
		</g>
	);
};

const Study: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const len = scene.duration;
	const c1 = cue(1);
	const c2 = cue(2);
	const c3 = cue(3);
	const c4 = cue(4);
	// insert: "a planet is thousands of multiplications"
	if (f >= c3 - 2 && f < c4 - 2) {
		return (
			<FullFrame fadeIn={0} fadeOut={0} motes={0.6}>
				<g transform={`translate(960,540) scale(${1.0 + 0.05 * prog(f, c3, c4 - c3, ease.inOut)}) translate(-960,-540)`}>
					<Workings g={f - c3 + 2} len={c4 - c3} />
				</g>
			</FullFrame>
		);
	}
	const g = f;
	const LAMP: [number, number] = [1400, 760];
	const reveal = prog(g, 0, 46, ease.out);
	const toBook = prog(g, c4 + 4, len - c4 - 8, ease.inOut);
	const cam = camMix(camMix(lookAt(LAMP[0], LAMP[1] - 130, 2.6), lookAt(900, 560, 1.04), reveal), lookAt(1020, 690, 1.65), toBook);
	const NX = 760;
	const NY = 1130;
	const S = 2.0;
	const fig = (wx: number, wy: number): [number, number] => [(wx - NX) / S, (wy - NY) / S];
	// writes; at "要算行星的位置" glances up to the window (a planet shines over the dome); back to work
	const lookUp = prog(g, c2 + 10, 14, ease.inOut) * (1 - prog(g, c3 - 22, 14, ease.inOut));
	const pose: Pose = {...POSES.write, head: 22 - 32 * lookUp, lean: 16 - 6 * lookUp};
	const writing = g < c4 && lookUp < 0.5;
	const speed = g > c1 ? 0.06 : 0.035;
	const penX = 900 + 70 * ((g * speed) % 1) + 4 * Math.sin(g * 1.3);
	const penY = 730 + 4 * Math.cos(g * 0.9) + 10 * Math.floor((g * speed) % 3);
	const reachT = prog(g, c4, 14, ease.inOut);
	const pullT = prog(g, c4 + 16, 18, ease.inOut);
	const openT = prog(g, c4 + 38, 20, ease.inOut);
	const flickT = prog(g, c4 + 60, 36, (x) => x);
	const bookX = 1080 - 110 * pullT;
	const grip: [number, number] = [bookX + 230 - 260 * openT + 120 * prog(g, c4 + 60, 10), 725 - 70 * Math.sin(openT * Math.PI)];
	const nearHand = writing ? fig(penX, penY) : reachT < 1 ? fig(penX + (grip[0] - penX) * reachT, penY + (grip[1] - penY) * reachT) : fig(grip[0], grip[1]);
	const pen = writing || reachT === 0;
	const planet = prog(g, c2 + 6, 20);
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
						<rect x={-300} y={760} width={2520} height={40} fill="#4a2e1a" />
						<rect x={-300} y={760} width={2520} height={6} fill="#7a5232" />
						<rect x={-300} y={800} width={2520} height={600} fill="#2c1a0e" />
						{Array.from({length: 6}, (_, i) => (
							<rect key={i} x={-200 + i * 420} y={830} width={360} height={200} fill="none" stroke="#1a0e06" strokeWidth={4} />
						))}
						<Ledger rows={Math.min(8, 1 + g * 0.04)} />
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
				extra={
					// a bright planet over the dome, seen through the window (wall layer)
					<g opacity={planet}>
						<circle cx={1480} cy={240} r={7} fill="#fff4d6" />
						<circle cx={1480} cy={240} r={40} fill="url(#glow-lamp)" opacity={0.7} />
					</g>
				}
			/>
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
	const step9 = Math.max(5, Math.min(12, (c2 - 30) / 9));
	const digitAt = (i: number) => 6 + i * step9;
	const barAt = (i: number) => c2 + 8 + i * 4;
	const bracketAt = c2 + 52;
	// the pencil follows whatever is being drawn
	let hx = 520;
	let hy = 650;
	if (g < c2) {
		const i = Math.min(8, Math.max(0, Math.floor((g - 6) / step9)));
		hx = 560 + i * 100 + 30 * prog(g, digitAt(i), 5) + (g > digitAt(8) + 5 ? 6 * Math.sin(g / 4) : 0);
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
		const tap = k > 0 ? Math.max(0, Math.sin((k / beatF) * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.5) : 0;
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

export const scenes: SceneMap = {Hook, Office, Study, Tabs, Twist};
