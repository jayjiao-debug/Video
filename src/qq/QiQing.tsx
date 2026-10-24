import React from 'react';
import {AbsoluteFill, Composition, registerRoot, staticFile, useCurrentFrame} from 'remotion';

/* 《七情》 sample — format study after a viral "seven voices" short (structure only; characters, sigils, copy original).
   Source: 《礼记·礼运》“何谓人情？喜、怒、哀、惧、爱、恶、欲，七者弗学而能。”
   Each voice: dark ground, a sigil with a closed-eyed orb → a one-moment caption + the voice's line → the portrait
   opens its eyes and the name is revealed. Every frame is a pure function of T. */

const W = 1920, H = 1080, FPS = 30;
const cl01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (u: number) => { const v = cl01(u); return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
const out3 = (u: number) => 1 - Math.pow(1 - cl01(u), 3);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const fade = (T: number, a: number, d = 0.4) => ease((T - a) / d);
const win = (T: number, a: number, b: number, fi = 0.4, fo = 0.4) => Math.min(fade(T, a, fi), 1 - fade(T, b - fo, fo));
const rnd = (i: number, k = 0) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };

const SERIF = '"Noto Serif CJK SC", serif';
const LATIN = 'Cormorant, "Noto Serif CJK SC", serif';
const GOLD = '#d9b56a';

type Voice = {n: number; ch: string; py: string; col: string; col2: string; when: string; line: string; sym: string; hair: 'short' | 'long'; face: 1 | -1};
const SEVEN = [
	{ch: '喜', col: '#ffc94a'}, {ch: '怒', col: '#ff4a3a'}, {ch: '哀', col: '#7aa2ff'}, {ch: '惧', col: '#6fe3ff'},
	{ch: '爱', col: '#ff5d8f'}, {ch: '恶', col: '#a6e36a'}, {ch: '欲', col: '#c47bff'},
];
const VOICES: Voice[] = [
	{n: 4, ch: '惧', py: 'JÙ', col: '#6fe3ff', col2: '#1d6a8a', when: '它在你按下发送前说', line: '“万一，他不回呢？”', sym: '风中的烛', hair: 'short', face: -1},
	{n: 5, ch: '爱', py: 'ÀI', col: '#ff5d8f', col2: '#8a1d45', when: '它在你记住他随口一句话时说', line: '“他说过，他怕冷。”', sym: '一根红线', hair: 'long', face: -1},
];
const NUM = ['零', '一', '二', '三', '四', '五', '六', '七'];

// timeline
const INTRO = 5.2, CYCLE = 7.6, REVEAL = 3.5;
const OUTRO_AT = INTRO + VOICES.length * CYCLE;
export const QQ_END = OUTRO_AT + 4.6;

// ---------------------------------------------------------------- shared defs
const Defs: React.FC<{col: string}> = ({col}) => (
	<defs>
		<filter id="glowS" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" /></filter>
		<filter id="glowM" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="12" /></filter>
		<filter id="glowL" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="40" /></filter>
		<radialGradient id="bgG" cx="0.68" cy="0.48" r="0.75"><stop offset="0" stopColor="#15121f" /><stop offset="0.55" stopColor="#0a0910" /><stop offset="1" stopColor="#050408" /></radialGradient>
		<radialGradient id="orbG"><stop offset="0" stopColor={col} stopOpacity="0.55" /><stop offset="0.45" stopColor={col} stopOpacity="0.16" /><stop offset="1" stopColor={col} stopOpacity="0" /></radialGradient>
		<radialGradient id="auraG"><stop offset="0" stopColor={col} stopOpacity="0.35" /><stop offset="1" stopColor={col} stopOpacity="0" /></radialGradient>
		<linearGradient id="titleG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="0.55" stopColor={col} /><stop offset="1" stopColor={col} /></linearGradient>
		<path id="ringPath" d="M0,-312 A312,312 0 1,1 -0.1,-312" />
		<path id="ringPath2" d="M0,-262 A262,262 0 1,1 -0.1,-262" />
	</defs>
);

/** background: deep night, slow constellation and drifting motes in the voice's colour */
const Night: React.FC<{T: number; col: string; o?: number}> = ({T, col, o = 1}) => (
	<g opacity={o}>
		<rect width={W} height={H} fill="url(#bgG)" />
		{Array.from({length: 26}, (_, i) => { const x = 820 + rnd(i) * 1080, y = 80 + rnd(i, 1) * 900; return <circle key={i} cx={x} cy={y} r={1 + rnd(i, 2) * 1.6} fill="#e8e2ff" opacity={0.25 + 0.35 * Math.sin(T * 1.3 + i) ** 2} />; })}
		{[[0, 3], [3, 7], [7, 12], [12, 15], [2, 9], [15, 21], [21, 24]].map(([a, b], i) => <line key={i} x1={820 + rnd(a) * 1080} y1={80 + rnd(a, 1) * 900} x2={820 + rnd(b) * 1080} y2={80 + rnd(b, 1) * 900} stroke="#c9c2ff" strokeWidth={0.8} opacity={0.12} />)}
		{Array.from({length: 22}, (_, i) => { const ph = (T * (0.05 + 0.04 * rnd(i, 3)) + rnd(i, 4)) % 1; return <circle key={'m' + i} cx={900 + rnd(i, 5) * 900 + 30 * Math.sin(T * 0.6 + i)} cy={1080 - ph * 1100} r={1.5 + 2 * rnd(i, 6)} fill={col} opacity={0.5 * Math.sin(Math.PI * ph)} />; })}
	</g>
);

/** the sigil: gold rings, ticks, the 礼记 line running round, four star points; inner orb in the voice's colour */
const Sigil: React.FC<{T: number; x: number; y: number; s?: number; col: string; lit: number; o?: number}> = ({T, x, y, s = 1, col, lit, o = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
		<circle r={420} fill="url(#auraG)" opacity={0.5 + 0.5 * lit} />
		<circle r={248} fill="url(#orbG)" />
		<g opacity={0.85}>
			<circle r={336} fill="none" stroke={GOLD} strokeWidth={1.4} opacity={0.6} />
			<circle r={326} fill="none" stroke={GOLD} strokeWidth={4} opacity={0.9} />
			<circle r={290} fill="none" stroke={GOLD} strokeWidth={1.2} opacity={0.55} />
			<circle r={248} fill="none" stroke={GOLD} strokeWidth={2.4} opacity={0.8} />
			<g transform={`rotate(${T * 3})`}>
				{Array.from({length: 120}, (_, i) => <line key={i} x1={0} y1={-326} x2={0} y2={i % 10 === 0 ? -346 : -338} stroke={GOLD} strokeWidth={i % 10 === 0 ? 2.2 : 1} transform={`rotate(${i * 3})`} opacity={0.7} />)}
				<text style={{fontFamily: SERIF, fontSize: 22, letterSpacing: '0.62em', fontWeight: 600}} fill={GOLD} opacity={0.75}><textPath href="#ringPath">喜 怒 哀 惧 爱 恶 欲 · 七 者 弗 学 而 能 · 喜 怒 哀 惧 爱 恶 欲 · 七 者 弗 学 而 能 ·</textPath></text>
			</g>
			<g transform={`rotate(${-T * 5})`}>
				{Array.from({length: 7}, (_, i) => <g key={i} transform={`rotate(${i * 360 / 7}) translate(0,-269)`}><circle r={6} fill="none" stroke={GOLD} strokeWidth={1.6} /><circle r={2} fill={GOLD} /></g>)}
			</g>
			{[0, 90, 180, 270].map((a) => <path key={a} transform={`rotate(${a}) translate(0,-326)`} d="M0,-22 L5,-5 L22,0 L5,5 L0,22 L-5,5 L-22,0 L-5,-5 Z" fill={GOLD} />)}
		</g>
		<circle r={248} fill="none" stroke={col} strokeWidth={3} opacity={0.25 + 0.6 * lit} filter="url(#glowS)" />
	</g>
);

/** closed eyes floating in the orb (before the reveal) */
const OrbEyes: React.FC<{x: number; y: number; col: string; o: number; open: number}> = ({x, y, col, o, open}) => (
	<g transform={`translate(${x},${y})`} opacity={o}>
		{[-1, 1].map((sd) => <g key={sd} transform={`translate(${sd * 44},0)`}>
			<path d={`M-30,0 Q0,${lerp(10, -14, open)} 30,0 Q0,${lerp(10, 14, open)} -30,0 Z`} fill="#fff" opacity={0.25 + 0.75 * open} filter="url(#glowS)" />
			<path d="M-30,0 Q0,12 30,0" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" />
			<path d="M-30,0 Q0,12 30,0" stroke={col} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.6} filter="url(#glowM)" />
			{open < 0.5 && [-18, -6, 6, 18].map((lx) => <line key={lx} x1={lx} y1={7} x2={lx * 1.2} y2={16} stroke="#fff" strokeWidth={2} opacity={0.8} />)}
		</g>)}
	</g>
);

// ---------------------------------------------------------------- the portrait: a profile in one neon line, filled with night
const FACE = 'M0,-235 C70,-232 118,-196 128,-140 C131,-122 130,-110 136,-100 C140,-90 142,-82 146,-72 C156,-50 170,-30 174,-18 C176,-10 168,-4 156,-4 C152,-4 152,2 156,8 C160,13 158,18 150,20 C156,24 156,32 148,38 C142,42 142,50 146,58 C150,74 138,92 112,98 C86,104 64,108 56,128 C50,170 52,220 62,280 C90,322 190,350 280,384 C330,410 352,480 360,620 L-380,620 C-372,480 -340,400 -260,370 C-170,340 -110,320 -96,280 C-84,220 -80,140 -92,80 C-130,40 -168,-20 -165,-90 C-160,-180 -90,-238 0,-235 Z';
const HAIR = {
	short: 'M126,-150 C120,-205 70,-246 0,-248 C-96,-248 -176,-186 -178,-92 C-180,-30 -150,22 -112,58 C-120,10 -126,-40 -110,-84 C-90,-140 -40,-170 20,-176 C64,-180 100,-172 126,-150 Z',
	long: 'M124,-160 C112,-214 62,-252 -6,-252 C-110,-252 -190,-180 -194,-80 C-200,40 -170,170 -210,300 C-226,360 -250,420 -300,470 C-200,450 -150,380 -130,300 C-110,220 -120,120 -100,40 C-90,-20 -96,-80 -70,-122 C-40,-168 30,-186 124,-160 Z',
};
const Portrait: React.FC<{T: number; v: Voice; x: number; y: number; s: number; reveal: number; eyes: number}> = ({T, v, x, y, s, reveal, eyes}) => {
	const draw = out3(reveal);
	const len = 4200;
	const breathe = 1 + 0.006 * Math.sin(T * 1.6);
	return (
		<g transform={`translate(${x},${y}) scale(${v.face * s * lerp(1.06, 1, draw) * breathe},${s * lerp(1.06, 1, draw) * breathe})`} opacity={cl01(reveal * 3)}>
			{/* night-filled silhouette */}
			<path d={FACE} fill="#0b0a12" opacity={draw} />
			<path d={HAIR[v.hair]} fill="#120f1c" opacity={draw} />
			{/* hair strands */}
			{Array.from({length: 7}, (_, i) => <path key={i} d={v.hair === 'short' ? `M${110 - i * 30},${-170 + i * 4} C${60 - i * 30},${-220 + i * 10} ${-60 - i * 12},${-210 + i * 18} ${-150 + i * 6},${-100 + i * 22}` : `M${100 - i * 24},${-176 + i * 2} C${30 - i * 24},${-230 + i * 6} ${-150 - i * 6},${-160 + i * 10} ${-150 - i * 12},${60 + i * 50}`} stroke={v.col} strokeWidth={1.4} fill="none" opacity={0.35 * draw} />)}
			{/* the neon outline draws itself on */}
			<path d={FACE} fill="none" stroke={v.col} strokeWidth={10} opacity={0.55 * draw} filter="url(#glowM)" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
			<path d={FACE} fill="none" stroke={v.col} strokeWidth={3.2} strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
			<path d={HAIR[v.hair]} fill="none" stroke={v.col} strokeWidth={2.4} opacity={0.9} strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
			{/* ear (short hair only) */}
			{v.hair === 'short' && <path d="M-30,-92 C-52,-96 -58,-60 -40,-44 C-34,-40 -28,-44 -30,-52" stroke={v.col} strokeWidth={2.4} fill="none" opacity={draw} />}
			{/* the eye: closed line → opening, white-hot */}
			<g transform="translate(108,-96)">
				<path d={`M-22,0 Q0,${lerp(6, -9, eyes)} 22,2 Q0,${lerp(6, 9, eyes)} -22,0 Z`} fill="#fff" opacity={eyes} />
				<path d={`M-22,0 Q0,${lerp(6, -9, eyes)} 22,2`} stroke="#fff" strokeWidth={3} fill="none" opacity={draw} />
				<ellipse rx={60} ry={30} fill={v.col} opacity={0.75 * eyes} filter="url(#glowM)" />
				<ellipse rx={26} ry={10} fill="#fff" opacity={0.8 * eyes} filter="url(#glowS)" />
			</g>
			<path d="M84,-122 C100,-128 120,-126 134,-116" stroke={v.col} strokeWidth={2.4} fill="none" opacity={draw * 0.9} />
			<path d="M60,40 C76,70 92,90 110,96" stroke={v.col} strokeWidth={1.4} fill="none" opacity={draw * 0.45} />
			{/* per-voice detail */}
			{v.ch === '惧' && <g opacity={draw}>
				{/* a high, buttoned collar: holding itself in */}
				<path d="M-104,250 C-60,226 20,230 70,244 L74,300 C20,286 -60,284 -110,306 Z" fill="#0f1a24" stroke={v.col} strokeWidth={2.4} />
				{[0, 1, 2].map((k) => <circle key={k} cx={-20 + k * 40} cy={262 + k * 2} r={4} fill={v.col} />)}
				{/* frost on the shoulder */}
				{Array.from({length: 9}, (_, k) => <path key={k} transform={`translate(${120 + k * 22},${330 + (k % 3) * 18}) rotate(${k * 37})`} d="M-6,0 L6,0 M0,-6 L0,6 M-4,-4 L4,4 M-4,4 L4,-4" stroke={v.col} strokeWidth={1.4} opacity={0.7} />)}
				{/* a cold sweat drop at the temple */}
				<path d={`M40,${-150 + 6 * Math.sin(T * 2)} c6,10 10,16 0,22 c-10,-6 -6,-12 0,-22 Z`} fill={v.col} opacity={0.8 * eyes} />
			</g>}
			{v.ch === '爱' && <g opacity={draw}>
				{/* a red thread from the ear, down past the shoulder */}
				{/* a red thread tied at the wrist of the hair, trailing down the back */}
				<path d={`M-150,-40 C-170,20 -140,80 -170,140 C-200,200 -160,250 -190,${310 + 8 * Math.sin(T * 1.5)}`} stroke={v.col} strokeWidth={2.6} fill="none" />
				<path d="M-160,-52 c-14,-10 -26,4 -12,12 c-14,8 -2,22 12,12" stroke={v.col} strokeWidth={2.6} fill="none" />
				{/* a flower pin above the ear */}
				{Array.from({length: 5}, (_, k) => <ellipse key={k} cx={-60} cy={-150} rx={7} ry={16} transform={`rotate(${k * 72},-60,-150) translate(0,-12)`} fill="none" stroke={v.col} strokeWidth={2} />)}
				<circle cx={-60} cy={-150} r={5} fill={v.col} />
				<path d="M-60,250 c10,-16 30,-16 22,4 c-6,14 -26,10 -22,-4 Z" fill="none" stroke={v.col} strokeWidth={2.4} />
			</g>}
		</g>
	);
};

/** a line of text that sharpens out of a blur, with a soft bloom */
const BlurText: React.FC<{x: number; y: number; text: string; size: number; u: number; out?: number; weight?: number; col?: string; spacing?: string; anchor?: 'start' | 'middle'; id: string; family?: string}> = ({x, y, text, size, u, out = 0, weight = 900, col = '#fff', spacing = '0.04em', anchor = 'start', id, family = SERIF}) => {
	const b = 14 * (1 - out3(u)) + 18 * ease(out);
	const o = cl01(u * 1.6) * (1 - ease(out));
	if (o <= 0.001) return null;
	return <g>
		<filter id={id} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation={b.toFixed(2)} /></filter>
		<text x={x} y={y} textAnchor={anchor} style={{fontFamily: family, fontWeight: weight, fontSize: size, letterSpacing: spacing}} fill={col} opacity={o * 0.5} filter="url(#glowM)">{text}</text>
		<text x={x + 24 * (1 - out3(u))} y={y} textAnchor={anchor} style={{fontFamily: family, fontWeight: weight, fontSize: size, letterSpacing: spacing}} fill={col} opacity={o} filter={b > 0.2 ? `url(#${id})` : undefined}>{text}</text>
	</g>;
};

/** a small icon: ring + glyph in the voice's colour */
const Mini: React.FC<{x: number; y: number; ch: string; col: string; o: number; s?: number}> = ({x, y, ch, col, o, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
		<circle r={34} fill={col} opacity={0.12} filter="url(#glowM)" />
		<circle r={30} fill="none" stroke={col} strokeWidth={2.4} />
		{Array.from({length: 12}, (_, i) => <line key={i} x1={0} y1={-34} x2={0} y2={-40} stroke={col} strokeWidth={1.6} transform={`rotate(${i * 30})`} />)}
		<text y={13} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 34}} fill={col}>{ch}</text>
	</g>
);

// ---------------------------------------------------------------- one voice
const VoiceScene: React.FC<{T: number; v: Voice}> = ({T, v}) => {
	const cap = fade(T, 0.35, 0.5), quote = fade(T, 0.75, 0.9);
	const flash = Math.max(0, 1 - Math.abs(T - REVEAL) / 0.22);
	const reveal = cl01((T - REVEAL + 0.05) / 0.9), eyes = ease((T - REVEAL - 0.75) / 0.35);
	const outQ = fade(T, REVEAL - 0.35, 0.35);
	const name = fade(T, REVEAL + 0.45, 0.5), sub = fade(T, REVEAL + 0.25, 0.4), tags = fade(T, REVEAL + 1.0, 0.5);
	const leave = fade(T, CYCLE - 0.45, 0.45);
	const push = 1 + 0.035 * ease(T / CYCLE);
	const sx = 1440, sy = 520;
	const eyesOrb = 1 - ease((T - REVEAL + 0.15) / 0.3);
	return (
		<svg width={W} height={H}>
			<Defs col={v.col} />
			<g opacity={1 - leave}>
				<Night T={T} col={v.col} />
				<g transform={`translate(${sx},${sy}) scale(${push}) translate(${-sx},${-sy})`}>
					<Sigil T={T} x={sx} y={sy} col={v.col} lit={reveal} o={fade(T, 0, 0.6)} />
					<OrbEyes x={sx} y={sy - 10} col={v.col} o={fade(T, 0.15, 0.5) * eyesOrb} open={0} />
					{/* the voice's emblem at the top of the ring */}
					<g transform={`translate(${sx},${sy - 326})`} opacity={fade(T, 0.3, 0.6)}>
						<circle r={30} fill="#0a0910" stroke={GOLD} strokeWidth={2} />
						{v.ch === '惧' && <><rect x={-5} y={-4} width={10} height={20} rx={2} fill={GOLD} /><path d={`M0,-6 C${-7 + 3 * Math.sin(T * 9)},-14 ${-4 + 4 * Math.sin(T * 11)},-22 0,-26 C4,-20 6,-12 0,-6 Z`} fill={v.col} /></>}
						{v.ch === '爱' && <path d="M-14,-4 C-14,-16 0,-16 0,-6 C0,-16 14,-16 14,-4 C14,6 0,14 0,18 C0,14 -14,6 -14,-4 Z" fill="none" stroke={v.col} strokeWidth={2.4} />}
					</g>
					{reveal > 0 && <Portrait T={T} v={v} x={sx + 10} y={sy + 96} s={1.12} reveal={reveal} eyes={eyes} />}
				</g>
				{/* left: the moment and the line */}
				<BlurText id={`cap${v.n}`} x={210} y={470} text={v.when} size={34} weight={600} col="#bdb6cc" spacing="0.16em" u={cap} out={outQ} />
				<BlurText id={`q${v.n}`} x={190} y={580} text={v.line} size={80} u={quote} out={outQ} />
				{/* left: the name */}
				<BlurText id={`s${v.n}`} x={250} y={380} text={`七情之${NUM[v.n]}，它的名字叫`} size={34} weight={600} col="#d8d2e6" spacing="0.12em" u={sub} />
				{name > 0 && <g opacity={name}>
					<text x={240} y={640} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 260}} fill={v.col} opacity={0.55} filter="url(#glowM)">{v.ch}</text>
					<text x={240 + 30 * (1 - out3(name))} y={640} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 260}} fill="url(#titleG)">{v.ch}</text>
					<text x={250} y={730} style={{fontFamily: LATIN, fontStyle: 'italic', fontWeight: 700, fontSize: 50, letterSpacing: '0.18em'}} fill="#efe9ff">{v.py}</text>
				</g>}
				{tags > 0 && <g opacity={tags} transform="translate(250,790)">
					{[['出处', '《礼记·礼运》'], ['象征', v.sym]].map(([k, val], i) => <g key={k} transform={`translate(${i * 330},0)`}>
						<rect x={0} y={-30} width={62} height={40} rx={4} fill={v.col} opacity={0.9} />
						<text x={31} y={-2} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 22}} fill="#0a0910">{k}</text>
						<text x={78} y={-1} style={{fontFamily: SERIF, fontWeight: 600, fontSize: 28}} fill="#e8e2f4">{val}</text>
					</g>)}
				</g>}
			</g>
			{/* the reveal flash */}
			{flash > 0 && <>
				<rect width={W} height={H} fill={v.col} opacity={0.18 * flash} />
				<ellipse cx={sx} cy={sy} rx={900 * flash} ry={60 + 40 * flash} fill="#fff" opacity={0.55 * flash} filter="url(#glowL)" />
				<ellipse cx={600} cy={540} rx={700} ry={18} fill="#fff" opacity={0.7 * flash} filter="url(#glowM)" />
			</>}
		</svg>
	);
};

// ---------------------------------------------------------------- intro and outro
const Intro: React.FC<{T: number}> = ({T}) => {
	const l1 = fade(T, 0.25, 0.6), l2 = fade(T, 1.0, 0.8), leave = fade(T, INTRO - 0.5, 0.5);
	return (
		<svg width={W} height={H}>
			<Defs col="#c9c2ff" />
			<g opacity={1 - leave}>
				<rect width={W} height={H} fill="#060509" />
				<BlurText id="i1" x={960} y={400} text="两千年前，《礼记》写道：" size={38} weight={600} col="#bdb6cc" spacing="0.14em" anchor="middle" u={l1} />
				<BlurText id="i2" x={960} y={510} text="人心里，天生住着七个声音。" size={78} anchor="middle" u={l2} />
				{SEVEN.map((s, i) => { const o = fade(T, 2.3 + i * 0.22, 0.3); return <Mini key={s.ch} x={960 + (i - 3) * 118} y={660} ch={s.ch} col={s.col} o={o} s={lerp(1.4, 1, out3(o))} />; })}
				<BlurText id="i3" x={960} y={790} text="七者弗学而能" size={30} weight={600} col={GOLD} spacing="0.6em" anchor="middle" u={fade(T, 4.0, 0.6)} />
			</g>
		</svg>
	);
};
const Outro: React.FC<{T: number}> = ({T}) => {
	const q = fade(T, 0.2, 0.7), title = fade(T, 2.2, 0.7), qOut = fade(T, 1.7, 0.45);
	return (
		<svg width={W} height={H}>
			<Defs col="#c9c2ff" />
			<rect width={W} height={H} fill="#060509" />
			<g opacity={1 - qOut}>
				<BlurText id="o1" x={960} y={460} text="你心里，哪个声音最大？" size={70} anchor="middle" u={q} />
				{SEVEN.map((s, i) => <Mini key={s.ch} x={960 + (i - 3) * 118} y={600} ch={s.ch} col={s.col} o={fade(T, 0.7 + i * 0.1, 0.3)} />)}
			</g>
			{title > 0 && <g opacity={title}>
				<text x={960} y={560} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 200, letterSpacing: '0.15em'}} fill="#fff6e0" opacity={0.6} filter="url(#glowM)">七情</text>
				<text x={960} y={560} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 200, letterSpacing: '0.15em'}} fill="#fff6e0">七情</text>
				<text x={960} y={650} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 600, fontSize: 34, letterSpacing: '0.9em'}} fill={GOLD}>喜怒哀惧爱恶欲</text>
				{SEVEN.map((s, i) => <circle key={s.ch} cx={960 + (i - 3) * 60} cy={720} r={9} fill={s.col} opacity={0.9} />)}
			</g>}
		</svg>
	);
};

export const QiQing: React.FC = () => {
	const T = useCurrentFrame() / FPS;
	let node: React.ReactNode;
	if (T < INTRO) node = <Intro T={T} />;
	else if (T < OUTRO_AT) { const i = Math.floor((T - INTRO) / CYCLE); node = <VoiceScene T={T - INTRO - i * CYCLE} v={VOICES[i]} />; }
	else node = <Outro T={T - OUTRO_AT} />;
	return <AbsoluteFill style={{background: '#060509'}}>
		<style>{`@font-face{font-family:Cormorant;font-style:italic;font-weight:700;src:url(${staticFile('fonts/cormorant-garamond-latin-500-italic.woff2')}) format('woff2');}`}</style>
		{node}
		<div style={{position: 'absolute', right: 56, bottom: 40, fontFamily: SERIF, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(230,224,245,0.4)'}}>VIBE知识大赏 · 七情</div>
	</AbsoluteFill>;
};

registerRoot(() => <Composition id="QQ" component={QiQing} durationInFrames={Math.round(QQ_END * FPS)} fps={FPS} width={W} height={H} />);
