import React from 'react';
import {AbsoluteFill, Composition, registerRoot, staticFile, useCurrentFrame} from 'remotion';

/* 《七情》 v3 — dark-neon mood kept, everything else our own:
   - the voices are front-facing, symmetric 东方"情神" (crowns, bead veils, 步摇, red threads), not side profiles;
   - the frame is a turning 铜镜 (cloud-scroll band, bosses, seal-script ring, god rays), not a sigil;
   - before the reveal the mirror shows the moment itself (the send button, the hot cup), not floating eyes;
   - the reveal: the mirror ripples, the voice rises out of it, ornaments pop in one by one, the eyes open with a flare.
   Source: 《礼记·礼运》“喜、怒、哀、惧、爱、恶、欲，七者弗学而能。” */

const W = 1920, H = 1080, FPS = 30;
const BEAT = 0.5108, BAR = BEAT * 4;
const cl01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (u: number) => { const v = cl01(u); return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
const out3 = (u: number) => 1 - Math.pow(1 - cl01(u), 3);
const outBack = (u: number) => { const v = cl01(u), c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(v - 1, 3) + c1 * Math.pow(v - 1, 2); };
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const fade = (T: number, a: number, d = 0.4) => ease((T - a) / d);
const rnd = (i: number, k = 0) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };

const SERIF = '"Noto Serif CJK SC", serif';
const GOLD = '#e6c47a', GOLD2 = '#b8924a';

type Voice = {n: number; ch: string; py: string; col: string; deep: string; when: string; line: string; sym: string; say: string; kind: 'fear' | 'love'};
const SEVEN = [
	{ch: '喜', col: '#ffc94a'}, {ch: '怒', col: '#ff4a3a'}, {ch: '哀', col: '#7aa2ff'}, {ch: '惧', col: '#6fe3ff'},
	{ch: '爱', col: '#ff5d8f'}, {ch: '恶', col: '#a6e36a'}, {ch: '欲', col: '#c47bff'},
];
const VOICES: Voice[] = [
	{n: 4, ch: '惧', py: 'jù', col: '#6fe3ff', deep: '#0e3a4a', when: '它在你按下发送前说', line: '“万一，他不回呢？”', sym: '珠帘后的眼睛', say: '怕失去，所以不敢开口。', kind: 'fear'},
	{n: 5, ch: '爱', py: 'ài', col: '#ff5d8f', deep: '#4a0e26', when: '它在你记住他随口一句话时说', line: '“他说过，他怕冷。”', sym: '一根红线', say: '心里有人，才会记得。', kind: 'love'},
];
const NUM = ['零', '一', '二', '三', '四', '五', '六', '七'];

// timeline on the bar grid of the BGM (117.5 BPM); every reveal lands on a downbeat
const INTRO = 3 * BAR, CYCLE = 4 * BAR, REVEAL = 2 * BAR;
const OUTRO_AT = INTRO + VOICES.length * CYCLE;
export const QQ3_END = OUTRO_AT + 2 * BAR + 0.5;
export const QQ3_MUSIC_FROM = 16.63 - (INTRO + REVEAL);

// ---------------------------------------------------------------- defs
const Defs: React.FC<{col: string; deep: string}> = ({col, deep}) => (
	<defs>
		<filter id="gS" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.5" /></filter>
		<filter id="gM" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="11" /></filter>
		<filter id="gL" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="38" /></filter>
		<radialGradient id="bgG" cx="0.7" cy="0.48" r="0.8"><stop offset="0" stopColor={deep} stopOpacity="0.9" /><stop offset="0.45" stopColor="#0b0912" /><stop offset="1" stopColor="#040307" /></radialGradient>
		<radialGradient id="mirrorG" cx="0.42" cy="0.38" r="0.75"><stop offset="0" stopColor={col} stopOpacity="0.42" /><stop offset="0.55" stopColor={deep} stopOpacity="0.9" /><stop offset="1" stopColor="#07060c" /></radialGradient>
		<radialGradient id="auraG"><stop offset="0" stopColor={col} stopOpacity="0.45" /><stop offset="1" stopColor={col} stopOpacity="0" /></radialGradient>
		<radialGradient id="hotG"><stop offset="0" stopColor="#ffffff" /><stop offset="0.3" stopColor={col} stopOpacity="0.9" /><stop offset="1" stopColor={col} stopOpacity="0" /></radialGradient>
		<linearGradient id="nameG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="0.5" stopColor={col} /><stop offset="1" stopColor={deep} /></linearGradient>
		<linearGradient id="goldG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff2c8" /><stop offset="0.5" stopColor={GOLD} /><stop offset="1" stopColor={GOLD2} /></linearGradient>
		<linearGradient id="sheenG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.55" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
		<path id="seal1" d="M0,-262 A262,262 0 1,1 -0.1,-262" />
	</defs>
);

// ---------------------------------------------------------------- background: night, drifting cloud scrolls, motes
const Cloud: React.FC<{x: number; y: number; s: number; col: string; o: number}> = ({x, y, s, col, o}) => (
	<g transform={`translate(${x},${y}) scale(${s})`} opacity={o} fill="none" stroke={col} strokeWidth={2}>
		<path d="M0,0 C0,-30 40,-30 40,0 C40,22 14,22 14,6 C14,-6 28,-6 28,4" />
		<path d="M40,0 C50,-40 110,-40 110,0 C110,30 74,30 74,10 C74,-6 92,-6 92,6" />
		<path d="M-60,10 C-140,10 -150,-10 -200,-10 M110,0 C170,0 200,14 260,14" />
	</g>
);
const Night: React.FC<{T: number; col: string}> = ({T, col}) => (
	<g>
		<rect width={W} height={H} fill="url(#bgG)" />
		{[[300, 180, 1.1], [1650, 920, 1.3], [980, 980, 0.9], [120, 860, 1.0], [1760, 140, 0.8]].map(([x, y, s], i) => <Cloud key={i} x={x + 30 * Math.sin(T * 0.25 + i)} y={y} s={s} col={col} o={0.13} />)}
		{Array.from({length: 40}, (_, i) => { const x = rnd(i) * W, y = rnd(i, 1) * H; return <circle key={i} cx={x} cy={y} r={0.8 + rnd(i, 2) * 1.6} fill="#efe8ff" opacity={0.15 + 0.35 * Math.sin(T * 1.1 + i * 2.3) ** 2} />; })}
	</g>
);

// ---------------------------------------------------------------- the bronze mirror
const Mirror: React.FC<{T: number; x: number; y: number; col: string; lit: number; ripple: number; o?: number; s?: number; children?: React.ReactNode}> = ({T, x, y, col, lit, ripple, o = 1, s = 1, children}) => {
	const R = 330;
	return (
		<g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
			{/* god rays */}
			<g transform={`rotate(${T * 6})`} opacity={0.2 + 0.5 * lit}>
				{Array.from({length: 16}, (_, i) => <path key={i} transform={`rotate(${i * 22.5})`} d={`M-18,0 L0,-${760 + 80 * Math.sin(T * 1.7 + i)} L18,0 Z`} fill={col} opacity={i % 2 ? 0.18 : 0.1} filter="url(#gS)" />)}
			</g>
			<circle r={520} fill="url(#auraG)" opacity={0.6 + 0.4 * lit} />
			{/* rim */}
			<circle r={R + 22} fill="none" stroke="url(#goldG)" strokeWidth={4} opacity={0.7} />
			<circle r={R + 6} fill="none" stroke="url(#goldG)" strokeWidth={18} />
			<circle r={R + 6} fill="none" stroke="#fff2c8" strokeWidth={2} opacity={0.5} />
			{/* the cloud-scroll band, turning */}
			<g transform={`rotate(${T * 4})`}>
				{Array.from({length: 24}, (_, i) => <g key={i} transform={`rotate(${i * 15}) translate(0,-${R - 22})`}>
					<path d="M-16,4 C-16,-12 4,-14 4,-2 C4,6 -6,6 -6,0 M4,-2 C10,-14 22,-8 18,2" stroke={GOLD} strokeWidth={2.4} fill="none" />
				</g>)}
			</g>
			<circle r={R - 44} fill="none" stroke={GOLD} strokeWidth={1.6} opacity={0.7} />
			{/* seal-script ring, counter-turning */}
			<g transform={`rotate(${-T * 6})`}>
				<text style={{fontFamily: SERIF, fontSize: 21, letterSpacing: '0.75em', fontWeight: 600}} fill={GOLD} opacity={0.8}><textPath href="#seal1">喜 怒 哀 惧 爱 恶 欲 · 七 者 弗 学 而 能 · 喜 怒 哀 惧 爱 恶 欲 · 七 者 弗 学 而 能 ·</textPath></text>
			</g>
			<circle r={R - 86} fill="none" stroke={GOLD} strokeWidth={2.2} opacity={0.85} />
			{/* bosses */}
			{Array.from({length: 8}, (_, i) => { const a = i * Math.PI / 4 + T * 0.1; return <g key={i} transform={`translate(${Math.cos(a) * (R - 64)},${Math.sin(a) * (R - 64)})`}><circle r={9} fill="url(#goldG)" /><circle r={9} fill="none" stroke="#fff2c8" strokeWidth={1} opacity={0.6} /></g>; })}
			{/* the glass */}
			<circle r={R - 90} fill="url(#mirrorG)" />
			<g clipPath="url(#glassClip)">
				<rect x={-700 + ((T * 220) % 1400)} y={-300} width={160} height={600} fill="url(#sheenG)" transform="rotate(25)" opacity={0.35} />
				{children}
				{/* ripples on the reveal */}
				{ripple > 0 && ripple < 1 && [0, 0.18, 0.36].map((d, i) => { const u = cl01((ripple - d) / 0.64); return <circle key={i} r={10 + 260 * out3(u)} fill="none" stroke="#fff" strokeWidth={6 * (1 - u)} opacity={0.8 * (1 - u)} />; })}
			</g>
			<circle r={R - 90} fill="none" stroke={col} strokeWidth={4} opacity={0.3 + 0.7 * lit} filter="url(#gS)" />
		</g>
	);
};

// ---------------------------------------------------------------- the moments shown in the glass (neon line icons)
const MomentIcon: React.FC<{T: number; v: Voice; o: number}> = ({T, v, o}) => {
	const c = v.col;
	if (v.kind === 'fear') {
		const tremble = 3 * Math.sin(T * 33) * Math.sin(T * 5);
		return <g opacity={o}>
			<rect x={-70} y={-130} width={140} height={250} rx={20} fill="none" stroke={c} strokeWidth={4} />
			<rect x={-34} y={-70} width={66} height={30} rx={10} fill="none" stroke={c} strokeWidth={2.4} />
			<text x={-1} y={-49} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 18, fontWeight: 700}} fill={c}>在吗？</text>
			<rect x={-56} y={78} width={70} height={26} rx={9} fill="none" stroke={c} strokeWidth={2} />
			<rect x={20} y={78} width={38} height={26} rx={9} fill={c} opacity={0.5 + 0.5 * Math.sin(T * 4) ** 2} />
			<g transform={`translate(${60 + tremble},${150 + tremble})`}><path d="M-22,10 C-26,-20 -14,-40 4,-40 C20,-38 26,-16 22,12 C18,40 -18,40 -22,10 Z" fill="#0a0910" stroke={c} strokeWidth={3} /></g>
		</g>;
	}
	return <g opacity={o}>
		<path d="M-60,-30 L-48,110 C-46,128 46,128 48,110 L60,-30 Z" fill="none" stroke={c} strokeWidth={4} />
		<ellipse cx={0} cy={-30} rx={60} ry={13} fill="none" stroke={c} strokeWidth={3} />
		<path d="M60,0 C100,0 100,70 52,70" stroke={c} strokeWidth={4} fill="none" />
		{[0, 1, 2].map((i) => { const ph = (T * 0.55 + i / 3) % 1; return <path key={i} d={`M${-26 + i * 26},${-50 - ph * 90} c-12,-18 12,-30 0,-48`} stroke={c} strokeWidth={3} fill="none" opacity={Math.sin(Math.PI * ph)} />; })}
		<path d="M-120,140 C-40,120 60,124 130,150" stroke={c} strokeWidth={10} fill="none" opacity={0.85} />
	</g>;
};

// ---------------------------------------------------------------- the voices: front-facing, symmetric
const FACE = 'M0,-150 C80,-150 112,-80 108,-10 C104,60 62,128 0,150 C-62,128 -104,60 -108,-10 C-112,-80 -80,-150 0,-150 Z';
const BODY = 'M-46,118 C-48,170 -50,210 -56,236 C-130,256 -270,276 -340,340 C-390,390 -410,470 -420,620 L420,620 C410,470 390,390 340,340 C270,276 130,256 56,236 C50,210 48,170 46,118';
const sym = (d: (s: 1 | -1) => React.ReactNode) => <>{d(1)}{d(-1)}</>;

let eyesT = (T: number) => T;
const Deity: React.FC<{T: number; v: Voice; u: number; eyes: number; orn: (i: number) => number; since: number}> = ({T, v, u, eyes, orn, since}) => {
	eyesT = () => since;
	const c = v.col, len = 2600, draw = out3(u);
	const line = (d: string, w = 3, extra: React.SVGProps<SVGPathElement> = {}) => <>
		<path d={d} fill="none" stroke={c} strokeWidth={w * 3} opacity={0.45} filter="url(#gM)" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} {...extra} />
		<path d={d} fill="none" stroke={c} strokeWidth={w} strokeDasharray={len} strokeDashoffset={len * (1 - draw)} {...extra} />
	</>;
	const sway = Math.sin(T * 1.8);
	return <g>
		{/* body and face filled with night, outlined in light */}
		<path d={BODY + ' Z'} fill="#0b0a12" opacity={draw} />
		<path d={FACE} fill="#0d0b16" opacity={draw} />
		{line(BODY, 3)}
		{line(FACE, 3.2)}
		{/* hair: centre parting, framing the face */}
		{v.kind === 'love'
			? sym((s) => <g key={s}>{line(`M0,-152 C${-s * 90},-170 ${-s * 170},-120 ${-s * 160},-10 C${-s * 150},100 ${-s * 190},220 ${-s * 230},330`, 2.6)}{line(`M0,-150 C${-s * 70},-140 ${-s * 120},-90 ${-s * 116},-20`, 1.6)}</g>)
			: sym((s) => <g key={s}>{line(`M0,-152 C${-s * 100},-168 ${-s * 160},-110 ${-s * 150},-10 C${-s * 146},50 ${-s * 130},100 ${-s * 110},130`, 2.6)}</g>)}
		{/* collar: layered, embroidered */}
		{line('M-170,262 C-100,300 -40,330 0,372 C40,330 100,300 170,262', 2.4)}
		{line('M-120,250 C-70,276 -30,300 0,330 C30,300 70,276 120,250', 1.6)}
		<g opacity={orn(0)}>{Array.from({length: 9}, (_, i) => { const t = i / 8, px = lerp(-150, 150, t), py = 262 + 100 * (1 - Math.abs(t - 0.5) * 2) * 1.05; return <circle key={i} cx={px} cy={py - 8} r={3.2} fill={GOLD} />; })}</g>
		{/* face: brows, nose, lips */}
		<g opacity={draw}>
			{sym((s) => <path key={s} d={`M${s * 18},-44 C${s * 34},-54 ${s * 58},-54 ${s * 72},-44`} stroke={c} strokeWidth={2.4} fill="none" />)}
			<path d="M-7,40 C-3,46 3,46 7,40" stroke={c} strokeWidth={2} fill="none" />
			<path d="M-20,82 C-8,76 8,76 20,82 C8,92 -8,92 -20,82 Z" fill={v.kind === 'love' ? c : 'none'} stroke={c} strokeWidth={2} opacity={0.9} />
		</g>
		{/* eyes: closed lines → open, white-hot with a flare */}
		{sym((s) => <g key={s} transform={`translate(${s * 44},-8)`}>
			<path d={`M-24,0 Q0,${lerp(8, -12, eyes)} 24,0 Q0,${lerp(8, 12, eyes)} -24,0 Z`} fill="#fff" opacity={eyes} />
			<path d="M-24,0 Q0,9 24,0" stroke="#fff" strokeWidth={2.6} fill="none" opacity={draw * (1 - eyes)} />
			<ellipse rx={56} ry={24} fill={c} opacity={0.8 * eyes} filter="url(#gM)" />
		</g>)}
		{eyes > 0 && <g opacity={eyes * Math.max(0, 1 - Math.max(0, eyesT(T) - 0.15) / 0.5)}>
			<rect x={-260} y={-10} width={520} height={4} fill="#fff" opacity={0.8} filter="url(#gS)" />
			<rect x={-160} y={-12} width={320} height={8} fill={c} opacity={0.7} filter="url(#gM)" />
		</g>}

		{v.kind === 'fear' && <>
			{/* crown of ice shards */}
			<g opacity={orn(1)} transform={`translate(0,${-20 * (1 - outBack(orn(1)))})`}>
				{Array.from({length: 13}, (_, i) => { const a = lerp(-155, -25, i / 12) * Math.PI / 180, L = 70 + 90 * (1 - Math.abs(i - 6) / 6) + 20 * rnd(i), r0 = 162; const x0 = Math.cos(a) * r0, y0 = Math.sin(a) * r0 - 10, x1 = Math.cos(a) * (r0 + L), y1 = Math.sin(a) * (r0 + L) - 10, nx = -Math.sin(a) * 9, ny = Math.cos(a) * 9; return <g key={i}><path d={`M${x0 + nx},${y0 + ny} L${x1},${y1} L${x0 - nx},${y0 - ny} Z`} fill={c} opacity={0.18} /><path d={`M${x0 + nx},${y0 + ny} L${x1},${y1} L${x0 - nx},${y0 - ny}`} stroke={c} strokeWidth={2} fill="none" /></g>; })}
				<path d="M-150,-112 C-80,-150 80,-150 150,-112" stroke="url(#goldG)" strokeWidth={6} fill="none" />
			</g>
			{/* the bead veil across the brow: it trembles */}
			<g opacity={orn(2)}>
				{Array.from({length: 11}, (_, i) => { const x0 = -100 + i * 20, n = 5 + (i % 2), tr = 2.2 * Math.sin(T * 27 + i * 1.7); return <g key={i}>
					<line x1={x0} y1={-104} x2={x0 + tr} y2={-104 + n * 15} stroke={GOLD} strokeWidth={1} opacity={0.7} />
					{Array.from({length: n}, (_, k) => <circle key={k} cx={x0 + tr * (k / n)} cy={-96 + k * 15} r={3.4} fill={k === n - 1 ? c : GOLD} />)}
				</g>; })}
				<path d="M-112,-106 C-60,-120 60,-120 112,-106" stroke="url(#goldG)" strokeWidth={4} fill="none" />
			</g>
			{/* side tassels to the shoulders */}
			<g opacity={orn(3)}>{sym((s) => <g key={s} transform={`translate(${s * 150},-104) rotate(${s * 3 * sway})`}>
				<line x1={0} y1={0} x2={0} y2={260} stroke={GOLD} strokeWidth={1.4} />
				{Array.from({length: 9}, (_, k) => <circle key={k} cx={0} cy={18 + k * 28} r={k % 3 === 2 ? 6 : 3.4} fill={k % 3 === 2 ? c : GOLD} />)}
			</g>)}</g>
			{/* frost on the shoulders */}
			<g opacity={orn(4)}>{Array.from({length: 14}, (_, i) => { const s = i % 2 ? 1 : -1, x = s * (200 + 18 * (i >> 1)), y = 330 + 12 * Math.sin(i); return <path key={i} transform={`translate(${x},${y}) rotate(${i * 23})`} d="M-8,0 L8,0 M0,-8 L0,8 M-6,-6 L6,6 M-6,6 L6,-6" stroke={c} strokeWidth={1.6} />; })}</g>
		</>}

		{v.kind === 'love' && <>
			{/* phoenix crown: wing feathers fanning out, five blossoms */}
			<g opacity={orn(1)} transform={`translate(0,${-24 * (1 - outBack(orn(1)))})`}>
				{sym((s) => <g key={s}>{Array.from({length: 9}, (_, i) => { const a = (-90 + s * (24 + i * 9)) * Math.PI / 180, L = 120 + 12 * i; return <path key={i} d={`M${s * 40},-150 Q${s * 40 + Math.cos(a) * L * 0.6},${-150 + Math.sin(a) * L * 0.6 - 30} ${s * 40 + Math.cos(a) * L},${-150 + Math.sin(a) * L}`} stroke={i % 3 ? GOLD : c} strokeWidth={i % 3 ? 1.6 : 2.4} fill="none" />; })}</g>)}
				{[-2, -1, 0, 1, 2].map((k) => { const px = k * 46, py = -168 - 24 * (1 - Math.abs(k) / 2); return <g key={k} transform={`translate(${px},${py}) rotate(${T * 20 * (k % 2 ? 1 : -1)})`}>{Array.from({length: 6}, (_, p) => <ellipse key={p} cx={0} cy={-9} rx={5} ry={10} transform={`rotate(${p * 60})`} fill={c} opacity={0.75} />)}<circle r={4} fill={GOLD} /></g>; })}
				<path d="M-140,-140 C-70,-176 70,-176 140,-140" stroke="url(#goldG)" strokeWidth={6} fill="none" />
			</g>
			{/* 步摇: dangling chains that swing */}
			<g opacity={orn(2)}>{sym((s) => <g key={s} transform={`translate(${s * 128},-140) rotate(${s * 2 + 7 * sway})`}>
				<line x1={0} y1={0} x2={0} y2={170} stroke={GOLD} strokeWidth={1.4} />
				{Array.from({length: 6}, (_, k) => <circle key={k} cx={0} cy={22 + k * 26} r={3.2} fill={GOLD} />)}
				<path d="M0,170 C10,182 10,196 0,206 C-10,196 -10,182 0,170 Z" fill={c} />
			</g>)}</g>
			{/* 花钿 on the brow */}
			<g opacity={orn(3)} transform="translate(0,-82)">{[0, 1, 2].map((p) => <ellipse key={p} cx={0} cy={-6} rx={4} ry={9} transform={`rotate(${(p - 1) * 40})`} fill={c} />)}</g>
			{/* the heart on the chest and the red threads it sends out */}
			<g opacity={orn(4)}>
				<circle cx={0} cy={300} r={60} fill="url(#hotG)" opacity={0.7 + 0.3 * Math.sin(T * 4)} />
				<path d="M0,318 C-34,294 -34,262 -12,262 C-4,262 0,270 0,276 C0,270 4,262 12,262 C34,262 34,294 0,318 Z" fill={c} />
				{Array.from({length: 7}, (_, i) => { const a = (-160 + i * 23) * Math.PI / 180, L = 330 + 40 * rnd(i), ex = Math.cos(a) * L, ey = 300 + Math.sin(a) * L * 0.6 + 120, w = 30 * Math.sin(T * 1.6 + i); const tl = 900, dash = tl * (1 - cl01(orn(4) * 1.3 - i * 0.05)); return <g key={i}>
					<path d={`M0,300 C${ex * 0.3},${300 + w} ${ex * 0.7},${ey - w} ${ex},${ey}`} stroke={c} strokeWidth={2.2} fill="none" strokeDasharray={tl} strokeDashoffset={dash} />
					<circle cx={ex} cy={ey} r={5} fill={c} opacity={dash < 10 ? 1 : 0} />
				</g>; })}
			</g>
		</>}
	</g>;
};

/** particles in the voice's element: frost for fear, petals for love; plus a spark burst on the reveal */
const Particles: React.FC<{T: number; v: Voice; burst: number; cx: number; cy: number}> = ({T, v, burst, cx, cy}) => (
	<g>
		{Array.from({length: 46}, (_, i) => {
			const sp = 0.05 + 0.06 * rnd(i, 1), ph = (T * sp + rnd(i, 2)) % 1;
			if (v.kind === 'fear') { const x = 900 + rnd(i, 3) * 1000 + 40 * Math.sin(T * 0.8 + i), y = -40 + ph * 1160; return <path key={i} transform={`translate(${x},${y}) rotate(${T * 40 + i * 30}) scale(${0.6 + rnd(i, 4)})`} d="M-6,0 L6,0 M0,-6 L0,6 M-4,-4 L4,4 M-4,4 L4,-4" stroke={v.col} strokeWidth={1.6} opacity={0.6 * Math.sin(Math.PI * ph)} />; }
			const x = 900 + rnd(i, 3) * 1000 + 60 * Math.sin(T * 0.7 + i), y = 1120 - ph * 1200; return <ellipse key={i} cx={x} cy={y} rx={4 + 4 * rnd(i, 5)} ry={8 + 6 * rnd(i, 6)} transform={`rotate(${T * 60 + i * 40},${x},${y})`} fill={v.col} opacity={0.55 * Math.sin(Math.PI * ph)} />;
		})}
		{burst > 0 && burst < 1 && Array.from({length: 60}, (_, i) => { const a = rnd(i, 7) * Math.PI * 2, d = (200 + 600 * rnd(i, 8)) * out3(burst); return <circle key={'b' + i} cx={cx + Math.cos(a) * d} cy={cy + Math.sin(a) * d} r={(2 + 3 * rnd(i, 9)) * (1 - burst)} fill={i % 3 ? GOLD : '#fff'} opacity={1 - burst} />; })}
	</g>
);

/** text that sharpens out of a blur */
const BlurText: React.FC<{x: number; y: number; text: string; size: number; u: number; out?: number; weight?: number; col?: string; spacing?: string; anchor?: 'start' | 'middle'; id: string}> = ({x, y, text, size, u, out = 0, weight = 900, col = '#fff', spacing = '0.04em', anchor = 'start', id}) => {
	const b = 14 * (1 - out3(u)) + 18 * ease(out), o = cl01(u * 1.6) * (1 - ease(out));
	if (o <= 0.001) return null;
	return <g>
		<filter id={id} x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation={b.toFixed(2)} /></filter>
		<text x={x} y={y} textAnchor={anchor} style={{fontFamily: SERIF, fontWeight: weight, fontSize: size, letterSpacing: spacing}} fill={col} opacity={o * 0.45} filter="url(#gM)">{text}</text>
		<text x={x + 24 * (1 - out3(u))} y={y} textAnchor={anchor} style={{fontFamily: SERIF, fontWeight: weight, fontSize: size, letterSpacing: spacing}} fill={col} opacity={o} filter={b > 0.2 ? `url(#${id})` : undefined}>{text}</text>
	</g>;
};

/** a tiny mirror icon for the seven */
const MiniMirror: React.FC<{x: number; y: number; ch: string; col: string; o: number; s?: number}> = ({x, y, ch, col, o, s = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
		<circle r={44} fill={col} opacity={0.14} filter="url(#gM)" />
		<circle r={38} fill="none" stroke="url(#goldG)" strokeWidth={4} />
		<circle r={30} fill="#0b0912" stroke={col} strokeWidth={2} />
		{Array.from({length: 8}, (_, i) => <circle key={i} cx={Math.cos(i * Math.PI / 4) * 38} cy={Math.sin(i * Math.PI / 4) * 38} r={2.6} fill={GOLD} />)}
		<text y={12} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 32}} fill={col}>{ch}</text>
	</g>
);

// ---------------------------------------------------------------- one voice
const VoiceScene: React.FC<{T: number; v: Voice}> = ({T, v}) => {
	const sx = 1400, sy = 520;
	const cap = fade(T, 0.3, 0.5), quote = fade(T, 0.65, 0.9), outQ = fade(T, REVEAL - 0.32, 0.3);
	const icon = fade(T, 0.2, 0.6) * (1 - fade(T, REVEAL - 0.25, 0.25));
	const ripple = cl01((T - REVEAL + 0.1) / 0.9);
	const rise = cl01((T - REVEAL) / 0.8), eyes = ease((T - REVEAL - 0.9) / 0.3);
	const orn = (i: number) => out3(cl01((T - REVEAL - 0.55 - i * 0.16) / 0.45));
	const flash = Math.max(0, 1 - Math.abs(T - REVEAL) / 0.2), flare = Math.max(0, 1 - Math.abs(T - REVEAL - 0.95) / 0.25);
	const sub = fade(T, REVEAL + 0.3, 0.4), name = cl01((T - REVEAL - 0.5) / 0.45), say = fade(T, REVEAL + 1.4, 0.5), tags = fade(T, REVEAL + 1.8, 0.5);
	const leave = fade(T, CYCLE - 0.4, 0.4);
	const push = 1 + 0.04 * ease(T / CYCLE), tilt = 0.6 * Math.sin(T * 0.4);
	const nameSweep = cl01((T - REVEAL - 0.9) / 0.8);
	return (
		<svg width={W} height={H}>
			<Defs col={v.col} deep={v.deep} />
			<clipPath id="glassClip"><circle r={240} /></clipPath>
			<g opacity={1 - leave}>
				<Night T={T} col={v.col} />
				<g transform={`translate(${sx},${sy}) rotate(${tilt}) scale(${push}) translate(${-sx},${-sy})`}>
					<Mirror T={T} x={sx} y={sy} col={v.col} lit={rise} ripple={ripple} o={fade(T, 0, 0.5)} s={lerp(0.92, 1, out3(T / 1.2))}>
						<MomentIcon T={T} v={v} o={icon} />
					</Mirror>
					{/* the voice rises out of the glass */}
					{rise > 0 && <g transform={`translate(${sx},${sy + lerp(150, 10, out3(rise))}) scale(${lerp(0.55, 1.14, out3(rise))})`} opacity={cl01(rise * 2.5)}>
						<Deity T={T} v={v} u={rise} eyes={eyes} orn={orn} since={T - REVEAL - 0.9} />
					</g>}
				</g>
				<Particles T={T} v={v} burst={cl01((T - REVEAL) / 1.1)} cx={sx} cy={sy} />
				{/* left: the moment and the line */}
				<BlurText id={`c${v.n}`} x={190} y={470} text={v.when} size={34} weight={600} col="#c9c2d8" spacing="0.16em" u={cap} out={outQ} />
				<BlurText id={`q${v.n}`} x={170} y={580} text={v.line} size={82} u={quote} out={outQ} />
				{/* left: the name */}
				<BlurText id={`s${v.n}`} x={190} y={340} text={`七情之${NUM[v.n]} · 它叫`} size={34} weight={600} col="#e2dcef" spacing="0.2em" u={sub} />
				{name > 0 && <g transform={`translate(180,620) scale(${lerp(1.5, 1, outBack(name))}) translate(-180,-620)`} opacity={cl01(name * 2)}>
					<clipPath id={`sweep${v.n}`}><rect x={150 + 360 * nameSweep - 60} y={350} width={80} height={320} transform="skewX(-20)" /></clipPath>
					<text x={180} y={620} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 280}} fill={v.col} opacity={0.6} filter="url(#gM)">{v.ch}</text>
					<text x={180} y={620} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 280}} fill="url(#nameG)">{v.ch}</text>
					<text x={180} y={620} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 280}} fill="#fff" clipPath={`url(#sweep${v.n})`} opacity={0.9}>{v.ch}</text>
					<rect x={470} y={410} width={8} height={210} fill="url(#goldG)" />
					<text x={500} y={470} style={{fontFamily: SERIF, fontWeight: 600, fontSize: 46, fontStyle: 'italic', letterSpacing: '0.12em'}} fill="#f3eefc">{v.py}</text>
					<text x={500} y={540} style={{fontFamily: SERIF, fontWeight: 600, fontSize: 30, letterSpacing: '0.2em'}} fill={GOLD}>七情 · 之{NUM[v.n]}</text>
				</g>}
				<BlurText id={`y${v.n}`} x={190} y={730} text={v.say} size={44} weight={700} col="#efe9ff" spacing="0.08em" u={say} />
				{tags > 0 && <g opacity={tags} transform="translate(190,815)">
					{[['出处', '《礼记·礼运》'], ['象征', v.sym]].map(([k, val], i) => <g key={k} transform={`translate(${i * 340},0)`}>
						<rect x={0} y={-30} width={64} height={40} rx={4} fill={v.col} />
						<text x={32} y={-2} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 22}} fill="#0a0910">{k}</text>
						<text x={80} y={-1} style={{fontFamily: SERIF, fontWeight: 600, fontSize: 28}} fill="#e8e2f4">{val}</text>
					</g>)}
				</g>}
			</g>
			{/* reveal flash and eye flare */}
			{flash > 0 && <>
				<rect width={W} height={H} fill={v.col} opacity={0.2 * flash} />
				<ellipse cx={sx} cy={sy} rx={1000 * flash} ry={70} fill="#fff" opacity={0.6 * flash} filter="url(#gL)" />
				<circle cx={sx} cy={sy} r={300 * flash} fill="#fff" opacity={0.35 * flash} filter="url(#gL)" />
			</>}
			{flare > 0 && <ellipse cx={sx} cy={sy + 32} rx={700 * flare} ry={14} fill="#fff" opacity={0.7 * flare} filter="url(#gM)" />}
		</svg>
	);
};

// ---------------------------------------------------------------- intro / outro
const Intro: React.FC<{T: number}> = ({T}) => {
	const leave = fade(T, INTRO - 0.45, 0.45);
	return (
		<svg width={W} height={H}>
			<Defs col="#c9c2ff" deep="#1a1630" />
			<g opacity={1 - leave}>
				<Night T={T} col="#c9c2ff" />
				<BlurText id="i1" x={960} y={360} text="两千年前，《礼记》写道：" size={38} weight={600} col="#c9c2d8" spacing="0.14em" anchor="middle" u={fade(T, 0.2, 0.6)} />
				<BlurText id="i2" x={960} y={470} text="人心里，天生住着七个声音。" size={80} anchor="middle" u={fade(T, 0.9, 0.8)} />
				{SEVEN.map((s, i) => { const o = cl01((T - (2.2 + i * BEAT * 0.5)) / 0.2); return <MiniMirror key={s.ch} x={960 + (i - 3) * 130} y={640} ch={s.ch} col={s.col} o={o} s={lerp(1.6, 1, outBack(o))} />; })}
				<BlurText id="i3" x={960} y={790} text="七者，弗学而能" size={32} weight={600} col={GOLD} spacing="0.5em" anchor="middle" u={fade(T, 4.4, 0.6)} />
			</g>
		</svg>
	);
};
const Outro: React.FC<{T: number}> = ({T}) => {
	const q = fade(T, 0.2, 0.6), qOut = fade(T, 1.6, 0.4), title = fade(T, 2.0, 0.6);
	return (
		<svg width={W} height={H}>
			<Defs col={GOLD} deep="#2a1f10" />
			<Night T={T} col={GOLD} />
			<g opacity={1 - qOut}>
				<BlurText id="o1" x={960} y={450} text="你心里，哪个声音最大？" size={72} anchor="middle" u={q} />
				{SEVEN.map((s, i) => <MiniMirror key={s.ch} x={960 + (i - 3) * 130} y={610} ch={s.ch} col={s.col} o={fade(T, 0.6 + i * 0.08, 0.25)} />)}
			</g>
			{title > 0 && <g opacity={title} transform={`translate(960,540) scale(${lerp(1.2, 1, out3(title))}) translate(-960,-540)`}>
				<g transform={`translate(960,520) rotate(${T * 8})`}>{SEVEN.map((s, i) => { const a = i / 7 * Math.PI * 2; return <circle key={s.ch} cx={Math.cos(a) * 300} cy={Math.sin(a) * 300} r={12} fill={s.col} filter="url(#gS)" />; })}<circle r={300} fill="none" stroke="url(#goldG)" strokeWidth={2} opacity={0.6} /></g>
				<text x={960} y={580} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 200, letterSpacing: '0.12em'}} fill="#fff2d0" opacity={0.6} filter="url(#gM)">七情</text>
				<text x={960} y={580} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 200, letterSpacing: '0.12em'}} fill="url(#goldG)">七情</text>
				<text x={960} y={670} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 600, fontSize: 32, letterSpacing: '0.9em'}} fill={GOLD}>喜怒哀惧爱恶欲</text>
			</g>}
		</svg>
	);
};

export const QiQing3: React.FC = () => {
	const T = useCurrentFrame() / FPS;
	let node: React.ReactNode;
	if (T < INTRO) node = <Intro T={T} />;
	else if (T < OUTRO_AT) { const i = Math.floor((T - INTRO) / CYCLE); node = <VoiceScene T={T - INTRO - i * CYCLE} v={VOICES[i]} />; }
	else node = <Outro T={T - OUTRO_AT} />;
	return <AbsoluteFill style={{background: '#050408'}}>
		<style>{`@font-face{font-family:Cormorant;font-style:italic;font-weight:600;src:url(${staticFile('fonts/cormorant-garamond-latin-500-italic.woff2')}) format('woff2');}`}</style>
		{node}
		<div style={{position: 'absolute', right: 56, bottom: 40, fontFamily: SERIF, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(230,224,245,0.4)'}}>VIBE知识大赏 · 七情</div>
	</AbsoluteFill>;
};

registerRoot(() => <Composition id="QQ3" component={QiQing3} durationInFrames={Math.round(QQ3_END * FPS)} fps={FPS} width={W} height={H} />);
