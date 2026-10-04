import React, {useMemo} from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {loadEpisodeFonts} from '../../src/lib/fonts';

/**
 * 《同一个中心》 — a short film about love, told by two lights.
 * Two lights each circle their own small orbit, drift, meet on the score's bar 8 (26.67 s),
 * and from then on circle a centre that is neither of them. They quarrel (drift far apart on a
 * long ellipse), gravity pulls them back, and over the years their trails draw a rose.
 * 1920×1080, 30 fps, 68 s; the score is episodes/love/music.py (72 bpm, bar = 3.333 s).
 */

export const LOVE_FRAMES = 68 * 30;
const W = 1920;
const H = 1080;
const BAR = 60 / 72 * 4;
const MEET = 8 * BAR; // 26.67 s
const FIGHT = 12 * BAR; // 40.0
const BACK = 13 * BAR; // 43.33
const ROSE = 14 * BAR; // 46.67
const END = 19 * BAR; // 63.33

const WARM = '#ff9a7a';
const COOL = '#8ec9ff';

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a: number, b: number, t: number) => {
	const x = clamp((t - a) / (b - a));
	return x * x * (3 - 2 * x);
};
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------------------------------------------------------------- the two lights' motion

/** angular speed (rad/s) of the shared orbit after they meet, and of each own orbit before */
const omega = (t: number) => {
	if (t < MEET) return 1.4;
	let w = 1.05;
	w = mix(w, 0.32, smooth(FIGHT - 0.4, FIGHT + 1.2, t)); // the quarrel: slow, far apart
	w = mix(w, 1.15, smooth(BACK, BACK + 1.6, t)); // pulled back
	w = mix(w, 1.7, smooth(ROSE, ROSE + 2.5, t)); // the years: steady, quick
	w = mix(w, 0.9, smooth(END - 2, END + 2, t));
	return w;
};

const DT = 1 / 240;
const TABLE = (() => {
	// integrated angles, so a change of speed never makes a light jump
	const n = Math.ceil(70 / DT);
	const a = new Float64Array(n);
	const b = new Float64Array(n);
	for (let i = 1; i < n; i++) {
		const t = i * DT;
		a[i] = a[i - 1] + omega(t) * DT;
		b[i] = t < MEET ? b[i - 1] - 1.2 * DT : a[i] + Math.PI;
	}
	return {a, b};
})();
const ang = (tab: Float64Array, t: number) => {
	const x = clamp(t, 0, 69.9) / DT;
	const i = Math.floor(x);
	return tab[i] + (tab[i + 1] - tab[i]) * (x - i);
};

/** orbit radius, squash and tilt of the ellipse over the film */
const shape = (t: number, th: number) => {
	let r: number;
	if (t < MEET) {
		r = mix(70, 0, smooth(MEET - 5.5, MEET, t)); // their own small circles close as they meet
	} else {
		r = mix(0, 210, smooth(MEET, MEET + 3.2, t));
		r = mix(r, 380, smooth(FIGHT - 0.4, FIGHT + 1.6, t));
		r = mix(r, 190, smooth(BACK, BACK + 2, t));
		const rose = smooth(ROSE, ROSE + 3, t);
		r += rose * 75 * Math.sin(3.5 * th);
		r = mix(r, r * 0.72, smooth(END - 1, END + 3, t));
	}
	const squash = t < MEET ? 1 : mix(1, 0.42, smooth(FIGHT - 0.4, FIGHT + 1.6, t) * (1 - smooth(BACK, BACK + 2, t)));
	const tilt = -0.35 + 0.08 * t;
	return {r, squash, tilt};
};

/** where each light's own circle is centred: far apart, then drifting together to meet in the middle */
const centre = (t: number, side: 1 | -1) => {
	const k = smooth(13, MEET, t);
	return {x: side * mix(470, 0, k), y: side * mix(-40, 0, k) + 26 * (1 - k) * Math.sin(t * 0.7 + side)};
};

const pos = (t: number, who: 'a' | 'b'): [number, number] => {
	const th = ang(who === 'a' ? TABLE.a : TABLE.b, t);
	const {r, squash, tilt} = shape(t, ang(TABLE.a, t));
	const c = t < MEET + 0.5 ? centre(Math.min(t, MEET), who === 'a' ? -1 : 1) : {x: 0, y: 0};
	const ex = r * Math.cos(th);
	const ey = r * squash * Math.sin(th);
	return [c.x + ex * Math.cos(tilt) - ey * Math.sin(tilt), c.y + ex * Math.sin(tilt) + ey * Math.cos(tilt)];
};

// ---------------------------------------------------------------- drawing

const Stars: React.FC<{t: number}> = ({t}) => {
	const stars = useMemo(
		() =>
			Array.from({length: 260}, (_, i) => ({
				x: random(`sx${i}`) * 2600 - 1300,
				y: random(`sy${i}`) * 1500 - 750,
				r: 0.4 + random(`sr${i}`) ** 3 * 2.2,
				d: 0.3 + random(`sd${i}`) * 0.7,
				p: random(`sp${i}`) * 6,
			})),
		[],
	);
	return (
		<g>
			{stars.map((s, i) => (
				<circle key={i} cx={s.x * s.d} cy={s.y * s.d} r={s.r} fill="#dfe8ff" opacity={(0.25 + 0.5 * s.d) * (0.6 + 0.4 * Math.sin(t * (0.6 + s.d) + s.p))} />
			))}
		</g>
	);
};

/** a light: soft halo, bright core, and its recent trail tapering behind it */
const Light: React.FC<{t: number; who: 'a' | 'b'; color: string; glow: number}> = ({t, who, color, glow}) => {
	const [x, y] = pos(t, who);
	const segs: React.ReactNode[] = [];
	const T = 1.6;
	const n = 48;
	let prev = pos(Math.max(0, t - T), who);
	for (let i = 1; i <= n; i++) {
		const tt = t - T + (T * i) / n;
		if (tt < 0) continue;
		const p = pos(tt, who);
		const k = i / n;
		segs.push(<line key={i} x1={prev[0]} y1={prev[1]} x2={p[0]} y2={p[1]} stroke={color} strokeWidth={1 + 5 * k * k} strokeLinecap="round" opacity={0.85 * k * k * glow} />);
		prev = p;
	}
	return (
		<g>
			<g filter="url(#lv-soft)">{segs}</g>
			{segs}
			<circle cx={x} cy={y} r={120} fill={`url(#lv-halo-${who})`} opacity={0.9 * glow} />
			<circle cx={x} cy={y} r={9} fill="#fffaf4" opacity={glow} />
			<circle cx={x} cy={y} r={16} fill={color} opacity={0.55 * glow} filter="url(#lv-soft)" />
		</g>
	);
};

/** the long exposure: everything each light has drawn since the years began */
const Exposure: React.FC<{t: number; who: 'a' | 'b'; color: string; o: number}> = ({t, who, color, o}) => {
	if (t <= ROSE || o <= 0) return null;
	let d = '';
	for (let tt = ROSE; tt <= t; tt += 1 / 50) {
		const [x, y] = pos(tt, who);
		d += `${d ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)} `;
	}
	return (
		<g opacity={o}>
			<path d={d} stroke={color} strokeWidth={5} fill="none" opacity={0.12} filter="url(#lv-soft)" />
			<path d={d} stroke={color} strokeWidth={1.3} fill="none" opacity={0.5} />
		</g>
	);
};

const Meeting: React.FC<{t: number}> = ({t}) => {
	const k = t - MEET;
	if (k < -0.05 || k > 3.5) return null;
	const flash = Math.exp(-Math.max(0, k) / 0.35);
	return (
		<g>
			<circle r={260 + 600 * k} fill="url(#lv-flash)" opacity={0.9 * flash} />
			{[0, 0.35, 0.7].map((dk, i) => {
				const q = k - dk;
				if (q < 0) return null;
				return <circle key={i} r={40 + q * 420} fill="none" stroke="#ffe9da" strokeWidth={2.2} opacity={0.55 * Math.exp(-q / 0.9)} />;
			})}
			{Array.from({length: 46}, (_, i) => {
				const a = random(`ma${i}`) * Math.PI * 2;
				const v = 120 + random(`mv${i}`) * 380;
				const q = Math.max(0, k);
				const x = Math.cos(a) * v * (1 - Math.exp(-q * 2.2)) / 2.2;
				const y = Math.sin(a) * v * (1 - Math.exp(-q * 2.2)) / 2.2;
				return <circle key={i} cx={x} cy={y} r={1.2 + random(`mr${i}`) * 2} fill={i % 2 ? WARM : COOL} opacity={0.9 * Math.exp(-q / 1.4)} />;
			})}
		</g>
	);
};

// ---------------------------------------------------------------- words

const LINES: [number, number, string][] = [
	[0.8, 4.6, '宇宙很大。'],
	[5.2, 9.6, '大到两个光点，本来不必相遇。'],
	[10.2, 15.4, '它们各自，转着自己的圈。'],
	[16.0, 21.4, '后来，都偏离了一点点。'],
	[22.0, 25.8, '偏离到——'],
	[27.6, 31.6, '从那以后，它们绕着同一个中心转。'],
	[32.2, 36.4, '那个中心，不是她，也不是他。'],
	[37.0, 39.7, '也会吵架。'],
	[40.1, 43.1, '吵架的时候，离远一点。'],
	[43.5, 46.4, '但引力还在。'],
	[47.4, 52.2, '很多年过去，光暗了一点。'],
	[52.8, 57.6, '留下的轨迹，却越来越好看。'],
	[58.4, 63.0, '爱，大概就是两个人，选了同一个中心。'],
];

const Words: React.FC<{t: number}> = ({t}) => (
	<g>
		{LINES.map(([a, b, s], i) => {
			const o = smooth(a, a + 0.6, t) * (1 - smooth(b - 0.5, b, t));
			if (o <= 0) return null;
			const rise = 10 * (1 - smooth(a, a + 0.8, t));
			return (
				<text key={i} x={W / 2} y={940 + rise} textAnchor="middle" opacity={o} style={{fontFamily: '"EpSerif", serif', fontWeight: 500, fontSize: 46, letterSpacing: '0.16em', fill: '#f4ece6'}}>
					{s}
				</text>
			);
		})}
	</g>
);

const Title: React.FC<{t: number}> = ({t}) => {
	const o = smooth(END + 0.3, END + 1.6, t) * (1 - smooth(67.2, 68, t));
	if (o <= 0) return null;
	return (
		<g opacity={o}>
			<text x={W / 2} y={505} textAnchor="middle" style={{fontFamily: '"EpSerif", serif', fontWeight: 700, fontSize: 92, letterSpacing: '0.3em', fill: '#fff4ec'}}>
				同一个中心
			</text>
			<text x={W / 2} y={575} textAnchor="middle" style={{fontFamily: '"EpLatinItalic", serif', fontStyle: 'italic', fontSize: 34, letterSpacing: '0.2em', fill: 'rgba(244,236,230,0.6)'}}>
				The Same Center
			</text>
		</g>
	);
};

// ---------------------------------------------------------------- the film

export const LoveFilm: React.FC = () => {
	loadEpisodeFonts('love');
	const f = useCurrentFrame();
	const t = f / 30;
	// the camera: a slow pull back from empty sky, a breath at the meeting, room for the quarrel
	let zoom = mix(1.45, 1.0, smooth(0, 11, t));
	zoom *= 1 + 0.05 * Math.exp(-Math.max(0, t - MEET) / 0.6) * (t > MEET ? 1 : 0);
	zoom = mix(zoom, 0.8, smooth(FIGHT - 0.6, FIGHT + 1.6, t) * (1 - smooth(BACK, BACK + 2.2, t)));
	zoom = mix(zoom, 0.94, smooth(ROSE + 4, END, t));
	zoom = mix(zoom, 0.72, smooth(END, 68, t));
	const drift = {x: 30 * Math.sin(t / 9), y: 18 * Math.cos(t / 11)};
	// light dims with the years; the warm/cool sky tints with how close they are
	const glow = mix(1, 0.72, smooth(ROSE + 0.5, ROSE + 6, t));
	const together = smooth(MEET, MEET + 2, t) * (1 - 0.6 * smooth(FIGHT - 0.4, FIGHT + 1.6, t) * (1 - smooth(BACK, BACK + 2, t)));
	const centreMark = smooth(32.2, 33.4, t) * (1 - smooth(37, 38.5, t));
	const exposure = smooth(ROSE + 0.5, ROSE + 4, t);
	const titleDim = 1 - 0.55 * smooth(END + 0.2, END + 1.6, t);
	return (
		<AbsoluteFill style={{background: '#04050a'}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
				<defs>
					<radialGradient id="lv-sky" cx="50%" cy="55%" r="75%">
						<stop offset="0" stopColor="#141a33" />
						<stop offset="0.55" stopColor="#080b18" />
						<stop offset="1" stopColor="#020308" />
					</radialGradient>
					<radialGradient id="lv-warmth" cx="50%" cy="50%" r="50%">
						<stop offset="0" stopColor="#ff9a7a" stopOpacity="0.22" />
						<stop offset="0.6" stopColor="#b56a8a" stopOpacity="0.06" />
						<stop offset="1" stopColor="#000" stopOpacity="0" />
					</radialGradient>
					{(
						[
							['a', WARM],
							['b', COOL],
						] as const
					).map(([k, c]) => (
						<radialGradient key={k} id={`lv-halo-${k}`}>
							<stop offset="0" stopColor={c} stopOpacity="0.55" />
							<stop offset="0.25" stopColor={c} stopOpacity="0.18" />
							<stop offset="1" stopColor={c} stopOpacity="0" />
						</radialGradient>
					))}
					<radialGradient id="lv-flash">
						<stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
						<stop offset="0.2" stopColor="#ffd9c8" stopOpacity="0.45" />
						<stop offset="1" stopColor="#9ec8ff" stopOpacity="0" />
					</radialGradient>
					<filter id="lv-soft" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation={5} />
					</filter>
					<radialGradient id="lv-vig" cx="50%" cy="50%" r="72%">
						<stop offset="0.55" stopColor="#000" stopOpacity="0" />
						<stop offset="1" stopColor="#000" stopOpacity="0.85" />
					</radialGradient>
				</defs>
				<rect width={W} height={H} fill="url(#lv-sky)" />
				<g transform={`translate(${W / 2 + drift.x},${H / 2 - 30 + drift.y}) scale(${zoom})`}>
					<g transform={`scale(${0.6 + 0.4 / zoom})`}>
						<Stars t={t} />
					</g>
					<circle r={700} fill="url(#lv-warmth)" opacity={together} />
					<g opacity={titleDim}>
						<Exposure t={t} who="a" color={WARM} o={exposure} />
						<Exposure t={t} who="b" color={COOL} o={exposure} />
						{/* the centre that is neither of them */}
						{centreMark > 0 ? (
							<g opacity={centreMark}>
								<circle r={5} fill="#f4ece6" opacity={0.8} />
								<circle r={22} fill="none" stroke="#f4ece6" strokeWidth={1.2} strokeDasharray="3 6" opacity={0.6} />
							</g>
						) : null}
						<Light t={t} who="a" color={WARM} glow={glow} />
						<Light t={t} who="b" color={COOL} glow={glow} />
						<Meeting t={t} />
					</g>
				</g>
				<rect width={W} height={H} fill="url(#lv-vig)" />
				<Words t={t} />
				<Title t={t} />
			</svg>
		</AbsoluteFill>
	);
};
