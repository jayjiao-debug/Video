import React from 'react';
import {Figure4, Look4, Pose, fkPose} from '../qq44/figure44';
import {walkPose, grounded, jointAt, STRIDE, seated} from '../qq47/pose47';
import {Subs, Stamp, Seal, Theme, SAFE_X, SAFE_Y, KAI, YEAR, SANS} from '../qq50/kit50';
import {useStampFonts, Odo} from '../qq44/skin44';
import {figPaths, LOOK, Look59} from '../qq59/figure59';
/* ep59 《他走路回家，走了28年》 · storyboard bars 21–95 · the shared layer.
   House style (ep44/ep55 "dark silhouette"): flat-vector sets in dark, desaturated planes with layered set dressing; one-tone
   figures (#0c0b0f) with a warm rim on the lit edge; ONE accent colour = gold (the route, the home light, key words, widgets).
   Furniture: layout-D subtitles (kit50), two-line stamp (kit50), 「第 N 年 · 他 N 岁」 counter, the J seal. */
export {Figure4, fkPose, walkPose, grounded, jointAt, STRIDE, seated, Subs, Stamp, Seal, SAFE_X, SAFE_Y, KAI, YEAR, SANS};
export type {Look4, Pose, Theme, Look59};
export const W = 1920, H = 1080, FPS = 30;
/* music grid (script v2): DJ remix 140.8 BPM, bar 1.70444 s; downbeat n at D(n) */
export const BAR = 1.70444, BEAT = BAR / 4, D = (n: number) => 0.144 + BAR * n;
export const GOLD = '#E8BC66', GOLD_HI = '#FFD98A', CREAM = '#FFF6E6', FIG = '#0c0b0f', RIM = '#ffd9a8';
export type P = [number, number];
export const rnd = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
export const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
export const sm = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
export const eio = (u: number) => { const x = cl(u); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const eout = (u: number) => 1 - Math.pow(1 - cl(u), 3);
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const land = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 - Math.exp(-6 * u) * Math.cos(9 * u));
const f1 = (v: number) => v.toFixed(1);
/** closed (or open) Catmull-Rom spline through the points */
export const spline = (pts: P[], closed = true) => { const n = pts.length, g = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
	let d = `M${f1(pts[0][0])},${f1(pts[0][1])}`;
	for (let i = 0; i < (closed ? n : n - 1); i++) { const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
		d += ` C${f1(p1[0] + (p2[0] - p0[0]) / 6)},${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)},${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])},${f1(p2[1])}`; }
	return d + (closed ? ' Z' : ''); };
export const poly = (pts: P[]) => 'M' + pts.map((p) => `${f1(p[0])},${f1(p[1])}`).join(' L') + ' Z';

/* ---------- light, sky, blur ---------- */
export const Glow: React.FC<{x: number; y: number; r: number; c?: string; o?: number; id: string; ry?: number}> = ({x, y, r, c = '#ffb44a', o = 0.3, id, ry}) =>
	<><defs><radialGradient id={id}><stop offset="0" stopColor={c} stopOpacity="1" /><stop offset="0.45" stopColor={c} stopOpacity="0.45" /><stop offset="1" stopColor={c} stopOpacity="0" /></radialGradient></defs>
		<ellipse cx={x} cy={y} rx={r} ry={ry ?? r} fill={`url(#${id})`} opacity={o} /></>;
export const Sky: React.FC<{id: string; stops: [number, string][]; x?: number; y?: number; w?: number; h?: number}> = ({id, stops, x = -400, y = -300, w = W + 800, h = H + 600}) =>
	<><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">{stops.map(([o, c], i) => <stop key={i} offset={o} stopColor={c} />)}</linearGradient></defs><rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} /></>;
export const Blur: React.FC<{id: string; s: number; children: React.ReactNode}> = ({id, s, children}) => <g><defs><filter id={id} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={s} /></filter></defs><g filter={`url(#${id})`}>{children}</g></g>;
/** a soft quad light shaft */
export const Shaft: React.FC<{id: string; pts: P[]; col?: string; o?: number}> = ({id, pts, col = '#f2e6d2', o = 0.1}) => {
	const a = pts[0], c = [(pts[2][0] + pts[3][0]) / 2, (pts[2][1] + pts[3][1]) / 2];
	return <g><defs><linearGradient id={id} x1={a[0]} y1={a[1]} x2={c[0]} y2={c[1]} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor={col} stopOpacity={1} /><stop offset="1" stopColor={col} stopOpacity={0} /></linearGradient></defs>
		<path d={poly(pts)} fill={`url(#${id})`} opacity={o} /></g>; };
/** camera: zoom z about the frame centre, then pan (px, py) in screen px; optional roll (deg) */
export const Cam: React.FC<{z?: number; px?: number; py?: number; rot?: number; children: React.ReactNode}> = ({z = 1, px = 0, py = 0, rot = 0, children}) =>
	<g transform={`translate(${f1(W / 2 + px)},${f1(H / 2 + py)}) rotate(${rot}) scale(${z.toFixed(4)}) translate(${-W / 2},${-H / 2})`}>{children}</g>;
/** a parallax layer: shifts by (dx, dy) × depth factor */
export const Par: React.FC<{dx: number; dy?: number; k: number; children: React.ReactNode}> = ({dx, dy = 0, k, children}) => <g transform={`translate(${f1(dx * k)},${f1(dy * k)})`}>{children}</g>;
export const Vignette: React.FC<{o?: number}> = ({o = 0.5}) => <g pointerEvents="none"><defs><radialGradient id="v59" cx="0.5" cy="0.5" r="0.75"><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity={o} /></radialGradient></defs><rect width={W} height={H} fill="url(#v59)" /></g>;

/* ---------- landforms and vegetation ---------- */
/** a ridge line closed down to `bottom` */
export const ridgeD = (y: number, amp: number, seed: number, o: {x0?: number; x1?: number; step?: number; f?: number; bottom?: number; sharp?: number} = {}) => {
	const {x0 = -300, x1 = W + 300, step = 16, f = 1, bottom = H + 400, sharp = 0} = o; let d = `M${x0},${bottom}`;
	for (let x = x0; x <= x1; x += step) { let v = Math.sin(x * 0.0042 * f + seed) * 0.5 + Math.sin(x * 0.0113 * f + seed * 2.3) * 0.3 + Math.sin(x * 0.029 * f + seed * 5.1) * 0.2;
		if (sharp) v = v * (1 - sharp) + sharp * (1 - 2 * Math.abs(((x * 0.0021 * f + seed * 0.37) % 1 + 1) % 1 - 0.5)) * 1.2; d += ` L${x},${f1(y - amp * v)}`; }
	return d + ` L${x1},${bottom} Z`; };
/** a conifer (layered, slightly ragged) standing on (x, g) */
export const pineD = (x: number, g: number, h: number, w = h * 0.3, seed = 0) => { const n = 6; let d = `M${f1(x - w * 0.05)},${g} L${f1(x - w * 0.05)},${f1(g - h * 0.12)} L${f1(x + w * 0.05)},${f1(g - h * 0.12)} L${f1(x + w * 0.05)},${g} Z`;
	for (let i = 0; i < n; i++) { const yb = g - h * (0.1 + 0.8 * i / n), yt = g - h * (0.1 + 0.8 * (i + 1.6) / n), ww = w * (1 - i / (n + 0.6)) * (0.5 + 0.12 * rnd(i, seed));
		d += ` M${f1(x - ww)},${f1(yb)} Q${f1(x - ww * 0.3)},${f1(yb - h * 0.03)} ${f1(x)},${f1(Math.min(yt, g - h))} Q${f1(x + ww * 0.3)},${f1(yb - h * 0.03)} ${f1(x + ww)},${f1(yb)} Q${f1(x)},${f1(yb - h * 0.035)} ${f1(x - ww)},${f1(yb)} Z`; }
	return d; };
/** a broad tropical leaf from base (x, y), length L, angle a (deg, 0 = right, + = clockwise/down), half-width w */
export const leafD = (x: number, y: number, L: number, a: number, w = L * 0.22, droop = 0.15) => { const r = a * Math.PI / 180, ux = Math.cos(r), uy = Math.sin(r), nx = -uy, ny = ux;
	const at = (s: number, k: number): P => [x + ux * L * s + nx * w * k, y + uy * L * s + ny * w * k + droop * L * s * s];
	return spline([at(0, 0), at(0.25, 0.85), at(0.6, 1), at(0.9, 0.45), at(1.02, 0), at(0.9, -0.45), at(0.6, -1), at(0.25, -0.85)]); };
/** a fern / palm frond: a curved rib with leaflets */
export const frondD = (x: number, y: number, L: number, a: number, bend = 0.3, n = 12, lw = 0.16) => { const r = a * Math.PI / 180; let d = '';
	const pt = (s: number): P => { const ang = r + bend * s * s; return [x + Math.cos(r) * L * s + Math.cos(ang) * 0, y + Math.sin(r) * L * s + bend * L * s * s * 0.6]; };
	for (let i = 1; i <= n; i++) { const s = i / (n + 1), p = pt(s), q = pt(s + 0.02), ta = Math.atan2(q[1] - p[1], q[0] - p[0]), ll = L * lw * (1 - s * 0.7);
		for (const side of [-1, 1]) { const la = ta + side * 1.05, e: P = [p[0] + Math.cos(la) * ll, p[1] + Math.sin(la) * ll + ll * 0.35], m: P = [(p[0] + e[0]) / 2 + Math.cos(la + side * 1.4) * ll * 0.15, (p[1] + e[1]) / 2 + Math.sin(la + side * 1.4) * ll * 0.15];
			d += ` M${f1(p[0])},${f1(p[1])} Q${f1(m[0])},${f1(m[1])} ${f1(e[0])},${f1(e[1])} Q${f1((p[0] + e[0]) / 2)},${f1((p[1] + e[1]) / 2)} ${f1(p[0])},${f1(p[1])} Z`; } }
	const e = pt(1); d += ` M${f1(x)},${f1(y)} Q${f1((x + e[0]) / 2)},${f1((y + e[1]) / 2 - L * 0.05)} ${f1(e[0])},${f1(e[1])} L${f1(e[0])},${f1(e[1] + 3)} Q${f1((x + e[0]) / 2)},${f1((y + e[1]) / 2 - L * 0.05 + 4)} ${f1(x)},${f1(y + 5)} Z`;
	return d; };
/** a hanging liana (open path, stroke it) */
export const lianaD = (x: number, y0: number, y1: number, sway: number) => `M${x},${y0} C${x + sway},${lerp(y0, y1, 0.35)} ${x - sway * 0.6},${lerp(y0, y1, 0.7)} ${x + sway * 0.3},${y1}`;
/** a birch: pale trunk with dark marks (drawn in two fills) */
export const Birch: React.FC<{x: number; g: number; h: number; w?: number; bark?: string; mark?: string; seed?: number; lean?: number}> = ({x, g, h, w = 16, bark = '#8a8c88', mark = '#1a1c1c', seed = 0, lean = 0}) =>
	<g transform={`rotate(${lean} ${x} ${g})`}><path d={`M${x - w / 2},${g} L${x - w * 0.32},${g - h} L${x + w * 0.32},${g - h} L${x + w / 2},${g} Z`} fill={bark} />
		{Array.from({length: Math.round(h / 40)}, (_, i) => <rect key={i} x={x - w / 2 + rnd(i, seed) * w * 0.4} y={g - 20 - i * 40 - rnd(i, seed + 1) * 14} width={w * (0.3 + 0.4 * rnd(i, seed + 2))} height={3 + 4 * rnd(i, seed + 3)} fill={mark} opacity={0.8} />)}</g>;
/** falling snow / dust specks, deterministic */
export const Specks: React.FC<{t: number; n?: number; seed?: number; col?: string; o?: number; vx?: number; vy?: number; r?: number; box?: [number, number, number, number]}> = ({t, n = 80, seed = 0, col = '#e8eef2', o = 0.6, vx = -30, vy = 60, r = 2.4, box = [0, 0, W, H]}) => <g>
	{Array.from({length: n}, (_, i) => { const [bx, by, bw, bh] = box, sp = 0.6 + 0.8 * rnd(i, seed + 3), x = bx + ((((rnd(i, seed) * bw + t * vx * sp) % bw) + bw) % bw), y = by + ((((rnd(i, seed + 1) * bh + t * vy * sp) % bh) + bh) % bh);
		return <circle key={i} cx={f1(x)} cy={f1(y)} r={f1(r * (0.4 + rnd(i, seed + 2)))} fill={col} opacity={o * (0.4 + 0.6 * rnd(i, seed + 4))} />; })}</g>;
/** water surface highlights: short horizontal dashes in perspective between y0 (far) and y1 (near) */
export const Glints: React.FC<{t: number; y0: number; y1: number; n?: number; col?: string; o?: number; seed?: number; x0?: number; x1?: number; speed?: number}> = ({t, y0, y1, n = 90, col = '#dfe8ee', o = 0.25, seed = 0, x0 = -100, x1 = W + 100, speed = 12}) => <g>
	{Array.from({length: n}, (_, i) => { const k = Math.pow(rnd(i, seed + 1), 1.6), y = lerp(y0, y1, k), w = lerp(8, 90, k) * (0.5 + rnd(i, seed + 2)), x = x0 + (((rnd(i, seed) * (x1 - x0) + t * speed * (0.3 + k)) % (x1 - x0)) + (x1 - x0)) % (x1 - x0);
		return <rect key={i} x={f1(x)} y={f1(y)} width={f1(w)} height={f1(lerp(1.2, 4, k))} rx={1} fill={col} opacity={o * (0.3 + 0.7 * Math.abs(Math.sin(t * 1.3 + i)))} />; })}</g>;

/* ---------- the traveller (figure44 rig) with his expedition pack ---------- */
/* the cast: the hero's looks come from the demo's rig (qq59/figure59, read-only) so he is the same man from bar 0 to the end:
   young = 1998–2006 (cap, stubble, jacket, the big pack); mid = the Russia/Asia years (cap, short beard); old = 2024–26 (bush hat, full beard, parka) */
export const LK: Record<string, Look59> = {
	young: LOOK.karlYoung, mid: {...LOOK.karlYoung, beard: 'short', build: 1.0}, old: LOOK.karlOld,
	swim: {dress: 'shirt', head: 'bald', beard: 'full', pack: 'none', build: 1.0},
	mum: LOOK.mum, man: LOOK.man, woman: LOOK.woman,
	guard: {dress: 'coat', head: 'cap', build: 1.1, pack: 'none'},
	dimitri: {dress: 'parka', head: 'beanie', beard: 'short', pack: 'big', build: 1.0},
	press: {dress: 'jacket', head: 'short', build: 1.05, pack: 'none'},
};
/** the pack: a tall expedition rucksack + a bedroll, built along the torso axis (w > 0 = behind the back) */
export type Shape = {d: string; tr?: string};
export const packD = (pose: Pose, x: number, g: number, h: number, size = 1, withRoll = true): Shape[] => {
	const S = (n: string): P => [x + pose[n][0] * h, g - pose[n][1] * h], hips = S('Hips'), sp = S('Spine1');
	const ax0 = sp[0] - hips[0], ay0 = sp[1] - hips[1], al = Math.hypot(ax0, ay0) || 1, ax = ax0 / al, ay = ay0 / al, bkx = ay, bky = -ax;
	const T = (s: number, w: number): P => [hips[0] + (ax * s + bkx * w) * h, hips[1] + (ay * s + bky * w) * h];
	const k = size, top = 0.25 + 0.05 * k, dp = 0.08 + 0.06 * k;
	const body = spline([T(-0.02, 0.05), T(-0.045, 0.07), T(-0.04, 0.05 + dp * 0.85), T(0.04, 0.055 + dp), T(top - 0.07, 0.06 + dp), T(top - 0.005, 0.05 + dp * 0.8), T(top + 0.008, 0.09), T(top - 0.02, 0.05), T(0.18, 0.035), T(0.05, 0.04)]);
	const rc = T(top + 0.028, 0.055 + dp * 0.55), rl = 0.036 * h, rr = 0.033 * h, ang = Math.atan2(bky, bkx) * 180 / Math.PI;
	const roll = `M${f1(rc[0] - rl)},${f1(rc[1])} a${f1(rl)},${f1(rr)} 0 1,0 ${f1(2 * rl)},0 a${f1(rl)},${f1(rr)} 0 1,0 ${f1(-2 * rl)},0 Z`;
	const strap = spline([T(0.235, 0.03), T(0.24, -0.02), T(0.17, -0.06), T(0.08, -0.055), T(0.08, -0.04), T(0.16, -0.045), T(0.215, -0.01), T(0.215, 0.03)]);
	return withRoll ? [{d: body}, {d: roll, tr: `rotate(${f1(ang)} ${f1(rc[0])} ${f1(rc[1])})`}, {d: strap}] : [{d: body}, {d: strap}];
};
type TravP = {x: number; g: number; h: number; pose: Pose; look?: Look59; flip?: boolean; pack?: number; col?: string; rim?: string; rimOp?: number; side?: 1 | -1; under?: React.ReactNode; over?: React.ReactNode; extra?: Shape[]; roll?: boolean};
/** one-tone figure with a thin rim of light on the lit side (side = −1: light from the left, +1: from the right); drawn with the demo's
    figPaths (its pack included when look.pack = 'big'; pack = 0 takes it off). `extra` = more one-tone shapes in the figure's unflipped
    frame (a machete, a life vest), drawn and rimmed with the body */
export const Trav: React.FC<TravP> = ({x, g, h, pose, look = LK.young, flip, pack = 1, col = FIG, rim = RIM, rimOp = 0.6, side = -1, under, over, extra = []}) => {
	const k = Math.max(1, h / 420), lk: Look59 = pack > 0 ? look : {...look, pack: 'none'}, ds = [...figPaths(x, g, h, pose, lk), ...extra.map((s) => s.d)];
	const body = (c: string, key: string) => <g key={key} transform={flip ? `translate(${2 * x},0) scale(-1,1)` : undefined}>{ds.map((d, i) => <path key={i} d={d} fill={c} />)}{key === 'b' && under}</g>;
	return <g>{rimOp > 0 && <g transform={`translate(${f1(side * 2.4 * k)},${f1(-1.8 * k)})`} opacity={rimOp}>{body(rim, 'r')}</g>}{body(col, 'b')}{over}</g>;
};
/** the torso frame of a posed figure: T(s, w) = hips + s along the spine + w toward the back (body heights) */
export const torsoFrame = (pose: Pose, x: number, g: number, h: number) => { const S = (n: string): P => [x + pose[n][0] * h, g - pose[n][1] * h], hips = S('Hips'), sp = S('Spine1');
	const ax0 = sp[0] - hips[0], ay0 = sp[1] - hips[1], al = Math.hypot(ax0, ay0) || 1, ax = ax0 / al, ay = ay0 / al, bkx = ay, bky = -ax;
	return (s: number, w: number): P => [hips[0] + (ax * s + bkx * w) * h, hips[1] + (ay * s + bky * w) * h]; };
/** a life vest over the torso (a Shape for Trav's `extra`) */
export const vestD = (pose: Pose, x: number, g: number, h: number): Shape => { const T = torsoFrame(pose, x, g, h);
	return {d: spline([T(0.02, 0.075), T(0.03, -0.085), T(0.12, -0.092), T(0.2, -0.07), T(0.215, -0.03), T(0.2, 0.05), T(0.12, 0.08)])}; };
/** a joint in screen px */
export const hand = (pose: Pose, n: 'LHand' | 'RHand' | 'LElb' | 'RElb' | 'Head' | 'Top' | 'LSh' | 'Hips' | 'Spine1' | 'LAnk' | 'RAnk', x: number, g: number, h: number, flip = false): P => jointAt(pose, n, x, g, h, flip);
/** lean the upper body forward by deg (about the hips), as under a load */
const UPPER = ['Spine1', 'Neck1', 'Head', 'Top', 'LSh', 'RSh', 'LElb', 'RElb', 'LHand', 'RHand'];
export const leanPose = (p: Pose, deg: number): Pose => { const o: Pose = {...p}, c = Math.cos(-deg * Math.PI / 180), s = Math.sin(-deg * Math.PI / 180), [hx, hy] = p.Hips;
	for (const n of UPPER) { const x = p[n][0] - hx, y = p[n][1] - hy; o[n] = [hx + x * c - y * s, hy + x * s + y * c]; } return o; };
/** walking pose at distance-based phase (feet don't slide when x advances STRIDE·h per cycle); phase 0 / 0.5 = full stride */
export const walkAt = (dist: number, h: number, lean = 5) => leanPose(walkPose(dist / (STRIDE * h)), lean);
export const POSE = {
	stand: grounded({lean: 4, lt: 2, lk: 2, rt: -3, rk: 3, la: -3, le: 10, ra: 4, re: 14}),
	standPack: grounded({lean: 9, neck: -4, lt: 3, lk: 4, rt: -4, rk: 4, la: 14, le: 70, ra: 10, re: 70}),
	lookOut: grounded({lean: 6, neck: -10, lt: 6, lk: 4, rt: -8, rk: 6, la: 8, le: 30, ra: 4, re: 20}),
	stride: grounded({lean: 10, lt: 24, lk: 8, rt: -22, rk: 24, la: -22, le: 20, ra: 22, re: 26}),
	climb: grounded({lean: 14, neck: -8, lt: 48, lk: 70, rt: -6, rk: 14, la: -16, le: 22, ra: 24, re: 30}),
};

/* ---------- furniture ---------- */
export const TH: Theme = {ink: CREAM, key: GOLD, rule: GOLD, dim: 0.86, pool: 'rgba(7,7,10,A)', poolA: 0.38, halo: '0 0 2px rgba(8,8,10,0.95), 0 2px 8px rgba(8,8,10,0.8), 0 2px 22px rgba(8,8,10,0.6)'};
/** the counter: 「第 N 年 · 他 N 岁」 bottom-left (numbers roll when fractional) */
export const Counter59: React.FC<{yr: number; age: number; o?: number; grey?: boolean; blur?: number}> = ({yr, age, o = 1, grey, blur = 0}) => {
	useStampFonts('第年他岁·0123456789');
	const sm2: React.CSSProperties = {fontFamily: KAI, fontWeight: 700, fontSize: 32, letterSpacing: '0.06em', marginBottom: 6};
	const num: React.CSSProperties = {fontFamily: YEAR, fontWeight: 600, fontSize: 60, lineHeight: 1, fontVariantNumeric: 'lining-nums tabular-nums', fontFeatureSettings: "'lnum' 1, 'tnum' 1"};
	return <div style={{position: 'absolute', left: SAFE_X + 30, bottom: SAFE_Y + 4, display: 'flex', alignItems: 'flex-end', gap: 8, color: grey ? '#a4a8ac' : TH.ink, textShadow: TH.halo, whiteSpace: 'nowrap', opacity: o}}>
		<span style={sm2}>第</span><span style={num}><Odo v={yr} size={60} blur={blur} /></span><span style={sm2}>年</span>
		<span style={{...sm2, color: GOLD, margin: '0 6px 6px'}}>·</span>
		<span style={sm2}>他</span><span style={num}><Odo v={age} size={60} blur={blur} /></span><span style={sm2}>岁</span>
	</div>; };
/** a centred line (the two quiet beats): a dark pool behind, cream 76 px */
export const Centre: React.FC<{s: string; n?: number; top?: number; o?: number}> = ({s, n = 1e9, top = 470, o = 1}) => {
	const vis = s.slice(0, n), hid = s.slice(vis.length);
	return <>
		<div style={{position: 'absolute', left: 360, right: 360, top: top - 40, height: 180, borderRadius: '50%', filter: 'blur(44px)', background: 'rgba(6,6,9,0.42)', opacity: o}} />
		<div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 78, letterSpacing: '0.06em', color: TH.ink, textShadow: TH.halo, opacity: o, whiteSpace: 'nowrap'}}>{vis}<span style={{opacity: 0}}>{hid}</span></div></>; };
/** an in-picture label in 文楷 (place names on montage panels, widget captions) */
export const Label: React.FC<{x: number; y: number; s: string; size?: number; anchor?: 'start' | 'middle' | 'end'; col?: string; o?: number; font?: string}> = ({x, y, s, size = 34, anchor = 'middle', col = CREAM, o = 0.92, font = KAI}) => {
	useStampFonts(s);
	return <text x={x} y={y} textAnchor={anchor} style={{fontFamily: font, fontWeight: 700, fontSize: size, letterSpacing: '0.06em', paintOrder: 'stroke'}} fill={col} stroke="rgba(8,8,10,0.75)" strokeWidth={size * 0.14} strokeLinejoin="round" opacity={o}>{s}</text>; };
