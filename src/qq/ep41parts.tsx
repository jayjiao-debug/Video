import React from 'react';
import {Img, staticFile} from 'remotion';
import {Lit, Look2, Walker2} from './walker2';

/* ep41 《为了跟你说一句话，人类努力了三千年》 — polished key frames v2.
   Painted era backgrounds (generated, checked for anachronisms, flaws painted out), the walker as hero with a rim light,
   each era's "sentence" as a drawn prop, refined label and subtitle typography. */
export const W = 1920, H = 1080;
export const SERIF = '"Noto Serif CJK SC", serif', SANS = '"Noto Sans CJK SC", sans-serif', LATS = '"DejaVu Serif", serif', MONO = '"DejaVu Sans Mono", monospace';
export const GOLD = '#f2cf7a', CYAN = '#9fe8ff';
export const rnd = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

export const LOOK: Record<string, Look2> = {
	shang: {dress: 'robe', sleeves: 'wide', head: 'bun', beard: 'short', carry: 'bone', stoop: 6},
	du: {dress: 'robe', sleeves: 'wide', head: 'futou', beard: 'long', carry: 'letter', stoop: 9},
	morse: {dress: 'coat', head: 'tophat', carry: 'tape', stoop: 5},
	scott: {dress: 'coat', head: 'short', beard: 'full', carry: 'none', stoop: 4},
	bell: {dress: 'coat', head: 'short', beard: 'full', carry: 'none', stoop: 12},
	watson: {dress: 'shirt', head: 'short', beard: 'moustache', carry: 'none', stoop: 3},
	marconi: {dress: 'coat', head: 'cap', beard: 'moustache', carry: 'none', stoop: 4},
	kline: {dress: 'shirt', head: 'bowl', carry: 'paper', stoop: 3},
	bj: {dress: 'jacket', head: 'glasses', carry: 'disk', stoop: 4},
};

/** painted background placed so its walking path sits on the shared line, with a soft band for subtitles */
export const BG: React.FC<{k: string; oy: number; dim?: number}> = ({k, oy, dim = 0}) => <>
	<Img src={staticFile(`ep41/${k}.webp`)} style={{position: 'absolute', left: 0, top: oy, width: W, height: H}} />
	<div style={{position: 'absolute', left: 0, top: oy + H - 2, width: W, height: Math.max(0, -oy) + 4, background: '#0a0810'}} />
	<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 80%, rgba(6,5,10,0.9) 88%, rgba(6,5,10,1) 90.5%)'}} />
	{dim > 0 && <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${dim})`}} />}
</>;
/** a soft glow drawn with a radial gradient (no blur filter, so no clipped boxes) */
export const Glow: React.FC<{x: number; y: number; r: number; c?: string; o?: number}> = ({x, y, r, c = '#ffb44a', o = 0.3}) => { const id = 'g' + c.replace('#', '');
	return <><defs><radialGradient id={id}><stop offset="0" stopColor={c} stopOpacity="1" /><stop offset="0.45" stopColor={c} stopOpacity="0.45" /><stop offset="1" stopColor={c} stopOpacity="0" /></radialGradient></defs><circle cx={x} cy={y} r={r} fill={`url(#${id})`} opacity={o} /></>; };

export const Label: React.FC<{year: string; name: string}> = ({year, name}) => <g>
	<defs><radialGradient id="lblS" cx="0.2" cy="0.3" r="0.8"><stop offset="0" stopColor="#000" stopOpacity="0.5" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient></defs>
	<ellipse cx={330} cy={130} rx={420} ry={150} fill="url(#lblS)" />
	<rect x={96} y={96} width={40} height={5} fill="#e0453a" />
	<text x={148} y={106} style={{fontFamily: SANS, fontWeight: 500, fontSize: 28, letterSpacing: '0.06em'}} fill="#fff" opacity={0.9}>{year}</text>
	<text x={96} y={160} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 44, letterSpacing: '0.04em'}} fill="#fff" stroke="rgba(0,0,0,0.35)" strokeWidth={4} paintOrder="stroke">{name}</text>
</g>;
export const Subs: React.FC<{nat?: string; zh: string; lat?: string}> = ({nat, zh, lat = LATS}) => <g>
	{nat && <text x={W / 2} y={952} textAnchor="middle" style={{fontFamily: lat, fontSize: 36, fontStyle: lat === LATS ? 'italic' : 'normal', letterSpacing: '0.02em'}} fill="#fff" opacity={0.88}>{nat}</text>}
	<text x={W / 2} y={nat ? 1014 : 990} textAnchor="middle" style={{fontFamily: SANS, fontSize: 48, fontWeight: 700, letterSpacing: '0.04em'}} fill="#ffe6b0">{zh}</text>
</g>;

/* ---- props: each era's sentence ---- */
export const Plastron: React.FC = () => <g transform="translate(1470,280)"><Glow x={0} y={0} r={230} c="#ffcf8a" o={0.22} />
	<path d="M-140,-180 Q-160,0 -115,160 Q0,205 115,160 Q160,0 140,-180 Q0,-215 -140,-180 Z" fill="#e6d6ad" />
	<path d="M0,-200 L0,190 M-140,-55 L140,-55 M-132,55 L132,55" stroke="#b9a073" strokeWidth={2} />
	<path d="M-70,-140 l0,40 l20,-12 M60,-10 l0,34 l-18,-9 M-80,80 l0,32 l16,-7" stroke="#6b4320" strokeWidth={3} fill="none" />
	{[['其', 45, -110], ['自', 45, -48], ['東', 45, 14], ['來', -50, -110], ['雨', -50, -48]].map(([c, x, y]) => <text key={c as string} x={x as number} y={y as number} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 300, fontSize: 50}} fill="#6b3a1a">{c}</text>)}
</g>;
export const Phonautograph: React.FC<{x: number; y: number}> = ({x, y}) => <g transform={`translate(${x},${y})`}>
	<rect x={-150} y={-12} width={300} height={12} fill="#3a2a1e" /><rect x={-140} y={-110} width={10} height={98} fill="#3a2a1e" /><rect x={120} y={-110} width={10} height={98} fill="#3a2a1e" />
	<rect x={-10} y={-160} width={150} height={56} rx={26} fill="#151318" stroke="#5a4a3a" strokeWidth={3} /><line x1={-30} y1={-132} x2={160} y2={-132} stroke="#5a4a3a" strokeWidth={4} />
	<path d="M-10,-132 L-170,-215 Q-190,-132 -170,-50 Z" fill="#7a5a36" /><path d="M-170,-215 Q-190,-132 -170,-50" stroke="#c9a46a" strokeWidth={3} fill="none" />
</g>;
export const SoundRibbon: React.FC = () => <g transform="translate(600,330) rotate(-5)"><rect x={0} y={-46} width={880} height={92} fill="#0b0b0e" opacity={0.92} />
	<path d={'M14,0 ' + Array.from({length: 214}, (_, i) => `L${14 + i * 4},${((Math.sin(i * 0.9) * 17 + Math.sin(i * 0.23) * 9) * (0.55 + 0.45 * Math.sin(i * 0.05))).toFixed(1)}`).join(' ')} stroke="#f4ecd4" strokeWidth={2} fill="none" />
	<text x={0} y={76} style={{fontFamily: SANS, fontSize: 21}} fill="#d8dbe8" opacity={0.85}>烟熏纸上的声波 · 1860 年 4 月 9 日</text></g>;
export const Morse: React.FC = () => { const pts: [number, number][] = [[330, 228], [1450, 317], [1920, 342]]; const sym = '·—— · —·· ·· ·—'.split('');
	return <g>{sym.map((c, i) => { const u = 0.06 + i * 0.062, x = pts[0][0] + (pts[1][0] - pts[0][0]) * u, y = pts[0][1] + (pts[1][1] - pts[0][1]) * u + 4 * 8 * u * (1 - u); return c === ' ' ? null : <g key={i}>
		{c === '·' ? <circle cx={x} cy={y} r={7} fill={GOLD} /> : <rect x={x - 16} y={y - 5} width={32} height={10} rx={5} fill={GOLD} />}<Glow x={x} y={y} r={18} c={GOLD} o={0.6} /></g>; })}</g>; };
export const BellProps: React.FC = () => <g>
	{/* Bell's liquid transmitter on the left bench, Watson's receiver on the right table, the wire through the wall */}
	<g transform="translate(560,650)"><rect x={-40} y={-6} width={80} height={10} fill="#3a2414" /><rect x={-6} y={-80} width={12} height={76} fill="#3a2414" /><path d="M-4,-80 L-44,-120 L36,-120 Z" fill="#6a4a2a" stroke="#c9a46a" strokeWidth={2} /><rect x={-14} y={-26} width={28} height={20} rx={4} fill="#9fb8c8" opacity={0.6} /></g>
	<g transform="translate(1110,690)"><rect x={-30} y={-40} width={60} height={40} rx={4} fill="#2a1a10" stroke="#c9a46a" strokeWidth={2} /><circle cx={0} cy={-20} r={11} fill="#4a3220" /></g>
	<path d="M560,530 Q560,250 760,250 L1000,250 Q1110,250 1110,650" stroke="#2a1a10" strokeWidth={3} fill="none" />
	<path d="M560,530 Q560,250 760,250 L1000,250 Q1110,250 1110,650" stroke={GOLD} strokeWidth={4} fill="none" strokeDasharray="6 22 42 22" filter="url(#gS)" opacity={0.95} />
	<Glow x={1000} y={250} r={50} c={GOLD} o={0.5} />
</g>;
export const Marconi: React.FC = () => <g>
	<path d="M480,800 Q640,420 980,170" stroke="#0e1216" strokeWidth={2} fill="none" /><path d="M955,140 L1010,165 L990,215 L940,185 Z" fill="#14181e" /><path d="M975,215 q-10,30 6,60" stroke="#14181e" strokeWidth={2} fill="none" />
	<g transform="translate(2050,420)">{[260, 430, 600, 770, 940, 1110].map((r, i) => <path key={r} d={`M${-r * 0.95},${-r * 0.32} A${r},${r} 0 0,0 ${-r * 0.95},${r * 0.32}`} stroke={CYAN} strokeWidth={3} fill="none" opacity={0.75 - i * 0.1} />)}</g>
	{[0, 1, 2].map((i) => <g key={i}><circle cx={1290 + i * 64} cy={280} r={13} fill="#e8fbff" /><Glow x={1290 + i * 64} y={280} r={30} c={CYAN} o={0.7} /></g>)}
	<text x={1354} y={340} textAnchor="middle" style={{fontFamily: LATS, fontSize: 30, fontStyle: 'italic'}} fill="#e8fbff">“S”</text>
</g>;
export const Arpa: React.FC = () => <g>
	<g transform="translate(1240,250)"><rect x={-300} y={-150} width={600} height={300} rx={18} fill="#03100a" opacity={0.86} stroke="#1f4a2e" strokeWidth={4} />
		<text x={-210} y={70} style={{fontFamily: MONO, fontWeight: 700, fontSize: 190}} fill="#8dffae" filter="url(#gS)">LO</text>
		<text x={60} y={70} style={{fontFamily: MONO, fontWeight: 700, fontSize: 190}} fill="#8dffae" opacity={0.12}>G</text>
		{Array.from({length: 8}, (_, i) => <rect key={i} x={-300} y={-150 + i * 38 + 8 * rnd(i, 3)} width={600} height={3 + 5 * rnd(i, 4)} fill="#8dffae" opacity={0.1} />)}
		<text x={0} y={128} textAnchor="middle" style={{fontFamily: MONO, fontSize: 26, letterSpacing: '0.2em'}} fill="#ff6a5a">SYSTEM CRASH</text></g>
</g>;
export const Email: React.FC = () => <g>
	<path d="M560,300 Q960,240 1560,330" stroke={GOLD} strokeWidth={2} fill="none" strokeDasharray="4 10" opacity={0.7} />
	<text x={960} y={226} textAnchor="middle" style={{fontFamily: MONO, fontSize: 32}} fill="#fff7e0" stroke="rgba(40,30,60,0.6)" strokeWidth={5} paintOrder="stroke">Across the Great Wall we can reach every corner in the world.</text>
	<g transform="translate(1560,330)"><rect x={-26} y={-18} width={52} height={36} rx={3} fill="#fff7e0" /><path d="M-26,-18 L0,4 L26,-18" stroke="#8a7a60" strokeWidth={2} fill="none" /><Glow x={0} y={0} r={40} c={GOLD} o={0.6} /></g>
</g>;
export const Voyager: React.FC<{s?: number}> = ({s = 1}) => <g transform={`scale(${s})`}>
	<Glow x={0} y={30} r={230} c={GOLD} o={0.22} />
	<path d="M-130,-30 Q0,-140 130,-30 Z" fill="#d9dce6" /><path d="M-130,-30 Q0,-60 130,-30" stroke="#9aa0b0" strokeWidth={3} fill="none" /><rect x={-4} y={-120} width={8} height={90} fill="#d9dce6" />
	<path d="M-60,-30 L60,-30 L70,10 L-70,10 Z" fill="#9aa0b0" /><line x1={60} y1={-10} x2={300} y2={-50} stroke="#d9dce6" strokeWidth={4} /><line x1={-60} y1={0} x2={-270} y2={70} stroke="#d9dce6" strokeWidth={4} /><circle cx={-270} cy={70} r={14} fill="#9aa0b0" />
	<circle cx={-22} cy={58} r={46} fill="#d8b04a" /><circle cx={-22} cy={58} r={46} fill="none" stroke="#fff3c4" strokeWidth={2} />{[34, 25, 16].map((r) => <circle key={r} cx={-22} cy={58} r={r} fill="none" stroke="#a8862a" strokeWidth={1.5} />)}<circle cx={-22} cy={58} r={5} fill="#5a4410" />
</g>;
export const PROC = ['shang', 'du', 'morse', 'scott', 'bell', 'marconi', 'kline', 'bj'];
export const Procession: React.FC<{h?: number; x0?: number; gap?: number; gy?: number}> = ({h = 270, x0 = 330, gap = 182, gy = 920}) => <g transform={`translate(0,${gy - 880})`}>
	{PROC.map((k, i) => <Lit key={k} x={x0 + i * gap} h={h} q={0.3 + i * 0.47} look={LOOK[k]} col="#06050a" far="#151220" rim="#c9b8ff" />)}</g>;

