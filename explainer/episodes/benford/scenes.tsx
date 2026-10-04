import React from 'react';
import {AbsoluteFill, Sequence, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Figure, POSES, addPose, blinkAt, idle, lerpPose, type Look, type Pose} from '../../src/art/Figure';
import {Materials} from '../../src/art/materials';
import {P} from '../../src/art/palette';
import {Layer, lookAt} from '../../src/art/sets/Airfield';
import {TANK_DEFS} from '../../src/art/Tank';
import {EPISODE} from './episode';
import {Town, Reveal, Cheques, City, Coda} from './scenes2';
import {JUNO} from '../../src/brand/identity';
import {FullFrame, camMix} from '../../src/components/FullFrame';
import {ease, prog, useCue, useScene, useTimeline} from '../../src/lib/context';
import {color, font} from '../../src/lib/theme';
import type {SceneMap, SceneProps} from '../../src/lib/types';
import {Motes} from '../../src/art/glow/kit';
import {BENF, BOOK, BookFront, BreakWorld, EdgeMacro, GOLD, H, LAB_BOOK, NEWCOMB, OilLamp, Snow, Study1881, W, camPath, camSpeed, sectionX, type Key} from './art';

/**
 * 《第一位数字》 (Benford's law). Act one (hook → title card → 1881 office → thumb tabs →
 * twist → Benford) lives here; Town → Coda live in scenes2.tsx.
 */

export {EPISODE};

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
 * It never cuts away: in its last frames the words rise off and the nine bars
 * widen into the nine sections of a book's fore-edge, worn in the same
 * proportions, which is where the next shot begins.
 */
const motifBar = (d: number) => ({x: 960 + (d - 5) * 54 - 20, w: 40, bot: 712, h: level(d) * 0.42});
const tubeBar = (d: number) => ({x: tubeX(d) - 42, w: 84, bot: TUBE_BOT, h: level(d)});
/** the fore-edge as the next shot frames it: x 210…1710, y 390…690 */
const EDGE_SCREEN = {x: 210, y: 390, w: 1500, h: 300};

const BenfordTitle: React.FC<{dur: number}> = ({dur}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const tempo = useTimeline().music.tempo;
	const half = (60 / tempo / 2) * fps;
	const gather = prog(f, 0, 12, ease.out);
	const chars = [...'《第一位数字》'];
	const stampAt = (i: number) => i * half;
	const kick = chars.reduce((k, _, i) => k + (f >= stampAt(i) ? (i === 2 ? 1.8 : 1) * Math.exp(-(f - stampAt(i)) / 2.5) : 0), 0);
	const gildAt = Math.round(4 * (60 / tempo) * fps); // 5.93 s = 4 beats after 3.90
	const gild = prog(f, gildAt, 14, ease.inOut);
	const glint = prog(f, gildAt + 8, 16, ease.inOut);
	const lift = prog(f, dur - 32, 16, ease.in); // the words rise away
	const morph = prog(f, dur - 24, 24, ease.inOut); // the bars become the fore-edge
	const size = 150;
	const step = size;
	const ty = 480;
	const words = {opacity: 1 - lift, transform: `translate(0,${-70 * lift})`};
	return (
		<AbsoluteFill>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={LN}>
				<Materials />
				<TANK_DEFS />
				<EdgeLight />
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
				<ellipse cx={960} cy={540} rx={900} ry={520} fill="url(#glow-lamp)" opacity={(0.16 + 0.04 * Math.sin(f / 13)) * (1 + 1.5 * morph)} />
				<Motes f={f * 1.6} n={60} seed="tc" o={0.9 * (1 - morph)} />
				<g transform={`translate(${kick * 2.5 * (random(`kx${f}`) - 0.5)},${kick * 2.5 * (random(`ky${f}`) - 0.5)})`}>
					{/* the worn fore-edge the bars turn into */}
					{morph > 0.25 ? (
						<g opacity={Math.min(1, (morph - 0.25) / 0.55)} transform={`translate(${EDGE_SCREEN.x},${EDGE_SCREEN.y}) scale(${EDGE_SCREEN.w / BOOK.w})`}>
							<EdgeMacro x={0} y={0} w={BOOK.w} h={BOOK.h} id="cardedge" wear={0.62} tabs={1} />
						</g>
					) : null}
					{/* the nine bars: hook tubes → motif → fore-edge sections */}
					{Array.from({length: 9}, (_, k) => {
						const d = k + 1;
						const a = tubeBar(d);
						const b = motifBar(d);
						let x = a.x + (b.x - a.x) * gather;
						let w = a.w + (b.w - a.w) * gather;
						let bot = a.bot + (b.bot - a.bot) * gather;
						let h = a.h + (b.h - a.h) * gather;
						const ex = EDGE_SCREEN.x + ((d - 1) / 9) * EDGE_SCREEN.w;
						x += (ex - x) * morph;
						w += (EDGE_SCREEN.w / 9 - w) * morph;
						bot += (EDGE_SCREEN.y + EDGE_SCREEN.h - bot) * morph;
						h += (EDGE_SCREEN.h - h) * morph;
						return (
							<g key={d} opacity={1 - Math.min(1, Math.max(0, (morph - 0.4) / 0.5))}>
								<rect x={x - 4} y={bot - h - 6} width={w + 8} height={h + 12} fill={GOLD} opacity={0.16} filter="url(#g-lg)" />
								<rect x={x} y={bot - h} width={w} height={h} rx={(4 + 2 * (1 - gather)) * (1 - morph)} fill="url(#bt-bar)" />
							</g>
						);
					})}
					<line x1={960 - 4.5 * 54} y1={720} x2={960 + 4.5 * 54} y2={720} stroke={GOLD} strokeWidth={2} opacity={0.5 * gather * (1 - morph)} />
					{(() => {
						const g2 = prog(f, Math.round((6.95 - 3.9) * fps), 18, ease.inOut);
						return g2 > 0 && g2 < 1 ? <rect x={960 - 300 + 600 * g2} y={540} width={60} height={190} fill="url(#bt-glint)" opacity={0.9} transform={`skewX(-18)`} /> : null;
					})()}
					<g {...words}>
						<text x={960} y={300} textAnchor="middle" opacity={prog(f, 4, 14) * 0.9} style={{fontFamily: font.latin, fontWeight: 700, fontSize: 28, letterSpacing: '0.42em', fill: '#c8913a'}}>
							{EPISODE.kicker}
						</text>
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
						{glint > 0 && glint < 1 ? (
							<g clipPath="url(#bt-chars)">
								<rect x={-300 + 2500 * glint} y={300} width={220} height={240} fill="url(#bt-glint)" transform={`skewX(-20)`} />
							</g>
						) : null}
					</g>
				</g>
				<g {...words}>
					<text x={960} y={800} textAnchor="middle" opacity={prog(f, gildAt + 4, 12)} style={{fontFamily: font.serif, fontWeight: 600, fontSize: 46, fill: color.text, letterSpacing: '0.1em'}}>
						{EPISODE.tagline}
					</text>
					<text x={960} y={850} textAnchor="middle" opacity={prog(f, gildAt + 10, 12)} style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 32, fill: 'rgba(243,237,226,0.6)'}}>
						{EPISODE.taglineEn}
					</text>
					<text x={960} y={922} textAnchor="middle" opacity={prog(f, gildAt + 16, 14)} style={{fontFamily: font.sans, fontSize: 22, letterSpacing: '0.42em', fill: 'rgba(241,197,109,0.78)'}}>
						{`— ${JUNO.credit} · ${JUNO.series} —`}
					</text>
				</g>
			</svg>
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------- shared helpers for the continuous shots

/** the track's beats as scene-local frames */
const useLocalBeats = () => {
	const {music} = useTimeline();
	const scene = useScene();
	return music.beats.map((b) => b - scene.from);
};

/** motion blur from the camera's speed (a whip reads as a whip, not as a jump) */
const MotionBlur: React.FC<{keys: Key[]; f: number; id: string; children: React.ReactNode}> = ({keys, f, id, children}) => {
	const [vx, vy] = camSpeed(keys, f);
	const bx = Math.min(18, Math.max(0, (vx - 6) * 0.22));
	const by = Math.min(18, Math.max(0, (vy - 6) * 0.22));
	if (bx < 0.3 && by < 0.3) return <g>{children}</g>;
	return (
		<g>
			<defs>
				<filter id={id} x="-5%" y="-5%" width="110%" height="110%">
					<feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} />
				</filter>
			</defs>
			<g filter={`url(#${id})`}>{children}</g>
		</g>
	);
};

/** pages lifting off the fore-edge where a thumb flicks them (world coords) */
const Flicks: React.FC<{events: [number, number][]; f: number; b?: typeof BOOK}> = ({events, f, b = BOOK}) => (
	<g>
		{events.map(([t, d], i) => {
			const k = f - t;
			if (k < 0 || k > 9) return null;
			const p = k / 9;
			const x0 = sectionX(d, b) - 8 + (i % 5) * 4;
			const lift = Math.sin(p * Math.PI);
			return (
				<g key={i} opacity={lift}>
					{[0, 1, 2].map((j) => (
						<path key={j} d={`M${x0 + j * 3},${b.y + 1} C${x0 + j * 3 + 4 + 18 * p},${b.y - 18 * lift} ${x0 + j * 3 + 14 + 22 * p},${b.y - 24 * lift} ${x0 + j * 3 + 26 * p + 6},${b.y - 10 * lift}`} stroke="#f6ecd4" strokeWidth={1.4} fill="none" />
					))}
					<circle cx={x0 + 6} cy={b.y - 4} r={6 + 10 * p} fill="#e9dcc0" opacity={0.25 * (1 - p)} />
				</g>
			);
		})}
	</g>
);

/** a number flying along an arc; its first digit is gold */
const FlyingNumber: React.FC<{from: [number, number]; to: [number, number]; t: number; text: string; size?: number; trail?: boolean}> = ({from, to, t, text, size = 22, trail}) => {
	if (t < 0 || t > 1) return null;
	const e = t * t * (3 - 2 * t);
	const c: [number, number] = [(from[0] + to[0]) / 2, Math.min(from[1], to[1]) - 120];
	const [x, y] = quad(from, c, to, e);
	const s = size * (1 - 0.6 * e);
	const back = Math.max(0, t - 0.12);
	const eb = back * back * (3 - 2 * back);
	const [px, py] = quad(from, c, to, eb);
	return (
		<g>
		{trail ? <line x1={px} y1={py} x2={x} y2={y} stroke={GOLD} strokeWidth={s * 0.12} strokeLinecap="round" opacity={0.45} filter="url(#g-sm)" /> : null}
		{trail ? <circle cx={x - s * 0.25} cy={y - s * 0.3} r={s * 0.5} fill={GOLD} opacity={0.12} filter="url(#g-md)" /> : null}
		<text x={x} y={y} textAnchor="middle" opacity={Math.min(1, t * 6) * (1 - Math.max(0, (t - 0.85) / 0.15))} style={{fontFamily: font.latin, fontWeight: 700, fontSize: s, fill: '#f3ede2', ...LN}}>
			<tspan fill={GOLD}>{text[0]}</tspan>
			{text.slice(1)}
		</text>
		</g>
	);
};

const logNumber = (seed: string, d: number) => {
	const n = 1 + Math.floor(random(`${seed}n`) * 4);
	let r = '';
	for (let k = 0; k < n; k++) r += Math.floor(random(`${seed}${k}`) * 10);
	return `${d}${r}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
const benfordDigit = (u: number) => {
	let acc = 0;
	for (let d = 1; d <= 9; d++) {
		acc += BENF[d] / 100;
		if (u <= acc) return d;
	}
	return 9;
};

// Newcomb sits behind the desk; hand targets are in world coords
const NX = 690;
const NY = 1130;
const NS = 2.0;
const nfig = (wx: number, wy: number): [number, number] => [(wx - NX) / NS, (wy - NY) / NS];

/**
 * Keep a hand target within reach (character-motion: never pull the arm straight
 * to a target it can't reach). Finds the near shoulder in world space after the
 * lean (as the rig draws it) and pulls the target to 0.93 of the arm's length.
 */
const safeReach = (pose: Pose, X: number, Y: number, S: number, target: [number, number], near = true): [number, number] => {
	const r = (pose.lean * Math.PI) / 180;
	const pivot = -150 + pose.lift;
	const sx = near ? 14 : -12;
	const sy = (near ? -258 : -256) - pivot;
	const fx = sx * Math.cos(r) - sy * Math.sin(r);
	const fy = pivot + sx * Math.sin(r) + sy * Math.cos(r) + (pose.drop ?? 0);
	const shoulder: [number, number] = [X + fx * S, Y + fy * S];
	const max = 0.93 * (58 + 54) * S;
	const dx = target[0] - shoulder[0];
	const dy = target[1] - shoulder[1];
	const d = Math.hypot(dx, dy);
	return d <= max ? target : [shoulder[0] + (dx / d) * max, shoulder[1] + (dy / d) * max];
};
const LEDGER = {x: 750, y: 748};

/** the working sheet on the desk (left of the book) */
const Sheet: React.FC<{rows: number; x?: number; y?: number}> = ({rows, x = LEDGER.x, y = LEDGER.y}) => (
	<g transform={`translate(${x},${y}) skewX(-24) scale(1,0.5)`}>
		<rect x={0} y={-120} width={250} height={120} fill="#efe4c8" />
		{Array.from({length: Math.floor(rows)}, (_, r) => (
			<text key={r} x={14} y={-100 + r * 14} style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 13, fill: '#3a2a1a', ...LN}}>
				{`${(1 + random(`lg${r}`) * 8.9).toFixed(4)}  ×  ${(1 + random(`lh${r}`) * 8.9).toFixed(4)}`}
			</text>
		))}
	</g>
);

/** the desk furniture of 1881 drawn in front of Newcomb (the desk front hides his legs) */
const Desk1881: React.FC<{f: number; children?: React.ReactNode}> = ({f, children}) => (
	<>
		<rect x={-300} y={760} width={2520} height={40} fill="#4a2e1a" />
		<rect x={-300} y={760} width={2520} height={6} fill="#7a5232" />
		<rect x={-300} y={800} width={2520} height={600} fill="#2c1a0e" />
		{Array.from({length: 6}, (_, i) => (
			<rect key={i} x={-200 + i * 420} y={830} width={360} height={200} fill="none" stroke="#1a0e06" strokeWidth={4} />
		))}
		<g transform="translate(470,760)">
			{Array.from({length: 4}, (_, i) => (
				<rect key={i} x={-120 + i * 4} y={-18 - i * 16} width={200} height={16} fill={['#3a2418', '#2a2c34', '#4a2a22', '#24302a'][i]} />
			))}
		</g>
		<g transform="translate(580,760)">
			<path d="M-18,0 L18,0 L15,-26 L-15,-26 Z" fill="#14181e" />
			<rect x={-7} y={-32} width={14} height={7} fill="#2a2e36" />
		</g>
		{children}
		<g transform="translate(1460,760)">
			<OilLamp f={f} />
		</g>
	</>
);

// ---------------------------------------------------------------- 2. edge: 1881, the book on Newcomb's desk

const Edge: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const titleLen = Math.round((8.47 - 3.9) * 30);
	const end = scene.duration;
	const c1 = cue(1);
	const c2 = cue(2);
	const Z0 = EDGE_SCREEN.w / BOOK.w;
	const C0: [number, number] = [BOOK.x + BOOK.w / 2, BOOK.y + BOOK.h / 2];
	const keys: Key[] = [
		[titleLen - 1, C0[0], C0[1], Z0],
		[titleLen + 14, C0[0] - 20, C0[1] - 14, 3.6],
		[c1 - 10, 1000, 620, 1.45],
		[c1 + 40, 930, 570, 1.12],
		[c2 - 6, 960, 600, 1.22],
		[c2 + 40, 1100, 690, 2.2],
		[end, 1150, 712, 3.2],
	];
	const cam = camPath(keys, f);
	// Newcomb: writing; at "天天翻一本对数表" glances at the book; at "旧得很奇怪" pulls it close and studies the edge
	const writeP = 0.05;
	const penX = LEDGER.x + 40 + 90 * ((f * writeP) % 1) + 3 * Math.sin(f * 1.3);
	const penY = 734 + 3 * Math.cos(f * 0.9) + 4 * Math.floor((f * writeP) % 3);
	const glance = prog(f, c1 + 6, 12, ease.inOut) * (1 - prog(f, c1 + 50, 14, ease.inOut));
	const antic = prog(f, c2 - 4, 6, ease.out) * (1 - prog(f, c2 + 2, 8, ease.inOut)); // a small lean back before the reach
	const reach = spring({frame: f - c2 - 2, fps: 30, config: {damping: 15, stiffness: 90}});
	const touch: [number, number] = [BOOK.x + 26, BOOK.y + 6];
	const hand: [number, number] = [penX + (touch[0] - penX) * reach, penY + (touch[1] - penY) * reach];
	const study = reach;
	const base: Pose = {...POSES.write, head: 22 - 26 * glance + 10 * study, lean: 16 - 8 * antic + 12 * study - 4 * glance};
	const pose: Pose = {...base, ...addPose(base, idle(f, 'newcomb'), 0.6 * (1 - reach))};
	const breathe = 0;
	return (
		<FullFrame
			fadeIn={0}
			fadeOut={0}
			motes={1}
			overlay={
				<Sequence durationInFrames={titleLen} layout="none">
					<BenfordTitle dur={titleLen} />
				</Sequence>
			}
		>
			<EdgeLight />
			<MotionBlur keys={keys} f={f} id="mb-edge">
				<Study1881
					f={f + 400}
					cam={cam}
					desk={
						<>
							<g transform={`translate(${NX},${NY + breathe}) scale(${NS})`}>
								<Figure
									look={NEWCOMB}
									pose={pose}
									reach={{near: nfig(...safeReach(pose, NX, NY, NS, hand)), far: nfig(...safeReach(pose, NX, NY, NS, [720, 752], false))}}
									expression={study > 0.5 ? 'thinking' : 'neutral'}
									blink={blinkAt(f, 'nwe')}
									rim="warm"
									shadow={false}
									holdNear={reach < 0.3 ? <rect x={-2} y={-34} width={4} height={40} rx={2} fill="#1a1410" transform="rotate(-30)" /> : undefined}
								/>
							</g>
							<Desk1881 f={f}>
								<Sheet rows={Math.min(8, 1 + f * 0.03)} />
								<BookFront id="ebook" wear={0.62} />
							</Desk1881>
						</>
					}
				/>
			</MotionBlur>
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 3. flip: one continuous move on the loud section

const Flip: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const beats = useLocalBeats().filter((b) => b >= -1 && b < scene.duration + 1);
	const end = scene.duration;
	const c = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => cue(i));
	const keys: Key[] = [
		[0, 1150, 712, 3.2],
		[8, 1035, 727, 5.0],
		[c[1] - 8, 1070, 727, 4.8],
		[c[1] + 18, 1268, 727, 4.6],
		[c[2] - 4, 1290, 724, 4.4],
		[c[2] + 16, 1060, 716, 3.9],
		[c[3] - 14, 1250, 716, 3.9],
		[c[3] + 36, 990, 640, 1.75],
		[c[4] - 12, 1010, 625, 1.6],
		[c[4] + 34, 2050, 190, 1.3],
		[c[5] - 10, 2000, 230, 1.25],
		[c[5] + 44, 960, 540, 1.0],
		[c[6] - 10, 960, 560, 1.02],
		[c[6] + 30, 870, 662, 2.2], // a medium push-in: the rig reads at this size (no macro of the body)
		[c[7] - 6, 885, 668, 2.05],
		[c[7] + 28, 920, 680, 1.9],
		[c[8] - 2, 920, 650, 1.6],
		[c[8] + 26, 1900, 260, 1.5],
		[end, 2338, 73, 3.2],
	];
	const cam = camPath(keys, f);
	const beatAfter = (t: number) => beats.find((b) => b >= t) ?? t;
	const onBeat = (b: number) => (f >= b ? Math.exp(-(f - b) / 4) : 0);
	// --- flick events: a) the riffle on the front; c3) one number per beat; c4–c6) the world's numbers
	const events: [number, number][] = [];
	for (let t = 0; t < c[1] - 4; t += 3) events.push([t, 1 + (Math.floor(t / 3) % 3)]);
	const MECH = [1, 1, 2, 1, 3, 1, 2, 1, 4, 1];
	// he writes at his own pace: slow at first, then quicker as he gets into it (not one per beat)
	const mechBeats: number[] = [];
	{
		const span = c[4] - 8 - (c[3] + 6);
		const w = MECH.map((_, i) => 1.35 - 0.07 * i + 0.25 * (random(`mw${i}`) - 0.5));
		const sum = w.reduce((a, b) => a + b, 0);
		let t = c[3] + 6;
		w.forEach((x) => {
			t += (x / sum) * span;
			mechBeats.push(Math.round(t));
		});
	}
	const mech = mechBeats.map((b, i) => ({t0: b - 14, t1: b, d: MECH[i], text: logNumber(`mech${i}`, MECH[i])}));
	mech.forEach((m) => events.push([m.t1, m.d]));
	const STREAM_FROM = [
		[1560, 200],
		[1700, 320],
		[1620, 470],
		[1850, 120],
		[1980, 380],
		[640, 280],
		[220, 360],
		[1400, 80],
	] as [number, number][];
	const stream = Array.from({length: 220}, (_, i) => {
		const t0 = c[4] + 4 + i * ((c[6] - 30 - c[4]) / 220);
		const d = benfordDigit(random(`sd${i}`));
		return {t0, t1: t0 + 26, d, from: STREAM_FROM[i % STREAM_FROM.length].map((v, k) => v + (random(`sj${i}${k}`) - 0.5) * 160) as [number, number], text: logNumber(`st${i}`, d)};
	});
	stream.forEach((s) => events.push([s.t1, s.d]));
	// the book wears as we watch
	const wear = 0.62 + 0.38 * prog(f, c[3], c[6] - c[3], ease.inOut);
	// tabs ping 1 → 9 across "1在最前，9在最后": one quick sweep, like a finger running along them
	const tabBeats = Array.from({length: 9}, (_, k) => c[2] + 14 + k * 6);
	const ping = (d: number) => {
		const b = tabBeats[d - 1];
		return b === undefined || f < b ? 0 : Math.exp(-(f - b) / 10) * 0.9 + (d === 1 || d === 9 ? 0.1 : 0);
	};
	// Newcomb
	const inMech = f >= c[3] && f < c[4];
	let hand: [number, number] = [BOOK.x + 26, BOOK.y + 6];
	if (inMech) {
		const cur = mech.filter((m) => f >= m.t0 - 6).pop();
		if (cur) {
			const p = spring({frame: f - (cur.t1 - 8), fps: 30, config: {damping: 14, stiffness: 160}});
			// write the number, then thumb through the front corner to its section
			const from: [number, number] = [LEDGER.x + 120, 735];
			const to: [number, number] = [BOOK.x + 18 + 4 * cur.d, BOOK.y + 2];
			hand = [from[0] + (to[0] - from[0]) * p, from[1] + (to[1] - from[1]) * p];
		} else hand = [LEDGER.x + 120, 735];
	} else if (f >= c[4] && f < c[6]) {
		hand = [BOOK.x - 40, 745];
	} else if (f >= c[6] && f < c[8]) {
		const wp = 0.07;
		hand = [LEDGER.x + 60 + 110 * ((f * wp) % 1), 732 + 3 * Math.sin(f)];
	} else if (f >= c[8]) {
		const reachOut = spring({frame: f - c[8] - 10, fps: 30, config: {damping: 10, stiffness: 120}});
		hand = [LEDGER.x + 160 + 260 * reachOut, 735 - 200 * reachOut];
	}
	const lookUp = prog(f, c[4], 14, ease.inOut) * (1 - prog(f, c[6] - 20, 16, ease.inOut));
	const startle = spring({frame: f - c[8] - 4, fps: 30, config: {damping: 9, stiffness: 140}});
	const pose0: Pose = f >= c[8] ? lerpPose({...POSES.write, head: 18}, {...POSES.recoil, lean: -6}, startle * 0.8) : {...POSES.write, head: 22 - 34 * lookUp, lean: (f < c[3] || (f >= c[3] && f < c[4]) ? 26 : 16) - 8 * lookUp};
	const pose: Pose = {...pose0, ...addPose(pose0, idle(f + 400, 'newcomb'), 0.5 * (1 - startle))};
	// formula & publication
	const fWrite = prog(f, c[6] + 8, 44, (x) => x);
	const fGold = prog(f, beatAfter(c[6] + 54), 12, ease.inOut);
	const printAt = beatAfter(c[7] + 4);
	const printed = f >= printAt;
	const printKick = onBeat(printAt);
	// the gust: the window bangs open on the beat after "然后——", the two sheets fly out
	const gustAt = beatAfter(c[8] + 2);
	const gust = prog(f, gustAt, 8, ease.out);
	const fly = (k: number) => prog(f, gustAt + 4 + k * 5, end - gustAt - 4, (x) => x);
	const sheetPos = (k: number): [number, number, number] => {
		const p = fly(k);
		const e = p * p * (3 - 2 * p);
		const [x, y] = quad([LEDGER.x + 125 + k * 30, 735], [1300, 200], [2330 + k * 40, 60 + k * 30], e);
		return [x, y + Math.sin(p * 9 + k) * 30, p * 540 * (k ? -1 : 1)];
	};
	const hitPunch = onBeat(0) * 0.05 + printKick * 0.02 + onBeat(gustAt) * 0.03;
	return (
		<FullFrame fadeIn={0} fadeOut={0} motes={1}>
			<EdgeLight />
			<g transform={`translate(960,540) scale(${1 + hitPunch}) translate(-960,-540)`}>
				<MotionBlur keys={keys} f={f} id="mb-flip">
					<Study1881
						f={f + 800}
						cam={cam}
						gust={gust}
						extra={
							<g opacity={prog(f, c[4], 20)}>
								<circle cx={1480} cy={240} r={6} fill="#fff4d6" />
								<circle cx={1480} cy={240} r={36} fill="url(#glow-lamp)" opacity={0.6} />
							</g>
						}
						desk={
							<>
								<g transform={`translate(${NX},${NY}) scale(${NS})`}>
									<Figure
										look={NEWCOMB}
										pose={pose}
										reach={{near: nfig(...safeReach(pose, NX, NY, NS, hand)), far: nfig(...safeReach(pose, NX, NY, NS, [720, 752], false))}}
										expression={f >= c[8] ? 'surprise' : lookUp > 0.5 ? 'thinking' : 'neutral'}
										blink={blinkAt(f, 'nwf')}
										rim="warm"
										shadow={false}
										holdNear={f >= c[6] && f < c[8] ? <rect x={-2} y={-34} width={4} height={40} rx={2} fill="#1a1410" transform="rotate(-30)" /> : undefined}
									/>
								</g>
								<Desk1881 f={f}>
									{/* the formula sheet (then the printed note) */}
									{fly(0) < 0.02 ? (
										<g transform={`translate(${LEDGER.x},${LEDGER.y}) skewX(-18) scale(1,0.62)`}>
											<rect x={0} y={-130} width={260} height={130} fill="#efe4c8" />
											{printed ? (
												<g>
													<text x={130} y={-108} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 9, letterSpacing: '0.12em', fill: '#2a1d10'}}>
														NOTE ON THE FREQUENCY OF USE OF THE DIFFERENT
													</text>
													<text x={130} y={-96} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 9, letterSpacing: '0.12em', fill: '#2a1d10'}}>
														DIGITS IN NATURAL NUMBERS. — BY SIMON NEWCOMB.
													</text>
													{Array.from({length: 5}, (_, i) => (
														<rect key={i} x={20} y={-84 + i * 10} width={220} height={3} fill="#3a2a1a" opacity={0.35} />
													))}
													<text x={130} y={-12} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 600, fontSize: 8, letterSpacing: '0.3em', fill: '#5a3d1c'}}>
														AMERICAN JOURNAL OF MATHEMATICS · VOL. IV · 1881
													</text>
												</g>
											) : null}
											<clipPath id="fml">
												<rect x={0} y={-130} width={260 * fWrite} height={130} />
											</clipPath>
											<g clipPath="url(#fml)" transform={printed ? 'translate(0,24) scale(1,0.8)' : undefined}>
												<text x={130} y={printed ? -40 : -58} textAnchor="middle" style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontWeight: 700, fontSize: 30, fill: fGold > 0.5 ? '#a8742a' : '#2a1d10', ...LN}}>
													P(d) = log(1 + 1/d)
												</text>
											</g>
											{fGold > 0 ? <rect x={0} y={-130} width={260} height={130} fill={GOLD} opacity={0.25 * Math.sin(fGold * Math.PI)} /> : null}
										</g>
									) : null}
									<Sheet rows={8} x={LEDGER.x - 250} y={LEDGER.y + 4} />
									<BookFront id="fbook" wear={wear} ping={ping}>
										<Flicks events={events} f={f} />
									</BookFront>
									{/* the numbers: one per beat from the sheet, then the world's numbers pouring in */}
									{mech.map((m, i) => (
										<FlyingNumber key={`m${i}`} from={[LEDGER.x + 130, 720]} to={[sectionX(m.d), BOOK.y - 4]} t={(f - m.t0) / (m.t1 - m.t0)} text={m.text} size={20} />
									))}
									{stream.map((s, i) => (
										<FlyingNumber key={`s${i}`} from={s.from} to={[sectionX(s.d), BOOK.y - 4]} t={(f - s.t0) / (s.t1 - s.t0)} text={s.text} size={52} trail />
									))}
									{/* the two sheets in the gust */}
									{f >= gustAt + 4
										? [0, 1].map((k) => {
												const [x, y, r] = sheetPos(k);
												return <rect key={k} x={x - 60} y={y - 40} width={120} height={80} fill="#efe4c8" transform={`rotate(${r},${x},${y}) scale(1,1)`} opacity={0.95} />;
											})
										: null}
								</Desk1881>
							</>
						}
					/>
				</MotionBlur>
			</g>
			{/* the gust: snow blown in through the open window */}
			{gust > 0 ? <Snow f={f * 3} n={140} seed="gust" size={1.6} speed={2.4} o={0.7 * gust} /> : null}
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 4. twist: the silent break — snow, archive, 1938

const BENFORD_LOOK: Look = {skin: P.skin1, hair: 'slick', hairColor: P.hairGray, outfit: 'suit', top: '#4a4238', bottom: '#2f2a26', accent: '#6e4a2a', glasses: true};
const BX = 800;
const BY = 1130;
const bfig = (wx: number, wy: number): [number, number] => [(wx - BX) / NS, (wy - BY) / NS];

const Twist: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const beats = useLocalBeats();
	const end = scene.duration;
	const c1 = cue(1);
	const c2 = cue(2);
	const land = 120;
	const keys: Key[] = [
		[0, 520, -760, 2.2],
		[60, 420, -260, 1.75],
		[land, 320, 640, 1.55],
		[c1 + 14, 420, 640, 1.45],
		[c1 + 96, 1260, 640, 1.32],
		[end, 1300, 660, 1.3],
	];
	const cam = camPath(keys, f);
	const lampAt = beats.find((b) => b >= c1 + 30) ?? c1 + 30;
	const lamp = f >= lampAt ? 1 - Math.exp(-(f - lampAt) / 2) : 0;
	// the two pages drift down through snow onto the journal stack
	const sheet = (k: number): [number, number, number] => {
		const p = prog(f, 0, land + k * 8, (x) => 1 - (1 - x) * (1 - x));
		const x = 520 - 220 * p + Math.sin(f / 14 + k) * 40 * (1 - p) + k * 18;
		const y = -900 + (1588 - k * 5) * p;
		return [x, y, (1 - p) * 30 * Math.sin(f / 11 + k * 2)];
	};
	const snowToDust = prog(f, 40, 70, ease.inOut);
	// Benford: studying the same worn edge; then he sits back, unconvinced
	const study = prog(f, c1 + 50, 30, ease.inOut);
	const sitBack = spring({frame: f - c2 - 4, fps: 30, config: {damping: 13, stiffness: 90}});
	const run = prog(f, c1 + 60, c2 - c1 - 60, ease.inOut);
	const hand: [number, number] = sitBack > 0.5 ? [940, 745] : [LAB_BOOK.x + 20 + run * 110, LAB_BOOK.y + 2];
	const pose0: Pose = lerpPose({...POSES.write, head: 20, lean: 14}, {...POSES.think, head: 2}, sitBack);
	const pose: Pose = {...pose0, ...addPose(pose0, idle(f, 'benford'), 0.7)};
	return (
		<FullFrame fadeIn={0} fadeOut={0} motes={0.6 * snowToDust}>
			<EdgeLight />
			<MotionBlur keys={keys} f={f} id="mb-twist">
				<BreakWorld
					f={f}
					cam={cam}
					lamp={lamp}
					desk={
						<>
							<g transform={`translate(${BX},${BY}) scale(${NS})`} opacity={prog(f, c1, 20)}>
								<Figure look={BENFORD_LOOK} pose={pose} reach={{near: bfig(...safeReach(pose, BX, BY, NS, hand)), far: bfig(...safeReach(pose, BX, BY, NS, [860, 752], false))}} expression={sitBack > 0.5 ? 'stern' : study > 0.5 ? 'thinking' : 'neutral'} blink={blinkAt(f, 'bf')} rim="warm" shadow={false} />
							</g>
							<rect x={700} y={760} width={2600} height={40} fill="#3a2a1e" />
							<rect x={700} y={760} width={2600} height={6} fill="#6a4a32" />
							<rect x={700} y={800} width={2600} height={600} fill="#21170f" />
							<BookFront b={LAB_BOOK} id="lbook" wear={1} tabs={1} />
							{[0, 1].map((k) => {
								const [x, y, r] = sheet(k);
								return (
									<g key={k} transform={`translate(${x},${y}) rotate(${r})`}>
										<rect x={-60} y={-4} width={120} height={8} fill="#efe4c8" opacity={0.95} />
										<rect x={-60} y={-4} width={120} height={8} fill="#8a6a3a" opacity={0.4 * snowToDust} />
									</g>
								);
							})}
						</>
					}
				/>
			</MotionBlur>
			{/* snow that becomes archive dust */}
			<Snow f={f * (1 - 0.7 * snowToDust)} n={110} seed="brk" size={1.2 - 0.5 * snowToDust} speed={1 - 0.6 * snowToDust} o={0.8 - 0.4 * snowToDust} />
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 5. benford: counting, one card per beat

const CATS = ['河流', '人口', '门牌号', '物理常数', '分子量', '死亡率'];
const Benford: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const beats = useLocalBeats().filter((b) => b >= 0 && b < scene.duration);
	const end = scene.duration;
	const c1 = cue(1);
	const keys: Key[] = [
		[-30, 1300, 660, 1.3],
		[end, 1520, 690, 1.55],
	];
	const cam = camPath(keys, f);
	const TRAY = (d: number) => 1640 + (d - 5) * 58;
	// he deals at a human pace, speeding up as he gets the rhythm of it (not one per beat)
	const cardBeats: number[] = [];
	for (let t = 8, i = 0; i < 14 && t < c1 + 4; i++) {
		cardBeats.push(Math.round(t));
		t += 6 + 14 * Math.pow(0.84, i) + 4 * (random(`cg${i}`) - 0.5);
	}
	const cards = cardBeats.map((b, i) => {
		const d = benfordDigit(random(`cd${i}`) * 0.98);
		return {t0: b - 12, t1: b, d, cat: CATS[i % CATS.length], text: logNumber(`bc${i}`, d)};
	});
	const counted = (d: number) => cards.filter((c) => f >= c.t1 && c.d === d).length;
	const grow = prog(f, 0, end, (x) => x);
	const total = Math.round(20229 * Math.min(1, prog(f, cue(0), c1 + 16 - cue(0), (x) => x * x)));
	const landed = f >= c1 + 16;
	const bBase: Pose = {...POSES.write, head: 18, lean: 12};
	const bPose: Pose = {...bBase, ...addPose(bBase, idle(f + 300, 'benford'), 0.6)};
	const hand: [number, number] = (() => {
		const cur = cards.filter((c) => f >= c.t0 - 4).pop();
		if (!cur) return [960, 742];
		const p = prog(f, cur.t0 - 4, 10, ease.out);
		return [960 + 40 * p, 742 - 14 * p];
	})();
	return (
		<FullFrame fadeIn={0} fadeOut={0} motes={0.6}>
			<EdgeLight />
			<BreakWorld
				f={f + 300}
				cam={cam}
				lamp={1}
				desk={
					<>
						<g transform={`translate(${BX},${BY}) scale(${NS})`}>
							<Figure look={BENFORD_LOOK} pose={bPose} reach={{near: bfig(...safeReach(bPose, BX, BY, NS, hand)), far: bfig(...safeReach(bPose, BX, BY, NS, [860, 752], false))}} expression="thinking" blink={blinkAt(f + 300, 'bf')} rim="warm" shadow={false} />
						</g>
						<rect x={700} y={760} width={2600} height={40} fill="#3a2a1e" />
						<rect x={700} y={760} width={2600} height={6} fill="#6a4a32" />
						<rect x={700} y={800} width={2600} height={600} fill="#21170f" />
						<BookFront b={LAB_BOOK} id="lbook2" wear={1} tabs={1} />
						{/* card box */}
						<g transform="translate(960,760)">
							<rect x={-40} y={-36} width={80} height={36} fill="url(#wood)" />
							{Array.from({length: 6}, (_, i) => (
								<rect key={i} x={-34} y={-44 - i * 2} width={68} height={10} fill="#efe6d2" />
							))}
						</g>
						{/* nine trays: stacks grow in Benford's proportions */}
						{Array.from({length: 9}, (_, k) => {
							const d = k + 1;
							const hh = (BENF[d] / 30.1) * 70 * grow + counted(d) * 3;
							return (
								<g key={d} transform={`translate(${TRAY(d)},760)`}>
									<rect x={-26} y={-hh} width={52} height={hh} fill="#e9dfc6" />
									{Array.from({length: Math.floor(hh / 4)}, (_, j) => (
										<line key={j} x1={-26} y1={-j * 4} x2={26} y2={-j * 4} stroke="#b9a682" strokeWidth={0.8} opacity={0.6} />
									))}
									<rect x={-30} y={-8} width={60} height={8} fill="url(#wood)" />
									<text y={22} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 18, fill: d === 1 ? GOLD : '#c8bfa8', ...LN}}>
										{d}
									</text>
								</g>
							);
						})}
						{cards.map((c, i) => {
							const t = (f - c.t0) / (c.t1 - c.t0);
							if (t < 0 || t > 1) return null;
							const e = t * t * (3 - 2 * t);
							const [x, y] = quad([980, 712], [(980 + TRAY(c.d)) / 2, 560], [TRAY(c.d), 700], e);
							return (
								<g key={i} transform={`translate(${x},${y}) rotate(${(1 - e) * -8})`}>
									<rect x={-38} y={-22} width={76} height={44} rx={2} fill="#efe6d2" />
									<text y={-6} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 700, fontSize: 10, fill: '#5a4a32'}}>
										{c.cat}
									</text>
									<text y={13} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 15, fill: '#2a2018', ...LN}}>
										<tspan fill="#a8742a">{c.text[0]}</tspan>
										{c.text.slice(1)}
									</text>
								</g>
							);
						})}
						{/* the running count, above the trays; it stops on 20,229 and stays */}
						<text x={1640} y={610} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 52, fill: landed ? GOLD : '#f3ede2', ...LN}} filter={landed ? 'url(#g-sm)' : undefined} opacity={prog(f, cue(0), 10)}>
							{total.toLocaleString('en-US')}
						</text>
					</>
				}
			/>
		</FullFrame>
	);
};

export const scenes: SceneMap = {Hook, Office: Edge, Edge, Flip, Twist, Benford, Town, Reveal, Cheques, City, Coda};
