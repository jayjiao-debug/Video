// ep38 兰彻斯特平方律 — visual storyboard: the picture explains, subtitles only name it.
// World: a dark war-room map table under one warm lamp; armies are glowing dots (blue = you, red = them).
import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';

const W = 1920, H = 1080, SANS = '"Noto Sans CJK SC", sans-serif';
const BLUE = '#4db4ff', RED = '#ff5a47', INK = '#f3efe6', AMBER = '#ffbf69';
const rnd = (seed: number) => { let s = (seed * 9973 + 12345) % 2147483647; for (let i = 0; i < 5; i++) s = (s * 16807) % 2147483647; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
const PUNCT = '？！。，：；、';
const pull = (t: string, ls = 0.04) => (PUNCT.includes(t.slice(-1)) ? <>{t.slice(0, -1)}<span style={{marginRight: `${-0.5 - ls}em`}}>{t.slice(-1)}</span></> : <>{t}</>);
const Sub: React.FC<{t: string}> = ({t}) => (
	<div style={{position: 'absolute', left: 0, right: 0, bottom: 60, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 64, color: '#fff', letterSpacing: '0.04em',
		textShadow: '0 0 3px rgba(6,10,12,0.95), 0 0 16px rgba(6,10,12,0.85), 0 4px 30px rgba(6,10,12,0.7)'}}>{pull(t)}</div>
);
const glowTxt = (c: string) => `0 0 4px ${c}, 0 0 18px ${c}, 0 0 44px ${c}`;
const Big: React.FC<{x: number; y: number; t: React.ReactNode; c?: string; size?: number; w?: number}> = ({x, y, t, c = INK, size = 120, w = 800}) => (
	<div style={{position: 'absolute', left: x - w / 2, top: y - size * 0.6, width: w, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: size, color: '#fff', textShadow: glowTxt(c), lineHeight: 1.2}}>{t}</div>
);
const Lbl: React.FC<{x: number; y: number; t: React.ReactNode; c?: string; size?: number; w?: number}> = ({x, y, t, c = 'rgba(243,239,230,0.85)', size = 44, w = 700}) => (
	<div style={{position: 'absolute', left: x - w / 2, top: y - size * 0.6, width: w, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: size, color: c, textShadow: '0 0 3px rgba(6,10,12,0.95), 0 0 14px rgba(6,10,12,0.8)'}}>{t}</div>
);

// ---------------------------------------------------------------- the map table
const Table: React.FC = () => {
	const R = rnd(3);
	return (
		<>
			<defs>
				<radialGradient id="tbl" cx="0.5" cy="0.38" r="0.85"><stop offset="0" stopColor="#2b3a3f" /><stop offset="0.55" stopColor="#172226" /><stop offset="1" stopColor="#0a1012" /></radialGradient>
				<filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.5" /></filter>
				<filter id="glL" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22" /></filter>
				<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.07 0" /></filter>
			</defs>
			<rect width={W} height={H} fill="url(#tbl)" />
			{/* contour lines of the terrain printed on the map */}
			{Array.from({length: 9}, (_, i) => { const y0 = 120 + i * 110; return <path key={i} d={`M-50,${y0} ${Array.from({length: 12}, (_, k) => `Q${k * 180 + 90},${y0 + (R() - 0.5) * 120} ${(k + 1) * 180},${y0 + (R() - 0.5) * 50}`).join(' ')}`} stroke="#3c5157" strokeWidth={1.5} fill="none" opacity={0.45} />; })}
			{Array.from({length: 21}, (_, i) => <line key={'g' + i} x1={i * 96} y1={0} x2={i * 96} y2={H} stroke="#33464c" strokeWidth={1} opacity={0.35} />)}
			{Array.from({length: 12}, (_, i) => <line key={'h' + i} x1={0} y1={i * 96} x2={W} y2={i * 96} stroke="#33464c" strokeWidth={1} opacity={0.35} />)}
			<ellipse cx={960} cy={380} rx={900} ry={520} fill={AMBER} opacity={0.08} filter="url(#glL)" />
		</>
	);
};
const Grain = () => <rect width={W} height={H} filter="url(#grain)" />;
const Frame: React.FC<{children: React.ReactNode; html?: React.ReactNode}> = ({children, html}) => (
	<AbsoluteFill style={{background: '#0a1012'}}><svg width={W} height={H} style={{position: 'absolute', inset: 0}}><Table />{children}<Grain /></svg>{html}</AbsoluteFill>
);

/** an army as a block of glowing dots; `alive` < 1 leaves the rest as faded casualties */
const Army: React.FC<{x: number; y: number; cols: number; rows: number; gap?: number; c: string; alive?: number; seed?: number; r?: number}> = ({x, y, cols, rows, gap = 17.5, c, alive = 1, seed = 1, r = 5}) => {
	const R = rnd(seed), dots: React.ReactNode[] = [], glow: React.ReactNode[] = [];
	for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
		const cx = x + i * gap + gap / 2, cy = y + j * gap + gap / 2, up = R() < alive;
		if (up) { dots.push(<circle key={`${i}-${j}`} cx={cx} cy={cy} r={r} fill={c} />); glow.push(<circle key={`g${i}-${j}`} cx={cx} cy={cy} r={r * 2} fill={c} opacity={0.35} />); }
		else dots.push(<g key={`${i}-${j}`} opacity={0.35}><line x1={cx - 3} y1={cy - 3} x2={cx + 3} y2={cy + 3} stroke={c} strokeWidth={1.5} /><line x1={cx - 3} y1={cy + 3} x2={cx + 3} y2={cy - 3} stroke={c} strokeWidth={1.5} /></g>);
	}
	return <g><g filter="url(#gl)">{glow}</g>{dots}</g>;
};
const Sq: React.FC<{x: number; y: number; s: number; c: string; fillO?: number; dash?: boolean; dots?: boolean}> = ({x, y, s, c, fillO = 0.18, dash, dots = true}) => {
	const n = Math.round(s / 17.5);
	return <g>
		<rect x={x} y={y} width={s} height={s} fill={c} opacity={fillO} />
		{dots && <Army x={x} y={y} cols={n} rows={n} c={c} r={3.6} gap={s / n} />}
		<rect x={x} y={y} width={s} height={s} fill="none" stroke={c} strokeWidth={4} strokeDasharray={dash ? '14 10' : undefined} />
	</g>;
};

// ================================================================ keyframes
// 1 · the question: 1000 vs 500, everyone has a rifle
const K1 = () => (
	<Frame html={<><Big x={520} y={190} t="1000" c={BLUE} /><Big x={1440} y={190} t="500" c={RED} /><Sub t="打完，你还剩几个人？" /></>}>
		<Army x={170} y={300} cols={40} rows={25} gap={17.5} c={BLUE} seed={2} />
		<Army x={1265} y={300} cols={20} rows={25} gap={17.5} c={RED} seed={3} />
	</Frame>
);
// 2 · swords: one-for-one — the front pairs vanish together; 500 left
const K2 = () => (
	<Frame html={<><Lbl x={960} y={110} t="拼刀：一换一" size={56} c={INK} /><Big x={520} y={230} t="500" c={BLUE} size={110} /><Sub t="冷兵器时代，直觉是对的" /></>}>
		<Army x={170} y={330} cols={40} rows={25} c={BLUE} seed={4} alive={0.5} />
		<Army x={1265} y={330} cols={20} rows={25} c={RED} seed={5} alive={0} />
		{Array.from({length: 25}, (_, j) => <line key={j} x1={880} y1={338 + j * 17.5} x2={1265} y2={338 + j * 17.5} stroke={AMBER} strokeWidth={1} opacity={0.35} />)}
	</Frame>
);
// 3 · rifles: everyone shoots anyone — a live table; the gap runs away
const K3 = () => {
	const R = rnd(9), fire: React.ReactNode[] = [];
	for (let k = 0; k < 90; k++) { const a = [170 + R() * 700, 400 + R() * 437], b = [1265 + R() * 350, 400 + R() * 437]; fire.push(<line key={k} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={BLUE} strokeWidth={1.4} opacity={0.35} />); }
	for (let k = 0; k < 22; k++) { const a = [1265 + R() * 350, 400 + R() * 437], b = [170 + R() * 700, 400 + R() * 437]; fire.push(<line key={'r' + k} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={RED} strokeWidth={1.4} opacity={0.4} />); }
	const rows = [['1000', '500', '2 : 1'], ['950', '400', '2.4 : 1'], ['910', '305', '3 : 1'], ['880', '214', '4 : 1']];
	return (
		<Frame html={<>
			<div style={{position: 'absolute', left: 610, top: 40, width: 700, fontFamily: SANS, fontWeight: 900, fontSize: 52, color: INK}}>
				{rows.map((r, i) => <div key={i} style={{display: 'flex', justifyContent: 'space-between', opacity: 0.45 + i * 0.18, lineHeight: 1.45}}><span style={{color: BLUE, width: 160, textAlign: 'right'}}>{r[0]}</span><span style={{color: RED, width: 160, textAlign: 'right'}}>{r[1]}</span><span style={{width: 200, textAlign: 'right', color: AMBER}}>{r[2]}</span></div>)}
			</div>
			<Sub t="有了枪：越打越悬殊" /></>}>
			{fire}
			<Army x={170} y={400} cols={40} rows={25} c={BLUE} seed={6} alive={0.88} />
			<Army x={1265} y={400} cols={20} rows={25} c={RED} seed={7} alive={0.43} />
		</Frame>
	);
};
// 4 · why: twice the men = twice the guns × half the fire on each man
const K4 = () => {
	const R = rnd(21), inc: React.ReactNode[] = [], out: React.ReactNode[] = [];
	for (let k = 0; k < 16; k++) { const y = 330 + k * 26; out.push(<line key={k} x1={640} y1={y} x2={1250} y2={y + (R() - 0.5) * 120} stroke={BLUE} strokeWidth={3} opacity={0.75} />); }
	for (let k = 0; k < 8; k++) { const y = 330 + k * 52; inc.push(<line key={k} x1={1250} y1={y + 20} x2={640} y2={y} stroke={RED} strokeWidth={3} opacity={0.75} />); }
	return (
		<Frame html={<><Big x={640} y={180} t="火力 ×2" c={BLUE} size={84} w={700} /><Big x={1320} y={180} t="挨打 ÷2" c={RED} size={84} w={700} /><Big x={960} y={900} t="= 强 4 倍" c={AMBER} size={120} w={900} /></>}>
			{out}{inc}
			<Army x={290} y={300} cols={20} rows={26} c={BLUE} seed={8} gap={17.5} />
			<Army x={1260} y={300} cols={10} rows={26} c={RED} seed={9} gap={17.5} />
		</Frame>
	);
};
// 5 · strength is the square: side = number of men; the 500 square fits in the 1000 square four times
const K5 = () => (
	<Frame html={<><Lbl x={560} y={120} t="1000" c={BLUE} size={60} /><Lbl x={1460} y={350} t="500" c={RED} size={60} /><Big x={1460} y={820} t="×4" c={AMBER} size={130} w={400} /><Sub t="战斗力 = 人数的平方" /></>}>
		<Sq x={280} y={180} s={560} c={BLUE} />
		{[[280, 180], [560, 180], [280, 460], [560, 460]].map(([x, y], i) => <rect key={i} x={x} y={y} width={280} height={280} fill="none" stroke={RED} strokeWidth={3} strokeDasharray="12 9" opacity={0.85} />)}
		<Sq x={1320} y={400} s={280} c={RED} />
	</Frame>
);
// 6 · the fight subtracts areas: 1000² − 500² leaves an L that folds into 866²
const K6 = () => (
	<Frame html={<><Big x={960} y={110} t={<>1000² − 500² = <span style={{color: '#fff', textShadow: glowTxt(BLUE)}}>866²</span></>} c={AMBER} size={84} w={1600} /><Lbl x={1435} y={905} t="866" c={BLUE} size={56} /></>}>
		<Sq x={200} y={250} s={560} c={BLUE} />
		<rect x={480} y={250} width={280} height={280} fill="#0e1517" /><rect x={480} y={250} width={280} height={280} fill={RED} opacity={0.12} /><rect x={480} y={250} width={280} height={280} fill="none" stroke={RED} strokeWidth={3} strokeDasharray="12 9" />
		<path d="M820,530 C930,520 1020,520 1130,530" stroke={AMBER} strokeWidth={5} fill="none" /><path d="M1112,516 L1134,531 L1112,546" stroke={AMBER} strokeWidth={5} fill="none" />
		<Sq x={1192} y={322} s={485} c={BLUE} />
		<line x1={1192} y1={850} x2={1677} y2={850} stroke={INK} strokeWidth={3} /><line x1={1192} y1={838} x2={1192} y2={862} stroke={INK} strokeWidth={3} /><line x1={1677} y1={838} x2={1677} y2={862} stroke={INK} strokeWidth={3} />
	</Frame>
);
// 7 · divide and conquer: equal armies would wipe each other out; split them and 707 walk away
const K7 = () => (
	<Frame html={<><Lbl x={330} y={170} t="1000 对 1000" size={48} /><Big x={330} y={800} t="0" c={INK} size={110} w={300} /><Lbl x={1250} y={170} t="分成两半，各个击破" size={48} w={900} /><Big x={1404} y={590} t="866" c={BLUE} size={72} w={320} /><Big x={1390} y={760} t="707" c={BLUE} size={130} w={360} /><Sub t="同样的兵，换个打法" /></>}>
		{/* left: equal squares cancel */}
		<Sq x={150} y={260} s={170} c={BLUE} dots={false} fillO={0.35} /><Sq x={340} y={260} s={170} c={RED} dots={false} fillO={0.35} />
		<text x={330} y={545} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 64}} fill={INK} opacity={0.8}>=</text>
		<line x1={600} y1={230} x2={600} y2={880} stroke="#3c5157" strokeWidth={2} />
		{/* right: fight one half, then the other */}
		<Sq x={760} y={300} s={240} c={BLUE} /><Sq x={1020} y={360} s={120} c={RED} />
		<path d="M1170,420 L1270,420" stroke={AMBER} strokeWidth={5} /><path d="M1254,406 L1274,420 L1254,434" stroke={AMBER} strokeWidth={5} fill="none" />
		<Sq x={1300} y={316} s={208} c={BLUE} /><Sq x={1528} y={360} s={120} c={RED} />
		<path d="M1640,500 L1640,630" stroke={AMBER} strokeWidth={5} /><path d="M1626,614 L1640,634 L1654,614" stroke={AMBER} strokeWidth={5} fill="none" />
		<Sq x={1555} y={655} s={170} c={BLUE} />
	</Frame>
);
// 8 · Trafalgar, 1805: 27 against 33 — two columns cut the line; the van is left behind
const Ship: React.FC<{x: number; y: number; a: number; c: string; s?: number}> = ({x, y, a, c, s = 1}) => (
	<g transform={`translate(${x},${y}) rotate(${a}) scale(${s})`}><path d="M-22,0 L-14,-8 L18,-7 L28,0 L18,7 L-14,8 Z" fill={c} /><path d="M-22,0 L-14,-8 L18,-7 L28,0 L18,7 L-14,8 Z" fill={c} opacity={0.4} filter="url(#gl)" transform="scale(1.4)" /></g>
);
const K8 = () => {
	const enemy = Array.from({length: 33}, (_, i) => { const t = i / 32; return [260 + t * 1420, 470 + Math.sin(t * 3.1) * 40 + t * 60] as const; });
	const cutA = 13, cutB = 18; // the line split into 13 / 5 / 15 (van → rear)
	return (
		<Frame html={<><Lbl x={960} y={70} t="1805 · 特拉法加" size={44} /><Lbl x={520} y={330} t="敌前队 · 被甩开" c="rgba(255,90,71,0.85)" size={40} /><Big x={300} y={860} t="27" c={BLUE} size={96} w={300} /><Big x={560} y={860} t="33" c={RED} size={96} w={300} /><Sub t="拦腰切开，以多打少" /></>}>
			{enemy.map(([x, y], i) => <Ship key={i} x={x - (i < cutA ? 120 : 0)} y={y - (i < cutA ? 60 : 0)} a={4} c={RED} s={0.9} />)}
			{/* Nelson's column (centre) and Collingwood's (rear) */}
			{Array.from({length: 12}, (_, k) => <Ship key={'n' + k} x={980 - k * 18} y={520 + k * 40} a={-80} c={BLUE} s={0.9} />)}
			{Array.from({length: 15}, (_, k) => <Ship key={'c' + k} x={1380 - k * 14} y={580 + k * 34} a={-82} c={BLUE} s={0.9} />)}
			<path d="M980,470 L980,420" stroke={BLUE} strokeWidth={3} strokeDasharray="8 8" /><path d="M1380,520 L1380,470" stroke={BLUE} strokeWidth={3} strokeDasharray="8 8" />
			<path d="M260,380 C230,350 220,320 240,290" stroke={RED} strokeWidth={3} fill="none" strokeDasharray="8 8" opacity={0.7} />
		</Frame>
	);
};
// 9 · the end: scattered men are not an advantage; the same men in one place at one time are
const K9 = () => (
	<Frame html={<Sub t="同一时刻、同一地点人多，才算" />}>
		{[[180, 200], [520, 640], [300, 520], [700, 260], [160, 760]].map(([x, y], i) => <Sq key={i} x={x} y={y} s={120} c={BLUE} fillO={0.2} />)}
		<path d="M900,540 L1020,540" stroke={AMBER} strokeWidth={6} /><path d="M1000,522 L1026,540 L1000,558" stroke={AMBER} strokeWidth={6} fill="none" />
		<Sq x={1130} y={260} s={560} c={BLUE} />
	</Frame>
);

const FRAMES = [K1, K2, K3, K4, K5, K6, K7, K8, K9];
const Board: React.FC = () => { const F = FRAMES[useCurrentFrame() % FRAMES.length]; return <F />; };
registerRoot(() => <Composition id="LAN38" component={Board} durationInFrames={FRAMES.length} fps={30} width={W} height={H} />);
