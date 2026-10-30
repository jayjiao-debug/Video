import React from 'react';
import {Cam, proj, V3} from './parts53';
import {PALE} from './props53';
import {LAT, markAt as markMM, markSeed, birdScript, MARK_K} from './swordspec53s';
import {SwordFlat} from './flat53s';
/* ep53 · TakeC: the one blade look for legs 8–12 (43.5 → 75.2 s). LATTICE is the 8.2 s look of props53.Sword (tan diamonds, #22140A
   lines, #FFF0CC pale cells, a dark core in the tan ones); BladeFlat draws that look through any camera (the paper test's 3/4 view
   and the face-on views), MarkSet draws the eight 鸟篆 marks through any (a, w) → screen map, so the chamber, the paper test and the
   macro all show the same sword. Blade-local: a cm from the pommel end (+ toward the tip), w cm across (+ = up on the blade's face). */
export const LATTICE = {La: LAT.A / 10, Lw: LAT.W / 10, line: LAT.ink, pale: PALE, gold: '#E2B464', paleOp: LAT.paleOp};
export type Map2 = (a: number, w: number) => [number, number];
const f1 = (v: number) => v.toFixed(1);
export const mapOf = (c: Cam, world: (a: number, w: number) => V3): Map2 => (a, w) => { const p = proj(c, world(a, w)); return [p[0], p[1]]; };
/** the sword's front face through any camera map (cm): flat53s.SwordFlat, the one flat sword */
export const BladeFlat: React.FC<{S: Map2; id: string; spec?: number; hilt?: boolean}> = ({S, id, spec = 0.5, hilt = true}) => <SwordFlat S={S} id={`b${id}`} spec={spec} hilt={hilt} marks={false} edge="#FFF3CF" />;
/* ---------- the eight 鸟篆 marks (swordspec53s: places, glyphs, orientation: two columns of four along the blade, each mark's head
   toward the guard) ---------- */
/** the mark centres in blade-local (a, w) cm: side +1 = 自作用剑, −1 = 越王鸠浅; n 0–3 from the guard toward the tip */
export const markAt = (side: number, n: number): [number, number] => { const [a, w] = markMM(side, n); return [a / 10, w / 10]; };
export const MarkSet: React.FC<{S: Map2; o: number; col: (side: number, n: number) => string; lit: (side: number, n: number) => number; id: string; vis?: (side: number, n: number) => number}> = ({S, o, col, lit, id, vis}) => {
	/* glyph units → blade: x across (w), y along (a, the head toward the guard); MARK_K mm per unit */
	const mat = (a: number, w: number) => { const c = S(a, w), Ap = S(a + 0.1, w), Wv = S(a, w + 0.1);
		return {m: `matrix(${((Wv[0] - c[0]) * MARK_K).toFixed(3)} ${((Wv[1] - c[1]) * MARK_K).toFixed(3)} ${((Ap[0] - c[0]) * MARK_K).toFixed(3)} ${((Ap[1] - c[1]) * MARK_K).toFixed(3)} ${f1(c[0])} ${f1(c[1])})`, k: Math.hypot(Ap[0] - c[0], Ap[1] - c[1]) * MARK_K}; };
	const marks = [1, -1].flatMap((side) => [0, 1, 2, 3].map((n) => ({side, n, seed: markSeed(side, n), b: lit(side, n), ...(() => { const [a, w] = markAt(side, n); return mat(a, w); })()})));
	return <g>
		<defs><filter id={`mg${id}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={Math.max(2, marks[0].k * 0.12)} /></filter></defs>
		<g filter={`url(#mg${id})`}>{marks.filter((q) => q.b > 0.02 && (!vis || vis(q.side, q.n) > 0.004)).map((q) => <ellipse key={`${q.side}${q.n}`} transform={q.m} cx={0} cy={0} rx={0.62} ry={0.95} fill="#FFC860" opacity={0.6 * q.b} />)}</g>
		{marks.map((q) => { const g = birdScript(q.seed), c = col(q.side, q.n), vo = vis ? vis(q.side, q.n) : 1; if (vo <= 0.004) return null;
			return <g key={`${q.side}${q.n}`} transform={q.m} opacity={o * vo * (0.9 + 0.1 * q.b)}>{g.d.map((p, i) => <path key={i} d={p} fill="none" stroke={c} strokeWidth={0.085} strokeLinecap="round" strokeLinejoin="round" />)}
				<circle cx={g.eye[0]} cy={g.eye[1]} r={0.075} fill="none" stroke={c} strokeWidth={0.07} /><circle cx={g.eye[0] + 0.01} cy={g.eye[1]} r={0.025} fill={c} /></g>; })}
	</g>; };
