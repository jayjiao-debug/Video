import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {Zun, ZunLight, proj, Cam} from './zun55h';
import {homeCam, rotL, HOME_BOX} from './home55h';
import {Glow, Vig, rnd, sm, pth, tube, P, f1, Haze, thK} from './kf55h';
import {Body, Sk} from './rig55h';
import {FilmOv2} from './ov55v2';
import {card2, END_CARD} from './cards55v2';
import {SANS, SERIF} from '../qq50/kit50';
import {useStampFonts, SEAL_SRC, SAFE_X, KAI} from '../qq44/skin44';
import {Glyphs55, poseFK, FK, ik2, track, trackN} from './act551k';
import {X4EndPicture} from './act554';
/* ep55 何尊 v2 · act 5 (builder 5): X5 → END, film 137.30 → 181.67 (frames 4119–5449).
   How 「中国」 became a country's name, told as SHADOW PLAY (皮影) inside the gold beam that rises from the 尊's mouth; then
   the glyphs fly home into the 尊, the museum today, and the end card.
   Coordinates: the "stage" = the HOME frame shifted by (DX, DY) (HOME world + (140, 520)), so the stage camera {fx, fy, s}
   (stage point at the screen centre, zoom) puts the 尊 low and right while the shadow play fills the light above it. */
const W = 1920, H = 1080;
const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
const ease = (u: number) => u * u * (3 - 2 * u);
const eio = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const eout = (u: number) => 1 - Math.pow(1 - u, 3);
const ein = (u: number) => u * u * u;
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const land = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 - Math.exp(-6 * u) * Math.cos(9 * u));
const BEAT = 2.26415 / 4, B0 = 1.4498;
const beatN = (t: number) => Math.floor((t - B0) / BEAT + 1e-6);
const beatT = (n: number) => B0 + n * BEAT;
/** 1 right on a beat, decaying over ~0.3 s */
const bpulse = (t: number, d = 0.12) => Math.exp(-(t - beatT(beatN(t))) / d);
const IDS = ['X5', 'X6', 'X7', 'X8', 'X9', 'X10', 'Y', 'Z', 'END'];
const cardOf = (t: number) => [...IDS].reverse().find((id) => t >= card2(id).t) ?? 'X5';
const T = (id: string) => card2(id).t;

/* ============================== stage geometry ============================== */
const DX = 140, DY = 520;
const HC = homeCam(30);
/** the mouth opening (inner lip ring, r 13.9 cm at z 38.8) in stage coordinates */
const MOUTH = (() => { const pts: P[] = Array.from({length: 64}, (_, j) => { const a = (j / 64) * 2 * Math.PI, q = proj(HC, [13.9 * Math.cos(a), 13.9 * Math.sin(a), 38.8]); return [q[0] + DX, q[1] + DY] as P; });
	const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
	return {x: (x0 + x1) / 2, y: (y0 + y1) / 2, rx: (x1 - x0) / 2, ry: (y1 - y0) / 2, pts}; })();
type Cm = {fx: number; fy: number; s: number};
const HOMEC: Cm = {fx: 960 + DX, fy: 540 + DY, s: 1};
const mixC = (a: Cm, b: Cm, u: number): Cm => ({fx: lerp(a.fx, b.fx, u), fy: lerp(a.fy, b.fy, u), s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), u))});
const camTf = (c: Cm) => `translate(960 540) scale(${c.s.toFixed(5)}) translate(${(-c.fx).toFixed(2)} ${(-c.fy).toFixed(2)})`;
const toScr = (c: Cm, p: P): P => [960 + c.s * (p[0] - c.fx), 540 + c.s * (p[1] - c.fy)];
const toStage = (c: Cm, q: P): P => [c.fx + (q[0] - 960) / c.s, c.fy + (q[1] - 540) / c.s];

/* the camera across the act (stage coordinates) */
const R5: Cm = {fx: 985, fy: 548, s: 0.95}, R5b: Cm = {fx: 1130, fy: 552, s: 1.14};
const R6: Cm = {fx: 1170, fy: 560, s: 0.8}, R6b: Cm = {fx: 1225, fy: 585, s: 1.02};
const G0: Cm = {fx: 840, fy: 548, s: 1.04}, G1: Cm = {fx: 1260, fy: 532, s: 1.1};
const G2: Cm = {fx: 1080, fy: 470, s: 1.0}, G3: Cm = {fx: 1120, fy: 440, s: 1.18};
const N0: Cm = {fx: 985, fy: 578, s: 0.9};
const P0: Cm = {fx: 975, fy: -330, s: 1.06}, P1: Cm = {fx: 990, fy: 470, s: 1.12};
const camAt = (t: number): Cm => { const id = cardOf(t);
	if (id === 'X5') { if (t < 139.35) return track<Cm>([[137.3, HOMEC], [137.5, {...HOMEC, fy: HOMEC.fy - 6}], [139.35, R5]], t, mixC, eio);
		/* after the rise: a steady track right and push in on the city (eased only at its start, so it never stalls) */
		const u = seg(t, 139.35, 141.83), e = u < 0.3 ? (u * u) / 0.6 : 0.15 + (u - 0.3) * (0.85 / 0.7); return mixC(R5, R5b, e); }
	if (id === 'X6') { if (t < 144.6) return track<Cm>([[141.83, R5b], [142.0, R5b], [144.6, R6]], t, mixC, eio);
		const u = seg(t, 144.6, 146.36); return mixC(R6, R6b, u * u * (1.5 - 0.5 * u)); }
	if (id === 'X7') { const u = seg(t, T('X7'), T('X8')); return mixC(G0, G1, 0.12 * u + 0.88 * ease(u)); }
	if (id === 'X8') { if (t < 152.7) return track<Cm>([[150.89, G1], [151.1, G1], [152.7, G2]], t, mixC, eio); const u = seg(t, 152.7, 155.42); return mixC(G2, G3, u * (1.4 - 0.4 * u)); }
	if (id === 'X9') { const u = seg(t, T('X9'), T('X10')); return mixC(N0, SHEETC, 0.22 * u + 0.78 * ease(u)); }
	if (id === 'X10' || t < 165.6) return pageCam(t);
	/* the crane down to HOME, landing on it at the cut still moving (cut on motion) */
	const u = seg(t, 165.6, T('Z')); return mixC(P1, HOMEC, 0.3 * u + 0.7 * ease(u)); };

/** the beam: k = how fast it widens upward (px per px), o = its strength, scr = the shadow-play screen glow, top = its top (stage y) */
const beamAt = (t: number) => {
	const k = t < T('X6') ? lerp(0.55, 1.0, eio(seg(t, 137.5, 139.2))) : t < T('Y') ? lerp(1.0, 2.25, eout(seg(t, T('X6'), T('X6') + 1.5))) : lerp(2.25, 0.7, eio(seg(t, 166.9, 168.0)));
	const top = lerp(-1700, MOUTH.y - 6, ein(seg(t, 167.9, 168.9)));
	const o = 1 - 0.85 * seg(t, 168.5, 169.0);
	const scr = t < T('Y') ? 0.62 * ease(seg(t, 137.65, 138.9)) + 0.12 * ease(seg(t, T('X6'), T('X6') + 1.2)) : (0.74 - 0.74 * ease(seg(t, 165.3, 167.6)));
	return {k, top, o, scr}; };
/** clip a convex polygon to a rect (Sutherland–Hodgman) */
const clipRect = (poly: P[], x0: number, y0: number, x1: number, y1: number): P[] => { let out = poly;
	const edges: [(p: P) => boolean, (a: P, b: P) => P][] = [
		[(p) => p[0] >= x0, (a, b) => [x0, a[1] + ((b[1] - a[1]) * (x0 - a[0])) / (b[0] - a[0])]], [(p) => p[0] <= x1, (a, b) => [x1, a[1] + ((b[1] - a[1]) * (x1 - a[0])) / (b[0] - a[0])]],
		[(p) => p[1] >= y0, (a, b) => [a[0] + ((b[0] - a[0]) * (y0 - a[1])) / (b[1] - a[1]), y0]], [(p) => p[1] <= y1, (a, b) => [a[0] + ((b[0] - a[0]) * (y1 - a[1])) / (b[1] - a[1]), y1]]];
	for (const [inside, cut] of edges) { const inp = out; out = []; if (!inp.length) break;
		for (let i = 0; i < inp.length; i++) { const a = inp[i], b = inp[(i + 1) % inp.length], ia = inside(a), ib = inside(b);
			if (ia) out.push(a); if (ia !== ib) out.push(cut(a, b)); } }
	return out; };
/** the beam as a soft-edged mask WITHOUT a blur: a solid inner trapezoid and two gradient strips along its slanted sides (and one
    along its top), each strip fading from white to clear across 2F px (cheap to raster) */
const BeamMask: React.FC<{k: number; top: number; v: Vis; id: string; F?: number}> = ({k, top: top0, v, id, F = 34}) => {
	const {x, y, ry} = MOUTH, r = MOUTH.rx, top = Math.max(top0, v.y0 - 140), hw = r + k * (y - top), yb = y + ry * 0.6;
	const BL: P = [x - r, yb], TL: P = [x - hw, top], BR: P = [x + r, yb], TR: P = [x + hw, top];
	const side = (A: P, B: P, out: number) => { const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1; let n: P = [-dy / L, dx / L]; if (n[0] * out < 0) n = [-n[0], -n[1]];
		const off = (q: P, k2: number): P => [q[0] + n[0] * F * k2, q[1] + n[1] * F * k2]; return {inA: off(A, -1), inB: off(B, -1), outA: off(A, 1), outB: off(B, 1)}; };
	const Ls = side(BL, TL, -1), Rs = side(BR, TR, 1);
	const inner = [Ls.inA, Ls.inB, Rs.inB, Rs.inA];
	return <g>
		<defs>
			<linearGradient id={`${id}l`} gradientUnits="userSpaceOnUse" x1={Ls.inA[0]} y1={Ls.inA[1]} x2={Ls.outA[0]} y2={Ls.outA[1]}><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity={0} /></linearGradient>
			<linearGradient id={`${id}r`} gradientUnits="userSpaceOnUse" x1={Rs.inA[0]} y1={Rs.inA[1]} x2={Rs.outA[0]} y2={Rs.outA[1]}><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity={0} /></linearGradient>
			<linearGradient id={`${id}t`} gradientUnits="userSpaceOnUse" x1={0} y1={top + F} x2={0} y2={top - F}><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity={0} /></linearGradient></defs>
		<path d={pth(inner)} fill="#fff" />
		<path d={pth([Ls.inA, Ls.inB, Ls.outB, Ls.outA])} fill={`url(#${id}l)`} />
		<path d={pth([Rs.inA, Rs.inB, Rs.outB, Rs.outA])} fill={`url(#${id}r)`} />
		{top > v.y0 - 100 && <path d={pth([Ls.inB, Rs.inB, [Rs.outB[0], top - F], [Ls.outB[0], top - F]])} fill={`url(#${id}t)`} />}
	</g>; };
const beamPath = (k: number, top: number, v: Vis, wid = 1) => { const {x, y, ry} = MOUTH, r = MOUTH.rx * wid, hw = r + k * (y - top);
	const poly = clipRect([[x - r, y + ry * 0.6], [x - hw, top], [x + hw, top], [x + r, y + ry * 0.6]], v.x0 - 60, v.y0 - 60, v.x0 + v.w + 60, v.y0 + v.h + 60);
	return poly.length ? pth(poly) : 'M0,0Z'; };

/* ============================== shadow-play look ============================== */
/** a tileable fibrous paper noise (512 px), drawn once into a canvas: dark specks and horizontal fibres, alpha only */
const PAPER_URL = (() => { if (typeof document === 'undefined') return ''; const N = 512, c = document.createElement('canvas'); c.width = N; c.height = N; const g = c.getContext('2d'); if (!g) return '';
	const im = g.createImageData(N, N), gx = 24, gy = 160, grid = (i: number, j: number, s: number) => rnd(((i % gx) + gx) % gx * 977 + (((j % gy) + gy) % gy) * 131, s);
	const vn = (x: number, y: number, s: number) => { const i = Math.floor(x), j = Math.floor(y), u = x - i, v = y - j, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v);
		return lerp(lerp(grid(i, j, s), grid(i + 1, j, s), a), lerp(grid(i, j + 1, s), grid(i + 1, j + 1, s), a), b); };
	for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const f = 0.65 * vn((x / N) * gx, (y / N) * gy, 3) + 0.35 * vn(((x / N) * gx * 2) % gx, ((y / N) * gy * 0.5) % gy, 7), sp = rnd(x * 7 + y * 5113, 9) > 0.996 ? 0.5 : 0;
		const a = Math.max(0, f - 0.42) * 1.3 + sp, k = (y * N + x) * 4; im.data[k] = 70; im.data[k + 1] = 40; im.data[k + 2] = 16; im.data[k + 3] = Math.round(Math.min(1, a) * 255); }
	g.putImageData(im, 0, 0); return c.toDataURL('image/png'); })();
const SC = '#1E1109';   /* the warm black of the puppets */
const LIT = '#FFE6A8';  /* light showing through a cut-out */
/** a puppet layer: the stage content inside the beam, with a slight soft second edge (the puppet a hair off the paper) */
type Vis = {x0: number; y0: number; w: number; h: number};
const PupDefs: React.FC<{v: Vis}> = ({v}) => <defs>
	<pattern id="a5pp" patternUnits="userSpaceOnUse" width={900} height={900}><image href={PAPER_URL} width={900} height={900} preserveAspectRatio="none" /></pattern>
	<filter id="a5pen" filterUnits="userSpaceOnUse" x={v.x0} y={v.y0} width={v.w} height={v.h} colorInterpolationFilters="sRGB">
		<feGaussianBlur in="SourceAlpha" stdDeviation={3.2} result="b" /><feOffset in="b" dx={7} dy={5} result="o" />
		<feFlood floodColor="#3A1E0A" floodOpacity={0.32} /><feComposite in2="o" operator="in" result="sh" />
		<feMerge><feMergeNode in="sh" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
	<filter id="a5soft" filterUnits="userSpaceOnUse" x={v.x0} y={v.y0} width={v.w} height={v.h}><feGaussianBlur stdDeviation={1.6} /></filter>
	<filter id="a5gl" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation={10} /></filter>
	<filter id="a5gl2" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation={4} /></filter>
	<filter id="a5bb" filterUnits="userSpaceOnUse" x={v.x0} y={v.y0} width={v.w} height={v.h}><feGaussianBlur stdDeviation={26} /></filter>
</defs>;

/** a smooth mountain range: peaks between x0 and x1, base at y, peak height h; returns a closed path */
const ridge = (x0: number, x1: number, y: number, h: number, seed: number, n = 7, sharp = 0.5) => { const pts: P[] = [[x0, y + 40]];
	for (let i = 0; i <= n * 2; i++) { const u = i / (n * 2), x = lerp(x0, x1, u), peak = i % 2 === 1, env = Math.sin(Math.PI * u) ** 0.5;
		pts.push([x + (rnd(i, seed) - 0.5) * 30, y - (peak ? h * (0.55 + 0.45 * rnd(i, seed + 1)) * env : h * sharp * 0.35 * rnd(i, seed + 2) * env)]); }
	pts.push([x1, y + 40]); return sm(pts); };
/** a curl cut out of a set piece (皮影 tooling) */
const curl = (x: number, y: number, r: number, dir = 1) => { const pts: P[] = Array.from({length: 14}, (_, i) => { const a = (i / 13) * 1.6 * Math.PI * dir, rr = r * (1 - 0.6 * i / 13); return [x + rr * Math.cos(a), y + rr * Math.sin(a)] as P; });
	return sm(pts, false); };
const tree = (x: number, y: number, s: number, seed: number) => { const h = 40 * s;
	return <g key={`tr${seed}`}><path d={tube([x, y], [x + 2 * s, y - h * 0.55], 2.4 * s, 1.4 * s)} fill={SC} />
		<path d={sm([[x - 14 * s, y - h * 0.5], [x - 10 * s, y - h * 0.85], [x + 2 * s, y - h * (1 + 0.15 * rnd(seed, 3))], [x + 14 * s, y - h * 0.82], [x + 15 * s, y - h * 0.52], [x, y - h * 0.42]])} fill={SC} /></g>; };
/** an auspicious cloud (祥云) with a cut-out curl */
const Cloud: React.FC<{x: number; y: number; s: number; o?: number}> = ({x, y, s, o = 0.8}) => <g transform={`translate(${f1(x)},${f1(y)}) scale(${s})`} opacity={o}>
	<path d={sm([[-60, 10], [-58, -8], [-36, -20], [-16, -12], [-4, -30], [22, -32], [36, -16], [58, -14], [66, 4], [40, 14], [0, 12]])} fill={SC} />
	<path d={curl(-30, -6, 11)} fill="none" stroke={LIT} strokeWidth={3} opacity={0.8} /><path d={curl(16, -14, 12, -1)} fill="none" stroke={LIT} strokeWidth={3} opacity={0.8} />
	<path d="M60,4 C90,6 110,-2 130,6" fill="none" stroke={SC} strokeWidth={5} strokeLinecap="round" /></g>;
/** a thin rising smoke line (a 皮影 smoke strip) */
const smokeLine = (x: number, y: number, h: number, t: number, seed: number) => { const pts: P[] = Array.from({length: 9}, (_, i) => { const u = i / 8; return [x + Math.sin(u * 5 + t * 1.6 + seed) * 9 * u + u * 14, y - u * h] as P; });
	return <path key={`sm${seed}`} d={sm(pts, false)} fill="none" stroke={SC} strokeWidth={3} strokeLinecap="round" opacity={0.42} />; };

/* ============================== bronze → regular → simplified glyphs ============================== */
/** one gold glyph in the regular (楷) face; glyph centre at (x, y), size px */
const GoldKai: React.FC<{ch: string; x: number; y: number; s: number; o?: number; glow?: number}> = ({ch, x, y, s, o = 1, glow = 0.8}) => <g opacity={o}>
	{glow > 0 && <text x={x} y={y} fontFamily={KAI} fontWeight={700} fontSize={s} textAnchor="middle" dominantBaseline="central" fill="#FFB650" stroke="#FFB650" strokeWidth={s * 0.06} filter="url(#a5gl)" opacity={cl(glow, 0, 1.4) * 0.8}>{ch}</text>}
	<text x={x} y={y} fontFamily={KAI} fontWeight={700} fontSize={s} textAnchor="middle" dominantBaseline="central" fill="#F6D27E">{ch}</text>
	<text x={x - s * 0.012} y={y - s * 0.015} fontFamily={KAI} fontWeight={700} fontSize={s} textAnchor="middle" dominantBaseline="central" fill="#FFF3CC" opacity={0.35}>{ch}</text></g>;
/** the word in a column (中 over 或/國/国) in one of three forms, with morphs between them:
    f = 0 bronze 中或 · 1 regular 中國 · 2 simplified 中国 (fractions morph: 0→1 the 囗 draws round 或, 1→2 國 becomes 国) */
const Word: React.FC<{x: number; y: number; s: number; f: number; o?: number; glow?: number; gap?: number; id: string}> = ({x, y, s, f, o = 1, glow = 0.9, gap = 1.1, id}) => {
	const y2 = y + s * gap, a = cl(f), b = cl(f - 1);
	const bronzeO = 1 - ease(seg(a, 0.05, 0.45)), kaiO = ease(seg(a, 0.25, 0.6));
	const box = ease(seg(a, 0.5, 0.85)), toGuo = ease(seg(a, 0.8, 1));
	const huoS = lerp(1, 0.6, ease(seg(a, 0.5, 0.82))), flash = Math.sin(Math.PI * seg(a, 0.15, 0.6)) + Math.sin(Math.PI * seg(b, 0.1, 0.7));
	const r = s * 0.43;
	return <g opacity={o}>
		{flash > 0.01 && <Glow x={x} y={(y + y2) / 2} r={s * 1.4} c="#FFE2A0" o={0.35 * flash} id={`${id}fl`} sy={1.3} />}
		{bronzeO > 0.01 && <Glyphs55 chars="中或" x={x} y={y} size={s * 0.95} gap={s * gap} glow={glow} o={bronzeO} id={`${id}b`} />}
		{kaiO > 0.01 && b < 1 && <g opacity={kaiO * (1 - ease(seg(b, 0.3, 0.75)))}>
			<GoldKai ch="中" x={x} y={y} s={s} glow={glow} />
			{toGuo < 1 && <g opacity={1 - toGuo}><g transform={`translate(${f1(x)},${f1(y2 + s * 0.04 * (1 - huoS))}) scale(${huoS.toFixed(3)}) translate(${f1(-x)},${f1(-y2)})`}><GoldKai ch="或" x={x} y={y2} s={s} glow={glow} /></g>
				{box > 0 && <path d={`M${f1(x - r)},${f1(y2 - r)} L${f1(x + r)},${f1(y2 - r)} L${f1(x + r)},${f1(y2 + r)} L${f1(x - r)},${f1(y2 + r)} Z`} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - box}
					fill="none" stroke="#F6D27E" strokeWidth={s * 0.075} strokeLinejoin="round" />}</g>}
			{toGuo > 0 && <GoldKai ch="國" x={x} y={y2} s={s} glow={glow} o={toGuo} />}</g>}
		{b > 0 && <g opacity={ease(seg(b, 0.3, 0.75))}><GoldKai ch="中" x={x} y={y} s={s} glow={glow} /><GoldKai ch="国" x={x} y={y2} s={s} glow={glow} /></g>}
	</g>; };

/* ============================== the 尊 and the room ============================== */
/* the light of act 4's X4 (builder 4), so the hand-off at 137.30 matches */
const LBeam: ZunLight = {dir: [0.55, 0.25, 0.8], col: '#FFE2B4', k: 1.9, amb: 0.3, ambCol: '#4A4036', spec: 1.8, shin: 14, rim: {dir: [-0.7, -0.3, 0.6], col: '#FFD08A', k: 1.1}, inside: 0.9};
const LMusDay: ZunLight = {dir: [0.4, -0.5, 0.75], col: '#FFF0DC', k: 1.9, amb: 0.48, ambCol: '#8A8478', spec: 1.6, shin: 14, rim: {dir: [-0.6, 0.6, 0.4], col: '#FFE8C8', k: 0.7}};
const ZCACHE = new Map<string, React.ReactElement>();
/** the 尊 at HOME (az 30); the element is cached so React skips re-rendering it frame to frame */
const zunEl = (key: string, light: ZunLight, shadow = false) => { const hit = ZCACHE.get(key); if (hit) return hit;
	const el = <Zun cam={HC} light={rotL(light, 30)} id={`a5z${key}`} patina={0.04} shadow={shadow} inscription={false} />; ZCACHE.set(key, el); return el; };
/* ============================== people as puppets ============================== */
/** a puppet: a rig55h body (cm, feet at 0) placed at (x, y) at k px/cm, flipped to face left; extra = more pieces in the same cm frame */
const Pup: React.FC<{x: number; y: number; k: number; flip?: boolean; s: Sk; dress: 'robe' | 'kingrobe' | 'jacket' | 'zsz' | 'labcoat'; hat?: 'guan' | 'mian' | 'towel' | 'cadre' | 'none'; wide?: number; extra?: React.ReactNode; back?: React.ReactNode; fill?: string; o?: number}> =
	({x, y, k, flip, s, dress, hat = 'none', wide, extra, back, fill = SC, o = 1}) => <g transform={`translate(${f1(x)},${f1(y)}) scale(${flip ? -k : k},${k})`} fill={fill} opacity={o}>{back}<Body s={s} dress={dress} hat={hat} wide={wide} />{extra}</g>;
/** a point in the head's frame (head centre hd, tilt deg) */
const headF = (s: Sk) => { const a = ((s.tilt ?? 0) * Math.PI) / 180, c = Math.cos(a), si = Math.sin(a); return (x: number, y: number): P => [s.hd[0] + x * c - y * si, s.hd[1] + x * si + y * c]; };
/** a walking pose: dist cm walked, L = step length; the stance foot is planted (it moves back exactly as the body moves on) */
const walkFK = (dist: number, L = 34, lean = 4, swing = 14, lift = 11): FK => { const ph = dist / (2 * L);
	const leg = (p: number): P => { const q = ((p % 1) + 1) % 1; if (q < 0.5) return [L / 2 - (q / 0.5) * L, -8]; const u = (q - 0.5) / 0.5; return [-L / 2 + ease(u) * L, -8 - lift * Math.sin(Math.PI * u)]; };
	const bob = 2.0 * Math.cos(4 * Math.PI * ph), c = Math.cos(2 * Math.PI * ph);
	return {hip: [0, -89.5 + bob], lean, neck: 6, fN: leg(ph), fF: leg(ph + 0.5), hN: [6 - swing * c, -60 + 3 * Math.abs(c)], hF: [6 + swing * c, -60 + 3 * Math.abs(c)]}; };
/** a long skirt hull from the hips to just above the ankles (Qing robe, Russian caftan, Ming coat), cm frame */
const skirt = (s: Sk, hem = -6, flare = 1) => { const fx = Math.max(s.fN[0], s.fF[0]), bx = Math.min(s.fN[0], s.fF[0]);
	return <path d={sm([[s.hip[0] - 13, s.hip[1] - 6], [s.hip[0] + 14, s.hip[1] - 6], [Math.max(fx + 10, s.hip[0] + 16) * flare, hem], [(fx + bx) / 2, hem + 2], [Math.min(bx - 12, s.hip[0] - 18) * flare, hem]])} />; };

/* ============================== X5 / X6 · the 洛 basin, then the whole plain ============================== */
const CITY: P = [1235, 602];
/** X6: light waves sweep out from the city across the plain on the beats (strength 1, 0.55, 0.35) */
const WAVES = (() => { const n0 = beatN(141.83 + 0.01); return [[beatT(n0), 1], [beatT(n0 + 2), 0.55], [beatT(n0 + 4), 0.35]] as [number, number][]; })();
const WAVE_DUR = 1.9, waveR = (u: number) => 60 + 1900 * (0.25 * eout(u) + 0.75 * u);
/** when the first wave front reaches stage point (x, y) (an ellipse flattened by the low view) */
const waveAt = (x: number, y: number) => { const d = Math.hypot(x - CITY[0], (y - CITY[1]) / 0.42); let lo = 0, hi = 1; for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (waveR(m) < d) lo = m; else hi = m; } return WAVES[0][0] + WAVE_DUR * lo; };
const Waves: React.FC<{t: number}> = ({t}) => <g style={{mixBlendMode: 'screen'}}>{WAVES.map(([a, k], i) => { const u = seg(t, a, a + WAVE_DUR); if (u <= 0 || u >= 1) return null; const r = waveR(u);
	return <g key={i}><ellipse cx={CITY[0]} cy={CITY[1]} rx={r} ry={r * 0.42} fill="none" stroke="#FFF0C4" strokeWidth={170 * (1 - 0.5 * u)} opacity={0.6 * k * (1 - u)} filter="url(#a5bb)" />
		<ellipse cx={CITY[0]} cy={CITY[1]} rx={r} ry={r * 0.42} fill="none" stroke="#FFF8E0" strokeWidth={10} opacity={0.5 * k * (1 - u)} filter="url(#a5gl2)" /></g>; })}</g>;
const Basin: React.FC<{t: number}> = ({t}) => {
	const rise = (a: number, b: number) => 430 * (1 - eout(seg(t, a, b)));
	const spread = seg(t, T('X6'), T('X6') + 1.6);
	const cityR = 430 * (1 - land(seg(t, 138.75, 139.6)));
	const towns: [number, number, number][] = [[640, 650, 0.8], [860, 700, 0.9], [1620, 662, 0.85], [1860, 700, 0.9], [430, 694, 0.7], [2080, 652, 0.75], [1010, 742, 1.0], [1460, 730, 1.0]];
	return <g>
		{/* the far ring of mountains */}
		<g transform={`translate(0 ${f1(rise(137.9, 139.0))})`} opacity={0.42}>
			<path d={ridge(-500, 2700, 600, 170, 11, 11)} fill={SC} />
			<Cloud x={460 + (t - 137) * 28} y={470} s={0.9} o={0.7} /><Cloud x={1500 + (t - 137) * 22} y={455} s={0.75} o={0.6} /><Cloud x={1960 - (t - 137) * 18} y={480} s={0.8} o={0.6} />
		</g>
		{/* the plain and its rivers (洛 and 伊) */}
		<g transform={`translate(0 ${f1(rise(138.1, 139.25))})`}>
			<path d={sm([[-600, 640], [200, 612], [700, 618], [1235, 606], [1800, 616], [2400, 610], [3000, 640], [3000, 1300], [-600, 1300]])} fill={SC} opacity={0.34} />
			<path d="M-600,782 C-100,770 300,742 700,702 S1100,664 1235,662 S1600,672 1900,690 S2600,716 3100,724" fill="none" stroke={LIT} strokeWidth={15} opacity={0.85} />
			<path d="M1700,980 C1640,880 1560,800 1520,760 S1440,690 1420,672" fill="none" stroke={LIT} strokeWidth={10} opacity={0.75} />
			<path d="M-600,782 C-100,770 300,742 700,702 S1100,664 1235,662 S1600,672 1900,690 S2600,716 3100,724" fill="none" stroke="#FFFFFF" strokeWidth={5} opacity={0.55} strokeDasharray="26 90" strokeDashoffset={f1(-t * 70)} />
			{[[560, 708, 1.0, 1], [760, 690, 0.8, 2], [1640, 690, 0.9, 3], [1780, 700, 1.1, 4], [980, 676, 0.7, 5], [330, 742, 1.1, 6], [2100, 712, 1.0, 7]].map(([x, y, s, k]) => tree(x, y, s, k))}
		</g>
		{/* fields (cut-out furrows) and the near bank in front, reeds moving */}
		<g transform={`translate(0 ${f1(rise(138.2, 139.35))})`}>
			{[[820, 726, 150, -0.18], [1500, 742, 170, 0.16], [1080, 790, 190, -0.05]].map(([x, y, w, sk], i) => <g key={i} opacity={0.75}>{Array.from({length: 5}, (_, j) => <path key={j} d={`M${f1(x - w / 2 + sk * j * 14)},${f1(y + j * 9)} l${f1(w)},${f1(sk * 20)}`} stroke={LIT} strokeWidth={2.4} opacity={0.6} />)}</g>)}
			<path d={sm([[-700, 830], [100, 806], [520, 822], [860, 812], [1100, 834], [1380, 816], [1760, 824], [2200, 804], [3100, 820], [3100, 1300], [-700, 1300]])} fill={SC} opacity={0.88} />
			{Array.from({length: 26}, (_, i) => { const x = -100 + i * 96 + 30 * rnd(i, 61), y = 818 + 8 * rnd(i, 62), h = 26 + 22 * rnd(i, 63), sw = 8 * Math.sin(t * 2.2 + i * 0.7);
				return <path key={i} d={`M${f1(x)},${f1(y)} Q${f1(x + 2 + sw * 0.5)},${f1(y - h * 0.6)} ${f1(x + 6 + sw)},${f1(y - h)}`} fill="none" stroke={SC} strokeWidth={3} strokeLinecap="round" opacity={0.9} />; })}
			{[[300, 850, 16, 1], [760, 846, 14, -1], [1540, 848, 16, 1], [1960, 842, 14, -1]].map(([x, y, r, d], i) => <path key={i} d={curl(x, y, r, d)} fill="none" stroke={LIT} strokeWidth={3} opacity={0.6} />)}
		</g>
		{/* the near hills that frame the basin, cut-out curls */}
		<g transform={`translate(0 ${f1(rise(138.35, 139.45))})`}>
			<path d={ridge(-120, 860, 664, 130, 21, 4, 0.7)} fill={SC} opacity={0.92} />
			<path d={ridge(1560, 2500, 660, 150, 31, 4, 0.7)} fill={SC} opacity={0.92} />
			{[[260, 640, 18, 1], [520, 650, 14, -1], [1800, 640, 18, -1], [2050, 630, 15, 1]].map(([x, y, r, d], i) => <path key={i} d={curl(x, y, r, d)} fill="none" stroke={LIT} strokeWidth={3.2} opacity={0.75} />)}
		</g>
		{/* 成周: rammed-earth walls, the gate, the great hall; hearth smoke */}
		<g transform={`translate(0 ${f1(cityR)}) translate(${CITY[0]} ${CITY[1] + 26}) scale(1.32) translate(${-CITY[0]} ${-CITY[1] - 26})`}>
			{[0, 1, 2].map((i) => smokeLine(CITY[0] - 80 + i * 75, CITY[1] - 50, 70 + 12 * i, t + i, i))}
			<path d={pth([[CITY[0] - 196, CITY[1] + 10], [CITY[0] + 196, CITY[1] + 10], [CITY[0] + 214, CITY[1] + 26], [CITY[0] - 214, CITY[1] + 26]])} fill={SC} opacity={0.8} />
			<path d={sm([[CITY[0] - 90, CITY[1] - 52], [CITY[0] - 66, CITY[1] - 86], [CITY[0] + 66, CITY[1] - 86], [CITY[0] + 90, CITY[1] - 52]])} fill={SC} />
			<rect x={CITY[0] - 74} y={CITY[1] - 56} width={148} height={14} fill={SC} />
			{[-150, -118, 112, 146].map((dx, i) => <path key={i} d={pth([[CITY[0] + dx - 16, CITY[1] - 40], [CITY[0] + dx, CITY[1] - 52], [CITY[0] + dx + 16, CITY[1] - 40]])} fill={SC} />)}
			<path d={pth([[CITY[0] - 180, CITY[1] + 10], [CITY[0] - 174, CITY[1] - 42], [CITY[0] + 174, CITY[1] - 42], [CITY[0] + 180, CITY[1] + 10]])} fill={SC} />
			<path d={pth([[CITY[0] - 36, CITY[1] - 50], [CITY[0], CITY[1] - 64], [CITY[0] + 36, CITY[1] - 50]])} fill={SC} />
			<rect x={CITY[0] - 13} y={CITY[1] - 20} width={26} height={30} fill={LIT} opacity={0.9} />
			{[-120, -60, 60, 120].map((dx, i) => <rect key={i} x={CITY[0] + dx - 3} y={CITY[1] - 30} width={6} height={10} fill={LIT} opacity={0.55} />)}
		</g>
		{/* X6: the light reaches the towns of the plain, one per beat */}
		{spread > 0 && towns.map(([x, y, s], i) => { const a = waveAt(x, y) - 0.05, u = land(seg(t, a, a + 0.45)); if (u <= 0) return null;
			return <g key={i} transform={`translate(${x},${f1(y + 60 * (1 - u))}) scale(${s})`} opacity={cl(u * 1.4)}>
				<path d={pth([[-46, 0], [-42, -18], [42, -18], [46, 0]])} fill={SC} /><path d={pth([[-14, -18], [0, -30], [14, -18]])} fill={SC} /><rect x={-5} y={-12} width={10} height={12} fill={LIT} opacity={0.85} />
				{smokeLine(-20, -20, 34, t + i, 10 + i)}</g>; })}
		{/* X6: the rim — riders on the steppe to the west, hill people to the south-west */}
		{t >= T('X6') - 0.01 && <Rim t={t} />}
	</g>; };
/** a horse at a walk (cm, facing +x, hooves at 0): planted hooves, two-bone legs; and its rider */
const Horse: React.FC<{dist: number; t: number; seed: number}> = ({dist, t, seed}) => { const L = 62, ph = dist / (2 * L);
	const hoof = (p: number): P => { const q = ((p % 1) + 1) % 1, st = 0.62; if (q < st) return [L / 2 - (q / st) * L * 0.98, 0]; const u = (q - st) / (1 - st); return [-L / 2 + ease(u) * L, -16 * Math.sin(Math.PI * u)]; };
	const bob = 2.2 * Math.cos(4 * Math.PI * ph), hd = 3 * Math.sin(2 * Math.PI * ph + 1);
	const legs: [P, number, number][] = [[[-48, -112 + bob], 0, -1], [[48, -108 + bob], 0.25, 1], [[-48, -112 + bob], 0.5, -1], [[48, -108 + bob], 0.75, 1]];
	const leg = ([top, off, side]: [P, number, number], i: number) => { const h0 = hoof(ph + off), h: P = [top[0] + h0[0], h0[1] - 2], kn = ik2(top, h, 54, 58, side);
		return <g key={i}><path d={tube(top, kn, 9, 5.5)} /><path d={tube(kn, h, 5, 4)} /><path d={pth([[h[0] - 5, h[1] - 6], [h[0] + 6, h[1] - 6], [h[0] + 7, h[1] + 2], [h[0] - 6, h[1] + 2]])} /></g>; };
	return <g>
		{legs.filter((_, i) => i % 2 === 1).map(leg)}
		<path d={sm([[-72, -138 + bob], [-60, -158 + bob], [0, -156 + bob], [52, -162 + bob], [70, -146 + bob], [62, -112 + bob], [0, -104 + bob], [-56, -106 + bob]])} />
		<path d={sm([[48, -150 + bob], [74, -196 + bob + hd], [96, -214 + bob + hd], [120, -184 + bob + hd], [112, -176 + bob + hd], [92, -190 + bob + hd], [74, -140 + bob]])} />
		<path d={sm([[-70, -150 + bob], [-88, -120 + bob + 4 * Math.sin(t * 3 + seed)], [-84, -86 + bob], [-74, -128 + bob]])} />
		{legs.filter((_, i) => i % 2 === 0).map(leg)}
		{/* the rider: seated, reins forward, a bow across the back, a fur-rimmed cap */}
		<g transform={`translate(0 ${f1(bob)})`}><path d={tube([-6, -160], [2, -212], 13, 11)} /><path d={tube([2, -150], [26, -132], 9, 6)} /><path d={tube([26, -132], [22, -108], 6, 5)} />
			<path d={sm([[-4, -232], [6, -236], [14, -226], [12, -214], [0, -212], [-6, -220]])} /><path d={sm([[-10, -234], [-2, -246], [12, -244], [17, -232], [4, -236]])} />
			<path d={tube([4, -204], [36, -178], 4.5, 3.5)} /><path d={`M-26,-226 Q-40,-190 -18,-152`} fill="none" stroke={SC} strokeWidth={3} /></g>
	</g>; };
const Rim: React.FC<{t: number}> = ({t}) => { const a = T('X6');
	const rimO = ease(seg(t, waveAt(420, 600) - 0.2, waveAt(420, 600) + 0.5));
	return <g opacity={rimO}>
		{/* the western steppe: a long low ridge and the riders walking along it */}
		<path d={sm([[-900, 650], [-300, 616], [120, 590], [420, 586], [640, 606], [820, 650], [880, 700], [-900, 760]])} fill={SC} opacity={0.88} />
		{[0, 1, 2].map((i) => { const d = (t - a) * 110 + i * 37; return <g key={i} transform={`translate(${f1(150 + i * 120 + d * 0.46)},${f1(590 - 2 * i)}) scale(0.46)`} fill={SC}><Horse dist={d} t={t} seed={i} /></g>; })}
		{/* the southern hills: a steep peak, a hut, two hill people watching the light */}
		<path d={sm([[1700, 690], [1820, 560], [1930, 506], [2040, 520], [2160, 600], [2300, 700], [1680, 720]])} fill={SC} opacity={0.9} />
		<path d={pth([[1990, 500], [2012, 478], [2034, 500], [2030, 516], [1994, 516]])} fill={SC} />
		{smokeLine(2024, 478, 60, t, 40)}
		{tree(2080, 540, 1.3, 51)}{tree(1790, 600, 1.1, 52)}
		{(() => { const look = ease(seg(t, a + 1.3, a + 1.8)) * (1 - ease(seg(t, a + 3.6, a + 4.2))), sway = Math.sin(t * 1.7) * 2;
			const p1 = poseFK({hip: [0, -91], lean: -3 + sway * 0.3, neck: -8 * look, fN: [10, -8], fF: [-10, -8], hN: [lerp(14, 20, look), lerp(-58, -150, look)], hF: [-6, -60], tilt: -10 * look});
			const p2 = poseFK({hip: [0, -91], lean: 2, fN: [8, -8], fF: [-12, -8], hN: [20, -112], hF: [4, -62]});
			return <g><Pup x={1900} y={518} k={0.5} flip s={p1} dress="zsz" hat="towel" /><Pup x={1956} y={508} k={0.5} flip s={p2} dress="zsz" hat="towel" extra={<path d={tube([20, -200], [22, 0], 1.6, 1.6)} />} /></g>; })()}
	</g>; };

/* ============================== X7 / X8 · one city gate, six dynasties ============================== */
const DYN = ['漢', '唐', '宋', '元', '明', '清'];
/** the dynasty showing at t: 0 漢 at the cut, then one change per beat */
const dynAt = (t: number) => { const n0 = beatN(T('X7') + 0.02); return Math.max(0, Math.min(5, beatN(t + 0.01) - n0)); };
const GX = 1200, GW = 700, GG = 712;   /* gate centre, wall top, ground */
const roofPath = (cx: number, e: number, r: number, ew: number, rw: number, up: number, cv: number) => {
	const tipL: P = [cx - ew, e - up], tipR: P = [cx + ew, e - up], ry = r, my = (e - up + ry) / 2;
	return `M${f1(tipL[0])},${f1(tipL[1])} Q${f1(cx - ew + 50)},${f1(e + 3)} ${f1(cx - ew + 92)},${f1(e)} L${f1(cx + ew - 92)},${f1(e)} Q${f1(cx + ew - 50)},${f1(e + 3)} ${f1(tipR[0])},${f1(tipR[1])}`
		+ ` Q${f1(cx + rw + (ew - rw) * 0.45)},${f1(my + cv * (e - r))} ${f1(cx + rw)},${f1(ry)} L${f1(cx - rw)},${f1(ry)} Q${f1(cx - rw - (ew - rw) * 0.45)},${f1(my + cv * (e - r))} ${f1(tipL[0])},${f1(tipL[1])} Z`; };
/** the gate tower for dynasty d (light = a cut-out showing the beam) */
const GateSet: React.FC<{d: number; t: number}> = ({d, t}) => { const cx = GX, top = 562;
	const sp = [
		/* 漢: straight eaves, a bird on the ridge, 阙 towers either side */ {ew: 200, rw: 130, e: 470, r: 418, up: 2, cv: 0, br: 10, orn: 'bird', two: false, op: 'rect'},
		/* 唐: low, broad, deep brackets, big 鸱尾 */ {ew: 236, rw: 150, e: 474, r: 430, up: 8, cv: 0.06, br: 22, orn: 'chiwei', two: false, op: 'rect'},
		/* 宋: lifted corners, a curved roof, gable-hip */ {ew: 214, rw: 112, e: 470, r: 404, up: 26, cv: 0.2, br: 14, orn: 'wen', two: false, op: 'trap'},
		/* 元: one eave, horse-tail standards on the ridge */ {ew: 210, rw: 128, e: 472, r: 414, up: 16, cv: 0.12, br: 10, orn: 'tug', two: false, op: 'arch'},
		/* 明: heavy double eave */ {ew: 226, rw: 104, e: 486, r: 418, up: 16, cv: 0.12, br: 10, orn: 'wen', two: true, op: 'arch'},
		/* 清: double eave, steep, sharp corners, ridge beasts */ {ew: 222, rw: 96, e: 486, r: 404, up: 30, cv: 0.24, br: 8, orn: 'beasts', two: true, op: 'arch'}][d];
	const lower = sp.two ? 512 : sp.e, bodyTop = sp.two ? 520 : sp.e + sp.br;
	return <g>
		{/* the wall (rammed earth, later brick with battlements) */}
		<path d={pth([[cx - 820, GG], [cx - 820, top], [cx + 820, top], [cx + 820, GG]])} />
		{d >= 2 && Array.from({length: 40}, (_, i) => <rect key={i} x={cx - 820 + i * 42} y={top - 16} width={24} height={17} />)}
		{d < 2 && <rect x={cx - 820} y={top - 8} width={1640} height={9} />}
		{/* the gate opening: lintel (漢 唐), trapezoid (宋), arch (元 明 清) */}
		<path d={sp.op === 'rect' ? pth([[cx - 54, GG], [cx - 54, top + 44], [cx + 54, top + 44], [cx + 54, GG]]) : sp.op === 'trap' ? pth([[cx - 58, GG], [cx - 58, top + 70], [cx - 34, top + 42], [cx + 34, top + 42], [cx + 58, top + 70], [cx + 58, GG]])
			: `M${cx - 56},${GG} L${cx - 56},${top + 86} A56 56 0 0 1 ${cx + 56},${top + 86} L${cx + 56},${GG} Z`} fill={LIT} />
		{/* tower body with columns (the gaps show light) */}
		<rect x={cx - 170} y={bodyTop} width={340} height={top - bodyTop} />
		{Array.from({length: 5}, (_, i) => <rect key={i} x={cx - 150 + i * 64} y={bodyTop + 10} width={36} height={top - bodyTop - 12} fill={LIT} opacity={0.75} />)}
		{/* brackets under the eave */}
		<rect x={cx - sp.ew + 40} y={lower} width={2 * sp.ew - 80} height={sp.br} />
		{Array.from({length: Math.floor((2 * sp.ew - 100) / 26)}, (_, i) => <rect key={i} x={cx - sp.ew + 54 + i * 26} y={lower + 3} width={9} height={Math.max(2, sp.br - 6)} fill={LIT} opacity={0.7} />)}
		{sp.two ? <>
			<path d={roofPath(cx, sp.e + 16, sp.e - 20, sp.ew + 10, sp.ew - 50, sp.up * 0.8, sp.cv)} />
			<rect x={cx - 128} y={sp.e - 40} width={256} height={30} />{Array.from({length: 4}, (_, i) => <rect key={i} x={cx - 110 + i * 60} y={sp.e - 34} width={28} height={20} fill={LIT} opacity={0.7} />)}
			<path d={roofPath(cx, sp.e - 34, sp.r - 46, sp.ew - 34, sp.rw, sp.up, sp.cv)} />
		</> : <path d={roofPath(cx, sp.e, sp.r, sp.ew, sp.rw, sp.up, sp.cv)} />}
		{(() => { const ry = sp.two ? sp.r - 46 : sp.r, rx = sp.rw;
			if (sp.orn === 'bird') return <><path d={sm([[cx - 18, ry], [cx - 8, ry - 20], [cx + 4, ry - 26], [cx + 18, ry - 34], [cx + 12, ry - 22], [cx + 20, ry - 14], [cx + 10, ry]])} />
				{[-1, 1].map((s) => <path key={s} d={pth([[cx + s * rx, ry + 4], [cx + s * (rx + 18), ry - 10], [cx + s * (rx + 6), ry + 8]])} />)}</>;
			if (sp.orn === 'chiwei') return <>{[-1, 1].map((s) => <path key={s} d={sm([[cx + s * (rx - 6), ry + 4], [cx + s * (rx + 4), ry - 30], [cx + s * (rx - 6), ry - 50], [cx + s * (rx - 22), ry - 44], [cx + s * (rx - 14), ry - 26], [cx + s * (rx - 24), ry + 2]])} />)}</>;
			if (sp.orn === 'tug') return <>{[-1, 1].map((s) => <g key={s}><path d={tube([cx + s * rx, ry], [cx + s * rx, ry - 70], 2.4, 2)} />
				<path d={sm([[cx + s * rx, ry - 66], [cx + s * (rx + 10 + 4 * Math.sin(t * 5 + s)), ry - 56], [cx + s * (rx + 16 + 6 * Math.sin(t * 5 + s)), ry - 34], [cx + s * (rx + 4), ry - 44]])} /></g>)}</>;
			if (sp.orn === 'beasts') return <>{[-1, 1].map((s) => <g key={s}><path d={sm([[cx + s * (rx - 4), ry + 4], [cx + s * (rx + 6), ry - 22], [cx + s * (rx - 10), ry - 30], [cx + s * (rx - 16), ry + 2]])} />
				{[0, 1, 2].map((j) => <circle key={j} cx={cx + s * (rx + 30 + j * 26)} cy={ry + 18 + j * 15} r={5} />)}</g>)}</>;
			return <>{[-1, 1].map((s) => <path key={s} d={sm([[cx + s * (rx - 2), ry + 4], [cx + s * (rx + 6), ry - 20], [cx + s * (rx - 10), ry - 26], [cx + s * (rx - 14), ry + 2]])} />)}</>; })()}
		{d === 0 && [-1, 1].map((s) => { const x = cx + s * 400; return <g key={s}>
			<rect x={x - 34} y={432} width={68} height={GG - 432} /><path d={roofPath(x, 438, 404, 62, 32, 2, 0)} /><rect x={x - 46} y={500} width={92} height={10} />
			<rect x={x - 12} y={530} width={24} height={60} fill={LIT} opacity={0.7} /></g>; })}
	</g>; };
/** a banner on a pole: the dynasty's character cut out of it; dyn d sets the cut of the cloth; fall = 0..1 it drops away */
const Banner: React.FC<{x: number; d: number; t: number; side: number; fall?: number}> = ({x, d, t, side, fall = 0}) => {
	const top = 318, bw = 112, bh = 232, wv = (u: number) => 7 * Math.sin(t * 4.2 + u * 5 + side) * u;
	const edge = (u: number) => side * (bw * u);
	const fy = 900 * fall * fall, fr = side * 64 * fall, fx = side * 90 * fall;
	const pts: P[] = [];
	for (let i = 0; i <= 6; i++) { const v = i / 6; pts.push([x + side * 8 + edge(1) + wv(1) * (0.5 + v), top + 6 + bh * v + (d === 3 && i === 6 ? 40 : 0)]); }
	const outline: P[] = [[x + side * 8, top + 4], ...pts, [x + side * 8, top + 8 + bh]];
	const tooth = d === 4 || d === 5;
	const ch = DYN[d], cxx = x + side * (8 + bw / 2) + wv(0.5), cyy = top + 6 + bh * 0.46;
	return <g>
		<path d={tube([x, GG + 50], [x, top - 20], 4, 3.2)} /><circle cx={x} cy={top - 24} r={6} />
		<g transform={`translate(${f1(fx)},${f1(fy)}) rotate(${f1(fr)} ${x} ${top})`}>
			<path d={pth(outline)} />
			{tooth && Array.from({length: 7}, (_, i) => { const y = top + 18 + i * 32; const xx = x + side * (8 + bw) + wv(1) * (0.5 + i / 7); return <path key={i} d={pth([[xx, y - 10], [xx + side * 14, y], [xx, y + 10]])} />; })}
			{d === 1 && [0, 1].map((i) => <path key={i} d={pth([[x + side * (14 + i * 50), top + bh + 4], [x + side * (34 + i * 50), top + bh + 40 + 6 * Math.sin(t * 5 + i)], [x + side * (52 + i * 50), top + bh + 4]])} />)}
			{d === 0 && <rect x={Math.min(x + side * 8, x + side * (8 + bw))} y={top + bh + 2} width={bw} height={30} />}
			<text x={cxx} y={cyy} fontFamily={KAI} fontWeight={700} fontSize={82} textAnchor="middle" dominantBaseline="central" fill={LIT}>{ch}</text>
			<rect x={Math.min(x + side * 18, x + side * (bw - 2))} y={top + 18} width={bw - 20} height={bh - 30} fill="none" stroke={LIT} strokeWidth={3} opacity={0.6} />
		</g></g>; };
/** the guard under the gate for dynasty d: hat, coat and weapon by period; he grounds his weapon on each beat */
const Guard: React.FC<{t: number; d: number; x: number; walk?: number; turn?: boolean}> = ({t, d, x, walk = -1, turn = false}) => {
	const sb = t - beatT(beatN(t)), toNext = BEAT - sb;
	const lift = walk >= 0 ? 0 : 9 * ease(seg(0.2 - toNext, 0, 0.12)) * (toNext < 0.2 ? 1 : 0);
	const dip = walk >= 0 ? 0 : 5 * Math.exp(-sb * 9) * Math.sin(Math.min(Math.PI, sb * 14));
	const k = 1.5, gy = GG + 52;
	let s: Sk;
	if (walk >= 0) { const fk = walkFK(walk, 50, 6, 8, 14); s = poseFK({...fk, hN: [16, -96], hF: fk.hF}); }
	else s = poseFK({hip: [0, -90 + dip], lean: 1 + dip * 0.4, neck: 4 + dip, tilt: dip * 1.2, fN: [9, -8], fF: [-11, -8], hN: [22, -100 - lift], hF: [-4, -60]});
	const H = headF(s), hp = (pts: [number, number][]) => sm(pts.map(([a, b]) => H(a, b)));
	const spearX = s.hN[0] + 2, butt = -lift + (walk >= 0 ? -60 : 0), len = [252, 270, 256, 262, 262, 250][d];
	const head = (() => { const ty = butt - len;
		if (d === 0) return <><path d={pth([[spearX - 3, ty + 26], [spearX, ty], [spearX + 3, ty + 26]])} /><path d={sm([[spearX, ty + 34], [spearX + 22, ty + 30], [spearX + 30, ty + 46], [spearX + 20, ty + 40], [spearX, ty + 44]])} /></>;
		if (d === 1) return <><path d={pth([[spearX - 4, ty + 34], [spearX, ty], [spearX + 4, ty + 34]])} /><path d={sm([[spearX, ty + 38], [spearX - 10, ty + 52], [spearX - 4, ty + 70], [spearX + 6, ty + 54]])} /></>;
		if (d === 2) return <path d={sm([[spearX - 2, ty + 50], [spearX - 2, ty + 10], [spearX + 8, ty - 4], [spearX + 14, ty + 18], [spearX + 4, ty + 50]])} />;
		if (d === 3) return <><path d={pth([[spearX - 3, ty + 28], [spearX, ty], [spearX + 3, ty + 28]])} /><path d={sm([[spearX, ty + 30], [spearX - 12 - 3 * Math.sin(t * 6), ty + 50], [spearX - 8, ty + 74], [spearX + 8, ty + 50]])} /></>;
		if (d === 4) return <><path d={pth([[spearX - 3.5, ty + 30], [spearX, ty], [spearX + 3.5, ty + 30]])} /><path d={sm([[spearX - 9, ty + 32], [spearX + 9, ty + 32], [spearX + 12, ty + 50 + 3 * Math.sin(t * 6)], [spearX - 12, ty + 50]])} /></>;
		return <><path d={pth([[spearX - 3, ty + 26], [spearX, ty], [spearX + 3, ty + 26]])} /><path d={pth([[spearX, ty + 30], [spearX + 26 + 4 * Math.sin(t * 5), ty + 40], [spearX, ty + 54]])} /></>; })();
	const hat = [
		/* 漢 武冠 */ hp([[-11, -3], [-11, -16], [-4, -24], [10, -21], [12, -9], [9, -4]]),
		/* 唐 兜鍪 with a crest and ear guards */ hp([[-12, 6], [-12, -12], [-4, -20], [0, -32], [3, -20], [11, -13], [12, -3], [6, -4], [4, 6]]),
		/* 宋 helmet with a knob and a long neck curtain */ hp([[-15, 14], [-12, -10], [-3, -19], [0, -27], [4, -19], [11, -11], [12, -3], [5, -5], [-4, 2], [-8, 16]]),
		/* 元 钹笠帽: a wide round brim and a low crown with a bead */ hp([[-22, -4], [-11, -8], [-10, -17], [0, -21], [0, -27], [3, -21], [10, -17], [11, -8], [22, -4], [0, -1]]),
		/* 明 尖顶盔 with a tall spike and tassel */ hp([[-12, 4], [-12, -12], [-4, -19], [-1, -40], [2, -40], [4, -19], [11, -12], [12, -2], [5, -4], [4, 5]]),
		/* 清 暖帽: upturned brim, tasselled crown */ hp([[-14, -4], [-15, -11], [-9, -9], [-6, -19], [0, -23], [6, -19], [9, -9], [15, -11], [14, -4], [0, -6]])][d];
	const coat = (() => {
		if (d === 1) return <><path d={sm([[s.sh[0] - 14, s.sh[1] - 2], [s.sh[0] - 22, s.sh[1] + 14], [s.sh[0] - 8, s.sh[1] + 16]])} /><path d={sm([[s.sh[0] + 10, s.sh[1] - 2], [s.sh[0] + 22, s.sh[1] + 14], [s.sh[0] + 6, s.sh[1] + 16]])} /></>;
		if (d === 3) return <path d={tube([-18, -88], [-22, -66], 7, 9)} />;
		if (d === 5) return <path d={sm(([[-1, 5], [-4, 20], [-7, 40], [-9, 58], [-6, 58], [-3, 38], [0, 18]] as [number, number][]).map(([a, b]) => H(a - 6, b)), true)} />;
		return null; })();
	const hem = [-44, -40, -34, -18, -22, -40][d];
	return <g transform={`translate(${f1(x)},${gy}) scale(${turn ? -k : k},${k})`} fill={SC}>
		<path d={tube([spearX, butt], [spearX, butt - len], 1.9, 1.7)} />{head}
		<Body s={s} dress={d === 3 || d === 4 ? 'labcoat' : 'jacket'} hat="none" />
		{(d === 3 || d === 4 || d === 0) && skirt(s, hem + 30, 1)}
		<path d={hat} />{coat}
		{d === 5 && <circle cx={s.sh[0] + 2} cy={s.sh[1] + 30} r={7} fill={LIT} opacity={0.75} />}
	</g>; };

/* ============================== X9 · Nerchinsk, 1689 ============================== */
const TABLE = {x0: 1052, x1: 1316, y: 640, g: 772};
const SEALP: P = [1092, 636];
const SHEET = {x: 1240, y: 455, w: 360, h: 236};
const SHEETC: Cm = {fx: 1040, fy: 515, s: 1.35};
/** a word printed in ink that lights up: dark amber letters with a gold edge over a warm halo */
const LitWord: React.FC<{x: number; y: number; s: number; gap: number; lit: number; hot?: number; id: string; ink?: string}> = ({x, y, s, gap, lit, hot = 0, id, ink = '#2A1A0E'}) => {
	const col = lit > 0.02 ? '#7A3208' : ink;
	return <g>
		{lit > 0.02 && <><Glow x={x} y={y + gap / 2} r={s * 2.1} c="#FFB848" o={(0.55 + 0.35 * hot) * lit} id={`${id}h`} sy={1.6} />
			<rect x={x - s * 0.62} y={y - s * 0.62} width={s * 1.24} height={gap + s * 1.24} rx={s * 0.12} fill="#FFD27A" opacity={0.35 * lit} /></>}
		{['中', '國'].map((ch, i) => <text key={i} x={x} y={y + i * gap} fontFamily={KAI} fontWeight={700} fontSize={s} textAnchor="middle" dominantBaseline="central" fill={col}
			stroke={lit > 0.02 ? '#FFE6A0' : 'none'} strokeWidth={lit > 0.02 ? s * 0.07 * lit : 0} paintOrder="stroke">{ch}</text>)}
	</g>; };
const SEAL_T = beatT(beatN(155.42 + 0.01) + 3);
/** the treaty sheet: the Chinese / Manchu columns on the right, the Latin lines on the left (illegible marks), 中國 in a column, the seal */
const Sheet: React.FC<{t: number; lit: number; sealed: number}> = ({t, lit, sealed}) => { const {x, y, w, h} = SHEET, x0 = x - w / 2, y0 = y - h / 2;
	/* Manchu-like script: columns read top-down, a wavy stem with teeth on one side, loops and tails on the other */
	const cols = Array.from({length: 6}, (_, c) => { const cx = x0 + w / 2 + 22 + c * 22; let d = `M${f1(cx)},${f1(y0 + 24)}`; const n = 15 + Math.floor(rnd(c, 41) * 4);
		for (let i = 0; i < n; i++) { const y = y0 + 24 + i * 12.5, sw = (rnd(c * 50 + i, 42) - 0.5) * 3; d += ` Q${f1(cx + sw)},${f1(y + 6)} ${f1(cx)},${f1(y + 12.5)}`; }
		let f = ''; for (let i = 1; i < n; i++) { const y = y0 + 24 + i * 12.5, r = rnd(c * 50 + i, 43);
			if (r < 0.34) f += `M${f1(cx)},${f1(y)} l${f1(-6)},${f1(-2)}`;
			else if (r < 0.52) f += `M${f1(cx)},${f1(y - 3)} c6,-3 8,5 0,6`;
			else if (r < 0.66) f += `M${f1(cx)},${f1(y)} q7,2 6,9`;
			else if (r < 0.74) f += `M${f1(cx - 5)},${f1(y)} l0.5,0.5`; }
		return <g key={c}><path d={d} stroke="#3A2414" strokeWidth={2} fill="none" /><path d={f} stroke="#3A2414" strokeWidth={1.8} strokeLinecap="round" fill="none" /></g>; });
	/* Latin-like cursive: words of loops and humps, with gaps */
	const lines = Array.from({length: 8}, (_, r) => { const yy = y0 + 32 + r * 24; let d = '', x = x0 + 20 + (r === 0 ? 30 : 0);
		while (x < x0 + w / 2 - 34) { const wl = 3 + Math.floor(rnd(r * 97 + x, 44) * 5); d += `M${f1(x)},${f1(yy)}`;
			for (let i = 0; i < wl; i++) { const k = rnd(r * 131 + x + i, 45); d += k < 0.25 ? ` c2,-12 6,-12 4,0` : k < 0.4 ? ` c3,4 5,4 6,0 c-1,-4 -5,-4 -4,0` : ` q2,-6 4,0 q2,-5 4,0`; x += k < 0.25 ? 4 : k < 0.4 ? 6 : 8; }
			x += 7; }
		return <path key={r} d={d} stroke="#3A2414" strokeWidth={1.7} fill="none" strokeLinecap="round" opacity={r === 7 ? 0.5 : 0.95} />; });
	const zx = x0 + w - 26, zy = y0 + 40;
	return <g>
		<rect x={x0} y={y0} width={w} height={h} fill="#F7E6BE" />
		<rect x={x0 + 8} y={y0 + 8} width={w - 16} height={h - 16} fill="none" stroke="#7A5A34" strokeWidth={1.6} opacity={0.6} />
		<g clipPath="url(#a5shc)">{lines}</g><g clipPath="url(#a5shm)">{cols}</g>
		<path d={`M${f1(x0 + w / 2 - 4)},${f1(y0 + 16)} L${f1(x0 + w / 2 - 4)},${f1(y0 + h - 16)}`} stroke="#7A5A34" strokeWidth={1.2} opacity={0.5} />
		<defs><clipPath id="a5shc"><rect x={x0 + 12} y={y0} width={w / 2 - 26} height={h} /></clipPath><clipPath id="a5shm"><rect x={x0 + w / 2 + 6} y={y0 + 14} width={w / 2 - 66} height={h - 28} /></clipPath></defs>
		<LitWord x={zx} y={zy} s={29} gap={33} lit={lit} hot={bpulse(t, 0.2)} id="a5shw" ink="#3A2414" />
		{sealed > 0 && <g opacity={sealed}><rect x={x0 + 30} y={y0 + h - 70} width={46} height={46} fill="#6E2612" opacity={0.85} />
			<rect x={x0 + 34} y={y0 + h - 66} width={38} height={38} fill="none" stroke="#F7E6BE" strokeWidth={1.6} opacity={0.75} />
			<path d={`M${x0 + 38},${y0 + h - 58} q8,10 0,18 M${x0 + 50},${y0 + h - 62} q-6,14 6,28 M${x0 + 62},${y0 + h - 60} q8,8 2,22 M${x0 + 40},${y0 + h - 34} q10,-6 26,2`} fill="none" stroke="#F7E6BE" strokeWidth={1.6} opacity={0.75} /></g>}
	</g>; };
const Tent: React.FC<{t: number}> = ({t}) => { const a = T('X9'), sT = SEAL_T, g = TABLE.g;
	/* the seal hand: rest → raised a beat before → pressed down on the beat → lifted */
	const up = ease(seg(t, sT - 0.75, sT - 0.3)), down = ein(seg(t, sT - 0.16, sT)), after = ease(seg(t, sT + 0.35, sT + 0.85));
	const rise = eio(seg(t, sT + 0.45, sT + 1.4)), lit = ease(seg(t, sT + 0.9, sT + 1.5)) * (0.85 + 0.15 * bpulse(t, 0.2));
	const k = 1.4, qx = 1000, k2 = 1 / k;
	const seal: P = [(SEALP[0] - qx) * k2, (SEALP[1] - g) * k2];
	const hRest: P = [30, -104], hUp: P = [44, -150];
	let hN: P = [lerp(hRest[0], hUp[0], up), lerp(hRest[1], hUp[1], up)];
	if (down > 0) hN = [lerp(hUp[0], seal[0], down), lerp(hUp[1], seal[1] - 6, down)];
	if (after > 0) hN = [lerp(seal[0], hRest[0], after), lerp(seal[1] - 6, hRest[1], after)];
	const press = down * (1 - after);
	const q1 = poseFK({hip: [0, -90 + 3 * press], lean: 8 + 22 * press + 6 * up * (1 - down), neck: 6 + 10 * press, tilt: 14 * press, fN: [12, -8], fF: [-12, -8], hN, hF: [lerp(8, 30, press), lerp(-62, -100, press)]});
	const breath = Math.sin(t * 2.1);
	const q2 = poseFK({hip: [0, -91], lean: 3 + breath, fN: [10, -8], fF: [-10, -8], hN: [24, -104], hF: [20, -108], tilt: 6});
	const bow = ease(seg(t, sT + 0.2, sT + 0.7)) * (1 - ease(seg(t, sT + 1.4, sT + 2.0)));
	const r1 = poseFK({hip: [0, -91], lean: 4 + 16 * bow, neck: 6 + 8 * bow, tilt: 8 * bow, fN: [10, -8], fF: [-12, -8], hN: [lerp(26, 20, bow), lerp(-118, -86, bow)], hF: [6, -64]});
	const walk2 = Math.min(150, Math.max(0, (t - a - 0.1) * 105)), w2 = walkFK(walk2, 34, 4, 10, 10), arrive = ease(seg(walk2, 120, 150));
	const r2 = walk2 < 150 ? poseFK({...w2, fN: [lerp(w2.fN[0], 8, arrive), lerp(w2.fN[1], -8, arrive)], fF: [lerp(w2.fF[0], -12, arrive), lerp(w2.fF[1], -8, arrive)]})
		: poseFK({hip: [0, -91], lean: 1 - breath * 0.6, fN: [8, -8], fF: [-12, -8], hN: [-6, -84], hF: [12, -96]});
	const qingHat = (s: Sk) => { const H = headF(s); return <>
		<path d={sm(([[-15, -3], [-13, -9], [-6, -17], [0, -20], [6, -17], [13, -9], [15, -3], [0, -6]] as [number, number][]).map(([x, y]) => H(x, y)))} />
		<path d={tube(H(0, -20), H(0, -27), 1.6, 1.2)} /><circle cx={H(0, -29)[0]} cy={H(0, -29)[1]} r={3.6} />
		<path d={sm(([[-2, -18], [-14, -14], [-24, -2], [-30, 12], [-24, 6], [-14, -6]] as [number, number][]).map(([x, y]) => H(x, y)))} />
		<path d={tube(H(-9, 3), H(-14, 60), 2.6, 1.6)} /></>; };
	const furHat = (s: Sk) => { const H = headF(s); return <><path d={sm(([[-12, -4], [-14, -22], [-13, -38], [0, -42], [13, -38], [13, -22], [12, -4], [0, -8]] as [number, number][]).map(([x, y]) => H(x, y)))} />
		<path d={sm(([[6, 6], [12, 10], [9, 24], [4, 30], [2, 16]] as [number, number][]).map(([x, y]) => H(x, y)))} /></>; };
	const valance = Array.from({length: 16}, (_, i) => { const x = 590 + i * 76; return `M${x},400 Q${x + 38},${436 + 3 * Math.sin(t * 2 + i)} ${x + 76},400`; }).join(' ');
	const sheetU = rise, sx = lerp(SEALP[0] + 70, SHEET.x, sheetU), sy = lerp(TABLE.y - 4, SHEET.y, sheetU), ss = lerp(0.35, 1.2, sheetU);
	return <g>
		{/* the tent (a set piece a little back from the screen: softer) */}
		<g opacity={0.6}>
			<path d={`M560,402 L1186,${290 + 2 * Math.sin(t)} L1810,402 Z`} />
			<path d={valance} fill={SC} /><rect x={560} y={396} width={1250} height={10} />
			{[600, 1772].map((x, i) => <rect key={i} x={x - 5} y={400} width={10} height={g - 400} />)}
			<path d={`M560,404 L470,${g} M1810,404 L1900,${g}`} stroke={SC} strokeWidth={3} />
			<path d={tube([1186, 292], [1186, 230], 2.5, 2)} /><path d={pth([[1188, 232], [1236 + 6 * Math.sin(t * 4), 244], [1188, 258]])} />
		</g>
		<rect x={-200} y={g} width={2400} height={300} opacity={0.75} />
		{/* the table, a candle */}
		<rect x={TABLE.x0} y={TABLE.y} width={TABLE.x1 - TABLE.x0} height={14} />
		<path d={pth([[TABLE.x0 + 4, TABLE.y + 14], [TABLE.x1 - 4, TABLE.y + 14], [TABLE.x1 - 10, TABLE.y + 64], [TABLE.x0 + 10, TABLE.y + 64]])} />
		{[TABLE.x0 + 16, TABLE.x1 - 24].map((x, i) => <rect key={i} x={x} y={TABLE.y + 40} width={8} height={g - TABLE.y - 40} />)}
		<rect x={1286} y={TABLE.y - 30} width={8} height={30} /><path d={sm([[1290, TABLE.y - 30], [1294 + 2 * Math.sin(t * 9), TABLE.y - 46], [1290, TABLE.y - 56 - 3 * Math.sin(t * 7)], [1286, TABLE.y - 44]])} fill={LIT} />
		<Glow x={1290} y={TABLE.y - 44} r={40} c="#FFE0A0" o={0.5 + 0.1 * Math.sin(t * 9)} id="a5cand" />
		{sheetU <= 0.02 && <rect x={SEALP[0] - 20} y={TABLE.y - 3} width={200} height={3} fill={LIT} opacity={0.9} />}
		{/* the Qing side: the seal-bearer at the table, an official with a scroll behind */}
		<Pup x={820} y={g} k={k} s={q2} dress="labcoat" back={skirt(q2, -6)} extra={<>{qingHat(q2)}<path d={tube([q2.hN[0], q2.hN[1] - 2], [q2.hN[0] + 2, q2.hN[1] - 30], 3.6, 3.6)} /></>} />
		<Pup x={qx} y={g} k={k} s={q1} dress="labcoat" back={skirt(q1, -6)} extra={<>{qingHat(q1)}<path d={pth([[q1.hN[0] - 5, q1.hN[1] + 2], [q1.hN[0] + 5, q1.hN[1] + 2], [q1.hN[0] + 5, q1.hN[1] + 10], [q1.hN[0] - 5, q1.hN[1] + 10]])} /><path d={sm([[q1.hN[0] - 2, q1.hN[1] + 1], [q1.hN[0], q1.hN[1] - 6], [q1.hN[0] + 2, q1.hN[1] + 1]])} /></>} />
		{/* the Russian side: an envoy with a quill who bows as the seal comes down, and a second envoy */}
		<Pup x={1376} y={g} k={k} flip s={r1} dress="labcoat" back={skirt(r1, -18, 1)} extra={<>{furHat(r1)}<path d={tube(r1.hN, [r1.hN[0] + 4, r1.hN[1] - 18], 0.8, 0.4)} /><path d={sm([[r1.hN[0] + 2, r1.hN[1] - 10], [r1.hN[0] + 10, r1.hN[1] - 26], [r1.hN[0] + 5, r1.hN[1] - 12]])} /></>} />
		<Pup x={1520 + (150 - walk2) * k} y={g} k={k} flip s={r2} dress="labcoat" back={skirt(r2, -18, 1)} extra={furHat(r2)} />
		{/* the stamp: a light ring where it lands */}
		{t > sT && t < sT + 0.6 && <ellipse cx={SEALP[0] + 8} cy={TABLE.y} rx={20 + 120 * seg(t, sT, sT + 0.6)} ry={6 + 30 * seg(t, sT, sT + 0.6)} fill="none" stroke={LIT} strokeWidth={4} opacity={0.9 * (1 - seg(t, sT, sT + 0.6))} />}
		{/* the sheet lifts from the table into the light */}
		{sheetU > 0.02 && <g transform={`translate(${f1(sx)},${f1(sy)}) scale(${ss.toFixed(3)}) translate(${-SHEET.x},${-SHEET.y})`} opacity={cl(sheetU * 3)}>
			<Glow x={SHEET.x} y={SHEET.y} r={360} c="#FFE6A8" o={0.4 * lit} id="a5shb" sy={0.75} />
			<Sheet t={t} lit={lit} sealed={1} /></g>}
		{void a}
	</g>; };

/* ============================== X10 · 1909, the printed page ============================== */
const PAGE = {x0: 1112, x1: 1752, y0: -600, y1: 800};
/** the glide down the page: from just before X10 to 1.1 s into Y, smoothstep (it never stalls at the cut) */
const pageCam = (t: number) => mixC(P0, P1, ease(seg(t, T('X10') - 0.25, 165.6)));
/* the page carries the real text of the law's first article, as the 1909 print set it (traditional characters, no modern
   punctuation): 第一章「固有籍」第一條 and its three items, one per column, right to left (wording: 黄兴涛, 光明日报 2018-01-22, which
   quotes it). Owner 11-02: real characters only; the rest of the page stays blank. */
const PAGE_COLS = ['第一章　固有籍', '第一條　凡左列人等不論是否生於中國地方均屬中國國籍', '　一　生而父為中國人者', '　二　生於父死以後而父死時為中國人者', '　三　母為中國人而父無可考或無國籍者'];
const colX = (c: number) => PAGE.x1 - 150 - c * 46, rowY = (r: number) => PAGE.y0 + 30 + r * 40;
/** each 中國 in that text lights on the beat nearest the moment the glide brings it to the screen centre (one per beat) */
const ZG: {x: number; y: number; t: number}[] = (() => { const w: {x: number; y: number}[] = [];
	PAGE_COLS.forEach((tx, c) => { for (let i = 0; i + 1 < tx.length; i++) if (tx[i] === '中' && tx[i + 1] === '國') w.push({x: colX(c), y: rowY(i + 1)}); });
	w.sort((a, b) => a.y - b.y);
	const n0 = beatN(T('X10') + 0.01), nMax = beatN(T('Y') - 0.1); let prev = n0 - 1;
	return w.map((z) => { let tt = T('X10'); for (let k = 0; k < 700; k++) { tt = T('X10') + k * 0.01; if (pageCam(tt).fy >= z.y + 20) break; }
		let n = beatN(tt); if (beatT(n + 1) - tt < tt - beatT(n)) n++; n = Math.min(nMax, Math.max(prev + 1, n0, n)); prev = n;
		return {...z, t: beatT(n) + (n === n0 ? 0.3 : 0)}; }); })();
/* owner 11-02: no fake characters on the page any more, only the title and the real 中國 (each lights on its beat); the words keep
   one row clear of the inner border at the top and bottom */
const Page: React.FC<{t: number; o?: number}> = ({t, o = 1}) => { const {x0, x1, y0, y1} = PAGE;
	const title = '大清國籍條例'.split(''), tx = x1 - 62;
	return <g opacity={o}>
		<g transform={`rotate(-1.2 ${(x0 + x1) / 2} ${(y0 + y1) / 2})`}>
			<rect x={x0 - 30} y={y0 + 24} width={x1 - x0} height={y1 - y0} fill="#2A1608" opacity={0.22} />
			<rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="#F4E2B8" />
			<rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="url(#a5pp)" opacity={0.5} />
			<rect x={x0 + 22} y={y0 + 22} width={x1 - x0 - 44} height={y1 - y0 - 44} fill="none" stroke="#5A3A20" strokeWidth={3} />
			<rect x={x0 + 30} y={y0 + 30} width={x1 - x0 - 60} height={y1 - y0 - 60} fill="none" stroke="#5A3A20" strokeWidth={1.2} />
			{Array.from({length: 12}, (_, c) => <path key={c} d={`M${x1 - 127 - c * 46},${y0 + 30} L${x1 - 127 - c * 46},${y1 - 30}`} stroke="#8A6A44" strokeWidth={1} opacity={0.6} />)}
			{/* the title strip */}
			<rect x={tx - 34} y={y0 + 44} width={68} height={title.length * 66 + 30} fill="none" stroke="#3A2414" strokeWidth={2.4} />
			{title.map((ch, i) => <text key={i} x={tx} y={y0 + 92 + i * 66} fontFamily={KAI} fontWeight={700} fontSize={56} textAnchor="middle" dominantBaseline="central" fill="#2A1A0E">{ch}</text>)}
			{PAGE_COLS.map((tx, c) => tx.split('').map((ch, i) => { const y = rowY(i + 1), x = colX(c);
				if (ch === '　' || ZG.some((z) => z.x === x && (z.y === y || z.y + 40 === y))) return null;
				return <text key={`${c}_${i}`} x={x} y={y} fontFamily={KAI} fontWeight={700} fontSize={34} textAnchor="middle" dominantBaseline="central" fill="#2A1A0E">{ch}</text>; }))}
			{ZG.map((z, i) => { const lit = ease(seg(t, z.t - 0.06, z.t + 0.12)), hot = Math.exp(-Math.max(0, t - z.t) / 0.35);
				return <LitWord key={i} x={z.x} y={z.y} s={34} gap={40} lit={lit} hot={hot} id={`a5zg${i}`} />; })}
		</g></g>; };

/* ============================== the beam scene (X5 → Y) ============================== */
const Motes: React.FC<{t: number; c: Cm; n: number; o: number; seed: number}> = ({t, c, n, o, seed}) => { const {x, y} = MOUTH;
	return <g>{Array.from({length: n}, (_, i) => { const life = 5 + 4 * rnd(i, seed), u = ((t / life + rnd(i, seed + 1)) % 1), yy = y - u * 1500, spread = (y - yy) * 0.9 * (rnd(i, seed + 2) - 0.5) * 2,
		xx = x + spread + Math.sin(t * 0.8 + i) * 14, q = toScr(c, [xx, yy]);
		if (q[0] < -10 || q[0] > W + 10 || q[1] < -10 || q[1] > H + 10) return null;
		return <circle key={i} cx={f1(q[0])} cy={f1(q[1])} r={f1(1.2 + 2.2 * rnd(i, seed + 3))} fill="#FFE6B0" opacity={o * Math.sin(Math.PI * u) * (0.4 + 0.6 * rnd(i, seed + 4))} />; })}</g>; };
const BeamScene: React.FC<{t: number; id: string}> = ({t, id}) => {
	const c = camAt(t), b = beamAt(t);
	/* act 4's dark stage: a floor pool under the 尊 (visible at HOME, at the start and the end); at the end a museum-like spot comes on */
	const pool = 1 - ease(seg(t, 137.6, 138.6)) + ease(seg(t, 167.6, 168.8)), spot = ease(seg(t, 168.0, 168.95));
	const breathe = 0.92 + 0.08 * Math.sin(t * 2.4), flick = 0.82 + 0.1 * Math.sin(t * 7.3) + 0.08 * Math.sin(t * 13.7 + 1) + 0.25 * (t > 139.5 && t < T('Y') ? bpulse(t, 0.14) : 0);
	const vis: Vis = {x0: c.fx - 960 / c.s - 40, y0: c.fy - 540 / c.s - 40, w: W / c.s + 80, h: H / c.s + 80};
	/* the lamp behind a shadow-play screen breathes and flickers */
	const lamp = 1 + 0.045 * (Math.sin(t * 7.9) + 0.6 * Math.sin(t * 13.3 + 1.3) + 0.4 * Math.sin(t * 21.7 + 2.1)) / 2;
	/* the glyphs of act 4 at the cut (宅兹中或 in a row at y ≈ 200), and 中 alone over the city */
	const g5 = id === 'X5' || id === 'X6';
	const zhongFrom = toStage(HOMEC, [1001, 200]), zhongTo: P = [CITY[0], CITY[1] - 178];
	const zu = eio(seg(t, 137.6, 139.6)), zp: P = [lerp(zhongFrom[0], zhongTo[0], zu) + 240 * Math.sin(Math.PI * Math.min(1, zu * 1.15)), lerp(zhongFrom[1], zhongTo[1], ease(seg(zu, 0.2, 1)))];
	const pulse = t > 139.9 ? bpulse(t, 0.16) : 0, zs = lerp(64, 128, zu) * (1 + 0.1 * pulse) * (1 + 0.25 * ease(seg(t, T('X6'), T('X6') + 0.5)) * (1 - ease(seg(t, T('X6') + 0.5, T('X6') + 1.6))));
	const others = 1 - ease(seg(t, 137.6, 138.5));
	/* the first half-second: act 4's own last picture underneath, crossfading into this act's beam (a seamless hand-off) */
	const hand = ease(seg(t, 137.3, 137.75));
	return <AbsoluteFill style={{background: '#070504'}}>
		{hand < 1 && <X4EndPicture t={t} />}
		<svg width={W} height={H} style={{position: 'absolute', opacity: hand}}>
			<g transform={camTf(c)}><PupDefs v={vis} /></g>
			<defs>
				<linearGradient id="a5bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0A0705" /><stop offset="1" stopColor="#140D08" /></linearGradient>
				<linearGradient id="a5beam" gradientUnits="userSpaceOnUse" x1={0} y1={MOUTH.y} x2={0} y2={MOUTH.y - 1500}><stop offset="0" stopColor="#F2C66E" stopOpacity={0.5} /><stop offset="0.35" stopColor="#F2C66E" stopOpacity={0.36} /><stop offset="1" stopColor="#F2C66E" stopOpacity={0.2} /></linearGradient>
				<radialGradient id="a5scr" gradientUnits="userSpaceOnUse" cx={1240} cy={560} r={980} gradientTransform="translate(1240 560) scale(1 0.7) translate(-1240 -560)">
					<stop offset="0" stopColor="#FFE7AE" stopOpacity={1} /><stop offset="0.45" stopColor="#F7D58E" stopOpacity={0.85} /><stop offset="1" stopColor="#E8B868" stopOpacity={0} /></radialGradient>
				<mask id="a5bm" maskUnits="userSpaceOnUse" x={vis.x0} y={vis.y0} width={vis.w} height={vis.h}><BeamMask k={b.k} top={b.top} v={vis} id="a5bmk" /></mask>
				<radialGradient id="a5mo" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#FFF4D0" stopOpacity={1} /><stop offset="0.6" stopColor="#FFD27A" stopOpacity={0.8} /><stop offset="1" stopColor="#F2C66E" stopOpacity={0.15} /></radialGradient>
			</defs>
			<rect width={W} height={H} fill="#060505" />
			<g transform={camTf(c)}>
				{pool > 0.01 && <g opacity={pool}><defs><radialGradient id="a5st" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#3A2A1A" /><stop offset="1" stopColor="#050404" stopOpacity={0} /></radialGradient></defs>
					<ellipse cx={960 + DX} cy={880 + DY} rx={620} ry={41} fill="url(#a5st)" /></g>}
				{spot > 0.01 && <path d={`M${960 + DX - 70},${-200 + DY} L${960 + DX + 70},${-200 + DY} L${960 + DX + 330},${880 + DY} L${960 + DX - 330},${880 + DY} Z`} fill="#FFF0D8" opacity={0.07 * spot} />}
				{/* the beam and the shadow-play screen inside it */}
				<g opacity={b.o}>
					<rect x={vis.x0} y={vis.y0} width={vis.w} height={vis.h} fill="url(#a5beam)" mask="url(#a5bm)" opacity={breathe * (b.scr > 0.2 ? lamp : 1)} />
					<g mask="url(#a5bm)">
						<rect x={vis.x0} y={vis.y0} width={vis.w} height={vis.h} fill="url(#a5scr)" opacity={Math.min(1, b.scr * lamp * (g5 && t > 139.9 ? 1 + 0.07 * bpulse(t, 0.2) : 1))} />
						<g fill={SC}>
							{g5 && <Basin t={t} />}
							{(id === 'X7' || id === 'X8') && <GateAct t={t} id={id} />}
							{id === 'X9' && <Tent t={t} />}
						</g>
						{id === 'X6' && <Waves t={t} />}
						{(id === 'X10' || (id === 'Y' && t < 165.4)) && <Page t={t} o={id === 'Y' ? 1 - ease(seg(t, T('Y'), 165.3)) : 1} />}
						<rect x={vis.x0} y={vis.y0} width={vis.w} height={vis.h} fill="url(#a5pp)" opacity={0.45 * b.scr} />
					</g>
				</g>
				{/* the 尊, and the light in its mouth */}
				<g transform={`translate(${DX} ${DY})`}>{zunEl('beam', LBeam, true)}</g>
				<ellipse cx={MOUTH.x} cy={MOUTH.y} rx={MOUTH.rx * 0.97} ry={MOUTH.ry * 0.92} fill="url(#a5mo)" opacity={0.85 * b.o * flick * ease(seg(t, 137.4, 138.2)) * (id === 'Y' ? 1 - 0.6 * seg(t, 168.4, 169) : 1)} />
				{/* the lip and the beak tops catch the beam: a flickering rim of light keeps the 尊 alive at the foot of the frame */}
				<ellipse cx={MOUTH.x} cy={MOUTH.y + 2} rx={MOUTH.rx * 1.03} ry={MOUTH.ry * 1.08} fill="none" stroke="#FFE6A8" strokeWidth={3.2} opacity={(0.25 + 0.45 * flick) * b.o * ease(seg(t, 137.5, 138.3))} filter="url(#a5gl2)" />
				<Glow x={MOUTH.x} y={MOUTH.y - 10} r={MOUTH.rx * 1.6} c="#FFD890" o={0.5 * b.o * flick} id="a5mg" sy={0.6} />
				{/* X5 · X6: the glyphs from act 4; 中 settles over the city and pulses on the beat */}
				{g5 && <>
					{others > 0.01 && [0, 1, 3].map((i) => { const p0 = toStage(HOMEC, [837 + i * 82, 200]); return <g key={i} opacity={others}><Glyphs55 chars={'宅兹中或'[i]} x={p0[0] + 30 * (i - 1.5) * (1 - others)} y={p0[1] - 160 * (1 - others)} size={64} glow={0.9 * breathe} id={`a5o${i}`} /></g>; })}
					<Glyphs55 chars="中" x={zp[0]} y={zp[1]} size={zs} glow={(0.9 + 0.8 * pulse) * (zu < 0.01 ? breathe : 1)} id="a5zh" />
					{pulse > 0.05 && <Glow x={zp[0]} y={zp[1]} r={zs * 1.3} c="#FFE0A0" o={0.3 * pulse} id="a5zp" />}
				</>}
				{id === 'X8' && <X8Word t={t} />}
				{id === 'Y' && <YWord t={t} />}
			</g>
			<Motes t={t} c={c} n={70} o={0.7 * b.o} seed={501} />
		</svg>
		<svg width={W} height={H} style={{position: 'absolute', opacity: hand}}><Vig id="a5v" a={0.68} /></svg>
		{id === 'X10' && <div style={{position: 'absolute', left: 1360, top: -10, width: 520, height: 260, background: 'radial-gradient(closest-side, rgba(14,8,5,0.62), rgba(14,8,5,0.45) 50%, rgba(14,8,5,0))', opacity: ease(seg(t, 161.6, 162.1))}} />}
		<FilmOv2 t={t} c={card2(id)} hideCounter={id !== 'Y'} />
	</AbsoluteFill>; };
const GateAct: React.FC<{t: number; id: string}> = ({t, id}) => { const a8 = T('X8');
	const d = id === 'X7' ? dynAt(t) : 5, flashD = id === 'X7' && t > T('X7') + 0.3 ? bpulse(t, 0.1) : 0;
	const sink = id === 'X8' ? ease(seg(t, a8 + 0.35, a8 + 1.6)) : 0, fall = id === 'X8' ? seg(t, a8 + 0.02, a8 + 1.1) : 0;
	const walk = id === 'X8' && t > a8 + 0.15 ? (t - a8 - 0.15) * 300 : -1;      /* owner 11-02: was 150, he left too slowly */
	const gx = 1046 - (walk > 0 ? walk * 1.5 : 0);
	return <g>
		<g opacity={0.62 * (1 - sink)} transform={`translate(0 ${f1(520 * sink * sink)})`} ><GateSet d={d} t={t} /></g>
		<path d={sm([[-200, GG + 56], [500, GG + 50], [1000, GG + 54], [1500, GG + 49], [2400, GG + 55], [2400, GG + 400], [-200, GG + 400]])} opacity={0.82} />
		{Array.from({length: 20}, (_, i) => { const x = 420 + i * 72 + 24 * rnd(i, 71), y = GG + 52, h = 14 + 12 * rnd(i, 72), sw = 3 * Math.sin(t * 2 + i); return <path key={i} d={`M${f1(x)},${y} q${f1(2 + sw)},${f1(-h * 0.6)} ${f1(5 + sw)},${f1(-h)}`} fill="none" stroke={SC} strokeWidth={2.6} opacity={0.85} />; })}
		{flashD > 0.02 && <Glow x={GX} y={470} r={420} c="#FFF2C8" o={0.45 * flashD} id="a5gf" sy={0.6} />}
		<g transform={`translate(0 ${f1(560 * ease(seg(t, a8 + 0.7, a8 + 1.9)))})`}><Banner x={850} d={d} t={t} side={-1} fall={fall} /><Banner x={1552} d={d} t={t} side={1} fall={cl(fall - 0.08) * 1.1} /></g>
		{(walk < 0 || gx > -160) && <Guard t={t} d={d} x={gx} walk={walk} turn={walk >= 0} />}
	</g>; };
/** X8: 中或 come down the beam where the gate was, then turn into 中國 */
const X8Word: React.FC<{t: number}> = ({t}) => { const a = T('X8'), u = eio(seg(t, a + 0.35, a + 1.7));
	const x = 1150, y = lerp(-320, 330, u), s = lerp(120, 196, u), f = ease(seg(t, a + 2.0, a + 3.3));
	const p = t > a + 3.4 ? bpulse(t, 0.18) : 0;
	return <g><Glow x={x} y={y + s * 0.56} r={s * 1.9} c="#FFE6B0" o={0.35 * u} id="a5w8h" sy={1.5} /><Word x={x} y={y} s={s * (1 + 0.06 * p)} f={f} glow={1.3 + p} gap={1.12} id="a5w8" />{p > 0.05 && <Glow x={x} y={y + s * 0.56} r={s * 1.6} c="#FFE0A0" o={0.25 * p} id="a5w8p" sy={1.4} />}</g>; };
/** Y: the lit 中國 leave the page and gather; the word goes back to its first form, then forward to today's, then home into the 尊 */
const YWord: React.FC<{t: number}> = ({t}) => { const a = T('Y'), c = camAt(t);
	const g = eio(seg(t, a + 0.05, a + 0.85));
	const home = ein(seg(t, 167.7, 168.45)), hx = MOUTH.x, hy = MOUTH.y - 10;
	/* the word hangs a fixed height above the mouth ON SCREEN while the camera cranes down to HOME */
	const ms = toScr(c, [MOUTH.x, MOUTH.y]), anchor = toStage(c, [ms[0] + 330, Math.max(300, ms[1] - 520)]);
	const cx = anchor[0], cy = anchor[1], s0 = 150 / c.s;
	/* back to the first form (中國 → 中或), then forward again (→ 中國 → 中国) */
	const f = t < a + 0.85 ? 1 : t < 165.8 ? 1 - ease(seg(t, a + 0.85, 165.8)) : t < 166.45 ? ease(seg(t, 165.9, 166.42)) : 1 + ease(seg(t, 166.55, 167.15));
	const s = s0 * (1 - 0.88 * home), x = lerp(cx, hx, home), y = lerp(cy, hy - s * 1.6, home);
	const flash = Math.exp(-Math.max(0, t - 168.45) / 0.3) * (t > 168.45 ? 1 : 0);
	void c;
	return <g>
		{g < 1 && ZG.map((z, i) => { const zx = lerp(z.x, cx, g), zy = lerp(z.y, cy, g); return <g key={i} opacity={1 - g * 0.6}><GoldKai ch="中" x={zx} y={zy} s={lerp(34, s0, g)} glow={1} /><GoldKai ch="國" x={zx} y={zy + lerp(40, s0 * 1.12, g)} s={lerp(34, s0, g)} glow={1} /></g>; })}
		{g >= 1 && home < 1 && <Word x={x} y={y} s={s} f={f} glow={1.1} gap={1.12} id="a5wy" />}
		{home > 0 && home < 1 && <path d={`M${x},${y} L${hx},${hy}`} stroke="#FFE2A0" strokeWidth={6} opacity={0.3 * home} filter="url(#a5gl2)" />}
		{flash > 0.01 && <Glow x={hx} y={hy} r={260} c="#FFF0C8" o={0.7 * flash} id="a5yf" sy={0.7} />}
	</g>; };

/* ============================== Z · the museum today; END ============================== */
const Visitor: React.FC<{t: number; x0: number; v: number; y: number; k: number; dir: number; seed: number; coat?: 'jacket' | 'labcoat'; fill?: string; o?: number; t0?: number}> = ({t, x0, v, y, k, dir, seed, coat = 'jacket', fill = '#2A2420', o = 1, t0}) => {
	const dist = Math.max(0, (t - (t0 ?? T('Z'))) * v + seed * 13), s = poseFK(walkFK(dist, 33, 3, 13, 10));
	return <Pup x={x0 + dir * dist * k} y={y} k={k} flip={dir < 0} s={s} dress={coat} fill={fill} o={o} />; };
const Museum: React.FC<{t: number; id: string}> = ({t, id}) => { const z0 = T('Z'), u = seg(t, z0, T('END') + 6);
	/* a slow lateral track (the case at 1, the gallery behind at 0.55, the people at 0.8) and a slight push */
	const uz = seg(t, z0, z0 + 4.53), ez = 0.3 * uz + 0.7 * ease(uz), drift = seg(t, z0 + 4.53, z0 + 12.6);
	const tx = 190 * ez + 60 * drift, sc = 1 + 0.07 * ez + 0.03 * drift;
	const L = (p: number) => `translate(${f1(960 + tx * p)} 600) scale(${(1 + (sc - 1) * p).toFixed(4)}) translate(-960 -600)`;
	/* the child: points up at the 尊 on the second beat, bounces on the toes, looks back to the parent */
	const pt = ease(seg(t, z0 + 0.5, z0 + 0.95)), bounce = Math.max(0, Math.sin((t - z0 - 1.0) * 9)) * 2.2 * seg(t, z0 + 1.0, z0 + 1.2) * (1 - seg(t, z0 + 2.6, z0 + 2.9)), look = ease(seg(t, z0 + 2.4, z0 + 2.9)) * (1 - ease(seg(t, z0 + 3.6, z0 + 4.0)));
	const ch: Sk = (() => { const hip: P = [0, -54 + bounce], lean = -4 - 6 * pt, a = (lean * Math.PI) / 180, sh: P = [hip[0] + 30 * Math.sin(a), hip[1] - 30 * Math.cos(a)];
		const hd: P = [sh[0] + 11 * Math.sin(a - 0.35 * pt), sh[1] - 13 * Math.cos(a)];
		const hN: P = [lerp(6, 26, pt), lerp(-38, -98, pt) + bounce], hF: P = [-2, -36 + bounce];
		const eN = ik2(sh, hN, 17, 16, 1), eF = ik2(sh, hF, 17, 16, -1), kN = ik2(hip, [7, -5], 26, 24, 1), kF = ik2(hip, [-7, -5], 26, 24, 1);
		return {hip, sh, hd, kN, fN: [7, -5], kF, fF: [-7, -5], hN, hF, eN, eF, tilt: -18 * pt + 30 * look}; })();
	const par = poseFK({hip: [0, -90], lean: 6 + 10 * look, neck: 10 + 10 * look, tilt: 16 + 10 * look, fN: [12, -8], fF: [-10, -8], hN: [lerp(24, 34, look), lerp(-74, -82, look)], hF: [4, -60]});
	const fade = id === 'END' ? seg(t, T('END'), T('END') + 0.6) : 0;
	return <AbsoluteFill style={{background: '#2A2622'}}>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<defs><linearGradient id="a5mw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4A4238" /><stop offset="1" stopColor="#2A241E" /></linearGradient>
				<linearGradient id="a5mf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5A4E40" /><stop offset="1" stopColor="#1E1A16" /></linearGradient>
				<linearGradient id="a5mp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A3430" /><stop offset="1" stopColor="#14120F" /></linearGradient>
				<linearGradient id="a5msk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF4E0" stopOpacity={0.14} /><stop offset="1" stopColor="#FFF4E0" stopOpacity={0} /></linearGradient>
				<clipPath id="a5glass"><rect x={560} y={320} width={800} height={574} /></clipPath>
				<filter id="a5rim" x="-20%" y="-10%" width="140%" height="120%" colorInterpolationFilters="sRGB">
					<feOffset in="SourceAlpha" dx={2.6} dy={2.6} result="o" /><feComposite in="SourceAlpha" in2="o" operator="out" result="band" />
					<feGaussianBlur in="band" stdDeviation={0.8} result="bb" /><feFlood floodColor="#FFE8C8" floodOpacity={0.85} /><feComposite in2="bb" operator="in" result="r" />
					<feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="r" /></feMerge></filter></defs>
			<g transform={L(0.55)}>
				<rect x={-200} y={-100} width={W + 400} height={H + 200} fill="url(#a5mw)" />
				<rect x={-200} y={0} width={W + 400} height={70} fill="#E8E0D0" opacity={0.5} /><path d="M200,70 L1720,70 L1920,720 L0,720 Z" fill="url(#a5msk)" />
				<rect x={-200} y={700} width={W + 400} height={480} fill="url(#a5mf)" />
				{[120, 1640].map((x, i) => <g key={i}><rect x={x} y={500} width={170} height={200} fill="#1A1814" opacity={0.6} stroke="#C8C0B0" strokeOpacity={0.3} /><rect x={x} y={700} width={170} height={60} fill="#2A2420" /></g>)}
				{/* the gallery behind: people walk past, both ways */}<g filter="url(#a5rim)">
				<Visitor t={t} x0={-120} v={120} y={786} k={2.1} dir={1} seed={0} />
				<Visitor t={t} x0={2040} v={110} y={796} k={2.25} dir={-1} seed={3} coat="labcoat" />
				<Visitor t={t} x0={1500} v={90} y={778} k={1.95} dir={-1} seed={7} />
				<Visitor t={t} x0={1760} v={80} y={790} k={2.15} dir={1} seed={11} coat="labcoat" />
				<Visitor t={t} x0={-300} v={100} y={782} k={2.0} dir={1} seed={4} t0={171.2} coat="labcoat" />
				<Visitor t={t} x0={2150} v={115} y={800} k={2.3} dir={-1} seed={8} t0={171.6} /></g>
				<Haze y={790} h={120} c="#E8DCC8" o={0.2} id="a5mhz" />
			</g>
			<g transform={L(0.8)} filter="url(#a5rim)">
				{/* the parent and the child at the left of the case */}
				<Pup x={300} y={812} k={2.45} s={par} dress="labcoat" fill="#231E1A" />
				<Pup x={404} y={812} k={2.45} s={ch} dress="jacket" wide={0.72} fill="#231E1A" />
			</g>
			<g transform={L(1)}>
				<path d={pth([[600, 894], [1320, 894], [1344, 864], [624, 864]])} fill="#4A4440" /><rect x={600} y={894} width={720} height={300} fill="url(#a5mp)" />
				<path d="M600,894 L1320,894" stroke="#FFF0DC" strokeWidth={2.2} strokeOpacity={0.4} />
				<Glow x={960} y={890} r={340} c="#FFF0D8" o={0.22} id="a5mpool" sy={0.12} />
				{zunEl('mus', LMusDay, true)}
				<path d="M560,320 L560,894 M1360,320 L1360,894 M560,320 L1360,320" stroke="#E8E0D0" strokeOpacity={0.3} strokeWidth={2} fill="none" />
				{/* the glass: soft sheens and the passers-by on this side reflected in it */}
				<g clipPath="url(#a5glass)">
					<path d={`M${f1(640 + 30 * Math.sin(t * 0.3))},320 L${f1(720 + 30 * Math.sin(t * 0.3))},320 L${f1(660 + 30 * Math.sin(t * 0.3))},894 L${f1(590 + 30 * Math.sin(t * 0.3))},894 Z`} fill="#F4F0E8" opacity={0.06} />
					<path d="M1240,320 L1270,320 L1240,894 L1214,894 Z" fill="#F4F0E8" opacity={0.05} />
					<Visitor t={t} x0={1560} v={110} y={1180} k={3.6} dir={-1} seed={5} fill="#D8D0C4" o={0.1} coat="labcoat" />
					<Visitor t={t} x0={300} v={90} y={1200} k={3.9} dir={1} seed={9} fill="#D8D0C4" o={0.09} />
				</g>
				<rect x={1150} y={974} width={150} height={52} fill="#2A2622" stroke="#4A4440" /><text x={1225} y={1007} textAnchor="middle" fontFamily={KAI} fontSize={22} fill="#D8C8AA">何尊 · 西周</text>
			</g>
			{/* a foreground passer-by, close and out of focus, at the start */}
			<g opacity={0.9} filter="url(#a5zfb)"><defs><filter id="a5zfb" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={9} /></filter></defs>
				<Visitor t={t} x0={1300} v={120} y={1600} k={7.2} dir={1} seed={2} fill="#0E0C0A" />
				{/* later, heads and shoulders of people walking past close to the lens, along the bottom of the frame */}
				{t > 169.9 && t < 174.2 && <Visitor t={t} x0={2100} v={105} y={1790} k={6.4} dir={-1} seed={6} t0={169.9} fill="#100D0B" coat="labcoat" />}</g>
		</svg>
		<svg width={W} height={H} style={{position: 'absolute'}}><Vig id="a5mv" a={0.5} /></svg>
		{id === 'Z' && <FilmOv2 t={t} c={card2('Z')} measure={{x: 960 + (HOME_BOX.x1 + 44 - 960) * sc + tx, y0: 600 + (HOME_BOX.y0 - 600) * sc, y1: 600 + (HOME_BOX.y1 - 600) * sc}} />}
		{id === 'END' && <EndCard t={t} fade={fade} />}
		{void u}
	</AbsoluteFill>; };
const EndCard: React.FC<{t: number; fade: number}> = ({t, fade}) => { const a = T('END'), gold = '#F2C66E', fs = 76;
	useStampFonts('“中国”两个字，最早出现在哪？');
	const sealU = seg(t, beatT(beatN(a + 0.2) + 1) - 0.05, beatT(beatN(a + 0.2) + 1) + 0.45), sealS = 1 + 0.35 * (1 - land(sealU)), sealO = cl(sealU * 6);
	const inT = (b: number) => ease(seg(t, b, b + 0.45));
	const tT = beatT(beatN(a + 0.2) + 2), qT = beatT(beatN(a + 0.2) + 3), pT = beatT(beatN(a + 0.2) + 4), sT = beatT(beatN(a + 0.2) + 5);
	const black = ease(seg(t, 180.6, 181.55));
	const tw = fs * END_CARD.question.length * 1.03;
	return <>
		<div style={{position: 'absolute', inset: 0, background: `rgba(8,4,3,${(0.7 * fade).toFixed(3)})`}} />
		<svg width={W} height={H} style={{position: 'absolute'}}>{Array.from({length: 110}, (_, i) => { const life = 5 + 4 * rnd(i, 801), uu = ((t / life + rnd(i, 802)) % 1), x = 140 + rnd(i, 803) * 1640 + Math.sin(t * 0.9 + i) * 34, y = 1100 - uu * 1150;
			return <circle key={i} cx={f1(x)} cy={f1(y)} r={f1(1.8 + 3.2 * rnd(i, 804))} fill="#FFD890" opacity={0.62 * fade * Math.sin(Math.PI * uu) * (1 - ease(seg(t, 180.6, 181.55)))} />; })}</svg>
		{sealO > 0 && <><Img src={SEAL_SRC} style={{position: 'absolute', left: 960 - 70, top: 110, width: 140, height: 140, opacity: sealO, transform: `rotate(-6deg) scale(${sealS.toFixed(4)})`, filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))'}} />
			{sealU < 1 && <div style={{position: 'absolute', left: 960 - 110, top: 70, width: 220, height: 220, borderRadius: '50%', border: '3px solid rgba(200,60,40,0.5)', opacity: (1 - sealU) * sealO, transform: `scale(${(0.7 + 0.6 * sealU).toFixed(3)})`}} />}</>}
		<div style={{position: 'absolute', left: 0, right: 0, top: 284, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 60, lineHeight: 1.35, letterSpacing: '0.05em', color: gold, textShadow: thK.halo, whiteSpace: 'nowrap', opacity: inT(tT), transform: `translateY(${f1(14 * (1 - inT(tT)))}px)`}}>{END_CARD.title[0].slice(0, -1)}<span style={{marginRight: '-0.55em'}}>{END_CARD.title[0].slice(-1)}</span><br />{END_CARD.title[1].slice(0, -1)}<span style={{marginRight: '-0.55em'}}>{END_CARD.title[1].slice(-1)}</span></div>
		<div style={{position: 'absolute', left: 960 - tw / 2 - 260, top: 560 - 150, width: tw + 520, height: fs * 1.5 + 300, opacity: inT(qT), background: 'radial-gradient(closest-side, rgba(16,7,4,0.42), rgba(16,7,4,0.36) 45%, rgba(16,7,4,0.15) 80%, rgba(16,7,4,0))'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: fs, lineHeight: 1.5, letterSpacing: '0.03em', color: thK.ink, textShadow: thK.halo, whiteSpace: 'nowrap', opacity: inT(qT), transform: `translateY(${f1(14 * (1 - inT(qT)))}px)`}}>{END_CARD.question.slice(0, -1)}<span style={{marginRight: '-0.53em'}}>{END_CARD.question.slice(-1)}</span></div>
		<div style={{position: 'absolute', left: 760, top: 742, width: 400, height: 58, borderRadius: 29, border: `2px solid ${gold}`, background: 'rgba(255,217,138,0.08)', textAlign: 'center', lineHeight: '58px', fontFamily: SERIF, fontWeight: 700, fontSize: 28, letterSpacing: '0.1em', color: gold, opacity: inT(pT)}}>{END_CARD.pill}</div>
		<div style={{position: 'absolute', left: SAFE_X, right: SAFE_X, top: 868, textAlign: 'center', fontFamily: SANS, fontSize: 23, lineHeight: 1.6, color: '#D8CCB6', opacity: 0.88 * inT(sT), whiteSpace: 'nowrap', textShadow: '0 1px 3px rgba(0,0,0,0.8)'}}>{END_CARD.sources}</div>
		{black > 0 && <div style={{position: 'absolute', inset: 0, background: '#000', opacity: black}} />}
	</>; };

/* ============================== the act ============================== */
export const Act5: React.FC<{t: number}> = ({t}) => { const id = cardOf(t);
	useStampFonts('漢唐宋元明清中國国或大籍條例');
	if (id === 'Z' || id === 'END') return <Museum t={t} id={id} />;
	return <BeamScene t={t} id={id} />; };
void ([] as (Cam | typeof trackN)[]);
