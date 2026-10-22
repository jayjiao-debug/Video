// ep36 《分手以后，为什么反而更放不下？》 — three looks × two keyframes (opening at 2 a.m. · the brain lighting up)
import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';

const W = 1920, H = 1080;
const SANS = '"Noto Sans CJK SC", sans-serif', SERIF = '"Noto Serif CJK SC", serif';
type Pt = [number, number];
const rnd = (seed: number) => { let s = seed * 9973 + 12345; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };

/** side-view brain (facing left), in a 1000×720 box */
const BRAIN = 'M180,420 C150,300 220,170 360,120 C470,80 600,70 700,110 C820,150 905,240 912,340 C918,420 880,470 820,492 C842,540 822,602 760,612 C700,622 652,592 622,562 C560,582 482,584 420,562 C360,602 282,602 232,562 C192,532 180,482 180,420 Z';
const SULCI = ['M300,200 C340,260 330,320 380,360', 'M430,130 C440,200 470,240 450,300', 'M560,100 C560,170 600,210 590,270', 'M690,130 C670,190 700,240 720,290', 'M800,190 C770,240 790,300 820,330',
	'M260,330 C320,330 360,300 420,320', 'M480,360 C540,330 620,350 690,330', 'M300,470 C380,440 470,470 560,450 C640,440 720,460 800,440', 'M360,240 C420,230 470,260 520,240'];
const CEREB = 'M700,560 C720,520 800,505 850,530 C890,555 880,610 830,625 C780,640 720,620 700,590 Z';
const STEM = 'M600,560 C610,600 615,650 630,700 L670,700 C660,650 660,600 655,565 Z';
const REG = {ofc: [270, 430] as Pt, nacc: [430, 455] as Pt, vta: [585, 540] as Pt, insula: [470, 380] as Pt};

const Sub: React.FC<{t: string; color?: string; font?: string; dark?: boolean}> = ({t, color = '#fff', font = SANS, dark = true}) => (
	<div style={{position: 'absolute', left: 0, right: 0, bottom: 64, textAlign: 'center', fontFamily: font, fontWeight: 900, fontSize: 60, color, letterSpacing: '0.04em',
		textShadow: dark ? '0 0 2px rgba(0,0,0,0.9), 0 3px 18px rgba(0,0,0,0.85)' : '0 0 1px rgba(255,255,255,0.8)'}}>{t}</div>
);

// ================================================================== A · 霓虹雨夜 — rain on the window, the city's neon, the phone's cold light; the brain is a night city that lights up district by district
const Rain: React.FC<{seed?: number}> = ({seed = 1}) => {
	const R = rnd(seed);
	return <g>{Array.from({length: 140}, (_, i) => { const x = R() * W, y = R() * H, r = 2 + R() * 7, c = ['#ff3d8b', '#23d5c8', '#ffb347', '#9b7bff'][Math.floor(R() * 4)];
		return <g key={i}><ellipse cx={x} cy={y} rx={r * 0.8} ry={r} fill={c} opacity={0.18 + R() * 0.25} /><ellipse cx={x - r * 0.25} cy={y - r * 0.3} rx={r * 0.25} ry={r * 0.3} fill="#fff" opacity={0.5} />
			{R() < 0.25 && <path d={`M${x},${y + r} q${(R() - 0.5) * 8},${40 + R() * 80} ${(R() - 0.5) * 6},${90 + R() * 120}`} stroke={c} strokeWidth={r * 0.6} opacity={0.18} fill="none" strokeLinecap="round" />}</g>; })}</g>;
};
const Bokeh: React.FC<{seed?: number; n?: number}> = ({seed = 2, n = 60}) => {
	const R = rnd(seed);
	return <g filter="url(#blurL)">{Array.from({length: n}, (_, i) => { const c = ['#ff3d8b', '#23d5c8', '#ffb347', '#7a5cff', '#ff6a3d'][i % 5]; return <circle key={i} cx={R() * W} cy={200 + R() * 600} r={20 + R() * 70} fill={c} opacity={0.12 + R() * 0.3} />; })}</g>;
};
const FeedPhone: React.FC<{x: number; y: number; w: number; tilt?: number; theme?: 'dark' | 'light'}> = ({x, y, w, tilt = 0, theme = 'dark'}) => {
	const h = w * 2.05, bg = theme === 'dark' ? '#0f1116' : '#fbfaf7', ink = theme === 'dark' ? '#e9ecf2' : '#1d2430', sub = theme === 'dark' ? '#8a93a6' : '#7c8494';
	return (
		<g transform={`translate(${x},${y}) rotate(${tilt})`}>
			<rect x={-w / 2 - 10} y={-h / 2 - 10} width={w + 20} height={h + 20} rx={w * 0.13} fill="#05060a" />
			<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.11} fill={bg} />
			<g transform={`translate(${-w / 2},${-h / 2}) scale(${w / 400})`}>
				<text x={36} y={50} style={{fontFamily: SANS, fontWeight: 700, fontSize: 22}} fill={ink}>02:13</text>
				<rect x={150} y={22} width={100} height={32} rx={16} fill="#000" />
				{/* cover photo: a sunset over the sea */}
				<linearGradient id={`sun${theme}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2a6a" /><stop offset="0.55" stopColor="#ff8a5c" /><stop offset="1" stopColor="#ffd28a" /></linearGradient>
				<rect x={0} y={70} width={400} height={230} fill={`url(#sun${theme})`} />
				<circle cx={280} cy={230} r={34} fill="#fff1c8" opacity={0.9} />
				<rect x={0} y={250} width={400} height={50} fill="#2b3a5c" opacity={0.85} />
				<circle cx={330} cy={300} r={44} fill="#c9cdd6" stroke={bg} strokeWidth={6} />
				<path d="M306,322 C306,296 354,296 354,322 M318,288 a12,12 0 1,0 24,0 a12,12 0 1,0 -24,0" fill="#8a93a6" />
				<text x={300} y={290} textAnchor="end" style={{fontFamily: SANS, fontWeight: 900, fontSize: 30}} fill="#fff">ta</text>
				{/* one post */}
				<circle cx={46} cy={384} r={24} fill="#c9cdd6" />
				<text x={84} y={378} style={{fontFamily: SANS, fontWeight: 700, fontSize: 22}} fill="#5a7bb5">ta</text>
				<text x={84} y={412} style={{fontFamily: SANS, fontSize: 21}} fill={ink}>今天的晚霞，很像那年。</text>
				<rect x={84} y={430} width={150} height={150} rx={6} fill="#ff9a6a" /><rect x={84} y={520} width={150} height={60} fill="#3a4a6a" opacity={0.8} />
				<circle cx={190} cy={480} r={16} fill="#fff1c8" />
				<text x={84} y={612} style={{fontFamily: SANS, fontSize: 18}} fill={sub}>2小时前</text>
				<rect x={330} y={596} width={44} height={24} rx={6} fill={theme === 'dark' ? '#2a2f3a' : '#e8eaee'} />
				<circle cx={344} cy={608} r={3} fill={sub} /><circle cx={356} cy={608} r={3} fill={sub} />
				<line x1={0} y1={650} x2={400} y2={650} stroke={sub} opacity={0.25} />
				<circle cx={46} cy={700} r={24} fill="#c9cdd6" opacity={0.6} /><rect x={84} y={684} width={180} height={18} rx={9} fill={sub} opacity={0.3} /><rect x={84} y={712} width={240} height={14} rx={7} fill={sub} opacity={0.2} />
			</g>
			<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.11} fill="url(#glass)" opacity={0.25} />
		</g>
	);
};
const DefsCommon: React.FC = () => (
	<defs>
		<filter id="blurL" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="28" /></filter>
		<filter id="blurM" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" /></filter>
		<filter id="blurS" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
		<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.09 0" /></filter>
		<filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.04 0.06" numOctaves="3" seed="7" /><feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0.12 0" /></filter>
		<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.5" /><stop offset="0.4" stopColor="#fff" stopOpacity="0" /></linearGradient>
	</defs>
);
const A1: React.FC = () => (
	<AbsoluteFill style={{background: '#0d0814'}}>
		<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
			<DefsCommon />
			<linearGradient id="nightA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b0716" /><stop offset="0.6" stopColor="#1a0d26" /><stop offset="1" stopColor="#07050c" /></linearGradient>
			<rect width={W} height={H} fill="url(#nightA)" />
			{/* the window: the city out of focus behind rain on the glass */}
			<g opacity={0.95}><Bokeh seed={3} n={70} /></g>
			<Rain seed={5} />
			<rect x={0} y={0} width={W} height={H} fill="#0d0814" opacity={0.25} />
			{/* window frame, dark */}
			<rect x={0} y={0} width={W} height={60} fill="#06040a" /><rect x={940} y={0} width={36} height={700} fill="#06040a" /><rect x={0} y={660} width={W} height={60} fill="#06040a" />
			{/* the bed: rumpled sheets lit by the screen */}
			<path d="M-40,760 C300,700 700,740 1000,720 C1300,700 1600,740 1980,700 L1980,1100 L-40,1100 Z" fill="#141522" />
			{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${-40 + i * 60},${800 + i * 50} C${400 + i * 40},${740 + i * 60} ${900},${820 + i * 30} ${1400 - i * 40},${780 + i * 50}`} stroke="#23d5c8" strokeWidth={30} opacity={0.05} fill="none" filter="url(#blurM)" />)}
			<ellipse cx={1180} cy={860} rx={520} ry={200} fill="#9fe8ff" opacity={0.16} filter="url(#blurL)" />
			<ellipse cx={1180} cy={850} rx={260} ry={110} fill="#d8f6ff" opacity={0.2} filter="url(#blurL)" />
			{/* a pillow edge and the phone on the sheet */}
			<path d="M120,760 C200,700 520,690 640,720 C700,760 690,840 600,850 C430,870 200,860 120,830 Z" fill="#1c1d2c" />
			<FeedPhone x={1180} y={630} w={250} tilt={-14} />
			<rect width={W} height={H} filter="url(#grain)" />
		</svg>
		<div style={{position: 'absolute', left: 80, top: 70, fontFamily: SANS, fontWeight: 300, fontSize: 26, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.55)'}}>02:13</div>
		<Sub t="凌晨两点，你又点开了ta的朋友圈" />
	</AbsoluteFill>
);
const NeonBrain: React.FC<{x: number; y: number; s: number; glow: string; lit: {p: Pt; c: string; label: string; ldx: number; ldy: number}[]}> = ({x, y, s, glow, lit}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d={CEREB} fill="#0b0915" stroke={glow} strokeWidth={4} opacity={0.8} /><path d={STEM} fill="#0b0915" stroke={glow} strokeWidth={4} opacity={0.8} />
		<path d={BRAIN} fill="#0a0812" stroke={glow} strokeWidth={10} opacity={0.35} filter="url(#blurM)" />
		<path d={BRAIN} fill="#0b0915" />
		{/* streets: the brain as a night city grid, clipped to the shape */}
		<clipPath id="bclip"><path d={BRAIN} /></clipPath>
		<g clipPath="url(#bclip)" opacity={0.55}>
			{Array.from({length: 26}, (_, i) => <line key={'v' + i} x1={150 + i * 30} y1={60} x2={150 + i * 30 + 40} y2={640} stroke="#2a2440" strokeWidth={2} />)}
			{Array.from({length: 20}, (_, i) => <line key={'h' + i} x1={140} y1={70 + i * 30} x2={930} y2={60 + i * 30} stroke="#2a2440" strokeWidth={2} />)}
			{Array.from({length: 120}, (_, i) => { const R = rnd(i + 40); return <rect key={i} x={160 + R() * 760} y={90 + R() * 520} width={8} height={8} fill="#ffcf8a" opacity={0.08 + R() * 0.2} />; })}
		</g>
		{SULCI.map((d, i) => <path key={i} d={d} stroke="#3a2f5a" strokeWidth={5} fill="none" strokeLinecap="round" />)}
		<path d={BRAIN} fill="none" stroke={glow} strokeWidth={4} />
		{lit.map((r, i) => (
			<g key={i}>
				<circle cx={r.p[0]} cy={r.p[1]} r={110} fill={r.c} opacity={0.35} filter="url(#blurL)" />
				<circle cx={r.p[0]} cy={r.p[1]} r={46} fill={r.c} opacity={0.6} filter="url(#blurM)" />
				<circle cx={r.p[0]} cy={r.p[1]} r={14} fill="#fff" />
				{[0, 1, 2].map((k) => <circle key={k} cx={r.p[0]} cy={r.p[1]} r={30 + k * 28} fill="none" stroke={r.c} strokeWidth={3} opacity={0.6 - k * 0.18} />)}
				<line x1={r.p[0]} y1={r.p[1]} x2={r.p[0] + r.ldx} y2={r.p[1] + r.ldy} stroke={r.c} strokeWidth={3} />
				<text x={r.p[0] + r.ldx + (r.ldx < 0 ? -12 : 12)} y={r.p[1] + r.ldy + 14} textAnchor={r.ldx < 0 ? 'end' : 'start'} style={{fontFamily: SANS, fontWeight: 900, fontSize: 46}} fill="#fff">{r.label}</text>
			</g>
		))}
	</g>
);
const A2: React.FC = () => (
	<AbsoluteFill style={{background: '#0b0713'}}>
		<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
			<DefsCommon />
			<rect width={W} height={H} fill="#0b0713" />
			<g opacity={0.5}><Bokeh seed={9} n={30} /></g>
			{/* the photo of ta, held up in the dark; its light runs into the brain */}
			<g transform="translate(330,470) rotate(-6)">
				<rect x={-150} y={-190} width={300} height={360} rx={8} fill="#f4efe6" />
				<linearGradient id="phA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2a6a" /><stop offset="0.6" stopColor="#ff8a5c" /><stop offset="1" stopColor="#ffd28a" /></linearGradient>
				<rect x={-130} y={-170} width={260} height={260} fill="url(#phA)" />
				<path d="M-40,90 C-40,30 40,30 40,90 Z M-22,10 a22,22 0 1,0 44,0 a22,22 0 1,0 -44,0" fill="#1a1426" />
				<text x={0} y={140} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 700, fontSize: 34}} fill="#2a2030">ta</text>
			</g>
			<path d="M480,430 C620,380 740,430 840,490" stroke="#ff3d8b" strokeWidth={6} fill="none" opacity={0.9} filter="url(#blurS)" />
			<path d="M480,430 C620,380 740,430 840,490" stroke="#fff" strokeWidth={2} fill="none" />
			<NeonBrain x={660} y={100} s={0.95} glow="#7a5cff" lit={[{p: REG.vta, c: '#ff3d8b', label: '奖赏系统', ldx: 300, ldy: 110}, {p: REG.nacc, c: '#ff6a3d', label: '渴求 · 上瘾', ldx: -180, ldy: 210}, {p: REG.ofc, c: '#ffb347', label: '', ldx: 0, ldy: 0}]} />
			<rect width={W} height={H} filter="url(#grain)" />
		</svg>
		<div style={{position: 'absolute', left: 0, right: 0, top: 54, textAlign: 'center', fontFamily: SANS, fontWeight: 300, fontSize: 26, letterSpacing: '0.5em', color: 'rgba(255,255,255,0.6)'}}>2010 · 美国</div>
		<Sub t="亮起来的，是大脑的奖赏系统" />
	</AbsoluteFill>
);

// ================================================================== B · 拍立得手账 — a lamp-lit desk of what's left: instant photos, ticket stubs, handwriting; the brain is an old anatomy engraving that blooms with watercolour
const Polaroid: React.FC<{x: number; y: number; r: number; s?: number; scene: 'sea' | 'cinema' | 'rain' | 'cake'; cap: string}> = ({x, y, r, s = 1, scene, cap}) => (
	<g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>
		<rect x={-118} y={-140} width={236} height={290} fill="#000" opacity={0.25} filter="url(#blurM)" transform="translate(8,12)" />
		<rect x={-118} y={-140} width={236} height={290} fill="#f6f1e6" />
		<g>
			<clipPath id={`pc${scene}`}><rect x={-100} y={-122} width={200} height={200} /></clipPath>
			<g clipPath={`url(#pc${scene})`}>
				{scene === 'sea' && <><rect x={-100} y={-122} width={200} height={200} fill="#f2a477" /><rect x={-100} y={-30} width={200} height={110} fill="#4a6a8a" /><circle cx={40} cy={-40} r={26} fill="#fff1c8" /><path d="M-60,78 L-60,30 a14,14 0 1,1 0.1,0 Z M-30,78 L-30,34 a13,13 0 1,1 0.1,0 Z" fill="#2a2030" /></>}
				{scene === 'cinema' && <><rect x={-100} y={-122} width={200} height={200} fill="#1a1426" /><rect x={-80} y={-100} width={160} height={90} fill="#c9d8f0" opacity={0.85} /><path d="M-60,78 L-60,30 a14,14 0 1,1 0.1,0 Z M-28,78 L-28,30 a14,14 0 1,1 0.1,0 Z" fill="#000" /></>}
				{scene === 'rain' && <><rect x={-100} y={-122} width={200} height={200} fill="#6a7a8a" /><path d="M-70,0 Q-20,-70 30,0 Z" fill="#c0392b" /><line x1={-20} y1={-10} x2={-20} y2={70} stroke="#222" strokeWidth={4} /><path d="M-40,78 L-40,30 a12,12 0 1,1 0.1,0 Z M-8,78 L-8,30 a12,12 0 1,1 0.1,0 Z" fill="#1a1a22" />{Array.from({length: 20}, (_, i) => <line key={i} x1={-100 + i * 11} y1={-122} x2={-110 + i * 11} y2={78} stroke="#fff" opacity={0.25} />)}</>}
				{scene === 'cake' && <><rect x={-100} y={-122} width={200} height={200} fill="#3a2a22" /><rect x={-50} y={0} width={100} height={60} rx={8} fill="#f4d6c8" /><rect x={-4} y={-30} width={8} height={30} fill="#fff" /><ellipse cx={0} cy={-38} rx={7} ry={12} fill="#ffcf5a" /><circle cx={0} cy={-38} r={60} fill="#ffcf5a" opacity={0.25} /></>}
			</g>
		</g>
		<text x={0} y={120} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 400, fontSize: 24, fontStyle: 'italic'}} fill="#3a2e28">{cap}</text>
	</g>
);
const B1: React.FC = () => (
	<AbsoluteFill style={{background: '#20160f'}}>
		<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
			<DefsCommon />
			<linearGradient id="wood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5a3c26" /><stop offset="1" stopColor="#2a1a10" /></linearGradient>
			<rect width={W} height={H} fill="url(#wood)" />
			{Array.from({length: 30}, (_, i) => <path key={i} d={`M-20,${i * 40 + 10} C600,${i * 40 - 20} 1200,${i * 40 + 30} 1960,${i * 40}`} stroke="#1a0f08" strokeWidth={2} opacity={0.35} fill="none" />)}
			{/* the lamp's warm pool */}
			<circle cx={700} cy={420} r={760} fill="#ffcf8a" opacity={0.28} filter="url(#blurL)" />
			<Polaroid x={420} y={330} r={-10} scene="sea" cap="2023.7 海边" />
			<Polaroid x={720} y={250} r={7} s={0.9} scene="cinema" cap="第一次看电影" />
			<Polaroid x={360} y={720} r={6} s={0.95} scene="rain" cap="你的伞" />
			<Polaroid x={1560} y={300} r={-6} s={0.85} scene="cake" cap="生日快乐" />
			{/* a ticket stub, a dried flower, a note */}
			<g transform="translate(1010,815) rotate(-8)"><rect x={-140} y={-50} width={280} height={100} rx={6} fill="#e9d9b8" /><line x1={70} y1={-50} x2={70} y2={50} stroke="#8a6a44" strokeDasharray="6 6" /><text x={-120} y={-8} style={{fontFamily: SANS, fontWeight: 700, fontSize: 22}} fill="#5a3e2a">电影票 · 7排 8号 9号</text><text x={-120} y={26} style={{fontFamily: SANS, fontSize: 18}} fill="#8a6a44">2023.05.20 20:40</text></g>
			<g transform="translate(1320,820) rotate(20)"><line x1={0} y1={0} x2={-10} y2={-200} stroke="#6a5a3a" strokeWidth={4} />{[0, 1, 2, 3, 4].map((k) => <ellipse key={k} cx={-10 + Math.cos(k * 1.25) * 22} cy={-210 + Math.sin(k * 1.25) * 22} rx={20} ry={11} fill="#b56a6a" transform={`rotate(${k * 72},${-10 + Math.cos(k * 1.25) * 22},${-210 + Math.sin(k * 1.25) * 22})`} />)}<circle cx={-10} cy={-210} r={9} fill="#e0b060" /></g>
			<g transform="translate(1600,640) rotate(4)"><rect x={-150} y={-90} width={300} height={180} fill="#f7f0d8" /><rect x={-40} y={-104} width={80} height={26} fill="#c8d8e0" opacity={0.75} transform="rotate(-4)" />
				<text x={-120} y={-20} style={{fontFamily: SERIF, fontSize: 34}} fill="#3a2e28">说好不看了。</text><text x={-120} y={30} style={{fontFamily: SERIF, fontSize: 26}} fill="#7a6a5a">— 第37天</text></g>
			{/* the phone, face up, its cold light against the warm desk */}
			<ellipse cx={1080} cy={440} rx={300} ry={250} fill="#cfe6ff" opacity={0.18} filter="url(#blurL)" />
			<FeedPhone x={1080} y={430} w={250} tilt={8} />
			<rect width={W} height={H} filter="url(#grain)" />
			<rect width={W} height={H} fill="#000" opacity={0.0} />
		</svg>
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 45% 40%, rgba(0,0,0,0) 45%, rgba(10,6,3,0.7) 100%)'}} />
		<Sub t="凌晨两点，你又点开了ta的朋友圈" />
	</AbsoluteFill>
);
const B2: React.FC = () => (
	<AbsoluteFill style={{background: '#efe5cf'}}>
		<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
			<DefsCommon />
			<rect width={W} height={H} fill="#efe5cf" /><rect width={W} height={H} filter="url(#paper)" />
			<rect x={70} y={60} width={W - 140} height={H - 120} fill="none" stroke="#8a6a44" strokeWidth={2} opacity={0.5} />
			{/* the engraved brain, hatched */}
			<g transform="translate(660,100) scale(0.95)">
				<path d={STEM} fill="#e6d8bc" stroke="#3a2e28" strokeWidth={2.4} />
				<path d={CEREB} fill="#e6d8bc" stroke="#3a2e28" strokeWidth={2.4} />{Array.from({length: 7}, (_, i) => <path key={i} d={`M${712 + i * 4},${560 + i * 8} C760,${540 + i * 10} 820,${545 + i * 10} 860,${560 + i * 8}`} stroke="#3a2e28" strokeWidth={1.2} fill="none" />)}
				<path d={BRAIN} fill="#efe5cf" />
				<clipPath id="bclipB"><path d={BRAIN} /></clipPath>
				<g clipPath="url(#bclipB)">{Array.from({length: 90}, (_, i) => <line key={i} x1={100 + i * 10} y1={60} x2={60 + i * 10} y2={660} stroke="#5a4636" strokeWidth={1.2} opacity={0.35} />)}</g>
				{/* watercolour blooms where it lights */}
				{([[REG.vta, '#d9534f', 120], [REG.nacc, '#e8853c', 110], [REG.ofc, '#e8a23c', 90]] as const).map(([p, c, r], i) => <g key={i}><circle cx={p[0]} cy={p[1]} r={r} fill={c} opacity={0.35} filter="url(#blurM)" /><circle cx={p[0] + 14} cy={p[1] - 8} r={r * 0.6} fill={c} opacity={0.4} filter="url(#blurS)" /></g>)}
				<path d={BRAIN} fill="none" stroke="#3a2e28" strokeWidth={3} />
				{SULCI.map((d, i) => <path key={i} d={d} stroke="#3a2e28" strokeWidth={2.4} fill="none" />)}
				{/* plate labels */}
				{([[REG.vta, '奖赏', 300, 110], [REG.nacc, '渴求', -180, 210], [REG.ofc, '', 0, 0]] as const).filter((l) => l[1]).map(([p, t, dx, dy], i) => (
					<g key={i}><line x1={p[0]} y1={p[1]} x2={p[0] + dx} y2={p[1] + dy} stroke="#3a2e28" strokeWidth={1.6} /><circle cx={p[0]} cy={p[1]} r={6} fill="#3a2e28" />
						<text x={p[0] + dx + (dx < 0 ? -10 : 10)} y={p[1] + dy + 18} textAnchor={dx < 0 ? 'end' : 'start'} style={{fontFamily: SERIF, fontWeight: 700, fontSize: 52}} fill="#3a2e28">{t}</text></g>))}
			</g>
			{/* ta's photo pinned at the left, a red thread to the brain */}
			<Polaroid x={360} y={470} r={-5} s={1.1} scene="sea" cap="ta" />
			<path d="M440,380 C640,300 980,420 1216,613" stroke="#b02a2a" strokeWidth={3} fill="none" />
			<circle cx={440} cy={380} r={9} fill="#b02a2a" />
			<text x={110} y={130} style={{fontFamily: SERIF, fontWeight: 700, fontSize: 30, letterSpacing: '0.3em'}} fill="#5a4636">PLATE II · 2010</text>
		</svg>
		<Sub t="亮起来的，是大脑的奖赏系统" color="#2a201a" font={SERIF} dark={false} />
	</AbsoluteFill>
);

// ================================================================== C · 戒断 (clinical, light) — a calm medical world: white, mint, one coral; the phone is a dose, the night a heart-rate line
// a night of heartbeats: calm small beats, then at 02:13 (x 980) a burst that peaks at y 360
const ecg = () => { const pts: string[] = ['M0,560']; for (let b = 60; b < W; b += 170) { if (Math.abs(b - 980) < 120) continue; pts.push(`L${b},560 L${b + 10},535 L${b + 20},582 L${b + 30},560`); }
	const burst = [[880, 560], [905, 470], [925, 610], [945, 430], [962, 640], [980, 360], [1000, 690], [1018, 450], [1036, 600], [1054, 520], [1072, 575], [1090, 560]];
	const all = pts.join(' ').split(' L').map((t, k) => (k === 0 ? t : 'L' + t)); // keep in x order by inserting the burst
	const before = all.filter((t) => Number(t.slice(1).split(',')[0]) < 880), after = all.filter((t) => Number(t.slice(1).split(',')[0]) > 1090);
	return [...before, ...burst.map(([x, y]) => `L${x},${y}`), ...after, `L${W},560`].join(' '); };
const C1: React.FC = () => (
	<AbsoluteFill style={{background: '#f2f0eb'}}>
		<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
			<DefsCommon />
			<radialGradient id="cbg" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stopColor="#fbfaf7" /><stop offset="1" stopColor="#e4e1d8" /></radialGradient>
			<rect width={W} height={H} fill="url(#cbg)" />
			{/* the heart-rate line across the night, spiking at 02:13 */}
			<path d={ecg()} stroke="#ff5a4e" strokeWidth={4} fill="none" strokeLinejoin="round" opacity={0.85} />
			{[['22:00', 200], ['00:00', 560], ['02:13', 980], ['04:00', 1400], ['06:00', 1760]].map(([t, x], i) => <g key={i}><line x1={x as number} y1={712} x2={x as number} y2={732} stroke="#9aa3b2" strokeWidth={2} /><text x={x as number} y={768} textAnchor="middle" style={{fontFamily: SANS, fontSize: 24, fontWeight: i === 2 ? 900 : 400}} fill={i === 2 ? '#ff5a4e' : '#9aa3b2'}>{t}</text></g>)}
			{/* the phone, presented like a prescription: label with dose */}
			<ellipse cx={430} cy={760} rx={200} ry={24} fill="#000" opacity={0.12} filter="url(#blurM)" />
			<FeedPhone x={430} y={460} w={220} theme="light" />
			<circle cx={980} cy={360} r={12} fill="#ff5a4e" /><circle cx={980} cy={360} r={34} fill="none" stroke="#ff5a4e" strokeWidth={3} opacity={0.5} />
			<g transform="translate(1180,120)">
				<rect x={0} y={0} width={420} height={250} rx={18} fill="#fff" stroke="#d8dce2" strokeWidth={2} />
				<rect x={0} y={0} width={420} height={60} rx={18} fill="#bfe7d8" /><rect x={0} y={40} width={420} height={20} fill="#bfe7d8" />
				<text x={28} y={42} style={{fontFamily: SANS, fontWeight: 900, fontSize: 28}} fill="#1d2430">处方 · ta的朋友圈</text>
				<text x={28} y={110} style={{fontFamily: SANS, fontWeight: 700, fontSize: 26}} fill="#1d2430">用法：睡前查看</text>
				<text x={28} y={156} style={{fontFamily: SANS, fontWeight: 700, fontSize: 26}} fill="#1d2430">剂量：<tspan fill="#ff5a4e">“就看一眼”</tspan></text>
				<text x={28} y={202} style={{fontFamily: SANS, fontWeight: 700, fontSize: 26}} fill="#1d2430">今日已用：<tspan fill="#ff5a4e">14 次</tspan></text>
			</g>
			<path d="M545,300 C800,300 900,240 1180,245" stroke="#9aa3b2" strokeWidth={2} strokeDasharray="6 6" fill="none" />
		</svg>
		<Sub t="凌晨两点，你又点开了ta的朋友圈" color="#1d2430" dark={false} />
	</AbsoluteFill>
);
const C2: React.FC = () => (
	<AbsoluteFill style={{background: '#f2f0eb'}}>
		<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
			<DefsCommon />
			<radialGradient id="cbg2" cx="0.55" cy="0.45" r="0.7"><stop offset="0" stopColor="#fbfaf7" /><stop offset="1" stopColor="#e4e1d8" /></radialGradient>
			<radialGradient id="tissue" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stopColor="#f4dcd6" /><stop offset="0.7" stopColor="#e2b8b0" /><stop offset="1" stopColor="#c99a92" /></radialGradient>
			<rect width={W} height={H} fill="url(#cbg2)" />
			<g transform="translate(660,100) scale(0.95)">
				<ellipse cx={560} cy={712} rx={360} ry={22} fill="#000" opacity={0.1} filter="url(#blurM)" />
				<path d={STEM} fill="#d6aaa2" /><path d={CEREB} fill="#e2b8b0" />
				<path d={BRAIN} fill="url(#tissue)" />
				{SULCI.map((d, i) => <path key={i} d={d} stroke="#b4847c" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.7} />)}
				{([[REG.vta, 1], [REG.nacc, 0.85], [REG.ofc, 0.6]] as const).map(([p, a], i) => <g key={i}><circle cx={p[0]} cy={p[1]} r={95} fill="#ff5a4e" opacity={0.35 * a} filter="url(#blurL)" /><circle cx={p[0]} cy={p[1]} r={34} fill="#ff5a4e" opacity={0.85 * a} filter="url(#blurS)" /></g>)}
				{([[REG.vta, '奖赏系统', 300, 110], [REG.nacc, '渴求 · 上瘾', -180, 210]] as const).map(([p, t, dx, dy], i) => (
					<g key={i}><line x1={p[0]} y1={p[1]} x2={p[0] + dx} y2={p[1] + dy} stroke="#1d2430" strokeWidth={2} /><circle cx={p[0]} cy={p[1]} r={7} fill="#1d2430" />
						<rect x={p[0] + dx + (dx < 0 ? -330 : 0)} y={p[1] + dy - 40} width={330} height={74} rx={37} fill="#fff" stroke="#d8dce2" strokeWidth={2} />
						<text x={p[0] + dx + (dx < 0 ? -165 : 165)} y={p[1] + dy + 12} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 40}} fill="#ff5a4e">{t}</text></g>))}
			</g>
			{/* the dose: ta's photo in a capsule card */}
			<g transform="translate(330,470)">
				<rect x={-170} y={-210} width={340} height={420} rx={28} fill="#fff" stroke="#d8dce2" strokeWidth={2} />
				<linearGradient id="phC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2a6a" /><stop offset="0.6" stopColor="#ff8a5c" /><stop offset="1" stopColor="#ffd28a" /></linearGradient>
				<rect x={-140} y={-180} width={280} height={260} rx={16} fill="url(#phC)" />
				<path d="M-40,80 C-40,24 40,24 40,80 Z M-22,2 a22,22 0 1,0 44,0 a22,22 0 1,0 -44,0" fill="#1a1426" />
				<text x={0} y={140} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 36}} fill="#1d2430">看ta的照片</text>
				<text x={0} y={182} textAnchor="middle" style={{fontFamily: SANS, fontSize: 24}} fill="#9aa3b2">15 人 · 平均分开两个月</text>
			</g>
			<path d="M510,470 C620,470 720,490 830,515" stroke="#ff5a4e" strokeWidth={4} fill="none" strokeDasharray="10 10" />
		</svg>
		<div style={{position: 'absolute', left: 0, right: 0, top: 54, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: '0.5em', color: '#9aa3b2'}}>2010 · 美国</div>
		<Sub t="亮起来的，是大脑的奖赏系统" color="#1d2430" dark={false} />
	</AbsoluteFill>
);

const Looks36: React.FC = () => {
	const f = useCurrentFrame();
	return [<A1 />, <A2 />, <B1 />, <B2 />, <C1 />, <C2 />][f % 6];
};
registerRoot(() => <Composition id="LOOKS36" component={Looks36} durationInFrames={6} fps={30} width={W} height={H} />);
