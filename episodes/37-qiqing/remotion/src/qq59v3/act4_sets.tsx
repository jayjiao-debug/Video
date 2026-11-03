import React from 'react';
import {Stage, Layer, Shape, FigureSlot, Particles, Glow, SkyGrad, FogBand, INF, useFog, useUid, P, W, H, f1, lerp, rnd, taper, poly, mix, cl, sm, noise1, GOLD} from './kit3';
import {figParts, grounded, PZ, LOOK, Look59, Pose, jointAt} from '../qq59/figure59';
import {Mum as RigMum, Cart, Action} from './karl3';

/* ep59 v3 · act 4 local set variants. sets3d's Bridge stays untouched (shared); this is a copy rebuilt around a TRUE 3D camera, so the
   walk out of the fog toward the lens never slides or double-transforms (the act's Hull street is act4_dawn.tsx, on the same camera):
   - W4 = {hz, vpx, S, camH, camX, dz}: every point is projected per point from world metres (X lateral, Y up, D down the street):
     truck = camX, crane = camH, tilt ≈ hz (a shift lens), dolly = dz (the camera moves back along the street), lens = S.
     The kit camera stays at rest (CAM0): layers carry depth only for haze and depth of field.
   - Karl placed in metres (approach(): the world path that keeps a side-view gait's planted foot still while he walks toward the lens);
   - her window (WindowSet): the bay at blue hour, the net curtain, the room, the clock. */

export type W4 = {hz: number; vpx: number; S: number; camH: number; camX: number; dz: number};
export const wp4 = (w: W4, X: number, Y: number, D: number): P => { const d = Math.max(0.06, D + w.dz); return [w.vpx + (X - w.camX) * w.S / d, w.hz + (w.camH - Y) * w.S / d]; };
export const px4 = (w: W4, D: number) => w.S / Math.max(0.06, D + w.dz);
const NEAR = 0.32;
/** the near clip: the first depth in front of the camera that may be drawn */
const nearD = (w: W4) => NEAR - w.dz;

/* ---------- people (one-tone silhouettes from the qq59 rig), as in sets3d ---------- */
const POSES: Record<string, Pose> = {
	stand: PZ.stand,
	wave: grounded({lean: 0, lt: 2, lk: 2, rt: -3, rk: 3, la: -4, le: 10, ra: 162, re: 18}),
	phone: grounded({lean: 3, neck: 10, lt: 2, lk: 2, rt: -3, rk: 3, la: 30, le: 112, ra: 70, re: 70}),
	cheer: grounded({lean: -2, neck: -8, lt: 3, lk: 2, rt: -4, rk: 3, la: 158, le: 14, ra: 150, re: 22}),
	press: grounded({lean: 6, neck: 4, lt: 4, lk: 6, rt: -8, rk: 8, la: 62, le: 104, ra: 52, re: 118}),
	high: grounded({lean: 0, neck: -6, lt: 2, lk: 2, rt: -4, rk: 3, la: 4, le: 10, ra: 172, re: 4}),
	clap: grounded({lean: 2, neck: 2, lt: 2, lk: 2, rt: -3, rk: 3, la: 58, le: 96, ra: 50, re: 104}),
};
const LOOKS: Look59[] = [LOOK.man, LOOK.woman, {dress: 'coat', head: 'short', build: 1.05}, {dress: 'jacket', head: 'beanie', build: 1.0}, {dress: 'coat', head: 'bob', build: 0.95}, {dress: 'jacket', head: 'cap', build: 1.08}];
export type Person = {X: number; D: number; m: number; pose: string; look: number; flip?: boolean; phone?: boolean; cam?: boolean};
/** a group of people at world positions (each projected at its own depth), with a rim and phone / camera glows */
const People4: React.FC<{w: W4; ppl: Person[]; col: string; rim: string; rimDx: number; extra?: number; glow?: string; t?: number}> = ({w, ppl, col, rim, rimDx, extra = 0, glow = '#cfe2ff', t = 0}) => {
	const fog = useFog(), c = fog(col, extra), r = fog(rim, extra + 0.1), glows: React.ReactNode[] = [];
	const shapes = [...ppl].filter((p) => p.D + w.dz > 0.8).sort((a, b) => b.D - a.D).map((p, i) => {
		const [x, y] = wp4(w, p.X, 0, p.D), h = p.m * px4(w, p.D);
		if (x < -300 || x > W + 300 || y - h > H + 50 || y < -50) return null;
		const pose = POSES[p.pose], parts = figParts(x, y, h, pose, LOOKS[p.look % LOOKS.length]);
		let extraD = '';
		if (p.cam || p.phone) { const hand = jointAt(pose, p.pose === 'high' ? 'RHand' : 'LHand', x, y, h, p.flip), sz = h * (p.cam ? 0.07 : 0.045), dir = p.flip ? -1 : 1;
			extraD = `M${f1(hand[0] - sz * 0.2 * dir)},${f1(hand[1] - sz * 0.7)} l${f1(sz * 1.4 * dir)},0 l0,${f1(sz * 1.1)} l${f1(-sz * 1.4 * dir)},0 Z` + (p.cam ? ` M${f1(hand[0] + sz * 1.1 * dir)},${f1(hand[1] - sz * 0.45)} l${f1(sz * 0.9 * dir)},0 l0,${f1(sz * 0.7)} l${f1(-sz * 0.9 * dir)},0 Z` : '');
			if (p.phone) { const tw = 0.75 + 0.25 * Math.sin(t * 1.3 + i * 2.7);
				glows.push(<g key={i} opacity={tw}><Glow x={hand[0] + sz * 0.5 * dir} y={hand[1] - sz * 0.15} r={Math.max(6, sz * 3)} c={glow} o={0.5} /><rect x={hand[0] + (dir > 0 ? -sz * 0.1 : -sz * 1.1)} y={hand[1] - sz * 0.6} width={sz * 1.2} height={sz * 0.9} fill={glow} opacity={0.9} /></g>); } }
		const ds = parts.map((q) => q.d).join(' ') + ' ' + extraD, k = Math.max(0.6, h / 300);
		return <g key={i} transform={p.flip ? `translate(${f1(2 * x)},0) scale(-1,1)` : undefined}>
			<g transform={`translate(${f1(rimDx * (p.flip ? -1 : 1) * k)},${f1(-1.2 * k)})`}><Shape d={ds} fill={r} /></g><Shape d={ds} fill={c} /></g>; });
	return <g>{shapes}{glows}</g>; };

/* ===================================================== THE HUMBER BRIDGE IN FOG (variant) =====================================================
   As sets3d's Bridge, with the true camera, the fog as a parameter (0 = the set's fog, 1 = so thick the towers vanish), and Karl placed
   in metres so he can walk out of the fog toward the camera. */
export const BW4: W4 = {hz: 512, vpx: 1520, S: 668, camH: 1.7, camX: 0, dz: 0};
const bridgePpl = (): Person[] => { const out: Person[] = [];
	for (let i = 0; i < 52; i++) { const D = 3.6 * Math.pow(12, rnd(i, 3)), pose = ['stand', 'phone', 'wave', 'cheer', 'phone', 'stand', 'high', 'clap'][Math.floor(rnd(i, 4) * 8)];
		out.push({X: -6.1 - rnd(i, 5) * 0.4, D, m: 1.6 + rnd(i, 6) * 0.28, pose, look: Math.floor(rnd(i, 7) * 6), flip: rnd(i, 8) > 0.35, phone: pose === 'phone' || pose === 'high'}); }
	for (let i = 0; i < 30; i++) { const D = 9 * Math.pow(5, rnd(i, 13)), pose = ['stand', 'wave', 'cheer', 'phone', 'high'][Math.floor(rnd(i, 14) * 5)];
		out.push({X: 9.4 + rnd(i, 15) * 0.4, D, m: 1.6 + rnd(i, 16) * 0.28, pose, look: Math.floor(rnd(i, 17) * 6), flip: true, phone: pose === 'phone' || pose === 'high'}); }
	return out; };
const BPPL = bridgePpl();

const Deck4: React.FC<{w: W4}> = ({w}) => {
	const n0 = Math.max(0.6, nearD(w)), wp = (x: number, y: number, d: number) => wp4(w, x, y, d), strip = (X0: number, X1: number, D0 = n0, D1 = 400) => poly([wp(X0, 0, D0), wp(X1, 0, D0), wp(X1, 0, D1), wp(X0, 0, D1)]);
	const dashes = Array.from({length: 40}, (_, i) => { const d0 = 0.8 + i * 1.6, d1 = d0 + 0.7; if (d0 < n0) return ''; return [0.2, 3.6].map((X) => poly([wp(X, 0, d0), wp(X + 0.15, 0, d0), wp(X + 0.15, 0, d1), wp(X, 0, d1)])).join(' '); }).join(' ');
	const rail = (X: number, Y: number, th: number) => poly([wp(X, Y, Math.max(0.7, n0)), wp(X, Y, 300), wp(X, Y - th, 300), wp(X, Y - th, Math.max(0.7, n0))]);
	const posts = (X: number) => Array.from({length: 90}, (_, i) => { const d = 0.9 + i * 0.42; if (d < n0) return ''; return poly([wp(X, 0, d), wp(X, 1.25, d), wp(X, 1.25, d + 0.08), wp(X, 0, d + 0.08)]); }).join(' ');
	return <g>
		<defs><linearGradient id="a4bdeck" gradientUnits="userSpaceOnUse" x1="0" y1={w.hz} x2="0" y2={H}><stop offset="0" stopColor="#9ca3aa" /><stop offset="0.25" stopColor="#6f767f" /><stop offset="1" stopColor="#2f3238" /></linearGradient>
			<linearGradient id="a4bpath" gradientUnits="userSpaceOnUse" x1="0" y1={w.hz} x2="0" y2={H}><stop offset="0" stopColor="#a7adb3" /><stop offset="0.25" stopColor="#868c93" /><stop offset="1" stopColor="#4c5056" /></linearGradient></defs>
		<path d={strip(-3.4, 8.8)} fill="url(#a4bdeck)" />
		<path d={strip(-6.6, -3.6)} fill="url(#a4bpath)" /><path d={strip(9.0, 12)} fill="url(#a4bpath)" />
		<path d={strip(-3.65, -3.4)} fill="#b9bec3" opacity={0.7} />
		<path d={dashes} fill="#c9ccc6" opacity={0.55} />
		<Shape d={posts(-6.7)} fill="#3a3f46" o={0.85} />
		<path d={rail(-6.7, 1.28, 0.1) + ' ' + rail(-6.7, 0.7, 0.05)} fill="#3a3f46" />
		<path d={rail(12.1, 1.28, 0.1)} fill="#4a4f56" />
	</g>; };
const Tower4: React.FC<{w: W4; D: number; ghost?: boolean}> = ({w, D, ghost}) => {
	const fog = useFog(), s = px4(w, D), legs = [-8.6, 12.4].map((X) => { const [x, y] = wp4(w, X, 0, D), w0 = 7 * s, w1 = 5 * s, top = y - 160 * s;
		return poly([[x - w0 / 2, y + 0.4 * s], [x + w0 / 2, y + 0.4 * s], [x + w1 / 2, top], [x - w1 / 2, top]]); }).join(' ');
	const id = useUid('bt'), y0 = wp4(w, 0, 0, D)[1];
	return <g><defs><linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={y0 + 10} x2="0" y2={ghost ? y0 - 500 : y0 - 160 * s * 0.85}>
		<stop offset="0" stopColor={fog('#22262c', ghost ? -0.3 : -0.4)} /><stop offset="0.45" stopColor={fog('#30353c', ghost ? -0.25 : -0.3)} stopOpacity={0.9} /><stop offset="1" stopColor={fog('#a7aeb4')} stopOpacity={0} /></linearGradient></defs>
		<Shape d={legs} fill={`url(#${id})`} />
		{/* the cross beam high up, fading */}
		<path d={poly([wp4(w, -8.6, 52, D), wp4(w, 12.4, 52, D), wp4(w, 12.4, 56, D), wp4(w, -8.6, 56, D)])} fill={fog('#4a5058', ghost ? 0 : -0.1)} opacity={0.5} />
	</g>; };
const cableY = (D: number, top: number) => 1.7 + (BW4.hz - (top - Math.pow(D / 24, 1.3) * 640)) * D / BW4.S;
const Hangers4: React.FC<{w: W4; X: number; from: number; to: number; step: number; top?: number}> = ({w, X, from, to, step, top = 70}) => {
	const out: React.ReactNode[] = [], cable: P[] = [], n0 = nearD(w) + 0.4;
	for (let D = from, i = 0; D < to; D += step * (1 + D * 0.02), i++) { if (D < n0) continue; const b = wp4(w, X, 1.2, D), tp = wp4(w, X, cableY(D, top), D), wd = Math.max(0.8, 0.07 * px4(w, D)), k = cl(1 - Math.exp(-0.06 * (D + w.dz)));
		cable.push(tp); out.push(<path key={i} d={poly([[b[0] - wd / 2, b[1]], [b[0] + wd / 2, b[1]], [tp[0] + wd / 2, tp[1]], [tp[0] - wd / 2, tp[1]]])} fill={mix('#3e444b', '#aab1b7', k)} />); }
	if (cable.length < 2) return <g>{out}</g>;
	const id = useUid('cab'), xs = cable.map((p) => p[0]);
	return <g>{out}<defs><linearGradient id={id} gradientUnits="userSpaceOnUse" x1={cable[0][0]} y1="0" x2={Math.max(...xs)} y2="0"><stop offset="0" stopColor="#353b42" /><stop offset="0.45" stopColor="#4a5057" /><stop offset="0.8" stopColor="#9aa1a7" stopOpacity={0.5} /><stop offset="1" stopColor="#a9b0b6" stopOpacity={0} /></linearGradient></defs>
		<path d={'M' + cable.filter((p) => p[1] > -400).map((p) => `${f1(p[0])},${f1(p[1])}`).join(' L')} fill="none" stroke={`url(#${id})`} strokeWidth={10} strokeLinecap="round" /></g>; };
const Lamps4: React.FC<{w: W4; X: number; Ds: number[]}> = ({w, X, Ds}) => <g>{Ds.map((D, i) => { if (D + w.dz < 1) return null; const b = wp4(w, X, 0, D), tp = wp4(w, X, 9.5, D), arm = wp4(w, X + 1.2, 9.6, D), s = px4(w, D), k = cl(1 - Math.exp(-0.05 * (D + w.dz)));
	return <g key={i}><path d={poly([[b[0] - 0.09 * s, b[1]], [b[0] + 0.09 * s, b[1]], [tp[0] + 0.06 * s, tp[1]], [tp[0] - 0.06 * s, tp[1]]])} fill={mix('#353a41', '#a9b0b6', k)} />
		<path d={`M${f1(tp[0])},${f1(tp[1])} Q${f1(tp[0] + 0.4 * s)},${f1(tp[1] - 0.5 * s)} ${f1(arm[0])},${f1(arm[1])}`} fill="none" stroke={mix('#353a41', '#a9b0b6', k)} strokeWidth={Math.max(0.8, 0.1 * s)} />
		<Glow x={arm[0]} y={arm[1] + 0.1 * s} r={Math.max(30, 4.2 * s)} c="#ffd49a" o={0.55 * (1 - k * 0.5)} />
		<Glow x={arm[0]} y={arm[1] + 0.1 * s} r={Math.max(8, 0.8 * s)} c="#fff2d8" o={0.9 * (1 - k * 0.6)} /></g>; })}</g>;
const FgCrowd4: React.FC = () => <g>
	<path d={`M-120,1200 L-110,820 Q-100,700 30,690 L170,690 Q300,700 310,820 L330,1200 Z M40,690 a92,110 0 1,1 120,-10 Z`} fill="#121418" />
	<path d={`M1640,1200 L1660,900 Q1680,800 1790,790 L1900,790 Q2020,800 2030,900 L2050,1200 Z M1770,790 a84,96 0 1,1 100,-6 Z`} fill="#15171b" />
	<path d={taper([[1700, 860], [1640, 720], [1600, 600]], 46, 34)} fill="#15171b" />
	<rect x={1560} y={520} width={64} height={110} rx={8} fill="#1b1d22" /><rect x={1567} y={528} width={50} height={92} rx={4} fill="#c8dcf2" opacity={0.85} />
	<Glow x={1592} y={574} r={140} c="#cfe0f6" o={0.35} />
</g>;
/** thick fog drifting near the camera: soft sheets that part to both sides as `part` goes 0 → 1 */
const FogVeil: React.FC<{t: number; o: number; part: number; c: string}> = ({t, o, part, c}) => {
	const id = useUid('fv');
	return <g opacity={o}><defs><radialGradient id={id}><stop offset="0" stopColor={c} stopOpacity="1" /><stop offset="0.55" stopColor={c} stopOpacity="0.6" /><stop offset="1" stopColor={c} stopOpacity="0" /></radialGradient></defs>
		{Array.from({length: 14}, (_, i) => { const side = i % 2 ? 1 : -1, x0 = 960 + side * (80 + rnd(i, 3) * 700), y = 120 + rnd(i, 4) * 820, x = x0 + side * part * (700 + rnd(i, 5) * 600) + 18 * Math.sin(t * 0.4 + i);
			return <ellipse key={i} cx={x} cy={y} rx={500 + rnd(i, 6) * 600} ry={160 + rnd(i, 7) * 200} fill={`url(#${id})`} opacity={0.55 + 0.45 * rnd(i, 8)} />; })}</g>; };

/** the bridge. fog 0..1 (1 = the towers gone), part 0..1 (the near fog drawing aside), karl in metres (pushCart toward the camera) */
export const Bridge4: React.FC<{t: number; w?: Partial<W4>; fog: number; part: number; karl: {X: number; D: number; phase: number; facing?: 1 | -1}}> = ({t, w: wIn = {}, fog, part, karl}) => {
	const w: W4 = {...BW4, ...wIn}, L = (D: number) => Math.max(0.5, D + w.dz), kD = L(karl.D);
	const near = BPPL.filter((p) => p.D < 6.5), mid = BPPL.filter((p) => p.D >= 6.5 && p.D < 13), far = BPPL.filter((p) => p.D >= 13);
	const [kx, ky] = wp4(w, karl.X, 0, karl.D), kh = 1.8 * px4(w, karl.D);
	const density = lerp(0.05, 0.095, fog), haze = mix('#a9b0b6', '#b9bec2', fog);
	return <Stage t={t} atm={{haze, density, focus: kD, aperture: 1.6, rim: '#ffd8a2', lightDir: 55, grain: 0.07, vignette: 0.55, pp: [w.vpx, w.hz]}} bg="#5c636b">
		<Layer D={INF}>
			<SkyGrad y0={w.hz - 512} y1={w.hz + 568} stops={[[0, mix('#6d7680', '#a2a8ae', fog)], [0.3, mix('#8d959d', '#b0b5ba', fog)], [0.47, '#b2b8bd'], [0.5, '#bcc1c4'], [1, mix('#9aa1a8', '#b2b7bb', fog)]]} />
			<Glow x={w.vpx + 40} y={w.hz - 10} r={560} ry={220} c="#ffdca0" o={0.18 + 0.12 * (1 - fog)} />
		</Layer>
		<Layer D={L(120)}><Tower4 w={w} D={120} ghost /></Layer>
		<Layer D={INF}><Deck4 w={w} /></Layer>
		<Layer D={L(40)}><FogBand y={w.hz + 4} h={160} o={0.8} /></Layer>
		<Layer D={L(24)}><Tower4 w={w} D={24} /></Layer>
		<Layer D={L(20)}><People4 w={w} ppl={far} col="#3c4249" rim="#ffd8a2" rimDx={1.2} t={t} /></Layer>
		<Layer D={INF}><Hangers4 w={w} X={-7.3} from={1.2} to={160} step={1.6} top={250} /><Hangers4 w={w} X={12.6} from={3} to={160} step={1.6} top={300} /><Lamps4 w={w} X={-3.7} Ds={[4.5, 8.5, 13, 19, 26, 35, 46, 60]} /></Layer>
		<Layer D={L(14)}><FogBand y={w.hz - 40} h={300} o={0.35 + 0.5 * fog} /></Layer>
		<Layer D={L(9)}><People4 w={w} ppl={mid} col="#262a30" rim="#ffd8a2" rimDx={1.5} t={t} /></Layer>
		{karl.D >= 6.5 && <FigureSlot depth={kD} x={kx} y={ky} h={kh} attire="home2026" action="pushCart" phase={karl.phase} facing={karl.facing ?? -1} rim="#ffd8a2" lightDir={55} contact={0.25} />}
		<Layer D={L(6)}><FogBand y={w.hz + 60} h={420} o={0.25 + 0.45 * fog} /></Layer>
		<Layer D={L(5)}><People4 w={w} ppl={near} col="#17191d" rim="#ffd8a2" rimDx={1.8} t={t} /></Layer>
		{karl.D < 6.5 && <FigureSlot depth={kD} x={kx} y={ky} h={kh} attire="home2026" action="pushCart" phase={karl.phase} facing={karl.facing ?? -1} rim="#ffd8a2" lightDir={55} contact={0.25} />}
		<FogVeil t={t} o={0.6 * fog + 0.08} part={part} c={haze} />
		<Particles kind="rain" n={120} seed={61} D={[1, 10]} c="#dfe5ea" o={0.35} wind={-60} fall={-700} />
		<Layer D={1.5} blur={9}><FgCrowd4 /></Layer>
	</Stage>;
};

/* ===================================================== HER WINDOW =====================================================
   Outside her bay window at blue hour, close: the white sash in red brick, rain on the glass; behind the net curtain (the lower sash),
   his mother stands waiting, a dark soft shape against the warm room; through the clear upper panes the room's lamp and the wall clock,
   its second hand ticking on the beat. `tick` = the clock's seconds (the scene steps it on the beats); `flash` 0..1 = a press flash outside. */
export const WindowSet: React.FC<{t: number; z: number; tick: number; flash: number}> = ({t, z, tick, flash}) => {
	const cam = {x: 0, y: 0, zoom: 1, roll: 0, z};
	const G = {x0: 760, x1: 1520, y0: 150, y1: 870, mid: 520};   // the glass of the window (screen px at rest)
	const fw = 26;   // frame width
	return <Stage t={t} cam={cam} atm={{haze: '#2c3150', density: 0.03, focus: 4, aperture: 2.4, rim: '#ffd68a', lightDir: 170, grain: 0.07, vignette: 0.62, pp: [1180, 470]}} bg="#120f14">
		<Layer D={7}><Room G={G} tick={tick} t={t} /></Layer>
		<Layer D={4.4}><MumBehind G={G} t={t} /></Layer>
		<Layer D={4.1}><NetCurtain G={G} t={t} /></Layer>
		<Layer D={4}><Glass G={G} t={t} flash={flash} /><Sash G={G} fw={fw} flash={flash} /><Brick G={G} fw={fw} flash={flash} /><Stone G={G} fw={fw} /></Layer>
		<Particles kind="rain" n={90} seed={33} D={[1.2, 6]} c="#c9d2e6" o={0.35} wind={-90} />
		<Layer D={2.2} blur={8}><g><path d="M1700,-40 Q1820,60 1990,40" stroke="#1a1820" strokeWidth={6} fill="none" />
			{Array.from({length: 4}, (_, i) => { const x = 1730 + i * 70, y = 0 + i * 12 + 18; return <path key={i} d={`M${x},${y} L${x + 54},${y + 6} L${x + 22},${y + 70} Z`} fill={['#8a3a36', '#c8b48a', '#3e4f6e', '#d8cfb8'][i]} opacity={0.85} />; })}</g></Layer>
	</Stage>;
};
type Gl = {x0: number; x1: number; y0: number; y1: number; mid: number};
/** the warm room: papered wall, a standard lamp, the wall clock, a picture frame */
const Room: React.FC<{G: Gl; tick: number; t: number}> = ({G, tick}) => {
	const cx = 1330, cy = 300, R = 70, ang = (v: number) => (v * Math.PI) / 180;
	const hand = (deg: number, L: number, wd: number, c: string) => { const a = ang(deg - 90); return <path d={taper([[cx - Math.cos(a) * L * 0.18, cy - Math.sin(a) * L * 0.18], [cx + Math.cos(a) * L, cy + Math.sin(a) * L]], wd, wd * 0.4)} fill={c} />; };
	const sec = tick % 60, mn = 22 + sec / 60, hr = 4 + mn / 60;
	return <g>
		<defs><linearGradient id="a4wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#c98a4a" /><stop offset="0.45" stopColor="#e0a862" /><stop offset="1" stopColor="#b8763c" /></linearGradient></defs>
		<rect x={G.x0 - 300} y={G.y0 - 200} width={G.x1 - G.x0 + 600} height={G.y1 - G.y0 + 400} fill="url(#a4wall)" />
		{/* wallpaper: faint stripes and a dado rail */}
		{Array.from({length: 26}, (_, i) => <rect key={i} x={G.x0 - 300 + i * 46} y={G.y0 - 200} width={10} height={G.y1 - G.y0 + 400} fill="#8a5428" opacity={0.08} />)}
		<rect x={G.x0 - 300} y={640} width={G.x1 - G.x0 + 600} height={14} fill="#7a4a24" opacity={0.45} />
		<rect x={G.x0 - 300} y={654} width={G.x1 - G.x0 + 600} height={400} fill="#8a5630" opacity={0.35} />
		{/* the lamp: a pleated shade glowing, its pool of light on the wall */}
		<Glow x={900} y={330} r={420} ry={360} c="#ffe2a8" o={0.55} />
		<path d="M840,250 L960,250 L990,350 L810,350 Z" fill="#ffe7b8" /><path d="M840,250 L960,250 L990,350 L810,350 Z" fill="#ffb860" opacity={0.25} />
		<rect x={896} y={350} width={8} height={330} fill="#4a2c1a" />
		{/* a small framed photograph on the wall */}
		<rect x={1085} y={250} width={110} height={140} fill="#5a3a22" /><rect x={1095} y={260} width={90} height={120} fill="#d8c8a8" /><rect x={1105} y={270} width={70} height={95} fill="#8a7458" opacity={0.7} />
		{/* the clock */}
		<circle cx={cx + 4} cy={cy + 6} r={R + 10} fill="#000" opacity={0.18} />
		<circle cx={cx} cy={cy} r={R + 9} fill="#4a2e1a" /><circle cx={cx} cy={cy} r={R} fill="#f6ecd6" />
		{Array.from({length: 12}, (_, i) => { const a = ang(i * 30 - 90), r0 = R * (i % 3 ? 0.84 : 0.76); return <path key={i} d={`M${f1(cx + Math.cos(a) * r0)},${f1(cy + Math.sin(a) * r0)} L${f1(cx + Math.cos(a) * R * 0.93)},${f1(cy + Math.sin(a) * R * 0.93)}`} stroke="#3a2a1c" strokeWidth={i % 3 ? 2.5 : 5} />; })}
		{hand(hr * 30, R * 0.5, 7, '#2a1e14')}{hand(mn * 6, R * 0.76, 5, '#2a1e14')}{hand(sec * 6, R * 0.86, 2, '#a83a2a')}
		<circle cx={cx} cy={cy} r={5} fill="#2a1e14" />
	</g>; };
/** his mother behind the curtain: standing at the window, looking down the street (right), backlit by the room */
const MumBehind: React.FC<{G: Gl; t: number}> = ({G, t}) => <g>
	<RigMum x={1090} y={G.y1 + 330} h={800} action="stand" phase={t / 4.6 + 0.15} facing={1} rim="#ffe0a0" lightDir={160} rimO={0.95} col="#1a1216" />
	{/* on the inner sill: a vase of dried flowers, a photo frame, a china dog (dark against the room) */}
	<path d={`M${G.x0 + 70},${G.y1} q-6,-60 16,-74 q22,14 16,74 Z`} fill="#2a1a16" />
	{Array.from({length: 6}, (_, i) => <path key={i} d={`M${G.x0 + 86},${G.y1 - 70} q${-30 + i * 12},-60 ${-40 + i * 16},-120`} stroke="#3a2418" strokeWidth={3} fill="none" />)}
	{Array.from({length: 6}, (_, i) => <circle key={i} cx={G.x0 + 46 + i * 16} cy={G.y1 - 190 + (i % 2) * 12} r={7} fill="#5a3020" />)}
	<rect x={G.x1 - 190} y={G.y1 - 92} width={70} height={92} fill="#3a2418" /><rect x={G.x1 - 182} y={G.y1 - 84} width={54} height={70} fill="#6a5040" />
	<path d={`M${G.x1 - 100},${G.y1} l0,-40 q4,-26 24,-30 q14,6 12,22 l10,8 l0,40 Z`} fill="#2a1a16" />
</g>;
/** the net curtain over the lower sash: translucent lace with a scalloped hem, a slight sway */
const NetCurtain: React.FC<{G: Gl; t: number}> = ({G, t}) => {
	const id = useUid('lace'), sway = Math.sin(t * 0.9) * 3, top = G.mid + 18, bot = G.y1 + 10;
	const hem = Array.from({length: 17}, (_, i) => { const x = G.x1 - (i / 16) * (G.x1 - G.x0); return `L${f1(x)},${f1(bot - (i % 2 ? 0 : 14) + sway * (1 - i / 16))}`; }).join(' ');
	return <g>
		<defs><pattern id={id} width={36} height={36} patternUnits="userSpaceOnUse"><circle cx={18} cy={18} r={7} fill="none" stroke="#fff6e6" strokeWidth={2.2} /><circle cx={0} cy={0} r={3} fill="#fff6e6" /><circle cx={36} cy={36} r={3} fill="#fff6e6" />
			<path d="M18,4 L18,11 M18,25 L18,32 M4,18 L11,18 M25,18 L32,18" stroke="#fff6e6" strokeWidth={1.4} /></pattern></defs>
		<path d={`M${G.x0},${top} L${G.x1},${top} ${hem} Z`} fill="#fff1dc" opacity={0.42} />
		<path d={`M${G.x0},${top} L${G.x1},${top} ${hem} Z`} fill={`url(#${id})`} opacity={0.38} />
		{Array.from({length: 9}, (_, i) => { const x = G.x0 + 30 + i * (G.x1 - G.x0 - 60) / 8 + sway * 0.4; return <path key={i} d={`M${f1(x)},${top} Q${f1(x + 6)},${f1((top + bot) / 2)} ${f1(x - 2)},${bot}`} stroke="#fff8ee" strokeWidth={10} opacity={0.08} fill="none" />; })}
		<rect x={G.x0 - 10} y={top - 6} width={G.x1 - G.x0 + 20} height={6} fill="#c8b8a0" opacity={0.6} />
	</g>; };
/** the glass: a cool sheen, the street's lights reflected, rain beads and a few running drops */
const Glass: React.FC<{G: Gl; t: number; flash: number}> = ({G, t, flash}) => {
	const drops = Array.from({length: 70}, (_, i) => { const x = G.x0 + rnd(i, 1) * (G.x1 - G.x0), y = G.y0 + rnd(i, 2) * (G.y1 - G.y0), r = 1.6 + rnd(i, 3) * 3.4; return <g key={i}><circle cx={x} cy={y} r={r} fill="#0c0e18" opacity={0.25} /><circle cx={x - r * 0.3} cy={y - r * 0.35} r={r * 0.4} fill="#eaf2ff" opacity={0.7} /></g>; });
	const runs = Array.from({length: 6}, (_, i) => { const x = G.x0 + 60 + rnd(i, 11) * (G.x1 - G.x0 - 120), sp = 70 + rnd(i, 12) * 60, y = G.y0 + ((t * sp + rnd(i, 13) * 700) % (G.y1 - G.y0));
		return <g key={i}><path d={`M${f1(x)},${f1(Math.max(G.y0, y - 120))} L${f1(x + 2)},${f1(y)}`} stroke="#dfe8f6" strokeWidth={2} opacity={0.22} /><circle cx={x + 2} cy={y} r={3.6} fill="#eef4ff" opacity={0.6} /></g>; });
	return <g>
		<defs><linearGradient id="a4sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0.25" stopColor="#9fb2d8" stopOpacity="0" /><stop offset="0.42" stopColor="#9fb2d8" stopOpacity="0.16" /><stop offset="0.5" stopColor="#9fb2d8" stopOpacity="0.04" /><stop offset="0.62" stopColor="#9fb2d8" stopOpacity="0.12" /><stop offset="0.8" stopColor="#9fb2d8" stopOpacity="0" /></linearGradient></defs>
		<rect x={G.x0} y={G.y0} width={G.x1 - G.x0} height={G.y1 - G.y0} fill="url(#a4sheen)" />
		<Glow x={G.x1 - 120} y={G.y0 + 120} r={90} c="#ffcf8a" o={0.35} /><Glow x={G.x1 - 260} y={G.y0 + 210} r={50} c="#ffcf8a" o={0.25} />
		{/* the street reflected in the upper panes: the terrace opposite (lit windows), a lamp, the bunting */}
		<g opacity={0.16}>{Array.from({length: 7}, (_, i) => { const x = G.x0 + 40 + i * 104, y = G.y0 + 70 + (i % 3) * 18; return <rect key={i} x={x} y={y} width={46} height={70} fill="#ffd090" transform={`skewY(${-6 + i})`} />; })}
			<path d={`M${G.x0},${G.y0 + 40} Q${(G.x0 + G.x1) / 2},${G.y0 + 90} ${G.x1},${G.y0 + 30}`} stroke="#e8e0f0" strokeWidth={2} fill="none" />
			{Array.from({length: 12}, (_, i) => { const u = (i + 0.5) / 12, x = lerp(G.x0, G.x1, u), y = G.y0 + 40 + Math.sin(u * Math.PI) * 48; return <path key={i} d={`M${f1(x - 12)},${f1(y)} L${f1(x + 12)},${f1(y + 2)} L${f1(x)},${f1(y + 26)} Z`} fill={['#e0c8a0', '#c86a5a', '#7a8ac0'][i % 3]} />; })}</g>
		{flash > 0 && <rect x={G.x0} y={G.y0} width={G.x1 - G.x0} height={G.y1 - G.y0} fill="#eef4ff" opacity={0.22 * flash} />}
		{drops}{runs}
	</g>; };
/** the white sash frame: outer frame, meeting rail, glazing bars, the sill */
const Sash: React.FC<{G: Gl; fw: number; flash: number}> = ({G, fw, flash}) => {
	const c = mix('#b8bccb', '#f4f6ff', flash * 0.6), sh = '#6c7088';
	const vx = (G.x0 + G.x1) / 2;
	return <g>
		<path d={`M${G.x0 - fw},${G.y0 - fw} L${G.x1 + fw},${G.y0 - fw} L${G.x1 + fw},${G.y1 + fw} L${G.x0 - fw},${G.y1 + fw} Z M${G.x0},${G.y0} L${G.x0},${G.y1} L${G.x1},${G.y1} L${G.x1},${G.y0} Z`} fill={c} fillRule="evenodd" />
		<rect x={G.x0} y={G.mid - 12} width={G.x1 - G.x0} height={24} fill={c} /><rect x={G.x0} y={G.mid + 10} width={G.x1 - G.x0} height={5} fill={sh} opacity={0.6} />
		<rect x={vx - 7} y={G.y0} width={14} height={G.y1 - G.y0} fill={c} />
		<rect x={G.x0} y={G.y0} width={G.x1 - G.x0} height={6} fill={sh} opacity={0.5} /><rect x={G.x0} y={G.y0} width={6} height={G.y1 - G.y0} fill={sh} opacity={0.5} />
	</g>; };
/** the stone sill and lintel, over the brick */
const Stone: React.FC<{G: Gl; fw: number}> = ({G, fw}) => <g>
	<path d={`M${G.x0 - fw - 40},${G.y1 + fw} L${G.x1 + fw + 40},${G.y1 + fw} L${G.x1 + fw + 54},${G.y1 + fw + 34} L${G.x0 - fw - 54},${G.y1 + fw + 34} Z`} fill="#8a8a98" />
	<rect x={G.x0 - fw - 54} y={G.y1 + fw + 34} width={G.x1 - G.x0 + 2 * fw + 108} height={16} fill="#3a3a48" />
	<rect x={G.x0 - fw - 30} y={G.y0 - fw - 56} width={G.x1 - G.x0 + 2 * fw + 60} height={56} fill="#6e6e7c" /><rect x={G.x0 - fw - 30} y={G.y0 - fw - 6} width={G.x1 - G.x0 + 2 * fw + 60} height={6} fill="#34343f" />
	<Glow x={(G.x0 + G.x1) / 2} y={G.y1 + fw + 20} r={(G.x1 - G.x0) * 0.6} ry={40} c="#ffc070" o={0.3} />
</g>;
/** the red-brick wall around the window: courses of bricks, cool blue-hour light, warm spill around the frame */
const Brick: React.FC<{G: Gl; fw: number; flash: number}> = ({G, fw, flash}) => {
	const id = useUid('br'), hole = `M${G.x0 - fw},${G.y0 - fw} L${G.x1 + fw},${G.y0 - fw} L${G.x1 + fw},${G.y1 + fw} L${G.x0 - fw},${G.y1 + fw} Z`;
	const rows: string[] = []; for (let r = 0; r < 34; r++) { const y = -80 + r * 38; rows.push(`M-100,${y} L2100,${y}`); for (let c = 0; c < 30; c++) { const x = -100 + c * 84 + (r % 2) * 42; rows.push(`M${x},${y} L${x},${y + 38}`); } }
	return <g>
		<defs><mask id={id} maskUnits="userSpaceOnUse" x={-200} y={-200} width={2400} height={1600}><rect x={-200} y={-200} width={2400} height={1600} fill="#fff" /><path d={hole} fill="#000" /></mask>
			<linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="0.3"><stop offset="0" stopColor="#2a1618" /><stop offset="0.55" stopColor="#4a2622" /><stop offset="1" stopColor="#3a1e20" /></linearGradient></defs>
		<g mask={`url(#${id})`}>
			<rect x={-200} y={-200} width={2400} height={1600} fill={`url(#${id}g)`} />
			<path d={rows.join(' ')} stroke="#1a0e10" strokeWidth={3} opacity={0.55} />
			{Array.from({length: 120}, (_, i) => { const r = Math.floor(rnd(i, 1) * 34), c = Math.floor(rnd(i, 2) * 30), x = -100 + c * 84 + (r % 2) * 42, y = -80 + r * 38; return <rect key={i} x={x + 2} y={y + 2} width={80} height={34} fill={rnd(i, 3) > 0.5 ? '#5a2e28' : '#22121a'} opacity={0.35} />; })}
			<Glow x={(G.x0 + G.x1) / 2} y={(G.y0 + G.y1) / 2} r={820} ry={640} c="#ffb860" o={0.22} />
			<Glow x={1900} y={200} r={700} c="#6a7ab8" o={0.25 + 0.3 * flash} />
			<rect x={-200} y={-200} width={2400} height={1600} fill="#0a0c1a" opacity={0.25} />
		</g>
	</g>; };

/* ---------- small helpers used by the scenes ---------- */
/** walking toward the camera along a line of constant X is not a side view: integrate the screen speed the gait needs (stride·h per
    cycle) and solve the world X that gives it, so the planted foot stays put. Returns {X, D} at t. */
export const approach = (t: number, D0: number, D1: number, T: number, X0: number, wAt: (t: number) => W4, stride: number, cycle: number, dir: 1 | -1 = -1) => {
	const n = Math.max(2, Math.ceil(Math.abs(t) * 30)), dt = t / n, vD = (D1 - D0) / T, Dat = (u: number) => lerp(D0, D1, cl(u / T));
	let X = X0;
	// the root's screen velocity (camera frozen) must be the gait's −stride·h/cycle: dX/dt = −stride·1.8/cycle + (X − camX)/d · dD/dt
	for (let i = 0; i < n; i++) { const u = (i + 0.5) * dt, w = wAt(u), D = Dat(u), d = Math.max(0.3, D + w.dz), dD = u >= 0 && u <= T ? vD : 0;
		X += (dir * stride * 1.8 / cycle + (X - w.camX) / d * dD) * dt; }
	return {X, D: Dat(t)};
};
export const lerpW = (a: Partial<W4>, b: Partial<W4>, u: number, base: W4): W4 => { const A = {...base, ...a}, B = {...base, ...b};
	return {hz: lerp(A.hz, B.hz, u), vpx: lerp(A.vpx, B.vpx, u), S: lerp(A.S, B.S, u), camH: lerp(A.camH, B.camH, u), camX: lerp(A.camX, B.camX, u), dz: lerp(A.dz, B.dz, u)}; };
/** a slow hand-held float on a world camera (metres; never shaky) */
export const floatW = (w: W4, t: number, amp = 1, seed = 3): W4 => ({...w, camX: w.camX + noise1(t * 0.32, seed) * 0.05 * amp, camH: w.camH + noise1(t * 0.27, seed + 5) * 0.03 * amp});
export {noise1};
