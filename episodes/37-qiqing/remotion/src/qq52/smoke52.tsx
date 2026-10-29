import React, {useEffect, useLayoutEffect, useRef} from 'react';
import type {PCloudProps} from './props52';
/* ep52 《从一支箭，到火箭云》 · the 火箭云 as procedural SMOKE (replaces the particle look the owner rejected: 「感觉不像」).
   A WebGL fragment shader (one full-screen triangle) evaluates, per pixel:
   - the balloon: a teardrop SDF (pinched toward the neck) whose coordinates are domain-warped by fbm, lit from the lower left
     (a broad, uneven, striated glow band there; a thin fuzzy veil on the upper right), a see-through haze inside, two faint straight
     filaments early on, later a white star point (the rocket) with faint straight spokes, then a dark cavity round it;
   - the trail: distance to a wiggly centre line (48 points, passed in), warped by fbm, as a twisted two-strand rope with knots and
     fine smoky texture, thinning to a jagged line; colour ramps cream → peach → orange → red at the tip;
   - a soft analytic bloom round both.
   Flat, in the picture plane: no lighting model, no depth, only a 2D glow field tone-mapped to a warm ramp (no pure white except the
   tiny star point). Deterministic: pure function of the uniforms (time enters only as a slow drift of the noise).
   Exports:
   - SmokeRocketCloud (drop-in for RocketCloud / ParticleRocketCloud: same PCloudProps, place it inside an <svg>; draws through a
     <foreignObject>), plus optional `head` (0..1: the rocket running back down its own trail, for a rewind) and `quality`.
   - SmokeCanvas: the low-level screen-space canvas (an HTML element) driven by a SmokeFrame, for camera moves.
   - smokeGeom(props) → world geometry; smokeFrame(geom, cam) → a SmokeFrame; openStage52(t). */
type P2 = [number, number];
const NT = 48;
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const pl = (pts: [number, number][], x: number) => { if (x <= pts[0][0]) return pts[0][1]; for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], (x - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0])); return pts[pts.length - 1][1]; };
const sm = (x: number) => { const u = Math.max(0, Math.min(1, x)); return u * u * (3 - 2 * u); };
const hashStr = (str: string) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const r01 = (seed: number, i: number) => { const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453; return x - Math.floor(x); };

/** the opening's film time → the viral video's stage (frame 0 = a clear teardrop; star + spokes by ~6 s; the cavity opens by ~9 s) */
export const openStage52 = (t: number) => pl([[0, 4.2], [3, 5.6], [6, 8], [9, 9.45], [9.3, 9.55], [9.45, 9.6]], t);

export type SmokeProps = PCloudProps & {
	/** 0..1: the rocket runs back down its own trail (the trail above it is gone); used by the rewind */
	head?: number;
	/** override the star point's brightness (0..1) */
	starI?: number;
	/** canvas resolution factor (1 = one canvas pixel per screen pixel at the render scale) */
	quality?: number;
};
export type SmokeGeom = {C: P2; Rv: number; Ru: number; Rb: number; n: P2; q: P2; pin: number; N: P2; F: P2; S: P2; v: number; bal: number;
	trail: {pts: P2[]; w: number[]; cs: number[]; knot: number[]; a: number[]; arc: number[]} | null; star: number; spk: number; fil: number; cav: number; k: number; t: number; lit: P2};

/** the cloud in world space. Neck mode (props.neck): the neck stays put, the balloon inflates up and away from it through the stages;
    stage < 2 deflates it back into the bright head of a thin streak (the real video's first second). Otherwise the balloon is placed
    from ax/ay/bw/bh (or c/rv/ru) like ParticleRocketCloud. */
export const smokeGeom = (p: SmokeProps): SmokeGeom => {
	const t = p.t ?? 0, v = p.stage ?? 5, F: P2 = [p.x0, p.y0], sun = p.sun ?? -1, k = p.k ?? 1;
	const rho = pl([[0, 1.35], [2, 1.32], [4, 1.28], [5, 1.27], [8, 1.36], [10.5, 1.34], [14, 1.3]], v);
	const flat = pl([[2, 1.3], [5, 1], [8, 0.82], [10.5, 0.75], [14, 0.7]], v);
	let C: P2, Rv: number, Ru: number, ang: number, N: P2, Rb: number;
	if (p.neck) { N = p.neck; const rv = p.rv ?? 140; Rb = rv;
		Rv = rv * pl([[0, 0], [0.6, 0.02], [2, 0.45], [3.5, 0.8], [5, 1.06], [8, 1.85], [9.5, 2.1], [10.5, 2.2], [14, 2.5]], v); Ru = Rv * rho;
		const dx = F[0] - N[0], dy = F[1] - N[1]; ang = (p.axis !== undefined ? p.axis * Math.PI / 180 : Math.atan2(dy, dx) * 0.45) * flat;
		C = [N[0] - Math.cos(ang) * Ru * 0.97 - 1.2 * t * Math.min(1, Rv / rv), N[1] - Math.sin(ang) * Ru * 0.97 - 0.6 * t * Math.min(1, Rv / rv)]; }
	else { const Rv0 = p.rv ?? 0.42 * Math.min(p.bw, p.bh), C0: P2 = p.c ?? [p.ax, p.ay + Rv0 * 1.1], e = 1 + 0.03 * t; Rb = Rv0; Rv = Rv0 * e; Ru = (p.ru ?? Rv0 * rho) * e; C = [C0[0] - 1.6 * t, C0[1] - 0.9 * t];
		const dx = F[0] - C[0], dy = F[1] - C[1]; ang = p.axis !== undefined ? p.axis * Math.PI / 180 * flat : Math.atan2(dy, dx) - 0.5 * Math.atan2(dy, Math.abs(dx)) * Math.sign(dx || 1) * 0.9;
		N = [C[0] + Math.cos(ang) * Ru * 0.97, C[1] + Math.sin(ang) * Ru * 0.97]; }
	const n: P2 = [Math.cos(ang), Math.sin(ang)], q: P2 = [-n[1], n[0]];
	const pin = pl([[0, 0.85], [2, 0.84], [5, 0.78], [8, 0.74], [10.5, 0.7], [14, 0.66]], v);
	/* the trail: a wiggly centre line from the neck (s = 0) to the far end (s = 1) */
	const R0 = hashStr(p.id ?? 'smk'), ph0 = 6.283 * r01(R0, 1), ph1 = 6.283 * r01(R0, 2), ph2 = 6.283 * r01(R0, 3);
	const Rt = Rb * Math.min(1.15, pl([[0, 0.55], [2, 0.62], [5, 1], [8, 1.12]], v)), knotS = sm((v - 1.2) / 3.2);
	const dl = Math.hypot(F[0] - N[0], F[1] - N[1]) || 1, tn: P2 = [(F[0] - N[0]) / dl, (F[1] - N[1]) / dl], tq: P2 = [-tn[1], tn[0]];
	const amp = p.amp ?? Rt * 0.07;
	const cen = (s: number): P2 => { const env = Math.min(1, s * 4);
		const off = -dl * 0.05 * Math.sin(Math.PI * s) * sun + env * (amp * 0.6 * Math.sin(2 * Math.PI * 1.6 * s + ph0 + 0.12 * t)
			+ Math.min(1, s * 2.2) * (Rt * 0.022 * (0.6 + 0.6 * Math.sin(2 * Math.PI * 2.3 * s + ph2)) * Math.sin(2 * Math.PI * 7.5 * s + ph1 + 0.35 * t) + Rt * 0.016 * Math.sin(2 * Math.PI * 12.1 * s + ph2)
			+ Rt * 0.016 * Math.sin(2 * Math.PI * 23.3 * s + ph0 * 1.7) * sm((s - 0.45) / 0.3)));
		return [N[0] + tn[0] * dl * s + tq[0] * off, N[1] + tn[1] * dl * s + tq[1] * off]; };
	const wd = (s: number) => Rt * 0.1 * Math.pow(Math.max(0, 1 - s / 0.82), 1.2) * knotS + Rt * (0.028 + 0.014 * knotS) * (1 - 0.6 * s) + 1.4;
	const h = Math.max(0, Math.min(0.999, p.head ?? 0)), tk = p.trailK ?? 1;
	const pts: P2[] = [], w: number[] = [], cs: number[] = [], knot: number[] = [], a: number[] = [], arc: number[] = [];
	for (let j = 0; j < NT; j++) { const s = h + (1 - h) * j / (NT - 1);
		pts.push(cen(s)); w.push(wd(s)); cs.push(s); knot.push(knotS * (1 - 0.7 * sm((s - 0.4) / 0.4)));
		a.push(tk * (1 - 0.25 * sm((s - 0.8) / 0.2)) * (h > 0 ? sm((j / (NT - 1)) / 0.04 + 0.35) : 1)); arc.push(s * dl); }
	const Sb: P2 = [C[0] - n[0] * Ru * 0.78 - q[0] * Rv * 0.36, C[1] - n[1] * Ru * 0.78 - q[1] * Rv * 0.36];
	const S: P2 = h > 0 ? cen(h) : Sb;
	const bal = sm(Rv / (Rb * 0.12));
	const star = p.starI ?? sm((v - 6) / 1.5) * Math.min(1, k);
	const spk = sm((v - 5.6) / 2.2) * (1 - 0.55 * sm((v - 10) / 3));
	const fil = sm((v - 1.6) / 1.2) * (1 - sm((v - 6) / 2));
	const cav = Rv * 0.36 * sm((v - 8.9) / 1.1);
	return {C, Rv, Ru, Rb, n, q, pin, N, F, S, v, bal, trail: {pts, w, cs, knot, a, arc}, star, spk, fil, cav, k, t, lit: [sun * 0.84, 0.54]}; };

/* ---------- screen-space frame (what the shader draws) ---------- */
export type Cam52 = {P: P2; Q: P2; z: number};
export const CAM0: Cam52 = {P: [0, 0], Q: [0, 0], z: 1};
export type SmokeFrame = {g: SmokeGeom; cam: Cam52; bloom?: number;
	/** replace the trail (screen space) — the transition hands the streak over to the fire arrow's */
	trail?: SmokeGeom['trail']; o?: number};
const toS = (cam: Cam52, p: P2): P2 => [(p[0] - cam.P[0]) * cam.z + cam.Q[0], (p[1] - cam.P[1]) * cam.z + cam.Q[1]];
/** the world trail of a geometry in screen space */
export const trailToScreen = (g: SmokeGeom, cam: Cam52): NonNullable<SmokeGeom['trail']> => { const T = g.trail!;
	return {...T, pts: T.pts.map((p) => toS(cam, p)), w: T.w.map((x) => x * cam.z)}; };

/* ---------- the shader ---------- */
const VS = 'attribute vec2 aP; void main(){ gl_Position = vec4(aP, 0.0, 1.0); }';
const FS = `precision highp float;
#define NT ${NT}
uniform vec2 uRes; uniform vec4 uBox; uniform vec4 uCam; uniform vec2 uCamP;
uniform vec2 uC; uniform vec2 uAx; uniform vec4 uBal; uniform vec4 uBal2; uniform vec2 uNk;
uniform vec2 uS; uniform vec4 uLook; uniform vec2 uLit;
uniform vec2 uTP[NT]; uniform vec4 uTD[NT]; uniform float uTA[NT]; uniform vec4 uTBox; uniform float uTOn;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y); }
const mat2 RM = mat2(1.6, 1.2, -1.2, 1.6);
float fbm3(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 3; i++) { s += a * vn(p); p = RM * p + vec2(3.1, 1.7); a *= 0.5; } return s / 0.875; }
float fbm5(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * vn(p); p = RM * p + vec2(3.1, 1.7); a *= 0.5; } return s / 0.96875; }
vec3 trailCol(float s){
	vec3 c = mix(vec3(0.99, 0.88, 0.74), vec3(0.985, 0.85, 0.69), smoothstep(0.0, 0.42, s));
	c = mix(c, vec3(0.97, 0.76, 0.56), smoothstep(0.42, 0.64, s));
	c = mix(c, vec3(0.95, 0.56, 0.32), smoothstep(0.62, 0.8, s));
	c = mix(c, vec3(0.9, 0.32, 0.2), smoothstep(0.78, 0.92, s));
	return mix(c, vec3(0.84, 0.2, 0.15), smoothstep(0.92, 1.0, s)); }
vec3 balCol(float I, float lit){
	vec3 c = mix(vec3(0.78, 0.72, 0.75), vec3(0.95, 0.82, 0.7), smoothstep(0.04, 0.4, I));
	c = mix(c, vec3(0.99, 0.89, 0.76), smoothstep(0.36, 0.9, I));
	c = mix(c, vec3(1.0, 0.93, 0.83), smoothstep(0.9, 1.7, I));
	c = mix(c, c * vec3(1.0, 0.9, 0.8), 0.6 * lit * smoothstep(0.15, 0.7, I));
	return mix(c, vec3(0.8, 0.77, 0.82) * (0.6 + 0.4 * c), 0.45 * (1.0 - lit) * (1.0 - smoothstep(0.3, 1.0, I))); }
void main(){
	vec2 fc = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
	vec2 sp = uBox.xy + fc * uBox.zw / uRes;               // screen px (y down)
	float z = uCam.z, t = uCam.w;
	vec2 pw = (sp - uCam.xy) / z + uCamP;                  // world px (noise anchor)
	float k = uLook.x;
	float Ib = 0.0, It = 0.0, litB = 0.0, csT = 0.0, glowB = 0.0, glowT = 0.0;
	/* ---------------- balloon ---------------- */
	float Rv = uBal.x, Ru = uBal.y, pinK = uBal.z, bo = uBal.w, Rb = uBal2.x;
	vec2 perp = vec2(-uAx.y, uAx.x);
	vec2 dd = sp - uC; float u0 = dot(dd, uAx), v0 = dot(dd, perp);
	float cav = uLook.w, mCav = 0.0;
	if (bo > 0.002 && Rv > 0.5) {
		float rr0 = length(vec2(u0 / Ru, v0 / Rv));
		float rCut = 3.0 * Rb / Rv + 0.3;
		if (rr0 < 1.0 + rCut) {
			float win = 1.0 - smoothstep(0.55, 1.0, (rr0 - 1.0) / rCut);
			vec2 nl = normalize(vec2(u0 / (Ru * Ru), v0 / (Rv * Rv)) + 1e-6);
			vec2 ns = uAx * nl.x + perp * nl.y;
			float lit = clamp(dot(ns, uLit), 0.0, 1.0); lit = smoothstep(0.0, 1.0, lit);
			vec2 bq = vec2(u0, v0) / Rb;
			vec2 drift = vec2(0.021, -0.013) * t;
			vec2 wq = vec2(fbm3(bq * 1.1 + 3.1 + drift), fbm3(bq * 1.1 + 7.7 - drift)) - 0.5;
			float wa = Rb * (0.05 + 0.1 * (1.0 - lit));
			float u = u0 + wq.x * wa, v = v0 + wq.y * wa;
			float cu = u / Ru, pin = max(0.06, 1.0 - pinK * pow(max(0.0, cu), 1.9));
			float rr = length(vec2(cu, v / (Rv * pin)));
			float dpx = (rr - 1.0) * Rv * mix(1.0, pin, step(0.0, cu) * 0.35) + max(0.0, cu - 0.99) * Ru * 2.5;
			float lt = pow(lit, 1.1);
			vec2 dir = normalize(vec2(u, v) + 1e-4);
			float f = clamp(3.0 + 22.0 * (rr - 1.0), 0.7, 5.0);
			float str = fbm5(dir * f + bq * 0.15 + 11.3 + drift * 0.5);
			float tur = fbm5(bq * 2.6 + wq * 3.0 + 5.0 + drift);
			float fine = fbm3(bq * 9.0 + wq * 4.0 + 1.7);
			float Rw = sqrt(Rb * Rv);
			float bw = Rw * (0.06 + 0.17 * lt + 0.1 * (1.0 - lt)) * (0.8 + 0.45 * tur), fz = Rw * (0.06 + 0.2 * (1.0 - lt)) * (0.85 + 0.3 * tur), pk = bw * 0.2, x = -dpx;
			float prof = x > pk ? exp(-pow((x - pk) / bw, 2.0)) : exp(-pow((pk - x) / fz, 2.0));
			float tex = 0.8 + 0.42 * (str - 0.5) * 1.6 + 0.3 * (tur - 0.5) + 0.14 * (fine - 0.5);
			float rim = prof * (0.3 + 1.4 * pow(lit, 0.8)) * tex;
			float neckDim = 1.0 - 0.5 * smoothstep(0.55, 0.98, cu) * (1.0 - lit);
			float inside = smoothstep(-Rb * 0.05, Rb * 0.25, x);
			float haze = inside * (0.06 + 0.1 * tur) * (0.6 + 0.6 * smoothstep(0.3, 0.95, rr)) * pow(Rb / max(Rv, Rb), 1.4);
			float nkd = length(sp - uNk) / max(Rv, 1.0);
			float nkw = inside * exp(-nkd * 2.6) * 0.5 * smoothstep(0.35, 0.8, tur);
			float veil = exp(-max(dpx, 0.0) / (Rb * 0.3)) * (1.0 - lt) * 0.12 * (0.45 + 0.9 * tur) * step(0.0, dpx) * win * (1.0 - smoothstep(0.45, 0.85, cu));
			/* early filaments: thin straight streaks from the upper left toward the neck */
			float fil = 0.0;
			if (uLook.y > 0.001) {
				vec2 a1 = vec2(-0.8 * Ru, -0.32 * Rv), b1 = vec2(0.6 * Ru, -0.06 * Rv), a2 = vec2(-0.62 * Ru, -0.1 * Rv), b2 = vec2(0.52 * Ru, 0.08 * Rv);
				vec2 pp = vec2(u0, v0) + wq * Rb * 0.03;
				vec2 ba = b1 - a1; float h1 = clamp(dot(pp - a1, ba) / dot(ba, ba), 0.0, 1.0); float d1 = length(pp - a1 - ba * h1);
				vec2 bb = b2 - a2; float h2 = clamp(dot(pp - a2, bb) / dot(bb, bb), 0.0, 1.0); float d2 = length(pp - a2 - bb * h2);
				float fw = 1.1 * z + Rb * 0.006;
				fil = (exp(-pow(d1 / (fw * 2.2), 2.0)) * 0.26 * sin(3.1416 * h1) + exp(-pow(d2 / (fw * 4.0), 2.0)) * 0.05 * sin(3.1416 * h2)) * (0.5 + 0.7 * str) * uLook.y * inside;
			}
			/* spokes: faint straight rays fanning from the star point toward the neck side */
			float spk = 0.0;
			if (uLook.z > 0.001) {
				vec2 ds = sp - uS; float r = length(ds);
				float an = atan(ds.y, ds.x) - atan(uAx.y, uAx.x); an = mod(an + 3.14159, 6.28318) - 3.14159;
				float spacing = 0.24, fi = an / spacing, ki = floor(fi + 0.5);
				float jit = (hash(vec2(ki, 7.0)) - 0.5) * 0.6;
				float da = (fi - ki - jit) * spacing;
				float pw2 = abs(da) * r, sw = 1.8 * z + r * 0.02;
				float span = smoothstep(-1.3, -1.0, an) * (1.0 - smoothstep(0.75, 1.1, an));
				float len = Rv * (0.45 + 1.0 * hash(vec2(ki, 3.0)));
				float on = step(0.4, hash(vec2(ki, 9.0)));
				spk = exp(-pow(pw2 / sw, 2.0)) * exp(-r / len) * smoothstep(Rb * 0.03, Rb * 0.14, r) * (0.08 + 0.22 * hash(vec2(ki, 5.0))) * on * span * smoothstep(-Rb * 0.12, Rb * 0.08, x) * uLook.z * (0.5 + 0.8 * str);
				spk += exp(-r / (Rb * 0.3)) * 0.34 * uLook.z * smoothstep(0.0, Rb * 0.02, r) * (0.6 + 0.6 * tur);
			}
			Ib = (rim * neckDim + haze + nkw + veil + fil + spk) * bo * k;
			glowB = exp(-max(dpx, 0.0) / (Rb * 0.7)) * (0.08 + 0.16 * lt) * bo * k * win;
			litB = lit;
			if (cav > 0.5) {
				vec2 cc = uS + uAx * cav * 0.3 - perp * cav * 0.05;
				vec2 dc = sp - cc; float wob = 1.0 + 0.32 * (fbm3(dc / max(cav, 1.0) * 1.1 + 2.0) - 0.5);
				float dcv = length(vec2(dot(dc, uAx) / 1.2, dot(dc, perp))) / (cav * wob);
				mCav = 1.0 - smoothstep(0.6, 1.08, dcv);
				Ib = Ib * (1.0 - 0.9 * mCav) + exp(-pow((dcv - 1.0) / 0.2, 2.0)) * 0.07 * bo * smoothstep(-0.3, 0.6, dot(normalize(dc + 1e-4), uAx));
			}
		}
	}
	/* ---------------- trail ---------------- */
	if (uTOn > 0.5 && sp.x > uTBox.x && sp.x < uTBox.z && sp.y > uTBox.y && sp.y < uTBox.w) {
		float best = 1e9, w0 = 2.0;
		for (int i = 0; i < NT - 1; i++) { vec2 a = uTP[i], b = uTP[i + 1], ba = b - a; float hh = clamp(dot(sp - a, ba) / max(dot(ba, ba), 1e-4), 0.0, 1.0);
			float d = length(sp - a - ba * hh); if (d < best) { best = d; w0 = mix(uTD[i].x, uTD[i + 1].x, hh); } }
		if (best < w0 * 8.0 + 90.0 * z) {
			vec2 wq = vec2(fbm3(pw / 22.0 + 1.3), fbm3(pw / 22.0 + 8.1)) - 0.5;
			vec2 sp2 = sp + wq * (w0 * 1.1 + 1.5 * z);
			float bd = 1e9, side = 1.0, w = 2.0, cs = 0.0, kn = 0.0, ta = 1.0, arc = 0.0;
			for (int i = 0; i < NT - 1; i++) { vec2 a = uTP[i], b = uTP[i + 1], ba = b - a; float hh = clamp(dot(sp2 - a, ba) / max(dot(ba, ba), 1e-4), 0.0, 1.0);
				vec2 e = sp2 - a - ba * hh; float d = length(e);
				if (d < bd) { bd = d; side = sign(ba.x * e.y - ba.y * e.x); vec4 da = uTD[i], db = uTD[i + 1];
					w = mix(da.x, db.x, hh); cs = mix(da.y, db.y, hh); kn = mix(da.z, db.z, hh); arc = mix(da.w, db.w, hh); ta = mix(uTA[i], uTA[i + 1], hh); } }
			float lump = 0.55 + 0.95 * fbm3(vec2(arc / 20.0, 3.7));
			float wl = max(0.7 * z, w * mix(1.0, lump, kn));
			float o = 0.36 * wl * sin(arc / 10.0 + 1.3 + 4.0 * vn(vec2(arc / 45.0, 1.1))) * kn;
			float ws = wl * mix(1.0, 0.64, kn);
			float sd = side * bd;
			float st = max(exp(-pow((sd - o) / ws, 2.0) * 1.3), 0.82 * exp(-pow((sd + o) / ws, 2.0) * 1.3));
			float tex = fbm5(vec2(arc / 7.0, sd / (z * 4.0)) + wq * 3.0 + 2.0);
			float tex2 = fbm3(pw / 6.0 + 4.4);
			st *= mix(1.0, 0.35 + 0.95 * tex + 0.3 * (tex2 - 0.5), 0.35 + 0.65 * kn);
			It = st * ta * k * (1.05 + 0.25 * kn);
			glowT = exp(-bd / (wl * 2.2 + 7.0 * z)) * 0.17 * ta * k;
			csT = cs;
		}
	}
	/* ---------------- tone map, composite ---------------- */
	float I = Ib + It + 1e-5;
	vec3 col = (balCol(Ib, litB) * Ib + trailCol(csT) * It) / I;
	float a = 1.0 - exp(-2.1 * I);
	float gI = glowB + glowT;
	vec3 gcol = (vec3(0.93, 0.74, 0.64) * glowB + trailCol(csT) * 0.95 * glowT) / (gI + 1e-5);
	float ga = 1.0 - exp(-1.4 * gI) ;
	ga *= uBal2.y;
	vec4 outc = vec4(gcol * ga, ga);
	outc = vec4(col * a, a) + outc * (1.0 - a);
	if (mCav > 0.0) { float pa = mCav * 0.66; outc = vec4(vec3(0.05, 0.048, 0.066) * pa, pa) + outc * (1.0 - pa); }
	/* the star point (the rocket): the only pure white */
	float sI = uBal2.z;
	if (sI > 0.001) { vec2 ds = sp - uS; float r = length(ds), rs = uBal2.w;
		float core = exp(-pow(r / rs, 2.0)), halo = exp(-r / (rs * 3.2)) * 0.45 + exp(-r / (rs * 9.0)) * 0.22, cross = (exp(-abs(ds.y) / (0.7 * z)) * exp(-abs(ds.x) / (rs * 3.5)) + exp(-abs(ds.x) / (0.7 * z)) * exp(-abs(ds.y) / (rs * 3.5))) * 0.45;
		float s = clamp((core + halo + cross) * sI, 0.0, 1.0); vec3 sc = mix(vec3(1.0, 0.9, 0.74), vec3(1.0), core);
		outc = vec4(sc * s, s) + outc * (1.0 - s); }
	gl_FragColor = outc;
}`;

type GLS = {gl: WebGLRenderingContext; pr: WebGLProgram; U: Record<string, WebGLUniformLocation | null>};
const setup = (cv: HTMLCanvasElement): GLS => {
	const gl = cv.getContext('webgl', {preserveDrawingBuffer: true, premultipliedAlpha: true, alpha: true, antialias: false}) as WebGLRenderingContext | null;
	if (!gl) throw new Error('smoke52: no WebGL (render with GL=angle)');
	const sh = (ty: number, src: string) => { const o = gl.createShader(ty)!; gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error('smoke52 shader: ' + gl.getShaderInfoLog(o)); return o; };
	const pr = gl.createProgram()!; gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
	if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error('smoke52 link: ' + gl.getProgramInfoLog(pr));
	gl.useProgram(pr);
	const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
	const loc = gl.getAttribLocation(pr, 'aP'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
	const U: GLS['U'] = {}; for (const n of ['uRes', 'uBox', 'uCam', 'uCamP', 'uC', 'uAx', 'uBal', 'uBal2', 'uNk', 'uS', 'uLook', 'uLit', 'uTP', 'uTD', 'uTA', 'uTBox', 'uTOn']) U[n] = gl.getUniformLocation(pr, n);
	return {gl, pr, U}; };
const draw = (S: GLS, fr: SmokeFrame, box: [number, number, number, number], bw: number, bh: number) => { const {gl, U} = S, g = fr.g, cam = fr.cam, z = cam.z, o = fr.o ?? 1;
	gl.viewport(0, 0, bw, bh); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
	const C = toS(cam, g.C), Sx = toS(cam, g.S), Nk = toS(cam, g.N);
	gl.uniform2f(U.uRes, bw, bh); gl.uniform4f(U.uBox, box[0], box[1], box[2], box[3]); gl.uniform4f(U.uCam, cam.Q[0], cam.Q[1], z, g.t); gl.uniform2f(U.uCamP, cam.P[0], cam.P[1]);
	gl.uniform2f(U.uC, C[0], C[1]); gl.uniform2f(U.uAx, g.n[0], g.n[1]); gl.uniform4f(U.uBal, Math.max(0.01, g.Rv * z), Math.max(0.01, g.Ru * z), g.pin, g.bal * o);
	gl.uniform4f(U.uBal2, g.Rb * z, fr.bloom ?? 1, g.star * o, Math.max(1.6, (2.2 + g.Rb * 0.012) * Math.min(z, 2.2)));
	gl.uniform2f(U.uNk, Nk[0], Nk[1]); gl.uniform2f(U.uS, Sx[0], Sx[1]);
	gl.uniform4f(U.uLook, g.k, g.fil, g.spk, g.cav * z); gl.uniform2f(U.uLit, g.lit[0] / Math.hypot(g.lit[0], g.lit[1]), g.lit[1] / Math.hypot(g.lit[0], g.lit[1]));
	const T = fr.trail ?? (g.trail ? trailToScreen(g, cam) : null);
	if (T && o > 0) { const P = new Float32Array(NT * 2), D = new Float32Array(NT * 4), A = new Float32Array(NT); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, wm = 0;
		for (let i = 0; i < NT; i++) { const p = T.pts[i]; P[2 * i] = p[0]; P[2 * i + 1] = p[1]; D[4 * i] = T.w[i]; D[4 * i + 1] = T.cs[i]; D[4 * i + 2] = T.knot[i]; D[4 * i + 3] = T.arc[i]; A[i] = T.a[i] * o;
			x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); wm = Math.max(wm, T.w[i]); }
		const m = wm * 9 + 100 * z; gl.uniform2fv(U.uTP, P); gl.uniform4fv(U.uTD, D); gl.uniform1fv(U.uTA, A); gl.uniform4f(U.uTBox, x0 - m, y0 - m, x1 + m, y1 + m); gl.uniform1f(U.uTOn, 1); }
	else gl.uniform1f(U.uTOn, 0);
	gl.drawArrays(gl.TRIANGLES, 0, 3); gl.finish(); };

/** the low-level smoke canvas: an absolutely positioned HTML canvas covering `box` (screen px; default the full 1920×1080 frame) */
export const SmokeCanvas: React.FC<{fr: SmokeFrame; box?: [number, number, number, number]; quality?: number; style?: React.CSSProperties}> = ({fr, box = [0, 0, 1920, 1080], quality = 1, style}) => {
	const ref = useRef<HTMLCanvasElement>(null), st = useRef<GLS | null>(null);
	const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
	const bw = Math.max(2, Math.round(box[2] * dpr * quality)), bh = Math.max(2, Math.round(box[3] * dpr * quality));
	useLayoutEffect(() => { const cv = ref.current; if (!cv) return; if (!st.current) st.current = setup(cv); draw(st.current, fr, box, bw, bh); });
	useEffect(() => () => { const s = st.current; if (s) { s.gl.getExtension('WEBGL_lose_context')?.loseContext(); st.current = null; } }, []);
	return <canvas ref={ref} width={bw} height={bh} style={{position: 'absolute', left: box[0], top: box[1], width: box[2], height: box[3], display: 'block', ...style}} />; };

/** a SmokeFrame for a world-space cloud under a camera */
export const smokeFrame = (p: SmokeProps, cam: Cam52 = CAM0, extra: Partial<SmokeFrame> = {}): SmokeFrame => ({g: smokeGeom(p), cam: cam === CAM0 ? {P: [0, 0], Q: [0, 0], z: 1} : cam, bloom: p.bloom, ...extra});

/** the 火箭云 as smoke: a drop-in for RocketCloud / ParticleRocketCloud (same props; place it inside an <svg>) */
export const SmokeRocketCloud: React.FC<SmokeProps> = (p) => { const g = smokeGeom(p), {C, Rv, Ru, N, F} = g, m = Math.max(Rv, Ru) * 1.5 + g.Rb * 0.9 + 60;
	const x0 = Math.floor(Math.min(C[0] - m, N[0] - m, F[0] - 120)), y0 = Math.floor(Math.min(C[1] - m, N[1] - m, F[1] - 120));
	const x1 = Math.ceil(Math.max(C[0] + m, N[0] + m, F[0] + 120)), y1 = Math.ceil(Math.max(C[1] + m, N[1] + m, F[1] + 120));
	const box: [number, number, number, number] = [x0, y0, x1 - x0, y1 - y0];
	return <foreignObject x={x0} y={y0} width={box[2]} height={box[3]}>
		<div style={{position: 'relative', width: box[2], height: box[3]}}><SmokeCanvas fr={{g, cam: {P: [0, 0], Q: [0, 0], z: 1}, bloom: p.bloom}} box={box} quality={p.quality} style={{left: 0, top: 0}} /></div>
	</foreignObject>; };
