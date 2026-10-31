import React from 'react';
import {W, H, lerp, cl, rnd, seg, SANS, KAI} from '../qq50/kit50';
import {B, Pool, Vignette, LacDefs, Lacquer} from '../qq50/styleB';
import {Cam, lookAt, proj, poly, V3, Tag, mix} from './parts53';
import {sstep, sstep5} from './cam53';
import {Glint} from './kfA53';
import {LB, SW, bladeHW} from './props53';
import {aCenter} from './cam53c';
import {frameOf, DA} from './master53';
import {BladeFlat, MarkSet, mapOf} from './blade53c';
import {litOf, hexMix, LATC} from './inscr53c';
import {EdgeGlint53} from './edge53e4';
/* ep53 · TakeC leg 11 (56.482 → 61.577): 1977, the paper test for the film 《古剑》 (KF09). The camera, face-on to the blade as in KF08,
   swings out to the 3/4 view while the film light clicks on at DA(25) = 57.048 and lights the stack of 30 sheets; the clapper snaps on
   58.180. The blade (edge down, the same BladeFlat as the chamber's, same lattice, same marks) is lowered edge-first through the stack
   59.15 → 59.45, the right (base) end leading; on DA(26) = 59.312 the top 20 sheets are cut through and their halves lean out and
   sag; the bottom 10 stay whole. Then the blade is lifted out and the camera rises with it to the face-on view that leg 12's
   macro starts from (53.9 px/cm, base at x = 2000, axis on y = 540). World: cm; +x is the screen's left. */
export const P0 = 56.15, P1 = 61.577, T_LIGHT = DA(25), T_CLAP = 58.18, T_CUT = DA(26);
const SHT = 0.11, NS = 30, NC = 20, SX0 = -24.5, SX1 = -3.5, SY = 7, ZT = NS * SHT, ZE0 = (NS - NC) * SHT, GAP = 0.07;
const TIP = 14.5, BASE = TIP - LB, DZ0 = 3.1, ZAX0 = ZE0 + 2.2, S_MID = LB * 0.5, LIFT = 10.5, A0 = SW.bladeA;
const T_IN0 = 59.15, T_IN1 = 59.45, T_UP0 = 60.7, T_UP1 = 61.577;
const down = (t: number) => sstep5(seg(t, T_IN0, T_IN1)), lift = (t: number) => LIFT * sstep5(seg(t, T_UP0, T_UP1));
const dz = (t: number) => DZ0 * (1 - down(t));
const axisZ = (t: number) => ZAX0 + dz(t) + lift(t);
const FACE_D = 2300 / 76;
const faceCam = (t: number, ts = t): Cam => { const a = aCenter(Math.min(ts, 56.482)), x = BASE + (a - A0), z = ZAX0 + dz(ts) + 1.3;
	return {p: [x, -FACE_D, z], yaw: Math.PI / 2, pitch: 0, f: 2300, cx: 960, cy: 540, roll: 0}; };
const C9 = lookAt([8, -24, 22], [-10, 0, 1.2], 1450, 960, 600, -0.04);
/** leg 12's first picture: face-on, 53.9 px/cm, the blade's base at x = 2000, the axis on y = 540 */
const END_CAM: Cam = {p: [BASE + 19.3, -1300 / 53.9, ZAX0 + LIFT], yaw: Math.PI / 2, pitch: 0, f: 1300, cx: 960, cy: 540, roll: 0};
/** the blade exactly as Paper53 draws it at its last frame (END_CAM, lifted), for leg 12's first seconds: same BladeFlat, same MarkSet */
export const BladeEnd53: React.FC<{t: number}> = ({t}) => { const S = mapOf(END_CAM, (a, w) => [BASE + (a - A0), 0, ZAX0 + LIFT + w] as V3);
	return <g><BladeFlat S={S} id="pe" /><MarkSet id="pe" S={S} o={1} col={(side, n) => hexMix(LATC, '#FFF2C8', Math.min(1, litOf(side, n, t)))} lit={(side, n) => Math.min(1, litOf(side, n, t))} /></g>; };
const trap = (u: number) => { const x = cl(u, 0, 1), r = 0.2, v = 1 / (1 - r); return x < r ? v * x * x / (2 * r) : x > 1 - r ? 1 - v * (1 - x) * (1 - x) / (2 * r) : v * (x - r / 2); };
const mixCam = (a: Cam, b: Cam, u: number): Cam => ({p: [lerp(a.p[0], b.p[0], u), lerp(a.p[1], b.p[1], u), lerp(a.p[2], b.p[2], u)], yaw: lerp(a.yaw, b.yaw, u), pitch: lerp(a.pitch, b.pitch, u), f: lerp(a.f, b.f, u), cx: 960, cy: lerp(a.cy, b.cy, u), roll: lerp(a.roll ?? 0, b.roll ?? 0, u)});
/* v3.5 (owner: "this scene can be done with a smoother, seamless camera"): no swing out to a 3/4 view and back (that was for the
   paper). The blade holds still at its 56.482 height and the camera makes ONE eased move, face-on all the way, from G8's last view to
   leg 12's first picture (END_CAM, re-expressed for the unlifted blade), so B1's last frame is BladeEnd53 exactly. */
const END_B: Cam = {...END_CAM, p: [END_CAM.p[0], END_CAM.p[1], END_CAM.p[2] - LIFT + DZ0]};
export const camAt = (t: number): Cam => { if (t <= 56.482) return faceCam(t);
	return mixCam(faceCam(56.482, 56.482), END_B, sstep(seg(t, 56.482, P1))); };
void C9; void trap;
/* v3.4 (owner): the paper test now opens the film; here (v3 92.709 → 97.804, B1 「两千多年了，还这么锋利。/ 靠的是什么？」) the same blade
   and the same camera hold on the EDGE: no paper, no slate, no tags, no film light. The blade settles (the old drop into the stack, now
   a calm 2.2 s ease) before the hit; on DA(26) = 59.312 (v3 DA(42) 95.540) a thin glint runs along the cutting edge (the lower one,
   edge down), guard → tip in ~0.5 s, over a soft resting sheen that is there before and after and goes as the camera rises to leg 12. */
const settle = (t: number) => sstep5(seg(t, 57.0, 59.2));
void settle; void lift;
const RUN = 0.5;
export const Paper53: React.FC<{t: number}> = ({t}) => {
	const c = camAt(t), zc = ZAX0 + DZ0;   /* v3.5: the blade holds still (no settle, no lift) */
	const world = (a: number, w: number): V3 => [BASE + (a - A0), 0, zc + w];
	const S = mapOf(c, world);
	const hitN = frameOf(t) - frameOf(T_CUT), tr = hitN >= 0 ? hitN / 30 : -1;   // frame-exact: the glint's first frame is the hit's
	const rest = 0.75 * sstep(seg(t, 57.2, 58.4)) * (1 - sstep(seg(t, 60.55, 61.3)));
	const runU = tr >= 0 ? 0.05 + 1.0 * sstep(cl(tr / RUN)) : -1, runK = tr >= 0 ? (tr < RUN * 0.7 ? 1 : 1 - sstep(seg(tr, RUN * 0.7, RUN + 0.12))) : 0;
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		<defs>
			<linearGradient id="p9dim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#140806" stopOpacity="0.8" /><stop offset="0.6" stopColor="#140806" stopOpacity="0.55" /><stop offset="1" stopColor="#140806" stopOpacity="0" /></linearGradient>
		</defs>
		<rect x={-40} y={-40} width={W + 80} height={H + 80} fill="#24100C" />
		<LacDefs /><g opacity={sstep(seg(t, 60.0, 61.4))}><Lacquer sheen={0.1} id="ho" /></g>
		<BladeFlat S={S} id="pp" />
		<MarkSet id="pp" S={S} o={1} col={(side, n) => hexMix(LATC, '#FFF2C8', Math.min(1, litOf(side, n, t)))} lit={(side, n) => Math.min(1, litOf(side, n, t))} />
		<EdgeGlint53 S={S} id="p9e" sg={-1} rest={rest} k={runK} u={runU} />
		<Pool id="p9p" x={960} y={640} rx={1100} ry={380} a={0.22 * (1 - seg(t, 60.0, 61.4))} col="#FFC070" />
		<rect x={0} y={0} width={1500} height={320} fill="url(#p9dim)" opacity={seg(t, 57.6, 58.2) * (1 - seg(t, 59.4, 60.2))} />
		<Vignette id="p9" a={0.55 + 0.05 * seg(t, 60.0, 61.5)} />
	</svg>; };
void B; void Glint; void rnd; void KAI; void SANS; void Tag; void proj; void poly; void mix; void T_LIGHT; void T_CLAP; void down; void axisZ; void T_IN0; void T_IN1; void SX0; void SX1; void SY; void ZT; void NC; void GAP; void S_MID; void lerp; void H;
