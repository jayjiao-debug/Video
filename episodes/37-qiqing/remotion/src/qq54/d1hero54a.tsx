import React from 'react';
import {P, f1, rnd} from './cao54b';
/* ep54 · D1 variant A, redrawn to the owner's target picture (film 101.60). 曹操 in film space at the HOLD pose (1920×1080, before the
   hold camera): the dutch lean is drawn in, the body runs from the head (≈1390, 280) down-right to the bottom-right corner.
   Look B: flat cel planes, one warm key from the fires on the left, the 石青 rim #8FD0DC on his back edges.
   Parts (back → front): CapeA (the great maroon wing billowing up-left), TorsoA (札甲 with red-laced borders, the diagonal belt and its
   带钩 plaque, the skirt panels, the bent off arm), NeckA + CollarA (交领, red scarf), HeadA (3/4 to screen right, tilted ~29°, the eyes
   cut back at the lens; a short dense greying beard; an iron cap with a rim band, a mail aventail and a red ribbon plume), PaulA (the
   layered near 披膊), VambA (the iron vambrace + red cuff seen end-on), FistA (the big fist on the grip). */
export const ACC = '#8FD0DC';
const cl = (v: number) => Math.min(1, Math.max(0, v));
const pp = (a: P[]) => a.map((p) => f1(p[0]) + ',' + f1(p[1])).join(' ');
const lerp = (a: P, b: P, k: number): P => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
/** cubic bezier through 4 points, sampled */
const cub = (a: P, b: P, c: P, d: P, u: number): P => { const m = 1 - u; return [m * m * m * a[0] + 3 * m * m * u * b[0] + 3 * m * u * u * c[0] + u * u * u * d[0], m * m * m * a[1] + 3 * m * m * u * b[1] + 3 * m * u * u * c[1] + u * u * u * d[1]]; };
/** a poly-bezier [p0, c1, c2, p1, c1, c2, p2, …] sampled at u ∈ [0,1] */
const pb = (k: P[], u: number): P => { const n = (k.length - 1) / 3, x = Math.min(n - 1e-6, Math.max(0, u * n)), i = Math.floor(x); return cub(k[i * 3], k[i * 3 + 1], k[i * 3 + 2], k[i * 3 + 3], x - i); };

export const HDefs: React.FC = () => <>
	{/* lamellae: small plates in rows, laced; the rows follow the lean */}
	<pattern id="d1Lm" width={13} height={15} patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
		<rect width={13} height={15} fill="#141110" />
		<path d="M0.9,0.9 L12.1,0.9 L12.1,11.6 C9.4,13.4 3.6,13.4 0.9,11.6 Z" fill="#26201C" />
		<rect x={0.9} y={0.9} width={11.2} height={1.6} fill="#9A8270" opacity={0.16} />
		<rect x={0} y={13.4} width={13} height={1.6} fill="#3A1612" opacity={0.8} /></pattern>
	<pattern id="d1LmL" width={13} height={15} patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
		<rect width={13} height={15} fill="#191411" />
		<path d="M0.9,0.9 L12.1,0.9 L12.1,11.6 C9.4,13.4 3.6,13.4 0.9,11.6 Z" fill="#332A24" />
		<rect x={0.9} y={0.9} width={11.2} height={1.6} fill="#D8A070" opacity={0.2} />
		<rect x={0} y={13.4} width={13} height={1.6} fill="#4A1C16" opacity={0.8} /></pattern>
	{/* mail / scale aventail */}
	<pattern id="d1Ml" width={7} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
		<rect width={7} height={6} fill="#262628" /><path d="M0.5,0.5 L6.5,0.5 L6.5,3.8 C5,5.5 2,5.5 0.5,3.8 Z" fill="#46464A" />
		<rect x={0.5} y={0.5} width={6} height={1.1} fill="#A8A8B0" opacity={0.22} /></pattern>
	<linearGradient id="d1Cp" x1={1250} y1={300} x2={540} y2={460} gradientUnits="userSpaceOnUse">
		<stop offset="0" stopColor="#2A0E10" /><stop offset="0.55" stopColor="#3A1416" /><stop offset="1" stopColor="#4A1A1C" /></linearGradient>
	<radialGradient id="d1Fh" cx={1190} cy={520} r={150} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFB070" stopOpacity="0.35" /><stop offset="1" stopColor="#FFB070" stopOpacity="0" /></radialGradient>
</>;

/* ---------- the cape: a wedge from the shoulders (u = 0) to the tip up-left (u = 1); v = 0 its top edge … 1 its bottom edge.
   cu = how far it is unfurled (0 furled at the shoulders → 1, with overshoot); a travelling wave runs along it ---------- */
const CTOP: P[] = [[1262, 214], [1180, 212], [1060, 226], [930, 230], [820, 234], [700, 250], [630, 308], [585, 350], [556, 410], [540, 462]];
const CBOT: P[] = [[1205, 800], [1170, 720], [1150, 640], [1110, 580], [1000, 520], [860, 498], [760, 486], [660, 474], [590, 466], [540, 462]];
const ANCH: P = [1330, 420];
const capePt = (u: number, v: number, t: number, cu: number): P => {
	const a = pb(CTOP, u), b = pb(CBOT, u), m = lerp(a, b, v);
	/* the travelling wave: the folds ripple at ~1.2 Hz, the wave runs from the shoulder to the tip; amplitude grows to the tip */
	const ph = 2 * Math.PI * (1.2 * t - 1.1 * u) + v * 2.2, amp = (6 + 22 * u * u) * (0.6 + 0.4 * Math.sin(v * 3 + 1));
	const w: P = [Math.sin(ph) * amp * 0.35, Math.cos(ph) * amp];
	const p: P = [m[0] + w[0] * cl(u * 3), m[1] + w[1] * cl(u * 3)];
	/* the unfurl: from the anchor, scaled and swung down (furled) to the full spread (with overshoot) */
	const s = 0.18 + 0.82 * cu, rot = (1 - cu) * 0.9, dx = p[0] - ANCH[0], dy = p[1] - ANCH[1];
	return [ANCH[0] + s * (dx * Math.cos(rot) - dy * Math.sin(rot)), ANCH[1] + s * (dx * Math.sin(rot) + dy * Math.cos(rot))];
};
const band = (v0: number, v1: number, t: number, cu: number, u0 = 0, u1 = 1) => { const N = 26, A: P[] = [], B: P[] = [];
	for (let i = 0; i <= N; i++) { const u = u0 + ((u1 - u0) * i) / N; A.push(capePt(u, v0, t, cu)); B.push(capePt(u, v1, t, cu)); }
	return `M${pp(A)} L${pp(B.reverse())} Z`; };
export const CapeA: React.FC<{t: number; cu: number}> = ({t, cu}) => {
	/* fold bands (v ranges) and their tones: lit crest at the top edge, a dark trough, a lit warm fold, the dark underside */
	const B: [number, number, string, number][] = [[0, 1, 'url(#d1Cp)', 1], [0, 0.06, '#7A2C26', 0.95], [0.06, 0.16, '#5A2022', 0.85], [0.2, 0.3, '#160608', 0.6],
		[0.33, 0.43, '#5E2426', 0.75], [0.42, 0.46, '#8A3A2E', 0.45], [0.5, 0.62, '#160608', 0.5], [0.66, 0.74, '#4A1C1E', 0.55], [0.8, 1, '#120506', 0.5]];
	const fl = 0.5 + 0.5 * Math.sin(t * 7.3) * Math.sin(t * 3.1 + 1);
	const hw = Math.sin(t * 2 * Math.PI * 1.1 - 0.6) * 5;
	return <g>
		{B.map(([v0, v1, c, o], i) => <path key={i} d={band(v0, v1, t, cu)} fill={c} opacity={o} />)}
		{/* the lit top edge (the fire behind catches it) and the cool rim on the underside near the tip */}
		<path d={band(0, 0.02, t, cu, 0.05, 1)} fill="#D8744A" opacity={0.55 + 0.15 * fl} />
		<path d={band(0.975, 1, t, cu, 0.55, 1)} fill={ACC} opacity={0.35} />
		{/* the cape hanging behind his body under the sword arm (between the fist and the torso's edge), swaying */}
		<g opacity={cl(cu * 1.5)}>
			<path d={`M1272,520 C1340,560 1420,636 1492,688 L1492,940 C1424,${930 + hw} 1340,${902 + hw} ${1266 + hw},${862 + hw} C1226,832 1198,800 1186,770 Z`} fill="#3A1416" />
			<path d={`M1300,596 C1344,660 ${1380 + hw},760 ${1398 + hw},900`} fill="none" stroke="#6A2A28" strokeWidth={26} opacity={0.75} />
			<path d={`M1246,690 C1286,752 ${1316 + hw},826 ${1330 + hw},896`} fill="none" stroke="#5A2224" strokeWidth={18} opacity={0.7} />
			<path d={`M1316,604 C1358,668 ${1392 + hw},766 ${1408 + hw},892`} fill="none" stroke="#B0503A" strokeWidth={3} opacity={0.45} />
			<path d={`M1186,770 C1198,800 1226,832 ${1266 + hw},${862 + hw}`} fill="none" stroke={ACC} strokeWidth={2.6} opacity={0.45} />
		</g>
	</g>; };
/** the cape's far side, flaring up behind the head on screen right */
export const CapeFarA: React.FC<{t: number}> = ({t}) => { const w = Math.sin(t * 2 * Math.PI * 1.1) * 6, w2 = Math.sin(t * 2 * Math.PI * 1.1 - 1.2) * 5;
	return <g>
		<path d={`M1405,236 C1440,${208 + w} 1500,${206 + w} 1536,${232 + w2} C1562,${262 + w2} 1566,310 1556,350 C1540,384 1500,398 1460,404 L1430,330 Z`} fill="#4A1C1A" />
		<path d={`M1430,232 C1470,${214 + w} 1510,${216 + w} 1536,${236 + w2} C1548,${256 + w2} 1552,280 1550,300 C1530,270 1500,250 1460,246 Z`} fill="#6E2E28" opacity={0.85} />
		<path d={`M1536,${232 + w2} C1562,${262 + w2} 1566,310 1556,350`} fill="none" stroke="#E0804E" strokeWidth={3} opacity={0.45} />
	</g>; };

/* ---------- the body (film space, hold pose) ---------- */
const TORSO = 'M1330,420 C1380,394 1440,384 1500,384 C1562,384 1622,402 1662,442 C1690,470 1706,500 1714,532 L1722,562 C1760,610 1830,660 1920,700 L1930,1010 L1488,1010 L1488,706 C1452,700 1424,688 1408,662 C1392,634 1372,604 1360,582 C1340,544 1322,480 1330,420 Z';
const BELT = 'M1436,612 C1480,600 1520,590 1560,578 C1600,566 1640,554 1668,546 C1700,537 1726,530 1748,524 L1760,566 C1730,574 1700,582 1670,590 C1640,598 1604,610 1566,622 C1526,634 1486,648 1450,662 Z';
const PANB = 'M1604,642 L1770,584 C1810,630 1850,684 1890,738 L1692,826 C1668,768 1640,700 1604,642 Z';
const PANA = 'M1488,706 C1530,690 1566,672 1604,646 C1640,700 1668,768 1692,828 L1700,1010 L1488,1010 Z';
export const TorsoA: React.FC<{t: number}> = ({t}) => { const br = Math.sin(t * 2.4) * 1.5;
	return <g>
		<path d={TORSO} fill="url(#d1Lm)" />
		{/* the chest catching the fire behind (warm on its top-right), the far side in shade */}
		<path d="M1500,384 C1562,384 1622,402 1662,442 C1690,470 1706,500 1714,532 L1640,546 C1620,500 1580,450 1500,420 Z" fill="#FF9A50" opacity={0.16} />
		<path d="M1360,582 C1372,604 1392,634 1408,662 C1424,688 1452,700 1488,706 L1488,1010 L1560,1010 L1560,700 C1500,660 1440,600 1400,520 Z" fill="#000" opacity={0.28} />
		{/* the cuirass's laced neck edge and the chest panel borders */}
		<path d="M1420,402 C1470,388 1540,386 1600,400" fill="none" stroke="#6E2219" strokeWidth={10} />
		<path d="M1420,402 C1470,388 1540,386 1600,400" fill="none" stroke="#B0503A" strokeWidth={2.4} opacity={0.7} transform="translate(0,-4)" />
		<path d="M1600,400 C1640,440 1660,490 1668,546" fill="none" stroke="#6E2219" strokeWidth={8} />
		<path d="M1440,470 C1520,456 1590,450 1650,470" fill="none" stroke="#5E1E16" strokeWidth={6} opacity={0.7} />
		{/* the skirt panels below the belt, red bordered */}
		<path d={PANA} fill="url(#d1Lm)" /><path d={PANA} fill="#000" opacity={0.2} />
		<path d={PANB} fill="url(#d1LmL)" />
		<path d={PANB} fill="none" stroke="#4E1C16" strokeWidth={7} strokeLinejoin="round" />
		<path d="M1604,646 C1640,700 1668,768 1692,828" fill="none" stroke="#4E1C16" strokeWidth={7} />
		<path d="M1770,584 C1810,630 1850,684 1890,738" fill="none" stroke="#B0563A" strokeWidth={2} opacity={0.35} />
		<path d="M1890,738 L1930,720 L1930,1010 L1700,1010 L1692,826 Z" fill="url(#d1Lm)" />
		<path d="M1692,826 L1890,738" fill="none" stroke="#4E1C16" strokeWidth={7} />
		{/* the broad leather belt, its lit upper edge, the oval bronze 带钩 plaque */}
		<path d={BELT} fill="#3A2216" />
		<path d="M1436,612 C1480,600 1520,590 1560,578 C1600,566 1640,554 1668,546 C1700,537 1726,530 1748,524 L1750,532 C1700,544 1600,572 1438,620 Z" fill="#8A5A3A" opacity={0.8} />
		<path d="M1450,662 C1486,648 1526,634 1566,622 C1604,610 1640,598 1670,590 C1700,582 1730,574 1760,566" fill="none" stroke="#120A08" strokeWidth={3} />
		<g transform={`translate(1662,${567 + br * 0.2}) rotate(-17)`}><ellipse cx={0} cy={0} rx={27} ry={14} fill="#6A4A26" /><ellipse cx={-2} cy={-2} rx={22} ry={10} fill="#B08A52" />
			<ellipse cx={-6} cy={-5} rx={11} ry={4} fill="#E8C888" opacity={0.75} /><ellipse cx={0} cy={0} rx={27} ry={14} fill="none" stroke="#2A1A10" strokeWidth={2} /></g>
		{/* the off arm (his left, screen right): the laced sleeve out to the bent elbow, the vambrace, the clenched fist, knuckles to us */}
		<path d="M1660,462 C1700,470 1740,490 1772,512 L1790,548 C1760,560 1720,566 1690,560 C1680,530 1672,496 1660,462 Z" fill="url(#d1LmL)" />
		<path d="M1660,462 C1700,470 1740,490 1772,512" fill="none" stroke="#6E2219" strokeWidth={7} />
		<path d="M1752,512 L1800,528 L1808,570 L1764,574 Z" fill="#2A2A2E" /><path d="M1754,514 L1800,529 L1801,537 L1756,524 Z" fill="#7A8E9A" opacity={0.7} />
		<path d="M1796,532 C1812,522 1840,520 1858,528 C1872,536 1876,556 1872,576 C1868,594 1852,604 1832,604 C1816,604 1802,596 1798,584 C1792,566 1790,546 1796,532 Z" fill="#C88A5E" />
		<path d="M1806,530 C1822,522 1846,522 1860,530 C1866,538 1868,546 1866,552 C1846,546 1824,546 1806,550 Z" fill="#F0BC88" />
		<path d="M1830,550 L1832,600 M1850,548 L1852,598 M1814,552 L1816,596" fill="none" stroke="#7A4A30" strokeWidth={2} opacity={0.7} />
		<path d="M1858,528 C1872,536 1876,556 1872,576 C1868,594 1852,604 1832,604" fill="none" stroke={ACC} strokeWidth={3} opacity={0.7} />
		{/* the rims: cyan down his back edges, warm on the top of the far shoulder */}
		<path d="M1360,582 C1372,604 1392,634 1408,662 C1424,688 1452,700 1488,706 L1488,940" fill="none" stroke={ACC} strokeWidth={3.4} opacity={0.85} />
		<path d="M1772,600 C1830,650 1880,680 1930,704" fill="none" stroke={ACC} strokeWidth={3} opacity={0.75} />
		<path d="M1500,384 C1562,384 1622,402 1662,442 C1690,470 1706,500 1714,532" fill="none" stroke="#FFB070" strokeWidth={3} opacity={0.65} />
	</g>; };

/** the neck under the beard and the 交领 at the throat: the red scarf, the white under-robe edge */
export const CollarA: React.FC = () => <g>
	<path d="M1388,330 C1420,350 1460,358 1500,350 L1520,404 C1490,414 1450,412 1418,402 Z" fill="#5A3424" />
	<path d="M1474,354 C1488,355 1497,352 1504,348 L1520,404 C1510,408 1498,410 1488,410 Z" fill="#A86E4E" opacity={0.85} />
	<path d="M1440,356 C1452,366 1466,372 1480,374 M1446,378 C1456,384 1466,388 1476,390" fill="none" stroke="#3A2016" strokeWidth={2.2} opacity={0.7} />
	<path d="M1504,348 L1520,404" fill="none" stroke="#FFB070" strokeWidth={2.4} opacity={0.6} />
	<path d="M1404,388 C1440,402 1490,410 1540,398 L1548,418 C1500,432 1440,428 1396,410 Z" fill="#9C2E22" />
	<path d="M1406,390 C1440,402 1486,408 1530,400 L1534,406 C1490,414 1440,410 1404,398 Z" fill="#D0563A" opacity={0.8} />
	<path d="M1452,396 C1470,404 1488,412 1500,420 L1478,424 C1468,414 1458,406 1446,400 Z" fill="#E4D6C0" />
	<path d="M1500,396 C1486,404 1474,414 1468,424 L1484,426 C1488,416 1496,408 1510,400 Z" fill="#CFC0A8" />
</g>;

/* ---------- the head, 3/4 to screen right, tilted (crown to the left); local units = film px, origin between the eyes ---------- */
export const HEAD = {x: 1385, y: 257, rot: -28.5};
export const HeadA: React.FC<{t: number}> = ({t}) => {
	const sk = '#A86E4E', skS = '#74482F', skD = '#4A2A1C', skH = '#C8865A', skHH = '#E8A472', hair = '#24160F', bd = '#2A2420', line = '#1A0E0A';
	const p1 = Math.sin(t * 2 * Math.PI * 1.7) * 7, p2 = Math.sin(t * 2 * Math.PI * 2.3 + 1) * 5, p3 = Math.sin(t * 2 * Math.PI * 1.3 + 2) * 4;
	const FACE = 'M-84,-46 C-40,-58 20,-56 56,-44 C62,-18 64,12 62,42 C60,80 44,112 14,128 C-18,132 -50,112 -68,82 C-82,52 -88,2 -84,-46 Z';
	const BEARD = 'M-90,-20 C-90,30 -80,74 -54,106 C-46,114 -42,118 -36,120 C-30,128 -20,132 -10,134 C-2,140 8,140 16,138 C26,138 34,132 40,126 C52,114 60,96 64,62 L64,30 C56,46 50,62 48,76 C44,90 32,98 20,98 C6,98 -2,92 -6,82 C-10,70 -18,58 -32,48 C-50,36 -64,20 -76,-6 C-80,-12 -82,-16 -84,-18 Z';
	const almN = 'M-46,4 C-38,-6 -22,-9 -11,-4 C-19,5 -34,9 -46,4 Z', almF = 'M11,-2 C18,-8 30,-9 37,-5 C31,1 20,4 11,-2 Z';
	const flecks = Array.from({length: 70}, (_, i) => { const a = rnd(i, 91), b = rnd(i, 92); const u = -84 + a * 140, v = -6 + b * 136;
		return [u, v] as P; }).filter(([u, v]) => { const inner = v > 18 + Math.max(0, (u + 60) * 0.6) && !(u > -12 && u < 50 && v < 100); return inner || u < -60; });
	return <g transform={`translate(${HEAD.x},${HEAD.y}) rotate(${HEAD.rot})`}>
		<defs><clipPath id="d1Fc"><path d={FACE} /></clipPath><clipPath id="d1Bc"><path d={BEARD} /></clipPath>
			<clipPath id="d1En"><path d={almN} /></clipPath><clipPath id="d1Ef"><path d={almF} /></clipPath></defs>
		{/* the aventail behind: mail hanging from the rim round the back of the head and the near cheek, down to the shoulders */}
		<path d="M-136,-24 C-120,-34 -100,-42 -82,-46 C-88,0 -86,44 -74,82 C-64,104 -48,118 -30,128 L-56,170 C-104,170 -146,140 -164,92 C-160,40 -148,6 -136,-24 Z" fill="url(#d1Ml)" />
		<path d="M-136,-24 C-120,-34 -100,-42 -82,-46 C-88,0 -86,44 -74,82 C-64,104 -48,118 -30,128 L-56,170 C-104,170 -146,140 -164,92 C-160,40 -148,6 -136,-24 Z" fill="#0E0808" opacity={0.42} />
		<path d="M-136,-24 C-148,6 -160,40 -164,92 C-150,130 -110,162 -56,170" fill="none" stroke={ACC} strokeWidth={2.6} opacity={0.6} />
		<path d="M58,-44 C74,-20 84,20 88,70 C86,100 76,118 60,132 C62,100 62,64 62,40 Z" fill="#2A1A14" /><path d="M58,-44 C74,-20 84,20 88,70 C86,100 76,118 60,132 C62,100 62,64 62,40 Z" fill="url(#d1Ml)" opacity={0.25} />
		<path d="M74,-20 C84,20 88,70 86,100" fill="none" stroke="#FFB070" strokeWidth={2.4} opacity={0.5} />
		{/* the face */}
		<path d={FACE} fill={sk} />
		<g clipPath="url(#d1Fc)">
			{/* the far side (beyond the nose) turned from the fire: the cool shadow plane */}
			<path d="M10,-60 C16,-30 24,0 30,22 C34,40 40,56 48,70 L80,70 L80,-60 Z" fill={skS} />
			{/* the near cheek and temple, lit orange by the fires on the left */}
			<path d="M-92,-40 C-70,-36 -54,-26 -48,-10 C-44,6 -46,22 -52,40 C-62,56 -74,70 -84,76 C-94,40 -96,0 -92,-40 Z" fill={skH} opacity={0.9} />
			<path d="M-90,-40 C-80,-38 -72,-34 -66,-28 C-70,-10 -74,10 -80,26 C-86,6 -90,-16 -90,-40 Z" fill={skHH} opacity={0.55} />
			{/* the heavy brow shelf: shade under it, across the eyes */}
			<path d="M-60,-12 C-40,-18 -16,-16 -4,-8 C4,-14 20,-18 44,-16 L44,-4 C26,-8 12,-6 2,0 C-12,-6 -36,-8 -60,-2 Z" fill={skD} opacity={0.55} />
			{/* the cheekbone and the plane from the nose wing to the mouth */}
			<path d="M-44,26 C-30,18 -10,22 2,34 C-6,42 -16,48 -26,50 C-36,44 -42,36 -44,26 Z" fill={skS} opacity={0.45} />
			<path d="M-90,-48 L60,-48 L60,-36 C20,-44 -40,-44 -90,-34 Z" fill="#1A0C08" opacity={0.5} />
		</g>
		{/* the frown: two hard creases between the brows, one across the root of the nose */}
		<path d="M-6,-18 C-4,-12 -3,-7 -4,-2 M2,-19 C4,-13 5,-8 4,-3 M-8,-4 C-4,-2 0,-2 4,-3" fill="none" stroke={line} strokeWidth={2} opacity={0.7} />
		{/* the eyes: almonds, the irises slid toward screen left (at the lens), the upper lids heavy and flat */}
		<path d="M-50,-6 C-38,-14 -20,-14 -8,-8 L-8,-2 C-22,-8 -38,-8 -50,2 Z" fill={skD} opacity={0.6} />
		<path d={almN} fill="#E6D2B8" />
		<g clipPath="url(#d1En)"><circle cx={-38} cy={0.5} r={7} fill="#3A2216" /><circle cx={-38.5} cy={0.5} r={3.8} fill="#070403" /><rect x={-50} y={-10} width={44} height={5.5} fill="#000" opacity={0.5} /></g>
		<circle cx={-36} cy={-2} r={1.5} fill="#FFF0D8" />
		<path d="M-47,4 C-38,-7 -22,-10 -10,-5" fill="none" stroke={line} strokeWidth={4.6} strokeLinecap="round" />
		<path d="M-42,7 C-32,9 -20,6 -12,1" fill="none" stroke={line} strokeWidth={1.2} opacity={0.5} />
		<path d="M10,-6 C20,-11 30,-11 38,-8 L38,-2 C30,-5 20,-4 10,0 Z" fill={skD} opacity={0.5} />
		<path d={almF} fill="#C8B49C" />
		<g clipPath="url(#d1Ef)"><circle cx={15.5} cy={-2.2} r={6} fill="#3A2216" /><circle cx={15} cy={-2.2} r={3.2} fill="#070403" /><rect x={8} y={-12} width={34} height={5.6} fill="#000" opacity={0.5} /></g>
		<circle cx={17} cy={-4} r={1.2} fill="#FFE8C8" />
		<path d="M10,-2 C18,-9 30,-10 38,-6" fill="none" stroke={line} strokeWidth={3.8} strokeLinecap="round" />
		{/* the brows: a hard V, the inner ends driven down and in */}
		<path d="M-56,-20 C-40,-28 -22,-26 -6,-12 L-8,-6 C-24,-16 -40,-17 -54,-12 Z" fill={hair} />
		<path d="M-50,-20 C-40,-25 -30,-25 -20,-21" fill="none" stroke="#8E847A" strokeWidth={1.2} opacity={0.6} />
		<path d="M6,-11 C16,-20 30,-22 44,-19 L44,-13 C30,-15 18,-12 8,-6 Z" fill={hair} />
		{/* the nose: a strong straight bridge, lit on the near side, the far side and the wing in shade */}
		<path d="M-2,-8 C4,6 10,22 14,34 L6,40 C2,28 -2,12 -6,-4 Z" fill={skH} opacity={0.75} />
		<path d="M2,-10 C10,6 18,22 24,36 C28,42 26,48 18,48 L34,46 C36,30 28,6 16,-14 Z" fill={skS} />
		<path d="M2,-10 C10,6 18,22 24,36" fill="none" stroke={skHH} strokeWidth={2.2} opacity={0.7} />
		<path d="M24,36 C28,42 26,48 18,48 C12,48 6,46 2,42" fill="none" stroke={skD} strokeWidth={2.6} />
		<ellipse cx={14} cy={45} rx={5} ry={2.4} fill="#2A140C" transform="rotate(8,14,45)" />
		<path d="M2,42 C-4,40 -8,44 -6,48" fill="none" stroke={skD} strokeWidth={2.2} opacity={0.8} />
		{/* the set, grim mouth and a hard lower lip */}
		<path d="M4,68 C14,66 28,65 42,64" fill="none" stroke="#24100A" strokeWidth={3.4} strokeLinecap="round" />
		<path d="M10,71 C18,74 30,74 38,70 C32,78 18,79 10,71 Z" fill="#A86A4A" />
		{/* the beard: short, dense, trimmed; it covers the jaw and the chin, the moustache joins it at the corners */}
		<path d={BEARD} fill={bd} />
		<g clipPath="url(#d1Bc)">
			<path d="M-100,-30 L-40,-30 C-50,20 -50,60 -40,100 L-100,140 Z" fill="#5A4A3E" opacity={0.75} />
			<path d="M-30,60 C-20,90 0,110 30,120 L30,150 L-40,150 Z" fill="#000" opacity={0.2} />
			<path d="M40,60 C50,40 58,20 66,0 L90,0 L90,140 L40,140 Z" fill="#6A4A34" opacity={0.4} />
			{flecks.map(([u, v], i) => <path key={i} d={`M${f1(u)},${f1(v)} l${f1(1 + rnd(i, 93) * 2)},${f1(5 + rnd(i, 94) * 4)}`} stroke={i % 3 ? '#8E847A' : '#C8BEB0'} strokeWidth={1.6} strokeLinecap="round" opacity={0.75} />)}
		</g>
		<path d="M-88,-14 C-86,30 -76,72 -52,102 C-32,124 -6,136 16,134" fill="none" stroke="#FFB070" strokeWidth={2} opacity={0.4} />
		{[[-74, 74], [-60, 96], [-44, 112], [-26, 124], [-8, 134], [10, 136], [28, 130], [44, 118], [56, 98]].map(([u, v], i) => <path key={i} d={`M${u - 7},${v - 4} Q${u},${v + 9} ${u + 7},${v - 3}`} fill={bd} />)}
		<path d="M0,46 C8,44 24,44 38,48 C46,52 50,62 48,78 C44,68 38,60 30,57 C22,55 12,57 4,62 C-4,68 -8,76 -10,86 C-14,70 -10,56 0,46 Z" fill={bd} />
		<path d="M4,50 C12,48 24,48 34,52" fill="none" stroke="#9A9086" strokeWidth={1.4} opacity={0.65} />
		{/* the neck guard edge under the jaw: the throat in shade */}
		{/* the helmet: a rounded iron cap with a dark rim band, the red ribbon plume tied at the back-top */}
		<g transform="translate(-4,13) scale(0.92)">
		<path d={`M-96,-104 C${-118 + p2},${-120 + p1} ${-150 + p2 * 1.5},${-118 + p1 * 1.6} ${-178 + p3 * 2},${-104 + p1 * 2.2} C${-160 + p3},${-100 + p1} ${-136},${-94 + p1 * 0.6} -112,-86 Z`} fill="#8E2420" />
		<path d={`M-92,-110 C${-112 + p1},${-134 + p2} ${-140 + p1 * 1.4},${-142 + p2 * 1.4} ${-166 + p1 * 2},${-140 + p2 * 2} C${-144 + p1},${-126 + p2} ${-124},${-114 + p2 * 0.5} -104,-98 Z`} fill="#C23A2C" />
		<path d={`M-94,-108 C${-114 + p1},${-128 + p2} ${-138 + p1 * 1.3},${-134 + p2 * 1.3} ${-160 + p1 * 1.8},${-134 + p2 * 1.8}`} fill="none" stroke="#F07848" strokeWidth={2.4} opacity={0.8} />
		<path d="M-134,-22 C-142,-78 -100,-118 -40,-116 C14,-114 54,-88 62,-44 C20,-58 -60,-56 -134,-22 Z" fill="#4A3C36" />
		<path d="M-40,-116 C14,-114 54,-88 62,-44 C50,-50 40,-54 28,-56 C24,-84 0,-104 -40,-110 Z" fill="#8A7260" opacity={0.55} />
		<path d="M-134,-22 C-142,-78 -100,-118 -40,-116 C-84,-108 -116,-74 -118,-30 Z" fill="#000" opacity={0.3} />
		<path d="M-130,-60 C-110,-90 -70,-108 -30,-110 M-120,-40 C-90,-76 -40,-94 10,-96 M-60,-112 C-80,-90 -92,-60 -96,-36 M-10,-114 C-20,-92 -26,-70 -26,-52 M30,-100 C26,-84 24,-68 24,-56" fill="none" stroke="#14100E" strokeWidth={1.6} opacity={0.45} />
		<ellipse cx={-96} cy={-104} rx={9} ry={6} fill="#2A2422" transform="rotate(-30,-96,-104)" />
		<path d="M-140,-18 C-60,-58 20,-62 64,-44 C72,-20 80,20 86,66" fill="none" stroke="#2A1812" strokeWidth={17} strokeLinecap="round" />
		<path d="M-140,-26 C-60,-66 20,-70 64,-52" fill="none" stroke="#7A5638" strokeWidth={2.6} opacity={0.75} />
		<path d="M-140,-18 C-148,-60 -120,-104 -60,-114" fill="none" stroke={ACC} strokeWidth={2.6} opacity={0.6} />
		<path d="M-40,-116 C14,-114 54,-88 62,-44" fill="none" stroke="#FFB070" strokeWidth={2.6} opacity={0.6} />
		</g>
	</g>; };

/* ---------- the near 披膊 over the sword shoulder: three laced tiers ---------- */
export const PaulA: React.FC = () => {
	/* the rows' lower edges, from the neck (top) to the hem; each row hangs over the one below it, so only the laced lower edges show */
	const A: P[][] = [[[1238, 430], [1282, 386], [1372, 360], [1458, 378]], [[1230, 452], [1278, 414], [1372, 390], [1468, 408]],
		[[1226, 476], [1276, 440], [1372, 418], [1470, 438]], [[1228, 500], [1280, 468], [1372, 450], [1462, 466]], [[1238, 516], [1292, 500], [1364, 490], [1432, 492]]];
	const arc = (q: P[]) => `C${pp([q[1], q[2], q[3]])}`, rev = (q: P[]) => [q[3], q[2], q[1], q[0]] as P[];
	const bandD = (i: number) => `M${pp([A[i][0]])} ${arc(A[i])} L${pp([A[i + 1][3]])} ${arc(rev(A[i + 1]))} Z`;
	return <g>
		{[3, 2, 1, 0].map((i) => <g key={i}><path d={bandD(i)} fill="url(#d1Lm)" /><path d={bandD(i)} fill="#4A261E" opacity={0.4} />
			<path d={bandD(i)} fill="#000" opacity={0.07 * i} />
			{/* the laced hem of this row */}
			<path d={`M${pp([A[i + 1][0]])} ${arc(A[i + 1])}`} fill="none" stroke="#4A1810" strokeWidth={7} strokeLinecap="round" />
			<path d={`M${pp([A[i + 1][0]])} ${arc(A[i + 1])}`} fill="none" stroke="#A04A32" strokeWidth={1.6} opacity={0.4} strokeDasharray="6 5" transform="translate(0,-2)" /></g>)}
		{/* the top row's upper edge catching the fire; the near end of the rows in the warm key */}
		<path d={`M${pp([A[0][0]])} ${arc(A[0])}`} fill="none" stroke="#FFB070" strokeWidth={2.6} opacity={0.5} />
		<path d="M1238,430 C1230,440 1226,460 1226,476 C1226,490 1230,504 1238,516" fill="none" stroke="#FFB070" strokeWidth={3} opacity={0.6} />
	</g>; };

/** the sleeve from the shoulder to the vambrace (sh = shoulder, vb = vambrace centre, both in film space) */
export const SleeveA: React.FC<{sh: P; vb: P}> = ({sh, vb}) => { const dx = vb[0] - sh[0], dy = vb[1] - sh[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
	const w0 = 64, w1 = 58, a: P = [sh[0] + nx * w0, sh[1] + ny * w0], b: P = [sh[0] - nx * w0, sh[1] - ny * w0], c: P = [vb[0] - nx * w1, vb[1] - ny * w1], d: P = [vb[0] + nx * w1, vb[1] + ny * w1];
	return <g><path d={`M${pp([a, b, c, d])} Z`} fill="#4A2018" />
		<path d={`M${pp([a, lerp(a, b, 0.32), lerp(d, c, 0.32), d])} Z`} fill="#7A3226" opacity={0.75} />
		<path d={`M${pp([lerp(a, b, 0.7), b, c, lerp(d, c, 0.7)])} Z`} fill="#2A0E0A" opacity={0.6} /></g>; };

/* ---------- the vambrace end-on behind the fist, and the fist on the grip (film space, hold pose) ---------- */
export const VambA: React.FC = () => <g>
	<path d="M1196,458 C1226,436 1290,428 1332,452 C1360,480 1362,548 1344,592 C1326,630 1290,644 1262,630 C1236,600 1214,530 1196,458 Z" fill="#1C1A1A" />
	<path d="M1206,452 C1240,434 1292,430 1326,450 L1318,466 C1286,450 1244,452 1214,468 Z" fill="#5E6A72" opacity={0.6} />
	<path d="M1340,470 C1356,500 1358,550 1344,590" fill="none" stroke={ACC} strokeWidth={3} opacity={0.7} />
	<path d="M1262,452 C1290,470 1310,530 1304,610 M1300,444 C1326,470 1340,530 1330,600" fill="none" stroke="#0E0E10" strokeWidth={3} opacity={0.8} />
	<path d="M1192,460 C1210,500 1226,560 1250,620" fill="none" stroke="#8A2C20" strokeWidth={14} strokeLinecap="round" />
	<path d="M1190,456 C1206,492 1220,540 1238,590" fill="none" stroke="#C8503A" strokeWidth={3} opacity={0.7} />
</g>;
export const FistA: React.FC = () => { const sk = '#B87A52', skS = '#875438', skD = '#5A3424', skH = '#D4925E', skHH = '#ECB282';
	const F: number[][] = [[1148, 586, 1194, 578, 1200, 706, 1158, 702], [1194, 578, 1236, 584, 1242, 712, 1200, 706], [1236, 584, 1274, 596, 1278, 702, 1242, 712], [1274, 596, 1304, 614, 1304, 668, 1278, 702]];
	return <g>
		{/* the whole fist mass */}
		<path d="M1086,508 C1092,478 1118,456 1150,450 C1185,446 1222,454 1244,476 C1262,494 1268,520 1266,540 C1290,560 1308,590 1312,630 C1314,668 1300,700 1276,716 C1240,728 1180,724 1140,708 C1112,690 1100,650 1098,610 C1090,580 1084,540 1086,508 Z" fill={sk} />
		{/* the heel of the hand and the grip side in shade */}
		<path d="M1092,556 C1096,610 1112,670 1140,708 C1150,712 1158,712 1164,712 L1150,590 C1128,582 1108,572 1092,556 Z" fill={skS} />
		{/* the four folded fingers: rounded blocks, in shade under the knuckles, lit only along their tops */}
		{F.map((q, i) => { const bx = (q[4] + q[6]) / 2, by = (q[5] + q[7]) / 2 + 8;
			const d = `M${q[0]},${q[1]} L${q[2]},${q[3]} L${q[4]},${q[5] - 10} Q${q[4] - 2},${q[5] + 4} ${bx},${by} Q${q[6] + 2},${q[7] + 4} ${q[6]},${q[7] - 10} Z`;
			return <g key={i}><path d={d} fill={i % 2 ? '#9A6244' : '#A86C4A'} />
				<path d={`M${q[0]},${q[1]} L${q[2]},${q[3]} L${q[2] + (q[4] - q[2]) * 0.2},${q[3] + (q[5] - q[3]) * 0.2} L${q[0] + (q[6] - q[0]) * 0.2},${q[1] + (q[7] - q[1]) * 0.2} Z`} fill={skH} opacity={0.8} />
				<path d={`M${q[2]},${q[3] + 6} L${q[4]},${q[5] - 12}`} stroke={skD} strokeWidth={2.6} opacity={0.8} strokeLinecap="round" /></g>; })}
		{/* the back of the hand: the lit plane and the knuckle row along the top */}
		<path d="M1090,506 C1098,478 1122,458 1152,454 C1186,450 1220,458 1242,478 C1250,488 1254,498 1254,506 C1220,500 1186,500 1150,508 C1124,514 1104,522 1092,532 Z" fill={skH} />
		<path d="M1102,486 C1112,474 1124,468 1136,468 M1146,462 C1158,458 1172,458 1182,462 M1194,462 C1206,464 1218,470 1226,478" fill="none" stroke={skHH} strokeWidth={4} strokeLinecap="round" opacity={0.8} />
		<path d="M1092,532 C1104,522 1124,514 1150,508 C1186,500 1220,500 1254,506" fill="none" stroke={skD} strokeWidth={2.2} opacity={0.5} />
		{/* the thumb lying across the index finger */}
		<path d="M1176,536 C1196,520 1240,520 1262,534 C1274,548 1268,572 1250,580 C1224,590 1194,586 1178,574 C1168,562 1168,546 1176,536 Z" fill={skH} />
		<path d="M1178,574 C1194,586 1224,590 1250,580 C1260,576 1266,568 1268,560 C1250,572 1210,574 1178,566 Z" fill={skS} opacity={0.85} />
		<path d="M1190,532 C1210,525 1236,525 1254,534" fill="none" stroke={skHH} strokeWidth={3} strokeLinecap="round" opacity={0.85} />
		<path d="M1236,530 C1248,528 1258,534 1260,546 C1252,548 1242,546 1236,540 Z" fill="#E8C0A0" opacity={0.5} />
		{/* the cool rim along the bottom of the fist, the warm one on its top */}
		<path d="M1160,712 C1200,724 1244,724 1276,716 C1300,700 1314,668 1312,630" fill="none" stroke={ACC} strokeWidth={3} opacity={0.7} />
		<path d="M1086,508 C1092,478 1118,456 1150,450" fill="none" stroke="#FFD8A8" strokeWidth={2.4} opacity={0.5} />
	</g>; };
