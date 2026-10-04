import React from 'react';
import {AbsoluteFill, Sequence, interpolate, interpolateColors, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {noise2D} from '@remotion/noise';
import {geoGraticule10, geoInterpolate, geoNaturalEarth1, geoPath} from 'd3-geo';
import {Liquid} from '../../src/art/glow/Liquid';
import {GlowDefs} from '../../src/art/glow/kit';
import {ADENOSINE, CAFFEINE} from '../../src/art/glow/molecules';
import {EndCard, GoldTitle, Motif, type BrandCfg, type VideoCfg} from '../../src/brand/Brand';
import {JUNO} from '../../src/brand/identity';
import {ease, prog, useAbsoluteFrame, useCue, useHitFrames, useScene, useSnapBeat} from '../../src/lib/context';
import {font} from '../../src/lib/theme';
import type {SceneMap, SceneProps} from '../../src/lib/types';
import {Bean, Branches, Caf, Clock, CORE, Cup, Defs3, Glow, LineBee, LineFlower, Num, Rays, Receptor, Room, Thin, Trees, leafD, ridgeD} from './kit3';
import {Grade, LAND, Tag} from './look3';

/**
 * 《续命》 v3. The craft rules of the reference: one soft light per shot, everything
 * else near-silhouette; thin lines; depth from many small elements; light as the
 * hero material. Every cut hands an object to the next shot. Brand: the gold title
 * card gathers out of the cup on the 16.1 s hit; corner mark throughout; the Juno
 * end card for the last ~6 s.
 */

const W = 1920;
const H = 1080;
const GOLD = JUNO.colors.gold;

const BRAND: BrandCfg = {videos: []};
export const EPISODE: VideoCfg = {
	id: 'xuming',
	src: '',
	title: '续命',
	kicker: 'CAFFEINE · COFFEA ARABICA · DENOEUD 2014',
	tagline: '它续的，到底是什么？',
	taglineEn: 'What does your morning cup actually renew?',
	motif: 'coffee',
	card: [0, 3.2],
	hit: 0.5,
	extend: 0,
	question: '你今天第几杯了？评论区报个数',
	sources: '参考 · Denoeud et al., Science (2014) · Nathanson, Science (1984) · Wright et al., Science (2013) · Nature Genetics (2024) · coffee history (Ukers)',
	duration: 0,
};

// ---------------------------------------------------------------- shared

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
/** fade a text/label in and hold it still; optional fade out */
const landed = (f: number, at: number, out?: number, len = 12) => prog(f, at, len) * (out === undefined ? 1 : 1 - prog(f, out, len));

/** n event frames inside [a, b): the track's accents first, topped up with beats */
const useEvents = () => {
	const hits = useHitFrames(0.3);
	const snap = useSnapBeat();
	return (a: number, b: number, n: number, step = 16) => {
		const found = hits.filter((h) => h >= a && h < b);
		if (found.length >= n) return found.slice(0, n);
		// not enough accents in the window: walk the beat grid from its start instead
		const out: number[] = [];
		let t = snap(a);
		if (t < a) t = snap(a + step / 2);
		while (out.length < n) {
			out.push(t);
			t = Math.max(snap(t + step), t + 6);
		}
		return out;
	};
};

/** the stage: an HTML layer under (liquid), the art, the subtitle band, grade; overlays on top */
const Stage: React.FC<{children: React.ReactNode; under?: React.ReactNode; over?: React.ReactNode; scrim?: number; defs?: React.ReactNode; cam?: {x?: number; y?: number; s?: number}}> = ({
	children,
	under,
	over,
	scrim = 0.6,
	defs,
	cam,
}) => (
	<AbsoluteFill style={{background: '#05060b'}}>
		{under}
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
			<GlowDefs />
			<Defs3 />
			<defs>
				<linearGradient id="sub-band" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#000" stopOpacity="0" />
					<stop offset="1" stopColor="#000" stopOpacity="0.9" />
				</linearGradient>
				<radialGradient id="brand-glow">
					<stop offset="0" stopColor="#ffe7b0" stopOpacity="0.9" />
					<stop offset="0.35" stopColor={GOLD} stopOpacity="0.35" />
					<stop offset="1" stopColor={GOLD} stopOpacity="0" />
				</radialGradient>
				<filter id="mblur" x="-10%" y="-40%" width="120%" height="180%">
					<feGaussianBlur stdDeviation="0 6" />
				</filter>
				{defs}
			</defs>
			<g transform={cam ? `translate(${960 + (cam.x ?? 0)},${540 + (cam.y ?? 0)}) scale(${cam.s ?? 1}) translate(-960,-540)` : undefined}>{children}</g>
			<rect x={0} y={840} width={W} height={240} fill="url(#sub-band)" opacity={scrim} />
			<Grade />
		</svg>
		{over}
	</AbsoluteFill>
);

/** depth-of-field motes drifting upward; near ones big and soft */
const Motes: React.FC<{f: number; seed: string; n?: number; color?: string; o?: number; speed?: number}> = ({f, seed, n = 46, color = '#ffe2b0', o = 1, speed = 1}) => (
	<g>
		{Array.from({length: n}, (_, i) => {
			const near = random(`${seed}z${i}`) > 0.86;
			const u = (random(`${seed}u${i}`) + (f * speed) / (near ? 260 : 520)) % 1;
			const x = random(`${seed}x${i}`) * W + 26 * Math.sin(u * 6 + i);
			const y = H + 40 - u * (H + 80);
			return <circle key={i} cx={x} cy={y} r={near ? 16 + random(`${seed}r${i}`) * 18 : 1.2 + random(`${seed}r${i}`) * 2} fill={color} opacity={(near ? 0.07 : 0.4) * Math.sin(u * Math.PI) * o} filter={near ? 'url(#b8)' : undefined} />;
		})}
	</g>
);

/** liquid, full frame or clipped to a cup of radius `rim` */
const CupLiquid: React.FC<{rim: number; t: number; swirl?: number; dim?: number; cool?: number; light?: [number, number, number]; scale?: number; gain?: number; veins?: number; kick?: number}> = ({
	rim,
	t,
	swirl = 0,
	dim = 1,
	cool = 0,
	light = [0.5, 0.42, 0.5],
	scale = 2.2,
	gain = 1.05,
	veins = 0.9,
	kick = 1,
}) => (
	<div style={{position: 'absolute', left: 960 - rim, top: 540 - rim, width: rim * 2, height: rim * 2, borderRadius: '50%', overflow: 'hidden', opacity: dim, transform: `scale(${kick})`}}>
		<div style={{position: 'absolute', left: rim - 960, top: rim - 540, width: W, height: H}}>
			<Liquid t={t} swirl={swirl} scale={scale} light={light} gain={gain} cool={cool} veins={veins} />
		</div>
	</div>
);

const CupRim: React.FC<{r: number; o?: number}> = ({r, o = 1}) => (
	<g opacity={o}>
		<circle cx={960} cy={556} r={r + 100} fill="#000" opacity={0.6} filter="url(#b8)" />
		<circle cx={960} cy={540} r={r + 36} fill="none" stroke="#efe2c8" strokeWidth={50} opacity={0.07} />
		<circle cx={960} cy={540} r={r + 62} fill="none" stroke="#f6e7c8" strokeWidth={1.4} opacity={0.55} />
		<circle cx={960} cy={540} r={r + 4} fill="none" stroke="#f6e7c8" strokeWidth={1} opacity={0.35} />
	</g>
);

/** slot-machine digits: every column rolls and all land together on `land` */
const Rolling: React.FC<{value: string; f: number; start: number; land: number; y: number; size: number; id: string}> = ({value, f, start, land, y, size, id}) => {
	const chars = [...value];
	const cw = size * 0.56;
	const total = chars.reduce((s, c) => s + (c === ',' || c === '+' ? cw * 0.5 : cw), 0);
	let x = 960 - total / 2;
	return (
		<g>
			<defs>
				<clipPath id={`slot${id}`}>
					<rect x={0} y={y - size * 0.76} width={W} height={size * 0.92} />
				</clipPath>
			</defs>
			<g clipPath={`url(#slot${id})`}>
				{chars.map((c, i) => {
					const narrow = c === ',' || c === '+';
					const cx = x + (narrow ? cw * 0.25 : cw / 2);
					x += narrow ? cw * 0.5 : cw;
					if (!/[0-9]/.test(c)) {
						return (
							<text key={i} x={cx} y={y} textAnchor="middle" opacity={prog(f, start, 10)} style={{fontFamily: font.latin, fontWeight: 500, fontSize: size, fill: 'url(#gold-text)'}}>
								{c}
							</text>
						);
					}
					const d = Number(c);
					const spins = 2 + Math.floor((chars.length - i) / 2);
					const k = interpolate(f, [start + i * 1.5, land], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.out});
					const pos = k * (spins * 10 + d);
					const base = Math.floor(pos);
					const frac = pos - base;
					return (
						<g key={i}>
							{[0, 1].map((o) => (
								<text key={o} x={cx} y={y + (o - frac) * size} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 500, fontSize: size, fill: 'url(#gold-text)'}} filter={k < 1 ? 'url(#mblur)' : 'url(#g-sm)'}>
									{(((base + o) % 10) + 10) % 10}
								</text>
							))}
						</g>
					);
				})}
			</g>
		</g>
	);
};

/** one heartbeat (P-QRS-T) as a function of frames since the beat */
const pqrst = (d: number) => {
	if (d < 0 || d > 16) return 0;
	const g = (c: number, w: number) => Math.exp(-(((d - c) / w) ** 2));
	return 0.09 * g(2, 1.1) - 0.12 * g(5.2, 0.35) + 1 * g(6, 0.42) - 0.28 * g(6.9, 0.4) + 0.2 * g(11, 1.8);
};

// ---------------------------------------------------------------- 1. hook (the v2 opening): liquid gold, two billion, a heartbeat, the cup

const Hook: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const cue0 = useCue();
	const cue = (i: number, o = 0) => cue0(i + 1, o); // line 0 is the opening pause
	const scene = useScene();
	const snap = useSnapBeat();
	const events = useEvents();
	const end = scene.duration;
	const t = af / 30 + 10;
	// two billion, landing on an accent
	const landC = events(cue(0) + 50, cue(1) - 24, 1)[0];
	const cO = landed(f, cue(0) + 2, cue(1) - 12);
	// the line goes flat; a drop of coffee lands on it; it beats back to life
	const dropAt = events(cue(1) + 6, cue(1) + 40, 1)[0];
	const beats: {at: number; a: number}[] = [{at: dropAt, a: 1.5}];
	for (let b = snap(dropAt + 15); b < cue(2) + 40; b = Math.max(snap(b + 15), b + 12)) beats.push({at: b, a: 0.95 + 0.1 * random(`bt${b}`)});
	const lineO = prog(f, cue(1) - 16, 14) * (1 - prog(f, cue(2) + 34, 16));
	const impact = f >= dropAt ? Math.exp(-(f - dropAt) / 7) : 0;
	const fall = prog(f, dropAt - 24, 24, ease.in);
	const dropY = mix(-60, 540, fall);
	const head = 1480;
	let ecg = '';
	for (let x = 100; x <= head; x += 3) {
		const tx = f - (head - x) / 11;
		let v = 0.006 * noise2D('flat', x / 30, f / 8);
		for (const b of beats) v += b.a * pqrst(tx - b.at);
		ecg += `${ecg ? 'L' : 'M'}${x},${540 - v * 250} `;
	}
	const headV = beats.reduce((s, b) => s + b.a * pqrst(f - b.at), 0);
	const bpm = Math.round(interpolate(f, [dropAt, dropAt + 15, dropAt + 40], [0, 44, 72], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
	// pull back: the liquid is one cup
	const backStart = cue(2) + 40;
	const back = prog(f, backStart, end - backStart - 2, ease.inOut);
	const rim = mix(1300, 380, back);
	const swirl = 0.3 + 4.6 * prog(f, backStart, end - backStart, ease.in);
	return (
		<Stage
			under={<CupLiquid rim={rim} t={t} swirl={swirl} gain={0.95 + 0.55 * impact} veins={0.88} scale={2.2 + 1.2 * back} kick={1 + 0.045 * impact} light={[mix(0.66, 0.5, back), mix(0.36, 0.45, back), mix(0.55, 0.38, back)]} />}
		>
			<CupRim r={rim} o={prog(f, backStart + 20, 30)} />
			<Motes f={af} seed="hk" n={50} o={1 - back} />
			{/* two billion */}
			{cO > 0 ? (
				<g opacity={cO}>
					<rect y={300} width={W} height={440} fill="url(#band2)" />
					<Rolling value="2,000,000,000" f={f} start={cue(0) + 4} land={landC} y={570} size={150} id="hk" />
					<text x={960} y={640} textAnchor="middle" opacity={prog(f, landC - 4, 14)} style={{fontFamily: font.sans, fontSize: 22, letterSpacing: '0.6em', fill: '#efe4d0'}}>
						杯 · 每一天 · 全世界
					</text>
					{f >= landC ? <circle cx={960} cy={520} r={100 + 900 * prog(f, landC, 30, ease.out)} fill="none" stroke={GOLD} strokeWidth={1.4} opacity={0.5 * (1 - prog(f, landC, 30))} /> : null}
				</g>
			) : null}
			{/* the heartbeat */}
			{lineO > 0 ? (
				<g opacity={lineO}>
					<rect y={260} width={W} height={560} fill="url(#band2)" />
					<g opacity={0.07} stroke="#ffe0b0" strokeWidth={1}>
						{Array.from({length: 40}, (_, i) => <line key={`v${i}`} x1={i * 48} y1={330} x2={i * 48} y2={750} />)}
						{Array.from({length: 9}, (_, i) => <line key={`h${i}`} x1={0} y1={348 + i * 48} x2={W} y2={348 + i * 48} />)}
					</g>
					<defs>
						<linearGradient id="trail" x1="100" y1="0" x2={head} y2="0" gradientUnits="userSpaceOnUse">
							<stop offset="0" stopColor="#ffe7b8" stopOpacity="0" />
							<stop offset="0.6" stopColor="#ffe7b8" stopOpacity="0.5" />
							<stop offset="1" stopColor="#fff6e0" stopOpacity="1" />
						</linearGradient>
					</defs>
					<path d={ecg} fill="none" stroke="url(#trail)" strokeWidth={10} opacity={0.45} filter="url(#b8)" />
					<path d={ecg} fill="none" stroke="url(#trail)" strokeWidth={2.6} strokeLinejoin="round" />
					<circle cx={head} cy={540 - 250 * headV} r={46 + 60 * impact} fill="url(#ember)" />
					<text x={1770} y={150} textAnchor="end" style={{fontFamily: font.latin, fontWeight: 500, fontSize: 70, fill: '#ffe7b8'}}>
						{bpm}
					</text>
					<text x={1770} y={182} textAnchor="end" style={{fontFamily: font.sans, fontSize: 15, letterSpacing: '0.4em', fill: '#c99a5a'}}>
						BPM
					</text>
				</g>
			) : null}
			{/* the drop */}
			{f >= dropAt - 24 && f < dropAt ? (
				<g>
					{[1, 2, 3, 4].map((k) => {
						const yy = mix(-60, 540, prog(f - k * 1.2, dropAt - 24, 24, ease.in));
						return <ellipse key={k} cx={960} cy={yy - 10} rx={7 - k} ry={14} fill="#ffcf80" opacity={0.18 / k} />;
					})}
					<path d={`M960,${dropY - 26 - 20 * fall} C972,${dropY - 4} 974,${dropY + 10} 960,${dropY + 14} C946,${dropY + 10} 948,${dropY - 4} 960,${dropY - 26 - 20 * fall} Z`} fill="#e69a3a" />
					<circle cx={956} cy={dropY + 2} r={3} fill="#fff4dc" />
					<circle cx={960} cy={dropY} r={40} fill="url(#ember)" opacity={0.5} />
				</g>
			) : null}
			{impact > 0.02 ? (
				<g>
					<circle cx={960} cy={540} r={30 + 700 * (1 - impact)} fill="none" stroke="#ffe7b8" strokeWidth={2.4 * impact + 0.5} opacity={impact} />
					<circle cx={960} cy={540} r={20 + 420 * (1 - impact)} fill="none" stroke="#ffcf80" strokeWidth={1.2} opacity={0.6 * impact} />
					{Array.from({length: 10}, (_, i) => {
						const a = -Math.PI * (0.1 + 0.8 * (i / 9));
						const d = (1 - impact) * (90 + 40 * random(`cr${i}`));
						return <circle key={i} cx={960 + Math.cos(a) * d * 1.6} cy={540 + Math.sin(a) * d + (1 - impact) ** 2 * 140} r={4 * impact + 1} fill="#ffcf80" opacity={impact} />;
					})}
				</g>
			) : null}
		</Stage>
	);
};

// ---------------------------------------------------------------- 2. sleep: the Juno title in the cup, then the brain

/** The Juno gold title card, gathering out of the crema on the scene's first frame (the 16.1 s hit). */
const XTitle: React.FC<{f: number}> = ({f}) => {
	const gather = prog(f, -2, 26, ease.out);
	const ripple = prog(f, 0, 44, ease.out);
	const meta = (d: number) => prog(f, d, 16, ease.out);
	const out = 1 - prog(f, 138, 14);
	const kick = mix(0.9, 0.42, prog(f, 8, 30, ease.out));
	return (
		<g opacity={out}>
			<defs>
				<filter id="pour" x="-30%" y="-60%" width="160%" height="220%">
					<feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves={2} seed={5} />
					<feDisplacementMap in="SourceGraphic" scale={150 * (1 - gather)} xChannelSelector="R" yChannelSelector="G" />
				</filter>
			</defs>
			{ripple < 1 ? (
				<g fill="none" stroke={GOLD}>
					<circle cx={960} cy={540} r={60 + 860 * ripple} strokeWidth={2} opacity={0.6 * (1 - ripple)} filter="url(#g-sm)" />
					<circle cx={960} cy={540} r={40 + 540 * ripple} strokeWidth={1} opacity={0.45 * (1 - ripple)} />
				</g>
			) : null}
			<text x={960} y={300} textAnchor="middle" opacity={meta(6)} style={{fontFamily: font.latin, fontWeight: 600, fontSize: 20, letterSpacing: `${kick}em`, fill: GOLD}}>
				{EPISODE.kicker}
			</text>
			<g filter="url(#pour)" opacity={prog(f, -2, 10)}>
				<GoldTitle text={EPISODE.title} f={f} at={-2} size={150} y={560} />
			</g>
			<g transform="translate(960,670) scale(0.62)" opacity={meta(16)}>
				<Motif kind="coffee" p={prog(f, 14, 30)} f={f} />
			</g>
			<text x={960} y={772} textAnchor="middle" opacity={meta(22)} style={{fontFamily: font.serif, fontWeight: 700, fontSize: 38, fill: JUNO.colors.ink, letterSpacing: '0.08em'}}>
				{EPISODE.tagline}
			</text>
			<text x={960} y={814} textAnchor="middle" opacity={0.75 * meta(28)} style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 26, fill: JUNO.colors.ink}}>
				{EPISODE.taglineEn}
			</text>
			<text x={960} y={880} textAnchor="middle" opacity={0.85 * meta(34)} style={{fontFamily: font.sans, fontSize: 20, letterSpacing: '0.3em', fill: GOLD}}>
				— {JUNO.credit} · {JUNO.series} —
			</text>
		</g>
	);
};

const RX = [560, 960, 1360];
const RY = 770;

/** the synapse: two membranes, vesicles, three receptors; adenosine drifting in depth of field */
const SynapseScene: React.FC<{f: number; af: number; dots: number; docked: number[]; gold: number[]; lift?: number; dense?: number; mood?: number}> = ({f, af, dots, docked, gold, lift = 0, dense = 1, mood = 0}) => (
	<g>
		<Room x={960} y={420} r={1000} c={interpolateColors(mood, [0, 1], ['#2a2366', '#4a3a2a'])} base="#05040e" />
		<path d="M-40,250 C420,150 1500,150 1960,250 L1960,-40 L-40,-40 Z" fill="#9fe8f0" opacity={0.05} />
		<path d="M-40,250 C420,150 1500,150 1960,250" fill="none" stroke="#9fe8f0" strokeWidth={1.6} opacity={0.6} />
		{Array.from({length: 9}, (_, i) => (
			<circle key={i} cx={260 + i * 175 + 30 * Math.sin(i) + 6 * Math.sin(af / 40 + i)} cy={150 - 40 * Math.sin((i / 8) * Math.PI)} r={26 + 8 * random(`ves${i}`)} fill="none" stroke="#9fe8f0" strokeWidth={1.2} opacity={0.35} />
		))}
		<path d="M-40,790 C420,860 1500,860 1960,790" fill="none" stroke={gold.length >= 3 ? '#ffd896' : '#9fe8f0'} strokeWidth={1.6} opacity={0.6} />
		{RX.map((x, i) => {
			const g = gold[i] ?? 0;
			const d = docked[i] ?? 0;
			return (
				<g key={x}>
					<Receptor x={x} y={RY} gold={g > 0.5} docked={d > 0.5 && g <= 0.5} />
					{g > 0 && g < 1 ? <circle cx={x} cy={RY - 30} r={40 + 260 * g} fill="none" stroke="#ffd896" strokeWidth={2} opacity={1 - g} /> : null}
					{d > 0 && d < 1 ? <circle cx={x} cy={RY - 30} r={30 + 160 * d} fill="none" stroke="#ffcf80" strokeWidth={1.4} opacity={1 - d} /> : null}
				</g>
			);
		})}
		{Array.from({length: Math.round(110 * dense)}, (_, i) => {
			if (i / (110 * dense) > dots) return null;
			const z = random(`az${i}`);
			const x = random(`ax${i}`) * W + 34 * noise2D('ad', i, af / 150);
			const y = 280 + random(`ay${i}`) * 400 + 18 * noise2D('ady', i, af / 170) - lift * (600 + 400 * random(`al${i}`));
			const far = z < 0.8;
			const r = far ? 2 + 3 * z : 14 + 60 * (z - 0.8);
			const born = clamp((dots * 110 * dense - i) / 3);
			return (
				<g key={i} opacity={(far ? 0.55 + 0.45 * z : 0.22) * born}>
					<circle cx={x} cy={y} r={r * 2.2} fill="url(#ember)" opacity={far ? 0.5 : 0.3} filter={far ? undefined : 'url(#b8)'} />
					<circle cx={x} cy={y} r={r * 0.5} fill="#ffe2a8" filter={far ? undefined : 'url(#b8)'} />
				</g>
			);
		})}
	</g>
);

/** a molecule rotating about the vertical axis: atoms get depth, size and brightness from it */
const Model3D: React.FC<{mol: typeof CAFFEINE; th: number; hl?: (id: string) => number; tint?: string; o?: number}> = ({mol, th, hl, tint, o = 1}) => {
	const ELEM: Record<string, string> = {N: '#7fb8ff', O: '#ff8a7a', C: '#e8e2d4'};
	const el = (l?: string) => (!l ? 'C' : l.startsWith('N') ? 'N' : l.startsWith('O') || l === 'HO' ? 'O' : 'C');
	const pts: Record<string, {x: number; y: number; z: number; e: string}> = {};
	for (const [id, a] of Object.entries(mol.atoms)) {
		const z0 = 12 * Math.sin(a.p[0] * 0.03 + a.p[1] * 0.02);
		pts[id] = {x: a.p[0] * Math.cos(th) + z0 * Math.sin(th), y: a.p[1], z: -a.p[0] * Math.sin(th) + z0 * Math.cos(th), e: el(a.label)};
	}
	const order = Object.keys(pts).sort((a, b) => pts[a].z - pts[b].z);
	return (
		<g opacity={o}>
			{mol.bonds.map(([a, b], i) => (
				<line key={i} x1={pts[a].x} y1={pts[a].y} x2={pts[b].x} y2={pts[b].y} stroke={tint ?? '#d8dce8'} strokeWidth={2.2} opacity={0.55} />
			))}
			{order.map((id) => {
				const p = pts[id];
				const h = hl ? hl(id) : 0;
				const c = tint ?? ELEM[p.e];
				const s = 1 + p.z / 160;
				return (
					<g key={id}>
						{h > 0 ? <circle cx={p.x} cy={p.y} r={26 * h} fill="#5fd8e6" opacity={0.45 * h} filter="url(#g-md)" /> : null}
						<circle cx={p.x} cy={p.y} r={15 * s} fill={c} opacity={0.22} filter="url(#g-md)" />
						<circle cx={p.x} cy={p.y} r={(p.e === 'C' ? 7 : 9) * s} fill={h > 0.5 ? '#bff4ff' : c} />
						<circle cx={p.x - 2.5 * s} cy={p.y - 2.5 * s} r={2.4 * s} fill="#fff" opacity={0.9} />
					</g>
				);
			})}
		</g>
	);
};

const Sleep: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const cue = useCue();
	const scene = useScene();
	const events = useEvents();
	const end = scene.duration;
	const t = af / 30 + 10;
	// title in the cup (0–150), then down through the crema into the dark of a neuron
	const dive = prog(f, 138, 30, ease.in);
	const rim = mix(380, 1500, dive);
	const neuron = prog(f, 150, 24, ease.out) * (1 - prog(f, 228, 22));
	// the synapse: adenosine builds up through line 0, docks during line 1
	const syn = prog(f, 220, 26);
	const dots = prog(f, cue(0) + 40, cue(1) - cue(0) + 20, (x) => x);
	const dock = events(cue(1) + 6, cue(2) - 20, 3, 18);
	const docked = dock.map((d) => (f >= d ? Math.min(1, (f - d) / 16) : 0));
	const lids = prog(f, cue(1) + 10, cue(2) - cue(1) - 20, ease.inOut) * (1 - prog(f, cue(2) - 14, 10));
	const darker = docked.reduce((s, d) => s + (d > 0 ? 0.13 : 0), 0) * (1 - prog(f, cue(2) - 14, 10));
	// zoom into the docked molecule → the 3D models
	const zin = prog(f, cue(2) - 16, 20, ease.in);
	const mol = prog(f, cue(2) - 2, 14) * (1 - prog(f, cue(3) - 14, 14));
	const th = -0.9 + 1.1 * prog(f, cue(2) - 2, cue(3) - cue(2), ease.inOut);
	const cafIn = prog(f, cue(2) + 40, 40, ease.inOut);
	const coreHits = events(cue(2) + 70, cue(3) - 16, 3, 10);
	const coreLit = (id: string) => {
		if (!CORE.has(id)) return 0;
		const idx = ['C5', 'C4', 'N3', 'C2', 'N1', 'C6', 'N9', 'C8', 'N7'].indexOf(id);
		const at = coreHits[Math.min(2, Math.floor(idx / 3))];
		return prog(f, at, 10);
	};
	// back out: caffeine takes the receptors on the beats; adenosine is turned away
	const back = prog(f, cue(3) - 14, 22, ease.out);
	const cafAt = events(cue(3) + 8, cue(4) - 10, 3, 16);
	const gold = cafAt.map((a) => (f >= a ? Math.min(1, (f - a) / 18) : 0));
	const truck = prog(f, cue(4) - 10, cue(5) - cue(4), ease.inOut);
	// pull back to the whole brain; the fatigue fog is held at the edge
	const brain = prog(f, cue(5) - 6, 30, ease.inOut);
	const fog = prog(f, cue(5) + 30, 70, ease.out);
	const flare = prog(f, end - 18, 18, ease.in);
	const camS = syn > 0 && brain < 1 ? 1 + 0.05 * prog(f, 220, cue(2) - 220) * (1 - back) + 6 * (zin * (1 - back)) ** 2 : 1;
	return (
		<Stage
			under={f < 175 ? <CupLiquid rim={rim} t={t} swirl={mix(4.9, 1.2, prog(f, 0, 60, ease.out)) + 4 * dive} cool={prog(f, 150, 25)} dim={1 - prog(f, 150, 25)} gain={1.05} scale={mix(3.4, 2.0, dive)} /> : null}
			over={
				<Sequence durationInFrames={160} layout="none">
					<AbsoluteFill>
						<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
							<GlowDefs />
							<defs>
								<radialGradient id="brand-glow">
									<stop offset="0" stopColor="#ffe7b0" stopOpacity="0.9" />
									<stop offset="0.35" stopColor={GOLD} stopOpacity="0.35" />
									<stop offset="1" stopColor={GOLD} stopOpacity="0" />
								</radialGradient>
							</defs>
							<circle cx={960} cy={540} r={380} fill="#05060b" opacity={0.5 * prog(f, 0, 16) * (1 - prog(f, 134, 14))} />
							<XTitle f={f} />
						</svg>
					</AbsoluteFill>
				</Sequence>
			}
		>
			{f < 175 ? <CupRim r={rim} o={1 - prog(f, 138, 20)} /> : null}
			{/* the neuron grows out of the dark */}
			{neuron > 0 ? (
				<g opacity={neuron}>
					<Room x={960} y={540} r={900} c="#2a2366" base="#05040e" />
					{(() => {
						const out: React.ReactNode[] = [];
						const grow = (x0: number, y0: number, a: number, l: number, w: number, depth: number, key: string, born: number) => {
							if (depth > 6 || l < 10) return;
							const k = clamp((f - 150 - born) / 16);
							if (k <= 0) return;
							const bend = (random(`${key}b`) - 0.5) * 0.6;
							const x1 = x0 + Math.cos(a) * l;
							const y1 = y0 + Math.sin(a) * l;
							const len = l * 1.05;
							out.push(<path key={key} d={`M${x0},${y0} Q${x0 + Math.cos(a + bend) * l * 0.55},${y0 + Math.sin(a + bend) * l * 0.55} ${x1},${y1}`} fill="none" stroke="#9fe8f0" strokeWidth={w} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - k)} opacity={0.45 + 0.55 / (depth + 1)} />);
							if (k < 1) return;
							const n = depth < 2 ? 2 : random(key) > 0.35 ? 2 : 1;
							for (let i = 0; i < n; i++) grow(x1, y1, a + (random(`${key}a${i}`) - 0.5) * 1.0, l * (0.66 + 0.18 * random(`${key}l${i}`)), w * 0.66, depth + 1, `${key}${i}`, born + 7);
						};
						for (let k = 0; k < 9; k++) grow(960, 540, (k / 9) * Math.PI * 2 + random(`nn${k}`) * 0.4, 300, 5, 0, `nn${k}`, 0);
						return <g transform={`translate(960,540) scale(${1 + 0.6 * prog(f, 190, 60, ease.in)}) translate(-960,-540)`} filter="url(#g-sm)">{out}</g>;
					})()}
					<circle cx={960} cy={540} r={260} fill="url(#ember)" opacity={0.55} />
					<circle cx={960} cy={540} r={56} fill="#e8ffff" opacity={0.85} filter="url(#g-md)" />
				</g>
			) : null}
			{/* the synapse */}
			{syn > 0 && mol < 1 && brain < 1 ? (
				<g opacity={syn * (1 - mol) * (1 - brain)}>
					<g transform={`translate(${RX[0]},${RY - 30}) scale(${camS}) translate(${-RX[0] - 900 * truck * 0},${-(RY - 30)}) translate(${-60 * truck},0)`}>
						<SynapseScene f={f} af={af} dots={dots} docked={docked} gold={gold} lift={0} dense={1 + 0.8 * truck} mood={0.6 * back * gold.reduce((s, g) => s + g, 0) / 3} />
						{/* caffeine falling into place */}
						{RX.map((x, i) => {
							const at = cafAt[i];
							if (f < at - 22 || f >= at) return null;
							const u = prog(f, at - 22, 22, ease.in);
							return <Caf key={x} x={x + (1 - u) * 80 * (i % 2 ? -1 : 1)} y={mix(-60, RY - 30, u)} s={0.55} />;
						})}
						{/* turned away: adenosine bouncing off the occupied receptors */}
						{RX.map((x, i) => {
							const at = cafAt[i];
							if (f < at || f > at + 30) return null;
							const u = (f - at) / 30;
							return <Glow key={i} x={x + (i % 2 ? -1 : 1) * 140 * u} y={RY - 40 - 260 * Math.sin(u * Math.PI * 0.6)} r={22} o={1 - u} />;
						})}
					</g>
					<rect width={W} height={H} fill="#000" opacity={darker} />
					<rect width={W} height={300 * lids + 20} fill="url(#lidT)" opacity={lids > 0 ? 1 : 0} />
					<rect y={H - 300 * lids - 20} width={W} height={300 * lids + 20} fill="url(#lidB)" opacity={lids > 0 ? 1 : 0} />
					<g transform="translate(1690,200)" opacity={landed(f, cue(0) + 20, cue(2) - 20)}>
						<Clock x={0} y={0} r={70} h={8 + 15 * dots} m={(60 * 15 * dots) % 60} c="#cfe8ff" />
						<text y={110} textAnchor="middle" style={{fontFamily: font.latin, fontSize: 22, letterSpacing: '0.2em', fill: '#cfe8ff'}} opacity={0.8}>
							{`${String(Math.floor(8 + 15 * dots)).padStart(2, '0')}:${String(Math.floor((60 * 15 * dots) % 60)).padStart(2, '0')}`}
						</text>
					</g>
					<g opacity={landed(f, cue(0) + 10, cue(2) - 20)}>
						<Tag en="Adenosine" zh="腺苷 · 醒着时一点点积累" />
					</g>
					<g opacity={landed(f, cue(3) + 10, cue(5) - 6)}>
						<Tag en="Adenosine receptor" zh="腺苷受体 · 咖啡因占位，却不开锁" />
					</g>
				</g>
			) : null}
			{/* the key and the lock, in three dimensions */}
			{mol > 0 ? (
				<g opacity={mol}>
					<Room x={1000} y={520} r={900} c="#1f3a6a" base="#05040e" />
					<g transform={`translate(${mix(1000, 980, cafIn)},540) scale(${2.9 + 0.15 * prog(f, cue(2), cue(3) - cue(2))})`}>
						<Model3D mol={ADENOSINE} th={th} hl={coreLit} o={1 - 0.15 * cafIn} />
					</g>
					<g transform={`translate(${mix(2300, 1000, cafIn)},540) scale(${2.9 + 0.15 * prog(f, cue(2), cue(3) - cue(2))})`} opacity={0.55 * cafIn}>
						<Model3D mol={CAFFEINE} th={th + 0.6 * (1 - cafIn)} tint="#ffd896" />
					</g>
					<g opacity={landed(f, coreHits[2] + 6, cue(3) - 16)}>
						<Thin text="同一个骨架" x={960} y={170} size={64} fill="#9fe8f0" w={700} />
					</g>
					<g opacity={landed(f, cue(2) + 4)}>
						<Tag en="Adenosine · Caffeine" zh="腺苷与咖啡因 · 共享嘌呤骨架（青色）" />
					</g>
				</g>
			) : null}
			{/* the whole brain: a constellation; the fog of tiredness held at its edge */}
			{brain > 0 ? (
				<g opacity={brain}>
					<Room x={960} y={520} r={800} c="#3a2a50" base="#05040e" />
					<g transform={`translate(960,520) scale(${mix(1.6, 1, brain)}) translate(-960,-520)`}>
						{Array.from({length: 170}, (_, i) => {
							const a = random(`ba${i}`) * Math.PI * 2;
							const r = Math.sqrt(random(`br${i}`));
							const x = 960 + Math.cos(a) * r * 430;
							const y = 520 + Math.sin(a) * r * 300;
							const j = (i * 7 + 3) % 170;
							const a2 = random(`ba${j}`) * Math.PI * 2;
							const r2 = Math.sqrt(random(`br${j}`));
							const lit = prog(f, cue(5) + 10 + r * 50, 20);
							return (
								<g key={i}>
									{i % 2 ? <line x1={x} y1={y} x2={960 + Math.cos(a2) * r2 * 430} y2={520 + Math.sin(a2) * r2 * 300} stroke="#ffd896" strokeWidth={0.8} opacity={0.35 * lit} /> : null}
									<circle cx={x} cy={y} r={2.5} fill={lit > 0.5 ? '#ffe7b8' : '#9fe8f0'} />
								</g>
							);
						})}
						<Glow x={960} y={520} r={300} o={0.5 * prog(f, cue(5) + 10, 40)} />
						<ellipse cx={960} cy={520} rx={mix(420, 640, fog)} ry={mix(290, 460, fog)} fill="none" stroke="#7fd4d8" strokeWidth={140} opacity={0.12} filter="url(#b8)" />
						{Array.from({length: 70}, (_, i) => {
							const a = random(`fg${i}`) * Math.PI * 2 + af / 300;
							const rr = mix(300 + random(`fgr${i}`) * 100, 560 + random(`fgr${i}`) * 160, fog);
							return <circle key={i} cx={960 + Math.cos(a) * rr} cy={520 + Math.sin(a) * rr * 0.72} r={3 + random(`fgs${i}`) * 4} fill="#9fe8f0" opacity={0.6} />;
						})}
					</g>
					<g opacity={landed(f, cue(5) + 20, end - 20)}>
						<Tag en="Blocked, not removed" zh="疲惫没有消失 · 只是被挡在外面" />
					</g>
				</g>
			) : null}
			<Motes f={af} seed="sl" n={40} color="#cfe8ff" o={0.6 * syn} />
			<rect width={W} height={H} fill="#fff1d0" opacity={flare} />
		</Stage>
	);
};

export const scenesA = {Hook, Sleep};

// ---------------------------------------------------------------- 3. origin: a tree out of the light, the forest, two wild coffees

const Origin: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const cue = useCue();
	const scene = useScene();
	const events = useEvents();
	const end = scene.duration;
	const fromFlare = 1 - prog(f, 0, 20, ease.out);
	// C1: branches against the light, tilting down into the forest
	const c1 = 1 - prog(f, cue(1) - 20, 24);
	const tilt = prog(f, 0, cue(1) - 10, ease.inOut);
	// C2: the forest, a slow push through the layers
	const c2 = prog(f, cue(1) - 24, 24) * (1 - prog(f, cue(2) - 16, 18));
	const push = prog(f, cue(1) - 24, cue(2) - cue(1) + 30, (x) => x);
	const stamp = events(cue(1) + 20, cue(2) - 30, 1)[0];
	// C3a: two flowers, a grain of pollen crossing
	const c3 = prog(f, cue(2) - 16, 18) * (1 - prog(f, cue(2) + 90, 16));
	const draw = prog(f, cue(2) - 10, 40, ease.inOut);
	const pol = prog(f, cue(2) + 30, 50, ease.inOut);
	// C3b: chromosomes, 22 + 22 → 44
	const c4 = prog(f, cue(2) + 86, 16);
	const fly = prog(f, cue(2) + 90, 40, ease.out);
	const eqAt = events(cue(2) + 120, end - 20, 1)[0];
	const collapse = prog(f, end - 22, 22, ease.in);
	const pa: [number, number] = [560, 440];
	const pb: [number, number] = [1360, 440];
	const bez = (u: number): [number, number] => {
		const cx = 960;
		const cy = 300;
		return [(1 - u) ** 2 * pa[0] + 2 * (1 - u) * u * cx + u * u * pb[0], (1 - u) ** 2 * pa[1] + 2 * (1 - u) * u * cy + u * u * pb[1]];
	};
	return (
		<Stage>
			{c1 > 0 ? (
				<g opacity={c1}>
					<Room x={960} y={mix(300, 760, tilt)} r={1000} c="#9a7a3a" base="#04100a" />
					<rect width={W} height={H} fill="#0f3d2a" opacity={0.35} />
					<g transform={`translate(0,${mix(420, 0, tilt)})`}>
						<path d={ridgeD(860, 60, 'c1')} fill="#030a06" />
						<rect x={955} y={420} width={10} height={460} fill="#030a06" />
						<Branches x={960} y={430} s={1.9} color="#060c08" seed="tree" n={7} up w={10} len={170} />
					</g>
					<Motes f={af} seed="c1" n={50} />
				</g>
			) : null}
			{c2 > 0 ? (
				<g opacity={c2}>
					<Room x={1180} y={720} r={1100} c="#e8c27a" base="#03100a" />
					<rect width={W} height={H} fill="#0f3d2a" opacity={0.45} />
					<g opacity={0.7 + 0.3 * Math.sin(af / 30)}>
						<Rays x={1250} y={-60} n={9} o={0.16} />
					</g>
					<g transform={`translate(960,820) scale(${1 + 0.08 * push}) translate(-960,-820)`}>
						<Trees y={820} n={18} s={0.7} c="#1a3a24" seed="t1" o={0.55} />
					</g>
					<g transform={`translate(960,900) scale(${1 + 0.18 * push}) translate(-960,-900)`}>
						<Trees y={900} n={12} s={1} c="#0b1e12" seed="t2" o={0.85} />
					</g>
					<g transform={`translate(960,960) scale(${1 + 0.3 * push}) translate(-960,-960)`}>
						<path d={ridgeD(960, 50, 'c2')} fill="#030805" />
					</g>
					<Motes f={af} seed="c2" n={70} />
					<g opacity={landed(f, stamp)} style={{filter: `blur(${6 * (1 - prog(f, stamp, 14))}px)`}}>
						<Thin text="60 万年前" y={380} size={110} w={500} />
					</g>
					<g opacity={landed(f, cue(1) + 6)}>
						<Tag en="Coffea arabica · SW Ethiopia" zh="埃塞俄比亚西南高地森林" />
					</g>
				</g>
			) : null}
			{c3 > 0 ? (
				<g opacity={c3}>
					<Room x={960} y={540} r={1000} c="#3a6a4a" base="#03100a" />
					{[pa, pb].map(([x], i) => (
						<g key={i}>
							<defs>
								<clipPath id={`fl${i}`}>
									<circle cx={x} cy={480} r={40 + 400 * draw} />
								</clipPath>
							</defs>
							<g clipPath={`url(#fl${i})`} transform={`rotate(${3 * Math.sin(af / 50 + i)},${x},${480})`}>
								<LineFlower x={x} y={480} s={1.2} />
							</g>
							<text x={x} y={850} textAnchor="middle" opacity={landed(f, cue(2) + 10 + i * 6)} style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 34, fill: '#efe4d0'}}>
								{i ? 'Coffea canephora' : 'Coffea eugenioides'}
							</text>
						</g>
					))}
					{pol > 0 ? (
						<g>
							<path
								d={Array.from({length: 30}, (_, k) => {
									const [x, y] = bez(Math.max(0, pol - 0.25 + (k / 29) * 0.25));
									return `${k ? 'L' : 'M'}${x},${y}`;
								}).join(' ')}
								fill="none"
								stroke="#ffe7b8"
								strokeWidth={2}
								opacity={0.8}
							/>
							<Glow x={bez(pol)[0]} y={bez(pol)[1]} r={44} />
						</g>
					) : null}
					<Motes f={af} seed="c3" n={50} />
				</g>
			) : null}
			{c4 > 0 ? (
				<g opacity={c4 * (1 - collapse)}>
					<Room x={960} y={560} r={900} c="#2a4a3a" base="#03100a" />
					{Array.from({length: 44}, (_, i) => {
						const tx = 330 + (i % 11) * 126;
						const ty = 360 + Math.floor(i / 11) * 120;
						const fromLeft = i < 22;
						const sx = fromLeft ? -100 - random(`cx${i}`) * 300 : 2020 + random(`cx${i}`) * 300;
						const sy = 200 + random(`cy${i}`) * 600;
						const u = clamp(fly * 1.4 - random(`cd${i}`) * 0.4);
						const x = mix(mix(sx, tx, u), 960, collapse);
						const y = mix(mix(sy, ty, u), 540, collapse);
						const c = fromLeft ? '#9fe8f0' : '#ffd896';
						const h = 70 - (i % 11) * 3.5;
						return (
							<g key={i} transform={`translate(${x},${y}) rotate(${(1 - u) * 90 * (fromLeft ? 1 : -1)})`} stroke={c} strokeLinecap="round" filter="url(#g-sm)">
								<path d={`M-9,${-h / 2} Q0,0 -9,${h / 2} M9,${-h / 2} Q0,0 9,${h / 2}`} strokeWidth={5} fill="none" />
							</g>
						);
					})}
					<g opacity={landed(f, eqAt)}>
						<Num text="22 + 22 → 44" y={230} size={88} />
					</g>
					<g opacity={landed(f, cue(2) + 100)}>
						<Tag en="Allotetraploid" zh="阿拉比卡 · 四倍体 · 44 条染色体" />
					</g>
				</g>
			) : null}
			{collapse > 0 ? <Glow x={960} y={540} r={60 + 200 * collapse} o={collapse} /> : null}
			<rect width={W} height={H} fill="#fff1d0" opacity={fromFlare} />
		</Stage>
	);
};

// ---------------------------------------------------------------- 4. defense: a leaf full of caffeine, a caterpillar, the soil, three inventions

const LEAF_L = 1640;
const LEAF_W = 0.27;
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

const Defense: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const cue = useCue();
	const scene = useScene();
	const events = useEvents();
	const end = scene.duration;
	// D1: the leaf grows out of the glow; veins light; caffeine flows in them
	const grow = prog(f, 0, 26, ease.out);
	const veins = prog(f, 10, 40, ease.inOut);
	const pan = prog(f, 0, cue(2), (x) => x);
	const word = events(cue(0) + 6, cue(1) - 10, 1)[0];
	// D2: the caterpillar
	const crawl = prog(f, cue(1) - 6, 56, ease.inOut);
	const biteAt = cue(1) + 54;
	const bite = prog(f, biteAt, 6);
	const twitch = f > biteAt + 8 && f < biteAt + 36 ? 1 : 0;
	const curl = prog(f, biteAt + 34, 12, ease.inOut);
	const fall = prog(f, biteAt + 44, 30, ease.in);
	const cu = mix(0.96, 0.62, crawl);
	const [ex, ey] = leafEdge(cu);
	// D3: tilt down into the soil
	const tilt = prog(f, cue(2) - 8, 30, ease.inOut);
	const soilOut = prog(f, cue(3) - 10, 12);
	// D4: three spotlights
	const spots = events(cue(3) + 8, end - 30, 3, 16);
	const lit = spots.map((s) => prog(f, s, 12, ease.out));
	const whiteOut = prog(f, end - 14, 14, ease.in);
	return (
		<Stage
			defs={
				<mask id="bite3">
					<rect x={-300} y={-800} width={2400} height={1600} fill="#fff" />
					<circle cx={leafEdge(0.62)[0]} cy={leafEdge(0.62)[1] - 10} r={60 * bite} fill="#000" />
					<circle cx={leafEdge(0.59)[0]} cy={leafEdge(0.59)[1] - 4} r={40 * bite} fill="#000" />
				</mask>
			}
		>
			{soilOut < 1 ? (
				<g opacity={1 - soilOut}>
					<Room x={960} y={mix(540, -200, tilt)} r={900} c="#a8c86a" base="#040a05" o={0.7} />
					<g transform={`translate(0,${-1080 * tilt})`}>
						{/* the leaf */}
						<g transform={`translate(${140 - 120 * pan},560) rotate(${-5 + 0.6 * Math.sin(af / 40)}) scale(${grow})`}>
							<g mask="url(#bite3)">
								<path d={leafD(LEAF_L, LEAF_W)} fill="url(#leafLit)" />
								<path d={leafD(LEAF_L, LEAF_W)} fill="none" stroke="#f4ffc8" strokeWidth={1.2} opacity={0.6} />
								<path d={`M0,0 C500,-8 1100,-4 ${LEAF_L},0`} stroke="#f8ffd8" strokeWidth={2.4} fill="none" strokeDasharray={1700} strokeDashoffset={1700 * (1 - veins)} filter="url(#g-sm)" />
								{Array.from({length: 13}, (_, i) => {
									const x = 90 + i * 115;
									const L = 300 * Math.sin(((i + 1) / 14) * Math.PI) + 40;
									const k = clamp(veins * 1.6 - i * 0.05);
									return (
										<g key={i} stroke="#f4ffc8" strokeWidth={1} fill="none" opacity={0.7}>
											<path d={`M${x},-3 Q${x + L * 0.5},${-L * 0.25} ${x + L * 0.75},${-L * 0.6}`} strokeDasharray={500} strokeDashoffset={500 * (1 - k)} />
											<path d={`M${x},3 Q${x + L * 0.5},${L * 0.25} ${x + L * 0.75},${L * 0.6}`} strokeDasharray={500} strokeDashoffset={500 * (1 - k)} />
										</g>
									);
								})}
								{Array.from({length: 16}, (_, i) => {
									const u = ((af / 150 + i / 16) % 1) * 0.96;
									return <Glow key={i} x={u * LEAF_L} y={Math.sin(u * 30 + i) * 2} r={16} o={veins * Math.sin(u * Math.PI)} />;
								})}
							</g>
							{/* the caterpillar */}
							{f >= cue(1) - 6 && fall < 1 ? (
								<g transform={`translate(${ex},${ey - 26 + 900 * fall}) rotate(${-14 + 200 * fall})`}>
									{Array.from({length: 11}, (_, i) => {
										const wave = Math.sin(af / 3.5 - i * 0.8) * 7 * (1 - curl);
										const a = (i / 11) * Math.PI * 1.7 * curl;
										const x = mix(i * 40, 60 * Math.sin(a), curl) + twitch * (random(`tw${i}${Math.floor(f / 2)}`) - 0.5) * 14;
										const y = mix(-wave, -60 + 60 * Math.cos(a), curl);
										return <circle key={i} cx={x} cy={y} r={i === 0 ? 26 : 22} fill="#0c0805" stroke="#ffcf9a" strokeWidth={1} />;
									})}
									<path d={`M0,0 ${Array.from({length: 11}, (_, i) => `L${mix(i * 40, 0, curl)},${-Math.sin(af / 3.5 - i * 0.8) * 7 * (1 - curl)}`).join(' ')}`} stroke="#ff5a46" strokeWidth={2.4} fill="none" opacity={twitch ? 0.5 + 0.5 * random(`nf${f}`) : 0.25} filter="url(#g-md)" />
									{twitch
										? Array.from({length: 10}, (_, i) => {
												const a = random(`sp${i}${Math.floor(f / 3)}`) * Math.PI * 2;
												return <line key={i} x1={Math.cos(a) * 34} y1={Math.sin(a) * 34} x2={Math.cos(a) * 74} y2={Math.sin(a) * 74} stroke="#ff7a62" strokeWidth={1.4} />;
											})
										: null}
								</g>
							) : null}
							{/* crumbs from the bite */}
							{f >= biteAt && f < biteAt + 30
								? Array.from({length: 8}, (_, i) => {
										const k = (f - biteAt) / 30;
										const [bx, by] = leafEdge(0.61);
										return <ellipse key={i} cx={bx + (random(`cb${i}`) - 0.5) * 120 * k} cy={by - 20 + 300 * k * k} rx={6} ry={3} fill="#9ac860" opacity={1 - k} />;
									})
								: null}
						</g>
						{/* the soil */}
						<g transform="translate(0,1080)">
							<rect y={360} width={W} height={900} fill="#1a0f08" />
							<rect y={360} width={W} height={900} filter="url(#stone)" opacity={0.12} />
							<path d="M0,360 L1920,360" stroke="#ffd896" strokeWidth={1.4} opacity={0.7} />
							{[300, 900, 1500].map((x, i) => {
								const u = prog(f, cue(2) + i * 12, 60, ease.out);
								if (f < cue(2) - 6) return null;
								return <path key={i} d={leafD(170, 0.3)} transform={`translate(${x + 40 * Math.sin(u * 5 + i)},${mix(-500, 352, u)}) rotate(${mix(40 + i * 40, 174 + i * 4, u)})`} fill="#1a2a10" stroke="#c9d88a" strokeWidth={1} />;
							})}
							{Array.from({length: 120}, (_, i) => {
								const s0 = cue(2) + 50 + (i % 12) * 3;
								const u = prog(f, s0, 120, (x) => x);
								if (u <= 0) return null;
								const x = 300 + (i % 3) * 600 + (random(`gx${i}`) - 0.5) * 400;
								return <circle key={i} cx={x} cy={370 + u * 420 * (0.4 + 0.6 * random(`gy${i}`))} r={1.5 + random(`gr${i}`) * 2.5} fill="#ffd896" opacity={0.5 + 0.5 * random(`go${i}`)} />;
							})}
							{[560, 960, 1360].map((x, i) => {
								const g = prog(f, cue(2) + 24 + i * 8, 40, ease.out);
								const stop = prog(f, cue(2) + 96 + i * 6, 30, ease.inOut);
								return (
									<g key={x} opacity={1 - 0.55 * stop}>
										<ellipse cx={x} cy={760} rx={46} ry={30} fill="#2a1a0e" stroke="#ffd896" strokeWidth={1.4} />
										<path d={`M${x},730 Q${x + 10 + 30 * stop},${730 - 70 * g} ${x + 40 * stop},${730 - 90 * g + 50 * stop}`} stroke={stop > 0.5 ? '#7a6a3a' : '#b8e07a'} strokeWidth={2.4} fill="none" />
										<path d={`M${x},790 Q${x - 8},${790 + 50 * g} ${x + 6},${790 + 90 * g}`} stroke="#c9a070" strokeWidth={1} fill="none" opacity={0.7} />
									</g>
								);
							})}
						</g>
					</g>
					<g opacity={landed(f, word, cue(1) - 4)} style={{filter: `blur(${6 * (1 - prog(f, word, 14))}px)`}}>
						<Thin text="防身术" x={1560} y={230} size={84} w={600} fill="#f8ffd8" />
					</g>
					<g opacity={landed(f, cue(1) + 4, cue(2) - 8)}>
						<Tag en="Caffeine · natural pesticide" zh="扰乱昆虫神经 · Nathanson, Science 1984" />
					</g>
					<g opacity={landed(f, cue(2) + 24, cue(3) - 10)}>
						<Tag en="Allelopathy" zh="化感作用 · 树下的土壤抑制发芽" />
					</g>
				</g>
			) : null}
			{/* three inventions, three spotlights */}
			{f >= cue(3) - 10 ? (
				<g opacity={prog(f, cue(3) - 10, 12)}>
					<rect width={W} height={H} fill="#07060a" />
					{[
						{x: 400, n: '茶', r: '中国 · Camellia', c: '#b8e07a'},
						{x: 960, n: '可可', r: '美洲 · Theobroma', c: '#e0a060'},
						{x: 1520, n: '咖啡', r: '非洲 · Coffea', c: '#ff8a6a'},
					].map((tt, i) => {
						const k = lit[i];
						return (
							<g key={tt.n} opacity={0.15 + 0.85 * k}>
								<polygon points={`${tt.x - 40},100 ${tt.x + 40},100 ${tt.x + 220},760 ${tt.x - 220},760`} fill={tt.c} opacity={0.07 * k} />
								<ellipse cx={tt.x} cy={760} rx={240} ry={26} fill={tt.c} opacity={0.14 * k} filter="url(#b8)" />
								<g strokeDasharray={1400} strokeDashoffset={1400 * (1 - k)}>
									{i === 0 ? <path d={leafD(320, 0.3)} transform={`translate(${tt.x - 160},520) rotate(-30)`} fill="none" stroke={tt.c} strokeWidth={2} /> : null}
									{i === 1 ? <ellipse cx={tt.x} cy={500} rx={90} ry={170} fill="none" stroke={tt.c} strokeWidth={2} /> : null}
									{i === 1 ? <path d={`M${tt.x - 40},340 Q${tt.x - 50},500 ${tt.x - 40},660 M${tt.x + 40},340 Q${tt.x + 50},500 ${tt.x + 40},660 M${tt.x},330 L${tt.x},670`} fill="none" stroke={tt.c} strokeWidth={1} opacity={0.6} /> : null}
									{i === 2 ? (
										<g fill="none" stroke={tt.c} strokeWidth={2}>
											<path d={`M${tt.x - 200},420 Q${tt.x},380 ${tt.x + 200},430`} />
											{[-120, -40, 40, 120].map((dx) => (
												<circle key={dx} cx={tt.x + dx} cy={470 + (dx % 80 ? 10 : 0)} r={30} />
											))}
										</g>
									) : null}
								</g>
								<Thin text={tt.n} x={tt.x} y={850} size={56} fill={tt.c} w={700} />
								<text x={tt.x} y={890} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 20, letterSpacing: '0.2em', fill: '#efe4d0'}} opacity={0.6}>
									{tt.r}
								</text>
								{k > 0 ? <path d={`M${tt.x},${300} Q${(tt.x + 960) / 2},${160} 960,${190}`} stroke={tt.c} strokeWidth={1.2} fill="none" strokeDasharray={900} strokeDashoffset={900 * (1 - prog(f, spots[i] + 6, 18))} opacity={0.6} /> : null}
							</g>
						);
					})}
					<g opacity={prog(f, spots[2] + 14, 14)}>
						<Caf x={960} y={190} s={0.9} />
					</g>
					<g opacity={landed(f, cue(3) + 10)}>
						<Tag en="Convergent evolution" zh="趋同演化 · Denoeud et al., Science 2014" />
					</g>
				</g>
			) : null}
			<rect width={W} height={H} fill="#fff8ec" opacity={whiteOut} />
		</Stage>
	);
};

export const scenesB = {Origin, Defense};

// ---------------------------------------------------------------- 5. bloom: the hillside opens on the drop; a bee; three times the memory

/** a coffee shrub in silhouette with white blossoms that open when `open` passes them */
const Shrub: React.FC<{x: number; y: number; s: number; seed: string; o: number; af: number; open: number}> = ({x, y, s, seed, o, af, open}) => (
	<g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
		{Array.from({length: 6}, (_, k) => {
			const a = -Math.PI / 2 + (k - 2.5) * 0.28 + (random(`${seed}a${k}`) - 0.5) * 0.2;
			const len = 120 + random(`${seed}l${k}`) * 90;
			const sway = 0.03 * Math.sin(af / 40 + k + x);
			const ex = Math.cos(a + sway) * len;
			const ey = Math.sin(a + sway) * len;
			return (
				<g key={k}>
					<path d={`M0,0 Q${ex * 0.4},${ey * 0.6} ${ex},${ey}`} stroke="#120a05" strokeWidth={2.4} fill="none" />
					{Array.from({length: 7}, (_, j) => {
						const u = (j + 1) / 8;
						const px = ex * u + (j % 2 ? 9 : -9);
						const py = ey * u;
						const b = random(`${seed}b${k}${j}`);
						const op = clamp((open - b * 0.4) * 4);
						return (
							<g key={j}>
								<ellipse cx={px} cy={py} rx={13} ry={4.5} transform={`rotate(${(j % 2 ? 30 : -30) + (a * 180) / Math.PI + 90},${px},${py})`} fill="#140b05" />
								{b > 0.45 && op > 0 ? (
									<g>
										<circle cx={px + (j % 2 ? -4 : 4)} cy={py + 2} r={8 * op} fill="#fff1d0" opacity={0.22} />
										<circle cx={px + (j % 2 ? -4 : 4)} cy={py + 2} r={3.6 * op} fill="#fffaf0" />
									</g>
								) : null}
							</g>
						);
					})}
				</g>
			);
		})}
	</g>
);

const Bloom: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const cue = useCue();
	const scene = useScene();
	const events = useEvents();
	const end = scene.duration;
	// E1: hard cut on the drop; the bloom runs over the hillside like a wave; crane up
	const wave = prog(f, 0, 70, ease.out);
	const crane = prog(f, 0, cue(1), ease.inOut);
	const e1 = 1 - prog(f, cue(1) - 14, 18);
	// E2: one flower, the nectar
	const e2 = prog(f, cue(1) - 14, 18) * (1 - prog(f, cue(2) - 10, 14));
	const zoomF = prog(f, cue(1) - 14, 70, ease.out);
	// E3: the bee, the 24 hours, the three
	const e3 = prog(f, cue(2) - 10, 14) * (1 - prog(f, cue(3) - 8, 14));
	const beeIn = prog(f, cue(2) - 6, 40, ease.inOut);
	const clockT = prog(f, cue(2) + 20, 50, ease.inOut);
	const land = events(cue(2) + 80, cue(3) - 14, 3, 12);
	const x3 = landed(f, land[2]);
	// E4: petals rise and become stars
	const e4 = prog(f, cue(3) - 8, 14);
	const rise = prog(f, cue(3) - 8, end - cue(3) + 8, ease.inOut);
	return (
		<Stage>
			{e1 > 0 ? (
				<g opacity={e1} transform={`translate(0,${-60 * crane}) translate(960,600) scale(${1 + 0.06 * crane}) translate(-960,-600)`}>
					<defs>
						<linearGradient id="dawn3" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#140c08" />
							<stop offset="0.3" stopColor="#5a3418" />
							<stop offset="0.5" stopColor="#e8b06a" />
							<stop offset="0.58" stopColor="#fff2d6" />
							<stop offset="1" stopColor="#2a160a" />
						</linearGradient>
					</defs>
					<rect y={-100} width={W} height={H + 200} fill="url(#dawn3)" />
					<circle cx={1060} cy={600} r={700} fill="url(#ember)" opacity={0.8} />
					<circle cx={1060} cy={600} r={120} fill="#fffaf0" opacity={0.95} filter="url(#b8)" />
					<path d={ridgeD(610, 80, 'r1')} fill="#7a4a24" opacity={0.5} />
					<path d={ridgeD(660, 100, 'r2')} fill="#3a2010" opacity={0.85} />
					{Array.from({length: 3}, (_, row) =>
						Array.from({length: 13 - row * 3}, (_, i) => {
							const s = 0.55 + row * 0.33;
							const x = -60 + i * (W / (12 - row * 3)) + random(`sx${row}${i}`) * 60;
							const y = 720 + row * 95;
							// the bloom runs from bottom-left to top-right
							const open = clamp(wave * 1.8 - (x / W) * 0.6 - (2 - row) * 0.12);
							return <Shrub key={`${row}${i}`} x={x} y={y} s={s} seed={`s${row}${i}`} o={0.65 + row * 0.18} af={af} open={open} />;
						}),
					)}
					<rect y={880} width={W} height={300} fill="#000" opacity={0.55} filter="url(#b8)" />
					<Motes f={af} seed="pet" n={90} color="#fff4e0" o={wave} speed={0.6} />
					<g opacity={landed(f, 10)}>
						<Tag en="Coffea arabica · in bloom" zh="咖啡花 · 旱季后第一场雨 · 只开三四天" />
					</g>
				</g>
			) : null}
			{e2 > 0 ? (
				<g opacity={e2}>
					<Room x={960} y={520} r={900} c="#c88a4a" base="#0c0705" />
					{Array.from({length: 40}, (_, i) => (
						<circle key={i} cx={random(`bk${i}`) * W + 20 * Math.sin(af / 60 + i)} cy={random(`bky${i}`) * H} r={20 + random(`bkr${i}`) * 60} fill="#ffe0b0" opacity={0.05 + 0.06 * random(`bko${i}`)} filter="url(#b8)" />
					))}
					<g transform={`translate(960,520) rotate(${4 * Math.sin(af / 60)}) scale(${mix(0.5, 1.9, zoomF)}) translate(-960,-520)`}>
						<LineFlower x={960} y={520} s={1} />
						<Glow x={960} y={520} r={60 + 10 * Math.sin(af / 6)} o={prog(f, cue(1) + 20, 20)} />
					</g>
					<g opacity={prog(f, cue(1) + 40, 20)}>
						<Caf x={1250} y={330} s={0.7} />
						<path d="M1220,350 C1120,400 1040,460 980,510" stroke="#ffd896" strokeWidth={1} strokeDasharray="5 6" strokeDashoffset={-af} fill="none" opacity={0.7} />
					</g>
					<g opacity={landed(f, cue(1) + 30)}>
						<Tag en="Nectar" zh="花蜜里的咖啡因 · 低于蜜蜂能尝出的苦味" />
					</g>
				</g>
			) : null}
			{e3 > 0 ? (
				<g opacity={e3}>
					<Room x={1300} y={540} r={900} c="#c88a4a" base="#0c0705" />
					<g opacity={1 - prog(f, land[0] - 20, 16)}>
						<Clock x={560} y={500} r={250} h={9 + 24 * clockT} m={(60 * 24 * clockT) % 60} c="#f6e7c8" />
						<Thin text="24 h" x={560} y={830} size={48} w={500} />
					</g>
					<LineFlower x={1460} y={560} s={1.25} />
					{/* the first bee hovers by the clock; at the landings it and two more arrive in formation */}
					{[0, 1, 2].map((i) => {
						const at = land[i];
						const p1: [number, number] = [1330 + i * 22, 520 + i * 34];
						const k = prog(f, at - 30, 30, ease.inOut);
						let x = 0;
						let y = 0;
						let sc = 1.1;
						if (i === 0) {
							if (beeIn <= 0) return null;
							const hx = mix(-160, 1180, beeIn);
							const hy = mix(260, 460, beeIn) - Math.sin(beeIn * Math.PI) * 100 + 8 * Math.sin(af / 7);
							x = mix(hx, p1[0], k);
							y = mix(hy, p1[1], k);
							sc = mix(2.2, 1.1, k);
						} else {
							if (k <= 0) return null;
							const p0 = [-160, 260 + i * 140];
							x = mix(p0[0], p1[0], k);
							y = mix(p0[1], p1[1], k) - Math.sin(k * Math.PI) * 120;
						}
						return (
							<g key={i}>
								<LineBee x={x} y={y} s={sc} />
								{f >= at ? <circle cx={p1[0]} cy={p1[1]} r={20 + 120 * prog(f, at, 20)} fill="none" stroke="#ffd896" strokeWidth={1.4} opacity={1 - prog(f, at, 20)} /> : null}
							</g>
						);
					})}
					<path d="M300,880 C400,780 520,980 620,860 C700,760 560,700 480,800" stroke="#8a7a6a" strokeWidth={1.2} fill="none" strokeDasharray="6 8" strokeDashoffset={-af * 2} opacity={prog(f, land[0], 20)} />
					<text x={330} y={960} style={{fontFamily: font.sans, fontSize: 22, letterSpacing: '0.2em', fill: '#9a8a7a'}} opacity={prog(f, land[0], 20)}>
						没喝过的蜜蜂 · 迷路
					</text>
					<g opacity={x3} transform={`translate(960,330) scale(${1 + 0.15 * (1 - prog(f, land[2], 10))}) translate(-960,-330)`}>
						<Num text="×3" x={960} y={330} size={200} />
					</g>
					<g opacity={landed(f, cue(2) + 20)}>
						<Tag en="Wright et al., Science 2013" zh="24 小时后还记得花香的比例" />
					</g>
				</g>
			) : null}
			{e4 > 0 ? (
				<g opacity={e4}>
					<rect width={W} height={H} fill="url(#dusk2)" />
					{Array.from({length: 140}, (_, i) => {
						const x0 = random(`px${i}`) * W;
						const y0 = 600 + random(`py${i}`) * 500;
						const sp = 0.5 + random(`ps${i}`) * 0.8;
						const y = y0 - rise * 900 * sp;
						const star = y < 440;
						return star ? (
							<circle key={i} cx={x0} cy={y} r={1 + random(`pr${i}`) * 1.8} fill="#fff" opacity={0.6 + 0.4 * Math.sin(af / 9 + i)} />
						) : (
							<ellipse key={i} cx={x0 + 30 * Math.sin(af / 40 + i)} cy={y} rx={6} ry={3} fill="#fff4e0" opacity={0.75} transform={`rotate(${i * 37 + af},${x0},${y})`} />
						);
					})}
					<g transform={`translate(0,${200 * rise})`}>
						<path d={ridgeD(980, 60, 'e4')} fill="#05040a" />
					</g>
				</g>
			) : null}
		</Stage>
	);
};

// ---------------------------------------------------------------- 6. journey: Mocha, the roasted beans, seven seeds, one tree for half the Americas

const ROUTE = {
	mocha: [43.25, 13.3] as [number, number],
	india: [75.77, 13.32] as [number, number],
	ams: [4.9, 52.37] as [number, number],
	paris: [2.35, 48.86] as [number, number],
	mart: [-61.02, 14.64] as [number, number],
};
const AMERICAS: [number, number][] = [
	[-75, 4],
	[-47, -15],
	[-84, 10],
	[-66, 8],
	[-90, 15],
	[-77, 18],
	[-56, -25],
];

const Journey: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const cue = useCue();
	const scene = useScene();
	const events = useEvents();
	const end = scene.duration;
	// F1: down from the stars to the port; windows light on the beats
	const down = prog(f, 0, cue(1) - 20, ease.inOut);
	const f1 = 1 - prog(f, cue(1) - 14, 16);
	const win = events(4, cue(1) - 20, 6, 8);
	// F2: roasted so it can't grow; the seal
	const f2 = prog(f, cue(1) - 14, 16) * (1 - prog(f, cue(2) - 10, 14));
	const seal = events(cue(1) + 40, cue(2) - 20, 1)[0];
	const sealK = f >= seal ? spring({frame: f - seal, fps: 30, config: {damping: 11, stiffness: 220}}) : 0;
	// F3: seven seeds, one per beat; then the map
	const seeds = events(cue(2) + 4, cue(2) + 90, 7, 7);
	const mapIn = prog(f, cue(2) + 70, 30, ease.inOut);
	const routeIN = prog(f, cue(2) + 96, 40, ease.inOut);
	// F4: pull out to the world; west along the routes
	const out = prog(f, cue(3) - 20, 60, ease.inOut);
	const legs = events(cue(3) + 20, end - 40, 3, 20);
	const fan = prog(f, legs[2] + 16, 50, ease.out);
	const drift = prog(f, cue(3) + 40, end - cue(3) - 40, (x) => x);
	const scale = mix(1500, 430, out) * (1 + 0.1 * drift);
	const rot = mix(-58, -8, out) + 6 * drift;
	const cy = mix(900, 600, out);
	const proj = geoNaturalEarth1()
		.scale(scale)
		.translate([960, cy])
		.rotate([rot, 0]);
	const path = geoPath(proj);
	const xy = (p: [number, number]) => proj(p) as [number, number];
	const arc = (a: [number, number], b: [number, number], k: number) => {
		const ip = geoInterpolate(a, b);
		const n = Math.max(2, Math.round(60 * k));
		return path({type: 'LineString', coordinates: Array.from({length: n}, (_, i) => ip((i / (n - 1)) * k))}) ?? '';
	};
	const leg = (a: [number, number], b: [number, number], at: number, key: string) => {
		const k = prog(f, at - 18, 18, ease.inOut);
		if (k <= 0) return null;
		return (
			<g key={key}>
				<path d={arc(a, b, k)} stroke="#f2b45a" strokeWidth={8} opacity={0.25} fill="none" filter="url(#b8)" />
				<path d={arc(a, b, k)} stroke="#ffd896" strokeWidth={2} fill="none" />
			</g>
		);
	};
	const city = (p: [number, number], n: string, y: string, at: number, dx = 18, dy = 34, anchor: 'start' | 'end' = 'start') => {
		const [x, yy] = xy(p);
		const o = prog(f, at, 12);
		if (o <= 0) return null;
		const ring = f >= at ? prog(f, at, 24) : 0;
		return (
			<g key={n} opacity={o}>
				<Glow x={x} y={yy} r={34} />
				{ring < 1 ? <circle cx={x} cy={yy} r={10 + 60 * ring} fill="none" stroke="#ffd896" strokeWidth={1.2} opacity={1 - ring} /> : null}
				<text x={x + dx} y={yy + dy} textAnchor={anchor} style={{fontFamily: font.serif, fontWeight: 700, fontSize: 28, fill: '#f3ead8'}}>
					{n}
				</text>
				<text x={x + dx} y={yy + dy + 24} textAnchor={anchor} style={{fontFamily: font.sans, fontSize: 15, letterSpacing: '0.2em', fill: '#c99a5a'}}>
					{y}
				</text>
			</g>
		);
	};
	return (
		<Stage>
			{f1 > 0 ? (
				<g opacity={f1}>
					<rect width={W} height={H} fill="url(#night)" />
					<g transform={`translate(0,${mix(-500, 0, down) * 0.4})`}>
						{Array.from({length: 160}, (_, i) => <circle key={i} cx={random(`st${i}`) * W} cy={random(`sty${i}`) * 560 - 200} r={0.8 + random(`sr${i}`) * 1.8} fill="#fff" opacity={(0.4 + 0.6 * random(`so${i}`)) * (0.7 + 0.3 * Math.sin(af / 11 + i))} />)}
					</g>
					<g transform={`translate(0,${mix(600, 0, down)})`}>
						<path d={ridgeD(700, 160, 'ym', 500)} fill="#0a0c1a" />
						{Array.from({length: 16}, (_, i) => {
							const x = 160 + i * 98 + random(`hx${i}`) * 24;
							const h = 150 + random(`hh${i}`) * 170 + (i > 5 && i < 11 ? 80 : 0);
							const w = 52 + random(`hw${i}`) * 20;
							const top = 860 - h;
							return (
								<g key={i}>
									<path d={`M${x},860 L${x},${top} ${Array.from({length: 4}, (_, k) => `L${x + (k * w) / 4},${top} L${x + (k * w) / 4},${top - 8} L${x + ((k + 0.5) * w) / 4},${top - 8} L${x + ((k + 0.5) * w) / 4},${top}`).join(' ')} L${x + w},${top} L${x + w},860 Z`} fill="#05060e" />
									{Array.from({length: 3}, (_, k) => {
										const on = random(`w${i}${k}`) > 0.4 ? prog(f, win[(i + k) % 6], 6) : 0;
										return on > 0 ? <path key={k} d={`M${x + w / 2 - 7},${top + 40 + k * 52} L${x + w / 2 - 7},${top + 26 + k * 52} A7,7 0 0,1 ${x + w / 2 + 7},${top + 26 + k * 52} L${x + w / 2 + 7},${top + 40 + k * 52} Z`} fill="#ffb060" opacity={on * (0.85 + 0.15 * Math.sin(af / 5 + i + k))} filter="url(#g-sm)" /> : null;
									})}
								</g>
							);
						})}
						<path d="M1130,640 A70,70 0 0,1 1270,640 L1270,700 L1130,700 Z" fill="#05060e" />
						<rect x={1320} y={470} width={22} height={390} fill="#05060e" />
						<path d="M1314,470 L1348,470 L1331,430 Z" fill="#05060e" />
						<rect y={860} width={W} height={260} fill="#060a1c" />
						{Array.from({length: 34}, (_, i) => <rect key={i} x={200 + random(`rf${i}`) * 1500 + 10 * Math.sin(af / 13 + i)} y={880 + random(`rfy${i}`) * 140} width={30 + random(`rfw${i}`) * 60} height={2} fill="#ffb060" opacity={0.25 + 0.1 * Math.sin(af / 7 + i)} />)}
						<g transform={`translate(${-40 * prog(f, 0, cue(1))},${3 * Math.sin(af / 20)})`}>
							<path d="M1500,860 L1700,860 L1670,900 L1530,900 Z M1600,860 L1600,700 L1690,840 Z M1600,700 L1520,840 L1600,840 Z" fill="#03040a" />
							<Glow x={1660} y={850} r={22} />
						</g>
					</g>
					<g opacity={landed(f, 20)}>
						<Tag en="Mocha, Yemen" zh="也门 · 摩卡港" />
					</g>
				</g>
			) : null}
			{f2 > 0 ? (
				<g opacity={f2}>
					<Room x={700} y={760} r={700} c="#c8501a" base="#070302" />
					{Array.from({length: 70}, (_, i) => (
						<circle key={i} cx={420 + random(`em${i}`) * 560} cy={820 + random(`emy${i}`) * 140 - ((af * (0.5 + random(`emv${i}`))) % 200) * 0.3} r={2 + random(`emr${i}`) * 5} fill="#ffb060" opacity={0.4 + 0.4 * Math.sin(af / 4 + i)} filter="url(#g-sm)" />
					))}
					<Bean x={700} y={600} r={170} c0={interpolateColors(prog(f, cue(1), 60), [0, 1], ['#8aa060', '#4a3020'])} c1="#0a0503" rot={18} />
					{[0, 1].map((i) => (
						<path key={i} d={`M${620 + i * 150},430 C${650 + i * 150},${380 - 10 * Math.sin(af / 12 + i)} ${620 + i * 150},330 ${650 + i * 150},${270 - 20 * Math.sin(af / 15)}`} stroke="#fff" strokeWidth={2} fill="none" opacity={0.18} filter="url(#g-sm)" />
					))}
					{sealK > 0 ? (
						<g transform={`translate(1380,560) scale(${mix(1.8, 1, sealK)})`} opacity={Math.min(1, sealK * 1.5)}>
							<circle r={150} fill="none" stroke="#c8342a" strokeWidth={3} opacity={0.9} />
							<circle r={132} fill="none" stroke="#c8342a" strokeWidth={1} opacity={0.6} />
							<Thin text="禁" x={0} y={34} size={110} fill="#c8342a" w={900} />
						</g>
					) : null}
					<g opacity={landed(f, cue(1) + 6)}>
						<Tag en="Roasted before export" zh="出口前先烘过 · 种不活" />
					</g>
				</g>
			) : null}
			{f >= cue(2) - 10 ? (
				<g opacity={prog(f, cue(2) - 10, 14)}>
					<rect width={W} height={H} fill="#07080c" />
					<g opacity={mapIn}>
						<circle cx={960} cy={560} r={900} fill="url(#warm-pool)" opacity={0.5} />
						<path d={path(geoGraticule10()) ?? ''} fill="none" stroke="#c99a5a" strokeWidth={0.6} opacity={0.12} />
						<path d={path(LAND) ?? ''} fill="#1a140f" stroke="#7a5a3a" strokeWidth={1} />
						{routeIN > 0 ? (
							<g>
								<path d={arc(ROUTE.mocha, ROUTE.india, routeIN)} stroke="#f2b45a" strokeWidth={8} opacity={0.25} fill="none" filter="url(#b8)" />
								<path d={arc(ROUTE.mocha, ROUTE.india, routeIN)} stroke="#ffd896" strokeWidth={2} fill="none" />
							</g>
						) : null}
						{city(ROUTE.mocha, '摩卡', '也门', cue(2) + 80, -18, 40, 'end')}
						{city(ROUTE.india, '奇克马加卢尔', '1670 · 七颗种子', cue(2) + 136)}
						{leg(ROUTE.mocha, ROUTE.ams, legs[0], 'l0')}
						{city(ROUTE.ams, '阿姆斯特丹', '1706', legs[0], -18, -14, 'end')}
						{leg(ROUTE.ams, ROUTE.paris, legs[1], 'l1')}
						{city(ROUTE.paris, '巴黎', '1714 · 送给法国国王', legs[1], -18, 30, 'end')}
						{leg(ROUTE.paris, ROUTE.mart, legs[2], 'l2')}
						{city(ROUTE.mart, '马提尼克', '1723', legs[2], -18, -14, 'end')}
						{fan > 0 ? AMERICAS.map((p, i) => <path key={i} d={arc(ROUTE.mart, p, clamp(fan * 1.4 - i * 0.06))} fill="none" stroke="#ffd896" strokeWidth={1.4} opacity={0.75} />) : null}
					</g>
					{/* seven seeds, one per beat */}
					<g opacity={1 - prog(f, cue(3) + 10, 20)}>
						{seeds.map((s, i) => {
							const k = f >= s ? spring({frame: f - s, fps: 30, config: {damping: 12}}) : 0;
							return (
								<g key={i} transform={`translate(${mix(960 + (i - 3) * 130, 160 + i * 64, mapIn)},${mix(500, 760, mapIn)}) scale(${k * mix(2, 1, mapIn)})`}>
									<Bean x={0} y={0} r={24} c0="#d8eab0" c1="#5a7a3a" rot={i * 24} />
									<circle r={36} fill="url(#ember)" opacity={0.35} />
								</g>
							);
						})}
						<text x={130} y={830} style={{fontFamily: font.sans, fontSize: 20, letterSpacing: '0.2em', fill: '#c99a5a'}} opacity={prog(f, seeds[6], 12)}>
							七颗生豆 · 1670 · 传说
						</text>
					</g>
					<g opacity={landed(f, cue(3) + 10)}>
						<Tag en="The smuggled seeds" zh="被偷偷带走的种子" />
					</g>
				</g>
			) : null}
		</Stage>
	);
};

export const scenesC = {Bloom, Journey};

// ---------------------------------------------------------------- 7. roast: green beans, the drum, the crack, a thousand aromas

const AROMAS: [string, string, number, number][] = [
	['焦糖', '#ffc070', 400, 300],
	['坚果', '#c8906a', 1520, 300],
	['莓果', '#ff8aa0', 1560, 780],
	['花香', '#c8a0ff', 360, 780],
	['巧克力', '#d0a080', 960, 220],
];

const Roast: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const cue = useCue();
	const scene = useScene();
	const events = useEvents();
	const end = scene.duration;
	const fromDark = 1 - prog(f, 0, 14);
	// G1: green beans, a slow macro pan
	const g1 = 1 - prog(f, cue(1) - 10, 12);
	const pan = prog(f, 0, cue(1), (x) => x);
	// G2: the drum, temperature climbing
	const g2 = prog(f, cue(1) - 10, 12) * (1 - prog(f, cue(1) + 36, 6));
	const heat = prog(f, cue(1) - 10, 44, ease.in);
	const crack = events(cue(1) + 30, cue(1) + 60, 1)[0];
	// G3: the crack
	const g3 = prog(f, crack - 2, 4) * (1 - prog(f, cue(2) - 10, 12));
	const burst = f >= crack ? Math.exp(-(f - crack) / 8) : 0;
	const shake = 14 * burst;
	// G4: inside, sugars meet amino acids; the aroma nebula opens
	const g4 = prog(f, cue(2) - 10, 12);
	const meetAt = events(cue(2) + 4, cue(2) + 40, 1)[0];
	const neb = prog(f, meetAt, 50, ease.out);
	const words = events(meetAt + 14, end - 30, AROMAS.length, 9);
	const landN = events(meetAt + 30, end - 24, 1)[0];
	const gather = prog(f, end - 22, 22, ease.in);
	return (
		<Stage cam={{x: shake * (random(`sx${f}`) - 0.5), y: shake * (random(`sy${f}`) - 0.5)}}>
			{g1 > 0 ? (
				<g opacity={g1}>
					<Room x={1100} y={360} r={900} c="#7a9a5a" base="#050805" o={0.7} />
					<g transform={`translate(${-160 * pan},0)`}>
						{Array.from({length: 26}, (_, i) => {
							const row = Math.floor(i / 9);
							const x = 120 + (i % 9) * 250 + (row % 2) * 120;
							const y = 520 + row * 220 + 4 * Math.sin(af / 30 + i);
							return <Bean key={i} x={x} y={y} r={110 + row * 30} c0="#cfe0a8" c1="#3a4a24" rot={i * 37} blur={row === 2} />;
						})}
					</g>
					{Array.from({length: 16}, (_, i) => {
						const u = (af / 120 + i / 16) % 1;
						return <path key={i} d={`M${160 + i * 110},${420 - u * 260} q10,-40 0,-80`} stroke="#d8f0a8" strokeWidth={1.4} fill="none" opacity={0.5 * Math.sin(u * Math.PI)} filter="url(#g-sm)" />;
					})}
					<g opacity={landed(f, cue(0) + 6)}>
						<Tag en="Green coffee" zh="生豆 · 闻起来像青草" />
					</g>
				</g>
			) : null}
			{g2 > 0 ? (
				<g opacity={g2}>
					<Room x={760} y={1000} r={900} c="#d8601a" base="#060202" o={0.5 + 0.5 * heat} />
					<circle cx={760} cy={560} r={360} fill="none" stroke="#c9a070" strokeWidth={2} opacity={0.7} />
					<circle cx={760} cy={560} r={372} fill="none" stroke="#c9a070" strokeWidth={0.8} opacity={0.4} />
					{Array.from({length: 26}, (_, i) => {
						const a = 0.3 + random(`dr${i}`) * 2.4 + af / 18;
						const r = 120 + random(`drr${i}`) * 200;
						const yy = 560 + Math.abs(Math.sin(a)) * r * 0.85;
						return <Bean key={i} x={760 + Math.cos(a) * r} y={yy} r={40} c0={interpolateColors(heat, [0, 0.5, 1], ['#b8d088', '#d8a04a', '#8a4a1e'])} c1="#2a1a08" rot={i * 47 + af * 8} />;
					})}
					{Array.from({length: 9}, (_, i) => (
						<path key={i} d={`M${560 + i * 50},1080 Q${580 + i * 50},${1000 - 30 * Math.sin(af / 3 + i)} ${560 + i * 50},${940 - 40 * heat}`} stroke="#ff8a1e" strokeWidth={16} fill="none" opacity={0.5 * heat} filter="url(#b8)" />
					))}
					<Num text={`${Math.round(mix(150, 196, heat))}°C`} x={1560} y={600} size={170} fill="#ffb060" />
					<g opacity={landed(f, cue(1))}>
						<Tag en="Roasting drum" zh="滚筒 · 两百度左右" />
					</g>
				</g>
			) : null}
			{g3 > 0 ? (
				<g opacity={g3}>
					<Room x={960} y={560} r={900} c="#e07a2a" base="#060202" o={0.6 + 0.4 * burst} />
					<g transform={`translate(960,560) scale(${1 + 0.06 * burst + 0.04 * prog(f, crack, 60)}) translate(-960,-560)`}>
						<Bean x={960} y={560} r={330} c0="#8a4a1e" c1="#1a0804" rot={-8} crack />
					</g>
					{Array.from({length: 26}, (_, i) => {
						const a = (i / 26) * Math.PI * 2 + 0.1;
						const r0 = 380 + 300 * (1 - burst);
						return <line key={i} x1={960 + Math.cos(a) * r0} y1={560 + Math.sin(a) * r0 * 1.1} x2={960 + Math.cos(a) * (r0 + 60 + 60 * random(`cr${i}`))} y2={560 + Math.sin(a) * (r0 + 60 + 60 * random(`cr${i}`)) * 1.1} stroke="#ffe0a0" strokeWidth={1.6} strokeLinecap="round" opacity={burst} />;
					})}
					{f >= crack
						? Array.from({length: 22}, (_, i) => {
								const k = Math.min(1, (f - crack) / 50);
								const a = random(`ch${i}`) * Math.PI * 2;
								const d = 300 + 700 * k * (0.5 + random(`cd${i}`));
								const x = 960 + Math.cos(a) * d;
								const y = 560 + Math.sin(a) * d * 0.8 + 200 * k * k;
								return <ellipse key={i} cx={x} cy={y} rx={10} ry={4} fill="#d8b890" opacity={0.7 * (1 - k)} transform={`rotate(${k * 500 + i * 40},${x},${y})`} />;
							})
						: null}
					{Array.from({length: 4}, (_, i) => (
						<path key={i} d={`M${880 + i * 50},300 C${900 + i * 50},${240 - 20 * Math.sin(af / 10 + i)} ${860 + i * 50},180 ${890 + i * 50},${120 - 30 * prog(f, crack, 40)}`} stroke="#fff" strokeWidth={3} fill="none" opacity={0.15 * prog(f, crack, 10)} filter="url(#b8)" />
					))}
					<g opacity={landed(f, crack)}>
						<Tag en="First crack" zh="一爆 · 水汽撑破细胞壁 · 约 196 °C" />
					</g>
				</g>
			) : null}
			{g4 > 0 ? (
				<g opacity={g4 * (1 - gather)}>
					<rect width={W} height={H} fill="#06040a" />
					{/* the bean's honeycomb of cells, a browning wave sweeping across */}
					<g opacity={1 - neb}>
						{Array.from({length: 120}, (_, i) => {
							const col = i % 15;
							const row = Math.floor(i / 15);
							const x = 120 + col * 120 + (row % 2) * 60;
							const y = 160 + row * 104;
							const brown = prog(f, cue(2) - 10 + col * 2, 20);
							return <polygon key={i} points={Array.from({length: 6}, (_, k) => `${x + Math.cos((k * Math.PI) / 3 + Math.PI / 6) * 58},${y + Math.sin((k * Math.PI) / 3 + Math.PI / 6) * 58}`).join(' ')} fill={interpolateColors(brown, [0, 1], ['#3a4a24', '#5a2a10'])} fillOpacity={0.35} stroke="#ffd896" strokeWidth={1} opacity={0.6} />;
						})}
						{[0, 1].map((i) => {
							const u = prog(f, cue(2) - 6, meetAt - cue(2) + 6, ease.in);
							return <Glow key={i} x={mix(i ? 1500 : 420, 960, u)} y={540 + (i ? -80 : 80) * (1 - u)} r={34} />;
						})}
					</g>
					{/* the nebula */}
					{neb > 0
						? Array.from({length: 420}, (_, i) => {
								const a = random(`ne${i}`) * Math.PI * 2;
								const r = Math.pow(random(`ner${i}`), 0.7) * 900 * neb;
								const c = ['#ffc070', '#c8906a', '#ff8aa0', '#c8a0ff', '#a07050', '#ffe0a0'][i % 6];
								const big = random(`neb${i}`) > 0.93;
								return <circle key={i} cx={960 + Math.cos(a + af / 900) * r * 1.2} cy={540 + Math.sin(a + af / 900) * r * 0.7} r={big ? 10 + random(`nes${i}`) * 14 : 1 + random(`nes${i}`) * 2.6} fill={c} opacity={big ? 0.18 : 0.75} filter={big ? 'url(#b8)' : undefined} />;
							})
						: null}
					{neb > 0 ? <Glow x={960} y={540} r={260} o={0.35} /> : null}
					{neb > 0 ? <Rolling value="1,000+" f={f} start={meetAt + 4} land={landN} y={570} size={150} id="ro" /> : null}
					{AROMAS.map(([w, c, x, y], i) => (
						<text key={w} x={x} y={y} textAnchor="middle" opacity={landed(f, words[i])} style={{fontFamily: font.serif, fontWeight: 600, fontSize: 40, fill: c, letterSpacing: '0.1em'}}>
							{w}
						</text>
					))}
					<g opacity={landed(f, cue(2))}>
						<Tag en={neb > 0.5 ? 'Volatile compounds' : 'Maillard reaction'} zh={neb > 0.5 ? '已鉴定的咖啡香气物质 · 一千多种' : '美拉德反应 · 糖 + 氨基酸'} />
					</g>
				</g>
			) : null}
			{gather > 0 ? <Glow x={960} y={540} r={40 + 160 * gather} o={gather} /> : null}
			<rect width={W} height={H} fill="#000" opacity={fromDark} />
		</Stage>
	);
};

// ---------------------------------------------------------------- 8. body: the 3 pm cup at midnight, two livers, more locks

const Body: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const cue = useCue();
	const scene = useScene();
	const events = useEvents();
	const end = scene.duration;
	const fromGlow = 1 - prog(f, 0, 16);
	// H1: 15:00 → 24:00, the cup empties to a third
	const h1 = 1 - prog(f, cue(1) - 10, 14);
	const time = prog(f, 6, cue(1) - 20, ease.inOut);
	const hours = 15 + 9 * time;
	const level = mix(1, 0.29, time);
	const sky = interpolateColors(time, [0, 0.5, 1], ['#4a5a7a', '#3a2a4a', '#05060f']);
	// H2: two livers, fast and slow
	const h2 = prog(f, cue(1) - 10, 14) * (1 - prog(f, cue(2) - 10, 14));
	const dec = prog(f, cue(1), cue(2) - cue(1), (x) => x);
	// H3: more locks
	const h3 = prog(f, cue(2) - 10, 14);
	const batches = events(cue(2) + 10, end - 30, 3, 20);
	const nLocks = f < batches[0] ? 3 : f < batches[1] ? 6 : 12;
	const pull = prog(f, cue(2) - 10, end - cue(2), ease.inOut);
	const toCup = prog(f, end - 18, 18, ease.in);
	return (
		<Stage>
			{h1 > 0 ? (
				<g opacity={h1}>
					<Room x={1450} y={330} r={700} c="#3a4a7a" base="#05060c" />
					<rect x={1160} y={150} width={560} height={480} fill={sky} stroke="#c9ced8" strokeWidth={1.4} opacity={0.9} />
					<line x1={1440} y1={150} x2={1440} y2={630} stroke="#c9ced8" strokeWidth={1.4} />
					<circle cx={mix(1250, 1600, time)} cy={mix(420, 260, time)} r={36} fill={time > 0.6 ? '#f4f0e0' : '#ffd896'} filter="url(#g-sm)" opacity={0.9} />
					{Array.from({length: 40}, (_, i) => <circle key={i} cx={1170 + random(`ws${i}`) * 540} cy={160 + random(`wsy${i}`) * 460} r={1} fill="#fff" opacity={0.7 * prog(time, 0.6, 0.4)} />)}
					<g transform={`translate(560,480) scale(${1 + 0.05 * time})`}>
						<Clock x={0} y={0} r={300} h={hours} m={(hours % 1) * 60} />
					</g>
					<text x={560} y={880} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 500, fontSize: 52, fill: '#f6e7c8', letterSpacing: '0.08em'}}>
						{`${String(Math.floor(hours) % 24).padStart(2, '0')}:${String(Math.floor((hours % 1) * 60)).padStart(2, '0')}`}
					</text>
					<Cup x={1440} y={830} s={0.7} level={level} />
					<text x={1440} y={970} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 22, letterSpacing: '0.2em', fill: '#ffd896'}} opacity={prog(time, 0.85, 0.15)}>
						还剩 ≈ 1/3
					</text>
					<g opacity={landed(f, cue(0) + 6)}>
						<Tag en="Half-life ≈ 5 h" zh="半衰期约 5 小时 · 因人而异" />
					</g>
				</g>
			) : null}
			{h2 > 0 ? (
				<g opacity={h2}>
					<Room x={480} y={540} r={700} c="#4a2a3a" base="#07040a" />
					<Room x={1440} y={540} r={700} c={interpolateColors(dec, [0, 1], ['#3a2a4a', '#6a4a3a'])} base="transparent" />
					<line x1={960} y1={80} x2={960} y2={900} stroke="#fff" strokeWidth={1} opacity={0.25} />
					{[480, 1440].map((cx, s) => (
						<g key={cx}>
							{Array.from({length: 70}, (_, i) => {
								const y = 140 + i * 10;
								const ph = i * 0.22 + af / 25;
								const x1 = cx + Math.sin(ph) * 140;
								const x2 = cx - Math.sin(ph) * 140;
								const front = Math.cos(ph) > 0;
								return (
									<g key={i}>
										<circle cx={x1} cy={y} r={front ? 2.8 : 1.8} fill="#ff9aaa" opacity={front ? 1 : 0.5} />
										<circle cx={x2} cy={y} r={front ? 1.8 : 2.8} fill="#9fe8f0" opacity={front ? 0.5 : 1} />
										{i % 4 === 0 ? <line x1={x1} y1={y} x2={x2} y2={y} stroke="#fff" strokeWidth={0.8} opacity={0.35} /> : null}
									</g>
								);
							})}
							{Array.from({length: 40}, (_, i) => {
								const keep = s ? Math.exp(-dec * 0.6) : Math.exp(-dec * 4);
								if (i / 40 > keep) return null;
								return <Glow key={i} x={cx - 320 + random(`dn${s}${i}`) * 640 + 20 * Math.sin(af / 30 + i)} y={160 + random(`dny${s}${i}`) * 680} r={14} />;
							})}
							<text x={cx} y={830} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 600, fontSize: 40, fill: s ? '#ffd896' : '#e8e8e8'}}>
								{s ? '慢 · 失眠到天亮' : '快 · 倒头就睡'}
							</text>
						</g>
					))}
					<g opacity={landed(f, cue(1) + 6)}>
						<Tag en="CYP1A2" zh="肝脏里分解咖啡因的基因" />
					</g>
				</g>
			) : null}
			{h3 > 0 ? (
				<g opacity={h3 * (1 - toCup)}>
					<Room x={960} y={420} r={1000} c="#2a2366" base="#05040e" />
					<g transform={`translate(960,560) scale(${mix(1.25, 0.95, pull)}) translate(-960,-560)`}>
						{Array.from({length: 12}, (_, i) => {
							if (i >= nLocks) return null;
							const at = i < 3 ? cue(2) : i < 6 ? batches[0] : batches[1];
							const k = i < 3 ? 1 : spring({frame: f - at - (i % 6) * 2, fps: 30, config: {damping: 13}});
							return (
								<g key={i} transform={`translate(${240 + (i % 6) * 288},${430 + Math.floor(i / 6) * 330}) scale(${0.75 * k}) translate(${-(240 + (i % 6) * 288)},${-(430 + Math.floor(i / 6) * 330)})`}>
									<Receptor x={240 + (i % 6) * 288} y={430 + Math.floor(i / 6) * 330} gold={i < 4} />
								</g>
							);
						})}
					</g>
					<g opacity={landed(f, cue(2) + 6)}>
						<Num text={`${nLocks}`} x={960} y={160} size={90} fill="#9fe8f0" />
						<text x={960} y={210} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 20, letterSpacing: '0.4em', fill: '#9fe8f0'}} opacity={0.7}>
							把锁
						</text>
						<Tag en="Tolerance" zh="耐受 · 受体变多，同样的咖啡不够分" />
					</g>
				</g>
			) : null}
			{toCup > 0 ? <circle cx={960} cy={540} r={mix(800, 120, toCup)} fill="none" stroke="#f6e7c8" strokeWidth={2} opacity={toCup} /> : null}
			<Glow x={960} y={540} r={300} o={fromGlow} />
		</Stage>
	);
};

// ---------------------------------------------------------------- 9. coda: morning, the cup by the window; the Juno end card

const Coda: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const af = useAbsoluteFrame();
	const cue = useCue();
	const scene = useScene();
	const end = scene.duration;
	const endAt = end - 6 * 30;
	const rimIn = prog(f, 0, 22, ease.out);
	const orbit = prog(f, 0, endAt, ease.inOut);
	const ghostTree = landed(f, cue(0) + 10, cue(1) - 6, 20);
	const ghostFlower = landed(f, cue(1) + 4, cue(2) - 2, 20);
	const sun = prog(f, cue(2) - 16, 40, ease.inOut);
	const steam = (dx: number, i: number) => {
		let d = `M${960 + dx},${560}`;
		for (let k = 1; k <= 16; k++) d += ` L${960 + dx + 40 * noise2D(`st${i}`, k / 5, af / 50) * (k / 16)},${560 - k * 22}`;
		return d;
	};
	return (
		<Stage
			over={
				<Sequence from={endAt} layout="none">
					<EndCard v={EPISODE} cfg={BRAND} dur={end - endAt} />
				</Sequence>
			}
		>
			<Room x={1300} y={300} r={1000 + 300 * sun} c={interpolateColors(sun, [0, 1], ['#e8a060', '#ffe0b0'])} base={interpolateColors(sun, [0, 1], ['#0a0604', '#2a1408'])} />
			<g transform={`translate(${-60 * orbit},0)`}>
				<rect x={760} y={60} width={1080} height={680} fill="#ffd8a8" opacity={0.08 + 0.1 * sun} stroke="#3a2010" strokeWidth={14} />
				<line x1={1300} y1={60} x2={1300} y2={740} stroke="#3a2010" strokeWidth={12} />
				<polygon points="760,740 1840,740 1500,1080 260,1080" fill="#ffd8a8" opacity={0.08 + 0.12 * sun} />
			</g>
			<rect y={800} width={W} height={280} fill={interpolateColors(sun, [0, 1], ['#140b06', '#3a200e'])} />
			<g transform={`translate(${30 * orbit},0)`} opacity={rimIn}>
				<Cup x={960} y={700} s={0.9} level={0.85} rim={sun > 0.5 ? '#fff6e0' : '#f6e7c8'} />
				{[-30, 0, 30].map((dx, i) => (
					<path key={i} d={steam(dx, i)} stroke="#fff" strokeWidth={8} fill="none" opacity={0.16} filter="url(#b8)" />
				))}
				<g opacity={0.55 * ghostTree}>
					<Branches x={960} y={520} s={0.9} color="#fff1dc" seed="steam" n={5} up w={3} len={110} />
				</g>
				<g opacity={ghostFlower}>
					<LineFlower x={960} y={350} s={0.8} o={0.7} />
					{Array.from({length: 7}, (_, i) => {
						const k = prog(f, cue(1) + 20 + i * 4, 16, ease.out);
						return (
							<g key={i} opacity={k}>
								<Bean x={720 + i * 80} y={560 - 10 * k} r={20} c0="#ffe0a0" c1="#a06020" rot={i * 22} />
								<circle cx={720 + i * 80} cy={560 - 10 * k} r={30} fill="url(#ember)" opacity={0.4} />
							</g>
						);
					})}
				</g>
				{sun > 0 ? <circle cx={1090} cy={570} r={40} fill="#fff" opacity={0.7 * sun} filter="url(#b8)" /> : null}
			</g>
			<g opacity={sun}>
				<Rays x={1500} y={260} n={9} o={0.22} c="#fff6e0" />
			</g>
			<Motes f={af} seed="co" n={50} o={0.8} />
			<rect width={W} height={H} fill="#05060b" opacity={0.88 * prog(f, endAt, 30, ease.inOut)} />
		</Stage>
	);
};

export const scenesD = {Roast, Body, Coda};
export const scenes: SceneMap = {...scenesA, ...scenesB, ...scenesC, ...scenesD};
