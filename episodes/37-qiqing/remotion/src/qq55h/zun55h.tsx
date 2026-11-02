import React from 'react';
/* ep55 · 何尊 — the hero object as a parametric code-3D model, drawn as SVG through a look-at camera (the ep53 Cam / lookAt /
   proj convention: world x, y horizontal, z up; camera space [x right, y up, z depth]).
   Built from the reference photos (studio front, museum front ×2, museum low angle) and the official texts (The Paper / 央视新闻,
   China Daily / 人民日报), notes in /tmp/ep55h/ref_notes.txt:
   - 口圆体方: a round, widely flared mouth and neck (circle) that become a rounded square (superellipse) on the belly and foot,
     the four corners carrying the four flanges;
   - four tall openwork 扉棱 from the lip to the foot; their tops jut out past the lip as hooked "beaks";
   - neck: four 蕉叶 blades, each centred on a flange, each with a small 兽面; a 蚕纹 band under them;
   - belly: two big high-relief 饕餮 (noses = the front and back flanges): ram-like curled horns whose ends stand off the surface
     (卷角翘出器面), spherical eyes (球状凸目), brows, jaws and claws, on a 雷纹 ground;
   - high ring foot with a low-relief 兽面, then a plain stepped base band;
   - inside the bottom: the inscription, 12 columns, 122 characters (中 / 或 drawn as bronze-script forms).
   Units: cm. The model's base centre is at its origin; +x (model) is the "front" flange. */

export type V3 = [number, number, number];
export type P2 = [number, number];
type RGB = [number, number, number];

/* ============================== the real object (constants) ============================== */
export const ZUN = {
	H: 38.8,          // 通高 cm (brief / 博物院; 央视 · China Daily give 38.5)
	MOUTH: 28.6,      // 口径 cm (央视: 29)
	FOOT: 20,         // 圈足底径 20 × 20 cm (央视)
	KG: 14.6,         // 重 kg
	LINES: 12, CHARS: 122,   // the inscription inside the bottom
	FLOOR: 12.0,      // z of the inside bottom (内底)
};
/** the aged material. 'v21' = the v2.1 film (olive-brown bronze, faint verdigris); 'verdigris' = owner pick A (2026-11-02): the
    real 何尊's green-black bronze with teal / jade verdigris in the recesses and in broad patches, earthy deposits by patina, so
    the 尊 is the one cool object in the film's amber world. `fresh` (the casting) and the gold 中 / 或 are the same in both.
    'rim' = option 1B: the v2.1 colour exactly, plus a signature ice-cyan rim (#A8E6FF) traced inside the silhouette, the flanges
    and the horns, strongest away from the key; 'rimplus' = 1B+: the rim, and the 尊 made the brightest value in frame (a pool
    of key light on it, a lifted specular, a soft darkening ellipse just behind it). The rim and 1B+ are off in the fresh /
    molten casting and while 中 / 或 glow gold.
    'bright' = 1C (owner, after the 马首 of ep45): a saturated bright copper bronze (mid #D8743F, highlights #F2A66A, shadows
    #8A3E22, never black), a soft inner glow, lighter relief; the scene's light still models it but the body colour holds, so it
    is the most saturated and among the brightest things in every frame. Dirt only as a hint in the deepest recesses at high
    patina; cleanest and shiniest in the museum. The fresh gold casting and the gold 中 / 或 are unchanged. */
export const ZUN_LOOK: 'v21' | 'verdigris' | 'rim' | 'rimplus' | 'bright' = 'bright';
const D2R = Math.PI / 180;
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const sstep = (a: number, b: number, v: number) => { const u = cl((v - a) / (b - a)); return u * u * (3 - 2 * u); };
const f1 = (v: number) => v.toFixed(1);

/* ============================== camera (same maths as ep53 parts53) ============================== */
export type Cam = {p: V3; yaw: number; pitch: number; roll?: number; f: number; cx: number; cy: number};
export const lookAt = (p: V3, t: V3, f: number, cx = 960, cy = 540, roll = 0): Cam => { const d = [t[0] - p[0], t[1] - p[1], t[2] - p[2]], hz = Math.hypot(d[0], d[1]);
	return {p, yaw: Math.atan2(d[1], d[0]), pitch: Math.atan2(-d[2], hz), f, cx, cy, roll}; };
const basis = (c: Cam) => { const cy = Math.cos(c.yaw), sy = Math.sin(c.yaw), cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
	return {F: [cp * cy, cp * sy, -sp] as V3, R: [sy, -cy, 0] as V3, U: [sp * cy, sp * sy, cp] as V3}; };
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const addv = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const nrm = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export const toCam = (c: Cam, q: V3): V3 => { const {F, R, U} = basis(c), d = sub(q, c.p); return [dot(d, R), dot(d, U), dot(d, F)]; };
export const scr = (c: Cam, k: V3): P2 => { const r = c.roll ?? 0, x = c.f * k[0] / k[2], y = c.f * k[1] / k[2];
	return [c.cx + x * Math.cos(r) - y * Math.sin(r), c.cy - (x * Math.sin(r) + y * Math.cos(r))]; };
export const proj = (c: Cam, q: V3): [number, number, number] => { const k = toCam(c, q); const [x, y] = scr(c, k); return [x, y, k[2]]; };
/** NB: basis R here = camera right. (ep53's R = [-sy, cy, 0] with its own handedness; this one keeps +x screen-right for a z-up world.) */

/* ============================== colour + noise ============================== */
const hx = (c: string): RGB => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) as RGB;
const rgbS = (c: RGB) => `rgb(${Math.round(cl(c[0], 0, 255))},${Math.round(cl(c[1], 0, 255))},${Math.round(cl(c[2], 0, 255))})`;
const mixc = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const h2 = (i: number, j: number, s: number) => { const x = Math.sin(i * 127.1 + j * 311.7 + s * 74.7) * 43758.5453; return x - Math.floor(x); };
const vn = (x: number, y: number, s: number) => { const i = Math.floor(x), j = Math.floor(y), u = x - i, v = y - j, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v);
	return lerp(lerp(h2(i, j, s), h2(i + 1, j, s), a), lerp(h2(i, j + 1, s), h2(i + 1, j + 1, s), a), b); };
const fbm = (x: number, y: number, s: number) => vn(x, y, s) * 0.55 + vn(x * 2.1, y * 2.1, s + 3) * 0.3 + vn(x * 4.3, y * 4.3, s + 7) * 0.15;
export const rnd = (i: number, s = 0) => h2(i, i * 0.37 + 1.3, s);

/* ============================== the form ============================== */
/** outer profile, base → lip: [corner radius cm, z cm, superellipse n]. Read off the studio front photo (silhouette = the corner
    direction), scaled to H. Round (n = 2) from the neck up; a rounded square on the belly and foot. */
const OUT: [number, number, number][] = [
	[9.85, 0, 2.5], [10.1, 0.3, 2.5], [10.15, 0.9, 2.5], [10.15, 3.15, 2.5], [10.02, 3.42, 2.5], [9.72, 3.55, 2.55],
	[9.56, 3.8, 2.55], [9.4, 4.4, 2.55], [9.22, 5.3, 2.55], [9.07, 6.5, 2.55], [8.97, 8, 2.55], [8.92, 9.5, 2.55], [8.9, 10.35, 2.55],
	[8.74, 10.55, 2.6], [8.78, 10.85, 2.65], [9.02, 11.25, 2.7], [9.26, 11.9, 2.75], [9.4, 13, 2.75], [9.46, 14.5, 2.75], [9.48, 16, 2.75],
	[9.45, 18, 2.75], [9.37, 20, 2.75], [9.25, 21.5, 2.75], [9.16, 22.3, 2.75], [9.12, 22.5, 2.75],
	[8.93, 22.62, 2.65], [8.88, 23, 2.6], [8.9, 24, 2.45], [8.98, 25, 2.3], [9.1, 26, 2.15], [9.3, 27, 2.05], [9.6, 28, 2], [9.95, 29, 2],
	[10.35, 30, 2], [10.8, 31, 2], [11.3, 32, 2], [11.85, 33, 2], [12.45, 34, 2], [13.05, 35, 2], [13.6, 36, 2], [14.0, 37, 2],
	[14.25, 37.8, 2], [14.32, 38.3, 2], [14.28, 38.62, 2], [14.12, 38.8, 2]];
/** inner profile, lip → the inside bottom (内底) → the axis */
const INN: [number, number, number][] = [
	[13.9, 38.8, 2], [13.62, 38.6, 2], [13.5, 38.2, 2], [13.25, 37.4, 2], [12.85, 36.4, 2], [12.3, 35.2, 2], [11.7, 34, 2], [11.1, 33, 2],
	[10.6, 32, 2], [10.1, 31, 2], [9.65, 30, 2], [9.25, 29, 2], [8.9, 28, 2], [8.6, 27, 2.05], [8.4, 26, 2.15], [8.28, 25, 2.3], [8.22, 24, 2.45],
	[8.22, 23, 2.6], [8.3, 22, 2.7], [8.45, 20, 2.75], [8.55, 18, 2.75], [8.55, 16, 2.75], [8.45, 14.5, 2.75], [8.25, 13.4, 2.75],
	[7.9, 12.6, 2.75], [7.3, 12.15, 2.75], [6.5, ZUN.FLOOR, 2.75]];
const FLOOR_RING: [number, number, number][] = [[4.4, ZUN.FLOOR, 2.75], [2.2, ZUN.FLOOR, 2.75], [0.02, ZUN.FLOOR, 2.75]];
/** outer corner radius and n at height z */
export const Rz = (z: number): [number, number] => { const P = OUT; if (z <= P[0][1]) return [P[0][0], P[0][2]];
	for (let i = 0; i < P.length - 1; i++) if (z <= P[i + 1][1]) { const u = (z - P[i][1]) / (P[i + 1][1] - P[i][1] || 1); return [lerp(P[i][0], P[i + 1][0], u), lerp(P[i][2], P[i + 1][2], u)]; }
	const L = P[P.length - 1]; return [L[0], L[2]]; };
/** superellipse radial factor, 1 at the corners (θ = 0, 90, 180, 270°, where the flanges are) */
export const rho = (th: number, n: number) => { if (n <= 2.001) return 1; const p = th + Math.PI / 4, c = Math.abs(Math.cos(p)), s = Math.abs(Math.sin(p));
	return Math.pow(Math.pow(c, n) + Math.pow(s, n), -1 / n) / (Math.SQRT2 * Math.pow(2, -1 / n)); };
/** model-space point on a profile ring */
const ringPt = (th: number, r: number, z: number, n: number): V3 => { const k = r * rho(th, n); return [k * Math.cos(th), k * Math.sin(th), z]; };
/** outer surface point (model), lifted h cm along the outward normal */
const surfM = (th: number, z: number, h = 0): V3 => { const [r, n] = Rz(z), P = ringPt(th, r, z, n); if (!h) return P; const N = surfNM(th, z); return addv(P, N, h); };
const surfNM = (th: number, z: number): V3 => { const e = 0.004, ez = 0.05;
	const a = ringPt(th + e, ...Rz(z) as [number, number], z), b = ringPt(th - e, ...Rz(z) as [number, number], z);
	const [r1, n1] = Rz(z + ez), [r0, n0] = Rz(z - ez), c = ringPt(th, r1, z + ez, n1), d = ringPt(th, r0, z - ez, n0);
	return nrm(cross(sub(a, b), sub(c, d))); };

/* ============================== props ============================== */
export type ZunLight = {
	dir: V3;            // toward the key light (world)
	col: string;        // key colour
	k: number;          // key strength
	amb: number;        // ambient strength
	ambCol: string;     // ambient / fill colour
	spec: number;       // specular strength (shine)
	shin?: number;      // specular exponent
	rim?: {dir: V3; col: string; k: number};   // a back / rim light
	inside?: number;    // 0..1 how much light reaches the inside (a lamp shining into the mouth)
};
export type ZunPose = {x?: number; y?: number; z?: number; yaw?: number; s?: number};
export type ZunProps = {
	cam: Cam; pose?: ZunPose; light: ZunLight; id: string;
	patina?: number;     // 0 = cleaned museum piece … 1 = dull, crusted with soil and verdigris (1963 / 1965)
	molten?: number;     // 0..1 the fresh casting's orange-gold heat glow
	reveal?: number;     // 0..1 the inscription uncovered from rust and soil
	glow?: number;       // 0..1 中 / 或 lit gold
	fresh?: number;      // 0..1 newly cast golden bronze (西周), before any patina (default 0 = unchanged)
	inscription?: boolean;
	shadow?: boolean;    // a contact shadow on the ground plane z = 0
};

/* ============================== decoration (authored on the surface) ============================== */
type Mot = {kind: 'line' | 'fill'; pts: [number, number][]; w: number; h: number; zone: 'belly' | 'neck' | 'foot' | 'band'};
const spiral = (cx: number, cz: number, r: number, turns = 1.25, dir = 1, a0 = 0, n = 18): [number, number][] =>
	Array.from({length: n + 1}, (_, i) => { const u = i / n, a = a0 + dir * u * turns * 2 * Math.PI, rr = r * (1 - 0.72 * u); return [cx + rr * Math.cos(a), cz + rr * Math.sin(a)] as [number, number]; });
const ellipseP = (cx: number, cz: number, rx: number, rz: number, n = 20): [number, number][] => Array.from({length: n + 1}, (_, i) => [cx + rx * Math.cos((i / n) * 2 * Math.PI), cz + rz * Math.sin((i / n) * 2 * Math.PI)] as [number, number]);
/** belly 饕餮, right half of the face, in (s = arc cm from the nose flange, z cm) */
const BELLY_RN = 9.4;
const BELLY_MOTS: Mot[] = [
	{kind: 'line', zone: 'belly', w: 0.55, h: 0.48, pts: [[1.6, 14.55], [2.8, 15.5], [4.4, 16.05], [6.2, 15.95], [7.5, 15.2], [7.6, 14.2], [6.6, 13.35], [5.0, 13.1], [3.4, 13.45], [2.3, 14.0], [1.0, 14.15]]},   // 臣字目 socket
	{kind: 'line', zone: 'belly', w: 0.62, h: 0.5, pts: spiral(2.0, 12.4, 0.9, 1.15, 1, Math.PI * 0.9)},                              // nostril curl
	{kind: 'line', zone: 'belly', w: 0.6, h: 0.5, pts: [[0.8, 13.1], [2.6, 13.25], [3.9, 12.7], [4.1, 11.95]]},                        // upper lip / fang
	{kind: 'line', zone: 'belly', w: 0.85, h: 0.62, pts: [[6.4, 12.9], [8.2, 13.45], [9.7, 13.0], [10.25, 12.15], [9.75, 11.7], [9.0, 12.0], [9.1, 12.55]]},   // claw (利爪)
	{kind: 'line', zone: 'belly', w: 0.62, h: 0.5, pts: [[11.3, 21.5], [12.05, 19.9], [12.3, 17.4], [12.1, 15.0], [12.7, 12.8], [13.4, 12.15]]},  // body / ear
	{kind: 'line', zone: 'belly', w: 0.5, h: 0.45, pts: spiral(11.0, 15.25, 1.0, 1.2, -1, 0)},                                       // cheek curl
	{kind: 'line', zone: 'belly', w: 0.42, h: 0.38, pts: spiral(3.6, 19.0, 0.7, 0.8, 1, Math.PI)},
	{kind: 'line', zone: 'belly', w: 0.34, h: 0.3, pts: [[0.6, 11.75], [6, 11.7], [13.5, 11.7]]},                                       // lower border fillet
];
/** the horn: a ram's-horn coil. The root leaves the nose top, sweeps out along the top of the belly, then coils down the outer
    side and back in under itself (about one turn), tightening, the band narrowing and the coil lifting off the surface (卷角翘出器面).
    Photo-matched: coil ≈ s 4.6–11.2 cm, z 16.8–21.8 cm, centre ≈ (7.9, 19.3). */
const COIL = {s: 7.1, z: 19.05, rs: 3.4, rz: 2.85};
const HORN: {s: number; z: number; h: number; w: number}[] = [
	{s: 0.8, z: 19.9, h: 0.3, w: 1.6}, {s: 2.0, z: 20.95, h: 0.5, w: 1.9},
	...Array.from({length: 22}, (_, i) => { const u = i / 21, a = (112 - 350 * u) * Math.PI / 180, f = 1 - 0.68 * u;
		return {s: COIL.s + COIL.rs * f * Math.cos(a), z: COIL.z + COIL.rz * f * Math.sin(a), h: 0.75 + 1.9 * Math.pow(u, 1.1), w: 2.2 - 1.45 * u}; })];
/** the coil's eye: a small boss at the centre of the curl */
const VOLUTE = {s: COIL.s - 0.2, z: COIL.z + 0.15, r: 0.62, lift: 2.0};
const EYE = {s: 5.25, z: 14.7, r: 1.18, lift: 0.5};
/** neck: 蕉叶 blade + the small 兽面 inside, in (deg from the flange, z) */
const BLADE_MOTS: Mot[] = [
	{kind: 'line', zone: 'neck', w: 0.68, h: 0.5, pts: [[0, 35.7], [5, 35.2], [12, 33.9], [19, 31.6], [25, 28.9], [29.5, 26.4]]},  // blade edge
	{kind: 'line', zone: 'neck', w: 0.3, h: 0.3, pts: [[2.5, 34.6], [9, 33.5], [16, 31.4], [21.5, 28.9], [25, 26.5]]},
	{kind: 'line', zone: 'neck', w: 0.42, h: 0.4, pts: ellipseP(13.5, 30.0, 4.2, 0.62, 18)},                                     // eye
	{kind: 'line', zone: 'neck', w: 0.38, h: 0.36, pts: spiral(11.5, 32.1, 0.75, 1.15, -1, Math.PI * 0.2)},
	{kind: 'line', zone: 'neck', w: 0.36, h: 0.34, pts: spiral(20, 30.4, 0.62, 1.1, 1, Math.PI)},
	{kind: 'line', zone: 'neck', w: 0.38, h: 0.36, pts: [[2.5, 28.2], [8, 28.4], [12, 27.7], [14, 27.0]]},
	{kind: 'line', zone: 'neck', w: 0.34, h: 0.32, pts: spiral(9.5, 27.6, 0.55, 1.05, 1, 0)},
	{kind: 'line', zone: 'neck', w: 0.34, h: 0.32, pts: [[3.5, 33.6], [6, 34.0], [8.5, 33.3]]},
];
/** 蚕纹 band: a silkworm (head with two eyes, a sinuous body) in (s cm, z) */
const SILK_RN = 8.95;
const SILK_MOTS: Mot[] = [
	{kind: 'line', zone: 'band', w: 0.5, h: 0.38, pts: [[0.1, 24.35], [1.2, 24.0], [2.5, 24.45], [3.6, 24.95], [4.5, 24.55]]},
	{kind: 'fill', zone: 'band', w: 0, h: 0.4, pts: ellipseP(-0.35, 24.85, 0.25, 0.22, 10)},
	{kind: 'fill', zone: 'band', w: 0, h: 0.4, pts: ellipseP(0.35, 24.85, 0.25, 0.22, 10)},
];
/** ring foot: the low-relief 兽面 (right half) */
const FOOT_RN = 9.0;
const FOOT_MOTS: Mot[] = [
	{kind: 'fill', zone: 'foot', w: 0, h: 0.42, pts: ellipseP(3.4, 6.7, 0.62, 0.42, 14)},
	{kind: 'line', zone: 'foot', w: 0.42, h: 0.34, pts: ellipseP(3.4, 6.7, 1.3, 0.85, 18)},
	{kind: 'line', zone: 'foot', w: 0.45, h: 0.34, pts: spiral(2.2, 8.85, 0.85, 0.8, 1, Math.PI * 1.1)},
	{kind: 'line', zone: 'foot', w: 0.42, h: 0.32, pts: spiral(5.4, 9.0, 0.72, 0.8, -1, 0)},
	{kind: 'line', zone: 'foot', w: 0.42, h: 0.32, pts: spiral(1.5, 4.95, 0.6, 0.75, -1, 0.3)},
	{kind: 'line', zone: 'foot', w: 0.42, h: 0.32, pts: spiral(5.0, 5.1, 0.7, 0.75, 1, Math.PI)},
	{kind: 'line', zone: 'foot', w: 0.48, h: 0.34, pts: [[6.4, 6.1], [8.6, 6.5], [10.6, 7.3], [12.4, 8.7]]},
	{kind: 'line', zone: 'foot', w: 0.4, h: 0.3, pts: [[6.6, 8.2], [8.3, 8.75], [9.7, 9.7]]},
	{kind: 'line', zone: 'foot', w: 0.3, h: 0.28, pts: [[0.6, 10.05], [7, 10.05], [14, 10.05]]},
];
/** 雷纹: a square spiral in a cell (local cm) */
const LEI: [number, number][] = [[-0.34, -0.34], [0.34, -0.34], [0.34, 0.34], [-0.2, 0.34], [-0.2, -0.2], [0.2, -0.2], [0.2, 0.2], [-0.06, 0.2], [-0.06, -0.06]];

/* ============================== flanges (扉棱) ============================== */
type Plate = {out: P2[]; holes: P2[][]; th: number; key: string; inc?: P2[][]};
/** an openwork column from z0 up to z1: bold F-hooks (a bar out, its end turned down) with a round C-notch under each, and
    through-holes near the root; ro(z) = outer edge radius (r, z in cm), teeth = the z of each hook's top, L = hook length */
const column = (z0: number, z1: number, ro: (z: number) => number, teeth: number[], L: number[], holes: boolean): {out: P2[]; holes: P2[][]; inc: P2[][]} => {
	const out: P2[] = [], H: P2[][] = [], I: P2[][] = [];
	out.push([Rz(z1)[0] - 0.35, z1], [ro(z1), z1]);
	const order = teeth.map((t, i) => ({t, L: L[i]})).sort((a, b) => b.t - a.t);
	for (const {t, L: Lk} of order) { const r = ro(t);
		out.push([ro(t + 0.001), t + 0.05], [r + Lk - 0.15, t + 0.12], [r + Lk + 0.18, t - 0.08], [r + Lk + 0.32, t - 0.55], [r + Lk + 0.26, t - 1.05], [r + Lk + 0.02, t - 1.4],
			[r + Lk - 0.32, t - 1.22], [r + Lk - 0.36, t - 0.86], [r + 0.15, t - 0.78],
			[r - 0.55, t - 0.82], [r - 0.92, t - 1.12], [r - 1.0, t - 1.55], [r - 0.82, t - 1.95], [r - 0.4, t - 2.12], [ro(t - 2.15), t - 2.15]);
		/* incised: a line along the bar and down its hook, and a C-scroll in the column under the notch */
		I.push([[r - 0.25, t - 0.38], [r + Lk - 0.2, t - 0.36], [r + Lk - 0.02, t - 0.62], [r + Lk - 0.02, t - 1.0]]);
		{ const cz = t - 2.75, cr = (Rz(cz)[0] + ro(cz)) / 2, rr = Math.min(0.42, (ro(cz) - Rz(cz)[0]) * 0.22);
			if (cz > z0 + 0.5 && rr > 0.18) I.push(Array.from({length: 12}, (_, i) => { const aa = (0.15 + 1.55 * i / 11) * Math.PI; return [cr + rr * Math.cos(aa) * (1 - 0.35 * i / 11), cz + rr * Math.sin(aa) * (1 - 0.35 * i / 11)] as P2; })); }
		if (holes) { const zt = t - 2.55, zb = t - 3.55, a = Rz(zt)[0] + 0.4, b = Math.min(ro(zt) - 0.6, a + 1.15);
			if (b - a > 0.45 && zb > z0 + 0.25) H.push([[a + 0.2, zb], [b - 0.15, zb], [b, zb + 0.25], [b, zt - 0.3], [b - 0.3, zt], [a, zt], [a, zb + 0.2]]); } }
	out.push([ro(z0), z0]);
	for (let k = 0; k <= 12; k++) { const zz = lerp(z0, z1, k / 12); out.push([Rz(zz)[0] - 0.35, zz]); }
	return {out, holes: H, inc: I}; };
const PLATES: Plate[] = (() => {
	const P: Plate[] = [];
	/* the beak at the lip: a heavy bird-head hook, top flush with the lip, reaching ~4.4 cm past it, the tip hanging to ~5 cm under the lip
	   (photo-matched: tip at r ≈ 18.6, z ≈ 33.8) */
	P.push({key: 'beak', th: 1.3, inc: [[[14.6, 38.15], [16.0, 38.2], [17.4, 37.95], [18.25, 37.35], [18.4, 36.3], [18.2, 35.0]], [[14.4, 36.4], [15.3, 36.45], [15.9, 36.85]]], holes: [[[15.5, 37.25], [16.25, 37.35], [16.3, 37.9], [15.55, 37.9]]], out: [
		[13.35, 34.9], [13.8, 36.0], [14.05, 37.0], [14.2, 38.0], [14.3, 38.6], [15.2, 38.62], [15.6, 38.98], [16.05, 38.64], [17.5, 38.35], [18.45, 37.75], [18.85, 36.6],
		[18.8, 35.3], [18.55, 34.3], [18.2, 33.75], [17.75, 33.95], [17.75, 35.1], [17.45, 35.95], [16.7, 36.3], [15.8, 36.05], [14.9, 35.6], [14.0, 35.0], [13.4, 34.55]]});
	/* neck: column edge 11.0 → 12.3 cm, three hooks (tips ≈ 12.6–13.0 cm, as the photo) */
	const roN = (z: number) => Math.max(Rz(z)[0] + 0.9, lerp(11.0, 12.3, cl((z - 23.4) / (33.5 - 23.4))));
	const n = column(23.3, 34.4, roN, [32.8, 29.1, 25.4], [0.85, 0.9, 0.9], true); P.push({key: 'neck', th: 1.05, ...n});
	/* belly: column ~1.75 cm off the body, hooks reaching ~3.1 cm (photo: 12.2–12.6 cm from the axis) */
	const roB = (z: number) => Rz(z)[0] + 1.75;
	const b = column(11.1, 22.85, roB, [22.8, 19.6, 15.8, 12.7], [1.25, 1.2, 1.2, 0.7], true); P.push({key: 'belly', th: 1.05, ...b});
	/* foot: ~1.2 cm off, a small hook at the top and the long bottom hook (photo: ~12.8 cm) above the base band */
	const roF = (z: number) => Rz(z)[0] + 1.2;
	const f = column(3.85, 10.95, roF, [10.9, 6.9], [0.7, 2.0], false); P.push({key: 'foot', th: 1.0, ...f});
	return P; })();

/* ============================== the inscription (内底铭文) ============================== */
type Stroke = {pts: [number, number][]; w: number; fill?: boolean};
/** bronze-script 中: a staff through an oval, two streamers at the top and two at the bottom (unit cell, y down) */
const ZHONG: Stroke[] = [
	{w: 0.085, pts: [[0, -0.5], [0, 0.5]]},
	{w: 0.08, pts: [[-0.21, 0.0], [-0.2, -0.11], [0, -0.14], [0.2, -0.11], [0.21, 0.0], [0.2, 0.11], [0, 0.14], [-0.2, 0.11], [-0.21, 0.0]]},
	{w: 0.065, pts: [[0, -0.47], [0.11, -0.46], [0.18, -0.41], [0.29, -0.4]]}, {w: 0.065, pts: [[0, -0.36], [0.11, -0.35], [0.18, -0.3], [0.29, -0.29]]},
	{w: 0.065, pts: [[0, 0.3], [0.11, 0.31], [0.18, 0.36], [0.29, 0.37]]}, {w: 0.065, pts: [[0, 0.41], [0.11, 0.42], [0.18, 0.47], [0.29, 0.48]]},
];
/** bronze-script 或 (= 國): 口 with a ground line under it, and 戈 — the shaft, the blade crossing it, the tassel and the butt */
const HUO: Stroke[] = [
	{w: 0.075, pts: [[-0.36, -0.12], [-0.08, -0.13], [-0.07, 0.12], [-0.35, 0.13], [-0.36, -0.12]]},
	{w: 0.07, pts: [[-0.42, 0.27], [-0.02, 0.25]]},
	{w: 0.085, pts: [[0.12, -0.46], [0.14, -0.1], [0.18, 0.22], [0.27, 0.46]]},
	{w: 0.08, pts: [[-0.4, -0.3], [0.0, -0.31], [0.4, -0.35]]},
	{w: 0.06, pts: [[0.27, -0.46], [0.36, -0.42], [0.44, -0.47]]},
	{w: 0.065, pts: [[0.27, 0.46], [0.38, 0.37]]},
];
/** 宅: the roof 宀 over 乇 */
const ZHAI: Stroke[] = [
	{w: 0.075, pts: [[-0.42, -0.02], [-0.42, -0.24], [0, -0.43], [0.42, -0.24], [0.42, -0.02]]}, {w: 0.06, pts: [[0, -0.43], [0, -0.5]]},
	{w: 0.08, pts: [[0.03, -0.2], [0, 0.12], [0.02, 0.34], [0.22, 0.42]]}, {w: 0.07, pts: [[-0.2, 0.03], [0.22, -0.04]]},
];
/** 兹: two silk skeins 幺 side by side */
const ZI: Stroke[] = [-0.2, 0.2].flatMap((x) => [
	{w: 0.07, pts: [[x - 0.03, -0.46], [x, -0.36]]},
	{w: 0.07, pts: Array.from({length: 13}, (_, i) => [x + 0.11 * Math.sin((i / 12) * 2 * Math.PI), -0.22 - 0.12 * Math.cos((i / 12) * 2 * Math.PI)] as [number, number])},
	{w: 0.07, pts: Array.from({length: 13}, (_, i) => [x + 0.13 * Math.sin((i / 12) * 2 * Math.PI), 0.1 - 0.14 * Math.cos((i / 12) * 2 * Math.PI)] as [number, number])},
	{w: 0.07, pts: [[x, 0.24], [x - 0.04, 0.46]]}]);
/** a plausible bronze-script glyph that is not a readable character: 3–5 curved, thick strokes on a seeded layout, sometimes a 肥笔 blob */
export const pseudoGlyph = (seed: number): Stroke[] => {
	const r = (i: number) => rnd(seed * 13 + i, 5), S: Stroke[] = [], ww = () => 0.085 + r(S.length * 7 + 3) * 0.03;
	const curve = (a: [number, number], b: [number, number], bend: number): [number, number][] => { const mx = (a[0] + b[0]) / 2 - (b[1] - a[1]) * bend, my = (a[1] + b[1]) / 2 + (b[0] - a[0]) * bend;
		return Array.from({length: 7}, (_, i) => { const u = i / 6, m = 1 - u; return [m * m * a[0] + 2 * m * u * mx + u * u * b[0], m * m * a[1] + 2 * m * u * my + u * u * b[1]] as [number, number]; }); };
	/* v2.1: component vocabulary taken from 金文 radicals (口 十 宀 貝 糸 人 木 目 戈 + 肥笔), never Latin-letter shapes
	   (the v2 review read E / A / Y / ε in the old set) */
	const comp = (x0: number, y0: number, w: number, h: number, k: number) => { const t = Math.floor(r(k) * 10), cx = x0 + w / 2, cy = y0 + h / 2, b = (r(k + 2) - 0.5) * 0.4;
		const P = (fx: number, fy: number): [number, number] => [x0 + w * fx, y0 + h * fy];
		if (t === 0) S.push({w: ww(), pts: [P(0.2, 0.22), P(0.5, 0.16), P(0.8, 0.22), P(0.82, 0.78), P(0.5, 0.84), P(0.18, 0.78), P(0.2, 0.22)]});   // 口
		else if (t === 1) S.push({w: ww(), pts: curve(P(0.52, 0.04), P(0.46, 0.96), b)}, {w: ww(), pts: curve(P(0.14, 0.42), P(0.86, 0.38), -b * 0.4)}, {w: 0.13, fill: true, pts: [P(0.42, 0.36), P(0.56, 0.34), P(0.58, 0.46), P(0.44, 0.48)]});   // 十 with a 肥笔 knot
		else if (t === 2) S.push({w: ww(), pts: [P(0.1, 0.52), P(0.1, 0.24), P(0.5, 0.06), P(0.9, 0.24), P(0.9, 0.52)]}, {w: ww(), pts: [P(0.5, 0.06), P(0.5, -0.02)]}, {w: ww(), pts: curve(P(0.3, 0.6), P(0.72, 0.92), 0.2)});   // 宀 over a stroke
		else if (t === 3) S.push({w: ww(), pts: [P(0.3, 0.1), P(0.7, 0.1), P(0.76, 0.5), P(0.7, 0.76), P(0.3, 0.76), P(0.24, 0.5), P(0.3, 0.1)]}, {w: ww(), pts: [P(0.3, 0.42), P(0.7, 0.42)]}, {w: ww(), pts: curve(P(0.36, 0.78), P(0.18, 0.98), 0.1)}, {w: ww(), pts: curve(P(0.64, 0.78), P(0.82, 0.98), -0.1)});   // 貝
		else if (t === 4) { for (const yy of [0.3, 0.64]) S.push({w: ww(), pts: Array.from({length: 13}, (_, i) => [cx + w * 0.17 * Math.sin((i / 12) * 2 * Math.PI) * (1 + 0.15 * Math.cos(i)), y0 + h * (yy - 0.15 * Math.cos((i / 12) * 2 * Math.PI))] as [number, number])});
			S.push({w: ww(), pts: [P(0.5, 0.8), P(0.47, 0.98)]}, {w: ww(), pts: curve(P(0.22, 0.98), P(0.78, 0.98), 0.12)}); }   // 糸
		else if (t === 5) S.push({w: 0.13, fill: true, pts: [P(0.34, 0.28), P(0.58, 0.24), P(0.68, 0.5), P(0.52, 0.74), P(0.36, 0.58)]}, {w: ww(), pts: curve(P(0.1, 0.9), P(0.9, 0.86), 0.12)}, {w: ww(), pts: curve(P(0.62, 0.08), P(0.9, 0.3), -0.2)});   // 肥笔 dot over a ground
		else if (t === 6) S.push({w: ww(), pts: curve(P(0.62, 0.04), P(0.22, 0.96), 0.22)}, {w: ww(), pts: curve(P(0.48, 0.42), P(0.86, 0.9), -0.16)}, {w: ww(), pts: curve(P(0.4, 0.3), P(0.74, 0.22), 0.3)});   // 人 bending, with an arm
		else if (t === 7) S.push({w: ww(), pts: curve(P(0.5, 0.02), P(0.5, 0.98), b * 0.3)}, {w: ww(), pts: curve(P(0.5, 0.36), P(0.14, 0.12), 0.25)}, {w: ww(), pts: curve(P(0.5, 0.36), P(0.86, 0.12), -0.25)}, {w: ww(), pts: curve(P(0.5, 0.7), P(0.16, 0.92), -0.2)}, {w: ww(), pts: curve(P(0.5, 0.7), P(0.84, 0.92), 0.2)});   // 木
		else if (t === 8) S.push({w: ww(), pts: [P(0.08, 0.5), P(0.3, 0.3), P(0.62, 0.28), P(0.92, 0.5), P(0.62, 0.72), P(0.3, 0.7), P(0.08, 0.5)]}, {w: 0.14, fill: true, pts: Array.from({length: 9}, (_, i) => [cx + w * 0.11 * Math.cos(i / 8 * 2 * Math.PI), cy + h * 0.13 * Math.sin(i / 8 * 2 * Math.PI)] as [number, number])});   // 目
		else S.push({w: ww(), pts: curve(P(0.2, 0.06), P(0.74, 0.96), 0.08)}, {w: ww(), pts: [P(0.08, 0.34), P(0.52, 0.3), P(0.9, 0.18)]}, {w: ww(), pts: curve(P(0.74, 0.96), P(0.92, 0.82), 0.3)}, {w: 0.12, fill: true, pts: [P(0.08, 0.28), P(0.2, 0.26), P(0.2, 0.4), P(0.08, 0.4)]});   // 戈
	};
	const lay = Math.floor(r(0) * 4);
	if (lay === 0) { comp(-0.46, -0.48, 0.92, 0.96, 10); comp(-0.3, -0.22, 0.6, 0.52, 20); }
	else if (lay === 1) { comp(-0.5, -0.48, 0.48, 0.96, 10); comp(0.02, -0.48, 0.48, 0.5, 20); comp(0.02, 0.0, 0.48, 0.48, 40); }
	else if (lay === 2) { comp(-0.44, -0.5, 0.88, 0.48, 10); comp(-0.44, 0.0, 0.88, 0.5, 20); }
	else { comp(-0.5, -0.48, 0.48, 0.48, 10); comp(0.02, -0.48, 0.48, 0.48, 20); comp(-0.42, 0.02, 0.84, 0.48, 30); }
	return S; };
/** the inscription layout: 12 columns read right → left, 122 characters; 宅兹中或 placed in column 7 (position approximate) */
const COL_LEN = [11, 11, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];
const KEY_COL = 6, KEY_ROW = 3;   // 宅 兹 中 或 at rows 3–6 of column 7 (from the right)
const ILLEGIBLE = new Set(['2-8', '9-4', '11-6']);
type Gl = {c: number; k: number; u: number; v: number; s: number; strokes: Stroke[]; key: '' | 'zhong' | 'huo' | 'zhai' | 'zi'; lost: boolean};
const INSCR: Gl[] = (() => { const out: Gl[] = [], colW = 1.12, rowH = 1.16;
	COL_LEN.forEach((n, c) => { for (let k = 0; k < n; k++) {
		const u = (5.5 - c) * colW, v = (k - (n - 1) / 2) * rowH * (n === 11 ? 0.94 : 1);
		let key: Gl['key'] = '', strokes: Stroke[];
		if (c === KEY_COL && k === KEY_ROW) { key = 'zhai'; strokes = ZHAI; } else if (c === KEY_COL && k === KEY_ROW + 1) { key = 'zi'; strokes = ZI; }
		else if (c === KEY_COL && k === KEY_ROW + 2) { key = 'zhong'; strokes = ZHONG; } else if (c === KEY_COL && k === KEY_ROW + 3) { key = 'huo'; strokes = HUO; }
		else strokes = pseudoGlyph(c * 31 + k * 7 + 3);
		out.push({c, k, u, v: v + (rnd(c * 17 + k, 9) - 0.5) * 0.08, s: key === 'zhong' || key === 'huo' ? 1.1 : 0.98 + (rnd(c * 5 + k, 4) - 0.5) * 0.14, strokes, key, lost: ILLEGIBLE.has(`${c}-${k}`)}); } });
	return out; })();
/** the floor frame: columns run along d_top (toward a flat face, between the front and the left flange) */
const TOP_A = Math.PI / 4;

/* ============================== the component ============================== */
type Item = {z: number; el: React.ReactNode};
export const Zun: React.FC<ZunProps> = (p) => {
	const {cam, light: Lt, id} = p, pose = p.pose ?? {}, patina = p.patina ?? 0.2, molten = p.molten ?? 0, reveal = p.reveal ?? 1, glow = p.glow ?? 0, fresh = p.fresh ?? 0;
	const ps = pose.s ?? 1, yaw = pose.yaw ?? 0, cy = Math.cos(yaw), sy = Math.sin(yaw), P0: V3 = [pose.x ?? 0, pose.y ?? 0, pose.z ?? 0];
	const W = (m: V3): V3 => [P0[0] + ps * (m[0] * cy - m[1] * sy), P0[1] + ps * (m[0] * sy + m[1] * cy), P0[2] + ps * m[2]];
	const WN = (n: V3): V3 => [n[0] * cy - n[1] * sy, n[0] * sy + n[1] * cy, n[2]];
	const L = nrm(Lt.dir), keyC = hx(Lt.col), ambC = hx(Lt.ambCol), shin = Lt.shin ?? 26, rimL = Lt.rim ? {d: nrm(Lt.rim.dir), c: hx(Lt.rim.col), k: Lt.rim.k} : null;
	const items: Item[] = [];
	const P = (q: V3) => proj(cam, q);
	const depth = (q: V3) => toCam(cam, q)[2];
	/* bronze: cleaned museum surface (dark olive-brown metal), verdigris, soil */
	const LOOK: string = ZUN_LOOK, VG = LOOK === 'verdigris', BRT = LOOK === 'bright';
	const bAmt = BRT ? (1 - fresh) * (1 - cl(molten * 2)) : 0;
	const RIM = LOOK === 'rim' || LOOK === 'rimplus', PLUS = LOOK === 'rimplus';
	const rimAmt = RIM ? (1 - cl(fresh * 3)) * (1 - cl(molten * 3)) * (1 - sstep(0.6, 1, glow)) : 0, plus = PLUS ? rimAmt : 0;
	const scrC = P(W([0, 0, 19.4])), pxs = cam.f * ps / Math.max(1, depth(W([0, 0, 19.4])));
	const Ls = (() => { const b = basis(cam), x = dot(nrm(Lt.dir), b.R), y = dot(nrm(Lt.dir), b.U), l = Math.hypot(x, y) || 1; return {x: x / l, y: y / l, k: Math.min(1, l / 0.45)}; })();
	const poolC: [number, number] = [scrC[0] + Ls.x * 8 * pxs, scrC[1] - Ls.y * 8 * pxs - 5 * pxs], poolR = 17 * pxs;
	const sig: React.ReactNode[] = [];
	const BR: RGB = BRT ? [150, 70, 38] : VG ? [26, 42, 36] : [54, 55, 46], BR_HI: RGB = BRT ? [242, 166, 106] : VG ? [94, 112, 92] : [140, 128, 100], VERD: RGB = [62, 92, 76], VERD2: RGB = [100, 136, 110], SOIL: RGB = [100, 82, 58];
	/* verdigris look: the patina keeps its own colour under a tinted key (a partial white balance on the diffuse light only;
	   the highlights and the rim stay the scene's colour), fading out toward the gold casting and the molten state */
	const wb = VG ? 0.62 * (1 - fresh) * (1 - molten) : 0;
	const neut = (c: RGB, k: number): RGB => { const y = 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]; return mixc(c, [y, y, y], k); };
	const keyD = neut(keyC, wb), ambD = neut(ambC, wb);
	const shade = (n: V3, q: V3, alb: RGB, specK = 1, ao = 1, rimOn = true): RGB => {
		const l = Math.max(0, dot(n, L)), v = nrm(sub(cam.p, q)), hh = nrm(addv(L, v)), sp = Math.pow(Math.max(0, dot(n, hh)), shin) * Lt.spec * specK * (1 - 0.75 * patina) * (1 + 0.8 * fresh);
		const c: RGB = [0, 1, 2].map((i) => alb[i] / 255 * (ambD[i] * Lt.amb + keyD[i] * Lt.k * l) * ao + keyC[i] * sp * ao * 0.9) as RGB;
		if (bAmt > 0) {   /* copper: from its own saturated shadow to its lit tone by how lit the facet is, a soft inner glow, a warm sheen */
			const I = cl((Lt.amb * 0.55 + Lt.k * l) / (Lt.amb * 0.55 + Lt.k * 0.85)), t = cl(0.16 + 0.84 * Math.pow(I, 0.75)) * (0.55 + 0.45 * ao);
			const s2 = P(q), dd = Math.hypot(s2[0] - poolC[0], s2[1] - poolC[1]) / (poolR * 1.15), glowK = 1 + 0.2 * Math.exp(-dd * dd * 1.1);
			const shd: RGB = [alb[0] * 0.62, alb[1] * 0.5, alb[2] * 0.48];
			const cb = mixc(shd, alb, t), spC = mixc(keyC, [242, 166, 106], 0.45);
			for (let i = 0; i < 3; i++) cb[i] = cb[i] * glowK + keyC[i] * Lt.k * l * 0.05 + spC[i] * sp * ao * 0.75;
			for (let i = 0; i < 3; i++) c[i] = lerp(c[i], cb[i], bAmt); }
		if (plus > 0) { const s2 = P(q), dd = Math.hypot(s2[0] - poolC[0], s2[1] - poolC[1]) / poolR, pool = Math.exp(-dd * dd * 1.2), g2 = 1 + plus * (0.22 + 0.5 * pool);
			for (let i = 0; i < 3; i++) c[i] = c[i] * g2 + keyC[i] * sp * ao * 0.55 * plus; }
		if (rimL && rimOn) { const rr = Math.max(0, dot(n, rimL.d)) * Math.pow(1 - Math.abs(dot(n, v)), 1.6) * rimL.k; for (let i = 0; i < 3; i++) c[i] += rimL.c[i] * rr; }
		if (molten > 0) { const lum = (c[0] + c[1] + c[2]) / 3 / 255, g = 0.5 + 0.5 * Math.max(0, dot(n, v)), k = cl(0.15 + 1.6 * lum) * (0.65 + 0.35 * g);
			const e = mixc([150, 38, 8], [255, 206, 112], k); for (let i = 0; i < 3; i++) c[i] = lerp(c[i], e[i], molten); }
		return c; };
	/* the material at a surface point (model θ, z): verdigris + soil mottling grow with patina */
	const albedo = (th: number, z: number, zone: number, raised = false): RGB => {
		const s = th * 9.4, g = fbm(s * 0.2 + 3, z * 0.2, 11), g2 = fbm(s * 0.35 + 7, z * 0.35, 23), d = fbm(s * 0.18 - 4, z * 0.22, 37);
		let a = mixc(BR, BR_HI, raised ? 0.55 : 0.12 * zone);
		if (!raised && zone > 0) a = mixc(a, [52, 46, 36], 0.35);   // the sunk 雷纹 ground is darker
		if (fresh > 0) { a = mixc(a, raised ? [226, 182, 104] : zone > 0 ? [128, 92, 48] : [178, 132, 70], fresh); if (fresh >= 1 || !(VG || BRT)) return a; }
		if (BRT) {   /* bright copper: lighter relief, deeper sunk ground, a gentle tone drift; a dirt hint in the deepest recesses only */
			let b: RGB = raised ? [240, 152, 94] : zone > 0 ? [190, 94, 52] : [216, 116, 63];
			b = mixc(b, raised ? [250, 176, 118] : [226, 130, 76], cl((g2 - 0.35) * 0.9) * 0.6);
			if (!raised && zone > 0) b = mixc(b, [104, 56, 34], 0.3 * patina * sstep(0.45, 0.8, d));
			if (!raised) b = mixc(b, [222, 122, 66], 0.25 * (1 - patina));
			return fresh > 0 ? mixc(a, b, 1 - fresh) : b; }
		if (VG) {   /* green-black metal; verdigris deep teal → teal, jade blooms; the sunk ground nearly all green; broad patches over
			   everything, more with age; tan earth and a few cuprite-red flecks by patina, heavier toward the foot */
			const sp = vn(s * 1.7 + 5, z * 1.7, 51), rec = !raised && zone > 0 ? 1 : 0, f0 = 1 - fresh;
			const patch = sstep(0.66 - 0.28 * patina, 0.82 - 0.22 * patina, g), mott = 0.65 + 0.7 * vn(s * 0.9 + 2, z * 0.9, 71);
			const cov = cl(rec * (0.55 + 0.38 * patina) + patch * (raised ? 0.18 + 0.46 * patina : 0.62 + 0.24 * patina) + (raised ? 0.04 : 0.1 + 0.08 * patina));
			const vcol = mixc(mixc([24, 60, 52], [46, 118, 102], sstep(0.3, 0.72, g2) * (0.55 + 0.45 * patina)), [118, 176, 148], sstep(0.72, 0.9, sp) * (0.35 + 0.4 * patina));
			let b = mixc(a, vcol, cl(cov * (0.66 + 0.27 * patina) * mott));
			const soil = sstep(0.5, 0.84, d) * patina * patina * (0.5 + 0.5 * sstep(16, 3, z));
			b = mixc(b, [122, 100, 68], soil * 0.78);
			b = mixc(b, [124, 64, 42], sstep(0.86, 0.95, vn(s * 2.3 + 11, z * 2.3, 61)) * patina * 0.45);
			return fresh > 0 ? mixc(a, b, f0) : b; }
		const verd = cl((g - 0.3 + 0.22 * patina) * 1.05) * (raised ? 0.25 : 0.5) * (0.5 + 0.5 * patina);
		a = mixc(a, mixc(VERD, VERD2, sstep(0.5, 0.8, g2)), verd);
		const soil = sstep(0.42, 0.8, d) * patina * patina * 0.85; a = mixc(a, SOIL, soil);
		return a; };
	const zoneOf = (z: number) => (z > 23.1 && z < 35.8) || (z > 11.6 && z < 22.4) || (z > 4.0 && z < 10.2) ? 1 : 0;

	/* ---------- the body: one closed profile (outside, lip, inside, floor) swept round ---------- */
	const prof0 = [...OUT, ...INN, ...FLOOR_RING], prof: [number, number, number][] = [];
	prof0.forEach((q, i) => { prof.push(q); const nx = prof0[i + 1]; if (!nx) return; const L = Math.hypot(nx[0] - q[0], nx[1] - q[1]), k = Math.min(3, Math.floor(L / 0.55));
		for (let j = 1; j <= k; j++) { const u = j / (k + 1); prof.push([lerp(q[0], nx[0], u), lerp(q[1], nx[1], u), lerp(q[2], nx[2], u)]); } });
	const NT = 128, outN = prof.findIndex((q, i) => i > 0 && q[1] === 38.8 && q[0] < 14.0) ;
	const ring: V3[][] = prof.map(([r, z, n]) => Array.from({length: NT + 1}, (_, j) => W(ringPt((j / NT) * 2 * Math.PI, r, z, n))));
	const camD = (q: V3) => sub(cam.p, q);
	const floorIdx = prof.findIndex((q) => q[0] === INN[INN.length - 1][0] && q[1] === ZUN.FLOOR);
	for (let i = 0; i < prof.length - 1; i++) { const inner = i >= outN - 1, floor = i >= floorIdx, zMid = (prof[i][1] + prof[i + 1][1]) / 2;
		for (let j = 0; j < NT; j++) {
			const a = ring[i][j], b = ring[i][j + 1], c = ring[i + 1][j + 1], d = ring[i + 1][j];
			const n = nrm(cross(sub(c, a), sub(d, b))), m: V3 = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
			if (dot(n, camD(m)) <= 0) continue;
			const pa = P(a), pb = P(b), pc = P(c), pd = P(d); if (pa[2] < 1 || pb[2] < 1 || pc[2] < 1 || pd[2] < 1) continue;
			const th = ((j + 0.5) / NT) * 2 * Math.PI;
			let alb = albedo(th, zMid, inner ? 0 : zoneOf(zMid));
			let ao = 1;
			if (inner) { const dz = cl((zMid - ZUN.FLOOR) / (38.8 - ZUN.FLOOR)); ao = lerp(0.3 + 0.55 * (Lt.inside ?? 0), 1, Math.pow(dz, 0.6)); alb = mixc(alb, BRT ? [124, 56, 30] : VG ? [30, 48, 42] : [66, 64, 52], BRT ? 0.5 : VG ? 0.45 : 0.6); }
			if (floor) continue;   // the floor is drawn as one item with the inscription
			const col = rgbS(shade(n, m, alb, inner ? 0.6 : 1, ao, !inner));
			items.push({z: m ? depth(m) : 0, el: <path key={`q${i}_${j}`} d={`M${f1(pa[0])},${f1(pa[1])}L${f1(pb[0])},${f1(pb[1])}L${f1(pc[0])},${f1(pc[1])}L${f1(pd[0])},${f1(pd[1])}Z`} fill={col} stroke={col} strokeWidth={0.7} strokeLinejoin="round" />}); } }

	/* ---------- the floor + the inscription (drawn first: everything that overlaps it is in front) ---------- */
	if (cam.p[2] > P0[2] + ps * (ZUN.FLOOR + 2) && p.inscription !== false) {
		const zf = ZUN.FLOOR + 0.01, rf = INN[INN.length - 1][0], nf = 2.75;   // the floor follows the rounded-square belly
		const fl = Array.from({length: NT}, (_, j) => P(W(ringPt((j / NT) * 2 * Math.PI, rf + 0.05, zf, nf))));
		const flD = 'M' + fl.map((q) => `${f1(q[0])},${f1(q[1])}`).join('L') + 'Z';
		const up: V3 = WN([0, 0, 1]), mid = W([0, 0, zf]);
		const ao = 0.3 + 0.7 * (Lt.inside ?? 0);
		const floorC = shade(up, mid, mixc(albedo(0.3, zf, 0), [96, 84, 62], 0.35), 0.7, ao);
		const du: V3 = [Math.cos(TOP_A - Math.PI / 2), Math.sin(TOP_A - Math.PI / 2), 0], dv: V3 = [-Math.cos(TOP_A), -Math.sin(TOP_A), 0];   // u: the page's right, v: down the column (seen from above)
		const F = (u: number, v: number): V3 => W([du[0] * u + dv[0] * v, du[1] * u + dv[1] * v, zf]);
		const pxPerCm = cam.f * ps / Math.max(1, depth(mid));
		const glyphs: React.ReactNode[] = [], gold: React.ReactNode[] = [];
		const incise = mixc(floorC, [18, 14, 10], 0.78), lip = mixc(floorC, [255, 236, 190], 0.32);
		INSCR.forEach((g, gi) => {
			const toD = (st: Stroke) => 'M' + st.pts.map(([x, y]) => { const q = P(F(g.u + x * g.s * 0.98, g.v + y * g.s * 1.0)); return `${f1(q[0])},${f1(q[1])}`; }).join('L') + (st.fill ? 'Z' : '');
			const cover = 1 - sstep(0.0, 1, (reveal * 1.25 - 0.25 * rnd(gi, 3) - 0.35 * Math.hypot(g.u + 0.9, g.v) / 7.5) * 1.6);   // cleaning spreads from the centre
			const o = (g.lost ? 0.35 : 1) * (1 - cover * 0.85);
			if (o < 0.04) return;
			g.strokes.forEach((st, si) => { const d = toD(st), w = Math.max(0.6, st.w * g.s * pxPerCm * 1.05);
				glyphs.push(<g key={`g${gi}_${si}`} opacity={o}>
					<path d={d} fill={st.fill ? rgbS(lip) : 'none'} stroke={rgbS(lip)} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" transform="translate(0.8,1.2)" />
					<path d={d} fill={st.fill ? rgbS(incise) : 'none'} stroke={rgbS(incise)} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" /></g>);
				if (g.key && glow > 0 && (g.key === 'zhong' || g.key === 'huo')) gold.push(<path key={`k${gi}_${si}`} d={d} fill={st.fill ? '#FFE9A8' : 'none'} stroke="#FFE9A8" strokeWidth={w * 1.2} strokeLinecap="round" strokeLinejoin="round" />);
				else if (g.key && glow > 0) gold.push(<path key={`k${gi}_${si}`} d={d} fill="none" stroke="#C9964A" strokeOpacity={0.55} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />); }); });
		/* rust + soil crust over the floor, lifting from the centre outward as `reveal` grows */
		const crust: React.ReactNode[] = [];
		for (let i = 0; i < 190; i++) { const a = rnd(i, 61) * 2 * Math.PI, rr = Math.sqrt(rnd(i, 62)) * 7.6, u = Math.cos(a) * rr, v = Math.sin(a) * rr;
			const order = 0.18 * rnd(i, 63) + 0.82 * Math.hypot(u + 0.9, v) / 7.5;   // 0 at the cleaning centre → 1 at the rim
			const left = order - reveal * 1.05; if (left <= -0.08) continue;
			const lift = cl(1 - left / 0.12), size = 0.45 + rnd(i, 64) * 0.85;
			const pts = Array.from({length: 14}, (_, k) => { const aa = (k / 14) * 2 * Math.PI, q = size * (0.55 + 0.6 * rnd(i * 14 + k, 65)); return P(F(u + q * Math.cos(aa), v + q * 0.8 * Math.sin(aa))); });
			const d = 'M' + pts.map((q) => `${f1(q[0])},${f1(q[1])}`).join('L') + 'Z';
			const cc = mixc(mixc([88, 68, 46], [66, 92, 72], rnd(i, 66) * 0.55), [30, 24, 18], 0.35 + 0.3 * rnd(i, 67));
			crust.push(<g key={`c${i}`}>{left < 0.12 && <path d={d} fill="#000" opacity={0.35} transform={`translate(${f1(3 + 4 * lift)},${f1(4 + 5 * lift)})`} />}
				<path d={d} fill={rgbS(shade(up, mid, cc, 0.2, ao))} transform={left < 0.12 ? `translate(${f1(-2 * lift)},${f1(-3 * lift)})` : undefined} />
				{left < 0.12 && <path d={d} fill="none" stroke={rgbS(mixc(cc, [255, 230, 180], 0.3))} strokeWidth={1} transform={`translate(${f1(-2 * lift)},${f1(-3 * lift)})`} opacity={0.7} />}</g>); }
		items.push({z: 1e9, el: <g key="floor">
			<path d={flD} fill={rgbS(floorC)} />
			{(Lt.inside ?? 0) > 0.05 && <path d={flD} fill={`url(#${id}flp)`} opacity={Lt.inside} />}
			{glyphs}
			{glow > 0 && (() => { const kg = INSCR.filter((g) => g.key === 'zhong' || g.key === 'huo'), cu = kg.reduce((a, g) => a + g.u, 0) / 2, cv = kg.reduce((a, g) => a + g.v, 0) / 2, q = P(F(cu, cv));
				return <ellipse cx={q[0]} cy={q[1]} rx={2.2 * pxPerCm} ry={2.6 * pxPerCm} fill={`url(#${id}bloom)`} opacity={glow} />; })()}
			{gold.length > 0 && <g opacity={glow} filter={`url(#${id}gl)`}>{gold}{gold}{gold}</g>}
			{gold.length > 0 && <g opacity={glow} filter={`url(#${id}gl2)`}>{gold}{gold}</g>}
			{gold.length > 0 && <g opacity={glow}>{gold}</g>}
			{crust}</g>}); }

	/* ---------- relief: raised lines and pads, lit on the side toward the key, dark on the other, following the surface ---------- */
	const relief = (mots: Mot[], toThZ: (s: number, z: number) => [number, number], keyp: string, bias = 0.35) => mots.forEach((m, mi) => {
		const ptsM = m.pts.map(([s, z]) => toThZ(s, z));
		/* split where the surface turns away from the camera */
		const runs: [number, number][][] = []; let cur: [number, number][] = [];
		ptsM.forEach((q) => { const w = W(surfM(q[0], q[1])), n = WN(surfNM(q[0], q[1])); if (dot(n, camD(w)) > 0.02 * Math.hypot(...camD(w))) cur.push(q); else { if (cur.length > 1) runs.push(cur); cur = []; } });
		if (cur.length > 1) runs.push(cur);
		runs.forEach((run, ri) => {
			const mid = run[Math.floor(run.length / 2)], n = WN(surfNM(mid[0], mid[1])), q0 = W(surfM(mid[0], mid[1], m.h));
			let lt = sub(L, [n[0] * dot(L, n), n[1] * dot(L, n), n[2] * dot(L, n)]); const ll = Math.hypot(...lt); lt = ll > 1e-3 ? [lt[0] / ll, lt[1] / ll, lt[2] / ll] : [0, 0, 1];
			const path = (off: number, hk = 1) => 'M' + run.map((q) => { const w = addv(W(surfM(q[0], q[1], m.h * hk)), lt, off * ps); const pp = P(w); return `${f1(pp[0])},${f1(pp[1])}`; }).join('L') + (m.kind === 'fill' ? 'Z' : '');
			const alb = albedo(mid[0], mid[1], 1, true), base = shade(n, q0, alb, 1.15);
			const hi = mixc(base, mixc(keyC, [255, 240, 210], 0.5), 0.42 * (1 - 0.5 * patina) + 0.1), lo = mixc(base, BRT ? [80, 32, 14] : [10, 8, 6], BRT ? 0.55 : 0.72);
			const pxw = Math.max(0.7, m.w * cam.f * ps / Math.max(1, depth(q0)));
			const D0 = path(0), Dh = path(m.h * 0.42), Dl = path(-m.h * 0.75, 0.2);
			const fillish = m.kind === 'fill';
			items.push({z: depth(q0) - bias, el: <g key={`${keyp}${mi}_${ri}`}>
				<path d={Dl} fill={fillish ? rgbS(lo) : 'none'} stroke={rgbS(lo)} strokeWidth={pxw} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
				<path d={Dh} fill={fillish ? rgbS(hi) : 'none'} stroke={rgbS(hi)} strokeWidth={pxw} strokeLinecap="round" strokeLinejoin="round" />
				<path d={D0} fill={fillish ? rgbS(base) : 'none'} stroke={rgbS(base)} strokeWidth={pxw * 0.72} strokeLinecap="round" strokeLinejoin="round" /></g>}); }); });
	const faces = [0, Math.PI];
	faces.forEach((fc, fi) => [1, -1].forEach((sg) => {
		relief(BELLY_MOTS, (s, z) => [fc + (sg * s) / BELLY_RN, z], `b${fi}${sg}`);
		relief(FOOT_MOTS, (s, z) => [fc + (sg * s) / FOOT_RN, z], `f${fi}${sg}`, 0.25); }));
	[0, 1, 2, 3].forEach((k) => [1, -1].forEach((sg) => relief(BLADE_MOTS, (a, z) => [k * Math.PI / 2 + sg * a * D2R, z], `n${k}${sg}`, 0.3)));
	for (let k = 0; k < 8; k++) relief(SILK_MOTS, (s, z) => [k * Math.PI / 4 + 0.08 + s / SILK_RN, z], `s${k}`, 0.25);
	/* band fillets: raised lines round the body at the zone edges */
	const fillet = (z: number, w: number, h: number, key: string) => { const M: Mot[] = [{kind: 'line', zone: 'band', w, h, pts: Array.from({length: 49}, (_, i) => [i / 48 * 2 * Math.PI, z] as [number, number])}];
		/* in 8 arcs so the painter can order them */
		for (let a = 0; a < 8; a++) relief([{...M[0], pts: M[0].pts.slice(a * 6, a * 6 + 7)}], (t, zz) => [t, zz], `${key}${a}`, 0.2); };
	fillet(23.25, 0.3, 0.28, 'fl1'); fillet(25.95, 0.3, 0.28, 'fl2'); fillet(35.95, 0.32, 0.3, 'fl3');

	/* ---------- 雷纹 ground: fine sunk square spirals, grouped by sector ---------- */
	const leiZone = (z0: number, z1: number, rn: number, key: string) => { const cell = 0.62, nS = 16;
		for (let sct = 0; sct < nS; sct++) { const a0 = (sct / nS) * 2 * Math.PI, a1 = ((sct + 1) / nS) * 2 * Math.PI, am = (a0 + a1) / 2, zm = (z0 + z1) / 2;
			const nM = WN(surfNM(am, zm)), wM = W(surfM(am, zm)); if (dot(nM, camD(wM)) < 0.12 * Math.hypot(...camD(wM))) continue;
			let d = ''; const ns = Math.max(1, Math.floor(((a1 - a0) * rn) / cell)), nz = Math.max(1, Math.floor((z1 - z0) / cell));
			for (let i = 0; i < ns; i++) for (let j = 0; j < nz; j++) { const th = a0 + ((i + 0.5) / ns) * (a1 - a0), z = z0 + (j + 0.5) * ((z1 - z0) / nz), fl = (i + j) % 2 ? 1 : -1;
				d += 'M' + LEI.map(([x, y]) => { const q = P(W(surfM(th + (fl * x * 0.62) / rn, z + y * 0.62, 0.02))); return `${f1(q[0])},${f1(q[1])}`; }).join('L'); }
			const pxw = Math.max(0.55, 0.11 * cam.f * ps / Math.max(1, depth(wM)));
			items.push({z: depth(wM) - 0.15, el: <path key={`${key}${sct}`} d={d} fill="none" stroke={BRT ? '#5A220E' : '#0E0B08'} strokeOpacity={(BRT ? 0.3 : 0.38) * (1 - 0.3 * molten)} strokeWidth={pxw} strokeLinejoin="round" />}); } };
	leiZone(11.9, 22.2, 9.4, 'lb'); leiZone(26.3, 35.3, 10.8, 'ln'); leiZone(4.3, 10.0, 9.0, 'lf');

	/* ---------- the horns: curled tubes whose ends stand off the surface ---------- */
	faces.forEach((fc, fi) => [1, -1].forEach((sg) => {
		const rings: V3[][] = [], NS = 12;
		const cs = HORN.map((h) => { const th = fc + (sg * h.s) / BELLY_RN; return {c: W(surfM(th, h.z, h.h)), n: WN(surfNM(th, h.z)), w: h.w, th, z: h.z}; });
		cs.forEach((k, i) => { const nx = cs[Math.min(i + 1, cs.length - 1)].c, pv = cs[Math.max(i - 1, 0)].c, T = nrm(sub(nx, pv)), N2 = nrm(cross(T, k.n)), N1 = nrm(cross(N2, T));
			const a = (k.w / 2) * ps, b = Math.max(0.34, Math.min(1.1, k.w * 0.5)) * ps;
			rings.push(Array.from({length: NS + 1}, (_, j) => { const ph = (j / NS) * 2 * Math.PI; return addv(addv(k.c, N2, a * Math.cos(ph)), N1, b * Math.sin(ph)); })); });
		for (let i = 0; i < rings.length - 1; i++) for (let j = 0; j < NS; j++) {
			const a = rings[i][j], b = rings[i][j + 1], c = rings[i + 1][j + 1], d = rings[i + 1][j];
			let n = nrm(cross(sub(c, a), sub(d, b))); const m: V3 = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
			const cen = cs[i].c; if (dot(n, sub(m, cen)) < 0) n = [-n[0], -n[1], -n[2]];
			if (dot(n, camD(m)) <= 0) continue;
			const pa = P(a), pb = P(b), pc = P(c), pd = P(d);
			const alb = albedo(cs[i].th, cs[i].z, 1, true), col = rgbS(shade(n, m, mixc(alb, BR_HI, 0.25), 1.35));
			items.push({z: depth(m) - 0.2, el: <path key={`h${fi}${sg}_${i}_${j}`} d={`M${f1(pa[0])},${f1(pa[1])}L${f1(pb[0])},${f1(pb[1])}L${f1(pc[0])},${f1(pc[1])}L${f1(pd[0])},${f1(pd[1])}Z`} fill={col} stroke={col} strokeWidth={0.6} strokeLinejoin="round" />});
			if (rimAmt > 0) sig.push(<path key={`sh${fi}${sg}_${i}_${j}`} d={`M${f1(pa[0])},${f1(pa[1])}L${f1(pb[0])},${f1(pb[1])}L${f1(pc[0])},${f1(pc[1])}L${f1(pd[0])},${f1(pd[1])}Z`} fill="#fff" stroke="#fff" strokeWidth={0.6} />); }
		/* grooves along the horn (the incised lines on its face) */
		const grooveD = (off: number) => 'M' + cs.slice(0, -2).map((k, i) => { const nx = cs[i + 1].c, T = nrm(sub(nx, k.c)), N2 = nrm(cross(T, k.n)); const q = P(addv(addv(k.c, N2, off * k.w / 2 * ps), k.n, 0.5 * ps)); return `${f1(q[0])},${f1(q[1])}`; }).join('L');
		const gm = cs[4]; if (dot(gm.n, camD(gm.c)) > 0) items.push({z: depth(gm.c) - 0.9, el: <g key={`hg${fi}${sg}`} opacity={0.55}>{[-0.35, 0.3].map((o, k) => <path key={k} d={grooveD(o)} fill="none" stroke="#120E0A" strokeWidth={Math.max(0.6, 0.13 * cam.f * ps / depth(gm.c))} strokeLinecap="round" />)}</g>}); }));

	/* ---------- the eyes: spheres (球状凸目) ---------- */
	const eyeG = `${id}eye`;
	faces.forEach((fc, fi) => [1, -1].forEach((sg) => { const th = fc + (sg * EYE.s) / BELLY_RN, n = WN(surfNM(th, EYE.z)), c = W(surfM(th, EYE.z, EYE.lift));
		if (dot(n, camD(c)) < -0.25 * Math.hypot(...camD(c))) return;
		const q = P(c), r = EYE.r * cam.f * ps / q[2], alb = albedo(th, EYE.z, 1, true), base = shade(n, c, mixc(alb, BR_HI, 0.35), 1.6);
		items.push({z: q[2] - EYE.r * ps - 0.3, el: <g key={`e${fi}${sg}`}><circle cx={q[0] + r * 0.18} cy={q[1] + r * 0.22} r={r * 1.04} fill="#0C0907" opacity={0.6} />
			<circle cx={q[0]} cy={q[1]} r={r} fill={rgbS(base)} /><circle cx={q[0]} cy={q[1]} r={r} fill={`url(#${eyeG})`} /></g>}); }));

	/* ---------- the horn ends: raised volutes standing off the surface (卷角翘出器面) ---------- */
	faces.forEach((fc, fi) => [1, -1].forEach((sg) => { const th = fc + (sg * VOLUTE.s) / BELLY_RN, n = WN(surfNM(th, VOLUTE.z)), c = W(surfM(th, VOLUTE.z, VOLUTE.lift));
		if (dot(n, camD(c)) < -0.1 * Math.hypot(...camD(c))) return;
		const T1 = nrm(cross([0, 0, 1], n)), T2 = nrm(cross(n, T1)), r = VOLUTE.r * ps;
		const ring = (rr: number, k = 28) => Array.from({length: k}, (_, i) => { const a = (i / k) * 2 * Math.PI; return P(addv(addv(c, T1, rr * Math.cos(a)), T2, rr * Math.sin(a))); });
		const dd = (pts: [number, number, number][], close = true) => 'M' + pts.map((q) => `${f1(q[0])},${f1(q[1])}`).join('L') + (close ? 'Z' : '');
		const back = ring(r * 1.02).map((q) => [q[0], q[1], q[2]] as [number, number, number]);
		const sp = Array.from({length: 30}, (_, i) => { const u = i / 29, a = sg * u * 2.3 * 2 * Math.PI, rr = r * (0.85 - 0.7 * u); return P(addv(addv(c, T1, rr * Math.cos(a)), T2, rr * Math.sin(a))); });
		const alb = albedo(th, VOLUTE.z, 1, true), base = shade(n, c, mixc(alb, BR_HI, 0.35), 1.5), dark = mixc(base, [10, 8, 6], 0.7), hi = mixc(base, [255, 236, 200], 0.35);
		const pxw = Math.max(0.8, 0.32 * cam.f * ps / depth(c));
		items.push({z: depth(c) - 0.6, el: <g key={`v${fi}${sg}`}>
			<path d={dd(back)} fill={rgbS(dark)} transform="translate(2,3)" opacity={0.7} />
			<path d={dd(ring(r))} fill={rgbS(base)} stroke={rgbS(hi)} strokeWidth={pxw * 0.6} strokeOpacity={0.7} />
			<path d={dd(sp, false)} fill="none" stroke={rgbS(dark)} strokeWidth={pxw} strokeLinecap="round" /></g>}); }));

	/* ---------- the flanges: openwork plates with real edge faces (so an end-on flange still reads) ---------- */
	const area = (pg: P2[]) => pg.reduce((s2, q, i) => { const r2 = pg[(i + 1) % pg.length]; return s2 + q[0] * r2[1] - r2[0] * q[1]; }, 0) / 2;
	[0, 1, 2, 3].forEach((k) => { const tf = (k * Math.PI) / 2, rad: V3 = [Math.cos(tf), Math.sin(tf), 0], tan: V3 = [-Math.sin(tf), Math.cos(tf), 0];
		PLATES.forEach((pl) => {
			const to3 = (q: P2, t: number): V3 => W([rad[0] * q[0] + tan[0] * t, rad[1] * q[0] + tan[1] * t, q[1]]);
			const cz = pl.out.reduce((s2, q) => s2 + q[1], 0) / pl.out.length, cr = pl.out.reduce((s2, q) => s2 + q[0], 0) / pl.out.length;
			const sideN = WN(tan), cen = to3([cr, cz], 0), facing = dot(sideN, camD(cen)) > 0 ? 1 : -1, tN = (facing * pl.th) / 2;
			const alb = albedo(tf + 0.01, cz, 0, true);
			const edges: Item[] = [];
			[pl.out, ...pl.holes].forEach((pg, pi) => { const sgn = (area(pg) > 0 ? 1 : -1) * (pi === 0 ? 1 : -1);
				pg.forEach((q, i) => { const q2 = pg[(i + 1) % pg.length], dr = q2[0] - q[0], dz = q2[1] - q[1], ln = Math.hypot(dr, dz) || 1;
					const nr = (sgn * dz) / ln, nz = (-sgn * dr) / ln, n3 = WN(nrm([rad[0] * nr, rad[1] * nr, nz]));
					const A = to3(q, -pl.th / 2), B = to3(q2, -pl.th / 2), C = to3(q2, pl.th / 2), D = to3(q, pl.th / 2), m: V3 = [(A[0] + C[0]) / 2, (A[1] + C[1]) / 2, (A[2] + C[2]) / 2];
					if (dot(n3, camD(m)) <= 0) return;
					const pa = P(A), pb = P(B), pc = P(C), pd = P(D), col = rgbS(shade(n3, m, mixc(alb, BR, 0.35), 0.8));
					edges.push({z: depth(m), el: <path key={`${pi}_${i}`} d={`M${f1(pa[0])},${f1(pa[1])}L${f1(pb[0])},${f1(pb[1])}L${f1(pc[0])},${f1(pc[1])}L${f1(pd[0])},${f1(pd[1])}Z`} fill={col} stroke={col} strokeWidth={0.6} strokeLinejoin="round" />}); }); });
			edges.sort((a, b) => b.z - a.z);
			const face = [pl.out, ...pl.holes].map((pg) => 'M' + pg.map((q) => { const pp = P(to3(q, tN)); return `${f1(pp[0])},${f1(pp[1])}`; }).join('L') + 'Z').join('');
			const faceC = shade(facing > 0 ? sideN : [-sideN[0], -sideN[1], 0], cen, BRT ? mixc(alb, BR, 0.3) : VG ? mixc(albedo(tf + 0.37, cz, 1, false), BR, 0.3) : mixc(mixc(alb, BR, 0.6), [40, 40, 34], 0.3), 0.55);
			const faceOn = Math.abs(dot(sideN, nrm(camD(cen))));
			const farSide = dot(WN(rad), nrm(camD(cen))) < -0.05;
			if (rimAmt > 0 && !farSide && faceOn > 0.03) sig.push(<path key={`sf${k}${pl.key}`} d={face} fill="#fff" fillRule="evenodd" />);
			items.push({z: depth(to3([cr, cz], tN)) + (farSide ? 4 : -0.3), el: <g key={`fl${k}${pl.key}`}>
				{edges.map((e) => e.el)}
				{faceOn > 0.03 && <path d={face} fill={rgbS(faceC)} fillRule="evenodd" />}
				{faceOn > 0.15 && pl.inc && (() => { const dI = pl.inc.map((pg) => 'M' + pg.map((q) => { const pp = P(to3(q, tN)); return `${f1(pp[0])},${f1(pp[1])}`; }).join('L')).join(''), wI = Math.max(0.7, 0.16 * cam.f * ps / Math.max(1, depth(cen)));
					return <g opacity={Math.min(1, faceOn * 1.6)}><path d={dI} fill="none" stroke={rgbS(mixc(faceC, [255, 236, 200], 0.28))} strokeWidth={wI * 0.8} strokeLinecap="round" strokeLinejoin="round" transform="translate(0.7,-0.7)" />
						<path d={dI} fill="none" stroke="#0C0907" strokeOpacity={0.8} strokeWidth={wI} strokeLinecap="round" strokeLinejoin="round" /></g>; })()}
				</g>}); }); });

	/* ---------- a contact shadow ---------- */
	const shadowEl = p.shadow !== false ? (() => { const pts = Array.from({length: 40}, (_, j) => P(W(ringPt((j / 40) * 2 * Math.PI, 12.5, 0.02, 2.4))));
		return <path d={'M' + pts.map((q) => `${f1(q[0])},${f1(q[1])}`).join('L') + 'Z'} fill="#000" opacity={0.55} filter={`url(#${id}sh)`} />; })() : null;

	items.sort((a, b) => b.z - a.z);
	const lsx = dot(L, basis(cam).R), lsy = dot(L, basis(cam).U);
	/* the signature rim: an inner band all round (eroded alpha), a stronger band on the side away from the key and along the top
	   (offset alpha), a soft wider falloff inward; clipped to the silhouette so nothing spills onto the set */
	const small = 1 - sstep(4, 12, pxs), rw = Math.max(2.4, Math.min(5.5, pxs * 0.25)), off = rw * (1.45 + 0.55 * small);   /* small on screen = a bolder rim */
	const rimF = (fid: string, k: number, withSrc: boolean) => <filter id={fid} x="-4%" y="-4%" width="108%" height="108%" colorInterpolationFilters="sRGB">
		<feMorphology in="SourceAlpha" operator="erode" radius={rw.toFixed(2)} result="er" /><feComposite in="SourceAlpha" in2="er" operator="out" result="ea" />
		<feOffset in="SourceAlpha" dx={(Ls.x * off * Ls.k).toFixed(2)} dy={(0.45 * off).toFixed(2)} result="of" /><feComposite in="SourceAlpha" in2="of" operator="out" result="ed" />
		<feComponentTransfer in="ea" result="ea2"><feFuncA type="linear" slope={(0.28 + 0.34 * small).toFixed(3)} /></feComponentTransfer>
		<feMerge result="band"><feMergeNode in="ea2" /><feMergeNode in="ed" /></feMerge>
		<feGaussianBlur in="band" stdDeviation={(rw * 0.45).toFixed(2)} result="bb" />
		<feMorphology in="SourceAlpha" operator="erode" radius={(rw * 2.6).toFixed(2)} result="er2" /><feComposite in="SourceAlpha" in2="er2" operator="out" result="wide" />
		<feGaussianBlur in="wide" stdDeviation={(rw * 1.4).toFixed(2)} result="wb2" /><feComponentTransfer in="wb2" result="wb3"><feFuncA type="linear" slope={0.22} /></feComponentTransfer>
		<feMerge result="all"><feMergeNode in="wb3" /><feMergeNode in="bb" /></feMerge>
		<feComposite in="all" in2="SourceAlpha" operator="in" result="bin" />
		<feFlood floodColor="#A8E6FF" floodOpacity={k} result="fc" /><feComposite in="fc" in2="bin" operator="in" result="rimc" />
		<feMerge>{withSrc && <feMergeNode in="SourceGraphic" />}<feMergeNode in="rimc" /></feMerge></filter>;
	return <g>
		<defs>
			{rimAmt > 0 && rimF(`${id}rim`, rimAmt, true)}
			{rimAmt > 0 && rimF(`${id}sig`, rimAmt * (0.32 + 0.22 * small), false)}
			{plus > 0 && <radialGradient id={`${id}dk`}><stop offset="0" stopColor="#000" stopOpacity={0.34} /><stop offset="0.55" stopColor="#000" stopOpacity={0.22} /><stop offset="1" stopColor="#000" stopOpacity={0} /></radialGradient>}
			<radialGradient id={eyeG} cx="50%" cy="50%" r="50%" fx={`${50 + 28 * lsx}%`} fy={`${50 - 28 * lsy}%`}>
				<stop offset="0%" stopColor={rgbS(mixc(keyC, [255, 255, 255], 0.15))} stopOpacity={0.6 * (1 - 0.6 * patina)} />
				<stop offset="30%" stopColor={rgbS(keyC)} stopOpacity={0.12} /><stop offset="100%" stopColor="#000" stopOpacity={0.65} /></radialGradient>
			<pattern id={`${id}flm`} width={9} height={9} patternUnits="userSpaceOnUse"><circle cx={2} cy={3} r={1.6} fill="#4E7A62" opacity={0.5} /><circle cx={6.5} cy={7} r={1.1} fill="#0C0907" opacity={0.45} /></pattern>
			<radialGradient id={`${id}flp`} cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#FFDCA0" stopOpacity={0.5} /><stop offset="60%" stopColor="#FFB060" stopOpacity={0.16} /><stop offset="100%" stopColor="#000" stopOpacity={0} /></radialGradient>
			<radialGradient id={`${id}bloom`}><stop offset="0" stopColor="#FFD27A" stopOpacity={0.7} /><stop offset="0.5" stopColor="#FFB050" stopOpacity={0.2} /><stop offset="1" stopColor="#FFB050" stopOpacity={0} /></radialGradient>
			<filter id={`${id}gl`} x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation={12} /></filter>
			<filter id={`${id}gl2`} x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation={3.5} /></filter>
			<filter id={`${id}sh`} x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation={10} /></filter>
		</defs>
		{plus > 0 && <ellipse cx={f1(scrC[0])} cy={f1(scrC[1])} rx={f1(31 * pxs)} ry={f1(28 * pxs)} fill={`url(#${id}dk)`} opacity={plus} />}
		{shadowEl}
		<g filter={rimAmt > 0 ? `url(#${id}rim)` : undefined}>{items.map((it) => it.el)}</g>
		{rimAmt > 0 && sig.length > 0 && <g filter={`url(#${id}sig)`}>{sig}</g>}
	</g>; };

/** where the model's key points land on screen (for staging tags and match cuts) */
export const zunScreen = (cam: Cam, pose: ZunPose = {}) => { const ps = pose.s ?? 1, P0: V3 = [pose.x ?? 0, pose.y ?? 0, pose.z ?? 0];
	const at = (z: number, r = 0): [number, number, number] => proj(cam, [P0[0] + r * ps, P0[1], P0[2] + z * ps]);
	return {base: at(0), lip: at(38.8), mid: at(19.4), floor: at(ZUN.FLOOR), pxPerCm: cam.f * ps / toCam(cam, [P0[0], P0[1], P0[2] + 19.4 * ps])[2]}; };
