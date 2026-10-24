import React from 'react';
import {W, H, SERIF, SANS, LATS, MONO, GOLD, rnd, lerp, Glow, Plate, Sky, Label, Subs, Blur, Smoke, Rimmed, fkPose, gaitPose, POSES, jointAt, Look4, Pose} from './kit42';
/* ep42 《人活着为了什么？人类问了近四千年》 — the 11 key frames (one still per scene) in the ep41 v3 look. */

/* ===================== 1 · 11  the room (today) ===================== */
const Room: React.FC<{dawn?: boolean}> = ({dawn}) => {
	const d = dawn ? 1 : 0;
	return <g>
		<Sky id={`rmW${d}`} stops={dawn ? [[0, '#2c2c3c'], [1, '#3b3036']] : [[0, '#17141b'], [1, '#2a1f22']]} />
		<Glow x={1730} y={470} r={760} c="#ffb35a" o={dawn ? 0.32 : 0.5} id={`rmL${d}`} />
		{/* window */}
		<g>
			<Sky id={`rmWin${d}`} x={110} y={110} w={410} h={430} stops={dawn ? [[0, '#3a4a7a'], [0.55, '#9c86a8'], [1, '#f1b58a']] : [[0, '#0a1124'], [1, '#17223c']]} />
			<path d="M110,470 L150,470 L150,420 L200,420 L200,455 L250,455 L250,380 L300,380 L300,440 L360,440 L360,400 L420,400 L420,450 L470,450 L470,410 L520,410 L520,540 L110,540 Z" fill={dawn ? '#2b2a3c' : '#070a14'} />
			{Array.from({length: 34}, (_, i) => { const x = 120 + rnd(i, 3) * 390, y = 420 + rnd(i, 4) * 110; return (dawn ? rnd(i, 7) < 0.25 : true) && <circle key={i} cx={x} cy={y} r={3 + 6 * rnd(i, 5)} fill={i % 4 ? '#ffd9a0' : '#9fc8ff'} opacity={dawn ? 0.5 : 0.25 + 0.4 * rnd(i, 6)} />; })}
			{dawn && <Glow x={400} y={540} r={260} c="#ffc89a" o={0.5} id="rmSun" />}
			<rect x={110} y={110} width={410} height={430} fill="none" stroke="#0a080c" strokeWidth={18} /><path d="M315,110 V540 M110,325 H520" stroke="#0a080c" strokeWidth={9} />
			<path d="M520,96 Q560,330 545,560 L610,560 Q600,330 590,96 Z" fill={dawn ? '#2a2230' : '#150f14'} />
			{dawn && <path d="M520,540 L110,540 L-80,1080 L700,1080 Z" fill="#ffd2b0" opacity={0.06} />}
		</g>
		{/* desk */}
		<rect x={0} y={648} width={W} height={22} fill={dawn ? '#4a3a36' : '#3a2a22'} /><rect x={0} y={670} width={W} height={410} fill={dawn ? '#1c1618' : '#120d0e'} />
		<Glow x={1600} y={660} r={420} c="#ffb35a" o={dawn ? 0.25 : 0.45} id={`rmDk${d}`} />
		{/* laptop: the sticky note says it all */}
		<g>
			<Glow x={780} y={480} r={430} c="#bcd4ff" o={dawn ? 0.08 : 0.16} id={`rmScr${d}`} />
			<rect x={560} y={360} width={440} height={272} rx={14} fill="#111116" /><rect x={576} y={376} width={408} height={238} rx={4} fill={dawn ? '#9fb0c4' : '#c9d6e6'} />
			<rect x={640} y={420} width={280} height={150} rx={10} fill={dawn ? '#c8d2dc' : '#eef3f8'} />
			<circle cx={780} cy={470} r={28} fill="#3fae5a" /><path d="M766,470 l10,10 l18,-20" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			<text x={780} y={538} textAnchor="middle" style={{fontFamily: SANS, fontSize: 26, fontWeight: 700}} fill="#2b3442">已提交</text>
			<g transform="rotate(7 900 420)"><rect x={828} y={372} width={150} height={112} fill="#f6d55a" /><rect x={828} y={372} width={150} height={16} fill="#e9c443" />
				<text x={903} y={448} textAnchor="middle" style={{fontFamily: SANS, fontSize: 30, fontWeight: 700}} fill="#3a2a10">终于交了</text></g>
			<path d="M530,648 L1030,648 L1006,630 L554,630 Z" fill="#2a2a30" />
		</g>
		{/* an empty noodle cup with its fork */}
		<g><path d="M1090,560 L1180,560 L1170,648 L1100,648 Z" fill={dawn ? '#b9aea4' : '#d6c8b6'} /><rect x={1094} y={590} width={82} height={18} fill="#c9473a" />
			<path d="M1086,560 L1184,560 L1190,552 L1080,552 Z" fill="#e8ddd0" /><path d="M1150,552 L1210,508 L1214,516 L1160,556 Z" fill="#cfc4b6" /><path d="M1118,556 L1104,470" stroke="#e8e0d6" strokeWidth={5} /></g>
		{/* desk lamp */}
		<g><ellipse cx={1760} cy={648} rx={70} ry={12} fill="#1a1416" /><path d="M1760,644 L1700,470 L1640,430" stroke="#1a1416" strokeWidth={12} fill="none" strokeLinecap="round" />
			<path d="M1600,400 L1690,420 L1660,470 L1580,450 Z" fill="#1a1416" /><path d="M1585,452 L1660,470 L1430,648 L1320,648 Z" fill="#ffd9a0" opacity={dawn ? 0.06 : 0.12} />
			<Glow x={1620} y={460} r={60} c="#fff0c8" o={dawn ? 0.5 : 0.9} id={`rmBulb${d}`} /></g>
	</g>;
};
/** the phone held up over the shoulder; screen content per moment */
const PHX = 1420, PHY = 520, PW = 380, PH = 780;
const PhoneUI: React.FC<{dawn?: boolean}> = ({dawn}) => {
	const sx = PHX - PW / 2 + 14, sy = PHY - PH / 2 + 14, sw = PW - 28, sh = PH - 28;
	const keyRows = [10, 9, 7];
	return <g>
		<defs><linearGradient id={`phScr${dawn ? 1 : 0}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b2534" /><stop offset="1" stopColor="#0b1018" /></linearGradient></defs>
		<rect x={sx} y={sy} width={sw} height={sh} rx={44} fill={`url(#phScr${dawn ? 1 : 0})`} />
		<rect x={PHX - 50} y={sy + 16} width={100} height={26} rx={13} fill="#05070a" />
		<text x={sx + 34} y={sy + 40} style={{fontFamily: SANS, fontSize: 22, fontWeight: 700}} fill="#e6ecf5">{dawn ? '05:52' : '03:07'}</text>
		<g transform={`translate(${sx + 112},${sy + 32})`}><circle r={8} fill="none" stroke="#e6ecf5" strokeWidth={2.4} /><path d="M0,-4 V0 L3,2" stroke="#e6ecf5" strokeWidth={2} fill="none" /><path d="M-8,-8 l-3,-3 M8,-8 l3,-3" stroke="#e6ecf5" strokeWidth={2.4} /></g>
		<rect x={sx + sw - 70} y={sy + 26} width={34} height={15} rx={4} fill="none" stroke="#e6ecf5" strokeWidth={2} /><rect x={sx + sw - 67} y={sy + 29} width={dawn ? 9 : 14} height={9} rx={2} fill="#e6ecf5" />
		{/* search box */}
		<rect x={sx + 18} y={sy + 76} width={sw - 36} height={62} rx={31} fill="#263243" stroke={dawn ? GOLD : '#4a6a96'} strokeWidth={2} />
		<circle cx={sx + 48} cy={sy + 104} r={9} fill="none" stroke="#9fb3cc" strokeWidth={3} /><path d={`M${sx + 54},${sy + 111} l7,7`} stroke="#9fb3cc" strokeWidth={3} strokeLinecap="round" />
		<text x={sx + 70} y={sy + 115} style={{fontFamily: SANS, fontSize: 22, fontWeight: 500}} fill="#ffffff">人活着，到底为了{dawn ? <tspan fill={GOLD} fontWeight={700}>谁</tspan> : '什么'}？</text>
		<rect x={sx + 70 + (dawn ? 10 : 11) * 22 + 3} y={sy + 94} width={3} height={28} fill="#6fb1ff" />
		{!dawn && <g>
			{[0, 1, 2].map((i) => <g key={i}><circle cx={sx + 46} cy={sy + 186 + i * 52} r={7} fill="none" stroke="#5a6a80" strokeWidth={2.5} /><rect x={sx + 70} y={sy + 180 + i * 52} width={[190, 230, 150][i]} height={12} rx={6} fill="#3a4658" /></g>)}
			<rect x={sx} y={sy + sh - 330} width={sw} height={330} rx={0} fill="#1a212c" />
			{keyRows.map((n, r) => Array.from({length: n}, (_, k) => { const kw = (sw - 20) / 10, x0 = sx + 10 + (10 - n) * kw / 2; return <rect key={`${r}_${k}`} x={x0 + k * kw + 3} y={sy + sh - 312 + r * 66} width={kw - 6} height={54} rx={7} fill="#3a4352" />; }))}
			<rect x={sx + 70} y={sy + sh - 114} width={sw - 190} height={54} rx={7} fill="#3a4352" />
			<rect x={sx + sw - 112} y={sy + sh - 114} width={100} height={54} rx={7} fill="#2f7cf6" /><text x={sx + sw - 62} y={sy + sh - 79} textAnchor="middle" style={{fontFamily: SANS, fontSize: 20, fontWeight: 700}} fill="#fff">搜索</text>
		</g>}
		{dawn && <g>
			<text x={PHX} y={sy + 182} textAnchor="middle" style={{fontFamily: SANS, fontSize: 18}} fill="#8b9ab0">饭搭子</text>
			<rect x={sx + sw - 228} y={sy + 206} width={206} height={56} rx={16} fill="#3fae5a" /><text x={sx + sw - 125} y={sy + 242} textAnchor="middle" style={{fontFamily: SANS, fontSize: 22, fontWeight: 500}} fill="#fff">明天一起吃饭？</text>
			<circle cx={sx + 42} cy={sy + 318} r={22} fill="#e8a35a" /><text x={sx + 42} y={sy + 326} textAnchor="middle" style={{fontFamily: SANS, fontSize: 20, fontWeight: 700}} fill="#fff">饭</text>
			<rect x={sx + 74} y={sy + 290} width={250} height={60} rx={16} fill="#eef2f6" />
			<path d={`M${sx + 96},${sy + 306} l18,14 l-18,14 Z`} fill="#2b3442" />
			{Array.from({length: 16}, (_, i) => { const hh = 6 + 22 * Math.abs(Math.sin(i * 1.7 + 0.4)) * (0.5 + 0.5 * Math.sin(i * 0.5)); return <rect key={i} x={sx + 128 + i * 9} y={sy + 320 - hh / 2} width={5} height={hh} rx={2} fill="#2b3442" />; })}
			<text x={sx + 314} y={sy + 327} textAnchor="end" style={{fontFamily: SANS, fontSize: 16}} fill="#6a7484">0:03</text>
			<rect x={sx + 74} y={sy + 360} width={262} height={56} rx={12} fill="#2a3444" /><text x={sx + 205} y={sy + 396} textAnchor="middle" style={{fontFamily: SANS, fontSize: 21, fontWeight: 700}} fill="#ffe6b0">你也没睡？明天吃火锅！</text>
			<circle cx={sx + 330} cy={sy + 296} r={6} fill="#e5483d" />
		</g>}
	</g>;
};
/** the viewer seen from behind: head, hood, shoulders, the arm up to the phone */
const OverShoulder: React.FC<{dawn?: boolean}> = ({dawn}) => {
	const col = '#09080c', tilt = dawn ? -7 : 3;
	const body = <g>
		<path d="M-60,1080 L-60,990 Q40,900 250,890 Q420,880 560,905 Q760,930 880,1080 Z" />
		<path d="M250,905 Q300,840 430,850 Q560,860 600,920 Q520,960 420,955 Q300,955 250,905 Z" />{/* the hood bunched at the neck */}
		<path d="M330,900 L340,830 L510,830 L520,905 Z" />
		<g transform={`rotate(${tilt} 430 800)`}>
			<ellipse cx={430} cy={740} rx={142} ry={160} />
			<path d="M300,690 Q310,560 430,566 Q560,570 574,700 L560,690 Q548,640 520,620 L530,600 Q480,610 470,596 Q440,612 400,598 L408,618 Q350,628 318,700 Z" />
			<path d="M560,730 Q590,740 584,780 Q576,808 556,800 Z" />{/* ear */}
		</g>
		<path d="M640,960 Q900,880 1270,820 L1300,890 Q1000,980 860,1080 L700,1080 Z" />{/* sleeve */}
		<path d="M1262,806 Q1300,790 1330,800 L1352,900 Q1320,930 1280,900 Z" />{/* hand round the phone's lower edge */}
	</g>;
	return <g>
		<g fill={dawn ? '#ffd6b8' : '#ffcf96'} opacity={0.45} transform="translate(4,-3)">{body}</g>
		<g fill={col}>{body}</g>
	</g>;
};
const Phone: React.FC<{dawn?: boolean}> = ({dawn}) => <g transform={`rotate(-4 ${PHX} ${PHY})`}>
	<Glow x={PHX} y={PHY} r={520} c="#7fa6ff" o={dawn ? 0.12 : 0.2} id={`phG${dawn ? 1 : 0}`} />
	<rect x={PHX - PW / 2} y={PHY - PH / 2} width={PW} height={PH} rx={58} fill="#111318" stroke="#2a2d36" strokeWidth={3} />
	<PhoneUI dawn={dawn} />
	{/* thumb */}
	<path d={dawn ? `M${PHX - 230},${PHY + 360} Q${PHX - 120},${PHY + 300} ${PHX - 30},${PHY + 330} Q${PHX - 10},${PHY + 350} ${PHX - 40},${PHY + 366} Q${PHX - 130},${PHY + 380} ${PHX - 190},${PHY + 410} Z` : `M${PHX - 230},${PHY + 380} Q${PHX - 80},${PHY + 230} ${PHX + 30},${PHY + 236} Q${PHX + 52},${PHY + 250} ${PHX + 28},${PHY + 272} Q${PHX - 70},${PHY + 300} ${PHX - 190},${PHY + 420} Z`} fill="#0c0a0e" />
</g>;
export const KF01: React.FC = () => <g>
	<Room /><Phone /><OverShoulder />
	<Label date="今天" name="凌晨 3:07" />
	<Subs zh="凌晨三点，你也搜过这句吧？" />
</g>;
export const KF11: React.FC = () => <g>
	<Room dawn /><Phone dawn /><OverShoulder dawn />
	<Label date="今天" name="天快亮了" />
	<Subs zh="答案不在世界尽头，[就在身边]。" />
</g>;

/* ===================== 2  the rewind turns the screen into papyrus; the title ===================== */
const Papyrus: React.FC<{id: string; x?: number; y?: number; w?: number; h?: number; base?: string}> = ({id, x = 0, y = 0, w = W, h = H, base = '#d7bd88'}) => <g>
	<defs><clipPath id={`${id}c`}><rect x={x} y={y} width={w} height={h} /></clipPath></defs>
	<g clipPath={`url(#${id}c)`}>
		<rect x={x} y={y} width={w} height={h} fill={base} />
		{Array.from({length: Math.ceil(h / 7)}, (_, i) => <rect key={i} x={x} y={y + i * 7} width={w} height={2 + 3 * rnd(i, 2)} fill={rnd(i, 1) > 0.5 ? '#f2dcaa' : '#a88a58'} opacity={0.12 + 0.12 * rnd(i, 3)} />)}
		{Array.from({length: Math.ceil(w / 11)}, (_, i) => <rect key={i} x={x + i * 11} y={y} width={2 + 3 * rnd(i, 5)} height={h} fill={rnd(i, 4) > 0.5 ? '#f0d8a4' : '#9c7e4e'} opacity={0.05 + 0.06 * rnd(i, 6)} />)}
		<Blur id={`${id}b`} s={30}>{Array.from({length: 14}, (_, i) => <ellipse key={i} cx={x + rnd(i, 7) * w} cy={y + rnd(i, 8) * h} rx={80 + 160 * rnd(i, 9)} ry={40 + 80 * rnd(i, 10)} fill="#8a6a3a" opacity={0.12} />)}</Blur>
		{/* the sheet joins of a pasted roll */}
		{[0.3, 0.68].map((u, i) => <rect key={i} x={x + u * w} y={y} width={26} height={h} fill="#b99a64" opacity={0.18} />)}
	</g>
</g>;
export const KF02: React.FC = () => {
	const cards = [[-2, '#2a3444'], [-1, '#2a3444'], [0, '#3a3a36'], [1, '#6a5a40'], [2, '#9a8058']] as const;
	return <g>
		<Papyrus id="ttP" />
		<defs>
			<radialGradient id="ttBurn" cx="0.5" cy="0.5" r="0.72"><stop offset="0.5" stopColor="#2a1608" stopOpacity="0" /><stop offset="1" stopColor="#1a0c04" stopOpacity="0.85" /></radialGradient>
			<linearGradient id="ttGlass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="1" /><stop offset="0.62" stopColor="#fff" stopOpacity="0.9" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
			<mask id="ttGlassM"><rect x={0} y={0} width={620} height={H} fill="url(#ttGlass)" /></mask>
			<linearGradient id="ttGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe9a8" /><stop offset="0.55" stopColor="#f2c25a" /><stop offset="1" stopColor="#c98a24" /></linearGradient>
			<filter id="ttVb" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="2 22" /></filter>
		</defs>
		{/* the phone's glass, still on the left, dissolving into the sheet; its result cards stream backwards */}
		<g mask="url(#ttGlassM)">
			<rect x={-80} y={40} width={700} height={1000} rx={70} fill="#0d131c" />
			<g filter="url(#ttVb)">{cards.map(([k, c], i) => <g key={i}><rect x={60} y={380 + Number(k) * 190} width={470} height={150} rx={18} fill={c} /><rect x={90} y={410 + Number(k) * 190} width={260} height={18} rx={9} fill="#cfd8e4" opacity={0.6} /><rect x={90} y={446 + Number(k) * 190} width={360} height={12} rx={6} fill="#cfd8e4" opacity={0.35} /></g>)}</g>
		</g>
		<rect width={W} height={H} fill="url(#ttBurn)" />
		{/* the title, written in ink; the second half in gold */}
		<g>
			<Blur id="ttInkB" s={3}><text x={W / 2 + 37} y={500} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 116, letterSpacing: '0.08em'}} fill="#2a1a0c" opacity={0.35}>人活着为了什么？</text></Blur>
			<text x={W / 2 + 37} y={500} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 116, letterSpacing: '0.08em'}} fill="#1c1209">人活着为了什么？</text>
			<path d="M640,548 Q960,560 1290,544" stroke="#1c1209" strokeWidth={3} fill="none" opacity={0.5} />
			<Glow x={W / 2} y={640} r={520} c="#ffcf6a" o={0.28} id="ttGl" />
			<text x={W / 2 + 6} y={680} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 100, letterSpacing: '0.08em'}} fill="url(#ttGold)" stroke="#4a2a0a" strokeWidth={5} paintOrder="stroke">人类问了近四千年</text>
		</g>
		<text x={96} y={140} style={{fontFamily: MONO, fontWeight: 700, fontSize: 52}} fill="#f4ead2" stroke="rgba(0,0,0,0.5)" strokeWidth={5} paintOrder="stroke">◀◀</text>
		<text x={W - 90} y={150} textAnchor="end" style={{fontFamily: SANS, fontWeight: 700, fontSize: 76, letterSpacing: '0.04em'}} fill="#f4ead2" stroke="rgba(0,0,0,0.5)" strokeWidth={5} paintOrder="stroke">公元前 1850</text>
	</g>;
};

/* ===================== 3  Egypt: the scribe and his Ba ===================== */
const LK: Record<string, Look4> = {
	scribe: {dress: 'shirt', legs: 'bare', head: 'egwig'},
	gilg: {dress: 'pelt', head: 'meso', beard: 'square', build: 1.08},
	alewife: {dress: 'dress', head: 'bun'},
	kong: {dress: 'robe', head: 'guan', beard: 'long'},
	zilu: {dress: 'robe', head: 'bun', beard: 'short'},
	socr: {dress: 'himation', head: 'baldf', beard: 'full', build: 1.05},
	juror: {dress: 'himation', head: 'short', beard: 'full'},
	marcus: {dress: 'cloak', head: 'short', beard: 'full'},
	soldier: {dress: 'cloak', head: 'bowl'},
	pris: {dress: 'coat', head: 'cap'},
	student: {dress: 'jacket', head: 'short'},
	oldman: {dress: 'jacket', head: 'baldf'},
	wife: {dress: 'dress', head: 'bun'},
	kid: {dress: 'shirt', head: 'child', build: 1.15},
};
/** the Ba: a bird with a human head (wig, ritual beard), drawn facing right in local px; ground at 0 */
const BA_D = ['M-60,-70 Q-40,-122 10,-122 Q52,-118 62,-88 Q58,-50 10,-42 Q-30,-40 -60,-70 Z', 'M-56,-76 L-118,-56 L-104,-44 L-50,-58 Z',
	'M-6,-112 Q-30,-196 -104,-236 Q-80,-186 -92,-150 Q-56,-142 -34,-104 Z', 'M36,-108 L62,-104 L60,-88 L28,-94 Z',
	'M34,-126 Q26,-170 56,-178 Q80,-176 84,-152 L92,-140 L82,-136 Q82,-124 68,-122 L64,-110 L42,-110 Z', 'M28,-120 Q20,-184 56,-188 Q86,-186 88,-160 L68,-160 L66,-118 Z', 'M78,-126 L88,-100 L74,-104 Z',
	'M-4,-44 L-10,0 L4,0 L6,-44 Z', 'M14,-44 L16,0 L28,0 L24,-44 Z', 'M-22,0 L10,-2 L10,2 L-22,4 Z', 'M2,0 L34,-2 L34,2 L2,4 Z'];
const Ba: React.FC<{x: number; y: number; s: number; flip?: boolean}> = ({x, y, s, flip}) => <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
	<Blur id="baB" s={7}><g fill="#ffd27a" opacity={0.55}>{BA_D.map((d, i) => <path key={i} d={d} />)}</g></Blur>
	<g fill="#ffe2a6" opacity={0.42} stroke="#fff3d0" strokeWidth={1.4} strokeOpacity={0.7}>{BA_D.map((d, i) => <path key={i} d={d} />)}</g>
</g>;
const Hieratic: React.FC<{x: number; y: number; w: number; h: number; cols: number; seed: number; col?: string}> = ({x, y, w, h, cols, seed, col = '#1a120a'}) => <g>
	{Array.from({length: cols}, (_, c) => Array.from({length: Math.floor(h / 15)}, (_, r) => { const cx = x + w - (c + 0.5) * (w / cols), cy = y + 8 + r * 15, k = rnd(c * 31 + r, seed);
		return k < 0.12 ? null : <path key={`${c}_${r}`} d={k < 0.4 ? `M${cx - 5},${cy} q4,-6 9,0 t4,3` : k < 0.7 ? `M${cx - 3},${cy - 5} l2,9 m3,-9 q4,4 -1,8` : `M${cx - 6},${cy + 2} h11 m-6,-6 v8`} stroke={col} strokeWidth={1.8} fill="none" strokeLinecap="round" />; }))}
</g>;
export const KF03: React.FC = () => {
	const x = 640, g = 905, h = 640, flip = false;
	const pose = fkPose({hip: 0.1, lean: 14, neck: -14, lt: 82, lk: 162, rt: 78, rk: 158, la: 52, le: 46, ra: 60, re: 52});
	const lh = jointAt(pose, 'LHand', x, g, h, flip), rh = jointAt(pose, 'RHand', x, g, h, flip), kn = jointAt(pose, 'LKnee', x, g, h, flip), hp = jointAt(pose, 'Hips', x, g, h);
	const py = kn[1] - 34;
	return <g>
		<Plate k="nile" />
		<Glow x={760} y={430} r={700} c="#ffb27a" o={0.18} id="egSun" />
		{/* sandy bank he sits on */}
		<path d="M0,860 Q500,840 1100,870 Q1500,890 1920,900 L1920,1080 L0,1080 Z" fill="#6e5440" opacity={0.85} />
		<path d="M0,880 Q600,872 1920,915" stroke="#a88660" strokeWidth={3} fill="none" opacity={0.5} />
		{/* the scribe: cross-legged, the roll across his lap, a rush pen; kilt over the lap */}
		<Rimmed x={x} ground={g} h={h} pose={pose} look={LK.scribe} col="#120c0c" rim="#ffd2a0" rimOp={0.5} />
		<path d={`M${hp[0] - 60},${hp[1] - 40} L${hp[0] + 40},${hp[1] - 44} Q${kn[0] + 30},${kn[1] - 30} ${kn[0] + 40},${kn[1] + 8} L${hp[0] - 70},${g - 6} Z`} fill="#120c0c" />
		{/* papyrus roll: the written part rolled in his left hand, the fresh part running out over the knees */}
		<g transform={`rotate(-4 ${lh[0]} ${py})`}>
			<rect x={lh[0] - 16} y={py - 30} width={kn[0] + 150 - lh[0]} height={62} fill="#e9d6a4" />
			<Hieratic x={lh[0] + 8} y={py - 26} w={rh[0] - lh[0] - 4} h={54} cols={6} seed={3} />
			<rect x={lh[0] - 30} y={py - 34} width={26} height={70} rx={12} fill="#cdb47c" stroke="#8a7042" strokeWidth={1.5} />
			<rect x={kn[0] + 136} y={py - 34} width={26} height={70} rx={12} fill="#cdb47c" stroke="#8a7042" strokeWidth={1.5} />
		</g>
		<path d={`M${rh[0] + 4},${rh[1] - 4} L${rh[0] + 30},${py - 8}`} stroke="#2a1c10" strokeWidth={3} strokeLinecap="round" />
		{/* scribe's palette (two ink cakes, a slot of rush pens) and a water pot on the ground */}
		<g transform={`translate(${x + 230},${g - 6}) rotate(-6)`}><rect x={-80} y={-14} width={170} height={16} rx={3} fill="#7a5532" stroke="#3a2614" strokeWidth={1.5} />
			<circle cx={-62} cy={-6} r={6} fill="#141010" /><circle cx={-44} cy={-6} r={6} fill="#8c2a1c" /><rect x={-28} y={-9} width={108} height={5} rx={2} fill="#3a2614" /><path d="M-20,-7 L76,-7" stroke="#c9a46a" strokeWidth={1.4} /></g>
		<g transform={`translate(${x - 170},${g - 4})`}><path d="M-22,0 Q-30,-30 -12,-46 L12,-46 Q30,-30 22,0 Z" fill="#5a3a24" /><rect x={-14} y={-52} width={28} height={8} rx={3} fill="#4a2e1c" /></g>
		{/* his Ba stands on a low stone, facing him, wings up: they argue */}
		<path d="M940,912 Q960,872 1040,868 Q1120,870 1130,912 Z" fill="#3a2c24" />
		<Glow x={1040} y={720} r={260} c="#ffd27a" o={0.35} id="baG" />
		<Ba x={1040} y={874} s={1.25} flip />
		<Label date="约公元前 1850 年" name="古埃及" />
		<Subs zh="一个人，和自己的灵魂吵了起来。" />
	</g>;
};

/* ===================== 4  Babylonia: the tavern at the edge of the world ===================== */
export const Tablet: React.FC<{x: number; y: number; w: number; h: number; seed?: number; glowRow?: number; rows?: number; glowCol?: number}> = ({x, y, w, h, seed = 1, glowRow = -1, rows = 12, glowCol = 0}) => {
	const id = `tb${seed}`, colW = (w - 60) / 2, rowH = (h - 60) / rows;
	const wedge = (cx: number, cy: number, s: number, k: number, c: string) => { const a = k < 0.55 ? 0 : k < 0.8 ? 90 : 45;
		return <g transform={`translate(${cx},${cy}) rotate(${a})`}><path d={`M${-s},${-s * 0.55} L${-s * 0.2},0 L${-s},${s * 0.55} Z`} fill={c} /><path d={`M${-s * 0.4},0 L${s * 1.4},0`} stroke={c} strokeWidth={s * 0.3} /></g>; };
	return <g>
		<defs>
			<radialGradient id={`${id}g`} cx="0.4" cy="0.35" r="0.8"><stop offset="0" stopColor="#8a5a34" /><stop offset="1" stopColor="#4a2c18" /></radialGradient>
			<clipPath id={`${id}c`}><path d={`M${x + 30},${y} L${x + w - 26},${y + 6} Q${x + w},${y + 10} ${x + w - 4},${y + 40} L${x + w - 8},${y + h * 0.62} L${x + w - 60},${y + h * 0.7} L${x + w - 40},${y + h * 0.8} L${x + w - 90},${y + h} L${x + 34},${y + h - 4} Q${x + 2},${y + h - 8} ${x + 4},${y + h - 40} L${x},${y + 36} Q${x + 2},${y + 2} ${x + 30},${y} Z`} /></clipPath>
		</defs>
		<g clipPath={`url(#${id}c)`}>
			<rect x={x - 10} y={y - 10} width={w + 20} height={h + 20} fill={`url(#${id}g)`} />
			{Array.from({length: 40}, (_, i) => <circle key={i} cx={x + rnd(i, seed) * w} cy={y + rnd(i, seed + 1) * h} r={2 + 5 * rnd(i, seed + 2)} fill="#2a180c" opacity={0.25} />)}
			<path d={`M${x + 30 + colW},${y + 20} L${x + 30 + colW},${y + h - 20} M${x + 36 + colW},${y + 20} L${x + 36 + colW},${y + h - 20}`} stroke="#2a180c" strokeWidth={2} opacity={0.6} />
			{[0, 1].map((c) => Array.from({length: rows}, (_, r) => { const n = 5 + Math.floor(rnd(r * 7 + c, seed) * 4), glow = r === glowRow && c === glowCol;
				return <g key={`${c}_${r}`}>{glow && <Glow x={x + 30 + c * (colW + 6) + colW / 2} y={y + 36 + r * rowH} r={colW * 0.7} c="#ffcf6a" o={0.55} id={`${id}gl`} />}
					{Array.from({length: n}, (_, k) => { const cx = x + 44 + c * (colW + 6) + (k + 0.5) * (colW - 30) / n, cy = y + 36 + r * rowH, kk = rnd(r * 13 + k * 3 + c, seed + 4), s = rowH * 0.22;
						return <g key={k}>{wedge(cx + 1.5, cy + 1.5, s, kk, '#b4835a')}{wedge(cx, cy, s, kk, glow ? '#ffe4a0' : '#24140a')}</g>; })}</g>; }))}
			{/* the join of the two pieces */}
			<path d={`M${x - 5},${y + h * 0.46} L${x + w * 0.2},${y + h * 0.5} L${x + w * 0.35},${y + h * 0.43} L${x + w * 0.55},${y + h * 0.52} L${x + w * 0.72},${y + h * 0.47} L${x + w + 5},${y + h * 0.55}`} stroke="#1a0c04" strokeWidth={5} fill="none" />
			<path d={`M${x - 5},${y + h * 0.46 + 4} L${x + w * 0.2},${y + h * 0.5 + 4} L${x + w * 0.35},${y + h * 0.43 + 4} L${x + w * 0.55},${y + h * 0.52 + 4} L${x + w * 0.72},${y + h * 0.47 + 4} L${x + w + 5},${y + h * 0.55 + 4}`} stroke="#b4835a" strokeWidth={1.5} fill="none" opacity={0.6} />
		</g>
	</g>;
};
export const KF04: React.FC = () => {
	const gx = 720, g = 912, gh = 600, ax = 1420, ah = 540;
	const listen = fkPose({hip: 0.65, lean: 6, neck: 6, lt: 14, lk: 10, rt: -14, rk: 12, la: 18, le: 40, ra: -8, re: 20});
	const speak = fkPose({hip: 0.65, lean: 4, neck: 2, lt: 3, lk: 4, rt: -4, rk: 4, la: 34, le: 70, ra: 70, re: 10});
	const jug = jointAt(speak, 'LHand', ax, g, ah, true);
	return <g>
		<Plate k="sea" />
		<path d="M0,830 Q700,812 1920,840 L1920,1080 L0,1080 Z" fill="#3a2a30" opacity={0.6} />
		{/* his footprints, running in from the dark */}
		{Array.from({length: 9}, (_, i) => <ellipse key={i} cx={80 + i * 66} cy={930 + (i % 2) * 14} rx={14} ry={5} fill="#1a1218" opacity={0.5} />)}
		{/* the tavern: mud brick, buttressed and niched walls, flat roof, a lamp-lit door */}
		<g>
			<Glow x={1440} y={760} r={420} c="#ffae5a" o={0.4} id="tvG" />
			<path d="M1180,912 L1180,470 L1230,470 L1230,452 L1300,452 L1300,470 L1560,470 L1560,452 L1630,452 L1630,470 L1720,470 L1720,912 Z" fill="#2a1d1c" />
			{[1210, 1265, 1600, 1660].map((xx) => <rect key={xx} x={xx} y={500} width={14} height={412} fill="#1f1514" />)}
			{Array.from({length: 14}, (_, i) => <rect key={i} x={1180} y={490 + i * 30} width={540} height={2} fill="#3a2a26" opacity={0.6} />)}
			<rect x={1180} y={462} width={540} height={10} fill="#3a2826" />
			<rect x={1350} y={672} width={140} height={240} fill="#ffb862" /><rect x={1340} y={662} width={160} height={14} fill="#1a1110" />
			<Glow x={1420} y={760} r={150} c="#fff0c8" o={0.6} id="tvD" />
			<rect x={1620} y={560} width={40} height={30} fill="#ffb862" opacity={0.85} />
			<g transform="translate(1540,912)"><path d="M-26,0 Q-40,-50 -18,-84 L18,-84 Q40,-50 26,0 Z" fill="#1d1414" /><rect x={-14} y={-96} width={28} height={14} fill="#1d1414" /></g>
		</g>
		<Rimmed x={ax} ground={g} h={ah} pose={speak} look={LK.alewife} flip col="#100b0e" rim="#ffc27a" rimOp={0.6} rimDx={2.2} />
		<g transform={`translate(${jug[0] - 6},${jug[1] + 10})`}><path d="M-20,0 Q-28,40 -14,64 L14,64 Q28,40 20,0 Z" fill="#100b0e" /><path d="M18,10 Q36,18 22,40" stroke="#100b0e" strokeWidth={6} fill="none" /></g>
		<Rimmed x={gx} ground={g} h={gh} pose={listen} look={LK.gilg} col="#0c090e" rim="#ffb27a" rimOp={0.5} rimDx={2.2} />
		{/* the tablet she lives on */}
		<g opacity={0.95}><Tablet x={1600} y={70} w={240} h={250} seed={2} rows={9} glowRow={3} /></g>
		<text x={1720} y={350} textAnchor="middle" style={{fontFamily: SANS, fontSize: 20}} fill="#fff" opacity={0.7}>古巴比伦泥板 · 公元前18世纪前后</text>
		<Label date="约公元前 1800 年" name="古巴比伦 · 泥板上的史诗" />
		<Subs zh="「你找的那种生命，[你找不到]。」" nat="balāṭam ša tusaḫḫaru lā tutta" />
	</g>;
};

/* ===================== 5  Lu: under the tree, sunset behind the student, the village behind the master ===================== */
export const KF05: React.FC = () => {
	const g = 905, zx = 760, kx = 1120;
	const seiza = fkPose({hip: 0.2, lean: 6, neck: -6, lt: 67, lk: 157, rt: 64, rk: 154, lf: 180, rf: 180, la: 22, le: 70, ra: 18, re: 74});
	const raise = fkPose({hip: 0.655, lean: 8, neck: 8, lt: 4, lk: 4, rt: -5, rk: 4, la: 4, le: 12, ra: 70, re: -12});
	return <g>
		<Sky id="luSky" stops={[[0, '#4a3a5c'], [0.45, '#c47a62'], [0.62, '#f0b070'], [1, '#6a4a48']]} />
		<Glow x={330} y={600} r={260} c="#ffd27a" o={0.7} id="luSun" /><circle cx={330} cy={600} r={58} fill="#ffe0a0" />
		<path d="M0,640 Q300,600 620,628 Q900,650 1200,610 Q1500,580 1920,620 L1920,1080 L0,1080 Z" fill="#6a4a50" />
		<path d="M0,700 Q400,680 800,700 Q1300,720 1920,690 L1920,1080 L0,1080 Z" fill="#4a3440" />
		{/* the village behind the master: thatched huts, lit doors, cooking smoke */}
		{[[1330, 700, 1], [1520, 690, 0.9], [1720, 700, 1.1]].map(([x, y, s], i) => <g key={i}>
			<Smoke x={x + 20 * s} y={y - 80 * s} s={s * 0.9} col="#d9c8c0" op={0.35} seed={i} id={`luSm${i}`} />
			<path d={`M${x - 70 * s},${y} L${x - 70 * s},${y - 50 * s} L${x},${y - 100 * s} L${x + 70 * s},${y - 50 * s} L${x + 70 * s},${y} Z`} fill="#3a2830" />
			<rect x={x - 12 * s} y={y - 34 * s} width={24 * s} height={34 * s} fill="#ffb862" /></g>)}
		{/* courtyard ground */}
		<path d="M0,820 Q960,800 1920,830 L1920,1080 L0,1080 Z" fill="#2a1e24" />
		{/* the old tree */}
		<g fill="#140e14" transform="translate(120,0)"><path d="M1290,905 Q1300,700 1270,560 Q1250,470 1180,420 L1200,404 Q1260,440 1300,500 Q1330,430 1420,380 L1430,396 Q1350,450 1330,560 Q1320,720 1350,905 Z" />
			{Array.from({length: 22}, (_, i) => <ellipse key={i} cx={980 + rnd(i, 1) * 800} cy={120 + rnd(i, 2) * 300} rx={90 + 80 * rnd(i, 3)} ry={50 + 40 * rnd(i, 4)} opacity={0.97} />)}</g>
		<Rimmed x={zx} ground={g} h={600} pose={seiza} look={LK.zilu} col="#0f0a10" rim="#ffc890" rimOp={0.55} />
		<Rimmed x={kx} ground={g} h={600} pose={raise} look={LK.kong} flip col="#0f0a10" rim="#ffc890" rimOp={0.45} rimDx={2.2} />
		<Label date="约公元前 500 年" name="鲁国" />
		<Subs zh="「活都没活明白，怎么懂得死？」" nat="未知生，焉知死？" />
	</g>;
};

/* ===================== 6  Athens 399 BC: the trial, the vote by pebbles into two urns ===================== */
export const KF06: React.FC = () => {
	const sx = 470, sg = 868, sh = 560;
	const speak = fkPose({hip: 0.655, lean: 2, neck: 0, lt: 4, lk: 4, rt: -5, rk: 4, la: 8, le: 26, ra: 92, re: 24});
	const sit = fkPose({hip: 0.37, lean: 4, neck: 6, lt: 86, lk: 90, rt: 82, rk: 86, la: 14, le: 48, ra: 10, re: 50});
	const vote = fkPose({hip: 0.64, lean: 24, neck: 14, lt: 10, lk: 14, rt: -8, rk: 6, la: 8, le: 14, ra: 50, re: 10});
	const vx = 1150, vg = 930, vh = 470, hand = jointAt(vote, 'RHand', vx, vg, vh, true);
	const rows = [{g: 660, h: 220, n: 7, x0: 1260, dx: 96}, {g: 740, h: 250, n: 7, x0: 1230, dx: 100}, {g: 820, h: 280, n: 6, x0: 1300, dx: 104}];
	return <g>
		<Sky id="atSky" stops={[[0, '#5f7aa0'], [0.6, '#e8b888'], [1, '#f0c890']]} />
		{/* the stoa behind: a Doric colonnade with its shaded hall */}
		<rect x={0} y={330} width={W} height={470} fill="#4a3a3a" />
		<rect x={0} y={260} width={W} height={70} fill="#d8bf98" /><rect x={0} y={250} width={W} height={12} fill="#b89c78" /><path d="M0,250 L0,226 L1920,226 L1920,250 Z" fill="#8a5a46" />
		{Array.from({length: 15}, (_, i) => { const x = 40 + i * 136; return <g key={i}><rect x={x - 26} y={330} width={52} height={470} fill="#e2c9a0" /><rect x={x + 6} y={330} width={20} height={470} fill="#b99c78" /><rect x={x - 34} y={322} width={68} height={12} fill="#d0b48c" /></g>; })}
		<rect x={0} y={790} width={W} height={290} fill="#8a6e58" /><path d="M0,790 L1920,790" stroke="#5a4636" strokeWidth={3} />
		<Glow x={300} y={500} r={900} c="#ffd49a" o={0.25} id="atSun" />
		{/* jurors on wooden benches, in tiers, facing him */}
		{rows.map((r, ri) => <g key={ri}>
			<rect x={1160} y={r.g - 4} width={760} height={1080 - r.g} fill={['#5a4434', '#4e3a2e', '#443228'][ri]} />
			{Array.from({length: r.n}, (_, i) => { const x = r.x0 + i * r.dx + (ri % 2) * 20; return <Rimmed key={i} x={x} ground={r.g} h={r.h} pose={sit} look={{...LK.juror, beard: rnd(i, ri) > 0.3 ? 'full' : undefined, head: rnd(i, ri + 5) > 0.7 ? 'baldf' : 'short'}} flip col="#21181c" rim="#ffd9a6" rimOp={0.4} rimDx={-2.2} />; })}
			<rect x={1160} y={r.g - r.h * 0.37} width={760} height={r.h * 0.06} fill="#3a2a22" />
		</g>)}
		{/* the speaker's low stone step, the water clock */}
		<rect x={300} y={868} width={360} height={36} fill="#b89c7c" /><rect x={300} y={868} width={360} height={6} fill="#d8c0a0" />
		<g transform="translate(720,930)"><rect x={-6} y={-150} width={12} height={150} fill="#3a2a22" /><rect x={-50} y={-150} width={100} height={10} fill="#3a2a22" />
			<path d="M-36,-150 Q-46,-200 -26,-220 L26,-220 Q46,-200 36,-150 Z" fill="#a0603a" /><path d="M-22,-62 Q-34,-30 -20,0 L20,0 Q34,-30 22,-62 Z" fill="#a0603a" />
			<path d="M0,-150 L0,-64" stroke="#bcd8e8" strokeWidth={2} opacity={0.8} /><path d="M-36,-196 L36,-196" stroke="#5a3420" strokeWidth={4} /></g>
		<Rimmed x={sx} ground={sg} h={sh} pose={speak} look={LK.socr} col="#16101a" rim="#ffe0b0" rimOp={0.6} />
		{/* the two urns; a juror drops his pebble */}
		{[[880, 'condemn'], [1000, 'acquit']].map(([x], i) => <g key={i} transform={`translate(${x},930)`}><path d="M-36,0 Q-58,-60 -30,-108 L30,-108 Q58,-60 36,0 Z" fill="#7a4a30" /><rect x={-34} y={-118} width={68} height={14} rx={4} fill="#5a3422" /><path d="M-46,-60 Q0,-48 46,-60" stroke="#4a2a1a" strokeWidth={3} fill="none" /></g>)}
		<Rimmed x={vx} ground={vg} h={vh} pose={vote} look={LK.juror} flip col="#14101a" rim="#ffd9a6" rimOp={0.55} />
		<circle cx={hand[0] - 4} cy={hand[1] + 28} r={7} fill="#e8dcc8" /><circle cx={hand[0] - 2} cy={hand[1] + 50} r={6} fill="#e8dcc8" opacity={0.35} />
		<text x={W - 60} y={880} textAnchor="end" style={{fontFamily: SANS, fontSize: 22}} fill="#fff" opacity={0.75}>柏拉图《申辩篇》38a</text>
		<Label date="公元前 399 年" name="雅典" />
		<Subs zh="「未经审视的人生，不值得过。」" nat="ὁ δὲ ἀνεξέταστος βίος οὐ βιωτὸς ἀνθρώπῳ" />
	</g>;
};

/* ===================== 7  The Danube, winter, dawn: Marcus writes to himself ===================== */
export const KF07: React.FC = () => {
	const mx = 650, mg = 912, mh = 600;
	const write = fkPose({hip: 0.31, lean: 16, neck: 14, lt: 84, lk: 88, rt: 78, rk: 84, la: 44, le: 62, ra: 52, re: 70});
	const lh = jointAt(write, 'LHand', mx, mg, mh), rh = jointAt(write, 'RHand', mx, mg, mh), head = jointAt(write, 'Head', mx, mg, mh);
	return <g>
		<Plate k="danube" />
		<Glow x={1000} y={560} r={700} c="#ffd6a0" o={0.18} id="daSun" />
		{/* soldiers lighting fires along the far bank */}
		{[[1330, 742], [1560, 752], [1760, 746]].map(([x, y], i) => <g key={i}><Smoke x={x} y={y - 20} s={0.6} col="#c8c8d0" op={0.3} seed={i} id={`daSm${i}`} /><Glow x={x} y={y - 8} r={34} c="#ffb04a" o={0.9} id={`daF${i}`} />
			<Rimmed x={x - 30} ground={y + 4} h={64} pose={POSES.stand} look={LK.soldier} col="#1a1c24" rimOp={0} /><Rimmed x={x + 34} ground={y + 4} h={62} pose={POSES.listen} look={LK.soldier} flip col="#1a1c24" rimOp={0} /></g>)}
		{/* the snowy near bank */}
		<path d="M0,800 Q500,790 900,840 Q1100,866 1240,920 L1240,1080 L0,1080 Z" fill="#c9d0dc" />
		<path d="M0,830 Q500,820 900,866 Q1080,890 1200,940 L1200,1080 L0,1080 Z" fill="#a8b2c2" />
		{/* a stone camp building: tiled roof, lamp-lit door */}
		<g>
			<rect x={-20} y={460} width={540} height={460} fill="#3a3640" />
			{Array.from({length: 13}, (_, r) => Array.from({length: 7}, (_, c) => <rect key={`${r}_${c}`} x={-20 + c * 80 + (r % 2) * 40} y={470 + r * 34} width={76} height={30} fill="#4a4650" opacity={0.6} />))}
			<path d="M-40,470 L250,330 L560,470 Z" fill="#5a3a32" />{Array.from({length: 9}, (_, i) => <path key={i} d={`M${-40 + i * 4},${470 - i * 16} L${560 - i * 4},${470 - i * 16}`} stroke="#3a2420" strokeWidth={3} opacity={0} />)}
			{Array.from({length: 12}, (_, i) => <path key={i} d={`M${-10 + i * 48},${470} L${250 + (i - 5.5) * 12},${334}`} stroke="#3a2420" strokeWidth={4} opacity={0.6} />)}
			<path d="M-40,470 L250,330 L560,470 L540,476 L250,344 L-20,476 Z" fill="#eef2f8" />
			<Glow x={420} y={760} r={300} c="#ffb862" o={0.5} id="daDoor" />
			<rect x={360} y={640} width={130} height={280} fill="#ffbd70" /><rect x={350} y={630} width={150} height={14} fill="#2a2630" />
		</g>
		{/* brazier, campstool, the emperor writing on a roll */}
		<g transform="translate(830,912)"><path d="M-40,-70 L40,-70 L30,-40 L-30,-40 Z" fill="#2a2420" /><path d="M-28,-40 L-40,0 M28,-40 L40,0 M0,-40 L0,0" stroke="#2a2420" strokeWidth={6} />
			<Glow x={0} y={-74} r={70} c="#ff9a3a" o={0.9} id="daBr" /><Smoke x={0} y={-110} s={0.8} col="#d0d0d8" op={0.3} seed={4} id="daBrS" /></g>
		<g transform={`translate(${mx - 10},${mg})`}><path d="M-50,-190 L50,0 M50,-190 L-50,0" stroke="#1a1418" strokeWidth={9} /><rect x={-60} y={-196} width={120} height={12} fill="#1a1418" /></g>
		<Rimmed x={mx} ground={mg} h={mh} pose={write} look={LK.marcus} col="#141018" rim="#ffd2a0" rimOp={0.55} rimDx={2.2} />
		<g transform={`rotate(-14 ${lh[0]} ${lh[1]})`}><rect x={lh[0] - 8} y={lh[1] - 16} width={rh[0] - lh[0] + 70} height={34} fill="#e8dcbc" /><rect x={lh[0] - 18} y={lh[1] - 20} width={18} height={42} rx={8} fill="#cdb98e" /><rect x={rh[0] + 58} y={lh[1] - 20} width={18} height={42} rx={8} fill="#cdb98e" />
			{Array.from({length: 4}, (_, i) => <path key={i} d={`M${lh[0] + 10},${lh[1] - 8 + i * 8} h${(rh[0] - lh[0]) * (i === 3 ? 0.6 : 1)}`} stroke="#3a2a1a" strokeWidth={1.4} strokeDasharray="5 3" />)}</g>
		<path d={`M${rh[0] + 6},${rh[1] - 6} L${rh[0] + 30},${rh[1] - 34}`} stroke="#2a1c10" strokeWidth={3} />
		<Blur id="daBreath" s={6}><ellipse cx={head[0] + 70} cy={head[1] + 26} rx={34} ry={14} fill="#ffffff" opacity={0.45} /></Blur>
		<Label date="约公元 170 年代" name="多瑙河前线 · 马可·奥勒留" />
		<Subs zh="「我起来，是去[做一个人该做的事]。」" />
	</g>;
};

/* ===================== 8  Frankl: the dawn march; her face in the light ===================== */
const FACE_D = 'M0,-150 Q-14,-110 -18,-80 Q-22,-64 -21,-56 Q-30,-40 -44,-22 Q-40,-14 -25,-12 Q-30,-4 -28,2 Q-24,8 -22,9 Q-28,14 -25,20 Q-24,34 -18,42 Q-6,56 10,56 Q14,80 18,150 L118,150 Q104,96 104,60 Q124,-20 112,-80 Q92,-150 40,-162 Q14,-164 0,-150 Z';
const HAIR_D = 'M-8,-146 Q30,-206 110,-160 Q160,-110 138,-20 Q130,40 112,80 Q96,60 92,30 Q100,-40 84,-90 Q50,-140 -8,-120 Z';
const facePose = fkPose({hip: 0.655, lean: 2, neck: 10, lt: 2, lk: 2, rt: -3, rk: 3, la: -3, le: 10, ra: 4, re: 14}), FHh = 2300, FHd = jointAt(facePose, 'Head', 0, 0, FHh, true), FX = 1400 - FHd[0], FG = 360 - FHd[1];
export const KF08: React.FC = () => {
	const N = 11, cols = Array.from({length: N}, (_, i) => ({x: 1020 - i * 92 - (i ? 50 : 0) - 26 * rnd(i, 4), g: 912 - i * 13 + 8 * rnd(i, 5), h: 470 * (1 - i * 0.055) * (0.94 + 0.08 * rnd(i, 6))}));
	const bowed = (u: number): Pose => { const p = gaitPose('08_04', u), nk = p.Neck1, d = (n: string, dx: number, dy: number) => [nk[0] + (p[n][0] - nk[0]) * 0.96 + dx, nk[1] + (p[n][1] - nk[1]) * 0.96 + dy] as [number, number];
		return {...p, Head: d('Head', 0.02, -0.006), Top: d('Top', 0.045, -0.012)}; };
	const lifted = (u: number): Pose => { const p = gaitPose('08_04', u), nk = p.Neck1; return {...p, Head: [nk[0] - 0.004, nk[1] + 0.06], Top: [nk[0] - 0.032, nk[1] + 0.124]}; };
	return <g>
		<Plate k="field" />
		{/* her face: a soft light in the cloud bank, brighter than the sunrise behind it */}
		<Glow x={1380} y={590} r={520} c="#ffc89a" o={0.55} id="frSun" />
		<defs><radialGradient id="frFM" cx="0.5" cy="0.45" r="0.5"><stop offset="0.55" stopColor="#fff" stopOpacity="1" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
			<mask id="frFaceM"><ellipse cx={1390} cy={330} rx={260} ry={250} fill="url(#frFM)" /></mask></defs>
		<g mask="url(#frFaceM)" opacity={0.62}><Blur id="frFaceB" s={7}><Rimmed x={FX} ground={FG} h={FHh} pose={facePose} look={{dress: 'dress', head: 'bob'}} flip col="#fff0d8" rimOp={0} /></Blur></g>
		<Glow x={1340} y={330} r={300} c="#fff0d0" o={0.25} id="frFaceG" />
		{/* the column, silhouettes only, walking right; one man lifts his head */}
		{cols.slice().reverse().map((c, k) => { const i = N - 1 - k, u = (i * 0.31 + 0.5 * rnd(i, 9)) % 1;
			return <Rimmed key={i} x={c.x} ground={c.g} h={c.h} pose={i === 0 ? lifted(0.15) : bowed(u)} look={LK.pris} col={i === 0 ? '#0c0c14' : '#141620'} rim="#ffd0b0" rimOp={i === 0 ? 0.65 : 0.25} rimDx={2.2} rimDy={-1.8} />; })}
		{Array.from({length: 26}, (_, i) => <ellipse key={i} cx={1060 - i * 44} cy={924 - i * 6 + (i % 2) * 8} rx={12} ry={4} fill="#5a6278" opacity={0.35} />)}
		<rect x={0} y={0} width={W} height={138} fill="#000" /><rect x={0} y={H - 138} width={W} height={138} fill="#000" />
		<Label date="1942–1945" name="集中营 · 维也纳医生 弗兰克尔" dy={50} />
		<Subs zh="他明白了：人的救赎，[在于爱]。" nat="Er begreift: Die Rettung des Menschen ist die Liebe." band={false} />
	</g>;
};

/* ===================== 9  Harvard 1938 → today ===================== */
export const KF09: React.FC = () => {
	const sx = 870, g = 1050, h = 690;
	const writing = fkPose({hip: 0.37, lean: 16, neck: 10, lt: 86, lk: 90, rt: 82, rk: 86, la: 46, le: 60, ra: 52, re: 64});
	const sofa = fkPose({hip: 0.37, lean: -6, neck: -2, lt: 84, lk: 88, rt: 80, rk: 84, la: 30, le: 40, ra: 52, re: 6});
	const wifeP = fkPose({hip: 0.37, lean: -4, neck: 6, lt: 84, lk: 88, rt: 80, rk: 84, la: 40, le: 50, ra: 30, re: 60});
	const ox = 1480, oh = 660, oHand = jointAt(sofa, 'RHand', ox, g, oh, true);
	const kidP = fkPose({hip: 0.62, lean: 2, neck: -10, lt: 4, lk: 4, rt: -6, rk: 4, la: 0, le: 10, ra: 72, re: 4}), kh = 330;
	const kRel = jointAt(kidP, 'RHand', 0, 0, kh), kx = oHand[0] - kRel[0];
	const lh = jointAt(writing, 'RHand', sx, g, h, true);
	return <g>
		<defs>
			<filter id="hvSepia" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0.42 0.6 0.16 0 0.02  0.36 0.55 0.14 0 0  0.27 0.43 0.11 0 -0.02  0 0 0 1 0" /></filter>
			<linearGradient id="hvSeam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.52" stopColor="#fff" stopOpacity="0" /><stop offset="0.66" stopColor="#fff" stopOpacity="1" /><stop offset="1" stopColor="#fff" stopOpacity="1" /></linearGradient>
			<mask id="hvM"><rect width={W} height={H} fill="url(#hvSeam)" /></mask>
		</defs>
		{/* 1938: the interview room, sepia; the questionnaire on the desk */}
		<g filter="url(#hvSepia)">
			<Plate k="study" x={-560} />
			<rect x={1360} y={0} width={560} height={H} fill="#3a3028" />
			<g transform="translate(560,662) rotate(-3)"><rect x={-90} y={-8} width={170} height={12} fill="#f4efe2" /><rect x={-70} y={-12} width={170} height={12} fill="#ffffff" />{[0, 1, 2].map((i) => <rect key={i} x={-60} y={-11 + i * 3} width={120} height={1} fill="#556" opacity={0.5} />)}</g>
			<Rimmed x={sx} ground={g} h={h} pose={writing} look={LK.student} flip col="#16120f" rim="#ffe6b0" rimOp={0.45} rimDx={2.2} />
			<path d={`M${lh[0] - 4},${lh[1] - 2} L${lh[0] - 26},${lh[1] + 22}`} stroke="#0a0806" strokeWidth={4} />
		</g>
		{/* today: the same man, old, with his family, in warm lamplight */}
		<g mask="url(#hvM)">
			<Sky id="hvWall" stops={[[0, '#5a3c30'], [1, '#2e1e1a']]} />
			<rect x={1380} y={150} width={330} height={380} fill="#a9b8d0" /><Sky id="hvWin" x={1392} y={162} w={306} h={356} stops={[[0, '#f6d0a0'], [1, '#e8a878']]} /><path d="M1545,150 V530 M1380,340 H1710" stroke="#2a1a14" strokeWidth={10} /><rect x={1380} y={150} width={330} height={380} fill="none" stroke="#2a1a14" strokeWidth={14} />
			<Glow x={1800} y={500} r={600} c="#ffb862" o={0.45} id="hvLamp" />
			<g transform="translate(1840,1050)"><rect x={-4} y={-480} width={8} height={480} fill="#1a1210" /><path d="M-50,-470 L50,-470 L34,-540 L-34,-540 Z" fill="#f2c88a" /></g>
			<rect x={0} y={1000} width={W} height={80} fill="#24160f" />
			<path d="M1260,1050 L1260,820 Q1260,760 1320,760 L1880,760 Q1920,760 1920,820 L1920,1050 Z" fill="#3a2418" /><rect x={1240} y={845} width={700} height={80} rx={20} fill="#4a2e20" />
			<Rimmed x={ox + 190} ground={g} h={oh * 0.97} pose={wifeP} look={LK.wife} flip col="#140e0e" rim="#ffd2a0" rimOp={0.45} rimDx={2.2} />
			<Rimmed x={ox} ground={g} h={oh} pose={sofa} look={LK.oldman} flip col="#110c0c" rim="#ffd8a8" rimOp={0.55} rimDx={2.2} />
			<Rimmed x={kx} ground={g} h={kh} pose={kidP} look={LK.kid} col="#120d0d" rim="#ffd8a8" rimOp={0.55} rimDx={-2.2} />
		</g>
		<Glow x={1130} y={540} r={360} c="#fff0d0" o={0.25} id="hvSeamG" />
		<text x={W - 90} y={150} textAnchor="end" style={{fontFamily: MONO, fontWeight: 700, fontSize: 72}} fill="#f4ead2" stroke="rgba(0,0,0,0.5)" strokeWidth={5} paintOrder="stroke">1938 → 2026</text>
		<Label date="1938 年起" name="哈佛 · 波士顿" />
		<Subs zh="好的关系，让人更[快乐]、更[健康]。" nat="Good relationships keep us happier and healthier." />
	</g>;
};

/* ===================== 10  the tablet speaks: the child's hand ===================== */
export const KF10: React.FC = () => {
	const Adult: React.FC<{c: string}> = ({c}) => <g strokeLinecap="round"><path d="M2010,380 L1530,590" stroke={c} strokeWidth={118} fill="none" /><path d="M1590,560 L1540,584" stroke={c} strokeWidth={136} />
		<ellipse cx={1440} cy={652} rx={104} ry={58} fill={c} transform="rotate(32 1440 652)" /><path d="M1492,606 L1420,592" stroke={c} strokeWidth={30} fill="none" /></g>;
	const Child: React.FC<{c: string}> = ({c}) => <g strokeLinecap="round"><path d="M1040,1140 L1296,738" stroke={c} strokeWidth={62} fill="none" /><path d="M1268,780 L1290,746" stroke={c} strokeWidth={74} />
		<ellipse cx={1336} cy={690} rx={52} ry={33} fill={c} transform="rotate(-48 1336 690)" /><path d="M1352,652 Q1392,622 1416,652" stroke={c} strokeWidth={20} fill="none" /><path d="M1370,672 Q1404,652 1424,680" stroke={c} strokeWidth={18} fill="none" /></g>;
	return <g>
		<Sky id="tbBg" stops={[[0, '#120a06'], [1, '#2a160a']]} />
		<Glow x={640} y={480} r={760} c="#ff9e4a" o={0.32} id="tbWarm" />
		<Glow x={1440} y={640} r={420} c="#ffc87a" o={0.28} id="tbHandG" />
		<g transform="rotate(-4 620 480)"><Tablet x={240} y={110} w={760} h={720} seed={5} rows={14} glowRow={7} /></g>
		<g opacity={0.65} transform="translate(-5,-3)"><Adult c="#ffcf8a" /></g><Adult c="#0c0806" />
		<g opacity={0.8} transform="translate(-4,-3)"><Child c="#ffd8a0" /></g><Child c="#1a100b" />
		<Label date="回到 约公元前 1800 年" name="泥板上的史诗" />
		<Subs zh="「看看那个[牵着你手的孩子]，」" nat="ṣubbi ṣeḫram ṣābitu qātīka" />
	</g>;
};
void LATS; void SERIF; void lerp;
