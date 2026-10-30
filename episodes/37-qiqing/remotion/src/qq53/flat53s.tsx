import React from 'react';
import {cl, rnd} from '../qq50/kit50';
import {mix} from './parts53';
import {GripFlat53E} from './hiltflat53e';
import {A, LBLADE, hwS, edgeS, LAT, latCells, cellQuad, cellDiamond, latStar, GUARD_OUT, guardRelief, EYE, commaCell, smoothPath, POM_PROF, R_POM, R_GRIP, markAt, glyphD, glyphMatrix, LOOK} from './swordspec53s';
/* ep53 · the sword's FRONT face (or its back face: turquoise inlay) drawn through any (a, w) → screen map (cm, as the callers use):
   props53.Sword (a plain rotation and scale) and blade53c.BladeFlat (the chamber, the draw, the paper test, any camera) both draw
   this, so the flat views are one sword. v3.1: design C 「课本金」 (the owner's pick, SWORDDESIGN frame 2), everything from
   swordspec53s. Paint order (face-on): blade halves, lattice (dark ground → pale frames → pale diamonds → dark stars), the worn
   veil near the guard (the pattern still shows through it), edge bands, ridge, inscription, sheen, silhouette; then grip, hoops,
   pommel; the guard last (it covers the blade base and the grip's end). */
export type Map2 = (a: number, w: number) => [number, number];
const f1 = (v: number) => v.toFixed(1);
const L = LOOK;
export const SwordFlat: React.FC<{S: Map2; id: string; spec?: number; hilt?: boolean; marks?: boolean; lw?: number; edge?: string; markCol?: string; back?: boolean}> = ({S, id, spec = 0.3, hilt = true, marks = true, lw = 1, edge, markCol, back = false}) => {
	const M = (a: number, w: number) => S(a / 10, w / 10);                     // mm → the caller's cm map
	const P = (a: number, w: number) => { const q = M(a, w); return `${f1(q[0])},${f1(q[1])}`; };
	const poly = (pts: [number, number][], close = true) => 'M' + pts.map(([a, w]) => P(a, w)).join('L') + (close ? 'Z' : '');
	const smooth = (pts: [number, number][]) => smoothPath(pts.map(([a, w]) => M(a, w)));
	const k = (() => { const p = M(A.blade0 + 120, 0), q = M(A.blade0 + 130, 0); return Math.hypot(p[0] - q[0], p[1] - q[1]) / 10; })();   // px per mm
	const px = (mm: number, min = 0.35) => Math.max(min, mm * k);
	const a0 = A.blade0, N = 140, ss = Array.from({length: N + 1}, (_, i) => LBLADE * Math.pow(i / N, 0.9));
	const edgeL = (sg: number) => ss.map((s) => [a0 + s, sg * hwS(s)] as [number, number]);
	const innerL = (sg: number) => ss.map((s) => [a0 + s, sg * Math.max(0, hwS(s) - edgeS(s))] as [number, number]);
	const outline = poly([...edgeL(1), ...edgeL(-1).reverse()]);
	const half = (sg: number) => poly([...innerL(sg), [a0, 0]]);
	const band = (sg: number) => poly([...edgeL(sg), ...innerL(sg).reverse()]);
	/* the lattice: one set of shapes, clipped per half so each half takes its own lit/shade metal */
	const Q = (pts: [number, number][]) => 'M' + pts.map(([s, w]) => P(a0 + s, w)).join('L') + 'Z';
	const cells = latCells();
	const small = k < 1.2;                                         // at phone size: drop the frames, keep diamonds + stars
	const tiny = k < 0.35;                                         // a sliver of a sword: no stars either (they would be specks)
	const cellD = cells.map((c) => Q(cellDiamond(c))).join('');
	const frameD = !small ? cells.map((c) => Q(cellQuad(c, LAT.frSc))).join('') : '';
	const starD = !tiny ? cells.map((c) => Q(latStar(c))).join('') : '';
	/* wear: a brown patina veil over the lattice near the guard, fading out by s ≈ 135, and a few dark blotches (the pattern shows through) */
	const wearBlobs = Array.from({length: 22}, (_, i) => { const s = 4 + 128 * Math.pow(rnd(i, 3), 1.3), w = (rnd(i, 4) - 0.5) * 36, r = 2 + 4.5 * rnd(i, 5);
		const pts = Array.from({length: 9}, (_, j) => { const t = j / 9 * 2 * Math.PI, rr = r * (0.7 + 0.5 * rnd(i * 9 + j, 6)); return [s + rr * Math.cos(t) * 1.3, w + rr * Math.sin(t)] as [number, number]; });
		return {d: Q(pts), o: (0.5 + 0.5 * rnd(i, 7)) * (1 - s / 140), dark: rnd(i, 8) > 0.35}; });
	const g0 = M(a0 + 200, 0), gU = M(a0 + 200, 23), gL = M(a0 + 200, -23), t0 = M(a0, 0), t1 = M(A.L, 0);
	const h0 = M(40, R_POM), h1 = M(40, -R_POM);
	const inlay = back ? L.turq : L.glass;
	return <g>
		<defs>
			<linearGradient id={`bu${id}`} gradientUnits="userSpaceOnUse" x1={g0[0]} y1={g0[1]} x2={gU[0]} y2={gU[1]}><stop offset="0" stopColor={mix(L.blade.lit, '#FFFFFF', 0.08)} /><stop offset="1" stopColor={L.blade.body} /></linearGradient>
			<linearGradient id={`bl${id}`} gradientUnits="userSpaceOnUse" x1={g0[0]} y1={g0[1]} x2={gL[0]} y2={gL[1]}><stop offset="0" stopColor={L.blade.dark} /><stop offset="1" stopColor={mix(L.blade.body, L.blade.dark, 0.4)} /></linearGradient>
			<linearGradient id={`pu${id}`} gradientUnits="userSpaceOnUse" x1={g0[0]} y1={g0[1]} x2={gU[0]} y2={gU[1]}><stop offset="0" stopColor={mix(L.pale, '#FFFFFF', 0.1)} /><stop offset="1" stopColor={mix(L.pale, L.blade.body, 0.35)} /></linearGradient>
			<linearGradient id={`pl${id}`} gradientUnits="userSpaceOnUse" x1={g0[0]} y1={g0[1]} x2={gL[0]} y2={gL[1]}><stop offset="0" stopColor={mix(L.pale, L.blade.dark, 0.5)} /><stop offset="1" stopColor={mix(L.pale, L.blade.dark, 0.32)} /></linearGradient>
			<linearGradient id={`sh${id}`} gradientUnits="userSpaceOnUse" x1={t0[0]} y1={t0[1]} x2={t1[0]} y2={t1[1]}><stop offset="0" stopColor="#FFF8E8" stopOpacity="0" /><stop offset="0.42" stopColor="#FFF8E8" stopOpacity={L.sheen * spec / 0.3} /><stop offset="0.6" stopColor="#FFF8E8" stopOpacity={L.sheen * 0.5 * spec / 0.3} /><stop offset="0.85" stopColor="#FFF8E8" stopOpacity="0" /></linearGradient>
			<linearGradient id={`wr${id}`} gradientUnits="userSpaceOnUse" x1={t0[0]} y1={t0[1]} x2={M(a0 + 140, 0)[0]} y2={M(a0 + 140, 0)[1]}><stop offset="0" stopColor={mix(L.blade.dark, '#3E3020', 0.6)} stopOpacity={0.82 * L.wear} /><stop offset="0.6" stopColor={mix(L.blade.dark, '#3E3020', 0.6)} stopOpacity={0.5 * L.wear} /><stop offset="1" stopColor={L.blade.dark} stopOpacity="0" /></linearGradient>
			<linearGradient id={`pm${id}`} gradientUnits="userSpaceOnUse" x1={h0[0]} y1={h0[1]} x2={h1[0]} y2={h1[1]}><stop offset="0" stopColor={L.hilt.deep} /><stop offset="0.2" stopColor={L.hilt.lit} /><stop offset="0.3" stopColor={L.hilt.body} /><stop offset="0.8" stopColor={L.hilt.deep} /><stop offset="1" stopColor={mix(L.hilt.deep, L.hilt.body, 0.5)} /></linearGradient>
			<linearGradient id={`gd${id}`} gradientUnits="userSpaceOnUse" x1={M(A.apex, 25)[0]} y1={M(A.apex, 25)[1]} x2={M(A.guard0, -25)[0]} y2={M(A.guard0, -25)[1]}><stop offset="0" stopColor={mix(L.hilt.body, L.hilt.lit, 0.35)} /><stop offset="0.5" stopColor={L.hilt.body} /><stop offset="1" stopColor={L.hilt.deep} /></linearGradient>
			<radialGradient id={`in${id}`} cx="0.4" cy="0.36" r="0.8"><stop offset="0" stopColor={mix(inlay.hi, inlay.body, 0.2)} /><stop offset="0.35" stopColor={inlay.body} /><stop offset="1" stopColor={inlay.deep} /></radialGradient>
			<clipPath id={`hu${id}`}><path d={half(1)} /></clipPath><clipPath id={`hl${id}`}><path d={half(-1)} /></clipPath>
		</defs>
		{/* blade */}
		<path d={half(1)} fill={`url(#bu${id})`} /><path d={half(-1)} fill={`url(#bl${id})`} />
		{([1, -1] as const).map((sg) => <g key={sg} clipPath={`url(#h${sg > 0 ? 'u' : 'l'}${id})`}>
			<path d={half(sg)} fill={L.ink} opacity={L.inkOp * (sg > 0 ? 0.92 : 1)} />
			{frameD && <path d={frameD} fill="none" stroke={`url(#p${sg > 0 ? 'u' : 'l'}${id})`} strokeWidth={px(L.frame * lw, 0.4)} strokeOpacity={L.paleOp * 0.8} />}
			<path d={cellD} fill={`url(#p${sg > 0 ? 'u' : 'l'}${id})`} opacity={L.paleOp} />
			{starD && <path d={starD} fill={L.ink} opacity={L.inkOp} />}
			<path d={half(sg)} fill={`url(#wr${id})`} />
			{!small && wearBlobs.map((b, i) => <path key={i} d={b.d} fill={b.dark ? L.ink : mix(L.blade.body, '#6A5634', 0.4)} opacity={L.wear * b.o * (b.dark ? 0.35 : 0.45)} />)}
		</g>)}
		<path d={band(1)} fill={L.edge.lit} /><path d={band(-1)} fill={L.edge.dark} />
		<path d={poly(innerL(1), false)} fill="none" stroke={L.ink} strokeOpacity={0.35} strokeWidth={px(0.3, 0.4)} />
		<path d={poly(innerL(-1), false)} fill="none" stroke={L.ink} strokeOpacity={0.35} strokeWidth={px(0.3, 0.4)} />
		{/* the ridge (剑脊): one thin gold crease to just short of the point, a faint shade line beside it */}
		<path d={`M${P(a0 + 2, 0.35)}L${P(A.L - 6, 0.12)}`} stroke={L.ridge.hi} strokeWidth={px(L.ridge.w, 0.6)} strokeLinecap="round" strokeOpacity={0.9} />
		<path d={`M${P(a0 + 2, -0.45)}L${P(A.L - 6, -0.15)}`} stroke={L.ridge.lo} strokeWidth={px(L.ridge.w * 0.7, 0.5)} strokeLinecap="round" strokeOpacity={0.7} />
		{marks && <MarksFlat M={M} k={k} col={markCol} />}
		<path d={outline} fill={`url(#sh${id})`} />
		<path d={poly(edgeL(1), false)} fill="none" stroke={edge ?? mix(L.edge.lit, '#FFFFFF', 0.4)} strokeOpacity={edge ? 0.6 : L.rim} strokeWidth={Math.max(1, px(0.5))} />
		<path d={outline} fill="none" stroke={L.outline.col} strokeWidth={L.outline.w} strokeOpacity={0.85} />
		{hilt && <g>
			{/* grip and its two low rings (hiltflat53e), the pommel dish (near-black patinated bronze) */}
			<GripFlat53E M={M} kmm={k} id={id} />
			<path d={'M' + [...POM_PROF.map(([a, r]) => P(a, r)), ...POM_PROF.slice().reverse().map(([a, r]) => P(a, -r))].join('L') + 'Z'} fill={`url(#pm${id})`} stroke={L.outline.col} strokeWidth={Math.max(0.6, L.outline.w * 0.8)} strokeOpacity={0.8} />
			<path d={`M${P(0.3, R_POM - 0.8)}L${P(0.3, -R_POM + 0.8)}`} stroke={L.hilt.spec} strokeWidth={px(0.45, 0.6)} strokeOpacity={0.6} />
			{/* guard: dark block, relief scrolls of the beast face, the eye and the comma cell each side */}
			<path d={poly(GUARD_OUT)} fill={`url(#gd${id})`} stroke={L.outline.col} strokeWidth={Math.max(0.8, L.outline.w)} strokeLinejoin="round" />
			<path d={poly(GUARD_OUT.slice(Math.floor(GUARD_OUT.length / 2) - 8, Math.floor(GUARD_OUT.length / 2) + 9), false)} fill="none" stroke={L.relief.lit} strokeOpacity={0.45} strokeWidth={px(0.5, 0.6)} />
			{k > 0.5 && ([1, -1] as const).map((sg) => <g key={sg}>
				{guardRelief(sg).map((r, i) => <g key={i}>
					<path d={i === 3 ? poly(r) : smooth(r)} fill="none" stroke={L.relief.recess} strokeWidth={px(1.1, 0.8)} strokeLinejoin="round" />
					<path d={i === 3 ? poly(r) : smooth(r)} fill={L.relief.fill} stroke={L.relief.lit} strokeWidth={px(0.3, 0.4)} strokeOpacity={0.8} strokeLinejoin="round" /></g>)}
			</g>)}
			{([1, -1] as const).map((sg) => <g key={`i${sg}`}>
				<circle cx={M(EYE.a, sg * EYE.w)[0]} cy={M(EYE.a, sg * EYE.w)[1]} r={px(EYE.r + 0.9)} fill={L.relief.recess} />
				<circle cx={M(EYE.a, sg * EYE.w)[0]} cy={M(EYE.a, sg * EYE.w)[1]} r={px(EYE.r)} fill={`url(#in${id})`} />
				<circle cx={M(EYE.a + 1.2, sg * EYE.w + 1.1)[0]} cy={M(EYE.a + 1.2, sg * EYE.w + 1.1)[1]} r={px(0.6)} fill={inlay.hi} opacity={0.7} />
				<path d={smooth(commaCell(sg))} fill={`url(#in${id})`} stroke={L.relief.recess} strokeWidth={px(0.7, 0.6)} />
			</g>)}
		</g>}
	</g>;
};
/** the eight glyphs on a flat view (pale, on the lattice; the same glyphs, places and orientation as blade53c.MarkSet) */
const MarksFlat: React.FC<{M: Map2; k: number; col?: string}> = ({M, k, col}) => <g>
	{([-1, 1] as const).flatMap((side) => [0, 1, 2, 3].map((n) => { const [a, w] = markAt(side, n), m = glyphMatrix(M(a, w), M(a + 1, w), M(a, w + 1)), d = glyphD(side, n), op = cl(0.3 + k * 0.5, 0, 1);
		if (k < 0.25) return null;
		return <g key={`${side}${n}`} transform={m} opacity={op}>
			<path d={d} fill="none" stroke={L.ink} strokeOpacity={L.mark.glow} strokeWidth={L.mark.w * 2.6} strokeLinecap="round" strokeLinejoin="round" />
			<path d={d} fill="none" stroke={col ?? L.mark.col} strokeWidth={L.mark.w} strokeLinecap="round" strokeLinejoin="round" /></g>; }))}</g>;
