import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Zun, lookAt, Cam, V3, ZunLight, proj, toCam, Rz, rho} from './zun55h';
import {f1, rnd, P, pth, sm, tube, Glow, Haze, Vig, Plume, pile} from './kf55h';
import {Body, Sil, Sk} from './rig55h';
import {Grain} from './kfall55h';
import {rotL} from './home55h';
import {FilmOv2, MBox} from './ov55v2';
import {card2, BAR} from './cards55v2';
import {Yard1965, PlatformScale1965, Worker1965, Tag30w, worker1965, beam1965, tagSwing1965, zunCam, beaks, YCam, layerT} from './act551k';
/* ep55 何尊 v2 · act 2, part 3 (builder 3): cards N O P Q R S, film 73.90 → 101.07 (frames 2217–3032).
   N  the burial: from M's top-down view soil rains into the mouth, the camera tilts down to a cut-away; layers stack one per
      beat while the eras flicker past above ground and the days strobe by.
   O  1963, night rain on the loess cliff behind 陈堆's house; lightning; a slab of the cliff slumps on the bar; 陈堆 at the door.
   P  push in on the raw face: a glint; he scrapes the mud away, a beak and a horn appear; he pulls it out and hugs it (true size).
   Q  the corner of his house: he sets it down, grain pours in on the beat; then a lock-off time-lapse (light sweeps, seasons).
   R  tracking beside the handcart through the scrap-yard gate in 1965; the 尊 in a basket among scrap; bumps on the beats.
   S  the reverse angle of card 1 (builder 1's kit): it lands on the scale, the beam swings, the 30元 tag goes on. */
const W = 1920, H = 1080, PI = Math.PI;
const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const ease = (u: number) => u * u * (3 - 2 * u);
const es = (u: number) => 0.5 - 0.5 * Math.cos(PI * cl(u));
const eio = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const eout = (u: number) => 1 - Math.pow(1 - cl(u), 3);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const lerpP = (a: P, b: P, u: number): P => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const land = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 - Math.exp(-6 * u) * Math.cos(9 * u));
const BTd = 2.26415 / 4;
const beat = (j: number) => BAR(0) + j * BTd;
const hx = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mixC = (a: string, b: string, u: number) => { const A = hx(a), B = hx(b); return '#' + A.map((v, i) => Math.round(cl(lerp(v, B[i], u), 0, 255)).toString(16).padStart(2, '0')).join(''); };
const mixL = (A: ZunLight, B: ZunLight, u: number): ZunLight => ({dir: [lerp(A.dir[0], B.dir[0], u), lerp(A.dir[1], B.dir[1], u), lerp(A.dir[2], B.dir[2], u)], col: mixC(A.col, B.col, u), k: lerp(A.k, B.k, u),
	amb: lerp(A.amb, B.amb, u), ambCol: mixC(A.ambCol, B.ambCol, u), spec: lerp(A.spec, B.spec, u), shin: lerp(A.shin ?? 14, B.shin ?? 14, u), inside: lerp(A.inside ?? 0, B.inside ?? 0, u),
	rim: A.rim && B.rim ? {dir: [lerp(A.rim.dir[0], B.rim.dir[0], u), lerp(A.rim.dir[1], B.rim.dir[1], u), lerp(A.rim.dir[2], B.rim.dir[2], u)], col: mixC(A.rim.col, B.rim.col, u), k: lerp(A.rim.k, B.rim.k, u)} : (u < 0.5 ? A.rim : B.rim)});
const scaleL = (L: ZunLight, k: number): ZunLight => ({...L, k: L.k * k, amb: L.amb * (0.5 + 0.5 * k), spec: L.spec * k, rim: L.rim ? {...L.rim, k: L.rim.k * k} : undefined});
/** a camera that draws the 尊's middle (z = 19.4) at screen (x, y), about k px per cm, seen from azimuth az / elevation el, the
    picture turned by roll degrees (+ = counter-clockwise, the top leans left) */
const zc = (x: number, y: number, k: number, az = 30, el = 6, roll = 0): Cam => { const D = 400, a = az * PI / 180, e = el * PI / 180, T: V3 = [0, 0, 19.4];
	return lookAt([D * Math.cos(e) * Math.cos(a), D * Math.cos(e) * Math.sin(a), T[2] + D * Math.sin(e)], T, k * D, x, y, roll * PI / 180); };
/** a body-local point (cm, feet at 0, facing +x) to screen for a figure at (x, y), k px/cm */
const toS = (x: number, y: number, k: number, flip = false) => (q: P): P => [x + (flip ? -1 : 1) * q[0] * k, y + q[1] * k];
/** a 2D image point → body-local */
const toL = (x: number, y: number, k: number, flip = false) => (q: P): P => [(q[0] - x) / (flip ? -k : k), (q[1] - y) / k];
const deg = (a: number) => a * PI / 180;

/* ---------- a body from joint-level keys (bone lengths as rig55h: trunk 50, neck 18, thigh 44, shin 40, arm 30 + 28) ---------- */
const ik2 = (a: P, b: P, l1: number, l2: number, side = 1): P => { const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.max(Math.abs(l1 - l2) + 0.01, Math.min(l1 + l2 - 0.01, Math.hypot(dx, dy))), th = Math.atan2(dy, dx);
	const al = Math.acos(cl((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), e1: P = [a[0] + l1 * Math.cos(th + al), a[1] + l1 * Math.sin(th + al)], e2: P = [a[0] + l1 * Math.cos(th - al), a[1] + l1 * Math.sin(th - al)];
	return (e1[0] - e2[0]) * side > 0 ? e1 : e2; };
const reach = (sh: P, h: P, r = 57.5): P => { const dx = h[0] - sh[0], dy = h[1] - sh[1], d = Math.hypot(dx, dy); return d <= r ? h : [sh[0] + (dx * r) / d, sh[1] + (dy * r) / d]; };
type FK = {hip: P; lean: number; neck?: number; tilt?: number; fN: P; fF: P; hN: P; hF: P; toeN?: number; toeF?: number; kF?: P; kN?: P};
const pose = (o: FK): Sk => { const a = deg(o.lean), n = deg(o.lean + (o.neck ?? 6));
	const sh: P = [o.hip[0] + 50 * Math.sin(a), o.hip[1] - 50 * Math.cos(a)], hd: P = [sh[0] + 18 * Math.sin(n), sh[1] - 18 * Math.cos(n)];
	const kN = o.kN ?? ik2(o.hip, o.fN, 44, 40, 1), kF = o.kF ?? ik2(o.hip, o.fF, 44, 40, 1);
	return {hip: o.hip, sh, hd, kN, fN: o.fN, kF, fF: o.fF, hN: reach(sh, o.hN), hF: reach(sh, o.hF), toeN: o.toeN, toeF: o.toeF, tilt: o.tilt ?? 0}; };
const mixFK = (a: FK, b: FK, u: number): FK => ({hip: lerpP(a.hip, b.hip, u), lean: lerp(a.lean, b.lean, u), neck: lerp(a.neck ?? 6, b.neck ?? 6, u), tilt: lerp(a.tilt ?? 0, b.tilt ?? 0, u),
	fN: lerpP(a.fN, b.fN, u), fF: lerpP(a.fF, b.fF, u), hN: lerpP(a.hN, b.hN, u), hF: lerpP(a.hF, b.hF, u), toeN: u < 0.5 ? a.toeN : b.toeN, toeF: u < 0.5 ? a.toeF : b.toeF,
	kN: a.kN && b.kN ? lerpP(a.kN, b.kN, u) : undefined, kF: a.kF && b.kF ? lerpP(a.kF, b.kF, u) : undefined});
const track = <T,>(keys: [number, T][], t: number, mix: (a: T, b: T, u: number) => T, e: (u: number) => number = ease): T => {
	if (t <= keys[0][0]) return keys[0][1]; for (let i = 0; i < keys.length - 1; i++) { const [t0, a] = keys[i], [t1, b] = keys[i + 1]; if (t < t1) return mix(a, b, e((t - t0) / (t1 - t0))); }
	return keys[keys.length - 1][1]; };
/** feet that step: each step lifts one foot and sets it down at `to` (body-local x); the other stays planted. Returns ankle points */
type Step = {t0: number; t1: number; f: 'N' | 'F'; to: number};
const stepFeet = (t: number, n0: number, f0: number, steps: Step[]) => { let xN = n0, xF = f0, lN = 0, lF = 0, act = 0;
	for (const s of steps) { if (t <= s.t0) break; const u = seg(t, s.t0, s.t1), e = es(u), lift = Math.sin(PI * u) * 8;
		if (s.f === 'N') { xN = lerp(xN, s.to, e); lN = lift; } else { xF = lerp(xF, s.to, e); lF = lift; } if (u < 1) act = Math.sin(PI * u); }
	return {fN: [xN, -8 - lN] as P, fF: [xF, -8 - lF] as P, mid: (xN + xF) / 2, bob: act}; };

/* ---------- shared bits ---------- */
const Shell: React.FC<{t: number; id: string; bg: string; vig?: number; measure?: MBox | null; children: React.ReactNode; top?: React.ReactNode}> = ({t, id, bg, vig = 0.6, measure, children, top}) =>
	<AbsoluteFill style={{background: bg}}>
		<svg width={W} height={H} style={{position: 'absolute'}}>{children}</svg>
		{top}
		<svg width={W} height={H} style={{position: 'absolute'}}><Vig id={`v3${id}`} a={vig} /></svg>
		<FilmOv2 t={t} c={card2(id)} measure={measure} />
	</AbsoluteFill>;
/** rain streaks falling through a box, wrapping */
const Rain: React.FC<{t: number; n: number; seed: number; L: number; v: number; sl: number; w: number; c: string; o: number; x0?: number; x1?: number; y0?: number; y1?: number}> = ({t, n, seed, L, v, sl, w, c, o, x0 = -160, x1 = W + 160, y0 = -80, y1 = H + 40}) => {
	const h = y1 - y0; let d = '';
	for (let i = 0; i < n; i++) { const y = y0 + ((rnd(i, seed) * h + t * v * (0.85 + 0.3 * rnd(i, seed + 1))) % h), x = x0 + rnd(i, seed + 2) * (x1 - x0) - (y - y0) * sl;
		d += `M${f1(x)},${f1(y)}l${f1(-sl * L)},${f1(-L)}`; }
	return <path d={d} stroke={c} strokeWidth={w} strokeOpacity={o} strokeLinecap="round" fill="none" />; };
/** a few points rising (sparks, dust) */
const Rising: React.FC<{t: number; n: number; x0: number; x1: number; y0: number; y1: number; c: string; seed: number; v: number; o?: number; r?: number}> = ({t, n, x0, x1, y0, y1, c, seed, v, o = 0.6, r = 2.4}) => <g>
	{Array.from({length: n}, (_, i) => { const h = y1 - y0, y = y1 - (((rnd(i, seed + 1) * h) + t * v * (0.6 + 0.8 * rnd(i, seed + 5))) % h), x = x0 + rnd(i, seed) * (x1 - x0) + Math.sin(t * 0.9 + i) * 12;
		return <circle key={i} cx={f1(x)} cy={f1(y)} r={(0.6 + rnd(i, seed + 2) * r).toFixed(2)} fill={c} opacity={o * (0.3 + 0.7 * rnd(i, seed + 3))} />; })}</g>;
/** a 马灯 (hurricane lamp) hanging from a hand at (x, y): s px per cm, swing deg, on 0..1 */
const Lamp: React.FC<{x: number; y: number; s: number; sw?: number; on?: number}> = ({x, y, s, sw = 0, on = 1}) => <g transform={`translate(${f1(x)},${f1(y)}) rotate(${f1(sw)}) scale(${s.toFixed(3)})`}>
	<path d="M-5.5,8 C-6.5,-1 6.5,-1 5.5,8" stroke="#1A120C" strokeWidth={0.9} fill="none" />
	<path d="M-4.5,7 L4.5,7 L6,10.5 L-6,10.5 Z" fill="#1A120C" />
	<ellipse cx={0} cy={16} rx={5.2} ry={5.8} fill={mixC('#3A2A1C', '#FFE6A8', on)} />
	<ellipse cx={0} cy={17} rx={2.2} ry={2.8} fill={mixC('#2A1C14', '#FFFFF0', on)} />
	{[-3.4, 0, 3.4].map((x0, i) => <path key={i} d={`M${x0 * 0.8},10.5 Q${x0 * 1.7},16 ${x0 * 0.8},21.5`} stroke="#1A120C" strokeWidth={0.6} fill="none" />)}
	<path d="M-6.5,21.5 L6.5,21.5 L6,26 L-6,26 Z" fill="#1A120C" />
</g>;
/** an irregular blob (mud clumps, stones) */
const blob = (x: number, y: number, r: number, seed: number, n = 7) => sm(Array.from({length: n}, (_, i) => { const a = (i / n) * 2 * PI, k = r * (0.72 + 0.4 * rnd(i, seed)); return [x + k * Math.cos(a), y + k * Math.sin(a) * 0.82] as P; }));

/* ============================== N · 73.90 the burial: top-down → the cut-away, three thousand years in 4.5 s ============================== */
const NAZ = 30, NF = 2730, NA = deg(NAZ);   /* the cut plane faces the final camera (az 30); the shot starts on builder 2's M end: az 45, el 90, D 140, f 2542 */
const NN: [number, number] = [Math.cos(NA), Math.sin(NA)], NS: [number, number] = [-Math.sin(NA), Math.cos(NA)];
/** world point on the cut plane (s along it, screen-right), d behind it (away from the camera), z up */
const wpN = (s: number, d: number, z: number): V3 => [s * NS[0] - d * NN[0], s * NS[1] - d * NN[1], z];
const ERA_T = [beat(132), beat(133), beat(134), beat(134.5), beat(135), beat(135.5)];
const LAY_H = 4.6, DROP = 0.26;
const nFill = (u: number) => es(seg(u, 0.05, 1.0));
/** a layer falls in over DROP s and lands on its beat; the ground is real at once, the camera sinks after it over 0.4 s */
const nLay = (t: number, i: number) => (t >= ERA_T[i] ? LAY_H : 0);
const nG = (t: number) => 45 * nFill(t - 73.9) + ERA_T.reduce((s, _, i) => s + nLay(t, i), 0);
const nGc = (t: number) => 45 * nFill(t - 73.9) + ERA_T.reduce((s, tl) => s + LAY_H * es(seg(t, tl, tl + 0.4)), 0);
const nZf = (u: number) => 12 + 26.6 * es(seg(u, 0.12, 0.82));
const nCam = (t: number) => { const u = t - 73.9, G = nG(t), Gc = nGc(t), tl = es(seg(u, 0.6, 2.4));
	const el = lerp(90, 4, tl), D0 = 140 - 8 * ease(seg(u, 0, 0.7)), D = Math.exp(lerp(Math.log(D0), Math.log(310), tl)) * (1 + 0.15 * ease(seg(u, 2.4, 4.6))), Tz = lerp(38.8, Gc - 22, tl);
	const e = deg(el), T: V3 = [0, 0, Tz], a = deg(lerp(45, NAZ, tl)), f = lerp(2542, NF, tl);
	const cam = lookAt([D * Math.cos(e) * Math.cos(a), D * Math.cos(e) * Math.sin(a), Tz + D * Math.sin(e)], T, f, 960, 560);
	return {cam, el, tl, G, camZ: Tz + D * Math.sin(e)}; };
const wave = (i: number, s: number) => 1.5 * Math.sin(s * 0.021 + i * 1.7) + 1.0 * Math.sin(s * 0.047 + i * 2.9) + 0.6 * Math.sin(s * 0.11 + i * 0.7);
const N_DEEP = [{z: 0, c: '#3A2A1E'}, {z: -14, c: '#56422C'}, {z: -36, c: '#382A1E'}, {z: -64, c: '#4E3A2A'}, {z: -100, c: '#30231A'}, {z: -150, c: '#46342A'}, {z: -220, c: '#2A1E16'}];
const N_DEP = ['#8A6C46', '#5A4230', '#A08056', '#6A4E34', '#B09062', '#7A5C3C'];
const LTopN: ZunLight = {dir: [0.25, -0.2, 0.95], col: '#FFD8A0', k: 1.45, amb: 0.24, ambCol: '#4A3A30', spec: 1.0, shin: 18, inside: 0.55, rim: {dir: [-0.6, 0.5, 0.5], col: '#FFC080', k: 0.4}};
const LSideN: ZunLight = {dir: [0.5, -0.45, 0.72], col: '#E8C8A0', k: 1.3, amb: 0.3, ambCol: '#4A4038', spec: 0.45, shin: 14, inside: 0.3, rim: {dir: [-0.5, 0.7, 0.3], col: '#C8A070', k: 0.4}};
/* the eras on the skyline, warm-black silhouettes standing on the ground line g (screen) */
const EraZhou: React.FC<{g: number}> = ({g}) => <g>
	<path d={pth([[1040, g + 2], [1046, g - 40], [1920, g - 46], [1920, g + 2]])} />
	{[0, 1, 2].map((i) => <path key={i} d={`M1046,${g - 9 - i * 11} L1920,${g - 13 - i * 11}`} stroke="#3A2E26" strokeWidth={2} />)}
	<rect x={1430} y={g - 98} width={120} height={56} /><path d={sm([[1404, g - 92], [1490, g - 134], [1576, g - 92], [1490, g - 100]])} />
	{[1150, 1230, 1310].map((x, i) => <path key={i} d={sm([[x - 34, g + 2], [x - 26, g - 26], [x, g - 52 - i * 4], [x + 26, g - 26], [x + 34, g + 2]])} />)}
	<path d={`M1700,${g - 46} L1700,${g - 120} M1700,${g - 120} L1740,${g - 112} L1700,${g - 104}`} stroke="#0E0C0E" strokeWidth={4} fill="#0E0C0E" /></g>;
const EraHan: React.FC<{g: number}> = ({g}) => <g>
	{[1330, 1620].map((x, i) => <g key={i}><rect x={x - 34} y={g - 170} width={68} height={170} />
		{[0, 1, 2].map((j) => <path key={j} d={sm([[x - 56 + j * 6, g - 150 + j * 52 - 2], [x, g - 172 + j * 52 - 12], [x + 56 - j * 6, g - 150 + j * 52 - 2], [x, g - 158 + j * 52]])} />)}
		<path d={pth([[x - 40, g - 182], [x, g - 210], [x + 40, g - 182]])} /></g>)}
	<path d={pth([[1060, g + 2], [1060, g - 50], [1920, g - 54], [1920, g + 2]])} />
	<rect x={1420} y={g - 96} width={150} height={50} /><path d={sm([[1392, g - 90], [1495, g - 126], [1598, g - 90], [1495, g - 98]])} /></g>;
const EraTang: React.FC<{g: number}> = ({g}) => <g>
	{Array.from({length: 7}, (_, i) => { const w = 104 - i * 11, y = g - 34 - i * 33; return <g key={i}><rect x={1500 - w / 2 + 14} y={y} width={w - 28} height={34} /><path d={sm([[1500 - w / 2 - 14, y + 4], [1500, y - 10], [1500 + w / 2 + 14, y + 4], [1500 + w / 2, y + 10], [1500 - w / 2, y + 10]])} /></g>; })}
	<path d={`M1500,${g - 262} L1500,${g - 310}`} stroke="#0E0C0E" strokeWidth={5} />
	<rect x={1060} y={g - 30} width={300} height={32} /><path d={sm([[1040, g - 26], [1210, g - 70], [1380, g - 26], [1210, g - 34]])} />
	<rect x={1680} y={g - 36} width={220} height={38} /><path d={sm([[1660, g - 30], [1790, g - 74], [1920, g - 30], [1790, g - 40]])} /></g>;
const EraSong: React.FC<{g: number}> = ({g}) => <g>
	<path d={pth([[1360, g + 2], [1360, g - 70], [1640, g - 70], [1640, g + 2]])} />
	<rect x={1410} y={g - 130} width={180} height={60} />
	{[0, 1].map((j) => <path key={j} d={`M${1350 + j * 30},${g - 120 + j * 0 - j * 58} Q${1500},${g - 150 - j * 58} ${1650 - j * 30},${g - 120 - j * 58} L${1630 - j * 30},${g - 112 - j * 58} Q1500,${g - 134 - j * 58} ${1370 + j * 30},${g - 112 - j * 58} Z`} />)}
	<rect x={1450} y={g - 182} width={100} height={36} />
	{[1100, 1200, 1760, 1850].map((x, i) => <g key={i}><rect x={x - 40} y={g - 40} width={80} height={42} /><path d={`M${x - 58},${g - 34} Q${x},${g - 62} ${x + 58},${g - 34} L${x + 50},${g - 30} Q${x},${g - 50} ${x - 50},${g - 30} Z`} /></g>)}</g>;
const EraQing: React.FC<{g: number; t: number}> = ({g, t}) => <g>
	{[1080, 1190, 1330, 1640, 1760, 1880].map((x, i) => <g key={i}><rect x={x - 46} y={g - 44} width={92} height={46} /><path d={pth([[x - 56, g - 42], [x - 30, g - 70], [x + 30, g - 70], [x + 56, g - 42]])} /></g>)}
	<path d={sm([[1460, g + 2], [1470, g - 60], [1440, g - 100], [1452, g - 140], [1500, g - 168], [1548, g - 140], [1560, g - 98], [1530, g - 60], [1540, g + 2]])} />
	<Plume x={1190} y={g - 70} h={110} w={40} c="#B8A898" o={0.35} id="nqsm" seed={t * 3} /></g>;
const EraPoles: React.FC<{g: number}> = ({g}) => <g>
	{[1120, 1420, 1720].map((x, i) => <g key={i}><rect x={x - 4} y={g - 190} width={8} height={192} /><rect x={x - 30} y={g - 180} width={60} height={5} /><rect x={x - 24} y={g - 162} width={48} height={4} /></g>)}
	{[-26, -12, 12, 26].map((o, j) => <path key={j} d={`M${1120 + o},${g - 182 + (j % 2) * 18} Q1270,${g - 160 + (j % 2) * 18} ${1420 + o},${g - 182 + (j % 2) * 18} Q1570,${g - 160 + (j % 2) * 18} ${1720 + o},${g - 182 + (j % 2) * 18} Q1830,${g - 166} 1960,${g - 176}`} stroke="#0E0C0E" strokeWidth={1.6} fill="none" />)}
	{[1250, 1560, 1840].map((x, i) => <g key={i}><rect x={x - 50} y={g - 46} width={100} height={48} /><path d={pth([[x - 60, g - 44], [x - 36, g - 72], [x + 36, g - 72], [x + 60, g - 44]])} /></g>)}</g>;
const ERAS = [EraZhou, EraHan, EraTang, EraSong, EraQing, EraPoles];

const SN: React.FC<{t: number}> = ({t}) => { const u = t - 73.9, {cam, el, tl, G, camZ} = nCam(t), pr = (q: V3) => proj(cam, q);
	const above = camZ > G + 0.3, front = seg(el, 64, 82), kc = seg(el, 66, 80);
	const P2 = (q: V3): P => { const p = pr(q); return [p[0], p[1]]; };
	/* the cut face: the deposits on top (newest first, drawn first), then the burial fill, then the deep strata; each band reaches down */
	const SS = Array.from({length: 31}, (_, i) => -750 + i * 50);
	const band = (zTop: number, i: number, col: string, key: string) => { const top = SS.map((s) => P2(wpN(s, 0, zTop + wave(i, s))));
		return <g key={key}><path d={pth([...top, P2(wpN(750, 0, -1400)), P2(wpN(-750, 0, -1400))])} fill={col} /><path d={pth(top, false)} fill="none" stroke="#1A120C" strokeWidth={2} strokeOpacity={0.35} /></g>; };
	let zc0 = 45 * nFill(u); const bands: React.ReactNode[] = [];
	const falling = ERA_T.map((tl, i) => { const v = (t - (tl - DROP)) / DROP; if (v < 0 || v >= 1) return null; const b0 = 45 * nFill(u) + LAY_H * i + 22 * (1 - v * v);
		const top = SS.map((s0) => P2(wpN(s0, 0, b0 + LAY_H + wave(20 + i, s0)))), bot = SS.map((s0) => P2(wpN(s0, 0, b0 + wave(19 + i, s0)))).reverse();
		return <path key={`fall${i}`} d={pth([...top, ...bot])} fill={N_DEP[i]} opacity={0.35 + 0.65 * v} />; });
	const deps = ERA_T.map((_, i) => nLay(t, i)), depTop: number[] = []; let acc = zc0; deps.forEach((h) => { acc += h; depTop.push(acc); });
	for (let i = deps.length - 1; i >= 0; i--) if (deps[i] > 0.05) bands.push(band(depTop[i], 20 + i, N_DEP[i], `d${i}`));
	bands.push(band(zc0, 9, '#4E3A28', 'fill'));
	N_DEEP.forEach((b, i) => bands.push(band(b.z, i, b.c, `k${i}`)));
	/* sky: day ↔ night every 0.8 s (its own clock), sun arcs and star trails smeared across it */
	const dn = 0.5 + 0.5 * Math.cos((2 * PI * (t - 75.2)) / 0.8), skyOn = 1 - seg(el, 30, 50);
	const skyT = mixC('#070A16', '#5A78A2', dn), skyB = mixC('#1A2034', '#E0C8A0', dn);
	/* the ground line on screen: where the cut edge is, and the horizon */
	const gL = P2(wpN(-200, 0, G)), gR = P2(wpN(200, 0, G)), gy = (gL[1] + gR[1]) / 2, hor = P2(wpN(0, 6000, G)), eraY = above ? lerp(gy, hor[1], 0.35) : gy;
	const eraOn = seg(el, 26, 12);
	/* the 尊: dark bronze settling in; clipped to the cut face once the camera leaves the top */
	const patina = lerp(0, 0.85, es(seg(u, 0.05, 1.8))), fresh = lerp(1, 0, es(seg(u, 0.05, 1.4))), dimN = tl > 0.9 ? 0.86 + 0.14 * dn : 1;
	const L = rotL(scaleL(mixL(LTopN, LSideN, tl), dimN), NAZ);
	const clipOn = el < 80, cutPoly = [P2(wpN(-1500, 0, G)), P2(wpN(1500, 0, G)), P2(wpN(1500, 0, -1500)), P2(wpN(-1500, 0, -1500))];
	/* the soil inside the mouth, rising; and the mound that covers it, seen from the top */
	const zf = nZf(u), ring = (r: number, z: number, n = 48, j = 0) => Array.from({length: n}, (_, i) => { const a = (i / n) * 2 * PI, [R0, nn] = Rz(z), k = r < 0 ? R0 * rho(a, nn) + r : r * (1 + j * (rnd(i, 7) - 0.5)); return P2([k * Math.cos(a), k * Math.sin(a), z]); });
	const lip = ring(13.9, 38.8), fillD = ring(-0.7, Math.min(38.6, zf)), cover = ring(25, G + 1, 40, 0.1);
	/* soil specks on the top surface */
	const specks = Array.from({length: 240}, (_, i) => { const s = (rnd(i, 3) - 0.5) * 520, d = -150 + rnd(i, 4) * 1100; if (d < 0 && front <= 0.01) return null;
		const q = wpN(s, d, G), k = toCam(cam, q)[2]; if (k < 20) return null; const p = pr(q), r = (0.6 + 1.6 * rnd(i, 5)) * NF / k; if (r < 0.4) return null;
		return <ellipse key={i} cx={f1(p[0])} cy={f1(p[1])} rx={f1(Math.min(r, 30))} ry={f1(Math.min(r, 30) * Math.max(0.12, Math.sin(deg(el))))} fill={i % 3 ? '#2E2216' : '#8A6E4C'} opacity={(d < 0 ? front : 1) * 0.55} />; });
	/* clumps thrown in on three landings */
	const LAND = [74.42, beat(129) + 0.22, 74.94];
	const clumps: React.ReactNode[] = [];
	LAND.forEach((tl0, w) => { for (let j = 0; j < 14; j++) { const id = w * 14 + j, v = (t - (tl0 - 0.42)) / 0.42; if (v < 0 || v > 1.35) continue;
		const inside = j % 3 !== 2, a = rnd(id, 11) * 2 * PI, r = inside ? 2 + rnd(id, 12) * 10 : 16 + rnd(id, 12) * 16, zl = inside ? nZf(tl0 - 73.9) : nG(tl0) + 1;
		const s0 = r * Math.cos(a), d0 = r * Math.sin(a);
		if (v <= 1) { const z = zl + 95 * (1 - v * v), q: V3 = [s0 * 1.4 - 0.4 * s0 * v, d0 * 1.4 - 0.4 * d0 * v, z], k = toCam(cam, q)[2]; if (k < 12) continue; const p = pr(q), rr = Math.min(46, (0.9 + 1.4 * rnd(id, 14)) * NF / k);
			clumps.push(<g key={id} transform={`rotate(${f1(rnd(id, 15) * 360 + v * 90)} ${f1(p[0])} ${f1(p[1])})`}><path d={blob(p[0], p[1], rr, id, 9)} fill={mixC('#1E140C', '#4A3624', rnd(id, 16))} /><path d={blob(p[0] - rr * 0.25, p[1] - rr * 0.2, rr * 0.4, id + 3, 6)} fill="#8A6A48" opacity={0.45} />
				{[0, 1, 2].map((m) => <circle key={m} cx={f1(p[0] + rr * (1.3 + 0.5 * m) * Math.cos(id + m * 2.1))} cy={f1(p[1] + rr * (1.3 + 0.5 * m) * Math.sin(id + m * 2.1))} r={f1(rr * 0.16)} fill="#2A1C12" />)}</g>); }
		else { const p = pr([s0, d0, zl]), k = toCam(cam, [s0, d0, zl])[2], sp = (v - 1) / 0.35, rr = 2.4 * NF / k;
			for (let m = 0; m < 6; m++) { const aa = rnd(id * 7 + m, 13) * 2 * PI, dd = rr * (0.6 + 2.2 * sp); clumps.push(<circle key={`${id}s${m}`} cx={f1(p[0] + dd * Math.cos(aa))} cy={f1(p[1] + dd * Math.sin(aa) * 0.8)} r={f1(rr * 0.22 * (1 - sp))} fill="#3A2A1C" opacity={1 - sp} />); } } } });
	/* old roots, and the bits of the past in the strata */
	const stones = Array.from({length: 60}, (_, i) => { const s = (rnd(i, 21) - 0.5) * 420, z = -110 + rnd(i, 22) * 150; if (Math.abs(s) < 30 && z > -4 && z < 46) return null; if (z > zc0 - 2) return null;
		const p = P2(wpN(s, 0, z)), k = NF / toCam(cam, wpN(s, 0, z))[2], r = (0.8 + 2.2 * rnd(i, 23)) * k;
		return rnd(i, 24) > 0.75 ? <path key={i} d={pth([[p[0] - r * 1.6, p[1]], [p[0] - r, p[1] - r * 0.7], [p[0] + r * 1.4, p[1] - r * 0.5], [p[0] + r * 1.6, p[1] + r * 0.3]])} fill="#8A5A3A" opacity={0.65} />
			: <ellipse key={i} cx={f1(p[0])} cy={f1(p[1])} rx={f1(r)} ry={f1(r * 0.7 * Math.max(0.2, Math.cos(deg(el))))} fill="#241A12" opacity={0.7} />; });
	const depBits = deps.map((h, i) => h < 0.5 ? null : Array.from({length: 7}, (_, j) => { const s = (rnd(i * 9 + j, 31) - 0.5) * 380, z = depTop[i] - h * (0.25 + 0.5 * rnd(i * 9 + j, 32)), p = P2(wpN(s, 0, z)), r = (0.7 + 1.4 * rnd(i * 9 + j, 33)) * NF / toCam(cam, wpN(s, 0, z))[2];
		return <ellipse key={`${i}_${j}`} cx={f1(p[0])} cy={f1(p[1])} rx={f1(r * 1.3)} ry={f1(r * 0.6)} fill={j % 3 ? '#3A2C1E' : '#B89A70'} opacity={0.55} />; }));
	const root = (s0: number, k: number) => { const pts: P[] = Array.from({length: 9}, (_, i) => P2(wpN(s0 + 6 * Math.sin(i * 1.3 + k) + i * 2, 0, G - 2 - i * 9 * seg(u, 2.2 + k * 0.3, 4.4))));
		return <path key={k} d={sm(pts, false)} stroke="#20160E" strokeWidth={3.2 - k * 0.6} fill="none" strokeLinecap="round" opacity={eraOn} />; };
	const era = ERAS.map((E, i) => { const a = ERA_T[i], b = ERA_T[i + 1] ?? 99, o = (i === 0 ? seg(t, a - 0.32, a - 0.02) : seg(t, a - 0.07, a + 0.03)) * (1 - 0.8 * seg(t, b - 0.07, b + 0.05)) * (i === 0 ? 1 : 1);
		return o > 0.01 ? <g key={i} fill="#0E0C0E" opacity={o * eraOn * (i === ERAS.length - 1 ? 1 : 0.92)}>{i === 4 ? <EraQing g={eraY} t={t} /> : <E g={eraY} t={t} />}</g> : null; });
	const dust = ERA_T.map((a, i) => { const v = (t - a) / 0.5; if (v < 0 || v > 1) return null; return <g key={i} opacity={(1 - v) * 0.6 * eraOn}>{Array.from({length: 14}, (_, j) => <circle key={j} cx={300 + rnd(i * 20 + j, 41) * 1400} cy={gy - 6 - v * 30 * rnd(i * 20 + j, 42)} r={4 + 10 * v} fill="#C8A878" opacity={0.4} />)}</g>; });
	return <Shell t={t} id="N" bg="#1A120C" vig={0.55}>
		<defs><linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={skyT} /><stop offset="1" stopColor={skyB} /></linearGradient>
			<radialGradient id="ncov"><stop offset="0" stopColor="#5E4832" /><stop offset="0.75" stopColor="#4A3826" /><stop offset="1" stopColor="#4A3826" stopOpacity={0} /></radialGradient>
			<clipPath id="ncut"><path d={pth(cutPoly)} /></clipPath><clipPath id="nlip"><path d={pth(lip)} /></clipPath>
			<filter id="nbl" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation={3} /></filter></defs>
		<rect width={W} height={H} fill="#24180F" />
		{skyOn > 0 && <g opacity={skyOn}><rect width={W} height={H} fill="url(#nsky)" />
			<g stroke="#DDE6FF" strokeOpacity={0.4 * (1 - dn)} strokeWidth={1.6} fill="none">{Array.from({length: 26}, (_, i) => { const r = 120 + rnd(i, 3) * 700, a0 = 200 + rnd(i, 4) * 40 + (t - 75) * 30; return <path key={i} d={`M${f1(300 + r * Math.cos(deg(a0)))},${f1(-60 - r * Math.sin(deg(a0)))} A${f1(r)},${f1(r)} 0 0 0 ${f1(300 + r * Math.cos(deg(a0 + 14)))},${f1(-60 - r * Math.sin(deg(a0 + 14)))}`} />; })}</g>
			<g filter="url(#nbl)" fill="none" stroke="#FFE6A8" opacity={0.3 + 0.7 * dn}>{[0, 1, 2, 3].map((i) => <path key={i} d={`M${1000 + i * 30},${f1(gy)} Q${1450 + i * 20},${-80 + i * 34} 1940,${f1(gy - 40 + i * 10)}`} strokeWidth={5 - i} strokeOpacity={0.4 - i * 0.07} />)}</g></g>}
		{above && <path d={pth([P2(wpN(-1500, 0, G)), P2(wpN(1500, 0, G)), P2(wpN(1500, 6000, G)), P2(wpN(-1500, 6000, G))])} fill="#4E3C28" />}
		{front > 0 && above && <path d={pth([P2(wpN(-1500, -150, G)), P2(wpN(1500, -150, G)), P2(wpN(1500, 2, G)), P2(wpN(-1500, 2, G))])} fill="#4E3C28" opacity={front} />}
		{above && specks}
		<g opacity={1 - front}>{bands}{stones}{depBits}{falling}<Glow x={P2([0, 0, 19.4])[0]} y={P2([0, 0, 19.4])[1]} r={260} c="#140C06" o={0.55 * (1 - front)} id="npk" sy={1.1} /></g>
		<g opacity={1 - front}><path d={pth(cutPoly.slice(0, 2))} stroke="#C8A878" strokeWidth={2.4} strokeOpacity={0.5} /></g>
		{[-260, 150, 420].map((s, k) => root(s, k))}
		{era}
		{/* grass on the cut edge (the seasons smear along it) */}
		{eraOn > 0 && <g opacity={eraOn}>{Array.from({length: 80}, (_, i) => { const x = 40 + i * 24 + rnd(i, 5) * 10, y = lerp(gL[1], gR[1], (x - gL[0]) / (gR[0] - gL[0] || 1)); return <path key={i} d={`M${f1(x)},${f1(y)} l${f1(-2 + rnd(i, 6) * 4)},${f1(-6 - rnd(i, 7) * 12 * (0.6 + 0.4 * dn))}`} stroke={mixC('#5A6A3A', '#B89A5A', 0.5 + 0.5 * Math.sin(t * 5 + i))} strokeWidth={2.2} />; })}</g>}
		{dust}
		<g clipPath={clipOn ? 'url(#ncut)' : undefined}>
			<Zun cam={cam} light={L} id="nz" patina={patina} fresh={fresh} shadow={false} inscription={zf < 13.5} />
			{zf > 12.5 && <g clipPath="url(#nlip)"><path d={pth(fillD)} fill="#3E2C1C" /><path d={pth(fillD)} fill="none" stroke="#8A6A48" strokeWidth={2} strokeOpacity={0.4} />
				{Array.from({length: 40}, (_, i) => { const a = rnd(i, 61) * 2 * PI, r = rnd(i, 62) * 12, p = P2([r * Math.cos(a), r * Math.sin(a), Math.min(38.6, zf) + 0.2]); return <circle key={i} cx={f1(p[0])} cy={f1(p[1])} r={2 + 3 * rnd(i, 63)} fill={i % 2 ? '#22160E' : '#6A5038'} opacity={0.7} />; })}</g>}
		</g>
		{kc > 0 && G > 36 && <g opacity={kc * seg(G, 36, 44)}><path d={sm(cover)} fill="url(#ncov)" />{Array.from({length: 50}, (_, i) => { const a = rnd(i, 71) * 2 * PI, r = rnd(i, 72) * 22, p = P2([r * Math.cos(a), r * Math.sin(a), G + 1]); return <circle key={i} cx={f1(p[0])} cy={f1(p[1])} r={3 + 6 * rnd(i, 73)} fill={i % 2 ? '#24180F' : '#6A5038'} opacity={0.7} />; })}</g>}
		{clumps}
	</Shell>; };

/* ============================== O · 78.43 1963, a rainy night in 贾村: the cliff behind the house gives way ============================== */
const T_SLUMP = BAR(35);   /* 80.70, the bar line */
const FL_T: [number, number, number][] = [[78.43, 1, 8], [T_SLUMP - 0.03, 1, 2.6], [82.3, 0.45, 8]];
const flashAt = (t: number) => FL_T.reduce((m, [tf, a, dk]) => { const v = t - tf; if (v < 0) return m;
	const f = v < 0.05 ? 1 : 0.8 * Math.exp(-(v - 0.05) * dk); return Math.max(m, a * f); }, 0);
const cliffTop = (x: number) => 128 + 34 * Math.sin(x * 0.0042 + 0.6) + 18 * Math.sin(x * 0.013 + 1.3) + 7 * Math.sin(x * 0.041);
const SLAB: P[] = [[1100, 352], [1196, 330], [1300, 340], [1420, 326], [1468, 400], [1452, 520], [1474, 650], [1460, 770], [1470, 846], [1110, 846], [1088, 720], [1104, 600], [1086, 470]];
/** a loess face: columns between irregular vertical joints (each its own shade, so the face has relief), faint horizontal bedding,
    nest holes, a red palaeosol band; drawn over whatever base fill is already there (light comes from that base) */
const LoessFace: React.FC<{x0: number; x1: number; top: (x: number) => number; y1: number; seed: number; ink: string; o?: number}> = ({x0, x1, top, y1, seed, ink, o = 1}) => {
	const js: number[] = []; for (let x = x0, i = 0; x < x1; i++) { js.push(x); x += 55 + 110 * rnd(i, seed); } js.push(x1);
	const jag = (x: number, i: number): P[] => Array.from({length: 9}, (_, j) => { const y = lerp(top(x) - 4, y1, j / 8); return [x + (rnd(i * 13 + j, seed + 3) - 0.5) * 18, y] as P; });
	return <g opacity={o}>
		{js.slice(0, -1).map((x, i) => { const a = jag(x, i), b = jag(js[i + 1], i + 1), v = rnd(i, seed + 5);
			return <path key={i} d={pth([...a, ...b.reverse()])} fill={v > 0.5 ? '#FFF2DC' : '#000'} opacity={v > 0.5 ? 0.05 + 0.07 * (v - 0.5) : 0.06 + 0.18 * v} />; })}
		{js.map((x, i) => { const a = jag(x, i), len = 0.45 + 0.55 * rnd(i, seed + 7), n = Math.max(2, Math.round(9 * len)); return <path key={`j${i}`} d={sm(a.slice(0, n), false)} stroke={ink} strokeWidth={1.6 + 2.6 * rnd(i, seed + 8)} fill="none" opacity={0.75} />; })}
		{Array.from({length: 7}, (_, i) => { const y = lerp(top(960) + 60, y1 - 40, (i + 0.5) / 7); return <path key={`h${i}`} d={sm(Array.from({length: 12}, (_, j) => [x0 + (j / 11) * (x1 - x0), y + 8 * Math.sin(j * 1.7 + i) + 4 * rnd(j, seed + i)] as P), false)} stroke={ink} strokeWidth={1.2} fill="none" opacity={0.3} />; })}
		{Array.from({length: 12}, (_, i) => { const x = x0 + rnd(i, seed + 17) * (x1 - x0), y = top(x) + 60 + rnd(i, seed + 18) * (y1 - top(x) - 200); return <ellipse key={`o${i}`} cx={x} cy={y} rx={5 + rnd(i, seed + 19) * 7} ry={4 + rnd(i, seed + 20) * 4} fill={ink} opacity={0.85} />; })}
	</g>; };
/** the loess cliff: night ↔ lightning; the slab (unless gone), its scar */
const Cliff: React.FC<{fl: number; slab: number; t: number; lamp?: number}> = ({fl, slab, t}) => {
	const c = (n: string, l: string) => mixC(n, l, fl), top: P[] = Array.from({length: 42}, (_, i) => [-40 + i * 50, cliffTop(-40 + i * 50)] as P);
	const u = seg(t, T_SLUMP, T_SLUMP + 0.6);
	return <g>
		<path d={pth([...top, [2010, 860], [-40, 860]])} fill={c('#2A221B', '#B8946A')} />
		<path d={sm([[-40, 640], [500, 652], [1000, 636], [1500, 654], [1960, 640], [1960, 668], [1500, 682], [1000, 664], [500, 682], [-40, 668]])} fill={c('#2C1E17', '#A06A48')} opacity={0.7} />
		<LoessFace x0={-40} x1={1960} top={cliffTop} y1={860} seed={5} ink={c('#120D0A', '#5A4028')} />
		{/* the top edge: grass and a small tree against the sky */}
		<g fill={c('#0C0A0A', '#2A2620')}>{Array.from({length: 90}, (_, i) => { const x = i * 22 + rnd(i, 21) * 10, y = cliffTop(x); return <path key={i} d={`M${f1(x - 5)},${f1(y + 2)} L${f1(x + (rnd(i, 22) - 0.5) * 10)},${f1(y - 8 - rnd(i, 23) * 18)} L${f1(x + 5)},${f1(y + 2)} Z`} />; })}
			</g>
		{/* the scar behind the slab: raw, wet, paler, a dark overhang along its top */}
		{u > 0 && <g><defs><linearGradient id="oscar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c('#120D0A', '#5A4028')} /><stop offset="0.12" stopColor={c('#4E3E2C', '#E4C290')} /><stop offset="1" stopColor={c('#44352A', '#C8A274')} /></linearGradient></defs>
			<path d={sm(SLAB.map(([x, y]) => [x + (x - 1280) * -0.05, y + 10] as P))} fill="url(#oscar)" />
			{Array.from({length: 12}, (_, i) => <path key={i} d={`M${1126 + i * 28},${380 + rnd(i, 31) * 50} L${1122 + i * 28 + rnd(i, 32) * 8},${640 + rnd(i, 33) * 190}`} stroke={c('#2A2018', '#9A7650')} strokeWidth={1.6 + 1.6 * rnd(i, 34)} opacity={0.55} />)}</g>}
		{/* the crack; then the slab tilts out from its foot, breaks in three and drops (clipped at the ground) */}
		{slab > 0 && <g clipPath="url(#oGround)">
			<defs><clipPath id="oslabS"><path d={sm(SLAB)} /></clipPath>{[0, 1, 2].map((j) => <clipPath key={j} id={`oslab${j}`}><rect x={1000} y={[300, 520, 680][j]} width={560} height={[220, 160, 200][j]} /></clipPath>)}</defs>
			{[0, 1, 2].map((j) => { const th = deg(32) * Math.pow(seg(t, T_SLUMP, T_SLUMP + 0.34), 1.6) + deg(20) * seg(t, T_SLUMP + 0.34, T_SLUMP + 0.75), ct = Math.cos(th);
				const fall = seg(t, T_SLUMP + 0.3 + 0.05 * (2 - j), T_SLUMP + 0.78 + 0.03 * j), dy = 520 * fall * fall * (0.8 + 0.2 * j), rr = [14, -9, 6][j] * fall, cy = [410, 600, 760][j];
				return <g key={j} transform={`translate(0 ${f1(dy)}) rotate(${f1(rr)} 1280 ${f1(846 - (846 - cy) * ct)}) translate(0 846) scale(1 ${ct.toFixed(4)}) translate(0 -846)`}>
					<g clipPath={`url(#oslab${j})`}><g clipPath="url(#oslabS)"><path d={sm(SLAB)} fill={c('#2A221B', '#B8946A')} />
						<LoessFace x0={1086} x1={1474} top={() => 340} y1={846} seed={9} ink={c('#120D0A', '#5A4028')} />
						{th > 0 && <rect x={1000} y={[300, 520, 680][j] - 2} width={560} height={6} fill="#0A0806" opacity={j === 0 ? 0 : 0.8} />}</g></g>
					{j === 0 && th > 0.01 && (() => { const lift = 70 * Math.sin(th) / Math.max(0.3, ct), e: P[] = [[1100, 352], [1196, 330], [1300, 340], [1420, 326], [1466, 380]]; return <path d={pth([...e, ...e.map(([x, y]) => [x + 6, y - lift] as P).reverse()])} fill={c('#3A2E22', '#D8B488')} />; })()}</g>; })}
			<path d={sm(SLAB)} fill="none" stroke="#0A0806" strokeWidth={3.5} strokeOpacity={u > 0 ? 0 : 0.75 * seg(t, beat(139), beat(139) + 0.5)} /></g>}
	</g>; };
const House: React.FC<{fl: number; open: number; t: number}> = ({fl, open, t}) => { const c = (n: string, l: string) => mixC(n, l, fl * 0.85), lw = 112 * (1 - 0.82 * open);
	return <g>
		<path d={pth([[-40, 458], [612, 490], [612, 852], [-40, 852]])} fill={c('#211914', '#8A6A4C')} />
		{Array.from({length: 11}, (_, i) => <path key={i} d={`M-40,${500 + i * 32} L612,${520 + i * 31}`} stroke={c('#150F0B', '#5A4430')} strokeWidth={2} opacity={0.6} />)}
		<path d={pth([[-40, 418], [650, 462], [650, 496], [-40, 458]])} fill={c('#0E0B0A', '#3A3430')} />
		{Array.from({length: 26}, (_, i) => <path key={i} d={`M${-30 + i * 26},${420 + i * 1.7} L${-30 + i * 26},${459 + i * 1.5}`} stroke={c('#1C1816', '#5A524C')} strokeWidth={3} />)}
		{/* the paper window: a lamp burns inside */}
		<rect x={92} y={566} width={104} height={80} fill="#6A4424" opacity={0.85} />
		<Glow x={144} y={606} r={110} c="#FFB060" o={0.25 * (0.85 + 0.15 * Math.sin(t * 9))} id="owin" />
		{[0, 1, 2].map((i) => <path key={i} d={`M${118 + i * 26},566 L${118 + i * 26},646`} stroke="#1A120C" strokeWidth={4} />)}<path d="M92,606 L196,606" stroke="#1A120C" strokeWidth={4} />
		<rect x={88} y={562} width={112} height={88} fill="none" stroke="#1A120C" strokeWidth={8} />
		{/* the back door: the lamplit room behind it */}
		<defs><linearGradient id="odoor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C87830" /><stop offset="1" stopColor="#FFC070" /></linearGradient></defs>
		<rect x={300} y={642} width={112} height={210} fill={open > 0 ? 'url(#odoor)' : '#0E0A08'} opacity={open > 0 ? 0.35 + 0.65 * open : 1} />
		<rect x={294} y={634} width={124} height={10} fill="#140E0A" />
		<Glow x={356} y={760} r={260} c="#FFB060" o={0.32 * open} id="odg" />
	</g>; };
/** the door leaf: hinged at the left jamb, it swings in (drawn after 陈堆, who stands behind it until it opens) */
const DoorLeaf: React.FC<{open: number; fl: number}> = ({open, fl}) => { const lw = 112 * (1 - 0.8 * open);
	return <g><rect x={300} y={642} width={lw} height={210} fill={mixC('#2A1E14', '#7A5A3A', fl * 0.8)} />
		{[0.33, 0.66].map((v, i) => <path key={i} d={`M${f1(300 + lw * v)},642 L${f1(300 + lw * v)},852`} stroke="#120C08" strokeWidth={2} />)}
		{open > 0.05 && <path d={`M${f1(300 + lw)},642 L${f1(300 + lw)},852`} stroke="#FFC070" strokeWidth={2} strokeOpacity={0.7} />}</g>; };
/** 陈堆 in O: he opens the door, steps out with the lamp; the slump: he starts, lifts the lamp, walks toward the cliff */
const chenO = (t: number) => {
	const st = stepFeet(t, -2, -16, [{t0: 79.32, t1: 79.74, f: 'F', to: 24}, {t0: 79.74, t1: 80.16, f: 'N', to: 48}, {t0: 81.42, t1: 81.84, f: 'F', to: 78}, {t0: 81.84, t1: 82.26, f: 'N', to: 106}, {t0: 82.26, t1: 82.68, f: 'F', to: 134}, {t0: 82.68, t1: 83.1, f: 'N', to: 160}]);
	const startle = es(seg(t, T_SLUMP + 0.55, T_SLUMP + 0.8)) * (1 - es(seg(t, T_SLUMP + 1.0, T_SLUMP + 1.4))), raise = es(seg(t, T_SLUMP + 0.75, T_SLUMP + 1.25));
	const hx0 = st.mid + 6 - 6 * startle, hip: P = [hx0, -92 - 1.5 * st.bob];
	const lean = 6 + 6 * st.bob - 12 * startle + 4 * raise, sw = Math.sin(t * 6.5) * 4 * st.bob;
	const hN: P = lerpP([hx0 + 12 + sw, -76], [hx0 + 34, -150], raise), hF: P = [hx0 - 6 - sw, -80 + 6 * startle];
	return {s: pose({hip, lean, neck: 4 + 6 * raise, tilt: -6 - 10 * raise, fN: st.fN, fF: st.fF, hN, hF}), lampSw: -sw * 2 + 6 * Math.sin(t * 3.1)}; };
const SO: React.FC<{t: number}> = ({t}) => { const fl = flashAt(t), open = es(seg(t, beat(137) - 0.02, beat(137) + 0.4)), u = seg(t, T_SLUMP, T_SLUMP + 0.6);
	const push = es(seg(t, T_SLUMP + 0.6, 83.3));
	const ch = chenO(t), k = 1.15, X = 356, Y = 852, sc = toS(X, Y, k), lampH = sc(ch.s.hN), lampOn = 0.9 + 0.1 * Math.sin(t * 11) * Math.sin(t * 4.3);
	const hitV = t - T_SLUMP - 0.62, shake = hitV > 0 ? 6 * Math.exp(-hitV * 7) * Math.sin(hitV * 55) : 0, mound = 170 * eout(seg(t, T_SLUMP + 0.55, T_SLUMP + 1.1)), sky = mixC('#0A0E16', '#9AA6C8', fl);
	const cam: YCam = {x: 40 * seg(t, 78.43, 81) + 300 * push + shake, y: 50 * push + shake * 0.7, s: 1.02 + 0.02 * seg(t, 78.43, 81) + 0.16 * push};
	const spray = Array.from({length: 34}, (_, i) => { const v = (t - T_SLUMP - 0.6 - rnd(i, 51) * 0.12) / 0.75; if (v < 0 || v > 1) return null; const a = PI * (0.1 + 0.8 * rnd(i, 52)), sp = 240 + 260 * rnd(i, 53);
		const x = 1280 + (rnd(i, 54) - 0.5) * 320 + Math.cos(a) * sp * v * (rnd(i, 55) > 0.5 ? 1 : -1), y = 846 - Math.sin(a) * sp * v + 900 * v * v; return <path key={i} d={blob(x, y, 5 + 9 * rnd(i, 56), i)} fill={mixC('#2A2018', '#8A6A48', fl)} />; });
	return <Shell t={t} id="O" bg="#07080C" vig={0.62}>
		<defs><clipPath id="oGround"><rect x={-200} y={-200} width={2400} height={1050} /></clipPath></defs>
		<g transform={layerT(cam, 0.3)}><rect x={-300} y={-300} width={2600} height={1000} fill={sky} />
			{Array.from({length: 9}, (_, i) => <ellipse key={i} cx={-100 + i * 260 + rnd(i, 3) * 80} cy={40 + rnd(i, 4) * 70} rx={220} ry={60} fill={mixC('#06080E', '#5A6484', fl)} opacity={0.7} />)}
			{fl > 0.5 && t < 79 && <path d="M1330,-20 L1310,30 L1352,58 L1322,110 L1366,96 L1342,170" stroke="#F4F6FF" strokeWidth={4} fill="none" opacity={fl} />}</g>
		<g transform={layerT(cam, 0.8)}><Cliff fl={fl} slab={1} t={t} />
			{t > T_SLUMP + 0.55 && <Plume x={1290} y={840} h={200 + 260 * seg(t, T_SLUMP + 0.55, T_SLUMP + 1.6)} w={300} c={mixC('#5A4A3E', '#C8B090', fl)} o={0.42 * seg(t, T_SLUMP + 0.55, T_SLUMP + 0.75) * (1 - seg(t, T_SLUMP + 1.2, T_SLUMP + 2.6))} id="odust" seed={t * 0.8} />}</g>
		<g transform={layerT(cam, 1)}>
			<path d={sm([[-40, 850], [600, 856], [1200, 846], [1960, 852], [1960, 1100], [-40, 1100]])} fill={mixC('#16110E', '#5A4836', fl)} />
			{[[700, 930, 160], [1160, 990, 220], [1560, 920, 140], [420, 1010, 180]].map(([x, y, r], i) => <g key={i}><ellipse cx={x} cy={y} rx={r} ry={r * 0.1} fill={mixC('#1C2230', '#C8D0E0', fl)} opacity={0.55} />
				<ellipse cx={x - r * 0.2} cy={y} rx={r * 0.4} ry={r * 0.04} fill="#FFB060" opacity={0.3 * open * (i === 3 ? 1 : 0.4)} /></g>)}
			{mound > 0 && <g><path d={sm([[1020, 856], [1120, 856 - mound * 0.55], [1240, 856 - mound], [1360, 856 - mound * 0.8], [1500, 856 - mound * 0.35], [1580, 858], [1300, 870]])} fill={mixC('#2A2018', '#A8825A', fl)} />
				{Array.from({length: 18}, (_, i) => { const x = 1060 + rnd(i, 71) * 480, top = 856 - mound * Math.max(0, 1 - Math.abs(x - 1260) / 300); return <path key={i} d={blob(x, lerp(top + 14, 852, rnd(i, 72) * 0.7), 10 + 22 * rnd(i, 73), i + 60)} fill={mixC(i % 2 ? '#3A2C20' : '#1C150F', i % 2 ? '#C49C70' : '#7A5A3A', fl)} />; })}</g>}
			{spray}
			<House fl={fl} open={open} t={t} />
			<path d={pth([[300, 852], [412, 852], [600, 1080], [140, 1080]])} fill="#FFB060" opacity={0.16 * open} />
			{/* eave drips */}
			<Rain t={t} n={30} seed={77} L={60} v={1400} sl={0} w={2} c="#8A96B0" o={0.35 + 0.4 * fl} x0={-40} x1={640} y0={496} y1={852} />
			<Glow x={lampH[0]} y={lampH[1] + 20} r={220} c="#FFB060" o={0.5 * open * lampOn} id="olamp" />
			<Chen s={ch.s} x={X} y={Y} k={k} id="ochen" lx={1} ly={0.1} />
			<Lamp x={lampH[0]} y={lampH[1]} s={k} sw={ch.lampSw} on={lampOn} />
			<DoorLeaf open={open} fl={fl} />
		</g>
		{/* rain: far, mid, near; the drops around the lamp catch its light */}
		<Rain t={t} n={300} seed={11} L={26} v={1500} sl={0.12} w={1.2} c="#A0AEC8" o={0.22 + 0.4 * fl} />
		<Rain t={t} n={150} seed={23} L={52} v={2300} sl={0.13} w={1.8} c="#B0BCD4" o={0.26 + 0.3 * fl} />
		<g clipPath="url(#oLampC)"><Rain t={t} n={140} seed={31} L={40} v={2000} sl={0.13} w={1.8} c="#FFC880" o={0.55 * open} /></g>
		<defs><clipPath id="oLampC"><circle cx={(lampH[0] - 960) * cam.s + 960 - cam.x} cy={(lampH[1] + 20 - 540) * cam.s + 540 - cam.y} r={150} /></clipPath></defs>
		<Rain t={t} n={36} seed={41} L={120} v={3300} sl={0.14} w={3.2} c="#C0CAE0" o={0.18 + 0.2 * fl} />
		<rect width={W} height={H} fill="#E8F0FF" opacity={0.18 * fl} />
	</Shell>; };

/* ============================== P · 82.96 the raw face: a glint; he digs it out with his hands, and holds it ============================== */
const P_X = 1190, P_Y = 1000, P_K = 3.8;
const P_IN: P = [1402, 826];   /* the 尊's middle where it sits in the face (stage px) */
const SCR = [beat(147), beat(148), beat(149)];   /* the three scrapes end on these beats: 84.09, 84.66, 85.23 */
const T_GRIP = beat(150) - 0.42, T_FREE = beat(150), T_UP = beat(150) + 0.6;   /* 85.37, 85.79, 86.39 */
/** the 尊 in P: its middle (stage px) and roll */
const zunP = (t: number, sc: (q: P) => P, hugMid: P): {m: P; roll: number} => { const a = seg(t, T_FREE - 0.05, T_UP), e = es(a);
	if (a <= 0) return {m: P_IN, roll: 14}; const H = sc(hugMid), arc: P = [lerp(P_IN[0], H[0], e), lerp(P_IN[1], H[1], e) - 40 * Math.sin(PI * e)];
	return {m: arc, roll: lerp(14, 6, e)}; };
const chenP = (t: number) => {
	const crouchFK: FK = {hip: [-4, -46], lean: 30, neck: 2, tilt: -12, fN: [34, -8], fF: [-32, -6], toeF: -1, hN: [30, -40], hF: [22, -46]};
	const inFK: FK = {...crouchFK, lean: 44, tilt: -4, hN: [44, -58], hF: [40, -66]};
	const standFK: FK = {hip: [16, -90], lean: -9, neck: 10, tilt: 14, fN: [34, -8], fF: [10, -8], toeF: 1, hN: [46, -98], hF: [44, -84]};
	const standLamp: FK = {hip: [-6, -92], lean: 4, neck: 4, tilt: -6, fN: [8, -8], fF: [-18, -8], hN: [22, -128], hF: [-8, -84]};
	const swingLamp: FK = {...standLamp, lean: 10, tilt: -2, hN: [44, -122], hF: [-4, -86]};
	const lampDown: FK = {...crouchFK, lean: 40, hN: [30, -12], hF: [24, -50]};
	let fk = track([[82.96, standLamp], [83.42, swingLamp], [83.62, swingLamp], [84.02, lampDown], [84.2, inFK]], t, mixFK, es);
	if (t > 83.6 && t < 84.05) { const k = seg(t, 83.62, 84.02); fk = {...fk, fN: [lerp(8, 34, es(k)), -8 - 9 * Math.sin(PI * k)], fF: [lerp(-18, -32, es(k)), -8 + 2 * es(k)], toeF: k > 0.5 ? -1 : 1}; }
	/* three scrapes: one hand reaches into the face and drags the mud down and back; they alternate */
	SCR.forEach((te, i) => { const a = seg(t, te - 0.5, te - 0.22), b = seg(t, te - 0.22, te + 0.06); if (a <= 0 || t > te + 0.3) return;
		const top: P = [50 + 4 * i, -78 + 18 * i], bot: P = [40, -44 + 6 * i], rest: P = i % 2 ? [40, -66] : [44, -58];
		const h = b > 0 ? lerpP(top, bot, es(b)) : lerpP(rest, top, es(a)), back = seg(t, te + 0.06, te + 0.3), hh = lerpP(h, rest, es(back));
		fk = i % 2 ? {...fk, hF: hh} : {...fk, hN: hh}; fk = {...fk, lean: fk.lean + 4 * Math.sin(PI * (a + b) / 2)}; });
	/* grip, pull, stand up with it (the far foot steps up under him), lean back against the weight */
	const gripFK: FK = {...inFK, lean: 46, hN: [44, -50], hF: [66, -40]};
	if (t > T_GRIP) fk = mixFK(fk, gripFK, es(seg(t, T_GRIP, T_FREE - 0.1)));
	const up = es(seg(t, T_FREE - 0.05, T_UP + 0.3)), stp = seg(t, T_FREE + 0.25, T_UP + 0.25);
	if (up > 0) { fk = mixFK(fk, standFK, up); fk = {...fk, fF: [lerp(-32, 10, es(stp)), -8 - 9 * Math.sin(PI * stp)], toeF: stp > 0.4 ? 1 : -1}; }
	const sway = t > T_UP ? Math.sin((t - T_UP) * 4.2) * 1.6 * seg(t, T_UP, T_UP + 0.3) : 0;
	if (up > 0.999) fk = {...fk, lean: fk.lean + sway, hip: [fk.hip[0] - sway * 0.3, fk.hip[1]]};
	return pose(fk); };
const LP: ZunLight = {dir: [0.4, -0.78, 0.3], col: '#FFC070', k: 1.5, amb: 0.26, ambCol: '#3A4458', spec: 0.5, shin: 12, rim: {dir: [-0.5, 0.75, 0.4], col: '#8A9AB8', k: 0.5}};
/** the raw face in P, lamp-lit from the lower left (the gradient pface is defined by SP) */
const PFace: React.FC = () => <g>
	<rect x={-300} y={-300} width={2600} height={1500} fill="url(#pface)" />
	<path d={sm([[-300, -300], [640, -300], [480, 160], [560, 460], [360, 760], [-300, 860]])} fill="#1A1410" opacity={0.7} />
	<LoessFace x0={420} x1={2100} top={() => -200} y1={1010} seed={21} ink="#2A1C12" o={0.9} />
	{Array.from({length: 34}, (_, i) => { const x = 560 + rnd(i, 12) * 1400, y = -100 + rnd(i, 13) * 800; return <path key={`d${i}`} d={`M${f1(x)},${f1(y)} l${f1(-2 + rnd(i, 14) * 4)},${f1(60 + rnd(i, 15) * 160)}`} stroke="#F2D6A8" strokeWidth={1.2} opacity={0.22} />; })}
</g>;
const SP: React.FC<{t: number}> = ({t}) => { const sc = toS(P_X, P_Y, P_K), s = chenP(t), hugMid: P = [s.sh[0] + 34, s.sh[1] + 40];
	const pushIn = es(seg(t, 82.96, 84.5)), follow = es(seg(t, T_FREE + 0.1, T_UP + 0.7));
	const cam: YCam = {x: lerp(lerp(60, 318, pushIn), 238, follow), y: lerp(lerp(40, 233, pushIn), 70, follow), s: lerp(lerp(1.04, 1.28, pushIn) + 0.07 * es(seg(t, 84.5, T_FREE)), 1.2, follow)};
	const z = zunP(t, sc, hugMid), zcam = zc(z.m[0], z.m[1], P_K, 34, 8, z.roll), out = t > T_FREE - 0.05;
	const beakIn = (() => { const p = proj(zc(P_IN[0], P_IN[1], P_K, 34, 8, 14), [-18.2 * Math.SQRT1_2, 18.2 * Math.SQRT1_2, 37.4]); return [p[0], p[1]] as P; })(), beakP = out ? beakIn : beakIn;
	/* the hole in the face grows with each scrape */
	const holeU = SCR.reduce((a, te, i) => a + es(seg(t, te - 0.22, te + 0.1)), 0) + 0.25 * es(seg(t, 83.2, 83.5));
	const hr = (k: number) => lerp(12, 86, cl(k / 3.25)), hc: P = lerpP(beakIn, [P_IN[0], P_IN[1] - 6], es(cl(holeU / 3.25)));
	const hole = sm(Array.from({length: 22}, (_, i) => { const a = (i / 22) * 2 * PI, r = hr(holeU) * (0.86 + 0.22 * rnd(i, 81)); return [hc[0] + r * 0.82 * Math.cos(a), hc[1] + r * 1.05 * Math.sin(a)] as P; }));
	const tG = beat(145), glint = Math.max(0.12 * seg(t, 83.15, 83.4) * (1 - seg(t, 84.2, 84.5)), Math.exp(-Math.pow((t - tG) / 0.13, 2)), 0.45 * Math.exp(-Math.pow((t - 84.05) / 0.09, 2)));
	const lampOn = 0.92 + 0.08 * Math.sin(t * 11) * Math.sin(t * 4.3), lampSet = t >= 84.0, lampHand = sc(s.hN), lampSw = t < 84 ? 10 * Math.sin((t - 82.96) * 5.2) * (1 - seg(t, 83.5, 84)) : 0;
	const lampTop: P = lampSet ? sc([30, -26]) : lampHand, lamp: P = [lampTop[0], lampTop[1] + 18 * P_K];
	const clumps = SCR.flatMap((te, i) => Array.from({length: 7}, (_, j) => { const v = (t - te + 0.1 - 0.05 * rnd(j, 91 + i)) / 0.5; if (v < 0 || v > 1) return null;
		const x0 = hc[0] - 60 + rnd(j, 93 + i) * 90, y0 = hc[1] + 20 + rnd(j, 95 + i) * 40; return <path key={`${i}_${j}`} d={blob(x0 - 60 * v * rnd(j, 97), y0 + 260 * v * v + 20 * v, 5 + 8 * rnd(j, 99 + i), j + i * 7)} fill="#4A3424" />; }));
	return <Shell t={t} id="P" bg="#0A0806" vig={0.6}>
		<defs><radialGradient id="pface" gradientUnits="userSpaceOnUse" cx={lamp[0]} cy={lamp[1]} r={1100}><stop offset="0" stopColor="#D2A46A" /><stop offset="0.35" stopColor="#8E6A44" /><stop offset="0.7" stopColor="#4A3826" /><stop offset="1" stopColor="#1E1712" /></radialGradient>
			<mask id="phole" maskUnits="userSpaceOnUse" x={-400} y={-400} width={2800} height={2000}><rect x={1250} y={640} width={320} height={330} fill="#fff" /><path d={hole} fill="#000" /></mask>
			<linearGradient id="pcav" gradientUnits="userSpaceOnUse" x1={0} y1={P_IN[1] - 100} x2={0} y2={P_IN[1] + 100}><stop offset="0" stopColor="#0E0906" /><stop offset="0.7" stopColor="#24180F" /><stop offset="1" stopColor="#4A3422" /></linearGradient></defs>
		<g transform={layerT(cam, 1)}>
			<PFace />
			{/* the hole: dark inside; the 尊 in it; the face over it except the hole */}
			<path d={hole} fill="url(#pcav)" /><path d={hole} fill="none" stroke="#1E140C" strokeWidth={5} />
			{!out && <Zun cam={zcam} light={rotL(LP, 34)} id="pz" patina={1} shadow={false} inscription={false} />}
			<g mask="url(#phole)"><PFace /></g>
			<path d={hole} fill="none" stroke="#E8C898" strokeWidth={2} strokeOpacity={0.35} transform="translate(-2 -3)" />
			{/* the debris of the slump, the ground */}
			<path d={sm([[1080, 1010], [1300, 980], [1560, 900], [1760, 860], [1960, 880], [2100, 1100], [1000, 1100]])} fill="#3A2A1C" />
			{Array.from({length: 16}, (_, i) => <path key={i} d={blob(1340 + rnd(i, 61) * 640, 900 + rnd(i, 62) * 120, 8 + 16 * rnd(i, 63), i + 40)} fill={i % 2 ? '#5A4430' : '#2A1E14'} />)}
			<path d={sm([[-300, 1000], [800, 996], [1300, 1004], [2200, 1000], [2200, 1300], [-300, 1300]])} fill="#14100C" />
			<ellipse cx={760} cy={1030} rx={240} ry={16} fill="#3A4458" opacity={0.5} />
			{clumps}
			<Glow x={lamp[0]} y={lamp[1] - 20} r={520} c="#FFB060" o={0.4 * lampOn} id="plg" />
			<Chen s={s} x={P_X} y={P_Y} k={P_K} id="pcb" part="back" />
			{out && <Zun cam={zcam} light={rotL(LP, 34)} id="pz" patina={1} shadow={false} inscription={false} />}
			<Chen s={s} x={P_X} y={P_Y} k={P_K} id="pcf" part="front" />
			<Lamp x={lampTop[0]} y={lampTop[1]} s={P_K} sw={lampSw} on={lampOn} />
			{glint > 0.02 && (() => { const L = 18 + 62 * glint, d = L * 0.18; return <g opacity={Math.min(1, glint * 1.2)}><Glow x={beakP[0]} y={beakP[1]} r={40 + 80 * glint} c="#FFD27A" o={0.95} id="pgl" />
				<path d={`M${f1(beakP[0] - L)},${f1(beakP[1])} L${f1(beakP[0] - d)},${f1(beakP[1] - d * 0.5)} L${f1(beakP[0])},${f1(beakP[1] - L)} L${f1(beakP[0] + d)},${f1(beakP[1] - d * 0.5)} L${f1(beakP[0] + L)},${f1(beakP[1])} L${f1(beakP[0] + d)},${f1(beakP[1] + d * 0.5)} L${f1(beakP[0])},${f1(beakP[1] + L)} L${f1(beakP[0] - d)},${f1(beakP[1] + d * 0.5)} Z`} fill="#FFF4D0" />
				<circle cx={beakP[0]} cy={beakP[1]} r={4 + 4 * glint} fill="#FFFFFF" /></g>; })()}
		</g>
		<Rain t={t} n={300} seed={13} L={34} v={1600} sl={0.12} w={1.4} c="#A0AEC8" o={0.27} />
		<g clipPath="url(#pLampC)"><Rain t={t} n={120} seed={33} L={40} v={2000} sl={0.13} w={1.8} c="#FFC880" o={0.4} /></g>
		<defs><clipPath id="pLampC"><circle cx={(lamp[0] - 960) * cam.s + 960 - cam.x} cy={(lamp[1] - 300 - 540) * cam.s + 540 - cam.y} r={420} /></clipPath></defs>
		<Rain t={t} n={56} seed={43} L={120} v={3300} sl={0.14} w={3.2} c="#C0CAE0" o={0.2} />
	</Shell>; };

/** 陈堆: a farmer in a padded jacket, bare-headed (the 1965 worker is the one in the cadre cap) */
const Chen: React.FC<{s: Sk; x: number; y: number; k: number; id: string; part?: 'all' | 'back' | 'front'; rim?: string; lx?: number; ly?: number; o?: number}> = ({s, x, y, k, id, part = 'all', rim = '#FFC070', lx = -1, ly = 0.2, o}) =>
	<Sil id={id} x={x} y={y} k={k} rim={rim} lx={lx} ly={ly} fill="#130D09" o={o}><Body s={s} dress="jacket" hat="none" part={part} wide={1.12} /></Sil>;

/* ============================== Q · 87.49 his house: he sets it in the corner, grain pours in; then the seasons pass ============================== */
const Q_X = 820, Q_Y = 962, Q_K = 5;
const Q_MID: P = [61, -21.4];   /* the 尊's middle at rest, body-local */
const T_POUR = beat(154), T_TL = BAR(39);   /* 88.62, 89.75 */
const chenQ = (t: number) => {
	const sackOn: FK = {hip: [0, -90], lean: 4, neck: 6, tilt: 10, fN: [14, -8], fF: [-16, -8], hN: [-14, -104], hF: [-22, -100]};
	const K: [number, FK][] = [
		[87.49, {hip: [2, -66], lean: 58, neck: 0, tilt: 8, fN: [14, -8], fF: [-16, -8], hN: [49, -37], hF: [71, -42]}],
		[87.95, {hip: [2, -58], lean: 66, neck: 0, tilt: 8, fN: [14, -8], fF: [-16, -8], hN: [49, -22], hF: [71, -26]}],
		[88.1, {hip: [0, -62], lean: 60, neck: 2, tilt: 6, fN: [14, -8], fF: [-16, -8], hN: [44, -34], hF: [56, -40]}],
		[88.34, sackOn],
		[88.6, {hip: [4, -88], lean: 22, neck: 4, tilt: 18, fN: [14, -8], fF: [-16, -8], hN: [48, -78], hF: [20, -100]}],
		[89.42, {hip: [4, -87], lean: 26, neck: 4, tilt: 22, fN: [14, -8], fF: [-16, -8], hN: [50, -70], hF: [16, -110]}],
		[89.78, {hip: [2, -78], lean: 40, neck: 2, tilt: 14, fN: [14, -8], fF: [-16, -8], hN: [34, -40], hF: [26, -60]}],
		[90.1, {hip: [0, -90], lean: 6, neck: 6, tilt: 6, fN: [14, -8], fF: [-16, -8], hN: [10, -66], hF: [4, -68]}]];
	return pose(track(K, t, mixFK, es)); };
/** the sack: bottom B and mouth M (body-local); on the bench, lifted, pouring, set down against the 尊 */
const sackQ = (t: number, s: Sk): {B: P; M: P} => {
	const bench = {B: [-20, -45] as P, M: [-18, -104] as P}, floor = {B: [30, -2] as P, M: [34, -52] as P};
	if (t < 88.2) return bench;
	if (t < 89.5) { const g = es(seg(t, 88.2, 88.4)); const M = s.hN, B = lerpP(s.hF, [s.hF[0] - 6, s.hF[1] + 8], 0.5); return {B: lerpP(bench.B, [B[0] - 4, B[1] + 6], g), M: lerpP(bench.M, [M[0] + 4, M[1] + 2], g)}; }
	const g = es(seg(t, 89.5, 89.8)), M0 = [s.hN[0] + 4, s.hN[1] + 2] as P, B0 = [s.hF[0] - 7, s.hF[1] + 10] as P; return {B: lerpP(B0, floor.B, g), M: lerpP(M0, floor.M, g)}; };
const Sack: React.FC<{B: P; M: P; full: number; k: number}> = ({B, M, full, k}) => { const ax = [M[0] - B[0], M[1] - B[1]], L = Math.hypot(ax[0], ax[1]) || 1, u: P = [ax[0] / L, ax[1] / L], n: P = [-u[1], u[0]];
	const at = (f: number, w: number): P => [B[0] + ax[0] * f + n[0] * w, B[1] + ax[1] * f + n[1] * w], wb = 19 * k * (0.75 + 0.25 * full), wm = 18 * k * (0.6 + 0.4 * full);
	return <g><path d={sm([at(-0.04, 0), at(0.02, wb), at(0.5, wm + 1), at(0.78, wm * 0.8), at(0.9, 4 * k), at(1.0, 6 * k), at(1.04, 0), at(1.0, -6 * k), at(0.9, -4 * k), at(0.78, -wm * 0.8), at(0.5, -wm - 1), at(0.02, -wb)])} fill="#5A4630" />
		<path d={sm([at(0.1, -wb + 3), at(0.5, -wm + 2), at(0.75, -wm * 0.7)], false)} stroke="#2A1E14" strokeWidth={2.2} fill="none" opacity={0.6} />
		<path d={sm([at(0.1, wb - 3), at(0.5, wm - 1), at(0.75, wm * 0.7)], false)} stroke="#C8A070" strokeWidth={1.6} fill="none" opacity={0.45} /></g>; };
const LQ = (warm: number, sun: number): ZunLight => ({dir: [0.3, -0.75 + 0.4 * sun, 0.5], col: mixC('#B8CCE8', '#FFC888', warm), k: 0.6 + 0.9 * sun, amb: 0.3, ambCol: mixC('#3E4656', '#5A4A3E', warm), spec: 0.3 + 0.2 * sun, shin: 12, rim: {dir: [-0.5, 0.6, 0.4], col: mixC('#8A9AB8', '#C8A070', warm), k: 0.35}});
const SQ: React.FC<{t: number}> = ({t}) => { const s = chenQ(t), sc = toS(Q_X, Q_Y, Q_K), sk = sackQ(t, s), Bs = sc(sk.B), Ms = sc(sk.M);
	const mid = sc(Q_MID), zcam = zc(mid[0], mid[1], Q_K, 30, 12, 0), mouth = proj(zcam, [0, 0, 38.8]);
	const touch = seg(t, 87.9, 87.98), lift = 16 * (1 - es(seg(t, 87.49, 87.95)));
	const zm: P = [mid[0], mid[1] - lift * Q_K], zcamL = t < 87.95 ? zc(zm[0], zm[1], Q_K, 30, 12, 0) : zcam;
	const pour = seg(t, T_POUR, 89.45), flowing = t > T_POUR - 0.04 && t < 89.5, heap = 3.2 * es(seg(t, T_POUR + 0.3, 89.4)) * (1 - 0.65 * es(seg(t, 90.3, 92)));
	/* the time-lapse clock: three days from 89.9; the season goes from warm to cold */
	const tlu = t < 89.9 ? -1 : (t - 89.9) / 0.7, day = tlu < 0 ? 0.42 : tlu - Math.floor(tlu), sun = tlu < 0 ? 0.85 : Math.pow(Math.sin(PI * day), 0.7), warm = 1 - seg(t, 90.0, 91.8);
	const ghost = 1 - seg(t, T_TL - 0.05, 90.15), lc = mixC('#C8DCF0', '#FFD49A', warm), patchX = lerp(380, 1500, day), night = 1 - sun;
	const wallL = mixC('#2A2C32', '#4A3826', warm), wallR = mixC('#22242A', '#3A2C1E', warm), fl = mixC('#1C1C20', '#2E2218', warm);
	const web = seg(t, 90.3, 91.9), beakR = (() => { const p = proj(zcam, [0, 18.6, 37.6]); return [p[0], p[1]] as P; })(), corner: P = [1240, 760];
	const sackFull = 1 - 0.7 * pour - 0.3 * seg(t, 89.5, 89.9);
	return <Shell t={t} id="Q" bg="#141210" vig={0.62}>
		<defs><linearGradient id="qfl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={fl} /><stop offset="1" stopColor="#0C0A08" /></linearGradient>
			<linearGradient id="qbeam" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor={lc} stopOpacity={0.15 * sun} /><stop offset="1" stopColor={lc} stopOpacity={0} /></linearGradient></defs>
		<g transform={layerT({x: 230 * es(seg(t, 87.49, T_TL)), y: 150 * es(seg(t, 87.49, T_TL)), s: 1 + 0.2 * es(seg(t, 87.49, T_TL))}, 1)}>
		<path d={pth([[0, 0], [1240, 0], [1240, 760], [0, 900]])} fill={wallL} />
		<path d={pth([[1240, 0], [1920, 0], [1920, 880], [1240, 760]])} fill={wallR} />
		{Array.from({length: 46}, (_, i) => <path key={i} d={`M${f1(rnd(i, 81) * 1900)},${f1(rnd(i, 82) * 700)} l${f1(6 + rnd(i, 83) * 14)},${f1((rnd(i, 84) - 0.5) * 6)}`} stroke="#000" strokeOpacity={0.25} strokeWidth={2} />)}
		<path d={pth([[0, 900], [1240, 760], [1920, 880], [1920, 1080], [0, 1080]])} fill="url(#qfl)" />
		{/* the window on the right wall: outside the light of each day, then snow */}
		<path d={pth([[1480, 360], [1720, 338], [1720, 590], [1480, 600]])} fill={mixC(mixC('#1A2232', '#2A2030', warm), mixC('#D8E4F0', '#F2D8A8', warm), sun)} opacity={0.75} />
		{warm < 0.45 && Array.from({length: 26}, (_, i) => { const y = 340 + ((rnd(i, 7) * 260 + t * 70) % 260); return <circle key={i} cx={1484 + rnd(i, 8) * 232 + 6 * Math.sin(t * 2 + i)} cy={y} r={2.4} fill="#F4F8FF" opacity={0.8 * seg(0.45 - warm, 0, 0.2)} />; })}
		{[0.25, 0.5, 0.75].map((v, i) => <path key={i} d={`M${1480 + 240 * v},${360 - 22 * v} L${1480 + 240 * v},${600 - 10 * v}`} stroke="#1E140E" strokeWidth={6} />)}
		{[0.33, 0.66].map((v, i) => <path key={`h${i}`} d={`M1480,${360 + 240 * v} L1720,${338 + 252 * v}`} stroke="#1E140E" strokeWidth={6} />)}
		<path d={pth([[1468, 350], [1732, 326], [1732, 602], [1468, 612]])} fill="none" stroke="#1E140E" strokeWidth={12} />
		{warm < 0.5 && <path d={pth([[1480, 600], [1720, 590], [1720, 572], [1480, 584]])} fill="#EEF4FA" opacity={0.7 * seg(0.5 - warm, 0, 0.3)} />}
		{/* the light shaft and the patch it lays on the floor, sweeping across with each day */}
		<path d={pth([[1480, 360], [1480, 600], [patchX - 160, 1000], [patchX + 120, 930]])} fill="url(#qbeam)" />
		<path d={pth([[patchX - 150, 990], [patchX + 120, 925], [patchX + 300, 950], [patchX + 30, 1030]])} fill={lc} opacity={0.07 * sun * seg(t, 89.7, 90.0)} />
		<rect width={W} height={H} fill="#06080E" opacity={0.42 * night * seg(t, 89.9, 90.1)} />
		{/* the bench by the wall, a straw hat, maize */}
		<g fill="#1A120C"><rect x={sc([-46, 0])[0]} y={sc([0, -45])[1]} width={60 * Q_K} height={14} /><rect x={sc([-42, 0])[0]} y={sc([0, -45])[1]} width={10} height={45 * Q_K} /><rect x={sc([8, 0])[0]} y={sc([0, -45])[1]} width={10} height={45 * Q_K} /></g>
		<ellipse cx={1820} cy={420} rx={58} ry={16} fill="#2A1E14" /><path d={sm([[1788, 420], [1798, 388], [1842, 388], [1852, 420]])} fill="#2A1E14" />
		{/* the 尊 (true size) with the grain; the sack; 陈堆 */}
		{touch > 0 && t < 88.5 && <g opacity={1 - seg(t, 88.0, 88.5)}>{Array.from({length: 10}, (_, i) => <circle key={i} cx={mid[0] + (rnd(i, 3) - 0.5) * 160 * (0.5 + seg(t, 87.95, 88.4))} cy={sc([0, -1])[1] - rnd(i, 4) * 26 * seg(t, 87.95, 88.4)} r={5 + rnd(i, 5) * 6} fill="#8A7458" opacity={0.4} />)}</g>}
		<Chen s={s} x={Q_X} y={Q_Y} k={Q_K} id="qcb" part="back" rim={lc} lx={1} ly={-0.2} o={ghost} />
		<Zun cam={zcamL} light={rotL(LQ(warm, 0.35 + 0.65 * sun * (0.4 + 0.6 * Math.exp(-Math.pow((patchX - 1050) / 380, 2)))), 30)} id="qz" patina={0.95} shadow={true} inscription={false} />
		{heap > 0.02 && <g opacity={seg(t, T_POUR + 0.25, T_POUR + 0.45)}><Grain cam={zcam} heap={heap} id="qg" c1={mixC('#A89880', '#E8C27A', warm)} c2={mixC('#4A4236', '#8A6430', warm)} /></g>}
		{t > 88.9 && Array.from({length: 22}, (_, i) => { const v = ((t - 88.9) * 1.6 + rnd(i, 91)) % 1, x = mouth[0] + (rnd(i, 92) - 0.5) * 120 * (0.4 + v), y = mouth[1] + 160 * v * v + 30 * v; return t < 89.5 ? <circle key={i} cx={x} cy={Math.min(y, sc([0, -1])[1])} r={2.2} fill="#E8C27A" opacity={0.8} /> : null; })}
		{Array.from({length: 26}, (_, i) => <ellipse key={`f${i}`} cx={mid[0] - 120 + rnd(i, 93) * 240} cy={sc([0, -1])[1] + rnd(i, 94) * 26} rx={3} ry={1.8} fill="#D8B068" opacity={0.65 * seg(t, 89.0, 89.4)} />)}
		{flowing && <g><path d={`M${f1(Ms[0])},${f1(Ms[1])} Q${f1(Ms[0] + 20)},${f1((Ms[1] + mouth[1]) / 2)} ${f1(mouth[0])},${f1(mouth[1] - 6)}`} stroke="#E8C27A" strokeWidth={30 * (0.35 + 0.65 * seg(t, T_POUR - 0.04, T_POUR + 0.1)) * (1 - 0.5 * seg(t, 89.2, 89.5))} fill="none" strokeLinecap="round" opacity={0.95} />
			{Array.from({length: 26}, (_, i) => { const v = ((t * 2.4 + rnd(i, 95)) % 1), a = 1 - v, x = a * a * Ms[0] + 2 * a * v * (Ms[0] + 20) + v * v * mouth[0], y = a * a * Ms[1] + 2 * a * v * ((Ms[1] + mouth[1]) / 2) + v * v * mouth[1];
				return <circle key={i} cx={x + (rnd(i, 96) - 0.5) * 34} cy={y} r={3.2} fill={i % 3 ? '#F2D48A' : '#8A6430'} />; })}</g>}
		<g opacity={t < 89.5 ? ghost : 1}><Sack B={Bs} M={Ms} full={sackFull} k={Q_K} /></g>
		<Chen s={s} x={Q_X} y={Q_Y} k={Q_K} id="qcf" part="front" rim={lc} lx={1} ly={-0.2} o={ghost} />
		{web > 0 && <g stroke="#E8ECF2" strokeOpacity={0.4 * web} strokeWidth={1.1} fill="none">{[0, 1, 2, 3, 4, 5].map((i) => { const a: P = lerpP(corner, [beakR[0] + 60 - i * 50, beakR[1] - 120 + i * 40], cl(web * 1.4 - i * 0.08)); return <path key={i} d={`M${corner[0]},${corner[1]} L${f1(a[0])},${f1(a[1])}`} />; })}
			{[0.3, 0.5, 0.7, 0.9].map((r, i) => r < web ? <path key={`s${i}`} d={`M${f1(lerp(corner[0], beakR[0] + 60, r))},${f1(lerp(corner[1], beakR[1] - 120, r))} Q${f1(lerp(corner[0], beakR[0] + 10, r) - 20)},${f1(lerp(corner[1], beakR[1] - 40, r))} ${f1(lerp(corner[0], beakR[0] - 190, r))},${f1(lerp(corner[1], beakR[1] + 80, r))}`} /> : null)}</g>}
		<Rising t={t} n={80} x0={patchX - 300} x1={1480} y0={380} y1={1000} c={lc} seed={88} v={34} o={0.65 * sun} r={2.6} />
		{t < 89.9 && <Rising t={t} n={90} x0={700} x1={1500} y0={360} y1={980} c="#FFE2B0" seed={99} v={60} o={0.7} r={3.2} />}</g>
	</Shell>; };

/* ============================== R · 92.02 1965: on a handcart, through the scrap-yard gate ============================== */
const R_K = 4.6, R_V = 105, R_BX = 620, R_GY = 1000, R_GATE = R_V * BTd;   /* the far gate pillar passes behind the basket on the first beat */
const R_AMP = [2.0, 4.4, 1.8, 2.6, 2.0, 3.0, 1.8, 2.4];
const bmp = (v: number) => (v <= 0 ? 0 : Math.exp(-v * 9) * Math.sin(Math.min(v * 20, 3 * PI)));
const rJolt = (t: number) => R_AMP.reduce((s, a, i) => s + a * bmp(t - beat(160 + i) + 0.02), 0);
const rRatt = (t: number) => R_AMP.reduce((s, a, i) => { const v = t - beat(160 + i) - 0.03; return v <= 0 ? s : s + a * 1.1 * Math.exp(-v * 7) * Math.sin(v * 31); }, 0);
const LR: ZunLight = {dir: [0.25, 0.85, 0.42], col: '#FFB874', k: 1.45, amb: 0.3, ambCol: '#5A5E70', spec: 0.5, shin: 14, rim: {dir: [-0.5, 0.75, 0.35], col: '#FFB46A', k: 0.6}};
/** a walk at the cart's speed: each foot is planted in the world for 60 % of the cycle (it moves back at exactly −v in the body frame) */
const gaitR = (t: number) => { const Tc = 2 * BTd, ft = (ph: number): P => { const f = ((ph % 1) + 1) % 1; if (f < 0.6) return [26 - R_V * f * Tc, -8];
		const s = (f - 0.6) / 0.4; return [lerp(26 - R_V * 0.6 * Tc, 26, es(s)), -8 - 10 * Math.sin(PI * s)]; };
	const ph = (t - 92.02) / Tc; return {fN: ft(ph), fF: ft(ph + 0.5), bob: Math.cos(4 * PI * ph)}; };
const SR: React.FC<{t: number}> = ({t}) => { const X = R_V * (t - 92.02), j = rJolt(t), k = R_K;
	const cx = (xc: number) => R_BX + xc * k, cy = (yc: number, jj = j) => R_GY + (yc - jj) * k, wx = (xw: number, p: number) => R_BX + p * k * (xw - X);
	const g = gaitR(t), s = pose({hip: [0, -91 + 1.2 * g.bob], lean: 17, neck: 2, tilt: -4, fN: g.fN, fF: g.fF, hN: [27, -79 - j], hF: [25, -82 - j]});
	const jz = 1.35 * R_AMP.reduce((sum, a, i) => sum + a * bmp(t - beat(160 + i) - 0.03), 0), roll = rRatt(t);
	const zm: P = [cx(2), cy(-79 - 19.4, j + jz)], zcam = zc(zm[0] + 19.4 * k * Math.sin(deg(roll)) * 0, zm[1], k, 40, 6, roll);
	const wh = (X / 34) * 180 / PI, gx = wx(R_GATE, 0.85);
	const sky = <g><defs><linearGradient id="rsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1A1E2A" /><stop offset="0.45" stopColor="#3A3236" /><stop offset="0.75" stopColor="#8A5A3A" /><stop offset="1" stopColor="#3A2618" /></linearGradient></defs>
		<rect width={W} height={H} fill="url(#rsky)" /><Glow x={1700} y={600} r={620} c="#FFB060" o={0.55} id="rsun" sy={0.55} /><circle cx={1700} cy={612} r={46} fill="#FFD08A" opacity={0.85} /></g>;
	const ridge = <g transform={`translate(${f1(-X * k * 0.06)} 0)`}><path d={sm([[-200, 700], [160, 610], [380, 640], [560, 585], [760, 625], [980, 570], [1200, 615], [1420, 580], [1660, 620], [2300, 590], [2300, 800], [-200, 800]])} fill="#4A3A38" opacity={0.85} /></g>;
	/* the yard, far: the shed, the chimney and the furnace glow (where this is going) */
	const yardFar = <g>{[-300, 420, 1180].map((xw, i) => { const x = wx(xw, 0.32); return <g key={i}><path d={pth([[x - 260, 560], [x + 260, 540], [x + 280, 580], [x + 280, 760], [x - 260, 760]])} fill="#241A16" /><path d={pth([[x - 280, 566], [x, 520], [x + 300, 548], [x + 300, 562], [x, 534], [x - 280, 580]])} fill="#1A1310" /></g>; })}
		{(() => { const x = wx(900, 0.32); return <g><rect x={x - 17} y={380} width={34} height={380} fill="#1E1612" /><Plume x={x} y={372} h={320} w={130} c="#7A6A62" o={0.32} id="rsmk" seed={t * 0.6} />
			<path d={sm([[x - 90, 770], [x - 84, 680], [x - 50, 656], [x + 30, 656], [x + 62, 680], [x + 68, 770]])} fill="#2A1C16" /><rect x={x - 40} y={706} width={58} height={34} fill="#FF8A34" opacity={0.85} /><Glow x={x - 11} y={724} r={150} c="#FF8A34" o={0.5} id="rfur" sy={0.7} /></g>; })()}
		<rect x={-20} y={740} width={W + 40} height={60} fill="#2A1E19" /></g>;
	const outside = <g>{Array.from({length: 7}, (_, i) => { const x = wx(-900 + i * 90, 0.32); return <g key={i}><rect x={x - 5} y={430} width={10} height={360} fill="#1E1610" /><path d={sm([[x, 300 + rnd(i, 3) * 30], [x + 34, 420], [x + 20, 600], [x - 20, 600], [x - 34, 420]])} fill="#2A2018" /></g>; })}
		<path d={pth([[-40, 760], [W + 40, 760], [W + 40, 800], [-40, 800]])} fill="#3A2C20" /></g>;
	const piles = <g>{[-420, -60, 260, 560, 860].map((xw, i) => <g key={i}>{pile(wx(xw, 0.62), 880, 420 + 120 * rnd(i, 3), 170 + 60 * rnd(i, 4), 7 + i * 3, '#1C1512', '#FFB070', 1.2)}</g>)}</g>;
	const ground = <g><rect x={0} y={R_GY - 6} width={W} height={H - R_GY + 6} fill="#241A13" />
		{Array.from({length: 40}, (_, i) => { const xw = -400 + i * 32 + rnd(i, 3) * 20, x = wx(xw, 1); if (x < -40 || x > W + 40) return null; return <ellipse key={i} cx={x} cy={R_GY + 8 + rnd(i, 4) * 50} rx={5 + 10 * rnd(i, 5)} ry={3 + 4 * rnd(i, 6)} fill={i % 3 ? '#14100C' : '#5A4632'} />; })}
		<path d={`M0,${R_GY + 2} L${W},${R_GY + 2}`} stroke="#FFB070" strokeWidth={2} strokeOpacity={0.25} /></g>;
	const near = <g>{Array.from({length: 16}, (_, i) => { const xw = -300 + i * 70 + rnd(i, 9) * 40, x = wx(xw, 1.55); if (x < -100 || x > W + 100) return null; const h = 30 + 60 * rnd(i, 10);
		return <g key={i}>{rnd(i, 11) > 0.5 ? <path d={`M${f1(x - 14)},1080 Q${f1(x - 6)},${f1(1080 - h)} ${f1(x + 4)},${f1(1080 - h * 1.2)} M${f1(x)},1080 Q${f1(x + 8)},${f1(1080 - h * 0.8)} ${f1(x + 22)},${f1(1080 - h)}`} stroke="#0C0907" strokeWidth={5} fill="none" />
			: <path d={blob(x, 1076, 22 + 20 * rnd(i, 12), i)} fill="#0C0907" />}</g>; })}</g>;
	const wheel = (x: number, y: number, r: number, far: boolean) => <g transform={`translate(${f1(x)},${f1(y)})`}>
		<circle r={r} fill="none" stroke={far ? '#0E0B09' : '#16110E'} strokeWidth={r * 0.14} />
		{!far && <circle r={r} fill="none" stroke="#FFB070" strokeWidth={2} strokeOpacity={0.4} />}
		<g transform={`rotate(${f1(wh)})`}>{Array.from({length: 10}, (_, i) => <path key={i} d={`M0,0 L${f1(r * Math.cos(i * PI / 5))},${f1(r * Math.sin(i * PI / 5))}`} stroke={far ? '#0E0B09' : '#1E1612'} strokeWidth={r * 0.05} />)}</g>
		<circle r={r * 0.16} fill={far ? '#0E0B09' : '#2A2220'} /></g>;
	return <Shell t={t} id="R" bg="#0E0B0A" vig={0.55}>
		{sky}{ridge}
		<defs><clipPath id="rout"><rect x={-100} y={0} width={Math.max(0, gx + 100)} height={H} /></clipPath><clipPath id="rin"><rect x={gx} y={0} width={W + 200} height={H} /></clipPath></defs>
		<g clipPath="url(#rin)">{yardFar}{piles}</g>
		<g clipPath="url(#rout)">{outside}</g>
		{/* the far gate pillar, the yard wall running back from it, a plaque of illegible painted marks */}
		{gx > -300 && gx < W + 300 && <g><path d={pth([[gx - 120, 640], [gx, 560], [gx, 1000], [gx - 120, 960]])} fill="#1E1612" />
			<rect x={gx} y={300} width={46 * 0.85 * k} height={700} fill="#2E221C" /><path d={`M${f1(gx + 46 * 0.85 * k)},300 L${f1(gx + 46 * 0.85 * k)},1000`} stroke="#FFB070" strokeWidth={3} strokeOpacity={0.5} />
			{Array.from({length: 18}, (_, i) => <path key={i} d={`M${f1(gx)},${300 + i * 38} L${f1(gx + 46 * 0.85 * k)},${300 + i * 38}`} stroke="#1A120E" strokeWidth={2} />)}
			<rect x={gx + 34} y={440} width={104} height={270} fill="#8A7A62" opacity={0.75} /><rect x={gx + 34} y={440} width={104} height={270} fill="none" stroke="#1A120E" strokeWidth={5} />{[0, 1, 2, 3, 4].map((i) => <path key={i} d={blob(gx + 86, 476 + i * 50, 13, i + 3)} fill="#3A2A20" opacity={0.35} />)}</g>}
		{ground}
		<Rising t={t} n={40} x0={0} x1={W} y0={500} y1={1000} c="#FFE2B8" seed={71} v={40} o={0.45} r={2.6} />
		{/* the cart: far wheel, bed, basket and what's in it, near wheel; the shafts; the man pulling */}
		{wheel(cx(30) + 10, cy(-34) - 8, 34 * k * 0.97, true)}
		<Worker1965 s={s} x={cx(188)} y={R_GY} k={k} id="rpb" part="back" rim="#FFB874" lx={1} ly={0.1} />
		<path d={`M${f1(cx(100))},${f1(cy(-74))} L${f1(cx(214))},${f1(cy(-80))}`} stroke="#120D0A" strokeWidth={9} strokeLinecap="round" />
		<path d={pth([[cx(-72), cy(-78)], [cx(112), cy(-78)], [cx(116), cy(-70)], [cx(-72), cy(-70)]])} fill="#3A2A20" />
		<path d={`M${f1(cx(-72))},${f1(cy(-78))} L${f1(cx(112))},${f1(cy(-78))}`} stroke="#FFC080" strokeWidth={2.4} strokeOpacity={0.55} />
		<path d={pth([[cx(-72), cy(-70)], [cx(116), cy(-70)], [cx(116), cy(-64)], [cx(-72), cy(-64)]])} fill="#1A120E" />
		{/* scrap behind the basket */}
		<path d={`M${f1(cx(-64))},${f1(cy(-80))} L${f1(cx(-20))},${f1(cy(-112, j + jz * 0.6))}`} stroke="#1E1612" strokeWidth={4.2 * k} strokeLinecap="round" /><path d={`M${f1(cx(-64))},${f1(cy(-84))} L${f1(cx(-20))},${f1(cy(-116, j + jz * 0.6))}`} stroke="#FFB070" strokeWidth={1.6} strokeOpacity={0.5} />
		<ellipse cx={cx(66)} cy={cy(-88, j + jz * 0.5)} rx={14 * k} ry={10 * k} fill="#1E1612" stroke="#FFB070" strokeWidth={1.6} strokeOpacity={0.5} />
		<path d={pth([[cx(-36), cy(-96, j + jz * 0.3)], [cx(36), cy(-96, j + jz * 0.3)], [cx(31), cy(-79)], [cx(-31), cy(-79)]])} fill="#2A2016" />
		<Zun cam={zcam} light={rotL(LR, 40)} id="rz" patina={0.95} shadow={false} inscription={false} />
		{/* the basket's front, woven */}
		<path d={pth([[cx(-38), cy(-94, j + jz * 0.3)], [cx(38), cy(-94, j + jz * 0.3)], [cx(32), cy(-78)], [cx(-32), cy(-78)]])} fill="#6A5236" />
		{Array.from({length: 4}, (_, i) => <path key={i} d={`M${f1(cx(-37 + i * 0.6))},${f1(cy(-90 + i * 3.4, j + jz * 0.3 * (1 - i / 4)))} L${f1(cx(37 - i * 0.6))},${f1(cy(-90 + i * 3.4, j + jz * 0.3 * (1 - i / 4)))}`} stroke="#3A2C1C" strokeWidth={2.4} />)}
		{Array.from({length: 13}, (_, i) => <path key={`v${i}`} d={`M${f1(cx(-36 + i * 6))},${f1(cy(-94, j + jz * 0.3))} L${f1(cx(-31 + i * 5.2))},${f1(cy(-78))}`} stroke="#3A2C1C" strokeWidth={1.6} opacity={0.7} />)}
		<path d={`M${f1(cx(-38))},${f1(cy(-94, j + jz * 0.3))} L${f1(cx(38))},${f1(cy(-94, j + jz * 0.3))}`} stroke="#E8C080" strokeWidth={2.4} strokeOpacity={0.6} />
		{wheel(cx(30), cy(-34), 34 * k, false)}
		<path d={`M${f1(cx(104))},${f1(cy(-72))} L${f1(cx(212))},${f1(cy(-77))}`} stroke="#1A120E" strokeWidth={10} strokeLinecap="round" /><path d={`M${f1(cx(104))},${f1(cy(-75))} L${f1(cx(212))},${f1(cy(-80))}`} stroke="#FFB070" strokeWidth={2} strokeOpacity={0.45} />
		<Worker1965 s={s} x={cx(188)} y={R_GY} k={k} id="rpf" part="front" rim="#FFB874" lx={1} ly={0.1} />
		{near}
	</Shell>; };

/* ============================== S · 96.54 the reverse angle of card 1: on the scale, 30元 ============================== */
const S_X = 780, S_Y = 958, S_K = 4.4, T_THUD = beat(169);   /* card 1 mirrored: the worker faces right, the scale's column on the right; the thud on 97.11 */
const LS: ZunLight = {dir: [0.55, -0.45, 0.6], col: '#FFC890', k: 1.3, amb: 0.32, ambCol: '#5A5262', spec: 0.5, shin: 14, rim: {dir: [-0.7, 0.5, 0.35], col: '#FF8A40', k: 0.85}};
const SS: React.FC<{t: number}> = ({t}) => { const tau = t < T_THUD ? t - T_THUD + 1.45 : 1.45 + (t - T_THUD) * 1.25, w = worker1965(tau), sc = toS(S_X, S_Y, S_K, false);
	const base = sc([54 + w.zun[0], -14 + w.zun[1]]), roll = -w.tilt, mid: P = [base[0] + 19.4 * S_K * Math.sin(deg(roll)), base[1] - 19.4 * S_K * Math.cos(deg(roll))];
	const zcam = zc(mid[0], mid[1], S_K, 210, 6, roll), bk = beaks(zcam), beak = bk.reduce((a, b) => (b[0] < a[0] ? b : a));
	const push = es(seg(t, 96.54, 101.07)), tv = t - T_THUD, shake = tv > 0 ? 4 * Math.exp(-tv * 9) * Math.sin(tv * 62) : 0;
	const cam: YCam = {x: lerp(300, -130, push), y: lerp(-40, 30, push) + shake, s: lerp(0.86, 1.08, push)};
	const fire = 0.55 + 0.3 * Math.sin(t * 9.1) * Math.sin(t * 5.3 + 1) + 0.12 * Math.sin(t * 23.7) + 0.18 * (rnd(Math.floor(t * 15), 5) - 0.5);
	const deck = sc([54, 0]), swing = tagSwing1965(tau), dust = seg(t, T_THUD, T_THUD + 0.7);
	return <Shell t={t} id="S" bg="#0E0B0A" vig={0.58}>
		<Yard1965 cam={cam} t={t} rev id="sy" />
		<g transform={layerT(cam, 0.7)}><Glow x={1460} y={760} r={1150} c="#FF7A2A" o={0.5 * fire} id="sfire" sy={0.75} /></g>
		<Rising t={t} n={130} x0={1100} x1={1900} y0={160} y1={800} c="#FFB050" seed={177} v={120} o={0.8} r={3} />
		<g transform={layerT(cam, 1)}>
			<PlatformScale1965 x={deck[0]} y={deck[1]} k={S_K} beam={beam1965(tau)} poise={0.55} side="R" rim="#FF9A50" />
			<Worker1965 s={w.s} x={S_X} y={S_Y} k={S_K} id="swb" part="back" rim="#FF9A50" lx={1} ly={0.15} />
			<Zun cam={zcam} light={rotL(LS, 210)} id="sz" patina={0.95} shadow={true} inscription={false} />
			{dust > 0 && dust < 1 && <g opacity={1 - dust}>{Array.from({length: 22}, (_, i) => <circle key={i} cx={base[0] + (rnd(i, 3) - 0.5) * 300 * (0.3 + dust)} cy={base[1] - 4 - rnd(i, 4) * 60 * dust} r={(4 + 7 * rnd(i, 5)) * (1 + dust)} fill="#C8A880" opacity={0.5} />)}</g>}
			{w.tag === 'hung' && <Tag30w x={beak[0] - 14} y={beak[1] + 46} rot={swing - 6} write={1} anchor={beak} s={1.25} id="stg" />}
			<Worker1965 s={w.s} x={S_X} y={S_Y} k={S_K} id="swf" part="front" rim="#FF9A50" lx={1} ly={0.15} />
			{w.tag === 'hand' && (() => { const h = sc(w.tagAt); return <Tag30w x={h[0]} y={h[1]} rot={-14} write={w.write} s={1.25} id="sth" />; })()}
			{w.pencil && (() => { const h = sc(w.s.hF); return <path d={tube([h[0] + 2, h[1] - 4], [h[0] + 26, h[1] + 8], 2.2, 1.4)} fill="#C8B070" />; })()}
		</g>
		<g transform={layerT(cam, 1.7)}>{pile(140, 1130, 640, 190, 23, '#0A0706', '#FF8A40', 1.6)}{pile(1840, 1140, 560, 170, 29, '#0A0706', '#FF8A40', 1.6)}
			<path d="M1500,1090 L1760,960" stroke="#0A0706" strokeWidth={34} strokeLinecap="round" /><path d="M1500,1074 L1760,944" stroke="#FF8A40" strokeWidth={2} strokeOpacity={0.5} /></g>
	</Shell>; };

/* ============================== router ============================== */
export const Act3: React.FC<{t: number}> = ({t}) => {
	if (t < card2('O').t) return <SN t={t} />;
	if (t < card2('P').t) return <SO t={t} />;
	if (t < card2('Q').t) return <SP t={t} />;
	if (t < card2('R').t) return <SQ t={t} />;
	if (t < card2('S').t) return <SR t={t} />;
	return <SS t={t} />; };
void [eio, eout, lerpP, tube, Glow, Haze, Plume, pile, Body, Sil, Grain, Rain, Rising, Lamp, toS, toL, stepFeet, track, pose, mixFK, Yard1965, PlatformScale1965, Worker1965, Tag30w, worker1965, beam1965, tagSwing1965, zunCam, beaks, layerT];
export type {YCam};
