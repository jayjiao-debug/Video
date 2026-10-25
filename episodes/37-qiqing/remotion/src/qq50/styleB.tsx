import React from 'react';
import {Img} from 'remotion';
import {treeD, furrows} from './kit50';
import {W, H, Theme, Subs, Stamp, Counter, Glyph, COMP_C, cowrie, bubi, spade, qrCells, grounded, shop, seg, ease, eio, eout, land, lerp, cl, rnd, typed, KAI, SAFE_X, SAFE_Y} from './kit50';
import {Figure4, Pose} from '../qq44/figure44';
import {SEAL_SRC} from '../qq44/skin44';
/* LOOK B 「漆」 — 秦汉漆器 (v2, fix pass 2026-10-25). The film is painted on a lacquered box: black lacquer ground, cinnabar
   flats, fine gold line, and 云气纹 cloud scrolls that carry every movement (things are drawn by a gold line, then flooded
   with lacquer). The light is the gloss of lacquer: a soft window reflection slides as the box turns. Metal is silver
   inlay (金银错, cold); the money is gold leaf — the episode accent. People are lacquer-black silhouettes with a gold
   contour, standing on cinnabar.
   v2: lifted exposure (warm oxblood lacquer, brighter cinnabar, stronger gloss), a printed 交子 note, a weighted iron
   string, an intentional hook still (贝 lifted out of gold-lined sockets → gold-leaf cowries on the counter). */
export const B = {lac: '#1E100C', lac2: '#2E1712', far: '#5A271B', red: '#C8462B', redL: '#DE6446', redD: '#92301C', ochre: '#B07A3C', gold: '#EBC06A', goldL: '#FFE6A8', silver: '#D4DCE1', cream: '#F6EBD2'};
export const thB: Theme = {ink: '#FFF6E6', key: B.gold, rule: B.gold, dim: 0.85, pool: 'rgba(16,7,4,A)', poolA: 0.5,
	halo: '0 0 2px rgba(16,7,4,0.95), 0 2px 8px rgba(16,7,4,0.8), 0 2px 22px rgba(16,7,4,0.6)'};

/** a 云气纹 curl: a spiral that unwinds into a long tail; dir = ±1 */
export const curl = (x: number, y: number, r: number, dir = 1, tail = 3, rise = 0.5) => {
	const pts: [number, number][] = [];
	for (let i = 0; i <= 36; i++) { const th = (i / 36) * 2.3 * Math.PI, rr = r * (0.12 + 0.88 * i / 36); pts.push([x + dir * rr * Math.cos(th), y - rr * Math.sin(th)]); }
	const [lx, ly] = pts[pts.length - 1];
	for (let j = 1; j <= 18; j++) { const u = j / 18; pts.push([lx + dir * u * r * tail, ly + Math.sin(u * Math.PI) * r * rise - u * r * 0.2]); }
	return 'M' + pts.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join('L');
};
export const LacDefs: React.FC = () => <defs>
	<filter id="lacN" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.0015 0.03" numOctaves={2} seed={4} />
		<feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.18  0 0 0 0 0.11  0 0 0 1.6 -0.6" /></filter>
	<filter id="lacG" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={8} />
		<feColorMatrix values="0 0 0 0 1  0 0 0 0 0.9  0 0 0 0 0.8  0 0 0 0.9 -0.4" /></filter>
	<linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFF2C8" /><stop offset="0.3" stopColor="#F6CC72" /><stop offset="0.55" stopColor="#DDA444" /><stop offset="0.75" stopColor="#F8D88E" /><stop offset="1" stopColor="#BF8432" /></linearGradient>
	<linearGradient id="iron" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3B3E42" /><stop offset="0.5" stopColor="#8E959B" /><stop offset="1" stopColor="#34373B" /></linearGradient>
	<filter id="gl" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="14" stdDeviation="9" floodColor="#0A0402" floodOpacity="0.6" /></filter>
	<filter id="glS" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0A0402" floodOpacity="0.5" /></filter>
	<filter id="edge" x="-5%" y="-5%" width="110%" height="110%"><feMorphology in="SourceAlpha" operator="dilate" radius={3} result="d" /><feFlood floodColor={B.gold} /><feComposite in2="d" operator="in" result="g" /><feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
</defs>;
/** cold silver inlay with a specular band that slides across (k 0..1 = band position); the band lives inside the fill, so
    the glint never leaves the shape */
const SilverGrad: React.FC<{id: string; x0: number; x1: number; k: number}> = ({id, x0, x1, k}) => { const c = lerp(x0 - 200, x1 + 200, k);
	return <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={c - 260} y1={0} x2={c + 260} y2={260}>
		<stop offset="0" stopColor="#AEBCC5" /><stop offset="0.38" stopColor="#D9E4EA" /><stop offset="0.47" stopColor="#F4FAFD" /><stop offset="0.5" stopColor="#FFFFFF" />
		<stop offset="0.53" stopColor="#EEF5F9" /><stop offset="0.62" stopColor="#CAD6DD" /><stop offset="1" stopColor="#9DAAB2" /></linearGradient>; };
/** lacquer ground: warm oxblood-black, a long soft window reflection sliding with the box (sheen 0..1) */
export const Lacquer: React.FC<{sheen: number; id: string}> = ({sheen, id}) => <g>
	<defs><linearGradient id={`rf${id}`} gradientUnits="userSpaceOnUse" x1={lerp(-600, 1400, sheen)} y1={0} x2={lerp(-600, 1400, sheen) + 900} y2={700}>
		<stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.42" stopColor="#FFE9D0" stopOpacity="0.1" /><stop offset="0.5" stopColor="#FFEBD6" stopOpacity="0.2" /><stop offset="0.58" stopColor="#FFE9D0" stopOpacity="0.1" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
		<radialGradient id={`lv${id}`} cx="0.5" cy="0.5" r="0.75"><stop offset="0" stopColor="#6A3122" /><stop offset="0.55" stopColor="#4A2218" /><stop offset="1" stopColor="#2A130E" /></radialGradient></defs>
	<rect width={W} height={H} fill={`url(#lv${id})`} />
	<rect width={W} height={H} filter="url(#lacN)" opacity={0.18} />
	<rect width={W} height={H} filter="url(#lacG)" opacity={0.05} />
	<rect width={W} height={H} fill={`url(#rf${id})`} />
</g>;
/** a cinnabar band with a running gold cloud scroll */
const ScrollBand: React.FC<{y: number; x0: number; x1: number; h?: number; flow?: number; fill?: string}> = ({y, x0, x1, h = 48, flow = 0, fill = B.redD}) => { const n = Math.ceil((x1 - x0) / 150) + 1;
	return <g>
		<rect x={x0} y={y} width={x1 - x0} height={h} fill={fill} />
		<rect x={x0} y={y + 3} width={x1 - x0} height={2} fill={B.gold} opacity={0.9} /><rect x={x0} y={y + h - 5} width={x1 - x0} height={2} fill={B.gold} opacity={0.9} />
		<clipPath id={`sb${y}`}><rect x={x0} y={y} width={x1 - x0} height={h} /></clipPath>
		<g clipPath={`url(#sb${y})`}><g transform={`translate(${-(flow % 300)},0)`}>
			{Array.from({length: n + 2}, (_, i) => <path key={i} d={curl(x0 + i * 150 + 30, y + h * 0.56, h * 0.36, i % 2 ? -1 : 1, 3.4, 0.5)} fill="none" stroke={B.goldL} strokeWidth={2.4} strokeLinecap="round" transform={i % 2 ? `translate(${90},0)` : undefined} />)}
		</g></g>
	</g>; };
/** the red J seal on a small paper disc, phone-safe: seal box 74 px, ≥ 120 px from the side, ≥ 58 px from the bottom
    (disc included) */
export const SealB: React.FC = () => <>
	<div style={{position: 'absolute', right: SAFE_X + 4, bottom: SAFE_Y + 2, width: 86, height: 86, borderRadius: '50%', background: B.cream, boxShadow: '0 2px 8px rgba(0,0,0,0.45), inset 0 0 0 2px rgba(235,192,106,0.9)'}} />
	<Img src={SEAL_SRC} style={{position: 'absolute', right: SAFE_X + 10, bottom: SAFE_Y + 8, width: 74, height: 74, opacity: 0.95, transform: 'rotate(-6deg)'}} /></>;

/* ---------- B1: the hook ---------- */
const CH = ['财', '货', '贵', '钱'], CX = [236, 566, 896, 1290], CY = 410, CS = 300, CT = 872;   // CT = the stall's counter top
const Cowrie: React.FC<{x: number; y: number; L: number; rot?: number; o?: number}> = ({x, y, L, rot = 0, o = 1}) => { const c = cowrie(L);
	return <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={o}>
		<path d={c.body} fill="url(#leaf)" stroke="#8A5A1E" strokeWidth={2} />
		<ellipse cx={-L * 0.08} cy={-L * 0.2} rx={L * 0.2} ry={L * 0.06} fill="#FFF6D8" opacity={0.75} transform="rotate(-8)" /><path d={c.slit} fill={B.lac} /><path d={c.teeth} stroke={B.goldL} strokeWidth={L * 0.025} strokeLinecap="round" />
	</g>; };
/** where each cowrie comes to rest on the counter, right under its own character */
const REST = [[CX[0] + 0.27 * CS, -8], [CX[1] + 0.5 * CS, 6], [CX[2] + 0.5 * CS, -4]];
const CL = 116;
export const HookB: React.FC<{t: number}> = ({t}) => {
	const r1 = '财、货、贵，都带个"贝"，', r2 = '偏偏"钱"，是[金]字旁。';
	const cam = 1 + 0.02 * ease(seg(t, 0, 4));
	return <>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<LacDefs />
			<defs><SilverGrad id="svH" x0={CX[3]} x1={CX[3] + 0.5 * CS} k={seg(t, 1.3, 2.7)} /></defs>
			<Lacquer sheen={0.12 + 0.12 * t} id="h" />
			<g transform={`translate(960,560) scale(${cam}) translate(-960,-560)`}>
				<ScrollBand y={346} x0={150} x1={1700} flow={t * 40} />
				{/* faint cloud scrolls drifting in the lacquer behind the characters (depth) */}
				<g opacity={0.5} fill="none" stroke={B.redL} strokeWidth={3}>{[[230, 790, 44, 1], [1640, 520, 40, 1], [1660, 760, 50, -1]].map(([x, y, r, d], i) => <path key={i} d={curl(x + 10 * t, y, r, d, 3)} />)}</g>
				{/* 2026, the stall: a cinnabar counter with a gold rule and a cloud frieze, the code plaque and your phone */}
				<rect x={-40} y={CT} width={W + 80} height={H - CT + 40} fill="#B33C24" />
				<rect x={-40} y={CT} width={W + 80} height={7} fill={B.gold} />
				<rect x={-40} y={CT + 7} width={W + 80} height={22} fill="#000" opacity={0.12} />
				<ScrollBand y={CT + 40} x0={-40} x1={W + 40} h={44} flow={t * 20} fill={B.redD} />
				{/* the code plaque on its little stand, and the phone leaning on it (gold line = today's money) */}
				<rect x={1452} y={CT - 150} width={124} height={124} rx={6} fill={B.cream} stroke={B.gold} strokeWidth={3} />
				<rect x={1500} y={CT - 26} width={28} height={26} fill={B.redD} stroke={B.gold} strokeWidth={2} />
				<g transform={`translate(${1464},${CT - 138})`}><QRg /></g>
				<ellipse cx={1356} cy={CT + 4} rx={62} ry={8} fill="#000" opacity={0.3} />
				<g transform={`translate(1318,${CT - 146}) rotate(-7)`}>
					<rect x={0} y={0} width={84} height={152} rx={13} fill={B.lac} stroke={B.gold} strokeWidth={3} />
					<rect x={7} y={12} width={70} height={126} rx={6} fill="#3A2219" />
					<circle cx={42} cy={72} r={22} fill="none" stroke={B.goldL} strokeWidth={5} opacity={seg(t, 0.15, 0.35)} />
					<path d="M31,72 l8,9 l15,-18" fill="none" stroke={B.goldL} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={seg(t, 0.2, 0.4)} />
				</g>
				{CH.map((ch, i) => { const a = 0.1 + i * 0.27, k = land(seg(t, a, a + 0.5)), x = CX[i], s = CS;
					if (k <= 0) return null;
					const sc = lerp(1.25, 1, k), op = cl(k * 3), isQ = ch === '钱';
					const b = 0.5 + 0.22 * i, lift = seg(t, b + 0.15, b + 0.4);
					return <g key={ch} opacity={op} transform={`translate(${x + s / 2},${CY + s / 2}) scale(${sc}) translate(${-x - s / 2},${-CY - s / 2})`}>
						<Glyph ch={ch} x={x} y={CY} s={s} part="rest" id={`b${i}`} fill={B.red} stroke={B.goldL} sw={3} />
						{/* the socket the 贝 leaves: a dark recess still drawn by its gold line */}
						{!isQ && lift > 0 && <Glyph ch={ch} x={x} y={CY} s={s} part="comp" id={`bs${i}`} fill="rgba(26,10,6,0.38)" stroke={B.goldL} sw={2.5} style={{opacity: cl(lift * 3), strokeDasharray: '10 7'}} />}
						{!isQ && lift <= 0 && <Glyph ch={ch} x={x} y={CY} s={s} part="comp" id={`bc${i}`} fill={t > b ? 'url(#leaf)' : B.red} stroke={B.goldL} sw={3} />}
						{isQ && <Glyph ch={ch} x={x} y={CY} s={s} part="comp" id="bq" fill={t > 1.2 ? 'url(#svH)' : B.red} stroke={t > 1.2 ? '#F2F8FB' : B.goldL} sw={3} />}
					</g>; })}
				{/* each gold-leaf 贝 lifts clear of its socket (shadow under it), then drops to the counter as a gold-leaf cowrie */}
				{[0, 1, 2].map((i) => { const b = 0.5 + 0.22 * i, x = CX[i], s = CS, ch = CH[i], [ccx, ccy] = COMP_C[ch], lx = x + ccx * s, ly = CY + ccy * s;
					const lk = eio(seg(t, b + 0.15, b + 0.4)), fk = seg(t, b + 0.4, b + 0.9), gk = 1 - seg(t, b + 0.4, b + 0.58), ck = seg(t, b + 0.46, b + 0.6);
					if (lk <= 0) return null;
					const [rx, rr] = REST[i], ry = CT - CL * 0.36;
					const px = lerp(lx, rx, eio(fk)), py = lerp(ly - 34 * lk, ry, fk * fk) - Math.sin(Math.PI * fk) * 40, bounce = fk >= 1 ? 0 : 0;
					return <g key={i}>
						{gk > 0 && <g opacity={gk} filter="url(#gl)" transform={`translate(${px},${py}) scale(${lerp(1, 1.06, lk) * lerp(1, 0.5, fk * 2.5 > 1 ? 1 : fk * 2.5)}) translate(${-lx},${-ly})`}>
							<Glyph ch={ch} x={x} y={CY} s={s} part="comp" id={`br${i}`} fill="url(#leaf)" stroke={B.goldL} sw={2} />
						</g>}
						{ck > 0 && <>
							{fk >= 0.98 && <ellipse cx={rx} cy={CT + 3} rx={CL * 0.5} ry={7} fill="#000" opacity={0.32} />}
							<g filter={fk < 1 ? 'url(#gl)' : 'url(#glS)'}><Cowrie x={px} y={py + bounce} L={lerp(s * 0.42, CL, eout(fk))} rot={lerp(-20, rr + 1.5 * Math.sin(t * 2.2 + i), fk)} o={ck} /></g></>}
					</g>; })}
			</g>
		</svg>
		<Subs rows={[{s: r1}, ...(t > 1.0 ? [{s: r2, n: typed(r2, t, 1.0, 0.6)}] : [])]} th={thB} />
		<Counter year="2026" th={thB} />
		<SealB />
	</>;
};
const QRg: React.FC = () => <g>
	<path d={qrCells(25, 4).map(([j, i]) => `M${j * 4},${i * 4}h4.2v4.2h-4.2z`).join('')} fill={B.lac} />
	{[[0, 0], [0, 18], [18, 0]].map(([i, j]) => <g key={`${i}${j}`}><rect x={j * 4} y={i * 4} width={28} height={28} fill={B.lac} /><rect x={j * 4 + 4} y={i * 4 + 4} width={20} height={20} fill={B.cream} /><rect x={j * 4 + 8} y={i * 4 + 8} width={12} height={12} fill={B.lac} /></g>)}
</g>;

/* ---------- the 交子 note (our own generic design, no readable text): a tall printed note. Red layer: the border band with a
   lozenge chain and two seals pressed over the black. Black layer: a double frame, a reversed header, vertical columns of
   abstract brush strokes, and a woodblock picture (a storehouse, two porters with sacks, a tree). w × h, top-left 0,0 ---------- */
const glyphMarks = (x: number, y: number, c: number, seed: number) => { const r = (k: number) => rnd(seed * 7 + k, 11), d: string[] = [];
	const f = (v: number) => v.toFixed(1), n = 3 + Math.floor(r(0) * 2);
	/* a few short strokes, each in its own band of the cell, at a slanted angle: dense like brush text, never a readable 字 */
	for (let i = 0; i < n; i++) { const cy = y + c * (0.15 + 0.7 * (i + 0.5) / n), cx = x + c * (0.25 + 0.5 * r(i + 1)), len = c * (0.28 + 0.4 * r(i + 7)), a = (r(i + 13) > 0.5 ? 1 : -1) * (12 + 50 * r(i + 19)) * Math.PI / 180;
		d.push(`M${f(cx - Math.cos(a) * len / 2)},${f(cy - Math.sin(a) * len / 2)}l${f(Math.cos(a) * len)},${f(Math.sin(a) * len)}`); }
	return d.join(''); };
export const JiaoziB: React.FC<{w: number; h: number; id: string}> = ({w, h, id}) => {
	const red = '#BF3420', ink = '#22150F', paper = '#F5E9CB', X = (u: number) => u * w, Y = (v: number) => v * h;
	const cols = 6, c = X(0.088), colW = X(0.62) / cols, marks: string[] = [];
	for (let k = 0; k < cols; k++) { const x = X(0.19) + (cols - 1 - k) * colW + (colW - c) / 2; const n = k === 0 ? 5 : 4 + (k % 3 === 0 ? 0 : 1) + (k === 3 ? -1 : 0) + 1;
		for (let j = 0; j < n; j++) marks.push(glyphMarks(x, Y(0.215) + j * c * 1.14, c, k * 13 + j)); }
	const P = (u: number, v: number) => `${X(0.17 + 0.66 * u).toFixed(1)},${Y(0.625 + 0.255 * v).toFixed(1)}`;   // picture panel coords
	const diamonds = (x0: number, y0: number, x1: number, y1: number, n: number) => Array.from({length: n}, (_, i) => { const u = (i + 0.5) / n, x = lerp(x0, x1, u), y = lerp(y0, y1, u), s = X(0.022);
		return `M${x.toFixed(1)},${(y - s).toFixed(1)}l${s.toFixed(1)},${s.toFixed(1)}l${(-s).toFixed(1)},${s.toFixed(1)}l${(-s).toFixed(1)},${(-s).toFixed(1)}Z`; }).join('');
	const bw = X(0.075), bx = X(0.025) + bw / 2;
	return <g>
		<rect width={w} height={h} fill={paper} />
		<rect width={w} height={h} fill="#C9A76A" opacity={0.12} />
		{/* red border band with a paper lozenge chain */}
		<rect x={bx} y={bx} width={w - 2 * bx} height={h - 2 * bx} fill="none" stroke={red} strokeWidth={bw} />
		<path d={diamonds(bx, bx, bx, h - bx, 13) + diamonds(w - bx, bx, w - bx, h - bx, 13) + diamonds(bx, bx, w - bx, bx, 6) + diamonds(bx, h - bx, w - bx, h - bx, 6)} fill={paper} />
		{/* black layer */}
		<rect x={X(0.13)} y={X(0.13)} width={X(0.74)} height={h - X(0.26)} fill="none" stroke={ink} strokeWidth={Math.max(1.4, X(0.018))} />
		<rect x={X(0.155)} y={X(0.155)} width={X(0.69)} height={h - X(0.31)} fill="none" stroke={ink} strokeWidth={Math.max(0.8, X(0.008))} />
		<rect x={X(0.17)} y={Y(0.1)} width={X(0.66)} height={Y(0.085)} fill={ink} />
		<g stroke={paper} strokeWidth={Math.max(1.4, X(0.022))} strokeLinecap="round" fill="none">
			{[0, 1, 2].map((k) => <path key={k} d={glyphMarks(X(0.24) + k * X(0.19), Y(0.11), Y(0.065), 90 + k)} />)}</g>
		<path d={marks.join('')} stroke={ink} strokeWidth={Math.max(1, c * 0.13)} strokeLinecap="round" fill="none" />
		<path d={`M${X(0.17)},${Y(0.6)}h${X(0.66)}`} stroke={ink} strokeWidth={Math.max(1, X(0.012))} />
		{/* woodblock picture panel */}
		<rect x={X(0.17)} y={Y(0.625)} width={X(0.66)} height={Y(0.255)} fill="none" stroke={ink} strokeWidth={Math.max(1.2, X(0.014))} />
		<g fill={ink}>
			<path d={`M${P(0.04, 0.42)} Q${P(0.1, 0.36)} ${P(0.16, 0.18)} L${P(0.36, 0.18)} Q${P(0.42, 0.36)} ${P(0.5, 0.42)} Z`} />
			<path d={`M${P(0.08, 0.42)} H${X(0.17 + 0.66 * 0.46)} V${Y(0.625 + 0.255 * 0.9)} H${X(0.17 + 0.66 * 0.08)} Z`} />
			<circle cx={X(0.17 + 0.66 * 0.86)} cy={Y(0.625 + 0.255 * 0.36)} r={X(0.075)} /><rect x={X(0.17 + 0.66 * 0.85)} y={Y(0.625 + 0.255 * 0.4)} width={X(0.02)} height={Y(0.255 * 0.5)} />
			{[0.58, 0.72].map((u, k) => <g key={k}><circle cx={X(0.17 + 0.66 * u)} cy={Y(0.625 + 0.255 * 0.42)} r={X(0.028)} />
				<path d={`M${P(u - 0.045, 0.9)} L${P(u - 0.03, 0.52)} L${P(u + 0.035, 0.52)} L${P(u + 0.05, 0.9)} Z`} />
				<ellipse cx={X(0.17 + 0.66 * (u + 0.035))} cy={Y(0.625 + 0.255 * 0.47)} rx={X(0.045)} ry={X(0.03)} /></g>)}
			<rect x={X(0.17)} y={Y(0.625 + 0.255 * 0.9)} width={X(0.66)} height={Y(0.255 * 0.1)} />
		</g>
		<rect x={X(0.17 + 0.66 * 0.22)} y={Y(0.625 + 0.255 * 0.58)} width={X(0.07)} height={Y(0.255 * 0.32)} fill={paper} />
		{/* the red seals pressed over the black (朱墨 overprint) */}
		<g opacity={0.88}>
			<rect x={X(0.47)} y={Y(0.39)} width={X(0.34)} height={X(0.34)} fill={red} />
			<path d={`M${X(0.5)},${Y(0.39) + X(0.03)}h${X(0.28)}v${X(0.28)}h${-X(0.28)}Z M${X(0.54)},${Y(0.39) + X(0.09)}h${X(0.08)} M${X(0.54)},${Y(0.39) + X(0.15)}h${X(0.06)} M${X(0.54)},${Y(0.39) + X(0.21)}h${X(0.08)} M${X(0.54)},${Y(0.39) + X(0.27)}h${X(0.05)} M${X(0.67)},${Y(0.39) + X(0.08)}h${X(0.07)} M${X(0.68)},${Y(0.39) + X(0.14)}h${X(0.05)} M${X(0.67)},${Y(0.39) + X(0.2)}h${X(0.07)} M${X(0.69)},${Y(0.39) + X(0.26)}h${X(0.04)}`} stroke={paper} strokeWidth={Math.max(1, X(0.026))} fill="none" />
			<rect x={X(0.2)} y={Y(0.205)} width={X(0.15)} height={X(0.15)} fill={red} />
			<path d={`M${X(0.215)},${Y(0.205) + X(0.015)}h${X(0.12)}v${X(0.12)}h${-X(0.12)}Z M${X(0.24)},${Y(0.205) + X(0.06)}h${X(0.07)} M${X(0.24)},${Y(0.205) + X(0.095)}h${X(0.05)}`} stroke={paper} strokeWidth={Math.max(1, X(0.016))} fill="none" />
		</g>
		<title>{id}</title>
	</g>;
};

/* ---------- the iron 贯: a heavy loop of square-holed coins, both cord ends in the fist; it hangs plumb and swings as a
   pendulum (th degrees), the bottom lagging a little more than the top ---------- */
const IronLoop: React.FC<{x: number; y: number; L: number; th: number}> = ({x, y, L, th}) => {
	const cl2: [number, number][] = [], N = 80, br = 30;
	for (let i = 0; i <= N; i++) { const u = i / N; let p: [number, number];
		if (u < 0.4) { const v = u / 0.4; p = [lerp(-3, -br, Math.pow(v, 0.8)), lerp(0, L - br, v)]; }
		else if (u > 0.6) { const v = (1 - u) / 0.4; p = [lerp(3, br, Math.pow(v, 0.8)), lerp(0, L - br, v)]; }
		else { const a = Math.PI * (1 - (u - 0.4) / 0.2); p = [br * Math.cos(a), L - br + br * Math.sin(a) * 0.9]; }
		cl2.push(p); }
	const rot = (p: [number, number]): [number, number] => { const d = Math.hypot(p[0], p[1]), a = th * (0.75 + 0.25 * d / L) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
		return [x + p[0] * c - p[1] * s, y + p[0] * s + p[1] * c]; };
	const P = cl2.map(rot), coins: React.ReactNode[] = [];
	let acc = 0, next = 0, k = 0;
	for (let i = 1; i < P.length; i++) { const [ax, ay] = P[i - 1], [bx, by] = P[i], seg2 = Math.hypot(bx - ax, by - ay);
		while (next <= acc + seg2) { const f = (next - acc) / seg2, cx = lerp(ax, bx, f), cy = lerp(ay, by, f), ang = Math.atan2(by - ay, bx - ax) * 180 / Math.PI;
			coins.push(<ellipse key={k} cx={cx} cy={cy} rx={3.4} ry={13} transform={`rotate(${ang.toFixed(1)},${cx.toFixed(1)},${cy.toFixed(1)})`} fill={k % 2 ? '#5D646A' : '#7C858C'} stroke="#25282B" strokeWidth={1} />); k++; next += 4.4; }
		acc += seg2; }
	const bot = rot([0, L - 2]);
	return <g>
		<ellipse cx={bot[0]} cy={y + L + 26} rx={40} ry={6} fill="#000" opacity={0.28} />
		{coins}
		{[[-15, -14, -20], [0, -6, 8], [15, -14, 24]].map(([dx, dy, r], i) => { const [cx, cy] = rot([dx, L + dy]);
			return <g key={i} transform={`rotate(${r + th},${cx},${cy})`}><circle cx={cx} cy={cy} r={14} fill="#636A70" stroke="#A9B1B7" strokeWidth={2} /><rect x={cx - 4.5} y={cy - 4.5} width={9} height={9} fill={B.lac} /></g>; })}
	</g>;
};

/* ---------- B2: the Song street, 交子铺 counter ---------- */
/** the loaded arm, hanging plumb in front of the body: redrawn on top with a gold contour so it separates from the torso */
const NearArm: React.FC<{sh: [number, number]; hand: [number, number]; h: number}> = ({sh, hand, h}) => {
	const w0 = 0.036 * h, we = 0.026 * h, w1 = 0.018 * h, x0 = sh[0], y0 = sh[1] + 0.03 * h, x1 = hand[0], y1 = hand[1], ye = lerp(y0, y1, 0.5);
	/* deltoid → elbow → wrist, a slight bulge at the back of the upper arm; the fist closes round the cord */
	const d = `M${x0 - w0},${y0} C${x0 - w0 * 1.15},${lerp(y0, ye, 0.5)} ${x0 - we},${ye - 6} ${x0 - we},${ye} L${x1 - w1},${y1} L${x1 + w1},${y1} L${x0 + we * 0.95},${ye} C${x0 + we},${ye - 10} ${x0 + w0 * 0.95},${lerp(y0, ye, 0.4)} ${x0 + w0 * 0.85},${y0} Q${x0},${y0 - 0.05 * h} ${x0 - w0},${y0} Z`;
	return <g fill={B.lac} stroke={B.gold} strokeWidth={2.2} strokeLinejoin="round"><path d={d} />
		<ellipse cx={x1} cy={y1 + 0.026 * h} rx={0.026 * h} ry={0.032 * h} /></g>; };
/** standing under the load: knees bent, the loaded (near) shoulder dropped, near arm hanging plumb; the far hand lifts the
    note to his eyes. sway (deg) = the string's swing; the torso counter-leans a little against it */
const heavyPose = (sway: number, breath: number): Pose => {
	const p = grounded({lean: 3 - 0.35 * sway + breath, neck: -5, lt: 13, lk: 17, rt: -12, rk: 15, la: 0, le: 0, ra: 70, re: 40});
	const sh = p.LSh, s2: [number, number] = [sh[0] - 0.008, sh[1] - 0.038];
	p.LSh = s2; p.LElb = [s2[0], s2[1] - 0.194]; p.LHand = [s2[0], s2[1] - 0.329];
	return p; };
export const SongB: React.FC<{t: number}> = ({t}) => {
	const g = 905, h = 565, wx = 830, cam = -7 * t;
	const sway = 7 * Math.exp(-0.28 * t) * Math.sin(2 * Math.PI * t / 1.3 + 0.7), pose = heavyPose(sway, 0.6 * Math.sin(t * 2.1));
	const J = (n: string): [number, number] => [wx + pose[n][0] * h, g - pose[n][1] * h];
	const lh = J('LHand'), rh = J('RHand'), re = J('RElb');
	const fdx = rh[0] - re[0], fdy = rh[1] - re[1], fl = Math.hypot(fdx, fdy), grip: [number, number] = [rh[0] + fdx / fl * 0.03 * h, rh[1] + fdy / fl * 0.03 * h];
	const NW = 128, NH = 224;
	const shops = [shop(-170, g - 4, 560, 390), shop(440, g - 4, 520, 360), shop(1060, g - 4, 600, 410), shop(1720, g - 4, 520, 380)];
	const far = Array.from({length: 8}, (_, i) => shop(-260 + i * 330, 560, 300, 120 + 50 * rnd(i, 3)));
	const kp = grounded({lean: 6, neck: 6, lt: 2, lk: 2, rt: -3, rk: 3, la: 62 + 4 * Math.sin(t * 1.6), le: 28, ra: 2, re: 8});
	const r1 = '于是有了[交子]：', r2 = '一张纸，能换一千文。';
	return <>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<LacDefs />
			<defs><linearGradient id="skyB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3C1B14" /><stop offset="0.35" stopColor="#5C2A1E" /><stop offset="0.55" stopColor="#8A4028" /><stop offset="0.85" stopColor="#8A4028" /></linearGradient></defs>
			<rect width={W} height={H} fill="url(#skyB)" />
			<Lacquer sheen={0.3 + 0.1 * t} id="s" />
			<rect width={W} height={600} fill="url(#skyB)" opacity={0.55} />
			{/* sky: gold cloud scrolls drifting */}
			<g fill="none" stroke={B.gold} strokeWidth={2.6} strokeLinecap="round" opacity={0.75}>{[[1180, 300, 44, 1], [1560, 370, 30, -1], [700, 420, 26, 1], [1840, 250, 34, -1]].map(([x, y, r, d], i) => <path key={i} d={curl(x + cam * 0.15 + 8 * t, y, r, d, 3.2)} />)}</g>
			<g transform={`translate(${cam * 0.3},0)`}>
				<g fill={B.far}>{far.map((s, i) => <path key={i} d={s.roof} />)}
					<path d="M1260,560 V420 H1540 V560 Z M1210,420 Q1320,392 1340,352 H1460 Q1480,392 1590,420 Z M1290,352 Q1370,334 1380,306 H1420 Q1430,334 1510,352 Z" /></g>
				<g fill="none" stroke={B.ochre} strokeWidth={1.8} opacity={0.85}>{far.map((s, i) => <path key={i} d={s.roof} />)}</g>
				<rect x={-200} y={560} width={2600} height={360} fill={B.far} />
			</g>
			<g transform={`translate(${cam},0)`}>
				{/* back walls in warm cinnabar so the black figures read against red */}
				<rect x={-200} y={575} width={2600} height={335} fill={B.redD} />
				{shops.map((s, i) => <g key={i}>
					<path d={s.roof} fill={B.lac2} stroke={B.gold} strokeWidth={2.5} />
					<path d={s.tiles} stroke={B.gold} strokeWidth={1.6} opacity={0.6} />
					<path d={s.posts} fill={B.redD} stroke={B.gold} strokeWidth={1.2} /><path d={s.beam} fill={B.red} stroke={B.gold} strokeWidth={2} />
					<path d={s.sign} fill={B.lac} stroke={B.gold} strokeWidth={2} />
					{i !== 2 && <path d={s.counter} fill={B.red} stroke={B.gold} strokeWidth={2} />}
					<path d={s.shutter} stroke="#6E2414" strokeWidth={7} />
				</g>)}
				{[[255, 560], [700, 575], [1360, 545]].map(([x, y], i) => <g key={i}><rect x={x - 1.5} y={y - 44} width={3} height={20} fill={B.gold} /><ellipse cx={x} cy={y} rx={22} ry={27} fill={B.redL} stroke={B.gold} strokeWidth={2} /><ellipse cx={x - 6} cy={y - 6} rx={7} ry={10} fill="#FFC9A0" opacity={0.5} /><rect x={x - 12} y={y + 24} width={24} height={8} fill={B.gold} /></g>)}
				{/* the 交子铺: banner on a pole, the clerk behind the counter waiting with an open hand, his strings of coin */}
				<rect x={1586} y={430} width={8} height={475} fill={B.ochre} /><path d="M1594,446 H1672 V650 L1633,628 L1594,650 Z" fill={B.redL} stroke={B.gold} strokeWidth={2} />
				<Figure4 x={1250} ground={g - 4} h={420} pose={kp} look={{dress: 'robe', head: 'futou'}} col={B.lac2} flip />
				<path d={shops[2].counter} fill={B.red} stroke={B.gold} strokeWidth={2} />
				{[0, 1, 2].map((i) => <ellipse key={i} cx={1150 + i * 50} cy={g - 4 - 0.3 * 410 - 12} rx={26} ry={13} fill="url(#iron)" />)}
				{/* ground: a cinnabar band with a gold lozenge lattice */}
				<rect x={-200} y={g} width={W + 400} height={H - g + 20} fill={B.redD} />
				<rect x={-200} y={g} width={W + 400} height={4} fill={B.gold} />
				<path d={Array.from({length: 26}, (_, i) => `M${-180 + i * 90},${g + 30} l45,40 l-45,40 l-45,-40 Z`).join(' ')} fill="none" stroke={B.gold} strokeWidth={2} opacity={0.65} />
				{/* the note, held up by its lower edge (drawn before the figure so the fist closes over it) */}
				<g transform={`translate(${grip[0]},${grip[1]}) rotate(${-5 + 1.5 * Math.sin(t * 1.7)}) translate(${-NW / 2},${-NH + 34})`} filter="url(#glS)">
					<JiaoziB w={NW} h={NH} id="jz" />
				</g>
				<g filter="url(#edge)"><Figure4 x={wx} ground={g} h={h} pose={pose} look={{dress: 'tunic', head: 'futou', legs: 'trousers'}} col={B.lac} T={t} /></g>
				<IronLoop x={lh[0]} y={lh[1] + 0.04 * h} L={g - lh[1] - 0.04 * h - 30} th={sway} />
				<NearArm sh={J('LSh')} hand={lh} h={h} />
				<g fontFamily={KAI} fontWeight={700} fontSize={46}>
					<text x={grip[0] + NW / 2 + 22} y={grip[1] - NH + 70} fill={B.goldL} style={{paintOrder: 'stroke'}} stroke={B.lac} strokeWidth={7}>一张</text>
					<path d={`M${lh[0] - 40},${g - 70} L${lh[0] - 120},${g - 128}`} stroke={B.cream} strokeWidth={2.5} opacity={0.8} />
					<text x={lh[0] - 270} y={g - 138} fill={B.cream} stroke={B.lac} strokeWidth={7} style={{paintOrder: 'stroke'}}>一千文</text>
				</g>
			</g>
		</svg>
		<Subs rows={[{s: r1}, {s: r2}]} th={thB} />
		<Stamp y="北宋" place="益州" note="一交一缗" th={thB} />
		<Counter era="北宋" th={thB} />
		<SealB />
	</>;
};

/* ---------- motion test: 钅 unspools into a gold line → the spade is drawn and flooded with lacquer → (flood done) a
   cloud curl casts it into the gold-leaf 布币 → the 钱 tag hops on and hangs from its socket ---------- */
export const MorphB: React.FC<{t: number}> = ({t}) => {
	const s = 520, cam = 1 + 0.03 * eio(seg(t, 0, 4));
	const rest = 1 - ease(seg(t, 0.3, 0.8)), slide = eio(seg(t, 0.3, 0.9)), qFade = 1 - ease(seg(t, 0.95, 1.35));
	const qx = lerp(560, 700, slide), qy = 330;
	const draw = eio(seg(t, 0.9, 1.45)), flood = eio(seg(t, 1.4, 1.9));
	const swirl = seg(t, 2.05, 2.85), shrink = eio(seg(t, 2.2, 2.8)), leafK = eio(seg(t, 2.7, 3.2)), hop = seg(t, 3.2, 3.65);
	const sp = spade(400, 250), bb = bubi(470), cx = 940, cy = lerp(700, 640, shrink);
	const r1 = '原来，"钱"是一把[铲子]。', r2 = '东周时，人们照着铲子铸铜币，';
	const hole: [number, number] = [cx, cy - 470 / 2 * 0.94], tag: [number, number] = [lerp(1240, 1110, eout(hop)), lerp(330, 470, eout(hop)) - Math.sin(Math.PI * hop) * 60];
	return <>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<LacDefs />
			<defs><SilverGrad id="svM" x0={qx} x1={qx + 0.5 * s} k={seg(t, 0, 1.3)} />
				<clipPath id="floodB"><rect x={-600} y={lerp(260, -560, flood)} width={1200} height={1400} /></clipPath>
				<clipPath id="leafB"><rect x={-600} y={lerp(250, -250, leafK)} width={1200} height={1200} /></clipPath></defs>
			<Lacquer sheen={0.1 + 0.18 * t} id="m" />
			<g transform={`translate(960,560) scale(${cam}) translate(-960,-560)`}>
				<ScrollBand y={258} x0={150} x1={1700} flow={t * 60} />
				{/* the field: two cinnabar trees, a far ridge, the furrowed ground */}
				<path d="M-40,900 Q300,760 620,840 Q980,720 1320,830 Q1640,760 1960,860 V900 H-40 Z" fill={B.far} />
				<path d="M-40,900 Q300,760 620,840 Q980,720 1320,830 Q1640,760 1960,860" fill="none" stroke={B.ochre} strokeWidth={2} opacity={0.8} />
				<path d={treeD(1520, 900, 1.5)} fill={B.redD} stroke={B.gold} strokeWidth={2.4} /><path d={treeD(360, 900, 1.15)} fill={B.redD} stroke={B.gold} strokeWidth={2.4} />
				<path d={curl(1230 + 10 * t, 420, 34, -1, 3)} fill="none" stroke={B.gold} strokeWidth={2.6} opacity={0.8} />
				<rect x={-40} y={900} width={W + 80} height={220} fill={B.red} /><rect x={-40} y={900} width={W + 80} height={5} fill={B.gold} />
				<path d={furrows(900)} stroke={B.goldL} strokeWidth={2} fill="none" opacity={0.55} />
				{rest > 0.01 && <Glyph ch="钱" x={560} y={330} s={s} part="rest" id="mr" fill={B.red} stroke={B.goldL} sw={3} style={{opacity: rest}} />}
				{qFade > 0.01 && <g opacity={qFade}><Glyph ch="钱" x={qx} y={qy} s={s} part="comp" id="mq" fill="url(#svM)" stroke="#F2F8FB" sw={2} /></g>}
				<g transform={`translate(${cx},${cy}) scale(${lerp(1, 0.96, shrink)}) rotate(${-12 * Math.sin(Math.PI * swirl)})`}>
					<g opacity={1 - shrink}>
						<g clipPath="url(#floodB)"><path d={sp.handle} fill={B.ochre} /><path d={sp.blade} fill={B.red} /></g>
						<path d={sp.handle} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} fill="none" stroke={B.gold} strokeWidth={4} />
						<path d={sp.blade} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} fill="none" stroke={B.goldL} strokeWidth={5} />
					</g>
					<g opacity={shrink}>
						<path d={bb.body} fill={B.red} stroke={B.goldL} strokeWidth={4} />
						<g clipPath="url(#leafB)"><path d={bb.body} fill="url(#leaf)" /></g>
						<path d={bb.hole} fill={B.lac} /><path d={bb.nail} fill={B.lac} /><path d={bb.ribs} stroke="#7A4A16" strokeWidth={4} opacity={0.6} fill="none" />
					</g>
				</g>
				{/* the cloud curl that wraps the spade and closes on the coin (starts only once the flood is done) */}
				{swirl > 0 && swirl < 1 && <path d={curl(cx - 40, cy - 40, 220, 1, 1.6, 0.3)} pathLength={1} strokeDasharray={`${0.6 * Math.sin(Math.PI * swirl)} 1`} strokeDashoffset={-swirl * 0.5} fill="none" stroke={B.goldL} strokeWidth={6} strokeLinecap="round" />}
				{hop > 0 && <>
					<path d={`M${hole[0]},${hole[1] + 4} Q${lerp(hole[0], tag[0], 0.5)},${lerp(hole[1], tag[1], 0.5) + 40 * eout(hop)} ${tag[0] + 12},${tag[1] + 8}`} fill="none" stroke={B.goldL} strokeWidth={3} opacity={cl(hop * 2 - 0.6)} />
					<g transform={`translate(${tag[0]},${tag[1]}) rotate(${-4 + 3 * Math.sin(t * 3)})`} opacity={cl(hop * 3)} filter="url(#glS)">
						<rect x={0} y={0} width={176} height={176} rx={6} fill={B.redD} stroke={B.goldL} strokeWidth={3} />
						<circle cx={12} cy={8} r={6} fill={B.lac} stroke={B.goldL} strokeWidth={2} />
						<Glyph ch="钱" x={18} y={20} s={140} part="rest" id="hr" fill={B.cream} />
						<Glyph ch="钱" x={18} y={20} s={140} part="comp" id="hq" fill="url(#svM)" />
					</g></>}
			</g>
		</svg>
		<Subs rows={[t < 2.05 ? {s: r1} : {s: r2, n: typed(r2, t, 2.05, 0.5)}]} th={thB} />
		<Counter era={t < 2.05 ? '商周' : '东周'} th={thB} />
		<SealB />
	</>;
};

