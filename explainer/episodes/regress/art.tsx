import React from 'react';
import {random} from 'remotion';
import {font} from '../../src/lib/theme';
import {P} from '../../src/art/palette';

/**
 * 《夸完就翻车》 props: the grade board on the flight line, the instructor's logbook, the
 * hangar floor with its chalk target and the coins, Galton's height chart, the title coin.
 */

const CHALK = '#e9efe6';
const NUM = {fontVariantNumeric: 'lining-nums' as const};

export const REGRESS_DEFS: React.FC = () => (
	<defs>
		<filter id="chalk" x="-5%" y="-20%" width="110%" height="140%">
			<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} result="n" />
			<feDisplacementMap in="SourceGraphic" in2="n" scale={2.2} xChannelSelector="R" yChannelSelector="G" result="d" />
			<feComponentTransfer in="d">
				<feFuncA type="linear" slope={0.9} />
			</feComponentTransfer>
		</filter>
		<radialGradient id="coin-gold" cx="35%" cy="30%" r="80%">
			<stop offset="0" stopColor="#fff1c4" />
			<stop offset="0.45" stopColor="#e2b154" />
			<stop offset="1" stopColor="#8a5e1e" />
		</radialGradient>
		<radialGradient id="coin-copper" cx="35%" cy="30%" r="80%">
			<stop offset="0" stopColor="#ffd2b0" />
			<stop offset="0.45" stopColor="#c27a4a" />
			<stop offset="1" stopColor="#6a3a1e" />
		</radialGradient>
		<radialGradient id="coin-silver" cx="35%" cy="30%" r="80%">
			<stop offset="0" stopColor="#ffffff" />
			<stop offset="0.5" stopColor="#c3c8cf" />
			<stop offset="1" stopColor="#6c727b" />
		</radialGradient>
		<radialGradient id="floor-pool" cx={960} cy={440} r={1250} gradientUnits="userSpaceOnUse">
			<stop offset="0" stopColor="#ffdca6" stopOpacity="0.3" />
			<stop offset="0.5" stopColor="#c98a4a" stopOpacity="0.08" />
			<stop offset="1" stopColor="#000" stopOpacity="0.62" />
		</radialGradient>
		<linearGradient id="paper-page" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stopColor="#efe6d2" />
			<stop offset="0.92" stopColor="#e6dbc2" />
			<stop offset="1" stopColor="#c9bb9a" />
		</linearGradient>
	</defs>
);

/** Text that is written on from left to right (chalk or ink), `p` 0..1. */
export const WriteOn: React.FC<{x: number; y: number; text: string; size: number; p: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; family?: string; weight?: number; id: string; chalk?: boolean}> = ({
	x,
	y,
	text,
	size,
	p,
	fill = CHALK,
	anchor = 'start',
	family = font.sans,
	weight = 700,
	id,
	chalk = true,
}) => {
	if (p <= 0) return null;
	const w = text.length * size * 1.05;
	const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
	return (
		<g>
			<clipPath id={`wo-${id}`}>
				<rect x={x0 - 4} y={y - size * 1.1} width={(w + 8) * Math.min(1, p)} height={size * 1.5} />
			</clipPath>
			<text x={x} y={y} textAnchor={anchor} clipPath={`url(#wo-${id})`} filter={chalk ? 'url(#chalk)' : undefined} style={{fontFamily: family, fontWeight: weight, fontSize: size, fill, ...NUM}}>
				{text}
			</text>
		</g>
	);
};

/** A chalk arrow, drawn on with `p`. */
const ChalkArrow: React.FC<{x: number; y: number; up: boolean; p: number; color?: string; s?: number}> = ({x, y, up, p, color = CHALK, s = 1}) => {
	if (p <= 0) return null;
	const d = up ? -1 : 1;
	return (
		<g transform={`translate(${x},${y}) scale(${s})`} stroke={color} strokeWidth={5} strokeLinecap="round" fill="none" filter="url(#chalk)">
			<line x1={0} y1={-18 * d} x2={0} y2={-18 * d + 36 * d * Math.min(1, p * 1.6)} />
			{p > 0.6 ? <path d={`M-10,${8 * d} L0,${18 * d} L10,${8 * d}`} opacity={Math.min(1, (p - 0.6) * 3)} /> : null}
		</g>
	);
};

export type GradeRow = {cadet: string; a: string; b: string; note: '夸' | '骂'; pa: number; pn: number; pb: number};

/**
 * The grade board on the flight line: a chalkboard on an A-frame easel.
 * Origin: centre of the feet. The board face is 540 × 330, its top-left at (-270, -470).
 */
export const GradeBoard: React.FC<{rows: GradeRow[]; title?: number; lit?: number}> = ({rows, title = 1, lit = 1}) => (
	<g>
		<line x1={-230} y1={0} x2={-190} y2={-150} stroke="#3a2618" strokeWidth={12} strokeLinecap="round" />
		<line x1={230} y1={0} x2={190} y2={-150} stroke="#3a2618" strokeWidth={12} strokeLinecap="round" />
		<line x1={0} y1={-20} x2={0} y2={-150} stroke="#2a1a10" strokeWidth={9} />
		<g transform="translate(-270,-470)">
			<rect x={-14} y={-14} width={568} height={358} rx={6} fill="#5a3d27" />
			<rect x={0} y={0} width={540} height={330} fill="#22362c" />
			<rect x={0} y={0} width={540} height={330} fill="#ffcf8a" opacity={0.06 * lit} />
			<WriteOn x={270} y={50} text="机动科目 · 评分" size={30} p={title} anchor="middle" id="gb-title" />
			<line x1={30} y1={70} x2={510} y2={70} stroke={CHALK} strokeWidth={2} opacity={0.5 * title} filter="url(#chalk)" />
			{(['学员', '第一次', '讲评', '第二次'] as const).map((h, i) => (
				<text key={h} x={[70, 190, 320, 440][i]} y={104} textAnchor="middle" style={{fontFamily: font.sans, fontWeight: 500, fontSize: 21, fill: CHALK}} opacity={0.6 * title} filter="url(#chalk)">
					{h}
				</text>
			))}
			{rows.map((r, i) => {
				const y = 168 + i * 86;
				const worse = Number(r.b) < Number(r.a);
				return (
					<g key={i}>
						<WriteOn x={70} y={y} text={r.cadet} size={34} p={r.pa * 3} anchor="middle" id={`gb-c${i}`} />
						<WriteOn x={190} y={y} text={r.a} size={46} p={r.pa} anchor="middle" id={`gb-a${i}`} />
						{r.pn > 0 ? (
							<g opacity={Math.min(1, r.pn * 2)}>
								<circle cx={320} cy={y - 15} r={30 * Math.min(1, r.pn * 1.4)} fill="none" stroke={r.note === '夸' ? P.gold : P.red} strokeWidth={4} filter="url(#chalk)" />
								<text x={320} y={y - 2} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 34, fill: r.note === '夸' ? P.gold : P.red}} filter="url(#chalk)">
									{r.note}
								</text>
							</g>
						) : null}
						<WriteOn x={430} y={y} text={r.b} size={46} p={r.pb} anchor="middle" id={`gb-b${i}`} fill={worse ? '#ff8a80' : CHALK} />
						<ChalkArrow x={492} y={y - 16} up={!worse} p={(r.pb - 0.7) * 3.3} color={worse ? '#ff8a80' : CHALK} />
					</g>
				);
			})}
		</g>
	</g>
);

// ---------------------------------------------------------------- the logbook (top view)

export type LogRow = {date: string; cadet: string; task: string; a: string; note: '夸' | '骂'; b: string};
export const LOG: LogRow[] = [
	{date: '3/2', cadet: '07', task: '横滚', a: '9.1', note: '夸', b: '7.6'},
	{date: '3/2', cadet: '12', task: '横滚', a: '4.2', note: '骂', b: '6.8'},
	{date: '3/3', cadet: '03', task: '筋斗', a: '8.8', note: '夸', b: '7.0'},
	{date: '3/3', cadet: '15', task: '筋斗', a: '3.9', note: '骂', b: '6.1'},
	{date: '3/4', cadet: '09', task: '着陆', a: '9.4', note: '夸', b: '7.9'},
	{date: '3/4', cadet: '11', task: '着陆', a: '4.6', note: '骂', b: '6.6'},
	{date: '3/5', cadet: '07', task: '筋斗', a: '9.0', note: '夸', b: '7.2'},
];

/**
 * The instructor's logbook, open, seen from above. 1300 × 820, origin top-left.
 * `rows` 0..n written so far (fractional = the row being written), `ticks` 0..n rows checked,
 * `strike` 0..1 the 讲评 column struck through in red.
 */
export const Logbook: React.FC<{rows: number; ticks?: number; strike?: number; glow?: number}> = ({rows, ticks = 0, strike = 0, glow = 0}) => {
	const cols = [70, 190, 330];
	return (
		<g>
			<rect x={14} y={18} width={1300} height={820} rx={8} fill="#000" opacity={0.45} filter="url(#blur-md)" />
			<rect x={0} y={0} width={1300} height={820} rx={6} fill="#3a2a22" />
			<rect x={16} y={14} width={628} height={792} fill="url(#paper-page)" />
			<rect x={656} y={14} width={628} height={792} fill="url(#paper-page)" />
			<rect x={644} y={14} width={12} height={792} fill="#b9aa86" />
			{Array.from({length: 17}, (_, i) => (
				<line key={i} x1={30} y1={150 + i * 40} x2={1270} y2={150 + i * 40} stroke="#7a8aa8" strokeWidth={1} opacity={0.35} />
			))}
			<line x1={128} y1={30} x2={128} y2={800} stroke="#c0504a" strokeWidth={1.4} opacity={0.5} />
			<text x={340} y={84} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 38, fill: P.ink}}>
				飞行讲评记录
			</text>
			<text x={980} y={84} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 600, fontSize: 30, fill: '#4a4236', ...NUM}}>
				FLIGHT LOG · 1965
			</text>
			{(['日期', '学员', '科目', '评分', '讲评', '下一次'] as const).map((h, i) => (
				<text key={h} x={[70, 190, 330, 840, 1000, 1160][i]} y={132} textAnchor="middle" style={{fontFamily: font.sans, fontWeight: 700, fontSize: 22, fill: '#5a5040'}}>
					{h}
				</text>
			))}
			{LOG.map((r, i) => {
				const p = Math.min(1, Math.max(0, rows - i));
				if (p <= 0) return null;
				const y = 196 + i * 80;
				const better = Number(r.b) > Number(r.a);
				const t = Math.min(1, Math.max(0, ticks - i));
				const vals = [r.date, `学员${r.cadet}`, r.task];
				return (
					<g key={i}>
						{vals.map((v, k) => (
							<WriteOn key={k} x={cols[k]} y={y} text={v} size={30} p={p * 3 - k * 0.6} anchor="middle" fill={P.ink} family={font.serif} weight={600} id={`lg${i}-${k}`} chalk={false} />
						))}
						<WriteOn x={840} y={y} text={r.a} size={34} p={p * 3 - 1.2} anchor="middle" fill={P.ink} family={font.latin} weight={700} id={`lg${i}-a`} chalk={false} />
						<g opacity={Math.min(1, Math.max(0, p * 3 - 1.6))}>
							<text x={1000} y={y} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 32, fill: r.note === '夸' ? '#9a6a1a' : '#a3302a'}} opacity={1 - 0.65 * strike}>
								{r.note === '夸' ? '夸' : '骂'}
							</text>
						</g>
						<WriteOn x={1160} y={y} text={r.b} size={34} p={p * 3 - 2} anchor="middle" fill={better ? P.ink : '#a3302a'} family={font.latin} weight={700} id={`lg${i}-b`} chalk={false} />
						{p > 0.8 ? (
							<text x={1222} y={y} textAnchor="middle" style={{fontFamily: font.sans, fontWeight: 900, fontSize: 30, fill: better ? '#2f5a3a' : '#a3302a'}} opacity={Math.min(1, (p - 0.8) * 5)}>
								{better ? '↑' : '↓'}
							</text>
						) : null}
						{t > 0 ? (
							<path d={`M1246,${y - 14} l10,12 l20,-26`} stroke="#2f5a3a" strokeWidth={4} fill="none" strokeLinecap="round" strokeDasharray={60} strokeDashoffset={60 * (1 - t)} />
						) : null}
						{strike > 0 ? <line x1={970} y1={y - 12} x2={970 + 60 * strike} y2={y - 12} stroke={P.red} strokeWidth={4} strokeLinecap="round" /> : null}
					</g>
				);
			})}
			{glow > 0 ? <rect x={0} y={0} width={1300} height={820} fill="#ffcf8a" opacity={0.08 * glow} /> : null}
		</g>
	);
};

// ---------------------------------------------------------------- the coin experiment (top view)

/** Ten instructors' two coins: where each aims (their skill) and where each coin landed (aim + luck). */
export const COINS: {aim: [number, number]; a: [number, number]; b: [number, number]}[] = [
	{aim: [-63, 80], a: [-58, 27], b: [-139, 82]},
	{aim: [-44, 158], a: [-30, 168], b: [-5, 94]},
	{aim: [-197, -2], a: [-302, 35], b: [-174, 165]},
	{aim: [-212, -37], a: [-126, -23], b: [-149, -63]},
	{aim: [106, -51], a: [155, -42], b: [30, -20]},
	{aim: [-15, -110], a: [0, -33], b: [-18, -95]},
	{aim: [194, 65], a: [166, 30], b: [333, 58]},
	{aim: [53, -84], a: [33, -192], b: [121, -112]},
	{aim: [99, 163], a: [68, 251], b: [199, 72]},
	{aim: [136, 77], a: [187, 88], b: [158, 8]},
];
export const dist = (p: [number, number]) => Math.hypot(p[0], p[1]);
/** thrower indices sorted by the first coin's distance (closest first) */
export const RANK = COINS.map((_, i) => i).sort((i, j) => dist(COINS[i].a) - dist(COINS[j].a));
export const BEST = RANK.slice(0, 3);
export const WORST = RANK.slice(-3);
/** the luck radius: how far a throw lands from where it was aimed */
export const LUCK_R = 120;
export const MEAN_D = COINS.reduce((s, c) => s + dist(c.a) + dist(c.b), 0) / (2 * COINS.length);
/** target centre in the floor shot */
export const TGT = {x: 960, y: 430};
/** where each thrower stands (their back to the target), along the bottom of the floor */
export const throwerAt = (i: number): [number, number] => [300 + i * 146, 900 + (i % 2) * 26];

/**
 * A coin seen from above. `spin` (radians) flips it about its horizontal axis; `h` its height
 * above the floor in px (lifts it toward the lens: bigger, its shadow offset and softer).
 */
export const Coin: React.FC<{x: number; y: number; spin?: number; h?: number; gold?: boolean; copper?: boolean; r?: number; face?: string; back?: string}> = ({
	x,
	y,
	spin = 0,
	h = 0,
	gold = false,
	copper = false,
	r = 18,
	face,
	back,
}) => {
	const fill = gold ? 'url(#coin-gold)' : copper ? 'url(#coin-copper)' : 'url(#coin-silver)';
	const edge = gold ? '#8a5e1e' : copper ? '#6a3a1e' : '#6c727b';
	const c = Math.cos(spin);
	const sy = Math.max(0.08, Math.abs(c));
	const s = 1 + h / 600;
	const showFace = c >= 0 ? face : back;
	return (
		<g>
			<ellipse cx={x + h * 0.35} cy={y + h * 0.5 + 3} rx={r * (1 + h / 400)} ry={r * (1 + h / 400) * 0.9} fill="#000" opacity={0.45 / (1 + h / 120)} filter={h > 4 ? 'url(#blur-sm)' : undefined} />
			<g transform={`translate(${x},${y - h * 0.15}) scale(${s},${s * sy})`}>
				<circle r={r} fill={fill} />
				<circle r={r * 0.78} fill="none" stroke={edge} strokeWidth={r * 0.06} opacity={0.6} />
				{showFace ? (
					<text y={r * 0.36} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: r * 1.05, fill: gold ? '#6a4310' : '#3a3f47'}}>
						{showFace}
					</text>
				) : (
					<g fill="none" stroke={edge} strokeWidth={r * 0.07} strokeLinecap="round" opacity={0.8}>
						<path d={`M0,${r * 0.45} L0,${-r * 0.4}`} />
						<path d={`M0,${-r * 0.1} C${-r * 0.3},${-r * 0.2} ${-r * 0.36},${-r * 0.42} ${-r * 0.18},${-r * 0.5}`} />
						<path d={`M0,${r * 0.12} C${r * 0.3},${0} ${r * 0.38},${-r * 0.22} ${r * 0.2},${-r * 0.32}`} />
					</g>
				)}
				<ellipse cx={-r * 0.3} cy={-r * 0.35} rx={r * 0.35} ry={r * 0.18} fill="#fff" opacity={0.45} />
			</g>
		</g>
	);
};

/** The hangar floor from above: concrete slabs, oil stains, the overhead lamp's pool, the chalk target. */
export const HangarFloor: React.FC<{f: number; rings?: number; lamp?: number; children?: React.ReactNode}> = ({f, rings = 1, lamp = 1, children}) => (
	<g>
		<rect x={-1400} y={-1100} width={4720} height={3300} fill="#3e3d40" />
		{Array.from({length: 16}, (_, i) => (
			<line key={`v${i}`} x1={-1400 + i * 320} y1={-1100} x2={-1400 + i * 320} y2={2200} stroke="#2e2e32" strokeWidth={4} />
		))}
		{Array.from({length: 12}, (_, i) => (
			<line key={`h${i}`} x1={-1400} y1={-1100 + i * 320} x2={3320} y2={-1100 + i * 320} stroke="#2e2e32" strokeWidth={4} />
		))}
		{Array.from({length: 26}, (_, i) => (
			<ellipse key={i} cx={-800 + random(`os${i}`) * 3600} cy={-700 + random(`ot${i}`) * 2600} rx={20 + random(`ou${i}`) * 90} ry={14 + random(`ov${i}`) * 50} fill="#2a2620" opacity={0.25} />
		))}
		{/* a yellow safety line */}
		<rect x={-1400} y={1080} width={4720} height={14} fill="#c9a23a" opacity={0.6} />
		{/* the chalk target */}
		<g transform={`translate(${TGT.x},${TGT.y})`} filter="url(#chalk)">
			{[60, 120, 180, 240, 300, 360].map((r, i) => {
				const q = Math.min(1, Math.max(0, rings * 7 - i));
				const L = 2 * Math.PI * r;
				return q > 0 ? <circle key={r} r={r} fill="none" stroke={CHALK} strokeWidth={i === 0 ? 5 : 3} opacity={0.75 - i * 0.07} strokeDasharray={L} strokeDashoffset={L * (1 - q)} transform={`rotate(${-90 + i * 40})`} /> : null;
			})}
			<g opacity={Math.min(1, rings * 4)}>
				<line x1={-14} y1={0} x2={14} y2={0} stroke={CHALK} strokeWidth={4} />
				<line x1={0} y1={-14} x2={0} y2={14} stroke={CHALK} strokeWidth={4} />
			</g>
		</g>
		{children}
		<rect x={-1400} y={-1100} width={4720} height={3300} fill="url(#floor-pool)" />
		<circle cx={TGT.x} cy={TGT.y - 40} r={700} fill="#ffcf8a" opacity={0.06 * lamp + 0.01 * Math.sin(f / 30)} />
	</g>
);

/** A person seen straight from above, standing: shoulders in a khaki shirt, arms at the sides, a forage cap with its peak toward `angle` (deg, 0 = facing down the frame). */
export const TopPerson: React.FC<{x: number; y: number; angle?: number; s?: number; f?: number; seed?: string}> = ({x, y, angle = 0, s = 1, f = 0, seed = 'tp'}) => {
	const sway = 2 * Math.sin(f / (40 + random(`${seed}w`) * 30) + random(`${seed}p`) * 6);
	const shirt = ['#7a6e52', '#6e6450', '#837656', '#6a604a'][Math.floor(random(`${seed}c`) * 4)];
	return (
		<g transform={`translate(${x},${y}) rotate(${angle + sway}) scale(${s})`}>
			<path d="M-60,-14 C-60,-30 60,-30 60,-14 L64,18 C40,40 -40,40 -64,18 Z" fill="#000" opacity={0.35} transform="translate(14,22)" filter="url(#blur-sm)" />
			{/* arms */}
			<ellipse cx={-62} cy={4} rx={13} ry={20} fill={shirt} />
			<ellipse cx={62} cy={4} rx={13} ry={20} fill={shirt} />
			{/* shoulders */}
			<path d="M-56,-10 C-56,-26 56,-26 56,-10 L58,14 C36,26 -36,26 -58,14 Z" fill={shirt} />
			<path d="M-56,-10 C-56,-26 56,-26 56,-10" stroke="#ffe2b0" strokeWidth={3} fill="none" opacity={0.3} />
			{/* cap and its peak */}
			<ellipse cx={0} cy={-2} rx={22} ry={24} fill="#4a4434" />
			<path d="M-16,16 C-10,30 10,30 16,16 Z" fill="#2e2a20" />
			<ellipse cx={-6} cy={-10} rx={9} ry={6} fill="#ffe2b0" opacity={0.18} />
		</g>
	);
};

// ---------------------------------------------------------------- Galton's heights (1886)

/**
 * Galton's chart, drawn as a sheet on his desk: mid-parent height (x) against the adult
 * children's average (y), in inches above or below the mean (68¼). Origin top-left, 900 × 700.
 * `p` draws the points, `line` the 45° "if it all passed on" line, `fit` the 2/3 line,
 * `tall` highlights the tallest parents and their children.
 */
export const HeightChart: React.FC<{p: number; line: number; fit: number; tall: number}> = ({p, line, fit, tall}) => {
	const X = (v: number) => 450 + v * 70;
	const Y = (v: number) => 350 - v * 70;
	const pts = Array.from({length: 46}, (_, i) => {
		const mp = -4 + 8 * random(`gh${i}`);
		const ch = (2 / 3) * mp + (random(`gc${i}`) - 0.5) * 1.6;
		return [mp, ch] as const;
	});
	return (
		<g>
			<rect x={12} y={16} width={900} height={700} fill="#000" opacity={0.4} filter="url(#blur-md)" />
			<rect x={0} y={0} width={900} height={700} fill="url(#paper-page)" />
			{Array.from({length: 13}, (_, i) => (
				<g key={i} stroke="#9aa6b8" strokeWidth={1} opacity={0.35}>
					<line x1={X(-6 + i)} y1={20} x2={X(-6 + i)} y2={680} />
					<line x1={20} y1={Y(-5 + i)} x2={880} y2={Y(-5 + i)} />
				</g>
			))}
			<line x1={X(-6)} y1={Y(0)} x2={X(6)} y2={Y(0)} stroke={P.ink} strokeWidth={2} opacity={0.6} />
			<line x1={X(0)} y1={Y(-5)} x2={X(0)} y2={Y(5)} stroke={P.ink} strokeWidth={2} opacity={0.6} />
			<text x={870} y={Y(0) + 34} textAnchor="end" style={{fontFamily: font.serif, fontWeight: 700, fontSize: 24, fill: '#4a4236'}}>
				父母身高 →
			</text>
			<text x={X(0) + 12} y={44} style={{fontFamily: font.serif, fontWeight: 700, fontSize: 24, fill: '#4a4236'}}>
				↑ 孩子身高
			</text>
			<text x={X(0) - 12} y={Y(0) - 12} textAnchor="end" style={{fontFamily: font.latin, fontWeight: 600, fontSize: 22, fill: '#6a5f4c', ...NUM}}>
				68¼″
			</text>
			{pts.map(([a, b], i) => {
				const q = Math.min(1, Math.max(0, p * pts.length - i));
				const hot = a > 2.6;
				return q > 0 ? <circle key={i} cx={X(a)} cy={Y(b)} r={7 * q} fill={hot && tall > 0 ? P.brass : '#3a3530'} opacity={0.85} /> : null;
			})}
			{line > 0 ? (
				<line x1={X(-5)} y1={Y(-5)} x2={X(-5 + 10 * line)} y2={Y(-5 + 10 * line)} stroke="#6a5f4c" strokeWidth={3} strokeDasharray="10 8" />
			) : null}
			{fit > 0 ? <line x1={X(-6)} y1={Y(-4)} x2={X(-6 + 12 * fit)} y2={Y(-4 + 8 * fit)} stroke="#a0712a" strokeWidth={5} /> : null}
			{tall > 0 ? (
				<g opacity={tall}>
					<line x1={X(4)} y1={Y(0)} x2={X(4)} y2={Y(4)} stroke="#6a5f4c" strokeWidth={3} strokeDasharray="6 6" />
					<line x1={X(4) + 30} y1={Y(0)} x2={X(4) + 30} y2={Y(4 * (2 / 3))} stroke="#a0712a" strokeWidth={8} />
					<line x1={X(4) - 10} y1={Y(4)} x2={X(4) + 10} y2={Y(4)} stroke="#6a5f4c" strokeWidth={3} />
				</g>
			) : null}
		</g>
	);
};

/** A desk seen from above (no props): oak planks, a lamp's brass foot and globe at `lamp`, its pool of light. */
export const Desk: React.FC<{f: number; lamp?: {x: number; y: number}; on?: number; children?: React.ReactNode}> = ({f, lamp = {x: 1660, y: 200}, on = 1, children}) => {
	const fl = 0.95 + 0.03 * Math.sin(f / 3.3) + 0.02 * Math.sin(f / 1.9);
	return (
		<g>
			<defs>
				<radialGradient id="desk-pool" cx={lamp.x} cy={lamp.y} r={1500} gradientUnits="userSpaceOnUse">
					<stop offset="0" stopColor="#ffd9a0" stopOpacity={0.5 * on * fl} />
					<stop offset="0.35" stopColor="#c98a4a" stopOpacity={0.2 * on} />
					<stop offset="1" stopColor="#000" stopOpacity={0.72} />
				</radialGradient>
			</defs>
			{Array.from({length: 18}, (_, i) => (
				<g key={i}>
					<rect x={-2400} y={-700 + i * 130} width={7000} height={128} fill={['#5a3a24', '#62412a', '#55361f', '#5e3d26'][i % 4]} />
					{Array.from({length: 6}, (_, j) => (
						<path key={j} d={`M-2400,${-680 + i * 130 + j * 19} C-400,${-670 + i * 130 + j * 19 + 8 * Math.sin(i + j)} 1800,${-690 + i * 130 + j * 19} 4600,${-678 + i * 130 + j * 19}`} stroke="#3a2416" strokeWidth={1.2} fill="none" opacity={0.35} />
					))}
					<rect x={-2400} y={-700 + i * 130 + 126} width={7000} height={3} fill="#2a180e" opacity={0.7} />
				</g>
			))}
			{children}
			<rect x={-2400} y={-700} width={7000} height={2400} fill="url(#desk-pool)" />
			<g transform={`translate(${lamp.x},${lamp.y})`}>
				<circle r={420} fill="url(#lantern-glow)" opacity={0.5 * on * fl} />
				<circle r={92} fill="url(#brass)" />
				<circle r={64} fill="#fff6e0" opacity={0.9 * on} />
				<circle r={40} fill="#fffaf0" opacity={on} />
			</g>
		</g>
	);
};
