import React from 'react';
/* ep59 sets (flat vector, one family): layered planes, a dark palette, warm practical lights, haze between planes.
   Sets are authored in world px for a 1920 × 1080 frame at zoom 1; scenes move a camera over them (Cam / Par).
   Gold (#FFC24A) is reserved for his route and the light of home. */
export const W = 1920, H = 1080;
export type Pt = [number, number];
export const rnd = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
export const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const sm = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
export const eio = (u: number) => { const x = cl(u); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const eo = (u: number) => 1 - Math.pow(1 - cl(u), 3);
export const ei = (u: number) => Math.pow(cl(u), 3);
/** damped overshoot 0 → 1 (a stamp landing) */
export const land = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 - Math.exp(-6 * u) * Math.cos(9 * u));
export const f1 = (v: number) => v.toFixed(1);

export const Glow: React.FC<{x: number; y: number; r: number; c?: string; o?: number; id: string}> = ({x, y, r, c = '#ffb44a', o = 0.3, id}) =>
	<><defs><radialGradient id={id}><stop offset="0" stopColor={c} stopOpacity="1" /><stop offset="0.45" stopColor={c} stopOpacity="0.45" /><stop offset="1" stopColor={c} stopOpacity="0" /></radialGradient></defs><circle cx={x} cy={y} r={r} fill={`url(#${id})`} opacity={o} /></>;
export const Sky: React.FC<{id: string; stops: [number, string][]; x?: number; y?: number; w?: number; h?: number}> = ({id, stops, x = -400, y = -1600, w = 2720, h = 3000}) =>
	<><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">{stops.map(([o, c], i) => <stop key={i} offset={o} stopColor={c} />)}</linearGradient></defs><rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} /></>;
/** camera: look at (cx, cy) with zoom z (and an optional roll) */
export const Cam: React.FC<{cx: number; cy: number; z: number; r?: number; children: React.ReactNode}> = ({cx, cy, z, r = 0, children}) =>
	<g transform={`translate(${W / 2} ${H / 2}) rotate(${r}) scale(${z}) translate(${-cx} ${-cy})`}>{children}</g>;
export type CamT = {cx: number; cy: number; z: number; r?: number};
/** a parallax plane: k = 1 moves with the camera, k → 0 stays put (relative to the base framing at (960, 540), zoom 1) */
export const Par: React.FC<{cam: CamT; k: number; children: React.ReactNode}> = ({cam, k, children}) =>
	<Cam cx={960 + (cam.cx - 960) * k} cy={540 + (cam.cy - 540) * k} z={Math.pow(cam.z, k)} r={(cam.r ?? 0) * k}>{children}</Cam>;
/** a soft horizontal haze band */
export const Haze: React.FC<{id: string; y: number; h: number; c: string; o: number; x?: number; w?: number}> = ({id, y, h, c, o, x = -2000, w = 6000}) =>
	<><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} stopOpacity="0" /><stop offset="0.5" stopColor={c} stopOpacity={o} /><stop offset="1" stopColor={c} stopOpacity="0" /></linearGradient></defs><rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} /></>;

/* ====================================== HULL: a Victorian terrace ======================================
   World at zoom 1 (S1 framing): pavement top y 930, garden/path y 915, low front wall 868–930, façades from x 520 (the gable end)
   to the right in 660 px houses; each house: door on the left (132 × 318), a canted bay on the right, two sashes upstairs,
   eaves y 95, slate roof to the ridge y −230, chimney stacks on the party walls. The mother's house is x 1100–1760. */
export const HOUSES = [520, 1100, 1760, 2420];
export const MUM = {x0: 1100, door: [1130, 1262] as [number, number], doorTop: 582, step: 900, path: 915, pave: 930, banner: [450, 540] as [number, number]};
export type StreetMode = 'dusk' | 'night';
const PAL_S = {
	dusk: {brick: '#3b2a27', brick2: '#33241f', mortar: '#4a3631', trim: '#5c4a40', slate: '#262a33', slateHi: '#3d4350', sill: '#6b5a4c', glass: '#28303c', wall: '#3a2c28', pave: '#2c2a2e', road: '#1d1c20'},
	night: {brick: '#2a2026', brick2: '#241b20', mortar: '#33272c', trim: '#3c3236', slate: '#181b24', slateHi: '#272c38', sill: '#4a3e3a', glass: '#141a24', wall: '#281f22', pave: '#1c1b20', road: '#121216'},
};
/** window lighting per house index: [ground bay, up-left, up-right] (0 = dark, 1 = warm, 2 = TV blue) */
const LIT: Record<StreetMode, number[][]> = {dusk: [[1, 0, 1], [1, 0, 0], [2, 1, 0], [1, 0, 1]], night: [[0, 0, 0], [0, 0, 1], [0, 0, 0], [0, 0, 0]]};
const WARM = '#ffcf8a', TV = '#9fc4e8';
/** one house front (no door leaf: the door is drawn by Door) */
const HouseFront: React.FC<{x0: number; i: number; mode: StreetMode; t: number; skipDoor?: boolean}> = ({x0, i, mode, t, skipDoor}) => {
	const P = PAL_S[mode], lit = LIT[mode][i % 4], L = (k: number) => (k === 1 ? WARM : k === 2 ? TV : P.glass), id = `hf${i}${mode}`;
	const flick = 0.85 + 0.15 * Math.sin(t * 7.3 + i) * Math.sin(t * 3.1);
	const win = (x: number, y: number, w: number, h: number, k: number, key: string) => <g key={key}>
		<rect x={x - 10} y={y - 14} width={w + 20} height={14} fill={P.trim} /><rect x={x - 12} y={y + h} width={w + 24} height={16} fill={P.sill} />
		<rect x={x} y={y} width={w} height={h} fill={L(k)} opacity={k ? (k === 2 ? 0.55 * flick : 0.78) : 1} />
		{k > 0 && <rect x={x} y={y} width={w} height={h} fill={`url(#${id}wg)`} opacity={0.6} />}
		<path d={`M${x},${y + h / 2} H${x + w} M${x + w / 2},${y} V${y + h}`} stroke={P.trim} strokeWidth={8} />
		{k === 1 && <path d={`M${x + 8},${y + 6} Q${x + w * 0.3},${y + h * 0.5} ${x + 10},${y + h - 4} L${x + 8},${y + h} Z M${x + w - 8},${y + 6} Q${x + w * 0.7},${y + h * 0.5} ${x + w - 10},${y + h - 4} L${x + w - 8},${y + h} Z`} fill="#6a3c2a" opacity={0.75} />}
		<rect x={x} y={y} width={w} height={h} fill="none" stroke={P.trim} strokeWidth={7} /></g>;
	return <g>
		<defs><linearGradient id={`${id}wg`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff2d0" stopOpacity="0.5" /><stop offset="1" stopColor="#c87838" stopOpacity="0.3" /></linearGradient>
			<pattern id={`${id}br`} width={44} height={22} patternUnits="userSpaceOnUse"><rect width={44} height={22} fill={P.brick} /><path d="M0,0.5 H44 M0,11.5 H44 M11,0 V11 M33,11 V22" stroke={P.mortar} strokeWidth={1.4} opacity={0.55} /></pattern></defs>
		<rect x={x0} y={95} width={660} height={820} fill={`url(#${id}br)`} />
		<rect x={x0} y={95} width={660} height={820} fill="#000" opacity={i % 2 ? 0.08 : 0} />
		{/* string courses, eaves, gutter, downpipe */}
		<rect x={x0} y={548} width={660} height={14} fill={P.trim} opacity={0.8} /><rect x={x0 - 6} y={80} width={672} height={22} fill={P.trim} /><rect x={x0 - 6} y={76} width={672} height={8} fill="#141418" />
		<rect x={x0 + 648} y={84} width={9} height={830} fill="#18171b" />
		{/* upstairs sashes */}
		{win(x0 + 70, 210, 150, 230, lit[1], 'u1')}{win(x0 + 380, 210, 210, 230, lit[2], 'u2')}
		{/* ground floor: a canted bay with its own little lead roof */}
		<path d={`M${x0 + 220},${915} L${x0 + 220},${600} L${x0 + 616},${600} L${x0 + 616},${915} Z`} fill={P.brick2} />
		<path d={`M${x0 + 212},${600} L${x0 + 250},${566} L${x0 + 586},${566} L${x0 + 624},${600} Z`} fill={P.slate} /><path d={`M${x0 + 250},${566} L${x0 + 586},${566}`} stroke={P.slateHi} strokeWidth={4} />
		<rect x={x0 + 236} y={790} width={364} height={125} fill={P.trim} opacity={0.7} />
		{[[x0 + 244, 54], [x0 + 312, 212], [x0 + 538, 54]].map(([wx, ww], j) => <g key={j}>
			<rect x={wx} y={622} width={ww} height={160} fill={L(lit[0])} opacity={lit[0] ? (lit[0] === 2 ? 0.55 * flick : 0.82) : 1} />
			{lit[0] > 0 && <rect x={wx} y={622} width={ww} height={160} fill={`url(#${id}wg)`} opacity={0.6} />}
			<path d={`M${wx},${702} H${wx + ww}`} stroke={P.trim} strokeWidth={7} /><rect x={wx} y={622} width={ww} height={160} fill="none" stroke={P.trim} strokeWidth={7} /></g>)}
		{lit[0] === 1 && <path d={`M${x0 + 318},${782} L${x0 + 330},${700} Q${x0 + 380},${676} ${x0 + 420},${702} L${x0 + 432},${782} Z`} fill="#3a2418" opacity={0.7} />}
		{/* the door surround: a stone frame and a fanlight */}
		{!skipDoor && <g><rect x={x0 + 18} y={548} width={160} height={367} fill={P.trim} /><rect x={x0 + 30} y={560} width={132} height={22} fill={WARM} opacity={lit[0] === 1 || i === 1 ? 0.75 : 0.18} />
			<rect x={x0 + 30} y={582} width={132} height={318} fill="#1a1a1e" /><rect x={x0 + 40} y={600} width={50} height={120} fill="#222226" /><rect x={x0 + 102} y={600} width={50} height={120} fill="#222226" />
			<rect x={x0 + 40} y={740} width={50} height={140} fill="#222226" /><rect x={x0 + 102} y={740} width={50} height={140} fill="#222226" /><circle cx={x0 + 146} cy={740} r={5} fill="#a08050" />
			<rect x={x0 + 22} y={900} width={150} height={15} fill={P.sill} /></g>}
	</g>;
};
/** the roofs, chimneys (and their smoke) above the row; drawn in the same plane as the façades */
const Roofs: React.FC<{mode: StreetMode; t: number; x1?: number}> = ({mode, t, x1 = 3100}) => {
	const P = PAL_S[mode];
	return <g>
		<path d={`M520,95 L520,-150 L640,-232 L${x1},-232 L${x1},95 Z`} fill={P.slate} />
		{Array.from({length: 22}, (_, i) => <path key={i} d={`M520,${80 - i * 14.5} H${x1}`} stroke={P.slateHi} strokeWidth={1.2} opacity={0.35} />)}
		<path d={`M640,-232 H${x1}`} stroke={P.slateHi} strokeWidth={6} />
		{/* the gable end */}
		<path d="M480,95 L480,-150 L520,-170 L520,95 Z" fill={P.brick2} />
		{[520, 1100, 1760, 2420].map((x, i) => <g key={i}>
			<rect x={x - 60} y={-370} width={120} height={150} fill={P.brick2} /><rect x={x - 68} y={-382} width={136} height={16} fill={P.trim} />
			{[-36, 0, 36].map((dx, j) => <path key={j} d={`M${x + dx - 11},-382 L${x + dx - 9},-424 L${x + dx + 9},-424 L${x + dx + 11},-382 Z`} fill="#2a1f1c" />)}
			{/* a TV aerial on every other stack */}
			{i % 2 === 0 && <g stroke="#101014" strokeWidth={3}><path d={`M${x + 50},-382 V-500`} /><path d={`M${x + 20},-470 H${x + 90} M${x + 26},-450 H${x + 84} M${x + 32},-430 H${x + 78}`} /></g>}
		</g>)}
		{/* smoke from the mother's stack: soft puffs drifting left on their own clock */}
		{Array.from({length: 7}, (_, j) => { const u = ((t * 0.22 + j / 7) % 1), x = 1100 - 4 - u * 260 + Math.sin(u * 7 + j) * 14, y = -430 - u * 360, r = 18 + u * 60;
			return <circle key={j} cx={x} cy={y} r={r} fill={mode === 'dusk' ? '#8e8496' : '#4a4c5a'} opacity={0.22 * (1 - u) * Math.min(1, u * 6)} />; })}
	</g>;
};
/** the mother's front door: the leaf opens inward (narrows toward its hinge on the right), the hallway light pours out */
export const Door: React.FC<{open: number; mode?: StreetMode; inside?: React.ReactNode}> = ({open, mode = 'dusk', inside}) => {
	const [a, b] = MUM.door, top = MUM.doorTop, bot = MUM.step, P = PAL_S[mode], w = b - a, lw = w * (1 - 0.82 * open);
	return <g>
		<rect x={a - 12} y={548} width={w + 24} height={367} fill={P.trim} />
		<rect x={a} y={560} width={w} height={22} fill={WARM} opacity={mode === 'night' ? 0.25 : 0.85} />
		{/* the hallway: warm wall, a stair rail, a coat hook, the light falling toward the door */}
		<defs><linearGradient id="hall59" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd9a0" /><stop offset="1" stopColor="#e09a58" /></linearGradient>
			<clipPath id={`dcl${mode}`}><rect x={a - 2} y={top - 2} width={Math.max(0, w - lw) + 2} height={bot - top + 4} /></clipPath></defs>
		{open > 0.001 && <g>
			<rect x={a} y={top} width={w} height={bot - top} fill="url(#hall59)" />
			<path d={`M${a + w * 0.62},${top} L${a + w},${top + 60} L${a + w},${bot} L${a + w * 0.62},${bot} Z`} fill="#c8844a" opacity={0.55} />
			<path d={`M${a + 18},${bot - 40} L${a + w - 6},${top + 70}`} stroke="#8a5530" strokeWidth={6} opacity={0.7} /><rect x={a + 10} y={top + 40} width={14} height={60} rx={6} fill="#7a4a2a" opacity={0.7} /></g>}
		{/* the leaf, hinged on the right */}
		<rect x={b - lw} y={top} width={lw} height={bot - top} fill={open > 0.02 ? '#121216' : '#1a1a1e'} />
		{open < 0.6 && <g opacity={1 - open / 0.6}><rect x={b - lw + lw * 0.08} y={top + 18} width={lw * 0.36} height={120} fill="#222226" /><rect x={b - lw + lw * 0.55} y={top + 18} width={lw * 0.36} height={120} fill="#222226" />
			<rect x={b - lw + lw * 0.08} y={top + 158} width={lw * 0.36} height={140} fill="#222226" /><rect x={b - lw + lw * 0.55} y={top + 158} width={lw * 0.36} height={140} fill="#222226" />
			<circle cx={b - lw + lw * 0.12} cy={top + 158} r={5} fill="#a08050" /></g>}
		{inside && open > 0.001 && <g clipPath={`url(#dcl${mode})`}>{inside}</g>}
		<rect x={a - 4} y={bot} width={w + 8} height={MUM.path - bot} fill={P.sill} />
	</g>;
};
/** the light that spills out of the open door onto the step, the path and the wall */
export const DoorSpill: React.FC<{open: number}> = ({open}) => { const [a, b] = MUM.door; if (open < 0.01) return null;
	return <g opacity={open}>
		<defs><linearGradient id="spill59" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd08a" stopOpacity="0.55" /><stop offset="1" stopColor="#ffb060" stopOpacity="0" /></linearGradient>
			<radialGradient id="spillg59"><stop offset="0" stopColor="#ffc880" stopOpacity="0.5" /><stop offset="1" stopColor="#ffb060" stopOpacity="0" /></radialGradient></defs>
		<path d={`M${a},${MUM.step} L${b},${MUM.step} L${b + 120},${MUM.pave + 40} L${a - 160},${MUM.pave + 40} Z`} fill="url(#spill59)" />
		<ellipse cx={(a + b) / 2} cy={MUM.doorTop + 160} rx={330} ry={300} fill="url(#spillg59)" opacity={0.65} />
	</g>; };
/** the banner across the mother's house: a cream sheet, hand-painted letters, tied at both ends */
export const Banner: React.FC<{t: number; o?: number}> = ({t, o = 1}) => {
	const x0 = 1140, x1 = 1730, y0 = MUM.banner[0], y1 = MUM.banner[1], sw = (u: number) => Math.sin(t * 2.2 + u * 5) * 4 * Math.sin(Math.PI * u);
	const top = Array.from({length: 13}, (_, i) => { const u = i / 12; return `${f1(lerp(x0, x1, u))},${f1(y0 + sw(u) + 6 * Math.sin(Math.PI * u))}`; });
	const bot = Array.from({length: 13}, (_, i) => { const u = 1 - i / 12; return `${f1(lerp(x0, x1, u))},${f1(y1 + sw(u) * 1.4 + 10 * Math.sin(Math.PI * u))}`; });
	return <g opacity={o}>
		<path d={`M${top.join(' L')} L${bot.join(' L')} Z`} fill="#e9e0cc" /><path d={`M${top.join(' L')} L${bot.join(' L')} Z`} fill="#000" opacity={0.18} />
		<path d={`M${x0},${y0} L${x0 - 16},${y0 - 20} M${x1},${y0} L${x1 + 16},${y0 - 20}`} stroke="#d8ccb4" strokeWidth={3} />
		<text x={(x0 + x1) / 2} y={(y0 + y1) / 2 + 22 + 6} textAnchor="middle" style={{fontFamily: "'DejaVu Sans', sans-serif", fontWeight: 700, fontSize: 52, letterSpacing: '0.04em'}} fill="#2c2430" transform={`rotate(-0.6 ${(x0 + x1) / 2} ${(y0 + y1) / 2})`}>WELCOME HOME SON</text>
	</g>;
};
/** bunting from the upstairs window to the lamppost: muted triangles */
const Bunting: React.FC<{t: number; a: Pt; b: Pt; sag: number; n: number; seed?: number}> = ({t, a, b, sag, n, seed = 0}) => {
	const at = (u: number): Pt => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + sag * 4 * u * (1 - u) + Math.sin(t * 1.8 + u * 4) * 3];
	const cols = ['#cfc3a8', '#8a6a4a', '#d9a948', '#5a6a78'];
	const line = Array.from({length: 21}, (_, i) => at(i / 20)).map((p) => `${f1(p[0])},${f1(p[1])}`).join(' L');
	return <g><path d={`M${line}`} stroke="#141418" strokeWidth={2} fill="none" />
		{Array.from({length: n}, (_, i) => { const u = (i + 0.5) / n, p = at(u), sw = Math.sin(t * 2.6 + i * 1.3 + seed) * 6;
			return <path key={i} d={`M${f1(p[0] - 13)},${f1(p[1])} L${f1(p[0] + 13)},${f1(p[1])} L${f1(p[0] + sw)},${f1(p[1] + 34)} Z`} fill={cols[(i + seed) % 4]} opacity={0.85} />; })}</g>;
};
/** a street lamp with a warm head and a pool of light */
export const Lamp: React.FC<{x: number; ground: number; h?: number; id: string; o?: number}> = ({x, ground, h = 600, id, o = 1}) => <g>
	<Glow x={x + 40} y={ground - h + 14} r={300} c="#ffcf8a" o={0.32 * o} id={`${id}a`} />
	<ellipse cx={x + 30} cy={ground + 8} rx={260} ry={26} fill="#ffcf8a" opacity={0.12 * o} />
	<rect x={x - 7} y={ground - h} width={14} height={h} fill="#111114" /><rect x={x - 14} y={ground - 60} width={28} height={60} fill="#111114" />
	<path d={`M${x},${ground - h + 10} Q${x + 10},${ground - h - 20} ${x + 40},${ground - h - 10}`} stroke="#111114" strokeWidth={8} fill="none" />
	<path d={`M${x + 18},${ground - h - 6} L${x + 62},${ground - h - 6} L${x + 54},${ground - h + 24} L${x + 26},${ground - h + 24} Z`} fill="#111114" />
	<rect x={x + 26} y={ground - h + 12} width={28} height={12} fill="#ffe2b0" opacity={o} />
</g>;
/** a parked hatchback, side view */
export const ParkedCar: React.FC<{x: number; ground: number; s?: number; col?: string}> = ({x, ground, s = 1, col = '#1e2026'}) => <g transform={`translate(${x},${ground}) scale(${s})`}>
	<path d="M-230,-30 L-226,-78 Q-220,-96 -190,-100 L-120,-104 L-70,-150 Q-60,-158 -40,-158 L110,-158 Q140,-156 160,-128 L190,-98 Q228,-92 232,-66 L234,-30 Z" fill={col} />
	<path d="M-60,-142 L-10,-142 L-10,-106 L-104,-106 Z M4,-142 L104,-142 Q124,-140 144,-112 L144,-106 L4,-106 Z" fill="#3a4250" opacity={0.6} />
	<circle cx={-140} cy={-30} r={40} fill="#0c0c0f" /><circle cx={140} cy={-30} r={40} fill="#0c0c0f" /><circle cx={-140} cy={-30} r={16} fill="#2a2a30" /><circle cx={140} cy={-30} r={16} fill="#2a2a30" />
	<path d="M-226,-78 Q0,-92 232,-66" stroke="#8a90a0" strokeWidth={2} opacity={0.35} fill="none" />
</g>;
/** the far town behind the side street: lower roofs, a spire, lit windows, haze (a plane of its own) */
const FarTown: React.FC<{mode: StreetMode}> = ({mode}) => {
	const c1 = mode === 'dusk' ? '#2a2836' : '#14151e', c2 = mode === 'dusk' ? '#3a3646' : '#1a1b26';
	return <g>
		<path d={`M-400,760 ${Array.from({length: 18}, (_, i) => { const x = -400 + i * 60, hh = 120 + 60 * rnd(i, 3); return `L${x},${760 - hh} L${x + 60},${760 - hh}`; }).join(' ')} L680,760 Z`} fill={c2} />
		<path d="M140,640 L160,470 L180,640 Z" fill={c2} /><rect x={140} y={630} width={40} height={130} fill={c2} />
		<path d={`M-400,930 ${Array.from({length: 12}, (_, i) => { const x = -400 + i * 80, hh = 210 + 50 * rnd(i, 7); return `L${x},${930 - hh} L${x + 40},${930 - hh - 40} L${x + 80},${930 - hh}`; }).join(' ')} L560,930 Z`} fill={c1} />
		{Array.from({length: 26}, (_, i) => <rect key={i} x={-380 + rnd(i, 11) * 880} y={700 + rnd(i, 12) * 170} width={10} height={14} fill={WARM} opacity={mode === 'dusk' ? 0.35 + 0.3 * rnd(i, 13) : 0.2 * rnd(i, 13)} />)}
	</g>;
};
/** the whole street at zoom 1: sky, far town, the terrace and its roofs (behind the figures) */
export const StreetBack: React.FC<{t: number; mode: StreetMode; banner?: boolean; skyO?: number}> = ({t, mode, banner = true, skyO = 1}) => {
	const night = mode === 'night';
	return <g>
		{skyO > 0.001 && <g opacity={skyO}>
			<Sky id={`ss${mode}`} stops={night ? [[0, '#05070e'], [0.5, '#0c1020'], [0.62, '#161a2c'], [0.7, '#20202e']] : [[0, '#0d1222'], [0.42, '#2a2c48'], [0.56, '#5a4a62'], [0.63, '#a8705a'], [0.68, '#d89a62'], [0.72, '#8a5a4a']]} />
			{!night && <Glow x={60} y={700} r={600} c="#f0a060" o={0.28} id="sunset59" />}
			{Array.from({length: 40}, (_, i) => <circle key={i} cx={-300 + rnd(i, 21) * 3400} cy={-1500 + rnd(i, 22) * 1700} r={0.8 + 1.4 * rnd(i, 23)} fill="#eef0ff" opacity={(night ? 0.55 : 0.35) * (0.4 + 0.6 * rnd(i, 24))} />)}
			{!night && <circle cx={260} cy={260} r={4} fill="#fff6e0" opacity={0.9} />}
			<FarTown mode={mode} />
		</g>}
		<Lamp x={380} ground={930} h={560} id={`lp1${mode}`} />
		<Roofs mode={mode} t={t} />
		{HOUSES.map((x0, i) => <HouseFront key={i} x0={x0} i={i} mode={mode} t={t} skipDoor={i === 1} />)}
		{/* the gable end wall */}
		<rect x={480} y={95} width={40} height={820} fill={PAL_S[mode].brick2} /><rect x={470} y={95} width={10} height={820} fill="#000" opacity={0.3} />
		{banner && <>
			<Bunting t={t} a={[1120, 205]} b={[1760, 205]} sag={50} n={12} />
			<Bunting t={t} a={[1780, 210]} b={[2400, 212]} sag={40} n={11} seed={2} />
		</>}
	</g>;
};
/** the front of the street: low walls with gates, pavement, kerb, road */
export const StreetFront: React.FC<{mode: StreetMode; gateOpen?: number}> = ({mode, gateOpen = 1}) => {
	const P = PAL_S[mode];
	const wall = (a: number, b: number, k: string) => <g key={k}><rect x={a} y={868} width={b - a} height={62} fill={P.wall} /><rect x={a - 4} y={860} width={b - a + 8} height={12} fill={P.trim} />
		{Array.from({length: Math.floor((b - a) / 44)}, (_, i) => <path key={i} d={`M${a + i * 44},${872} V${930} M${a},${899} H${b}`} stroke={P.mortar} strokeWidth={1.2} opacity={0.4} />)}</g>;
	return <g>
		<rect x={-600} y={915} width={4000} height={15} fill={P.pave} opacity={0.8} />
		{wall(520, 1000, 'w0')}{wall(1290, 1790, 'w1')}{wall(1880, 2450, 'w2')}{wall(-600, 300, 'w3')}
		{/* gate posts and the mother's iron gate, swung open against the wall */}
		{[1000, 1290].map((x) => <rect key={x} x={x - 14} y={846} width={28} height={84} fill={P.trim} />)}
		<g opacity={gateOpen}>{Array.from({length: 7}, (_, i) => <rect key={i} x={1300 + i * 13} y={862} width={4} height={60} fill="#0e0e12" />)}<rect x={1300} y={868} width={84} height={5} fill="#0e0e12" /><rect x={1300} y={912} width={84} height={5} fill="#0e0e12" /></g>
		<rect x={-600} y={930} width={4000} height={50} fill={P.pave} /><rect x={-600} y={930} width={4000} height={3} fill="#4a4650" opacity={0.6} />
		<rect x={-600} y={978} width={4000} height={12} fill="#3a3840" /><rect x={-600} y={990} width={4000} height={500} fill={P.road} />
		<path d="M-600,1060 H3400" stroke="#d8d0c0" strokeWidth={5} strokeDasharray="70 60" opacity={0.18} />
	</g>;
};
/** the crane's planes behind the near roofs: rows of roofs further back, the docks, the Humber with its bridge, the far shore */
export const TownPlanes: React.FC<{cam: CamT; t: number}> = ({cam, t}) => <g>
	<Par cam={cam} k={0.12}>
		<Sky id="crsky" stops={[[0, '#060a16'], [0.3, '#121a30'], [0.55, '#2a2c48'], [0.66, '#6a5060'], [0.72, '#b07a5a'], [0.78, '#5a4048']]} x={-3000} y={-3000} w={9000} h={5200} />
		{Array.from({length: 70}, (_, i) => <circle key={i} cx={-1500 + rnd(i, 31) * 5000} cy={-2400 + rnd(i, 32) * 2600} r={0.8 + 1.5 * rnd(i, 33)} fill="#eef0ff" opacity={0.5 * (0.4 + 0.6 * rnd(i, 34))} />)}
	</Par>
	<Par cam={cam} k={0.22}>
		{/* the estuary at the horizon, the bridge far to the right, the far shore */}
		<rect x={-3000} y={140} width={9000} height={60} fill="#2c2838" />
		<rect x={-3000} y={196} width={9000} height={120} fill="#3a3a52" /><path d="M-3000,200 H6000" stroke="#c09070" strokeWidth={3} opacity={0.4} />
		{Array.from({length: 30}, (_, i) => <path key={i} d={`M${-2000 + rnd(i, 41) * 6000},${215 + rnd(i, 42) * 90} h${40 + 80 * rnd(i, 43)}`} stroke="#d8a888" strokeWidth={2} opacity={0.25} />)}
		<g fill="#1a1824"><rect x={2280} y={40} width={12} height={160} /><rect x={2740} y={40} width={12} height={160} /><rect x={1900} y={170} width={1300} height={8} />
			<path d="M1900,172 Q2090,150 2286,42 Q2516,160 2746,42 Q2950,150 3200,172" stroke="#1a1824" strokeWidth={3} fill="none" /></g>
	</Par>
	<Par cam={cam} k={0.4}>
		{/* the town: rows of terraces in haze, lit windows and street lamps */}
		{[0, 1, 2].map((r) => { const y = 250 + r * 120, c = ['#24222e', '#1e1d28', '#1a1922'][r];
			return <g key={r}><path d={`M-2600,${y + 120} ${Array.from({length: 40}, (_, i) => { const x = -2600 + i * 150 + r * 40, hh = 40 + 30 * rnd(i, 50 + r); return `L${x},${y + 120 - hh} L${x + 75},${y + 90 - hh} L${x + 150},${y + 120 - hh}`; }).join(' ')} L3600,${y + 300} L-2600,${y + 300} Z`} fill={c} />
				{Array.from({length: 40}, (_, i) => <circle key={i} cx={-2500 + rnd(i, 60 + r) * 6000} cy={y + 100 + rnd(i, 70 + r) * 60} r={3} fill={WARM} opacity={0.3 + 0.4 * rnd(i, 80 + r)} />)}</g>; })}
		{/* dock cranes */}
		{[-900, -620, 2600].map((x, i) => <g key={i} stroke="#1a1922" strokeWidth={8} fill="none"><path d={`M${x},${260} V${120} L${x + 160},${120} M${x},${150} L${x + 120},${120}`} /></g>)}
	</Par>
	<Par cam={cam} k={0.7}>
		{/* the back of the next terrace row: roofs and stacks */}
		<path d={`M-1200,${-60} ${Array.from({length: 26}, (_, i) => { const x = -1200 + i * 200; return `L${x},${-40} L${x + 100},${-120} L${x + 200},${-40}`; }).join(' ')} L4000,${200} L-1200,${200} Z`} fill="#1e1c26" />
		{Array.from({length: 26}, (_, i) => <g key={i}><rect x={-1180 + i * 200} y={-170} width={40} height={70} fill="#1a1820" />
			{rnd(i, 90) > 0.6 && <rect x={-1120 + i * 200} y={-30} width={22} height={28} fill={WARM} opacity={0.5} />}</g>)}
		{Array.from({length: 5}, (_, j) => { const u = ((t * 0.18 + j / 5) % 1); return <circle key={j} cx={-160 - u * 200} cy={-180 - u * 300} r={16 + u * 50} fill="#6a6478" opacity={0.18 * (1 - u) * Math.min(1, u * 6)} />; })}
	</Par>
</g>;

/* ====================================== clouds (the crane passes through them) ====================================== */
export const CloudLayer: React.FC<{y: number; k: number; t: number; tint?: string; under?: string; o?: number; seed?: number; s?: number}> = ({y, k, t, tint = '#6c6680', under = '#c88a6a', o = 1, seed = 0, s = 1}) => {
	if (o < 0.01) return null;
	return <g opacity={o}>{Array.from({length: 9}, (_, i) => { const x = -700 + i * 420 + rnd(i, 5 + seed) * 200 + t * 14 * (1 + rnd(i, 6 + seed)), yy = y + (rnd(i, 7 + seed) - 0.5) * 200 * s, sc = (1.4 + rnd(i, 8 + seed) * 1.4) * s;
		return <g key={i} transform={`translate(${x},${yy}) scale(${sc})`}>
			<path d="M-200,40 Q-210,-10 -150,-20 Q-150,-80 -80,-80 Q-50,-140 20,-120 Q80,-150 120,-90 Q190,-100 200,-30 Q250,-10 230,40 Z" fill={tint} />
			<path d="M-200,40 Q0,20 230,40 Q240,60 200,64 L-180,64 Q-214,60 -200,40 Z" fill={under} opacity={0.5} /></g>; })}
		{k > 0 && <rect x={-400} y={y - 60} width={2800} height={0} />}
	</g>;
};

/* ====================================== PATAGONIA: the coast at the start ====================================== */
/** the end-of-the-world signpost: a post with painted arrow boards at several angles (no legible names) */
export const Signpost: React.FC<{x: number; ground: number; t: number; s?: number}> = ({x, ground, t, s = 1}) => {
	const boards: [number, number, string, number][] = [[-480, 18, '#d8ccb0', 1], [-430, -24, '#b4583c', -1], [-382, 8, '#7a8e8c', 1], [-336, -14, '#d8ccb0', -1], [-292, 30, '#c89a48', 1], [-246, -6, '#5a6a74', -1], [-202, 16, '#d8ccb0', 1]];
	return <g transform={`translate(${x},${ground}) scale(${s})`}>
		<rect x={-9} y={-540} width={18} height={540} fill="#1a1612" /><rect x={-14} y={-548} width={28} height={12} fill="#1a1612" />
		{boards.map(([y, ang, c, side], i) => { const L = 150 + 40 * rnd(i, 4), wob = Math.sin(t * 3 + i) * 0.8;
			return <g key={i} transform={`translate(0,${y}) rotate(${ang + wob})`}>
				<path d={side > 0 ? `M6,-18 L${L},-18 L${L + 22},0 L${L},18 L6,18 Z` : `M-6,-18 L${-L},-18 L${-L - 22},0 L${-L},18 L-6,18 Z`} fill={c} />
				<path d={side > 0 ? `M6,-18 L${L},-18 L${L + 22},0 L${L},18 L6,18 Z` : `M-6,-18 L${-L},-18 L${-L - 22},0 L${-L},18 L-6,18 Z`} fill="#000" opacity={0.28} />
				{Array.from({length: 4}, (_, j) => <rect key={j} x={side > 0 ? 24 + j * (L - 40) / 4 : -24 - (j + 1) * (L - 40) / 4} y={-5} width={(L - 40) / 4 - 10} height={10} fill="#1a1612" opacity={0.55} />)}
			</g>; })}
	</g>;
};
/** a wind-bent tree (Patagonian "flag" tree): the crown streams downwind (+x) */
export const FlagTree: React.FC<{x: number; ground: number; s?: number; t: number; col?: string}> = ({x, ground, s = 1, t, col = '#16140f'}) => { const w = Math.sin(t * 2.4) * 4;
	return <g transform={`translate(${x},${ground}) scale(${s})`} fill={col}>
		<path d="M-14,0 Q-10,-120 20,-220 Q40,-280 90,-300 L96,-290 Q54,-268 40,-210 Q16,-110 14,0 Z" />
		<path d={`M30,-250 Q120,-${330 + w} 300,-${292 + w} Q380,-${276 + w} 420,-${254 + w * 1.4} Q330,-${236 + w} 240,-${232 + w} Q300,-${214 + w} 360,-${196 + w * 1.4} Q240,-${180} 140,-${196} Q90,-${200} 40,-${214} Z`} />
	</g>; };
/** tussock grass: clumps whose blades lean with the wind */
export const Grass: React.FC<{x0: number; x1: number; y: number; t: number; n: number; seed?: number; col?: string; hi?: string; s?: number}> = ({x0, x1, y, t, n, seed = 0, col = '#3e3420', hi = '#a8905a', s = 1}) => <g>
	{Array.from({length: n}, (_, i) => { const x = lerp(x0, x1, rnd(i, seed + 1)), hh = (26 + 34 * rnd(i, seed + 2)) * s, lean = 10 + 8 * Math.sin(t * 2.2 + x * 0.01 + i) + 6 * rnd(i, seed + 3);
		return <g key={i}><path d={`M${f1(x - 16 * s)},${y} Q${f1(x - 4 * s + lean * 0.3)},${f1(y - hh * 0.6)} ${f1(x + lean)},${f1(y - hh)} Q${f1(x + 2 * s + lean * 0.4)},${f1(y - hh * 0.4)} ${f1(x + 16 * s)},${y} Z`} fill={col} />
			<path d={`M${f1(x - 4 * s)},${y} Q${f1(x + lean * 0.5)},${f1(y - hh * 0.6)} ${f1(x + lean * 1.1)},${f1(y - hh * 0.95)}`} stroke={hi} strokeWidth={2 * s} opacity={0.35} fill="none" /></g>; })}
</g>;
/** gulls: small gliding Ms */
export const Gulls: React.FC<{t: number; n?: number; x: number; y: number; seed?: number; col?: string}> = ({t, n = 3, x, y, seed = 0, col = '#e8ecee'}) => <g>
	{Array.from({length: n}, (_, i) => { const px = x + i * 90 + t * (28 + 10 * rnd(i, seed)), py = y + Math.sin(t * 1.3 + i * 2) * 14 + i * 26, fl = Math.sin(t * 6 + i * 1.7) * 6;
		return <path key={i} d={`M${f1(px - 22)},${f1(py - fl)} Q${f1(px - 10)},${f1(py - 12)} ${f1(px)},${f1(py)} Q${f1(px + 10)},${f1(py - 12)} ${f1(px + 22)},${f1(py - fl)}`} stroke={col} strokeWidth={3.5} fill="none" strokeLinecap="round" opacity={0.85} />; })}
</g>;
/** the Strait of Magellan: the far shore and its snowy range, the sea with whitecaps (own clocks) */
export const Strait: React.FC<{t: number; y0: number; y1: number}> = ({t, y0, y1}) => <g>
	<path d={`M-800,${y0} L-600,${y0 - 70} L-420,${y0 - 40} L-200,${y0 - 120} L0,${y0 - 60} L260,${y0 - 150} L420,${y0 - 90} L700,${y0 - 170} L880,${y0 - 110} L1100,${y0 - 60} L1400,${y0 - 140} L1640,${y0 - 70} L1900,${y0 - 120} L2200,${y0 - 50} L2700,${y0 - 90} L2700,${y0 + 10} L-800,${y0 + 10} Z`} fill="#6c7a88" />
	<path d={`M-200,${y0 - 120} L-150,${y0 - 96} L-120,${y0 - 104} L-80,${y0 - 86} L-120,${y0 - 86} Z M260,${y0 - 150} L320,${y0 - 118} L280,${y0 - 120} L250,${y0 - 112} L210,${y0 - 122} Z M700,${y0 - 170} L760,${y0 - 134} L720,${y0 - 138} L680,${y0 - 128} L650,${y0 - 140} Z M1400,${y0 - 140} L1460,${y0 - 108} L1420,${y0 - 112} L1380,${y0 - 104} L1350,${y0 - 118} Z`} fill="#e4e8ec" opacity={0.8} />
	<rect x={-800} y={y0} width={3600} height={y1 - y0 + 40} fill="#3a4a58" />
	<defs><linearGradient id="sea59" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6a7a86" stopOpacity="0.6" /><stop offset="1" stopColor="#1e2a34" stopOpacity="0.6" /></linearGradient></defs>
	<rect x={-800} y={y0} width={3600} height={y1 - y0 + 40} fill="url(#sea59)" />
	{Array.from({length: 46}, (_, i) => { const yy = lerp(y0 + 8, y1, rnd(i, 3) ** 0.8), k = (yy - y0) / (y1 - y0), x = ((rnd(i, 4) * 3600 + t * (40 + 60 * k)) % 3600) - 800, life = (t * 0.7 + rnd(i, 5)) % 1;
		return <path key={i} d={`M${f1(x)},${f1(yy)} q${f1(14 + 30 * k)},${f1(-4 - 4 * k)} ${f1(28 + 60 * k)},0`} stroke="#eef2f4" strokeWidth={1.5 + 2.5 * k} fill="none" opacity={0.55 * Math.sin(Math.PI * life)} strokeLinecap="round" />; })}
</g>;

/* ====================================== PATAGONIA: the steppe road ====================================== */
/** a long-distance coach, side view, facing −x (its door on the front-left); lights optional */
export const Bus: React.FC<{x: number; ground: number; s?: number; door?: number; t: number; col?: string}> = ({x, ground, s = 1, door = 0, t, col = '#2c3238'}) => <g transform={`translate(${x},${ground}) scale(${s})`}>
	<path d="M-300,-40 L-300,-250 Q-298,-282 -262,-286 L290,-286 Q308,-284 310,-262 L310,-40 Z" fill={col} />
	<rect x={-300} y={-150} width={610} height={10} fill="#c8a24a" opacity={0.55} />
	{Array.from({length: 7}, (_, i) => <rect key={i} x={-200 + i * 70} y={-262} width={60} height={86} rx={6} fill="#1a2028" />)}
	<path d="M-296,-262 L-226,-262 L-226,-170 L-296,-150 Z" fill="#3a4654" />
	<rect x={-218} y={-250} width={50} height={204} fill={door > 0.5 ? '#e8c890' : '#1a2028'} opacity={door > 0.5 ? 0.6 : 1} />
	<rect x={-218 + 50 * door * 0.9} y={-250} width={50 * (1 - door * 0.9)} height={204} fill="#222830" />
	{[-200, 200].map((wx) => <g key={wx}><circle cx={wx} cy={-40} r={42} fill="#0e0e10" /><circle cx={wx} cy={-40} r={15} fill="#3a3a40" /><path d={`M${wx},-40 l${12 * Math.cos(t * 8)},${12 * Math.sin(t * 8)}`} stroke="#5a5a60" strokeWidth={3} /></g>)}
	<rect x={-306} y={-70} width={20} height={14} fill="#f4e2b0" opacity={0.8} />
</g>;
/** a pickup, side view, facing +x */
export const Pickup: React.FC<{x: number; ground: number; s?: number; t: number; col?: string; driver?: boolean}> = ({x, ground, s = 1, t, col = '#3a3030', driver = true}) => <g transform={`translate(${x},${ground}) scale(${s})`}>
	<path d="M-240,-36 L-240,-112 L-30,-112 L-20,-176 Q-16,-190 4,-190 L110,-190 Q130,-188 146,-160 L176,-118 Q236,-112 244,-86 L246,-36 Z" fill={col} />
	<path d="M-6,-178 L104,-178 Q118,-176 132,-152 L148,-122 L-6,-122 Z" fill="#2a3440" />
	{driver && <g fill="#0e0d10"><circle cx={70} cy={-150} r={16} /><path d="M50,-122 Q52,-140 70,-140 Q90,-140 92,-122 Z" /></g>}
	{[-150, 150].map((wx) => <g key={wx}><circle cx={wx} cy={-36} r={38} fill="#0e0e10" /><circle cx={wx} cy={-36} r={14} fill="#3a3a40" /><path d={`M${wx},-36 l${11 * Math.cos(t * 10)},${11 * Math.sin(t * 10)}`} stroke="#5a5a60" strokeWidth={3} /></g>)}
	<rect x={232} y={-100} width={14} height={14} fill="#f4e2b0" opacity={0.85} />
</g>;
/** a twin-prop airliner, side view, facing +x */
export const Plane: React.FC<{x: number; y: number; s?: number; ang?: number; t: number; col?: string}> = ({x, y, s = 1, ang = 0, t, col = '#2c323a'}) => <g transform={`translate(${x},${y}) rotate(${ang}) scale(${s})`}>
	<path d="M-260,-10 Q-250,-34 -200,-36 L190,-36 Q250,-34 270,-6 Q250,14 190,16 L-180,16 Q-230,14 -260,-10 Z" fill={col} />
	<path d="M-230,-30 L-280,-110 L-246,-110 L-170,-34 Z" fill={col} /><path d="M-220,0 L-300,10 L-290,18 L-200,12 Z" fill={col} />
	<path d="M-20,-4 L-90,70 L-56,70 L50,-4 Z" fill="#20262c" />
	<rect x={-30} y={20} width={60} height={22} rx={8} fill="#20262c" />
	<ellipse cx={34} cy={31} rx={5} ry={26 * Math.abs(Math.cos(t * 40))} fill="#9aa0a8" opacity={0.5} />
	{Array.from({length: 12}, (_, i) => <rect key={i} x={-150 + i * 26} y={-24} width={12} height={12} rx={3} fill="#c8d0d8" opacity={0.35} />)}
	<circle cx={-270} cy={-104} r={4} fill="#ff6a5a" opacity={0.5 + 0.5 * Math.sin(t * 9)} />
</g>;
/** the red ✕ (the seal's red, two brush strokes) slammed on: k = landing progress 0..1 */
export const RedX: React.FC<{x: number; y: number; s: number; k: number}> = ({x, y, s, k}) => { if (k <= 0) return null; const a = land(k), sc = 1.5 - 0.5 * a;
	return <g transform={`translate(${x},${y}) scale(${s * sc}) rotate(-6)`} opacity={Math.min(1, k * 4)}>
		<path d="M-62,-58 Q-50,-66 -40,-56 L62,48 Q66,60 54,64 Q46,66 40,58 L-64,-44 Q-70,-52 -62,-58 Z" fill="#C8402E" stroke="#1a0c08" strokeWidth={5} strokeOpacity={0.6} paintOrder="stroke" />
		<path d="M58,-60 Q68,-54 62,-44 L-46,62 Q-56,68 -62,60 Q-66,52 -58,46 L44,-58 Q50,-64 58,-60 Z" fill="#C8402E" stroke="#1a0c08" strokeWidth={5} strokeOpacity={0.6} paintOrder="stroke" />
	</g>; };
/** a guanaco grazing (far, small) */
export const Guanaco: React.FC<{x: number; ground: number; s?: number; t: number; col?: string; head?: number}> = ({x, ground, s = 1, col = '#3a3022', head = 0}) => <g transform={`translate(${x},${ground}) scale(${s})`} fill={col}>
	<path d="M-60,-70 Q-64,-96 -30,-100 L40,-100 Q60,-98 62,-80 L58,-62 Q20,-56 -40,-60 Z" />
	{[-50, -34, 40, 54].map((lx, i) => <rect key={i} x={lx} y={-66} width={7} height={66} />)}
	<path d={head > 0.5 ? 'M52,-90 Q76,-70 84,-20 L96,-14 Q98,-26 92,-30 Q84,-74 60,-100 Z' : 'M50,-94 Q64,-140 70,-170 L92,-166 Q96,-160 84,-156 Q74,-128 64,-90 Z'} />
	<path d="M-60,-90 Q-74,-84 -70,-70" stroke={col} strokeWidth={8} fill="none" />
</g>;
/** a fence along the road: posts and two wires */
export const WireFence: React.FC<{x0: number; x1: number; y: number; h?: number; gap?: number; col?: string}> = ({x0, x1, y, h = 70, gap = 140, col = '#1e1a14'}) => <g>
	{Array.from({length: Math.ceil((x1 - x0) / gap) + 1}, (_, i) => <rect key={i} x={x0 + i * gap - 3} y={y - h} width={6 + (i % 4 === 0 ? 3 : 0)} height={h} fill={col} />)}
	<path d={`M${x0},${y - h + 10} H${x1} M${x0},${y - h + 36} H${x1}`} stroke={col} strokeWidth={1.6} opacity={0.8} /></g>;

/* ====================================== the kit: a flat-lay seen from above ====================================== */
/** the expedition pack lying on its back, lid open, top-down; centred at 0,0, opening toward +x */
export const PackTop: React.FC<{x: number; y: number; s?: number; r?: number}> = ({x, y, s = 1, r = 0}) => <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>
	<ellipse cx={8} cy={14} rx={250} ry={160} fill="#000" opacity={0.35} />
	<path d="M-230,-120 Q-250,0 -230,120 Q-200,150 -120,150 L150,140 Q200,130 206,80 L210,-80 Q204,-130 150,-140 L-120,-150 Q-200,-150 -230,-120 Z" fill="#3e4632" />
	<path d="M-200,-100 L-200,100 M-140,-130 L-140,130" stroke="#2a3022" strokeWidth={10} />
	<path d="M-60,-60 Q-80,0 -60,60 L60,60 Q80,0 60,-60 Z" fill="#343c2a" />
	<path d="M150,-140 Q200,-130 206,-80 L210,80 Q200,130 150,140 L230,130 Q300,90 300,0 Q300,-90 230,-130 Z" fill="#4a5440" />
	<ellipse cx={186} cy={0} rx={34} ry={110} fill="#14160f" />
	<path d="M-160,-150 Q-120,-190 -60,-150 M-160,150 Q-120,190 -60,150" stroke="#2a3022" strokeWidth={12} fill="none" />
	<rect x={-30} y={-24} width={60} height={48} rx={8} fill="#2a3022" />
</g>;
/** a tent in its stuff sack with the pole bag beside it (top-down) */
export const TentBag: React.FC<{x: number; y: number; s?: number; r?: number}> = ({x, y, s = 1, r = 0}) => <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>
	<rect x={-140} y={-62} width={280} height={124} rx={60} fill="#7a5a32" />
	<path d="M-80,-60 Q-90,0 -80,60 M0,-62 Q-8,0 0,62 M80,-60 Q72,0 80,60" stroke="#5a4024" strokeWidth={4} fill="none" />
	<path d="M140,-20 Q170,-30 176,0 Q170,30 140,20" fill="#5a4024" /><circle cx={182} cy={0} r={8} fill="#c8b890" />
	<rect x={-150} y={74} width={300} height={22} rx={11} fill="#4a5048" /><rect x={-150} y={74} width={30} height={22} rx={8} fill="#2a2e2a" />
	{/* a little tent glyph printed on the sack */}
	<path d="M-36,30 L0,-28 L36,30 Z" fill="none" stroke="#e8d8b0" strokeWidth={5} strokeLinejoin="round" opacity={0.75} /><path d="M0,-28 V30" stroke="#e8d8b0" strokeWidth={4} opacity={0.75} />
</g>;
/** a few hundred dollars: a fan of generic notes under a rubber band (no real currency design) */
export const Cash: React.FC<{x: number; y: number; s?: number; r?: number}> = ({x, y, s = 1, r = 0}) => <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>
	{[-16, -6, 4, 14].map((a, i) => <g key={i} transform={`rotate(${a})`}>
		<rect x={-130} y={-56} width={260} height={112} rx={6} fill={['#7d8a6a', '#8a9676', '#93a07e', '#a0aa88'][i]} stroke="#4a5640" strokeWidth={3} />
		<rect x={-114} y={-42} width={228} height={84} rx={4} fill="none" stroke="#5a6650" strokeWidth={2} opacity={0.7} />
		<ellipse cx={0} cy={0} rx={30} ry={36} fill="#6a765a" opacity={0.6} />
		<text x={-96} y={-14} style={{fontFamily: "'DejaVu Serif', serif", fontWeight: 700, fontSize: 30}} fill="#3e4a34">$</text>
		<text x={84} y={40} style={{fontFamily: "'DejaVu Serif', serif", fontWeight: 700, fontSize: 30}} fill="#3e4a34">$</text></g>)}
	<rect x={-30} y={-70} width={16} height={140} rx={4} fill="#b8743c" transform="rotate(14)" />
</g>;
/** a cheap plastic 35 mm compact lying on its back, lens up (top-down) */
export const PlasticCam: React.FC<{x: number; y: number; s?: number; r?: number}> = ({x, y, s = 1, r = 0}) => <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>
	<rect x={-130} y={-74} width={260} height={148} rx={30} fill="#262628" />
	<rect x={-130} y={-74} width={260} height={30} rx={14} fill="#38383c" />
	<path d="M-130,-30 Q-140,0 -130,40 L-96,40 L-96,-30 Z" fill="#1c1c1e" />
	<circle cx={20} cy={10} r={56} fill="#18181a" /><circle cx={20} cy={10} r={42} fill="#2e3440" /><circle cx={20} cy={10} r={24} fill="#11141a" /><circle cx={6} cy={-4} r={9} fill="#cfe0f0" opacity={0.55} />
	<rect x={70} y={-58} width={44} height={26} rx={4} fill="#d8dce0" opacity={0.75} /><rect x={-80} y={-60} width={34} height={22} rx={3} fill="#3a4250" />
	<rect x={-40} y={-90} width={40} height={18} rx={6} fill="#c8402e" opacity={0.85} />
</g>;
/** wooden floor planks with a lamp pool (top-down) */
export const Planks: React.FC<{id: string}> = ({id}) => <g>
	{Array.from({length: 16}, (_, i) => <g key={i}>
		<rect x={-400} y={-300 + i * 120} width={2720} height={118} fill={['#3a2a20', '#34261c', '#3e2e22', '#30231a'][i % 4]} />
		{Array.from({length: 4}, (_, j) => <path key={j} d={`M${-400 + rnd(i * 4 + j, 3) * 2700},${-290 + i * 120 + 20 + 70 * rnd(i * 4 + j, 4)} q300,${10 * (rnd(i, j) - 0.5)} 700,0`} stroke="#22180f" strokeWidth={2} fill="none" opacity={0.5} />)}
		<rect x={-400 + ((i * 731) % 1900)} y={-300 + i * 120} width={4} height={118} fill="#1e150e" /></g>)}
	<defs><radialGradient id={`${id}lp`} cx="0.42" cy="0.42" r="0.7"><stop offset="0" stopColor="#ffd8a0" stopOpacity="0.32" /><stop offset="0.6" stopColor="#ffb870" stopOpacity="0.08" /><stop offset="1" stopColor="#000" stopOpacity="0.5" /></radialGradient></defs>
	<rect x={-400} y={-300} width={2720} height={1700} fill={`url(#${id}lp)`} />
</g>;
/** a label tag under a flat-lay item */
export const Tag: React.FC<{x: number; y: number; text: string; k: number}> = ({x, y, text, k}) => { if (k <= 0) return null; const w = text.length * 40 + 54;
	return <g transform={`translate(${x},${y + 16 * (1 - eo(k))})`} opacity={sm(k * 1.4)}>
		<rect x={-w / 2} y={-30} width={w} height={60} rx={8} fill="#f1e6d0" /><rect x={-w / 2} y={26} width={w} height={4} fill="#FFC24A" />
		<text x={0} y={13} textAnchor="middle" style={{fontFamily: "'LXGW WenKai','Noto Serif CJK SC',serif", fontWeight: 700, fontSize: 36, letterSpacing: '0.08em'}} fill="#2a2018">{text}</text></g>; };

/* ====================================== the calendar card ====================================== */
/** a tear-off year calendar: `year` shown; `tear` (0..1) lifts the top page away downwind; `ring` draws a gold circle on the year */
export const YearCard: React.FC<{x: number; y: number; year: number; next?: number; tear?: number; ring?: number; s?: number}> = ({x, y, year, next, tear = 0, ring = 0, s = 1}) => {
	const page = (yr: number, k: number) => <g>
		<rect x={-170} y={-10} width={340} height={300} rx={10} fill="#efe4cc" />
		<text x={0} y={160} textAnchor="middle" style={{fontFamily: "'Cormorant59','Cormorant59i','DejaVu Serif',serif", fontWeight: 700, fontSize: 150, letterSpacing: '0.01em'}} fill="#2a2018">{yr}</text>
		<g opacity={0.5}>{Array.from({length: 3}, (_, r) => Array.from({length: 7}, (_, c) => <rect key={`${r}_${c}`} x={-120 + c * 36} y={200 + r * 22} width={22} height={10} rx={2} fill="#6a5a48" />))}</g>
		{k > 0 && <rect x={-170} y={-10} width={340} height={300} rx={10} fill="#000" opacity={0.12 * k} />}
	</g>;
	return <g transform={`translate(${x},${y}) scale(${s})`}>
		<rect x={-160} y={4} width={340} height={300} rx={10} fill="#000" opacity={0.35} />
		{next !== undefined && page(next, 0)}
		{tear < 1 && <g transform={`translate(${520 * ei(tear)},${-200 * tear + 260 * tear * tear}) rotate(${tear * 70} 0 0)`} opacity={1 - sm(seg(tear, 0.6, 1))}>{page(year, 0)}</g>}
		<rect x={-178} y={-34} width={356} height={36} rx={8} fill="#c8902e" /><rect x={-178} y={-34} width={356} height={10} rx={6} fill="#FFC24A" />
		{[-90, 90].map((rx) => <circle key={rx} cx={rx} cy={-16} r={8} fill="#2a2018" />)}
		{ring > 0 && <path d={(() => { const n = Math.max(2, Math.round(60 * ring)); return 'M' + Array.from({length: n + 1}, (_, i) => { const a = -2.6 + (i / 60) * 2 * Math.PI * 1.08, r1 = 150 + 6 * Math.sin(a * 3); return `${f1(Math.cos(a) * r1)},${f1(108 + Math.sin(a) * r1 * 0.5)}`; }).join(' L'); })()}
			stroke="#FFC24A" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
	</g>;
};
