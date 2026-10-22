import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';

/* 《七情》 v7 — owner notes on v6: copy the reference's tempo (2 bars a voice); far less movement on screen —
   the words carry the beat, the imagery stays simple and the one hit is the figure appearing; no bald heads
   (every figure has real hair with a hairline; 怒's fire grows out of the hair); circles clean or blank (no dotted
   jade); 恶's fan had odd proportions → a veil; 爱 was messy → a few clean locks, one red thread, one peony;
   欲 and 怒 are the benchmark for 高级感. Music: "I Got Love" (Yazhe remix), first reveal on the drop. */

const W = 1920, H = 1080, FPS = 30;
const cl01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (u: number) => { const v = cl01(u); return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
const out3 = (u: number) => 1 - Math.pow(1 - cl01(u), 3);
const outBack = (u: number) => { const v = cl01(u), c1 = 1.8, c3 = c1 + 1; return 1 + c3 * Math.pow(v - 1, 3) + c1 * Math.pow(v - 1, 2); };
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const fade = (T: number, a: number, d = 0.4) => ease((T - a) / d);
const rnd = (i: number, k = 0) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
type P = [number, number];

const SERIF = '"Noto Serif CJK SC", serif';
const GOLD = '#e6c47a';

// ---------------------------------------------------------------- music grid: Yazhe remix, 114.89 BPM; film 0 = track 243.849 s
const BEAT = 0.52223, BAR = 4 * BEAT;
const bt = (bar: number) => (bar + 5) * BAR;             // film time of bar n counted from the drop
const REV = [0, 2, 4, 6, 8, 10, 12].map(bt);              // one reveal every 2 bars (the reference's pace), on downbeats
const Q0 = REV.map((r) => r - BAR);
const OUT = bt(14);
export const QQ7_END = bt(18) + 0.6;

type Kind = 'xi' | 'nu' | 'ai' | 'ju' | 'love' | 'wu' | 'yu';
type Voice = {n: number; ch: string; py: string; kind: Kind; col: string; hot: string; deep: string; when: string; line: string};
const VOICES: Voice[] = [
	{n: 1, ch: '喜', py: 'xǐ', kind: 'xi', col: '#ffc23a', hot: '#fff1c4', deep: '#2a1c04', when: '它在你收到他消息的那一秒说', line: '“嘴角，压不住了。”'},
	{n: 2, ch: '怒', py: 'nù', kind: 'nu', col: '#ff5a2a', hot: '#ffd8bc', deep: '#2c0904', when: '它在你被冤枉时说', line: '“凭什么是我？”'},
	{n: 3, ch: '哀', py: 'āi', kind: 'ai', col: '#86a8ff', hot: '#e0eaff', deep: '#0a1428', when: '它在你删掉合照时说', line: '“原来，真的结束了。”'},
	{n: 4, ch: '惧', py: 'jù', kind: 'ju', col: '#5fe0ff', hot: '#d8f8ff', deep: '#04202c', when: '它在你按下发送前说', line: '“万一，他不回呢？”'},
	{n: 5, ch: '爱', py: 'ài', kind: 'love', col: '#ff5a8c', hot: '#ffdce8', deep: '#2c0718', when: '它在你记住他随口一句话时说', line: '“他说过，他怕冷。”'},
	{n: 6, ch: '恶', py: 'wù', kind: 'wu', col: '#a6e070', hot: '#eaffd8', deep: '#0e1c08', when: '它在你听见虚伪的客套时说', line: '“别装了。”'},
	{n: 7, ch: '欲', py: 'yù', kind: 'yu', col: '#c886ff', hot: '#f2e0ff', deep: '#1a0a2c', when: '它在你深夜刷购物车时说', line: '“就这一次。”'},
];
const NUM = ['零', '一', '二', '三', '四', '五', '六', '七'];

const Defs: React.FC<{v: {col: string; hot: string; deep: string}}> = ({v}) => (
	<defs>
		<filter id="gS" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
		<filter id="gM" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="10" /></filter>
		<filter id="gL" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="34" /></filter>
		<radialGradient id="bgG" cx="0.72" cy="0.48" r="0.8"><stop offset="0" stopColor={v.deep} /><stop offset="0.5" stopColor="#08070d" /><stop offset="1" stopColor="#030205" /></radialGradient>
		<radialGradient id="discG" cx="0.5" cy="0.42" r="0.6"><stop offset="0" stopColor={v.col} stopOpacity="0.32" /><stop offset="0.7" stopColor={v.deep} stopOpacity="0.85" /><stop offset="1" stopColor="#05040a" stopOpacity="0.9" /></radialGradient>
		<radialGradient id="auraG"><stop offset="0" stopColor={v.col} stopOpacity="0.42" /><stop offset="1" stopColor={v.col} stopOpacity="0" /></radialGradient>
		<radialGradient id="hotG"><stop offset="0" stopColor="#fff" /><stop offset="0.35" stopColor={v.hot} stopOpacity="0.9" /><stop offset="1" stopColor={v.col} stopOpacity="0" /></radialGradient>
		<radialGradient id="skinG" cx="0.5" cy="0.35" r="0.75"><stop offset="0" stopColor={v.deep} /><stop offset="0.7" stopColor="#0b0910" /><stop offset="1" stopColor="#07060b" /></radialGradient>
		<linearGradient id="hairG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={v.deep} /><stop offset="1" stopColor="#09070d" /></linearGradient>
		<linearGradient id="sheenG" x1="0.9" y1="0" x2="0.1" y2="1"><stop offset="0" stopColor={v.col} stopOpacity="0.42" /><stop offset="0.45" stopColor={v.col} stopOpacity="0.12" /><stop offset="1" stopColor="#09070d" stopOpacity="0" /></linearGradient>
		<linearGradient id="nameG" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="0.45" stopColor={v.hot} /><stop offset="1" stopColor={v.col} /></linearGradient>
		<linearGradient id="goldG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff2c8" /><stop offset="0.5" stopColor={GOLD} /><stop offset="1" stopColor="#a8823c" /></linearGradient>
		<linearGradient id="fireHairG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#140604" /><stop offset="0.38" stopColor="#5a1406" /><stop offset="0.62" stopColor="#ff5a1a" /><stop offset="0.85" stopColor="#ffb05a" /><stop offset="1" stopColor="#fff1c4" /></linearGradient>
		<linearGradient id="flameG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ff3a10" /><stop offset="0.6" stopColor="#ff9a3a" /><stop offset="1" stopColor="#fff1c4" /></linearGradient>
		<linearGradient id="veilG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={v.col} stopOpacity="0.28" /><stop offset="1" stopColor={v.col} stopOpacity="0.12" /></linearGradient>
	</defs>
);

const Neon: React.FC<{d: string; v: Voice; draw: number; w?: number; L?: number; core?: string; glow?: number}> = ({d, v, draw, w = 3, L = 3000, core, glow = 0.5}) => <>
	<path d={d} fill="none" stroke={v.col} strokeWidth={w * 3.4} opacity={glow} filter="url(#gM)" strokeDasharray={L} strokeDashoffset={L * (1 - draw)} strokeLinecap="round" />
	<path d={d} fill="none" stroke={core ?? v.hot} strokeWidth={w} strokeDasharray={L} strokeDashoffset={L * (1 - draw)} strokeLinecap="round" strokeLinejoin="round" />
</>;
// ---------------------------------------------------------------- the face kit (front)
type Eye = 'calm' | 'happy' | 'wide' | 'angry' | 'sad' | 'lidded';
type Brow = 'calm' | 'up' | 'angry' | 'sad' | 'arch';
type Mouth = 'grin' | 'set' | 'sad' | 'closed' | 'part' | 'smile';
const FACE_F = 'M0,-170 C72,-170 118,-122 120,-54 C122,-6 114,40 98,78 C82,118 46,152 0,162 C-46,152 -82,118 -98,78 C-114,40 -122,-6 -120,-54 C-118,-122 -72,-170 0,-170 Z';
const NECK_F = 'M-44,130 C-44,180 -48,222 -58,244 C-140,266 -282,288 -362,352 C-404,388 -424,464 -434,660 L434,660 C424,464 404,388 362,352 C282,288 140,266 58,244 C48,222 44,180 44,130';
const eyeShape = (e: Eye) => ({
	calm: {up: 'M-28,2 C-14,-15 12,-19 31,-5', lo: 'M-28,2 C-10,13 14,12 31,-5'},
	wide: {up: 'M-29,2 C-16,-24 14,-26 32,-4', lo: 'M-29,2 C-12,20 16,18 32,-4'},
	happy: {up: 'M-29,6 C-12,-16 14,-16 32,6', lo: 'M-29,6 C-12,-2 14,-2 32,6'},
	angry: {up: 'M-28,4 C-12,-4 12,-12 31,-12', lo: 'M-28,4 C-10,12 14,10 31,-12'},
	sad: {up: 'M-28,-4 C-12,-16 12,-12 31,6', lo: 'M-28,-4 C-8,8 14,12 31,6'},
	lidded: {up: 'M-28,2 C-12,-5 12,-8 31,-3', lo: 'M-28,2 C-10,12 14,11 31,-3'},
}[e]);
const browPath = (b: Brow) => ({
	calm: 'M-24,-30 C-6,-40 16,-40 36,-31', arch: 'M-24,-34 C-6,-50 18,-50 38,-34', up: 'M-26,-46 C-10,-52 14,-46 34,-36',
	angry: 'M-26,-22 C-8,-26 14,-38 36,-46', sad: 'M-26,-44 C-8,-46 14,-38 34,-26',
}[b]);
const mouthEl = (m: Mouth, v: Voice, T: number) => {
	const lip = v.col;
	switch (m) {
		case 'grin': return <g><path d="M-40,76 C-18,70 18,70 40,76 C30,118 -30,118 -40,76 Z" fill="#05040a" stroke={v.hot} strokeWidth={2.4} /><path d="M-34,78 C-14,74 14,74 34,78 L31,88 C10,85 -10,85 -31,88 Z" fill="#fff" opacity={0.9} /><path d="M-18,104 C-6,110 6,110 18,104" stroke={lip} strokeWidth={3} fill="none" /></g>;
		case 'set': return <g><path d="M-32,86 C-12,82 12,82 32,86" stroke={v.hot} strokeWidth={3.2} fill="none" /><path d="M-20,94 C-8,98 8,98 20,94" stroke={lip} strokeWidth={3} fill="none" /></g>;
		case 'sad': return <g><path d="M-26,90 C-14,82 -6,82 0,85 C6,82 14,82 26,90 C14,92 -14,92 -26,90 Z" fill={lip} opacity={0.85} /><path d="M-24,92 C-12,100 12,100 24,92 C12,95 -12,95 -24,92 Z" fill={lip} opacity={0.7} /></g>;
		case 'part': return <g><path d="M-30,82 C-16,74 -6,76 0,80 C6,76 16,74 30,82 C14,86 -14,86 -30,82 Z" fill={lip} /><path d="M-26,88 C-12,104 12,104 26,88 C12,93 -12,93 -26,88 Z" fill={lip} /><path d="M-24,86 C-10,90 10,90 24,86" stroke="#05040a" strokeWidth={3} fill="none" /></g>;
		case 'smile': return <g><path d="M-34,80 C-18,78 -6,78 0,82 C6,78 18,78 34,80 C16,92 -16,92 -34,80 Z" fill={lip} /><path d="M-32,82 C-14,104 14,104 32,82 C14,92 -14,92 -32,82 Z" fill={lip} opacity={0.8} /></g>;
		default: return <g><path d="M-28,84 C-16,77 -6,78 0,82 C6,78 16,77 28,84 C14,88 -14,88 -28,84 Z" fill={lip} /><path d="M-26,86 C-12,100 12,100 26,86 C12,90 -12,90 -26,86 Z" fill={lip} opacity={0.8} /></g>;
	}
};
/** one eye at (sx·46, -22), sx = +1 right, -1 left. open 0..1; look = iris shift (−1..1) */
/** the closed almond: upper lid out, lower lid back */
const almond = (up: string, lo: string) => { const nu = up.match(/-?[\d.]+/g)!.map(Number), nl = lo.match(/-?[\d.]+/g)!.map(Number); return `M${nu[0]},${nu[1]} C${nu[2]},${nu[3]} ${nu[4]},${nu[5]} ${nu[6]},${nu[7]} C${nl[4]},${nl[5]} ${nl[2]},${nl[3]} ${nl[0]},${nl[1]} Z`; };
const EyeF: React.FC<{sx: 1 | -1; e: Eye; open: number; v: Voice; draw: number; look?: number; id: string}> = ({sx, e, open, v, draw, look = 0, id}) => {
	const s = eyeShape(e), happy = e === 'happy', shape = almond(s.up, s.lo);
	const closedD = happy ? s.up : s.lo;
	return <g transform={`translate(${sx * 46},-22) scale(${sx},1)`}>
		<clipPath id={id}><path d={shape} /></clipPath>
		{!happy && open > 0 && <g opacity={open}>
			<path d={shape} fill="#eef0ff" opacity={0.92} />
			<g clipPath={`url(#${id})`}>
				<circle cx={2 + look * 10} cy={-2} r={e === 'wide' ? 9 : 12} fill={v.col} />
				<circle cx={2 + look * 10} cy={-2} r={e === 'wide' ? 3.5 : 5} fill="#05040a" />
				<circle cx={6 + look * 10} cy={-7} r={3} fill="#fff" />
			</g>
			<ellipse rx={58} ry={24} fill={v.col} opacity={0.35 * open} filter="url(#gM)" />
		</g>}
		{/* upper lash line, heavier at the outer corner, with a flick */}
		<path d={happy ? s.up : `${s.up} L40,-13`} fill="none" stroke={v.hot} strokeWidth={4} strokeLinecap="round" opacity={happy || open > 0.05 ? draw : 0} />
		{!happy && open > 0.05 && <path d={s.lo} fill="none" stroke={v.hot} strokeWidth={1.4} opacity={0.7 * draw} />}
		{!happy && open > 0.05 && <path d="M-22,-24 C-6,-30 14,-30 30,-20" fill="none" stroke={v.hot} strokeWidth={1.2} opacity={0.5 * draw} />}
		{/* closed: the lid line with lashes */}
		{!happy && open <= 0.05 && <g opacity={draw}><path d={closedD} fill="none" stroke={v.hot} strokeWidth={3.4} strokeLinecap="round" />{[-16, -6, 4, 14, 24].map((lx, i) => <line key={i} x1={lx} y1={8 - Math.abs(lx) * 0.12} x2={lx + 3} y2={16 - Math.abs(lx) * 0.1} stroke={v.hot} strokeWidth={1.6} />)}</g>}
		{happy && <path d="M-22,14 C-8,20 10,20 24,14" fill="none" stroke={v.hot} strokeWidth={1.4} opacity={0.6 * draw} />}
	</g>;
};
const FrontFace: React.FC<{T: number; v: Voice; draw: number; open: number; eye: Eye; brow: Brow; mouth: Mouth; look?: number; tears?: number; hideMouth?: boolean}> = ({T, v, draw, open, eye, brow, mouth, look = 0, tears = 0, hideMouth}) => (
	<g>
		<path d={NECK_F + ' Z'} fill="#08070c" opacity={draw} />
		<Neon d={NECK_F} v={v} draw={draw} w={2.6} />
		{[1, -1].map((s) => <path key={s} d={`M${s * 40},300 C${s * 90},292 ${s * 150},296 ${s * 210},312`} stroke={v.hot} strokeWidth={1.6} fill="none" opacity={0.5 * draw} />)}
		{[1, -1].map((s) => <path key={'e' + s} d={`M${s * 116},-46 C${s * 138},-52 ${s * 142},-8 ${s * 120},6`} fill="#0b0910" stroke={v.hot} strokeWidth={2.4} opacity={draw} />)}
		<path d={FACE_F} fill="url(#skinG)" opacity={draw} />
		<Neon d={FACE_F} v={v} draw={draw} w={3.2} />
		<g opacity={draw}>
			{[1, -1].map((s) => <path key={s} transform={`translate(${s * 46},-22) scale(${s},1)`} d={browPath(brow)} stroke={v.hot} strokeWidth={4.4} strokeLinecap="round" fill="none" />)}
			<path d="M-8,-8 C-12,18 -14,34 -10,46" stroke={v.hot} strokeWidth={1.8} fill="none" opacity={0.75} />
			<path d="M-18,50 C-12,57 -4,55 0,53 C4,55 12,57 18,50" stroke={v.hot} strokeWidth={2} fill="none" />
		</g>
		<EyeF sx={1} e={eye} open={open} v={v} draw={draw} look={look} id={`er${v.n}`} />
		<EyeF sx={-1} e={eye} open={open} v={v} draw={draw} look={-look} id={`el${v.n}`} />
		{!hideMouth && <g opacity={draw}>{mouthEl(mouth, v, T)}</g>}
		{tears > 0 && [1, -1].map((s) => { const ph = (T * 0.6 + (s > 0 ? 0 : 0.5)) % 1; return <g key={'t' + s} opacity={tears}><path d={`M${s * 40},0 C${s * 42},40 ${s * 46},80 ${s * 44},${60 + ph * 120}`} stroke={v.hot} strokeWidth={2.4} fill="none" opacity={0.8} /><path d={`M${s * 44},${64 + ph * 120} c6,10 9,15 0,21 c-9,-6 -6,-11 0,-21 Z`} fill={v.hot} /></g>; })}
	</g>
);

// ---------------------------------------------------------------- profile kit (facing +x)
// ---------------------------------------------------------------- profile kit (facing +x): a smaller skull, a slender neck
const PROFILE = 'M14,-220 C80,-216 120,-182 128,-132 C131,-116 130,-106 136,-96 C142,-84 146,-74 152,-60 C162,-40 172,-28 176,-18 C178,-10 170,-4 158,-4 C152,-4 152,2 158,8 C164,14 160,20 152,22 C158,26 158,34 150,40 C144,44 144,52 148,60 C152,78 140,96 114,100 C90,104 72,112 64,132 C58,170 60,220 70,280 C98,322 196,350 286,384 C336,410 358,480 366,640 L-360,640 C-352,480 -322,400 -244,370 C-160,342 -104,322 -92,280 C-80,220 -78,150 -88,90 C-124,52 -156,-10 -154,-84 C-150,-170 -70,-224 14,-220 Z';
/** hair that covers the crown and the back of the skull, with a hairline at the forehead; the ear stays in front of it */
const HAIR_P = 'M110,-186 C104,-218 66,-242 6,-242 C-92,-242 -170,-180 -172,-90 C-174,-22 -150,40 -108,86 L-94,86 C-104,40 -108,-12 -96,-62 C-84,-110 -52,-150 -8,-168 C34,-182 76,-188 110,-186 Z';
const ProfileFace: React.FC<{T: number; v: Voice; draw: number; open: number; look?: number; tears?: number; lips?: boolean}> = ({T, v, draw, open, look = 0, tears = 0, lips = true}) => (
	<g>
		<path d={PROFILE} fill="url(#skinG)" opacity={draw} />
		<Neon d={PROFILE} v={v} draw={draw} w={3} L={3400} />
		<g opacity={draw}>
			<path d="M-34,-92 C-58,-96 -62,-56 -44,-40 C-38,-36 -32,-40 -34,-50" stroke={v.hot} strokeWidth={2.4} fill="none" />
			<path d="M82,-124 C98,-133 118,-131 132,-120" stroke={v.hot} strokeWidth={4} strokeLinecap="round" fill="none" />
			{lips && <path d="M154,8 C160,13 158,18 150,22 C156,26 156,34 150,40" fill="none" stroke={v.col} strokeWidth={5} />}
		</g>
		<g transform="translate(108,-94)">
			<clipPath id={`pe${v.n}`}><path d="M-22,0 C-10,-12 10,-12 24,-2 C14,8 -8,8 -22,0 Z" /></clipPath>
			{open > 0.05 && <g opacity={open}><path d="M-22,0 C-10,-12 10,-12 24,-2 C14,8 -8,8 -22,0 Z" fill="#eef0ff" /><g clipPath={`url(#pe${v.n})`}><circle cx={8 + look * 10} cy={-2} r={8} fill={v.col} /><circle cx={8 + look * 10} cy={-2} r={3.5} fill="#05040a" /></g><ellipse rx={46} ry={20} fill={v.col} opacity={0.4} filter="url(#gM)" /></g>}
			<path d={open > 0.05 ? 'M-22,0 C-10,-12 10,-12 24,-2 L32,-10' : 'M-22,2 C-8,8 10,8 24,0'} stroke={v.hot} strokeWidth={3.6} fill="none" strokeLinecap="round" opacity={draw} />
			{open <= 0.05 && [-12, -2, 8, 18].map((lx) => <line key={lx} x1={lx} y1={6} x2={lx - 3} y2={15} stroke={v.hot} strokeWidth={1.6} opacity={draw} />)}
		</g>
		{tears > 0 && (() => { const ph = (T * 0.5) % 1; return <g opacity={tears}><path d={`M118,-84 C122,-50 128,-10 126,${10 + ph * 80}`} stroke={v.hot} strokeWidth={2.2} fill="none" /><path d={`M126,${14 + ph * 80} c6,10 9,15 0,21 c-9,-6 -6,-11 0,-21 Z`} fill={v.hot} /></g>; })()}
	</g>
);
const ProfileHair: React.FC<{v: Voice; draw: number; extra?: string}> = ({v, draw, extra}) => <>
	<path d={HAIR_P} fill="url(#hairG)" opacity={draw} />
	{extra && <path d={extra} fill="url(#hairG)" opacity={draw} />}
	<path d={HAIR_P} fill="url(#sheenG)" opacity={draw} />
	{extra && <path d={extra} fill="url(#sheenG)" opacity={draw * 0.7} />}
	{/* strands combed back from the hairline, over the crown and down the back */}
	{Array.from({length: 9}, (_, k) => <path key={k} d={`M${106 - k * 13},${-186 + k * 2} C${60 - k * 18},${-230 + k * 8} ${-96 - k * 6},${-214 + k * 12} ${-150 + k * 6},${-96 + k * 18} C${-160 + k * 6},${-40 + k * 14} ${-146 + k * 4},${20 + k * 8} ${-118 + k * 2},${70 + k * 2}`} stroke={k % 3 === 0 ? v.hot : v.col} strokeWidth={k % 3 === 0 ? 1.5 : 1.1} fill="none" opacity={(k % 3 === 0 ? 0.7 : 0.5) * draw} />)}
	<Neon d={HAIR_P} v={v} draw={draw} w={2.4} L={2000} />
	{extra && <Neon d={extra} v={v} draw={draw} w={2.2} L={2400} />}
</>;

const fing = (bx: number, by: number, tx: number, ty: number, w: number, curl: number) => { const mx = (bx + tx) / 2 + curl, my = (by + ty) / 2; const dx = tx - bx, dy = ty - by, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L; const w0 = w / 2, w1 = w * 0.42; return `M${bx + nx * w0},${by + ny * w0} Q${mx + nx * w0},${my + ny * w0} ${tx + nx * w1},${ty + ny * w1} A${w1},${w1} 0 0,0 ${tx - nx * w1},${ty - ny * w1} Q${mx - nx * w0},${my - ny * w0} ${bx - nx * w0},${by - ny * w0} Z`; };

// ---------------------------------------------------------------- the seven figures
type FigProps = {T: number; v: Voice; draw: number; open: number; orn: (i: number) => number};

const FigXi: React.FC<FigProps> = ({T, v, draw, open, orn}) => (
	<g>
		{/* two buns on a full head of hair, side-swept bangs, one ribbon each side */}
		{[1, -1].map((s) => <g key={s} opacity={draw}>
			<path d={`M${s * 120},-196 C${s * 200},${-230 + 10 * Math.sin(T * 1.6 + s)} ${s * 250},${-170 + 12 * Math.sin(T * 1.3 + s)} ${s * 300},${-110 + 14 * Math.sin(T * 1.2 + s)}`} stroke="#ff6a4a" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.85} />
			<circle cx={s * 104} cy={-206} r={64} fill="url(#hairG)" />
			<Neon d={`M${s * 104 - 64},-206 A64,64 0 1,1 ${s * 104 + 64},-206 A64,64 0 1,1 ${s * 104 - 64},-206`} v={v} draw={draw} w={2.4} />
			<path d={`M${s * 60},-232 C${s * 92},-262 ${s * 136},-254 ${s * 160},-218`} stroke={v.hot} strokeWidth={1.3} fill="none" opacity={0.6} />
			<g transform={`translate(${s * 146},-246)`}>{Array.from({length: 5}, (_, p) => <ellipse key={p} cx={0} cy={-9} rx={5} ry={10} transform={`rotate(${p * 72})`} fill="#ff6a4a" opacity={0.9} />)}<circle r={4} fill={GOLD} /></g>
		</g>)}
		<path d="M-124,-40 C-134,-150 -70,-196 0,-196 C70,-196 134,-150 124,-40 C112,-96 80,-118 40,-120 C10,-104 -30,-96 -70,-108 C-96,-96 -116,-70 -124,-40 Z" fill="url(#hairG)" opacity={draw} />
		<Neon d="M-124,-40 C-134,-150 -70,-196 0,-196 C70,-196 134,-150 124,-40 M124,-40 C112,-96 80,-118 40,-120 C10,-104 -30,-96 -70,-108 C-96,-96 -116,-70 -124,-40" v={v} draw={draw} w={2.4} />
		<FrontFace T={T} v={v} draw={draw} open={open} eye="happy" brow="arch" mouth="grin" />
		{[1, -1].map((s) => <ellipse key={s} cx={s * 70} cy={30} rx={24} ry={10} fill="#ff6a4a" opacity={0.3 * open} filter="url(#gS)" />)}
		<g opacity={orn(0)}><path d="M-210,300 L0,452 L210,300" stroke="url(#goldG)" strokeWidth={6} fill="none" /></g>
	</g>
);

const FigNu: React.FC<FigProps> = ({T, v, draw, open, orn}) => {
	// hair swept up from a real hairline, its ends turning into flame
	const N = 7, tongues = Array.from({length: N}, (_, i) => { const u = i / (N - 1), x = lerp(-205, 205, u), peak = 1 - Math.abs(u - 0.5) * 2; return {x, tip: -190 - 70 * peak - 90 * peak * peak - 18 * Math.sin(T * 4.5 + i * 1.9), lean: (u - 0.5) * 70 + 8 * Math.sin(T * 6 + i)}; });
	const valley = (i: number) => { const u = (i + 0.5) / (N - 1); return {x: lerp(-205, 205, u), y: -176 - 40 * (1 - Math.abs(u - 0.5) * 2)}; };
	const top = tongues.map(({x, tip, lean}, i) => { const vx = i < N - 1 ? valley(i) : {x: 168, y: -120}; return `Q${x - 26 + lean * 0.3},${(tip - 140) * 0.5 - 40} ${x + lean},${tip} Q${x + 30 + lean * 0.4},${(tip + vx.y) / 2} ${vx.x},${vx.y}`; }).join(' ');
	const hair = `M-122,-40 C-138,-80 -160,-110 -176,-126 ${top} C150,-100 134,-74 122,-40 C110,-90 70,-118 0,-122 C-70,-118 -110,-90 -122,-40 Z`;
	return <g>
		<path d={hair} fill="url(#fireHairG)" opacity={draw} />
		<path d={hair} fill="none" stroke="#ffd8a0" strokeWidth={2} opacity={0.7 * draw} />
		{[0, 1, 2, 3, 4, 5, 6].map((k) => { const x0 = lerp(-100, 100, k / 6), x1 = lerp(-200, 200, k / 6); return <path key={k} d={`M${x0},-122 C${x0 * 1.2},-170 ${x1 * 0.9 + 6 * Math.sin(T * 4 + k)},-210 ${x1},${-240 - 70 * (1 - Math.abs(k - 3) / 3)}`} stroke="#ffc07a" strokeWidth={1.5} fill="none" opacity={0.55 * draw} />; })}
		<g opacity={orn(0)}>{[1, -1].map((s) => <g key={s}>
			<path d={`M${s * 120},300 C${s * 200},252 ${s * 330},262 ${s * 400},340 C${s * 330},332 ${s * 220},342 ${s * 140},360 Z`} fill="#140806" stroke={v.hot} strokeWidth={2.4} />
			{[0, 1, 2].map((k) => <path key={k} d={`M${s * (220 + k * 60)},${276 + k * 10} L${s * (246 + k * 66)},${206 + k * 18} L${s * (260 + k * 60)},${292 + k * 10} Z`} fill={v.col} opacity={0.85} />)}
		</g>)}</g>
		<FrontFace T={T} v={v} draw={draw} open={open} eye="angry" brow="angry" mouth="set" />
		<g opacity={orn(1)}><path d="M0,-98 L9,-84 L0,-70 L-9,-84 Z" fill={v.col} stroke="#fff1c4" strokeWidth={1.4} /></g>
	</g>;
};

const FigAi: React.FC<FigProps> = ({T, v, draw, open, orn}) => (
	<g transform="rotate(14)">
		{/* long hair falling straight down the back, a single pin */}
		<ProfileFace T={T} v={v} draw={draw} open={0} tears={open} />
		<ProfileHair v={v} draw={draw} extra="M-170,-80 C-178,40 -190,200 -214,420 L-112,420 C-112,260 -104,140 -100,86 L-108,86 C-150,40 -168,-20 -170,-80 Z" />
		{[0, 1, 2].map((k) => <path key={k} d={`M${-150 + k * 14},-20 C${-160 + k * 14},120 ${-170 + k * 12},260 ${-186 + k * 14},420`} stroke={v.hot} strokeWidth={1.2} fill="none" opacity={0.45 * draw} />)}
		<g opacity={orn(0)} transform="translate(-60,-196) rotate(-20)"><line x1={-20} y1={0} x2={120} y2={0} stroke="url(#goldG)" strokeWidth={4} /><circle cx={-20} cy={0} r={7} fill={v.col} /></g>
	</g>
);

const FigJu: React.FC<FigProps> = ({T, v, draw, open, orn}) => {
	const tr = 1.4 * Math.sin(T * 37) * Math.sin(T * 6.3);
	// hair standing on end: a full head of hair whose outline bristles
	const spikes = Array.from({length: 21}, (_, i) => { const a = lerp(-170, -10, i / 20) * Math.PI / 180, r0 = 150, r1 = 196 + 46 * rnd(i, 2) + 22 * Math.sin(i * 1.7); return [Math.cos(a) * r0, Math.sin(a) * r0 - 10, Math.cos(a) * r1, Math.sin(a) * r1 - 10] as const; });
	const hair = 'M-122,-40 ' + spikes.map(([x0, y0, x1, y1], i) => `L${x1.toFixed(1)},${y1.toFixed(1)} L${(spikes[i + 1] ? (x0 + spikes[i + 1][0]) / 2 : 122).toFixed(1)},${(spikes[i + 1] ? (y0 + spikes[i + 1][1]) / 2 : -40).toFixed(1)}`).join(' ') + ' C110,-96 70,-116 0,-118 C-70,-116 -110,-96 -122,-40 Z';
	const hands = orn(0);
	const fingers = (s: 1 | -1) => [0, 1, 2, 3].map((i) => fing(s * (14 + i * 27), 150 + i * 6, s * (6 + i * 30) + tr, [18, 4, 10, 30][i] + tr, 28 - i * 1.5, s * (6 - i * 2)));
	return <g>
		<path d={hair} fill="url(#hairG)" opacity={draw} />
		<Neon d={hair} v={v} draw={draw} w={2.2} />
		<FrontFace T={T} v={v} draw={draw} open={open} eye="wide" brow="up" mouth="closed" hideMouth />
		<g opacity={hands} transform={`translate(0,${100 * (1 - out3(hands))})`}>
			{[1, -1].map((s) => <g key={s}>
				<path d={`M${s * 4},146 C${s * 2},200 ${s * 20},250 ${s * 60},290 L${s * 120},420 L${s * 230},420 C${s * 200},330 ${s * 150},230 ${s * 130},170 C${s * 100},150 ${s * 40},140 ${s * 4},146 Z`} fill="#0b1018" stroke={v.hot} strokeWidth={2.4} />
				<path d={fing(s * 128, 200, s * 116 + tr, 70, 30, s * 22)} fill="#0b1018" stroke={v.hot} strokeWidth={2.4} />
				{fingers(s as 1 | -1).slice().reverse().map((d, i) => <path key={i} d={d} fill="#0b1018" stroke={v.hot} strokeWidth={2.4} />)}
			</g>)}
		</g>
	</g>;
};

const FigLove: React.FC<FigProps> = ({T, v, draw, open, orn}) => {
	// five clean locks lifting back in the wind (filled ribbons, not a mess of lines)
	const locks = [0, 1, 2, 3, 4].map((k) => {
		const y0 = -170 + k * 50, x0 = -150 + k * 6, L = 300 + 60 * Math.sin(k * 1.3), w = Math.sin(T * 1.6 - k * 0.6) * 26, th = 26 - k * 3;
		return `M${x0 + 20},${y0 - th} C${x0 - L * 0.35},${y0 - 40 - th + w} ${x0 - L * 0.7},${y0 + 10 - w} ${x0 - L},${y0 + 40 + w} C${x0 - L * 0.7},${y0 + 30 - w} ${x0 - L * 0.35},${y0 + th - 10 + w} ${x0 + 20},${y0 + th} Z`;
	});
	return <g>
		{locks.map((d, k) => <g key={k} opacity={draw}><path d={d} fill="url(#hairG)" /><path d={d} fill="none" stroke={k % 2 ? v.hot : v.col} strokeWidth={1.8} opacity={0.85} /></g>)}
		<ProfileFace T={T} v={v} draw={draw} open={open} />
		<ProfileHair v={v} draw={draw} />
		{/* a hairpin, and the one red thread tied to it */}
		<g opacity={orn(0)} transform="translate(-40,-190) rotate(-28)"><line x1={-10} y1={0} x2={110} y2={0} stroke="url(#goldG)" strokeWidth={4} /><circle cx={-10} cy={0} r={8} fill={v.col} /></g>
	</g>;
};

const FigWu: React.FC<FigProps> = ({T, v, draw, open, orn}) => (
	<g>
		{/* a high bun on a full head of hair, two long pins */}
		<g opacity={draw}>
			<ellipse cx={-50} cy={-262} rx={64} ry={50} fill="url(#hairG)" />
			<Neon d="M-114,-262 A64,50 0 1,1 14,-262 A64,50 0 1,1 -114,-262" v={v} draw={draw} w={2.2} />
		</g>
		<g opacity={orn(0)}>{[0, 1].map((k) => <g key={k} transform={`translate(-50,-270) rotate(${-150 + k * 26})`}><line x1={-30} y1={0} x2={150} y2={0} stroke="url(#goldG)" strokeWidth={3.5} /><circle cx={150} cy={0} r={5} fill={v.col} /></g>)}</g>
		<ProfileFace T={T} v={v} draw={draw} open={open} look={-1} lips={false} />
		<ProfileHair v={v} draw={draw} />
		{/* a sheer veil from the ear across the nose and mouth, a fringe of tiny beads */}
		<g opacity={orn(1)}>
			<path d={`M-30,-58 C30,-50 110,-58 186,-46 C${196 + 3 * Math.sin(T * 1.4)},0 ${190 + 4 * Math.sin(T * 1.2)},70 ${180 + 4 * Math.sin(T * 1.3)},132 C120,160 40,150 -24,108 C-30,40 -34,-10 -30,-58 Z`} fill="url(#veilG)" stroke={v.hot} strokeWidth={1.4} />
			{[0, 1, 2].map((k) => <path key={k} d={`M${30 + k * 50},-50 C${40 + k * 50},20 ${30 + k * 52},90 ${20 + k * 54},${140 - k * 4}`} stroke={v.hot} strokeWidth={1} fill="none" opacity={0.35} />)}
			{Array.from({length: 9}, (_, k) => { const u = k / 8, x = lerp(-20, 178, u), y = 108 + (132 - 108) * u + 38 * Math.sin(Math.PI * u); return <g key={k}><line x1={x} y1={y} x2={x} y2={y + 12 + 2 * Math.sin(T * 2 + k)} stroke={GOLD} strokeWidth={1} /><circle cx={x} cy={y + 14 + 2 * Math.sin(T * 2 + k)} r={3} fill={k % 3 ? GOLD : v.col} /></g>; })}
			<circle cx={-30} cy={-58} r={6} fill="url(#goldG)" />
		</g>
	</g>
);

const FigYu: React.FC<FigProps> = ({T, v, draw, open, orn}) => (
	<g>
		<g opacity={orn(0)} transform={`scale(${lerp(0.7, 1, outBack(orn(0)))})`}>
			{Array.from({length: 9}, (_, i) => { const a = lerp(-160, -20, i / 8) * Math.PI / 180, L = 340 + 30 * Math.sin(i * 1.3), ex = Math.cos(a) * L, ey = Math.sin(a) * L - 120; return <g key={i}>
				<line x1={0} y1={-120} x2={ex} y2={ey} stroke={v.hot} strokeWidth={1.1} opacity={0.5} />
				<ellipse cx={ex} cy={ey} rx={22} ry={30} transform={`rotate(${a * 180 / Math.PI + 90},${ex},${ey})`} fill="#1a0a2c" stroke={v.col} strokeWidth={2.2} />
				<ellipse cx={ex} cy={ey} rx={9} ry={13} transform={`rotate(${a * 180 / Math.PI + 90},${ex},${ey})`} fill="#3ad0c0" opacity={0.85} />
			</g>; })}
		</g>
		<path d="M-124,-40 C-134,-150 -70,-200 0,-200 C70,-200 134,-150 124,-40 C112,40 140,160 170,260 L110,260 C96,160 100,60 96,-30 C70,-110 -70,-110 -96,-30 C-100,60 -96,160 -110,260 L-170,260 C-140,160 -112,40 -124,-40 Z" fill="url(#hairG)" opacity={draw} />
		<Neon d="M-124,-40 C-134,-150 -70,-200 0,-200 C70,-200 134,-150 124,-40 C112,40 140,160 170,260 M-124,-40 C-112,40 -140,160 -170,260" v={v} draw={draw} w={2.4} />
		<FrontFace T={T} v={v} draw={draw} open={open} eye="lidded" brow="calm" mouth="part" look={0.2} />
		<g opacity={orn(1)}>{[1, -1].map((s) => <g key={s} transform={`translate(${s * 130},30)`}><line x1={0} y1={-30} x2={0} y2={0} stroke={GOLD} strokeWidth={1.4} /><circle r={15} fill="url(#goldG)" /><rect x={-5} y={-5} width={10} height={10} fill="#1a0a2c" /></g>)}</g>
	</g>
);

// ---------------------------------------------------------------- halo: clean rings (blank inside); 哀 a moon, 欲 a coin
const Halo: React.FC<{T: number; v: Voice; s: number; disc: number}> = ({T, v, s, disc}) => {
	if (v.kind === 'yu') return <g transform={`scale(${s}) rotate(${T * 4})`}>
		<circle r={560} fill="url(#auraG)" />
		<circle r={340} fill="url(#goldG)" opacity={0.22} />
		<circle r={340} fill="none" stroke="url(#goldG)" strokeWidth={8} />
		<circle r={318} fill="none" stroke={GOLD} strokeWidth={1.6} />
		<rect x={-150} y={-150} width={300} height={300} fill="#0a0612" stroke="url(#goldG)" strokeWidth={6} />
		{['七', '情', '之', '欲'].map((c, i) => <text key={c} transform={`rotate(${i * 90}) translate(0,${-340 + 62})`} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 52}} fill="#fff2c8" opacity={0.75}>{c}</text>)}
	</g>;
	if (v.kind === 'ai') return <g transform={`scale(${s})`}>
		<circle r={560} fill="url(#auraG)" />
		<circle r={340} fill={v.hot} opacity={0.14} />
		<circle r={340} fill="none" stroke={v.hot} strokeWidth={2.4} opacity={0.8} />
	</g>;
	return <g transform={`scale(${s})`}>
		<circle r={560} fill="url(#auraG)" />
		<circle r={300} fill="url(#discG)" opacity={disc} />
		<circle r={340} fill="none" stroke="url(#goldG)" strokeWidth={1.6} opacity={0.85} />
		<circle r={300} fill="none" stroke={v.hot} strokeWidth={3} />
		<circle r={300} fill="none" stroke={v.col} strokeWidth={10} opacity={0.35} filter="url(#gM)" />
	</g>;
};

// ---------------------------------------------------------------- the world: one simple, slow, meaningful element each
const World: React.FC<{T: number; v: Voice; u: number; cx: number; cy: number}> = ({T, v, u, cx, cy}) => {
	if (u <= 0) return null;
	switch (v.kind) {
		case 'xi': return <g opacity={u}>{Array.from({length: 3}, (_, k) => { const per = BAR, ph = ((T + k * per / 3) % per) / per, bx = [960, 1780, 1040][k], by = [180, 220, 880][k]; return <g key={k} opacity={1 - ph}>{Array.from({length: 14}, (_, i) => { const a = i / 14 * Math.PI * 2, r = 20 + 120 * out3(ph); return <line key={i} x1={bx + Math.cos(a) * r * 0.65} y1={by + Math.sin(a) * r * 0.65} x2={bx + Math.cos(a) * r} y2={by + Math.sin(a) * r} stroke={v.col} strokeWidth={2.4} strokeLinecap="round" />; })}</g>; })}</g>;
		case 'nu': return <g opacity={u * 0.8}>{Array.from({length: 9}, (_, i) => { const x = 860 + i * 135, h = 220 + 140 * rnd(i, 71) + 40 * Math.sin(T * 4 + i), w = 80; return <path key={i} d={`M${x - w},1090 C${x - w},${1090 - h * 0.6} ${x + 10 * Math.sin(T * 5 + i)},${1090 - h * 0.8} ${x},${1090 - h} C${x + w * 0.4},${1090 - h * 0.6} ${x + w},${1090 - h * 0.4} ${x + w},1090 Z`} fill="url(#flameG)" opacity={0.42} filter="url(#gS)" />; })}</g>;
		case 'ai': return <g opacity={u}>{Array.from({length: 40}, (_, i) => { const ph = (T * (1.1 + 0.4 * rnd(i, 81)) + rnd(i, 82)) % 1, x = 820 + rnd(i, 83) * 1100, y = -60 + ph * 1200; return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 40} stroke={v.hot} strokeWidth={1.2} opacity={0.35} />; })}</g>;
		case 'ju': return <g opacity={u}>{[[920, 180], [1860, 240], [1880, 820], [930, 900], [1640, 70], [1180, 1010]].map(([x, y], i) => { const op = out3((u - i * 0.08) * 2.5), ang = Math.atan2(cy - y, cx - x); return op > 0 && <g key={i} transform={`translate(${x},${y}) scale(${0.9 + 0.3 * rnd(i, 13)})`}><path d={`M-40,0 Q0,${-24 * op} 40,0 Q0,${24 * op} -40,0 Z`} fill="#02080b" stroke={v.col} strokeWidth={2.2} /><circle cx={Math.cos(ang) * 9 * op} cy={Math.sin(ang) * 6 * op} r={9 * op} fill={v.hot} /><circle cx={Math.cos(ang) * 9 * op} cy={Math.sin(ang) * 6 * op} r={3.5 * op} fill="#000" /></g>; })}</g>;
		case 'love': return <g transform={`translate(${cx + 30},${cy - 30}) rotate(${T * 3}) scale(${lerp(0.7, 1, out3(u))})`} opacity={u * 0.9}>
			{[[8, 470, 240], [8, 360, 190]].map(([n, r, w], ring) => Array.from({length: n}, (_, i) => <path key={ring + '-' + i} transform={`rotate(${(i / n) * 360 + ring * 22})`} d={`M0,0 C${-w * 0.6},${-r * 0.35} ${-w},${-r * 0.8} ${-w * 0.35},${-r} C${-w * 0.12},${-r * 1.06} ${w * 0.12},${-r * 0.94} 0,${-r * 0.9} C${w * 0.12},${-r * 0.94} ${w * 0.35},${-r * 1.06} ${w * 0.35},${-r} C${w},${-r * 0.8} ${w * 0.6},${-r * 0.35} 0,0 Z`} fill={v.col} fillOpacity={0.06 + 0.04 * ring} stroke={v.col} strokeWidth={1.4} strokeOpacity={0.45} />))}
		</g>;
		case 'wu': return <g opacity={u}>{[0, 1, 2].map((i) => { const len = 1400, d = [`M1920,140 C1700,180 1640,360 1500,320`, `M1920,920 C1720,860 1700,1000 1520,1080`, `M820,1080 C900,960 1000,980 1020,880`][i]; return <path key={i} d={d} stroke={v.col} strokeWidth={3} fill="none" strokeDasharray={len} strokeDashoffset={len * (1 - out3(u * 1.4 - i * 0.1))} />; })}</g>;
		case 'yu': return <g opacity={u}>{Array.from({length: 10}, (_, i) => { const ph = (T * (0.12 + 0.06 * rnd(i, 95)) + rnd(i, 96)) % 1, x = 860 + rnd(i, 97) * 1040, y = -40 + ph * 1160; return <g key={i} transform={`translate(${x},${y}) rotate(${T * 60 + i * 30}) scale(${Math.cos(T * 2 + i)},1)`} opacity={0.7}><circle r={14} fill="url(#goldG)" /><rect x={-4.5} y={-4.5} width={9} height={9} fill="#1a0a2c" /></g>; })}</g>;
	}
};
// ---------------------------------------------------------------- text
const BlurText: React.FC<{x: number; y: number; text: string; size: number; u: number; out?: number; weight?: number; col?: string; spacing?: string; anchor?: 'start' | 'middle'; id: string}> = ({x, y, text, size, u, out = 0, weight = 900, col = '#fff', spacing = '0.04em', anchor = 'start', id}) => {
	const b = 12 * (1 - out3(u)) + 16 * ease(out), o = cl01(u * 1.6) * (1 - ease(out));
	if (o <= 0.001) return null;
	return <g>
		<filter id={id} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation={`${(b * 2.2).toFixed(2)} ${(b * 0.4).toFixed(2)}`} /></filter>
		<text x={x} y={y} textAnchor={anchor} style={{fontFamily: SERIF, fontWeight: weight, fontSize: size, letterSpacing: spacing}} fill={col} opacity={o * 0.4} filter="url(#gM)">{text}</text>
		<text x={x - 50 * (1 - out3(u))} y={y} textAnchor={anchor} style={{fontFamily: SERIF, fontWeight: weight, fontSize: size, letterSpacing: spacing}} fill={col} opacity={o} filter={b > 0.2 ? `url(#${id})` : undefined}>{text}</text>
	</g>;
};
const Icon: React.FC<{x: number; y: number; ch: string; col: string; o: number; s?: number}> = ({x, y, ch, col, o, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
		<circle r={44} fill={col} opacity={0.14} filter="url(#gM)" />
		<circle r={38} fill="none" stroke={col} strokeWidth={2} />
		<text y={12} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 34}} fill="#fff">{ch}</text>
	</g>
);

// ---------------------------------------------------------------- one voice: line on its downbeat, the figure on the next
const FIG: Record<Kind, React.FC<FigProps>> = {xi: FigXi, nu: FigNu, ai: FigAi, ju: FigJu, love: FigLove, wu: FigWu, yu: FigYu};
const PLACE: Record<Kind, {dx: number; dy: number; s: number; flip?: boolean}> = {
	xi: {dx: 0, dy: 50, s: 1.5}, nu: {dx: 0, dy: 70, s: 1.5}, ai: {dx: 70, dy: 70, s: 1.38, flip: true}, ju: {dx: 0, dy: 10, s: 1.7},
	love: {dx: 30, dy: 30, s: 1.4, flip: true}, wu: {dx: -40, dy: 40, s: 1.4}, yu: {dx: 0, dy: 70, s: 1.48},
};
const VoiceScene: React.FC<{T: number; v: Voice; i: number}> = ({T, v, i}) => {
	const t0 = Q0[i], t = T - t0, rv = BAR, len = (i < 6 ? Q0[i + 1] : OUT) - t0;
	const cx = 1400, cy = 500, pl = PLACE[v.kind], Fig = FIG[v.kind];
	const cap = fade(t, 0.04, 0.28), quote = fade(t, BEAT * 0.5, 0.32), outQ = fade(t, rv - 0.14, 0.12);
	const lit = cl01((t - rv + 0.02) / 0.3), rise = cl01((t - rv + 0.02) / 0.24);
	const open = ease((t - rv - 2 * BEAT) / (v.kind === 'ju' ? 0.07 : 0.18));
	const orn = (k: number) => out3(cl01((t - rv - BEAT * (0.5 + 0.5 * k)) / 0.22));
	const flash = Math.max(0, 1 - Math.abs(t - rv) / 0.13);
	const sub = fade(t, rv + BEAT - 0.12, 0.2), name = cl01((t - rv - BEAT) / 0.2), sweep = cl01((t - rv - BEAT - 0.2) / 0.45);
	const leave = fade(t, len - 0.2, 0.2);
	const ring = t >= rv && t < rv + 0.55 ? (t - rv) / 0.55 : -1;
	return (
		<svg width={W} height={H}>
			<Defs v={v} />
			<g opacity={1 - leave}>
				<rect width={W} height={H} fill="url(#bgG)" />
				<World T={T} v={v} u={cl01((t - rv) / 1.2)} cx={cx} cy={cy} />
				<g transform={`translate(${cx},${cy}) scale(${1 + 0.04 * ease(t / len)})`}>
					<Halo T={T} v={v} s={lerp(0.9, 1, out3(t / 0.3)) * (1 + 0.1 * Math.max(0, 1 - Math.abs(t - rv) / 0.22))} disc={1 - lit * 0.4} />
					{ring >= 0 && <circle r={300 + 800 * out3(ring)} fill="none" stroke={v.hot} strokeWidth={12 * (1 - ring)} opacity={1 - ring} />}
					{rise > 0 && <g transform={`translate(${pl.dx},${pl.dy + lerp(80, 0, out3(rise))}) scale(${pl.s * lerp(0.74, 1, outBack(rise))}) ${pl.flip ? 'scale(-1,1)' : ''}`} opacity={cl01(rise * 4)}>
						<Fig T={T} v={v} draw={out3(rise)} open={open} orn={orn} />
					</g>}
				</g>
				{v.kind === 'love' && lit > 0 && (() => { const u = cl01((t - rv - BEAT) / (2 * BEAT)), L = 1600, w = 30 * Math.sin(T * 1.2); const d = `M${cx + 120},${cy - 210} C${cx + 260},${cy - 380 + w} ${cx + 420},${cy - 120 - w} ${W + 20},${cy - 300}`; return <g><path d={d} stroke={v.col} strokeWidth={6} fill="none" opacity={0.35} filter="url(#gM)" strokeDasharray={L} strokeDashoffset={L * (1 - out3(u))} /><path d={d} stroke={v.col} strokeWidth={2.4} fill="none" strokeDasharray={L} strokeDashoffset={L * (1 - out3(u))} /></g>; })()}
				{/* left: the moment and the line */}
				<BlurText id={`c${v.n}`} x={150} y={470} text={v.when} size={36} weight={600} col="#d4cde2" spacing="0.12em" u={cap} out={outQ} />
				<BlurText id={`q${v.n}`} x={130} y={590} text={v.line} size={92} u={quote} out={outQ} />
				{/* left: the name */}
				<BlurText id={`s${v.n}`} x={150} y={360} text={`七情之${NUM[v.n]}，它叫`} size={38} weight={700} col="#efe9fb" spacing="0.16em" u={sub} />
				{name > 0 && <g>
					<clipPath id={`sw${v.n}`}><rect x={60 + 620 * sweep} y={370} width={110} height={360} transform="skewX(-18)" /></clipPath>
					<g transform={`translate(${-100 * (1 - out3(name))},30)`} opacity={cl01(name * 2.5)}>
						<text x={140} y={640} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 330}} fill={v.col} opacity={0.6} filter="url(#gL)">{v.ch}</text>
						<text x={140} y={640} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 330}} fill="url(#nameG)">{v.ch}</text>
						<text x={140} y={640} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 330}} fill="#fff" clipPath={`url(#sw${v.n})`}>{v.ch}</text>
						<text x={510} y={470} style={{fontFamily: SERIF, fontWeight: 600, fontSize: 52, fontStyle: 'italic', letterSpacing: '0.1em'}} fill="#fff">{v.py}</text>
						<rect x={492} y={410} width={5} height={230} fill="url(#goldG)" />
						<text x={510} y={540} style={{fontFamily: SERIF, fontWeight: 600, fontSize: 30, letterSpacing: '0.24em'}} fill={GOLD}>七情 · 之{NUM[v.n]}</text>
					</g>
				</g>}
			</g>
			{flash > 0 && <><rect width={W} height={H} fill={v.hot} opacity={0.3 * flash} /><ellipse cx={cx} cy={cy} rx={1100 * flash} ry={50} fill="#fff" opacity={0.75 * flash} filter="url(#gL)" /></>}
		</svg>
	);
};

// ---------------------------------------------------------------- intro / outro
const SEVEN = VOICES.map((v) => ({ch: v.ch, col: v.col}));
const Intro: React.FC<{T: number}> = ({T}) => (
	<svg width={W} height={H}>
		<Defs v={{col: '#b9b0ff', hot: '#ece8ff', deep: '#141026'}} />
		<g opacity={1 - fade(T, Q0[0] - 0.25, 0.25)}>
			<rect width={W} height={H} fill="url(#bgG)" />
			<BlurText id="i1" x={960} y={380} text="两千年前，《礼记》写道：" size={40} weight={600} col="#cfc8de" spacing="0.14em" anchor="middle" u={fade(T, 0.25, 0.5)} />
			<BlurText id="i2" x={960} y={500} text="人心里，天生住着七个声音。" size={84} anchor="middle" u={fade(T, BAR, 0.5)} />
			{SEVEN.map((s, i) => { const o = cl01((T - (2 * BAR + i * BEAT)) / 0.12); return <Icon key={s.ch} x={960 + (i - 3) * 132} y={680} ch={s.ch} col={s.col} o={o} s={lerp(1.6, 1, outBack(o))} />; })}
		</g>
	</svg>
);
const Outro: React.FC<{T: number}> = ({T}) => {
	const t = T - OUT, q = fade(t, 0.05, 0.35), qOut = fade(t, 2 * BAR - 0.2, 0.2), title = cl01((t - 2 * BAR) / 0.22);
	return (
		<svg width={W} height={H}>
			<Defs v={{col: GOLD, hot: '#fff2c8', deep: '#1c1408'}} />
			<rect width={W} height={H} fill="url(#bgG)" />
			<g opacity={1 - qOut}>
				<BlurText id="o1" x={960} y={450} text="你心里，哪个声音最大？" size={80} anchor="middle" u={q} />
				{SEVEN.map((s, i) => { const o = cl01((t - BEAT - i * BEAT * 0.5) / 0.12); return <Icon key={s.ch} x={960 + (i - 3) * 132} y={620} ch={s.ch} col={s.col} o={o} s={lerp(1.5, 1, outBack(o))} />; })}
			</g>
			{title > 0 && <g opacity={title * (1 - fade(t, 4 * BAR, 0.5))} transform={`translate(960,540) scale(${lerp(1.25, 1, out3(title))}) translate(-960,-540)`}>
				<text x={960} y={590} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 230, letterSpacing: '0.12em'}} fill="#fff2d0" opacity={0.6} filter="url(#gL)">七情</text>
				<text x={960} y={590} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 230, letterSpacing: '0.12em'}} fill="url(#goldG)">七情</text>
				<text x={960} y={680} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 600, fontSize: 34, letterSpacing: '0.9em'}} fill={GOLD}>喜怒哀惧爱恶欲</text>
			</g>}
		</svg>
	);
};

export const QiQing7: React.FC = () => {
	const T = useCurrentFrame() / FPS;
	let i = 0; while (i < 6 && T >= Q0[i + 1]) i++;
	const node = T < Q0[0] ? <Intro T={T} /> : T < OUT ? <VoiceScene T={T} v={VOICES[i]} i={i} /> : <Outro T={T} />;
	return <AbsoluteFill style={{background: '#030205'}}>
		{node}
		<div style={{position: 'absolute', right: 56, bottom: 40, fontFamily: SERIF, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(230,224,245,0.4)'}}>VIBE知识大赏 · 七情</div>
	</AbsoluteFill>;
};

registerRoot(() => <Composition id="QQ7" component={QiQing7} durationInFrames={Math.round(QQ7_END * FPS)} fps={FPS} width={W} height={H} />);
