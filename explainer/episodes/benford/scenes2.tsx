import React from 'react';
import {Sequence, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Figure, POSES, blinkAt, type Look} from '../../src/art/Figure';
import {P} from '../../src/art/palette';
import {Layer} from '../../src/art/sets/Airfield';
import {EndCard, type BrandCfg} from '../../src/brand/Brand';
import {FullFrame} from '../../src/components/FullFrame';
import {ease, prog, useCue, useScene, useTimeline} from '../../src/lib/context';
import {color, font} from '../../src/lib/theme';
import type {SceneProps} from '../../src/lib/types';
import {BENF, BOOK, BookFront, EdgeMacro, GOLD, H, OilLamp, Snow, Study1881, W, camPath, camSpeed, type Key} from './art';
import {EPISODE} from './episode';

/**
 * 《第一位数字》 second half: build (the growing town), drop (the reveal), the
 * cheques, the city and the three takeaways, the callback to Newcomb's book and
 * the end card. Every scene opens on what the previous one ended with.
 */

const LN: React.CSSProperties = {fontVariantNumeric: 'lining-nums tabular-nums'};
const camT = (cam: {x: number; y: number; zoom: number}) => `translate(960,540) scale(${cam.zoom}) translate(${-(cam.x / cam.zoom + 960)},${-(cam.y / cam.zoom + 540)})`;
const hitAt = (f: number, at: number, decay = 4) => (f >= at ? Math.exp(-(f - at) / decay) : 0);
const useLocalBeats = () => {
	const {music} = useTimeline();
	const scene = useScene();
	return music.beats.map((b) => b - scene.from);
};
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const firstDigit = (n: number) => Number(String(Math.floor(n))[0]);

const MotionBlur: React.FC<{keys: Key[]; f: number; id: string; children: React.ReactNode}> = ({keys, f, id, children}) => {
	const [vx, vy] = camSpeed(keys, f);
	const bx = Math.min(16, Math.max(0, (vx - 6) * 0.22));
	const by = Math.min(16, Math.max(0, (vy - 6) * 0.22));
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

/** a gold bar with a glow (the staircase, the tubes' contents) */
const GoldBar: React.FC<{x: number; w: number; bot: number; h: number; o?: number; glow?: number; tone?: string}> = ({x, w, bot, h, o = 1, glow = 0.18, tone}) => (
	<g opacity={o}>
		<rect x={x - 6} y={bot - h - 8} width={w + 12} height={h + 16} fill={tone ?? GOLD} opacity={glow} filter="url(#g-lg)" />
		<rect x={x} y={bot - h} width={w} height={h} rx={4} fill={tone ?? 'url(#gold-v)'} />
		{!tone ? <rect x={x} y={bot - h} width={w} height={4} fill="#fff6dc" opacity={0.8} /> : null}
	</g>
);
const GoldDefs: React.FC = () => (
	<defs>
		<linearGradient id="gold-v" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#fff1c4" />
			<stop offset="0.25" stopColor="#f1c56d" />
			<stop offset="1" stopColor="#a8742a" />
		</linearGradient>
		<linearGradient id="red-v" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#ff8a8a" />
			<stop offset="0.3" stopColor="#e5484d" />
			<stop offset="1" stopColor="#8e1f22" />
		</linearGradient>
	</defs>
);

// ---------------------------------------------------------------- 6. town: the growth toy model (build)

/** population of the toy town after `y` years: 1,000 growing 10 % a year */
const popAt = (y: number) => 1000 * Math.pow(1.1, y);
/** years spent with first digit d in one cycle 1,000 → 10,000 */
const yearsAt = (d: number) => Math.log((d + 1) / d) / Math.log(1.1);
const CYCLE = Math.log(10) / Math.log(1.1); // 24.16

const TownSet: React.FC<{f: number; cam: {x: number; y: number; zoom: number}; houses: number; lamp: number}> = ({f, cam, houses, lamp}) => (
	<g>
		<Layer cam={cam} depth={0}>
			<rect x={-400} y={-400} width={2800} height={1900} fill="url(#sky-night)" />
			{Array.from({length: 120}, (_, i) => (
				<circle key={i} cx={random(`ts${i}`) * 1920} cy={random(`ty${i}`) * 560} r={0.8 + random(`tr${i}`) * 1.4} fill="#fff" opacity={(0.25 + 0.55 * random(`to${i}`)) * (0.8 + 0.2 * Math.sin(f / 11 + i))} />
			))}
			<circle cx={1560} cy={190} r={36} fill="#eef3fb" />
			<circle cx={1560} cy={190} r={200} fill="url(#glow-moon)" opacity={0.5} />
		</Layer>
		<Layer cam={cam} depth={0.4}>
			<path d="M-600,690 C-100,600 400,650 900,610 C1400,570 1900,640 2600,600 L2600,1400 L-600,1400 Z" fill="#121a2a" />
		</Layer>
		<Layer cam={cam} depth={0.75}>
			{/* houses fill the valley as the town grows; each pops up with a spring */}
			{Array.from({length: 90}, (_, i) => {
				if (i >= houses) return null;
				const born = i;
				const s = Math.min(1, Math.max(0, (houses - born) * 1.6));
				const row = Math.floor(i / 18);
				const x = -260 + ((i * 137) % 2380) + (row % 2) * 60;
				const y = 700 - row * 26;
				const w = 60 + random(`hw${i}`) * 50;
				const h = (50 + random(`hh${i}`) * 45) * s;
				const lit = random(`hl${i}`) > 0.3;
				return (
					<g key={i} opacity={1 - row * 0.12}>
						<rect x={x} y={y - h} width={w} height={h} fill="#1c2436" />
						<path d={`M${x - 6},${y - h} L${x + w / 2},${y - h - 30 * s} L${x + w + 6},${y - h} Z`} fill="#161d2c" />
						{lit ? <rect x={x + w * 0.3} y={y - h * 0.65} width={13} height={15 * s} fill={P.lamp} opacity={0.85 * lamp} /> : null}
						{lit ? <circle cx={x + w * 0.3 + 6} cy={y - h * 0.6} r={22} fill="url(#glow-lamp)" opacity={0.35 * lamp} /> : null}
					</g>
				);
			})}
		</Layer>
		<Layer cam={cam} depth={1}>
			<rect x={-600} y={760} width={3200} height={700} fill="#0e131e" />
			<path d="M-600,760 C200,752 1000,770 2600,756" stroke="#2a3346" strokeWidth={4} fill="none" />
		</Layer>
	</g>
);

/** the town's population sign (world coords, hero plane); `n` is shown with its first digit marked */
const Sign: React.FC<{x: number; y: number; n: number; flash: number}> = ({x, y, n, flash}) => {
	const s = fmt(n);
	return (
		<g transform={`translate(${x},${y})`}>
			<circle cx={-190} cy={-440} r={380} fill="url(#glow-lamp)" opacity={0.55} />
			<rect x={-196} y={-470} width={10} height={470} fill="#20242c" />
			<path d="M-191,-470 L-140,-470" stroke="#20242c" strokeWidth={8} />
			<path d="M-160,-470 L-120,-470 L-130,-450 L-150,-450 Z" fill="#2a2a2a" />
			<circle cx={-140} cy={-446} r={10} fill="#ffe2a0" filter="url(#g-sm)" />
			<rect x={-30} y={-210} width={14} height={210} fill="#3a2a1c" />
			<rect x={300} y={-210} width={14} height={210} fill="#3a2a1c" />
			<rect x={-80} y={-360} width={440} height={180} rx={8} fill="#e9dcc0" />
			<rect x={-70} y={-350} width={420} height={160} rx={6} fill="none" stroke="#5a3d1c" strokeWidth={3} />
			<text x={140} y={-312} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 700, fontSize: 30, fill: '#5a3d1c'}}>
				小镇 · 人口
			</text>
			<text x={140} y={-218} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 92, fill: '#2a1a0c', ...LN}}>
				<tspan fill={s[0] === '1' ? '#a8742a' : '#2a1a0c'}>{s[0]}</tspan>
				{s.slice(1)}
			</text>
			{flash > 0.02 ? <rect x={-80} y={-360} width={440} height={180} rx={8} fill={GOLD} opacity={0.5 * flash} /> : null}
		</g>
	);
};

const HIST = {x: 1180, bot: 900, w: 54, gap: 12, max: 220};

export const Town: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const end = scene.duration;
	const [c0, c1, c2, c3, c4] = [0, 1, 2, 3, 4].map((i) => cue(i));
	// time: slow and even through 1,xxx, fast-forward to 9,000, slow again so 9,xxx flashes by at the same speed
	const FPY = 19;
	const tA = c0 + 8;
	const tB = c1 + 40;
	const tC = c2 - 10;
	const yB = 7.6;
	const yC = 22.75;
	const years = (() => {
		if (f < tA) return 0;
		if (f < tB) return (f - tA) / FPY;
		if (f < tC) return yB + (yC - yB) * prog(f, tB, tC - tB, ease.inOut);
		if (f < c4) return Math.min(CYCLE + 6.5, yC + (f - tC) / FPY);
		return CYCLE + 6.5 > yC + (c4 - tC) / FPY ? yC + (c4 - tC) / FPY : CYCLE + 6.5;
	})();
	const pop = popAt(years);
	const ff = f >= tB && f < tC;
	const tenK = tC + Math.round((CYCLE - yC) * FPY);
	const cycleDone = years >= CYCLE;
	// the histogram: years spent at each first digit during the first full cycle
	const spent = (d: number) => {
		const y0 = Math.log(d) / Math.log(1.1);
		const y1 = Math.log(d + 1) / Math.log(1.1);
		return Math.max(0, Math.min(years, CYCLE, y1) - y0);
	};
	const cur = cycleDone ? 0 : firstDigit(pop);
	const houses = Math.min(90, 6 + Math.log(pop / 1000) / Math.log(1.6) * 12);
	const quiet = prog(f, c4 - 6, 24, ease.inOut);
	const keys: Key[] = [
		[0, 470, 580, 3.2],
		[c0 + 24, 1010, 600, 1.13],
		[c1, 1040, 604, 1.1],
		[tB, 1060, 610, 1.09],
		[tC, 1075, 615, 1.12],
		[c3, 1060, 606, 1.1],
		[c4 - 24, 1070, 612, 1.12],
		[c4 + 6, 1300, 720, 1.5],
		[end, 1420, 780, 2.0],
	];
	const cam = camPath(keys, f);
	const flash = hitAt(f, tenK, 6);
	return (
		<FullFrame fadeIn={0} fadeOut={0} motes={0.6}>
			<GoldDefs />
			<g transform={`translate(${6 * flash * (random(`tx${f}`) - 0.5)},${6 * flash * (random(`ty${f}`) - 0.5)})`}>
				<MotionBlur keys={keys} f={f} id="mb-town">
					<TownSet f={f} cam={cam} houses={houses} lamp={1 - 0.6 * quiet} />
					<g transform={camT(cam)}>
						<Sign x={420} y={760} n={pop} flash={flash} />
						{/* the year counter (rolls; it's a counter, not a label) */}
						<text x={430} y={320} style={{fontFamily: font.serif, fontWeight: 700, fontSize: 40, fill: color.text, ...LN}} opacity={prog(f, c0, 12) * (1 - quiet * 0.6)}>
							{`第 ${Math.floor(years)} 年`}
						</text>
						{ff ? (
							<text x={640} y={320} style={{fontFamily: font.latin, fontWeight: 700, fontSize: 40, fill: GOLD}} opacity={0.6 + 0.4 * Math.sin(f / 2)}>
								▶▶
							</text>
						) : null}
						{/* how long the sign stayed on each first digit */}
						<g opacity={prog(f, c0 + 20, 16)}>
							<text x={HIST.x} y={HIST.bot - HIST.max - 40} style={{fontFamily: font.serif, fontWeight: 700, fontSize: 26, fill: '#cfc8b8'}}>
								牌子停在每个首位数字上的年数
							</text>
							{Array.from({length: 9}, (_, k) => {
								const d = k + 1;
								const x = HIST.x + k * (HIST.w + HIST.gap);
								const h = (spent(d) / yearsAt(1)) * HIST.max;
								const active = d === cur;
								return (
									<g key={d}>
										<rect x={x} y={HIST.bot - HIST.max} width={HIST.w} height={HIST.max} fill="#f3ede2" opacity={0.04} />
										{h > 0 ? <rect x={x} y={HIST.bot - h} width={HIST.w} height={h} fill={active ? GOLD : '#d9cfb6'} opacity={active ? 1 : 0.75} /> : null}
										<text x={x + HIST.w / 2} y={HIST.bot + 34} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 30, fill: active ? GOLD : '#cfc8b8', ...LN}}>
											{d}
										</text>
										{spent(d) > 0.05 && (d === 1 || d === 9) ? (
											<text x={x + HIST.w / 2} y={HIST.bot - h - 10} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 24, fill: '#efe6d2', ...LN}}>
												{`${spent(d).toFixed(1)}年`}
											</text>
										) : null}
									</g>
								);
							})}
						</g>
					</g>
				</MotionBlur>
			</g>
			{/* the card from Benford's tray fills the frame for the first frames, then pulls back into the sign */}
			{f < 16 ? <rect width={W} height={H} fill="#efe6d2" opacity={1 - prog(f, 0, 16, ease.out)} /> : null}
			<rect width={W} height={H} fill="#000" opacity={0.35 * quiet} />
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 7. reveal: the staircase lands on the drop

/** the reveal's staircase, screen layout */
const STAIR = (d: number) => ({x: 960 + (d - 5) * 150 - 55, w: 110, bot: 800, h: (BENF[d] / 30.1) * 440});

export const Reveal: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const scene = useScene();
	const beats = useLocalBeats().filter((b) => b >= 0 && b < scene.duration);
	const [c0, c1, c2] = [0, 1, 2].map((i) => cue(i));
	const slam = (d: number) => spring({frame: f - (d - 1) * 1.2, fps, config: {damping: 11, stiffness: 220}});
	const labelAt = (d: number) => (d === 1 ? c0 : d === 9 ? c1 : (beats.find((b) => b > c0 + 6) ?? c0 + 15) + (d - 2) * 4);
	const shake = 14 * hitAt(f, 0, 3) + 5 * hitAt(f, c0, 3) + 5 * hitAt(f, c1, 3);
	const crane = prog(f, 0, 50, ease.out);
	const edgeIn = prog(f, c2 - 6, 30, ease.inOut);
	const lift = -120 * edgeIn;
	// after the slam the bars hold still (readable); the camera keeps pushing in
	const push = 1 + 0.07 * prog(f, 40, scene.duration - 40, ease.inOut);
	const drift = 26 * Math.sin(f / 70);
	return (
		<FullFrame fadeIn={0} fadeOut={0} motes={1.2}>
			<GoldDefs />
			<rect width={W} height={H} fill="#07060a" />
			<ellipse cx={960} cy={600} rx={1100} ry={520} fill="url(#glow-lamp)" opacity={0.35 + 0.25 * hitAt(f, 0, 10)} />
			<g transform={`translate(${shake * (random(`rx${f}`) - 0.5)},${shake * (random(`ry${f}`) - 0.5)}) translate(960,560) scale(${(1.18 - 0.18 * crane) * push}) translate(-960,-560) translate(${drift},${lift})`}>
				{/* the worn fore-edge slides in under the bars: the same curve */}
				{edgeIn > 0 ? (
					<g opacity={edgeIn} transform={`translate(${STAIR(1).x},${820 + 40 * (1 - edgeIn)}) scale(${(STAIR(9).x + STAIR(9).w - STAIR(1).x) / BOOK.w})`}>
						<EdgeMacro x={0} y={0} w={BOOK.w} h={BOOK.h * 0.7} id="reveal-edge" wear={1} tabs={1} />
					</g>
				) : null}
				{Array.from({length: 9}, (_, k) => {
					const d = k + 1;
					const s = STAIR(d);
					const q = slam(d);
					const hi = d === 1 || d === 9;
					return (
						<g key={d}>
							<GoldBar x={s.x} w={s.w} bot={s.bot} h={s.h * q} glow={hi ? 0.35 : 0.15} o={hi ? 1 : 0.85} />
							<text x={s.x + s.w / 2} y={s.bot + 54} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 48, fill: hi ? GOLD : color.text, ...LN}}>
								{d}
							</text>
							{f >= labelAt(d) ? (
								<text
									x={s.x + s.w / 2}
									y={s.bot - s.h - 20}
									textAnchor="middle"
									transform={`translate(${s.x + s.w / 2},${s.bot - s.h - 30}) scale(${1 + 0.5 * hitAt(f, labelAt(d), 3)}) translate(${-(s.x + s.w / 2)},${-(s.bot - s.h - 30)})`}
									style={{fontFamily: font.latin, fontWeight: 700, fontSize: hi ? 64 : 34, fill: hi ? GOLD : '#e8e2d4', ...LN}}
									filter={hi ? 'url(#g-sm)' : undefined}
								>
									{`${BENF[d]}%`}
								</text>
							) : null}
						</g>
					);
				})}
				{/* the law, written once and left still */}
				<text x={1290} y={390} textAnchor="middle" opacity={prog(f, c2 + 4, 16)} style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 66, fill: GOLD}}>
					{'P(d) = log₁₀(1 + 1/d)'}
				</text>
			</g>
			<rect width={W} height={H} fill="#fff4dc" opacity={0.35 * hitAt(f, 0, 3)} />
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 8. cheques: Arizona, 1993

const NELSON: Look = {skin: P.skin2, hair: 'short', hairColor: P.hairBrown, outfit: 'suit', top: '#3d4a5e', bottom: '#2a2f3a', accent: '#8a2c2c'};
const AMOUNTS = ['87,148.21', '93,520.06', '79,306.44', '96,044.10', '88,912.75', '74,385.02', '91,207.33', '98,650.00', '83,761.19', '77,049.68', '95,318.40', '89,904.12'];
/** schematic deviation from Benford by country (Rauch et al. 2011 found Greece furthest); 示意 */
const EU = [
	['希腊', 1.0],
	['罗马尼亚', 0.72],
	['拉脱维亚', 0.66],
	['比利时', 0.6],
	['德国', 0.26],
	['法国', 0.22],
	['意大利', 0.18],
	['葡萄牙', 0.15],
] as [string, number][];

const Office1993: React.FC<{f: number; cam: {x: number; y: number; zoom: number}; person?: React.ReactNode; desk?: React.ReactNode; screen?: React.ReactNode}> = ({f, cam, person, desk, screen}) => (
	<g>
		<Layer cam={cam} depth={0.5}>
			<rect x={-800} y={-400} width={3600} height={2000} fill="#211c18" />
			{/* window with blinds onto the desert at dusk */}
			<g transform="translate(1180,90)">
				<rect width={620} height={460} fill="#e08a4a" />
				<rect y={250} width={620} height={210} fill="#a85a3a" />
				<circle cx={200} cy={270} r={60} fill="#ffd28a" />
				<path d="M0,340 L90,290 L170,330 L290,260 L420,320 L620,280 L620,460 L0,460 Z" fill="#6a3a2a" />
				<g fill="#3a2a1e">
					<rect x={470} y={210} width={14} height={140} />
					<rect x={450} y={260} width={30} height={10} />
					<rect x={480} y={240} width={24} height={10} />
				</g>
				{Array.from({length: 13}, (_, i) => (
					<rect key={i} x={0} y={i * 36} width={620} height={14} fill="#3a3530" opacity={0.75} />
				))}
				<rect x={-14} y={-14} width={648} height={488} fill="none" stroke="#3a3530" strokeWidth={28} />
				<rect x={-200} y={0} width={1000} height={900} fill="url(#glow-lamp)" opacity={0.25} />
			</g>
			{/* filing cabinets */}
			{[0, 1, 2].map((i) => (
				<g key={i} transform={`translate(${-200 + i * 180},280)`}>
					<rect width={160} height={480} fill="#4a4a46" />
					{[0, 1, 2, 3].map((k) => (
						<rect key={k} x={14} y={20 + k * 115} width={132} height={100} fill="none" stroke="#2a2a28" strokeWidth={4} />
					))}
				</g>
			))}
		</Layer>
		{person}
		<Layer cam={cam} depth={1}>
			<rect x={-800} y={760} width={3600} height={40} fill="#5a4a3e" />
			<rect x={-800} y={800} width={3600} height={600} fill="#3a2f28" />
			{/* the CRT the auditor will use */}
			<g transform="translate(1120,760)">
				<rect x={-190} y={-310} width={380} height={290} rx={18} fill="#c9c2b2" />
				<rect x={-160} y={-284} width={320} height={232} fill="#0c1a12" />
				<g transform="translate(-160,-284)">{screen}</g>
				<rect x={-160} y={-284} width={320} height={232} fill="#7dffb0" opacity={0.04 + 0.01 * Math.sin(f / 3)} />
				<rect x={-70} y={-20} width={140} height={20} fill="#b8b0a0" />
			</g>
			{desk}
		</Layer>
	</g>
);

export const Cheques: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const scene = useScene();
	const beats = useLocalBeats().filter((b) => b >= 0 && b < scene.duration);
	const end = scene.duration;
	const [c0, c1, c2, c3, c4] = [0, 1, 2, 3, 4].map((i) => cue(i));
	// the staircase shrinks onto the CRT: we start inside the screen and pull back into the office
	const keys: Key[] = [
		[0, 1120, 640, 5.6],
		[c0, 1060, 600, 1.3],
		[c1 - 6, 980, 600, 1.15],
		[c1 + 20, 760, 700, 1.8],
		[c2 - 6, 780, 690, 1.7],
		[c2 + 24, 1120, 620, 2.6],
		[c4 - 6, 1120, 616, 2.6],
		[c4 + 30, 1120, 612, 2.75],
		[end, 1120, 610, 2.85],
	];
	const cam = camPath(keys, f);
	// cheques come out on the printer's own clock (a machine, not the music): steady feed, a slightly longer pause now and then
	const printBeats: number[] = [];
	for (let t = c0 + 8, i = 0; t < c2 - 4; i++) {
		printBeats.push(Math.round(t));
		t += 17 + (i % 4 === 3 ? 9 : 0) + 3 * (random(`pf${i}`) - 0.5);
	}
	const printed = printBeats.filter((b) => f >= b).length;
	const tear = (i: number) => prog(f, printBeats[i] ?? 1e9, 10, ease.out);
	// at c2 the printed cheques' first digits fly onto the CRT chart
	const red = (d: number) => (d >= 7 ? [0, 0, 0, 0, 0, 0, 0, 0.62, 1, 0.86][d] : 0);
	const fill = prog(f, c2 + 6, 40, ease.out);
	const stamp = spring({frame: f - c3 - 2, fps, config: {damping: 10, stiffness: 200}});
	const eu = prog(f, c4 + 6, 30, ease.out);
	const screen = (
		<g>
			{f < c4 ? (
				<g>
					{/* Benford's staircase (gold outline) and the cheques (red) */}
					{Array.from({length: 9}, (_, k) => {
						const d = k + 1;
						const x = 22 + k * 32;
						const h = (BENF[d] / 30.1) * 150;
						return (
							<g key={d}>
								<rect x={x} y={200 - h} width={24} height={h} fill="none" stroke={GOLD} strokeWidth={2} strokeDasharray="5 4" />
								{red(d) > 0 ? <rect x={x + 3} y={200 - 165 * red(d) * fill} width={18} height={165 * red(d) * fill} fill="url(#red-v)" /> : null}
								<text x={x + 12} y={222} textAnchor="middle" style={{fontFamily: 'monospace', fontSize: 14, fill: d >= 7 && fill > 0 ? '#ff8a8a' : '#7dffb0', ...LN}}>
									{d}
								</text>
							</g>
						);
					})}
					{stamp > 0.02 ? (
						<g transform={`translate(160,90) rotate(-10) scale(${2 - stamp})`} opacity={Math.min(1, stamp * 1.4)}>
							<rect x={-110} y={-30} width={220} height={60} rx={6} fill="none" stroke="#ff5a5a" strokeWidth={5} />
							<text y={11} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 30, fill: '#ff5a5a'}}>
								不符合规律
							</text>
						</g>
					) : null}
				</g>
			) : (
				<g opacity={eu}>
					<text x={14} y={26} style={{fontFamily: 'monospace', fontSize: 13, fill: '#7dffb0'}}>
						EU DATA vs BENFORD (示意)
					</text>
					{EU.map(([n, v], i) => (
						<g key={n}>
							<text x={86} y={52 + i * 22} textAnchor="end" style={{fontFamily: font.sans, fontSize: 14, fill: i === 0 ? '#ff8a8a' : '#cfe8d8'}}>
								{n}
							</text>
							<rect x={94} y={41 + i * 22} width={200 * v * eu} height={14} fill={i === 0 ? '#e5484d' : '#3f8a5f'} />
						</g>
					))}
				</g>
			)}
		</g>
	);
	const printerX = 560;
	return (
		<FullFrame fadeIn={0} fadeOut={0} motes={0.6}>
			<GoldDefs />
			<MotionBlur keys={keys} f={f} id="mb-cheq">
				<Office1993
					f={f}
					cam={cam}
					screen={screen}
					person={
						<Layer cam={cam} depth={1}>
							{/* nobody in shot: his empty swivel chair, still turning a little, says someone just left (explainer-video §2) */}
							<g transform={`translate(330,760) rotate(${2.5 * Math.sin(f / 40) * Math.exp(-f / 240)},0,0)`}>
								<rect x={-70} y={-170} width={140} height={150} rx={30} fill="#2a3346" />
								<rect x={-56} y={-156} width={112} height={122} rx={22} fill="#343f56" />
								<rect x={-8} y={-22} width={16} height={30} fill="#1a1f2a" />
							</g>
						</Layer>
					}
					desk={
						<g>
							{/* dot-matrix printer feeding cheques */}
							<g transform={`translate(${printerX},760)`}>
								<rect x={-140} y={-80} width={280} height={80} rx={8} fill="#cfc8b8" />
								<rect x={-120} y={-92} width={240} height={14} fill="#8a8478" />
								<rect x={-110} y={-60} width={60} height={8} fill="#3a3a3a" />
								<circle cx={100} cy={-40} r={6} fill={f % 8 < 4 && f < c2 ? '#7dffb0' : '#2a4a32'} />
							</g>
							{Array.from({length: Math.min(printed + 1, printBeats.length)}, (_, i) => {
								const b = printBeats[i];
								const t = f >= b ? tear(i) : prog(f, b - 14, 14, (x) => x) * 0.5;
								const onPile = i < printed;
								const amt = AMOUNTS[i % AMOUNTS.length];
								const px = onPile ? 820 + (i % 4) * 8 : printerX;
								const py = onPile ? 750 - i * 3 : 690 - 70 * t;
								const rot = onPile ? (random(`ch${i}`) - 0.5) * 10 : 0;
								return (
									<g key={i} transform={`translate(${onPile ? px : printerX},${py}) rotate(${rot})`} opacity={onPile && f > c2 + 10 ? 1 - fill : 1}>
										<rect x={-110} y={-40} width={220} height={80} rx={3} fill="#dfe6d8" stroke="#7a8a72" strokeWidth={1.5} />
										<text x={-96} y={-18} style={{fontFamily: font.latin, fontWeight: 700, fontSize: 11, letterSpacing: '0.16em', fill: '#4a5a44'}}>
											PAY TO THE ORDER OF
										</text>
										<text x={-96} y={24} style={{fontFamily: 'monospace', fontWeight: 700, fontSize: 24, fill: '#22301e', ...LN}}>
											$<tspan fill="#c42a2a">{amt[0]}</tspan>
											{amt.slice(1)}
										</text>
										{onPile ? <circle cx={-71} cy={16} r={14} fill="none" stroke="#e5484d" strokeWidth={3} opacity={prog(f, c2 - 30 + i * 2, 6)} /> : null}
									</g>
								);
							})}
							{/* their first digits leap to the screen */}
							{f >= c2 && f < c2 + 40
								? Array.from({length: 23}, (_, i) => {
										const t = prog(f, c2 + i * 1.2, 16, ease.inOut);
										if (t <= 0 || t >= 1) return null;
										const d = [8, 9, 7, 9, 8, 9, 7, 8, 9, 9, 8, 7, 9, 8, 8, 9, 9, 7, 8, 9, 3, 9, 8][i];
										const x = 820 + (1120 - 160 + 22 + (d - 1) * 32 + 12 - 820) * t;
										const y = 740 - 180 * Math.sin(t * Math.PI) + (760 - 284 + 120 - 740) * t;
										return (
											<text key={i} x={x} y={y} textAnchor="middle" style={{fontFamily: 'monospace', fontWeight: 700, fontSize: 30 - 16 * t, fill: '#ff6a6a', ...LN}}>
												{d}
											</text>
										);
									})
								: null}
						</g>
					}
				/>
			</MotionBlur>
			<rect width={W} height={H} fill="#ff5a5a" opacity={0.18 * hitAt(f, c3 + 2, 4)} />
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 9. city: numbers everywhere; what doesn't count; three takeaways

const SIGNS: [string, number, number, number][] = [
	['128.6', 300, 330, 0],
	['¥19.9', 1300, 420, 1],
	['1,024 MB', 760, 260, 2],
	['6,380 km', 1560, 220, 3],
	['3,712', 520, 520, 0],
	['1,580', 1100, 200, 1],
	['17.4', 1720, 470, 2],
	['245', 180, 200, 3],
	['1,199', 960, 470, 0],
	['82,600', 1450, 300, 1],
];

const CityWorld: React.FC<{f: number; cam: {x: number; y: number; zoom: number}; glowFirst: number}> = ({f, cam, glowFirst}) => (
	<g>
		<Layer cam={cam} depth={0}>
			<rect x={-400} y={-400} width={2800} height={1900} fill="url(#sky-night)" />
		</Layer>
		<Layer cam={cam} depth={0.4}>
			{Array.from({length: 26}, (_, i) => {
				const x = -300 + i * 100;
				const h = 300 + random(`fb${i}`) * 380;
				return <rect key={i} x={x} y={900 - h} width={92} height={h} fill="#10162a" />;
			})}
		</Layer>
		<Layer cam={cam} depth={0.7}>
			{Array.from({length: 18}, (_, i) => {
				const x = -260 + i * 135;
				const h = 260 + random(`cb${i}`) * 440;
				return (
					<g key={i}>
						<rect x={x} y={900 - h} width={124} height={h} fill={i % 2 ? '#141a2c' : '#182034'} />
						{Array.from({length: Math.floor(h / 40)}, (_, k) =>
							[0, 1, 2].map((c) => (
								<rect key={`${k}${c}`} x={x + 14 + c * 36} y={920 - h + k * 38} width={20} height={20} fill={P.lamp} opacity={random(`cw${i}${k}${c}`) > 0.62 ? 0.65 : 0.06} />
							)),
						)}
					</g>
				);
			})}
		</Layer>
		<Layer cam={cam} depth={1}>
			{/* a street-level stock ticker */}
			<rect x={-400} y={772} width={2800} height={64} fill="#0a0d16" />
			<g transform={`translate(${-((f * 6) % 600)},0)`}>
				{Array.from({length: 12}, (_, i) => (
					<text key={i} x={-300 + i * 300} y={816} style={{fontFamily: 'monospace', fontWeight: 700, fontSize: 34, fill: '#7dffb0', ...LN}}>
						<tspan fill={glowFirst > 0.5 ? GOLD : '#7dffb0'}>1</tspan>
						{['28.6 ▲', '9.02 ▼', '4.55 ▲', '1.3 ▲', '76.0 ▼', '02.4 ▲'][i % 6]}
					</text>
				))}
			</g>
			{/* signs, price tags, distances: numbers everywhere */}
			{SIGNS.map(([t, x, y, k], i) => (
				<g key={i} transform={`translate(${x},${y})`}>
					<rect x={-14} y={-56} width={t.length * 30 + 28} height={76} rx={8} fill="#0b0f18" opacity={0.9} stroke="#3a4566" />
					<text x={0} y={0} style={{fontFamily: font.latin, fontWeight: 700, fontSize: 54, fill: color.text, ...LN}}>
						<tspan fill={glowFirst > (k + 1) / 5 && /[1-9]/.test(t[0] === '¥' ? t[1] : t[0]) ? GOLD : color.text}>{t[0]}</tspan>
						{t.slice(1)}
					</text>
				</g>
			))}
		</Layer>
	</g>
);

const TAKE = [
	['①', '数字要跨越好几个量级', '1 · 10 · 100 · 1,000 · 10,000'],
	['②', '人编的数，往往太平均', '真实的数据，才有这条阶梯'],
	['③', '1开头最多，是增长的形状', '翻倍的路，1 走得最久'],
];

export const City: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const cue = useCue();
	const scene = useScene();
	const end = scene.duration;
	const [c0, c1, c2, c3, c4, c5] = [0, 1, 2, 3, 4, 5].map((i) => cue(i));
	// out through the office window into tonight's city
	const keys: Key[] = [
		[0, 960, 420, 2.6],
		[c0 + 20, 960, 520, 1.1],
		[c1 - 8, 1000, 540, 1.0],
		[c1 + 30, 960, 600, 1.08],
		[c2, 960, 600, 1.08],
		[c3 - 10, 960, 560, 1.15],
		[end, 960, 520, 1.3],
	];
	const cam = camPath(keys, f);
	const glow = prog(f, c0 + 10, 50, (x) => x) * 5;
	// the first digits pour into the nine tubes (the hook's tubes, again)
	const tubes = prog(f, c1 - 4, 20, ease.out) * (1 - prog(f, c3 - 12, 14, ease.in));
	const pourT = prog(f, c1, 70, ease.out);
	// counter-examples: heights all start with 1 (narrow range), lottery and phone numbers come out flat
	const counter = prog(f, c2, 16, ease.out) * (1 - prog(f, c3 - 12, 14, ease.in));
	const take = (i: number) => prog(f, [c3, c4, c5][i], 14, ease.out);
	const dim = prog(f, c3 - 10, 20, ease.inOut) * 0.75;
	const TX = (d: number) => 960 + (d - 5) * 104;
	const level = (d: number, kind: 'benford' | 'height' | 'lotto') => (kind === 'benford' ? BENF[d] / 30.1 : kind === 'height' ? (d === 1 ? 1 : 0) : 0.36);
	const kind: 'benford' | 'height' | 'lotto' = f < c2 ? 'benford' : f < c2 + (c3 - c2) / 2 ? 'height' : 'lotto';
	const morph = f < c2 ? pourT : prog(f, kind === 'height' ? c2 : c2 + (c3 - c2) / 2, 14, ease.out);
	return (
		<FullFrame fadeIn={0} fadeOut={0} motes={0.6}>
			<GoldDefs />
			<MotionBlur keys={keys} f={f} id="mb-city">
				<CityWorld f={f} cam={cam} glowFirst={glow} />
			</MotionBlur>
			{/* the office window frame we pull back through */}
			{f < c0 + 24 ? <rect x={0} y={0} width={W} height={H} fill="none" stroke="#3a3530" strokeWidth={600 * (1 - prog(f, 0, c0 + 24, ease.in))} opacity={1 - prog(f, c0, 24)} /> : null}
			<rect width={W} height={H} fill="#05060b" opacity={dim} />
			{/* tubes */}
			{tubes > 0.01 ? (
				<g opacity={tubes} transform={`translate(0,${(1 - tubes) * 200})`}>
					<rect x={TX(1) - 70} y={560} width={TX(9) - TX(1) + 140} height={360} rx={18} fill="#05060b" opacity={0.6} />
					{Array.from({length: 9}, (_, k) => {
						const d = k + 1;
						const prev = kind === 'benford' ? 0 : kind === 'height' ? BENF[d] / 30.1 : level(d, 'height');
						const lv = (prev + (level(d, kind) - prev) * morph) * 280;
						const isRed = kind !== 'benford';
						return (
							<g key={d}>
								<rect x={TX(d) - 34} y={600} width={68} height={290} rx={10} fill="#f3ede2" opacity={0.05} stroke="#f3ede2" strokeOpacity={0.35} strokeWidth={2} />
								{lv > 0.5 ? <rect x={TX(d) - 30} y={886 - lv} width={60} height={lv} rx={6} fill={isRed ? '#d9cfb6' : 'url(#gold-v)'} /> : null}
								<text x={TX(d)} y={918} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 30, fill: d === 1 && !isRed ? GOLD : '#cfc8b8', ...LN}}>
									{d}
								</text>
							</g>
						);
					})}
					{counter > 0.02 ? (
						<g opacity={counter}>
							<text x={960} y={590} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 700, fontSize: 30, fill: '#cfc8b8'}}>
								{kind === 'height' ? '身高：1.62 · 1.75 · 1.81 · 1.68 …（全在1米几）' : '彩票、电话号码：号码是分配的，各位一样多'}
							</text>
							<line x1={TX(1) - 60} y1={700} x2={TX(9) + 60} y2={860} stroke="#e5484d" strokeWidth={8} strokeLinecap="round" opacity={0.85 * prog(f, kind === 'height' ? c2 + 24 : c2 + (c3 - c2) / 2 + 20, 8)} />
						</g>
					) : null}
				</g>
			) : null}
			{/* three takeaways, each lands and stays */}
			{TAKE.map(([n, t, sub], i) =>
				take(i) > 0 ? (
					<g key={n} opacity={take(i)} transform={`translate(0,${(1 - take(i)) * 30})`}>
						<text x={430} y={300 + i * 190} style={{fontFamily: font.serif, fontWeight: 900, fontSize: 92, fill: i === 2 ? GOLD : color.text}}>
							{n}
						</text>
						<text x={560} y={290 + i * 190} style={{fontFamily: font.serif, fontWeight: 700, fontSize: 56, fill: color.text}}>
							{t}
						</text>
						<text x={562} y={340 + i * 190} style={{fontFamily: font.sans, fontSize: 26, fill: '#9a9488', letterSpacing: '0.06em', ...LN}}>
							{sub}
						</text>
					</g>
				) : null,
			)}
		</FullFrame>
	);
};

// ---------------------------------------------------------------- 10. coda: back to the book; the end card

const BRAND: BrandCfg = {videos: []};

export const Coda: React.FC<SceneProps> = () => {
	const f = useCurrentFrame();
	const cue = useCue();
	const scene = useScene();
	const end = scene.duration;
	const [c0, c1, c2] = [0, 1, 2].map((i) => cue(i));
	const endAt = end - 180;
	const keys: Key[] = [
		[0, 960, 540, 1.0],
		[c0 + 30, 1000, 620, 1.35],
		[c1 + 40, 1120, 700, 2.4],
		[c2, 1155, 727, 3.6],
		[endAt, 1155, 727, 4.545],
	];
	const cam = camPath(keys, f);
	const dawn = prog(f, 0, end, (x) => x);
	const bloom = 1 - prog(f, 0, 30, ease.out); // city bokeh dissolving into the lamp
	const rise = prog(f, c2 + 20, endAt - c2 - 20, ease.inOut); // the edge's wear lifts into nine gold bars
	return (
		<FullFrame
			fadeIn={0}
			fadeOut={0}
			motes={1}
			overlay={
				<Sequence from={endAt} durationInFrames={end - endAt} layout="none">
					<EndCard v={EPISODE} cfg={BRAND} dur={end - endAt} />
				</Sequence>
			}
		>
			<MotionBlur keys={keys} f={f} id="mb-coda">
				<Study1881
					f={f + 2000}
					cam={cam}
					desk={
						<>
							<rect x={-300} y={760} width={2520} height={40} fill="#4a2e1a" />
							<rect x={-300} y={760} width={2520} height={6} fill="#7a5232" />
							<rect x={-300} y={800} width={2520} height={600} fill="#2c1a0e" />
							<BookFront id="cbook" wear={1} />
							{/* the wear rises off the edge as nine gold bars */}
							{rise > 0
								? Array.from({length: 9}, (_, k) => {
										const d = k + 1;
										const x = BOOK.x + (k / 9) * BOOK.w + 4;
										const w = BOOK.w / 9 - 8;
										const h = (BENF[d] / 30.1) * 60 * rise;
										return <rect key={d} x={x} y={BOOK.y - 6 - h} width={w} height={h} fill={GOLD} opacity={0.4 + 0.6 * (BENF[d] / 30.1)} filter="url(#g-sm)" />;
									})
								: null}
							<g transform="translate(1460,760)">
								<OilLamp f={f} glow={1 - 0.5 * dawn} />
							</g>
						</>
					}
				/>
			</MotionBlur>
			{/* dawn light through the window */}
			<rect width={W} height={H} fill="#ffcf9a" opacity={0.08 * dawn} />
			<Snow f={f * 0.5} n={40} seed="coda" size={0.8} speed={0.4} o={0.3} />
			<rect width={W} height={H} fill="#05060b" opacity={0.72 * prog(f, endAt - 10, 30, ease.inOut)} />
			{bloom > 0 ? (
				<g opacity={bloom}>
					{Array.from({length: 40}, (_, i) => (
						<circle key={i} cx={random(`bk${i}`) * W} cy={random(`bky${i}`) * H} r={20 + random(`bkr${i}`) * 50} fill={P.lamp} opacity={0.18} filter="url(#g-md)" />
					))}
				</g>
			) : null}
		</FullFrame>
	);
};
