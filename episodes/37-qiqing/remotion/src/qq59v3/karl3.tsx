import React, {useId} from 'react';
import {GAITS} from '../qq/gaits';

/* ============================================================================================================
   ep59 v3 · ONE Karl (karl3).
   The same head, hair (medium length, swept back, collar-length at the nape), short full beard, build and proportions
   in every scene; only the attire and the props change (owner: "unify his hairstyle and figure, give him different attire").

   <Karl x y h attire action phase facing? rim? lightDir? … />   — an SVG <g>, inside a 1920×1080 <svg>
     (x, y)   the feet point (ground under the hips).  swim / float: the water line at his chest.
     h        standing height in px (hair included). Props are sized from h (cart wheel ≈ 0.17h radius, camel hump ≈ 1.25h …).
     attire   start1998 | jungle | ice | siberia | gobi | swim | home2026
     action   walk | pushCart | haulSled | wade | swim | float | stand | lookUp | leadCamel | hug
              pushCart draws the cart for the attire (start1998 'beast98', siberia/ice 'winter', else 'orange'; override `cart`),
              haulSled the red sled on traces, leadCamel the camel on its lead rope, hug his mother, wade/swim/float their water fx.
     phase    cycle position in cycles: phase = t / KARL_CYCLE[action].sec. Travelling actions cover KARL_CYCLE[action].stride × h px
              per cycle — move x by exactly that (karlTravel(action, t, h) returns both) and the planted foot never slides:
              each gait is root-locked on its pivot foot (heel, then ball), measured ≤ 2–3 px/frame at h = 600.
     facing   1 = toward +x (default), -1 mirrored.   rim = rim-light colour (default #ffd9a8).   rimO = rim strength 0..1.
     lightDir 'left' | 'right' | 'top' | degrees (0 = from the right, 90 = from above, 180 = from the left) — screen space,
              independent of facing.
     t        seconds for secondary motion (scarf, ruff, splash randomness); default phase × cycle seconds.
     frost    0..1 rime on beard/brows/ruff (default by attire).   col = figure colour (default FIG).
     water    foam / waterHi colours, underO = opacity of submerged parts (0 hides them; the scene's water then hides nothing),
              depth = wade water depth in body units (default 0.56, i.e. waist), pitch = swim/float tilt in degrees.
   Also exported: <Mum x y h action('stand'|'walk'|'reach') phase facing …/> (h = HER height ≈ 0.88 × his),
     <Camel x y h phase walking …/> (h = the man's height; walk phase in camel cycles of CAMEL_STRIDE·h),
     <Cart x y h kind dist gripY …/> (parked; x = axle), <Sled x y h dist …/> (x = nose), KARL_CYCLE, MUM_CYCLE, karlTravel,
     LOOKS (the attire table), mixHex, and karlGaitPose (inspection). The open-water set for swim/float is karl3sea.tsx.

   Style: dark one-tone figure; one strong rim on the figure's outer lit contour (a mask: silhouette minus silhouette shifted away
   from the light) plus a faint rim per depth layer (far arm, far leg, near leg, torso, kit, head, near arm, props) so overlapping
   limbs separate. Kit reads through slightly lighter inner shapes (vest, straps, harness, life vest, fur ruff) — no outlines.
   Hands are simple mittens or fists. Internal units: body units, y up, feet at y = 0, facing +x, standing height 1.
   ============================================================================================================ */

export type V = [number, number];
export type Pose = Record<string, V>;
export type Attire = 'start1998' | 'jungle' | 'ice' | 'siberia' | 'gobi' | 'swim' | 'home2026';
export type Action = 'walk' | 'pushCart' | 'haulSled' | 'wade' | 'swim' | 'float' | 'stand' | 'lookUp' | 'leadCamel' | 'hug';
export type LightDir = 'left' | 'right' | 'top' | number;
export type CartKind = 'beast98' | 'winter' | 'orange';
export const FIG = '#0c0b0f', RIM = '#ffd9a8', GOLD = '#FFC24A';
export const ATTIRES: Attire[] = ['start1998', 'jungle', 'ice', 'siberia', 'gobi', 'swim', 'home2026'];

/* ---------- math ---------- */
const DEG = Math.PI / 180;
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const ss = (a: number, b: number, v: number) => { const u = clamp((v - a) / (b - a)); return u * u * (3 - 2 * u); };
const fr = (v: number) => v - Math.floor(v);
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1]];
const mul = (a: V, k: number): V => [a[0] * k, a[1] * k];
const len = (a: V) => Math.hypot(a[0], a[1]);
const nrm = (a: V): V => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; };
const mixV = (a: V, b: V, u: number): V => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
/** rotate CCW (y up) by deg */
const rotV = (a: V, deg: number): V => { const c = Math.cos(deg * DEG), s = Math.sin(deg * DEG); return [a[0] * c - a[1] * s, a[0] * s + a[1] * c]; };
const rotAbout = (p: V, o: V, deg: number): V => add(o, rotV(sub(p, o), deg));
/** unit direction `deg` from straight down, + = forward (+x) */
const down = (deg: number): V => [Math.sin(deg * DEG), -Math.cos(deg * DEG)];
/** unit direction at `deg` CCW from +x */
const dirA = (deg: number): V => [Math.cos(deg * DEG), Math.sin(deg * DEG)];
const rnd = (i: number, s = 0) => fr(Math.sin(i * 127.1 + s * 311.7) * 43758.5453);
const hexRGB = (c: string) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
export const mixHex = (a: string, b: string, u: number) => { const A = hexRGB(a), B = hexRGB(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(u))).toString(16).padStart(2, '0')).join(''); };
const along = (a: V, b: V, n: number): V[] => Array.from({length: n + 1}, (_, i) => mixV(a, b, i / n));
/** two-bone IK: the middle joint and the reachable end. bend +1 puts the middle joint on the CCW side of root→target */
const ik2 = (a: V, t: V, l1: number, l2: number, bend: number): [V, V] => {
	const d = sub(t, a), dl = len(d) || 1e-6, L = clamp(dl, Math.abs(l1 - l2) + 1e-4, l1 + l2 - 1e-5), u: V = [d[0] / dl, d[1] / dl];
	const x = (l1 * l1 - l2 * l2 + L * L) / (2 * L), y = Math.sqrt(Math.max(0, l1 * l1 - x * x)), n: V = [-u[1] * bend, u[0] * bend];
	const m: V = [a[0] + u[0] * x + n[0] * y, a[1] + u[1] * x + n[1] * y];
	return [m, add(m, mul(nrm(sub(t, m)), l2))];
};
/** periodic Catmull-Rom through keys [[u, v0, v1…]…] (u sorted in [0,1)) */
const loopKeys = (keys: number[][], u0: number): number[] => {
	const n = keys.length, w = fr(u0); let i = n - 1;
	for (let k = 0; k < n; k++) if (keys[k][0] <= w) i = k;
	const k0 = keys[(i - 1 + n) % n], k1 = keys[i], k2 = keys[(i + 1) % n], k3 = keys[(i + 2) % n];
	const u1 = k1[0], u2 = k2[0] + (i + 1 >= n ? 1 : 0), s = (w + (w < u1 ? 1 : 0) - u1) / ((u2 - u1) || 1);
	return k1.slice(1).map((_, j) => { const p0 = k0[j + 1], p1 = k1[j + 1], p2 = k2[j + 1], p3 = k3[j + 1];
		return 0.5 * (2 * p1 + (-p0 + p2) * s + (2 * p0 - 5 * p1 + 4 * p2 - p3) * s * s + (-p0 + 3 * p1 - 3 * p2 + p3) * s * s * s); });
};

/* ---------- path helpers (screen px) ---------- */
const f1 = (v: number) => v.toFixed(1);
const ps = (p: V) => `${f1(p[0])},${f1(p[1])}`;
/** smooth outline around a polyline: wa = half-width on the screen-left normal (-dy, dx), wb on the other side */
const chainD = (pts: V[], wa: number[], wb: number[]) => {
	const A: V[] = [], B: V[] = [];
	for (let i = 0; i < pts.length; i++) {
		const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
		A.push([pts[i][0] + nx * wa[i], pts[i][1] + ny * wa[i]]); B.push([pts[i][0] - nx * wb[i], pts[i][1] - ny * wb[i]]);
	}
	return closedD([...A, ...B.reverse()]);
};
/** smooth closed curve using the points as quadratic control points (rounded, organic) */
const closedD = (pts: V[]) => {
	const n = pts.length; let d = `M${ps(mixV(pts[0], pts[1], 0.5))}`;
	for (let i = 1; i <= n; i++) { const p = pts[i % n], q = pts[(i + 1) % n]; d += ` Q${ps(p)} ${ps(mixV(p, q, 0.5))}`; }
	return d + 'Z';
};
const polyD = (pts: V[]) => 'M' + pts.map(ps).join(' L') + 'Z';
const circD = (c: V, r: number) => `M${f1(c[0] - r)},${f1(c[1])} a${f1(r)},${f1(r)} 0 1,0 ${f1(2 * r)},0 a${f1(r)},${f1(r)} 0 1,0 ${f1(-2 * r)},0 Z`;
const ringD = (c: V, r1: number, r0: number) => circD(c, r1) + ` M${f1(c[0] - r0)},${f1(c[1])} a${f1(r0)},${f1(r0)} 0 1,1 ${f1(2 * r0)},0 a${f1(r0)},${f1(r0)} 0 1,1 ${f1(-2 * r0)},0 Z`;
/** a thin bar between two screen points */
const barD = (a: V, b: V, w: number) => { const d = nrm(sub(b, a)), n: V = [-d[1] * w / 2, d[0] * w / 2]; return polyD([add(a, n), add(b, n), sub(b, n), sub(a, n)]); };
/** a sagging rope (quadratic a → c → b) as a thin filled strip */
const ropeD = (a: V, c: V, b: V, w: number) => {
	const P: V[] = [], n = 14; for (let i = 0; i <= n; i++) { const u = i / n; P.push([(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]]); }
	const L: V[] = [], R: V[] = [];
	P.forEach((p, i) => { const q = P[Math.min(n, i + 1)], o = P[Math.max(0, i - 1)], d = nrm(sub(q, o)), m: V = [-d[1] * w / 2, d[0] * w / 2]; L.push(add(p, m)); R.push(sub(p, m)); });
	return polyD([...L, ...R.reverse()]);
};

/* ---------- layers with rims ---------- */
export type Sh = {d: string; f: string; o?: number};
/** a depth layer: its shapes get one rim on the lit side; `mirror` = mirror the layer about this local x (a figure facing the other way) */
export type Layer = {sh: Sh[]; rim?: number; mirror?: number};
export const lightVec = (ld: LightDir): V => (ld === 'left' ? [-0.8, -0.6] : ld === 'right' ? [0.8, -0.6] : ld === 'top' ? [0, -1] : [Math.cos(ld * DEG), -Math.sin(ld * DEG)]);
type RimCfg = {col: string; o: number; off: V; soft: boolean; body: string; inner: number};
const LayerG: React.FC<{L: Layer; id: string; rc: RimCfg}> = ({L, id, rc}) => {
	const sx = L.mirror !== undefined ? -1 : 1, ox = rc.off[0] * sx, oy = rc.off[1];
	const tf = L.mirror !== undefined ? `translate(${f1(2 * L.mirror)},0) scale(-1,1)` : undefined;
	const plain = L.sh.map((s, j) => <path key={j} d={s.d} fill={s.f} opacity={s.o} />);
	if (!L.rim || rc.o <= 0) return <g transform={tf}>{plain}</g>;
	const ri = rc.inner * L.rim, bright = mixHex(rc.body, rc.col, rc.o * ri), mid = mixHex(rc.body, rc.col, 0.36 * rc.o * ri), k = rc.soft ? 2 : 1;
	return <g transform={tf}>
		<clipPath id={id}>{L.sh.filter((s) => (s.o ?? 1) > 0.5).map((s, j) => <path key={j} d={s.d} />)}</clipPath>
		<g clipPath={`url(#${id})`}>
			<g fill={bright}>{L.sh.filter((s) => (s.o ?? 1) > 0.5).map((s, j) => <path key={j} d={s.d} />)}</g>
			{rc.soft && <g fill={mid} transform={`translate(${f1(-ox)},${f1(-oy)})`}>{L.sh.filter((s) => (s.o ?? 1) > 0.5).map((s, j) => <path key={j} d={s.d} />)}</g>}
			<g transform={`translate(${f1(-ox * k)},${f1(-oy * k)})`}>{plain}</g>
		</g></g>;
};
/** the layers (each with a weak inner rim that separates overlapping limbs), then one strong rim on the figure's outer lit contour:
    the silhouette minus the silhouette shifted away from the light, through a mask */
export const Layers: React.FC<{layers: Layer[]; uid: string; rc: RimCfg; box?: [number, number, number, number]}> = ({layers, uid, rc, box = [-4000, -4000, 12000, 12000]}) => {
	const lit = layers.filter((L) => (L.rim ?? 0) > 0 && rc.o > 0), sx = (L: Layer) => (L.mirror !== undefined ? -1 : 1);
	const tf = (L: Layer, dx = 0, dy = 0) => (L.mirror !== undefined ? `translate(${f1(2 * L.mirror + dx)},${f1(dy)}) scale(-1,1)` : dx || dy ? `translate(${f1(dx)},${f1(dy)})` : undefined);
	const solid = (L: Layer) => L.sh.filter((s) => (s.o ?? 1) > 0.5).map((s, j) => <path key={j} d={s.d} />);
	const k = rc.soft ? 1.6 : 1, ox = rc.off[0] * k, oy = rc.off[1] * k;
	return <>{layers.map((L, i) => <LayerG key={i} L={L} id={`${uid}L${i}`} rc={rc} />)}
		{lit.length > 0 && <>
			<mask id={`${uid}om`} maskUnits="userSpaceOnUse" x={f1(box[0])} y={f1(box[1])} width={f1(box[2])} height={f1(box[3])}>
				{lit.map((L, i) => <g key={i} fill="#fff" transform={tf(L)}>{solid(L)}</g>)}
				{lit.map((L, i) => <g key={'b' + i} fill="#000" transform={tf(L, -ox * sx(L) * (L.mirror !== undefined ? -1 : 1), -oy)}>{solid(L)}</g>)}
			</mask>
			<rect x={f1(box[0])} y={f1(box[1])} width={f1(box[2])} height={f1(box[3])} fill={mixHex(rc.body, rc.col, rc.o)} mask={`url(#${uid}om)`} />
		</>}</>; };
const rimCfg = (h: number, rim: string, rimO: number, ld: LightDir, facing: number, body: string): RimCfg => {
	const r = clamp(0.0034 * h, 1.0, 3.0), lv = lightVec(ld);
	return {col: rim, o: rimO, off: [lv[0] * r * facing, lv[1] * r], soft: h > 260, body, inner: 0.42};
};
const useUid = () => 'k' + useId().replace(/[^a-zA-Z0-9]/g, '');

/* ============================================================================================================
   THE BODY: one skeleton (CMU mocap bone lengths), one head, one build. Looks only change clothes and kit.
   ============================================================================================================ */
type HeadK = 'hair' | 'wet' | 'hood' | 'ruff' | 'scarf' | 'mum';
type TopK = 'fleece' | 'shirt' | 'suit' | 'parka' | 'tunic' | 'wetsuit' | 'jacket' | 'cardigan';
type Pal = {body: string; hair: string; beard: string; top: string; sleeve: string; legs: string; boots: string; hand: string;
	pack?: string; packHi?: string; strap?: string; vest?: string; band?: string; hood?: string; ruff?: string; scarf?: string; scarfHi?: string; trim?: string; frost?: string};
export type Look = {who: 'karl' | 'mum'; head: HeadK; beard: boolean; frost: number; top: TopK; mitts: boolean; boots: 'boot' | 'big' | 'bare' | 'shoe';
	pack: boolean; hivis: boolean; harness: boolean; lifevest: boolean; wet: boolean; bulk: {torso: number; arm: number; leg: number}; pal: Pal};
const P0 = {body: FIG, hair: '#221f21', beard: '#1d1b1c', hand: FIG, boots: '#09080b'};
export const LOOKS: Record<Attire | 'mum', Look> = {
	/** 1998: hi-vis vest over a fleece, the big pack (the Beast cart when pushing) */
	start1998: {who: 'karl', head: 'hair', beard: true, frost: 0, top: 'fleece', mitts: false, boots: 'boot', pack: true, hivis: true, harness: false, lifevest: false, wet: false,
		bulk: {torso: 1.07, arm: 1.12, leg: 1.0}, pal: {...P0, top: '#18161b', sleeve: '#18161b', legs: '#121116', pack: '#1d1f1b', packHi: '#2b2d27', strap: '#2c2e31', vest: '#565a22', band: '#a3a497'}},
	/** the Darién: a soaked shirt clinging to him, the pack, a machete */
	jungle: {who: 'karl', head: 'hair', beard: true, frost: 0, top: 'shirt', mitts: false, boots: 'boot', pack: true, hivis: false, harness: false, lifevest: false, wet: true,
		bulk: {torso: 1.0, arm: 1.0, leg: 1.0}, pal: {...P0, hair: '#1e1c1a', top: '#16201a', sleeve: '#16201a', legs: '#111014', pack: '#1b1e19', packHi: '#282b24', strap: '#2b2d2d'}},
	/** the Bering Strait: a red expedition suit, hood up, a hauling harness (the red sled) */
	ice: {who: 'karl', head: 'hood', beard: true, frost: 0.55, top: 'suit', mitts: true, boots: 'big', pack: false, hivis: false, harness: true, lifevest: false, wet: false,
		bulk: {torso: 1.16, arm: 1.24, leg: 1.16}, pal: {...P0, top: '#4c1518', sleeve: '#4c1518', legs: '#401215', hood: '#4c1518', hand: '#16161b', strap: '#2b303b', frost: '#e4ebef'}},
	/** Siberia: a parka with a fur-ruff hood, frost on the beard, pushing the cart */
	siberia: {who: 'karl', head: 'ruff', beard: true, frost: 1, top: 'parka', mitts: true, boots: 'big', pack: false, hivis: false, harness: false, lifevest: false, wet: false,
		bulk: {torso: 1.2, arm: 1.25, leg: 1.06}, pal: {...P0, top: '#1e2319', sleeve: '#1e2319', legs: '#121116', hood: '#1e2319', ruff: '#4d473e', hand: '#16161a', frost: '#e4ebef'}},
	/** the Gobi: a head scarf, a loose shirt, leading a Bactrian camel */
	gobi: {who: 'karl', head: 'scarf', beard: true, frost: 0, top: 'tunic', mitts: false, boots: 'boot', pack: false, hivis: false, harness: false, lifevest: false, wet: false,
		bulk: {torso: 1.05, arm: 1.06, leg: 1.02}, pal: {...P0, top: '#221d18', sleeve: '#221d18', legs: '#141210', scarf: '#4c4130', scarfHi: '#625540'}},
	/** the swims: a wetsuit and a life vest ("floatimming") */
	swim: {who: 'karl', head: 'wet', beard: true, frost: 0, top: 'wetsuit', mitts: false, boots: 'bare', pack: false, hivis: false, harness: false, lifevest: true, wet: false,
		bulk: {torso: 0.97, arm: 0.94, leg: 0.95}, pal: {...P0, hair: '#1f1d1c', top: '#0a0a0d', sleeve: '#0a0a0d', legs: '#0a0a0d', boots: '#0a0a0d', vest: '#64301a', strap: '#2a1b14'}},
	/** home, 2026: a dark jacket (the orange-bagged cart when pushing) */
	home2026: {who: 'karl', head: 'hair', beard: true, frost: 0, top: 'jacket', mitts: false, boots: 'boot', pack: false, hivis: false, harness: false, lifevest: false, wet: false,
		bulk: {torso: 1.05, arm: 1.08, leg: 1.0}, pal: {...P0, top: '#151419', sleeve: '#151419', legs: '#0f0e12', trim: '#83401a'}},
	/** his mother (in her seventies): short grey hair, a long cardigan, trousers */
	mum: {who: 'mum', head: 'mum', beard: false, frost: 0, top: 'cardigan', mitts: false, boots: 'shoe', pack: false, hivis: false, harness: false, lifevest: false, wet: false,
		bulk: {torso: 0.94, arm: 0.88, leg: 0.9}, pal: {...P0, hair: '#5c5862', top: '#221d24', sleeve: '#221d24', legs: '#100f13'}},
};

/* ---------- skeleton & gaits ---------- */
/** bone lengths (body units) — the CMU mocap's */
const BL = {thigh: 0.264, shin: 0.269, foot: 0.11, spine: 0.155, neck: 0.0625, head: 0.0618, top: 0.066, upper: 0.2, fore: 0.148, hand: 0.036};
const MAPJ: Record<string, string> = {Hips: 'Hips', LUp: 'LeftUpLeg', LKnee: 'LeftLeg', LAnk: 'LeftFoot', LToe: 'LToeTip', RUp: 'RightUpLeg', RKnee: 'RightLeg', RAnk: 'RightFoot', RToe: 'RToeTip',
	Spine1: 'Spine1', Neck1: 'Neck1', Head: 'Head', Top: 'HeadTop', LSh: 'LeftArm', LElb: 'LeftForeArm', LHand: 'LeftHand', RSh: 'RightArm', RElb: 'RightForeArm', RHand: 'RightHand'};
const UPPER = ['Spine1', 'Neck1', 'Head', 'Top', 'LSh', 'RSh', 'LElb', 'RElb', 'LHand', 'RHand'];
/** the sole's two pivots (heel bottom, ball bottom) from the ankle and toe joints */
const soles = (an: V, to: V) => { const f = nrm(sub(to, an)), n: V = [-f[1], f[0]]; return {heel: add(add(an, mul(f, -0.03)), mul(n, -0.045)), ball: add(to, mul(n, -0.018))}; };
const lowOf = (p: Pose) => { const a = soles(p.LAnk, p.LToe), b = soles(p.RAnk, p.RToe); return Math.min(a.heel[1], a.ball[1], b.heel[1], b.ball[1]); };
const shiftP = (p: Pose, dx: number, dy: number): Pose => { const o: Pose = {}; for (const k of Object.keys(p)) o[k] = [p[k][0] + dx, p[k][1] + dy]; return o; };
type Gait = {N: number; P: Pose[]; stride: number};
/** a mocap gait, optionally with shorter steps (sx scales the thigh swing), bent knees (kAdd, degrees) and higher swings (kSwing, extra
    knee flexion while the leg is already folding). The leg is re-solved by FK from the mocap's own angles, so the knee pattern stays natural.
    Re-grounded every frame and root-locked on the pivot of the foot that is moving back (heel, then ball): a body moving stride·h per cycle never slides. */
const angD = (v: V) => Math.atan2(v[0], -v[1]) / DEG;   // angle from straight down, + = forward
const buildGait = (g: string, sx = 1, kAdd = 0, kSwing = 0): Gait => {
	const J = GAITS[g].j, N = J.Hips.length / 2, P: Pose[] = [];
	for (let i = 0; i < N; i++) {
		const r: Pose = {}; for (const [k, n] of Object.entries(MAPJ)) r[k] = [J[n][2 * i], J[n][2 * i + 1]];
		let p: Pose = {...r};
		if (sx !== 1 || kAdd || kSwing) for (const s of ['L', 'R']) {
			const up = r[s + 'Up'], kn = r[s + 'Knee'], an = r[s + 'Ank'], to = r[s + 'Toe'], l1 = len(sub(kn, up)), l2 = len(sub(an, kn));
			const at = angD(sub(kn, up)), as = angD(sub(an, kn)), k = at - as, k2 = k + kAdd + kSwing * ss(12, 50, k), at2 = at * sx + kAdd * 0.45, as2 = at2 - k2;
			const kn2 = add(up, mul(down(at2), l1)), an2 = add(kn2, mul(down(as2), l2));
			p[s + 'Knee'] = kn2; p[s + 'Ank'] = an2; p[s + 'Toe'] = add(an2, rotV(sub(to, an), as2 - as));
		}
		for (const s of ['L', 'R']) { const sh0 = p[s + 'Sh'], el0 = p[s + 'Elb'], wr0 = p[s + 'Hand'], sh = add(sh0, [0, -0.014]), el = add(sh, mul(nrm(sub(el0, sh0)), BL.upper));   // longer arms, lower shoulders than the CMU skeleton
			p[s + 'Sh'] = sh; p[s + 'Elb'] = el; p[s + 'Hand'] = add(el, mul(nrm(sub(wr0, el0)), BL.fore)); }
		P.push(p);
	}
	// the stance foot per frame: of the feet whose pivot (heel while the heel is down, then the ball) travels backward, the lowest
	type Ft = 'L' | 'R'; type Pv = 'heel' | 'ball';
	const ST: {f: Ft; k: Pv}[] = [];
	for (let i = 0; i < N; i++) {
		const a = P[i], b = P[(i + 1) % N], sa = {L: soles(a.LAnk, a.LToe), R: soles(a.RAnk, a.RToe)}, sb = {L: soles(b.LAnk, b.LToe), R: soles(b.RAnk, b.RToe)};
		const piv = (f: Ft) => { const k: Pv = sa[f].heel[1] <= sa[f].ball[1] ? 'heel' : 'ball'; return {k, v: sb[f][k][0] - sa[f][k][0], low: Math.min(sa[f].heel[1], sa[f].ball[1])}; };
		const pl = piv('L'), pr = piv('R'), back = [pl.v < 0, pr.v < 0];
		const f: Ft = back[0] && !back[1] ? 'L' : back[1] && !back[0] ? 'R' : pl.low <= pr.low ? 'L' : 'R';
		ST.push({f, k: f === 'L' ? pl.k : pr.k});
	}
	// ground every frame on its stance pivot (not on the lowest point: a swinging heel may skim lower)
	for (let i = 0; i < N; i++) { const {f, k} = ST[i]; P[i] = shiftP(P[i], 0, -soles(P[i][f + 'Ank'], P[i][f + 'Toe'])[k][1]); }
	const root = [0];
	for (let i = 0; i < N; i++) { const {f, k} = ST[i], j = (i + 1) % N; root.push(root[i] - (soles(P[j][f + 'Ank'], P[j][f + 'Toe'])[k][0] - soles(P[i][f + 'Ank'], P[i][f + 'Toe'])[k][0])); }
	const L0 = root[N];
	// the swing foot keeps a clearance that shrinks with its speed over the ground, so the heel comes down as it stops (no skating at heel strike)
	for (let i = 0; i < N; i++) {
		const sw = ST[i].f === 'L' ? 'R' : 'L', j = (i + 1) % N, p = P[i], so = soles(p[sw + 'Ank'], p[sw + 'Toe']), low = Math.min(so.heel[1], so.ball[1]);
		const vw = Math.abs((P[j][sw + 'Ank'][0] + root[i + 1]) - (p[sw + 'Ank'][0] + root[i])) * N, need = 0.015 * ss(0.05, 1.7, vw) - low;
		if (need > 0) { const up = p[sw + 'Up'], kn = p[sw + 'Knee'], an = p[sw + 'Ank'], an2: V = [an[0], an[1] + need], [k2, a3] = ik2(up, an2, len(sub(kn, up)), len(sub(an, kn)), 1);
			P[i] = {...p, [sw + 'Knee']: k2, [sw + 'Ank']: a3, [sw + 'Toe']: add(a3, sub(p[sw + 'Toe'], an))}; }
	}
	return {N, P: P.map((p, i) => shiftP(p, root[i] - (i / N) * L0, 0)), stride: L0};
};
const gaitAt = (G: Gait, u: number): Pose => { const x = fr(u) * G.N, i = Math.floor(x), f = x - i, a = G.P[i % G.N], b = G.P[(i + 1) % G.N], o: Pose = {};
	for (const k of Object.keys(a)) o[k] = [lerp(a[k][0], b[k][0], f), lerp(a[k][1], b[k][1], f)]; return o; };
const G_WALK = buildGait('08_04'), G_PUSH = buildGait('08_04', 0.9, 4), G_HAUL = buildGait('08_04', 0.8, 11), G_WADE = buildGait('08_04', 0.62, 5, 22), G_MUM = buildGait('08_04', 0.76, 3);
/** natural seconds per cycle and body units travelled per cycle, per action */
export const KARL_CYCLE: Record<Action, {sec: number; stride: number}> = {
	walk: {sec: 1.3, stride: G_WALK.stride}, pushCart: {sec: 1.36, stride: G_PUSH.stride}, haulSled: {sec: 1.55, stride: G_HAUL.stride},
	wade: {sec: 2.6, stride: G_WADE.stride}, leadCamel: {sec: 1.4, stride: G_WALK.stride}, swim: {sec: 1.75, stride: 0.42}, float: {sec: 1.5, stride: 0},
	stand: {sec: 4.2, stride: 0}, lookUp: {sec: 4.2, stride: 0}, hug: {sec: 3.6, stride: 0},
};
export const MUM_CYCLE = {walk: {sec: 1.45, stride: G_MUM.stride}, stand: {sec: 4.6, stride: 0}};
/** phase and distance (px) for an action at time t (s); pace scales the natural speed */
export const karlTravel = (action: Action, t: number, h: number, pace = 1) => { const c = KARL_CYCLE[action], phase = (t / c.sec) * pace; return {phase, dx: phase * c.stride * h}; };

/** designed poses by forward kinematics (degrees from straight down, + = forward) */
type FK = {hipX?: number; lean: number; neck?: number; lt: number; lk: number; rt: number; rk: number; lf?: number; rf?: number; la: number; le: number; ra: number; re: number};
const fkRaw = (k: FK, hipY = 1): Pose => {
	const hips: V = [k.hipX ?? 0, hipY], up = (a: number, l: number): V => [Math.sin(a * DEG) * l, Math.cos(a * DEG) * l];
	const leg = (t: number, kn: number, ft = 0): V[] => { const u = add(hips, [0, -0.066]), kp = add(u, mul(down(t), BL.thigh)), an = add(kp, mul(down(t - kn), BL.shin)); return [u, kp, an, add(an, [Math.cos(ft * DEG) * BL.foot, -0.025 + Math.sin(ft * DEG) * BL.foot])]; };
	const [LUp, LKnee, LAnk, LToe] = leg(k.lt, k.lk, k.lf ?? 0), [RUp, RKnee, RAnk, RToe] = leg(k.rt, k.rk, k.rf ?? 0);
	const nk = k.neck ?? 0, sp = add(hips, up(k.lean, BL.spine)), n1 = add(sp, up(k.lean + nk * 0.4, BL.neck)), hd = add(n1, up(k.lean + nk, BL.head)), top = add(hd, up(k.lean + nk, BL.top));
	const sh = add(sp, up(k.lean, BL.neck * 0.6));
	const arm = (a: number, e: number): V[] => { const el = add(sh, mul(down(a), BL.upper)); return [el, add(el, mul(down(a + e), BL.fore))]; };
	const [LElb, LHand] = arm(k.la, k.le), [RElb, RHand] = arm(k.ra, k.re);
	return {Hips: hips, LUp, LKnee, LAnk, LToe, RUp, RKnee, RAnk, RToe, Spine1: sp, Neck1: n1, Head: hd, Top: top, LSh: sh, LElb, LHand, RSh: add(sh, [0.006, -0.008]), RElb, RHand};
};
const fkPose = (k: FK): Pose => { const p = fkRaw(k); return shiftP(p, 0, -lowOf(p)); };
/** lean the upper body forward by deg about the hips */
const leanP = (p: Pose, deg: number): Pose => { const o: Pose = {...p}; for (const n of UPPER) o[n] = rotAbout(p[n], p.Hips, -deg); return o; };
/** tilt the head (+ = chin down) about the neck */
const nodP = (p: Pose, deg: number): Pose => ({...p, Head: rotAbout(p.Head, p.Neck1, -deg), Top: rotAbout(p.Top, p.Neck1, -deg)});
/** set an arm by FK angles from its own shoulder */
const armFK = (p: Pose, s: 'L' | 'R', a: number, e: number): Pose => { const el = add(p[s + 'Sh'], mul(down(a), BL.upper)); return {...p, [s + 'Elb']: el, [s + 'Hand']: add(el, mul(down(a + e), BL.fore))}; };
/** reach a grip point with an arm (IK); returns the pose with the wrist placed so the hand's centre sits on the grip */
const armIK = (p: Pose, s: 'L' | 'R', grip: V, bend = -1): Pose => { const [el, end] = ik2(p[s + 'Sh'], grip, BL.upper, BL.fore + BL.hand, bend);
	return {...p, [s + 'Elb']: el, [s + 'Hand']: add(el, mul(nrm(sub(end, el)), BL.fore))}; };
/** the standing height of the drawn figure (hair top) → every pose is scaled so that standing = 1 */
const STAND = fkPose({lean: 1.5, lt: 1.5, lk: 2, rt: -2.5, rk: 3, la: -3, le: 9, ra: 3, re: 13});
const headO = (p: Pose): {O: V; U: V; F: V} => { const U = nrm(sub(p.Top, p.Neck1)); return {O: add(p.Neck1, mul(U, 0.07)), U, F: [U[1], -U[0]]}; };
const KS = 1 / (headO(STAND).O[1] + 0.084);

/* ============================================================================================================
   drawing one figure: parts by depth
   ============================================================================================================ */
type HandK = 'open' | 'fist' | 'grip';
type FigOpt = {t: number; handL?: HandK; handR?: HandK; dirL?: V; dirR?: V; frost?: number; wind?: number};
type Parts = {farArm: Sh[]; pack: Sh[]; farLeg: Sh[]; nearLeg: Sh[]; torso: Sh[]; gear: Sh[]; head: Sh[]; nearArm: Sh[]};
type Ctx = {S: (p: V) => V; h: number};
export const ctxAt = (x: number, y: number, h: number): Ctx => ({S: (p: V) => [x + p[0] * h * KS, y - p[1] * h * KS], h: h * KS});

const figure = (cx: Ctx, pose: Pose, lk: Look, o: FigOpt): Parts => {
	const {S, h} = cx, pal = lk.pal, B = lk.bulk, out: Parts = {farArm: [], pack: [], farLeg: [], nearLeg: [], torso: [], gear: [], head: [], nearArm: []};
	const far = (c: string) => mixHex(c, '#3a3a44', 0.1);   // far limbs: a touch lighter (air between)
	/* --- the spine frame: s up the spine from the hips, w toward the back --- */
	const A = pose.Hips, Bp = pose.Spine1, C = pose.Neck1, l1 = len(sub(Bp, A)), t1 = nrm(sub(Bp, A)), t2 = nrm(sub(C, Bp));
	const T = (s: number, w: number): V => { const p = s <= l1 ? add(A, mul(t1, s)) : add(Bp, mul(t2, s - l1)), t = nrm(mixV(t1, t2, ss(l1 - 0.05, l1 + 0.05, s))); return add(p, mul([-t[1], t[0]], w)); };
	const TS = (s: number, w: number) => S(T(s, w));
	const prof = (sv: number[], fw: number[], bw: number[], k: number, e = 0): V[] => [...sv.map((s, i) => TS(s, -(fw[i] * k + e))), ...sv.map((s, i) => TS(s, bw[i] * k + e)).reverse()];
	/* --- legs --- */
	const tight = lk.top === 'wetsuit';
	const leg = (s: 'L' | 'R', fill: string): Sh[] => {
		const up = pose[s + 'Up'], kn = pose[s + 'Knee'], an = pose[s + 'Ank'], to = pose[s + 'Toe'], ext = add(up, mul(nrm(sub(up, kn)), 0.06));
		const pts = [ext, ...along(up, kn, 5), ...along(kn, an, 5).slice(1)], n = pts.length - 1, U = (i: number) => i / n, k = B.leg * (lk.who === 'mum' ? 1 : 1.05);
		const back = pts.map((_, i) => { const u = U(i); return (tight ? (u < 0.5 ? lerp(0.07, 0.034, ss(0, 0.5, u)) : 0.026 + 0.016 * Math.sin(Math.PI * clamp((u - 0.5) * 2.3)) - 0.006 * ss(0.85, 1, u))
			: (u < 0.5 ? lerp(0.074, 0.042, ss(0, 0.5, u)) : lerp(0.042, 0.034, (u - 0.5) * 2))) * k; });
		const front = pts.map((_, i) => { const u = U(i); return (tight ? (u < 0.5 ? lerp(0.058, 0.03, u * 2) : lerp(0.03, 0.022, (u - 0.5) * 2)) : (u < 0.5 ? lerp(0.06, 0.036, u * 2) : lerp(0.036, 0.031, (u - 0.5) * 2))) * k; });
		const sh: Sh[] = [{d: chainD(pts.map(S), back.map((v) => v * h), front.map((v) => v * h)), f: fill}];
		/* boot / foot in the foot frame (u along ankle→toe, v up-normal) */
		const f = nrm(sub(to, an)), nn: V = [-f[1], f[0]], Fp = (u: number, v: number) => S(add(add(an, mul(f, u)), mul(nn, v)));
		const big = lk.boots === 'big' ? 1.14 : 1;
		const shape: number[][] = lk.boots === 'bare' ? [[-0.032, -0.04], [0.04, -0.034], [0.112, -0.018], [0.13, -0.006], [0.118, 0.012], [0.05, 0.026], [0.012, 0.04], [-0.024, 0.036], [-0.036, 0.0]]
			: lk.boots === 'shoe' ? [[-0.032, -0.044], [0.03, -0.042], [0.105, -0.022], [0.126, -0.01], [0.124, 0.006], [0.1, 0.016], [0.04, 0.026], [0.012, 0.034], [-0.03, 0.03], [-0.04, -0.01]]
			: [[-0.032, -0.045], [0.02, -0.043], [0.092, -0.024], [0.116, -0.014], [0.12, 0.002], [0.104, 0.017], [0.05, 0.03], [0.02, 0.05 * big], [0.022, 0.066 * big], [-0.034, 0.064 * big], [-0.04, 0.02], [-0.04, -0.03]];
		sh.push({d: closedD(shape.map(([u, v]) => Fp(u * (big > 1 ? 1.05 : 1), v))), f: lk.boots === 'bare' ? fill : pal.boots});
		return sh;
	};
	out.farLeg.push(...leg('R', far(pal.legs))); out.nearLeg.push(...leg('L', pal.legs));
	/* --- arms + hands --- */
	const arm = (s: 'L' | 'R', fill: string, hk: HandK, hd?: V): Sh[] => {
		const sh0 = pose[s + 'Sh'], el = pose[s + 'Elb'], wr = pose[s + 'Hand'], ext = add(sh0, mul(nrm(sub(sh0, el)), 0.026));
		const pts = [ext, ...along(sh0, el, 4), ...along(el, wr, 4).slice(1)], n = pts.length - 1, k = B.arm;
		const wa = pts.map((_, i) => { const u = i / n; return (u < 0.12 ? 0.04 : u < 0.5 ? lerp(0.038, 0.025, (u - 0.12) / 0.38) : u < 0.72 ? lerp(0.025, 0.027, (u - 0.5) / 0.22) : lerp(0.027, 0.019, (u - 0.72) / 0.28)) * k * h; });
		const wb = pts.map((_, i) => { const u = i / n; return (u < 0.12 ? 0.038 : u < 0.5 ? lerp(0.036, 0.024, (u - 0.12) / 0.38) : lerp(0.024, 0.018, (u - 0.5) / 0.5)) * k * h; });
		const out1: Sh[] = [{d: chainD(pts.map(S), wa, wb), f: fill}];
		if (lk.top === 'suit' || lk.top === 'parka') out1.push({d: chainD([wr, add(wr, mul(nrm(sub(el, wr)), 0.03))].map(S), [0.026 * k * h, 0.026 * k * h], [0.026 * k * h, 0.026 * k * h]), f: fill});
		const d = hd ?? nrm(sub(wr, el)), hc = lk.mitts ? 1.22 : lk.who === 'mum' ? 0.9 : 1, handF = pal.hand;
		if (hk === 'open') { const q = [wr, add(wr, mul(d, 0.022 * hc)), add(wr, mul(d, 0.046 * hc)), add(wr, mul(d, 0.064 * hc))].map(S);
			out1.push({d: chainD(q, [0.0135, 0.0165, 0.015, 0.006].map((v) => v * h * hc), [0.0135, 0.0175, 0.0155, 0.006].map((v) => v * h * hc)), f: handF}); }
		else { const q = [add(wr, mul(d, -0.004)), add(wr, mul(d, 0.02 * hc)), add(wr, mul(d, 0.042 * hc))].map(S);
			out1.push({d: chainD(q, [0.014, 0.02, 0.012].map((v) => v * h * hc), [0.014, 0.02, 0.013].map((v) => v * h * hc)), f: handF}); }
		return out1;
	};
	out.farArm.push(...arm('R', far(pal.sleeve), o.handR ?? 'open', o.dirR)); out.nearArm.push(...arm('L', pal.sleeve, o.handL ?? 'open', o.dirL));
	/* --- torso (the body under the clothes) --- */
	/* torso profile: [s, front, back] half-widths; the body reaches down to the crotch (s ≈ -0.145) */
	const L = l1 + len(sub(C, Bp)), bt = B.torso * (lk.who === 'mum' ? 1 : 1.06), mumB = lk.who === 'mum';
	const TK = mumB ? [[-0.145, 0.046, 0.05], [-0.105, 0.058, 0.074], [-0.055, 0.06, 0.08], [-0.005, 0.054, 0.062], [0.05, 0.058, 0.056], [0.1, 0.068, 0.062], [0.15, 0.064, 0.068], [0.19, 0.054, 0.066], [L, 0.03, 0.034]]
		: [[-0.145, 0.048, 0.052], [-0.105, 0.06, 0.072], [-0.055, 0.064, 0.078], [-0.005, 0.059, 0.064], [0.05, 0.061, 0.058], [0.1, 0.071, 0.064], [0.15, 0.069, 0.071], [0.19, 0.06, 0.07], [L, 0.033, 0.037]];
	const tw = (s: number): [number, number] => { if (s <= TK[0][0]) return [TK[0][1], TK[0][2]]; for (let i = 1; i < TK.length; i++) if (s <= TK[i][0]) { const u = (s - TK[i - 1][0]) / (TK[i][0] - TK[i - 1][0]); return [lerp(TK[i - 1][1], TK[i][1], u), lerp(TK[i - 1][2], TK[i][2], u)]; } return [TK[TK.length - 1][1], TK[TK.length - 1][2]]; };
	out.torso.push({d: closedD([...TK.map(([s0, f0]) => TS(s0, -f0 * bt)), ...TK.map(([s0, , b0]) => TS(s0, b0 * bt)).reverse(), TS(-0.152, 0)]), f: pal.body});
	{ const {O, U} = headO(pose); out.torso.push({d: chainD([sub(C, mul(U, 0.02)), add(C, mul(U, 0.03)), sub(O, mul(U, 0.02))].map(S), [0.03 * h, 0.028 * h, 0.026 * h], [0.033 * h, 0.03 * h, 0.03 * h]), f: pal.body}); }
	/* --- the top garment: follows the torso down to the hips; a long hem (parka, tunic, cardigan) hangs round the thighs, so it swings with the stride --- */
	const top = lk.top, tf = pal.top;
	const garment = (sBot: number, e: number, flare: number, collar: number, openFront = false): V[] => {
		const sTop = L - 0.008, ks = [0.19, 0.15, 0.1, 0.05, -0.005, -0.055, -0.105, -0.13].filter((v) => v > sBot && v < sTop);
		const front: V[] = [TS(sTop, -(tw(sTop)[0] * bt + e * 0.6)), ...ks.map((s0) => TS(s0, -(tw(s0)[0] * bt + e)))], back: V[] = [TS(sTop, tw(sTop)[1] * bt + e * 0.6), ...ks.map((s0) => TS(s0, tw(s0)[1] * bt + e))];
		const col = collar > 0 ? [TS(L + collar, -0.03), TS(L + collar * 1.1, 0.036)] : [];
		let hem: V[];
		if (sBot > -0.14) hem = [TS(sBot, -(tw(sBot)[0] * bt + e + flare)), TS(sBot - 0.008, 0), TS(sBot, tw(sBot)[1] * bt + e + flare)];
		else {   // hem below the crotch: find the thighs at that depth
			const dep = -sBot - 0.066, q = (sd: string) => mixV(pose[sd + 'Up'], pose[sd + 'Knee'], clamp(dep / BL.thigh, 0, 1.05)), ql = q('L'), qr = q('R');
			const fwd: V = mixV(t1, [0, 1], 0.5), fx = nrm([fwd[1], -fwd[0]]), dotF = (v: V) => v[0] * fx[0] + v[1] * fx[1];
			const qf = dotF(ql) > dotF(qr) ? ql : qr, qb = dotF(ql) > dotF(qr) ? qr : ql, hy = (ql[1] + qr[1]) / 2;
			const fr0: V = add([qf[0], hy + (openFront ? 0.01 : 0)], mul(fx, 0.062 * B.leg + e + flare)), bk0: V = add([qb[0], hy], mul(fx, -(0.074 * B.leg + e + flare * 1.2)));
			hem = [S(fr0), S(mixV(fr0, bk0, 0.5)), S(add(bk0, [0, 0.004]))];
		}
		return [...col.slice(0, 1), ...front, ...hem, ...back.reverse(), ...col.slice(1)];
	};
	if (top === 'jacket') { out.torso.push({d: closedD(garment(-0.125, 0.012, 0.006, 0.03)), f: tf});
		out.gear.push({d: barD(TS(-0.12, -(tw(-0.12)[0] * bt + 0.011)), TS(L - 0.01, -(tw(L)[0] * bt + 0.006)), Math.max(1, 0.004 * h)), f: mixHex(tf, '#55545e', 0.3)});
		if (pal.trim) out.gear.push({d: polyD([TS(L - 0.004, -0.034), TS(L + 0.03, -0.03), TS(L + 0.03, -0.018), TS(L + 0.002, -0.02)]), f: pal.trim}); }
	else if (top === 'fleece') out.torso.push({d: closedD(garment(-0.11, 0.016, 0.004, 0.028)), f: tf});
	else if (top === 'shirt') { out.torso.push({d: closedD(garment(-0.11, 0.005, 0.004, 0.016)), f: tf});
		if (lk.wet) for (let i = 0; i < 4; i++) { const s0 = -0.04 + i * 0.055; out.gear.push({d: chainD([TS(s0, -(0.062 + 0.004 * i)), TS(s0 + 0.03, -(0.066 + 0.003 * i)), TS(s0 + 0.05, -0.058)], [0.0016 * h, 0.0026 * h, 0.001 * h], [0.0016 * h, 0.0026 * h, 0.001 * h]), f: '#7e8c82', o: 0.6}); } }
	else if (top === 'tunic') { out.torso.push({d: closedD(garment(-0.22, 0.014, 0.012, 0.018)), f: tf});
		out.gear.push({d: barD(TS(-0.03, -(tw(-0.03)[0] * bt + 0.016)), TS(-0.03, tw(-0.03)[1] * bt + 0.017), 0.012 * h), f: mixHex(tf, '#5a4c38', 0.4)}); }
	else if (top === 'parka') { out.torso.push({d: closedD(garment(-0.3, 0.026, 0.016, 0.0)), f: tf});
		out.gear.push({d: barD(TS(-0.02, -(tw(-0.02)[0] * bt + 0.026)), TS(-0.02, tw(-0.02)[1] * bt + 0.026), Math.max(1, 0.004 * h)), f: mixHex(tf, '#6a6e60', 0.22)}); }
	else if (top === 'suit') out.torso.push({d: closedD(garment(-0.12, 0.016, 0.006, 0.0)), f: tf});
	else if (top === 'cardigan') { out.torso.push({d: closedD(garment(-0.33, 0.012, 0.012, 0.014, true)), f: tf});
		out.gear.push({d: barD(TS(-0.1, -(tw(-0.1)[0] * bt + 0.012)), TS(0.16, -(tw(0.16)[0] * bt + 0.008)), Math.max(1, 0.004 * h)), f: mixHex(tf, '#6a5e6a', 0.3)}); }
	else if (top === 'wetsuit') out.torso.push({d: chainD([C, add(C, mul(headO(pose).U, 0.025))].map(S), [0.036 * h, 0.034 * h], [0.04 * h, 0.038 * h]), f: tf});
	/* --- kit on the torso --- */
	if (lk.hivis && pal.vest) { const vf = (s0: number) => -(tw(s0)[0] * bt + 0.021), vb = (s0: number) => tw(s0)[1] * bt + 0.021;
		out.gear.push({d: closedD([TS(-0.075, vf(-0.075)), TS(0.02, vf(0.02)), TS(0.12, vf(0.12)), TS(0.175, -0.05), TS(0.2, -0.012), TS(0.21, 0.03), TS(0.19, 0.068), TS(0.12, vb(0.12)), TS(0.02, vb(0.02)), TS(-0.075, vb(-0.075)), TS(-0.085, 0.0)]), f: pal.vest});
		for (const s0 of [-0.035, 0.06]) out.gear.push({d: polyD([TS(s0, vf(s0) - 0.001), TS(s0 + 0.018, vf(s0 + 0.018) - 0.001), TS(s0 + 0.018, vb(s0 + 0.018) + 0.001), TS(s0, vb(s0) + 0.001)]), f: pal.band ?? '#999'}); }
	if (lk.pack) {   // a 70-litre expedition pack: against the back from the waist to a little above the shoulders, lid on top, a side pocket
		const pk = pal.pack ?? '#1c1e1a', hi = pal.packHi ?? '#2a2c26', bb = (s0: number) => tw(s0)[1] * bt;
		out.pack.push({d: closedD([TS(-0.06, bb(-0.06) - 0.004), TS(-0.075, 0.13), TS(-0.05, 0.19), TS(0.06, 0.205), TS(0.2, 0.2), TS(0.255, 0.17), TS(0.262, 0.1), TS(0.245, bb(0.2) - 0.004), TS(0.1, bb(0.1) - 0.004)]), f: pk});
		out.pack.push({d: closedD([TS(0.215, bb(0.2) - 0.006), TS(0.275, 0.07), TS(0.29, 0.135), TS(0.272, 0.2), TS(0.22, 0.205)]), f: hi});
		out.pack.push({d: closedD([TS(-0.045, 0.165), TS(-0.05, 0.205), TS(0.07, 0.21), TS(0.075, 0.17)]), f: hi});
		for (const s0 of [0.04, 0.14]) out.pack.push({d: barD(S(T(s0, 0.09)), S(T(s0 + 0.004, 0.198)), Math.max(1, 0.006 * h)), f: mixHex(hi, '#000000', 0.25)});
	}
	const strapLoop = (fill: string) => {
		const cl: V[] = [T(0.245, 0.07), T(0.24, 0.0), T(0.19, -0.06), T(0.12, -0.066), T(0.06, -0.03), T(0.035, 0.05)];
		out.gear.push({d: chainD(cl.map(S), cl.map(() => 0.011 * h), cl.map(() => 0.011 * h)), f: fill});
		out.gear.push({d: polyD([TS(-0.012, -(0.06 * bt + 0.012)), TS(0.026, -(0.06 * bt + 0.012)), TS(0.026, 0.07 * bt + 0.012), TS(-0.012, 0.07 * bt + 0.012)]), f: fill});
	};
	if (lk.pack) strapLoop(pal.strap ?? '#2a2c2e');
	if (lk.harness) strapLoop(pal.strap ?? '#2a2e38');
	if (lk.lifevest && pal.vest) {
		out.gear.push({d: closedD([TS(0.05, -(0.062 * bt + 0.03)), TS(0.12, -(0.07 * bt + 0.034)), TS(0.19, -0.075), TS(0.225, -0.04), TS(L + 0.035, 0.0), TS(L + 0.045, 0.05), TS(0.215, 0.098), TS(0.13, 0.072 * bt + 0.032), TS(0.06, 0.064 * bt + 0.028), TS(0.035, 0.0)]), f: pal.vest});
		out.gear.push({d: polyD([TS(0.085, -(0.066 * bt + 0.033)), TS(0.1, -(0.067 * bt + 0.033)), TS(0.1, 0.068 * bt + 0.031), TS(0.085, 0.067 * bt + 0.031)]), f: pal.strap ?? '#2a1b14'});
	}
	/* --- the head --- */
	out.head.push(...headShapes(cx, pose, lk, o));
	return out;
};

/** the one head: skull + face profile, the short full beard, medium hair swept back (or the attire's headwear) */
const headShapes = (cx: Ctx, pose: Pose, lk: Look, o: FigOpt): Sh[] => {
	const {S, h} = cx, pal = lk.pal, {O, U, F} = headO(pose), H = (a: number, b: number): V => S(add(add(O, mul(F, a)), mul(U, b))), Hs = (a: number, b: number) => ps(H(a, b));
	const out: Sh[] = [], mum = lk.who === 'mum', frost = o.frost ?? lk.frost;
	/* medium-length hair swept back from a high forehead, falling to the collar in a few locks (the 2026 photos); wet = flatter, darker */
	const hairD = (wet: boolean) => { const q = wet ? 0.9 : 1, P = (a0: number, b0: number) => Hs(a0, b0 > 0.03 ? 0.03 + (b0 - 0.03) * q : b0);
		if (wet) return `M${P(0.04, 0.05)} C${P(0.054, 0.064)} ${P(0.046, 0.086)} ${P(0.014, 0.088)} C${P(-0.03, 0.09)} ${P(-0.068, 0.072)} ${P(-0.076, 0.035)} C${P(-0.082, 0.0)} ${P(-0.076, -0.03)} ${P(-0.07, -0.062)} Q${P(-0.058, -0.07)} ${P(-0.05, -0.05)} Q${P(-0.046, -0.02)} ${P(-0.03, 0.0)} Q${P(-0.012, 0.02)} ${P(0.006, 0.036)} Q${P(0.022, 0.046)} ${P(0.04, 0.05)} Z`;
		return `M${P(0.04, 0.05)} C${P(0.056, 0.064)} ${P(0.048, 0.088)} ${P(0.014, 0.09)} C${P(-0.03, 0.092)} ${P(-0.07, 0.074)} ${P(-0.08, 0.035)} C${P(-0.086, 0.0)} ${P(-0.08, -0.03)} ${P(-0.082, -0.05)}`
			+ ` L${P(-0.092, -0.082)} L${P(-0.074, -0.066)} L${P(-0.08, -0.092)} L${P(-0.063, -0.071)} L${P(-0.06, -0.084)} Q${P(-0.05, -0.06)} ${P(-0.048, -0.04)} Q${P(-0.044, -0.012)} ${P(-0.03, 0.0)} Q${P(-0.012, 0.02)} ${P(0.006, 0.036)} Q${P(0.022, 0.046)} ${P(0.04, 0.05)} Z`; };
	const combs = [[0.03, 0.074, -0.054, 0.062], [0.008, 0.06, -0.066, 0.032]].map(([a0, b0, a1, b1]) =>
		`M${Hs(a0, b0)} Q${Hs((a0 + a1) / 2, Math.max(b0, b1) + 0.012)} ${Hs(a1, b1)} Q${Hs((a0 + a1) / 2, Math.max(b0, b1) + 0.009)} ${Hs(a0, b0 - 0.003)} Z`);
	/* the faceless profile: sloping forehead, brow, a clear nose, lips; and the short full beard close along the jaw, a little proud at the chin */
	const face = mum
		? `M${Hs(-0.028, -0.055)} C${Hs(-0.064, -0.03)} ${Hs(-0.068, 0.04)} ${Hs(-0.032, 0.058)} C${Hs(-0.004, 0.07)} ${Hs(0.03, 0.064)} ${Hs(0.04, 0.046)} Q${Hs(0.052, 0.032)} ${Hs(0.053, 0.014)} Q${Hs(0.054, 0.004)} ${Hs(0.05, 0.0)} Q${Hs(0.058, -0.008)} ${Hs(0.066, -0.022)} Q${Hs(0.064, -0.028)} ${Hs(0.055, -0.028)} L${Hs(0.057, -0.035)} L${Hs(0.053, -0.04)} L${Hs(0.055, -0.045)} Q${Hs(0.054, -0.058)} ${Hs(0.04, -0.063)} Q${Hs(0.016, -0.066)} ${Hs(0.0, -0.058)} Z`
		: `M${Hs(-0.03, -0.055)} C${Hs(-0.068, -0.03)} ${Hs(-0.072, 0.04)} ${Hs(-0.035, 0.06)} C${Hs(-0.005, 0.074)} ${Hs(0.03, 0.068)} ${Hs(0.042, 0.05)} Q${Hs(0.056, 0.036)} ${Hs(0.058, 0.016)} Q${Hs(0.06, 0.006)} ${Hs(0.054, 0.001)} Q${Hs(0.064, -0.008)} ${Hs(0.077, -0.024)} Q${Hs(0.075, -0.031)} ${Hs(0.062, -0.031)} L${Hs(0.064, -0.038)} L${Hs(0.06, -0.043)} L${Hs(0.063, -0.048)} Q${Hs(0.064, -0.062)} ${Hs(0.05, -0.068)} Q${Hs(0.02, -0.072)} ${Hs(0.0, -0.062)} Z`;
	const beard = `M${Hs(-0.004, 0.0)} Q${Hs(0.004, -0.02)} ${Hs(0.03, -0.023)} Q${Hs(0.05, -0.025)} ${Hs(0.062, -0.031)} L${Hs(0.067, -0.036)} Q${Hs(0.06, -0.04)} ${Hs(0.066, -0.046)} Q${Hs(0.075, -0.066)} ${Hs(0.057, -0.081)} Q${Hs(0.03, -0.091)} ${Hs(0.0, -0.072)} Q${Hs(-0.014, -0.04)} ${Hs(-0.004, 0.0)} Z`;
	const brow = chainD([H(0.034, 0.012), H(0.046, 0.016), H(0.058, 0.013)], [0.003 * h, 0.004 * h, 0.003 * h], [0.002 * h, 0.003 * h, 0.002 * h]);
	const frostOn = (k: number) => { if (k <= 0) return;   // rime: the beard goes pale, ice beads on it and on the brow
		out.push({d: beard, f: pal.frost ?? '#e4ebef', o: 0.42 * k}); out.push({d: brow, f: pal.frost ?? '#e4ebef', o: 0.8 * k});
		for (let i = 0; i < 18; i++) { const a0 = lerp(0.006, 0.068, rnd(i, 1)), b0 = lerp(-0.084, -0.026, rnd(i, 2)); if (a0 < 0.02 && b0 > -0.03) continue;
			out.push({d: circD(H(a0, b0), (0.0022 + 0.0018 * rnd(i, 3)) * h), f: pal.frost ?? '#e4ebef', o: k * (0.6 + 0.4 * rnd(i, 4))}); } };
	switch (lk.head) {
		case 'hair': case 'wet':
			out.push({d: face, f: pal.body}, {d: beard, f: pal.beard}, {d: hairD(lk.head === 'wet'), f: pal.hair});
			for (const c of combs) out.push({d: c, f: mixHex(pal.hair, '#9a907e', 0.14)});
			frostOn(frost); break;
		case 'scarf': {   // a long cotton scarf wound round the head (the hair shows at the nape), two ends hanging from a knot at the back
			const sc = pal.scarf ?? '#4c4130', hi = pal.scarfHi ?? '#625540', lo = mixHex(sc, '#000000', 0.22);
			out.push({d: face, f: pal.body}, {d: beard, f: pal.beard}, {d: hairD(false), f: pal.hair});
			const t = o.t, wd = o.wind ?? 1;
			for (const [k, len0, ph0] of [[0, 0.15, 0], [1, 0.11, 1.3]]) { const tail: V[] = [];
				for (let i = 0; i <= 6; i++) { const u = i / 6, fl = Math.sin(t * 6.2 - u * 3.4 + ph0) * 0.012 * u * wd; tail.push(H(-0.078 - 0.01 * k - 0.02 * u - 0.028 * u * u * wd + fl, -0.03 - len0 * u)); }
				out.push({d: chainD(tail, tail.map((_, i) => (0.016 - 0.005 * i / 6) * h), tail.map((_, i) => (0.016 - 0.007 * i / 6) * h)), f: k ? lo : mixHex(sc, '#000000', 0.12)}); }
			out.push({d: `M${Hs(0.06, 0.034)} C${Hs(0.07, 0.07)} ${Hs(0.042, 0.1)} ${Hs(-0.01, 0.102)} C${Hs(-0.062, 0.1)} ${Hs(-0.094, 0.07)} ${Hs(-0.096, 0.025)} Q${Hs(-0.097, -0.015)} ${Hs(-0.076, -0.04)} Q${Hs(-0.042, -0.018)} ${Hs(-0.022, 0.004)} Q${Hs(0.02, 0.032)} ${Hs(0.06, 0.034)} Z`, f: sc});
			for (const [a0, b0, a1, b1] of [[0.062, 0.046, -0.07, 0.084], [0.048, 0.078, -0.09, 0.04], [0.03, 0.032, -0.08, 0.0]]) { const m = mixV([a0, b0], [a1, b1], 0.5);
				out.push({d: chainD([H(a0, b0), H(m[0], m[1] + 0.008), H(a1, b1)], [0.003 * h, 0.0055 * h, 0.003 * h], [0.003 * h, 0.0055 * h, 0.003 * h]), f: hi}); }
			out.push({d: circD(H(-0.082, -0.03), 0.018 * h), f: hi});
			frostOn(frost); break; }
		case 'hood': case 'ruff': {   // hood up: the face shows in its opening (brow, nose, the beard)
			const hood = pal.hood ?? pal.top, ruff = lk.head === 'ruff';
			const outer = `M${Hs(0.056, 0.066)} C${Hs(0.04, 0.104)} ${Hs(-0.05, 0.108)} ${Hs(-0.086, 0.052)} C${Hs(-0.106, -0.01)} ${Hs(-0.1, -0.09)} ${Hs(-0.07, -0.132)} L${Hs(0.0, -0.126)} Q${Hs(0.036, -0.108)} ${Hs(0.048, -0.09)}`;
			out.push({d: outer + ` L${Hs(0.03, -0.02)} Z`, f: hood});
			out.push({d: face, f: pal.body}, {d: beard, f: pal.beard}); frostOn(frost);
			out.push({d: outer + ` Q${Hs(0.02, -0.07)} ${Hs(0.022, -0.02)} Q${Hs(0.024, 0.036)} ${Hs(0.056, 0.066)} Z`, f: hood});   // the side of the hood over the cheek and ear
			if (ruff) {   // a ragged fur ruff round the opening: proud over the brow and under the chin; the nose and the frosted beard poke through
				const n = 17, pts: V[] = [], cen = (u: number): V => [0.024 + 0.03 * (1 - Math.sin(Math.PI * u)) ** 1.5, lerp(0.088, -0.1, u)];
				for (let i = 0; i <= n; i++) { const u = i / n, c = cen(u), j = (i % 2 ? 0.02 : 0.006) + 0.003 * Math.sin(o.t * 3 + i * 1.3); pts.push(H(c[0] + j, c[1])); }
				for (let i = n; i >= 0; i--) { const u = i / n, c = cen(u); pts.push(H(c[0] - 0.018, c[1] * 0.96)); }
				out.push({d: closedD(pts), f: pal.ruff ?? '#4d473e'});
				if (frost > 0) for (let i = 0; i < 12; i++) { const c = cen((i + 0.5) / 12); out.push({d: circD(H(c[0] + 0.006 + 0.012 * rnd(i, 3), c[1]), (0.0022 + 0.0016 * rnd(i, 5)) * h), f: pal.frost ?? '#e4ebef', o: frost * 0.8}); }
			} else out.push({d: chainD([H(0.056, 0.07), H(0.024, 0.03), H(0.022, -0.04), H(0.048, -0.094)], [0.006 * h, 0.006 * h, 0.006 * h, 0.006 * h], [0.004 * h, 0.004 * h, 0.004 * h, 0.004 * h]), f: mixHex(hood, '#000000', 0.4)});
			break; }
		case 'mum': {   // short curled grey hair, ear length
			out.push({d: face, f: pal.body});
			const pts: V[] = [[-0.024, 0.045], [-0.07, 0.036], [-0.082, -0.01], [-0.078, -0.052], [-0.056, -0.064], [-0.072, -0.028], [-0.086, 0.02], [-0.08, 0.06], [-0.05, 0.086], [-0.01, 0.092], [0.032, 0.082], [0.054, 0.058], [0.056, 0.036], [0.042, 0.04]];
			const P = pts.map(([a, b]) => H(a, b)); let d = `M${ps(H(0.02, 0.05))} L${ps(P[0])}`;
			for (let i = 1; i < P.length; i++) { const a = P[i - 1], c = P[i], m = mixV(a, c, 0.5), nx = -(c[1] - a[1]), ny = c[0] - a[0], nl = Math.hypot(nx, ny) || 1; d += ` Q${ps([m[0] - nx / nl * 0.011 * h, m[1] - ny / nl * 0.011 * h])} ${ps(c)}`; }
			out.push({d: d + 'Z', f: pal.hair}); break; }
	}
	return out;
};

/* ============================================================================================================
   PROPS: the cart ("the Beast"), the sled, the camel, his mother
   ============================================================================================================ */
const CART_R: Record<CartKind, number> = {beast98: 0.14, winter: 0.17, orange: 0.17};
/** the grip of the cart's handlebar relative to its axle at rest (body units; the cart is ahead of the walker) */
const CART_GRIP: Record<CartKind, V> = {beast98: [-0.56, 0.45], winter: [-0.6, 0.42], orange: [-0.6, 0.42]};
/** cart layers: `grip` = where the hands hold the handlebar (body units, ground y = 0), the axle sits on the ground ahead;
    `dist` = distance rolled (body units) → the wheels turn. Returns back/front shape lists. */
const cartShapes = (cx: Ctx, kind: CartKind, grip: V, dist: number, t: number): {back: Sh[]; front: Sh[]} => {
	const {S, h} = cx, R = CART_R[kind], g0 = CART_GRIP[kind], Lg = len(g0), dy = grip[1] - R, ax = grip[0] + Math.sqrt(Math.max(0.01, Lg * Lg - dy * dy));
	const A: V = [ax, R], phi = Math.atan2(grip[1] - R, grip[0] - ax) / DEG - Math.atan2(g0[1], g0[0]) / DEG;
	const Cc = (u: number, v: number): V => S(add(A, rotV([u, v], phi)));
	const cl = (pts: number[][]) => closedD(pts.map(([u, v]) => Cc(u, v)));
	const back: Sh[] = [], front: Sh[] = [], frame = '#16161a', spin = dist / R;
	const wheel = (c: V, r: number, list: Sh[], col: string) => { list.push({d: ringD(c, r * h, r * h * 0.84), f: col});
		for (let i = 0; i < 6; i++) { const a = spin + i * Math.PI / 3; list.push({d: barD(c, add(c, [Math.cos(a) * r * h * 0.86, Math.sin(a) * r * h * 0.86]), Math.max(1, 0.006 * h)), f: col}); }
		list.push({d: circD(c, r * h * 0.14), f: col}); };
	wheel(add(S(A), [-0.02 * h, -0.012 * h]), R, back, '#1c1c22');
	// the handlebar: a long bar from the cart's rear frame up to a bike handlebar at the grip
	const gS = Cc(g0[0], g0[1]);
	back.push({d: barD(Cc(-0.2, 0.1), Cc(g0[0] + 0.05, g0[1] - 0.06), 0.02 * h), f: frame});
	back.push({d: barD(Cc(g0[0] + 0.05, g0[1] - 0.064), add(gS, [0.004 * h, 0.006 * h]), 0.018 * h), f: frame});   // the stem up to the bar
	back.push({d: barD(add(gS, [-0.018 * h, -0.004 * h]), add(gS, [0.022 * h, 0.0]), 0.02 * h), f: frame});        // the handlebar end
	back.push({d: barD(Cc(-0.26, 0.04), Cc(0.3, 0.04), 0.02 * h), f: frame});
	if (kind === 'beast98') {   // a jogging-stroller frame under a hi-vis cover
		back.push({d: cl([[-0.27, 0.05], [-0.31, 0.24], [-0.22, 0.38], [0.02, 0.42], [0.2, 0.36], [0.27, 0.2], [0.26, 0.05]]), f: '#565a22'});
		back.push({d: polyD([Cc(-0.3, 0.2), Cc(0.27, 0.2), Cc(0.27, 0.23), Cc(-0.3, 0.23)]), f: '#a3a497'});
		back.push({d: cl([[0.06, 0.05], [0.08, -0.07], [0.22, -0.08], [0.26, 0.05]]), f: '#1d1f1b'});
		back.push({d: barD(Cc(0.26, 0.05), Cc(0.4, -0.1), 0.014 * h), f: frame});
		back.push({d: circD(Cc(0.42, -0.115), 0.035 * h), f: frame});   // the small front wheel of the stroller
	} else {
		const winter = kind === 'winter', bag = winter ? '#2a2e22' : '#8a4a22', bag2 = winter ? '#33372a' : '#9a5426';
		back.push({d: cl([[-0.27, 0.04], [-0.31, 0.2], [-0.26, 0.33], [-0.06, 0.37], [0.18, 0.35], [0.31, 0.27], [0.32, 0.04]]), f: bag});
		back.push({d: cl([[-0.22, 0.33], [-0.25, 0.44], [-0.14, 0.47], [0.08, 0.46], [0.13, 0.4], [0.08, 0.33]]), f: winter ? '#262a20' : '#2c3a52'});   // a blue roll
		back.push({d: cl([[0.0, 0.36], [0.0, 0.43], [0.1, 0.46], [0.28, 0.42], [0.3, 0.34]]), f: winter ? '#30342a' : '#33402a'});   // a green roll
		back.push({d: cl([[0.26, 0.06], [0.36, 0.08], [0.38, 0.26], [0.29, 0.3]]), f: bag2});   // the front bag (hi-vis vest strapped on)
		back.push({d: polyD([Cc(-0.3, 0.17), Cc(0.33, 0.17), Cc(0.33, 0.19), Cc(-0.3, 0.19)]), f: winter ? '#1e2018' : '#5a3218'});
		if (winter) { back.push({d: cl([[-0.24, 0.44], [-0.2, 0.475], [0.0, 0.48], [0.14, 0.475], [0.28, 0.43], [0.31, 0.36], [0.2, 0.42], [0.0, 0.445], [-0.16, 0.44]]), f: '#b8c2c8'});
			back.push({d: cl([[-0.29, 0.3], [-0.31, 0.21], [-0.27, 0.2], [-0.27, 0.29]]), f: '#a8b2b8'}); }
	}
	wheel(S(A), R, front, '#121216');
	front.push({d: barD(Cc(-0.12, 0.08), Cc(0.0, 0.0), 0.014 * h), f: frame});
	void t;
	return {back, front};
};
/** the sled (a pulk): nose at `nose` (body units, on the ground), length 1.0 behind it, traces to the hip belt at `belt` */
const sledShapes = (cx: Ctx, nose: V, belt: V, dist: number): {sled: Sh[]; traces: Sh[]} => {
	const {S, h} = cx, bump = 0.6 * Math.max(0, Math.sin(dist * 5.3)) ** 6, a = bump * 1.2, Cc = (u: number, v: number) => S(add(nose, rotV([u, v], a)));
	const red = '#661d1c', redHi = '#8a3029', hull = '#2e0f10', sled: Sh[] = [], traces: Sh[] = [];
	sled.push({d: closedD([[-0.9, 0.0], [-0.925, 0.08], [-0.9, 0.125], [-0.4, 0.13], [-0.06, 0.125], [0.03, 0.105], [0.075, 0.06], [0.05, 0.012], [-0.03, 0.0], [-0.5, -0.004]].map(([u, v]) => Cc(u, v))), f: hull});
	sled.push({d: closedD([[-0.87, 0.115], [-0.86, 0.19], [-0.74, 0.225], [-0.3, 0.222], [-0.12, 0.19], [-0.07, 0.12]].map(([u, v]) => Cc(u, v))), f: red});
	sled.push({d: closedD([[-0.82, 0.2], [-0.7, 0.218], [-0.3, 0.216], [-0.15, 0.195], [-0.3, 0.205], [-0.7, 0.206]].map(([u, v]) => Cc(u, v))), f: redHi});
	for (const u of [-0.72, -0.48, -0.24]) sled.push({d: barD(Cc(u, 0.12), Cc(u + 0.015, 0.222), Math.max(1, 0.01 * h)), f: hull});
	const n0 = Cc(0.03, 0.08), bS = S(belt), mid: V = [(n0[0] + bS[0]) / 2, (n0[1] + bS[1]) / 2 + 0.03 * h];
	traces.push({d: ropeD(n0, mid, bS, Math.max(1.4, 0.008 * h)), f: '#1e1e24'});
	traces.push({d: ropeD(add(n0, [0, -0.01 * h]), add(mid, [0.02 * h, -0.006 * h]), add(bS, [0, 0.004 * h]), Math.max(1.2, 0.006 * h)), f: '#2a2a32'});
	return {sled, traces};
};

/* ---------- the Bactrian camel: pace gait (the two legs of a side move together), feet planted while in stance ---------- */
export const CAMEL_STRIDE = 1.02;
const camelShapes = (cx: Ctx, cph: number, t: number, walking: boolean): {far: Sh[]; body: Sh[]; near: Sh[]; nose: V} => {
	const {S, h} = cx, far: Sh[] = [], body: Sh[] = [], near: Sh[] = [], col = '#0e0d10', farCol = mixHex(col, '#3a3a44', 0.12), hair = '#29231c', load = '#3b3226', loadHi = '#4c4130';
	const bob = walking ? 0.014 * Math.cos(4 * Math.PI * cph) : 0.004 * Math.sin(t * 1.3), pitch = walking ? 1.1 * Math.sin(2 * Math.PI * cph) : 0;
	const Bd = (u: number, v: number): V => rotAbout([u, v + bob], [0, 0.95], pitch);
	const P = (pts: number[][]) => pts.map(([u, v]) => S(Bd(u, v)));
	// legs: [rootX, rootY, upper, lower, bend, phaseOffset, isFore]
	// legs: [rootX, rootY (elbow / stifle, inside the body), upper, lower, bend, phase offset, fore?]; pace: a side's two legs move together
	const LEGS: [number, number, number, number, number, number, boolean][] = [[0.36, 0.7, 0.33, 0.35, 1, 0.5, true], [-0.47, 0.68, 0.31, 0.37, -1, 0.56, false], [0.36, 0.7, 0.33, 0.35, 1, 0.0, true], [-0.47, 0.68, 0.31, 0.37, -1, 0.06, false]];
	const beta = 0.62, L = CAMEL_STRIDE;
	LEGS.forEach(([rx, ry, l1, l2, bend, off, fore], i) => {
		const isNear = i >= 2, root = Bd(rx, ry), ps0 = fr(cph + off);
		let foot: V;
		if (!walking) foot = [rx + (isNear ? 0.04 : -0.04), 0.03];
		else if (ps0 < beta) foot = [rx + L * beta * (0.5 - ps0 / beta), 0.03];
		else { const q = (ps0 - beta) / (1 - beta), e = q * q * (3 - 2 * q); foot = [rx + L * beta * (-0.5 + e), 0.03 + 0.085 * Math.sin(Math.PI * q) * (fore ? 1 : 0.85)]; }
		const [kn, ft] = ik2(root, foot, l1, l2, bend), list = isNear ? near : far, c = isNear ? col : farCol;
		// the upper leg (forearm / gaskin) is muscular, the knee knobbly, the cannon slim, a broad padded foot
		const top = Bd(rx + (fore ? 0.0 : 0.04), ry + 0.16), pts = [top, mixV(top, root, 0.5), ...along(root, kn, 4), ...along(kn, ft, 4).slice(1)].map(S);
		const w = pts.map((_, j) => { const u = j / (pts.length - 1); return (u < 0.2 ? lerp(0.085, 0.06, u / 0.2) : u < 0.52 ? lerp(0.055, 0.032, (u - 0.2) / 0.32) : u < 0.6 ? 0.036 : u < 0.92 ? lerp(0.026, 0.022, (u - 0.6) / 0.32) : 0.028) * h; });
		list.push({d: chainD(pts, w, w), f: c});
		list.push({d: circD(S(kn), 0.034 * h), f: c});
		const fs: V = [ft[0], ft[1] - 0.012];
		list.push({d: closedD([[-0.055, -0.018], [0.075, -0.018], [0.09, 0.0], [0.045, 0.022], [-0.03, 0.026], [-0.06, 0.004]].map(([u, v]) => S(add(fs, [u, v])))), f: c});
		if (fore) { const a0 = add(root, [0.02, 0.06]), a1 = mixV(root, kn, 0.6);   // the shaggy coat on the upper foreleg
			const pts2: V[] = []; for (let j = 0; j <= 8; j++) { const u = j / 8, p = mixV(a0, a1, u); pts2.push(S(add(p, [-(0.05 + 0.018 * (j % 2)) * Math.sin(Math.PI * clamp(u * 1.1)), 0]))); }
			for (let j = 8; j >= 0; j--) { const u = j / 8, p = mixV(a0, a1, u); pts2.push(S(add(p, [0.03, 0]))); }
			list.push({d: closedD(pts2), f: isNear ? hair : mixHex(hair, '#3a3a44', 0.12)}); }
	});
	// body barrel + two humps + tail
	body.push({d: closedD(P([[-0.72, 0.9], [-0.7, 0.99], [-0.55, 1.03], [-0.45, 1.17], [-0.33, 1.25], [-0.21, 1.15], [-0.09, 1.05], [0.04, 1.17], [0.17, 1.27], [0.3, 1.16], [0.42, 1.05], [0.56, 0.97], [0.62, 0.83], [0.42, 0.66], [0.0, 0.62], [-0.46, 0.66], [-0.68, 0.75]])), f: col});
	for (const [hx, hy] of [[-0.33, 1.235], [0.17, 1.255]]) { const tuft: V[] = []; for (let j = 0; j <= 12; j++) { const a = Math.PI * (0.1 + 0.8 * j / 12), r = (j % 2 ? 0.07 : 0.082); tuft.push([hx + Math.cos(a) * r * 1.15, hy - 0.052 + Math.sin(a) * r]); }
		body.push({d: closedD(P(tuft)), f: hair}); }
	const tw = walking ? Math.sin(2 * Math.PI * cph + 1) * 0.02 : Math.sin(t * 1.7) * 0.01;
	body.push({d: chainD(P([[-0.7, 0.98], [-0.75, 0.88], [-0.76 + tw, 0.76], [-0.75 + tw * 1.5, 0.67]]), [0.018 * h, 0.012 * h, 0.011 * h, 0.02 * h], [0.014 * h, 0.011 * h, 0.011 * h, 0.02 * h]), f: hair});
	// neck: long and low, a U from the withers down and forward, then up to the head; it nods with each step
	const nod = walking ? 0.022 * Math.sin(4 * Math.PI * cph + 0.8) : 0.01 * Math.sin(t * 0.9);
	const neck: V[] = [[0.48, 0.96], [0.68, 0.86], [0.88, 0.87 + nod * 0.4], [1.04, 1.0 + nod * 0.8], [1.12, 1.16 + nod]];
	body.push({d: chainD(P(neck), [0.12 * h, 0.08 * h, 0.06 * h, 0.05 * h, 0.046 * h], [0.11 * h, 0.075 * h, 0.06 * h, 0.05 * h, 0.044 * h]), f: col});
	{ const m: V[] = []; for (let j = 0; j <= 12; j++) { const u = j / 12, p = mixV([0.56, 0.84], [1.02, 0.98 + nod * 0.8], u); m.push([p[0] + (j % 2 ? 0.012 : -0.012), p[1] - (0.06 + 0.04 * (j % 2)) * Math.sin(Math.PI * clamp(u * 1.05))]); }
		for (let j = 12; j >= 0; j--) { const u = j / 12, p = mixV([0.56, 0.84], [1.02, 0.98 + nod * 0.8], u); m.push([p[0], p[1] + 0.03]); }
		body.push({d: closedD(P(m)), f: hair}); }
	const hd = (u: number, v: number): V => [u, v + nod];
	body.push({d: closedD(P([hd(1.08, 1.17), hd(1.1, 1.23), hd(1.16, 1.255), hd(1.25, 1.245), hd(1.35, 1.2), hd(1.42, 1.16), hd(1.43, 1.12), hd(1.41, 1.095), hd(1.33, 1.085), hd(1.2, 1.1), hd(1.1, 1.12)])), f: col});
	body.push({d: closedD(P([hd(1.11, 1.235), hd(1.1, 1.29), hd(1.125, 1.295), hd(1.14, 1.24)])), f: col});   // ear
	body.push({d: closedD(P([hd(1.06, 1.2), hd(1.09, 1.27), hd(1.17, 1.275), hd(1.16, 1.235)])), f: hair});   // forelock
	// the load: a pack saddle between the humps, bags on the near side, a bedroll on top
	body.push({d: closedD(P([[-0.26, 1.1], [-0.27, 0.9], [-0.22, 0.84], [-0.1, 0.83], [-0.08, 0.95], [-0.1, 1.12]])), f: load});
	body.push({d: closedD(P([[-0.1, 1.1], [-0.08, 0.92], [-0.02, 0.86], [0.09, 0.87], [0.11, 0.98], [0.08, 1.1]])), f: mixHex(load, '#000000', 0.15)});
	body.push({d: closedD(P([[-0.21, 1.11], [-0.22, 1.18], [-0.08, 1.2], [0.05, 1.18], [0.06, 1.1]])), f: loadHi});
	body.push({d: polyD(P([[-0.27, 1.0], [0.11, 1.0], [0.11, 1.018], [-0.27, 1.018]])), f: loadHi});
	// halter
	body.push({d: chainD(P([hd(1.14, 1.25), hd(1.2, 1.15), hd(1.3, 1.095)]), [0.005 * h, 0.005 * h, 0.005 * h], [0.005 * h, 0.005 * h, 0.005 * h]), f: '#4c4130'});
	body.push({d: chainD(P([hd(1.24, 1.21), hd(1.39, 1.165)]), [0.0045 * h, 0.0045 * h], [0.0045 * h, 0.0045 * h]), f: '#4c4130'});
	return {far, body, near, nose: Bd(1.31, 1.09 + nod)};

};

/* ============================================================================================================
   ACTIONS → pose + layer stack (+ water fx)
   ============================================================================================================ */
type Built = {layers: Layer[]; fx: React.ReactNode[]; water?: number; behind?: Layer[]};
const stackOf = (P: Parts, extra: {behind?: Sh[][]; afterFarArm?: Sh[]; afterTorso?: Sh[]; afterNearArm?: Sh[]; beforeNearArm?: Sh[]} = {}): Layer[] => {
	const L: Layer[] = [];
	for (const b of extra.behind ?? []) L.push({sh: b, rim: 1});
	L.push({sh: P.farArm, rim: 0.8});
	if (extra.afterFarArm) L.push({sh: extra.afterFarArm, rim: 0.9});
	if (P.pack.length) L.push({sh: P.pack, rim: 1});
	L.push({sh: P.farLeg, rim: 0.8}, {sh: P.nearLeg, rim: 1}, {sh: P.torso, rim: 1});
	if (extra.afterTorso) L.push({sh: extra.afterTorso, rim: 1});
	if (P.gear.length) L.push({sh: P.gear, rim: 0.7});
	L.push({sh: P.head, rim: 1});
	if (extra.beforeNearArm) L.push({sh: extra.beforeNearArm, rim: 1});
	L.push({sh: P.nearArm, rim: 1});
	if (extra.afterNearArm) L.push({sh: extra.afterNearArm, rim: 1});
	return L;
};
/** breathing idle on a standing pose: phase = breaths */
const breathe = (p: Pose, ph: number, amp = 1): Pose => {
	const b = Math.sin(ph * 2 * Math.PI), sway = 0.006 * Math.sin(ph * Math.PI);
	const o = shiftP(p, sway, 0);
	for (const n of UPPER) o[n] = [o[n][0], o[n][1] + 0.0035 * amp * (b + 1) * (n === 'Spine1' ? 0.6 : 1)];
	return nodP(o, -1.2 * amp * b);
};

/* ---------- the swim: front crawl at the water line ("floatimming" — the vest keeps his back and head high) ---------- */
export const SWIM_STRIDE = 0.42;
// keys: [u, x, y] in swim space (h units; x forward, y up, the water line y = 0 at his chest x = 0); u = 0 at the near hand's entry
const SW_E = [[0.0, 0.2, 0.06], [0.1, 0.25, -0.02], [0.25, 0.25, -0.09], [0.4, 0.08, -0.13], [0.5, -0.06, -0.1], [0.56, -0.13, -0.02], [0.63, -0.11, 0.12], [0.73, -0.02, 0.21], [0.83, 0.1, 0.21], [0.92, 0.18, 0.13]];
const SW_H = [[0.0, 0.37, -0.01], [0.1, 0.46, -0.07], [0.25, 0.4, -0.21], [0.4, 0.12, -0.28], [0.5, -0.18, -0.19], [0.56, -0.3, -0.05], [0.63, -0.28, 0.06], [0.73, -0.15, 0.12], [0.83, 0.06, 0.15], [0.92, 0.25, 0.09]];
const swimArm = (u: number, S0: V): {E: V; W: V; H: V; dir: V} => { const [ex, ey] = loopKeys(SW_E, u), [hx, hy] = loopKeys(SW_H, u);
	const E = add(S0, mul(nrm(sub([ex, ey], S0)), BL.upper)), d = nrm(sub([hx, hy], E)); return {E, W: add(E, mul(d, BL.fore)), H: add(E, mul(d, BL.fore + BL.hand)), dir: d}; };
const swimBreath = (u: number) => ss(0.46, 0.6, fr(u)) * (1 - ss(0.76, 0.9, fr(u)));
const swimPose = (ph: number): {pose: Pose; dirL: V; dirR: V; breath: number} => {
	const u = fr(ph), roll = Math.cos(2 * Math.PI * (u - 0.72)), br = swimBreath(u), pitch = 0.9 * Math.sin(4 * Math.PI * u);
	const Hp: V = [-0.3, -0.125], Sp: V = [-0.15, -0.078 + 0.004 * roll], Nk: V = [0.058, -0.03 + 0.006 * roll];
	const th = 14 + 70 * br, Hd = add(Nk, add(mul(dirA(th), BL.head), [0.004 * br, 0.004 + 0.05 * br])), Tp = add(Hd, mul(dirA(th), BL.top));
	const SL: V = [Nk[0] - 0.022, Nk[1] - 0.004 + 0.02 * roll], SR: V = [Nk[0] - 0.026, Nk[1] - 0.004 - 0.02 * roll];
	const aL = swimArm(u, SL), aR = swimArm(u + 0.5, SR);
	const back = nrm(sub(Hp, Sp)), kick = (side: number) => { const k = Math.sin(6 * Math.PI * u + side * Math.PI), up = add(Hp, mul(back, 0.066));
		const kn = add(up, mul(rotV(back, 4 + 6 * k), BL.thigh)), an = add(kn, mul(rotV(back, -2 + 14 * k + 8), BL.shin)), to = add(an, mul(rotV(back, 14 * k + 22), BL.foot));
		return [up, kn, an, to]; };
	const [LUp, LKnee, LAnk, LToe] = kick(0), [RUp, RKnee, RAnk, RToe] = kick(1);
	let pose: Pose = {Hips: Hp, Spine1: Sp, Neck1: Nk, Head: Hd, Top: Tp, LSh: SL, LElb: aL.E, LHand: aL.W, RSh: SR, RElb: aR.E, RHand: aR.W, LUp, LKnee, LAnk, LToe, RUp, RKnee, RAnk, RToe};
	pose = Object.fromEntries(Object.entries(pose).map(([k, v]) => [k, rotV(v, pitch)])) as Pose;
	return {pose, dirL: rotV(aL.dir, pitch), dirR: rotV(aR.dir, pitch), breath: br};
};
/** float: resting on the life vest, reclined, legs dangling forward, hands sculling at the surface */
const floatPose = (ph: number, t: number): Pose => {
	const u = fr(ph), sc = Math.sin(2 * Math.PI * u), b = 0.008 * Math.sin(t * 1.1), look = 4 * Math.sin(t * 0.45);
	const Hp: V = [0.06, -0.16 + b], Sp: V = [0.0, -0.02 + b], Nk: V = [-0.03, 0.04 + b];
	const th = 98 + look, Hd = add(Nk, mul(dirA(th), BL.head)), Tp = add(Hd, mul(dirA(th), BL.top));
	const SL: V = [Nk[0] + 0.004, Nk[1] - 0.012], SR: V = [Nk[0] - 0.004, Nk[1] - 0.008];
	const lg = (side: number) => { const k = Math.sin(2 * Math.PI * u * 0.5 + side * 2.2), up = add(Hp, [0.0, -0.06]); const kn = add(up, mul(dirA(-38 + 5 * k), BL.thigh)), an = add(kn, mul(dirA(-72 + 6 * k), BL.shin)); return [up, kn, an, add(an, mul(dirA(-20 + 8 * k), BL.foot))]; };
	const [LUp, LKnee, LAnk, LToe] = lg(0), [RUp, RKnee, RAnk, RToe] = lg(1);
	let p: Pose = {Hips: Hp, Spine1: Sp, Neck1: Nk, Head: Hd, Top: Tp, LSh: SL, RSh: SR, LUp, LKnee, LAnk, LToe, RUp, RKnee, RAnk, RToe, LElb: SL, LHand: SL, RElb: SR, RHand: SR};
	p = armIK(p, 'L', [0.21 + 0.04 * sc, -0.022 - 0.006 * Math.cos(2 * Math.PI * u)], -1);   // forearms resting on the surface, sculling small figure-eights
	p = armIK(p, 'R', [0.15 - 0.04 * sc, -0.03 + 0.005 * Math.cos(2 * Math.PI * u)], -1);
	return p;
};

/* ---------- water fx (local frame; body units → px) ---------- */
type FxCfg = {foam: string; hi: string};
const drop = (key: string, c: V, r: number, f: string, o: number, vel?: V) => { if (!vel) return <circle key={key} cx={f1(c[0])} cy={f1(c[1])} r={f1(Math.max(0.6, r))} fill={f} opacity={clamp(o)} />;
	const a = Math.atan2(-vel[1], vel[0]) / DEG, l = Math.max(1, Math.min(3.2, 1 + len(vel) * 1.6));
	return <ellipse key={key} cx={f1(c[0])} cy={f1(c[1])} rx={f1(Math.max(0.7, r * l))} ry={f1(Math.max(0.5, r * 0.75))} transform={`rotate(${f1(a)} ${f1(c[0])} ${f1(c[1])})`} fill={f} opacity={clamp(o)} />; };
const G_ACC = 5.4;   // gravity in body units / s² (9.8 m/s² for a 1.8 m man)
const swimFx = (cx: Ctx, ph: number, cyc: number, fc: FxCfg, wx: (p: V) => V): React.ReactNode[] => {
	const {S, h} = cx, out: React.ReactNode[] = [], st = SWIM_STRIDE, k0 = Math.floor(ph);
	const P = (p: V) => S(wx(p));
	// kick foam: churned at six beats a cycle, left behind (world-fixed) and fading — the wake
	for (let e = Math.floor(ph * 6) - 9; e <= Math.floor(ph * 6); e++) {
		const a = ph - e / 6; if (a < 0 || a > 1.6) continue;
		for (let j = 0; j < 4; j++) { const sd = e * 7 + j, x = -0.84 - 0.1 * rnd(sd, 1) - a * st, y = 0.004 + 0.012 * rnd(sd, 2) * (1 - a / 1.6), r = (0.012 + 0.014 * rnd(sd, 3)) * (1 + a * 0.8);
			out.push(<ellipse key={`kf${e}_${j}`} cx={f1(P([x, y])[0])} cy={f1(P([x, y])[1])} rx={f1(r * h * 1.6)} ry={f1(r * h * 0.55)} fill={fc.foam} opacity={clamp(0.8 * (1 - a / 1.6) * (0.6 + 0.4 * rnd(sd, 4)))} />); }
		const a2 = a * cyc; if (a2 < 0.35) for (let j = 0; j < 4; j++) { const sd = e * 13 + j, vx = -0.25 - 0.3 * rnd(sd, 5), vy = 0.35 + 0.35 * rnd(sd, 6), x = -0.86 - 0.06 * rnd(sd, 7) + vx * a2 - a * st, y = vy * a2 - 0.5 * G_ACC * a2 * a2;
			if (y > -0.003) out.push(drop(`ks${e}_${j}`, P([x, y]), (0.003 + 0.003 * rnd(sd, 8)) * h, fc.foam, 0.9 - a2 * 2, [vx, vy - G_ACC * a2])); }
	}
	for (let e = Math.floor(ph * 4) - 6; e <= Math.floor(ph * 4); e++) { const a = ph - e / 4; if (a < 0 || a > 1.5) continue;
		for (let j = 0; j < 3; j++) { const sd = e * 5 + j + 300, x = -0.3 - 0.22 * rnd(sd, 1) - a * st * 0.9, r = (0.01 + 0.012 * rnd(sd, 2)) * (1 + a), p0 = P([x, 0.002]);
			out.push(<ellipse key={`bw${e}_${j}`} cx={f1(p0[0])} cy={f1(p0[1])} rx={f1(r * h * 1.8)} ry={f1(r * h * 0.32)} fill={fc.foam} opacity={clamp(0.5 * (1 - a / 1.5) * (0.5 + 0.5 * rnd(sd, 3)))} />); } }
	// the body breaking the surface: a pale seam along the waterline, the bow wave ahead of the head
	{ for (const [x0, x1, sg] of [[-0.26, -0.17, 0], [0.02, 0.1, 1]]) { const pts: V[] = []; for (let i = 0; i <= 4; i++) { const x = lerp(x0, x1, i / 4); pts.push(P([x, 0.002 + 0.006 * Math.sin(Math.PI * i / 4) + 0.002 * Math.sin(ph * 7 + i + sg * 2)])); }
			out.push(<path key={`seam${sg}`} d={'M' + pts.map(ps).join(' L')} stroke={fc.foam} strokeWidth={f1(Math.max(1, 0.004 * h))} strokeLinecap="round" fill="none" opacity={0.6} />); }
		const bw = 0.012 + 0.008 * Math.sin(2 * Math.PI * ph * 2) ** 2 + 0.01 * swimBreath(ph), a = P([0.1, 0]), m = P([0.19, bw]), b = P([0.31, 0.0]);
		out.push(<path key="bow" d={`M${ps(a)} Q${ps(m)} ${ps(b)} Q${ps(P([0.2, -0.004]))} ${ps(a)} Z`} fill={fc.hi} opacity={0.45} />);
		out.push(<path key="bowc" d={`M${ps(a)} Q${ps(m)} ${ps(b)}`} stroke={fc.foam} strokeWidth={f1(Math.max(1, 0.004 * h))} strokeLinecap="round" fill="none" opacity={0.85} />); }
	// each hand: the splash on entry (a crown + droplets), the foam patch it leaves, and drips off the recovering arm
	for (const arm of [0, 0.5]) for (let k = k0 - 2; k <= k0 + 1; k++) {
		const te = k + arm, a = ph - te; if (a < 0) continue;
		const sec = a * cyc, ex = loopKeys(SW_H, 0)[0], o0: V = [ex - a * st, 0];
		if (a < 1.4) for (let j = 0; j < 5; j++) { const g = Math.min(1, a * 2.5), q: V = [o0[0] + (rnd(k * 7 + j, arm * 3 + 1) - 0.5) * 0.12 * (0.4 + g), 0.002], pq = P(q);
			out.push(<ellipse key={`fp${k}_${arm}_${j}`} cx={f1(pq[0])} cy={f1(pq[1])} rx={f1((0.012 + 0.02 * rnd(k + j, arm + 5)) * (0.6 + g) * h)} ry={f1(0.0035 * (0.7 + g) * h)} fill={fc.foam} opacity={clamp(0.75 * (1 - a / 1.4))} />); }
		if (sec < 0.7) {
			if (sec < 0.28) { const g = Math.sin(Math.PI * sec / 0.28);   // the crown
				for (let j = 0; j < 7; j++) { const ang = lerp(35, 150, j / 6) + 12 * (rnd(k * 11 + j, arm * 10) - 0.5), l = (0.025 + 0.04 * rnd(k * 5 + j, 3 + arm)) * g, base = add(P(o0), [(j - 3) * 0.004 * h, 0]), tip = add(base, [Math.cos(ang * DEG) * l * h, -Math.sin(ang * DEG) * l * h]), w0 = 0.0022 * h;
					out.push(<path key={`cr${k}_${arm}_${j}`} d={`M${ps(add(base, [-w0, 0]))} Q${ps(mixV(base, tip, 0.5))} ${ps(tip)} Q${ps(mixV(base, tip, 0.5))} ${ps(add(base, [w0, 0]))} Z`} fill={fc.foam} opacity={0.85 * g} />); } }
			for (let j = 0; j < 14; j++) { const sd = k * 31 + j + arm * 100, vx = -0.35 + 0.95 * rnd(sd, 1), vy = 0.45 + 0.85 * rnd(sd, 2), x = o0[0] + vx * sec + 0.03 * (rnd(sd, 3) - 0.5), y = vy * sec - 0.5 * G_ACC * sec * sec;
				if (y > -0.002) out.push(drop(`sp${k}_${arm}_${j}`, P([x, y]), (0.0028 + 0.004 * rnd(sd, 4)) * h, fc.foam, 0.95 - sec, [vx, vy - G_ACC * sec])); }
		}
		// drips: shaken off the hand from exit through the recovery
		for (let j = 0; j < 9; j++) { const ts = te - 1 + 0.6 + 0.035 * j, ad = ph - ts; if (ad < 0 || ad * cyc > 0.6) continue;
			const sp = swimArm(fr(ts - arm), [0.04, -0.02]).H, sec2 = ad * cyc; if (sp[1] < 0.01) continue;
			const y = sp[1] - 0.5 * G_ACC * sec2 * sec2, x = sp[0] + 0.2 * sec2 - ad * st;
			if (y > 0) out.push(drop(`dr${k}_${arm}_${j}`, P([x, y]), (0.0026 + 0.002 * rnd(j, k)) * h, fc.foam, 0.85, [0.2, -G_ACC * sec2]));
			else if (y > -0.03) out.push(<ellipse key={`dri${k}_${arm}_${j}`} cx={f1(P([x, 0])[0])} cy={f1(P([x, 0])[1])} rx={f1(0.012 * h)} ry={f1(0.003 * h)} fill="none" stroke={fc.foam} strokeWidth={1} opacity={0.6} />); }
	}
	return out;
};
/** ripple rings on the surface around a point (perspective ellipses), spawned `rate` per cycle */
const ripples = (cx: Ctx, key: string, c: V, ph: number, rate: number, life: number, r0: number, r1: number, col: string, op = 0.6, flat = 0.18): React.ReactNode[] => {
	const out: React.ReactNode[] = [], {S, h} = cx;
	for (let e = Math.floor(ph * rate) - Math.ceil(life * rate); e <= Math.floor(ph * rate); e++) { const a = (ph - e / rate) / life; if (a < 0 || a > 1) continue;
		const r = lerp(r0, r1, Math.sqrt(a)), p = S(c); out.push(<ellipse key={`${key}${e}`} cx={f1(p[0])} cy={f1(p[1])} rx={f1(r * h)} ry={f1(r * h * flat)} fill="none" stroke={col} strokeWidth={f1(Math.max(0.8, 0.004 * h * (1 - a)))} opacity={op * (1 - a)} />); }
	return out;
};

/* ---------- build an action ---------- */
type BuildIn = {attire: Attire; action: Action; phase: number; t: number; cx: Ctx; X: number; Y: number; h: number; cart?: CartKind | false; foam: string; waterHi: string; depth: number; frost?: number; uid: string};
const CART_OF: Record<Attire, CartKind> = {start1998: 'beast98', jungle: 'orange', ice: 'winter', siberia: 'winter', gobi: 'orange', swim: 'orange', home2026: 'orange'};
const build = (b: BuildIn): Built => {
	const {action, phase: ph, t, cx} = b, lk = LOOKS[b.attire], fx: React.ReactNode[] = [];
	const fo = (o: Partial<FigOpt>): FigOpt => ({t, frost: b.frost, ...o});
	switch (action) {
		case 'walk': {
			const p = leanP(gaitAt(G_WALK, ph), lk.pack ? 6 : 3), mach = b.attire === 'jungle';
			const P = figure(cx, p, lk, fo({handL: mach ? 'fist' : 'open'}));
			if (b.attire === 'jungle') P.nearArm.push(...macheteSh(cx, p, 'L', p.LHand, 20));
			return {layers: stackOf(P), fx};
		}
		case 'pushCart': {
			const g = gaitAt(G_PUSH, ph); let p = leanP(g, 8 + (lk.pack ? 3 : 0));
			const grip: V = [p.Hips[0] + 0.27, 0.585 + 0.55 * (p.Hips[1] - 0.6)];
			p = armIK(p, 'L', grip, -1); p = armIK(p, 'R', add(grip, [-0.006, 0.006]), -1);
			const kind = b.cart === false ? null : (b.cart ?? CART_OF[b.attire]);
			const P = figure(cx, p, lk, fo({handL: 'fist', handR: 'fist'}));
			if (!kind) return {layers: stackOf(P), fx};
			const c = cartShapes(cx, kind, grip, ph * G_PUSH.stride, t);
			return {layers: [{sh: c.back, rim: 1}, ...stackOf(P, {afterNearArm: c.front})], fx};
		}
		case 'haulSled': {
			const u = fr(ph), g = gaitAt(G_HAUL, ph); let p = leanP(g, 19 + 2.5 * Math.sin(4 * Math.PI * u - 0.6) ** 2);
			const sf = spineAt(p), gl = sf(0.15, -0.088), gr = sf(0.16, -0.084);
			p = armIK(p, 'L', gl, -1); p = armIK(p, 'R', gr, -1);
			const P = figure(cx, p, lk, fo({handL: 'fist', handR: 'fist'}));
			const belt = sf(0.005, 0.085), sl = sledShapes(cx, [-0.95, 0], belt, ph * G_HAUL.stride);   // the sled keeps a steady speed (no root-lock wobble)
			return {layers: [{sh: sl.sled, rim: 1}, {sh: sl.traces, rim: 0.6}, ...stackOf(P)], fx};
		}
		case 'leadCamel': {
			const u = fr(ph); let p = leanP(gaitAt(G_WALK, ph), 3);
			p = armFK(p, 'L', -24 + 4 * Math.sin(2 * Math.PI * u + 0.4), 16);
			const P = figure(cx, p, lk, fo({handL: 'fist'}));
			const cph = ph * G_WALK.stride / CAMEL_STRIDE, camX = -1.86, cam = camelShapes(ctxShift(cx, camX), cph, t, true);
			const hand = add(p.LHand, mul(nrm(sub(p.LHand, p.LElb)), 0.03)), nose = add(cam.nose, [camX, 0]), sag = 0.09 + 0.025 * Math.sin(2 * Math.PI * u);
			const rope = ropeD(cx.S(hand), cx.S([(hand[0] + nose[0]) / 2, Math.min(hand[1], nose[1]) - sag]), cx.S(nose), Math.max(1.3, 0.0065 * cx.h));
			const lay = stackOf(P, {beforeNearArm: [{d: rope, f: '#2a241c'}]});
			return {layers: [{sh: cam.far, rim: 0.8}, {sh: cam.body, rim: 1}, {sh: cam.near, rim: 1}, ...lay], fx};
		}
		case 'wade': {
			const u = fr(ph), g = gaitAt(G_WADE, ph), K = loopKeys(WADE_KEYS, u), [a, e, bl, ln] = K;
			let p = leanP(g, ln); p = armFK(p, 'L', a, e); p = armFK(p, 'R', 42 + 10 * Math.sin(2 * Math.PI * u + 2), 38 + 8 * Math.sin(2 * Math.PI * u));
			const P = figure(cx, p, lk, fo({handL: 'fist', handR: 'open'}));
			const blade = macheteSh(cx, p, 'L', p.LHand, bl), tip = macheteTip(p, 'L', bl);
			P.nearArm.unshift(...blade.slice(0, 1)); P.nearArm.push(...blade.slice(1));
			const wy = b.depth;
			fx.push(...ripples(cx, 'wr', [p.Hips[0] + 0.02, wy], ph, 2, 1.1, 0.1, 0.42, b.foam, 0.55));
			fx.push(<path key="wbw" d={`M${ps(cx.S([p.Hips[0] - 0.09, wy]))} Q${ps(cx.S([p.Hips[0] + 0.05, wy + 0.012]))} ${ps(cx.S([p.Hips[0] + 0.16, wy]))}`} stroke={b.foam} strokeWidth={f1(Math.max(1, 0.006 * cx.h))} fill="none" opacity={0.7} />);
			// the strike: where the blade meets the water, a splash
			const ts = 0.5, sa = u - ts; if (sa > 0 && sa < 0.22 && tip[1] < wy + 0.08) { const sec = sa * KARL_CYCLE.wade.sec, o0: V = [tip[0], wy];
				for (let j = 0; j < 12; j++) { const vx = -0.2 + 0.6 * rnd(j, 3), vy = 0.4 + 0.6 * rnd(j, 4), x = o0[0] + vx * sec, y = wy + vy * sec - 0.5 * G_ACC * sec * sec; if (y > wy - 0.002) fx.push(drop(`ws${j}`, cx.S([x, y]), (0.004 + 0.005 * rnd(j, 6)) * cx.h, b.foam, 1 - sec * 1.5)); } }
			return {layers: stackOf(P), fx, water: cx.S([0, wy])[1]};
		}
		case 'swim': {
			const {pose, dirL, dirR} = swimPose(ph);
			const P = figure(cx, pose, lk, fo({handL: 'open', handR: 'open', dirL, dirR}));
			const L: Layer[] = [{sh: P.farLeg, rim: 0.6}, {sh: P.nearLeg, rim: 0.8}, {sh: P.farArm, rim: 0.85}, {sh: P.torso, rim: 1}, {sh: P.gear, rim: 0.9}, {sh: P.head, rim: 1}, {sh: P.nearArm, rim: 1}];
			fx.push(...swimFx(cx, ph, KARL_CYCLE.swim.sec, {foam: b.foam, hi: b.waterHi}, (q) => q));
			return {layers: L, fx, water: cx.S([0, 0])[1]};
		}
		case 'float': {
			const p = floatPose(ph, t), P = figure(cx, p, lk, fo({handL: 'open', handR: 'open'}));
			const L: Layer[] = [{sh: P.farLeg, rim: 0.6}, {sh: P.nearLeg, rim: 0.8}, {sh: P.farArm, rim: 0.85}, {sh: P.torso, rim: 1}, {sh: P.gear, rim: 0.9}, {sh: P.head, rim: 1}, {sh: P.nearArm, rim: 1}];
			fx.push(...ripples(cx, 'fr', [0.02, 0], ph, 0.7, 2.6, 0.1, 0.3, b.foam, 0.4, 0.14));
			fx.push(...ripples(cx, 'fh', [p.LHand[0] + 0.03, 0], ph, 2, 0.8, 0.015, 0.08, b.foam, 0.5, 0.22));
			{ const pts: V[] = []; for (let i = 0; i <= 8; i++) pts.push(cx.S([lerp(-0.1, 0.12, i / 8), 0.003 + 0.003 * Math.sin(t * 5 + i * 1.9)]));
				fx.push(<path key="fseam" d={'M' + pts.map(ps).join(' L')} stroke={b.foam} strokeWidth={f1(Math.max(1, 0.006 * cx.h))} strokeLinecap="round" fill="none" opacity={0.7} />); }
			return {layers: L, fx, water: cx.S([0, 0])[1]};
		}
		case 'hug': return buildHug(b, lk);
		case 'lookUp': case 'stand': default: {
			const look = action === 'lookUp';
			let p = fkPose({lean: look ? -3 : (lk.pack ? 4 : 1.5), neck: look ? -30 : 0, lt: 1.5, lk: 2, rt: -2.5, rk: 3, la: -4, le: 10, ra: 3, re: 14});
			p = breathe(p, ph);
			const P = figure(cx, p, lk, fo({handL: b.attire === 'jungle' ? 'fist' : 'open', handR: 'open'}));
			if (b.attire === 'jungle') P.nearArm.push(...macheteSh(cx, p, 'L', p.LHand, 25));
			return {layers: stackOf(P), fx};
		}
	}
};
const ctxShift = (cx: Ctx, dx: number): Ctx => ({S: (p: V) => cx.S([p[0] + dx, p[1]]), h: cx.h});
/** the spine frame of a pose (s up the spine from the hips, w toward the back) */
const spineAt = (p: Pose) => { const A = p.Hips, B = p.Spine1, C = p.Neck1, l1 = len(sub(B, A)), t1 = nrm(sub(B, A)), t2 = nrm(sub(C, B));
	return (s: number, w: number): V => { const q = s <= l1 ? add(A, mul(t1, s)) : add(B, mul(t2, s - l1)), t = nrm(mixV(t1, t2, ss(l1 - 0.05, l1 + 0.05, s))); return add(q, mul([-t[1], t[0]], w)); }; };
/** wade keys: [u, shoulder angle, elbow bend, blade angle (rel. forearm), lean] — raise slow, strike fast, follow through, recover */
const WADE_KEYS = [[0.0, 32, 26, 12, 9], [0.18, 78, 62, 0, 7], [0.34, 148, 98, -24, 3], [0.42, 152, 104, -30, 2], [0.47, 120, 40, -6, 9], [0.52, 58, 12, 6, 14], [0.58, 22, 14, 14, 13], [0.75, 22, 20, 14, 11]];
const machGeo = (p: Pose, s: 'L' | 'R', ang: number) => { const el = p[s + 'Elb'], wr = p[s + 'Hand'], d = rotV(nrm(sub(wr, el)), -ang), c = add(wr, mul(d, 0.028)), n: V = [-d[1], d[0]]; return {c, d, n}; };
const macheteTip = (p: Pose, s: 'L' | 'R', ang: number): V => { const {c, d, n} = machGeo(p, s, ang); void n; return add(c, mul(d, 0.33)); };
/** a machete in a fist: the grip in the hand, a long blade widening toward the tip (the edge catches the light) */
const macheteSh = (cx: Ctx, p: Pose, s: 'L' | 'R', _w: V, ang: number): Sh[] => {
	const {c, d, n} = machGeo(p, s, ang), M = (u: number, v: number) => cx.S(add(add(c, mul(d, u)), mul(n, v)));
	return [{d: polyD([M(-0.03, -0.01), M(0.04, -0.011), M(0.04, 0.011), M(-0.03, 0.01)]), f: '#1a1410'},
		{d: closedD([M(0.035, -0.009), M(0.2, -0.013), M(0.3, -0.02), M(0.335, -0.006), M(0.32, 0.012), M(0.2, 0.009), M(0.035, 0.009)]), f: '#3e4246'},
		{d: chainD([M(0.05, -0.009), M(0.2, -0.013), M(0.3, -0.018)], [0.0022 * cx.h, 0.0026 * cx.h, 0.002 * cx.h], [0.0022 * cx.h, 0.0026 * cx.h, 0.002 * cx.h]), f: '#9aa2a8'}];
};

/* ---------- hug: Karl and his mother, front embrace; she is ~0.88 of his height, her head against his chest ---------- */
const MUM_H = 0.88;
const buildHug = (b: BuildIn, lk: Look): Built => {
	const {phase: ph, cx, t} = b, u = fr(ph), sway = 1.4 * Math.sin(2 * Math.PI * u), br = Math.sin(2 * Math.PI * u * 2);
	let k = fkPose({lean: 9 + 0.6 * br, neck: 26, lt: 4, lk: 6, rt: -6, rk: 5, la: 0, le: 0, ra: 0, re: 0});
	k = Object.fromEntries(Object.entries(k).map(([n, v]) => [n, rotAbout(v, [0, 0], -sway * 0.5)])) as Pose;
	const xm = 0.255;   // her root, ahead of him
	// her pose in her own frame (facing him): stooped a little, head turned against his chest
	let m = fkPose({lean: 13 - 0.4 * br, neck: 14, lt: 6, lk: 7, rt: -3, rk: 4, la: 0, le: 0, ra: 0, re: 0});
	m = Object.fromEntries(Object.entries(m).map(([n, v]) => [n, rotAbout(v, [0, 0], sway * 0.5)])) as Pose;
	const toHer = (p: V): V => [(xm - p[0]) / MUM_H, p[1] / MUM_H];   // Karl-frame → her frame
	// his arms round her shoulders/back; hers round his waist
	const herBack = (y: number, d = 0.0): V => [xm + 0.05 + d, y];
	k = armIK(k, 'L', herBack(0.71, 0.012), -1); k = armIK(k, 'R', herBack(0.73, 0.02), -1);
	m = armIK(m, 'L', toHer([-0.05, 0.58]), -1); m = armIK(m, 'R', toHer([-0.035, 0.6]), -1);
	const KP = figure(cx, k, lk, {t, handL: 'open', handR: 'open', dirL: [0.2, -1], dirR: [0.2, -1]});
	const Xm = cx.S([xm, 0])[0], mcx: Ctx = {S: (p: V) => [Xm + p[0] * cx.h * MUM_H, cx.S([0, 0])[1] - p[1] * cx.h * MUM_H], h: cx.h * MUM_H};
	const MP = figure(mcx, m, LOOKS.mum, {t, handL: 'open', handR: 'open', dirL: [0.1, -1], dirR: [0.1, -1]});
	const M = (sh: Sh[], rim = 1): Layer => ({sh, rim, mirror: Xm});
	return {layers: [{sh: KP.farArm, rim: 0.7}, M(MP.farArm, 0.7), {sh: KP.farLeg, rim: 0.8}, M(MP.farLeg, 0.8), {sh: KP.nearLeg, rim: 1}, M(MP.nearLeg, 1),
		{sh: KP.torso, rim: 1}, {sh: KP.gear, rim: 0.7}, M(MP.torso, 1), M(MP.gear, 0.7), M(MP.head, 1), {sh: KP.head, rim: 1}, M(MP.nearArm, 1), {sh: KP.nearArm, rim: 1}], fx: []};
};

/* ============================================================================================================
   COMPONENTS
   ============================================================================================================ */
export type KarlProps = {
	x: number; y: number; h: number; attire: Attire; action: Action; phase: number;
	facing?: 1 | -1; rim?: string; lightDir?: LightDir;
	/** rim strength 0..1 (default 0.85) */ rimO?: number;
	/** figure colour */ col?: string;
	/** seconds, for secondary motion (scarf, ruff, idle); default phase × the cycle's seconds */ t?: number;
	/** override the cart (pushCart): a kind, or false for none */ cart?: CartKind | false;
	/** frost on beard / ruff, 0..1 (default from the attire) */ frost?: number;
	/** water: foam / highlight colours; submerged parts' opacity; wade depth (body units, default 0.56) */
	foam?: string; waterHi?: string; underO?: number; depth?: number;
	/** swim/float: tilt with the swell (degrees, + = nose up) */ pitch?: number;
};
export const Karl: React.FC<KarlProps> = (p) => {
	const uid = useUid(), facing = p.facing ?? 1, t = p.t ?? p.phase * KARL_CYCLE[p.action].sec;
	const cx = ctxAt(p.x, p.y, p.h), body = p.col ?? FIG;
	const B = build({attire: p.attire, action: p.action, phase: p.phase, t, cx, X: p.x, Y: p.y, h: p.h, cart: p.cart, foam: p.foam ?? '#f3eee6', waterHi: p.waterHi ?? '#c9d4da', depth: p.depth ?? 0.56, frost: p.frost, uid});
	const rc = rimCfg(p.h, p.rim ?? RIM, p.rimO ?? 0.85, p.lightDir ?? 'left', facing, body);
	const flip = facing === -1 ? `translate(${f1(2 * p.x)},0) scale(-1,1)` : '';
	const tilt = p.pitch ? `rotate(${f1(-(p.pitch) * facing)} ${f1(p.x)} ${f1(p.y)})` : '';
	const bx: [number, number, number, number] = [p.x - 3.4 * p.h, p.y - 1.7 * p.h, 6.8 * p.h, 2.4 * p.h];
	const content = <Layers layers={B.layers} uid={uid} rc={rc} box={bx} />;
	if (B.water === undefined) return <g transform={(tilt + ' ' + flip).trim() || undefined}>{content}{B.fx}</g>;
	const wy = B.water, uo = p.underO ?? 0.3;
	return <g transform={(tilt + ' ' + flip).trim() || undefined}>
		<defs><clipPath id={`${uid}up`}><rect x={-4000} y={-4000} width={12000} height={wy + 4000} /></clipPath>
			<clipPath id={`${uid}dn`}><rect x={-4000} y={wy} width={12000} height={8000} /></clipPath></defs>
		{uo > 0 && <g clipPath={`url(#${uid}dn)`} opacity={uo}><Layers layers={B.layers.map((L) => ({...L, rim: 0, sh: L.sh.map((s) => ({...s, f: body}))}))} uid={uid + 'u'} rc={rc} box={bx} /></g>}
		<g clipPath={`url(#${uid}up)`}>{content}</g>
		{B.fx}
	</g>;
};

/** his mother on her own: stand (breathing) or walk (slow, short steps); h = HER height (≈ 0.88 × his) */
export const Mum: React.FC<{x: number; y: number; h: number; action?: 'stand' | 'walk' | 'reach'; phase?: number; facing?: 1 | -1; rim?: string; lightDir?: LightDir; rimO?: number; col?: string}> =
	({x, y, h, action = 'stand', phase = 0, facing = 1, rim = RIM, lightDir = 'left', rimO = 0.85, col = FIG}) => {
	const uid = useUid(), cx = ctxAt(x, y, h);
	let p: Pose;
	if (action === 'walk') p = nodP(leanP(gaitAt(G_MUM, phase), 7), 8);
	else if (action === 'reach') p = breathe(fkPose({lean: 10, neck: 6, lt: 3, lk: 5, rt: -4, rk: 4, la: 62, le: 22, ra: 56, re: 26}), phase, 0.6);
	else p = breathe(fkPose({lean: 7, neck: 12, lt: 2, lk: 4, rt: -3, rk: 4, la: 6, le: 34, ra: 2, re: 40}), phase, 0.7);
	const P = figure(cx, p, LOOKS.mum, {t: phase});
	return <g transform={facing === -1 ? `translate(${f1(2 * x)},0) scale(-1,1)` : undefined}><Layers layers={stackOf(P)} uid={uid} rc={rimCfg(h, rim, rimO, lightDir, facing, col)} /></g>;
};
/** the Bactrian camel on its own: (x, y) = the ground under its middle; h = the MAN's height (the hump stands ≈ 1.4 h); walk phase in camel cycles (stride CAMEL_STRIDE·h) */
export const Camel: React.FC<{x: number; y: number; h: number; phase?: number; walking?: boolean; t?: number; facing?: 1 | -1; rim?: string; lightDir?: LightDir; rimO?: number}> =
	({x, y, h, phase = 0, walking = false, t = 0, facing = 1, rim = RIM, lightDir = 'left', rimO = 0.85}) => {
	const uid = useUid(), c = camelShapes(ctxAt(x, y, h), phase, t, walking);
	return <g transform={facing === -1 ? `translate(${f1(2 * x)},0) scale(-1,1)` : undefined}><Layers layers={[{sh: c.far, rim: 0.8}, {sh: c.body, rim: 1}, {sh: c.near, rim: 1}]} uid={uid} rc={rimCfg(h, rim, rimO, lightDir, facing, FIG)} /></g>;
};
/** the cart parked: (x, y) = the ground under its axle; h = the man's height; the handlebar rests at `gripY` (body units) */
export const Cart: React.FC<{x: number; y: number; h: number; kind?: CartKind; dist?: number; gripY?: number; facing?: 1 | -1; rim?: string; lightDir?: LightDir; rimO?: number}> =
	({x, y, h, kind = 'orange', dist = 0, gripY, facing = 1, rim = RIM, lightDir = 'left', rimO = 0.85}) => {
	const uid = useUid(), g0 = CART_GRIP[kind], gy = gripY ?? 0.3, R = CART_R[kind], Lg = len(g0), gx = -Math.sqrt(Math.max(0.01, Lg * Lg - (gy - R) ** 2));
	const c = cartShapes(ctxAt(x, y, h), kind, [gx, gy], dist, 0);
	return <g transform={facing === -1 ? `translate(${f1(2 * x)},0) scale(-1,1)` : undefined}><Layers layers={[{sh: c.back, rim: 1}, {sh: c.front, rim: 1}]} uid={uid} rc={rimCfg(h, rim, rimO, lightDir, facing, FIG)} /></g>;
};
/** the red sled on its own: (x, y) = the ground under its nose; it trails behind (−x) */
export const Sled: React.FC<{x: number; y: number; h: number; dist?: number; facing?: 1 | -1; rim?: string; lightDir?: LightDir; rimO?: number}> =
	({x, y, h, dist = 0, facing = 1, rim = RIM, lightDir = 'left', rimO = 0.85}) => {
	const uid = useUid(), s = sledShapes(ctxAt(x, y, h), [0, 0], [0.25, 0.04], dist);
	return <g transform={facing === -1 ? `translate(${f1(2 * x)},0) scale(-1,1)` : undefined}><Layers layers={[{sh: s.sled, rim: 1}]} uid={uid} rc={rimCfg(h, rim, rimO, lightDir, facing, FIG)} /></g>;
};
/** debug/inspection: the raw gait pose of a travelling action at a phase (body units) */
export const karlGaitPose = (action: 'walk' | 'pushCart' | 'haulSled' | 'wade', phase: number): Pose => gaitAt({walk: G_WALK, pushCart: G_PUSH, haulSled: G_HAUL, wade: G_WADE}[action], phase);
