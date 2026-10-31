import React from 'react';
/* ep54 look A 「铜灯影 · 纯剪影」: the silhouette kit. Every person is ONE warm-black shape (the union of capsules, a robe hull,
   a profile head and its Han headwear); light only touches the edges (RimF, a per-group rim filter as in 马首's kit.js).
   Units: a figure is 100 units tall (sole → crown, headwear extra); the origin is the HIP joint, x forward (the way he faces),
   y down. A standing figure's soles are 50 units below the hip, a kneeling one's 26. Arm / leg angles are ABSOLUTE screen
   angles in the figure's own facing: 0 = straight down, 90 = forward, 180 = straight up, negative = backward. */
export type V = [number, number];
export const SIL = '#140D0A';
const R = Math.PI / 180;
export const dv = (deg: number): V => [Math.sin(deg * R), Math.cos(deg * R)];
export const ad = (a: V, b: V, k = 1): V => [a[0] + b[0] * k, a[1] + b[1] * k];
export const lp = (a: V, b: V, u: number): V => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
const rot = (p: V, deg: number): V => { const c = Math.cos(deg * R), s = Math.sin(deg * R); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };
const f = (v: number) => v.toFixed(2);
/** tapered capsule from a (radius ra) to b (radius rb) */
export const cap = (a: V, b: V, ra: number, rb: number) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-3, n: V = [-dy / L, dx / L];
	return `M${f(a[0] + n[0] * ra)},${f(a[1] + n[1] * ra)} L${f(b[0] + n[0] * rb)},${f(b[1] + n[1] * rb)} A${f(rb)},${f(rb)} 0 0 0 ${f(b[0] - n[0] * rb)},${f(b[1] - n[1] * rb)} L${f(a[0] - n[0] * ra)},${f(a[1] - n[1] * ra)} A${f(ra)},${f(ra)} 0 0 0 ${f(a[0] + n[0] * ra)},${f(a[1] + n[1] * ra)} Z`; };
/** closed Catmull-Rom curve through pts */
export const smooth = (p: V[], k = 0.5) => { const n = p.length; let d = `M${f(p[0][0])},${f(p[0][1])}`;
	for (let i = 0; i < n; i++) { const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
		d += ` C${f(p1[0] + (p2[0] - p0[0]) * k / 3)},${f(p1[1] + (p2[1] - p0[1]) * k / 3)} ${f(p2[0] - (p3[0] - p1[0]) * k / 3)},${f(p2[1] - (p3[1] - p1[1]) * k / 3)} ${f(p2[0])},${f(p2[1])}`; }
	return d + ' Z'; };
/** convex hull (monotone chain), counter-clockwise */
export const hull = (pts: V[]) => { const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o: V, a: V, b: V) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
	const lo: V[] = [], up: V[] = []; for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
	for (const q of [...p].reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
	return lo.slice(0, -1).concat(up.slice(0, -1)); };

/* ---------- filters ---------- */
/** rim light: lights the inner edge of a silhouette group on the side facing the light at (−dx, −dy) (px, the group untransformed) */
export const RimF: React.FC<{id: string; dx: number; dy: number; col: string; w?: number; blur?: number}> = ({id, dx, dy, col, w = 1, blur = 1.2}) =>
	<filter id={id} filterUnits="userSpaceOnUse" x={-200} y={-200} width={2320} height={1480} colorInterpolationFilters="sRGB">
		<feOffset in="SourceAlpha" dx={dx} dy={dy} result="o" /><feComposite in="SourceAlpha" in2="o" operator="out" result="e" />
		<feGaussianBlur in="e" stdDeviation={blur} result="eb" /><feFlood floodColor={col} floodOpacity={w} /><feComposite in2="eb" operator="in" result="rim" />
		<feComposite in="rim" in2="SourceAlpha" operator="in" result="rimIn" />
		<feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="rimIn" /></feMerge></filter>;
export const BlurF: React.FC<{id: string; s: number}> = ({id, s}) => <filter id={id} filterUnits="userSpaceOnUse" x={-200} y={-200} width={2320} height={1480}><feGaussianBlur stdDeviation={s} /></filter>;

/* ---------- heads (head units ×10 → scale 0.165; origin = the neck base, facing +x) ---------- */
const HEAD = 'M-10,0 C-11,-14 -13,-26 -15,-40 C-21,-52 -24,-70 -20,-84 C-15,-98 -2,-106 10,-102 C18,-99 21,-90 21,-80 L22,-70 C22,-66 24,-60 27,-55 L27,-53 C25,-51 23,-50 22,-49 L22,-46 L20.5,-44.5 L22,-42 C22,-38 21,-35 18,-33 C14,-31 10,-28 8,-22 L7,0 Z';
export type Hat = 'jinxian' | 'wuguan' | 'ze' | 'helmet' | 'bun' | 'richze';
const HATS: Record<Hat, string> = {
	/* 进贤冠: the 介帻 cap, the 展筩 plate rising from the brow and slanting back, a hairpin out the back */
	jinxian: 'M22,-84 C20,-98 8,-108 -6,-108 C-18,-106 -25,-96 -25,-82 L-20,-79 C-10,-86 6,-88 22,-84 Z M19,-95 L1,-147 C-2,-151 -9,-151 -11,-146 L-19,-102 Z M-34,-99 L14,-104 L14,-101 L-34,-96 Z',
	/* 武冠 (武弁大冠): a rounded cage-cap over a 帻, higher at the back, with a short ridge; strap to the chin */
	wuguan: 'M23,-82 C24,-100 14,-117 -2,-121 C-17,-124 -29,-113 -29,-92 L-27,-74 C-14,-84 6,-87 23,-82 Z M-12,-122 L-9,-133 L5,-129 L3,-119 Z',
	/* 平上帻: a cap with a flat raised back */
	ze: 'M22,-84 C20,-98 8,-106 -4,-106 L-6,-117 L-24,-115 C-28,-103 -27,-90 -24,-80 C-12,-86 6,-88 22,-84 Z',
	/* 兜鍪: a rounded helmet with a flared neck guard, a finial and a tassel */
	helmet: 'M23,-80 C24,-98 12,-112 -4,-112 C-20,-112 -30,-100 -30,-80 L-35,-48 C-28,-43 -20,-44 -16,-50 L-16,-70 C-6,-78 8,-82 23,-80 Z M-7,-111 L-4,-127 L0,-111 Z M-4,-127 C-14,-133 -21,-127 -25,-114 C-17,-120 -10,-122 -4,-127 Z',
	bun: 'M-12,-100 C-18,-112 -8,-120 0,-114 C4,-110 2,-104 -4,-102 Z',
	/* a rich man's tall 帻 with a long pin and a tassel */
	richze: 'M22,-84 C20,-100 8,-110 -6,-110 L-8,-124 L-26,-121 C-30,-106 -28,-92 -25,-80 C-12,-86 6,-88 22,-84 Z M-38,-112 L10,-118 L10,-115 L-38,-109 Z M-38,-110 C-44,-104 -44,-96 -40,-90 L-38,-91 C-41,-96 -41,-103 -36,-109 Z',
};
const BEARD = {short: 'M21.5,-41 C22.5,-33 19,-23 12,-19 C8,-18 6,-21 7,-25 L10,-31 Z', long: 'M21,-40 C23,-26 19,-8 11,-1 C7,-6 5,-15 6,-24 L10,-31 Z'};

/* ---------- the figure ---------- */
export type Arm = [number, number];           /* [upper-arm angle, forearm angle] (absolute) */
export type Prop = {kind: 'rod' | 'ji' | 'torch' | 'dao' | 'reins' | 'none'; ang?: number; col?: string; len?: number};
export type FigP = {
	x: number; y: number; s: number; dir?: 1 | -1;      /* hip position (px), px per unit, facing */
	lean?: number; tilt?: number;                           /* torso lean (deg, + forward), head tilt (deg, + down) */
	fa: Arm; ba: Arm;                                       /* front arm, back arm */
	fl?: Arm; bl?: Arm;                                     /* legs [thigh, shin] */
	dress?: 'robe' | 'tunic' | 'armour'; hat?: Hat; beard?: 'short' | 'long'; belly?: number; sleeve?: number;
	fp?: Prop; bp?: Prop; dao?: boolean; bundle?: boolean; cloak?: boolean; fill?: string; detail?: string; lamel?: boolean;
};
export type FigOut = {el: React.ReactElement; hand: V; neck: V; head: V};
/** world point of a unit point p of figure P */
export const wpt = (P: FigP, p: V): V => [P.x + (P.dir ?? 1) * P.s * p[0], P.y + P.s * p[1]];

export const PropEl: React.FC<{p: Prop; at: V}> = ({p, at}) => { const a = p.ang ?? 150, d = dv(a), L = p.len ?? 40, n: V = [-d[1], d[0]];
	const T = (k: number, w = 0): V => ad(ad(at, d, k), n, w);
	if (p.kind === 'none' || p.kind === 'reins') return null;
	if (p.kind === 'rod') { /* 五色棒: a turned wooden rod, painted; carried here as a lit prop (col = its paint) */
		const a0 = T(-L * 0.18), a1 = T(L * 0.82);
		return <g><path d={cap(a0, a1, 0.95, 0.95)} fill={p.col ?? '#8E3A26'} />
			<path d={`M${f(T(-L * 0.18, 0.35)[0])},${f(T(-L * 0.18, 0.35)[1])} L${f(T(L * 0.82, 0.35)[0])},${f(T(L * 0.82, 0.35)[1])}`} stroke="#FFE7BE" strokeOpacity={0.55} strokeWidth={0.35} fill="none" />
			{[0.08, 0.7, 0.76].map((u, i) => { const q = T(-L * 0.18 + L * u); return <circle key={i} cx={q[0]} cy={q[1]} r={1.05} fill="#1A110C" opacity={0.75} />; })}</g>; }
	if (p.kind === 'ji') { /* 戟: a long shaft, a spear point and a side blade (戈) */
		const top = T(L), sh = T(-L * 0.35); const b0 = T(L - 6), side = ad(b0, n, -7), side2 = ad(T(L - 9), n, -6.4);
		return <g fill={p.col ?? SIL}><path d={cap(sh, top, 0.55, 0.45)} />
			<path d={`M${f(T(L + 6)[0])},${f(T(L + 6)[1])} L${f(T(L - 1, 1.1)[0])},${f(T(L - 1, 1.1)[1])} L${f(T(L - 1, -1.1)[0])},${f(T(L - 1, -1.1)[1])} Z`} />
			<path d={`M${f(T(L - 4.5, 0)[0])},${f(T(L - 4.5, 0)[1])} L${f(side[0])},${f(side[1])} L${f(side2[0])},${f(side2[1])} L${f(T(L - 7, 0)[0])},${f(T(L - 7, 0)[1])} Z`} /></g>; }
	if (p.kind === 'torch') { const tip = T(L * 0.6), sh = T(-L * 0.25);
		return <g><path d={cap(sh, tip, 0.7, 1.2)} fill={SIL} /></g>; }
	return null; };

export const Fig = (P: FigP): FigOut => {
	const dir = P.dir ?? 1, s = P.s, lean = P.lean ?? 0, belly = P.belly ?? 0, dress = P.dress ?? 'robe';
	const B = (p: V): V => rot(p, lean);
	const S = B([0, -30]), N = B([1.2, -33.2]), Sb = ad(S, [-1.2, 0.6]);
	const fl = P.fl ?? [6, 2], bl = P.bl ?? [-5, -2];
	const leg = (a: Arm) => { const K = ad([0, 0], dv(a[0]), 24), A = ad(K, dv(a[1]), 23.5); return {K, A}; };
	const LF = leg(fl), LB = leg(bl);
	const arm = (sh: V, a: Arm) => { const E = ad(sh, dv(a[0]), 17.5), Wr = ad(E, dv(a[1]), 14.5), Hd = ad(Wr, dv(a[1]), 2.4); return {E, Wr, Hd}; };
	const AF = arm(S, P.fa), AB = arm(Sb, P.ba);
	const foot = (A: V, k = 1) => `M${f(A[0] - 2.6)},${f(A[1] - 1.5)} L${f(A[0] + 2)},${f(A[1] - 2.2)} C${f(A[0] + 6)},${f(A[1] - 1.2)} ${f(A[0] + 8.4 * k)},${f(A[1] - 0.6)} ${f(A[0] + 9 * k)},${f(A[1] - 2.2)} L${f(A[0] + 9.2 * k)},${f(A[1] + 0.6)} L${f(A[0] - 2.8)},${f(A[1] + 0.6)} Z`;
	const torso: V[] = (dress === 'armour' ? [[2.5, -34], [9, -31], [11.5, -22], [10.5 + belly, -12], [8.5 + belly * 0.6, -1], [-8.5, -1], [-9.5, -14], [-9.5, -27], [-6, -33], [-1, -35.5]]
		: [[2.4, -34], [8, -30.5], [10, -22], [9 + belly, -12], [7.4 + belly * 0.6, -1.5], [-7.4, -1.5], [-8.2, -14], [-8.2, -26], [-5, -32.5], [-1, -35.5]]).map((p) => B(p as V));
	/* the skirt: robe → hull over waist, knees and ankles (to the hem); tunic / armour → to just above the knee */
	const wF = B([7 + belly * 0.6, -3]), wB = B([-7.5, -3]);
	let skirt: V[];
	if (dress === 'robe') skirt = hull([wF, wB, ad(LF.K, [6, 0]), ad(LF.K, [-6, 0]), ad(LB.K, [6, 0]), ad(LB.K, [-6, 0]), ad(LF.A, [6, -2.2]), ad(LF.A, [-6.5, -2.2]), ad(LB.A, [6, -2.2]), ad(LB.A, [-6.5, -2.2])]);
	else { const kF = lp([0, 0], LF.K, 0.78), kB = lp([0, 0], LB.K, 0.78), fl2 = dress === 'armour' ? 8 : 6.5; skirt = hull([wF, wB, ad(kF, [fl2, 0]), ad(kF, [-fl2, 0]), ad(kB, [fl2, 0]), ad(kB, [-fl2, 0])]); }
	const sleeve = (a: {E: V; Wr: V}, drop: number) => { const P1 = lp(a.E, a.Wr, 0.86), M = lp(a.E, a.Wr, 0.5);
		return smooth(hull([ad(P1, [0, -1.6]), ad(P1, [0, drop * 0.85]), ad(M, [0, drop]), ad(a.E, [0, 3.5]), ad(a.E, [-2.4, 0]), ad(a.E, [2.4, -0.5])]), 0.35); };
	const drop = P.sleeve ?? (dress === 'robe' ? 7.5 : 0);
	const headT = `translate(${f(N[0])},${f(N[1])}) rotate(${f(lean * 0.6 + (P.tilt ?? 0))}) scale(0.165)`;
	const fill = P.fill ?? SIL, det = P.detail ?? '#2C1E16';
	const limb = (a: {E: V; Wr: V; Hd: V}, sh: V, armour: boolean) => <>
		<path d={cap(sh, a.E, 3.5, 2.8)} /><path d={cap(a.E, a.Wr, 2.8, 2.1)} /><ellipse cx={a.Hd[0]} cy={a.Hd[1]} rx={2.5} ry={2.5} />
		{drop > 0 && <path d={sleeve(a, drop)} />}
		{armour && <path d={smooth(hull([ad(sh, [-5.5, -2.5]), ad(sh, [5.5, -2.5]), ad(lp(sh, a.E, 0.62), [5, 0]), ad(lp(sh, a.E, 0.62), [-5, 0])]), 0.4)} />}</>;
	const legEl = (L: {K: V; A: V}) => <><path d={cap([0, 0], L.K, 4.6, 3.6)} /><path d={cap(L.K, L.A, 3.5, 2.3)} /><path d={foot(L.A)} /></>;
	const el = <g transform={`translate(${f(P.x)},${f(P.y)}) scale(${f(dir * s)},${f(s)})`} fill={fill}>
		{P.cloak && <path d={smooth([B([-4, -33]), B([-14, -20]), [-22, 18], [-26, 40], [-12, 44], [-8, 10], B([-8, -10]), B([-6, -28])], 0.45)} />}
		{P.bp && <PropEl p={P.bp} at={AB.Hd} />}
		{limb(AB, Sb, dress === 'armour')}
		{legEl(LB)}{legEl(LF)}
		<path d={smooth(torso, 0.4)} /><path d={smooth(skirt, 0.32)} />
		{P.bundle && <g><path d={smooth([B([-7, -33]), B([-17, -36]), B([-21, -10]), B([-12, -4]), B([-7, -10])], 0.4)} />
			{[-34, -27, -20, -13].map((y, i) => <path key={i} d={cap(B([-6, y]), B([-26 + i, y - 4]), 0.5, 0.4)} />)}</g>}
		{P.dao && <g><path d={cap(B([-7, -6]), B([-30, 9]), 1.1, 0.9)} /><circle cx={B([6, -8])[0]} cy={B([6, -8])[1]} r={1.7} fill="none" stroke={fill} strokeWidth={0.8} /><path d={cap(B([-6, -5.5]), B([4.6, -7.8]), 0.8, 0.8)} /></g>}
		<g transform={headT}><path d={HEAD} />{P.hat && <path d={HATS[P.hat]} />}{P.beard && <path d={BEARD[P.beard]} />}</g>
		{/* low-contrast costume detail: collar crossing (右衽), belt, lamellar rows on armour */}
		{P.detail !== 'none' && <g fill="none" stroke={det} strokeWidth={0.55} strokeLinecap="round">
			<path d={`M${f(B([3, -33])[0])},${f(B([3, -33])[1])} L${f(B([-3, -20])[0])},${f(B([-3, -20])[1])}`} />
			<path d={`M${f(B([-8, -4.5])[0])},${f(B([-8, -4.5])[1])} L${f(B([8.5 + belly * 0.6, -4.5])[0])},${f(B([8.5 + belly * 0.6, -4.5])[1])}`} strokeWidth={1.3} />
			{P.lamel && [-28, -24, -20, -16, -12, -8].map((y, i) => <path key={i} d={`M${f(B([-8, y])[0])},${f(B([-8, y])[1])} L${f(B([9.5, y])[0])},${f(B([9.5, y])[1])}`} strokeDasharray="1.6 0.6" />)}
			{P.lamel && [2, 5.5, 9].map((y, i) => { const kF = lp([0, 0], LF.K, 0.3 + i * 0.16); return <path key={`k${i}`} d={`M${f(kF[0] - 7)},${f(kF[1])} L${f(kF[0] + 7)},${f(kF[1])}`} strokeDasharray="1.6 0.6" />; })}</g>}
		{limb(AF, S, dress === 'armour')}
		{P.fp && <PropEl p={P.fp} at={AF.Hd} />}
	</g>;
	return {el, hand: wpt(P, AF.Hd), neck: wpt(P, N), head: wpt(P, ad(N, [2, -10]))};
};

/* ---------- the horse (Han type: arched crest, cropped mane with a tuft, knotted tail), facing +x, hooves at y = 0 ----------
   ph = the walk phase (radians) */
export const HORSE = 'M22,-88 C12,-82 0,-80 -14,-82 C-24,-84 -32,-88 -38,-85 C-44,-82 -48,-74 -48,-66 C-47,-58 -44,-52 -38,-50 C-26,-46 -10,-45 4,-46 C14,-46 22,-49 30,-54 C38,-58 43,-64 45,-72 C46,-78 46,-82 50,-90 C54,-97 58,-102 63,-105 C68,-104 74,-102 79,-100 C82,-101 84,-104 83,-108 C80,-114 76,-120 71,-126 C69,-130 66,-134 63,-136 L62,-144 L58,-137 L56,-139 L54,-131 C46,-128 38,-118 32,-106 C29,-99 26,-93 22,-88 Z';
export const Horse: React.FC<{ph: number; tail?: number}> = ({ph}) => {
	const leg = (hx: number, hy: number, a1: number, a2: number, hind: boolean) => { const K = ad([hx, hy], dv(a1), hind ? 24 : 26), F = ad(K, dv(a2), 22), Hf = ad(F, dv(a2 + (hind ? 10 : 8)), 5);
		return <><path d={cap([hx, hy], K, hind ? 8 : 6, 3.4)} /><path d={cap(K, F, 3, 2.2)} /><path d={cap(F, Hf, 2.4, 2.8)} /></>; };
	const s1 = Math.sin(ph), s2 = Math.sin(ph + Math.PI);
	return <g>
		<path d={HORSE} />
		{/* knotted tail: a short raised dock, a knot, the tied tail dropping */}
		<path d="M-44,-82 C-52,-84 -58,-80 -60,-72 C-62,-64 -58,-56 -56,-50 L-52,-51 C-53,-58 -55,-66 -52,-72 C-50,-77 -46,-79 -43,-78 Z" />
		<ellipse cx={-56} cy={-74} rx={4.5} ry={3.5} />
		{/* cropped mane tuft (a Han 三花-like crop) */}
		<path d="M54,-131 L50,-138 L48,-130 L44,-134 L42,-125 L38,-128 L36,-118 L32,-112 L46,-122 Z" />
		{leg(32, -58, 8 + 18 * s1, -4 + 22 * Math.max(0, s1), false)}{leg(26, -58, 8 + 18 * s2, -4 + 22 * Math.max(0, s2), false)}
		{leg(-36, -60, -6 + 16 * s2, -28 + 10 * s2, true)}{leg(-30, -60, -6 + 16 * s1, -28 + 10 * s1, true)}
	</g>; };
