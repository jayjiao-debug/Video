import React from 'react';
import {W, H, rnd, lerp, Glow} from '../qq42/kit42';
/* ep45 《马首回家，用了160年》 — look "铜版 · 午时" (copperplate):
   the whole world is an engraved plate in ONE slate family (horizontal-line skies, hatched shade, pale engraved lines);
   「你」 (the red-copper horse head) is the only thing in colour and the only thing that glows. */
export {W, H, rnd, lerp, Glow};

/* ---------- palette (one background family) ---------- */
export const P = {
	deep: '#24323A', plate: '#34464E', mid: '#4D6168', soft: '#6F858A', line: '#AEC1C2', pale: '#D3DFDC', paper: '#E6EEEB',
	ink: '#18232A', ink2: '#202C33',   // figures: one tone
	water: '#CFE6E4',
};
export const CU = {core: '#FFE6CC', hi: '#FFC79A', mid: '#EE8F58', deep: '#A84E2A', dark: '#6E2C16', halo: '#FF8A50'};   // 你
export const KEY = '#9FE6D8';   // key words: water/patina, never glowing
/* hand-tinted engraving washes (owner 22:48: more colour in the world). Muted, never glowing; 你 stays the only glow. */
export const T = {
	skyDay: ['#7FA3BC', '#D7E4E2'], skyDusk: ['#62748F', '#D9C6A8'], skyNight: ['#1E2A44', '#41506C'], skySmoke: ['#5B5048', '#B49C80'],
	marble: '#EAE3D4', marbleSh: '#C2B7A2', slate: '#56687A', win: '#2A3946', stone: '#BFB6A3', stoneSh: '#8E8675',
	pave: '#CDBE9C', pave2: '#A39274', grass: '#8FA67E', tree: '#5D7E5C', treeD: '#3F5E47',
	water: '#8CC3BE', waterL: '#D6EEEA',
	wood: '#7B5A42', woodD: '#4E3828', baize: '#3F6457', wallG: '#4F6E64', wallW: '#6E4249', wallB: '#4B5A68', wallBL: '#6D7F8E', cream: '#E9DFC8',
	bronze: '#8A6146', bronzeD: '#563A27', bronzeL: '#B08463',
	ink: '#26313A', fig: '#1D252B',
};

/* ---------- engraving defs: hatch patterns (put once per svg) ---------- */
export const HatchDefs: React.FC = () => <defs>
	{([['hz', 0, 7, 1.3, P.line, 0.55], ['hzD', 0, 5, 1.1, P.line, 0.45], ['h45', 45, 8, 1.4, P.line, 0.5], ['h45d', 45, 5, 1.2, P.ink, 0.55], ['h135d', 135, 6, 1.2, P.ink, 0.45], ['hzInk', 0, 6, 1.4, P.ink, 0.5], ['hzW', 0, 9, 1.5, P.water, 0.6]] as [string, number, number, number, string, number][]).map(([id, a, s, w, c, o]) =>
		<pattern key={id} id={id} width={s} height={s} patternUnits="userSpaceOnUse" patternTransform={`rotate(${a})`}><line x1={0} y1={s / 2} x2={s} y2={s / 2} stroke={c} strokeWidth={w} strokeOpacity={o} /></pattern>)}
</defs>;

/** engraved sky: gradient + horizontal engraving lines that thin out toward the light */
export const PlateSky: React.FC<{id: string; top?: string; bot?: string; y0?: number; y1?: number; lines?: number; glowX?: number; glowY?: number; lineC?: string}> = ({id, top = P.deep, bot = P.mid, y0 = 0, y1 = H, lines = 0.5, glowX, glowY, lineC = P.line}) => {
	const n = Math.round((y1 - y0) / 7);
	return <g>
		<defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bot} /></linearGradient></defs>
		<rect x={0} y={y0} width={W} height={y1 - y0} fill={`url(#${id})`} />
		{Array.from({length: n}, (_, i) => { const y = y0 + i * 7 + 3, u = i / n, gap = glowX !== undefined ? Math.max(0, 1 - Math.hypot(0, (y - (glowY ?? 0)) / 260)) : 0;
			const wv = (1 - u) * 1.3 + 0.3; return <line key={i} x1={0} y1={y} x2={W} y2={y} stroke={lineC} strokeWidth={wv} opacity={lines * (0.35 + 0.4 * (1 - u)) * (1 - gap * 0.7)} />; })}
	</g>;
};
/** ground plane: flat tone + horizontal hatch getting denser to the front */
export const PlateGround: React.FC<{y: number; c?: string; c2?: string; edge?: string; hatch?: number}> = ({y, c = P.mid, c2 = P.plate, edge = P.line, hatch = 1}) => <g>
	<defs><linearGradient id={`gr${y}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} /><stop offset="1" stopColor={c2} /></linearGradient></defs>
	<rect x={0} y={y} width={W} height={H - y} fill={`url(#gr${y})`} />
	{Array.from({length: Math.round((H - y) / 9)}, (_, i) => <line key={i} x1={0} y1={y + 4 + i * 9 * (1 + i * 0.02)} x2={W} y2={y + 4 + i * 9 * (1 + i * 0.02)} stroke={P.ink} strokeWidth={1 + i * 0.05} opacity={(0.18 + i * 0.01) * hatch} />)}
	<line x1={0} y1={y} x2={W} y2={y} stroke={edge} strokeWidth={2} opacity={0.5} />
</g>;

/* ---------- 你: the bronze horse head (profile, facing left; origin ≈ the eye; ~640 × 740 at s = 1) ----------
   drawn as a coloured engraving: copper fill, shade by dark-copper hatching, thick mane locks on the near side. */
const HEAD = 'M90,-230 C40,-226 -30,-190 -70,-140 C-120,-70 -170,10 -205,70 C-222,98 -236,128 -232,152 C-230,176 -214,190 -192,192 L-170,190 C-178,204 -174,220 -156,226 C-136,232 -112,224 -96,214 C-60,196 -20,196 10,206 C70,224 122,214 142,178 C158,204 168,262 170,330 L176,380 L404,380 C404,262 372,120 302,0 C252,-90 182,-190 122,-226 C110,-232 100,-232 90,-230 Z';
const EAR_FAR = 'M104,-222 C100,-284 116,-334 138,-366 C156,-326 158,-268 146,-206 Z';
const EAR_NEAR = (curl: number) => `M50,-226 C34,-290 40,-346 58,-384 C${76 + curl * 26},${-350 + curl * 46} ${96 + curl * 12},${-296 + curl * 24} 96,-232 Z`;
/** mane locks along the crest (near side), poll → withers */
const CREST = (u: number): [number, number] => { const x = 110 + (402 - 110) * u, y = -226 + 606 * Math.pow(u, 1.25) - 120 * Math.sin(u * Math.PI) * 0.5; return [x - 18 * Math.sin(u * Math.PI), y]; };
const LOCKS = Array.from({length: 13}, (_, i) => { const u = 0.03 + i * 0.075, [x, y] = CREST(u), L = 120 + 40 * rnd(i, 4), bend = 30 + 20 * rnd(i, 5);
	return {d: `M${x + 10},${y - 18} C${x - 30},${y + L * 0.25} ${x - bend},${y + L * 0.6} ${x - bend * 0.4},${y + L} C${x + 4},${y + L * 0.7} ${x + 26},${y + L * 0.35} ${x + 40},${y - 4} Z`,
		lines: [0.3, 0.55, 0.8].map((k) => `M${x + 10 + 18 * k},${y - 10} C${x - 16 + 10 * k},${y + L * 0.3} ${x - bend * (1 - k * 0.4)},${y + L * 0.65} ${x - bend * 0.4 + 10 * k},${y + L * (0.95 - k * 0.12)}`)}; });
export const HorseHead: React.FC<{x: number; y: number; s: number; id: string; glow?: number; curl?: number; spout?: number; flip?: boolean; o?: number; flicker?: number}> = ({x, y, s, id, glow = 1, curl = 0, spout = 0, flip, o = 1, flicker = 0}) =>
	<g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`} opacity={o}>
		<defs>
			<linearGradient id={`${id}cu`} x1="0.05" y1="0.0" x2="0.8" y2="1"><stop offset="0" stopColor={CU.hi} /><stop offset="0.3" stopColor={CU.mid} /><stop offset="0.72" stopColor={CU.deep} /><stop offset="1" stopColor={CU.dark} /></linearGradient>
			<radialGradient id={`${id}ch`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor={CU.hi} stopOpacity="0.9" /><stop offset="1" stopColor={CU.mid} stopOpacity="0" /></radialGradient>
			<pattern id={`${id}hat`} width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><line x1={0} y1={3.5} x2={7} y2={3.5} stroke={CU.dark} strokeWidth={2} /></pattern>
			<linearGradient id={`${id}sh`} x1="0" y1="0" x2="1" y2="1"><stop offset="0.35" stopColor="#fff" stopOpacity="0" /><stop offset="0.75" stopColor="#fff" stopOpacity="1" /></linearGradient>
			<mask id={`${id}m`}><rect x={-400} y={-400} width={900} height={900} fill={`url(#${id}sh)`} /></mask>
			<clipPath id={`${id}clip`}><path d={HEAD} /></clipPath><clipPath id={`${id}lk`}><rect x={-400} y={-420} width={900} height={790} /></clipPath>
		</defs>
		{glow > 0 && <><Glow x={60} y={20} r={800} c={CU.halo} o={0.3 * glow * (1 + flicker * 0.4)} id={`${id}g1`} /><Glow x={0} y={40} r={420} c={CU.mid} o={0.34 * glow * (1 + flicker * 0.3)} id={`${id}g2`} /></>}
		<path d={EAR_FAR} fill={CU.deep} stroke={CU.dark} strokeWidth={3} />
		<path d={HEAD} fill={`url(#${id}cu)`} stroke={CU.dark} strokeWidth={4} />
		<g clipPath={`url(#${id}clip)`}>
			{/* engraved shade: hatching that thickens away from the light */}
			<rect x={-300} y={-300} width={760} height={720} fill={`url(#${id}hat)`} mask={`url(#${id}m)`} opacity={0.55} />
			{/* jowl: the round cheek plane */}
			<ellipse cx={70} cy={110} rx={112} ry={100} fill={`url(#${id}ch)`} opacity={0.8} />
			<path d="M-34,40 C-30,150 60,214 150,176" stroke={CU.dark} strokeWidth={4.5} fill="none" opacity={0.6} />
			<path d="M-20,30 C30,10 90,30 140,90" stroke={CU.dark} strokeWidth={2.5} fill="none" opacity={0.35} />
			{/* face bones: the long ridge to the nose, highlit */}
			<path d="M-56,-150 C-110,-74 -160,4 -196,66" stroke={CU.core} strokeWidth={18} strokeLinecap="round" fill="none" opacity={0.5} />
			<path d="M-96,-40 C-120,10 -150,60 -170,96" stroke={CU.dark} strokeWidth={2.5} fill="none" opacity={0.4} />
			{/* neck front shade + throatlatch crease */}
			<path d="M146,170 C170,230 180,300 184,390 L120,390 L110,200 Z" fill={CU.dark} opacity={0.35} />
			<path d="M142,178 C150,150 168,120 196,100" stroke={CU.dark} strokeWidth={3} fill="none" opacity={0.5} />
		</g>
		{/* mane locks on the near side */}
		<g clipPath={`url(#${id}lk)`}>{LOCKS.map((L, i) => <g key={i}><path d={L.d} fill={i % 2 ? CU.mid : CU.deep} stroke={CU.dark} strokeWidth={2.5} />{L.lines.map((d, j) => <path key={j} d={d} stroke={CU.dark} strokeWidth={1.6} fill="none" opacity={0.6} />)}</g>)}</g>
		{/* forelock falling between the ears onto the forehead */}
		<path d="M70,-232 C40,-214 20,-186 6,-150 C30,-166 46,-180 66,-192 C62,-170 64,-150 70,-130 C88,-162 104,-200 108,-232 Z" fill={CU.mid} stroke={CU.dark} strokeWidth={2.5} />
		<path d="M80,-226 C62,-200 48,-180 34,-160 M96,-228 C88,-200 80,-176 74,-150" stroke={CU.dark} strokeWidth={1.6} fill="none" opacity={0.6} />
		{/* near ear */}
		<path d={EAR_NEAR(curl)} fill={`url(#${id}cu)`} stroke={CU.dark} strokeWidth={3} />
		<path d="M62,-240 C58,-292 62,-332 66,-356" stroke={CU.dark} strokeWidth={3} fill="none" opacity={0.55} />
		{/* eye with its bony ridge; nostril; lips */}
		<path d="M-62,-104 C-30,-134 12,-130 30,-104" stroke={CU.dark} strokeWidth={5} fill="none" opacity={0.75} />
		<path d="M-50,-88 C-32,-104 -6,-104 10,-88 C-6,-76 -32,-74 -50,-88 Z" fill={CU.dark} />
		<circle cx={-18} cy={-90} r={5} fill={CU.core} opacity={0.9} />
		<path d="M-222,118 C-214,98 -192,96 -186,116 C-186,134 -210,140 -222,118 Z" fill={CU.dark} />
		<path d="M-200,104 C-186,92 -170,96 -166,112" stroke={CU.dark} strokeWidth={2.5} fill="none" opacity={0.6} />
		<path d="M-212,170 C-200,184 -186,190 -170,190" stroke={CU.dark} strokeWidth={4} fill="none" />
		<path d="M-170,190 L-150,192" stroke={CU.dark} strokeWidth={5} strokeLinecap="round" />
		{/* the cast collar at the neck base */}
		<path d="M172,370 L406,370 L406,394 L170,394 Z" fill={CU.deep} stroke={CU.dark} strokeWidth={3} />
		<path d="M172,382 L406,382" stroke={CU.hi} strokeWidth={2} opacity={0.4} />
		{/* water from the mouth */}
		{spout > 0 && <path d={`M-160,194 C${-250 - 180 * spout},${170 - 60 * spout} ${-370 - 300 * spout},${260 + 40 * spout} ${-410 - 360 * spout},${520 + 120 * spout}`} stroke={P.water} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.85} />}
	</g>;

/* ---------- the brothers: small cool silhouettes (head shapes only; original simple designs) ---------- */
export type Z = '鼠' | '牛' | '虎' | '兔' | '龙' | '蛇' | '马' | '羊' | '猴' | '鸡' | '狗' | '猪';
export const ZODIAC: Z[] = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
export const RETURNED = new Set<Z>(['鼠', '牛', '虎', '兔', '马', '猴', '猪']);
const ZPATH: Record<Z, string> = {
	鼠: 'M-40,30 C-50,0 -30,-30 0,-34 C10,-60 34,-60 36,-34 C50,-20 52,10 40,30 Z M-30,-28 C-46,-50 -30,-66 -14,-50 Z',
	牛: 'M-38,34 C-46,0 -36,-30 0,-34 C36,-30 46,0 38,34 Z M-34,-24 C-70,-36 -76,-62 -60,-70 C-58,-50 -44,-40 -26,-34 Z M34,-24 C70,-36 76,-62 60,-70 C58,-50 44,-40 26,-34 Z',
	虎: 'M-42,32 C-50,-6 -32,-38 0,-40 C32,-38 50,-6 42,32 Z M-36,-30 L-40,-52 L-20,-40 Z M36,-30 L40,-52 L20,-40 Z',
	兔: 'M-32,34 C-40,0 -26,-26 0,-28 C26,-26 40,0 32,34 Z M-16,-26 C-24,-70 -16,-96 -6,-98 C2,-80 0,-50 -4,-26 Z M10,-26 C10,-70 22,-94 30,-92 C34,-70 24,-46 18,-24 Z',
	龙: 'M-44,32 C-50,-4 -30,-34 4,-36 C34,-34 52,-8 44,32 Z M-20,-34 C-30,-70 -50,-86 -60,-96 C-30,-90 -10,-70 -6,-36 Z M16,-34 C24,-70 44,-86 56,-96 C28,-88 12,-70 8,-36 Z',
	蛇: 'M-26,36 C-34,0 -26,-24 0,-28 C26,-24 34,0 26,36 Z',
	马: 'M-30,34 C-36,0 -26,-30 0,-34 C26,-30 36,0 30,34 Z M-16,-32 L-12,-56 L-2,-34 Z M16,-32 L12,-56 L2,-34 Z',
	羊: 'M-34,34 C-40,0 -28,-26 0,-30 C28,-26 40,0 34,34 Z M-26,-24 C-60,-30 -64,0 -44,6 C-50,-12 -40,-18 -24,-14 Z M26,-24 C60,-30 64,0 44,6 C50,-12 40,-18 24,-14 Z',
	猴: 'M-38,30 C-44,-4 -28,-34 0,-36 C28,-34 44,-4 38,30 Z M-44,-8 C-60,-10 -62,10 -46,12 Z M44,-8 C60,-10 62,10 46,12 Z',
	鸡: 'M-28,34 C-34,0 -24,-26 0,-30 C24,-26 34,0 28,34 Z M-14,-28 C-12,-50 -2,-52 0,-40 C4,-56 14,-56 14,-42 C22,-52 28,-46 22,-30 Z',
	狗: 'M-36,34 C-42,0 -30,-30 0,-32 C30,-30 42,0 36,34 Z M-30,-26 C-50,-30 -56,10 -42,20 C-40,0 -36,-14 -26,-20 Z M30,-26 C50,-30 56,10 42,20 C40,0 36,-14 26,-20 Z',
	猪: 'M-42,32 C-50,-4 -32,-30 0,-32 C32,-30 50,-4 42,32 Z M-36,-24 L-46,-44 L-22,-32 Z M36,-24 L46,-44 L22,-32 Z',
};
/** a brother's head: 'cool' = solid slate silhouette, 'ghost' = engraved outline only (missing), 'faint' = dim */
export const ZHead: React.FC<{z: Z; x: number; y: number; s: number; mode?: 'cool' | 'ghost' | 'faint' | 'bronze'; c?: string; ghostC?: string}> = ({z, x, y, s, mode = 'cool', c = P.ink, ghostC = P.line}) => mode === 'bronze' ?
	<g transform={`translate(${x},${y}) scale(${s})`}><path d={ZPATH[z]} fill={T.bronze} stroke={T.bronzeD} strokeWidth={2.2 / s} /><path d={ZPATH[z]} fill="url(#h45d)" opacity={0.45} /><path d={ZPATH[z]} fill="none" stroke={T.bronzeL} strokeWidth={1.4 / s} opacity={0.5} transform="translate(-1.5,-1.5)" /></g> :
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<path d={ZPATH[z]} fill={mode === 'ghost' ? 'none' : c} fillRule="nonzero" stroke={mode === 'ghost' ? ghostC : P.line} strokeWidth={mode === 'ghost' ? 2.4 / s : 1.2 / s} strokeDasharray={mode === 'ghost' ? `${6 / s} ${5 / s}` : undefined} opacity={mode === 'faint' ? 0.55 : 1} />
		{mode !== 'ghost' && <path d={ZPATH[z]} fill="url(#h45)" opacity={0.5} />}
	</g>;

/* ---------- a seated stone body (robed, hands in sleeves), front-quarter; origin = seat top centre; ~ 120 × 150 at s = 1 ---------- */
export const StoneBody: React.FC<{x: number; y: number; s: number; flip?: boolean; tone?: string; base?: string; line?: string}> = ({x, y, s, flip, tone = T.stone, base = T.stoneSh, line = T.ink}) =>
	<g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
		<rect x={-58} y={60} width={116} height={70} fill={base} stroke={line} strokeWidth={1.5} />
		<rect x={-58} y={60} width={116} height={70} fill="url(#h45d)" opacity={0.7} />
		<path d="M-34,-40 C-46,-10 -52,30 -56,64 L56,64 C52,30 46,-10 34,-40 C20,-50 -20,-50 -34,-40 Z" fill={tone} stroke={line} strokeWidth={1.5} />
		<path d="M-34,-40 C-46,-10 -52,30 -56,64 L-10,64 C-14,20 -20,-14 -34,-40 Z" fill="url(#h135d)" opacity={0.8} />
		<path d="M-38,14 C-20,30 20,30 38,14 L36,36 C16,46 -16,46 -36,36 Z" fill={base} stroke={line} strokeWidth={1.2} />
		<path d="M-20,-36 L0,-10 L20,-36" stroke={line} strokeWidth={1.2} fill="none" />
	</g>;

/* ---------- water arc between two points (peak h above the higher end) ---------- */
export const WaterArc: React.FC<{x0: number; y0: number; x1: number; y1: number; h: number; o?: number; w?: number}> = ({x0, y0, x1, y1, h, o = 0.9, w = 5}) => {
	const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - h;
	return <g opacity={o}><path d={`M${x0},${y0} Q${cx},${cy} ${x1},${y1}`} stroke={P.water} strokeWidth={w} fill="none" strokeLinecap="round" />
		<path d={`M${x0},${y0} Q${cx},${cy} ${x1},${y1}`} stroke="#ffffff" strokeWidth={w * 0.35} fill="none" strokeLinecap="round" opacity={0.7} />
		{Array.from({length: 6}, (_, i) => <circle key={i} cx={x1 + (rnd(i, x0) - 0.5) * 30} cy={y1 - rnd(i, y0) * 16} r={2 + 2 * rnd(i, 9)} fill={P.water} opacity={0.7} />)}</g>;
};

/* ---------- props ---------- */
/** a side-view wooden chair; seatY = top of the seat; faces +x (back on the left) unless flip */
export const Chair: React.FC<{x: number; seatY: number; floor: number; k?: number; flip?: boolean; c?: string}> = ({x, seatY, floor, k = 1, flip, c = T.wood}) => {
	const f = flip ? -1 : 1, d = 120 * k, back = 190 * k;
	return <g>
		<rect x={Math.min(x - f * d * 0.55, x + f * d * 0.45)} y={seatY} width={d} height={12 * k} fill={c} stroke={T.ink} strokeWidth={1.5} />
		<rect x={x - f * d * 0.55 - (flip ? 10 * k : 0)} y={seatY - back} width={10 * k} height={back + (floor - seatY)} fill={c} stroke={T.ink} strokeWidth={1.5} />
		<rect x={x + f * d * 0.45 - (flip ? 0 : 10 * k)} y={seatY + 10 * k} width={10 * k} height={floor - seatY - 10 * k} fill={c} stroke={T.ink} strokeWidth={1.5} />
		<rect x={Math.min(x - f * d * 0.55, x + f * d * 0.45)} y={seatY + (floor - seatY) * 0.6} width={d} height={6 * k} fill={T.woodD} />
	</g>;
};
/** a stylised tree (engraved): round crown of leaf clumps on a trunk; ground = base y */
export const Tree: React.FC<{x: number; g: number; h: number; c?: string; c2?: string; seed?: number; willow?: boolean}> = ({x, g, h, c = T.tree, c2 = T.treeD, seed = 1, willow}) => <g>
	<path d={`M${x - h * 0.03},${g} L${x - h * 0.02},${g - h * 0.55} L${x + h * 0.02},${g - h * 0.55} L${x + h * 0.03},${g} Z`} fill={T.woodD} />
	{Array.from({length: 9}, (_, i) => { const a = rnd(i, seed) * Math.PI * 2, r = h * (0.12 + 0.12 * rnd(i, seed + 1)), cx = x + Math.cos(a) * h * 0.22, cy = g - h * 0.68 + Math.sin(a) * h * 0.16;
		return <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r * 0.8} fill={i % 3 ? c : c2} stroke={T.ink} strokeWidth={1.2} strokeOpacity={0.6} />; })}
	{willow && Array.from({length: 14}, (_, i) => { const x0 = x - h * 0.3 + i * h * 0.045; return <path key={i} d={`M${x0},${g - h * 0.75} C${x0 - 6},${g - h * 0.5} ${x0 + 4},${g - h * 0.35} ${x0 - 2},${g - h * 0.22}`} stroke={c} strokeWidth={3} fill="none" opacity={0.8} />; })}
	<ellipse cx={x} cy={g - h * 0.68} rx={h * 0.36} ry={h * 0.26} fill="url(#h45d)" opacity={0.35} />
</g>;
