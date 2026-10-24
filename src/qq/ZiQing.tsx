import React from 'react';
import {AbsoluteFill, Composition, continueRender, delayRender, registerRoot, staticFile, useCurrentFrame} from 'remotion';

/* 《字里七情》 — sample (惧, 爱). Our own format: a moment painted on a folding fan + the voice's line in vertical brush
   script → "七情里，它是谁？" (seven seals, the viewer guesses) → the seal stamps the answer → the old form of the character
   is taken apart to show what is hidden in it (懼 holds 瞿, a hawk's stare; 愛 holds a 心).
   Look: 宣纸, 墨, 朱砂 and mineral pigments — the channel's own ink look, nothing neon.
   Sources: 《礼记·礼运》“喜怒哀惧爱恶欲，七者弗学而能”；《说文解字》“瞿，鹰隼之视也”“懼，恐也，从心瞿声”。 */

const W = 1920, H = 1080, FPS = 30;
const BEAT = 0.5108, BAR = BEAT * 4;
const cl01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (u: number) => { const v = cl01(u); return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
const out3 = (u: number) => 1 - Math.pow(1 - cl01(u), 3);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const fade = (T: number, a: number, d = 0.4) => ease((T - a) / d);
const rnd = (i: number, k = 0) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };

const KAI = '"LXGW WenKai", "Noto Serif CJK SC", serif';
const SERIF = '"Noto Serif CJK SC", serif';
const C = {paper: '#ebe1c9', paperHi: '#f4ecd9', ink: '#1d1915', inkMid: '#4a4036', inkSoft: 'rgba(29,25,21,0.14)', cinnabar: '#c23a22'};

type Voice = {n: number; ch: string; old: string; pig: string; pigName: string; when: string; line: string; gloss: string[]; punch: string};
const SEVEN = [
	{ch: '喜', pig: '#d9a521'}, {ch: '怒', pig: '#c23a22'}, {ch: '哀', pig: '#3f5f8a'}, {ch: '惧', pig: '#2f7d8c'},
	{ch: '爱', pig: '#b8325a'}, {ch: '恶', pig: '#4f6b3a'}, {ch: '欲', pig: '#7a4a8c'},
];
const VOICES: Voice[] = [
	{n: 4, ch: '惧', old: '懼', pig: '#2f7d8c', pigName: '石青', when: '它在你按下发送前说', line: '万一，他不回呢？',
		gloss: ['懼：一颗心，加一个“瞿”', '《说文》：瞿，鹰隼之视也'], punch: '怕，像心被什么盯住了'},
	{n: 5, ch: '爱', old: '愛', pig: '#b8325a', pigName: '胭脂', when: '它在你记住他随口一句话时说', line: '他说过，他怕冷。',
		gloss: ['愛：正中间，藏着一颗“心”', '简化以后，“心”换成了“友”'], punch: '记得那句话，是心还在'},
];
const NUM = ['零', '一', '二', '三', '四', '五', '六', '七'];

// timeline: whole bars, so every seal lands on a downbeat of the BGM
const INTRO = 4 * BAR, CYCLE = 5 * BAR, SLAM = 2 * BAR;
const OUTRO_AT = INTRO + VOICES.length * CYCLE;
export const ZQ_END = OUTRO_AT + 2 * BAR + 0.4;
export const MUSIC_FROM = 16.63 - (INTRO + SLAM);   // first slam = the track's strongest early hit (mux offset)

// ---------------------------------------------------------------- fonts
const KAI_TEXT = '字里七情喜怒哀惧爱恶欲懼愛瞿忄心友爫冖夂它在你按下发送前说万一他不回呢记住随口一句话时过怕冷是谁礼记说人有弗学而能每种都藏个之四五一颗加鹰隼视也正中间简化以后换成了像被什么盯住得那还最近哪着两千年前七者文';
let kaiState = 'idle';
const useKai = () => {
	if (kaiState !== 'idle' || typeof document === 'undefined') return;
	kaiState = 'loading';
	const h = delayRender('wenkai');
	const link = document.createElement('link');
	link.rel = 'stylesheet'; link.href = staticFile('fonts/wenkai/wenkai-bold.css');
	link.onload = () => { document.fonts.load('700 120px "LXGW WenKai"', KAI_TEXT).then(() => continueRender(h), () => continueRender(h)); };
	link.onerror = () => continueRender(h);
	document.head.appendChild(link);
};

// ---------------------------------------------------------------- paper, brush, washes
const Defs: React.FC = () => (
	<defs>
		<filter id="paperTex" x="0" y="0" width="100%" height="100%">
			<feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="4" seed="3" result="n" />
			<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.36  0 0 0 0 0.22  0 0 0 -0.55 0.34" result="m" />
			<feComposite in="m" in2="SourceGraphic" operator="in" result="mc" />
			<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="8" result="f" />
			<feColorMatrix in="f" type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.24  0 0 0 0 0.15  0 0 0 -1.4 0.5" result="fm" />
			<feComposite in="fm" in2="SourceGraphic" operator="in" result="fc" />
			<feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="mc" /><feMergeNode in="fc" /></feMerge>
		</filter>
		<filter id="brush" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="5" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" /></filter>
		<filter id="brushHeavy" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="11" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="12" xChannelSelector="R" yChannelSelector="G" /></filter>
		<filter id="wash" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="18" /></filter>
		<filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5" /></filter>
		<radialGradient id="vign" cx="0.5" cy="0.45" r="0.78"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#3a2a18" stopOpacity="0.4" /></radialGradient>
	</defs>
);
const Paper: React.FC = () => <><rect width={W} height={H} fill={C.paper} filter="url(#paperTex)" /><rect width={W} height={H} fill="url(#vign)" /></>;

/** a red seal with one character; carved = white strokes on red */
const Seal: React.FC<{x: number; y: number; s: number; ch: string; o?: number; rot?: number; col?: string}> = ({x, y, s, ch, o = 1, rot = -4, col = C.cinnabar}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={o}>
		<rect x={-50} y={-50} width={100} height={100} rx={8} fill={col} filter="url(#brush)" />
		<rect x={-42} y={-42} width={84} height={84} rx={5} fill="none" stroke={C.paperHi} strokeWidth={3} opacity={0.85} filter="url(#brush)" />
		<text x={0} y={25} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 70}} fill={C.paperHi}>{ch}</text>
	</g>
);

/** vertical brush text that is written top-down (a mask slides down the column) */
const Column: React.FC<{x: number; y: number; text: string; size: number; u: number; col?: string; id: string; spacing?: number}> = ({x, y, text, size, u, col = C.ink, id, spacing = 0.08}) => {
	if (u <= 0) return null;
	const len = text.length * size * (1 + spacing) + 20;
	return <g>
		<clipPath id={id}><rect x={x - size} y={y - 10} width={size * 2} height={len * out3(u) + 10} /></clipPath>
		<text x={x} y={y} clipPath={`url(#${id})`} style={{fontFamily: KAI, fontWeight: 700, fontSize: size, writingMode: 'vertical-rl', letterSpacing: `${spacing}em`}} fill={col} filter="url(#brush)">{text}</text>
	</g>;
};

/** the folding fan: it opens from a closed stick; the moment is painted inside */
const FAN = {cx: 700, cy: 960, r1: 250, r2: 720, a0: -150, a1: -30};
const pol = (r: number, a: number): [number, number] => [FAN.cx + r * Math.cos(a * Math.PI / 180), FAN.cy + r * Math.sin(a * Math.PI / 180)];
const fanPath = (a0: number, a1: number) => { const p1 = pol(FAN.r2, a0), p2 = pol(FAN.r2, a1), p3 = pol(FAN.r1, a1), p4 = pol(FAN.r1, a0); return `M${p1[0]},${p1[1]} A${FAN.r2},${FAN.r2} 0 0,1 ${p2[0]},${p2[1]} L${p3[0]},${p3[1]} A${FAN.r1},${FAN.r1} 0 0,0 ${p4[0]},${p4[1]} Z`; };
const Fan: React.FC<{open: number; id: string; children?: React.ReactNode; o?: number}> = ({open, id, children, o = 1}) => {
	const mid = (FAN.a0 + FAN.a1) / 2, half = (FAN.a1 - FAN.a0) / 2 * out3(open);
	const a0 = mid - half, a1 = mid + half;
	if (open <= 0) return null;
	return <g opacity={o}>
		<clipPath id={id}><path d={fanPath(a0, a1)} /></clipPath>
		<path d={fanPath(a0, a1)} fill={C.inkSoft} transform="translate(10,14)" filter="url(#wash)" />
		<path d={fanPath(a0, a1)} fill={C.paperHi} filter="url(#paperTex)" />
		<g clipPath={`url(#${id})`}>{children}</g>
		{Array.from({length: 17}, (_, i) => { const a = lerp(a0, a1, i / 16), p = pol(FAN.r1 - 40, a), q = pol(FAN.r2, a); return <line key={i} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={C.inkMid} strokeWidth={1.2} opacity={0.18} />; })}
		<path d={fanPath(a0, a1)} fill="none" stroke={C.ink} strokeWidth={4} filter="url(#brush)" />
		{/* guard sticks and the rivet */}
		{[a0, a1].map((a, i) => { const p = pol(30, a), q = pol(FAN.r2 + 14, a); return <line key={i} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke="#5a3a1e" strokeWidth={14} strokeLinecap="round" />; })}
		<circle cx={FAN.cx} cy={FAN.cy} r={14} fill="#3a2614" />
	</g>;
};

// ---------------------------------------------------------------- the moments, painted in ink
const MomentFear: React.FC<{T: number; o: number}> = ({T, o}) => {
	const shake = 3 * Math.sin(T * 31) * Math.sin(T * 7);
	return <g opacity={o}>
		<ellipse cx={560} cy={560} rx={240} ry={150} fill={VOICES[0].pig} opacity={0.12} filter="url(#wash)" />
		{/* a phone in ink, a message typed, the thumb hovering over 发送 */}
		<g transform="translate(470,370) rotate(-6)">
			<rect x={0} y={0} width={190} height={360} rx={26} fill="#2a2420" filter="url(#brush)" />
			<rect x={12} y={18} width={166} height={318} rx={14} fill={C.paperHi} />
			<rect x={70} y={150} width={96} height={40} rx={14} fill="#d8e6e2" stroke={C.inkMid} strokeWidth={1.5} />
			<text x={84} y={178} style={{fontFamily: KAI, fontWeight: 700, fontSize: 22}} fill={C.ink}>在吗？</text>
			<rect x={20} y={290} width={110} height={34} rx={12} fill="none" stroke={C.inkMid} strokeWidth={1.5} />
			<rect x={136} y={290} width={36} height={34} rx={12} fill={VOICES[0].pig} />
			<text x={154} y={313} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 16}} fill="#fff">发送</text>
		</g>
		{/* the thumb: hovering, trembling, not pressing */}
		<g transform={`translate(${650 + shake},${600 + shake * 0.6}) rotate(-28)`}>
			<path d="M-40,40 C-46,-10 -30,-46 0,-50 C30,-48 40,-14 34,40 C28,90 -34,90 -40,40 Z" fill="#e9d9bf" stroke={C.ink} strokeWidth={4} filter="url(#brush)" />
			<path d="M-16,-34 C-6,-42 8,-42 16,-32" stroke={C.inkMid} strokeWidth={2.4} fill="none" />
		</g>
		{[0, 1, 2].map((i) => <path key={i} d={`M${700 + i * 16},${640 - i * 22} q10,-8 18,0`} stroke={C.inkMid} strokeWidth={2.4} fill="none" opacity={0.5 + 0.5 * Math.sin(T * 9 + i)} />)}
	</g>;
};
const MomentLove: React.FC<{T: number; o: number}> = ({T, o}) => (
	<g opacity={o}>
		<ellipse cx={560} cy={560} rx={240} ry={150} fill={VOICES[1].pig} opacity={0.12} filter="url(#wash)" />
		{/* a cup of hot water and a folded red scarf: he said he feels the cold */}
		<g transform="translate(420,430)">
			<path d="M0,40 L16,230 C20,252 120,252 124,230 L140,40 Z" fill={C.paperHi} stroke={C.ink} strokeWidth={5} filter="url(#brush)" />
			<ellipse cx={70} cy={40} rx={70} ry={16} fill="#e6d6b8" stroke={C.ink} strokeWidth={4} filter="url(#brush)" />
			<path d="M140,80 C190,80 190,170 132,170" stroke={C.ink} strokeWidth={6} fill="none" filter="url(#brush)" />
			{[0, 1, 2].map((i) => { const ph = (T * 0.5 + i / 3) % 1; return <path key={i} d={`M${40 + i * 30},${20 - ph * 140} c-16,-24 16,-40 0,-64`} stroke={C.inkMid} strokeWidth={3} fill="none" opacity={Math.sin(Math.PI * ph) * 0.7} />; })}
		</g>
		<g transform="translate(560,600) rotate(-8)">
			<path d="M0,0 C60,-20 160,-16 230,10 L220,70 C150,46 70,44 0,64 Z" fill={VOICES[1].pig} filter="url(#brush)" />
			{Array.from({length: 10}, (_, i) => <line key={i} x1={14 + i * 22} y1={2 - (i > 5 ? -4 : 0)} x2={10 + i * 22} y2={60} stroke="#8a1e3e" strokeWidth={2} opacity={0.6} />)}
			{[0, 1, 2, 3, 4].map((i) => <line key={'f' + i} x1={222 + i * 2} y1={14 + i * 12} x2={250 + i * 4} y2={24 + i * 14} stroke={VOICES[1].pig} strokeWidth={3} />)}
		</g>
	</g>
);

// ---------------------------------------------------------------- the character, taken apart
const OldGlyph: React.FC<{T: number; v: Voice; u: number; apart: number}> = ({T, v, u, apart}) => {
	const x = 600, y = 760, f = 470;
	const a = ease(apart);
	return <g opacity={cl01(u * 3)}>
		<ellipse cx={x} cy={y - 170} rx={330} ry={300} fill={v.pig} opacity={0.10 + 0.08 * u} filter="url(#wash)" />
		{v.old === '懼' ? <>
			{/* whole 懼, then it opens: the heart (忄) on the left, 瞿 — two staring eyes over a bird — on the right, in 石青 */}
			<text x={x} y={y} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: f}} fill={C.ink} filter="url(#brush)" opacity={1 - a}>懼</text>
			<g opacity={a}>
				<text x={x - 150 - 70 * a} y={y} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: f}} fill={C.ink} filter="url(#brush)" transform={`translate(${x - 150 - 70 * a},0) scale(0.42,1) translate(${-(x - 150 - 70 * a)},0)`}>忄</text>
				<text x={x + 70 + 70 * a} y={y} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: f}} fill={v.pig} filter="url(#brush)" transform={`translate(${x + 70 + 70 * a},0) scale(0.72,1) translate(${-(x + 70 + 70 * a)},0)`}>瞿</text>
				{/* the two eyes of 瞿, circled */}
				{[-1, 1].map((sd) => <circle key={sd} cx={x + 70 + 70 * a + sd * 62} cy={y - 330} r={lerp(0, 52, ease((apart - 0.5) * 2))} fill="none" stroke={C.cinnabar} strokeWidth={4} filter="url(#brush)" />)}
			</g>
		</> : <>
			{/* whole 愛; its middle 心 lifts out in 胭脂 */}
			<text x={x} y={y} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: f}} fill={C.ink} filter="url(#brush)">愛</text>
			{/* the 心 inside lights up in 胭脂, then a copy floats out of it */}
			<text x={x} y={y - 150} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 150}} fill={v.pig} opacity={0.0} />
			<ellipse cx={x} cy={y - 200} rx={130} ry={56} fill={v.pig} opacity={0.22 * cl01(apart * 3)} filter="url(#wash)" />
			<text x={lerp(x, x + 330, a)} y={lerp(y - 150, y - 250, a)} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: lerp(130, 230, a)}} fill={v.pig} filter="url(#brush)" opacity={cl01(apart * 4)}>心</text>
			{a > 0.6 && <path d={`M${x + 80},${y - 190} C${x + 160},${y - 260} ${x + 220},${y - 280} ${x + 260},${y - 300}`} stroke={v.pig} strokeWidth={3} strokeDasharray="8 10" fill="none" opacity={(a - 0.6) / 0.4} />}
		</>}
		{/* a gentle breath so the still glyph is alive */}
		<circle cx={x + 230} cy={y - 420} r={4 + 2 * Math.sin(T * 2)} fill={v.pig} opacity={0.5 * u} />
	</g>;
};

// ---------------------------------------------------------------- one voice
const VoiceScene: React.FC<{T: number; v: Voice; k: number}> = ({T, v, k}) => {
	const fanOpen = fade(T, 0.05, 0.7), moment = fade(T, 0.45, 0.7);
	const cap = cl01((T - 0.7) / 0.7), line = cl01((T - 1.25) / 1.0);
	const quiz = cl01((T - (SLAM - 1.25)) / 0.3) * (1 - fade(T, SLAM - 0.08, 0.15));
	const dim = 1 - 0.85 * cl01((T - (SLAM - 1.3)) / 0.3);
	const slam = cl01((T - SLAM) / 0.14), after = T >= SLAM;
	const glyph = fade(T, SLAM + 0.05, 0.5), apart = cl01((T - SLAM - 1.2) / 0.9);
	const g1 = cl01((T - SLAM - 1.6) / 0.8), g2 = cl01((T - SLAM - 2.6) / 0.8), punch = cl01((T - SLAM - 3.7) / 0.9);
	const wipe = cl01((T - (CYCLE - 0.55)) / 0.55);
	const answer = SEVEN.findIndex((s) => s.ch === v.ch);
	return (
		<svg width={W} height={H}>
			<Defs />
			<Paper />
			{!after && <g opacity={dim}>
				<Fan open={fanOpen} id={`fan${k}`}><g transform="translate(700,485) scale(1.0) translate(-560,-560)">{v.ch === '惧' ? <MomentFear T={T} o={moment} /> : <MomentLove T={T} o={moment} />}</g></Fan>
				<Column id={`cap${k}`} x={1720} y={190} text={v.when} size={40} u={cap} col={C.inkMid} />
				<Column id={`line${k}`} x={1580} y={190} text={v.line} size={96} u={line} />
				<g opacity={fade(T, 1.9, 0.5)}><Seal x={1560} y={150 + v.line.length * 104 + 70} s={0.42} ch="问" rot={6} col={v.pig} /></g>
			</g>}
			{/* the guess: seven seals; the answer jumps */}
			{quiz > 0 && <g opacity={quiz}>
				<text x={960} y={440} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 76}} fill={C.ink} filter="url(#brush)">七情里，它是谁？</text>
				{SEVEN.map((s, i) => { const hop = i === answer ? 26 * Math.max(0, Math.sin((T - (SLAM - 0.7)) * 14)) * cl01((T - (SLAM - 0.7)) / 0.1) : 0; return <g key={s.ch} transform={`translate(0,${-hop})`}><Seal x={960 + (i - 3) * 130} y={600 + 6 * Math.sin(T * 6 + i)} s={0.95} ch={s.ch} col={s.pig} rot={(i - 3) * 2} /></g>; })}
			</g>}
			{after && <g opacity={1 - wipe * 0.0}>
				<OldGlyph T={T} v={v} u={glyph} apart={apart} />
				{/* the answer seal stamps in, with an ink splash */}
				{Array.from({length: 10}, (_, i) => { const a = rnd(i, k) * Math.PI * 2, d = 120 * out3(slam) * (0.6 + rnd(i, 3)); return <circle key={i} cx={1040 + Math.cos(a) * d} cy={250 + Math.sin(a) * d} r={6 + 10 * rnd(i, 4)} fill={v.pig} opacity={0.8 * (1 - fade(T, SLAM + 0.3, 0.8))} filter="url(#brushHeavy)" />; })}
				<Seal x={1040} y={250} s={lerp(2.6, 1.25, out3(slam))} ch={v.ch} col={v.pig} rot={-8} o={cl01(slam * 3)} />
				{/* vertical notes on the right, read right to left */}
				<Column id={`n0${k}`} x={1740} y={170} text={`七情之${NUM[v.n]} · ${v.ch}`} size={46} u={fade(T, SLAM + 0.4, 0.6)} col={v.pig} />
				<Column id={`g1${k}`} x={1620} y={170} text={v.gloss[0]} size={50} u={g1} />
				<Column id={`g2${k}`} x={1510} y={170} text={v.gloss[1]} size={42} u={g2} col={C.inkMid} />
				<Column id={`p${k}`} x={1370} y={170} text={v.punch} size={64} u={punch} col={C.cinnabar} />
				<text x={1756} y={1000} textAnchor="end" style={{fontFamily: SERIF, fontSize: 22, letterSpacing: '0.2em'}} fill={C.inkMid} opacity={0.7 * glyph}>颜料 · {v.pigName}</text>
			</g>}
			{/* exit: an ink wash in the voice's pigment sweeps across */}
			{wipe > 0 && <g>
				<ellipse cx={lerp(-600, 2600, ease(wipe))} cy={540} rx={1100} ry={900} fill={v.pig} opacity={0.92} filter="url(#wash)" />
				<rect x={lerp(-1800, 1600, ease(wipe))} y={0} width={1200} height={H} fill={C.paper} opacity={ease((wipe - 0.4) / 0.6)} filter="url(#wash)" />
			</g>}
		</svg>
	);
};

// ---------------------------------------------------------------- intro and outro
const Intro: React.FC<{T: number}> = ({T}) => {
	const leave = cl01((T - (INTRO - 0.4)) / 0.4);
	return (
		<svg width={W} height={H}>
			<Defs />
			<Paper />
			<g opacity={1 - leave}>
				<Column id="i1" x={1520} y={170} text="两千年前，《礼记》说：" size={48} u={cl01((T - 0.2) / 0.8)} col={C.inkMid} />
				{SEVEN.map((s, i) => { const t0 = 1.15 + i * BEAT * 0.5, u = cl01((T - t0) / 0.12); return u > 0 && <Seal key={s.ch} x={1340 - i * 0} y={190 + i * 110} s={lerp(1.8, 0.95, out3(u))} ch={s.ch} col={s.pig} rot={(i % 2 ? 4 : -4)} />; })}
				<Column id="i2" x={1160} y={250} text="七者，弗学而能。" size={72} u={cl01((T - 3.2) / 0.8)} />
				<Column id="i3" x={760} y={210} text="每一种情，" size={88} u={cl01((T - 4.0) / 0.6)} col={C.cinnabar} />
				<Column id="i4" x={620} y={330} text="都藏在一个字里。" size={88} u={cl01((T - 4.6) / 0.8)} col={C.cinnabar} />
			</g>
		</svg>
	);
};
const Outro: React.FC<{T: number}> = ({T}) => {
	const title = fade(T, 1.6, 0.6);
	return (
		<svg width={W} height={H}>
			<Defs />
			<Paper />
			<g opacity={1 - fade(T, 1.3, 0.35)}>
				<text x={960} y={470} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 80}} fill={C.ink} filter="url(#brush)" opacity={fade(T, 0.1, 0.5)}>你最近，被哪个字住着？</text>
				{SEVEN.map((s, i) => <Seal key={s.ch} x={960 + (i - 3) * 130} y={620} s={0.9} ch={s.ch} col={s.pig} o={fade(T, 0.4 + i * 0.08, 0.25)} rot={(i - 3) * 2} />)}
			</g>
			{title > 0 && <g opacity={title}>
				<text x={1000} y={260} style={{fontFamily: KAI, fontWeight: 700, fontSize: 150, writingMode: 'vertical-rl', letterSpacing: '0.1em'}} fill={C.ink} filter="url(#brush)">字里七情</text>
				<Seal x={1000} y={930} s={0.7} ch="情" />
				<text x={760} y={330} style={{fontFamily: KAI, fontWeight: 700, fontSize: 40, writingMode: 'vertical-rl', letterSpacing: '0.5em'}} fill={C.inkMid}>喜怒哀惧爱恶欲</text>
				<text x={1240} y={980} style={{fontFamily: SERIF, fontSize: 24, letterSpacing: '0.3em'}} fill={C.inkMid}>VIBE知识大赏</text>
			</g>}
		</svg>
	);
};

export const ZiQing: React.FC = () => {
	useKai();
	const f = useCurrentFrame(), T = f / FPS;
	let node: React.ReactNode;
	if (T < INTRO) node = <Intro T={T} />;
	else if (T < OUTRO_AT) { const i = Math.floor((T - INTRO) / CYCLE); node = <VoiceScene T={T - INTRO - i * CYCLE} v={VOICES[i]} k={i} />; }
	else node = <Outro T={T - OUTRO_AT} />;
	return <AbsoluteFill style={{background: C.paper}}>
		{node}
	</AbsoluteFill>;
};

registerRoot(() => <Composition id="ZQ" component={ZiQing} durationInFrames={Math.round(ZQ_END * FPS)} fps={FPS} width={W} height={H} />);
