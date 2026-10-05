import React, {useMemo} from 'react';
import {random} from 'remotion';
import {CAM0, Layer, type Cam} from '../../src/art/sets/Airfield';
import {font} from '../../src/lib/theme';

/**
 * 《旋转的硬币》 art: the lab and its gold "chandelier" (a dilution refrigerator with the chip at the
 * bottom), the coin table, coins that lie flat or spin, waves, answer bars, use cards.
 */

const NUM = {fontVariantNumeric: 'lining-nums' as const};
export const GOLD = '#f1c56d';
export const ICE = '#9fd8ff';

export const Q_DEFS: React.FC = () => (
	<defs>
		<linearGradient id="q-gold" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stopColor="#7a5418" />
			<stop offset="0.3" stopColor="#e9b95c" />
			<stop offset="0.5" stopColor="#fff0c0" />
			<stop offset="0.7" stopColor="#d9a245" />
			<stop offset="1" stopColor="#6a4512" />
		</linearGradient>
		<linearGradient id="q-gold-top" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#fff2c8" />
			<stop offset="1" stopColor="#c8913a" />
		</linearGradient>
		<linearGradient id="q-steel" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stopColor="#3a4250" />
			<stop offset="0.45" stopColor="#9aa6b8" />
			<stop offset="0.55" stopColor="#c9d3e0" />
			<stop offset="1" stopColor="#323844" />
		</linearGradient>
		<radialGradient id="q-cold">
			<stop offset="0" stopColor="#bfe6ff" stopOpacity="0.55" />
			<stop offset="0.4" stopColor="#5fa8e0" stopOpacity="0.16" />
			<stop offset="1" stopColor="#1a3a5a" stopOpacity="0" />
		</radialGradient>
		<radialGradient id="q-warm">
			<stop offset="0" stopColor="#ffd9a0" stopOpacity="0.5" />
			<stop offset="0.45" stopColor="#c98a4a" stopOpacity="0.12" />
			<stop offset="1" stopColor="#000" stopOpacity="0" />
		</radialGradient>
		<linearGradient id="q-mist" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#9fc8ea" stopOpacity="0" />
			<stop offset="0.6" stopColor="#9fc8ea" stopOpacity="0.16" />
			<stop offset="1" stopColor="#9fc8ea" stopOpacity="0.28" />
		</linearGradient>
		<linearGradient id="q-wall" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#05070d" />
			<stop offset="0.6" stopColor="#0d1320" />
			<stop offset="1" stopColor="#111a2a" />
		</linearGradient>
		<linearGradient id="q-floor" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#141b28" />
			<stop offset="1" stopColor="#06080d" />
		</linearGradient>
		<radialGradient id="q-coin" cx="35%" cy="30%" r="80%">
			<stop offset="0" stopColor="#ffffff" />
			<stop offset="0.5" stopColor="#c9ced6" />
			<stop offset="1" stopColor="#6c727b" />
		</radialGradient>
		<radialGradient id="q-coin-gold" cx="35%" cy="30%" r="80%">
			<stop offset="0" stopColor="#fff3cc" />
			<stop offset="0.5" stopColor="#e2b154" />
			<stop offset="1" stopColor="#7a5418" />
		</radialGradient>
		<filter id="q-blur-s" x="-50%" y="-50%" width="200%" height="200%">
			<feGaussianBlur stdDeviation={3} />
		</filter>
		<filter id="q-blur-l" x="-50%" y="-50%" width="200%" height="200%">
			<feGaussianBlur stdDeviation={14} />
		</filter>
	</defs>
);

// ---------------------------------------------------------------- the chandelier

/**
 * A dilution refrigerator's insert: gold plates (seen slightly from below, as ellipses), each smaller
 * than the one above, joined by gold rods, coax lines coiling down, the chip at the bottom.
 * Origin: the top plate's centre. About 760 tall. `cold` 0..1 lights the bottom; `chip` lights the chip.
 */
export const Chandelier: React.FC<{f: number; cold?: number; chip?: number}> = ({f, cold = 1, chip = 0}) => {
	const plates = [
		{y: 0, w: 300},
		{y: 150, w: 250},
		{y: 290, w: 205},
		{y: 420, w: 165},
		{y: 540, w: 130},
		{y: 650, w: 96},
	];
	const rods = [-0.8, -0.35, 0.35, 0.8];
	return (
		<g>
			{/* coax lines: thin, coiling, behind the rods */}
			{Array.from({length: 7}, (_, i) => {
				const x0 = -110 + i * 36;
				let d = `M${x0},0`;
				for (let k = 1; k <= 26; k++) {
					const y = k * 25;
					const w = plates.reduce((a, p) => (y >= p.y ? p.w : a), plates[0].w);
					const x = (x0 / 150) * (w / 2) + 7 * Math.sin(k * 1.3 + i);
					d += ` L${x.toFixed(1)},${y}`;
				}
				return <path key={i} d={d} stroke={i % 2 ? '#b07a30' : '#8a96a8'} strokeWidth={2.2} fill="none" opacity={0.75} />;
			})}
			{/* rods between plates */}
			{plates.slice(0, -1).map((p, i) => {
				const q = plates[i + 1];
				return rods.map((r, j) => (
					<line key={`${i}-${j}`} x1={(r * p.w) / 2} y1={p.y + 8} x2={(r * q.w) / 2} y2={q.y} stroke="url(#q-gold)" strokeWidth={7} />
				));
			})}
			{/* the plates */}
			{plates.map((p, i) => (
				<g key={i}>
					<ellipse cx={0} cy={p.y + 10} rx={p.w / 2} ry={p.w * 0.09} fill="#5a3c12" />
					<rect x={-p.w / 2} y={p.y} width={p.w} height={10} fill="url(#q-gold)" />
					<ellipse cx={0} cy={p.y} rx={p.w / 2} ry={p.w * 0.09} fill="url(#q-gold-top)" />
					{/* small gold heat-sink blocks hanging under each plate */}
					{[-0.5, 0.15, 0.55].map((k, j) => (
						<rect key={j} x={(k * p.w) / 2 - 9} y={p.y + 12} width={18} height={22 + j * 6} fill="url(#q-gold)" />
					))}
				</g>
			))}
			{/* the chip mount, the coldest point */}
			<g transform="translate(0,690)">
				<rect x={-34} y={0} width={68} height={58} rx={6} fill="url(#q-gold)" />
				<rect x={-22} y={14} width={44} height={30} fill="#141820" />
				<rect x={-16} y={19} width={32} height={20} fill={ICE} opacity={0.25 + 0.6 * chip * (0.85 + 0.15 * Math.sin(f / 5))} />
				<circle cx={0} cy={29} r={120} fill="url(#q-cold)" opacity={0.6 * cold + 0.6 * chip} />
			</g>
		</g>
	);
};

// ---------------------------------------------------------------- the lab

/**
 * The quantum lab at night: rack walls of control electronics with LEDs, the steel frame holding the
 * insert, the outer can raised, cold mist on the floor. Hero plane: the chandelier hangs from (960, 150).
 */
export const LabSet: React.FC<{f: number; cam?: Cam; children?: React.ReactNode; light?: number; chip?: number}> = ({f, cam = CAM0, children, light = 1, chip = 0}) => {
	const leds = useMemo(
		() =>
			Array.from({length: 220}, (_, i) => ({
				rack: Math.floor(random(`lr${i}`) * 8),
				y: 140 + random(`ly${i}`) * 560,
				x: 14 + random(`lx${i}`) * 150,
				c: random(`lc${i}`) > 0.6 ? '#5cff9c' : random(`lc2${i}`) > 0.5 ? '#6ab8ff' : '#ffb44d',
				p: random(`lp${i}`) * 6,
				w: 0.3 + random(`lw${i}`) * 1.4,
			})),
		[],
	);
	const rackX = (k: number) => (k < 4 ? -520 + k * 190 : 1660 + (k - 4) * 190);
	return (
		<g>
			<Layer cam={cam} depth={0.55}>
				<rect x={-900} y={-500} width={3700} height={1900} fill="url(#q-wall)" />
				{/* racks on both sides */}
				{Array.from({length: 8}, (_, k) => (
					<g key={k} transform={`translate(${rackX(k)},100)`}>
						<rect x={0} y={0} width={180} height={640} fill="#0a0e16" />
						<rect x={0} y={0} width={180} height={640} fill="none" stroke="#1d2636" strokeWidth={3} />
						{Array.from({length: 14}, (_, j) => (
							<rect key={j} x={8} y={14 + j * 44} width={164} height={36} fill="#111826" />
						))}
					</g>
				))}
				{leds.map((l, i) => (
					<circle key={i} cx={rackX(l.rack) + l.x} cy={100 + l.y - 100} r={2.2} fill={l.c} opacity={(0.35 + 0.65 * (Math.sin(f * l.w * 0.2 + l.p) > 0.2 ? 1 : 0.25)) * light} />
				))}
			</Layer>
			<Layer cam={cam} depth={0.85}>
				<polygon points="-800,820 2720,820 2720,1400 -800,1400" fill="url(#q-floor)" />
				{Array.from({length: 18}, (_, i) => (
					<line key={i} x1={960 + (i - 9) * 140} y1={820} x2={960 + (i - 9) * 420} y2={1400} stroke="#1a2232" strokeWidth={2} />
				))}
				<ellipse cx={960} cy={860} rx={520} ry={60} fill="url(#q-cold)" opacity={0.8 * light} />
			</Layer>
			<Layer cam={cam} depth={1}>
				{/* the frame and the raised outer can */}
				<rect x={700} y={-120} width={520} height={60} fill="url(#q-steel)" />
				<rect x={712} y={-60} width={22} height={900} fill="url(#q-steel)" />
				<rect x={1186} y={-60} width={22} height={900} fill="url(#q-steel)" />
				<path d="M780,-420 L1140,-420 L1150,-130 L770,-130 Z" fill="url(#q-steel)" opacity={0.85} />
				<rect x={890} y={-60} width={140} height={210} fill="url(#q-steel)" />
				<circle cx={960} cy={400} r={460} fill="url(#q-warm)" opacity={0.45 * light} />
				<g transform="translate(960,150)">
					<Chandelier f={f} chip={chip} />
				</g>
				{children}
			</Layer>
			<Layer cam={cam} depth={1.25}>
				{/* cold mist drifting on the floor */}
				{Array.from({length: 7}, (_, i) => (
					<ellipse key={i} cx={((i * 380 + f * (0.6 + i * 0.1)) % 2600) - 340} cy={900 + (i % 3) * 30} rx={420} ry={60} fill="url(#q-mist)" opacity={0.6} filter="url(#q-blur-l)" />
				))}
			</Layer>
		</g>
	);
};

// ---------------------------------------------------------------- the coin table

export const TABLE_Y = 640;

/** A dark tabletop seen from a little above, under one warm lamp. Children are drawn on the table. */
export const CoinTable: React.FC<{cam?: Cam; children?: React.ReactNode; lamp?: number}> = ({cam = CAM0, children, lamp = 1}) => (
	<g>
		<Layer cam={cam} depth={0.4}>
			<rect x={-900} y={-600} width={3700} height={2200} fill="#05060a" />
			<circle cx={960} cy={300} r={900} fill="url(#q-warm)" opacity={0.25 * lamp} />
		</Layer>
		<Layer cam={cam} depth={1}>
			<polygon points="-600,470 2520,470 3300,1500 -1380,1500" fill="#1a1410" />
			{Array.from({length: 26}, (_, i) => (
				<line key={i} x1={-600 + i * 125} y1={470} x2={-1380 + i * 188} y2={1500} stroke="#120d0a" strokeWidth={3} opacity={0.6} />
			))}
			<ellipse cx={960} cy={TABLE_Y + 40} rx={900} ry={260} fill="url(#q-warm)" opacity={0.9 * lamp} />
			{children}
		</Layer>
	</g>
);

/**
 * A coin on the table at (x, y): spinning upright about its vertical axis (`spin` radians, `upright` 1),
 * or lying flat (`upright` 0) showing `face`. `gold` for the hero. r = radius.
 */
export const TableCoin: React.FC<{x: number; y: number; r?: number; spin?: number; upright?: number; face?: '0' | '1'; gold?: boolean; blur?: number}> = ({
	x,
	y,
	r = 60,
	spin = 0,
	upright = 0,
	face = '0',
	gold = false,
	blur = 0,
}) => {
	const fill = gold ? 'url(#q-coin-gold)' : 'url(#q-coin)';
	const edge = gold ? '#7a5418' : '#5a606a';
	const ink = gold ? '#6a4310' : '#2a2e36';
	// upright: width follows |cos spin|, the visible face flips with its sign
	const c = Math.cos(spin);
	const w = Math.max(0.06, Math.abs(c));
	const showing: '0' | '1' = c >= 0 ? '1' : '0';
	const rx = r * mix(1, w, upright);
	const ry = r * mix(0.32, 1, upright);
	const cy = y - r * upright;
	const label = upright > 0.5 ? showing : face;
	return (
		<g>
			<ellipse cx={x} cy={y + 4} rx={r * mix(1.05, 0.8, upright)} ry={r * 0.18} fill="#000" opacity={0.5} filter="url(#q-blur-s)" />
			<g filter={blur > 0.3 ? 'url(#q-blur-s)' : undefined} opacity={blur > 0.3 ? 0.9 : 1}>
				{upright < 0.5 ? <ellipse cx={x} cy={cy + r * 0.06} rx={rx} ry={ry} fill={edge} /> : <rect x={x - rx} y={cy - ry} width={rx * 2} height={ry * 2} rx={rx} fill={edge} />}
				<ellipse cx={x} cy={cy} rx={rx * (upright > 0.5 ? 0.92 : 1)} ry={ry} fill={fill} />
				<ellipse cx={x} cy={cy} rx={rx * 0.78} ry={ry * 0.78} fill="none" stroke={edge} strokeWidth={r * 0.04} opacity={0.5} />
				{rx > r * 0.22 ? (
					<text x={x} y={cy + ry * 0.34} textAnchor="middle" transform={`translate(${x},${cy}) scale(${rx / r},${ry / r}) translate(${-x},${-cy})`} style={{fontFamily: font.latin, fontWeight: 700, fontSize: r * 1.05, fill: ink, ...NUM}}>
						{label}
					</text>
				) : null}
			</g>
			{blur > 0 ? <ellipse cx={x} cy={cy} rx={r} ry={r} fill={gold ? '#ffe6a8' : '#e9eef6'} opacity={0.12 * blur} filter="url(#q-blur-s)" /> : null}
		</g>
	);
};

const mix = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------------------------------------------------------------- data pictures

/** A chip seen from above: a grid of qubits (dots) with couplers. */
export const ChipTop: React.FC<{n?: number; lit?: number; f?: number}> = ({n = 105, lit = 1, f = 0}) => {
	const cols = 15;
	return (
		<g>
			<rect x={-330} y={-200} width={660} height={400} rx={14} fill="#10141c" stroke="#c8913a" strokeWidth={4} />
			{Array.from({length: n}, (_, i) => {
				const cx = -280 + (i % cols) * 40;
				const cy = -150 + Math.floor(i / cols) * 46;
				const o = Math.min(1, Math.max(0, lit * n - i));
				return (
					<g key={i} opacity={o}>
						<circle cx={cx} cy={cy} r={9} fill={ICE} opacity={0.85 * (0.75 + 0.25 * Math.sin(f / 6 + i))} />
						{i % cols < cols - 1 ? <line x1={cx + 10} y1={cy} x2={cx + 30} y2={cy} stroke="#5a6a80" strokeWidth={2} /> : null}
					</g>
				);
			})}
		</g>
	);
};

/** Two waves and their sum. `phase` 0 = in step (crests meet crests), π = out of step. `p` draws on. */
export const Waves: React.FC<{phase: number; p?: number; w?: number; sum?: number}> = ({phase, p = 1, w = 1200, sum = 1}) => {
	const path = (amp: number, ph: number, y0: number, n = 160) => {
		let d = '';
		for (let i = 0; i <= n * p; i++) {
			const x = -w / 2 + (w * i) / n;
			const y = y0 + amp * Math.sin((i / n) * Math.PI * 6 + ph);
			d += `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)} `;
		}
		return d;
	};
	const s = 2 * Math.cos(phase / 2);
	return (
		<g fill="none" strokeLinecap="round">
			<path d={path(50, 0, -170)} stroke={ICE} strokeWidth={5} />
			<path d={path(50, phase, -20)} stroke="#ff9a7a" strokeWidth={5} />
			<line x1={-w / 2} y1={60} x2={w / 2} y2={60} stroke="#3a4558" strokeWidth={2} strokeDasharray="8 8" opacity={sum} />
			<path d={path(50 * Math.abs(s), s >= 0 ? phase / 2 : phase / 2 + Math.PI, 160)} stroke={GOLD} strokeWidth={7} opacity={sum} />
		</g>
	);
};

/** The answers: N bars whose heights are amplitudes; `gold` marks the right one. */
export const AnswerBars: React.FC<{amps: number[]; gold: number; pick?: number; labels?: boolean}> = ({amps, gold, pick = -1, labels = true}) => {
	const n = amps.length;
	const bw = 52;
	const gap = 18;
	const W = n * bw + (n - 1) * gap;
	return (
		<g>
			<line x1={-W / 2 - 20} y1={0} x2={W / 2 + 20} y2={0} stroke="#3a4558" strokeWidth={3} />
			{amps.map((a, i) => {
				const x = -W / 2 + i * (bw + gap);
				const h = Math.abs(a) * 300;
				const isG = i === gold;
				return (
					<g key={i}>
						<rect x={x} y={-h} width={bw} height={h} rx={6} fill={isG ? GOLD : '#7f93b0'} opacity={isG ? 1 : 0.75} />
						{pick === i ? <rect x={x - 6} y={-h - 6} width={bw + 12} height={h + 12} rx={8} fill="none" stroke="#fff" strokeWidth={4} /> : null}
						{labels ? (
							<text x={x + bw / 2} y={36} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 22, fill: isG ? GOLD : '#8a96a8', ...NUM}}>
								{i.toString(2).padStart(Math.log2(n), '0')}
							</text>
						) : null}
					</g>
				);
			})}
		</g>
	);
};

/** A simple molecule (ball and stick), a battery and a padlock, for the uses. */
export const Molecule: React.FC<{f: number}> = ({f}) => {
	const atoms = [
		[0, 0, 26, '#e8eef6'],
		[90, -40, 20, '#ff7a6a'],
		[-80, -50, 20, '#6ab8ff'],
		[40, 90, 18, '#e8eef6'],
		[-60, 70, 18, '#9fe0a0'],
		[150, 30, 14, '#e8eef6'],
	] as const;
	const a = f / 60;
	const rot = (x: number, y: number): [number, number] => [x * Math.cos(a) - y * Math.sin(a) * 0.3, y];
	return (
		<g>
			{atoms.slice(1).map((t, i) => {
				const [x, y] = rot(t[0], t[1]);
				const [x0, y0] = rot(atoms[i === 4 ? 1 : 0][0], atoms[i === 4 ? 1 : 0][1]);
				return <line key={i} x1={x0} y1={y0} x2={x} y2={y} stroke="#9aa6b8" strokeWidth={8} />;
			})}
			{atoms.map((t, i) => {
				const [x, y] = rot(t[0], t[1]);
				return <circle key={i} cx={x} cy={y} r={t[2]} fill={t[3]} />;
			})}
		</g>
	);
};

export const Padlock: React.FC<{open?: number}> = ({open = 0}) => (
	<g>
		<path d={`M-40,-20 L-40,${-70 - 30 * open} A40,40 0 0 1 40,${-70 - 30 * open} L40,${-40 - 30 * open}`} stroke="#c9d3e0" strokeWidth={14} fill="none" strokeLinecap="round" />
		<rect x={-62} y={-24} width={124} height={100} rx={12} fill="url(#q-gold)" />
		<circle cx={0} cy={18} r={12} fill="#3a2810" />
		<rect x={-4} y={22} width={8} height={26} fill="#3a2810" />
	</g>
);

export const Battery: React.FC<{charge?: number}> = ({charge = 0.8}) => (
	<g>
		<rect x={-50} y={-90} width={100} height={180} rx={12} fill="none" stroke="#c9d3e0" strokeWidth={8} />
		<rect x={-20} y={-104} width={40} height={14} rx={4} fill="#c9d3e0" />
		<rect x={-38} y={78 - 156 * charge} width={76} height={156 * charge} rx={6} fill="#7ee0a0" />
	</g>
);
