import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import {Sub, lineAt} from '../kf/common';
import lines from '../kf/data/ep26.json';

/* ep26 storyboard, 2D half: documentary motion graphics in the same world as the 3D shots —
   near-black warm ground, one key-light glow on the hero, engraved paper, gold hairlines, amber data lines. */
const W = 1920, H = 1080;
const SANS = '"Noto Sans CJK SC", sans-serif';
const MONO = '"DejaVu Sans Mono", monospace';
const GOLD = '#f1c56d', AMBER = '#ffb347', RED = '#e8574a', PAPER = '#ece2c8', INK = '#4a3420', INKG = '#1f4a3c', CREAM = '#efe6d2';
const tx = (size: number, weight = 900) => ({fontFamily: SANS, fontSize: size, fontWeight: weight, fontVariantNumeric: 'lining-nums' as const});
const rnd = (s: number) => () => ((s = (s * 16807) % 2147483647) / 2147483647);

/** the shared ground: warm near-black, one soft key-light pool at (kx, ky), vignette, grain */
const Ground: React.FC<{kx?: number; ky?: number; kr?: number; warm?: number}> = ({kx = 960, ky = 460, kr = 900, warm = 1}) => (
	<g>
		<defs>
			<radialGradient id="g-key" cx={kx} cy={ky} r={kr} gradientUnits="userSpaceOnUse">
				<stop offset="0" stopColor="#3a2a17" stopOpacity={0.95 * warm} />
				<stop offset="0.45" stopColor="#1a130c" stopOpacity={0.9} />
				<stop offset="1" stopColor="#060504" />
			</radialGradient>
			<filter id="g-grain" x="0" y="0" width="100%" height="100%">
				<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
				<feColorMatrix values="0 0 0 0 1  0 0 0 0 0.95  0 0 0 0 0.85  0 0 0 0.06 0" />
			</filter>
			<filter id="g-glow" x="-20%" y="-20%" width="140%" height="140%">
				<feGaussianBlur stdDeviation="5" result="b" />
				<feMerge>
					<feMergeNode in="b" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
			<filter id="g-soft" x="-30%" y="-30%" width="160%" height="160%">
				<feGaussianBlur stdDeviation="18" />
			</filter>
		</defs>
		<rect width={W} height={H} fill="url(#g-key)" />
	</g>
);
const Grain = () => <rect width={W} height={H} filter="url(#g-grain)" />;

/* engraved paper pieces (same language as the 3D notes) */
const Guilloche: React.FC<{cx: number; cy: number; R: number; r: number; d: number; col?: string; o?: number; n?: number}> = ({cx, cy, R, r, d, col = INK, o = 0.5, n = 1600}) => {
	const k = (R - r) / r;
	const pts: string[] = [];
	for (let i = 0; i <= n; i++) {
		const a = (i / n) * Math.PI * 2 * r;
		pts.push(`${(cx + (R - r) * Math.cos(a) + d * Math.cos(k * a)).toFixed(1)},${(cy + (R - r) * Math.sin(a) - d * Math.sin(k * a)).toFixed(1)}`);
	}
	return <polyline points={pts.join(' ')} fill="none" stroke={col} strokeWidth={1} opacity={o} />;
};
const Rosette: React.FC<{cx: number; cy: number; s?: number; col?: string}> = ({cx, cy, s = 1, col = INK}) => (
	<g>{[0, 1, 2, 3].map((i) => <Guilloche key={i} cx={cx} cy={cy} R={(110 - i * 14) * s} r={(17 + i) * s} d={(58 - i * 8) * s} col={col} o={0.5 - i * 0.07} />)}</g>
);
const Paper: React.FC<{x: number; y: number; w: number; h: number; rot?: number; col?: string; children?: React.ReactNode; lit?: number}> = ({x, y, w, h, rot = 0, col = INK, children, lit = 1}) => (
	<g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
		<rect x={x + 16} y={y + 22} width={w} height={h} fill="#000" opacity={0.55} filter="url(#g-soft)" />
		<rect x={x} y={y} width={w} height={h} fill={PAPER} />
		<g opacity={0.3}>{Array.from({length: Math.floor(h / 14)}, (_, k) => <path key={k} d={`M${x},${y + 8 + k * 14} ${Array.from({length: Math.ceil(w / 30) + 1}, (_, i) => `L${x + i * 30},${y + 8 + k * 14 + Math.sin(i * 0.5 + k * 0.4) * 4}`).join(' ')}`} fill="none" stroke={col} strokeWidth={0.8} />)}</g>
		<rect x={x + 14} y={y + 14} width={w - 28} height={h - 28} fill="none" stroke={col} strokeWidth={4} />
		<rect x={x + 22} y={y + 22} width={w - 44} height={h - 44} fill="none" stroke={col} strokeWidth={1} />
		{children}
		{/* light falloff across the paper: lit from the upper left */}
		<rect x={x} y={y} width={w} height={h} fill="url(#paper-shade)" />
		<defs>
			<linearGradient id="paper-shade" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stopColor="#fff6dc" stopOpacity={0.12 * lit} />
				<stop offset="0.6" stopColor="#000" stopOpacity={0.05} />
				<stop offset="1" stopColor="#000" stopOpacity={0.4} />
			</linearGradient>
		</defs>
	</g>
);
const Hair: React.FC<{x1: number; x2: number; y: number; o?: number}> = ({x1, x2, y, o = 0.7}) => <line x1={x1} x2={x2} y1={y} y2={y} stroke={GOLD} strokeOpacity={o} strokeWidth={1.5} />;
const Tagline: React.FC<{x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end'; size?: number; col?: string}> = ({x, y, text, anchor = 'start', size = 26, col = '#d9cfb8'}) => (
	<text x={x} y={y} textAnchor={anchor} style={tx(size, 500)} fill={col} letterSpacing="0.15em">{text}</text>
);
const Note: React.FC<{sc: string; t: number; note: string; kind: '2D' | '3D'}> = ({sc, t, note, kind}) => (
	<g>
		<rect x={30} y={26} width={Math.min(1300, 120 + [...note].length * 23)} height={84} rx={10} fill="#000" opacity={0.5} />
		<rect x={44} y={40} width={60} height={30} rx={6} fill={kind === '3D' ? '#5a7cff' : GOLD} />
		<text x={74} y={63} textAnchor="middle" style={tx(20, 900)} fill="#111">{kind}</text>
		<text x={118} y={64} style={tx(26, 700)} fill="#ffd36e">{sc} · {t.toFixed(1)}s</text>
		<text x={52} y={98} style={tx(21, 400)} fill="#e8e4da">{note}</text>
	</g>
);

/* ---------- frames ---------- */
const Hall = () => {
	const x0 = 220, x1 = 1700, yb = 690, xNews = 640, xPay = 1420;
	const spend = (x: number) => (x < xNews ? 0 : Math.min(1, (x - xNews) / 60));
	const pts = Array.from({length: 150}, (_, i) => { const x = x0 + (i * (x1 - x0)) / 149; return `${x},${yb - 120 - spend(x) * 230}`; }).join(' ');
	return (
		<g>
			<Ground kx={700} ky={420} kr={1000} />
			<Hair x1={x0} x2={x1} y={yb} o={0.5} />
			{[[xNews, '收到加薪的消息', '今天'], [xPay, '钱真正到账', '明年']].map(([x, a, b]) => (
				<g key={a as string}>
					<line x1={x as number} x2={x as number} y1={yb + 10} y2={260} stroke={GOLD} strokeOpacity={0.35} strokeDasharray="4 8" />
					<circle cx={x as number} cy={yb} r={9} fill={GOLD} />
					<text x={x as number} y={yb + 62} textAnchor="middle" style={tx(40)} fill={CREAM}>{b as string}</text>
					<text x={x as number} y={yb + 108} textAnchor="middle" style={tx(28, 500)} fill="#bdb29a">{a as string}</text>
				</g>
			))}
			<polyline points={pts} fill="none" stroke={AMBER} strokeWidth={6} filter="url(#g-glow)" />
			<text x={x0} y={yb - 140} style={tx(30, 700)} fill={AMBER}>你的消费</text>
			<text x={xNews + 40} y={yb - 380} style={tx(64)} fill={GOLD}>这一天，就变了</text>
			<text x={xPay} y={yb - 380} textAnchor="middle" style={tx(40, 700)} fill="#8f8674">这一天：不变</text>
			<Tagline x={1700} y={200} text="霍尔 · 1978" anchor="end" />
			<Grain />
		</g>
	);
};

const fieldDots = (n: number, seed: number) => {
	const r = rnd(seed);
	return Array.from({length: n}, () => {
		// a perspective plane of lights: rows get closer together toward the horizon
		const z = Math.pow(r(), 1.6);
		const x = (r() - 0.5) * (1 + (1 - z) * 2.8) * 2400 + 960;
		const y = 380 + (1 - z) * 640;
		return {x, y, s: 1 + (1 - z) * 4.5, b: r()};
	});
};
const Field: React.FC<{all?: boolean}> = ({all}) => {
	const dots = fieldDots(5200, 21);
	return (
		<g>
			<Ground kx={960} ky={300} kr={1300} warm={0.6} />
			<rect y={0} width={W} height={520} fill="url(#sky-f)" />
			<defs>
				<linearGradient id="sky-f" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#060504" stopOpacity={0.9} />
					<stop offset="0.75" stopColor="#3a2814" stopOpacity={0.35} />
					<stop offset="1" stopColor="#3a2814" stopOpacity={0} />
				</linearGradient>
			</defs>
			{dots.map((d, i) => {
				const lit = all ? d.b > 0.05 : d.b > 0.965;
				return <circle key={i} cx={d.x} cy={d.y} r={d.s * (lit ? 1.4 : 0.8)} fill={lit ? '#ffd27a' : '#6b5a44'} opacity={lit ? 0.95 : 0.55} filter={lit && d.s > 3.5 ? 'url(#g-glow)' : undefined} />;
			})}
			<Grain />
		</g>
	);
};

const Spain7 = () => {
	const x0 = 860, x1 = 1760, yb = 800, top = 260;
	const v = [0.42, 0.45, 0.43, 0.5, 0.56, 0.53, 0.62, 0.7, 0.74, 0.82, 0.9, 0.97, 1.02];
	const px = (i: number) => x0 + (i * (x1 - x0)) / (v.length - 1);
	const py = (y: number) => yb - y * (yb - top) * 0.85;
	return (
		<g>
			<Ground kx={520} ky={460} kr={900} />
			<Paper x={150} y={300} w={560} h={360} rot={-4}>
				<Rosette cx={270} cy={480} s={0.9} />
				<text x={480} y={420} textAnchor="middle" style={tx(34, 700)} fill={INK} letterSpacing="0.3em">借 条</text>
				<text x={480} y={510} textAnchor="middle" style={tx(66)} fill={INK}>西班牙</text>
				<text x={480} y={570} textAnchor="middle" style={tx(26, 500)} fill={INK}>借期：10年</text>
			</Paper>
			<Hair x1={x0} x2={x1} y={yb} o={0.4} />
			<line x1={x0} x2={x1} y1={py(0.95)} y2={py(0.95)} stroke={RED} strokeWidth={2} strokeDasharray="10 8" />
			<text x={x1 - 60} y={py(0.95) - 40} textAnchor="end" style={tx(72)} fill={RED} filter="url(#g-glow)">7%</text>
			<polyline points={v.map((y, i) => `${px(i)},${py(y)}`).join(' ')} fill="none" stroke={AMBER} strokeWidth={6} filter="url(#g-glow)" />
			<circle cx={px(12)} cy={py(1.02)} r={12} fill={RED} filter="url(#g-glow)" />
			<Tagline x={x0} y={yb + 50} text="借给它的利息 · 2012年夏（示意，只标真实的7%）" size={22} />
			<Grain />
		</g>
	);
};

const Infinity8 = () => (
	<g>
		<Ground kx={960} ky={470} kr={800} />
		<Paper x={460} y={210} w={1000} h={520} lit={1.2} col={INKG}>
			<Rosette cx={620} cy={470} s={1.1} col={INKG} />
			<Rosette cx={1300} cy={470} s={1.1} col={INKG} />
			<text x={960} y={370} textAnchor="middle" style={tx(32, 700)} fill={INKG} letterSpacing="0.4em">借 多 少</text>
			<path d="M960,470 C900,390 780,390 780,470 C780,550 900,550 960,470 C1020,390 1140,390 1140,470 C1140,550 1020,550 960,470 Z" fill="none" stroke={INKG} strokeWidth={22} strokeLinejoin="round" />
			<text x={960} y={660} textAnchor="middle" style={tx(60)} fill={INKG}>不设上限</text>
		</Paper>
		<Tagline x={960} y={830} text="欧洲央行 · 2012年9月6日" anchor="middle" />
		<Grain />
	</g>
);

const Halved = () => {
	const x0 = 380, unit = 160, y1 = 430, y2 = 640;
	return (
		<g>
			<Ground kx={900} ky={520} kr={1000} />
			<text x={x0} y={300} style={tx(40, 700)} fill={CREAM}>西班牙比德国多付的利息</text>
			<Hair x1={x0} x2={x0 + 1160} y={330} o={0.4} />
			{/* 2012.7 */}
			<text x={x0 - 30} y={y1 + 55} textAnchor="end" style={tx(32, 700)} fill="#bdb29a">2012.7</text>
			<rect x={x0} y={y1} width={unit * 6.3} height={80} fill={RED} opacity={0.9} />
			<text x={x0 + unit * 6.3 + 24} y={y1 + 62} style={tx(64)} fill={RED}>6个多点</text>
			{/* 2013.5 with the ghost of the old length */}
			<text x={x0 - 30} y={y2 + 55} textAnchor="end" style={tx(32, 700)} fill="#bdb29a">2013.5</text>
			<rect x={x0} y={y2} width={unit * 6.3} height={80} fill="none" stroke={RED} strokeOpacity={0.35} strokeDasharray="8 8" strokeWidth={2} />
			<rect x={x0} y={y2} width={unit * 2.9} height={80} fill={GOLD} filter="url(#g-glow)" />
			<text x={x0 + unit * 2.9 + 24} y={y2 + 62} style={tx(64)} fill={GOLD}>不到3个点</text>
			<text x={x0 + unit * 6.3 + 24} y={y2 + 180} style={tx(84)} fill={GOLD} filter="url(#g-glow)">砍半</text>
			<Tagline x={x0} y={900} text="来源：欧洲央行 2013年6月" size={20} col="#8f8674" />
			<Grain />
		</g>
	);
};

const Promise = () => (
	<g>
		<Ground kx={1180} ky={460} kr={760} />
		<g opacity={0.45}>
			<Paper x={250} y={330} w={560} h={330} rot={-6} col="#5a5550" lit={0.2}>
				<text x={530} y={530} textAnchor="middle" style={tx(84)} fill="#5a5550">我觉得</text>
			</Paper>
		</g>
		<Paper x={980} y={260} w={680} h={420} rot={3} col={INKG} lit={1.3}>
			<Rosette cx={1110} cy={470} s={0.9} col={INKG} />
			<Rosette cx={1530} cy={470} s={0.9} col={INKG} />
			<text x={1320} y={500} textAnchor="middle" style={tx(110)} fill={INKG}>我保证</text>
			<g transform="translate(1520 610) rotate(-10)">
				<rect x={-70} y={-34} width={140} height={56} fill="none" stroke="#a8322a" strokeWidth={5} />
				<text x={0} y={6} textAnchor="middle" style={tx(32)} fill="#a8322a">承诺</text>
			</g>
		</Paper>
		<Tagline x={530} y={760} text="预测" anchor="middle" col="#7d766a" />
		<Tagline x={1320} y={780} text="承诺" anchor="middle" col={GOLD} />
		<Tagline x={1700} y={180} text="伍德福德 · 2012年8月" anchor="end" />
		<Grain />
	</g>
);

const Torn = () => {
	const r = rnd(9);
	const flecks = Array.from({length: 160}, () => ({x: 960 + (r() - 0.2) * 900, y: 260 + r() * 520, s: 1 + r() * 3.5, o: 0.25 + r() * 0.6}));
	return (
		<g>
			<Ground kx={900} ky={480} kr={850} warm={0.75} />
			<clipPath id="torn-l"><path d="M0,0 L955,0 L930,170 L975,300 L925,430 L970,560 L940,700 L960,1080 L0,1080 Z" /></clipPath>
			<clipPath id="torn-r"><path d="M955,0 L1920,0 L1920,1080 L960,1080 L940,700 L970,560 L925,430 L975,300 L930,170 Z" /></clipPath>
			<g clipPath="url(#torn-l)" transform="translate(-40 20) rotate(-5 700 480)">
				<Paper x={560} y={290} w={800} h={400} col={INKG}>
					<Rosette cx={720} cy={490} s={1} col={INKG} />
					<text x={960} y={530} textAnchor="middle" style={tx(110)} fill={INKG}>承诺</text>
				</Paper>
			</g>
			<g clipPath="url(#torn-r)" transform="translate(60 40) rotate(7 1200 480)" opacity={0.85}>
				<Paper x={560} y={290} w={800} h={400} col={INKG}>
					<Rosette cx={1200} cy={490} s={1} col={INKG} />
					<text x={960} y={530} textAnchor="middle" style={tx(110)} fill={INKG}>承诺</text>
				</Paper>
			</g>
			{flecks.map((f, i) => <circle key={i} cx={f.x} cy={f.y} r={f.s} fill={GOLD} opacity={f.o} />)}
			<Grain />
		</g>
	);
};

type Fr = {sc: string; t: number; note: string; draw: () => React.ReactNode};
const FRAMES: Fr[] = [
	{sc: '霍尔', t: 24.8, note: '时间线：收到消息那天消费就上去，钱到账那天不变（示意）', draw: Hall},
	{sc: '全国几亿人', t: 30.2, note: '一片铺到地平线的光点，只有少数亮着；下一句“管住预期”时全场变暖', draw: () => <Field />},
	{sc: '借钱 · 7%', t: 42.9, note: '左：雕版“借条·西班牙”；右：琥珀色利率线顶穿红色7%虚线', draw: Spain7},
	{sc: '不设上限', t: 64.9, note: '雕版纸上的“∞”，像钞票一样印出来', draw: Infinity8},
	{sc: '砍半', t: 74.0, note: '两根条：2012.7 红色6个多点 → 2013.5 金色不到3点，旧长度留虚线', draw: Halved},
	{sc: '我保证', t: 92.3, note: '暗处一张灰的“我觉得”，光里一张雕版“我保证”', draw: Promise},
	{sc: '前提', t: 101.5, note: '“承诺”被撕成两半，金屑往外散：说了做不到，下次就没人信', draw: Torn},
	{sc: '结尾', t: 113.5, note: '回到那片光点：这次几乎全亮——一句话的分量，在于有人信', draw: () => <Field all />},
];

const Frame: React.FC<{i: number}> = ({i}) => {
	const f = FRAMES[i];
	return (
		<AbsoluteFill style={{background: '#060504'}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
				{f.draw()}
				<Sub t={lineAt(lines, f.t)} />
				<Note sc={f.sc} t={f.t} note={f.note} kind="2D" />
			</svg>
		</AbsoluteFill>
	);
};
const Root: React.FC = () => <Composition id="ST2D" component={Frame} durationInFrames={1} fps={30} width={W} height={H} defaultProps={{i: 0}} />;
registerRoot(Root);
