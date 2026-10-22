// ep36 《分手以后，为什么反而更放不下？》 — storyboard keyframes in the chosen look (A · 霓虹雨夜), one frame per scene.
// World: one rainy night. The room → through the window → the city across the street → the brain drawn as a night city.
import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';

const W = 1920, H = 1080;
const SANS = '"Noto Sans CJK SC", sans-serif';
type Pt = [number, number];
const C = {mag: '#ff3d8b', teal: '#23d5c8', amber: '#ffb347', vio: '#8a6cff', ice: '#9fe8ff', ink: '#fff4fa'};
const rnd = (seed: number) => { let s = (seed * 9973 + 12345) % 2147483647; for (let i = 0; i < 5; i++) s = (s * 16807) % 2147483647; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };

// ---------------------------------------------------------------- type
const PUNCT = '？！。，：；、';
const pull = (t: string, ls = 0.04) => (PUNCT.includes(t.slice(-1)) ? <>{t.slice(0, -1)}<span style={{marginRight: `${-0.5 - ls}em`}}>{t.slice(-1)}</span></> : <>{t}</>);
const Sub: React.FC<{t: string}> = ({t}) => (
	<div style={{position: 'absolute', left: 0, right: 0, bottom: 62, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 62, color: '#fff', letterSpacing: '0.04em',
		textShadow: '0 0 3px rgba(10,4,16,0.95), 0 0 14px rgba(10,4,16,0.8), 0 4px 30px rgba(10,4,16,0.7)'}}>{pull(t)}</div>
);
const Header: React.FC<{t: string}> = ({t}) => (
	<div style={{position: 'absolute', left: 0, right: 0, top: 50, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: '0.4em', color: 'rgba(255,240,250,0.82)',
		textShadow: '0 0 12px rgba(10,4,16,0.9)'}}><span style={{marginRight: '-0.4em'}}>{t}</span></div>
);
const neon = (c: string) => `0 0 4px #fff, 0 0 12px ${c}, 0 0 28px ${c}, 0 0 60px ${c}, 0 0 110px ${c}`;
const Tag: React.FC<{x: number; y: number; t: React.ReactNode; size?: number; c?: string; anchor?: 'l' | 'c' | 'r'; glow?: boolean; w?: number}> = ({x, y, t, size = 56, c = '#fff', anchor = 'l', glow, w = 900}) => (
	<div style={{position: 'absolute', left: anchor === 'l' ? x : anchor === 'c' ? x - w / 2 : x - w, top: y - size * 0.62, width: w, textAlign: anchor === 'l' ? 'left' : anchor === 'c' ? 'center' : 'right',
		fontFamily: SANS, fontWeight: 900, fontSize: size, lineHeight: 1.25, color: glow ? C.ink : c, textShadow: glow ? neon(c) : '0 0 3px rgba(10,4,16,0.95), 0 0 16px rgba(10,4,16,0.85)'}}>{t}</div>
);

// ---------------------------------------------------------------- shared defs
const Defs: React.FC = () => (
	<defs>
		<filter id="bXL" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="48" /></filter>
		<filter id="bL" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="24" /></filter>
		<filter id="bM" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" /></filter>
		<filter id="bS" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
		<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.08 0" /></filter>
		<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.45" /><stop offset="0.4" stopColor="#fff" stopOpacity="0" /></linearGradient>
		<linearGradient id="sunset" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2a6a" /><stop offset="0.55" stopColor="#ff8a5c" /><stop offset="1" stopColor="#ffd28a" /></linearGradient>
		<linearGradient id="skyN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#140b24" /><stop offset="0.65" stopColor="#3a1a4a" /><stop offset="1" stopColor="#6a2550" /></linearGradient>
	</defs>
);
const Grain = () => <rect width={W} height={H} filter="url(#grain)" />;

// ---------------------------------------------------------------- the city at night (skyline, lit windows, neon signs)
const City: React.FC<{seed?: number; y0?: number; blur?: string; lights?: number; dawn?: boolean}> = ({seed = 11, y0 = 700, blur = 'bM', lights = 1, dawn}) => {
	const R = rnd(seed), bs: React.ReactNode[] = [];
	let x = -40, i = 0;
	while (x < W + 40) {
		const bw = 90 + R() * 170, bh = 180 + R() * 420, top = y0 - bh, k = i++;
		bs.push(<rect key={'b' + k} x={x} y={top} width={bw} height={bh + 400} fill={dawn ? '#2a2440' : '#170e24'} />);
		for (let wy = top + 20; wy < y0 + 380; wy += 34) for (let wx = x + 12; wx < x + bw - 16; wx += 26) {
			const r = R(); if (r < 0.28 * lights) bs.push(<rect key={`w${k}-${wx}-${wy}`} x={wx} y={wy} width={12} height={16} fill={r < 0.05 ? C.ice : r < 0.1 ? '#ff9ac4' : '#ffcf8a'} opacity={dawn ? 0.25 : 0.55 + R() * 0.4} />);
		}
		if (!dawn && R() < 0.45) { const sc = [C.mag, C.teal, C.amber, C.vio][Math.floor(R() * 4)], sy = top + 30 + R() * 120; bs.push(<g key={'n' + k}><rect x={x + 14} y={sy} width={bw - 28} height={34} rx={6} fill={sc} opacity={0.9} /><rect x={x - 30} y={sy - 40} width={bw + 60} height={114} fill={sc} opacity={0.35} filter="url(#bL)" /></g>); }
		x += bw + 6 + R() * 20;
	}
	return <g filter={blur ? `url(#${blur})` : undefined}>{bs}</g>;
};
const Bokeh: React.FC<{seed?: number; n?: number; y0?: number; y1?: number; o?: number}> = ({seed = 2, n = 50, y0 = 100, y1 = 700, o = 1}) => {
	const R = rnd(seed);
	return <g filter="url(#bL)">{Array.from({length: n}, (_, i) => <circle key={i} cx={R() * W} cy={y0 + R() * (y1 - y0)} r={18 + R() * 60} fill={[C.mag, C.teal, C.amber, C.vio, '#ff6a3d'][i % 5]} opacity={(0.15 + R() * 0.3) * o} />)}</g>;
};
/** drops on the glass: each refracts a bit of the light behind it */
const Rain: React.FC<{seed?: number; n?: number; y0?: number; y1?: number; dawn?: boolean}> = ({seed = 5, n = 160, y0 = 0, y1 = H, dawn}) => {
	const R = rnd(seed);
	return <g>{Array.from({length: n}, (_, i) => {
		const x = R() * W, y = y0 + R() * (y1 - y0), r = 2.5 + R() * 8, c = dawn ? ['#ffd3a6', '#c9b8ff', '#ffe9d6'][i % 3] : [C.mag, C.teal, C.amber, C.vio, C.ice][Math.floor(R() * 5)];
		return <g key={i}>
			{R() < 0.3 && <path d={`M${x},${y - r} q${(R() - 0.5) * 6},${-(40 + R() * 110)} ${(R() - 0.5) * 8},${-(80 + R() * 160)}`} stroke={c} strokeWidth={r * 0.5} opacity={0.16} fill="none" strokeLinecap="round" />}
			<ellipse cx={x} cy={y} rx={r * 0.85} ry={r} fill="#0c0714" opacity={0.35} />
			<ellipse cx={x} cy={y + r * 0.25} rx={r * 0.7} ry={r * 0.6} fill={c} opacity={0.55} />
			<ellipse cx={x - r * 0.3} cy={y - r * 0.4} rx={r * 0.25} ry={r * 0.32} fill="#fff" opacity={0.75} />
		</g>; })}</g>;
};

// ---------------------------------------------------------------- the phone and ta's page (invented, generic feed)
const Phone: React.FC<{x: number; y: number; w: number; tilt?: number; banner?: boolean; off?: boolean; faceDown?: boolean}> = ({x, y, w, tilt = 0, banner, off, faceDown}) => {
	const h = w * 2.05, ink = '#e9ecf2', sub = '#8a93a6';
	if (faceDown) return <g transform={`translate(${x},${y}) rotate(${tilt})`}><rect x={-w / 2 - 8} y={-h / 2 - 8} width={w + 16} height={h + 16} rx={w * 0.13} fill="#1a1622" /><rect x={-w / 2 + 20} y={-h / 2 + 20} width={w * 0.34} height={w * 0.34} rx={w * 0.08} fill="#241f2e" /><circle cx={-w / 2 + 20 + w * 0.1} cy={-h / 2 + 20 + w * 0.1} r={w * 0.055} fill="#0e0b14" /><circle cx={-w / 2 + 20 + w * 0.24} cy={-h / 2 + 20 + w * 0.24} r={w * 0.055} fill="#0e0b14" /></g>;
	return (
		<g transform={`translate(${x},${y}) rotate(${tilt})`}>
			<rect x={-w / 2 - 10} y={-h / 2 - 10} width={w + 20} height={h + 20} rx={w * 0.13} fill="#05060a" />
			<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.11} fill={off ? '#07080c' : '#0f1116'} />
			{!off && <g transform={`translate(${-w / 2},${-h / 2}) scale(${w / 400})`}>
				<text x={36} y={50} style={{fontFamily: SANS, fontWeight: 700, fontSize: 22}} fill={ink}>02:13</text>
				<rect x={150} y={22} width={100} height={32} rx={16} fill="#000" />
				<rect x={0} y={70} width={400} height={230} fill="url(#sunset)" />
				<circle cx={280} cy={230} r={34} fill="#fff1c8" opacity={0.9} />
				<rect x={0} y={250} width={400} height={50} fill="#2b3a5c" opacity={0.85} />
				<circle cx={330} cy={300} r={44} fill="#c9cdd6" stroke="#0f1116" strokeWidth={6} />
				<path d="M306,322 C306,296 354,296 354,322 M318,288 a12,12 0 1,0 24,0 a12,12 0 1,0 -24,0" fill="#8a93a6" />
				<text x={300} y={290} textAnchor="end" style={{fontFamily: SANS, fontWeight: 900, fontSize: 30}} fill="#fff">ta</text>
				<circle cx={46} cy={384} r={24} fill="#c9cdd6" />
				<text x={84} y={378} style={{fontFamily: SANS, fontWeight: 700, fontSize: 22}} fill="#7a9bd5">ta</text>
				<text x={84} y={412} style={{fontFamily: SANS, fontSize: 21}} fill={ink}>今天的晚霞，很像那年。</text>
				<rect x={84} y={430} width={150} height={150} rx={6} fill="#ff9a6a" /><rect x={84} y={520} width={150} height={60} fill="#3a4a6a" opacity={0.8} /><circle cx={190} cy={480} r={16} fill="#fff1c8" />
				<text x={84} y={612} style={{fontFamily: SANS, fontSize: 18}} fill={sub}>2小时前</text>
				<rect x={330} y={596} width={44} height={24} rx={6} fill="#2a2f3a" /><circle cx={344} cy={608} r={3} fill={sub} /><circle cx={356} cy={608} r={3} fill={sub} />
				<line x1={0} y1={650} x2={400} y2={650} stroke={sub} opacity={0.25} />
				<circle cx={46} cy={700} r={24} fill="#c9cdd6" opacity={0.6} /><rect x={84} y={684} width={180} height={18} rx={9} fill={sub} opacity={0.3} /><rect x={84} y={712} width={240} height={14} rx={7} fill={sub} opacity={0.2} />
				{banner && <g><rect x={14} y={76} width={372} height={104} rx={22} fill="#262a34" opacity={0.96} /><rect x={32} y={96} width={40} height={40} rx={10} fill="#ffcf5a" /><path d="M42,106 h20 M42,116 h20 M42,126 h12" stroke="#5a4a1a" strokeWidth={3} />
					<text x={86} y={112} style={{fontFamily: SANS, fontWeight: 700, fontSize: 18}} fill="#aab2c2">备忘录 · 提醒</text><text x={86} y={150} style={{fontFamily: SANS, fontWeight: 900, fontSize: 26}} fill="#fff">说好不再看了。第37天</text></g>}
			</g>}
			<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.11} fill="url(#glass)" opacity={off ? 0.12 : 0.22} />
		</g>
	);
};
const TaPhoto: React.FC<{x: number; y: number; r?: number; s?: number}> = ({x, y, r = 0, s = 1}) => (
	<g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>
		<rect x={-150} y={-190} width={300} height={360} rx={8} fill="#000" opacity={0.4} filter="url(#bM)" transform="translate(10,14)" />
		<rect x={-150} y={-190} width={300} height={360} rx={8} fill="#f4efe6" />
		<rect x={-130} y={-170} width={260} height={260} fill="url(#sunset)" />
		<path d="M-40,90 C-40,30 40,30 40,90 Z M-22,10 a22,22 0 1,0 44,0 a22,22 0 1,0 -44,0" fill="#1a1426" />
		<text x={0} y={140} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 700, fontSize: 34}} fill="#2a2030">ta</text>
	</g>
);

// ---------------------------------------------------------------- the brain as a night city (side view, facing left)
const BRAIN = 'M180,420 C150,300 220,170 360,120 C470,80 600,70 700,110 C820,150 905,240 912,340 C918,420 880,470 820,492 C842,540 822,602 760,612 C700,622 652,592 622,562 C560,582 482,584 420,562 C360,602 282,602 232,562 C192,532 180,482 180,420 Z';
const SULCI = ['M300,200 C340,260 330,320 380,360', 'M430,130 C440,200 470,240 450,300', 'M560,100 C560,170 600,210 590,270', 'M690,130 C670,190 700,240 720,290', 'M800,190 C770,240 790,300 820,330', 'M260,330 C320,330 360,300 420,320', 'M480,360 C540,330 620,350 690,330', 'M300,470 C380,440 470,470 560,450 C640,440 720,460 800,440', 'M360,240 C420,230 470,260 520,240'];
const CEREB = 'M700,560 C720,520 800,505 850,530 C890,555 880,610 830,625 C780,640 720,620 700,590 Z';
const STEM = 'M600,560 C610,600 615,650 630,700 L670,700 C660,650 660,600 655,565 Z';
const REG = {ofc: [270, 430] as Pt, nacc: [430, 455] as Pt, vta: [585, 540] as Pt, put: [500, 420] as Pt, s2: [560, 330] as Pt};
type Lit = {p: Pt; c: string; a?: number; label?: string; ldx?: number; ldy?: number};
let bid = 0;
const BrainCity: React.FC<{x: number; y: number; s: number; lit?: Lit[]; glow?: string; labelSize?: number; lights?: number}> = ({x, y, s, lit = [], glow = C.vio, labelSize = 56, lights = 1}) => {
	const id = `bc${bid++}`, R = rnd(40);
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			<path d={CEREB} fill="#120d1e" stroke={glow} strokeWidth={4} opacity={0.85} /><path d={STEM} fill="#120d1e" stroke={glow} strokeWidth={4} opacity={0.85} />
			<path d={BRAIN} fill="none" stroke={glow} strokeWidth={14} opacity={0.4} filter="url(#bM)" />
			<path d={BRAIN} fill="#130e22" />
			<clipPath id={id}><path d={BRAIN} /></clipPath>
			<g clipPath={`url(#${id})`}>
				{Array.from({length: 26}, (_, i) => <line key={'v' + i} x1={150 + i * 30} y1={60} x2={190 + i * 30} y2={640} stroke="#2e2648" strokeWidth={2.5} />)}
				{Array.from({length: 20}, (_, i) => <line key={'h' + i} x1={140} y1={70 + i * 30} x2={930} y2={60 + i * 30} stroke="#2e2648" strokeWidth={2.5} />)}
				{Array.from({length: 260}, (_, i) => <rect key={i} x={160 + R() * 760} y={90 + R() * 520} width={9} height={9} fill={R() < 0.15 ? C.ice : '#ffcf8a'} opacity={(0.12 + R() * 0.35) * lights} />)}
			</g>
			{SULCI.map((d, i) => <path key={i} d={d} stroke="#4a3d74" strokeWidth={6} fill="none" strokeLinecap="round" />)}
			<path d={BRAIN} fill="none" stroke={glow} strokeWidth={4} />
			{lit.map((r, i) => { const a = r.a ?? 1; return (
				<g key={i} opacity={Math.max(0.08, a)}>
					<circle cx={r.p[0]} cy={r.p[1]} r={120} fill={r.c} opacity={0.4 * a} filter="url(#bL)" />
					<circle cx={r.p[0]} cy={r.p[1]} r={48} fill={r.c} opacity={0.7 * a} filter="url(#bM)" />
					<circle cx={r.p[0]} cy={r.p[1]} r={14} fill="#fff" opacity={a} />
					{[0, 1, 2].map((k) => <circle key={k} cx={r.p[0]} cy={r.p[1]} r={30 + k * 28} fill="none" stroke={r.c} strokeWidth={3} opacity={(0.65 - k * 0.2) * a} />)}
					{r.label && <><line x1={r.p[0]} y1={r.p[1]} x2={r.p[0] + (r.ldx ?? 0)} y2={r.p[1] + (r.ldy ?? 0)} stroke={r.c} strokeWidth={3} />
						<text x={r.p[0] + (r.ldx ?? 0) + ((r.ldx ?? 0) < 0 ? -14 : 14)} y={r.p[1] + (r.ldy ?? 0) + labelSize * 0.35} textAnchor={(r.ldx ?? 0) < 0 ? 'end' : 'start'} style={{fontFamily: SANS, fontWeight: 900, fontSize: labelSize}} fill="#fff" stroke="#120a1c" strokeWidth={labelSize * 0.12} paintOrder="stroke">{r.label}</text></>}
				</g>); })}
		</g>
	);
};
const Frame: React.FC<{bg?: string; children: React.ReactNode; html?: React.ReactNode}> = ({bg = '#120a1c', children, html}) => (
	<AbsoluteFill style={{background: bg}}>
		<svg width={W} height={H} style={{position: 'absolute', inset: 0}}><Defs />{children}<Grain /></svg>
		{html}
	</AbsoluteFill>
);
const PlumBG: React.FC<{cx?: number; cy?: number}> = ({cx = 0.5, cy = 0.42}) => (
	<><radialGradient id={`pbg${cx}${cy}`} cx={cx} cy={cy} r="0.8"><stop offset="0" stopColor="#3a1f52" /><stop offset="0.55" stopColor="#21122f" /><stop offset="1" stopColor="#0f0817" /></radialGradient>
		<rect width={W} height={H} fill={`url(#pbg${cx}${cy})`} /></>
);

// ================================================================ the frames
// 1 · 02:13 — the room. Key light: the phone. Through the window, the city in the rain.
const F01 = () => (
	<Frame html={<Sub t="凌晨两点，你又点开了ta的朋友圈" />}>
		<rect width={W} height={700} fill="url(#skyN)" />
		<City seed={11} y0={720} />
		<Bokeh seed={3} n={40} o={0.9} />
		<Rain seed={5} n={170} y1={680} />
		<rect width={W} height={700} fill="#1a0d26" opacity={0.18} />
		{/* window frame and wall */}
		<rect x={0} y={0} width={W} height={38} fill="#0b0710" /><rect x={944} y={0} width={32} height={690} fill="#0b0710" /><rect x={0} y={668} width={W} height={50} fill="#0b0710" />
		<rect x={0} y={718} width={W} height={362} fill="#171225" />
		{/* bed + sheets lit by the screen */}
		<path d="M-40,790 C300,742 700,770 1000,752 C1300,736 1600,764 1980,738 L1980,1100 L-40,1100 Z" fill="#232036" />
		{[0, 1, 2, 3].map((i) => <path key={i} d={`M${100 + i * 90},${830 + i * 55} C${500 + i * 50},${780 + i * 55} ${900},${860 + i * 30} ${1500 - i * 50},${820 + i * 55}`} stroke="#0f0d18" strokeWidth={10} opacity={0.5} fill="none" filter="url(#bS)" />)}
		<ellipse cx={1180} cy={870} rx={600} ry={220} fill={C.ice} opacity={0.2} filter="url(#bXL)" />
		<ellipse cx={1180} cy={860} rx={300} ry={120} fill="#d8f6ff" opacity={0.22} filter="url(#bL)" />
		{/* the nightstand and its clock */}
		<rect x={150} y={640} width={300} height={440} rx={6} fill="#120e1c" /><rect x={150} y={640} width={300} height={14} fill="#1e1830" />
		<rect x={210} y={560} width={180} height={82} rx={14} fill="#0b0912" />
		<text x={300} y={618} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 300, fontSize: 52, letterSpacing: '0.06em'}} fill="#ff6a5c" filter="url(#bS)">02:13</text>
		<text x={300} y={618} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 300, fontSize: 52, letterSpacing: '0.06em'}} fill="#ffb0a6">02:13</text>
		<ellipse cx={300} cy={600} rx={160} ry={60} fill="#ff6a5c" opacity={0.18} filter="url(#bL)" />
		{/* a cinema ticket on the sheet, and the phone */}
		<g transform="translate(820,880) rotate(-14)"><rect x={-120} y={-40} width={240} height={80} rx={6} fill="#c9b8a0" opacity={0.85} /><line x1={60} y1={-40} x2={60} y2={40} stroke="#6a5a44" strokeDasharray="5 5" /><text x={-100} y={8} style={{fontFamily: SANS, fontWeight: 700, fontSize: 22}} fill="#4a3a2a">7排 8号 · 9号</text></g>
		<Phone x={1180} y={640} w={250} tilt={-14} />
	</Frame>
);
// 2 · 明明说好 — push in to the screen: her own reminder sits on top of ta's page.
const F02 = () => (
	<Frame html={<Sub t="明明说好，不再看了" />}>
		<rect width={W} height={H} fill="#1c1a2c" />
		<Bokeh seed={8} n={26} y0={0} y1={1080} o={0.7} />
		<ellipse cx={1060} cy={560} rx={800} ry={520} fill={C.ice} opacity={0.18} filter="url(#bXL)" />
		{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M-100,${200 + i * 200} C500,${120 + i * 210} 1100,${260 + i * 190} 2000,${170 + i * 200}`} stroke="#0d0b16" strokeWidth={40} opacity={0.35} fill="none" filter="url(#bL)" />)}
		<Phone x={1040} y={560} w={420} tilt={-7} banner />
	</Frame>
);
// 3 · title — rack focus from the screen to the window: the question is a neon sign on the wet glass.
const F03 = () => (
	<Frame html={<div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: SANS, color: C.ink}}>
		<div style={{fontSize: 92, fontWeight: 700, letterSpacing: '0.08em', textShadow: neon(C.teal)}}>{pull('分手以后，', 0.08)}</div>
		<div style={{fontSize: 138, fontWeight: 900, letterSpacing: '0.04em', marginTop: 34, textShadow: neon(C.mag)}}>{pull('为什么反而更放不下？')}</div>
	</div>}>
		<rect width={W} height={H} fill="url(#skyN)" />
		<City seed={12} y0={1000} blur="bL" />
		<Bokeh seed={4} n={50} y0={0} y1={1080} o={0.8} />
		<rect width={W} height={H} fill="#140a1e" opacity={0.45} />
		<Rain seed={6} n={220} />
	</Frame>
);
// 4 · 2010 — through the glass to the block across the street: 15 windows still lit by a phone.
const LIT15 = (() => { const R = rnd(77), s = new Set<number>(); while (s.size < 15) s.add(Math.floor(R() * 90)); return s; })();
const F04 = () => (
	<Frame html={<><Header t="2010 · 美国" /><Tag x={1480} y={380} t={<><span style={{fontSize: 150}}>15</span> 人</>} c={C.mag} glow size={64} w={420} /><Tag x={1490} y={600} t={<>刚被分手<br />却还爱着对方</>} size={52} w={420} /><Sub t="她找来15个刚被分手的人" /></>}>
		<rect width={W} height={H} fill="url(#skyN)" />
		<City seed={21} y0={1080} blur="bL" lights={0.6} />
		<g transform="translate(330,150)">
			<rect x={-30} y={-30} width={1080} height={1100} fill="#1d1430" />
			{Array.from({length: 90}, (_, i) => { const cx = i % 10, cy = Math.floor(i / 10), x = cx * 102, y = cy * 108, lit = LIT15.has(i);
				return <g key={i}>
					<rect x={x} y={y} width={78} height={80} fill={lit ? '#1b3550' : '#140e20'} />
					{lit && <><rect x={x} y={y} width={78} height={80} fill={C.ice} opacity={0.35} /><ellipse cx={x + 39} cy={y + 60} rx={30} ry={18} fill="#e6fbff" opacity={0.7} filter="url(#bS)" /><rect x={x - 10} y={y - 10} width={98} height={100} fill={C.ice} opacity={0.25} filter="url(#bM)" />
						<path d={`M${x},${y} L${x + 22},${y} C${x + 18},${y + 40} ${x + 22},${y + 60} ${x + 14},${y + 80} L${x},${y + 80} Z`} fill="#2a2440" /></>}
					{!lit && <rect x={x + 4} y={y + 4} width={30} height={10} fill={[C.mag, C.teal, C.amber][i % 3]} opacity={0.12} />}
				</g>; })}
		</g>
		<g opacity={0.5}>{Array.from({length: 120}, (_, i) => { const R = rnd(300 + i); const x = R() * W, y = R() * H; return <line key={i} x1={x} y1={y} x2={x - 8} y2={y + 60} stroke="#cfd8ff" strokeWidth={1.5} opacity={0.35} />; })}</g>
	</Frame>
);
// 5 · 85% — into one of those windows: their waking day as a ring.
const ring = (cx: number, cy: number, r: number, a0: number, a1: number) => { const p = (a: number) => [cx + r * Math.sin(a * 2 * Math.PI), cy - r * Math.cos(a * 2 * Math.PI)]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return `M${x0},${y0} A${r},${r} 0 ${a1 - a0 > 0.5 ? 1 : 0} 1 ${x1},${y1}`; };
const F05 = () => (
	<Frame html={<><Tag x={960} y={470} anchor="c" t="85%" size={170} c={C.mag} glow /><Tag x={960} y={610} anchor="c" t="在想那个人" size={56} /><Tag x={960} y={160} anchor="c" t="醒着的时间" size={44} c="rgba(255,255,255,0.8)" /><Sub t="醒着的时间里，85%都在想那个人" /></>}>
		<PlumBG />
		<rect x={260} y={60} width={1400} height={860} fill="#1b2a44" opacity={0.6} />
		<ellipse cx={960} cy={700} rx={600} ry={300} fill={C.ice} opacity={0.14} filter="url(#bXL)" />
		<rect x={240} y={40} width={1440} height={30} fill="#0c0814" /><rect x={240} y={900} width={1440} height={30} fill="#0c0814" /><rect x={240} y={40} width={30} height={890} fill="#0c0814" /><rect x={1650} y={40} width={30} height={890} fill="#0c0814" />
		<Rain seed={9} n={90} y0={60} y1={900} />
		<path d={ring(960, 480, 270, 0, 0.9999)} stroke="#2e3a52" strokeWidth={34} fill="none" />
		<path d={ring(960, 480, 270, 0.85, 0.999)} stroke={C.teal} strokeWidth={34} fill="none" opacity={0.75} />
		<path d={ring(960, 480, 270, 0, 0.85)} stroke={C.mag} strokeWidth={50} fill="none" opacity={0.6} filter="url(#bM)" />
		<path d={ring(960, 480, 270, 0, 0.85)} stroke={C.mag} strokeWidth={34} fill="none" />
		<path d={ring(960, 480, 270, 0, 0.85)} stroke="#ffd0e4" strokeWidth={6} fill="none" />
	</Frame>
);
// 6 · the scan — the ring becomes the scanner's bore; at its end, ta's photo on the mirror screen.
const F06 = () => (
	<Frame html={<><Header t="2010 · 美国" /><Sub t="让他们躺进扫描仪，看对方的照片" /></>}>
		<rect width={W} height={H} fill="#0e1424" />
		{Array.from({length: 14}, (_, i) => { const k = Math.pow(0.82, i), rw = 1500 * k, rh = 1100 * k; return <rect key={i} x={960 - rw / 2} y={470 - rh / 2} width={rw} height={rh} rx={rh * 0.5} fill={i === 0 ? '#18223a' : 'none'} stroke={i % 2 ? C.teal : C.vio} strokeWidth={6 * k + 1} opacity={0.15 + 0.05 * (14 - i) / 2} />; })}
		<ellipse cx={960} cy={470} rx={420} ry={300} fill={C.teal} opacity={0.12} filter="url(#bXL)" />
		<g transform="translate(960,470)"><rect x={-170} y={-120} width={340} height={240} rx={10} fill="#05060a" /><rect x={-158} y={-108} width={316} height={216} fill="url(#sunset)" />
			<path d="M-46,108 C-46,46 46,46 46,108 Z M-24,22 a24,24 0 1,0 48,0 a24,24 0 1,0 -48,0" fill="#1a1426" /><rect x={-230} y={-170} width={460} height={340} fill="#ffb48a" opacity={0.25} filter="url(#bL)" /></g>
		<rect x={0} y={598} width={W} height={4} fill={C.teal} opacity={0.9} /><rect x={0} y={570} width={W} height={60} fill={C.teal} opacity={0.18} filter="url(#bM)" />
		<path d="M0,1080 L560,760 L1360,760 L1920,1080 Z" fill="#141c30" />
	</Frame>
);
// 7 · it lights up — the photo's light runs into the brain, drawn as a night city.
const F07 = () => (
	<Frame html={<Sub t="亮起来的，是大脑的奖赏系统" />}>
		<PlumBG cx={0.6} />
		<Bokeh seed={9} n={24} o={0.5} />
		<TaPhoto x={330} y={470} r={-6} />
		<path d="M480,430 C620,380 740,430 840,490" stroke={C.mag} strokeWidth={8} fill="none" filter="url(#bS)" /><path d="M480,430 C620,380 740,430 840,490" stroke="#fff" strokeWidth={2.5} fill="none" />
		<BrainCity x={660} y={90} s={0.95} lit={[{p: REG.vta, c: C.mag, label: '奖赏系统', ldx: 320, ldy: 100}, {p: REG.nacc, c: '#ff6a3d', label: '渴求', ldx: -170, ldy: 200}, {p: REG.ofc, c: C.amber, a: 0.7}]} />
	</Frame>
);
// 8 · the small acts — each one runs a line to the same lit spot.
const F08 = () => {
	const tgt: Pt = [1000 + 585 * 0.78, 200 + 540 * 0.78];
	const acts: {y: number; t: string; icon: React.ReactNode}[] = [
		{y: 250, t: '翻ta的动态', icon: <g><rect x={-26} y={-46} width={52} height={92} rx={10} fill="#0f1116" stroke={C.ice} strokeWidth={4} /><rect x={-18} y={-34} width={36} height={26} fill="url(#sunset)" /></g>},
		{y: 480, t: '听你们的歌', icon: <g><circle cx={0} cy={0} r={44} fill="none" stroke={C.amber} strokeWidth={5} /><path d="M-12,-20 L22,0 L-12,20 Z" fill={C.amber} /></g>},
		{y: 710, t: '假装路过', icon: <g><rect x={-6} y={-10} width={12} height={60} fill="#5a5470" /><rect x={-60} y={-50} width={120} height={46} rx={6} fill={C.teal} /><text x={0} y={-17} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 22}} fill="#08201e">ta家楼下</text></g>},
	];
	return (
		<Frame html={<>{acts.map((a, i) => <Tag key={i} x={330} y={a.y} t={a.t} size={56} />)}<Sub t="所以你会翻ta的动态、听你们的歌" /></>}>
			<PlumBG cx={0.65} />
			{acts.map((a, i) => <g key={i}><path d={`M640,${a.y} C900,${a.y} ${tgt[0] - 300},${tgt[1]} ${tgt[0]},${tgt[1]}`} stroke={[C.ice, C.amber, C.teal][i]} strokeWidth={6} fill="none" opacity={0.5} filter="url(#bS)" /><path d={`M640,${a.y} C900,${a.y} ${tgt[0] - 300},${tgt[1]} ${tgt[0]},${tgt[1]}`} stroke="#fff" strokeWidth={2} fill="none" opacity={0.8} />
				<g transform={`translate(240,${a.y})`}><circle r={78} fill={[C.ice, C.amber, C.teal][i]} opacity={0.18} filter="url(#bM)" />{a.icon}</g></g>)}
			<BrainCity x={1000} y={200} s={0.78} lit={[{p: REG.vta, c: C.mag}]} />
		</Frame>
	);
};
// 9 · 2011 — the heat probe and the break-up: two maps that share ground.
const F09 = () => (
	<Frame html={<><Header t="2011 · 美国" /><Tag x={300} y={850} anchor="c" w={500} t="像滚烫的咖啡杯" size={48} /><Tag x={1660} y={250} t="被烫" size={56} c={C.amber} glow w={300} /><Tag x={1660} y={360} t="被分手" size={56} c={C.mag} glow w={300} /><Tag x={1080} y={150} anchor="c" t="一部分相同的脑区" size={48} /><Sub t="两种痛，点亮了一部分相同的脑区" /></>}>
		<PlumBG cx={0.6} />
		{/* the cup */}
		<g transform="translate(300,560)">
			<ellipse cx={0} cy={60} rx={260} ry={200} fill={C.amber} opacity={0.22} filter="url(#bXL)" />
			{[0, 1, 2].map((k) => <path key={k} d={`M${-50 + k * 50},-120 c-30,-40 30,-70 0,-120 c-30,-40 30,-70 0,-110`} stroke="#ffd9a8" strokeWidth={8} fill="none" opacity={0.45} filter="url(#bS)" strokeLinecap="round" />)}
			<path d="M-120,-100 L120,-100 L100,170 Q96,200 66,200 L-66,200 Q-96,200 -100,170 Z" fill="#2a1a24" stroke={C.amber} strokeWidth={6} />
			<path d="M120,-40 C200,-40 200,100 108,110" stroke={C.amber} strokeWidth={14} fill="none" />
			<ellipse cx={0} cy={-100} rx={120} ry={22} fill="#ff8a3c" /><ellipse cx={0} cy={-100} rx={120} ry={22} fill="none" stroke="#ffd9a8" strokeWidth={4} />
		</g>
		<BrainCity x={640} y={160} s={0.95} lights={0.5} lit={[]} />
		<g transform="translate(640,160) scale(0.95)" style={{mixBlendMode: 'screen'}}>
			<ellipse cx={540} cy={300} rx={190} ry={130} fill={C.amber} opacity={0.55} filter="url(#bM)" />
			<ellipse cx={660} cy={350} rx={190} ry={130} fill={C.mag} opacity={0.55} filter="url(#bM)" />
			<ellipse cx={600} cy={325} rx={80} ry={70} fill="#fff" opacity={0.75} filter="url(#bM)" />
		</g>
		<line x1={1080} y1={185} x2={1215} y2={460} stroke="#fff" strokeWidth={3} />
	</Frame>
);
// 10 · 464 — every dot is one person after a break-up: the more they checked, the worse.
const F10 = () => {
	const R = rnd(464), ox = 420, oy = 780, ww = 1180, hh = 560;
	const pts = Array.from({length: 464}, () => { const u = Math.pow(R(), 1.3), v = Math.min(1, Math.max(0.02, 0.18 + 0.62 * u + (R() + R() + R() - 1.5) * 0.24)); return [ox + u * ww, oy - v * hh, v] as const; });
	return (
		<Frame html={<><Header t="2012 · 英国" /><Tag x={ox + ww} y={oy + 52} anchor="r" t="偷看前任主页 →" size={48} /><Tag x={ox + 20} y={oy - hh - 10} t="↑ 越难过 · 越想念" size={48} w={600} /><Tag x={ox + ww - 30} y={oy - 110} anchor="r" t={<><span style={{fontSize: 110}}>464</span> 人</>} size={56} c={C.teal} glow w={400} /><Sub t="越常偷看前任主页，越难过，也越想念" /></>}>
			<PlumBG />
			<line x1={ox} y1={oy} x2={ox + ww} y2={oy} stroke="#8a7fa8" strokeWidth={3} /><line x1={ox} y1={oy} x2={ox} y2={oy - hh} stroke="#8a7fa8" strokeWidth={3} />
			{pts.map(([x, y, v], i) => <circle key={i} cx={x} cy={y} r={7} fill={v > 0.55 ? C.mag : v > 0.35 ? C.vio : C.teal} opacity={0.85} />)}
			<path d={`M${ox},${oy - 0.18 * hh} L${ox + ww},${oy - 0.8 * hh}`} stroke={C.mag} strokeWidth={16} opacity={0.45} filter="url(#bM)" /><path d={`M${ox},${oy - 0.18 * hh} L${ox + ww},${oy - 0.8 * hh}`} stroke="#ffd0e4" strokeWidth={4} />
		</Frame>
	);
};
// 11 · time — the same district, as the days pass, goes quiet.
const F11 = () => (
	<Frame html={<><Tag x={330} y={760} anchor="c" w={500} t="刚分开" size={52} /><Tag x={960} y={760} anchor="c" w={500} t="几周后" size={52} /><Tag x={1590} y={760} anchor="c" w={500} t="更久以后" size={52} /><Tag x={960} y={150} anchor="c" t="和依恋有关的区域" size={52} c={C.mag} glow w={900} /><Sub t="分开越久，这个区域就越安静" /></>}>
		<PlumBG />
		{[1, 0.5, 0.15].map((a, i) => <BrainCity key={i} x={330 + 630 * i - 270} y={330} s={0.54} labelSize={0} lights={0.4 + 0.6 * a} lit={[{p: REG.put, c: C.mag, a}]} />)}
		<path d="M200,860 L1720,860" stroke="#8a7fa8" strokeWidth={3} /><path d="M1700,846 L1724,860 L1700,874" stroke="#8a7fa8" strokeWidth={3} fill="none" />
	</Frame>
);
// 12 · 2017 — the spray for "emotional pain"; the label peels: saline.
const F12 = () => (
	<Frame html={<><Header t="2017 · 美国" /><Sub t="其实，那只是生理盐水" /></>}>
		<PlumBG />
		<ellipse cx={960} cy={540} rx={420} ry={420} fill={C.mag} opacity={0.14} filter="url(#bXL)" />
		<g transform="translate(960,640) scale(1.12)">
			{Array.from({length: 70}, (_, i) => { const R = rnd(900 + i); const a = -Math.PI / 2 + (R() - 0.5) * 0.9, d = 30 + R() * 170; return <circle key={i} cx={Math.cos(a) * d} cy={-330 + Math.sin(a) * d} r={2 + R() * 5} fill="#dff8ff" opacity={0.55 * (1 - d / 210)} />; })}
			<rect x={-26} y={-330} width={52} height={110} rx={20} fill="#e9e4f2" /><rect x={-60} y={-232} width={120} height={36} rx={8} fill="#cfc8de" />
			<rect x={-150} y={-200} width={300} height={460} rx={60} fill="#2a2140" stroke="#efe8ff" strokeWidth={4} opacity={0.95} />
			<rect x={-150} y={-200} width={60} height={460} rx={30} fill="#fff" opacity={0.12} />
			<rect x={128} y={-180} width={14} height={420} rx={7} fill={C.mag} opacity={0.7} filter="url(#bS)" />
			{/* under the label: what it really is */}
			<rect x={-120} y={-60} width={240} height={290} rx={8} fill="#e8f6f4" />
			<text x={0} y={178} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 46}} fill="#0f6a62">生理盐水</text>
			<text x={0} y={214} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 700, fontSize: 26}} fill="#2a8a80">0.9% NaCl</text>
			{/* the label, its lower half peeled back */}
			<path d="M-120,-60 L120,-60 L120,-10 L-120,96 Z" fill="#fff4fa" />
			<path d="M120,-10 L-120,96 L170,150 Z" fill="#d9c8e6" opacity={0.95} />
			<text x={-104} y={-20} style={{fontFamily: SANS, fontWeight: 900, fontSize: 30}} fill="#c21d62">情绪止痛喷剂</text>
			<text x={-104} y={20} style={{fontFamily: SANS, fontWeight: 700, fontSize: 22}} fill="#6a4a5a">强效 · 快速</text>
		</g>
	</Frame>
);
// 13 · dawn — back in the room. The rain has stopped; the phone lies face down; the first light.
const F13 = () => (
	<Frame bg="#1d1a30" html={<Sub t="给它一点时间，也别再给它“补一口”" />}>
		<linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#262a5c" /><stop offset="0.45" stopColor="#6a5ea8" /><stop offset="0.78" stopColor="#e89aa0" /><stop offset="1" stopColor="#ffd3a6" /></linearGradient>
		<rect width={W} height={700} fill="url(#dawn)" />
		<ellipse cx={1300} cy={700} rx={700} ry={220} fill="#ffd9a8" opacity={0.6} filter="url(#bXL)" />
		<City seed={11} y0={720} dawn />
		<Rain seed={5} n={60} y1={680} dawn />
		<rect x={0} y={0} width={W} height={38} fill="#1a1626" /><rect x={944} y={0} width={32} height={690} fill="#1a1626" /><rect x={0} y={668} width={W} height={50} fill="#1a1626" />
		<rect x={0} y={718} width={W} height={362} fill="#2a2538" />
		<path d="M-40,790 C300,742 700,770 1000,752 C1300,736 1600,764 1980,738 L1980,1100 L-40,1100 Z" fill="#3c3650" />
		<path d="M700,760 L1500,760 L1980,1080 L300,1080 Z" fill="#ffcf9a" opacity={0.18} filter="url(#bL)" />
		<rect x={150} y={640} width={300} height={440} rx={6} fill="#221d30" /><rect x={210} y={560} width={180} height={82} rx={14} fill="#16121e" />
		<text x={300} y={618} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 300, fontSize: 52}} fill="#c98a84">06:40</text>
		<ellipse cx={1190} cy={905} rx={300} ry={50} fill="#120e1a" opacity={0.5} filter="url(#bM)" /><Phone x={1180} y={880} w={210} tilt={-78} faceDown />
	</Frame>
);
// 14 · end card
const F14 = () => (
	<Frame html={<>
		<div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 96, color: C.ink, lineHeight: 1.35, textShadow: neon(C.mag)}}>{pull('你花了多久，')}<br />{pull('才真的放下？')}</div>
		<div style={{position: 'absolute', left: 0, right: 0, top: 650, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 48, color: 'rgba(255,240,250,0.85)', letterSpacing: '0.2em'}}><span style={{marginRight: '-0.2em'}}>评论区说说</span></div>
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 50, textAlign: 'center', fontFamily: SANS, fontSize: 22, color: 'rgba(255,240,250,0.55)', lineHeight: 1.6}}>Fisher et al. 2010, J Neurophysiol · Kross et al. 2011, PNAS · Marshall 2012, Cyberpsychol Behav Soc Netw · Koban et al. 2017, J Neurosci</div>
	</>}>
		<PlumBG />
		<g opacity={0.35}><BrainCity x={500} y={150} s={0.95} lights={0.4} /></g>
		<rect width={W} height={H} fill="#120a1c" opacity={0.35} />
	</Frame>
);

const FRAMES = [F01, F02, F03, F04, F05, F06, F07, F08, F09, F10, F11, F12, F13, F14];
const Board36: React.FC = () => { const f = useCurrentFrame(); const F = FRAMES[f % FRAMES.length]; bid = 0; return <F />; };
registerRoot(() => <Composition id="BOARD36" component={Board36} durationInFrames={FRAMES.length} fps={30} width={W} height={H} />);
