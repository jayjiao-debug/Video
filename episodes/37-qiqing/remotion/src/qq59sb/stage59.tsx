import React from 'react';
import {figParts, cartParts, CART_PAINT, LitParts, Look59, Pose, Part, STAGE as RIG, withArms, walkPose, BRISK, STRIDE_B, GAIT_B_S, GAIT, STRIDE, GAIT_S} from '../qq59/figure59';
/* ep59 part 2 · Karl at each stage of the walk (owner 19:04; the photos …/ep59photos/clean_sheet.jpg).
   The looks come from the rig's own stage variants (qq59/figure59 STAGE, read-only): kRussia, k2012, kSwim, k2026, mum; Mongolia
   and China are derived from kRussia (no rig variant yet). The cart is the rig's (hitched to his hip belt, orange bags).
   This file only adds what the rig has no part for:
     frost  : rime on the beard, the hood's ruff and the brows (the Siberian winters; the real frost photo lands on bar 52)
     camo   : muted blotches clipped to his coat / poncho parts (close and medium shots only) */
type P = [number, number];
const f1 = (v: number) => v.toFixed(1);
const rnd = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
export const FIGC = '#0c0b0f';

export type StageKey = 'russia' | 'russiaHood' | 'protest' | 'steppe' | 'china' | 'swim' | 'europe' | 'home' | 'mum';
export type Stage = {look: Look59; frost?: number; camo?: number};
export const STAGE: Record<StageKey, Stage> = {
	russia: {look: RIG.kRussia, camo: 1},
	russiaHood: {look: {...RIG.kRussia, head: 'hood', paint: {...RIG.kRussia.paint, gear: '#3a3a34'}}, camo: 1, frost: 1},
	protest: {look: RIG.k2012},
	steppe: {look: {dress: 'jacket', head: 'short', beard: 'full', pack: 'none', build: 1.02, paint: {coat: '#23271c', beard: '#3e2a1a', hair: '#3a2e1e'}}, camo: 0.9},
	china: {look: {dress: 'jacket', head: 'cap', beard: 'full', pack: 'big', build: 1.02, paint: {coat: '#23271c', beard: '#3e2a1a', pack: '#1c1e1a'}}, camo: 0.9},
	swim: {look: RIG.kSwim},
	europe: {look: {...RIG.k2026, pack: 'none'}},
	home: {look: {...RIG.k2026, pack: 'none'}},
	mum: {look: RIG.mum},
};

/* ---------- the head frame of figParts (the same maths), so accents sit exactly on the rig's head ---------- */
export const headFrame = (pose: Pose, x: number, g: number, h: number) => {
	const J = (n: string): P => [x + pose[n][0] * h, g - pose[n][1] * h], n1 = J('Neck1'), hd = J('Head'), top = J('Top');
	const ang = Math.atan2(top[1] - n1[1], top[0] - n1[0]) + Math.PI / 2, hc: P = [hd[0] + (top[0] - hd[0]) * 0.45, hd[1] + (top[1] - hd[1]) * 0.45], s = h * 0.93, c = Math.cos(ang), sn = Math.sin(ang);
	const R = (px: number, py: number): P => [hc[0] + px * s * c - py * s * sn, hc[1] + px * s * sn + py * s * c];
	const Q = (px: number, py: number) => { const p = R(px, py); return `${f1(p[0])},${f1(p[1])}`; };
	return {R, Q};
};
/** frost and camo over a figure (drawn in the figure's unflipped frame) */
const Accents: React.FC<{st: Stage; parts: Part[]; pose: Pose; x: number; g: number; h: number; id: string}> = ({st, parts, pose, x, g, h, id}) => {
	const {Q, R} = headFrame(pose, x, g, h), hips: P = [x + pose.Hips[0] * h, g - pose.Hips[1] * h];
	const out: React.ReactNode[] = [];
	const coat = parts.filter((p) => p.role === 'coat');
	if (st.camo && h > 110 && coat.length) {
		const cols = ['#353a26', '#423a28', '#14160f', '#2c2c1e'];
		out.push(<g key="camo" opacity={st.camo * Math.min(1, (h - 110) / 140)}>
			<defs><clipPath id={`${id}cc`}>{coat.map((p, i) => <path key={i} d={p.d} />)}</clipPath></defs>
			<g clipPath={`url(#${id}cc)`}>{Array.from({length: 40}, (_, i) => { const bx = hips[0] + (rnd(i, 1) - 0.5) * 0.5 * h, by = hips[1] - (rnd(i, 2) * 0.75 - 0.15) * h;
				return <ellipse key={i} cx={f1(bx)} cy={f1(by)} rx={f1((0.03 + 0.035 * rnd(i, 3)) * h)} ry={f1((0.014 + 0.018 * rnd(i, 4)) * h)} transform={`rotate(${f1(rnd(i, 5) * 180)} ${f1(bx)} ${f1(by)})`} fill={cols[i % 4]} />; })}</g></g>);
	}
	if (st.frost) { const fr = st.frost;
		out.push(<g key="frost" opacity={fr}>
			<path d={`M${Q(0.056, 0.032)} Q${Q(0.07, 0.092)} ${Q(0.027, 0.106)} Q${Q(-0.027, 0.082)} ${Q(-0.04, 0.018)} Z`} fill="#9aa6ae" opacity={0.6} />
			{Array.from({length: 8}, (_, i) => { const p = R(0.0 + 0.06 * rnd(i, 17), 0.04 + 0.06 * rnd(i, 18)); return <circle key={`b${i}`} cx={f1(p[0])} cy={f1(p[1])} r={f1((0.005 + 0.004 * rnd(i, 19)) * h)} fill="#e8eef2" opacity={0.85} />; })}
			{Array.from({length: 14}, (_, i) => { const u = i / 13, p = R(0.072 + 0.03 * rnd(i, 7), -0.09 + 0.2 * u); return <circle key={i} cx={f1(p[0])} cy={f1(p[1])} r={f1((0.007 + 0.006 * rnd(i, 9)) * h)} fill="#eef3f6" opacity={0.85} />; })}
			<path d={`M${Q(0.034, -0.026)} L${Q(0.066, -0.02)}`} stroke="#eef3f6" strokeWidth={f1(Math.max(1, 0.007 * h))} strokeLinecap="round" opacity={0.9} />
		</g>); }
	return <>{out}</>;
};

export type Rim2 = {c: string; o: number; dx: number; dy: number};
/** Karl (or his mother) at a stage: the rig's role-painted parts with rims, plus the cart (hitched to his hips) and the accents */
export const Karl: React.FC<{stage: StageKey; x: number; g: number; h: number; pose: Pose; flip?: boolean; col?: string; rims?: Rim2[]; id: string; cart?: {dist: number}; look?: Partial<Look59>}> =
	({stage, x, g, h, pose, flip, col = FIGC, rims = [{c: '#ffd9a8', o: 0.55, dx: -2.4, dy: -1.6}], id, cart, look}) => {
	const st0 = STAGE[stage], st = look ? {...st0, look: {...st0.look, ...look}} : st0, fig = figParts(x, g, h, pose, st.look), under: Part[] = [], over: Part[] = [];
	if (cart) { const hipB: P = [pose.Hips[0] + 0.01, pose.Hips[1] - 0.02], c = cartParts(x, g, h, hipB, cart.dist, 'orange');
		under.push(...c.back.map((p) => ({...p, fill: p.fill ?? (p.role === 'load' ? CART_PAINT.orange.load : undefined)}))); over.push(...c.front); }
	const k = Math.max(0.6, h / 450);
	return <g>
		<LitParts parts={[...under, ...fig, ...over]} rims={rims} k={k} col={col} paint={st.look.paint} flipX={flip ? x : undefined} />
		<g transform={flip ? `translate(${f1(2 * x)},0) scale(-1,1)` : undefined}><Accents st={st} parts={fig} pose={pose} x={x} g={g} h={h} id={id} /></g>
	</g>;
};

/* ---------- poses ---------- */
const DEG = Math.PI / 180;
const UPPER = ['Spine1', 'Neck1', 'Head', 'Top', 'LSh', 'RSh', 'LElb', 'RElb', 'LHand', 'RHand'];
/** lean the upper body forward by deg (about the hips) */
export const leanP = (p: Pose, deg: number): Pose => { const o: Pose = {...p}, c = Math.cos(-deg * DEG), s = Math.sin(-deg * DEG), [hx, hy] = p.Hips;
	for (const n of UPPER) { const x = p[n][0] - hx, y = p[n][1] - hy; o[n] = [hx + x * c - y * s, hy + x * s + y * c]; } return o; };
/** the brisk walk (the driven stretches) at distance d (px) for height h: the body advances d, the feet don't slide */
export const walkB = (d: number, h: number, lean = 5): Pose => leanP(walkPose(d / (STRIDE_B * h), BRISK), lean);
/** the natural walk at distance d */
export const walkD = (d: number, h: number, lean = 4): Pose => leanP(walkPose(d / (STRIDE * h), GAIT), lean);
/** thumbs in the pack straps while walking */
export const strapD = (d: number, h: number, lean = 6, brisk = true): Pose => { const ph = d / ((brisk ? STRIDE_B : STRIDE) * h), p = walkPose(ph, brisk ? BRISK : GAIT), a = ph * Math.PI * 2;
	return leanP(withArms(p, [14 + 5 * Math.sin(a), 124], [10 + 5 * Math.sin(a + 3), 130]), lean); };
/** speeds (px/s) for a figure of height h */
export const vBrisk = (h: number) => STRIDE_B * h / GAIT_B_S;
export const vNat = (h: number) => STRIDE * h / GAIT_S;
