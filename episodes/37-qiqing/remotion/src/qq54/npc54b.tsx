import React from 'react';
/* ep54 look B · NPC silhouettes at real adult proportions (owner note r2: "more normal proportion, like in C").
   Local units = cm, facing +x, soles at y = 0, crown at about −171 (cap top −175): about 7.4 heads, long legs, a narrow chest
   (about 24 cm deep in profile), and real 戟 lengths (≈ 2.5 m). Drawn in one tone (the look's warm black); the caller applies
   the rim filter in screen space. Scale k = px per cm. When 曹操's rig (cao54b, 1 unit ≈ 2 mm) stands at scale S, the matching
   NPC k is S × 4.98. */
export type NpcKind = 'ji' | 'torch' | 'plain' | 'hold';
const HEAD = 'M-7,-160 C-7.5,-167 -2,-171 3.5,-171 C8.5,-171 11,-167.5 11.2,-163 L11.6,-160.2 L13.2,-156.6 L11.8,-155.8 C12.2,-154.6 12,-153.2 11.2,-152.2 C11.6,-150.8 11,-149.2 9.6,-148.6 C7,-147.8 4.6,-148.2 3,-149.4 L2.6,-146 L-4,-146 C-5,-150 -6.6,-154 -7,-160 Z';
const ZE = 'M-8,-161 C-8.8,-167 -7,-171.6 -1.6,-173.2 L8.4,-173.4 C11,-172 12,-169 12,-166 C8,-167 3,-167 -1,-165 Z M-8.8,-162.4 L-9.6,-175.6 L-3.4,-175.8 L-1.2,-171 Z';
const NECK = 'M-3.6,-149 L4.6,-147 L5.2,-137 L-4.4,-137 Z';
/** knee-length tunic (襦) for soldiers and runners; ankle robe (袍) for the rest */
const TUNIC = 'M-4,-141 C-11,-140 -13.4,-135 -13.4,-126 C-13.4,-114 -12.2,-106 -11.6,-101 L-12.6,-99 C-14.8,-84 -16.4,-66 -18,-50 C-6,-48.6 8,-48.6 19,-50 C17.2,-66 15,-84 13,-99 L12.4,-101 C13.4,-107 15,-116 14.4,-126 C13.8,-134 9.6,-140 5,-141 Z';
const ROBE = 'M-4,-141 C-11,-140 -13.4,-135 -13.4,-126 C-13.4,-112 -12.4,-103 -13,-97 C-15,-70 -18,-36 -21,-4 L19.5,-4 C17,-36 15,-70 13.4,-97 C14,-104 15,-114 14.4,-126 C13.8,-134 9.6,-140 5,-141 Z';
const f2 = (v: number) => v.toFixed(2);
const limb = (a: [number, number], b: [number, number], w0: number, w1: number) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
	return `M${f2(a[0] + nx * w0)},${f2(a[1] + ny * w0)} L${f2(b[0] + nx * w1)},${f2(b[1] + ny * w1)} L${f2(b[0] - nx * w1)},${f2(b[1] - ny * w1)} L${f2(a[0] - nx * w0)},${f2(a[1] - ny * w0)} Z`; };

export const Npc: React.FC<{x: number; y: number; k: number; flip?: boolean; kind?: NpcKind; long?: boolean; stride?: number; t?: number}> = ({x, y, k, flip, kind = 'plain', long, stride = 0, t = 0}) => {
	const st = stride, legB = limb([-5, -52], [-6 - st * 14, -6], 6, 4.6), legF = limb([5, -52], [7 + st * 14, -6], 6, 4.6);
	const shoeB = `M${f2(-12 - st * 14)},-6 L${f2(1 - st * 14)},-6 L${f2(3 - st * 14)},0 L${f2(-12 - st * 14)},0 Z`, shoeF = `M${f2(1 + st * 14)},-6 L${f2(14 + st * 14)},-5.5 C${f2(17 + st * 14)},-4 ${f2(17 + st * 14)},-1 ${f2(15 + st * 14)},0 L${f2(1 + st * 14)},0 Z`;
	/* the near arm: down by the side, or forward to a shaft / a raised torch */
	const sh: [number, number] = [2, -134];
	const el: [number, number] = kind === 'ji' ? [6, -108] : kind === 'torch' ? [12, -112] : kind === 'hold' ? [14, -112] : [3, -106];
	const hd: [number, number] = kind === 'ji' ? [15, -98] : kind === 'torch' ? [24, -124] : kind === 'hold' ? [30, -106] : [5, -80];
	return <g transform={`translate(${x},${y}) scale(${flip ? -k : k},${k})`}>
		{/* far arm, behind */}
		<path d={limb([-2, -134], [-6, -106], 5, 4.4)} /><path d={limb([-6, -106], [-3, -82], 4.4, 3.6)} />
		{!long && <><path d={legB} /><path d={legF} /><path d={shoeB} /><path d={shoeF} /></>}
		{long && <><path d={shoeB} /><path d={shoeF} /></>}
		<path d={long ? ROBE : TUNIC} />
		{kind !== 'torch' && <g><path d="M10,-100 L-26,-62 L-24.4,-60.4 L11.6,-98.4 Z" /><path fillRule="evenodd" d="M15.4,-102.4 a2.8,2.8 0 1 0 -5.6,0 a2.8,2.8 0 1 0 5.6,0 Z M14,-102.4 a1.4,1.4 0 1 0 -2.8,0 a1.4,1.4 0 1 0 2.8,0 Z" /></g>}
		<path d={NECK} /><path d={HEAD} /><path d={ZE} />
		{/* near arm (tight sleeve) and the hand */}
		<path d={limb(sh, el, 5.4, 4.8)} /><path d={limb(el, hd, 4.8, 3.8)} />
		<circle cx={hd[0]} cy={hd[1]} r={4} />
		{kind === 'ji' && <g>
			<rect x={13.8} y={-252} width={2.6} height={250} />
			<path d="M15.1,-270 C16.6,-264 17,-258 16.4,-252 L13.8,-252 C13.2,-258 13.6,-264 15.1,-270 Z" />
			<path d="M16.2,-246 L30,-243 C33,-242.4 34,-240 33,-238.4 L16.2,-241.4 Z" />
			<path d="M13.8,-246 L9,-244.6 L9,-242.8 L13.8,-243 Z" />
		</g>}
		{kind === 'torch' && <g>
			<path d={limb([20, -112], [31, -150], 1.6, 1.8)} />
		</g>}
	</g>; };
/** the torch flame for an Npc torch-bearer, drawn in screen space over the rimmed silhouette: (x, y, k, flip) as the Npc */
export const NpcFlame: React.FC<{x: number; y: number; k: number; flip?: boolean; t?: number}> = ({x, y, k, flip, t = 0}) => {
	const fx = x + (flip ? -31 : 31) * k, fy = y - 151 * k, s = k, w = Math.sin(t) * 1.2 * s;
	const gid = `tg${Math.round(x)}${Math.round(y)}`;
	return <g>
		<defs><radialGradient id={gid}><stop offset="0" stopColor="#FFD08A" stopOpacity="0.55" /><stop offset="0.35" stopColor="#FFC27A" stopOpacity="0.2" /><stop offset="1" stopColor="#FFC27A" stopOpacity="0" /></radialGradient></defs>
		<circle cx={fx} cy={fy - 8 * s} r={60 * s} fill={`url(#${gid})`} />
		<path d={`M${fx - 4.6 * s},${fy} C${fx - 5.6 * s},${fy - 8 * s} ${fx - 1 * s + w},${fy - 14 * s} ${fx + w},${fy - 22 * s} C${fx + 3 * s},${fy - 14 * s} ${fx + 6 * s},${fy - 8 * s} ${fx + 4.6 * s},${fy} Z`} fill="#F0A050" />
		<path d={`M${fx - 2.6 * s},${fy} C${fx - 3 * s},${fy - 6 * s} ${fx + w},${fy - 10 * s} ${fx + w},${fy - 15 * s} C${fx + 2 * s},${fy - 9 * s} ${fx + 3.4 * s},${fy - 5 * s} ${fx + 2.6 * s},${fy} Z`} fill="#FFE6B0" />
	</g>; };
/** a Han lamp on a tall stand (豆形灯 on a 灯檠), base at (x, y), k = px per cm (≈ 120 cm tall); the flame is warm ivory */
export const LampStand: React.FC<{x: number; y: number; k: number}> = ({x, y, k}) => <g>
	<g transform={`translate(${x},${y}) scale(${k})`}>
		<path d="M-14,0 C-12,-4 -6,-6 -2.4,-7 L-1.6,-110 L-9,-112 C-9,-115 -4,-117 0,-117 C4,-117 9,-115 9,-112 L1.6,-110 L2.4,-7 C6,-6 12,-4 14,0 Z" fill="#140D0A" />
	</g>
	<defs><radialGradient id={`lg${Math.round(x)}${Math.round(y)}`}><stop offset="0" stopColor="#F3DDB4" stopOpacity="0.7" /><stop offset="0.3" stopColor="#F3DDB4" stopOpacity="0.22" /><stop offset="1" stopColor="#F3DDB4" stopOpacity="0" /></radialGradient></defs>
	<circle cx={x} cy={y - 122 * k} r={70 * k} fill={`url(#lg${Math.round(x)}${Math.round(y)})`} />
	<path d={`M${x - 2.4 * k},${y - 117 * k} C${x - 3 * k},${y - 122 * k} ${x},${y - 126 * k} ${x},${y - 130 * k} C${x + 1.4 * k},${y - 125 * k} ${x + 3 * k},${y - 121 * k} ${x + 2.4 * k},${y - 117 * k} Z`} fill="#FFF0D0" />
</g>;
