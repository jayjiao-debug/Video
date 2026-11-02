import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Zun, Cam, V3, ZunLight, lookAt, proj, toCam, ZUN, Rz, rho, rnd as zrnd} from './zun55h';
import {homeCam, rotL, HOME_EL, HOME_D} from './home55h';
import {Glow, Vig, Haze, YardBG, sm, pth, f1, rnd, P, tube} from './kf55h';
import {Furnace, SilZun, GripHand} from './kfall55h';
import {Body, Sil, Sk} from './rig55h';
import {FilmOv2} from './ov55v2';
import {card2} from './cards55v2';
import {cl, seg, ease, eio, lerp, lerpP, BEAT, poseFK, mixFK, FK, track, Glyphs55, GLYPH_STROKES, CowrieString, Yard1965, Tag30w} from './act551k';
/* ep55 何尊 v2 · act 4 (builder 4) — the climax: U, V, 停, W1, W2, X1, X2, X3, X4. Film 101.1 → 137.3 s (frames 3033–4118).
   Music (measured on bgm_cut55b.wav): before the stop the bar downbeats are 102.155, 104.42, 106.68; DIGITAL SILENCE
   108.20 → 109.78; after it the beat grid is G(k) = 109.78 + 0.56604·k (re-entry = G(0), the HARDEST DROP 118.84 = G(16),
   bars every 4). Cuts on the first frame with t ≥ card.t. The lamp clicks on at the hit (frame 3566, the first frame ≥ 118.84);
   frame 3565 (X1's cut) is the dark room one frame before it.
   Hand-off to builder 5 (X5 at 137.30): the last frame (4118) is the clean 尊 at HOME az 30 (homeCam(30)), the beam from the mouth
   (rim y ≈ 340) to the top of frame, #F2C66E ≈ 35 %, soft edges, widening; 宅兹中或 in a row at y ≈ 200. */
const W = 1920, H = 1080;
const ss = (a: number, b: number, t: number) => ease(seg(t, a, b));
const G = (k: number) => 109.78 + BEAT * k;
const HIT = 118.84;
const SF = (id: string) => Math.ceil(card2(id).t * 30 - 1e-6);
const D2R = Math.PI / 180;
const add2 = (a: P, b: P, k = 1): P => [a[0] + b[0] * k, a[1] + b[1] * k];
const nz2 = (a: P): P => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; };
const flick = (t: number, s: number) => 0.85 + 0.1 * Math.sin(t * 7.3 + s) + 0.05 * Math.sin(t * 17.1 + s * 2);

/* ============================== a 2.5D world camera (cm; x right, y DOWN, z depth) ============================== */
type C25 = {x: number; y: number; z: number; f: number; cx: number; cy: number};
const mixC = (a: C25, b: C25, u: number): C25 => ({x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: lerp(a.z, b.z, u), f: lerp(a.f, b.f, u), cx: lerp(a.cx, b.cx, u), cy: lerp(a.cy, b.cy, u)});
const kz = (c: C25, Z: number) => c.f / Math.max(1, Z - c.z);
const pz = (c: C25, X: number, Y: number, Z: number): P => { const k = kz(c, Z); return [c.cx + k * (X - c.x), c.cy + k * (Y - c.y)]; };
/** a layer authored in world cm at depth Z */
const Lay: React.FC<{c: C25; Z: number; children: React.ReactNode}> = ({c, Z, children}) => { const k = kz(c, Z);
	return <g transform={`translate(${f1(c.cx - k * c.x)} ${f1(c.cy - k * c.y)}) scale(${k.toFixed(5)})`}>{children}</g>; };
/** a backdrop authored in screen px for the camera c0, placed at depth Z (it parallaxes and zooms with the camera) */
const Back: React.FC<{c: C25; c0: C25; Z: number; children: React.ReactNode}> = ({c, c0, Z, children}) => {
	const s = (c.f * (Z - c0.z)) / (c0.f * (Z - c.z)), tx = c.cx - s * c0.cx + (c.f * (c0.x - c.x)) / (Z - c.z), ty = c.cy - s * c0.cy + (c.f * (c0.y - c.y)) / (Z - c.z);
	return <g transform={`translate(${f1(tx)} ${f1(ty)}) scale(${s.toFixed(5)})`}>{children}</g>; };
/** the zun55h camera that draws the 尊 (base centre at world X0, Y0, Z0) consistently with the 2.5D camera; az = the view azimuth */
const zc25 = (c: C25, X0: number, Y0: number, Z0: number, az: number): Cam => { const ps = (az + 180) * D2R, F: V3 = [Math.cos(ps), Math.sin(ps), 0], R: V3 = [Math.sin(ps), -Math.cos(ps), 0];
	const a = X0 - c.x, b = Z0 - c.z, d = c.y - Y0;
	return {p: [-(a * R[0] + b * F[0]), -(a * R[1] + b * F[1]), -d], yaw: ps, pitch: 0, roll: 0, f: c.f, cx: c.cx, cy: c.cy}; };
/** world position of a model point (zun cm, z up) for a 尊 standing at (X0, Y0, Z0) seen at azimuth az */
const zw = (m: V3, X0: number, Y0: number, Z0: number, az: number): [number, number, number] => { const ps = (az + 180) * D2R, F = [Math.cos(ps), Math.sin(ps)], R = [Math.sin(ps), -Math.cos(ps)];
	return [X0 + m[0] * R[0] + m[1] * R[1], Y0 - m[2], Z0 + m[0] * F[0] + m[1] * F[1]]; };

/* ============================== the look-at camera rig (as film55h's camOf / mixCP) ============================== */
type CP = {az: number; el: number; D: number; T: V3; f: number; cx: number; cy: number; roll?: number};
const camOf = (p: CP): Cam => { const a = p.az * D2R, e = p.el * D2R;
	return lookAt([p.T[0] + p.D * Math.cos(e) * Math.cos(a), p.T[1] + p.D * Math.cos(e) * Math.sin(a), p.T[2] + p.D * Math.sin(e)], p.T, p.f, p.cx, p.cy, (p.roll ?? 0) * D2R); };
const mixCP = (a: CP, b: CP, u: number): CP => ({az: lerp(a.az, b.az, u), el: lerp(a.el, b.el, u), D: Math.exp(lerp(Math.log(a.D), Math.log(b.D), u)), T: [lerp(a.T[0], b.T[0], u), lerp(a.T[1], b.T[1], u), lerp(a.T[2], b.T[2], u)],
	f: lerp(a.f, b.f, u), cx: lerp(a.cx, b.cx, u), cy: lerp(a.cy, b.cy, u), roll: lerp(a.roll ?? 0, b.roll ?? 0, u)});
const homeCP = (az: number): CP => { const c = homeCam(az); return {az, el: HOME_EL, D: HOME_D, T: [0, 0, 19.4], f: c.f, cx: c.cx, cy: c.cy}; };
const pxk = (cam: Cam, q: V3) => cam.f / Math.max(1, toCam(cam, q)[2]);

/* ============================== particles ============================== */
/** a burst of sparks from (x, y) at t0: streaks, gravity g px/s², speed s px/s, toward dir (deg, 90 = up) ± spread */
const Sparks: React.FC<{t: number; t0: number; x: number; y: number; n: number; seed: number; s: number; dir: number; spread?: number; g?: number; life?: number; w?: number}> =
	({t, t0, x, y, n, seed, s, dir, spread = 70, g = 900, life = 0.9, w = 1}) => { const age = t - t0; if (age < 0 || age > life * 1.4) return null;
	return <g>{Array.from({length: n}, (_, i) => { const L = life * (0.45 + 0.9 * rnd(i, seed)); if (age > L) return null;
		const a = (dir + (rnd(i, seed + 1) - 0.5) * spread) * D2R, v = s * (0.35 + 0.9 * rnd(i, seed + 2)), vx = v * Math.cos(a), vy = -v * Math.sin(a);
		const x1 = x + vx * age, y1 = y + vy * age + 0.5 * g * age * age, vy1 = vy + g * age, dt = 0.03, o = Math.pow(1 - age / L, 0.7);
		return <path key={i} d={`M${f1(x1)},${f1(y1)}L${f1(x1 - vx * dt)},${f1(y1 - vy1 * dt)}`} stroke={i % 3 ? '#FFD27A' : '#FF8A3A'} strokeWidth={w * (1.3 + 1.8 * rnd(i, seed + 3))} strokeLinecap="round" opacity={o} />; })}</g>; };
/** embers / motes drifting up through a box, wrapping */
const Rising: React.FC<{t: number; n: number; x0: number; x1: number; y0: number; y1: number; c: string; seed: number; v: number; o?: number; r?: number; sway?: number}> = ({t, n, x0, x1, y0, y1, c, seed, v, o = 0.6, r = 2.4, sway = 12}) => <g>
	{Array.from({length: n}, (_, i) => { const h = y1 - y0, y = y1 - (((rnd(i, seed + 1) * h) + t * v * (0.6 + 0.8 * rnd(i, seed + 5))) % h), x = x0 + rnd(i, seed) * (x1 - x0) + Math.sin(t * 0.9 + i) * sway;
		return <circle key={i} cx={f1(x)} cy={f1(y)} r={(0.6 + rnd(i, seed + 2) * r).toFixed(2)} fill={c} opacity={o * (0.3 + 0.7 * rnd(i, seed + 3))} />; })}</g>;

/* ============================== the overlay shell ============================== */
const Shell: React.FC<{id: string; t: number; bg: string; vig?: number; children: React.ReactNode; after?: React.ReactNode; hideCounter?: boolean}> = ({id, t, bg, vig = 0.6, children, after, hideCounter}) =>
	<AbsoluteFill style={{background: bg}}>
		<svg width={W} height={H} style={{position: 'absolute'}}>{children}{vig > 0 && <Vig id={`v4${id}`} a={vig} />}</svg>
		{after}
		<FilmOv2 t={t} c={card2(id)} hideCounter={hideCounter} />
	</AbsoluteFill>;

/* ============================== people helpers ============================== */
/** body-local (cm, facing +x) from a screen point, for a body whose ground point is at (x, y), k px/cm, flipped (facing −x) */
const loc = (q: P, x: number, y: number, k: number, flip: boolean): P => [((q[0] - x) / k) * (flip ? -1 : 1), (q[1] - y) / k];
/** a long-handled shovel held by both hands (body-local cm): shaft from behind the far hand through the near hand, the blade at its end */
const Shovel: React.FC<{s: Sk; load: number}> = ({s, load}) => { const d = nz2([s.hN[0] - s.hF[0], s.hN[1] - s.hF[1]]), n: P = [-d[1], d[0]];
	const a = add2(s.hF, d, -12), b = add2(s.hF, d, 90), bt = add2(b, d, 26);
	return <g>
		<path d={tube(a, b, 1.7, 1.6)} />
		<path d={pth([add2(b, n, -10), add2(b, n, 10), add2(add2(bt, n, 9), d, -2), add2(bt, n, 4), add2(bt, n, -4), add2(add2(bt, n, -9), d, -2)])} />
		{load > 0 && [0, 1, 2, 3].map((i) => { const c = add2(add2(b, d, 8 + i * 4.5), n, -4 - 2 * rnd(i, 3) - 3 * (i % 2)); return <path key={i} d={sm([add2(c, [-3, 0]), add2(c, [-1, -3.5]), add2(c, [3, -2.5]), add2(c, [3.5, 1])])} opacity={load} />; })}
	</g>; };
/** a work glove (cm, the wrist at 0,0, pointing +x): sleeve, gauntlet, palm, four fingers and a thumb that curl at the knuckles */
const Glove: React.FC<{curl: number; spread?: number; sleeve?: number}> = ({curl, spread = 1, sleeve = 34}) => {
	const fing = (y0: number, a0: number, l1: number, l2: number, i: number) => { const b: P = [9.4, y0], a1 = (a0 * spread + 62 * curl) * D2R, k: P = [b[0] + l1 * Math.cos(a1), b[1] + l1 * Math.sin(a1)], a2 = a1 + 78 * curl * D2R, e: P = [k[0] + l2 * Math.cos(a2), k[1] + l2 * Math.sin(a2)];
		return <g key={i}><path d={tube(b, k, 1.15, 1.05)} /><circle cx={k[0]} cy={k[1]} r={1.05} /><path d={tube(k, e, 1.05, 0.95)} /></g>; };
	const th0: P = [2.5, -4.2], ta = (-52 + 40 * curl) * D2R, tk: P = [th0[0] + 4.6 * Math.cos(ta), th0[1] + 4.6 * Math.sin(ta)], tb = ta + 40 * curl * D2R, te: P = [tk[0] + 3.4 * Math.cos(tb), tk[1] + 3.4 * Math.sin(tb)];
	return <g>
		<path d={tube([-sleeve, 0.6], [-9, 0], 7.2, 6.4)} />
		<path d={sm([[-11, -6.8], [-1, -5.6], [-0.5, 5.8], [-11, 7.2]])} />
		<path d={sm([[-1.5, -4.8], [5, -5.2], [9.8, -4.4], [10.6, 0], [9.8, 4.4], [5, 5], [-1.5, 4.6]])} />
		{fing(-3.3, -10, 4.6, 3.6, 0)}{fing(-1.1, -3, 5.0, 3.9, 1)}{fing(1.1, 3, 4.8, 3.8, 2)}{fing(3.2, 10, 4.0, 3.2, 3)}
		<path d={tube(th0, tk, 1.4, 1.2)} /><circle cx={tk[0]} cy={tk[1]} r={1.2} /><path d={tube(tk, te, 1.2, 1.0)} />
	</g>; };
/** a gloved restorer's hand (white cotton glove, white coat sleeve), from GripHand */
const RestHand: React.FC<{x: number; y: number; k: number; rot: number; flip?: boolean; o?: number; tool?: 'scalpel' | 'brush' | 'none'; toolL?: number}> = ({x, y, k, rot, flip, o = 1, tool = 'none', toolL = 12}) =>
	<g opacity={o} transform={`translate(${f1(x)},${f1(y)}) scale(${flip ? -k : k},${k}) rotate(${f1(flip ? rot : rot)})`}>
		{/* the white coat's sleeve (forearm ≈ 26 cm): shaded underside, a rim of light along the top */}
		<path d={tube([-34, 0.8], [-5, 0], 5.0, 4.3)} fill="#A9B3BF" />
		<path d={tube([-34, 2.6], [-5, 1.8], 3.4, 2.6)} fill="#86909C" />
		<path d={sm([[-34, -4.2], [-20, -4.6], [-6, -4.0]], false)} stroke="#EEF2F6" strokeWidth={0.7} fill="none" opacity={0.8} />
		<path d={sm([[-7, -4.6], [-3.5, -4.3], [-3.5, 4.6], [-7, 5.0]])} fill="#C2CAD2" />
		{/* the cotton glove */}
		<g fill="#E2DCCF"><path d={sm([[-3, -3.8], [3.5, -4.4], [8, -3.6], [9.5, 0], [8.4, 3.6], [3, 4.2], [-3, 3.8]])} />
			{[-2.6, -0.85, 0.9, 2.6].map((yy, i) => <path key={i} d={sm([[7.6, yy - 0.95], [12.6 - Math.abs(yy) * 0.3, yy - 0.8], [15.2 - Math.abs(yy) * 0.4, yy + 0.6], [14.2 - Math.abs(yy) * 0.4, yy + 1.7], [12, yy + 0.9], [7.6, yy + 0.9]])} />)}
			<path d={tube([1.5, -3.8], [7.5, -6.8], 1.4, 1.1)} /></g>
		<path d={sm([[-3, 3.8], [3, 4.2], [8.4, 3.6], [14, 2.6]], false)} stroke="#A8A294" strokeWidth={0.6} fill="none" />
		{tool === 'scalpel' && <g><path d={pth([[6, -5.6], [6 + toolL - 2.4, -5.9 + toolL * 0.02], [6 + toolL - 2.4, -5.2 + toolL * 0.02], [6, -4.9]])} fill="#9A9C9E" /><path d={pth([[6 + toolL - 2.4, -6.0 + toolL * 0.02], [6 + toolL, -5.5 + toolL * 0.02], [6 + toolL - 2.4, -5.1 + toolL * 0.02]])} fill="#F4F4EE" /></g>}
	</g>;
/* ============================== U · 101.07 the furnace: a stoker feeds it; the camera pushes from the 尊 toward the fire ============================== */
const LU: ZunLight = {dir: [0.15, 0.9, 0.35], col: '#FF7A30', k: 1.65, amb: 0.17, ambCol: '#3A2430', spec: 0.6, shin: 12, rim: {dir: [-0.3, 0.9, 0.3], col: '#FFB060', k: 0.85}};
const U_T1 = 102.155, U_T2 = 104.42;   /* the two throws land on the bar downbeats */
const UZ = {x: -47, y: -30, z: 175, az: 25, roll: -7};   /* the 尊, askew on the scrap pile */
const UF = {x: 150, z: 570};   /* the furnace: front face; mouth centre (150, −85), ±45 cm wide, from 20 to 150 cm up */
const UW = {x: 22, z: 520};    /* the stoker's feet */
const UC0: C25 = {x: -10, y: -74, z: 0, f: 1500, cx: 960, cy: 500}, UC1: C25 = {x: 10, y: -82, z: 45, f: 1650, cx: 960, cy: 520};
const SA: FK = {hip: [-8, -72], lean: 48, neck: 2, tilt: 22, fN: [30, -8], fF: [-24, -8], hN: [44, -54], hF: [10, -84]};
const SB: FK = {hip: [-4, -82], lean: 22, neck: 4, tilt: 6, fN: [30, -8], fF: [-24, -8], hN: [46, -98], hF: [8, -94]};
const SC: FK = {hip: [5, -84], lean: 9, neck: 6, tilt: -4, fN: [30, -8], fF: [-24, -8], hN: [62, -118], hF: [24, -113]};
const SD: FK = {hip: [-2, -85], lean: 16, neck: 4, tilt: 8, fN: [30, -8], fF: [-24, -8], hN: [42, -86], hF: [6, -90]};
const STOKE: [number, FK][] = [[100.9, SA], [101.12, SA], [101.62, SB], [U_T1 - 0.02, SC], [U_T1 + 0.25, SC], [102.75, SD], [103.2, SA], [103.4, SA], [103.92, SB], [U_T2 - 0.02, SC], [U_T2 + 0.25, SC], [105.0, SD], [105.45, SA], [106, SA]];
const SU: React.FC<{t: number}> = ({t}) => {
	const v = seg(t, 100.5, 105.95), u = 0.55 * v + 0.45 * Math.sin((Math.PI / 2) * v), c = mixC(UC0, UC1, u);
	const ycam = {x: (c.x - UC0.x) * 1.6, y: (c.y - UC0.y) * 1.2, s: (c.f / UC0.f) * (1 + c.z / 1800)};
	const fk = track(STOKE, t, mixFK), s = poseFK(fk), load = t < U_T1 ? seg(t, 101.2, 101.4) : t < U_T1 + 0.05 ? 1 - seg(t, U_T1 - 0.05, U_T1 + 0.05) : t < U_T2 ? seg(t, 103.45, 103.6) * (1 - seg(t, U_T2 - 0.05, U_T2 + 0.05)) : seg(t, 105.4, 105.6);
	const wp = pz(c, UW.x, 0, UW.z), wk = kz(c, UW.z), mouth = pz(c, UF.x, -85, UF.z), fk2 = kz(c, UF.z);
	const flare = Math.exp(-Math.max(0, t - (U_T1 + 0.1)) * 3.5) * (t > U_T1 + 0.05 ? 1 : 0) + Math.exp(-Math.max(0, t - (U_T2 + 0.1)) * 3.5) * (t > U_T2 + 0.05 ? 1 : 0);
	const heat = 0.8 + 0.15 * flick(t, 3) + 0.25 * flare, fl = 0.82 + 0.6 * (flick(t, 3) - 0.85) + 0.12 * Math.sin(t * 11.3);
	const cam = zc25(c, UZ.x, UZ.y, UZ.z, UZ.az), base = pz(c, UZ.x, UZ.y, UZ.z), zk = kz(c, UZ.z);
	const bk = proj(cam, [0, 18.4, 34.1]), sw = 7 * Math.sin(t * 2.1) + 3 * flare * Math.sin(t * 9);
	/* the load in flight (from the blade into the mouth) */
	const fly = (T: number) => { const a = seg(t, T - 0.04, T + 0.22); if (a <= 0 || a >= 1) return null; const b0 = add2(wp, [(SC.hN[0] + 70) * wk, (SC.hN[1] - 16) * wk]), b1: P = [mouth[0] + 10, mouth[1] + 20];
		return <g fill="#1A100A">{[0, 1, 2].map((i) => { const q = lerpP(b0, b1, a + i * 0.06), yy = q[1] - Math.sin(Math.PI * cl(a + i * 0.06)) * 40 * wk / 3; return <path key={i} d={sm([[q[0] - 9, yy], [q[0] - 2, yy - 10], [q[0] + 9, yy - 5], [q[0] + 8, yy + 6]])} />; })}</g>; };
	return <Shell id="U" t={t} bg="#07040A" vig={0.62}>
		<Yard1965 cam={ycam} t={t} dim={0.72} id="u4y" />
		<rect width={W} height={H} fill="#1A0604" opacity={0.25} />
		{/* the furnace (a 1960s brick cupola), its glow on the yard */}
		<Glow x={mouth[0]} y={mouth[1] + 60 * fk2} r={900 * fk2 / 2.6} c="#FF5A18" o={(0.42 + 0.18 * flare) * fl} id="u4fg" sy={0.75} />
		<Lay c={c} Z={UF.z}><rect x={-2400} y={-2} width={4800} height={900} fill="#120A07" /><g transform={`translate(${UF.x},0) scale(0.5)`}><Furnace x={0} y={0} s={1} id="u4fu" heat={cl(heat)} /></g></Lay>
		<Glow x={mouth[0]} y={mouth[1]} r={220 * fk2 / 2.6} c="#FFC060" o={0.5 * heat} id="u4fm" />
		<Lay c={c} Z={UF.z - 30}>{[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={sm([[60 + i * 22, 0], [70 + i * 20, -10 - 12 * rnd(i, 3)], [92 + i * 20, -6], [96 + i * 20, 0]])} fill="#1A0F0A" />)}</Lay>
		{/* the stoker: scoop → lift → throw, the feet planted */}
		<Sil id="u4w" x={wp[0]} y={wp[1]} k={wk} rim="#FFB060" lx={1} ly={-0.1} fill="#130C09" rimW={3}>
			<Body s={s} dress="jacket" hat="cadre" part="back" wide={1.16} /><Shovel s={s} load={load} /><Body s={s} dress="jacket" hat="cadre" part="front" wide={1.16} /></Sil>
		{fly(U_T1)}{fly(U_T2)}
		<Sparks t={t} t0={U_T1 + 0.12} x={mouth[0]} y={mouth[1] - 30 * fk2} n={70} seed={11} s={900 * fk2 / 2.6} dir={120} spread={80} g={700} life={1.3} />
		<Sparks t={t} t0={U_T2 + 0.12} x={mouth[0]} y={mouth[1] - 30 * fk2} n={80} seed={23} s={950 * fk2 / 2.6} dir={115} spread={85} g={700} life={1.3} />
		<Rising t={t} n={70} x0={mouth[0] - 500} x1={mouth[0] + 300} y0={0} y1={mouth[1]} c="#FFB050" seed={41} v={90} o={0.7} r={2.6} />
		{/* the 尊, askew on the pile, the 30元 tag still on its beak */}
		<Glow x={base[0]} y={base[1] - 20 * zk} r={34 * zk} c="#FF6A20" o={0.22} id="u4zg" />
		<g transform={`rotate(${UZ.roll} ${f1(base[0])} ${f1(base[1])})`}>
			<Zun cam={cam} light={rotL({...LU, k: LU.k * fl, rim: LU.rim ? {...LU.rim, k: LU.rim.k * fl} : undefined}, UZ.az)} id="u4z" patina={0.95} shadow={false} inscription={false} />
			<Tag30w x={bk[0] + 8 * zk * 0.2} y={bk[1] + 7 * zk} rot={-UZ.roll + 6 + sw} anchor={[bk[0], bk[1]]} s={9 * zk / 66} id="u4t" />
		</g>
		{/* the scrap round its foot (in front of it), and junk in the near foreground sliding past */}
		<Lay c={c} Z={UZ.z - 18}>
			<path d={sm([[-150, 20], [-120, -18], [-80, -24], [-50, -14], [-20, -22], [20, -26], [60, -14], [110, -20], [160, 10], [160, 60], [-150, 60]])} fill="#140B08" />
			<path d={sm([[-120, -18], [-80, -24], [-50, -14], [-20, -22], [20, -26], [60, -14], [110, -20]], false)} fill="none" stroke="#FF8A40" strokeWidth={1.6} strokeOpacity={0.55} vectorEffect="non-scaling-stroke" />
			<ellipse cx={-96} cy={-24} rx={18} ry={11} fill="#1C120C" stroke="#FF8A40" strokeOpacity={0.5} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
			<path d="M10,-30 L90,-52" stroke="#1A100B" strokeWidth={6} strokeLinecap="round" /><path d="M12,-33 L90,-55" stroke="#FF9A50" strokeWidth={1.4} strokeOpacity={0.5} vectorEffect="non-scaling-stroke" />
			{[0, 1, 2].map((j) => <ellipse key={j} cx={40 + j * 2} cy={-20 - j * 1.5} rx={16} ry={6} fill="none" stroke={j === 2 ? '#FF8A40' : '#1C120C'} strokeWidth={j === 2 ? 1.4 : 2.4} strokeOpacity={j === 2 ? 0.5 : 1} vectorEffect={j === 2 ? 'non-scaling-stroke' : undefined} />)}
		</Lay>
		<Lay c={c} Z={80}>
			<path d="M-160,40 L-40,22" stroke="#0A0605" strokeWidth={9} strokeLinecap="round" /><path d="M-160,36 L-40,18" stroke="#FF7A30" strokeWidth={1.4} strokeOpacity={0.4} vectorEffect="non-scaling-stroke" />
			<path d={sm([[30, 60], [44, 30], [70, 24], [96, 34], [110, 60]])} fill="#0A0605" />
		</Lay>
		<rect width={W} height={H} fill="#FF4A10" opacity={0.03 + 0.06 * flare + 0.22 * cl(fl - 0.62)} style={{mixBlendMode: 'screen'}} />
	</Shell>; };

/* ============================== V · 105.60 the eye in the firelight; a gloved hand reaches in. HARD CUT TO BLACK at 108.20 ============================== */
const LV: ZunLight = {dir: [0.35, 0.88, 0.3], col: '#FF5A20', k: 1.8, amb: 0.12, ambCol: '#3A1008', spec: 0.9, shin: 12, rim: {dir: [-0.3, 0.9, 0.35], col: '#FFA040', k: 0.9}};
const surfPt = (th: number, z: number, lift = 0): V3 => { const [r, n] = Rz(z), k = r * rho(th, n) + lift; return [k * Math.cos(th), k * Math.sin(th), z]; };
const SV: React.FC<{t: number}> = ({t}) => { const a0 = 105.6, u = Math.sin((Math.PI / 2) * seg(t, a0, 108.25));
	const th = 5.25 / 9.4, Pq = surfPt(th, 14.7, 0.6), a = (th * 180 / Math.PI - 4 + 4 * u) * D2R, D = 66 - 12 * u;
	const cam = lookAt([Pq[0] + D * Math.cos(a), Pq[1] + D * Math.sin(a), Pq[2] + 4 - 1.5 * u], Pq, 4300, 960, 690);
	/* the glove: in from the right, fingers open, closing on the side flange */
	const tgt = proj(cam, [0.5, 12.6, 17.5]), r = ss(105.85, 107.6, t), grip = ss(107.55, 108.1, t);
	const wx = lerp(2250, tgt[0] + 300, r) - 40 * grip, wy = lerp(760, tgt[1] - 10, r) + 14 * grip, rot = lerp(-192, -176, r) + 8 * grip;
	const gk = 31 * (1 + 0.06 * u);
	const flare = 0.5 + 0.5 * Math.sin(t * 5.1) * Math.sin(t * 2.3 + 1);
	return <Shell id="V" t={t} bg="#0A0303" vig={0.78}>
		<defs><radialGradient id="v4bg" cx="82%" cy="72%" r="85%"><stop offset="0" stopColor="#6A2008" /><stop offset="0.45" stopColor="#2A0904" /><stop offset="1" stopColor="#0A0303" /></radialGradient>
			<filter id="v4sh" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={26} /></filter></defs>
		<rect width={W} height={H} fill="url(#v4bg)" />
		<Glow x={1820} y={900} r={760} c="#FF5A18" o={0.3 + 0.12 * flare} id="v4f" />
		<Zun cam={cam} light={{...LV, k: LV.k * (0.78 + 0.34 * flare)}} id="v4z" patina={0.9} shadow={false} inscription={false} />
		{/* the hand's shadow thrown across the 尊 by the fire behind it */}
		{r > 0 && <g filter="url(#v4sh)" opacity={0.5 * r}><g transform={`translate(${f1(wx - 170)},${f1(wy + 60)}) rotate(${f1(rot)}) scale(${(gk * 1.12).toFixed(2)},${(-gk * 1.12).toFixed(2)})`} fill="#000"><Glove curl={0.12 + 0.62 * grip} spread={1.3 - 0.5 * grip} /></g></g>}
		{r > 0 && <Sil id="v4g" x={0} y={0} k={1} rim="#FFA050" lx={1} ly={-0.7} fill="#3A2A20" rimW={5}><g transform={`translate(${f1(wx)},${f1(wy)}) rotate(${f1(rot)}) scale(${gk.toFixed(2)},${(-gk).toFixed(2)})`}><Glove curl={0.12 + 0.62 * grip} spread={1.3 - 0.5 * grip} /></g></Sil>}
		<Rising t={t} n={60} x0={700} x1={1900} y0={200} y1={1080} c="#FFB050" seed={161} v={130} o={0.85} r={3} sway={30} />
		<Sparks t={t} t0={106.684} x={1950} y={980} n={40} seed={5} s={900} dir={140} spread={30} g={500} life={1.4} w={1.4} />
	</Shell>; };

/* ============================== 停 · 108.20 silence: black; the furnace glow pulses once on the rim ============================== */
const SStop: React.FC<{t: number}> = ({t}) => { const p = ss(108.3, 108.7, t) * (1 - ss(108.7, 109.5, t));
	return <AbsoluteFill style={{background: '#000'}}>
		{p > 0.004 && <svg width={W} height={H} style={{position: 'absolute', opacity: p}}>
			<defs><linearGradient id="s4m" x1="0" y1="0" x2="1" y2="0.3"><stop offset="0.2" stopColor="#fff" stopOpacity={0.25} /><stop offset="0.7" stopColor="#fff" stopOpacity={1} /></linearGradient>
				<mask id="s4mk" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}><rect x={600} y={200} width={760} height={760} fill="url(#s4m)" /></mask></defs>
			<Glow x={1500} y={980} r={760} c="#A02A08" o={0.22} id="s4g" sy={0.6} />
			<g mask="url(#s4mk)"><SilZun cam={homeCam(30)} id="s4z" rim="#FF6A28" halo="#A02A08" haloO={0.3} /></g>
		</svg>}
		<FilmOv2 t={t} c={card2('停')} />
	</AbsoluteFill>; };

/* ============================== the morning yard (W1, W2): world, the expert, the 尊 on the pile ============================== */
/* the light comes in low through the yard gate at the right-back (the sun beyond it) */
const LMo: ZunLight = {dir: [-0.2, 0.78, 0.58], col: '#FFE4BC', k: 1.6, amb: 0.38, ambCol: '#7A8494', spec: 0.6, shin: 14, rim: {dir: [-0.7, 0.6, 0.35], col: '#FFE6C0', k: 0.65}};
const WZ = {x: 0, y: -28, z: 330, az: -35};   /* the 尊 on the pile */
const GATE = {x0: 232, x1: 392, z: 640, h: 158};
const WP0: P = [235, 470], WP1: P = [62, 342]; /* his walk in (X, Z), four steps (so the near foot leads into the crouch) */
const WL = Math.hypot(WP1[0] - WP0[0], WP1[1] - WP0[1]) / 4;
/** a planted-feet walk along a world line: hip path position sp (cm along the line from its start); returns the two feet's
    path positions and lifts. Each foot: stance while the hip travels L, swing while it travels L (no sliding). */
const gait = (sp: number, L: number) => [0, 1].map((j) => { const uu = sp - j * L, c = Math.floor(uu / (2 * L)), r = uu - c * 2 * L, plant = j * L + c * 2 * L + L / 2;
	if (r < L) return {s: plant, lift: 0}; const q = (r - L) / L; return {s: plant + 2 * L * ease(q), lift: 9 * Math.sin(Math.PI * q)}; });
type Ex = {X: number; Z: number; s: Sk; flip: boolean};
/** walking along A → B (world X, Z), sp cm along it; feet planted by the gait; arms swing, or (carry) hold the 尊 at the chest */
const walkPose = (c: C25, A: P, B: P, sp: number, L: number, carry: boolean): Ex => { const d = nz2([B[0] - A[0], B[1] - A[1]]), hipW: P = [A[0] + d[0] * sp, A[1] + d[1] * sp];
	const hs = pz(c, hipW[0], 0, hipW[1]), k = kz(c, hipW[1]), flip = d[0] < 0;
	const ft = gait(sp, L).map((g) => { const w: P = [A[0] + d[0] * g.s, A[1] + d[1] * g.s], q = pz(c, w[0], 0, w[1]), l = loc(q, hs[0], hs[1], k, flip); return [l[0], l[1] - 7 - g.lift] as P; });
	const ph = (sp / L) * Math.PI, bob = -2.2 * Math.abs(Math.cos(ph)), sw = 16 * Math.cos(ph);
	const hip: P = [0, -89 + bob], lean = carry ? -3 : 5;
	const sh: P = [hip[0] + 50 * Math.sin(lean * D2R), hip[1] - 50 * Math.cos(lean * D2R)];
	const hN: P = carry ? CARRY_N : [sh[0] + 54 * Math.sin(sw * D2R), sh[1] + 52 * Math.cos(sw * D2R)];
	const hF: P = carry ? CARRY_F : [sh[0] - 54 * Math.sin(sw * D2R), sh[1] + 52 * Math.cos(sw * D2R)];
	return {X: hipW[0], Z: hipW[1], s: poseFK({hip, lean, neck: carry ? 10 : 6, tilt: carry ? 12 : 4, fN: ft[0], fF: ft[1], hN, hF}), flip}; };
/** carrying: the near hand under its foot, the far hand round its neck (body-local cm); the 尊's base sits at CARRY_B */
const CARRY_N: P = [24, -92], CARRY_F: P = [22, -124], CARRY_B: P = [22, -95];
const YardMorning: React.FC<{c: C25; t: number; gate?: number}> = ({c, t, gate = 0}) => {
	const g = (X: number, Z: number, Y = 0) => pz(c, X, Y, Z), k = kz(c, GATE.z);
	const spill = [g(GATE.x0, GATE.z), g(GATE.x1, GATE.z), g(GATE.x1 - 60, 200), g(GATE.x0 - 420, 200)];
	const sun = g(560, 3000, -320), gc = g((GATE.x0 + GATE.x1) / 2, GATE.z, -GATE.h / 2);
	return <>
		<defs><linearGradient id="wmsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3E4C64" /><stop offset="0.5" stopColor="#8E98A6" /><stop offset="0.8" stopColor="#E8CDA8" /><stop offset="1" stopColor="#F6DEB8" /></linearGradient>
			<linearGradient id="wmgnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5E4E3E" /><stop offset="0.35" stopColor="#3A2E24" /><stop offset="1" stopColor="#1E1814" /></linearGradient>
			<linearGradient id="wmgate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F2DCB8" /><stop offset="1" stopColor="#FFF2DA" /></linearGradient>
			<linearGradient id="wmsp" gradientUnits="userSpaceOnUse" x1={spill[0][0]} y1={spill[0][1]} x2={spill[3][0]} y2={spill[3][1]}><stop offset="0" stopColor="#FFE8C4" stopOpacity={0.55} /><stop offset="1" stopColor="#FFE8C4" stopOpacity={0} /></linearGradient></defs>
		<rect width={W} height={H} fill="url(#wmsky)" />
		<Glow x={sun[0]} y={sun[1]} r={900} c="#FFF0D0" o={0.6} id="wmsun" sy={0.7} />
		{/* the 秦岭 far off, the shed roof behind the wall */}
		<Lay c={c} Z={6000}><path d={sm([[-9000, 0], [-6000, -700], [-3000, -380], [0, -820], [2600, -460], [5200, -760], [9000, -300], [9000, 400], [-9000, 400]])} fill="#8C8C96" opacity={0.7} /></Lay>
		<Lay c={c} Z={1100}><path d={pth([[-900, -150], [-860, -330], [-120, -360], [-80, -150]])} fill="#2E2622" /><path d="M-900,-332 L-100,-362" stroke="#FFE6C0" strokeWidth={2} strokeOpacity={0.5} vectorEffect="non-scaling-stroke" /><rect x={-560} y={-560} width={26} height={240} fill="#2A2420" /></Lay>
		{/* the yard wall, the gate in it full of morning light */}
		<Lay c={c} Z={GATE.z}>
			<rect x={-1800} y={-1} width={3600} height={1200} fill="url(#wmgnd)" />
			<path d={pth([[-1800, -GATE.h], [GATE.x0, -GATE.h], [GATE.x0, 0], [-1800, 0]])} fill="#3A2E28" /><path d={pth([[GATE.x1, -GATE.h], [1800, -GATE.h], [1800, 0], [GATE.x1, 0]])} fill="#3A2E28" />
			{Array.from({length: 52}, (_, i) => { const x = -1800 + i * 70; return x > GATE.x0 - 10 && x < GATE.x1 + 10 ? null : <path key={i} d={`M${x},${-GATE.h} L${x},0`} stroke="#2C221E" strokeWidth={3} />; })}
			<path d={`M-1800,${-GATE.h} L${GATE.x0},${-GATE.h} M${GATE.x1},${-GATE.h} L1800,${-GATE.h}`} stroke="#FFE6C0" strokeWidth={2} strokeOpacity={0.55} vectorEffect="non-scaling-stroke" />
			<rect x={GATE.x0} y={-GATE.h - 30} width={GATE.x1 - GATE.x0} height={GATE.h + 31} fill="url(#wmgate)" />
			<path d={pth([[GATE.x1 - 4, -GATE.h], [GATE.x1 + 40, -GATE.h + 14], [GATE.x1 + 40, -4], [GATE.x1 - 4, 0]])} fill="#2A201C" />
			<rect x={GATE.x0 - 22} y={-GATE.h - 34} width={24} height={GATE.h + 35} fill="#2A201C" /><rect x={GATE.x1 - 2} y={-GATE.h - 34} width={24} height={GATE.h + 35} fill="#2A201C" />
			<path d={`M${GATE.x0 + 1},${-GATE.h - 30} L${GATE.x0 + 1},0`} stroke="#FFF2DA" strokeWidth={2.5} strokeOpacity={0.9} vectorEffect="non-scaling-stroke" />
		</Lay>
		<Glow x={gc[0]} y={gc[1]} r={(150 + 500 * gate) * k} c="#FFF2D8" o={0.5 + 0.45 * gate} id="wmgg" sy={1.15} />
		<path d={'M' + spill.map((q) => `${f1(q[0])},${f1(q[1])}`).join('L') + 'Z'} fill="url(#wmsp)" />
		{/* heaps of scrap about the yard */}
		<Lay c={c} Z={560}>{[[-420, 46, 150, 3], [-120, 30, 90, 5], [620, 50, 170, 7]].map(([x, h, w, sd], i) => <g key={i}><path d={sm([[x - w, 2], [x - w * 0.5, -h * 0.8], [x, -h], [x + w * 0.6, -h * 0.7], [x + w, 2]])} fill="#2E241C" />
			<path d={sm([[x - w * 0.5, -h * 0.8], [x, -h], [x + w * 0.6, -h * 0.7]], false)} fill="none" stroke="#FFE6C0" strokeWidth={1.5} strokeOpacity={0.4} vectorEffect="non-scaling-stroke" />
			{[0, 1, 2].map((j) => <ellipse key={j} cx={x - w * 0.4 + j * w * 0.35} cy={-h * (0.4 + 0.25 * rnd(j, sd))} rx={12 + 8 * rnd(j, sd + 1)} ry={7} fill="#241C16" />)}</g>)}</Lay>
		<Lay c={c} Z={430}><path d={sm([[-520, 4], [-430, -40], [-330, -54], [-230, -30], [-170, 4]])} fill="#251D17" /><path d="M-470,-30 L-300,-62" stroke="#1E1712" strokeWidth={6} strokeLinecap="round" /></Lay>
		<Haze y={pz(c, 0, 0, GATE.z)[1] - 20} h={160} c="#F2E2CC" o={0.25} id="wmh" />
		<Rising t={t} n={44} x0={0} x1={W} y0={150} y1={950} c="#FFF2D8" seed={77} v={12} o={0.45} r={2.2} sway={34} />
	</>; };
/** the 尊's pile, drawn in front of its foot */
const PileFront: React.FC<{c: C25}> = ({c}) => <Lay c={c} Z={WZ.z - 14}>
	<path d={sm([[-170, 40], [-140, -10], [-90, -22], [-40, -16], [0, -24], [40, -18], [80, -22], [140, -8], [190, 40]])} fill="#2A1F18" />
	<path d={sm([[-140, -10], [-90, -22], [-40, -16], [0, -24], [40, -18], [80, -22], [140, -8]], false)} fill="none" stroke="#FFE6C0" strokeWidth={1.6} strokeOpacity={0.45} vectorEffect="non-scaling-stroke" />
	<ellipse cx={-110} cy={-20} rx={22} ry={12} fill="#30251C" stroke="#FFE6C0" strokeWidth={1.4} strokeOpacity={0.4} vectorEffect="non-scaling-stroke" />
	<path d="M-60,-26 L-150,-44" stroke="#2A1F18" strokeWidth={5} strokeLinecap="round" />
</Lay>;
/** wiped-clean streaks on the front flange (model θ = 0) of a dirty 尊: w = 0..1 how far the wipe has gone (from z 24 down to 11) */
const Wiped: React.FC<{cam: Cam; w: number; k: number}> = ({cam, w, k}) => { if (w <= 0) return null; const z1 = 24 - 13 * cl(w);
	const pts = Array.from({length: 9}, (_, i) => { const z = lerp(24, z1, i / 8), q = proj(cam, [Rz(z)[0] + 1.6, 0, z]); return `${f1(q[0])},${f1(q[1])}`; }).join('L');
	return <g><path d={`M${pts}`} stroke="#B89060" strokeWidth={2.2 * k} strokeOpacity={0.6} strokeLinecap="round" fill="none" />
		<path d={`M${pts}`} stroke="#FFE8C0" strokeWidth={0.5 * k} strokeOpacity={0.7} strokeLinecap="round" fill="none" transform={`translate(${f1(0.4 * k)},0)`} /></g>; };
const Expert: React.FC<{id: string; c: C25; ex: Ex; part: 'back' | 'front'}> = ({id, c, ex, part}) => { const q = pz(c, ex.X, 0, ex.Z);
	return <Sil id={id} x={q[0]} y={q[1]} k={kz(c, ex.Z)} flip={ex.flip} rim="#FFE6C0" lx={1} ly={-0.2} fill="#1C1E24" rimW={3.4}><Body s={ex.s} dress="zsz" hat="cadre" part={part} /></Sil>; };

/* ============================== W1 · 109.78 daylight floods in: the expert walks in, stops, crouches, wipes the flange ============================== */
const WC0: C25 = {x: -70, y: -80, z: 0, f: 1800, cx: 960, cy: 560}, WC1: C25 = {x: -46, y: -66, z: 90, f: 1800, cx: 960, cy: 560};
const W_STOP = 111.12;
/** the expert from the walk-in to W2: walk in → crouch → wipe (zH = where the wiping hand is on the flange) */
const expertW1 = (c: C25, t: number, zcam: Cam): Ex => {
	const u = seg(t, 109.5, W_STOP), g = (x: number) => (x < 0.6 ? x : x - (x - 0.6) * (x - 0.6) / 0.8) / 0.8, sp = WL * 4 * g(u);
	const walk = walkPose(c, WP0, WP1, sp, WL, false);
	if (t < W_STOP) return walk;
	const hs = pz(c, walk.X, 0, walk.Z), k = kz(c, walk.Z);
	const toL = (m: V3) => { const q = proj(zcam, m); return loc([q[0], q[1]], hs[0], hs[1], k, true); };
	const st0 = walk.s, fN = st0.fN, fF = st0.fF;
	const zH = t < 111.62 ? 24 : t < 111.98 ? lerp(24, 12, ease(seg(t, 111.62, 111.95))) : t < 112.02 ? lerp(12, 24, ease(seg(t, 111.98, 112.02))) : lerp(24, 12, ease(seg(t, 112.02, 112.36)));
	const onFl = toL([Rz(zH)[0] + 2.6, -0.4, zH]);
	const crouchK: [number, FK][] = [
		[W_STOP, {hip: st0.hip, lean: 5, neck: 6, tilt: 6, fN, fF, hN: st0.hN, hF: st0.hF}],
		[111.6, {hip: [-6, -52], lean: 36, neck: 14, tilt: 30, fN: [fN[0] + 2, fN[1]], fF: [fF[0] - 4, -6], hN: onFl, hF: [22, -60]}],
		[113, {hip: [-6, -52], lean: 36, neck: 14, tilt: 30, fN: [fN[0] + 2, fN[1]], fF: [fF[0] - 4, -6], hN: onFl, hF: [22, -60]}]];
	const fk = track(crouchK, t, mixFK);
	return {X: walk.X, Z: walk.Z, s: poseFK({...fk, hN: t >= 111.6 ? onFl : fk.hN, toeF: t > 111.35 ? -1 : undefined}), flip: true}; };
const SW1: React.FC<{t: number}> = ({t}) => { const c = mixC(WC0, WC1, eio(seg(t, 110.3, 113.0)));
	const cam = zc25(c, WZ.x, WZ.y, WZ.z, WZ.az), zk = kz(c, WZ.z), ex = expertW1(c, t, cam);
	const flood = Math.pow(1 - seg(t, 109.78, 110.2), 2), bk = proj(cam, [0, 18.4, 34.1]);
	const wiped = seg(t, 111.62, 111.95) * 0.5 + seg(t, 112.02, 112.36) * 0.5;
	const dust = t > 111.62 ? Array.from({length: 22}, (_, i) => { const t0 = 111.62 + (i / 22) * 0.75, a = t - t0; if (a < 0 || a > 0.9) return null; const q = proj(cam, [Rz(18)[0] + 3, 0, 24 - 12 * rnd(i, 4)]);
		return <circle key={i} cx={q[0] + 30 * a + 10 * rnd(i, 5)} cy={q[1] + 260 * a * a + 40 * a} r={2 + 3 * rnd(i, 6)} fill="#8A7458" opacity={0.85 * (1 - a / 0.9)} />; }) : null;
	return <Shell id="W1" t={t} bg="#3A4A5E" vig={0.45}>
		<YardMorning c={c} t={t} />
		<Expert id="w1e" c={c} ex={ex} part="back" />
		<Zun cam={cam} light={rotL(LMo, WZ.az)} id="w1z" patina={0.95} shadow={false} inscription={false} />
		<Wiped cam={cam} w={wiped} k={zk} />
		<Tag30w x={bk[0] + 3 * zk} y={bk[1] + 7 * zk} rot={6 + 4 * Math.sin(t * 1.7)} anchor={[bk[0], bk[1]]} s={9 * zk / 66} id="w1t" />
		<PileFront c={c} />
		<Expert id="w1f" c={c} ex={ex} part="front" />
		{dust}
		<rect width={W} height={H} fill="#FFE8C4" opacity={0.7 * flood} />
	</Shell>; };

/* ============================== W2 · 112.40 the two thirties: 30 朋 → 30 元; lifted, carried out of the gate into the light ============================== */
/** 何's hands from above (the card-F layout): robe cuffs from the bottom, two palms cupped side by side, fingers toward the top
    as a scalloped silhouette edge, thumbs folded in; warm-dark, rim-lit by the lamp */
const HANDS_C: P = [935, 640];
const HandsUp2: React.FC = () => { const hand = (cx: number, m: number) => { const X = (u: number) => cx + m * u;
	const fingers = [[-40, 548, 0.06], [-17, 522, 0.02], [7, 520, -0.02], [30, 536, -0.07]].map(([u, y, a], i) => { const x = X(u), w = 21 - (i === 3 ? 3 : 0), h = 92 - (i === 3 ? 14 : 0) - (i === 0 ? 6 : 0);
		return <path key={i} d={sm([[x - w / 2, y + h], [x - w / 2 + m * a * 40, y + 14], [x + m * a * 60, y], [x + w / 2 + m * a * 40, y + 14], [x + w / 2, y + h]])} />; });
	return <g>
		<g fill="#7A4A2E">{fingers}
			<path d={sm([[X(-62), 800], [X(-68), 690], [X(-56), 620], [X(-20), 600], [X(28), 606], [X(52), 640], [X(58), 720], [X(52), 800]])} />
			<path d={sm([[X(52), 720], [X(84), 680], [X(96), 640], [X(86), 626], [X(66), 650], [X(48), 676]])} /></g>
		<path d={sm([[X(-44), 770], [X(-48), 690], [X(-30), 640], [X(4), 628], [X(32), 646], [X(38), 700], [X(30), 770]])} fill="#5A3420" />
		<path d={sm([[X(-68), 690], [X(-56), 620], [X(-50), 560], [X(-40), 548]], false)} stroke="#FFD8A8" strokeWidth={3.5} fill="none" opacity={0.75} />
		{[[-40, 548], [-17, 522], [7, 520], [30, 536]].map(([u, y], i) => <path key={i} d={`M${f1(X(u) - 8)},${f1(y + 8)} Q${f1(X(u))},${f1(y - 3)} ${f1(X(u) + 8)},${f1(y + 8)}`} stroke="#FFC890" strokeWidth={2.5} fill="none" opacity={0.6} />)}
		{/* the robe cuff */}
		<path d={sm([[X(-92), 1240], [X(-96), 860], [X(-80), 790], [X(-10), 770], [X(66), 790], [X(84), 860], [X(80), 1240]])} fill="#3E1610" />
		<path d={sm([[X(-96), 860], [X(-80), 790], [X(-10), 770], [X(66), 790], [X(84), 860]], false)} stroke="#B8603A" strokeWidth={9} fill="none" opacity={0.75} />
		<path d={sm([[X(-80), 790], [X(-10), 770], [X(66), 790]], false)} stroke="#FFC890" strokeWidth={2.5} fill="none" opacity={0.5} />
	</g>; };
	return <g>{hand(HANDS_C[0] - 72, 1)}{hand(HANDS_C[0] + 72, -1)}</g>; };
/** the cowries pouring into 何's cupped hands, top-down (the callback to card F: the same mat, basket and strings) */
const Cowries: React.FC<{t: number}> = ({t}) => { const ps = 1 + 0.1 * ease(seg(t, 112.4, 114.2)), rotA = lerp(3, 6, seg(t, 112.4, 114.2));
	const BASK: P = [1340, 190], tip = 1, lip: P = [BASK[0] - 150 * tip - 30, BASK[1] + 130 * tip + 40];
	const strs = Array.from({length: 11}, (_, i) => { const t0 = 111.55 + i * 0.2, T = 0.42; if (t < t0 - 0.05) return null;
		const land: P = [HANDS_C[0] + (rnd(i, 6) - 0.5) * 170, 650 + (rnd(i, 7) - 0.5) * 100 - i * 3], ang = (rnd(i, 5) - 0.5) * 1.2, dir = ang + (i % 2 ? Math.PI : 0), curl = 0.5 + 0.5 * rnd(i, 9);
		const head = (tau: number): P => { if (tau <= 0) return [lip[0] + 300 * tau, lip[1] - 200 * tau]; const u = Math.min(1, tau / T), e = u * u; return [lerp(lip[0], land[0], e), lerp(lip[1], land[1], e) - 60 * Math.sin(Math.PI * u) * (1 - u)]; };
		const rest = (m: number): P => { const a = dir + curl * Math.sin(m * 0.7 + i); return [land[0] + Math.cos(a) * m * 46, land[1] + Math.sin(a) * m * 28]; };
		const pts = Array.from({length: 8}, (_, m) => { const tau = t - t0 - m * 0.05; if (tau <= T) return head(tau); const v = ease(Math.min(1, (tau - T) / 0.12)), r = rest(m); return [lerp(land[0], r[0], v), lerp(land[1], r[1], v)] as P; });
		const since = t - t0 - T, bounce = since > 0 ? 7 * Math.exp(-since * 10) * Math.abs(Math.sin(since * 28)) : 0;
		const lit = (k: number) => since > 0 ? cl(0.15 + Math.exp(-since * 3.5) * (rnd(i * 12 + k, 3) > 0.55 ? 1 : 0.35)) : 0.15;
		return <CowrieString key={i} pts={pts.map(([x, y]) => [x, y - bounce] as P)} n={12} r={15} lit={lit} seed={i * 5} />; });
	return <g transform={`translate(960 640) rotate(${f1(rotA)}) scale(${ps.toFixed(4)}) translate(-960 -640)`}>
		<defs><pattern id="w2mat" width="44" height="44" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="44" height="44" fill="#4A3220" /><rect width="22" height="44" fill="#553A26" /><path d="M0,0 L44,0 M0,22 L44,22" stroke="#2E1E12" strokeWidth={2} /></pattern></defs>
		<rect x={-400} y={-400} width={2800} height={1900} fill="url(#w2mat)" />
		<rect x={-400} y={-400} width={2800} height={1900} fill="#140A05" opacity={0.6} />
		<Glow x={1150} y={420} r={950} c="#FFB060" o={0.3} id="w2lm" />
		<HandsUp2 />
		{strs}
		{/* the servant's sleeves and the tipped basket at the top right */}
		<path d={sm([[1080, -200], [1180, -200], [1200, 120], [1170, 200], [1110, 170], [1070, 40]])} fill="#2E1A10" /><path d={sm([[1500, -200], [1620, -200], [1610, 60], [1560, 180], [1500, 190], [1480, 100]])} fill="#2E1A10" />
		<g transform={`translate(${BASK[0]} ${BASK[1]}) rotate(-38) scale(0.62 1) rotate(38)`}>
			<ellipse rx={172} ry={172} fill="#6A4A26" /><ellipse rx={172} ry={172} fill="none" stroke="#3A2414" strokeWidth={12} />
			{Array.from({length: 18}, (_, i) => <path key={i} d={`M0,0 L${f1(162 * Math.cos((i / 18) * 2 * Math.PI))},${f1(162 * Math.sin((i / 18) * 2 * Math.PI))}`} stroke="#4A3018" strokeWidth={3} opacity={0.7} />)}
			<ellipse rx={136} ry={136} fill="#24160C" opacity={0.85} />
			<path d="M-172,0 A172,172 0 0 1 172,0" fill="none" stroke="#FFD8A0" strokeWidth={4} opacity={0.4} /></g>
		<path d={sm([[1150, 150], [1190, 130], [1210, 170], [1190, 210], [1150, 200]])} fill="#56301E" /><path d={sm([[1500, 150], [1540, 140], [1556, 180], [1530, 214], [1494, 200]])} fill="#56301E" />
	</g>; };
/* the tag on the +y beak (seen at the right of the 尊 from az −35): its world anchor and hole */
const BEAKW = zw([0, 18.4, 34.1], WZ.x, WZ.y, WZ.z, WZ.az);
const tagGeom = (c: C25, rot: number) => { const b = pz(c, BEAKW[0], BEAKW[1], BEAKW[2]), k = kz(c, BEAKW[2]), s = 9 * k / 66, hole: P = [b[0] + 3 * k, b[1] + 7 * k];
	const a = rot * D2R, grip = (h: P): P => [h[0] + Math.cos(a) * 46 * s - Math.sin(a) * 14 * s, h[1] + Math.sin(a) * 46 * s + Math.cos(a) * 14 * s];
	return {b, k, s, hole, grip}; };
const WCtag: C25 = {x: BEAKW[0] + 4.5, y: BEAKW[1] + 4.5, z: BEAKW[2] - 72, f: 1800, cx: 960, cy: 540}, WCmed: C25 = {x: -16, y: -78, z: -70, f: 1800, cx: 960, cy: 560},
	WCgate: C25 = {x: 175, y: -108, z: 120, f: 1800, cx: 960, cy: 560};
const WG1: P = [GATE.x0 + 70, GATE.z + 30];   /* out through the gate */
const W_UP0 = 115.25, W_UP1 = 116.05, W_FLIP = 116.3, W_GO = 116.5;
const SW2: React.FC<{t: number}> = ({t}) => {
	const pull = eio(seg(t, 114.45, 116.05)), go = eio(seg(t, 116.1, 118.83));
	const c = t < 116.05 ? mixC(WCtag, WCmed, pull) : mixC(WCmed, WCgate, go);
	const camPile = zc25(c, WZ.x, WZ.y, WZ.z, WZ.az);
	const exW1 = expertW1(c, 112.39, camPile), fN = exW1.s.fN, fF = exW1.s.fF;
	const hs0 = pz(c, exW1.X, 0, exW1.Z), k0 = kz(c, exW1.Z);
	const toL = (q: P) => loc(q, hs0[0], hs0[1], k0, true);
	const toLm = (m: V3) => { const q = proj(camPile, m); return toL([q[0], q[1]]); };
	/* the tag: hanging; pulled taut by his fingers; torn off at the bar (114.31) and carried away to his pocket */
	const taut = ss(113.95, 114.28, t), rot = t < 114.31 ? 6 + 4 * Math.sin(t * 1.7) * (1 - taut) - 34 * taut : -40;
	const tg = tagGeom(c, rot), gripPt = tg.grip(tg.hole);
	const rip = t >= 114.31, ra = ss(114.31, 114.45, t), pocket = ss(114.45, 114.85, t);
	let hand: P = gripPt;
	if (rip) { const g0 = tagGeom(c, -40).grip(tagGeom(c, -40).hole), jerk = add2(g0, [10 * tg.k * ra, -7 * tg.k * ra]); hand = jerk; }
	const handL = toL(hand);
	const neck = toLm([0, 15.5, 30]), foot = toLm([0, -6, 6]), flange = toLm([Rz(12)[0] + 2.6, -0.4, 12]);
	const KX: [number, FK][] = [
		[112.4, {hip: [-6, -52], lean: 36, neck: 14, tilt: 30, fN, fF, hN: flange, hF: [22, -60]}],
		[113.85, {hip: [-6, -52], lean: 34, neck: 14, tilt: 26, fN, fF, hN: handL, hF: [22, -60]}],
		[114.31, {hip: [-6, -53], lean: 33, neck: 14, tilt: 26, fN, fF, hN: handL, hF: [22, -60]}],
		[114.45, {hip: [-6, -54], lean: 31, neck: 12, tilt: 22, fN, fF, hN: handL, hF: [22, -60]}],
		[114.85, {hip: [-6, -55], lean: 26, neck: 10, tilt: 18, fN, fF, hN: [12, -100], hF: [22, -60]}],
		[114.98, {hip: [-6, -55], lean: 26, neck: 10, tilt: 18, fN, fF, hN: [12, -100], hF: [22, -60]}],
		[W_UP0, {hip: [-5, -52], lean: 38, neck: 14, tilt: 30, fN, fF, hN: foot, hF: neck}],
		[W_UP1, {hip: [0, -89], lean: -3, neck: 10, tilt: 12, fN: [WL / 2, -7], fF: [-WL / 2, -7], hN: CARRY_N, hF: CARRY_F}],
		[W_GO, {hip: [0, -89], lean: -3, neck: 10, tilt: 12, fN: [WL / 2, -7], fF: [-WL / 2, -7], hN: CARRY_N, hF: CARRY_F}]];
	const before = t < 113.85 ? 0 : 1;
	void before;
	let ex: Ex, held: P | null = null, heldZ = WZ.z, tilt = 0, flipNow = true;
	if (t < W_GO) {
		const fk = track(KX, t, mixFK), liftU = ease(seg(t, W_UP0, W_UP1));
		/* the turn: it comes in to the chest, he turns (a shadow-play turn on a symmetric stance), it goes back out */
		const swing = t < W_FLIP ? 1 - ss(W_UP1, W_FLIP, t) : ss(W_FLIP, W_GO, t);
		flipNow = t < W_FLIP;
		const cx = lerp(2, CARRY_B[0], swing);
		const hN = t >= W_UP1 ? ([cx + 2, CARRY_N[1]] as P) : fk.hN, hF = t >= W_UP1 ? ([cx, CARRY_F[1]] as P) : fk.hF;
		const s = poseFK({...fk, hN, hF, toeF: t < (W_UP0 + W_UP1) / 2 ? -1 : 1});
		ex = {X: exW1.X, Z: exW1.Z, s, flip: flipNow};
		if (t >= W_UP0) { const sg = flipNow ? -1 : 1, base = add2(hs0, [sg * (t >= W_UP1 ? cx : lerp(CARRY_B[0], CARRY_B[0], 1)) * k0, (t >= W_UP1 ? CARRY_B[1] : -95) * k0]);
			const pileB = pz(c, WZ.x, WZ.y, WZ.z), hb = t >= W_UP1 ? base : lerpP(pileB, add2(hs0, [-CARRY_B[0] * k0, CARRY_B[1] * k0]), liftU);
			held = hb; heldZ = lerp(WZ.z, exW1.Z - 8, t >= W_UP1 ? 1 : liftU); tilt = 7 * Math.sin(Math.PI * liftU); }
	} else {
		const L = 68, A: P = [exW1.X, exW1.Z], sp = Math.hypot(WG1[0] - A[0], WG1[1] - A[1]) * cl((t - W_GO) / (118.95 - W_GO));
		ex = walkPose(c, A, WG1, sp, L, true); flipNow = false;
		const hs = pz(c, ex.X, 0, ex.Z), k = kz(c, ex.Z); held = add2(hs, [CARRY_B[0] * k, (CARRY_B[1] + ex.s.hip[1] + 89) * k]); heldZ = ex.Z - 8; tilt = 1.2 * Math.sin(t * 11);
	}
	let zx = WZ.x, zy = WZ.y, zz = WZ.z;
	if (held) { const kh = kz(c, heldZ); zx = c.x + (held[0] - c.cx) / kh; zy = c.y + (held[1] - c.cy) / kh; zz = heldZ; }
	const cam = zc25(c, zx, zy, zz, WZ.az), zk = kz(c, zz), bs = pz(c, zx, zy, zz);
	const gate = ss(117.7, 118.83, t), mix = ss(113.75, 114.2, t);
	/* the tag: hanging from the beak; pinched and pulled taut; at the bar (114.31) its string SNAPS: the upper half recoils on the
	   beak, the tag goes off in his hand with the lower half dangling, then into his pocket */
	const s9 = tg.s, len = Math.hypot(tg.hole[0] - tg.b[0], tg.hole[1] - tg.b[1]) * 1.1, aa = t - 114.31, sw = rip ? 26 * Math.exp(-aa * 2.6) * Math.sin(aa * 12) : 0;
	let tag: React.ReactNode = null, hc: P = hand;
	if (rip && pocket > 0) hc = add2(pz(c, ex.X, 0, ex.Z), [-ex.s.hN[0] * kz(c, ex.Z), ex.s.hN[1] * kz(c, ex.Z)]);
	const upper = rip ? <path d={`M${f1(tg.b[0])},${f1(tg.b[1])} q${f1(sw * 0.5)},${f1(len * 0.3)} ${f1(sw)},${f1(len * 0.5 - 4 * Math.exp(-aa * 6))}`} fill="none" stroke="#D8C8A6" strokeWidth={Math.max(1.2, 1.7 * s9)} strokeLinecap="round" /> : null;
	if (!rip) tag = <Tag30w x={tg.hole[0]} y={tg.hole[1]} rot={rot} anchor={tg.b} s={s9} id="w2tg" />;
	else if (pocket < 1) { const a0 = -40 * D2R, hole: P = [hc[0] - (Math.cos(a0) * 46 * s9 - Math.sin(a0) * 14 * s9), hc[1] - (Math.sin(a0) * 46 * s9 + Math.cos(a0) * 14 * s9)];
		tag = <g opacity={1 - pocket}>
			<path d={`M${f1(hole[0])},${f1(hole[1])} q${f1(-4 * s9 - sw * 0.3)},${f1(len * 0.25)} ${f1(-6 * s9 - sw * 0.6)},${f1(len * 0.45)}`} fill="none" stroke="#D8C8A6" strokeWidth={Math.max(1.2, 1.7 * s9)} strokeLinecap="round" />
			<Tag30w x={hole[0]} y={hole[1]} rot={-40} s={s9} id="w2tg2" /></g>; }
	const snapPt = lerpP(tg.b, tg.hole, 0.5), fibers = rip && aa < 0.35 ? <g>{Array.from({length: 9}, (_, i) => { const an = (rnd(i, 8) - 0.5) * 2.6 - 1.2, r1 = 30 + 260 * aa * (0.5 + rnd(i, 9));
		return <path key={i} d={`M${f1(snapPt[0] + Math.cos(an) * r1 * 0.6)},${f1(snapPt[1] + Math.sin(an) * r1 * 0.6)} l${f1(Math.cos(an) * 10)},${f1(Math.sin(an) * 10)}`} stroke="#F2E6CC" strokeWidth={2} strokeLinecap="round" opacity={1 - aa / 0.35} />; })}</g> : null;
	/* in the close-up, his hand: a real pinch (fingers, thumb), the 中山装 cuff */
	const handK = kz(c, exW1.Z), pinch = t < 114.95 && pull < 0.5;
	const handEl = pinch ? <Sil id="w2ph" x={hc[0] + 12.5 * handK} y={hc[1] + 1.5 * handK} k={handK} flip rim="#FFE6C0" lx={1} ly={-0.4} fill="#22201E" rimW={3}><g transform="rotate(-14)">
		<path d={tube([-30, 0.6], [-6, 0], 5.4, 4.8)} fill="#1C1E24" /><path d={sm([[-8, -5.8], [-3, -5.4], [-3, 5.6], [-8, 6.2]])} fill="#2A2C34" /><GripHand arm={6} /></g></Sil> : null;
	const yard = <>
		<YardMorning c={c} t={t} gate={gate} />
		<Expert id="w2e" c={c} ex={ex} part="back" />
		<g transform={`rotate(${f1(ex.flip ? -tilt : tilt)} ${f1(bs[0])} ${f1(bs[1])})`}>
			<Zun cam={cam} light={rotL(LMo, WZ.az)} id="w2z" patina={0.95} shadow={false} inscription={false} />
			<Wiped cam={cam} w={1} k={zk} />
		</g>
		{upper}
		<PileFront c={c} />
		<Expert id="w2f" c={c} ex={ex} part="front" />
		{handEl}{tag}{fibers}
		<rect width={W} height={H} fill="#FFF4DC" opacity={0.92 * ease(seg(t, 118.3, 118.83))} />
	</>;
	return <Shell id="W2" t={t} bg="#2A2018" vig={0.45}>
		{mix < 1 && <Cowries t={t} />}
		{mix > 0 && <g opacity={mix}>{yard}</g>}
	</Shell>; };

/* ============================== 1975 · the 故宫 restoration room (a real 3D set in zun coords, so the camera can rise) ============================== */
const RAZ = 205;   /* the view azimuth in X1–X3 (the inscription reads upright from here) */
const rbasis = (az: number) => { const ps = (az + 180) * D2R; return {R: [Math.sin(ps), -Math.cos(ps)] as P, B: [Math.cos(ps), Math.sin(ps)] as P}; };
/** a room point: xr along the view's right, yb away from the camera, z up (for the view azimuth az) */
const rp = (az: number, xr: number, yb: number, z: number): V3 => { const {R, B} = rbasis(az); return [xr * R[0] + yb * B[0], xr * R[1] + yb * B[1], z]; };
const quad = (cam: Cam, az: number, pts: [number, number, number][]) => { const q = pts.map(([a, b, z]) => proj(cam, rp(az, a, b, z))); if (q.some((p) => p[2] < 2)) return ''; return 'M' + q.map((p) => `${f1(p[0])},${f1(p[1])}`).join('L') + 'Z'; };
const LRoomOff: ZunLight = {dir: [-0.2, 0.7, 0.6], col: '#8A9AB8', k: 0.35, amb: 0.14, ambCol: '#2A3240', spec: 0.2, shin: 12, inside: 0.1};
const LRoomOn: ZunLight = {dir: [0.35, -0.62, 0.7], col: '#FFE0B0', k: 1.55, amb: 0.26, ambCol: '#4A5260', spec: 0.75, shin: 16, rim: {dir: [-0.5, 0.8, 0.3], col: '#9AAAC0', k: 0.4}, inside: 0.55};
const Room1975: React.FC<{cam: Cam; on: number; dark?: number}> = ({cam, on, dark = 0}) => { const A = RAZ;
	const Q = (pts: [number, number, number][]) => quad(cam, A, pts);
	const p2 = (q: [number, number, number]): P => [q[0], q[1]];
	const lampBase = p2(proj(cam, rp(A, -64, 16, 0))), joint = p2(proj(cam, rp(A, -74, 10, 32))), piv = p2(proj(cam, rp(A, -44, -2, 52))), tgt = p2(proj(cam, [0, 0, 36])), k = pxk(cam, rp(A, -44, -2, 52));
	const dd = nz2([tgt[0] - piv[0], tgt[1] - piv[1]]), nn: P = [-dd[1], dd[0]], M = add2(piv, dd, 13 * k), Bk = add2(piv, dd, -1.5 * k);
	const shadeD = pth([add2(Bk, nn, 2.6 * k), add2(Bk, nn, -2.6 * k), add2(M, nn, -8 * k), add2(M, nn, 8 * k)]);
	const mouthD = (rr: number) => sm(Array.from({length: 16}, (_, i) => { const a = (i / 16) * 2 * Math.PI; return add2(add2(M, nn, Math.cos(a) * 8 * k * rr), dd, Math.sin(a) * 2.6 * k * rr); }));
	const bulb = add2(M, dd, -1.2 * k), pool = p2(proj(cam, [0, 0, 0]));
	const coneD = pth([add2(M, nn, 7.6 * k), add2(M, nn, -7.6 * k), add2(pool, nn, -48 * k), add2(pool, nn, 48 * k)]);
	return <g>
		<rect width={W} height={H} fill="#121010" />
		{/* the back wall, the window onto the palace: a red wall and a yellow-glazed roof in the night (lit faintly) */}
		<path d={Q([[-600, 160, -100], [600, 160, -100], [600, 160, 420], [-600, 160, 420]])} fill="#1E1B19" />
		{/* the back wall: a dim shelf of jars and bottles (a restorers' room), low contrast */}
		<path d={Q([[40, 156, -40], [150, 156, -40], [150, 156, 96], [40, 156, 96]])} fill="#191614" />
		{[0, 32, 64].map((z, i) => <path key={i} d={Q([[40, 155, z], [150, 155, z], [150, 155, z + 2.5], [40, 155, z + 2.5]])} fill="#2A2420" />)}
		{[[50, 2.5, 14, 7], [66, 2.5, 20, 6], [84, 2.5, 11, 8], [100, 34.5, 16, 7], [118, 34.5, 22, 6], [58, 34.5, 12, 9], [76, 66.5, 18, 7], [96, 66.5, 13, 8], [130, 2.5, 17, 7]].map(([x, z, h, w], i) =>
			<path key={`j${i}`} d={Q([[x - w / 2, 154.8, z], [x + w / 2, 154.8, z], [x + w / 2, 154.8, z + h * 0.8], [x + w * 0.3, 154.8, z + h], [x - w * 0.3, 154.8, z + h], [x - w / 2, 154.8, z + h * 0.8]])} fill={i % 3 ? '#221E1B' : '#26302E'} />)}
		{/* the bench: top, front, a felt pad under the 尊, tools */}
		<path d={Q([[-320, -110, 0], [320, -110, 0], [320, 110, 0], [-320, 110, 0]])} fill="#3A2C22" />
		<path d={Q([[-320, -110, 0], [320, -110, 0], [320, -110, -90], [-320, -110, -90]])} fill="#1E1612" />
		<path d={Q([[-34, -32, 0.2], [34, -32, 0.2], [34, 32, 0.2], [-34, 32, 0.2]])} fill="#2E3A30" />
		{[0, 1, 2].map((i) => <path key={i} d={Q([[150 + i * 16, 40, 0.3], [160 + i * 16, 40, 0.3], [160 + i * 16, 40, 18 - i * 3], [150 + i * 16, 40, 18 - i * 3]])} fill="#3A4A50" opacity={0.85} />)}
		<path d={Q([[100, -30, 0.3], [150, -30, 0.3], [150, -10, 0.3], [100, -10, 0.3]])} fill="#BDB6A8" opacity={0.75} />
		{[0, 1, 2, 3].map((i) => <path key={i} d={Q([[104 + i * 11, -26, 0.6], [110 + i * 11, -26, 0.6], [112 + i * 11, -14, 0.6], [106 + i * 11, -14, 0.6]])} fill="#8A8A8A" />)}
		{/* the light: a warm cone and pool when the lamp is on */}
		{on > 0 && <><Glow x={pool[0]} y={pool[1]} r={60 * k} c="#FFD9A0" o={0.5 * Math.min(1, on)} id="r4pool" sy={0.5} />
			<path d={coneD} fill="#FFE2B0" opacity={0.1 * Math.min(1, on)} /></>}
		{/* the desk lamp: a weighted base, two arms with a joint, a green enamel shade, the bulb in its mouth */}
		<ellipse cx={lampBase[0]} cy={lampBase[1]} rx={8 * k} ry={2.6 * k} fill="#151412" />
		<path d={`M${f1(lampBase[0])},${f1(lampBase[1] - 1.5 * k)} L${f1(joint[0])},${f1(joint[1])} L${f1(piv[0])},${f1(piv[1])}`} stroke="#151412" strokeWidth={Math.max(3, 1.3 * k)} fill="none" strokeLinejoin="round" strokeLinecap="round" />
		<path d={`M${f1(lampBase[0] + 2 * k)},${f1(lampBase[1] - 4 * k)} L${f1(joint[0] + 2 * k)},${f1(joint[1] + 2 * k)}`} stroke="#3A3632" strokeWidth={Math.max(1, 0.4 * k)} strokeDasharray={`${f1(0.6 * k)} ${f1(0.5 * k)}`} />
		<circle cx={joint[0]} cy={joint[1]} r={1.3 * k} fill="#22201C" /><circle cx={piv[0]} cy={piv[1]} r={1.2 * k} fill="#22201C" />
		<path d={shadeD} fill="#2C4438" /><path d={`M${f1(add2(Bk, nn, 2.6 * k)[0])},${f1(add2(Bk, nn, 2.6 * k)[1])} L${f1(add2(M, nn, 8 * k)[0])},${f1(add2(M, nn, 8 * k)[1])}`} stroke="#8AB0A0" strokeWidth={Math.max(1, 0.35 * k)} opacity={0.5 + 0.3 * Math.min(1, on)} />
		<path d={mouthD(1)} fill={on > 0 ? '#FFF2D2' : '#3A3830'} />
		<circle cx={bulb[0]} cy={bulb[1]} r={3 * k} fill={on > 0 ? '#FFFBEE' : '#6A665C'} />
		{on > 0 && <Glow x={bulb[0]} y={bulb[1]} r={22 * k * (0.8 + 0.4 * Math.min(1.6, on))} c="#FFF0D0" o={0.85} id="r4bulb" />}
		{dark > 0 && <rect width={W} height={H} fill="#050404" opacity={dark} />}
	</g>; };
type V3n = [number, number, number];
const sub3 = (a: V3n, b: V3n): V3n => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add3 = (a: V3n, b: V3n, k = 1): V3n => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const scale3 = (a: V3n, k: number): V3n => [a[0] * k, a[1] * k, a[2] * k];
const nz3 = (a: V3n): V3n => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const cross3 = (a: V3n, b: V3n): V3n => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const hull2 = (pts: P[]): P[] => { const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]); if (p.length < 3) return p; const cr = (o: P, a: P, b: P) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
	const lo: P[] = []; for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
	const up: P[] = []; for (const q of [...p].reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
	return [...lo.slice(0, -1), ...up.slice(0, -1)]; };

/* ============================== X1 · 118.83 the hardest drop: the lamp clicks on; gloved hands tilt the 尊; the camera descends to the mouth ============================== */
const X1A: CP = {az: RAZ, el: 9, D: 360, T: [0, 0, 19.4], f: 4100, cx: 960, cy: 600},
	X1C: CP = {az: RAZ, el: 62, D: 150, T: [0, 0, 30], f: 3900, cx: 1000, cy: 640};
const SX1: React.FC<{t: number}> = ({t}) => {
	const t0 = 118.83, on = t >= t0 ? (t < t0 + 0.02 ? 0.45 : 1) : 0, flash = on ? Math.exp(-(t - t0) * 9) : 0;
	/* one continuous crane, already moving at the cut and still moving into X2 */
	const v = seg(t, 118.3, 124.2), p = mixCP(X1A, X1C, (1 - Math.cos(Math.PI * v)) / 2);
	const cam = camOf(p);
	const tilt = -11 * ss(119.35, 120.15, t) * (1 - ss(120.85, 121.45, t));
	/* the pivot: the screen-left edge of its foot */
	const foot = Array.from({length: 24}, (_, i) => proj(cam, [10 * Math.cos((i / 24) * 2 * Math.PI), 10 * Math.sin((i / 24) * 2 * Math.PI), 0])), piv = foot.reduce((a, q) => (q[0] < a[0] ? q : a));
	const k = pxk(cam, [0, 0, 19.4]);
	const flL = proj(cam, [0, 14.8, 10]), flR = proj(cam, [0, -14.8, 10]);
	const grip = ss(118.95, 119.35, t) * (1 - ss(121.5, 122.2, t));
	const L: ZunLight = on ? {...LRoomOn, k: LRoomOn.k * (1 + 0.5 * flash)} : LRoomOff;
	return <Shell id="X1" t={t} bg="#0C0A09" vig={0.62}>
		<Room1975 cam={cam} on={on * (1 + 0.6 * flash)} />
		<g transform={`rotate(${f1(tilt)} ${f1(piv[0])} ${f1(piv[1])})`}>
			<Zun cam={cam} light={L} id="x1z" patina={0.82} reveal={0} shadow={true} />
			{grip > 0.01 && <>
				<RestHand x={flL[0] - 4.5 * k - 220 * (1 - grip)} y={flL[1] + 6 * k + 140 * (1 - grip)} k={k} rot={-48} o={cl(grip * 4)} />
				<RestHand x={flR[0] + 4.5 * k + 220 * (1 - grip)} y={flR[1] + 6 * k + 140 * (1 - grip)} k={k} rot={-48} flip o={cl(grip * 4)} />
			</>}
		</g>
		{on > 0 && <Rising t={t} n={40} x0={500} x1={1400} y0={150} y1={900} c="#FFE8C0" seed={191} v={18} o={0.4} r={2} sway={20} />}
		{flash > 0.02 && <rect width={W} height={H} fill="#FFE8C0" opacity={0.18 * flash} />}
	</Shell>; };

/* ============================== the inscription floor (the zun55h layout, for the per-column crust) ============================== */
const TOP_A = Math.PI / 4, COLW = 1.12, ROWH = 1.16;
const fl3 = (u: number, v: number): V3 => { const du = [Math.cos(TOP_A - Math.PI / 2), Math.sin(TOP_A - Math.PI / 2)], dv = [-Math.cos(TOP_A), -Math.sin(TOP_A)]; return [du[0] * u + dv[0] * v, du[1] * u + dv[1] * v, ZUN.FLOOR + 0.05]; };
const colU = (c: number) => (5.5 - c) * COLW;
/** column c's crust lifts at T(c): one column per half beat from G(26.5) */
const XT = (c: number) => G(25.5) + c * BEAT / 2;   /* 124.21 → 127.33, on the half beats */
const Crust: React.FC<{cam: Cam; t: number; id: string}> = ({cam, t, id}) => {
	const floor = Array.from({length: 64}, (_, j) => { const a = (j / 64) * 2 * Math.PI, rr = 6.55 * rho(a, 2.75); return proj(cam, [rr * Math.cos(a), rr * Math.sin(a), ZUN.FLOOR + 0.05]); });
	const flD = 'M' + floor.map((q) => `${f1(q[0])},${f1(q[1])}`).join('L') + 'Z';
	const k = pxk(cam, [0, 0, ZUN.FLOOR]);
	const P2 = (u: number, v: number): P => { const q = proj(cam, fl3(u, v)); return [q[0], q[1]]; };
	const flakes: React.ReactNode[] = [];
	for (let c = 0; c < 12; c++) { const T = XT(c), u0 = colU(c) - COLW / 2 - 0.04, u1 = colU(c) + COLW / 2 + 0.04;
		for (let j = 0; j < 5; j++) { const v0 = -7.2 + j * 2.88, v1 = v0 + 2.92, jj = c % 2 ? 4 - j : j, p = seg(t, T - 0.2 + jj * 0.05, T + 0.12 + jj * 0.05);
			if (p >= 1) continue;
			const pts: P[] = []; const n = 7;
			for (let i = 0; i <= n; i++) pts.push(P2(u0 + (rnd(c * 9 + j, i) - 0.5) * 0.12, lerp(v0, v1, i / n)));
			for (let i = 0; i <= n; i++) pts.push(P2(u1 + (rnd(c * 9 + j + 50, i) - 0.5) * 0.12, lerp(v1, v0, i / n)));
			const d = 'M' + pts.map((q) => `${f1(q[0])},${f1(q[1])}`).join('L') + 'Z';
			const lift = ease(cl(p * 1.6)), fly = ease(cl(p * 1.6 - 0.6)), col = ['#4E4430', '#574A34', '#4A4A38', '#53472F', '#45463A'][(c * 3 + j) % 5];
			const tx = (-0.8 * lift - 3.5 * fly) * k, ty = (-1.2 * lift + 1.8 * fly) * k, rot = (rnd(c, j) - 0.5) * 30 * fly;
			const m = P2(colU(c), (v0 + v1) / 2);
			flakes.push(<g key={`${c}_${j}`} opacity={1 - fly}>
				{lift > 0.02 && <path d={d} fill="#000" opacity={0.4} transform={`translate(${f1(0.6 * k * lift)},${f1(0.9 * k * lift)})`} />}
				<g transform={`translate(${f1(tx)},${f1(ty)}) rotate(${f1(rot)} ${f1(m[0])} ${f1(m[1])})`}>
					<path d={d} fill={col} />
					{Array.from({length: 5}, (_, i) => { const q = P2(lerp(u0, u1, rnd(c * 5 + j, i + 10)), lerp(v0, v1, rnd(c * 5 + j, i + 20))); return <ellipse key={i} cx={q[0]} cy={q[1]} rx={(0.18 + 0.2 * rnd(i, c + j)) * k} ry={(0.12 + 0.12 * rnd(i + 3, c + j)) * k} fill={i % 3 === 0 ? '#5C6A50' : i % 3 === 1 ? '#6E5E42' : '#3A3628'} opacity={0.55} />; })}
					{lift > 0.02 && <path d={d} fill="none" stroke="#FFE8C0" strokeOpacity={0.5 * lift} strokeWidth={1.2} />}
				</g></g>); } }
	return <g><defs><clipPath id={`${id}c`}><path d={flD} /></clipPath></defs><g clipPath={`url(#${id}c)`}>{flakes}</g></g>; };
/** a gloved hand holding a scalpel or a brush, seen from above: the wrist at (x, y), pointing at the tool tip (tx, ty) */
const ToolHand: React.FC<{id: string; x: number; y: number; tx: number; ty: number; k: number; tool: 'scalpel' | 'brush'}> = ({id, x, y, tx, ty, k, tool}) => { const a = Math.atan2(ty - y, tx - x) * 180 / Math.PI, Lt = Math.hypot(tx - x, ty - y) / k;
	return <Sil id={id} x={x} y={y} k={k} rim="#FFF2DC" lx={-0.6} ly={-0.8} fill="#CFC8BA" rimW={3}><g transform={`rotate(${f1(a)})`}>
		<path d={tube([-60, 0.5], [-8, 0], 6.6, 5.2)} fill="#D9D3C6" />
		<path d={sm([[-9, -5.4], [-1, -5.0], [-1, 5.2], [-9, 5.8]])} fill="#E6E0D4" />
		<path d={sm([[-1.5, -4.2], [4, -4.6], [8.5, -3.2], [10, 0], [8, 3.4], [3, 4.2], [-1.5, 3.8]])} />
		<path d={tube([6, -2.2], [12.5, -1.2], 1.15, 0.9)} /><path d={tube([3, -4.0], [11.5, -2.2], 1.25, 0.95)} />
		{tool === 'scalpel' ? <g><path d={pth([[8, -2.2], [Lt - 3, -0.45], [Lt - 3, 0.45], [8, 0.2]])} fill="#BFBFBA" /><path d={pth([[Lt - 3, -0.6], [Lt, 0], [Lt - 3, 0.5]])} fill="#F4F4EE" /></g>
			: <g><path d={pth([[8, -2.2], [Lt - 3.2, -0.6], [Lt - 3.2, 0.6], [8, 0.4]])} fill="#5A3A22" /><path d={sm([[Lt - 3.4, -1.0], [Lt - 0.6, -1.6], [Lt + 0.4, 0], [Lt - 0.6, 1.6], [Lt - 3.4, 1.0]])} fill="#D8B888" /></g>}
	</g></Sil>; };

/* ============================== X2 · 123.72 top-down into the mouth: the crust comes off column by column ============================== */
const X2A: CP = {az: 225, el: 86, D: 120, T: [0, 0, ZUN.FLOOR], f: 3900, cx: 1080, cy: 650}, X2B: CP = {az: 225, el: 87.5, D: 72, T: [0, 0, ZUN.FLOOR], f: 3900, cx: 1060, cy: 650};
const LX2: ZunLight = {dir: [0.45, 0.25, 0.86], col: '#FFD6A0', k: 1.3, amb: 0.26, ambCol: '#5A5448', spec: 0.8, shin: 18, inside: 0.8};
const SX2: React.FC<{t: number}> = ({t}) => {
	const cam = camOf(mixCP(X2A, X2B, eio(seg(t, 123.72, 128.3))));
	const k = pxk(cam, [0, 0, ZUN.FLOOR]);
	/* the scalpel goes down the current column; the brush follows a column behind */
	/* boustrophedon: down one column, up the next, so the hand only steps sideways between strokes */
	const cur = cl(Math.floor((t - XT(0) + 0.22) / (BEAT / 2)), 0, 11), Tc = XT(cur), dn = ease(seg(t, Tc - 0.22, Tc + 0.06)), sv = cur % 2 ? lerp(6.6, -6.4, dn) : lerp(-6.4, 6.6, dn);
	const done = t > XT(11) + 0.1, endV = 11 % 2 ? -6.4 : 6.6;
	const sTip = proj(cam, fl3(colU(cur) + 0.1, done ? endV : sv)), sTip2: P = done ? [sTip[0] + 300 * ease(seg(t, XT(11) + 0.1, XT(11) + 0.5)), sTip[1] + 120 * ease(seg(t, XT(11) + 0.1, XT(11) + 0.5))] : [sTip[0], sTip[1]];
	const hk = 24;
	return <Shell id="X2" t={t} bg="#0A0807" vig={0.66}>
		<defs><filter id="x2sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx={-14} dy={18} stdDeviation={10} floodColor="#000" floodOpacity={0.45} /></filter>
			<linearGradient id="x2b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2A1C14" /><stop offset="1" stopColor="#120C09" /></linearGradient></defs>
		<rect width={W} height={H} fill="url(#x2b)" />
		<Glow x={1700} y={180} r={700} c="#FFC880" o={0.3} id="x2l" />
		<Zun cam={cam} light={LX2} id="x2z" patina={0.4} reveal={1} glow={0} shadow={false} />
		<Crust cam={cam} t={t} id="x2c" />
		{/* the lamp's light into the mouth and the dust it shows */}
		<defs><linearGradient id="x2beam" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE2B0" stopOpacity={0.2} /><stop offset="1" stopColor="#FFE2B0" stopOpacity={0} /></linearGradient></defs>
		<path d="M1920,-40 L1400,-40 L900,760 L1300,820 Z" fill="url(#x2beam)" />
		<Rising t={t} n={50} x0={900} x1={1700} y0={60} y1={900} c="#FFE8C0" seed={21} v={22} o={0.5} r={2.2} sway={18} />
		{(() => { const ang = -152, L = 13, dx = Math.cos(ang * D2R), dy = Math.sin(ang * D2R), wr: P = [sTip2[0] - dx * (L + 6) * hk - dy * 5.2 * hk, sTip2[1] - dy * (L + 6) * hk + dx * 5.2 * hk];
			return <g filter="url(#x2sh)"><RestHand x={wr[0]} y={wr[1]} k={hk} rot={ang} tool="scalpel" toolL={L} o={1 - ss(127.45, 127.85, t)} /></g>; })()}
	</Shell>; };

/* ============================== the beam out of the mouth (3D cone, projected; soft) ============================== */
const beamR = (z: number, sp = 0.16) => (z <= 38.8 ? 6.4 + (z - ZUN.FLOOR) * 0.25 : 13.1 + (z - 38.8) * sp);
const BeamCone: React.FC<{cam: Cam; o: number; id: string; top?: number; core?: number; sp?: number; mouth?: number}> = ({cam, o, id, top = 420, core = 1, sp = 0.16, mouth = 0}) => {
	const zs = [ZUN.FLOOR, 20, 30, 38.8, 50, 70, 100, 140, 190, 250, 330, 420].filter((z) => z <= top);
	const base = proj(cam, [0, 0, ZUN.FLOOR]), tp = proj(cam, [0, 0, 60]), ax = nz2([tp[0] - base[0], tp[1] - base[1]]), nn: P = [-ax[1], ax[0]];
	const L: P[] = [], R: P[] = [], Lc: P[] = [], Rc: P[] = [];
	for (const z of zs) { const pts = Array.from({length: 28}, (_, i) => { const a = (i / 28) * 2 * Math.PI; return proj(cam, [beamR(z, sp) * Math.cos(a), beamR(z, sp) * Math.sin(a), z]); });
		if (pts.some((q) => q[2] < 15)) break;
		const dd = pts.map((q) => (q[0] - base[0]) * nn[0] + (q[1] - base[1]) * nn[1]), lo = pts[dd.indexOf(Math.min(...dd))], hi = pts[dd.indexOf(Math.max(...dd))];
		L.push([lo[0], lo[1]]); R.push([hi[0], hi[1]]); const m: P = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2]; Lc.push(lerpP(m, [lo[0], lo[1]], 0.4)); Rc.push(lerpP(m, [hi[0], hi[1]], 0.4));
		if (Math.min(lo[1], hi[1]) < -400) break; }
	if (L.length < 2) return null;
	/* extend the last edge to well beyond the frame */
	const ext = (A: P[]) => { const a = A[A.length - 2], b = A[A.length - 1], d = nz2([b[0] - a[0], b[1] - a[1]]); return [...A, add2(b, d, 1600)]; };
	const poly = (Lp: P[], Rp: P[]) => 'M' + [...ext(Lp), ...ext(Rp).reverse()].map((q) => `${f1(q[0])},${f1(q[1])}`).join('L') + 'Z';
	const lip = Array.from({length: 48}, (_, i) => { const a = (i / 48) * 2 * Math.PI; return proj(cam, [13.9 * Math.cos(a), 13.9 * Math.sin(a), 38.8]); }), lipD = 'M' + lip.map((q) => `${f1(q[0])},${f1(q[1])}`).join('L') + 'Z';
	const lipMid = lip.reduce((a, q) => a + q[1], 0) / lip.length;
	const blur = Math.min(36, Math.max(8, pxk(cam, [0, 0, 40]) * 2.2));   /* capped: huge radii are very slow to rasterise */
	return <g>
		<defs><filter id={`${id}b`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={blur} /></filter>
			<linearGradient id={`${id}g`} gradientUnits="userSpaceOnUse" x1={base[0]} y1={base[1]} x2={base[0] + ax[0] * 1100} y2={base[1] + ax[1] * 1100}><stop offset="0" stopColor="#FFE6A8" stopOpacity={1} /><stop offset="0.3" stopColor="#F2C66E" stopOpacity={0.8} /><stop offset="1" stopColor="#F2C66E" stopOpacity={0.5} /></linearGradient>
			<clipPath id={`${id}in`}><path d={lipD} /></clipPath>
			<mask id={`${id}out`} maskUnits="userSpaceOnUse" x={-3000} y={-5000} width={8000} height={9000}><rect x={-3000} y={-5000} width={8000} height={5000 + lipMid} fill="#fff" /><path d={lipD} fill="#000" /></mask></defs>
		<g filter={`url(#${id}b)`} opacity={o}>
			<g mask={`url(#${id}out)`}><path d={poly(L, R)} fill={`url(#${id}g)`} />{core > 0 && <path d={poly(Lc, Rc)} fill="#FFF0C8" opacity={0.4 * core} />}</g>
			<g clipPath={`url(#${id}in)`}><path d={poly(L, R)} fill={`url(#${id}g)`} />{core > 0 && <path d={poly(Lc, Rc)} fill="#FFF0C8" opacity={0.6 * core} />}
				{mouth > 0 && <path d={lipD} fill="#FFE9B0" opacity={mouth} />}</g>
		</g></g>; };
/** motes rising in the beam (3D, projected) */
const BeamMotes: React.FC<{cam: Cam; t: number; n: number; o: number; seed: number; zmax?: number; sp?: number}> = ({cam, t, n, o, seed, zmax = 260, sp = 0.16}) => <g>{Array.from({length: n}, (_, i) => {
	const z = ZUN.FLOOR + ((rnd(i, seed) * (zmax - ZUN.FLOOR) + t * (22 + 30 * rnd(i, seed + 1))) % (zmax - ZUN.FLOOR)), a = rnd(i, seed + 2) * 2 * Math.PI + t * 0.3, rr = beamR(z, sp) * Math.sqrt(rnd(i, seed + 3)) * 0.9;
	const q = proj(cam, [rr * Math.cos(a), rr * Math.sin(a), z]); if (q[2] < 10) return null; const kk = cam.f / q[2];
	return <circle key={i} cx={f1(q[0])} cy={f1(q[1])} r={f1(Math.min(6, 0.12 * kk * (0.5 + rnd(i, seed + 4))))} fill="#FFF2D0" opacity={o * (0.3 + 0.7 * rnd(i, seed + 5)) * (z > 38.8 ? 1 : 0.6)} />; })}</g>;

/* ============================== X3 · 128.25 中 and 或 ignite; the beam shoots up out of the mouth ============================== */
const IGN = G(33);   /* 128.46: the first beat inside the card */
const keyT: V3 = (() => { const q = fl3(colU(6), (4.5 - 4.5) * ROWH); return [q[0], q[1], ZUN.FLOOR]; })();
const X3A: CP = {az: 225, el: 87.5, D: 46, T: keyT, f: 3900, cx: 960, cy: 650}, X3B: CP = {az: 225, el: 84, D: 56, T: keyT, f: 3900, cx: 960, cy: 660},
	X3C: CP = {az: 225, el: 50, D: 165, T: [0, 0, 34], f: 3300, cx: 960, cy: 720};
const LX3: ZunLight = {dir: [0.3, 0.2, 0.93], col: '#FFD9A0', k: 0.95, amb: 0.2, ambCol: '#4A3E34', spec: 1.0, shin: 18, inside: 0.35, rim: {dir: [-0.4, 0.4, 0.8], col: '#FFE0A0', k: 0.7}};
const SX3: React.FC<{t: number}> = ({t}) => {
	const p0 = t < 129.0 ? mixCP(X3A, X3B, ease(seg(t, 128.25, 129.0))) : mixCP(X3B, X3C, eio(seg(t, 129.0, 132.9)));
	/* from 131.0 the crane keeps rising and pulling back (starts flat, still moving at the cut to X4) */
	const dr = Math.pow(seg(t, 131.0, 132.8), 2), p = {...p0, el: p0.el - 7 * dr, D: p0.D * (1 + 0.16 * dr)};
	const cam = camOf(p);
	const ig = t >= IGN ? 1 : 0, gl = ig * (1 + 0.8 * Math.exp(-(t - IGN) * 5)) + 0.25 * ss(128.25, IGN, t);
	const shoot = ss(IGN, IGN + 0.5, t), burst = t > G(36) ? Math.exp(-(t - G(36)) * 2.2) : 0;   /* G(36) = 130.16, the next bar */
	const topDown = cl((p.el - 72) / 12), side = 1 - topDown;
	const ctr = proj(cam, [keyT[0], keyT[1], ZUN.FLOOR]), k = pxk(cam, keyT);
	const roomDark = 0.55 + 0.4 * ss(129, 131, t);
	return <Shell id="X3" t={t} bg="#060504" vig={0.7}>
		<Room1975 cam={cam} on={1} dark={roomDark} />
		<Zun cam={cam} light={{...LX3, k: LX3.k * (1 + 0.3 * shoot)}} id="x3z" patina={0.18} reveal={1} glow={gl} shadow={false} />
		{/* seen down the axis, the beam is a bloom rushing at the lens */}
		{/* seen down its axis the beam is a bloom rushing at the lens: soft light added on top, motes flying out past the lens */}
		{topDown > 0 && ig > 0 && <g opacity={topDown * shoot} style={{mixBlendMode: 'screen'}}>
			<Glow x={ctr[0]} y={ctr[1]} r={(260 + 700 * shoot) * k / 70} c="#F2C66E" o={0.32 + 0.25 * burst} id="x3bl" />
			{Array.from({length: 40}, (_, i) => { const a = rnd(i, 3) * 2 * Math.PI, r0 = (60 + ((t - IGN) * (300 + 500 * rnd(i, 6)) + rnd(i, 4) * 700) % 900) * k / 70, rr = 1.5 + 4 * (r0 / (900 * k / 70));
				return <circle key={i} cx={f1(ctr[0] + Math.cos(a) * r0)} cy={f1(ctr[1] + Math.sin(a) * r0 * 0.9)} r={f1(rr)} fill="#FFF2D0" opacity={0.7 * (1 - r0 / (950 * k / 70))} />; })}</g>}
		{side > 0 && ig > 0 && <g opacity={side}><BeamCone cam={cam} o={(0.7 + 0.3 * burst) * shoot} id="x3bc" sp={0.22} /><BeamMotes cam={cam} t={t} n={90} o={0.8} seed={31} sp={0.22} /></g>}
		<KeyGlyphs cam={cam} o={cl(gl)} warm={0.25 * ss(128.25, IGN, t)} id="x3kg" />
	</Shell>; };

/* ============================== X4 · 132.77 pull out along the beam to the whole 尊, clean and shining; the glyphs hang in the light ============================== */
const X4A: CP = {az: 30, el: 74, D: 92, T: [0, 0, 34], f: 3300, cx: 960, cy: 640};
const LX4: ZunLight = {dir: [0.55, 0.25, 0.8], col: '#FFE2B4', k: 1.9, amb: 0.3, ambCol: '#4A4036', spec: 1.8, shin: 14, rim: {dir: [-0.7, -0.3, 0.6], col: '#FFD08A', k: 1.1}, inside: 0.9};   /* = X4_END.zun.light */
/** the X4 picture (no overlay): e = the pull-out progress (1 = HOME), gU = the glyphs' rise (1 = settled in the row) */
const X4Picture: React.FC<{t: number; e: number; gU: number; gO: number}> = ({t, e, gU, gO}) => {
	const p = mixCP(X4A, homeCP(30), e), cam = e >= 0.9999 ? homeCam(30) : camOf(p);
	const lip = proj(cam, [0, 0, 38.8]), G4 = X4_END.glyphs;
	const gx0 = lerp(lip[0], 960, gU) - 1.5 * G4.gap * (0.35 + 0.65 * gU), gy = lerp(lip[1] - 30, G4.y, gU), gs = lerp(30, G4.size, gU);
	const breathe = 0.92 + 0.08 * Math.sin(t * 2.4), floor = proj(cam, [0, 0, 0]), fk = pxk(cam, [0, 0, 0]);
	return <>
		<defs><radialGradient id="x4st" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#3A2A1A" /><stop offset="1" stopColor="#050404" stopOpacity={0} /></radialGradient></defs>
		<rect width={W} height={H} fill={X4_END.bg} />
		{/* the dark stage: a floor pool of the beam's light */}
		<ellipse cx={floor[0]} cy={floor[1]} rx={620 * fk / 14.4} ry={130 * fk / 14.4 * (0.25 + 0.75 * Math.sin(p.el * D2R))} fill="url(#x4st)" />
		<Zun cam={cam} light={LX4} id="x4z" patina={X4_END.zun.patina} reveal={1} glow={1 - 0.6 * e} shadow={true} />
		<BeamCone cam={cam} o={X4_END.beam.o * breathe + 0.3 * (1 - e)} id="x4bc" core={X4_END.beam.core} sp={X4_END.beam.sp} mouth={cl((p.el - 25) / 35) * 0.92} />
		<BeamMotes cam={cam} t={t} n={110} o={0.75} seed={57} zmax={300} sp={X4_END.beam.sp} />
		<Glyphs55 chars={G4.chars} x={gx0} y={gy} size={gs} dir="h" gap={G4.gap * (0.35 + 0.65 * gU)} glow={G4.glow * breathe} o={gO} id="x4gl" />
	</>; };
/* the pull-out lands on HOME exactly at the last frame, still drifting (a cosine ease cut off before its end), so the final second keeps moving */
const SX4: React.FC<{t: number}> = ({t}) => { const u = seg(t, 132.8, 137.267), c0 = Math.cos(0.15 * Math.PI), e = (c0 - Math.cos(Math.PI * (0.15 + 0.7 * u))) / (c0 - Math.cos(0.85 * Math.PI));
	return <Shell id="X4" t={t} bg="#050404" vig={X4_END.vig}><X4Picture t={t} e={e} gU={ss(133.3, 136.4, t)} gO={ss(133.1, 133.7, t)} /></Shell>; };
/** HAND-OFF to builder 5 (X5 at 137.30): the state of act 4's last frame (4118, t = 137.267). The picture is X4EndPicture (no
    overlay; vignette included); render it at any t ≥ 137.3 and it continues seamlessly (the beam breathes and the motes rise with t). */
export const X4_END = {
	frame: 4118, t: 137.267,
	camera: 'homeCam(30) from home55h (base centre (960, 880), 560 px tall, el 5, az 30)',
	bg: '#060505', vig: 0.68,
	zun: {patina: 0.04, reveal: 1, glow: 0.4, shadow: true, light: {dir: [0.55, 0.25, 0.8], col: '#FFE2B4', k: 1.9, amb: 0.3, ambCol: '#4A4036', spec: 1.8, shin: 14, rim: {dir: [-0.7, -0.3, 0.6], col: '#FFD08A', k: 1.1}, inside: 0.9} as ZunLight},
	/* the beam: a cone from the floor of the mouth, radius 13.1 cm at the lip widening 0.55 cm per cm of height, #F2C66E, group opacity
	   o × (0.92 + 0.08 sin 2.4t), gaussian-soft edges; at HOME it leaves the mouth at y ≈ 340 and reaches the top of frame ≈ 760 px wide */
	beam: {color: '#F2C66E', o: 0.5, core: 0.6, sp: 0.55},
	glyphs: {chars: '宅兹中或', size: 64, gap: 82, y: 200, x0: 960 - 1.5 * 82, dir: 'h' as const, glow: 0.9},
};
export const X4EndPicture: React.FC<{t: number}> = ({t}) => <AbsoluteFill style={{background: X4_END.bg}}>
	<svg width={W} height={H} style={{position: 'absolute'}}><X4Picture t={t} e={1} gU={1} gO={1} /><Vig id="x4endv" a={X4_END.vig} /></svg></AbsoluteFill>;

/* ============================== the router ============================== */
const SCENES: Record<string, React.FC<{t: number}>> = {U: SU, V: SV, '停': SStop, W1: SW1, W2: SW2, X1: SX1, X2: SX2, X3: SX3, X4: SX4};
const ORDER = ['U', 'V', '停', 'W1', 'W2', 'X1', 'X2', 'X3', 'X4'];
export const Act4: React.FC<{t: number}> = ({t}) => { const f = Math.round(t * 30); let id = 'U'; for (const k of ORDER) if (f >= SF(k)) id = k;
	const S = SCENES[id]; return <S t={f / 30} />; };
/** 中 and 或 on the floor, lit gold: the same strokes and placement as zun55h's inscription (column 7, rows 6–7), drawn bright with a bloom */
const KeyGlyphs: React.FC<{cam: Cam; o: number; warm?: number; id: string}> = ({cam, o, warm = 0, id}) => { if (o <= 0.01 && warm <= 0.01) return null; const kpx = pxk(cam, [0, 0, ZUN.FLOOR]);
	const ps = ([['宅', 3], ['兹', 4], ['中', 5], ['或', 6]] as [string, number][]).map(([ch, kk]) => { const u = colU(6), v = (kk - 4.5) * ROWH + (zrnd(6 * 17 + kk, 9) - 0.5) * 0.08, sc = ch === '中' || ch === '或' ? 1.1 : 0.98 + (zrnd(6 * 5 + kk, 4) - 0.5) * 0.14;
		return {key: ch === '中' || ch === '或', d: GLYPH_STROKES[ch].map((st) => ({w: Math.max(1, st.w * sc * kpx * 1.05), d: 'M' + st.pts.map(([x, y]) => { const q = proj(cam, fl3(u + x * sc * 0.98, v + y * sc)); return `${f1(q[0])},${f1(q[1])}`; }).join('L') + (st.fill ? 'Z' : '')}))}; });
	const draw = (keyOnly: boolean, c: string, wk: number, op: number) => ps.filter((g) => !keyOnly || g.key).flatMap((g, gi) => g.d.map((st, si) => <path key={`${gi}_${si}`} d={st.d} fill="none" stroke={c} strokeWidth={st.w * wk} strokeLinecap="round" strokeLinejoin="round" opacity={op} />));
	return <g>
		<defs><filter id={`${id}a`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation={kpx * 0.55} /></filter><filter id={`${id}b`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={kpx * 0.12} /></filter></defs>
		{warm > 0 && <g opacity={warm}>{draw(false, '#E8A850', 1.0, 0.8)}</g>}
		{o > 0.01 && <g opacity={o}>
			<g filter={`url(#${id}a)`}>{draw(true, '#FFB040', 3.2, 0.9)}</g>
			<g filter={`url(#${id}b)`}>{draw(true, '#FFE09A', 1.8, 1)}</g>
			{draw(true, '#FFF6DA', 0.9, 1)}
			<g opacity={0.5}>{draw(false, '#F2C66E', 1.0, 0.7)}</g></g>}
	</g>; };
