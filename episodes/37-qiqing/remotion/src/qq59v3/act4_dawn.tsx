import React from 'react';
import {Stage, Layer, Shape, FigureSlot, Particles, Glow, SkyGrad, INF, W, H, P, f1, lerp, rnd, cl, sm, mix, poly, taper, GOLD, useUid, useStage, hazeK} from './kit3';
import {Mum as RigMum, Cart, Action} from './karl3';
import {CloudBands} from './props3';
import {figParts, grounded, PZ, LOOK, Look59, Pose, jointAt} from '../qq59/figure59';
import {W4, wp4, px4} from './act4_sets';

/* ep59 v3 · act 4's Hull street = ACT 1's street (act1_a DawnStreet: mum's house on the right, the street receding to the dawn glow
   upper left, the cream door frame, the leaf hinged on its near edge), copied here (act1_a stays untouched) and rebuilt on the act's
   true camera (W4: every point projected from world metres; truck camX, crane camH, shift hz/vpx, dolly dz, lens S), so `door2`
   can open on exactly the framing the film opened on (DOOR_END), and the act's other street shots stay in the same place and light.
   Added for act 4: the WELCOME HOME SON banner, the press pack and their flashes, the crowd on the far pavement and in the road,
   mum stepping out of the door, the hug, a parked cart anywhere, and the rest of the town (back rows of roofs, the estuary and the
   bridge on the horizon) for the crane up. */

/** act 1's street world (DW) and its fixed points: façade plane FX (right), mum's door, Karl's mark, mum's mark, house length */
export const DW4: W4 = {hz: 470, vpx: 330, S: 1000, camH: 1.55, camX: 0, dz: 0};
export const DF = 3.9, FX = 3.0, DOOR: [number, number] = [3.5, 4.4], KX = 1.7, MD = 3.97, HOUSE = 5.4, H0 = 1.2;
/** act 1's door shot ends on its push (doorCam at t = dur: x 26 px, y −10 px, z 0.48 at focus 3.9): the same view in W4 terms */
export const DOOR_END: Partial<W4> = {camX: 26 * DF / 1000, camH: 1.55 + 10 * DF / 1000, dz: -0.48};
const NEAR = 0.3;

const useFog4 = (w: W4) => { const {atm} = useStage(); return (c: string, D: number, extra = 0) => mix(c, atm.haze, cl(hazeK(atm, Math.max(0.3, D + w.dz)) + extra)); };

/* ---------- people (as act4_sets) ---------- */
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
type Person = {X: number; D: number; m: number; pose: string; look: number; flip?: boolean; phone?: boolean; cam?: boolean};
const People: React.FC<{w: W4; ppl: Person[]; col: string; rim: string; rimDx: number; t: number}> = ({w, ppl, col, rim, rimDx, t}) => {
	const fog = useFog4(w), glows: React.ReactNode[] = [];
	const shapes = [...ppl].filter((p) => p.D + w.dz > 0.9).sort((a, b) => b.D - a.D).map((p, i) => {
		const [x, y] = wp4(w, p.X, 0, p.D), h = p.m * px4(w, p.D);
		if (x < -300 || x > W + 300 || y - h > H + 50 || y < -50) return null;
		const pose = POSES[p.pose], parts = figParts(x, y, h, pose, LOOKS[p.look % LOOKS.length]);
		let extraD = '';
		if (p.cam || p.phone) { const hand = jointAt(pose, p.pose === 'high' ? 'RHand' : 'LHand', x, y, h, p.flip), sz = h * (p.cam ? 0.07 : 0.045), dir = p.flip ? -1 : 1;
			extraD = `M${f1(hand[0] - sz * 0.2 * dir)},${f1(hand[1] - sz * 0.7)} l${f1(sz * 1.4 * dir)},0 l0,${f1(sz * 1.1)} l${f1(-sz * 1.4 * dir)},0 Z` + (p.cam ? ` M${f1(hand[0] + sz * 1.1 * dir)},${f1(hand[1] - sz * 0.45)} l${f1(sz * 0.9 * dir)},0 l0,${f1(sz * 0.7)} l${f1(-sz * 0.9 * dir)},0 Z` : '');
			if (p.phone) { const tw = 0.75 + 0.25 * Math.sin(t * 1.3 + i * 2.7);
				glows.push(<g key={i} opacity={tw}><Glow x={hand[0] + sz * 0.5 * dir} y={hand[1] - sz * 0.15} r={Math.max(6, sz * 3)} c="#cfe2ff" o={0.5} /><rect x={hand[0] + (dir > 0 ? -sz * 0.1 : -sz * 1.1)} y={hand[1] - sz * 0.6} width={sz * 1.2} height={sz * 0.9} fill="#dfeaff" opacity={0.9} /></g>); } }
		const ds = parts.map((q) => q.d).join(' ') + ' ' + extraD, k = Math.max(0.6, h / 300);
		return <g key={i} transform={p.flip ? `translate(${f1(2 * x)},0) scale(-1,1)` : undefined}>
			<g transform={`translate(${f1(rimDx * (p.flip ? -1 : 1) * k)},${f1(-1.2 * k)})`}><Shape d={ds} fill={fog(rim, p.D, 0.1)} /></g><Shape d={ds} fill={fog(col, p.D)} /></g>; });
	return <g>{shapes}{glows}</g>; };
/** the press pack in the road before the door (they turn toward him: flip = facing −x … they look up the street at him) */
const PRESS: Person[] = [
	{X: -0.2, D: 6.2, m: 1.74, pose: 'press', look: 0, cam: true}, {X: 0.6, D: 5.5, m: 1.8, pose: 'press', look: 3, cam: true}, {X: -0.9, D: 7.0, m: 1.7, pose: 'phone', look: 4, phone: true},
	{X: 0.2, D: 7.6, m: 1.76, pose: 'high', look: 2, cam: true}, {X: -1.6, D: 6.0, m: 1.78, pose: 'press', look: 5, cam: true}, {X: -0.6, D: 8.6, m: 1.68, pose: 'stand', look: 1},
	{X: -2.3, D: 7.4, m: 1.72, pose: 'high', look: 0, phone: true}, {X: -1.3, D: 9.2, m: 1.7, pose: 'phone', look: 4, phone: true},
];
/** where the press cameras are (world metres): flashes pop there */
const FLASH_AT: [number, number, number][] = [[0.75, 1.68, 5.5], [-0.05, 1.62, 6.2], [-1.45, 1.66, 6.0], [0.35, 2.05, 7.6], [-2.15, 2.0, 7.4]];
const crowdL = (n: number, seed: number): Person[] => Array.from({length: n}, (_, i) => { const D = 6 * Math.pow(9, rnd(i, seed)), pose = ['stand', 'wave', 'cheer', 'phone', 'stand', 'clap', 'high'][Math.floor(rnd(i, seed + 2) * 7)];
	return {X: -3.9 - rnd(i, seed + 3) * 0.75, D, m: 1.55 + rnd(i, seed + 4) * 0.3, pose, look: Math.floor(rnd(i, seed + 5) * 6), flip: rnd(i, seed + 6) > 0.25, phone: pose === 'phone' || pose === 'high'}; });
const CROWD_L = crowdL(40, 41);
/** the world shot's crowd: the road beyond the press filled, the near pavement beyond the house too */
const CROWD_R: Person[] = [...Array.from({length: 46}, (_, i): Person => { const D = 9 + Math.pow(rnd(i, 61), 1.3) * 42, pose = ['stand', 'wave', 'cheer', 'phone', 'clap', 'high', 'phone'][Math.floor(rnd(i, 62) * 7)];
	return {X: -3.2 + rnd(i, 63) * 4.0, D, m: 1.55 + rnd(i, 64) * 0.3, pose, look: Math.floor(rnd(i, 65) * 6), flip: rnd(i, 66) > 0.6, phone: pose === 'phone' || pose === 'high'}; }),
	...Array.from({length: 18}, (_, i): Person => { const D = 12 + rnd(i, 71) * 40, pose = ['stand', 'wave', 'phone', 'clap'][Math.floor(rnd(i, 72) * 4)];
		return {X: 1.4 + rnd(i, 73) * 1.2, D, m: 1.55 + rnd(i, 74) * 0.3, pose, look: Math.floor(rnd(i, 75) * 6), flip: true, phone: pose === 'phone'}; })];

/* ---------- the street (act 1's, on W4) ---------- */
/** a terrace (façade plane X): brick walls with courses, bay and sash windows, doors, eaves, roofs (both slopes from above), chimney stacks */
const Facade: React.FC<{w: W4; X: number; base: number; from: number; to: number; side: 1 | -1; mum?: boolean; lit: number}> = ({w, X, base, from, to, side, mum, lit}) => {
	const fog = useFog4(w), wp = (x: number, y: number, d: number) => wp4(w, x, y, d), n0 = NEAR - w.dz;
	const q = (x0: number, d0: number, d1: number, y0: number, y1: number) => { const a = Math.max(d0, n0); if (d1 <= a) return ''; return poly([wp(x0, y0, a), wp(x0, y0, d1), wp(x0, y1, d1), wp(x0, y1, a)]); };
	const out: React.ReactNode[] = [], starts: number[] = [];
	for (let d = from; d < to; d += HOUSE) if (d + HOUSE > n0) starts.push(d);
	const high = w.camH > 7;
	for (let ii = starts.length - 1; ii >= 0; ii--) { const d = starts[ii], i = Math.round((d - base) / HOUSE);   // i: act 1's house index (same lit windows)
		const d1 = d + HOUSE, dm = d + HOUSE / 2, isMum = mum && i === 0, a0 = Math.max(d, n0);
		const wall = fog('#4f2a25', dm), dark = fog('#15131b', dm), trim = fog('#8a7a70', dm), win = fog('#ffc983', dm, -0.25), roof = fog(high ? (i % 2 ? '#24273a' : '#1f2232') : '#2b2f44', dm);
		const door: [number, number] = isMum ? DOOR : [d + HOUSE * 0.62, d + HOUSE * 0.8], bay: [number, number] = [d + HOUSE * 0.1, d + HOUSE * 0.42];
		const on = (j: number) => isMum || rnd(i * 5 + j, 7) > 0.3;
		out.push(<g key={ii}>
			{high && <path d={poly([wp(X + side * 3.2, 8.7, a0), wp(X + side * 3.2, 8.7, d1), wp(X + side * 6.4, 6.4, d1), wp(X + side * 6.4, 6.4, a0)])} fill={fog('#1a1c2a', dm)} />}
			<path d={poly([wp(X, 6.4, a0), wp(X, 6.4, d1), wp(X + side * 3.2, 8.7, d1), wp(X + side * 3.2, 8.7, a0)])} fill={roof} />
			{high && <path d={[0.22, 0.44, 0.66, 0.88].map((f) => poly([wp(X + side * 3.2 * f, 6.4 + 2.3 * f, a0), wp(X + side * 3.2 * f, 6.4 + 2.3 * f, d1), wp(X + side * 3.2 * (f + 0.03), 6.4 + 2.3 * (f + 0.03), d1), wp(X + side * 3.2 * (f + 0.03), 6.4 + 2.3 * (f + 0.03), a0)])).join(' ')} fill={fog('#4a5068', dm)} opacity={0.55} />}
			{high && <path d={poly([wp(X + side * 3.15, 8.66, a0), wp(X + side * 3.15, 8.66, d1), wp(X + side * 3.25, 8.74, d1), wp(X + side * 3.25, 8.74, a0)])} fill={fog('#e8b890', dm)} opacity={0.5} />}
			{d - 0.05 > n0 && (high ? (() => { const [cs, cf, ct] = chimBox(w, X + side * 1.2, X + side * 1.85, d, d + 0.6, 7.6, 9.9); return <g><path d={cs} fill={fog('#4a2a22', dm)} /><path d={cf} fill={fog('#341c18', dm)} /><path d={ct} fill={fog('#6a4a3c', dm)} /></g>; })()
				: <path d={poly([wp(X + side * 1.5, 7.9, d - 0.05), wp(X + side * 1.5, 7.9, d + 0.55), wp(X + side * 1.5, 9.9, d + 0.55), wp(X + side * 1.5, 9.9, d - 0.05)])} fill={fog('#3a2420', dm)} />)}
			<path d={q(X, d, d1, 0, 6.4)} fill={wall} />
			{d < 12 && <path d={Array.from({length: 19}, (_, j) => q(X, d, d1, 0.3 + j * 0.32, 0.325 + j * 0.32)).join(' ')} fill={fog('#2e1817', dm)} opacity={0.45} />}
			<path d={q(X, d, d1, 6.4, 6.65) + ' ' + q(X, d, d1, 2.75, 2.87) + ' ' + q(X, d, d + 0.05, 0, 6.4)} fill={trim} />
			<path d={q(X, bay[0], bay[1], 0.65, 2.35)} fill={on(0) ? win : dark} opacity={on(0) ? (isMum ? 0.5 + 0.25 * lit : 0.9) : 1} />
			{isMum && <path d={q(X, bay[0], bay[0] + 0.35, 0.65, 2.35) + ' ' + q(X, bay[1] - 0.35, bay[1], 0.65, 2.35) + ' ' + q(X, bay[0], bay[1], 2.1, 2.35)} fill={fog('#5a2c2a', dm)} opacity={0.85} />}
			<path d={q(X, (bay[0] + bay[1]) / 2 - 0.03, (bay[0] + bay[1]) / 2 + 0.03, 0.65, 2.35) + ' ' + q(X, bay[0], bay[1], 1.7, 1.76) + ' ' + q(X, bay[0] - 0.08, bay[1] + 0.08, 0.55, 0.65) + ' ' + q(X, bay[0] - 0.08, bay[1] + 0.08, 2.35, 2.48)} fill={trim} />
			{[[1, 0.1, 0.4], [2, 0.55, 0.85]].map(([j, u0, u1]) => { const a = d + HOUSE * u0, b = d + HOUSE * u1;
				return <g key={j}><path d={q(X, a, b, 3.5, 5.3)} fill={on(j) ? win : dark} opacity={on(j) ? 0.85 : 1} /><path d={q(X, a, b, 4.38, 4.44) + ' ' + q(X, (a + b) / 2 - 0.02, (a + b) / 2 + 0.02, 3.5, 5.3) + ' ' + q(X, a - 0.06, b + 0.06, 3.4, 3.5)} fill={trim} /></g>; })}
			{!isMum && <g><path d={q(X, door[0], door[1], 0, 2.15)} fill={fog('#1b1f22', dm)} /><path d={q(X, door[0] + 0.05, door[1] - 0.05, 2.2, 2.5)} fill={win} opacity={0.8} /></g>}
		</g>);
	}
	return <g>{out}</g>;
};
/** a chimney stack as a box (the side facing the camera, the face down the street, the top), so it reads from above */
const chimBox = (w: W4, X0: number, X1: number, D0: number, D1: number, Y0: number, Y1: number): [string, string, string] => {
	const Xn = Math.abs(X0 - w.camX) < Math.abs(X1 - w.camX) ? X0 : X1, p = (x: number, y: number, d: number) => wp4(w, x, y, d);
	return [poly([p(Xn, Y0, D0), p(Xn, Y0, D1), p(Xn, Y1, D1), p(Xn, Y1, D0)]), poly([p(X0, Y0, D0), p(X1, Y0, D0), p(X1, Y1, D0), p(X0, Y1, D0)]), poly([p(X0, Y1, D0), p(X1, Y1, D0), p(X1, Y1, D1), p(X0, Y1, D1)])]; };
/** a back row of the town (for the crane): walls with lit windows, both roof slopes, chimneys */
const TownRow: React.FC<{w: W4; X: number; from: number; to: number; side: 1 | -1; seed: number}> = ({w, X, from, to, side, seed}) => {
	const fog = useFog4(w), wp = (x: number, y: number, d: number) => wp4(w, x, y, d), n0 = NEAR - w.dz;
	const roofs: string[] = [], walls: string[] = [], lit: string[] = [], chim: string[] = [], chimF: string[] = [], chimT: string[] = [], alt: string[] = [], backs: string[] = [], sky: string[] = [], courses: string[] = [], ridges: string[] = [];
	for (let d = from, i = 0; d < to; d += HOUSE, i++) {
		const a = Math.max(d, n0), b = d + HOUSE; if (b <= a + 0.05) continue;
		walls.push(poly([wp(X, 0, a), wp(X, 0, b), wp(X, 6.4, b), wp(X, 6.4, a)]));
		roofs.push(poly([wp(X, 6.4, a), wp(X, 6.4, b), wp(X + side * 3.2, 8.7, b), wp(X + side * 3.2, 8.7, a)]));
		backs.push(poly([wp(X + side * 3.2, 8.7, a), wp(X + side * 3.2, 8.7, b), wp(X + side * 6.4, 6.4, b), wp(X + side * 6.4, 6.4, a)]));
		for (const f of [0.3, 0.6]) courses.push(poly([wp(X + side * 3.2 * f, 6.4 + 2.3 * f, a), wp(X + side * 3.2 * f, 6.4 + 2.3 * f, b), wp(X + side * 3.2 * (f + 0.04), 6.4 + 2.3 * (f + 0.04), b), wp(X + side * 3.2 * (f + 0.04), 6.4 + 2.3 * (f + 0.04), a)]));
		ridges.push(poly([wp(X + side * 3.15, 8.66, a), wp(X + side * 3.15, 8.66, b), wp(X + side * 3.25, 8.74, b), wp(X + side * 3.25, 8.74, a)]));
		if (d > n0 + 0.1) { const [cs, cf, ct] = chimBox(w, X + side * 1.2, X + side * 1.85, d + 0.05, d + 0.6, 7.2, 9.4); chim.push(cs); chimF.push(cf); chimT.push(ct); }
		if (i % 2) alt.push(poly([wp(X, 6.4, a), wp(X, 6.4, b), wp(X + side * 3.2, 8.7, b), wp(X + side * 3.2, 8.7, a)]));
		for (const [u0, u1, y0, y1] of [[0.1, 0.4, 3.5, 5.3], [0.55, 0.85, 3.5, 5.3], [0.1, 0.42, 0.65, 2.35]] as [number, number, number, number][]) if (rnd(i * 5 + u0 * 10, seed) < 0.6) {
			const p0 = Math.max(d + HOUSE * u0, n0), p1 = d + HOUSE * u1; if (p1 > p0) lit.push(poly([wp(X, y0, p0), wp(X, y0, p1), wp(X, y1, p1), wp(X, y1, p0)])); }
		if (rnd(i, seed + 9) < 0.2) { const u = d + HOUSE * 0.4; if (u > n0) sky.push(poly([wp(X + side * 1.2, 7.26, u), wp(X + side * 1.2, 7.26, u + 0.9), wp(X + side * 2.0, 7.84, u + 0.9), wp(X + side * 2.0, 7.84, u)])); }
	}
	const dm = (from + to) / 4;
	return <g><Shape d={backs.join(' ')} fill={fog('#14151f', dm)} /><Shape d={walls.join(' ')} fill={fog('#45261f', dm)} /><Shape d={lit.join(' ')} fill={fog('#ffc983', dm, -0.3)} o={0.88} />
		<Shape d={roofs.join(' ')} fill={fog('#1f2232', dm)} /><Shape d={alt.join(' ')} fill={fog('#2a2c3c', dm)} /><Shape d={courses.join(' ')} fill={fog('#3c4058', dm)} o={0.45} />
		<Shape d={ridges.join(' ')} fill={fog('#f0c090', dm)} o={0.5} /><Shape d={sky.join(' ')} fill={fog('#ffc983', dm, -0.3)} o={0.75} />
		<Shape d={chim.join(' ')} fill={fog('#4a2a22', dm)} /><Shape d={chimF.join(' ')} fill={fog('#341c18', dm)} /><Shape d={chimT.join(' ')} fill={fog('#6a4a3c', dm)} /></g>; };
/** the ground of the town between the rows, the estuary and the bridge on the horizon */
const TownGround: React.FC<{w: W4}> = ({w}) => {
	const fog = useFog4(w), wp = (x: number, y: number, d: number) => wp4(w, x, y, d), n0 = NEAR - w.dz;
	const g = poly([wp(-90, 0, n0), wp(90, 0, n0), wp(90, 0, 230), wp(-90, 0, 230)]);
	const r0 = 260, r1 = 520, river = poly([wp(-1200, 0, r0), wp(1200, 0, r0), wp(1200, 0, r1), wp(-1200, 0, r1)]);
	const s = px4(w, 700), towers = [-300, -100].map((X) => { const b = wp(X, 0, 700), tp = wp(X, 155, 700); return poly([[b[0] - 3.5 * s, b[1]], [b[0] + 3.5 * s, b[1]], [tp[0] + 2.5 * s, tp[1]], [tp[0] - 2.5 * s, tp[1]]]); }).join(' ');
	const ca = wp(-300, 152, 700), cb = wp(-100, 152, 700), mid = wp(-200, 40, 700), dA = wp(-650, 30, 700), dB = wp(250, 30, 700);
	return <g>
		<path d={g} fill={fog('#191826', 30)} />
		<defs><linearGradient id="a4driv" gradientUnits="userSpaceOnUse" x1="0" y1={wp(0, 0, r0)[1]} x2="0" y2={wp(0, 0, r1)[1]}><stop offset="0" stopColor="#6c6688" /><stop offset="1" stopColor="#f0b890" /></linearGradient></defs>
		<path d={river} fill="url(#a4driv)" opacity={0.75} />
		<g opacity={0.6}><path d={towers} fill="#4a4a66" />
			<path d={`M${f1(dA[0])},${f1(dA[1])} L${f1(dB[0])},${f1(dB[1])}`} stroke="#4a4a66" strokeWidth={Math.max(1, 1.2 * s)} />
			<path d={`M${f1(dA[0])},${f1(dA[1] - 2)} Q${f1(ca[0] - 40)},${f1(ca[1] + 6)} ${f1(ca[0])},${f1(ca[1])} Q${f1(mid[0])},${f1(mid[1] + 30)} ${f1(cb[0])},${f1(cb[1])} Q${f1(cb[0] + 50)},${f1(cb[1] + 8)} ${f1(dB[0])},${f1(dB[1] - 2)}`} stroke="#4a4a66" strokeWidth={1.2} fill="none" /></g>
	</g>; };
/** the wet street: road, kerbs, pavements; lit windows and the door's light doubled in the wet surface */
const DStreet: React.FC<{w: W4; open: number}> = ({w, open}) => {
	const fog = useFog4(w), n0 = Math.max(0.6, NEAR - w.dz), strip = (X0: number, X1: number, D0 = n0, D1 = 300) => poly([wp4(w, X0, 0, D0), wp4(w, X1, 0, D0), wp4(w, X1, 0, D1), wp4(w, X0, 0, D1)]);
	const refl = Array.from({length: 14}, (_, i) => { const D = H0 + 0.9 + i * HOUSE * 0.5; if (D < n0 + 0.2) return null; const a = wp4(w, FX - 0.2, 0, D), s = px4(w, D), len = 0.6 * s;
		return <Glow key={i} x={a[0] - 0.03 * s} y={a[1] + len * 0.25} r={Math.max(6, 0.16 * s)} ry={len * 0.55} c="#ffb860" o={0.28 * (1 - i / 16)} />; });
	const dm = wp4(w, FX - 0.3, 0, 3.95), sd = px4(w, 3.95);
	return <g>
		<defs><linearGradient id="a4droad" gradientUnits="userSpaceOnUse" x1="0" y1={w.hz} x2="0" y2={Math.max(w.hz + 300, H)}><stop offset="0" stopColor="#8a7f96" /><stop offset="0.12" stopColor="#4a4a62" /><stop offset="0.45" stopColor="#262838" /><stop offset="1" stopColor="#14151f" /></linearGradient></defs>
		<path d={strip(-3.6, 1.0)} fill="url(#a4droad)" />
		<path d={strip(1.0, FX + 0.1)} fill={fog('#3a3640', 4)} /><path d={strip(-4.7, -3.6)} fill={fog('#3a3640', 12)} />
		<path d={strip(0.95, 1.08)} fill="#77727c" opacity={0.8} /><path d={strip(-3.65, -3.52)} fill="#77727c" opacity={0.6} />
		<path d={strip(-1.32, -1.22, Math.max(4, n0), 300)} fill="#9a96a4" opacity={0.25} />
		{refl}
		<Glow x={dm[0] - 0.06 * sd} y={dm[1] + 0.07 * sd} r={0.24 * sd} ry={0.06 * sd} c={GOLD} o={0.55 * open} />
	</g>; };
/** mum's doorway: the gold hall, the door leaf swinging in (hinged on its near edge), the step, the spill; mum in the hall while `mumIn` */
const DoorWay: React.FC<{w: W4; open: number; t: number; mumIn: boolean}> = ({w, open, t, mumIn}) => {
	const wp = (x: number, y: number, d: number) => wp4(w, x, y, d), id = useUid('dw');
	const [a, b] = DOOR, Y0 = 0.15, Y1 = 2.2, op = poly([wp(FX, Y0, a), wp(FX, Y0, b), wp(FX, Y1, b), wp(FX, Y1, a)]);
	const ang = 68 * open * Math.PI / 180, fx = FX + 0.9 * Math.sin(ang), fd = a + 0.9 * Math.cos(ang);
	const leaf = poly([wp(FX, Y0, a), wp(FX, Y1, a), wp(fx, Y1, fd), wp(fx, Y0, fd)]);
	const step = poly([wp(FX - 0.32, Y0, a - 0.05), wp(FX - 0.32, Y0, b + 0.05), wp(FX, Y0, b + 0.05), wp(FX, Y0, a - 0.05)]), stepF = poly([wp(FX - 0.32, 0, a - 0.05), wp(FX - 0.32, 0, b + 0.05), wp(FX - 0.32, Y0, b + 0.05), wp(FX - 0.32, Y0, a - 0.05)]);
	const spill = poly([wp(FX - 0.32, 0, a), wp(FX - 0.32, 0, b), wp(0.9, 0, b + 0.8), wp(1.0, 0, a - 0.55)]);
	const frame = [poly([wp(FX, 0, a - 0.12), wp(FX, 0, a), wp(FX, Y1 + 0.42, a), wp(FX, Y1 + 0.42, a - 0.12)]), poly([wp(FX, 0, b), wp(FX, 0, b + 0.12), wp(FX, Y1 + 0.42, b + 0.12), wp(FX, Y1 + 0.42, b)]), poly([wp(FX, Y1, a - 0.12), wp(FX, Y1, b + 0.12), wp(FX, Y1 + 0.08, b + 0.12), wp(FX, Y1 + 0.08, a - 0.12)]), poly([wp(FX, Y1 + 0.38, a - 0.12), wp(FX, Y1 + 0.38, b + 0.12), wp(FX, Y1 + 0.46, b + 0.12), wp(FX, Y1 + 0.46, a - 0.12)])].join(' ');
	const fan = poly([wp(FX, Y1 + 0.08, a), wp(FX, Y1 + 0.08, b), wp(FX, Y1 + 0.38, b), wp(FX, Y1 + 0.38, a)]);
	const s = px4(w, (a + b) / 2), dc = wp(FX, 1.2, (a + b) / 2), sp0 = wp(FX - 0.3, 0, (a + b) / 2), s4 = wp(1.0, 0, 4);
	const [mx, my] = wp(FX - 0.02, Y0, MD), mh = 1.6 * px4(w, MD);
	return <g>
		<defs>
			<linearGradient id={`${id}h`} gradientUnits="userSpaceOnUse" x1={wp(FX, 1, b)[0]} y1="0" x2={wp(FX, 1, a)[0]} y2="0"><stop offset="0" stopColor="#fff0c8" /><stop offset="0.6" stopColor="#ffd68c" /><stop offset="1" stopColor="#e89a48" /></linearGradient>
			<linearGradient id={`${id}s`} gradientUnits="userSpaceOnUse" x1={sp0[0]} y1={sp0[1]} x2={s4[0]} y2={s4[1]}><stop offset="0" stopColor={GOLD} stopOpacity="0.8" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></linearGradient>
			<clipPath id={`${id}c`}><path d={op} /></clipPath>
		</defs>
		<path d={spill} fill={`url(#${id}s)`} opacity={open} />
		<path d={op} fill={open > 0.001 ? `url(#${id}h)` : '#1d2824'} />
		<g clipPath={`url(#${id}c)`}>
			<path d={poly([wp(FX + 0.6, Y0, b - 0.05), wp(FX + 0.6, 1.0, b - 0.05), wp(FX + 2.6, 2.6, b - 0.05), wp(FX + 2.6, Y0, b - 0.05)])} fill="#c98a46" opacity={0.35 * cl(open * 3)} />
			{mumIn && open > 0.01 && <RigMum x={mx} y={my} h={mh} action="stand" phase={t / 4.6 + 0.2} facing={-1} rim="#fff0c0" lightDir={8} rimO={1} />}
			<path d={leaf} fill="#1d2824" /><path d={leaf} fill="#e6b060" opacity={0.08 + 0.12 * open} />
		</g>
		<path d={frame} fill="#cfc6b8" /><path d={fan} fill="#ffd68c" opacity={0.6 + 0.4 * open} />
		<path d={stepF} fill="#5d5660" /><path d={step} fill="#9a8f88" /><path d={step} fill={GOLD} opacity={0.35 * open} />
		<Glow x={dc[0] - 0.04 * s} y={dc[1]} r={0.33 * s} ry={0.38 * s} c={GOLD} o={0.22 + 0.33 * open} />
	</g>; };
/** WELCOME HOME SON, hung on mum's house above the door and the bay (an affine map of a text box onto the façade quad) */
const Banner: React.FC<{w: W4}> = ({w}) => {
	const X = FX - 0.04, d0 = 2.2, d1 = 4.55, y0 = 3.62, y1 = 4.22;
	const A = wp4(w, X, y1, d1), B = wp4(w, X, y1, d0), C = wp4(w, X, y0, d0), Dp = wp4(w, X, y0, d1);   // reading left → right on screen (far → near)
	const sag = (Dp[1] - A[1]) * 0.07;
	const cloth = `M${f1(A[0])},${f1(A[1])} Q${f1((A[0] + B[0]) / 2)},${f1((A[1] + B[1]) / 2 + sag)} ${f1(B[0])},${f1(B[1])} L${f1(C[0])},${f1(C[1])} Q${f1((C[0] + Dp[0]) / 2)},${f1((C[1] + Dp[1]) / 2 + sag)} ${f1(Dp[0])},${f1(Dp[1])} Z`;
	const m = `matrix(${((B[0] - A[0]) / 1000).toFixed(4)},${((B[1] - A[1]) / 1000).toFixed(4)},${((Dp[0] - A[0]) / 100).toFixed(4)},${((Dp[1] - A[1]) / 100).toFixed(4)},${f1(A[0])},${f1(A[1] + sag * 0.6)})`;
	const cordA = wp4(w, X, y1 + 0.5, d1 + 0.1), cordB = wp4(w, X, y1 + 0.5, d0 - 0.1);
	return <g><path d={`M${f1(cordA[0])},${f1(cordA[1])} L${f1(A[0])},${f1(A[1])} M${f1(cordB[0])},${f1(cordB[1])} L${f1(B[0])},${f1(B[1])}`} stroke="#2a2228" strokeWidth={2} />
		<path d={cloth} fill="#3a1e22" opacity={0.25} transform="translate(-3,5)" /><path d={cloth} fill="#efe4cc" />
		<text transform={m} x={500} y={74} textAnchor="middle" textLength={920} lengthAdjust="spacingAndGlyphs" style={{fontFamily: "'Inter Display', 'DejaVu Sans', sans-serif", fontWeight: 900, fontSize: 64}} fill="#8a1f24">WELCOME HOME SON</text></g>; };
const DBunting: React.FC<{w: W4; t: number}> = ({w, t}) => {
	const out: React.ReactNode[] = [], n0 = NEAR - w.dz;
	[6.5, 10, 14.5, 21, 30, 40].forEach((D, j) => { if (D < n0 + 0.5) return; const n = 16, cols = ['#d8c8a4', '#8a3a36', '#3e4f6e', '#e8e0cc'], s = px4(w, D);
		const pts = Array.from({length: n + 1}, (_, i) => { const u = i / n, X = lerp(-4.6, FX, u), DD = D + u * 1.2; return wp4(w, X, 5.2 - Math.sin(Math.PI * u) * 0.7, DD); });
		out.push(<path key={`s${j}`} d={'M' + pts.map((p) => `${f1(p[0])},${f1(p[1])}`).join(' L')} fill="none" stroke="#2a2a36" strokeWidth={Math.max(0.7, 0.009 * s)} />);
		pts.slice(0, n).forEach((p, i) => { const q = pts[i + 1], len = 0.26 * s, sw = Math.sin(t * 2.2 + i + j) * len * 0.12;
			out.push(<path key={`f${j}_${i}`} d={poly([[lerp(p[0], q[0], 0.12), lerp(p[1], q[1], 0.12)], [lerp(p[0], q[0], 0.88), lerp(p[1], q[1], 0.88)], [(p[0] + q[0]) / 2 + sw, (p[1] + q[1]) / 2 + len]])} fill={mix(cols[(i + j) % 4], '#4a4c6c', cl((D + w.dz) / 45))} />); }); });
	return <g>{out}</g>; };
const DLamp: React.FC<{w: W4; X: number; D: number; o?: number}> = ({w, X, D, o = 1}) => { if (D + w.dz < 1) return null; const fog = useFog4(w), b = wp4(w, X, 0, D), tp = wp4(w, X, 5.4, D), s = Math.abs(b[1] - tp[1]) / 5.4;
	return <g><path d={poly([[b[0] - 0.07 * s, b[1]], [b[0] + 0.07 * s, b[1]], [tp[0] + 0.05 * s, tp[1]], [tp[0] - 0.05 * s, tp[1]]])} fill={fog('#1a1a26', D)} />
		<path d={poly([[tp[0] - 0.2 * s, tp[1]], [tp[0] + 0.2 * s, tp[1]], [tp[0] + 0.1 * s, tp[1] - 0.45 * s], [tp[0] - 0.1 * s, tp[1] - 0.45 * s]])} fill={fog('#1a1a26', D)} />
		<Glow x={tp[0]} y={tp[1] + 0.12 * s} r={2.4 * s} c="#ffc37a" o={0.45 * o} /><Glow x={tp[0]} y={tp[1] + 0.12 * s} r={0.4 * s} c="#fff0d0" o={0.9 * o} /></g>; };
/** camera flashes at the press cameras, each gone within ~5 frames */
const Flashes: React.FC<{w: W4; t: number; at: number[]}> = ({w, t, at}) => <g>{at.map((t0, i) => { const u = t - t0; if (u < 0 || u > 0.17) return null;
	const o = Math.pow(1 - u / 0.17, 1.6), [X, Y, D] = FLASH_AT[i % FLASH_AT.length]; if (D + w.dz < 0.8) return null; const [x, y] = wp4(w, X, Y, D), s = Math.min(2.2, px4(w, D) / 200);
	return <g key={i} opacity={o}><Glow x={x} y={y} r={170 * s} c="#eef4ff" o={0.7} /><Glow x={x} y={y} r={26 * s} c="#ffffff" o={1} />
		<path d={`M${x - 76 * s},${y} L${x},${y - 3 * s} L${x + 76 * s},${y} L${x},${y + 3 * s} Z M${x},${y - 54 * s} L${x + 3 * s},${y} L${x},${y + 54 * s} L${x - 3 * s},${y} Z`} fill="#ffffff" opacity={0.85} /></g>; })}</g>;
const flashLift = (t: number, at: number[]) => at.reduce((m, t0) => { const u = t - t0; return u >= 0 && u < 0.12 ? Math.max(m, 1 - u / 0.12) : m; }, 0);

export type DawnCast = {
	karl?: {X: number; D: number; action: Action; phase: number; facing?: 1 | -1; cart?: false; rimO?: number};
	cart?: {X: number; D: number; facing?: 1 | -1};
	/** mum outside the hall (stepping out / standing on the pavement); while absent she stands in the hall once the door opens */
	mum?: {X: number; D: number; Y?: number; action: 'stand' | 'walk' | 'reach'; phase: number; facing?: 1 | -1};
	hug?: {X: number; D: number; phase: number; facing?: 1 | -1};
};
/** act 1's street at dawn (mum's house on the right), on the act's true camera, with act 4's additions. */
export const Dawn4: React.FC<{t: number; w?: Partial<W4>; open: number; cast?: DawnCast; hallMum?: boolean; press?: number; crowd?: number; flashes?: number[]; banner?: boolean; town?: number;
	focus?: number; aperture?: number; density?: number; rain?: number; dawn?: number; nearL?: number}> = ({t, w: wIn = {}, open, cast = {}, hallMum = true, press = 1, crowd = 1, flashes = [], banner = true, town = 0, focus, aperture = 1.6, density = 0.045, rain = 1, dawn = 0, nearL = 0}) => {
	const w: W4 = {...DW4, ...wIn}, k = cast.karl, m = cast.mum, hg = cast.hug, c = cast.cart;
	const fD = Math.max(1, (focus ?? (hg ? hg.D : k ? k.D : DF)) + w.dz);
	const atm = {haze: '#5b5f84', density, focus: fD, aperture, rim: '#ffcf7a', lightDir: 12, grain: 0.075, vignette: 0.62, pp: [w.vpx, w.hz] as P};
	const L = (D: number) => Math.max(0.5, D + w.dz), lift = flashLift(t, flashes);
	const front: [number, React.ReactNode][] = [];
	if (k) { const [x, y] = wp4(w, k.X, 0, k.D); front.push([k.D, <FigureSlot key="k" depth={L(k.D)} x={x} y={y} h={1.8 * px4(w, k.D)} attire="home2026" action={k.action} phase={k.phase} facing={k.facing ?? 1} cart={k.cart}
		rim="#ffd690" lightDir={10} rimO={k.rimO ?? 0.95} reflect={{wy: y + 2, o: 0.22}} contact={0.35} />]); }
	if (hg) { const [x, y] = wp4(w, hg.X, 0, hg.D); front.push([hg.D, <FigureSlot key="h" depth={L(hg.D)} x={x} y={y} h={1.8 * px4(w, hg.D)} attire="home2026" action="hug" phase={hg.phase} facing={hg.facing ?? 1}
		rim="#ffd690" lightDir={8} rimO={1} reflect={{wy: y + 2, o: 0.2}} contact={0.35} />]); }
	if (m) { const [x, y] = wp4(w, m.X, m.Y ?? 0, m.D); front.push([m.D - 0.05, <Layer key="m" D={L(m.D)}><RigMum x={x} y={y} h={1.6 * px4(w, m.D)} action={m.action} phase={m.phase} facing={m.facing ?? -1} rim="#fff0c0" lightDir={8} rimO={1} /></Layer>]); }
	if (c) { const [x, y] = wp4(w, c.X, 0, c.D); front.push([c.D, <Layer key="c" D={L(c.D)}><Cart x={x} y={y} h={1.8 * px4(w, c.D)} kind="orange" facing={c.facing ?? 1} rim="#ffcf7a" lightDir={12} rimO={0.5 + 0.4 * open} /></Layer>]); }
	front.sort((a, b) => b[0] - a[0]);
	const sk = (y: number) => w.hz + (y - 470) * 1;   // the sky's rest geometry follows the horizon (shift lens)
	return <Stage t={t} atm={atm} bg="#141a30" grade={lift > 0 ? <rect x={0} y={0} width={W} height={H} fill="#e6eeff" opacity={0.05 * lift} /> : undefined}>
		<Layer D={INF}>
			<SkyGrad y0={sk(-600)} y1={sk(510)} stops={[[0, '#0c1228'], [0.35, '#1b2650'], [0.62, '#3c4878'], [0.82, '#8a7898'], [0.93, mix('#e6a68a', '#f0b08a', dawn)], [1, mix('#ffd2a0', '#ffe0b0', dawn)]]} />
			<g transform={`translate(${f1(w.vpx - 330)},${f1(w.hz - 470)})`}><CloudBands id="a4dc" t={t} bands={[[60, 50, 3, 0.55], [190, 40, 5, 0.5], [320, 30, 9, 0.6], [410, 22, 13, 0.7]]} top="#26325c" mid="#4c5482" under="#9a86a6" warm="#f0a888" warmFrom={2} drift={4} /></g>
			<Glow x={w.vpx} y={w.hz - 10} r={760} ry={260} c="#ffb27a" o={0.55 + 0.2 * dawn} />
			<Glow x={w.vpx} y={w.hz - 10} r={140} c="#fff0d2" o={0.7} />
		</Layer>
		{town > 0 && <TownGround w={w} />}
		{town > 0 && <><TownRow w={w} X={-34.6} from={-20} to={160} side={-1} seed={3} /><TownRow w={w} X={33} from={-20} to={160} side={1} seed={4} /></>}
		{town > 0 && <><TownRow w={w} X={-24.6} from={-20} to={160} side={-1} seed={5} /><TownRow w={w} X={23} from={-20} to={160} side={1} seed={6} /></>}
		{town > 0 && <><TownRow w={w} X={-14.6} from={-20} to={160} side={-1} seed={7} /><TownRow w={w} X={13} from={-20} to={160} side={1} seed={8} /></>}
		<DStreet w={w} open={open} />
		<Facade w={w} X={-4.6} base={7.6} from={town > 0 ? 7.6 - 5 * HOUSE : 7.6 - nearL * HOUSE} to={town > 0 ? 140 : 90} side={-1} lit={1} />
		{crowd > 0 && <Layer D={L(12)} o={crowd}><People w={w} ppl={CROWD_L} col="#191a26" rim="#ffbf88" rimDx={1.3} t={t} /></Layer>}
		{crowd > 0 && town > 0 && <Layer D={L(14)} o={crowd}><People w={w} ppl={CROWD_R} col="#191a26" rim="#ffbf88" rimDx={1.3} t={t} /></Layer>}
		<Facade w={w} X={FX} base={H0} from={town > 0 ? H0 - 4 * HOUSE : w.dz > 0.2 ? H0 - 2 * HOUSE : H0} to={town > 0 ? 145 : 95} side={1} mum lit={open} />
		{banner && <Banner w={w} />}
		<DBunting w={w} t={t} />
		<DLamp w={w} X={-4.0} D={13} o={0.8} /><DLamp w={w} X={2.2} D={22} o={0.7} /><DLamp w={w} X={2.2} D={8.2} />{town > 0 && <><DLamp w={w} X={-4.0} D={30} o={0.7} /><DLamp w={w} X={2.2} D={40} o={0.6} /></>}
		<DoorWay w={w} open={open} t={t} mumIn={hallMum && !m} />
		{press > 0 && <Layer D={L(7)} o={press}><People w={w} ppl={PRESS} col="#11121a" rim="#a8b4d8" rimDx={1.1} t={t} /></Layer>}
		{front.map(([, n]) => n)}
		<Flashes w={w} t={t} at={flashes} />
		{rain > 0.01 && <Particles kind="rain" n={70} seed={31} D={[1.2, 14]} c="#c9d2e6" o={0.22 * rain} wind={-90} />}
		<Particles kind="dust" n={26} seed={32} D={[2.5, 6]} box={[700, 200, 1400, 900]} c="#ffe0a0" o={0.6 * open} size={1} />
	</Stage>;
};
