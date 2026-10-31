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
export const CaoBack: React.FC<{id: string}> = ({id}) => { const p = PAL;
	const CUIR = 'M-23,-141 C-25,-128 -23,-112 -19,-98 L23,-98 C26,-112 27,-128 23,-142 C10,-147 -10,-147 -23,-141 Z';
	const SKIRT = 'M-21,-101 L23,-101 L27,-58 L-25,-58 Z';
	const CAPE = 'M-22,-146 C-8,-151 6,-151 15,-147 C18,-124 17,-96 14,-70 C13,-58 12,-50 11,-41 C4,-38 -4,-41 -12,-38 C-20,-35 -30,-40 -38,-36 C-42,-35 -46,-37 -49,-36 C-46,-56 -41,-90 -33,-118 C-30,-132 -28,-142 -22,-146 Z';
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
		{/* legs: baggy crimson trousers into boots, weight on the left leg, the right heel lifting as he moves off */}
		<path d={limb([[-10, -62], [-11, -48], [-11, -38]], [7.6, 7, 6])} fill={p.underS} /><path d={limb([[10, -62], [11.5, -48], [12, -40]], [7.6, 7, 6])} fill={p.under} />
		<path d="M-17,-40 L-5,-40 C-4.6,-26 -4.4,-12 -3.8,-4 C-3.8,-1 -6.4,0 -10.4,0 C-15,0 -18.2,-1 -18,-4 C-17.6,-14 -17.4,-28 -17,-40 Z" fill="#16100C" />
		<path d="M6,-42 L18,-42 C18.4,-30 18.6,-18 19,-9 C19,-6 16.6,-4.6 12.6,-4.6 C8.6,-4.6 6.2,-6 6.2,-9 C6.2,-18 6,-30 6,-42 Z" fill="#1C140F" />
		<path d="M15.6,-41 L18,-42 C18.4,-30 18.6,-18 19,-9 L17,-7 C16.6,-18 16.2,-30 15.6,-41 Z" fill="#6A5A4C" opacity={0.6} />
		<path d="M-17,-40 L-5,-40 L-5,-37.6 L-17,-37.6 Z M6,-42 L18,-42 L18,-39.6 L6,-39.6 Z" fill="#2E2218" />
		{/* the scabbard of the 环首刀 under the cape, its chape showing below the hem */}
		<path d={limb([[-18, -96], [-31, -31]], [2.4, 2.1])} fill="#24160F" /><path d={limb([[-30, -37], [-31.4, -30]], [2.7, 2.6])} fill={p.gold} />
		{/* the lamellar skirt and the cuirass (the right side shows past the cape) */}
		<path d={SKIRT} fill={`url(#${id}lm)`} />
		<g clipPath={`url(#${id}k)`}><rect x={-30} y={-110} width={36} height={60} fill={p.metalS} opacity={0.55} /><rect x={18} y={-110} width={12} height={60} fill={p.metalH} opacity={0.28} /><rect x={-30} y={-62} width={60} height={4} fill={p.lace} /></g>
		<path d={CUIR} fill={`url(#${id}lm)`} />
		<g clipPath={`url(#${id}u)`}><rect x={-30} y={-150} width={40} height={56} fill={p.metalS} opacity={0.5} /><path d="M17,-146 C21,-128 22,-112 20,-98 L30,-98 L30,-146 Z" fill={p.metalH} opacity={0.3} />
			{[-128, -114].map((y) => <rect key={y} x={-30} y={y} width={60} height={0.9} fill={p.lace} opacity={0.8} />)}</g>
		<path d="M-20,-101 L23,-101 L23,-97 L-20,-97 Z" fill="#1A120E" /><ellipse cx={22} cy={-99} rx={1.6} ry={1.2} fill={p.gold} />
		{/* the right arm raised forward with the torch: crimson sleeve, a lamellar 披膊 on the upper arm, a metal bracer */}
		<path d={limb([[18, -139], [33, -147], [44, -160]], [6.4, 5, 4.2])} fill={p.under} />
		<path d={limb([[19, -142], [33, -150], [43, -163]], [2, 1.8, 1.4])} fill="#8A4A3A" opacity={0.7} />
		<path d={limb([[36, -151], [44, -161]], [4.6, 4.4])} fill={p.metal} /><path d={limb([[37, -154], [44, -163]], [1.4, 1.2])} fill={p.metalH} opacity={0.7} />
		<path d="M12,-148 C18,-152 28,-151 32,-145 C33,-140 31,-135 27,-133 C22,-134 16,-136 12,-140 Z" fill={`url(#${id}lm)`} />
		<path d="M24,-150 C29,-149 32,-146 32,-142 L28,-141 C28,-145 26,-147 22,-148 Z" fill={p.metalH} opacity={0.45} />
		<path d="M12,-140 C16,-136 22,-134 27,-133" fill="none" stroke={p.lace} strokeWidth={1.4} />
		{/* the torch: shaft from below the fist up and forward */}
		<path d={limb([[42.6, -150], [54, -194]], [1.4, 1.6])} fill="#2A1A10" />
		<ellipse cx={54.2} cy={-194} rx={2.6} ry={3.2} fill="#3A2216" transform="rotate(14 54.2 -194)" />
		<g transform="translate(44.5,-161) rotate(-62)"><path d="M-3.4,-3 C0,-4.4 3.6,-3 4,0 C4.2,3 1.6,4.4 -1.4,4 C-3.8,3.4 -4.6,-1 -3.4,-3 Z" fill={p.skin} /><path d="M-3.4,-3 C-1,-3.8 1.4,-3.6 3,-2.4 C1,-1 -1.6,-0.4 -4,-0.6 Z" fill={p.skinH} /></g>
		{/* the cape over the back: base, the shade away from the torch, a lit fold on the right, fold lines */}
		<path d={CAPE} fill={p.cape} />
		<g clipPath={`url(#${id}c)`}>
			<path d="M-50,-150 L-12,-150 C-14,-120 -16,-80 -20,-40 L-50,-40 Z" fill={p.capeS} />
			<path d="M8,-148 C11,-124 11,-96 8,-60 L6,-44 L20,-44 L20,-150 Z" fill="#6A3428" opacity={0.75} />
			<path d="M2,-140 C3,-112 2,-80 -1,-46 M-8,-134 C-10,-106 -12,-78 -14,-46 M-20,-128 C-24,-100 -28,-74 -32,-46" fill="none" stroke={p.capeS} strokeWidth={1.4} opacity={0.8} />
			<path d="M-14,-144 C-6,-148 4,-148 12,-146" fill="none" stroke="#7A3A2E" strokeWidth={1.4} opacity={0.7} />
		</g>
		{/* the left shoulder under the cape: a soft bump */}
		<path d="M-22,-146 C-26,-144 -28,-140 -29,-134 L-24,-136 Z" fill={p.capeS} />
		<g transform="translate(2,-146) scale(0.84) translate(-2,146)">{/* neck and head: the back of the head, the right ear and a sliver of cheek and beard (lost profile), the 帻 band and the 武冠 */}
		<path d="M-6,-152 L8,-152 L9,-144 L-6,-144 Z" fill={p.skinS} />
		<path d="M-10,-150 C-12,-158 -11,-167 -5,-171 C1,-174 9,-173 13,-167 C15,-161 15,-153 12,-148 C7,-145 -4,-145 -10,-150 Z" fill={p.hair} />
		<path d="M11.6,-156 C14,-153 15.6,-148.6 14.8,-145.4 C13.6,-143.4 11.4,-143.2 10,-145 C10.4,-149 10.8,-152.4 11.6,-156 Z" fill={p.skinH} />
		<path d="M13.4,-150 C15.6,-147.6 15.4,-143.4 13,-141.2 C11.2,-140.8 9.8,-141.8 9.8,-143.4 C11.4,-144 12.6,-146.6 13.4,-150 Z" fill="#2A2420" />
		<path d="M13.6,-148.4 C14.6,-146.6 14.4,-144.4 13.2,-142.8" fill="none" stroke="#9A9088" strokeWidth={0.4} opacity={0.7} />
		<path d="M11.2,-162 C14,-163 16,-160 15.6,-156.4 C15.2,-153.6 13.4,-152.4 11.6,-153.2 C11,-156 10.8,-159 11.2,-162 Z" fill={p.skin} />
		<path d="M12.4,-160.4 C14.2,-160 14.8,-157.6 14,-155.4" fill="none" stroke={p.skinS} strokeWidth={0.6} />
		<path d="M-11,-161 C-4,-163.4 6,-164 14.6,-162.4 L14.4,-159.6 C6,-161 -4,-160.6 -10.6,-158.2 Z" fill={p.hair} />
		<path d="M-9.6,-162.4 C-10.4,-171 -7,-178.6 1.4,-180 C9,-181 13.6,-175 13.6,-163.6 Z" fill={p.hair} />
		<path d="M-8,-164 C-8,-172 -4,-177.6 2,-178.6 M-3,-163.6 C-3,-171 0,-177 4,-179 M3,-163.4 C3.4,-170 5,-176 8,-178.4 M8.6,-163.4 C9,-169 10.4,-173.6 12,-175.4 M-9.4,-168.6 C-2,-171 7,-171 13.4,-168.6 M-8,-174 C-2,-176 6,-176.4 11.4,-174.6" fill="none" stroke={p.metalH} strokeOpacity={0.14} strokeWidth={0.4} />
		<path d="M1.4,-180 C8,-181 13.6,-175 13.6,-164" fill="none" stroke={p.skinH} strokeOpacity={0.4} strokeWidth={0.7} />
		<path d="M13.6,-162 C13.8,-156 13.4,-150 12.4,-146" fill="none" stroke={p.hair} strokeWidth={0.7} />
		<path d="M-10.6,-158.2 C-4,-160.6 6,-161 14.4,-159.6" fill="none" stroke={p.trim} strokeWidth={0.9} opacity={0.85} />
	</g>
	</g>; };

/* ---------- 曹操 at 66, kneeling at his desk ---------- */
const FACE = 'M30,-98 C35,-90 38,-80 39,-70 C39.6,-64 39.4,-60 38.6,-56.5 C41,-50 45,-43 49,-37 C51.5,-34 52.5,-31 51.5,-28.8 C49.6,-26.6 47.4,-25.6 45.4,-25 C46.2,-22.4 47,-19.4 46.6,-16.4 C44.8,-13.6 43,-12.4 42,-11.6 C44.4,-9.6 45.6,-7.4 44.8,-5.2 C43.2,-3.4 41.4,-2.4 41.2,-0.6 C42.6,2.6 42.6,7 39.6,10.6 C33,14.6 20,15 8,13 C10,22 12,34 14,50 L-38,50 C-40,30 -42,8 -44,-12 C-38,-30 -30,-46 -26,-60 C-22,-72 -6,-86 12,-92 Z';
const HAIR = 'M33,-97 C30,-112 12,-122 -10,-122 C-36,-122 -56,-106 -59,-80 C-61,-56 -55,-32 -45,-12 L-38,-13 C-33,-34 -27,-52 -19,-66 C-9,-80 10,-90 33,-97 Z';
const EAR = 'M-15,-64 C-6,-66 -1,-57 -2,-46 C-3,-37 -8,-31 -15,-31 C-20,-35 -22,-48 -20,-59 Z';
const OLD = {skin: '#B98A66', skinS: '#8E6448', skinH: '#E2BC96', white: '#E4DED2', whiteS: '#A9A398', robe: '#5C5548', robeS: '#363128', robeH: '#958A72', line: '#2A1810', ze: '#1A1612'};
/** the old head in the rig's head units (1 u ≈ 2 mm): white hair in a 平上帻, white beard, deep lines */
const OldHead: React.FC<{id: string}> = ({id}) => { const o = OLD;
	return <g>
		<defs><clipPath id={`${id}f`}><path d={FACE} /></clipPath></defs>
		<path d={HAIR} fill={o.white} />
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
		<path d="M24,-78 C30,-80 36,-80 40,-78 M22,-84 C29,-86 35,-86 39,-84 M23,-72 C29,-73 35,-73 39,-71" fill="none" stroke={o.line} strokeWidth={1} opacity={0.45} />
		<path d="M36,-34 C32,-26 32,-18 36,-12 M20,-46 C24,-43 29,-43 32,-46 M8,-30 C12,-24 14,-16 14,-8" fill="none" stroke={o.line} strokeWidth={1.2} opacity={0.5} />
		<path d="M43.4,-29.8 C45.8,-27.8 48,-27.4 49.8,-28.6" fill="none" stroke={o.line} strokeWidth={1.4} opacity={0.65} />
		{/* white moustache and a longer white beard */}
		<path d="M44.4,-21.8 C47.6,-21 48.6,-18 46.8,-15 C44,-13.6 40,-15 35,-12 C36,-16.6 40.6,-21 44.4,-21.8 Z" fill={o.white} />
		<path d="M44,-8 C46.6,4 44,22 36,36 C30,46 20,50 12,46 C2,40 -8,26 -14,0 C-10,4 -2,9 8,11 C20,13 32,10 37,3 C40,-1 42,-5 44,-8 Z" fill={o.white} />
		<path d="M36,36 C30,46 20,50 12,46 C14,40 22,34 26,24 Z" fill={o.whiteS} opacity={0.8} />
		<path d="M-14,0 C-18,-12 -22,-26 -24,-40 L-19,-40 C-16,-26 -12,-12 -8,-2 Z" fill={o.white} opacity={0.9} />
		<path d="M30,16 C27,24 22,30 16,34 M38,10 C37,20 33,28 28,34 M20,16 C14,22 8,24 2,22" fill="none" stroke={o.whiteS} strokeWidth={1.2} opacity={0.8} />
		{/* the 平上帻: a dark cloth cap, flat on top, rising at the back, over a white topknot */}
		<path d="M34,-96 C24,-104 -10,-110 -56,-98 L-58,-86 C-40,-94 0,-96 36,-88 Z" fill={o.ze} />
		<path d="M32,-98 C34,-108 30,-116 22,-120 C2,-124 -26,-124 -48,-118 L-62,-140 L-40,-142 L-30,-126 C-10,-128 12,-126 26,-122 Z" fill={o.ze} />
		<path d="M32,-98 C34,-108 30,-116 22,-120 C2,-124 -26,-124 -48,-118 L-58,-98 C-40,-104 0,-106 34,-98 Z" fill={o.ze} />
		<path d="M22,-120 C2,-124 -26,-124 -48,-118" fill="none" stroke="#6A625A" strokeWidth={1.6} opacity={0.6} />
	</g>; };
/** the kneeling old man (facing +x, floor 0); right hand holds the brush over the slips at desk height ≈ −36 */
export const CaoSeated: React.FC<{id: string}> = ({id}) => { const o = OLD;
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
		<g transform="translate(7,-98) rotate(14) scale(0.17)"><OldHead id={id} /></g>
		{/* the near arm in a wide sleeve, the hand with the brush */}
		<path d={SLV} fill={o.robe} />
		<g clipPath={`url(#${id}s)`}>
			<path d="M-14,-60 C-6,-48 6,-42 18,-38 L20,-30 L-20,-30 Z" fill={o.robeS} />
			<path d="M0,-88 C8,-80 14,-68 16,-60 L32,-52 L30,-56 L18,-64 C14,-74 8,-82 2,-88 Z" fill={o.robeH} opacity={0.8} />
		</g>
		<path d="M30,-50 L34,-44 C31,-40 27,-38 23,-38" fill="none" stroke="#D8CDB8" strokeWidth={1} opacity={0.8} />
		<path d="M31,-50 C34,-52 37,-51 38,-48 C38.6,-45.4 37,-43 34.4,-43 C32,-43.4 30.4,-46 31,-50 Z" fill={o.skin} />
		<path d="M32,-50.4 C34,-51.6 36,-51.2 37.4,-49.4 C35.6,-48.4 33.6,-48 31.6,-48.4 Z" fill={o.skinH} />
		<path d="M36.4,-56 L37.6,-38.6" stroke="#2A1C14" strokeWidth={0.9} /><path d="M37.6,-40 L37.9,-36.6" stroke="#0E0A08" strokeWidth={1.2} strokeLinecap="round" />
	</g>; };
/** the seated figure as one flat shape (for the lamp shadow on the screen) */
export const CaoSeatedShadow: React.FC = () => <g>
	<path d="M-34,0 C-36,-14 -32,-30 -22,-36 C-25,-52 -22,-70 -13,-84 C-8,-90 0,-93 4,-94 C2,-102 4,-112 12,-118 C20,-122 28,-118 30,-110 C32,-102 30,-94 24,-90 C30,-80 32,-62 32,-52 L38,-48 C40,-42 38,-38 34,-38 C36,-30 40,-14 39.6,0 Z" />
	<path d="M36.4,-56 L37.6,-38.6" strokeWidth={0.9} stroke="currentColor" />
</g>;
void f1; type _P = P;
