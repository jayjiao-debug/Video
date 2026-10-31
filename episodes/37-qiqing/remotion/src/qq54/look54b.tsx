import React from 'react';
import {W, H} from '../qq50/kit50';
import {Cao, Pal, RimF, Lamel, Rod5, Dao, Sack, P, f1, rnd, strand, qpts, ROD5} from './cao54b';
/* ep54 look B 「主角刻画」 (the 马首 铜灯影 family): 2.5D cut-out depth planes with haze between them, one key light per set,
   warm-black silhouettes rimmed by that key; 曹操 alone is a drawn character (flat-vector, three-tone cel shading, costume and
   armour detail) lit by the set key plus his own cool 石青 accent rim. The owner's call (2026-10-31): style first, so Look1 is
   ONE style sheet: the set sample (洛阳 city gate at night: 门楼 + paired 门阙), 曹操 at 20 and at 46, a props row, the palette. */
const SANS = "'Noto Sans CJK SC',sans-serif", SERIF = "'Noto Serif CJK SC',serif";
const CREAM = '#F2E6CC', BOARD = '#15100D';
const SIL = '#140D0A', RIMW = '#FFB070', KEY = '#F3DDB4', ACC = '#8FD0DC', COOL = '#9FB8B6';

/* ---------- small silhouettes ---------- */
/** a standing man in profile facing +x (帻, robe/tunic, legs), feet at (0,0), height 100 → scaled by h/100 */
const manD = 'M2,-100 C9,-100 13,-95 13,-89 C13,-86 15,-84 16,-82 L13,-81 C13,-77 10,-74 6,-74 L6,-71 C14,-69 18,-63 18,-54 L19,-36 C19,-32 17,-31 15,-33 L14,-52 L13,-30 C14,-24 15,-20 15,-16 L10,-16 L10,-1 L15,0 L4,0 L4,-15 L-2,-15 L-3,-1 L1,0 L-10,0 L-9,-16 L-14,-16 C-14,-30 -14,-50 -12,-62 C-10,-69 -4,-71 -2,-72 L-2,-75 C-7,-77 -9,-82 -9,-88 C-9,-96 -5,-100 2,-100 Z M-6,-98 C-3,-104 6,-104 8,-99 Z';
const Man: React.FC<{x: number; y: number; h: number; flip?: boolean; ji?: boolean; lantern?: boolean}> = ({x, y, h, flip, ji, lantern}) => { const s = h / 100;
	return <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
		<path d={manD} />
		{ji && <><path d="M17,-34 L22,-150" stroke={SIL} strokeWidth={2.2} /><path d="M22,-150 L20.5,-166 L24.5,-150 Z M21.6,-144 L32,-140 L30,-137 L21.4,-140 Z" /></>}
		{lantern && <><path d="M17,-36 L34,-58" stroke={SIL} strokeWidth={1.6} /><path d="M34,-58 L34,-52" stroke={SIL} strokeWidth={0.8} /></>}
	</g>; };

/** a Han 阙 (母阙 + 子阙 on the outer side); base centre (x, y), dir = +1 sub-tower to the right */
const Que: React.FC<{x: number; y: number; s: number; dir: 1 | -1}> = ({x, y, s, dir}) => <g transform={`translate(${x},${y}) scale(${dir * s},${s})`}>
	<path d="M28,-16 L72,-16 L68,-140 L30,-140 Z M22,-140 L96,-136 C90,-142 84,-150 80,-162 L28,-164 Z M32,-164 L76,-164 L74,-170 L34,-170 Z" />
	<rect x={-42} y={-18} width={84} height={18} />
	<path d="M-32,-16 L32,-16 L28,-212 L-28,-212 Z" />
	<rect x={-35} y={-224} width={70} height={12} />
	{[-34, -20, -6, 8, 22].map((bx) => <rect key={bx} x={bx} y={-240} width={11} height={16} />)}
	<rect x={-40} y={-244} width={80} height={6} />
	<rect x={-36} y={-266} width={72} height={22} />
	<path d="M-80,-262 L80,-262 L80,-267 L54,-294 L-54,-294 L-80,-267 Z" />
	<rect x={-30} y={-312} width={60} height={18} />
	<path d="M-63,-308 L63,-308 L63,-312 L36,-336 L-36,-336 L-63,-312 Z" />
	<path d="M-42,-336 L42,-336 L45,-344 L-45,-344 Z" />
</g>;

/* ---------- 1. the set: 洛阳 city gate at night (门楼 on the rammed-earth wall, three flat-lintel passages, paired 阙) ---------- */
const SW = 1120, SH = 630, GY = 520;
const SetGate: React.FC = () => {
	const crenel = Array.from({length: 44}, (_, i) => -6 + i * 26);
	const layers = Array.from({length: 17}, (_, i) => 306 + i * 13);
	const stars = Array.from({length: 46}, (_, i) => [rnd(i, 1) * SW, rnd(i, 2) * 230, 0.6 + rnd(i, 3) * 1.1, 0.25 + rnd(i, 4) * 0.5]);
	const pass = (cx: number, w: number, h: number, k: string) => <g key={k}>
		<rect x={cx - w / 2 - 8} y={GY - h - 10} width={w + 16} height={h + 10} fill="#1A1410" />
		<rect x={cx - w / 2} y={GY - h} width={w} height={h} fill={`url(#psg)`} />
		{[0.12, 0.3, 0.7, 0.88].map((u) => <rect key={u} x={cx - w / 2 + w * u - 2} y={GY - h} width={4} height={h} fill="#3A2A1E" opacity={0.55} />)}
		<rect x={cx - w / 2 - 8} y={GY - h - 10} width={w + 16} height={8} fill="#2A1E16" />
	</g>;
	return <svg x={40} y={70} width={SW} height={SH} viewBox={`0 0 ${SW} ${SH}`}>
		<defs>
			<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#16222B" /><stop offset="0.45" stopColor="#253740" /><stop offset="0.72" stopColor="#455654" /><stop offset="0.86" stopColor="#68706A" /></linearGradient>
			<radialGradient id="moonG" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#DCE4DA" stopOpacity="0.45" /><stop offset="0.3" stopColor="#9FB8B6" stopOpacity="0.18" /><stop offset="1" stopColor="#9FB8B6" stopOpacity="0" /></radialGradient>
			<radialGradient id="wallG" cx="560" cy="500" r="430" gradientUnits="userSpaceOnUse" gradientTransform="translate(560 500) scale(1 0.62) translate(-560 -500)"><stop offset="0" stopColor={KEY} stopOpacity="0.58" /><stop offset="0.4" stopColor="#D9A877" stopOpacity="0.28" /><stop offset="1" stopColor="#D9A877" stopOpacity="0" /></radialGradient>
			<linearGradient id="psg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C9A27A" /><stop offset="0.55" stopColor="#F3DDB4" /><stop offset="1" stopColor="#FFF0D2" /></linearGradient>
			<linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2E2620" /><stop offset="1" stopColor="#16110E" /></linearGradient>
			<linearGradient id="spill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={KEY} stopOpacity="0.62" /><stop offset="1" stopColor={KEY} stopOpacity="0.06" /></linearGradient>
			<linearGradient id="haze1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6E7670" stopOpacity="0" /><stop offset="0.7" stopColor="#6E7670" stopOpacity="0.5" /><stop offset="1" stopColor="#6E7670" stopOpacity="0.1" /></linearGradient>
			<linearGradient id="haze2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8E8676" stopOpacity="0" /><stop offset="0.6" stopColor="#8E8676" stopOpacity="0.4" /><stop offset="1" stopColor="#8A8070" stopOpacity="0" /></linearGradient>
			<radialGradient id="vig" cx="0.5" cy="0.55" r="0.75"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.45" /></radialGradient>
			<linearGradient id="roofG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2C3234" /><stop offset="1" stopColor="#1A1A1A" /></linearGradient>
			<filter id="bl3" x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation="3" /></filter>
			<filter id="bl6" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" /></filter>
			<filter id="dof" x="-2%" y="-2%" width="104%" height="104%"><feGaussianBlur stdDeviation="0.9" /></filter>
			<filter id="bl25" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.6" /></filter>
			<filter id="bl1" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.2" /></filter>
			<RimF id="rimQL" lx={1} ly={0} k={3} c={RIMW} o={0.9} lx2={-0.3} ly2={-1} k2={2} c2={COOL} o2={0.55} />
			<RimF id="rimQR" lx={-1} ly={0} k={3} c={RIMW} o={0.9} lx2={0.3} ly2={-1} k2={2} c2={COOL} o2={0.55} />
			<RimF id="rimBk" lx={-1} ly={-0.2} k={1.6} c={'#FFE2B4'} lx2={1} ly2={-0.2} k2={1.6} c2={'#FFE2B4'} />
			<RimF id="rimTop" lx={0} ly={-1} k={2} c={COOL} o={0.5} />
			<RimF id="rimFg" lx={0.6} ly={-0.8} k={2.4} c={RIMW} o={0.75} />
		</defs>
		{/* P0 sky, stars, the moon behind thin cloud */}
		<rect width={SW} height={SH} fill="url(#sky)" />
		{stars.map(([x, y, r, o], i) => <circle key={i} cx={x} cy={y} r={r} fill="#E8EEE6" opacity={o} />)}
		<circle cx={905} cy={96} r={150} fill="url(#moonG)" />
		<circle cx={905} cy={96} r={25} fill="#E4E8DC" />
		<circle cx={899} cy={92} r={25} fill="#F2F2E8" opacity={0.5} />
		<g filter="url(#bl6)" opacity={0.55}>
			<ellipse cx={760} cy={120} rx={260} ry={9} fill="#5A6A6A" /><ellipse cx={1010} cy={150} rx={200} ry={7} fill="#4E5E60" /><ellipse cx={240} cy={90} rx={220} ry={8} fill="#3E5056" />
		</g>
		{/* P1 far: the 北邙 hills and the roofs of the inner city above the wall line, hazed and out of focus */}
		<g filter="url(#bl3)">
			<path d="M-10,262 C80,232 170,222 260,240 C340,214 430,206 520,226 C620,198 760,208 860,232 C940,214 1040,218 1130,240 L1130,320 L-10,320 Z" fill="#2E3B3B" />
			<path d="M-10,286 L40,286 L52,270 L150,270 L162,286 L230,286 L238,276 L296,276 L304,286 L830,286 L840,268 L950,268 L962,286 L1010,286 L1018,274 L1084,274 L1092,286 L1130,286 L1130,320 L-10,320 Z" fill="#26302F" />
			{[60, 110, 880, 920, 1040].map((x, i) => <rect key={i} x={x} y={280} width={8} height={5} fill="#E9CB98" opacity={0.35} />)}
		</g>
		<rect y={210} width={SW} height={110} fill="url(#haze1)" />
		{/* P2 the wall: rammed earth in courses, crenellated parapet, three flat-lintel passages lit from inside */}
		<g filter="url(#dof)">
		<rect x={-10} y={300} width={SW + 20} height={GY - 300} fill="#332B24" />
		<rect x={-10} y={300} width={SW + 20} height={GY - 300} fill="url(#wallG)" />
		{layers.map((y, i) => <path key={i} d={`M-10,${y} L${SW + 10},${y + (i % 2 ? 1 : -1)}`} stroke="#000" strokeOpacity={0.16} strokeWidth={1.4} />)}
		{layers.map((y, i) => <path key={'h' + i} d={`M-10,${y + 2} L${SW + 10},${y + 2}`} stroke="#F3DDB4" strokeOpacity={0.05} strokeWidth={1} />)}
		<g filter="url(#rimTop)" fill="#231D19">{crenel.map((x) => <rect key={x} x={x} y={286} width={16} height={16} />)}<rect x={-10} y={296} width={SW + 20} height={8} /></g>
		{pass(560, 92, 150, 'c')}{pass(430, 68, 118, 'l')}{pass(690, 68, 118, 'r')}
		{/* 门楼 on the wall: 平座 with a railing, a five-bay hall, 斗拱, a straight-ridged hip roof with barely raised ends */}
		<g>
			<rect x={352} y={282} width={416} height={18} fill="#1E1814" />
			{Array.from({length: 27}, (_, i) => <rect key={i} x={360 + i * 15.2} y={266} width={3} height={16} fill="#1E1814" />)}
			<rect x={356} y={262} width={408} height={5} fill="#1E1814" />
			<rect x={376} y={212} width={368} height={56} fill="#2A221C" />
			<rect x={376} y={212} width={368} height={56} fill="url(#wallG)" opacity={0.5} />
			{[0, 1, 2, 3, 4].map((i) => <g key={i}><rect x={392 + i * 70} y={226} width={40} height={30} fill="#E9CB98" opacity={i === 2 ? 0.9 : 0.6} />
				{[0, 1, 2, 3, 4, 5].map((j) => <rect key={j} x={394 + i * 70 + j * 6.6} y={226} width={2.2} height={30} fill="#2A1E16" />)}</g>)}
			{[376, 446, 516, 586, 656, 726].map((x) => <rect key={x} x={x} y={212} width={18} height={56} fill="#1C1612" />)}
			<rect x={366} y={204} width={388} height={9} fill="#1C1612" />
			{Array.from({length: 13}, (_, i) => <g key={i} fill="#1C1612"><rect x={372 + i * 30} y={194} width={18} height={10} /><rect x={366 + i * 30} y={190} width={30} height={5} /></g>)}
			<g filter="url(#rimTop)">
				<path d="M318,192 C420,186 700,186 802,192 L806,184 C790,180 760,166 708,138 L412,138 C360,166 330,180 314,184 Z" fill="url(#roofG)" />
				<path d="M404,140 L716,140 L724,128 L716,132 L404,132 L396,128 Z" fill="#141414" />
			</g>
			{Array.from({length: 30}, (_, i) => { const x0 = 420 + i * 9.6, x1 = 326 + i * 16.4; return <path key={i} d={`M${x0},${142} L${x1},${188}`} stroke="#5A6466" strokeOpacity={0.35} strokeWidth={1.2} />; })}
			{Array.from({length: 31}, (_, i) => <circle key={i} cx={322 + i * 15.9} cy={189} r={2.4} fill="#4A5254" opacity={0.7} />)}
		</g>
		</g>
		{/* guards at the passage, backlit */}
		<g fill={SIL} filter="url(#rimBk)"><Man x={505} y={GY} h={64} ji /><Man x={615} y={GY} h={64} ji flip /></g>
		{/* ground: the road, the light spilling out of the gate */}
		<rect y={GY} width={SW} height={SH - GY} fill="url(#gnd)" />
		<path d={`M514,${GY} L606,${GY} L800,${SH} L320,${SH} Z`} fill="url(#spill)" />
		<path d={`M398,${GY} L462,${GY} L330,${SH} L200,${SH} Z M658,${GY} L722,${GY} L920,${SH} L790,${SH} Z`} fill="url(#spill)" opacity={0.42} />
		{[0, 1, 2, 3].map((i) => <path key={i} d={`M${540 + i * 14},${GY + 2} L${430 + i * 90},${SH}`} stroke="#000" strokeOpacity={0.12} strokeWidth={2} />)}
		<rect y={440} width={SW} height={130} fill="url(#haze2)" />
		{/* P3 the paired 阙, standing forward of the gate, rimmed by the gate light on their inner faces and the moon on top */}
		<g fill={SIL} filter="url(#rimQL)"><Que x={196} y={556} s={1.02} dir={-1} /></g>
		<g fill={SIL} filter="url(#rimQR)"><Que x={924} y={556} s={1.02} dir={1} /></g>
		<path d={`M120,556 L276,556 L300,566 L96,566 Z M848,556 L1004,556 L1024,566 L824,566 Z`} fill="#0E0A08" opacity={0.6} />
		{/* P4 near: a night-watch walker with a lantern on the road; a bare tree framing the left edge */}
		<g fill={SIL} filter="url(#rimFg)"><Man x={780} y={600} h={92} flip lantern /></g>
		<circle cx={750} cy={548} r={26} fill={KEY} opacity={0.18} filter="url(#bl6)" />
		<rect x={745} y={542} width={10} height={13} rx={3} fill="#FCEBC8" />
		{/* P5 foreground, out of focus: the eave of a building on our side of the street and its post frame the view */}
		<g filter="url(#bl25)" fill="#0B0706">
			<path d="M-20,-10 L700,-10 L700,6 C520,18 260,34 -20,60 Z" />
			{Array.from({length: 30}, (_, i) => { const x = 8 + i * 23.5, y = 54 - i * 1.9 - (i > 20 ? (i - 20) * 0.6 : 0); return <circle key={i} cx={x} cy={y} r={7.5} />; })}
			<rect x={-10} y={0} width={44} height={SH + 10} />
			<rect x={-10} y={40} width={84} height={16} />
		</g>
		<path d="M-20,62 C260,36 520,20 700,8" fill="none" stroke={RIMW} strokeOpacity={0.22} strokeWidth={2} filter="url(#bl25)" />
		<rect width={SW} height={SH} fill="url(#vig)" />
	</svg>; };

/* ---------- 2. 曹操 at 20 and at 46 ---------- */
const PAL: Pal = {skin: '#C38D64', skinS: '#9C6848', skinH: '#E8BC8E', hair: '#15100E', robe: '#262A31', robeS: '#16181C', robeH: '#575B62', trim: '#5C2E24',
	metal: '#3C3B3A', metalS: '#1B1A1A', metalH: '#9A968C', lace: '#6E2C22', under: '#55302A', underS: '#2E1915', cape: '#2C1716', capeS: '#170B0B', gold: '#C09A52', line: '#2A1810'};
const HeroPanel: React.FC = () => { const S = 0.52;
	return <svg x={1190} y={70} width={690} height={630} viewBox="0 0 690 630">
		<defs>
			<linearGradient id="hbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#18232B" /><stop offset="0.7" stopColor="#2C383A" /><stop offset="0.92" stopColor="#3A3630" /></linearGradient>
			<radialGradient id="hkey" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor={KEY} stopOpacity="0.38" /><stop offset="1" stopColor={KEY} stopOpacity="0" /></radialGradient>
			<linearGradient id="hfl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A3028" /><stop offset="1" stopColor="#1A1410" /></linearGradient>
			<RimF id="heroRim" lx={1} ly={-0.35} k={5} c="#FFE0B0" o={0.95} lx2={-1} ly2={-0.15} k2={4} c2={ACC} o2={0.95} blur={1} />
			<Lamel pal={PAL} />
			<RimF id="heroRimS" lx={1} ly={-0.35} k={2.5} c="#FFE0B0" o={0.9} lx2={-1} ly2={-0.15} k2={2} c2={ACC} o2={0.95} blur={0.6} />
			<filter id="hbl" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7" /></filter>
		</defs>
		<rect width={690} height={630} fill="url(#hbg)" />
		{/* the same world behind them, out of focus: the wall and 门楼 as dark planes; the lit passage between them is their key */}
		<ellipse cx={345} cy={430} rx={300} ry={320} fill="url(#hkey)" />
		<g filter="url(#hbl)">
			<rect x={-20} y={340} width={730} height={240} fill="#3A3029" />
			<ellipse cx={345} cy={520} rx={340} ry={210} fill="url(#hkey)" />
			{Array.from({length: 26}, (_, i) => <rect key={i} x={-10 + i * 28} y={328} width={16} height={14} fill="#2E2621" />)}
			<rect x={236} y={262} width={218} height={80} fill="#121214" opacity={0.92} />
			<path d="M190,266 L500,266 L460,222 L230,222 Z" fill="#101114" opacity={0.95} />
			{[0, 1, 2, 3].map((i) => <rect key={i} x={258 + i * 46} y={284} width={30} height={24} fill="#E9CB98" opacity={0.35} />)}
			<rect x={306} y={430} width={78} height={150} fill={KEY} opacity={0.75} />
		</g>
		<path d="M300,580 L390,580 L520,630 L170,630 Z" fill={KEY} opacity={0.12} />
		
		<rect y={572} width={690} height={58} fill="url(#hfl)" />
		<ellipse cx={180} cy={576} rx={110} ry={10} fill="#0A0706" opacity={0.6} />
		<ellipse cx={510} cy={576} rx={120} ry={10} fill="#0A0706" opacity={0.6} />
		{/* face close-ups (the same drawing at 3.4×) */}
		<FaceInset x={22} y={22} old={false} />
		<FaceInset x={548} y={22} old flip />
		{/* 20: 北部尉, slim, no beard, 武冠 over a dark 帻, 皂 robe with 黄绶, holding a 五色棒 upright */}
		<g transform={`translate(190,${572 - 750 * S}) scale(${S})`} filter="url(#heroRim)">
			<Cao pal={PAL} id="c20" old={false} armour={false} arm={{sh: [8, 84], el: [20, 206], hd: [108, 240]}} far={{sh: [-20, 80], el: [-34, 200], hd: [-18, 300]}}
				prop="rod" propA={[120, 744]} propB={[104, 120]} />
		</g>
		{/* 46: 札甲 lamellar, short beard, cape, hand on the 环首刀 */}
		<g transform={`translate(500,${572 - 750 * S}) scale(${-S},${S})`} filter="url(#heroRim)">
			<Cao pal={PAL} id="c46" old armour arm={{sh: [10, 84], el: [22, 200], hd: [54, 266]}} far={{sh: [-20, 80], el: [-44, 196], hd: [-34, 296]}} cape={0.3} />
		</g>
	</svg>; };

const FaceInset: React.FC<{x: number; y: number; old: boolean; flip?: boolean}> = ({x, y, old, flip}) => <g>
	<svg x={x} y={y} width={120} height={140} viewBox={flip ? '-74 -122 150 175' : '-76 -122 150 175'}>
		<rect x={-200} y={-300} width={400} height={500} fill="#1A242A" />
		<rect x={-200} y={-300} width={400} height={500} fill="url(#hkey)" opacity={0.6} />
		<g transform={flip ? 'scale(-1,1)' : undefined} filter="url(#heroRimS)">
			<Cao pal={PAL} id={old ? 'i46' : 'i20'} old={old} armour={old} arm={{sh: [10, 84], el: [22, 200], hd: [54, 266]}} dao={false} />
		</g>
	</svg>
	<rect x={x} y={y} width={120} height={140} fill="none" stroke="#5A4C40" strokeWidth={1.2} />
	<text x={x} y={y + 162} fontFamily={SANS} fontSize={17} fill={CREAM} opacity={0.8}>{old ? '46岁 · 短须' : '20岁 · 无须'}</text>
</g>;

/* ---------- 3. props ---------- */
const Cell: React.FC<{x: number; id: string; children: React.ReactNode}> = ({x, id, children}) => <svg x={x} y={770} width={282} height={215} viewBox="0 0 282 215">
	<defs>
		<linearGradient id={`cb${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1B252C" /><stop offset="0.82" stopColor="#2B3133" /><stop offset="0.83" stopColor="#30281F" /><stop offset="1" stopColor="#1A1410" /></linearGradient>
		<radialGradient id={`ck${id}`} cx="0.72" cy="0.3" r="0.7"><stop offset="0" stopColor={KEY} stopOpacity="0.22" /><stop offset="1" stopColor={KEY} stopOpacity="0" /></radialGradient>
	</defs>
	<rect width={282} height={215} fill={`url(#cb${id})`} /><rect width={282} height={215} fill={`url(#ck${id})`} />
	{children}
</svg>;
const PropRow: React.FC = () => { const xs = [40, 334, 628, 922, 1216];
	return <g>
		<defs>
			<RimF id="prRim" lx={0.8} ly={-0.6} k={2.2} c={RIMW} o={0.9} />
			<RimF id="prRimC" lx={0.8} ly={-0.6} k={1.6} c="#FFE0B0" o={0.7} />
		</defs>
		{/* 五色棒 rack: 青 赤 黄 白 黑, ten rods on a timber frame */}
		<Cell x={xs[0]} id="a">
			<g filter="url(#prRimC)">
				<rect x={44} y={40} width={10} height={140} fill="#3A2A1E" /><rect x={226} y={40} width={10} height={140} fill="#3A2A1E" />
				<rect x={38} y={34} width={204} height={9} fill="#4A3626" /><rect x={40} y={110} width={200} height={7} fill="#3A2A1E" />
				<rect x={36} y={168} width={208} height={14} fill="#2E2218" />
			</g>
			{Array.from({length: 8}, (_, i) => <Rod5 key={i} a={[70 + i * 20.5, 172]} b={[66 + i * 20.5 + (i % 3) * 2, 20 + (i % 2) * 5]} r={6.6} ph={(i * 2) % 5} lit={-1} />)}
			<rect x={38} y={34} width={204} height={9} fill="#4A3626" /><rect x={38} y={34} width={204} height={2.5} fill="#C9A06A" opacity={0.6} />
			<rect x={40} y={110} width={200} height={7} fill="#3A2A1E" opacity={0.92} /><rect x={40} y={110} width={200} height={2} fill="#C9A06A" opacity={0.45} />
			<rect x={36} y={168} width={208} height={14} fill="#2E2218" /><rect x={36} y={168} width={208} height={3} fill="#C9A06A" opacity={0.45} />
		</Cell>
		{/* 环首刀: the drawn blade and its scabbard */}
		<Cell x={xs[1]} id="b">
			<g filter="url(#prRimC)">
				<Dao a={[44, 64]} b={[256, 136]} pal={PAL} drawn />
				<Dao a={[30, 108]} b={[246, 182]} pal={PAL} />
			</g>
		</Cell>
		{/* a tall Han banner: pole with a spear finial, the flag along the pole, streamers (旒) */}
		<Cell x={xs[2]} id="c">
			<g filter="url(#prRim)">
				<rect x={98} y={12} width={6} height={194} fill="#2A1C12" />
				<path d="M101,2 L97,14 L105,14 Z" fill="#8C8A84" />
				<path d="M104,22 L196,26 C192,60 198,100 194,150 L104,148 Z" fill="#6E2620" />
				<path d="M150,24 C148,60 152,100 150,149 L194,150 C198,100 192,60 196,26 Z" fill="#8A3428" opacity={0.6} />
				<path d="M104,148 L194,150 L190,158 L104,156 Z" fill="#3E1612" />
				{[0, 1, 2].map((i) => <path key={i} d={`M${120 + i * 28},156 C${118 + i * 28},170 ${126 + i * 28},182 ${122 + i * 28},198 L${130 + i * 28},196 C${133 + i * 28},180 ${126 + i * 28},170 ${128 + i * 28},156 Z`} fill="#5A1E18" />)}
			</g>
			<text x={150} y={110} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={64} fill="#F2E2C2">曹</text>
		</Cell>
		{/* 囷: a Han round granary (as in the pottery models): rendered drum, thatched cone, hatch and ladder */}
		<Cell x={xs[3]} id="d">
			<defs><linearGradient id="qun" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2A221C" /><stop offset="0.55" stopColor="#5A4A3A" /><stop offset="0.85" stopColor="#9A7E5E" /><stop offset="1" stopColor="#6A5642" /></linearGradient>
				<linearGradient id="thatch" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2A2016" /><stop offset="0.6" stopColor="#5E4C30" /><stop offset="0.9" stopColor="#A08458" /><stop offset="1" stopColor="#6E5A3C" /></linearGradient></defs>
			<g filter="url(#prRimC)">
				<path d="M74,180 L210,180 L214,190 L70,190 Z" fill="#2A2018" />
				<path d="M82,180 L80,96 C110,90 174,90 204,96 L202,180 Z" fill="url(#qun)" />
				{[110, 130, 150, 170].map((y) => <path key={y} d={`M81,${y} C120,${y + 5} 164,${y + 5} 203,${y}`} stroke="#000" strokeOpacity={0.2} fill="none" />)}
				<rect x={150} y={104} width={24} height={22} fill="#120C08" /><rect x={150} y={104} width={24} height={3} fill="#C9A06A" opacity={0.5} />
				<path d="M58,102 C100,92 184,92 226,102 L226,98 L142,28 L58,98 Z" fill="url(#thatch)" />
				{Array.from({length: 13}, (_, i) => <path key={i} d={`M142,30 L${62 + i * 13.3},${100 - Math.abs(i - 6) * 0.6}`} stroke="#1E160E" strokeOpacity={0.35} strokeWidth={1.2} />)}
				<path d="M58,102 C100,92 184,92 226,102" stroke="#C9A878" strokeOpacity={0.5} fill="none" strokeWidth={1.5} />
				<rect x={137} y={16} width={10} height={14} rx={4} fill="#3A2A1C" />
				<path d="M186,186 L170,110 M200,184 L184,108" stroke="#3A2A1C" strokeWidth={3} />
				{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${183 - i * 3.2},${172 - i * 14} L${197 - i * 3.2},${170 - i * 14}`} stroke="#3A2A1C" strokeWidth={2.4} />)}
			</g>
		</Cell>
		{/* 高橹: 袁绍's archery tower on a raised earth mound (土山), archers on the shielded platform */}
		<Cell x={xs[4]} id="e">
			<g fill={SIL} filter="url(#prRim)">
				<path d="M0,215 L0,196 C50,184 90,170 140,168 C190,168 240,182 282,192 L282,215 Z" />
				<path d="M100,172 L120,58 L126,58 L108,172 Z M180,172 L160,58 L154,58 L172,172 Z" />
				<path d="M108,160 L166,92 L170,96 L112,164 Z M174,160 L116,92 L112,96 L170,164 Z M112,120 L168,120 L168,126 L112,126 Z" />
				<path d="M100,58 L180,58 L182,40 L98,40 Z" />
				{Array.from({length: 8}, (_, i) => <path key={i} d={`M${100 + i * 10},40 L${104 + i * 10},30 L${108 + i * 10},40 Z`} />)}
				<path d="M92,28 L188,28 L170,12 L110,12 Z" /><path d="M140,12 L140,28" stroke={SIL} />
				<Man x={124} y={40} h={34} /><Man x={154} y={40} h={34} flip />
				<path d="M134,22 C140,14 140,34 134,26" fill="none" stroke={SIL} strokeWidth={1.5} />
			</g>
			{[0, 1, 2].map((i) => <path key={i} d={`M${96 - i * 6},${50 + i * 8} Q${50 - i * 6},${20 + i * 10} ${10 - i * 4},${70 + i * 14}`} fill="none" stroke="#E8D8BC" strokeOpacity={0.4} strokeWidth={1} strokeDasharray="10 7" />)}
		</Cell>
	</g>; };

/* ---------- 4. palette ---------- */
const SW8: [string, string, boolean?][] = [['#16222B', '夜空 石青'], ['#4F5D58', '雾 · 远景'], ['#2C251F', '夯土城墙'], [SIL, '剪影 暖黑'],
	[KEY, '主光 灯光'], [RIMW, '主光边缘光'], [ACC, '曹操 强调光', true], ['#C38D64', '曹操 肤色']];
const Palette: React.FC = () => <g>
	{SW8.map(([c, n, acc], i) => { const col = i % 2, row = Math.floor(i / 2), x = 1532 + col * 178, y = 772 + row * 56;
		return <g key={c}>
			<rect x={x} y={y} width={44} height={44} rx={4} fill={c} stroke={acc ? ACC : '#3A302A'} strokeWidth={acc ? 3 : 1} />
			{acc && <rect x={x - 5} y={y - 5} width={54} height={54} rx={7} fill="none" stroke={ACC} strokeWidth={1.4} strokeDasharray="4 3" />}
			<text x={x + 54} y={y + 18} fontFamily={SANS} fontSize={19} fontWeight={700} fill={acc ? ACC : CREAM}>{n}</text>
			<text x={x + 54} y={y + 40} fontFamily={SANS} fontSize={17} fill={CREAM} opacity={0.7}>{c.toUpperCase()}</text>
		</g>; })}
</g>;

const Cap: React.FC<{x: number; y: number; s: string; sub?: string; anchor?: 'start' | 'middle'}> = ({x, y, s, sub, anchor = 'start'}) => <text x={x} y={y} textAnchor={anchor} fontFamily={SANS} fill={CREAM}>
	<tspan fontSize={24} fontWeight={700}>{s}</tspan>{sub && <tspan fontSize={21} opacity={0.72} dx={10}>{sub}</tspan>}</text>;

export const Look1: React.FC = () => <svg width={W} height={H} style={{position: 'absolute'}}>
	<rect width={W} height={H} fill={BOARD} />
	<SetGate />
	<rect x={40} y={70} width={SW} height={SH} fill="none" stroke="#3A302A" strokeWidth={1.5} />
	<HeroPanel />
	<rect x={1190} y={70} width={690} height={630} fill="none" stroke="#3A302A" strokeWidth={1.5} />
	<Cap x={40} y={734} s="布景 · 东汉洛阳城门 · 夜" sub="门楼 · 双阙 · 一门三道（平梁门洞）· 夯土城墙 · 一盏主光：门洞灯火" />
	<Cap x={1190} y={734} s="曹操 20岁 · 46岁" sub="唯一画出面孔的人物 · 主光 + 石青强调边光" />
	<PropRow />
	{['五色棒架 · 青赤黄白黑', '环首刀 · 刀与鞘', '大旗 · 曹', '囷 · 汉代圆仓', '高橹 · 袁军箭楼'].map((s, i) => <Cap key={s} x={40 + i * 294} y={1014} s={s} />)}
	<Palette />
	<Cap x={1532} y={1014} s="色板" sub="暖黑剪影 + 石青夜" />
</svg>;
export const Look2: React.FC = () => <svg width={W} height={H} style={{position: 'absolute'}}><rect width={W} height={H} fill="#222" /></svg>;
export const Look3: React.FC = () => <svg width={W} height={H} style={{position: 'absolute'}}><rect width={W} height={H} fill="#333" /></svg>;
void ROD5; void Sack; void f1; type _P = P;
