import React from 'react';
/* ep53 v3: the bronze knife (铜削) that lay beside the sword in the inner coffin (facts A9: 「左侧有把套在黑漆鞘里的青铜剑和1件铜削」).
   ONE shared component for both chamber scenes (TakeB3 and TakeD3). A ring-pommel knife (环首削), 26 cm: a ring (Ø 30 mm), a
   ribbed flat handle, a single-edged blade whose back arches gently and whose tip turns up. Excavated, unwashed bronze: dull
   brown-olive, darker than any part of the sword, a faint lit back edge and a few patina spots, so the sword stays the brightest
   thing in the coffin. Drawn in a local frame (mm) through M: x along the knife, 0 = the ring's centre → 260 (the tip); y across,
   − = the back. M is any (x, y) → screen map (perspective is fine: every point goes through M). */
const N = 24;
/** the blade's centre line bends toward the back (−y) toward the tip; half widths: back side and edge side */
const cy = (x: number) => (x <= 82 ? 0 : -0.0003 * (x - 82) ** 2);
const back = (x: number) => (x < 82 ? 5 : x < 236 ? 4.2 + 0.6 * (x - 82) / 154 : 4.8 * (1 - (x - 236) / 24) ** 0.7);
const edge = (x: number) => (x < 82 ? 5 : x < 230 ? 6.8 - 1.8 * (x - 82) / 148 : 5.0 * (1 - (x - 230) / 30) ** 1.4);
export const BronzeKnife53: React.FC<{M: (x: number, y: number) => [number, number]; o?: number; id: string}> = ({M, o = 1, id}) => {
	const P = (x: number, y: number) => M(x, y).map((v) => v.toFixed(1)).join(',');
	const xs = (a: number, b: number) => Array.from({length: N + 1}, (_, i) => a + (b - a) * i / N);
	const blade = 'M' + [...xs(82, 260).map((x) => P(x, cy(x) - back(x))), ...xs(82, 259).reverse().map((x) => P(x, cy(x) + edge(x)))].join('L') + 'Z';
	const handle = 'M' + [P(13, -4.6), P(82, -5), P(82, 5), P(13, 4.6)].join('L') + 'Z';
	const ring = (r: number) => 'M' + Array.from({length: 33}, (_, i) => { const a = i / 32 * 2 * Math.PI; return P(r * Math.cos(a), r * Math.sin(a)); }).join('L') + 'Z';
	const backLine = 'M' + xs(84, 252).map((x) => P(x, cy(x) - back(x) + 0.9)).join('L');
	const edgeLine = 'M' + xs(84, 250).map((x) => P(x, cy(x) + edge(x) - 0.8)).join('L');
	const px = Math.hypot(M(10, 0)[0] - M(0, 0)[0], M(10, 0)[1] - M(0, 0)[1]) / 10;   // screen px per mm (for line widths)
	const lw = (mm: number, min = 0.6) => Math.max(min, mm * px);
	const spots: [number, number, number][] = [[118, 1.5, 3.2], [164, -1, 2.6], [205, 2, 2.2], [52, 0, 2.4]];
	return <g opacity={o}>
		<defs><linearGradient id={`kn${id}`} gradientUnits="userSpaceOnUse" x1={M(150, -6)[0]} y1={M(150, -6)[1]} x2={M(150, 7)[0]} y2={M(150, 7)[1]}>
			<stop offset="0" stopColor="#6E5634" /><stop offset="0.45" stopColor="#564226" /><stop offset="1" stopColor="#382916" /></linearGradient></defs>
		{/* the ring: an outline band with a dark hole */}
		<path d={ring(15) + ring(9)} fill="#54401F" fillRule="evenodd" stroke="#2A1C0E" strokeWidth={lw(0.8)} />
		<path d={'M' + Array.from({length: 12}, (_, i) => { const a = Math.PI * (0.95 + 0.6 * i / 11); return P(12.5 * Math.cos(a), 12.5 * Math.sin(a)); }).join('L')} fill="none" stroke="#8A6E42" strokeOpacity={0.6} strokeWidth={lw(1.2)} strokeLinecap="round" />
		{/* the handle with two ribs */}
		<path d={handle} fill="#4A361C" stroke="#2A1C0E" strokeWidth={lw(0.8)} />
		{[-2, 2].map((y) => <path key={y} d={`M${P(16, y)}L${P(80, y)}`} stroke="#6E5630" strokeOpacity={0.7} strokeWidth={lw(0.9)} />)}
		{/* the blade */}
		<path d={blade} fill={`url(#kn${id})`} stroke="#2A1C0E" strokeWidth={lw(0.8)} strokeLinejoin="round" />
		<path d={backLine} fill="none" stroke="#A08254" strokeOpacity={0.55} strokeWidth={lw(1.1)} strokeLinecap="round" />
		<path d={edgeLine} fill="none" stroke="#8A7048" strokeOpacity={0.35} strokeWidth={lw(0.7)} strokeLinecap="round" />
		{spots.map(([x, y, r], i) => { const q = M(x, cy(x) + y); return <ellipse key={i} cx={q[0]} cy={q[1]} rx={Math.max(0.5, r * px)} ry={Math.max(0.4, r * 0.6 * px)} fill="#4E5A3C" opacity={0.45} />; })}
	</g>; };
