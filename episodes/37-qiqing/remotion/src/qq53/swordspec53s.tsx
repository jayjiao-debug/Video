import {lerp, cl, rnd} from '../qq50/kit50';
/* ep53 · THE sword's one specification (facts B1–B6, B10, C1). Every renderer (props53.Sword / blade53c.BladeFlat via flat53s,
   sword3d.Sword3D, land53.BladeLand, macro53.BladeMacro, macrob53c.BladeMacroC, the blooms and the section cut) reads its
   outline, its lattice, its guard, grip hoops, pommel and inscription from here, so the sword is the same at every scale.
   Units: mm. a = along the axis from the pommel's end face (a = 0) to the tip (a = 556); s = a − A.blade0 = from the blade base;
   w = across the blade (+ = the side the flat views call "up"); z = out of the front face (the blue-glass face).

   - overall 55.6 cm (B1);
   - pommel (剑首) 0–8: a disc turned outward, ⌀37.2, 11 concentric rings cast in its end face (B6, face53);
   - round grip (剑茎) 8–82, ⌀17.2, with two raised hoops (箍) at 33 and 60;
   - guard (剑格) 82–102, 55.6 wide at the blade side, its blade-side edge a shallow inverted V; blue glass inlaid on the front
     face, turquoise on the back face (B5); thicker than the grip and the blade, so both are seated inside it;
   - blade 97–556 (its base hidden in the guard's V): widest (≈5 cm, B2) about a third of the way from the guard, then a gentle
     waist, a slight swell and a sharp point; a raised central ridge; polished edge strips; the whole face covered by the black
     diamond lattice (菱形暗纹, B4), alternate diamonds pale (tin-rich);
   - the 8 bird-script marks 越王鸠浅 / 自作用剑 (C1): two columns of four along the blade, either side of the ridge, just in front
     of the guard (abstract marks, not readable glyphs: no rubbing was traced). */
/** where a 3-D sword lies: pommel end face at (x0, ya, z0), the axis along dir·x, the front (blue-glass) face up (+z) */
export type SwordPose = {x0: number; ya: number; z0: number; dir: 1 | -1};
export const A = {L: 556, pom1: 8, grip0: 8, grip1: 82, guard0: 82, guard1: 102, blade0: 97};
export const LBLADE = A.L - A.blade0;                       // 459
export const R_POM = 18.6, R_GRIP = 8.6, R_HOOP = 9.9, HOOPS = [33, 60], HOOP_HL = 2.6;
/** the pommel's side profile [a, radius]: the end face at a = 0, the rolled-out rim, the flare down to the grip */
export const POM_PROF: [number, number][] = [[0, R_POM], [1.6, R_POM], [2.4, 17.6], [3.3, 14.6], [4.6, 11.6], [6.2, 9.6], [8, R_GRIP + 0.4]];

/* ---------- the blade outline ---------- */
const S_MAX = 155, S_WAIST = 330, S_SWELL = 392, S_PT = 398, HW0 = 22, HW_MAX = 25, HW_WAIST = 19.6, HW_SWELL = 20.1;
const ease = (u: number) => (1 - Math.cos(Math.PI * cl(u))) / 2;
/** blade half-width (mm) at s mm from the blade base (0 beyond the tip) */
export const hwS = (s: number) => { if (s >= LBLADE) return 0; if (s <= 0) return HW0;
	if (s < S_MAX) return lerp(HW0, HW_MAX, Math.sin(Math.PI / 2 * s / S_MAX));
	if (s < S_WAIST) return lerp(HW_MAX, HW_WAIST, ease((s - S_MAX) / (S_WAIST - S_MAX)));
	if (s < S_SWELL) return lerp(HW_WAIST, HW_SWELL, ease((s - S_WAIST) / (S_SWELL - S_WAIST)));
	if (s < S_PT) return HW_SWELL;
	return HW_SWELL * Math.cos(Math.PI / 2 * (s - S_PT) / (LBLADE - S_PT)); };
/** polished edge strip (刃) width, mm */
export const edgeS = (s: number) => 3.4 * cl(hwS(s) / 14, 0.25, 1);
/** the face's height above the axis plane: a shallow roof, the ridge on the axis, the edge strips bevelled */
export const RIDGE_H = 3.4, EDGE_H = 0.6;
export const faceZ = (s: number, w: number) => { const hw = Math.max(0.01, hwS(s)), st = edgeS(s), aw = Math.abs(w), a = Math.min(1, aw / hw);
	const bev = aw > hw - st ? 0.8 * (aw - (hw - st)) / st : 0;
	return EDGE_H + RIDGE_H * Math.pow(1 - a, 1.12) - bev; };

/* ---------- the lattice (菱形暗纹): ONE constant for every renderer ----------
   Cells are diamonds A long (along the blade) and W wide, laid on (s, w) with a diamond centred on the ridge at every row.
   Cell (p, q), p + q even: centre s = (p + 1)/2·A, w = q/2·W; pale (tin-rich) when p is even. Corners are jittered a little
   (a cast-and-polished pattern, not a printed grid), the same jitter everywhere. */
export const LAT = {A: 20.5, W: 11.8, jit: 0.05, ink: '#22140A', line: 0.85, lineIn: 0.3, inSc: 0.82, coreSc: 0.34,
	pale: '#D6BC88', gold: '#B98443', paleDk: '#8A6A3E', goldDk: '#6E4824', paleHi: '#FFF0CC', paleOp: 0.22};
/** the macro views (M1 → T2) look at the blade from s = MACRO_S0 on (5 cells past the base, beyond the inscription): macro u = s − s0 */
export const MACRO_S0 = 5 * LAT.A;
export const latCorner = (i: number, j: number): [number, number] => [(i + j) / 2 * LAT.A + (rnd(i * 131 + j, 5) - 0.5) * LAT.A * LAT.jit, (i - j) / 2 * LAT.W + (rnd(i * 131 + j, 6) - 0.5) * LAT.W * LAT.jit * 1.4];
export type LatCell = {p: number; q: number; s: number; w: number; pale: boolean; i: number; j: number};
/** corners of cell (i, j) shrunk toward its centre by sc, as [s, w] */
export const cellQuad = (c: LatCell, sc = 1): [number, number][] => ([[c.i, c.j], [c.i + 1, c.j], [c.i + 1, c.j + 1], [c.i, c.j + 1]] as [number, number][]).map(([a, b]) => { const [u, v] = latCorner(a, b); return [c.s + (u - c.s) * sc, c.w + (v - c.w) * sc] as [number, number]; });
/** every cell that touches the blade face between s0 and s1 */
export const latCells = (s0 = -LAT.A, s1 = LBLADE + LAT.A): LatCell[] => { const out: LatCell[] = [];
	const p0 = Math.floor(2 * s0 / LAT.A) - 2, p1 = Math.ceil(2 * s1 / LAT.A) + 1, qm = Math.ceil(2 * HW_MAX / LAT.W) + 2;
	for (let p = p0; p <= p1; p++) for (let q = -qm; q <= qm; q++) { if (((p + q) % 2 + 2) % 2 !== 0) continue;
		const s = (p + 1) / 2 * LAT.A, w = q / 2 * LAT.W; if (s < s0 - LAT.A || s > s1 + LAT.A) continue;
		const hw = Math.max(hwS(cl(s - LAT.A / 2, 0, LBLADE)), hwS(cl(s, 0, LBLADE)), hwS(cl(s + LAT.A / 2, 0, LBLADE)));
		if (Math.abs(w) - LAT.W / 2 > hw) continue;
		out.push({p, q, s, w, pale: ((p % 2) + 2) % 2 === 0, i: (p + q) / 2, j: (p - q) / 2}); }
	return out; };

/* ---------- the guard (剑格) ---------- */
const qb = (p0: [number, number], c: [number, number], p1: [number, number], n: number) => Array.from({length: n}, (_, k) => { const u = (k + 1) / n; return [lerp(lerp(p0[0], c[0], u), lerp(c[0], p1[0], u), u), lerp(lerp(p0[1], c[1], u), lerp(c[1], p1[1], u), u)] as [number, number]; });
/** the guard's outline on the face, [a, w], counter-clockwise in (a, w): grip side, the outer corner, the inverted V round the blade */
export const GUARD_OUT: [number, number][] = [[82, -23], [82, 23], [100.5, 27.8], [102, 27], ...qb([102, 27], [99, 12], [97, 0], 7), ...qb([97, 0], [99, -12], [102, -27], 7), [100.5, -27.8]];
/** guard half-thickness (z) along a: thicker than the grip (8.6) at the grip side and than the blade's ridge (4) at the blade side */
export const guardT = (a: number) => lerp(9.4, 7.6, cl((a - A.guard0) / (A.guard1 - A.guard0)));
/** one inlay panel (glass on the front face, turquoise on the back), side = ±1 */
export const inlayPanel = (side: number): [number, number][] => [[84.2, side * 2.6], [84.2, side * 21.6], [99.3, side * 25.2], ...qb([99.3, side * 25.2], [97.6, side * 11], [95.6, side * 2.6], 6)];
/** the bronze cloisons inside a panel (polylines) */
export const inlayCells = (side: number): [number, number][][] => [[[84.2, side * 10.5], [91.5, side * 10.5], [91.5, side * 17.5]], [[91.5, side * 10.5], [97.8, side * 5.5]], [[88, side * 17.5], [98.8, side * 21.2]], [[84.2, side * 6], [88, side * 6], [88, side * 2.6]]];

/* ---------- the inscription (C1) ---------- */
/** centre of mark n (0–3, from the guard toward the tip) in column side (+1 = 自作用剑, −1 = 越王鸠浅), as [a, w] in mm */
export const markAt = (side: number, n: number): [number, number] => [A.blade0 + 22 + n * 15, side * 9.2];
/** the mark height along the blade (mm) — the glyph box is 1.85 units tall, 0.8 wide */
export const MARK_H = 12.5, MARK_K = MARK_H / 1.85;
/** an abstract bird-script mark (鸟篆-like ornament, NOT a character): a bird's head with beak and crest at the top (toward the
    guard), an S-curved spine to a coiled tail, a second hooked stroke beside it, two wing ribbons. Box x ±0.4, y −0.9 … +0.95. */
export const birdScript = (seed: number) => { const r = (k: number) => rnd(seed * 13 + k, 29), f = (v: number) => v.toFixed(3), d: string[] = [];
	const m = r(1) > 0.5 ? 1 : -1, a = 0.12 + 0.1 * r(2), y1 = -0.25 + 0.25 * r(3), y2 = 0.12 + 0.25 * r(4), tail = 0.5 + 0.25 * r(5);
	d.push(`M0,-0.58 C${f(m * a)},-0.3 ${f(-m * a)},-0.02 0,0.26 C${f(m * a * 0.8)},0.46 ${f(m * 0.02)},${f(tail)} ${f(-m * 0.16)},${f(tail - 0.02)} q${f(-m * 0.1)},-0.02 ${f(-m * 0.08)},-0.13 q${f(m * 0.03)},-0.08 ${f(m * 0.1)},-0.04`);
	const x2 = m * (0.3 + 0.06 * r(6)), t2 = -0.4 + 0.2 * r(7), b2 = 0.55 + 0.3 * r(8);
	d.push(`M${f(x2)},${f(t2)} C${f(x2 + m * 0.07)},${f(t2 + 0.3)} ${f(x2 - m * 0.07)},${f(b2 - 0.3)} ${f(x2)},${f(b2 - 0.1)} q0,0.1 ${f(-m * 0.14)},0.09 q${f(-m * 0.1)},-0.01 ${f(-m * 0.08)},-0.1`);
	d.push(`M${f(x2)},${f(t2)} q0,-0.1 ${f(m * 0.12)},-0.1 q${f(m * 0.09)},0 ${f(m * 0.07)},0.1`);
	d.push(`M${f(m * 0.02)},${f(y1)} C${f(-m * 0.16)},${f(y1 - 0.12)} ${f(-m * 0.34)},${f(y1 - 0.06)} ${f(-m * 0.33)},${f(y1 + 0.1)} q0,0.1 ${f(m * 0.1)},0.08 q${f(m * 0.06)},-0.03 ${f(m * 0.02)},-0.09`);
	d.push(`M${f(-m * 0.01)},${f(y2)} C${f(m * 0.1)},${f(y2 + 0.14)} ${f(m * 0.2)},${f(y2 + 0.04)} ${f(m * 0.17)},${f(y2 - 0.08)}`);
	const hy = -0.7;
	d.push(`M${f(m * 0.07)},${f(hy - 0.02)} l${f(m * 0.15)},0.03 l${f(-m * 0.14)},0.045`);
	d.push(`M${f(-m * 0.02)},${f(hy - 0.08)} q${f(-m * 0.05)},-0.14 ${f(-m * 0.18)},-0.09 q${f(-m * 0.05)},0.05 ${f(-m * 0.01)},0.09`);
	return {d, eye: [0, hy] as [number, number]}; };
/** the seed of the mark at (side, n) — the same glyph in every view */
export const markSeed = (side: number, n: number) => n + (side < 0 ? 4 : 0) + 3;

/* ---------- colours of the metal (style B) ---------- */
export const METAL = {hi: '#FFF3CF', lit: '#F4D088', body: '#DCAA5E', mid: '#BC8744', dark: '#80552A', deep: '#4A2E14', line: '#2A180A', spec: '#FFFBEE'};
/** the guard's blade-side edge: the a (mm) where the blade face comes out of the guard at w (the inverted V; 102 beyond it) */
export const guardEdgeA = (w: number) => { const aw = Math.abs(w), N = GUARD_OUT.slice(3, 11);   // (102, 27) … (97, 0)
	if (aw >= N[0][1]) return A.guard1;
	for (let i = 0; i < N.length - 1; i++) { const [a0, w0] = N[i], [a1, w1] = N[i + 1]; if (aw <= w0 && aw >= w1) return lerp(a0, a1, (w0 - aw) / Math.max(1e-6, w0 - w1)); }
	return A.blade0; };
