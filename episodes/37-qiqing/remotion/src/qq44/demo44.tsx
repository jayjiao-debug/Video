import React from 'react';
import {W, H, rnd, lerp, Glow, Rimmed, fkPose, gaitPose, mixPose, Look4, Pose, B, jointAt, Sky, BRAIN_D, HeadGlow, Jar} from './kit44';
import {SANS, MONO, ROSE, INK} from './skin44';
import {Figure4} from './figure44';
import {Shaft, Motes, Pendant, Shelf, Frame, Wallpaper, Curtain, Stove, Cloud, Farm, Fence, Clock} from './bg44';
/* ep44 demo (story 0–35.0): every scene takes story time t (demo v1 clock); camera on every shot; motivated transitions.
   FOR rough44b (Fixer 2): the fixed compass close-up is exported as `K2Scene` (+ `k2Rot`, `k2Tip`, `k2Glow`, `K2_C`, `K2_R`), see the K2 block.
   Use it inside your own <Cam> for F2–F4: <K2Scene t={demoT} id="bk2" look={0..1} flare={…} bright={…} fieldK={…} />. The boy's own arms now
   hold the compass; his head glow sits at k2Glow(look) (back of the skull). Also exported: `skullBack` (glow position helper). */
export const T = {box: 3.5, mic: 5.75, car: 7.75, room: 9.75, title: 12.25, birth: 14.75, comp: 18.25, think: 21.5, light: 25.25, office: 28.5, paper: 31.75, end: 35.0};
export const cl = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
export const ease = (u: number) => { const x = cl(u); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const eo = (u: number) => 1 - Math.pow(1 - cl(u), 3);
export const ei = (u: number) => Math.pow(cl(u), 3);
export const sm = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
type P2 = [number, number];
const LBL = '#f3ece0', LBLI = '#3a2018';
const RIMB = '#ffc4a0';
const LK: Record<string, Look4> = {
	harveyOld: {dress: 'jacket', head: 'baldf', build: 1.05}, levy: {dress: 'jacket', head: 'bowl'}, diamond: {dress: 'coat', head: 'bob'},
	mother: {dress: 'dress', head: 'bun'}, father: {dress: 'coat', head: 'short', beard: 'full', build: 1.08}, child: {dress: 'tunic', head: 'child', build: 1.12},
	teen: {dress: 'jacket', head: 'short'}, ein: {dress: 'jacket', head: 'young', beard: 'mous2'}, clerk: {dress: 'coat', head: 'short'},
};
const STAND = {hip: 0.655, lean: 3, neck: 2, lt: 2, lk: 2, rt: -3, rk: 3, la: -3, le: 10, ra: 4, re: 14};
/** camera: look at (cx, cy) with zoom z */
export const Cam: React.FC<{cx: number; cy: number; z: number; r?: number; children: React.ReactNode}> = ({cx, cy, z, r = 0, children}) =>
	<g transform={`translate(${W / 2} ${H / 2}) rotate(${r}) scale(${z}) translate(${-cx} ${-cy})`}>{children}</g>;
const scr = (p: P2, cx: number, cy: number, z: number): P2 => [(p[0] - cx) * z + W / 2, (p[1] - cy) * z + H / 2];
/** place a figure so that its Head joint lands at (hx, hy) */
const placeHead = (pose: Pose, hx: number, hy: number, h: number, flip = false) => ({x: hx - (flip ? -1 : 1) * pose.Head[0] * h, ground: hy + pose.Head[1] * h});
/** round 2 (owner note 3): one offset for every profile head: the glow sits 0.04 h behind the head centre (the head reaches ≈ 0.07 h back) */
/* round 3 (owner note "the glow left the brain and is leaving a trail"): 0.04 put the centre so close to the back of the skull that
   the glow spilled out behind the head. It now sits in the middle of the back half of the skull (0.026), and every profile glow is
   drawn through `InHead` (a feathered mask of the skull), so it reads as light inside the head, never floating behind it. */
export const GLOW_BACK = 0.026;
/** the back of the skull (final pass: the 你 glow sits behind the ear in profile, never on the face) */
export const skullBack = (pose: Pose, x: number, g: number, h: number, flip = false, k = 0.03, down = 0): P2 => { const n1 = jointAt(pose, 'Neck1', x, g, h, flip), tp = jointAt(pose, 'Top', x, g, h, flip), c = headC(pose, x, g, h, flip);
	const ux = tp[0] - n1[0], uy = tp[1] - n1[1], l = Math.hypot(ux, uy) || 1, fx = -uy / l, fy = ux / l, sgn = flip ? -1 : 1;   // f = the face direction
	return [c[0] - sgn * fx * k * h * 0.93 - ux / l * down * h * 0.93, c[1] - sgn * fy * k * h * 0.93 - uy / l * down * h * 0.93]; };   // down: toward the nape
/** the skull as an ellipse in world coordinates (inside the head outline of figure44's profile head; hair not included) */
export const skullEllipse = (pose: Pose, x: number, g: number, h: number, flip = false) => { const n1 = jointAt(pose, 'Neck1', x, g, h, flip), tp = jointAt(pose, 'Top', x, g, h, flip), c = skullBack(pose, x, g, h, flip, 0.006, -0.006);
	return {cx: c[0], cy: c[1], rx: 0.057 * h * 0.93, ry: 0.064 * h * 0.93, rot: Math.atan2(tp[1] - n1[1], tp[0] - n1[0]) * 180 / Math.PI + 90}; };
export type Skull = ReturnType<typeof skullEllipse>;
/** draws its children only inside the head: `e` = a skull ellipse (feathered edge), or `shape(gradId)` = any white mask shape */
export const InHead: React.FC<{id: string; e?: Skull; shape?: (grad: string) => React.ReactNode; children: React.ReactNode}> = ({id, e, shape, children}) => <g>
	<defs><radialGradient id={`${id}ig`}><stop offset="0.72" stopColor="#fff" /><stop offset="1" stopColor="#000" /></radialGradient>
		<mask id={`${id}im`} maskUnits="userSpaceOnUse" x={-6000} y={-6000} width={14000} height={14000}>
			{e ? <ellipse cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry} transform={`rotate(${e.rot} ${e.cx} ${e.cy})`} fill={`url(#${id}ig)`} /> : shape?.(`url(#${id}ig)`)}</mask></defs>
	<g mask={`url(#${id}im)`}>{children}</g></g>;
const headC = (pose: Pose, x: number, g: number, h: number, flip = false): P2 => { const hd = jointAt(pose, 'Head', x, g, h, flip), tp = jointAt(pose, 'Top', x, g, h, flip); return [lerp(hd[0], tp[0], 0.45), lerp(hd[1], tp[1], 0.45)]; };
const Dust: React.FC<{t: number; n?: number; c?: string; o?: number; seed?: number}> = ({t, n = 40, c = '#c8d8dc', o = 0.16, seed = 0}) => <g>{Array.from({length: n}, (_, i) => {
	const x = ((rnd(i, 1 + seed) * W + t * (8 + 14 * rnd(i, 5))) % (W + 40)) - 20, y = rnd(i, 2 + seed) * H + Math.sin(t * 0.8 + i) * 12;
	return <circle key={i} cx={x} cy={y} r={1 + 2 * rnd(i, 3)} fill={c} opacity={o * (0.5 + 0.5 * Math.sin(t * 1.3 + i * 2.1))} />; })}</g>;
/** horizontal whip streaks (screen space) */
const Streaks: React.FC<{k: number; seed?: number}> = ({k, seed = 0}) => k <= 0.01 ? null : <g opacity={k}>{Array.from({length: 28}, (_, i) =>
	<rect key={i} x={-200 + rnd(i, 7 + seed) * W} y={rnd(i, 8 + seed) * H} width={300 + 600 * rnd(i, 9)} height={2 + 5 * rnd(i, 10)} fill={i % 4 ? '#d8d2c8' : B.mid} opacity={0.25 + 0.35 * rnd(i, 11)} />)}</g>;

/* ---------- the numbered cubes (legible stickers) ---------- */
const CELL = 80;
export type Cell = {cx: number; cy: number; n: number; inner: boolean};
export const CELLS: Cell[] = (() => { const o: Cell[] = []; let n = 0;
	for (let cy = -200; cy <= 200; cy += CELL) for (let cx = -280; cx <= 280; cx += CELL) { const e = (cx / 300) ** 2 + ((cy + 15) / 212) ** 2; if (e < 1.18) { n++; o.push({cx, cy, n, inner: e < 0.72}); } }
	return o; })();
export const Sticker: React.FC<{x: number; y: number; n: number; s?: number; o?: number}> = ({x, y, n, s = 1, o = 1}) => <g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
	<rect x={-28} y={-16} width={56} height={32} rx={3} fill={LBL} stroke="#6a4a3a" strokeWidth={1.2} />
	<text x={0} y={8.5} textAnchor="middle" style={{fontFamily: MONO, fontSize: 23, fontWeight: 700}} fill={LBLI}>{n}</text></g>;
export const BrainCubes: React.FC<{x: number; y: number; s: number; id: string; grid: number; explode: number; whole: number; fall: (c: Cell) => number; o?: number}> = ({x, y, s, id, grid, explode, whole, fall, o = 1}) =>
	<g transform={`translate(${x},${y}) scale(${s})`} opacity={o}>
		<defs><clipPath id={`${id}c`}><path d={BRAIN_D} /></clipPath>
			<radialGradient id={`${id}f`} cx="0.45" cy="0.42" r="0.62"><stop offset="0" stopColor={B.core} stopOpacity="0.95" /><stop offset="0.6" stopColor={B.mid} stopOpacity="0.62" /><stop offset="1" stopColor={B.halo} stopOpacity="0.42" /></radialGradient></defs>
		<Glow x={0} y={0} r={560} c={B.halo} o={0.32 * (1 - 0.5 * explode)} id={`${id}h`} />
		{CELLS.map((c) => { const d = Math.hypot(c.cx, c.cy + 15) || 1, f = fall(c), ox = c.cx / d * explode * (70 + 70 * rnd(c.n, 3)), oy = (c.cy + 15) / d * explode * (60 + 60 * rnd(c.n, 4)) + f * f * 1500, rot = (rnd(c.n, 5) - 0.5) * 34 * explode + f * 90 * (rnd(c.n, 6) - 0.5);
			return <g key={c.n} transform={`translate(${ox},${oy}) rotate(${rot} ${c.cx} ${c.cy})`}>
				<g clipPath={`url(#${id}c)`}><rect x={c.cx - CELL / 2 + 3} y={c.cy - CELL / 2 + 3} width={CELL - 6} height={CELL - 6} rx={7} fill={`url(#${id}f)`} opacity={(0.6 + 0.3 * whole) * cl(explode * 25)} stroke={B.core} strokeWidth={2.5} strokeOpacity={explode > 0.02 ? 1 : 0} /></g>
				{c.inner && <Sticker x={c.cx} y={c.cy} n={c.n} o={sm(explode * 6)} />}
			</g>; })}
		<g opacity={whole}><path d={BRAIN_D} fill={`url(#${id}f)`} opacity={0.5} />
			{['M-220,-40 C-160,-90 -100,-60 -60,-110', 'M-40,-160 C0,-110 60,-150 110,-120', 'M140,-60 C180,-20 230,-60 250,0', 'M-200,60 C-140,30 -90,80 -30,50', 'M20,40 C70,0 120,60 170,30', 'M-100,-10 C-50,-30 0,10 60,-20'].map((d, i) => <path key={i} d={d} stroke={B.core} strokeWidth={5} fill="none" opacity={0.6} strokeLinecap="round" />)}</g>
		{grid > 0 && <g clipPath={`url(#${id}c)`} opacity={1 - sm(explode * 3)}>
			{Array.from({length: 8}, (_, i) => { const xx = -320 + i * CELL; return <line key={`v${i}`} x1={xx} y1={-240} x2={xx} y2={lerp(-240, 240, grid)} stroke={B.core} strokeWidth={3} strokeDasharray="12 9" />; })}
			{Array.from({length: 6}, (_, i) => { const yy = -240 + i * CELL; return <line key={`h${i}`} x1={-320} y1={yy} x2={lerp(-320, 320, grid)} y2={yy} stroke={B.core} strokeWidth={3} strokeDasharray="12 9" />; })}</g>}
		<path d={BRAIN_D} fill="none" stroke={B.core} strokeWidth={7} opacity={1 - sm(explode * 4)} />
	</g>;

/* ================= C1 0–3.5: the light of you cracks into numbered cubes ================= */
export const ColdBrain: React.FC<{t: number}> = ({t}) => {
	const explode = 0.5 * ease(seg(t, 0.85, 2.1)), z = 1.02 + 0.07 * t / 3.5, cy = 540 + 150 * ei(seg(t, 2.3, 3.5)), bob = Math.sin(t * 1.6) * 8;
	return <g>
		<Sky id="c1s" stops={[[0, '#0d1518'], [0.6, '#1a282d'], [1, '#10181a']]} />
		<Cam cx={960 + 24 * Math.sin(t * 0.5)} cy={cy} z={z}>
			<g opacity={0.8}>
				<rect x={1320} y={120} width={380} height={540} fill="#22343a" /><rect x={1320} y={120} width={380} height={540} fill="none" stroke="#0a1012" strokeWidth={16} /><path d="M1510,120 V660 M1320,390 H1700" stroke="#0a1012" strokeWidth={9} />
				<Shaft id="c1sh" a={[1320, 660]} b={[1700, 660]} c={[1300, 1100]} d={[640, 1100]} col="#d8e4e8" o={0.08} />
				<rect x={-200} y={820} width={2400} height={400} fill="#0b1113" />
				<Shelf x={40} y={330} w={480} kind="jars" col="#0c1214" tone="#1c262a" seed={1} /><Shelf x={40} y={560} w={480} kind="books" col="#0c1214" tone="#1c262a" seed={2} />
				<Pendant x={300} y={110} len={200} id="c1p" o={0.6} col="#e8e2d4" />
			</g>
			<Motes t={t} x={700} y={600} w={900} h={460} n={26} o={0.35} col="#e8eef0" />
			<Dust t={t} n={30} />
			<BrainCubes x={960} y={540 + bob} s={1.22} id="c1b" grid={seg(t, 0.4, 0.85)} explode={explode} whole={1 - seg(t, 0.85, 1.25)} fall={(c) => ei(seg(t, 2.25 + 0.55 * rnd(c.n, 12), 3.3 + 0.55 * rnd(c.n, 12)))} />
			{Array.from({length: 26}, (_, i) => { const a = rnd(i, 7) * Math.PI * 2, d = (380 + 160 * rnd(i, 8)) * (0.6 + explode), x = 960 + Math.cos(a) * d, y = 540 + Math.sin(a) * d * 0.7 + ei(seg(t, 2.4, 3.5)) * 900 * rnd(i, 3);
				return <rect key={i} x={x} y={y} width={4 + 8 * rnd(i, 9)} height={4 + 8 * rnd(i, 9)} fill={B.mid} opacity={0.5 * seg(t, 0.8, 1.2)} transform={`rotate(${rnd(i, 10) * 90 + t * 30} ${x} ${y})`} />; })}
			<g fill="#060909"><rect x={-200} y={960} width={760} height={200} /><rect x={330} y={850} width={70} height={110} rx={10} /><rect x={340} y={836} width={50} height={16} rx={3} /><rect x={150} y={900} width={46} height={60} rx={6} /></g>
		</Cam>
	</g>;
};

/* ================= C2 3.5–5.75: the cubes drop into the CIDER box; the jar rises out ================= */
export const CiderBox: React.FC<{t: number}> = ({t}) => {
	const u = t - T.box, rise = ease(seg(u, 0.55, 1.5)), jy = lerp(905, 700, rise), push = ei(seg(u, 1.8, 2.25));
	const cx = lerp(960 + 30 * Math.sin(u * 0.7), 960, push), cy = lerp(lerp(380, 560, eo(seg(u, 0, 0.7))), jy - 150, push), z = lerp(1.04 + 0.03 * u, 3.0, push);
	const levyP = fkPose({...STAND, lean: lerp(10, 22, ease(seg(u, 0.5, 1.4))), neck: lerp(14, 24, ease(seg(u, 0.5, 1.4))), ra: 60, re: 70, la: 40, le: 90});
	const harP = fkPose({...STAND, lean: 8, neck: 14, ra: lerp(20, 44, ease(seg(u, 0.3, 1.2))), re: 50, la: 10, le: 20});
	const land = Math.max(0, ...[0.12, 0.22, 0.32].map((a) => (u >= a ? Math.exp(-(u - a) / 0.12) : 0)));
	return <g>
		<Sky id="c2s" stops={[[0, '#33332f'], [0.62, '#433f38'], [0.63, '#26221e'], [1, '#191715']]} />
		<Cam cx={cx} cy={cy} z={z}>
			<rect x={140} y={170} width={360} height={380} fill="#2a2826" /><rect x={150} y={180} width={340} height={360} fill="#4e5c64" opacity={0.55} /><path d="M320,180 V540 M150,360 H490" stroke="#2a2826" strokeWidth={10} />
			<Shaft id="c2sh" a={[150, 540]} b={[490, 540]} c={[900, 905]} d={[300, 905]} col="#dfe6e8" o={0.1} />
			<Motes t={t} x={200} y={400} w={600} h={480} n={20} o={0.35} />
			<Frame x={640} y={210} w={170} h={120} col="#1e1c1a" /><Frame x={860} y={240} w={90} h={110} col="#1e1c1a" />
			<g transform="translate(1600,300)"><rect x={-6} y={-60} width={12} height={60} fill="#1a1816" /><path d="M-40,-60 L40,-60 L26,-96 L-26,-96 Z" fill="#2a2a26" /><Glow x={0} y={-50} r={160} c="#ffe6c0" o={0.25} id="c2l" /></g>
			<rect x={1420} y={300} width={360} height={370} fill="#352f28" /><rect x={1440} y={330} width={320} height={10} fill="#26221c" /><rect x={1440} y={460} width={320} height={10} fill="#26221c" />
			<g transform="translate(470,880)"><rect x={-130} y={-120} width={260} height={120} rx={14} fill="#5e4440" /><rect x={-140} y={-140} width={280} height={34} rx={10} fill="#6e504a" /><rect x={-40} y={-158} width={80} height={20} rx={8} fill="#c8c2b8" opacity={0.7} /></g>
			<Glow x={980} y={jy - 140} r={420} c={B.halo} o={0.22 + 0.25 * rise + 0.3 * land} id="c2g" />
			{/* the box: back flap, jar, falling cubes, front face */}
			<g transform="translate(980,905)"><rect x={-230} y={-260} width={460} height={30} fill="#5a4430" /><path d="M-230,-260 L-200,-330 L200,-330 L230,-260 Z" fill="#6a5034" /></g>
			<Jar x={980} y={jy} s={1.05} id="c2j" n0={12} />
			{Array.from({length: 7}, (_, i) => { const a = 0.04 * i, k = seg(u, a, a + 0.32), x = 980 + (rnd(i, 3) - 0.5) * 220, y = lerp(-80, 700, k * k); return k > 0 && k < 1 ? <rect key={i} x={x - 22} y={y - 22} width={44} height={44} rx={5} fill={B.mid} opacity={0.85} stroke={B.core} strokeWidth={2} transform={`rotate(${k * 160 * (rnd(i, 4) - 0.5)} ${x} ${y})`} /> : null; })}
			<g transform="translate(980,905)">
				<rect x={-230} y={-245} width={460} height={245} fill="#86684a" /><rect x={-230} y={-245} width={460} height={12} fill="#6a5236" />
				<path d="M-230,-245 L-290,-300 L-200,-312 L-200,-245 Z" fill="#9c7c58" /><path d="M230,-245 L290,-300 L200,-312 L200,-245 Z" fill="#7a5e40" />
				<rect x={-230} y={-245} width={460} height={60} fill={B.mid} opacity={0.12 + 0.15 * rise} />
				<text x={0} y={-110} textAnchor="middle" style={{fontFamily: "'DejaVu Sans',sans-serif", fontWeight: 800, fontSize: 52, letterSpacing: '0.14em'}} fill="#3a2614" opacity={0.85}>CIDER</text>
				<rect x={-160} y={-80} width={320} height={6} fill="#3a2614" opacity={0.55} />
			</g>
			<g transform="translate(1250,905)"><rect x={0} y={-330} width={150} height={330} fill="#24221f" />{[0, 1, 2].map((k) => <g key={k}><rect x={10} y={-318 + k * 106} width={130} height={96} fill="#2e2b27" /><rect x={58} y={-280 + k * 106} width={34} height={10} fill="#a8a294" opacity={0.4} /></g>)}</g>
			<Rimmed x={1470} ground={905} h={600} pose={harP} look={LK.harveyOld} flip col="#14100e" rim={RIMB} rimOp={0.6} rimDx={2.4} />
			<Rimmed x={600} ground={905} h={590} pose={levyP} look={LK.levy} col="#14100e" rim={RIMB} rimOp={0.6} />
			{(() => { const h = jointAt(levyP, 'RHand', 600, 905, 590); return <rect x={h[0] - 14} y={h[1] - 30} width={36} height={46} fill="#e8e0d0" transform={`rotate(-20 ${h[0]} ${h[1]})`} />; })()}
			<g fill="#0a0908"><path d="M-60,1080 L-60,760 Q-20,730 40,740 L60,1080 Z" /><rect x={-60} y={880} width={260} height={30} rx={8} /><rect x={170} y={900} width={22} height={200} /></g>
		</Cam>
		<rect width={W} height={H} fill={B.core} opacity={0.35 * ei(seg(u, 2.0, 2.25))} />
	</g>;
};

/* ================= C3 5.75–7.75: a slide goes under the microscope ================= */
/** the scope (scaled to the seated user): base x, stage height, scale */
const MS = {x: 977, stage: 648, s: 0.47};
export const Microscope: React.FC<{t: number}> = ({t}) => {
	const u = t - T.mic, slide = ease(seg(u, 0.0, 0.6)), sx = lerp(720, MS.x, slide), pull = ease(seg(u, 0, 0.9)), whip = ei(seg(u, 1.72, 2.0));
	const cx = lerp(sx, 990 + 30 * u, pull) + whip * 1100, cy = lerp(MS.stage, 560, pull), z = lerp(2.6, 1.06, pull);
	const lean = 34 + 4 * ease(seg(u, 0.5, 1.0)), bloom = (i: number) => eo(seg(u, 0.65 + 0.7 * rnd(i, 45), 0.95 + 0.7 * rnd(i, 45)));
	return <g>
		<Sky id="c3s" stops={[[0, '#1a2024'], [0.66, '#242b2f'], [0.67, '#15191b'], [1, '#0d0f11']]} />
		<Cam cx={cx} cy={cy} z={z}>
			{Array.from({length: 6}, (_, i) => <rect key={i} x={i * 380 - 100} y={0} width={3} height={720} fill="#3a4448" opacity={0.5} />)}
			<rect x={150} y={110} width={300} height={400} fill="#2a3a40" /><rect x={150} y={110} width={300} height={400} fill="none" stroke="#0c1012" strokeWidth={14} /><path d="M300,110 V510 M150,310 H450" stroke="#0c1012" strokeWidth={8} />
			<Shaft id="c3sh" a={[150, 510]} b={[450, 510]} c={[900, 1000]} d={[400, 1000]} col="#dde6ea" o={0.08} />
			<Shelf x={1180} y={190} w={720} kind="jars" col="#0e1214" tone="#252c30" seed={4} />
			<Pendant x={1080} y={150} len={200} id="c3p" o={0.7} col="#e8ece8" />
			<Motes t={t} x={300} y={500} w={700} h={400} n={18} o={0.3} />
			<rect x={420} y={700} width={1500} height={18} fill="#3a4044" /><rect x={460} y={718} width={16} height={260} fill="#262a2d" /><rect x={1840} y={718} width={16} height={260} fill="#262a2d" />
			<Glow x={MS.x} y={MS.stage + 10} r={300} c={B.halo} o={0.15 + 0.3 * slide} id="c3a" />
			{/* final pass: the scope scaled to the sitter (eyepiece at her eye), a lab stool under her */}
			<g transform={`translate(${MS.x},700) scale(${MS.s})`} fill="#0e1012"><rect x={-110} y={-24} width={220} height={24} rx={6} /><path d="M40,-24 L60,-24 L70,-260 Q60,-300 20,-300 L10,-260 Z" /><rect x={-80} y={-110} width={160} height={14} rx={4} />
				<rect x={-40} y={-330} width={56} height={170} rx={10} transform="rotate(-24 0 -250)" /><rect x={-70} y={-360} width={40} height={60} rx={8} transform="rotate(-24 0 -250)" /><rect x={-18} y={-170} width={20} height={56} /></g>
			{/* the glass slide */}
			<g transform={`translate(${sx},${MS.stage - 3}) scale(0.62)`}><rect x={-80} y={-6} width={160} height={10} rx={2} fill="#d8e8ec" opacity={0.55} /><rect x={-22} y={-7} width={44} height={11} fill={B.mid} /><Glow x={0} y={-2} r={70} c={B.core} o={0.6 + 0.3 * slide} id="c3g" /></g>
			<g transform="translate(760,912)" fill="#1a1e20"><rect x={-70} y={-180} width={140} height={14} rx={5} /><rect x={-6} y={-166} width={12} height={130} /><path d="M-56,0 L-4,-40 L4,-40 L56,0" stroke="#1a1e20" strokeWidth={8} fill="none" /><rect x={-36} y={-70} width={72} height={6} /></g>
			<Rimmed x={760} ground={912} h={620} pose={fkPose({hip: 0.37, lean, neck: 22, lt: 86, lk: 90, rt: 82, rk: 86, la: 44, le: 64, ra: lerp(36, 46, slide), re: 60})} look={LK.diamond} col="#121416" rim={RIMB} rimOp={0.6} />
			<g transform="translate(1500,470)"><circle r={210} fill="#120a08" /><circle r={210} fill="none" stroke="#3a3e42" strokeWidth={14} />
				<defs><clipPath id="c3c"><circle r={200} /></clipPath></defs>
				<g clipPath="url(#c3c)"><Glow x={0} y={0} r={260} c={B.halo} o={0.35 * bloom(0)} id="c3e" />{Array.from({length: 60}, (_, i) => <circle key={i} cx={(rnd(i, 41) - 0.5) * 400} cy={(rnd(i, 42) - 0.5) * 400} r={(6 + 10 * rnd(i, 43)) * bloom(i)} fill={i % 3 ? B.mid : B.core} opacity={0.55 + 0.4 * rnd(i, 44)} />)}</g>
				<path d="M-300,120 L-212,60" stroke="#3a3e42" strokeWidth={6} /></g>
			<g fill="#070909"><rect x={1230} y={630} width={40} height={70} rx={8} /><rect x={1238} y={618} width={24} height={14} /><rect x={1285} y={660} width={30} height={40} rx={6} /><rect x={1880} y={480} width={200} height={600} /></g>
		</Cam>
		<Streaks k={whip} />
	</g>;
};

/* ================= C4 7.75–9.75: across America (flat vector desert road) ================= */
const mesa = (y0: number, pts: [number, number][]) => `M-200,${y0} ` + pts.map(([x, y]) => `L${x},${y}`).join(' ') + ` L2400,${y0} L2400,1200 L-200,1200 Z`;
export const Highway: React.FC<{t: number}> = ({t}) => {
	const u = t - T.car, k = ease(seg(u, 0, 2.0)), s = lerp(1, 0.46, k), cyy = lerp(905, 742, k), push = ei(seg(u, 1.7, 2.0));
	const hw = (y: number) => 1240 * (y - 640) / 560, carX = 960 + 0.6 * hw(cyy + 100 * s);   // final pass: the car keeps to the right-hand lane
	const trunk: P2 = [carX, cyy - 8 * s];
	const cx = lerp(lerp(carX - 560, carX - 200, eo(seg(u, 0, 0.35))) + 20 * u, trunk[0], push), cy = lerp(540 - 10 * u, trunk[1], push), z = lerp(1.03 + 0.02 * u, 3.2, push);
	const vp: P2 = [960, 640], persp = (p: number, side: number): P2 => [vp[0] + side * 760 * p, vp[1] + 440 * p];
	return <g>
		<Sky id="c4s" stops={[[0, '#1c2530'], [0.38, '#38404a'], [0.53, '#6e6668'], [0.6, '#9a8a80']]} />
		<Cam cx={cx} cy={cy} z={z}>
			{Array.from({length: 30}, (_, i) => <circle key={i} cx={rnd(i, 61) * 2000} cy={rnd(i, 62) * 300} r={1 + rnd(i, 63)} fill="#e8eaf0" opacity={0.25 + 0.3 * rnd(i, 64)} />)}
			<Glow x={1240} y={630} r={520} c="#d8b8a0" o={0.18} id="c4h" />
			{[[300, 300, 1.4], [1100, 230, 1.8], [1650, 360, 1.1], [700, 420, 0.9]].map(([x, y, sc], i) => <Cloud key={i} x={x - u * 12 * (i + 1)} y={y} s={sc} col="#4a505a" o={0.55} />)}
			<path d={mesa(640, [[-200, 560], [140, 560], [170, 520], [420, 518], [450, 560], [700, 575], [1300, 590], [1420, 540], [1700, 536], [1730, 575], [2400, 585]])} fill="#4c4a52" />
			<path d="M140,560 L170,520 L420,518 L450,560 M1420,540 L1700,536" stroke="#e2c8b0" strokeWidth={2.5} fill="none" opacity={0.35} />
			<path d={mesa(660, [[-200, 620], [300, 612], [600, 628], [900, 636], [1100, 630], [1500, 610], [1900, 618], [2400, 625]])} fill="#34333a" />
			<rect x={-200} y={640} width={2600} height={600} fill="#24222a" />
			<path d={`M${vp[0] - 4},${vp[1]} L${vp[0] + 4},${vp[1]} L${vp[0] + 1240},1200 L${vp[0] - 1240},1200 Z`} fill="#1b1a1f" />
			<path d={`M${vp[0] - 3},${vp[1]} L${vp[0] - 1130},1150 M${vp[0] + 3},${vp[1]} L${vp[0] + 1130},1150`} stroke="#8a8478" strokeWidth={3} opacity={0.5} />
			{Array.from({length: 14}, (_, i) => { const p = ((i + u * 4.5) % 14) / 14, p2 = p + 0.025; const y1 = vp[1] + 440 * p * p * 1.25, y2 = vp[1] + 440 * p2 * p2 * 1.25, w = 2 + 10 * p;
				return <path key={i} d={`M${960 - w / 2},${y1} L${960 + w / 2},${y1} L${960 + w},${y2} L${960 - w},${y2} Z`} fill="#d8cfb8" opacity={0.7} />; })}
			{/* poles and signs streaming past */}
			{Array.from({length: 6}, (_, i) => { const p = ((i / 6 + u * 0.45) % 1), pp = p * p * 1.3, [x, y] = persp(pp, -1.55); return <rect key={i} x={x - 2 - 6 * pp} y={y - 420 * pp} width={4 + 12 * pp} height={420 * pp} fill="#141318" />; })}
			{[0.15, 1.15].map((a, i) => { const p = cl((u - a) / 1.0), pp = 0.1 + p * p * 1.6, [x, y] = persp(pp, 1.55); return p > 0 && p < 1 ? <g key={i} transform={`translate(${x},${y}) scale(${pp})`}><rect x={-6} y={-300} width={12} height={300} fill="#141318" /><rect x={-150} y={-420} width={300} height={150} rx={10} fill="#3e5450" stroke="#cfd4cc" strokeWidth={6} /><rect x={-110} y={-380} width={220} height={18} fill="#cfd4cc" opacity={0.7} /><rect x={-110} y={-340} width={150} height={14} fill="#cfd4cc" opacity={0.5} /></g> : null; })}
			{[0, 1, 2, 3, 4].map((i) => { const p = 0.05 + i * 0.22, [x, y] = persp(p, 1.95), [x2, y2] = persp(p + 0.22, 1.95); return <g key={i}><rect x={x - 3 - 3 * p} y={y - 300 * p - 40} width={6 + 6 * p} height={300 * p + 40} fill="#18171c" /><path d={`M${x},${y - 300 * p - 30} Q${(x + x2) / 2},${(y + y2) / 2 - 150 * (p + 0.1)} ${x2},${y2 - 300 * (p + 0.22) - 30}`} stroke="#18171c" strokeWidth={2} fill="none" /></g>; })}
			{/* the sedan from behind; light leaks from the trunk */}
			<g transform={`translate(${carX},${cyy}) scale(${s}) translate(0,${Math.sin(u * 18) * 1.5})`}>
				<ellipse cx={0} cy={118} rx={300} ry={26} fill="#000" opacity={0.35} />
				<path d="M-270,100 L-280,20 Q-276,-10 -240,-20 L-190,-120 Q-176,-140 -140,-142 L140,-142 Q176,-140 190,-120 L240,-20 Q276,-10 280,20 L270,100 Z" fill="#2f5250" />
				<path d="M-176,-118 Q-164,-130 -136,-130 L136,-130 Q164,-130 176,-118 L206,-36 L-206,-36 Z" fill="#1c2a2e" />
				<circle cx={-62} cy={-74} r={30} fill="#0c1012" /><path d="M-92,-36 Q-92,-60 -62,-62 Q-32,-60 -32,-36 Z" fill="#0c1012" />
				<circle cx={70} cy={-78} r={28} fill="#0c1012" /><path d="M42,-36 Q44,-60 70,-62 Q98,-60 98,-36 Z" fill="#0c1012" />
				<path d="M-190,-120 Q0,-150 190,-120" stroke="#cfd8d4" strokeWidth={3} fill="none" opacity={0.35} />
				<rect x={-240} y={-14} width={480} height={8} fill="#24484a" />
				<Glow x={0} y={-8} r={270} c={B.halo} o={0.55} id="c4t" /><rect x={-230} y={-10} width={460} height={4} fill={B.core} opacity={0.9} /><Glow x={0} y={-8} r={110} c={B.core} o={0.6} id="c4tc" />
				{[-227, 227].map((x) => <g key={x}><Glow x={x} y={23} r={90} c="#d86a58" o={0.45} id={`c4tl${x}`} /><rect x={x - 35} y={10} width={70} height={26} rx={4} fill="#d8705c" /><rect x={x - 26} y={15} width={52} height={8} rx={3} fill="#f4c0a8" opacity={0.8} /></g>)}
				<rect x={-70} y={40} width={140} height={34} rx={3} fill="#d8d4c4" opacity={0.85} />
				<rect x={-280} y={80} width={560} height={26} rx={8} fill="#1a2a2a" /><rect x={-250} y={100} width={80} height={30} rx={8} fill="#0c0e10" /><rect x={170} y={100} width={80} height={30} rx={8} fill="#0c0e10" />
			</g>
			<g fill="#0d0c10">{Array.from({length: 7}, (_, i) => <ellipse key={i} cx={-40 + i * 60} cy={1060 - 30 * Math.sin(i)} rx={70} ry={50 + 20 * rnd(i, 3)} />)}{Array.from({length: 6}, (_, i) => <ellipse key={`r${i}`} cx={1700 + i * 60} cy={1050 - 25 * Math.cos(i)} rx={66} ry={46 + 20 * rnd(i, 4)} />)}</g>
		</Cam>
		<Streaks k={0.9 * (1 - eo(seg(u, 0, 0.3)))} seed={3} />
	</g>;
};

/* ================= C5 9.75–12.25: today, a storage room; each cube flickers as scanned, none lights ================= */
const SHELF_Y = [300, 860];
export const Storage: React.FC<{t: number}> = ({t}) => {
	const fly = ei(seg(t, 12.0, 12.45)), u = t - T.room, k = eo(seg(u, 0, 0.7)), cx = lerp(640, 1240, u / 2.5), z = lerp(1.7, 1.12, k) + 0.03 * u, scanX = lerp(-200, 2700, u / 2.3);
	return <g>
		<Sky id="c5s" stops={[[0, '#10161a'], [0.7, '#182024'], [1, '#0c1012']]} />
		<Cam cx={cx} cy={540} z={z}>
			<Shaft id="c5sh" a={[-200, -100]} b={[200, -100]} c={[1500, 1200]} d={[800, 1200]} col="#d8e2e6" o={0.06} />
			<Pendant x={500} y={120} len={240} id="c5p1" o={0.55} col="#e0e6e6" /><Pendant x={1500} y={120} len={240} id="c5p2" o={0.55} col="#e0e6e6" />
			<Motes t={t} x={300} y={100} w={1400} h={800} n={30} o={0.25} col="#e8eef0" />
			{SHELF_Y.map((sy, r) => <g key={r}>
				<rect x={-400} y={sy} width={2800} height={16} fill="#2e383c" /><rect x={-400} y={sy + 16} width={2800} height={6} fill="#0a0e10" />
				{Array.from({length: 26}, (_, i) => { const x = -300 + i * 100, n = 100 + r * 26 + i, sc = Math.exp(-(((x - scanX) / 70) ** 2)), d = fly * (0.6 + 0.8 * rnd(n, 2)), dx = (960 - x) * d, dy = (480 - sy) * d;
					return <g key={i} transform={`translate(${dx},${dy}) rotate(${fly * 200 * (rnd(n, 3) - 0.5)} ${x} ${sy - 40})`} opacity={1 - sm(seg(fly, 0.75, 1))}>
						<rect x={x - 38} y={sy - 80} width={76} height={76} rx={7} fill="#6a4a42" opacity={0.42 + 0.35 * sc} stroke="#c49080" strokeOpacity={0.45 + 0.5 * sc} strokeWidth={2} />
						{sc > 0.05 && <Glow x={x} y={sy - 42} r={70} c={B.mid} o={0.35 * sc} id={`c5g${r}_${i}`} />}
						<Sticker x={x} y={sy - 42} n={n} s={0.55} o={0.4} />
					</g>; })}
			</g>)}
			{/* slide cabinets between the shelves */}
			{Array.from({length: 7}, (_, i) => <g key={i} transform={`translate(${-200 + i * 400},420)`}><rect x={0} y={0} width={340} height={300} fill="#1e2629" stroke="#2c363a" strokeWidth={3} />
				{Array.from({length: 12}, (_, j) => <g key={j}><rect x={14 + (j % 3) * 108} y={14 + Math.floor(j / 3) * 70} width={96} height={58} fill="#283236" /><rect x={44 + (j % 3) * 108} y={30 + Math.floor(j / 3) * 70} width={36} height={14} fill="#c8c2b4" opacity={0.6} /></g>)}</g>)}
			<rect x={scanX - 6} y={-200} width={12} height={1500} fill={B.core} opacity={0.12} /><Glow x={scanX} y={540} r={260} c="#e8eef0" o={0.08} id="c5sc" />
			<rect x={-500} y={-200} width={300} height={1500} fill="#070a0b" /><rect x={2350} y={-200} width={300} height={1500} fill="#070a0b" />
		</Cam>
	</g>;
};

/* ================= title rewind 12.25–14.75 → birth → compass (one house, one camera) ================= */
const NURSE_HEAD: P2 = [760, 742];
const kidP = fkPose({hip: 0.36, lean: 10, neck: 22, lt: 88, lk: 92, rt: 84, rk: 88, la: 52, le: 76, ra: 48, re: 80});
const KX = 1920;
/* owner note (flicker at film 20.4–21.3): the camera used to whip 2000 px along the wall in 0.9 s (≈236 px/frame, strobing).
   Now each room gets its own short, slow drift (240 units over ~1.2 s, peak ≈ 25 px/frame) and the two rooms cross-dissolve in
   the middle (demo 18.05–18.65 = film 20.55–21.15). From demo 19.25 on the compass-room camera is exactly what it was. */
const camNursery = (t: number) => ({cx: 900 + 30 * Math.sin(t * 0.3) + 240 * ease(seg(t, 17.6, 18.8)), cy: 600, z: 1.12 + 0.012 * (t - T.birth)});
const camCompass = (t: number) => { let cx = KX + 980 + 20 * Math.sin(t * 0.4) - 240 * (1 - ease(seg(t, 18.0, 19.25))), cy = 560, z = 1.05 + 0.01 * (t - T.comp);
	const push = ease(seg(t, 20.75, 21.55)), cp = compassAt(t); cx = lerp(cx, cp[0], push); cy = lerp(cy, cp[1], push); z = lerp(z, 3.4, push);
	return {cx, cy, z}; };
/** the nursery → compass-room dissolve (0 = nursery camera, 1 = compass-room camera) */
const roomMix = (t: number) => sm(seg(t, 18.05, 18.65));
const homeCam = (t: number): {cx: number; cy: number; z: number} => (roomMix(t) < 0.5 ? camNursery(t) : camCompass(t));
/** the father holds the compass out at the boy's eye level, the boy's hands take it; then the father's hand comes back to his knee
    (final pass, logic 18: no empty paddle hands hovering over the boy's head) */
const fatherP = (t: number) => { const k = ease(seg(t, 18.5, 19.2)), back = ease(seg(t, 19.95, 20.6));
	return fkPose({hip: 0.37, lean: lerp(lerp(4, 12, k), 8, back), neck: 14, lt: 86, lk: 90, rt: 82, rk: 86, la: 24, le: 56, ra: lerp(lerp(18, 62, k), 30, back), re: lerp(lerp(70, 34, k), 58, back)}); };
const compassAt = (t: number): P2 => { const fh = jointAt(fatherP(t), 'RHand', KX + 760, 910, 700), kh = jointAt(kidP, 'RHand', KX + 1080, 904, 430, true), k = ease(seg(t, 19.3, 19.9)); return [lerp(fh[0] + 18, kh[0] - 10, k), lerp(fh[1] - 14, kh[1] - 18, k)]; };
/** hands v3: the boy in the wide shot takes the compass into the same hold as the close-up K2 (mirrored, he faces left here):
    his right hand cups it from below, the left one steadies it from behind; his arms reach the hands by IK on the figure's bones */
const kidHoldAt = (t: number, cp: P2) => {
	const k = sm(seg(t, 19.7, 19.92)), r = 30, X = KX + 1080, G = 904, Hh = 430;
	const g0 = holdGeo({C: cp, r, hr: 0, m: -1, nE: cp, fE: cp}), nW = g0.W(NEAR_W), fW = g0.W(FAR_W);
	const J = (n: string) => jointAt(kidP, n, X, G, Hh, true), U = (p: P2): P2 => [(X - p[0]) / Hh, (G - p[1]) / Hh];
	const nE = ik(J('RSh'), nW, 0.194 * Hh, 0.135 * Hh, -1), fE = ik(J('LSh'), fW, 0.194 * Hh, 0.135 * Hh, -1);
	/* the figure's mitten is pulled back along the forearm so it ends at the wrist (inside the drawn forearm), never past the hand */
	const back = (e: P2, w: P2): P2 => { const dx = w[0] - e[0], dy = w[1] - e[1], l = Math.hypot(dx, dy) || 1, m = Math.min(0.066 * Hh, l * 0.6); return [w[0] - dx / l * m, w[1] - dy / l * m]; };
	const held: Pose = {...kidP, RElb: U(nE), RHand: U(back(nE, nW)), LElb: U(fE), LHand: U(back(fE, fW))};
	return {k, pose: k > 0 ? mixPose(kidP, held, k) : kidP, g: holdGeo({C: cp, r, hr: 0, m: -1, nE, fE, ww: 0.3})};
};
/** a plain brass compass: no red, the north tip is dark oxide */
export const Compass44: React.FC<{x: number; y: number; r: number; a: number; rot?: number; glow?: number; id: string; halo?: boolean}> = ({x, y, r, a, rot = 0, glow = 0, id, halo = true}) => <g transform={`translate(${x},${y})`}>
	{halo && glow > 0 && <Glow x={0} y={0} r={r * 3.4} c={B.mid} o={0.5 * glow} id={`${id}g`} />}
	<g transform={`rotate(${rot})`}><circle r={r * 1.08} fill="#6e5426" /><circle r={r} fill="#ad8a4a" /><circle r={r * 0.86} fill="#efe6d0" />
		{Array.from({length: 16}, (_, i) => { const q = i * Math.PI / 8, l = i % 4 ? 0.08 : 0.16; return <line key={i} x1={Math.cos(q) * r * 0.84} y1={Math.sin(q) * r * 0.84} x2={Math.cos(q) * r * (0.84 - l)} y2={Math.sin(q) * r * (0.84 - l)} stroke="#5a4020" strokeWidth={r * 0.03} />; })}
		<text x={0} y={-r * 0.48} textAnchor="middle" style={{fontFamily: "'DejaVu Serif',serif", fontSize: r * 0.2, fontWeight: 700}} fill="#5a4020">N</text>
		<rect x={-r * 0.12} y={-r * 1.3} width={r * 0.24} height={r * 0.24} rx={r * 0.08} fill="#6e5426" /></g>
	<g transform={`rotate(${a})`}><path d={`M0,${-r * 0.72} L${r * 0.1},0 L${-r * 0.1},0 Z`} fill="#5a3a30" /><path d={`M0,${r * 0.72} L${r * 0.1},0 L${-r * 0.1},0 Z`} fill="#8a929c" /><circle cy={-r * 0.68} r={r * 0.035} fill={B.core} opacity={glow} /></g>
	<circle r={r * 0.06} fill="#6e5426" />
	<path d={`M${-r * 0.6},${-r * 0.5} Q${-r * 0.2},${-r * 0.8} ${r * 0.3},${-r * 0.72}`} stroke="#fff" strokeWidth={r * 0.05} opacity={0.4} fill="none" />
</g>;
/** baby in a cradle (final pass, logic 12): lying on its back, head on the pillow at left, face in profile looking up, an ear,
    a small body under the blanket; the oversized, angular back of the head stays as the joke */
const BABY_HEAD = 'M-62,40 L-92,4 L-84,-46 L-46,-84 L6,-86 Q40,-80 50,-56 L53,-44 Q66,-36 62,-27 L55,-23 Q60,-16 55,-9 Q58,-4 52,2 Q48,14 38,18 Q24,32 6,38 L-14,52 Z';
const Baby: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => <g transform={`translate(${x},${y})`}>
	<path d="M-120,30 Q-110,-6 -40,0 Q10,2 40,26 Z" fill="#cbbfae" opacity={0.55} />
	{/* the body under the blanket: shoulders, tummy, knees, feet */}
	<path d="M30,26 Q34,-46 92,-50 Q140,-58 176,-44 Q214,-62 248,-46 Q270,-40 276,-22 Q296,-20 292,4 L288,26 Z" fill="#cbbfae" opacity={0.92} />
	<path d="M44,-30 Q120,-50 176,-38 Q214,-56 250,-40" stroke="#efe6d8" strokeWidth={3} fill="none" opacity={0.6} />
	<path d="M60,-20 Q70,-12 64,0 M150,-30 Q160,-16 152,0 M226,-36 Q236,-20 230,0" stroke="#9a8e7e" strokeWidth={2} fill="none" opacity={0.6} />
	<g transform="translate(-14,-70) rotate(-90) scale(1.12)">
		<path d={BABY_HEAD} fill="#140f0d" />
		<path d="M-62,40 L-92,4 L-84,-46 L-46,-84 L6,-86 Q40,-80 50,-56 L53,-44 Q66,-36 62,-27" stroke={RIMB} strokeWidth={3} fill="none" opacity={0.7} />
		<path d="M-16,-6 Q-4,-14 2,0 Q0,12 -12,10" stroke={RIMB} strokeWidth={2.5} fill="none" opacity={0.5} />
	</g>
	{/* round 2: the back of the skull is the lower part (face up, the crown to the left): behind the ear, not on it */}
		<InHead id="bbgk" shape={() => <g transform="translate(-14,-70) rotate(-90) scale(1.12)"><path d={BABY_HEAD} fill="#fff" stroke="#000" strokeWidth={9} /></g>}><HeadGlow x={-30} y={-24} r={18 + 2 * Math.sin(t * 3)} id="bbg" /></InHead>
</g>;
export const House: React.FC<{t: number; hold?: number}> = ({t, hold = 0}) => {
	const {cx, cy, z} = homeCam(t), nurse = sm(seg(t, 13.95, 14.6)), rew = 1 - nurse, mix = roomMix(t);
	/* final pass (logic 12): she kneels by the cradle, leans in, and on the shock pulls back with a hand to her mouth and one to her chest;
	   then she reaches back to the cradle's rim (her hand stays on the cradle through the pan) */
	const k1 = ease(seg(t, 15.0, 15.7)), k2 = ease(seg(t, 16.25, 16.5)), k3 = ease(seg(t, 17.2, 17.9));
	const mp = (a: number, b: number, c: number, d: number) => lerp(lerp(lerp(a, b, k1), c, k2), d, k3);
	const momP = fkPose({hip: 0.36, lt: 94, lk: 94, rt: 0, rk: 90, lean: mp(14, 44, -10, 26), neck: mp(10, 14, -10, 14), la: mp(20, 38, 72, 34), le: mp(30, 6, 152, 8), ra: mp(24, 18, -30, -10), re: mp(30, 30, 148, 120)});
	const rock = Math.sin(t * 2.2) * 1.6, kGlow = t < T.think ? 0.5 : 1, cp = compassAt(t);
	const kidHold = kidHoldAt(t, cp);
	const needle = 18 + 28 * Math.sin(t * 2.6) * Math.exp(-Math.max(0, t - 19.9) * 0.9) * seg(t, 19.3, 19.6);
	const set = (c: {cx: number; cy: number; z: number}) => (
			<Cam cx={c.cx} cy={c.cy} z={c.z}>
				<rect x={-400} y={0} width={4600} height={660} fill="#45342b" /><rect x={-400} y={660} width={4600} height={700} fill="#271c16" />
				<Wallpaper id="hwp" x={-400} y={0} w={4600} h={500} col="#5e4a3c" o={0.5} />
				<rect x={-400} y={500} width={4600} height={160} fill="#3a2b22" /><rect x={-400} y={494} width={4600} height={10} fill="#2a1e16" />{Array.from({length: 26}, (_, i) => <rect key={i} x={-380 + i * 180} y={520} width={150} height={120} fill="none" stroke="#2c2018" strokeWidth={4} />)}
				<ellipse cx={KX + 920} cy={905} rx={460} ry={42} fill="#33241c" opacity={0.8} /><ellipse cx={860} cy={950} rx={420} ry={38} fill="#33241c" opacity={0.7} />
				{/* nursery: window with morning light, the cradle, the mother */}
				<rect x={240} y={170} width={300} height={360} fill="#5a6a72" opacity={0.7} /><rect x={240} y={170} width={300} height={360} fill="none" stroke="#2a1e16" strokeWidth={16} /><path d="M390,170 V530 M240,350 H540" stroke="#2a1e16" strokeWidth={9} />
				<Curtain x={170} y={160} w={100} h={430} /><Curtain x={510} y={160} w={100} h={430} flip />
				<Shaft id="hsh" a={[240, 530]} b={[540, 530]} c={[760, 950]} d={[150, 950]} col="#efe2cc" o={0.12} />
				<Motes t={t} x={180} y={520} w={540} h={420} n={22} o={0.45} />
				<Frame x={990} y={200} w={110} h={140} oval /><Frame x={1500} y={250} w={140} h={110} />
				<g transform={`rotate(${rock} 860 930)`}>
					<path d="M640,930 Q860,975 1080,930" stroke="#2a1e16" strokeWidth={14} fill="none" />
					<path d="M660,780 L1060,780 L1040,900 Q860,930 680,900 Z" fill="#5a4030" /><path d="M660,780 L1060,780" stroke="#7a5a40" strokeWidth={8} />
					{Array.from({length: 9}, (_, i) => <rect key={i} x={690 + i * 42} y={790} width={8} height={100} fill="#3e2c20" />)}
					<path d="M640,640 Q640,600 700,600 L720,780 L660,780 Z" fill="#4a3426" />
					<Baby x={NURSE_HEAD[0] + 6} y={NURSE_HEAD[1] + 20} t={t} />
				</g>
				<Rimmed x={1250} ground={935} h={660} pose={momP} look={LK.mother} flip col="#140f0c" rim="#ffd8a8" rimOp={0.45} rimDx={2.4} />
				<g opacity={sm(seg(t, 16.0, 16.4))}><path d="M600,560 Q630,640 690,690" stroke={INK} strokeWidth={4} fill="none" strokeDasharray="10 8" /><path d="M690,690 l-18,-4 l10,-14 Z" fill={INK} />
					<text x={560} y={540} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 40}} fill={INK} stroke="rgba(12,8,5,0.6)" strokeWidth={5} paintOrder="stroke">又大又方</text></g>
				{/* years later, the same house: the compass */}
				<g transform={`translate(${KX},0)`}>
					<Stove x={140} y={700} t={t} id="hst" /><Frame x={860} y={190} w={170} h={130} /><Frame x={1070} y={220} w={90} h={110} oval />
					<Curtain x={1250} y={200} w={100} h={430} /><Curtain x={1590} y={200} w={100} h={430} flip />
					<Shaft id="hsh2" a={[1320, 580]} b={[1620, 580]} c={[1500, 960]} d={[1000, 960]} col="#c8d0e0" o={0.07} />
					<rect x={1320} y={220} width={300} height={360} fill="#1e2636" /><rect x={1320} y={220} width={300} height={360} fill="none" stroke="#2a1e16" strokeWidth={16} /><path d="M1470,220 V580 M1320,400 H1620" stroke="#2a1e16" strokeWidth={9} />
					<g transform="translate(560,640)"><rect x={-120} y={0} width={240} height={14} fill="#3a2a1e" /><rect x={-100} y={14} width={12} height={250} fill="#3a2a1e" /><rect x={88} y={14} width={12} height={250} fill="#3a2a1e" />
						<path d="M-24,0 L-18,-60 Q0,-80 18,-60 L24,0 Z" fill="#8a6a3a" /><Glow x={0} y={-90} r={170 + 6 * Math.sin(t * 7)} c="#ffd28a" o={0.45} id="hk" /><ellipse cx={0} cy={-92} rx={10} ry={20 + Math.sin(t * 9)} fill="#ffe2a8" /></g>
					<g transform="translate(740,912)"><rect x={-70} y={-262} width={140} height={14} fill="#2a1e16" /><rect x={-60} y={-248} width={10} height={248} fill="#2a1e16" /><rect x={50} y={-248} width={10} height={248} fill="#2a1e16" /></g>
					<g transform="translate(1084,904)"><rect x={-58} y={-158} width={116} height={14} rx={4} fill="#2a1e16" /><rect x={-48} y={-144} width={10} height={144} fill="#2a1e16" /><rect x={38} y={-144} width={10} height={144} fill="#2a1e16" /></g>
				</g>
				<Rimmed x={KX + 760} ground={910} h={700} pose={fatherP(t)} look={LK.father} col="#140f0c" rim="#ffd8a8" rimOp={0.45} />
				<Rimmed x={KX + 1080} ground={904} h={430} pose={kidHold.pose} look={LK.child} flip col="#120e12" rim={RIMB} rimOp={0.7} rimDx={2.4} />
				{(() => { const c = skullBack(kidP, KX + 1080, 904, 430, true, GLOW_BACK); return <InHead id="kgk" e={skullEllipse(kidP, KX + 1080, 904, 430, true)}><HeadGlow x={c[0]} y={c[1]} r={21.5} id="kg" o={kGlow} /></InHead>; })()}
				{/* hands v3: once the compass lands, the boy holds it as in the close-up (cupped near hand under it, the other behind) */}
				<Glow x={cp[0]} y={cp[1]} r={30 * 3.4} c={B.mid} o={0.2} id="hcg" />
				{kidHold.k > 0 && <g opacity={kidHold.k}><HoldHands g={kidHold.g} layer="back" col="#120e12" rim={0.55} sw={0.9} /></g>}
				<Compass44 x={cp[0]} y={cp[1]} r={30} a={needle} glow={0.4} id="hc" halo={false} />
				{kidHold.k > 0 && <g opacity={kidHold.k}><HoldHands g={kidHold.g} layer="front" col="#120e12" rim={0.55} sw={0.9} /></g>}
				<g fill="#0b0807"><path d="M30,1100 L40,780 Q120,740 200,780 L210,1100 Z" /><rect x={20} y={900} width={220} height={26} rx={6} />
					<g transform={`translate(${KX + 1800},1080)`}><rect x={-60} y={-110} width={120} height={110} rx={10} />{Array.from({length: 7}, (_, i) => <ellipse key={i} cx={Math.cos(i) * 70} cy={-150 - 60 * rnd(i, 2)} rx={60} ry={22} transform={`rotate(${-40 + i * 14} 0 -110)`} />)}</g></g>
			</Cam>
	);
	return <g>
		{nurse > 0 && <g opacity={nurse}>
			<Sky id="hs" stops={[[0, '#3a2c26'], [0.6, '#4a382e'], [0.61, '#2c201a'], [1, '#1a1410']]} />
			{mix > 0 && set(mix < 1 ? camCompass(t) : {cx, cy, z})}
			{mix < 1 && <g opacity={1 - mix}>{set(mix > 0 ? camNursery(t) : {cx, cy, z})}</g>}
		</g>}
		{rew > 0 && <Rewind t={t} o={rew} cam={{cx, cy, z}} hold={hold} />}
	</g>;
};
/* round 2 (owner note 2): a two-line title. Line 1 (smaller) 「假如说你是」, line 2 (big) 「爱因斯坦的大脑」. 你 stays rose-gold.
   The alternative line 1 「假如你是」 can be set for a comparison still through globalThis.__EP44_T1 (set before this module loads). */
export const TITLE_L1: string = (globalThis as {__EP44_T1?: string}).__EP44_T1 ?? '假如说你是';
export const TITLE_L2 = '爱因斯坦的大脑';
/** every title character with its slot: line, x offset (from the title centre), size; flies in in reading order */
const TITLE_CH = (() => { const o: {ch: string; x: number; y: number; fs: number; rose: boolean}[] = [];
	TITLE_L1.split('').forEach((ch, j) => o.push({ch, x: (j - (TITLE_L1.length - 1) / 2) * 76, y: -132, fs: 70, rose: ch === '你'}));
	TITLE_L2.split('').forEach((ch, j) => o.push({ch, x: (j - (TITLE_L2.length - 1) / 2) * 118, y: 0, fs: 112, rose: false}));
	return o; })();
/** the stagger is spread so the last character lands when the old 9-character title's last one did (fly-in timing unchanged) */
const TITLE_STEP = 0.24 / (TITLE_CH.length - 1);
/** the title rewind. `hold` = film seconds the master has paused the story clock for (final pass: the title lands by film ≈14.0
    and holds ≥ 2.5 s); continuous motion (streaks, rays, breathing, the slow push) runs on ua = u + hold so the picture never freezes. */
const Rewind: React.FC<{t: number; o: number; cam: {cx: number; cy: number; z: number}; hold?: number}> = ({t, o, cam, hold = 0}) => {
	const u = t - T.title, ua = u + hold, fuse = sm(seg(u, 0.85, 1.15)), go = ease(seg(t, 13.95, 14.6)), hd = scr(NURSE_HEAD, cam.cx, cam.cy, cam.z);
	const push = 1 + 0.011 * Math.max(0, ua - 1.0) * (1 - go), breathe = 1 + 0.035 * Math.sin((ua - 1.1) * 2.3) * seg(u, 1.0, 1.4);
	const bx = lerp(960, hd[0], go), by = lerp(430, hd[1] - 30, go), bs = lerp((0.6 + 0.04 * Math.min(u, 1.5)) * breathe * push, 0.09, go);
	const rays = fuse * (1 - go) * (0.85 + 0.15 * Math.sin(ua * 1.7));
	return <g opacity={o}>
		<Sky id="rws" stops={[[0, '#0c1316'], [1, '#1a2226']]} />
		{Array.from({length: 5}, (_, i) => { const y = ((i * 260 - ua * 900 * (1 - 0.75 * seg(u, 1.1, 1.5))) % 1300 + 1300) % 1300 - 100; return <rect key={i} x={0} y={y} width={W} height={18 + 10 * rnd(i, 2)} fill="#c8d4d8" opacity={0.05} />; })}
		{/* slow light rays turning behind the fused brain (the hold keeps moving) */}
		{rays > 0.01 && <g transform={`translate(${bx},${by}) rotate(${ua * 7})`} opacity={rays}>{Array.from({length: 14}, (_, i) => { const a = i * Math.PI / 7, w = 0.06 + 0.03 * rnd(i, 21), L = 1300 * (0.8 + 0.3 * rnd(i, 22));
			return <path key={i} d={`M0,0 L${Math.cos(a - w) * L},${Math.sin(a - w) * L} L${Math.cos(a + w) * L},${Math.sin(a + w) * L} Z`} fill={B.mid} opacity={0.07 + 0.04 * rnd(i, 23)} />; })}</g>}
		{Array.from({length: 34}, (_, i) => { const a = rnd(i, 1) * Math.PI * 2, d = 320 + 600 * rnd(i, 2), x = 960 + Math.cos(a) * d, y = 430 + Math.sin(a) * d * 0.6, k = seg(u, 0.05, 0.9);
			return <line key={i} x1={x} y1={y} x2={lerp(x, 960, 0.2 + 0.4 * k)} y2={lerp(y, 430, 0.2 + 0.4 * k)} stroke={B.mid} strokeWidth={3 + 4 * rnd(i, 3)} opacity={0.45 * (1 - fuse * 0.7) * (1 - go)} strokeLinecap="round" />; })}
		{Array.from({length: 30}, (_, i) => { const a = rnd(i, 4) * Math.PI * 2, d0 = 700 + 500 * rnd(i, 5), k = ei(seg(u, 0.05 + 0.25 * rnd(i, 6), 1.0 + 0.1 * rnd(i, 6))), d = lerp(d0, 0, k), x = 960 + Math.cos(a) * d, y = 430 + Math.sin(a) * d * 0.6, sz = lerp(70, 26, k);
			return k < 0.99 ? <g key={i} transform={`translate(${x},${y}) rotate(${(1 - k) * 300 * (rnd(i, 7) - 0.5)})`}>
				<line x1={0} y1={0} x2={Math.cos(a) * 120 * (1 - k)} y2={Math.sin(a) * 72 * (1 - k)} stroke={B.mid} strokeWidth={4} opacity={0.4} />
				<rect x={-sz / 2} y={-sz / 2} width={sz} height={sz} rx={6} fill={B.mid} opacity={0.8} stroke={B.core} strokeWidth={2} />
				{sz > 44 && <Sticker x={0} y={0} n={1 + Math.floor(rnd(i, 8) * 240)} s={sz / 90} />}</g> : null; })}
		<g opacity={fuse}>
			<Glow x={bx} y={by} r={300 * bs / 0.6} c={B.halo} o={0.45 * (0.9 + 0.1 * breathe)} id="rwh" />
			<g transform={`translate(${bx},${by}) scale(${bs})`}>
				<path d={BRAIN_D} fill={B.mid} opacity={0.42} /><path d={BRAIN_D} fill="none" stroke={B.core} strokeWidth={7 / Math.max(0.3, bs / 0.6)} />
				{['M-220,-40 C-160,-90 -100,-60 -60,-110', 'M-40,-160 C0,-110 60,-150 110,-120', 'M140,-60 C180,-20 230,-60 250,0', 'M-200,60 C-140,30 -90,80 -30,50', 'M20,40 C70,0 120,60 170,30'].map((d, i) => <path key={i} d={d} stroke={B.core} strokeWidth={5} fill="none" opacity={0.55} strokeLinecap="round" />)}
			</g>
			<Glow x={bx} y={by} r={90 * bs / 0.6} c={B.core} o={0.6 * (1 - fuse) + 0.25} id="rwc" />
		</g>
		<rect width={W} height={H} fill={B.core} opacity={0.22 * Math.exp(-Math.max(0, u - 0.95) / 0.12) * seg(u, 0.85, 0.95)} />
		{/* the title: each character flies out of the fused light; all 9 settle by film ≈14.0, then hold at full size (slow push) until the hand-over */}
		<g transform={`translate(960,${812 - 30 * go}) scale(${push})`} opacity={1 - sm(seg(t, 14.35, 14.75))}>
			{TITLE_CH.map((c, i) => { const k = eo(seg(u, 0.7 + TITLE_STEP * i, 1.05 + TITLE_STEP * i)), sx = lerp(0, c.x, k), sy = lerp(-380, c.y, k);
				return k > 0 ? <text key={i} x={sx} y={sy} textAnchor="middle" opacity={k} style={{fontFamily: SANS, fontWeight: 900, fontSize: c.fs * lerp(0.4, 1, k)}} fill={c.rose ? ROSE : INK} stroke="rgba(12,8,5,0.6)" strokeWidth={c.fs > 100 ? 6 : 5} paintOrder="stroke">{c.ch}</text> : null; })}
			<Glow x={0} y={-40} r={640} c={B.mid} o={0.1 * seg(u, 0.8, 1.4)} id="rwt" />
		</g>
		<g opacity={(0.6 + 0.4 * Math.sin(u * 12)) * (1 - sm(seg(u, 1.25, 1.5)))}><path d="M240,190 l-60,36 l60,36 Z M310,190 l-60,36 l60,36 Z" fill={INK} /></g>
	</g>;
};

/* ================= K2 21.5–25.25: the needle, close; the boy holds it =================
   HANDS v3 (owner: the two earlier hand drawings were rejected): replicated from the reference picture (handref/ref_boy_mirrored).
   The boy sits at left in profile and looks down at the compass, which rests in his NEAR hand: a cupped palm under the case
   (palm up), the four fingers together as one band curled up around the far (right) edge, the thumb up along the near (left)
   edge. His OTHER hand is behind the case and steadies it from behind: only the back of that hand and its fingertips show at
   the upper left. Both forearms come straight out of his body (elbows by his sides). Plain one-tone silhouettes, smooth bezier
   outlines, the figure's own rim on the outer contour and a thin warm line only on the edges lying on the brass rim.
   The compass is a bit smaller than before (r 170 → 100) so a child's hand can hold it as in the reference; it sits a little
   closer to him (the same place relative to his face as in the reference). The case turns as before; the hands follow
   45 % of that turn (the boy tilts it in his hands), so the bow never reaches the fingers.
   EXPORTED FOR rough44b (F2–F4 reuse this exact shot): `K2Scene` (everything inside the camera), `k2Rot`, `k2Glow`, `K2_C`, `K2_R`. */
export const k2Rot = (t: number) => 38 * ease(seg(t, 21.7, 22.4)) - 70 * ease(seg(t, 22.7, 23.4)) + 22 * ease(seg(t, 23.6, 24.1));
const rotAt = k2Rot;
const SKIN = '#130e0d';
export const K2_C: P2 = [1010, 610];
export const K2_R = 100;
const K2_GLOW = 520;   // the compass glow radius (kept at the old size so the room is lit as before)
const HROT = 0.45;     // the hands follow this share of the case's turn
const KH = 1860, KX0 = 0, KG = 1400, K2LOOK: Look4 = {dress: 'tunic', head: 'child', build: 0.86};   // the boy's rig: authored in world coordinates, converted to body units
/* his arms (world): shoulders, and the elbows by his sides */
const K2_NS: P2 = [505, 500], K2_FS: P2 = [525, 490], K2_NE: P2 = [690, 790], K2_FE: P2 = [680, 700];
/** two-bone IK: the elbow for shoulder s, wrist w, bone lengths a (upper) and b (fore); side = +1 / -1 picks the bend */
const ik = (s: P2, w: P2, a: number, b: number, side = 1): P2 => { const dx = w[0] - s[0], dy = w[1] - s[1], d = Math.min(a + b - 1, Math.max(Math.abs(a - b) + 1, Math.hypot(dx, dy))), A = Math.acos(cl((a * a + d * d - b * b) / (2 * a * d), -1, 1)), g = Math.atan2(dy, dx) + side * A;
	return [s[0] + Math.cos(g) * a, s[1] + Math.sin(g) * a]; };

/* ---------- the holding hands (shared by K2 and the wide house shot) ----------
   Compass-local units of r (the case is r 1.08), y down, the holder sits on the -x side (m = -1 mirrors for a holder on the right). */
type Cmd = [string, ...P2[]];
const NEAR_W: P2 = [-1.15, 0.78], FAR_W: P2 = [-1.28, -0.22];   // wrist centres
const pol = (deg: number, R: number): P2 => [Math.cos(deg * Math.PI / 180) * R, Math.sin(deg * Math.PI / 180) * R];
type Hold = {C: P2; r: number; hr: number; m: number; nE: P2; fE: P2; nS?: P2; fS?: P2; ww?: number};
const holdGeo = (h: Hold) => {
	const q = h.hr * Math.PI / 180, cq = Math.cos(q), sq = Math.sin(q), ww = h.ww ?? 0.22;
	const W = (p: P2): P2 => { const x = p[0] * h.m, y = p[1]; return [h.C[0] + (x * cq - y * sq) * h.r, h.C[1] + (x * sq + y * cq) * h.r]; };   // local → world
	const L = (p: P2): P2 => { const x = (p[0] - h.C[0]) / h.r, y = (p[1] - h.C[1]) / h.r; return [(x * cq + y * sq) * h.m, -x * sq + y * cq]; };   // world → local
	const fw = (p: P2) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
	const path = (cmds: Cmd[]) => cmds.map(([c, ...ps]) => c + ps.map((p) => fw(W(p))).join(' ')).join(' ');
	/* the wrist edge follows the real forearm direction (elbow → wrist), so hand and forearm always meet cleanly */
	const wrist = (wc: P2, e: P2) => { const el = L(e), dx = wc[0] - el[0], dy = wc[1] - el[1], l = Math.hypot(dx, dy) || 1, d: P2 = [dx / l, dy / l], up: P2 = [d[1], -d[0]];
		return {t: [wc[0] + up[0] * ww, wc[1] + up[1] * ww] as P2, b: [wc[0] - up[0] * ww, wc[1] - up[1] * ww] as P2,
			t0: [wc[0] + up[0] * ww - d[0] * 0.25, wc[1] + up[1] * ww - d[1] * 0.25] as P2, b0: [wc[0] - up[0] * ww - d[0] * 0.25, wc[1] - up[1] * ww - d[1] * 0.25] as P2}; };
	const n = wrist(NEAR_W, h.nE), f = wrist(FAR_W, h.fE);
	/* NEAR hand, palm up under the case: heel, palm bottom, the finger band up the far edge, its tip curled over the rim,
	   the band's inner edge down along the brass, (behind the case) across to the thumb, the thumb up the near edge */
	const FING_IN: Cmd[] = [['C', [0.97, 0.0], [0.92, 0.35], [0.7, 0.66]]], FING_TIP: Cmd[] = [['C', [1.12, -0.3], [0.98, -0.36], [0.9, -0.24]]];
	const FING_OUT: Cmd[] = [['C', [1.22, 0.58], [1.27, 0.2], [1.18, -0.1]]];
	const TH_IN: Cmd[] = [['C', [-0.88, 0.5], [-0.95, 0.3], [-0.93, 0.12]], ['C', [-0.92, 0.0], [-1.06, -0.05], [-1.13, 0.05]]];
	const TH_OUT: Cmd[] = [['C', [-1.21, 0.2], [-1.24, 0.45], n.t]];
	const nearBack = path([['M', n.t0], ['L', n.b0], ['L', n.b], ['C', [-0.8, 1.1], [-0.45, 1.28], [0.0, 1.3]], ['C', [0.45, 1.32], [0.85, 1.2], [1.06, 0.85]],
		...FING_OUT, ...FING_TIP, ...FING_IN, ['L', [-0.7, 0.66]], ...TH_IN, ...TH_OUT, ['Z']]);
	const nearFront = path([['M', [1.06, 0.85]], ...FING_OUT, ...FING_TIP, ...FING_IN, ['L', [0.56, 0.97]], ['Z']]) + ' ' +
		path([['M', [-0.7, 0.66]], ...TH_IN, ...TH_OUT, ['L', [-0.62, 0.92]], ['Z']]);
	/* FAR hand, behind the case (it steadies it from behind): its wrist comes in at the left, and only the back of the hand and the
	   four fingertips, side by side, show just past the upper-left rim (kept clear of the bow at the top for every turn) */
	const FAR_EDGE: Cmd[] = [['L', pol(-121, 0.98)], ['Q', pol(-121, 1.14), pol(-122, 1.17)]];
	const farBack = path([['M', f.t0], ['L', f.b0], ['L', f.b], ['C', [-1.0, -0.2], [-0.85, -0.3], [-0.7, -0.45]], ...FAR_EDGE,
		['Q', pol(-127, 1.31), pol(-132, 1.18)], ['Q', pol(-137, 1.32), pol(-142, 1.19)], ['Q', pol(-147, 1.32), pol(-152, 1.21)],
		['C', pol(-157, 1.31), pol(-162, 1.36), f.t], ['Z']]);
	/* the arms: shoulder → elbow → wrist (K2), or just the forearm (the wide shot draws the figure's own arms) */
	const arm = (s: P2 | undefined, e: P2, wc: P2) => { const w = W(wc), pts: P2[] = [], wd: number[] = [], r = h.r;
		if (s) for (let i = 0; i < 4; i++) { pts.push([lerp(s[0], e[0], i / 4), lerp(s[1], e[1], i / 4)]); wd.push(lerp(0.46, 0.4, i / 4) * r); }
		for (let i = 0; i <= 5; i++) { pts.push([lerp(e[0], w[0], i / 5), lerp(e[1], w[1], i / 5)]); wd.push(lerp(0.4, ww + 0.02, (i / 5) ** 0.8) * r); }
		return limb(pts, wd); };
	const arms = `${arm(h.fS, h.fE, FAR_W)} ${arm(h.nS, h.nE, NEAR_W)}`;
	return {W, back: `${arms} ${farBack} ${nearBack}`, front: nearFront,
		rimBack: path([['M', pol(-121, 0.98)], ...FAR_EDGE, ['Q', pol(-127, 1.31), pol(-132, 1.18)]]),   // under the case: the far fingers' edge facing the glow
		rimFront: path([['M', [1.18, -0.1]], ...FING_TIP, ...FING_IN]) + ' ' + path([['M', [-0.7, 0.66]], ...TH_IN])};
};
/** a smooth closed outline around a chain of points with per-point half-widths (as figure44's chain, one width each side) */
const limb = (pts: P2[], wd: number[]) => {
	const A: P2[] = [], Bs: P2[] = [];
	for (let i = 0; i < pts.length; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
		A.push([pts[i][0] + nx * wd[i], pts[i][1] + ny * wd[i]]); Bs.push([pts[i][0] - nx * wd[i], pts[i][1] - ny * wd[i]]); }
	const ring = [...A, ...Bs.reverse()], f = (v: number) => v.toFixed(1);
	let d = `M${f((ring[0][0] + ring[1][0]) / 2)},${f((ring[0][1] + ring[1][1]) / 2)}`;
	for (let i = 1; i <= ring.length; i++) { const p = ring[i % ring.length], q = ring[(i + 1) % ring.length]; d += ` Q${f(p[0])},${f(p[1])} ${f((p[0] + q[0]) / 2)},${f((p[1] + q[1]) / 2)}`; }
	return d + ' Z';
};
/** the holding hands, drawn in two layers around the compass: 'back' (arms, palm, the far hand) and 'front' (thumb and finger band on the rim) */
const HoldHands: React.FC<{g: ReturnType<typeof holdGeo>; layer: 'back' | 'front'; col?: string; rim?: number; sw?: number}> = ({g, layer, col = SKIN, rim = 0.4, sw = 2}) => layer === 'back'
	? <g><path d={g.back} fill={col} /><path d={g.rimBack} fill="none" stroke={RIMB} strokeWidth={sw} strokeLinecap="round" opacity={rim * 0.7} /></g>
	: <g><path d={g.front} fill={col} /><path d={g.rimFront} fill="none" stroke={RIMB} strokeWidth={sw} strokeLinecap="round" opacity={rim} /></g>;

/** the boy's pose for `look` (0 = eyes on the needle, 1 = looking up from it); the figure's own arms are folded out of sight
    inside the torso (the holding arms are drawn by `holdGeo`) */
const k2Pose = (look: number): {pose: Pose; head: P2; glow: P2} => {
	const P = (p: P2): P2 => [(p[0] - KX0) / KH, (KG - p[1]) / KH], tilt = lerp(40, -4, look) * Math.PI / 180, u: P2 = [Math.sin(tilt), -Math.cos(tilt)];
	const n1: P2 = [520 - 14 * look, 480 - 12 * look], hd: P2 = [n1[0] + 115 * u[0], n1[1] + 115 * u[1]], top: P2 = [hd[0] + 123 * u[0], hd[1] + 123 * u[1]];
	const hc: P2 = [lerp(hd[0], top[0], 0.45), lerp(hd[1], top[1], 0.45)], f: P2 = [Math.cos(tilt), Math.sin(tilt)], back = GLOW_BACK * KH * 0.93;
	const hide = (s: P2) => ({sh: P(s), el: P([s[0] - 12, s[1] + 140]), ha: P([s[0] - 40, s[1] + 200])}), a = hide(K2_NS), b = hide(K2_FS);
	const pose: Pose = {Hips: P([390, 860]), LUp: P([405, 983]), LKnee: P([896, 1000]), LAnk: P([900, 1500]), LToe: P([1100, 1540]), RUp: P([395, 983]), RKnee: P([880, 1010]), RAnk: P([870, 1510]), RToe: P([1070, 1550]),
		Spine1: P([470 - 6 * look, 590]), Neck1: P(n1), Head: P(hd), Top: P(top), LSh: a.sh, LElb: a.el, LHand: a.ha, RSh: b.sh, RElb: b.el, RHand: b.ha};
	return {pose, head: hc, glow: [hc[0] - f[0] * back, hc[1] - f[1] * back]};
};
/** where the boy's head glow sits (the back of his skull) for a given look */
export const k2Glow = (look = 0): P2 => k2Pose(look).glow;
/** the boy's skull ellipse for a given look (the ending's extra glow is masked to it) */
export const k2Skull = (look = 0) => skullEllipse(k2Pose(look).pose, KX0, KG, KH);
/** K2's picture inside the camera: room, the seated boy (his own arms reach the compass), field lines, compass, his hands.
    t = demo clock (21.5–25.25); look = 0..1 he looks up; flare = the head glow; bright = extra glow (F4); fieldK = field-line opacity factor */
export const K2Scene: React.FC<{t: number; id: string; look?: number; flare: number; bright?: number; fieldK?: number; rimOp?: number}> = ({t, id, look = 0, flare, bright = 0, fieldK = 1, rimOp = 0.5}) => {
	const rot = rotAt(t), north = -8, needle = north + 0.85 * (rot - rotAt(t - 0.22)) + 6 * Math.sin(t * 9) * Math.exp(-((t - 23.45) ** 2) / 0.1);
	const C = K2_C, r = K2_R, tip: P2 = [C[0] + Math.sin(needle * Math.PI / 180) * r * 0.72, C[1] - Math.cos(needle * Math.PI / 180) * r * 0.72], fl = seg(t, 23.7, 24.6);
	const kp = k2Pose(look), f = Math.min(1, flare), rk = Math.max(1, KH / 450);
	const hg = holdGeo({C, r, hr: rot * HROT, m: 1, nE: K2_NE, fE: K2_FE, nS: K2_NS, fS: K2_FS});
	return <g>
		<Wallpaper id={`${id}w`} x={-300} y={-300} w={2600} h={1100} col="#5e4a3c" o={0.45} s={2.2} />
		<rect x={-300} y={800} width={2600} height={600} fill="#2e221b" /><rect x={-300} y={792} width={2600} height={14} fill="#241a14" />
		<Frame x={1480} y={-60} w={380} h={300} col="#241a14" /><Curtain x={-120} y={-200} w={300} h={1300} />
		<Glow x={1900} y={700} r={520} c="#ffcf9a" o={0.14} id={`${id}st`} />
		<Glow x={260} y={760} r={600} c="#ffd28a" o={0.16} id={`${id}l`} />
		<Motes t={t} x={300} y={100} w={1500} h={800} n={26} o={0.35} />
		{Array.from({length: 7}, (_, i) => <circle key={i} cx={1500 + rnd(i, 3) * 400} cy={200 + rnd(i, 4) * 400} r={30 + 40 * rnd(i, 5)} fill="#ffe2b0" opacity={0.04 + 0.04 * rnd(i, 6)} />)}
		{/* the figure's rim (as Rimmed), with the arms' rim in the same layer so it never lies over his body */}
		<g transform={`translate(${-2.2 * rk},${-1.6 * rk})`} opacity={rimOp}><Figure4 x={KX0} ground={KG} h={KH} pose={kp.pose} look={K2LOOK} col={RIMB} /><path d={hg.back} fill={RIMB} /></g>
		<Figure4 x={KX0} ground={KG} h={KH} pose={kp.pose} look={K2LOOK} col={SKIN} />
		{bright > 0 && <Glow x={kp.glow[0]} y={kp.glow[1]} r={420} c={B.mid} o={0.3 * bright} id={`${id}hb`} />}
		<InHead id={`${id}hk`} e={skullEllipse(kp.pose, KX0, KG, KH)}><HeadGlow x={kp.glow[0]} y={kp.glow[1]} r={66 + 24 * bright} id={`${id}h`} o={flare} /></InHead>
		{fl > 0 && <g opacity={fl * 0.8 * fieldK}>{Array.from({length: 7}, (_, i) => { const s = (i - 3) * 0.32, L = 900;
			return <path key={i} d={`M${tip[0]},${tip[1]} C${tip[0] + Math.sin(s) * 300},${tip[1] - 300} ${tip[0] + Math.sin(s) * L},${tip[1] - 200 - 300 * Math.cos(s)} ${tip[0] + Math.sin(s) * L * 1.4},${tip[1] + 200}`} stroke={B.core} strokeWidth={2} fill="none" strokeDasharray="14 12" strokeDashoffset={-t * 60} opacity={0.6 - Math.abs(i - 3) * 0.12} />; })}</g>}
		<Glow x={C[0]} y={C[1]} r={K2_GLOW} c={B.mid} o={0.5 * Math.min(1.2, flare)} id={`${id}cg`} />
		<HoldHands g={hg} layer="back" rim={rimOp * 0.9} />
		<Compass44 x={C[0]} y={C[1]} r={r} a={needle} rot={rot} glow={f} id={`${id}c`} halo={false} />
		<HoldHands g={hg} layer="front" rim={rimOp * 0.9} />
		<Glow x={tip[0]} y={tip[1]} r={45} c={B.core} o={0.6 * f} id={`${id}t`} />
	</g>;
};
/** the needle tip in world coordinates at demo time t (for the push-in) */
export const k2Tip = (t: number): P2 => { const rot = rotAt(t), needle = -8 + 0.85 * (rot - rotAt(t - 0.22)) + 6 * Math.sin(t * 9) * Math.exp(-((t - 23.45) ** 2) / 0.1);
	return [K2_C[0] + Math.sin(needle * Math.PI / 180) * K2_R * 0.72, K2_C[1] - Math.cos(needle * Math.PI / 180) * K2_R * 0.72]; };
export const Needle: React.FC<{t: number}> = ({t}) => {
	const u = t - T.think, flare = 0.55 + 0.45 * sm(seg(u, 0, 0.5)) + 0.1 * Math.sin(t * 4), C = K2_C, tip = k2Tip(t);
	const intro = eo(seg(u, 0, 0.5)), push = ease(seg(t, 24.3, 25.25));
	const cx = lerp(lerp(C[0] - 120, 1000, intro), tip[0], push), cy = lerp(lerp(C[1] - 60, 560, intro), tip[1], push), z = lerp(lerp(1.7, 1.06, intro) + 0.02 * u, 4.2, push);
	return <g>
		<Sky id="k2s" stops={[[0, '#4a3a30'], [0.7, '#3a2c24'], [1, '#2a201a']]} />
		<Cam cx={cx} cy={cy} z={z}><K2Scene t={t} id="k2" flare={flare} /></Cam>
	</g>;
};

/* ================= L1 25.25–28.5: 16, running beside a beam of light (flat vector meadow) ================= */
const hill = (base: number, a1: number, l1: number, a2: number, l2: number, off: number, ph: number) => { let d = '';
	for (let x = -240; x <= W + 240; x += 30) { const wx = x + off, y = base + a1 * Math.sin(wx / l1 + ph) + a2 * Math.sin(wx / l2 + ph * 2.3); d += `${x === -240 ? 'M' : 'L'}${x},${y.toFixed(1)} `; }
	return { fill: d + `L${W + 240},1400 L-240,1400 Z`, rim: d }; };
const LAYERS: {base: number; a1: number; l1: number; a2: number; l2: number; f: number; c: string; rim: number; ph: number; trees?: number}[] = [
	{base: 470, a1: 70, l1: 260, a2: 24, l2: 90, f: 0.06, c: '#566068', rim: 0.4, ph: 1},
	{base: 560, a1: 40, l1: 210, a2: 14, l2: 70, f: 0.18, c: '#434d50', rim: 0.32, ph: 2, trees: 0.6},
	{base: 650, a1: 34, l1: 170, a2: 10, l2: 60, f: 0.42, c: '#323b3a', rim: 0.28, ph: 3, trees: 1},
	{base: 790, a1: 22, l1: 140, a2: 8, l2: 50, f: 0.8, c: '#242b29', rim: 0.22, ph: 4},
];
export const Meadow: React.FC<{t: number}> = ({t}) => {
	const u = t - T.light, scroll = u * 760, ph = u * 2.3 * Math.PI * 2, rx = 1060, g = 960, h = 500;
	/* final pass (logic 21): 追着光跑 = a run, not a stroll: forward lean, high knees, bent arms pumping, a bounce */
	const sn = Math.sin(ph), runP = fkPose({hip: 0.6 + 0.025 * Math.abs(Math.cos(ph)), lean: 16, neck: -6, lt: 44 * sn + 6, lk: 18 + 70 * Math.max(0, Math.sin(ph - 1.2)), rt: -44 * sn + 6, rk: 18 + 70 * Math.max(0, Math.sin(ph - 1.2 + Math.PI)),
		lf: 10 * Math.max(0, -sn), rf: 10 * Math.max(0, sn), la: -40 * sn + 6, le: 88, ra: 40 * sn + 6, re: 88});
	const hc0 = skullBack(runP, rx, g, h, false, GLOW_BACK), q4 = 4 * Math.PI / 180, hcR: P2 = [rx + (hc0[0] - rx) * Math.cos(q4) - (hc0[1] - g) * Math.sin(q4), g + (hc0[0] - rx) * Math.sin(q4) + (hc0[1] - g) * Math.cos(q4)], hc = hc0, beamY = 600, bx = rx + 240 + 20 * Math.sin(u * 2.4);
	const intro = ease(seg(u, 0, 0.9)), push = ei(seg(t, 28.05, 28.5));
	const cx = lerp(lerp(bx, 960, intro) + 20 * u, hcR[0], push), cy = lerp(lerp(beamY, 540, intro), hcR[1], push)   /* the push lands on the glow as drawn (the runner is drawn rotated 4°) */, z = lerp(lerp(2.6, 1.02, intro) + 0.015 * u, 3.0, push);
	return <g>
		<Sky id="l1s" stops={[[0, '#1f2a33'], [0.42, '#3b4550'], [0.6, '#857a72'], [0.7, '#a5948a']]} />
		<Cam cx={cx} cy={cy} z={z}>
			<Glow x={1500} y={520} r={600} c="#e8cdb6" o={0.14} id="l1h" />
			{Array.from({length: 5}, (_, i) => <Cloud key={i} x={((i * 620 + 200 - scroll * 0.04) % 2600 + 2600) % 2600 - 300} y={140 + 80 * (i % 3)} s={1.1 + 0.5 * rnd(i, 3)} col="#5a6470" o={0.55} />)}
			{LAYERS.map((L, i) => { const hl = hill(L.base, L.a1, L.l1, L.a2, L.l2, scroll * L.f, L.ph);
				return <g key={i}><path d={hl.fill} fill={L.c} /><path d={hl.rim} stroke="#ead6c0" strokeWidth={2.5} fill="none" opacity={L.rim} />
					{L.trees && Array.from({length: 9}, (_, k) => { const sp = 360, wx0 = Math.floor((scroll * L.f) / sp) * sp + k * sp, x = wx0 - scroll * L.f - 200 + rnd(Math.floor(wx0 / sp), i) * 120, y = L.base + L.a1 * Math.sin((x + scroll * L.f) / L.l1 + L.ph) + L.a2 * Math.sin((x + scroll * L.f) / L.l2 + L.ph * 2.3), s = (L.trees ?? 1) * (0.7 + 0.6 * rnd(Math.floor(wx0 / sp), 9));
						if (i >= 1 && rnd(Math.floor(wx0 / sp), 17 + i) > 0.7) return <Farm key={k} x={x} y={y + 10} s={i === 1 ? 0.55 : 0.85} col={i === 1 ? '#3a4446' : '#2a3231'} />;
						return rnd(Math.floor(wx0 / sp), 4 + i) > 0.45 ? <g key={k} transform={`translate(${x},${y + 6}) scale(${s})`} fill={i === 1 ? '#3a4446' : '#2a3231'}><rect x={-4} y={-40} width={8} height={44} /><ellipse cx={0} cy={-62} rx={34} ry={36} /><path d="M-30,-80 Q0,-102 30,-80" stroke="#ead6c0" strokeWidth={2} fill="none" opacity={L.rim} /></g> : null; })}</g>; })}
			<Fence y={g - 18} scroll={scroll * 0.95} col="#1a201e" gap={170} h={62} />
			<path d={`M-240,${g - 14} L${W + 240},${g - 14} L${W + 240},${g + 34} L-240,${g + 34} Z`} fill="#3a3a34" /><path d={`M-240,${g - 14} L${W + 240},${g - 14}`} stroke="#d8c8b0" strokeWidth={2} opacity={0.25} />
			{Array.from({length: 26}, (_, i) => { const x = ((i * 97 - scroll * 1.0) % 2400 + 2400) % 2400 - 240; return <path key={i} d={`M${x},${g + 70} q6,-30 12,0 q4,-22 10,0`} stroke="#141816" strokeWidth={5} fill="none" />; })}
			<rect x={-240} y={g + 34} width={W + 480} height={200} fill="#161b19" />
			{/* the beam, and the frozen wave he imagines riding beside it */}
			<defs><linearGradient id="l1b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff8e8" stopOpacity="0" /><stop offset="0.8" stopColor="#fff8e8" stopOpacity="0.85" /><stop offset="1" stopColor="#ffffff" stopOpacity="1" /></linearGradient></defs>
			<rect x={-240} y={beamY - 5} width={bx + 240} height={10} rx={5} fill="url(#l1b)" /><Glow x={bx} y={beamY} r={150} c="#fff6e0" o={0.9} id="l1bh" />
			<path d={Array.from({length: 40}, (_, i) => `${i ? 'L' : 'M'}${bx - 40 - i * 14},${beamY + 22 * Math.sin(i * 0.55) * (1 - i / 44)}`).join(' ')} stroke="#fff6e0" strokeWidth={3} fill="none" opacity={0.55} />
			<g transform={`rotate(4 ${rx} ${g})`}><Rimmed x={rx} ground={g} h={h} pose={runP} look={LK.teen} col="#120e12" rim={RIMB} rimOp={0.7} rimDx={-2.4} /></g>
			{/* round 3: no trailing streak behind the head; the glow sits inside the skull (the figure is drawn rotated 4°, so is the mask) */}
			<g transform={`rotate(4 ${rx} ${g})`}><InHead id="l1gk" e={skullEllipse(runP, rx, g, h)}><HeadGlow x={hc[0]} y={hc[1]} r={26} id="l1g" /></InHead></g>
			{Array.from({length: 9}, (_, i) => { const x = ((i * 290 - scroll * 1.5) % 2600 + 2600) % 2600 - 300; return <path key={`fg${i}`} d={`M${x},1100 q10,-${120 + 60 * rnd(i, 2)} 30,-${150 + 70 * rnd(i, 3)} q-4,60 4,150 Z M${x + 40},1100 q-8,-90 -40,-${110 + 40 * rnd(i, 4)} q30,40 50,110 Z`} fill="#0a0c0b" />; })}
			{Array.from({length: 5}, (_, i) => <rect key={i} x={rx - 340 - i * 80} y={760 + i * 34} width={140 - i * 16} height={3} fill="#fff" opacity={0.3 - i * 0.05} />)}
		</Cam>
	</g>;
};

/* ================= P1/P2 28.5–35.0: the patent office; the 1905 paper lights up ================= */
/* round 2 (owner note 3): the head pitched less (neck 16 → 4) so the hair's back point sits at the nape, as in the other scenes, and the glow reads as the back of the skull */
const typeP = (t: number) => fkPose({hip: 0.37, lean: 18 + 2 * Math.sin(t * 2), neck: 4, lt: 86, lk: 90, rt: 82, rk: 86, la: 50, le: 62, ra: 56 + 4 * Math.sin(t * 6), re: 56});
const DX = 700, DG = 930, DH = 640;
const SHEETS: {t: number; x: number; title?: string; eq?: boolean}[] = [{t: 31.95, x: 990}, {t: 32.4, x: 1110}, {t: 32.85, x: 1230, title: '论动体的电动力学'}, {t: 33.3, x: 1350, eq: true}];
const Sheet: React.FC<{title?: string; eq?: boolean; lit?: number}> = ({title, eq, lit = 0}) => <g>
	<rect x={-90} y={-120} width={180} height={240} fill="#efe8d8" stroke="#8a8070" strokeWidth={1.5} />
	{lit > 0 && <rect x={-90} y={-120} width={180} height={240} fill="#fff4e4" opacity={lit} />}
	{title ? <text x={0} y={-82} textAnchor="middle" style={{fontFamily: SANS, fontWeight: 900, fontSize: 19}} fill="#2a2420">{title}</text> : <rect x={-60} y={-96} width={120} height={10} fill="#3a342c" />}
	<text x={0} y={-56} textAnchor="middle" style={{fontFamily: MONO, fontSize: 13}} fill="#6a6258">1905</text>
	{eq ? <text x={0} y={30} textAnchor="middle" style={{fontFamily: "'DejaVu Serif',serif", fontStyle: 'italic', fontSize: 40, fontWeight: 700}} fill="#2a2420">E=mc²</text>
		: Array.from({length: 9}, (_, i) => <rect key={i} x={-68} y={-36 + i * 15} width={100 + (i % 3) * 18} height={4} fill="#8a8274" />)}
</g>;
export const Office: React.FC<{t: number}> = ({t}) => {
	const u = t - T.office, p = typeP(t), hc = skullBack(p, DX, DG, DH, false, GLOW_BACK, 0.012),   /* a little toward the nape, clear of the hair's back point */ intro = ease(seg(u, 0, 0.95)), pp = ease(seg(t, 31.55, 32.4)), late = ease(seg(t, 33.3, 35.0));
	const lift = ease(seg(t, 33.35, 33.95)), lit = sm(seg(t, 33.75, 34.15)), word = eo(seg(t, 33.95, 34.45));
	const cx = lerp(lerp(hc[0], 960, intro) + 18 * u, lerp(1150, 1260, late), pp), cy = lerp(lerp(hc[1], 540, intro), lerp(560, 480, late), pp), z = lerp(lerp(2.6, 1.03, intro) + 0.012 * u, lerp(1.4, 1.5, late), pp);
	const stack = Array.from({length: 7}, (_, i) => 28.9 + i * 0.42);
	const S3: P2 = [lerp(1230, 1350, lift), lerp(688, 560, lift)];
	return <g>
		<Sky id="ofs" stops={[[0, '#3a403f'], [0.62, '#4a504d'], [0.63, '#2a2e2c'], [1, '#191b1a']]} />
		<Cam cx={cx} cy={cy} z={z}>
			{[260, 1500].map((x, i) => <g key={i}><rect x={x} y={90} width={240} height={440} fill="#9aa4a6" opacity={0.35} /><rect x={x} y={90} width={240} height={440} fill="none" stroke="#262a28" strokeWidth={14} /><path d={`M${x + 120},90 V530 M${x},300 H${x + 240}`} stroke="#262a28" strokeWidth={8} />
				<path d={`M${x},530 L${x + 240},530 L${x + 440},960 L${x + 120},960 Z`} fill="#e8eee8" opacity={0.05} /></g>)}
			<g opacity={0.6}>{[210, 330, 450].map((y, k) => <Shelf key={k} x={620} y={y} w={820} kind="files" seed={k + 5} tone="#262a28" />)}{[210, 330, 450].map((y, k) => <Shelf key={`b${k}`} x={1790} y={y} w={500} kind="files" seed={k + 9} tone="#262a28" />)}</g>
			<Clock x={560} y={140} r={28} t={t} />
			<Pendant x={1100} y={40} len={120} id="ofp1" o={0.4} col="#eef0e4" /><Pendant x={400} y={40} len={120} id="ofp2" o={0.4} col="#eef0e4" />
			<Motes t={t} x={260} y={520} w={1500} h={420} n={28} o={0.35} col="#eef2ee" />
			<rect x={-400} y={560} width={2800} height={8} fill="#2e3230" />
			{/* identical desks receding, identical clerks */}
			{[[300, 0.5], [620, 0.5], [940, 0.5], [1260, 0.5], [1580, 0.5]].map(([x, s], i) => <g key={i} transform={`translate(${x},${700}) scale(${s})`} opacity={0.75}>
				<rect x={0} y={0} width={420} height={16} fill="#2a2420" /><rect x={20} y={16} width={12} height={240} fill="#2a2420" /><rect x={388} y={16} width={12} height={240} fill="#2a2420" />
				<Rimmed x={-60} ground={256} h={640} pose={fkPose({hip: 0.37, lean: 20 + 3 * Math.sin(t * 2 + i), neck: 18, lt: 86, lk: 90, rt: 82, rk: 86, la: 50, le: 62, ra: 56, re: 56})} look={LK.clerk} col="#2a2e2c" rimOp={0} /></g>)}
			<rect x={-400} y={850} width={2800} height={300} fill="#1c1e1c" />
			{/* his desk */}
			<path d="M800,690 L1500,690 L1470,650 L830,650 Z" fill="#4a3a2c" /><rect x={800} y={690} width={700} height={22} fill="#3a2a1e" /><rect x={830} y={712} width={16} height={220} fill="#2a1e16" /><rect x={1454} y={712} width={16} height={220} fill="#2a1e16" />
			<g transform="translate(1400,650)"><rect x={-6} y={-130} width={12} height={130} fill="#2a2420" /><path d="M-60,-130 L60,-130 L40,-180 L-40,-180 Z" fill="#3a4a40" /><Glow x={0} y={-110} r={130} c="#fff0c8" o={0.55} id="ofl" /></g>
			{/* patent drawings stacking up */}
			{stack.map((a, i) => { const k = ease(seg(t, a, a + 0.3)); return k > 0 ? <g key={i} transform={`translate(${lerp(700, 880, k)},${650 - i * 4 - (1 - k) * 60})`}><path d="M0,0 L130,0 L150,-14 L20,-14 Z" fill="#e6e0d0" stroke="#8a8070" strokeWidth={1} /><circle cx={70} cy={-7} r={4} stroke="#5a5448" fill="none" strokeWidth={1} /></g> : null; })}
			{/* the four 1905 sheets drop, one per beat */}
			{SHEETS.map((sh, i) => { const k = seg(t, sh.t, sh.t + 0.38); if (k <= 0) return null; const kk = ei(k), y = lerp(480, 668, kk), flat = lerp(1, 0.16, ease(seg(t, sh.t + 0.3, sh.t + 0.45)));
				if (i === 2 && lift > 0) return null;
				return <g key={i} transform={`translate(${sh.x},${y}) rotate(${(1 - kk) * 30 * (i % 2 ? 1 : -1)}) scale(0.62,${0.62 * flat})`}><Sheet title={sh.title} eq={sh.eq} /></g>; })}
			{lift > 0 && <g>
				<Glow x={S3[0]} y={S3[1]} r={360} c={B.halo} o={0.45 * lit} id="ofg" />
				<g transform={`translate(${S3[0]},${S3[1]}) scale(${lerp(0.62, 0.95, lift)},${lerp(0.1, 0.95, lift)})`}><Sheet title="论动体的电动力学" lit={lit * 0.5} /></g>
				<text x={S3[0]} y={S3[1] - 135 - 20 * word} textAnchor="middle" opacity={word} style={{fontFamily: SANS, fontWeight: 900, fontSize: 88, letterSpacing: '0.08em'}} fill={ROSE} stroke="rgba(12,8,5,0.55)" strokeWidth={5} paintOrder="stroke">相对论</text>
				<Glow x={S3[0]} y={S3[1] - 170} r={260} c={B.mid} o={0.3 * word} id="ofw" />
			</g>}
			{/* the beam from 16 still runs in his head, then folds into the paper */}
			<Rimmed x={DX} ground={DG} h={DH} pose={p} look={LK.ein} col="#121212" rim={RIMB} rimOp={0.6} />
			<g transform="translate(600,930)"><rect x={-70} y={-262} width={140} height={14} fill="#1e1a16" /><rect x={-60} y={-248} width={10} height={248} fill="#1e1a16" /><rect x={50} y={-248} width={10} height={248} fill="#1e1a16" /></g>
			<InHead id="ofhk" e={skullEllipse(p, DX, DG, DH)}><HeadGlow x={hc[0]} y={hc[1]} r={26 + 8 * lit} id="ofh" /></InHead>
			{/* round 2: the beam from 16 is a small spark circling inside the glow (the old dash read as a headlamp beam) */}
			{(() => { const a = u * 5.5; return t < 33.4 ? <circle cx={hc[0] + 7 * Math.cos(a)} cy={hc[1] + 5 * Math.sin(a)} r={2.6} fill="#fff" opacity={0.75} /> : null; })()}
			{t >= 33.3 && (() => { const k = ease(seg(t, 33.4, 33.85)), ex = lerp(hc[0], S3[0], k), ey = lerp(hc[1], S3[1], k), mx = (hc[0] + ex) / 2, my = Math.min(hc[1], ey) - 120 * k;
				return <><path d={`M${hc[0]},${hc[1]} Q${mx},${my} ${ex},${ey}`} stroke="#fff6e0" strokeWidth={4} fill="none" opacity={0.85 * (1 - 0.6 * lit)} /><Glow x={ex} y={ey} r={60} c="#fff6e0" o={0.8 * (1 - lit)} id="ofb" /></>; })()}
			<g fill="#0b0d0c"><rect x={1830} y={480} width={320} height={640} /><rect x={1830} y={470} width={330} height={16} /><rect x={60} y={220} width={10} height={860} /><path d="M20,240 L65,220 L110,240 M30,300 L65,280 L100,300" stroke="#0b0d0c" strokeWidth={8} fill="none" /><path d="M10,300 Q60,280 110,300 L120,700 L0,700 Z" /></g>
		</Cam>
	</g>;
};
void H; void mixPose;
