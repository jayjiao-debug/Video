import React from 'react';
import {staticFile} from 'remotion';
import {SP} from './spritesizes';
import {Rimmed, gaitPose, gaitStride, Look4, Pose, POSES, mixPose, fkPose} from './figure4';
/* ep41 v3 shared base: grounded parallax layers (owner note 1: nothing floats), the one-tone hero (note 4), helpers. */
export const W = 1920, H = 1080, FPS = 30;
export const SERIF = '"Noto Serif CJK SC", serif', SANS = '"Noto Sans CJK SC", sans-serif', LATS = '"DejaVu Serif", serif', MONO = '"DejaVu Sans Mono", monospace';
export const BEAT = 0.566, CYCLE = 2 * BEAT;
export const rnd = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
export const cl = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const sm = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
export const fio = (t: number, a: number, b: number, f = 0.35) => cl((t - a) / f) * cl((b - t) / f);
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

export const Glow: React.FC<{x: number; y: number; r: number; c?: string; o?: number; id?: string}> = ({x, y, r, c = '#ffb44a', o = 0.3, id}) => { const gid = id ?? 'g3' + c.replace('#', '');
	return <><defs><radialGradient id={gid}><stop offset="0" stopColor={c} stopOpacity="1" /><stop offset="0.45" stopColor={c} stopOpacity="0.45" /><stop offset="1" stopColor={c} stopOpacity="0" /></radialGradient></defs><circle cx={x} cy={y} r={r} fill={`url(#${gid})`} opacity={o} /></>; };
const tintF = (id: string, c: string) => { const r = parseInt(c.slice(1, 3), 16) / 255, g = parseInt(c.slice(3, 5), 16) / 255, b = parseInt(c.slice(5, 7), 16) / 255;
	return <filter key={id} id={id} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={`0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 1 0`} /></filter>; };
/** flat-colour silhouette sprite whose bottom edge sits on y (sink: px pushed into the ground so it never hovers) */
export const Sprite: React.FC<{k: string; x: number; y: number; h: number; c: string; flip?: boolean; op?: number; sink?: number}> = ({k, x, y, h, c, flip, op = 1, sink = 6}) => { const [iw, ih] = SP[k], w = iw * h / ih, id = `t3${c.slice(1)}`;
	return <g opacity={op}><defs>{tintF(id, c)}</defs><image href={staticFile(`ep41/sp/${k}.png`)} x={x - w / 2} y={y - h + sink} width={w} height={h} filter={`url(#${id})`} transform={flip ? `translate(${2 * x},0) scale(-1,1)` : undefined} /></g>; };
export const Sky: React.FC<{id: string; stops: [number, string][]}> = ({id, stops}) => <><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">{stops.map(([o, c], i) => <stop key={i} offset={o} stopColor={c} />)}</linearGradient></defs><rect width={W} height={H} fill={`url(#${id})`} /></>;

/** ground height of a parallax layer at screen x */
export const ridgeY = (cam: number, f: number, base: number, amp: number, seed: number) => (x: number) => { const u = x + cam * f; return base - amp * (0.55 + 0.25 * Math.sin(u * 0.0031 + seed) + 0.2 * Math.sin(u * 0.0107 + seed * 3)); };
/** one parallax layer: its own ground (a ridge) and things standing on it.
    items: every `period` px a renderer gets (x, groundY at x, index) so buildings and trees always stand on this layer's ground. */
export const Layer: React.FC<{cam: number; f: number; base: number; amp: number; seed: number; col: string; period?: number; pad?: number; item?: (x: number, gy: number, i: number) => React.ReactNode; op?: number; front?: React.ReactNode}> = ({cam, f, base, amp, seed, col, period = 600, pad = 600, item, op = 1, front}) => {
	const y = ridgeY(cam, f, base, amp, seed); let d = `M0,${H} L0,${y(0).toFixed(1)}`; for (let x = 24; x <= W + 24; x += 24) d += ` L${x},${y(x).toFixed(1)}`; d += ` L${W + 24},${H} Z`;
	const off = cam * f, i0 = Math.floor((off - pad) / period), i1 = Math.ceil((off + W + pad) / period);
	return <g opacity={op}>
		{item && Array.from({length: i1 - i0 + 1}, (_, k) => { const i = i0 + k, x = i * period - off + period * 0.5 * rnd(i, seed); return <g key={i}>{item(x, Math.min(y(x - 30), y(x), y(x + 30)) + 4, i)}</g>; })}
		<path d={d} fill={col} />{front}
	</g>;
};
/** items repeating every `period` px on a layer moving at cam*f (no ground) */
export const Rep: React.FC<{cam: number; f: number; period: number; render: (x: number, i: number) => React.ReactNode; pad?: number}> = ({cam, f, period, render, pad = 1000}) => {
	const off = cam * f, i0 = Math.floor((off - pad) / period), i1 = Math.ceil((off + W + pad) / period);
	return <>{Array.from({length: i1 - i0 + 1}, (_, k) => { const i = i0 + k; return <g key={i}>{render(i * period - off, i)}</g>; })}</>;
};

/* the hero: one flat tone, a thin rim of light on the outer contour only */
export type Hero4P = {x: number; ground: number; h: number; look: Look4; rim?: string; rimOp?: number; rimDx?: number; rimDy?: number; col?: string; flip?: boolean; T?: number};
export const speed4 = (look: Look4, h: number) => gaitStride(look.gait ?? '08_04') * h / CYCLE;
/** walking on the treadmill: tau seconds; one gait loop per two beats */
export const Walker: React.FC<Hero4P & {tau: number}> = ({tau, look, ...p}) => { const g = look.gait ?? '08_04', u = tau / CYCLE;
	return <Rimmed {...p} look={look} pose={gaitPose(g, u)} lag={gaitPose(g, u - 0.05)} T={p.T ?? tau} />; };
/** a designed pose, optionally blended toward another; breathe adds a small life motion so the figure is never frozen */
export const Poser: React.FC<Hero4P & {pose: Pose; to?: Pose; k?: number; breathe?: number}> = ({pose, to, k = 0, breathe = 0, T = 0, ...p}) => {
	let P = to ? mixPose(pose, to, sm(k)) : pose;
	if (breathe) { const b = Math.sin(T * 1.9) * 0.004 * breathe; P = Object.fromEntries(Object.entries(P).map(([n, v]) => [n, ['Hips', 'LUp', 'RUp', 'LKnee', 'RKnee', 'LAnk', 'RAnk', 'LToe', 'RToe'].includes(n) ? v : [v[0], v[1] + b * (v[1] - 0.6) * 4]])) as Pose; }
	return <Rimmed {...p} pose={P} T={T} />;
};
export {POSES, gaitPose, mixPose, fkPose, Rimmed};
/** screen position of a joint for a figure drawn at (x, ground, h), honouring flip */
export const jointAt = (pose: Pose, n: string, x: number, ground: number, h: number, flip = false): [number, number] => [x + (flip ? -1 : 1) * pose[n][0] * h, ground - pose[n][1] * h];
export type {Look4, Pose};
/** a walk that slows into a stand (k: 0 walking → 1 standing) — no freezing mid-stride (owner note 9) */
export const walkToStand = (g: string, tau: number, k: number, stand: Pose = POSES.stand) => mixPose(gaitPose(g, tau / CYCLE), stand, sm(k));

export const LOOK4: Record<string, Look4> = {
	diviner: {dress: 'robe', sleeves: 'wide', head: 'bun', beard: 'short'},
	du: {dress: 'robe', sleeves: 'wide', head: 'futou', beard: 'long'},
	morse: {dress: 'coat', head: 'short', beard: undefined},
	scott: {dress: 'coat', head: 'short', beard: 'full'},
	bell: {dress: 'coat', head: 'short', beard: 'full'},
	watson: {dress: 'shirt', head: 'short', beard: 'moustache', gait: '08_01'},
	marconi: {dress: 'coat', head: 'cap', gait: '08_01'},
	kemp: {dress: 'coat', head: 'cap', beard: 'moustache'},
	kline: {dress: 'shirt', head: 'bowl', gait: '08_01'},
	bj: {dress: 'jacket', head: 'glasses', gait: '08_01'},
	druyan: {dress: 'dress', head: 'long'},
	sagan: {dress: 'jacket', head: 'short'},
};
