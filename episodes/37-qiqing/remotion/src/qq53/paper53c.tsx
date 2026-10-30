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
export const camAt = (t: number): Cam => { if (t <= 56.482) return faceCam(t);
	const f0 = faceCam(56.482, 56.482), C9b: Cam = {...C9, p: [C9.p[0] - 0.8, C9.p[1] + 0.8, C9.p[2] - 0.4], yaw: C9.yaw - 0.012};
	if (t < 59.0) return mixCam(f0, C9, trap(seg(t, 56.482, 59.0)));
	if (t < 59.2) return mixCam(C9, C9b, sstep(seg(t, 59.0, 59.2)));
	if (t < 60.0) return C9b;
	return mixCam(C9b, END_CAM, trap(seg(t, 60.1, P1))); };
const sheetTone = (i: number) => mix('#B89C6E', '#9C8258', rnd(i, 61) * 0.8);
export const Paper53: React.FC<{t: number}> = ({t}) => {
	const c = camAt(t), zc = axisZ(t), tilt = 0.12 * sstep(seg(t, 58.7, 59.1)) * (1 - down(t)), light = frameOf(t) >= frameOf(T_LIGHT) ? 1 : 0;
	const world = (a: number, w: number): V3 => { const s = a - A0; return [BASE + s, 0, zc + w + (s - S_MID) * tilt]; };
	const S = mapOf(c, world);
	const cut = frameOf(t) >= frameOf(T_CUT), flashN = frameOf(t) - frameOf(T_CUT);
	const riseU = sstep(seg(t, 56.75, 57.35)), setOn = riseU * (1 - sstep(seg(t, 60.55, 61.4))), rise = 60 * (1 - riseU);
	/* a half of sheet i (sgn +1 = behind the blade, −1 = in front): its three visible faces as projected paths */
	const half = (i: number, sgn: 1 | -1) => { const split = i >= NS - NC, ii = i - (NS - NC), fi = split ? (ii + 1) / NC : 0;
		const tt = seg(t, T_CUT + 0.01 * ii, T_CUT + 0.34 + 0.01 * ii), e = cut && split ? 1 - Math.pow(1 - tt, 3) : 0, bob = cut && split ? 0.05 * Math.sin(Math.PI * seg(t, T_CUT + 0.34, T_CUT + 0.7)) : 0;
		const jx = split && cut ? (rnd(i, 62) - 0.5) * 0.12 : 0, jy = split && cut ? (rnd(i, 63) - 0.5) * 0.08 : 0;
		const g = split && cut ? GAP : 0, yIn = sgn * (g + (cut && split ? 5.0 * e * fi + jy : 0)), yOut = sgn * (SY + (cut && split ? 0.9 * e * fi + jy : 0));
		const z0 = i * SHT - (cut && split ? (3.5 * e * fi - bob * fi) : 0), z1 = z0 + SHT, x0 = SX0 + jx, x1 = SX1 + jx;
		const top = poly(c, [[x0, yIn, z1], [x1, yIn, z1], [x1, yOut, z1], [x0, yOut, z1]]);
		const end = poly(c, [[x1, yIn, z1], [x1, yOut, z1], [x1, yOut, z0], [x1, yIn, z0]]);
		const face = sgn < 0 ? poly(c, [[x0, yOut, z1], [x1, yOut, z1], [x1, yOut, z0], [x0, yOut, z0]]) : poly(c, [[x0, yIn, z1], [x1, yIn, z1], [x1, yIn, z0], [x0, yIn, z0]]);
		const tone = sheetTone(i), fresh = sgn > 0 && split && cut;
		return <g key={`${i}${sgn}`}><path d={face} fill={fresh ? '#C3A874' : mix(tone, '#000000', 0.16)} stroke="#6A5535" strokeWidth={1} strokeOpacity={fresh ? 1 : 0.55} />
			<path d={end} fill={mix(tone, '#000000', 0.26)} stroke="#6A5535" strokeWidth={1} strokeOpacity={0.55} /><path d={top} fill={tone} stroke="#7A6440" strokeWidth={1} strokeOpacity={0.5} /></g>; };
	const halves = (sgn: 1 | -1) => Array.from({length: NS}, (_, i) => half(i, sgn));
	const hit = proj(c, [SX1 + 0.6, 0, ZE0 + 0.1]);
	/* the bracket labels stand beside the stack (to its screen-left), not on its face */
	const bx = SX1 + 1.7, ta = proj(c, [bx, -SY, ZT]), tb = proj(c, [bx, -SY, ZE0]), td = proj(c, [bx, -SY, 0]);
	const tagO = (cut ? 1 : 0) * sstep(seg(t, T_CUT + 0.2, T_CUT + 0.35)) * (1 - seg(t, 60.45, 60.8));
	const lx = (p: number, n: number, fs: number) => Math.max(p - 22, 150 + n * fs * 1.02);
	const ly = (y: number) => cl(y, 330, H - 120);
	/* producer r3: the two tags never collide (the lower one is clamped at the safe edge while the camera rises): keep ≥ 66 px apart, shift both up if needed */
	const tagY = (() => { const a0 = ly(ta[1] - 36), b0 = Math.max(ly(td[1] + 70), a0 + 86), sh = Math.max(0, b0 - (H - 120)); return [a0 - sh, b0 - sh]; })();
	const clap = sstep(seg(t, 57.55, 57.9)) * (1 - sstep(seg(t, 59.2, 59.5))), open = frameOf(t) >= frameOf(T_CLAP) ? 0 : 1, jolt = frameOf(t) >= frameOf(T_CLAP) ? Math.exp(-(t - T_CLAP) / 0.08) * Math.cos((t - T_CLAP) * 50) : 0;
	const beam = (() => { const lt = seg(t, T_LIGHT, T_LIGHT + 0.25) * (light ? 1 : 0); return lt > 0 && <g opacity={lt * (1 - sstep(seg(t, 60.2, 60.9)))}><path d={`M1530,290 L1660,220 L1240,${H} L520,${H} Z`} fill="url(#p9beam)" />
		<g transform="translate(1580,282) rotate(-26)"><rect x={-70} y={-60} width={150} height={120} rx={12} fill="#2A2420" stroke="#5A5048" strokeWidth={3} /><circle cx={-70} cy={0} r={48} fill="#FFF6E2" /><circle cx={-70} cy={0} r={34} fill="#FFFFFF" /><path d="M-70,-60 L-128,-92 M-70,60 L-128,92" stroke="#3A3430" strokeWidth={10} strokeLinecap="round" /></g>
		<path d="M1630,340 L1650,1100" stroke="#2A2420" strokeWidth={10} /></g>; })();
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		<defs>
			<linearGradient id="p9beam" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF4DC" stopOpacity="0.24" /><stop offset="0.6" stopColor="#FFF0D0" stopOpacity="0.06" /><stop offset="1" stopColor="#FFF0D0" stopOpacity="0" /></linearGradient>
			<linearGradient id="p9dim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#140806" stopOpacity="0.8" /><stop offset="0.6" stopColor="#140806" stopOpacity="0.55" /><stop offset="1" stopColor="#140806" stopOpacity="0" /></linearGradient>
		</defs>
		<rect x={-40} y={-40} width={W + 80} height={H + 80} fill="#24100C" />
		<LacDefs /><g opacity={sstep(seg(t, 60.0, 61.4))}><Lacquer sheen={0.1} id="ho" /></g>
		{beam}
		<g opacity={setOn} transform={`translate(0 ${rise})`}>
			<path d={poly(c, [[-60, -30, -0.05], [60, -30, -0.05], [60, 400, -0.05], [-60, 400, -0.05]])} fill="#33251B" />
			<path d={poly(c, [[SX0 + 0.6, -SY + 0.8, 0], [SX1 + 0.8, -SY + 0.8, 0], [SX1 + 0.8, SY + 0.8, 0], [SX0 + 0.6, SY + 0.8, 0]])} fill="#000" opacity={0.4} />
			{halves(1)}
		</g>
		<BladeFlat S={S} id="pp" />
		<MarkSet id="pp" S={S} o={1} col={(side, n) => hexMix(LATC, '#FFF2C8', Math.min(1, litOf(side, n, t)))} lit={(side, n) => Math.min(1, litOf(side, n, t))} />
		{flashN >= 0 && flashN < 3 && <path d={'M' + Array.from({length: 21}, (_, i) => S(A0 + LB * i / 20, bladeHW(LB * i / 20)).map((v) => v.toFixed(1)).join(',')).join('L') + 'L' + Array.from({length: 21}, (_, i) => S(A0 + LB * (20 - i) / 20, -bladeHW(LB * (20 - i) / 20)).map((v) => v.toFixed(1)).join(',')).join('L') + 'Z'} fill="#F2F6F8" opacity={0.75} />}
		<g opacity={setOn} transform={`translate(0 ${rise})`}>{halves(-1)}</g>
		{cut && t < 61.2 && <Glint x={hit[0]} y={hit[1]} r={70} o={(1 - sstep(seg(t, T_CUT, T_CUT + 0.25))) * 0.95 + 0.05 * Math.exp(-(t - T_CUT) / 0.45)} />}
		{tagO > 0.01 && <g opacity={tagO}>
			<path d={`M${ta[0] - 4},${ta[1]} h-14 V${tb[1] - 3} h14`} fill="none" stroke={B.goldL} strokeWidth={4} /><path d={`M${tb[0] - 4},${tb[1] + 3} h-14 V${td[1]} h14`} fill="none" stroke={B.cream} strokeWidth={3} />
			<Tag id="p9a" x={lx(ta[0] - 14, 5, 56)} y={tagY[0]} s="划破20多张" fs={56} col={B.goldL} anchor="end" />
			<Tag id="p9b" x={lx(tb[0] - 14, 4, 48)} y={tagY[1]} s="共30多张" fs={48} col={B.cream} anchor="end" /></g>}
		{clap > 0.01 && <g transform={`translate(240,${800 + (1 - clap) * 420 + jolt * 6}) rotate(-7)`} opacity={clap}>
			<rect x={0} y={0} width={230} height={160} rx={6} fill="#1E1C1A" stroke="#6A625A" strokeWidth={3} />
			<g transform={`rotate(${-open * 24} 0 -6)`}><path d="M0,-6 L230,-6 L230,-38 L0,-38 Z" fill="#1E1C1A" />{Array.from({length: 6}, (_, i) => <path key={i} d={`M${i * 38 + 6},-36 l24,28`} stroke="#E8E2D6" strokeWidth={11} />)}</g>
			<text x={115} y={82} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={54} fill="#E8E2D6">古剑</text><text x={115} y={138} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={32} fill="#B8B0A4">1977</text></g>}
		<Pool id="p9p" x={960} y={640} rx={1100} ry={380} a={0.22 * (1 - seg(t, 60.0, 61.4))} col="#FFC070" />
		<rect x={0} y={0} width={1500} height={320} fill="url(#p9dim)" opacity={seg(t, 57.6, 58.2) * (1 - seg(t, 59.4, 60.2))} />
		<Vignette id="p9" a={0.55 + 0.05 * seg(t, 60.0, 61.5)} />
	</svg>; };
void B;
