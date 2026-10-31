import React from 'react';
import {P, f1} from './cao54b';
import {limb, PAL} from './set54bs';
/* ep54 look B · two 曹操 variants the profile rig cannot give, drawn in its style (flat-vector, base / shade / lit cel tones,
   costume detail; the caller applies the two-sided rim filter, warm key + the cool 石青 accent #8FD0DC):
   CaoBack: 46 岁, seen from behind in 3/4 (lost profile to the right), 札甲, cape, a torch raised forward in the right hand.
   CaoSeated: 66 岁, kneeling (跽坐) at a low desk, writing on bamboo slips, white hair and beard, a plain robe.
   Units cm, soles / floor at y = 0. */

/** the torch flame before the drop: warm ivory with a small orange core; base (x, y), size s (px), with its glow */
export const IvoryFlame: React.FC<{x: number; y: number; s: number; glow?: number; id: string; t?: number}> = ({x, y, s, glow = 1, id, t = 0}) => { const w = Math.sin(t) * 0.1 * s;
	return <g>
		<defs><radialGradient id={id}><stop offset="0" stopColor="#FFF0D0" stopOpacity={0.62 * glow} /><stop offset="0.25" stopColor="#F3DDB4" stopOpacity={0.26 * glow} /><stop offset="1" stopColor="#F3DDB4" stopOpacity="0" /></radialGradient></defs>
		<circle cx={x} cy={y - s * 0.5} r={s * 5} fill={`url(#${id})`} />
		<path d={`M${x - s * 0.42},${y} C${x - s * 0.55},${y - s * 0.5} ${x - s * 0.1 + w},${y - s * 0.8} ${x + w},${y - s * 1.45} C${x + s * 0.22},${y - s * 0.85} ${x + s * 0.6},${y - s * 0.5} ${x + s * 0.42},${y} Z`} fill="#F6E2BC" />
		<path d={`M${x - s * 0.28},${y} C${x - s * 0.34},${y - s * 0.36} ${x + w},${y - s * 0.6} ${x + w},${y - s * 1.0} C${x + s * 0.16},${y - s * 0.6} ${x + s * 0.36},${y - s * 0.34} ${x + s * 0.28},${y} Z`} fill="#FFF6E2" />
		<path d={`M${x - s * 0.14},${y - s * 0.02} C${x - s * 0.16},${y - s * 0.16} ${x},${y - s * 0.26} ${x},${y - s * 0.36} C${x + s * 0.08},${y - s * 0.24} ${x + s * 0.18},${y - s * 0.14} ${x + s * 0.14},${y - s * 0.02} Z`} fill="#F0A050" />
	</g>; };

/* ---------- 曹操 from behind, 3/4 ---------- */
const lp = (a: P, b: P, u: number): P => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
/** the torch head (flame base) of CaoBack for a given raise (0 = held at the chest, 1 = raised forward) */
export const torchTop = (r: number): P => lp([52.6, -163], [54.6, -195], r);
export const CaoBack: React.FC<{id: string; raise?: number}> = ({id, raise = 1}) => { const p = PAL, r = raise;
	const EL = lp([30, -125], [33, -147], r), HD = lp([41, -133], [44, -160], r), TA = lp([39.6, -124], [42.6, -150], r), TB = lp([52.4, -162], [54, -194], r), FR = -40 - 22 * r;
	const BR = lp(EL, HD, 0.3);
	const CUIR = 'M-23,-141 C-25,-128 -23,-112 -19,-98 L23,-98 C26,-112 27,-128 23,-142 C10,-147 -10,-147 -23,-141 Z';
	const SKIRT = 'M-21,-101 L23,-101 L27,-58 L-25,-58 Z';
	const CAPE = 'M-22,-146 C-12,-149 -7,-149.8 -4,-149.2 C0,-148.4 4,-148.4 7,-149.6 C10,-149.4 13,-148.4 15,-147 C18,-124 17,-96 14,-70 C13,-58 12,-50 11,-41 C4,-38 -4,-41 -12,-38 C-20,-35 -30,-40 -38,-36 C-42,-35 -46,-37 -49,-36 C-46,-56 -41,-90 -33,-118 C-30,-132 -28,-142 -22,-146 Z';
	return <g>
		<defs>
			<clipPath id={`${id}c`}><path d={CAPE} /></clipPath>
			<clipPath id={`${id}k`}><path d={SKIRT} /></clipPath>
			<clipPath id={`${id}u`}><path d={CUIR} /></clipPath>
			<pattern id={`${id}lm`} width={3.2} height={5.6} patternUnits="userSpaceOnUse">
				<rect width={3.2} height={5.6} fill={p.metalS} />
				<path d="M0.25,0.25 L3,0.25 L3,4.3 C2.4,5 0.8,5 0.25,4.3 Z" fill={p.metal} />
				<rect x={0.25} y={0.25} width={2.75} height={0.8} fill={p.metalH} opacity={0.5} />
				<rect x={0} y={4.95} width={3.2} height={0.65} fill={p.lace} />
			</pattern>
		</defs>
		{/* legs: baggy crimson trousers into short boots; weight on the left leg, the right foot a step ahead (further, so higher) */}
		<path d={limb([[-10, -46], [-11, -31], [-11, -20]], [7.6, 7.4, 6.2])} fill={p.underS} />
		<path d={limb([[10, -48], [11.6, -34], [12, -25]], [7.6, 7.2, 6])} fill={p.under} />
		<path d={limb([[14, -46], [16.4, -34], [16.6, -26]], [1.6, 1.6, 1.4])} fill="#8A4A3A" opacity={0.7} />
		<path d="M-14,-34 C-12,-31 -9,-31 -7,-34 M8,-38 C10,-35 13,-35 15,-38" fill="none" stroke="#1A0C0A" strokeWidth={0.8} opacity={0.6} />
		<path d="M-16.6,-22 L-5.4,-22 C-5,-14 -4.6,-7 -4,-3 C-4,-0.6 -6.4,0.4 -10.4,0.4 C-15,0.4 -17.6,-0.6 -17.4,-3 C-17,-8 -16.8,-14 -16.6,-22 Z" fill="#16100C" />
		<path d="M6.8,-27 L17.4,-27 C17.6,-19 18,-13 18.4,-9 C18.4,-6.6 16.2,-5.6 12.4,-5.6 C8.6,-5.6 6.6,-6.6 6.6,-9 C6.6,-14 6.7,-20 6.8,-27 Z" fill="#1C140F" />
		<path d="M15.4,-26.6 L17.4,-27 C17.6,-19 18,-13 18.4,-9 L16.8,-7.4 C16.4,-13 16,-19 15.4,-26.6 Z" fill="#6A5A4C" opacity={0.6} />
		<path d="M-16.8,-22 L-5.2,-22 L-5.2,-19.8 L-16.8,-19.8 Z M6.8,-27 L17.4,-27 L17.4,-24.8 L6.8,-24.8 Z" fill="#2E2218" />
		{/* the scabbard of the 环首刀 under the cape, its chape showing below the hem */}
		
		{/* the lamellar skirt and the cuirass (the right side shows past the cape) */}
		<path d={SKIRT} fill={`url(#${id}lm)`} />
		<g clipPath={`url(#${id}k)`}><rect x={-30} y={-110} width={36} height={60} fill={p.metalS} opacity={0.55} /><rect x={18} y={-110} width={12} height={60} fill={p.metalH} opacity={0.28} /><rect x={-30} y={-62} width={60} height={4} fill={p.lace} /></g>
		<path d={CUIR} fill={`url(#${id}lm)`} />
		<g clipPath={`url(#${id}u)`}><rect x={-30} y={-150} width={40} height={56} fill={p.metalS} opacity={0.5} /><path d="M17,-146 C21,-128 22,-112 20,-98 L30,-98 L30,-146 Z" fill={p.metalH} opacity={0.3} />
			{[-128, -114].map((y) => <rect key={y} x={-30} y={y} width={60} height={0.9} fill={p.lace} opacity={0.8} />)}</g>
		<path d="M-20,-101 L23,-101 L23,-97 L-20,-97 Z" fill="#1A120E" /><ellipse cx={22} cy={-99} rx={1.6} ry={1.2} fill={p.gold} />
		{/* the right arm raised forward with the torch: crimson sleeve, a lamellar 披膊 on the upper arm, a metal bracer */}
		<path d={limb([[18, -139], EL, HD], [6.4, 5, 4.2])} fill={p.under} />
		<path d={limb([[19, -142], [EL[0], EL[1] - 3], [HD[0] - 1, HD[1] - 3]], [2, 1.8, 1.4])} fill="#8A4A3A" opacity={0.7} />
		<path d={limb([BR, HD], [4.6, 4.4])} fill={p.metal} /><path d={limb([[BR[0] + 1, BR[1] - 3], [HD[0], HD[1] - 2]], [1.4, 1.2])} fill={p.metalH} opacity={0.7} />
		<path d="M12,-148 C18,-152 28,-151 32,-145 C33,-140 31,-135 27,-133 C22,-134 16,-136 12,-140 Z" fill={`url(#${id}lm)`} />
		<path d="M24,-150 C29,-149 32,-146 32,-142 L28,-141 C28,-145 26,-147 22,-148 Z" fill={p.metalH} opacity={0.45} />
		<path d="M12,-140 C16,-136 22,-134 27,-133" fill="none" stroke={p.lace} strokeWidth={1.4} />
		{/* the torch: shaft from below the fist up and forward */}
		<path d={limb([TA, TB], [1.4, 1.6])} fill="#2A1A10" />
		<ellipse cx={TB[0] + 0.2} cy={TB[1]} rx={2.6} ry={3.2} fill="#3A2216" transform={`rotate(${f1(14 + (1 - r) * 18)} ${f1(TB[0] + 0.2)} ${f1(TB[1])})`} />
		<g transform={`translate(${f1(HD[0] + 0.5)},${f1(HD[1] - 1)}) rotate(${f1(FR)})`}><path d="M-3.4,-3 C0,-4.4 3.6,-3 4,0 C4.2,3 1.6,4.4 -1.4,4 C-3.8,3.4 -4.6,-1 -3.4,-3 Z" fill={p.skin} /><path d="M-3.4,-3 C-1,-3.8 1.4,-3.6 3,-2.4 C1,-1 -1.6,-0.4 -4,-0.6 Z" fill={p.skinH} /></g>
		{/* the cape over the back: base, the shade away from the torch, lit folds toward it, a dark hem */}
		<path d={CAPE} fill="#3A1C18" />
		<g clipPath={`url(#${id}c)`}>
			<path d="M-52,-150 L-10,-150 C-12,-120 -15,-80 -19,-36 L-52,-36 Z" fill="#1E0E0C" />
			<path d="M-30,-140 C-33,-110 -37,-80 -42,-36 L-37,-36 C-33,-80 -29,-110 -26,-140 Z" fill="#2C1512" />
			<path d="M-3,-146 C-2,-118 -4,-84 -7,-38 L-1,-38 C2,-84 3,-118 2,-146 Z" fill="#552820" />
			<path d="M7,-148 C10,-124 10,-96 8,-60 L6,-38 L20,-38 L20,-150 Z" fill="#7A3A2C" opacity={0.85} />
			<path d="M10,-148 C13,-124 13,-96 11,-60 L9,-38 L20,-38 L20,-150 Z" fill="#A0503A" opacity={0.45} />
			<path d="M-10,-146 C-11,-116 -13,-80 -16,-38 M-22,-138 C-25,-108 -29,-76 -33,-38 M4,-146 C5,-118 4,-84 2,-38" fill="none" stroke="#140808" strokeWidth={1.1} opacity={0.75} />
			<path d="M-60,-41 C-40,-46 -20,-42 0,-44 C8,-44 14,-46 20,-46 L20,-30 L-60,-30 Z" fill="#160A08" />
			<path d="M-18,-146 C-8,-150 4,-150 13,-147 L13,-143 C4,-146 -8,-146 -18,-142 Z" fill="#552820" />
		</g>
		{/* the left shoulder under the cape */}
		<path d="M-22,-146 C-26,-144 -28,-140 -29,-134 L-24,-136 Z" fill="#1E0E0C" />
		{/* the head from behind, turned a little to his right: nape, the back of the head, the right ear, a sliver of lit cheek and the greying
		    beard (lost profile), the 帻 band with its trim, the lacquered gauze 武冠 cage and its chin tie */}
		<path d="M-3.4,-151 L6,-151 L6.3,-148.6 L-3.4,-148.6 Z" fill={p.skinS} />
		<path d="M-8,-149 C-10,-155 -10,-163 -6,-168 C-2,-171 5,-171 9,-167 C11,-162 11,-155 9,-150 C5,-147.4 -4,-147.4 -8,-149 Z" fill={p.hair} />
		<path d="M-5,-149 C-2,-150.4 2,-150.4 5,-149.4" fill="none" stroke="#3A2A20" strokeWidth={0.6} />
		<path d="M8,-158 C10.8,-157 12.6,-153 12.4,-149 C12.2,-146 10,-144.6 8,-145 L7,-150 Z" fill={p.skinH} />
		<path d="M11.6,-151 C13,-148 12.6,-144.6 10.6,-143 C8.6,-142.4 7,-143.2 6.6,-144.6 C8.4,-145 10.2,-147.4 11.6,-151 Z" fill="#2A2420" />
		<path d="M11.4,-149.4 C12.2,-147.6 11.8,-145.4 10.6,-144" fill="none" stroke="#A09890" strokeWidth={0.4} opacity={0.8} />
		<path d="M8.4,-162 C11.8,-163.6 14,-160.2 13.4,-156 C13,-152.8 10.8,-151.4 8.8,-152.4 Z" fill={p.skin} />
		<path d="M10.8,-163 C12.8,-162.4 14,-160 13.4,-156 L12.4,-156.4 C12.8,-159.4 12,-161.4 10.4,-162 Z" fill={p.skinH} />
		<path d="M9.8,-160.4 C11.6,-160 12,-157.6 11.2,-155.2" fill="none" stroke={p.skinS} strokeWidth={0.7} />
		<path d="M-8,-160.4 C-10.6,-161 -11.8,-158 -11.2,-154.8 C-10.6,-152.6 -9,-152 -7.8,-152.8 Z" fill={p.skinS} />
		<path d="M-9,-159 C-3,-161.4 5,-161.8 10.6,-160.4 L10.4,-157.8 C5,-159 -3,-158.6 -8.8,-156.6 Z" fill={p.hair} />
		<path d="M-8.8,-156.6 C-3,-158.6 5,-159 10.4,-157.8" fill="none" stroke={p.trim} strokeWidth={0.8} />
		<path d="M-5,-166 C-5,-172 -1,-175 3,-174.6 C7,-174 8,-170 7.4,-165 Z" fill="#0A0807" />
		<path d="M-8.4,-159.6 C-9.4,-167 -7.4,-174.4 -1,-176.4 C5,-177.6 10,-173.6 10.6,-160.6 Z" fill="#3E3A38" opacity={0.62} />
		<path d="M-7,-161 C-7.4,-168 -5,-173.4 -1,-175 M-2.4,-160.4 C-2.6,-167 -1,-173 1.6,-176 M2.6,-160.6 C2.8,-166.6 4,-172 6,-175.4 M7.4,-160.8 C7.6,-166 8.4,-170 9.4,-172 M-8.6,-165 C-2,-167 5,-167.4 10.4,-165.4 M-7.4,-170.6 C-2,-172.4 4,-172.6 9,-171" fill="none" stroke={p.metalH} strokeOpacity={0.22} strokeWidth={0.35} />
		<path d="M3,-177.2 C8,-176.6 10.4,-172 10.6,-161" fill="none" stroke={p.skinH} strokeOpacity={0.45} strokeWidth={0.7} />
		<path d="M10.4,-158 C10.8,-153 11.4,-148 11.6,-144" fill="none" stroke={p.hair} strokeWidth={0.6} />
	</g>; };

/* ---------- 曹操 at 66, kneeling at his desk ---------- */
const FACE = 'M30,-98 C35,-90 38,-80 39,-70 C39.6,-64 39.4,-60 38.6,-56.5 C41,-50 45,-43 49,-37 C51.5,-34 52.5,-31 51.5,-28.8 C49.6,-26.6 47.4,-25.6 45.4,-25 C46.2,-22.4 47,-19.4 46.6,-16.4 C44.8,-13.6 43,-12.4 42,-11.6 C44.4,-9.6 45.6,-7.4 44.8,-5.2 C43.2,-3.4 41.4,-2.4 41.2,-0.6 C42.6,2.6 42.6,7 39.6,10.6 C33,14.6 20,15 8,13 C10,22 12,34 14,50 L-38,50 C-40,30 -42,8 -44,-12 C-38,-30 -30,-46 -26,-60 C-22,-72 -6,-86 12,-92 Z';
const HAIR = 'M33,-97 C30,-112 12,-122 -10,-122 C-36,-122 -56,-106 -59,-80 C-61,-56 -55,-32 -45,-12 L-38,-13 C-33,-34 -27,-52 -19,-66 C-9,-80 10,-90 33,-97 Z';
const EAR = 'M-15,-64 C-6,-66 -1,-57 -2,-46 C-3,-37 -8,-31 -15,-31 C-20,-35 -22,-48 -20,-59 Z';
type OP = {skin: string; skinS: string; skinH: string; white: string; whiteS: string; robe: string; robeS: string; robeH: string; line: string; ze: string};
const OLD: OP = {skin: '#B98A66', skinS: '#8E6448', skinH: '#E2BC96', white: '#E4DED2', whiteS: '#A9A398', robe: '#5C5548', robeS: '#363128', robeH: '#958A72', line: '#2A1810', ze: '#1A1612'};
/** 曹操 at 46 in his tent: black hair greying, the 皂 robe */
const MID: OP = {skin: '#C38D64', skinS: '#9C6848', skinH: '#E8BC8E', white: '#1A1412', whiteS: '#4A423C', robe: '#2E323A', robeS: '#17191E', robeH: '#5E626A', line: '#2A1810', ze: '#0E0B0A'};
/** the old head in the rig's head units (1 u ≈ 2 mm): white hair in a 平上帻, white beard, deep lines */
const OldHead: React.FC<{id: string; o?: OP; mid?: boolean}> = ({id, o = OLD, mid}) => {
	return <g>
		<defs><clipPath id={`${id}f`}><path d={FACE} /></clipPath></defs>
		<path d={HAIR} fill={o.white} />{mid && <path d="M-52,-70 C-50,-50 -46,-32 -42,-18 M-40,-96 C-30,-104 -14,-110 4,-110" fill="none" stroke="#8A8580" strokeOpacity={0.45} strokeWidth={1.4} />}
		<path d="M-50,-60 C-46,-40 -42,-24 -40,-14 L-34,-14 C-34,-30 -30,-50 -22,-66 Z" fill={o.whiteS} opacity={0.7} />
		<path d={FACE} fill={o.skin} />
		<g clipPath={`url(#${id}f)`}>
			<path d="M2,-94 C-4,-78 -6,-62 0,-48 C6,-36 12,-26 14,-14 C16,-4 14,6 10,14 L-70,70 L-70,-110 Z" fill={o.skinS} opacity={0.8} />
			<path d="M-50,9 C-20,15 10,17 41,10 L44,70 L-50,70 Z" fill={o.skinS} />
			<path d="M31,-95 C36,-87 38,-78 38.6,-68 L33.6,-68 C33,-78 31,-86 26,-93 Z" fill={o.skinH} />
			<path d="M38.8,-55 C42,-48 45.5,-42 49,-37 L45.6,-35.4 C42.4,-40.4 39.6,-46 37,-52 Z" fill={o.skinH} />
			<path d="M21,-47 C29,-48.6 35.4,-45.6 37.6,-38.6 C38.4,-33.4 36,-28.4 30,-27.4 C25.6,-31.4 22.4,-38.4 21,-47 Z" fill={o.skinH} opacity={0.3} />
		</g>
		<path d={EAR} fill={o.skin} /><path d={EAR} fill={o.skinS} opacity={0.5} />
		{/* white brows, a lowered eye (writing), the lines of age */}
		<path d="M12,-62 C21,-65 31,-65 40,-61.6 L39.4,-59 C31,-62 21,-62 12.6,-59.6 Z" fill={o.white} />
		<path d="M19.6,-53.2 C24,-54.4 28.6,-54.2 32.4,-52.6" fill="none" stroke={o.line} strokeWidth={2.6} strokeLinecap="round" />
		<path d="M20,-50.6 C24,-50 28,-50.2 31,-51.4" fill="none" stroke={o.line} strokeWidth={0.9} opacity={0.5} />
		<path d="M24,-78 C30,-80 36,-80 40,-78 M22,-84 C29,-86 35,-86 39,-84 M23,-72 C29,-73 35,-73 39,-71" fill="none" stroke={o.line} strokeWidth={1} opacity={mid ? 0.2 : 0.45} />
		<path d="M36,-34 C32,-26 32,-18 36,-12 M20,-46 C24,-43 29,-43 32,-46 M8,-30 C12,-24 14,-16 14,-8" fill="none" stroke={o.line} strokeWidth={1.2} opacity={0.5} />
		<path d="M43.4,-29.8 C45.8,-27.8 48,-27.4 49.8,-28.6" fill="none" stroke={o.line} strokeWidth={1.4} opacity={0.65} />
		{/* white moustache and a longer white beard */}
		<path d="M44.4,-21.8 C47.6,-21 48.6,-18 46.8,-15 C44,-13.6 40,-15 35,-12 C36,-16.6 40.6,-21 44.4,-21.8 Z" fill={o.white} />
		{mid ? <><path d="M44,-7.6 C46.4,0 45,10 39.4,18 C33,26 20,27 8,22.6 C-2,19 -10,11 -14,0 C-10,2 -2,7 8,10 C20,12.6 31,11 36.6,4 C39.6,0 41.6,-4 44,-7.6 Z" fill={o.white} />
			<path d="M30,18 C26,22 20,24 14,23 M40,8 C38,14 34,18 30,21 M20,16 C14,18 6,17 0,14" fill="none" stroke="#9A9088" strokeOpacity={0.6} strokeWidth={1.1} /></>
		: <><path d="M44,-8 C46.6,4 44,22 36,36 C30,46 20,50 12,46 C2,40 -8,26 -14,0 C-10,4 -2,9 8,11 C20,13 32,10 37,3 C40,-1 42,-5 44,-8 Z" fill={o.white} />
		<path d="M36,36 C30,46 20,50 12,46 C14,40 22,34 26,24 Z" fill={o.whiteS} opacity={0.8} /></>}
		<path d="M-14,0 C-18,-12 -22,-26 -24,-40 L-19,-40 C-16,-26 -12,-12 -8,-2 Z" fill={o.white} opacity={0.9} />
		{!mid && <path d="M30,16 C27,24 22,30 16,34 M38,10 C37,20 33,28 28,34 M20,16 C14,22 8,24 2,22" fill="none" stroke={o.whiteS} strokeWidth={1.2} opacity={0.8} />}
		{/* the 平上帻: a dark cloth cap, flat on top, rising at the back, over a white topknot */}
		<path d="M34,-96 C24,-104 -10,-110 -56,-98 L-58,-86 C-40,-94 0,-96 36,-88 Z" fill={o.ze} />
		<path d="M32,-98 C34,-108 30,-116 22,-120 C2,-124 -26,-124 -48,-118 L-62,-140 L-40,-142 L-30,-126 C-10,-128 12,-126 26,-122 Z" fill={o.ze} />
		<path d="M32,-98 C34,-108 30,-116 22,-120 C2,-124 -26,-124 -48,-118 L-58,-98 C-40,-104 0,-106 34,-98 Z" fill={o.ze} />
		<path d="M22,-120 C2,-124 -26,-124 -48,-118" fill="none" stroke="#6A625A" strokeWidth={1.6} opacity={0.6} />
	</g>; };
/** the kneeling old man (facing +x, floor 0); right hand holds the brush over the slips at desk height ≈ −36 */
export const CaoSeated: React.FC<{id: string; mid?: boolean; tilt?: number; hand?: P}> = ({id, mid, tilt = 14, hand = [0, 0]}) => { const o = mid ? MID : OLD, hx = hand[0], hy = hand[1];
	const LAP = 'M-34,0 C-36,-14 -32,-30 -20,-37 C-2,-40 18,-33 30,-24 C37,-19 40,-10 39.6,0 Z';
	const TORSO = 'M-22,-34 C-25,-52 -22,-70 -13,-84 C-8,-90 0,-93 6,-91 C11,-81 14,-64 14,-48 L18,-32 Z';
	const SLV = 'M-2,-86 C6,-78 12,-66 14,-58 L30,-50 L34,-44 C30,-38 22,-36 16,-38 C12,-40 4,-42 -2,-48 C-12,-58 -14,-74 -10,-84 Z';
	return <g>
		<defs><clipPath id={`${id}l`}><path d={LAP} /></clipPath><clipPath id={`${id}t`}><path d={TORSO} /></clipPath><clipPath id={`${id}s`}><path d={SLV} /></clipPath></defs>
		{/* the far arm reaching to the slips (behind the body) */}
		<path d={limb([[2, -82], [16, -56], [38, -42]], [5, 4.4, 3.4])} fill={o.robeS} />
		<path d="M36,-45 C39,-46 42,-44 42,-41 C41,-39 38,-38 36,-39 Z" fill={o.skinS} />
		{/* the lap: the robe over the folded legs, the heel and sole at the back */}
		<path d={LAP} fill={o.robe} />
		<g clipPath={`url(#${id}l)`}>
			<path d="M-40,-6 C-10,-2 20,-2 44,-4 L44,4 L-40,4 Z" fill={o.robeS} />
			<path d="M-20,-37 C-2,-40 18,-33 30,-24 C37,-19 40,-10 39.6,0 L34,0 C34,-10 30,-18 24,-22 C14,-29 -2,-34 -20,-33 Z" fill={o.robeH} opacity={0.75} />
			<path d="M-36,-14 C-22,-18 -8,-18 4,-14 M-10,-28 C4,-26 18,-20 28,-12" fill="none" stroke={o.robeS} strokeWidth={1} opacity={0.6} />
		</g>
		<path d="M-36,-1 C-38,-6 -36,-10 -32,-10 L-26,-10 L-26,0 Z" fill="#1A1410" />
		{/* torso, slightly stooped; the shade on the back, the lamp on the chest */}
		<path d={TORSO} fill={o.robe} />
		<g clipPath={`url(#${id}t)`}>
			<path d="M-30,-30 C-28,-56 -22,-76 -10,-92 L-4,-92 C-14,-76 -18,-54 -16,-30 Z" fill={o.robeS} />
			<path d="M6,-92 C12,-80 14,-64 14,-48 L18,-30 L30,-30 L30,-92 Z" fill={o.robeH} opacity={0.6} />
		</g>
		{/* white inner collar and the crossing lapel, a plain sash */}
		<path d="M4,-91 C8,-86 10,-80 11,-74 L8,-73 C7,-79 5,-84 1,-89 Z" fill="#D8CDB8" />
		<path d="M6,-90 C2,-76 -4,-62 -12,-50" fill="none" stroke={o.robeS} strokeWidth={1.6} />
		<path d="M-22,-44 L16,-46 L17,-41 L-22,-39 Z" fill={o.robeS} />
		{/* the head, bowed toward the slips */}
		<g transform={`translate(7,-98) rotate(${f1(tilt)}) scale(0.17)`}><OldHead id={id} o={o} mid={mid} /></g>
		{/* the near arm in a wide sleeve, the hand with the brush */}
		<path d={SLV} fill={o.robe} />
		<g clipPath={`url(#${id}s)`}>
			<path d="M-14,-60 C-6,-48 6,-42 18,-38 L20,-30 L-20,-30 Z" fill={o.robeS} />
			<path d="M0,-88 C8,-80 14,-68 16,-60 L32,-52 L30,-56 L18,-64 C14,-74 8,-82 2,-88 Z" fill={o.robeH} opacity={0.8} />
		</g>
		<path d="M30,-50 L34,-44 C31,-40 27,-38 23,-38" fill="none" stroke="#D8CDB8" strokeWidth={1} opacity={0.8} />
		<g transform={`translate(${f1(hx)},${f1(hy)})`}>
		<path d="M31,-50 C34,-52 37,-51 38,-48 C38.6,-45.4 37,-43 34.4,-43 C32,-43.4 30.4,-46 31,-50 Z" fill={o.skin} />
		<path d="M32,-50.4 C34,-51.6 36,-51.2 37.4,-49.4 C35.6,-48.4 33.6,-48 31.6,-48.4 Z" fill={o.skinH} />
		<path d="M36.4,-56 L37.6,-38.6" stroke="#2A1C14" strokeWidth={0.9} /><path d="M37.6,-40 L37.9,-36.6" stroke="#0E0A08" strokeWidth={1.2} strokeLinecap="round" /></g>
	</g>; };
/** the seated figure as one flat shape (for the lamp shadow on the screen) */
export const CaoSeatedShadow: React.FC = () => <g>
	<path d="M-34,0 C-36,-14 -32,-30 -22,-36 C-25,-52 -22,-70 -13,-84 C-8,-90 0,-93 4,-94 C2,-102 4,-112 12,-118 C20,-122 28,-118 30,-110 C32,-102 30,-94 24,-90 C30,-80 32,-62 32,-52 L38,-48 C40,-42 38,-38 34,-38 C36,-30 40,-14 39.6,0 Z" />
	<path d="M36.4,-56 L37.6,-38.6" strokeWidth={0.9} stroke="currentColor" />
</g>;
void f1; type _P = P;
