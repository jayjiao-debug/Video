import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';

/* 《七情》 full film v5 — seven voices, each its own figure, world and effects.
   Faces are drawn properly now (almond eyes with lash line and crease, iris, nose bridge, shaped lips, ears, neck);
   each voice differs in pose, expression, hair, halo and background:
     喜 laughs (twin buns, ribbons) in fireworks;   怒 glares, hair turned to flame, in fire and lava cracks;
     哀 bows her head, eyes shut, tears, in rain under a moon;   惧 hands over the mouth, eyes wide, watched by eyes;
     爱 profile, hair into red threads, peony;   恶 turns away behind a fan, side glance, thorns and miasma;
     欲 half-lidded, reaching hand, peacock crown, the halo an old square-holed coin, coins and reaching hands.
   Music: the reference's own section of "I Got Love" (original from 48.588 s, slowed ×0.9545), muxed after render.
   Source: 《礼记·礼运》“喜、怒、哀、惧、爱、恶、欲，七者弗学而能。” */

const W = 1920, H = 1080, FPS = 30;
const cl01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (u: number) => { const v = cl01(u); return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
const out3 = (u: number) => 1 - Math.pow(1 - cl01(u), 3);
const outBack = (u: number) => { const v = cl01(u), c1 = 2.0, c3 = c1 + 1; return 1 + c3 * Math.pow(v - 1, 3) + c1 * Math.pow(v - 1, 2); };
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const fade = (T: number, a: number, d = 0.4) => ease((T - a) / d);
const rnd = (i: number, k = 0) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
type P = [number, number];

const SERIF = '"Noto Serif CJK SC", serif';
const GOLD = '#e6c47a';

// ---------------------------------------------------------------- music grid: "I Got Love" (Yazhe remix), 114.89 BPM
// film t = 0 is track 243.849 s (5 bars before the drop at 254.291 s). Every reveal lands on a downbeat;
// bar 15 is the remix's one-bar bass break, so 恶's line sits in it and 恶 lands on the bass's return at bar 16.
const BEAT = 0.52223, BAR = 4 * BEAT;
const bt = (bar: number) => (bar + 5) * BAR;            // film time of a bar counted from the drop
const REV = [0, 3, 6, 9, 12, 16, 19].map(bt);            // reveal (downbeat) of each voice
const Q0 = REV.map((r) => r - BAR);                      // its line starts one bar earlier
const OUT = bt(22);
export const QQ5_END = bt(26) + 0.6;

type Kind = 'xi' | 'nu' | 'ai' | 'ju' | 'love' | 'wu' | 'yu';
type Voice = {n: number; ch: string; py: string; kind: Kind; col: string; hot: string; deep: string; when: string; line: string; say: string};
const VOICES: Voice[] = [
	{n: 1, ch: '喜', py: 'xǐ', kind: 'xi', col: '#ffc23a', hot: '#fff1c4', deep: '#2a1c04', when: '它在你收到他消息的那一秒说', line: '“嘴角，压不住了。”', say: '被在乎的感觉，藏不住。'},
	{n: 2, ch: '怒', py: 'nù', kind: 'nu', col: '#ff4a2a', hot: '#ffd2b8', deep: '#2c0704', when: '它在你被冤枉时说', line: '“凭什么是我？”', say: '心里有火，是因为在乎公平。'},
	{n: 3, ch: '哀', py: 'āi', kind: 'ai', col: '#7aa6ff', hot: '#dce8ff', deep: '#081226', when: '它在你删掉合照时说', line: '“原来，真的结束了。”', say: '会疼，是因为真的爱过。'},
	{n: 4, ch: '惧', py: 'jù', kind: 'ju', col: '#5fe0ff', hot: '#d8f8ff', deep: '#04202c', when: '它在你按下发送前说', line: '“万一，他不回呢？”', say: '怕失去，所以不敢开口。'},
	{n: 5, ch: '爱', py: 'ài', kind: 'love', col: '#ff4f86', hot: '#ffd6e4', deep: '#2c0616', when: '它在你记住他随口一句话时说', line: '“他说过，他怕冷。”', say: '心里有人，才会记得。'},
	{n: 6, ch: '恶', py: 'wù', kind: 'wu', col: '#9be35a', hot: '#e6ffd0', deep: '#0c1c06', when: '它在你听见虚伪的客套时说', line: '“别装了。”', say: '讨厌，是在替你守住底线。'},
	{n: 7, ch: '欲', py: 'yù', kind: 'yu', col: '#c47bff', hot: '#f0dcff', deep: '#1a0a2c', when: '它在你深夜刷购物车时说', line: '“就这一次。”', say: '想要，让人往前，也让人停不下。'},
];
const NUM = ['零', '一', '二', '三', '四', '五', '六', '七'];

// ---------------------------------------------------------------- defs
const Defs: React.FC<{v: {col: string; hot: string; deep: string}}> = ({v}) => (
	<defs>
		<filter id="gS" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
		<filter id="gM" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="10" /></filter>
		<filter id="gL" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="34" /></filter>
		<radialGradient id="bgG" cx="0.72" cy="0.48" r="0.8"><stop offset="0" stopColor={v.deep} /><stop offset="0.5" stopColor="#08070d" /><stop offset="1" stopColor="#030205" /></radialGradient>
		<radialGradient id="orbG" cx="0.45" cy="0.4" r="0.7"><stop offset="0" stopColor={v.col} stopOpacity="0.5" /><stop offset="0.6" stopColor={v.deep} stopOpacity="0.95" /><stop offset="1" stopColor="#05040a" /></radialGradient>
		<radialGradient id="auraG"><stop offset="0" stopColor={v.col} stopOpacity="0.5" /><stop offset="1" stopColor={v.col} stopOpacity="0" /></radialGradient>
		<radialGradient id="hotG"><stop offset="0" stopColor="#fff" /><stop offset="0.35" stopColor={v.hot} stopOpacity="0.9" /><stop offset="1" stopColor={v.col} stopOpacity="0" /></radialGradient>
		<radialGradient id="skinG" cx="0.5" cy="0.35" r="0.75"><stop offset="0" stopColor={v.deep} /><stop offset="0.7" stopColor="#0b0910" /><stop offset="1" stopColor="#07060b" /></radialGradient>
		<linearGradient id="nameG" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="0.45" stopColor={v.hot} /><stop offset="1" stopColor={v.col} /></linearGradient>
		<linearGradient id="goldG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff2c8" /><stop offset="0.5" stopColor={GOLD} /><stop offset="1" stopColor="#a8823c" /></linearGradient>
		<linearGradient id="jadeG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={v.hot} stopOpacity="0.5" /><stop offset="0.5" stopColor={v.col} stopOpacity="0.25" /><stop offset="1" stopColor={v.deep} stopOpacity="0.6" /></linearGradient>
		<linearGradient id="flameG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ff3a10" /><stop offset="0.6" stopColor="#ff9a3a" /><stop offset="1" stopColor="#fff1c4" /></linearGradient>
	</defs>
);

/** neon line: a glow pass and a hot core, drawn on with dash */
const Neon: React.FC<{d: string; v: Voice; draw: number; w?: number; L?: number; core?: string; glow?: number}> = ({d, v, draw, w = 3, L = 3000, core, glow = 0.5}) => <>
	<path d={d} fill="none" stroke={v.col} strokeWidth={w * 3.4} opacity={glow} filter="url(#gM)" strokeDasharray={L} strokeDashoffset={L * (1 - draw)} strokeLinecap="round" />
	<path d={d} fill="none" stroke={core ?? v.hot} strokeWidth={w} strokeDasharray={L} strokeDashoffset={L * (1 - draw)} strokeLinecap="round" strokeLinejoin="round" />
</>;

const Bolt: React.FC<{a: P; b: P; seed: number; T: number; col: string; w?: number; o?: number}> = ({a, b, seed, T, col, w = 2.2, o = 1}) => {
	const roll = Math.floor(T * 14), n = 12;
	const pts = Array.from({length: n + 1}, (_, i) => { const u = i / n, j = (i === 0 || i === n) ? 0 : (rnd(seed * 31 + i, roll) - 0.5) * 70; const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [a[0] + dx * u - dy / L * j, a[1] + dy * u + dx / L * j]; });
	const d = 'M' + pts.map((p) => p.map((q) => q.toFixed(1)).join(',')).join(' L');
	return <g opacity={o * (rnd(seed, roll) > 0.35 ? 1 : 0.2)}><path d={d} stroke={col} strokeWidth={w * 4} fill="none" opacity={0.5} filter="url(#gM)" /><path d={d} stroke="#fff" strokeWidth={w} fill="none" /></g>;
};

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
const PROFILE = 'M10,-232 C78,-228 120,-190 128,-136 C131,-118 130,-108 136,-98 C142,-86 146,-76 152,-62 C162,-40 172,-28 176,-18 C178,-10 170,-4 158,-4 C152,-4 152,2 158,8 C164,14 160,20 152,22 C158,26 158,34 150,40 C144,44 144,52 148,60 C152,78 140,96 114,100 C90,104 70,112 60,132 C54,170 56,220 66,280 C94,322 194,350 284,384 C334,410 356,480 364,640 L-384,640 C-376,480 -344,400 -264,370 C-174,340 -114,320 -100,280 C-88,220 -84,140 -96,80 C-134,40 -172,-20 -169,-90 C-164,-180 -80,-236 10,-232 Z';
const ProfileFace: React.FC<{T: number; v: Voice; draw: number; open: number; look?: number; tears?: number}> = ({T, v, draw, open, look = 0, tears = 0}) => (
	<g>
		<path d={PROFILE} fill="url(#skinG)" opacity={draw} />
		<Neon d={PROFILE} v={v} draw={draw} w={3.2} L={3400} />
		<g opacity={draw}>
			<path d="M-30,-96 C-56,-100 -62,-58 -42,-40 C-36,-36 -30,-40 -32,-50" stroke={v.hot} strokeWidth={2.4} fill="none" />
			<path d="M80,-128 C98,-138 120,-136 134,-124" stroke={v.hot} strokeWidth={4} strokeLinecap="round" fill="none" />
			<path d="M154,8 C160,13 158,18 150,22 C156,26 156,34 150,40" fill="none" stroke={v.col} strokeWidth={5} />
		</g>
		{/* profile eye: almond with lash flick; iris looks forward (look>0) or back over the shoulder (look<0) */}
		<g transform="translate(108,-96)">
			<clipPath id={`pe${v.n}`}><path d="M-22,0 C-10,-12 10,-12 24,-2 C14,8 -8,8 -22,0 Z" /></clipPath>
			{open > 0.05 && <g opacity={open}><path d="M-22,0 C-10,-12 10,-12 24,-2 C14,8 -8,8 -22,0 Z" fill="#eef0ff" /><g clipPath={`url(#pe${v.n})`}><circle cx={8 + look * 10} cy={-2} r={8} fill={v.col} /><circle cx={8 + look * 10} cy={-2} r={3.5} fill="#05040a" /></g><ellipse rx={50} ry={22} fill={v.col} opacity={0.4} filter="url(#gM)" /></g>}
			<path d={open > 0.05 ? 'M-22,0 C-10,-12 10,-12 24,-2 L32,-10' : 'M-22,2 C-8,8 10,8 24,0'} stroke={v.hot} strokeWidth={3.6} fill="none" strokeLinecap="round" opacity={draw} />
			{open <= 0.05 && [-12, -2, 8, 18].map((lx) => <line key={lx} x1={lx} y1={6} x2={lx - 3} y2={15} stroke={v.hot} strokeWidth={1.6} opacity={draw} />)}
		</g>
		{tears > 0 && (() => { const ph = (T * 0.55) % 1; return <g opacity={tears}><path d={`M118,-86 C122,-50 128,-10 126,${10 + ph * 80}`} stroke={v.hot} strokeWidth={2.4} fill="none" /><path d={`M126,${14 + ph * 80} c6,10 9,15 0,21 c-9,-6 -6,-11 0,-21 Z`} fill={v.hot} /></g>; })()}
	</g>
);

/** a tapered, slightly curled finger (for hands) */
const fing = (bx: number, by: number, tx: number, ty: number, w: number, curl: number) => { const mx = (bx + tx) / 2 + curl, my = (by + ty) / 2; const dx = tx - bx, dy = ty - by, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L; const w0 = w / 2, w1 = w * 0.42; return `M${bx + nx * w0},${by + ny * w0} Q${mx + nx * w0},${my + ny * w0} ${tx + nx * w1},${ty + ny * w1} A${w1},${w1} 0 0,0 ${tx - nx * w1},${ty - ny * w1} Q${mx - nx * w0},${my - ny * w0} ${bx - nx * w0},${by - ny * w0} Z`; };

// ---------------------------------------------------------------- the seven figures
type FigProps = {T: number; v: Voice; draw: number; open: number; orn: (i: number) => number; t: number};

const FigXi: React.FC<FigProps> = ({T, v, draw, open, orn}) => {
	const bob = 6 * Math.sin(T * Math.PI * 2 / (BEAT * 2));
	return <g transform={`translate(0,${bob}) rotate(${-4 + 2 * Math.sin(T * 1.3)})`}>
		{/* twin buns and fluttering ribbons */}
		{[1, -1].map((s) => <g key={s} opacity={orn(0)}>
			{Array.from({length: 3}, (_, k) => { const w = Math.sin(T * 3 + k + s) * 30; return <path key={k} d={`M${s * 130},-200 C${s * (200 + k * 30)},${-260 + w} ${s * (260 + k * 40)},${-140 - w} ${s * (330 + k * 30)},${-80 + w * 1.4}`} stroke={k === 1 ? '#ff6a4a' : v.col} strokeWidth={10 - k * 2} fill="none" opacity={0.85} />; })}
			<circle cx={s * 110} cy={-200} r={70} fill="#0d0a10" />
			<Neon d={`M${s * 110 - 70},-200 A70,70 0 1,1 ${s * 110 + 70},-200 A70,70 0 1,1 ${s * 110 - 70},-200`} v={v} draw={draw} w={2.6} />
			{[0, 1, 2].map((k) => <path key={k} d={`M${s * 60},${-230 + k * 22} C${s * 100},${-262 + k * 18} ${s * 140},${-250 + k * 14} ${s * 172},${-210 + k * 10}`} stroke={v.hot} strokeWidth={1.4} fill="none" opacity={0.6 * draw} />)}
			{/* a flower pin in each bun */}
			<g transform={`translate(${s * 150},-240) rotate(${T * 40 * s})`}>{Array.from({length: 5}, (_, p) => <ellipse key={p} cx={0} cy={-10} rx={6} ry={12} transform={`rotate(${p * 72})`} fill="#ff6a4a" opacity={0.85} />)}<circle r={5} fill={GOLD} /></g>
		</g>)}
		{/* hair cap with bangs */}
		<path d="M-122,-60 C-130,-150 -70,-196 0,-196 C70,-196 130,-150 122,-60 C100,-110 60,-120 30,-112 C20,-100 6,-90 -6,-100 C-30,-120 -80,-120 -122,-60 Z" fill="#0f0b12" opacity={draw} />
		<Neon d="M-122,-60 C-130,-150 -70,-196 0,-196 C70,-196 130,-150 122,-60 C100,-110 60,-120 30,-112 C20,-100 6,-90 -6,-100 C-30,-120 -80,-120 -122,-60" v={v} draw={draw} w={2.4} />
		<FrontFace T={T} v={v} draw={draw} open={open} eye="happy" brow="arch" mouth="grin" />
		{/* blush */}
		{[1, -1].map((s) => <ellipse key={s} cx={s * 70} cy={30} rx={26} ry={12} fill="#ff6a4a" opacity={0.35 * open} filter="url(#gS)" />)}
		{/* crossed collar with gold trim */}
		<g opacity={orn(1)}><path d="M-200,300 L0,460 L200,300" stroke="url(#goldG)" strokeWidth={8} fill="none" /><path d="M-160,290 L20,430" stroke={v.col} strokeWidth={3} fill="none" /></g>
	</g>;
};

const FigNu: React.FC<FigProps> = ({T, v, draw, open, orn}) => (
	<g>
		{/* hair turned to flame, roaring upward */}
		<g opacity={orn(0)}>
			{Array.from({length: 13}, (_, i) => { const x = lerp(-150, 150, i / 12), h = 180 + 140 * (1 - Math.abs(i - 6) / 6) + 40 * Math.sin(T * 7 + i * 1.3), w = 40 + 10 * Math.sin(T * 5 + i); const by = -120 - 40 * (1 - Math.abs(i - 6) / 6); return <path key={i} d={`M${x - w},${by} C${x - w},${by - h * 0.5} ${x + 10 * Math.sin(T * 6 + i)},${by - h * 0.7} ${x + 6 * Math.sin(T * 9 + i)},${by - h} C${x + w * 0.4},${by - h * 0.6} ${x + w},${by - h * 0.4} ${x + w},${by} Z`} fill="url(#flameG)" opacity={0.85} />; })}
			{Array.from({length: 13}, (_, i) => { const x = lerp(-150, 150, i / 12), h = 120 + 90 * (1 - Math.abs(i - 6) / 6) + 30 * Math.sin(T * 8 + i); const by = -120 - 40 * (1 - Math.abs(i - 6) / 6); return <path key={'c' + i} d={`M${x - 16},${by} C${x - 14},${by - h * 0.6} ${x},${by - h * 0.8} ${x},${by - h} C${x + 6},${by - h * 0.6} ${x + 16},${by - h * 0.4} ${x + 16},${by} Z`} fill="#fff1c4" opacity={0.8} />; })}
		</g>
		<path d="M-124,-40 C-134,-150 -70,-200 0,-200 C70,-200 134,-150 124,-40 C112,-100 70,-130 0,-128 C-70,-130 -112,-100 -124,-40 Z" fill="#120806" opacity={draw} />
		<Neon d="M-124,-40 C-134,-150 -70,-200 0,-200 C70,-200 134,-150 124,-40" v={v} draw={draw} w={2.4} />
		{/* armored shoulders with spikes */}
		<g opacity={orn(1)}>{[1, -1].map((s) => <g key={s}>
			<path d={`M${s * 120},300 C${s * 200},250 ${s * 330},260 ${s * 400},340 C${s * 330},330 ${s * 220},340 ${s * 140},360 Z`} fill="#140806" stroke={v.hot} strokeWidth={2.6} />
			{[0, 1, 2].map((k) => <path key={k} d={`M${s * (220 + k * 60)},${276 + k * 10} L${s * (250 + k * 70)},${190 + k * 18} L${s * (262 + k * 60)},${292 + k * 10} Z`} fill={v.col} opacity={0.85} />)}
		</g>)}</g>
		<FrontFace T={T} v={v} draw={draw} open={open} eye="angry" brow="angry" mouth="set" />
		{/* lava cracks on the cheek */}
		<g opacity={orn(2)}><path d="M70,40 L96,60 L84,90 L110,118" stroke="#ff9a3a" strokeWidth={3} fill="none" filter="url(#gS)" /><path d="M70,40 L96,60 L84,90 L110,118" stroke="#fff1c4" strokeWidth={1.2} fill="none" /></g>
		{/* a jewel on the brow */}
		<g opacity={orn(1)}><path d="M0,-96 L10,-80 L0,-64 L-10,-80 Z" fill={v.col} stroke="#fff1c4" strokeWidth={1.4} /></g>
	</g>
);

const FigAi: React.FC<FigProps> = ({T, v, draw, open, orn}) => (
	<g transform="rotate(16)">
		{/* a sheer veil falling over the head and down the back */}
		<g opacity={orn(0)}>
			<path d="M140,-180 C60,-250 -110,-250 -180,-140 C-250,-20 -240,200 -300,420 L-120,420 C-130,240 -150,40 -120,-60 C-90,-150 20,-200 140,-180 Z" fill={v.col} opacity={0.12} />
			{Array.from({length: 9}, (_, i) => <path key={i} d={`M${120 - i * 30},${-190 + i * 6} C${20 - i * 30},${-230 + i * 4} ${-150 - i * 10},${-120 + i * 10} ${-170 - i * 16 + 10 * Math.sin(T * 1.2 + i)},${420}`} stroke={v.hot} strokeWidth={1.2} fill="none" opacity={0.45 * draw} />)}
		</g>
		{/* long straight hair falling */}
		<path d="M124,-160 C112,-214 62,-252 -6,-252 C-110,-252 -190,-180 -194,-80 C-198,40 -200,200 -220,420 L-120,420 C-120,250 -110,60 -96,-40 C-80,-120 30,-170 124,-160 Z" fill="#0a0d18" opacity={draw} />
		<Neon d="M124,-160 C112,-214 62,-252 -6,-252 C-110,-252 -190,-180 -194,-80 C-198,40 -200,200 -220,420" v={v} draw={draw} w={2.4} />
		{Array.from({length: 7}, (_, i) => <path key={i} d={`M${60 - i * 22},${-200 + i * 4} C${-60 - i * 14},${-180 + i * 8} ${-140 - i * 6},${-40} ${-150 - i * 8},${420}`} stroke={v.hot} strokeWidth={1.2} fill="none" opacity={0.5 * draw} />)}
		<ProfileFace T={T} v={v} draw={draw} open={0} tears={open} />
	</g>
);

const FigJu: React.FC<FigProps> = ({T, v, draw, open, orn, t}) => {
	const tr = 1.6 * Math.sin(T * 37) * Math.sin(T * 6.3);
	const spikes = Array.from({length: 23}, (_, i) => { const a = lerp(-172, -8, i / 22) * Math.PI / 180, r0 = 160, r1 = 200 + 60 * rnd(i, 2) + 30 * Math.sin(i * 1.7); return [Math.cos(a) * r0, Math.sin(a) * r0 - 14, Math.cos(a + 0.03 * Math.sin(T * 9 + i)) * r1, Math.sin(a) * r1 - 14] as const; });
	const hair = 'M-122,-30 ' + spikes.map(([x0, y0, x1, y1], i) => `L${x1.toFixed(1)},${y1.toFixed(1)} L${(spikes[i + 1] ? (x0 + spikes[i + 1][0]) / 2 : 122).toFixed(1)},${(spikes[i + 1] ? (y0 + spikes[i + 1][1]) / 2 : -30).toFixed(1)}`).join(' ') + ' Z';
	const hands = orn(0);
	const fingers = (s: 1 | -1) => [0, 1, 2, 3].map((i) => fing(s * (14 + i * 27), 150 + i * 6, s * (6 + i * 30) + tr, [18, 4, 10, 30][i] + tr, 28 - i * 1.5, s * (6 - i * 2)));
	return <g>
		<path d={hair} fill="#081018" opacity={draw} />
		<Neon d={hair} v={v} draw={draw} w={2.2} />
		<FrontFace T={T} v={v} draw={draw} open={open} eye="wide" brow="up" mouth="closed" hideMouth look={0.15 * Math.sin(T * 3)} />
		<path d={`M-98,${-70 + ((T * 30) % 80)} c6,10 10,16 0,22 c-10,-6 -6,-12 0,-22 Z`} fill={v.hot} opacity={0.9 * open} />
		<g opacity={hands} transform={`translate(0,${120 * (1 - out3(hands))})`}>
			{[1, -1].map((s) => <g key={s}>
				<path d={`M${s * 4},146 C${s * 2},200 ${s * 20},250 ${s * 60},290 L${s * 120},420 L${s * 230},420 C${s * 200},330 ${s * 150},230 ${s * 130},170 C${s * 100},150 ${s * 40},140 ${s * 4},146 Z`} fill="#0b1018" stroke={v.hot} strokeWidth={2.6} />
				<path d={fing(s * 128, 200, s * 116 + tr, 70, 30, s * 22)} fill="#0b1018" stroke={v.hot} strokeWidth={2.6} />
				{fingers(s as 1 | -1).slice().reverse().map((d, i) => <path key={i} d={d} fill="#0b1018" stroke={v.hot} strokeWidth={2.6} />)}
				{[0, 1, 2, 3].map((i) => <path key={'k' + i} d={`M${s * (8 + i * 28) - 9},${92 + i * 3} q9,-5 18,0`} stroke={v.hot} strokeWidth={1.4} fill="none" opacity={0.6} />)}
			</g>)}
		</g>
	</g>;
};

const FigLove: React.FC<FigProps> = ({T, v, draw, open, orn, t}) => {
	const wind = orn(0);
	const strands = Array.from({length: 22}, (_, i) => {
		const k = i / 21, y0 = -230 + k * 300, x0 = -150 - 40 * Math.sin(k * 3);
		const ln = (300 + 260 * rnd(i, 31)) * (0.4 + 0.6 * wind), ph = T * 2.4 - i * 0.35;
		const w1 = Math.sin(ph) * 70 * wind, w2 = Math.sin(ph + 1.7) * 90 * wind, drop = 40 + 160 * k;
		return `M${x0 + 110},${y0} C${x0 - ln * 0.25},${y0 - 30 + w1} ${x0 - ln * 0.6},${y0 + drop * 0.5 - w2} ${x0 - ln},${y0 + drop + w1}`;
	});
	return <g>
		<path d="M124,-160 C112,-214 62,-252 -6,-252 C-110,-252 -190,-180 -194,-80 C-196,-20 -180,40 -150,80 C-150,20 -120,-60 -80,-110 C-40,-160 40,-180 124,-160 Z" fill="#14081a" opacity={draw} />
		{strands.map((d, i) => <g key={i}>
			{i % 3 === 0 && <path d={d} stroke={v.col} strokeWidth={9} fill="none" opacity={0.35 * draw} filter="url(#gM)" />}
			<path d={d} stroke={i % 3 === 0 ? v.col : v.hot} strokeWidth={i % 3 === 0 ? 3 : 1.3 + rnd(i, 3)} fill="none" opacity={(i % 3 === 0 ? 1 : 0.6) * draw} />
		</g>)}
		<ProfileFace T={T} v={v} draw={draw} open={open} />
		<Neon d="M124,-160 C112,-214 62,-252 -6,-252 C-110,-252 -190,-180 -194,-80 C-196,-20 -180,40 -150,80" v={v} draw={draw} w={2.6} />
		<g opacity={orn(1)} transform="translate(-70,-200) rotate(-30)"><line x1={0} y1={0} x2={120} y2={0} stroke="url(#goldG)" strokeWidth={5} /><circle cx={0} cy={0} r={9} fill={v.col} /><line x1={6} y1={0} x2={6 + 8 * Math.sin(T * 2)} y2={60} stroke={GOLD} strokeWidth={1.4} /><circle cx={6 + 8 * Math.sin(T * 2)} cy={64} r={5} fill={v.col} /></g>
		<g transform="translate(90,360)" opacity={orn(2)}>
			<circle r={90} fill="url(#hotG)" opacity={0.55 + 0.45 * Math.sin(T * Math.PI * 2 / BEAT / 2) ** 2} />
			<path d="M0,26 C-40,0 -40,-36 -14,-36 C-4,-36 0,-26 0,-20 C0,-26 4,-36 14,-36 C40,-36 40,0 0,26 Z" fill={v.col} />
		</g>
	</g>;
};

const FigWu: React.FC<FigProps> = ({T, v, draw, open, orn}) => (
	<g>
		{/* tall bun with sharp hairpins */}
		<g opacity={draw}>
			<path d="M-60,-220 C-80,-300 20,-330 40,-260 C50,-230 20,-210 -10,-212 Z" fill="#0b120a" />
			<Neon d="M-60,-220 C-80,-300 20,-330 40,-260 C50,-230 20,-210 -10,-212" v={v} draw={draw} w={2.4} />
		</g>
		<g opacity={orn(0)}>{[0, 1, 2].map((k) => <g key={k} transform={`translate(-10,-270) rotate(${-60 + k * 28})`}><line x1={-20} y1={0} x2={170} y2={0} stroke="url(#goldG)" strokeWidth={4} /><path d="M170,0 L190,-6 L190,6 Z" fill={v.col} /></g>)}</g>
		<path d="M124,-160 C112,-214 62,-252 -6,-252 C-110,-252 -190,-180 -194,-80 C-196,-20 -180,40 -150,80 C-150,20 -120,-60 -80,-110 C-40,-160 40,-180 124,-160 Z" fill="#0b120a" opacity={draw} />
		<Neon d="M124,-160 C112,-214 62,-252 -6,-252 C-110,-252 -190,-180 -194,-80 C-196,-20 -180,40 -150,80" v={v} draw={draw} w={2.4} />
		<ProfileFace T={T} v={v} draw={draw} open={open} look={-1} />
		{/* the folding fan raised to cover the nose and mouth */}
		<g opacity={orn(1)} transform={`translate(196,92) rotate(${-8 + 2 * Math.sin(T * 1.5)}) scale(0.5)`}>
			{Array.from({length: 13}, (_, i) => { const a = lerp(-160, -20, i / 12) * Math.PI / 180; return <line key={i} x1={0} y1={0} x2={Math.cos(a) * 220} y2={Math.sin(a) * 220} stroke={v.hot} strokeWidth={1.2} opacity={0.6} />; })}
			<path d={`M${Math.cos(-160 * Math.PI / 180) * 220},${Math.sin(-160 * Math.PI / 180) * 220} A220,220 0 0,1 ${Math.cos(-20 * Math.PI / 180) * 220},${Math.sin(-20 * Math.PI / 180) * 220} L${Math.cos(-20 * Math.PI / 180) * 70},${Math.sin(-20 * Math.PI / 180) * 70} A70,70 0 0,0 ${Math.cos(-160 * Math.PI / 180) * 70},${Math.sin(-160 * Math.PI / 180) * 70} Z`} fill="#0a1408" stroke={v.col} strokeWidth={3} />
			{/* thorn motif painted on the fan */}
			<path d="M-150,-100 C-90,-150 -20,-170 60,-150 C100,-140 140,-110 170,-70" stroke={v.col} strokeWidth={2.4} fill="none" />
			{Array.from({length: 6}, (_, k) => { const x = -120 + k * 52, y = -130 - 20 * Math.sin(k); return <path key={k} d={`M${x},${y} l8,-16 l6,14 Z`} fill={v.col} />; })}
			<circle r={8} fill="url(#goldG)" />
		</g>
	</g>
);

const FigYu: React.FC<FigProps> = ({T, v, draw, open, orn}) => (
	<g>
		{/* peacock crown: a fan of eye-feathers */}
		<g opacity={orn(0)} transform={`scale(${lerp(0.6, 1, outBack(orn(0)))})`}>
			{Array.from({length: 15}, (_, i) => { const a = lerp(-165, -15, i / 14) * Math.PI / 180, L = 330 + 40 * Math.sin(i * 1.3), ex = Math.cos(a) * L, ey = Math.sin(a) * L - 120; return <g key={i}>
				<line x1={0} y1={-120} x2={ex} y2={ey} stroke={v.hot} strokeWidth={1.2} opacity={0.6} />
				<ellipse cx={ex} cy={ey} rx={22} ry={30} transform={`rotate(${a * 180 / Math.PI + 90},${ex},${ey})`} fill="#1a0a2c" stroke={v.col} strokeWidth={2.4} />
				<ellipse cx={ex} cy={ey} rx={10} ry={14} transform={`rotate(${a * 180 / Math.PI + 90},${ex},${ey})`} fill="#3ad0c0" opacity={0.85} />
				<circle cx={ex} cy={ey} r={5} fill={GOLD} opacity={0.6 + 0.4 * Math.sin(T * 4 + i)} />
			</g>; })}
		</g>
		<path d="M-124,-40 C-134,-150 -70,-200 0,-200 C70,-200 134,-150 124,-40 C112,40 140,160 170,260 L110,260 C96,160 100,60 96,-30 C70,-110 -70,-110 -96,-30 C-100,60 -96,160 -110,260 L-170,260 C-140,160 -112,40 -124,-40 Z" fill="#120a1c" opacity={draw} />
		<Neon d="M-124,-40 C-134,-150 -70,-200 0,-200 C70,-200 134,-150 124,-40 C112,40 140,160 170,260 M-124,-40 C-112,40 -140,160 -170,260" v={v} draw={draw} w={2.4} />
		<FrontFace T={T} v={v} draw={draw} open={open} eye="lidded" brow="calm" mouth="part" look={0.2} />
		{/* coin earrings */}
		<g opacity={orn(1)}>{[1, -1].map((s) => <g key={s} transform={`translate(${s * 130},${30 + 6 * Math.sin(T * 2 + s)})`}><line x1={0} y1={-30} x2={0} y2={0} stroke={GOLD} strokeWidth={1.4} /><circle r={16} fill="url(#goldG)" /><rect x={-5} y={-5} width={10} height={10} fill="#1a0a2c" /></g>)}</g>
		{/* off-shoulder neckline with a jewelled chain */}
		<g opacity={orn(2)}>{Array.from({length: 13}, (_, i) => { const u = i / 12, x = lerp(-260, 260, u), y = 330 + 90 * Math.sin(Math.PI * u); return <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 8 : 4} fill={i % 3 === 0 ? v.col : GOLD} />; })}</g>
	</g>
);

/** 欲's reaching hand, in the foreground */
const ReachHand: React.FC<{T: number; v: Voice; u: number}> = ({T, v, u}) => {
	if (u <= 0) return null;
	const k = out3(u), x = lerp(2000, 1760, k), y = lerp(1250, 1010, k);
	return <g transform={`translate(${x},${y}) rotate(28) scale(1.1)`} opacity={cl01(u * 2)}>
		<path d="M-60,40 C-70,-20 -40,-60 10,-60 C60,-60 80,-20 70,40 L60,200 L-50,200 Z" fill="#0f0818" stroke={v.hot} strokeWidth={2.6} />
		{[0, 1, 2, 3].map((i) => <path key={i} d={fing(-40 + i * 30, -50, -50 + i * 34 + 4 * Math.sin(T * 2 + i), -170 - (i === 1 || i === 2 ? 30 : 0), 26, 8)} fill="#0f0818" stroke={v.hot} strokeWidth={2.6} />)}
		<path d={fing(60, 10, 120, -70, 30, -10)} fill="#0f0818" stroke={v.hot} strokeWidth={2.6} />
		<circle cx={-20} cy={-200} r={60} fill="url(#hotG)" opacity={0.25 + 0.15 * Math.sin(T * 3)} />
	</g>;
};

// ---------------------------------------------------------------- halos (all 璧-like, themed)
const Halo: React.FC<{T: number; v: Voice; s: number; t: number; rv: number; lit: number}> = ({T, v, s, t, rv, lit}) => {
	const r0 = 250, r1 = 340, crack = v.kind === 'ju' || v.kind === 'nu' ? cl01((t - rv) / 1.2) : 0;
	if (v.kind === 'ai') return <g transform={`scale(${s})`}>
		{/* a pale moon instead of the disc */}
		<circle r={560} fill="url(#auraG)" />
		<circle r={340} fill={v.hot} opacity={0.18} />
		<circle r={340} fill="none" stroke={v.hot} strokeWidth={3} opacity={0.8} />
		{[[-80, -60, 50], [90, 40, 36], [20, 140, 28], [-120, 120, 22]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={v.col} opacity={0.12} />)}
	</g>;
	if (v.kind === 'yu') return <g transform={`scale(${s}) rotate(${T * 6})`}>
		{/* a great square-holed coin */}
		<circle r={560} fill="url(#auraG)" />
		<circle r={r1} fill="url(#goldG)" opacity={0.35} />
		<circle r={r1} fill="none" stroke="url(#goldG)" strokeWidth={10} />
		<circle r={r1 - 26} fill="none" stroke={GOLD} strokeWidth={2} />
		<rect x={-150} y={-150} width={300} height={300} fill="#0a0612" stroke="url(#goldG)" strokeWidth={8} />
		{['七', '情', '之', '欲'].map((c, i) => <text key={c} transform={`rotate(${i * 90}) translate(0,${-r1 + 64})`} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 56}} fill="#fff2c8" opacity={0.8}>{c}</text>)}
	</g>;
	return <g transform={`scale(${s})`}>
		<circle r={560} fill="url(#auraG)" />
		{v.kind === 'xi' && <g transform={`rotate(${T * 10})`} opacity={0.5 + 0.5 * lit}>{Array.from({length: 24}, (_, i) => <path key={i} transform={`rotate(${i * 15})`} d={`M-10,-${r1 + 10} L0,-${r1 + 120 + 40 * Math.sin(T * 3 + i)} L10,-${r1 + 10} Z`} fill={v.col} opacity={0.6} />)}</g>}
		<path d={`M0,${-r1} A${r1},${r1} 0 1,1 -0.1,${-r1} Z M0,${-r0} A${r0},${r0} 0 1,0 0.1,${-r0} Z`} fill="url(#jadeG)" fillRule="evenodd" />
		<circle r={r1} fill="none" stroke={v.hot} strokeWidth={3} />
		<circle r={r0} fill="none" stroke={v.hot} strokeWidth={3} />
		<circle r={r1 + 14} fill="none" stroke="url(#goldG)" strokeWidth={2} opacity={0.7} />
		<g transform={`rotate(${T * 5})`}>{Array.from({length: 3}, (_, ring) => Array.from({length: 42 + ring * 6}, (_, i) => { const rr = r0 + 22 + ring * 24, a = (i / (42 + ring * 6)) * Math.PI * 2; return <circle key={ring + '-' + i} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr} r={4} fill="none" stroke={v.hot} strokeWidth={1.2} opacity={0.5} />; }))}</g>
		{crack > 0 && <g>
			{Array.from({length: 9}, (_, i) => { const a0 = rnd(i, 3) * Math.PI * 2; const pts = Array.from({length: 6}, (_, k) => { const rr = lerp(r0 - 10, r1 + 30, k / 5), a = a0 + (rnd(i * 7 + k, 4) - 0.5) * 0.25; return [Math.cos(a) * rr, Math.sin(a) * rr]; }); const len = 200; return <path key={i} d={'M' + pts.map((p) => p.join(',')).join(' L')} stroke={v.kind === 'nu' ? '#ffb070' : '#fff'} strokeWidth={2.6} fill="none" strokeDasharray={len} strokeDashoffset={len * (1 - out3(crack * 1.5 - i * 0.05))} />; })}
			{Array.from({length: 14}, (_, i) => { const a = rnd(i, 5) * Math.PI * 2, d = r1 + 20 + 380 * out3(crack) * (0.4 + rnd(i, 6)), sz = 10 + 22 * rnd(i, 7); return <path key={'s' + i} transform={`translate(${Math.cos(a) * d},${Math.sin(a) * d}) rotate(${T * 90 * (rnd(i, 8) - 0.5) + i * 40})`} d={`M0,${-sz} L${sz * 0.6},${sz * 0.3} L${-sz * 0.4},${sz * 0.7} Z`} fill={v.col} opacity={0.45} stroke={v.hot} strokeWidth={1.4} />; })}
		</g>}
		{v.kind === 'love' && Array.from({length: 5}, (_, i) => { const rr = r0 + 14 + i * 18, len = 2 * Math.PI * rr; return <circle key={i} r={rr} fill="none" stroke={v.col} strokeWidth={3} strokeDasharray={len} strokeDashoffset={len * (1 - cl01(lit * 1.4 - i * 0.12))} transform={`rotate(${-90 + i * 50 + T * 10})`} opacity={0.9} />; })}
		{v.kind === 'wu' && Array.from({length: 4}, (_, i) => { const len = 1400; const d = `M${Math.cos(i * 1.6) * r1},${Math.sin(i * 1.6) * r1} ` + Array.from({length: 10}, (_, k) => { const a = i * 1.6 + k * 0.32, rr = r1 + 14 * Math.sin(k * 2.1); return `L${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`; }).join(' '); return <path key={i} d={d} stroke={v.col} strokeWidth={4} fill="none" strokeDasharray={len} strokeDashoffset={len * (1 - cl01(lit * 1.3 - i * 0.1))} />; })}
	</g>;
};

// ---------------------------------------------------------------- worlds behind the figure
const Worlds: React.FC<{T: number; v: Voice; u: number; cx: number; cy: number}> = ({T, v, u, cx, cy}) => {
	if (u <= 0) return null;
	switch (v.kind) {
		case 'xi': return <g>{Array.from({length: 6}, (_, k) => {
			const per = BEAT * 2, ph = ((T - k * per / 3) % per) / per, bx = 900 + rnd(k, 61) * 1000, by = 120 + rnd(k, 62) * 520;
			return <g key={k} opacity={u * (1 - ph)}>{Array.from({length: 16}, (_, i) => { const a = i / 16 * Math.PI * 2, r = 30 + 150 * out3(ph); return <line key={i} x1={bx + Math.cos(a) * r * 0.6} y1={by + Math.sin(a) * r * 0.6} x2={bx + Math.cos(a) * r} y2={by + Math.sin(a) * r + 30 * ph * ph} stroke={k % 2 ? v.col : '#ff6a4a'} strokeWidth={3} strokeLinecap="round" />; })}</g>;
		})}</g>;
		case 'nu': return <g opacity={u}>
			{Array.from({length: 16}, (_, i) => { const x = 820 + i * 72, h = 160 + 120 * rnd(i, 71) + 60 * Math.sin(T * 6 + i), w = 50; return <path key={i} d={`M${x - w},1090 C${x - w},${1090 - h * 0.6} ${x + 12 * Math.sin(T * 7 + i)},${1090 - h * 0.8} ${x},${1090 - h} C${x + w * 0.4},${1090 - h * 0.6} ${x + w},${1090 - h * 0.4} ${x + w},1090 Z`} fill="url(#flameG)" opacity={0.55} />; })}
			{Array.from({length: 6}, (_, i) => { const pts: P[] = [[860 + i * 180, 1080]]; for (let k = 1; k < 7; k++) pts.push([pts[k - 1][0] + (rnd(i * 9 + k, 72) - 0.5) * 90, pts[k - 1][1] - 70]); const d = 'M' + pts.map((p) => p.join(',')).join(' L'); return <g key={'c' + i}><path d={d} stroke="#ff7a2a" strokeWidth={8} fill="none" opacity={0.5} filter="url(#gM)" /><path d={d} stroke="#fff1c4" strokeWidth={2} fill="none" /></g>; })}
		</g>;
		case 'ai': return <g opacity={u}>
			{Array.from({length: 90}, (_, i) => { const sp = 1.4 + rnd(i, 81), ph = (T * sp + rnd(i, 82)) % 1, x = 760 + rnd(i, 83) * 1200 - ph * 90, y = -60 + ph * 1200; return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 46} stroke={v.hot} strokeWidth={1.4} opacity={0.45} />; })}
			{Array.from({length: 5}, (_, i) => { const ph = ((T * 0.7 + i / 5) % 1); return <ellipse key={'r' + i} cx={1000 + rnd(i, 84) * 800} cy={1020} rx={20 + 160 * ph} ry={(20 + 160 * ph) * 0.18} fill="none" stroke={v.hot} strokeWidth={1.6} opacity={0.6 * (1 - ph)} />; })}
		</g>;
		case 'ju': return <g>
			{Array.from({length: 22}, (_, i) => {
				const x = 860 + rnd(i, 11) * 1040, y = 60 + rnd(i, 12) * 960;
				if (Math.hypot(x - cx, y - cy) < 380) return null;
				const open = out3((u - i * 0.035) * 3) * (Math.sin(T * 0.9 + i * 3.3) > 0.985 ? 0.1 : 1), s = 0.6 + 0.9 * rnd(i, 13), ang = Math.atan2(cy - y, cx - x);
				if (open <= 0.01) return null;
				return <g key={i} transform={`translate(${x},${y}) scale(${s})`} opacity={0.85}>
					<path d={`M-40,0 Q0,${-26 * open} 40,0 Q0,${26 * open} -40,0 Z`} fill="#02080b" stroke={v.col} strokeWidth={2.4} />
					<circle cx={Math.cos(ang) * 10 * open} cy={Math.sin(ang) * 6 * open} r={10 * open} fill={v.hot} />
					<circle cx={Math.cos(ang) * 10 * open} cy={Math.sin(ang) * 6 * open} r={4 * open} fill="#000" />
				</g>;
			})}
			{Array.from({length: 7}, (_, i) => { const a = lerp(150, 330, rnd(i, 21)) * Math.PI / 180; const pts: P[] = [[cx + Math.cos(a) * 330, cy + Math.sin(a) * 330]]; for (let k = 1; k < 9; k++) { const p = pts[k - 1], aa = a + (rnd(i * 9 + k, 22) - 0.5) * 0.9; pts.push([p[0] + Math.cos(aa) * 70, p[1] + Math.sin(aa) * 70]); } const d = 'M' + pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' L'), len = 700; return <g key={'k' + i}><path d={d} stroke={v.col} strokeWidth={8} fill="none" opacity={0.35} filter="url(#gM)" strokeDasharray={len} strokeDashoffset={len * (1 - out3(u * 1.3 - i * 0.06))} /><path d={d} stroke={v.hot} strokeWidth={2} fill="none" strokeDasharray={len} strokeDashoffset={len * (1 - out3(u * 1.3 - i * 0.06))} /></g>; })}
		</g>;
		case 'love': return <g>
			<g transform={`translate(${cx + 40},${cy - 40}) rotate(${T * 4}) scale(${outBack(u)})`} opacity={cl01(u * 2)}>
				{[[16, 520, 210], [14, 430, 180], [12, 330, 150], [10, 220, 110]].map(([n, r, w], ring) => Array.from({length: n}, (_, i) => <path key={ring + '-' + i} transform={`rotate(${(i / n) * 360 + ring * 13})`} d={`M0,0 C${-w * 0.6},${-r * 0.35} ${-w},${-r * 0.8} ${-w * 0.35},${-r} C${-w * 0.12},${-r * 1.06} ${w * 0.12},${-r * 0.94} 0,${-r * 0.9} C${w * 0.12},${-r * 0.94} ${w * 0.35},${-r * 1.06} ${w * 0.35},${-r} C${w},${-r * 0.8} ${w * 0.6},${-r * 0.35} 0,0 Z`} fill={v.col} fillOpacity={0.05 + ring * 0.025} stroke={ring % 2 ? v.hot : v.col} strokeWidth={2.2} opacity={0.75} />))}
			</g>
			{[0, 1, 2].map((k) => { const ph = ((T / (BEAT * 2)) + k / 3) % 1; return <circle key={k} cx={cx - 30} cy={cy + 300} r={60 + 700 * ph} fill="none" stroke={v.col} strokeWidth={3 * (1 - ph)} opacity={0.6 * (1 - ph) * u} />; })}
		</g>;
		case 'wu': return <g opacity={u}>
			{Array.from({length: 7}, (_, i) => { const len = 1600, x0 = i < 4 ? 1920 : 820 + i * 60, y0 = i < 4 ? 120 + i * 260 : 1080; const d = `M${x0},${y0} C${x0 - 260},${y0 - 120 + 40 * i} ${x0 - 120},${y0 - 380} ${x0 - 420 + 20 * i},${y0 - 300 - 30 * i}`; return <g key={i}>
				<path d={d} stroke={v.col} strokeWidth={5} fill="none" strokeDasharray={len} strokeDashoffset={len * (1 - out3(u * 1.2 - i * 0.05))} />
				{Array.from({length: 8}, (_, k) => { const tt = (k + 1) / 9; if (tt > u * 1.2 - i * 0.05) return null; const bx = (1 - tt) ** 3 * x0 + 3 * (1 - tt) ** 2 * tt * (x0 - 260) + 3 * (1 - tt) * tt * tt * (x0 - 120) + tt ** 3 * (x0 - 420 + 20 * i), by = (1 - tt) ** 3 * y0 + 3 * (1 - tt) ** 2 * tt * (y0 - 120 + 40 * i) + 3 * (1 - tt) * tt * tt * (y0 - 380) + tt ** 3 * (y0 - 300 - 30 * i); return <path key={k} d={`M${bx},${by} l${k % 2 ? 14 : -14},-18 l${k % 2 ? 4 : -4},20 Z`} fill={v.hot} />; })}
			</g>; })}
			{Array.from({length: 8}, (_, i) => <ellipse key={'m' + i} cx={900 + rnd(i, 91) * 1000 + 40 * Math.sin(T * 0.4 + i)} cy={200 + rnd(i, 92) * 800} rx={180} ry={70} fill={v.col} opacity={0.08} filter="url(#gL)" />)}
		</g>;
		case 'yu': return <g opacity={u}>
			{Array.from({length: 26}, (_, i) => { const ph = (T * (0.25 + 0.15 * rnd(i, 95)) + rnd(i, 96)) % 1, x = 840 + rnd(i, 97) * 1080, y = -60 + ph * 1200; return <g key={i} transform={`translate(${x},${y}) rotate(${T * 120 + i * 30}) scale(${Math.cos(T * 4 + i)},1)`}><circle r={16} fill="url(#goldG)" /><rect x={-5} y={-5} width={10} height={10} fill="#1a0a2c" /></g>; })}
			{Array.from({length: 7}, (_, i) => { const x = 880 + i * 160, lift = 40 * Math.sin(T * 1.6 + i); return <g key={'h' + i} transform={`translate(${x},${1120 - 120 - lift}) rotate(${(i - 3) * 6})`} opacity={0.45}><path d="M-26,140 L-26,10 C-26,-10 26,-10 26,10 L26,140" fill="#120a1c" stroke={v.col} strokeWidth={2} />{[0, 1, 2, 3].map((k) => <path key={k} d={fing(-18 + k * 12, 0, -20 + k * 14, -60 - (k === 1 || k === 2 ? 16 : 0), 11, 3)} fill="#120a1c" stroke={v.col} strokeWidth={1.6} />)}</g>; })}
		</g>;
	}
};

// ---------------------------------------------------------------- orb moments (before the reveal)
const OrbMoment: React.FC<{T: number; v: Voice}> = ({T, v}) => {
	const c = v.hot;
	switch (v.kind) {
		case 'xi': return <g><rect x={-70} y={-130} width={140} height={250} rx={20} fill="none" stroke={c} strokeWidth={4} /><g transform={`translate(0,${-40 - 10 * out3((T % 2) / 0.4)}) scale(${0.9 + 0.1 * Math.sin(T * 6)})`}><rect x={-56} y={-24} width={112} height={44} rx={14} fill={v.col} /><text y={6} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 20}} fill="#2a1c04">在干嘛？</text></g><circle cx={52} cy={-118} r={12} fill="#ff4a3a" /><text x={52} y={-112} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 16}} fill="#fff">1</text></g>;
		case 'nu': return <g>
			{/* a small figure, and three hands pointing at it */}
			<circle cx={0} cy={-30} r={22} fill="none" stroke={c} strokeWidth={4} /><path d="M-36,60 C-36,10 36,10 36,60" fill="none" stroke={c} strokeWidth={4} />
			{[[-170, 0, 0], [170, 0, 180], [0, -170, 90]].map(([x, y, r], k) => <g key={k} transform={`translate(${x},${y}) rotate(${r}) translate(${8 * Math.sin(T * 6 + k)},0)`}>
				<rect x={-40} y={-16} width={44} height={34} rx={10} fill="none" stroke={v.col} strokeWidth={4} />
				<path d="M4,-12 L70,-12 C78,-12 78,0 70,0 L4,0" fill="none" stroke={v.col} strokeWidth={4} />
				<path d="M-40,18 L-60,30" stroke={v.col} strokeWidth={4} />
			</g>)}
		</g>;
		case 'ai': return <g><rect x={-110} y={-80} width={220} height={160} fill="none" stroke={c} strokeWidth={4} />{[-40, 40].map((x) => <g key={x}><circle cx={x} cy={-14} r={18} fill="none" stroke={c} strokeWidth={3} /><path d={`M${x - 30},60 C${x - 30},20 ${x + 30},20 ${x + 30},60`} fill="none" stroke={c} strokeWidth={3} /></g>)}<g transform="translate(110,-80)"><circle r={22} fill={v.col} /><path d="M-9,-9 L9,9 M9,-9 L-9,9" stroke="#fff" strokeWidth={4} /></g></g>;
		case 'ju': return <g><rect x={-70} y={-130} width={140} height={250} rx={20} fill="none" stroke={c} strokeWidth={4} /><rect x={-34} y={-70} width={66} height={30} rx={10} fill="none" stroke={c} strokeWidth={2.4} /><text x={-1} y={-49} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 18, fontWeight: 700}} fill={c}>在吗？</text><rect x={20} y={78} width={38} height={26} rx={9} fill={v.col} opacity={0.5 + 0.5 * Math.sin(T * 5) ** 2} /><g transform={`translate(${62 + 3 * Math.sin(T * 33)},${150 + 3 * Math.sin(T * 29)})`}><path d="M-22,10 C-26,-20 -14,-40 4,-40 C20,-38 26,-16 22,12 C18,40 -18,40 -22,10 Z" fill="#05080c" stroke={c} strokeWidth={3} /></g></g>;
		case 'love': return <g><path d="M-60,-30 L-48,110 C-46,128 46,128 48,110 L60,-30 Z" fill="none" stroke={c} strokeWidth={4} /><ellipse cx={0} cy={-30} rx={60} ry={13} fill="none" stroke={c} strokeWidth={3} /><path d="M60,0 C100,0 100,70 52,70" stroke={c} strokeWidth={4} fill="none" />{[0, 1, 2].map((i) => { const ph = (T * 0.55 + i / 3) % 1; return <path key={i} d={`M${-26 + i * 26},${-50 - ph * 90} c-12,-18 12,-30 0,-48`} stroke={c} strokeWidth={3} fill="none" opacity={Math.sin(Math.PI * ph)} />; })}<path d="M-120,140 C-40,120 60,124 130,150" stroke={v.col} strokeWidth={10} fill="none" /></g>;
		case 'wu': return <g><path d="M-90,-100 C-90,-150 90,-150 90,-100 L90,40 C90,120 -90,120 -90,40 Z" fill="none" stroke={c} strokeWidth={4} />{[-40, 40].map((x) => <path key={x} d={`M${x - 22},-40 Q${x},-60 ${x + 22},-40`} stroke={c} strokeWidth={4} fill="none" />)}<path d="M-50,30 Q0,80 50,30" stroke={c} strokeWidth={5} fill="none" /><line x1={-110} y1={120} x2={110} y2={-140} stroke={v.col} strokeWidth={4} opacity={0.8} /></g>;
		case 'yu': return <g><path d="M-120,-80 L-90,-80 L-60,60 L80,60 L100,-40 L-80,-40" fill="none" stroke={c} strokeWidth={4} />{[-40, 50].map((x) => <circle key={x} cx={x} cy={90} r={14} fill="none" stroke={c} strokeWidth={4} />)}<g transform={`translate(80,-100) scale(${1 + 0.15 * Math.sin(T * 8)})`}><circle r={24} fill={v.col} /><text y={8} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 22}} fill="#fff">+1</text></g></g>;
	}
};

/** particles in each voice's element */
const Particles: React.FC<{T: number; v: Voice; lit: number}> = ({T, v, lit}) => <g>{Array.from({length: 40}, (_, i) => {
	const sp = 0.06 + 0.05 * rnd(i, 1), ph = (T * sp + rnd(i, 2)) % 1, x = 820 + rnd(i, 3) * 1100 + 50 * Math.sin(T * 0.8 + i), o = Math.sin(Math.PI * ph) * (0.3 + 0.7 * lit);
	switch (v.kind) {
		case 'xi': { const y = -30 + ph * 1140; return <rect key={i} x={x} y={y} width={10} height={16} transform={`rotate(${T * 200 + i * 40},${x},${y})`} fill={i % 3 ? v.col : '#ff6a4a'} opacity={0.8 * o} />; }
		case 'nu': { const y = 1100 - ph * 1180; return <circle key={i} cx={x} cy={y} r={2 + 3 * rnd(i, 4)} fill={i % 2 ? '#ffb070' : '#fff1c4'} opacity={o} />; }
		case 'ai': { const y = -30 + ph * 1140; return <path key={i} d={`M${x},${y} c5,8 8,12 0,17 c-8,-5 -5,-9 0,-17 Z`} fill={v.hot} opacity={0.6 * o} />; }
		case 'ju': { const y = -30 + ph * 1140; return <path key={i} transform={`translate(${x},${y}) rotate(${T * 50 + i * 30})`} d="M-7,0 L7,0 M0,-7 L0,7 M-5,-5 L5,5 M-5,5 L5,-5" stroke={v.hot} strokeWidth={1.6} opacity={0.6 * o} />; }
		case 'love': { const y = 1100 - ph * 1180; return <ellipse key={i} cx={x} cy={y} rx={5 + 5 * rnd(i, 5)} ry={10 + 7 * rnd(i, 6)} transform={`rotate(${T * 70 + i * 40},${x},${y})`} fill={v.col} opacity={0.6 * o} />; }
		case 'wu': { const y = 1100 - ph * 1180; return <circle key={i} cx={x} cy={y} r={3 + 5 * rnd(i, 7)} fill={v.col} opacity={0.35 * o} filter="url(#gS)" />; }
		case 'yu': { const y = 1100 - ph * 1180; return <path key={i} transform={`translate(${x},${y}) rotate(45)`} d="M0,-8 L3,0 L0,8 L-3,0 Z" fill={i % 2 ? GOLD : v.col} opacity={o} />; }
	}
})}</g>;

const BlurText: React.FC<{x: number; y: number; text: string; size: number; u: number; out?: number; weight?: number; col?: string; spacing?: string; anchor?: 'start' | 'middle'; id: string}> = ({x, y, text, size, u, out = 0, weight = 900, col = '#fff', spacing = '0.04em', anchor = 'start', id}) => {
	const b = 14 * (1 - out3(u)) + 18 * ease(out), o = cl01(u * 1.6) * (1 - ease(out));
	if (o <= 0.001) return null;
	return <g>
		<filter id={id} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation={`${(b * 2.2).toFixed(2)} ${(b * 0.4).toFixed(2)}`} /></filter>
		<text x={x} y={y} textAnchor={anchor} style={{fontFamily: SERIF, fontWeight: weight, fontSize: size, letterSpacing: spacing}} fill={col} opacity={o * 0.45} filter="url(#gM)">{text}</text>
		<text x={x - 60 * (1 - out3(u))} y={y} textAnchor={anchor} style={{fontFamily: SERIF, fontWeight: weight, fontSize: size, letterSpacing: spacing}} fill={col} opacity={o} filter={b > 0.2 ? `url(#${id})` : undefined}>{text}</text>
	</g>;
};
const Icon: React.FC<{x: number; y: number; ch: string; col: string; o: number; s?: number}> = ({x, y, ch, col, o, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
		<circle r={46} fill={col} opacity={0.15} filter="url(#gM)" />
		<path d="M0,-40 A40,40 0 1,1 -0.1,-40 Z M0,-24 A24,24 0 1,0 0.1,-24 Z" fill={col} fillOpacity={0.2} fillRule="evenodd" stroke={col} strokeWidth={2} />
		<text y={12} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 34}} fill="#fff">{ch}</text>
	</g>
);

// ---------------------------------------------------------------- one voice
const FIG: Record<Kind, React.FC<FigProps>> = {xi: FigXi, nu: FigNu, ai: FigAi, ju: FigJu, love: FigLove, wu: FigWu, yu: FigYu};
const PLACE: Record<Kind, {dx: number; dy: number; s: number; flip?: boolean}> = {
	xi: {dx: 0, dy: 40, s: 1.55}, nu: {dx: 0, dy: 60, s: 1.55}, ai: {dx: 60, dy: 60, s: 1.4, flip: true}, ju: {dx: 0, dy: 0, s: 1.75},
	love: {dx: 30, dy: 0, s: 1.45, flip: true}, wu: {dx: -40, dy: 10, s: 1.45}, yu: {dx: 0, dy: 70, s: 1.5},
};
const VoiceScene: React.FC<{T: number; v: Voice; i: number}> = ({T, v, i}) => {
	const t0 = Q0[i], t = T - t0, rv = BAR, CYC = (i < 6 ? Q0[i + 1] : OUT) - t0;
	const cx = 1400, cy = 500, pl = PLACE[v.kind];
	// beat map inside a voice: line on its own downbeat; reveal on the next downbeat (flash, snap-in);
	// beat 2 the name slams; beat 3 the eyes open with a flare; ornaments pop on half beats; next bar the closing line
	const cap = fade(t, 0.04, 0.3), quote = fade(t, BEAT * 0.5, 0.35), outQ = fade(t, rv - 0.16, 0.14);
	const orb = fade(t, 0, 0.25) * (1 - fade(t, rv - 0.06, 0.1));
	const lit = cl01((t - rv + 0.02) / 0.3), rise = cl01((t - rv + 0.02) / 0.24);
	const open = ease((t - rv - 2 * BEAT) / (v.kind === 'ju' ? 0.07 : 0.18));
	const orn = (k: number) => out3(cl01((t - rv - BEAT * (0.5 + 0.5 * k)) / 0.22));
	const flash = Math.max(0, 1 - Math.abs(t - rv) / 0.13), flare = Math.max(0, 1 - Math.abs(t - rv - 2 * BEAT) / 0.16);
	const sub = fade(t, rv + BEAT - 0.12, 0.2), name = cl01((t - rv - BEAT) / 0.2), say = fade(t, rv + 4 * BEAT, 0.3);
	const leave = fade(t, CYC - 0.22, 0.22);
	const shake = v.kind === 'ju' || v.kind === 'nu' ? (t > rv + 0.6 ? 4 * Math.sin(T * 41) * Math.sin(T * 7.3) * (1 - cl01((t - rv - 0.6) / 2.5)) : 0) : 0;
	const beatPulse = Math.max(0, 1 - (((T % BEAT) + BEAT) % BEAT) / 0.16);
	const push = (1 + 0.06 * ease(t / CYC)) * (1 + 0.014 * beatPulse * lit);
	const sweep = cl01((t - rv - BEAT - 0.2) / 0.45);
	const Fig = FIG[v.kind];
	const bolts: [P, P][] = [[[cx - 340, cy - 120], [880, 140]], [[cx + 300, cy + 200], [1900, 460]], [[cx - 280, cy + 240], [1000, 900]]];
	return (
		<svg width={W} height={H}>
			<Defs v={v} />
			<g opacity={1 - leave} transform={`translate(${shake},${shake * 0.6})`}>
				<rect width={W} height={H} fill="url(#bgG)" />
				{Array.from({length: 50}, (_, k) => <circle key={k} cx={rnd(k) * W} cy={rnd(k, 1) * H} r={0.8 + 1.4 * rnd(k, 2)} fill="#eef" opacity={0.15 + 0.35 * Math.sin(T * 1.2 + k * 2.1) ** 2} />)}
				<circle cx={520} cy={560} r={620} fill="none" stroke={v.hot} strokeWidth={2.2} opacity={0.25 + 0.4 * lit} />
				<circle cx={520} cy={560} r={640} fill="none" stroke={v.col} strokeWidth={10} opacity={0.12 * lit} filter="url(#gM)" />
				<Worlds T={T} v={v} u={cl01((t - rv) / 1.4)} cx={cx} cy={cy} />
				<g transform={`translate(${cx},${cy}) scale(${push})`}>
					<Halo T={T} v={v} s={lerp(0.85, 1, out3(t / 0.3)) * (1 + 0.12 * Math.max(0, 1 - Math.abs(t - rv) / 0.25)) * (1 + 0.045 * beatPulse * lit)} t={t} rv={rv} lit={lit} />
					{t >= rv && t < rv + 0.6 && <circle r={250 + 900 * out3((t - rv) / 0.6)} fill="none" stroke={v.hot} strokeWidth={14 * (1 - (t - rv) / 0.6)} opacity={1 - (t - rv) / 0.6} />}
					<g opacity={orb}>
						<circle r={248} fill="url(#orbG)" />
						<OrbMoment T={T} v={v} />
					</g>
					{rise > 0 && <g transform={`translate(${pl.dx},${pl.dy + lerp(90, 0, out3(rise))}) scale(${pl.s * lerp(0.72, 1, outBack(rise))}) ${pl.flip ? 'scale(-1,1)' : ''}`} opacity={cl01(rise * 4)}>
						<Fig T={T} v={v} draw={out3(rise)} open={open} orn={orn} t={t} />
					</g>}
				</g>
				{v.kind === 'yu' && <ReachHand T={T} v={v} u={cl01((t - rv - 0.4) / 0.6)} />}
				{v.kind === 'love' && lit > 0 && Array.from({length: 9}, (_, k) => { const ox = cx + 120, oy = cy - 60, ex = k < 5 ? 980 + k * 190 : 1960, ey = k < 5 ? -40 : 120 + (k - 5) * 230, w = Math.sin(T * 1.4 + k) * 60, len = 1800; const d = `M${ox},${oy + (k - 4) * 24} C${ox + 160},${oy - 260 + w} ${ex - 200},${ey + 260 - w} ${ex},${ey}`; const u = cl01((t - rv - 0.4) / 1.4); return <g key={k}><path d={d} stroke={v.col} strokeWidth={6} fill="none" opacity={0.3} filter="url(#gM)" strokeDasharray={len} strokeDashoffset={len * (1 - out3(u - k * 0.05))} /><path d={d} stroke={v.col} strokeWidth={2.2} fill="none" strokeDasharray={len} strokeDashoffset={len * (1 - out3(u - k * 0.05))} /></g>; })}
				{lit > 0 && bolts.map(([a, b], k) => <Bolt key={k} a={a} b={b} seed={k + v.n * 10} T={T} col={v.col} o={lit * (0.4 + 0.5 * Math.sin(T * 3 + k)) * (v.kind === 'ai' ? 0.4 : 1)} />)}
				<Particles T={T} v={v} lit={lit} />
				{/* left: the moment and the line */}
				<BlurText id={`c${v.n}`} x={150} y={470} text={v.when} size={36} weight={600} col="#d4cde2" spacing="0.12em" u={cap} out={outQ} />
				<BlurText id={`q${v.n}`} x={130} y={590} text={v.line} size={92} u={quote} out={outQ} />
				{/* left: the name */}
				<BlurText id={`s${v.n}`} x={150} y={330} text={`七情之${NUM[v.n]}，它叫`} size={38} weight={700} col="#efe9fb" spacing="0.16em" u={sub} />
				{name > 0 && <g>
					<clipPath id={`sw${v.n}`}><rect x={60 + 620 * sweep} y={340} width={110} height={360} transform="skewX(-18)" /></clipPath>
					<g transform={`translate(${-120 * (1 - out3(name))},0)`} opacity={cl01(name * 2.5)}>
						<text x={140} y={640} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 330}} fill={v.col} opacity={0.7} filter="url(#gL)">{v.ch}</text>
						<text x={140} y={640} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 330}} fill="url(#nameG)">{v.ch}</text>
						<text x={140} y={640} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 330}} fill="#fff" clipPath={`url(#sw${v.n})`}>{v.ch}</text>
						<text x={510} y={470} style={{fontFamily: SERIF, fontWeight: 600, fontSize: 52, fontStyle: 'italic', letterSpacing: '0.1em'}} fill="#fff">{v.py}</text>
						<rect x={492} y={410} width={6} height={230} fill="url(#goldG)" />
						<text x={510} y={540} style={{fontFamily: SERIF, fontWeight: 600, fontSize: 30, letterSpacing: '0.24em'}} fill={GOLD}>七情 · 之{NUM[v.n]}</text>
					</g>
					<ellipse cx={lerp(-200, 1100, ease(name))} cy={520} rx={500} ry={10} fill="#fff" opacity={0.85 * Math.sin(Math.PI * cl01(name))} filter="url(#gS)" />
				</g>}
				<BlurText id={`y${v.n}`} x={150} y={770} text={v.say} size={48} weight={800} col="#ffffff" spacing="0.05em" u={say} />
			</g>
			{flash > 0 && <><rect width={W} height={H} fill={v.hot} opacity={0.35 * flash} /><ellipse cx={cx} cy={cy} rx={1100 * flash} ry={60} fill="#fff" opacity={0.8 * flash} filter="url(#gL)" /></>}
			{flare > 0 && <ellipse cx={cx} cy={cy - 40} rx={900 * flare} ry={8} fill="#fff" opacity={0.85 * flare} filter="url(#gS)" />}
		</svg>
	);
};

// ---------------------------------------------------------------- intro / outro
const SEVEN = VOICES.map((v) => ({ch: v.ch, col: v.col}));
const V0 = Q0[0];
const Intro: React.FC<{T: number}> = ({T}) => (
	<svg width={W} height={H}>
		<Defs v={{col: '#b9b0ff', hot: '#ece8ff', deep: '#141026'}} />
		<g opacity={1 - fade(T, V0 - 0.3, 0.3)}>
			<rect width={W} height={H} fill="url(#bgG)" />
			<BlurText id="i1" x={960} y={360} text="两千年前，《礼记》写道：" size={40} weight={600} col="#cfc8de" spacing="0.14em" anchor="middle" u={fade(T, 0.25, 0.6)} />
			<BlurText id="i2" x={960} y={480} text="人心里，天生住着七个声音。" size={84} anchor="middle" u={fade(T, BAR, 0.6)} />
			<BlurText id="i3" x={960} y={800} text="七者，弗学而能" size={34} weight={600} col={GOLD} spacing="0.5em" anchor="middle" u={fade(T, 1.5 * BAR, 0.5)} />
			{SEVEN.map((s, i) => { const o = cl01((T - (2 * BAR + i * BEAT)) / 0.12); return <Icon key={s.ch} x={960 + (i - 3) * 132} y={650} ch={s.ch} col={s.col} o={o} s={lerp(1.8, 1, outBack(o))} />; })}
		</g>
	</svg>
);
const Outro: React.FC<{T: number}> = ({T}) => {
	const t = T - OUT, q = fade(t, 0.05, 0.35), qOut = fade(t, 2 * BAR - 0.22, 0.2), title = cl01((t - 2 * BAR) / 0.22);
	return (
		<svg width={W} height={H}>
			<Defs v={{col: GOLD, hot: '#fff2c8', deep: '#1c1408'}} />
			<rect width={W} height={H} fill="url(#bgG)" />
			<g opacity={1 - qOut}>
				<BlurText id="o1" x={960} y={450} text="你心里，哪个声音最大？" size={80} anchor="middle" u={q} />
				{SEVEN.map((s, i) => { const o = cl01((t - BEAT - i * BEAT * 0.5) / 0.12); return <Icon key={s.ch} x={960 + (i - 3) * 132} y={620} ch={s.ch} col={s.col} o={o} s={lerp(1.6, 1, outBack(o))} />; })}
			</g>
			{title > 0 && <g opacity={title * (1 - fade(t, 4 * BAR, 0.5))} transform={`translate(960,540) scale(${lerp(1.3, 1, out3(title))}) translate(-960,-540)`}>
				<g transform={`translate(960,520) rotate(${T * 10})`}>{SEVEN.map((s, i) => { const a = i / 7 * Math.PI * 2; return <circle key={s.ch} cx={Math.cos(a) * 320} cy={Math.sin(a) * 320} r={13} fill={s.col} filter="url(#gS)" />; })}<circle r={320} fill="none" stroke="url(#goldG)" strokeWidth={2} opacity={0.6} /></g>
				<text x={960} y={590} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 230, letterSpacing: '0.12em'}} fill="#fff2d0" opacity={0.7} filter="url(#gL)">七情</text>
				<text x={960} y={590} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 230, letterSpacing: '0.12em'}} fill="url(#goldG)">七情</text>
				<text x={960} y={680} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 600, fontSize: 34, letterSpacing: '0.9em'}} fill={GOLD}>喜怒哀惧爱恶欲</text>
				<ellipse cx={lerp(400, 1520, ease(title))} cy={520} rx={600} ry={9} fill="#fff" opacity={0.8 * Math.sin(Math.PI * title)} filter="url(#gS)" />
			</g>}
		</svg>
	);
};

export const QiQing6: React.FC = () => {
	const T = useCurrentFrame() / FPS;
	let i = 0; while (i < 6 && T >= Q0[i + 1]) i++;
	const node = T < V0 ? <Intro T={T} /> : T < OUT ? <VoiceScene T={T} v={VOICES[i]} i={i} /> : <Outro T={T} />;
	return <AbsoluteFill style={{background: '#030205'}}>
		{node}
		<div style={{position: 'absolute', right: 56, bottom: 40, fontFamily: SERIF, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(230,224,245,0.4)'}}>VIBE知识大赏 · 七情</div>
	</AbsoluteFill>;
};

registerRoot(() => <Composition id="QQ6" component={QiQing6} durationInFrames={Math.round(QQ5_END * FPS)} fps={FPS} width={W} height={H} />);
