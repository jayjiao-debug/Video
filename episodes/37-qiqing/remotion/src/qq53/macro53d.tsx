import React from 'react';
import {W, H, rnd, lerp, cl, seg} from '../qq50/kit50';
import {LacDefs, Lacquer, Vignette} from '../qq50/styleB';
import {BladeMacro, MacroCam, macroProj} from './macro53';
import {SP11} from './kfF53';
import {HandoffMacro} from './handoff53';
import {frameOf} from './master53';
import {sstep} from './cam53';
import {Scrim} from './parts53';
/* ep53 · TakeD leg 13 (T1, T2: 75.162 → 81.954): the hand-off macro with the three blooms switching on (75.162, 75.728, 76.860;
   KF11's blooms, one find-ring each), the camera holding KF11's pose for the first 2 s and then easing back; the blooms shrink to
   specks next to a thin scale bar drawn ON the blade; then Match 4: the first bloom's find-ring widens into the round mouth of the
   sheath (a portal that shows the tomb world, leg 14) as the zoom pulls out. */
export const BLOOM_T = [75.162, 75.728, 76.860];
const CAM11 = SP11.cam;
const RID = 5, ST = 2.2;
const hw = SP11.hw;
const zf = (u: number, v: number) => { const h = hw(u), a = Math.min(1, Math.abs(v) / h); return RID * Math.pow(1 - a, 1.12) - (Math.abs(v) > h - ST ? 0.9 * (Math.abs(v) - (h - ST)) / ST : 0); };
export const macroCam = (t: number): MacroCam => { const s = sstep(seg(t, 77.2, 81.2)), d = sstep(seg(t, 75.2, 77.2));
	return {...CAM11, z: CAM11.z + 0.25 * d + 17 * s, pitch: CAM11.pitch + 7 * Math.PI / 180 * s, cy: CAM11.cy - 70 * s, f: CAM11.f + 30 * s}; };
const blobM = (m: MacroCam, u: number, v: number, r: number, seed: number, rough = 0.5, n = 11, dz = 0) => {
	const pts = Array.from({length: n}, (_, i) => { const a = (i / n) * 2 * Math.PI, rr = r * (1 - rough / 2 + rough * rnd(seed * 31 + i, 5)), uu = u + rr * Math.cos(a), vv = v + rr * Math.sin(a) * 0.8; return macroProj(m, uu, vv, zf(uu, vv) + 0.02 + dz); });
	let d = ''; for (let i = 0; i < n; i++) { const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], m0 = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], m1 = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
		d += (i === 0 ? `M${m0[0].toFixed(1)},${m0[1].toFixed(1)}` : '') + `Q${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${m1[0].toFixed(1)},${m1[1].toFixed(1)}`; }
	return d + 'Z'; };
const ringM = (m: MacroCam, u: number, v: number, r: number) => 'M' + Array.from({length: 48}, (_, i) => { const a = (i / 48) * 2 * Math.PI, uu = u + r * Math.cos(a), vv = v + r * Math.sin(a); const p = macroProj(m, uu, vv, zf(uu, vv) + 0.05); return `${p[0].toFixed(1)},${p[1].toFixed(1)}`; }).join('L') + 'Z';
const BLOOMS: [number, number, number][] = [[22, 7.2, 2.75], [37, -6.6, 2.6], [52, 1.4, 3.3]];
/** the blooms on the blade: bloom i is there from the frame of BLOOM_T[i]; shrink 0..1 turns them into specks; ping = the faint ring that leaves each find-ring once */
export const BloomsD: React.FC<{m: MacroCam; t: number; shrink?: number; ringK?: number}> = ({m, t, shrink = 0, ringK = 1}) => { const f = frameOf(t);
	const dull = [[22, 6, 4.2], [37, -5.5, 3.6], [52, 1, 4], [30, 12, 3]];
	return <g>
		<defs><filter id="d13d" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" /></filter>
			<filter id="d13s" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="0.7" /></filter>
			<filter id="d13h" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="22" /></filter></defs>
		<g filter="url(#d13d)">{dull.map(([u, v, r], i) => <path key={i} d={blobM(m, u, v, r, 40 + i, 0.6)} fill="#5A5242" opacity={0.26} />)}</g>
		{BLOOMS.map(([u, v, r0], i) => { if (f < frameOf(BLOOM_T[i])) return null;
			const r = r0 * lerp(1, 0.6, shrink), h = 0.32 * r, rr = r0 * 3.1 * lerp(1, 0.72, shrink * ringK), age = t - BLOOM_T[i], ping = age < 0.6 && age > 0.01 ? age / 0.6 : -1, pulse = age >= 0 && age < 1.2 ? 1 + 0.12 * Math.sin(Math.PI * age / 1.2) : 1;
			return <g key={i}>
				<g filter="url(#d13h)"><path d={blobM(m, u, v, r * 2.7, 60 + i, 0.5)} fill="#6E7E46" opacity={0.4} /></g>
				<g filter="url(#d13s)">
					<path d={blobM(m, u, v, r * 1.6 * pulse, 10 + i, 0.7)} fill="#7A5434" opacity={0.3} />
					<path d={blobM(m, u, v, r * 1.12 * pulse, 20 + i, 0.5)} fill="#7A5434" />
					<path d={blobM(m, u, v, r * pulse, 20 + i, 0.55)} fill="#4E5E38" stroke="#7A5434" strokeWidth={4} />
					<path d={blobM(m, u + r * 0.1, v - r * 0.05, r * 0.72, 30 + i, 0.5, 11, h)} fill="#6E7E46" />
					<path d={blobM(m, u + r * 0.2, v - r * 0.15, r * 0.3, 50 + i, 0.4, 9, h * 1.1)} fill="#9AA668" opacity={0.85} />
					{Array.from({length: 8}, (_, k) => { const a = rnd(i * 9 + k, 3) * 6.28, d = r * (1.45 + 0.9 * rnd(i * 9 + k, 4)), uu = u + d * Math.cos(a), vv = v + d * Math.sin(a), p = macroProj(m, uu, vv, zf(uu, vv)); return <circle key={k} cx={p[0]} cy={p[1]} r={(3 + 3 * rnd(i * 9 + k, 5)) * lerp(1, 0.6, shrink)} fill="#55663E" opacity={0.75} />; })}
				</g>
				<path d={ringM(m, u, v, rr)} fill="none" stroke="#120804" strokeWidth={8} strokeOpacity={0.4} strokeDasharray="40 12" />
				<path d={ringM(m, u, v, rr)} fill="none" stroke="#FFF2D8" strokeWidth={4.2} strokeOpacity={0.92} strokeDasharray="40 12" />
				{ping > 0 && <path d={ringM(m, u, v, rr * (1 + 0.5 * ping))} fill="none" stroke="#FFF2D8" strokeWidth={3} strokeOpacity={0.5 * (1 - ping)} />}
			</g>; })}
	</g>; };
/** a thin scale bar lying on the blade next to the third bloom (no number: it only says how small these are) */
const ScaleBar: React.FC<{m: MacroCam; o: number}> = ({m, o}) => { if (o <= 0) return null;
	const u0 = 44, v = -9.5, L = 4.0, a = macroProj(m, u0, v, zf(u0, v) + 0.06), b = macroProj(m, u0 + L, v, zf(u0 + L, v) + 0.06), tk = (p: number[]) => macroProj(m, p[0], p[1], zf(p[0], p[1]) + 0.06);
	const t0 = tk([u0, v - 0.5]), t1 = tk([u0, v + 0.5]), t2 = tk([u0 + L, v - 0.5]), t3 = tk([u0 + L, v + 0.5]);
	const d = `M${a[0]},${a[1]} L${b[0]},${b[1]} M${t0[0]},${t0[1]} L${t1[0]},${t1[1]} M${t2[0]},${t2[1]} L${t3[0]},${t3[1]}`;
	return <g opacity={o}><path d={d} fill="none" stroke="#120804" strokeWidth={5} strokeOpacity={0.5} strokeLinecap="round" /><path d={d} fill="none" stroke="#F2E6CC" strokeWidth={2.4} strokeOpacity={0.9} strokeLinecap="round" /></g>; };

export const MACRO_END = 81.954;
export const PORTAL_T: [number, number] = [80.3, MACRO_END];
/** the screen ellipse of the first bloom's find-ring (rx, ry from the surface projection) */
export const ringEllipse = (m: MacroCam, shrink: number) => { const [u, v, r0] = BLOOMS[0], rr = r0 * 3.1 * lerp(1, 0.72, shrink), c = macroProj(m, u, v, zf(u, v)), a = macroProj(m, u, v - rr, zf(u, v - rr)), b = macroProj(m, u, v + rr, zf(u, v + rr)), p = macroProj(m, u - rr, v, zf(u - rr, v)), q = macroProj(m, u + rr, v, zf(u + rr, v));
	const rot = -3 * Math.PI / 180, ctr = (x: number, y: number): [number, number] => [960 + (x - 960) * Math.cos(rot) - (y - 540) * Math.sin(rot), 540 + (x - 960) * Math.sin(rot) + (y - 540) * Math.cos(rot)];
	const cc = ctr(c[0], c[1]);
	return {cx: cc[0], cy: cc[1], rx: Math.abs(b[0] - a[0]) / 2 + 3, ry: Math.abs(q[1] - p[1]) / 2 + 3}; };
/** the macro picture at time t (T1 … T2); `portal` is the tomb world to show inside the growing ring */
export const MacroLeg: React.FC<{t: number; world?: (shift: [number, number]) => React.ReactNode}> = ({t, world}) => { const m = macroCam(t), shrink = sstep(seg(t, 78.2, 80.4));
	const f0 = frameOf(75.162);
	if (frameOf(t) <= f0) return <HandoffMacro blooms={<BloomsD m={CAM11} t={t} />} veil={1} />;
	const sbo = sstep(seg(t, 78.3, 79.0)) * (1 - sstep(seg(t, 80.6, 81.2)));
	const u = seg(t, PORTAL_T[0], PORTAL_T[1]), re = ringEllipse(m, shrink), R0 = Math.max(re.rx, re.ry);
	const ge = Math.pow(sstep(seg(t, 80.55, MACRO_END)), 1.2), G0 = 0.62, G = G0 * Math.exp(Math.log(2600 / (G0 * R0)) * ge), wa = sstep(seg(t, 80.5, 81.0)), mv = sstep(u), zin = Math.exp(Math.log(3.2) * (1 - mv));
	const rx = re.rx * G, ry = re.ry * G, sx = (re.cx - 960) * (1 - mv), sy = (re.cy - 540) * (1 - mv);
	const sp = {...SP11, cam: m};
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		<LacDefs /><Lacquer sheen={0.06} id="d13" />
		<BladeMacro sp={sp} id="d13"><BloomsD m={m} t={t} shrink={shrink} /><ScaleBar m={m} o={sbo} /></BladeMacro>
		<rect x={0} y={340} width={W} height={H - 340} fill="#4A4234" opacity={0.07} />
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
void cl;
