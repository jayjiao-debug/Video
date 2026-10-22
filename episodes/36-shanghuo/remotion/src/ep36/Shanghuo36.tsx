import React from 'react';
import {AbsoluteFill, Composition, continueRender, delayRender, registerRoot, staticFile, useCurrentFrame} from 'remotion';
import {useFonts} from '../looks26/b/kit';
import LINES_RAW from './lines.json';

/* ep36 《上火，到底是什么火？》 — look "宣纸水墨 → 现代图解".
   The ancients' logic is drawn in ink on aged rice paper; vermilion (朱砂) is reserved for 火. When the film says
   "古人说的热，不是瞎猜" the same paper carries clean cobalt diagrams (no fire colours on biology: house rule).
   At the end both drawings sit on the same spot. Every frame is a pure function of T. No film grain (owner). */

const W = 1920, H = 1080, FPS = 30;
type Pt = [number, number];
const LINES = LINES_RAW as [number, number, string][];
export const FILM36_END = LINES[LINES.length - 1][1] + 6.0;   // end card holds to the music's tail (BGM 164.5 s, energy ends ~162 s)
const ln = (n: number) => ({a: LINES[n - 1][0], b: LINES[n - 1][1]});
const cl01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (u: number) => { const v = cl01(u); return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const fadeIn = (T: number, t0: number, d = 0.5) => ease((T - t0) / d);

// ---------------------------------------------------------------- palette (one job per colour)
const C = {
	paper: '#e9dec6', paperDeep: '#d8c7a5', paperEdge: '#c4ad86',
	ink: '#1d1915', inkMid: '#4a4036', inkWash: 'rgba(29,25,21,0.16)',
	fire: '#c8321e', fireHi: '#ee6a3c', fireGlow: 'rgba(214,72,36,0.35)',   // 朱砂: only for 火 / 炎
	cobalt: '#22507a', cobaltSoft: 'rgba(34,80,122,0.14)', grey: '#7b746a',  // modern diagrams
	white: '#f7f1e6',
};
const SERIF = '"Noto Serif CJK SC", serif';
const KAI = '"LXGW WenKai", "Noto Serif CJK SC", serif';
const LATIN = 'Cormorant, "Noto Serif CJK SC", serif';

// ---------------------------------------------------------------- fonts: WenKai (OFL) for brush-like ancient text
const KAI_TEXT = '上火到底是什么火？木火土金水火曰炎上心炎上则口舌生疮阴阳平秘精神乃治炎火光上也说文解字尚书证治准绳黄帝内经红肿热痛溃疡喉咙痛长痘头脸妈爸奶奶验证老祖宗的眼光东西方炎症静动热冷亮暗古人逻辑熬夜吃辣你这是了多喝水少吃辣早点睡';
let kaiState: 'idle' | 'loading' | 'done' = 'idle';
const useKai = () => {
	if (kaiState !== 'idle' || typeof document === 'undefined') return;
	kaiState = 'loading';
	const h = delayRender('wenkai');
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = staticFile('fonts/wenkai/wenkai-bold.css');
	link.onload = () => {
		document.fonts.load(`700 120px "LXGW WenKai"`, KAI_TEXT).then(() => { kaiState = 'done'; continueRender(h); }, () => continueRender(h));
	};
	link.onerror = () => continueRender(h);
	document.head.appendChild(link);
};

// ---------------------------------------------------------------- shared SVG defs: paper, brush edge, washes
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
		<filter id="brush" x="-10%" y="-10%" width="120%" height="120%">
			<feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="5" result="n" />
			<feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
		</filter>
		<filter id="brushHeavy" x="-15%" y="-15%" width="130%" height="130%">
			<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="11" result="n" />
			<feDisplacementMap in="SourceGraphic" in2="n" scale="11" xChannelSelector="R" yChannelSelector="G" />
		</filter>
		<filter id="wash" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14" /></filter>
		<filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5" /></filter>
		<filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="22" /></filter>
		<radialGradient id="vign" cx="0.5" cy="0.45" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#3a2a18" stopOpacity="0.42" /></radialGradient>
		<radialGradient id="fireGlowG"><stop offset="0" stopColor="#ff8a4a" stopOpacity="0.55" /><stop offset="1" stopColor="#ff8a4a" stopOpacity="0" /></radialGradient>
		<linearGradient id="flameG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor={C.fire} /><stop offset="0.7" stopColor={C.fireHi} /><stop offset="1" stopColor="#f6b07a" /></linearGradient>
	</defs>
);
const Paper: React.FC<{tone?: number}> = ({tone = 0}) => (
	<>
		<rect width={W} height={H} fill={tone > 0 ? '#e4dccb' : C.paper} filter="url(#paperTex)" />
		<rect width={W} height={H} fill="url(#vign)" />
	</>
);

/** 墨夜: a near-black ink ground for the hook, the title and the 原来如此 beats (value contrast = impact) */
const InkNight: React.FC<{o?: number; glow?: Pt; g?: number}> = ({o = 1, glow, g = 1}) => (
	<g opacity={o}>
		<defs>
			<radialGradient id="nightG" cx="0.5" cy="0.48" r="0.72"><stop offset="0" stopColor="#221a14" /><stop offset="1" stopColor="#0d0a08" /></radialGradient>
			<radialGradient id="nightGlow"><stop offset="0" stopColor="#7a2a14" stopOpacity="0.7" /><stop offset="0.45" stopColor="#4a1a0e" stopOpacity="0.35" /><stop offset="1" stopColor="#2a120a" stopOpacity="0" /></radialGradient>
		</defs>
		<rect width={W} height={H} fill="url(#nightG)" />
		<rect width={W} height={H} fill={C.paper} filter="url(#paperTex)" opacity={0.035} />
		{glow && <circle cx={glow[0]} cy={glow[1]} r={720} fill="url(#nightGlow)" opacity={g} />}
	</g>
);
/** an ink splash burst (seeded, for slams) */
const Splash: React.FC<{x: number; y: number; r: number; u: number; col?: string; seed?: number}> = ({x, y, r, u, col = C.fire, seed = 1}) => {
	if (u <= 0) return null;
	const R = (i: number) => { const v = Math.sin(seed * 91.7 + i * 12.9898) * 43758.5453; return v - Math.floor(v); };
	const e = ease(u);
	return <g opacity={Math.min(1, u * 3) * (1 - 0.35 * e)} filter="url(#brushHeavy)">
		{Array.from({length: 14}, (_, i) => { const a = R(i) * Math.PI * 2, d = r * (0.55 + 0.7 * R(i + 20)) * e, s2 = r * (0.05 + 0.12 * R(i + 40)); return <circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d * 0.8} r={s2} fill={col} />; })}
		<circle cx={x} cy={y} r={r * 0.42 * (0.6 + 0.4 * e)} fill={col} />
	</g>;
};
/** 鸳鸯锅 from above: the S-shaped divider is a taiji. morph 0 → 1 turns it into the ink taiji (line 12 match cut) */
const Yuanyang: React.FC<{x: number; y: number; r: number; t: number; morph?: number; rot?: number}> = ({x, y, r, t, morph = 0, rot = 0}) => {
	const R = (i: number) => { const v = Math.sin(i * 78.233 + 1.7) * 43758.5453; return v - Math.floor(v); };
	const half = `M0,${-r} A${r},${r} 0 0,1 0,${r} A${r / 2},${r / 2} 0 0,1 0,0 A${r / 2},${r / 2} 0 0,0 0,${-r} Z`;
	const inRed = (px: number, py: number) => { const d = Math.hypot(px, py); if (d > r * 0.94) return -1; const top = Math.hypot(px, py + r / 2) < r / 2, bot = Math.hypot(px, py - r / 2) < r / 2; return (px > 0 && !top) || bot ? 1 : 0; };
	const det = 1 - morph;
	return (
		<g transform={`translate(${x},${y}) rotate(${rot})`}>
			{/* the pot rim (fades away into the taiji's ink ring) */}
			<circle r={r + 46} fill={C.ink} opacity={det} filter="url(#brush)" />
			<circle r={r + 30} fill="#2b2622" opacity={det} />
			{[-1, 1].map((sd) => <rect key={sd} x={sd > 0 ? r + 30 : -r - 110} y={-34} width={80} height={68} rx={22} fill={C.ink} opacity={det} filter="url(#brush)" />)}
			{/* clear broth → paper white */}
			<circle r={r} fill={morph > 0 ? C.white : '#efe2c6'} />
			<circle r={r} fill="#e9d7b0" opacity={det * 0.6} />
			{/* red broth → ink black */}
			<path d={half} fill={C.fire} opacity={det} />
			<path d={half} fill={C.ink} opacity={morph} />
			<path d={half} fill="#ff7a3c" opacity={det * 0.22} filter="url(#soft)" />
			{/* the divider */}
			<path d={`M0,${-r} A${r / 2},${r / 2} 0 0,1 0,0 A${r / 2},${r / 2} 0 0,0 0,${r}`} stroke={C.ink} strokeWidth={lerp(14, 0, morph)} fill="none" />
			<circle r={r} fill="none" stroke={C.ink} strokeWidth={lerp(8, 6, morph)} filter="url(#brush)" />
			{/* boiling: bubbles grow and pop on their own clocks (red side faster) */}
			{det > 0.01 && Array.from({length: 70}, (_, i) => {
				const px = (R(i) * 2 - 1) * r, py = (R(i + 100) * 2 - 1) * r, side = inRed(px, py);
				if (side < 0) return null;
				const sp = side ? 1.9 : 1.1, ph = (t * sp + R(i + 200)) % 1, s2 = (side ? 10 : 7) + 16 * R(i + 300);
				return <circle key={i} cx={px} cy={py} r={s2 * Math.sin(Math.PI * ph)} fill="none" stroke={side ? '#ffb38a' : '#ffffff'} strokeWidth={3} opacity={det * 0.7 * Math.sin(Math.PI * ph)} />;
			})}
			{/* chilli rings and peppercorns in the red; ginger and mushroom slices in the clear */}
			{det > 0.01 && Array.from({length: 26}, (_, i) => {
				const px = (R(i + 400) * 2 - 1) * r * 0.9, py = (R(i + 500) * 2 - 1) * r * 0.9, side = inRed(px, py);
				if (side < 0) return null;
				const dx = 6 * Math.sin(t * 0.9 + i), dy = 6 * Math.cos(t * 0.7 + i);
				return side
					? <g key={i} transform={`translate(${px + dx},${py + dy}) rotate(${R(i) * 360})`} opacity={det}>{i % 3 ? <><path d="M-34,4 Q-6,-16 30,-4 Q36,2 30,6 Q-4,4 -34,4 Z" fill="#8e1a0a" stroke="#5a0e04" strokeWidth={2.5} /><path d="M30,-2 q10,-4 14,-12" stroke="#3d5a22" strokeWidth={5} fill="none" strokeLinecap="round" /></> : <><circle r={6} fill="#3a1408" /><circle cx={12} cy={6} r={5} fill="#3a1408" /><circle cx={-4} cy={12} r={5} fill="#3a1408" /></>}</g>
					: <g key={i} transform={`translate(${px + dx},${py + dy}) rotate(${R(i) * 360})`} opacity={det}><ellipse rx={26} ry={16} fill="#d8c08a" stroke="#a88a52" strokeWidth={3} /></g>;
			})}
			{/* the taiji's two eyes appear */}
			<circle cx={0} cy={-r / 2} r={r * 0.13 * morph} fill={C.ink} />
			<circle cx={0} cy={r / 2} r={r * 0.13 * morph} fill={C.white} />
		</g>
	);
};

// ---------------------------------------------------------------- the subtitle (owner: serif, ink-centred) and the corner mark
const Sub: React.FC<{t: string}> = ({t}) => {
	const segs = t.split(/(\[[^\]]+\])/).filter(Boolean);
	return (
		<>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 76%, rgba(28,20,14,0.42) 90%, rgba(28,20,14,0.55) 100%)'}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 942, textAlign: 'center', fontFamily: SERIF, fontWeight: 600, fontSize: 52, color: C.white, letterSpacing: '0.06em', textShadow: '0 0 3px rgba(20,14,10,0.9), 0 2px 16px rgba(20,14,10,0.85)'}}>
				{segs.map((x, i) => {
					const hi = x[0] === '[', body0 = hi ? x.slice(1, -1) : x, last = i === segs.length - 1;
					const st: React.CSSProperties = hi ? {color: '#ffc98f', textShadow: '0 0 3px rgba(20,14,10,0.9), 0 0 18px rgba(255,140,80,0.45), 0 2px 16px rgba(20,14,10,0.85)'} : {};
					const lead = i === 0 && /^[“《「『（]/.test(body0);
					const body = lead ? body0.slice(1) : body0;
					const head = lead ? <span style={{marginLeft: '-0.5em'}}>{body0[0]}</span> : null;
					if (!last) return <span key={i} style={st}>{head}{body}</span>;
					const end = body.slice(-1), punct = /[？！。，：；、”》」』）]/.test(end);
					return <span key={i} style={st}>{head}{body.slice(0, -1)}<span style={{marginRight: punct ? '-0.56em' : '-0.06em'}}>{end}</span></span>;
				})}
			</div>
		</>
	);
};
const Mark: React.FC<{dark?: boolean}> = ({dark}) => (
	<div style={{position: 'absolute', top: 46, right: 60, fontFamily: SERIF, fontSize: 21, letterSpacing: '0.3em', color: dark ? 'rgba(236,230,218,0.55)' : 'rgba(40,30,22,0.55)'}}>◆ Juno · VIBE知识大赏</div>
);

// ---------------------------------------------------------------- drawing kit
/** a brush flame, base at (0,0), height h, pointing up; lick animates with t */
const Flame: React.FC<{x: number; y: number; h: number; t?: number; o?: number; ink?: boolean; rot?: number}> = ({x, y, h, t = 0, o = 1, ink, rot = 0}) => {
	const w = h * 0.46, s = Math.sin(t * 5.3) * 0.08, s2 = Math.sin(t * 3.7 + 1) * 0.06;
	const d = `M0,0 C${-w},${-h * 0.12} ${-w * 1.05},${-h * (0.5 + s)} ${-w * 0.2},${-h * 0.72} C${-w * 0.42},${-h * 0.86} ${w * (0.1 + s2)},${-h * 0.98} ${w * 0.06},${-h} C${w * 0.3},${-h * 0.8} ${w * 0.95},${-h * (0.55 - s)} ${w * 0.72},${-h * 0.25} C${w * 0.6},${-h * 0.06} ${w * 0.3},0 0,0 Z`;
	const di = `M0,-${h * 0.04} C${-w * 0.45},-${h * 0.14} ${-w * 0.45},-${h * 0.42} ${-w * 0.05},-${h * 0.56} C${w * 0.05},-${h * 0.42} ${w * 0.5},-${h * 0.3} ${w * 0.28},-${h * 0.12} C${w * 0.18},-${h * 0.05} ${w * 0.08},-${h * 0.03} 0,-${h * 0.04} Z`;
	return (
		<g transform={`translate(${x},${y}) rotate(${rot})`} opacity={o}>
			{!ink && <ellipse cx={0} cy={-h * 0.45} rx={h * 0.75} ry={h * 0.85} fill="url(#fireGlowG)" />}
			<path d={d} fill={ink ? C.ink : 'url(#flameG)'} filter="url(#brush)" opacity={ink ? 0.85 : 1} />
			{!ink && <path d={di} fill="#fbd6a8" opacity={0.75} filter="url(#brush)" />}
		</g>
	);
};
/** the faceless ink bust (front view): head, neck, shoulders; positions in bust space (origin at the collarbone centre) */
const BUST = {mouth: [0, -168] as Pt, throat: [0, -92] as Pt, cheek: [58, -214] as Pt, chest: [0, 40] as Pt};
const Bust: React.FC<{x: number; y: number; s?: number; o?: number; wash?: number; light?: number}> = ({x, y, s = 1, o = 1, wash = 1, light = 0}) => (
	<g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
		<ellipse cx={0} cy={-212} rx={112} ry={130} fill={C.inkWash} opacity={wash} filter="url(#wash)" />
		<path d="M-300,260 C-300,120 -230,40 -120,22 C-70,14 -46,-20 -44,-70 L-44,-92 C-80,-112 -98,-160 -98,-214 C-98,-292 -54,-344 0,-344 C54,-344 98,-292 98,-214 C98,-160 80,-112 44,-92 L44,-70 C46,-20 70,14 120,22 C230,40 300,120 300,260"
			fill="none" stroke={light > 0.5 ? '#e9dec6' : C.ink} strokeWidth={7} strokeLinecap="round" filter="url(#brushHeavy)" />
		<path d="M-300,260 C-300,120 -230,40 -120,22 C-70,14 -46,-20 -44,-70 L-44,-92 C-80,-112 -98,-160 -98,-214 C-98,-292 -54,-344 0,-344 C54,-344 98,-292 98,-214 C98,-160 80,-112 44,-92 L44,-70 C46,-20 70,14 120,22 C230,40 300,120 300,260 Z"
			fill={C.inkWash} opacity={0.6 * wash} />
	</g>
);
const BP = (x: number, y: number, s: number, p: Pt): Pt => [x + p[0] * s, y + p[1] * s];
/** a red symptom dot with a small label */
const Dot: React.FC<{p: Pt; label: string; o: number; side?: 1 | -1; modern?: boolean; dark?: number}> = ({p, label, o, side = 1, modern, dark = 0}) => o <= 0 ? null : (
	<g opacity={o}>
		<circle cx={p[0]} cy={p[1]} r={34} fill={modern ? C.cobaltSoft : C.fireGlow} filter="url(#soft)" />
		<circle cx={p[0]} cy={p[1]} r={11} fill={modern ? C.cobalt : C.fire} />
		<circle cx={p[0]} cy={p[1]} r={18 + 8 * (1 - o)} fill="none" stroke={modern ? C.cobalt : C.fire} strokeWidth={2.5} opacity={0.7} />
		<line x1={p[0] + side * 22} y1={p[1]} x2={p[0] + side * 150} y2={p[1]} stroke={modern ? C.cobalt : dark > 0.5 ? C.paper : C.ink} strokeWidth={2.5} opacity={0.75} />
		<text x={p[0] + side * 162} y={p[1] + 16} textAnchor={side > 0 ? 'start' : 'end'} style={{fontFamily: modern ? '"Noto Sans CJK SC", sans-serif' : KAI, fontWeight: 700, fontSize: 58}} fill={modern ? C.cobalt : dark > 0.5 ? C.paper : C.ink}>{label}</text>
	</g>
);
/** a red seal stamp with one character */
const Seal: React.FC<{x: number; y: number; s: number; ch: string; o?: number; rot?: number}> = ({x, y, s, ch, o = 1, rot = -6}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={o}>
		<rect x={-60} y={-60} width={120} height={120} rx={10} fill={C.fire} filter="url(#brush)" />
		<rect x={-50} y={-50} width={100} height={100} rx={6} fill="none" stroke={C.paper} strokeWidth={3} opacity={0.8} filter="url(#brush)" />
		<text x={0} y={30} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 84}} fill={C.paper}>{ch}</text>
	</g>
);
/** taiji (yin-yang) circle, radius r; dark = yin */
const Taiji: React.FC<{x: number; y: number; r: number; rot?: number; o?: number}> = ({x, y, r, rot = 0, o = 1}) => (
	<g transform={`translate(${x},${y}) rotate(${rot})`} opacity={o}>
		<circle r={r + 10} fill={C.inkWash} filter="url(#wash)" />
		<circle r={r} fill={C.white} stroke={C.ink} strokeWidth={6} filter="url(#brush)" />
		<path d={`M0,${-r} A${r},${r} 0 0,1 0,${r} A${r / 2},${r / 2} 0 0,1 0,0 A${r / 2},${r / 2} 0 0,0 0,${-r} Z`} fill={C.ink} filter="url(#brush)" />
		<circle cx={0} cy={-r / 2} r={r * 0.13} fill={C.white} />
		<circle cx={0} cy={r / 2} r={r * 0.13} fill={C.ink} />
	</g>
);
/** a simple ink smartphone, screen content as children (screen box 0..w, 0..h) */
const Phone: React.FC<{x: number; y: number; s?: number; rot?: number; children?: React.ReactNode; glow?: number}> = ({x, y, s = 1, rot = 0, children, glow = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		{glow > 0 && <ellipse cx={130} cy={250} rx={260} ry={320} fill="#cfe2ff" opacity={0.35 * glow} filter="url(#glow)" />}
		<rect x={-14} y={-14} width={288} height={548} rx={40} fill={C.ink} filter="url(#brush)" />
		<rect x={0} y={0} width={260} height={520} rx={28} fill="#14171c" />
		<g clipPath="url(#phoneClip)">{children}</g>
	</g>
);

// ---------------------------------------------------------------- shared geometry (so transitions can carry objects between scenes)
const BODY0 = {x: 800, y: 650, s: 1.34};
const BM = BP(BODY0.x, BODY0.y, BODY0.s, BUST.mouth), BT = BP(BODY0.x, BODY0.y, BODY0.s, BUST.throat), BC = BP(BODY0.x, BODY0.y, BODY0.s, BUST.cheek);
const BHEAD: Pt = [BODY0.x, BODY0.y - 212 * BODY0.s];
/** title line 2, one glyph per cell (so the 火 can fly out of it) */
const T2 = '到底是什么火？', T2F = 196, T2STEP = T2F * 1.04, T1 = '上火，', T1F = 230, T1STEP = T1F * 1.06;
const titleSc = (T: number) => lerp(1.18, 1, ease(cl01((T - ln(4).b) / 0.14))) + 0.03 * ease((T - ln(4).b) / 3);
/** where the title's 火 sits (baseline, font size) */
const titleFire = (T: number) => { const sc = titleSc(T); return {x: 960 + 2 * T2STEP * sc, y: 520 + (700 - 520) * sc, f: T2F * sc}; };
/** the 五行 ring */
const WX = {cx: 960, cy: 470, R: 300};
const tilePos = (i: number): Pt => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; return [WX.cx + WX.R * Math.cos(a), WX.cy + WX.R * Math.sin(a)]; };
/** the bamboo slips: five slips, the text on the middle one */
const SLIP = {x0: 640, w: 120, gap: 10, y0: 140, h: 660, fx: 960, f: 104, base: [300, 430, 560, 690]};
/** a glyph drawn by its baseline centre (all flying glyphs use this, so start and end match their scenes) */
const Glyph: React.FC<{ch: string; x: number; y: number; f: number; col: string; o?: number; font?: string; glow?: boolean}> = ({ch, x, y, f, col, o = 1, font = KAI, glow}) => (
	<g opacity={o}>
		{glow && <text x={x} y={y} textAnchor="middle" style={{fontFamily: font, fontWeight: 700, fontSize: f}} fill="#ffb07a" filter="url(#glow)" opacity={0.5}>{ch}</text>}
		<text x={x} y={y} textAnchor="middle" style={{fontFamily: font, fontWeight: 700, fontSize: f}} fill={col} filter="url(#brush)">{ch}</text>
	</g>
);
const mixHex = (a: string, b: string, u: number) => { const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16)); return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], cl01(u))).toString(16).padStart(2, '0')).join(''); };
/** a point along an arc between two points (lift = how far the path bows up) */
const arc = (a: Pt, b: Pt, u: number, lift = 160): Pt => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) - lift * Math.sin(Math.PI * u)];

// ---------------------------------------------------------------- scenes
// 1–2 · frame 0: one object filling the frame — the 鸳鸯锅 from above, already boiling; the phone at its edge reads 03:00.
//        line 2: mum's message lands big and the 火 seal slams with an ink splash
const Open: React.FC<{T: number}> = ({T}) => {
	const msg = fadeIn(T, ln(2).a, 0.25), slam = cl01((T - ln(2).a - 0.35) / 0.16);
	const push = ease(T / 5);
	return (
		<svg width={W} height={H}>
			<Defs />
			<clipPath id="phoneClip"><rect x={0} y={0} width={260} height={520} rx={28} /></clipPath>
			<InkNight glow={[940, 540]} />
			<g transform={`translate(940,540) scale(${1 + 0.06 * push}) translate(-940,-540)`}>
				<Yuanyang x={940} y={540} r={390} t={T} rot={-24} />
				{/* steam drifting up across the pot */}
				{Array.from({length: 9}, (_, i) => { const ph = (T * 0.28 + i * 0.29) % 1; const x0 = 640 + i * 85 + 40 * Math.sin(T + i); return <ellipse key={i} cx={x0} cy={760 - ph * 700} rx={90 + 60 * ph} ry={40 + 30 * ph} fill="#fff6ea" opacity={0.28 * Math.sin(Math.PI * ph)} filter="url(#glow)" />; })}
			</g>
			{/* the phone lying at the pot's edge: 03:00 */}
			<g transform="translate(1440,640) rotate(14) scale(0.62)">
				<ellipse cx={130} cy={260} rx={330} ry={380} fill="#9fc0ff" opacity={0.28} filter="url(#glow)" />
				<rect x={-14} y={-14} width={288} height={548} rx={40} fill="#0c0d10" />
				<rect x={0} y={0} width={260} height={520} rx={28} fill="#1c2436" />
				<text x={130} y={210} textAnchor="middle" style={{fontFamily: '"Noto Sans CJK SC", sans-serif', fontWeight: 300, fontSize: 96}} fill="#eef3fb">03:00</text>
			</g>
			{/* line 2: mum's message, big; the 火 seal slams */}
			{msg > 0 && <g transform={`translate(150,${150 + 30 * (1 - msg)})`} opacity={msg}>
				<rect x={0} y={0} width={560} height={170} rx={44} fill={C.white} />
				<path d="M60,168 L40,214 L110,168 Z" fill={C.white} />
				<text x={44} y={66} style={{fontFamily: '"Noto Sans CJK SC", sans-serif', fontWeight: 700, fontSize: 40}} fill={C.inkMid}>妈</text>
				<text x={44} y={136} style={{fontFamily: '"Noto Sans CJK SC", sans-serif', fontWeight: 900, fontSize: 64}} fill={C.ink}>你这是上火了</text>
			</g>}
			<Splash x={1260} y={300} r={210} u={slam} seed={3} />
			{slam > 0 && T < ln(3).a && <Seal x={1260} y={300} s={lerp(3.2, 1.9, ease(slam))} ch="火" o={1} rot={-10} />}
		</svg>
	);
};

// 3–4 · the body: the symptoms all sit on the head and face; then they link into an (unlit) diagram
// 9–11 · the same body: flames on the dots, the old book, the flame climbing up
// 32, 36 · the same body with modern labels
const BodyScene: React.FC<{T: number; mode: 'dots' | 'fire' | 'modern' | 'both'}> = ({T, mode}) => {
	const zoom = mode === 'fire' ? fadeIn(T, ln(11).a - 0.3, 1.6) : 0;
	const x = lerp(800, 1080, zoom), y = lerp(650, 980, zoom), s = lerp(1.34, 2.0, zoom);
	const m = BP(x, y, s, BUST.mouth), th = BP(x, y, s, BUST.throat), ch = BP(x, y, s, BUST.cheek), chest = BP(x, y, s, BUST.chest);
	const d3 = (i: number) => mode === 'dots' ? fadeIn(T, ln(3).a + 0.42 + i * 0.6, i === 0 ? 0.08 : 0.35) : 1;
	const link = mode === 'dots' ? fadeIn(T, ln(4).a + 0.2, 1.2) : 0;
	const fl = mode === 'fire' ? fadeIn(T, ln(9).a + 0.3, 0.8) : mode === 'both' ? 1 : 0;
	const book = mode === 'fire' ? cl01(fadeIn(T, ln(10).a, 0.4) - fadeIn(T, ln(11).a - 0.2, 0.4)) : 0;
	const climb = mode === 'fire' ? fadeIn(T, ln(11).a, 2.2) : 0;
	const mod = mode === 'modern' ? fadeIn(T, ln(32).a + 0.2, 0.6) : mode === 'both' ? fadeIn(T, ln(36).a + 0.2, 0.9) : 0;
	return (
		<svg width={W} height={H}>
			<Defs />
			<Paper />
			{zoom > 0 && <InkNight o={zoom} glow={[x, y - 300 * s]} />}
			{zoom > 0 && <>
				{/* the head lit from inside: a warm mass that survives the squint */}
				<ellipse cx={m[0]} cy={m[1] - 60 * s} rx={250 * s} ry={300 * s} fill="#b8361c" opacity={0.55 * zoom} filter="url(#glow)" />
				<ellipse cx={m[0]} cy={m[1] - 40 * s} rx={160 * s} ry={190 * s} fill="#ff8a4a" opacity={0.45 * zoom} filter="url(#glow)" />
			</>}
			<Bust x={x} y={y} s={s} light={zoom} />
			{/* links between the symptoms (line 4): the start of a diagram */}
			{link > 0 && <g opacity={link} stroke={C.ink} strokeWidth={3} fill="none" strokeDasharray="10 12" filter="url(#brush)">
				<path d={`M${m[0]},${m[1]} Q${m[0] + 200},${m[1] - 200} ${ch[0]},${ch[1]}`} />
				<path d={`M${m[0]},${m[1]} L${th[0]},${th[1]}`} />
				<circle cx={x} cy={y - 220 * s} r={320} strokeDasharray="6 16" opacity={0.6} />
			</g>}
			{/* the flame climbing from the chest to the mouth (line 11) */}
			{climb > 0 && (() => {
				const p = (u: number): Pt => [chest[0] + 20 * Math.sin(u * 6), lerp(chest[1], m[1], u)];
				const tip = p(climb);
				return <g>
					<path d={`M${chest[0]},${chest[1]} ${Array.from({length: 24}, (_, i) => { const q = p(climb * (i + 1) / 24); return `L${q[0]},${q[1]}`; }).join(' ')}`} stroke={C.fire} strokeWidth={14} strokeLinecap="round" fill="none" opacity={0.55} filter="url(#soft)" />
					<Flame x={tip[0]} y={tip[1] + 40} h={240} t={T} />
					<text x={120} y={500} style={{fontFamily: KAI, fontWeight: 700, fontSize: 330}} fill={C.white} opacity={ease((climb - 0.35) / 0.35)} filter="url(#brush)">上</text>
					<text x={120} y={860} style={{fontFamily: KAI, fontWeight: 700, fontSize: 330}} fill={C.fire} opacity={ease((climb - 0.5) / 0.35)} filter="url(#brush)">火</text>
				</g>;
			})()}
			{/* flames on the symptoms (line 9) — the ancients' reading */}
			{fl > 0 && [m, th, ch].map((p, i) => <Flame key={i} x={p[0]} y={p[1] + 14} h={70 + 10 * i} t={T + i} o={fl * (mode === 'both' ? 0.8 : 1)} />)}
			<Dot p={m} label="溃疡" o={d3(0) * (1 - mod)} side={-1} dark={zoom} />
			<Dot p={th} label="喉咙痛" o={d3(1) * (1 - mod)} side={-1} dark={zoom} />
			<Dot p={ch} label="长痘" o={d3(2) * (1 - mod)} side={1} dark={zoom} />
			{/* the modern reading (line 32 / 36) */}
			{mod > 0 && <>
				<Dot p={m} label="口腔溃疡 · 炎症" o={mod} side={-1} modern />
				<Dot p={ch} label="痘痘 · 炎症" o={mod} side={1} modern />
			</>}
			{/* the old book (line 10): 《证治准绳》 */}
			{book > 0 && <g transform={`translate(1290,${200 + 30 * (1 - book)})`} opacity={book}>
				<rect x={0} y={0} width={470} height={560} fill="#efe4c9" filter="url(#paperTex)" />
				<rect x={0} y={0} width={470} height={560} fill="none" stroke={C.inkMid} strokeWidth={4} filter="url(#brush)" />
				<text x={420} y={60} style={{fontFamily: KAI, fontWeight: 700, fontSize: 30, writingMode: 'vertical-rl'}} fill={C.inkMid}>《证治准绳》</text>
				{['心火炎上', '熏蒸于口', '则口舌生疮'].map((s2, i) => <text key={i} x={330 - i * 110} y={70} style={{fontFamily: KAI, fontWeight: 700, fontSize: 66, writingMode: 'vertical-rl', letterSpacing: '0.08em'}} fill={i === 0 ? C.fire : C.ink}>{s2}</text>)}
			</g>}
		</svg>
	);
};

// title beat (on the hardest drop): ink night, the title brushed huge in paper white, 火 glowing vermilion; splash + seal
/** the title burns away from the bottom up (fire rises: 炎上); only the red 火 survives it */
const BURN = {start: -1.75, end: -0.12};   // seconds relative to line 5
const burnEdge = (x: number, T: number, Y: number) => Y + 34 * Math.sin(x * 0.011 + 1.3) + 22 * Math.sin(x * 0.029 + T * 1.9) + 9 * Math.sin(x * 0.083 - T * 3.1) + 4 * Math.sin(x * 0.21 + T * 5);
const below = (T: number, Y: number, off: number) => {
	const pts = Array.from({length: 97}, (_, i) => { const x = -40 + i * 21; return `L${x},${(burnEdge(x, T, Y) + off).toFixed(1)}`; }).join(' ');
	return `M-40,1600 ${pts} L1980,1600 Z`;
};
const TitleCard: React.FC<{T: number}> = ({T}) => {
	const t0 = ln(4).b, slam = cl01((T - t0) / 0.14);
	const jolt = slam < 1 ? 0 : 8 * Math.exp(-(T - t0 - 0.14) * 9) * Math.sin((T - t0) * 42);
	const sc = titleSc(T), gone = T >= ln(5).a;
	const tb0 = ln(5).a + BURN.start, tb1 = ln(5).a + BURN.end, p = cl01((T - tb0) / (tb1 - tb0));
	const Y = lerp(960, 120, Math.pow(p, 0.85)), burning = p > 0;
	const band = 46;
	const text = (fill: (i: number, line: number) => string, skipFire = true) => <>
		{[...T1].map((c, i) => <text key={'a' + i} x={960 + (i - 1) * T1STEP} y={420} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: T1F}} fill={fill(i, 1)} filter="url(#brush)">{c}</text>)}
		{[...T2].map((c, i) => (i === 5 && skipFire) ? null : <text key={'b' + i} x={960 + (i - 3) * T2STEP} y={700} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: T2F}} fill={fill(i, 2)} filter="url(#brush)">{c}</text>)}
	</>;
	const fx = 960 + 2 * T2STEP;
	return (
		<svg width={W} height={H}>
			<Defs />
			<defs>
				<mask id="burnKeep" maskUnits="userSpaceOnUse" x={-100} y={-100} width={2200} height={1400}><rect x={-100} y={-100} width={2200} height={1400} fill="#fff" /><path d={below(T, Y, -band)} fill="#000" /></mask>
				<mask id="burnChar" maskUnits="userSpaceOnUse" x={-100} y={-100} width={2200} height={1400}><path d={below(T, Y, -band)} fill="#fff" /><path d={below(T, Y, -10)} fill="#000" /></mask>
				<mask id="burnEdge" maskUnits="userSpaceOnUse" x={-100} y={-100} width={2200} height={1400}><path d={below(T, Y, -22)} fill="#fff" /><path d={below(T, Y, 3)} fill="#000" /></mask>
			</defs>
			<InkNight glow={[1180, 640]} />
			<ellipse cx={1290} cy={610} rx={300} ry={240} fill="#c8321e" opacity={0.22 * slam * (1 - p)} filter="url(#glow)" />
			<g mask={burning ? 'url(#burnKeep)' : undefined}><Splash x={1180} y={600} r={330} u={slam} seed={7} col="#3a1a10" /></g>
			<g transform={`translate(${960 + jolt},520) scale(${sc}) translate(-960,-520)`} opacity={slam}>
				<g mask={burning ? 'url(#burnKeep)' : undefined}>{text(() => C.white)}</g>
				{burning && <>
					<g mask="url(#burnChar)">{text(() => '#6e2410')}</g>
					<g mask="url(#burnChar)" opacity={0.5}>{text(() => '#c8441c')}</g>
					<g mask="url(#burnEdge)" filter="url(#soft)">{text(() => '#ff6a1a')}</g>
					<g mask="url(#burnEdge)" filter="url(#soft)">{text(() => '#ffa04a')}</g>
					<g mask="url(#burnEdge)">{text(() => '#ffd27a')}</g>
				</>}
				{/* the red 火 never burns: it glows hotter while the rest goes */}
				{!gone && <>
					<text x={fx} y={700} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: T2F}} fill="#ffb07a" filter="url(#glow)" opacity={0.25 + 0.6 * p}>火</text>
					<text x={fx} y={700} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: T2F}} fill={mixHex('#ff6a3a', '#ff9a4a', p)} filter="url(#brush)">火</text>
				</>}
			</g>
			{!gone && <ellipse cx={1290} cy={630} rx={160 + 80 * p} ry={150 + 80 * p} fill="url(#fireGlowG)" opacity={slam} />}
			<g mask={burning ? 'url(#burnKeep)' : undefined}>
				<Seal x={1640} y={250} s={lerp(2.4, 1.15, ease(cl01((T - t0 - 0.12) / 0.16)))} ch="火" o={cl01((T - t0 - 0.12) / 0.1)} rot={-12} />
				<text x={960} y={850} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 30, letterSpacing: '0.5em'}} fill="rgba(236,226,206,0.6)" opacity={fadeIn(T, t0 + 0.6, 0.6)}>VIBE 知 识 大 赏</text>
			</g>
			{/* embers peel off the burning edge and rise */}
			{burning && Array.from({length: 70}, (_, i) => {
				const R0 = (k: number) => { const v = Math.sin(i * 19.19 + k * 7.77) * 43758.5453; return v - Math.floor(v); };
				const ts = tb0 + R0(1) * (tb1 - tb0 + 0.3), life = 0.7 + 0.8 * R0(2), u = (T - ts) / life;
				if (u <= 0 || u >= 1) return null;
				const x0 = 230 + R0(3) * 1460, Ys = lerp(960, 120, Math.pow(cl01((ts - tb0) / (tb1 - tb0)), 0.85)), y0 = burnEdge(x0, ts, Ys) - 10;
				if (y0 > 760 || y0 < 140) return null;
				const x = x0 + (R0(4) - 0.5) * 120 * u + 14 * Math.sin(u * 9 + i), y = y0 - (120 + 260 * R0(5)) * u;
				return <circle key={i} cx={x} cy={y} r={(2 + 4 * R0(6)) * (1 - 0.6 * u)} fill={u < 0.4 ? '#ffe2a8' : '#ff8a3a'} opacity={(1 - u) * 0.95} />;
			})}
			{/* smoke */}
			{burning && Array.from({length: 7}, (_, i) => { const u = cl01((T - tb0 - i * 0.18) / 1.6); if (u <= 0 || u >= 1) return null; const x = 400 + i * 190; return <ellipse key={i} cx={x + 30 * Math.sin(u * 4 + i)} cy={burnEdge(x, T, Y) - 80 - 260 * u} rx={110 + 90 * u} ry={50 + 40 * u} fill="#8a7a6a" opacity={0.16 * Math.sin(Math.PI * u)} filter="url(#glow)" />; })}
		</svg>
	);
};

// 5–7 · 五行 as a ring of five changing tiles; 火 grows; 8 · bamboo slips: 火曰炎上
const WuxingScene: React.FC<{T: number}> = ({T}) => {
	const names = ['木', '火', '土', '金', '水'];
	const {cx, cy, R} = WX;
	const big = fadeIn(T, ln(7).a, 0.7);
	const t8 = ln(8).a, iris = ease((T - t8) / 0.55);
	const fly = ease((T - t8 - 0.05) / 0.45);
	const wr = (i: number) => fadeIn(T, t8 + 0.5 + i * 0.28, 0.22);   // 曰 炎 上 brush in after 火 lands
	const tp = tilePos(1);
	return (
		<svg width={W} height={H}>
			<Defs />
			<clipPath id="slipIris"><circle cx={tp[0]} cy={tp[1]} r={2300 * iris} /></clipPath>
			<Paper />
			<g>
				<circle cx={cx} cy={cy} r={R} fill="none" stroke={C.inkMid} strokeWidth={3} strokeDasharray="4 14" filter="url(#brush)" />
				{names.map((n, i) => {
					const [x, y] = tilePos(i);
					const isFire = n === '火';
					const o = isFire ? fadeIn(T, ln(5).a + 0.66, 0.1) : fadeIn(T, ln(5).a + 0.4 + i * 0.32, 0.4);
					const pop = isFire ? 1 + 0.25 * Math.sin(Math.PI * cl01((T - ln(5).a - 0.66) / 0.3)) : 1;
					const sc = (isFire ? 1 + 0.5 * big : 1 - 0.15 * big) * pop;
					return <g key={n} transform={`translate(${x},${y}) scale(${sc})`} opacity={o * (isFire ? 1 : 1 - 0.45 * big)}>
						<circle r={92} fill={isFire && big > 0 ? '#f3d3b8' : C.white} stroke={isFire ? C.fire : C.ink} strokeWidth={6} filter="url(#brush)" />
						{!(isFire && T >= t8) && <text x={0} y={34} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 100}} fill={isFire ? C.fire : C.ink}>{n}</text>}
						{isFire && big > 0 && <Flame x={0} y={-80} h={150 * big} t={T} />}
					</g>;
				})}
				{/* line 6: each phase is a change */}
				<text x={cx} y={cy + 20} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 64}} fill={C.inkMid} opacity={fadeIn(T, ln(6).a + 0.3, 0.6) * (1 - big)}>生 · 变 · 化</text>
				{big > 0 && <g opacity={big}>
					{['热', '红', '往上烧'].map((w, i) => <text key={w} x={cx + 470} y={cy - 150 + i * 120} style={{fontFamily: KAI, fontWeight: 700, fontSize: 76}} fill={i === 1 ? C.fire : C.ink} opacity={fadeIn(T, ln(7).a + 0.4 + i * 0.35, 0.3)}>{w}</text>)}
				</g>}
			</g>
			{/* line 8: ink night opens out of the 火 tile; the 火 itself flies onto the middle slip and the rest is brushed in */}
			{iris > 0 && <g clipPath="url(#slipIris)">
				<InkNight glow={[960, 420]} />
				{[0, 1, 2, 3, 4].map((i) => <g key={i}>
					<rect x={SLIP.x0 + i * (SLIP.w + SLIP.gap)} y={SLIP.y0} width={SLIP.w} height={SLIP.h} rx={8} fill={i % 2 ? '#d9b97c' : '#cfae70'} filter="url(#paperTex)" />
					<rect x={SLIP.x0 + i * (SLIP.w + SLIP.gap)} y={SLIP.y0} width={SLIP.w} height={SLIP.h} rx={8} fill="none" stroke="#8a6a3e" strokeWidth={2} />
					<line x1={SLIP.x0 + i * (SLIP.w + SLIP.gap) + 18} y1={SLIP.y0 + 8} x2={SLIP.x0 + i * (SLIP.w + SLIP.gap) + 18} y2={SLIP.y0 + SLIP.h - 8} stroke="#b8975e" strokeWidth={2} opacity={0.5} />
				</g>)}
				{/* the two binding cords, above and below the text */}
				{[176, 764].map((y) => <g key={y}><rect x={SLIP.x0 - 14} y={y - 4} width={5 * SLIP.w + 4 * SLIP.gap + 28} height={8} rx={4} fill="#6a4a26" />{[0, 1, 2, 3, 4, 5].map((k) => <circle key={k} cx={SLIP.x0 - 5 + k * (SLIP.w + SLIP.gap)} cy={y} r={7} fill="#5a3c1e" />)}</g>)}
				<text x={570} y={470} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 40, writingMode: 'vertical-rl'}} fill="rgba(236,226,206,0.7)">《尚书 · 洪范》</text>
				{T >= t8 + 0.5 && <ellipse cx={SLIP.fx} cy={590} rx={170} ry={230} fill="#e8582c" opacity={0.42 * wr(1) * (0.85 + 0.15 * Math.sin(T * 7))} filter="url(#glow)" />}
				{['曰', '炎', '上'].map((c, i) => { const u = wr(i); return u > 0 && <Glyph key={c} ch={c} x={SLIP.fx} y={SLIP.base[i + 1]} f={SLIP.f * lerp(1.25, 1, u)} col={i >= 1 ? C.fire : C.ink} o={u} />; })}
				{T >= t8 + 0.5 && <Glyph ch="火" x={SLIP.fx} y={SLIP.base[0]} f={SLIP.f} col={C.ink} />}
				{/* heat leaving 炎上: sparks rise off the two red characters, up the slip and out of the top */}
				{Array.from({length: 34}, (_, i) => {
					const R0 = (k: number) => { const v = Math.sin(i * 37.7 + k * 11.3) * 43758.5453; return v - Math.floor(v); };
					const t0 = t8 + 1.0 + R0(1) * 1.4, ph = (T - t0) / (1.1 + R0(2) * 0.6);
					if (ph <= 0 || ph >= 1) return null;
					const y0 = SLIP.base[2 + (i % 2)] - 60, x = SLIP.fx + (R0(3) - 0.5) * 90 + 16 * Math.sin(ph * 7 + i);
					return <circle key={i} cx={x} cy={y0 - ph * (y0 - 60)} r={5 + 7 * R0(4)} fill={i % 3 ? '#ffb07a' : '#ffe2bd'} opacity={Math.sin(Math.PI * ph)} filter={i % 4 ? undefined : 'url(#soft)'} />;
				})}
			</g>}
			{/* the 火 flying from the tile to the slip */}
			{T >= t8 && T < t8 + 0.5 && (() => { const s = 1 + 0.5 * big, a0: Pt = [tp[0], tp[1] + 34 * s], b0: Pt = [SLIP.fx, SLIP.base[0]]; const q = arc(a0, b0, fly, 120); return <Glyph ch="火" x={q[0]} y={q[1]} f={lerp(100 * s, SLIP.f, fly)} col={mixHex(C.fire, C.ink, fly)} />; })()}
		</svg>
	);
};

// 12–17 · 阴阳: the circle, the light/dark world, the balance beam; 16: the taiji as a night clock; 17: chilli on the bright side
const YinYangScene: React.FC<{T: number}> = ({T}) => {
	const world = cl01(fadeIn(T, ln(13).a, 0.5) - fadeIn(T, ln(14).a, 0.5));
	const beam = cl01(fadeIn(T, ln(14).a, 0.5) - fadeIn(T, ln(16).a, 0.5));
	const tilt = fadeIn(T, ln(15).a + 0.2, 0.9) * 14;
	const clock = cl01(fadeIn(T, ln(16).a, 0.6) - fadeIn(T, ln(17).a, 0.5));
	const chili = fadeIn(T, ln(17).a, 0.6);
	const intro = 1 - Math.max(world, beam, clock, chili);
	// zoom into the point of the S where it runs vertical: white to the left, dark to the right = the next shot
	const zu = ease((T - (ln(13).a - 0.45)) / 0.6), zk = Math.pow(12, zu), zp: Pt = [960 + 150, 470 - 150];
	const zoomT = `translate(${lerp(zp[0], 960, zu)},${lerp(zp[1], 540, zu)}) scale(${zk}) translate(${-zp[0]},${-zp[1]})`;
	const doors = ease((T - ln(14).a) / 0.6), dropU = ease((T - ln(14).a - 0.05) / 0.5), landed = T >= ln(14).a + 0.55;
	const spin1 = ease((T - ln(16).a) / 0.6), spin2 = ease((T - ln(17).a) / 0.6);
	const tilt2 = 14 + 8 * fadeIn(T, ln(17).a + 0.6, 0.6);
	return (
		<svg width={W} height={H}>
			<Defs />
			<Paper />
			{intro > 0.01 && <g opacity={T < ln(13).a ? 1 : intro} transform={zoomT}>
				<InkNight o={1 - ease((T - ln(12).a - 0.4) / 1.3)} glow={[960, 470]} />
				<Yuanyang x={lerp(940, 960, ease((T - ln(12).a) / 1.6))} y={lerp(540, 470, ease((T - ln(12).a) / 1.6))} r={lerp(390, 300, ease((T - ln(12).a) / 1.6))} t={T} morph={ease((T - ln(12).a - 0.3) / 1.4)} rot={-24 + 24 * ease((T - ln(12).a) / 2.2)} />
			</g>}
			{(world > 0.01 || (T >= ln(14).a && doors < 1)) && <g opacity={T < ln(14).a ? world : 1}>
				{/* the bright, warm, moving side | the dark, cool, still side; at line 14 they part like two doors */}
				<g transform={`translate(${-960 * doors},0)`}>
					<rect x={0} y={0} width={960} height={H} fill="#f6ecd6" />
					<circle cx={420} cy={250} r={90} fill="#f2b766" opacity={0.85} filter="url(#soft)" />
					<path d="M120,820 C300,700 600,690 900,760 L900,1080 L120,1080 Z" fill={C.paperDeep} filter="url(#brush)" />
					<text x={480} y={680} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 56}} fill={C.ink}>亮 · 热 · 动</text>
				</g>
				<g transform={`translate(${960 * doors},0)`}>
					<rect x={960} y={0} width={960} height={H} fill="#262220" />
					<circle cx={1480} cy={250} r={70} fill="#d8d2c4" opacity={0.85} /><circle cx={1508} cy={236} r={66} fill="#262220" />
					<path d="M1020,760 C1300,690 1600,700 1800,820 L1800,1080 L1020,1080 Z" fill="#3a342c" filter="url(#brush)" />
					<text x={1440} y={680} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 56}} fill="#d8d2c4">暗 · 冷 · 静</text>
				</g>
				{T < ln(14).a && <>
					<text x={480} y={560} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 150}} fill={C.fire}>阳</text>
					<text x={1440} y={560} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 150}} fill={C.white}>阴</text>
				</>}
			</g>}
			{beam > 0.01 && <g opacity={T < ln(16).a ? beam : 1 - spin1} transform={`rotate(${-120 * spin1},960,560) translate(960,560) scale(${1 - 0.5 * spin1}) translate(-960,-560)`}>
				<text x={960} y={200} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 92, letterSpacing: '0.12em'}} fill={C.ink} opacity={1 - fadeIn(T, ln(15).a, 0.4) * 0.6}>阴平阳秘</text>
				<g transform={`translate(960,560)`}>
					<path d="M-30,250 L0,0 L30,250 Z" fill={C.ink} filter="url(#brush)" />
					<g transform={`rotate(${-tilt})`}>
						<rect x={-460} y={-10} width={920} height={20} rx={8} fill={C.ink} filter="url(#brush)" />
						<line x1={-420} y1={0} x2={-420} y2={110} stroke={C.ink} strokeWidth={4} /><line x1={420} y1={0} x2={420} y2={110} stroke={C.ink} strokeWidth={4} />
						<g transform={`translate(-420,110) rotate(${tilt})`}><circle r={84 + 6 * tilt / 14} fill="#f3d3b8" stroke={C.fire} strokeWidth={6} filter="url(#brush)" />{landed && <text y={30} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 80}} fill={C.fire}>阳</text>}</g>
							<g transform={`translate(420,110) rotate(${tilt})`}><circle r={84 - 8 * tilt / 14} fill="#2a2621" stroke={C.ink} strokeWidth={6} filter="url(#brush)" />{landed && <text y={30} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 80}} fill={C.white}>阴</text>}</g>
					</g>
				</g>
			</g>}
			{/* the big 阳 and 阴 drop into the pans */}
			{T >= ln(14).a && !landed && <>
				{(() => { const q = arc([480, 560], [540, 700], dropU, 90); return <Glyph ch="阳" x={q[0]} y={q[1]} f={lerp(150, 80, dropU)} col={C.fire} />; })()}
				{(() => { const q = arc([1440, 560], [1380, 700], dropU, 90); return <Glyph ch="阴" x={q[0]} y={q[1]} f={lerp(150, 80, dropU)} col={C.white} />; })()}
			</>}
			{clock > 0.01 && <g opacity={T < ln(17).a ? clock : 1 - spin2} transform={`rotate(${T < ln(17).a ? 120 * (1 - spin1) : -120 * spin2},960,480) translate(960,480) scale(${T < ln(17).a ? 0.5 + 0.5 * spin1 : 1 - 0.5 * spin2}) translate(-960,-480)`}>
				{/* the taiji as a clock: the dark half is night; at 03:00 a phone is still lit inside it */}
				<Taiji x={960} y={480} r={330} rot={0} />
				{Array.from({length: 12}, (_, i) => { const a = i / 12 * 2 * Math.PI - Math.PI / 2; return <text key={i} x={960 + 395 * Math.cos(a)} y={480 + 395 * Math.sin(a) + 14} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 34}} fill={C.inkMid}>{i === 0 ? 12 : i}</text>; })}
				<line x1={960} y1={480} x2={960 + 250 * Math.cos(-Math.PI / 2 + 3 / 12 * 2 * Math.PI)} y2={480 + 250 * Math.sin(-Math.PI / 2 + 3 / 12 * 2 * Math.PI)} stroke={C.fire} strokeWidth={10} strokeLinecap="round" />
				<line x1={960} y1={480} x2={960} y2={190} stroke={C.fire} strokeWidth={6} strokeLinecap="round" />
				<g transform="translate(1012,598) rotate(-8) scale(0.3)">
					<ellipse cx={130} cy={250} rx={300} ry={360} fill="#cfe2ff" opacity={0.55} filter="url(#glow)" />
					<rect x={0} y={0} width={260} height={520} rx={28} fill="#e8f0ff" stroke={C.white} strokeWidth={10} />
				</g>
				<text x={1440} y={330} style={{fontFamily: KAI, fontWeight: 700, fontSize: 64}} fill={C.ink}>夜 · 属阴</text>
				<text x={1440} y={420} style={{fontFamily: KAI, fontWeight: 700, fontSize: 64}} fill={C.fire}>熬夜 · 在动</text>
			</g>}
			{chili > 0.01 && <g opacity={chili} transform={`rotate(${120 * (1 - spin2)},960,560) translate(960,560) scale(${0.5 + 0.5 * spin2}) translate(-960,-560)`}>
				<g transform={`translate(960,560)`}>
					<path d="M-30,250 L0,0 L30,250 Z" fill={C.ink} filter="url(#brush)" />
					<g transform={`rotate(${-tilt2})`}>
						<rect x={-460} y={-10} width={920} height={20} rx={8} fill={C.ink} filter="url(#brush)" />
						<line x1={-420} y1={0} x2={-420} y2={110} stroke={C.ink} strokeWidth={4} /><line x1={420} y1={0} x2={420} y2={110} stroke={C.ink} strokeWidth={4} />
						<g transform={`translate(-420,110) rotate(${tilt2})`}><circle r={96} fill="#f3d3b8" stroke={C.fire} strokeWidth={6} filter="url(#brush)" /><text y={30} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 80}} fill={C.fire}>阳</text>
							{/* the chilli lands on the bright side */}
							<g transform={`translate(0,${-104 - 260 * (1 - ease(cl01((T - ln(17).a - 0.5) / 0.45)))}) rotate(${-tilt2 + 8})`}><path d="M-60,0 C-40,-30 40,-30 70,-6 C40,14 -20,24 -60,0 Z" fill={C.fire} filter="url(#brush)" /><path d="M-60,0 C-80,-10 -90,-30 -78,-40" stroke="#3d5a2a" strokeWidth={8} fill="none" /></g>
						</g>
						<g transform={`translate(420,110) rotate(${tilt2})`}><circle r={70} fill="#2a2621" stroke={C.ink} strokeWidth={6} filter="url(#brush)" /><text y={30} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 80}} fill={C.white}>阴</text></g>
					</g>
				</g>
			</g>}
		</svg>
	);
};

const LABEL24 = '免疫细胞・一个炎症基因的活跃度';   // 15 cells of 46 px, centred on 炎 at x = 1320
// 18–24 · "不是瞎猜": clean cobalt diagrams on cooler paper (no fire colours on biology)
const ModernScene: React.FC<{T: number}> = ({T}) => {
	const gate = fadeIn(T, ln(19).a + 0.3, 0.6);
	const therm = fadeIn(T, ln(20).a, 0.6);
	const same = fadeIn(T, ln(21).a, 0.6);
	const nobel = fadeIn(T, ln(22).a + 0.2, 0.4);
	const bars = fadeIn(T, ln(23).a, 0.6), grow = fadeIn(T, ln(24).a + 0.2, 1.0);
	const slide = ease((T - ln(23).a) / 0.6);
	const SANS = '"Noto Sans CJK SC", sans-serif';
	return (
		<svg width={W} height={H}>
			<Defs />
			<Paper tone={1} />
			{/* grid of a lab notebook */}
			<g opacity={0.5}>{Array.from({length: 40}, (_, i) => <line key={i} x1={i * 50} y1={0} x2={i * 50} y2={H} stroke={C.cobalt} strokeWidth={0.6} opacity={0.18} />)}{Array.from({length: 22}, (_, i) => <line key={'h' + i} x1={0} y1={i * 50} x2={W} y2={i * 50} stroke={C.cobalt} strokeWidth={0.6} opacity={0.18} />)}</g>
			<text x={120} y={150} style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: '0.1em'}} fill={C.cobalt} opacity={fadeIn(T, ln(18).a + 0.4, 0.5)}>古人说的“热”，测一测</text>
			{slide < 1 && <g transform={`translate(${-1920 * slide},0) translate(960,560) scale(1.15) translate(-810,-530)`}>
				{/* a nerve ending with a gate (an ion channel) in the membrane */}
				<path d="M120,620 C380,600 520,560 700,560 C860,560 900,600 1000,620" stroke={C.cobalt} strokeWidth={18} strokeLinecap="round" fill="none" />
				<path d="M120,620 C380,600 520,560 700,560 C860,560 900,600 1000,620" stroke="#e4dccb" strokeWidth={8} strokeLinecap="round" fill="none" />
				{/* the gate */}
				<g transform="translate(1020,600)">
					<rect x={-40} y={-90} width={34} height={180} rx={14} fill={C.cobalt} transform={`rotate(${-18 * gate})`} />
					<rect x={6} y={-90} width={34} height={180} rx={14} fill={C.cobalt} transform={`rotate(${18 * gate})`} />
					<text x={0} y={-130} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 48}} fill={C.cobalt}>热开关</text>
					<text x={0} y={150} textAnchor="middle" style={{fontFamily: SANS, fontSize: 24}} fill={C.grey}>TRPV1</text>
					{/* signal to the brain */}
					{[0, 1, 2].map((i) => { const ph = ((T * 1.2 + i / 3) % 1); return <circle key={i} cx={-60 - ph * 880} cy={lerp(0, -40, ph) + 0} r={9} fill={C.cobalt} opacity={gate * Math.sin(Math.PI * ph)} />; })}
				</g>
				{/* capsaicin (a ring + chain) arrives at the gate */}
				<g transform={`translate(${lerp(1500, 1120, gate)},${lerp(330, 520, gate)})`} opacity={fadeIn(T, ln(19).a, 0.4)}>
					<polygon points="0,-40 35,-20 35,20 0,40 -35,20 -35,-20" fill="none" stroke={C.cobalt} strokeWidth={6} />
					<path d="M35,-20 L80,-42 L120,-20 L160,-42 L200,-20" stroke={C.cobalt} strokeWidth={6} fill="none" />
					<text x={80} y={100} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 44}} fill={C.cobalt}>辣椒素</text>
				</g>
				{/* the thermometer at 43 °C opens the same gate */}
				{therm > 0.01 && <g transform="translate(1380,330)" opacity={therm}>
					<rect x={-22} y={-160} width={44} height={330} rx={22} fill="none" stroke={C.cobalt} strokeWidth={6} />
					<rect x={-10} y={lerp(140, -60, therm)} width={20} height={lerp(20, 220, therm)} rx={10} fill={C.cobalt} />
					<circle cx={0} cy={180} r={36} fill={C.cobalt} />
					<text x={50} y={lerp(150, -40, therm)} style={{fontFamily: SANS, fontWeight: 900, fontSize: 70}} fill={C.cobalt}>43°C</text>
					<path d="M-30,200 C-200,300 -280,280 -360,270" stroke={C.cobalt} strokeWidth={4} strokeDasharray="10 10" fill="none" />
				</g>}
				{/* both reach the brain as the same signal: 烫 */}
				{same > 0.01 && <g opacity={same}>
					<circle cx={240} cy={420} r={120} fill={C.cobaltSoft} stroke={C.cobalt} strokeWidth={5} />
					<text x={240} y={445} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 84}} fill={C.cobalt}>烫</text>
					<text x={240} y={280} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 700, fontSize: 38}} fill={C.grey}>大脑收到</text>
				</g>}
				{nobel > 0.01 && <g transform={`translate(1430,760) rotate(-8) scale(${lerp(1.4, 1, ease(nobel))})`} opacity={nobel}>
					<circle r={92} fill="#c9a24e" /><circle r={78} fill="none" stroke="#8a6a26" strokeWidth={3} />
					<text y={-8} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 30}} fill="#3e2d0e">诺贝尔奖</text>
					<text y={34} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 700, fontSize: 30}} fill="#3e2d0e">2021</text>
				</g>}
			</g>}
			{T >= ln(23).a && <g transform={`translate(${1920 * (1 - slide)},0)`}>
				{/* a short night → one inflammation gene in immune cells, ×3+ */}
				<g transform="translate(260,250)">
					{['23:00', '03:00', '07:00'].map((s, i) => <text key={s} x={i * 200} y={0} style={{fontFamily: SANS, fontWeight: 700, fontSize: 44}} fill={i === 1 ? C.cobalt : C.grey}>{s}</text>)}
					<line x1={0} y1={30} x2={480} y2={30} stroke={C.grey} strokeWidth={3} />
					<rect x={0} y={20} width={260} height={20} fill={C.cobalt} opacity={0.35} />
					<text x={0} y={100} style={{fontFamily: SANS, fontSize: 32}} fill={C.grey}>少睡半夜</text>
				</g>
				<g transform="translate(1000,780)">
					<line x1={-40} y1={0} x2={700} y2={0} stroke={C.ink} strokeWidth={4} />
					<rect x={40} y={-110} width={220} height={110} fill={C.grey} opacity={0.7} />
					<rect x={380} y={-110 - 260 * grow} width={220} height={110 + 260 * grow} fill={C.cobalt} />
					<text x={150} y={64} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 700, fontSize: 42}} fill={C.ink}>睡够的晚上</text>
					<text x={490} y={64} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 700, fontSize: 42}} fill={C.ink}>少睡半夜</text>
					<text x={150} y={-130} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 56}} fill={C.grey}>×1</text>
					<text x={490} y={-130 - 260 * grow} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 84}} fill={C.cobalt} opacity={ease((grow - 0.7) / 0.3)}>3倍多</text>
					{[...LABEL24].map((c, i) => (i === 7 && T >= ln(25).a) ? null : <text key={i} x={320 + (i - 7) * 46} y={-520} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 46}} fill={i === 7 || i === 8 ? mixHex(C.cobalt, C.fire, fadeIn(T, ln(24).a + 0.3, 0.5)) : C.cobalt}>{c}</text>)}
				</g>
				<text x={260} y={960} style={{fontFamily: SANS, fontSize: 24}} fill={C.grey}>Irwin et al. 2006 · 30人</text>
			</g>}
		</svg>
	);
};

// 25–27 · 炎: the word under the bars → the character fills the frame → 说文 → two 火 stacked, the top one rising
// 28–31 · Celsus: rubor · tumor · calor · dolor; inflammation ← flamma; 炎 and flamma become one flame (the hero frame)
const yanGeom = (T: number) => {
	const push = fadeIn(T, ln(25).a, 1.2), shuo = cl01(fadeIn(T, ln(26).a, 0.5) - fadeIn(T, ln(28).a - 0.2, 0.5)), split = fadeIn(T, ln(27).a, 1.4), rome = fadeIn(T, ln(28).a, 0.7);
	return {x: lerp(lerp(960, 760, shuo + split), 560, rome), s: lerp(lerp(0.7, 1.15, push), 0.8, rome) * lerp(1, 0.86, split * (1 - rome))};
};
const YAN_IN = 0.75;   // seconds for the 炎 to fly out of the label and land
const YanScene: React.FC<{T: number}> = ({T}) => {
	const push = fadeIn(T, ln(25).a, 1.2);
	const shuo = cl01(fadeIn(T, ln(26).a, 0.5) - fadeIn(T, ln(28).a - 0.2, 0.5));
	const split = fadeIn(T, ln(27).a, 1.4);
	const rome = fadeIn(T, ln(28).a, 0.7);
	const words = (i: number) => fadeIn(T, ln(29).a + 0.3 + i * 0.45, 0.35);
	const flam = fadeIn(T, ln(30).a, 0.6);
	const merge = fadeIn(T, ln(31).a, 1.4);
	const night = 1;
	const yanX = lerp(lerp(960, 760, shuo + split), 560, rome), yanS = lerp(lerp(0.7, 1.15, push), 0.8, rome) * lerp(1, 0.86, split * (1 - rome));
	return (
		<svg width={W} height={H}>
			<Defs />
			<InkNight glow={[760, 520]} />
			{/* the character 炎: two 火 stacked; at line 27 they separate and the top one rises */}
			<g transform={`translate(${lerp(yanX, 960, merge)},${lerp(560, 470, merge)}) scale(${lerp(yanS, 0.55, merge)})`} opacity={(1 - ease(merge * 1.4)) * (T >= ln(25).a + YAN_IN - 0.02 ? 1 : 0)}>
				<ellipse cx={0} cy={0} rx={420} ry={420} fill={C.fireGlow} filter="url(#glow)" opacity={0.6} />
				{/* the real character first (lines 25–26), then it comes apart into its two 火 (line 27) */}
				<text x={0} y={250} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 760}} fill={C.fire} filter="url(#brush)" opacity={1 - ease(split * 2.5)}>炎</text>
				<text x={0} y={250} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 760}} fill="#ffb07a" filter="url(#glow)" opacity={0.45 * (1 - ease(split * 2.5))}>炎</text>
				<g opacity={ease(split * 2.5)}>
				<text x={0} y={-30 - 70 * split} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 380}} fill={C.fire} filter="url(#brush)" transform={`scale(1,${lerp(0.5, 0.62, split)})`}>火</text>
				<text x={0} y={310 + 20 * split} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 380}} fill={C.white} filter="url(#brush)" transform={`scale(1,${lerp(0.5, 0.62, split)})`}>火</text>
				</g>
			</g>
			{/* 说文解字 page */}
			{shuo > 0.01 && <g transform="translate(1290,170)" opacity={shuo}>
				<rect x={0} y={0} width={440} height={620} fill="#efe4c9" filter="url(#paperTex)" />
				<rect x={0} y={0} width={440} height={620} fill="none" stroke={C.inkMid} strokeWidth={4} filter="url(#brush)" />
				<text x={390} y={60} style={{fontFamily: KAI, fontWeight: 700, fontSize: 32, writingMode: 'vertical-rl'}} fill={C.inkMid}>《说文解字》</text>
				<text x={300} y={70} style={{fontFamily: KAI, fontWeight: 700, fontSize: 80, writingMode: 'vertical-rl'}} fill={C.fire}>炎</text>
				<text x={200} y={70} style={{fontFamily: KAI, fontWeight: 700, fontSize: 70, writingMode: 'vertical-rl', letterSpacing: '0.06em'}} fill={C.ink}>火光上也</text>
				<text x={100} y={70} style={{fontFamily: KAI, fontWeight: 700, fontSize: 70, writingMode: 'vertical-rl', letterSpacing: '0.06em'}} fill={C.ink}>从重火</text>
			</g>}
			{/* Rome: Celsus' scroll */}
			{rome > 0.01 && <g transform={`translate(${lerp(1900, 1050, ease(rome))},170)`} opacity={rome * (1 - ease(merge * 1.6))}>
				<rect x={0} y={0} width={720} height={600} fill="#efe6d0" filter="url(#paperTex)" />
				<rect x={-18} y={-18} width={756} height={30} rx={14} fill="#8a6a46" /><rect x={-18} y={588} width={756} height={30} rx={14} fill="#8a6a46" />
				<text x={360} y={80} textAnchor="middle" style={{fontFamily: LATIN, fontStyle: 'italic', fontWeight: 600, fontSize: 40}} fill={C.inkMid}>Celsus · 约公元前25年–公元50年</text>
				{[['rubor', '红'], ['tumor', '肿'], ['calor', '热'], ['dolor', '痛']].map(([la, zh], i) => <g key={la} opacity={words(i)}>
					<text x={140} y={190 + i * 96} style={{fontFamily: LATIN, fontWeight: 700, fontSize: 64}} fill={C.ink}>{la}</text>
					<text x={460} y={190 + i * 96} style={{fontFamily: KAI, fontWeight: 700, fontSize: 70}} fill={C.fire}>{zh}</text>
				</g>)}
				{flam > 0.01 && <g opacity={flam}>
					<rect x={40} y={500} width={640} height={2} fill={C.inkMid} opacity={0.4} />
					<text x={360} y={570} textAnchor="middle" style={{fontFamily: LATIN, fontWeight: 700, fontSize: 60}} fill={C.ink}>in<tspan fill={C.fire}>flamma</tspan>tion</text>
				</g>}
			</g>}
			{/* the hero frame: east and west, one flame */}
			{merge > 0.01 && <g opacity={merge}>
				{T < ln(32).a && <Flame x={960} y={860} h={lerp(120, 720, ease(merge))} t={T} />}
				<text x={480} y={780} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 260}} fill={C.white} opacity={ease((merge - 0.3) / 0.5)} filter="url(#brush)">炎</text>
				<text x={1440} y={760} textAnchor="middle" style={{fontFamily: LATIN, fontWeight: 700, fontStyle: 'italic', fontSize: 210}} fill={C.white} opacity={ease((merge - 0.3) / 0.5)}>flamma</text>
				<text x={480} y={470} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 60}} fill="rgba(236,226,206,0.7)" opacity={ease((merge - 0.5) / 0.5)}>东方</text>
				<text x={1440} y={470} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 60}} fill="rgba(236,226,206,0.7)" opacity={ease((merge - 0.5) / 0.5)}>西方</text>
			</g>}
		</svg>
	);
};

// 33 · the sleep study grid (modern, cobalt)
const StudyScene: React.FC<{T: number}> = ({T}) => {
	const SANS = '"Noto Sans CJK SC", sans-serif';
	return (
		<svg width={W} height={H}>
			<Defs />
			<Paper tone={1} />
			<g transform="translate(360,200)">
				{Array.from({length: 72}, (_, i) => { const u = ease((T - ln(33).a - 0.006 * i) / 0.55), src = i % 2 ? BC : BM; const gx = (i % 12) * 70, gy = Math.floor(i / 12) * 70; const x = lerp(src[0] - 360, gx, u), y = lerp(src[1] - 200, gy, u) - 120 * Math.sin(Math.PI * u); return <rect key={i} x={x} y={y} width={lerp(14, 56, u)} height={lerp(14, 56, u)} rx={lerp(7, 6, u)} fill={C.cobalt} opacity={u < 1 ? 0.85 : 0.15 + 0.6 * fadeIn(T, ln(33).a + 0.5 + i * 0.012, 0.2)} />; })}
				<g opacity={fadeIn(T, ln(33).a + 0.5, 0.4)}><text x={0} y={-40} style={{fontFamily: SANS, fontWeight: 700, fontSize: 40}} fill={C.cobalt}>72 项研究 · 5万多人</text></g>
				<g opacity={fadeIn(T, ln(33).a + 0.7, 0.4)}>
				<path d="M920,380 L1040,140" stroke={C.cobalt} strokeWidth={16} strokeLinecap="round" />
				<path d="M990,150 L1044,130 L1050,190" stroke={C.cobalt} strokeWidth={16} fill="none" strokeLinecap="round" />
				<text x={900} y={470} style={{fontFamily: SANS, fontWeight: 700, fontSize: 40}} fill={C.cobalt}>炎症指标</text>
				<text x={0} y={510} style={{fontFamily: SANS, fontSize: 30}} fill={C.grey}>相关，不是因果 · Irwin et al. 2016</text>
				</g>
			</g>
		</svg>
	);
};

// 34–35, 37–39 · back to mum: the phone; the old body chart; the family grid with the 验证 stamp
const BackScene: React.FC<{T: number}> = ({T}) => {
	const chart = cl01(fadeIn(T, ln(37).a, 0.6) - fadeIn(T, ln(39).a, 0.5));
	const align = fadeIn(T, ln(38).a, 1.2);
	const grid = fadeIn(T, ln(39).a, 0.5), stamp = cl01((T - ln(39).a - 1.2) / 0.2);
	const phone = T < ln(36).a ? 1 : 0;
	const chartO = 1 - fadeIn(T, ln(39).a + 0.9, 0.5);
	const SANS = '"Noto Sans CJK SC", sans-serif';
		const bubble = (who: string, text: string, x: number, y: number, o: number) => <g transform={`translate(${lerp(BM[0], x, ease(o))},${lerp(BM[1], y, ease(o))}) scale(${lerp(0.08, 1, ease(o))})`} opacity={Math.min(1, o * 3)}>
		<rect x={0} y={0} width={600} height={160} rx={36} fill={C.white} stroke={C.ink} strokeWidth={4} filter="url(#brush)" />
		<text x={40} y={62} style={{fontFamily: SANS, fontWeight: 700, fontSize: 40}} fill={C.inkMid}>{who}</text>
		<text x={40} y={126} style={{fontFamily: SANS, fontWeight: 700, fontSize: 56}} fill={C.ink}>{text}</text>
	</g>;
	return (
		<svg width={W} height={H}>
			<Defs />
			<clipPath id="phoneClip"><rect x={0} y={0} width={260} height={520} rx={28} /></clipPath>
			<Paper />
			{phone > 0.01 && <g opacity={phone}>
				<Phone x={820} y={230} s={1.05} glow={0.4}>
					<rect width={260} height={520} fill="#1a2030" />
					<rect x={18} y={210} width={224} height={92} rx={22} fill="#eef3fb" />
					<text x={38} y={246} style={{fontFamily: SANS, fontWeight: 700, fontSize: 22}} fill="#1a2030">妈</text>
					<text x={38} y={282} style={{fontFamily: SANS, fontSize: 26}} fill="#1a2030">你这是上火了</text>
				</Phone>
					{/* the old book from 0:28 comes back beside mum's message: her words carry its way of seeing */}
					<g transform={`translate(${lerp(1500, 1260, fadeIn(T, ln(35).a, 0.6))},250) scale(0.78) rotate(4)`} opacity={fadeIn(T, ln(35).a, 0.5)}>
						<rect x={0} y={0} width={470} height={560} fill="#efe4c9" filter="url(#paperTex)" />
						<rect x={0} y={0} width={470} height={560} fill="none" stroke={C.inkMid} strokeWidth={4} filter="url(#brush)" />
						<text x={420} y={60} style={{fontFamily: KAI, fontWeight: 700, fontSize: 30, writingMode: 'vertical-rl'}} fill={C.inkMid}>《证治准绳》</text>
						{['心火炎上', '熏蒸于口', '则口舌生疮'].map((s2, i) => <text key={i} x={330 - i * 110} y={70} style={{fontFamily: KAI, fontWeight: 700, fontSize: 66, writingMode: 'vertical-rl', letterSpacing: '0.08em'}} fill={i === 0 ? C.fire : C.ink}>{s2}</text>)}
					</g>
					<text x={1443} y={200} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 60}} fill={C.ink} opacity={fadeIn(T, ln(35).a + 0.4, 0.6)}>老祖宗的眼光</text>
					{/* mum's 上火 and the book's 心火炎上: one dotted thread */}
					<path d="M1080,500 C1150,470 1190,420 1260,330" stroke={C.fire} strokeWidth={4} strokeDasharray="8 10" fill="none" opacity={fadeIn(T, ln(35).a + 0.6, 0.6) * 0.8} />
			</g>}
				{T >= ln(37).a && chartO > 0.01 && <g opacity={chartO}>
					{/* the same body as before: what the ancients could see (flames), then the modern diagram sliding over it */}
					<Bust x={BODY0.x} y={BODY0.y} s={BODY0.s} />
					{[BM, BT, BC].map((p2, i) => <Flame key={i} x={p2[0]} y={p2[1] + 14} h={70 + 10 * i} t={T + i} />)}
					<g transform={`translate(${lerp(260, 0, align)},0)`} opacity={align}>
						<Dot p={BM} label="炎症" o={1} side={-1} modern />
						<Dot p={BC} label="炎症" o={1} side={1} modern />
					</g>
					<g opacity={fadeIn(T, ln(37).a + 0.3, 0.5) * (1 - align)}>
						<text x={1250} y={420} style={{fontFamily: KAI, fontWeight: 700, fontSize: 64}} fill={C.inkMid}>只能看</text>
						<text x={1250} y={520} style={{fontFamily: KAI, fontWeight: 700, fontSize: 64}} fill={C.inkMid}>只能摸</text>
					</g>
				</g>}
			{grid > 0.01 && <g opacity={grid}>
				{bubble('妈', '你这是上火了', 200, 170, cl01((T - ln(39).a - 0.1) / 0.45))}
				{bubble('爸', '少吃点辣的', 1110, 290, cl01((T - ln(39).a - 0.35) / 0.45))}
				{bubble('奶奶', '早点睡，别熬夜', 520, 500, cl01((T - ln(39).a - 0.6) / 0.45))}
				{stamp > 0 && <g transform={`translate(1540,700) rotate(-12) scale(${lerp(1.6, 1, ease(stamp))})`} opacity={stamp}>
					<rect x={-150} y={-70} width={300} height={140} rx={14} fill="none" stroke={C.fire} strokeWidth={10} filter="url(#brush)" />
					<text x={0} y={34} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 96}} fill={C.fire} filter="url(#brush)">验证</text>
				</g>}
			</g>}
		</svg>
	);
};

// end card
const EndCard: React.FC<{T: number}> = ({T}) => {
	const u = T - ln(39).b;
	return (
		<svg width={W} height={H}>
			<Defs />
			<Paper />
			<Seal x={960} y={250} s={1.2} ch="火" o={fadeIn(u, 0, 0.4)} rot={-6} />
			<text x={960} y={470} textAnchor="middle" style={{fontFamily: KAI, fontWeight: 700, fontSize: 70}} fill={C.ink} opacity={fadeIn(u, 0.3, 0.5)}>你家里，谁最爱说“你上火了”？</text>
			<text x={960} y={560} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 34}} fill={C.inkMid} opacity={fadeIn(u, 0.6, 0.5)}>评论区说说 · 发给那个总说“你上火了”的人</text>
			<g opacity={fadeIn(u, 0.9, 0.5)}>
				<rect x={760} y={630} width={400} height={64} rx={32} fill={C.ink} />
				<text x={960} y={673} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 28, letterSpacing: '0.1em'}} fill={C.white}>关注 Juno · 一起看懂世界</text>
			</g>
			<text x={960} y={900} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 20}} fill={C.inkMid} opacity={fadeIn(u, 1.0, 0.5)}>资料：《尚书》《说文解字》《证治准绳》 · Caterina et al. 1997 Nature · Irwin et al. 2006 · 诺贝尔奖 2021 · Cavaillon 2021</text>
			<text x={960} y={940} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 20}} fill={C.inkMid} opacity={fadeIn(u, 1.0, 0.5)}>内容由AI生成 · 本片不构成医疗建议</text>
		</svg>
	);
};

// ---------------------------------------------------------------- the film
const sceneAt = (T: number): React.ReactNode => {
	if (T < ln(3).a) return <Open T={T} />;
	if (T < ln(4).b) return <BodyScene T={T} mode="dots" />;
	if (T < ln(5).a) return <TitleCard T={T} />;
	if (T < ln(9).a) return <WuxingScene T={T} />;
	if (T < ln(12).a) return <BodyScene T={T} mode="fire" />;
	if (T < ln(18).a) return <YinYangScene T={T} />;
	if (T < ln(25).a) return <ModernScene T={T} />;
	if (T < ln(32).a) return <YanScene T={T} />;
	if (T < ln(33).a) return <BodyScene T={T} mode="modern" />;
	if (T < ln(34).a) return <StudyScene T={T} />;
	if (T < ln(36).a) return <BackScene T={T} />;
	if (T < ln(37).a) return <BodyScene T={T} mode="both" />;
	if (T < ln(39).b) return <BackScene T={T} />;
	return <EndCard T={T} />;
};

// ---------------------------------------------------------------- transitions: every cut carries something across
const Layer: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => <AbsoluteFill style={style}>{children}</AbsoluteFill>;
/** the next scene opens inside a growing circle; its edge is a ring of wet ink */
const Iris: React.FC<{A: React.ReactNode; B: React.ReactNode; c: Pt; r: number; col?: string; seed?: number}> = ({A, B, c, r, col = C.ink, seed = 1}) => {
	const R0 = (i: number) => { const v = Math.sin(seed * 51.3 + i * 12.9898) * 43758.5453; return v - Math.floor(v); };
	return <>
		<Layer>{A}</Layer>
		<Layer style={{clipPath: `circle(${Math.max(0, r)}px at ${c[0]}px ${c[1]}px)`}}>{B}</Layer>
		{r > 1 && r < 2300 && <Layer><svg width={W} height={H}><Defs />
			<circle cx={c[0]} cy={c[1]} r={r} fill="none" stroke={col} strokeWidth={10 + Math.min(30, r * 0.05)} filter="url(#brushHeavy)" opacity={0.9} />
			{Array.from({length: 18}, (_, i) => { const a = R0(i) * Math.PI * 2, rr = r + (R0(i + 30) - 0.3) * 40; return <circle key={i} cx={c[0] + Math.cos(a) * rr} cy={c[1] + Math.sin(a) * rr} r={4 + 16 * R0(i + 60)} fill={col} filter="url(#brushHeavy)" opacity={0.85} />; })}
		</svg></Layer>}
	</>;
};
const Over: React.FC<{children: React.ReactNode}> = ({children}) => <Layer><svg width={W} height={H}><Defs />{children}</svg></Layer>;
const scaleAt = (p: Pt, k: number, extra = ''): React.CSSProperties => ({transformOrigin: `${p[0]}px ${p[1]}px`, transform: `${extra} scale(${k})`});

type Tr = {a: number; b: number; draw: (T: number, u: number) => React.ReactNode};
const TRANS: Tr[] = [
	// 1 · the 火 seal flies off the hotpot and lands on the mouth as the first symptom; paper opens around it
	{a: ln(3).a, b: ln(3).a + 0.75, draw: (T, u) => {
		const f = ease(u / 0.55), q = arc([1260, 300], BM, f, 140);
		return <>
			<Iris A={<Open T={T} />} B={<BodyScene T={T} mode="dots" />} c={BM} r={2300 * ease((u - 0.35) / 0.65)} col={C.paperDeep} seed={2} />
			{u < 0.62 && <Over><Seal x={q[0]} y={q[1]} s={lerp(1.9, 0.14, f)} ch="火" rot={lerp(-10, 0, f)} /></Over>}
		</>;
	}},
	// 2 · an ink drop falls on the head and floods the frame: the title lands on the drop (ln 4 end)
	{a: ln(4).b - 0.42, b: ln(4).b + 0.02, draw: (T, u) => {
		const fall = cl01(u / 0.4), y = lerp(-80, BHEAD[1], fall * fall);
		return <>
			<Iris A={<BodyScene T={T} mode="dots" />} B={<TitleCard T={T} />} c={BHEAD} r={2300 * Math.pow(cl01((u - 0.4) / 0.6), 1.6)} col="#120e0b" seed={4} />
			{u < 0.42 && <Over><path d={`M${BHEAD[0]},${y - 60} C${BHEAD[0] + 22},${y - 20} ${BHEAD[0] + 26},${y + 10} ${BHEAD[0]},${y + 22} C${BHEAD[0] - 26},${y + 10} ${BHEAD[0] - 22},${y - 20} ${BHEAD[0]},${y - 60} Z`} fill="#120e0b" /></Over>}
		</>;
	}},
	// 3 · the title's red 火 drops into the 五行 ring as its 火; paper opens from it
	{a: ln(5).a, b: ln(5).a + 0.75, draw: (T, u) => {
		const s0 = titleFire(ln(5).a), tp = tilePos(1), f = ease(u / 0.85), q = arc([s0.x, s0.y], [tp[0], tp[1] + 34], f, 60);
		return <>
			<Iris A={<TitleCard T={T} />} B={<WuxingScene T={T} />} c={q} r={2300 * ease(u)} col={C.paperDeep} seed={6} />
			{u < 0.93 && <Over><Glyph ch="火" x={q[0]} y={q[1]} f={lerp(s0.f, 100, f)} col={mixHex('#ff9a4a', C.fire, f)} glow /></Over>}
		</>;
	}},
	// 4 · the sparks rising off 炎上 fly out and land on the face: each one lights a symptom
	{a: ln(9).a, b: ln(9).a + 0.7, draw: (T, u) => {
		const src: Pt[] = [[SLIP.fx, SLIP.base[2] - 50], [SLIP.fx, SLIP.base[3] - 50], [SLIP.fx, SLIP.base[2] - 50]], dst = [BM, BT, BC];
		return <>
			<Iris A={<WuxingScene T={T} />} B={<BodyScene T={T} mode="fire" />} c={BHEAD} r={2300 * ease(u)} col={C.paperDeep} seed={8} />
			<Over>{dst.map((d, i) => { const f = ease(cl01((u - i * 0.06) / 0.5)); if (f >= 1) return null; const q = arc(src[i], d, f, 200 + 60 * i), q0 = arc(src[i], d, Math.max(0, f - 0.12), 200 + 60 * i); return <g key={i}><line x1={q0[0]} y1={q0[1]} x2={q[0]} y2={q[1]} stroke="#ffb07a" strokeWidth={6} strokeLinecap="round" opacity={0.6} filter="url(#soft)" /><circle cx={q[0]} cy={q[1]} r={9} fill="#ffe2bd" /><circle cx={q[0]} cy={q[1]} r={26} fill="url(#fireGlowG)" /></g>; })}</Over>
		</>;
	}},
	// 5 · dive into the flame in the head: through the red, out of the red broth of the hotpot
	{a: ln(12).a - 0.3, b: ln(12).a + 0.35, draw: (T, u) => {
		const pA: Pt = [1074, 600], pB: Pt = [1139, 557];
		const inA = Math.pow(cl01(u / 0.46), 2), outB = ease(cl01((u - 0.46) / 0.54)), red = Math.max(0, 1 - Math.abs(u - 0.46) / 0.26);
		return <>
			{u < 0.46 ? <Layer style={{...scaleAt(pA, 1 + 9 * inA), filter: `blur(${10 * inA}px)`}}><BodyScene T={T} mode="fire" /></Layer>
				: <Layer style={{...scaleAt(pB, lerp(4, 1, outB)), filter: `blur(${8 * (1 - outB)}px)`}}><YinYangScene T={T} /></Layer>}
			<Layer style={{background: '#d0371c', opacity: 0.95 * Math.pow(red, 0.6)}}>{null}</Layer>
		</>;
	}},
	// 6 · a magnifying glass over the chilli: inside the lens, the lab notebook
	{a: ln(18).a, b: ln(18).a + 0.8, draw: (T, u) => {
		const ch: Pt = [612, 707], f = ease(u), c: Pt = [lerp(ch[0], 960, f), lerp(ch[1], 540, f)], r = lerp(70, 1250, Math.pow(f, 1.4));
		return <>
			<Layer><YinYangScene T={T} /></Layer>
			<Layer style={{clipPath: `circle(${r}px at ${c[0]}px ${c[1]}px)`}}><Layer style={scaleAt(c, lerp(1.4, 1, f))}><ModernScene T={T} /></Layer></Layer>
			{r < 1150 && <Over><circle cx={c[0]} cy={c[1]} r={r + 9} fill="none" stroke={C.ink} strokeWidth={18} filter="url(#brush)" />
				<line x1={c[0] + (r + 12) * 0.707} y1={c[1] + (r + 12) * 0.707} x2={c[0] + (r + 12) * 0.707 + 260} y2={c[1] + (r + 12) * 0.707 + 260} stroke={C.ink} strokeWidth={34} strokeLinecap="round" filter="url(#brush)" /></Over>}
		</>;
	}},
	// 7 · the 炎 lifts out of 炎症基因, turns red and grows; ink night spreads from it
	{a: ln(25).a, b: ln(25).a + YAN_IN, draw: (T, u) => {
		const g = yanGeom(ln(25).a + YAN_IN), f = ease(u), q = arc([1320, 260], [g.x, 560 + 250 * g.s], f, 40);
		return <>
			<Iris A={<ModernScene T={T} />} B={<YanScene T={T} />} c={[q[0], q[1] - 0.38 * lerp(46, 760 * g.s, f)]} r={2300 * ease(cl01((u - 0.15) / 0.8))} col="#120e0b" seed={10} />
			<Over><Glyph ch="炎" x={q[0]} y={q[1]} f={lerp(46, 760 * g.s, f)} col={mixHex(C.cobalt, C.fire, f * 2)} glow={f > 0.5} /></Over>
		</>;
	}},
	// 8 · the hero flame shrinks back into the mouth; the body (and paper) open around it
	{a: ln(32).a, b: ln(32).a + 0.7, draw: (T, u) => {
		const f = ease(u / 0.8), x = lerp(960, BM[0], f), y = lerp(860, BM[1] + 14, f), h = lerp(720, 60, f);
		return <>
			<Iris A={<YanScene T={T} />} B={<BodyScene T={T} mode="modern" />} c={BM} r={2300 * ease(cl01((u - 0.3) / 0.7))} col={C.paperDeep} seed={12} />
			{u < 0.95 && <Over><Flame x={x} y={y} h={h} t={T} o={1 - cl01((u - 0.8) / 0.15)} /></Over>}
		</>;
	}},
	// 9 · the two dots multiply into the 72 studies (the cells fly out in StudyScene); the body fades under them
	{a: ln(33).a, b: ln(33).a + 0.4, draw: (T, u) => <>
		<Layer><StudyScene T={T} /></Layer>
		<Layer style={{opacity: 1 - ease(u)}}><BodyScene T={T} mode="modern" /></Layer>
	</>},
	// 10 · whip pan to mum's phone
	{a: ln(34).a - 0.12, b: ln(34).a + 0.3, draw: (T, u) => { const f = ease(u); return <>
		<Layer style={{transform: `translateX(${-W * f}px)`, filter: `blur(${24 * Math.sin(Math.PI * f)}px)`}}><StudyScene T={T} /></Layer>
		<Layer style={{transform: `translateX(${W * (1 - f)}px)`, filter: `blur(${24 * Math.sin(Math.PI * f)}px)`}}><BackScene T={Math.max(T, ln(34).a)} /></Layer>
	</>; }},
	// 11 · the phone flips over: on its back, the body chart
	{a: ln(36).a - 0.25, b: ln(36).a + 0.25, draw: (T, u) => { const f = ease(u); return <>
		<Layer style={{background: C.paper}}>{null}</Layer>
		{f < 0.5 ? <Layer style={{transform: `perspective(2200px) rotateY(${180 * f}deg)`}}><BackScene T={Math.min(T, ln(36).a - 0.01)} /></Layer>
			: <Layer style={{transform: `perspective(2200px) rotateY(${-180 * (1 - f)}deg)`}}><BodyScene T={T} mode="both" /></Layer>}
	</>; }},
	// 12 · same body, so the modern labels just fade off it
	{a: ln(37).a, b: ln(37).a + 0.5, draw: (T, u) => <>
		<Layer><BackScene T={T} /></Layer>
		<Layer style={{opacity: 1 - ease(u)}}><BodyScene T={T} mode="both" /></Layer>
	</>},
	// 13 · to the end card: a slow ink-wash dissolve
	{a: ln(39).b, b: ln(39).b + 0.7, draw: (T, u) => <>
		<Layer><BackScene T={T} /></Layer>
		<Layer style={{opacity: ease(u), ...scaleAt([960, 540], lerp(1.04, 1, ease(u)))}}><EndCard T={T} /></Layer>
	</>},
];
const DARK: [number, number][] = [[0, ln(3).a + 0.4], [ln(4).b - 0.1, ln(5).a + 0.4], [ln(8).a + 0.2, ln(9).a + 0.4], [ln(11).a - 0.2, ln(12).a + 1.8], [ln(25).a + 0.3, ln(32).a + 0.4]];
export const Film36: React.FC = () => {
	useFonts(); useKai();
	const T = useCurrentFrame() / FPS;
	const line = LINES.find(([a, b]) => T >= a + 0.06 && T < b - 0.1);
	const dark = DARK.some(([a, b]) => T >= a && T < b);
	const tr = TRANS.find((x) => T >= x.a && T < x.b);
	return (
		<AbsoluteFill style={{background: C.paper}}>
			<AbsoluteFill>{tr ? tr.draw(T, (T - tr.a) / (tr.b - tr.a)) : sceneAt(T)}</AbsoluteFill>
			{T < ln(39).b && <Mark dark={dark} />}
			{line && <Sub t={line[2]} />}
		</AbsoluteFill>
	);
};

registerRoot(() => (
	<>
		<Composition id="FILM36" component={Film36} durationInFrames={Math.round(FILM36_END * FPS)} fps={FPS} width={W} height={H} />
	</>
));
