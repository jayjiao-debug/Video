import React from 'react';
import {Easing, interpolate, spring} from 'remotion';

/* ep26 v3 motion tokens (director notes v2 §3). Nothing linear except constant drift or flowing dashes. */
export const E = {
	ENTER: Easing.bezier(0.16, 1, 0.3, 1), // expo-out: anything arriving
	EXIT: Easing.bezier(0.7, 0, 0.84, 0), // cubic-in: anything leaving (faster than entrances)
	MOVE: Easing.bezier(0.65, 0, 0.35, 1), // in-out cubic: objects travelling
	CAM: Easing.bezier(0.45, 0, 0.55, 1), // in-out sine: every camera move
	LIN: Easing.linear,
};
export const FPS = 30;
export const ramp = (t: number, a: number, b: number, e = E.MOVE) => interpolate(t, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
export const mix = (p: number, a: number, b: number) => a + (b - a) * p;
/** entrance progress (expo-out), default 0.6 s */
export const enter = (t: number, a: number, d = 0.6) => ramp(t, a, a + d, E.ENTER);
/** exit progress 0→1 (cubic-in), default 0.35 s */
export const exit = (t: number, a: number, d = 0.35) => ramp(t, a, a + d, E.EXIT);
/** visibility envelope: in at a (enter), out at b (exit) */
export const env = (t: number, a: number, b = 1e9, din = 0.6, dout = 0.35) => enter(t, a, din) * (1 - exit(t, b, dout));
/** spring landing (damping 15, stiffness 120) starting at time a */
export const land = (t: number, a: number, cfg: {damping?: number; stiffness?: number; mass?: number} = {}) =>
	t < a ? 0 : spring({frame: (t - a) * FPS, fps: FPS, config: {damping: cfg.damping ?? 15, stiffness: cfg.stiffness ?? 120, mass: cfg.mass ?? 1}});
/** stamp slam: scale 1.25 → 1 in 0.2 s with back-out; returns {s, o, shake} */
export const slam = (t: number, a: number) => {
	const p = ramp(t, a, a + 0.2, Easing.out(Easing.back(1.4)));
	const f = Math.floor((t - a) * FPS);
	return {s: t < a ? 1.25 : mix(p, 1.25, 1), o: t < a ? 0 : Math.min(1, (t - a) / 0.06), shake: f >= 0 && f < 2 ? (f === 0 ? 3 : -2) : 0};
};
/** style for a rising entrance (opacity on the first 60 %, 32 px lift, scale 0.96→1); text may add blur */
export const riseStyle = (p: number, blur = false, dy = 32): React.CSSProperties => ({
	opacity: Math.min(1, p / 0.6),
	transform: `translateY(${(1 - p) * dy}px) scale(${0.96 + 0.04 * p})`,
	filter: blur && p < 1 ? `blur(${(1 - p) * 6}px)` : undefined,
});
/** svg transform for a rising entrance */
export const riseT = (p: number, dy = 32) => `translate(0 ${(1 - p) * dy})`;
/** slow drift: ≤1.5 % scale and ≤20 px per 5 s, on CAM */
export const drift = (t: number, a: number, seed = 0) => {
	const u = (t - a) / 5;
	return {x: Math.sin(u * 1.1 + seed) * 10, y: Math.cos(u * 0.9 + seed * 2) * 6, s: 1 + Math.min(0.015, Math.max(0, u * 0.006))};
};
/** camera wrapper: translate/scale about a focus point (fx, fy) */
export const Cam: React.FC<{x?: number; y?: number; s?: number; fx?: number; fy?: number; r?: number; o?: number; filter?: string; children: React.ReactNode}> = ({x = 0, y = 0, s = 1, fx = 960, fy = 540, r = 0, o = 1, filter, children}) => (
	<div style={{position: 'absolute', inset: 0, opacity: o, filter, transformOrigin: `${fx}px ${fy}px`, transform: `translate(${x}px, ${y}px) scale(${s}) rotate(${r}deg)`}}>{children}</div>
);
/** a rolling counter value (rounded) */
export const roll = (t: number, a: number, b: number, v0: number, v1: number) => Math.round(mix(ramp(t, a, b, E.MOVE), v0, v1));
