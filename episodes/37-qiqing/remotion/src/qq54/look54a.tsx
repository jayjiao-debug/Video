import React from 'react';
import {W, H, SANS, SERIF, rnd} from '../qq50/kit50';
import {Fig, FigP, RimF, BlurF, SIL, cap} from './fig54a';
/* ep54 look A 「铜灯影 · 纯剪影」 (the 马首 family): flat-vector 2.5D sets of 3–6 cut-out depth planes with haze between them,
   ONE warm key light per scene that sits on its object, every person a warm-black silhouette lit only at the edges; 曹操 is
   the one figure whose rim is the episode accent (gold). Props and architecture are drawn in detail and lit.
   Owner 2026-10-31: style first → Look1 = the style sheet (frame 0, bare); Look2 / Look3 = stubs. */
const CREAM = '#F2E6CC', ACC = '#F2C266', RIMC = '#E7A46C', BOARD = '#100B09';
const f1 = (v: number) => v.toFixed(1);

/* ======================= the set: 洛阳 city gate at night (design space 1920×1080) =======================
   planes, back to front: sky · far palace towers (haze) · the city wall with the 门楼 and three timber-lined passages ·
   ground haze · the paired 门阙 · the road and the patrol · a foreground branch. Key = the light inside the central passage
   (the door ajar) + the two lanterns under the 门楼 (warm ivory); everything else is slate night. */
const roofHip = (x0: number, x1: number, ye: number, r0: number, r1: number, yr: number, up = 6) =>
	`M${x0 - up},${ye - up * 0.9} Q${x0 + 18},${ye + 2} ${x0 + 60},${ye} L${x1 - 60},${ye} Q${x1 - 18},${ye + 2} ${x1 + up},${ye - up * 0.9} L${r1},${yr} L${r0},${yr} Z`;
const ridge = (r0: number, r1: number, yr: number, h = 9) => `M${r0 - 8},${yr - h - 5} L${r0 + 6},${yr - h} L${r1 - 6},${yr - h} L${r1 + 8},${yr - h - 5} L${r1 + 6},${yr + 1} L${r0 - 6},${yr + 1} Z`;
/** a row of 一斗二升 brackets under an eave, lit from below */
const Brackets: React.FC<{x0: number; x1: number; y: number; n: number; s?: number; lit?: string}> = ({x0, x1, y, n, s = 1, lit = '#B68A5E'}) => <g>
	{Array.from({length: n}, (_, i) => { const x = x0 + (x1 - x0) * (n === 1 ? 0.5 : i / (n - 1));
		return <g key={i} transform={`translate(${f1(x)},${y}) scale(${s})`}>
			<path d="M-5,0 L5,0 L4,7 L-4,7 Z" fill="#2A1D15" /><path d="M-17,-3 C-16,3 -10,5 0,5 C10,5 16,3 17,-3 L17,-7 L-17,-7 Z" fill="#33231A" />
			<path d="M-17,-3 C-16,3 -10,5 0,5 C10,5 16,3 17,-3" fill="none" stroke={lit} strokeWidth={1.4} strokeOpacity={0.8} />
			<path d="M-20,-7 L-12,-7 L-13,-13 L-19,-13 Z M12,-7 L20,-7 L19,-13 L13,-13 Z M-4,-7 L4,-7 L4,-13 L-4,-13 Z" fill="#2A1D15" />
			<path d="M-20,-7 L-12,-7 M12,-7 L20,-7 M-4,-7 L4,-7" stroke={lit} strokeWidth={1.2} strokeOpacity={0.7} /></g>; })}</g>;
/** tiles: vertical 筒瓦 rows on a roof face, eave 瓦当 discs */
const Tiles: React.FC<{x0: number; x1: number; ye: number; yr: number; r0: number; r1: number; step?: number; disc?: string}> = ({x0, x1, ye, yr, r0, r1, step = 13, disc = '#8E6A4C'}) => { const n = Math.floor((x1 - x0) / step);
	return <g>{Array.from({length: n}, (_, i) => { const u = (i + 0.5) / n, xe = x0 + (x1 - x0) * u, xr = r0 + (r1 - r0) * u;
		return <g key={i}><path d={`M${f1(xe)},${ye - 2} L${f1(xr)},${yr + 2}`} stroke="#0E0A08" strokeWidth={2.2} strokeOpacity={0.55} />
			<path d={`M${f1(xe + 2)},${ye - 2} L${f1(xr + 1.4)},${yr + 2}`} stroke="#5A5A58" strokeWidth={0.9} strokeOpacity={0.35} />
			<circle cx={xe} cy={ye + 1} r={step * 0.36} fill={disc} stroke="#1A120E" strokeWidth={1} /></g>; })}</g>; };
/** a timber-lined passage (排叉柱 posts, a flat lintel) with two door leaves; open = 0..1 the right leaf swung in */
const Passage: React.FC<{x: number; w: number; y0: number; y1: number; open?: number; id: string}> = ({x, w, y0, y1, open = 0, id}) => { const half = w / 2, gap = open * half * 0.9;
	const studs = (lx: number, lw: number) => Array.from({length: 5}, (_, r) => Array.from({length: 3}, (_, c) => <g key={`${r}${c}`}><circle cx={lx + lw * (c + 1) / 4} cy={y0 + 34 + r * (y1 - y0 - 60) / 4.6} r={3.4} fill="#160E0A" /><circle cx={lx + lw * (c + 1) / 4 - 1} cy={y0 + 33 + r * (y1 - y0 - 60) / 4.6} r={1.1} fill="#C99A68" opacity={0.6} /></g>));
	const ring = (cx: number) => <g><path d={`M${cx - 9},${y0 + (y1 - y0) * 0.5 - 12} L${cx + 9},${y0 + (y1 - y0) * 0.5 - 12} L${cx + 7},${y0 + (y1 - y0) * 0.5 + 2} L${cx},${y0 + (y1 - y0) * 0.5 + 6} L${cx - 7},${y0 + (y1 - y0) * 0.5 + 2} Z`} fill="#4A3A2A" stroke="#B88A58" strokeWidth={1} strokeOpacity={0.7} />
		<circle cx={cx} cy={y0 + (y1 - y0) * 0.5 + 14} r={8} fill="none" stroke="#B48656" strokeWidth={2.4} strokeOpacity={0.85} /></g>;
	return <g>
		<rect x={x - half - 14} y={y0 - 18} width={w + 28} height={y1 - y0 + 18} fill="#0E0907" />
		{gap > 0 && <><rect x={x + half - gap - 2} y={y0} width={gap} height={y1 - y0} fill={`url(#${id}in)`} />
			<path d={`M${x + half - gap},${y0} L${x + half - gap + 16},${y0 + 10} L${x + half - gap + 16},${y1 - 6} L${x + half - gap},${y1} Z`} fill="#2A1A12" /></>}
		<rect x={x - half} y={y0} width={half} height={y1 - y0} fill={`url(#${id}dr)`} stroke="#120B08" strokeWidth={2} />
		{gap < half && <rect x={x} y={y0} width={half - gap} height={y1 - y0} fill={`url(#${id}dr)`} stroke="#120B08" strokeWidth={2} />}
		{studs(x - half, half)}{gap < half * 0.5 && studs(x, half - gap)}
		{ring(x - 18)}{gap < half * 0.5 && ring(x + 18)}
		{/* posts and lintel */}
		{[x - half - 14, x + half].map((px, i) => <g key={i}><rect x={px} y={y0 - 18} width={14} height={y1 - y0 + 18} fill="#2C1E16" /><rect x={px + (i ? 0 : 11)} y={y0 - 18} width={3} height={y1 - y0 + 18} fill="#B08458" opacity={0.55} /></g>)}
		<rect x={x - half - 22} y={y0 - 30} width={w + 44} height={16} fill="#2C1E16" /><rect x={x - half - 22} y={y0 - 16} width={w + 44} height={2.5} fill="#C09060" opacity={0.6} />
		{[-1, 1].map((k) => <path key={k} d={`M${x + k * (half + 2)},${y0 + 2} L${x + k * (half - 26)},${y0 - 14} L${x + k * (half - 20)},${y0 - 14} L${x + k * (half + 2)},${y0 + 8} Z`} fill="#2C1E16" />)}
	</g>; };
const Lantern: React.FC<{x: number; y: number; s?: number; id: string}> = ({x, y, s = 1, id}) => <g transform={`translate(${x},${y}) scale(${s})`}>
	<circle cx={0} cy={22} r={95} fill={`url(#${id})`} />
	<path d="M0,-80 L0,-8" stroke="#1A120E" strokeWidth={1.6} />
	<rect x={-12} y={-10} width={24} height={6} rx={1.5} fill="#2A1D15" />
	<path d="M-15,-4 C-21,6 -21,38 -15,48 L15,48 C21,38 21,6 15,-4 Z" fill="#F3DDB4" />
	<path d="M-15,-4 C-21,6 -21,38 -15,48 L15,48 C21,38 21,6 15,-4 Z" fill="url(#lanSh)" />
	{[-9, 0, 9].map((k) => <path key={k} d={`M${k},-4 C${k * 1.35},12 ${k * 1.35},32 ${k},48`} fill="none" stroke="#7A5A3A" strokeWidth={1} opacity={0.55} />)}
	<rect x={-12} y={48} width={24} height={6} rx={1.5} fill="#2A1D15" /><path d="M0,54 L0,72" stroke="#7A3A26" strokeWidth={3} />
</g>;
/** a Han 阙: a tall body with timber bands, a bracket tier and an eave, an upper storey, a hip roof; a lower 子阙 on the outer side.
    side = −1 (left 阙, its inner face toward +x) or +1 */
const Que: React.FC<{cx: number; g: number; side: -1 | 1; id: string}> = ({cx, g, side, id}) => { const o = -side;   /* o = the inner direction */
	const bw = 124, x0 = cx - bw / 2, x1 = cx + bw / 2, sx = side < 0 ? x0 - 84 : x1, sxw = 84;
	return <g>
		{/* 子阙 (outer, lower) */}
		<rect x={sx} y={g - 270} width={sxw} height={270} fill={`url(#${id}b)`} />
		<Brackets x0={sx + 12} x1={sx + sxw - 12} y={g - 276} n={3} s={0.8} lit="#8A6A50" />
		<path d={roofHip(sx - 14, sx + sxw + 14, g - 282, sx + 18, sx + sxw - 18, g - 314, 5)} fill="#17120F" /><path d={ridge(sx + 18, sx + sxw - 18, g - 314, 6)} fill="#110D0B" />
		{/* 母阙 body */}
		<defs><linearGradient id={`${id}rim`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E2B07E" stopOpacity="0.08" /><stop offset="0.6" stopColor="#E2B07E" stopOpacity="0.35" /><stop offset="1" stopColor="#F0C08A" stopOpacity="0.9" /></linearGradient></defs>
		<path d={`M${x0 - 9},${g} L${x1 + 9},${g} L${x1},${g - 440} L${x0},${g - 440} Z`} fill={`url(#${id}b)`} />
		{[g - 120, g - 250, g - 380].map((y, i) => <g key={i}><rect x={x0} y={y} width={bw} height={10} fill="#2A1E17" /><rect x={x0} y={y + 10} width={bw} height={1.6} fill="#9A7A5A" opacity={0.4} /></g>)}
		{/* carved panels (relief of 斗拱 and figures, read as panels) */}
		{[g - 230, g - 360].map((y, i) => <rect key={i} x={x0 + 22} y={y} width={bw - 44} height={96} fill="none" stroke="#5A4A3E" strokeOpacity={0.55} strokeWidth={2} />)}
		<rect x={x0 - 16} y={g - 446} width={bw + 32} height={12} fill="#2A1E17" /><rect x={x0 - 16} y={g - 435} width={bw + 32} height={2} fill="#C29466" opacity={0.5} />
		<Brackets x0={x0 - 6} x1={x1 + 6} y={g - 446} n={5} s={1.05} lit="#C29466" />
		<path d={roofHip(x0 - 66, x1 + 66, g - 458, x0 + 4, x1 - 4, g - 500, 7)} fill="#17120F" />
		<Tiles x0={x0 - 56} x1={x1 + 56} ye={g - 458} yr={g - 500} r0={x0 + 6} r1={x1 - 6} step={13} disc="#6E5644" />
		{/* upper storey with a lit 直棂 window */}
		<rect x={x0 + 18} y={g - 556} width={bw - 36} height={62} fill="#2C2019" />
		<rect x={cx - 26} y={g - 544} width={52} height={36} fill="#E3C892" opacity={0.75} />
		{Array.from({length: 7}, (_, i) => <rect key={i} x={cx - 24 + i * 7.6} y={g - 544} width={2.6} height={36} fill="#2A1D15" />)}
		<Brackets x0={x0 + 22} x1={x1 - 22} y={g - 562} n={4} s={0.9} lit="#B08860" />
		<path d={roofHip(x0 - 48, x1 + 48, g - 572, cx - 24, cx + 24, g - 626, 7)} fill="#17120F" />
		<Tiles x0={x0 - 40} x1={x1 + 40} ye={g - 572} yr={g - 626} r0={cx - 22} r1={cx + 22} step={13} disc="#6E5644" />
		<path d={ridge(cx - 24, cx + 24, g - 626, 8)} fill="#110D0B" />
		{/* stone base (台基) with a lit top */}
		<rect x={Math.min(x0, sx) - 18} y={g - 8} width={bw + sxw + 36} height={30} fill="#3A322C" /><rect x={Math.min(x0, sx) - 18} y={g - 8} width={bw + sxw + 36} height={3} fill="#C7A27A" opacity={0.6} />
		{/* the inner edge catches the gate light */}
		<path d={o > 0 ? `M${x1 - 3},${g - 440} L${x1},${g - 440} L${x1 + 9},${g} L${x1 + 5},${g} Z` : `M${x0},${g - 440} L${x0 + 3},${g - 440} L${x0 - 5},${g} L${x0 - 9},${g} Z`} fill={`url(#${id}rim)`} />
		{[g - 446, g - 458].map((y, i) => <path key={i} d={`M${o > 0 ? x1 - 30 : x0 - 50},${y + 12} L${o > 0 ? x1 + 50 : x0 + 30},${y + 12}`} stroke="#E0AE7C" strokeOpacity={0.45} strokeWidth={1.6} />)}
	</g>; };
/** the patrol and the guards: warm-black silhouettes on the road, rim from the gate (behind, centre) */
const pose = (x: number, y: number, s: number, dir: 1 | -1, ph: number, extra: Partial<FigP> = {}): FigP => ({x, y, s, dir, fa: [20 + 6 * ph, 70], ba: [-14 * ph, -4], fl: [14 * ph, 14 * ph - 6], bl: [-14 * ph, -14 * ph - 10], dress: 'armour', hat: 'helmet', fp: {kind: 'ji', ang: 172, len: 66}, lean: 3, ...extra});
const SetLuoyang: React.FC<{id: string}> = ({id}) => {
	const stars = Array.from({length: 80}, (_, i) => ({x: rnd(i, 3) * 1920, y: rnd(i, 7) * 360, r: 0.6 + rnd(i, 11) * 1.4, o: 0.18 + rnd(i, 13) * 0.45}));
	const wallTop = 470, G = 820, GQ = 905;
	const far = [[120, 330, 110], [300, 370, 80], [470, 300, 90], [1440, 320, 100], [1650, 290, 120], [1820, 360, 90]];
	const guards = [Fig(pose(766, G - 30, 0.62, 1, 0, {fa: [8, 4], ba: [-6, 0], fl: [3, 0], bl: [-3, 0], fp: {kind: 'ji', ang: 178, len: 66}, lean: 0})), Fig(pose(1156, G - 30, 0.62, -1, 0, {fa: [8, 4], ba: [-6, 0], fl: [3, 0], bl: [-3, 0], fp: {kind: 'ji', ang: 178, len: 66}, lean: 0}))];
	const patrol = [Fig(pose(1500, 1036 - 50 * 3.0, 3.0, -1, 0.9)), Fig(pose(1700, 1050 - 50 * 3.2, 3.2, -1, -0.7, {fp: {kind: 'ji', ang: 168, len: 66}}))];
	return <g>
		<defs>
			<linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse" gradientTransform="scale(1,780)"><stop offset="0" stopColor="#17222A" /><stop offset="0.45" stopColor="#25343A" /><stop offset="0.8" stopColor="#3E4C4B" /><stop offset="1" stopColor="#5C5A4E" /></linearGradient>
			<radialGradient id={`${id}wall`} cx={960} cy={830} r={1000} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#AE8460" /><stop offset="0.28" stopColor="#7A5E46" /><stop offset="0.6" stopColor="#45403C" /><stop offset="1" stopColor="#283034" /></radialGradient>
			<radialGradient id={`${id}gate`} cx={960} cy={840} r={560} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#A88262" /><stop offset="0.5" stopColor="#7A6250" /><stop offset="1" stopColor="#4A443E" /></radialGradient>
			<linearGradient id={`${id}dr`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A281C" /><stop offset="1" stopColor="#5E4230" /></linearGradient>
			<linearGradient id={`${id}in`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFF2D2" /><stop offset="1" stopColor="#E7BE82" /></linearGradient>
			<radialGradient id={`${id}lan`}><stop offset="0" stopColor="#FFE8BE" stopOpacity="0.55" /><stop offset="0.35" stopColor="#F3D2A0" stopOpacity="0.2" /><stop offset="1" stopColor="#F3D2A0" stopOpacity="0" /></radialGradient>
			<linearGradient id="lanSh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8A5A30" stopOpacity="0.35" /><stop offset="0.45" stopColor="#FFF" stopOpacity="0.15" /><stop offset="1" stopColor="#6A4020" stopOpacity="0.45" /></linearGradient>
			<linearGradient id={`${id}qb`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2A2624" /><stop offset="0.7" stopColor="#3E342C" /><stop offset="1" stopColor="#6A5240" /></linearGradient>
			<linearGradient id={`${id}qcb`} x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#2A2624" /><stop offset="0.7" stopColor="#3E342C" /><stop offset="1" stopColor="#6A5240" /></linearGradient>
			<linearGradient id={`${id}gr`} x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse" gradientTransform={`translate(0,${G}) scale(1,${1080 - G})`}><stop offset="0" stopColor="#4A3C32" /><stop offset="0.4" stopColor="#2C2420" /><stop offset="1" stopColor="#15100D" /></linearGradient>
			<radialGradient id={`${id}pool`} cx={960} cy={830} r={520} gradientUnits="userSpaceOnUse" gradientTransform="translate(960,830) scale(1,0.42) translate(-960,-830)"><stop offset="0" stopColor="#F6D6A2" stopOpacity="0.7" /><stop offset="0.5" stopColor="#C89466" stopOpacity="0.28" /><stop offset="1" stopColor="#C89466" stopOpacity="0" /></radialGradient>
			<linearGradient id={`${id}haze`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5E6A64" stopOpacity="0" /><stop offset="0.6" stopColor="#5E6A64" stopOpacity="0.42" /><stop offset="1" stopColor="#5E6A64" stopOpacity="0" /></linearGradient>
			<linearGradient id={`${id}fog`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7A7266" stopOpacity="0" /><stop offset="0.65" stopColor="#7A7266" stopOpacity="0.3" /><stop offset="1" stopColor="#7A7266" stopOpacity="0.05" /></linearGradient>
			<linearGradient id={`${id}top`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#121416" stopOpacity="0.55" /><stop offset="1" stopColor="#121416" stopOpacity="0" /></linearGradient>
			<radialGradient id={`${id}vig`} cx={960} cy={600} r={1150} gradientUnits="userSpaceOnUse"><stop offset="0.55" stopColor="#0C0806" stopOpacity="0" /><stop offset="1" stopColor="#0C0806" stopOpacity="0.75" /></radialGradient>
			<BlurF id={`${id}b2`} s={2.2} /><BlurF id={`${id}b6`} s={6} /><BlurF id={`${id}b14`} s={14} /><BlurF id={`${id}b1`} s={1} />
			<RimF id={`${id}rimP`} dx={3.4} dy={1.6} col={RIMC} w={0.95} blur={0.8} /><RimF id={`${id}rimQ`} dx={2} dy={1.5} col={RIMC} w={0.9} blur={0.6} />
		</defs>
		<rect width={1920} height={1080} fill={`url(#${id}sky)`} />
		{stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#DCE6E2" opacity={s.o} />)}
		{/* far: 南宫's towers and halls above the wall, slate in haze */}
		<g filter={`url(#${id}b2)`} fill="#34424A">
			{far.map(([x, y, w], i) => { const tiers = 3, th = (wallTop - y) / tiers; return <g key={i}>{Array.from({length: tiers}, (_, k) => { const ww = w * (1 - 0.16 * k), yb = wallTop + 10 - k * th, yt = yb - th + 12;
				return <g key={k}><rect x={x - ww / 2} y={yt} width={ww} height={yb - yt} /><path d={roofHip(x - ww / 2 - 22, x + ww / 2 + 22, yt + 2, x - ww / 2 + 6, x + ww / 2 - 6, yt - 14, 4)} />
					{k === tiers - 1 && <path d={roofHip(x - ww / 2 - 18, x + ww / 2 + 18, yt + 2, x - ww / 6, x + ww / 6, yt - 30, 4)} />}
					<rect x={x - 7} y={yt + 8} width={14} height={9} fill="#D8BE90" opacity={0.3 + 0.1 * k} /></g>; })}</g>; })}
			<rect x={600} y={448} width={720} height={40} /><rect x={680} y={410} width={560} height={40} /><path d={roofHip(650, 1270, 412, 760, 1160, 384, 4)} />
		</g>
		<rect x={0} y={330} width={1920} height={200} fill={`url(#${id}haze)`} />
		{/* the city wall: rammed earth with tamping courses, a crenellated parapet */}
		<rect x={0} y={wallTop} width={1920} height={G - wallTop} fill={`url(#${id}wall)`} />
		{Array.from({length: Math.floor((G - wallTop) / 13)}, (_, i) => <path key={i} d={`M0,${wallTop + 8 + i * 13} L1920,${wallTop + 8 + i * 13}`} stroke="#140E0A" strokeOpacity={0.16} strokeWidth={1.2} />)}
		{Array.from({length: 13}, (_, i) => <path key={`v${i}`} d={`M${70 + i * 150 + (i % 2) * 40},${wallTop + 10} L${70 + i * 150 + (i % 2) * 40},${G}`} stroke="#140E0A" strokeOpacity={0.08} strokeWidth={2} />)}
		{[[0, 560], [1360, 1920]].map(([a, b], k) => <g key={k} fill="#2E2A28">
			<rect x={a} y={wallTop - 12} width={b - a} height={14} />
			{Array.from({length: Math.floor((b - a) / 44)}, (_, i) => <rect key={i} x={a + 8 + i * 44} y={wallTop - 34} width={28} height={24} />)}</g>)}
		{/* the gate block (墩台), a touch forward and lit */}
		<rect x={560} y={wallTop - 4} width={800} height={G - wallTop + 4} fill={`url(#${id}gate)`} />
		{Array.from({length: Math.floor((G - wallTop) / 13)}, (_, i) => <path key={i} d={`M560,${wallTop + 6 + i * 13} L1360,${wallTop + 6 + i * 13}`} stroke="#140E0A" strokeOpacity={0.15} strokeWidth={1.2} />)}
		<rect x={556} y={wallTop - 4} width={4} height={G - wallTop + 4} fill="#1E1714" /><rect x={1360} y={wallTop - 4} width={4} height={G - wallTop + 4} fill="#1E1714" />
		{/* the 门楼: platform, a five-bay hall with a railing, 腰檐, the upper storey, the hip roof (straight, ends barely raised) */}
		<rect x={590} y={wallTop - 22} width={740} height={20} fill="#2A1E16" /><rect x={590} y={wallTop - 4} width={740} height={3} fill="#D0A070" opacity={0.6} />
		<rect x={630} y={362} width={660} height={wallTop - 22 - 362} fill="#3A2C22" />
		{[0, 1, 2, 3, 4].map((i) => { const bx = 650 + i * 126; return <g key={i}>
			<rect x={bx + 20} y={378} width={86} height={44} fill="#C8A472" opacity={0.55} />
			{Array.from({length: 9}, (_, k) => <rect key={k} x={bx + 22 + k * 9.6} y={378} width={3} height={44} fill="#2A1D15" />)}</g>; })}
		{[640, 766, 892, 1018, 1144, 1270].map((x, i) => <g key={i}><rect x={x - 7} y={360} width={14} height={wallTop - 22 - 360} fill="#24180F" /><rect x={x - 7} y={360} width={2.5} height={wallTop - 22 - 360} fill="#C29464" opacity={0.45} /></g>)}
		<g stroke="#20160F" strokeWidth={3}><path d={`M600,${wallTop - 44} L1320,${wallTop - 44}`} />{Array.from({length: 37}, (_, i) => <path key={i} d={`M${604 + i * 20},${wallTop - 44} L${604 + i * 20},${wallTop - 22}`} strokeWidth={2.2} />)}</g>
		<path d={`M600,${wallTop - 42} L1320,${wallTop - 42}`} stroke="#C7976A" strokeOpacity={0.5} strokeWidth={1.2} />
		<Brackets x0={640} x1={1270} y={354} n={6} lit="#D6A672" />
		<rect x={600} y={334} width={720} height={12} fill="#5E4430" opacity={0.85} />
		{Array.from({length: 60}, (_, i) => <rect key={i} x={604 + i * 12} y={334} width={4} height={12} fill="#22170F" />)}
		<path d={roofHip(560, 1360, 334, 720, 1200, 290, 8)} fill="#1A1512" />
		<Tiles x0={572} x1={1348} ye={334} yr={290} r0={724} r1={1196} step={14} disc="#9A7656" />
		<rect x={720} y={232} width={480} height={60} fill="#33261D" />
		{[0, 1, 2].map((i) => <g key={i}><rect x={752 + i * 150} y={244} width={110} height={34} fill="#E9CC94" opacity={0.7} />{Array.from({length: 11}, (_, k) => <rect key={k} x={754 + i * 150 + k * 10} y={244} width={3} height={34} fill="#2A1D15" />)}</g>)}
		<Brackets x0={732} x1={1188} y={226} n={5} s={0.95} lit="#B88C60" />
		<path d={roofHip(660, 1260, 208, 820, 1100, 140, 9)} fill="#1A1512" />
		<Tiles x0={672} x1={1248} ye={208} yr={140} r0={822} r1={1098} step={14} disc="#7A6048" />
		<path d={ridge(820, 1100, 140, 11)} fill="#120E0C" />
		{/* the three timber-lined passages (一门三道), the centre door ajar: the scene's key light */}
		<Passage x={700} w={150} y0={622} y1={G} id={id} />
		<Passage x={960} w={176} y0={606} y1={G} open={0.38} id={id} />
		<Passage x={1220} w={150} y0={622} y1={G} id={id} />
		<Lantern x={846} y={548} id={`${id}lan`} /><Lantern x={1074} y={548} id={`${id}lan`} />
		<rect x={0} y={wallTop - 30} width={1920} height={200} fill={`url(#${id}top)`} />
		<ellipse cx={980} cy={680} rx={400} ry={250} fill={`url(#${id}lan)`} opacity={1} />
		<ellipse cx={1034} cy={700} rx={70} ry={150} fill={`url(#${id}lan)`} opacity={0.8} />
		{/* drifting haze between the wall and the 阙 (two soft bands) */}
		<g filter={`url(#${id}b14)`} opacity={0.24}><path d="M-40,690 C300,660 620,700 960,684 C1300,668 1600,700 1960,676 L1960,724 C1600,744 1300,712 960,730 C620,746 300,708 -40,736 Z" fill="#7C8078" />
			<path d="M-40,560 C400,546 760,572 1100,556 C1460,540 1700,560 1960,548 L1960,572 C1700,584 1460,566 1100,580 C760,596 400,570 -40,584 Z" fill="#6C7470" opacity={0.6} /></g>
		{/* the guards at the gate: tiny against it */}
		<g filter={`url(#${id}rimQ)`}>{guards.map((g, i) => <React.Fragment key={i}>{g.el}</React.Fragment>)}</g>
		{/* ground, the paved approach, the light pool from the door gap */}
		<rect x={0} y={G} width={1920} height={1080 - G} fill={`url(#${id}gr)`} />
		{Array.from({length: 9}, (_, i) => { const y = G + 8 + Math.pow(i / 8, 1.6) * 250; return <path key={i} d={`M${960 - 120 - (y - G) * 1.9},${y} L${960 + 120 + (y - G) * 1.9},${y}`} stroke="#0E0A08" strokeOpacity={0.35} strokeWidth={1.5} />; })}
		{[-3, -2, -1, 0, 1, 2, 3].map((k) => <path key={k} d={`M${960 + k * 40},${G} L${960 + k * 170},1080`} stroke="#0E0A08" strokeOpacity={0.25} strokeWidth={1.4} />)}
		<path d={`M${960 + 88 - 70},${G} L${960 + 88},${G} L${960 + 300},1080 L${960 - 120},1080 Z`} fill="#F3D3A0" opacity={0.22} filter={`url(#${id}b14)`} />
		<rect x={0} y={560} width={1920} height={520} fill={`url(#${id}pool)`} />
		<rect x={0} y={G - 80} width={1920} height={130} fill={`url(#${id}fog)`} />
		<rect x={0} y={600} width={1920} height={320} fill={`url(#${id}haze)`} opacity={0.8} />
		{/* the paired 门阙 on the near plane, flanking the approach */}
		<Que cx={250} g={GQ} side={-1} id={`${id}ql`} />
		<Que cx={1670} g={GQ} side={1} id={`${id}qr`} />
		<defs><linearGradient id={`${id}qlb`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#141212" /><stop offset="0.62" stopColor="#221C19" /><stop offset="1" stopColor="#4E3828" /></linearGradient>
			<linearGradient id={`${id}qrb`} x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#141212" /><stop offset="0.62" stopColor="#221C19" /><stop offset="1" stopColor="#4E3828" /></linearGradient></defs>
		{/* the patrol walking in to the gate */}
		<g filter={`url(#${id}rimP)`}>{patrol.map((g, i) => <React.Fragment key={i}>{g.el}</React.Fragment>)}</g>
		{/* foreground: a bare branch, out of focus */}
		<g filter={`url(#${id}b6)`} fill="#0D0907">
			<path d="M-40,1080 C-14,900 2,760 -6,600 L16,600 C30,760 24,920 14,1080 Z" />
			<path d="M6,690 C40,640 80,612 140,596 L142,606 C88,624 52,654 16,708 Z M8,630 C10,560 30,500 66,450 L72,458 C42,506 24,566 20,636 Z" />
		</g>
		<rect width={1920} height={1080} fill={`url(#${id}vig)`} />
	</g>; };

/* ======================= 曹操 twice (character panel space: 690×630) ======================= */
const Characters: React.FC = () => { const g = 584;
	const c20 = Fig({x: 196, y: g - 50 * 4.45, s: 4.45, dir: 1, lean: 1, tilt: -3, fa: [26, 96], ba: [-6, -2], fl: [5, 2], bl: [-6, -3], dress: 'robe', hat: 'wuguan', sleeve: 11, fp: {kind: 'rod', ang: 0, len: 80, col: '#8E3624'}});
	const c46 = Fig({x: 456, y: g - 50 * 4.6, s: 4.6, dir: 1, lean: -1, tilt: -2, fa: [30, 74], ba: [24, 82], fl: [9, 4], bl: [-9, -5], dress: 'armour', hat: 'wuguan', beard: 'short', belly: 1.5, lamel: true, detail: '#4A3424', fp: {kind: 'dao', ang: 3, len: 58}});
	return <g>
		<defs>
			<radialGradient id="chBg" cx={520} cy={150} r={760} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#7A6450" /><stop offset="0.45" stopColor="#4E4440" /><stop offset="1" stopColor="#26282A" /></radialGradient>
			<linearGradient id="chFl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A302A" /><stop offset="1" stopColor="#15100D" /></linearGradient>
			<RimF id="rimCao" dx={-2.6} dy={2} col={ACC} w={1} blur={0.55} />
			<RimF id="rimCao2" dx={-2} dy={1.5} col="#FFE8B0" w={0.8} blur={0.6} />
		</defs>
		<rect width={690} height={630} fill="url(#chBg)" />
		{Array.from({length: 40}, (_, i) => <path key={i} d={`M0,${12 + i * 14} L690,${12 + i * 14}`} stroke="#140E0A" strokeOpacity={0.1} strokeWidth={1} />)}
		<rect x={0} y={g} width={690} height={630 - g} fill="url(#chFl)" />
		<path d={`M0,${g} L690,${g}`} stroke="#C8946A" strokeOpacity={0.35} strokeWidth={2} />
		{[210, 480].map((x, i) => <ellipse key={i} cx={x + 6} cy={g + 4} rx={80} ry={8} fill="#0A0605" opacity={0.6} />)}
		<Lantern x={622} y={118} s={1.15} id="s1lan" />
		<g filter="url(#rimCao)">{c20.el}{c46.el}</g>
	</g>; };

/* ======================= props (tile space 256×220, key from the upper right) ======================= */
const FIVE = [['青', '#3C6A66'], ['赤', '#9C3A26'], ['黄', '#BE963E'], ['白', '#D6CCB4'], ['黑', '#221A15']] as const;
const Rack: React.FC = () => <g>
	<defs><linearGradient id="rodSh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#000" stopOpacity="0.45" /><stop offset="0.35" stopColor="#000" stopOpacity="0.1" /><stop offset="0.68" stopColor="#FFF4DC" stopOpacity="0.38" /><stop offset="1" stopColor="#000" stopOpacity="0.2" /></linearGradient></defs>
	{/* frame: two posts on feet, a top rail with pegs, a lower rail */}
	{[30, 220].map((x, i) => <g key={i}><rect x={x - 5} y={26} width={10} height={176} fill="#3A281C" /><rect x={x + 2} y={26} width={3} height={176} fill="#C89A6A" opacity={0.5} /><rect x={x - 16} y={198} width={32} height={8} fill="#2A1D15" /></g>)}
	{Array.from({length: 12}, (_, i) => { const x = 42 + i * 15.6, [, c] = FIVE[i % 5]; return <g key={i}>
		<rect x={x - 4} y={34} width={8} height={160} rx={3} fill={c} /><rect x={x - 4} y={34} width={8} height={160} rx={3} fill="url(#rodSh)" />
		<rect x={x - 5} y={28} width={10} height={8} rx={3} fill={c} /><rect x={x - 5} y={28} width={10} height={8} rx={3} fill="url(#rodSh)" />
		<rect x={x - 4.4} y={176} width={8.8} height={3} fill="#140E0A" opacity={0.5} /></g>; })}
	<rect x={20} y={46} width={216} height={9} fill="#3A281C" /><rect x={20} y={46} width={216} height={2.4} fill="#D6A676" opacity={0.6} />
	<rect x={20} y={150} width={216} height={9} fill="#3A281C" /><rect x={20} y={150} width={216} height={2.4} fill="#D6A676" opacity={0.5} />
</g>;
const Dao: React.FC = () => <g transform="translate(128,112) rotate(-24) translate(-128,-112)">
	<defs><linearGradient id="bladeG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E9EDEC" /><stop offset="0.3" stopColor="#9EA4A6" /><stop offset="0.7" stopColor="#5C6266" /><stop offset="1" stopColor="#3A3E42" /></linearGradient>
		<linearGradient id="scabG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5A2A1E" /><stop offset="0.4" stopColor="#2A1510" /><stop offset="1" stopColor="#140A08" /></linearGradient></defs>
	{/* scabbard below, lacquered with bronze fittings */}
	<path d="M66,142 L242,142 C247,142 250,146 247,150 L66,150 Z" fill="url(#scabG)" />
	{[80, 150, 236].map((x, i) => <rect key={i} x={x} y={140} width={i === 2 ? 8 : 6} height={12} fill="#A47A42" />)}
	{/* the sword: ring pommel, wrapped grip, a small guard, a straight single-edged blade with an angled tip */}
	<circle cx={20} cy={104} r={11} fill="none" stroke="#3A3430" strokeWidth={5.5} /><circle cx={20} cy={104} r={11} fill="none" stroke="#C9C4B8" strokeWidth={1.2} strokeOpacity={0.7} strokeDasharray="14 20" />
	<rect x={30} y={99} width={40} height={10} rx={2} fill="#2A1A12" />
	{Array.from({length: 7}, (_, i) => <path key={i} d={`M${32 + i * 5.6},99 L${36 + i * 5.6},109`} stroke="#6A4A32" strokeWidth={1.4} />)}
	<rect x={70} y={96} width={6} height={16} rx={1} fill="#8A6A3A" />
	<path d="M76,98 L232,99 L246,105 L232,108 L76,111 Z" fill="url(#bladeG)" />
	<path d="M78,100.5 L232,101" stroke="#FFFFFF" strokeOpacity={0.8} strokeWidth={1} />
</g>;
const Banner: React.FC = () => <g>
	<defs><linearGradient id="banG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3A1812" /><stop offset="0.55" stopColor="#5A231A" /><stop offset="1" stopColor="#7E3626" /></linearGradient></defs>
	<rect x={64} y={10} width={7} height={204} fill="#2E2018" /><rect x={69} y={10} width={2} height={204} fill="#D0A070" opacity={0.5} />
	<path d="M60,12 L67.5,-6 L75,12 Z" fill="#8E8A80" />
	<rect x={64} y={24} width={140} height={6} fill="#2E2018" />
	<path d="M72,30 L200,30 L200,180 C186,186 176,176 162,182 C146,188 134,178 118,184 C102,190 88,180 72,186 Z" fill="url(#banG)" />
	<path d="M72,30 L200,30 L200,180 C186,186 176,176 162,182 C146,188 134,178 118,184 C102,190 88,180 72,186 Z" fill="none" stroke="#1E0E0A" strokeWidth={6} strokeOpacity={0.5} />
	{[0, 1, 2].map((i) => <path key={i} d={`M200,${44 + i * 40} C214,${52 + i * 40} 210,${66 + i * 40} 226,${74 + i * 40}`} stroke="#6A2A1E" strokeWidth={5} fill="none" strokeLinecap="round" />)}
	<text x={136} y={140} textAnchor="middle" fontFamily={SERIF} fontWeight={900} fontSize={92} fill="#EBD8B4">曹</text>
</g>;
const Granary: React.FC = () => <g>
	<defs><linearGradient id="cylG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3A2E26" /><stop offset="0.55" stopColor="#6A5240" /><stop offset="0.85" stopColor="#A4825E" /><stop offset="1" stopColor="#6A5240" /></linearGradient>
		<linearGradient id="thG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2A2018" /><stop offset="0.6" stopColor="#5A4630" /><stop offset="1" stopColor="#8E7048" /></linearGradient></defs>
	{/* stone base on three short feet */}
	{[78, 128, 178].map((x, i) => <rect key={i} x={x - 9} y={190} width={18} height={18} fill="#2E2620" />)}
	<rect x={62} y={182} width={132} height={10} fill="#4A3E34" /><rect x={62} y={182} width={132} height={2} fill="#C8A47A" opacity={0.5} />
	<path d="M70,100 L186,100 L186,182 L70,182 Z" fill="url(#cylG)" />
	{[118, 136, 154, 170].map((y, i) => <path key={i} d={`M70,${y} Q128,${y + 6} 186,${y}`} stroke="#1E1510" strokeOpacity={0.45} strokeWidth={2} fill="none" />)}
	{/* the high hatch and a ladder */}
	<rect x={116} y={108} width={26} height={22} fill="#120C09" /><rect x={116} y={108} width={26} height={22} fill="none" stroke="#B88E62" strokeOpacity={0.6} strokeWidth={1.4} />
	<path d="M108,198 L122,128 M126,200 L138,130" stroke="#3A2A1E" strokeWidth={3.4} />
	{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${110 + i * 2.6},${188 - i * 14} L${128 + i * 2.4},${189 - i * 14}`} stroke="#3A2A1E" strokeWidth={2.4} />)}
	{/* conical thatched roof, the apex knot */}
	<path d="M50,104 C80,92 176,92 206,104 L134,30 L122,30 Z" fill="url(#thG)" />
	{Array.from({length: 15}, (_, i) => { const u = i / 14, x = 54 + u * 148; return <path key={i} d={`M128,34 L${f1(x)},${f1(100 - Math.sin(u * Math.PI) * 6)}`} stroke="#1A120C" strokeOpacity={0.4} strokeWidth={1.2} />; })}
	<path d="M50,104 C80,92 176,92 206,104" stroke="#D2AE7E" strokeOpacity={0.55} strokeWidth={2} fill="none" />
	<path d="M120,30 L136,30 L132,18 L124,18 Z" fill="#2A1E16" /><circle cx={128} cy={16} r={5} fill="#3A2A1E" />
</g>;
const Trebuchet: React.FC = () => { const P: [number, number] = [132, 74], arm = -32, a = arm * Math.PI / 180, L1 = 104, L2 = 40;
	const long: [number, number] = [P[0] - L1 * Math.cos(a), P[1] + L1 * Math.sin(a)], short: [number, number] = [P[0] + L2 * Math.cos(a), P[1] - L2 * Math.sin(a)];
	const crew = [[176, -1, 0], [202, -1, 1], [228, -1, 2]].map(([x, d, i]) => Fig({x, y: 206 - 50 * 0.62, s: 0.62, dir: d as 1 | -1, lean: -16 + 3 * i, fa: [128, 150], ba: [118, 146], fl: [22, 6], bl: [-10, -6], dress: 'tunic', hat: 'ze', detail: 'none'}));
	return <g>
		{/* base sills, the A-frame trestle, the axle */}
		<rect x={36} y={198} width={190} height={10} fill="#3A281C" /><rect x={36} y={198} width={190} height={2.4} fill="#D4A270" opacity={0.55} />
		{[[70, 200], [196, 200]].map(([x, y], i) => <g key={i}><path d={cap([x, y], P, 5.5, 4.5)} fill="#3E2C1E" /><path d={cap([x + (i ? -3 : 3), y], [P[0] + (i ? 2 : -2), P[1]], 1.2, 1)} fill="#C89868" opacity={0.6} /></g>)}
		<path d={`M90,150 L176,150`} stroke="#3E2C1E" strokeWidth={6} /><path d={`M90,148 L176,148`} stroke="#C89868" strokeOpacity={0.5} strokeWidth={1.4} />
		{/* the throwing arm (long end up-left with the sling), the short end with the pulling ropes */}
		<path d={cap(short, long, 4.5, 2.6)} fill="#4A3424" /><path d={cap(short, long, 1.2, 0.8)} fill="#D8A672" opacity={0.55} transform="translate(1,-2)" />
		<circle cx={P[0]} cy={P[1]} r={6} fill="#2A1D15" stroke="#C89868" strokeOpacity={0.6} strokeWidth={1.2} />
		<path d={`M${long[0]},${long[1]} C${long[0] - 6},${long[1] + 30} ${long[0] + 4},${long[1] + 56} ${long[0] + 14},${long[1] + 70}`} stroke="#2A1D15" strokeWidth={1.4} fill="none" />
		<ellipse cx={long[0] + 15} cy={long[1] + 74} rx={7} ry={6} fill="#5A5048" stroke="#2A1D15" strokeWidth={1.4} />
		{crew.map((c, i) => [-2, 0, 2].map((k) => <path key={`${i}${k}`} d={`M${short[0] + k + i * 1.5},${short[1]} L${c.hand[0] + k * 0.6},${c.hand[1]}`} stroke="#6A4E38" strokeWidth={1.1} />))}
		{/* the pulling crew (人力 traction): silhouettes leaning back on the ropes */}
		<g filter="url(#s1rimQ)">{crew.map((c, i) => <React.Fragment key={i}>{c.el}</React.Fragment>)}</g>
	</g>; };

/* ======================= the board ======================= */
const SW: [string, string, string][] = [['#140D0A', '剪影 暖黑', 'people'], ['#1E2C33', '夜空 石青', 'sky'], ['#4A5752', '地平 雾', 'haze'], ['#6E5844', '夯土 受光', 'earth'],
	['#2E1F17', '木构', 'timber'], ['#F3DDB4', '灯 暖象牙', 'practical'], ['#E7A46C', '铜边 他人', 'rim'], [ACC, '曹操 金边', 'ACCENT']];
const capS: React.CSSProperties = {position: 'absolute', fontFamily: SANS, fontSize: 23, fontWeight: 500, color: CREAM, opacity: 0.92, whiteSpace: 'nowrap', letterSpacing: '0.02em'};
const PROPS: [React.FC, string][] = [[Rack, '五色棒架 · 青赤黄白黑'], [Dao, '环首刀 · 漆鞘'], [Banner, '旗 · 一字「曹」'], [Granary, '囷 · 圆仓（汉陶囷）'], [Trebuchet, '霹雳车 · 人力抛石']];
const PX0 = 40, PY = 768, PW = 252, PH = 214, PG = 18;
export const Look1: React.FC = () => <>
	<svg width={W} height={H} style={{position: 'absolute'}}>
		<rect width={W} height={H} fill={BOARD} />
		<svg x={40} y={64} width={1120} height={630} viewBox="0 0 1920 1080"><SetLuoyang id="s1" /></svg>
		<rect x={40} y={64} width={1120} height={630} fill="none" stroke="#3A2C22" strokeWidth={1.5} />
		<svg x={1190} y={64} width={690} height={630} viewBox="0 0 690 630"><Characters /></svg>
		<rect x={1190} y={64} width={690} height={630} fill="none" stroke="#3A2C22" strokeWidth={1.5} />
		<defs><radialGradient id="tileBg" cx="0.78" cy="0.15" r="1"><stop offset="0" stopColor="#4E4036" /><stop offset="0.55" stopColor="#2A221D" /><stop offset="1" stopColor="#17110E" /></radialGradient></defs>
		{PROPS.map(([C], i) => <g key={i} transform={`translate(${PX0 + i * (PW + PG)},${PY})`}>
			<rect width={PW} height={PH} fill="url(#tileBg)" stroke="#3A2C22" strokeWidth={1.5} />
			<svg width={PW} height={PH} viewBox="-2 -12 260 232"><C /></svg></g>)}
		{SW.map(([c], i) => { const x = 1430 + (i % 4) * 114, y = PY + Math.floor(i / 4) * 112; return <g key={i}>
			<rect x={x} y={y} width={100} height={58} fill={c} stroke={c === ACC ? '#FFF1C8' : '#3A2C22'} strokeWidth={c === ACC ? 3 : 1.5} /></g>; })}
	</svg>
	<div style={{...capS, left: 40, top: 704}}>洛阳城门 · 夜｜门楼 + 双阙 + 一门三道（木构门道）· 夯土城墙 · 一盏主光：门缝灯</div>
	<div style={{...capS, left: 1190, top: 704}}>曹操 20岁 · 武冠 · 袍 · 五色棒</div>
	<div style={{...capS, left: 1556, top: 704}}>46岁 · 札甲 · 短须 · 环首刀</div>
	{PROPS.map(([, s], i) => <div key={i} style={{...capS, fontSize: 22, left: PX0 + i * (PW + PG), top: PY + PH + 10}}>{s}</div>)}
	{SW.map(([c, n, e], i) => { const x = 1430 + (i % 4) * 114, y = PY + Math.floor(i / 4) * 112; return <div key={i} style={{position: 'absolute', left: x, top: y + 60, fontFamily: SANS, fontSize: 15, lineHeight: 1.25, color: c === ACC ? ACC : CREAM, opacity: 0.9, whiteSpace: 'nowrap', fontWeight: c === ACC ? 700 : 400}}>
		{c}<br />{n}{e === 'ACCENT' ? ' ★' : ''}</div>; })}
	<div style={{...capS, left: 1430, top: PY + PH + 10, fontSize: 22}}>调色 · ★ = 唯一强调色（曹操）</div>
</>;
export const Look2: React.FC = () => <svg width={W} height={H} style={{position: 'absolute'}}><rect width={W} height={H} fill="#1A1412" /></svg>;
export const Look3: React.FC = () => <svg width={W} height={H} style={{position: 'absolute'}}><rect width={W} height={H} fill="#1A1412" /></svg>;
