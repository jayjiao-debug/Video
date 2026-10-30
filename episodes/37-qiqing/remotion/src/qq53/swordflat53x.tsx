import React from 'react';
import {cl, rnd} from '../qq50/kit50';
import {mix} from './parts53';
import {A, LBLADE, hwS, edgeS, LAT, latNodes, latCellCentres, diamond, star, GUARD_OUT, guardRelief, EYE, commaCell, R_GRIP, R_POM, R_HOOP, HOOPS, HOOP_HL, POM_PROF, MARK, markAt, GLYPHS, COLS, Look} from './swordspec53x';
/* ep53 · SWORDDESIGN — the corrected sword's FRONT face (or its back face: turquoise guard) through any (a, w) mm → screen px
   map. Everything comes from swordspec53x; a Look only changes colours / weights / wear. Paint order (face-on): blade halves,
   lattice (dark ground → pale frames → pale diamonds → dark stars), wear near the guard, edge bands, ridge, inscription, sheen,
   silhouette; then grip, hoops, pommel; the guard last (it covers the blade base and the grip's end). */
export type Map2 = (a: number, w: number) => [number, number];
const f1 = (v: number) => v.toFixed(1);

export const SwordFlatX: React.FC<{M: Map2; look: Look; id: string; back?: boolean; marks?: boolean; hilt?: boolean}> = ({M, look: L, id, back = false, marks = true, hilt = true}) => {
	const P = (a: number, w: number) => { const q = M(a, w); return `${f1(q[0])},${f1(q[1])}`; };
	const poly = (pts: [number, number][], close = true) => 'M' + pts.map(([a, w]) => P(a, w)).join('L') + (close ? 'Z' : '');
	/** a closed Catmull-Rom curve through [a, w] points (the guard's cast scrolls are rounded, not faceted) */
	const smooth = (pts: [number, number][]) => { const q = pts.map(([a, w]) => M(a, w)), n = q.length; let d = `M${f1(q[0][0])},${f1(q[0][1])}`;
		for (let i = 0; i < n; i++) { const p0 = q[(i - 1 + n) % n], p1 = q[i], p2 = q[(i + 1) % n], p3 = q[(i + 2) % n];
			d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)},${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)},${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])},${f1(p2[1])}`; }
		return d + 'Z'; };
	const k = (() => { const p = M(200, 0), q = M(210, 0); return Math.hypot(p[0] - q[0], p[1] - q[1]) / 10; })();   // px per mm
	const px = (mm: number, min = 0.35) => Math.max(min, mm * k);
	const a0 = A.blade0, N = 140, ss = Array.from({length: N + 1}, (_, i) => LBLADE * Math.pow(i / N, 0.9));
	const edgeL = (sg: number) => ss.map((s) => [a0 + s, sg * hwS(s)] as [number, number]);
	const innerL = (sg: number) => ss.map((s) => [a0 + s, sg * Math.max(0, hwS(s) - edgeS(s))] as [number, number]);
	const outline = poly([...edgeL(1), ...edgeL(-1).reverse()]);
	const half = (sg: number) => poly([...innerL(sg), [a0, 0]]);
	const band = (sg: number) => poly([...edgeL(sg), ...innerL(sg).reverse()]);
	/* the lattice: one set of shapes, clipped per half so each half takes its own lit/shade metal */
	const nodes = latNodes(-LAT.P, LBLADE + LAT.P), cells = latCellCentres(-LAT.P, LBLADE + LAT.P);
	const Q = (pts: [number, number][]) => 'M' + pts.map(([s, w]) => P(a0 + s, w)).join('L') + 'Z';
	const keep = (s: number, w: number) => Math.abs(w) - LAT.D * 1.2 < hwS(Math.max(0, s));
	const cellD = cells.filter((c) => keep(c.s, c.w)).map((c) => Q(diamond(c.s, c.w, L.cellSc, 0.14))).join('');
	const frameD = L.frame > 0 ? cells.filter((c) => keep(c.s, c.w)).map((c) => Q(diamond(c.s, c.w, L.cellSc + 0.11, 0.08))).join('') : '';
	const starD = nodes.filter((n) => keep(n.s, n.w)).map((n) => Q(star(n.s, n.w, L.star[0], L.star[1], L.star[2]))).join('');
	const small = k < 1.2;                                         // at phone size: drop the frames, keep diamonds + stars
	/* wear: a brown patina veil over the lattice near the guard, fading out by s ≈ 135, and a few dark blotches */
	const wearBlobs = L.wear > 0 ? Array.from({length: 22}, (_, i) => { const s = 4 + 128 * Math.pow(rnd(i, 3), 1.3), w = (rnd(i, 4) - 0.5) * 36, r = 2 + 4.5 * rnd(i, 5);
		const pts = Array.from({length: 9}, (_, j) => { const t = j / 9 * 2 * Math.PI, rr = r * (0.7 + 0.5 * rnd(i * 9 + j, 6)); return [s + rr * Math.cos(t) * 1.3, w + rr * Math.sin(t)] as [number, number]; });
		return {d: Q(pts), o: (0.5 + 0.5 * rnd(i, 7)) * (1 - s / 140), dark: rnd(i, 8) > 0.35}; }) : [];
	const g0 = M(a0 + 200, 0), gU = M(a0 + 200, 23), gL = M(a0 + 200, -23), t0 = M(a0, 0), t1 = M(A.L, 0);
	const h0 = M(40, R_POM), h1 = M(40, -R_POM), c0 = M(40, R_GRIP + 0.4), c1 = M(40, -R_GRIP - 0.4);
	const inlay = back ? L.turq : L.glass;
	return <g>
		<defs>
			<linearGradient id={`bu${id}`} gradientUnits="userSpaceOnUse" x1={g0[0]} y1={g0[1]} x2={gU[0]} y2={gU[1]}><stop offset="0" stopColor={mix(L.blade.lit, '#FFFFFF', 0.08)} /><stop offset="1" stopColor={L.blade.body} /></linearGradient>
			<linearGradient id={`bl${id}`} gradientUnits="userSpaceOnUse" x1={g0[0]} y1={g0[1]} x2={gL[0]} y2={gL[1]}><stop offset="0" stopColor={L.blade.dark} /><stop offset="1" stopColor={mix(L.blade.body, L.blade.dark, 0.4)} /></linearGradient>
			<linearGradient id={`pu${id}`} gradientUnits="userSpaceOnUse" x1={g0[0]} y1={g0[1]} x2={gU[0]} y2={gU[1]}><stop offset="0" stopColor={mix(L.pale, '#FFFFFF', 0.1)} /><stop offset="1" stopColor={mix(L.pale, L.blade.body, 0.35)} /></linearGradient>
			<linearGradient id={`pl${id}`} gradientUnits="userSpaceOnUse" x1={g0[0]} y1={g0[1]} x2={gL[0]} y2={gL[1]}><stop offset="0" stopColor={mix(L.pale, L.blade.dark, 0.5)} /><stop offset="1" stopColor={mix(L.pale, L.blade.dark, 0.32)} /></linearGradient>
			<linearGradient id={`sh${id}`} gradientUnits="userSpaceOnUse" x1={t0[0]} y1={t0[1]} x2={t1[0]} y2={t1[1]}><stop offset="0" stopColor="#FFF8E8" stopOpacity="0" /><stop offset="0.42" stopColor="#FFF8E8" stopOpacity={L.sheen} /><stop offset="0.6" stopColor="#FFF8E8" stopOpacity={L.sheen * 0.5} /><stop offset="0.85" stopColor="#FFF8E8" stopOpacity="0" /></linearGradient>
			<linearGradient id={`wr${id}`} gradientUnits="userSpaceOnUse" x1={t0[0]} y1={t0[1]} x2={M(a0 + 140, 0)[0]} y2={M(a0 + 140, 0)[1]}><stop offset="0" stopColor={mix(L.blade.dark, '#3E3020', 0.6)} stopOpacity={0.82 * L.wear} /><stop offset="0.6" stopColor={mix(L.blade.dark, '#3E3020', 0.6)} stopOpacity={0.5 * L.wear} /><stop offset="1" stopColor={L.blade.dark} stopOpacity="0" /></linearGradient>
			<linearGradient id={`cy${id}`} gradientUnits="userSpaceOnUse" x1={c0[0]} y1={c0[1]} x2={c1[0]} y2={c1[1]}><stop offset="0" stopColor={L.hilt.deep} /><stop offset="0.16" stopColor={L.hilt.body} /><stop offset="0.3" stopColor={L.hilt.lit} /><stop offset="0.36" stopColor={L.hilt.spec} /><stop offset="0.44" stopColor={L.hilt.lit} /><stop offset="0.7" stopColor={L.hilt.body} /><stop offset="1" stopColor={L.hilt.deep} /></linearGradient>
			<linearGradient id={`pm${id}`} gradientUnits="userSpaceOnUse" x1={h0[0]} y1={h0[1]} x2={h1[0]} y2={h1[1]}><stop offset="0" stopColor={L.hilt.deep} /><stop offset="0.2" stopColor={L.hilt.lit} /><stop offset="0.3" stopColor={L.hilt.body} /><stop offset="0.8" stopColor={L.hilt.deep} /><stop offset="1" stopColor={mix(L.hilt.deep, L.hilt.body, 0.5)} /></linearGradient>
			<linearGradient id={`gd${id}`} gradientUnits="userSpaceOnUse" x1={M(A.apex, 25)[0]} y1={M(A.apex, 25)[1]} x2={M(A.guard0, -25)[0]} y2={M(A.guard0, -25)[1]}><stop offset="0" stopColor={mix(L.hilt.body, L.hilt.lit, 0.35)} /><stop offset="0.5" stopColor={L.hilt.body} /><stop offset="1" stopColor={L.hilt.deep} /></linearGradient>
			<radialGradient id={`in${id}`} cx="0.4" cy="0.36" r="0.8"><stop offset="0" stopColor={mix(inlay.hi, inlay.body, L.rim > 0 ? 0.2 : 0.55)} /><stop offset="0.35" stopColor={inlay.body} /><stop offset="1" stopColor={inlay.deep} /></radialGradient>
			<clipPath id={`hu${id}`}><path d={half(1)} /></clipPath><clipPath id={`hl${id}`}><path d={half(-1)} /></clipPath>
		</defs>
		{/* blade */}
		<path d={half(1)} fill={`url(#bu${id})`} /><path d={half(-1)} fill={`url(#bl${id})`} />
		{([1, -1] as const).map((sg) => <g key={sg} clipPath={`url(#h${sg > 0 ? 'u' : 'l'}${id})`}>
			<path d={half(sg)} fill={L.ink} opacity={L.inkOp * (sg > 0 ? 0.92 : 1)} />
			{frameD && !small && <path d={frameD} fill="none" stroke={`url(#p${sg > 0 ? 'u' : 'l'}${id})`} strokeWidth={px(L.frame, 0.4)} strokeOpacity={L.paleOp * 0.8} />}
			<path d={cellD} fill={`url(#p${sg > 0 ? 'u' : 'l'}${id})`} opacity={L.paleOp} />
			<path d={starD} fill={L.ink} opacity={L.inkOp} />
			{L.wear > 0 && <path d={half(sg)} fill={`url(#wr${id})`} />}
			{wearBlobs.map((b, i) => <path key={i} d={b.d} fill={b.dark ? L.ink : mix(L.blade.body, '#6A5634', 0.4)} opacity={L.wear * b.o * (b.dark ? 0.35 : 0.45)} />)}
		</g>)}
		<path d={band(1)} fill={L.edge.lit} /><path d={band(-1)} fill={L.edge.dark} />
		<path d={poly(innerL(1), false)} fill="none" stroke={L.ink} strokeOpacity={0.35} strokeWidth={px(0.3, 0.4)} />
		<path d={poly(innerL(-1), false)} fill="none" stroke={L.ink} strokeOpacity={0.35} strokeWidth={px(0.3, 0.4)} />
		{/* the ridge (剑脊) to just short of the point */}
		<path d={`M${P(a0 + 2, 0.35)}L${P(A.L - 6, 0.12)}`} stroke={L.ridge.hi} strokeWidth={px(L.ridge.w, 0.6)} strokeLinecap="round" strokeOpacity={0.9} />
		<path d={`M${P(a0 + 2, -0.45)}L${P(A.L - 6, -0.15)}`} stroke={L.ridge.lo} strokeWidth={px(L.ridge.w * 0.7, 0.5)} strokeLinecap="round" strokeOpacity={0.7} />
		{marks && <MarksX M={M} look={L} k={k} />}
		<path d={outline} fill={`url(#sh${id})`} />
		{L.rim > 0 && <path d={poly(edgeL(1), false)} fill="none" stroke={mix(L.edge.lit, '#FFFFFF', 0.4)} strokeOpacity={L.rim} strokeWidth={Math.max(1, px(0.5))} />}
		<path d={outline} fill="none" stroke={L.outline.col} strokeWidth={L.outline.w} strokeOpacity={0.85} />
		{hilt && <g>
			{/* grip, hoops, pommel (near-black patinated bronze) */}
			<path d={poly([[A.grip0, R_GRIP], [A.grip1, R_GRIP], [A.grip1, -R_GRIP], [A.grip0, -R_GRIP]])} fill={`url(#cy${id})`} />
			{HOOPS.map((h) => <g key={h}>
				<path d={poly([[h - HOOP_HL, R_HOOP], [h + HOOP_HL, R_HOOP], [h + HOOP_HL, -R_HOOP], [h - HOOP_HL, -R_HOOP]])} fill={`url(#cy${id})`} />
				<path d={`M${P(h - HOOP_HL, R_HOOP)}L${P(h - HOOP_HL, -R_HOOP)}M${P(h + HOOP_HL, R_HOOP)}L${P(h + HOOP_HL, -R_HOOP)}`} stroke={L.hilt.deep} strokeWidth={px(0.35, 0.5)} strokeOpacity={0.9} />
				<path d={`M${P(h, R_HOOP - 0.3)}L${P(h, -R_HOOP + 0.3)}`} stroke={L.hilt.spec} strokeWidth={px(0.25, 0.4)} strokeOpacity={0.35} /></g>)}
			<path d={'M' + [...POM_PROF.map(([a, r]) => P(a, r)), ...POM_PROF.slice().reverse().map(([a, r]) => P(a, -r))].join('L') + 'Z'} fill={`url(#pm${id})`} stroke={L.outline.col} strokeWidth={Math.max(0.6, L.outline.w * 0.8)} strokeOpacity={0.8} />
			<path d={`M${P(0.3, R_POM - 0.8)}L${P(0.3, -R_POM + 0.8)}`} stroke={L.hilt.spec} strokeWidth={px(0.45, 0.6)} strokeOpacity={0.6} />
			{L.rim > 0 && <path d={poly([[A.grip0, R_GRIP], [A.grip1, R_GRIP]], false)} stroke={L.hilt.spec} strokeOpacity={0.5 * L.rim} strokeWidth={Math.max(1, px(0.35))} />}
			{/* guard: dark block, relief scrolls of the beast face, two inlay cells each side */}
			<path d={poly(GUARD_OUT)} fill={`url(#gd${id})`} stroke={L.outline.col} strokeWidth={Math.max(0.8, L.outline.w)} strokeLinejoin="round" />
			<path d={poly(GUARD_OUT.slice(Math.floor(GUARD_OUT.length / 2) - 8, Math.floor(GUARD_OUT.length / 2) + 9), false)} fill="none" stroke={L.relief.lit} strokeOpacity={0.45} strokeWidth={px(0.5, 0.6)} />
			{([1, -1] as const).map((sg) => <g key={sg}>
				{guardRelief(sg).map((r, i) => <g key={i}>
					<path d={i === 3 ? poly(r) : smooth(r)} fill="none" stroke={L.relief.recess} strokeWidth={px(1.1, 0.8)} strokeLinejoin="round" />
					<path d={i === 3 ? poly(r) : smooth(r)} fill={L.relief.fill} stroke={L.relief.lit} strokeWidth={px(0.3, 0.4)} strokeOpacity={0.8} strokeLinejoin="round" /></g>)}
				<circle cx={M(EYE.a, sg * EYE.w)[0]} cy={M(EYE.a, sg * EYE.w)[1]} r={px(EYE.r + 0.9)} fill={L.relief.recess} />
				<circle cx={M(EYE.a, sg * EYE.w)[0]} cy={M(EYE.a, sg * EYE.w)[1]} r={px(EYE.r)} fill={`url(#in${id})`} />
				<circle cx={M(EYE.a + 1.2, sg * EYE.w + 1.1)[0]} cy={M(EYE.a + 1.2, sg * EYE.w + 1.1)[1]} r={px(0.6)} fill={inlay.hi} opacity={L.rim > 0 ? 0.7 : 0.3} />
				<path d={smooth(commaCell(sg))} fill={`url(#in${id})`} stroke={L.relief.recess} strokeWidth={px(0.7, 0.6)} />
			</g>)}
		</g>}
	</g>;
};

/** the eight glyphs (pale, on top of the lattice), each mapped from its 60 × 110 box onto the blade */
const MarksX: React.FC<{M: Map2; look: Look; k: number}> = ({M, look: L, k}) => <g>
	{([-1, 1] as const).flatMap((side) => [0, 1, 2, 3].map((n) => { const [s, w] = markAt(side, n), a = A.blade0 + s, c = M(a, w), ea = M(a + 1, w), ew = M(a, w + 1);
		const va = [ea[0] - c[0], ea[1] - c[1]], vw = [ew[0] - c[0], ew[1] - c[1]], sx = MARK.wid / 60, sy = MARK.len / 110;
		/* box x+ → −w (the viewer's right with the tip up), box y+ (down) → −a (toward the guard) */
		const ma = -vw[0] * sx, mb = -vw[1] * sx, mc = -va[0] * sy, md = -va[1] * sy, me = c[0] - ma * 30 - mc * 55, mf = c[1] - mb * 30 - md * 55;
		const d = GLYPHS[COLS[side][n]].join(' '), op = cl(0.3 + k * 0.5, 0, 1);
		return <g key={`${side}${n}`} transform={`matrix(${[ma, mb, mc, md, me, mf].map((v) => v.toFixed(4)).join(' ')})`} opacity={op}>
			{L.mark.glow > 0 && <path d={d} fill="none" stroke={L.ink} strokeOpacity={L.mark.glow} strokeWidth={L.mark.w * 2.6} strokeLinecap="round" strokeLinejoin="round" />}
			<path d={d} fill="none" stroke={L.mark.col} strokeWidth={L.mark.w} strokeLinecap="round" strokeLinejoin="round" /></g>; }))}</g>;

/** the pommel's end face seen head-on: the dish lip, 11 stepped concentric rings into a dark cup, light from the upper left */
export const PommelFaceX: React.FC<{cx: number; cy: number; k: number; look: Look; id: string}> = ({cx, cy, k, look: L, id}) => {
	const rings = Array.from({length: 11}, (_, i) => 17.6 - i * 1.36);
	const arc = (r: number, a0: number, a1: number) => { const p = (t: number) => `${f1(cx + r * k * Math.cos(t))},${f1(cy - r * k * Math.sin(t))}`; return `M${p(a0)}` + Array.from({length: 24}, (_, i) => 'L' + p(a0 + (a1 - a0) * (i + 1) / 24)).join(''); };
	return <g>
		<defs><radialGradient id={`pf${id}`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor={L.hilt.deep} /><stop offset="0.7" stopColor={mix(L.hilt.deep, L.hilt.body, 0.6)} /><stop offset="0.9" stopColor={L.hilt.body} /><stop offset="1" stopColor={L.hilt.lit} /></radialGradient></defs>
		<circle cx={cx} cy={cy} r={R_POM * k} fill={`url(#pf${id})`} stroke={L.outline.col} strokeWidth={1.2} />
		<path d={arc(R_POM - 0.9, Math.PI * 0.3, Math.PI * 1.15)} fill="none" stroke={L.hilt.spec} strokeWidth={Math.max(1, 0.7 * k)} strokeOpacity={0.55} strokeLinecap="round" />
		{rings.map((r, i) => <g key={i}>
			<circle cx={cx} cy={cy} r={r * k} fill="none" stroke={L.relief.recess} strokeWidth={Math.max(0.8, 0.45 * k)} />
			<path d={arc(r - 0.4, Math.PI * 0.35, Math.PI * 1.05)} fill="none" stroke={L.hilt.spec} strokeWidth={Math.max(0.6, 0.2 * k)} strokeOpacity={0.55 - i * 0.03} strokeLinecap="round" />
			<path d={arc(r - 0.4, Math.PI * 1.4, Math.PI * 1.95)} fill="none" stroke={L.hilt.lit} strokeWidth={Math.max(0.5, 0.15 * k)} strokeOpacity={0.3} strokeLinecap="round" /></g>)}
		<circle cx={cx} cy={cy} r={2.2 * k} fill={L.hilt.deep} stroke={L.hilt.lit} strokeOpacity={0.4} strokeWidth={Math.max(0.5, 0.15 * k)} />
	</g>; };
