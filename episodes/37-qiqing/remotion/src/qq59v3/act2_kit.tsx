import React from 'react';
import {useStage, useUid, coc, layerTransform, useFog, Shape, P, W, H, f1, lerp, rnd, cl, sm, mix, poly} from './kit3';
import {Karl, KarlProps, KARL_CYCLE, Action} from './act2_karl';
import {iceBlockPts} from './props3';

/* ep59 v3 · act 2 shared bits: the figure slot on the act-2 rig variant (act2_karl: + 'pose' and the guard), eased travel,
   the pressure-ridge ice blocks (after sets3b), beat helpers. */

/** where a figure stands in a <Stage> (as kit3's FigureSlot, but drawing the act-2 rig): depth transform, DOF, cast shadow, breath */
export const Fig: React.FC<Omit<KarlProps, 'attire' | 'action' | 'phase'> & Partial<KarlProps> & {
	depth?: number; shadow?: {k: number; skew: number; o?: number; c?: string; blur?: number}; breath?: boolean; contact?: number; under?: React.ReactNode; over?: React.ReactNode; o?: number}> = (props) => {
	const {cam, atm, t} = useStage(), uid = useUid('a2f');
	const {depth, shadow, breath, contact, under, over, o, ...rest} = props;
	const D = depth ?? atm.focus;
	const p: KarlProps = {attire: 'ice', action: 'walk', phase: 0, facing: 1, rim: atm.rim, lightDir: atm.lightDir, t, ...rest};
	const {x, y, h} = p, sh = shadow, b = coc(atm, D), facing = p.facing ?? 1;
	const body = <Karl {...p} />;
	return <g filter={b >= 0.8 ? `url(#${uid}dof)` : undefined} opacity={o}>
		<defs>
			{b >= 0.8 && <filter id={`${uid}dof`} filterUnits="userSpaceOnUse" x={-200} y={-200} width={W + 400} height={H + 400}><feGaussianBlur stdDeviation={b.toFixed(2)} /></filter>}
			{sh && <filter id={`${uid}sh`} filterUnits="userSpaceOnUse" x={f1(x - Math.max(4, Math.abs(sh.skew) * 1.3 + 1.5) * h)} y={f1(y - h * 0.6)} width={f1(Math.max(8, Math.abs(sh.skew) * 2.6 + 3) * h)} height={f1(h * (1.2 + sh.k * 1.4))}><feFlood floodColor={sh.c ?? '#000'} /><feComposite in2="SourceAlpha" operator="in" /><feGaussianBlur stdDeviation={sh.blur ?? 1.5} /></filter>}
			{breath && <radialGradient id={`${uid}br`}><stop offset="0" stopColor="#ffffff" stopOpacity="1" /><stop offset="0.55" stopColor="#f6f7fa" stopOpacity="0.5" /><stop offset="1" stopColor="#f4f6fa" stopOpacity="0" /></radialGradient>}
		</defs>
		<g transform={layerTransform(cam, D, atm.focus, atm.pp)}>
			{contact !== undefined && <ellipse cx={x} cy={y + h * 0.004} rx={h * 0.2} ry={h * 0.022} fill="#000" opacity={contact} />}
			{sh && <g filter={`url(#${uid}sh)`} opacity={sh.o ?? 0.5}><g transform={`matrix(1,0,${sh.skew.toFixed(3)},${(-sh.k).toFixed(3)},${f1(-sh.skew * y)},${f1((1 + sh.k) * y)})`}>{body}</g></g>}
			{under}
			{body}
			{breath && Array.from({length: 5}, (_, i) => { const u = ((t / 2.4 + i / 5) % 1), hx = x + facing * h * (0.08 + u * 0.26), hy = y - h * (0.87 + u * 0.07), r = h * (0.03 + u * 0.1);
				return <ellipse key={i} cx={hx} cy={hy} rx={r * 1.5} ry={r} fill={`url(#${uid}br)`} opacity={(Math.pow(Math.sin(u * Math.PI), 0.7) * 0.85 * (1 - u * 0.5)).toFixed(3)} />; })}
			{over}
		</g></g>;
};

/** travel with an eased pace: pace(t) goes from p0 to p1 between t0 and t1 (smoothstep); returns the gait phase and the distance (px).
    The phase is the integral of the pace, so x = x0 + dx keeps the planted foot still at every speed. */
export const travel = (action: Action, t: number, h: number, p0: number, p1: number, t0: number, t1: number, ph0 = 0) => {
	const c = KARL_CYCLE[action], n = 48; let acc = 0;
	const pace = (u: number) => lerp(p0, p1, sm((u - t0) / Math.max(1e-3, t1 - t0)));
	if (t > 0) { const dt = t / n; for (let i = 0; i < n; i++) acc += pace((i + 0.5) * dt) * dt; } else acc = p0 * t;
	const phase = ph0 + acc / c.sec;
	return {phase, dx: (phase - ph0) * c.stride * h};
};

/** 0→1 over [a, a+len] (smooth) */
export const ramp = (t: number, a: number, len: number) => sm((t - a) / len);
/** an impulse at time a: rises in `up` s, decays over `down` s (for flashes / jolts) */
export const pulse = (t: number, a: number, up = 0.05, down = 0.5) => (t < a ? 0 : t < a + up ? (t - a) / up : Math.exp(-(t - a - up) / down * 2.3));
/** a camera jolt (px) after an impact at a: a damped shake */
export const jolt = (t: number, a: number, amp: number, seed = 1) => { if (t < a) return [0, 0]; const u = t - a, e = Math.exp(-u * 7);
	return [Math.sin(u * 52 + seed) * amp * e, Math.cos(u * 47 + seed * 2) * amp * 0.7 * e]; };

/* ---------- pressure-ridge ice blocks lit from one side (after sets3b) ---------- */
export type IceCols = {lit: string; shade: string; cap: string};
export const ICE_DAY: IceCols = {lit: '#efc9ba', shade: '#59628f', cap: '#fbe9df'};
export const IceRidge: React.FC<{x0: number; x1: number; y: number; hmin: number; hmax: number; seed: number; cols: IceCols; rows?: number; extra?: number; wide?: number; flip?: boolean}> = ({x0, x1, y, hmin, hmax, seed, cols, rows = 2, extra = 0, wide = 1, flip}) => {
	const fog = useFog(), shade: string[] = [], lit: string[][] = [[], [], []], cap: string[] = [];
	for (let r = 0; r < rows; r++) {
		const yr = y - (rows - 1 - r) * hmax * 0.1, sc = 1 - r / rows * 0.45;
		for (let x = x0 + (r % 2) * hmax * 0.3, i = 0; x < x1; i++) {
			const env = Math.pow(Math.sin(Math.PI * cl((x - x0) / (x1 - x0))), 0.6), h = (hmin + (hmax - hmin) * Math.pow(rnd(i, seed + r * 7), 1.5) * env) * sc, w = h * (0.6 + rnd(i, seed + 1 + r) * 0.9) * wide, sd = seed * 31 + i * 7 + r * 101;
			let pts = iceBlockPts(x + w / 2, yr + rnd(i, seed + 3) * h * 0.12, w, h, sd);
			if (flip) { const cx = x + w / 2; pts = pts.map(([px, py]) => [2 * cx - px, py] as P).reverse() as P[]; pts = [pts[5], pts[4], pts[3], pts[2], pts[1], pts[0]]; }
			const [p0, , p2, p3, p4, p5] = pts;
			shade.push(poly(pts));
			const mid: P = [(p0[0] + p5[0]) / 2 + w * 0.12, yr];
			lit[Math.floor(rnd(i, seed + 9 + r) * 3)].push(poly([p3, p4, p5, mid, [lerp(p2[0], p3[0], 0.3), lerp(p2[1], p3[1], 0.3) + h * 0.12]]));
			cap.push(poly([p2, p3, [p3[0], p3[1] + h * 0.07], [lerp(p2[0], p3[0], 0.5), lerp(p2[1], p3[1], 0.5) + h * 0.16], [p2[0] + w * 0.05, p2[1] + h * 0.1]]));
			x += w * (0.4 + rnd(i, seed + 5) * 0.4);
		}
	}
	return <g><Shape d={shade.join(' ')} fill={fog(cols.shade, extra)} />{lit.map((l, k) => <Shape key={k} d={l.join(' ')} fill={fog(mix(cols.lit, cols.shade, k * 0.28), extra)} />)}<Shape d={cap.join(' ')} fill={fog(cols.cap, extra)} /></g>; };

/** text in the film's label face (霞鹜文楷), with a dark halo */
export const KAI = "'LXGW WenKai','Noto Serif CJK SC',serif";
