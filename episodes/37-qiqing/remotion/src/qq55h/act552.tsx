import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Zun, lookAt, Cam, V3, ZunLight, proj, toCam, Rz, rho, rnd as zrnd, pseudoGlyph as zPseudoGlyph} from './zun55h';
import {FilmOv2} from './ov55v2';
import {card2} from './cards55v2';
import {Glow, Plume, Vig, sm, tube, ik, sleeve, mitten, rnd, P, f1, shard} from './kf55h';
import {Sil, Sk, Body} from './rig55h';
import {Glyphs55, GLYPH_STROKES, CowrieString, poseFK, crSample, armFK} from './act551k';
/* ep55 何尊 v2 · act 2 (builder 2): cards G H I J K L M, film 42.20 → 73.90 — the casting and "why you look like this".
   G  night foundry yard: 何 hands the strings of cowries to the master caster; he gestures, the camera pans past them to the
      clay model of the 尊 on the bench (「就是你」).
   H  macro top-down on the clay: a bone stylus cuts a column; 宅 兹 中 或 fly down one per beat; the camera rises to the 12 columns.
   I  low and close: the crucible tips, bronze runs into the pouring cup, sparks and steam, the glow runs down the mould seams.
   J  hammers crack the mould on the beats, the halves fall away, the golden 尊 stands in steam, the caster steps back, push in.
   K  macro slide across the belly in raking light (a dedicated relief drawing of the belly, not the enlarged model): eye, horn.
   L  front-on to the face; gold lines trace eyes, brows, nose, horns, jaws: a head with no body.
   M  crane to straight top-down: the mouth traced as a circle, the foot as a square, the four flange beaks light one per beat.
      Last frame = M_END (mouth circle centred (960, 560), 520 px across) for builder 3's match cut. */
const W = 1920, H = 1080, D2R = Math.PI / 180;
const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const ease = (u: number) => u * u * (3 - 2 * u);
const eio = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const eout = (u: number) => 1 - Math.pow(1 - u, 3);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const lerpP = (a: P, b: P, u: number): P => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const BEAT = 0.56604;
const beatPh = (t: number) => (((t - 1.4498) / BEAT) % 1 + 1) % 1;
type RGB = [number, number, number];
const mixc = (a: RGB, b: RGB, u: number): RGB => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const rgb = (c: RGB) => `rgb(${Math.round(cl(c[0], 0, 255))},${Math.round(cl(c[1], 0, 255))},${Math.round(cl(c[2], 0, 255))})`;
const hexc = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const nrm = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const flick = (t: number, s: number) => 0.84 + 0.1 * Math.sin(t * 7.3 + s) + 0.06 * Math.sin(t * 17.1 + s * 2.3);
const dP = (pts: P[], close = false) => 'M' + pts.map((q) => `${f1(q[0])},${f1(q[1])}`).join('L') + (close ? 'Z' : '');

/* ============================== cameras ============================== */
const camAt = (az: number, el: number, D: number, T: V3, f: number, cx: number, cy: number): Cam => { const a = az * D2R, e = el * D2R;
	return lookAt([T[0] + D * Math.cos(e) * Math.cos(a), T[1] + D * Math.cos(e) * Math.sin(a), T[2] + D * Math.sin(e)], T, f, cx, cy); };
/** a camera that puts the model's base centre at (bx, by) with k px / cm at the target height */
const camPlace = (az: number, el: number, D: number, k: number, bx: number, by: number, tz = 19.4): Cam => { const c0 = camAt(az, el, D, [0, 0, tz], k * D, 0, 0), b = proj(c0, [0, 0, 0]);
	return {...c0, cx: bx - b[0], cy: by - b[1]}; };
/** builder 3's match cut: the last frame of M. Straight top-down, the flanges on the diagonals, the mouth circle (lip r 14.3 cm at
    z 38.8) centred at (960, 560), 520 px across. */
export const M_END = {az: 45, el: 90, D: 140, T: [0, 0, 38.8] as V3, f: 2542, cx: 960, cy: 560};
export const mEndCam = (): Cam => camAt(M_END.az, M_END.el, M_END.D, M_END.T, M_END.f, M_END.cx, M_END.cy);
/** a 2.5D set layer at depth d (1 = the action plane): the camera pans (x, y px at d = 1) and dollies in by z (d units) */
type C2 = {x: number; y: number; z: number};
const lay = (d: number, c: C2, ox = 960, oy = 540) => { const m = d / Math.max(0.05, d - c.z);
	return `translate(${f1(ox)},${f1(oy)}) scale(${m.toFixed(4)}) translate(${f1(-ox - c.x / d)},${f1(-oy - c.y / d)})`; };

/* ============================== people: rig55h's body, plus a craftsman's knee-length tunic and topknot ============================== */
type Dress2 = 'robe' | 'tunic';
type Hat2 = 'guan' | 'knot';
const addP = (a: P, b: P, k = 1): P => [a[0] + b[0] * k, a[1] + b[1] * k];
const subP = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]];
const lenP = (a: P) => Math.hypot(a[0], a[1]) || 1;
const nzP = (a: P): P => { const l = lenP(a); return [a[0] / l, a[1] / l]; };
const hull2 = (pts: P[]): P[] => { const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]); if (p.length < 3) return p;
	const cr = (o: P, a: P, b: P) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
	const lo: P[] = []; for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
	const up: P[] = []; for (const q of [...p].reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
	return [...lo.slice(0, -1), ...up.slice(0, -1)]; };
const elbow2 = (s: P, h: P, up = false): P => { if (!up) return ik(s, h, 30, 28); const e = ik([s[0], -s[1]], [h[0], -h[1]], 30, 28); return [e[0], -e[1]]; };
const foot2 = (a: P, d: number) => sm([[a[0] - d * 6, a[1] - 5], [a[0] + d * 13, a[1] - 2], [a[0] + d * 17, a[1] + 4], [a[0] + d * 15, a[1] + 6], [a[0] - d * 7, a[1] + 6]]);
const rotAt2 = (hd: P, tilt: number) => (x: number, y: number): P => { const a = tilt * D2R; return [hd[0] + x * Math.cos(a) - y * Math.sin(a), hd[1] + x * Math.sin(a) + y * Math.cos(a)]; };
const drape2 = (e: P, h: P, D: number) => { const m = lerpP(e, h, 0.55), lo = Math.max(e[1], h[1]);
	return sm([addP(e, [0, -3]), addP(h, [-2, -4]), addP(h, [1, 6]), [h[0] - 4, lo + D * 0.75], [m[0] - 2, lo + D], [e[0] + 2, Math.max(e[1] + 6, lo + D * 0.55)], addP(e, [-4, 4])]); };
const Body2: React.FC<{s: Sk; dress: Dress2; hat: Hat2}> = ({s, dress, hat}) => {
	const sp = nzP(subP(s.sh, s.hip)), n: P = [-sp[1], sp[0]], L = lenP(subP(s.sh, s.hip)), robe = dress === 'robe';
	const shF = addP(addP(s.sh, n, -1.5), sp, -1);
	const eN = s.eN ?? elbow2(s.sh, s.hN, s.elbowUpN), eF = s.eF ?? elbow2(shF, s.hF, s.elbowUpF);
	const torso = sm([addP(s.hip, n, -11), addP(addP(s.hip, sp, L * 0.5), n, -10.5), addP(addP(s.sh, n, -10), sp, -1), addP(s.sh, sp, 5), addP(s.sh, n, 10),
		addP(addP(s.hip, sp, L * 0.66), n, 12.5), addP(s.hip, n, 11.5), addP(addP(s.hip, n, 9), sp, -6), addP(addP(s.hip, n, -9), sp, -6)]);
	const leg = (k: P, f: P, d: number, key: string) => <g key={key}><path d={tube(s.hip, k, 9, 7)} /><path d={tube(k, f, 6.6, 4.8)} /><path d={foot2(f, d)} /></g>;
	const arm = (sh: P, e: P, h: P, key: string) => <g key={key}><path d={sleeve(sh, e, h, robe ? 6.4 : 5.8, robe ? 5.4 : 4.8, robe ? 4.8 : 4.2)} /><path d={mitten(e, h)} />
		{robe && <path d={drape2(e, h, 26)} />}</g>;
	let dressEl: React.ReactNode;
	if (robe) { const pts: P[] = [addP(s.sh, n, -11), addP(s.sh, n, 11), addP(s.sh, sp, 4), addP(s.hip, n, -13), addP(s.hip, n, 13)];
		for (const k of [s.kN, s.kF]) pts.push(addP(k, [-9, 0]), addP(k, [9, 0]), addP(k, [0, -6]));
		for (const f of [s.fN, s.fF]) pts.push(addP(f, [-11, 6]), addP(f, [11, 6]), addP(f, [0, -8]));
		dressEl = <path d={sm(hull2(pts))} />; }
	else { const pts: P[] = [addP(s.sh, n, -11), addP(s.sh, n, 11), addP(s.sh, sp, 4), addP(s.hip, n, -13.5), addP(s.hip, n, 13.5)];
		for (const k of [s.kN, s.kF]) pts.push(addP(k, [-10, 3]), addP(k, [10, 3]), addP(k, [0, 6]));
		dressEl = <path d={sm(hull2(pts))} />; }
	const tilt = s.tilt ?? 0, R = rotAt2(s.hd, tilt);
	const head = <path d={sm(([[-10, -2], [-7, -12], [3, -14], [10, -7], [12, 1], [9, 9], [2, 12], [-7, 8]] as P[]).map(([x, y]) => R(x, y)))} />;
	const hatEl = hat === 'guan' ? <><path d={sm([R(-7, -10), R(-6, -22), R(1, -25), R(5, -21), R(4, -13)])} /><path d={sm([R(-11, -19.5), R(8, -21), R(8, -19), R(-11, -17.5)])} /></>
		: <><path d={sm([R(-4, -12), R(-3, -20), R(3, -22), R(6, -15)])} /><path d={sm([R(-10.5, -6), R(10.5, -8.5), R(10.8, -5.6), R(-10.5, -3)])} /></>;
	const neck = <path d={tube(addP(addP(s.sh, sp, 1), n, 2), addP(s.hd, [0, 7]), 5.4, 5)} />;
	return <g>{arm(shF, eF, s.hF, 'aF')}{leg(s.kF, s.fF, s.toeF ?? 1, 'lF')}{!robe && leg(s.kN, s.fN, s.toeN ?? 1, 'lN')}{dressEl}<path d={torso} />
		{robe && leg(s.kN, s.fN, s.toeN ?? 1, 'lN')}{neck}{head}{hatEl}{arm(s.sh, eN, s.hN, 'aN')}</g>; };
/** body-local cm → screen for a figure placed with its feet at (x, y), k px/cm */
const toScr = (q: P, x: number, y: number, k: number, flip = false): P => [x + (flip ? -k : k) * q[0], y + k * q[1]];

/* ============================== small set pieces ============================== */
/** deterministic sparks from (x, y): birth times spread over [t0, t1], each a ballistic streak */
const Sparks: React.FC<{t: number; x: number; y: number; t0: number; t1: number; n: number; seed: number; sp?: number; g?: number; life?: number; dir?: number; spread?: number; w?: number; c1?: string; c2?: string}> =
	({t, x, y, t0, t1, n, seed, sp = 420, g = 900, life = 0.7, dir = -90, spread = 140, w = 2.4, c1 = '#FFF2C0', c2 = '#FF9A30'}) => <g>
	{Array.from({length: n}, (_, i) => { const tb = t0 + (t1 - t0) * ((i + rnd(i, seed)) / n), age = t - tb, lf = life * (0.5 + 0.7 * rnd(i, seed + 1)); if (age < 0 || age > lf) return null;
		const a = (dir + (rnd(i, seed + 2) - 0.5) * spread) * D2R, v = sp * (0.35 + 0.9 * rnd(i, seed + 3)), vx = Math.cos(a) * v, vy = Math.sin(a) * v;
		const px = x + vx * age, py = y + vy * age + 0.5 * g * age * age, qx = px - vx * 0.035, qy = py - (vy + g * age) * 0.035, o = 1 - age / lf;
		return <path key={i} d={`M${f1(px)},${f1(py)} L${f1(qx)},${f1(qy)}`} stroke={o > 0.55 ? c1 : c2} strokeWidth={w * (0.6 + 0.6 * rnd(i, seed + 4))} strokeLinecap="round" opacity={o} />; })}</g>;
/** embers drifting up through the frame (screen space) */
const Embers: React.FC<{t: number; n: number; x0: number; x1: number; y0: number; y1: number; seed: number; v?: number; o?: number; r?: number; c?: string}> = ({t, n, x0, x1, y0, y1, seed, v = 60, o = 0.7, r = 2.6, c = '#FFB050'}) => <g>
	{Array.from({length: n}, (_, i) => { const h = y1 - y0, sp = v * (0.6 + 0.8 * rnd(i, seed + 5)), y = y1 - ((rnd(i, seed + 1) * h + t * sp) % h), x = x0 + rnd(i, seed) * (x1 - x0) + Math.sin(t * (0.8 + rnd(i, seed + 6)) + i) * 16;
		const tw = 0.55 + 0.45 * Math.sin(t * (5 + 4 * rnd(i, seed + 7)) + i * 3);
		return <circle key={i} cx={f1(x)} cy={f1(y)} r={(0.6 + rnd(i, seed + 2) * r).toFixed(2)} fill={c} opacity={(o * (0.3 + 0.7 * rnd(i, seed + 3)) * tw).toFixed(3)} />; })}</g>;
/** a soft steam puff field rising from (x, y): blurred blobs that grow and fade (one filter for all) */
const Steam: React.FC<{t: number; x: number; y: number; w: number; h: number; n: number; seed: number; id: string; o?: number; c?: string; v?: number; blur?: number; r0?: number}> = ({t, x, y, w, h, n, seed, id, o = 0.3, c = '#F2E2CC', v = 0.45, blur = 18, r0 = 40}) => <g>
	<defs><filter id={id} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={blur} /></filter></defs>
	<g filter={`url(#${id})`}>{Array.from({length: n}, (_, i) => { const ph = ((t * v * (0.7 + 0.6 * rnd(i, seed + 1)) + rnd(i, seed)) % 1), yy = y - ph * h, xx = x + (rnd(i, seed + 2) - 0.5) * w + Math.sin(t * 0.9 + i * 1.7) * w * 0.12 + ph * w * 0.25 * (rnd(i, seed + 3) - 0.3);
		const rr = r0 * (0.6 + 0.5 * rnd(i, seed + 4)) * (0.5 + 1.4 * ph), oo = o * Math.sin(Math.PI * ph) * (0.6 + 0.4 * rnd(i, seed + 5));
		return <circle key={i} cx={f1(xx)} cy={f1(yy)} r={f1(rr)} fill={c} opacity={oo.toFixed(3)} />; })}</g></g>;
/** a little clay oil lamp with a flickering flame (base centre x, y, size s px per cm) */
const Lamp: React.FC<{x: number; y: number; s: number; t: number; id: string}> = ({x, y, s, t, id}) => { const fl = flick(t, 3), sx = 1 + 0.08 * Math.sin(t * 13.1), sy = 0.9 + 0.2 * fl;
	return <g transform={`translate(${f1(x)},${f1(y)}) scale(${s})`}>
		<Glow x={0} y={-9} r={46} c="#FFB060" o={0.5 * fl} id={`${id}g`} />
		<path d="M-7,0 C-8,-3 -6,-5 0,-5 C6,-5 8,-3 7,0 Z" fill="#3A2216" /><path d="M-7,-4.5 L7,-4.5" stroke="#FFB070" strokeWidth={0.6} opacity={0.7} />
		<path d="M5,-5 L9,-6.5 L8.6,-5 Z" fill="#3A2216" />
		<g transform={`translate(8.6,-6.4) scale(${sx.toFixed(3)},${sy.toFixed(3)})`}><path d="M0,0 C-1.8,-1.5 -1.4,-4 0,-6.5 C1.4,-4 1.8,-1.5 0,0 Z" fill="#FFD27A" /><path d="M0,-0.4 C-0.8,-1.2 -0.6,-2.6 0,-3.6 C0.6,-2.6 0.8,-1.2 0,-0.4 Z" fill="#FFF6D8" /></g>
	</g>; };

/* ============================== the night foundry yard (wide backdrop, x −400 … 2700) ============================== */
const YardNight: React.FC<{t: number; id: string; fx?: number; fire?: number}> = ({t, id, fx = 1600, fire = 1}) => {
	const puff = Math.exp(-beatPh(t) * 3.2), fl = flick(t, 1) * (0.6 + 0.55 * puff) * fire;
	const fy = 860, ft = 430;
	return <>
		<defs><linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#05060B" /><stop offset="0.5" stopColor="#0C0B12" /><stop offset="0.8" stopColor="#1E1210" /><stop offset="1" stopColor="#2A1810" /></linearGradient>
			<linearGradient id={`${id}gnd`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#24170F" /><stop offset="1" stopColor="#0B0705" /></linearGradient></defs>
		<rect x={-600} y={-400} width={3600} height={1300} fill={`url(#${id}sky)`} />
		{Array.from({length: 46}, (_, i) => <circle key={i} cx={-400 + rnd(i, 81) * 3000} cy={-200 + rnd(i, 82) * 620} r={0.6 + rnd(i, 83) * 1.3} fill="#D8DCF0" opacity={0.25 + 0.35 * rnd(i, 84)} />)}
		{/* far: a long rammed-earth wall with a thatched shed on the left and one on the right */}
		<path d={sm([[-600, 600], [-200, 594], [400, 600], [1100, 592], [1800, 598], [2500, 590], [3000, 596], [3000, 790], [-600, 790]])} fill="#1A110C" />
		{Array.from({length: 5}, (_, i) => <path key={i} d={`M-600,${626 + i * 34} L3000,${622 + i * 34}`} stroke="#120B08" strokeWidth={3} />)}
		<path d={sm([[-600, 470], [-300, 420], [500, 436], [760, 520], [760, 560], [-600, 560]])} fill="#100A08" />
		{Array.from({length: 46}, (_, i) => <path key={i} d={`M${-600 + i * 30},${448 - Math.sin(i * 0.3) * 10} l-5,${86 + rnd(i, 5) * 20}`} stroke="#22160F" strokeWidth={3} />)}
		<path d="M-560,560 L760,560 L760,790 L-560,790 Z" fill="#150D09" />
		{[-380, 60, 520].map((x, i) => <rect key={i} x={x} y={540} width={26} height={250} fill="#0C0806" />)}
		<path d={sm([[2150, 520], [2400, 470], [2900, 480], [2900, 600], [2150, 600]])} fill="#100A08" />
		<path d="M2170,600 L2900,600 L2900,790 L2170,790 Z" fill="#140C09" />
		{/* the shaft furnace: a tapered clay tower, its tuyère mouth glowing; bellows puffs brighten it on the beats */}
		<Glow x={fx} y={fy - 70} r={560 + 120 * puff} c="#FF7A2A" o={0.38 * fl} id={`${id}fg`} sy={0.75} />
		<path d={sm([[fx - 150, fy], [fx - 128, fy - 220], [fx - 70, ft + 10], [fx + 70, ft + 10], [fx + 128, fy - 220], [fx + 150, fy]])} fill="#2E1C13" />
		{Array.from({length: 9}, (_, i) => <path key={i} d={`M${fx - 140 + i * 2},${fy - 30 - i * 44} L${fx + 140 - i * 2},${fy - 30 - i * 44}`} stroke="#1E120C" strokeWidth={3} opacity={0.8} />)}
		<path d={`M${fx + 128},${fy - 220} L${fx + 70},${ft + 10}`} stroke="#FF9A50" strokeWidth={3} opacity={0.35 * fl} />
		<ellipse cx={fx} cy={ft + 10} rx={70} ry={12} fill="#FF9A40" opacity={0.75 * fl} />
		<path d={sm([[fx - 46, fy], [fx - 46, fy - 58], [fx, fy - 92], [fx + 46, fy - 58], [fx + 46, fy]])} fill="#FFB050" opacity={0.85 * fl} />
		<path d={sm([[fx - 26, fy], [fx - 26, fy - 40], [fx, fy - 62], [fx + 26, fy - 40], [fx + 26, fy]])} fill="#FFE6A0" opacity={0.8 * fl} />
		<Glow x={fx} y={ft} r={180} c="#FFB050" o={0.4 * fl} id={`${id}tg`} sy={0.6} />
		<Sparks t={t} x={fx} y={ft + 6} t0={t - 1.5} t1={t + 0.0001} n={26} seed={7} sp={260} g={-60} life={1.4} dir={-90} spread={50} w={2.2} />
		<Plume x={fx - 20} y={ft} h={420} w={160} c="#3A2A26" o={0.45} id={`${id}sm`} seed={t * 0.6} />
		{/* the yard floor */}
		<rect x={-600} y={780} width={3600} height={500} fill={`url(#${id}gnd)`} />
		<Glow x={fx} y={fy + 10} r={560} c="#FF8A3A" o={0.22 * fl} id={`${id}pool`} sy={0.16} />
	</>; };

/* ============================== the piece-mould (陶范), assembled ============================== */
/** outer half-width (cm) of the assembled mould at height z: it follows the 尊's silhouette (the beaks at the lip) plus the wall */
const MP: [number, number][] = [[0, 14.4], [1.2, 15.2], [6, 15.2], [11, 15.0], [17, 15.6], [23, 15.5], [28, 16.0], [32, 16.8], [35.5, 17.6], [39, 18.1], [42, 18.0], [44.2, 17.0]];
const MTOP = 44.2, CUP = 8, DOME = 3;
const mhw = (z: number) => { if (z <= 0) return MP[0][1]; for (let i = 0; i < MP.length - 1; i++) if (z <= MP[i + 1][0]) return lerp(MP[i][1], MP[i + 1][1], (z - MP[i][0]) / (MP[i + 1][0] - MP[i][0])); return MP[MP.length - 1][1]; };
type Crack = {x: number; y: number; a: number; len: number; seed: number; u: number};
/** a crack's jagged polyline from (x, y) in direction a (deg), length len px (screen) */
const crackPts = (c: Crack): P[] => { const pts: P[] = [[c.x, c.y]]; let a = c.a * D2R, x = c.x, y = c.y; const n = 9;
	for (let i = 1; i <= n; i++) { a += (rnd(i, c.seed) - 0.5) * 1.0; const l = c.len / n; x += Math.cos(a) * l; y += Math.sin(a) * l; pts.push([x, y]); } return pts; };
const partial = (pts: P[], u: number): P[] => { if (u >= 1) return pts; if (u <= 0 || pts.length < 2) return [pts[0]]; const L: number[] = [0];
	for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
	const d = u * L[L.length - 1], out: P[] = [pts[0]]; for (let i = 1; i < pts.length; i++) { if (L[i] <= d) { out.push(pts[i]); continue; } const v = (d - L[i - 1]) / (L[i] - L[i - 1] || 1); out.push(lerpP(pts[i - 1], pts[i], v)); break; } return out; };
/** the mould in screen space: base centre (bx, by), k px/cm; glowZ: seams glow above this height (cm; 99 = none); heat: hot body;
    cracks; side: 'all' or one half (clipped at the centre seam) */
const Mould: React.FC<{bx: number; by: number; k: number; id: string; t: number; glowZ?: number; heat?: number; cracks?: Crack[]; side?: 'all' | 'L' | 'R'; cup?: boolean; lit?: number}> =
	({bx, by, k, id, t, glowZ = 99, heat = 0, cracks = [], side = 'all', cup = true, lit = 1}) => {
	const Y = (z: number) => by - z * k, N = 26;
	const left: P[] = Array.from({length: N + 1}, (_, i) => { const z = (i / N) * MTOP; return [bx - mhw(z) * k, Y(z)] as P; });
	const right: P[] = left.map(([x, y]) => [2 * bx - x, y] as P).reverse();
	const body = sm([[bx - mhw(0) * k + 6, by + 4], ...left.slice(1, -1), [bx - mhw(MTOP) * k * 0.8, Y(MTOP + DOME * 0.7)], [bx - mhw(MTOP) * k * 0.42, Y(MTOP + DOME)], [bx + mhw(MTOP) * k * 0.42, Y(MTOP + DOME)], [bx + mhw(MTOP) * k * 0.8, Y(MTOP + DOME * 0.7)], ...right.slice(1, -1), [bx + mhw(0) * k - 6, by + 4]]);
	const bow = (z: number) => { const hw = mhw(z) * k, y = Y(z); return `M${f1(bx - hw + 3)},${f1(y)} Q${f1(bx)},${f1(y + hw * 0.16)} ${f1(bx + hw - 3)},${f1(y)}`; };
	const seamV = (fx: number, z0: number, z1: number) => dP(Array.from({length: 14}, (_, i) => { const z = lerp(z0, z1, i / 13); return [bx + fx * mhw(z) * k + Math.sin(z * 1.7 + fx * 3) * 1.2, Y(z) + fx * fx * mhw(z) * k * 0.1] as P; }));
	const zg = Math.max(0.6, glowZ), gOn = glowZ < MTOP + DOME;
	const seamD = [seamV(0, 0.8, MTOP - 0.4), seamV(-0.66, 0.8, MTOP - 0.4), seamV(0.66, 0.8, MTOP - 0.4)].join(' ');
	const hSeams = [11.2, 23.4, 39.4].map(bow).join(' ');
	const clip = side === 'all' ? undefined : `url(#${id}half)`;
	return <g clipPath={clip}>
		<defs><linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={rgb(mixc([92, 54, 34], [150, 86, 46], 0.4 * lit))} /><stop offset="0.45" stopColor={rgb(mixc([70, 40, 26], [120, 70, 40], lit))} /><stop offset="1" stopColor="#24140C" /></linearGradient>
			<radialGradient id={`${id}h`} cx="50%" cy="20%" r="70%"><stop offset="0" stopColor="#FF8A30" stopOpacity={0.55} /><stop offset="1" stopColor="#FF5A10" stopOpacity={0} /></radialGradient>
			<clipPath id={`${id}gc`}><rect x={bx - 40 * k} y={Y(MTOP + DOME + CUP + 2)} width={80 * k} height={(MTOP + DOME + CUP + 2 - zg) * k} /></clipPath>
			{side !== 'all' && <clipPath id={`${id}half`}><rect x={side === 'L' ? bx - 60 * k : bx} y={Y(MTOP + CUP + 6)} width={60 * k} height={(MTOP + CUP + 12) * k} /></clipPath>}
			<filter id={`${id}gb`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={Math.max(2, k * 0.6)} /></filter></defs>
		<ellipse cx={bx} cy={by + 2} rx={mhw(0) * k * 1.25} ry={mhw(0) * k * 0.16} fill="#000" opacity={0.5} />
		<path d={body} fill={`url(#${id}b)`} />
		{heat > 0 && <path d={body} fill={`url(#${id}h)`} opacity={heat} />}
		{/* clay grain */}
		{Array.from({length: 70}, (_, i) => { const z = rnd(i, 31) * MTOP, x = bx + (rnd(i, 32) - 0.5) * 1.8 * mhw(z) * k; return <circle key={i} cx={f1(x)} cy={f1(Y(z))} r={(0.4 + rnd(i, 33)) * k * 0.12} fill={i % 3 ? '#1E100A' : '#C88A5A'} opacity={0.35} />; })}
		{/* seams and the cord bindings */}
		<path d={`${seamD} ${hSeams}`} fill="none" stroke="#1E100A" strokeWidth={Math.max(1.2, k * 0.22)} opacity={0.85} />
		{[6, 17.5, 31].map((z, i) => <g key={i}><path d={bow(z)} fill="none" stroke="#24160E" strokeWidth={k * 1.1} strokeLinecap="round" />
			<path d={bow(z)} fill="none" stroke="#8A6A44" strokeWidth={k * 0.9} strokeDasharray={`${f1(k * 0.5)} ${f1(k * 0.6)}`} opacity={0.7} transform={`translate(0,${f1(-k * 0.15)})`} /></g>)}
		{/* the top and the pouring cup */}
		<path d={`M${f1(bx - mhw(MTOP) * k * 0.78)},${f1(Y(MTOP + DOME * 0.7))} Q${f1(bx)},${f1(Y(MTOP + DOME * 1.35))} ${f1(bx + mhw(MTOP) * k * 0.78)},${f1(Y(MTOP + DOME * 0.7))}`} fill="none" stroke="#C88A5A" strokeWidth={Math.max(1, k * 0.25)} opacity={0.45} />
		{cup && <><path d={sm([[bx - 4.2 * k, Y(MTOP + DOME) + 2], [bx - 6.6 * k, Y(MTOP + DOME + CUP)], [bx + 6.6 * k, Y(MTOP + DOME + CUP)], [bx + 4.2 * k, Y(MTOP + DOME) + 2]])} fill={`url(#${id}b)`} />
			<ellipse cx={bx} cy={Y(MTOP + DOME + CUP)} rx={6.6 * k} ry={1.3 * k} fill="#3A2014" /><ellipse cx={bx} cy={Y(MTOP + DOME + CUP) + 0.3 * k} rx={4.8 * k} ry={0.85 * k} fill={gOn ? '#FFD27A' : '#140A06'} /></>}
		{/* the glow runs down the seams as the bronze fills the mould */}
		{gOn && <g clipPath={`url(#${id}gc)`}>
			<path d={`${seamD} ${hSeams}`} fill="none" stroke="#FF8A2A" strokeWidth={k * 1.1} filter={`url(#${id}gb)`} opacity={0.9} />
			<path d={`${seamD} ${hSeams}`} fill="none" stroke="#FFD27A" strokeWidth={Math.max(1.5, k * 0.28)} opacity={0.95} />
			<path d={`${seamD} ${hSeams}`} fill="none" stroke="#FFF6D8" strokeWidth={Math.max(0.8, k * 0.1)} /></g>}
		{gOn && <ellipse cx={bx} cy={Y(Math.max(zg, 0) + 1.2)} rx={mhw(zg) * k * 0.9} ry={k * 2.4} fill="#FFB050" opacity={0.35 * (0.8 + 0.2 * flick(t, 9))} filter={`url(#${id}gb)`} />}
		{/* cracks: dark splits with a dull hot line inside */}
		{cracks.map((c, i) => { const pts = partial(crackPts(c), c.u); if (pts.length < 2) return null; const d = dP(pts);
			return <g key={i}><path d={d} fill="none" stroke="#0E0604" strokeWidth={Math.max(2, k * 0.42)} strokeLinejoin="round" /><path d={d} fill="none" stroke="#FF9A40" strokeWidth={Math.max(0.8, k * 0.13)} opacity={0.85} /></g>; })}
	</g>; };

/* ============================== G · 42.20 the foundry yard: by the brazier the cowries change hands; pan to the piece-mould ============================== */
/** a bronze fire-pan on three legs (feet at x, y; k px/cm), its flames flickering at about hand height */
const Brazier: React.FC<{x: number; y: number; k: number; t: number; id: string}> = ({x, y, k, t, id}) => { const fl = flick(t, 5);
	const flame = (dx: number, h: number, w: number, s: number) => { const sw = Math.sin(t * 9 + s) * 0.2 * w, hh = h * (0.82 + 0.22 * Math.sin(t * 11.3 + s * 2) + 0.08 * Math.sin(t * 23 + s));
		return <path d={sm([[dx - w, 0], [dx - w * 0.55 + sw, -hh * 0.45], [dx + sw * 2.2, -hh], [dx + w * 0.55 + sw, -hh * 0.45], [dx + w, 0]])} />; };
	return <g transform={`translate(${f1(x)},${f1(y)}) scale(${k})`}>
		<Glow x={0} y={-84} r={120} c="#FFA040" o={0.6 * fl} id={`${id}g`} />
		{[[-15, 0], [0, 3], [15, 0]].map(([dx, dy], i) => <path key={i} d={`M${dx * 0.55},-70 L${dx * 1.3},${dy}`} stroke="#140B06" strokeWidth={2.6} strokeLinecap="round" />)}
		<path d="M-23,-74 C-21,-63 21,-63 23,-74 Z" fill="#2A180E" /><path d="M-23,-74 L23,-74" stroke="#FFC070" strokeWidth={1.2} opacity={0.9} />
		<g transform="translate(0,-73)"><g fill="#E8601A" opacity={0.92}>{flame(-9, 24, 8, 1)}{flame(4, 33, 9, 2)}{flame(14, 19, 6, 3)}</g>
			<g fill="#FFB040">{flame(-6, 17, 5, 4)}{flame(5, 25, 6, 5)}</g><g fill="#FFEFB0">{flame(-1, 11, 3.5, 6)}{flame(6, 14, 3.5, 7)}</g></g>
		<Sparks t={t} x={2} y={-100} t0={t - 1.2} t1={t + 0.0001} n={14} seed={23} sp={40} g={-30} life={1.1} dir={-90} spread={70} w={0.6} />
	</g>; };
const CG: React.FC<{t: number}> = ({t}) => {
	const c = card2('G'), t0 = c.t;
	/* a slow push onto the handover from the first frame; the caster's gesture motivates the pan; then a steady push onto the mould */
	const e0 = ease(seg(t, t0, t0 + 1.1)), pan = ease(seg(t, t0 + 0.55, t0 + 2.6)), pu0 = seg(t, t0 + 1.3, t0 + 4.53), push = 0.75 * pu0 + 0.25 * ease(pu0);
	const cam: C2 = {x: 560 * pan + 30 * e0, y: 20 * pan + 40 * push + 12 * e0, z: 0.07 * e0 + 0.03 * pan + 0.2 * push};
	const k = 3.4, gy = 960, hx = 700, cx = 1072;
	/* 何: holds the strings out over the fire, releases them, draws his hands back into 拱手 and bows */
	const rel = ease(seg(t, t0 + 0.42, t0 + 1.05)), bow = ease(seg(t, t0 + 0.6, t0 + 1.4));
	const heS = poseFK({hip: [0, -90], lean: 5 + 11 * bow - 2 * rel, neck: 8, tilt: 10 + 10 * bow, fN: [10, -8], fF: [-12, -8],
		hN: lerpP([46, -108], [27, -126], rel), hF: lerpP([42, -112], [28, -123], rel)});
	/* the caster: hands come under, take the strings, draw them in; then the far hand opens toward the bench behind him */
	const take = ease(seg(t, t0 + 0.05, t0 + 0.32)), draw = ease(seg(t, t0 + 0.45, t0 + 0.95)), gest = ease(seg(t, t0 + 0.95, t0 + 1.55)), drop = ease(seg(t, t0 + 2.8, t0 + 3.6));
	const caHN = lerpP(lerpP(lerpP([34, -100], [52, -106], take), [26, -118], draw), [22, -112], drop);
	const caHF = lerpP(lerpP(lerpP(lerpP([30, -104], [48, -110], take), [22, -122], draw), [-34, -128], gest), [-14, -98], drop);
	const caS = poseFK({hip: [0, -90], lean: 4 - 6 * draw + 3 * gest, neck: 6, tilt: 6 - 10 * gest, fN: [12, -8], fF: [-14, -8], hN: caHN, hF: caHF});
	/* the strings ride on whoever holds them; after the gesture they hang from the caster's near hand */
	const tr = ease(seg(t, t0 + 0.2, t0 + 0.42)), gat = ease(seg(t, t0 + 0.85, t0 + 1.15));
	const hN = toScr(heS.hN, hx, gy, k), hF = toScr(heS.hF, hx, gy, k), cN = toScr(caS.hN, cx, gy, k, true), cF = toScr(caS.hF, cx, gy, k, true);
	const A = lerpP(hN, cN, tr), B0 = lerpP(hF, cF, tr), B = lerpP(B0, addP(A, [4, 0]), gat);
	const strings = [0, 1, 2].map((i) => { const a = addP(A, [i * 3, i * 1.8]), b = addP(B, [i * 2.4 - 3, i * 1.4]), s = lerp((14 + 5 * i) * k, (19 + 6 * i) * k, gat);
		const sw = Math.sin((t - t0) * 6.5 + i) * 8 * Math.exp(-Math.max(0, t - t0 - 0.4) * 1.6), pts: P[] = [0, 0.25, 0.5, 0.75, 1].map((u) => [lerp(a[0], b[0], u) + sw * 4 * u * (1 - u), lerp(a[1], b[1], u) + s * 4 * u * (1 - u)] as P);
		return <CowrieString key={i} pts={pts} n={12} r={5.2} seed={i * 5} lit={(j: number) => 0.35 + 0.45 * Math.max(0, Math.sin(t * 6 + j * 0.9 + i * 2))} />; });
	const fl = flick(t, 5);
	return <AbsoluteFill style={{background: '#06060A'}}>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<defs><filter id="gdof" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={2.4 * (1 - pan)} /></filter></defs>
			<g transform={lay(3, cam)}><YardNight t={t} id="gy" fx={1600} /></g>
			<g transform={lay(1, cam)}>
				{Array.from({length: 40}, (_, i) => <ellipse key={i} cx={-200 + rnd(i, 41) * 2600} cy={940 + rnd(i, 42) * 120} rx={2 + rnd(i, 43) * 7} ry={1 + rnd(i, 43) * 2.5} fill={i % 4 ? '#0E0806' : '#5A3A26'} opacity={0.8} />)}
				<Glow x={880} y={900} r={520} c="#FF8A3A" o={0.32 * fl} id="gpool" sy={0.22} />
				<Glow x={880} y={600} r={330} c="#FFB060" o={0.3 * fl} id="gkey" />
				<Brazier x={880} y={950} k={k} t={t} id="gbz" />
				<ellipse cx={880} cy={gy + 4} rx={330} ry={16} fill="#000" opacity={0.3} />
				<Sil id="gHe" x={hx} y={gy} k={k} rim="#FFC878" lx={1} ly={0.35} rimW={4.6} fill="#1C120C"><Body s={heS} dress="robe" hat="guan" /></Sil>
				<Sil id="gCa" x={cx} y={gy} k={k} flip rim="#FFC878" lx={-1} ly={0.35} rimW={4.6} fill="#1C120C"><Body2 s={caS} dress="tunic" hat="knot" /></Sil>
				{strings}
				<path d={sm([[1290, gy], [1282, gy - 64], [1380, gy - 66], [1372, gy]])} fill="#1A110C" />
			</g>
			<g transform={lay(0.65, cam)}>
				<g filter="url(#gdof)">
					<Glow x={1900} y={660} r={430} c="#FFA050" o={0.2 + 0.22 * Math.exp(-beatPh(t) * 3.2)} id="gbl" />
					<path d="M1560,788 L2240,788 L2260,770 L1585,770 Z" fill="#3A2416" /><rect x={1560} y={788} width={680} height={300} fill="#1C120C" />
					<path d="M1560,788 L2240,788" stroke="#FFB070" strokeWidth={2.4} opacity={0.6} />
					<Mould bx={1855} by={788} k={5.8} id="gmo" t={t} lit={1.25} />
					<Lamp x={2085} y={786} s={5.4} t={t} id="glp" />
					<path d="M1622,782 L1690,768" stroke="#E8D8B8" strokeWidth={4} strokeLinecap="round" /><path d="M1700,784 L1752,776" stroke="#6A4A30" strokeWidth={6} strokeLinecap="round" />
					<path d={sm([[1600, 1088], [1590, 1000], [1660, 960], [1740, 1000], [1730, 1088]])} fill="#140C08" />
				</g>
			</g>
			<Embers t={t} n={70} x0={0} x1={1920} y0={60} y1={1080} seed={21} v={70} o={0.75} r={3} />
			<defs><filter id="gbk" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={5} /></filter></defs>
			<g filter="url(#gbk)"><Embers t={t} n={18} x0={-100 - 400 * pan} x1={2100 - 400 * pan} y0={-100} y1={1180} seed={27} v={170} o={0.7} r={15} c="#FFA850" /></g>
			{/* smoke from the brazier and the furnace drifts across the yard as the camera closes on the mould */}
			<defs><filter id="gsm" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={55} /></filter></defs>
			<g filter="url(#gsm)" opacity={0.6 * seg(t, t0 + 2.2, t0 + 3.0)}>{Array.from({length: 6}, (_, i) => <circle key={i} cx={((rnd(i, 71) * 2400 - (t - t0) * (140 + 60 * rnd(i, 72))) % 2600 + 2600) % 2600 - 340} cy={120 + rnd(i, 73) * 860} r={170 + 100 * rnd(i, 74)} fill={i % 2 ? '#8A6A58' : '#C8A890'} opacity={0.2} />)}</g>
		</svg>
		<svg width={W} height={H} style={{position: 'absolute'}}><Vig id="gv" a={0.55} /></svg>
		<FilmOv2 t={t} c={c} />
	</AbsoluteFill>; };

/* ============================== H · 46.73 the inscription cut into the clay ============================== */
type Stroke = {pts: P[]; w: number; fill?: boolean};
/** zun55h's inscription layout (12 columns, 122 characters) and its seeded pseudo-glyphs, so the clay shows the same text */
/* v2.1: the same glyph vocabulary as zun55h (the 金文-radical set), imported so the clay and the bronze always match */
const pseudoGlyph = (seed: number): Stroke[] => zPseudoGlyph(seed) as Stroke[];
const COL_LEN = [11, 11, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10], KEY_COL = 6, KEY_ROW = 3;
const KEY_CH = ['宅', '兹', '中', '或'];
type Gl = {c: number; k: number; u: number; v: number; s: number; strokes: Stroke[]; key: string};
const INSCR: Gl[] = (() => { const out: Gl[] = [], colW = 1.12, rowH = 1.16;
	COL_LEN.forEach((n, c) => { for (let k = 0; k < n; k++) { const u = (5.5 - c) * colW, v = (k - (n - 1) / 2) * rowH * (n === 11 ? 0.94 : 1);
		const ki = c === KEY_COL ? k - KEY_ROW : -1, key = ki >= 0 && ki < 4 ? KEY_CH[ki] : '';
		const strokes = key ? (GLYPH_STROKES[key] as Stroke[]) : pseudoGlyph(c * 31 + k * 7 + 3);
		out.push({c, k, u, v: v + (zrnd(c * 17 + k, 9) - 0.5) * 0.08, s: key === '中' || key === '或' ? 1.1 : 0.98 + (zrnd(c * 5 + k, 4) - 0.5) * 0.14, strokes, key}); } });
	return out; })();
const glyphAt = (c: number, k: number) => INSCR.find((g) => g.c === c && g.k === k)!;
const strokeD = (g: Gl, st: Stroke) => { const pts = st.pts.map(([x, y]) => [g.u + x * g.s, g.v + y * g.s] as P); return pts.length > 2 ? sm(pts, !!st.fill) : dP(pts); };
/** cut progress u (0..1) over a glyph's strokes: the strokes done, the partial one, and where the stylus tip is (cm) */
const cutGlyph = (g: Gl, u: number) => { const L = g.strokes.map((st) => st.pts.reduce((a, q, i) => i ? a + Math.hypot(q[0] - st.pts[i - 1][0], q[1] - st.pts[i - 1][1]) : 0, 0) + 0.25);
	const tot = L.reduce((a, b) => a + b, 0); let d = u * tot; const parts: {st: Stroke; p: number}[] = []; let tip: P = [g.u, g.v], lift = 1;
	g.strokes.forEach((st, i) => { if (d <= 0) return; const p = cl(d / L[i]); parts.push({st, p: Math.min(1, p * L[i] / (L[i] - 0.25))}); const pp = partial(st.pts, Math.min(1, p * L[i] / (L[i] - 0.25)));
		const q = pp[pp.length - 1]; tip = [g.u + q[0] * g.s, g.v + q[1] * g.s]; lift = p * L[i] > L[i] - 0.25 ? cl((p * L[i] - (L[i] - 0.25)) / 0.25) : 0; d -= L[i]; });
	return {parts, tip, lift: u >= 1 ? 1 : lift}; };
const CH: React.FC<{t: number}> = ({t}) => {
	const c = card2('H'), t0 = c.t;
	/* the camera: macro on the key column, following the cut and the landings down it; then it rises over all 12 columns */
	const g1 = glyphAt(KEY_COL, 1), g6 = glyphAt(KEY_COL, 6);
	const eA = ease(seg(t, t0, t0 + 2.95)), eB = ease(seg(t, t0 + 2.75, t0 + 4.5));
	const vA = lerp(g1.v + 0.35, g6.v - 0.1, eA), s = lerp(lerp(168, 150, eA), 52, eB), uc = lerp(g1.u + 0.2, 0, eB), vc = lerp(vA, 0.25, eB), rot = lerp(-7, 0, ease(seg(t, t0, t0 + 4.5)));
	const toS = (u: number, v: number): P => { const x = (u - uc) * s, y = (v - vc) * s, a = rot * D2R; return [960 + x * Math.cos(a) - y * Math.sin(a), 560 + x * Math.sin(a) + y * Math.cos(a)]; };
	const camT = `translate(960,560) rotate(${rot.toFixed(3)}) scale(${s.toFixed(3)}) translate(${(-uc).toFixed(4)},${(-vc).toFixed(4)})`;
	/* the schedule: rows 0 cut before; 1, 2 cut by the stylus; 宅 兹 中 或 land on the beats; the rest ripple in from the key column */
	const cutW: Record<number, [number, number]> = {1: [t0 - 0.05, t0 + 0.5], 2: [t0 + 0.55, t0 + 1.05]};
	const land = (i: number) => t0 + 1.13 + i * BEAT;     // 47.86, 48.43, 49.00, 49.56
	const ripple = (g: Gl) => { if (g.c === KEY_COL) return g.k === 0 ? -9 : g.k >= 7 ? t0 + 3.02 + (g.k - 7) * 0.05 : 99; const o = Math.abs(g.c - KEY_COL); return t0 + 2.95 + o * 0.22 + g.k * 0.025; };
	const grooves: React.ReactNode[] = [], crumbs: React.ReactNode[] = [], gold: React.ReactNode[] = [];
	let tip: P | null = null, tipLift = 1;
	INSCR.forEach((g, gi) => {
		const cw = g.c === KEY_COL ? cutW[g.k] : undefined;
		let parts: {st: Stroke; p: number}[] = [], pop = 1;
		if (g.key) { const i = KEY_CH.indexOf(g.key), tl = land(i); if (t < tl) return; parts = g.strokes.map((st) => ({st, p: 1})); }
		else if (cw) { const u = seg(t, cw[0], cw[1]); if (u <= 0) return; const r = cutGlyph(g, u); parts = r.parts; if (u < 1) { tip = r.tip; tipLift = r.lift; } }
		else { const ta = ripple(g); if (t < ta) return; pop = seg(t, ta, ta + 0.14); parts = g.strokes.map((st) => ({st, p: 1})); }
		parts.forEach(({st, p}, si) => { const pts = st.pts.map(([x, y]) => [g.u + x * g.s, g.v + y * g.s] as P), pp = p >= 1 ? pts : partial(pts, p); if (pp.length < 2) return;
			const d = pp.length > 2 ? sm(pp, !!st.fill && p >= 1) : dP(pp), w = st.w * g.s;
			grooves.push(<g key={`${gi}_${si}`} opacity={pop}><path d={d} fill="none" stroke="#E2A57A" strokeWidth={w * 1.25} strokeLinecap="round" strokeLinejoin="round" transform="translate(0.018,0.026)" opacity={0.75} />
				<path d={d} fill={st.fill && p >= 1 ? '#3A1C10' : 'none'} stroke="#3A1C10" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
				<path d={d} fill="none" stroke="#1E0C06" strokeWidth={w * 0.45} strokeLinecap="round" strokeLinejoin="round" transform="translate(-0.012,-0.016)" opacity={0.8} /></g>);
			if (!g.key) [0.3, 0.75].forEach((uu, j) => { if (p < uu) return; const q = partial(pts, uu), e = q[q.length - 1], rr = 0.018 + 0.016 * rnd(gi * 7 + si * 3 + j, 4);
				crumbs.push(<circle key={`c${gi}_${si}_${j}`} cx={e[0] + (rnd(gi + si + j, 5) - 0.5) * 0.12 + 0.05} cy={e[1] + (rnd(gi + si + j, 6) - 0.5) * 0.1 + 0.05} r={rr} fill={j ? '#9A6040' : '#D89A72'} opacity={0.8 * pop} />); }); });
	});
	/* the gold glyphs: they fall from the camera (big, soft) onto their places; then they stay as gold in the clay */
	KEY_CH.forEach((ch, i) => { const g = glyphAt(KEY_COL, KEY_ROW + i), tl = land(i), u = seg(t, tl - 0.48, tl); if (u <= 0) return;
		const e = eout(u), q = toS(g.u, g.v), sc = lerp(4.2, 1, e), dx = lerp(260, 0, e), dy = lerp(-340, 0, e), ang = lerp(28, 0, e), after = t - tl;
		const glowK = after > 0 ? 0.5 + 1.1 * Math.exp(-after * 3) : 0.9;
		gold.push(<g key={ch} opacity={u < 0.25 ? u / 0.25 : 1} transform={`translate(${f1(q[0] + dx)},${f1(q[1] + dy)}) rotate(${(rot + ang).toFixed(2)}) scale(${sc.toFixed(3)})`}>
			<Glyphs55 chars={ch} x={0} y={0} size={s * g.s} glow={glowK} id={`hg${i}`} o={after > 0 ? 1 - 0.25 * seg(after, 0.4, 1.6) : 1} /></g>);
		if (after > 0 && after < 0.6) { const rr = s * (0.6 + 1.4 * eout(after / 0.6)); gold.push(<circle key={`r${ch}`} cx={q[0]} cy={q[1]} r={rr} fill="none" stroke="#FFE2A0" strokeWidth={3} opacity={0.7 * (1 - after / 0.6)} />); } });
	/* the bone stylus in a hand (screen space): its tip on the cut, lifting between strokes; the wrist works as it cuts; it leaves after row 2 */
	const away = ease(seg(t, t0 + 1.06, t0 + 1.55));
	const tipC: P = tip ?? [glyphAt(KEY_COL, 2).u + 0.3, glyphAt(KEY_COL, 2).v + 0.45];
	const ts = toS(tipC[0], tipC[1]), lift = (tip ? tipLift : 1) * 12 + away * 50, tx = ts[0] + away * 560, ty = ts[1] + away * 380 - lift;
	const wrist = 36 + 6 * Math.sin(t * 8.5) + 4 * Math.sin(t * 13.7 + 1) + 10 * away;
	/* at this macro a 1 cm glyph is ~160 px, so the bone stylus is a thick tapering shaft running out of frame, and the hand
	   shows only as two big fingertips pressing it near the corner */
	const stylus = (shadow: boolean) => <g>
		<path d={sm([[0, 0], [70, -6], [300, -30], [620, -50], [1100, -66], [1100, 66], [620, 50], [300, 30], [70, 6]])} fill={shadow ? '#000' : 'url(#hbone)'} />
		{!shadow && <><path d="M90,-4 C300,-18 700,-34 1100,-44" fill="none" stroke="#FFF8E6" strokeWidth={3} opacity={0.6} />
			<path d="M160,8 C420,20 800,34 1100,40" fill="none" stroke="#8A7454" strokeWidth={2} opacity={0.45} />
			{[0, 1, 2, 3].map((k) => <path key={k} d={`M${260 + k * 170},${-14 - k * 6} C${330 + k * 170},${-6 - k * 4} ${380 + k * 170},${4 + k * 3} ${440 + k * 170},${10 + k * 4}`} fill="none" stroke="#A88C64" strokeWidth={1.4} opacity={0.35} />)}
			<path d={sm([[0, 0], [26, -3], [34, 0], [26, 3]])} fill="#7A5A3C" opacity={0.85} /></>}</g>;
	const hand = <><path d={sm([[560, -46], [640, -96], [760, -118], [900, -112], [1000, -80], [930, -48], [760, -44]])} />
		<path d={sm([[600, 44], [700, 46], [840, 70], [980, 110], [940, 150], [780, 128], [640, 86]])} /><path d={sm([[880, -150], [1300, -220], [1500, 120], [1100, 260], [900, 150]])} /></>;
	return <AbsoluteFill style={{background: '#140A06'}}>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<defs><radialGradient id="hclay" cx="35%" cy="30%" r="85%"><stop offset="0" stopColor="#A86A44" /><stop offset="0.55" stopColor="#7E4A2E" /><stop offset="1" stopColor="#3A2014" /></radialGradient>
				<filter id="hshb" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={9} /></filter>
				<linearGradient id="hbone" gradientUnits="userSpaceOnUse" x1="0" y1="-60" x2="0" y2="60"><stop offset="0" stopColor="#F6EEDA" /><stop offset="0.5" stopColor="#D8C6A0" /><stop offset="1" stopColor="#9C8660" /></linearGradient></defs>
			<rect width={W} height={H} fill="url(#hclay)" />
			<g transform={camT}>
				{Array.from({length: 520}, (_, i) => <circle key={i} cx={-12 + rnd(i, 51) * 24} cy={-10 + rnd(i, 52) * 20} r={0.012 + rnd(i, 53) * 0.045} fill={i % 3 ? '#4A2818' : '#C8885E'} opacity={0.45} />)}
				{Array.from({length: 26}, (_, i) => { const y = -9 + rnd(i, 54) * 18, x = -11 + rnd(i, 55) * 22; return <path key={`m${i}`} d={`M${f1(x)},${y.toFixed(2)} q1.6,${(rnd(i, 56) - 0.5).toFixed(2)} 3.4,${((rnd(i, 57) - 0.5) * 0.6).toFixed(2)}`} fill="none" stroke="#C88A60" strokeWidth={0.05} opacity={0.25} />; })}
				<rect x={-7.4} y={-7.2} width={14.8} height={14.4} rx={0.6} fill="none" stroke="#3A1C10" strokeWidth={0.06} opacity={0.35} />
				{grooves}{crumbs}
			</g>
			{gold}
			{/* the bone stylus, its hand, and their soft shadow on the clay */}
			<g transform={`translate(${f1(tx + 22 + lift * 0.9)},${f1(ty + 30 + lift * 1.1)}) rotate(${wrist.toFixed(2)})`} filter="url(#hshb)" opacity={0.38}>{stylus(true)}<g fill="#000">{hand}</g></g>
			<g transform={`translate(${f1(tx)},${f1(ty)}) rotate(${wrist.toFixed(2)})`}>
				{stylus(false)}
				<Sil id="hHand" x={0} y={0} k={1} rim="#FFB878" lx={-0.5} ly={-0.85} rimW={4} fill="#1A100A">{hand}</Sil>
			</g>
		</svg>
		<svg width={W} height={H} style={{position: 'absolute'}}><Vig id="hv" a={0.7} /></svg>
		<FilmOv2 t={t} c={c} />
	</AbsoluteFill>; };

/* ============================== I · 51.26 the pour ============================== */
/** the crucible (将军盔): a thick, red-hot clay pot with a pointed foot, hung on a pole through two rope-bound lugs at its rim;
    pivot at the pole (px, py), k px/cm, tipped a deg (negative = mouth toward the left); fill = how much bronze is left */
const crucibleLip = (px: number, py: number, k: number, a: number): P => { const r = a * D2R, x = -15 * k, y = -5.6 * k; return [px + x * Math.cos(r) - y * Math.sin(r), py + x * Math.sin(r) + y * Math.cos(r)]; };
const Crucible: React.FC<{px: number; py: number; k: number; a: number; t: number; id: string; fill: number}> = ({px, py, k, a, t, id, fill}) => { const fl = flick(t, 4);
	const body: P[] = [[-15, -3], [-16, 6], [-14.5, 16], [-10, 26], [-4, 33], [0, 34.5], [4, 33], [10, 26], [14.5, 16], [16, 6], [15, -3]];
	return <g transform={`translate(${f1(px)},${f1(py)}) rotate(${a.toFixed(2)}) scale(${k})`}>
		<defs><linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B4421A" /><stop offset="0.35" stopColor="#6A2A12" /><stop offset="1" stopColor="#24120A" /></linearGradient>
			<linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#000" stopOpacity={0} /><stop offset="0.7" stopColor="#000" stopOpacity={0.15} /><stop offset="1" stopColor="#000" stopOpacity={0.55} /></linearGradient></defs>
		<path d={sm(body)} fill={`url(#${id}b)`} /><path d={sm(body)} fill={`url(#${id}s)`} />
		{Array.from({length: 26}, (_, i) => <circle key={i} cx={-12 + rnd(i, 61) * 24} cy={2 + rnd(i, 62) * 26} r={0.25 + rnd(i, 63) * 0.5} fill={i % 3 ? '#1E0E06' : '#E07A3A'} opacity={0.5} />)}
		{/* slag runs down from the pouring side of the lip */}
		{[[-14.2, 7], [-12.6, 11], [-15.2, 4]].map(([x, l], i) => <path key={i} d={`M${x},-2 C${x - 0.3},${l * 0.4} ${x + 0.4},${l * 0.7} ${x + 0.2},${l}`} stroke="#FF7A2A" strokeWidth={0.9} strokeLinecap="round" opacity={0.7 * fl} />)}
		{/* the thick rim (the wall shows its thickness), the molten bronze inside */}
		<path d="M-15,-3 L-15,-6 L15,-6 L15,-3 Z" fill="#7A3A1C" /><path d="M-15,-6 L15,-6" stroke="#FFB070" strokeWidth={0.5} opacity={0.8} />
		<ellipse cx={0} cy={-6} rx={15} ry={2.6} fill="#3A1A0C" /><ellipse cx={-2 * (1 - fill)} cy={-5.8} rx={12.4 * (0.45 + 0.55 * fill)} ry={1.9 * (0.45 + 0.55 * fill)} fill="#FFD27A" opacity={0.95 * fl} />
		{/* the two lugs bound with rope, the pole through them at the pivot */}
		{[-16.5, 16.5].map((x, i) => <g key={i}><ellipse cx={x} cy={0} rx={2.4} ry={3.4} fill="#4A2412" /><path d={`M${x - 2},-2.4 L${x + 2},2.4 M${x - 2},0 L${x + 2},-2.4 M${x - 2},2.4 L${x + 1.6},0.6`} stroke="#8A6A40" strokeWidth={0.55} /></g>)}
	</g>; };
const CI: React.FC<{t: number}> = ({t}) => {
	const c = card2('I'), t0 = c.t, t1 = t0 + 4.53;
	const u0 = seg(t, t0, t1 + 0.7), u = 0.55 * u0 + 0.45 * ease(u0), cam: C2 = {x: lerp(150, -30, u), y: lerp(-250, 60, u), z: lerp(0.28, -0.04, u)};
	const k = 10, bx = 900, by = 1040, cupY = by - (MTOP + DOME + CUP) * k;
	const piv: P = [1190, 128];
	const ang = -lerp(42, 80, eout(seg(t, t0 - 0.15, t0 + 0.55))) - 22 * ease(seg(t, t0 + 0.55, t1));
	const lip = crucibleLip(piv[0], piv[1], k, ang);
	const flow = seg(t, t0 + 0.06, t0 + 0.24) * (1 - 0.55 * seg(t, t1 - 1.2, t1));
	const glowZ = lerp(MTOP + DOME, -2, ease(seg(t, t0 + 0.8, t1 - 0.4)));
	const hit: P = [bx + 2, cupY + 5];
	const wob = (i: number) => Math.sin(t * 23 + i * 1.3) * 3 + Math.sin(t * 9.1 + i) * 2;
	const sp = Array.from({length: 9}, (_, i) => { const v = i / 8, x = lerp(lip[0], hit[0], v) - Math.sin(v * Math.PI) * 26, y = lerp(lip[1], hit[1], v * v * 0.6 + v * 0.4); return [x + wob(i) * v, y] as P; });
	const streamD = sm(sp, false), sw = 22 * flow;
	/* the two men on the pole: legs braced, leaning back, their hands at hip height on it (their heads are above the frame) */
	const pole = (x: number) => piv[1] + (x - piv[0]) * 0.035;
	const men = [[1470, 0], [1730, 1]].map(([hxs, i]) => { const X = hxs + 30 * k, effort = Math.sin(t * 2.3 + i * 1.7) * 1.5;
		const s = poseFK({hip: [0, -91], lean: -9 + effort, neck: 4, fN: [26, -8], fF: [-30, -8], hN: [30, (pole(hxs) - by) / k], hF: [24 + 4 * i, (pole(hxs + 22) - by) / k + 1]});
		return <Sil key={i} id={`iMn${i}`} x={X} y={by} k={k} flip rim="#FFB070" lx={-1} ly={-0.3} rimW={4.4} fill="#160D08"><Body2 s={s} dress="tunic" hat="knot" /></Sil>; });
	return <AbsoluteFill style={{background: '#070404'}}>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<defs><filter id="iglow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={14} /></filter></defs>
			<g transform={lay(3, cam)}>
				<rect x={-600} y={-500} width={3200} height={2000} fill="#0A0605" />
				<rect x={-600} y={520} width={3200} height={300} fill="#140C08" />
				{Array.from({length: 7}, (_, i) => <path key={i} d={`M-600,${540 + i * 40} L2600,${536 + i * 40}`} stroke="#0C0705" strokeWidth={3} />)}
				{[160, 780, 1500].map((x, i) => <rect key={i} x={x} y={-300} width={36} height={1100} fill="#080504" />)}
				<Glow x={240} y={760} r={420} c="#FF6A20" o={0.3 * flick(t, 2)} id="ifur" />
				<Sil id="iMan" x={420} y={800} k={2.4} rim="#FF9A50" lx={1} ly={0.1}><Body2 s={poseFK({hip: [0, -90], lean: 6 + 2 * Math.sin(t * 1.3), neck: 10, tilt: 12, fN: [12, -8], fF: [-14, -8], hN: [36, -106], hF: [30, -100]})} dress="tunic" hat="knot" />
					<path d="M36,-106 L118,-160" stroke="#120C09" strokeWidth={3} strokeLinecap="round" /></Sil>
				<rect x={-600} y={800} width={3200} height={700} fill="#0E0806" />
			</g>
			<g transform={lay(1, cam)}>
				<path d={sm([[200, 1160], [380, 1040], [700, 1020], [1240, 1022], [1700, 1040], [2100, 1160]])} fill="#1E140D" />
				<path d={sm([[380, 1040], [700, 1020], [1240, 1022], [1700, 1040]], false)} fill="none" stroke="#FF9A50" strokeWidth={3} opacity={0.35 + 0.25 * flow} />
				<Glow x={bx} y={by - 10} r={620} c="#FF7A2A" o={0.22 + 0.25 * flow * flick(t, 6)} id="ipool" sy={0.22} />
				<Mould bx={bx} by={by} k={k} id="imo" t={t} glowZ={glowZ} heat={0.25 + 0.5 * seg(t, t0 + 0.6, t1)} />
				{men}
				<path d={`M${piv[0] - 30},${pole(piv[0] - 30)} L2400,${pole(2400)}`} stroke="#2A1A10" strokeWidth={20} strokeLinecap="round" />
				<path d={`M${piv[0] - 30},${pole(piv[0] - 30) - 8} L2400,${pole(2400) - 8}`} stroke="#FFB070" strokeWidth={2.4} opacity={0.6} />
				{[1470, 1500, 1730, 1760].map((x, i) => <g key={i}><ellipse cx={x} cy={pole(x) + 2} rx={22} ry={17} fill="#160D08" /><path d={`M${x - 20},${pole(x) - 6} Q${x},${pole(x) - 20} ${x + 20},${pole(x) - 6}`} fill="none" stroke="#FFB070" strokeWidth={2.4} opacity={0.75} /></g>)}
				<Glow x={piv[0] - 40} y={piv[1] + 120} r={300} c="#FF7A30" o={0.3 * flick(t, 3)} id="icg" />
				<Crucible px={piv[0]} py={piv[1]} k={k} a={ang} t={t} id="icr" fill={1 - 0.6 * seg(t, t0, t1)} />
				{flow > 0.01 && <g>
					<path d={streamD} fill="none" stroke="#FF8A2A" strokeWidth={sw * 2.4} strokeLinecap="round" filter="url(#iglow)" opacity={0.75} />
					<path d={streamD} fill="none" stroke="#FFB040" strokeWidth={sw} strokeLinecap="round" />
					<path d={streamD} fill="none" stroke="#FFF2C8" strokeWidth={sw * 0.38} strokeLinecap="round" />
					<Glow x={hit[0]} y={hit[1]} r={240} c="#FFC060" o={0.65 * flow * flick(t, 8)} id="ihit" />
					<ellipse cx={hit[0]} cy={hit[1] + 4} rx={4.6 * k} ry={0.8 * k} fill="#FFE8A8" opacity={0.85 * flow} /></g>}
				<Sparks t={t} x={hit[0]} y={hit[1]} t0={t0 + 0.05} t1={t1 - 0.6} n={150} seed={13} sp={480} g={1100} life={0.75} dir={-90} spread={170} w={3} />
				<Sparks t={t} x={hit[0]} y={hit[1]} t0={t0 + 0.06} t1={t0 + 0.22} n={40} seed={17} sp={700} g={1100} life={0.6} dir={-90} spread={180} w={3.4} />
				<Steam t={t} x={bx} y={cupY - 10} w={150} h={560} n={16} seed={4} id="ist" o={0.24 * flow + 0.06} v={0.55} blur={20} r0={46} />
				<Steam t={t} x={bx + 100} y={by - 25 * k} w={260} h={460} n={10} seed={8} id="ist2" o={0.12 * seg(t, t0 + 1.4, t0 + 2.4)} v={0.4} blur={22} r0={56} />
			</g>
			<g transform={lay(0.55, cam)}>
				<path d={sm([[-200, 1240], [-40, 1070], [260, 1040], [520, 1080], [640, 1240]])} fill="#0C0705" />
			</g>
			<Embers t={t} n={36} x0={200} x1={1800} y0={60} y1={1080} seed={33} v={90} o={0.7} r={3} />
		</svg>
		<svg width={W} height={H} style={{position: 'absolute'}}><Vig id="iv" a={0.66} /></svg>
		<FilmOv2 t={t} c={c} />
	</AbsoluteFill>; };

/* ============================== J · 55.79 the mould is broken: the golden 尊 ============================== */
const LJ: ZunLight = {dir: [0.55, -0.55, 0.62], col: '#FFD49A', k: 1.5, amb: 0.3, ambCol: '#5A3A28', spec: 1.3, shin: 20, rim: {dir: [-0.6, 0.7, 0.3], col: '#FF9A50', k: 0.9}};
/** keyframed vectors with per-segment easing: [time, values, easing of the segment that ENDS at this key] */
const keyedV = (t: number, keys: [number, number[], (u: number) => number][]): number[] => { if (t <= keys[0][0]) return keys[0][1];
	for (let i = 0; i < keys.length - 1; i++) { const [a, va] = keys[i], [b, vb, e] = keys[i + 1]; if (t < b) { const u = e((t - a) / (b - a)); return va.map((v, j) => lerp(v, vb[j], u)); } } return keys[keys.length - 1][1]; };
const accel = (u: number) => u * u * u;
/** the caster's mallet pose from joint angles: up / bend (shoulder, elbow; armFK convention), wrist, trunk lean, hip height, step back */
const malletPose = (up: number, bend: number, wr: number, lean: number, hipY: number, back: number, s1: number, s2: number) => {
	const hip: P = [-back, hipY], sh: P = [hip[0] + 50 * Math.sin(lean * D2R), hip[1] - 50 * Math.cos(lean * D2R)], arm = armFK(sh, up, bend), ah = (up + bend + wr) * D2R, dir: P = [Math.sin(ah), Math.cos(ah)];
	const s = poseFK({hip, lean, neck: 10, tilt: 16, fN: [26 - 48 * ease(s2), -8 - 9 * Math.sin(Math.PI * s2)], fF: [-20 - 48 * ease(s1), -8 - 10 * Math.sin(Math.PI * s1)], hN: arm.h, eN: arm.e, hF: addP(arm.h, dir, -11)});
	return {s, hand: arm.h, dir, head: addP(arm.h, dir, 42)}; };
const CJ: React.FC<{t: number}> = ({t}) => {
	const c = card2('J'), t0 = c.t, t1 = t0 + 4.53;
	const hits = [t0 + BEAT, t0 + 2 * BEAT, t0 + 3 * BEAT], tb = hits[2] + 0.02;      // 56.36, 56.92, 57.49 (it splits)
	/* camera: a slow creep while he strikes, then a push in through the steam to the golden 尊 */
	const pu = ease(seg(t, tb + 0.05, t1 + 0.5)), D0 = 300, D = lerp(lerp(D0, 262, seg(t, t0, tb)), 100, pu), cy0 = 790, cyT = lerp(cy0, 572, pu);
	const f = 1500, cam = camAt(28, 4, D, [0, 0, 19.4], f, 960, cyT), Lt = layerJ(D0, D, cy0, cyT);
	const zs0 = camAt(28, 4, D0, [0, 0, 19.4], f, 960, cy0), b0 = proj(zs0, [0, 0, 0]), k0 = f / D0, bx = b0[0], by = b0[1];
	/* the caster's swing: shoulder, elbow and wrist rotate; he leans in and bends his knees on each blow */
	const UP: number[] = [170, 60, -30, 10, -89], HIT: number[] = [30, 10, 10, 40, -83], REC: number[] = [36, 16, 16, 37, -84];
	const KF: [number, number[], (u: number) => number][] = [[t0, [120, 40, -10, 18, -88], ease],
		[hits[0] - 0.2, UP, ease], [hits[0], HIT, accel], [hits[0] + 0.09, REC, eout],
		[hits[1] - 0.2, UP, ease], [hits[1], HIT, accel], [hits[1] + 0.09, REC, eout],
		[hits[2] - 0.2, [172, 62, -34, 8, -89], ease], [hits[2], HIT, accel], [hits[2] + 0.2, [30, 18, 14, 34, -85], eout], [tb + 1.0, [18, 22, -8, 8, -90], ease]];
	const [up, bend, wr, lean, hipY] = keyedV(t, KF);
	const s1 = seg(t, tb + 0.4, tb + 0.8), s2 = seg(t, tb + 0.72, tb + 1.1), back = 24 * ease(s1) + 24 * ease(s2);
	const mp = malletPose(up, bend, wr, lean, hipY, back, s1, s2);
	/* where he stands: on a blow the mallet head meets the mould's upper shoulder */
	const ref = malletPose(HIT[0], HIT[1], HIT[2], HIT[3], HIT[4], 0, 0, 0), zHit = -ref.head[1];
	const hitR: P = [bx + (mhw(zHit) + 1) * k0, by - zHit * k0], cxC = hitR[0] + (ref.head[0] + 7) * k0, cyC = by;
	const headS = toScr(mp.head, cxC, cyC, k0, true), near = hits.reduce((a, h) => Math.max(a, Math.exp(-Math.abs(t - h) * 14)), 0);
	/* the cracks of each blow; the last one splits it down the seam */
	const cracks: Crack[] = [];
	hits.forEach((th, i) => { if (t < th) return; const p: P = [hitR[0] - 3, hitR[1] + i * 10];
		for (let j = 0; j < 4; j++) cracks.push({x: p[0], y: p[1], a: 180 + (j - 1.5) * 38 + i * 12, len: (40 + 50 * rnd(j, i)) * k0 / 5 * (1 + 0.4 * i), seed: i * 10 + j, u: ease(seg(t, th, th + 0.12))}); });
	if (t >= hits[2]) cracks.push({x: bx, y: by - MTOP * k0, a: 90, len: MTOP * k0, seed: 77, u: ease(seg(t, hits[2], hits[2] + 0.08))});
	const fall = (dl: number) => cl((t - tb - dl) / 0.42), fallA = (u: number) => 96 * u * u;
	const uL = fall(0.03), uR = fall(0), landed = t > tb + 0.48, reveal = t >= tb;
	const dust = seg(t, tb + 0.4, tb + 1.4);
	const molten = lerp(0.42, 0.12, seg(t, tb, t1));
	const shake = hits.reduce((a, h) => a + (t >= h ? Math.exp(-(t - h) * 22) * Math.sin((t - h) * 90) * 3 : 0), 0);
	/* a second man holds a torch up, back left */
	const tf = proj(zs0, [-219, -14, 0]), kT = f / tf[2], tfl = flick(t, 11);
	const torchS = poseFK({hip: [0, -90], lean: -2, neck: 4, tilt: 8, fN: [10, -8], fF: [-12, -8], hN: [18, -176 + 2 * Math.sin(t * 2.2)], hF: [14, -96]});
	const flameP = toScr([22, -214], tf[0], tf[1], kT, true);
	return <AbsoluteFill style={{background: '#070404'}}>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<g transform={`translate(0,${shake.toFixed(2)})`}>
			<g transform={Lt(D0 + 420)}>
				<rect x={-800} y={-600} width={3600} height={2200} fill="#0A0605" />
				<rect x={-800} y={430} width={3600} height={360} fill="#170E09" />
				{Array.from({length: 8}, (_, i) => <path key={i} d={`M-800,${450 + i * 42} L2800,${446 + i * 42}`} stroke="#0E0806" strokeWidth={3} />)}
				{[-60, 640, 1180, 2100].map((x, i) => <rect key={i} x={x} y={-300} width={40} height={1100} fill="#090504" />)}
				<Glow x={1560} y={640} r={640} c="#FF7A2A" o={0.5 * flick(t, 2)} id="jfur" sy={0.8} />
				<path d={sm([[1430, 800], [1450, 600], [1500, 520], [1640, 520], [1690, 600], [1710, 800]])} fill="#2A180E" />
				<path d={sm([[1530, 800], [1530, 730], [1570, 700], [1610, 730], [1610, 800]])} fill="#FFB050" opacity={0.85 * flick(t, 2)} />
				<rect x={-800} y={780} width={3600} height={900} fill="#120B07" />
			</g>
			<g transform={Lt(D0 + 160)}>
				<Glow x={flameP[0]} y={flameP[1]} r={260} c="#FFB060" o={0.4 * tfl} id="jtg" />
				<Sil id="jTo" x={tf[0]} y={tf[1]} k={kT} flip rim="#FFC070" lx={-0.3} ly={-1} rimW={3.6}><Body2 s={torchS} dress="tunic" hat="knot" /><path d={tube([18, -170], [22, -210], 1.6, 1.4)} /></Sil>
				<g transform={`translate(${f1(flameP[0])},${f1(flameP[1])}) scale(${(kT * (0.9 + 0.15 * tfl)).toFixed(3)})`}><path d={sm([[-4, 2], [-3, -5], [0, -13 - 2 * Math.sin(t * 13)], [3, -5], [4, 2]])} fill="#FFB040" /><path d="M-1.6,1 C-1.6,-3 0,-7 0,-7 C0,-7 1.6,-3 1.6,1 Z" fill="#FFF0C0" /></g>
			</g>
			<g transform={Lt(D0)}>
				<Glow x={bx} y={by - 10} r={700} c="#FF8A3A" o={0.25 + 0.2 * (reveal ? 1 : 0)} id="jpool" sy={0.2} />
				{reveal && <Glow x={bx} y={by - 19 * k0} r={360 + 80 * Math.sin(t * 2)} c="#FFC060" o={0.45 * seg(t, tb, tb + 0.4)} id="jhalo" />}
				{landed && <>{shard(bx - 300, by + 20, 200, 80, -14, 0)}{shard(bx + 270, by + 26, 210, 86, 12, 1)}{shard(bx - 150, by + 60, 150, 60, -30, 2)}{shard(bx + 150, by + 64, 140, 58, 26, 3)}</>}
				{!reveal && <Mould bx={bx} by={by} k={k0} id="jmo" t={t} glowZ={lerp(10, 40, seg(t, t0, tb))} heat={0.3} cracks={cracks} />}
			</g>
			{reveal && <Zun cam={cam} light={LJ} id="jz" patina={0} fresh={1} molten={molten} shadow inscription={false} />}
			<g transform={Lt(D0)}>
				{reveal && !landed && <>
					<g transform={`rotate(${(-fallA(uL)).toFixed(2)} ${f1(bx - mhw(0) * k0)} ${f1(by)})`}><Mould bx={bx} by={by} k={k0} id="jmL" t={t} heat={0.3} cracks={cracks} side="L" cup={false} /></g>
					<g transform={`rotate(${fallA(uR).toFixed(2)} ${f1(bx + mhw(0) * k0)} ${f1(by)})`}><Mould bx={bx} by={by} k={k0} id="jmR" t={t} heat={0.3} cracks={cracks} side="R" cup={false} /></g></>}
				{dust > 0 && dust < 1 && [-1, 1].map((sg) => <ellipse key={sg} cx={bx + sg * (mhw(0) + 30) * k0 * (0.8 + 0.4 * dust)} cy={by - 10} rx={120 * (0.5 + dust)} ry={40 * (0.5 + dust)} fill="#8A6A50" opacity={0.3 * (1 - dust)} />)}
				<Sil id="jCa" x={cxC} y={cyC} k={k0} flip rim="#FFC070" lx={1} ly={-0.1} rimW={4.4} fill="#160D08"><Body2 s={mp.s} dress="tunic" hat="knot" />
					<path d={tube(addP(mp.hand, mp.dir, -14), addP(mp.head, mp.dir, -5), 1.9, 2.1)} />
					<g transform={`translate(${f1(mp.head[0])},${f1(mp.head[1])}) rotate(${(Math.atan2(mp.dir[1], mp.dir[0]) / D2R).toFixed(1)})`}><rect x={-6} y={-9} width={12} height={18} rx={2.5} /></g></Sil>
				{near > 0.05 && <Glow x={headS[0]} y={headS[1]} r={90} c="#FFC070" o={0.55 * near} id="jhf" />}
				{hits.map((h, i) => <Sparks key={i} t={t} x={hitR[0]} y={hitR[1] + i * 10} t0={h} t1={h + 0.04} n={18} seed={50 + i} sp={380} g={1300} life={0.55} dir={-20} spread={120} w={4} c1="#E8A878" c2="#6A4028" />)}
			</g>
			{reveal && <Steam t={t} x={960} y={cyT + 60} w={300} h={700} n={18} seed={3} id="jst" o={0.32 * seg(t, tb, tb + 0.5) * (1 - 0.4 * pu)} v={0.5} blur={24} r0={70} />}
			{reveal && <Steam t={t} x={960 + 200 * Math.sin(t * 0.7)} y={1300} w={1600} h={1600} n={9} seed={9} id="jsf" o={0.16 * seg(t, tb + 0.4, tb + 1.2) * (1 - seg(pu, 0.75, 1))} v={0.35} blur={50} r0={260} />}
			<Embers t={t} n={34} x0={200} x1={1720} y0={80} y1={1080} seed={41} v={70} o={0.6} />
			</g>
		</svg>
		<svg width={W} height={H} style={{position: 'absolute'}}><Vig id="jv" a={0.62} /></svg>
		<FilmOv2 t={t} c={c} />
	</AbsoluteFill>; };
/** J's 2.5D layers: a layer at depth Dl (cm from the first camera) under a dolly from D0 to D, the zoom centre moving cy0 → cy */
const layerJ = (D0: number, D: number, cy0: number, cy: number) => (Dl: number) => { const m = Dl / Math.max(5, Dl - (D0 - D)); return `translate(960,${f1(cy)}) scale(${m.toFixed(4)}) translate(-960,${f1(-cy0)})`; };

/* ============================== K / L · the belly in relief (a dedicated macro drawing of the model's belly zone) ============================== */
/* the model's surface (zun55h's profile, Rz / rho), its belly motifs and horn, copied here and drawn smooth for close range */
const BRN = 9.4;
const ringQ = (th: number, r: number, z: number, n: number): V3 => { const k = r * rho(th, n); return [k * Math.cos(th), k * Math.sin(th), z]; };
const surfNQ = (th: number, z: number): V3 => { const e = 0.004, ez = 0.05, [r, n] = Rz(z), [r1, n1] = Rz(z + ez), [r0, n0] = Rz(z - ez);
	return nrm(cross(sub(ringQ(th + e, r, z, n), ringQ(th - e, r, z, n)), sub(ringQ(th, r1, z + ez, n1), ringQ(th, r0, z - ez, n0)))); };
const surfQ = (th: number, z: number, h = 0): V3 => { const [r, n] = Rz(z), p = ringQ(th, r, z, n); return h ? add(p, surfNQ(th, z), h) : p; };
type Mot = {pts: P[]; w: number; h: number};
const spiralM = (cx: number, cz: number, r: number, turns = 1.25, dir = 1, a0 = 0, n = 18): P[] => Array.from({length: n + 1}, (_, i) => { const u = i / n, a = a0 + dir * u * turns * 2 * Math.PI, rr = r * (1 - 0.72 * u); return [cx + rr * Math.cos(a), cz + rr * Math.sin(a)] as P; });
const BMOTS: (Mot & {key: string})[] = [
	{key: 'brow', w: 0.62, h: 0.5, pts: [[1.6, 14.55], [2.8, 15.5], [4.4, 16.05], [6.2, 15.95], [7.5, 15.2], [7.6, 14.2], [6.6, 13.35], [5.0, 13.1], [3.4, 13.45], [2.3, 14.0], [1.0, 14.15]]},
	{key: 'nose', w: 0.66, h: 0.5, pts: spiralM(2.0, 12.4, 0.9, 1.15, 1, Math.PI * 0.9)},
	{key: 'jaw', w: 0.66, h: 0.5, pts: [[0.8, 13.1], [2.6, 13.25], [3.9, 12.7], [4.1, 11.95]]},
	{key: 'jaw', w: 0.9, h: 0.62, pts: [[6.4, 12.9], [8.2, 13.45], [9.7, 13.0], [10.25, 12.15], [9.75, 11.7], [9.0, 12.0], [9.1, 12.55]]},
	{key: 'ear', w: 0.66, h: 0.5, pts: [[11.3, 21.5], [12.05, 19.9], [12.3, 17.4], [12.1, 15.0], [12.7, 12.8], [13.4, 12.15]]},
	{key: 'ear', w: 0.54, h: 0.45, pts: spiralM(11.0, 15.25, 1.0, 1.2, -1, 0)},
	{key: 'ear', w: 0.46, h: 0.38, pts: spiralM(3.6, 19.0, 0.7, 0.8, 1, Math.PI)},
	{key: 'band', w: 0.36, h: 0.3, pts: [[0.6, 11.75], [6, 11.7], [13.5, 11.7]]},
];
const COIL = {s: 7.1, z: 19.05, rs: 3.4, rz: 2.85};
const HORN: {s: number; z: number; h: number; w: number}[] = [
	{s: 0.8, z: 19.9, h: 0.3, w: 1.6}, {s: 2.0, z: 20.95, h: 0.5, w: 1.9},
	...Array.from({length: 22}, (_, i) => { const u = i / 21, a = (112 - 350 * u) * D2R, f = 1 - 0.68 * u;
		return {s: COIL.s + COIL.rs * f * Math.cos(a), z: COIL.z + COIL.rz * f * Math.sin(a), h: 0.75 + 1.9 * Math.pow(u, 1.1), w: 2.2 - 1.45 * u}; })];
const VOLUTE = {s: 6.9, z: 19.2, r: 0.62, lift: 2.0};
/** the macro horn: the same root and curl centre as the model's, drawn as a ram's horn — about 300° of curl, tapering to a point
    that stands 3.5 cm off the surface (卷角翘出器外) */
const HORN2: {s: number; z: number; h: number; w: number}[] = [
	{s: 0.1, z: 19.3, h: -0.05, w: 0.7}, {s: 0.8, z: 19.9, h: 0.25, w: 1.45}, {s: 2.1, z: 21.0, h: 0.55, w: 2.0},
	...Array.from({length: 24}, (_, i) => { const u = i / 23, a = (110 - 295 * u) * D2R, f = 1 - 0.42 * u;
		return {s: COIL.s + COIL.rs * f * Math.cos(a), z: COIL.z + COIL.rz * f * Math.sin(a), h: 0.75 + 2.75 * Math.pow(u, 1.35), w: 2.15 - 1.85 * Math.pow(u, 1.1)}; })];
const EYE = {s: 5.25, z: 14.7, r: 1.18, lift: 0.5};
/** the openwork flange column (zun55h `column`): outline in (r, z), its holes and incised lines */
const column = (z0: number, z1: number, ro: (z: number) => number, teeth: number[], Ls: number[], holes: boolean) => {
	const out: P[] = [], Hs: P[][] = [], I: P[][] = [];
	out.push([Rz(z1)[0] - 0.35, z1], [ro(z1), z1]);
	const order = teeth.map((tt, i) => ({tt, L: Ls[i]})).sort((a, b) => b.tt - a.tt);
	for (const {tt, L: Lk} of order) { const r = ro(tt);
		out.push([ro(tt + 0.001), tt + 0.05], [r + Lk - 0.15, tt + 0.12], [r + Lk + 0.18, tt - 0.08], [r + Lk + 0.32, tt - 0.55], [r + Lk + 0.26, tt - 1.05], [r + Lk + 0.02, tt - 1.4],
			[r + Lk - 0.32, tt - 1.22], [r + Lk - 0.36, tt - 0.86], [r + 0.15, tt - 0.78], [r - 0.55, tt - 0.82], [r - 0.92, tt - 1.12], [r - 1.0, tt - 1.55], [r - 0.82, tt - 1.95], [r - 0.4, tt - 2.12], [ro(tt - 2.15), tt - 2.15]);
		I.push([[r - 0.25, tt - 0.38], [r + Lk - 0.2, tt - 0.36], [r + Lk - 0.02, tt - 0.62], [r + Lk - 0.02, tt - 1.0]]);
		if (holes) { const zt = tt - 2.55, zb = tt - 3.55, a = Rz(zt)[0] + 0.4, b = Math.min(ro(zt) - 0.6, a + 1.15);
			if (b - a > 0.45 && zb > z0 + 0.25) Hs.push([[a + 0.2, zb], [b - 0.15, zb], [b, zb + 0.25], [b, zt - 0.3], [b - 0.3, zt], [a, zt], [a, zb + 0.2]]); } }
	out.push([ro(z0), z0]);
	for (let k = 0; k <= 12; k++) { const zz = lerp(z0, z1, k / 12); out.push([Rz(zz)[0] - 0.35, zz]); }
	return {out, holes: Hs, inc: I}; };
const FLANGE_COLS = [
	column(11.1, 22.85, (z) => Rz(z)[0] + 1.75, [22.8, 19.6, 15.8, 12.7], [1.25, 1.2, 1.2, 0.7], true),
	column(3.85, 10.95, (z) => Rz(z)[0] + 1.2, [10.9, 6.9], [0.7, 2.0], false),
	column(23.3, 34.4, (z) => Math.max(Rz(z)[0] + 0.9, lerp(11.0, 12.3, cl((z - 23.4) / (33.5 - 23.4)))), [32.8, 29.1, 25.4], [0.85, 0.9, 0.9], true)];
/** the 雷纹 cell: a squared spiral (unit cell, about 2 turns), mirrored on alternate cells so neighbours lock together */
const LEI2: P[] = [[-0.46, -0.46], [0.46, -0.46], [0.46, 0.46], [-0.3, 0.46], [-0.3, -0.3], [0.3, -0.3], [0.3, 0.3], [-0.14, 0.3], [-0.14, -0.14], [0.14, -0.14], [0.14, 0.12], [0.0, 0.12]];
type BLight = {dir: V3; key: RGB; keyK: number; amb: RGB; ambK: number; spec: number; shin: number; rim?: {dir: V3; c: RGB; k: number}};
type Trace = {pts: V3[]; p: number; w: number};
/** the belly in relief through a camera. th0..th1 / z0..z1: the patch drawn; dq: the ground mesh step (cm); dim: darken all;
    traces: gold lines over it (L) */
const Belly: React.FC<{cam: Cam; Lt: BLight; id: string; th0: number; th1: number; z0: number; z1: number; dq: number; dim?: number; traces?: Trace[]; side?: boolean; flanges?: boolean; nearCut?: number; spot?: [V3, number]}> =
	({cam, Lt, id, th0, th1, z0, z1, dq, dim = 0, traces = [], side = false, flanges = true, nearCut = 0, spot}) => {
	const L = nrm(Lt.dir), P3 = (q: V3) => proj(cam, q), dep = (q: V3) => toCam(cam, q)[2];
	const ppc = (q: V3) => cam.f / Math.max(1, dep(q));
	const vis = (q: V3, n: V3, m = 0) => dot(n, sub(cam.p, q)) > m;
	const onScr = (x: number, y: number, mg = 200) => x > -mg && x < W + mg && y > -mg && y < H + mg;
	const spotF = (q: V3) => (spot ? 0.18 + 0.82 * Math.exp(-Math.pow(Math.hypot(...sub(q, spot[0])) / spot[1], 2)) : 1);
	const shade = (n: V3, q: V3, alb: RGB, specK = 1): RGB => { const sf = spotF(q), l = Math.max(0, dot(n, L)) * sf, v = nrm(sub(cam.p, q)), hh = nrm(add(L, v)), sp = Math.pow(Math.max(0, dot(n, hh)), Lt.shin) * Lt.spec * specK * sf;
		const c: RGB = [0, 1, 2].map((i) => (alb[i] / 255) * (Lt.amb[i] * Lt.ambK + Lt.key[i] * Lt.keyK * l) + Lt.key[i] * sp) as RGB;
		if (Lt.rim) { const rr = Math.max(0, dot(n, nrm(Lt.rim.dir))) * Math.pow(1 - Math.abs(dot(n, v)), 1.5) * Lt.rim.k; for (let i = 0; i < 3; i++) c[i] += Lt.rim.c[i] * rr; }
		return mixc(c, [8, 5, 3], dim); };
	const GOLD_G: RGB = [150, 104, 52], GOLD_P: RGB = [190, 140, 74], GOLD_R: RGB = [214, 166, 92];
	const zone = (z: number) => z > 11.95 && z < 22.35;
	/* screen direction toward the light (for lips and highlights) */
	const c0 = surfQ((th0 + th1) / 2, (z0 + z1) / 2), pc = P3(c0), pl = P3(add(c0, L, 2)), lsv = nzP([pl[0] - pc[0], pl[1] - pc[1]]);
	const out: React.ReactNode[] = [];
	/* the side flanges (θ = ±90°) stand in the plane through the axis, behind everything on the front half: they go in `back`, drawn
	   first, so the ground, the motifs and the horns cover them and only their outer teeth show at the sides (owner 11-02) */
	const back: React.ReactNode[] = [];
	/* 1 · the ground: a fine mesh shaded per facet */
	const nt = Math.max(2, Math.ceil(((th1 - th0) * BRN) / dq)), nz = Math.max(2, Math.ceil((z1 - z0) / dq));
	const grid: [number, number, number][][] = [];
	for (let i = 0; i <= nt; i++) { const row: [number, number, number][] = []; const th = lerp(th0, th1, i / nt); for (let j = 0; j <= nz; j++) { const q = P3(surfQ(th, lerp(z0, z1, j / nz))); row.push(q); } grid.push(row); }
	for (let i = 0; i < nt; i++) for (let j = 0; j < nz; j++) { const a = grid[i][j], b = grid[i + 1][j], cc = grid[i + 1][j + 1], d = grid[i][j + 1];
		if (a[2] < 1 || cc[2] < 1) continue; if (!onScr((a[0] + cc[0]) / 2, (a[1] + cc[1]) / 2, 120)) continue;
		const th = lerp(th0, th1, (i + 0.5) / nt), z = lerp(z0, z1, (j + 0.5) / nz), q = surfQ(th, z), n = surfNQ(th, z); if (!vis(q, n)) continue;
		const col = rgb(shade(n, q, zone(z) ? GOLD_G : GOLD_P, zone(z) ? 0.35 : 0.8));
		out.push(<path key={`q${i}_${j}`} d={`M${f1(a[0])},${f1(a[1])}L${f1(b[0])},${f1(b[1])}L${f1(cc[0])},${f1(cc[1])}L${f1(d[0])},${f1(d[1])}Z`} fill={col} stroke={col} strokeWidth={0.8} strokeLinejoin="round" />); }
	/* 2 · the 雷纹 ground: sunk squared spirals, a dark groove with a lit far wall */
	const cell = 0.56, gz0 = 12.05, gz1 = 22.25, sMax = 13.6;
	for (let r = 0; r < Math.floor((gz1 - gz0) / cell); r++) { const zc = gz0 + (r + 0.5) * cell; let dG = '', dL = ''; let pxw = 0, cnt = 0;
		for (let ci = -Math.ceil(sMax / cell); ci <= Math.ceil(sMax / cell); ci++) { const sc = (ci + 0.5 + (r % 2) * 0.5) * cell; if (Math.abs(sc) < 0.85 || Math.abs(sc) > sMax) continue;
			const thc = sc / BRN; if (thc < th0 - 0.05 || thc > th1 + 0.05) continue;
			const qc = surfQ(thc, zc), pcc = P3(qc); if (pcc[2] < 1 || !onScr(pcc[0], pcc[1], 60) || !vis(qc, surfNQ(thc, zc), 2)) continue;
			const fl = (ci + r) % 2 ? 1 : -1, rt = (ci * 7 + r * 3) % 4;
			const jx = (rnd(ci * 7 + r * 131, 3) - 0.5) * 0.12 * cell, jz = (rnd(ci * 5 + r * 97, 4) - 0.5) * 0.12 * cell, cs = cell * (0.86 + 0.12 * rnd(ci + r * 53, 5));
			const pts = LEI2.map(([x, y]) => { const xx = rt % 2 ? y : x, yy = rt % 2 ? -x : y; const p = P3(surfQ((sc + jx + fl * xx * cs) / BRN, zc + jz + yy * cs, 0.01)); return p; });
			dG += 'M' + pts.map((p) => `${f1(p[0])},${f1(p[1])}`).join('L'); dL += 'M' + pts.map((p) => `${f1(p[0] - lsv[0] * 1.6)},${f1(p[1] - lsv[1] * 1.6)}`).join('L');
			pxw += ppc(qc); cnt++; }
		if (cnt) { const w = Math.max(0.6, 0.075 * pxw / cnt);
			out.push(<g key={`lei${r}`}><path d={dL} fill="none" stroke="#FFDCA0" strokeOpacity={0.2 * (1 - dim)} strokeWidth={w * 0.7} strokeLinejoin="round" />
				<path d={dG} fill="none" stroke="#1A0E06" strokeOpacity={0.48} strokeWidth={w} strokeLinejoin="round" /></g>); } }
	/* a relief band: shadow, wall, top, the lit edge, an incised line along its crest */
	const relief = (pts2: P[], w: number, h: number, key: string, sg: number) => {
		const sp = crSample(pts2.map(([s, z]) => [sg * s, z] as P), Math.max(12, pts2.length * 6)), runs: P[][] = []; let cur: P[] = [];
		sp.forEach(([s, z]) => { const th = s / BRN; const q = surfQ(th, z); if (th >= th0 - 0.1 && th <= th1 + 0.1 && vis(q, surfNQ(th, z), 0.5) ) cur.push([s, z]); else { if (cur.length > 1) runs.push(cur); cur = []; } });
		if (cur.length > 1) runs.push(cur);
		runs.forEach((run, ri) => { const mid = run[Math.floor(run.length / 2)], thm = mid[0] / BRN, n = surfNQ(thm, mid[1]), q0 = surfQ(thm, mid[1], h);
			const sh = sub(L, [n[0] * dot(L, n), n[1] * dot(L, n), n[2] * dot(L, n)]), lt = Math.max(0.15, dot(L, n)), shK = h / lt * 0.9;
			const path = (hh: number, off: V3 = [0, 0, 0], so = 0) => 'M' + run.map(([s, z]) => { const p = P3(add(surfQ(s / BRN, z, hh), off)); return `${f1(p[0] + lsv[0] * so)},${f1(p[1] + lsv[1] * so)}`; }).join('L');
			const pw = w * ppc(q0), base = shade(n, q0, GOLD_R, 1.2), hi = mixc(base, [255, 236, 196], 0.22), lo = mixc(base, [20, 12, 6], 0.7);
			const nearO = nearCut > 0 ? seg(Math.min(...run.map(([s2, z2]) => dep(surfQ(s2 / BRN, z2, h)))), nearCut, nearCut + 4) : 1; if (nearO <= 0.01) return;
			out.push(<g key={`${key}${ri}`} opacity={nearO}>
				<path d={path(0.02, [-sh[0] * shK, -sh[1] * shK, -sh[2] * shK])} fill="none" stroke="#120904" strokeOpacity={0.45 * (1 - dim * 0.5)} strokeWidth={pw * 1.15} strokeLinecap="round" strokeLinejoin="round" />
				<path d={path(h * 0.35)} fill="none" stroke={rgb(lo)} strokeWidth={pw * 1.08} strokeLinecap="round" strokeLinejoin="round" />
				<path d={path(h)} fill="none" stroke={rgb(base)} strokeWidth={pw * 0.86} strokeLinecap="round" strokeLinejoin="round" />
				<path d={path(h, [0, 0, 0], pw * 0.26)} fill="none" stroke={rgb(hi)} strokeWidth={pw * 0.24} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
				<path d={path(h + 0.01)} fill="none" stroke="#2A1608" strokeOpacity={0.55} strokeWidth={Math.max(0.6, pw * 0.1)} strokeLinecap="round" /></g>); }); };
	/* 3 · the fillets around the zone edges */
	[[11.7, 0.36, 0.3], [22.5, 0.42, 0.34], [23.25, 0.3, 0.28], [25.95, 0.3, 0.28]].forEach(([z, w, h], i) => { if (z < z0 - 0.5 || z > z1 + 0.5) return;
		const pts: P[] = Array.from({length: 41}, (_, j) => [lerp(th0, th1, j / 40) * BRN, z] as P); relief(pts, w, h, `fil${i}`, 1); });
	/* 4 · the face motifs, both halves */
	[1, -1].forEach((sg) => BMOTS.filter((m) => m.key !== 'band').forEach((m, mi) => relief(m.pts, m.w * 1.25, m.h, `m${sg}_${mi}`, sg)));
	/* 5 · the eyes: bulging spheres in their sockets */
	[1, -1].forEach((sg) => { const th = (sg * EYE.s) / BRN; if (th < th0 - 0.1 || th > th1 + 0.1) return; const n = surfNQ(th, EYE.z), c = surfQ(th, EYE.z, EYE.lift); if (!vis(c, n, -2)) return;
		const q = P3(c), r = EYE.r * cam.f / q[2], base = shade(n, c, GOLD_R, 1.6), gid = `${id}e${sg}`;
		out.push(<g key={`eye${sg}`}><defs><radialGradient id={gid} cx="50%" cy="50%" r="50%" fx={`${50 + 30 * lsv[0]}%`} fy={`${50 + 30 * lsv[1]}%`}>
			<stop offset="0" stopColor={rgb(mixc(base, [255, 248, 225], 0.65))} /><stop offset="0.35" stopColor={rgb(base)} /><stop offset="0.85" stopColor={rgb(mixc(base, [30, 18, 8], 0.55))} /><stop offset="1" stopColor={rgb(mixc(base, [10, 6, 3], 0.8))} /></radialGradient></defs>
			<circle cx={q[0] - lsv[0] * r * 0.32} cy={q[1] - lsv[1] * r * 0.32} r={r * 1.12} fill="#0C0703" opacity={0.6} />
			<circle cx={q[0]} cy={q[1]} r={r} fill={`url(#${gid})`} />
			<circle cx={q[0]} cy={q[1]} r={r * 0.62} fill="none" stroke="#2A1608" strokeWidth={Math.max(0.8, r * 0.05)} opacity={0.45} />
			<ellipse cx={q[0] + lsv[0] * r * 0.42} cy={q[1] + lsv[1] * r * 0.42} rx={r * 0.16} ry={r * 0.1} fill="#FFF8E6" opacity={0.85 * (1 - dim)} /></g>); });
	/* 6 · the horns: tapered ram's horns curling up off the surface — stacked offset outlines shade across the curl, ridges ring it,
	   and a soft shadow falls on the 雷纹 ground first */
	[1, -1].forEach((sg) => { const N = 110, sp = crSample(HORN2.map((h) => [sg * h.s, h.z] as P), N), hs = crSample(HORN2.map((h, i) => [i, h.h] as P), N), ws = crSample(HORN2.map((h, i) => [i, h.w] as P), N);
		const C = sp.map(([s, z], i) => ({th: s / BRN, z, h: hs[i][1], w: Math.max(0.14, ws[i][1])}));
		const midTh = C[Math.floor(C.length / 2)].th; if (midTh < th0 - 0.05 || midTh > th1 + 0.05) return;
		const c3 = C.map((q) => surfQ(q.th, q.z, q.h)), pp = c3.map(P3), R = C.map((q, i) => (q.w / 2) * cam.f / Math.max(1, pp[i][2]));
		const n0 = surfNQ(C[50].th, C[50].z), shv = sub(L, [n0[0] * dot(L, n0), n0[1] * dot(L, n0), n0[2] * dot(L, n0)]), lt = Math.max(0.25, dot(L, n0));
		const shP = C.map((q) => { const p = P3(add(surfQ(q.th, q.z, 0.02), shv, -q.h / lt)); return [p[0], p[1]] as P; });
		out.push(<g key={`hsh${sg}`} filter={`url(#${id}hsb)`} opacity={0.62 * (1 - dim * 0.4)}>{shP.slice(0, -1).map((p, i) => <path key={i} d={`M${f1(p[0])},${f1(p[1])}L${f1(shP[i + 1][0])},${f1(shP[i + 1][1])}`} stroke="#0A0502" strokeWidth={R[i] * 1.8 + 4} strokeLinecap="round" />)}</g>);
		const nrmS = (i: number): P => { const a = pp[Math.max(0, i - 1)], b = pp[Math.min(pp.length - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1; return [-ty / l, tx / l]; };
		const NL = 8, nm = C.map((_, i) => nrmS(i));
		const nN = surfNQ(C[45].th, C[45].z), base = shade(nN, c3[45], [210, 160, 88], 1), dark = mixc(base, [26, 14, 6], 0.8), lit = mixc(shade(L, c3[45], [210, 160, 88], 1.6), [255, 226, 160], 0.12);
		const dm = (cc: RGB) => rgb(mixc(cc, [8, 5, 3], dim));
		[[0, 28], [27, 56], [55, 84], [83, N]].forEach(([a, b], ci) => { const idx = idx2(a, Math.min(b, pp.length - 1));
			for (let l = 0; l < NL; l++) { const kk = l / (NL - 1), rr = 1 - 0.12 * l;
				const side = (sgn: number) => idx.map((i) => { const o = dot2(lsv, nm[i]) * R[i] * 0.1 * l; return `${f1(pp[i][0] + nm[i][0] * (sgn * R[i] * rr + o))},${f1(pp[i][1] + nm[i][1] * (sgn * R[i] * rr + o))}`; });
				const d = 'M' + side(1).join('L') + 'L' + side(-1).reverse().join('L') + 'Z', col = mixc(dark, lit, Math.pow(kk, 1.4));
				out.push(<path key={`h${sg}_${ci}_${l}`} d={d} fill={dm(col)} stroke={dm(col)} strokeWidth={0.6} />); }
			/* the ridges round the horn (its growth rings), bowed toward the tip */
			idx.filter((i) => i % 5 === 2 && i < N - 6).forEach((i) => { const tg: P = [nm[i][1], -nm[i][0]], r = R[i] * 0.94, bw = R[i] * 0.38;
				const A: P = [pp[i][0] + nm[i][0] * r, pp[i][1] + nm[i][1] * r], B: P = [pp[i][0] - nm[i][0] * r, pp[i][1] - nm[i][1] * r], Cq: P = [pp[i][0] + tg[0] * bw, pp[i][1] + tg[1] * bw];
				const dd = `M${f1(A[0])},${f1(A[1])} Q${f1(Cq[0])},${f1(Cq[1])} ${f1(B[0])},${f1(B[1])}`, w = Math.max(0.8, R[i] * 0.075);
				out.push(<g key={`hr${sg}_${i}`}><path d={dd} fill="none" stroke="#2A1608" strokeWidth={w} opacity={0.42} /><path d={dd} fill="none" stroke="#FFE2A8" strokeWidth={w * 0.6} opacity={0.22 * (1 - dim)} transform={`translate(${f1(tg[0] * w * 1.4)},${f1(tg[1] * w * 1.4)})`} /></g>); }); });
		const e = pp[pp.length - 1]; out.push(<circle key={`ht${sg}`} cx={e[0]} cy={e[1]} r={Math.max(1, R[R.length - 1])} fill={dm(mixc(dark, lit, 0.7))} />); });
	/* 7 · the flanges (the face's nose at θ = 0; the side ones at ±90° when in view): extruded openwork plates */
	const area = (pg: P[]) => pg.reduce((s2, q, i) => { const r2 = pg[(i + 1) % pg.length]; return s2 + q[0] * r2[1] - r2[0] * q[1]; }, 0) / 2;
	(flanges ? (side ? [-Math.PI / 2, Math.PI / 2, 0] : [0]) : []).forEach((tf) => { if (tf < th0 - 0.3 || tf > th1 + 0.3) return; const rad: V3 = [Math.cos(tf), Math.sin(tf), 0], tan: V3 = [-Math.sin(tf), Math.cos(tf), 0], th = 1.05;
		FLANGE_COLS.forEach((pl, pi) => { const zs = pl.out.map((q) => q[1]); if (Math.max(...zs) < z0 - 1 || Math.min(...zs) > z1 + 1) return;
			const to3 = (q: P, tt: number): V3 => [rad[0] * q[0] + tan[0] * tt, rad[1] * q[0] + tan[1] * tt, q[1]];
			const cz = pl.out.reduce((s2, q) => s2 + q[1], 0) / pl.out.length, cr = pl.out.reduce((s2, q) => s2 + q[0], 0) / pl.out.length, cen = to3([cr, cz], 0);
			const facing = dot(tan, sub(cam.p, cen)) > 0 ? 1 : -1, tN = (facing * th) / 2, edges: {z: number; el: React.ReactNode}[] = [];
			[pl.out, ...pl.holes].forEach((pg, hi) => { const sgn = (area(pg) > 0 ? 1 : -1) * (hi === 0 ? 1 : -1);
				pg.forEach((q, i) => { const q2 = pg[(i + 1) % pg.length], dr = q2[0] - q[0], dz = q2[1] - q[1], ln = Math.hypot(dr, dz) || 1, n3 = nrm([rad[0] * (sgn * dz) / ln, rad[1] * (sgn * dz) / ln, (-sgn * dr) / ln]);
					const A = to3(q, -th / 2), B = to3(q2, -th / 2), Cc = to3(q2, th / 2), Dd = to3(q, th / 2), m: V3 = [(A[0] + Cc[0]) / 2, (A[1] + Cc[1]) / 2, (A[2] + Cc[2]) / 2];
					if (dot(n3, sub(cam.p, m)) <= 0) return; const pa = P3(A), pb = P3(B), pc2 = P3(Cc), pd = P3(Dd), col = rgb(shade(n3, m, GOLD_R, 1.3));
					edges.push({z: dep(m), el: <path key={`${hi}_${i}`} d={`M${f1(pa[0])},${f1(pa[1])}L${f1(pb[0])},${f1(pb[1])}L${f1(pc2[0])},${f1(pc2[1])}L${f1(pd[0])},${f1(pd[1])}Z`} fill={col} stroke={col} strokeWidth={0.7} strokeLinejoin="round" />}); }); });
			edges.sort((a, b) => b.z - a.z);
			const face = [pl.out, ...pl.holes].map((pg) => 'M' + pg.map((q) => { const p = P3(to3(q, tN)); return `${f1(p[0])},${f1(p[1])}`; }).join('L') + 'Z').join('');
			const fn: V3 = facing > 0 ? tan : [-tan[0], -tan[1], 0], faceC = shade(fn, cen, GOLD_P, 0.8);
			const dI = pl.inc.map((pg) => 'M' + pg.map((q) => { const p = P3(to3(q, tN)); return `${f1(p[0])},${f1(p[1])}`; }).join('L')).join('');
			(tf === 0 ? out : back).push(<g key={`fl${tf.toFixed(2)}_${pi}`}>{edges.map((e) => e.el)}<path d={face} fill={rgb(faceC)} fillRule="evenodd" />
				<path d={dI} fill="none" stroke="#1E1006" strokeOpacity={0.7} strokeWidth={Math.max(0.8, 0.14 * ppc(cen))} strokeLinecap="round" strokeLinejoin="round" /></g>); }); });
	/* 8 · gold traces (L) */
	if (traces.length) { const tr = traces.map((tc, i) => { if (tc.p <= 0) return null; const d = 'M' + tc.pts.map((q) => { const p = P3(q); return `${f1(p[0])},${f1(p[1])}`; }).join('L');
		return {i, d, p: tc.p, w: tc.w * ppc(tc.pts[0])}; }).filter(Boolean) as {i: number; d: string; p: number; w: number}[];
		const dash = (p: number) => (p >= 1 ? {} : {pathLength: 1, strokeDasharray: '1 1', strokeDashoffset: 1 - p});
		out.push(<g key="tr"><defs><filter id={`${id}tb`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={7} /></filter></defs>
			<g filter={`url(#${id}tb)`} opacity={0.9}>{tr.map((x) => <path key={x.i} d={x.d} fill="none" stroke="#FFB840" strokeWidth={x.w * 3} strokeLinecap="round" strokeLinejoin="round" {...dash(x.p)} />)}</g>
			{tr.map((x) => <path key={`c${x.i}`} d={x.d} fill="none" stroke="#FFD87A" strokeWidth={x.w} strokeLinecap="round" strokeLinejoin="round" {...dash(x.p)} />)}
			{tr.map((x) => <path key={`h${x.i}`} d={x.d} fill="none" stroke="#FFF6DA" strokeWidth={x.w * 0.35} strokeLinecap="round" strokeLinejoin="round" {...dash(x.p)} />)}</g>); }
	return <g><defs><filter id={`${id}hsb`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={9} /></filter></defs>{back}{out}</g>; };
const dot2 = (a: P, b: P) => a[0] * b[0] + a[1] * b[1];
const idx2 = (a: number, b: number) => Array.from({length: Math.max(0, b - a + 1)}, (_, j) => a + j);

/* ============================== K · 60.32 the macro slide across the belly ============================== */
const CK: React.FC<{t: number}> = ({t}) => {
	const c = card2('K'), t0 = c.t, u = ease(seg(t, t0 - 0.3, t0 + 5.3));
	/* the target slides from the eye up to the horn's curl; the camera swings from left of it to right of it, so the horn turns toward the lens */
	const sT = lerp(4.6, 8.4, u), zT = lerp(15.9, 19.0, u), thT = sT / BRN, T = surfQ(thT, zT, 1.0);
	const off = lerp(-0.28, 0.46, u), d = lerp(20, 15.5, u), phi = thT + off * 0.55, R = 9.6 + d;
	const P0: V3 = [R * Math.cos(phi), R * Math.sin(phi), zT + lerp(3.4, 1.8, u)];
	const cam = lookAt(P0, T, 120 * Math.hypot(...sub(P0, T)), 1000, 600);
	const ra = 0.62, lel = lerp(0.4, 0.62, u), tg: V3 = [Math.sin(ra), -Math.cos(ra), 0], nn: V3 = [Math.cos(ra), Math.sin(ra), 0];
	const Lt: BLight = {dir: nrm(add(add(tg, nn, 0.3), [0, 0, 1], lel)), key: hexc("#FFD2A0"), keyK: 1.62, amb: hexc("#5A3A22"), ambK: 0.32, spec: 1.0, shin: 22, rim: {dir: [-Math.cos(ra + 1), -Math.sin(ra + 1), 0.2], c: hexc('#FF8A40'), k: 0.45}};
	return <AbsoluteFill style={{background: '#0A0604'}}>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<defs><radialGradient id="ksub" cx="22%" cy="16%" r="40%"><stop offset="0" stopColor="#0A0604" stopOpacity={0.55} /><stop offset="1" stopColor="#0A0604" stopOpacity={0} /></radialGradient></defs>
			<Belly cam={cam} Lt={Lt} id="kb" th0={-0.1} th1={1.55} z0={10.6} z1={23.8} dq={0.32} flanges={false} nearCut={12} spot={[surfQ(0.66, 17.4, 0), 7]} />
			<rect width={W} height={H} fill="url(#ksub)" />
			<Steam t={t} x={1100 + 300 * Math.sin(t * 0.4)} y={1250} w={1800} h={1500} n={8} seed={12} id="kst" o={0.12} v={0.3} blur={60} r0={240} />
			<Embers t={t} n={22} x0={0} x1={1920} y0={0} y1={1080} seed={61} v={110} o={0.55} r={3.4} />
		</svg>
		<svg width={W} height={H} style={{position: 'absolute'}}><Vig id="kv" a={0.72} /></svg>
		<FilmOv2 t={t} c={c} />
	</AbsoluteFill>; };

/* ============================== L · 64.85 front-on: the face traced in gold ============================== */
const lift3 = (pts: P[], sg: number, h: number, n = 40): V3[] => crSample(pts.map(([s, z]) => [sg * s, z] as P), n).map(([s, z]) => surfQ(s / BRN, z, h));
const CL: React.FC<{t: number}> = ({t}) => {
	const c = card2('L'), t0 = c.t;
	const u = ease(seg(t, t0, t0 + 1.7)), p0 = seg(t, t0 + 1.0, t0 + 4.52), p = 0.6 * p0 + 0.4 * ease(p0);
	const az = lerp(13, 0, u), D = lerp(60, 80, u) - 16 * p, zt = lerp(18.2, 17.0, u) + 0.6 * p;
	const cam = camAt(az, lerp(9, 3, u) + 5 * p, D, [0, 0, zt], 4000, 960, 650 + 30 * p);
	const Lt: BLight = {dir: nrm([0.62, -0.5, 0.62]), key: hexc('#FFD2A0'), keyK: 1.45, amb: hexc('#5A3A22'), ambK: 0.34, spec: 1.0, shin: 20, rim: {dir: [-0.5, 0.75, 0.3], c: hexc('#FF8A40'), k: 0.6}};
	const b = [0, 1, 2, 3, 4, 5].map((i) => t0 + 0.57 + i * BEAT);      // eyes 65.42, brows 65.98, nose 66.55, horns 67.11, jaws 67.68, whole 68.24
	const pr = (i: number, dur = 0.5) => ease(seg(t, b[i], b[i] + dur));
	const traces: Trace[] = [];
	[1, -1].forEach((sg) => {
		traces.push({pts: Array.from({length: 33}, (_, i) => { const a = (i / 32) * 2 * Math.PI; return surfQ((sg * (EYE.s + 1.42 * Math.cos(a))) / BRN, EYE.z + 1.42 * Math.sin(a), EYE.lift + 0.6); }), p: pr(0), w: 0.1});
		traces.push({pts: lift3(BMOTS[0].pts, sg, 0.62), p: pr(1), w: 0.09});
		traces.push({pts: lift3(BMOTS[1].pts, sg, 0.62), p: pr(2, 0.4), w: 0.09});
		{ const hs2 = crSample(HORN2.map((h, i) => [i, h.h + h.w * 0.55] as P), 70); traces.push({pts: crSample(HORN2.map((h) => [sg * h.s, h.z] as P), 70).map(([s2, z], i) => surfQ(s2 / BRN, z, hs2[i][1])), p: pr(3, 0.55), w: 0.1}); }
		traces.push({pts: lift3(BMOTS[2].pts, sg, 0.62), p: pr(4, 0.4), w: 0.09});
		traces.push({pts: lift3(BMOTS[3].pts, sg, 0.72), p: pr(4, 0.5), w: 0.09}); });
	traces.push({pts: Array.from({length: 30}, (_, i) => { const z = lerp(22.6, 11.6, i / 29); return [Rz(z)[0] + 2.0, 0, z] as V3; }), p: pr(2, 0.45), w: 0.1});
	/* the whole head: a contour round eyes, horns and jaws, drawn on the last beat; below it, nothing */
	const head: P[] = [[0, 23.0], [5, 22.9], [9.5, 22.6], [11.6, 21.4], [12.9, 18.8], [12.6, 15.5], [11.2, 13.0], [8.2, 11.9], [4.5, 12.1], [1.2, 11.7], [0, 11.6]];
	const whole = pr(5, 0.55);
	[1, -1].forEach((sg) => traces.push({pts: lift3(head, sg, 0.9, 60), p: whole, w: 0.07}));
	const dim = 0.34 * ease(seg(t, b[5], b[5] + 0.5));
	const glowPulse = whole > 0 ? 0.25 + 0.75 * Math.exp(-(t - b[5] - 0.5) * 2.5) : 0;
	return <AbsoluteFill style={{background: '#0A0604'}}>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<defs><radialGradient id="lbg" cx="50%" cy="60%" r="70%"><stop offset="0" stopColor="#3A2412" /><stop offset="1" stopColor="#0A0604" /></radialGradient></defs>
			<rect width={W} height={H} fill="url(#lbg)" />
			<Belly cam={cam} Lt={Lt} id="lb" th0={-1.62} th1={1.62} z0={8.6} z1={27.5} dq={0.42} traces={traces} dim={dim} side />
			{whole > 0 && <Glow x={960} y={600} r={620} c="#FFB050" o={0.2 * glowPulse} id="lgp" sy={0.6} />}
			<Embers t={t} n={22} x0={0} x1={1920} y0={0} y1={1080} seed={71} v={70} o={0.5} r={3} />
		</svg>
		<svg width={W} height={H} style={{position: 'absolute'}}><Vig id="lv" a={0.7} /></svg>
		<FilmOv2 t={t} c={c} />
	</AbsoluteFill>; };

/* ============================== M · 69.37 crane up: 天圆地方 ============================== */
const LM2: ZunLight = {dir: [0.5, -0.45, 0.74], col: '#FFD8A0', k: 1.45, amb: 0.32, ambCol: '#5A3E2C', spec: 1.2, shin: 20, rim: {dir: [-0.6, 0.6, 0.4], col: '#FF9A50', k: 0.7}, inside: 0.75};
const BEAK: P[] = [[13.35, 34.9], [13.8, 36.0], [14.05, 37.0], [14.2, 38.0], [14.3, 38.6], [15.2, 38.62], [15.6, 38.98], [16.05, 38.64], [17.5, 38.35], [18.45, 37.75], [18.85, 36.6],
	[18.8, 35.3], [18.55, 34.3], [18.2, 33.75], [17.75, 33.95], [17.75, 35.1], [17.45, 35.95], [16.7, 36.3], [15.8, 36.05], [14.9, 35.6], [14.0, 35.0], [13.4, 34.55]];
const CM: React.FC<{t: number}> = ({t}) => {
	const c = card2('M'), t0 = c.t, t1 = t0 + 4.53;
	const u = seg(t, t0 - 0.05, 73.8667), e = 0.72 * (1 - Math.pow(1 - u, 2.4)) + 0.28 * u, e2 = 0.55 * (1 - Math.pow(1 - u, 1.8)) + 0.45 * u;
	const bp = t > t0 + 2.2 ? Math.exp(-beatPh(t) * 3.2) : 0;      // a pulse of light on each beat once the flanges start lighting
	const el = lerp(6, 90, e), az = lerp(0, M_END.az, e2), D = lerp(176, M_END.D, e2), T: V3 = [0, 0, lerp(19.4, 38.8, e)], cy = lerp(600, M_END.cy, e);
	const cam = camAt(az, el, D, T, M_END.f, 960, cy);
	const P3 = (q: V3) => proj(cam, q);
	/* the floor (z = 0) with the shards of the broken mould and charcoal, projected through the same camera */
	const floor = Array.from({length: 64}, (_, i) => { const a = (i / 64) * 2 * Math.PI, p = P3([260 * Math.cos(a), 260 * Math.sin(a), 0]); return [p[0], p[1]] as P; });
	const o0 = P3([0, 0, 0]);
	const shards = Array.from({length: 8}, (_, i) => { const a = (i / 8) * 2 * Math.PI + rnd(i, 3), r = 30 + rnd(i, 4) * 26, cx0 = r * Math.cos(a), cy0 = r * Math.sin(a), s = 3.5 + rnd(i, 5) * 3.5, rot = rnd(i, 6) * 6;
		const pts = Array.from({length: 6}, (_, j) => { const b = rot + (j / 6) * 2 * Math.PI, rr = s * (0.6 + 0.5 * rnd(i * 6 + j, 7)); const p = P3([cx0 + rr * Math.cos(b), cy0 + rr * 0.6 * Math.sin(b), 0.5]); return [p[0], p[1]] as P; });
		return <g key={i}><path d={sm(pts)} fill="#3A2216" /><path d={sm(pts.slice(0, 4), false)} fill="none" stroke="#FFB070" strokeWidth={1.4} opacity={0.4} /></g>; });
	/* the traces: the mouth circle, the square foot under it, the four flange beaks one per beat */
	const circ = ease(seg(t, t0 + 1.13, t0 + 1.9)), sq = ease(seg(t, t0 + 1.7, t0 + 2.45));
	const ring = Array.from({length: 97}, (_, i) => { const a = (i / 96) * 2 * Math.PI + az * D2R + Math.PI; const p = P3([14.75 * Math.cos(a), 14.75 * Math.sin(a), 38.8]); return [p[0], p[1]] as P; });
	const foot = Array.from({length: 97}, (_, i) => { const a = (i / 96) * 2 * Math.PI + Math.PI * 0.25; const k = 9.85 * rho(a, 2.5); const p = P3([k * Math.cos(a), k * Math.sin(a), 0]); return [p[0], p[1]] as P; });
	const beakT = [0, 1, 2, 3].map((i) => t0 + 2.27 + i * BEAT);      // 71.64, 72.20, 72.77, 73.33
	const beaks = [0, 1, 2, 3].map((q) => { const a = q * Math.PI / 2, on = seg(t, beakT[q], beakT[q] + 0.18), pulse = on > 0 ? 0.55 + 0.45 * Math.exp(-(t - beakT[q]) * 3) : 0;
		const pts = BEAK.map(([r, z]) => { const p = P3([r * Math.cos(a), r * Math.sin(a), z + 0.05]); return [p[0], p[1]] as P; });
		const tip = P3([19.2 * Math.cos(a), 19.2 * Math.sin(a), 38.9]), tip2 = P3([25 * Math.cos(a), 25 * Math.sin(a), 38.9]);
		return {pts, on, pulse, tip, tip2}; });
	const dash = (p: number) => (p >= 1 ? {} : {pathLength: 1, strokeDasharray: '1 1', strokeDashoffset: 1 - p});
	const tr = Math.min(1, el / 90);
	return <AbsoluteFill style={{background: '#080504'}}>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<defs><radialGradient id="mfl" gradientUnits="userSpaceOnUse" cx={o0[0]} cy={o0[1]} r={900}><stop offset="0" stopColor="#4A2E1A" /><stop offset="0.45" stopColor="#24160E" /><stop offset="1" stopColor="#0A0604" /></radialGradient>
				<filter id="mtb" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={8} /></filter></defs>
			<rect width={W} height={H} fill="#0A0604" />
			<path d={dP(floor, true)} fill="url(#mfl)" />
			{Array.from({length: 60}, (_, i) => { const a = rnd(i, 21) * 2 * Math.PI, r = 30 + rnd(i, 22) * 200, p = P3([r * Math.cos(a), r * Math.sin(a), 0]); return <circle key={i} cx={p[0]} cy={p[1]} r={1 + rnd(i, 23) * 3.5} fill={i % 3 ? '#0E0806' : '#6A4026'} opacity={0.8} />; })}
			{shards}
			<Glow x={o0[0]} y={o0[1]} r={500 + 120 * bp} c="#FFA050" o={0.22 + 0.22 * bp} id="mpool" sy={lerp(0.25, 1, tr)} />
			<Zun cam={cam} light={LM2} id="mz" patina={0} fresh={1} molten={0.08} shadow inscription reveal={1} glow={0} />
			{circ > 0 && <g><path d={dP(ring)} fill="none" stroke="#FFB840" strokeWidth={10 + 10 * bp} filter="url(#mtb)" opacity={0.8} {...dash(circ)} />
				<path d={dP(ring)} fill="none" stroke="#FFD87A" strokeWidth={3.4} {...dash(circ)} /><path d={dP(ring)} fill="none" stroke="#FFF6DA" strokeWidth={1.2} {...dash(circ)} /></g>}
			{sq > 0 && <g><path d={dP(foot)} fill="none" stroke="#FFB840" strokeWidth={9} filter="url(#mtb)" opacity={0.7} {...dash(sq)} />
				<path d={dP(foot)} fill="none" stroke="#FFD87A" strokeWidth={3} strokeDasharray={sq >= 1 ? '14 9' : undefined} {...(sq < 1 ? dash(sq) : {})} /></g>}
			{beaks.map((bk, i) => bk.on > 0 && <g key={i} opacity={bk.on}>
				<path d={dP(bk.pts, true)} fill="#FFC860" opacity={0.35 * bk.pulse} filter="url(#mtb)" />
				<path d={dP(bk.pts, true)} fill="none" stroke="#FFE08A" strokeWidth={2.6} opacity={0.6 + 0.4 * bk.pulse} />
				<path d={`M${f1(bk.tip[0])},${f1(bk.tip[1])} L${f1(lerp(bk.tip[0], bk.tip2[0], bk.on))},${f1(lerp(bk.tip[1], bk.tip2[1], bk.on))}`} stroke="#FFD87A" strokeWidth={2.4} strokeLinecap="round" opacity={0.8} />
				<Glow x={bk.tip[0]} y={bk.tip[1]} r={70} c="#FFC060" o={0.5 * bk.pulse} id={`mbg${i}`} /></g>)}
			<Steam t={t} x={o0[0]} y={o0[1] + 260} w={700} h={1000} n={14} seed={31} id="mst" o={0.2} v={0.4} blur={30} r0={100} />
			{/* each flange that lights sends a wash of warm light over the floor; steam drifts across the lens */}
			<defs><radialGradient id="mwash" gradientUnits="userSpaceOnUse" cx={960} cy={560} r={1000}><stop offset="0" stopColor="#FFC070" stopOpacity={0.3} /><stop offset="0.5" stopColor="#FF9A40" stopOpacity={0.12} /><stop offset="1" stopColor="#FF9A40" stopOpacity={0} /></radialGradient>
				<filter id="msf" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={60} /></filter></defs>
			{bp > 0.01 && <rect width={W} height={H} fill="url(#mwash)" opacity={bp} />}
			<g filter="url(#msf)" opacity={0.5 * seg(t, t0 + 1.5, t0 + 2.5)}>{Array.from({length: 5}, (_, i) => <circle key={i} cx={((rnd(i, 91) * 2400 + (t - t0) * (90 + 40 * rnd(i, 92))) % 2600) - 340} cy={150 + rnd(i, 93) * 800} r={170 + 90 * rnd(i, 94)} fill="#EADCC8" opacity={0.18} />)}</g>
			<Embers t={t} n={26} x0={100} x1={1820} y0={0} y1={1080} seed={81} v={60} o={0.5} r={3} />
		</svg>
		<svg width={W} height={H} style={{position: 'absolute'}}><Vig id="mv" a={0.66} /></svg>
		<FilmOv2 t={t} c={c} />
	</AbsoluteFill>; };

/* ============================== the router ============================== */
const SCENES: {id: string; C: React.FC<{t: number}>}[] = [{id: 'G', C: CG}, {id: 'H', C: CH}, {id: 'I', C: CI}, {id: 'J', C: CJ}, {id: 'K', C: CK}, {id: 'L', C: CL}, {id: 'M', C: CM}];
export const Act2: React.FC<{t: number}> = ({t}) => { const s = [...SCENES].reverse().find((k) => t >= card2(k.id).t - 1e-6) ?? SCENES[0]; return <s.C t={t} />; };
