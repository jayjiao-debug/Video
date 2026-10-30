import React from 'react';
import {W, H, rnd, lerp, cl, seg} from '../qq50/kit50';
import {LacDefs, Lacquer, Vignette} from '../qq50/styleB';
import {BladeMacro, MacroCam, macroProj, macroZ} from './macro53';
import {BloomsS, BLOOM_T, bloomUV, RING_K} from './blooms53s';
import {SP11} from './kfF53';
import {HandoffMacro} from './handoff53';
import {frameOf} from './master53';
import {sstep} from './cam53';
import {Scrim} from './parts53';
/* ep53 · TakeD leg 13 (T1, T2: 75.162 → 81.954): the hand-off macro with the three blooms switching on (75.162, 75.728, 76.860;
   KF11's blooms, one find-ring each, ON the surface: blooms53s), the camera holding KF11's pose for the first 2 s and then easing
   back; the blooms become specks as the camera pulls out, next to a thin scale bar drawn ON the blade; then Match 4: the first bloom's find-ring widens into the round mouth of the
   sheath (a portal that shows the tomb world, leg 14) as the zoom pulls out. */
export {BLOOM_T};
const CAM11 = SP11.cam;
const zf = macroZ(SP11);
export const macroCam = (t: number): MacroCam => { const s = sstep(seg(t, 77.2, 81.2)), d = sstep(seg(t, 75.2, 77.2));
	return {...CAM11, z: CAM11.z + 0.25 * d + 17 * s, pitch: CAM11.pitch + 7 * Math.PI / 180 * s, cy: CAM11.cy - 70 * s, f: CAM11.f + 30 * s}; };
/** the blooms on the blade (blooms53s: anchored to lattice cells, projected through the lattice's camera, fogged like it).
    shrink is kept for the callers but no longer changes them: they get small because the camera pulls out. */
export const BloomsD: React.FC<{m: MacroCam; t: number; shrink?: number; ringK?: number}> = ({m, t, ringK = 1}) => <BloomsS m={m} sp={{...SP11, cam: m}} t={t} ringK={ringK} />;
/** a thin scale bar lying on the blade next to the third bloom (no number: it only says how small these are) */
const ScaleBar: React.FC<{m: MacroCam; o: number}> = ({m, o}) => { if (o <= 0) return null;
	const u0 = 44, v = -9.5, L = 4.0, a = macroProj(m, u0, v, zf(u0, v) + 0.06), b = macroProj(m, u0 + L, v, zf(u0 + L, v) + 0.06), tk = (p: number[]) => macroProj(m, p[0], p[1], zf(p[0], p[1]) + 0.06);
	const t0 = tk([u0, v - 0.5]), t1 = tk([u0, v + 0.5]), t2 = tk([u0 + L, v - 0.5]), t3 = tk([u0 + L, v + 0.5]);
	const d = `M${a[0]},${a[1]} L${b[0]},${b[1]} M${t0[0]},${t0[1]} L${t1[0]},${t1[1]} M${t2[0]},${t2[1]} L${t3[0]},${t3[1]}`;
	return <g opacity={o}><path d={d} fill="none" stroke="#120804" strokeWidth={5} strokeOpacity={0.5} strokeLinecap="round" /><path d={d} fill="none" stroke="#F2E6CC" strokeWidth={2.4} strokeOpacity={0.9} strokeLinecap="round" /></g>; };

export const MACRO_END = 81.954;
export const PORTAL_T: [number, number] = [80.3, MACRO_END];
/** the screen ellipse of the first bloom's find-ring (rx, ry from the surface projection) */
export const ringEllipse = (m: MacroCam, shrink: number) => { void shrink; const [u, v, r0] = bloomUV(0), rr = r0 * RING_K, c = macroProj(m, u, v, zf(u, v)), a = macroProj(m, u, v - rr, zf(u, v - rr)), b = macroProj(m, u, v + rr, zf(u, v + rr)), p = macroProj(m, u - rr, v, zf(u - rr, v)), q = macroProj(m, u + rr, v, zf(u + rr, v));
	const rot = -3 * Math.PI / 180, ctr = (x: number, y: number): [number, number] => [960 + (x - 960) * Math.cos(rot) - (y - 540) * Math.sin(rot), 540 + (x - 960) * Math.sin(rot) + (y - 540) * Math.cos(rot)];
	const cc = ctr(c[0], c[1]);
	return {cx: cc[0], cy: cc[1], rx: Math.abs(b[0] - a[0]) / 2 + 3, ry: Math.abs(q[1] - p[1]) / 2 + 3}; };
/** the macro picture at time t (T1 … T2); `portal` is the tomb world to show inside the growing ring */
export const MacroLeg: React.FC<{t: number; world?: (shift: [number, number]) => React.ReactNode}> = ({t, world}) => { const m = macroCam(t), shrink = sstep(seg(t, 78.2, 80.4));
	const f0 = frameOf(75.162);
	/* the first frame of TakeD is HandoffMacro plus bloom 1 only; the warm-grey veil (a shade duller) comes in over the next 0.5 s */
	if (frameOf(t) <= f0) return <HandoffMacro blooms={<BloomsD m={CAM11} t={t} />} />;
	const sbo = sstep(seg(t, 78.3, 79.0)) * (1 - sstep(seg(t, 80.6, 81.2)));
	const u = seg(t, PORTAL_T[0], PORTAL_T[1]), re = ringEllipse(m, shrink), R0 = Math.max(re.rx, re.ry);
	const ge = Math.pow(sstep(seg(t, 80.55, MACRO_END)), 1.2), G0 = 0.62, G = G0 * Math.exp(Math.log(2600 / (G0 * R0)) * ge), wa = sstep(seg(t, 80.5, 81.0)), mv = sstep(u), zin = Math.exp(Math.log(3.2) * (1 - mv));
	const rx = re.rx * G, ry = re.ry * G, sx = (re.cx - 960) * (1 - mv), sy = (re.cy - 540) * (1 - mv);
	const sp = {...SP11, cam: m};
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		<LacDefs /><Lacquer sheen={0.06} id="d13" />
		<BladeMacro sp={sp} id="d13"><BloomsD m={m} t={t} shrink={shrink} /><ScaleBar m={m} o={sbo} /></BladeMacro>
		<rect x={0} y={340} width={W} height={H - 340} fill="#4A4234" opacity={0.07 * sstep(seg(t, 75.162, 75.7))} />
		<Vignette id="d13" a={0.66} />
		{u > 0 && world && <>
			<defs><filter id="d13f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={lerp(34, 70, ge)} /></filter>
				<mask id="d13p" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}><rect width={W} height={H} fill="#000" /><ellipse cx={re.cx} cy={re.cy} rx={rx * 0.86} ry={ry * 0.86} fill="#fff" opacity={wa} filter="url(#d13f)" /></mask></defs>
			<g mask="url(#d13p)"><Lacquer sheen={0.08} id="d14" /><g transform={`translate(${960 + sx},${540 + sy}) scale(${zin}) translate(-960,-540)`}>{world([sx, sy])}</g></g>
			<g opacity={wa * ge}><Scrim id="d-sub" x={640} y={212} rx={760} ry={170} a={0.5} /></g>
			<Vignette id="d13w" a={0.6 * wa * mv} />
			<ellipse cx={re.cx} cy={re.cy} rx={rx * 0.86} ry={ry * 0.86} fill="none" stroke="#F4D088" strokeWidth={3} strokeOpacity={0.9 * wa} />
		</>}
	</svg>; };
void cl; void rnd; void macroProj;
