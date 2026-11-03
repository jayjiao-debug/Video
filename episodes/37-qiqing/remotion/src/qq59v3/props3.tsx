import React from 'react';
import {P, f1, lerp, rnd, noise1, spline, taper, qpts, poly, W, Shape, Glow} from './kit3';

/* ep59 v3 · shared set-dressing generators (pure vector paths). All return path strings or small groups in layer space. */

/** a tapered, slightly wandering trunk from y0 (top) to y1 (base) */
export const trunkD = (x: number, y0: number, y1: number, wTop: number, wBot: number, seed: number, flare = 0, wander = 0.25) => {
	const n = 9, L: P[] = [], R: P[] = [];
	for (let i = 0; i <= n; i++) { const u = i / n, y = lerp(y0, y1, u), w = lerp(wTop, wBot, u) + flare * Math.pow(u, 5), cx = x + noise1(u * 2.5, seed) * wTop * wander;
		L.push([cx - w / 2 + noise1(u * 7, seed + 3) * w * 0.04, y]); R.push([cx + w / 2 + noise1(u * 7, seed + 5) * w * 0.04, y]); }
	return spline([...L, ...R.reverse()], true); };
/** an organic blob: a closed spline through n radial points around (x, y) */
export const blobD = (x: number, y: number, rx: number, ry: number, seed: number, n = 9, jag = 0.28) =>
	spline(Array.from({length: n}, (_, i) => { const a = (i / n) * Math.PI * 2, r = 1 + (rnd(i, seed) - 0.5) * 2 * jag; return [x + Math.cos(a) * rx * r, y + Math.sin(a) * ry * r] as P; }), true);
/** a leaf blade from base b, length L, width w, angle a (deg, 0 = right, 90 = down), bending by `bend` (deg over its length) */
export const leafD = (b: P, L: number, w: number, a: number, bend = 0) => {
	const n = 8, mid: P[] = []; let ang = a * Math.PI / 180, x = b[0], y = b[1];
	for (let i = 0; i <= n; i++) { mid.push([x, y]); ang += (bend * Math.PI / 180) / n; x += Math.cos(ang) * L / n; y += Math.sin(ang) * L / n; }
	const Lf: P[] = [], Rf: P[] = [];
	mid.forEach((p, i) => { const u = i / n, q = mid[Math.min(n, i + 1)], o = mid[Math.max(0, i - 1)], dx = q[0] - o[0], dy = q[1] - o[1], l = Math.hypot(dx, dy) || 1, ww = w / 2 * Math.sin(Math.PI * Math.pow(u, 0.75)) ;
		Lf.push([p[0] - dy / l * ww, p[1] + dx / l * ww]); Rf.push([p[0] + dy / l * ww, p[1] - dx / l * ww]); });
	return spline([...Lf, ...Rf.reverse()], true); };
/** a palm frond: a curved rachis from b with drooping leaflets on both sides */
export const frondD = (b: P, L: number, a: number, droop: number, leaflet: number, seed: number, n = 16): string[] => {
	const out: string[] = [], pts: P[] = []; let ang = a * Math.PI / 180, x = b[0], y = b[1];
	for (let i = 0; i <= 12; i++) { pts.push([x, y]); ang += (droop * Math.PI / 180) / 12; x += Math.cos(ang) * L / 12; y += Math.sin(ang) * L / 12; }
	out.push(taper(pts, leaflet * 0.12, leaflet * 0.03));
	for (let i = 1; i < n; i++) { const u = i / n, k = Math.min(11, Math.floor(u * 12)), p = pts[k], q = pts[k + 1], da = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI, len = leaflet * Math.sin(Math.PI * (0.15 + u * 0.8)) * (0.8 + rnd(i, seed) * 0.4);
		for (const s of [-1, 1]) out.push(leafD(p, len, len * 0.16, da + s * (50 + rnd(i, seed + s) * 20) + 25, s * 20)); }
	return out; };
/** a heart-shaped leaf (elephant ear) on a stalk: stalk base s, leaf tip direction a (deg), size r */
export const earLeafD = (s: P, top: P, r: number, a: number) => {
	const ca = Math.cos(a * Math.PI / 180), sa = Math.sin(a * Math.PI / 180), T = (u: number, v: number): string => `${f1(top[0] + u * ca * r - v * sa * r)},${f1(top[1] + u * sa * r + v * ca * r)}`;
	const leaf = `M${T(0, 0)} C${T(-0.3, -0.6)} ${T(-0.15, -1.1)} ${T(0.25, -0.55)} C${T(0.6, -0.3)} ${T(1.1, -0.1)} ${T(1.5, 0.02)} C${T(1.1, 0.12)} ${T(0.6, 0.35)} ${T(0.25, 0.55)} C${T(-0.15, 1.1)} ${T(-0.3, 0.6)} ${T(0, 0)} Z`;
	return [taper(qpts(s, [lerp(s[0], top[0], 0.4), lerp(s[1], top[1], 0.75)], top, 8), r * 0.07, r * 0.04), leaf]; };
/** a hanging liana: a sagging loop from a to b (sag px), thickness w */
export const lianaD = (a: P, b: P, sag: number, w: number) => taper(qpts(a, [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + sag], b, 14), w, w * 0.8);
/** a hanging aerial root / vine straight down from a with a gentle sway */
export const hangD = (a: P, len: number, w: number, sway: number) => taper(Array.from({length: 9}, (_, i) => { const u = i / 8; return [a[0] + Math.sin(u * 2.2) * sway * u, a[1] + u * len] as P; }), w, w * 0.35);
/** grass / reed tufts along a base line: n blades */
export const tuftD = (x: number, y: number, n: number, hgt: number, spread: number, seed: number, lean = 0) =>
	Array.from({length: n}, (_, i) => { const bx = x + (rnd(i, seed) - 0.5) * spread, hh = hgt * (0.5 + rnd(i, seed + 1) * 0.6), ang = -90 + (rnd(i, seed + 2) - 0.5) * 50 + lean;
		return leafD([bx, y], hh, Math.max(2, hh * 0.05), ang, (rnd(i, seed + 3) - 0.5) * 50 + lean * 0.5); }).join(' ');
/** a jagged ice block (convex-ish polygon) at base (x, y), width w, height h */
export const iceBlockPts = (x: number, y: number, w: number, h: number, seed: number): P[] => {
	const tilt = (rnd(seed, 1) - 0.5) * 0.6;
	return [[x - w / 2, y], [x - w / 2 + w * 0.08 * rnd(seed, 2), y - h * (0.55 + 0.3 * rnd(seed, 3))], [x - w * (0.2 - tilt * 0.3), y - h], [x + w * (0.15 + tilt * 0.3), y - h * (0.85 + 0.15 * rnd(seed, 4))], [x + w / 2 - w * 0.06 * rnd(seed, 5), y - h * (0.35 + 0.3 * rnd(seed, 6))], [x + w / 2, y]];
};
/** a bare winter tree (birch / larch) as one filled path set: trunk + branches by recursive forks */
export const bareTreeD = (x: number, y: number, h: number, seed: number, o: {w?: number; spread?: number; depth?: number; droop?: number; lean?: number} = {}): string[] => {
	const {w = h * 0.025, spread = 32, depth = 4, droop = 0, lean = 0} = o, out: string[] = [];
	const grow = (p: P, ang: number, len: number, wd: number, lvl: number, sd: number) => {
		const pts: P[] = []; let a = ang, q: P = [...p] as P;
		for (let i = 0; i <= 5; i++) { pts.push([...q] as P); a += (noise1(i * 0.7, sd) * 6 + droop * (lvl / depth)) * Math.PI / 180; q = [q[0] + Math.cos(a) * len / 5, q[1] + Math.sin(a) * len / 5]; }
		out.push(taper(pts, wd, wd * 0.55));
		if (lvl >= depth) return;
		const kids = lvl === 0 ? 5 : 2 + Math.floor(rnd(lvl, sd) * 2);
		for (let k = 0; k < kids; k++) { const u = lvl === 0 ? 0.35 + 0.6 * (k / kids) : 0.45 + 0.5 * rnd(k, sd + 1), at = pts[Math.round(u * 5)], s = k % 2 ? 1 : -1;
			grow(at, ang + s * (spread * (0.6 + rnd(k, sd + 2) * 0.7)) * Math.PI / 180, len * (lvl === 0 ? 0.42 : 0.6) * (0.7 + rnd(k, sd + 3) * 0.5), wd * 0.5, lvl + 1, sd + k * 13 + 7); }
	};
	grow([x, y], -Math.PI / 2 + lean * Math.PI / 180, h, w, 0, seed);
	return out; };
/** a conifer (larch / spruce) silhouette: a narrow spiky cone */
export const coniferD = (x: number, y: number, h: number, w: number, seed: number, tiers = 9) => {
	const pts: P[] = [[x - w * 0.06, y]];
	for (let i = 0; i < tiers; i++) { const u = i / tiers, yy = y - h * (0.12 + u * 0.86), ww = w * (1 - u) * (0.75 + rnd(i, seed) * 0.5) / 2;
		pts.push([x - ww, yy + h * 0.035], [x - ww * 0.3, yy - h * 0.01]); }
	pts.push([x, y - h]);
	for (let i = tiers - 1; i >= 0; i--) { const u = i / tiers, yy = y - h * (0.12 + u * 0.86), ww = w * (1 - u) * (0.75 + rnd(i, seed + 9) * 0.5) / 2;
		pts.push([x + ww * 0.3, yy - h * 0.01], [x + ww, yy + h * 0.035]); }
	pts.push([x + w * 0.06, y]);
	return poly(pts.map(([px, py], i) => [px, py + (i % 2 ? 0 : h * 0.012)] as P)); };
/** a row of conifers along a base line (a forest edge), as one path */
export const forestD = (x0: number, x1: number, y: number, hgt: number, step: number, seed: number, bottom = 1600) => {
	let d = ''; for (let x = x0, i = 0; x < x1; x += step * (0.6 + rnd(i, seed) * 0.8), i++) d += coniferD(x, y + rnd(i, seed + 2) * hgt * 0.05, hgt * (0.55 + rnd(i, seed + 1) * 0.6), hgt * 0.32, seed + i) + ' ';
	return d + `M${x0},${y - 2} L${x1},${y - 2} L${x1},${bottom} L${x0},${bottom} Z`; };
/** a human silhouette blob for distant crowds (head + shoulders + body), feet at (x, y), height h */
export const personD = (x: number, y: number, h: number, seed: number, arm = 0) => {
	const w = h * (0.24 + rnd(seed, 1) * 0.06), hd = h * 0.13, sh = y - h * 0.8, s = (rnd(seed, 2) - 0.5) * h * 0.04;
	let d = `M${f1(x - w * 0.42)},${f1(y)} L${f1(x - w * 0.5 + s)},${f1(sh + h * 0.08)} Q${f1(x - w * 0.5)},${f1(sh)} ${f1(x - w * 0.2)},${f1(sh - h * 0.02)} L${f1(x + w * 0.2)},${f1(sh - h * 0.02)} Q${f1(x + w * 0.5)},${f1(sh)} ${f1(x + w * 0.5 + s)},${f1(sh + h * 0.08)} L${f1(x + w * 0.42)},${f1(y)} Z`;
	d += ` M${f1(x - hd * 0.75)},${f1(sh - hd * 0.9)} a${f1(hd * 0.75)},${f1(hd)} 0 1,0 ${f1(hd * 1.5)},0 a${f1(hd * 0.75)},${f1(hd)} 0 1,0 ${f1(-hd * 1.5)},0 Z`;
	if (arm) { const ax = x + arm * w * 0.45; d += ' ' + taper([[ax, sh + h * 0.04], [ax + arm * h * 0.08, sh - h * 0.2], [ax + arm * h * 0.06, sh - h * 0.36]], h * 0.07, h * 0.05); }
	return d; };
/** wide horizontal ripple dashes over water between y0 and y1 (denser and thinner toward y0 = far) */
export const ripplesD = (y0: number, y1: number, n: number, seed: number, x0 = -400, x1 = W + 400, len = [40, 260], t = 0, speed = 0) => {
	let d = '';
	for (let i = 0; i < n; i++) { const u = Math.pow(rnd(i, seed), 1.6), y = lerp(y0, y1, u), L = lerp(len[0], len[1], u) * (0.5 + rnd(i, seed + 1)), th = lerp(0.8, 3.2, u), x = x0 + ((rnd(i, seed + 2) * (x1 - x0) + t * speed * (0.5 + u)) % (x1 - x0));
		d += `M${f1(x)},${f1(y)} Q${f1(x + L / 2)},${f1(y - th)} ${f1(x + L)},${f1(y)} Q${f1(x + L / 2)},${f1(y + th * 0.6)} ${f1(x)},${f1(y)} Z `; }
	return d; };
export {poly, spline, taper, qpts};
/** a canopy mass hanging down to y: a solid ceiling with a scalloped lower edge (overlapping clumps) and a fringe of hanging leaves.
    gaps: x-ranges where the ceiling lifts (light comes through). Returns [mass, fringe] paths. */
export const canopyD = (x0: number, x1: number, y: number, seed: number, gaps: [number, number][] = [], t = 0): [string, string] => {
	const lift = (x: number) => gaps.reduce((m, [a, b]) => Math.max(m, x > a - 60 && x < b + 60 ? Math.sin(Math.PI * Math.min(1, Math.max(0, (x - a + 60) / (b - a + 120)))) * 160 : 0), 0);
	let mass = `M${x0},${y - 1400} L${x1},${y - 1400} L${x1},${y - 120} L${x0},${y - 120} Z `, fringe = '';
	for (let i = 0, x = x0; x < x1; i++, x += 46 + rnd(i, seed) * 50) {
		const yy = y - lift(x) + noise1(x / 260, seed) * 50 + rnd(i, seed + 1) * 30, r = 48 + rnd(i, seed + 2) * 60;
		mass += blobD(x, yy - r * 0.6, r * 1.25, r, seed + i, 9, 0.22) + ' ' + `M${f1(x - r * 1.2)},${f1(yy - r * 0.6)} L${f1(x + r * 1.2)},${f1(yy - r * 0.6)} L${f1(x + r)},${f1(y - 1400)} L${f1(x - r)},${f1(y - 1400)} Z `;
		const nf = 2 + Math.floor(rnd(i, seed + 3) * 4);
		for (let k = 0; k < nf; k++) { const bx = x + (rnd(k, i + seed) - 0.5) * r * 2, by = yy + r * 0.1 - rnd(k, i + 5) * r * 0.3, L = 34 + rnd(k, i + 9) * 56;
			fringe += leafD([bx, by], L, L * 0.34, 90 + (rnd(k, i + 4) - 0.5) * 70 + Math.sin(t * 0.7 + i + k) * 3, (rnd(k, i + 6) - 0.5) * 40) + ' '; }
	}
	return [mass, fringe]; };
/** a drooping broad leaf on a stalk: stalk from s up to the leaf base b, the blade hanging out at angle a (deg) */
export const droopLeafD = (s: P, b: P, L: number, a: number, wid = 0.42, bend = 40) =>
	taper(qpts(s, [lerp(s[0], b[0], 0.2), lerp(s[1], b[1], 0.8)], b, 8), Math.max(3, L * 0.05), Math.max(2, L * 0.03)) + ' ' + leafD(b, L, L * wid, a, bend);
/** moss hanging under a branch or log: irregular clumps of strands */
export const mossD = (pts: P[], seed: number, len = 40) => pts.map((p, i) => { const n = 2 + Math.floor(rnd(i, seed) * 4);
	return Array.from({length: n}, (_, k) => { const L = len * (0.3 + rnd(k, i + seed) * 1.2), x = p[0] + (rnd(k, i + seed + 2) - 0.5) * 18;
		return taper([[x, p[1] - 2], [x + (rnd(k, i + 3) - 0.5) * 6, p[1] + L * 0.5], [x + (rnd(k, i + 4) - 0.5) * 10, p[1] + L]], 5 + rnd(k, i) * 5, 1.2); }).join(' '); }).join(' ');

/** side-lit dunes along base y: crests with gentle lit windward faces (toward the light) and steep shadowed slip faces.
    Returns the body (fill it with the shadow colour), the lit faces and a thin crest rim. light = +1: sun on the right. */
export const dunesD = (x0: number, x1: number, y: number, amp: number, wl: number, seed: number, light: 1 | -1 = 1, depth = 0.7): {body: string; lit: string; rim: string} => {
	const pk: P[] = [];
	for (let x = x0 - wl, i = 0; x < x1 + wl; i++) { pk.push([x, y - amp * (0.35 + rnd(i, seed + 1) * 0.65)]); x += wl * (0.6 + rnd(i, seed) * 0.9); }
	const crest: P[] = [], lit: string[] = [], rim: string[] = [], bot = y + amp * depth;
	for (let i = 0; i < pk.length - 1; i++) {
		const [A, B] = light > 0 ? [pk[i], pk[i + 1]] : [pk[i + 1], pk[i]], V: P = [lerp(A[0], B[0], 0.62), y - amp * 0.06 * (1 + rnd(i, seed + 3))];
		const down = qpts(A, [lerp(A[0], V[0], 0.55), lerp(A[1], V[1], 0.15)], V, 8), up = qpts(V, [lerp(V[0], B[0], 0.8), V[1]], B, 6);
		const seg = light > 0 ? [...down, ...up.slice(1)] : [...up.slice().reverse(), ...down.slice(1).reverse()];
		crest.push(...(crest.length ? seg.slice(1) : seg));
		const foot: P = [A[0] - light * amp * 0.25, bot];
		lit.push(spline([...down, [V[0], bot], foot, [A[0] - light * amp * 0.06, lerp(A[1], bot, 0.4)]], true));
		rim.push(taper(down.slice(0, 6), Math.max(1.5, amp * 0.03), 0.5));
	}
	const body = spline([...crest, [crest[crest.length - 1][0], bot + 600], [crest[0][0], bot + 600]], true);
	return {body, lit: lit.join(' '), rim: rim.join(' ')}; };

/** a Bactrian camel in profile (facing +x unless flipped): two humps, long neck, four legs walking (pace gait), optional packs.
    (x, y) = between the feet on the ground, h = hump-top height. Returns path strings: [far legs, body + near legs, packs]. */
export const camelD = (x: number, y: number, h: number, phase: number, pack = true): {far: string; body: string; pack: string} => {
	const u = phase * Math.PI * 2, H = (fx: number, fy: number): P => [x + fx * h, y - fy * h];
	const leg = (hx: number, side: number, front: boolean) => { const sw = Math.sin(u + (side > 0 ? 0 : Math.PI)) * 0.13, hip = H(hx, 0.56), knee = H(hx + sw * 0.7 + (front ? 0.02 : -0.03), 0.3), lift = Math.max(0, Math.cos(u + (side > 0 ? 0 : Math.PI))) * 0.05, foot = H(hx + sw * 1.3, lift);
		return taper([hip, knee, foot], h * (front ? 0.085 : 0.11), h * 0.04) + ' ' + spline([[foot[0] - h * 0.035, foot[1] + 1], [foot[0] + h * 0.06, foot[1] + 1], [foot[0] + h * 0.04, foot[1] - h * 0.035], [foot[0] - h * 0.02, foot[1] - h * 0.03]], true); };
	const bob = Math.sin(u * 2) * 0.012;
	const B = (fx: number, fy: number) => H(fx, fy + bob);
	const body = spline([B(-0.5, 0.62), B(-0.46, 0.8), B(-0.34, 0.86), B(-0.24, 1.0), B(-0.15, 0.86), B(-0.06, 0.84), B(0.04, 0.98), B(0.14, 0.86), B(0.26, 0.8), B(0.36, 0.76),
		B(0.48, 0.66), B(0.58, 0.74), B(0.66, 0.88), B(0.7, 0.93), B(0.8, 0.93), B(0.86, 0.88), B(0.84, 0.85), B(0.74, 0.84), B(0.68, 0.76), B(0.6, 0.6), B(0.5, 0.56), B(0.36, 0.54),
		B(0.2, 0.5), B(0.0, 0.48), B(-0.2, 0.48), B(-0.38, 0.52)], true);
	const tail = taper([B(-0.49, 0.72), B(-0.56, 0.6), B(-0.55, 0.46)], h * 0.04, h * 0.02);
	const ear = taper([B(0.71, 0.92), B(0.7, 0.98)], h * 0.025, h * 0.01);
	const packs = pack ? [spline([B(-0.2, 0.86), B(-0.12, 0.9), B(-0.04, 0.87), B(0.02, 0.84), B(0.04, 0.6), B(-0.06, 0.52), B(-0.2, 0.54), B(-0.24, 0.66)], true),
		spline([B(-0.36, 0.78), B(-0.26, 0.82), B(-0.24, 0.6), B(-0.34, 0.56), B(-0.42, 0.62)], true)].join(' ') : '';
	return {far: [leg(0.28, -1, true), leg(-0.36, -1, false)].join(' '), body: [body, tail, ear, leg(0.3, 1, true), leg(-0.34, 1, false)].join(' '), pack: packs}; };

/** long broken cloud strata (bumpy tops, flat lit undersides), filled with a vertical gradient top → mid → underside.
    bands: [y centre, thickness, seed, opacity]; the lowest bands (index ≥ warmFrom) take the warm underside colour. */
export const CloudBands: React.FC<{bands: [number, number, number, number][]; t: number; top: string; mid: string; under: string; warm: string; warmFrom?: number; id: string; drift?: number}> = ({bands, t, top, mid, under, warm, warmFrom = 3, id, drift = 5}) =>
	<g>{bands.map(([yc, th, seed, o], b) => {
		const segs: string[] = [], dx = t * drift * (1 - b * 0.12);
		for (let x0 = -300 + rnd(b, seed) * 500, j = 0; x0 < W + 300; j++) { const len = (260 + Math.pow(rnd(j, seed), 2) * 1500) * (1 - b * 0.08), gap = (60 + Math.pow(rnd(j, seed + 1), 1.5) * 700) * (1 - b * 0.1), thj = 0.5 + rnd(j, seed + 2) * 0.9, yj = (rnd(j, seed + 3) - 0.5) * th * 0.8;
			const tp: P[] = [], bt: P[] = [];
			for (let k = 0; k <= 16; k++) { const u = k / 16, x = x0 + u * len + dx, env = Math.pow(Math.sin(Math.PI * u), 0.5) * thj;
				tp.push([x, yc + yj - th * env * (0.55 + 0.45 * Math.abs(noise1(x / (60 + b * 10), seed + b)))]); bt.push([x, yc + yj + th * 0.18 * env + noise1(x / 200, seed) * 2]); }
			segs.push(spline([...tp, ...bt.reverse()], true)); x0 += len + gap; }
		return <g key={b}><defs><linearGradient id={`${id}${b}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="0.55" stopColor={mid} /><stop offset="1" stopColor={b >= warmFrom ? warm : under} /></linearGradient></defs>
			<Shape d={segs.join(' ')} fill={`url(#${id}${b})`} o={o} /></g>; })}</g>;

/** one dune mound: left foot → summit → right foot on base `by`; returns {body, lit, crest}. The lit face is the side toward the light
    (light = +1: right), split from the shadow face by an S-curve running from the summit down to the base (the crest line). */
export const moundD = (lx: number, sx: number, sy: number, rx: number, by: number, light: 1 | -1 = 1, bend = 0.3, ext = 900) => {
	const L: P = [lx, by], S: P = [sx, sy], R: P = [rx, by], hgt = by - sy;
	const left = qpts(L, [lerp(lx, sx, 0.55), lerp(by, sy, 1.05)], S, 10), right = qpts(S, [lerp(sx, rx, 0.35), sy - hgt * 0.02], R, 12);
	const toward = light > 0 ? right : left.slice().reverse();
	const footX = sx + (light > 0 ? 1 : -1) * (Math.abs((light > 0 ? rx : lx) - sx)) * 0.18, mid: P = [lerp(sx, footX, 0.5) - (light > 0 ? 1 : -1) * hgt * bend, lerp(sy, by, 0.55)];
	const divide = qpts(S, mid, [footX, by + 2], 10);
	const body = spline([...left, ...right.slice(1)], false) + ` L${f1(rx)},${f1(by + ext)} L${f1(lx)},${f1(by + ext)} Z`;
	const tl = toward[toward.length - 1];
	const lit = spline(toward, false) + ` L${f1(tl[0])},${f1(by + ext)} L${f1(footX)},${f1(by + ext)} L${f1(footX)},${f1(by + 2)} ` + spline(divide.slice().reverse(), false).replace(/^M/, 'L') + ' Z';
	return {body, lit, crest: taper(divide.slice(0, 7), Math.max(1.4, hgt * 0.012), 0.4)}; };
