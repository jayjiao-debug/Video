import React from 'react';
import {random} from 'remotion';
import {noise2D} from '@remotion/noise';
import type {Look} from '../../src/art/Figure';
import {P} from '../../src/art/palette';
import {CAM0, Layer, type Cam} from '../../src/art/sets/Airfield';
import {JUNO} from '../../src/brand/identity';
import {font} from '../../src/lib/theme';

/**
 * Art kit for 《第一位数字》: the log-table book (macro fore-edge, on the desk,
 * open, with thumb tabs), an oil lamp, falling snow, Newcomb's study (1881) and
 * the snowy street outside the Nautical Almanac Office. One warm practical per
 * shot (the lamp, the gas lamp), cool moonlight through windows.
 */

export const W = 1920;
export const H = 1080;
export const GOLD = JUNO.colors.gold;

/** Benford P(d) in % for d = 1..9 (index 0 unused). The book's wear follows it exactly. */
export const BENF = [0, 30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6];

// ---------------------------------------------------------------- the cast

export const NEWCOMB: Look = {skin: P.skin1, hair: 'short', hairColor: '#5b4d42', outfit: 'frock', top: '#262a33', bottom: '#1e2027', accent: '#6a4e34', beard: true};

// ---------------------------------------------------------------- small pieces

/** how worn a section is, 1 (front, black) … 0 (back, clean); ordered exactly as Benford's P(d) */
const sectionWear = (d: number) => Math.pow(Math.max(0, (BENF[d] - BENF[9]) / (BENF[1] - BENF[9])), 0.42);
export const wearAt = (u: number) => {
	// smooth along the book (u = 0 front … 1 back), interpolating between section centres
	const s = Math.min(8.5, Math.max(0.5, u * 9));
	const i = Math.floor(s - 0.5);
	const fr = s - 0.5 - i;
	const a = sectionWear(i + 1);
	const b = sectionWear(Math.min(9, i + 2));
	return a + (b - a) * fr;
};

/** wear gradient stops (0..1 opacity scale) for an id */
export const WearGradient: React.FC<{id: string; color?: string; max?: number; vertical?: boolean}> = ({id, color = '#1c0e05', max = 0.95, vertical}) => (
	<linearGradient id={id} x1="0" y1="0" x2={vertical ? '0' : '1'} y2={vertical ? '1' : '0'}>
		{Array.from({length: 37}, (_, i) => (
			<stop key={i} offset={i / 36} stopColor={color} stopOpacity={max * wearAt(i / 36)} />
		))}
	</linearGradient>
);

/** an oil lamp: brass font, glass chimney, live flame and its pool of light */
export const OilLamp: React.FC<{f: number; glow?: number; pool?: boolean}> = ({f, glow = 1, pool = true}) => {
	const fl = 1 + 0.06 * noise2D('fl', f / 6, 0) + 0.03 * Math.sin(f / 2.1);
	return (
		<g>
			{pool ? <circle cx={0} cy={-120} r={620} fill="url(#glow-lamp)" opacity={0.6 * glow * fl} /> : null}
			<ellipse cx={0} cy={0} rx={66} ry={13} fill="#3a2410" />
			<path d="M-46,0 C-52,-34 -34,-64 0,-68 C34,-64 52,-34 46,0 Z" fill="url(#brass)" />
			<path d="M-30,-20 C-30,-44 -16,-58 0,-60" stroke="#ffe7b0" strokeWidth={4} fill="none" opacity={0.45} />
			<rect x={-16} y={-84} width={32} height={18} rx={3} fill="#7d5420" />
			<path d="M-24,-84 C-38,-118 -34,-160 -18,-204 L18,-204 C34,-160 38,-118 24,-84 Z" fill="#fff2d0" opacity={0.14} stroke="#fff2d0" strokeOpacity={0.4} strokeWidth={2} />
			<g transform={`translate(0,-96) scale(${0.9 + 0.1 * fl},${fl})`}>
				<path d="M0,0 C-13,-20 -7,-44 0,-60 C7,-44 13,-20 0,0 Z" fill="#ffd88a" filter="url(#blur-sm)" />
				<path d="M0,-4 C-7,-18 -4,-34 0,-44 C4,-34 7,-18 0,-4 Z" fill="#fff6dc" />
			</g>
			<circle cx={0} cy={-124} r={46 * fl} fill="#ffb54d" opacity={0.45 * glow} filter="url(#blur-md)" />
		</g>
	);
};

/** falling snow, `n` flakes per depth band, drifting with the wind */
export const Snow: React.FC<{f: number; n?: number; seed?: string; size?: number; speed?: number; o?: number; w?: number; h?: number; x0?: number; y0?: number}> = ({f, n = 90, seed = 's', size = 1, speed = 1, o = 1, w = W, h = H, x0 = 0, y0 = 0}) => (
	<g>
		{Array.from({length: n}, (_, i) => {
			const z = random(`${seed}z${i}`);
			const vy = (0.8 + z * 1.6) * speed;
			const y = y0 + ((((random(`${seed}y${i}`) * (h + 40) + f * vy) % (h + 40)) + h + 40) % (h + 40)) - 20;
			const x = x0 + ((random(`${seed}x${i}`) * w + Math.sin((f + i * 37) / (40 + z * 30)) * 18 + f * 0.35 * speed) % w);
			return <circle key={i} cx={x} cy={y} r={(0.8 + z * 2.4) * size} fill="#eef3ff" opacity={o * (0.35 + 0.55 * z)} />;
		})}
	</g>
);

/** a page-full of 4-place logarithms: real values */
export const LogRows: React.FC<{x: number; y: number; n0: number; rows?: number; size?: number; fill?: string; o?: number; gap?: number}> = ({x, y, n0, rows = 16, size = 26, fill = '#3a2a1a', o = 0.85, gap}) => (
	<g opacity={o}>
		{Array.from({length: rows}, (_, r) => {
			const n = n0 + r;
			const vals = Array.from({length: 6}, (_, c) => String(Math.round(Math.log10((n * 10 + c * 2) / 1000) * 10000) % 10000).padStart(4, '0'));
			return (
				<text key={r} x={x} y={y + r * (gap ?? size * 1.5)} style={{fontFamily: font.latin, fontWeight: 600, fontSize: size, fill, letterSpacing: '0.06em', fontVariantNumeric: 'lining-nums tabular-nums'}}>
					<tspan fontWeight={700}>{n}</tspan>
					{'   ' + vals.join('  ')}
				</text>
			);
		})}
	</g>
);

// ---------------------------------------------------------------- the book

/**
 * The book lying on a desk, seen from the front and a little above: spine on the
 * left, the tail edge (page bottoms) toward us, so the worn fore-edge stays out of
 * sight until the twist. Origin: front-left bottom corner. `open` 0..1 swings the
 * cover over the spine to the left; then the first page of logarithms shows.
 * `flick` 0..1 riffles a few leaves on the right-hand page.
 */
export const DeskBook: React.FC<{w?: number; h?: number; d?: number; open?: number; flick?: number; id: string}> = ({w = 250, h = 40, d = 150, open = 0, flick = 0}) => {
	const sk = 0.5;
	const dx = d * sk;
	const dy = -d * 0.55;
	const top = -h;
	// cover: right edge sweeps from +w to -w around the spine (x=0)
	const cx = w * Math.cos(open * Math.PI);
	const lift = Math.sin(open * Math.PI) * 120;
	const inside = open > 0.5;
	const quad = (x0: number, x1: number, y: number) => `M${x0},${y} L${x1},${y} L${x1 + dx},${y + dy} L${x0 + dx},${y + dy} Z`;
	return (
		<g>
			<ellipse cx={w / 2 + dx / 2} cy={6} rx={w * 0.75} ry={24} fill="#000" opacity={0.35} filter="url(#blur-md)" />
			{/* back cover lip and the page block (tail toward us, fore-edge to the right) */}
			<path d={quad(-4, w + 4, 2)} fill="#3a2214" />
			<path d={`M${w},0 L${w + dx},${dy} L${w + dx},${dy + top} L${w},${top} Z`} fill="#cbb994" />
			<rect x={0} y={top} width={w} height={h} fill="#e4d6b4" />
			{Array.from({length: 9}, (_, i) => (
				<line key={i} x1={2} y1={top + 4 + i * ((h - 8) / 8)} x2={w - 2} y2={top + 4 + i * ((h - 8) / 8)} stroke="#a8946e" strokeWidth={0.8} opacity={0.6} />
			))}
			{/* spine: rounded leather with raised bands */}
			<path d={`M-10,2 C-22,${top / 2} -22,${top / 2} -10,${top - 2} L${dx - 10},${dy + top - 2} C${dx - 22},${dy + top / 2} ${dx - 22},${dy + top / 2} ${dx - 10},${dy + 2} Z`} fill="#3e2416" />
			{/* the page block top (visible as the cover lifts) */}
			<path d={quad(0, w, top)} fill="#efe4c8" />
			{open > 0.15 ? (
				<g opacity={Math.min(1, (open - 0.15) * 3)}>
					<g transform={`matrix(1,0,${dx / dy},1,0,${top}) translate(0,0)`}>
						{Array.from({length: 7}, (_, r) => (
							<text key={r} x={16 + (-dy - 12 - r * 11) * (dx / -dy)} y={-dy * 0 + (dy + 16 + r * 11)} style={{fontFamily: font.latin, fontWeight: 600, fontSize: 10, fill: '#3a2a1a', fontVariantNumeric: 'lining-nums tabular-nums'}} opacity={0.85}>
								{`${100 + r}  ${Array.from({length: 4}, (_, c) => String(Math.round(Math.log10(((100 + r) * 10 + c * 2) / 1000) * 10000) % 10000).padStart(4, '0')).join(' ')}`}
							</text>
						))}
					</g>
					{flick > 0
						? Array.from({length: 5}, (_, i) => {
								const p = flick * 5 - i;
								if (p <= 0 || p >= 1) return null;
								const fx = w * Math.cos(p * Math.PI);
								const fl = Math.sin(p * Math.PI) * 70;
								return <path key={i} d={`M0,${top} L${fx},${top - fl} L${fx + dx},${top - fl + dy} L${dx},${top + dy} Z`} fill="#f6ecd4" stroke="#cbb994" strokeWidth={1} opacity={0.95} />;
							})
						: null}
				</g>
			) : null}
			{/* the cover, swinging over the spine */}
			<path d={`M0,${top} L${cx},${top - lift} L${cx + dx},${top - lift + dy} L${dx},${top + dy} Z`} fill={inside ? '#d8c8a0' : '#4e2c18'} stroke="#2a160a" strokeWidth={2} strokeLinejoin="round" />
			{!inside && open < 0.3 ? (
				<g opacity={1 - open / 0.3}>
					<path d={`M${w * 0.2 + dx * 0.5},${top + dy * 0.5} l${w * 0.6},0`} stroke={P.brass} strokeWidth={2} opacity={0.6} />
					<text x={w * 0.5 + dx * 0.5} y={top + dy * 0.5 - 8} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 15, letterSpacing: '0.25em', fill: P.brass}} opacity={0.8}>
						LOGARITHMS
					</text>
				</g>
			) : null}
		</g>
	);
};

/**
 * The fore-edge seen straight on, as a macro: thousands of page lines, the wear
 * darkest at the front (left). World units: the block spans [x, x + w].
 */
export const EdgeMacro: React.FC<{x: number; y: number; w: number; h: number; id: string; wear?: number; tabs?: number; lit?: number; dim?: number; ping?: (d: number) => number}> = ({x, y, w, h, id, wear = 1, tabs = 0, lit = 1, dim = 0, ping}) => {
	const lines = 900;
	const cv = Math.min(46, h * 0.1);
	const ex = Math.min(60, w * 0.012);
	const tr = Math.min(54, h * 0.15);
	return (
		<g transform={`translate(${x},${y})`}>
			<defs>
				<WearGradient id={`em-${id}`} max={0.94 * wear} />
				<linearGradient id={`emv-${id}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#000" stopOpacity="0.35" />
					<stop offset="0.12" stopColor="#000" stopOpacity="0" />
					<stop offset="0.85" stopColor="#000" stopOpacity="0" />
					<stop offset="1" stopColor="#000" stopOpacity="0.45" />
				</linearGradient>
			</defs>
			{/* covers */}
			<rect x={-ex} y={-cv} width={w + 2 * ex} height={cv + 4} rx={cv * 0.2} fill="#3c2416" />
			<rect x={-ex} y={-cv} width={w + 2 * ex} height={cv * 0.18} fill="#6a4630" opacity={0.6} />
			<rect x={-ex} y={h - 4} width={w + 2 * ex} height={cv + 4} rx={cv * 0.2} fill="#3c2416" />
			<rect x={0} y={0} width={w} height={h} fill="#eadfc4" />
			{Array.from({length: lines}, (_, i) => {
				const lx = (i / lines) * w + random(`${id}j${i}`) * 2;
				const sh = random(`${id}s${i}`);
				return <line key={i} x1={lx} y1={0} x2={lx} y2={h} stroke={sh > 0.5 ? '#b8a37d' : '#fff8e4'} strokeWidth={sh > 0.5 ? 1.2 : 0.8} opacity={0.35 + 0.3 * sh} />;
			})}
			<rect x={0} y={0} width={w} height={h} fill={`url(#em-${id})`} />
			{/* thumb grime: vertical smears where fingers rest, mostly at the front */}
			{Array.from({length: 46}, (_, i) => {
				const u = Math.pow(random(`${id}g${i}`), 1.8) * 0.42;
				const gx = u * w;
				const gy = h * (0.3 + 0.4 * random(`${id}gy${i}`));
				return <ellipse key={`g${i}`} cx={gx} cy={gy} rx={6 + 10 * random(`${id}gw${i}`)} ry={h * (0.12 + 0.12 * random(`${id}gh${i}`))} fill="#1e1006" opacity={0.12 * wear * wearAt(u)} />;
			})}
			<rect x={0} y={0} width={w} height={h} fill={`url(#emv-${id})`} />
			{/* thumb-index tabs: notches with the section digit */}
			{tabs > 0
				? Array.from({length: 9}, (_, i) => {
						const cx = ((i + 0.5) / 9) * w;
						return (
							<g key={`t${i}`} opacity={tabs}>
								<line x1={((i + 1) / 9) * w} y1={0} x2={((i + 1) / 9) * w} y2={h} stroke="#6a4a2a" strokeWidth={Math.max(0.6, tr * 0.05)} opacity={i < 8 ? 0.5 : 0} />
								{ping && ping(i + 1) > 0 ? <circle cx={cx} cy={tr * 0.3} r={tr * (1.2 + 1.4 * (1 - ping(i + 1)))} fill="none" stroke={GOLD} strokeWidth={tr * 0.12} opacity={ping(i + 1)} /> : null}
								<path d={`M${cx - tr},${-1} A${tr},${tr} 0 0 0 ${cx + tr},${-1} Z`} fill={ping && ping(i + 1) > 0.05 ? '#5a3a14' : '#2e1c10'} />
								<text x={cx} y={tr * 0.62} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: tr * 0.96, fill: ping && ping(i + 1) > 0.05 ? GOLD : '#efe4c8', fontVariantNumeric: 'lining-nums'}}>
									{i + 1}
								</text>
							</g>
						);
					})
				: null}
			{/* light: the lamp from the front-left, falling off to the back */}
			<rect x={-ex} y={-cv} width={w + 2 * ex} height={h + 2 * cv} fill="url(#em-light)" opacity={0.22 * lit} />
			{dim > 0 ? <rect x={-ex} y={-cv} width={w + 2 * ex} height={h + 2 * cv} fill="#05060b" opacity={dim} /> : null}
		</g>
	);
};

/** the episode motif (title + end card): a closed book in gold line, its fore-edge darkest at the front */
export const BookMotif: React.FC<{p?: number; id: string}> = ({p = 1, id}) => {
	const w = 420;
	const h = 92;
	const dx = 70;
	const dy = -46;
	return (
		<g opacity={Math.min(1, p * 2)}>
			<defs>
				<linearGradient id={`bm-${id}`} x1="0" y1="0" x2="1" y2="0">
					{BENF.slice(1).map((v, i) => (
						<React.Fragment key={i}>
							<stop offset={i / 9} stopColor={GOLD} stopOpacity={0.08 + 0.9 * (v / 30.1)} />
							<stop offset={(i + 1) / 9} stopColor={GOLD} stopOpacity={0.08 + 0.9 * (v / 30.1)} />
						</React.Fragment>
					))}
				</linearGradient>
				<clipPath id={`bmc-${id}`}>
					<rect x={-10} y={-80} width={(w + 100) * p} height={200} />
				</clipPath>
			</defs>
			<g transform={`translate(${-w / 2 - dx / 2},${h / 2 - 10})`}>
				<ellipse cx={w * 0.12} cy={h / 2} rx={140} ry={90} fill="url(#glow-lamp)" opacity={0.5 * p} />
				<path d={`M0,0 L${w},0 L${w + dx},${dy} L${dx},${dy} Z`} fill={JUNO.colors.night} stroke={GOLD} strokeWidth={3} strokeLinejoin="round" />
				<path d={`M${w},0 L${w + dx},${dy} L${w + dx},${h + dy} L${w},${h} Z`} fill={JUNO.colors.night} stroke={GOLD} strokeWidth={3} strokeLinejoin="round" />
				<rect x={0} y={0} width={w} height={h} fill={JUNO.colors.night} stroke={GOLD} strokeWidth={3} />
				<g clipPath={`url(#bmc-${id})`}>
					<rect x={0} y={0} width={w} height={h} fill={`url(#bm-${id})`} />
				</g>
				{Array.from({length: 40}, (_, i) => (
					<line key={i} x1={6 + i * 10.4} y1={4} x2={6 + i * 10.4} y2={h - 4} stroke={JUNO.colors.night} strokeWidth={1} opacity={0.35} />
				))}
			</g>
		</g>
	);
};

// ---------------------------------------------------------------- sets

/**
 * Newcomb's study, 1881, at night. Parallax layers: wall with bookcase, star chart
 * and a tall window onto the observatory dome in the snow (0.45), the desk and
 * everything on it (1, hero plane), a chair-back and book spines in the
 * foreground (1.35). `person` is drawn between the wall and the desk.
 */
export const Study1881: React.FC<{f: number; cam?: Cam; person?: React.ReactNode; desk?: React.ReactNode; lamp?: number; front?: boolean; deskY?: number; extra?: React.ReactNode; gust?: number}> = ({
	f,
	cam = CAM0,
	person,
	desk,
	lamp = 1,
	front = true,
	deskY = 760,
	extra,
	gust = 0,
}) => (
	<g>
		<Layer cam={cam} depth={0.45}>
			<rect x={-400} y={-300} width={2720} height={1700} fill="#1e1914" />
			{/* wallpaper stripes */}
			{Array.from({length: 40}, (_, i) => (
				<rect key={i} x={-400 + i * 70} y={-300} width={30} height={1000} fill="#241d17" />
			))}
			<rect x={-400} y={620} width={2720} height={700} fill="#1a130e" />
			<rect x={-400} y={612} width={2720} height={12} fill="#2c2018" />
			{/* bookcase, left */}
			<g transform="translate(-120,40)">
				<rect width={520} height={600} fill="#1a110b" />
				{[0, 1, 2, 3].map((r) => (
					<g key={r}>
						<rect x={10} y={20 + r * 145} width={500} height={10} fill="#2e1e12" />
						{Array.from({length: 22}, (_, i) => {
							const bw = 14 + random(`bk${r}${i}`) * 12;
							const bh = 90 + random(`bh${r}${i}`) * 30;
							const x = 16 + i * 22.5;
							return <rect key={i} x={x} y={30 + r * 145 + (125 - bh)} width={bw} height={bh} fill={['#3a2418', '#2a2c34', '#3a3022', '#4a2a22', '#24302a'][Math.floor(random(`bc${r}${i}`) * 5)]} />;
						})}
					</g>
				))}
			</g>
			{/* star chart in a frame */}
			<g transform="translate(520,140)">
				<rect width={300} height={380} fill="#2a2016" />
				<rect x={14} y={14} width={272} height={352} fill="#c8b890" opacity={0.75} />
				<circle cx={150} cy={190} r={120} fill="none" stroke="#5a4a32" strokeWidth={2} />
				<circle cx={150} cy={190} r={80} fill="none" stroke="#5a4a32" strokeWidth={1} />
				{Array.from({length: 26}, (_, i) => (
					<circle key={i} cx={150 + Math.cos(i * 2.4) * 110 * random(`sc${i}`)} cy={190 + Math.sin(i * 2.4) * 110 * random(`sc${i}`)} r={2 + random(`sr${i}`) * 3} fill="#3a2a1a" />
				))}
				<path d="M60,140 L110,170 L150,150 L200,200 L240,180" stroke="#5a4a32" strokeWidth={1.5} fill="none" />
			</g>
			{/* tall window: the observatory dome in falling snow, moonlight */}
			<g transform="translate(1360,60)">
				<rect width={440} height={540} fill={P.night1} />
				<rect width={440} height={540} fill="url(#sky-night)" />
				<circle cx={330} cy={110} r={34} fill="#e8eef8" opacity={0.85} />
				<circle cx={330} cy={110} r={120} fill="url(#glow-moon)" opacity={0.5} />
				<g fill="#0b0f18">
					<rect x={0} y={380} width={440} height={160} />
					<path d="M110,380 L110,300 A90,90 0 0 1 290,300 L290,380 Z" />
					<rect x={196} y={210} width={10} height={70} transform="rotate(14,200,290)" />
				</g>
				<path d="M110,300 A90,90 0 0 1 290,300" stroke="#c8d6ec" strokeWidth={3} fill="none" opacity={0.6} />
				<rect x={0} y={372} width={440} height={10} fill="#c8d6ec" opacity={0.5} />
				<svg x={0} y={0} width={440} height={540} overflow="hidden">
					<Snow f={f} n={70} seed="win" w={440} h={540} size={0.8} />
				</svg>
				<rect x={-18} y={-18} width={476} height={576} fill="none" stroke="#2c2018" strokeWidth={36} />
				{gust > 0 ? (
					<g>
						{/* the right casement swings in on the gust: cold light and snow pour through */}
						<rect x={220} y={0} width={220} height={540} fill="#c8d6ec" opacity={0.18 * gust} />
						<path d={`M440,0 L${440 - 200 * gust},${-30 * gust} L${440 - 200 * gust},${570 + 30 * gust} L440,540 Z`} fill="#2c2018" opacity={0.95} />
						<path d={`M${440 - 12},0 L${440 - 188 * gust},${-26 * gust} L${440 - 188 * gust},${566 + 26 * gust} L${440 - 12},540 Z`} fill="#9cc0ee" opacity={0.18} />
					</g>
				) : null}
				<line x1={220} y1={0} x2={220} y2={540} stroke="#2c2018" strokeWidth={14} />
				<line x1={0} y1={270} x2={440} y2={270} stroke="#2c2018" strokeWidth={14} />
				<rect x={-60} y={0} width={560} height={720} fill="url(#glow-moon)" opacity={0.18} />
			</g>
			{extra}
			{/* moonlight falling across the wall */}
			<path d="M1360,600 L1800,600 L1500,1000 L1000,1000 Z" fill="#9cc0ee" opacity={0.05} />
		</Layer>
		{person}
		<Layer cam={cam} depth={1}>
			{/* desk */}
			<rect x={-300} y={deskY} width={2520} height={40} fill="#4a2e1a" />
			<rect x={-300} y={deskY} width={2520} height={6} fill="#7a5232" />
			<rect x={-300} y={deskY + 40} width={2520} height={600} fill="#2c1a0e" />
			{Array.from({length: 6}, (_, i) => (
				<rect key={i} x={-200 + i * 420} y={deskY + 70} width={360} height={200} fill="none" stroke="#1a0e06" strokeWidth={4} />
			))}
			{Array.from({length: 6}, (_, i) => (
				<circle key={`k${i}`} cx={-20 + i * 420} cy={deskY + 170} r={9} fill={P.brass} opacity={0.6} />
			))}
			{desk}
		</Layer>
		{/* lamp light on the whole room (warm), plus the moonlit rim from the window */}
		{front ? (
			<Layer cam={cam} depth={1.35}>
				<path d="M-120,1080 C-120,880 -40,820 40,820 C120,820 160,880 160,1080 Z" fill="#0c0805" />
				<path d="M2000,1080 L2000,860 L1800,880 L1760,1080 Z" fill="#0c0805" />
			</Layer>
		) : null}
	</g>
);

/**
 * Washington, a winter night in 1881: the Nautical Almanac Office with an
 * observatory dome, one window lit, a gas lamp at the door, bare trees and an
 * iron railing in the snow. The lit window sits at world (1104, 470).
 */
export const WINDOW_LIT: [number, number] = [1104, 470];
export const Exterior1881: React.FC<{f: number; cam?: Cam}> = ({f, cam = CAM0}) => (
	<g>
		<Layer cam={cam} depth={0}>
			<rect x={-200} y={-200} width={2400} height={1500} fill="url(#sky-night)" />
			{Array.from({length: 110}, (_, i) => (
				<circle key={i} cx={random(`ex${i}`) * 1920} cy={random(`ey${i}`) * 520} r={0.8 + random(`er${i}`) * 1.4} fill="#fff" opacity={0.25 + 0.55 * random(`eo${i}`) * (0.75 + 0.25 * Math.sin(f / 9 + i))} />
			))}
			<circle cx={300} cy={170} r={40} fill="#eef3fb" />
			<circle cx={300} cy={170} r={220} fill="url(#glow-moon)" opacity={0.55} />
		</Layer>
		<Layer cam={cam} depth={0.3}>
			{/* far rooftops and a spire */}
			<path d="M-200,700 L-200,600 L80,600 L80,560 L260,560 L260,620 L420,620 L420,540 L470,470 L520,540 L520,610 L760,610 L760,580 L1300,580 L1300,600 L1600,600 L1600,560 L1820,560 L1820,620 L2200,620 L2200,700 Z" fill="#111827" />
		</Layer>
		<Layer cam={cam} depth={0.6}>
			{/* bare trees */}
			{[120, 1680].map((tx, k) => (
				<g key={tx} stroke="#0d121c" fill="none" strokeLinecap="round">
					<path d={`M${tx},800 L${tx + 6},520`} strokeWidth={22} />
					{Array.from({length: 9}, (_, i) => {
						const y = 560 + i * 26;
						const s = i % 2 ? 1 : -1;
						const L = 110 + random(`tr${k}${i}`) * 80;
						return <path key={i} d={`M${tx + 4},${y} q${s * L * 0.5},-40 ${s * L},-80`} strokeWidth={8 - i * 0.6} />;
					})}
				</g>
			))}
		</Layer>
		<Layer cam={cam} depth={1}>
			{/* the building: brick, three bays, a cornice in snow; the dome on its right wing */}
			<rect x={560} y={300} width={800} height={500} fill="#2a1d1e" />
			{Array.from({length: 25}, (_, r) => (
				<line key={r} x1={560} y1={310 + r * 20} x2={1360} y2={310 + r * 20} stroke="#1f1516" strokeWidth={2} />
			))}
			<rect x={540} y={286} width={840} height={22} fill="#3a2c2c" />
			<rect x={540} y={278} width={840} height={10} fill="#e8eef8" opacity={0.85} />
			<path d="M1180,286 L1180,200 A110,110 0 0 1 1400,200 L1400,286 Z" fill="#2c2426" />
			<path d="M1180,200 A110,110 0 0 1 1400,200" stroke="#e8eef8" strokeWidth={8} fill="none" opacity={0.8} />
			<rect x={1282} y={92} width={16} height={110} fill="#1a1416" transform="rotate(18,1290,200)" />
			{/* windows: two rows of six, one lit */}
			{Array.from({length: 12}, (_, i) => {
				const c = i % 6;
				const r = Math.floor(i / 6);
				const x = 610 + c * 120;
				const y = 360 + r * 190;
				const lit = c === 4 && r === 0;
				return (
					<g key={i}>
						<rect x={x} y={y} width={64} height={130} fill={lit ? '#ffcf7a' : '#0e1220'} />
						{lit ? <rect x={x} y={y} width={64} height={130} fill="#ff9a3d" opacity={0.35 + 0.05 * Math.sin(f / 5)} /> : <rect x={x} y={y} width={64} height={130} fill="#9cc0ee" opacity={0.06} />}
						<line x1={x + 32} y1={y} x2={x + 32} y2={y + 130} stroke="#1a1214" strokeWidth={5} />
						<line x1={x} y1={y + 65} x2={x + 64} y2={y + 65} stroke="#1a1214" strokeWidth={5} />
						<rect x={x - 6} y={y + 128} width={76} height={8} fill="#e8eef8" opacity={0.8} />
						{lit ? (
							<>
								<rect x={x - 400} y={y - 300} width={864} height={730} fill="url(#glow-lamp)" opacity={0.55} />
								{/* a silhouette at the desk inside */}
								<path d={`M${x + 8},${y + 130} L${x + 8},${y + 92} C${x + 8},${y + 74} ${x + 30},${y + 70} ${x + 36},${y + 82} C${x + 44},${y + 78} ${x + 50},${y + 92} ${x + 46},${y + 130} Z`} fill="#3a2414" opacity={0.75} />
							</>
						) : null}
					</g>
				);
			})}
			{/* door with a gas lamp */}
			<rect x={914} y={620} width={92} height={180} fill="#140e0e" />
			<rect x={890} y={600} width={140} height={20} fill="#3a2c2c" />
			<g transform="translate(1080,800)">
				<rect x={-5} y={-230} width={10} height={230} fill="#11141a" />
				<path d="M-22,-262 L22,-262 L16,-230 L-16,-230 Z" fill="#1a1d24" />
				<rect x={-14} y={-258} width={28} height={26} fill="#ffd88a" opacity={0.9 + 0.1 * Math.sin(f / 3.3)} />
				<circle cx={0} cy={-246} r={300} fill="url(#glow-lamp)" opacity={0.6} />
			</g>
			{/* snowy ground and the railing */}
			<path d="M-300,800 L2200,800 L2200,1300 L-300,1300 Z" fill="#1a2232" />
			<path d="M-300,800 C200,790 700,812 1100,798 C1500,786 1900,806 2200,796 L2200,830 L-300,830 Z" fill="#c8d4e6" opacity={0.55} />
			<ellipse cx={1080} cy={830} rx={340} ry={40} fill="#ffcf8a" opacity={0.25} />
		</Layer>
		<Layer cam={cam} depth={1.5}>
			<g stroke="#070a10" strokeWidth={10}>
				{Array.from({length: 30}, (_, i) => (
					<line key={i} x1={-400 + i * 100} y1={1000} x2={-400 + i * 100} y2={860} />
				))}
				<line x1={-400} y1={880} x2={2600} y2={880} strokeWidth={12} />
				<line x1={-400} y1={980} x2={2600} y2={980} strokeWidth={12} />
			</g>
			{Array.from({length: 30}, (_, i) => (
				<path key={`p${i}`} d={`M${-406 + i * 100},862 l6,-22 l6,22 Z`} fill="#070a10" />
			))}
			<rect x={-400} y={874} width={3000} height={6} fill="#c8d4e6" opacity={0.45} />
		</Layer>
	</g>
);

// ---------------------------------------------------------------- camera

/** a camera key: [frame, x, y, zoom] in hero-plane coordinates */
export type Key = [number, number, number, number];

/**
 * Velocity-continuous camera through keys (Catmull–Rom on x, y and log-zoom):
 * no stop-and-go between moves, so a shot flows from one framing into the next.
 */
export const camPath = (keys: Key[], f: number): Cam => {
	const n = keys.length;
	const val = (k: Key, c: number) => (c === 3 ? Math.log(k[3]) : k[c]);
	if (f <= keys[0][0]) return lookAtZ(keys[0][1], keys[0][2], keys[0][3]);
	if (f >= keys[n - 1][0]) return lookAtZ(keys[n - 1][1], keys[n - 1][2], keys[n - 1][3]);
	let i = 0;
	while (i < n - 2 && f >= keys[i + 1][0]) i++;
	const p0 = keys[Math.max(0, i - 1)];
	const p1 = keys[i];
	const p2 = keys[i + 1];
	const p3 = keys[Math.min(n - 1, i + 2)];
	const dt = p2[0] - p1[0];
	const t = (f - p1[0]) / dt;
	const out = [0, 0, 0, 0];
	for (let c = 1; c <= 3; c++) {
		const m1 = p0 === p1 ? 0 : ((val(p2, c) - val(p0, c)) / (p2[0] - p0[0])) * dt;
		const m2 = p3 === p2 ? 0 : ((val(p3, c) - val(p1, c)) / (p3[0] - p1[0])) * dt;
		const t2 = t * t;
		const t3 = t2 * t;
		out[c] = (2 * t3 - 3 * t2 + 1) * val(p1, c) + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * val(p2, c) + (t3 - t2) * m2;
	}
	return lookAtZ(out[1], out[2], Math.exp(out[3]));
};
const lookAtZ = (tx: number, ty: number, zoom: number): Cam => ({x: (tx - 960) * zoom, y: (ty - 540) * zoom, zoom});

/** screen-space speed of the camera (px/frame), for motion blur */
export const camSpeed = (keys: Key[], f: number): [number, number] => {
	const a = camPath(keys, f - 1);
	const b = camPath(keys, f + 1);
	const ta = [a.x / a.zoom, a.y / a.zoom];
	const tb = [b.x / b.zoom, b.y / b.zoom];
	const z = (a.zoom + b.zoom) / 2;
	const zr = Math.abs(Math.log(b.zoom / a.zoom)) * 120;
	return [Math.abs(tb[0] - ta[0]) * z * 0.5 + zr, Math.abs(tb[1] - ta[1]) * z * 0.5 + zr];
};

// ---------------------------------------------------------------- the log table on the desk, fore-edge to camera

/** world placement of the 1881 book's fore-edge on Newcomb's desk */
export const BOOK = {x: 990, y: 694, w: 330, h: 66};
export const sectionX = (d: number, b = BOOK) => b.x + ((d - 0.5) / 9) * b.w;

/** a closed book lying on the desk, its worn fore-edge toward us (world coords from `b`) */
export const BookFront: React.FC<{b?: typeof BOOK; id: string; wear?: number; tabs?: number; ping?: (d: number) => number; children?: React.ReactNode}> = ({b = BOOK, id, wear = 1, tabs = 1, ping, children}) => {
	const dx = 46;
	const dy = -30;
	return (
		<g>
			<ellipse cx={b.x + b.w / 2 + 20} cy={b.y + b.h + 4} rx={b.w * 0.62} ry={14} fill="#000" opacity={0.45} filter="url(#blur-md)" />
			<path d={`M${b.x + b.w},${b.y} L${b.x + b.w + dx},${b.y + dy} L${b.x + b.w + dx},${b.y + b.h + dy} L${b.x + b.w},${b.y + b.h} Z`} fill="#b8a582" />
			<path d={`M${b.x - 4},${b.y - 6} L${b.x + b.w + 4},${b.y - 6} L${b.x + b.w + 4 + dx},${b.y - 6 + dy} L${b.x - 4 + dx},${b.y - 6 + dy} Z`} fill="#4e2c18" stroke="#2a160a" strokeWidth={1.5} />
			<text x={b.x + b.w / 2 + dx / 2} y={b.y - 6 + dy / 2 + 4} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 11, letterSpacing: '0.3em', fill: P.brass}} opacity={0.8}>
				LOGARITHMS
			</text>
			<EdgeMacro x={b.x} y={b.y} w={b.w} h={b.h} id={id} wear={wear} tabs={tabs} ping={ping} />
			{children}
		</g>
	);
};

// ---------------------------------------------------------------- the break: snowy sky → archive → Benford's lab, 1938

export const LAB_BOOK = {x: 1000, y: 694, w: 330, h: 66};

/**
 * One continuous world for the silent break. Above (y < -200): the night sky the
 * pages flew into, snowing. Left (x < 640): the journal archive, shelves of bound
 * volumes and the stack where Newcomb's note comes to rest. Right: Benford's desk
 * at General Electric, 1938, an electric lamp that switches on (`lamp`).
 */
export const BreakWorld: React.FC<{f: number; cam: Cam; lamp: number; person?: React.ReactNode; desk?: React.ReactNode}> = ({f, cam, lamp, person, desk}) => (
	<g>
		<Layer cam={cam} depth={0.35}>
			<rect x={-3000} y={-3000} width={7000} height={7000} fill="#07090f" />
			<rect x={-3000} y={-2200} width={7000} height={1900} fill="url(#sky-night)" />
		</Layer>
		<Layer cam={cam} depth={0.55}>
			{/* archive shelves */}
			{Array.from({length: 5}, (_, r) => (
				<g key={r}>
					<rect x={-1500} y={90 + r * 190} width={2140} height={12} fill="#20170f" />
					{Array.from({length: 54}, (_, i) => {
						const hh = 120 + random(`ah${r}${i}`) * 50;
						return <rect key={i} x={-1490 + i * 39} y={90 + r * 190 - hh} width={34} height={hh} fill={['#2a2018', '#33281c', '#241c16', '#3a2c20', '#2c2a24'][Math.floor(random(`ac${r}${i}`) * 5)]} />;
					})}
				</g>
			))}
			<rect x={-1500} y={-100} width={2140} height={1300} fill="#0b0d14" opacity={0.35} />
			{/* the lab wall, window onto the plant at night */}
			<rect x={640} y={-200} width={2600} height={1400} fill="#151a1f" />
			{Array.from({length: 12}, (_, i) => (
				<rect key={i} x={640 + i * 220} y={-200} width={4} height={1400} fill="#0e1216" />
			))}
			<g transform="translate(1720,80)">
				<rect width={600} height={460} fill="#0d1424" />
				{[[60, 140], [200, 200], [380, 120], [480, 170]].map(([sx, sh], i) => (
					<g key={i}>
						<rect x={sx} y={460 - sh} width={36} height={sh} fill="#05070c" />
						{Array.from({length: 5}, (_, k) => (
							<circle key={k} cx={sx + 18 + Math.sin((f + k * 20 + i * 7) / 18) * 10 + k * 8} cy={460 - sh - 20 - k * 26 - ((f * 0.4 + k * 26) % 26)} r={14 + k * 5} fill="#2a3040" opacity={0.35 - k * 0.05} />
						))}
					</g>
				))}
				<rect y={380} width={600} height={80} fill="#05070c" />
				{Array.from({length: 7}, (_, i) => (
					<rect key={i} x={i * 100} y={0} width={8} height={460} fill="#2a2f36" />
				))}
				{Array.from({length: 5}, (_, i) => (
					<rect key={`h${i}`} x={0} y={i * 115} width={600} height={8} fill="#2a2f36" />
				))}
			</g>
			{/* shelf of apparatus */}
			<g transform="translate(820,300)">
				<rect width={520} height={12} fill="#2a2f36" />
				{[30, 110, 190, 290, 380, 450].map((bx, i) => (
					<path key={i} d={`M${bx},0 L${bx},-${50 + (i % 3) * 20} L${bx + 30},-${50 + (i % 3) * 20} L${bx + 30},0 Z`} fill="#3a5560" opacity={0.6} />
				))}
			</g>
			<rect x={640} y={-200} width={2600} height={1400} fill="#ffcf8a" opacity={0.05 * lamp} />
		</Layer>
		{person}
		<Layer cam={cam} depth={1}>
			{/* journal stack in the archive: the note lands on top (top at y=690) */}
			<g transform="translate(300,760)">
				{Array.from({length: 7}, (_, i) => (
					<rect key={i} x={-130 + (i % 2) * 6} y={-10 - i * 10} width={260} height={10} fill={['#3a2a1c', '#4a3422', '#2e2216'][i % 3]} />
				))}
				<rect x={-160} y={0} width={320} height={300} fill="#1a120c" />
			</g>
			{/* Benford's desk */}
			<rect x={700} y={760} width={2600} height={40} fill="#3a2a1e" />
			<rect x={700} y={760} width={2600} height={6} fill="#6a4a32" />
			<rect x={700} y={800} width={2600} height={600} fill="#21170f" />
			{desk}
			{/* the gooseneck lamp */}
			<g transform="translate(2020,760)">
				<ellipse cx={0} cy={0} rx={60} ry={12} fill="#1e2a22" />
				<path d="M0,0 C0,-120 -40,-200 -120,-230" stroke="#2a3a2e" strokeWidth={10} fill="none" />
				<path d="M-170,-250 L-80,-250 L-60,-200 L-190,-200 Z" fill="#2f5a3a" />
				<ellipse cx={-125} cy={-200} rx={62} ry={10} fill={lamp > 0.5 ? '#fff4d6' : '#3a3a30'} />
				<circle cx={-125} cy={-120} r={560} fill="url(#glow-lamp)" opacity={0.75 * lamp} />
			</g>
		</Layer>
		<rect x={0} y={0} width={W} height={H} fill="#05060b" opacity={0.35 * (1 - lamp)} />
	</g>
);
