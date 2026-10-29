import React from 'react';
import {W, H, lerp, cl, seg, SANS, KAI} from '../qq50/kit50';
import {B, Pool, Vignette} from '../qq50/styleB';
import {Cam, lookAt, proj, poly, latticeCells, V3, Tag} from './parts53';
import {spline, sstep, sstep5} from './cam53';
import {Glint} from './kfA53';
import {LB, bladeHW, SW, BZ, GLS} from './props53';
import {aCenter} from './cam53c';
import {frameOf, DA} from './master53';
/* ep53 · TakeC leg 11 (56.15 → 61.577): 1977, the paper test for the film 《古剑》 (KF09). The sword that came out of the sheath is
   held up and turned edge-down: the camera, face-on to the blade as in KF08, swings out to the front-right (KF09's camera, mirrored so
   the tip stays on the screen's left as in KF08) while the film light clicks on at DA(25) = 57.048 and lights the stack; the
   clapper snaps on 58.180; the blade goes through the stack and the slice completes ON DA(26) = 59.312 (23 of the 32 sheets cut);
   the cut halves fall in the break 61.01–61.58 while the camera dives to the blade's flat. World: cm; +x is the screen's left. */
export const P0 = 56.15, P1 = 61.577, T_LIGHT = DA(25), T_CLAP = 58.18, T_CUT = DA(26);
const SHT = 0.11, NS = 32, NC = 23, SX0 = -24.5, SX1 = -3.5, SY = 7, ZT = NS * SHT, ZE0 = (NS - NC) * SHT;
const TIP = 14.5, BASE = TIP - LB, DZ0 = 3.1, ZAX0 = ZE0 + 2.0;
/** the blade's drop: held above the stack, it goes through on 58.85 → 59.312 */
const dz = (t: number) => DZ0 * (1 - sstep5(seg(t, T_CUT - 0.46, T_CUT)));
const FACE_D = 2300 / 76;
const faceCam = (t: number, ts = t): Cam => { const a = aCenter(Math.min(ts, 56.482)), x = BASE + (a - SW.bladeA), z = ZAX0 + dz(ts) + 1.3;
	return {p: [x, -FACE_D, z], yaw: Math.PI / 2, pitch: 0, f: 2300, cx: 960, cy: 540, roll: 0}; };
const C9 = lookAt([4, -30, 12], [-6, 0, 0.9], 1900, 960, 560, -0.05);
/** the last view: face-on again, close (129 px/cm), the blade's base at the right edge, axis on the middle line: leg 12's first picture */
const END_CAM: Cam = {p: [-10, -12.4, ZAX0], yaw: Math.PI / 2, pitch: 0, f: 1300, cx: 960, cy: 540, roll: 0};
/** trapezoid ease (a fifth up, a fifth down): the peak speed is 1.25 × the average */
const trap = (u: number) => { const x = cl(u, 0, 1), r = 0.2, v = 1 / (1 - r); return x < r ? v * x * x / (2 * r) : x > 1 - r ? 1 - v * (1 - x) * (1 - x) / (2 * r) : v * (x - r / 2); };
const mixCam = (a: Cam, b: Cam, u: number): Cam => ({p: [lerp(a.p[0], b.p[0], u), lerp(a.p[1], b.p[1], u), lerp(a.p[2], b.p[2], u)], yaw: lerp(a.yaw, b.yaw, u), pitch: lerp(a.pitch, b.pitch, u), f: lerp(a.f, b.f, u), cx: 960, cy: lerp(a.cy, b.cy, u), roll: lerp(a.roll ?? 0, b.roll ?? 0, u)});
export const camAt = (t: number): Cam => { if (t <= 56.482) return faceCam(t);
	/* face-on (KF08) → KF09's 3/4 view → a slow drift → back to face-on, closer */
	const f0 = faceCam(56.482, 56.482), C9b: Cam = {...C9, p: [C9.p[0] - 0.8, C9.p[1] + 1.0, C9.p[2] - 0.4], yaw: C9.yaw - 0.012};
	if (t < 59.0) return mixCam(f0, C9, trap(seg(t, 56.482, 59.0)));
	if (t < 59.2) return mixCam(C9, C9b, sstep(seg(t, 59.0, 59.2)));
	return mixCam(C9b, END_CAM, trap(seg(t, 59.2, P1))); };
void cl;

const blCell = (cc: ReturnType<typeof latticeCells>[number], bl: (s: number, w: number, zo: number) => V3) => ({...cc, q: cc.q.map(([a, w]) => bl(a / 10, w / 10, 0)), inner: cc.inner.map(([a, w]) => bl(a / 10, w / 10, 0)), core: cc.core.map(([a, w]) => bl(a / 10, w / 10, 0))});
export const Paper53: React.FC<{t: number}> = ({t}) => {
	const c = camAt(t), dzv = dz(t), zE = ZE0 + dzv, zEf = Math.min(zE, ZT - 0.06), light = frameOf(t) >= frameOf(T_LIGHT) ? 1 : 0;
	const lt = seg(t, T_LIGHT, T_LIGHT + 0.25) * (frameOf(t) >= frameOf(T_LIGHT) ? 1 : 0);
	const bl = (s: number, w: number, zo = 0): V3 => [BASE + s, 0, ZE0 + 2.0 + dzv + w + zo];
	const outline = [...Array.from({length: 61}, (_, i) => { const s = LB * i / 60; return bl(s, bladeHW(s)); }), ...Array.from({length: 61}, (_, i) => { const s = LB * (60 - i) / 60; return bl(s, -bladeHW(s)); })];
	const cells = latticeCells(0, 1, 0, 0).map((cc) => blCell(cc, bl));
	const gap = (z: number) => lerp(0.14, 0.7, Math.pow(cl((z - zEf) / (ZT - zEf)), 1.4));
	const fall = seg(t, 61.01, 61.58), fz = 60 * fall * fall, fy = 3.0 * fall;
	const sheetLines = (x: number, y0: number, y1: number, z0: number, z1: number, dzf = 0) => Array.from({length: Math.round((z1 - z0) / SHT) + 1}, (_, i) => { const z = z0 + i * SHT; return <path key={`${x}${y0}${i}`} d={poly(c, [[x, y0, z - dzf], [x, y1, z - dzf]], false)} stroke="#A8A090" strokeOpacity={0.55} strokeWidth={1} fill="none" />; });
	const frontLines = (y: number) => Array.from({length: NS + 1}, (_, i) => { const z = i * SHT; return <path key={`f${i}`} d={poly(c, [[SX0, y, z], [SX1, y, z]], false)} stroke="#A8A090" strokeOpacity={0.5} strokeWidth={1} fill="none" />; });
	const endHalf = (sgn: 1 | -1, o: number): V3[] => [[SX1, sgn * (gap(zEf) + o), zEf - fz], [SX1, sgn * (SY + o), zEf - fz], [SX1, sgn * (SY + o), ZT - fz], [SX1, sgn * (gap(ZT) + o), ZT - fz], ...Array.from({length: 8}, (_, i) => { const z = lerp(ZT, zEf, (i + 1) / 9); return [SX1, sgn * (gap(z) + o), z - fz] as V3; })];
	const topHalf = (sgn: 1 | -1, o: number): V3[] => [[SX0, sgn * (gap(ZT) + o), ZT - fz], [SX1, sgn * (gap(ZT) + o), ZT - fz], [SX1, sgn * (SY + o), ZT - fz], [SX0, sgn * (SY + o), ZT - fz]];
	const o = fy;
	/* the light's beam (screen space, as KF09) and the lamp */
	const beam = lt > 0 && <g opacity={lt * (1 - sstep(seg(t, 60.2, 60.9)))}><path d={`M1530,290 L1660,220 L1240,${H} L520,${H} Z`} fill="url(#p9beam)" />
		<g transform="translate(1580,282) rotate(-26)"><rect x={-70} y={-60} width={150} height={120} rx={12} fill="#2A2420" stroke="#5A5048" strokeWidth={3} /><circle cx={-70} cy={0} r={48} fill="#FFF6E2" /><circle cx={-70} cy={0} r={34} fill="#FFFFFF" /><path d="M-70,-60 L-128,-92 M-70,60 L-128,92" stroke="#3A3430" strokeWidth={10} strokeLinecap="round" /></g>
		<path d="M1630,340 L1650,1100" stroke="#2A2420" strokeWidth={10} /></g>;
	const hit = proj(c, [SX1 + 0.6, 0, zE + 0.1]);
	const showTags = frameOf(t) >= frameOf(T_CUT + 0.2) && t < 60.8;
	const a = proj(c, [SX1, -SY, ZT]), b = proj(c, [SX1, -SY, zE]), d = proj(c, [SX1, -SY, 0]);
	const clap = sstep(seg(t, 57.55, 57.9)) * (1 - sstep(seg(t, 60.4, 60.9))), open = frameOf(t) >= frameOf(T_CLAP) ? 0 : 1, jolt = frameOf(t) >= frameOf(T_CLAP) ? Math.exp(-(t - T_CLAP) / 0.08) * Math.cos((t - T_CLAP) * 50) : 0;
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		<defs>
			<linearGradient id="p9beam" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF4DC" stopOpacity="0.24" /><stop offset="0.6" stopColor="#FFF0D0" stopOpacity="0.06" /><stop offset="1" stopColor="#FFF0D0" stopOpacity="0" /></linearGradient>
			<clipPath id="p9c"><path d={poly(c, outline)} /></clipPath>
			<linearGradient id="p9dim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#140806" stopOpacity="0.8" /><stop offset="0.6" stopColor="#140806" stopOpacity="0.55" /><stop offset="1" stopColor="#140806" stopOpacity="0" /></linearGradient>
			<linearGradient id="p9sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" stopOpacity="0" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0.5" /></linearGradient>
		</defs>
		<rect x={-40} y={-40} width={W + 80} height={H + 80} fill="#24100C" />
		{beam}
		{/* the film set: table and stack, dark until the light clicks on */}
		<g opacity={light ? 1 : 0.0}>
			<path d={poly(c, [[-60, -30, -0.05], [60, -30, -0.05], [60, 30, -0.05], [-60, 30, -0.05]])} fill="#33251B" />
			<path d={poly(c, [[-60, -30, -0.05], [60, -30, -0.05]], false)} stroke={B.gold} strokeOpacity={0.3} strokeWidth={2} fill="none" />
			<path d={poly(c, [[SX0 + 0.6, -SY + 0.8, 0], [SX1 + 0.8, -SY + 0.8, 0], [SX1 + 0.8, SY + 0.8, 0], [SX0 + 0.6, SY + 0.8, 0]])} fill="#000" opacity={0.4} />
			<path d={poly(c, topHalf(1, o))} fill="#ECE6D8" /><path d={poly(c, endHalf(1, o))} fill="#D8D0C0" />{sheetLines(SX1, gap(zEf) + 0.05 + o, SY + o, zEf - fz, ZT - fz)}
			<path d={poly(c, [[SX1, -SY, 0], [SX1, SY, 0], [SX1, SY, zEf], [SX1, -SY, zEf]])} fill="#D2CABA" />{sheetLines(SX1, -SY, SY, 0, zEf)}
		</g>
		{/* the blade */}
		<path d={poly(c, outline)} fill="#E2B464" />
		<g clipPath="url(#p9c)">{cells.map((cc, i) => <g key={i}>{cc.pale && <path d={poly(c, cc.inner)} fill="#FFF0CC" opacity={0.4} />}<path d={poly(c, cc.q)} fill="none" stroke="#22140A" strokeWidth={1.6} strokeOpacity={0.75} />{!cc.pale && <path d={poly(c, cc.core)} fill="#22140A" opacity={0.6} />}</g>)}</g>
		<path d={poly(c, outline)} fill="none" stroke="#FFF3CF" strokeWidth={2} strokeOpacity={0.7} />
		<path d={poly(c, [bl(0.3, 0), bl(LB - 1.2, 0)], false)} stroke="#FFF3CF" strokeWidth={2} strokeOpacity={0.8} fill="none" />
		{/* the hilt (right on the screen): grip, guard with the blue glass, pommel */}
		{(() => { const q = (a: number, w: number, h: number): V3 => [BASE + (a - SW.bladeA), -0.2 * 0 + 0, ZE0 + 2.0 + dzv + w + h * 0];
			return <g><path d={poly(c, [q(0, -1.86, 0), q(0, 1.86, 0), q(SW.pomA, 1.86, 0), q(SW.pomA, -1.86, 0)])} fill={BZ.body} stroke={BZ.line} strokeWidth={1} />
				<path d={poly(c, [q(SW.pomA, -0.86, 0), q(SW.pomA, 0.86, 0), q(SW.gripA, 0.86, 0), q(SW.gripA, -0.86, 0)])} fill={BZ.mid} />
				<path d={poly(c, [q(SW.gripA, -2.78, 0), q(SW.gripA, 2.78, 0), q(SW.guardA, 2.6, 0), q(SW.guardA, -2.6, 0)])} fill={GLS.body} stroke={BZ.lit} strokeWidth={1.2} /></g>; })()}
		{/* the front half of the stack */}
		<g opacity={light ? 1 : 0}>
			<path d={poly(c, topHalf(-1, o))} fill="#F6F2E8" />
			<path d={poly(c, [[SX0, -SY - o, 0], [SX1, -SY - o, 0], [SX1, -SY - o, ZT - fz], [SX0, -SY - o, ZT - fz]])} fill="#E6E0D2" />{frontLines(-SY - o)}
			<path d={poly(c, endHalf(-1, o))} fill="#DCD4C4" />{sheetLines(SX1, -SY - o, -gap(ZT) - 0.05 - o, zEf - fz, ZT - fz)}
		</g>
		{frameOf(t) >= frameOf(T_CUT) && t < 61.2 && <Glint x={hit[0]} y={hit[1]} r={24} o={Math.exp(-(t - T_CUT) / 0.5)} />}
		{showTags && <g opacity={1 - seg(t, 60.2, 60.7)}><path d={`M${a[0] - 4},${a[1]} h-16 V${b[1] - 3} h16`} fill="none" stroke={B.goldL} strokeWidth={4} /><path d={`M${b[0] - 4},${b[1] + 3} h-16 V${d[1]} h16`} fill="none" stroke={B.cream} strokeWidth={3} />
			<Tag id="p9a" x={a[0] - 14} y={(a[1] + b[1]) / 2 + 20} s="划破20多张" fs={56} col={B.goldL} anchor="end" />
			<Tag id="p9b" x={b[0] - 14} y={(b[1] + d[1]) / 2 + 30} s="共30多张" fs={44} col={B.cream} anchor="end" /></g>}
		{/* the clapper slate for 《古剑》: slides in, the top stick snaps shut on 58.180 */}
		{clap > 0.01 && <g transform={`translate(240,${800 + (1 - clap) * 420 + jolt * 6}) rotate(-7)`} opacity={clap}>
			<rect x={0} y={0} width={230} height={160} rx={6} fill="#1E1C1A" stroke="#6A625A" strokeWidth={3} />
			<g transform={`rotate(${-open * 24} 0 -6)`}><path d="M0,-6 L230,-6 L230,-38 L0,-38 Z" fill="#1E1C1A" />{Array.from({length: 6}, (_, i) => <path key={i} d={`M${i * 38 + 6},-36 l24,28`} stroke="#E8E2D6" strokeWidth={11} />)}</g>
			<text x={115} y={82} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={54} fill="#E8E2D6">古剑</text><text x={115} y={138} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={32} fill="#B8B0A4">1977</text></g>}
		<Pool id="p9p" x={960} y={640} rx={1100} ry={380} a={0.22} col="#FFC070" />
		<rect x={0} y={0} width={1500} height={320} fill="url(#p9dim)" opacity={seg(t, 57.6, 58.2)} />
		<Vignette id="p9" a={0.55} />
	</svg>; };
void B;
