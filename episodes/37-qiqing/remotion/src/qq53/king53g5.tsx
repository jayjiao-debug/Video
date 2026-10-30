import React from 'react';
import {lerp, cl, seg} from '../qq50/kit50';
import {sstep} from './cam53';
import {Sil} from './kfG53';
import {A, LBLADE, hwS, POM_PROF, R_GRIP, R_HOOP, HOOPS, GUARD_OUT, VARIANTS} from './swordspec53x';
/* ep53 v3.1 · TakeG G7 (owner note 1:22): 勾践 at the head of his ranks, drawing THE sword. One-tone faceless 皮影 silhouette in
   the same kit as kfG53 (head, rim light via Sil), a king's board cap with bead strings (the cap 勾践 wears on his mat in G5 and
   夫差's fallen 冕 in G7), a long robe, the scabbard slung at the waist. The sword's silhouette is built from the shared spec
   (swordspec53x: GUARD_OUT, POM_PROF, R_GRIP, HOOPS, hwS; design C colours), its hilt enlarged as a prop (HL, HX, HG, GK) so the
   guard's ∧/V and the outturned pommel dish read at ~110 px: a near-black hilt, the light blade with its one thin gold crease.
   Local units: feet at (0, 0), height ≈ 1, facing +x (toward the palace), y ↓. The draw is ONE motion (pull along the scabbard,
   sweep up and forward) landing ON DA(37) 84.219 (frame 2527), then held raised while the ranks advance and the roof goes under
   (86.484). */
const C = VARIANTS.C, f3 = (v: number) => v.toFixed(3);
export const DRAW_T = 0.4432 + 2.2642 * 37, DRAW_D = 1.1;   // DA(37) 84.219; the motion takes 1.1 s
/* the sword: SL local units long (the spec's blade, widths × BX). The hilt is the spec's hilt enlarged as a 皮影 prop: × HL along
   the axis about the blade root AJ, widths × HX (pommel dish, guard) / × HG (grip, hoops), the dish's thickness × HA */
const SL = 0.5, K = SL / A.L, BX = 1.25, HL = 1.7, HX = 1.7, HG = 1.35, HA = 1.5, AJ = A.blade0;
const hA = (a: number) => AJ - (AJ - a) * HL;
const AH = hA(lerp(A.grip0, A.grip1, 0.62));   // the hand holds the grip nearer the guard, so the grip and the dish show below it
const GK = 2.2, gA = (a: number) => hA(A.guard0) + (hA(a) - hA(A.guard0)) * GK;   // the guard's ∧ deepened so its V reads
const P = (a: number, w: number) => `${f3((a - AH) * K)},${f3(-w * K)}`;
const hilt = (): string => {
	const dish = POM_PROF[POM_PROF.length - 1][0], pomA = (a: number) => a * HA - (HA - 1) * dish;   // thicker dish, same joint to the grip
	const pom = POM_PROF.map(([a, r], i) => [hA(pomA(a)), r * (i < 4 ? HX : HG)] as [number, number]);
	const top = [...pom, [hA(A.guard0 + 0.5), R_GRIP * HG] as [number, number]], bot = [...top].reverse().map(([a, r]) => [a, -r] as [number, number]);
	const hoops = HOOPS.map((h) => { const a = hA(h); return `M${P(a - 2.2 * HL, R_HOOP * HG)}L${P(a + 2.2 * HL, R_HOOP * HG)}L${P(a + 2.2 * HL, -R_HOOP * HG)}L${P(a - 2.2 * HL, -R_HOOP * HG)}Z`; }).join('');
	const guard = 'M' + GUARD_OUT.map(([a, w]) => P(gA(a), w * HX)).join('L') + 'Z';
	return `M${P(top[0][0], top[0][1])}` + [...top, ...bot].map(([a, w]) => `L${P(a, w)}`).join('') + 'Z' + hoops + guard; };
const HILT = hilt(), APEX = gA(A.apex);
const BLADE = (() => { const n = 40, pts = Array.from({length: n + 1}, (_, i) => { const s = LBLADE * i / n; return [A.blade0 + s, hwS(s) * BX]; });
	return 'M' + [...pts.map(([a, w]) => P(a, w)), ...[...pts].reverse().map(([a, w]) => P(a, -w))].join('L') + 'Z'; })();
const CREASE = `M${P(APEX, 0)}L${P(A.L - 6, 0)}`;
/** the scabbard (dark, a little longer and wider than the blade), from its mouth at the guard */
const SHEATH = `M${P(APEX - 2, 26 * BX)}L${P(A.L + 8, 16 * BX)}L${P(A.L + 16, 0)}L${P(A.L + 8, -16 * BX)}L${P(APEX - 2, -26 * BX)}Z`;
/* the body: shoulder, scabbard mouth and its angle (the blade points back-down), the raised pose */
const SH: [number, number] = [0.03, -0.73], UP = 0.19, FORE = 0.19;
const MOUTH: [number, number] = [0.1, -0.45], TH0 = 220, TH1 = 72;
const OUT = (APEX - AH) * K, PULL = (LBLADE + 8) * K;
const dir = (th: number): [number, number] => [Math.cos(th * Math.PI / 180), -Math.sin(th * Math.PI / 180)];
const H0: [number, number] = [MOUTH[0] - dir(TH0)[0] * OUT, MOUTH[1] - dir(TH0)[1] * OUT];
const H1: [number, number] = [H0[0] - dir(TH0)[0] * PULL, H0[1] - dir(TH0)[1] * PULL];
const H2: [number, number] = [SH[0] + 0.34 * Math.cos(8 * Math.PI / 180), SH[1] - 0.34 * Math.sin(8 * Math.PI / 180)];
/** elbow by two-bone IK (bending down and back) */
const elbow = (h: [number, number]): [number, number] => { const dx = h[0] - SH[0], dy = h[1] - SH[1], d = Math.min(UP + FORE - 1e-4, Math.hypot(dx, dy));
	const a = Math.acos(cl((UP * UP + d * d - FORE * FORE) / (2 * UP * d), -1, 1)), b = Math.atan2(dy, dx) + a; return [SH[0] + UP * Math.cos(b), SH[1] + UP * Math.sin(b)]; };
/** the pose at t: hand, sword angle (deg, y up), blade glint */
export const drawPose = (t: number) => { const fr = Math.round(t * 30), F = Math.round(DRAW_T * 30);
	if (fr >= F) { const v = seg(t, DRAW_T, DRAW_T + 0.4); return {h: H2, th: TH1 - 4 * Math.sin(Math.PI * v) * (1 - v), glint: 1 - sstep(seg(t, DRAW_T, DRAW_T + 0.6))}; }
	const u = seg(t, DRAW_T - DRAW_D, DRAW_T), pull = sstep(cl(u / 0.42, 0, 1)), sw = cl((u - 0.36) / 0.64, 0, 1), swing = sw * sw * (3 - 2 * sw) * 0.75 + sw * sw * 0.25;
	const hp: [number, number] = [lerp(H0[0], H1[0], pull), lerp(H0[1], H1[1], pull)];
	return {h: [lerp(hp[0], H2[0], swing), lerp(hp[1], H2[1], swing)] as [number, number], th: lerp(TH0, TH1, swing), glint: 0}; };
/** 勾践 drawing the sword; place him with feet at the origin (G7 scene units via the parent's transform) */
export const KingDraw53g5: React.FC<{t: number}> = ({t}) => { const {h, th, glint} = drawPose(t), e = elbow(h);
	const sw = `translate(${f3(h[0])},${f3(h[1])}) rotate(${f3(-th)})`, sh = `translate(${f3(MOUTH[0])},${f3(MOUTH[1])}) rotate(${-TH0}) translate(${f3(-OUT)},0)`;
	return <g>
		<Sil><g strokeWidth={0}>
			{/* the long robe (wider hem than the ranks' 深衣), a hanging far sleeve */}
			<path d="M-0.26,0 L0.25,0 C0.21,-0.14 0.18,-0.28 0.16,-0.40 L-0.17,-0.42 C-0.19,-0.28 -0.21,-0.14 -0.26,0 Z" />
			<path d="M-0.16,-0.38 C-0.16,-0.56 -0.13,-0.70 -0.06,-0.79 L0.06,-0.79 C0.11,-0.72 0.15,-0.62 0.17,-0.52 L0.16,-0.38 Z" />
			<path d="M-0.10,-0.70 C-0.15,-0.60 -0.17,-0.48 -0.15,-0.34 L-0.06,-0.30 C-0.07,-0.44 -0.06,-0.56 -0.03,-0.66 Z" />
			<path d="M-0.17,-0.43 L0.17,-0.43 L0.17,-0.39 L-0.17,-0.39 Z" />
			{/* head and the king's board cap: crown, a board tipped forward, bead strings (旒) at both ends */}
			<ellipse cx={0.02} cy={-0.865} rx={0.066} ry={0.078} />
			<path d="M-0.035,-0.925 L0.07,-0.928 L0.065,-0.972 L-0.03,-0.968 Z" />
			<path d="M-0.15,-0.968 L0.18,-0.986 L0.18,-1.008 L-0.15,-0.992 Z" />
			{[0.165, 0.145, -0.135, -0.115].map((x, i) => <path key={i} d={`M${x},${f3(-0.975 - 0.0545 * (x + 0.15))} L${x},${f3(-0.89 - 0.0545 * (x + 0.15))}`} fill="none" strokeWidth={0.011} />)}
		</g></Sil>
		{/* the blade, light (firelight on bronze), with its one thin gold crease; hidden by the scabbard while inside it */}
		<g transform={sw}><path d={BLADE} fill={C.edge.lit} stroke={C.ink} strokeWidth={0.004} />
			<path d={CREASE} fill="none" stroke={C.blade.dark} strokeWidth={0.0035} />
			{glint > 0.004 && <path d={BLADE} fill="#FFF8E6" opacity={0.75 * glint} stroke="none" />}</g>
		<Sil>
			<path transform={sh} d={SHEATH} strokeWidth={0} />
			<g transform={sw}><path d={HILT} strokeWidth={0.002} /></g>
			<path d={`M${f3(SH[0])},${f3(SH[1])} L${f3(e[0])},${f3(e[1])} L${f3(h[0])},${f3(h[1])}`} fill="none" strokeWidth={0.05} strokeLinecap="round" strokeLinejoin="round" />
			<circle cx={h[0]} cy={h[1]} r={0.024} />
		</Sil></g>; };
