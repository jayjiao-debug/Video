// ep35 · pushing a boulder, solved backwards from contact points (two-bone IK), shared by the scenes and by the checker.
// Rig facts (Puppet35 Mannequin, local frame: feet ≈ y 0, +x = the way the figure faces, angles: 0 = straight down, + toward +x):
//   hips (18,-232) near / (-14,-232) far · thigh 106 · shin 98 · foot sole 22 below the ankle, heel −14 … toe +42
//   torso rotates by `lean` about (0,-232) · shoulders (sh,-394) · upper arm 84 · forearm 76 · hand 34 from the wrist
//   head rotates by `head` about (0,-406), egg centre (4,-474) rx 31 ry 41 tilted 10°
export type Pt = [number, number];
export type PushPose = {lean: number; head: number; armN: [number, number]; armF: [number, number]; legN: [number, number]; legF: [number, number];
	footN: number; footF: number; shN: number; shF: number; handN: number; handF: number};

const rad = (d: number) => (d * Math.PI) / 180, deg = (r: number) => (r * 180) / Math.PI;
const dirv = (a: number, l: number): Pt => [Math.sin(rad(a)) * l, Math.cos(rad(a)) * l];
const ang = (v: Pt) => deg(Math.atan2(v[0], v[1]));                                       // inverse of dirv
const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]], sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]], mul = (a: Pt, s: number): Pt => [a[0] * s, a[1] * s];
const len = (a: Pt) => Math.hypot(a[0], a[1]);
const rotP = (p: Pt, d: number, c: Pt): Pt => { const a = rad(d), dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * Math.cos(a) - dy * Math.sin(a), c[1] + dx * Math.sin(a) + dy * Math.cos(a)]; };
const rnd2 = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
const L_TH = 106, L_SH = 98, L_UA = 84, L_FA = 76, L_HAND = 34, SOLE = 22, HAND_HALF = 7;

// ---------------------------------------------------------------- the boulder's drawn outline (same maths as Puppet35 rockPath), sampled
const outlineCache = new Map<string, Pt[]>();
/** outline offsets from the centre (unrotated), dense polyline */
const rockOffsets = (r: number, seed: number): Pt[] => {
	const key = `${r}|${seed}`;
	const hit = outlineCache.get(key); if (hit) return hit;
	const R = rnd2(seed), n = 22, pts: Pt[] = [];
	for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const k = 1 + 0.05 * Math.sin(a * 3 + seed) + 0.035 * Math.sin(a * 5 + seed * 2) + 0.03 * (R() - 0.5) - (Math.sin(a) > 0.75 ? 0.05 : 0); pts.push([Math.cos(a) * r * k * 1.03, Math.sin(a) * r * k * 0.95]); }
	const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
	const out: Pt[] = [];
	for (let i = 0; i < n; i++) {
		const p0 = mid(pts[(i - 1 + n) % n], pts[i]), c = pts[i], p1 = mid(pts[i], pts[(i + 1) % n]);
		for (let j = 0; j < 24; j++) { const t = j / 24; out.push([(1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1]]); }
	}
	outlineCache.set(key, out);
	return out;
};
export const rockOutline = (c: Pt, r: number, seed = 3, rot = 0): Pt[] => rockOffsets(r, seed).map((o) => rotP(add(c, o), rot, c));
/** the centre height at which the boulder rests ON the ground line (lowest contact touching, nothing below) */
export const restingCY = (cx: number, r: number, ys: (x: number) => number, seed = 3, rot = 0, sink = 1.5) =>
	Math.min(...rockOffsets(r, seed).map((o) => { const q = rotP(o, rot, [0, 0]); return ys(cx + q[0]) - q[1]; })) + sink;
const segDist = (p: Pt, a: Pt, b: Pt) => { const ab = sub(b, a), t = Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / (ab[0] ** 2 + ab[1] ** 2 || 1))); return len(sub(p, add(a, mul(ab, t)))); };
export const distToPoly = (p: Pt, poly: Pt[]) => { let m = Infinity; for (let i = 0; i < poly.length; i++) m = Math.min(m, segDist(p, poly[i], poly[(i + 1) % poly.length])); return m; };
export const insidePoly = (p: Pt, poly: Pt[]) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
/** where a horizontal line at height y leaves the boulder on its right-hand side (the face he pushes), with the surface tangent there */
const rightFaceAt = (poly: Pt[], y: number): {p: Pt; t: Pt} | null => {
	let best: {p: Pt; t: Pt} | null = null;
	for (let i = 0; i < poly.length; i++) {
		const a = poly[i], b = poly[(i + 1) % poly.length];
		if ((a[1] - y) * (b[1] - y) > 0 || a[1] === b[1]) continue;
		const u = (y - a[1]) / (b[1] - a[1]), p: Pt = [a[0] + (b[0] - a[0]) * u, y];
		if (!best || p[0] > best.p[0]) { const d = sub(b, a); best = {p, t: mul(d, 1 / (len(d) || 1))}; }
	}
	return best;
};

// ---------------------------------------------------------------- two-bone IK (dirv angles)
/** returns the first-bone angle and the second bone's angle relative to it; bend > 0 puts the middle joint on the +angle side */
const ik2 = (root: Pt, target: Pt, l1: number, l2: number, bend: 1 | -1) => {
	const v = sub(target, root), d = Math.min(len(v), l1 + l2 - 1e-6), a = ang(v);
	const b = deg(Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)))));
	const a1 = a + bend * b, mid = add(root, dirv(a1, l1));
	return {a1, a2: ang(sub(target, mid)) - a1, mid, reach: len(v) <= l1 + l2};
};

// ---------------------------------------------------------------- the push
export type PushIn = {
	rock: Pt[];                                   // the boulder's outline, world
	ys: (x: number) => number;                    // the ground line, world
	k: number;                                    // figure scale
	lean?: number; head?: number; reach?: number; // torso tilt (°), head relative to spine, arm reach as a fraction of full length
	feet: {n: number; f: number; liftN?: number; liftF?: number};   // foot x in the figure's frame (forward +, from the hip centre), lifts in local units
	worldFeet?: {n: Pt; f: Pt};                   // planted feet held in world (overrides `feet` x)
	hipH?: number;                                // hip-centre height above the ground under it (local units)
};
export type PushOut = {pose: PushPose; o: Pt; shadow: Pt; feetW: {n: Pt; f: Pt}};
/** figure faces −x in world (pushing uphill to the left); local x = (ox − wx)/k, local y = (wy − oy)/k */
export const solvePush = (inp: PushIn): PushOut => {
	const {rock, ys, k} = inp, lean = inp.lean ?? 45, head = inp.head ?? -2, reach = inp.reach ?? 0.985, hipH = inp.hipH ?? 156;
	const shN = 6, shF = -6;
	const minX = Math.min(...rock.map((p) => p[0])), maxX = Math.max(...rock.map((p) => p[0]));
	const build = (ox: number) => {
		const oy = ys(ox) + (232 - hipH) * k;                                   // hip centre sits hipH above the ground under it
		const toW = (p: Pt): Pt => [ox - k * p[0], oy + k * p[1]], toL = (w: Pt): Pt => [(ox - w[0]) / k, (w[1] - oy) / k];
		const torso = (p: Pt) => rotP(p, lean, [0, -232]), untorso = (p: Pt) => rotP(p, -lean, [0, -232]);
		const sN = torso([shN, -394]), sF = torso([shF, -394]);
		return {oy, toW, toL, torso, untorso, sN, sF};
	};
	// place the body so the near arm reaches the face at shoulder height with the chosen straightness
	const want = reach * (L_UA + L_FA);
	const gap = (ox: number) => {
		const b = build(ox), sW = b.toW(b.sN), f = rightFaceAt(rock, sW[1]);
		if (!f) return 1e3;
		const n: Pt = [f.t[1], -f.t[0]], nOut: Pt = n[0] > 0 ? n : mul(n, -1);
		const tUp: Pt = f.t[1] < 0 ? f.t : mul(f.t, -1);
		const wrist = add(add(f.p, mul(tUp, -L_HAND / 2 * k)), mul(nOut, HAND_HALF * k));
		return len(sub(b.toL(wrist), b.sN)) - want;
	};
	let lo = minX, hi = maxX + 1600;
	for (let i = 0; i < 48; i++) { const m = (lo + hi) / 2; if (gap(m) < 0) lo = m; else hi = m; }
	const ox = (lo + hi) / 2, B = build(ox);
	// arms: palms flat on the surface at each shoulder's height, wrist bent so the hand lies along the rock
	const arm = (s: Pt) => {
		const sW = B.toW(s), f = rightFaceAt(rock, sW[1])!;
		const n: Pt = [f.t[1], -f.t[0]], nOut: Pt = n[0] > 0 ? n : mul(n, -1), tUp: Pt = f.t[1] < 0 ? f.t : mul(f.t, -1);
		const wristW = add(add(f.p, mul(tUp, -L_HAND / 2 * k)), mul(nOut, HAND_HALF * k)), tipW = add(wristW, mul(tUp, L_HAND * k));
		const wT = B.untorso(B.toL(wristW)), tT = B.untorso(B.toL(tipW));
		const sol = ik2(s0(s), wT, L_UA, L_FA, -1);                            // elbow below the shoulder–wrist line
		return {ua: sol.a1, fa: sol.a2, hand: ang(sub(tT, wT))};
	};
	const s0 = (s: Pt) => B.untorso(s);
	const aN = arm(B.sN), aF = arm(B.sF);
	// feet: soles on the ground line, toes along the slope; legs by IK from each hip, knees forward
	const gL = (x: number) => (ys(ox - k * x) - B.oy) / k;                       // ground height in the figure's frame
	const foot = (xl: number, lift = 0) => {
		const g = gL(xl), s = (gL(xl + 0.5) - gL(xl - 0.5));                     // slope in local frame (dy/dx)
		const nrm: Pt = mul([s, -1], 1 / Math.hypot(s, 1));
		return {ank: add(add([xl, g], mul(nrm, SOLE)), [0, -lift]), rot: deg(Math.atan(s))};
	};
	const fxN = inp.worldFeet ? B.toL(inp.worldFeet.n)[0] : inp.feet.n, fxF = inp.worldFeet ? B.toL(inp.worldFeet.f)[0] : inp.feet.f;
	const fN = foot(fxN, inp.feet.liftN ?? 0), fF = foot(fxF, inp.feet.liftF ?? 0);
	const lN = ik2([18, -232], fN.ank, L_TH, L_SH, 1), lF = ik2([-14, -232], fF.ank, L_TH, L_SH, 1);
	const pose: PushPose = {lean, head, armN: [aN.ua, aN.fa], armF: [aF.ua, aF.fa], handN: aN.hand, handF: aF.hand,
		legN: [lN.a1, lN.a2], legF: [lF.a1, lF.a2], footN: fN.rot, footF: fF.rot, shN, shF};
	return {pose, o: [ox, B.oy], shadow: [ox, ys(ox) + 4], feetW: {n: B.toW([fxN, gL(fxN)]), f: B.toW([fxF, gL(fxF)])}};
};

// ---------------------------------------------------------------- forward kinematics of the drawn figure (for the checker)
export const fk = (pose: PushPose) => {
	const torso = (p: Pt) => rotP(p, pose.lean, [0, -232]);
	const arm = (sx: number, [ua, fa]: [number, number], hand: number) => { const s: Pt = [sx, -394], el = add(s, dirv(ua, L_UA)), wr = add(el, dirv(ua + fa, L_FA)), tip = add(wr, dirv(hand, L_HAND)); return {s: torso(s), el: torso(el), wr: torso(wr), tip: torso(tip)}; };
	const leg = (hx: number, [th, sh]: [number, number], rot: number) => { const hip: Pt = [hx, -232], knee = add(hip, dirv(th, L_TH)), ank = add(knee, dirv(th + sh, L_SH)); return {hip, knee, heel: rotP([ank[0] - 14, ank[1] + SOLE], rot, ank), toe: rotP([ank[0] + 42, ank[1] + SOLE], rot, ank), ank}; };
	const headPts: Pt[] = Array.from({length: 48}, (_, i) => { const a = (i / 48) * Math.PI * 2; return torso(rotP(rotP([4 + 31 * Math.cos(a), -474 + 41 * Math.sin(a)], 10, [4, -474]), pose.head, [0, -406])); });
	return {handN: arm(pose.shN, pose.armN, pose.handN), handF: arm(pose.shF, pose.armF, pose.handF), legN: leg(18, pose.legN, pose.footN), legF: leg(-14, pose.legF, pose.footF), head: headPts,
		body: [torso([0, -300]), torso([0, -394]), torso([-30, -320]), torso([30, -320])] as Pt[]};
};

// ---------------------------------------------------------------- stepping: feet move by targets, planted while the body travels
/** foot x in the figure's frame (forward +) for body travel s (local units); stride S; plant A ahead of the hip, lift 75 % through */
export const stepFeet = (s: number, S = 150, A = 50, sw = 0.15, off = 0) => {
	const one = (phase: number) => {
		const u = s / S + phase + off, f = u - Math.floor(u);
		if (f < 1 - sw) return {x: A - f * S, lift: 0};
		const q = (f - (1 - sw)) / sw;
		return {x: A - (1 - sw) * S + q * (1 - sw) * S, lift: 30 * Math.sin(Math.PI * q)};      // a quick shuffle forward, then planted again
	};
	return {n: one(0), f: one(0.5)};
};
/** reach-driven stepping: each foot stays planted until its leg is ~straight behind the hip (liftN/liftF, local x), then shuffles forward to A */
export const stepFeet2 = (s: number, A = 40, liftN = -86, liftF = -104, sw = 0.15, offN = 0, offF = 0.5) => {
	const one = (lift: number, off: number) => {
		const S = (A - lift) / (1 - sw), u = s / S + off, f = u - Math.floor(u);
		if (f < 1 - sw) return {x: A - f * S, lift: 0};
		const q = (f - (1 - sw)) / sw;
		return {x: lift + q * (A - lift), lift: 30 * Math.sin(Math.PI * q)};
	};
	return {n: one(liftN, offN), f: one(liftF, offF)};
};
