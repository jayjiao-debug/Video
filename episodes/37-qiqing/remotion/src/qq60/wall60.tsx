import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile, Img} from 'remotion';
import {PAL, sp} from './geo60';

/* ep60 look A 「墓室壁画」: the painted tomb wall (plaster ground with grain, mottling and hairline cracks, a starry ceiling band,
   a khekher frieze, block borders, the register ground line and dado) and the screen furniture in the same paint:
   the subtitle inside a painted cartouche (top-left, layout D position), the stamp (top-right, under the frieze) and the J seal. */
export const W = 1920, H = 1080, SAFE_X = 120, SAFE_Y = 58, GY = 932;
export const FRIEZE = {stars: 40, khekher: 98, border: 110};
export const SERIF = "'Noto Serif CJK SC','Noto Serif CJK',serif", SANS = "'Noto Sans CJK SC',sans-serif";
export const KAI = "'LXGW WenKai','Noto Serif CJK SC',serif", YEAR = "'Cormorant60i','LXGW WenKai',serif";
export const ACCENT = PAL.red;

/* ---------- fonts (霞鹜文楷 for the stamp, Cormorant italic for the year) ---------- */
let fontLink: Promise<void> | null = null;
const ready = new Set<string>();
const ensure = () => fontLink ??= new Promise<void>((res) => {
	const st = document.createElement('style');
	st.textContent = `@font-face{font-family:'Cormorant60i';font-style:italic;font-weight:500;src:url(${staticFile('fonts/cormorant-garamond-latin-500-italic.woff2')}) format('woff2');}`;
	document.head.appendChild(st);
	const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = staticFile('fonts/wenkai/wenkai-bold.css'); l.onload = () => res(); l.onerror = () => res(); document.head.appendChild(l); });
export const useFonts60 = (text: string) => {
	const [h] = useState(() => (typeof document === 'undefined' || ready.has(text) ? null : delayRender(`ep60 fonts ${text}`)));
	useEffect(() => { if (h === null) return;
		ensure().then(() => Promise.all([document.fonts.load(`700 40px 'LXGW WenKai'`, text), document.fonts.load(`italic 500 40px 'Cormorant60i'`, '0123456789'), document.fonts.load(`900 64px 'Noto Serif CJK SC'`, text)]))
			.then(() => { ready.add(text); continueRender(h); }, () => continueRender(h)); }, [h, text]);
};

/* ---------- the wall ---------- */
const star = (cx: number, cy: number, r: number) => { const pts: string[] = [];
	for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.3 : r; pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`); }
	return pts.join(' '); };
const Khekher: React.FC<{x: number; k: number}> = ({x, k}) => {
	const y0 = FRIEZE.stars, h = FRIEZE.khekher - FRIEZE.stars, w = 24, cols = [[PAL.green, PAL.blue, PAL.red], [PAL.blue, PAL.red, PAL.green], [PAL.red, PAL.green, PAL.blue]][k % 3];
	const body = sp([[x + 3, y0 + h, 1], [x + 3, y0 + 20], [x + 6, y0 + 15, 1], [x + w - 6, y0 + 15, 1], [x + w - 3, y0 + 20], [x + w - 3, y0 + h, 1]]);
	return <g>
		<path d={body} fill={PAL.gold} stroke={PAL.ink} strokeWidth={2} strokeLinejoin="round" />
		<rect x={x + 3} y={y0 + 19} width={w - 6} height={11} fill={cols[0]} stroke={PAL.ink} strokeWidth={1.2} />
		<rect x={x + 3} y={y0 + 33} width={w - 6} height={9} fill={cols[1]} stroke={PAL.ink} strokeWidth={1.2} />
		<rect x={x + 3} y={y0 + 45} width={w - 6} height={6} fill={cols[2]} stroke={PAL.ink} strokeWidth={1.2} />
		<line x1={x + w / 2} x2={x + w / 2} y1={y0 + 51} y2={y0 + h} stroke={PAL.ink} strokeWidth={1.5} />
		<path d={`M${x + 7} ${y0 + 15}L${x + w / 2 - 2} ${y0 + 9}L${x + w / 2 + 2} ${y0 + 9}L${x + w - 7} ${y0 + 15}Z`} fill={PAL.gold} stroke={PAL.ink} strokeWidth={1.5} strokeLinejoin="round" />
		<circle cx={x + w / 2} cy={y0 + 6} r={4.6} fill={cols[2]} stroke={PAL.ink} strokeWidth={1.5} />
	</g>;
};
const Blocks: React.FC<{x0: number; x1: number; y: number; h: number; vertical?: boolean; w?: number}> = ({x0, x1, y, h, vertical, w = 30}) => {
	const n = Math.ceil((x1 - x0) / w), cols = [PAL.blue, PAL.red, PAL.green, PAL.gold];
	return <g>{Array.from({length: n}, (_, i) => vertical
		? <rect key={i} x={y} y={x0 + i * w} width={h} height={w - 4} fill={cols[i % 4]} stroke={PAL.ink} strokeWidth={1.3} />
		: <rect key={i} x={x0 + i * w} y={y} width={w - 4} height={h} fill={cols[i % 4]} stroke={PAL.ink} strokeWidth={1.3} />)}</g>;
};
/** dado: blue lotus blossoms alternating with buds on a running stem line; a quiet panel is left for the J seal */
const Lotus: React.FC<{gy: number}> = ({gy}) => { const y0 = gy + 38, y1 = H - 40, out: React.ReactNode[] = [], x1 = W - SAFE_X - 120;
	for (let i = 0, x = 60; x < x1 - 40; i++, x += 46) {
		if (i % 2 === 0) out.push(<g key={i}>
			<path d={`M${x} ${y1}L${x} ${y0 + 34}`} stroke={PAL.green} strokeWidth={3} />
			<path d={`M${x - 20} ${y0 + 10}L${x - 9} ${y0 + 36}L${x + 9} ${y0 + 36}L${x + 20} ${y0 + 10}L${x + 9} ${y0 + 22}L${x} ${y0 + 2}L${x - 9} ${y0 + 22}Z`} fill={PAL.blue} stroke={PAL.ink} strokeWidth={1.6} strokeLinejoin="round" />
			<path d={`M${x - 9} ${y0 + 36}L${x - 5} ${y0 + 24}L${x} ${y0 + 36}L${x + 5} ${y0 + 24}L${x + 9} ${y0 + 36}Z`} fill={PAL.green} stroke={PAL.ink} strokeWidth={1.2} />
			<path d={`M${x - 11} ${y0 + 38}L${x + 11} ${y0 + 38}L${x + 6} ${y0 + 44}L${x - 6} ${y0 + 44}Z`} fill={PAL.green} stroke={PAL.ink} strokeWidth={1.4} /></g>);
		else out.push(<g key={i}><path d={`M${x} ${y1}L${x} ${y0 + 34}`} stroke={PAL.green} strokeWidth={3} />
			<path d={sp([[x - 8, y0 + 40, 1], [x - 9, y0 + 28], [x, y0 + 14], [x + 9, y0 + 28], [x + 8, y0 + 40, 1]])} fill={PAL.green} stroke={PAL.ink} strokeWidth={1.5} />
			<path d={sp([[x - 4, y0 + 30], [x, y0 + 16], [x + 4, y0 + 30]], false)} fill="none" stroke={PAL.blue} strokeWidth={2.4} /></g>);
	}
	return <g opacity={0.92}><line x1={30} x2={x1} y1={y1} y2={y1} stroke={PAL.ink} strokeWidth={2} />{out}
		<line x1={x1} x2={x1} y1={gy + 21} y2={H - 30} stroke={PAL.ink} strokeWidth={2} /><line x1={x1 + 5} x2={x1 + 5} y1={gy + 21} y2={H - 30} stroke={PAL.red} strokeWidth={2} /></g>; };
/** plaster, frieze, borders and the ground line; `extra` paints between the plaster and the frame (e.g. glyph columns) */
export const TombWall: React.FC<{gy?: number; children?: React.ReactNode; ground?: boolean}> = ({gy = GY, children, ground = true}) => <g>
	<defs>
		<filter id="mottle" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.0045 0.006" numOctaves={3} seed={7} /><feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.38  0 0 0 0 0.18  1.3 0 0 0 -0.55" /></filter>
		<filter id="mottleHi" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={2} seed={21} /><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.97  0 0 0 0 0.88  -1.6 0 0 0 0.62" /></filter>
		<radialGradient id="torch" cx="0.48" cy="0.52" r="0.75"><stop offset="0.55" stopColor="#5a2e12" stopOpacity="0" /><stop offset="1" stopColor="#5a2e12" stopOpacity="0.32" /></radialGradient>
	</defs>
	<rect width={W} height={H} fill={PAL.plaster} />
	<rect width={W} height={H} filter="url(#mottle)" opacity={0.55} />
	<rect width={W} height={H} filter="url(#mottleHi)" opacity={0.5} />
	{/* hairline cracks */}
	{['M48 610L70 640L66 676L92 712L88 760', 'M1680 300L1702 338L1696 372L1726 410L1720 452L1748 500', 'M1300 990L1330 1004L1372 1000L1400 1016', 'M1660 760L1690 790L1688 830'].map((d) => <path key={d} d={d} fill="none" stroke="#7a5a36" strokeWidth={1.1} opacity={0.35} />)}
	{children}
	{/* ceiling band with stars, the khekher frieze, the block border */}
	<rect x={0} y={0} width={W} height={FRIEZE.stars} fill={PAL.sky} />
	{Array.from({length: 44}, (_, i) => <polygon key={i} points={star(22 + i * 44 + (i % 2) * 6, 13 + (i % 2) * 14, 8)} fill={PAL.star} />)}
	<line x1={0} x2={W} y1={FRIEZE.stars} y2={FRIEZE.stars} stroke={PAL.ink} strokeWidth={2} />
	{Array.from({length: 81}, (_, i) => <Khekher key={i} x={-6 + i * 24} k={i} />)}
	<rect x={0} y={FRIEZE.khekher} width={W} height={4} fill={PAL.ink} />
	<Blocks x0={0} x1={W} y={FRIEZE.khekher + 4} h={FRIEZE.border - FRIEZE.khekher - 4} w={34} />
	<rect x={0} y={FRIEZE.border} width={W} height={2.5} fill={PAL.ink} />
	{/* side borders */}
	<Blocks x0={FRIEZE.border + 2} x1={gy} y={6} h={16} vertical w={34} /><Blocks x0={FRIEZE.border + 2} x1={gy} y={W - 22} h={16} vertical w={34} />
	<line x1={25} x2={25} y1={FRIEZE.border} y2={gy} stroke={PAL.ink} strokeWidth={2} /><line x1={W - 25} x2={W - 25} y1={FRIEZE.border} y2={gy} stroke={PAL.ink} strokeWidth={2} />
	{/* ground line (register), dado */}
	{ground && <>
	<rect x={0} y={gy} width={W} height={21} fill={PAL.ink} />
	<rect x={0} y={gy + 3} width={W} height={7} fill={PAL.blue} /><rect x={0} y={gy + 12} width={W} height={7} fill={PAL.red} />
	<rect x={0} y={H - 30} width={W} height={30} fill={PAL.ink} /><rect x={0} y={H - 27} width={W} height={9} fill={PAL.red} /><rect x={0} y={H - 15} width={W} height={7} fill={PAL.gold} />
	<Lotus gy={gy} /></>}
</g>;
/** paint-on-plaster grain over everything, plus a faint torch falloff at the edges */
export const WallGrain: React.FC = () => <g style={{mixBlendMode: 'multiply'}} pointerEvents="none">
	<defs><filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={3} /><feColorMatrix type="matrix" values="0 0 0 0 0.62  0 0 0 0 0.5  0 0 0 0 0.36  1.7 0 0 0 -0.78" /></filter></defs>
	<rect width={W} height={H} filter="url(#grain)" opacity={0.55} />
	<rect width={W} height={H} fill="url(#torch)" />
</g>;

/* ---------- furniture ---------- */
const visLen = (s: string) => s.replace(/[[\]]/g, '').length;
/** the subtitle in a painted cartouche: red-ochre rope, a lighter plaster field, the tie bar at the end; "[key]" words get a red-ochre underline */
export const CartoucheSub: React.FC<{text: string; n?: number; o?: number}> = ({text, n = 1e9, o = 1}) => {
	useFonts60(text);
	const fs = 64, tw = visLen(text) * fs * 1.04, h = 116, w = tw + 92, x = 124, y = 116;
	let left = n; const parts = text.split(/(\[[^\]]+\])/).filter(Boolean);
	return <div style={{position: 'absolute', left: x, top: y, width: w + 40, height: h, opacity: o}}>
		<svg width={w + 40} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
			<rect x={3} y={3} width={w - 6} height={h - 6} rx={(h - 6) / 2} fill="#F6EBD2" stroke={PAL.ink} strokeWidth={2.5} />
			<rect x={9} y={9} width={w - 18} height={h - 18} rx={(h - 18) / 2} fill="none" stroke={PAL.red} strokeWidth={6} />
			<rect x={13.5} y={13.5} width={w - 27} height={h - 27} rx={(h - 27) / 2} fill="none" stroke={PAL.ink} strokeWidth={1.6} />
			<rect x={w + 2} y={6} width={16} height={h - 12} rx={3} fill={PAL.red} stroke={PAL.ink} strokeWidth={2.5} />
			<line x1={w + 10} x2={w + 10} y1={10} y2={h - 10} stroke={PAL.ink} strokeWidth={1.4} opacity={0.6} />
		</svg>
		<div style={{position: 'absolute', left: 46, top: 0, height: h, display: 'flex', alignItems: 'center', fontFamily: SERIF, fontWeight: 900, fontSize: fs, color: PAL.ink, letterSpacing: '0.04em', whiteSpace: 'nowrap'}}>
			{parts.map((p, i) => { const key = p.startsWith('['), txt = key ? p.slice(1, -1) : p, vis = txt.slice(0, Math.max(0, left)), hid = txt.slice(vis.length); left -= txt.length;
				return <span key={i} style={{position: 'relative', display: 'inline-block'}}>
					{key && vis && <span style={{position: 'absolute', left: '0.04em', right: '0.08em', bottom: '-0.02em', height: '0.13em', borderRadius: '0.06em', background: PAL.red}} />}
					<span style={{position: 'relative', color: key ? PAL.red2 : PAL.ink}}>{vis}</span><span style={{opacity: 0}}>{hid}</span></span>; })}
		</div>
	</div>;
};
/** top-right stamp (two lines), painted in ink under the frieze with a red-ochre rule */
export const Stamp60: React.FC<{pre: string; year: string; post: string; place: string; note: string; o?: number}> = ({pre, year, post, place, note, o = 1}) => {
	useFonts60(`${pre}${post}${place}${note}·`);
	return <div style={{position: 'absolute', top: FRIEZE.border + 16, right: SAFE_X, textAlign: 'right', paddingRight: 14, borderRight: `4px solid ${ACCENT}`, opacity: 0.94 * o, color: PAL.ink, whiteSpace: 'nowrap'}}>
		<div style={{lineHeight: 1.12, display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 8}}>
			<span style={{fontFamily: KAI, fontWeight: 700, fontSize: 32}}>{pre}</span>
			<span style={{fontFamily: YEAR, fontStyle: 'italic', fontWeight: 500, fontSize: 48, marginLeft: -4}}>{year}</span>
			<span style={{fontFamily: KAI, fontWeight: 700, fontSize: 32, marginLeft: -4}}>{post}</span>
			<span style={{fontFamily: KAI, fontWeight: 700, fontSize: 30, color: ACCENT}}>·</span>
			<span style={{fontFamily: KAI, fontWeight: 700, fontSize: 34, letterSpacing: '0.05em'}}>{place}</span></div>
		<div style={{fontFamily: KAI, fontWeight: 700, fontSize: 27, lineHeight: 1.45, marginTop: 2, letterSpacing: '0.08em', color: PAL.red2}}>{note}</div>
	</div>;
};
export const Seal60: React.FC<{o?: number}> = ({o = 0.9}) => <Img src={staticFile('ep44/jseal.png')} style={{position: 'absolute', right: SAFE_X, bottom: SAFE_Y - 6, width: 74, height: 74, opacity: o, transform: 'rotate(-6deg)'}} />;
