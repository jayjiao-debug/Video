import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
/* ep57 · opening 「今天，我们一起去看看！」 — boarding the first flight, dawn at a Beijing remote stand. 2 bars = 100 frames.
   A live 3D scene in the episode's flat-colour + ink look (pinhole Cam from Q57CHICHEN): a generic narrow-body (fuselage as a
   real surface of revolution with a drooped nose, swept wing with dihedral, engine nacelle, gear), the plug door on the curved
   skin (it swings back parallel to the fuselage on its arm), the stairs truck docked at L1, apron, shadows from the low sun.
   The 「你」 figure (tools/you_figure.py, ported) climbs one tread per beat, turns and waves at the top on the bar-2 downbeat,
   steps in; the door swings shut on the last beat (the cut). Beat 0.418 s = 12.54 frames; frame 0 is a downbeat. */
const W = 1920, H = 1080, FPS = 30, BEAT = 0.418, NF = 100, INK = '#2A211B', GOLD = '#F2C66E', CREAM = '#FFF6E6';
const cl = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = (u: number) => { const v = cl(u); return v * v * (3 - 2 * v); };
const eo = (u: number) => 1 - Math.pow(1 - cl(u), 3);
const eio = (u: number) => { const x = cl(u); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const back = (u: number) => { const x = cl(u) - 1; return 1 + 2.7 * x * x * x + 1.7 * x * x; };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rad = (d: number) => d * Math.PI / 180;
type V3 = [number, number, number]; type V2 = [number, number];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const sc3 = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a: V3) => Math.sqrt(dot(a, a));
const norm = (a: V3): V3 => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
class Cam { C: V3; F: V3; R: V3; U: V3; f: number; c: V2;
	constructor(pos: V3, look: V3, f: number, c: V2) { this.C = pos; this.F = norm(sub(look, pos)); this.R = norm(cross(this.F, [0, 0, 1])); this.U = cross(this.R, this.F); this.f = f; this.c = c; }
	d(P: V3) { return dot(sub(P, this.C), this.F); }
	p(P: V3): V2 { const v = sub(P, this.C), d = Math.max(dot(v, this.F), 1e-3); return [this.c[0] + this.f * dot(v, this.R) / d, this.c[1] - this.f * dot(v, this.U) / d]; }
	k(P: V3) { return this.f / Math.max(this.d(P), 1e-3); }                     // pixels per metre at P
	sees(P: V3, n: V3) { return dot(n, sub(this.C, P)) > 0; } }
const NEAR = .4;
/* clip a world polygon to the camera's near plane before projecting (the apron and shadows reach behind the camera) */
const clipNear = (cam: Cam, P: V3[]): V3[] => { const o: V3[] = [];
	for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], da = cam.d(a) - NEAR, db = cam.d(b) - NEAR;
		if (da >= 0) o.push(a); if ((da >= 0) !== (db >= 0)) o.push(lerp3(a, b, da / (da - db))); }
	return o; };
const f2 = (v: number) => v.toFixed(2);
const pts = (ps: V2[]) => ps.map(([x, y]) => `${f2(x)},${f2(y)}`).join(' ');
const pj = (cam: Cam, P: V3[]) => clipNear(cam, P).map((q) => cam.p(q));
const Poly: React.FC<{cam: Cam; P: V3[]; fill: string; stroke?: string; sw?: number; op?: number}> = ({cam, P, fill, stroke = INK, sw = 2.5, op}) => {
	const q = pj(cam, P); if (q.length < 3) return null;
	return <polygon points={pts(q)} fill={fill} stroke={stroke} strokeWidth={stroke === 'none' ? 0 : sw} strokeLinejoin="round" opacity={op} />; };
const Line: React.FC<{cam: Cam; P: V3[]; stroke?: string; sw?: number; op?: number; dash?: string}> = ({cam, P, stroke = INK, sw = 2, op, dash}) =>
	<polyline points={pts(P.map((q) => cam.p(q)))} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" opacity={op} strokeDasharray={dash} />;
/* a rod: ink underlay + colour (handrails, struts) */
const Rod: React.FC<{cam: Cam; P: V3[]; c: string; w: number}> = ({cam, P, c, w}) => { const s = pts(P.map((q) => cam.p(q)));
	return <g><polyline points={s} fill="none" stroke={INK} strokeWidth={w + 3} strokeLinecap="round" strokeLinejoin="round" />
		<polyline points={s} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" /></g>; };
const hull = (P: V2[]): V2[] => { const p = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); if (p.length < 3) return p;
	const cr = (o: V2, a: V2, b: V2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); const lo: V2[] = [], up: V2[] = [];
	for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
	for (const q of p.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
	return lo.slice(0, -1).concat(up.slice(0, -1)); };
const mul = (seed: number) => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

/* ---------- light: a low dawn sun behind the tail (screen right); the camera sees the shaded side with a warm top rim ---------- */
const SUN_AZ = rad(201), SUN_EL = rad(4);                                           // the disc we see, low on the horizon
const SUN: V3 = norm([Math.cos(SUN_AZ) * Math.cos(rad(24)), Math.sin(SUN_AZ) * Math.cos(rad(24)), Math.sin(rad(24))]);   // light for shading & shadows
type Pal = [string, string, string];                                                // lit, shade, deep shade (underside)
const tone = (n: V3, p: Pal, rim = .03) => { const k = dot(n, SUN); return k > rim ? p[0] : n[2] < -.42 ? p[2] : p[1]; };
const shadowPt = (P: V3): V3 => [P[0] - P[2] * SUN[0] / SUN[2], P[1] - P[2] * SUN[1] / SUN[2], .01];
/* a box with toon-shaded faces (only the faces turned to the camera; convex, so no sorting inside) */
const Box: React.FC<{cam: Cam; a: V3; b: V3; pal: Pal; sw?: number; skip?: string}> = ({cam, a, b, pal, sw = 2.2, skip = ''}) => {
	const [x0, y0, z0] = a, [x1, y1, z1] = b, o: React.ReactNode[] = [];
	const F: [string, V3, V3[]][] = [['t', [0, 0, 1], [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]], ['b', [0, 0, -1], [[x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]]],
		['x', [1, 0, 0], [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]]], ['X', [-1, 0, 0], [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]]],
		['y', [0, 1, 0], [[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]]], ['Y', [0, -1, 0], [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]]]];
	for (const [k, n, P] of F) { if (skip.includes(k)) continue; if (cam.sees(P[0], n)) o.push(<Poly key={k} cam={cam} P={P} fill={tone(n, pal)} sw={sw} />); }
	return <g>{o}</g>; };
const boxPts = (a: V3, b: V3): V3[] => [[a[0], a[1], a[2]], [b[0], a[1], a[2]], [b[0], b[1], a[2]], [a[0], b[1], a[2]], [a[0], a[1], b[2]], [b[0], a[1], b[2]], [b[0], b[1], b[2]], [a[0], b[1], b[2]]];
const ShadowHull: React.FC<{cam: Cam; P: V3[]}> = ({cam, P}) => { const S = P.map(shadowPt), h = hull(S.map((q) => [q[0], q[1]] as V2));
	return <Poly cam={cam} P={h.map(([x, y]) => [x, y, .01] as V3)} fill="#000" stroke="none" />; };
/* a wheel: cylinder on an axis (unit vector), drawn as the hull of both rims plus the near face and hub */
const Wheel: React.FC<{cam: Cam; c: V3; ax: V3; r: number; w: number}> = ({cam, c, ax, r, w}) => {
	const u = norm(cross(ax, [0, 0, 1])[0] === 0 && cross(ax, [0, 0, 1])[1] === 0 ? [1, 0, 0] : cross(ax, [0, 0, 1])), v = cross(ax, u);
	const ring = (o: V3, rr: number) => Array.from({length: 20}, (_, i) => { const a = 2 * Math.PI * i / 20; return add(o, add(sc3(u, rr * Math.cos(a)), sc3(v, rr * Math.sin(a)))); });
	const A = add(c, sc3(ax, w / 2)), B = add(c, sc3(ax, -w / 2)), near = cam.sees(A, ax) ? A : B;
	const all = [...ring(A, r), ...ring(B, r)].map((q) => cam.p(q));
	return <g><polygon points={pts(hull(all))} fill="#2E2C35" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
		<polygon points={pts(ring(near, r * .93).map((q) => cam.p(q)))} fill="#3A3842" stroke={INK} strokeWidth={1.6} />
		<polygon points={pts(ring(near, r * .5).map((q) => cam.p(q)))} fill="#B7BAC6" stroke={INK} strokeWidth={1.6} />
		<polygon points={pts(ring(near, r * .16).map((q) => cam.p(q)))} fill="#6E7184" stroke="none" /></g>; };

/* ---------- the reference widgets (Q57CHICHEN) ---------- */
const Widget: React.FC<{x: number; y: number; w: number; h: number; children: React.ReactNode; op?: number}> = ({x, y, w, h, children, op = 1}) =>
	<g opacity={op}><rect x={x} y={y} width={w} height={h} rx={18} fill="rgba(20,16,12,.72)" stroke="rgba(242,198,110,.85)" strokeWidth={2.5} />{children}</g>;
const T2: React.FC<{x: number; y: number; s: string; size: number; col?: string; anchor?: 'start' | 'middle' | 'end'; w?: number; ls?: number}> = ({x, y, s, size, col = '#FFF6E6', anchor = 'start', w = 900, ls}) =>
	<text x={x} y={y} textAnchor={anchor} fontFamily="Noto Sans CJK SC" fontWeight={w} fontSize={size} fill={col} letterSpacing={ls} style={{fontVariantNumeric: 'tabular-nums'}}>{s}</text>;
const Callout: React.FC<{from: V2; to: V2; label: string; u: number; side?: number}> = ({from, to, label, u, side = 1}) => {
	if (u <= 0) return null; const a = cl(u / .5), b = cl((u - .4) / .4), mx = from[0] + (to[0] - from[0]) * a, my = from[1] + (to[1] - from[1]) * a;
	return <g><line x1={from[0]} y1={from[1]} x2={mx} y2={my} stroke={GOLD} strokeWidth={3} /><circle cx={from[0]} cy={from[1]} r={7} fill={GOLD} stroke={INK} strokeWidth={2} />
		<g opacity={b}><rect x={to[0] - (side > 0 ? 0 : 20 + label.length * 34)} y={to[1] - 30} width={20 + label.length * 34} height={50} rx={12} fill="rgba(20,16,12,.8)" stroke={GOLD} strokeWidth={2} />
		<T2 x={to[0] + (side > 0 ? 10 : -10)} y={to[1] + 7} s={label} size={30} col={GOLD} anchor={side > 0 ? 'start' : 'end'} /></g></g>; };
/* ---------- the aircraft: a generic narrow-body (A320-class proportions, metres). Nose at x = 0 pointing +x, port side +y ---------- */
const R0 = 1.98, ZC = 3.9, LN = 6, XT0 = -27.5, XEND = -37.6;
const XD = -6.9, DW = .85, SILL = 3.35, DTOP = 5.2, DR = .17;                       // L1 door: centre, width, sill, top, corner radius
const fus = (x: number): [number, number] => {                                       // [radius, axis height] at station x
	if (x > -LN) { const s = cl(-x / LN); return [R0 * Math.sqrt(Math.max(0, 1 - (1 - s) * (1 - s))), ZC - .85 * (1 - s) * (1 - s)]; }
	if (x < XT0) { const s = cl((XT0 - x) / (XT0 - XEND)); return [R0 * (1 - .8 * Math.pow(s, 1.25)), ZC + 1.05 * Math.pow(s, 1.6)]; }
	return [R0, ZC]; };
const SP = (x: number, th: number, out = 0): V3 => { const [r, zc] = fus(x); return [x, (r + out) * Math.cos(th), zc + (r + out) * Math.sin(th)]; };
const fusN = (x: number, th: number): V3 => { const e = .01, [r1, z1] = fus(x + e), [r0, z0] = fus(x - e), dr = (r1 - r0) / (2 * e), dz = (z1 - z0) / (2 * e);
	return norm([-Math.sin(th) * dz - dr, Math.cos(th), Math.sin(th)]); };
const onSkin = (x: number, z: number, out = 0): V3 => { const [r, zc] = fus(x), rr = r + out, dz = z - zc; return [x, Math.sqrt(Math.max(0, rr * rr - dz * dz)), z]; };
const STA: number[] = [...Array.from({length: 17}, (_, i) => -LN * Math.pow(i / 16, 1.7)), XT0, ...Array.from({length: 10}, (_, i) => XT0 + (XEND - XT0) * (i + 1) / 10)];
const NA = 72, THS = Array.from({length: NA + 1}, (_, j) => -Math.PI / 2 + 2 * Math.PI * j / NA);
const P_WHITE: Pal = ['#F7E2C4', '#C9CBDC', '#B0B3C8'], P_BELLY: Pal = ['#E0CAB0', '#A9ACC0', '#9195AC'], P_TEAL: Pal = ['#86AFAA', '#3F6E7E', '#335D6C'];
/* rounded rectangle in (x, z) on the skin */
const rrect = (x0: number, x1: number, z0: number, z1: number, r: number, n = 5): [number, number][] => { const o: [number, number][] = [];
	const c: [number, number, number][] = [[x1 - r, z0 + r, -Math.PI / 2], [x1 - r, z1 - r, 0], [x0 + r, z1 - r, Math.PI / 2], [x0 + r, z0 + r, Math.PI]];
	for (const [cx, cz, a0] of c) for (let i = 0; i <= n; i++) { const a = a0 + Math.PI / 2 * i / n; o.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]); }
	return o; };
const DOOR = rrect(XD - DW / 2, XD + DW / 2, SILL, DTOP, DR);
/* a surface of revolution about an axis parallel to x, drawn as flat toon bands with exact (sub-sample) boundaries per station:
   for each ring, the visible arc (between the two silhouette angles) and the angles where the tone changes; bands are joined
   station to station, so the band edges and the outline are smooth curves, not facets. prof(x) = [radius, axis y, axis z]. */
type Prof = (x: number) => [number, number, number];
const revP = (pf: Prof, x: number, th: number): V3 => { const [r, cy, cz] = pf(x); return [x, cy + r * Math.cos(th), cz + r * Math.sin(th)]; };
const revN = (pf: Prof, x: number, th: number): V3 => { const e = .01, a = pf(x + e), b = pf(x - e), dr = (a[0] - b[0]) / (2 * e), dy = (a[1] - b[1]) / (2 * e), dz = (a[2] - b[2]) / (2 * e);
	return norm([-Math.sin(th) * dz - Math.cos(th) * dy - dr, Math.cos(th), Math.sin(th)]); };
const Rev: React.FC<{cam: Cam; pf: Prof; st: number[]; band: (n: V3, th: number) => number; cols: string[]; sw?: number; endArc?: boolean}> = ({cam, pf, st, band, cols, sw = 2.8, endArc = true}) => {
	const nb = cols.length, B: number[][] = [];
	const g = (x: number, th: number) => dot(revN(pf, x, th), sub(cam.C, revP(pf, x, th)));
	const bis = (lo: number, hi: number, inLo: (th: number) => boolean) => { for (let i = 0; i < 12; i++) { const m = (lo + hi) / 2; if (inLo(m)) lo = m; else hi = m; } return (lo + hi) / 2; };
	for (const x of st) { const [r, cy, cz] = pf(x), thc = Math.atan2(cam.C[2] - cz, cam.C[1] - cy);
		if (r < 1e-3) { B.push(Array(nb + 1).fill(thc)); continue; }
		let top = thc + Math.PI, bot = thc - Math.PI;
		for (let d = rad(3); d <= Math.PI; d += rad(3)) if (g(x, thc + d) <= 0) { top = bis(thc + d - rad(3), thc + d, (th) => g(x, th) > 0); break; }
		for (let d = rad(3); d <= Math.PI; d += rad(3)) if (g(x, thc - d) <= 0) { bot = bis(thc - d, thc - d + rad(3), (th) => g(x, th) <= 0); break; }
		const idx = (th: number) => band(revN(pf, x, th), th), row = [bot];
		for (let i = 1; i < nb; i++) { const S = 48; let v = top;
			for (let j = 0; j <= S; j++) { const th = lerp(bot, top, j / S); if (idx(th) >= i) { v = j === 0 ? bot : bis(lerp(bot, top, (j - 1) / S), th, (q) => idx(q) < i); break; } }
			row.push(Math.max(v, row[row.length - 1])); }
		row.push(top); B.push(row); }
	const arc = (x: number, a: number, b: number, n = 10) => Array.from({length: n + 1}, (_, i) => revP(pf, x, lerp(a, b, i / n)));
	const N = st.length, o: React.ReactNode[] = [];
	for (let i = 0; i < nb; i++) { if (B.every((row) => row[i + 1] - row[i] < 1e-4)) continue;
		const P: V3[] = [...st.map((x, s) => revP(pf, x, B[s][i])), ...arc(st[N - 1], B[N - 1][i], B[N - 1][i + 1]), ...st.slice().reverse().map((x, s) => revP(pf, x, B[N - 1 - s][i + 1])), ...arc(st[0], B[0][i + 1], B[0][i])];
		o.push(<Poly key={`b${i}`} cam={cam} P={P} fill={cols[i]} stroke={cols[i]} sw={1} />); }
	o.push(<Line key="top" cam={cam} P={st.map((x, s) => revP(pf, x, B[s][nb]))} sw={sw} />, <Line key="bot" cam={cam} P={st.map((x, s) => revP(pf, x, B[s][0]))} sw={sw} />);
	if (endArc) o.push(<Line key="end" cam={cam} P={arc(st[N - 1], B[N - 1][0], B[N - 1][nb], 24)} sw={sw * .8} />);
	return <g>{o}</g>; };
const FUS_PF: Prof = (x) => { const [r, zc] = fus(x); return [r, 0, zc]; };
const FUS_ST = [...Array.from({length: 21}, (_, i) => -LN * Math.pow(i / 20, 1.8)), ...Array.from({length: 21}, (_, i) => lerp(-LN, XT0, (i + 1) / 21)), ...Array.from({length: 12}, (_, i) => XT0 + (XEND - XT0) * (i + 1) / 12)];
const fusBand = (n: V3, th: number) => { const a = Math.atan2(Math.sin(th), Math.cos(th)), belly = a < rad(-50) && a > rad(-130);
	return dot(n, SUN) > .03 ? 3 : n[2] < -.42 ? (belly ? 0 : 1) : 2; };
const FAIR_ST = Array.from({length: 16}, (_, i) => lerp(-10.2, -21.8, i / 15));
const Fairing: React.FC<{cam: Cam}> = ({cam}) => <Rev cam={cam} pf={(x) => [1.15 * Math.pow(Math.max(0, Math.sin(Math.PI * cl((-10.2 - x) / 11.6))), .45), 0, 2.62]} st={FAIR_ST} band={fusBand} cols={[P_BELLY[2], P_WHITE[2], P_WHITE[1], P_WHITE[0]]} sw={2.4} endArc={false} />;
const FusMesh: React.FC<{cam: Cam}> = ({cam}) => <Rev cam={cam} pf={FUS_PF} st={FUS_ST} band={fusBand} cols={[P_BELLY[2], P_WHITE[2], P_WHITE[1], P_WHITE[0]]} />;
/* a patch on the skin given by (x, θ) corners, bilinear, sampled so it follows the curve */
const skinQuad = (c: [number, number][], out = .005, n = 6): V3[] => { const o: V3[] = [];
	for (let e = 0; e < 4; e++) { const [xa, ta] = c[e], [xb, tb] = c[(e + 1) % 4]; for (let i = 0; i < n; i++) { const u = i / n; o.push(SP(lerp(xa, xb, u), lerp(ta, tb, u), out)); } }
	return o; };
const COCKPIT: [number, number][][] = [
	[[-1.42, rad(38)], [-2.18, rad(36)], [-2.22, rad(66)], [-1.72, rad(74)]],
	[[-2.36, rad(36)], [-3.08, rad(35)], [-3.04, rad(58)], [-2.4, rad(63)]],
	[[-3.24, rad(35)], [-3.92, rad(35)], [-3.88, rad(53)], [-3.28, rad(57)]]];
const WINX = Array.from({length: 40}, (_, i) => -8.3 - .533 * i).filter((x) => x > -29.6);
const Livery: React.FC<{cam: Cam}> = ({cam}) => {
	const o: React.ReactNode[] = [];
	// the cheatline: a teal band below the windows, sweeping down to a point behind the radome
	const band: V3[] = [], n0 = 60;
	for (let i = 0; i <= n0; i++) { const x = lerp(-3.2, -30.5, i / n0), w = cl((-x - 3.2) / 2.2); band.push(SP(x, rad(-6 - 3 * (1 - w)), .004)); }
	for (let i = n0; i >= 0; i--) { const x = lerp(-3.2, -30.5, i / n0), w = cl((-x - 3.2) / 2.2); band.push(SP(x, rad(-6 - 3 * (1 - w) - 5.5 * w), .004)); }
	o.push(<Poly key="cheat" cam={cam} P={band} fill={P_TEAL[1]} stroke="none" />);
	const R = mul(12);
	WINX.forEach((x, i) => { const q = rrect(x - .12, x + .12, 4.18, 4.52, .1, 3).map(([xx, z]) => onSkin(xx, z, .004)), blind = R();
		o.push(<Poly key={`w${i}`} cam={cam} P={q} fill="#F2C27E" stroke={INK} sw={1.4} />);
		if (blind < .35) o.push(<Poly key={`b${i}`} cam={cam} P={rrect(x - .12, x + .12, 4.52 - .34 * (.35 + blind), 4.52, .1, 3).map(([xx, z]) => onSkin(xx, z, .005))} fill="#E6E2E4" stroke="none" />); });
	COCKPIT.forEach((c, i) => o.push(<g key={`c${i}`}><Poly cam={cam} P={skinQuad(c)} fill="#2C3552" sw={2} />
		<Poly cam={cam} P={skinQuad([[c[0][0], c[0][1] + rad(7)], [c[1][0], c[1][1] + rad(7)], [lerp(c[1][0], c[2][0], .5), lerp(c[1][1], c[2][1], .45)], [lerp(c[0][0], c[3][0], .5), lerp(c[0][1], c[3][1], .45)]], .007)} fill="#55648C" stroke="none" op={.7} /></g>));
	// the aft door L2, closed: its gap line only
	o.push(<Poly key="l2" cam={cam} P={rrect(-31.2, -30.4, 3.42, 5.1, .15).map(([x, z]) => onSkin(x, z, .004))} fill="none" stroke="#7E8199" sw={1.8} />);
	// the L1 door surround: the seal frame and the gap
	o.push(<Poly key="fr" cam={cam} P={rrect(XD - DW / 2 - .07, XD + DW / 2 + .07, SILL - .07, DTOP + .07, DR + .06).map(([x, z]) => onSkin(x, z, .004))} fill="none" stroke="#E9E9F1" sw={3} />);
	return <g>{o}</g>; };

/* the cabin behind the L1 opening: vestibule walls, the R1 door opposite, the aisle into the cabin, the frame's thickness */
const Doorway: React.FC<{cam: Cam; children?: React.ReactNode}> = ({cam, children}) => {
	const outer = DOOR.map(([x, z]) => onSkin(x, z)), inner = DOOR.map(([x, z]) => onSkin(x, z, -.2));
	const x0 = XD - 1.55, x1 = XD + 1.2, y0 = -1.55, y1 = 1.85, zf = SILL, zt = 5.45, o: React.ReactNode[] = [];
	o.push(<Poly key="ceil" cam={cam} P={[[x0, y0, zt], [x1, y0, zt], [x1, y1, zt], [x0, y1, zt]]} fill="#FBEACB" sw={2} />);
	o.push(<Poly key="sw" cam={cam} P={[[x0, y0, zf], [x1, y0, zf], [x1, y0, zt], [x0, y0, zt]]} fill="#EFC891" sw={2} />);
	o.push(<Poly key="r1" cam={cam} P={rrect(XD - .42, XD + .42, zf + .02, 5.2, .16).map(([x, z]) => [x, y0 + .01, z] as V3)} fill="#DEDDE6" sw={2} />);
	o.push(<Poly key="r1w" cam={cam} P={Array.from({length: 14}, (_, i) => [XD + .1 * Math.cos(i * Math.PI / 7), y0 + .02, 4.5 + .12 * Math.sin(i * Math.PI / 7)] as V3)} fill="#A9B6D6" sw={1.6} />);
	o.push(<Poly key="aw" cam={cam} P={[[x0, y0, zf], [x0, y1, zf], [x0, y1, zt], [x0, y0, zt]]} fill="#F6D7A6" sw={2} />);
	o.push(<Poly key="aisle" cam={cam} P={[[x0, -.38, zf], [x0, .42, zf], [x0, .42, 5.15], [x0, -.38, 5.15]]} fill="#B98A5A" sw={2} />);
	o.push(<Poly key="seat" cam={cam} P={[[x0 - .9, .42, zf + .5], [x0 - .9, .2, zf + .5], [x0 - .9, .2, zf + 1.15], [x0 - .9, .42, zf + 1.15]]} fill="#46557E" sw={1.6} />);
	o.push(<Poly key="floor" cam={cam} P={[[x0, y0, zf], [x1, y0, zf], [x1, y1, zf], [x0, y1, zf]]} fill="#A08070" sw={2} />);
	o.push(<Poly key="lamp" cam={cam} P={[[x0 + .3, -.2, zt - .01], [x1 - .3, -.2, zt - .01], [x1 - .3, .2, zt - .01], [x0 + .3, .2, zt - .01]]} fill="#FFF7E2" stroke="none" />);
	// the frame's thickness (jambs, sill, lintel) — only the faces turned to the camera
	const cx = XD, cz = (SILL + DTOP) / 2;
	for (let k = 0; k < DOOR.length; k++) { const k1 = (k + 1) % DOOR.length, [xa, za] = DOOR[k], n = norm([cx - xa, 0, cz - za]);
		if (!cam.sees(outer[k], n)) continue; const sill = za < SILL + .05 && DOOR[k1][1] < SILL + .05;
		o.push(<Poly key={`j${k}`} cam={cam} P={[outer[k], outer[k1], inner[k1], inner[k]]} fill={sill ? '#B4B7C4' : '#D8D9E4'} stroke={sill ? '#B4B7C4' : '#D8D9E4'} sw={1} />); }
	return <g>{o}{children}</g>; };
/* the plug door: on the curved skin; when open it hangs forward of the opening, parallel to the fuselage, on its arm.
   s = 0 open … 1 shut: it swings out and back along an arc (staying parallel), then plugs into the frame. */
const doorOff = (s: number): [number, number, number] => { const ph = Math.PI * cl(s), D = DW + .1; return [D * (1 + Math.cos(ph)) / 2, .22 * (1 + Math.cos(ph)) / 2 + .42 * Math.sin(ph), .06 * Math.sin(Math.min(Math.PI, ph * 1.3))]; };
const DoorPanel: React.FC<{cam: Cam; s: number}> = ({cam, s}) => {
	const [dx, dy, dz] = doorOff(s), sh = rrect(XD - DW / 2 + .012, XD + DW / 2 - .012, SILL + .012, DTOP - .012, DR - .01);
	const at = (x: number, z: number, out = 0): V3 => { const q = onSkin(x, z, out); return [q[0] + dx, q[1] + dy, q[2] + dz]; };
	const face = sh.map(([x, z]) => at(x, z, .004)), o: React.ReactNode[] = [];
	// the arm from the forward jamb to the door
	const hz = 4.25, hinge = onSkin(XD + DW / 2 - .04, hz, -.08), att = at(XD + DW / 2 - .18, hz, -.1);
	if (s < .97) o.push(<Rod key="arm" cam={cam} P={[hinge, att]} c="#9A9DAE" w={5} />);
	// the forward edge (door thickness), seen from the front
	const fwd = sh.filter(([x]) => x > XD + DW / 2 - DR - .01).sort((a, b) => a[1] - b[1]);
	const edge: V3[] = [...fwd.map(([x, z]) => at(x, z, .004)), ...fwd.slice().reverse().map(([x, z]) => at(x, z, -.13))];
	if (cam.sees(at(XD + DW / 2, 4.2), [1, 0, 0])) o.push(<Poly key="edge" cam={cam} P={edge} fill="#A4A7BB" sw={2} />);
	o.push(<Poly key="face" cam={cam} P={face} fill={P_WHITE[1]} sw={2.6} />);
	const cz = 3.59, ctop = cz + .2;   // the cheatline continues across the door
	o.push(<Poly key="cl" cam={cam} P={[at(XD - DW / 2 + .015, cz - .19, .006), at(XD + DW / 2 - .015, cz - .19, .006), at(XD + DW / 2 - .015, ctop - .19, .006), at(XD - DW / 2 + .015, ctop - .19, .006)]} fill={P_TEAL[1]} stroke="none" />);
	o.push(<Poly key="win" cam={cam} P={Array.from({length: 16}, (_, i) => at(XD + .08 * Math.cos(i * Math.PI / 8), 4.46 + .1 * Math.sin(i * Math.PI / 8), .008))} fill="#F2C27E" sw={1.6} />);
	o.push(<Poly key="hd" cam={cam} P={rrect(XD - .3, XD - .06, 3.98, 4.08, .04, 2).map(([x, z]) => at(x, z, .008))} fill="#8E91A6" sw={1.4} />);
	return <g>{o}</g>; };

/* wing (port sgn = 1, starboard -1): swept, dihedral, a slab with thickness; a sharklet at the tip */
const wz = (y: number) => 2.45 + (Math.abs(y) - 1.75) * .09, wt = (y: number) => lerp(.42, .12, cl((Math.abs(y) - 1.75) / 15.15));
const PLAN: [number, number][] = [[-11.6, 1.75], [-19.0, 16.9], [-20.4, 16.9], [-17.85, 6.4], [-17.7, 1.75]];
const Wing: React.FC<{cam: Cam; sgn: number}> = ({cam, sgn}) => {
	const T = PLAN.map(([x, y]) => [x, sgn * y, wz(y) + wt(y) * .5] as V3), B = PLAN.map(([x, y]) => [x, sgn * y, wz(y) - wt(y) * .3] as V3), o: React.ReactNode[] = [];
	const top = cam.C[2] > wz(5) + .1;
	o.push(<Poly key="s" cam={cam} P={top ? T : B} fill={top ? '#E8D3B6' : '#A2A6BC'} sw={2.4} />);
	o.push(<Poly key="le" cam={cam} P={[T[0], T[1], B[1], B[0]]} fill="#B7BACB" sw={2.2} />);
	if (top) { const xl = (y: number) => lerp(-11.6, -19.0, (y - 1.75) / 15.15), xt = (y: number) => y < 6.4 ? lerp(-17.7, -17.85, (y - 1.75) / 4.65) : lerp(-17.85, -20.4, (y - 6.4) / 10.5);
		const at = (y: number, c: number): V3 => [lerp(xl(y), xt(y), c), sgn * y, wz(y) + wt(y) * .5 + .005], YS = [1.75, 6.4, 16.9];
		const band = (c0: number, c1: number): V3[] => [...YS.map((y) => at(y, c0)), ...YS.slice().reverse().map((y) => at(y, c1))];
		o.push(<Poly key="slat" cam={cam} P={band(0, .13)} fill="#F4E4CC" sw={1.4} />, <Poly key="flap" cam={cam} P={band(.74, 1)} fill="#D6BD9D" sw={1.4} />);
		[.35, .62].forEach((y0, i) => { const y = lerp(6.4, 16.9, y0); o.push(<Line key={`fp${i}`} cam={cam} P={[at(y, .74), at(y, 1)]} sw={1.4} />); });
		o.push(<Poly key="fence" cam={cam} P={[at(6.4, .74), at(6.4, 1.0), at(9.5, 1.0), at(9.5, .74)]} fill="#CDB394" sw={1.4} />); }
	const zt = wz(16.9);
	o.push(<Poly key="sk" cam={cam} P={[[-19.0, sgn * 16.9, zt], [-20.4, sgn * 16.9, zt], [-21.5, sgn * 17.2, zt + 2.3], [-20.9, sgn * 17.2, zt + 2.45]]} fill={P_TEAL[1]} sw={2.2} />);
	return <g>{o}</g>; };
/* engine nacelle on its pylon: a surface of revolution about its own axis, the inlet lip, fan and spinner swirl */
const EX0 = -9.3, EZ = 1.72;
const NAC: [number, number][] = [[-9.3, .96], [-9.55, 1.05], [-10.4, 1.08], [-11.8, 1.02], [-12.9, .86], [-13.5, .7]];
const rE = (x: number) => { const u = cl((EX0 - x) / (EX0 + 13.5)); return u < .3 ? 1.08 - .11 * Math.pow(1 - u / .3, 2) : 1.08 - .38 * Math.pow((u - .3) / .7, 1.8); };
const Engine: React.FC<{cam: Cam; sgn: number}> = ({cam, sgn}) => {
	const EY = 5.75 * sgn, n = 40, ring = (x: number, r: number) => Array.from({length: n + 1}, (_, j) => { const a = -Math.PI / 2 + 2 * Math.PI * j / n; return [x, EY + r * Math.cos(a), EZ + r * Math.sin(a)] as V3; });
	const o: React.ReactNode[] = [];
	const zw = wz(5.75) - wt(5.75) * .3;
	o.push(<Poly key="py" cam={cam} P={[[-10.2, EY + .16 * sgn, EZ + 1.0], [-13.9, EY + .16 * sgn, EZ + .82], [-15.9, EY + .16 * sgn, zw], [-13.3, EY + .16 * sgn, zw]]} fill="#B4B7C8" sw={2.2} />);
	o.push(<Rev key="nac" cam={cam} pf={(x) => [rE(x), EY, EZ]} st={Array.from({length: 18}, (_, i) => lerp(EX0, -13.5, i / 17))} band={(nn) => dot(nn, SUN) > .03 ? 2 : nn[2] < -.42 ? 0 : 1} cols={[P_WHITE[2], P_WHITE[1], P_WHITE[0]]} sw={2.4} />);
	if (cam.sees([EX0, EY, EZ], [1, 0, 0])) { const face = (r: number, dx = 0) => ring(EX0 - dx, r).slice(0, n);
		o.push(<Poly key="lip" cam={cam} P={face(.96)} fill="#D3D5E0" sw={2.4} />);
		o.push(<Poly key="fan" cam={cam} P={face(.8, .25)} fill="#2C2E3B" sw={2} />);
		for (let k = 0; k < 14; k++) { const a = 2 * Math.PI * k / 14; o.push(<Line key={`b${k}`} cam={cam} P={[[EX0 - .25, EY + .25 * Math.cos(a), EZ + .25 * Math.sin(a)], [EX0 - .25, EY + .78 * Math.cos(a + .25), EZ + .78 * Math.sin(a + .25)]]} stroke="#454959" sw={1.5} />); }
		o.push(<Poly key="spin" cam={cam} P={Array.from({length: 18}, (_, k) => { const a = 2 * Math.PI * k / 18; return [EX0 - .1, EY + .22 * Math.cos(a), EZ + .22 * Math.sin(a)] as V3; })} fill="#C7C9D4" sw={1.6} />);
		o.push(<Line key="swirl" cam={cam} P={Array.from({length: 12}, (_, k) => { const u = k / 11, a = 3.6 * u; return [EX0 - .08, EY + .2 * u * Math.cos(a), EZ + .2 * u * Math.sin(a)] as V3; })} stroke="#FFFFFF" sw={2} />); }
	return <g>{o}</g>; };
const nacPts = (sgn: number): V3[] => NAC.flatMap(([x, r]) => Array.from({length: 12}, (_, j) => { const a = 2 * Math.PI * j / 12; return [x, 5.75 * sgn + r * Math.cos(a), EZ + r * Math.sin(a)] as V3; }));
/* landing gear: strut + wheels */
const Gear: React.FC<{cam: Cam; x: number; y: number; r: number; top: number; dy: number}> = ({cam, x, y, r, top, dy}) =>
	<g><Rod cam={cam} P={[[x, y, top], [x, y, r]]} c="#C6C8D3" w={9} /><Rod cam={cam} P={[[x, y - dy, r], [x, y + dy, r]]} c="#9EA1B2" w={6} />
		{[-1, 1].sort((a, b) => cam.d([x, y + b * dy, r]) - cam.d([x, y + a * dy, r])).map((s) => <Wheel key={s} cam={cam} c={[x, y + s * dy, r]} ax={[0, 1, 0]} r={r} w={r * .6} />)}</g>;
/* the tail fin and stabilisers (plain teal tail, no logo) */
const Tail: React.FC<{cam: Cam}> = ({cam}) => <g>
	<Poly cam={cam} P={[[-29.2, 0, 5.6], [-35.4, 0, 11.7], [-37.0, 0, 11.7], [-36.2, 0, 5.4]]} fill={P_TEAL[1]} sw={2.4} />
	<Poly cam={cam} P={[[-32.6, 0, 5.1], [-35.8, 6.1, 5.6], [-36.9, 6.1, 5.6], [-36.6, 0, 5.1]]} fill="#C2C5D6" sw={2.2} /></g>;
/* ---------- the stairs truck docked at L1: platform at sill height, 12 treads + platform, cab under the platform ---------- */
const XS = XD - .2, SX0 = XD - .85, SX1 = XD + .45, DECK = .55, NR = 13, RH = (SILL - DECK) / NR, G = .27, PY0 = 1.97, PY1 = 3.25;
const TY0 = (k: number) => PY1 + (12 - k) * G;                                      // back edge of tread k (1..12)
const TZ = (k: number) => DECK + k * RH;
const TC = (k: number, x: number): V3 => k >= 13 ? [x, 2.9, SILL] : [x, TY0(k) + G * .5, TZ(k)];
const noseZ = (y: number) => DECK + RH * (13 - (y - PY1) / G);                       // the line through the tread noses
const YBOT = TY0(1) + G;
const P_BODY: Pal = ['#F3E6D2', '#C3C6D6', '#A8ABBF'], P_DARK: Pal = ['#8C8E9C', '#55586A', '#474A5A'], P_TUG: Pal = ['#F3CB62', '#C4963C', '#A57E30'];
const RAIL = '#E2E3EA';
const railPts = (x: number): V3[] => [[x, YBOT + .08, noseZ(YBOT) + .95], [x, PY1, SILL + 1.0], [x, 2.62, SILL + 1.0]];
const Rails: React.FC<{cam: Cam; x: number}> = ({cam, x}) => { const o: React.ReactNode[] = [];
	const top = railPts(x), mid = top.map(([a, b, c]) => [a, b, c - .48] as V3);
	[YBOT + .08, TY0(4) + G, TY0(8) + G, PY1, 2.62].forEach((y, i) => { const zb = y >= PY1 - .01 ? (y > PY1 + .01 ? noseZ(y) : SILL) : SILL; const z0 = y > PY1 + .01 ? noseZ(y) + .03 : SILL;
		void zb; o.push(<Rod key={`p${i}`} cam={cam} P={[[x, y, z0], [x, y, z0 + (y > PY1 + .01 ? .95 : 1.0) + .02]]} c={RAIL} w={3.4} />); });
	o.push(<Rod key="m" cam={cam} P={mid} c={RAIL} w={2.6} />, <Rod key="t" cam={cam} P={top} c={RAIL} w={4.4} />);
	return <g>{o}</g>; };
const Stringer: React.FC<{cam: Cam; x: number}> = ({cam, x}) => {
	const P: V3[] = [[x, YBOT + .04, noseZ(YBOT) + .06], [x, PY1, SILL + .06], [x, PY0, SILL + .06], [x, PY0, SILL - .26], [x, PY1, SILL - .3], [x, YBOT + .04, Math.max(DECK, noseZ(YBOT) - .3)]];
	return <Poly cam={cam} P={P} fill={tone([Math.sign(x - XS), 0, 0], P_BODY)} sw={2.4} />; };
const truckBodyPts = (): V3[] => [...boxPts([XS - .95, 2.25, .42], [XS + .95, 6.95, 2.35])];
const truckStairPts = (): V3[] => [SX0, SX1].flatMap((x) => [[x, YBOT, DECK], [x, YBOT, noseZ(YBOT) + 1], [x, PY0, SILL + 1], [x, PY0, SILL - .3]] as V3[]);
const StairsTruck: React.FC<{cam: Cam; rider?: React.ReactNode}> = ({cam, rider}) => {
	const o: React.ReactNode[] = [], nearX = cam.C[0] > XS ? 1 : -1, far = (s: number) => s !== nearX;
	const wheels = (s: number) => [2.95, 6.15].map((y) => <Wheel key={`wh${s}${y}`} cam={cam} c={[XS + s * .86, y, .42]} ax={[1, 0, 0]} r={.42} w={.26} />);
	o.push(<g key="fw">{wheels(-nearX)}</g>);
	o.push(<Box key="ch" cam={cam} a={[XS - .95, 2.3, .42]} b={[XS + .95, 6.95, DECK]} pal={P_DARK} />);
	for (const sx of [-1, 1]) o.push(<Rod key={`sh${sx}`} cam={cam} P={[[XS + sx * .56, 6.97, .44], [XS + sx * .56, 7.12, .3]]} c="#55586A" w={4} />);
	o.push(<Box key="st" cam={cam} a={[XS - .62, 6.95, .27]} b={[XS + .62, 7.22, .34]} pal={P_DARK} sw={1.8} />);
	o.push(<Box key="cab" cam={cam} a={[XS - .95, 2.25, DECK]} b={[XS + .95, 3.85, 2.35]} pal={P_BODY} />);
	const cx = XS + nearX * .952;
	o.push(<Poly key="cw" cam={cam} P={[[cx, 2.4, 1.5], [cx, 3.25, 1.5], [cx, 3.25, 2.15], [cx, 2.4, 2.15]]} fill="#2C3552" sw={2} />);
	o.push(<Poly key="cw2" cam={cam} P={[[cx + nearX * .002, 2.45, 1.95], [cx + nearX * .002, 3.0, 2.12], [cx + nearX * .002, 3.0, 2.06], [cx + nearX * .002, 2.45, 1.89]]} fill="#55648C" stroke="none" />);
	o.push(<Poly key="cs" cam={cam} P={[[cx, 2.25, 1.05], [cx, 3.85, 1.05], [cx, 3.85, 1.22], [cx, 2.25, 1.22]]} fill="#4A6A8E" stroke="none" />);
	o.push(<Line key="cd" cam={cam} P={[[cx, 3.4, .62], [cx, 3.4, 2.2]]} stroke="#8F92A6" sw={1.6} />);
	o.push(<Box key="bc" cam={cam} a={[XS + .4, 2.9, 2.35]} b={[XS + .58, 3.08, 2.5]} pal={['#FFB44A', '#E08A2C', '#C0741F']} sw={1.6} />);
	// under the stairs: the body panel and the platform posts
	for (const s of [-1, 1]) if (far(s)) o.push(<Stringer key={`sf${s}`} cam={cam} x={s > 0 ? SX1 + .04 : SX0 - .04} />);
	for (const s of [-1, 1]) if (far(s)) o.push(<Rails key={`rf${s}`} cam={cam} x={s > 0 ? SX1 + .06 : SX0 - .06} />);
	for (const y of [2.4, 3.1]) for (const x of [SX0 + .08, SX1 - .08]) o.push(<Rod key={`po${x}${y}`} cam={cam} P={[[x, y, 2.35], [x, y, SILL - .26]]} c="#8F92A6" w={5} />);
	o.push(<Box key="pl" cam={cam} a={[SX0, PY0, SILL - .26]} b={[SX1, PY1, SILL]} pal={['#DCCBB0', '#8A8FA4', '#777C91']} />);
	o.push(<Box key="bu" cam={cam} a={[SX0 + .05, PY0 - .07, SILL - .22]} b={[SX1 - .05, PY0, SILL - .04]} pal={['#3A3A44', '#2A2A32', '#222228']} sw={1.6} />);
	for (let k = 12; k >= 1; k--) { const y0 = TY0(k), y1 = y0 + G, z = TZ(k);
		o.push(<Poly key={`r${k}`} cam={cam} P={[[SX0, y1, z - RH], [SX1, y1, z - RH], [SX1, y1, z], [SX0, y1, z]]} fill="#7C8196" sw={1.6} />);
		o.push(<Poly key={`t${k}`} cam={cam} P={[[SX0, y0, z], [SX1, y0, z], [SX1, y1, z], [SX0, y1, z]]} fill="#D6C5AB" sw={1.6} />);
		o.push(<Poly key={`n${k}`} cam={cam} P={[[SX0, y1 - .055, z + .002], [SX1, y1 - .055, z + .002], [SX1, y1, z + .002], [SX0, y1, z + .002]]} fill="#F0C048" stroke="none" />); }
	o.push(<Poly key="pn" cam={cam} P={[[SX0, PY1 - .06, SILL + .002], [SX1, PY1 - .06, SILL + .002], [SX1, PY1, SILL + .002], [SX0, PY1, SILL + .002]]} fill="#F0C048" stroke="none" />);
	o.push(<g key="rider">{rider}</g>);
	const nx = nearX > 0 ? SX1 + .04 : SX0 - .04, panel: V3[] = [[nx, 3.85, DECK], [nx, YBOT, DECK], ...Array.from({length: 9}, (_, i) => { const y = lerp(YBOT, 3.85, i / 8); return [nx, y, Math.max(DECK, noseZ(y) - .3)] as V3; })];
	o.push(<Poly key="bp" cam={cam} P={panel} fill={tone([nearX, 0, 0], P_BODY)} sw={2.2} />);
	o.push(<Stringer key="sn" cam={cam} x={nx} />);
	o.push(<g key="nw">{wheels(nearX)}</g>);
	o.push(<Rails key="rn" cam={cam} x={nearX > 0 ? SX1 + .06 : SX0 - .06} />);
	return <g>{o}</g>; };

/* ---------- ground life ---------- */
const Cone: React.FC<{cam: Cam; P: V3}> = ({cam, P}) => { const [x, y] = cam.p(P), k = cam.k(P), w = .36 * k, h = .7 * k;
	return <g><rect x={x - w / 2} y={y - .05 * k} width={w} height={.06 * k} fill="#3A3540" stroke={INK} strokeWidth={1.4} />
		<path d={`M${f2(x - w * .36)},${f2(y - .05 * k)} L${f2(x - w * .07)},${f2(y - h)} L${f2(x + w * .07)},${f2(y - h)} L${f2(x + w * .36)},${f2(y - .05 * k)} Z`} fill="#EE8434" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
		<path d={`M${f2(x - w * .26)},${f2(y - h * .36)} L${f2(x - w * .19)},${f2(y - h * .56)} L${f2(x + w * .19)},${f2(y - h * .56)} L${f2(x + w * .26)},${f2(y - h * .36)} Z`} fill="#F4F1EA" /></g>; };
/* a ground crew member (faceless, hi-vis vest, ear defenders), a billboard placed in the scene and scaled by its depth */
const Crew: React.FC<{cam: Cam; P: V3; pose?: 'stand' | 'up' | 'lift' | 'wand'; a?: number; vest?: string; flip?: number}> = ({cam, P, pose = 'stand', a = 0, vest = '#F2902E', flip = 1}) => {
	const [bx, by] = cam.p(P), k = cam.k(P), X = (x: number) => bx + flip * x * k, Y = (z: number) => by - z * k, sw = Math.max(1.3, Math.min(2.4, k * .02));
	const pl = (q: [number, number][]) => q.map(([x, z]) => `${f2(X(x))},${f2(Y(z))}`).join(' ');
	const armR: [number, number][] = pose === 'up' ? [[.2, 1.4], [lerp(.27, .34, a), lerp(1.12, 1.55, a)], [lerp(.27, .3, a), lerp(.86, 1.82, a)]] : pose === 'lift' ? [[.2, 1.4], [.34, 1.18], [.42, 1.08]] : pose === 'wand' ? [[.2, 1.4], [.3, 1.12], [.42, .98]] : [[.2, 1.4], [.27, 1.12], [.27, .86]];
	const armL: [number, number][] = pose === 'lift' ? [[-.2, 1.4], [-.06, 1.18], [.06, 1.08]] : [[-.2, 1.4], [-.27, 1.12], [-.26, .86]];
	const arm = (q: [number, number][], key: string) => <g key={key}><polyline points={pl(q)} fill="none" stroke={INK} strokeWidth={.11 * k + 2 * sw} strokeLinecap="round" strokeLinejoin="round" />
		<polyline points={pl(q)} fill="none" stroke="#3B4257" strokeWidth={.11 * k} strokeLinecap="round" strokeLinejoin="round" /></g>;
	return <g>
		<ellipse cx={bx} cy={by} rx={.32 * k} ry={.07 * k} fill="#1E1A28" opacity={.3} />
		{arm(armL, 'al')}
		<polygon points={pl([[-.17, .92], [-.02, .92], [-.04, 0], [-.16, 0]])} fill="#2F3447" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
		<polygon points={pl([[.02, .92], [.17, .92], [.16, 0], [.04, 0]])} fill="#2F3447" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
		<polygon points={pl([[-.2, .02], [-.02, .02], [-.02, -.02], [-.22, -.02]])} fill="#1F1F26" stroke={INK} strokeWidth={sw * .7} />
		<polygon points={pl([[.02, .02], [.2, .02], [.22, -.02], [.02, -.02]])} fill="#1F1F26" stroke={INK} strokeWidth={sw * .7} />
		<polygon points={pl([[-.22, 1.46], [.22, 1.46], [.2, .88], [-.2, .88]])} fill={vest} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
		<polygon points={pl([[-.21, 1.13], [.21, 1.13], [.21, 1.07], [-.21, 1.07]])} fill="#EDEDF2" />
		<polygon points={pl([[-.205, .99], [.205, .99], [.205, .94], [-.205, .94]])} fill="#EDEDF2" />
		{pose === 'lift' && <rect x={Math.min(X(-.02), X(.5))} y={Y(1.3)} width={.52 * k} height={.3 * k} rx={.05 * k} fill="#4E78A8" stroke={INK} strokeWidth={sw} />}
		{arm(armR, 'ar')}
		{pose === 'wand' && <polyline points={pl([[.42, .98], [.5, .62]])} stroke="#F7A13A" strokeWidth={.07 * k} strokeLinecap="round" />}
		<ellipse cx={X(0)} cy={Y(1.6)} rx={.115 * k} ry={.125 * k} fill="#C9977A" stroke={INK} strokeWidth={sw} />
		<path d={`M${f2(X(-.125))},${f2(Y(1.6))} Q${f2(X(0))},${f2(Y(1.86))} ${f2(X(.125))},${f2(Y(1.6))}`} fill="none" stroke="#2A2A33" strokeWidth={.035 * k} />
		<ellipse cx={X(-.12)} cy={Y(1.58)} rx={.04 * k} ry={.06 * k} fill="#E0463A" stroke={INK} strokeWidth={sw * .7} />
		<ellipse cx={X(.12)} cy={Y(1.58)} rx={.04 * k} ry={.06 * k} fill="#E0463A" stroke={INK} strokeWidth={sw * .7} />
	</g>; };
/* a baggage train (tug + two carts with canopies) driving forward under the wing; rigid, gliding */
const Cart: React.FC<{cam: Cam; x: number; y: number; bags: string[]}> = ({cam, x, y, bags}) => { const o: React.ReactNode[] = [];
	o.push(<Box key="b" cam={cam} a={[x - 2.3, y - .68, .3]} b={[x, y + .68, .46]} pal={P_DARK} sw={1.8} />);
	bags.forEach((c, i) => o.push(<Box key={`g${i}`} cam={cam} a={[x - 2.15 + i * .72, y - .5, .46]} b={[x - 1.6 + i * .72, y + .45, .46 + [.62, .5, .7][i % 3]]} pal={[c, c, c]} sw={1.6} />));
	for (const [px, py] of [[x - 2.25, y - .64], [x - .05, y - .64], [x - 2.25, y + .64], [x - .05, y + .64]]) o.push(<Rod key={`p${px}${py}`} cam={cam} P={[[px, py, .46], [px, py, 1.72]]} c="#9EA1B2" w={2.6} />);
	o.push(<Box key="r" cam={cam} a={[x - 2.35, y - .72, 1.72]} b={[x + .05, y + .72, 1.8]} pal={['#3E6E7E', '#2F5866', '#264A56']} sw={1.6} />);
	o.push(<Rod key="tb" cam={cam} P={[[x, y, .36], [x + .55, y, .36]]} c="#55586A" w={3} />);
	[x - 1.9, x - .4].forEach((wx, i) => o.push(<Wheel key={`w${i}`} cam={cam} c={[wx, y + .62, .2]} ax={[0, 1, 0]} r={.2} w={.14} />));
	return <g>{o}</g>; };
const trainX = (t: number) => -20.5 + 2.6 * t;
const BagTrain: React.FC<{cam: Cam; t: number}> = ({cam, t}) => { const x = trainX(t), y = 9.0, d = cam.p([x - 1.25, y, 1.25]), k = cam.k([x - 1.25, y, 1.25]);
	return <g><Cart cam={cam} x={x - 5.9} y={y} bags={['#7A5B9A', '#C2493F', '#4E78A8']} /><Cart cam={cam} x={x - 2.9} y={y} bags={['#E0A33A', '#5D8A5E', '#C2493F']} />
		<Box cam={cam} a={[x - 2.3, y - .62, .26]} b={[x, y + .62, .92]} pal={P_TUG} />
		<g><rect x={d[0] - .2 * k} y={d[1] - .05 * k} width={.4 * k} height={.42 * k} rx={.06 * k} fill="#F2902E" stroke={INK} strokeWidth={1.4} />
			<circle cx={d[0]} cy={d[1] - .2 * k} r={.13 * k} fill="#C9977A" stroke={INK} strokeWidth={1.4} /></g>
		{[[x - 2.25, y - .6], [x - .65, y - .6], [x - 2.25, y + .6], [x - .65, y + .6]].map(([px, py], i) => <Rod key={i} cam={cam} P={[[px, py, .92], [px, py, 1.85]]} c="#9EA1B2" w={2.6} />)}
		<Box cam={cam} a={[x - 2.35, y - .68, 1.85]} b={[x - .55, y + .68, 1.93]} pal={P_TUG} sw={1.6} />
		{[x - 1.8, x - .45].map((wx, i) => <Wheel key={`tw${i}`} cam={cam} c={[wx, y + .6, .28]} ax={[0, 1, 0]} r={.28} w={.2} />)}</g>; };
/* the flight attendant inside the door (faceless): bows on the arrival beat, then shows the way aft */
const Attendant: React.FC<{cam: Cam; P: V3; bow: number; show: number}> = ({cam, P, bow, show}) => {
	const [bx, by] = cam.p(P), k = cam.k(P), sw = 2, rot = -bow * 13;
	const X = (x: number) => bx + x * k, Y = (z: number) => by - z * k, pl = (q: [number, number][]) => q.map(([x, z]) => `${f2(X(x))},${f2(Y(z))}`).join(' ');
	const arm: [number, number][] = [[.18, 1.36], [lerp(.24, .4, show), lerp(1.08, 1.2, show)], [lerp(.08, .62, show), lerp(.98, 1.22, show)]];
	return <g>
		<ellipse cx={bx} cy={by} rx={.3 * k} ry={.06 * k} fill="#5A3E30" opacity={.25} />
		<polygon points={pl([[-.09, .5], [-.02, .5], [-.03, 0], [-.08, 0]])} fill="#D8A888" stroke={INK} strokeWidth={sw} />
		<polygon points={pl([[.02, .5], [.09, .5], [.08, 0], [.03, 0]])} fill="#D8A888" stroke={INK} strokeWidth={sw} />
		<polygon points={pl([[-.22, .5], [.22, .5], [.16, .95], [-.16, .95]])} fill="#2F3B63" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
		<g transform={`rotate(${rot} ${f2(X(0))} ${f2(Y(.95))})`}>
			<polygon points={pl([[-.19, 1.42], [.19, 1.42], [.16, .93], [-.16, .93]])} fill="#34416E" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
			<polygon points={pl([[-.09, 1.42], [.09, 1.42], [.02, 1.28], [-.02, 1.28]])} fill={GOLD} stroke={INK} strokeWidth={1.4} />
			<polyline points={pl([[-.18, 1.36], [-.22, 1.1], [-.04, .98]])} fill="none" stroke={INK} strokeWidth={.09 * k + 4} strokeLinecap="round" strokeLinejoin="round" />
			<polyline points={pl([[-.18, 1.36], [-.22, 1.1], [-.04, .98]])} fill="none" stroke="#34416E" strokeWidth={.09 * k} strokeLinecap="round" strokeLinejoin="round" />
			<polyline points={pl(arm)} fill="none" stroke={INK} strokeWidth={.09 * k + 4} strokeLinecap="round" strokeLinejoin="round" />
			<polyline points={pl(arm)} fill="none" stroke="#34416E" strokeWidth={.09 * k} strokeLinecap="round" strokeLinejoin="round" />
			<circle cx={X(arm[2][0])} cy={Y(arm[2][1])} r={.045 * k} fill="#E2B290" stroke={INK} strokeWidth={1.4} />
			<ellipse cx={X(0)} cy={Y(1.57)} rx={.11 * k} ry={.125 * k} fill="#E2B290" stroke={INK} strokeWidth={sw} />
			<path d={`M${f2(X(-.115))},${f2(Y(1.56))} Q${f2(X(-.1))},${f2(Y(1.72))} ${f2(X(0))},${f2(Y(1.71))} Q${f2(X(.1))},${f2(Y(1.72))} ${f2(X(.115))},${f2(Y(1.56))} Q${f2(X(.05))},${f2(Y(1.64))} ${f2(X(-.115))},${f2(Y(1.56))} Z`} fill="#3A2A26" stroke={INK} strokeWidth={1.6} />
			<circle cx={X(-.1)} cy={Y(1.66)} r={.05 * k} fill="#3A2A26" stroke={INK} strokeWidth={1.4} />
		</g></g>; };

/* ---------- the 「你」 figure: tools/you_figure.py figure() ported; joints come from a 3D skeleton projected by the camera ---------- */
const bez = (a: V2, c: V2, b: V2, n = 24): V2[] => Array.from({length: n + 1}, (_, i) => { const t = i / n; return [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]] as V2; });
const limbD = (a: V2, e: V2, b: V2, w0: number, w1: number) => { const c: V2 = [2 * e[0] - (a[0] + b[0]) / 2, 2 * e[1] - (a[1] + b[1]) / 2], p = bez(a, c, b), L: V2[] = [], R: V2[] = [];
	p.forEach(([x, y], i) => { const j = Math.min(i + 1, p.length - 1), k = Math.max(i - 1, 0), dx = p[j][0] - p[k][0], dy = p[j][1] - p[k][1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, w = (w0 + (w1 - w0) * i / (p.length - 1)) / 2;
		L.push([x + nx * w, y + ny * w]); R.push([x - nx * w, y - ny * w]); });
	return 'M' + [...L, ...R.reverse()].map(([x, y]) => `${f2(x)},${f2(y)}`).join(' L') + 'Z'; };
type Arm = {sw: number; ab: number; el: number; ab2: number} | {raise: number; wv: number};
type YouState = {H: V3; psi: number; lean: number; feet: [V3, V3]; arms: [Arm, Arm]; tilt: number};   // feet/arms: [left, right]
const UM = .588, FM = UM / 120;                                                     // shoulder width (m) = you_figure's unit u; metres per pose unit
const YouFig: React.FC<{cam: Cam; s: YouState; fill?: string}> = ({cam, s, fill = 'url(#mf)'}) => {
	const f: V3 = [Math.cos(s.psi), Math.sin(s.psi), 0], r: V3 = [Math.sin(s.psi), -Math.cos(s.psi), 0];
	const up: V3 = add(sc3([0, 0, 1], Math.cos(s.lean)), sc3(f, Math.sin(s.lean)));
	const H = s.H, nk3 = add(H, sc3(up, 142 * FM)), hd3 = add(H, sc3(up, 178 * FM)), tl = 142 * FM;
	const P = (q: V3) => cam.p(q), k = cam.k(add(H, sc3(up, .35))), u = UM * k;
	const nk = P(nk3), hc = P(H), hd = P(hd3), o: React.ReactNode[] = [];
	const armJ = (side: number, a: Arm): [V2, V2, V2] => { const S = add(add(nk3, sc3(r, side * .3 * UM)), sc3(up, -.14 * tl));
		let d1: V3, d2: V3;
		if ('raise' in a) { const e = rad(lerp(-70, 38, a.raise)); d1 = norm(add(add(sc3(up, Math.sin(e)), sc3(r, side * Math.cos(e))), sc3(f, .25)));
			const w = rad(a.wv), e2 = rad(lerp(-80, 90, sm(a.raise * 1.4)));   /* the forearm comes up ahead of the upper arm */ d2 = norm(add(add(sc3(up, Math.sin(e2) * Math.cos(w)), sc3(r, side * (Math.cos(e2) + Math.sin(w) * .9))), sc3(f, .2))); }
		else { const sw = rad(a.sw), ab = rad(a.ab), el = rad(a.el), ab2 = rad(a.ab2);
			d1 = norm(add(add(sc3(up, -Math.cos(ab) * Math.cos(sw)), sc3(f, Math.cos(ab) * Math.sin(sw))), sc3(r, side * Math.sin(ab))));
			d2 = norm(add(add(sc3(up, -Math.cos(ab2) * Math.cos(sw + el)), sc3(f, Math.cos(ab2) * Math.sin(sw + el))), sc3(r, side * Math.sin(ab2)))); }
		const E = add(S, sc3(d1, 64 * FM)), Wr = add(E, sc3(d2, 60 * FM)); return [P(S), P(E), P(Wr)]; };
	const legJ = (side: number, A: V3): [V2, V2, V2, V3] => { const Rt = add(H, sc3(r, side * .17 * UM)), L = 60.5 * FM, v = sub(A, Rt), d = Math.min(len(v), 2 * L - 1e-4);
		const m = add(Rt, sc3(norm(v), d / 2)), fw = norm(sub(f, sc3(norm(v), dot(f, norm(v))))), h = Math.sqrt(Math.max(0, L * L - d * d / 4)), Kn = add(m, sc3(fw, h));
		return [P(Rt), P(Kn), P(A), A]; };
	// draw order as you_figure.figure(): arms, legs, body, head (all limbs behind the body)
	const sides: [number, number][] = [[-1, 0], [1, 1]];
	const dims = {aw0: u * .15, aw1: u * .095, hand: u * .072, lw0: u * .19, lw1: u * .12};
	const packC = add(add(H, sc3(up, .42)), sc3(f, -.17)), packFront = cam.d(packC) > cam.d(add(H, sc3(up, .42)));
	const pk = P(packC), pw = .34 * k * (.55 + .45 * Math.abs(dot(r, cam.R))), ph = .4 * k;
	const pack = <g key="pack"><rect x={pk[0] - pw / 2} y={pk[1] - ph / 2} width={pw} height={ph} rx={.08 * k} fill="#E2725B" stroke={INK} strokeWidth={2} />
		<path d={`M${f2(pk[0] - pw / 2)},${f2(pk[1] - ph * .12)} Q${f2(pk[0])},${f2(pk[1] + ph * .06)} ${f2(pk[0] + pw / 2)},${f2(pk[1] - ph * .12)}`} fill="none" stroke="#B4513E" strokeWidth={2} />
		<rect x={pk[0] - pw * .28} y={pk[1] + ph * .12} width={pw * .56} height={ph * .26} rx={.03 * k} fill="#EC8A72" stroke="#B4513E" strokeWidth={1.6} /></g>;
	if (packFront) o.push(pack);
	for (const [side, i] of sides) { const [S, E, Wr] = armJ(side, s.arms[i]); o.push(<path key={`a${i}`} d={limbD(S, E, Wr, dims.aw0, dims.aw1)} fill={fill} />, <circle key={`ar${i}`} cx={S[0]} cy={S[1]} r={dims.aw0 / 2} fill={fill} />, <circle key={`h${i}`} cx={Wr[0]} cy={Wr[1]} r={dims.hand} fill={fill} />); }
	for (const [side, i] of sides) { const [Rt, Kn, A, A3] = legJ(side, s.feet[i]), fc = P(add(A3, sc3(f, .035)));
		o.push(<path key={`l${i}`} d={limbD(Rt, Kn, A, dims.lw0, dims.lw1)} fill={fill} />, <circle key={`lr${i}`} cx={Rt[0]} cy={Rt[1]} r={dims.lw0 / 2} fill={fill} />,
			<ellipse key={`f${i}`} cx={fc[0]} cy={fc[1] + u * .03} rx={u * .11} ry={u * .065} fill={fill} />); }
	const wc = u * .34, ww = u * .3, wh = u * .36, tl2 = Math.hypot(nk[0] - hc[0], nk[1] - hc[1]);
	const body = `M${f2(nk[0] - wc)},${f2(nk[1] + tl2 * .08)} C${f2(nk[0] - wc * 1.05)},${f2(nk[1] - tl2 * .06)} ${f2(nk[0] + wc * 1.05)},${f2(nk[1] - tl2 * .06)} ${f2(nk[0] + wc)},${f2(nk[1] + tl2 * .08)} `
		+ `C${f2(nk[0] + ww * 1.05)},${f2(nk[1] + tl2 * .5)} ${f2(hc[0] + wh * 1.15)},${f2(hc[1] + tl2 * .02)} ${f2(hc[0] + wh * .6)},${f2(hc[1] + tl2 * .13)} `
		+ `Q${f2(hc[0])},${f2(hc[1] + tl2 * .2)} ${f2(hc[0] - wh * .6)},${f2(hc[1] + tl2 * .13)} C${f2(hc[0] - wh * 1.15)},${f2(hc[1] + tl2 * .02)} ${f2(nk[0] - ww * 1.05)},${f2(nk[1] + tl2 * .5)} ${f2(nk[0] - wc)},${f2(nk[1] + tl2 * .08)} Z`;
	o.push(<path key="body" d={body} fill={fill} />);
	if (!packFront) o.push(pack);
	// head (+ the face, placed on the head's front in 3D so it turns with the head; hidden from behind). feat(a, b): you_figure.py's
	// face offsets in units of hr, a = across (screen-left when facing us), b = DOWN from the head centre (eyes .05, mouth .3–.45)
	const hr = u * .28, hrm = UM * .28, feat = (a: number, b: number) => { const q = add(add(add(hd3, sc3(r, -a * hrm)), sc3(up, -b * hrm)), sc3(f, Math.sqrt(Math.max(0, 1 - a * a - b * b)) * hrm));
		const n = norm(sub(q, hd3)); return {p: P(q), v: cl(dot(n, norm(sub(cam.C, q))) * 3.5)}; };
	const eL = feat(-.34, .05), eR = feat(.34, .05), m0 = feat(-.16, .3), m1 = feat(0, .45), m2 = feat(.16, .3), bL = feat(-.56, .3), bR = feat(.56, .3);
	const facing = dot(f, norm(sub(cam.C, hd3))), fv = Math.min(eL.v, eR.v, cl((facing - .2) / .3));   // no face unless the head is turned to us
	o.push(<g key="head" transform={`rotate(${s.tilt} ${f2(hd[0])} ${f2(hd[1])})`}><ellipse cx={hd[0]} cy={hd[1]} rx={hr} ry={hr * 1.08} fill={fill} />
		{fv > 0 && <g opacity={fv} clipPath="url(#yhead)">
		<ellipse cx={eL.p[0]} cy={eL.p[1]} rx={hr * .075} ry={hr * .1} fill="#2B2724" /><ellipse cx={eR.p[0]} cy={eR.p[1]} rx={hr * .075} ry={hr * .1} fill="#2B2724" />
		<path d={`M${f2(m0.p[0])},${f2(m0.p[1])} Q${f2(m1.p[0])},${f2(m1.p[1])} ${f2(m2.p[0])},${f2(m2.p[1])}`} fill="none" stroke="#2B2724" strokeWidth={hr * .055} strokeLinecap="round" />
		<circle cx={bL.p[0]} cy={bL.p[1]} r={hr * .14} fill="#F4A9A0" opacity={.45 * bL.v} /><circle cx={bR.p[0]} cy={bR.p[1]} r={hr * .14} fill="#F4A9A0" opacity={.45 * bR.v} /></g>}</g>);
	return <g><defs><clipPath id="yhead"><ellipse cx={hd[0]} cy={hd[1]} rx={hr * .97} ry={hr * 1.05} /></clipPath></defs>
		<g filter="url(#yds)">{o}</g></g>; };
/* the gold 「你」 bubble (demo_v3.bubble_p): 128×96, rx 30, ink 5, tail pointing down at the head; tip at (x, y) */
const Bubble: React.FC<{x: number; y: number; sc: number; op: number}> = ({x, y, sc, op}) => op <= 0 ? null :
	<g transform={`translate(${f2(x)},${f2(y)}) scale(${sc.toFixed(3)})`} opacity={op}><g filter="url(#bds)">
		<path d="M-16,-28 L0,0 L18,-28 Z" fill={GOLD} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
		<rect x={-64} y={-120} width={128} height={96} rx={30} fill={GOLD} stroke={INK} strokeWidth={5} />
		<rect x={-20} y={-32} width={40} height={10} fill={GOLD} /></g>
		<text x={0} y={-50} textAnchor="middle" fontFamily="Noto Sans CJK SC" fontWeight={900} fontSize={66} fill={INK}>你</text></g>;
/* ---------- timing (in beats; b = 0 is frame 0, b = 8 the cut) ---------- */
const AH = .05;                                                                     // ankle height above the tread
type Plant = {b: number; P: V3; dur: number};
const footAt = (pl: Plant[], b: number): {P: V3; sup: V3} => {
	let i = 0; while (i + 1 < pl.length && pl[i + 1].b <= b) i++;
	const cur = pl[i], nx = pl[i + 1];
	if (!nx || b <= nx.b - nx.dur) return {P: cur.P, sup: cur.P};
	const u = cl((b - (nx.b - nx.dur)) / nx.dur), e = sm(u), dz = nx.P[2] - cur.P[2];
	return {P: [lerp(cur.P[0], nx.P[0], e), lerp(cur.P[1], nx.P[1], e), cur.P[2] + dz * sm(u * 1.6) + (.06 + .1 * cl(dz / .4)) * Math.sin(Math.PI * u)], sup: lerp3(cur.P, nx.P, e)}; };
const tr = (k: number, x: number): V3 => { const p = TC(k, x); return [p[0], p[1], p[2] + AH]; };
const fl = (x: number, y: number): V3 => [x, y, SILL + AH];
const FL = XS + .11, FR = XS - .11;
const camAt = (t: number) => { const x = cl(t / (NF / FPS)), u = 1 - Math.pow(1 - x, 1.6);   // a crane up and push in that starts on the cut and settles on the door
	const C0: V3 = [XD + 7.5, 14.5, 4.3], C1: V3 = [XD + 5.2, 11.6, 4.9], L0: V3 = [XD - 1.2, 3.5, 3.2], L1: V3 = [XD - .6, 2.6, 4.1];
	return new Cam(lerp3(C0, C1, u), lerp3(L0, L1, u), lerp(1150, 1550, u), [960, lerp(600, 650, u)]); };
const WAVE_C = camAt(5 * BEAT).C, HW: V2 = [XS + .02, 2.8], PSI_W = Math.atan2(WAVE_C[1] - HW[1], WAVE_C[0] - HW[0]) - rad(12);
const rv = (psi: number): V2 => [Math.sin(psi), -Math.cos(psi)];
const WL: V3 = fl(HW[0] - rv(PSI_W)[0] * .12, HW[1] - rv(PSI_W)[1] * .12), WR: V3 = fl(HW[0] + rv(PSI_W)[0] * .12, HW[1] + rv(PSI_W)[1] * .12);
const PL_L: Plant[] = [{b: -2, P: tr(7, FL), dur: .62}, {b: 0, P: tr(9, FL), dur: .62}, {b: 2, P: tr(11, FL), dur: .62}, {b: 4, P: fl(FL, 3.0), dur: .62}, {b: 4.75, P: WL, dur: .3},
	{b: 6.45, P: fl(XD + .01, 2.08), dur: .38}, {b: 7.25, P: fl(XD - .3, 1.0), dur: .4}, {b: 8.05, P: fl(XD - 1.2, .8), dur: .4}];
const PL_R: Plant[] = [{b: -1, P: tr(8, FR), dur: .62}, {b: 1, P: tr(10, FR), dur: .62}, {b: 3, P: tr(12, FR), dur: .62}, {b: 4.42, P: WR, dur: .38},
	{b: 6.05, P: fl(XD - .21, 2.55), dur: .36}, {b: 6.85, P: fl(XD - .21, 1.45), dur: .4}, {b: 7.65, P: fl(XD - .75, .85), dur: .4}];
const youAt = (b: number): YouState => {
	const L = footAt(PL_L, b), R = footAt(PL_R, b);
	const psi = b < 4 ? rad(-90) : b < 5.75 ? lerp(rad(-90), PSI_W, eio((b - 4) / .7)) : b < 6.9 ? lerp(PSI_W, rad(-90), eio((b - 5.75) / .5)) : lerp(rad(-90), rad(-168), eio((b - 6.9) / .8));
	const f: V3 = [Math.cos(psi), Math.sin(psi), 0];
	const hip = lerp(.45, .575, sm((b - 3.4) / 1.1)), m = lerp3(L.sup, R.sup, .5);
	const H: V3 = add([m[0], m[1], m[2] - AH + hip], sc3(f, .03));
	const lean = rad(b < 4.5 ? lerp(10, 0, sm((b - 3.6) / .8)) : lerp(0, 5, sm((b - 6) / .4)));
	const A = 17 * (1 - sm((b - 3.7) / .5)), sw = A * Math.cos(Math.PI * b), w2 = 7 * sm((b - 6.1) / .3) * Math.cos(Math.PI * (b - 6.05) / .8 * 2);
	const right: Arm = {sw: sw + w2, ab: 18, el: 24, ab2: 8};
	const raise = sm((b - 4.45) / .5) - sm((b - 5.85) / .4), left: Arm = b < 4.2 ? {sw: -sw, ab: 18, el: 24, ab2: 8} : b > 6.25 ? {sw: -w2, ab: 18, el: 24, ab2: 8} : {raise, wv: 26 * Math.cos(2 * Math.PI * (b - 5))};
	return {H, psi, lean, feet: [L.P, R.P], arms: [left, right], tilt: lerp(4, 11, raise)}; };

/* ---------- the far world: dawn sky, clouds, the city in haze, the terminal and tower, a departure climbing out ---------- */
const O: V3 = [XD, 0, 0];
const dirP = (az: number, el: number, D: number): V3 => [O[0] + D * Math.cos(rad(el)) * Math.cos(rad(az)), O[1] + D * Math.cos(rad(el)) * Math.sin(rad(az)), D * Math.sin(rad(el))];
const CITY = (() => { const R = mul(31), o: {az: number; w: number; h: number; c: number}[] = []; let az = 168;
	while (az < 262) { const w = .5 + R() * 1.4, h = 40 + Math.pow(R(), 2) * 230; o.push({az, w, h, c: Math.floor(R() * 3)}); az += w * (.75 + R() * .5); } return o; })();
const CLOUDS: [number, number, number][] = [[250, 13, 1.25], [232, 9.5, .9], [214, 15, 1.1], [196, 8, .8], [266, 7, .75], [222, 4.2, 1.5], [181, 12, 1.0]];
const Sky: React.FC<{cam: Cam; t: number}> = ({cam, t}) => {
	const hz = cam.p(add(cam.C, [cam.F[0] * 1e5, cam.F[1] * 1e5, 0]))[1], sun = cam.p(add(cam.C, sc3([Math.cos(SUN_EL) * Math.cos(SUN_AZ), Math.cos(SUN_EL) * Math.sin(SUN_AZ), Math.sin(SUN_EL)], 1e5)));
	const ks = cam.f / 1200;
	return <g>
		<defs><linearGradient id="sky" x1="0" y1={hz - 1000} x2="0" y2={hz + 4} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#36406E" /><stop offset=".42" stopColor="#7C6F9A" /><stop offset=".72" stopColor="#D69A93" /><stop offset=".9" stopColor="#F2BC8E" /><stop offset="1" stopColor="#F9D49A" /></linearGradient>
			<radialGradient id="glow" cx={sun[0]} cy={sun[1]} r={820} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#FFF0C6" stopOpacity=".95" /><stop offset=".14" stopColor="#FFD08A" stopOpacity=".7" /><stop offset=".45" stopColor="#F2A06E" stopOpacity=".22" /><stop offset="1" stopColor="#F2A06E" stopOpacity="0" /></radialGradient></defs>
		<rect width={W} height={H} fill="url(#sky)" /><rect width={W} height={H} fill="url(#glow)" />
		{CLOUDS.map(([az, el, k], i) => { const [x, y] = cam.p(add(cam.C, sc3([Math.cos(rad(el)) * Math.cos(rad(az + .35 * t)), Math.cos(rad(el)) * Math.sin(rad(az + .35 * t)), Math.sin(rad(el))], 1e5))), s = k * ks, lit = 1 - cl((y - hz + 400) / 400);
			return <g key={i} transform={`translate(${f2(x)},${f2(y)}) scale(${s.toFixed(3)})`} opacity={.9}>
				<ellipse cx={0} cy={0} rx={150} ry={24} fill={lit > .5 ? '#E7B4A6' : '#EDB79A'} /><ellipse cx={-56} cy={-15} rx={78} ry={26} fill="#F4C9AE" /><ellipse cx={44} cy={-20} rx={66} ry={24} fill="#F7D3B4" />
				<ellipse cx={8} cy={11} rx={128} ry={10} fill="#C98A98" opacity={.55} /></g>; })}
		<circle cx={sun[0]} cy={sun[1]} r={44 * ks} fill="#FFF4D2" stroke="#F8CB80" strokeWidth={3} />
	</g>; };
const FarWorld: React.FC<{cam: Cam}> = ({cam}) => {
	const o: React.ReactNode[] = [];
	CITY.forEach((b, i) => { const D = 6500 + (i % 3) * 900, a = cam.p(dirP(b.az, 0, D)), c = cam.p(dirP(b.az - b.w * .9, 0, D)), top = cam.p([...dirP(b.az, 0, D).slice(0, 2), b.h] as V3);
		const x0 = Math.min(a[0], c[0]), x1 = Math.max(a[0], c[0]); o.push(<rect key={`c${i}`} x={x0} y={top[1]} width={x1 - x0} height={a[1] - top[1] + 2} fill={['#B596AE', '#A78CA6', '#C2A2B4'][b.c]} />); });
	o.push(<rect key="haze" x={0} y={cam.p(dirP(220, 0, 6500))[1] - 30} width={W} height={34} fill="#E6B4A4" opacity={.5} />);
	// a tree line and airport buildings at mid distance
	const R = mul(8); for (let az = 160; az < 290; az += 1.1) { const D = 1300, p = cam.p(dirP(az, 0, D)), k = cam.k(dirP(az, 0, D)), h = (9 + R() * 7) * k;
		o.push(<ellipse key={`tl${az}`} cx={p[0]} cy={p[1] - h * .45} rx={(14 + R() * 10) * k} ry={h * .6} fill="#8E7E92" />); }
	// the terminal: long glass hall with a curved roof, jet bridges, parked tails; the control tower
	const TA = 236, TB = 274, TD = 430, n = 24, roof: V3[] = [], eave: V3[] = [];
	for (let i = 0; i <= n; i++) { const az = lerp(TA, TB, i / n), p = dirP(az, 0, TD); roof.push([p[0], p[1], 27 + 7 * Math.sin(Math.PI * i / n)]); eave.push([p[0], p[1], 21]); }
	const facade: V3[] = [...eave, ...eave.slice().reverse().map(([x, y]) => [x, y, 0] as V3)];
	o.push(<Poly key="tf" cam={cam} P={facade} fill="#8C86A6" stroke="#5C5470" sw={1.4} />);
	for (let row = 0; row < 2; row++) o.push(<Poly key={`tw${row}`} cam={cam} P={[...eave.map(([x, y]) => [x, y, 6 + row * 7] as V3), ...eave.slice().reverse().map(([x, y]) => [x, y, 10 + row * 7] as V3)]} fill="#F2C88C" stroke="none" op={.75} />);
	for (let i = 0; i <= n; i += 2) o.push(<Line key={`tm${i}`} cam={cam} P={[[eave[i][0], eave[i][1], 0], [eave[i][0], eave[i][1], 21]]} stroke="#6E6688" sw={1.2} />);
	o.push(<Poly key="tr" cam={cam} P={[...roof, ...eave.slice().reverse()]} fill="#B7A2A8" stroke="#5C5470" sw={1.6} />);
	[240, 249, 258, 267].forEach((az, i) => { const a = dirP(az, 0, TD), b2 = dirP(az, 0, TD - 55), k = cam.k(b2), p = cam.p([b2[0], b2[1], 0]);
		o.push(<Line key={`jb${i}`} cam={cam} P={[[a[0], a[1], 6], [b2[0], b2[1], 5]]} stroke="#7D7696" sw={Math.max(2, 3.2 * k)} />);
		o.push(<path key={`ft${i}`} d={`M${f2(p[0] - 8 * k)},${f2(p[1] - 5 * k)} L${f2(p[0] - 2 * k)},${f2(p[1] - 15 * k)} L${f2(p[0] + 3 * k)},${f2(p[1] - 15 * k)} L${f2(p[0] + 1 * k)},${f2(p[1] - 5 * k)} Z`} fill={['#7FA0A4', '#A7A6B8', '#9AA5B8', '#8E9DB5'][i]} stroke="#5C5470" strokeWidth={1.2} />); });
	return <g>{o}</g>; };
/* the apron: concrete with slab joints, stand markings (lead-in line, stop bar, the red restraint line, the service road) */
const Ground: React.FC<{cam: Cam}> = ({cam}) => {
	const hz = cam.p(add(cam.C, [cam.F[0] * 1e5, cam.F[1] * 1e5, 0]))[1], o: React.ReactNode[] = [], z = .012;
	o.push(<defs key="d"><linearGradient id="gnd" x1="0" y1={hz} x2="0" y2={H} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#C9A397" /><stop offset=".08" stopColor="#B9A39C" /><stop offset="1" stopColor="#A2979A" /></linearGradient></defs>);
	o.push(<rect key="g" x={0} y={hz} width={W} height={H - hz} fill="url(#gnd)" />);
	o.push(<Poly key="grass" cam={cam} P={[[-3000, -3000, 0], [3000, -3000, 0], [3000, -140, 0], [-180, -140, 0], [-180, 3000, 0], [-3000, 3000, 0]]} fill="#8F8466" stroke="none" />);
	for (let x = -175; x <= 60; x += 7.5) { const d = Math.hypot(x - cam.C[0], 0); void d; o.push(<Line key={`jx${x}`} cam={cam} P={[[x, -135, z], [x, Math.min(60, cam.C[1] - 1), z]]} stroke="#8F8488" sw={1} op={.35} />); }
	for (let y = -135; y <= Math.min(60, cam.C[1] - 1); y += 7.5) o.push(<Line key={`jy${y}`} cam={cam} P={[[-175, y, z], [Math.min(60, cam.C[0] + 40), y, z]]} stroke="#8F8488" sw={1} op={.35} />);
	o.push(<Poly key="lead" cam={cam} P={[[-60, -.09, z], [40, -.09, z], [40, .09, z], [-60, .09, z]]} fill="#E8B83E" stroke="none" />);
	o.push(<Poly key="stop" cam={cam} P={[[-4.3, -1.3, z], [-4.0, -1.3, z], [-4.0, 1.3, z], [-4.3, 1.3, z]]} fill="#E8B83E" stroke="none" />);
	o.push(<Poly key="era" cam={cam} P={[[-60, 10.4, z], [30, 10.4, z], [30, 10.6, z], [-60, 10.6, z]]} fill="#C9463A" stroke="none" />);
	o.push(<Poly key="sr1" cam={cam} P={[[-60, 12.6, z], [30, 12.6, z], [30, 12.75, z], [-60, 12.75, z]]} fill="#ECE6E0" stroke="none" />);
	for (let x = -58; x < 28; x += 6) o.push(<Poly key={`sd${x}`} cam={cam} P={[[x, 16.2, z], [x + 3, 16.2, z], [x + 3, 16.35, z], [x, 16.35, z]]} fill="#ECE6E0" stroke="none" />);
	// a hatched no-parking box ahead of the nose
	o.push(<Poly key="hb" cam={cam} P={[[6, -3.2, z], [12, -3.2, z], [12, 3.2, z], [6, 3.2, z]]} fill="none" stroke="#E8B83E" sw={2} />);
	for (let i = 0; i < 6; i++) o.push(<Line key={`hh${i}`} cam={cam} P={[[6 + i, -3.2, z], [6 + i + 1, -2.2, z]].map(([x, y]) => [x, y, z] as V3)} stroke="#E8B83E" sw={1.6} />);
	return <g>{o}</g>; };

/* the boarding pass (right column): route draws, stop 1 of 7 lights, the scanner sweeps and ticks on the bar-2 downbeat, 「已登机」 lands */
const Pass: React.FC<{b: number}> = ({b}) => {
	const x = 1440, y = 168, w = 384, h = 420, op = cl(b / .5), dr = eo((b - .9) / .55), d1 = cl((b - 2) / .3), scan = (b - 3) / 1, ck = (b - 4) / .35, st = (b - 5.8) / .2;   // the stamp lands on b6
	return <g opacity={op} transform={`translate(${x + w / 2},${y + h / 2}) scale(${(.94 + .06 * eo(b / .5)).toFixed(3)}) translate(${-x - w / 2},${-y - h / 2})`}>
		<Widget x={x} y={y} w={w} h={h}>
			<T2 x={x + 26} y={y + 46} s="登机牌" size={30} col={GOLD} /><T2 x={x + 128} y={y + 44} s="BOARDING PASS" size={19} col="#CFC3AE" w={700} ls={1.5} />
			<T2 x={x + 26} y={y + 124} s="北京" size={50} /><T2 x={x + w - 26} y={y + 124} s="坎昆" size={50} anchor="end" />
			<T2 x={x + 28} y={y + 160} s="PEK" size={24} col="#CFC3AE" w={700} ls={2} /><T2 x={x + w - 26} y={y + 160} s="CUN" size={24} col="#CFC3AE" anchor="end" w={700} ls={2} />
			{dr > 0 && <line x1={x + 138} y1={y + 106} x2={x + 138 + 86 * dr} y2={y + 106} stroke={GOLD} strokeWidth={3} strokeDasharray="7 7" strokeLinecap="round" />}
			<g transform={`translate(${x + 138 + 86 * dr + 12},${y + 106}) scale(${(-.9 - .1 * dr).toFixed(3)},${(.9 + .1 * dr).toFixed(3)})`}><path d="M-11,0 L-4,-2.5 L1,-12 L5,-12 L2,-2.5 L10,-2.5 L13,-6 L15.5,-6 L14,0 L15.5,6 L13,6 L10,2.5 L2,2.5 L5,12 L1,12 L-4,2.5 Z" fill={GOLD} stroke={INK} strokeWidth={1.4} strokeLinejoin="round" /></g>
			<line x1={x + 18} y1={y + 192} x2={x + w - 18} y2={y + 192} stroke="rgba(242,198,110,.55)" strokeWidth={2} strokeDasharray="6 7" />
			<T2 x={x + 26} y={y + 232} s="座位" size={22} col="#CFC3AE" w={700} /><T2 x={x + 168} y={y + 232} s="行程" size={22} col="#CFC3AE" w={700} />
			<T2 x={x + 26} y={y + 292} s="7A" size={56} />
			<T2 x={x + 168} y={y + 282} s="第 1 站 / 共 7 站" size={28} />
			{Array.from({length: 7}, (_, i) => { const on = i === 0 && d1 > 0, s = on ? .6 + .4 * back(d1) : 1;
				return <circle key={i} cx={x + 178 + i * 27} cy={y + 312} r={8 * s} fill={on ? GOLD : 'none'} stroke={on ? INK : 'rgba(207,195,174,.7)'} strokeWidth={on ? 2 : 2.2} />; })}
			<line x1={x + 18} y1={y + 342} x2={x + w - 18} y2={y + 342} stroke="rgba(242,198,110,.55)" strokeWidth={2} strokeDasharray="6 7" />
			<T2 x={x + 26} y={y + 392} s="状态" size={22} col="#CFC3AE" w={700} />
			<g opacity={1 - cl(st * 3)}><T2 x={x + 96} y={y + 394} s="待登机" size={30} col="#CFC3AE" w={700} /></g>
			{scan > 0 && scan < 1 && <g opacity={Math.sin(Math.PI * scan)}><rect x={x + 8} y={y + 10 + (h - 20) * sm(scan) - 3} width={w - 16} height={6} rx={3} fill={GOLD} /><rect x={x + 8} y={y + 10 + (h - 20) * sm(scan) - 16} width={w - 16} height={32} fill={GOLD} opacity={.18} /></g>}
			{ck > 0 && <g transform={`translate(${x + w - 40},${y + 36}) scale(${(.4 + .6 * back(ck)).toFixed(3)})`} opacity={cl(ck * 3)}><circle r={20} fill={GOLD} stroke={INK} strokeWidth={2.5} /><path d="M-9,0 L-3,7 L10,-7" fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" /></g>}
			{st > 0 && <g transform={`translate(${x + 262},${y + 382}) rotate(-9) scale(${(1 + .7 * (1 - eo(st))).toFixed(3)})`} opacity={cl(st * 2.5)}>
				<rect x={-92} y={-34} width={184} height={68} rx={12} fill="rgba(226,87,63,.12)" stroke="#E8604A" strokeWidth={5} />
				<T2 x={0} y={14} s="已登机" size={40} col="#F06A50" anchor="middle" /></g>}
		</Widget></g>; };

/* ---------- the scene ---------- */
const BAGS = [[.05, '#C2493F'], [.24, '#4E78A8'], [.43, '#E0A33A'], [.62, '#5D8A5E'], [.8, '#7A5B9A']] as [number, string][];
const Scene: React.FC<{ts?: number}> = ({ts = 1}) => {
	const fr = useCurrentFrame() * ts, t = fr / FPS, b = t / BEAT, cam = camAt(t), you = youAt(b);
	const doorS = sm((b - 6.9) / .95), inside = b >= 7.0;   // by b 7 the whole figure is past the skin: from then on it is seen only through the opening   // the door swings on the last beat and seals just before the cut
	const camAbove = cam.C[2] > wz(5.75) + .1;
	const opening = DOOR.map(([x, z]) => cam.p(onSkin(x, z)));
	const footShadow = (P: V3, key: string) => { if (P[2] - AH > SILL + .02 || (P[1] < PY0 && P[2] < SILL - .1)) return null; const q = cam.p([P[0], P[1] + .02, P[2] - AH + .005]), k = cam.k(P);
		return <ellipse key={key} cx={q[0]} cy={q[1]} rx={.13 * k} ry={.045 * k} fill="#2A2238" opacity={.32} />; };
	const fig = <g>{footShadow(you.feet[0], 'fs0')}{footShadow(you.feet[1], 'fs1')}<YouFig cam={cam} s={you} /></g>;
	const head = add(you.H, [0, 0, 178 * FM + UM * .28 * 1.08]), hp = cam.p(head);
	const bubIn = (b - .02) / (.36 / BEAT), bubOut = cl((7.05 - b) / .28);
	const bubSc = (bubIn < 1 ? .4 + .6 * back(bubIn) : 1) * (bubOut < 1 ? .6 + .4 * bubOut : 1), bubOp = cl(bubIn / .3) * bubOut;
	const bob = 5 * Math.sin(t * 5.2);
	const crewUp = sm((b - .7) / .6);                                                // the dispatcher's thumbs-up to the cabin
	return <AbsoluteFill style={{background: '#2B2A3A'}}><svg width={W} height={H}>
		<defs><linearGradient id="mf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset=".55" stopColor="#F1F1EF" /><stop offset="1" stopColor="#C3C8D0" /></linearGradient>
			<filter id="yds" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx={3} dy={5} stdDeviation={5} floodColor="#1A1410" floodOpacity={.28} /></filter>
			<filter id="bds" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx={4} dy={7} stdDeviation={6} floodColor="#1A1410" floodOpacity={.35} /></filter>
			<clipPath id="dw"><polygon points={pts(opening)} /></clipPath>
			<radialGradient id="bcn"><stop offset="0" stopColor="#FFE3A0" stopOpacity="1" /><stop offset=".35" stopColor="#FFB44A" stopOpacity=".7" /><stop offset="1" stopColor="#FFB44A" stopOpacity="0" /></radialGradient>
			<radialGradient id="vig" cx={960} cy={560} r={1180} gradientUnits="userSpaceOnUse"><stop offset=".6" stopColor="#140F1E" stopOpacity="0" /><stop offset="1" stopColor="#140F1E" stopOpacity=".42" /></radialGradient></defs>
		<Sky cam={cam} t={t} />
		<FarWorld cam={cam} />
		<Ground cam={cam} />
		{/* cast shadows from the low sun (one group, so overlaps don't darken) */}
		<g opacity={.3}>
			{STA.slice(0, -1).map((x, i) => <ShadowHull key={`sf${i}`} cam={cam} P={[x, STA[i + 1]].flatMap((xx) => Array.from({length: 16}, (_, j) => SP(xx, 2 * Math.PI * j / 16)))} />)}
			{[1, -1].map((s) => <ShadowHull key={`sw${s}`} cam={cam} P={PLAN.map(([x, y]) => [x, s * y, wz(y)] as V3)} />)}
			{[1, -1].map((s) => <ShadowHull key={`se${s}`} cam={cam} P={nacPts(s)} />)}
			<ShadowHull cam={cam} P={boxPts([trainX(t) - 8.3, 8.3, 0], [trainX(t), 9.7, 1.85])} />
			<ShadowHull cam={cam} P={truckBodyPts()} /><ShadowHull cam={cam} P={truckStairPts()} />
		</g>
		{/* the far side: starboard wing and engine (seen under the belly), the belly fairing */}
		<Wing cam={cam} sgn={-1} /><Engine cam={cam} sgn={-1} />
		<Gear cam={cam} x={-17.4} y={-3.8} r={.57} top={2.3} dy={.45} />
		<Gear cam={cam} x={-5.0} y={0} r={.36} top={2.15} dy={.3} />
		<Tail cam={cam} />
		{/* the aircraft */}
		<Fairing cam={cam} />
		<FusMesh cam={cam} />
		<Livery cam={cam} />
		<g clipPath="url(#dw)"><Doorway cam={cam}>
			<Attendant cam={cam} P={[XD - 1.15, .45, SILL]} bow={sm((b - 3.9) / .5) - sm((b - 4.8) / .5)} show={sm((b - 5.9) / .6)} />
			{inside && fig}
		</Doorway></g>
		<DoorPanel cam={cam} s={doorS} />
		<Poly cam={cam} P={[[-32.6, 0, 5.1], [-35.8, -6.1, 5.6], [-36.9, -6.1, 5.6], [-36.6, 0, 5.1]]} fill="#C2C5D6" sw={2.2} />
		<Gear cam={cam} x={-17.4} y={3.8} r={.57} top={2.3} dy={.45} />
		{camAbove ? <><Engine cam={cam} sgn={1} /><BagTrain cam={cam} t={t} /><Wing cam={cam} sgn={1} /></> : <><Wing cam={cam} sgn={1} /><Engine cam={cam} sgn={1} /><BagTrain cam={cam} t={t} /></>}
		<Cone cam={cam} P={[-11.8, 7.7, 0]} />
		{/* the crew, the stairs truck with the traveller, the baggage train under the wing */}
		<Crew cam={cam} P={[-3.4, 2.3, 0]} pose="stand" />
		<StairsTruck cam={cam} rider={!inside && fig} />
		<Crew cam={cam} P={[XD + 1.3, 3.25, 0]} pose="up" a={crewUp} flip={-1} />
		<Cone cam={cam} P={[-1.6, .6, 0]} />
		<Cone cam={cam} P={[XS + 1.25, 7.9, 0]} />
		{(() => { const q = cam.p([XS + .49, 2.99, 2.46]), fl = Math.exp(-6 * (b - Math.floor(b))) * (b >= 0 ? 1 : 0);
			return <circle cx={q[0]} cy={q[1]} r={22 + 10 * fl} fill="url(#bcn)" opacity={.25 + .75 * fl} />; })()}
		<Bubble x={hp[0]} y={hp[1] - 16 + bob} sc={bubSc} op={bubOp} />
		<rect width={W} height={H} fill="url(#vig)" />
		<Pass b={b} />
	</svg></AbsoluteFill>;
};
/* Q57BOARD106: the same scene for the 106 BPM track (owner 2026-11-03): time scaled so each 0.418 s beat lasts 0.566 s (2 bars = 4.528 s) */
const TS106 = 0.418 / 0.56606;
registerRoot(() => <><Composition id="Q57BOARD" component={Scene} durationInFrames={NF} fps={FPS} width={W} height={H} />
	<Composition id="Q57BOARD106" component={Scene} defaultProps={{ts: TS106}} durationInFrames={Math.round(NF / TS106)} fps={FPS} width={W} height={H} /></>);
