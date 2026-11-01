import * as THREE from 'three';
/* ep55 · 何尊 3D — the form data and the procedural textures (height → normal / cavity-AO / albedo / ORM), painted on canvas.
   Shared by zun3d55h.tsx (geometry, materials). Units cm. Built from the reference photos (studio front, three museum shots)
   and /tmp/ep55h/ref_notes.txt; the profile is the photo-traced one from zun55h.tsx (copied here so the 3D model does not
   depend on that file's edits).

   Texture space of the body (outer surface): one QUADRANT, folded. u runs from a flange (the nose of a belly 饕餮) to the next
   flange; the four quadrants are mirror images (the faces are bilaterally symmetric about the front / back flanges, the neck
   blades and the foot faces are centred on every flange). Paint coordinates: s = arc cm at R_REF (0 … SQ), z cm (0 … ZT).
   Canvas order (row 0 = the top, z = ZT), so the mesh uses v = (ZT − z) / ZT and every map is an un-flipped DataTexture. */

export const ZT = 38.8;                         // 通高
export const R_REF = 9.2;                       // the arc coordinate s is measured at this radius
export const SQ = R_REF * Math.PI / 2;          // 14.45 cm = one quadrant (flange → flange)
export const TW = 1152, TH = 3072;              // body maps: ≈ 79.5 px / cm
export const HMAX = 1.6;                        // height encoded in the paint canvases (cm at 255)
export const FLOOR_Z = 12.0;                    // 内底
const D2R = Math.PI / 180;
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const sstep = (a: number, b: number, v: number) => { const u = cl((v - a) / (b - a)); return u * u * (3 - 2 * u); };
type P2 = [number, number];

/* ============================== the form (photo-traced, from zun55h) ============================== */
/** outer profile, base → lip: [corner radius, z, superellipse n] */
export const OUT: [number, number, number][] = [
	[9.85, 0, 2.5], [10.1, 0.3, 2.5], [10.15, 0.9, 2.5], [10.15, 3.15, 2.5], [10.02, 3.42, 2.5], [9.72, 3.55, 2.55],
	[9.56, 3.8, 2.55], [9.4, 4.4, 2.55], [9.22, 5.3, 2.55], [9.07, 6.5, 2.55], [8.97, 8, 2.55], [8.92, 9.5, 2.55], [8.9, 10.35, 2.55],
	[8.74, 10.55, 2.6], [8.78, 10.85, 2.65], [9.02, 11.25, 2.7], [9.26, 11.9, 2.75], [9.4, 13, 2.75], [9.46, 14.5, 2.75], [9.48, 16, 2.75],
	[9.45, 18, 2.75], [9.37, 20, 2.75], [9.25, 21.5, 2.75], [9.16, 22.3, 2.75], [9.12, 22.5, 2.75],
	[8.93, 22.62, 2.65], [8.88, 23, 2.6], [8.9, 24, 2.45], [8.98, 25, 2.3], [9.1, 26, 2.15], [9.3, 27, 2.05], [9.6, 28, 2], [9.95, 29, 2],
	[10.35, 30, 2], [10.8, 31, 2], [11.3, 32, 2], [11.85, 33, 2], [12.45, 34, 2], [13.05, 35, 2], [13.6, 36, 2], [14.0, 37, 2],
	[14.25, 37.8, 2], [14.32, 38.3, 2], [14.28, 38.62, 2], [14.12, 38.8, 2]];
/** inner profile, lip → the inside bottom */
export const INN: [number, number, number][] = [
	[13.9, 38.8, 2], [13.62, 38.6, 2], [13.5, 38.2, 2], [13.25, 37.4, 2], [12.85, 36.4, 2], [12.3, 35.2, 2], [11.7, 34, 2], [11.1, 33, 2],
	[10.6, 32, 2], [10.1, 31, 2], [9.65, 30, 2], [9.25, 29, 2], [8.9, 28, 2], [8.6, 27, 2.05], [8.4, 26, 2.15], [8.28, 25, 2.3], [8.22, 24, 2.45],
	[8.22, 23, 2.6], [8.3, 22, 2.7], [8.45, 20, 2.75], [8.55, 18, 2.75], [8.55, 16, 2.75], [8.45, 14.5, 2.75], [8.25, 13.4, 2.75],
	[7.9, 12.6, 2.75], [7.3, 12.15, 2.75], [6.5, FLOOR_Z, 2.75]];
export const Rz = (z: number): [number, number] => { const P = OUT; if (z <= P[0][1]) return [P[0][0], P[0][2]];
	for (let i = 0; i < P.length - 1; i++) if (z <= P[i + 1][1]) { const u = (z - P[i][1]) / (P[i + 1][1] - P[i][1] || 1); return [lerp(P[i][0], P[i + 1][0], u), lerp(P[i][2], P[i + 1][2], u)]; }
	const L = P[P.length - 1]; return [L[0], L[2]]; };
/** superellipse radial factor, 1 at the corners (θ = 0, 90, 180, 270°: the flanges) */
export const rho = (th: number, n: number) => { if (n <= 2.001) return 1; const p = th + Math.PI / 4, c = Math.abs(Math.cos(p)), s = Math.abs(Math.sin(p));
	return Math.pow(Math.pow(c, n) + Math.pow(s, n), -1 / n) / (Math.SQRT2 * Math.pow(2, -1 / n)); };

/* ============================== flanges (扉棱), photo-traced outlines in (r, z) ============================== */
export type Plate = {out: P2[]; holes: P2[][]; th: number; key: string; inc: P2[][]};
const column = (z0: number, z1: number, ro: (z: number) => number, teeth: number[], L: number[], holes: boolean): {out: P2[]; holes: P2[][]; inc: P2[][]} => {
	const out: P2[] = [], H: P2[][] = [], I: P2[][] = [];
	out.push([Rz(z1)[0] - 0.45, z1], [ro(z1), z1]);
	const order = teeth.map((t, i) => ({t, L: L[i]})).sort((a, b) => b.t - a.t);
	for (const {t, L: Lk} of order) { const r = ro(t);
		out.push([ro(t + 0.001), t + 0.05], [r + Lk - 0.15, t + 0.12], [r + Lk + 0.18, t - 0.08], [r + Lk + 0.32, t - 0.55], [r + Lk + 0.26, t - 1.05], [r + Lk + 0.02, t - 1.4],
			[r + Lk - 0.32, t - 1.22], [r + Lk - 0.36, t - 0.86], [r + 0.15, t - 0.78],
			[r - 0.55, t - 0.82], [r - 0.92, t - 1.12], [r - 1.0, t - 1.55], [r - 0.82, t - 1.95], [r - 0.4, t - 2.12], [ro(t - 2.15), t - 2.15]);
		I.push([[r - 0.25, t - 0.38], [r + Lk - 0.2, t - 0.36], [r + Lk - 0.02, t - 0.62], [r + Lk - 0.02, t - 1.0]]);
		{ const cz = t - 2.75, cr = (Rz(cz)[0] + ro(cz)) / 2, rr = Math.min(0.42, (ro(cz) - Rz(cz)[0]) * 0.22);
			if (cz > z0 + 0.5 && rr > 0.18) I.push(Array.from({length: 12}, (_, i) => { const aa = (0.15 + 1.55 * i / 11) * Math.PI; return [cr + rr * Math.cos(aa) * (1 - 0.35 * i / 11), cz + rr * Math.sin(aa) * (1 - 0.35 * i / 11)] as P2; })); }
		if (holes) { const zt = t - 2.55, zb = t - 3.55, a = Rz(zt)[0] + 0.4, b = Math.min(ro(zt) - 0.6, a + 1.15);
			if (b - a > 0.45 && zb > z0 + 0.25) H.push([[a + 0.2, zb], [b - 0.15, zb], [b, zb + 0.25], [b, zt - 0.3], [b - 0.3, zt], [a, zt], [a, zb + 0.2]]); } }
	out.push([ro(z0), z0]);
	for (let k = 0; k <= 12; k++) { const zz = lerp(z0, z1, k / 12); out.push([Rz(zz)[0] - 0.45, zz]); }
	return {out, holes: H, inc: I}; };
export const PLATES: Plate[] = (() => {
	const P: Plate[] = [];
	P.push({key: 'beak', th: 1.3, inc: [[[14.6, 38.15], [16.0, 38.2], [17.4, 37.95], [18.25, 37.35], [18.4, 36.3], [18.2, 35.0]], [[14.4, 36.4], [15.3, 36.45], [15.9, 36.85]]], holes: [[[15.5, 37.25], [16.25, 37.35], [16.3, 37.9], [15.55, 37.9]]], out: [
		[13.35, 34.9], [13.8, 36.0], [14.05, 37.0], [14.2, 38.0], [14.3, 38.6], [15.2, 38.62], [15.6, 38.98], [16.05, 38.64], [17.5, 38.35], [18.45, 37.75], [18.85, 36.6],
		[18.8, 35.3], [18.55, 34.3], [18.2, 33.75], [17.75, 33.95], [17.75, 35.1], [17.45, 35.95], [16.7, 36.3], [15.8, 36.05], [14.9, 35.6], [14.0, 35.0], [13.4, 34.55]].map(([r, z]) => [r, z] as P2)});
	const roN = (z: number) => Math.max(Rz(z)[0] + 0.9, lerp(11.0, 12.3, cl((z - 23.4) / (33.5 - 23.4))));
	P.push({key: 'neck', th: 1.05, ...column(23.3, 34.4, roN, [32.8, 29.1, 25.4], [0.85, 0.9, 0.9], true)});
	const roB = (z: number) => Rz(z)[0] + 1.75;
	P.push({key: 'belly', th: 1.05, ...column(11.1, 22.85, roB, [22.8, 19.6, 15.8, 12.7], [1.25, 1.2, 1.2, 0.7], true)});
	const roF = (z: number) => Rz(z)[0] + 1.2;
	P.push({key: 'foot', th: 1.0, ...column(3.85, 10.95, roF, [10.9, 6.9], [0.7, 2.0], false)});
	return P; })();

/* ============================== the high-relief parts that are real geometry ============================== */
/** belly eye (球状凸目), right half of the front face: s from the nose flange, z */
export const BELLY_EYE = {s: 6.25, z: 14.45, r: 1.08, lift: 1.05};
/** the horn (卷角): a ram's-horn crescent. The root leaves the top of the nose, runs out along the top of the belly, turns down
    the outer side and curls back in under itself; the end narrows and lifts off the surface (卷角翘出器面).
    Photo-matched (studio front): top edge z ≈ 21.6, outer extreme s ≈ 10.9 (≈ 68°), the end above the brow at s ≈ 6.5.
    [s, z, lift of the centreline off the surface, width along the surface, thickness] */
export const HORN_SPINE: [number, number, number, number, number][] = (() => {
	const P: [number, number, number, number, number][] = [[0.7, 20.1, 0.3, 1.7, 0.95], [2.2, 20.9, 0.42, 1.95, 1.1], [4.1, 21.3, 0.5, 2.05, 1.15]];
	const c = [7.5, 18.7], rs = 3.55, rz = 2.65, N = 20;
	for (let i = 0; i <= N; i++) { const u = i / N, a = (100 - 230 * u) * D2R, f = 1 - 0.32 * u * u;
		P.push([c[0] + rs * f * Math.cos(a), c[1] + rz * f * Math.sin(a), 0.55 + 2.0 * sstep(0.45, 1, u), lerp(2.05, 0.42, Math.pow(u, 1.1)), lerp(1.15, 0.45, Math.pow(u, 1.3))]); }
	return P; })();
export const HORN_HOLLOW = {s: 7.55, z: 18.75, rs: 1.95, rz: 1.45};

/* ============================== noise ============================== */
const LAT = (() => { const a = new Float32Array(256 * 256); let s = 1234567; for (let i = 0; i < a.length; i++) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; a[i] = s / 4294967296; } return a; })();
/** value noise; period (lattice cells) wraps when given (tileable) */
export const vn = (x: number, y: number, o = 0, per = 256) => { x += o * 37.1; y += o * 17.9; const xi = Math.floor(x), yi = Math.floor(y), u = x - xi, v = y - yi, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v);
	const m = (k: number) => ((k % per) + per) % per, i0 = m(xi) & 255, i1 = m(xi + 1) & 255, j0 = (m(yi) + o * 7) & 255, j1 = (m(yi + 1) + o * 7) & 255;
	return lerp(lerp(LAT[j0 * 256 + i0], LAT[j0 * 256 + i1], a), lerp(LAT[j1 * 256 + i0], LAT[j1 * 256 + i1], a), b); };
export const fbm = (x: number, y: number, o = 0, per = 256) => vn(x, y, o, per) * 0.5 + vn(x * 2, y * 2, o + 1, per * 2) * 0.27 + vn(x * 4, y * 4, o + 2, per * 4) * 0.15 + vn(x * 8, y * 8, o + 3, per * 8) * 0.08;

/* ============================== paint helpers ============================== */
type C2 = CanvasRenderingContext2D;
const mkCanvas = (w: number, h: number): [HTMLCanvasElement, C2] => { const c = document.createElement('canvas'); c.width = w; c.height = h;
	const x = c.getContext('2d', {willReadFrequently: true}) as C2; x.fillStyle = '#000'; x.fillRect(0, 0, w, h); return [c, x]; };
const gray = (h: number, hmax = HMAX) => { const g = Math.round(cl(h / hmax) * 255); return `rgb(${g},${g},${g})`; };
/** smooth (Catmull-Rom) path through points */
const tracePath = (x: C2, pts: P2[], closed = false) => { const n = pts.length; x.beginPath(); if (n < 2) return;
	const g = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
	x.moveTo(pts[0][0], pts[0][1]);
	for (let i = 0; i < (closed ? n : n - 1); i++) { const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
		x.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]); }
	if (closed) x.closePath(); };
export const spiralPts = (cx: number, cz: number, r: number, turns = 1.2, dir = 1, a0 = 0, n = 26, shrink = 0.75): P2[] =>
	Array.from({length: n + 1}, (_, i) => { const u = i / n, a = a0 + dir * u * turns * 2 * Math.PI, rr = r * (1 - shrink * u); return [cx + rr * Math.cos(a), cz + rr * Math.sin(a)] as P2; });
const ellPts = (cx: number, cz: number, rx: number, rz: number, n = 28): P2[] => Array.from({length: n}, (_, i) => [cx + rx * Math.cos((i / n) * 2 * Math.PI), cz + rz * Math.sin((i / n) * 2 * Math.PI)] as P2);
/** height painter (lighten = max) */
class Hp {
	constructor(public x: C2, public hmax = HMAX) { x.globalCompositeOperation = 'lighten'; x.lineCap = 'round'; x.lineJoin = 'round'; }
	/** a flat-topped band with bevelled shoulders */
	band(pts: P2[], w: number, h: number, bev = 0.12, closed = false) { for (let k = 0; k < 4; k++) { const f = (k + 1) / 4; this.x.strokeStyle = gray(h * f, this.hmax); this.x.lineWidth = Math.max(0.02, w - bev * 2 * (1 - f) * 2); tracePath(this.x, pts, closed); this.x.stroke(); } }
	/** a rounded ridge (half-round cross-section) */
	ridge(pts: P2[], w: number, h: number, closed = false, steps = 7) { for (let k = 0; k < steps; k++) { const f = k / steps; this.x.strokeStyle = gray(h * (k + 1) / steps, this.hmax); this.x.lineWidth = Math.max(0.02, w * Math.sqrt(1 - f * f)); tracePath(this.x, pts, closed); this.x.stroke(); } }
	/** a filled flat plane with bevelled edge */
	plane(pts: P2[], h: number, bev = 0.14) { for (let k = 0; k < 4; k++) { const f = (k + 1) / 4; this.x.fillStyle = gray(h * f, this.hmax); tracePath(this.x, pts, true); this.x.fill();
		if (k < 3) { this.x.strokeStyle = '#000'; } } this.x.fillStyle = gray(h, this.hmax); this.x.save(); this.x.globalCompositeOperation = 'source-over'; this.x.restore(); void bev; }
	/** a dome (boss, ball) */
	dome(cx: number, cz: number, r: number, h: number, steps = 10) { for (let k = 0; k < steps; k++) { const f = k / steps; this.x.fillStyle = gray(h * (k + 1) / steps, this.hmax); this.x.beginPath(); this.x.arc(cx, cz, Math.max(0.01, r * Math.sqrt(1 - f * f)), 0, 2 * Math.PI); this.x.fill(); } }
}
/** a plain mask painter (white on black, normal compositing) */
const mline = (x: C2, pts: P2[], w: number, closed = false, a = 1) => { x.globalCompositeOperation = 'source-over'; x.strokeStyle = `rgba(255,255,255,${a})`; x.lineWidth = w; x.lineCap = 'round'; x.lineJoin = 'round'; tracePath(x, pts, closed); x.stroke(); };
const mfill = (x: C2, pts: P2[], a = 1) => { x.globalCompositeOperation = 'source-over'; x.fillStyle = `rgba(255,255,255,${a})`; tracePath(x, pts, true); x.fill(); };
/** 雷纹: square spirals tiled over a rect (alternating hands), drawn as thin lines */
const LEI: P2[] = [[-0.34, -0.34], [0.34, -0.34], [0.34, 0.34], [-0.2, 0.34], [-0.2, -0.2], [0.2, -0.2], [0.2, 0.2], [-0.06, 0.2], [-0.06, -0.06]];
const leiFill = (x: C2, s0: number, z0: number, s1: number, z1: number, cell = 0.62, w = 0.06) => {
	x.globalCompositeOperation = 'source-over'; x.strokeStyle = '#fff'; x.lineWidth = w; x.lineCap = 'square'; x.lineJoin = 'miter'; x.beginPath();
	const k = cell / 0.78;
	for (let zi = 0, z = z0; z < z1 + cell; z += cell, zi++) for (let si = 0, s = s0 - ((zi % 2) * cell) / 2; s < s1 + cell; s += cell, si++) {
		const fl = (si + zi) % 2 ? 1 : -1, rot = (si * 3 + zi) % 4;
		LEI.forEach(([a, b], i) => { let px = a * fl, pz = b; for (let r = 0; r < rot; r++) [px, pz] = [-pz, px]; const X = s + px * k, Z = z + pz * k; if (i === 0) x.moveTo(X, Z); else x.lineTo(X, Z); }); }
	x.stroke(); };

/* ============================== float image ops ============================== */
const boxBlur = (a: Float32Array, w: number, h: number, r: number, passes = 2): Float32Array => { if (r < 1) return a.slice();
	let src = a.slice(), dst = new Float32Array(a.length); const inv = 1 / (2 * r + 1);
	for (let p = 0; p < passes; p++) {
		for (let y = 0; y < h; y++) { const o = y * w; let acc = 0; for (let i = -r; i <= r; i++) acc += src[o + Math.min(w - 1, Math.max(0, i))];
			for (let x = 0; x < w; x++) { dst[o + x] = acc * inv; acc += src[o + Math.min(w - 1, x + r + 1)] - src[o + Math.max(0, x - r)]; } }
		[src, dst] = [dst, src];
		for (let x = 0; x < w; x++) { let acc = 0; for (let i = -r; i <= r; i++) acc += src[Math.min(h - 1, Math.max(0, i)) * w + x];
			for (let y = 0; y < h; y++) { dst[y * w + x] = acc * inv; acc += src[Math.min(h - 1, y + r + 1) * w + x] - src[Math.max(0, y - r) * w + x]; } }
		[src, dst] = [dst, src]; }
	return src; };
const readGray = (x: C2, w: number, h: number, scale: number): Float32Array => { const d = x.getImageData(0, 0, w, h).data, o = new Float32Array(w * h); for (let i = 0; i < o.length; i++) o[i] = (d[i * 4] / 255) * scale; return o; };
const dataTex = (data: Uint8Array, w: number, h: number, srgb: boolean) => { const t = new THREE.DataTexture(data, w, h, THREE.RGBAFormat, THREE.UnsignedByteType);
	t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.anisotropy = 4;
	if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; return t; };

/* ============================== material looks ============================== */
export type Look = 'clean' | 'dirty' | 'molten' | 'reveal';
type RGB = [number, number, number];
const hx = (c: string): RGB => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) as RGB;
const mix3 = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
/** palette (sRGB): the cleaned museum surface is a dark grey-olive bronze, silvery-warm where handled and on the ridges; verdigris
    (malachite green to blue-green) and earth gather in the recesses */
const PAL = {metal: hx('#56574e'), metalDk: hx('#2c2d27'), worn: hx('#9a8f74'), silver: hx('#9fa196'), verd: hx('#56705f'), verdLt: hx('#8b9f8b'), verdBl: hx('#4a6866'), soil: hx('#6e5c44'), soilLt: hx('#93805f')};
export type Maps = {albedo: THREE.DataTexture; orm: THREE.DataTexture; normal: THREE.DataTexture; heat: THREE.DataTexture};
/** height + cavity → normal map; and per look: albedo, ORM (R = AO, G = roughness, B = metalness), a heat mask for the casting */
const finish = (H: Float32Array, w: number, h: number, dxcm: (y: number) => number, dycm: number, look: Look, seed: number, extraAO?: Float32Array, nStr = 1, tile = 0) => {
	const fq = (f: number) => (tile ? Math.max(1, Math.round(f * tile)) / tile : f), pr = (f: number) => (tile ? Math.max(1, Math.round(f * tile)) : 256), F1 = fq(0.55), F2 = fq(5), F3 = fq(2.2), P1 = pr(0.55), P2 = pr(5), P3 = pr(2.2);
	const n = w * h, b1 = boxBlur(H, w, h, Math.round(6 * w / TW * 1.0) || 3), b2 = boxBlur(H, w, h, Math.round(26 * w / TW) || 10);
	const nrm = new Uint8Array(n * 4), alb = new Uint8Array(n * 4), orm = new Uint8Array(n * 4), heat = new Uint8Array(n * 4);
	const dirty = look === 'dirty' || look === 'reveal';
	for (let y = 0; y < h; y++) { const dx = dxcm(y), ym = Math.max(0, y - 1), yp = Math.min(h - 1, y + 1);
		for (let x = 0; x < w; x++) { const i = y * w + x, xm = Math.max(0, x - 1), xp = Math.min(w - 1, x + 1);
			const gx = (H[y * w + xp] - H[y * w + xm]) / (2 * dx), gy = (H[yp * w + x] - H[ym * w + x]) / (2 * dycm);
			let nx = -gx * nStr, ny = -gy * nStr, nz = 1; const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
			nrm[i * 4] = (nx * 0.5 + 0.5) * 255; nrm[i * 4 + 1] = (ny * 0.5 + 0.5) * 255; nrm[i * 4 + 2] = (nz * 0.5 + 0.5) * 255; nrm[i * 4 + 3] = 255;
			const c1 = Math.max(0, b1[i] - H[i]), c2 = Math.max(0, b2[i] - H[i]), ridge = cl((H[i] - b2[i]) * 3.2), edge = cl(Math.hypot(gx, gy) * 0.35);
			let ao = cl(1 - c1 * 2.6 - c2 * 1.1, 0.18, 1); if (extraAO) ao *= extraAO[i];
			const cav = cl(1 - ao);
			/* noise in cm space (u, v ≈ isotropic for the body) */
			const X = x * dx, Y = y * dycm;
			const nb = fbm(X * F1, Y * F1, seed, P1), nf = vn(X * F2, Y * F2, seed + 5, P2), nm = fbm(X * F3, Y * F3, seed + 9, P3);
			/* patina: recesses + blotches */
			const pBase = dirty ? 0.42 : 0.06, pat = cl(pBase + cav * (dirty ? 1.6 : 1.25) + (nb - 0.5) * (dirty ? 0.7 : 0.5) - ridge * 0.9 + (nf - 0.5) * 0.25);
			const soil = dirty ? cl(cav * 1.8 + (nm - 0.4) * 1.1 + (nb - 0.5) * 0.5 - ridge * 1.0) : cl(cav * 0.5 + (nm - 0.6) * 0.8 - 0.25);
			const wear = cl(ridge * 1.5 + edge * 0.6 + (nm - 0.5) * 0.4) * (dirty ? 0.35 : 1);
			let c = mix3(PAL.metalDk, PAL.metal, cl(0.42 + (nb - 0.5) * 0.45 + (nf - 0.5) * 0.22));
			c = mix3(c, mix3(PAL.worn, PAL.silver, cl(nm * 1.4 - 0.2)), wear * 0.75);
			const vcol = mix3(mix3(PAL.verd, PAL.verdBl, cl((nm - 0.4) * 2)), PAL.verdLt, cl((nf - 0.55) * 2 + cav * 0.3) * (dirty ? 0.35 : 1));
			c = mix3(c, vcol, pat * (dirty ? 0.85 : 0.62));
			c = mix3(c, mix3(PAL.soil, PAL.soilLt, nf), soil * (dirty ? 0.9 : 0.55));
			const dark = 1 - cav * 0.35; alb[i * 4] = cl(c[0] * dark, 0, 255); alb[i * 4 + 1] = cl(c[1] * dark, 0, 255); alb[i * 4 + 2] = cl(c[2] * dark, 0, 255); alb[i * 4 + 3] = 255;
			const metal = cl(0.88 - pat * 0.75 - soil * 0.85 + wear * 0.08), rough = cl(0.46 + (nf - 0.5) * 0.14 + pat * 0.38 + soil * 0.45 - wear * 0.1 + (dirty ? 0.1 : 0), 0.28, 0.95);
			orm[i * 4] = ao * 255; orm[i * 4 + 1] = rough * 255; orm[i * 4 + 2] = metal * 255; orm[i * 4 + 3] = 255;
			const ht = cl(0.62 + (nb - 0.5) * 0.18 + cav * 0.45 - ridge * 0.3 - edge * 0.15); heat[i * 4] = 255 * cl(0.55 + 0.5 * ht); heat[i * 4 + 1] = 255 * ht * (0.18 + 0.5 * ht); heat[i * 4 + 2] = 255 * ht * ht * 0.16; heat[i * 4 + 3] = 255; } }
	return {albedo: dataTex(alb, w, h, true), orm: dataTex(orm, w, h, false), normal: dataTex(nrm, w, h, false), heat: dataTex(heat, w, h, true)}; };

/* ============================== the body ornament (one quadrant) ============================== */
/** paint transform: (s cm, z cm) → canvas px */
const bodyXf = (x: C2) => x.setTransform(TW / SQ, 0, 0, -TH / ZT, 0, TH);
const mirrorS = (x: C2) => { x.transform(-1, 0, 0, 1, SQ, 0); };

/** the big belly 饕餮, right half (s 0 at the nose flange → SQ at the side flange) */
const bellyRelief = (p: Hp) => {
	/* the face plane (the mask the features sit on): hugs the brow, the eye, the claw and the nose */
	const face: P2[] = [[0, 12.0], [0, 17.2], [1.2, 17.6], [2.6, 17.2], [4.2, 17.15], [6.2, 17.25], [8.4, 17.05], [10.1, 16.4], [11.0, 15.2], [11.9, 13.9], [11.8, 12.6], [10.6, 11.95], [8.0, 11.85], [5.2, 11.95], [2.6, 11.95]];
	for (let k = 0; k < 4; k++) { p.x.fillStyle = gray(0.34 * (k + 1) / 4); p.x.save(); p.x.lineWidth = 0.36 * (3 - k) / 3; p.x.strokeStyle = gray(0.34 * (k + 1) / 4); tracePath(p.x, face, true); p.x.fill(); p.x.restore(); }
	p.x.globalCompositeOperation = 'source-over'; p.x.strokeStyle = '#000'; p.x.lineWidth = 0.001; p.x.globalCompositeOperation = 'lighten';
	/* nose bridge either side of the flange */
	p.band([[0.45, 12.4], [0.45, 21.4]], 0.9, 0.55, 0.15);
	/* the brow (textured, arched over the eye) */
	p.ridge([[2.0, 15.3], [3.6, 16.05], [5.6, 16.45], [7.6, 16.4], [9.4, 15.9], [10.6, 15.0]], 1.3, 1.15);
	/* 臣字目 socket ring around the ball eye, its inner corner hooking toward the nose */
	const E = BELLY_EYE;
	p.band([[3.3, 14.35], [4.6, 15.25], [E.s, 15.62], [8.0, 15.3], [9.2, 14.45], [8.0, 13.55], [E.s, 13.25], [4.6, 13.6], [3.3, 14.35], [2.4, 14.05], [2.05, 13.55]], 0.55, 0.62, 0.1);
	p.dome(E.s, E.z, 1.32, 0.42);
	/* upper lip and fang, nostril curl */
	p.ridge([[0.8, 13.45], [2.6, 13.62], [4.1, 13.25], [4.9, 12.6], [4.7, 12.05]], 0.7, 0.72);
	p.ridge(spiralPts(2.35, 12.6, 0.85, 1.15, 1, Math.PI * 0.95, 30, 0.72), 0.6, 0.7);
	/* the claw (利爪) under the eye, curling in */
	p.ridge([[11.6, 13.7], [10.8, 12.75], [9.6, 12.15], [8.4, 12.2], [7.55, 12.75], [7.8, 13.3], [8.5, 13.15]], 1.15, 1.25);
	p.dome(8.25, 12.85, 0.62, 1.2);
	p.dome(3.9, 12.35, 0.62, 0.95);
	/* the body / ear running down the outer side to the side flange */
	p.band([[11.9, 21.8], [12.35, 20.2], [12.3, 18.4], [12.75, 16.9], [13.25, 16.05], [12.95, 15.1], [12.55, 14.1], [12.8, 12.6], [13.55, 12.05]], 0.8, 0.6);
	p.ridge(spiralPts(13.15, 15.55, 0.55, 1.0, -1, 0, 20, 0.7), 0.32, 0.5);
	p.band([[11.5, 17.9], [12.0, 18.6], [12.0, 19.6]], 0.42, 0.42);
	/* a small curl inside the horn's hollow (the volute) and the crest between the horns */
	p.ridge(spiralPts(HORN_HOLLOW.s + 0.2, HORN_HOLLOW.z + 0.1, 0.62, 1.0, -1, Math.PI * 0.4, 20, 0.7), 0.32, 0.38);
	p.band([[0.0, 21.95], [1.2, 21.95]], 0.5, 0.42);
	/* borders */
	p.band([[-0.2, 11.55], [SQ + 0.2, 11.55]], 0.26, 0.3, 0.06); p.band([[-0.2, 22.32], [SQ + 0.2, 22.32]], 0.24, 0.3, 0.06);
	return face; };
/** incised lines on the face plane and the features (the third layer of the 三层花) */
const bellyIncise = (x: C2, face: P2[]) => {
	const w = 0.085;
	x.save(); tracePath(x, face, true); x.clip();
	const curls: [number, number, number, number, number][] = [[3.7, 18.3, 0.62, 1, 0.3], [5.3, 17.25, 0.5, -1, 2.2], [9.6, 16.6, 0.5, 1, 3.4], [4.4, 12.5, 0.55, -1, 0.5], [6.4, 12.45, 0.5, 1, 1.9], [10.2, 13.6, 0.45, -1, 4], [1.6, 16.6, 0.55, 1, 5.1], [1.4, 18.5, 0.45, -1, 1.1], [10.4, 12.3, 0.35, 1, 0.2]];
	curls.forEach(([cs, cz, r, d, a0]) => mline(x, spiralPts(cs, cz, r, 1.15, d, a0, 24, 0.7), w));
	/* lines following the plane's outline and long cloud strokes */
	mline(x, [[0.9, 19.2], [2.8, 19.0], [4.4, 18.0], [5.8, 17.1], [8.2, 16.95], [10.1, 16.75]], w);
	mline(x, [[1.2, 15.0], [1.9, 16.1], [3.0, 16.8], [4.6, 17.0]], w);
	mline(x, [[9.6, 14.6], [10.6, 15.2], [10.9, 14.0], [10.4, 13.0]], w);
	mline(x, [[1.0, 14.3], [1.6, 14.9], [1.3, 15.6]], w);
	x.restore();
	/* the brow's comb (transverse grooves) */
	const brow: P2[] = [[2.1, 15.25], [3.6, 15.95], [5.6, 16.35], [7.6, 16.3], [9.3, 15.8], [10.4, 15.0]];
	for (let i = 1; i < 30; i++) { const u = i / 30, k = u * (brow.length - 1), j = Math.min(brow.length - 2, Math.floor(k)), f = k - j;
		const a = brow[j], b = brow[j + 1], px = lerp(a[0], b[0], f), pz = lerp(a[1], b[1], f), tx = b[0] - a[0], tz = b[1] - a[1], l = Math.hypot(tx, tz) || 1, nx = -tz / l, nz = tx / l;
		mline(x, [[px - nx * 0.42, pz - nz * 0.42], [px + nx * 0.42, pz + nz * 0.42]], 0.06); }
	/* the body band's centre line */
	mline(x, [[12.0, 21.4], [12.35, 20.0], [12.3, 18.5], [12.7, 17.0]], 0.07);
};

/** the neck: a 蕉叶 blade centred on the flange (half), with a small 兽面 inside it */
const BLADE: P2[] = [[5.35, 26.35], [5.05, 28.4], [4.25, 30.6], [3.0, 32.6], [1.55, 34.0], [0.0, 34.75]];
const neckRelief = (p: Hp) => {
	p.band([...BLADE, [-0.5, 34.9]], 0.62, 0.48, 0.1);
	/* inner 兽面: a T-bar down the middle, a curl, an eye boss, a hooked jaw */
	p.band([[0.9, 27.0], [0.9, 31.6], [2.25, 32.25]], 0.62, 0.5);
	p.ridge(spiralPts(2.75, 30.35, 0.8, 1.1, -1, Math.PI * 0.2, 24, 0.7), 0.58, 0.55);
	p.dome(2.15, 28.55, 0.42, 0.55);
	p.band([[1.6, 27.3], [2.8, 27.25], [3.7, 27.7], [4.0, 28.5], [3.55, 29.0]], 0.55, 0.5);
	p.band([[2.2, 33.1], [1.3, 33.5], [0.8, 32.9]], 0.42, 0.42);
	p.band([[4.3, 26.6], [4.05, 28.3], [3.4, 30.0], [2.5, 31.7], [1.3, 33.0]], 0.26, 0.3);
	p.ridge(spiralPts(1.85, 33.05, 0.5, 1.0, 1, Math.PI, 18, 0.65), 0.34, 0.42);
	p.band([[1.0, 29.85], [1.9, 29.6], [2.2, 29.2]], 0.4, 0.42);
	p.ridge(spiralPts(4.0, 27.2, 0.45, 1.0, -1, 0.3, 16, 0.6), 0.32, 0.4);
	p.band([[-0.2, 26.15], [SQ + 0.2, 26.15]], 0.24, 0.28, 0.06);
};
const neckLeiClip = (x: C2) => { tracePath(x, [...BLADE, [-0.6, 34.8], [-0.6, 26.3]], true); };
/** the 蚕纹 / small-dragon band under the neck (z 22.7–26) */
const bandRelief = (p: Hp) => {
	p.dome(4.55, 24.4, 0.42, 0.5);
	p.band([[5.0, 24.45], [6.0, 24.95], [6.85, 24.5], [6.9, 23.75], [6.3, 23.45]], 0.36, 0.38);
	p.band([[4.1, 24.4], [3.1, 24.95], [2.0, 24.6], [1.3, 23.9], [1.6, 23.35]], 0.34, 0.36);
	p.band([[-0.2, 22.82], [SQ + 0.2, 22.82]], 0.2, 0.24, 0.05);
};
/** the ring foot: a low-relief 兽面 centred on the flange (half) */
const footRelief = (p: Hp) => {
	p.dome(3.3, 6.65, 0.66, 0.68);
	p.band(ellPts(3.3, 6.65, 1.12, 0.82), 0.42, 0.42, 0.06, true);
	p.band([[0.9, 8.3], [1.6, 9.35], [3.2, 9.55], [4.6, 9.35], [5.25, 8.65], [4.85, 7.95], [4.1, 8.25]], 0.68, 0.48);
	p.ridge(spiralPts(2.0, 5.05, 0.7, 1.1, 1, Math.PI, 22, 0.7), 0.6, 0.5);
	p.band([[4.5, 5.55], [5.5, 4.95], [6.45, 5.35], [6.5, 6.15]], 0.6, 0.46);
	p.band([[5.0, 7.05], [6.1, 7.35], [6.9, 8.25], [6.6, 9.1]], 0.55, 0.44);
	p.band([[0.55, 4.6], [0.55, 9.6]], 0.75, 0.4);
	p.band([[-0.2, 10.15], [SQ + 0.2, 10.15]], 0.24, 0.3, 0.06); p.band([[-0.2, 4.05], [SQ + 0.2, 4.05]], 0.22, 0.26, 0.06);
};

export type BodyTex = {H: Float32Array; maps: Partial<Record<Look, Maps>>; aoX: Float32Array};
let BODY: BodyTex | null = null;
export const bodyHeight = (): BodyTex => {
	if (BODY) return BODY;
	const t0 = performance.now();
	const [, rx] = mkCanvas(TW, TH); bodyXf(rx); const p = new Hp(rx);
	const face = bellyRelief(p);
	neckRelief(p); rx.save(); mirrorS(rx); neckRelief(p); rx.restore();
	bandRelief(p); rx.save(); mirrorS(rx); bandRelief(p); rx.restore();
	footRelief(p); rx.save(); mirrorS(rx); footRelief(p); rx.restore();
	/* 雷纹 ground */
	const [, lx] = mkCanvas(TW, TH); bodyXf(lx);
	leiFill(lx, 0, 11.7, SQ, 22.2); leiFill(lx, 0, 22.9, SQ, 26.0, 0.5, 0.065); leiFill(lx, 0, 4.15, SQ, 10.05, 0.55, 0.07);
	for (const m of [false, true]) { lx.save(); if (m) mirrorS(lx); neckLeiClip(lx); lx.clip(); leiFill(lx, 0, 26.3, 6, 35, 0.5, 0.065); lx.restore(); }
	/* incisions (on relief tops) */
	const [, ix] = mkCanvas(TW, TH); bodyXf(ix); bellyIncise(ix, face);
	/* depressions: the hollow inside the horn's curl */
	const [, dx] = mkCanvas(TW, TH); bodyXf(dx); dx.filter = 'blur(6px)'; mfill(dx, ellPts(HORN_HOLLOW.s, HORN_HOLLOW.z, HORN_HOLLOW.rs, HORN_HOLLOW.rz)); dx.filter = 'none';
	/* AO under the horn (it overhangs) and round the eyes: the horn's footprint, blurred */
	const [, ax] = mkCanvas(TW, TH); bodyXf(ax); ax.filter = 'blur(14px)';
	mline(ax, HORN_SPINE.map(([s, z]) => [s, z] as P2), 2.5, false, 0.9); mfill(ax, ellPts(BELLY_EYE.s, BELLY_EYE.z, 1.45, 1.4), 0.8); ax.filter = 'none';
	const R = readGray(rx, TW, TH, HMAX), L = readGray(lx, TW, TH, 1), I = readGray(ix, TW, TH, 1), Dp = readGray(dx, TW, TH, 1), A = readGray(ax, TW, TH, 1);
	let H = new Float32Array(TW * TH);
	for (let i = 0; i < H.length; i++) { const r = R[i]; H[i] = r + L[i] * 0.05 * (1 - sstep(0.03, 0.1, r)) - I[i] * 0.085 * sstep(0.12, 0.25, r) - Dp[i] * 0.42; }
	H = boxBlur(H, TW, TH, 2, 2);
	const aoX = new Float32Array(TW * TH); for (let i = 0; i < aoX.length; i++) aoX[i] = 1 - A[i] * 0.55;
	BODY = {H, maps: {}, aoX};
	console.log('TIMING body height', Math.round(performance.now() - t0), 'ms');
	return BODY; };
/** bilinear height (cm) at body uv (u 0..1 folded quadrant, v 0..1 canvas order) */
export const sampleH = (u: number, v: number) => { const B = bodyHeight(), x = cl(u) * (TW - 1), y = cl(v) * (TH - 1), x0 = Math.floor(x), y0 = Math.floor(y), x1 = Math.min(TW - 1, x0 + 1), y1 = Math.min(TH - 1, y0 + 1), fx = x - x0, fy = y - y0;
	return lerp(lerp(B.H[y0 * TW + x0], B.H[y0 * TW + x1], fx), lerp(B.H[y1 * TW + x0], B.H[y1 * TW + x1], fx), fy); };
export const bodyMaps = (look: Look): Maps => { const B = bodyHeight(), key: Look = look === 'reveal' ? 'dirty' : look;
	if (B.maps[key]) return B.maps[key]!;
	const t0 = performance.now();
	/* horizontal cm per px depends on the radius at that height (the neck flares) */
	const m = finish(B.H, TW, TH, (y) => (SQ / TW) * Math.max(1, Rz(ZT - (y / TH) * ZT)[0] / R_REF), ZT / TH, key, 11, B.aoX, 1);
	B.maps[key] = m; console.log('TIMING body maps', key, Math.round(performance.now() - t0), 'ms'); return m; };

/* ============================== flange maps: domain r 6.5 … 19.5, z 0 … 39.5 ============================== */
export const FL = {r0: 6.5, r1: 19.5, z1: 39.5, W: 640, H: 1946};
const FLANGE: Partial<Record<Look, Maps>> = {};
export const flangeMaps = (look: Look): Maps => { const key: Look = look === 'reveal' ? 'dirty' : look; if (FLANGE[key]) return FLANGE[key]!;
	const {W, H: HH} = FL, k = W / (FL.r1 - FL.r0);
	const [, ix] = mkCanvas(W, HH); ix.setTransform(k, 0, 0, -k, -FL.r0 * k, FL.z1 * k);
	PLATES.forEach((pl) => pl.inc.forEach((ln) => mline(ix, ln, 0.11)));
	const I = readGray(ix, W, HH, 1), H = new Float32Array(W * HH);
	for (let i = 0; i < H.length; i++) H[i] = 0.2 - I[i] * 0.09;
	const m = finish(boxBlur(H, W, HH, 1, 1), W, HH, () => 1 / k, 1 / k, key, 23, undefined, 1);
	FLANGE[key] = m; return m; };

/* ============================== a tileable bronze (horns, eyes, the inside) ============================== */
const TILE: Partial<Record<string, Maps>> = {};
export const tileMaps = (look: Look, inner = false): Maps => { const key = (look === 'reveal' ? 'dirty' : look) + (inner ? 'i' : ''); if (TILE[key]) return TILE[key]!;
	const N = 512, H = new Float32Array(N * N), per = 8;
	for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const X = (x / N) * per, Y = (y / N) * per; H[y * N + x] = fbm(X, Y, 31, per) * 0.06 + vn(X * 8, Y * 8, 33, per * 8) * 0.02; }
	const m = finish(H, N, N, () => 4 / N, 4 / N, inner ? 'dirty' : (look === 'reveal' ? 'dirty' : look), inner ? 41 : 37, undefined, 0.9, 4);
	[m.albedo, m.orm, m.normal, m.heat].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true; });
	TILE[key] = m; return m; };

/* ============================== the inscription floor (内底铭文) ============================== */
type Stroke = {pts: P2[]; w: number; fill?: boolean};
const rnd = (i: number, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
/* bronze-script forms (from zun55h): 中 = a staff through an oval with streamers; 或 = 口 + ground line + 戈 */
const ZHONG: Stroke[] = [
	{w: 0.085, pts: [[0, -0.5], [0, 0.5]]},
	{w: 0.08, pts: [[-0.21, 0.0], [-0.2, -0.11], [0, -0.14], [0.2, -0.11], [0.21, 0.0], [0.2, 0.11], [0, 0.14], [-0.2, 0.11], [-0.21, 0.0]]},
	{w: 0.065, pts: [[0, -0.47], [0.11, -0.46], [0.18, -0.41], [0.29, -0.4]]}, {w: 0.065, pts: [[0, -0.36], [0.11, -0.35], [0.18, -0.3], [0.29, -0.29]]},
	{w: 0.065, pts: [[0, 0.3], [0.11, 0.31], [0.18, 0.36], [0.29, 0.37]]}, {w: 0.065, pts: [[0, 0.41], [0.11, 0.42], [0.18, 0.47], [0.29, 0.48]]}];
const HUO: Stroke[] = [
	{w: 0.075, pts: [[-0.36, -0.12], [-0.08, -0.13], [-0.07, 0.12], [-0.35, 0.13], [-0.36, -0.12]]}, {w: 0.07, pts: [[-0.42, 0.27], [-0.02, 0.25]]},
	{w: 0.085, pts: [[0.12, -0.46], [0.14, -0.1], [0.18, 0.22], [0.27, 0.46]]}, {w: 0.08, pts: [[-0.4, -0.3], [0.0, -0.31], [0.4, -0.35]]},
	{w: 0.06, pts: [[0.27, -0.46], [0.36, -0.42], [0.44, -0.47]]}, {w: 0.065, pts: [[0.27, 0.46], [0.38, 0.37]]}];
const ZHAI: Stroke[] = [
	{w: 0.075, pts: [[-0.42, -0.02], [-0.42, -0.24], [0, -0.43], [0.42, -0.24], [0.42, -0.02]]}, {w: 0.06, pts: [[0, -0.43], [0, -0.5]]},
	{w: 0.08, pts: [[0.03, -0.2], [0, 0.12], [0.02, 0.34], [0.22, 0.42]]}, {w: 0.07, pts: [[-0.2, 0.03], [0.22, -0.04]]}];
const ZI: Stroke[] = [-0.2, 0.2].flatMap((x) => [
	{w: 0.07, pts: [[x - 0.03, -0.46], [x, -0.36]] as P2[]},
	{w: 0.07, pts: Array.from({length: 13}, (_, i) => [x + 0.11 * Math.sin((i / 12) * 2 * Math.PI), -0.22 - 0.12 * Math.cos((i / 12) * 2 * Math.PI)] as P2)},
	{w: 0.07, pts: Array.from({length: 13}, (_, i) => [x + 0.13 * Math.sin((i / 12) * 2 * Math.PI), 0.1 - 0.14 * Math.cos((i / 12) * 2 * Math.PI)] as P2)},
	{w: 0.07, pts: [[x, 0.24], [x - 0.04, 0.46]] as P2[]}]);
/** a plausible bronze-script glyph that is not a readable character */
const pseudoGlyph = (seed: number): Stroke[] => {
	const r = (i: number) => rnd(seed * 13 + i, 5), S: Stroke[] = [], ww = () => 0.085 + r(S.length * 7 + 3) * 0.03;
	const curve = (a: P2, b: P2, bend: number): P2[] => { const mx = (a[0] + b[0]) / 2 - (b[1] - a[1]) * bend, my = (a[1] + b[1]) / 2 + (b[0] - a[0]) * bend;
		return Array.from({length: 7}, (_, i) => { const u = i / 6, m = 1 - u; return [m * m * a[0] + 2 * m * u * mx + u * u * b[0], m * m * a[1] + 2 * m * u * my + u * u * b[1]] as P2; }); };
	const comp = (x0: number, y0: number, w: number, h: number, k: number) => { const t = Math.floor(r(k) * 8), cx = x0 + w / 2, cy = y0 + h / 2, b = (r(k + 2) - 0.5) * 0.5;
		if (t === 0) S.push({w: ww(), pts: [[x0 + w * 0.18, cy - h * 0.28], [cx, cy - h * 0.36], [x0 + w * 0.84, cy - h * 0.26], [x0 + w * 0.8, cy + h * 0.28], [cx, cy + h * 0.34], [x0 + w * 0.2, cy + h * 0.26], [x0 + w * 0.18, cy - h * 0.28]]});
		else if (t === 1) S.push({w: ww(), pts: curve([cx + w * 0.05, y0 + h * 0.04], [cx - w * 0.08, y0 + h * 0.96], b)}, {w: ww(), pts: curve([x0 + w * 0.08, cy - h * 0.12], [x0 + w * 0.92, cy - h * 0.2], -b * 0.5)});
		else if (t === 2) S.push({w: ww(), pts: curve([cx, y0 + h * 0.1], [x0 + w * 0.12, y0 + h * 0.92], 0.18)}, {w: ww(), pts: curve([cx, y0 + h * 0.1], [x0 + w * 0.88, y0 + h * 0.92], -0.18)}, {w: ww(), pts: curve([x0 + w * 0.2, cy], [x0 + w * 0.8, cy - h * 0.05], 0.1)});
		else if (t === 3) S.push({w: ww(), pts: [[x0 + w * 0.82, y0 + h * 0.1], [x0 + w * 0.3, y0 + h * 0.22], [x0 + w * 0.22, cy], [x0 + w * 0.36, y0 + h * 0.8], [x0 + w * 0.86, y0 + h * 0.88]]}, {w: ww(), pts: curve([x0 + w * 0.3, cy], [x0 + w * 0.76, cy - h * 0.08], 0.15)});
		else if (t === 4) S.push({w: ww(), pts: curve([x0 + w * 0.15, y0 + h * 0.15], [cx, y0 + h * 0.58], 0.2)}, {w: ww(), pts: curve([x0 + w * 0.85, y0 + h * 0.12], [cx, y0 + h * 0.58], -0.2)}, {w: ww(), pts: curve([cx, y0 + h * 0.58], [cx + w * 0.04, y0 + h * 0.96], 0.1)});
		else if (t === 5) S.push({w: 0.12, fill: true, pts: [[cx - w * 0.16, cy - h * 0.22], [cx + w * 0.08, cy - h * 0.26], [cx + w * 0.18, cy], [cx + w * 0.02, cy + h * 0.24], [cx - w * 0.14, cy + h * 0.08]]}, {w: ww(), pts: curve([x0 + w * 0.1, y0 + h * 0.9], [x0 + w * 0.9, y0 + h * 0.86], 0.12)});
		else if (t === 6) S.push({w: ww(), pts: Array.from({length: 11}, (_, i) => [cx + w * 0.34 * Math.cos(Math.PI * (0.3 + 1.45 * i / 10)), cy + h * 0.38 * Math.sin(Math.PI * (0.3 + 1.45 * i / 10))] as P2)}, {w: ww(), pts: curve([cx - w * 0.1, cy - h * 0.05], [cx + w * 0.22, cy + h * 0.02], 0.1)});
		else S.push({w: ww(), pts: [[x0 + w * 0.3, y0 + h * 0.05], [x0 + w * 0.7, y0 + h * 0.3], [x0 + w * 0.28, y0 + h * 0.55], [x0 + w * 0.72, y0 + h * 0.8], [x0 + w * 0.4, y0 + h * 0.98]]}); };
	const lay = Math.floor(r(0) * 4);
	if (lay === 0) { comp(-0.46, -0.48, 0.92, 0.96, 10); comp(-0.3, -0.22, 0.6, 0.52, 20); }
	else if (lay === 1) { comp(-0.5, -0.48, 0.48, 0.96, 10); comp(0.02, -0.48, 0.48, 0.5, 20); comp(0.02, 0.0, 0.48, 0.48, 40); }
	else if (lay === 2) { comp(-0.44, -0.5, 0.88, 0.48, 10); comp(-0.44, 0.0, 0.88, 0.5, 20); }
	else { comp(-0.5, -0.48, 0.48, 0.48, 10); comp(0.02, -0.48, 0.48, 0.48, 20); comp(-0.42, 0.02, 0.84, 0.48, 30); }
	return S; };
/** 12 columns read right → left, 122 characters; 宅兹中或 at rows 3–6 of column 7 from the right */
const COL_LEN = [11, 11, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];
type Gl = {u: number; v: number; s: number; strokes: Stroke[]; key: '' | 'zhong' | 'huo' | 'zhai' | 'zi'};
export const INSCR: Gl[] = (() => { const out: Gl[] = [], colW = 0.86, rowH = 0.9;
	COL_LEN.forEach((n, c) => { for (let k = 0; k < n; k++) {
		const u = (5.5 - c) * colW, v = (k - (n - 1) / 2) * rowH * (n === 11 ? 0.93 : 1);
		let key: Gl['key'] = '', strokes: Stroke[];
		if (c === 6 && k === 3) { key = 'zhai'; strokes = ZHAI; } else if (c === 6 && k === 4) { key = 'zi'; strokes = ZI; }
		else if (c === 6 && k === 5) { key = 'zhong'; strokes = ZHONG; } else if (c === 6 && k === 6) { key = 'huo'; strokes = HUO; }
		else strokes = pseudoGlyph(c * 31 + k * 7 + 3);
		out.push({u, v: v + (rnd(c * 17 + k, 9) - 0.5) * 0.06, s: (key === 'zhong' || key === 'huo' ? 0.86 : 0.76) * (1 + (rnd(c * 5 + k, 4) - 0.5) * 0.12), strokes, key}); } });
	return out; })();
export const FLOOR_HALF = 6.8;   // the floor texture covers −6.8 … 6.8 cm
export type FloorTex = {albedo: THREE.DataTexture; orm: THREE.DataTexture; normal: THREE.DataTexture; glow: THREE.DataTexture; soil: THREE.DataTexture; soilAlb: THREE.DataTexture};
let FLOOR: FloorTex | null = null;
export const floorMaps = (): FloorTex => { if (FLOOR) return FLOOR;
	const N = 1024, k = N / (2 * FLOOR_HALF);
	const xf = (x: C2) => x.setTransform(k, 0, 0, k, N / 2, N / 2);   /* (a right, b down) cm → px */
	const [, gx] = mkCanvas(N, N); xf(gx); const [, kx] = mkCanvas(N, N); xf(kx);
	const draw = (x: C2, g: Gl) => g.strokes.forEach((st) => { const pts = st.pts.map(([a, b]) => [g.u + a * g.s, g.v + b * g.s] as P2);
		if (st.fill) mfill(x, pts); else { x.globalCompositeOperation = 'source-over'; x.strokeStyle = '#fff'; x.lineWidth = st.w * g.s * 1.05; x.lineCap = 'round'; x.lineJoin = 'round';
			x.beginPath(); pts.forEach((q, i) => (i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]))); x.stroke(); } });
	INSCR.forEach((g) => { draw(gx, g); if (g.key === 'zhong' || g.key === 'huo') draw(kx, g); });
	const G = readGray(gx, N, N, 1), K = readGray(kx, N, N, 1), H = new Float32Array(N * N);
	for (let i = 0; i < H.length; i++) H[i] = 0.2 - G[i] * 0.12;
	const m = finish(boxBlur(H, N, N, 1, 1), N, N, () => 1 / k, 1 / k, 'dirty', 51, undefined, 1.4);
	/* the glyph troughs keep a little dark soil even when clean */
	const alb = m.albedo.image.data as Uint8Array; for (let i = 0; i < N * N; i++) { const g = G[i]; alb[i * 4] *= 1 - g * 0.45; alb[i * 4 + 1] *= 1 - g * 0.42; alb[i * 4 + 2] *= 1 - g * 0.4; }
	m.albedo.needsUpdate = true;
	const KB = boxBlur(K, N, N, 2, 2), glow = new Uint8Array(N * N * 4);
	for (let i = 0; i < N * N; i++) { const v = cl(K[i] * 0.85 + KB[i] * 0.6); glow[i * 4] = v * 255; glow[i * 4 + 1] = v * 255; glow[i * 4 + 2] = v * 255; glow[i * 4 + 3] = 255; }
	/* soil crust (alpha by threshold: alphaTest = reveal) */
	const soil = new Uint8Array(N * N * 4), soilAlb = new Uint8Array(N * N * 4);
	for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = y * N + x, X = x / k, Y = y / k, v = cl(fbm(X * 0.5, Y * 0.5, 61) * 1.25 - 0.12 + (vn(X * 3, Y * 3, 62) - 0.5) * 0.12), f = vn(X * 6, Y * 6, 63);
		soil[i * 4] = soil[i * 4 + 1] = soil[i * 4 + 2] = v * 255; soil[i * 4 + 3] = 255;
		const g = vn(X * 14, Y * 14, 64) * 0.6 + vn(X * 31, Y * 31, 65) * 0.4, c = mix3(hx('#3e3225'), hx('#7a6547'), cl(f * 0.6 + g * 0.6 - 0.1)), e = 0.55 + 0.45 * cl((v - 0.35) * 2.5);
		soilAlb[i * 4] = c[0] * e; soilAlb[i * 4 + 1] = c[1] * e; soilAlb[i * 4 + 2] = c[2] * e; soilAlb[i * 4 + 3] = 255; }
	FLOOR = {albedo: m.albedo, orm: m.orm, normal: m.normal, glow: dataTex(glow, N, N, true), soil: dataTex(soil, N, N, false), soilAlb: dataTex(soilAlb, N, N, true)};
	return FLOOR; };
