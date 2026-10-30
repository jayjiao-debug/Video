import React from 'react';
import {lerp} from '../qq50/kit50';
import {Cam, V3, proj, poly, toCam, mix} from './parts53';
import {bladeHW, LB} from './props53';
import {A, R_POM, R_GRIP, R_HOOP, HOOPS, HOOP_HL, POM_PROF, GUARD_OUT, guardT, guardRelief, EYE, commaCell, smoothPath, LOOK, SwordPose} from './swordspec53s';
/** the hilt and guard are near-black greenish bronze (design C), NOT gold: the old gold roles mapped onto LOOK.hilt */
const H = {...LOOK.hilt, mid: LOOK.hilt.body, hi: LOOK.hilt.spec, dark: '#141713', line: '#050605', relief: LOOK.relief.fill, reliefLit: LOOK.relief.lit, recess: LOOK.relief.recess, glass: LOOK.glass, turq: LOOK.turq};
const BZ = H;
import {BladeLand, LandOpts, Light} from './land53';
import {PommelFace} from './face53';
/* ep53 · the sword as a 3-D model drawn in SVG through the look-at camera (parts53). Units: mm; every dimension from
   swordspec53s (B1–B6): the local axis a runs from the pommel's end face (a = 0) to the tip (a = 556), lying level, the front
   face (blue glass) up. World placement: pommel end at (x0, ya, z0), axis along dir·x.
   - Blade3D = land53.BladeLand (the same lit lattice as the one take), clipped at the guard's inverted V;
   - Guard3D = the guard outline extruded to its thickness, faces back-culled and painted far → near; the beast mask with the eye
     and comma cells, glass on the front face, turquoise on the back face (v3.1: design C, near-black bronze);
   - Hilt3D = the grip, its two hoops and the pommel as surfaces of revolution (silhouettes taken per station, so they stay right
     when the camera looks along the axis), the end face with its 11 rings drawn by face53.PommelFace (the dive's ring match);
   - Sword3D paints the three in the order the camera's place along the axis gives (no part ever pokes through another). */
export type {SwordPose};
const A_BLADE = A.blade0, LEN = A.L;
const W = (sp: SwordPose, a: number, y: number, z: number): V3 => [sp.x0 + sp.dir * a, sp.ya + y, sp.z0 + z];
const circleYZ = (sp: SwordPose, a: number, r: number, n = 40): V3[] => Array.from({length: n}, (_, i) => { const t = (i / n) * 2 * Math.PI; return W(sp, a, r * Math.cos(t), r * Math.sin(t)); });
const pathOf = (pts: [number, number, number][]) => 'M' + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L') + 'Z';
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/** the camera's place along the sword's axis (mm from the pommel's end face) */
const axialOf = (c: Cam, sp: SwordPose) => (c.p[0] - sp.x0) * sp.dir;

/** the default light of the 3-D views: the case spot from above-front and a soft fill */
export const LIGHTS3D: Light[] = [{dir: [0.08, -0.28, 0.96], k: 0.95}, {dir: [-0.55, -0.6, 0.5], k: 0.45}];
/** the blade: BladeLand (lit lattice, ridge, edge strips) — `land` overrides its options; sheen = position 0..1 of a wash */
export const Blade3D: React.FC<{c: Cam; sp: SwordPose; id: string; lit?: number; sheen?: number; sheenCol?: string; fog?: (d: number) => number; fogCol?: string; rust?: number; land?: Partial<LandOpts>}> = ({c, sp, id, lit = 1, sheen = -1, land}) =>
	<BladeLand c={c} sp={sp} id={id} o={{lights: LIGHTS3D, shin: 90, lift: 0.18 * lit, sheen: sheen >= 0 ? {pos: sheen, k: 0.62} : undefined, guardCut: true, ...land}} />;

/** guard: the shared outline extruded to ±guardT(a), near-black greenish bronze (design C); each broad face carries the beast
    mask (rounded raised scrolls) and the round eye + comma cells: blue glass on the front face (z+), turquoise on the back (B5) */
export const Guard3D: React.FC<{c: Cam; sp: SwordPose; id: string; lite?: number}> = ({c, sp, id, lite = 0}) => {
	const O = GUARD_OUT, n = O.length, F = (k: number, s: 1 | -1) => W(sp, O[k][0], O[k][1], s * guardT(O[k][0]));
	type Face = {d: string; z: number; kind: 'front' | 'back' | 'side'; shade: number};
	const faces: Face[] = [];
	const depth = (pts: V3[]) => pts.reduce((m, q) => m + toCam(c, q)[2], 0) / pts.length;
	const front = O.map((_, k) => F(k, 1)), back = O.map((_, k) => F(k, -1));
	if (c.p[2] > sp.z0 + guardT(92)) faces.push({d: poly(c, front), z: depth(front), kind: 'front', shade: 0});
	if (c.p[2] < sp.z0 - guardT(92)) faces.push({d: poly(c, back), z: depth(back), kind: 'back', shade: 0});
	for (let k = 0; k < n; k++) { const k1 = (k + 1) % n, da = O[k1][0] - O[k][0], dw = O[k1][1] - O[k][1];
		/* the outline runs clockwise in (a, w): the outward normal of an edge is (−dw, da) */
		const nw: V3 = [sp.dir * -dw, da, 0], q = [F(k, 1), F(k1, 1), F(k1, -1), F(k, -1)], m = q.reduce((s, p) => [s[0] + p[0] / 4, s[1] + p[1] / 4, s[2] + p[2] / 4] as V3, [0, 0, 0] as V3);
		if (dot(nw, [c.p[0] - m[0], c.p[1] - m[1], c.p[2] - m[2]]) <= 0) continue;
		const ln = Math.hypot(nw[0], nw[1]) || 1, shade = 0.5 + 0.5 * (-nw[1] / ln);       // faces toward −y (the front of the case) are lit
		faces.push({d: poly(c, q), z: depth(q), kind: 'side', shade}); }
	faces.sort((a, b) => b.z - a.z);
	const ppm = c.f / Math.max(1, toCam(c, W(sp, 92, 0, 0))[2]), px = (mm: number, min = 0.5) => Math.max(min, mm * ppm);
	/* a face point lifted off the broad face s (±1) by lift mm, projected */
	const S2 = (a: number, w: number, s: 1 | -1, lift: number): [number, number] => { const p = proj(c, W(sp, a, w, s * (guardT(a) + lift))); return [p[0], p[1]]; };
	const ok = (pts: [number, number][]) => pts.every((q) => Number.isFinite(q[0]) && Number.isFinite(q[1]));
	const mask = (sd: 1 | -1, back: boolean) => { const inl = back ? H.turq : H.glass;
		return ([1, -1] as const).map((sg) => { const rel = guardRelief(sg).map((r, i) => { const q = r.map(([a, w]) => S2(a, w, sd, 0.3)); if (!ok(q)) return null;
				const d = i === 3 ? 'M' + q.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L') + 'Z' : smoothPath(q);
				return <g key={i}><path d={d} fill="none" stroke={H.recess} strokeWidth={px(1.1, 0.7)} strokeLinejoin="round" />
					<path d={d} fill={mix(H.relief, H.reliefLit, 0.25 * lite)} stroke={H.reliefLit} strokeWidth={px(0.3, 0.35)} strokeOpacity={0.8} strokeLinejoin="round" /></g>; });
			const e = S2(EYE.a, sg * EYE.w, sd, 0.45), cm = commaCell(sg).map(([a, w]) => S2(a, w, sd, 0.45)), hl = S2(EYE.a + 1.2, sg * EYE.w + 1.1, sd, 0.5);
			return <g key={sg}>{rel}
				{ok([e]) && <circle cx={e[0]} cy={e[1]} r={px(EYE.r + 0.9)} fill={H.recess} />}
				{ok([e]) && <circle cx={e[0]} cy={e[1]} r={px(EYE.r)} fill={`url(#${back ? 'gt' : 'gg'}${id})`} />}
				{ok([hl]) && <circle cx={hl[0]} cy={hl[1]} r={px(0.6, 0.4)} fill={inl.hi} opacity={0.7} />}
				{ok(cm) && <path d={smoothPath(cm)} fill={`url(#${back ? 'gt' : 'gg'}${id})`} stroke={H.recess} strokeWidth={px(0.7, 0.5)} />}</g>; }); };
	return <g>
		<defs><radialGradient id={`gg${id}`} cx="0.4" cy="0.36" r="0.8"><stop offset="0" stopColor={mix(H.glass.hi, H.glass.body, 0.2)} /><stop offset="0.35" stopColor={H.glass.body} /><stop offset="1" stopColor={H.glass.deep} /></radialGradient>
			<radialGradient id={`gt${id}`} cx="0.4" cy="0.36" r="0.8"><stop offset="0" stopColor={mix(H.turq.hi, H.turq.body, 0.2)} /><stop offset="0.35" stopColor={H.turq.body} /><stop offset="1" stopColor={H.turq.deep} /></radialGradient></defs>
		{faces.map((f, i) => f.d ? <g key={i}>
			{(() => { const fc = f.kind === 'side' ? mix(mix(H.deep, H.lit, 0.15 + 0.55 * f.shade), '#B89868', 0.18 * lite) : mix(H.body, H.lit, 0.12 + 0.25 * lite);
				return <path d={f.d} fill={fc} stroke={f.kind === 'side' ? fc : H.line} strokeOpacity={f.kind === 'side' ? 1 : 0.8} strokeWidth={f.kind === 'side' ? 0.8 : 1} strokeLinejoin="round" />; })()}
			{f.kind !== 'side' && mask(f.kind === 'front' ? 1 : -1, f.kind === 'back')}
		</g> : null)}
	</g>; };

/** the hilt's light (world, toward the light): the case spot from above-front */
const L_HILT: V3 = [0.08, -0.28, 0.96];
/** grip (a smooth near-black cylinder carrying two low thin hoops; v3.1 design C: no cord) and the pommel disc; its end face with the 11 rings is face53.PommelFace.
    v3: the grip is cut into three sections between the hoops, and sections and hoops are painted far → near along the axis, each
    as the convex hull of its two end circles, so a nearer section hides the back half of a hoop's end ring (the hoops sit ON the
    grip instead of floating round it). Each hoop is a short solid band (R_HOOP over R_GRIP): its side shaded by the light round
    the cylinder (lit top, dark lower edge), its end ring toward the camera with a lit rim and a dark inner edge, and a thin
    contact shadow on the grip either side. The grip sections carry a low-contrast wrapped cord (helical grooves). */
export const Hilt3D: React.FC<{c: Cam; sp: SwordPose; id: string; ringGlow?: number; hi?: number}> = ({c, sp, id, ringGlow = 0, hi}) => {
	/* the silhouette of a surface of revolution: at each station a, the two points of radius r perpendicular to the view */
	const perp = (a: number) => { const q = W(sp, a, 0, 0), v = [q[0] - c.p[0], q[1] - c.p[1], q[2] - c.p[2]], n = Math.hypot(v[1], v[2]) || 1; return [-v[2] / n, v[1] / n]; };
	const rev = (prof: [number, number][]) => { const L: V3[] = [], R: V3[] = []; for (const [a, r] of prof) { const [oy, oz] = perp(a); L.push(W(sp, a, oy * r, oz * r)); R.push(W(sp, a, -oy * r, -oz * r)); } return poly(c, [...L, ...R.reverse()]); };
	const [oy, oz] = perp(45), p0 = proj(c, W(sp, 45, oy * R_HOOP, oz * R_HOOP)), p1 = proj(c, W(sp, 45, -oy * R_HOOP, -oz * R_HOOP));
	const ac = axialOf(c, sp), PF = W(sp, 0, 0, 0), fd = toCam(c, PF)[2];
	const facePt = (r: number, th: number): [number, number] => { const p = proj(c, W(sp, -0.2, r * Math.cos(th), r * Math.sin(th))); return [p[0], p[1]]; };
	/* light round the cylinder: the visible half runs from +perp (offset 0) through the side facing the camera to −perp (offset 1);
	   n0 = toward the camera in the y–z plane. Tone at each offset = the light on that normal (the gradient's stops). */
	const hc = W(sp, 45, 0, 0), hv = [c.p[1] - hc[1], c.p[2] - hc[2]], hn = Math.hypot(hv[0], hv[1]) || 1, n0 = [hv[0] / hn, hv[1] / hn];
	const lyz = [L_HILT[1], L_HILT[2]], ll = Math.hypot(lyz[0], lyz[1]);
	const shadeStops = (k: number) => Array.from({length: 9}, (_, i) => { const ph = Math.PI / 2 - i / 8 * Math.PI, ny = Math.cos(ph) * n0[0] + Math.sin(ph) * oy, nz = Math.cos(ph) * n0[1] + Math.sin(ph) * oz;
		const b = Math.max(0, (ny * lyz[0] + nz * lyz[1]) / ll), u = (1 - Math.sin(ph)) / 2;
		const col = b < 0.5 ? mix(BZ.deep, BZ.mid, b * 2) : mix(BZ.mid, k > 0.5 ? BZ.hi : BZ.lit, (b - 0.5) * 2);
		return <stop key={i} offset={u.toFixed(3)} stopColor={i === 0 || i === 8 ? mix(col, BZ.deep, 0.35 * k) : col} />; });
	const ppm = c.f / Math.max(1, toCam(c, hc)[2]);
	/* the screen direction toward the light across a hoop's end ring (for its gradient, in its bounding box) */
	const capDir = (() => { const a = proj(c, W(sp, 45, lyz[0] / ll * R_HOOP, lyz[1] / ll * R_HOOP)), b = proj(c, W(sp, 45, -lyz[0] / ll * R_HOOP, -lyz[1] / ll * R_HOOP)), dx = a[0] - b[0], dy = a[1] - b[1], n = Math.hypot(dx, dy) || 1; return [dx / n, dy / n]; })();
	/* a solid piece of the cylinder between a0 and a1 at radius r: the convex hull of its two end circles */
	const solid = (a0: number, a1: number, r: number, fill: string, key: string, extra?: React.ReactNode) => { const d = rev([[a0, r], [a1, r]]), e0 = poly(c, circleYZ(sp, a0, r, 40)), e1 = poly(c, circleYZ(sp, a1, r, 40));
		return <g key={key}>{d && <path d={d} fill={fill} />}{e0 && <path d={e0} fill={fill} />}{e1 && <path d={e1} fill={fill} />}{extra}</g>; };
	/* the wrapped cord on a grip section: one helical groove per turn (pitch 2.4 mm), over the half facing the camera; only when it reads */
	const cord = (a0: number, a1: number) => { if (ppm * 2.4 < 3.2) return null; const ds: string[] = [];
		for (let a = a0 + 0.8; a < a1 - 0.6; a += 2.4) { const pts = Array.from({length: 11}, (_, i) => { const ph = -Math.PI * 0.45 + i / 10 * Math.PI * 0.9, ny = Math.cos(ph) * n0[0] + Math.sin(ph) * oy, nz = Math.cos(ph) * n0[1] + Math.sin(ph) * oz;
			return W(sp, Math.min(a1 - 0.3, a + 1.2 * (ph / Math.PI + 0.5)), (R_GRIP + 0.05) * ny, (R_GRIP + 0.05) * nz); }); const d = poly(c, pts, false); if (d) ds.push(d); }
		return <g><path d={ds.join(' ')} stroke={BZ.deep} strokeOpacity={0.2} strokeWidth={Math.max(0.6, ppm * 0.34)} fill="none" strokeLinecap="round" />
			<path d={ds.join(' ')} stroke={BZ.hi} strokeOpacity={0.1} strokeWidth={Math.max(0.5, ppm * 0.22)} fill="none" transform={`translate(0,${-Math.max(0.6, ppm * 0.45).toFixed(2)})`} strokeLinecap="round" /></g>; };
	/* a thin contact shadow on the grip at the foot of a hoop (a band of the grip next to it) */
	const half = (a: number, r: number) => Array.from({length: 13}, (_, i) => { const ph = -Math.PI / 2 + i / 12 * Math.PI; return W(sp, a, r * (Math.cos(ph) * n0[0] + Math.sin(ph) * oy), r * (Math.cos(ph) * n0[1] + Math.sin(ph) * oz)); });
	const foot = (a0: number, a1: number, key: string) => { const d = poly(c, [...half(a0, R_GRIP + 0.04), ...half(a1, R_GRIP + 0.04).reverse()]); return d ? <path key={key} d={d} fill={BZ.line} opacity={0.38} /> : null; };
	const H0 = HOOPS[0], H1 = HOOPS[1], SEGS: [number, number][] = [[A.grip0 - 0.5, H0 - HOOP_HL], [H0 + HOOP_HL, H1 - HOOP_HL], [H1 + HOOP_HL, A.grip1]];
	const segPiece = ([a0, a1]: [number, number], i: number) => solid(a0, a1, R_GRIP, `url(#hs${id})`, `s${i}`, <>{void cord}
		{HOOPS.map((h) => Math.abs(a1 - (h - HOOP_HL)) < 0.01 ? <g key={h}>{foot(a1 - 1.4, a1, `fa${h}`)}</g> : Math.abs(a0 - (h + HOOP_HL)) < 0.01 ? <g key={h}>{foot(a0, a0 + 1.4, `fb${h}`)}</g> : null)}</>);
	/* a hoop: the band, its end ring toward the camera (lit rim on the light's side, dark where it meets the grip) */
	const hoop = (a: number) => { const capA = ac < a ? a - HOOP_HL : a + HOOP_HL, sw = Math.max(0.7, ppm * 0.38);
		const lit = (r: number) => { const pts: V3[] = []; for (let i = 0; i <= 24; i++) { const th = i / 24 * 2 * Math.PI, ny = Math.cos(th), nz = Math.sin(th); if (ny * lyz[0] + nz * lyz[1] > 0.25 * ll) pts.push(W(sp, capA, r * ny, r * nz)); } return pts.length > 1 ? poly(c, pts, false) : ''; };
		const rimHi = lit(R_HOOP - 0.15), ring = poly(c, circleYZ(sp, capA, R_HOOP, 40)), inner = poly(c, circleYZ(sp, capA, R_GRIP + 0.1, 40));
		return solid(a - HOOP_HL, a + HOOP_HL, R_HOOP, `url(#hh${id})`, `h${a}`, <>
			{ring && inner && <path d={ring + inner} fillRule="evenodd" fill={`url(#hc${id})`} />}
			{ring && <path d={ring} fill="none" stroke={BZ.line} strokeOpacity={0.55} strokeWidth={sw} />}
			{inner && <path d={inner} fill="none" stroke={BZ.line} strokeOpacity={0.7} strokeWidth={sw * 1.3} />}
			{rimHi && <path d={rimHi} fill="none" stroke={BZ.hi} strokeOpacity={0.85} strokeWidth={sw} strokeLinecap="round" />}
			{([1, -1] as const).map((k) => { const e = (x: number): V3 => { const [py, pz] = perp(x); return W(sp, x, k * py * (R_HOOP + 0.02), k * pz * (R_HOOP + 0.02)); }, d = poly(c, [e(a - HOOP_HL), e(a + HOOP_HL)], false);
				return d ? <path key={k} d={d} fill="none" stroke={BZ.line} strokeOpacity={0.45} strokeWidth={Math.max(0.6, sw * 0.7)} /> : null; })}</>); };
	/* far → near along the axis */
	const pieces: [number, React.ReactNode][] = [...SEGS.map((s, i) => [(s[0] + s[1]) / 2, segPiece(s, i)] as [number, React.ReactNode]), ...HOOPS.map((h) => [h, hoop(h)] as [number, React.ReactNode])];
	const inSpan = (m: number, i: number) => i < 3 && ac >= SEGS[i][0] && ac <= SEGS[i][1] ? -1 : Math.abs(ac - m);
	const grip = <g key="grip">{pieces.map(([m, n], i) => ({n, k: inSpan(m, i)})).sort((x, y) => (y.k < 0 ? -1 : y.k) - (x.k < 0 ? -1 : x.k) || 0).map((x) => x.n)}</g>;
	const hoops: React.ReactNode[] = [];
	const pommel = <path key="pom" d={rev(POM_PROF)} fill={`url(#hg${id})`} stroke={BZ.line} strokeOpacity={0.5} strokeWidth={1} />;
	/* seen from the blade side, the disc's rolled rim shows as a lit ring round the flare */
	/* seen from the blade side, the disc's back: the rolled rim, then the flare narrowing into the grip (solid surfaces) */
	const rimBack = ac > 9 ? (() => { const d = poly(c, circleYZ(sp, 2.2, R_POM, 56)), d2 = poly(c, circleYZ(sp, 3.0, POM_PROF[3][1], 56)), d3 = poly(c, circleYZ(sp, 4.0, POM_PROF[4][1], 48)); if (!d) return null;
		return <g key="rim"><path d={d} fill={BZ.dark} stroke={BZ.line} strokeOpacity={0.5} strokeWidth={1} /><path d={d2} fill={`url(#hg${id})`} /><path d={d3} fill={BZ.mid} opacity={0.55} /></g>; })() : null;
	const face = ac < -0.5 && fd > 1 ? <PommelFace key="face" id={id} pt={facePt} ppm={c.f / fd} hi={hi ?? 0.4 + ringGlow} /> : null;
	const parts = ac < 0 ? [grip, ...hoops, pommel, face] : [pommel, rimBack, grip, ...hoops];
	return <g>
		<defs><linearGradient id={`hg${id}`} gradientUnits="userSpaceOnUse" x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]}><stop offset="0" stopColor={BZ.deep} /><stop offset="0.3" stopColor={BZ.lit} /><stop offset="0.5" stopColor={BZ.mid} /><stop offset="1" stopColor={BZ.deep} /></linearGradient>
			<linearGradient id={`hs${id}`} gradientUnits="userSpaceOnUse" x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]}>{shadeStops(0)}</linearGradient>
			<linearGradient id={`hh${id}`} gradientUnits="userSpaceOnUse" x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]}>{shadeStops(1)}</linearGradient>
			<linearGradient id={`hc${id}`} x1={(0.5 + capDir[0] / 2).toFixed(3)} y1={(0.5 + capDir[1] / 2).toFixed(3)} x2={(0.5 - capDir[0] / 2).toFixed(3)} y2={(0.5 - capDir[1] / 2).toFixed(3)}>
				<stop offset="0" stopColor={BZ.lit} /><stop offset="0.45" stopColor={BZ.body} /><stop offset="1" stopColor={BZ.dark} /></linearGradient></defs>
		{parts}
	</g>; };

/** the whole sword: blade, guard and hilt painted in the order the camera's place along the axis gives */
export const Sword3D: React.FC<{c: Cam; sp: SwordPose; id: string; sheen?: number; fog?: (d: number) => number; fogCol?: string; ringGlow?: number; hi?: number; land?: Partial<LandOpts>; lite?: number}> = ({c, sp, id, sheen, ringGlow, hi, land, lite}) => {
	const ac = axialOf(c, sp);
	const blade = <Blade3D key="b" c={c} sp={sp} id={id} sheen={sheen} land={land} />, guard = <Guard3D key="g" c={c} sp={sp} id={id} lite={lite} />, hilt = <Hilt3D key="h" c={c} sp={sp} id={id} ringGlow={ringGlow} hi={hi} />;
	return <g>{ac > A.apex ? [hilt, guard, blade] : ac < A.guard0 ? [blade, guard, hilt] : [hilt, blade, guard]}</g>; };
export {A_BLADE, LEN, R_POM, bladeHW, LB, lerp, pathOf};
