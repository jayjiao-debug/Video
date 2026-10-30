import React from 'react';
import {rnd, cl} from '../qq50/kit50';
import {Cam, V3, toCam, poly, proj, mix} from './parts53';
import {LBLADE, hwS, edgeS, faceZ, RIDGE_H, LAT, latCells, cellQuad, cellDiamond, latStar, A, SwordPose, guardEdgeA, markAt, glyphD, glyphMatrix, MARK_H, METAL, LOOK} from './swordspec53s';
/* ep53 · BladeLand: the approved MACRO look (macro53 / KF02) rebuilt in world units so ONE renderer serves every distance
   of the one take: the camera skimming 2 cm above the lattice (KF02), the whole sword in its case (KF03), the axis push (KF04)
   and (through sword3d.Blade3D) every other 3-D view of the sword. Units mm; the blade lies on the sword pose: base at
   a = 97 from the pommel, s = distance from the base toward the tip, w = across (+y). Outline, face (a shallow roof: the raised
   ridge on the axis, polished edge strips) and lattice all come from swordspec53s.
   Lighting is physical (Blinn–Phong on the face normal); a light may be a point (pos) that falls off with distance. The metal
   highlight is drawn where metal shows it: the ridge is ONE thin gold crease (METAL.lit, ≤ 1.5 px; it goes to METAL.hi only inside
   a lobe), crisp lines on the raised rims of the pale (tin-rich) cells on their lit side, and small glints on the brightest pale
   cells. fix4-a: the [亮] accent is a broad soft specular LOBE (opt `lobe`) on the pale cells only — the dark lattice breaks it —
   with a thin bright line on the edge strips at its level; no white ridge stripe.
   v3.1 design C: the lattice is square diamonds — the dark ground between, each pale diamond in a thin pale frame, a dark 8-point
   star on every crossing (drawn after all cells); the 8 characters are pale glyphs ON the pattern (no calm zone); plain edge bands. */
export const A_BL = A.blade0, LBM = LBLADE, RIDGE = RIDGE_H;
export const hwAt = (s: number) => hwS(Math.max(0, s));
/** height of the face above the sword's axis plane at (s, w) */
export const hAt = (s: number, w: number) => faceZ(Math.max(0, s), w);
export const bw = (sp: SwordPose, s: number, w: number, h = hAt(s, w)): V3 => [sp.x0 + sp.dir * (A_BL + s), sp.ya + w, sp.z0 + h];
const nrm = (v: V3): V3 => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/** a light: dir = toward the light (directional), or pos = a point light (world) with falloff distance d0 */
export type Light = {dir: V3; k: number; pos?: V3; d0?: number};
export type LandOpts = {
	lights: Light[];
	shin?: number;
	fog?: {d0: number; D: number; col: string};
	/** depth of field: depths (camera z, mm) below `near` go to the blurred near group, above `far` to the far group */
	dof?: {near: number; far: number; nb: string; fb: number};
	sheen?: {pos: number; k: number};   // a silvery wash at pos (0 base … 1 tip)
	exposure?: number;                  // 0..1, the whole blade's brightness (1 = as lit)
	lift?: number;                      // 0..1, a warm lift toward bright gold (far views read as THE bright sword)
	sMin?: number;                      // draw only s ≥ sMin (cells behind the camera in the glide)
	flash?: {s: number; k: number};     // a light catching the bronze at s (the [亮] accent): ridge + rims + glints there
	glints?: number;                    // 0..1, the pale-cell glints (default 1)
	guardCut?: boolean;                 // start the face at the guard's inverted V (the blade never pokes into the guard)
	marks?: boolean;                    // the 8 bird-script marks in front of the guard (default true)
	/** fix4-a: a soft elliptical specular lobe (screen px: rx, ry half-axes) centred on the ridge where it crosses screen y = y,
	   clipped to the pale cells; k = 0..1 strength. The ridge inside it goes METAL.lit → METAL.hi, the edge strips get a thin line */
	lobe?: {y: number; k: number; rx?: number; ry?: number; dx?: number};
};
type CellD = {d: string; fr: string; dIn: string; star: string; col: string; line: string; lw: number; rim: number; rimD: string; pale: boolean; z: number; px: number; s: number; w: number};
export const BladeLand: React.FC<{c: Cam; sp: SwordPose; id: string; o: LandOpts}> = ({c, sp, id, o}) => {
	const lights = o.lights.map((l) => ({...l, dir: nrm(l.dir)})), shin = o.shin ?? 70, ex = o.exposure ?? 1;
	const fogOf = (z: number) => (o.fog ? 1 - Math.exp(-Math.max(0, z - o.fog.d0) / o.fog.D) : 0), FOG = o.fog?.col ?? '#1E100B';
	const sMin = o.sMin ?? -20;
	const cut = (w: number) => (o.guardCut ? guardEdgeA(w) - A_BL + 0.3 : 0);
	const flashAt = (s: number) => (o.flash && o.flash.k > 0 ? o.flash.k * Math.exp(-Math.pow((s - o.flash.s) / 26, 2)) : 0);
	/** Blinn–Phong at P for normal n; returns specular (sharp), diffuse */
	const light = (n: V3, P: V3, sh: number) => { const V = nrm([c.p[0] - P[0], c.p[1] - P[1], c.p[2] - P[2]]);
		let s = 0, d = 0; for (const L of lights) { let Ld = L.dir, att = 1;
			if (L.pos) { const v: V3 = [L.pos[0] - P[0], L.pos[1] - P[1], L.pos[2] - P[2]], dist = Math.hypot(v[0], v[1], v[2]); Ld = nrm(v); att = 1 / (1 + Math.pow(dist / (L.d0 ?? 300), 2)); }
			const Hh = nrm([V[0] + Ld[0], V[1] + Ld[1], V[2] + Ld[2]]); s += L.k * att * Math.pow(Math.max(0, dot(n, Hh)), sh); d += L.k * att * Math.max(0, dot(n, Ld)); }
		return {sp: s, df: Math.min(1, d)}; };
	/** the face normal at (s, w): the roof slope across the blade */
	const faceN = (s: number, w: number): V3 => { const e = 0.4, dh = (hAt(s, w + e) - hAt(s, w - e)) / (2 * e); return nrm([0, -dh, 1]); };
	/* ---- cells ---- */
	const cells: CellD[] = [];
	const sub = (px: number) => (px > 60 ? 6 : px > 18 ? 3 : 1);
	const clampW = (s: number, w: number) => { const lim = Math.max(0, hwAt(Math.max(s, 0)) - edgeS(Math.max(s, 0))); return Math.max(-lim, Math.min(lim, w)); };
	for (const cc of latCells(Math.max(sMin, -LAT.A), LBM)) { const ca = cc.s, cw = cc.w, hw = hwAt(ca);
		if (ca < sMin - LAT.A || hw - edgeS(Math.max(0, ca)) < 1 || Math.abs(cw) > hw - edgeS(Math.max(0, ca)) + LAT.W / 2) continue;
		const Pc = bw(sp, ca, clampW(ca, cw)), kc = toCam(c, Pc); if (kc[2] < 2) continue;
		const pxSize = c.f * LAT.A / kc[2]; if (pxSize < 0.6) continue;
		const sx = c.cx + c.f * kc[0] / kc[2], sy = c.cy - c.f * kc[1] / kc[2]; if (sx < -pxSize * 2 - 200 || sx > 2120 + pxSize * 2 || sy < -pxSize * 2 - 200 || sy > 1280 + pxSize * 2) continue;
		const n = sub(pxSize);
		const quadOf = (cs: [number, number][]) => { const pts: V3[] = [], ne = cs.length;
			for (let e = 0; e < ne; e++) { const [a0, b0] = cs[e], [a1, b1] = cs[(e + 1) % ne];
				for (let k = 0; k < n; k++) { const tt = k / n, vv = b0 + (b1 - b0) * tt, uu = Math.max(a0 + (a1 - a0) * tt, cut(vv)); pts.push(bw(sp, uu, clampW(uu, vv))); } }
			return poly(c, pts); };
		const quad = (sc: number) => quadOf(cellQuad(cc, sc));
		const d = quadOf(cellDiamond(cc)); if (!d) continue;
		const pale = cc.pale, nf = faceN(ca, clampW(ca, cw)), L0 = light(nf, Pc, shin), Lr = light(nf, Pc, shin * 2.2), fog = fogOf(kc[2]), fl = flashAt(ca);
		const jit = (rnd(cc.i * 31 + cc.j, 71) - 0.5) * 0.12;
		const base = mix(mix(LAT.pale, LAT.paleDk, 0.2 + jit), '#3E3020', LOOK.wear * 0.5 * cl(1 - ca / 140));   // a little darker in the worn zone near the guard
		let col = mix(base, '#3A2410', cl(0.36 - 0.5 * L0.df));
		if (o.lift) col = mix(col, LAT.paleHi, o.lift);
		/* the cell's own sheen stays low (it is a dull, finely ground face); the bright metal is in the rims, the ridge and the glints */
		col = mix(col, '#FFF4DC', cl(L0.sp * (pale ? 0.32 : 0.12) + fl * (pale ? 0.25 : 0.1)));
		if (o.sheen && o.sheen.k > 0) col = mix(col, '#F2F6F8', o.sheen.k * Math.exp(-Math.pow((ca / LBM - o.sheen.pos) / 0.07, 2)) * (pale ? 0.85 : 0.6));
		col = mix(col, '#120804', 1 - ex);
		col = mix(col, FOG, fog * 0.94);
		/* the lit rim: the two inner edges of a pale cell that face the light (toward the light's side along s) */
		const rim = cl(Lr.sp * 1.4 + fl) * (1 - fog);
		let rimD = '';
		if (pale && pxSize > 7 && rim > 0.04) { const q = cellQuad(cc, LAT.inSc), Lp = lights[0]?.pos, toL = Lp ? Math.sign((Lp[0] - Pc[0]) * sp.dir) : Math.sign(lights[0]?.dir[0] * sp.dir || 1);
			/* corners: 0 = toward the base, 1 = +w, 2 = toward the tip, 3 = −w; the lit pair meets at the corner nearest the light */
			const k0 = toL < 0 ? 0 : 2, ids = [(k0 + 3) % 4, k0, (k0 + 1) % 4], pts: V3[] = [];
			for (let e = 0; e < 2; e++) { const [a0, b0] = q[ids[e]], [a1, b1] = q[ids[e + 1]]; for (let k = 0; k <= 4; k++) { const tt = k / 4, uu = Math.max(0, a0 + (a1 - a0) * tt); pts.push(bw(sp, uu, clampW(uu, b0 + (b1 - b0) * tt), hAt(uu, clampW(uu, b0 + (b1 - b0) * tt)) + 0.05)); } }
			rimD = poly(c, pts, false); }
		/* the star on this cell's node 0 (each crossing belongs to exactly one cell), cut at the guard's ∧ like the cells */
		const st = pxSize > 4 ? (() => { const pts = latStar(cc).map(([u, v]) => bw(sp, Math.max(u, cut(v)), clampW(Math.max(u, cut(v)), v))); return poly(c, pts); })() : '';
		cells.push({d, fr: pxSize > 9 ? quad(LAT.frSc) : '', dIn: '', star: st, col, line: mix(LAT.ink, FOG, fog * 0.8), lw: Math.max(0.35, c.f * LAT.frame / kc[2]), rim, rimD, pale, z: kc[2], px: pxSize, s: ca, w: cw}); }
	cells.sort((a, b) => b.z - a.z);
	const CellG = (k: CellD, i: number) => <g key={i}>
		{k.fr && <path d={k.fr} fill="none" stroke={k.col} strokeWidth={Math.min(3, k.lw)} strokeOpacity={0.8 * LAT.paleOp} strokeLinejoin="round" />}
		<path d={k.d} fill={k.col} opacity={LAT.paleOp} />
		{k.rimD && <path d={k.rimD} fill="none" stroke="#FFFBEE" strokeWidth={Math.max(0.6, Math.min(2.4, k.lw * 0.55))} strokeOpacity={cl(k.rim)} strokeLinecap="round" strokeLinejoin="round" />}
	</g>;
	const StarG = (k: CellD, i: number) => k.star ? <path key={`s${i}`} d={k.star} fill={k.line} opacity={LAT.inkOp} /> : null;
	const nearG = o.dof ? cells.filter((k) => k.z < o.dof!.near) : [], farG = o.dof ? cells.filter((k) => k.z > o.dof!.far) : [], midG = o.dof ? cells.filter((k) => k.z >= o.dof!.near && k.z <= o.dof!.far) : cells;
	/* ---- edge strips, ridge, outline ---- */
	const NS = 96, ss = Array.from({length: NS + 1}, (_, k) => Math.max(sMin, -2) + (LBM - Math.max(sMin, -2)) * k / NS).map((s) => Math.max(0, s));
	const sCutE = cut(hwAt(6)), strips = [1, -1].flatMap((side) => ss.slice(0, -1).map((s0q, k) => { const s0 = Math.max(s0q, sCutE), s1 = Math.max(ss[k + 1], sCutE); if (s1 - s0 < 0.01) return null; const a0 = hwAt(s0), a1 = hwAt(s1), P = bw(sp, s0, side * (a0 - edgeS(s0) / 2));
		const d = poly(c, [bw(sp, s0, side * Math.max(0, a0 - edgeS(s0))), bw(sp, s0, side * a0), bw(sp, s1, side * a1), bw(sp, s1, side * Math.max(0, a1 - edgeS(s1)))]); if (!d) return null;
		const z = toCam(c, P)[2]; if (z < 2) return null;
		const Ls = light(nrm([0, side * 0.45, 1]), P, shin * 0.7);
		let col = mix(side > 0 ? LOOK.edge.lit : mix(LOOK.edge.dark, LOOK.blade.dark, 0.45), '#FFFBEA', cl(Ls.sp * 0.9 + flashAt(s0) * 0.5));
		if (o.sheen && o.sheen.k > 0) col = mix(col, '#F6FAFC', o.sheen.k * Math.exp(-Math.pow((s0 / LBM - o.sheen.pos) / 0.07, 2)));
		col = mix(mix(col, '#120804', 1 - ex), FOG, fogOf(z) * 0.92);
		return <path key={`st${side}_${k}`} d={d} fill={col} stroke={col} strokeWidth={0.6} />; }));
	/* fix4-a: the lobe's centre = the ridge point nearest screen y (searched along the visible ridge), shifted by dx */
	const lobe = (() => { if (!o.lobe || o.lobe.k <= 0.004) return null; let best: [number, number, number] | null = null;
		for (let k = 0; k <= 160; k++) { const s = Math.max(0, sMin, cut(0) + 0.5) + (LBM - 9) * k / 160, P = proj(c, bw(sp, s, 0, hAt(s, 0))); if (P[2] < 3) continue;
			if (!best || Math.abs(P[1] - o.lobe.y) < Math.abs(best[1] - o.lobe.y)) best = [P[0], P[1], s]; }
		if (!best) return null; return {x: best[0] + (o.lobe.dx ?? 0), y: best[1], rx: o.lobe.rx ?? 230, ry: o.lobe.ry ?? 85, k: cl(o.lobe.k)}; })();
	/** the lobe's strength at a screen point (gaussian ellipse, 0..1) */
	const lobeAt = (x: number, y: number) => (lobe ? lobe.k * Math.exp(-Math.pow((x - lobe.x) / lobe.rx, 2) - Math.pow((y - lobe.y) / lobe.ry, 2)) : 0);
	/* the ridge: per segment, a crisp specular line whose brightness follows the light on the crease (either flank) and whose
	   width is its true width at its own depth (≈ 0.5 mm of polished crest, never wider than 2.6 px) */
	const r0 = Math.max(sMin, 1, cut(0) + 0.5), RN = 140, rs = Array.from({length: RN + 1}, (_, k) => r0 + (LBM - 9 - r0) * k / RN);
	const ridge = rs.slice(0, -1).map((s0, k) => { const s1 = rs[k + 1], sm = (s0 + s1) / 2, P = bw(sp, sm, 0, hAt(sm, 0) + 0.05), z = toCam(c, P)[2]; if (z < 3) return null;
		const sl = RIDGE_H * 1.12 / Math.max(1, hwAt(sm)), nA = nrm([0, sl, 1]), nB = nrm([0, -sl, 1]);
		const I = cl(Math.max(light(nA, P, shin * 1.2).sp, light(nB, P, shin * 1.2).sp) * 1.6 + flashAt(sm)) * (1 - fogOf(z)) * ex;
		const wpx = Math.min(1.5, Math.max(0.7, c.f * 0.5 / z)), d = poly(c, [bw(sp, s0, 0, hAt(s0, 0) + 0.05), bw(sp, s1, 0, hAt(s1, 0) + 0.05)], false); if (!d) return null;
		/* fix4-a: one thin GOLD crease (METAL.lit), brighter where the light is on it; METAL.hi only inside the lobe */
		const Pm = proj(c, P), lk = lobeAt(Pm[0], Pm[1]), op = cl(0.42 + 0.5 * I + 0.4 * lk) * (1 - fogOf(z)) * ex;
		return <path key={`r${k}`} d={d} fill="none" stroke={mix(METAL.lit, METAL.hi, cl(lk * 1.3))} strokeOpacity={op} strokeWidth={wpx} strokeLinecap="round" />; });
	/* glints: the few brightest pale cells, a small four-point star at the lit corner of the rim */
	const gk = o.glints ?? 1;
	const glints = gk <= 0 ? [] : cells.filter((k) => k.pale && k.rim > 0.55 && k.px > 9 && !(o.dof && (k.z < o.dof.near || k.z > o.dof.far))).sort((a, b) => b.rim - a.rim).slice(0, 7).map((k, i) => {
		const q = cellQuad({p: 0, q: 0, s: k.s, w: k.w, pale: true, i: 0, j: 0}, 0.5), Lp = lights[0]?.pos, toL = Lp ? Math.sign((Lp[0] - bw(sp, k.s, k.w)[0]) * sp.dir) : 1;
		const [gs, gw] = toL < 0 ? [k.s - LAT.A * 0.36, k.w] : [k.s + LAT.A * 0.36, k.w], P = proj(c, bw(sp, gs, clampW(gs, gw), hAt(gs, clampW(gs, gw)) + 0.1)); void q;
		if (P[2] < 3) return null; const r = Math.min(16, Math.max(3, c.f * 1.6 / P[2])) * (0.6 + 0.4 * k.rim), a = cl((k.rim - 0.55) / 0.35) * gk;
		return <g key={`gl${i}`} opacity={a}><circle cx={P[0]} cy={P[1]} r={r * 0.5} fill="#FFE8B8" opacity={0.35} />
			<path d={`M${P[0]},${P[1] - r} L${P[0] + r * 0.12},${P[1] - r * 0.12} L${P[0] + r},${P[1]} L${P[0] + r * 0.12},${P[1] + r * 0.12} L${P[0]},${P[1] + r} L${P[0] - r * 0.12},${P[1] + r * 0.12} L${P[0] - r},${P[1]} L${P[0] - r * 0.12},${P[1] - r * 0.12} Z`} fill="#FFFDF4" /></g>; });
	/* the inscription (C1): two columns of four marks either side of the ridge, heads toward the guard, ON the face */
	const marks = o.marks === false ? [] : [1, -1].flatMap((side) => [0, 1, 2, 3].map((n) => { const [a, w] = markAt(side, n), s = a - A_BL;
		const on = (ds: number, dw: number) => proj(c, bw(sp, s + ds, w + dw, hAt(s + ds, w + dw) + 0.06)), P0 = on(0, 0); if (P0[2] < 3) return null;
		const Ps = on(1, 0), Pw = on(0, 1), px = Math.hypot(Ps[0] - P0[0], Ps[1] - P0[1]) * MARK_H; if (px < 5) return null;
		const d = glyphD(side, n), col = mix(LOOK.mark.col, FOG, fogOf(P0[2]) * 0.85), m = glyphMatrix([P0[0], P0[1]], [Ps[0], Ps[1]], [Pw[0], Pw[1]]);
		return <g key={`m${side}${n}`} transform={m} opacity={0.9 * ex * cl((px - 5) / 8)}><path d={d} fill="none" stroke={LAT.ink} strokeOpacity={LOOK.mark.glow} strokeWidth={LOOK.mark.w * 2.6} strokeLinecap="round" strokeLinejoin="round" />
			<path d={d} fill="none" stroke={col} strokeWidth={LOOK.mark.w} strokeLinecap="round" strokeLinejoin="round" /></g>; }));
	/* fix4-a: the lobe itself — a soft ellipse of light on the pale cells only (their union is the clip; the dark lattice breaks it),
	   and a thin bright line on both edge strips at the lobe's level */
	const paleClip = lobe ? cells.filter((k) => k.pale && k.px > 4 && !(o.dof && (k.z < o.dof.near || k.z > o.dof.far))).map((k) => k.d).join(' ') : '';
	const lobeG = lobe && paleClip ? <g>
		<defs><clipPath id={`lbc${id}`}><path d={paleClip} /></clipPath>
			<radialGradient id={`lbg${id}`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor={METAL.spec} stopOpacity={1} /><stop offset="0.4" stopColor={METAL.hi} stopOpacity={0.88} />
				<stop offset="0.72" stopColor={METAL.lit} stopOpacity={0.4} /><stop offset="1" stopColor={METAL.lit} stopOpacity={0} /></radialGradient></defs>
		<g clipPath={`url(#lbc${id})`}><ellipse cx={lobe.x} cy={lobe.y} rx={lobe.rx * 1.55} ry={lobe.ry * 1.55} fill={`url(#lbg${id})`} opacity={lobe.k * ex} /></g></g> : null;
	const edgeLines = !lobe ? [] : [1, -1].flatMap((side) => ss.slice(0, -1).map((s0q, k) => { const s0 = Math.max(s0q, sCutE), s1 = Math.max(ss[k + 1], sCutE); if (s1 - s0 < 0.01) return null;
		const A0 = bw(sp, s0, side * (hwAt(s0) - 0.25)), A1 = bw(sp, s1, side * (hwAt(s1) - 0.25)), q0 = proj(c, A0); if (q0[2] < 3) return null;
		const a = lobe.k * Math.exp(-Math.pow((q0[1] - lobe.y) / (lobe.ry * 1.8), 2)) * (1 - fogOf(q0[2])) * ex; if (a < 0.03) return null;
		const d = poly(c, [A0, A1], false); return d ? <path key={`el${side}_${k}`} d={d} fill="none" stroke={METAL.hi} strokeOpacity={cl(a)} strokeWidth={1.5} strokeLinecap="round" /> : null; }));
	const sq = (s: number) => Math.max(s, sCutE), outline = poly(c, [bw(sp, cut(0), 0, 0), ...ss.map((s) => bw(sp, sq(s), hwAt(sq(s)), 0)), ...ss.slice().reverse().map((s) => bw(sp, sq(s), -hwAt(sq(s)), 0))]);
	return <g>
		<defs>{o.dof && <filter id={`ln${id}`} x="-10%" y="-20%" width="120%" height="140%"><feGaussianBlur stdDeviation={o.dof.nb} /></filter>}
			{o.dof && o.dof.fb > 0 && <filter id={`lf${id}`} x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation={o.dof.fb} /></filter>}</defs>
		{outline && <path d={outline} fill={mix(LAT.ink, FOG, fogOf(toCam(c, bw(sp, LBM / 2, 0))[2]) * 0.6)} opacity={0.92 * ex} />}
		{farG.length > 0 && <g filter={o.dof!.fb > 0 ? `url(#lf${id})` : undefined}>{farG.map(CellG)}{farG.map(StarG)}</g>}
		{midG.map(CellG)}{midG.map(StarG)}
		{nearG.length > 0 && <g filter={`url(#ln${id})`}>{nearG.map(CellG)}{nearG.map(StarG)}</g>}
		{lobeG}
		{strips}
		{edgeLines}
		{marks}
		{ridge}
		{glints}
	</g>;
};
/** screen point of a blade location (for tags, glints) */
export const bladePt = (c: Cam, sp: SwordPose, s: number, w: number) => proj(c, bw(sp, s, w));
