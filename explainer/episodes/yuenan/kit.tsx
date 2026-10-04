import React from 'react';
import {interpolateColors, random} from 'remotion';
import {noise2D} from '@remotion/noise';
import {Figure, POSES, type Look, type Pose} from '../../src/art/Figure';
import {P} from '../../src/art/palette';
import {font} from '../../src/lib/theme';
import {Glow} from '../xuming/kit3';
import {Motif} from '../../src/brand/Brand';

/**
 * Drawing kit for 《越难越爱》, on the 《续命》 v3 craft rules: one soft light per shot,
 * everything else near-silhouette, thin lines, depth from many small elements,
 * light as the hero material. Each act has its own hue, never its own lighting:
 *   act 1 (phone, 1 a.m.)   cold lilac, the screen is the only light
 *   act 2 (1959 lab)        tungsten amber, one desk lamp
 *   act 3 (the mind)        deep violet, two filament bulbs
 *   reveal / brand          gold
 *   callback (dawn)         rose, the window takes over from the phone
 * The motif is the typing indicator: three dots in a bubble.
 */

export const W = 1920;
export const H = 1080;

export const HUE = {
	phone: '#a9b8ff',
	phoneWarm: '#e8dcff',
	lamp: '#ffb867',
	violet: '#8a6cff',
	gold: '#f1c56d',
	dawn: '#ff9f86',
	cream: '#f3ead8',
	ink: '#06060c',
};

// ---------------------------------------------------------------- cast

export const SHE: Look = {skin: P.skin1, hair: 'long', hairColor: '#241c1c', outfit: 'casual', top: '#3a3550', bottom: '#2a2838', accent: '#d8d2e6'};
export const STUDENT59: Look = {skin: P.skin1, hair: 'bob', hairColor: '#4a3326', outfit: 'dress', top: '#5a4a5e', bottom: '#5a4a5e'};
export const ARONSON: Look = {skin: P.skin1, hair: 'short', hairColor: '#2a221e', outfit: 'suit', top: '#3a3a42', bottom: '#2a2a30', accent: '#6a5a4a', glasses: true};

/** a rig figure placed in the frame */
export const Person: React.FC<{
	look: Look;
	x: number;
	y: number;
	s?: number;
	pose?: Pose;
	flip?: boolean;
	back?: boolean;
	rim?: 'cool' | 'warm' | 'moon' | 'none';
	sil?: string;
	expression?: 'neutral' | 'surprise' | 'thinking' | 'stern' | 'worried' | 'smile';
	reach?: {near?: [number, number]; far?: [number, number]};
	holdNear?: React.ReactNode;
}> = ({look, x, y, s = 1, pose, flip, back, rim = 'cool', sil, expression, reach, holdNear}) => (
	<g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
		<Figure look={look} pose={pose} facing={back ? 'back' : 'side'} rim={rim} silhouette={sil} expression={expression} reach={reach} holdNear={holdNear} shadow={false} />
	</g>
);

export const SIT_PHONE: Pose = {...POSES.sit, lean: 10, head: 22, armNear: [62, 70], armFar: [54, 76]};

// ---------------------------------------------------------------- shared light

/** a dark room lit by one soft source (any hue) */
export const Pool: React.FC<{x: number; y: number; r: number; c: string; o?: number; id: string}> = ({x, y, r, c, o = 1, id}) => (
	<g>
		<defs>
			<radialGradient id={id} cx={x} cy={y} r={r} gradientUnits="userSpaceOnUse">
				<stop offset="0" stopColor={c} stopOpacity={0.55 * o} />
				<stop offset="0.35" stopColor={c} stopOpacity={0.18 * o} />
				<stop offset="1" stopColor={c} stopOpacity="0" />
			</radialGradient>
		</defs>
		<rect width={W} height={H} fill={`url(#${id})`} />
	</g>
);

/** fine dust in the light: many tiny motes, a few big defocused ones in front */
export const Dust: React.FC<{seed: string; f?: number; n?: number; c?: string; x0?: number; x1?: number; y0?: number; y1?: number; o?: number}> = ({
	seed,
	f = 0,
	n = 60,
	c = '#fff2dc',
	x0 = 0,
	x1 = W,
	y0 = 0,
	y1 = H,
	o = 1,
}) => (
	<g opacity={o}>
		{Array.from({length: n}, (_, i) => {
			const near = random(`${seed}n${i}`) > 0.9;
			const r = near ? 8 + random(`${seed}r${i}`) * 18 : 0.8 + random(`${seed}r${i}`) * 2.2;
			const x = x0 + random(`${seed}x${i}`) * (x1 - x0) + 24 * noise2D(seed, i, f / 240);
			const y = y0 + ((random(`${seed}y${i}`) * (y1 - y0) - f * (0.08 + random(`${seed}v${i}`) * 0.25)) % (y1 - y0) + (y1 - y0)) % (y1 - y0);
			return <circle key={i} cx={x} cy={y} r={r} fill={c} opacity={near ? 0.07 : 0.2 + 0.45 * random(`${seed}o${i}`)} filter={near ? 'url(#b8)' : undefined} />;
		})}
	</g>
);

// ---------------------------------------------------------------- the motif: typing indicator

/** three dots in a bubble; `t` animates the wave (frames); `lit` 0..1 */
export const Typing: React.FC<{x: number; y: number; s?: number; t?: number; c?: string; o?: number; gold?: boolean}> = ({x, y, s = 1, t = 0, c = HUE.cream, o = 1, gold}) => {
	const col = gold ? HUE.gold : c;
	return (
		<g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
			<rect x={-62} y={-34} width={124} height={68} rx={34} fill="none" stroke={col} strokeWidth={2} opacity={0.75} />
			<path d="M-46,30 C-56,44 -66,48 -74,48 C-62,40 -60,34 -60,26" fill="none" stroke={col} strokeWidth={2} opacity={0.75} />
			{[-28, 0, 28].map((dx, i) => {
				const k = 0.5 + 0.5 * Math.sin((t / 30) * Math.PI * 2 * 1.2 - i * 0.9);
				return <circle key={i} cx={dx} cy={-6 * k} r={8} fill={col} opacity={0.35 + 0.65 * k} filter={gold ? 'url(#g-sm)' : undefined} />;
			})}
		</g>
	);
};

// ---------------------------------------------------------------- act 1: the phone

/** a phone seen face-on; children are drawn on the screen (screen space 0..w, 0..h) */
export const Phone: React.FC<{x: number; y: number; s?: number; glow?: number; children?: React.ReactNode; dark?: boolean}> = ({x, y, s = 1, glow = 1, children, dark}) => {
	const w = 330;
	const h = 680;
	return (
		<g transform={`translate(${x - (w * s) / 2},${y - (h * s) / 2}) scale(${s})`}>
			<rect x={-60} y={-60} width={w + 120} height={h + 120} rx={90} fill={HUE.phone} opacity={0.1 * glow} filter="url(#b8)" />
			<rect x={-9} y={-9} width={w + 18} height={h + 18} rx={52} fill="#0b0b12" stroke="#4a4a5c" strokeWidth={1.5} />
			<defs>
				<linearGradient id="screen" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#1d1f35" />
					<stop offset="1" stopColor="#11121f" />
				</linearGradient>
				<clipPath id="screenClip">
					<rect width={w} height={h} rx={44} />
				</clipPath>
			</defs>
			<rect width={w} height={h} rx={44} fill={dark ? '#05050a' : 'url(#screen)'} />
			{dark ? null : <g clipPath="url(#screenClip)">{children}</g>}
			<rect x={w / 2 - 50} y={14} width={100} height={26} rx={13} fill="#05050a" />
		</g>
	);
};

/** one chat bubble in screen space; `gold` 0..1 warms her bubbles into the episode's gold (her effort) */
export const Bubble: React.FC<{y: number; text: string; mine?: boolean; w?: number; o?: number; size?: number; gold?: number}> = ({y, text, mine, w, o = 1, size = 19, gold = 0}) => {
	const longest = text.includes('\n') ? Math.max(...text.split('\n').map((r) => r.length)) : text.length;
	const bw = w ?? Math.min(250, longest * size + 34);
	const x = mine ? 330 - 18 - bw : 18;
	const rows = text.includes('\n') ? text.split('\n') : null;
	const lines = rows ? rows.length : Math.ceil((text.length * size) / (bw - 30));
	const per = Math.ceil(text.length / lines);
	const bh = 22 + lines * (size + 9);
	const fill = mine ? interpolateColors(gold, [0, 1], ['#8f9cff', '#f1c56d']) : '#3a3c5c';
	return (
		<g opacity={o}>
			{gold > 0 && mine ? <rect x={x - 6} y={y - 6} width={bw + 12} height={bh + 12} rx={22} fill={HUE.gold} opacity={0.35 * gold} filter="url(#b8)" /> : null}
			<rect x={x} y={y} width={bw} height={bh} rx={18} fill={fill} opacity={mine ? 0.88 : 1} />
			{Array.from({length: lines}, (_, i) => (
				<text key={i} x={x + 16} y={y + 14 + (i + 1) * (size + 6)} style={{fontFamily: font.sans, fontSize: size, fill: mine ? '#141020' : '#d6d4e6'}}>
					{rows ? rows[i] : text.slice(i * per, (i + 1) * per)}
				</text>
			))}
		</g>
	);
};

/** a centred time stamp between messages (screen space) */
export const TimeChip: React.FC<{y: number; t: string; o?: number}> = ({y, t, o = 1}) => (
	<text x={165} y={y} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 15, fill: '#8a8eb8', letterSpacing: '0.06em'}} opacity={o}>
		{t}
	</text>
);

/** the status-bar clock (screen space) */
export const Clock: React.FC<{t: string}> = ({t}) => (
	<text x={40} y={34} style={{fontFamily: font.sans, fontWeight: 600, fontSize: 15, fill: '#c9cbe6'}}>
		{t}
	</text>
);

/** The motif (drawn by the brand's Motif so title card, end card and transitions match). */
export const ChatStack: React.FC<{x: number; y: number; s?: number; o?: number; p?: number}> = ({x, y, s = 1, o = 1, p = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
		<Motif kind="chat" p={p} f={0} />
	</g>
);

/** the chat header in screen space */
export const ChatHead: React.FC<{name?: string; status?: string}> = ({name = 'TA', status}) => (
	<g>
		<rect width={330} height={96} fill="#15162a" />
		<text x={165} y={72} textAnchor="middle" style={{fontFamily: font.sans, fontWeight: 600, fontSize: 21, fill: '#e6e4f2'}}>
			{name}
		</text>
		{status ? (
			<text x={165} y={90} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 13, fill: '#9aa2d8'}}>
				{status}
			</text>
		) : null}
		<text x={34} y={72} style={{fontFamily: font.sans, fontSize: 26, fill: '#9aa2d8'}}>
			‹
		</text>
	</g>
);

/** a dark bedroom at 1 a.m.: window with a cold city, bed, a figure lit only by the phone */
export const Bedroom: React.FC<{f?: number; phone?: number; dawn?: number}> = ({f = 0, phone = 1, dawn = 0}) => (
	<g>
		<rect width={W} height={H} fill="#05050b" />
		{/* window, back wall right */}
		<g transform="translate(1180,170)">
			<rect width={520} height={560} fill={dawn > 0 ? '#2a1a2a' : '#0b0d1c'} />
			<rect width={520} height={560} fill="url(#dawnSky)" opacity={dawn} />
			{/* far city: tiny windows */}
			{Array.from({length: 70}, (_, i) => {
				const bx = random(`bw${i}`) * 500 + 10;
				const by = 330 + random(`bh${i}`) * 220;
				return <rect key={i} x={bx} y={by} width={3} height={4} fill="#ffcf8a" opacity={(random(`bo${i}`) > 0.6 ? 0.55 : 0.12) * (1 - dawn * 0.7)} />;
			})}
			<path d="M0,420 L40,420 L40,360 L90,360 L90,400 L150,400 L150,330 L190,330 L190,410 L260,410 L260,350 L310,350 L310,390 L380,390 L380,320 L430,320 L430,400 L520,400 L520,560 L0,560 Z" fill="#06060e" opacity={0.85} />
			{/* frame + curtain */}
			<rect width={520} height={560} fill="none" stroke="#14152a" strokeWidth={14} />
			<line x1={260} y1={0} x2={260} y2={560} stroke="#14152a" strokeWidth={10} />
			<path d="M-40,-20 C10,140 -10,380 30,600 L-80,600 L-80,-20 Z" fill="#0a0a14" />
			<path d="M560,-20 C500,160 540,400 500,600 L620,600 L620,-20 Z" fill="#0a0a14" />
		</g>
		{/* cold window light on the floor */}
		<path d="M1180,730 L1700,730 L1900,1080 L1240,1080 Z" fill={dawn > 0 ? HUE.dawn : HUE.phone} opacity={0.035 + dawn * 0.08} />
		{/* bed */}
		<path d="M220,760 C220,720 260,700 320,700 L1120,700 C1170,700 1190,730 1190,770 L1190,860 L220,860 Z" fill="#0e0e1a" />
		<path d="M200,700 L200,600 C200,570 220,560 250,560 L300,560 C320,560 330,580 330,600 L330,700 Z" fill="#0c0c16" />
		<path d="M340,690 C420,650 520,660 600,690" fill="none" stroke="#1d1e33" strokeWidth={3} />
		{/* phone light on the sheets */}
		<ellipse cx={720} cy={720} rx={420} ry={60} fill={HUE.phone} opacity={0.1 * phone} filter="url(#b8)" />
		<Pool x={760} y={560} r={520} c={HUE.phone} o={phone} id="bedPool" />
		<Pool x={1440} y={420} r={900} c={HUE.dawn} o={dawn} id="dawnPool" />
		<Dust seed="bed" f={f} n={40} c="#d8deff" x0={500} x1={1100} y0={350} y1={800} o={0.6 * phone + 0.4 * dawn} />
	</g>
);

// ---------------------------------------------------------------- act 2: 1959

/** a long corridor at night with one door ajar; warm light spills out */
export const Corridor: React.FC<{f?: number; open?: number}> = ({f = 0, open = 0.35}) => {
	const vx = 960;
	const vy = 470;
	return (
		<g>
			<rect width={W} height={H} fill="#07060a" />
			{/* walls converging */}
			<path d={`M0,0 L${vx - 160},${vy - 150} L${vx - 160},${vy + 150} L0,${H} Z`} fill="#0d0b0d" />
			<path d={`M${W},0 L${vx + 160},${vy - 150} L${vx + 160},${vy + 150} L${W},${H} Z`} fill="#0b0a0c" />
			<path d={`M0,${H} L${vx - 160},${vy + 150} L${vx + 160},${vy + 150} L${W},${H} Z`} fill="#100d0c" />
			{/* floor tiles */}
			{Array.from({length: 9}, (_, i) => {
				const t = (i + 1) / 10;
				const y = vy + 150 + (H - vy - 150) * t * t;
				return <line key={i} x1={0} y1={y} x2={W} y2={y} stroke="#1a1512" strokeWidth={1} opacity={0.5} />;
			})}
			{/* closed doors left */}
			{[0.25, 0.55].map((t, i) => {
				const x = (vx - 160) * t;
				const top = (vy - 150) * t;
				const bot = H - (H - vy - 150) * t;
				return <path key={i} d={`M${x},${top + 120 * (1 - t)} L${x + 90 * (1 - t * 0.6)},${top + 130 * (1 - t) + 30} L${x + 90 * (1 - t * 0.6)},${bot - 20} L${x},${bot}`} fill="#140f0d" stroke="#1e1714" strokeWidth={1} />;
			})}
			{/* the door at the right, ajar */}
			<g transform="translate(1340,250)">
				<path d="M0,0 L170,-70 L170,640 L0,560 Z" fill="#1a120c" />
				<path d={`M0,0 L${170 * open},${-70 * open} L${170 * open},${640 - 80 * (1 - open)} L0,560 Z`} fill={HUE.lamp} opacity={0.85} />
				<path d={`M0,560 L${170 * open},${640 - 80 * (1 - open)} L-420,1000 L-700,1000 Z`} fill={HUE.lamp} opacity={0.14} />
				<rect x={30} y={-6} width={110} height={22} fill="#2a1d12" transform="skewY(-22)" />
			</g>
			<Pool x={1420} y={560} r={700} c={HUE.lamp} id="corrPool" />
			<Dust seed="corr" f={f} n={50} c="#ffe0b0" x0={1000} x1={1700} y0={250} y1={900} />
		</g>
	);
};

/** 1950s headphones (side view, thin) */
export const Headphones: React.FC<{x: number; y: number; s?: number; c?: string}> = ({x, y, s = 1, c = '#d9c3a0'}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M-70,10 C-70,-80 70,-80 70,10" fill="none" stroke={c} strokeWidth={6} strokeLinecap="round" />
		<rect x={-92} y={0} width={34} height={56} rx={12} fill="#2a211a" stroke={c} strokeWidth={2} />
		<rect x={58} y={0} width={34} height={56} rx={12} fill="#2a211a" stroke={c} strokeWidth={2} />
		<path d="M75,56 C80,120 40,150 10,190" fill="none" stroke={c} strokeWidth={2} opacity={0.6} />
	</g>
);

/** a sound wave: amp 0..1, `dull` flattens it to a monotone drone */
export const Wave: React.FC<{x0: number; x1: number; y: number; t: number; amp?: number; c?: string; w?: number; seed?: string}> = ({x0, x1, y, t, amp = 1, c = HUE.lamp, w = 2, seed = 'wv'}) => {
	const n = 160;
	const pts = Array.from({length: n + 1}, (_, i) => {
		const u = i / n;
		const env = Math.sin(Math.PI * u);
		const v = noise2D(seed, u * 9, t / 40) * 0.7 + 0.3 * Math.sin(u * 80 + t / 6);
		return `${x0 + (x1 - x0) * u},${y + v * 60 * amp * env}`;
	});
	return <polyline points={pts.join(' ')} fill="none" stroke={c} strokeWidth={w} filter="url(#g-sm)" />;
};

/** a desk lamp with its cone; the only light in the 1959 shots */
export const DeskLamp: React.FC<{x: number; y: number; s?: number; o?: number}> = ({x, y, s = 1, o = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d="M-50,0 L50,0 L36,-12 L-36,-12 Z" fill="#2a2018" />
		<line x1={0} y1={-12} x2={-30} y2={-150} stroke="#3a2c20" strokeWidth={6} />
		<line x1={-30} y1={-150} x2={40} y2={-210} stroke="#3a2c20" strokeWidth={6} />
		<path d="M20,-240 L90,-180 L60,-160 L0,-215 Z" fill="#1d1712" stroke="#4a3a28" strokeWidth={1.5} />
		<path d="M60,-170 L300,170 L-160,170 L30,-190 Z" fill={HUE.lamp} opacity={0.08 * o} filter="url(#b8)" />
		<Glow x={50} y={-180} r={70} o={o} />
	</g>
);

/** index cards with words; `hidden` blurs the words (we never show them) */
export const Card: React.FC<{x: number; y: number; rot?: number; s?: number; o?: number}> = ({x, y, rot = 0, s = 1, o = 1}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={o}>
		<rect x={-110} y={-70} width={220} height={140} rx={4} fill="#e9dcc0" />
		{[0, 1, 2, 3].map((i) => (
			<rect key={i} x={-84} y={-44 + i * 26} width={120 + ((i * 37) % 50)} height={9} rx={4} fill="#3a2e22" opacity={0.55} filter="url(#b2)" />
		))}
	</g>
);

// ---------------------------------------------------------------- act 3: the mind

/** a filament bulb on a wire; `on` 0..1 */
export const Bulb: React.FC<{x: number; y: number; on: number; label?: string; c?: string; s?: number}> = ({x, y, on, label, c = HUE.lamp, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<line x1={0} y1={-600} x2={0} y2={-70} stroke="#2a2433" strokeWidth={2} />
		<rect x={-14} y={-74} width={28} height={30} rx={3} fill="#2b2530" stroke="#5a5060" strokeWidth={1} />
		<circle cx={0} cy={0} r={300} fill={c} opacity={0.1 * on} filter="url(#b8)" />
		<path d="M-14,-44 C-56,-20 -56,52 0,64 C56,52 56,-20 14,-44 Z" fill={c} opacity={0.06 + 0.12 * on} stroke="#f6e7c8" strokeWidth={1.4} strokeOpacity={0.35 + 0.4 * on} />
		<path d="M-8,-40 L-8,8 C-8,20 8,20 8,8 L8,-40 M-8,8 C-4,0 0,20 4,4 C6,0 8,10 8,8" fill="none" stroke={on > 0.1 ? '#fff4d8' : '#6a5a50'} strokeWidth={1.6} filter={on > 0.1 ? 'url(#g-sm)' : undefined} opacity={0.4 + 0.6 * on} />
		{on > 0.05 ? <circle cx={0} cy={6} r={16 + 40 * on} fill={c} opacity={0.35 * on} filter="url(#g-md)" /> : null}
		{label ? (
			<text x={0} y={130} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 600, fontSize: 34, fill: HUE.cream}} opacity={0.3 + 0.7 * on}>
				{label}
			</text>
		) : null}
	</g>
);

/** a flat-pack box, assembled 0..1 (IKEA effect) */
export const FlatPack: React.FC<{x: number; y: number; s?: number; k: number; c?: string}> = ({x, y, s = 1, k, c = HUE.gold}) => {
	const lift = (i: number) => Math.min(1, Math.max(0, k * 4 - i));
	const l = lift(0);
	const r = lift(1);
	const b = lift(2);
	const t = lift(3);
	return (
		<g transform={`translate(${x},${y}) scale(${s})`} fill="none" stroke={c} strokeWidth={2} strokeLinejoin="round">
			{/* floor panel */}
			<path d="M-120,40 L0,90 L120,40 L0,-10 Z" opacity={0.9} />
			{/* left wall rises */}
			<path d={`M-120,40 L0,90 L0,${90 - 120 * l} L-120,${40 - 120 * l} Z`} opacity={0.3 + 0.6 * l} />
			<path d={`M120,40 L0,90 L0,${90 - 120 * r} L120,${40 - 120 * r} Z`} opacity={0.3 + 0.6 * r} />
			<path d={`M-120,${40 - 120 * b} L0,${-10 - 120 * b} L120,${40 - 120 * b}`} opacity={b} />
			<path d={`M-120,${-80} L0,${-130 + 20 * (1 - t)} L120,-80 L0,-30 Z`} opacity={t} />
		</g>
	);
};
