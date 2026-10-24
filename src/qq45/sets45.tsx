import React from 'react';
import {W, H, rnd, lerp, Glow, CU, T, HorseHead, ZPATH, Z} from './kit45';
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
export const ZHead3: React.FC<{z: Z; x: number; y: number; s: number; flip?: boolean; ghost?: string}> = ({z, x, y, s, flip, ghost}) =>
	<g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
		{ghost ? <path d={ZPATH[z]} fill="none" stroke={ghost} strokeWidth={2.2 / s} strokeDasharray={`${6 / s} ${5 / s}`} /> : <>
			<path d={ZPATH[z]} fill="url(#bronze)" stroke="#3A2618" strokeWidth={1.6 / s} />
			<path d={ZPATH[z]} fill="none" stroke="#E2B48C" strokeWidth={1.4 / s} opacity={0.55} transform="translate(-1.6,-1.6)" />
			<path d="M14,-6 C40,-6 52,8 50,20 C48,30 34,34 20,30 Z" fill="url(#bronze)" stroke="#3A2618" strokeWidth={1.2 / s} />
			<path d="M-30,-22 C-14,-34 14,-34 28,-20" stroke="#E2B48C" strokeWidth={2 / s} fill="none" opacity={0.5} />
		</>}
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
export const Pool3: React.FC<{cx: number; g: number; k: number; present: Set<Z> | 'all'; ghost?: boolean; ghostSet?: Set<Z>; arcs?: 'none' | 'all' | 'memory' | 'one'; id: string; active?: Z; grow?: number; youGlow?: number; you?: boolean}> = ({cx, g, k, present, arcs = 'none', ghost, ghostSet, id, active, grow = 1, youGlow = 0.9, you = true}) => {
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
				{isYou ? (you && <HorseHead x={p.x + p.side * 2} y={hy - 5 * p.s} s={0.135 * p.s} id={`${id}y`} glow={youGlow} flip={p.side > 0} />)
					: has ? <ZHead3 z={p.z} x={p.x} y={hy} s={0.92 * p.s} flip={p.side > 0} /> : ghost && (!ghostSet || ghostSet.has(p.z)) ? <ZHead3 z={p.z} x={p.x} y={hy} s={0.92 * p.s} ghost="#3B4650" flip={p.side > 0} /> : null}
			</g>; })}
		{arcs !== 'none' && pos.map((p) => { if (arcs === 'one' && p.z !== active) return null; const solid = p.z === '马' || arcs === 'all' || arcs === 'one';
			return <WaterArc3 key={p.z} x0={p.x - p.side * 30 * p.s} y0={p.y - 62 * p.s} x1={cx + (p.x - cx) * 0.16} y1={cys - 34 * k} h={(70 * k + 46 * p.s) * (arcs === 'one' ? 2 * grow : grow)} o={solid ? 0.95 : 0.3} w={(solid ? 5.5 : 3.5) * k} />; })}
	</g>;
};
void Glow; void CU; void T; void H;
