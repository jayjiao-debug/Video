import {lerp, cl, rnd} from '../qq50/kit50';
/* ep53 · SWORDDESIGN — the corrected sword spec (candidate to replace swordspec53s once the owner picks a look).
   ONE geometry, measured from the museum photos (tasks/ep53-sworddesign/out/reference_notes.md); the three design options
   A / B / C are only LOOKS (colours, contrast, line weights, wear) on top of it: see VARIANTS.
   Units: mm. a = along the axis from the pommel's end face (a = 0) to the tip (a = 556); s = a − A.blade0; w = across the
   blade (+ = the side flat views call "up"). Facts: 55.6 cm overall, blade 47.3 cm, grip (茎) 8.4 cm, guard 5 cm wide,
   blade 4.6 cm wide (B1/B2, 澎湃《国家宝藏》); pommel 11 concentric rings (B6); blue glass front / turquoise back (B5). */
export const A = {L: 556, pom1: 3, grip0: 8, grip1: 86, guard0: 82, guardC: 86, guard1: 96.5, apex: 103.5, blade0: 97};
export const LBLADE = A.L - A.blade0;                      // 459 (the first ~7 mm hide under the guard's ∧)
/** the hilt: grip ⌀15 (photos: pommel ≈ 2.7× the grip), pommel ⌀41, two low hoops (箍) a third and two thirds along */
export const R_GRIP = 7.5, R_POM = 20.5, R_HOOP = 8.3, HOOPS = [36, 61], HOOP_HL = 1.3;
/** the pommel's side profile [a, r]: a thin dish turned outward, its back flaring into the grip */
export const POM_PROF: [number, number][] = [[0, R_POM - 0.6], [0.4, R_POM], [2.2, R_POM], [3.0, 19.2], [4.0, 15.2], [5.6, 11.2], [7.4, 8.6], [9, R_GRIP + 0.2]];

/* ---------- blade outline (half-width, from the near-frontal photo 2019-06-15 05, scaled to 46 mm at the guard) ---------- */
const HW_KNOTS: [number, number][] = [[0, 23.0], [60, 23.0], [130, 22.4], [200, 21.6], [260, 20.4], [310, 18.4], [340, 16.9], [372, 16.0], [400, 14.6], [425, 12.2], [443, 8.8], [454, 4.6], [459, 0]];
/** monotone cubic (Fritsch–Carlson) through the knots, so the edge has no wobble */
const mono = (K: [number, number][]) => { const n = K.length, d = K.slice(0, -1).map((k, i) => (K[i + 1][1] - k[1]) / (K[i + 1][0] - k[0])), m = K.map((_, i) => i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2);
	for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; } const al = m[i] / d[i], be = m[i + 1] / d[i], t = al * al + be * be; if (t > 9) { const k = 3 / Math.sqrt(t); m[i] = k * al * d[i]; m[i + 1] = k * be * d[i]; } }
	return (x: number) => { if (x <= K[0][0]) return K[0][1]; if (x >= K[n - 1][0]) return K[n - 1][1]; let i = 0; while (x > K[i + 1][0]) i++;
		const h = K[i + 1][0] - K[i][0], t = (x - K[i][0]) / h, t2 = t * t, t3 = t2 * t;
		return (2 * t3 - 3 * t2 + 1) * K[i][1] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * K[i + 1][1] + (t3 - t2) * h * m[i + 1]; }; };
const hwRaw = mono(HW_KNOTS);
/** blade half-width (mm) at s mm from the blade base */
export const hwS = (s: number) => s >= LBLADE ? 0 : Math.max(0, hwRaw(Math.max(0, s)));
/** the plain polished edge band (锷), mm: ≈4.5 mm, narrowing toward the point */
export const edgeS = (s: number) => 4.5 * cl(hwS(s) / 12, 0.45, 1);

/* ---------- the lattice (菱形暗格纹): square diamonds, stars at the nodes ----------
   Photos: cells are rhombi with equal diagonals ≈12.4 mm (≈3 across the patterned field, ≈37 along the blade), the SAME size
   from guard to tip. Each cell = a pale rounded diamond inside a thin pale frame; the dark between them carries an 8-point
   star at every node. Nodes sit in rows at w = ±Δ/2, ±3Δ/2 … (none on the ridge), alternate rows offset by half a cell. */
export const LAT = {P: 12.4, D: 6.2, s0: 2};
export type Node = {s: number; w: number; i: number; j: number};
const latJit = (i: number, j: number, k: number) => (rnd(i * 97 + j * 13 + 7, k) - 0.5);
/** every lattice node over s0…s1 (with a margin); cells are centred at the same rows, half a cell along from the nodes */
export const latNodes = (s0 = -LAT.P, s1 = LBLADE + LAT.P, jit = 0.03): Node[] => { const out: Node[] = [];
	for (let j = -5; j <= 4; j++) { const w = (j + 0.5) * LAT.D, off = ((j % 2) + 2) % 2 ? LAT.P / 2 : 0;
		for (let i = Math.floor((s0 - LAT.s0) / LAT.P) - 1; i <= Math.ceil((s1 - LAT.s0) / LAT.P) + 1; i++) {
			const s = LAT.s0 + i * LAT.P + off; out.push({s: s + latJit(i, j, 1) * LAT.P * jit, w: w + latJit(i, j, 2) * LAT.D * jit, i, j}); } }
	return out; };
export const latCellCentres = (s0?: number, s1?: number) => latNodes(s0, s1, 0).map((n) => ({...n, s: n.s + LAT.P / 2}));
/** a diamond of diagonals P·sc (along) and 2D·sc (across) at (s, w), corner rounding r (0–1) → [s, w] points */
export const diamond = (s: number, w: number, sc: number, round = 0.25): [number, number][] => { const ha = LAT.P / 2 * sc, hw = LAT.D * sc, pts: [number, number][] = [];
	const C: [number, number][] = [[s + ha, w], [s, w + hw], [s - ha, w], [s, w - hw]];
	for (let k = 0; k < 4; k++) { const p = C[k], q = C[(k + 1) % 4], o = C[(k + 3) % 4];
		pts.push([lerp(p[0], o[0], round / 2), lerp(p[1], o[1], round / 2)], [lerp(p[0], q[0], round / 2), lerp(p[1], q[1], round / 2)]); }
	return pts; };
/** an 8-point star at a node: long spikes along the axis and across it (into the gaps between frames), short ones on the diagonals */
export const star = (s: number, w: number, rLong: number, rShort: number, rIn: number): [number, number][] => Array.from({length: 16}, (_, k) => {
	const th = k * Math.PI / 8, r = k % 2 ? rIn : (k % 4 === 0 ? rLong : rShort); return [s + r * Math.cos(th), w + r * Math.sin(th)] as [number, number]; });

/* ---------- the guard (剑格): a dark bronze block, its blade side a ∧ peaked on the ridge, its grip side bowed ----------
   photos 2019-06-15 03 (front, from the blade end) and Flickr 9873558124/9873668163 (side): 5 cm wide, a little wider than
   the blade, corners drooping toward the pommel; a 兽面 relief of scrolls; on each half a round "eye" cell and a comma cell
   inlaid (blue glass on the front face, turquoise on the back face). */
const qb = (p0: [number, number], c: [number, number], p1: [number, number], n: number) => Array.from({length: n}, (_, k) => { const u = (k + 1) / n; return [lerp(lerp(p0[0], c[0], u), lerp(c[0], p1[0], u), u), lerp(lerp(p0[1], c[1], u), lerp(c[1], p1[1], u), u)] as [number, number]; });
const HALF_G: [number, number][] = [[A.guardC, 0], [A.guardC, 8.4], ...qb([A.guardC, 8.4], [A.guardC - 0.4, 14], [A.guard0 + 0.2, 20.5], 6), ...qb([A.guard0 + 0.2, 20.5], [A.guard0 - 0.6, 25], [A.guard0 + 1.8, 25], 4),
	[A.guard1 - 1.2, 25], ...qb([A.guard1 - 1.2, 25], [A.guard1, 25], [A.guard1 + 0.4, 24], 3), ...qb([A.guard1 + 0.4, 24], [A.guard1 + 4.6, 12.6], [A.apex, 0], 6)];
/** the guard outline on the face, [a, w], closed */
export const GUARD_OUT: [number, number][] = [...HALF_G, ...HALF_G.slice(1, -1).reverse().map(([a, w]) => [a, -w] as [number, number])];
/** the blade-side edge of the guard: the a where the blade comes out at w */
export const guardEdgeA = (w: number) => { const aw = Math.min(25, Math.abs(w)); return lerp(A.apex, A.guard1 + 0.4, aw / 24); };
/** relief scrolls of the beast face (one half, side = ±1), as filled [a, w] polygons: a brow scroll from the apex outward over
    the eye, a cheek C-scroll under it, a hooked jaw scroll at the corner, and the central nose ridge */
export const guardRelief = (side: number): [number, number][][] => { const S = (p: [number, number][]) => p.map(([a, w]) => [a, side * w] as [number, number]);
	return [
		S([[101.2, 1.2], [99.2, 6], [97.6, 10.5], [97.8, 14.5], [96.6, 19.2], [95.2, 21.6], [94.6, 19.5], [95.7, 15.5], [95.5, 11], [96.6, 6.5], [98.6, 1.2]]),            // brow
		S([[90.4, 2.2], [91.2, 7.0], [90.2, 11.4], [87.4, 12.6], [86.2, 10.6], [87.4, 10.0], [88.8, 9.0], [89.0, 5.6], [88.0, 2.2]]),                                      // cheek C
		S([[86.2, 13.2], [88.6, 15.4], [89.0, 19.6], [87.8, 22.6], [85.0, 23.2], [84.2, 21.4], [86.4, 20.6], [86.8, 17.4], [85.2, 15.2]]),                              // jaw hook
		S([[A.guardC + 0.6, 0.9], [100.4, 0.9], [100.4, 0], [A.guardC + 0.6, 0]])];                                                                                         // nose ridge
};
/** inlay cells of one half: the round eye and the comma (glass on the front, turquoise on the back) */
export const EYE = {a: 92.2, w: 16.4, r: 3.2};
export const commaCell = (side: number): [number, number][] => Array.from({length: 20}, (_, k) => { const t = k / 20 * 2 * Math.PI, r = 2.2 * (1 + 0.45 * Math.cos(t));
	return [93.0 + r * Math.sin(t) * 0.9, side * (5.2 + r * Math.cos(t) * 0.85)] as [number, number]; });

/* ---------- the inscription (C1): 8 bird-script characters, pale on the dark lattice ----------
   Two columns of four along the ridge, ≈7 mm either side of it; each glyph ≈11 mm long and ≈6 mm wide, centres ≈22 mm apart,
   the first ≈30 mm in front of the guard, the column reading from the TIP end toward the guard: w < 0 column
   越 王 鸠 浅, w > 0 column 自 乍(作) 用 剑 (photos 2019-06-15 02/03, Flickr 9873558124). */
export const MARK = {s1: 33, step: 22.5, w: 7.2, len: 11.2, wid: 6.2};
/** centre [s, w] of glyph n (0 = nearest the guard) in column side (−1: 越王鸠浅, +1: 自作用剑) */
export const markAt = (side: number, n: number): [number, number] => [MARK.s1 + n * MARK.step, side * MARK.w];
/** simplified hand traces of the eight glyphs (by eye from the museum photos; not a rubbing), stroke paths in a box
    x 0…60, y 0…110, y DOWN = from the tip end toward the guard. Index: [column −1: 越 王 鸠 浅] then [column +1: 自 作 用 剑]. */
export const GLYPHS: Record<string, string[]> = {
	越: ['M14,8 q-8,6 -2,14 q8,8 0,16 q-6,8 4,14', 'M8,6 l6,-2 l3,5', 'M10,52 q10,10 2,24 q-6,10 4,20', 'M34,6 v86 q0,10 -8,12', 'M24,26 h28', 'M36,40 q12,14 20,40 m-6,-28 l-14,12', 'M48,8 l6,8'],
	王: ['M10,10 q-6,8 2,14 q6,6 -2,14', 'M6,8 l6,-3 l2,6', 'M10,48 q8,12 -2,26 q-6,8 4,16 q8,6 2,14', 'M26,18 h28', 'M28,52 h24', 'M24,92 h32', 'M40,18 v74', 'M22,92 q-4,8 4,12'],
	鸠: ['M12,6 q-8,10 0,18 q6,8 -2,18 q-6,10 4,18 q8,8 -2,20', 'M7,6 l7,-2 l2,6', 'M14,84 q8,6 2,16', 'M32,14 h20 q6,0 4,10 q-4,30 -2,52 q2,14 -10,18', 'M40,14 q-4,30 -12,50', 'M30,74 q10,-6 18,2'],
	浅: ['M10,8 q-6,10 2,18 q6,8 -2,18 q-6,10 4,18', 'M6,6 l6,-2 l2,6', 'M10,80 q8,8 0,20', 'M30,10 v84', 'M44,6 v90', 'M22,22 h32', 'M22,44 h32', 'M22,66 h32', 'M48,30 l8,-6', 'M48,56 l8,-6', 'M30,94 q-6,8 -10,10'],
	自: ['M18,6 l4,12 l8,-14 l8,14 l4,-12', 'M16,22 q14,-8 28,0 v48 q-14,8 -28,0 z', 'M18,38 h24', 'M18,52 h24', 'M22,74 q-6,16 -10,30', 'M38,74 q6,16 10,30'],
	作: ['M30,6 q-14,6 -10,20 q4,12 -8,18', 'M10,30 q8,4 6,12', 'M30,24 v80', 'M30,40 q14,-4 22,4', 'M30,62 q14,-4 22,4', 'M24,94 q-10,6 -14,14', 'M44,10 l6,6'],
	用: ['M12,12 q-6,6 0,12', 'M16,24 q-2,40 -6,80', 'M16,24 q18,-6 32,0 q2,40 -2,78 q-2,6 -8,4', 'M18,48 h28', 'M18,72 h28', 'M32,24 v80'],
	剑: ['M14,4 l-10,18 h20 z', 'M8,30 h12', 'M14,22 v40', 'M6,48 l4,6 m10,-6 l-4,6', 'M6,64 h16', 'M40,4 l-14,18 h28 z', 'M30,28 h8 v8 h-8 z', 'M44,28 h8 v8 h-8 z', 'M40,40 v18', 'M28,62 h26', 'M34,62 q-6,20 -12,40', 'M46,62 q6,20 12,40', 'M14,64 v40 q-4,4 -8,2'],
};
export const COLS: Record<number, string[]> = {[-1]: ['浅', '鸠', '王', '越'], [1]: ['剑', '用', '作', '自']};   // n = 0 nearest the guard

/* ---------- the looks ---------- */
export type Look = {
	key: string;
	blade: {lit: string; body: string; dark: string};       // the metal under the lattice (lit half w > 0 / shade half)
	edge: {lit: string; dark: string};                      // the plain edge band (锷)
	ink: string; inkOp: number;                             // the dark of the lattice
	pale: string; paleOp: number;                           // the pale diamonds and their frames
	frame: number;                                          // frame stroke width, mm (0 = no frame)
	star: [number, number, number];                         // star radii (long, short, inner), mm
	cellSc: number;                                         // pale diamond size (fraction of the cell)
	wear: number;                                           // 0–1: mottling / fading of the lattice near the guard
	ridge: {hi: string; lo: string; w: number};
	mark: {col: string; w: number; glow: number};           // inscription stroke colour, width (box units), dark halo
	hilt: {deep: string; body: string; lit: string; spec: string};   // the near-black patinated bronze of grip, pommel, guard
	relief: {fill: string; lit: string; recess: string};    // the guard's raised scrolls
	glass: {deep: string; body: string; hi: string};        // front-face inlay
	turq: {deep: string; body: string; hi: string};         // back-face inlay
	outline: {col: string; w: number};                      // silhouette line, px
	sheen: number;                                          // a soft specular wash along the blade
	rim: number;                                            // a warm rim light on the silhouette (for small screens)
};
export const VARIANTS: Record<'A' | 'B' | 'C', Look> = {
	/* A · museum-faithful: the olive brass-grey "黄黑色" of the photos, charcoal lattice, mottled and faded round the inscription */
	A: {key: 'A', blade: {lit: '#9C9068', body: '#82784F', dark: '#62593C'}, edge: {lit: '#B4A67A', dark: '#8C8060'}, ink: '#2A2922', inkOp: 0.9,
		pale: '#A49870', paleOp: 0.9, frame: 0.35, star: [3.8, 2.1, 1.3], cellSc: 0.62, wear: 1, ridge: {hi: '#D8CCA2', lo: '#3A3628', w: 0.7},
		mark: {col: '#ECE6D2', w: 3.2, glow: 0}, hilt: {deep: '#0E0F0B', body: '#23251D', lit: '#4C4D3E', spec: '#86846C'},
		relief: {fill: '#57584A', lit: '#8A8872', recess: '#0B0C09'}, glass: {deep: '#123E7A', body: '#2668B8', hi: '#7FB2EA'}, turq: {deep: '#1D5A55', body: '#3B9A8C', hi: '#8AD6C6'},
		outline: {col: '#141410', w: 1}, sheen: 0.12, rim: 0},
	/* B · clean hero: the same parts, warmer and brighter metal, bolder lattice and stars, white inscription with a dark halo,
	   a rim light so the silhouette holds on a phone at 30 % frame width */
	B: {key: 'B', blade: {lit: '#E2C682', body: '#C8A862', dark: '#957A44'}, edge: {lit: '#FFF0C2', dark: '#E0C88E'}, ink: '#1B1610', inkOp: 1,
		pale: '#F2DC9E', paleOp: 0.95, frame: 0.45, star: [4.0, 2.3, 1.45], cellSc: 0.6, wear: 0.15, ridge: {hi: '#FFF6D8', lo: '#2A2014', w: 0.9},
		mark: {col: '#FFFFFF', w: 4.2, glow: 0.7}, hilt: {deep: '#0B0C0A', body: '#24261F', lit: '#5E5E4C', spec: '#B4B096'},
		relief: {fill: '#5E5F4E', lit: '#A6A286', recess: '#09090A'}, glass: {deep: '#0E46A8', body: '#2A7BEA', hi: '#A8D4FF'}, turq: {deep: '#156A5E', body: '#2FB09C', hi: '#9AF0DC'},
		outline: {col: '#0A0806', w: 1.6}, sheen: 0.22, rim: 0.8},
	/* C · textbook gold: how the sword is remembered — the warm gold of the spot-lit museum / textbook photo, a near-black star
	   lattice, a black hilt with a clearly ringed pommel, vivid blue glass, white bird script */
	C: {key: 'C', blade: {lit: '#E8C474', body: '#D2A352', dark: '#A27434'}, edge: {lit: '#FBE2A4', dark: '#E2BC72'}, ink: '#20160C', inkOp: 0.95,
		pale: '#F0CF84', paleOp: 0.85, frame: 0.4, star: [3.9, 2.2, 1.35], cellSc: 0.62, wear: 0.6, ridge: {hi: '#FFF2C8', lo: '#3A2612', w: 0.8},
		mark: {col: '#FFF8E6', w: 3.8, glow: 0.45}, hilt: {deep: '#0A0B0A', body: '#1F231F', lit: '#565A4C', spec: '#A6A48A'},
		relief: {fill: '#565B4C', lit: '#96967C', recess: '#080908'}, glass: {deep: '#0C3E9C', body: '#2474E0', hi: '#9CCAFF'}, turq: {deep: '#13645A', body: '#2CA894', hi: '#92E8D4'},
		outline: {col: '#120C06', w: 1.2}, sheen: 0.2, rim: 0.35},
};
