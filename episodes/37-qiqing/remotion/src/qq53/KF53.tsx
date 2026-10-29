import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H, Subs, rnd, cl, lerp, KAI, SAFE_X, SAFE_Y} from '../qq50/kit50';
import {B, thB, LacDefs, Lacquer, Vignette, Pool, SealB} from '../qq50/styleB';
import {useStampFonts, YEAR} from '../qq44/skin44';
import {Sword, RingDisc, Knife, blob, BZ, LAT, SW} from './props53';
/* ep53 越王勾践剑 · three style frames for the one-take film (B「漆」 night, the ep50/51 engine layer).
   KF53-ALL renders frame i = [HOOK, DESCENT, MACRO][i]; one id per frame as well.
   Furniture at final positions: layout-D subtitle (top-left, placeholder copy), two-line stamp top-right, J seal bottom-right.
   No counter in this film (brief: captions, stamp, seal). */

const Fonts: React.FC<{s: string}> = ({s}) => { useStampFonts(s); return null; };
const StampK: React.FC<{y: string; place?: string; note: string}> = ({y, place, note}) => { useStampFonts(`${y}${place ?? ''}${note}·`);
	return <div style={{position: 'absolute', top: SAFE_Y + 6, right: SAFE_X + 40, textAlign: 'right', paddingRight: 14, borderRight: `3px solid ${thB.rule}`, color: thB.ink, textShadow: thB.halo, whiteSpace: 'nowrap'}}>
		<div style={{lineHeight: 1.15, display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 10}}>
			<span style={{fontFamily: YEAR, fontWeight: 600, fontSize: 48}}>{y}</span>
			{place && <><span style={{fontFamily: YEAR, fontWeight: 600, fontSize: 32, color: thB.rule}}>·</span><span style={{fontFamily: KAI, fontWeight: 700, fontSize: 36, letterSpacing: '0.05em'}}>{place}</span></>}</div>
		<div style={{fontFamily: KAI, fontWeight: 700, fontSize: 30, lineHeight: 1.45, marginTop: 2, letterSpacing: '0.04em', opacity: 0.88}}>{note}</div>
	</div>; };
const Frame: React.FC<{id: string; children: React.ReactNode; over?: React.ReactNode; sheen?: number}> = ({id, children, over, sheen = 0.3}) => <>
	<svg width={W} height={H} style={{position: 'absolute'}}><LacDefs /><Lacquer sheen={sheen} id={id} />{children}<Vignette id={id} /></svg>{over}</>;

/* colour helpers */
const hx = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => { const A = hx(a), Bc = hx(b); return '#' + A.map((v, i) => Math.round(lerp(v, Bc[i], cl(t))).toString(16).padStart(2, '0')).join(''); };

/* =============================== 1 · HOOK (frame 0) ===============================
   Left: your kitchen counter at night, your cleaver lying on it, rust blooming along the spine and round the hole, water beads.
   Right: through the museum case glass, the sword standing in a spotlight, the brightest thing in frame. A tilted mirror on the
   plinth shows the pommel's ringed end (the museum shows the rings that way). The case's lit glass edge is the seam between the
   two worlds; the camera will push right, through that glass. */
const SX = 1245, SY = 912, SK = 14.6;   // sword: pommel end, px per cm (55.6 cm → 812 px, tip at y ≈ 100)
const Hook: React.FC = () => <Frame id="h" sheen={0.18} over={<><Fonts s="你的菜刀放久了就会生锈。湖北省博物馆越王勾践剑" /><Subs rows={[{s: '你的菜刀，放久了就会生锈。'}]} th={thB} /><StampK y="2026" place="湖北省博物馆" note="越王勾践剑" /><SealB /></>}>
	<defs>
		<linearGradient id="hCone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE2A8" stopOpacity="0.2" /><stop offset="0.6" stopColor="#FFD08A" stopOpacity="0.08" /><stop offset="1" stopColor="#FFC070" stopOpacity="0.02" /></linearGradient>
		<linearGradient id="hGlass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#E8F0F2" stopOpacity="0.07" /><stop offset="0.5" stopColor="#E8F0F2" stopOpacity="0.02" /><stop offset="1" stopColor="#E8F0F2" stopOpacity="0.05" /></linearGradient>
		<linearGradient id="hCtr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#231915" /><stop offset="1" stopColor="#120C0A" /></linearGradient>
		<filter id="hBl" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10" /></filter>
		<filter id="hBl2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.5" /></filter>
	</defs>
	{/* --- your kitchen: dark tiled splashback, the counter top, a weak under-cabinet light --- */}
	<rect x={-40} y={-20} width={1050} height={720} fill="#130B08" opacity={0.6} />
	<path d={Array.from({length: 12}, (_, i) => `M${-40 + i * 88},250 V700`).join(' ') + ' ' + [338, 426, 514, 602].map((y) => `M-40,${y} H1004`).join(' ')} stroke="#C8B89A" strokeOpacity={0.05} strokeWidth={1.5} />
	<rect x={-40} y={226} width={1048} height={24} fill="#0C0705" />
	<rect x={-40} y={248} width={1048} height={2} fill={B.gold} opacity={0.12} />
	<path d="M-40,700 L1004,700 L1004,1120 L-40,1120 Z" fill="url(#hCtr)" />
	<rect x={-40} y={698} width={1044} height={3} fill="#D8CDB8" opacity={0.18} />
	{Array.from({length: 140}, (_, i) => <circle key={i} cx={-30 + 1030 * rnd(i, 1)} cy={705 + 380 * rnd(i, 2)} r={0.8 + 1.4 * rnd(i, 3)} fill="#E8DCC8" opacity={0.04 + 0.05 * rnd(i, 4)} />)}
	<Pool id="hk" x={520} y={800} rx={520} ry={190} a={0.1} col="#E8D6B8" />
	{/* a wet ring where it was put down */}
	<ellipse cx={420} cy={930} rx={150} ry={26} fill="none" stroke="#B8B4AA" strokeOpacity={0.1} strokeWidth={3} />
	<Knife x={390} y={742} k={25} rot={-5} squash={0.56} id="k1" />
	{/* the near counter edge, out of focus (depth) */}
	<rect x={-60} y={1040} width={1080} height={80} fill="#090504" filter="url(#hBl)" opacity={0.9} />
	{/* --- the museum: the case on its plinth in the dark --- */}
	<rect x={1004} y={-20} width={960} height={1120} fill="#0B0605" opacity={0.55} />
	<path d={`M1060,-20 L1430,-20 L1430,935 L1060,935 Z`} fill="#140A07" />
	<path d="M1150,-20 L1340,-20 L1440,935 L1050,935 Z" fill="url(#hCone)" />
	<Pool id="hp" x={SX} y={930} rx={230} ry={30} a={0.36} col="#FFC878" />
	<Pool id="hs" x={SX} y={520} rx={200} ry={460} a={0.12} col="#FFC070" />
	{/* plinth */}
	<rect x={1030} y={935} width={430} height={170} fill="#1C100B" />
	<rect x={1030} y={933} width={430} height={3} fill={B.gold} opacity={0.4} />
	<rect x={1040} y={950} width={410} height={1.5} fill={B.gold} opacity={0.14} />
	{/* the clear holder */}
	<path d={`M${SX - 40},935 L${SX - 22},${SY - 60} M${SX + 40},935 L${SX + 22},${SY - 60}`} stroke="#E8F0F2" strokeOpacity={0.16} strokeWidth={3} />
	<rect x={SX - 46} y={928} width={92} height={7} fill="#E8F0F2" opacity={0.12} />
	<ellipse cx={SX} cy={SY + 6} rx={38} ry={6} fill="#000" opacity={0.4} />
	<Sword x={SX} y={SY} k={SK} id="hs1" />
	{/* the tilted mirror on the plinth: the 11 rings of the pommel's end */}
	<g transform="translate(1362,898)">
		<path d="M-6,40 L0,-4 L6,40 Z" fill="#2A1A12" />
		<ellipse cx={0} cy={0} rx={40} ry={36} fill="#0E0806" stroke={B.gold} strokeOpacity={0.55} strokeWidth={2} />
		<RingDisc x={0} y={0} r={30} ry={0.9} id="hm" />
		<path d="M-26,-16 Q-10,-30 14,-28" stroke="#FFFFFF" strokeOpacity={0.25} strokeWidth={3} fill="none" />
	</g>
	{/* dust in the spotlight */}
	{Array.from({length: 26}, (_, i) => { const yy = 40 + 860 * rnd(i, 7), half = lerp(95, 195, yy / 935); return <circle key={i} cx={SX - half + 2 * half * rnd(i, 8)} cy={yy} r={1 + 1.6 * rnd(i, 9)} fill="#FFE6B8" opacity={0.18 + 0.25 * rnd(i, 10)} />; })}
	{/* the glass: frame edges, a lit left edge (the seam between the two worlds), two soft reflections */}
	<rect x={1060} y={-20} width={370} height={955} fill="url(#hGlass)" />
	<path d="M1088,-20 L1170,-20 L1060,420 L1060,140 Z" fill="#F4F8FA" opacity={0.045} />
	<path d="M1360,180 L1400,180 L1300,935 L1258,935 Z" fill="#F4F8FA" opacity={0.035} />
	<rect x={1056} y={-20} width={5} height={955} fill="#E9EEF0" opacity={0.42} />
	<rect x={1427} y={-20} width={4} height={955} fill="#E9EEF0" opacity={0.2} />
	<rect x={1052} y={-20} width={14} height={955} fill="#E9EEF0" opacity={0.08} filter="url(#hBl2)" />
</Frame>;

/* =============================== 2 · DESCENT ===============================
   Below the museum floor the camera sinks. Section through the ground in the 漆 language (dark-on-dark, thin gold line):
   horizontal strata with thin year labels on their edges counting back (1990 → 1980 → 1970 → 1965), the stepped funnel of the
   Chu pit filled with rammed 五花土 in thin courses, then 青灰泥, then the pale 白膏泥 seal over the timber chamber (head box +
   the double coffin), a faint warm glow from the inner coffin. Motion: texture is smeared into vertical streaks, near clods and
   roots at the frame edges pass much faster (heavy smear = parallax), the far back wall of the pit moves slower, dust streaks.
   The 1965 label is sharp: the camera is slowing as it reaches the seal. No bones. */
const STRATA: [number, number, string][] = [[-40, 330, '#2A1C14'], [330, 470, '#34261B'], [470, 600, '#2C2118'], [600, 742, '#37322A'], [742, 1120, '#2B2119']];
const YEARS: [number, string, number][] = [[330, '1990', 0.5], [470, '1980', 0.7], [600, '1970', 0.88]];
const wallL: [number, number][] = [[352, -40], [372, 120], [452, 120], [472, 300], [552, 300], [572, 470], [652, 470], [662, 1120]];
const wallR = wallL.map(([x, y]) => [W - x, y] as [number, number]);
const wallAt = (y: number, side: -1 | 1) => { const ws = side < 0 ? wallL : wallR; for (let i = 0; i < ws.length - 1; i++) { const [x0, y0] = ws[i], [x1, y1] = ws[i + 1]; if (y >= y0 && y <= y1 && y1 > y0) return lerp(x0, x1, (y - y0) / (y1 - y0)); } return ws[ws.length - 1][0]; };
const pitD = `M${wallL.map(([x, y]) => `${x},${y}`).join('L')}L${[...wallR].reverse().map(([x, y]) => `${x},${y}`).join('L')}Z`;
const CH = {x0: 722, x1: 1198, y0: 812, y1: 1010};   // the timber chamber (椁)
/** a field of vertical streaks (texture smeared by the move): n streaks in a box, colours cycling */
const Streaks: React.FC<{x0: number; x1: number; y0: number; y1: number; n: number; seed: number; cols: string[]; o?: number; len?: number}> = ({x0, x1, y0, y1, n, seed, cols, o = 0.4, len = 40}) =>
	<g>{Array.from({length: n}, (_, i) => { const x = x0 + (x1 - x0) * rnd(i, seed), y = y0 + (y1 - y0) * rnd(i, seed + 1), w = 2 + 7 * rnd(i, seed + 2), L = len * (0.5 + rnd(i, seed + 3));
		return <rect key={i} x={x} y={Math.min(y, y1 - L * 0.5)} width={w} height={Math.min(L, y1 - y)} rx={w / 2} fill={cols[i % cols.length]} opacity={o * (0.5 + 0.5 * rnd(i, seed + 4))} />; })}</g>;
const Descent: React.FC = () => <Frame id="d" sheen={0.1} over={<><Fonts s="往下10.8米，是一座楚墓。江陵望山地下" /><Subs rows={[{s: '往下10.8米，是一座楚墓。'}]} th={thB} /><StampK y="1965" place="江陵望山" note="地下10.8米" /><SealB /></>}>
	<defs>
		<filter id="mbS" x="-5%" y="-10%" width="110%" height="120%"><feGaussianBlur stdDeviation="0.4 3" /></filter>
		<filter id="mbF" x="-5%" y="-10%" width="110%" height="120%"><feGaussianBlur stdDeviation="1.5 2.5" /></filter>
		<filter id="mbN" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="8 50" /></filter>
		<filter id="mbL" x="-10%" y="-80%" width="120%" height="260%"><feGaussianBlur stdDeviation="0.2 1.6" /></filter>
		<clipPath id="pitC"><path d={pitD} /></clipPath>
		<linearGradient id="shaft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE0B0" stopOpacity="0.1" /><stop offset="0.75" stopColor="#FFE0B0" stopOpacity="0.025" /><stop offset="1" stopColor="#FFE0B0" stopOpacity="0" /></linearGradient>
		<linearGradient id="speck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8A6E50" stopOpacity="0.9" /><stop offset="1" stopColor="#8A6E50" stopOpacity="0" /></linearGradient>
		<linearGradient id="claySide" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9E937C" /><stop offset="1" stopColor="#5E5646" /></linearGradient>
		<linearGradient id="clay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B9AE96" /><stop offset="0.5" stopColor="#A49880" /><stop offset="1" stopColor="#8C8068" /></linearGradient>
	</defs>
	{/* the section face: strata outside the pit, texture smeared into streaks */}
	<g filter="url(#mbS)">
		{STRATA.map(([y0, y1, c], i) => <g key={i}><rect x={-40} y={y0} width={W + 80} height={y1 - y0} fill={c} />
			<Streaks x0={-20} x1={W + 20} y0={y0} y1={y1} n={90} seed={i * 7 + 1} cols={['#4A3828', '#1A110B', '#3E3428']} o={0.45} len={i === 0 ? 70 : 40} /></g>)}
		{/* the pit fill: rammed 五花土 in thin courses, mottled (smeared) */}
		<g clipPath="url(#pitC)">
			<rect x={300} y={-40} width={1320} height={1160} fill="#3A2A1C" />
			<g opacity={0.5}>{Array.from({length: 26}, (_, k) => <rect key={k} x={300} y={-40 + k * 52} width={1320} height={26} fill="#2F2217" />)}</g>
			<Streaks x0={350} x1={1570} y0={-40} y1={612} n={220} seed={31} cols={['#5A4630', '#2A1E14', '#48443A', '#4E3424']} o={0.5} len={34} />
			{Array.from({length: 30}, (_, k) => <path key={`c${k}`} d={`M300,${-30 + k * 22} H1620`} stroke={B.gold} strokeOpacity={0.07} strokeWidth={1.5} />)}
			{/* 青灰泥 */}
			<rect x={300} y={612} width={1320} height={122} fill="#36362F" />
			<Streaks x0={350} x1={1570} y0={612} y1={732} n={60} seed={41} cols={['#4A4A42', '#262622']} o={0.5} len={24} />
			{/* 白膏泥: the pale seal over the chamber and down its sides */}
			<rect x={300} y={734} width={1320} height={400} fill="url(#claySide)" />
			<rect x={300} y={734} width={1320} height={CH.y0 - 8 - 734} fill="url(#clay)" />
			<Streaks x0={640} x1={1280} y0={738} y1={800} n={70} seed={51} cols={['#8A806C', '#CFC6B0']} o={0.35} len={14} />
		</g>
		{/* the pit's stepped walls, in gold line */}
		<path d={pitD} fill="none" stroke={B.gold} strokeOpacity={0.42} strokeWidth={2.2} strokeLinejoin="round" />
		<path d="M300,734 H1620" stroke="#EDE3CC" strokeOpacity={0.35} strokeWidth={1.5} />
		{STRATA.slice(1).map(([y0], i) => <path key={i} d={`M-40,${y0} H${wallAt(y0, -1)} M${wallAt(y0, 1)},${y0} H${W + 40}`} stroke={B.gold} strokeOpacity={0.22} strokeWidth={1.5} />)}
	</g>
	{/* the year labels on the band edges: thin, smeared a little (they are moving), fading as they rise away */}
	<g filter="url(#mbL)">{YEARS.map(([y, s, o]) => <g key={s} opacity={o}><path d={`M150,${y} H${wallAt(y, -1) - 6}`} stroke={B.gold} strokeOpacity={0.55} strokeWidth={1.5} />
		<text x={152} y={y - 12} fontFamily={YEAR} fontWeight={600} fontSize={46} fill="#F2E6CC" style={{paintOrder: 'stroke'}} stroke="#140B07" strokeWidth={5}>{s}</text></g>)}</g>
	{/* light from the shaft above: the camera's own path */}
	<path d="M840,-40 L1080,-40 L1130,734 L790,734 Z" fill="url(#shaft)" />
	{/* the chamber (椁) of heavy timbers under the seal: lid planks laid across (their ends in section), thick walls, the head box,
	    the double coffin (outer, inner, black lacquer with a dim red line), a faint warm glow round the inner lid */}
	<g>
		<rect x={CH.x0} y={CH.y0} width={CH.x1 - CH.x0} height={CH.y1 - CH.y0} fill="#1C110B" />
		{Array.from({length: 12}, (_, k) => <rect key={`l${k}`} x={CH.x0 + k * ((CH.x1 - CH.x0) / 12)} y={CH.y0} width={(CH.x1 - CH.x0) / 12 - 3} height={30} fill="#2A190F" stroke={B.gold} strokeOpacity={0.16} strokeWidth={1.2} />)}
		{Array.from({length: 12}, (_, k) => <circle key={`g${k}`} cx={CH.x0 + (k + 0.5) * ((CH.x1 - CH.x0) / 12)} cy={CH.y0 + 15} r={8} fill="none" stroke="#3E2A1A" strokeWidth={1.5} />)}
		<rect x={CH.x0} y={CH.y0 + 30} width={30} height={CH.y1 - CH.y0 - 30} fill="#24160D" /><rect x={CH.x1 - 30} y={CH.y0 + 30} width={30} height={CH.y1 - CH.y0 - 30} fill="#24160D" />
		{[0, 1, 2, 3].map((k) => <path key={`w${k}`} d={`M${CH.x0},${CH.y0 + 72 + k * 40} h30 M${CH.x1 - 30},${CH.y0 + 72 + k * 40} h30`} stroke={B.gold} strokeOpacity={0.14} strokeWidth={1.2} />)}
		<rect x={CH.x0 + 30} y={CH.y0 + 30} width={CH.x1 - CH.x0 - 60} height={CH.y1 - CH.y0 - 30} fill="#0F0806" />
		<rect x={CH.x0 + 30} y={CH.y0 + 30} width={110} height={CH.y1 - CH.y0 - 30} fill="#140B08" stroke={B.gold} strokeOpacity={0.16} strokeWidth={1.2} />
		<Pool id="tg" x={1010} y={930} rx={230} ry={100} a={0.36} col="#FFAA58" />
		<rect x={850} y={866} width={318} height={136} rx={6} fill="#130908" stroke={B.gold} strokeOpacity={0.38} strokeWidth={2} />
		<rect x={872} y={886} width={274} height={104} rx={5} fill="#0E0605" stroke={B.gold} strokeOpacity={0.5} strokeWidth={2} />
		<path d="M884,900 h250 M884,978 h250" stroke="#7A3020" strokeOpacity={0.4} strokeWidth={2} />
		<path d={Array.from({length: 6}, (_, i) => `M${900 + i * 42},939 l10,-8 l10,8 l-10,8 Z`).join(' ')} fill="none" stroke="#7A3020" strokeOpacity={0.32} strokeWidth={1.5} />
		<path d="M878,888 H1140" stroke="#FFC27A" strokeOpacity={0.45} strokeWidth={2} />
		<Pool id="tl" x={1008} y={888} rx={160} ry={16} a={0.5} col="#FFC888" />
		<rect x={CH.x0} y={CH.y0} width={CH.x1 - CH.x0} height={CH.y1 - CH.y0} fill="none" stroke={B.gold} strokeOpacity={0.3} strokeWidth={2} />
	</g>
	{/* the 1965 label on the seal's edge: sharp */}
	<g><path d={`M150,734 H${wallAt(734, -1) - 6}`} stroke={B.gold} strokeOpacity={0.8} strokeWidth={2} />
		<text x={152} y={720} fontFamily={YEAR} fontWeight={600} fontSize={54} fill={B.goldL} style={{paintOrder: 'stroke'}} stroke="#140B07" strokeWidth={5}>1965</text></g>
	{/* loose soil specks rushing up past the lens: a bright head on top, the smear trailing below */}
	{Array.from({length: 34}, (_, i) => { const x = 60 + 1800 * rnd(i, 41), y = 280 + 700 * rnd(i, 42), L = 30 + 80 * rnd(i, 43), w = 2 + 3 * rnd(i, 44);
		return <g key={i} opacity={0.25 + 0.35 * rnd(i, 45)}><rect x={x - w / 2} y={y} width={w} height={L} rx={w / 2} fill="url(#speck)" /><circle cx={x} cy={y + w / 2} r={w * 0.7} fill="#B89A74" /></g>; })}
	{/* near: clods and roots passing close to the lens, much faster (heavily smeared) */}
	<g filter="url(#mbN)">
		<path d={blob(1900, 420, 260, 7, 10, 0.4)} fill="#080403" />
		<path d={blob(-10, 1000, 240, 3, 10, 0.4)} fill="#080403" />
		<path d={blob(1880, 1060, 150, 5, 9, 0.4)} fill="#0A0504" />
		<path d="M1690,60 C1640,320 1720,520 1660,820" stroke="#1C110A" strokeWidth={14} fill="none" />
		<path d="M1600,200 C1560,380 1620,560 1590,760" stroke="#140C07" strokeWidth={8} fill="none" />
		<path d="M150,560 C120,700 190,820 140,980" stroke="#140C07" strokeWidth={9} fill="none" />
	</g>
</Frame>;

/* =============================== 3 · MACRO ===============================
   The camera skims a few millimetres above the blade. The diamond lattice is the land: a grid of diamonds (dark double lines,
   alternate diamonds pale = the tin-rich skin, a small dark diamond in the gold ones) draped over the raised central ridge,
   which runs to the vanishing point like a mountain spine; the polished edges fall away to darkness on both sides. A raking
   warm light from the right catches the raised rims of the pale diamonds (the thin tin layer). Near cells are smeared by the
   forward glide, the far ones soften into haze. Drawn, not photographed; no scale bar, no numbers. */
const MC = {v: -4.5, z: 13, pitch: 15 * Math.PI / 180, yaw: 2 * Math.PI / 180, f: 1500, cx: 960, cy: 760};
const HW0 = 24, RIDGE = 5, STRIP = 2.2;   // mm: half-width, ridge height, polished edge strip
const hwAt = (u: number) => HW0 - 0.006 * u;
const zAt = (u: number, v: number) => { const hw = hwAt(u), a = Math.min(1, Math.abs(v) / hw); return RIDGE * Math.pow(1 - a, 1.12) - (Math.abs(v) > hw - STRIP ? 0.9 * (Math.abs(v) - (hw - STRIP)) / STRIP : 0); };
const proj = (u: number, v: number, z: number): [number, number, number] => {
	const dx = v - MC.v, dy = z - MC.z, du = u;
	const x1 = dx * Math.cos(MC.yaw) - du * Math.sin(MC.yaw), d1 = dx * Math.sin(MC.yaw) + du * Math.cos(MC.yaw);
	const d2 = d1 * Math.cos(MC.pitch) - dy * Math.sin(MC.pitch), y2 = d1 * Math.sin(MC.pitch) + dy * Math.cos(MC.pitch);
	return [MC.cx + MC.f * x1 / d2, MC.cy - MC.f * y2 / d2, d2]; };
const PT = (u: number, v: number) => { const p = proj(u, v, zAt(u, v)); return `${p[0].toFixed(1)},${p[1].toFixed(1)}`; };
const FOG = '#1E100B';
type Cell = {u: number; v: number; d: string; dIn: string; dCore: string; pale: boolean; col: string; line: number; rim: number; fog: number};
const LA = 15, LW = 6.2;
const cellsMacro = (): Cell[] => { const out: Cell[] = [];
	const quad = (ca: number, cw: number, sc: number) => { const pts: string[] = [];
		const cs: [number, number][] = [[ca - LA / 2 * sc, cw], [ca, cw + LW / 2 * sc], [ca + LA / 2 * sc, cw], [ca, cw - LW / 2 * sc]];
		for (let e = 0; e < 4; e++) { const [a0, b0] = cs[e], [a1, b1] = cs[(e + 1) % 4];
			for (let s = 0; s < 6; s++) { const t = s / 6, uu = lerp(a0, a1, t), lim = hwAt(uu) - STRIP, vv = Math.max(-lim, Math.min(lim, lerp(b0, b1, t))); pts.push(PT(Math.max(uu, 14), vv)); } }
		return 'M' + pts.join('L') + 'Z'; };
	for (let i = -12; i <= 200; i++) for (let j = -12; j <= 200; j++) {
		const ca = (i + j + 1) / 2 * LA, cw = (i - j) / 2 * LW;
		if (ca < 8 || ca > 1400 || Math.abs(cw) > HW0 + LW / 2) continue;
		const pale = ((i + j) % 2 + 2) % 2 === 0;
		const side = cw > 0.5 ? 1 : cw < -0.5 ? -0.25 : 0.4;   // the right flank faces the light
		const spec = Math.exp(-Math.pow((ca - 75) / 40, 2)) * (0.45 + 0.55 * side);
		const fog = 1 - Math.exp(-Math.max(0, ca - 30) / 200);
		const jit = (rnd(i * 31 + j, 71) - 0.5) * 0.12, base = mix(pale ? '#D2B886' : '#B98443', pale ? '#8A6A3E' : '#6E4824', 0.2 + jit), lit = side > 0.5 ? 0 : 0.42;
		const col = mix(mix(mix(base, '#3A2410', lit), '#FFF6DC', spec * (pale ? 0.85 : 0.3)), FOG, fog * 0.94);
		const d = proj(ca, cw, zAt(ca, cw))[2];
		out.push({u: ca, v: cw, d: quad(ca, cw, 1), dIn: quad(ca, cw, 0.8), dCore: quad(ca, cw, 0.36), pale, col, line: Math.max(0.4, MC.f * 0.42 / d), rim: spec, fog}); }
	return out.sort((a, b) => b.u - a.u); };
const CellG: React.FC<{c: Cell}> = ({c}) => <g>
	<path d={c.d} fill={c.col} stroke={mix(LAT, FOG, c.fog * 0.8)} strokeWidth={c.line} strokeLinejoin="round" />
	<path d={c.dIn} fill="none" stroke={mix(LAT, FOG, c.fog * 0.8)} strokeWidth={c.line * 0.38} strokeOpacity={0.8} />
	{!c.pale && <path d={c.dCore} fill={mix(LAT, FOG, c.fog * 0.8)} opacity={0.75} />}
	{c.pale && c.fog < 0.75 && <path d={c.dIn} fill="none" stroke="#FFF8E4" strokeWidth={c.line * 0.3} strokeOpacity={cl(0.15 + 0.85 * c.rim) * (1 - c.fog)} transform={`translate(${c.line * 0.18},${-c.line * 0.22})`} />}
</g>;
const Macro: React.FC = () => { const cells = cellsMacro();
	const near = cells.filter((c) => c.u < 34), mid = cells.filter((c) => c.u >= 34 && c.u < 220), far = cells.filter((c) => c.u >= 220);
	/* pitting and a faint bloom of corrosion (E8: lightly corroded, not rust-free), scattered over the near and middle ground */
	const pits = Array.from({length: 260}, (_, i) => { const u = 20 + 260 * Math.pow(rnd(i, 81), 1.6), v = (rnd(i, 82) - 0.5) * 2 * (hwAt(u) - STRIP), p = proj(u, v, zAt(u, v)), r = MC.f * (0.08 + 0.18 * rnd(i, 83)) / p[2];
		return <ellipse key={i} cx={p[0]} cy={p[1]} rx={r} ry={r * 0.45} fill="#2A180C" opacity={0.35 + 0.3 * rnd(i, 84)} />; });
	const blooms = [[60, 9, 2.2], [140, -12, 3.0], [46, -15, 1.6], [230, 4, 4]].map(([u, v, r], i) => { const p = proj(u, v, zAt(u, v)), R = MC.f * r / p[2]; return <ellipse key={i} cx={p[0]} cy={p[1]} rx={R} ry={R * 0.4} fill="#3A2A1A" opacity={0.28} filter="url(#mBloom)" />; });
	/* the polished edge strips, as quads along u with fog */
	const strip = (s: 1 | -1) => Array.from({length: 60}, (_, k) => { const u0 = 14 * Math.pow(1400 / 14, k / 60), u1 = 14 * Math.pow(1400 / 14, (k + 1) / 60), fog = 1 - Math.exp(-Math.max(0, u0 - 30) / 200);
		const spec = Math.exp(-Math.pow((u0 - 75) / 45, 2));
		const col = mix(mix(s > 0 ? '#F2D79C' : '#A97C40', '#FFFBEA', spec * (s > 0 ? 0.7 : 0.25)), FOG, fog * 0.92);
		const a = hwAt(u0) - STRIP, b = hwAt(u0), c = hwAt(u1) - STRIP, d = hwAt(u1);
		return <path key={k} d={`M${PT(u0, s * a)}L${PT(u0, s * b)}L${PT(u1, s * d)}L${PT(u1, s * c)}Z`} fill={col} stroke={col} strokeWidth={0.6} />; });
	/* the ridge: one continuous lit line (a polyline per fog step, butt caps so it never beads) */
	const ridge = Array.from({length: 30}, (_, k) => { const us = Array.from({length: 5}, (_, q) => 16 * Math.pow(1400 / 16, (k + q / 4) / 30)), fog = 1 - Math.exp(-Math.max(0, us[0] - 30) / 200);
		const pts = us.map((u) => proj(u, 0, RIDGE)), d0 = pts[0][2];
		return <polyline key={k} points={pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} fill="none" stroke="#FFF2D0" strokeOpacity={0.7 * (1 - fog)} strokeWidth={Math.max(0.8, MC.f * 0.16 / d0)} strokeLinecap="butt" />; });
	const hz = MC.cy - MC.f * Math.tan(MC.pitch);
	return <Frame id="m" sheen={0.08} over={<><Fonts s="这些菱形纹，是热镀上去的锡。湖北省博物馆热镀锡" /><Subs rows={[{s: '这些菱形纹，是热镀上去的锡。'}]} th={thB} /><StampK y="2025" place="湖北省博物馆" note="热镀锡" /><SealB /></>}>
		<defs>
			<filter id="mNear" x="-10%" y="-20%" width="120%" height="140%"><feGaussianBlur stdDeviation="2 9" /></filter>
			<filter id="mFar" x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation="1.3" /></filter>
			<filter id="mBok" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" /></filter>
			<filter id="mBloom" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
		</defs>
		{/* the haze on the horizon where the blade runs out of sight */}
		<Pool id="mh" x={1000} y={hz + 8} rx={720} ry={70} a={0.22} col="#FFC478" />
		<g filter="url(#mFar)">{far.map((c, i) => <CellG key={i} c={c} />)}</g>
		{mid.map((c, i) => <CellG key={i} c={c} />)}
		{blooms}{pits}
		<g filter="url(#mNear)">{near.map((c, i) => <CellG key={i} c={c} />)}</g>
		{strip(1)}{strip(-1)}
		{ridge}
		{/* the raking light: a soft warm sheet across the middle distance */}
		<Pool id="ml" x={1240} y={hz + 150} rx={640} ry={110} a={0.16} col="#FFE2A8" />
		{/* out-of-focus dust in front of the lens */}
		<g filter="url(#mBok)">{[[260, 860, 46, 0.1], [1500, 930, 64, 0.08], [1660, 560, 30, 0.12], [620, 520, 22, 0.1], [1180, 780, 36, 0.07]].map(([x, y, r, o], i) => <circle key={i} cx={x} cy={y} r={r} fill="#FFE0A8" opacity={o} />)}</g>
		{Array.from({length: 40}, (_, i) => <circle key={`s${i}`} cx={120 + 1680 * rnd(i, 51)} cy={hz + 20 + 640 * rnd(i, 52)} r={0.8 + 1.4 * rnd(i, 53)} fill="#FFF0D0" opacity={0.15 + 0.3 * rnd(i, 54)} />)}
	</Frame>; };

/* =========================================== registration =========================================== */
const KFS: [string, React.FC][] = [['HOOK', Hook], ['DESCENT', Descent], ['MACRO', Macro]];
const one = (C: React.FC): React.FC => () => <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><C /></AbsoluteFill>;
const All: React.FC = () => { const f = useCurrentFrame(), C = KFS[Math.min(KFS.length - 1, f)][1]; return <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}><C /></AbsoluteFill>; };
const Root: React.FC = () => <>
	<Composition id="KF53-ALL" component={All} width={W} height={H} fps={30} durationInFrames={KFS.length} />
	{KFS.map(([n, C]) => <Composition key={n} id={`KF53-${n}`} component={one(C)} width={W} height={H} fps={30} durationInFrames={1} />)}
</>;
registerRoot(Root);
void BZ; void SW;
