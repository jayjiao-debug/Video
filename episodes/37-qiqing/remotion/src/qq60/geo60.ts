/* ep60 geometry kit: 2D affine matrices (SVG order a b c d e f), a corner-aware smooth spline for authoring shapes as point lists,
   and the look-A pigment palette (Egyptian tomb painting: red & yellow ochre, Egyptian blue, malachite green, carbon black, gypsum white). */
export type V = [number, number];
export type M = [number, number, number, number, number, number];
export const RAD = Math.PI / 180;
export const mul = (m: M, n: M): M => [
	m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
	m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
	m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
export const T = (x: number, y: number): M => [1, 0, 0, 1, x, y];
/** SVG rotation (clockwise on screen for +deg) */
export const R = (d: number): M => { const c = Math.cos(d * RAD), s = Math.sin(d * RAD); return [c, s, -s, c, 0, 0]; };
export const Sc = (x: number, y = x): M => [x, 0, 0, y, 0, 0];
export const I: M = [1, 0, 0, 1, 0, 0];
export const chain = (...ms: M[]) => ms.reduce(mul, I);
export const ap = (m: M, p: V): V => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
/** world rotation of a frame, degrees (SVG sense) */
export const rot = (m: M) => Math.atan2(m[1], m[0]) / RAD;
export const mx = (m: M) => `matrix(${m.map((v) => +v.toFixed(4)).join(',')})`;
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const lv = (a: V, b: V, u: number): V => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
export const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const sm = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
export const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));

/** a point; a third element 1 makes it a corner (no smoothing through it) */
export type Pt = [number, number] | [number, number, number];
const f3 = (v: number) => +v.toFixed(3);
/** smooth Catmull-Rom spline through the points (closed by default) as an SVG path */
export const sp = (pts: Pt[], closed = true, k = 0.18): string => {
	const n = pts.length, g = (i: number) => (closed ? pts[((i % n) + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
	let d = `M${f3(pts[0][0])} ${f3(pts[0][1])}`;
	for (let i = 0; i < (closed ? n : n - 1); i++) {
		const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
		const c1 = p1[2] ? p1 : [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
		const c2 = p2[2] ? p2 : [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
		d += `C${f3(c1[0])} ${f3(c1[1])} ${f3(c2[0])} ${f3(c2[1])} ${f3(p2[0])} ${f3(p2[1])}`;
	}
	return closed ? d + 'Z' : d;
};
/** straight polygon */
export const poly = (pts: V[], closed = true) => pts.map((p, i) => `${i ? 'L' : 'M'}${f3(p[0])} ${f3(p[1])}`).join('') + (closed ? 'Z' : '');
export const tf = (pts: Pt[], m: M): Pt[] => pts.map((p) => { const q = ap(m, [p[0], p[1]]); return p[2] ? [q[0], q[1], 1] : q; });

/* ---------- look A pigments ---------- */
export const PAL = {
	plaster: '#E8D4AA', plasterHi: '#F1E2BF', plasterLo: '#D3B98A',
	ink: '#2A1912', line: '#3B2216',
	skinM: '#B5502C', skinM2: '#9C4022', skinF: '#E3A94E', skinO: '#2F8E62', skinO2: '#24714E',
	jackal: '#221E21', jackal2: '#3A3438', ibis: '#23252B', ibis2: '#3C3F47', falcon: '#3F7186', falcon2: '#2C5466', baboon: '#6F9488', baboon2: '#557A6F',
	croc: '#5A8A45', croc2: '#456E35', lion: '#DCA444', lion2: '#C2862C', hippo: '#B3552F', hippo2: '#94431F',
	wig: '#2A4C9A', wig2: '#1E3A7C', wigH: '#1E1A1B',
	linen: '#F8F3E7', linen2: '#E6DCC6', gold: '#ECB637', gold2: '#C98C1E', goldHi: '#F8D97A',
	blue: '#2E58A6', blue2: '#3F75BC', turq: '#36A39B', green: '#3A9160', red: '#B8371F', red2: '#962A16',
	white: '#F8F3E7', black: '#1F1B1C', eye: '#FBF8F0', wood: '#D9A23E', mat: '#C49A55', mat2: '#A87C3C',
	sky: '#1D2E6E', star: '#F2C649',
};
export type Role = keyof typeof PAL;
