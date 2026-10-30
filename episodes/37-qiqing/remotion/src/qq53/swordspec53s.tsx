import {lerp, cl, rnd} from '../qq50/kit50';
/* ep53 · THE sword's one specification (facts B1–B6, B10, C1) — v3.1: the owner's design C 「课本金」 (SWORDDESIGN frame 2,
   ported from swordspec53x: geometry measured from the museum photos, episodes/53-goujian/sword_reference_notes.md, + look C).
   Every renderer (props53.Sword / blade53c.BladeFlat via flat53s, sword3d.Sword3D, land53.BladeLand, macro53.BladeMacro,
   macrob53c.BladeMacroC, the blooms, face53) reads its outline, lattice, guard, hilt, pommel, inscription and colours from here.
   Units: mm. a = along the axis from the pommel's end face (a = 0) to the tip (a = 556); s = a − A.blade0 = from the blade base;
   w = across the blade (+ = the side the flat views call "up"); z = out of the front face (the blue-glass face).

   - overall 55.6 cm, blade 47.3, grip (茎) 8.4, guard 5 cm wide, blade 4.6 cm at the guard (B1/B2);
   - the hilt is near-black greenish bronze: pommel (剑首) a thin outturned dish ⌀41 (≈ 2.7 × the grip) with 11 rings in its end
     face (B6, face53); round grip ⌀15 with two low thin rings (箍) a third and two thirds along;
   - guard (剑格): a dark block, its blade-side edge a ∧ peaked on the ridge toward the tip, its grip-side corners drooping toward
     the pommel; a beast mask of rounded raised scrolls; a round "eye" and a comma cell each side, blue glass on the front face,
     turquoise on the back (B5);
   - blade: widest at the guard, tapering steadily, a slight narrowing in the front third, a long gradual point; a raised ridge;
     plain edge bands ≈4.5 mm; square diamonds ≈12.4 mm, ≈3 across, the same size to the tip, each pale diamond in a thin pale
     frame, a dark 8-point star at every crossing (B4);
   - the 8 bird-script characters 越王鸠浅 / 自作用剑 (C1): pale, ≈11 mm tall, ≈22 mm apart, from ≈3 cm off the guard over ≈10 cm,
     two columns of four, ON the pattern (no plain zone). */
/** where a 3-D sword lies: pommel end face at (x0, ya, z0), the axis along dir·x, the front (blue-glass) face up (+z) */
export type SwordPose = {x0: number; ya: number; z0: number; dir: 1 | -1};
export const A = {L: 556, pom1: 3, grip0: 8, grip1: 86, guard0: 82, guardC: 86, guard1: 96.5, apex: 103.5, blade0: 97};
export const LBLADE = A.L - A.blade0;                      // 459 (the first ~7 mm hide under the guard's ∧)
/** the hilt: grip ⌀15, pommel ⌀41, two low hoops (箍) a third and two thirds along */
export const R_GRIP = 7.5, R_POM = 20.5, R_HOOP = 8.3, HOOPS = [36, 61], HOOP_HL = 1.3;
/** the pommel's side profile [a, r]: a thin dish turned outward, its back flaring into the grip */
export const POM_PROF: [number, number][] = [[0, R_POM - 0.6], [0.4, R_POM], [2.2, R_POM], [3.0, 19.2], [4.0, 15.2], [5.6, 11.2], [7.4, 8.6], [9, R_GRIP + 0.2]];

/* ---------- blade outline (half-width, from the near-frontal photo, 46 mm at the guard) ---------- */
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
/** the plain polished edge band (锷), mm: ≈4.5 mm, narrowing toward the point (a function of the half-width only) */
export const edgeOfHw = (hw: number) => 4.5 * cl(hw / 12, 0.45, 1);
export const edgeS = (s: number) => edgeOfHw(hwS(s));
/** the face's height above the axis plane: a shallow roof, the ridge on the axis, the edge bands bevelled */
export const RIDGE_H = 3.4, EDGE_H = 0.6;
export const faceZ = (s: number, w: number) => { const hw = Math.max(0.01, hwS(s)), st = edgeS(s), aw = Math.abs(w), a = Math.min(1, aw / hw);
	const bev = aw > hw - st ? 0.8 * (aw - (hw - st)) / st : 0;
	return EDGE_H + RIDGE_H * Math.pow(1 - a, 1.12) - bev; };

/* ---------- the lattice (菱形暗格纹): square diamonds, a dark star at every crossing ----------
   Cells are square diamonds (both diagonals A = W = 12.4 mm), the same size from guard to tip, laid on (s, w): cell (p, q),
   p + q even, centre s = (p + 1)/2·A, w = q/2·W; its corners are the crossings (nodes) latCorner(i, j), i = (p + q)/2, j = (p − q)/2
   (every node is corner 0 of exactly one cell). Look C: the dark ground (ink) shows between the cells; each cell = a pale diamond
   (cellQuad(c, LAT.inSc)) inside a thin pale frame (cellQuad(c, LAT.frSc), stroke LAT.frame); a dark 8-point star (latStar) on
   every node. All cells carry a pale diamond (`pale` stays true; kept for old callers). */
export const LAT = {A: 12.4, W: 12.4, jit: 0.03,
	ink: '#20160C', inkOp: 0.95, pale: '#F0CF84', paleOp: 0.85, frame: 0.4, inSc: 0.62, frSc: 0.73, star: [3.9, 2.2, 1.35] as [number, number, number],
	/* compatibility (old two-tone callers, e.g. shadow53g): line, lineIn, coreSc, the old tones mapped onto look C;
	   line (mm): an outline along the node-to-node edges this wide covers the dark band between neighbouring frames */
	line: 2.2, lineIn: 0.3, coreSc: 0.3, gold: '#D2A352', paleDk: '#A27434', goldDk: '#7A5424', paleHi: '#F6DC9C'};
/** the macro views (M1 → T2) look at the blade from s = MACRO_S0 on (4 cells past the base): macro u = s − s0. The inscription now
    runs to s ≈ 106 (design C), so the macro views draw the characters too (macro53 / macrob53c), ON the pattern. 4 cells keeps
    macro53c's M2 subject cell (p 12, q 2: s 80.6) in front of the lens (u 31, as before). */
export const MACRO_S0 = 4 * LAT.A;
export const latCorner = (i: number, j: number): [number, number] => [(i + j) / 2 * LAT.A + (rnd(i * 131 + j, 5) - 0.5) * LAT.A * LAT.jit, (i - j) / 2 * LAT.W + (rnd(i * 131 + j, 6) - 0.5) * LAT.W * LAT.jit];
export type LatCell = {p: number; q: number; s: number; w: number; pale: boolean; i: number; j: number};
/** corners of cell (i, j) shrunk toward its centre by sc, as [s, w] (0 = toward the base, 1 = +w, 2 = toward the tip, 3 = −w) */
export const cellQuad = (c: LatCell, sc = 1): [number, number][] => ([[c.i, c.j], [c.i + 1, c.j], [c.i + 1, c.j + 1], [c.i, c.j + 1]] as [number, number][]).map(([a, b]) => { const [u, v] = latCorner(a, b); return [c.s + (u - c.s) * sc, c.w + (v - c.w) * sc] as [number, number]; });
/** the pale diamond of a cell with its tips slightly rounded / notched (look C), [s, w] */
export const cellDiamond = (c: LatCell, sc = LAT.inSc, round = 0.14): [number, number][] => { const C = cellQuad(c, sc), out: [number, number][] = [];
	for (let k = 0; k < 4; k++) { const p = C[k], q = C[(k + 1) % 4], o = C[(k + 3) % 4]; out.push([lerp(p[0], o[0], round / 2), lerp(p[1], o[1], round / 2)], [lerp(p[0], q[0], round / 2), lerp(p[1], q[1], round / 2)]); }
	return out; };
/** an 8-point star centred at [s, w]: long spikes along the blade and across it, short ones on the diagonals (16 points) */
export const star = (s: number, w: number, rLong = LAT.star[0], rShort = LAT.star[1], rIn = LAT.star[2]): [number, number][] => Array.from({length: 16}, (_, k) => {
	const th = k * Math.PI / 8, r = k % 2 ? rIn : (k % 4 === 0 ? rLong : rShort); return [s + r * Math.cos(th), w + r * Math.sin(th)] as [number, number]; });
/** the star on node (i, j) = corner 0 of cell c */
export const latStar = (c: LatCell, k = 1) => { const [s, w] = latCorner(c.i, c.j); return star(s, w, LAT.star[0] * k, LAT.star[1] * k, LAT.star[2] * k); };
/** every cell that touches the blade face between s0 and s1 */
export const latCells = (s0 = -LAT.A, s1 = LBLADE + LAT.A): LatCell[] => { const out: LatCell[] = [];
	const p0 = Math.floor(2 * s0 / LAT.A) - 2, p1 = Math.ceil(2 * s1 / LAT.A) + 1, qm = Math.ceil(2 * 23 / LAT.W) + 2;
	for (let p = p0; p <= p1; p++) for (let q = -qm; q <= qm; q++) { if (((p + q) % 2 + 2) % 2 !== 0) continue;
		const s = (p + 1) / 2 * LAT.A, w = q / 2 * LAT.W; if (s < s0 - LAT.A || s > s1 + LAT.A) continue;
		const hw = Math.max(hwS(cl(s - LAT.A / 2, 0, LBLADE)), hwS(cl(s, 0, LBLADE)), hwS(cl(s + LAT.A / 2, 0, LBLADE)));
		if (Math.abs(w) - LAT.W / 2 > hw) continue;
		out.push({p, q, s, w, pale: true, i: (p + q) / 2, j: (p - q) / 2}); }
	return out; };

/* ---------- the guard (剑格): a dark bronze block, its blade side a ∧ peaked on the ridge, its grip side bowed ---------- */
const qb = (p0: [number, number], c: [number, number], p1: [number, number], n: number) => Array.from({length: n}, (_, k) => { const u = (k + 1) / n; return [lerp(lerp(p0[0], c[0], u), lerp(c[0], p1[0], u), u), lerp(lerp(p0[1], c[1], u), lerp(c[1], p1[1], u), u)] as [number, number]; });
const HALF_G: [number, number][] = [[A.guardC, 0], [A.guardC, 8.4], ...qb([A.guardC, 8.4], [A.guardC - 0.4, 14], [A.guard0 + 0.2, 20.5], 6), ...qb([A.guard0 + 0.2, 20.5], [A.guard0 - 0.6, 25], [A.guard0 + 1.8, 25], 4),
	[A.guard1 - 1.2, 25], ...qb([A.guard1 - 1.2, 25], [A.guard1, 25], [A.guard1 + 0.4, 24], 3), ...qb([A.guard1 + 0.4, 24], [A.guard1 + 4.6, 12.6], [A.apex, 0], 6)];
/** the guard outline on the face, [a, w], closed, clockwise in (a, w) (up the grip side, along +w, down the blade side) */
export const GUARD_OUT: [number, number][] = [...HALF_G, ...HALF_G.slice(1, -1).reverse().map(([a, w]) => [a, -w] as [number, number])];
/** guard half-thickness (z) along a: thicker than the grip (7.5) and than the blade's ridge (4) */
export const guardT = (a: number) => lerp(9.0, 7.4, cl((a - A.guard0) / (A.apex - A.guard0)));
/** the blade-side edge of the guard: the a where the blade comes out at w */
export const guardEdgeA = (w: number) => { const aw = Math.min(25, Math.abs(w)); return lerp(A.apex, A.guard1 + 0.4, aw / 24); };
/** relief scrolls of the beast face (one half, side = ±1), as filled [a, w] polygons: brow, cheek C, jaw hook, nose ridge */
export const guardRelief = (side: number): [number, number][][] => { const S = (p: [number, number][]) => p.map(([a, w]) => [a, side * w] as [number, number]);
	return [
		S([[101.2, 1.2], [99.2, 6], [97.6, 10.5], [97.8, 14.5], [96.6, 19.2], [95.2, 21.6], [94.6, 19.5], [95.7, 15.5], [95.5, 11], [96.6, 6.5], [98.6, 1.2]]),
		S([[90.4, 2.2], [91.2, 7.0], [90.2, 11.4], [87.4, 12.6], [86.2, 10.6], [87.4, 10.0], [88.8, 9.0], [89.0, 5.6], [88.0, 2.2]]),
		S([[86.2, 13.2], [88.6, 15.4], [89.0, 19.6], [87.8, 22.6], [85.0, 23.2], [84.2, 21.4], [86.4, 20.6], [86.8, 17.4], [85.2, 15.2]]),
		S([[A.guardC + 0.6, 0.9], [100.4, 0.9], [100.4, 0], [A.guardC + 0.6, 0]])];
};
/** inlay cells of one half: the round eye and the comma (glass on the front, turquoise on the back) */
export const EYE = {a: 92.2, w: 16.4, r: 3.2};
export const commaCell = (side: number): [number, number][] => Array.from({length: 20}, (_, k) => { const t = k / 20 * 2 * Math.PI, r = 2.2 * (1 + 0.45 * Math.cos(t));
	return [93.0 + r * Math.sin(t) * 0.9, side * (5.2 + r * Math.cos(t) * 0.85)] as [number, number]; });
/** a closed Catmull-Rom curve through screen points → path (the guard's cast scrolls and cells are rounded, not faceted) */
export const smoothPath = (q: [number, number][]) => { const n = q.length, f = (v: number) => v.toFixed(1); let d = `M${f(q[0][0])},${f(q[0][1])}`;
	for (let i = 0; i < n; i++) { const p0 = q[(i - 1 + n) % n], p1 = q[i], p2 = q[(i + 1) % n], p3 = q[(i + 2) % n];
		d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`; }
	return d + 'Z'; };

/* ---------- the inscription (C1): 8 bird-script characters, pale on the lattice ----------
   Two columns of four, ≈7 mm either side of the ridge; each glyph ≈11 mm long, ≈6 mm wide, centres ≈22 mm apart, the first ≈33 mm
   in front of the blade base, each column reading from the TIP end toward the guard: w < 0 column 越 王 鸠 浅, w > 0 column
   自 乍(作) 用 剑. (Simplified hand traces by eye from the museum photos; not a rubbing.) */
export const MARK = {s1: 33, step: 22.5, w: 7.2, len: 11.2, wid: 6.2};
/** centre of glyph n (0 = nearest the guard) in column side (−1: 越王鸠浅, +1: 自作用剑) as [a, w] mm (a from the pommel end) */
export const markAt = (side: number, n: number): [number, number] => [A.blade0 + MARK.s1 + n * MARK.step, side * MARK.w];
/** the same as [s, w] (s from the blade base) */
export const markS = (side: number, n: number): [number, number] => [MARK.s1 + n * MARK.step, side * MARK.w];
/** glyph stroke paths in a box x 0…60, y 0…110, y DOWN = from the tip end toward the guard */
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
/** glyph n of column side: its stroke path (one d) */
export const glyphD = (side: number, n: number) => GLYPHS[COLS[side < 0 ? -1 : 1][n]].join(' ');
/** the SVG matrix that lays a glyph box onto the blade at its place through a local map: c = screen point of the glyph centre,
    ea = screen step for +1 mm along a (toward the tip), ew = for +1 mm along w. Box x+ → −w, box y+ (down) → −a (toward the guard). */
export const glyphMatrix = (c: [number, number], ea: [number, number], ew: [number, number]) => { const sx = MARK.wid / 60, sy = MARK.len / 110;
	const va = [ea[0] - c[0], ea[1] - c[1]], vw = [ew[0] - c[0], ew[1] - c[1]], ma = -vw[0] * sx, mb = -vw[1] * sx, mc = -va[0] * sy, md = -va[1] * sy;
	return `matrix(${[ma, mb, mc, md, c[0] - ma * 30 - mc * 55, c[1] - mb * 30 - md * 55].map((v) => v.toFixed(4)).join(' ')})`; };
/** compatibility: the old abstract-mark API (seeds, box height) — the marks are now the GLYPHS above */
export const MARK_H = MARK.len, MARK_K = MARK.len / 1.85;
export const markSeed = (side: number, n: number) => n + (side < 0 ? 4 : 0) + 3;
export const birdScript = (seed: number) => { void seed; return {d: [] as string[], eye: [0, 0] as [number, number]}; };

/* ---------- look C 「课本金」: the colours of the metal ---------- */
export const LOOK = {
	blade: {lit: '#E8C474', body: '#D2A352', dark: '#A27434'},      // the metal under the lattice (lit half w > 0 / shade half)
	edge: {lit: '#FBE2A4', dark: '#E2BC72'},                        // the plain edge band (锷)
	ink: LAT.ink, inkOp: LAT.inkOp, pale: LAT.pale, paleOp: LAT.paleOp, frame: LAT.frame, star: LAT.star, cellSc: LAT.inSc, wear: 0.6,
	ridge: {hi: '#FFF2C8', lo: '#3A2612', w: 0.8},
	mark: {col: '#FFF8E6', dim: '#E6D6B2', w: 3.8, glow: 0.45},      // stroke colour (dim = unlit in the inscription leg / macro), width (box units), dark halo
	hilt: {deep: '#0A0B0A', body: '#1F231F', lit: '#565A4C', spec: '#A6A48A'},   // near-black greenish bronze: grip, pommel, guard
	relief: {fill: '#565B4C', lit: '#96967C', recess: '#080908'},  // the guard's raised scrolls
	glass: {deep: '#0C3E9C', body: '#2474E0', hi: '#9CCAFF'},       // front-face inlay
	turq: {deep: '#13645A', body: '#2CA894', hi: '#92E8D4'},        // back-face inlay
	outline: {col: '#120C06', w: 1.2}, sheen: 0.2, rim: 0.35,
};
/** the blade metal (gold, look C) — for old callers; the hilt is LOOK.hilt (NOT gold) */
export const METAL = {hi: '#FFF2C8', lit: '#E8C474', body: '#D2A352', mid: '#BC8C46', dark: '#A27434', deep: '#4A2E14', line: '#20160C', spec: '#FFFBEE'};
