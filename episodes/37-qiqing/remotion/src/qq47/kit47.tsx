import React from 'react';
import {W, H, rnd, lerp} from '../qq42/kit42';
/* ep47 《定情信物 · 一人一半》 — look "对折剪纸" (folded paper-cut):
   every set is layered cut paper (flat paper planes, soft paper shadows, grain); people are cut-paper figures in ink-indigo
   with a thin paper-white edge; the love token is the only metal and the only glow (moon-gold). A paper-cut is made by
   folding the sheet in half: one cut, two halves — the film's 「一人一半」. */
export {W, H, rnd, lerp};

/* ---------- palette: one paper family ---------- */
export const PP = {
	ivory: '#F3E9D6', ivory2: '#E8DAC0', cream: '#F8F1E4',
	indigo: '#2F3A6B', indigo2: '#46548A', indigoL: '#7383B4', night: '#253058',
	teal: '#3F7F7A', tealL: '#78ADA3', sage: '#9DBB9A', leaf: '#5E8F6A', leafD: '#3F6B50',
	apricot: '#E9A070', rose: '#D97C86', roseL: '#EDB3B4', ochre: '#C8954D', ochreL: '#E3BE7E', brick: '#B5583E', lacquer: '#8E2F2B',
	plum: '#6A4A7E', lav: '#A99CC8', lavL: '#D5CCE6', sky: '#9FC3D8', skyL: '#D6E6EC',
	ink: '#262840', edge: '#FFF8EA',
};
export const AU = {core: '#FFF4D2', hi: '#FFE3A3', mid: '#F2B862', deep: '#B9782C', dark: '#7A4A18', halo: '#FFB45A'};   // the token: moon-gold metal
export const AG = {core: '#FFFFFF', hi: '#F1F4F7', mid: '#C9D2DB', deep: '#8D99A6', dark: '#5B6673'};                  // silver
export const KEY = '#FFD98A';   // key words: moon-gold, never glowing

/* ---------- defs: paper shadow, grain, metal gradients (put once per svg) ---------- */
export const PaperDefs: React.FC = () => <defs>
	<filter id="pd" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="7" stdDeviation="7" floodColor="#1b1830" floodOpacity="0.26" /></filter>
	<filter id="pdS" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#1b1830" floodOpacity="0.3" /></filter>
	<filter id="pdL" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#1b1830" floodOpacity="0.3" /></filter>
	<radialGradient id="auDisk" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor={AU.core} /><stop offset="0.35" stopColor={AU.hi} /><stop offset="0.75" stopColor={AU.mid} /><stop offset="1" stopColor={AU.deep} /></radialGradient>
	<linearGradient id="auBar" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={AU.core} /><stop offset="0.45" stopColor={AU.mid} /><stop offset="1" stopColor={AU.deep} /></linearGradient>
	<linearGradient id="agBar" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={AG.core} /><stop offset="0.5" stopColor={AG.mid} /><stop offset="1" stopColor={AG.deep} /></linearGradient>
	<radialGradient id="tokGlow"><stop offset="0" stopColor={AU.hi} stopOpacity="0.85" /><stop offset="0.45" stopColor={AU.halo} stopOpacity="0.28" /><stop offset="1" stopColor={AU.halo} stopOpacity="0" /></radialGradient>
</defs>;
/** soft moon-gold glow behind a token */
export const TokGlow: React.FC<{x: number; y: number; r: number; o?: number}> = ({x, y, r, o = 1}) => <circle cx={x} cy={y} r={r} fill="url(#tokGlow)" opacity={o} style={{mixBlendMode: 'screen'}} />;
/** whole-frame paper grain + light vignette */
export const Grain: React.FC<{seed: number}> = ({seed}) => <g pointerEvents="none">
	<defs><radialGradient id={`vg${seed}`} cx="0.5" cy="0.5" r="0.8"><stop offset="0.62" stopColor="#1b1830" stopOpacity="0" /><stop offset="1" stopColor="#1b1830" stopOpacity="0.28" /></radialGradient>
		<filter id={`gr${seed}`} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 1.3 -0.42" /></filter></defs>
	<rect width={W} height={H} filter={`url(#gr${seed})`} opacity={0.07} style={{mixBlendMode: 'multiply'}} />
	<rect width={W} height={H} fill={`url(#vg${seed})`} />
</g>;

/* ---------- paper primitives ---------- */
/** a paper layer: fill + paper shadow; d is a path */
export const Sheet: React.FC<{d: string; c: string; sh?: 'pd' | 'pdS' | 'pdL' | 'none'; o?: number; stroke?: string}> = ({d, c, sh = 'pd', o = 1, stroke}) =>
	<path d={d} fill={c} filter={sh === 'none' ? undefined : `url(#${sh})`} opacity={o} stroke={stroke} strokeWidth={stroke ? 2 : 0} />;
/** a torn/deckled horizontal band from y0 down to the bottom (hills, ground), wobble amplitude a */
export const Band = (y0: number, a: number, seed: number, n = 9, y1 = H + 20) => {
	let d = `M-20,${y1} L-20,${y0}`;
	for (let i = 0; i <= n; i++) { const x = -20 + (W + 40) * i / n, y = y0 + (rnd(i, seed) - 0.5) * 2 * a, xm = x - (W + 40) / n / 2; if (i) d += ` Q${xm},${y0 + (rnd(i + 30, seed) - 0.5) * 2.4 * a} ${x},${y}`; }
	return d + ` L${W + 20},${y1} Z`;
};
/** full-frame background sheet */
export const Bg: React.FC<{c: string; c2?: string; id: string}> = ({c, c2, id}) => <g>
	{c2 && <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} /><stop offset="1" stopColor={c2} /></linearGradient></defs>}
	<rect width={W} height={H} fill={c2 ? `url(#${id})` : c} />
</g>;
/** cut-paper cloud (scalloped) */
export const Cloud: React.FC<{x: number; y: number; s?: number; c?: string; o?: number}> = ({x, y, s = 1, c = PP.ivory, o = 1}) =>
	<path d={`M${x - 160 * s},${y} C${x - 170 * s},${y - 50 * s} ${x - 110 * s},${y - 70 * s} ${x - 80 * s},${y - 48 * s} C${x - 70 * s},${y - 100 * s} ${x + 10 * s},${y - 110 * s} ${x + 30 * s},${y - 62 * s} C${x + 60 * s},${y - 92 * s} ${x + 130 * s},${y - 70 * s} ${x + 120 * s},${y - 24 * s} C${x + 170 * s},${y - 24 * s} ${x + 180 * s},${y} ${x + 160 * s},${y} Z`} fill={c} filter="url(#pdS)" opacity={o} />;
/** auspicious curl cloud (祥云) line motif */
export const Xiangyun: React.FC<{x: number; y: number; s?: number; c?: string; o?: number}> = ({x, y, s = 1, c = PP.ivory, o = 1}) =>
	<g opacity={o} filter="url(#pdS)"><path d={`M${x - 120 * s},${y} C${x - 120 * s},${y - 40 * s} ${x - 60 * s},${y - 54 * s} ${x - 40 * s},${y - 24 * s} C${x - 30 * s},${y - 70 * s} ${x + 40 * s},${y - 74 * s} ${x + 50 * s},${y - 30 * s} C${x + 80 * s},${y - 50 * s} ${x + 126 * s},${y - 26 * s} ${x + 110 * s},${y} Z`} fill={c} />
		<path d={`M${x - 40 * s},${y - 24 * s} C${x - 20 * s},${y - 4 * s} ${x + 10 * s},${y - 14 * s} ${x},${y - 30 * s}`} fill="none" stroke={PP.ink} strokeOpacity={0.25} strokeWidth={3 * s} strokeLinecap="round" /></g>;
export const Moon: React.FC<{x: number; y: number; r: number; c?: string; o?: number}> = ({x, y, r, c = PP.cream, o = 1}) => <g opacity={o}>
	<circle cx={x} cy={y} r={r * 1.5} fill={c} opacity={0.18} /><circle cx={x} cy={y} r={r} fill={c} filter="url(#pdS)" /></g>;

/* ---------- the tokens (metal; the only glow) ---------- */
/** the mirror's crack, top to bottom, in unit-circle coords (shared by both halves so they fit) */
const CRACK: [number, number][] = [[0.06, -1.05], [-0.05, -0.72], [0.09, -0.48], [-0.07, -0.2], [0.05, 0.06], [-0.08, 0.3], [0.06, 0.55], [-0.04, 0.8], [0.04, 1.05]];
const crackPoly = (side: 'L' | 'R') => { const pts = CRACK.map(([x, y]) => `${x},${y}`).join(' L'); return side === 'L' ? `M-1.2,-1.2 L${pts} L-1.2,1.2 Z` : `M1.2,-1.2 L${pts} L1.2,1.2 Z`; };
/** a bronze mirror (front face, polished) or one half of it. gap = how far the halves are apart (px). */
export const Mirror: React.FC<{x: number; y: number; r: number; id: string; half?: 'L' | 'R' | 'both'; gap?: number; moon?: boolean; glow?: number; tilt?: number}> = ({x, y, r, id, half = 'both', gap = 0, moon = true, glow = 1, tilt = 0}) => {
	const halves: ('L' | 'R')[] = half === 'both' ? ['L', 'R'] : [half];
	return <g>
		{glow > 0 && <TokGlow x={x} y={y} r={r * 1.9} o={glow} />}
		{halves.map((s) => { const dx = (s === 'L' ? -1 : 1) * gap / 2;
			return <g key={s} transform={`translate(${x + dx},${y}) rotate(${tilt * (s === 'L' ? -1 : 1)})`}>
				<defs><clipPath id={`${id}${s}`}><path d={crackPoly(s)} transform={`scale(${r})`} /></clipPath></defs>
				<g clipPath={`url(#${id}${s})`} filter="url(#pd)">
					<circle r={r} fill={AU.deep} />
					<circle r={r * 0.94} fill="url(#auDisk)" />
					<circle r={r * 0.94} fill="none" stroke={AU.dark} strokeWidth={r * 0.02} opacity={0.5} />
					{moon && <><circle cx={r * 0.18} cy={-r * 0.2} r={r * 0.3} fill={AU.core} opacity={0.75} /><circle cx={r * 0.18} cy={-r * 0.2} r={r * 0.42} fill={AU.core} opacity={0.18} /></>}
					<path d={`M${-r * 0.7},${-r * 0.35} Q${-r * 0.5},${-r * 0.75} ${-r * 0.1},${-r * 0.86}`} stroke={AU.core} strokeWidth={r * 0.05} fill="none" strokeLinecap="round" opacity={0.7} />
				</g>
				<path d={'M' + CRACK.map(([cx, cy]) => `${cx * r},${cy * r}`).join(' L')} fill="none" stroke={AU.dark} strokeWidth={Math.max(2, r * 0.018)} opacity={half === 'both' && gap === 0 ? 0.55 : 0} />
			</g>; })}
	</g>;
};
/** the back of a bronze mirror (knob, rings) — for the palace scene */
export const MirrorBack: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => <g filter="url(#pdS)">
	<circle cx={x} cy={y} r={r} fill={AU.deep} /><circle cx={x} cy={y} r={r * 0.9} fill="url(#auDisk)" />
	<circle cx={x} cy={y} r={r * 0.62} fill="none" stroke={AU.dark} strokeWidth={r * 0.04} opacity={0.6} /><circle cx={x} cy={y} r={r * 0.16} fill={AU.mid} stroke={AU.dark} strokeWidth={r * 0.03} />
</g>;
/** gold hairpin (钗): two prongs joined under an ornamental head; split → each prong separately */
export const Hairpin: React.FC<{x: number; y: number; s?: number; prong?: 'L' | 'R' | 'both'; spread?: number; rot?: number; glow?: number}> = ({x, y, s = 1, prong = 'both', spread = 0, rot = 0, glow = 1}) => {
	const P = (sg: number) => <g transform={`translate(${sg * spread / 2},0)`}>
		<path d={`M${sg * 12},0 C${sg * 16},90 ${sg * 20},200 ${sg * 14},330 L${sg * 9},340 C${sg * 8},210 ${sg * 4},90 ${sg * 2},0 Z`} fill="url(#auBar)" stroke={AU.dark} strokeWidth={1.5} />
		<path d={`M${sg * 4},-10 C${sg * 30},-40 ${sg * 70},-46 ${sg * 82},-80 C${sg * 60},-70 ${sg * 30},-80 ${sg * 20},-100 C${sg * 6},-70 ${sg * 2},-40 ${sg * 2},-10 Z`} fill="url(#auDisk)" stroke={AU.dark} strokeWidth={1.5} />
		<circle cx={sg * 46} cy={-62} r={8} fill={AU.core} /></g>;
	return <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
		{glow > 0 && <TokGlow x={0} y={60} r={260} o={glow} />}
		<g filter="url(#pd)">{(prong === 'both' || prong === 'L') && P(-1)}{(prong === 'both' || prong === 'R') && P(1)}
			{prong === 'both' && spread === 0 && <circle cx={0} cy={-18} r={16} fill="url(#auDisk)" stroke={AU.dark} strokeWidth={1.5} />}</g>
	</g>;
};
/** silver ring, seen at an angle */
export const Ring: React.FC<{x: number; y: number; r?: number; tilt?: number}> = ({x, y, r = 40, tilt = 0.45}) => <g filter="url(#pdS)">
	<ellipse cx={x} cy={y} rx={r} ry={r * tilt} fill="none" stroke="url(#agBar)" strokeWidth={r * 0.22} />
	<ellipse cx={x} cy={y - r * tilt * 0.08} rx={r * 0.9} ry={r * tilt * 0.82} fill="none" stroke={AG.core} strokeWidth={r * 0.05} opacity={0.8} /></g>;
/** gold arm ring (bangle) */
export const Bangle: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 70}) => <g filter="url(#pdS)">
	<ellipse cx={x} cy={y} rx={r} ry={r * 0.36} fill="none" stroke="url(#auBar)" strokeWidth={r * 0.16} />
	<ellipse cx={x} cy={y - 3} rx={r * 0.92} ry={r * 0.3} fill="none" stroke={AU.core} strokeWidth={3} opacity={0.7} /></g>;
export const Pearl: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 16}) => <g filter="url(#pdS)">
	<path d={`M${x},${y - r * 3} Q${x + r * 0.6},${y - r * 1.8} ${x},${y - r}`} fill="none" stroke="url(#auBar)" strokeWidth={4} />
	<circle cx={x} cy={y} r={r} fill={PP.cream} /><circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.35} fill="#fff" /></g>;
/** quince (木瓜) and jade bi pendant (琼琚) */
export const Quince: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} filter="url(#pd)">
	<path d="M0,-70 C48,-72 76,-34 74,10 C72,58 40,84 0,84 C-40,84 -72,58 -74,10 C-76,-34 -48,-72 0,-70 Z" fill="#E7C24E" />
	<path d="M-30,-40 C-50,-10 -50,30 -30,56" stroke="#F6E08E" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.8} />
	<path d="M2,-68 C0,-84 6,-96 14,-102" stroke={PP.leafD} strokeWidth={6} fill="none" strokeLinecap="round" />
	<path d="M10,-92 C34,-112 66,-106 74,-90 C50,-80 26,-80 10,-92 Z" fill={PP.leaf} /></g>;
export const JadeBi: React.FC<{x: number; y: number; s?: number; glow?: number}> = ({x, y, s = 1, glow = 0.8}) => <g transform={`translate(${x},${y}) scale(${s})`}>
	{glow > 0 && <TokGlow x={0} y={0} r={170} o={glow} />}
	<path d="M0,-130 L0,-70" stroke={PP.lacquer} strokeWidth={5} />
	<g filter="url(#pd)"><circle r={70} fill="#9FD1B4" /><circle r={70} fill="none" stroke="#5E9C7E" strokeWidth={5} /><circle r={22} fill={PP.ivory} stroke="#5E9C7E" strokeWidth={4} />
		{Array.from({length: 10}, (_, i) => { const a = i * Math.PI / 5; return <circle key={i} cx={Math.cos(a) * 46} cy={Math.sin(a) * 46} r={5} fill="#7DBB9A" />; })}
		<path d="M-40,-44 Q-10,-62 30,-52" stroke="#E4F6EA" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.8} /></g>
	<path d="M0,70 L-8,150 M0,70 L8,150 M0,70 L0,156" stroke={PP.lacquer} strokeWidth={4} /></g>;

/* ---------- phone, avatar, pager, red packet (no brand marks) ---------- */
/** the couple-avatar picture: a full moon with a little cut-paper figure on each side (girl left, boy right) */
export const AvatarArt: React.FC<{s: number; side: 'L' | 'R' | 'both'; id: string; gap?: number}> = ({s, side, id, gap = 0}) => {
	const halves: ('L' | 'R')[] = side === 'both' ? ['L', 'R'] : [side];
	return <g>{halves.map((h) => <g key={h} transform={`translate(${(h === 'L' ? -1 : 1) * gap / 2},0)`}>
		<defs><clipPath id={`${id}${h}`}><rect x={h === 'L' ? -s / 2 : 0} y={-s / 2} width={s / 2} height={s} rx={0} /></clipPath>
			<linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={PP.indigo2} /><stop offset="1" stopColor={PP.rose} /></linearGradient></defs>
		<g clipPath={`url(#${id}${h})`}>
			<rect x={-s / 2} y={-s / 2} width={s} height={s} rx={s * 0.18} fill={`url(#${id}sky)`} />
			<circle cx={0} cy={-s * 0.06} r={s * 0.3} fill={AU.hi} /><circle cx={0} cy={-s * 0.06} r={s * 0.38} fill={AU.hi} opacity={0.25} />
			<path d={`M${-s / 2},${s * 0.3} Q${-s * 0.2},${s * 0.2} 0,${s * 0.28} Q${s * 0.2},${s * 0.36} ${s / 2},${s * 0.26} L${s / 2},${s / 2} L${-s / 2},${s / 2} Z`} fill={PP.night} />
			{/* girl (left) and boy (right), simple cut-paper busts facing the middle */}
			<g fill={PP.ink}>
				<circle cx={-s * 0.2} cy={s * 0.06} r={s * 0.07} /><path d={`M${-s * 0.29},${s * 0.04} C${-s * 0.3},${s * 0.16} ${-s * 0.26},${s * 0.22} ${-s * 0.2},${s * 0.24} L${-s * 0.27},${s * 0.24} C${-s * 0.33},${s * 0.18} ${-s * 0.32},${s * 0.06} ${-s * 0.29},${s * 0.04} Z`} />
				<path d={`M${-s * 0.33},${s * 0.4} C${-s * 0.33},${s * 0.2} ${-s * 0.07},${s * 0.2} ${-s * 0.07},${s * 0.4} Z`} />
				<circle cx={s * 0.2} cy={s * 0.05} r={s * 0.072} /><path d={`M${s * 0.07},${s * 0.4} C${s * 0.07},${s * 0.19} ${s * 0.34},${s * 0.19} ${s * 0.34},${s * 0.4} Z`} />
			</g>
			<path d={`M${-s * 0.06},${s * 0.25} C${-s * 0.03},${s * 0.2} 0,${s * 0.22} 0,${s * 0.25} C0,${s * 0.22} ${s * 0.03},${s * 0.2} ${s * 0.06},${s * 0.25} C${s * 0.04},${s * 0.29} 0,${s * 0.31} 0,${s * 0.33} C0,${s * 0.31} ${-s * 0.04},${s * 0.29} ${-s * 0.06},${s * 0.25} Z`} fill={PP.roseL} />
		</g>
		<rect x={h === 'L' ? -s / 2 : 0} y={-s / 2} width={s / 2} height={s} fill="none" stroke={PP.edge} strokeWidth={s * 0.012} opacity={gap > 0 ? 0.9 : 0} />
	</g>)}</g>;
};
/** a phone, screen-on, showing one avatar (whole/half) and a name line; no brand */
export const Phone: React.FC<{x: number; y: number; s?: number; rot?: number; side?: 'L' | 'R' | 'both' | 'none'; id: string; name?: string; ghost?: boolean; glow?: number}> = ({x, y, s = 1, rot = 0, side = 'L', id, name = '', ghost, glow = 0.8}) => <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
	{glow > 0 && <TokGlow x={0} y={-60} r={330} o={glow} />}
	<rect x={-170} y={-330} width={340} height={660} rx={46} fill={PP.ink} filter="url(#pdL)" />
	<rect x={-156} y={-316} width={312} height={632} rx={36} fill={PP.cream} />
	<rect x={-156} y={-316} width={312} height={70} rx={36} fill={PP.ivory2} /><rect x={-156} y={-280} width={312} height={34} fill={PP.ivory2} />
	<rect x={-30} y={-306} width={60} height={14} rx={7} fill={PP.ink} />
	<g transform="translate(0,-90)">
		{side === 'none' ? null : ghost ? <rect x={-110} y={-110} width={220} height={220} rx={40} fill="none" stroke={PP.indigoL} strokeWidth={4} strokeDasharray="12 10" />
			: <><rect x={side === 'R' ? 0 : -110} y={-110} width={side === 'both' ? 220 : 110} height={220} rx={0} fill="none" />
				<g transform={side === 'L' ? 'translate(55,0)' : side === 'R' ? 'translate(-55,0)' : ''}><AvatarArt s={220} side={side} id={id} /></g></>}
	</g>
	{name && <text x={0} y={80} textAnchor="middle" fontFamily="'Noto Sans CJK SC',sans-serif" fontWeight={700} fontSize={34} fill={PP.ink}>{name}</text>}
	{[120, 160, 200].map((yy, i) => <rect key={i} x={-110} y={yy} width={[220, 170, 200][i]} height={14} rx={7} fill={PP.ivory2} />)}
</g>;
/** 1990s pager with a green LCD */
export const Pager: React.FC<{x: number; y: number; s?: number; text: string; rot?: number}> = ({x, y, s = 1, text, rot = 0}) => <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
	<TokGlow x={0} y={0} r={300} o={0.7} />
	<rect x={-230} y={-120} width={460} height={240} rx={40} fill={PP.ink} filter="url(#pdL)" />
	<rect x={-200} y={-90} width={300} height={130} rx={12} fill="#B7D58A" />
	<rect x={-200} y={-90} width={300} height={130} rx={12} fill="none" stroke="#1d2a1a" strokeWidth={4} opacity={0.4} />
	<text x={-50} y={10} textAnchor="middle" fontFamily="'DejaVu Sans Mono',monospace" fontWeight={700} fontSize={96} fill="#22341C" letterSpacing={8}>{text}</text>
	{[0, 1, 2].map((i) => <rect key={i} x={130} y={-80 + i * 52} width={70} height={36} rx={12} fill={PP.indigo2} />)}
	<rect x={-200} y={62} width={300} height={22} rx={11} fill={PP.indigo} />
</g>;
/** red packet, open, showing an amount (no logo) */
export const RedPacket: React.FC<{x: number; y: number; s?: number; amount: string; rot?: number}> = ({x, y, s = 1, amount, rot = 0}) => <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
	<TokGlow x={0} y={0} r={330} o={0.8} />
	<rect x={-170} y={-240} width={340} height={480} rx={26} fill="#D8473A" filter="url(#pdL)" />
	<path d="M-170,-110 Q0,-40 170,-110 L170,-214 Q170,-240 144,-240 L-144,-240 Q-170,-240 -170,-214 Z" fill="#C23A30" />
	<circle cx={0} cy={-62} r={52} fill="url(#auDisk)" stroke={AU.deep} strokeWidth={3} />
	<text x={0} y={-44} textAnchor="middle" fontFamily="'Noto Serif CJK SC',serif" fontWeight={900} fontSize={52} fill={AU.dark}>開</text>
	<text x={0} y={110} textAnchor="middle" fontFamily="'DejaVu Sans',sans-serif" fontWeight={700} fontSize={84} fill={AU.hi}>{amount}</text>
	<text x={0} y={170} textAnchor="middle" fontFamily="'Noto Sans CJK SC',sans-serif" fontWeight={700} fontSize={34} fill={AU.hi} opacity={0.85}>元</text>
</g>;

/* ---------- 1970s things ---------- */
export const Bike: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => <g transform={`translate(${x},${y}) scale(${s})`} filter="url(#pd)">
	{[-170, 170].map((cx) => <g key={cx}><circle cx={cx} cy={0} r={120} fill="none" stroke={PP.ink} strokeWidth={14} /><circle cx={cx} cy={0} r={104} fill="none" stroke={AG.mid} strokeWidth={3} />
		{Array.from({length: 12}, (_, i) => <line key={i} x1={cx} y1={0} x2={cx + Math.cos(i * Math.PI / 6) * 104} y2={Math.sin(i * Math.PI / 6) * 104} stroke={AG.deep} strokeWidth={2} />)}</g>)}
	<path d="M-170,0 L-40,-140 L120,-140 L0,0 Z M-40,-140 L-70,-190 M120,-140 L170,0 M120,-140 L136,-200" fill="none" stroke={PP.ink} strokeWidth={14} strokeLinejoin="round" strokeLinecap="round" />
	<path d="M-100,-196 L-30,-196" stroke={PP.ink} strokeWidth={20} strokeLinecap="round" /><path d="M110,-204 C140,-214 170,-206 186,-196" stroke={PP.ink} strokeWidth={10} fill="none" strokeLinecap="round" />
	<circle cx={0} cy={0} r={26} fill={AG.mid} stroke={PP.ink} strokeWidth={6} /></g>;
export const Watch: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => <g transform={`translate(${x},${y}) scale(${s})`} filter="url(#pd)">
	<rect x={-34} y={-150} width={68} height={300} rx={14} fill={PP.brick} />
	<circle r={86} fill={AG.mid} /><circle r={72} fill={PP.cream} />
	{Array.from({length: 12}, (_, i) => { const a = i * Math.PI / 6; return <line key={i} x1={Math.sin(a) * 58} y1={-Math.cos(a) * 58} x2={Math.sin(a) * 66} y2={-Math.cos(a) * 66} stroke={PP.ink} strokeWidth={4} />; })}
	<line x1={0} y1={0} x2={0} y2={-48} stroke={PP.ink} strokeWidth={6} strokeLinecap="round" /><line x1={0} y1={0} x2={34} y2={10} stroke={PP.ink} strokeWidth={6} strokeLinecap="round" /></g>;
export const Sewing: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => <g transform={`translate(${x},${y}) scale(${s})`} filter="url(#pd)">
	<rect x={-200} y={30} width={400} height={40} rx={8} fill={PP.ochre} />
	<path d="M-160,30 L-160,-70 C-160,-120 -120,-140 -60,-140 L160,-140 C190,-140 200,-120 200,-90 L200,-40 L150,-40 L150,30 L110,30 L110,-90 L-110,-90 L-110,30 Z" fill={PP.ink} />
	<rect x={140} y={-40} width={20} height={50} fill={AG.mid} /><circle cx={-160} cy={-60} r={36} fill={AG.mid} stroke={PP.ink} strokeWidth={8} />
	<path d="M-60,-118 L100,-118" stroke={AU.mid} strokeWidth={6} /></g>;
export const Radio: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => <g transform={`translate(${x},${y}) scale(${s})`} filter="url(#pd)">
	<rect x={-200} y={-120} width={400} height={240} rx={26} fill={PP.lacquer} />
	<rect x={-170} y={-90} width={190} height={180} rx={14} fill={PP.ochreL} />
	{Array.from({length: 7}, (_, i) => <line key={i} x1={-160} y1={-70 + i * 24} x2={10} y2={-70 + i * 24} stroke={PP.ochre} strokeWidth={6} />)}
	<rect x={50} y={-80} width={120} height={50} rx={6} fill={PP.cream} /><line x1={70} y1={-55} x2={150} y2={-55} stroke={PP.ink} strokeWidth={3} />
	<circle cx={80} cy={40} r={30} fill={AG.mid} /><circle cx={150} cy={40} r={30} fill={AG.mid} /></g>;

/* ---------- architecture & props ---------- */
/** a cut-paper palace roof + hall front (Chinese hip roof), width w at scale k */
export const Hall: React.FC<{cx: number; g: number; k?: number; wall?: string; roof?: string; lit?: boolean}> = ({cx, g, k = 1, wall = PP.brick, roof = PP.indigo, lit}) => {
	const w = 900 * k, h = 300 * k, x0 = cx - w / 2;
	return <g>
		<Sheet c={PP.ivory2} d={`M${x0 - 60 * k},${g} L${x0 - 60 * k},${g - 40 * k} L${x0 + w + 60 * k},${g - 40 * k} L${x0 + w + 60 * k},${g} Z`} />
		<Sheet c={wall} d={`M${x0},${g - 40 * k} L${x0},${g - h} L${x0 + w},${g - h} L${x0 + w},${g - 40 * k} Z`} />
		{Array.from({length: 6}, (_, i) => { const x = x0 + 50 * k + i * (w - 100 * k) / 5; return <rect key={i} x={x - 14 * k} y={g - h} width={28 * k} height={h - 40 * k} fill={PP.lacquer} opacity={0.6} />; })}
		{Array.from({length: 5}, (_, i) => { const x = x0 + 90 * k + i * (w - 180 * k) / 4; return <g key={i}><rect x={x - 50 * k} y={g - h + 50 * k} width={100 * k} height={160 * k} fill={lit ? AU.hi : PP.night} opacity={lit ? 0.85 : 0.75} />
			{Array.from({length: 4}, (_, j) => <line key={j} x1={x - 50 * k + (j + 1) * 20 * k} y1={g - h + 50 * k} x2={x - 50 * k + (j + 1) * 20 * k} y2={g - h + 210 * k} stroke={PP.lacquer} strokeWidth={4 * k} />)}</g>; })}
		<Sheet c={roof} sh="pdL" d={`M${x0 - 160 * k},${g - h + 10 * k} C${x0 - 60 * k},${g - h - 10 * k} ${x0 + 40 * k},${g - h - 70 * k} ${x0 + 120 * k},${g - h - 150 * k} L${x0 + w - 120 * k},${g - h - 150 * k} C${x0 + w - 40 * k},${g - h - 70 * k} ${x0 + w + 60 * k},${g - h - 10 * k} ${x0 + w + 160 * k},${g - h + 10 * k} C${x0 + w + 80 * k},${g - h - 30 * k} ${x0 + w + 40 * k},${g - h - 20 * k} ${x0 + w},${g - h - 10 * k} L${x0},${g - h - 10 * k} C${x0 - 40 * k},${g - h - 20 * k} ${x0 - 80 * k},${g - h - 30 * k} ${x0 - 160 * k},${g - h + 10 * k} Z`} />
		<Sheet c={roof} d={`M${x0 + 160 * k},${g - h - 150 * k} L${x0 + 220 * k},${g - h - 230 * k} L${x0 + w - 220 * k},${g - h - 230 * k} L${x0 + w - 160 * k},${g - h - 150 * k} Z`} />
		<path d={`M${x0 + 200 * k},${g - h - 232 * k} L${x0 + w - 200 * k},${g - h - 232 * k}`} stroke={PP.ink} strokeWidth={10 * k} strokeLinecap="round" />
	</g>;
};
export const Lantern: React.FC<{x: number; y: number; s?: number; c?: string}> = ({x, y, s = 1, c = '#D8473A'}) => <g transform={`translate(${x},${y}) scale(${s})`}>
	<line x1={0} y1={-200} x2={0} y2={-56} stroke={PP.ink} strokeWidth={3} />
	<circle r={90} fill={AU.hi} opacity={0.22} />
	<g filter="url(#pdS)"><rect x={-26} y={-62} width={52} height={14} rx={4} fill={PP.ink} /><ellipse cx={0} cy={0} rx={56} ry={50} fill={c} />
		{[-30, 0, 30].map((dx) => <path key={dx} d={`M${dx * 0.6},-48 Q${dx},0 ${dx * 0.6},48`} stroke={PP.lacquer} strokeWidth={3} fill="none" />)}
		<rect x={-26} y={48} width={52} height={12} rx={4} fill={PP.ink} />
		<path d="M0,60 L-6,100 M0,60 L6,100 M0,60 L0,104" stroke={AU.mid} strokeWidth={3} /></g></g>;
/** a low bamboo/wood fence along y, from x0 to x1 */
export const Fence: React.FC<{x0: number; x1: number; y: number; h?: number; c?: string}> = ({x0, x1, y, h = 150, c = PP.ochre}) => {
	const n = Math.round((x1 - x0) / 46);
	return <g filter="url(#pdS)">{Array.from({length: n + 1}, (_, i) => { const x = x0 + i * (x1 - x0) / n, hh = h * (0.9 + 0.15 * rnd(i, 3)); return <path key={i} d={`M${x - 11},${y} L${x - 11},${y - hh + 10} L${x},${y - hh} L${x + 11},${y - hh + 10} L${x + 11},${y} Z`} fill={c} />; })}
		<rect x={x0 - 12} y={y - h * 0.72} width={x1 - x0 + 24} height={14} fill={PP.brick} /><rect x={x0 - 12} y={y - h * 0.32} width={x1 - x0 + 24} height={14} fill={PP.brick} /></g>;
};
export const Tree: React.FC<{x: number; g: number; s?: number; c?: string; c2?: string; blossom?: boolean}> = ({x, g, s = 1, c = PP.leaf, c2 = PP.leafD, blossom}) => <g>
	<Sheet c={PP.brick} d={`M${x - 16 * s},${g} L${x - 10 * s},${g - 220 * s} L${x + 10 * s},${g - 220 * s} L${x + 16 * s},${g} Z`} sh="pdS" />
	{[[0, -300, 150], [-90, -230, 110], [90, -240, 115], [0, -400, 110]].map(([dx, dy, r], i) => <circle key={i} cx={x + dx * s} cy={g + dy * s} r={r * s} fill={i % 2 ? c2 : c} filter="url(#pdS)" />)}
	{blossom && Array.from({length: 18}, (_, i) => <circle key={i} cx={x + (rnd(i, 7) - 0.5) * 300 * s} cy={g - (200 + rnd(i, 8) * 280) * s} r={10 * s} fill={PP.roseL} />)}
</g>;
/** a cut-paper scroll unrolled (horizontal), with columns of text */
export const Scroll: React.FC<{x: number; y: number; w: number; h: number; cols: {t: string; lit?: boolean}[]}> = ({x, y, w, h, cols}) => <g>
	<Sheet c={PP.cream} d={`M${x},${y} L${x + w},${y} L${x + w},${y + h} L${x},${y + h} Z`} sh="pdL" />
	<rect x={x - 22} y={y - 14} width={22} height={h + 28} rx={10} fill={PP.lacquer} /><rect x={x + w} y={y - 14} width={22} height={h + 28} rx={10} fill={PP.lacquer} />
	{cols.map((c, i) => <text key={i} x={x + w - 60 - i * 80} y={y + 70} writingMode="tb" fontFamily="'Noto Serif CJK SC',serif" fontWeight={700} fontSize={44} letterSpacing={6} fill={c.lit ? AU.deep : PP.ink} opacity={c.lit ? 1 : 0.75}
		style={{writingMode: 'vertical-rl'} as React.CSSProperties}>{c.t}</text>)}
</g>;
