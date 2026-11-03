import React from 'react';
import {P, f1, lerp, rnd, noise1, spline, taper, qpts, poly, W} from './kit3';

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
	return poly(pts); };
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
