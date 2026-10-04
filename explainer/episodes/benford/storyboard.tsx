import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {Figure, POSES, type Look, type Pose} from '../../src/art/Figure';
import {Materials} from '../../src/art/materials';
import {P} from '../../src/art/palette';
import {GlowDefs, Finish, Motes} from '../../src/art/glow/kit';
import {Monogram} from '../../src/brand/Brand';
import {JUNO} from '../../src/brand/identity';
import {loadEpisodeFonts} from '../../src/lib/fonts';
import {font} from '../../src/lib/theme';

/**
 * 《第一位数字》 storyboard: one key frame per shot. Set, light and staging are
 * roughed in with the shared rig and palette; the white dashed arrows are the
 * camera move, the pink tags are what lands on the music, the strip at the top
 * is shot / time / beat, and the subtitle is drawn where it will sit.
 * Render: COMPOSITION=BenfordBoard node scripts/stills.mjs benford <dir> 0 1 2 ...
 */

const W = 1920;
const H = 1080;
const GOLD = JUNO.colors.gold;
const CREAM = JUNO.colors.ink;
const RED = P.red;
const LOG1 = [0, 30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6]; // Benford P(d), %

// ---------------------------------------------------------------- the cast

const NEWCOMB: Look = {skin: P.skin1, hair: 'short', hairColor: '#6a625a', outfit: 'frock', top: '#2a2d36', bottom: '#202228', accent: '#5a4a3a', mustache: true};
const BENFORD: Look = {skin: P.skin1, hair: 'slick', hairColor: P.hairGray, outfit: 'suit', top: '#4a4238', bottom: '#2f2a26', accent: '#6e4a2a', glasses: true};
const CLERK93: Look = {skin: P.skin2, hair: 'short', hairColor: P.hairBrown, outfit: 'suit', top: '#3d4a5e', bottom: '#2a2f3a', accent: '#8a2c2c'};

/** Newcomb's full beard: drawn over the rig head (the rig has a moustache only; the beard is a new rig option to add). */
const Beard: React.FC = () => (
	<path d="M-14,-300 C-16,-276 -4,-258 14,-256 C32,-258 40,-276 36,-300 C30,-288 22,-286 12,-288 C2,-286 -8,-290 -14,-300 Z" fill="#7a7068" />
);

const Person: React.FC<{look: Look; x: number; y: number; s?: number; pose?: Pose; flip?: boolean; back?: boolean; beard?: boolean; expression?: 'neutral' | 'surprise' | 'thinking' | 'stern' | 'worried' | 'smile'; reach?: {near?: [number, number]; far?: [number, number]}; rim?: 'cool' | 'warm' | 'moon' | 'none'; sil?: string}> = ({
	look,
	x,
	y,
	s = 1,
	pose,
	flip,
	back,
	beard,
	expression,
	reach,
	rim = 'warm',
	sil,
}) => (
	<g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
		<Figure look={look} pose={pose} flip={false} facing={back ? 'back' : 'side'} expression={expression} reach={reach} rim={rim} silhouette={sil} />
		{beard && !back && !sil ? null : null}
	</g>
);

// ---------------------------------------------------------------- annotation

const Arrow: React.FC<{d: string; label?: string; lx?: number; ly?: number}> = ({d, label, lx = 0, ly = 0}) => (
	<g>
		<defs>
			<marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
				<path d="M0,0 L10,5 L0,10 z" fill="#ffffff" />
			</marker>
		</defs>
		<path d={d} fill="none" stroke="#ffffff" strokeWidth={5} strokeDasharray="20 12" markerEnd="url(#ah)" opacity={0.9} />
		{label ? (
			<g>
				<rect x={lx - 10} y={ly - 34} width={label.length * 28 + 26} height={46} rx={8} fill="#000" opacity={0.62} />
				<text x={lx + 4} y={ly} style={{fontFamily: font.sans, fontWeight: 700, fontSize: 27, fill: '#ffffff'}}>
					{label}
				</text>
			</g>
		) : null}
	</g>
);

const Beat: React.FC<{x: number; y: number; label: string}> = ({x, y, label}) => (
	<g>
		<rect x={x - 10} y={y - 38} width={label.length * 28 + 70} height={52} rx={26} fill="#ff4d6d" opacity={0.92} />
		<text x={x + 10} y={y} style={{fontFamily: font.sans, fontWeight: 800, fontSize: 28, fill: '#fff'}}>
			♪ {label}
		</text>
	</g>
);

const Note: React.FC<{x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end'}> = ({x, y, text, anchor = 'start'}) => (
	<text x={x} y={y} textAnchor={anchor} style={{fontFamily: font.sans, fontWeight: 700, fontSize: 26, fill: '#ffffff'}} opacity={0.85}>
		{text}
	</text>
);

/** subtitle as it will sit on screen: cream serif, [gold] answer, {red} trap */
const Sub: React.FC<{text: string}> = ({text}) => {
	if (!text) return null;
	const parts = text.split(/(\[[^\]]+\]|\{[^}]+\})/).filter(Boolean);
	return (
		<g>
			<rect x={0} y={940} width={W} height={140} fill="url(#sub-fade)" />
			<text x={960} y={1010} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 700, fontSize: 50, fill: CREAM, letterSpacing: '0.04em'}}>
				{parts.map((p, i) =>
					p.startsWith('[') ? (
						<tspan key={i} fill={GOLD}>
							{p.slice(1, -1)}
						</tspan>
					) : p.startsWith('{') ? (
						<tspan key={i} fill={RED}>
							{p.slice(1, -1)}
						</tspan>
					) : (
						<tspan key={i}>{p}</tspan>
					),
				)}
			</text>
		</g>
	);
};

/** the shot strip (board only) and the corner mark (as it will be in the film) */
const Slate: React.FC<{n: number; t: string; beat: string; mark?: boolean}> = ({n, t, beat, mark = true}) => (
	<g>
		<rect x={28} y={24} width={560} height={54} rx={10} fill="#000" opacity={0.66} />
		<text x={48} y={62} style={{fontFamily: font.latin, fontWeight: 700, fontSize: 34, fill: '#ffffff'}}>
			{`S${String(n).padStart(2, '0')}`}
		</text>
		<text x={124} y={61} style={{fontFamily: font.sans, fontWeight: 700, fontSize: 26, fill: '#ffd0da'}}>
			{`${t}  ·  ${beat}`}
		</text>
		{mark ? (
			<text x={1880} y={52} textAnchor="end" style={{fontFamily: font.sans, fontSize: 20, fill: CREAM, letterSpacing: '0.08em'}} opacity={0.55}>
				{`◆ ${JUNO.mark}`}
			</text>
		) : null}
	</g>
);

// ---------------------------------------------------------------- props and sets

/** an oil lamp: brass font, glass chimney, flame and its pool of light */
const OilLamp: React.FC<{x: number; y: number; s?: number; glow?: number}> = ({x, y, s = 1, glow = 1}) => (
	<g transform={`translate(${x},${y}) scale(${s})`}>
		<circle cx={0} cy={-120} r={520} fill="url(#glow-lamp)" opacity={0.55 * glow} />
		<ellipse cx={0} cy={0} rx={62} ry={14} fill="#5a3d1c" />
		<path d="M-40,0 C-46,-30 -30,-58 0,-62 C30,-58 46,-30 40,0 Z" fill="url(#brass)" />
		<rect x={-14} y={-76} width={28} height={16} fill="#7d5420" />
		<path d="M-22,-76 C-34,-110 -30,-150 -16,-190 L16,-190 C30,-150 34,-110 22,-76 Z" fill="#fff2d0" opacity={0.18} stroke="#fff2d0" strokeOpacity={0.35} strokeWidth={2} />
		<path d="M0,-84 C-12,-104 -6,-126 0,-140 C6,-126 12,-104 0,-84 Z" fill="#ffe7a8" filter="url(#g-sm)" />
		<circle cx={0} cy={-112} r={40} fill="#ffb54d" opacity={0.5 * glow} filter="url(#g-md)" />
	</g>
);

/** fore-edge view of the log-table book: front pages left; wear follows Benford, section by section */
const EdgeBook: React.FC<{x: number; y: number; w?: number; h?: number; wear?: number; tabs?: boolean; gold?: boolean; id: string}> = ({x, y, w = 700, h = 300, wear = 1, tabs, gold, id}) => {
	const sec = w / 9;
	const ink = gold ? GOLD : '#2a1a0c';
	return (
		<g transform={`translate(${x},${y})`}>
			<defs>
				<linearGradient id={`wear-${id}`} x1="0" y1="0" x2="1" y2="0">
					{LOG1.slice(1).map((p, i) => (
						<React.Fragment key={i}>
							<stop offset={i / 9} stopColor={ink} stopOpacity={(gold ? 1 : 0.92) * wear * (p / 30.1)} />
							<stop offset={(i + 1) / 9} stopColor={ink} stopOpacity={(gold ? 1 : 0.92) * wear * (p / 30.1)} />
						</React.Fragment>
					))}
				</linearGradient>
			</defs>
			{!gold ? <rect x={-18} y={-10} width={w + 36} height={h + 20} rx={6} fill="#4a2a18" /> : null}
			<rect x={0} y={0} width={w} height={h} fill={gold ? 'none' : '#e9dcc0'} stroke={gold ? GOLD : 'none'} strokeWidth={3} />
			{Array.from({length: Math.floor(w / 4)}, (_, i) => (
				<line key={i} x1={i * 4} y1={2} x2={i * 4} y2={h - 2} stroke={gold ? GOLD : '#b9a682'} strokeWidth={1} opacity={gold ? 0.25 : 0.45} />
			))}
			<rect x={0} y={0} width={w} height={h} fill={`url(#wear-${id})`} />
			{!gold
				? Array.from({length: 14}, (_, i) => (
						<ellipse key={i} cx={random(`${id}t${i}`) * w * 0.3} cy={h * (0.25 + 0.5 * random(`${id}u${i}`))} rx={Math.max(3, w * 0.006)} ry={h * 0.09} fill="#1a0f06" opacity={0.16 * wear} />
					))
				: null}
			{tabs
				? Array.from({length: 9}, (_, i) => (
						<g key={i}>
							<line x1={(i + 1) * sec} y1={-4} x2={(i + 1) * sec} y2={h + 4} stroke="#7a5a32" strokeWidth={i === 8 ? 0 : 2} opacity={0.7} />
							<circle cx={(i + 0.5) * sec} cy={-2} r={26} fill="#3a2414" />
							<text x={(i + 0.5) * sec} y={8} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 32, fill: '#e9dcc0'}}>
								{i + 1}
							</text>
						</g>
					))
				: null}
		</g>
	);
};

/** the episode motif: a closed book whose fore-edge is darkest at the front, in brand gold */
const BookMotif: React.FC<{x: number; y: number; s?: number; id: string}> = ({x, y, s = 1, id}) => {
	const w = 420;
	const h = 92;
	const dx = 70;
	const dy = -46;
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			<defs>
				<linearGradient id={`bm-${id}`} x1="0" y1="0" x2="1" y2="0">
					{LOG1.slice(1).map((p, i) => (
						<React.Fragment key={i}>
							<stop offset={i / 9} stopColor={GOLD} stopOpacity={0.08 + 0.9 * (p / 30.1)} />
							<stop offset={(i + 1) / 9} stopColor={GOLD} stopOpacity={0.08 + 0.9 * (p / 30.1)} />
						</React.Fragment>
					))}
				</linearGradient>
			</defs>
			<ellipse cx={w * 0.12} cy={h / 2} rx={130} ry={90} fill="url(#glow-lamp)" opacity={0.5} />
			<path d={`M0,0 L${w},0 L${w + dx},${dy} L${dx},${dy} Z`} fill={JUNO.colors.night} stroke={GOLD} strokeWidth={3} strokeLinejoin="round" />
			<path d={`M${w},0 L${w + dx},${dy} L${w + dx},${h + dy} L${w},${h} Z`} fill={JUNO.colors.night} stroke={GOLD} strokeWidth={3} strokeLinejoin="round" />
			<rect x={0} y={0} width={w} height={h} fill={`url(#bm-${id})`} stroke={GOLD} strokeWidth={3} />
			{Array.from({length: 40}, (_, i) => (
				<line key={i} x1={6 + i * 10.4} y1={4} x2={6 + i * 10.4} y2={h - 4} stroke={JUNO.colors.night} strokeWidth={1} opacity={0.35} />
			))}
		</g>
	);
};

/** an open log table, rows of real log10 values (4-place) */
const OpenTable: React.FC<{x: number; y: number; s?: number; start?: number; worn?: number}> = ({x, y, s = 1, start = 100, worn = 0.6}) => {
	const rows = (n0: number) =>
		Array.from({length: 14}, (_, r) => {
			const n = n0 + r;
			const vals = Array.from({length: 5}, (_, c) => Math.round(Math.log10((n * 10 + c * 2) / 1000) * 10000) % 10000);
			return `${n}  ${vals.map((v) => String(v).padStart(4, '0')).join(' ')}`;
		});
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			<path d="M-470,20 L-10,0 L-10,560 L-480,590 Z" fill="#e6d7b6" />
			<path d="M10,0 L470,20 L480,590 L10,560 Z" fill="#efe3c6" />
			<path d="M-10,0 L10,0 L10,560 L-10,560 Z" fill="#a8906a" />
			<path d="M-470,20 L-10,0 L-10,560 L-480,590 Z" fill="#3a2410" opacity={0.28 * worn} />
			{rows(start).map((t, i) => (
				<text key={`l${i}`} x={-440} y={70 + i * 36} style={{fontFamily: 'monospace', fontSize: 23, fill: '#3a2a1a', letterSpacing: '0.04em'}} opacity={0.85}>
					{t}
				</text>
			))}
			{rows(start + 14).map((t, i) => (
				<text key={`r${i}`} x={40} y={78 + i * 36} style={{fontFamily: 'monospace', fontSize: 23, fill: '#3a2a1a', letterSpacing: '0.04em'}} opacity={0.85}>
					{t}
				</text>
			))}
			<text x={-440} y={40} style={{fontFamily: font.latin, fontWeight: 700, fontSize: 24, fill: '#5a3d1c', letterSpacing: '0.2em'}}>
				LOGARITHMS
			</text>
		</g>
	);
};

/** a study at night: panelled wall, a tall window, desk top; one warm lamp, cool window */
const Study: React.FC<{year?: '1881' | '1938'; children?: React.ReactNode; window?: boolean; dawn?: number}> = ({year = '1881', children, window = true, dawn = 0}) => (
	<g>
		<rect width={W} height={H} fill={year === '1881' ? '#1d1712' : '#191b1f'} />
		<rect y={560} width={W} height={520} fill={year === '1881' ? '#241a12' : '#202226'} />
		{Array.from({length: 13}, (_, i) => (
			<rect key={i} x={20 + i * 150} y={600} width={120} height={200} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={3} />
		))}
		{window ? (
			<g transform="translate(1340,90)">
				<rect width={420} height={470} fill={dawn ? '#3a4a6a' : P.night2} />
				<rect width={420} height={470} fill="url(#sky-night)" opacity={1 - dawn} />
				{dawn ? <rect y={300} width={420} height={170} fill="#c98a5a" opacity={0.5 * dawn} /> : null}
				{year === '1881' ? (
					<g fill="#0b0f18">
						<rect x={0} y={330} width={420} height={140} />
						<path d="M120,330 L120,250 A70,70 0 0 1 260,250 L260,330 Z" />
						<rect x={186} y={150} width={8} height={60} />
					</g>
				) : (
					<g fill="#0b0f18">
						<rect x={0} y={350} width={420} height={120} />
						<rect x={60} y={220} width={70} height={140} />
						<rect x={160} y={170} width={44} height={190} />
						<rect x={250} y={260} width={150} height={100} />
						<rect x={274} y={120} width={22} height={150} />
					</g>
				)}
				{Array.from({length: 30}, (_, i) => (
					<circle key={i} cx={random(`st${i}`) * 420} cy={random(`sy${i}`) * 220} r={1.4} fill="#fff" opacity={(0.4 + 0.5 * random(`so${i}`)) * (1 - dawn)} />
				))}
				<rect x={-14} y={-14} width={448} height={498} fill="none" stroke="#2c2018" strokeWidth={28} />
				<line x1={210} y1={0} x2={210} y2={470} stroke="#2c2018" strokeWidth={12} />
				<line x1={0} y1={235} x2={420} y2={235} stroke="#2c2018" strokeWidth={12} />
				<rect x={-40} y={0} width={500} height={470} fill="url(#glow-moon)" opacity={0.25} />
			</g>
		) : null}
		{children}
	</g>
);

/** a desk top in shallow perspective */
const Desk: React.FC<{y?: number; tone?: string}> = ({y = 720, tone = '#3a2618'}) => (
	<g>
		<path d={`M-40,${y} L1960,${y} L1960,1100 L-40,1100 Z`} fill={tone} />
		<path d={`M-40,${y} L1960,${y}`} stroke="#6a4a2e" strokeWidth={4} />
		{Array.from({length: 7}, (_, i) => (
			<path key={i} d={`M-40,${y + 40 + i * 50} C600,${y + 30 + i * 52} 1300,${y + 50 + i * 48} 1960,${y + 36 + i * 52}`} stroke="#000" strokeOpacity={0.12} strokeWidth={3} fill="none" />
		))}
	</g>
);

/** a wooden tin / card box labelled with a digit, cards piled to `fill` */
const Tin: React.FC<{x: number; y: number; d: number; fill: number; hl?: string}> = ({x, y, d, fill, hl}) => (
	<g transform={`translate(${x},${y})`}>
		{Array.from({length: Math.round(fill * 12)}, (_, i) => (
			<rect key={i} x={-58 + random(`c${d}${i}`) * 10} y={-24 - i * 13 - (i > 8 ? 4 : 0)} width={104} height={14} rx={2} fill={i % 2 ? '#efe6d2' : '#ddd0b2'} transform={`rotate(${(random(`r${d}${i}`) - 0.5) * (i > 8 ? 22 : 6)})`} />
		))}
		<path d="M-70,-30 L70,-30 L64,60 L-64,60 Z" fill="url(#wood)" />
		<rect x={-70} y={-34} width={140} height={10} fill="#6a4a2e" />
		<rect x={-26} y={-6} width={52} height={44} rx={4} fill="#efe6d2" />
		<text x={0} y={30} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 40, fill: hl ?? '#2a2018'}}>
			{d}
		</text>
	</g>
);

/** night town street for the growth toy model */
const Town: React.FC<{houses: number; children?: React.ReactNode}> = ({houses, children}) => (
	<g>
		<rect width={W} height={H} fill="url(#sky-night)" />
		{Array.from({length: 60}, (_, i) => (
			<circle key={i} cx={random(`ts${i}`) * W} cy={random(`ty${i}`) * 420} r={1.5} fill="#fff" opacity={0.3 + 0.5 * random(`to${i}`)} />
		))}
		<path d="M0,640 C400,600 800,630 1200,610 C1500,596 1700,620 1920,600 L1920,1080 L0,1080 Z" fill="#141c2c" />
		{Array.from({length: houses}, (_, i) => {
			const x = 80 + ((i * 137) % 1760);
			const row = Math.floor((i * 137) / 1760);
			const y = 650 - row * 34;
			const w = 70 + random(`hw${i}`) * 50;
			const h = 60 + random(`hh${i}`) * 50;
			return (
				<g key={i} opacity={1 - row * 0.18}>
					<rect x={x} y={y - h} width={w} height={h} fill="#1c2436" />
					<path d={`M${x - 6},${y - h} L${x + w / 2},${y - h - 34} L${x + w + 6},${y - h} Z`} fill="#161d2c" />
					<rect x={x + w * 0.3} y={y - h * 0.65} width={14} height={16} fill={P.lamp} opacity={random(`hl${i}`) > 0.35 ? 0.85 : 0.1} />
				</g>
			);
		})}
		<rect y={760} width={W} height={320} fill="#0e131e" />
		{children}
	</g>
);

/** the population sign on a post, lit by a street lamp */
const Sign: React.FC<{x: number; y: number; n: string; sub?: string; roll?: boolean}> = ({x, y, n, sub = '人口', roll}) => (
	<g transform={`translate(${x},${y})`}>
		<circle cx={-170} cy={-430} r={360} fill="url(#glow-lamp)" opacity={0.5} />
		<rect x={-176} y={-460} width={10} height={460} fill="#20242c" />
		<path d="M-171,-460 L-120,-460" stroke="#20242c" strokeWidth={8} />
		<path d="M-140,-460 L-100,-460 L-110,-440 L-130,-440 Z" fill="#2a2a2a" />
		<circle cx={-120} cy={-436} r={10} fill="#ffe2a0" filter="url(#g-sm)" />
		<rect x={-20} y={-200} width={12} height={200} fill="#3a2a1c" />
		<rect x={220} y={-200} width={12} height={200} fill="#3a2a1c" />
		<rect x={-70} y={-330} width={350} height={160} rx={8} fill="#e9dcc0" />
		<rect x={-60} y={-320} width={330} height={140} rx={6} fill="none" stroke="#5a3d1c" strokeWidth={3} />
		<text x={105} y={-282} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 700, fontSize: 30, fill: '#5a3d1c'}}>
			{sub}
		</text>
		<text x={105} y={-205} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 82, fill: '#2a1a0c'}}>
			<tspan fill={roll ? '#2a1a0c' : P.brass}>{n[0]}</tspan>
			{n.slice(1)}
		</text>
		{roll ? <rect x={-50} y={-268} width={310} height={80} fill="#e9dcc0" opacity={0.0} /> : null}
	</g>
);

/** Benford's bars as a staircase of light */
const Stairs: React.FC<{x: number; y: number; w?: number; h?: number; labels?: boolean; outline?: boolean; color?: string; hi?: number[]}> = ({x, y, w = 1200, h = 520, labels = true, outline, color = CREAM, hi = [1, 9]}) => {
	const bw = w / 9;
	return (
		<g transform={`translate(${x},${y})`}>
			{LOG1.slice(1).map((p, i) => {
				const d = i + 1;
				const bh = (p / 30.1) * h;
				const isHi = hi.includes(d);
				const c = isHi ? GOLD : color;
				return (
					<g key={d}>
						{isHi && !outline ? <rect x={i * bw + 8} y={-bh - 30} width={bw - 16} height={bh + 30} fill={GOLD} opacity={0.25} filter="url(#g-lg)" /> : null}
						<rect x={i * bw + 10} y={-bh} width={bw - 20} height={bh} fill={outline ? 'none' : c} opacity={outline ? 1 : isHi ? 0.95 : 0.35} stroke={outline ? GOLD : 'none'} strokeWidth={4} strokeDasharray={outline ? '10 8' : undefined} />
						{labels ? (
							<>
								<text x={i * bw + bw / 2} y={52} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 46, fill: isHi ? GOLD : CREAM}}>
									{d}
								</text>
								<text x={i * bw + bw / 2} y={-bh - 18} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: isHi ? 44 : 30, fill: isHi ? GOLD : CREAM}} opacity={isHi ? 1 : 0.7}>
									{`${p}%`}
								</text>
							</>
						) : null}
					</g>
				);
			})}
		</g>
	);
};

/** a cheque with its amount; the first digit can be flagged red */
const Cheque: React.FC<{x: number; y: number; rot?: number; amt: string; flag?: number}> = ({x, y, rot = 0, amt, flag = 0}) => (
	<g transform={`translate(${x},${y}) rotate(${rot})`}>
		<rect x={-230} y={-90} width={460} height={180} rx={6} fill="#dfe6d8" />
		<rect x={-230} y={-90} width={460} height={180} rx={6} fill="none" stroke="#7a8a72" strokeWidth={2} />
		<text x={-206} y={-52} style={{fontFamily: font.latin, fontWeight: 700, fontSize: 22, fill: '#4a5a44', letterSpacing: '0.18em'}}>
			PAY TO THE ORDER OF
		</text>
		<line x1={-206} y1={-10} x2={120} y2={-10} stroke="#7a8a72" strokeWidth={2} />
		<rect x={70} y={10} width={140} height={50} fill="none" stroke="#7a8a72" strokeWidth={2} />
		<text x={-206} y={50} style={{fontFamily: font.latin, fontWeight: 700, fontSize: 46, fill: '#22301e'}}>
			$<tspan fill={flag ? RED : '#22301e'}>{amt[0]}</tspan>
			{amt.slice(1)}
		</text>
		{flag ? <circle cx={-162} cy={34} r={34} fill="none" stroke={RED} strokeWidth={5} opacity={flag} filter="url(#g-sm)" /> : null}
	</g>
);

const Kicker: React.FC<{text: string}> = ({text}) => (
	<text x={150} y={150} style={{fontFamily: font.sans, fontSize: 24, letterSpacing: '0.18em', fill: CREAM}} opacity={0.6}>
		{text}
	</text>
);

// ---------------------------------------------------------------- the panels

type Panel = {t: string; beat: string; sub: string; mark?: boolean; art: () => React.ReactNode};

const S: Panel[] = [
	// ===== 1 hook (cold open, already moving, no logo)
	{
		t: '0:00',
		beat: '钩子 · 冷开场',
		sub: '这本书，前几页被翻黑了。',
		art: () => (
			<>
				<rect width={W} height={H} fill="#120c08" />
				<circle cx={300} cy={260} r={900} fill="url(#glow-lamp)" opacity={0.6} />
				<g transform="translate(-200,180) scale(3.2)">
					<EdgeBook id="hk" x={0} y={0} w={760} h={180} />
				</g>
				<g transform="translate(330,640) rotate(-14)">
					<rect x={-80} y={-150} width={160} height={520} rx={80} fill={P.skin1} />
					<rect x={-80} y={-150} width={160} height={520} rx={80} fill="#7a3a20" opacity={0.18} transform="translate(18,10)" />
					<rect x={-52} y={-126} width={104} height={130} rx={50} fill="#f8e2cc" />
					<path d="M-60,120 C-20,110 20,110 60,120" stroke="#b07a58" strokeWidth={5} fill="none" opacity={0.6} />
				</g>
				<Arrow d="M300,880 L1500,880" label="微距：手指拨过书口，镜头沿书口横移" lx={540} ly={840} />
				<Note x={1880} y={150} anchor="end" text="第一帧就在动：书页正被拨开" />
			</>
		),
	},
	{
		t: '0:02',
		beat: '钩子',
		sub: '它不是小说。是一本[数字表]。',
		art: () => (
			<Study>
				<Desk y={700} />
				<OilLamp x={360} y={720} s={1.2} />
				<g transform="translate(980,560) rotate(-2)">
					<OpenTable x={0} y={0} s={0.62} worn={0.8} />
				</g>
				<Arrow d="M1600,300 L1240,520" label="后拉 + 下摇到书页" lx={1280} ly={260} />
				<Note x={150} y={160} text="翻开：密密麻麻的四位对数；左页发黑，右页干净" />
			</Study>
		),
	},
	// ===== title card, carried over from the book's own page
	{
		t: '0:04',
		beat: '片头卡 · 落在重拍',
		sub: '',
		mark: false,
		art: () => (
			<>
				<rect width={W} height={H} fill={JUNO.colors.night} />
				<g opacity={0.16} transform="translate(960,560) scale(1.5)">
					<OpenTable x={0} y={-300} s={1} worn={0.2} />
				</g>
				<rect width={W} height={H} fill={JUNO.colors.night} opacity={0.55} />
				<text x={960} y={300} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 600, fontSize: 30, letterSpacing: '0.42em', fill: GOLD}} opacity={0.85}>
					{"BENFORD'S LAW · NEWCOMB · MDCCCLXXXI"}
				</text>
				<text x={960} y={490} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 168, fill: 'url(#gold-text)', letterSpacing: '0.06em'}} filter="url(#g-sm)">
					《第一位数字》
				</text>
				<BookMotif id="tc" x={740} y={590} s={0.95} />
				<text x={960} y={760} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 700, fontSize: 54, fill: CREAM}}>
					为什么1开头的数字最多？
				</text>
				<text x={960} y={822} textAnchor="middle" style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 38, fill: CREAM}} opacity={0.75}>
					Why does the world start with 1?
				</text>
				<text x={960} y={900} textAnchor="middle" style={{fontFamily: font.serif, fontSize: 28, fill: GOLD, letterSpacing: '0.2em'}} opacity={0.8}>
					{`— ${JUNO.credit} · ${JUNO.series} —`}
				</text>
				<Beat x={1260} y={210} label="铅字一个个压进纸面，再灌金" />
				<Note x={60} y={1040} text="匹配剪辑：镜头扎进上一镜那页对数表，标题像1881年的铅字压印在纸上；母题 = 书口（金线版）" />
			</>
		),
	},
	// ===== cold open: a person, a year, a place
	{
		t: '0:09',
		beat: '冷开场 · 第一段',
		sub: '1881年，华盛顿。',
		art: () => (
			<>
				<rect width={W} height={H} fill="url(#sky-night)" />
				{Array.from({length: 80}, (_, i) => (
					<circle key={i} cx={random(`w${i}`) * W} cy={random(`wy${i}`) * 500} r={1.6} fill="#fff" opacity={0.3 + 0.6 * random(`wo${i}`)} />
				))}
				<path d="M0,760 L1920,760 L1920,1080 L0,1080 Z" fill="#0c1018" />
				<g fill="#161c28">
					<rect x={420} y={360} width={1080} height={420} />
					<path d="M400,360 L960,250 L1520,360 Z" />
					<path d="M1180,360 L1180,250 A110,110 0 0 1 1400,250 L1400,360 Z" fill="#1c2232" />
				</g>
				{Array.from({length: 10}, (_, i) => (
					<rect key={i} x={480 + i * 100} y={460} width={50} height={90} fill={i === 3 ? P.lamp : '#0b0f18'} opacity={i === 3 ? 0.95 : 1} />
				))}
				<circle cx={805} cy={505} r={160} fill="url(#glow-lamp)" opacity={0.9} />
				{Array.from({length: 10}, (_, i) => (
					<rect key={`b${i}`} x={480 + i * 100} y={600} width={50} height={90} fill="#0b0f18" />
				))}
				<Kicker text="1881 · 华盛顿 · 航海历书局" />
				<Arrow d="M300,900 C500,780 700,620 780,560" label="雪夜慢推，推进唯一亮着的窗" lx={200} ly={960 - 90} />
			</>
		),
	},
	{
		t: '0:12',
		beat: '冷开场',
		sub: '每算一次乘法，就要翻一次对数表。',
		art: () => (
			<Study>
				<g opacity={0.5}>
					<Person look={{...BENFORD, top: '#2a2a30', glasses: false, hair: 'bald'}} x={1520} y={700} s={0.7} pose={POSES.write} flip rim="cool" sil="#141418" />
					<Person look={NEWCOMB} x={1720} y={700} s={0.66} pose={POSES.write} flip rim="cool" sil="#141418" />
				</g>
				<Person look={NEWCOMB} x={600} y={1090} s={1.95} pose={POSES.write} expression="thinking" />
				<Desk y={780} />
				<OilLamp x={1160} y={800} s={1.1} />
				<g transform="translate(900,790) rotate(3) scale(0.3)">
					<OpenTable x={0} y={0} worn={0.8} />
				</g>
				<g transform="translate(200,850)">
					{Array.from({length: 5}, (_, i) => (
						<rect key={i} x={i * 6} y={-i * 8} width={260} height={30} fill={i % 2 ? '#e9dcc0' : '#d8c9a6'} />
					))}
				</g>
				<Kicker text="西蒙·纽康 · 天文学家" />
				<Arrow d="M300,330 L520,450" label="越肩推近：手指翻到前几页" lx={150} ly={300} />
				<Note x={1880} y={630} anchor="end" text="背景：同屋的计算员（剪影）" />
				<Note x={150} y={210} text="纽康的标志性大胡子：rig 要新增 beard 选项（模型表阶段做）" />
			</Study>
		),
	},
	{
		t: '0:18',
		beat: '数据 · 常识',
		sub: '按理说，每一段{该被翻得一样多}。',
		art: () => (
			<>
				<rect width={W} height={H} fill="#140e0a" />
				<circle cx={960} cy={300} r={1000} fill="url(#glow-lamp)" opacity={0.45} />
				<g transform="translate(330,360)">
					<EdgeBook id="tabs" x={0} y={0} w={1260} h={330} wear={0} tabs />
				</g>
				{Array.from({length: 9}, (_, i) => (
					<text key={i} x={330 + (i + 0.5) * 140} y={790} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 34, fill: CREAM}} opacity={0.7}>
						1/9
					</text>
				))}
				<Kicker text="表是按第一位数字排的" />
				<Arrow d="M330,880 L1590,880" label="镜头沿书口平移：1 → 9，九段一样厚" lx={560} ly={850 - 10} />
				<Note x={960} y={260} anchor="middle" text="插入镜头：书口的九个拇指索引（此时先画成干净的）" />
			</>
		),
	},
	// ===== twist on the break
	{
		t: '0:25',
		beat: '反转 · 安静段',
		sub: '不。',
		art: () => (
			<>
				<rect width={W} height={H} fill="#0a0705" />
				<OilLamp x={960} y={860} s={1.25} glow={1.2} />
				<g transform="translate(560,300)">
					<EdgeBook id="tw" x={0} y={0} w={800} h={240} wear={1.1} />
				</g>
				<path d="M520,330 C470,340 450,420 480,520 C500,560 540,560 560,540 Z" fill={P.skin1} />
				<path d="M1400,330 C1450,340 1470,420 1440,520 C1420,560 1380,560 1360,540 Z" fill={P.skin1} />
				<Beat x={1250} y={180} label="音乐收住：只剩灯焰轻跳" />
				<Arrow d="M1300,760 L1100,620" label="纽康把书举到灯前，书口逆光" lx={1240} ly={820} />
				<Note x={560} y={600} text="越往前（左），越黑：1 最黑，9 几乎是白的" />
			</>
		),
	},
	{
		t: '0:31',
		beat: '反转',
		sub: '他写了两页纸。然后，没人在意。',
		art: () => (
			<>
				<rect width={W} height={H} fill="#0d0c0e" />
				{Array.from({length: 7}, (_, k) => (
					<g key={k} transform={`translate(${180 + k * 250},${360 + (k % 2) * 30})`}>
						{Array.from({length: 14}, (_, i) => (
							<rect key={i} x={0} y={-i * 22} width={200} height={20} fill={i % 2 ? '#3a342c' : '#2c2822'} />
						))}
					</g>
				))}
				<g transform="translate(860,520) rotate(-4)">
					<rect width={260} height={340} fill="#e9dcc0" />
					<text x={20} y={46} style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 22, fill: '#3a2a1a'}}>
						Note on the Frequency of
					</text>
					<text x={20} y={74} style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 22, fill: '#3a2a1a'}}>
						Use of the Different Digits
					</text>
					{Array.from({length: 9}, (_, i) => (
						<line key={i} x1={20} y1={110 + i * 22} x2={240} y2={110 + i * 22} stroke="#8a7a5a" strokeWidth={2} />
					))}
				</g>
				<Motes f={0} n={60} seed="dust" color="#cdbf9f" o={0.8} />
				<Kicker text="American Journal of Mathematics · 1881" />
				<Arrow d="M990,500 L990,260" label="两页纸飘进档案堆，灰尘落下，纸变黄" lx={1060} ly={300} />
				<Note x={150} y={860} text="转场：纸页的黄 → 下一镜1938年台灯的黄" />
			</>
		),
	},
	{
		t: '0:37',
		beat: '跳到1938',
		sub: '57年后，物理学家本福特，发现了同一件事。',
		art: () => (
			<Study year="1938">
				<Person look={BENFORD} x={620} y={1060} s={1.95} pose={POSES.hold} expression="surprise" />
				<Desk y={780} tone="#2e2a26" />
				<g transform="translate(1200,780)">
					<path d="M0,0 L0,-160 L60,-240" stroke="#2f5a3a" strokeWidth={14} fill="none" />
					<path d="M20,-270 L140,-200 L100,-160 L-10,-230 Z" fill="#2f5a3a" />
					<circle cx={80} cy={-190} r={400} fill="url(#glow-lamp)" opacity={0.55} />
				</g>
				<g transform="translate(720,690) scale(0.5)">
					<EdgeBook id="bf" x={0} y={0} w={700} h={200} />
				</g>
				<Kicker text="1938 · 斯克内克塔迪 · 通用电气" />
				<Note x={150} y={210} text="匹配剪辑：同一个翻书的手势，同一个被翻黑的书口" />
				<Arrow d="M1700,620 L1500,700" label="慢推" lx={1640} ly={600} />
			</Study>
		),
	},
	{
		t: '0:43',
		beat: '数据',
		sub: '他收集了[20,229]个数字。',
		art: () => (
			<Study year="1938" window={false}>
				<Desk y={640} tone="#2e2a26" />
				<circle cx={960} cy={300} r={900} fill="url(#glow-lamp)" opacity={0.4} />
				{Array.from({length: 9}, (_, i) => (
					<Tin key={i} x={240 + i * 180} y={820} d={i + 1} fill={[1, 0.62, 0.45, 0.36, 0.3, 0.26, 0.22, 0.2, 0.18][i]} />
				))}
				{['河流面积', '城市人口', '物理常数', '门牌号', '死亡率', '分子量'].map((t, i) => (
					<g key={t} transform={`translate(${260 + i * 260},${260 + (i % 2) * 60}) rotate(${(i - 3) * 4})`}>
						<rect x={-90} y={-40} width={180} height={80} rx={4} fill="#efe6d2" />
						<text y={12} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 700, fontSize: 30, fill: '#3a2a1a'}}>
							{t}
						</text>
					</g>
				))}
				<text x={1700} y={170} textAnchor="end" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 96, fill: GOLD}}>
					20,229
				</text>
				<Note x={1700} y={210} anchor="end" text="计数器滚动，停在这个数" />
				<Arrow d="M600,420 C500,520 320,560 260,640" label="卡片一张张飞进按首位数字分好的盒子" lx={600} ly={540} />
				<Beat x={1240} y={560} label="每落一张卡一拍" />
			</Study>
		),
	},
	// ===== mechanism on the build: the growth toy model
	{
		t: '0:51',
		beat: '机制 · 铺垫段',
		sub: '从1千涨到2千：要7年。',
		art: () => (
			<Town houses={10}>
				<Sign x={1280} y={900} n="1,000" sub="小镇 · 人口" />
				<text x={300} y={260} style={{fontFamily: font.latin, fontWeight: 700, fontSize: 80, fill: CREAM}} opacity={0.85}>
					第 1 年
				</text>
				<Kicker text="一个小镇 · 示意" />
				<Arrow d="M200,820 L1000,820" label="延时：房子一栋栋亮灯，日历哗哗翻" lx={220} ly={780} />
				<Note x={300} y={320} text="牌子上的“1”在镜头里停了很久" />
			</Town>
		),
	},
	{
		t: '0:58',
		beat: '机制',
		sub: '从9千涨到1万：只要1年。',
		art: () => (
			<Town houses={44}>
				<Sign x={1280} y={900} n="9,612" sub="小镇 · 人口" roll />
				<text x={300} y={260} style={{fontFamily: font.latin, fontWeight: 700, fontSize: 80, fill: CREAM}} opacity={0.85}>
					第 23 年
				</text>
				<Arrow d="M1500,300 L1500,520" label="数字翻得飞快，一眨眼跳到 10,000" lx={1000} ly={240} />
				<Beat x={260} y={420} label="跳到 10,000 时一记重拍，又回到 1" />
			</Town>
		),
	},
	{
		t: '1:05',
		beat: '机制 · 悬念',
		sub: '1开头的数，到底占多少？',
		art: () => (
			<Study year="1938" window={false}>
				<Desk y={640} tone="#2e2a26" />
				<circle cx={960} cy={300} r={700} fill="url(#glow-lamp)" opacity={0.25} />
				{Array.from({length: 9}, (_, i) => (
					<Tin key={i} x={240 + i * 180} y={820} d={i + 1} fill={[1, 0.62, 0.45, 0.36, 0.3, 0.26, 0.22, 0.2, 0.18][i]} />
				))}
				<rect width={W} height={H} fill="#000" opacity={0.35} />
				<Beat x={680} y={300} label="drop 前一小节：全静，灯暗一档" />
				<Note x={960} y={420} anchor="middle" text="镜头不动；只有台灯的光慢慢收拢到“1”号盒子" />
			</Study>
		),
	},
	// ===== reveal on the drop
	{
		t: '1:09',
		beat: '揭晓 · DROP',
		sub: '约[三成]，以1开头。',
		art: () => (
			<>
				<rect width={W} height={H} fill="#0a0806" />
				<circle cx={460} cy={300} r={900} fill="url(#glow-lamp)" opacity={0.5} />
				<Stairs x={360} y={840} />
				<Beat x={900} y={140} label="drop：九个盒子同时弹成九级光柱" />
				<Arrow d="M1820,860 C1860,640 1820,420 1700,300" label="升降：从桌面拉起来" lx={1580} ly={260} />
			</>
		),
	},
	{
		t: '1:16',
		beat: '命名',
		sub: '它叫[本福特定律]。',
		art: () => (
			<>
				<rect width={W} height={H} fill="#0a0806" />
				<Stairs x={360} y={620} h={380} labels={false} outline />
				<g transform="translate(360,680)">
					<EdgeBook id="match" x={0} y={0} w={1200} h={150} />
				</g>
				<text x={960} y={160} textAnchor="middle" style={{fontFamily: font.latinItalic, fontStyle: 'italic', fontSize: 64, fill: GOLD}}>
					P(d) = log₁₀(1 + 1/d)
				</text>
				<Note x={960} y={900 - 20} anchor="middle" text="匹配：光柱的高低 = 1881年那本书口的黑白（同一条曲线）" />
			</>
		),
	},
	// ===== second layer: the cheques
	{
		t: '1:22',
		beat: '第二层 · 高潮',
		sub: '1993年，一位经理开出23张支票。',
		art: () => (
			<>
				<rect width={W} height={H} fill="#1a1612" />
				<g transform="translate(1220,110)">
					<rect width={560} height={420} fill="#e08a4a" />
					<rect y={240} width={560} height={180} fill="#a85a3a" />
					<circle cx={180} cy={260} r={60} fill="#ffd28a" />
					<path d="M0,330 L80,280 L150,320 L260,250 L380,310 L560,270 L560,420 L0,420 Z" fill="#6a3a2a" />
					<g fill="#3a2a1e">
						<rect x={430} y={200} width={14} height={140} />
						<rect x={410} y={250} width={30} height={10} />
						<rect x={440} y={230} width={24} height={10} />
					</g>
					<rect x={-14} y={-14} width={588} height={448} fill="none" stroke="#3a3530" strokeWidth={28} />
					{Array.from({length: 12}, (_, i) => (
						<rect key={i} x={0} y={i * 36} width={560} height={14} fill="#3a3530" opacity={0.75} />
					))}
				</g>
				<Person look={CLERK93} x={700} y={1240} s={1.9} pose={POSES.write} back rim="warm" />
				<Desk y={780} tone="#4a4038" />
				<g transform="translate(1180,780)">
					<rect x={-150} y={-260} width={300} height={230} rx={14} fill="#c9c2b2" />
					<rect x={-124} y={-236} width={248} height={176} fill="#16301e" />
					<text x={-108} y={-196} style={{fontFamily: 'monospace', fontSize: 22, fill: '#7dffb0'}}>
						VENDOR PAYMENTS
					</text>
					<rect x={-60} y={-30} width={120} height={30} fill="#b8b0a0" />
				</g>
				<Kicker text="1993 · 亚利桑那州财政办公室" />
				<Arrow d="M300,420 L560,600" label="背影，慢推到他手里的支票" lx={150} ly={380} />
				<Note x={150} y={210} text="人物只拍背影（真实案件当事人，不画脸）" />
			</>
		),
	},
	{
		t: '1:28',
		beat: '第二层',
		sub: '金额是他自己{随手编的}。',
		art: () => (
			<>
				<rect width={W} height={H} fill="#16120e" />
				<circle cx={960} cy={300} r={900} fill="url(#glow-lamp)" opacity={0.35} />
				{['87,148', '93,520', '79,306', '96,044', '88,912', '74,385', '91,207'].map((a, i) => (
					<Cheque key={a} x={420 + (i % 4) * 360} y={330 + Math.floor(i / 4) * 300 + (i % 2) * 30} rot={(i - 3) * 3} amt={a} flag={1} />
				))}
				<Note x={150} y={140} text="金额为示意（真实支票共23张，九成以上以7、8、9开头，多数略低于10万美元）" />
				<Beat x={1150} y={900 - 40} label="每拍一张，首位数字一圈红" />
			</>
		),
	},
	{
		t: '1:34',
		beat: '第二层 · 落点',
		sub: '审计一比，[一眼就露馅]。',
		art: () => (
			<>
				<rect width={W} height={H} fill="#0e0c0a" />
				<Stairs x={360} y={820} h={420} labels={false} outline />
				{[0, 0, 0, 0, 0, 0, 22, 34, 44].map((v, i) =>
					v ? <rect key={i} x={360 + i * (1200 / 9) + 26} y={820 - (v / 30.1) * 420} width={1200 / 9 - 52} height={(v / 30.1) * 420} fill={RED} opacity={0.85} /> : null,
				)}
				{Array.from({length: 9}, (_, i) => (
					<text key={i} x={360 + (i + 0.5) * (1200 / 9)} y={880} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 44, fill: i >= 6 ? RED : CREAM}}>
						{i + 1}
					</text>
				))}
				<text x={420} y={220} style={{fontFamily: font.serif, fontWeight: 700, fontSize: 36, fill: GOLD}}>
					金虚线 = 自然的数
				</text>
				<text x={420} y={272} style={{fontFamily: font.serif, fontWeight: 700, fontSize: 36, fill: RED}}>
					红柱 = 他编的数
				</text>
				<Beat x={420} y={330} label="红柱砸下来时一记冲击 + 轻微震屏" />
				<Note x={960} y={130} anchor="middle" text="下一句（希腊）：同一张图换成一排欧盟国家的小柱图" />
			</>
		),
	},
	// ===== real world
	{
		t: '1:42',
		beat: '现实 · 高潮',
		sub: '自然增长、跨越很多量级的数，[都偏爱1]。',
		art: () => (
			<>
				<rect width={W} height={H} fill="url(#sky-night)" />
				{Array.from({length: 16}, (_, i) => {
					const x = i * 124 - 20;
					const h = 260 + random(`cb${i}`) * 420;
					return (
						<g key={i}>
							<rect x={x} y={880 - h} width={116} height={h} fill={i % 2 ? '#141a28' : '#182032'} />
							{Array.from({length: Math.floor(h / 40)}, (_, k) => (
								<rect key={k} x={x + 14 + (k % 3) * 32} y={900 - h + k * 38} width={18} height={20} fill={P.lamp} opacity={random(`cw${i}${k}`) > 0.6 ? 0.7 : 0.08} />
							))}
						</g>
					);
				})}
				<rect y={880} width={W} height={200} fill="#0b0f18" />
				{[
					['1', '28.6', 260, 540],
					['1', ',024 MB', 760, 400],
					['1', '9.9元', 1240, 560],
					['1', '6,380 km', 1560, 360],
				].map(([a, b, x, y], i) => (
					<g key={i}>
						<rect x={(x as number) - 20} y={(y as number) - 66} width={String(b).length * 34 + 90} height={90} rx={8} fill="#0b0f18" opacity={0.85} stroke="#3a4566" />
						<text x={x as number} y={y as number} style={{fontFamily: font.latin, fontWeight: 700, fontSize: 60, fill: CREAM}}>
							<tspan fill={GOLD}>{a}</tspan>
							{b}
						</text>
					</g>
				))}
				<Kicker text="哪些数字偏爱1" />
				<Arrow d="M200,840 L1700,840" label="夜景横移：招牌、价签、里程碑，首位的1依次亮金" lx={300} ly={800} />
			</>
		),
	},
	{
		t: '1:50',
		beat: '现实 · 反例',
		sub: '身高、电话号码、彩票号码——不算。',
		art: () => (
			<>
				<rect width={W} height={H} fill="#10131a" />
				<circle cx={960} cy={200} r={800} fill="url(#glow-lamp)" opacity={0.2} />
				{[0, 1, 2, 3, 4].map((i) => (
					<g key={i}>
						<Person look={{...CLERK93, top: ['#5a4a3a', '#3d4a5e', '#6a3a3a', '#3a5a4a', '#4a3a5a'][i]}} x={260 + i * 150} y={900} s={0.78 + (i % 3) * 0.06} pose={POSES.stand} rim="cool" sil="#1c2232" />
						<text x={260 + i * 150} y={600 - (i % 3) * 20} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 40, fill: CREAM}} opacity={0.7}>
							{['1.62', '1.75', '1.81', '1.68', '1.70'][i]}
						</text>
					</g>
				))}
				{[7, 12, 23, 31, 35].map((n, i) => (
					<g key={n} transform={`translate(${1140 + i * 130},460)`}>
						<circle r={52} fill="#d9d4c8" />
						<text y={18} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 700, fontSize: 48, fill: '#2a2620'}}>
							{n}
						</text>
					</g>
				))}
				<text x={1140 - 52} y={700} style={{fontFamily: 'monospace', fontSize: 64, fill: CREAM}} opacity={0.7}>
					138 ···· 2046
				</text>
				<Note x={150} y={160} text="范围太窄（身高全在1米几）或号码是“分配”的：没有本福特曲线" />
				<Arrow d="M1800,900 L1140,900" label="反向横移，暖光退去，画面变冷" lx={1140} ly={860} />
			</>
		),
	},
	{
		t: '1:56',
		beat: '三条结论',
		sub: '③1开头最多，是[增长的形状]。',
		art: () => (
			<Study year="1938" window={false}>
				<Desk y={560} tone="#2e2a26" />
				<circle cx={960} cy={200} r={900} fill="url(#glow-lamp)" opacity={0.45} />
				{[
					['①', '数字要跨越好几个量级'],
					['②', '人编的数，往往太平均'],
					['③', '1开头最多，是增长的形状'],
				].map(([n, t], i) => (
					<g key={n} transform={`translate(${380 + i * 580},${700 + (i % 2) * 20}) rotate(${(i - 1) * 3})`}>
						<rect x={-240} y={-150} width={480} height={300} fill="#efe6d2" />
						<text x={0} y={-50} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 80, fill: i === 2 ? P.brass : '#3a2a1a'}}>
							{n}
						</text>
						<text x={0} y={60} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 700, fontSize: 36, fill: '#3a2a1a'}}>
							{t}
						</text>
					</g>
				))}
				<Note x={960} y={300} anchor="middle" text="三张卡片在台灯下依次落桌（落定后不再动）；本福特的手把它们推正" />
			</Study>
		),
	},
	// ===== callback
	{
		t: '2:08',
		beat: '回扣 · 尾声',
		sub: '翻黑它的，不是某一个人。',
		art: () => (
			<Study dawn={0.8}>
				<Desk y={700} />
				<OilLamp x={360} y={720} s={1.2} glow={0.4} />
				<g transform="translate(700,470) scale(0.9)">
					<EdgeBook id="coda" x={0} y={0} w={700} h={240} />
				</g>
				<rect x={1340} y={90} width={420} height={470} fill="#ffcf9a" opacity={0.15} filter="url(#g-lg)" />
				<Arrow d="M1000,900 L1000,700" label="回到开场同一个构图；镜头缓缓后拉，天快亮了" lx={600} ly={960 - 110} />
				<Note x={150} y={160} text="灯焰被晨光盖过：开场的书、开场的光，换了一种温度" />
			</Study>
		),
	},
	{
		t: '2:20',
		beat: '片尾卡 · 6秒',
		sub: '',
		mark: false,
		art: () => (
			<>
				<rect width={W} height={H} fill={JUNO.colors.night} />
				<g transform="translate(960,190)">
					<Monogram draw={1} size={1.2} wordmark={JUNO.name} />
				</g>
				<text x={960} y={440} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 104, fill: 'url(#gold-text)'}}>
					《第一位数字》
				</text>
				<BookMotif id="end" x={790} y={520} s={0.72} />
				<text x={960} y={680} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 700, fontSize: 52, fill: CREAM}}>
					你的手机余额，第一位是几？评论区验一验
				</text>
				<rect x={640} y={730} width={640} height={70} rx={35} fill="none" stroke={GOLD} strokeWidth={2.5} />
				<text x={960} y={776} textAnchor="middle" style={{fontFamily: font.sans, fontWeight: 700, fontSize: 30, fill: GOLD}}>
					{JUNO.follow}
				</text>
				<text x={960} y={880} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 22, fill: CREAM}} opacity={0.45}>
					参考 · Newcomb, Am. J. Math. (1881) · Benford, Proc. APS (1938) · Nigrini, J. Accountancy (1999) · Rauch et al. (2011)
				</text>
				<Beat x={60} y={1030} label="音乐继续；J 字自己画出来" />
			</>
		),
	},
];

export const BENFORD_BOARD_N = S.length;

export const BenfordBoard: React.FC = () => {
	loadEpisodeFonts('benford');
	const i = useCurrentFrame();
	const p = S[i] ?? S[0];
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1'}}>
				<Materials />
				<GlowDefs />
				<defs>
					<linearGradient id="sub-fade" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#000" stopOpacity="0" />
						<stop offset="1" stopColor="#000" stopOpacity="0.55" />
					</linearGradient>
				</defs>
				{p.art()}
				<Finish vig={0.55} grain={0.04} />
				<Sub text={p.sub} />
				<Slate n={i + 1} t={p.t} beat={p.beat} mark={p.mark !== false} />
			</svg>
		</AbsoluteFill>
	);
};
