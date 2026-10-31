import React from 'react';
/* ep54 look B 「主角刻画」: the drawn hero 曹操 and his key props (五色棒, 环首刀, torch, grain sacks).
   Local frame: profile facing RIGHT, crown y ≈ −160 (with cap), chin y ≈ 12, soles y = 750 (≈ 1.72 m → 1 unit ≈ 2 mm).
   Key light from the front-upper (+x, −y) in local terms; the accent rim (cool 石青 moonlight) on the back edges (−x).
   Flat-vector cel shading: base / shade / lit tones, clipped to each part. Flip with scale(-1,1) for a left-facing shot. */
export type P = [number, number];
export const f1 = (v: number) => v.toFixed(1);
export const rnd = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
/** tapered ribbon along a centreline with half-width w(u) */
export const strand = (pts: P[], w: (u: number) => number) => { const L: P[] = [], R: P[] = [];
	pts.forEach((p, i) => { const q = pts[Math.min(i + 1, pts.length - 1)], o = pts[Math.max(i - 1, 0)], dx = q[0] - o[0], dy = q[1] - o[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, ww = w(i / (pts.length - 1));
		L.push([p[0] + nx * ww, p[1] + ny * ww]); R.push([p[0] - nx * ww, p[1] - ny * ww]); });
	return 'M' + L.concat(R.reverse()).map((p) => f1(p[0]) + ',' + f1(p[1])).join(' L') + ' Z'; };
/** quadratic-bezier sampled polyline a → b with control c */
export const qpts = (a: P, c: P, b: P, n = 14): P[] => Array.from({length: n + 1}, (_, i) => { const u = i / n, m = 1 - u; return [m * m * a[0] + 2 * m * u * c[0] + u * u * b[0], m * m * a[1] + 2 * m * u * c[1] + u * u * b[1]] as P; });

/** two-sided rim filter: key rim (colour c, toward light (lx, ly)) and accent rim (c2, toward (lx2, ly2)); k = rim width */
export const RimF: React.FC<{id: string; lx: number; ly: number; k: number; c: string; o?: number; lx2?: number; ly2?: number; k2?: number; c2?: string; o2?: number; blur?: number}> = (p) => {
	const two = p.c2 !== undefined, b = p.blur ?? 0.7;
	return <filter id={p.id} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
		<feOffset in="SourceAlpha" dx={-p.lx * p.k} dy={-p.ly * p.k} result="o1" />
		<feComposite in="SourceAlpha" in2="o1" operator="out" result="e1" />
		<feGaussianBlur in="e1" stdDeviation={b} result="b1" />
		<feFlood floodColor={p.c} floodOpacity={p.o ?? 1} result="c1" />
		<feComposite in="c1" in2="b1" operator="in" result="r1a" />
		<feComposite in="r1a" in2="SourceAlpha" operator="in" result="r1" />
		{two && <><feOffset in="SourceAlpha" dx={-(p.lx2 ?? 0) * (p.k2 ?? p.k)} dy={-(p.ly2 ?? 0) * (p.k2 ?? p.k)} result="o2" />
			<feComposite in="SourceAlpha" in2="o2" operator="out" result="e2" />
			<feGaussianBlur in="e2" stdDeviation={b} result="b2" />
			<feFlood floodColor={p.c2} floodOpacity={p.o2 ?? 1} result="c2" />
			<feComposite in="c2" in2="b2" operator="in" result="r2a" />
			<feComposite in="r2a" in2="SourceAlpha" operator="in" result="r2" /></>}
		<feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="r1" />{two && <feMergeNode in="r2" />}</feMerge>
	</filter>; };

/* ---------- palette per scene ---------- */
export type Pal = {skin: string; skinS: string; skinH: string; hair: string; robe: string; robeS: string; robeH: string; trim: string;
	metal: string; metalS: string; metalH: string; lace: string; under: string; underS: string; cape: string; capeS: string; gold: string; line: string};

/* ---------- head ---------- */
const FACE = 'M30,-98 C38,-90 42,-78 43,-66 C44,-60 41,-57 40,-55 C44,-49 50,-42 55,-36 C58,-33 59,-30 57,-28 C54,-25 50,-24 47,-24 C48,-21 50,-18 49,-16 C46,-13 43,-12 42,-11 C45,-9 47,-7 46,-5 C44,-3 41,-2 41,0 C43,3 44,7 40,11 C33,15 20,15 8,13 C10,22 12,34 14,50 L-38,50 C-40,30 -42,8 -44,-12 C-38,-30 -30,-46 -26,-60 C-22,-72 -6,-86 12,-92 Z';
const HAIR = 'M33,-97 C30,-112 12,-122 -10,-122 C-36,-122 -56,-106 -59,-80 C-61,-56 -55,-32 -45,-12 L-38,-13 C-33,-34 -27,-52 -19,-66 C-9,-80 10,-90 33,-97 Z';
const EAR = 'M-15,-64 C-6,-66 -1,-57 -2,-46 C-3,-37 -8,-31 -15,-31 C-20,-35 -22,-48 -20,-59 Z';
export const Head: React.FC<{old: boolean; pal: Pal; id: string}> = ({old, pal, id}) => <g>
	<defs><clipPath id={`${id}fc`}><path d={FACE} /></clipPath></defs>
	{/* topknot under the cap */}
	<path d="M-34,-120 C-32,-142 -6,-146 2,-128 C4,-118 -12,-114 -34,-120 Z" fill={pal.hair} />
	<path d={HAIR} fill={pal.hair} />
	<path d="M-50,-90 C-40,-108 -12,-118 14,-112" fill="none" stroke={pal.skinH} strokeOpacity={0.18} strokeWidth={3} />
	<path d={FACE} fill={pal.skin} />
	<g clipPath={`url(#${id}fc)`}>
		{/* shade: the back of the face, the cheek hollow and the throat under the jaw */}
		<path d="M2,-94 C-4,-78 -6,-62 0,-48 C6,-36 12,-26 14,-14 C16,-4 14,6 10,14 L-70,70 L-70,-110 Z" fill={pal.skinS} opacity={0.8} />
		<path d="M-50,9 C-20,15 10,17 41,10 L44,70 L-50,70 Z" fill={pal.skinS} />
		<path d="M-60,30 L20,22 L30,70 L-60,70 Z" fill={pal.skinS} opacity={0.6} />
		{/* lit planes facing the key */}
		<path d="M32,-95 C39,-87 42,-77 42,-66 L36,-66 C35,-76 32,-86 26,-93 Z" fill={pal.skinH} />
		<path d="M41,-53 C46,-46 51,-40 55,-35 L51,-33 C47,-38 43,-44 38,-50 Z" fill={pal.skinH} />
		<path d="M22,-45 C28,-47 33,-46 36,-42 C31,-40 26,-40 22,-42 Z" fill={pal.skinH} opacity={0.4} />
		<path d="M41,1 C43,5 42,9 38,11 L35,8 C37,6 38,3 37,1 Z" fill={pal.skinH} />
		<path d="M44,-19 C47,-18 48,-16 47,-15 L43,-15 Z" fill={pal.skinH} opacity={0.7} />
	</g>
	{/* ear */}
	<path d={EAR} fill={pal.skin} /><path d={EAR} fill={pal.skinS} opacity={0.55} />
	<path d="M-12,-58 C-7,-57 -6,-50 -7,-44 C-8,-40 -11,-37 -13,-37" fill="none" stroke={pal.line} strokeWidth={1.6} opacity={0.55} />
	{/* brow, eye, nostril, mouth */}
	<path d="M13,-65 C22,-69 33,-69 42,-64 L41,-61 C32,-65 22,-65 14,-62 Z" fill={pal.hair} />
	<path d="M19,-56 C24,-59 29,-58 33,-55 C30,-52 25,-51 21,-52 Z" fill="#EDE2D0" opacity={0.9} />
	<path d="M26,-57.5 C29,-57 31.5,-56 33,-55 C31,-52.6 28.5,-52 26,-52.4 Z" fill="#1A120E" />
	<path d="M17,-57 C23,-61 29,-59.5 34,-55" fill="none" stroke={pal.line} strokeWidth={2.2} strokeLinecap="round" />
	<path d="M20,-51.5 C24,-50.5 28,-51 31,-52.5" fill="none" stroke={pal.line} strokeWidth={0.9} opacity={0.5} />
	<path d="M18,-61 C24,-63 29,-62 33,-59" fill="none" stroke={pal.line} strokeWidth={0.9} opacity={0.45} />
	<path d="M45,-30 C48,-28 50,-27.5 52,-29" fill="none" stroke={pal.line} strokeWidth={1.4} opacity={0.7} />
	<path d="M41,-11.5 C43.5,-11.5 46,-12.5 48,-14" fill="none" stroke={pal.line} strokeWidth={1.6} strokeLinecap="round" />
	{old && <>
		<path d="M37,-36 C33,-28 33,-20 37,-14" fill="none" stroke={pal.line} strokeWidth={1.1} opacity={0.45} />
		<path d="M21,-50 C24,-47 28,-47 31,-49" fill="none" stroke={pal.line} strokeWidth={0.9} opacity={0.4} />
		<path d="M24,-78 C30,-80 36,-80 40,-78 M22,-84 C29,-86 35,-86 39,-84" fill="none" stroke={pal.line} strokeWidth={0.8} opacity={0.3} />
		{/* short beard: moustache, chin beard, a trimmed line along the jaw */}
		<path d="M45,-22 C49,-21 51,-18 49,-15 C46,-13.5 42,-15 37,-13 C38,-17 41,-21 45,-22 Z" fill={pal.hair} />
		<path d="M45,-8 C48,0 46,10 40,19 C33,27 20,28 8,23 C-2,19 -10,11 -14,0 C-10,2 -2,7 8,10 C20,13 31,11 37,4 C40,0 42,-4 45,-8 Z" fill={pal.hair} />
		<path d="M-14,0 C-18,-12 -22,-26 -24,-40 L-20,-40 C-17,-26 -12,-12 -8,-2 Z" fill={pal.hair} opacity={0.85} />
		<path d="M30,18 C26,22 20,24 14,23 M40,8 C38,14 34,18 30,21 M20,16 C14,18 6,17 0,14 M44,-20 C41,-18 39,-17 37,-15" fill="none" stroke="#9A9088" strokeOpacity={0.55} strokeWidth={1.1} />
	</>}
	{!old && <path d="M44,-21 C47,-20 48,-18 47,-16 C44,-15.5 41,-16 38,-15" fill="none" stroke={pal.hair} strokeWidth={1.4} opacity={0.35} />}
	{/* 帻 band and the 武冠 (lacquered gauze cage over the topknot), chin strap */}
	<path d="M34,-97 C20,-106 -20,-110 -57,-97 L-59,-84 C-40,-93 0,-96 36,-87 Z" fill={pal.hair} />
	<path d="M-24,-92 C-24,-60 -20,-24 -6,6 C2,14 12,16 20,13" fill="none" stroke={pal.hair} strokeWidth={2} opacity={0.8} />
	<path d="M31,-99 C33,-107 32,-115 28,-120 C10,-128 -20,-136 -44,-140 C-56,-134 -60,-114 -57,-97 Z" fill={pal.hair} />
	<path d="M24,-104 C27,-116 25,-126 18,-132 M6,-102 C8,-118 6,-130 0,-138 M-12,-102 C-12,-118 -14,-132 -20,-141 M-30,-100 C-32,-116 -36,-130 -40,-139 M30,-112 C0,-120 -40,-122 -64,-112 M28,-124 C0,-132 -36,-134 -58,-126" fill="none" stroke={pal.metalH} strokeOpacity={0.1} strokeWidth={1} />
	<path d="M31,-99 C33,-107 32,-115 28,-120 C10,-128 -20,-136 -44,-140" fill="none" stroke={pal.skinH} strokeOpacity={0.35} strokeWidth={1.6} />
	<path d="M-57,-97 C-40,-104 0,-106 34,-97" fill="none" stroke={pal.trim} strokeWidth={2.4} opacity={0.8} />
</g>;

/* ---------- props ---------- */
/** a 五色棒: five painted bands (青 赤 黄 白 黑) from a to b, radius r; lit side toward +lit (−1 / 1 across the rod) */
export const ROD5 = ['#3F6E74', '#9C3B2C', '#B9913C', '#D9D0BA', '#1C1714'];
export const ROD5S = ['#24434A', '#5E2219', '#77591F', '#8F8674', '#0E0B0A'];
export const Rod5: React.FC<{a: P; b: P; r: number; ph?: number; lit?: number; dim?: number}> = ({a, b, r, ph = 0, lit = 1, dim = 1}) => {
	const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy * lit, ny = ux * lit, n = 5;
	const at = (u: number, s: number): P => [a[0] + dx * u + nx * r * s, a[1] + dy * u + ny * r * s];
	const q = (u0: number, u1: number, s0: number, s1: number) => [at(u0, s0), at(u1, s0), at(u1, s1), at(u0, s1)].map((p) => f1(p[0]) + ',' + f1(p[1])).join(' ');
	return <g opacity={dim}>
		{Array.from({length: n}, (_, i) => { const k = (i + ph) % 5, u0 = i / n, u1 = (i + 1) / n + 0.002;
			return <g key={i}><polygon points={q(u0, u1, -1, 1)} fill={ROD5[k]} /><polygon points={q(u0, u1, -1, -0.15)} fill={ROD5S[k]} /><polygon points={q(u0, u1, 0.35, 0.7)} fill="#FFF4DC" opacity={0.28} /></g>; })}
		<circle cx={a[0]} cy={a[1]} r={r} fill={ROD5S[ph % 5]} /><circle cx={b[0]} cy={b[1]} r={r} fill={ROD5[(ph + 4) % 5]} />
	</g>; };
/** 环首刀 in its scabbard: from the ring (a) along the direction to the chape (b) */
export const Dao: React.FC<{a: P; b: P; pal: Pal; drawn?: boolean}> = ({a, b, pal, drawn}) => {
	const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
	const at = (u: number, s: number): P => [a[0] + ux * u + nx * s, a[1] + uy * u + ny * s];
	const quad = (u0: number, u1: number, w0: number, w1: number) => [at(u0, -w0), at(u1, -w1), at(u1, w1), at(u0, w0)].map((p) => f1(p[0]) + ',' + f1(p[1])).join(' ');
	const ring = at(-9, 0);
	return <g>
		<circle cx={ring[0]} cy={ring[1]} r={10} fill="none" stroke={pal.gold} strokeWidth={4.2} />
		<circle cx={ring[0]} cy={ring[1]} r={10} fill="none" stroke="#FFF0C8" strokeOpacity={0.45} strokeWidth={1.2} strokeDasharray="10 30" />
		<polygon points={quad(0, 46, 5, 5)} fill="#2A1C16" />
		{Array.from({length: 7}, (_, i) => <polygon key={i} points={quad(3 + i * 6, 6 + i * 6, 5.4, 5.4)} fill={pal.robeH} opacity={0.5} />)}
		<polygon points={quad(46, 52, 10, 10)} fill={pal.gold} />
		{drawn ? <>
			<polygon points={[at(52, -6), at(L - 26, -6), at(L, 3), at(L - 30, 6), at(52, 6)].map((p) => f1(p[0]) + ',' + f1(p[1])).join(' ')} fill={pal.metalH} />
			<polygon points={[at(52, 0.5), at(L - 26, 0.5), at(L, 3), at(L - 30, 6), at(52, 6)].map((p) => f1(p[0]) + ',' + f1(p[1])).join(' ')} fill={pal.metal} />
			<polyline points={[at(56, -5.5), at(L - 28, -5.5)].map((p) => f1(p[0]) + ',' + f1(p[1])).join(' ')} fill="none" stroke="#FFF6E0" strokeWidth={1.4} opacity={0.8} /></> : <>
			<polygon points={quad(52, L, 7, 6.5)} fill="#24160F" />
			<polygon points={quad(52, L, 7, 6.5).split(' ').slice(0, 2).concat([at(L, -2), at(52, -2)].map((p) => f1(p[0]) + ',' + f1(p[1]))).join(' ')} fill={pal.robeH} opacity={0.55} />
			<polygon points={quad(L - 14, L, 8, 7)} fill={pal.gold} />
			<polygon points={quad(150, 160, 8, 8)} fill={pal.gold} opacity={0.85} /></>}
	</g>; };
/** a torch: shaft from a (grip) to b (head), with a layered flame; s = flame scale */
export const Torch: React.FC<{a: P; b: P; s?: number; t?: number}> = ({a, b, s = 1, t = 0}) => { const fx = b[0], fy = b[1], w = Math.sin(t) * 3;
	return <g>
		<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#2A1A10" strokeWidth={9 * s} strokeLinecap="round" />
		<ellipse cx={fx} cy={fy + 4 * s} rx={9 * s} ry={12 * s} fill="#3A2216" />
		<path d={`M${fx - 16 * s},${fy} C${fx - 20 * s},${fy - 30 * s} ${fx - 4 * s + w},${fy - 52 * s} ${fx + 2 * s + w},${fy - 86 * s} C${fx + 10 * s},${fy - 50 * s} ${fx + 22 * s},${fy - 30 * s} ${fx + 16 * s},${fy} Z`} fill="#EA6028" />
		<path d={`M${fx - 11 * s},${fy} C${fx - 13 * s},${fy - 24 * s} ${fx - 2 * s + w},${fy - 40 * s} ${fx + 2 * s + w},${fy - 64 * s} C${fx + 8 * s},${fy - 40 * s} ${fx + 15 * s},${fy - 22 * s} ${fx + 11 * s},${fy} Z`} fill="#FFB04E" />
		<path d={`M${fx - 6 * s},${fy - 2 * s} C${fx - 7 * s},${fy - 16 * s} ${fx},${fy - 26 * s} ${fx + 1 * s},${fy - 38 * s} C${fx + 5 * s},${fy - 24 * s} ${fx + 8 * s},${fy - 14 * s} ${fx + 6 * s},${fy - 2 * s} Z`} fill="#FFE9B0" />
	</g>; };
/** a hemp grain sack (粮袋), standing; base centre (x, y), height h; slump 0..1 (1 = empty, folded); lit from the right */
export const Sack: React.FC<{x: number; y: number; h: number; slump?: number; lit?: number}> = ({x, y, h, slump = 0, lit = 1}) => {
	const w = h * (0.78 + slump * 0.5), hh = h * (1 - slump * 0.62), s = lit;
	const body = `M${x - w * 0.5},${y} C${x - w * 0.56},${y - hh * 0.5} ${x - w * 0.42},${y - hh * 0.86} ${x - w * 0.16},${y - hh * 0.92} L${x - w * 0.1},${y - hh * 1.02} C${x - w * 0.02},${y - hh * 1.06} ${x + w * 0.04},${y - hh * 1.06} ${x + w * 0.12},${y - hh * 1.02} L${x + w * 0.18},${y - hh * 0.92} C${x + w * 0.44},${y - hh * 0.86} ${x + w * 0.58},${y - hh * 0.5} ${x + w * 0.52},${y} Z`;
	const id = `sk${Math.round(x)}${Math.round(y)}`;
	return <g>
		<defs><clipPath id={id}><path d={body} /></clipPath></defs>
		<path d={body} fill="#7A6247" />
		<g clipPath={`url(#${id})`}>
			<path d={`M${x - w * 0.6},${y - hh * 1.2} C${x - w * 0.1 * s},${y - hh * 0.7} ${x - w * 0.12 * s},${y - hh * 0.3} ${x - w * 0.2 * s},${y + 4} L${x - w * 0.7},${y + 4} Z`} fill="#4A3826" />
			<path d={`M${x + w * 0.2},${y - hh * 0.86} C${x + w * 0.42},${y - hh * 0.7} ${x + w * 0.5},${y - hh * 0.4} ${x + w * 0.46},${y - 4} L${x + w * 0.36},${y - 4} C${x + w * 0.38},${y - hh * 0.4} ${x + w * 0.32},${y - hh * 0.66} ${x + w * 0.14},${y - hh * 0.82} Z`} fill="#B8996C" />
			{Array.from({length: 9}, (_, i) => <path key={i} d={`M${x - w * 0.6},${y - hh * (0.1 + i * 0.1)} C${x - w * 0.2},${y - hh * (0.06 + i * 0.1)} ${x + w * 0.2},${y - hh * (0.06 + i * 0.1)} ${x + w * 0.6},${y - hh * (0.12 + i * 0.1)}`} fill="none" stroke="#3A2A1A" strokeOpacity={0.22} strokeWidth={1.2} />)}
			{slump > 0.5 && <path d={`M${x - w * 0.3},${y - hh * 0.5} C${x - w * 0.1},${y - hh * 0.62} ${x + w * 0.1},${y - hh * 0.4} ${x + w * 0.32},${y - hh * 0.55}`} fill="none" stroke="#3A2A1A" strokeOpacity={0.5} strokeWidth={2} />}
		</g>
		<path d={`M${x - w * 0.14},${y - hh * 0.93} C${x - w * 0.04},${y - hh * 0.88} ${x + w * 0.08},${y - hh * 0.88} ${x + w * 0.16},${y - hh * 0.93}`} fill="none" stroke="#2A1C10" strokeWidth={h * 0.04} strokeLinecap="round" />
		<path d={`M${x + w * 0.1},${y - hh * 0.92} C${x + w * 0.22},${y - hh * 0.8} ${x + w * 0.26},${y - hh * 0.7} ${x + w * 0.22},${y - hh * 0.62}`} fill="none" stroke="#2A1C10" strokeWidth={h * 0.025} strokeLinecap="round" />
	</g>; };

/* ---------- the body ---------- */
const ROBE = 'M-38,44 C-58,58 -70,100 -68,160 C-66,220 -60,260 -62,300 C-66,420 -76,600 -82,742 L96,742 C86,600 66,430 56,320 C54,290 52,282 50,272 C58,220 62,160 54,112 C48,82 36,60 14,46 Z';
const CUIRASS = 'M-44,50 C-64,68 -68,120 -66,180 C-64,240 -62,300 -64,352 L62,350 C60,300 57,272 55,252 C61,204 63,152 57,112 C51,82 37,62 16,48 Z';
const SKIRT = 'M-62,340 C-68,420 -74,500 -78,566 L82,566 C76,500 66,420 60,340 Z';
export type Arm = {sh: P; el: P; hd: P; wide?: boolean};
const fist = (h: P, pal: Pal, ang: number) => <g transform={`translate(${f1(h[0])},${f1(h[1])}) rotate(${f1(ang)})`}>
	<path d="M-9,-10 C2,-14 13,-9 14,0 C15,9 6,13 -4,12 C-12,10 -14,-4 -9,-10 Z" fill={pal.skin} />
	<path d="M-9,-10 C-2,-12 4,-11 8,-8 C2,-4 -6,-2 -12,-2 Z" fill={pal.skinH} opacity={0.7} />
	<path d="M-4,12 C4,12 12,8 14,1 C10,6 2,9 -6,9 Z" fill={pal.skinS} />
	<path d="M2,-9 C6,-4 7,2 5,7 M8,-7 C11,-3 11,3 10,6" fill="none" stroke={pal.line} strokeOpacity={0.35} strokeWidth={0.9} />
</g>;
/** the near arm: sleeve (wide robe sleeve or armoured sleeve with a lamellar 披膊) from sh → el → hd */
const ArmV: React.FC<{a: Arm; pal: Pal; armour: boolean}> = ({a, pal, armour}) => {
	const up = qpts(a.sh, [(a.sh[0] + a.el[0]) / 2 - 6, (a.sh[1] + a.el[1]) / 2], a.el, 8), lo = qpts(a.el, [(a.el[0] + a.hd[0]) / 2, (a.el[1] + a.hd[1]) / 2 + 4], a.hd, 8);
	const ang = Math.atan2(a.hd[1] - a.el[1], a.hd[0] - a.el[0]) * 180 / Math.PI;
	const fx = a.hd[0] - (a.hd[0] - a.el[0]) * 0.12, fy = a.hd[1] - (a.hd[1] - a.el[1]) * 0.12;
	if (!armour) {
		/* wide 袂: the sleeve opens at the wrist and hangs in a deep curve below the forearm */
		const [sx, sy] = a.sh, [ex, ey] = a.el, [hx, hy] = a.hd;
		const sl = `M${sx + 22},${sy - 12} C${sx + 34},${sy + 40} ${ex + 26},${ey - 40} ${ex + 30},${ey - 6} L${hx - 14},${hy - 18} C${hx - 6},${hy + 10} ${hx - 6},${hy + 40} ${hx - 16},${hy + 70} C${hx - 40},${hy + 104} ${ex - 10},${ey + 96} ${ex - 24},${ey + 40} C${ex - 32},${ey} ${sx - 30},${sy + 60} ${sx - 26},${sy + 10} Z`;
		return <g>
			<path d={sl} fill={pal.robe} />
			<path d={`M${ex - 24},${ey + 40} C${ex - 10},${ey + 96} ${hx - 40},${hy + 104} ${hx - 16},${hy + 70} C${hx - 30},${hy + 76} ${ex},${ey + 70} ${ex - 14},${ey + 22} Z`} fill={pal.robeS} />
			<path d={`M${sx + 22},${sy - 12} C${sx + 34},${sy + 40} ${ex + 26},${ey - 40} ${ex + 30},${ey - 6} L${hx - 14},${hy - 18} L${hx - 16},${hy - 6} L${ex + 18},${ey + 6} C${ex + 14},${ey - 30} ${sx + 22},${sy + 40} ${sx + 10},${sy - 4} Z`} fill={pal.robeH} opacity={0.75} />
			<path d={`M${hx - 14},${hy - 18} C${hx - 6},${hy + 10} ${hx - 6},${hy + 40} ${hx - 16},${hy + 70}`} fill="none" stroke={pal.trim} strokeWidth={9} />
			{fist(a.hd, pal, ang)}
		</g>;
	}
	return <g>
		<path d={strand(up, (u) => 28 - u * 3)} fill="#0E0C0B" /><path d={strand(lo, (u) => 23 - u * 4)} fill="#0E0C0B" />
		<path d={strand(up, (u) => 25 - u * 3)} fill={pal.under} />
		<path d={strand(lo, (u) => 20 - u * 4)} fill={pal.under} />
		<path d={strand(lo.map((p) => [p[0] + 3, p[1] - 7] as P), (u) => 6 - u * 2)} fill={pal.robeH} opacity={0.55} />
		{/* 披膊: a lamellar shoulder flap over the upper arm, with a bound lower edge */}
		{(() => { const [sx, sy] = a.sh, [ex, ey] = a.el, my = sy + (ey - sy) * 0.62, mx = sx + (ex - sx) * 0.62;
			const d = `M${sx - 34},${sy - 8} C${sx - 20},${sy - 30} ${sx + 26},${sy - 30} ${sx + 38},${sy - 2} C${mx + 34},${my - 30} ${mx + 34},${my - 10} ${mx + 30},${my + 6} C${mx + 6},${my + 16} ${mx - 20},${my + 14} ${mx - 34},${my + 2} C${sx - 40},${sy + 40} ${sx - 40},${sy + 14} ${sx - 34},${sy - 8} Z`;
			return <g><path d={d} fill="#000" opacity={0.45} transform="translate(-6,8)" /><path d={d} fill="url(#lamel)" /><path d={d} fill={pal.metal} opacity={0.3} /><path d={d} fill="none" stroke="#0E0C0B" strokeWidth={3.5} />
				<path d={`M${sx - 20},${sy - 22} C${sx},${sy - 30} ${sx + 26},${sy - 26} ${sx + 38},${sy - 2} C${mx + 34},${my - 30} ${mx + 34},${my - 10} ${mx + 30},${my + 6} L${mx + 18},${my + 8} C${mx + 22},${my - 14} ${sx + 26},${sy} ${sx + 18},${sy - 14} Z`} fill={pal.metalH} opacity={0.35} />
				<path d={`M${mx + 30},${my + 6} C${mx + 6},${my + 16} ${mx - 20},${my + 14} ${mx - 34},${my + 2}`} fill="none" stroke={pal.lace} strokeWidth={6} /></g>; })()}
		<path d={strand(qpts(lo[5], lo[6], [fx, fy], 4), () => 16)} fill={pal.metal} />
		<path d={strand(qpts(lo[5], lo[6], [fx, fy], 4).map((p) => [p[0] + 2, p[1] - 9] as P), () => 4)} fill={pal.metalH} opacity={0.6} />
		{fist(a.hd, pal, ang)}
	</g>; };

export type CaoProps = {pal: Pal; id: string; old: boolean; armour: boolean; arm: Arm; far?: Arm; stride?: number; cape?: number; prop?: 'rod' | 'torch' | 'none'; propA?: P; propB?: P; dao?: boolean; t?: number};
export const Cao: React.FC<CaoProps> = (p) => { const {pal, id} = p, st = p.stride ?? 0;
	return <g>
		<defs>
			<clipPath id={`${id}rb`}><path d={p.armour ? CUIRASS : ROBE} /></clipPath>
			<clipPath id={`${id}sk`}><path d={SKIRT} /></clipPath>
		</defs>
		{/* cape behind (armour only) */}
		{p.armour && <path d={`M-40,48 C-92,${120 - (p.cape ?? 0) * 20} ${-128 - (p.cape ?? 0) * 40},300 ${-158 - (p.cape ?? 0) * 60},${560 - (p.cape ?? 0) * 40} C-120,560 -96,590 -66,600 C-70,420 -70,220 -62,90 Z`} fill={pal.cape} />}
		{p.armour && <path d={`M-52,80 C-90,160 ${-112 - (p.cape ?? 0) * 30},330 ${-140 - (p.cape ?? 0) * 50},${540 - (p.cape ?? 0) * 40}`} fill="none" stroke={pal.capeS} strokeWidth={10} opacity={0.8} />}
		{/* far arm (behind the body) */}
		{/* legs */}
		{p.armour ? <g>
			<path d={strand(qpts([-20, 540], [-20 - st * 60, 650], [-24 - st * 120, 738], 8), (u) => 28 - u * 6)} fill={pal.underS} />
			<path d={strand(qpts([22, 540], [24 + st * 50, 650], [30 + st * 110, 738], 8), (u) => 28 - u * 6)} fill={pal.under} />
			<path d={strand(qpts([-22 - st * 70, 610], [-23 - st * 100, 680], [-24 - st * 120, 742], 6), () => 24)} fill="#120C0A" />
			<path d={strand(qpts([26 + st * 60, 610], [28 + st * 90, 680], [30 + st * 110, 742], 6), () => 24)} fill="#1C1410" />
			<path d={strand(qpts([40 + st * 60, 612], [44 + st * 90, 680], [48 + st * 110, 738], 6), () => 4)} fill={pal.robeH} opacity={0.5} />
			<path d={`M${-50 - st * 120},742 C${-48 - st * 120},726 ${-12 - st * 120},722 ${8 - st * 120},740 L${8 - st * 120},748 L${-50 - st * 120},748 Z`} fill="#16100C" />
			<path d={`M${4 + st * 110},742 C${8 + st * 110},724 ${52 + st * 110},724 ${70 + st * 110},740 L${70 + st * 110},748 L${4 + st * 110},748 Z`} fill="#1C140F" />
			<path d={SKIRT} fill={pal.under} />
			<g clipPath={`url(#${id}sk)`}>
				<path d="M-10,330 C-14,420 -20,500 -24,580 L-100,580 L-100,330 Z" fill={pal.underS} />
				<path d="M44,340 C52,420 62,520 70,620 L84,620 L84,330 Z" fill={pal.robeH} opacity={0.4} />
				<path d="M8,350 C10,450 12,540 14,620" stroke={pal.underS} strokeWidth={3} fill="none" />
				<rect x={-90} y={552} width={190} height={14} fill={pal.trim} />
			</g>
		</g> : <g>
			<path d="M58,742 C78,733 110,735 126,744 C118,752 88,754 58,750 Z" fill="#120C0A" />
			<path d={ROBE} fill={pal.robe} />
		</g>}
		{/* torso */}
		{p.armour ? <path d={CUIRASS} fill="url(#lamel)" /> : null}
		<g clipPath={`url(#${id}rb)`}>
			{!p.armour && <>
				<path d="M-14,48 C-16,200 -22,500 -30,742 L-100,742 L-100,40 Z" fill={pal.robeS} />
				<path d="M44,90 C56,150 52,230 48,280 C56,360 70,520 86,742 L100,742 L100,80 Z" fill={pal.robeH} opacity={0.65} />
				<path d="M-6,330 C10,420 20,560 24,742" stroke={pal.robeS} strokeWidth={4} fill="none" opacity={0.7} />
				<path d="M-40,330 C-44,460 -50,600 -54,742" stroke={pal.robeS} strokeWidth={3} fill="none" opacity={0.6} />
				<rect x={-100} y={712} width={200} height={30} fill={pal.trim} />
				<rect x={-100} y={706} width={200} height={4} fill={pal.robeH} opacity={0.5} />
			</>}
			{p.armour && <>
				<path d="M-12,40 C-18,150 -20,260 -22,360 L-100,360 L-100,40 Z" fill={pal.metalS} opacity={0.72} />
				<path d="M40,80 C54,140 56,220 50,256 C54,290 58,320 60,352 L90,352 L90,70 Z" fill={pal.metalH} opacity={0.32} />
				{[110, 190, 270].map((y) => <rect key={y} x={-80} y={y} width={160} height={3} fill={pal.lace} opacity={0.7} />)}
			</>}
		</g>
		{/* collar: white inner collar and the crossing lapel trim */}
		<path d="M14,46 C25,56 33,72 37,92 L29,96 C25,77 19,61 8,51 Z" fill="#D8CDB8" />
		{!p.armour && <><path d="M24,52 C8,104 -18,152 -48,196 L-58,186 C-28,146 -2,100 14,48 Z" fill={pal.trim} />
		<path d="M24,52 C8,104 -18,152 -48,196" fill="none" stroke={pal.robeH} strokeWidth={1.5} opacity={0.6} /></>}
		{/* belt with a gilt hook; the 印绶 ribbon (北部尉: 黄绶) at the hip */}
		<path d="M-64,284 L55,272 L57,292 L-64,304 Z" fill="#1A120E" />
		<path d="M-64,284 L55,272 L55.5,276 L-64,288 Z" fill={pal.robeH} opacity={0.55} />
		<ellipse cx={50} cy={282} rx={7} ry={5} fill={pal.gold} />
		{!p.armour && <><path d="M-30,300 L-18,298 L-12,520 L-24,524 Z" fill="#A08240" /><path d="M-30,300 L-26,300 L-21,522 L-24,524 Z" fill="#5E4A22" />
			<path d="M-40,300 C-44,320 -40,346 -26,350 C-14,346 -12,320 -16,298 Z" fill="#2A1E16" /></>}
		{p.dao !== false && <Dao a={[64, 266]} b={[-74, 560]} pal={pal} />}
		{/* neck + head */}
		<g transform="translate(0,49) scale(0.88) translate(0,-40)"><Head old={p.old} pal={pal} id={id} /></g>
		{/* prop in the near hand, then the near arm over it */}
		{p.prop === 'rod' && p.propA && p.propB && <Rod5 a={p.propA} b={p.propB} r={11} ph={1} lit={-1} />}
		<ArmV a={p.arm} pal={pal} armour={p.armour} />
		{p.prop === 'torch' && p.propA && p.propB && <Torch a={p.propA} b={p.propB} s={1.25} t={p.t ?? 0} />}
	</g>; };
/** the lamellar pattern (札甲): small plates in rows, laced */
export const Lamel: React.FC<{pal: Pal; s?: number}> = ({pal, s = 1}) => <pattern id="lamel" width={12 * s} height={22 * s} patternUnits="userSpaceOnUse">
	<rect width={12 * s} height={22 * s} fill={pal.metalS} />
	<path d={`M${1 * s},${1 * s} L${11.5 * s},${1 * s} L${11.5 * s},${17 * s} C${9 * s},${19.5 * s} ${3 * s},${19.5 * s} ${1 * s},${17 * s} Z`} fill={pal.metal} />
	<path d={`M${1 * s},${1 * s} L${11.5 * s},${1 * s} L${11.5 * s},${4 * s} L${1 * s},${4 * s} Z`} fill={pal.metalH} opacity={0.55} />
	<rect x={1 * s} y={1 * s} width={1.6 * s} height={16 * s} fill={pal.metalS} opacity={0.8} />
	<circle cx={6 * s} cy={8 * s} r={0.9 * s} fill={pal.metalH} opacity={0.6} />
	<rect x={0} y={19.4 * s} width={12 * s} height={2.6 * s} fill={pal.lace} />
</pattern>;
