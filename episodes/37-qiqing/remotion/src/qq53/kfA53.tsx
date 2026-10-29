import React from 'react';
import {W, H, rnd, lerp, cl} from '../qq50/kit50';
import {B, Pool} from '../qq50/styleB';
import {SealHollow} from '../qq51/master51';
import {Frame53, Sub53, Stamp53, Cam, lookAt, proj, poly, blobOn, mix, V3} from './parts53';
import {Sword3D, Blade3D, SwordPose} from './sword3d';
import {BladeMacro} from './macro53';
/* ep53 key frames, part A: the hook (frame 0 and 1.5 s). One continuous macro glide along an edge line:
   your wet cleaver (near, steel, rust blooming) → the same edge line continues as the bronze edge of the 越王勾践剑 (far,
   out of focus at frame 0; filling the frame by 1.5 s). World units: mm. The cleaver lies flat on the counter, its edge on
   y = 0, spine at y = −96, front end at x = 150; the sword lies on the same line beyond it, tip toward the knife. */

/* ---------- the cleaver ---------- */
const KF = 200, KS = -96, HX = -130;
const knifeTop = (): V3[] => { const pts: V3[] = [[0, KS + 4, 0], [4, KS, 0], [KF - 6, KS, 0], [KF, KS + 6, 0], [KF, -16, 0]];
	for (let i = 1; i <= 8; i++) { const a = (i / 8) * Math.PI / 2; pts.push([KF - 16 + 16 * Math.cos(a), -16 + 16 * Math.sin(a), 0]); }
	pts.push([2, 0, 0], [0, -4, 0]); return pts; };
/** rust spots on the steel: [x, y, r, birth 0..1] in clusters (spine, the hanging hole, the heel, a few blooms on the face, pitting on the bevel) */
const RUST: [number, number, number, number][] = (() => { const out: [number, number, number, number][] = [];
	const cl0: [number, number, number, number][] = [[168, -78, 16, 18], [120, -87, 13, 12], [70, -85, 14, 13], [24, -84, 12, 10], [12, -40, 16, 14], [92, -46, 10, 8], [146, -34, 8, 6], [40, -20, 9, 7], [178, -20, 7, 5], [110, -8, 5, 6], [60, -6, 5, 5], [16, -8, 5, 5]];
	cl0.forEach(([x, y, r, n], c) => { for (let i = 0; i < n; i++) { const a = rnd(c * 40 + i, 61) * 6.283, d = r * Math.sqrt(rnd(c * 40 + i, 62));
		out.push([x + d * Math.cos(a), y + d * Math.sin(a) * 0.9, (1.2 + 3.4 * rnd(c * 40 + i, 63)) * (1 - 0.45 * d / r), rnd(c * 40 + i, 64)]); } });
	return out; })();
const RUST_COL = ['#8A4620', '#A6582A', '#6A3518', '#B86A32', '#7A3E1C'];
export const Cleaver: React.FC<{c: Cam; rho: number}> = ({c, rho}) => {
	const top = poly(c, knifeTop()), p0 = proj(c, [0, -96, 0]), p1 = proj(c, [KF * 0.7, 0, 0]);
	const bevel = poly(c, [[2, -8, 0.05], [KF - 14, -8, 0.05], [KF - 6, -3, 0.05], [KF - 12, 0, 0.05], [2, 0, 0.05]]);
	const spine = poly(c, [[4, KS, 0.05], [KF - 6, KS, 0.05], [KF - 4, KS + 3, 0.05], [2, KS + 3, 0.05]]);
	const front = poly(c, [[KF, KS + 6, 0], [KF, -16, 0], [KF, -16, -3], [KF, KS + 6, -3]]);
	const spots = RUST.map(([x, y, r, b], i) => { const k = cl((rho - b * 0.7) / 0.3); if (k <= 0) return null; const d = blobOn(c, x, y, r * (0.4 + 0.6 * k), i, 0.08, 9, 0.7);
		return d ? <path key={i} d={d} fill={RUST_COL[i % 5]} opacity={0.55 + 0.4 * k * rnd(i, 66)} /> : null; });
	const beads: [number, number, number][] = [[64, -52, 5.2], [104, -28, 3.6], [140, -54, 4.4], [30, -40, 3.2], [118, -68, 2.6], [46, -62, 2.4], [170, -40, 2.8]];
	return <g>
		<defs><linearGradient id="kSt" gradientUnits="userSpaceOnUse" x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]}><stop offset="0" stopColor="#4C5052" /><stop offset="0.5" stopColor="#6E7274" /><stop offset="0.75" stopColor="#7E8283" /><stop offset="1" stopColor="#5A5E60" /></linearGradient>
			<radialGradient id="kHi" gradientUnits="userSpaceOnUse" cx={proj(c, [120, -50, 0])[0]} cy={proj(c, [120, -50, 0])[1]} r={260}><stop offset="0" stopColor="#E8ECEA" stopOpacity="0.16" /><stop offset="1" stopColor="#E8ECEA" stopOpacity="0" /></radialGradient>
			<filter id="kRs" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.1" /></filter>
			<clipPath id="kClip"><path d={top} /></clipPath></defs>
		<path d={poly(c, knifeTop().map(([x, y]) => [x + 3, y + 5, -3] as V3))} fill="#000" opacity={0.5} />
		<path d={front} fill="#2A2C2E" />
		<path d={top} fill="url(#kSt)" />
		{/* the under-cabinet light: a soft highlight running along the blade (it comes from the upper left) */}
		<g clipPath="url(#kClip)">
			<path d={top} fill="url(#kHi)" />
			<path d={bevel} fill="#A6AAA8" opacity={0.62} />
			<path d={spine} fill="#9A9E9C" opacity={0.5} />
			{/* faint grind marks along the bevel */}
			{Array.from({length: 14}, (_, i) => { const y = -7.5 + i * 0.5; return <path key={i} d={poly(c, [[4, y, 0.06], [KF - 12, y, 0.06]], false)} stroke="#E8ECEA" strokeOpacity={0.05 + 0.05 * rnd(i, 3)} strokeWidth={1} fill="none" />; })}
			<g filter="url(#kRs)">{spots}</g>
			{/* rust bleeds down from the hole (water ran there) */}
			<path d={blobOn(c, 168, -62, 7 * cl(rho * 1.4), 77, 0.09, 8, 0.6)} fill="#6E3818" opacity={0.6} />
		</g>
		{/* the hanging hole: the dark counter shows through */}
		<path d={poly(c, Array.from({length: 24}, (_, i) => { const a = i / 24 * 2 * Math.PI; return [172 + 8.5 * Math.cos(a), -78 + 8.5 * Math.sin(a), 0.1] as V3; }))} fill="#0E0A08" stroke="#2E3032" strokeWidth={1.5} />
		{/* the cutting edge: a bright hairline, the line the camera follows */}
		<path d={poly(c, [[2, -0.3, 0.1], [KF - 12, -0.3, 0.1]], false)} stroke="#F0F2F0" strokeWidth={2.2} strokeOpacity={0.75} fill="none" />
		{/* water beads (why it rusts) */}
		{beads.map(([x, y, r], i) => { const p = proj(c, [x, y, 0.2]), R = c.f * r / p[2], q = proj(c, [x - r * 0.3, y - r * 0.35, 0.5]);
			return <g key={`w${i}`}><ellipse cx={p[0]} cy={p[1]} rx={R} ry={R * 0.62} fill="#8A9294" opacity={0.55} /><ellipse cx={p[0] + R * 0.1} cy={p[1] + R * 0.2} rx={R * 0.8} ry={R * 0.4} fill="#2E3436" opacity={0.25} /><circle cx={q[0]} cy={q[1]} r={Math.max(1.2, R * 0.26)} fill="#F4F8F8" opacity={0.9} /></g>; })}
		{/* the handle: a steel bolster at the heel, then the wooden handle with two rivets (on the spine side) */}
		<Handle c={c} />
	</g>; };
const Handle: React.FC<{c: Cam}> = ({c}) => { const y0 = -88, y1 = -64, zc = 7, r = 12;
	/* a rounded wooden bar: draw the top as a quad + a darker near side */
	const top = poly(c, [[-8, y0, zc + r * 0.55], [HX, y0 + 1, zc + r * 0.5], [HX, y1 - 1, zc + r * 0.5], [-8, y1, zc + r * 0.55]]);
	const side = poly(c, [[-8, y1, zc + r * 0.55], [HX, y1 - 1, zc + r * 0.5], [HX, y1 + 1, zc - r * 0.4], [-8, y1 + 2, zc - r * 0.4]]);
	const bol = poly(c, [[2, y0 - 3, 0], [-10, y0 - 2, zc + r * 0.6], [-10, y1 + 2, zc + r * 0.6], [2, y1 + 3, 0]]);
	const p0 = proj(c, [-60, y0, zc + r]), p1 = proj(c, [-60, y1, zc]);
	return <g>
		<defs><linearGradient id="kWd" gradientUnits="userSpaceOnUse" x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]}><stop offset="0" stopColor="#5A3A26" /><stop offset="0.5" stopColor="#3E2618" /><stop offset="1" stopColor="#24160E" /></linearGradient></defs>
		<path d={poly(c, [[-8, y0 + 4, -2.9], [HX, y0 + 5, -2.9], [HX, y1 + 8, -2.9], [-8, y1 + 8, -2.9]])} fill="#000" opacity={0.45} />
		<path d={side} fill="#1E120C" />
		<path d={top} fill="url(#kWd)" />
		{Array.from({length: 5}, (_, i) => { const y = lerp(y0 + 3, y1 - 3, (i + 0.5) / 5); return <path key={i} d={poly(c, [[-12, y, zc + r * 0.56], [HX + 4, y + 0.6, zc + r * 0.51]], false)} stroke="#6A4630" strokeOpacity={0.35} strokeWidth={1} fill="none" />; })}
		{[-40, -96].map((x) => { const q = proj(c, [x, (y0 + y1) / 2, zc + r * 0.56]), R = c.f * 3.6 / q[2]; return <g key={x}><ellipse cx={q[0]} cy={q[1]} rx={R} ry={R * 0.6} fill="#8A8E8E" stroke="#2A2C2C" strokeWidth={1} /><ellipse cx={q[0] - R * 0.25} cy={q[1] - R * 0.2} rx={R * 0.35} ry={R * 0.2} fill="#E0E4E2" opacity={0.7} /></g>; })}
		<path d={bol} fill="#6A6E70" stroke="#2A2C2E" strokeWidth={1} />
	</g>; };

/* ---------- the kitchen: a wire drying rack on a dark stone counter, the tiled splashback behind (soft) ---------- */
export const Kitchen: React.FC<{c: Cam}> = ({c}) => {
	const counter = poly(c, [[-600, -900, -14], [KF + 520, -900, -14], [KF + 520, 500, -14], [-600, 500, -14]]), g0 = proj(c, [KF + 300, -40, -14]), g1 = proj(c, [KF - 60, -40, -14]);
	const wires = [-110, -55, 0, 55, 110, 165, 214];
	return <g>
		<defs><filter id="kBg" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="8" /></filter>
			<linearGradient id="kCt" gradientUnits="userSpaceOnUse" x1={g0[0]} y1={g0[1]} x2={g1[0]} y2={g1[1]}><stop offset="0" stopColor="#1E1511" stopOpacity="0" /><stop offset="0.55" stopColor="#1E1511" stopOpacity="0.85" /><stop offset="1" stopColor="#201813" stopOpacity="1" /></linearGradient></defs>
		{/* the splashback, far and soft: dark tiles and the warm strip of the under-cabinet light */}
		<g filter="url(#kBg)">
			<rect x={-40} y={-40} width={1100} height={560} fill="#1C130F" />
			<path d={Array.from({length: 12}, (_, i) => `M${-40 + i * 100},80 V520`).join(' ') + ' ' + [170, 270, 370, 470].map((y) => `M-40,${y} H1060`).join(' ')} stroke="#C8B89A" strokeOpacity={0.08} strokeWidth={3} />
			<rect x={-40} y={30} width={1100} height={16} fill="#FFE6C0" opacity={0.2} />
			<Pool id="kU" x={420} y={90} rx={720} ry={260} a={0.16} col="#FFE2B8" />
		</g>
		<path d={counter} fill="url(#kCt)" />
		{Array.from({length: 220}, (_, i) => { const q: V3 = [-500 + 700 * rnd(i, 1), -800 + 1200 * rnd(i, 2), -13.9], p = proj(c, q); if (p[2] < 8) return null;
			return <circle key={i} cx={p[0]} cy={p[1]} r={Math.max(0.6, c.f * 1.1 / p[2])} fill="#E8DCC8" opacity={0.04 + 0.06 * rnd(i, 4)} />; })}
		{/* the rack: dull chrome wires under the knife; it stops at the knife's front (beyond it, only dark) */}
		{[-118, 28].map((y, i) => <path key={`r${i}`} d={poly(c, [[-260, y, -9], [KF + 16, y, -9]], false)} stroke="#7E8282" strokeOpacity={0.35} strokeWidth={3} fill="none" />)}
		{wires.map((x) => { const a = poly(c, [[x, -150, -5], [x, 60, -5]], false); return <g key={x} opacity={x > KF - 20 ? 0.4 : 0.75}><path d={a} stroke="#0A0807" strokeOpacity={0.5} strokeWidth={6} fill="none" transform="translate(3,5)" />
			<path d={a} stroke="#5E6262" strokeWidth={3.2} fill="none" /><path d={poly(c, [[x, -150, -4.4], [x, 60, -4.4]], false)} stroke="#C8CCCC" strokeOpacity={0.25} strokeWidth={1.1} fill="none" /></g>; })}
	</g>; };

/** a four-point glint */
export const Glint: React.FC<{x: number; y: number; r: number; o?: number}> = ({x, y, r, o = 1}) => <g opacity={o}>
	<circle cx={x} cy={y} r={r * 0.9} fill="#FFE6B0" opacity={0.3} />
	<path d={`M${x},${y - r * 1.6} L${x + r * 0.12},${y - r * 0.12} L${x + r * 1.6},${y} L${x + r * 0.12},${y + r * 0.12} L${x},${y + r * 1.6} L${x - r * 0.12},${y + r * 0.12} L${x - r * 1.6},${y} L${x - r * 0.12},${y - r * 0.12} Z`} fill="#FFF8E6" />
	<circle cx={x} cy={y} r={r * 0.22} fill="#FFFFFF" /></g>;

/* ---------- H1 · frame 0: your cleaver on the rack (near), the bronze edge glinting on the same line (far, soft) ---------- */
export const SW_HOOK: SwordPose = {x0: 228 + 556, ya: -19, z0: -2.2, dir: -1};
export const CAM0 = lookAt([-60, 150, 190], [250, -40, 0], 1000, 900, 560);
export const KF01: React.FC = () => { const c = CAM0, tip = proj(c, [228, -19, 0]), mid = proj(c, [480, -19, 0]);
	return <Frame53 id="k1" sheen={0.1} vig={0.6} over={<><Sub53 id="H1" rows={1} /><Stamp53 y="2026" place="你家厨房" note="一把普通的菜刀" /><SealHollow /></>}>
		<defs><filter id="k1Far" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.6" /></filter>
			<filter id="k1Bok" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6" /></filter>
			<filter id="k1Nr" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3" /></filter></defs>
		<Kitchen c={c} />
		{/* beyond the knife's front the kitchen falls into lacquer black; a museum spot catches the bronze */}
		<Pool id="k1d" x={mid[0]} y={mid[1]} rx={560} ry={330} a={0.75} col="#080403" />
		<Pool id="k1s" x={mid[0] - 20} y={mid[1] + 10} rx={360} ry={200} a={0.34} col="#FFB868" />
		{/* it lies on polished lacquer: a soft warm reflection and a contact shadow under it */}
		<g filter="url(#k1Bok)"><path d={poly(c, [[240, -4, -2], [700, -2, -2], [700, -36, -2], [240, -34, -2]])} fill="#000" opacity={0.6} transform="translate(0,10)" />
			<path d={poly(c, [[240, -6, -2], [690, -4, -2], [690, -34, -2], [240, -32, -2]])} fill="#C88A3C" opacity={0.22} transform="translate(0,26)" /></g>
		<g filter="url(#k1Far)"><Sword3D c={c} sp={SW_HOOK} id="k1s" /></g>
		<g filter="url(#k1Bok)">{[[250, 0, 22, 0.34], [330, 0, 17, 0.28], [420, 0, 13, 0.24], [520, 0, 10, 0.2]].map(([x, y, r, o], i) => { const p = proj(c, [x, y, 2]); return <circle key={i} cx={p[0]} cy={p[1]} r={r} fill="#FFD890" opacity={o} />; })}</g>
		<Glint x={proj(c, [262, -1, 2])[0]} y={proj(c, [262, -1, 2])[1]} r={26} />
		<Cleaver c={c} rho={0.68} />
		{/* the nearest corner is soft (macro depth of field) */}
		<g filter="url(#k1Nr)" opacity={0.5}><path d={`M-40,${H - 70} L${tip[0] * 0.2},${H + 40} L-40,${H + 40} Z`} fill="#0A0605" /></g>
	</Frame53>; };

/* ---------- H1 · 1.5 s: the match is complete; the camera skims the bronze, the diamond lattice fills the frame ---------- */
export const KF02: React.FC = () => {
	const sp = {cam: {v: -4, z: 18, pitch: Math.atan(200 / 820), yaw: 3 * Math.PI / 180, f: 820, cx: 960, cy: 640, rot: -2.5}, hw: (u: number) => Math.min(24, 15.5 + 0.03 * u), fogD: 300, lightU: 90, uMax: 900, guardU: 470, seed: 3};
	return <Frame53 id="k2" sheen={0.25} vig={0.58} over={<><Sub53 id="H1" /><Stamp53 y="春秋末年" place="越" note="越王勾践剑" /><SealHollow /></>}>
		<BladeMacro sp={sp} id="k2" />
		{/* the case glass: one faint diagonal reflection streak across the top of the frame */}
		<path d="M820,-20 L1100,-20 L1720,420 L1440,420 Z" fill="#F4F8FA" opacity={0.03} />
		<path d="M1060,-20 L1088,-20 L1712,426 L1684,426 Z" fill="#F4F8FA" opacity={0.045} />
	</Frame53>; };
void B; void Blade3D;
