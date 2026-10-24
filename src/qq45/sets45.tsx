import React from 'react';
import {W, H, rnd, lerp, Glow, CU, T, HorseHead, ZPATH, Z, ZODIAC} from './kit45';
/* ep45 sets, quality pass (owner 23:27 「图片做的好粗糙」): light from the upper left on everything, gradient shading,
   soft contact shadows, depth haze, varied line weight, much more architectural detail. */

/* ---------- shared defs (once per svg) ---------- */
export const QDefs: React.FC = () => <defs>
	<filter id="soft6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={6} /></filter>
	<filter id="soft14" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={14} /></filter>
	<filter id="soft30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={30} /></filter>
	<filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves={3} seed={9} /><feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.40  0 0 0 0 0.33  0 0 0 0.5 0" /></filter>
	{/* vertical light→shade for marble walls (lit from the left) */}
	<linearGradient id="mbH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#F4EEE2" /><stop offset="0.55" stopColor="#E6DDCB" /><stop offset="1" stopColor="#CFC3AC" /></linearGradient>
	<linearGradient id="mbV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F2ECDF" /><stop offset="1" stopColor="#D2C6AF" /></linearGradient>
	<linearGradient id="mbShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B9AC93" /><stop offset="1" stopColor="#9C8E75" /></linearGradient>
	<linearGradient id="win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1D2A33" /><stop offset="0.7" stopColor="#2E3F4B" /><stop offset="1" stopColor="#40545F" /></linearGradient>
	<linearGradient id="tile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3F5E5A" /><stop offset="1" stopColor="#2C4442" /></linearGradient>
	<linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7FBDB8" /><stop offset="1" stopColor="#4E918F" /></linearGradient>
	<linearGradient id="pave" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D9CCAD" /><stop offset="1" stopColor="#B4A27F" /></linearGradient>
	<linearGradient id="bronze" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#C29470" /><stop offset="0.45" stopColor="#8C6247" /><stop offset="1" stopColor="#4F3423" /></linearGradient>
	<linearGradient id="stoneG" x1="0" y1="0" x2="1" y2="0.4"><stop offset="0" stopColor="#E3DBCB" /><stop offset="0.6" stopColor="#C2B8A4" /><stop offset="1" stopColor="#968C79" /></linearGradient>
	<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#DCE6E6" stopOpacity="0" /><stop offset="1" stopColor="#DCE6E6" stopOpacity="0.55" /></linearGradient>
</defs>;
const INK = '#2B2722', INK2 = '#5A5144';
/** soft contact shadow */
export const Shadow: React.FC<{x: number; y: number; rx: number; ry: number; o?: number}> = ({x, y, rx, ry, o = 0.35}) => <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#1E1A14" opacity={o} filter="url(#soft14)" />;

/* ---------- sky with soft clouds (engraved lines kept faint) ---------- */
export const Sky3: React.FC<{id: string; top: string; bot: string; clouds?: number; seed?: number}> = ({id, top, bot, clouds = 5, seed = 1}) => <g>
	<defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bot} /></linearGradient></defs>
	<rect x={0} y={0} width={W} height={H} fill={`url(#${id})`} />
	{Array.from({length: clouds}, (_, i) => { const cx = 200 + rnd(i, seed) * 1600, cy = 90 + rnd(i, seed + 1) * 260, w = 220 + 220 * rnd(i, seed + 2);
		return <g key={i} opacity={0.55} filter="url(#soft6)">{Array.from({length: 5}, (_, j) => <ellipse key={j} cx={cx + (j - 2) * w * 0.22} cy={cy - Math.sin(j / 4 * Math.PI) * 26} rx={w * 0.22} ry={28 + 14 * Math.sin(j / 4 * Math.PI)} fill="#F6F7F2" />)}</g>; })}
	{Array.from({length: 70}, (_, i) => <line key={i} x1={0} y1={i * 8 + 4} x2={W} y2={i * 8 + 4} stroke="#30404A" strokeWidth={0.8} opacity={0.06} />)}
</g>;

/* ---------- trees: layered crowns, lit side, shadow side ---------- */
export const Tree3: React.FC<{x: number; g: number; h: number; seed?: number; hue?: 'pine' | 'willow' | 'round'; haze?: number}> = ({x, g, h, seed = 1, hue = 'round', haze = 0}) => { void haze;
	const dark = hue === 'pine' ? '#33503F' : '#3E5F45', mid = hue === 'pine' ? '#4C6E55' : '#5E8459', lite = hue === 'pine' ? '#6F8F70' : '#8DAE7C';
	const clumps = Array.from({length: 16}, (_, i) => { const a = rnd(i, seed) * Math.PI * 2, d = Math.sqrt(rnd(i, seed + 3)); return {x: x + Math.cos(a) * h * 0.26 * d, y: g - h * 0.66 + Math.sin(a) * h * 0.2 * d, r: h * (0.09 + 0.07 * rnd(i, seed + 1)), lit: Math.cos(a + 2.3)}; });
	return <g>
		<Shadow x={x + h * 0.12} y={g + 4} rx={h * 0.32} ry={h * 0.05} o={0.3} />
		<path d={`M${x - h * 0.035},${g} C${x - h * 0.02},${g - h * 0.3} ${x - h * 0.03},${g - h * 0.45} ${x - h * 0.01},${g - h * 0.58} L${x + h * 0.02},${g - h * 0.58} C${x + h * 0.02},${g - h * 0.4} ${x + h * 0.03},${g - h * 0.3} ${x + h * 0.04},${g} Z`} fill="#4A3A2C" />
		<path d={`M${x + h * 0.005},${g} L${x + h * 0.04},${g} L${x + h * 0.02},${g - h * 0.58} Z`} fill="#2E241B" opacity={0.6} />
		{clumps.map((c, i) => <ellipse key={`d${i}`} cx={c.x + 6} cy={c.y + 8} rx={c.r} ry={c.r * 0.85} fill={dark} />)}
		{clumps.map((c, i) => <ellipse key={`m${i}`} cx={c.x} cy={c.y} rx={c.r * 0.92} ry={c.r * 0.78} fill={mid} />)}
		{clumps.filter((c) => c.lit > 0).map((c, i) => <ellipse key={`l${i}`} cx={c.x - c.r * 0.25} cy={c.y - c.r * 0.25} rx={c.r * 0.55} ry={c.r * 0.42} fill={lite} opacity={0.85} />)}
		{hue === 'willow' && Array.from({length: 22}, (_, i) => { const x0 = x - h * 0.3 + i * h * 0.028; return <path key={i} d={`M${x0},${g - h * 0.62} C${x0 - 8},${g - h * 0.45} ${x0 + 6},${g - h * 0.3} ${x0 - 3},${g - h * 0.16}`} stroke={i % 3 ? mid : lite} strokeWidth={2.4} fill="none" opacity={0.85} />; })}
	</g>;
};

/* ---------- 海晏堂 west facade, detailed (our drawing after the 1780s engraving) ---------- */
export const Haiyantang3: React.FC<{cx: number; g: number; k: number}> = ({cx, g, k}) => {
	const w = 1120 * k, f1 = 190 * k, f2 = 170 * k, x0 = cx - w / 2, yTop = g - f1 - f2, bay = 300 * k, bayX = cx - bay / 2;
	const winA = (x: number, y: number, ww: number, hh: number, key: string, ped = true) => <g key={key}>
		<rect x={x - 7 * k} y={y - 6 * k} width={ww + 14 * k} height={hh + 10 * k} fill="url(#mbV)" stroke={INK2} strokeWidth={0.9} />
		<path d={`M${x},${y + hh} L${x},${y + ww / 2} A${ww / 2},${ww / 2} 0 0 1 ${x + ww},${y + ww / 2} L${x + ww},${y + hh} Z`} fill="url(#win)" stroke={INK} strokeWidth={1.2} />
		<line x1={x + ww / 2} y1={y + 4} x2={x + ww / 2} y2={y + hh} stroke="#55707D" strokeWidth={1.2} opacity={0.7} />
		<line x1={x} y1={y + hh * 0.55} x2={x + ww} y2={y + hh * 0.55} stroke="#55707D" strokeWidth={1.2} opacity={0.7} />
		<path d={`M${x + ww / 2 - 6 * k},${y - 8 * k} L${x + ww / 2 + 6 * k},${y - 8 * k} L${x + ww / 2 + 4 * k},${y + 8 * k} L${x + ww / 2 - 4 * k},${y + 8 * k} Z`} fill="#F6F1E6" stroke={INK2} strokeWidth={0.8} />
		{ped && <path d={`M${x - 10 * k},${y - 12 * k} Q${x + ww / 2},${y - 34 * k} ${x + ww + 10 * k},${y - 12 * k}`} fill="none" stroke={INK2} strokeWidth={2} />}
		<rect x={x - 9 * k} y={y + hh + 2 * k} width={ww + 18 * k} height={6 * k} fill="#F6F1E6" stroke={INK2} strokeWidth={0.8} />
	</g>;
	const pil = (x: number, y: number, hh: number, key: string) => <g key={key}><rect x={x} y={y} width={16 * k} height={hh} fill="#F3EDE1" /><rect x={x + 11 * k} y={y} width={5 * k} height={hh} fill="#CABFA8" /><rect x={x - 3 * k} y={y} width={22 * k} height={8 * k} fill="#F6F1E6" stroke={INK2} strokeWidth={0.7} /></g>;
	const balus = (xa: number, xb: number, y: number, key: string) => <g key={key}>
		<rect x={xa} y={y - 4 * k} width={xb - xa} height={6 * k} fill="#F6F1E6" stroke={INK2} strokeWidth={0.8} />
		{Array.from({length: Math.floor((xb - xa) / (13 * k))}, (_, i) => { const x = xa + 6 * k + i * 13 * k; return <path key={i} d={`M${x - 3 * k},${y + 2 * k} C${x - 6 * k},${y + 10 * k} ${x + 6 * k},${y + 10 * k} ${x + 3 * k},${y + 2 * k} L${x + 2 * k},${y + 20 * k} L${x - 2 * k},${y + 20 * k} Z`} fill="#EEE7D9" stroke={INK2} strokeWidth={0.5} />; })}
		<rect x={xa} y={y + 20 * k} width={xb - xa} height={5 * k} fill="#D9CFBD" stroke={INK2} strokeWidth={0.6} />
	</g>;
	const wingWins = (y: number, hh: number, row: string) => Array.from({length: 10}, (_, i) => { const x = x0 + 46 * k + i * (w - 132 * k) / 9; if (Math.abs(x + 20 * k - cx) < bay / 2 + 26 * k) return null; return winA(x, y, 40 * k, hh, `${row}${i}`, row === 'u'); });
	return <g>
		<Shadow x={cx + 40 * k} y={g + 6} rx={w * 0.55} ry={26 * k} o={0.35} />
		{/* Chinese glazed-tile roof behind the stone attic */}
		<path d={`M${x0 + 20 * k},${yTop - 26 * k} L${x0 + 110 * k},${yTop - 96 * k} L${x0 + w - 110 * k},${yTop - 96 * k} L${x0 + w - 20 * k},${yTop - 26 * k} Z`} fill="url(#tile)" stroke={INK} strokeWidth={1.2} />
		{Array.from({length: 40}, (_, i) => { const x = x0 + 40 * k + i * (w - 80 * k) / 39; return <line key={i} x1={x} y1={yTop - 30 * k} x2={x + (x - cx) * 0.06} y2={yTop - 92 * k} stroke="#22383A" strokeWidth={1} opacity={0.55} />; })}
		<path d={`M${x0 + 100 * k},${yTop - 96 * k} L${x0 + w - 100 * k},${yTop - 96 * k}`} stroke="#1E3032" strokeWidth={5 * k} />
		{/* main mass: two storeys */}
		<rect x={x0} y={yTop} width={w} height={f1 + f2} fill="url(#mbH)" stroke={INK} strokeWidth={1.6} />
		{/* string courses and cornices */}
		<rect x={x0 - 8 * k} y={yTop - 6 * k} width={w + 16 * k} height={12 * k} fill="#F7F2E8" stroke={INK2} strokeWidth={0.9} />
		<rect x={x0 - 8 * k} y={yTop + 6 * k} width={w + 16 * k} height={5 * k} fill="#B5A98F" />
		<rect x={x0 - 6 * k} y={yTop + f2 - 6 * k} width={w + 12 * k} height={10 * k} fill="#F7F2E8" stroke={INK2} strokeWidth={0.8} />
		<rect x={x0 - 6 * k} y={yTop + f2 + 4 * k} width={w + 12 * k} height={4 * k} fill="#B5A98F" />
		{balus(x0, x0 + w, yTop - 30 * k, 'att')}
		{Array.from({length: 12}, (_, i) => { const x = x0 + 10 * k + i * (w - 20 * k) / 11; if (Math.abs(x - cx) < bay / 2) return null; return <path key={i} d={`M${x - 8 * k},${yTop - 30 * k} C${x - 14 * k},${yTop - 46 * k} ${x + 14 * k},${yTop - 46 * k} ${x + 8 * k},${yTop - 30 * k} Z M${x - 4 * k},${yTop - 44 * k} C${x - 6 * k},${yTop - 58 * k} ${x + 6 * k},${yTop - 58 * k} ${x + 4 * k},${yTop - 44 * k} Z`} fill="#F1EADC" stroke={INK2} strokeWidth={0.7} />; })}
		{/* pilasters between bays */}
		{Array.from({length: 11}, (_, i) => { const x = x0 + 20 * k + i * (w - 56 * k) / 10; if (Math.abs(x - cx) < bay / 2 + 8 * k) return null; return <g key={i}>{pil(x, yTop + 12 * k, f2 - 18 * k, `p2${i}`)}{pil(x, yTop + f2 + 10 * k, f1 - 12 * k, `p1${i}`)}</g>; })}
		{wingWins(yTop + 46 * k, 96 * k, 'u')}{wingWins(yTop + f2 + 40 * k, 120 * k, 'l')}
		{/* central bay: projecting, with an ornate crest */}
		<Shadow x={bayX + bay + 14 * k} y={yTop + (f1 + f2) / 2} rx={14 * k} ry={(f1 + f2) / 2} o={0.25} />
		<rect x={bayX} y={yTop - 30 * k} width={bay} height={f1 + f2 + 30 * k} fill="url(#mbH)" stroke={INK} strokeWidth={1.6} />
		<path d={`M${bayX - 14 * k},${yTop - 30 * k} C${bayX + 30 * k},${yTop - 70 * k} ${cx - 60 * k},${yTop - 80 * k} ${cx - 40 * k},${yTop - 120 * k} C${cx - 20 * k},${yTop - 150 * k} ${cx + 20 * k},${yTop - 150 * k} ${cx + 40 * k},${yTop - 120 * k} C${cx + 60 * k},${yTop - 80 * k} ${bayX + bay - 30 * k},${yTop - 70 * k} ${bayX + bay + 14 * k},${yTop - 30 * k} Z`} fill="url(#mbV)" stroke={INK} strokeWidth={1.6} />
		<circle cx={cx} cy={yTop - 88 * k} r={24 * k} fill="#E8DFCD" stroke={INK} strokeWidth={1.4} />
		{Array.from({length: 9}, (_, i) => { const a = Math.PI + (i + 0.5) * Math.PI / 9; return <line key={i} x1={cx} y1={yTop - 88 * k} x2={cx + Math.cos(a) * 22 * k} y2={yTop - 88 * k + Math.sin(a) * 22 * k} stroke={INK2} strokeWidth={1} />; })}
		{[-1, 1].map((sg) => <path key={sg} d={`M${cx + sg * 30 * k},${yTop - 62 * k} C${cx + sg * 70 * k},${yTop - 60 * k} ${cx + sg * 90 * k},${yTop - 40 * k} ${cx + sg * 120 * k},${yTop - 44 * k}`} stroke={INK2} strokeWidth={2} fill="none" />)}
		{[bayX + 8 * k, bayX + bay - 28 * k].map((x, i) => <g key={i}>{pil(x, yTop - 20 * k, f2 + 6 * k, `bp2${i}`)}{pil(x, yTop + f2 + 10 * k, f1 - 12 * k, `bp1${i}`)}</g>)}
		{winA(cx - 44 * k, yTop + 30 * k, 88 * k, 118 * k, 'cu')}
		<path d={`M${cx - 42 * k},${g} L${cx - 42 * k},${yTop + f2 + 70 * k} A${42 * k},${42 * k} 0 0 1 ${cx + 42 * k},${yTop + f2 + 70 * k} L${cx + 42 * k},${g} Z`} fill="url(#win)" stroke={INK} strokeWidth={1.4} />
		{balus(bayX - 20 * k, bayX + bay + 20 * k, yTop + f2 - 30 * k, 'terr')}
		{/* the double stair: two curving flights down from the terrace */}
		{[-1, 1].map((sg) => { const sx = cx + sg * bay / 2, ex = cx + sg * (bay / 2 + 250 * k), ty = yTop + f2 - 6 * k;
			const outer = `M${sx},${ty} C${sx + sg * 140 * k},${ty} ${ex - sg * 30 * k},${g - 90 * k} ${ex},${g}`, inner = `M${ex - sg * 70 * k},${g} C${ex - sg * 90 * k},${g - 70 * k} ${sx + sg * 90 * k},${ty + 26 * k} ${sx},${ty + 26 * k}`;
			return <g key={sg}>
				<path d={`${outer} L${ex - sg * 70 * k},${g} ${inner.replace('M', 'L')} Z`} fill="url(#mbV)" stroke={INK} strokeWidth={1.4} />
				{Array.from({length: 14}, (_, i) => { const u = (i + 1) / 15, xa = lerp(sx, ex, Math.pow(u, 1.3)), xb = lerp(sx, ex - sg * 70 * k, Math.pow(u, 1.3)), y = lerp(ty + 10 * k, g, u * u); return <line key={i} x1={xa} y1={y} x2={xb} y2={y + 6 * k} stroke={INK2} strokeWidth={1} opacity={0.6} />; })}
				<path d={outer} stroke="#F7F2E8" strokeWidth={9 * k} fill="none" /><path d={outer} stroke={INK} strokeWidth={1.2} fill="none" transform="translate(0,6)" />
				<path d={`M${ex},${g} l${sg * 10 * k},0 l0,${-36 * k} l${-sg * 18 * k},0 Z`} fill="#F1EADC" stroke={INK} strokeWidth={1} />
			</g>; })}
		<rect x={x0} y={yTop} width={w} height={f1 + f2} fill="url(#haze)" opacity={0.35} />
	</g>;
};

/* ---------- the stone seat (robed figure) and the brothers' heads, shaded ---------- */
export const StoneBody3: React.FC<{x: number; y: number; s: number; flip?: boolean}> = ({x, y, s, flip}) =>
	<g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
		<Shadow x={18} y={132} rx={74} ry={12} o={0.4} />
		<rect x={-62} y={58} width={124} height={74} fill="url(#stoneG)" stroke={INK} strokeWidth={1.4} />
		<rect x={-62} y={58} width={124} height={8} fill="#F1EADF" /><rect x={30} y={58} width={32} height={74} fill="#7C7262" opacity={0.45} />
		<path d="M-36,-42 C-48,-10 -54,30 -58,62 L58,62 C54,30 48,-10 36,-42 C22,-52 -22,-52 -36,-42 Z" fill="url(#stoneG)" stroke={INK} strokeWidth={1.4} />
		<path d="M-20,-38 C-26,0 -24,30 -20,60 M0,-30 C2,6 6,34 4,60 M22,-36 C30,0 34,30 34,60" stroke="#8B806D" strokeWidth={1.4} fill="none" opacity={0.7} />
		<path d="M-40,12 C-20,30 20,30 40,12 L38,36 C16,48 -16,48 -38,36 Z" fill="#D8CFBE" stroke={INK} strokeWidth={1.1} />
		<path d="M-40,12 C-20,30 20,30 40,12" stroke="#F4EEE4" strokeWidth={2} fill="none" />
		<path d="M-22,-40 L0,-14 L22,-40" stroke={INK} strokeWidth={1.2} fill="none" />
	</g>;
/* the brothers as readable side profiles (facing +x), ~110 px wide at s = 1: one clear feature each */
const PROF: Record<Z, {d: string; x?: string}> = {
	鼠: {d: 'M-44,30 C-50,0 -36,-24 -10,-26 C6,-28 22,-16 40,-2 C52,6 56,12 52,16 C40,22 20,24 0,30 Z M-30,-18 C-44,-44 -18,-58 -6,-36 Z', x: 'M52,14 L78,6 M52,16 L80,18 M50,18 L74,28'},
	牛: {d: 'M-40,34 C-48,0 -34,-26 -8,-28 C14,-30 30,-18 40,-2 C50,10 52,22 44,30 C30,38 0,40 -40,34 Z M-20,-24 C-34,-52 -16,-72 6,-70 C-6,-62 -8,-44 -2,-28 Z M-36,-12 L-62,-20 L-40,-2 Z', x: 'M40,18 C44,22 46,26 42,28'},
	虎: {d: 'M-44,30 C-52,-6 -32,-34 0,-34 C26,-34 46,-16 48,6 C50,22 40,32 20,34 C0,36 -24,36 -44,30 Z M-30,-28 L-36,-48 L-14,-34 Z M8,-34 L10,-54 L24,-32 Z', x: 'M-28,-14 L-14,-4 M-36,4 L-18,10 M-20,-24 L-6,-12 M0,-30 L6,-16 M26,-20 L30,-6'},
	兔: {d: 'M-36,32 C-44,2 -30,-20 -6,-22 C14,-22 32,-10 38,6 C42,18 36,28 22,32 C4,36 -20,36 -36,32 Z M-22,-18 C-34,-70 -24,-100 -12,-98 C-4,-80 -6,-46 -8,-20 Z M-4,-20 C2,-70 18,-94 28,-90 C30,-68 16,-40 8,-18 Z'},
	龙: {d: 'M-44,26 C-50,-2 -32,-20 -6,-20 C22,-22 48,-12 62,0 C70,8 68,18 58,20 C36,26 0,30 -44,26 Z M-24,-18 C-30,-44 -46,-60 -60,-70 L-52,-72 C-40,-60 -30,-50 -22,-40 C-24,-56 -18,-70 -8,-80 L-2,-76 C-10,-62 -12,-40 -10,-20 Z', x: 'M58,18 C76,26 90,40 96,56 M50,22 C64,34 70,50 70,66'},
	蛇: {d: 'M-30,36 C-34,10 -26,-6 -4,-10 C20,-14 44,-8 54,2 C60,8 56,16 46,18 C24,22 6,26 -6,40 Z', x: 'M56,8 L74,4 L82,0 M74,4 L82,10'},
	马: {d: 'M-30,34 C-36,0 -26,-30 0,-34 C26,-30 36,0 30,34 Z'},
	羊: {d: 'M-40,30 C-46,0 -32,-22 -8,-24 C12,-24 30,-14 40,0 C46,10 44,22 34,28 C16,36 -16,36 -40,30 Z M-26,-20 C-60,-30 -66,6 -42,14 C-30,18 -22,6 -30,-2 C-38,-8 -40,4 -34,6', x: 'M30,26 C32,36 28,44 22,48'},
	猴: {d: 'M-40,30 C-50,-4 -30,-34 0,-34 C28,-34 44,-14 44,6 C44,16 52,18 52,26 C52,34 40,38 24,36 C0,38 -24,38 -40,30 Z M-40,-4 C-60,-8 -62,16 -42,18 Z', x: 'M10,-16 C20,-10 24,0 20,8'},
	鸡: {d: 'M-30,34 C-36,6 -24,-14 -2,-16 C18,-16 32,-6 36,4 L58,10 L36,16 C32,24 22,30 10,32 C-4,34 -18,36 -30,34 Z M-10,-16 C-14,-30 -4,-34 2,-24 C4,-38 16,-38 16,-24 C22,-34 32,-28 26,-14 Z M30,18 C34,30 26,36 22,26 Z'},
	狗: {d: 'M-40,32 C-48,2 -34,-24 -8,-26 C14,-28 30,-16 40,-6 L62,0 C70,4 68,14 60,16 L40,18 C30,28 10,34 -40,32 Z M-26,-20 C-44,-22 -50,10 -36,22 C-32,8 -28,-4 -18,-14 Z'},
	猪: {d: 'M-44,32 C-52,0 -34,-26 -6,-28 C18,-28 36,-14 46,0 L60,2 C66,4 66,20 60,22 L46,22 C36,32 14,38 -44,32 Z M-30,-22 L-44,-44 L-12,-28 Z', x: 'M62,8 L62,16'},
};
export const ZHead3: React.FC<{z: Z; x: number; y: number; s: number; flip?: boolean; ghost?: string; tag?: boolean}> = ({z, x, y, s, flip, ghost, tag}) =>
	<g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
		{ghost ? <><path d={PROF[z].d} fill="none" stroke={ghost} strokeWidth={5 / s} strokeDasharray={`${9 / s} ${6 / s}`} />{PROF[z].x && <path d={PROF[z].x} fill="none" stroke={ghost} strokeWidth={2.4 / s} strokeDasharray={`${6 / s} ${5 / s}`} />}</> : <>
			<path d={PROF[z].d} fill="url(#bronze)" stroke="#3A2618" strokeWidth={1.8 / s} fillRule="nonzero" />
			{PROF[z].x && <path d={PROF[z].x} fill="none" stroke="#3A2618" strokeWidth={2.4 / s} strokeLinecap="round" />}
			<path d={PROF[z].d} fill="none" stroke="#E2B48C" strokeWidth={1.6 / s} opacity={0.5} transform="translate(-1.6,-1.6)" />
			<circle cx={14} cy={-8} r={3.4} fill="#2A1A10" />
		</>}
		{tag && <g transform={`scale(${flip ? -1 : 1},1)`}><rect x={-26} y={46} width={52} height={40} rx={6} fill="#F1EADC" stroke="#2B2722" strokeWidth={1.5} /><text x={0} y={76} textAnchor="middle" style={{fontFamily: "'Noto Sans CJK SC',sans-serif", fontSize: 30, fontWeight: 900}} fill="#2B2722">{z}</text></g>}
	</g>;

/* ---------- the zodiac pool: marble basin, stepped plinths in a 八, a shell fountain ---------- */
export const ZPos3 = (cx: number, g: number, k: number) => {
	const out: {z: Z; x: number; y: number; s: number; side: number}[] = [];
	const L: Z[] = ['蛇', '龙', '兔', '虎', '牛', '鼠'], R: Z[] = ['马', '羊', '猴', '鸡', '狗', '猪'];
	[L, R].forEach((row, side) => row.forEach((z, i) => { const u = i / 5, sg = side ? 1 : -1;
		out.push({z, x: cx + sg * lerp(440 * k, 180 * k, u), y: g + lerp(262 * k, 34 * k, u), s: lerp(1.0, 0.6, u) * k, side: sg}); }));
	return out;
};
export const WaterArc3: React.FC<{x0: number; y0: number; x1: number; y1: number; h: number; o?: number; w?: number}> = ({x0, y0, x1, y1, h, o = 0.9, w = 5}) => {
	const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - h, d = `M${x0},${y0} Q${cx},${cy} ${x1},${y1}`;
	return <g opacity={o}><path d={d} stroke="#BFE3E0" strokeWidth={w * 1.8} fill="none" strokeLinecap="round" opacity={0.35} filter="url(#soft6)" /><path d={d} stroke="#D9F0EE" strokeWidth={w} fill="none" strokeLinecap="round" /><path d={d} stroke="#ffffff" strokeWidth={w * 0.35} fill="none" strokeLinecap="round" opacity={0.85} />
		{Array.from({length: 8}, (_, i) => <circle key={i} cx={x1 + (rnd(i, x0) - 0.5) * 34} cy={y1 - rnd(i, y0) * 18} r={1.6 + 2 * rnd(i, 9)} fill="#E8F6F4" opacity={0.85} />)}</g>;
};
export const Pool3: React.FC<{cx: number; g: number; k: number; present: Set<Z> | 'all'; ghost?: boolean; ghostSet?: Set<Z>; arcs?: 'none' | 'all' | 'memory' | 'one'; id: string; active?: Z; grow?: number; youGlow?: number; you?: boolean; rip?: number}> = ({cx, g, k, present, arcs = 'none', ghost, ghostSet, id, active, grow = 1, youGlow = 0.9, you = true, rip}) => {
	const pos = ZPos3(cx, g, k), cys = g + 150 * k;
	const basin = (o: number) => `M${cx - (480 - o) * k},${g + (306 - o * 0.6) * k} L${cx - (205 - o * 0.4) * k},${g + (8 + o * 0.6) * k} L${cx + (205 - o * 0.4) * k},${g + (8 + o * 0.6) * k} L${cx + (480 - o) * k},${g + (306 - o * 0.6) * k} Z`;
	return <g>
		<Shadow x={cx} y={g + 312 * k} rx={500 * k} ry={22 * k} o={0.3} />
		<path d={basin(0)} fill="url(#mbV)" stroke={INK} strokeWidth={1.6} />
		<path d={basin(22)} fill="#BFB29A" />
		<path d={basin(34)} fill="url(#water)" stroke={INK} strokeWidth={1} />
		{Array.from({length: 22}, (_, i) => { const y = g + 46 * k + i * 11 * k, u = (y - g - 40 * k) / (240 * k), hw = lerp(178 * k, 430 * k, u); return <line key={i} x1={cx - hw + 30 + 20 * rnd(i, 2)} y1={y} x2={cx + hw - 30 - 20 * rnd(i, 3)} y2={y} stroke="#D8F0EC" strokeWidth={1.4} opacity={0.35 + 0.25 * rnd(i, 4)} />; })}
		{/* the shell basin + its reflection */}
		<ellipse cx={cx} cy={cys + 6 * k} rx={96 * k} ry={14 * k} fill="#3E7F7C" opacity={0.6} />
		<path d={`M${cx - 86 * k},${cys} C${cx - 76 * k},${cys - 66 * k} ${cx + 76 * k},${cys - 66 * k} ${cx + 86 * k},${cys} Z`} fill="url(#mbV)" stroke={INK} strokeWidth={1.4} />
		{Array.from({length: 9}, (_, i) => <path key={i} d={`M${cx},${cys} L${cx + Math.cos(Math.PI + (i + 1) * Math.PI / 10) * 82 * k},${cys + Math.sin(Math.PI + (i + 1) * Math.PI / 10) * 60 * k}`} stroke="#9D917B" strokeWidth={1.4} />)}
		{[...pos].sort((a, b) => a.y - b.y).map((p) => { const isYou = p.z === '马', has = present === 'all' || (present as Set<Z>).has(p.z), hy = p.y - 58 * p.s;
			return <g key={p.z}>
				<StoneBody3 x={p.x} y={p.y} s={p.s} flip={p.side > 0} />
				{isYou ? (you && <HorseHead x={p.x + p.side * 2} y={hy - 5 * p.s} s={0.135 * p.s} id={`${id}y`} glow={youGlow} flip={p.side < 0} curl={0} />)
					: has ? <ZHead3 z={p.z} x={p.x} y={hy} s={0.92 * p.s} flip={p.side > 0} /> : ghost && (!ghostSet || ghostSet.has(p.z)) ? <ZHead3 z={p.z} x={p.x} y={hy} s={0.92 * p.s} ghost="#3B4650" flip={p.side > 0} /> : null}
			</g>; })}
		{arcs !== 'none' && pos.map((p) => { if (arcs === 'one' && p.z !== active) return null; const solid = p.z === '马' || arcs === 'all' || arcs === 'one';
			const yu = p.z === '马', zi = ZODIAC.indexOf(p.z), d = Math.min(Math.abs(zi - 6), 12 - Math.abs(zi - 6)), gr = rip === undefined ? grow : Math.max(0, Math.min(1, rip * 7 - d)); if (gr <= 0.01) return null;
			return <WaterArc3 key={p.z} x0={p.x - p.side * (yu ? 22 : 48) * p.s} y0={p.y - (yu ? 37 : 45) * p.s} x1={cx + (p.x - cx) * 0.16} y1={cys - 34 * k} h={(70 * k + 46 * p.s) * (arcs === 'one' ? 2 * gr : gr)} o={solid ? 0.95 : 0.3} w={(solid ? (arcs === 'all' ? 7.5 : 5.5) : 3.5) * k} />; })}
	</g>;
};
void Glow; void CU; void T; void H;

/* ================= v2 additions ================= */
import {jointAt} from './pose45';
import type {Pose} from '../qq44/figure44';
/** a forage cap (kepi) over a short-haired head, set on the rig's own head joints */
export const Kepi: React.FC<{pose: Pose; x: number; g: number; h: number; flip?: boolean; c?: string}> = ({pose, x, g, h, flip, c = '#1D252B'}) => {
	const top = jointAt(pose, 'Top', x, g, h, flip), hd = jointAt(pose, 'Head', x, g, h, flip), a = Math.atan2(top[0] - hd[0], hd[1] - top[1]) * 180 / Math.PI;
	return <g transform={`translate(${top[0]},${top[1]}) rotate(${a}) scale(${flip ? -h : h},${h})`}>
		<path d="M-0.06,0.036 L-0.056,-0.016 Q0,-0.024 0.05,-0.006 L0.056,0.032 Z" fill={c} />
		<path d="M0.046,0.026 L0.094,0.044 L0.05,0.042 Z" fill={c} />
		<rect x={-0.06} y={0.02} width={0.116} height={0.012} fill="#E9DFC8" opacity={0.3} />
	</g>; };
/** fire behind a roofline: flame tongues from x0 to x1, base y, height hgt; k = strength */
export const Fire: React.FC<{t: number; x0: number; x1: number; y: number; hgt: number; k: number}> = ({t, x0, x1, y, hgt, k}) => {
	if (k <= 0) return null; const n = Math.round((x1 - x0) / 70);
	return <g opacity={Math.min(1, k * 1.2)}>
		<defs><linearGradient id="fireG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#FFD27A" /><stop offset="0.45" stopColor="#F07A2E" /><stop offset="1" stopColor="#B4321E" stopOpacity="0.2" /></linearGradient>
			<radialGradient id="fireR" cx="0.5" cy="1" r="0.7"><stop offset="0" stopColor="#FF9A40" stopOpacity="0.75" /><stop offset="1" stopColor="#FF9A40" stopOpacity="0" /></radialGradient></defs>
		<ellipse cx={(x0 + x1) / 2} cy={y} rx={(x1 - x0) * 0.62} ry={hgt * 1.3 * k} fill="url(#fireR)" />
		{Array.from({length: n}, (_, i) => { const x = x0 + (i + 0.5) * (x1 - x0) / n, f = 0.55 + 0.45 * Math.sin(t * (5 + 3 * rnd(i, 2)) + i * 1.7), hh = hgt * k * (0.5 + 0.6 * rnd(i, 3)) * (0.75 + 0.25 * f), w = 46 + 30 * rnd(i, 4), sw = Math.sin(t * 3 + i) * 14;
			return <g key={i}><path d={`M${x - w},${y} C${x - w},${y - hh * 0.4} ${x - w * 0.3 + sw},${y - hh * 0.6} ${x + sw * 1.6},${y - hh} C${x + w * 0.3 + sw},${y - hh * 0.6} ${x + w},${y - hh * 0.4} ${x + w},${y} Z`} fill="url(#fireG)" />
				<path d={`M${x - w * 0.45},${y} C${x - w * 0.45},${y - hh * 0.25} ${x + sw * 0.5},${y - hh * 0.4} ${x + sw},${y - hh * 0.55} C${x + w * 0.3},${y - hh * 0.3} ${x + w * 0.45},${y - hh * 0.2} ${x + w * 0.45},${y} Z`} fill="#FFE6A8" opacity={0.8} /></g>; })}
	</g>; };
/** embers drifting up through the whole frame */
export const Embers: React.FC<{t: number; k: number; n?: number; seed?: number}> = ({t, k, n = 46, seed = 3}) => k <= 0 ? null : <g opacity={k}>
	{Array.from({length: n}, (_, i) => { const sp = 60 + 90 * rnd(i, seed), y = H + 40 - ((t * sp + rnd(i, seed + 1) * (H + 80)) % (H + 80)), x = rnd(i, seed + 2) * W + Math.sin(t * 1.4 + i) * 30;
		return <circle key={i} cx={x} cy={y} r={1.6 + 2.6 * rnd(i, seed + 3)} fill={i % 3 ? '#FFB060' : '#FFE0A0'} opacity={0.5 + 0.5 * Math.sin(t * 7 + i) ** 2} />; })}
</g>;
/** distant smoke columns (sepia), rising from behind a wall at y */
export const SmokeCols: React.FC<{t: number; xs: number[]; y: number; k: number; c?: string}> = ({t, xs, y, k, c = '#7A6A5A'}) => k <= 0 ? null : <g opacity={k}>
	{xs.map((x, i) => <g key={i}>{Array.from({length: 7}, (_, j) => <ellipse key={j} cx={x + Math.sin(j * 1.3 + i) * 40 + j * 26 + t * 10} cy={y - 40 - j * 80 - (t % 30) * 3} rx={70 + j * 30} ry={50 + j * 16} fill={c} opacity={0.75 - j * 0.08} filter="url(#soft6)" />)}</g>)}
</g>;
/* ---------- 正觉寺 · 文殊亭: the one courtyard where you live now (C6, H1b–H5) ---------- */
const RED = '#8E3B2E', REDL = '#A9503D', TILE = '#3F5A52', TILEL = '#5D7A70', GREY = '#9C978C';
const Eave: React.FC<{x0: number; x1: number; y: number; h: number; up?: number}> = ({x0, x1, y, h, up = 26}) =>
	<g><path d={`M${x0 - 30},${y - up} Q${x0 + 10},${y - 4} ${x0 + 60},${y - 6} L${x1 - 60},${y - 6} Q${x1 - 10},${y - 4} ${x1 + 30},${y - up} L${x1 - 70},${y - h} L${x0 + 70},${y - h} Z`} fill={TILE} stroke={INK} strokeWidth={2.2} />
		{Array.from({length: Math.round((x1 - x0) / 22)}, (_, i) => <line key={i} x1={x0 + 40 + i * 22} y1={y - 8} x2={x0 + 70 + i * 21.2 * (x1 - x0 - 140) / (x1 - x0 - 80)} y2={y - h + 4} stroke={TILEL} strokeWidth={1.4} opacity={0.7} />)}
		<rect x={x0 + 40} y={y - 6} width={x1 - x0 - 80} height={10} fill="#6E4A34" stroke={INK} strokeWidth={1} />
		<path d={`M${x0 + 70},${y - h} L${x1 - 70},${y - h}`} stroke={INK} strokeWidth={5} /></g>;
export const Courtyard: React.FC<{t: number; id: string; doors?: number; light?: number; city?: number; smoke?: number; you?: boolean; youGlow?: number}> = ({t, id, doors = 1, light = 1, city = 0, smoke = 0, you = true, youGlow = 1}) => <g>
	<Sky3 id={`${id}s`} top="#8FB0C4" bot="#EADFCB" clouds={3} seed={12} />
	<SmokeCols t={t} xs={[160, 470, 1480, 1790]} y={560} k={smoke} />
	{city > 0 && <g opacity={city}>
		{Array.from({length: 16}, (_, i) => <rect key={i} x={1060 + i * 52} y={470 + 60 * rnd(i, 21)} width={46} height={120} fill="#A8B3B6" />)}
		{([[1360, 390, 180, '保利艺术博物馆', 250], [1570, 410, 200, '国家博物馆', 340]] as [number, number, number, string, number][]).map(([x, y, w, name, ly]) => <g key={name}>
			<rect x={x} y={y} width={w} height={200} fill="#C9C2B2" stroke="#6F6A60" strokeWidth={2} />
			{Array.from({length: 5}, (_, j) => <rect key={j} x={x + 14 + j * (w - 28) / 5} y={y + 40} width={(w - 28) / 5 - 12} height={150} fill="#B0A893" />)}
			<rect x={x - 10} y={y - 14} width={w + 20} height={16} fill="#8F887A" />
			<g transform={`translate(${x + w / 2},${ly})`}><rect x={-name.length * 24 - 16} y={-34} width={name.length * 48 + 32} height={60} rx={8} fill="#F1EADC" stroke={INK} strokeWidth={2} /><text x={0} y={12} textAnchor="middle" style={{fontFamily: "'Noto Sans CJK SC',sans-serif", fontSize: 44, fontWeight: 900}} fill={INK}>{name}</text></g></g>)}
		<rect x={1040} y={300} width={880} height={300} fill="#EADFCB" opacity={0.22} />
	</g>}
	<Tree3 x={150} g={640} h={560} seed={31} hue="pine" /><Tree3 x={1960} g={640} h={460} seed={32} hue="pine" />
	{/* the temple wall */}
	<rect x={-40} y={556} width={W + 80} height={150} fill={RED} /><rect x={-40} y={556} width={W + 80} height={150} fill="url(#h45d)" opacity={0.12} />
	<path d={`M-40,560 L${W + 40},560 L${W + 40},538 L-40,538 Z`} fill={TILE} stroke={INK} strokeWidth={1.6} /><rect x={-40} y={700} width={W + 80} height={14} fill={GREY} />
	{/* the courtyard floor */}
	<rect x={-40} y={714} width={W + 80} height={H - 700} fill="#B9B2A4" />
	{Array.from({length: 26}, (_, i) => <line key={i} x1={960} y1={640} x2={-700 + i * 130} y2={H + 40} stroke="#8E877A" strokeWidth={1} opacity={0.4} />)}
	{Array.from({length: 10}, (_, i) => { const y = 724 + Math.pow(i / 9, 1.5) * 360; return <line key={i} x1={-40} y1={y} x2={W + 40} y2={y} stroke="#8E877A" strokeWidth={1} opacity={0.35} />; })}
	{/* 文殊亭: terrace, red columns, double eaves, doors */}
	<Shadow x={960} y={778} rx={470} ry={20} o={0.4} />
	<path d="M560,700 L1360,700 L1390,770 L530,770 Z" fill="#CFC8B8" stroke={INK} strokeWidth={2} /><path d="M860,770 L1060,770 L1080,800 L840,800 Z" fill="#BDB5A3" stroke={INK} strokeWidth={1.5} />
	<rect x={630} y={480} width={660} height={220} fill="#3A2A22" />
	{/* the interior, you inside */}
	<g>
		<rect x={830} y={510} width={260} height={190} fill="#22160F" />
		<Glow x={960} y={600} r={160} c={CU.halo} o={0.55 * light * youGlow} id={`${id}in`} />
		<rect x={905} y={636} width={110} height={64} fill="url(#mbV)" stroke={INK} strokeWidth={1.5} />
		{you && <HorseHead x={960} y={636 - 0.15 * 276} s={0.15} id={`${id}y`} glow={youGlow} />}
	</g>
	{/* lattice walls either side of the door bay */}
	{[[640, 820], [1100, 1280]].map(([a, b], i) => <g key={i}><rect x={a} y={500} width={b - a} height={200} fill={REDL} stroke={INK} strokeWidth={1.5} />
		{Array.from({length: 6}, (_, j) => <line key={j} x1={a + 8} y1={520 + j * 28} x2={b - 8} y2={520 + j * 28} stroke="#6E2A20" strokeWidth={2} />)}
		{Array.from({length: 5}, (_, j) => <line key={j} x1={a + 15 + j * (b - a - 30) / 4} y1={512} x2={a + 15 + j * (b - a - 30) / 4} y2={690} stroke="#6E2A20" strokeWidth={2} />)}</g>)}
	{/* the two door leaves fold back to their hinges */}
	{[-1, 1].map((sg) => { const hinge = sg < 0 ? 830 : 1090, w = 130 * (1 - 0.82 * doors); return <g key={sg}>
		<rect x={sg < 0 ? hinge : hinge - w} y={510} width={w} height={190} fill={REDL} stroke={INK} strokeWidth={1.5} />
		{w > 20 && Array.from({length: 5}, (_, j) => <line key={j} x1={sg < 0 ? hinge + 6 : hinge - w + 6} y1={530 + j * 30} x2={sg < 0 ? hinge + w - 6 : hinge - 6} y2={530 + j * 30} stroke="#6E2A20" strokeWidth={2} />)}</g>; })}
	{[640, 830, 1090, 1280].map((x) => <rect key={x} x={x - 13} y={470} width={26} height={232} fill={RED} stroke={INK} strokeWidth={1.8} />)}
	<Eave x0={560} x1={1360} y={482} h={70} up={34} />
	<rect x={720} y={350} width={480} height={70} fill={REDL} stroke={INK} strokeWidth={1.5} />
	{Array.from({length: 7}, (_, j) => <line key={j} x1={740 + j * 72} y1={356} x2={740 + j * 72} y2={414} stroke="#6E2A20" strokeWidth={2} />)}
	<Eave x0={660} x1={1260} y={360} h={110} up={30} />
	<path d="M944,250 L976,250 L968,226 L952,226 Z" fill="#8A6A3A" stroke={INK} strokeWidth={1.5} /><circle cx={960} cy={220} r={8} fill="#B08463" stroke={INK} strokeWidth={1.2} />
	{/* light from the open doors */}
	{doors > 0 && <path d={`M830,700 L1090,700 L${1090 + 260 * doors},${H} L${830 - 260 * doors},${H} Z`} fill="#FFD9A8" opacity={0.28 * light * doors} style={{mixBlendMode: 'screen'}} />}
	<Shadow x={960} y={H + 20} rx={1}  ry={1} o={0} />
</g>;
