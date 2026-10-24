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
// ---------------------------------------------------------------- elegant figure kit (after studying the reference):
// long oval faces and long necks, ONE thick neon outline round the whole head-and-hair silhouette, a deep fill,
// eyes that are pure glowing light (no irises), one thin brow, an L of a nose, one stroke of a mouth;
// the splendour comes from thin GOLD headdresses and jewellery against the coloured outline.
const INK = '#120a18';
const FACE_E = 'M0,-205 C70,-205 106,-154 108,-84 C110,-12 98,48 76,100 C56,146 28,178 0,184 C-28,178 -56,146 -76,100 C-98,48 -110,-12 -108,-84 C-106,-154 -70,-205 0,-205 Z';
const NECK_E = 'M-46,150 C-48,240 -50,330 -60,400 C-150,420 -300,440 -380,520 L-420,700 L420,700 L380,520 C300,440 150,420 60,400 C50,330 48,240 46,150';

const Glow: React.FC<{d: string; v: Voice; w?: number; draw?: number; L?: number}> = ({d, v, w = 4, draw = 1, L = 3600}) => <>
	<path d={d} fill="none" stroke={v.col} strokeWidth={w * 4} opacity={0.45} filter="url(#gM)" strokeDasharray={L} strokeDashoffset={L * (1 - draw)} strokeLinejoin="round" />
	<path d={d} fill="none" stroke={v.col} strokeWidth={w} strokeDasharray={L} strokeDashoffset={L * (1 - draw)} strokeLinejoin="round" strokeLinecap="round" />
	<path d={d} fill="none" stroke="#ffffff" strokeWidth={w * 0.3} opacity={0.6} strokeDasharray={L} strokeDashoffset={L * (1 - draw)} strokeLinejoin="round" />
</>;
const Gold: React.FC<{d: string; w?: number; o?: number; fill?: boolean}> = ({d, w = 2.4, o = 1, fill}) => <g opacity={o}>
	<path d={d} fill="none" stroke={GOLD} strokeWidth={w * 3} opacity={0.3} filter="url(#gS)" />
	<path d={d} fill={fill ? 'url(#goldG)' : 'none'} stroke="url(#goldG)" strokeWidth={w} strokeLinejoin="round" strokeLinecap="round" />
</g>;

/** glowing eyes: shapes per mood; open 0..1 brightens them */
type EyeK = 'almond' | 'happy' | 'angry' | 'wide' | 'lidded' | 'closed';
const LightEyes: React.FC<{k: EyeK; open: number; v: Voice; y?: number; dx?: number}> = ({k, open, v, y = -46, dx = 42}) => {
	const one = (s: 1 | -1) => {
		const d = {
			almond: 'M-26,2 C-12,-12 12,-12 26,-2 C12,8 -12,8 -26,2 Z',
			happy: 'M-26,6 C-12,-14 12,-14 26,6 C12,-4 -12,-4 -26,6 Z',
			angry: 'M-26,6 C-12,-2 10,-12 26,-14 C14,4 -8,10 -26,6 Z',
			wide: 'M-24,0 C-14,-18 14,-18 24,0 C14,18 -14,18 -24,0 Z',
			lidded: 'M-26,2 C-12,-4 12,-6 26,-2 C12,8 -12,8 -26,2 Z',
			closed: 'M-24,0 C-10,9 10,9 24,0 C10,5 -10,5 -24,0 Z',
		}[k];
		return <g key={s} transform={`translate(${s * dx},${y}) scale(${s},1)`}>
			<ellipse rx={48} ry={22} fill={v.col} opacity={0.55 * open} filter="url(#gM)" />
			<path d={d} fill="#ffffff" opacity={0.35 + 0.65 * open} />
			<path d={d} fill="#ffffff" opacity={0.6 * open} filter="url(#gS)" />
		</g>;
	};
	return <>{one(1)}{one(-1)}</>;
};
type BrowK = 'calm' | 'up' | 'angry' | 'sad';
const Brows: React.FC<{k: BrowK; v: Voice; y?: number; dx?: number}> = ({k, v, y = -46, dx = 42}) => <>{[1, -1].map((s) => <path key={s} transform={`translate(${s * dx},${y}) scale(${s},1)`} d={{calm: 'M-22,-24 C-6,-31 12,-31 28,-24', up: 'M-24,-30 C-10,-36 10,-32 26,-24', angry: 'M-26,-14 C-10,-20 10,-30 30,-36', sad: 'M-24,-32 C-10,-34 10,-28 26,-20'}[k]} stroke="#fff" strokeWidth={2.6} fill="none" strokeLinecap="round" opacity={0.9} />)}</>;
const Nose: React.FC = () => <path d="M-2,-30 L-8,40 C-4,46 4,46 8,42" stroke="#fff" strokeWidth={2} fill="none" opacity={0.75} strokeLinejoin="round" />;
type MouthK = 'smile' | 'laugh' | 'set' | 'sad' | 'soft' | 'part';
const MouthE: React.FC<{k: MouthK; v: Voice}> = ({k, v}) => {
	switch (k) {
		case 'laugh': return <g><path d="M-26,84 C-12,82 12,82 26,84 C20,108 -20,108 -26,84 Z" fill="#fff" opacity={0.9} /><path d="M-26,84 C-12,82 12,82 26,84 C20,108 -20,108 -26,84 Z" fill={v.col} opacity={0.5} filter="url(#gS)" /></g>;
		case 'set': return <path d="M-22,92 C-8,89 8,89 22,92" stroke="#fff" strokeWidth={2.6} fill="none" />;
		case 'sad': return <path d="M-18,96 C-8,90 8,90 18,96" stroke="#fff" strokeWidth={2.4} fill="none" />;
		case 'part': return <g><path d="M-24,88 C-10,84 10,84 24,88 C12,96 -12,96 -24,88 Z" fill={v.col} opacity={0.9} /><path d="M-24,88 C-10,84 10,84 24,88" stroke="#fff" strokeWidth={1.6} fill="none" /></g>;
		case 'soft': return <path d="M-16,90 C-6,96 6,96 16,90" stroke="#fff" strokeWidth={2.4} fill="none" />;
		default: return <path d="M-24,86 C-10,98 10,98 24,86" stroke="#fff" strokeWidth={2.6} fill="none" />;
	}
};
/** a front bust: neck, face, features; hair and ornaments are passed in as back/front layers */
const FrontBust: React.FC<{v: Voice; draw: number; open: number; eye: EyeK; brow: BrowK; mouth: MouthK; back?: React.ReactNode; front?: React.ReactNode; hideMouth?: boolean}> = ({v, draw, open, eye, brow, mouth, back, front, hideMouth}) => (
	<g>
		{back}
		<path d={NECK_E + ' Z'} fill={INK} opacity={draw} />
		<Glow d={NECK_E} v={v} draw={draw} />
		<path d={FACE_E} fill={INK} opacity={draw} />
		<Glow d={FACE_E} v={v} draw={draw} />
		{front}
		<g opacity={draw}><Brows k={brow} v={v} /><Nose />{!hideMouth && <MouthE k={mouth} v={v} />}</g>
		<LightEyes k={eye} open={open} v={v} />
	</g>
);

// profile (facing +x): long head, straight nose, long neck
const PROF_E = 'M30,-226 C104,-226 146,-186 152,-126 C154,-108 152,-98 156,-88 C166,-62 178,-44 186,-28 C190,-20 184,-14 174,-13 L166,-12 C167,-4 171,3 167,9 C163,14 167,22 165,30 C161,42 150,46 150,58 C150,88 122,110 92,114 C72,116 62,134 60,166 C58,240 60,330 66,410 C150,430 300,450 380,530 L420,700 L-420,700 L-370,530 C-300,460 -190,430 -150,410 C-146,330 -144,240 -150,170 C-176,120 -194,40 -194,-60 C-192,-170 -94,-226 30,-226 Z';
const ProfileBust: React.FC<{v: Voice; draw: number; open: number; eye: 'almond' | 'closed' | 'side'; mouth?: 'soft' | 'none'; back?: React.ReactNode; front?: React.ReactNode; tears?: number; T: number}> = ({v, draw, open, eye, mouth = 'soft', back, front, tears = 0, T}) => (
	<g>
		{back}
		<path d={PROF_E} fill={INK} opacity={draw} />
		<Glow d={PROF_E} v={v} draw={draw} />
		{front}
		<g opacity={draw}>
			<path d="M-34,-80 C-54,-84 -58,-44 -40,-30" stroke="#fff" strokeWidth={2} fill="none" opacity={0.8} />
			<path d="M92,-112 C108,-120 126,-118 140,-108" stroke="#fff" strokeWidth={2.6} fill="none" strokeLinecap="round" />
			{mouth === 'soft' && <path d="M146,32 C140,36 132,36 126,32" stroke="#fff" strokeWidth={2.2} fill="none" />}
		</g>
		<g transform="translate(120,-84)">
			<ellipse rx={44} ry={20} fill={v.col} opacity={0.55 * open} filter="url(#gM)" />
			{eye === 'closed'
				? <path d="M-22,0 C-8,9 10,9 22,0" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.95} />
				: <path d={eye === 'side' ? 'M-24,0 C-14,-9 4,-10 22,-3 C6,6 -12,6 -24,0 Z' : 'M-22,2 C-10,-10 10,-10 24,-2 C10,7 -10,7 -22,2 Z'} fill="#fff" opacity={0.35 + 0.65 * open} />}
		</g>
		{tears > 0 && [0, 1].map((k) => { const ph = (T * 0.45 + k * 0.5) % 1; return <g key={k} opacity={tears * Math.sin(Math.PI * ph)}><path d={`M126,${-76 + ph * 150} c6,10 9,15 0,21 c-9,-6 -6,-11 0,-21 Z`} fill="#fff" /><circle cx={126} cy={-60 + ph * 150} r={12} fill={v.col} opacity={0.5} filter="url(#gS)" /></g>; })}
	</g>
);

const fing = (bx: number, by: number, tx: number, ty: number, w: number, curl: number) => { const mx = (bx + tx) / 2 + curl, my = (by + ty) / 2; const dx = tx - bx, dy = ty - by, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L; const w0 = w / 2, w1 = w * 0.42; return `M${bx + nx * w0},${by + ny * w0} Q${mx + nx * w0},${my + ny * w0} ${tx + nx * w1},${ty + ny * w1} A${w1},${w1} 0 0,0 ${tx - nx * w1},${ty - ny * w1} Q${mx - nx * w0},${my - ny * w0} ${bx - nx * w0},${by - ny * w0} Z`; };
const flower = (x: number, y: number, r: number, n = 5) => Array.from({length: n}, (_, p) => { const a = (p / n) * Math.PI * 2; return `M${x},${y} C${x + Math.cos(a - 0.5) * r * 1.2},${y + Math.sin(a - 0.5) * r * 1.2} ${x + Math.cos(a + 0.5) * r * 1.2},${y + Math.sin(a + 0.5) * r * 1.2} ${x},${y}`; }).join(' ');

type FigProps = {T: number; v: Voice; draw: number; open: number; orn: (i: number) => number};

// 喜 — 飞天: twin hair loops high on the head, gold flower pins, 花钿, flying ribbons
const FigXi: React.FC<FigProps> = ({T, v, draw, open, orn}) => {
	const hair = 'M-110,-60 C-118,-150 -70,-214 0,-214 C70,-214 118,-150 110,-60 C98,-120 60,-160 0,-160 C-60,-160 -98,-120 -110,-60 Z';
	const loop = (s: 1 | -1) => `M${s * 30},-200 C${s * 10},-300 ${s * 90},-370 ${s * 150},-330 C${s * 206},-292 ${s * 170},-210 ${s * 96},-196`;
	const rib = (s: 1 | -1) => { const w = 18 * Math.sin(T * 1.4 + s); return `M${s * 120},380 C${s * 260},${300 + w} ${s * 360},${120 - w} ${s * 300},${-60 + w} C${s * 260},${-160 + w} ${s * 330},${-240 - w} ${s * 420},${-250 + w}`; };
	return <g>
		{[1, -1].map((s) => <g key={'r' + s} opacity={orn(2)}><path d={rib(s as 1 | -1)} stroke="#ff7a5a" strokeWidth={10} fill="none" opacity={0.25} filter="url(#gM)" /><path d={rib(s as 1 | -1)} stroke="#ff8a6a" strokeWidth={3} fill="none" /></g>)}
		<FrontBust v={v} draw={draw} open={open} eye="happy" brow="calm" mouth="laugh"
			back={<g opacity={draw}>{[1, -1].map((s) => <g key={s}><path d={loop(s as 1 | -1) + ' Z'} fill={INK} /><Glow d={loop(s as 1 | -1)} v={v} /></g>)}</g>}
			front={<g opacity={draw}>
				<path d={hair} fill={INK} /><Glow d={hair} v={v} />
				<path d="M0,-160 C-4,-140 -2,-120 0,-104" stroke={v.col} strokeWidth={1.6} opacity={0.6} fill="none" />
				<g opacity={orn(0)}>{[1, -1].map((s) => <g key={s}><Gold d={flower(s * 104, -238, 20)} w={2} /><circle cx={s * 104} cy={-238} r={5} fill="url(#goldG)" /><Gold d={`M${s * 126},-226 L${s * 150},-150`} w={1.4} /><circle cx={s * 150} cy={-146} r={4} fill={v.col} /></g>)}</g>
				<g opacity={orn(1)}><Gold d={flower(0, -132, 9, 3)} w={1.6} /></g>
				<g opacity={orn(1)}>{[1, -1].map((s) => <g key={'e' + s}><Gold d={`M${s * 104},-30 L${s * 106},0`} w={1.2} /><circle cx={s * 106} cy={8} r={7} fill="url(#goldG)" /></g>)}</g>
			</g>} />
	</g>;
};

// 怒 — 怒发冲冠: hair sweeping up into five flame locks; gold diadem with a jewel; armoured collar
const FigNu: React.FC<FigProps> = ({T, v, draw, open, orn}) => {
	const lock = (x: number, h: number, lean: number, w: number, k: number) => { const s = Math.sin(T * 4 + k) * 10; return `M${x - w},-150 C${x - w * 1.1},${-150 - h * 0.45} ${x + lean - w * 0.3 + s},${-150 - h * 0.8} ${x + lean + s},${-150 - h} C${x + lean + w * 0.5 + s},${-150 - h * 0.6} ${x + w * 1.2},${-150 - h * 0.35} ${x + w},-150`; };
	const locks = [[-120, 170, -90, 34], [-62, 250, -40, 36], [0, 310, 4, 38], [62, 250, 44, 36], [120, 170, 92, 34]];
	const hair = 'M-110,-56 C-120,-130 -100,-170 -80,-186 C-40,-206 40,-206 80,-186 C100,-170 120,-130 110,-56 C96,-118 58,-150 0,-152 C-58,-150 -96,-118 -110,-56 Z';
	return <FrontBust v={v} draw={draw} open={open} eye="angry" brow="angry" mouth="set"
		back={<g opacity={draw}>
			{locks.map(([x, h, lean, w], k) => <g key={k}><path d={lock(x, h, lean, w, k) + ' Z'} fill="url(#fireHairG)" /><path d={lock(x, h, lean, w, k)} stroke="#ffd8a0" strokeWidth={2} fill="none" opacity={0.8} /></g>)}
		</g>}
		front={<g opacity={draw}>
			<path d={hair} fill={INK} /><Glow d={hair} v={v} />
			<g opacity={orn(0)}><Gold d="M-104,-118 C-60,-150 60,-150 104,-118" w={3} /><path d="M0,-150 L12,-128 L0,-104 L-12,-128 Z" fill={v.col} stroke="#fff2c8" strokeWidth={1.6} /><circle cx={0} cy={-128} r={18} fill={v.col} opacity={0.4} filter="url(#gS)" /></g>
			<g opacity={orn(1)}>{[1, -1].map((s) => <g key={s}><Gold d={`M${s * 66},404 C${s * 160},378 ${s * 290},392 ${s * 380},470`} w={3} /><Gold d={`M${s * 120},420 L${s * 150},360 L${s * 170},416 M${s * 200},424 L${s * 236},350 L${s * 252},430 M${s * 280},446 L${s * 322},370 L${s * 330},460`} w={2} /></g>)}</g>
		</g>} />;
};

// 哀 — profile, head bowed; long straight hair; a gold band from which pearl tears hang
const FigAi: React.FC<FigProps> = ({T, v, draw, open, orn}) => {
	const hair = 'M150,-150 C146,-210 90,-246 20,-246 C-90,-246 -186,-176 -198,-60 C-210,80 -214,240 -230,700 L-140,700 C-136,420 -140,260 -150,170 C-176,120 -186,40 -180,-40 C-170,-120 -100,-160 -10,-168 C60,-172 120,-164 150,-150 Z';
	return <g transform="rotate(12)"><ProfileBust T={T} v={v} draw={draw} open={open} eye="closed" mouth="none" tears={open}
		back={null}
		front={<g opacity={draw}>
			<path d={hair} fill={INK} /><Glow d={hair} v={v} />
			{[0, 1, 2].map((k) => <path key={k} d={`M${-170 + k * 14},-40 C${-176 + k * 14},160 ${-182 + k * 12},380 ${-196 + k * 14},700`} stroke={v.col} strokeWidth={1.4} fill="none" opacity={0.5} />)}
			<g opacity={orn(0)}>
				<Gold d="M140,-160 C60,-176 -60,-170 -150,-120" w={2.6} />
				{Array.from({length: 9}, (_, k) => { const u = k / 8, x = lerp(110, -130, u), y = lerp(-164, -128, u) + 6 * Math.sin(u * 3), L = 60 + 50 * Math.sin(u * Math.PI), sw = 3 * Math.sin(T * 1.5 + k); return <g key={k}><line x1={x} y1={y} x2={x + sw} y2={y + L} stroke={GOLD} strokeWidth={1.1} /><path d={`M${x + sw},${y + L - 2} c6,10 8,15 0,20 c-8,-5 -6,-10 0,-20 Z`} fill="#eef4ff" stroke={v.col} strokeWidth={1} /></g>; })}
			</g>
		</g>} /></g>;
};

// 惧 — wide light-eyes over two hands clamped to the mouth; hair standing up in sharp points; a thin diadem
const FigJu: React.FC<FigProps> = ({T, v, draw, open, orn}) => {
	const tr = 1.4 * Math.sin(T * 37) * Math.sin(T * 6.3);
	const pts = Array.from({length: 15}, (_, i) => { const a = lerp(-168, -12, i / 14) * Math.PI / 180, r0 = 172, r1 = 222 + 44 * Math.sin(i * 1.9) ** 2; return [Math.cos(a) * r0, Math.sin(a) * r0 - 30, Math.cos(a) * r1, Math.sin(a) * r1 - 30] as const; });
	const hair = 'M-108,-60 ' + pts.map(([x0, y0, x1, y1], i) => `L${x1.toFixed(1)},${y1.toFixed(1)} L${(pts[i + 1] ? (x0 + pts[i + 1][0]) / 2 : 108).toFixed(1)},${(pts[i + 1] ? (y0 + pts[i + 1][1]) / 2 : -60).toFixed(1)}`).join(' ') + ' C96,-120 58,-150 0,-152 C-58,-150 -96,-120 -108,-60 Z';
	const fingers = (s: 1 | -1) => [0, 1, 2, 3].map((i) => fing(s * (12 + i * 24), 170 + i * 6, s * (6 + i * 26) + tr, [40, 26, 32, 50][i] + tr, 24 - i * 1.4, s * (6 - i * 2)));
	return <FrontBust v={v} draw={draw} open={open} eye="wide" brow="up" mouth="soft" hideMouth
		front={<g>
			<g opacity={draw}><path d={hair} fill={INK} /><Glow d={hair} v={v} w={3} /></g>
			<g opacity={orn(0)}><Gold d="M-100,-128 C-60,-150 60,-150 100,-128" w={2.2} />{[-60, -30, 0, 30, 60].map((x) => <circle key={x} cx={x} cy={-144 + Math.abs(x) * 0.25} r={3.5} fill="url(#goldG)" />)}</g>
			<g opacity={orn(1)} transform={`translate(0,${80 * (1 - out3(orn(1)))})`}>
				{[1, -1].map((s) => <g key={s}>
					<path d={`M${s * 4},166 C${s * 4},214 ${s * 22},258 ${s * 56},292 L${s * 100},420 L${s * 200},420 C${s * 176},330 ${s * 136},240 ${s * 116},186 C${s * 90},166 ${s * 36},158 ${s * 4},166 Z`} fill={INK} stroke={v.col} strokeWidth={3} />
					<path d={fing(s * 114, 210, s * 104 + tr, 90, 26, s * 20)} fill={INK} stroke={v.col} strokeWidth={3} />
					{fingers(s as 1 | -1).slice().reverse().map((d, i) => <path key={i} d={d} fill={INK} stroke={v.col} strokeWidth={3} />)}
					<Gold d={`M${s * 70},300 C${s * 100},290 ${s * 130},296 ${s * 150},310`} w={2} />
				</g>)}
			</g>
		</g>} />;
};

// 爱 — profile, long hair lifting in the wind; a gold crown of peonies; one red thread from the heart
const FigLove: React.FC<FigProps> = ({T, v, draw, open, orn}) => {
	const w = (k: number) => Math.sin(T * 1.3 - k * 0.7) * 22;
	const hair = `M150,-150 C146,-210 90,-246 20,-246 C-100,-246 -190,-180 -204,-80 C${-300 + w(0)},${-40} ${-420 + w(1)},${40} ${-520 + w(2)},${60} C${-420 + w(1)},${100} ${-330 + w(0)},${110} -230,${100} C${-300 + w(2)},${170} ${-380 + w(3)},${250} ${-460 + w(3)},${300} C${-360},${300} -250,240 -170,170 C-180,120 -190,40 -184,-40 C-172,-120 -100,-160 -10,-168 C60,-172 120,-164 150,-150 Z`;
	return <ProfileBust T={T} v={v} draw={draw} open={open} eye="almond"
		front={<g opacity={draw}>
			<path d={hair} fill={INK} /><Glow d={hair} v={v} />
			{[0, 1, 2].map((k) => <path key={k} d={`M${-10 - k * 40},-200 C${-160 - k * 30},${-170 + k * 20} ${-300 - k * 30 + w(k)},${-20 + k * 40} ${-460 + w(k + 1)},${60 + k * 60}`} stroke={v.col} strokeWidth={1.4} fill="none" opacity={0.55} />)}
			<g opacity={orn(0)}>
				<Gold d="M140,-170 C80,-218 -40,-224 -130,-184" w={2.6} />
				{[[96, -214, 22], [20, -236, 28], [-62, -228, 22]].map(([x, y, r], k) => <g key={k}><Gold d={flower(x, y, r, 6)} w={1.8} /><circle cx={x} cy={y} r={r * 0.32} fill={v.col} /></g>)}
			</g>
			<g opacity={orn(1)}><Gold d="M-30,-40 L-28,-10" w={1.2} /><circle cx={-28} cy={-2} r={7} fill={v.col} /></g>
		</g>} />;
};

// 恶 — profile turned away, a high bun with long gold pins, a gold-edged half veil from the pin to below the chin, a side glance
const FigWu: React.FC<FigProps> = ({T, v, draw, open, orn}) => {
	const hair = 'M150,-150 C146,-210 90,-246 20,-246 C-90,-246 -184,-180 -196,-80 C-204,0 -184,90 -150,170 C-170,110 -184,30 -176,-50 C-164,-124 -96,-160 -10,-168 C60,-172 120,-164 150,-150 Z';
	const bun = 'M-120,-226 C-150,-300 -70,-352 -14,-316 C24,-290 10,-238 -30,-232';
	return <ProfileBust T={T} v={v} draw={draw} open={open} eye="side" mouth="none"
		front={<g>
			<g opacity={draw}><path d={bun + ' Z'} fill={INK} /><Glow d={bun} v={v} /><path d={hair} fill={INK} /><Glow d={hair} v={v} /></g>
			<g opacity={orn(0)}>{[0, 1].map((k) => <g key={k} transform={`translate(-70,-290) rotate(${-160 + k * 30})`}><Gold d="M-40,0 L190,0" w={2.4} /><circle cx={190} cy={0} r={6} fill={v.col} /></g>)}<Gold d="M-110,-262 C-80,-280 -40,-282 -14,-262" w={2} /></g>
			{/* the veil hangs from a gold hook at the temple, covers nose and mouth, a fringe of beads */}
			<g opacity={orn(1)}>
				<path d={`M40,-60 C100,-66 160,-56 194,-40 C${200 + 3 * Math.sin(T * 1.3)},20 ${192 + 4 * Math.sin(T * 1.1)},90 ${172 + 4 * Math.sin(T * 1.2)},150 C120,170 70,160 46,130 C30,60 32,0 40,-60 Z`} fill="url(#veilG)" />
				<Gold d={`M40,-60 C100,-66 160,-56 194,-40`} w={1.8} />
				<Gold d={`M46,130 C70,160 120,170 ${172 + 4 * Math.sin(T * 1.2)},150`} w={1.6} />
				{Array.from({length: 7}, (_, k) => { const u = k / 6, x = lerp(50, 170, u), y = 136 + 24 * Math.sin(Math.PI * u) + 2 * Math.sin(T * 2 + k); return <g key={k}><line x1={x} y1={y} x2={x} y2={y + 14} stroke={GOLD} strokeWidth={1} /><circle cx={x} cy={y + 16} r={3.2} fill={k % 2 ? GOLD : v.col} /></g>; })}
				<circle cx={40} cy={-60} r={6} fill="url(#goldG)" />
				<Gold d="M40,-60 C10,-70 -14,-72 -30,-70" w={1.4} />
			</g>
		</g>} />;
};

// 欲 — front, half-lidded light-eyes, a fan of peacock eyes as a crown, coin earrings, glowing lips
const FigYu: React.FC<FigProps> = ({T, v, draw, open, orn}) => {
	const hair = 'M-112,-50 C-122,-150 -70,-214 0,-214 C70,-214 122,-150 112,-50 C110,60 130,220 160,420 L96,420 C80,240 82,80 86,-40 C66,-120 -66,-120 -86,-40 C-82,80 -80,240 -96,420 L-160,420 C-130,220 -110,60 -112,-50 Z';
	return <g>
		<g opacity={orn(0)} transform={`scale(${lerp(0.7, 1, outBack(orn(0)))})`}>
			{Array.from({length: 11}, (_, i) => { const a = lerp(-165, -15, i / 10) * Math.PI / 180, L = 360 + 24 * Math.sin(i * 1.3), ex = Math.cos(a) * L, ey = Math.sin(a) * L - 150; return <g key={i}>
				<Gold d={`M0,-150 L${ex},${ey}`} w={1} o={0.7} />
				<ellipse cx={ex} cy={ey} rx={22} ry={32} transform={`rotate(${a * 180 / Math.PI + 90},${ex},${ey})`} fill={INK} stroke={v.col} strokeWidth={2.4} />
				<ellipse cx={ex} cy={ey} rx={9} ry={14} transform={`rotate(${a * 180 / Math.PI + 90},${ex},${ey})`} fill="#3ad0c0" opacity={0.85} />
				<circle cx={ex} cy={ey} r={4} fill="url(#goldG)" />
			</g>; })}
		</g>
		<FrontBust v={v} draw={draw} open={open} eye="lidded" brow="calm" mouth="part"
			front={<g opacity={draw}>
				<path d={hair} fill={INK} /><Glow d={hair} v={v} />
				<g opacity={orn(1)}><Gold d="M-96,-132 C-50,-160 50,-160 96,-132" w={2.6} /><circle cx={0} cy={-154} r={9} fill={v.col} stroke="#fff2c8" strokeWidth={1.4} /></g>
				<g opacity={orn(1)}>{[1, -1].map((s) => <g key={s} transform={`translate(${s * 120},10)`}><Gold d="M0,-36 L0,-2" w={1.2} /><circle r={15} fill="url(#goldG)" /><rect x={-4.5} y={-4.5} width={9} height={9} fill={INK} /></g>)}</g>
			</g>} />
	</g>;
};

// ---------------------------------------------------------------- halo: a gold ring carrying the 礼记 line; 欲 a square-holed coin
const Halo: React.FC<{T: number; v: Voice; s: number; disc: number}> = ({T, v, s, disc}) => {
	if (v.kind === 'yu') return <g transform={`scale(${s}) rotate(${T * 4})`}>
		<circle r={600} fill="url(#auraG)" />
		<circle r={360} fill="url(#goldG)" opacity={0.18} />
		<circle r={360} fill="none" stroke="url(#goldG)" strokeWidth={8} />
		<circle r={338} fill="none" stroke={GOLD} strokeWidth={1.6} />
		<rect x={-160} y={-160} width={320} height={320} fill="#0a0612" stroke="url(#goldG)" strokeWidth={6} />
		{['七', '情', '之', '欲'].map((c, i) => <text key={c} transform={`rotate(${i * 90}) translate(0,${-360 + 64})`} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 54}} fill="#fff2c8" opacity={0.8}>{c}</text>)}
	</g>;
	return <g transform={`scale(${s})`}>
		<circle r={620} fill="url(#auraG)" />
		<circle r={330} fill="url(#discG)" opacity={disc} />
		<circle r={392} fill="none" stroke={GOLD} strokeWidth={1} opacity={0.35} />
		<circle r={360} fill="none" stroke="url(#goldG)" strokeWidth={3} />
		<circle r={326} fill="none" stroke="url(#goldG)" strokeWidth={1.4} opacity={0.8} />
		<g transform={`rotate(${T * 3})`}>
			{Array.from({length: 96}, (_, i) => <line key={i} x1={0} y1={-360} x2={0} y2={i % 8 === 0 ? -374 : -367} stroke={GOLD} strokeWidth={i % 8 === 0 ? 1.8 : 1} transform={`rotate(${i * 3.75})`} opacity={0.75} />)}
			<path id={`ring${v.n}`} d="M0,-343 A343,343 0 1,1 -0.1,-343" fill="none" />
			<text style={{fontFamily: SERIF, fontSize: 20, letterSpacing: '0.9em', fontWeight: 600}} fill={GOLD} opacity={0.8}><textPath href={`#ring${v.n}`}>喜 怒 哀 惧 爱 恶 欲 · 七 者 弗 学 而 能 · 喜 怒 哀 惧 爱 恶 欲 · 七 者 弗 学 而 能 ·</textPath></text>
		</g>
		{[0, 90, 180, 270].map((a) => <path key={a} transform={`rotate(${a}) translate(0,-360)`} d="M0,-20 L5,-5 L20,0 L5,5 L0,20 L-5,5 L-20,0 L-5,-5 Z" fill="url(#goldG)" />)}
	</g>;
};

// ---------------------------------------------------------------- the world: faint constellation + the voice's own floating symbols
const Constellation: React.FC<{T: number; v: Voice}> = ({T, v}) => <g opacity={0.5}>
	{Array.from({length: 22}, (_, i) => <circle key={i} cx={820 + rnd(i, 1) * 1100} cy={40 + rnd(i, 2) * 1000} r={1.4 + 1.6 * rnd(i, 3)} fill="#fff" opacity={0.4 + 0.4 * Math.sin(T * 1.1 + i) ** 2} />)}
	{[[0, 3], [3, 7], [7, 11], [2, 9], [11, 15], [15, 19], [5, 13]].map(([a, b], i) => <line key={i} x1={820 + rnd(a, 1) * 1100} y1={40 + rnd(a, 2) * 1000} x2={820 + rnd(b, 1) * 1100} y2={40 + rnd(b, 2) * 1000} stroke="#fff" strokeWidth={0.8} opacity={0.25} />)}
	<circle cx={520} cy={560} r={640} fill="none" stroke={v.hot} strokeWidth={1.6} opacity={0.35} />
</g>;
const World: React.FC<{T: number; v: Voice; u: number; cx: number; cy: number}> = ({T, v, u, cx, cy}) => {
	if (u <= 0) return null;
	const float = (n: number, draw: (x: number, y: number, i: number, ph: number) => React.ReactNode, up = false, sp = 0.06) => Array.from({length: n}, (_, i) => { const ph = (T * (sp + 0.04 * rnd(i, 41)) + rnd(i, 42)) % 1, x = 820 + rnd(i, 43) * 1080 + 30 * Math.sin(T * 0.6 + i), y = up ? 1100 - ph * 1180 : -40 + ph * 1160; return <g key={i} opacity={u * Math.sin(Math.PI * ph)}>{draw(x, y, i, ph)}</g>; });
	switch (v.kind) {
		case 'xi': return <g>{float(16, (x, y, i) => <g transform={`translate(${x},${y}) rotate(${T * 30 + i * 40})`}><path d="M0,-9 L2.5,-2.5 L9,0 L2.5,2.5 L0,9 L-2.5,2.5 L-9,0 L-2.5,-2.5 Z" fill="url(#goldG)" /></g>, true)}{[0, 1].map((k) => { const ph = ((T + k * BAR / 2) % BAR) / BAR, bx = [980, 1800][k], by = [200, 260][k]; return <g key={k} opacity={u * (1 - ph)}>{Array.from({length: 16}, (_, i) => { const a = i / 16 * Math.PI * 2, r = 20 + 110 * out3(ph); return <line key={i} x1={bx + Math.cos(a) * r * 0.6} y1={by + Math.sin(a) * r * 0.6} x2={bx + Math.cos(a) * r} y2={by + Math.sin(a) * r} stroke={GOLD} strokeWidth={2} strokeLinecap="round" />; })}</g>; })}</g>;
		case 'nu': return <g>{float(26, (x, y, i) => <circle cx={x} cy={y} r={2 + 2.5 * rnd(i, 5)} fill={i % 2 ? '#ffb070' : '#fff1c4'} />, true, 0.1)}{Array.from({length: 7}, (_, i) => { const x = 880 + i * 170, h = 180 + 90 * rnd(i, 71) + 30 * Math.sin(T * 4 + i), w = 70; return <path key={'f' + i} d={`M${x - w},1090 C${x - w},${1090 - h * 0.6} ${x + 10 * Math.sin(T * 5 + i)},${1090 - h * 0.8} ${x},${1090 - h} C${x + w * 0.4},${1090 - h * 0.6} ${x + w},${1090 - h * 0.4} ${x + w},1090 Z`} fill="url(#flameG)" opacity={0.35 * u} filter="url(#gS)" />; })}</g>;
		case 'ai': return <g>{Array.from({length: 46}, (_, i) => { const ph = (T * (1.0 + 0.4 * rnd(i, 81)) + rnd(i, 82)) % 1, x = 820 + rnd(i, 83) * 1100, y = -60 + ph * 1200; return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 38} stroke={v.hot} strokeWidth={1.1} opacity={0.35 * u} />; })}</g>;
		case 'ju': return <g>{[[930, 170], [1860, 230], [1880, 830], [940, 900], [1640, 70], [1200, 1010], [1000, 520]].map(([x, y], i) => { const op = out3((u - i * 0.08) * 2.5), ang = Math.atan2(cy - y, cx - x); return op > 0 && <g key={i} transform={`translate(${x},${y}) scale(${0.85 + 0.3 * rnd(i, 13)})`} opacity={0.9}><path d={`M-40,0 Q0,${-24 * op} 40,0 Q0,${24 * op} -40,0 Z`} fill="#02080b" stroke={v.col} strokeWidth={2.2} /><circle cx={Math.cos(ang) * 9 * op} cy={Math.sin(ang) * 6 * op} r={8 * op} fill="#fff" /></g>; })}</g>;
		case 'love': return <g>
			<g transform={`translate(${cx + 30},${cy - 30}) rotate(${T * 3}) scale(${lerp(0.7, 1, out3(u))})`} opacity={u * 0.75}>{[[8, 520, 260], [8, 400, 210]].map(([n, r, w], ring) => Array.from({length: n}, (_, i) => <path key={ring + '-' + i} transform={`rotate(${(i / n) * 360 + ring * 22})`} d={`M0,0 C${-w * 0.6},${-r * 0.35} ${-w},${-r * 0.8} ${-w * 0.35},${-r} C${-w * 0.12},${-r * 1.06} ${w * 0.12},${-r * 0.94} 0,${-r * 0.9} C${w * 0.12},${-r * 0.94} ${w * 0.35},${-r * 1.06} ${w * 0.35},${-r} C${w},${-r * 0.8} ${w * 0.6},${-r * 0.35} 0,0 Z`} fill={v.col} fillOpacity={0.05 + 0.03 * ring} stroke={v.col} strokeWidth={1.2} strokeOpacity={0.4} />))}</g>
			{float(14, (x, y, i) => <ellipse cx={x} cy={y} rx={6} ry={11} transform={`rotate(${T * 60 + i * 40},${x},${y})`} fill={v.col} opacity={0.7} />, true)}
		</g>;
		case 'wu': return <g opacity={u}>{[0, 1, 2, 3].map((i) => { const len = 1500, d = [`M1920,140 C1720,180 1660,360 1520,330`, `M1920,920 C1720,860 1700,1000 1540,1080`, `M840,1080 C900,960 1000,980 1030,880`, `M860,60 C960,160 940,260 1040,300`][i]; const pr = out3(u * 1.4 - i * 0.1); return <g key={i}><path d={d} stroke={v.col} strokeWidth={2.6} fill="none" strokeDasharray={len} strokeDashoffset={len * (1 - pr)} /></g>; })}{float(10, (x, y) => <circle cx={x} cy={y} r={60} fill={v.col} opacity={0.06} filter="url(#gL)" />, true, 0.03)}</g>;
		case 'yu': return <g>{float(12, (x, y, i) => <g transform={`translate(${x},${y}) rotate(${T * 60 + i * 30}) scale(${Math.cos(T * 2 + i)},1)`}><circle r={14} fill="url(#goldG)" /><rect x={-4.5} y={-4.5} width={9} height={9} fill="#1a0a2c" /></g>, false, 0.08)}</g>;
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
	xi: {dx: 0, dy: 70, s: 1.18}, nu: {dx: 0, dy: 90, s: 1.18}, ai: {dx: 40, dy: 60, s: 1.15, flip: true}, ju: {dx: 0, dy: 60, s: 1.3},
	love: {dx: 40, dy: 40, s: 1.18, flip: true}, wu: {dx: -40, dy: 50, s: 1.18}, yu: {dx: 0, dy: 90, s: 1.18},
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
				<Constellation T={T} v={v} />
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

export const QiQing8: React.FC = () => {
	const T = useCurrentFrame() / FPS;
	let i = 0; while (i < 6 && T >= Q0[i + 1]) i++;
	const node = T < Q0[0] ? <Intro T={T} /> : T < OUT ? <VoiceScene T={T} v={VOICES[i]} i={i} /> : <Outro T={T} />;
	return <AbsoluteFill style={{background: '#030205'}}>
		{node}
		<div style={{position: 'absolute', right: 56, bottom: 40, fontFamily: SERIF, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(230,224,245,0.4)'}}>VIBE知识大赏 · 七情</div>
	</AbsoluteFill>;
};

registerRoot(() => <Composition id="QQ8" component={QiQing8} durationInFrames={Math.round(QQ7_END * FPS)} fps={FPS} width={W} height={H} />);
