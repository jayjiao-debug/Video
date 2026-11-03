import React from 'react';
import {Stage, Layer, FPath, Shape, FigureSlot, karlTravel, Particles, Mist, FogBand, FogFoot, Glow, SkyGrad, INF, useFog, useWorld, wpt, World, P, W, H, f1, lerp, rnd, noise1, spline, taper, poly, mix, cl, GOLD} from './kit3';
import {figParts, grounded, PZ, LOOK, Look59, Pose, jointAt} from '../qq59/figure59';
import {SetProps} from './sets3a';
import {Mum as RigMum} from './karl3';

/* ep59 v3 · hero sets D: the Humber Bridge in fog (1 Nov 2026), the Hull terraced street at the homecoming (2 Nov 2026). */

/* ---------- people (one-tone silhouettes from the qq59 rig) ---------- */
const POSES: Record<string, Pose> = {
	stand: PZ.stand,
	wave: grounded({lean: 0, lt: 2, lk: 2, rt: -3, rk: 3, la: -4, le: 10, ra: 162, re: 18}),
	phone: grounded({lean: 3, neck: 10, lt: 2, lk: 2, rt: -3, rk: 3, la: 30, le: 112, ra: 70, re: 70}),
	cheer: grounded({lean: -2, neck: -8, lt: 3, lk: 2, rt: -4, rk: 3, la: 158, le: 14, ra: 150, re: 22}),
	press: grounded({lean: 6, neck: 4, lt: 4, lk: 6, rt: -8, rk: 8, la: 62, le: 104, ra: 52, re: 118}),
	high: grounded({lean: 0, neck: -6, lt: 2, lk: 2, rt: -4, rk: 3, la: 4, le: 10, ra: 172, re: 4}),
};
const LOOKS: Look59[] = [LOOK.man, LOOK.woman, {dress: 'coat', head: 'short', build: 1.05}, {dress: 'jacket', head: 'beanie', build: 1.0}, {dress: 'coat', head: 'bob', build: 0.95}, {dress: 'jacket', head: 'cap', build: 1.08}];
type Person = {X: number; D: number; m: number; pose: string; look: number; flip?: boolean; phone?: boolean; cam?: boolean};
/** a group of people at rest positions (each projected at its own depth inside one layer), with a rim and phone / camera glows */
const People: React.FC<{w: World; ppl: Person[]; col: string; rim: string; rimDx: number; extra?: number; glow?: string}> = ({w, ppl, col, rim, rimDx, extra = 0, glow = '#cfe2ff'}) => {
	const fog = useFog(), c = fog(col, extra), r = fog(rim, extra + 0.1), glows: React.ReactNode[] = [];
	const shapes = [...ppl].sort((a, b) => b.D - a.D).map((p, i) => {
		const [x, y] = wpt(w, p.X, 0, p.D), h = p.m * w.S / p.D, pose = POSES[p.pose], parts = figParts(x, y, h, pose, LOOKS[p.look % LOOKS.length]);
		let extraD = '';
		if (p.cam || p.phone) { const hand = jointAt(pose, p.pose === 'high' ? 'RHand' : 'LHand', x, y, h, p.flip), sz = h * (p.cam ? 0.07 : 0.045), dir = p.flip ? -1 : 1;
			extraD = `M${f1(hand[0] - sz * 0.2 * dir)},${f1(hand[1] - sz * 0.7)} l${f1(sz * 1.4 * dir)},0 l0,${f1(sz * 1.1)} l${f1(-sz * 1.4 * dir)},0 Z` + (p.cam ? ` M${f1(hand[0] + sz * 1.1 * dir)},${f1(hand[1] - sz * 0.45)} l${f1(sz * 0.9 * dir)},0 l0,${f1(sz * 0.7)} l${f1(-sz * 0.9 * dir)},0 Z` : '');
			if (p.phone) glows.push(<g key={i}><Glow x={hand[0] + sz * 0.5 * dir} y={hand[1] - sz * 0.15} r={sz * 3} c={glow} o={0.5} /><rect x={hand[0] + (dir > 0 ? -sz * 0.1 : -sz * 1.1)} y={hand[1] - sz * 0.6} width={sz * 1.2} height={sz * 0.9} fill={glow} opacity={0.9} /></g>); }
		const ds = parts.map((q) => q.d).join(' ') + ' ' + extraD;
		return <g key={i} transform={p.flip ? `translate(${f1(2 * x)},0) scale(-1,1)` : undefined}>
			<g transform={`translate(${f1(rimDx * (p.flip ? -1 : 1) * Math.max(0.6, h / 300))},${f1(-1.2 * Math.max(0.6, h / 300))})`}><Shape d={ds} fill={r} /></g><Shape d={ds} fill={c} /></g>; });
	return <g>{shapes}{glows}</g>; };

/* ===================================================== 6 · THE HUMBER BRIDGE IN FOG =====================================================
   1 Nov 2026, the last crossing. Thick estuary fog. The deck recedes to the north end where the first tower's legs rise and vanish
   into the fog; hangers march away like ghosts; lamp heads glow in it. People line the footpath railing; far off, a faint warm glow
   where Hull is. Karl hauls the cart toward it. Foreground: blurred onlookers. */
const BW: World = {hz: 512, vpx: 1520, S: 668, camH: 1.7};
const BF = 4;
const bridgePpl = (): Person[] => { const out: Person[] = [];
	for (let i = 0; i < 46; i++) { const D = 6.2 * Math.pow(7, rnd(i, 3)), pose = ['stand', 'phone', 'wave', 'cheer', 'phone', 'stand', 'high'][Math.floor(rnd(i, 4) * 7)];
		out.push({X: -6.1 - rnd(i, 5) * 0.4, D, m: 1.6 + rnd(i, 6) * 0.28, pose, look: Math.floor(rnd(i, 7) * 6), flip: rnd(i, 8) > 0.35, phone: pose === 'phone' || pose === 'high'}); }
	for (let i = 0; i < 26; i++) { const D = 14 * Math.pow(3, rnd(i, 13)), pose = ['stand', 'wave', 'cheer', 'phone'][Math.floor(rnd(i, 14) * 4)];
		out.push({X: 9.4 + rnd(i, 15) * 0.4, D, m: 1.6 + rnd(i, 16) * 0.28, pose, look: Math.floor(rnd(i, 17) * 6), flip: true, phone: pose === 'phone'}); }
	out.push({X: -6.2, D: 2.9, m: 1.78, pose: 'phone', look: 3, flip: true, phone: true}, {X: -6.3, D: 3.3, m: 1.62, pose: 'wave', look: 1, flip: true});
	return out; };
const BPPL = bridgePpl();

/** the deck: footpath, kerb, road with lane lines, the far footpath; railings with balusters (all spanning depth) */
const Deck: React.FC = () => {
	const wp = useWorld(BW), strip = (X0: number, X1: number, D0 = 0.6, D1 = 400) => poly([wp(X0, 0, D0), wp(X1, 0, D0), wp(X1, 0, D1), wp(X0, 0, D1)]);
	const dashes = Array.from({length: 40}, (_, i) => { const d0 = 0.8 + i * 1.6, d1 = d0 + 0.7; return [0.2, 3.6].map((X) => poly([wp(X, 0, d0), wp(X + 0.15, 0, d0), wp(X + 0.15, 0, d1), wp(X, 0, d1)])).join(' '); }).join(' ');
	const rail = (X: number, Y: number, th: number) => poly([wp(X, Y, 0.7), wp(X, Y, 300), wp(X, Y - th, 300), wp(X, Y - th, 0.7)]);
	const posts = (X: number) => Array.from({length: 90}, (_, i) => { const d = 0.9 + i * 0.42; return poly([wp(X, 0, d), wp(X, 1.25, d), wp(X + 0.0, 1.25, d + 0.08), wp(X, 0, d + 0.08)]); }).join(' ');
	return <g>
		<defs><linearGradient id="bdeck" gradientUnits="userSpaceOnUse" x1="0" y1={BW.hz} x2="0" y2={H}><stop offset="0" stopColor="#9ca3aa" /><stop offset="0.25" stopColor="#6f767f" /><stop offset="1" stopColor="#2f3238" /></linearGradient>
			<linearGradient id="bpath" gradientUnits="userSpaceOnUse" x1="0" y1={BW.hz} x2="0" y2={H}><stop offset="0" stopColor="#a7adb3" /><stop offset="0.25" stopColor="#868c93" /><stop offset="1" stopColor="#4c5056" /></linearGradient></defs>
		<path d={strip(-3.4, 8.8)} fill="url(#bdeck)" />
		<path d={strip(-6.6, -3.6)} fill="url(#bpath)" /><path d={strip(9.0, 12)} fill="url(#bpath)" />
		<path d={strip(-3.65, -3.4)} fill="#b9bec3" opacity={0.7} />
		<path d={dashes} fill="#c9ccc6" opacity={0.55} />
		<Shape d={posts(-6.7)} fill="#3a3f46" o={0.85} />
		<path d={rail(-6.7, 1.28, 0.1) + ' ' + rail(-6.7, 0.7, 0.05)} fill="#3a3f46" />
		<path d={rail(12.1, 1.28, 0.1)} fill="#4a4f56" />
	</g>; };

/** the near tower's two legs rising out of frame into the fog (a gradient from the deck up into the haze), and the far tower as a ghost */
const Tower: React.FC<{D: number; ghost?: boolean}> = ({D, ghost}) => {
	const fog = useFog(), s = BW.S / D, legs = [-8.6, 12.4].map((X) => { const [x, y] = wpt(BW, X, 0, D), w0 = 7 * s, w1 = 5 * s, top = y - 160 * s;
		return poly([[x - w0 / 2, y + 0.4 * s], [x + w0 / 2, y + 0.4 * s], [x + w1 / 2, top], [x - w1 / 2, top]]); }).join(' ');
	const id = ghost ? 'btg' : 'btn', y0 = wpt(BW, 0, 0, D)[1];
	return <g><defs><linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={y0 + 10} x2="0" y2={ghost ? y0 - 500 : 40}>
		<stop offset="0" stopColor={fog('#22262c', ghost ? -0.3 : -0.4)} /><stop offset="0.45" stopColor={fog('#30353c', ghost ? -0.25 : -0.3)} stopOpacity={0.9} /><stop offset="1" stopColor={fog('#a7aeb4')} stopOpacity={0} /></linearGradient></defs>
		<Shape d={legs} fill={`url(#${id})`} />
	</g>; };

/** the main cable's height (m) over the deck at depth D: low toward us, rising to the tower saddle (stylised so it sweeps through frame) */
const cableY = (D: number, top: number) => 1.7 + (BW.hz - (top - Math.pow(D / 24, 1.3) * 640)) * D / BW.S;
/** hangers: vertical cables from the main cable down to the deck edge, marching away; and the main cable through their tops */
const Hangers: React.FC<{X: number; from: number; to: number; step: number; top?: number}> = ({X, from, to, step, top = 70}) => {
	const wp = useWorld(BW), out: React.ReactNode[] = [], cable: P[] = [];
	for (let D = from, i = 0; D < to; D += step * (1 + D * 0.02), i++) { const b = wp(X, 1.2, D), tp = wp(X, cableY(D, top), D), wd = Math.max(0.8, 0.07 * BW.S / D), k = cl(1 - Math.exp(-0.06 * D));
		cable.push(tp); out.push(<path key={i} d={poly([[b[0] - wd / 2, b[1]], [b[0] + wd / 2, b[1]], [tp[0] + wd / 2, tp[1]], [tp[0] - wd / 2, tp[1]]])} fill={mix('#3e444b', '#aab1b7', k)} />); }
	const pre = wp(X, cableY(0.8, top), 0.8);
	const id = `cab${Math.round(X * 10)}`, xs = cable.map((p) => p[0]);
	return <g>{out}<defs><linearGradient id={id} gradientUnits="userSpaceOnUse" x1={pre[0]} y1="0" x2={Math.max(...xs)} y2="0"><stop offset="0" stopColor="#353b42" /><stop offset="0.45" stopColor="#4a5057" /><stop offset="0.8" stopColor="#9aa1a7" stopOpacity={0.5} /><stop offset="1" stopColor="#a9b0b6" stopOpacity={0} /></linearGradient></defs>
		<path d={spline([pre, ...cable.filter((p) => p[1] > -400)], false)} fill="none" stroke={`url(#${id})`} strokeWidth={10} strokeLinecap="round" /></g>; };

/** lamp posts with warm heads haloed in fog */
const Lamps: React.FC<{X: number; Ds: number[]}> = ({X, Ds}) => {
	const fog = useFog(), wp = useWorld(BW);
	return <g>{Ds.map((D, i) => { const b = wp(X, 0, D), tp = wp(X, 9.5, D), arm = wp(X + 1.2, 9.6, D), s = BW.S / D, k = cl(1 - Math.exp(-0.05 * D));
		return <g key={i}><path d={poly([[b[0] - 0.09 * s, b[1]], [b[0] + 0.09 * s, b[1]], [tp[0] + 0.06 * s, tp[1]], [tp[0] - 0.06 * s, tp[1]]])} fill={mix('#353a41', '#a9b0b6', k)} />
			<path d={`M${f1(tp[0])},${f1(tp[1])} Q${f1(tp[0] + 0.4 * s)},${f1(tp[1] - 0.5 * s)} ${f1(arm[0])},${f1(arm[1])}`} fill="none" stroke={mix('#353a41', '#a9b0b6', k)} strokeWidth={Math.max(0.8, 0.1 * s)} />
			<Glow x={arm[0]} y={arm[1] + 0.1 * s} r={Math.max(30, 4.2 * s)} c="#ffd49a" o={0.55 * (1 - k * 0.5)} />
			<Glow x={arm[0]} y={arm[1] + 0.1 * s} r={Math.max(8, 0.8 * s)} c="#fff2d8" o={0.9 * (1 - k * 0.6)} /></g>; })}</g>; };

/** blurred onlookers in the foreground: backs of heads and shoulders, a phone held up */
const FgCrowd: React.FC = () => <g>
	<path d={`M-120,1200 L-110,820 Q-100,700 30,690 L170,690 Q300,700 310,820 L330,1200 Z M40,690 a92,110 0 1,1 120,-10 Z`} fill="#121418" />
	<path d={`M1640,1200 L1660,900 Q1680,800 1790,790 L1900,790 Q2020,800 2030,900 L2050,1200 Z M1770,790 a84,96 0 1,1 100,-6 Z`} fill="#15171b" />
	<path d={taper([[1700, 860], [1640, 720], [1600, 600]], 46, 34)} fill="#15171b" />
	<rect x={1560} y={520} width={64} height={110} rx={8} fill="#1b1d22" /><rect x={1567} y={528} width={50} height={92} rx={4} fill="#c8dcf2" opacity={0.85} />
	<Glow x={1592} y={574} r={140} c="#cfe0f6" o={0.35} />
</g>;

export const Bridge: React.FC<SetProps> = ({t, cam}) => {
	const ph = karlTravel('pushCart', t, 300).phase, Ds = [7, 11, 16, 22, 30, 40, 54];
	const near = BPPL.filter((p) => p.D < 6.5), mid = BPPL.filter((p) => p.D >= 6.5 && p.D < 13), far = BPPL.filter((p) => p.D >= 13);
	return <Stage t={t} cam={cam} atm={{haze: '#a9b0b6', density: 0.055, focus: BF, aperture: 1.6, rim: '#ffd8a2', lightDir: 55, grain: 0.07, vignette: 0.55, pp: [BW.vpx, BW.hz]}} bg="#5c636b">
		<Layer D={INF}>
			<SkyGrad y0={0} y1={H} stops={[[0, '#6d7680'], [0.3, '#8d959d'], [0.47, '#b2b8bd'], [0.5, '#bcc1c4'], [1, '#9aa1a8']]} />
			<Glow x={BW.vpx + 40} y={BW.hz - 10} r={520} ry={200} c={GOLD} o={0.22} />
			<Glow x={BW.vpx + 40} y={BW.hz - 4} r={180} ry={60} c="#ffe2a8" o={0.35} />
		</Layer>
		<Layer D={120}><Tower D={120} ghost /></Layer>
		<Layer D={INF}><Deck /></Layer>
		<Layer D={40}><FogBand y={BW.hz + 4} h={160} o={0.8} /></Layer>
		<Layer D={24}><Tower D={24} /></Layer>
		<Layer D={20}><People w={BW} ppl={far} col="#3c4249" rim="#ffd8a2" rimDx={1.2} /></Layer>
		<Layer D={INF}><Hangers X={-7.3} from={1.2} to={160} step={1.6} top={250} /><Hangers X={12.6} from={3} to={160} step={1.6} top={300} /><Lamps X={-3.7} Ds={Ds} /></Layer>
		<Layer D={18}><Mist n={7} seed={12} y0={60} y1={420} t={t} speed={10} o={0.35} c="#c2c7cb" w={[900, 1800]} h={[120, 260]} /></Layer>
		<Layer D={14}><Mist n={6} seed={4} y0={BW.hz - 120} y1={BW.hz + 60} t={t} speed={14} o={0.5} c="#c3c8cc" w={[700, 1600]} h={[90, 200]} /></Layer>
		<Layer D={9}><People w={BW} ppl={mid} col="#262a30" rim="#ffd8a2" rimDx={1.5} /></Layer>
		<Layer D={6}><Mist n={4} seed={7} y0={BW.hz - 40} y1={BW.hz + 160} t={t} speed={18} o={0.3} c="#c9cdd0" w={[800, 1700]} h={[100, 220]} /></Layer>
		<Layer D={5}><People w={BW} ppl={near} col="#17191d" rim="#ffd8a2" rimDx={1.8} /></Layer>
		<FigureSlot x={690} y={wpt(BW, 0, 0, BF)[1]} h={300} attire="home2026" action="pushCart" phase={ph} facing={1} rim="#ffd8a2" lightDir={55} contact={0.25} />
		<Particles kind="rain" n={120} seed={61} D={[1, 10]} c="#dfe5ea" o={0.35} wind={-60} fall={-700} />
		<Layer D={1.5} blur={9}><FgCrowd /></Layer>
	</Stage>;
};

/* ===================================================== 6b · HULL, THE HOMECOMING =====================================================
   2 Nov 2026, blue hour, drizzle. A red-brick terrace recedes to the right; every window is lit and bunting crosses the street.
   His mother waits in the open door under the WELCOME HOME SON banner (the gold light of home); Karl walks the last metres toward
   her; the press pack fires flashes from the right. Wet tarmac doubles every light. */
const HW: World = {hz: 500, vpx: 1520, S: 900, camH: 1.7};
const HF = 5.6, HD = {d0: 3.6, d1: 5.75, door: [4.95, 5.36] as [number, number]};   // mum's house: depth span, door span
const HOUSE = 2.15;   // one house = this many depth units (≈ 5 m)

/** the left terrace: façades (brick), doors, bay windows, sashes, roofline with chimneys; mum's door open and gold */
const Terrace: React.FC<{X: number; from: number; to: number; side: 1 | -1; t: number}> = ({X, from, to, side, t}) => {
	const wp = useWorld(HW), fog = useFog(), q = (x0: number, d0: number, d1: number, y0: number, y1: number) => poly([wp(x0, y0, d0), wp(x0, y0, d1), wp(x0, y1, d1), wp(x0, y1, d0)]);
	const walls: string[] = [], trims: string[] = [], dark: string[] = [], lit: string[] = [], frames: string[] = [], roofs: string[] = [], chim: string[] = [];
	for (let d = from, i = 0; d < to; d += HOUSE, i++) {
		const d1 = d + HOUSE, mum = side < 0 && Math.abs(d - HD.d0) < 0.01;
		walls.push(q(X, d, d1, 0, 6.6));
		trims.push(q(X, d, d1, 6.6, 6.9), q(X, d, d1, 3.0, 3.12));
		roofs.push(poly([wp(X, 6.9, d), wp(X, 6.9, d1), wp(X + side * 3.2, 9.4, d1), wp(X + side * 3.2, 9.4, d)]));
		chim.push(poly([wp(X + side * 1.4, 8.0, d - 0.05), wp(X + side * 1.4, 8.0, d + 0.3), wp(X + side * 1.4, 10.3, d + 0.3), wp(X + side * 1.4, 10.3, d - 0.05)]));
		const door: [number, number] = side < 0 ? [d + HOUSE * 0.62, d + HOUSE * 0.81] : [d + HOUSE * 0.2, d + HOUSE * 0.39], bay: [number, number] = side < 0 ? [d + HOUSE * 0.14, d + HOUSE * 0.52] : [d + HOUSE * 0.5, d + HOUSE * 0.88];
		if (!mum) { dark.push(q(X, door[0], door[1], 0, 1.75)); lit.push(q(X, door[0] + 0.02, door[1] - 0.02, 1.82, 2.12)); }
		trims.push(q(X, d + 0.01, d + 0.05, 0, 6.6));
		const on = (k: number) => mum || rnd(i * 3 + k, 7 + side) > 0.22;
		(on(0) ? lit : dark).push(q(X, bay[0], bay[1], 0.75, 2.35));
		frames.push(q(X, (bay[0] + bay[1]) / 2 - 0.02, (bay[0] + bay[1]) / 2 + 0.02, 0.75, 2.35), q(X, bay[0], bay[1], 1.75, 1.8));
		for (const [k, u0, u1] of [[1, 0.14, 0.38], [2, 0.56, 0.8]] as [number, number, number][]) { const a = d + HOUSE * u0, b = d + HOUSE * u1; (on(k) ? lit : dark).push(q(X, a, b, 3.7, 5.5)); frames.push(q(X, a, b, 4.55, 4.62)); }
	}
	return <g>
		<defs><linearGradient id={`tw${side}`} gradientUnits="userSpaceOnUse" x1="0" y1={0} x2="0" y2={H}><stop offset="0" stopColor={fog('#4d2c27')} /><stop offset="1" stopColor={fog('#2e1a19')} /></linearGradient>
			<linearGradient id={`tl${side}`} gradientUnits="userSpaceOnUse" x1="0" y1={0} x2="0" y2={H}><stop offset="0" stopColor="#ffcf86" /><stop offset="1" stopColor="#f0a04e" /></linearGradient></defs>
		<Shape d={roofs.join(' ')} fill={fog('#2c3044')} /><Shape d={roofs.join(' ')} fill={fog('#5a6078')} o={0.35} transform="translate(0,-2)" /><Shape d={roofs.join(' ')} fill={fog('#2a2e40')} /><Shape d={chim.join(' ')} fill={fog('#3a2622')} />
		<Shape d={walls.join(' ')} fill={`url(#tw${side})`} /><Shape d={trims.join(' ')} fill={fog('#6b5a50')} />
		<Shape d={dark.join(' ')} fill={fog('#14141c')} /><Shape d={lit.join(' ')} fill={`url(#tl${side})`} o={0.92} /><Shape d={frames.join(' ')} fill={fog('#3a2522')} />
	</g>; };

/** mum's open door: gold light, the step, the light spilling on the pavement; and the banner above the bay */
const MumsDoor: React.FC<{t: number}> = ({t}) => {
	const wp = useWorld(HW), [a, b] = HD.door, X = -5.5;
	const door = poly([wp(X, 0, a), wp(X, 0, b), wp(X, 2.15, b), wp(X, 2.15, a)]), inner = poly([wp(X - 0.05, 0, a + 0.02), wp(X - 0.05, 0, b - 0.02), wp(X - 0.05, 2.1, b - 0.02), wp(X - 0.05, 2.1, a + 0.02)]);
	const spill = poly([wp(X, 0, a), wp(X, 0, b), wp(-2.2, 0, b + 0.7), wp(-2.0, 0, a - 0.5)]);
	const dc: P = wp(X, 1.1, (a + b) / 2);
	return <g>
		<defs><linearGradient id="hspill" gradientUnits="userSpaceOnUse" x1={wp(X, 0, a)[0]} y1="0" x2={wp(-2.2, 0, a)[0]} y2="0"><stop offset="0" stopColor={GOLD} stopOpacity="0.75" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></linearGradient></defs>
		<path d={spill} fill="url(#hspill)" />
		<path d={door} fill="#ffcf7a" /><path d={inner} fill="#ffe2a6" />
		<Glow x={dc[0]} y={dc[1]} r={260} ry={300} c={GOLD} o={0.45} />
	</g>; };
const Banner: React.FC<{t: number}> = ({t}) => {
	const wp = useWorld(HW), X = -5.45, d0 = HD.d0 + 0.15, d1 = HD.d1 - 0.12, y0 = 2.62, y1 = 3.34;
	const A = wp(X, y1, d0), B = wp(X, y1, d1), C = wp(X, y0, d1), Dp = wp(X, y0, d0), sag = (A[1] - Dp[1]) * -0.06;
	const cloth = `M${f1(A[0])},${f1(A[1])} Q${f1((A[0] + B[0]) / 2)},${f1((A[1] + B[1]) / 2 + sag)} ${f1(B[0])},${f1(B[1])} L${f1(C[0])},${f1(C[1])} Q${f1((C[0] + Dp[0]) / 2)},${f1((C[1] + Dp[1]) / 2 + sag)} ${f1(Dp[0])},${f1(Dp[1])} Z`;
	// the lettering: an affine map of a 1000 × 100 text box onto the banner quad (A top-near, B top-far, D bottom-near)
	const m = `matrix(${((B[0] - A[0]) / 1000).toFixed(4)},${((B[1] - A[1]) / 1000).toFixed(4)},${((Dp[0] - A[0]) / 100).toFixed(4)},${((Dp[1] - A[1]) / 100).toFixed(4)},${f1(A[0])},${f1(A[1] + sag * 0.6)})`;
	return <g><path d={cloth} fill="#e9dcc0" /><path d={cloth} fill="#3a1e22" opacity={0.12} transform="translate(0,4)" />
		<text transform={m} x={500} y={72} textAnchor="middle" textLength={900} lengthAdjust="spacingAndGlyphs" style={{fontFamily: "'Inter Display', 'DejaVu Sans', sans-serif", fontWeight: 900, fontSize: 62}} fill="#7a1f24">WELCOME HOME SON</text></g>; };

/** bunting strung across the street: zig-zag strings of small flags (spanning depth) */
const Bunting: React.FC<{t: number}> = ({t}) => {
	const wp = useWorld(HW), out: React.ReactNode[] = [];
	[4.2, 7.0, 10.5, 15, 21, 29].forEach((D, j) => { const L = wp(-5.5, 5.3, D), R = wp(6.5, 5.3, D + 1.4), n = 18, cols = ['#c8b48a', '#8a3a36', '#3e4f6e', '#d8cfb8'];
		const pts = Array.from({length: n + 1}, (_, i) => { const u = i / n; return [lerp(L[0], R[0], u), lerp(L[1], R[1], u) + Math.sin(Math.PI * u) * (R[1] - L[1] + 200 / D * 3) * 0.0 + Math.sin(Math.PI * u) * 90 / D * 4] as P; });
		out.push(<path key={`s${j}`} d={'M' + pts.map((p) => `${f1(p[0])},${f1(p[1])}`).join(' L')} fill="none" stroke="#2a2630" strokeWidth={Math.max(0.6, 5 / D)} />);
		pts.slice(0, n).forEach((p, i) => { const q = pts[i + 1], sw = Math.sin(t * 2 + i + j) * 0.6, len = 160 / D;
			out.push(<path key={`f${j}_${i}`} d={poly([[p[0] + (q[0] - p[0]) * 0.1, p[1]], [p[0] + (q[0] - p[0]) * 0.9, q[1] * 0.8 + p[1] * 0.2], [(p[0] + q[0]) / 2 + sw * len * 0.1, (p[1] + q[1]) / 2 + len]])} fill={mix(cols[(i + j) % 4], '#2a3450', cl(D / 40))} />); }); });
	return <g>{out}</g>; };

/** the wet street: tarmac, kerbs, pavements, and every lit window doubled as a soft streak in the wet road */
const Street: React.FC = () => {
	const wp = useWorld(HW), strip = (X0: number, X1: number, D0 = 0.5, D1 = 400) => poly([wp(X0, 0, D0), wp(X1, 0, D0), wp(X1, 0, D1), wp(X0, 0, D1)]);
	const refl = Array.from({length: 20}, (_, i) => { const D = 4 + i * 2.15 * 0.5, side = i % 2 ? -1 : 1, X = side < 0 ? -3.0 : 3.0, a = wp(X, 0, D), b = wp(X, 0, D + 0.6), len = 900 / D;
		return <Glow key={i} x={(a[0] + b[0]) / 2} y={a[1] + len * 0.3} r={Math.max(8, 260 / D)} ry={len * 0.6} c="#ffb860" o={0.35 * (1 - i / 22)} />; });
	return <g>
		<defs><linearGradient id="hroad" gradientUnits="userSpaceOnUse" x1="0" y1={HW.hz} x2="0" y2={H}><stop offset="0" stopColor="#4a4a5c" /><stop offset="0.3" stopColor="#25263a" /><stop offset="1" stopColor="#14151f" /></linearGradient></defs>
		<path d={strip(-3.6, 4.6)} fill="url(#hroad)" />
		<path d={strip(-5.5, -3.6)} fill="#2f2c36" /><path d={strip(4.6, 6.5)} fill="#2f2c36" />
		<path d={strip(-3.7, -3.55)} fill="#6a6670" opacity={0.7} /><path d={strip(4.55, 4.7)} fill="#6a6670" opacity={0.6} />
		{refl}
	</g>; };

/** a street lamp with a warm halo */
const HLamp: React.FC<{X: number; D: number}> = ({X, D}) => { const b = wpt(HW, X, 0, D), tp = wpt(HW, X, 5.6, D), s = HW.S / D, fog = useFog();
	return <g><path d={poly([[b[0] - 0.07 * s, b[1]], [b[0] + 0.07 * s, b[1]], [tp[0] + 0.05 * s, tp[1]], [tp[0] - 0.05 * s, tp[1]]])} fill={fog('#1c1c26')} />
		<path d={poly([[tp[0] - 0.22 * s, tp[1]], [tp[0] + 0.22 * s, tp[1]], [tp[0] + 0.12 * s, tp[1] - 0.5 * s], [tp[0] - 0.12 * s, tp[1] - 0.5 * s]])} fill={fog('#1c1c26')} />
		<Glow x={tp[0]} y={tp[1] + 0.15 * s} r={2.6 * s} c="#ffc37a" o={0.5} /><Glow x={tp[0]} y={tp[1] + 0.15 * s} r={0.45 * s} c="#fff0d0" o={0.95} /></g>; };

/** camera flashes: white bursts that pop and fade on their own clock */
const Flashes: React.FC<{t: number; pts: P[]}> = ({t, pts}) => <g>{pts.map(([x, y], i) => { const per = 1.7 + i * 0.63, u = ((((t - 1.98 - i * 0.71) % per) + per) % per), o = u < 0.16 ? 1 - u / 0.16 : 0; if (o <= 0.01) return null;
	return <g key={i} opacity={o}><Glow x={x} y={y} r={160} c="#eef4ff" o={0.7} /><Glow x={x} y={y} r={24} c="#ffffff" o={1} />
		<path d={`M${x - 70},${y} L${x},${y - 3} L${x + 70},${y} L${x},${y + 3} Z M${x},${y - 50} L${x + 3},${y} L${x},${y + 50} L${x - 3},${y} Z`} fill="#ffffff" opacity={0.85} /></g>; })}</g>;

const pressPpl: Person[] = [
	{X: -0.9, D: 4.6, m: 1.68, pose: 'phone', look: 4, flip: true, phone: true}, {X: 0.1, D: 4.9, m: 1.74, pose: 'stand', look: 0, flip: true},
	{X: 1.3, D: 4.4, m: 1.7, pose: 'high', look: 1, flip: true, phone: true}, {X: -0.3, D: 3.9, m: 1.78, pose: 'press', look: 0, flip: true, cam: true},
	{X: 2.2, D: 4.0, m: 1.76, pose: 'press', look: 5, flip: true, cam: true}, {X: 0.7, D: 3.4, m: 1.82, pose: 'press', look: 3, flip: true, cam: true},
	{X: 1.9, D: 3.2, m: 1.86, pose: 'high', look: 2, flip: true, cam: true}, {X: 3.2, D: 3.5, m: 1.72, pose: 'phone', look: 4, flip: true, phone: true},
];
/** a TV cameraman (shoulder camera) and a boom mic reaching over toward Karl */
const TvCrew: React.FC = () => { const [x, y] = wpt(HW, 1.2, 0, 2.9), s = HW.S / 2.9, fog = useFog();
	const body = figParts(x, y, 1.84 * s, POSES.press, LOOKS[3]).map((q) => q.d).join(' ');
	const cam = `M${f1(x - 0.05 * s)},${f1(y - 1.72 * s)} l${f1(-0.55 * s)},${f1(-0.02 * s)} l0,${f1(-0.26 * s)} l${f1(0.7 * s)},${f1(-0.04 * s)} l${f1(0.1 * s)},${f1(0.14 * s)} Z M${f1(x - 0.6 * s)},${f1(y - 1.86 * s)} l${f1(-0.22 * s)},${f1(-0.04 * s)} l0,${f1(0.16 * s)} l${f1(0.22 * s)},0 Z`;
	const [bx, by] = wpt(HW, 2.6, 0, 3.3), bs = HW.S / 3.3, boom = taper([[bx, by - 1.5 * bs], [bx - 1.6 * bs, by - 2.6 * bs], [bx - 3.4 * bs, by - 3.3 * bs]], 0.05 * bs, 0.035 * bs);
	return <g transform={`translate(${f1(2 * x)},0) scale(-1,1)`}><Shape d={body + ' ' + cam} fill={fog('#0c0d12')} /><g transform={`translate(${f1(2 * x)},0) scale(-1,1)`}><path d={boom} fill={fog('#14151c')} />
		<ellipse cx={bx - 3.45 * bs} cy={by - 3.3 * bs} rx={0.28 * bs} ry={0.11 * bs} fill={fog('#2a2b34')} /></g></g>; };
const streetPpl: Person[] = Array.from({length: 24}, (_, i) => { const D = 7.5 * Math.pow(4, rnd(i, 21)), side = rnd(i, 22) > 0.5 ? -1 : 1, pose = ['stand', 'wave', 'cheer', 'phone', 'stand'][Math.floor(rnd(i, 23) * 5)];
	return {X: side < 0 ? -4.6 - rnd(i, 24) * 0.6 : 5.0 + rnd(i, 24) * 0.8, D, m: 1.6 + rnd(i, 25) * 0.25, pose, look: Math.floor(rnd(i, 26) * 6), flip: side > 0, phone: pose === 'phone'}; });

/** his mother in the doorway (the karl3 rig's <Mum/>), backlit by the hall light */
const Mum: React.FC = () => { const dm = (HD.door[0] + HD.door[1]) / 2 - 0.1, [x, y] = wpt(HW, -5.15, 0.12, dm), h = 1.6 * HW.S / dm;
	return <RigMum x={x} y={y} h={h} action="reach" phase={0.3} facing={1} rim="#ffd68a" lightDir={175} rimO={1} />; };

export const Hull: React.FC<SetProps> = ({t, cam}) => {
	const ph = karlTravel('pushCart', t, 1.8 * HW.S / HF).phase, ky = wpt(HW, 0, 0, HF)[1];
	return <Stage t={t} cam={cam} atm={{haze: '#3b4462', density: 0.05, focus: HF, aperture: 2.2, rim: '#ffcf7a', lightDir: 165, grain: 0.07, vignette: 0.6, pp: [HW.vpx, HW.hz]}} bg="#121628">
		<Layer D={INF}>
			<SkyGrad y0={0} y1={H} stops={[[0, '#0f1630'], [0.25, '#1d2a4c'], [0.42, '#36446c'], [0.47, '#5a5c7c'], [0.5, '#7a6a78'], [1, '#2a2c40']]} />
			<Glow x={HW.vpx} y={HW.hz - 20} r={700} ry={200} c="#ffb070" o={0.22} />
		</Layer>
		<Layer D={INF}><Street /></Layer>
		<Layer D={30}><Terrace X={6.5} from={10} to={70} side={1} t={t} /></Layer>
		<Layer D={14}><People w={HW} ppl={streetPpl.filter((p) => p.D >= 11)} col="#1a1b26" rim="#ffbf78" rimDx={1.2} /></Layer>
		<Layer D={10}><Terrace X={-5.5} from={HD.d0 + 2 * HOUSE} to={70} side={-1} t={t} /></Layer>
		<Layer D={INF}><Bunting t={t} /></Layer>
		{[[-4.9, 9], [-4.9, 16], [5.6, 12], [5.6, 22]].map(([X, D], i) => <Layer key={i} D={D}><HLamp X={X} D={D} /></Layer>)}
		<Layer D={8}><People w={HW} ppl={streetPpl.filter((p) => p.D < 11)} col="#15161f" rim="#ffbf78" rimDx={1.4} /></Layer>
		<Layer D={4.6}><Terrace X={-5.5} from={HD.d0 - HOUSE} to={HD.d0 + 2 * HOUSE} side={-1} t={t} /><MumsDoor t={t} /><Banner t={t} /><Mum /></Layer>
		<FigureSlot x={wpt(HW, -3.6, 0, HF)[0] + 190} y={ky} h={1.8 * HW.S / HF} attire="home2026" action="pushCart" phase={ph} facing={-1} rim="#ffcf7a" lightDir={168} rimO={0.95} reflect={{wy: ky + 2, o: 0.25}} />
		<Layer D={3.8}><People w={HW} ppl={pressPpl} col="#0f1016" rim="#7f8db0" rimDx={-1.1} /></Layer>
		<Layer D={2.9}><TvCrew /></Layer>
		<Flashes t={t} pts={[[1600, 470], [1300, 520], [1760, 440]]} />
		<Particles kind="rain" n={120} seed={71} D={[1.2, 12]} c="#c9d2e6" o={0.4} wind={-120} />
		<Layer D={1.4} blur={10}><FgPress /></Layer>
	</Stage>;
};
/** blurred press heads and a long lens in the bottom-right foreground */
const FgPress: React.FC = () => <g fill="#0b0c11">
	<path d="M1380,1200 L1400,960 Q1420,880 1520,872 L1620,872 Q1720,880 1740,960 L1760,1200 Z M1500,872 a80,92 0 1,1 100,-4 Z" />
	<path d="M1900,1200 L1880,930 Q1900,860 1990,850 L2100,850 L2100,1200 Z M1940,850 a76,86 0 1,1 90,-2 Z" />
	<path d="M1520,820 L1380,760 L1360,800 L1500,860 Z" /><rect x={1300} y={740} width={90} height={74} rx={10} transform="rotate(22 1345 777)" />
	<path d="M-100,1200 L-80,980 Q-60,920 40,914 L120,914 Q200,920 214,990 L230,1200 Z M30,914 a70,80 0 1,1 80,-4 Z" />
</g>;
