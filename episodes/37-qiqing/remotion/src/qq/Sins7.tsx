import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {PHOTO_GRE} from './photo_gre';
import {MEME_IMG} from './memes';

/* 《七宗罪》 — the 七情 template with the seven deadly sins (Britannica: first enumerated in the 6th century by
   St. Gregory the Great, later elaborated by Thomas Aquinas). One live element per sin, starting on the beat after
   the figure appears. Same music grid as 七情: one sin every 3 bars from the 6.14 s hit; title on bar 27. */

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

// ---------------------------------------------------------------- music grid: qiqing_music.wav, beat 0.5069 s, downbeats at 0.06 + 4k beats
// the bass drops out on the last beat of bar 2 and the first big hit is bar 3 (6.14 s): 喜 lands there.
// one voice every 3 bars; 哀 lands on bar 9 and holds through bar 10, where the kick drops out;
// the outro question runs bars 24-26 (26 is the second break) and the title lands on the kick's return at bar 27.
const BEAT = 0.5069, PH = 0.06, BAR = 4 * BEAT;
const bt = (n: number) => PH + n * BAR;                  // film time of bar n
const REV = [3, 6, 9, 12, 15, 18, 21].map(bt);            // reveal (downbeat) of each voice
const Q0 = REV.map((r) => r - BAR);                       // its line starts one bar earlier
const OUT = bt(24);
export const QQ9_END = bt(29) + 0.6;

type Kind = 'xi' | 'nu' | 'ai' | 'ju' | 'love' | 'wu' | 'yu' | 'den' | 'ang' | 'bar' | 'dep' | 'acc' | 'pri' | 'env' | 'slo' | 'gre' | 'glu' | 'lus';
/** the new voices borrow an old voice's world / halo / particles */
const LOOK: Partial<Record<Kind, Kind>> = {ang: 'nu', dep: 'ai', acc: 'xi', bar: 'yu'};
const look = <T extends {kind: Kind}>(v: T): T => ({...v, kind: LOOK[v.kind] ?? v.kind});
type Voice = {n: number; ch: string; py: string; kind: Kind; col: string; hot: string; deep: string; when: string; line: string; say: string; key?: string};
const VOICES: Voice[] = [
	{n: 1, ch: '傲慢', py: 'Superbia', kind: 'pri', col: '#b47bff', hot: '#ecdcff', deep: '#1a0a2c', when: '它在你明知错了却不肯道歉时说', line: '“凭什么我先低头?”', key: '不够好', say: '不肯低头，是怕被看见不够好。'},
	{n: 2, ch: '嫉妒', py: 'Invidia', kind: 'env', col: '#6fe08a', hot: '#dcffe4', deep: '#062014', when: '它在你刷到朋友晒升职时说', line: '“凭什么不是我?”', key: '也想要', say: '嫉妒，是你也想要。'},
	{n: 3, ch: '暴怒', py: 'Ira', kind: 'ang', col: '#ff3b3b', hot: '#ffd0d0', deep: '#2a0606', when: '它在你被人插队时说', line: '“你再说一遍?”', key: '自己', say: '怒火，最先烧的是自己。'},
	{n: 4, ch: '懒惰', py: 'Acedia', kind: 'slo', col: '#8fd0e8', hot: '#e6f8ff', deep: '#0a1c26', when: '它在你deadline前一天说', line: '“明天再说。”', key: '累到不想面对', say: '懒，有时是累到不想面对。'},
	{n: 5, ch: '贪婪', py: 'Avaritia', kind: 'gre', col: '#f2c14e', hot: '#fff2c8', deep: '#241a04', when: '它在你存款又多了一点时说', line: '“还不够。”', key: '失去', say: '想要更多，是怕失去。'},
	{n: 6, ch: '暴食', py: 'Gula', kind: 'glu', col: '#ff9a3a', hot: '#ffe2c4', deep: '#2a1204', when: '它在你凌晨一点打开外卖时说', line: '“就吃一点。”', key: '不是胃', say: '填不满的，往往不是胃。'},
	{n: 7, ch: '色欲', py: 'Luxuria', kind: 'lus', col: '#ff5c8a', hot: '#ffd6e2', deep: '#2a0614', when: '它在你一遍遍刷他的照片时说', line: '“再看一眼。”', key: '被看见', say: '渴望，是想被看见。'},
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
		<linearGradient id="hairG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={v.deep} /><stop offset="1" stopColor="#09070d" /></linearGradient>
		<linearGradient id="sheenG" x1="0.9" y1="0" x2="0.1" y2="1"><stop offset="0" stopColor={v.col} stopOpacity="0.42" /><stop offset="0.45" stopColor={v.col} stopOpacity="0.12" /><stop offset="1" stopColor="#09070d" stopOpacity="0" /></linearGradient>
		<linearGradient id="fireHairG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#140604" /><stop offset="0.38" stopColor="#5a1406" /><stop offset="0.62" stopColor="#ff5a1a" /><stop offset="0.85" stopColor="#ffb05a" /><stop offset="1" stopColor="#fff1c4" /></linearGradient>
		<linearGradient id="veilG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={v.col} stopOpacity="0.3" /><stop offset="1" stopColor={v.col} stopOpacity="0.12" /></linearGradient>
		<filter id="chR" x="-20%" y="-20%" width="140%" height="140%"><feColorMatrix type="matrix" values="1 0 0 0 0.2  0 0 0 0 0  0 0 0 0 0.1  0 0 0 0.8 0" /></filter>
		<filter id="chB" x="-20%" y="-20%" width="140%" height="140%"><feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0.15  0 0 1 0 0.3  0 0 0 0.8 0" /></filter>
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
type Eye = 'calm' | 'happy' | 'joy' | 'wide' | 'angry' | 'sad' | 'lidded';
type Brow = 'calm' | 'up' | 'angry' | 'sad' | 'arch';
type Mouth = 'grin' | 'set' | 'sad' | 'closed' | 'part' | 'smile' | 'roar';
const FACE_F = 'M0,-170 C72,-170 118,-122 120,-54 C122,-6 114,40 98,78 C82,118 46,152 0,162 C-46,152 -82,118 -98,78 C-114,40 -122,-6 -120,-54 C-118,-122 -72,-170 0,-170 Z';
const NECK_F = 'M-44,130 C-44,180 -48,222 -58,244 C-120,262 -230,284 -292,340 C-326,372 -342,450 -350,660 L350,660 C342,450 326,372 292,340 C230,284 120,262 58,244 C48,222 44,180 44,130';
const eyeShape = (e: Eye) => ({
	calm: {up: 'M-28,2 C-14,-15 12,-19 31,-5', lo: 'M-28,2 C-10,13 14,12 31,-5'},
	joy: {up: 'M-29,3 C-14,-19 13,-22 32,-4', lo: 'M-29,3 C-10,4 14,3 32,-4'},
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
		case 'roar': return <g><path d="M-34,70 C-18,62 18,62 34,70 C32,128 -32,128 -34,70 Z" fill="#05040a" stroke={v.hot} strokeWidth={2.6} /><path d="M-28,72 C-12,68 12,68 28,72 L26,82 C10,79 -10,79 -26,82 Z" fill="#fff" opacity={0.92} /><path d="M-20,114 C-8,110 8,110 20,114 L18,106 C8,104 -8,104 -18,106 Z" fill="#fff" opacity={0.8} /><ellipse cx={0} cy={100} rx={14} ry={8} fill={v.col} opacity={0.6} /></g>;
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
const PROFILE = 'M14,-220 C80,-216 120,-182 128,-132 C131,-116 130,-106 136,-96 C142,-84 146,-74 152,-60 C162,-40 172,-28 176,-18 C178,-10 170,-4 158,-4 C152,-4 152,2 158,8 C164,14 160,20 152,22 C158,26 158,34 150,40 C144,44 144,52 148,60 C152,78 140,96 114,100 C90,104 72,112 64,132 C58,170 60,220 70,280 C96,320 170,344 230,372 C270,396 288,470 294,640 L-290,640 C-284,470 -262,396 -206,366 C-146,342 -104,322 -92,280 C-80,220 -78,150 -88,90 C-124,52 -156,-10 -154,-84 C-150,-170 -70,-224 14,-220 Z';
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
		{tears > 0 && (() => {
			// a tear every 4.6 s: forms under the eye (0.9 s), slides down the cheek (2.8 s), drops from the jaw
			const cyc = 4.6, tt = ((T % cyc) + cyc) % cyc, path: P[] = [[123, -78], [128, -48], [131, -10], [129, 30], [122, 64], [112, 96]];
			const at = (q: number): P => { const f = q * (path.length - 1), i = Math.min(path.length - 2, Math.floor(f)), r = f - i; return [lerp(path[i][0], path[i + 1][0], r), lerp(path[i][1], path[i + 1][1], r)]; };
			let pos: P, sz = 1, trail = 0, o = 1;
			if (tt < 0.9) { pos = path[0]; sz = ease(tt / 0.9); }
			else if (tt < 3.7) { trail = ease((tt - 0.9) / 2.8); pos = at(trail); }
			else { const f = tt - 3.7; trail = 1; pos = [112, 96 + 300 * f * f]; o = 1 - f / 0.9; }
			const pts = [path[0], ...path.slice(1).filter((_, i) => (i + 1) / (path.length - 1) <= trail), pos];
			return <g opacity={tears}>
				{trail > 0 && <path d={'M' + pts.map((p) => p.map((q) => q.toFixed(1)).join(',')).join(' L')} stroke={v.hot} strokeWidth={1.4} fill="none" strokeLinecap="round" opacity={0.45 * (tt > 3.7 ? Math.max(0, 1 - (tt - 3.7) / 0.9) : 1)} />}
				<g transform={`translate(${pos[0]},${pos[1]}) scale(${0.62 * (0.35 + 0.65 * sz)})`} opacity={Math.max(0, o)}><circle r={11} fill={v.hot} opacity={0.3} filter="url(#gS)" /><path d="M0,-11 C5,-3 8,3 8,7 C8,12 -8,12 -8,7 C-8,3 -5,-3 0,-11 Z" fill="#eef4ff" /></g>
			</g>;
		})()}
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

/** a gold drop earring under the profile ear */
const Earring: React.FC<{T: number; v: Voice; o: number}> = ({T, v, o}) => { const sw = 6 * Math.sin(T * 2.2); return <g opacity={o} transform="translate(-40,-34)">
	<line x1={0} y1={0} x2={sw * 0.5} y2={34} stroke={GOLD} strokeWidth={1.6} />
	<circle cx={0} cy={0} r={4} fill="url(#goldG)" />
	<path d={`M${sw * 0.5},34 l9,16 l-9,22 l-9,-22 Z`} fill={v.col} stroke="#fff2c8" strokeWidth={1.2} />
	<circle cx={sw * 0.5} cy={52} r={14} fill={v.col} opacity={0.35} filter="url(#gS)" />
</g>; };

/** a tapered, slightly curled finger (for hands) */
const fing = (bx: number, by: number, tx: number, ty: number, w: number, curl: number) => { const mx = (bx + tx) / 2 + curl, my = (by + ty) / 2; const dx = tx - bx, dy = ty - by, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L; const w0 = w / 2, w1 = w * 0.42; return `M${bx + nx * w0},${by + ny * w0} Q${mx + nx * w0},${my + ny * w0} ${tx + nx * w1},${ty + ny * w1} A${w1},${w1} 0 0,0 ${tx - nx * w1},${ty - ny * w1} Q${mx - nx * w0},${my - ny * w0} ${bx - nx * w0},${by - ny * w0} Z`; };

/** an open hand, palm to the viewer, fingers up, wrist at the origin. Every part is stroked first and filled after,
    so only the outer silhouette shows (no capsule seams). */
const HAND_F: [number, number, number, number, number, number][] = [[-31, -126, -15, 88, 21, 5], [-10, -134, -5, 104, 22, 2], [11, -132, 5, 96, 21, -2], [31, -122, 15, 74, 18, -5]];
const Hand: React.FC<{T: number; v: Voice; spread?: number; nails?: boolean; rings?: boolean; arm?: boolean; w?: number; fill?: string; glow?: boolean}> = ({T, v, spread = 1, nails, rings, arm, w = 2.6, fill = '#0f0818', glow = true}) => {
	const fingers = HAND_F.map(([bx, by, a, L, fw, c], i) => { const ang = (a * spread + 1.6 * Math.sin(T * 1.3 + i)) * Math.PI / 180; const tx = bx + Math.sin(ang) * L, ty = by - Math.cos(ang) * L; return {d: fing(bx, by + 18, tx, ty, fw, c), tx, ty, ang, bx, by}; });
	const ta = (-50 * spread) * Math.PI / 180, thumb = fing(-36, -52, -36 + Math.sin(ta) * 78, -52 - Math.cos(ta) * 78, 25, 8);
	const palm = 'M-42,12 C-50,-30 -52,-92 -44,-124 C-28,-140 28,-140 44,-122 C50,-90 48,-30 40,12 Z';
	const parts = [palm, ...fingers.map((f) => f.d), thumb, ...(arm ? ['M-42,6 C-50,90 -56,180 -62,320 L64,320 C58,180 50,90 40,6 Z'] : [])];
	return <g>
		{glow && parts.map((d, i) => <path key={'g' + i} d={d} fill="none" stroke={v.col} strokeWidth={w * 4} opacity={0.3} filter="url(#gM)" />)}
		{parts.map((d, i) => <path key={'s' + i} d={d} fill="none" stroke={v.hot} strokeWidth={w * 2} strokeLinejoin="round" />)}
		{parts.map((d, i) => <path key={'f' + i} d={d} fill={fill} />)}
		<path d="M-30,-66 C-10,-78 14,-78 34,-62" stroke={v.hot} strokeWidth={1} opacity={0.35} fill="none" />
		<path d="M-22,-22 C-6,-34 6,-60 4,-100" stroke={v.hot} strokeWidth={1} opacity={0.3} fill="none" />
		{fingers.map((f, i) => i < 3 && <path key={'j' + i} d={`M${f.bx + (f.tx - f.bx) * 0.5 - 6},${f.by + (f.ty - f.by) * 0.5} l12,0`} stroke={v.hot} strokeWidth={1} opacity={0.35} />)}
		{nails && fingers.map((f, i) => <ellipse key={'n' + i} cx={f.tx - Math.sin(f.ang) * 9} cy={f.ty + Math.cos(f.ang) * 9} rx={6} ry={11} transform={`rotate(${f.ang * 180 / Math.PI},${f.tx - Math.sin(f.ang) * 9},${f.ty + Math.cos(f.ang) * 9})`} fill={v.col} opacity={0.9} />)}
		{rings && [1, 2].map((i) => { const f = fingers[i], mx = f.bx + (f.tx - f.bx) * 0.3, my = f.by + 18 + (f.ty - f.by - 18) * 0.3; return <g key={'r' + i}><line x1={mx - 12} y1={my} x2={mx + 12} y2={my - 2} stroke="url(#goldG)" strokeWidth={6} strokeLinecap="round" />{i === 1 && <circle cx={mx} cy={my - 2} r={5} fill={v.col} stroke="#fff2c8" strokeWidth={1} />}</g>; })}
	</g>;
};

// ---------------------------------------------------------------- clothing, one look per voice (drawn over the shoulders)
const BODY_F = 'M-60,250 C-122,266 -230,288 -290,342 C-324,374 -340,452 -348,660 L348,660 C340,452 324,374 290,342 C230,288 122,266 60,250 Z';
const BODY_P = 'M66,262 C96,320 170,344 230,372 C270,396 288,470 294,640 L-290,640 C-284,470 -262,396 -206,366 C-146,342 -104,322 -92,262 C-40,296 30,296 66,262 Z';
const Garment: React.FC<{T: number; v: Voice; draw: number}> = ({T, v: v0, draw}) => {
	const v = {...v0, kind: ({den: 'ai', dep: 'ai', ang: 'nu', bar: 'ju', acc: 'ju'} as Partial<Record<Kind, Kind>>)[v0.kind] ?? v0.kind};
	const band = (a: P, b: P, w: number, col: string) => <g><path d={`M${a[0]},${a[1]} L${b[0]},${b[1]}`} stroke={col} strokeWidth={w} fill="none" />{[-1, 1].map((o) => <path key={o} d={`M${a[0] + o * w / 2},${a[1]} L${b[0] + o * w / 2},${b[1]}`} stroke="url(#goldG)" strokeWidth={2.2} fill="none" />)}</g>;
	switch (v.kind) {
		case 'xi': return <g opacity={draw}>   {/* a festive red jacket, cross collar, gold cloud trim */}
			<path d={BODY_F} fill="#3e0906" /><Neon d={BODY_F} v={v} draw={draw} w={2.2} L={2400} glow={0.3} />
			<path d="M-50,252 L4,340 L50,252" stroke="#fff4e0" strokeWidth={10} fill="none" />
			{band([62, 248], [-8, 360], 26, '#c8241a')}{band([-62, 248], [52, 450], 26, '#c8241a')}
			{[1, -1].map((s) => [0, 1, 2].map((k) => <path key={s + '-' + k} transform={`translate(${s * (170 + k * 50)},${318 + k * 26})`} d="M-14,0 C-14,-12 0,-14 4,-6 C8,-14 22,-10 18,2 C24,4 22,14 12,12 L-12,12 C-22,12 -22,0 -14,0 Z" fill="none" stroke={GOLD} strokeWidth={1.6} opacity={0.85} />))}
		</g>;
		case 'nu': return <g opacity={draw}>   {/* a dark breastplate, gold rim, a lava seam down the middle */}
			<path d={BODY_F} fill="#160604" /><Neon d={BODY_F} v={v} draw={draw} w={2.2} L={2400} glow={0.3} />
			<path d="M-120,266 C-60,300 60,300 120,266 L60,420 L0,470 L-60,420 Z" fill="#200a06" stroke="url(#goldG)" strokeWidth={3} />
			<path d="M0,300 L8,340 L-4,380 L6,430 L0,470" stroke="#ff9a3a" strokeWidth={3} fill="none" filter="url(#gS)" /><path d="M0,300 L8,340 L-4,380 L6,430 L0,470" stroke="#fff1c4" strokeWidth={1.2} fill="none" />
		</g>;
		case 'ju': return <g opacity={draw}>   {/* a dark hooded cloak, a silver clasp */}
			<path d={BODY_F} fill="#06121a" /><Neon d={BODY_F} v={v} draw={draw} w={2.2} L={2400} glow={0.3} />
			{[1, -1].map((s) => <path key={s} d={`M${s * 60},250 C${s * 90},320 ${s * 70},420 ${s * 40},660`} stroke={v.hot} strokeWidth={1.4} fill="none" opacity={0.5} />)}
			<circle cx={0} cy={262} r={12} fill="#dff6ff" stroke={v.col} strokeWidth={2} /><path d="M-56,256 L-12,262 M12,262 L56,256" stroke="#dff6ff" strokeWidth={2} />
		</g>;
		case 'yu': return <g opacity={draw}>   {/* an off-shoulder gown, gold-edged */}
			<path d="M-306,392 C-200,372 -110,436 0,448 C110,436 200,372 306,392 C326,440 342,500 348,660 L-348,660 C-342,500 -326,440 -306,392 Z" fill="#1e0b30" />
			<path d="M-306,392 C-200,372 -110,436 0,448 C110,436 200,372 306,392" stroke="url(#goldG)" strokeWidth={4} fill="none" />
			<path d="M-306,392 C-200,372 -110,436 0,448 C110,436 200,372 306,392" stroke={v.col} strokeWidth={12} fill="none" opacity={0.3} filter="url(#gM)" />
			{Array.from({length: 7}, (_, i) => { const x = lerp(-220, 220, i / 6); return <path key={i} d={`M${x},${410 + 30 * Math.sin(Math.PI * i / 6)} l0,${200}`} stroke={v.hot} strokeWidth={1} opacity={0.25} />; })}
		</g>;
		case 'ai': return <g opacity={draw}>   {/* a plain pale robe, a soft collar */}
			<path d={BODY_P} fill="#0c1428" /><Neon d={BODY_P} v={v} draw={draw} w={2.2} L={2400} glow={0.3} />
			<path d="M-92,262 C-40,296 30,296 66,262" stroke="#e8eeff" strokeWidth={8} fill="none" opacity={0.8} />
			<path d="M40,286 C10,360 -40,440 -70,640" stroke={v.hot} strokeWidth={1.6} fill="none" opacity={0.6} />
			{[0, 1, 2].map((k) => <path key={k} d={`M${120 + k * 50},${360 + k * 10} C${130 + k * 50},${460} ${120 + k * 50},${560} ${130 + k * 52},640`} stroke={v.hot} strokeWidth={1} fill="none" opacity={0.35} />)}
		</g>;
		case 'wu': return <g opacity={draw}>   {/* a dark green robe with a tall gold-edged collar */}
			<path d={BODY_P} fill="#06120a" /><Neon d={BODY_P} v={v} draw={draw} w={2.2} L={2400} glow={0.3} />
			<path d="M-94,196 C-40,214 30,214 70,192 L68,264 C30,292 -40,292 -94,262 Z" fill="#0c1e0e" stroke="url(#goldG)" strokeWidth={3} />
			{Array.from({length: 6}, (_, i) => { const x = lerp(-80, 56, i / 5); return <path key={i} d={`M${x},${232 + 4 * Math.sin(i)} l5,-9 l4,10 Z`} fill={v.col} />; })}
			<path d="M60,290 C20,380 -40,470 -60,640" stroke="url(#goldG)" strokeWidth={2.4} fill="none" />
		</g>;
		default: return null;
	}
};

// ---------------------------------------------------------------- the seven figures
type FigProps = {T: number; v: Voice; draw: number; open: number; orn: (i: number) => number; late: (i: number) => number; t: number};

const FigXi: React.FC<FigProps> = ({T, v, draw, open, orn, late}) => {
	const bob = 6 * Math.sin(T * Math.PI * 2 / (BEAT * 2));
	return <g transform={`translate(0,${bob}) rotate(${-4 + 2 * Math.sin(T * 1.3)})`}>
		{/* twin buns and fluttering ribbons */}
		{[1, -1].map((s) => <g key={s}>
			{Array.from({length: 3}, (_, k) => { const w = Math.sin(T * 3 + k + s) * 30 * orn(0); return <path key={k} d={`M${s * 130},-200 C${s * (200 + k * 30)},${-260 + w} ${s * (260 + k * 40)},${-140 - w} ${s * (330 + k * 30)},${-80 + w * 1.4}`} stroke={k === 1 ? '#ff6a4a' : v.col} strokeWidth={10 - k * 2} fill="none" opacity={0.85} />; })}
			<circle cx={s * 110} cy={-200} r={70} fill="#0d0a10" />
			<Neon d={`M${s * 110 - 70},-200 A70,70 0 1,1 ${s * 110 + 70},-200 A70,70 0 1,1 ${s * 110 - 70},-200`} v={v} draw={draw} w={2.6} />
			{[0, 1, 2].map((k) => <path key={k} d={`M${s * 60},${-230 + k * 22} C${s * 100},${-262 + k * 18} ${s * 140},${-250 + k * 14} ${s * 172},${-210 + k * 10}`} stroke={v.hot} strokeWidth={1.4} fill="none" opacity={0.6 * draw} />)}
			{/* a flower pin in each bun */}
			<g transform={`translate(${s * 150},-240) rotate(${T * 40 * s})`}>{Array.from({length: 5}, (_, p) => <ellipse key={p} cx={0} cy={-10} rx={6} ry={12} transform={`rotate(${p * 72})`} fill="#ff6a4a" opacity={0.85} />)}<circle r={5} fill={GOLD} /></g>
		</g>)}
		{/* hair cap with bangs */}
		<path d="M-122,-60 C-130,-150 -70,-196 0,-196 C70,-196 130,-150 122,-60 C100,-110 60,-120 30,-112 C20,-100 6,-90 -6,-100 C-30,-120 -80,-120 -122,-60 Z" fill="#0f0b12" opacity={draw} />
		<Neon d="M-122,-60 C-130,-150 -70,-196 0,-196 C70,-196 130,-150 122,-60 C100,-110 60,-120 30,-112 C20,-100 6,-90 -6,-100 C-30,-120 -80,-120 -122,-60" v={v} draw={draw} w={2.4} />
		<FrontFace T={T} v={v} draw={draw} open={open} eye="joy" brow="arch" mouth="grin" />
		{open > 0 && [1, -1].map((sx) => <g key={'sp' + sx} opacity={open} transform={`translate(${sx * 46 + 12},-34) scale(${0.8 + 0.2 * Math.sin(T * 5 + sx)})`}><path d="M0,-7 L1.6,-1.6 L7,0 L1.6,1.6 L0,7 L-1.6,1.6 L-7,0 L-1.6,-1.6 Z" fill="#fff" /></g>)}
		{[1, -1].map((sx) => <path key={'lw' + sx} transform={`translate(${sx * 46},-22) scale(${sx},1)`} d="M-20,12 C-6,18 10,16 24,8" stroke={v.hot} strokeWidth={1.4} fill="none" opacity={0.6 * draw} />)}
		{/* blush */}
		{[1, -1].map((s) => <ellipse key={s} cx={s * 70} cy={30} rx={26} ry={12} fill="#ff6a4a" opacity={0.35 * open} filter="url(#gS)" />)}
		<Garment T={T} v={v} draw={draw} />
	</g>;
};

const FigNu: React.FC<FigProps> = ({T, v, draw, open, orn, late}) => {
	// a real head of hair swept up from the hairline, its ends turning into flame; the bonfire roars behind it
	const N = 7, tongues = Array.from({length: N}, (_, i) => { const u = i / (N - 1), x = lerp(-205, 205, u), peak = 1 - Math.abs(u - 0.5) * 2; return {x, tip: -190 - 70 * peak - 90 * peak * peak - 18 * Math.sin(T * 4.5 + i * 1.9), lean: (u - 0.5) * 70 + 8 * Math.sin(T * 6 + i)}; });
	const valley = (i: number) => { const u = (i + 0.5) / (N - 1); return {x: lerp(-205, 205, u), y: -176 - 40 * (1 - Math.abs(u - 0.5) * 2)}; };
	const top = tongues.map(({x, tip, lean}, i) => { const vx = i < N - 1 ? valley(i) : {x: 168, y: -120}; return `Q${x - 26 + lean * 0.3},${(tip - 140) * 0.5 - 40} ${x + lean},${tip} Q${x + 30 + lean * 0.4},${(tip + vx.y) / 2} ${vx.x},${vx.y}`; }).join(' ');
	const hair = `M-122,-40 C-138,-80 -160,-110 -176,-126 ${top} C150,-100 134,-74 122,-40 C110,-90 70,-118 0,-122 C-70,-118 -110,-90 -122,-40 Z`;
	return <g>
		<g opacity={late(0)}>
			{Array.from({length: 13}, (_, i) => { const x = lerp(-170, 170, i / 12), h = 200 + 150 * (1 - Math.abs(i - 6) / 6) + 40 * Math.sin(T * 7 + i * 1.3), w = 42 + 10 * Math.sin(T * 5 + i); const by = -150 - 40 * (1 - Math.abs(i - 6) / 6); return <path key={i} d={`M${x - w},${by} C${x - w},${by - h * 0.5} ${x + 10 * Math.sin(T * 6 + i)},${by - h * 0.7} ${x + 6 * Math.sin(T * 9 + i)},${by - h} C${x + w * 0.4},${by - h * 0.6} ${x + w},${by - h * 0.4} ${x + w},${by} Z`} fill="url(#flameG)" opacity={0.7} />; })}
			{Array.from({length: 9}, (_, i) => { const x = lerp(-120, 120, i / 8), h = 130 + 90 * (1 - Math.abs(i - 4) / 4) + 30 * Math.sin(T * 8 + i); const by = -170 - 30 * (1 - Math.abs(i - 4) / 4); return <path key={'c' + i} d={`M${x - 14},${by} C${x - 12},${by - h * 0.6} ${x},${by - h * 0.8} ${x},${by - h} C${x + 6},${by - h * 0.6} ${x + 14},${by - h * 0.4} ${x + 14},${by} Z`} fill="#fff1c4" opacity={0.6} />; })}
		</g>
		<path d={hair} fill="url(#fireHairG)" opacity={draw} />
		<path d={hair} fill="none" stroke="#ffd8a0" strokeWidth={2} opacity={0.7 * draw} />
		{[0, 1, 2, 3, 4, 5, 6].map((k) => { const x0 = lerp(-100, 100, k / 6), x1 = lerp(-200, 200, k / 6); return <path key={k} d={`M${x0},-122 C${x0 * 1.2},-170 ${x1 * 0.9 + 6 * Math.sin(T * 4 + k)},-210 ${x1},${-240 - 70 * (1 - Math.abs(k - 3) / 3)}`} stroke="#ffc07a" strokeWidth={1.5} fill="none" opacity={0.55 * draw} />; })}
		{/* armoured shoulders with spikes and gold rims */}
		<g opacity={orn(1)} transform="scale(0.82,1)">{[1, -1].map((s) => <g key={s}>
			<path d={`M${s * 120},300 C${s * 200},250 ${s * 330},260 ${s * 400},340 C${s * 330},330 ${s * 220},340 ${s * 140},360 Z`} fill="#140806" stroke="url(#goldG)" strokeWidth={3} />
			{[0, 1, 2].map((k) => <path key={k} d={`M${s * (220 + k * 60)},${276 + k * 10} L${s * (250 + k * 70)},${190 + k * 18} L${s * (262 + k * 60)},${292 + k * 10} Z`} fill={v.col} stroke="#ffd8a0" strokeWidth={1.2} opacity={0.9} />)}
		</g>)}</g>
		<FrontFace T={T} v={v} draw={draw} open={open} eye="angry" brow="angry" mouth="set" />
		<Garment T={T} v={v} draw={draw} />
		{/* lava cracks on the cheek */}
		<g opacity={orn(2)}><path d="M70,40 L96,60 L84,90 L110,118" stroke="#ff9a3a" strokeWidth={3} fill="none" filter="url(#gS)" /><path d="M70,40 L96,60 L84,90 L110,118" stroke="#fff1c4" strokeWidth={1.2} fill="none" /></g>
		<g opacity={orn(1)}><path d="M0,-98 L10,-82 L0,-66 L-10,-82 Z" fill={v.col} stroke="#fff1c4" strokeWidth={1.4} /><circle cx={0} cy={-82} r={18} fill={v.col} opacity={0.4} filter="url(#gS)" /></g>
	</g>;
};

const FigAi: React.FC<FigProps> = ({T, v, draw, open, orn, late}) => (
	<g transform="rotate(16)">
		{/* a sheer veil falling over the head and down the back */}
		<g opacity={orn(0)}>
			<path d="M140,-196 C60,-262 -110,-262 -186,-150 C-256,-30 -246,200 -306,420 L-120,420 C-130,240 -150,40 -120,-60 C-90,-150 20,-206 140,-196 Z" fill={v.col} opacity={0.12} />
			{Array.from({length: 7}, (_, i) => <path key={i} d={`M${120 - i * 34},${-200 + i * 6} C${20 - i * 30},${-240 + i * 4} ${-156 - i * 10},${-126 + i * 10} ${-176 - i * 16 + 10 * Math.sin(T * 1.2 + i)},${420}`} stroke={v.hot} strokeWidth={1.2} fill="none" opacity={0.4 * draw} />)}
		</g>
		<ProfileFace T={T} v={v} draw={draw} open={0} tears={orn(0)} />
		<Garment T={T} v={v} draw={draw} />
		{/* long hair falling straight down the back */}
		<ProfileHair v={v} draw={draw} extra="M-170,-80 C-178,40 -190,200 -214,420 L-112,420 C-112,260 -104,140 -100,86 L-108,86 C-150,40 -168,-20 -170,-80 Z" />
		{[0, 1, 2].map((k) => <path key={k} d={`M${-150 + k * 14},-20 C${-160 + k * 14},120 ${-170 + k * 12},260 ${-186 + k * 14},420`} stroke={v.hot} strokeWidth={1.2} fill="none" opacity={0.45 * draw} />)}
		{/* a silver-gold pin with a pearl drop */}
		<g opacity={orn(1)} transform="translate(-60,-200) rotate(-20)"><line x1={-20} y1={0} x2={130} y2={0} stroke="url(#goldG)" strokeWidth={4} /><circle cx={-20} cy={0} r={8} fill={v.hot} /><line x1={-20} y1={0} x2={-20 + 4 * Math.sin(T * 1.6)} y2={40} stroke={GOLD} strokeWidth={1.2} /><circle cx={-20 + 4 * Math.sin(T * 1.6)} cy={46} r={6} fill="#eef2ff" /></g>
		<Earring T={T} v={v} o={orn(2)} />
	</g>
);

const FigJuA: React.FC<FigProps> = ({T, v, draw, open, orn, late}) => {
	const tr = 1.4 * Math.sin(T * 37) * Math.sin(T * 6.3);
	const spikes = Array.from({length: 23}, (_, i) => { const a = lerp(-172, -8, i / 22) * Math.PI / 180, r0 = 160, r1 = 200 + 60 * rnd(i, 2) + 30 * Math.sin(i * 1.7); return [Math.cos(a) * r0, Math.sin(a) * r0 - 14, Math.cos(a + 0.03 * Math.sin(T * 9 + i)) * r1, Math.sin(a) * r1 - 14] as const; });
	const hair = 'M-122,-30 ' + spikes.map(([x0, y0, x1, y1], i) => `L${x1.toFixed(1)},${y1.toFixed(1)} L${(spikes[i + 1] ? (x0 + spikes[i + 1][0]) / 2 : 122).toFixed(1)},${(spikes[i + 1] ? (y0 + spikes[i + 1][1]) / 2 : -30).toFixed(1)}`).join(' ') + ' Z';
	const hands = late(0);
	// the back of one hand (s = +1 right, -1 left): four fingers held together, tips at the nose, thumb hidden behind
	const back = (s: number) => { const X = (x: number) => (s * x).toFixed(1); return `M${X(6)},252 C${X(2)},190 ${X(0)},130 ${X(2)},72 Q${X(2)},38 ${X(16)},38 Q${X(29)},38 ${X(30)},62 Q${X(30)},30 ${X(44)},30 Q${X(57)},30 ${X(57)},60 Q${X(58)},36 ${X(70)},36 Q${X(83)},36 ${X(83)},66 Q${X(84)},52 ${X(94)},52 Q${X(105)},54 ${X(105)},82 C${X(110)},140 ${X(108)},196 ${X(98)},246 C${X(140)},300 ${X(180)},360 ${X(214)},440 L${X(70)},440 C${X(50)},360 ${X(24)},300 ${X(6)},252 Z`; };
	return <g>
		<path d={hair} fill="#081018" opacity={draw} />
		<Neon d={hair} v={v} draw={draw} w={2.2} />
		<FrontFace T={T} v={v} draw={draw} open={open} eye="wide" brow="up" mouth="closed" hideMouth look={0.15 * Math.sin(T * 3)} />
		<Garment T={T} v={v} draw={draw} />
		<path d={`M-98,${-70 + ((T * 30) % 80)} c6,10 10,16 0,22 c-10,-6 -6,-12 0,-22 Z`} fill={v.hot} opacity={0.9 * open} />
		<g opacity={hands} transform={`translate(${tr},${120 * (1 - out3(hands)) + tr * 0.5})`}>
			{[-1, 1].map((s) => <g key={s} transform={`rotate(${s * 3},0,250)`}>
				<path d={back(s)} fill="#0b1018" stroke={v.col} strokeWidth={10} opacity={0.3} filter="url(#gM)" />
				<path d={back(s)} fill="#0b1018" stroke={v.hot} strokeWidth={2.6} strokeLinejoin="round" />
				{[[30, 62, 150], [57, 60, 162], [83, 66, 150]].map(([x, y0, y1]) => <path key={x} d={`M${s * x},${y0} C${s * (x + 1)},${(y0 + y1) / 2} ${s * (x + 2)},${y1 - 20} ${s * (x + 3)},${y1}`} stroke={v.hot} strokeWidth={1.4} fill="none" opacity={0.6} />)}
				{[[16, 48], [44, 40], [70, 46], [94, 62]].map(([x, y]) => <path key={'n' + x} d={`M${s * (x - 7)},${y + 8} Q${s * x},${y - 6} ${s * (x + 7)},${y + 8}`} stroke={v.hot} strokeWidth={1.2} fill="none" opacity={0.55} />)}
				{[[16, 112], [44, 104], [70, 110], [94, 120]].map(([x, y]) => <path key={'k' + x} d={`M${s * (x - 8)},${y} q${s * 8},-5 ${s * 16},0`} stroke={v.hot} strokeWidth={1.1} fill="none" opacity={0.45} />)}
				<path d={`M${s * 4},258 C${s * 40},250 ${s * 70},248 ${s * 102},252`} stroke="url(#goldG)" strokeWidth={6} fill="none" strokeLinecap="round" />
				<circle cx={s * 54} cy={250} r={5} fill={v.col} stroke="#fff2c8" strokeWidth={1} />
			</g>)}
		</g>
	</g>;
};
const FigJuB: React.FC<FigProps> = ({T, v, draw, open, orn, late}) => {
	const tr = 1.4 * Math.sin(T * 37) * Math.sin(T * 6.3);
	const N = 31, sp = Array.from({length: N}, (_, i) => { const a = lerp(-174, -6, i / (N - 1)) * Math.PI / 180, r0 = 166, r1 = 196 + 46 * rnd(i, 2) + 16 * Math.sin(i * 1.7), j = 0.03 * Math.sin(T * 9 + i); return {b: [Math.cos(a) * r0, Math.sin(a) * r0 - 14] as P, t: [Math.cos(a + j) * r1, Math.sin(a + j) * r1 - 14] as P}; });
	const f = (p: P) => p[0].toFixed(1) + ',' + p[1].toFixed(1);
	const hair = 'M' + f(sp[0].b) + ' ' + sp.map((q, i) => `L${f(q.t)} L${f(i < N - 1 ? [(q.b[0] + sp[i + 1].b[0]) / 2, (q.b[1] + sp[i + 1].b[1]) / 2] : q.b)}`).join(' ') + ` C140,-110 84,-134 0,-132 C-84,-134 -140,-110 ${f(sp[0].b)} Z`;
	const hands = late(0);
	// the back of one hand (s = +1 right, -1 left): four fingers held together, tips at the nose, thumb hidden behind
	const back = (s: number) => { const X = (x: number) => (s * x).toFixed(1); return `M${X(6)},252 C${X(2)},190 ${X(0)},130 ${X(2)},72 Q${X(2)},38 ${X(16)},38 Q${X(29)},38 ${X(30)},62 Q${X(30)},30 ${X(44)},30 Q${X(57)},30 ${X(57)},60 Q${X(58)},36 ${X(70)},36 Q${X(83)},36 ${X(83)},66 Q${X(84)},52 ${X(94)},52 Q${X(105)},54 ${X(105)},82 C${X(110)},140 ${X(108)},196 ${X(98)},246 C${X(140)},300 ${X(180)},360 ${X(214)},440 L${X(70)},440 C${X(50)},360 ${X(24)},300 ${X(6)},252 Z`; };
	return <g>
		<FrontFace T={T} v={v} draw={draw} open={open} eye="wide" brow="up" mouth="closed" hideMouth look={0.15 * Math.sin(T * 3)} />
		<Garment T={T} v={v} draw={draw} />
		<path d={hair} fill="url(#hairG)" opacity={draw} />
		<path d={hair} fill="url(#sheenG)" opacity={draw} />
		{Array.from({length: 9}, (_, k) => { const x = lerp(-110, 110, k / 8); return <path key={k} d={`M${x * 0.7},-128 C${x * 0.85},-170 ${x * 1.1},-196 ${x * 1.3 + 4 * Math.sin(T * 9 + k)},${-226 - 10 * rnd(k, 5)}`} stroke={v.hot} strokeWidth={1.1} fill="none" opacity={0.45 * draw} />; })}
		<Neon d={hair} v={v} draw={draw} w={2.2} L={4000} />
		<path d={`M-98,${-70 + ((T * 30) % 80)} c6,10 10,16 0,22 c-10,-6 -6,-12 0,-22 Z`} fill={v.hot} opacity={0.9 * open} />
		<g opacity={hands} transform={`translate(${tr},${120 * (1 - out3(hands)) + tr * 0.5})`}>
			{[-1, 1].map((s) => <g key={s} transform={`rotate(${s * 3},0,250)`}>
				<path d={back(s)} fill="#0b1018" stroke={v.col} strokeWidth={10} opacity={0.3} filter="url(#gM)" />
				<path d={back(s)} fill="#0b1018" stroke={v.hot} strokeWidth={2.6} strokeLinejoin="round" />
				{[[30, 62, 150], [57, 60, 162], [83, 66, 150]].map(([x, y0, y1]) => <path key={x} d={`M${s * x},${y0} C${s * (x + 1)},${(y0 + y1) / 2} ${s * (x + 2)},${y1 - 20} ${s * (x + 3)},${y1}`} stroke={v.hot} strokeWidth={1.4} fill="none" opacity={0.6} />)}
				{[[16, 48], [44, 40], [70, 46], [94, 62]].map(([x, y]) => <path key={'n' + x} d={`M${s * (x - 7)},${y + 8} Q${s * x},${y - 6} ${s * (x + 7)},${y + 8}`} stroke={v.hot} strokeWidth={1.2} fill="none" opacity={0.55} />)}
				{[[16, 112], [44, 104], [70, 110], [94, 120]].map(([x, y]) => <path key={'k' + x} d={`M${s * (x - 8)},${y} q${s * 8},-5 ${s * 16},0`} stroke={v.hot} strokeWidth={1.1} fill="none" opacity={0.45} />)}
				<path d={`M${s * 4},258 C${s * 40},250 ${s * 70},248 ${s * 102},252`} stroke="url(#goldG)" strokeWidth={6} fill="none" strokeLinecap="round" />
				<circle cx={s * 54} cy={250} r={5} fill={v.col} stroke="#fff2c8" strokeWidth={1} />
			</g>)}
		</g>
	</g>;
};
const FigJuC: React.FC<FigProps> = ({T, v, draw, open, orn, late}) => {
	const tr = 1.4 * Math.sin(T * 37) * Math.sin(T * 6.3);
	const N = 31, sp = Array.from({length: N}, (_, i) => { const a = lerp(-174, -6, i / (N - 1)) * Math.PI / 180, r0 = 166, r1 = 196 + 46 * rnd(i, 2) + 16 * Math.sin(i * 1.7), j = 0.03 * Math.sin(T * 9 + i); return {b: [Math.cos(a) * r0, Math.sin(a) * r0 - 14] as P, t: [Math.cos(a + j) * r1, Math.sin(a + j) * r1 - 14] as P}; });
	const f = (p: P) => p[0].toFixed(1) + ',' + p[1].toFixed(1);
	const hair = 'M' + f(sp[0].b) + ' ' + sp.map((q, i) => `L${f(q.t)} L${f(i < N - 1 ? [(q.b[0] + sp[i + 1].b[0]) / 2, (q.b[1] + sp[i + 1].b[1]) / 2] : q.b)}`).join(' ') + ` C140,-110 84,-134 0,-132 C-84,-134 -140,-110 ${f(sp[0].b)} Z`;
	const hands = late(0);
	return <g>
		<FrontFace T={T} v={v} draw={draw} open={open} eye="wide" brow="up" mouth="closed" hideMouth look={0.15 * Math.sin(T * 3)} />
		<Garment T={T} v={v} draw={draw} />
		{/* the mouth falls open */}
		<g opacity={draw}><ellipse cx={0} cy={92} rx={17} ry={22} fill="#05040a" stroke={v.hot} strokeWidth={2.4} /><path d="M-15,80 Q0,72 15,80" stroke={v.col} strokeWidth={2.4} fill="none" /></g>
		<path d={hair} fill="url(#hairG)" opacity={draw} />
		<path d={hair} fill="url(#sheenG)" opacity={draw} />
		{Array.from({length: 9}, (_, k) => { const x = lerp(-110, 110, k / 8); return <path key={k} d={`M${x * 0.7},-128 C${x * 0.85},-170 ${x * 1.1},-196 ${x * 1.3 + 4 * Math.sin(T * 9 + k)},${-226 - 10 * rnd(k, 5)}`} stroke={v.hot} strokeWidth={1.1} fill="none" opacity={0.45 * draw} />; })}
		<Neon d={hair} v={v} draw={draw} w={2.2} L={4000} />
		<path d={`M-98,${-70 + ((T * 30) % 80)} c6,10 10,16 0,22 c-10,-6 -6,-12 0,-22 Z`} fill={v.hot} opacity={0.9 * open} />
		{/* both hands pressed to the cheeks */}
		<g opacity={hands} transform={`translate(${tr},${60 * (1 - out3(hands)) + tr * 0.5})`}>
			{[1, -1].map((s) => <g key={s} transform={`translate(${s * 200},258) scale(${s},1) rotate(-6) scale(1.0)`}>
				<Hand T={T} v={v} spread={0.45} arm w={2.6} fill="#0b1018" />
			</g>)}
		</g>
	</g>;
};
const JU_STYLE: 'A' | 'B' | 'C' = 'A';
const FigJu: React.FC<FigProps> = (p) => JU_STYLE === 'A' ? <FigJuA {...p} /> : JU_STYLE === 'B' ? <FigJuB {...p} /> : <FigJuC {...p} />;

const FigLove: React.FC<FigProps> = ({T, v, draw, open, orn, late}) => {
	const pulse = Math.max(0, 1 - ((((T - PH) % BEAT) + BEAT) % BEAT) / 0.25);
	const cap = 'M-134,-20 C-152,-150 -86,-232 0,-232 C86,-232 152,-150 134,-20 C124,-84 100,-122 62,-138 C20,-122 -42,-112 -92,-124 C-112,-102 -128,-62 -134,-20 Z';
	const robe = 'M-60,240 C-122,258 -230,284 -290,340 C-324,372 -340,450 -348,660 L348,660 C340,450 324,372 290,340 C230,284 122,258 60,240 Z';
	const blink = (() => { const c = (T % 3.4) / 3.4; return c > 0.95 ? Math.sin((c - 0.95) / 0.05 * Math.PI) : 0; })();
	const ribbon = (sx: number, j: number) => { const c: P[] = Array.from({length: 28}, (_, i) => { const q = i / 27; return [sx * (40 + 300 * q + 30 * j), -236 + 330 * q * q + 34 * Math.sin(T * 2.2 - q * 5 + j + sx) * q] as P; }); return strip(c, (q) => lerp(16 - j * 4, 5, q)); };
	return <g transform={`rotate(${-4 + 1.6 * Math.sin(T * 1.1)},0,200) translate(0,${3 * Math.sin(T * 2.2)})`}>
		{/* two red silk ribbons tied in the bun, streaming in the wind */}
		{[1, -1].map((sx) => [0, 1].map((j) => <g key={sx + '-' + j} opacity={draw}><path d={ribbon(sx, j)} fill={j ? '#ff8aa8' : '#e0244e'} opacity={0.85} /><path d={ribbon(sx, j)} fill="none" stroke="#ffd6e4" strokeWidth={1} opacity={0.6} /></g>))}
		{/* hair gathered up into a bun */}
		<g opacity={draw}>
			<ellipse cx={0} cy={-238} rx={98} ry={58} fill="url(#hairG)" />
			<ellipse cx={0} cy={-238} rx={98} ry={58} fill="url(#sheenG)" />
			<Neon d="M-98,-238 A98,58 0 1,1 98,-238 A98,58 0 1,1 -98,-238" v={v} draw={draw} w={2} L={1000} glow={0.35} />
		</g>
		<FrontFace T={T} v={v} draw={draw} open={open} eye="calm" brow="calm" mouth="closed" look={0.05 + 0.08 * Math.sin(T * 0.7)} />
		{[1, -1].map((sx) => <ellipse key={sx} cx={sx * 68} cy={34} rx={24} ry={9} fill={v.col} opacity={0.14 * open} filter="url(#gS)" />)}
		<g opacity={orn(0)} transform="translate(0,-112)"><path d="M0,-14 C5,-5 5,5 0,12 C-5,5 -5,-5 0,-14 Z" fill={v.col} /><circle r={14} fill={v.col} opacity={0.35} filter="url(#gS)" /></g>
		{/* the hair over the crown, two soft strands by the cheeks */}
		<path d={cap} fill="url(#hairG)" opacity={draw} />
		<path d={cap} fill="url(#sheenG)" opacity={draw} />
		{[0, 1, 2, 3].map((k) => <path key={k} d={`M${-4 - k * 10},${-226 + k * 4} C${-60 - k * 12},${-214 + k * 6} ${-110 - k * 4},${-150 + k * 10} ${-122 + k * 4},${-60 + k * 10}`} stroke={v.hot} strokeWidth={1.1} fill="none" opacity={0.4 * draw} />)}
		<Neon d={cap} v={v} draw={draw} w={2.2} L={1800} />
		{[1, -1].map((sx) => <path key={sx} d={`M${sx * 116},-40 C${sx * 126},${10 + 4 * Math.sin(T * 1.4 + sx)} ${sx * 118},60 ${sx * 128},${110 + 6 * Math.sin(T * 1.2 + sx)}`} stroke={v.hot} strokeWidth={2.2} fill="none" opacity={0.8 * draw} />)}
		{/* a cross-collar robe with gold-trimmed bands; a small embroidered heart where they cross */}
		<path d={robe} fill="#1c0812" opacity={draw} />
		<Neon d={robe} v={v} draw={draw} w={2.4} L={2400} glow={0.35} />
		<path d="M-52,238 L4,336 L52,238" stroke="#fff4f8" strokeWidth={12} fill="none" opacity={0.9} />
		<path d="M78,232 L-8,366" stroke={v.col} strokeWidth={30} fill="none" />
		<path d="M-78,232 L52,446" stroke={v.col} strokeWidth={30} fill="none" />
		{[[-78, 232, 52, 446], [78, 232, -8, 366]].map(([a, b, c, d], k) => [-1, 1].map((o) => <path key={k + '-' + o} d={`M${a + o * 13},${b + (k ? 4 : -4) * o} L${c + o * 13},${d}`} stroke="url(#goldG)" strokeWidth={2.4} />))}
		{Array.from({length: 7}, (_, i) => { const q = i / 6; return [1, -1].map((sx) => <circle key={i + '-' + sx} cx={sx * lerp(140, 290, q)} cy={lerp(268, 350, q * q) + 18} r={3} fill={GOLD} opacity={0.75} />); })}
		<g transform={`translate(26,392) scale(${0.42 * (1 + 0.12 * pulse)})`} opacity={orn(2)}>
			<circle r={60} fill="url(#hotG)" opacity={0.25 + 0.45 * pulse} />
			<path d="M0,26 C-40,0 -40,-36 -14,-36 C-4,-36 0,-26 0,-20 C0,-26 4,-36 14,-36 C40,-36 40,0 0,26 Z" fill="#fff4f8" stroke={GOLD} strokeWidth={3} />
		</g>
		{/* a peony and gold pins in the bun */}
		<g opacity={orn(1)} transform={`translate(-96,-214) scale(${lerp(0.6, 1, outBack(orn(1)))})`}>
			{[0, 1].map((k) => <g key={k} transform={`rotate(${-160 + k * 30})`}><line x1={0} y1={0} x2={140} y2={0} stroke="url(#goldG)" strokeWidth={3.5} /><line x1={140} y1={0} x2={140 + 3 * Math.sin(T * 2 + k)} y2={28} stroke={GOLD} strokeWidth={1} /><circle cx={140 + 3 * Math.sin(T * 2 + k)} cy={32} r={5} fill="#fff4f8" /></g>)}
			{[[9, 46, 0.55], [7, 32, 0.75], [5, 20, 1]].map(([n, r, o], ring) => Array.from({length: n}, (_, i) => <ellipse key={ring + '-' + i} cx={0} cy={-r * 0.55} rx={r * 0.42} ry={r * 0.62} transform={`rotate(${i * 360 / n + ring * 20})`} fill={v.col} fillOpacity={0.35 + 0.2 * ring} stroke={ring === 2 ? '#fff' : v.hot} strokeWidth={1.4} opacity={o} />))}
			{Array.from({length: 7}, (_, i) => <circle key={i} cx={Math.cos(i) * 7} cy={Math.sin(i) * 7} r={2.6} fill={GOLD} />)}
		</g>
		{[1, -1].map((sx) => <g key={sx} transform={`translate(${sx * 130},12)`} opacity={orn(2)}><line x1={0} y1={0} x2={2 * Math.sin(T * 2 + sx)} y2={26} stroke={GOLD} strokeWidth={1.4} /><circle cx={2 * Math.sin(T * 2 + sx)} cy={32} r={6} fill="#fff4f8" stroke={GOLD} strokeWidth={1} /></g>)}
	</g>;
};

const FigWu: React.FC<FigProps> = ({T, v, draw, open, orn, late}) => {
	const op = late(1), N = 13, R = 238, r0 = 48, px = 124, py = 214;
	const span = 98 * lerp(0.06, 1, outBack(op)), mid = -82, A0 = mid - span / 2;
	const ang = (k: number) => (A0 + span * k / (N - 1)) * Math.PI / 180;
	const Pt = (a: number, rr: number) => `${(px + Math.cos(a) * rr).toFixed(1)},${(py + Math.sin(a) * rr).toFixed(1)}`;
	const seg = (k: number) => { const am = (ang(k) + ang(k + 1)) / 2; return `M${Pt(ang(k), r0)} L${Pt(ang(k), R)} Q${Pt(am, R + 24)} ${Pt(ang(k + 1), R)} L${Pt(ang(k + 1), r0)} Z`; };
	let edge = `M${Pt(ang(0), R)}`; for (let k = 0; k < N - 1; k++) edge += ` Q${Pt((ang(k) + ang(k + 1)) / 2, R + 24)} ${Pt(ang(k + 1), R)}`;
	const vine = Array.from({length: 13}, (_, i) => { const u = i / 12, a = lerp(ang(0), ang(N - 1), 0.08 + 0.84 * u), rr = 168 + 24 * Math.sin(u * Math.PI * 2.5); return [px + Math.cos(a) * rr, py + Math.sin(a) * rr] as P; });
	return <g>
		{/* a high bun on a full head of hair, long gold pins */}
		<g opacity={draw}>
			<ellipse cx={-50} cy={-262} rx={64} ry={50} fill="url(#hairG)" />
			<ellipse cx={-50} cy={-262} rx={64} ry={50} fill="url(#sheenG)" />
			<Neon d="M-114,-262 A64,50 0 1,1 14,-262 A64,50 0 1,1 -114,-262" v={v} draw={draw} w={2.2} />
		</g>
		<g opacity={orn(0)}>{[0, 1, 2].map((k) => <g key={k} transform={`translate(-50,-270) rotate(${-156 + k * 22})`}><line x1={-30} y1={0} x2={160} y2={0} stroke="url(#goldG)" strokeWidth={3.5} /><path d="M160,0 L178,-6 L178,6 Z" fill={v.col} /></g>)}</g>
		<ProfileFace T={T} v={v} draw={draw} open={open} look={-1} lips={false} />
		<Garment T={T} v={v} draw={draw} />
		<ProfileHair v={v} draw={draw} />
		<Earring T={T} v={v} o={orn(0)} />
		{/* the fan, raised to the eyes */}
		{op > 0 && <g opacity={cl01(op * 3)} transform={`rotate(${-3 + 1.5 * Math.sin(T * 1.4)},${px},${py})`}>
			<path d={edge} fill="none" stroke={v.col} strokeWidth={16} opacity={0.35} filter="url(#gM)" />
			{Array.from({length: N - 1}, (_, k) => <path key={k} d={seg(k)} fill={k % 2 ? '#0d1a09' : '#060d04'} />)}
			<g opacity={cl01((op - 0.5) * 2)}>
				<path d={'M' + vine.map((p) => p.map((q) => q.toFixed(1)).join(',')).join(' L')} stroke={v.col} strokeWidth={3} fill="none" strokeLinejoin="round" />
				{vine.slice(1, -1).map(([x, y], i) => <path key={i} d={`M${x},${y} l${i % 2 ? 10 : -10},${-18} l${i % 2 ? 6 : -6},${20} Z`} fill={v.hot} />)}
				<path d={`M${Pt(ang(N - 1) - 0.25, 105)} A105,105 0 0,0 ${Pt(ang(N - 1) - 0.62, 105)}`} stroke={v.hot} strokeWidth={2} fill="none" opacity={0.6} />
			</g>
			{Array.from({length: N}, (_, k) => <line key={'r' + k} x1={px + Math.cos(ang(k)) * 30} y1={py + Math.sin(ang(k)) * 30} x2={px + Math.cos(ang(k)) * R} y2={py + Math.sin(ang(k)) * R} stroke={k === 0 || k === N - 1 ? 'url(#goldG)' : v.hot} strokeWidth={k === 0 || k === N - 1 ? 7 : 1.2} opacity={k === 0 || k === N - 1 ? 1 : 0.35} />)}
			{/* iron blades past the leaf */}
			{Array.from({length: N}, (_, k) => { const a = ang(k), l = 40 + (k % 2 ? 0 : 18) + (k === 0 || k === N - 1 ? 20 : 0), nx = -Math.sin(a) * 5, ny = Math.cos(a) * 5; const bx = px + Math.cos(a) * (R - 6), by = py + Math.sin(a) * (R - 6); return <path key={'b' + k} d={`M${(bx + nx).toFixed(1)},${(by + ny).toFixed(1)} L${(px + Math.cos(a) * (R + l)).toFixed(1)},${(py + Math.sin(a) * (R + l)).toFixed(1)} L${(bx - nx).toFixed(1)},${(by - ny).toFixed(1)} Z`} fill="#dfe8d4" stroke={v.col} strokeWidth={1} />; })}
			<path d={edge} fill="none" stroke={v.hot} strokeWidth={2.4} />
			<path d={`M${Pt(ang(0), r0)} A${r0},${r0} 0 0,1 ${Pt(ang(N - 1), r0)}`} stroke="url(#goldG)" strokeWidth={3} fill="none" />
			<circle cx={px} cy={py} r={16} fill="url(#goldG)" /><circle cx={px} cy={py} r={7} fill={v.col} />
			{/* a jade tassel */}
			<g transform={`translate(${px},${py}) rotate(${6 * Math.sin(T * 1.6)})`}><line x1={0} y1={14} x2={0} y2={70} stroke={GOLD} strokeWidth={1.6} /><circle cx={0} cy={78} r={10} fill={v.col} stroke="#fff2c8" strokeWidth={1} />{[-6, -2, 2, 6].map((x) => <line key={x} x1={x * 0.6} y1={88} x2={x * 1.4} y2={150} stroke={v.col} strokeWidth={1.4} opacity={0.8} />)}</g>
		</g>}
	</g>;
};

const FigYu: React.FC<FigProps> = ({T, v, draw, open, orn, late}) => (
	<g>
		{/* peacock crown: a fan of eye-feathers */}
		<g opacity={late(0)} transform={`scale(${lerp(0.6, 1, outBack(late(0)))})`}>
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
		<Garment T={T} v={v} draw={draw} />
		{/* coin earrings */}
		<g opacity={orn(1)}>{[1, -1].map((s) => <g key={s} transform={`translate(${s * 130},${30 + 6 * Math.sin(T * 2 + s)})`}><line x1={0} y1={-30} x2={0} y2={0} stroke={GOLD} strokeWidth={1.4} /><circle r={16} fill="url(#goldG)" /><rect x={-5} y={-5} width={10} height={10} fill="#1a0a2c" /></g>)}</g>
		{/* off-shoulder neckline with a jewelled chain */}
		<g opacity={orn(2)}>{Array.from({length: 13}, (_, i) => { const u = i / 12, x = lerp(-260, 260, u), y = 330 + 90 * Math.sin(Math.PI * u); return <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 8 : 4} fill={i % 3 === 0 ? v.col : GOLD} />; })}</g>
	</g>
);

/** 欲's reaching hand, in the foreground */
const ReachHand: React.FC<{T: number; v: Voice; u: number}> = ({T, v, u}) => {
	if (u <= 0) return null;
	const k = out3(u), x = lerp(2020, 1760, k), y = lerp(1300, 1020, k);
	return <g transform={`translate(${x},${y}) rotate(-24) scale(1.25)`} opacity={cl01(u * 2)}>
		<Hand T={T} v={v} spread={1.1} nails rings arm />
		<circle cx={-20} cy={-200} r={60} fill="url(#hotG)" opacity={0.2 + 0.12 * Math.sin(T * 3)} />
	</g>;
};


// ---------------------------------------------------------------- the five stages
/** 否认: deep in a hood, turned away; behind her the clock spins and stops dead — time frozen */
const FigDen: React.FC<FigProps> = ({T, v, draw, open, orn}) => {
	const hood = 'M156,-150 C130,-266 -40,-306 -156,-236 C-262,-166 -262,50 -300,430 L-96,430 C-108,260 -96,130 -72,46 C-58,-36 -36,-110 24,-150 C76,-180 124,-176 156,-150 Z';
	return <g>
		<ProfileFace T={T} v={v} draw={draw} open={0} look={-1} />
		<Garment T={T} v={v} draw={draw} />
		<path d={hood} fill="#08121a" opacity={draw} />
		<path d={hood} fill="url(#sheenG)" opacity={draw * 0.8} />
		{[0, 1, 2, 3].map((k) => <path key={k} d={`M${120 - k * 40},${-176 - k * 14} C${-10 - k * 30},${-210 - k * 6} ${-170 - k * 10},${-120 + k * 10} ${-200 - k * 18},${430}`} stroke={v.hot} strokeWidth={1.2} fill="none" opacity={0.4 * draw} />)}
		<Neon d={hood} v={v} draw={draw} w={2.6} L={3000} />
		<path d="M156,-150 C124,-176 76,-180 24,-150 C-36,-110 -58,-36 -72,46" stroke="url(#goldG)" strokeWidth={3} fill="none" />
		<g opacity={orn(0)} transform={`translate(30,${330 + 4 * Math.sin(T * 1.4)})`}>
			<path d="M-70,-90 C-50,-40 -20,-30 0,-34" stroke={GOLD} strokeWidth={1.6} fill="none" />
			<circle r={38} fill="#0c1820" stroke="url(#goldG)" strokeWidth={5} /><circle cy={-42} r={6} fill="url(#goldG)" />
			<line x1={0} y1={0} x2={0} y2={-22} stroke={v.hot} strokeWidth={2.4} /><line x1={0} y1={0} x2={14} y2={8} stroke={v.hot} strokeWidth={2.4} />
			<path d="M-20,-24 L-6,-6 L-14,6 L4,26" stroke="#fff" strokeWidth={1.4} fill="none" opacity={0.8} />
		</g>
	</g>;
};
/** 愤怒: a roar — hair flaring out like fire, eyes burning, the face cracked with red light */
const FigAng: React.FC<FigProps> = ({T, v, draw, open, orn, late}) => {
	const N = 11, tongues = Array.from({length: N}, (_, i) => { const u = i / (N - 1), x = lerp(-300, 300, u), peak = 1 - Math.abs(u - 0.5) * 2; return {x, tip: -170 - 120 * peak - 80 * peak * peak - 26 * Math.sin(T * 6 + i * 1.7), lean: (u - 0.5) * 260 + 16 * Math.sin(T * 5 + i)}; });
	const valley = (i: number) => { const u = (i + 0.5) / (N - 1); return {x: lerp(-300, 300, u) * 0.82, y: -170 - 40 * (1 - Math.abs(u - 0.5) * 2)}; };
	const top = tongues.map(({x, tip, lean}, i) => { const vx = i < N - 1 ? valley(i) : {x: 168, y: -110}; return `Q${x - 22 + lean * 0.3},${(tip - 140) * 0.5 - 40} ${x + lean},${tip} Q${x + 26 + lean * 0.4},${(tip + vx.y) / 2} ${vx.x},${vx.y}`; }).join(' ');
	const hair = `M-122,-40 C-150,-70 -200,-96 -240,-110 ${top} C160,-96 134,-70 122,-40 C110,-90 70,-118 0,-122 C-70,-118 -110,-90 -122,-40 Z`;
	const cracks = ['M-30,-150 L-44,-110 L-28,-80 L-52,-40', 'M74,-20 L96,10 L84,40 L104,74', 'M-80,30 L-60,52 L-74,80'];
	return <g transform={`translate(${3 * Math.sin(T * 31)},${2 * Math.sin(T * 27)})`}>
		<path d={hair} fill={v.col} opacity={0.3 * draw} filter="url(#gL)" />
		<path d={hair} fill="url(#hairG)" opacity={draw} />
		<path d={hair} fill="url(#sheenG)" opacity={draw} />
		{Array.from({length: 13}, (_, k) => { const x0 = lerp(-110, 110, k / 12), x1 = lerp(-340, 340, k / 12); return <path key={k} d={`M${x0},-122 C${x0 * 1.3},-170 ${x1 * 0.9 + 10 * Math.sin(T * 5 + k)},-230 ${x1},${-230 - 110 * (1 - Math.abs(k - 6) / 6)}`} stroke={k % 3 ? v.hot : '#fff1c4'} strokeWidth={1.4} fill="none" opacity={0.55 * draw} />; })}
		<Neon d={hair} v={v} draw={draw} w={2.8} L={5000} />
		<FrontFace T={T} v={v} draw={draw} open={open} eye="angry" brow="angry" mouth="roar" />
		{[1, -1].map((s) => <g key={s}><ellipse cx={s * 48} cy={-24} rx={44} ry={13} fill={v.col} opacity={0.85 * open} filter="url(#gM)" /><ellipse cx={s * 48} cy={-24} rx={10} ry={4} fill="#fff" opacity={0.9 * open} /></g>)}
		<Garment T={T} v={v} draw={draw} />
		{(() => { const a = late(3), L = 180; return <g opacity={a > 0 ? 1 : 0}>{cracks.map((d, i) => <g key={i}><path d={d} stroke={v.col} strokeWidth={10} fill="none" opacity={0.8 * (0.7 + 0.3 * Math.sin(T * 8 + i))} filter="url(#gS)" strokeDasharray={L} strokeDashoffset={L * (1 - a)} /><path d={d} stroke="#fff1e0" strokeWidth={2} fill="none" strokeDasharray={L} strokeDashoffset={L * (1 - a)} /></g>)}<circle cx={-30} cy={-60} r={120 * a} fill={v.col} opacity={0.35 * (1 - a)} filter="url(#gM)" /></g>; })()}
	</g>;
};
/** 讨价还价: a headscarf and a fringe of gold coins on the brow — she has something to offer; looking up, pleading */
const FigBar: React.FC<FigProps> = ({T, v, draw, open, orn, late}) => {
	const scarf = 'M-152,-30 C-172,-190 -90,-262 0,-262 C90,-262 172,-190 152,-30 C170,90 196,200 226,320 L-226,320 C-196,200 -170,90 -152,-30 Z';
	return <g>
		<path d={scarf} fill="#1c1408" opacity={draw} /><path d={scarf} fill="url(#sheenG)" opacity={draw * 0.8} />
		{[0, 1, 2].map((k) => [1, -1].map((s) => <path key={k + '' + s} d={`M${s * (60 + k * 30)},-250 C${s * (150 + k * 20)},-200 ${s * (170 + k * 12)},40 ${s * (200 + k * 10)},320`} stroke={v.hot} strokeWidth={1.2} fill="none" opacity={0.4} />))}
		<Neon d={scarf} v={v} draw={draw} w={2.4} L={2600} />
		<FrontFace T={T} v={v} draw={draw} open={open} eye="sad" brow="up" mouth="part" look={0} />
		<Garment T={T} v={v} draw={draw} />
		{/* the band and its coins */}
		<path d="M-142,-112 C-90,-176 90,-176 142,-112" stroke="url(#goldG)" strokeWidth={8} fill="none" />
		<g opacity={orn(0)}>{Array.from({length: 13}, (_, i) => { const u = i / 12, x = lerp(-130, 130, u), y = -112 - 54 * Math.sin(Math.PI * u) + 8, sw = 3 * Math.sin(T * 2.2 + i * 0.7), len = 16 + 10 * Math.sin(Math.PI * u); return <g key={i}><line x1={x} y1={y} x2={x + sw} y2={y + len} stroke={GOLD} strokeWidth={1.2} /><circle cx={x + sw} cy={y + len + 9} r={9} fill="url(#goldG)" stroke="#7a5a20" strokeWidth={1} /><rect x={x + sw - 2.5} y={y + len + 6.5} width={5} height={5} fill="#1c1408" /></g>; })}</g>
		<g opacity={orn(0)}><path d="M-10,-132 L0,-148 L10,-132 L0,-116 Z" fill={v.col} stroke="#fff0c8" strokeWidth={1.2} /></g>
	</g>;
};
/** 沮丧: head bowed low, eyes shut, a tear; a cloud pours on her and the water rises to her chin */
const FigDep: React.FC<FigProps> = ({T, v, draw, open, orn}) => (
	<g transform="rotate(24)">
		<ProfileFace T={T} v={v} draw={draw} open={0} tears={0} />
		<Garment T={T} v={v} draw={draw} />
		<ProfileHair v={v} draw={draw} extra="M-170,-80 C-178,40 -190,200 -214,420 L-112,420 C-112,260 -104,140 -100,86 L-108,86 C-150,40 -168,-20 -170,-80 Z" />
	</g>
);
/** 接受: eyes closed, a small smile, hair loose, a lotus in the hair; the sun rising behind her, doves lifting off */
const FigAcc: React.FC<FigProps> = ({T, v, draw, open, orn, late}) => {
	const lock = (s: number, x0: number, y0: number, len: number, drift: number, amp: number, w0: number, ph: number) => {
		const n = 24, L: P[] = [], R: P[] = [];
		for (let i = 0; i <= n; i++) { const u = i / n, y = y0 + len * u, x = s * (x0 + drift * u + amp * Math.sin(u * Math.PI * 2 + ph + T * 0.9) * Math.min(1, u * 3)), w = u < 0.15 ? lerp(w0 * 0.25, w0, Math.sin(u / 0.15 * Math.PI / 2)) : lerp(w0, 12, Math.pow((u - 0.15) / 0.85, 1.4)); L.push([x - w / 2, y]); R.push([x + w / 2, y]); }
		return 'M' + L.map((p) => p.map((q) => q.toFixed(1)).join(',')).join(' L') + ' L' + R.reverse().map((p) => p.map((q) => q.toFixed(1)).join(',')).join(' L') + ' Z';
	};
	const cap = 'M-136,-10 C-150,-150 -86,-232 0,-232 C86,-232 150,-150 136,-10 C126,-80 96,-128 4,-140 C-90,-128 -126,-80 -136,-10 Z';
	const locks = [[-1, 140, -20, 380, 90, 26, 50, 0], [1, 140, -20, 380, 90, 26, 50, 1.4]].map(([s, ...a]) => lock(s, ...(a as [number, number, number, number, number, number, number])));
	return <g transform={`rotate(${2 * Math.sin(T * 0.8)},0,200)`}>
		<FrontFace T={T} v={v} draw={draw} open={open} eye="happy" brow="calm" mouth="smile" />
		<Garment T={T} v={v} draw={draw} />
		{locks.map((d, k) => <g key={k} opacity={draw}><path d={d} fill="url(#hairG)" /><path d={d} fill="url(#sheenG)" opacity={0.8} /><path d={d} fill="none" stroke={v.hot} strokeWidth={1.4} opacity={0.8} /></g>)}
		<path d={cap} fill="url(#hairG)" opacity={draw} /><path d={cap} fill="url(#sheenG)" opacity={draw} />
		{[0, 1, 2].map((k) => <path key={k} d={`M${4 - k * 8},-226 C${-50 - k * 14},-214 ${-110 - k * 4},-150 ${-124 + k * 6},-50`} stroke={v.hot} strokeWidth={1.1} fill="none" opacity={0.4 * draw} />)}
		{[0, 1, 2].map((k) => <path key={'r' + k} d={`M${12 + k * 8},-226 C${60 + k * 14},-214 ${116 + k * 4},-150 ${124 - k * 6},-50`} stroke={v.hot} strokeWidth={1.1} fill="none" opacity={0.4 * draw} />)}
		<Neon d={cap} v={v} draw={draw} w={2.2} L={1800} />
		<g opacity={orn(0)} transform={`translate(-112,-176) scale(${lerp(0.25, 1, outBack(late(3)))}) rotate(${-30 * (1 - late(3))})`}>{[[8, 30, 0.6], [6, 20, 0.9]].map(([n, r, o], ring) => Array.from({length: n}, (_, i) => <path key={ring + '-' + i} transform={`rotate(${i * 360 / n + ring * 22})`} d={`M0,0 C${-r * 0.4},${-r * 0.5} ${-r * 0.3},${-r} 0,${-r * 1.1} C${r * 0.3},${-r} ${r * 0.4},${-r * 0.5} 0,0 Z`} fill="#fff6f0" fillOpacity={0.5 + 0.2 * ring} stroke={v.col} strokeWidth={1.2} opacity={o} />))}<circle r={6} fill={GOLD} /></g>
		{[1, -1].map((sx) => <g key={sx} transform={`translate(${sx * 130},12)`} opacity={orn(0)}><line x1={0} y1={0} x2={2 * Math.sin(T * 2 + sx)} y2={26} stroke={GOLD} strokeWidth={1.4} /><circle cx={2 * Math.sin(T * 2 + sx)} cy={32} r={6} fill="#fff6f0" stroke={GOLD} strokeWidth={1} /></g>)}
	</g>;
};

// ---------------------------------------------------------------- the seven sins
const body = (v: Voice, draw: number, fill: string) => <><path d={BODY_F} fill={fill} opacity={draw} /><Neon d={BODY_F} v={v} draw={draw} w={2.2} L={2400} glow={0.35} /></>;
/** 傲慢: chin up, eyes half shut, a towering lace collar; a crown comes down onto her head */
const FigPri: React.FC<FigProps> = ({T, v, draw, open, orn, late}) => {
	const c = late(3), hair = 'M-128,-30 C-152,-210 -60,-310 22,-310 C112,-310 152,-210 130,-30 C120,-112 80,-150 0,-152 C-80,-150 -118,-112 -128,-30 Z';
	return <g>
		{/* the standing lace collar fanning out behind the head */}
		<g opacity={draw}>{Array.from({length: 17}, (_, i) => { const a = lerp(-172, -8, i / 16) * Math.PI / 180; return <line key={i} x1={0} y1={210} x2={Math.cos(a) * 340} y2={210 + Math.sin(a) * 340} stroke={v.hot} strokeWidth={1.2} opacity={0.6} />; })}
			<path d={Array.from({length: 33}, (_, i) => { const a = lerp(-172, -8, i / 32) * Math.PI / 180, r = 340 + (i % 2 ? 18 : 0); return `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)},${(210 + Math.sin(a) * r).toFixed(1)}`; }).join(' ')} fill="none" stroke="url(#goldG)" strokeWidth={3} />
			<path d={`M${Math.cos(-172 * Math.PI / 180) * 340},${210 + Math.sin(-172 * Math.PI / 180) * 340} A340,340 0 0,1 ${Math.cos(-8 * Math.PI / 180) * 340},${210 + Math.sin(-8 * Math.PI / 180) * 340} L0,210 Z`} fill={v.col} opacity={0.08} /></g>
		<path d={hair} fill="url(#hairG)" opacity={draw} /><path d={hair} fill="url(#sheenG)" opacity={draw} /><Neon d={hair} v={v} draw={draw} w={2.2} L={2000} />
		<FrontFace T={T} v={v} draw={draw} open={open} eye="lidded" brow="arch" mouth="closed" look={0} />
		{body(v, draw, '#140a20')}
		{/* ermine trim across the shoulders */}
		<path d="M-300,346 C-150,300 150,300 300,346" stroke="#f4f0ff" strokeWidth={28} fill="none" opacity={0.9} />
		{Array.from({length: 11}, (_, i) => { const x = lerp(-260, 260, i / 10), y = 330 - 30 * Math.sin(Math.PI * i / 10); return <path key={i} d={`M${x},${y - 6} l-4,10 l8,0 Z`} fill="#140a20" />; })}
		{/* the crown, coming down on the beat */}
		<g transform={`translate(0,${-318 - 260 * (1 - out3(c))})`} opacity={c > 0 ? 1 : 0}>
			<path d="M-96,0 L-96,-56 L-62,-22 L-32,-80 L0,-34 L32,-80 L62,-22 L96,-56 L96,0 Z" fill="url(#goldG)" stroke="#7a5a20" strokeWidth={2} />
			{[-62, 0, 62].map((x, i) => <circle key={i} cx={x} cy={-14} r={9} fill={v.col} stroke="#fff" strokeWidth={1.4} />)}
			{[-96, -32, 32, 96].map((x) => <circle key={x} cx={x} cy={x === -96 || x === 96 ? -60 : -84} r={6} fill="#fff" />)}
			{c > 0.95 && <circle r={160} fill="url(#hotG)" opacity={0.4} />}
		</g>
	</g>;
};
/** 嫉妒: in profile, a sharp bob, a side-long look back; a snake necklace; her eyes turn green on the beat */
const FigEnv: React.FC<FigProps> = ({T, v, draw, open, orn, late}) => {
	const g = late(3);
	return <g>
		<ProfileFace T={T} v={v} draw={draw} open={open} look={-1} />
		<path d="M64,262 C96,320 170,344 230,372 C270,396 288,470 294,640 L-290,640 C-284,470 -262,396 -206,366 C-146,342 -104,322 -92,262 C-40,296 30,296 64,262 Z" fill="#06180c" opacity={draw} />
		<ProfileHair v={v} draw={draw} />
		<path d="M110,-186 C80,-150 40,-140 0,-146 C40,-160 70,-176 96,-196 Z" fill="url(#hairG)" opacity={draw} />
		{/* the snake necklace */}
		<path d="M-90,200 C-40,240 60,236 76,190 C86,160 60,150 40,170" stroke={v.col} strokeWidth={9} fill="none" opacity={draw} />
		<path d="M-90,200 C-40,240 60,236 76,190 C86,160 60,150 40,170" stroke={v.hot} strokeWidth={2} fill="none" strokeDasharray="4 8" opacity={draw} />
		<g transform="translate(40,170) rotate(-150)"><path d="M0,-8 C14,-10 24,-4 26,0 C24,4 14,10 0,8 Z" fill={v.col} stroke={v.hot} strokeWidth={1.4} /><circle cx={16} cy={-2} r={2.6} fill={g > 0 ? '#fff' : v.deep} /></g>
		{/* the eye catches green */}
		<g transform="translate(108,-94)" opacity={g}><ellipse rx={70 + 30 * Math.sin(T * 6)} ry={20} fill={v.col} opacity={0.75} filter="url(#gM)" /><ellipse rx={10} ry={5} fill="#eaffee" /></g>
		<Earring T={T} v={v} o={orn(0)} />
	</g>;
};
/** 懒惰: lying on her side on a pillow, sleep mask pushed up; her eyes fall shut on the beat; a clock melts */
const FigSlo: React.FC<FigProps> = ({T, v, draw, open, orn, late}) => {
	const z = late(3);
	return <g>
		<g transform="rotate(-62,0,120)">
			<ellipse cx={-210} cy={10} rx={110} ry={210} fill="#0c1a22" stroke={v.hot} strokeWidth={2} opacity={draw} />
			{[0, 1, 2].map((k) => <path key={k} d={`M${-250 + k * 30},-150 C${-260 + k * 30},-40 ${-260 + k * 30},60 ${-250 + k * 30},170`} stroke={v.hot} strokeWidth={1} fill="none" opacity={0.4} />)}
			<path d="M-130,-20 C-146,-170 -70,-232 0,-232 C70,-232 146,-170 130,-20 C120,-100 80,-130 0,-134 C-80,-130 -120,-100 -130,-20 Z" fill="url(#hairG)" opacity={draw} />
			<FrontFace T={T} v={v} draw={draw} open={open * (1 - z)} eye="lidded" brow="calm" mouth="closed" />
			{body(v, draw, '#0c1a22')}
			{/* sleep mask pushed up on the forehead */}
			<path d="M-118,-112 C-60,-140 60,-140 118,-112" stroke="#0c1a22" strokeWidth={34} fill="none" /><path d="M-118,-112 C-60,-140 60,-140 118,-112" stroke={v.hot} strokeWidth={2} fill="none" />
			{[1, -1].map((s) => <ellipse key={s} cx={s * 46} cy={-124} rx={34} ry={14} fill="#16303e" stroke={v.hot} strokeWidth={1.6} />)}
		</g>
		{/* a clock melting over an edge */}
		<g transform="translate(-230,-300) rotate(-8)" opacity={orn(0)}>
			<line x1={-120} y1={40} x2={120} y2={40} stroke={v.hot} strokeWidth={2} opacity={0.6} />
			<path d={`M-70,0 C-70,-50 70,-50 70,0 C70,30 50,40 30,40 C20,${40 + 90 * z} 10,${50 + 120 * z} 0,${60 + 130 * z} C-8,${50 + 100 * z} -14,${40 + 60 * z} -20,40 C-50,40 -70,30 -70,0 Z`} fill="#0c1a22" stroke="url(#goldG)" strokeWidth={3} />
			<line x1={0} y1={-6} x2={-6} y2={-34} stroke={v.hot} strokeWidth={2.4} /><line x1={0} y1={-6} x2={30} y2={6 + 40 * z} stroke={v.hot} strokeWidth={2.4} />
		</g>
		{z > 0 && [0, 1, 2].map((k) => { const ph = ((T * 0.4 + k / 3) % 1); return <text key={k} x={140 + k * 30 + ph * 60} y={-120 - ph * 200} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 40 + k * 14}} fill={v.hot} opacity={z * Math.sin(Math.PI * ph)}>z</text>; })}
	</g>;
};
/** 贪婪: eyes wide with gold in them, chains of gold over the hair and throat; coins pour down on the beat */
const FigGre: React.FC<FigProps> = ({T, v, draw, open, orn, late}) => {
	const c = late(3), cap = 'M-132,-20 C-148,-170 -76,-236 0,-236 C76,-236 148,-170 132,-20 C124,-96 84,-132 0,-136 C-84,-132 -124,-96 -132,-20 Z';
	return <g>
		<path d="M-140,-40 C-160,-180 -80,-240 0,-240 C80,-240 160,-180 140,-40 C150,80 156,200 170,300 L-170,300 C-156,200 -150,80 -140,-40 Z" fill="url(#hairG)" opacity={draw} />
		<FrontFace T={T} v={v} draw={draw} open={open} eye="wide" brow="up" mouth="part" />
		{[1, -1].map((s) => <circle key={s} cx={s * 48} cy={-24} r={5} fill={GOLD} opacity={open} />)}
		{body(v, draw, '#1a1404')}
		<path d={cap} fill="url(#hairG)" opacity={draw} /><Neon d={cap} v={v} draw={draw} w={2} L={1800} />
		{/* gold chains over the hair, layered necklaces */}
		{[0, 1, 2].map((k) => <path key={k} d={`M${-128 + k * 6},${-110 + k * 26} C-60,${-150 + k * 34} 60,${-150 + k * 34} ${128 - k * 6},${-110 + k * 26}`} stroke="url(#goldG)" strokeWidth={2.4} fill="none" strokeDasharray="6 4" opacity={orn(0)} />)}
		{[0, 1, 2].map((k) => <path key={'n' + k} d={`M${-70 - k * 30},${240 + k * 6} C-30,${290 + k * 30} 30,${290 + k * 30} ${70 + k * 30},${240 + k * 6}`} stroke="url(#goldG)" strokeWidth={4 - k} fill="none" opacity={orn(0)} />)}
		{/* the coins, falling round her and piling up */}
		{c > 0 && Array.from({length: 26}, (_, i) => { const side = i % 2 ? 1 : -1, x = side * (165 + rnd(i, 91) * 110), d = cl01((c * 1.0 + (Math.max(0, T) % 3) * 0 - rnd(i, 92) * 0.5) / 0.5), y = lerp(-520, 330 - 18 * Math.floor(rnd(i, 93) * 4), out3(d)); return <g key={i} transform={`translate(${x},${y}) scale(${Math.cos(T * 6 + i)},1)`} opacity={d > 0 ? 1 : 0}><circle r={16} fill="url(#goldG)" stroke="#7a5a20" strokeWidth={1} /><rect x={-5} y={-5} width={10} height={10} fill="#1a1404" /></g>; })}
	</g>;
};
/** photo test: a cut-out internet-style photo in place of the drawn 贪婪 figure (a fictional AI face) */
const PHOTO_TEST = true;
const FigGrePhoto: React.FC<FigProps> = ({T, v, orn, late}) => {
	const c = late(3), w = 560, h = 747, x0 = -280, y0 = -250, k = w / 864;
	const glint = (x: number, y: number) => <g transform={`translate(${x0 + x * k},${y0 + y * k}) scale(${c * (0.8 + 0.2 * Math.sin(T * 9))})`}><path d="M0,-34 L7,-7 L34,0 L7,7 L0,34 L-7,7 L-34,0 L-7,-7 Z" fill="#fff" /><circle r={16} fill={GOLD} opacity={0.6} filter="url(#gM)" /></g>;
	return <g>
		<defs>
			<filter id="rimF" x="-20%" y="-20%" width="140%" height="140%"><feMorphology in="SourceAlpha" operator="dilate" radius={5} result="d" /><feFlood floodColor={v.col} /><feComposite in2="d" operator="in" result="c" /><feGaussianBlur in="c" stdDeviation={9} result="g" /><feMerge><feMergeNode in="g" /><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
			<linearGradient id="phFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.72" stopColor="#fff" /><stop offset="1" stopColor="#000" /></linearGradient>
			<mask id="phMask"><rect x={x0 - 40} y={y0 - 40} width={w + 80} height={h + 40} fill="url(#phFade)" /></mask>
		</defs>
		<g mask="url(#phMask)"><image href={PHOTO_GRE} x={x0} y={y0} width={w} height={h} filter="url(#rimF)" /></g>
		{/* gold chain */}
		{[0, 1].map((i) => <path key={i} d={`M${-70 - i * 26},${250 + i * 8} C-30,${300 + i * 30} 30,${300 + i * 30} ${70 + i * 26},${250 + i * 8}`} stroke="url(#goldG)" strokeWidth={5 - i * 1.5} fill="none" opacity={orn(0)} />)}
		{/* on the beat, both lenses catch the gold */}
		{c > 0 && <>{glint(330, 430)}{glint(530, 412)}</>}
		{c > 0 && Array.from({length: 26}, (_, i) => { const side = i % 2 ? 1 : -1, x = side * (165 + rnd(i, 91) * 110), d = cl01((c - rnd(i, 92) * 0.5) / 0.5), y = lerp(-520, 330 - 18 * Math.floor(rnd(i, 93) * 4), out3(d)); return <g key={i} transform={`translate(${x},${y}) scale(${Math.cos(T * 6 + i)},1)`} opacity={d > 0 ? 1 : 0}><circle r={16} fill="url(#goldG)" stroke="#7a5a20" strokeWidth={1} /><rect x={-5} y={-5} width={10} height={10} fill="#1a1404" /></g>; })}
	</g>;
};
/** the meme version: each meme is a cut-out "puppet" — the whole picture breathes and bounces on the beat, and a soft-masked
    copy of its head sways on its own pivot (a cheap Live2D) — plus each sin's live element and its meme line */
const MEME_MODE = true;
type Rig = {hx: number; hy: number; hr: number; px: number; py: number; move: 'hop' | 'think' | 'rage' | 'idle' | 'loot' | 'chew' | 'dream'};
const MEME: Record<string, {name: string; quip: string; rig: Rig}> = {
	pri: {name: '美团袋鼠', quip: '你的胆子真是肥嘟嘟的啊', rig: {hx: 0.47, hy: 0.3, hr: 0.3, px: 0.5, py: 0.52, move: 'hop'}},
	env: {name: '奶蛙', quip: '凭什么不是我?', rig: {hx: 0.42, hy: 0.24, hr: 0.3, px: 0.45, py: 0.45, move: 'think'}},
	ang: {name: '刀盾狗', quip: '你再说一遍?', rig: {hx: 0.55, hy: 0.32, hr: 0.2, px: 0.55, py: 0.55, move: 'rage'}},
	slo: {name: '牛来', quip: '摆烂中……', rig: {hx: 0.5, hy: 0.2, hr: 0.36, px: 0.5, py: 0.38, move: 'idle'}},
	gre: {name: '三角洲鼠鼠', quip: '再摸一个包就撤。', rig: {hx: 0.5, hy: 0.32, hr: 0.36, px: 0.5, py: 0.62, move: 'loot'}},
	glu: {name: '哈基米', quip: '曼波~就吃一点。', rig: {hx: 0.5, hy: 0.26, hr: 0.3, px: 0.5, py: 0.5, move: 'chew'}},
	lus: {name: '草地牛', quip: '再看一眼。', rig: {hx: 0.7, hy: 0.55, hr: 0.25, px: 0.6, py: 0.72, move: 'dream'}},
};
const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const FigMeme: React.FC<FigProps> = ({T, v, orn, late, t = 0}) => {
	const c = late(3), m = MEME[v.kind], k = v.kind, r = m.rig, on = orn(0);
	const pop = outBack(cl01(c / 0.6));
	const img = MEME_IMG[k], fitR = img ? Math.min(600 / img.w, 640 / img.h) : 1, iw = img ? img.w * fitR : 520, ih = img ? img.h * fitR : 640, top = 340 - ih, x0 = -iw / 2;
	// the beat: phase within the beat, and a quick pulse on each downbeat
	const bp = ((((T - PH) % BEAT) + BEAT) % BEAT) / BEAT, pulse = Math.max(0, 1 - bp / 0.18);
	let dx = 0, dy = 0, rotAll = 0, sx = 1 + 0.025 * pulse, sy = 1 - 0.04 * pulse, head = 0, hdy = 0;
	const br = Math.sin(T * 2.4);                                       // breathing
	sx += 0.012 * br; sy -= 0.016 * br;
	switch (r.move) {
		case 'hop': { const h = Math.sin(Math.PI * bp); dy = -26 * h; sy += 0.07 * (1 - h) * pulse - 0.04 * h; sx -= 0.03 * h; head = 6 * Math.sin(2 * Math.PI * bp - 0.8); break; }
		case 'think': head = -6 + 5 * Math.sin(T * 1.7); hdy = 3 * Math.sin(T * 1.7); break;
		case 'rage': rotAll = 2.2 * Math.sin(T * 37) * (0.6 + 0.4 * pulse); head = 4 * Math.sin(T * 23); dx = 4 * Math.sin(T * 29); break;
		case 'idle': head = 3 * Math.sin(T * 0.9) - 2; sx = 1 + 0.01 * br; sy = 1 - 0.018 * br; break;
		case 'loot': dx = 14 * Math.sin(Math.PI * 2 * (T - PH) / (2 * BEAT)); rotAll = 2.5 * Math.sin(Math.PI * 2 * (T - PH) / (2 * BEAT)); head = 5 * Math.sin(Math.PI * 2 * (T - PH) / BEAT); break;
		case 'chew': head = 4 * Math.abs(Math.sin(Math.PI * 2 * (T - PH) / BEAT)); hdy = 6 * Math.abs(Math.sin(Math.PI * 2 * (T - PH) / BEAT)); break;
		case 'dream': rotAll = 1.6 * Math.sin(T * 1.3); head = 5 * Math.sin(T * 1.3 + 0.9) - 3; break;
	}
	if (!on) { sx = 1; sy = 1; }
	const pvx = x0 + r.px * iw, pvy = top + r.py * ih, hx = x0 + r.hx * iw, hy = top + r.hy * ih, hr = r.hr * iw;
	const card = 'M-230,-300 H230 Q260,-300 260,-270 V310 Q260,340 230,340 H-230 Q-260,340 -260,310 V-270 Q-260,-300 -230,-300 Z';
	return <g>
		<defs>
			<filter id="memeRim" x="-20%" y="-20%" width="140%" height="140%"><feMorphology in="SourceAlpha" operator="dilate" radius={4} result="d" /><feFlood floodColor={v.col} /><feComposite in2="d" operator="in" result="c" /><feGaussianBlur in="c" stdDeviation={10} result="g" /><feMerge><feMergeNode in="g" /><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
			<radialGradient id="headG"><stop offset="0.62" stopColor="#fff" /><stop offset="1" stopColor="#000" /></radialGradient>
			<mask id="headM" maskUnits="userSpaceOnUse" x={-2000} y={-2000} width={4000} height={4000}><circle cx={hx} cy={hy} r={hr} fill="url(#headG)" /></mask>
		</defs>
		{/* the puppet */}
		<g transform={`translate(${dx},${dy}) rotate(${rotAll},0,340) translate(0,340) scale(${sx},${sy}) translate(0,-340)`}>
			{img ? <g filter="url(#memeRim)">
				<image href={img.src} x={x0} y={top} width={iw} height={ih} />
				<g transform={`translate(0,${hdy}) rotate(${head},${pvx},${pvy})`}><image href={img.src} x={x0} y={top} width={iw} height={ih} mask="url(#headM)" /></g>
			</g> : <>
				<path d={card} fill={v.deep} opacity={0.85} />
				<path d={card} fill="none" stroke={v.col} strokeWidth={4} strokeDasharray="18 12" />
				<text x={0} y={-10} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 70}} fill={v.hot}>{m.name}</text></>}
			{k === 'ang' && c > 0 && <g stroke="#fff" strokeWidth={4} fill="none" opacity={0.9}>
				<path d={`M-40,${top} L-10,${top + 200 * c} L-60,${top + 380 * c} L-20,${top + 520 * c}`} /><path d={`M-10,${top + 200 * c} L${80 * c},${top + 260 * c} L${150 * c},${top + 240 * c}`} /></g>}
		</g>
		{k === 'pri' && <g transform={`translate(${x0 + 0.5 * iw + dx},${top + 0.17 * ih + dy - 300 * (1 - out3(c))}) rotate(${head * 0.6 - 6})`} opacity={c > 0 ? 1 : 0}>
			<path d="M-90,0 L-90,-54 L-58,-22 L-30,-76 L0,-34 L30,-76 L58,-22 L90,-54 L90,0 Z" fill="url(#goldG)" stroke="#7a5a20" strokeWidth={2} />
			{[-58, 0, 58].map((x) => <circle key={x} cx={x} cy={-14} r={9} fill={v.col} stroke="#fff" strokeWidth={1.4} />)}</g>}
		{k === 'env' && c > 0 && Array.from({length: 14}, (_, i) => { const side = i % 2 ? 1 : -1, ph = (T * 0.8 + rnd(i, 5)) % 1, x = side * (330 + 30 * Math.sin(T * 3 + i)), y = 300 - ph * 640; return <path key={i} transform={`translate(${x},${y}) scale(${c * (1 - ph) * 1.4})`} d="M0,-40 C18,-14 22,8 0,28 C-22,8 -18,-14 0,-40 Z" fill={v.col} opacity={0.75} filter="url(#gM)" />; })}
		{/* 懒惰: a tear-off calendar beside it flips through the week on the half beats; it does not move */}
		{k === 'slo' && on > 0 && (() => { const f = Math.max(0, (t - 2 * BEAT) / (BEAT / 2)), day = Math.min(7, Math.floor(f)), flip = f - Math.floor(f), last = day >= 7;
			return <g transform="translate(-330,40)">
				<rect x={-95} y={-120} width={190} height={230} rx={14} fill="#f4f8ff" stroke={v.col} strokeWidth={4} />
				<rect x={-95} y={-120} width={190} height={56} rx={14} fill={v.col} /><circle cx={-40} cy={-120} r={8} fill={v.deep} /><circle cx={40} cy={-120} r={8} fill={v.deep} />
				<text x={0} y={30} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: last ? 50 : 70}} fill={v.deep}>{last ? '明天' : DAYS[day]}</text>
				<text x={0} y={-80} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 26}} fill="#fff">TO DO</text>
				{c > 0 && !last && flip < 0.5 && <g transform={`translate(0,-64) scale(1,${1 - 2 * flip})`}><rect x={-95} y={0} width={190} height={174} fill="#e6eefc" stroke={v.col} strokeWidth={2} /></g>}
			</g>; })()}
		{k === 'gre' && c > 0 && Array.from({length: 26}, (_, i) => { const side = i % 2 ? 1 : -1, x = side * (330 + rnd(i, 91) * 70), d = cl01((c - rnd(i, 92) * 0.5) / 0.5), y = lerp(-560, 320 - 22 * Math.floor(rnd(i, 93) * 5), out3(d)); return <g key={i} transform={`translate(${x},${y}) scale(${Math.cos(T * 6 + i)},1)`} opacity={d > 0 ? 1 : 0}><circle r={18} fill="url(#goldG)" stroke="#7a5a20" strokeWidth={1} /><rect x={-5} y={-5} width={10} height={10} fill="#1a1404" /></g>; })}
		{k === 'glu' && Array.from({length: 5}, (_, i) => { const d = cl01((c - i * 0.14) / 0.3), y = lerp(-500, 320 - i * 70, out3(d)); return <g key={i} transform={`translate(${390},${y}) rotate(${(i % 2 ? 4 : -4)})`} opacity={d > 0 ? 1 : 0}><rect x={-70} y={-30} width={140} height={60} rx={8} fill="#fff4e6" stroke={v.col} strokeWidth={3} /><rect x={-70} y={-30} width={140} height={14} rx={6} fill={v.col} /></g>; })}
		{k === 'lus' && c > 0 && Array.from({length: 10}, (_, i) => { const ph = (T * 0.5 + rnd(i, 7)) % 1, x = (rnd(i, 8) - 0.5) * 640, y = 300 - ph * 700; return <path key={i} transform={`translate(${x},${y}) scale(${c * (0.8 + rnd(i, 9)) * Math.sin(Math.PI * ph)})`} d="M0,12 C-30,-10 -20,-36 0,-22 C20,-36 30,-10 0,12 Z" fill={v.col} />; })}
		{/* the meme line pops in on the beat */}
		<g transform={`translate(80,${Math.max(-440, top - (k === 'pri' ? 160 : 70))}) scale(${pop})`} opacity={c > 0 ? 1 : 0}>
			{(() => { const wd = m.quip.length * 46 + 70; return <><rect x={-wd / 2} y={-50} width={wd} height={100} rx={50} fill="#fff" /><path d="M-30,46 L-60,90 L0,48 Z" fill="#fff" /><text x={0} y={16} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 46}} fill={v.deep}>{m.quip}</text></>; })()}
		</g>
	</g>;
};
/** the meme scenes' backdrop: a bold sticker disc in the sin's colour, halftone dots, slow comic rays behind */
const MemeDisc: React.FC<{T: number; v: Voice; u: number}> = ({T, v, u}) => <g transform={`scale(${lerp(0.82, 1, outBack(u))})`} opacity={cl01(u * 3)}>
	<defs>
		<radialGradient id="discG" cx="0.42" cy="0.36" r="0.75"><stop offset="0" stopColor={v.col} stopOpacity="0.95" /><stop offset="0.65" stopColor={v.col} stopOpacity="0.55" /><stop offset="1" stopColor={v.deep} /></radialGradient>
		<pattern id="dotP" width={22} height={22} patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx={11} cy={11} r={4} fill="#fff" /></pattern>
		<radialGradient id="dotFade" cx="0.7" cy="0.75" r="0.7"><stop offset="0" stopColor="#fff" stopOpacity="0.5" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
		<mask id="dotM"><circle r={380} fill="url(#dotFade)" /></mask>
	</defs>
	<radialGradient id="rayFade" gradientUnits="userSpaceOnUse" cx={0} cy={0} r={760}><stop offset="0.45" stopColor="#fff" /><stop offset="1" stopColor="#000" /></radialGradient>
	<mask id="rayM" maskUnits="userSpaceOnUse" x={-900} y={-900} width={1800} height={1800}><circle r={900} fill="url(#rayFade)" /></mask>
	<g mask="url(#rayM)"><g transform={`rotate(${T * 6})`} opacity={0.2}>{Array.from({length: 16}, (_, i) => <path key={i} transform={`rotate(${i * 22.5})`} d="M0,0 L-60,-760 L60,-760 Z" fill={v.col} />)}</g></g>
	<circle r={380} fill="url(#discG)" />
	<circle r={380} fill="url(#dotP)" mask="url(#dotM)" opacity={0.35} />
	<circle r={380} fill="none" stroke="#fff" strokeWidth={10} opacity={0.9} />
	<circle r={398} fill="none" stroke={v.col} strokeWidth={4} opacity={0.8} />
</g>;
/** 暴食: a crown of vine leaves and grapes, half-lidded and hungry; the cup beside her fills and spills over */
const FigGlu: React.FC<FigProps> = ({T, v, draw, open, orn, late}) => {
	const f = late(3), cap = 'M-134,-20 C-148,-170 -76,-234 0,-234 C76,-234 148,-170 134,-20 C126,-96 86,-132 0,-136 C-86,-132 -126,-96 -134,-20 Z';
	return <g>
		<path d="M-140,-40 C-162,-180 -80,-238 0,-238 C80,-238 162,-180 140,-40 C150,60 150,140 140,200 L-140,200 C-150,140 -150,60 -140,-40 Z" fill="url(#hairG)" opacity={draw} />
		<FrontFace T={T} v={v} draw={draw} open={open} eye="lidded" brow="calm" mouth="part" />
		{body(v, draw, '#1e0e04')}
		<path d={cap} fill="url(#hairG)" opacity={draw} /><Neon d={cap} v={v} draw={draw} w={2} L={1800} />
		{/* vine crown: leaves and grapes */}
		<g opacity={orn(0)}>{[1, -1].map((s) => <g key={s}>
			{Array.from({length: 6}, (_, i) => { const a = lerp(0.1, 1.45, i / 5), x = s * Math.cos(a) * 150, y = -120 - Math.sin(a) * 96; return <path key={i} transform={`translate(${x},${y}) rotate(${s * (30 - i * 18)})`} d="M0,-22 C14,-14 18,4 0,20 C-18,4 -14,-14 0,-22 Z" fill="#2a4a14" stroke="#9be35a" strokeWidth={1.4} />; })}
			<g transform={`translate(${s * 150},-96)`}>{[[0, 0], [-10, 14], [10, 14], [0, 28], [-10, 40], [10, 40], [0, 54]].map(([x, y], i) => <circle key={i} cx={x * s} cy={y} r={9} fill="#5a1a4a" stroke={v.hot} strokeWidth={1.2} />)}</g>
		</g>)}</g>
		{/* the cup, filling and spilling over */}
		<g transform="translate(-255,130)" opacity={orn(0)}>
			<path d="M-60,-60 C-60,0 -30,30 0,30 C30,30 60,0 60,-60 Z" fill="#1e0e04" stroke="url(#goldG)" strokeWidth={3} />
			<path d={`M-56,${-60 + 70 * (1 - f)} C-56,0 -28,26 0,26 C28,26 56,0 56,${-60 + 70 * (1 - f)} Z`} fill="#b3203a" opacity={0.9} />
			<line x1={0} y1={30} x2={0} y2={100} stroke="url(#goldG)" strokeWidth={6} /><path d="M-40,110 L40,110 L30,100 L-30,100 Z" fill="url(#goldG)" />
			{f > 0.95 && [0, 1].map((k) => { const ph = (T * 0.9 + k * 0.5) % 1; return <path key={k} d={`M${k ? 54 : -54},-58 C${k ? 70 : -70},-20 ${k ? 76 : -76},${20 + ph * 60} ${k ? 74 : -74},${40 + ph * 120}`} stroke="#b3203a" strokeWidth={6} fill="none" opacity={0.85} strokeLinecap="round" />; })}
		</g>
	</g>;
};
/** 色欲: long hair over one shoulder, a side-long look, a ribbon at the throat; a red rose opens on the beat */
const FigLus: React.FC<FigProps> = ({T, v, draw, open, orn, late}) => {
	const r = late(3), cap = 'M-134,-20 C-148,-170 -76,-234 0,-234 C76,-234 148,-170 134,-20 C124,-100 70,-138 -20,-140 C-90,-130 -126,-90 -134,-20 Z';
	const lock = 'M120,-120 C160,-40 150,60 170,160 C190,260 230,330 210,420 C180,430 150,400 140,340 C120,250 110,140 100,40 Z';
	return <g>
		<path d="M-140,-40 C-162,-180 -80,-238 0,-238 C80,-238 162,-180 140,-40 C130,40 110,100 100,140 L-100,140 C-120,60 -140,0 -140,-40 Z" fill="url(#hairG)" opacity={draw} />
		<FrontFace T={T} v={v} draw={draw} open={open} eye="lidded" brow="arch" mouth="smile" look={0.6} />
		{body(v, draw, '#1e0610')}
		<path d={lock} fill="url(#hairG)" opacity={draw} /><path d={lock} fill="url(#sheenG)" opacity={draw} /><Neon d={lock} v={v} draw={draw} w={2} L={1600} />
		<path d={cap} fill="url(#hairG)" opacity={draw} /><Neon d={cap} v={v} draw={draw} w={2} L={1800} />
		<path d="M-46,170 C-20,184 20,184 46,170" stroke={v.col} strokeWidth={8} fill="none" opacity={orn(0)} />
		{/* the rose */}
		<g transform={`translate(-60,300) scale(${lerp(0.2, 1, outBack(r))}) rotate(${-40 * (1 - r)})`} opacity={r > 0 ? 1 : 0}>
			{[[7, 44, 0.75], [6, 32, 0.9], [5, 20, 1]].map(([n, rr, o], ring) => Array.from({length: n}, (_, i) => <path key={ring + '-' + i} transform={`rotate(${i * 360 / n + ring * 26})`} d={`M0,0 C${-rr * 0.6},${-rr * 0.3} ${-rr * 0.5},${-rr} 0,${-rr} C${rr * 0.5},${-rr} ${rr * 0.6},${-rr * 0.3} 0,0 Z`} fill={v.col} fillOpacity={0.35 + 0.2 * ring} stroke={ring === 2 ? '#fff' : v.hot} strokeWidth={1.4} opacity={o} />))}
			<path d="M0,40 C10,80 0,120 -10,160" stroke="#3a8a3a" strokeWidth={4} fill="none" />
		</g>
	</g>;
};

// ---------------------------------------------------------------- halos (all 璧-like, themed)
const Halo: React.FC<{T: number; v: Voice; s: number; t: number; rv: number; lit: number}> = ({T, v: v0, s, t, rv, lit}) => {
	if (v0.kind === 'den') { const v = v0, R = 250; return <g transform={`translate(330,-120) scale(${s})`}>
		<circle r={560} fill="url(#auraG)" />
		<circle r={R} fill={v.deep} opacity={0.6} /><circle r={R} fill="none" stroke="url(#goldG)" strokeWidth={4} /><circle r={R - 46} fill="none" stroke={v.hot} strokeWidth={1.2} opacity={0.6} />
		{['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'].map((n, i) => <text key={n} x={Math.sin(i * Math.PI / 6) * (R - 24)} y={-Math.cos(i * Math.PI / 6) * (R - 24) + 9} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 600, fontSize: 26}} fill={v.hot} opacity={1}>{n}</text>)}
		{(() => { const h = t - rv, stop = 2 * BEAT, spin = h < 0 ? 0 : Math.min(h, stop) * 14, fr = h - stop; return <g>{fr > 0 && fr < 0.5 && <circle r={330 + 80 * out3(fr / 0.5)} fill="none" stroke="#fff" strokeWidth={6 * (1 - fr / 0.5)} opacity={1 - fr / 0.5} />}{fr > 0 && <path d="M-60,-300 L-20,-180 L-70,-90 L10,40 L-30,140 L40,300" stroke="#fff" strokeWidth={2} fill="none" opacity={0.7} strokeDasharray={700} strokeDashoffset={700 * (1 - out3(cl01(fr / 0.25)))} />}<line x1={0} y1={0} x2={Math.sin(-0.5 + spin) * 240} y2={-Math.cos(-0.5 + spin) * 240} stroke={v.hot} strokeWidth={4} opacity={0.8} /><line x1={0} y1={0} x2={Math.sin(2.1 + spin / 12) * 170} y2={-Math.cos(2.1 + spin / 12) * 170} stroke="url(#goldG)" strokeWidth={7} opacity={0.85} /><circle r={12} fill="url(#goldG)" /></g>; })()}
	</g>; }
	if (v0.kind === 'bar') { const v = v0, h = t - rv, a = out3(cl01((h - 2 * BEAT) / 0.35)), tilt = 9 * Math.sin(Math.max(0, h - 2 * BEAT) * 2.2) * a; return <g transform={`scale(${s})`}>
		<circle r={560} fill="url(#auraG)" />
		<circle r={340} fill="none" stroke="url(#goldG)" strokeWidth={3} /><circle r={250} fill="none" stroke={v.hot} strokeWidth={1.4} opacity={0.6} />
		<g transform={`translate(0,${-300 - 160 * (1 - a)})`} opacity={0.9 * a}><line x1={0} y1={-40} x2={0} y2={10} stroke="url(#goldG)" strokeWidth={4} /><g transform={`rotate(${tilt})`}><line x1={-260} y1={0} x2={260} y2={0} stroke="url(#goldG)" strokeWidth={5} />{[-1, 1].map((k) => <g key={k} transform={`translate(${k * 250},0) rotate(${-tilt})`}><line x1={-50} y1={90} x2={0} y2={0} stroke={GOLD} strokeWidth={1.4} /><line x1={50} y1={90} x2={0} y2={0} stroke={GOLD} strokeWidth={1.4} /><path d="M-60,90 Q0,128 60,90 Z" fill={v.deep} stroke="url(#goldG)" strokeWidth={3} />{k < 0 ? <path d="M0,92 C-24,72 -24,50 -10,50 C-4,50 0,56 0,60 C0,56 4,50 10,50 C24,50 24,72 0,92 Z" fill={v.col} stroke="#fff0c8" strokeWidth={1.4} /> : <g><path d="M-14,46 L14,46 L0,70 L14,94 L-14,94 L0,70 Z" fill="none" stroke="#fff0c8" strokeWidth={2.4} /><path d="M-8,88 L8,88 L0,76 Z" fill={v.col} />{Array.from({length: 4}, (_, q) => { const ph = (T * 1.2 + q / 4) % 1; return <circle key={q} cx={0} cy={86 - ph * 36} r={1.8} fill={v.col} opacity={1 - ph} />; })}</g>}</g>)}</g><circle cy={-44} r={8} fill="url(#goldG)" /></g>
	</g>; }
	if (v0.kind === 'acc' && !(v0 as any).__inner) { const h = t - rv - 2 * BEAT, rise = h < 0 ? 0 : ease(cl01(h / 1.4)); return <g><g transform={`translate(0,${lerp(260, 0, rise)})`} opacity={rise}><circle r={460} fill="url(#hotG)" opacity={0.75} /><circle r={300} fill="#ffd9a8" opacity={0.35} /><circle r={300} fill="none" stroke="url(#goldG)" strokeWidth={3} /></g><Halo T={T} v={{...v0, kind: 'xi', __inner: true} as any} s={s} t={t} rv={rv} lit={lit} /></g>; }
	const v = look(v0);
	const r0 = 250, r1 = 340, crack = v.kind === 'ju' || v.kind === 'nu' ? cl01((t - rv) / 1.2) : 0;
	if (v.kind === 'ai') return <g transform={`scale(${s})`}>
		{/* a pale moon instead of the disc */}
		<circle r={560} fill="url(#auraG)" />
		<circle r={340} fill={v.hot} opacity={0.18} />
		<circle r={340} fill="none" stroke={v.hot} strokeWidth={3} opacity={0.8} />
		{[[-80, -60, 50], [90, 40, 36], [20, 140, 28], [-120, 120, 22]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={v.col} opacity={0.12} />)}
	</g>;
	if (v.kind === 'yu') return <g transform={`scale(${s})`}><g transform={`rotate(${T * 6})`}>
		{/* a great square-holed coin */}
		<circle r={560} fill="url(#auraG)" />
		<circle r={r1} fill="url(#goldG)" opacity={0.35} />
		<circle r={r1} fill="none" stroke="url(#goldG)" strokeWidth={10} />
		<circle r={r1 - 26} fill="none" stroke={GOLD} strokeWidth={2} />
		<rect x={-150} y={-150} width={300} height={300} fill="#0a0612" stroke="url(#goldG)" strokeWidth={8} />
		{Array.from({length: 8}, (_, i) => <path key={i} transform={`rotate(${i * 45 + 22.5}) translate(0,${-(r1 + 12)})`} d="M0,-9 L5,0 L0,9 L-5,0 Z" fill="url(#goldG)" />)}
		</g>
	</g>;
	return <g transform={`scale(${s})`}>
		<circle r={560} fill="url(#auraG)" />
		{v.kind === 'xi' && <g transform={`rotate(${T * 10})`} opacity={0.5 + 0.5 * lit}>{Array.from({length: 24}, (_, i) => <path key={i} transform={`rotate(${i * 15})`} d={`M-10,-${r1 + 10} L0,-${r1 + 120 + 40 * Math.sin(T * 3 + i)} L10,-${r1 + 10} Z`} fill={v.col} opacity={0.6} />)}</g>}
		<path d={`M0,${-r1} A${r1},${r1} 0 1,1 -0.1,${-r1} Z M0,${-r0} A${r0},${r0} 0 1,0 0.1,${-r0} Z`} fill="url(#jadeG)" fillRule="evenodd" />
		<circle r={r1} fill="none" stroke={v.hot} strokeWidth={3} />
		<circle r={r0} fill="none" stroke={v.hot} strokeWidth={3} />
		<circle r={r1 + 14} fill="none" stroke="url(#goldG)" strokeWidth={2} opacity={0.7} />
		<g transform={`rotate(${T * 4})`}>{Array.from({length: 120}, (_, i) => { const a = i * 3 * Math.PI / 180, big = i % 10 === 0, ra = r1 - 10, rb = r1 - (big ? 40 : 22); return <line key={i} x1={Math.cos(a) * ra} y1={Math.sin(a) * ra} x2={Math.cos(a) * rb} y2={Math.sin(a) * rb} stroke={big ? GOLD : v.hot} strokeWidth={big ? 2.6 : 1} opacity={(big ? 0.95 : 0.4) * (0.6 + 0.4 * lit)} />; })}</g>
		<g transform={`rotate(${-T * 6})`}>{Array.from({length: 8}, (_, i) => <path key={i} transform={`rotate(${i * 45}) translate(0,${-(r1 + 14)})`} d="M0,-11 L6,0 L0,11 L-6,0 Z" fill="url(#goldG)" />)}</g>
		<circle r={r0 + 12} fill="none" stroke={GOLD} strokeWidth={1} opacity={0.5} />
		{crack > 0 && <g>
			{Array.from({length: 9}, (_, i) => { const a0 = rnd(i, 3) * Math.PI * 2; const pts = Array.from({length: 6}, (_, k) => { const rr = lerp(r0 - 10, r1 + 30, k / 5), a = a0 + (rnd(i * 7 + k, 4) - 0.5) * 0.25; return [Math.cos(a) * rr, Math.sin(a) * rr]; }); const len = 200; return <path key={i} d={'M' + pts.map((p) => p.join(',')).join(' L')} stroke={v.kind === 'nu' ? '#ffb070' : '#fff'} strokeWidth={2.6} fill="none" strokeDasharray={len} strokeDashoffset={len * (1 - out3(crack * 1.5 - i * 0.05))} />; })}
			{Array.from({length: 14}, (_, i) => { const a = rnd(i, 5) * Math.PI * 2, d = r1 + 20 + 380 * out3(crack) * (0.4 + rnd(i, 6)), sz = 10 + 22 * rnd(i, 7); return <path key={'s' + i} transform={`translate(${Math.cos(a) * d},${Math.sin(a) * d}) rotate(${T * 90 * (rnd(i, 8) - 0.5) + i * 40})`} d={`M0,${-sz} L${sz * 0.6},${sz * 0.3} L${-sz * 0.4},${sz * 0.7} Z`} fill={v.col} opacity={0.45} stroke={v.hot} strokeWidth={1.4} />; })}
		</g>}
		{v.kind === 'love' && Array.from({length: 2}, (_, i) => { const rr = r0 + 30 + i * 36, len = 2 * Math.PI * rr; return <circle key={i} r={rr} fill="none" stroke={v.col} strokeWidth={3} strokeDasharray={len} strokeDashoffset={len * (1 - cl01(lit * 1.4 - i * 0.12))} transform={`rotate(${-90 + i * 50 + T * 10})`} opacity={0.9} />; })}
		{v.kind === 'wu' && Array.from({length: 4}, (_, i) => { const len = 1400; const d = `M${Math.cos(i * 1.6) * r1},${Math.sin(i * 1.6) * r1} ` + Array.from({length: 10}, (_, k) => { const a = i * 1.6 + k * 0.32, rr = r1 + 14 * Math.sin(k * 2.1); return `L${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`; }).join(' '); return <path key={i} d={d} stroke={v.col} strokeWidth={4} fill="none" strokeDasharray={len} strokeDashoffset={len * (1 - cl01(lit * 1.3 - i * 0.1))} />; })}
	</g>;
};

// ---------------------------------------------------------------- worlds behind the figure
const Worlds: React.FC<{T: number; v: Voice; u: number; cx: number; cy: number}> = ({T, v, u, cx, cy}) => {
	if (u <= 0) return null;
	switch (v.kind) {
		case 'den': return <g opacity={u}>{Array.from({length: 18}, (_, i) => {
			const a = lerp(-1.75, 1.75, rnd(i, 51)), r = 330 + 260 * rnd(i, 52), x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.85, sz = 14 + 26 * rnd(i, 53), sh = 0.7 + 0.3 * Math.sin(T * 1.5 + i);
			return <g key={i}>
				<line x1={x - Math.cos(a) * sz * 3} y1={y - Math.sin(a) * sz * 2.5} x2={x} y2={y} stroke={v.hot} strokeWidth={1.4} opacity={0.35} />
				<path transform={`translate(${x},${y}) rotate(${i * 47})`} d={`M0,${-sz} L${sz * 0.7},${sz * 0.4} L${-sz * 0.5},${sz * 0.6} Z`} fill={v.col} fillOpacity={0.14} stroke={v.hot} strokeWidth={1.6} opacity={sh} />
			</g>;
		})}</g>;
		case 'xi': return <g>{Array.from({length: 3}, (_, k) => {
			const per = BEAT * 2, ph = ((T - k * per / 3) % per) / per, bx = 900 + rnd(k, 61) * 1000, by = 120 + rnd(k, 62) * 520;
			return <g key={k} opacity={u * (1 - ph)}>{Array.from({length: 16}, (_, i) => { const a = i / 16 * Math.PI * 2, r = 30 + 150 * out3(ph); return <line key={i} x1={bx + Math.cos(a) * r * 0.6} y1={by + Math.sin(a) * r * 0.6} x2={bx + Math.cos(a) * r} y2={by + Math.sin(a) * r + 30 * ph * ph} stroke={k % 2 ? v.col : '#ff6a4a'} strokeWidth={3} strokeLinecap="round" />; })}</g>;
		})}</g>;
		case 'nu': return <g opacity={u}>
			{Array.from({length: 16}, (_, i) => { const x = 820 + i * 72, h = 160 + 120 * rnd(i, 71) + 60 * Math.sin(T * 6 + i), w = 50; return <path key={i} d={`M${x - w},1090 C${x - w},${1090 - h * 0.6} ${x + 12 * Math.sin(T * 7 + i)},${1090 - h * 0.8} ${x},${1090 - h} C${x + w * 0.4},${1090 - h * 0.6} ${x + w},${1090 - h * 0.4} ${x + w},1090 Z`} fill="url(#flameG)" opacity={0.55} />; })}
			{Array.from({length: 6}, (_, i) => { const pts: P[] = [[860 + i * 180, 1080]]; for (let k = 1; k < 7; k++) pts.push([pts[k - 1][0] + (rnd(i * 9 + k, 72) - 0.5) * 90, pts[k - 1][1] - 70]); const d = 'M' + pts.map((p) => p.join(',')).join(' L'); return <g key={'c' + i}><path d={d} stroke="#ff7a2a" strokeWidth={8} fill="none" opacity={0.5} filter="url(#gM)" /><path d={d} stroke="#fff1c4" strokeWidth={2} fill="none" /></g>; })}
		</g>;
		case 'ai': return <g opacity={u}>
			{Array.from({length: 45}, (_, i) => { const sp = 1.4 + rnd(i, 81), ph = (T * sp + rnd(i, 82)) % 1, x = 760 + rnd(i, 83) * 1200 - ph * 90, y = -60 + ph * 1200; return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 46} stroke={v.hot} strokeWidth={1.4} opacity={0.45} />; })}
			{Array.from({length: 5}, (_, i) => { const ph = ((T * 0.7 + i / 5) % 1); return <ellipse key={'r' + i} cx={1000 + rnd(i, 84) * 800} cy={1020} rx={20 + 160 * ph} ry={(20 + 160 * ph) * 0.18} fill="none" stroke={v.hot} strokeWidth={1.6} opacity={0.6 * (1 - ph)} />; })}
		</g>;
		case 'ju': return <g>
			{Array.from({length: 9}, (_, i) => {
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
				{[[14, 500, 210], [10, 320, 150]].map(([n, r, w], ring) => Array.from({length: n}, (_, i) => <path key={ring + '-' + i} transform={`rotate(${(i / n) * 360 + ring * 13})`} d={`M0,0 C${-w * 0.6},${-r * 0.35} ${-w},${-r * 0.8} ${-w * 0.35},${-r} C${-w * 0.12},${-r * 1.06} ${w * 0.12},${-r * 0.94} 0,${-r * 0.9} C${w * 0.12},${-r * 0.94} ${w * 0.35},${-r * 1.06} ${w * 0.35},${-r} C${w},${-r * 0.8} ${w * 0.6},${-r * 0.35} 0,0 Z`} fill={v.col} fillOpacity={0.06 + ring * 0.04} stroke={ring % 2 ? v.hot : v.col} strokeWidth={1.8} opacity={0.6} />))}
			</g>
			{[0, 1, 2].map((k) => { const ph = ((T / (BEAT * 2)) + k / 3) % 1; return <circle key={k} cx={cx - 30} cy={cy + 300} r={60 + 700 * ph} fill="none" stroke={v.col} strokeWidth={3 * (1 - ph)} opacity={0.6 * (1 - ph) * u} />; })}
		</g>;
		case 'wu': return <g opacity={u}>
			{Array.from({length: 3}, (_, i) => { const len = 1600, x0 = i < 4 ? 1920 : 820 + i * 60, y0 = i < 4 ? 120 + i * 260 : 1080; const d = `M${x0},${y0} C${x0 - 260},${y0 - 120 + 40 * i} ${x0 - 120},${y0 - 380} ${x0 - 420 + 20 * i},${y0 - 300 - 30 * i}`; return <g key={i}>
				<path d={d} stroke={v.col} strokeWidth={5} fill="none" strokeDasharray={len} strokeDashoffset={len * (1 - out3(u * 1.2 - i * 0.05))} />
				{Array.from({length: 8}, (_, k) => { const tt = (k + 1) / 9; if (tt > u * 1.2 - i * 0.05) return null; const bx = (1 - tt) ** 3 * x0 + 3 * (1 - tt) ** 2 * tt * (x0 - 260) + 3 * (1 - tt) * tt * tt * (x0 - 120) + tt ** 3 * (x0 - 420 + 20 * i), by = (1 - tt) ** 3 * y0 + 3 * (1 - tt) ** 2 * tt * (y0 - 120 + 40 * i) + 3 * (1 - tt) * tt * tt * (y0 - 380) + tt ** 3 * (y0 - 300 - 30 * i); return <path key={k} d={`M${bx},${by} l${k % 2 ? 14 : -14},-18 l${k % 2 ? 4 : -4},20 Z`} fill={v.hot} />; })}
			</g>; })}
			{Array.from({length: 8}, (_, i) => <ellipse key={'m' + i} cx={900 + rnd(i, 91) * 1000 + 40 * Math.sin(T * 0.4 + i)} cy={200 + rnd(i, 92) * 800} rx={180} ry={70} fill={v.col} opacity={0.08} filter="url(#gL)" />)}
		</g>;
		case 'yu': return <g opacity={u}>
			{Array.from({length: 12}, (_, i) => { const ph = (T * (0.25 + 0.15 * rnd(i, 95)) + rnd(i, 96)) % 1, x = 840 + rnd(i, 97) * 1080, y = -60 + ph * 1200; return <g key={i} transform={`translate(${x},${y}) rotate(${T * 120 + i * 30}) scale(${Math.cos(T * 4 + i)},1)`}><circle r={16} fill="url(#goldG)" /><rect x={-5} y={-5} width={10} height={10} fill="#1a0a2c" /></g>; })}
			{Array.from({length: 0}, (_, i) => { const x = 900 + i * 180, lift = 40 * Math.sin(T * 1.6 + i); return <g key={'h' + i} transform={`translate(${x},${1150 - lift}) rotate(${(i - 2.5) * 7}) scale(0.5)`} opacity={0.4}><Hand T={T + i} v={v} spread={0.8} arm w={3} fill="#120a1c" glow={false} /></g>; })}
		</g>;
	}
};

// ---------------------------------------------------------------- orb moments (before the reveal)
const OrbMoment: React.FC<{T: number; v: Voice}> = ({T, v}) => {
	const c = v.hot;
	switch (v.kind) {
		case 'pri': return <g><ellipse cx={0} cy={0} rx={80} ry={110} fill="none" stroke={c} strokeWidth={4} /><path d="M-36,-30 L-36,-60 L-18,-44 L0,-70 L18,-44 L36,-60 L36,-30 Z" fill={v.col} opacity={0.8} /><path d="M-20,30 C-6,22 6,22 20,30" stroke={c} strokeWidth={3} fill="none" /><text x={0} y={150} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 22}} fill={c}>对不起?</text><line x1={-50} y1={142} x2={50} y2={142} stroke={v.col} strokeWidth={4} /></g>;
		case 'env': return <g><rect x={-70} y={-130} width={140} height={250} rx={20} fill="none" stroke={c} strokeWidth={4} /><circle cx={-30} cy={-70} r={16} fill="none" stroke={c} strokeWidth={3} /><text x={8} y={-64} style={{fontFamily: SERIF, fontWeight: 700, fontSize: 18}} fill={c}>升职啦!</text><rect x={-50} y={-40} width={100} height={70} rx={8} fill={v.col} opacity={0.5} /><path d="M30,70 c-6,-10 -20,-8 -20,4 c0,10 20,20 20,20 c0,0 20,-10 20,-20 c0,-12 -14,-14 -20,-4 Z" fill="#ff5c8a" /><text x={60} y={92} style={{fontFamily: SERIF, fontSize: 16}} fill={c}>99+</text></g>;
		case 'ang': return <g>{[-90, -30, 30, 90].map((x, i) => <g key={x}><circle cx={x} cy={-30} r={18} fill="none" stroke={c} strokeWidth={3} /><path d={`M${x - 26},40 C${x - 26},0 ${x + 26},0 ${x + 26},40`} fill="none" stroke={c} strokeWidth={3} /></g>)}<g transform={`translate(${-10 + 6 * Math.sin(T * 4)},-60)`}><circle cx={0} cy={0} r={18} fill={v.col} /><path d="M-26,70 C-26,30 26,30 26,70" fill={v.col} /></g><path d="M-130,90 L130,90" stroke={c} strokeWidth={3} /></g>;
		case 'slo': return <g><circle r={80} fill="none" stroke={c} strokeWidth={5} /><line x1={0} y1={0} x2={0} y2={-56} stroke={c} strokeWidth={5} /><line x1={0} y1={0} x2={40} y2={10} stroke={c} strokeWidth={5} />{[-1, 1].map((s) => <circle key={s} cx={s * 60} cy={-80} r={22} fill="none" stroke={c} strokeWidth={4} />)}<text x={0} y={140} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 40}} fill={v.col}>×5</text></g>;
		case 'gre': return <g><rect x={-90} y={-70} width={180} height={120} rx={14} fill="none" stroke={c} strokeWidth={4} /><text x={0} y={-10} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 34}} fill={v.col}>¥ 12,000</text><text x={0} y={30} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 22}} fill={c}>+500</text><path d="M60,90 L80,70 L100,90 M80,70 L80,120" stroke={v.col} strokeWidth={4} fill="none" /></g>;
		case 'glu': return <g><path d="M-80,-20 L80,-20 L60,80 L-60,80 Z" fill="none" stroke={c} strokeWidth={4} /><path d="M-40,-20 C-40,-60 40,-60 40,-20" fill="none" stroke={c} strokeWidth={4} /><text x={0} y={140} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 36}} fill={v.col}>01:00</text></g>;
		case 'lus': return <g><rect x={-70} y={-130} width={140} height={250} rx={20} fill="none" stroke={c} strokeWidth={4} /><rect x={-50} y={-100} width={100} height={130} rx={8} fill="none" stroke={c} strokeWidth={3} /><circle cx={0} cy={-50} r={22} fill="none" stroke={c} strokeWidth={3} /><path d="M-30,20 C-30,-10 30,-10 30,20" fill="none" stroke={c} strokeWidth={3} />{[0, 1, 2].map((k) => <circle key={k} cx={-20 + k * 20} cy={70} r={4} fill={k === 2 ? v.col : c} />)}</g>;
		case 'den': return <g><rect x={-70} y={-130} width={140} height={250} rx={20} fill="none" stroke={c} strokeWidth={4} /><rect x={-58} y={-60} width={104} height={40} rx={12} fill={v.col} opacity={0.85} /><text x={-6} y={-34} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 18}} fill="#0a1a24">我们分手吧</text><text x={44} y={-6} textAnchor="end" style={{fontFamily: SERIF, fontSize: 13}} fill={c} opacity={0.8}>已读</text></g>;
		case 'ang': return <g>{[-70, 70].map((x, k) => <g key={x}><circle cx={x} cy={-10} r={46} fill="none" stroke={c} strokeWidth={4} /><circle cx={x} cy={-24} r={14} fill="none" stroke={c} strokeWidth={3} /><path d={`M${x - 26},20 C${x - 26},-4 ${x + 26},-4 ${x + 26},20`} fill="none" stroke={c} strokeWidth={3} />{k === 1 && <path d={`M${x + 22},-56 c-6,-10 -20,-8 -20,4 c0,10 20,20 20,20 c0,0 20,-10 20,-20 c0,-12 -14,-14 -20,-4 Z`} fill={v.col} />}</g>)}<path d="M-14,-10 L14,-10 M6,-18 L14,-10 L6,-2" stroke={v.col} strokeWidth={4} fill="none" /></g>;
		case 'bar': return <g>{[0, 1, 2].map((i) => <rect key={i} x={i % 2 ? -10 : -80} y={-100 + i * 56} width={90} height={38} rx={12} fill="none" stroke={c} strokeWidth={3} />)}<text x={0} y={120} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 40}} fill={v.col}>3:00</text></g>;
		case 'dep': return <g><path d="M-90,0 L90,0 C84,70 40,100 0,100 C-40,100 -84,70 -90,0 Z" fill="none" stroke={c} strokeWidth={4} /><line x1={-100} y1={-10} x2={100} y2={-10} stroke={c} strokeWidth={3} /><line x1={30} y1={-90} x2={110} y2={-20} stroke={v.col} strokeWidth={4} /><line x1={50} y1={-96} x2={120} y2={-30} stroke={v.col} strokeWidth={4} /></g>;
		case 'acc': return <g><path d="M-100,-60 L100,-60 L84,-20 L-84,-20 Z" fill="none" stroke={c} strokeWidth={4} />{[-60, -20, 20, 60].map((x) => <path key={x} d={`M${x - 20},-20 Q${x},4 ${x + 20},-20`} fill="none" stroke={v.col} strokeWidth={3} />)}<rect x={-80} y={-10} width={160} height={110} fill="none" stroke={c} strokeWidth={4} /><rect x={-20} y={30} width={40} height={70} fill="none" stroke={c} strokeWidth={3} /><circle cx={70} cy={-110} r={20} fill={v.col} opacity={0.8} /></g>;
		case 'xi': return <g><rect x={-70} y={-130} width={140} height={250} rx={20} fill="none" stroke={c} strokeWidth={4} /><g transform={`translate(0,${-40 - 10 * out3((T % 2) / 0.4)}) scale(${0.9 + 0.1 * Math.sin(T * 6)})`}><rect x={-56} y={-24} width={112} height={44} rx={14} fill={v.col} /><text y={6} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 20}} fill="#2a1c04">在干嘛？</text></g><circle cx={52} cy={-118} r={12} fill="#ff4a3a" /><text x={52} y={-112} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 16}} fill="#fff">1</text></g>;
		case 'nu': return <g>
			{/* a small figure, and three hands pointing at it */}
			<circle cx={0} cy={-30} r={22} fill="none" stroke={c} strokeWidth={4} /><path d="M-36,60 C-36,10 36,10 36,60" fill="none" stroke={c} strokeWidth={4} />
			{[[-175, 10, 0], [175, 10, 180], [0, -175, 90]].map(([x, y, r], k) => <g key={k} transform={`translate(${x},${y}) rotate(${r}) translate(${6 * Math.sin(T * 6 + k)},0)`}>
				{/* a clean pointing-hand glyph: cuff, curled fist, one straight index finger */}
				<path d="M-58,-20 L-44,-20 L-44,40 L-58,40 Z" fill="#160604" stroke={v.col} strokeWidth={3.5} strokeLinejoin="round" />
				<path d="M-44,-14 C-40,-26 -24,-28 -10,-24 L58,-24 C70,-24 70,-8 58,-8 L14,-8 C22,-4 22,9 14,11 C22,15 20,26 11,26 C17,30 14,40 5,40 L-30,40 C-40,40 -44,32 -44,22 Z" fill="#160604" stroke={v.col} strokeWidth={3.5} strokeLinejoin="round" />
				<path d="M14,11 L-4,11 M11,26 L-6,26 M14,-8 L-2,-8" stroke={v.col} strokeWidth={2} fill="none" opacity={0.8} />
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

const BlurText: React.FC<{x: number; y: number; text: string; size: number; u: number; out?: number; weight?: number; col?: string; spacing?: string; anchor?: 'start' | 'middle'; id: string; hl?: string; hlCol?: string}> = ({x, y, text, size, u, out = 0, weight = 900, col = '#fff', spacing = '0.04em', anchor = 'start', id, hl, hlCol}) => {
	const parts = hl && text.includes(hl) ? [text.slice(0, text.indexOf(hl)), hl, text.slice(text.indexOf(hl) + hl.length)] : null;
	const body = parts ? <>{parts[0]}<tspan fill={hlCol}>{parts[1]}</tspan>{parts[2]}</> : text;
	const b = 14 * (1 - out3(u)) + 18 * ease(out), o = cl01(u * 1.6) * (1 - ease(out));
	if (o <= 0.001) return null;
	return <g>
		<filter id={id} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation={`${(b * 2.2).toFixed(2)} ${(b * 0.4).toFixed(2)}`} /></filter>
		<text x={x} y={y} textAnchor={anchor} style={{fontFamily: SERIF, fontWeight: weight, fontSize: size, letterSpacing: spacing}} fill={col} opacity={o * 0.45} filter="url(#gM)">{body}</text>
		<text x={x - 60 * (1 - out3(u))} y={y} textAnchor={anchor} style={{fontFamily: SERIF, fontWeight: weight, fontSize: size, letterSpacing: spacing}} fill={col} opacity={o} filter={b > 0.2 ? `url(#${id})` : undefined}>{body}</text>
	</g>;
};
/** one of the seven: a dark medallion, coloured rim, a big white glyph with a coloured glow — readable at phone size */
const Icon: React.FC<{x: number; y: number; ch: string; col: string; o: number; s?: number}> = ({x, y, ch, col, o, s = 1}) => { const fs = ch.length > 2 ? 24 : ch.length > 1 ? 36 : 66, two = ch.length === 4 ? [ch.slice(0, 2), ch.slice(2)] : [ch]; return (
	<g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
		<circle r={70} fill={col} opacity={0.3} filter="url(#gM)" />
		<circle r={58} fill="#0b0912" />
		<circle r={58} fill="none" stroke={col} strokeWidth={4.5} />
		<circle r={48} fill="none" stroke={GOLD} strokeWidth={1.2} opacity={0.7} />
		{two.map((t, k) => <g key={k}><text y={(two.length > 1 ? (k ? 26 : -4) : fs * 0.35)} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: fs}} fill={col} opacity={0.9} filter="url(#gS)">{t}</text><text y={(two.length > 1 ? (k ? 26 : -4) : fs * 0.35)} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: fs}} fill="#fff">{t}</text></g>)}
	</g>
); };

/** the sample's hit: the whole frame lifts to grey for one frame, a little for the next — nothing more */
const Lift: React.FC<{hit: number; x?: number; y?: number}> = ({hit, x = 960, y = 540}) => { const f = Math.round(hit * FPS), o = f === 0 ? 0.55 : f === 1 ? 0.18 : 0; return o > 0 ? <g>
	<radialGradient id="liftG" gradientUnits="userSpaceOnUse" cx={x} cy={y} r={1500}><stop offset="0" stopColor="#ffffff" /><stop offset="0.25" stopColor="#e4e0ec" /><stop offset="1" stopColor="#8e8a98" /></radialGradient>
	<rect width={W} height={H} fill="url(#liftG)" opacity={o} />
</g> : null; };
/** sparks thrown out of the name on the hit */
const NameBurst: React.FC<{hit: number; x: number; y: number; col: string}> = ({hit, x, y, col}) => hit < 0 || hit > 1 ? null : <g>{Array.from({length: 30}, (_, i) => { const a = i / 30 * Math.PI * 2 + rnd(i, 61) * 0.3, d = 60 + (240 + 320 * rnd(i, 62)) * out3(hit / 1.0), r = 1.6 + 2.6 * rnd(i, 63); return <circle key={i} cx={x + Math.cos(a) * d * 1.3} cy={y + Math.sin(a) * d * 0.8} r={r} fill={i % 3 ? '#fff' : col} opacity={1 - hit} />; })}</g>;
/** two thin rings opening from a point */
const Rings: React.FC<{hit: number; x: number; y: number; col: string}> = ({hit, x, y, col}) => hit < 0 || hit > 0.9 ? null : <g>{[0, 1].map((k) => { const u = cl01((hit - k * 0.05) / (0.85 - k * 0.2)); return u > 0 && u < 1 ? <circle key={k} cx={x} cy={y} r={(k ? 80 : 130) + (k ? 520 : 1200) * out3(u)} fill="none" stroke={k ? col : '#fff'} strokeWidth={4 * (1 - u) + 0.6} opacity={0.95 * (1 - u)} /> : null; })}</g>;

/** a filled strip along a centre line, width w(u) */
const strip = (c: P[], w: (u: number) => number) => {
	const n = c.length - 1, L: P[] = [], R: P[] = [];
	c.forEach((p, i) => { const a = c[Math.max(0, i - 1)], b = c[Math.min(n, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, h = w(i / n) / 2; L.push([p[0] + nx * h, p[1] + ny * h]); R.push([p[0] - nx * h, p[1] - ny * h]); });
	const f = (q: P) => q[0].toFixed(1) + ',' + q[1].toFixed(1);
	return 'M' + L.map(f).join(' L') + ' L' + R.reverse().map(f).join(' L') + ' Z';
};
const cub = (a: P, b: P, c: P, d: P, u: number): P => { const m = 1 - u; return [m * m * m * a[0] + 3 * m * m * u * b[0] + 3 * m * u * u * c[0] + u * u * u * d[0], m * m * m * a[1] + 3 * m * m * u * b[1] + 3 * m * u * u * c[1] + u * u * u * d[1]]; };

/** each voice's signature piece behind the figure (in figure space), unfurling on the hit */
const AccBack: React.FC<{T: number; v: Voice; u: number}> = ({T, v, u}) => {
	if (u <= 0) return null;
	const k = out3(u);
	switch (v.kind) {
		case 'xi': return <g opacity={cl01(u * 3)}>{[1, -1].map((s) => { const sw = 5 * Math.sin(T * 1.8 + s), x = s * 330, y = -60 + 40 * (1 - k); return <g key={s} transform={`translate(${x},${y}) rotate(${sw})`}>
			<line x1={0} y1={-400} x2={0} y2={-52} stroke={GOLD} strokeWidth={1.4} opacity={0.7} />
			<ellipse rx={92} ry={70} fill="#ff4a2a" opacity={0.35} filter="url(#gL)" />
			<rect x={-26} y={-56} width={52} height={12} rx={3} fill="url(#goldG)" />
			<path d="M-56,-44 C-74,-20 -74,20 -56,44 L56,44 C74,20 74,-20 56,-44 Z" fill="#c8241a" stroke="#ffd2a0" strokeWidth={2} />
			{[-30, 0, 30].map((lx) => <path key={lx} d={`M${lx * 0.7},-44 C${lx * 1.25},-14 ${lx * 1.25},14 ${lx * 0.7},44`} stroke="#ffb070" strokeWidth={1.2} fill="none" opacity={0.7} />)}
			<text y={13} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 40}} fill="#ffe08a">喜</text>
			<rect x={-26} y={44} width={52} height={12} rx={3} fill="url(#goldG)" />
			{[-8, -3, 2, 7].map((tx) => <line key={tx} x1={tx} y1={56} x2={tx + 2 * Math.sin(T * 2 + tx)} y2={112} stroke="#ff6a4a" strokeWidth={2} />)}
		</g>; })}</g>;
		case 'nu': return <g>{[1, -1].map((s) => Array.from({length: 5}, (_, j) => { const L = (400 - Math.abs(j - 2) * 40) * lerp(0.4, 1, k), w = 34, wig = 14 * Math.sin(T * 6 + j * 1.7 + s), cur = 60 + 20 * Math.sin(T * 2 + j); return <g key={s + '-' + j} transform={`translate(${s * 180},300) rotate(${s * (30 + j * 12)})`}>
			<path d={`M${-w},0 C${-w - 30},${-L * 0.35} ${cur + wig},${-L * 0.6} ${cur * 0.6 + wig},${-L} C${cur * 0.2 + 30},${-L * 0.7} ${w + 20},${-L * 0.35} ${w},0 Z`} fill="#ff5a1a" opacity={0.3} filter="url(#gM)" />
			<path d={`M${-w},0 C${-w - 30},${-L * 0.35} ${cur + wig},${-L * 0.6} ${cur * 0.6 + wig},${-L} C${cur * 0.2 + 30},${-L * 0.7} ${w + 20},${-L * 0.35} ${w},0 Z`} fill="url(#flameG)" opacity={0.55} />
			<path d={`M${-w * 0.3},0 C${-w * 0.5},${-L * 0.3} ${cur * 0.6 + wig * 0.6},${-L * 0.5} ${cur * 0.4 + wig * 0.6},${-L * 0.68} C${cur * 0.1 + 10},${-L * 0.45} ${w * 0.4},${-L * 0.2} ${w * 0.3},0 Z`} fill="#fff1c4" opacity={0.5} />
		</g>; }))}</g>;
		case 'ai': return <g opacity={k}>{Array.from({length: 17}, (_, i) => { const x0 = lerp(-330, 330, i / 16), y0 = -340 + 60 * Math.pow(x0 / 330, 2), len = (380 + 340 * rnd(i, 51)) * k, n = Math.floor(len / 28); return <g key={i}>
			<line x1={x0} y1={y0} x2={x0 + 6 * Math.sin(T * 1.1 + i)} y2={y0 + len} stroke={v.hot} strokeWidth={0.8} opacity={0.5} />
			{Array.from({length: n}, (_, j) => { const q = j / Math.max(1, n); return <circle key={j} cx={x0 + 6 * Math.sin(T * 1.1 + i) * q} cy={y0 + j * 28 + 14} r={j % 4 === 3 ? 4.6 : 2.6} fill="#eef2ff" opacity={0.85} />; })}
		</g>; })}</g>;
		case 'ju': { const fl = 1 - 0.1 * Math.abs(Math.sin(T * 3.2)); return <g>{[1, -1].map((s) => <g key={s} transform={`translate(${s * 110},210) scale(${0.6 * s * fl * lerp(0.3, 1, k)},${0.6 * lerp(0.3, 1, k)})`}>
			<path d="M-20,-10 C140,-280 400,-430 450,-260 C480,-150 330,-40 40,10 Z" fill="#061016" stroke={v.hot} strokeWidth={2.4} />
			<path d="M10,30 C220,10 380,110 350,230 C320,320 160,250 20,60 Z" fill="#061016" stroke={v.hot} strokeWidth={2.4} />
			{[[300, -220, 48], [250, 160, 32]].map(([x, y, r], j) => <g key={j}><circle cx={x} cy={y} r={r} fill="none" stroke={v.col} strokeWidth={3} /><circle cx={x} cy={y} r={r * 0.6} fill={v.col} opacity={0.35} /><circle cx={x + r * 0.12} cy={y} r={r * 0.25} fill="#e8fbff" /><circle cx={x + r * 0.15} cy={y} r={r * 0.1} fill="#000" /></g>)}
			{[[-20, -10, 420, -280], [-10, 0, 380, -130], [0, 10, 300, -20], [10, 40, 330, 150], [20, 60, 240, 240]].map(([a, b, c, d], j) => <path key={'v' + j} d={`M${a},${b} Q${(a + c) / 2},${(b + d) / 2 - 40} ${c},${d}`} stroke={v.hot} strokeWidth={1} fill="none" opacity={0.4} />)}
		</g>)}</g>; }
		case 'love': return <g opacity={cl01(u * 3)}>{[1, -1].map((s) => { const c = Array.from({length: 36}, (_, i) => { const q = i / 35 * k, p = cub([s * 40, 160], [s * 280, -60], [s * 430, 220], [s * 480, 660], q); return [p[0] + 16 * Math.sin(q * 9 + T * 1.5 + s), p[1]] as P; }); const wd = (q: number) => 44 + 16 * Math.sin(q * 6 + 1); return <g key={s}><path d={strip(c, wd)} fill={v.col} opacity={0.35} filter="url(#gM)" /><path d={strip(c, wd)} fill={v.hot} opacity={0.32} /><path d={strip(c, (q) => wd(q) * 0.35)} fill="#fff" opacity={0.25} /><path d={strip(c, wd)} fill="none" stroke="#fff" strokeWidth={1.2} opacity={0.6} /></g>; })}</g>;
		default: return null;
	}
};
/** pieces in front of the figure */
const AccFront: React.FC<{T: number; v: Voice; u: number}> = ({T, v, u}) => {
	if (u <= 0) return null;
	const k = out3(u);
	if (v.kind === 'wu' && false) {
		// a green serpent over her back shoulder, rising behind her head
		const c: P[] = Array.from({length: 46}, (_, i) => { const q = i / 45; const p = q < 0.55 ? cub([-470, 720], [-360, 400], [-40, 560], [-140, 330], q / 0.55) : cub([-140, 330], [-230, 160], [-420, 180], [-330, 20], (q - 0.55) / 0.45); return [p[0] + 6 * Math.sin(T * 2 + q * 8) * q, p[1] - 4 * Math.sin(T * 1.6 + q * 5)] as P; });
		const vis = Math.max(2, Math.round(45 * k)), body = c.slice(0, vis + 1), head = body[body.length - 1], prev = body[body.length - 2], ha = Math.atan2(head[1] - prev[1], head[0] - prev[0]) * 180 / Math.PI;
		const w = (q: number) => lerp(6, 44, Math.min(1, q * 2.2)) * (q > 0.9 ? lerp(1, 0.75, (q - 0.9) / 0.1) : 1);
		const tongue = Math.sin(T * 9) > 0.2;
		return <g opacity={cl01(u * 3)}>
			<path d={strip(body, w)} fill={v.col} opacity={0.35} filter="url(#gM)" />
			<path d={strip(body, w)} fill="#08140a" stroke={v.col} strokeWidth={2.4} strokeLinejoin="round" />
			{body.map((p, i) => i > 3 && i % 2 === 0 && i < body.length - 2 ? <circle key={i} cx={p[0]} cy={p[1]} r={3} fill={v.hot} opacity={0.55} /> : null)}
			<g transform={`translate(${head[0]},${head[1]}) rotate(${ha})`}>
				{tongue && <path d="M42,0 L74,0 L84,-7 M74,0 L84,7" stroke="#ff4a4a" strokeWidth={2.4} fill="none" />}
				<path d="M-14,-20 C14,-30 40,-16 46,0 C40,16 14,30 -14,20 C-24,10 -24,-10 -14,-20 Z" fill="#08140a" stroke={v.col} strokeWidth={2.6} />
				<ellipse cx={18} cy={-10} rx={7} ry={5} fill="#e6ff7a" /><ellipse cx={19} cy={-10} rx={1.6} ry={4.4} fill="#000" />
				<ellipse cx={18} cy={-10} rx={16} ry={10} fill={v.col} opacity={0.5} filter="url(#gS)" />
			</g>
		</g>;
	}
	if (v.kind === 'yu') return <g opacity={k}>{[0, 1, 2].map((j) => <g key={j}>{Array.from({length: 23}, (_, i) => { const q = i / 22, x = lerp(-280 + j * 30, 280 - j * 30, q), y = 262 + j * 40 + (70 + j * 20) * Math.sin(Math.PI * q); return i % 4 === 2 ? <g key={i} transform={`translate(${x},${y + 8}) rotate(${(q - 0.5) * 40})`}><circle r={12} fill="url(#goldG)" /><rect x={-4} y={-4} width={8} height={8} fill="#1a0a2c" /></g> : <circle key={i} cx={x} cy={y} r={3.2} fill={i % 2 ? GOLD : v.col} />; })}</g>)}</g>;
	return null;
};

/** fine particles living behind the figure; on the hit they open outward from the orb */
const BackMotes: React.FC<{T: number; v: Voice; hit: number}> = ({T, v, hit}) => {
	if (hit < 0) return null;
	const burst = out3(cl01(hit / 0.9));
	return <g>
		{Array.from({length: 32}, (_, i) => {
			const a = rnd(i, 41) * Math.PI * 2 + T * 0.06 * (i % 2 ? 1 : -1), r0 = 230 + 420 * rnd(i, 42), sp = 0.06 + 0.07 * rnd(i, 43), ph = (T * sp + rnd(i, 44)) % 1;
			const r = r0 * lerp(0.35, 1, burst), x = Math.cos(a) * r, y = Math.sin(a) * r - 160 * ph * (v.kind === 'ai' ? -1 : 1), o = Math.sin(Math.PI * ph) * (0.35 + 0.65 * burst);
			const sz = 0.6 + rnd(i, 45);
			if (v.kind === 'nu') return <circle key={i} cx={x} cy={y} r={2 + 2.5 * sz} fill={i % 3 ? '#ffb070' : '#fff1c4'} opacity={o} />;
			if (v.kind === 'ai') return <path key={i} d={`M${x},${y} c4,7 7,11 0,15 c-7,-4 -4,-8 0,-15 Z`} fill={v.hot} opacity={0.7 * o} />;
			if (i % 4 === 0) return <circle key={i} cx={x} cy={y} r={4 + 5 * sz} fill="none" stroke={v.hot} strokeWidth={1.3} opacity={0.7 * o} />;
			if (i % 4 === 1) return <path key={i} transform={`translate(${x},${y}) scale(${sz})`} d="M0,-11 L2.4,-2.4 L11,0 L2.4,2.4 L0,11 L-2.4,2.4 L-11,0 L-2.4,-2.4 Z" fill={i % 8 === 1 ? GOLD : '#fff'} opacity={o} />;
			return <circle key={i} cx={x} cy={y} r={1.6 + 2 * sz} fill={v.col} opacity={o} filter={i % 3 ? undefined : 'url(#gS)'} />;
		})}
		{false && Array.from({length: 26}, (_, i) => { const a = i / 26 * Math.PI * 2 + rnd(i, 47) * 0.4, d = 210 + (300 + 260 * rnd(i, 48)) * out3(hit / 1.3); return <circle key={'e' + i} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={2 + 2 * rnd(i, 49)} fill={i % 3 ? v.hot : GOLD} opacity={1 - hit / 1.3} />; })}
	</g>;
};

/** the coming voice's eyes, glowing in the orb during the last two beats before it appears */
const OrbEyes: React.FC<{v: Voice; u: number; T: number}> = ({v, u, T}) => u <= 0 ? null : <g opacity={u}>{[-1, 1].map((s) => <g key={s} transform={`translate(${s * 54},-4)`}>
	<ellipse rx={38} ry={12} fill={v.col} opacity={0.9} filter="url(#gM)" />
	{['ai', 'den', 'dep', 'acc'].includes(v.kind) ? <path d="M-24,-2 Q0,10 24,-2" stroke="#fff" strokeWidth={3.4} fill="none" strokeLinecap="round" /> : <path d={`M-26,0 Q0,${-12 * (Math.sin(T * 0.9 + 1) > 0.97 ? 0.15 : 1)} 26,0 Q0,9 -26,0 Z`} fill="#fff" />}
</g>)}</g>;

// ---------------------------------------------------------------- one voice
const FIG: Record<Kind, React.FC<FigProps>> = {xi: FigXi, nu: FigNu, ai: FigAi, ju: FigJu, love: FigLove, wu: FigWu, yu: FigYu, den: FigDen, ang: FigAng, bar: FigBar, dep: FigDep, acc: FigAcc, pri: FigPri, env: FigEnv, slo: FigSlo, gre: PHOTO_TEST ? FigGrePhoto : FigGre, glu: FigGlu, lus: FigLus};
const PLACE: Record<Kind, {dx: number; dy: number; s: number; flip?: boolean}> = {
	xi: {dx: 0, dy: 40, s: 1.55}, nu: {dx: 0, dy: 60, s: 1.55}, ai: {dx: 60, dy: 60, s: 1.4, flip: true}, ju: {dx: 0, dy: 0, s: 1.75},
	love: {dx: 10, dy: 40, s: 1.5}, wu: {dx: -40, dy: 10, s: 1.45}, yu: {dx: 0, dy: 30, s: 1.45},
	den: {dx: 40, dy: 60, s: 1.4}, ang: {dx: 0, dy: 60, s: 1.5}, bar: {dx: 0, dy: 40, s: 1.5}, dep: {dx: 60, dy: 70, s: 1.4, flip: true}, acc: {dx: 0, dy: 40, s: 1.5},
	pri: {dx: 0, dy: 90, s: 1.35}, env: {dx: -30, dy: 50, s: 1.45}, slo: {dx: 20, dy: 140, s: 1.3}, gre: {dx: 0, dy: 60, s: 1.45}, glu: {dx: -60, dy: 60, s: 1.45}, lus: {dx: -20, dy: 60, s: 1.45},
};
/** iris transitions: a scene closes by its disc swelling to fill the screen in the next colour; the next opens from the centre */
const IRIS = 0.32;
const IrisClose: React.FC<{o: number; x: number; y: number; col: string; deep: string; id: string}> = ({o, x, y, col, deep, id}) => o <= 0 ? null : <g>
	<radialGradient id={id} gradientUnits="userSpaceOnUse" cx={x} cy={y} r={1400}><stop offset="0" stopColor={col} /><stop offset="0.5" stopColor={deep} /><stop offset="1" stopColor="#050308" /></radialGradient>
	<circle cx={x} cy={y} r={lerp(380, 2300, ease(o))} fill={`url(#${id})`} />
	<circle cx={x} cy={y} r={lerp(380, 2300, ease(o))} fill="none" stroke="#fff" strokeWidth={10} opacity={0.8 * (1 - cl01(o))} />
</g>;
const IrisOpen: React.FC<{o: number; x: number; y: number; col: string; deep: string; id: string}> = ({o, x, y, col, deep, id}) => o >= 1 ? null : <g>
	<radialGradient id={id} gradientUnits="userSpaceOnUse" cx={x} cy={y} r={1400}><stop offset="0" stopColor={col} /><stop offset="0.5" stopColor={deep} /><stop offset="1" stopColor="#050308" /></radialGradient>
	<mask id={id + 'm'} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}><rect width={W} height={H} fill="#fff" /><circle cx={x} cy={y} r={lerp(0, 2300, ease(o))} fill="#000" /></mask>
	<rect width={W} height={H} fill={`url(#${id})`} mask={`url(#${id}m)`} />
	<circle cx={x} cy={y} r={lerp(0, 2300, ease(o))} fill="none" stroke="#fff" strokeWidth={10} opacity={0.8 * (1 - cl01(o))} />
</g>;
const GOLD_V = {col: '#f2c14e', deep: '#3a2a08'};
const VoiceScene: React.FC<{T: number; v: Voice; i: number}> = ({T, v, i}) => {
	// the reveal is snapped to the frame that holds the downbeat (never a frame late)
	const t0 = Q0[i], t = T - t0, rv = Math.round(REV[i] * FPS - 0.2) / FPS - t0, CYC = (i < VOICES.length - 1 ? Q0[i + 1] : OUT) - t0, hit = t - rv;
	const cx = 1400, cy = 500, pl = MEME_MODE && MEME[v.kind] ? {dx: 0, dy: 70, s: 1.0} : PLACE[v.kind];
	// the sample's beat map: the line on its downbeat; the voice's eyes glow in the orb for the last two beats; on the
	// next downbeat the frame lifts for a frame, the figure is simply THERE and the name lands with it (motion blur,
	// two thin rings); its piece unfurls behind it and particles open out; ornaments pop on the half beats
	const cap = fade(t, 0.04, 0.3), quote = fade(t, BEAT * 0.5, 0.35), outQ = fade(t, rv - 0.2, 0.18);
	const on = hit >= 0, orb = fade(t, 0, 0.25) * (on ? 0 : 1), icon = 1 - fade(t, rv - 2 * BEAT, 0.3), eyes = fade(t, rv - 2 * BEAT + 0.1, 0.3);
	const lit = on ? cl01(hit / 0.3) : 0;
	const open = ['ai', 'den', 'dep'].includes(v.kind) ? 0 : on ? 1 : 0;
	const orn = (k: number) => hit >= 0 ? out3(cl01(hit / 0.1)) : 0;                       // pins, earrings, small things: with the figure
	const late = (k: number) => out3(cl01((hit - BEAT * (0.5 + 0.5 * k)) / 0.22));   // the big moves keep their beat
	const nameU = on ? cl01(hit / 0.3) : 0, tag = fade(t, rv + 0.12, 0.25), say = fade(t, rv + 2 * BEAT, 0.3);
	const leave = MEME_MODE ? 0 : fade(t, CYC - 0.22, 0.22);
	const shake = v.kind === 'ju' || v.kind === 'nu' || v.kind === 'ang' ? (hit > 0.6 ? 3 * Math.sin(T * 41) * Math.sin(T * 7.3) * (1 - cl01((hit - 0.6) / 2.5)) : 0) : 0;
	const beatPulse = Math.max(0, 1 - ((((T - PH) % BEAT) + BEAT) % BEAT) / 0.16);
	const push = (1 + 0.05 * ease(t / CYC)) * (1 + 0.012 * beatPulse * lit);
	const sweep = cl01((hit - 0.35) / 0.45);
	const Fig = MEME_MODE && MEME[v.kind] ? FigMeme : FIG[v.kind];
	const figT = `translate(${pl.dx},${pl.dy}) scale(${pl.s * (on ? lerp(1.035, 1, out3(hit / 0.3)) : 1)}) ${pl.flip ? 'scale(-1,1)' : ''}`;
	const bolts: [P, P][] = [[[cx - 340, cy - 120], [880, 140]], [[cx + 300, cy + 200], [1900, 460]], [[cx - 280, cy + 240], [1000, 900]]];
	const nb = 46 * (1 - out3(nameU));
	const nameFs = v.ch.length > 2 ? 165 : 250, nameW = v.ch.length * nameFs, nameX = 140 + nameW / 2;

	return (
		<svg width={W} height={H}>
			<Defs v={v} />
			<g opacity={1 - leave} transform={`translate(${shake},${shake * 0.6})`}>
				<rect width={W} height={H} fill="url(#bgG)" />
				{Array.from({length: 50}, (_, k) => <circle key={k} cx={rnd(k) * W} cy={rnd(k, 1) * H} r={0.8 + 1.4 * rnd(k, 2)} fill="#eef" opacity={0.15 + 0.35 * Math.sin(T * 1.2 + k * 2.1) ** 2} />)}
				<circle cx={520} cy={560} r={620} fill="none" stroke={v.hot} strokeWidth={2.2} opacity={0.25 + 0.4 * lit} />
				<g transform={`translate(${cx},${cy}) scale(${push})`}>
					{MEME_MODE && MEME[v.kind] ? <g transform="translate(0,40)"><MemeDisc T={T} v={v} u={on ? cl01(hit / 0.35) : 0} /></g> : <>
					<Halo T={T} v={v} s={lerp(0.9, 1, out3(t / 0.3)) * (on ? 1 + 0.035 * Math.max(0, 1 - hit / 0.2) : 1)} t={t} rv={rv} lit={lit} />
					<BackMotes T={T} v={look(v)} hit={hit} /></>}
					{orb > 0 && <g opacity={orb}>
						<circle r={248} fill="url(#orbG)" />
						<g opacity={icon}><OrbMoment T={T} v={v} /></g>
						<OrbEyes v={v} u={eyes} T={T} />
					</g>}
					{on && <g transform={figT}>
						<Fig T={T} v={v} draw={1} open={open} orn={orn} late={late} t={MEME_MODE && MEME[v.kind] ? hit : t} />
						<AccFront T={T} v={v} u={orn(1)} />
					</g>}
				</g>
				{v.kind === 'yu' && <ReachHand T={T} v={v} u={cl01((hit - 0.4) / 0.6)} />}
				{v.kind === 'dep' && on && (() => { const ex = 1268, ey = 522, pool = 980, f0 = 2 * BEAT, h = hit - f0, land = BEAT;
					const fall = h > 0 && h < land ? h / land : -1, after = h - land;
					return <g>
						<linearGradient id="poolG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={v.col} stopOpacity="0.28" /><stop offset="1" stopColor="#04081a" stopOpacity="0.9" /></linearGradient>
						<linearGradient id="poolFade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.25" stopColor="#fff" stopOpacity="1" /></linearGradient>
						<mask id="poolM" maskUnits="userSpaceOnUse" x={860} y={pool - 20} width={1100} height={140}><rect x={860} y={pool - 20} width={1100} height={140} fill="url(#poolFade)" /></mask>
						<g mask="url(#poolM)"><rect x={860} y={pool} width={1100} height={120} fill="url(#poolG)" /><path d={`M860,${pool} L1960,${pool}`} stroke={v.hot} strokeWidth={1.6} opacity={0.7} /></g>
						{h > -0.6 && h <= 0 && <path transform={`translate(${ex},${ey}) scale(${0.6 + 0.6 * cl01((h + 0.6) / 0.6)})`} d="M0,-11 C5,-3 8,3 8,7 C8,12 -8,12 -8,7 C-8,3 -5,-3 0,-11 Z" fill="#eef4ff" />}
						{fall >= 0 && <g><line x1={ex} y1={ey} x2={ex} y2={lerp(ey, pool, fall * fall)} stroke={v.hot} strokeWidth={1.2} opacity={0.3} /><path transform={`translate(${ex},${lerp(ey, pool, fall * fall)}) scale(1.4,${1.4 + fall})`} d="M0,-11 C5,-3 8,3 8,7 C8,12 -8,12 -8,7 C-8,3 -5,-3 0,-11 Z" fill="#eef4ff" /></g>}
						{after > 0 && [0, 1, 2].map((k) => { const u = cl01((after - k * 0.25) / 1.6); return u > 0 && u < 1 ? <ellipse key={k} cx={ex} cy={pool} rx={20 + 420 * out3(u)} ry={(20 + 420 * out3(u)) * 0.12} fill="none" stroke={v.hot} strokeWidth={2.4 * (1 - u)} opacity={1 - u} /> : null; })}
						{after > 0 && after < 0.3 && <circle cx={ex} cy={pool} r={60} fill={v.hot} opacity={0.5 * (1 - after / 0.3)} filter="url(#gM)" />}
					</g>; })()}
				{v.kind === 'love' && lit > 0 && Array.from({length: 1}, (_, k) => { const ox = cx + 120, oy = cy - 60, ex = [1180, 1960, 1960][k], ey = [-40, 160, 620][k], w = Math.sin(T * 1.4 + k) * 60, len = 1800; const d = `M${ox},${oy + (k - 1) * 30} C${ox + 160},${oy - 260 + w} ${ex - 200},${ey + 260 - w} ${ex},${ey}`; const u = cl01((hit - 0.4) / 1.4); return <g key={k}><path d={d} stroke={v.col} strokeWidth={6} fill="none" opacity={0.3} filter="url(#gM)" strokeDasharray={len} strokeDashoffset={len * (1 - out3(u - k * 0.05))} /><path d={d} stroke={v.col} strokeWidth={2.2} fill="none" strokeDasharray={len} strokeDashoffset={len * (1 - out3(u - k * 0.05))} /></g>; })}
				{on && hit < 0.6 && <Bolt a={[120, 760]} b={[560, 380]} seed={v.n * 3 + 1} T={T} col={v.col} o={1 - hit / 0.6} />}
				{/* left: the moment and the line (blurs away sideways just before the beat) */}
				<BlurText id={`c${v.n}`} x={150} y={470} text={v.when} size={42} weight={600} col="#d4cde2" spacing="0.12em" u={cap} out={outQ} />
				<BlurText id={`q${v.n}`} x={130} y={590} text={v.line} size={92} u={quote} out={outQ} />
				{/* left: the name lands with the figure */}
				{on && <g>
					<ellipse cx={nameX} cy={525} rx={460} ry={58} fill="#fff" opacity={0.32 * (1 - out3(cl01(hit / 0.9)))} filter="url(#gL)" />
					{hit < 0.35 && <rect x={nameX} y={519} width={1100 * out3(cl01(hit / 0.12))} height={12} fill="#fff" opacity={0.85 * (1 - hit / 0.35)} filter="url(#gS)" />}
					<NameBurst hit={hit} x={nameX} y={525} col={v.col} />
					<filter id={`nb${v.n}`} x="-40%" y="-20%" width="180%" height="140%"><feGaussianBlur stdDeviation={`${nb.toFixed(2)} 0`} /></filter>
					<text x={150} y={330} style={{fontFamily: SERIF, fontWeight: 700, fontSize: 38, letterSpacing: '0.16em'}} fill="#efe9fb" opacity={cl01(hit / 0.12)} filter={nb > 0.3 ? `url(#nb${v.n})` : undefined}>{`七宗罪之${NUM[v.n]}，它叫`}</text>
					<clipPath id={`sw${v.n}`}><rect x={60 + 620 * sweep} y={340} width={110} height={360} transform="skewX(-18)" /></clipPath>
					<g transform={`translate(${-70 * (1 - out3(nameU))},0)`}>
						<text x={140} y={640} style={{fontFamily: SERIF, fontWeight: 900, fontSize: nameFs}} fill={v.col} opacity={0.75} filter="url(#gL)">{v.ch}</text>
						<g filter={nb > 0.3 ? `url(#nb${v.n})` : undefined}>
							<text x={140} y={640} style={{fontFamily: SERIF, fontWeight: 900, fontSize: nameFs}} fill="url(#nameG)">{v.ch}</text>
						</g>
						{sweep > 0 && sweep < 1 && <text x={140} y={640} style={{fontFamily: SERIF, fontWeight: 900, fontSize: nameFs}} fill="#fff" clipPath={`url(#sw${v.n})`}>{v.ch}</text>}
					</g>
					<g opacity={tag}>
						<text x={170 + nameW} y={470} style={{fontFamily: SERIF, fontWeight: 600, fontSize: 48, fontStyle: 'italic', letterSpacing: '0.06em'}} fill="#fff">{v.py}</text>
						<rect x={152 + nameW} y={410} width={6} height={230} fill="url(#goldG)" />
						<text x={170 + nameW} y={540} style={{fontFamily: SERIF, fontWeight: 600, fontSize: 30, letterSpacing: '0.2em'}} fill={GOLD}>{['', 'PRIDE', 'ENVY', 'WRATH', 'SLOTH', 'GREED', 'GLUTTONY', 'LUST'][v.n]}</text>
					</g>
					<Rings hit={hit} x={nameX} y={525} col={v.col} />
				</g>}
				<BlurText id={`y${v.n}`} x={150} y={770} text={v.say} size={48} weight={800} col="#ffffff" spacing="0.05em" u={say} hl={v.key} hlCol={v.col} />
			</g>
			<Lift hit={hit} x={nameX} y={525} />
			{MEME_MODE && <>
				<IrisOpen o={t / 0.4} x={cx} y={cy + 40} col={v.col} deep={v.deep} id={`io${v.n}`} />
				{(() => { const nx = i < VOICES.length - 1 ? VOICES[i + 1] : GOLD_V; return <IrisClose o={(t - (CYC - IRIS)) / IRIS} x={cx} y={cy + 40} col={nx.col} deep={nx.deep} id={`ic${v.n}`} />; })()}
			</>}
			{!MEME_MODE && (() => { const o = cl01((t - (CYC - BEAT)) / BEAT); if (o <= 0) return null;
				switch (v.kind) {
					case 'den': return <g>{Array.from({length: 14}, (_, i) => { const a = i / 14 * Math.PI * 2 + rnd(i, 81) * 0.3; const pts: P[] = [[cx, cy]]; for (let k = 1; k < 8; k++) { const p = pts[k - 1], aa = a + (rnd(i * 9 + k, 82) - 0.5) * 0.7; pts.push([p[0] + Math.cos(aa) * 170, p[1] + Math.sin(aa) * 170]); } const d = 'M' + pts.map((p) => p.map((q) => q.toFixed(1)).join(',')).join(' L'); return <path key={i} d={d} stroke="#eef6ff" strokeWidth={2.4} fill="none" strokeDasharray={1300} strokeDashoffset={1300 * (1 - out3(o * 1.3))} opacity={1 - ease(cl01((o - 0.75) / 0.25))} />; })}</g>;
					case 'ang': return <g>{Array.from({length: 70}, (_, i) => { const x = rnd(i, 83) * W, y = lerp(-40, H * 1.1, ease(cl01(o * 1.2 - rnd(i, 84) * 0.25))); return <circle key={i} cx={x + 20 * Math.sin(T * 3 + i)} cy={y} r={2 + 3 * rnd(i, 85)} fill={i % 3 ? GOLD : '#ffb070'} opacity={0.9 * (1 - ease(cl01((o - 0.8) / 0.2)))} />; })}<rect width={W} height={H} fill="#ff3b4a" opacity={0.18 * (1 - o)} /></g>;
					case 'bar': return <g>{Array.from({length: 60}, (_, i) => { const x = rnd(i, 86) * W, ph = cl01(o * 1.3 - rnd(i, 87) * 0.3), y = lerp(-80, H + 80, ph), col = o < 0.5 ? GOLD : '#9fb4ff'; return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 40 + 40 * o} stroke={col} strokeWidth={1.6} opacity={0.8 * Math.sin(Math.PI * ph)} />; })}</g>;
					case 'dep': { const top = lerp(H, -40, ease(o)); return <g><rect x={0} y={top} width={W} height={H - top + 40} fill="#0a1236" opacity={0.85} /><path d={`M0,${top} ` + Array.from({length: 20}, (_, i) => `Q${50 + i * 100},${top + 12 * Math.sin(T * 3 + i)} ${100 + i * 100},${top}`).join(' ')} stroke="#d6dcff" strokeWidth={2} fill="none" />{o > 0.7 && <rect width={W} height={260} fill="url(#dawnG)" opacity={(o - 0.7) / 0.3} />}<linearGradient id="dawnG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd9a8" stopOpacity="0.8" /><stop offset="1" stopColor="#ffd9a8" stopOpacity="0" /></linearGradient></g>; }
					case 'acc': return <rect width={W} height={H} fill="#fff1e0" opacity={0.5 * ease(o)} />;
					default: return null;
				}
			})()}

		</svg>
	);
};

// ---------------------------------------------------------------- intro / outro
const SEVEN = VOICES.map((v) => ({ch: v.ch, col: v.col}));
const V0 = Q0[0];
const ICON_DX = 190;
const Intro: React.FC<{T: number}> = ({T}) => (
	<svg width={W} height={H}>
		<Defs v={{col: '#b9b0ff', hot: '#ece8ff', deep: '#141026'}} />
		<g opacity={1 - fade(T, V0 - 0.3, 0.3)}>
			<rect width={W} height={H} fill="url(#bgG)" />
			<BlurText id="i1" x={960} y={330} text="公元6世纪，教皇格里高利一世写下：" size={40} weight={600} col="#cfc8de" spacing="0.14em" anchor="middle" u={1} />
			<BlurText id="i2" x={960} y={450} text="人心里，藏着七宗罪。" size={84} anchor="middle" u={fade(T, bt(0) + 2 * BEAT, 0.4)} />
			{/* the seven pop in on the half beats of bar 1 */}
			{SEVEN.map((s, i) => { const at = bt(1) + i * BEAT / 2, o = cl01((T - at) / 0.1); return <g key={s.ch}>
				<Icon x={960 + (i - (SEVEN.length - 1) / 2) * ICON_DX} y={650} ch={s.ch} col={s.col} o={o} s={lerp(1.7, 1, outBack(o))} />
				{T >= at && T < at + 0.4 && <circle cx={960 + (i - (SEVEN.length - 1) / 2) * ICON_DX} cy={650} r={60 + 90 * out3((T - at) / 0.4)} fill="none" stroke={s.col} strokeWidth={5 * (1 - (T - at) / 0.4)} opacity={1 - (T - at) / 0.4} />}
			</g>; })}
		</g>
		{MEME_MODE && <IrisClose o={(T - (V0 - IRIS)) / IRIS} x={1400} y={540} col={VOICES[0].col} deep={VOICES[0].deep} id="icIntro" />}
	</svg>
);
const Outro: React.FC<{T: number}> = ({T}) => {
	// bar 25 the question, the seven on the half beats; bar 26 (the break) they hold; bar 27 the title slams with the kick
	const tq = Math.round(bt(27) * FPS - 0.2) / FPS - OUT, t = T - OUT, q = fade(t, 0.05, 0.35), qOut = fade(t, tq - 0.2, 0.18), title = t >= tq ? 1 : 0, slam = t >= tq ? out3(cl01((t - tq) / 0.25)) : 0, hit = t - tq;
	return (
		<svg width={W} height={H}>
			<Defs v={{col: GOLD, hot: '#fff2c8', deep: '#1c1408'}} />
			<rect width={W} height={H} fill="url(#bgG)" />
			{/* the big circle holds the whole ending */}
			<g transform={`translate(960,540) scale(${lerp(0.9, 1, out3(t / 0.5)) * (1 + 0.03 * Math.max(0, 1 - hit / 0.25) * (hit > 0 ? 1 : 0))})`}>
				<circle r={470} fill="#0c0a12" stroke="url(#goldG)" strokeWidth={3} />
				<circle r={490} fill="none" stroke={GOLD} strokeWidth={1.2} opacity={0.5} />
				<g transform={`rotate(${title > 0 ? (t - tq) * 12 : 0})`}>{SEVEN.map((s, i) => { const a = -Math.PI / 2 + i / SEVEN.length * Math.PI * 2, o = cl01((t - BEAT - i * BEAT * 0.5) / 0.1); return <g key={s.ch} transform={`translate(${Math.cos(a) * 470},${Math.sin(a) * 470}) rotate(${title > 0 ? -(t - tq) * 12 : 0})`}><Icon x={0} y={0} ch={s.ch} col={s.col} o={o} s={lerp(1.6, 0.9, outBack(o))} /></g>; })}</g>
			</g>
			<g opacity={1 - qOut}>
				<BlurText id="o1" x={984} y={560} text="你心里，哪一宗罪最大声？" size={62} anchor="middle" u={q} />
			</g>
			{title > 0 && <g opacity={title} transform={`translate(960,540) scale(${lerp(1.18, 1, slam)}) translate(-960,-540)`}>
				<text x={960} y={560} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 190, letterSpacing: '0.1em'}} fill="#fff2d0" opacity={0.7} filter="url(#gL)">七宗罪</text>
				<text x={960} y={560} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 190, letterSpacing: '0.1em'}} fill="url(#goldG)">七宗罪</text>
				<text x={960} y={650} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 600, fontSize: 28, letterSpacing: '0.7em'}} fill={GOLD}>SEVEN DEADLY SINS</text>
				<text x={960} y={720} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 600, fontSize: 28, letterSpacing: '0.12em'}} fill="#efe6d2">它们不是七个怪物，是七个被放大的你。</text>
				<ellipse cx={lerp(560, 1360, ease(slam))} cy={500} rx={420} ry={8} fill="#fff" opacity={0.8 * Math.sin(Math.PI * slam)} filter="url(#gS)" />
			</g>}
			<Rings hit={hit} x={960} y={540} col={GOLD} />
			<Lift hit={hit} />
			{MEME_MODE && <IrisOpen o={t / 0.4} x={960} y={540} col={GOLD_V.col} deep={GOLD_V.deep} id="ioOut" />}
		</svg>
	);
};

export const Sins7: React.FC = () => {
	const T = useCurrentFrame() / FPS;
	let i = 0; while (i < VOICES.length - 1 && T >= Q0[i + 1]) i++;
	const node = T < V0 ? <Intro T={T} /> : T < OUT ? <VoiceScene T={T} v={VOICES[i]} i={i} /> : <Outro T={T} />;
	return <AbsoluteFill style={{background: '#030205'}}>
		{node}
		<div style={{position: 'absolute', right: 56, bottom: 40, fontFamily: SERIF, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(236,230,218,0.55)'}}>Juno · 七宗罪</div>
	</AbsoluteFill>;
};


registerRoot(() => <Composition id="SINS7" component={Sins7} durationInFrames={Math.round(QQ9_END * FPS)} fps={FPS} width={W} height={H} />);
