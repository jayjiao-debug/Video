import React from 'react';
import {Cam, proj, V3} from './parts53';
/* ep53 v3 · fix4 (review #5): a lid lifter built in the chamber's 3-D space and projected by the chamber camera, so a top-down or
   steep camera sees what it should: the top of the head (hair), the shoulders, the back and two arms reaching to the lid, with the
   legs short and mostly hidden under the body. Both gloved hands sit ON the lid (passed in, chamber metres), so they rise with it.
   When the camera is close the body is outside the frame and only the arms and gloves reach in. Lacquer-brown people style of the
   draw's hands (#2B1A12, warm rim #E0A868), the same as the old side-view Digger53 it replaces. */
const PEOPLE = '#2B1A12', HAIR = '#160D08', GLOVE = '#3A2414', CUFF = '#34200F', RIM = '#E0A868';
const add = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const nrm = (a: V3): V3 => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
/** the body: feet at (x, y, 0), both hands given; the torso bends (and the hips drop) until the shoulders are within reach */
export const Lifter53: React.FC<{c: Cam; x: number; y: number; hands: [V3, V3]; id: string; o?: number}> = ({c, x, y, hands, id, o = 1}) => {
	if (o <= 0.01) return null;
	const foot: V3 = [x, y, 0], mid: V3 = [(hands[0][0] + hands[1][0]) / 2, (hands[0][1] + hands[1][1]) / 2, (hands[0][2] + hands[1][2]) / 2];
	const fwd = nrm([mid[0] - x, mid[1] - y, 0]), lat: V3 = [-fwd[1], fwd[0], 0];
	const S0 = add(add(foot, fwd, 0.3), [0, 0, 1.28]), toS = sub(S0, mid), dS = len(toS);
	const S = dS > 0.5 ? add(mid, nrm(toS), 0.5) : S0;   // shoulders 0.5 m from the hands at most
	let Hp = add(foot, [0, 0, 0.92]); const hs = sub(S, Hp), dH = len(hs);
	if (dH > 0.56) Hp = add(Hp, nrm(hs), dH - 0.56);   // the hips follow (a crouch) when the back alone can't reach
	const up = nrm(sub(S, Hp));
	const head = add(add(S, up, 0.17), fwd, 0.05), sh = (s: number) => add(S, lat, 0.19 * s);
	/* each hand to its own shoulder (the nearer one), the elbow bent outward and down */
	const hs2 = len(sub(hands[0], sh(1))) + len(sub(hands[1], sh(-1))) <= len(sub(hands[0], sh(-1))) + len(sub(hands[1], sh(1))) ? [1, -1] : [-1, 1];
	const elbow = (P: V3, Q: V3, s: number): V3 => { const m: V3 = [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2, (P[2] + Q[2]) / 2], h = Math.sqrt(Math.max(0, 0.3 * 0.3 - (len(sub(Q, P)) / 2) ** 2));
		return add(m, nrm(add([0, 0, -0.7], lat, 0.7 * s)), h); };
	const knee = (s: number): V3 => add(add([(Hp[0] + x) / 2, (Hp[1] + y) / 2, Hp[2] * 0.5], fwd, 0.18), lat, 0.12 * s);
	const footS = (s: number): V3 => add(add(foot, lat, 0.13 * s), fwd, -0.04);
	/* projection helpers: px per metre at a point, a thick round stroke between chamber points (skipped if behind the lens) */
	const pp = (p: V3) => proj(c, p), ok = (...ps: V3[]) => ps.every((p) => pp(p)[2] > 0.12);
	const ppm = (p: V3) => c.f / Math.max(0.12, pp(p)[2]);
	const bone = (k: string, ps: V3[], w: number, col: string) => { if (!ok(...ps)) return null; const q = ps.map(pp), W = w * ps.reduce((a, p) => a + ppm(p), 0) / ps.length;
		return <path key={k} d={'M' + q.map((v) => `${v[0].toFixed(1)},${v[1].toFixed(1)}`).join(' L')} fill="none" stroke={col} strokeWidth={W} strokeLinecap="round" strokeLinejoin="round" />; };
	const disc = (k: string, p: V3, r: number, col: string, op = 1) => { if (!ok(p)) return null; const q = pp(p); return <circle key={k} cx={q[0]} cy={q[1]} r={r * ppm(p)} fill={col} opacity={op} />; };
	const body = (col: string, hair: string, glove: string, cuff: string) => <>
		{[1, -1].map((s) => bone(`l${s}`, [Hp, knee(s), footS(s)], 0.11, col))}
		{bone('t', [Hp, S], 0.26, col)}
		{bone('sh', [sh(1), sh(-1)], 0.15, col)}
		{hs2.map((s, i) => { const P = sh(s), Q = hands[i], E = elbow(P, Q, s); return <g key={`a${i}`}>{bone('u', [P, E], 0.095, col)}{bone('f', [E, Q], 0.08, col)}</g>; })}
		{bone('n', [S, head], 0.1, col)}
		{disc('h', head, 0.105, hair)}
		{hs2.map((sg, i) => { const Q = hands[i], E = elbow(sh(sg), Q, sg), u = nrm(sub(Q, E));
			return <g key={`g${i}`}>{bone('c', [add(Q, u, -0.13), add(Q, u, -0.07)], 0.092, cuff)}{bone('w', [add(Q, u, -0.07), add(Q, u, 0.02)], 0.06, glove)}{bone('p', [add(Q, u, 0.0), add(Q, u, 0.05)], 0.085, glove)}</g>; })}
	</>;
	const r0 = pp(head);
	return <g opacity={o}>
		{/* the warm rim: the same silhouette a few px up-left, under the body */}
		<g transform="translate(-2.4 -2.2)" opacity={0.42}>{body(RIM, RIM, RIM, RIM)}</g>
		{body(PEOPLE, HAIR, GLOVE, CUFF)}
		<title>{`${id} head ${r0[0].toFixed(0)},${r0[1].toFixed(0)}`}</title>
	</g>; };
