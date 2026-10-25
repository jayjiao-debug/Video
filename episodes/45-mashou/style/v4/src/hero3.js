// ep45 hero r3 (gate 2b r2 note 1): the 圆明园 horse head redrawn against the press photos (新京报, 新华社, 人民日报; reference
// only, never traced, never on screen). Flat vector, hard tone planes, in our 铜灯影 family.
// What the photos say, and what this draws:
//  · colour: a DARK near-black brown patina; the shape is carried by copper rim light and soft lit planes, not by orange paint.
//    Face and mane share one dark value, so nothing reads as stripes.
//  · face: long, smooth, tapering (muzzle tip → ear base ≈ 2.3 × jaw depth); a cheek plate with one hard edge from the throat to
//    the mouth corner; a straight nasal line; a soft rounded muzzle with a flared comma nostril; the mouth slightly open (spout).
//  · eye: large, bulging, glossy, lid rims, no eyebrow; the brow is a lit plane edge.
//  · ears: cupped leaves; the near one's top third rolls forward over itself (「有一只耳朵是卷的」), as thick as the far ear.
//  · mane: parted on the crest; many long S-wave locks run down along the neck, each with fine grooves, overlapping like flames,
//    ending in forked flame tips that hang free below the neck cut.
//  · base: a straight neck cut with a slight flare. base:'block' adds the dark post + black marble block of the exhibit;
//    'seat' sits the cut in a fountain robe (no ring); 'cut' is the bare head (carried).
// Local frame (as v3/v4, so placements hold): faces LEFT; ear tips y≈40; neck cut y=850; block top / placement point (836, 950);
// height 925 → px via o.h.  opts: {x, y, h, flip, curl (0 straight, 1 near ear rolled), glow, key (light on the planes, 1 = normal),
// mood: warm|fire|cool, refl (window colour), base: 'block'|'seat'|'cut', block: {w, h} (local units)}
(() => {
const G = {piv: [712, 150], ang: -20, sc: 1.32, cut: 830};
const D2R = Math.PI / 180;
const hp = ([x, y]) => { const a = G.ang * D2R, c = Math.cos(a), s = Math.sin(a); x *= G.sc; y *= G.sc; return [G.piv[0] + x * c - y * s, G.piv[1] + x * s + y * c]; };
const HT = `translate(${G.piv[0]},${G.piv[1]}) rotate(${G.ang}) scale(${G.sc})`;
const f1 = (v) => (Math.round(v * 10) / 10).toString();
const P = (p) => f1(p[0]) + ',' + f1(p[1]);
const rnd = (i) => { const x = Math.sin(i * 91.7 + 13.3) * 43758.5453; return x - Math.floor(x); };
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixC = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * Math.max(0, Math.min(1, t))).toString(16).padStart(2, '0')).join(''); };

/* ---------- head (head-local: nose to the LEFT along −x, poll at 0,0, y down) ---------- */
// muzzle tip → ear base ≈ 620; depth at the mouth corner ≈ 240 (×2.6); the jowl is deep and round and sits just above the cut
const HEAD = `M0,0 C-50,-8 -110,0 -164,12 C-280,26 -410,40 -512,50 C-572,56 -616,94 -620,142 C-622,178 -608,200 -580,206
C-548,214 -500,236 -452,262 L-450,270 C-490,258 -530,240 -561,233 C-569,246 -569,268 -558,284 C-544,302 -500,308 -442,304
C-360,308 -290,336 -236,386 C-190,428 -140,458 -86,462 C-36,464 0,444 14,414 C30,380 40,330 44,280 C46,170 24,64 0,0 Z`;
const MOUTH_IN = `M-588,204 C-548,214 -500,236 -452,262 L-450,272 C-490,260 -530,242 -563,233 C-576,228 -586,218 -588,204 Z`;
const TOP_PLANE = `M14,-30 L0,0 C-50,-8 -110,0 -164,12 C-280,26 -410,40 -512,50 C-556,54 -592,76 -608,108 L-574,106
C-562,90 -540,84 -514,82 C-410,72 -290,62 -180,50 C-120,44 -64,40 -20,46 Z`;
const REFL = `M-150,20 C-260,32 -390,46 -490,58 C-520,60 -546,70 -562,86 L-556,92 C-540,80 -518,74 -490,72 C-390,60 -262,48 -150,34 Z`;
const UPPER_SIDE = `M-20,46 C-64,40 -120,44 -180,50 C-290,62 -410,72 -514,82 C-540,84 -562,92 -574,108 L-590,170
C-560,186 -500,224 -452,262 C-400,232 -300,186 -210,150 C-150,140 -60,150 70,190 L40,60 Z`;
const CHEEK_EDGE = `M-452,262 C-400,232 -300,186 -210,150`;      // r4: the hard plane edge runs only mouth corner → under the eye
const JAW_SHADE = `M-452,262 C-400,232 -300,186 -210,150 C-150,140 -60,150 70,190 L120,520 L-600,520 L-600,330 Z`;
const JAW_SOFT = `M-196,151 C-150,142 -60,152 70,192`;   // behind the eye the plane change is soft: a blurred mid-value band over the edge
// the big round jowl: lit upper edge, shadow under, no outline (n3)
const JOWL = {c: [-92, 352], rx: 128, ry: 104, rot: -8};
const JAW_CORE = `M-442,304 C-360,308 -290,336 -236,386 C-190,428 -140,458 -86,462 C-36,464 0,444 14,414
C-30,440 -100,440 -160,414 C-230,384 -300,338 -380,318 C-410,312 -430,312 -442,314 Z`;
const JAW_RIM = `M-442,304 C-360,308 -290,336 -236,386 C-190,428 -140,458 -86,462`;
const TOP_LINE = `M0,0 C-50,-8 -110,0 -164,12 C-280,26 -410,40 -512,50 C-572,56 -616,94 -620,142`;
const CREST_RIDGE = `M-130,132 C-90,142 -40,148 10,148`;           // facial crest: from under the eye back to the jaw joint
const MUZZLE_LIT = `M-520,84 C-560,88 -596,108 -604,140 C-606,158 -598,172 -580,174 C-576,152 -560,134 -536,124 C-510,114 -488,112 -470,112 Z`;
const NOSTRIL = `M-544,132 C-568,132 -584,150 -584,168 C-584,178 -576,184 -568,182 C-572,170 -568,156 -556,150 C-544,144 -526,146 -516,152 C-518,140 -528,132 -544,132 Z`;
const NOSTRIL_FLARE = `M-516,152 C-504,166 -508,186 -526,196`;
const NOSTRIL_RIM = `M-584,168 C-582,150 -570,138 -552,134`;
const NOSE_FOLD = `M-530,118 C-518,110 -498,110 -484,118`;
const LIP_LINE = `M-584,210 C-548,218 -500,240 -456,264`;   // r4: falls toward the corner (no grin); no chin rim
const SPECS = [['M-110,16 C-140,20 -170,24 -194,30', 5, 0.85], ['M-430,54 C-460,57 -482,59 -502,62', 4, 0.75], ['M-596,114 C-604,126 -608,138 -608,148', 4, 0.8], ['M-280,226 C-250,224 -220,224 -190,228', 2.5, 0.5]];
// eye (big, bulging, glossy, lid rims; the brow is the lit orbital plane above, no stroke)
const EYE = {c: [-196, 84], rx: 37, ry: 28, rot: 12};
const ORBIT_LIT = `M-254,58 C-234,30 -184,22 -140,40 C-124,48 -114,60 -112,72 C-134,56 -164,48 -196,50 C-220,52 -240,56 -254,66 Z`;
const ORBIT_SHADE = `M-112,72 C-110,96 -124,118 -154,124 C-194,130 -234,118 -254,96 C-234,112 -196,118 -164,112 C-140,106 -122,92 -112,72 Z`;
const ORBIT_EDGE = `M-254,62 C-234,32 -184,24 -140,42 C-124,50 -114,62 -112,72`;

/* ---------- neck, ears, forelock, mane (base frame) ---------- */
const CUT = G.cut;
// r4 (n3): the neck's front rises from the cut (now behind the jowl) to a concave throat notch under the jowl's back
const NECK = `M700,130 C800,130 910,200 980,320 C1040,430 1070,600 1080,${CUT - 30} L1096,${CUT} L842,${CUT} L848,${CUT - 14}
C862,778 884,740 912,708 C944,664 952,560 936,470 C918,340 830,170 700,130 Z`;
const NECK_LIT = `M912,708 C884,740 862,778 848,${CUT - 14} L842,${CUT} L866,${CUT} C872,792 890,754 918,722 Z`;
const UNDER_JOWL = `M912,708 C900,724 884,742 870,760 C908,764 946,736 962,690 L962,640 Z`;     // the jowl's shadow on the neck
/** crest: poll → back of the cut, the line the mane parts on */
const CREST = [[772, 150], [884, 192], [974, 302], [1032, 444], [1064, 620], [1084, CUT - 20]];
const crestAt = (t) => { const n = CREST.length - 1, k = Math.min(n - 1, Math.floor(t * n)), u = t * n - k, a = CREST[k], b = CREST[k + 1]; return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]; };
/* mane r4 (gate 2b r3 n1). Locks lie BACK AND DOWN along the neck (≈ (0.55, 0.85) near the poll, steeper lower down where the
   neck turns vertical), length 280–420, an S of 1–1.5 waves at 0.10–0.14 × length, and gather into 5 flame clumps whose tips
   flare out and back past the neck's rear edge at five different heights (no level fringe). The front of the neck stays bare. */
const CLUMPS = [  // tip centre, locks, length, direction (deg below +x), shared wave phase
	{tip: [1050, 500], n: 4, L: 400, ang: 58, ph: 0.4},
	{tip: [1126, 612], n: 4, L: 370, ang: 60, ph: 2.1},
	{tip: [1152, 738], n: 4, L: 390, ang: 67, ph: 3.6},
	{tip: [1140, 872], n: 4, L: 400, ang: 77, ph: 5.0},
	{tip: [1092, 930], n: 5, L: 320, ang: 84, ph: 1.2},
];
/** one lock from root to tip: S-wave about the chord, the tip flicking out and back (up), a forked flame tip */
const lockGeo = (root, tip, i, ph, far) => {
	const n = 44, pts = [], dx = tip[0] - root[0], dy = tip[1] - root[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
	const bx = uy, by = -ux;                                   // the back/up side of the lock
	const amp = (0.10 + 0.04 * rnd(i * 3 + 1)) * L, waves = 1 + 0.5 * rnd(i * 13 + 2), flick = (far ? 0.06 : 0.12) * L;
	for (let k = 0; k <= n; k++) { const u = k / n, w = Math.sin(6.283 * waves * u + ph) * amp * Math.min(1, u * 5), f = flick * u * u * u;
		pts.push([root[0] + dx * u + bx * (w + f), root[1] + dy * u + by * (w + f)]); }
	const W0 = (far ? 20 : 25) * (0.86 + 0.28 * rnd(i * 17 + 3));
	const width = (u) => W0 * (u < 0.14 ? 0.45 + u / 0.14 * 0.55 : u < 0.72 ? 1 : Math.max(0.03, Math.pow(1 - (u - 0.72) / 0.28, 0.65)));
	const L1 = [], R1 = [];   // L1: front/down edge (shadow side), R1: back/up edge (lit side)
	pts.forEach((p, k) => { const q = pts[Math.min(k + 1, n)], o = pts[Math.max(k - 1, 0)], ddx = q[0] - o[0], ddy = q[1] - o[1], d = Math.hypot(ddx, ddy) || 1, w = width(k / n);
		L1.push([p[0] - ddy / d * w, p[1] + ddx / d * w]); R1.push([p[0] + ddy / d * w, p[1] - ddx / d * w]); });
	// the fork: a shorter flame tip leaving at 70 % toward the front/down side
	const fk = Math.round(n * 0.7), fb = pts[fk], fdir = Math.atan2(pts[n][1] - fb[1], pts[n][0] - fb[0]) + 0.5 + 0.2 * rnd(i + 40), fl = Math.hypot(pts[n][0] - fb[0], pts[n][1] - fb[1]) * (0.6 + 0.2 * rnd(i + 41));
	const fpts = []; for (let k = 0; k <= 10; k++) { const s = k / 10, a = fdir - 0.6 * s * s; fpts.push([fb[0] + Math.cos(a) * fl * s, fb[1] + Math.sin(a) * fl * s]); }
	const FL = [], FR = []; fpts.forEach((p, k) => { const q = fpts[Math.min(k + 1, 10)], o = fpts[Math.max(k - 1, 0)], ddx = q[0] - o[0], ddy = q[1] - o[1], d = Math.hypot(ddx, ddy) || 1, w = W0 * 0.5 * (1 - k / 10) + 0.5;
		FL.push([p[0] - ddy / d * w, p[1] + ddx / d * w]); FR.push([p[0] + ddy / d * w, p[1] - ddx / d * w]); });
	const outline = 'M' + L1.concat(R1.slice().reverse()).map(P).join(' L') + ' Z';
	const fork = 'M' + FL.concat(FR.slice().reverse()).map(P).join(' L') + ' Z';
	const mix = (f, a0, a1) => 'M' + pts.slice(a0, a1).map((_, k) => { const kk = k + a0; return P([L1[kk][0] + (R1[kk][0] - L1[kk][0]) * f, L1[kk][1] + (R1[kk][1] - L1[kk][1]) * f]); }).join(' L');
	// the lit band: from the back/up edge 45 % in (blurred, clipped to the lock); ≤ 3 grooves
	const band = 'M' + R1.slice(3, n - 3).map(P).join(' L') + ' L' + pts.slice(3, n - 3).reverse().map((_, k) => { const kk = n - 4 - k; return P([R1[kk][0] + (L1[kk][0] - R1[kk][0]) * 0.45, R1[kk][1] + (L1[kk][1] - R1[kk][1]) * 0.45]); }).join(' L') + ' Z';
	const grooves = [mix(0.3, 5, n - 6), mix(0.62, 8, n - 4)];
	return {outline, fork, band, grooves, lit: 'M' + R1.slice(4, n - 8).map(P).join(' L'), gap: 'M' + L1.slice(2, n - 2).map(P).join(' L'), pts, L, root, tip, amp, waves, L1, R1};
};
const LOCKS = [], FAR = [];
CLUMPS.forEach((c, ci) => { for (let j = 0; j < c.n; j++) {
	const i = ci * 10 + j, off = (j - (c.n - 1) / 2), a = (c.ang + off * 2.5 + (rnd(i + 7) - 0.5) * 3) * D2R, ux = Math.cos(a), uy = Math.sin(a);
	const L = Math.max(280, Math.min(420, c.L + (rnd(i + 5) - 0.5) * 50 - Math.abs(off) * 14));
	const tip = [c.tip[0] + uy * off * 24 + ux * (rnd(i + 3) - 0.5) * 30, c.tip[1] - ux * off * 24 + uy * (rnd(i + 3) - 0.5) * 30];
	LOCKS.push({...lockGeo([tip[0] - ux * L, tip[1] - uy * L], tip, i, c.ph + (rnd(i + 9) - 0.5) * 0.5, false), ci, j}); } });
// draw order: the lowest clump first, the poll clump on top; inside a clump, back to front
LOCKS.sort((a, b) => b.ci - a.ci || a.j - b.j);
// the far half of the parted mane: shorter, darker locks that show only past the crest
for (let i = 0; i < 9; i++) { const t = 0.1 + 0.78 * i / 8, r = crestAt(t), a = (56 + 26 * t) * D2R, L = 200 + 60 * rnd(i + 70);
	FAR.push(lockGeo([r[0] - 10, r[1] + 6], [r[0] - 10 + Math.cos(a) * L, r[1] + 6 + Math.sin(a) * L], i + 90, 1.5 * i, true)); }
/** the crest ridge: a smooth band of hair along the parting, covering the lock roots */
const RIDGE_PTS = Array.from({length: 25}, (_, k) => crestAt(k / 24 * 0.24));   // r4: the parting only over the poll, covering the first locks' roots
const ridgeSide = (off) => RIDGE_PTS.map((p, k) => { const q = RIDGE_PTS[Math.min(k + 1, 24)], o = RIDGE_PTS[Math.max(k - 1, 0)], dx = q[0] - o[0], dy = q[1] - o[1], d = Math.hypot(dx, dy) || 1, w = off * (0.4 + 0.6 * Math.sin(Math.PI * Math.min(1, 0.15 + k / 24))); return [p[0] - dy / d * w, p[1] + dx / d * w]; });
const RIDGE = 'M' + ridgeSide(-6).concat(ridgeSide(22).reverse()).map(P).join(' L') + ' Z';
const RIDGE_G = [8, 15].map((o) => 'M' + ridgeSide(o).slice(1, 23).map(P).join(' L'));
const RIDGE_TOP = 'M' + ridgeSide(-4).slice(0, 24).map(P).join(' L');
// forelock: a few short wavy locks from the poll over the forehead, between the ears
const FORELOCK = [[740, 172, 2.78, 190, 22], [722, 180, 2.74, 168, 20], [756, 170, 2.82, 140, 18], [704, 188, 2.7, 120, 16]].map(([x, y, h, L, W], j) => {
	const pts = []; let px = x, py = y, a = h;
	for (let k = 0; k <= 16; k++) { const s = k / 16; a += 0.08 * Math.sin(s * 8 + j * 1.7) - 0.012; px += Math.cos(a) * L / 16; py += Math.sin(a) * L / 16; pts.push([px, py]); }
	const Lr = [], Rr = []; pts.forEach((p, k) => { const q = pts[Math.min(k + 1, 16)], o = pts[Math.max(k - 1, 0)], dx = q[0] - o[0], dy = q[1] - o[1], d = Math.hypot(dx, dy) || 1, ww = W * (k < 3 ? 0.7 + k * 0.1 : 1 - 0.85 * (k - 3) / 13) + 0.6;
		Lr.push([p[0] - dy / d * ww, p[1] + dx / d * ww]); Rr.push([p[0] + dy / d * ww, p[1] - dx / d * ww]); });
	return {d: 'M' + Lr.concat(Rr.reverse()).map(P).join(' L') + ' Z', g: 'M' + pts.slice(2, 13).map(P).join(' L')}; });
// ears (base frame): cupped leaves angled up and back. Far ear pricked; near ear straight or with its top third rolled forward.
/** a leaf ear along a centreline (Catmull-Rom through pts): width profile w(s); hollow = the cupped inside, toward the front edge */
const cr = (pts, n = 48) => { const out = []; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)], m = Math.ceil(n / (pts.length - 1));
	for (let k = 0; k < m; k++) { const t = k / m, t2 = t * t, t3 = t2 * t; out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); } }
	out.push(pts[pts.length - 1]); return out; };
const leaf = (pts, W, prof, side = 0, frac = 1) => { const c = cr(pts), n = c.length - 1, L = [], Rr = [];
	c.forEach((p, k) => { const q = c[Math.min(k + 1, n)], o = c[Math.max(k - 1, 0)], dx = q[0] - o[0], dy = q[1] - o[1], d = Math.hypot(dx, dy) || 1, w = W * prof(k / n);
		const a = side * w * (1 - frac), b = w * frac;   // side: shift toward one edge (hollow)
		L.push([p[0] - dy / d * (b + a), p[1] + dx / d * (b + a)]); Rr.push([p[0] + dy / d * (b - a), p[1] - dx / d * (b - a)]); });
	return {d: 'M' + L.concat(Rr.reverse()).map(P).join(' L') + ' Z', front: 'M' + L.map(P).join(' L'), back: 'M' + Rr.slice().reverse().map(P).join(' L'), c}; };
const LEAF = (s) => (s < 0.4 ? 0.62 + 0.38 * Math.sin(s / 0.4 * Math.PI / 2) : Math.max(0.03, Math.cos((s - 0.4) / 0.6 * Math.PI / 2)));
const ROLLW = (s) => (s < 0.3 ? 0.62 + 0.38 * Math.sin(s / 0.3 * Math.PI / 2) : s < 0.8 ? 1 - 0.25 * (s - 0.3) / 0.5 : Math.max(0.42, 0.78 * Math.cos((s - 0.8) / 0.2 * Math.PI / 2)));
const EF = leaf([[752, 180], [768, 112], [792, 58], [822, 18]], 34, LEAF), EF_IN = leaf([[752, 168], [768, 112], [790, 62], [816, 30]], 34 * 0.5, LEAF, -1, 0.5);
const EN = leaf([[700, 184], [712, 114], [734, 62], [760, 20]], 35, LEAF), EN_IN = leaf([[700, 172], [712, 114], [732, 66], [754, 32]], 35 * 0.5, LEAF, 1, 0.5);
const ER = leaf([[702, 188], [710, 126], [724, 82], [726, 50], [708, 28], [680, 30], [664, 52]], 46, ROLLW);
const ER_IN = leaf([[704, 172], [710, 128], [720, 96]], 46 * 0.62, (s) => 0.35 + 0.65 * Math.sin(Math.PI * s), 1, 0.55);
const EAR_FAR = EF.d, EAR_FAR_IN = EF_IN.d, EAR_NEAR = EN.d, EAR_NEAR_IN = EN_IN.d;
// rolled: the standing two-thirds, then the top third curls forward and down over the front edge as a solid roll
const EAR_ROLL = ER.d, EAR_ROLL_HOLLOW = ER_IN.d, EAR_ROLL_TOP = ER.back;

K.horseHead = (o = {}) => {
	const id = K.uid('h3'), x = o.x ?? 960, y = o.y ?? 900, h = o.h ?? 400, s = h / 925, flip = o.flip ? -1 : 1;
	const curl = o.curl ?? 1, glow = o.glow ?? 0.6, mood = o.mood ?? 'warm', refl = o.refl ?? '#9FB2AE', key = o.key ?? 1, base = o.base ?? 'cut';
	const R = {
		warm: {dark: '#0D0705', deep: '#190E09', mid: '#2A1A11', mid2: '#3A2418', lite: '#6E4026', hi: '#C77A45', rim: '#F09A5E', spec: '#FFE6C6', glow: '#FF9A5A'},
		fire: {dark: '#100705', deep: '#1C0E08', mid: '#2E1A10', mid2: '#432616', lite: '#844624', hi: '#E08844', rim: '#FFB060', spec: '#FFF0C8', glow: '#FF9A50'},
		cool: {dark: '#0C0807', deep: '#18110D', mid: '#281C16', mid2: '#37271F', lite: '#644636', hi: '#B08266', rim: '#E7A27A', spec: '#F4F2EA', glow: '#FF9A5A'},
	}[mood];
	const C = {...R, mid: mixC(R.mid, R.lite, (key - 1) * 0.35), mid2: mixC(R.mid2, R.hi, (key - 1) * 0.3), lite: mixC(R.lite, R.hi, (key - 1) * 0.55), hi: mixC(R.hi, R.spec, (key - 1) * 0.3)};
	// r4 (n1 v): cast metal, not fibres — one soft lit band on the lock's back/up side, ≤ 3 grooves with highlights ≤ .15
	const lockSvg = (L, k) => `<clipPath id="${id}L${k}"><path d="${L.outline}"/></clipPath>
		<path d="${L.outline}" fill="${C.mid}"/><path d="${L.fork}" fill="${C.mid}"/>
		<g clip-path="url(#${id}L${k})"><path d="${L.band}" fill="${C.lite}" opacity=".34" filter="url(#${id}bb)"/></g>
		<path d="${L.gap}" stroke="${C.dark}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".75"/>
		${L.grooves.map((g) => `<path d="${g}" stroke="${C.deep}" stroke-width="2" fill="none" opacity=".55" stroke-linecap="round"/><path d="${g}" stroke="${C.lite}" stroke-width="1.2" fill="none" opacity=".14" transform="translate(-1.6,-1.2)"/>`).join('')}
		<path d="${L.lit}" stroke="${C.hi}" stroke-width="2.4" fill="none" opacity=".45" stroke-linecap="round"/>`;
	const ear = curl > 0.5
		? `<path d="${EAR_ROLL}" fill="${C.mid2}"/><path d="${EAR_ROLL_HOLLOW}" fill="${C.deep}"/>
		   <path d="${EAR_ROLL_TOP}" stroke="${C.hi}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>
		   <ellipse cx="712" cy="34" rx="9" ry="4.5" transform="rotate(-10 712 34)" fill="${C.spec}" opacity=".85"/>`
		: `<path d="${EAR_NEAR}" fill="${C.mid2}"/><path d="${EAR_NEAR_IN}" fill="${C.dark}"/><path d="${EN.back}" stroke="${C.hi}" stroke-width="4" fill="none"/>`;
	// the silhouette (for the rim copies): neck + head + ears + mane
	const sil = (fill) => `<g fill="${fill}">${FAR.map((L) => `<path d="${L.outline}"/><path d="${L.fork}"/>`).join('')}<path d="${NECK}"/>${LOCKS.map((L) => `<path d="${L.outline}" stroke="${fill}" stroke-width="8" stroke-linejoin="round"/><path d="${L.fork}"/>`).join('')}<path d="${EAR_FAR}"/><path d="${curl > 0.5 ? EAR_ROLL : EAR_NEAR}"/><path d="${HEAD}" transform="${HT}"/></g>`;
	const bw = o.block?.w ?? 600, bh = o.block?.h ?? 700, bx = 922 - bw / 2;
	const block = base !== 'block' ? '' : `
		<rect x="${bx}" y="950" width="${bw}" height="${bh}" fill="url(#${id}mb)"/>
		<path d="M${bx},950 L${bx + bw},950" stroke="#8A7A70" stroke-width="3" opacity=".8"/>
		<path d="M${bx - 10},940 L${bx + bw + 10},940 L${bx + bw},950 L${bx},950 Z" fill="#2A2422"/>
		<path d="M${bx - 10},940 L${bx + bw + 10},940" stroke="${C.rim}" stroke-width="2.5" opacity=".55"/>
		<g stroke="#D8D2CA" fill="none" opacity=".38" stroke-width="2.2">
			<path d="M${bx + bw * 0.12},950 L${bx + bw * 0.2},${950 + bh * 0.14} L${bx + bw * 0.18},${950 + bh * 0.22} L${bx + bw * 0.34},${950 + bh * 0.46} L${bx + bw * 0.3},${950 + bh * 0.6} L${bx + bw * 0.46},${950 + bh * 0.9}"/>
			<path d="M${bx + bw * 0.2},${950 + bh * 0.14} L${bx + bw * 0.42},${950 + bh * 0.2} L${bx + bw * 0.52},${950 + bh * 0.3}"/>
			<path d="M${bx + bw * 0.78},950 L${bx + bw * 0.72},${950 + bh * 0.18} L${bx + bw * 0.84},${950 + bh * 0.4} L${bx + bw},${950 + bh * 0.47}"/>
			<path d="M${bx + bw * 0.34},${950 + bh * 0.46} L${bx + bw * 0.6},${950 + bh * 0.52} L${bx + bw * 0.66},${950 + bh * 0.7}" stroke-width="1.4"/></g>`;
	const post = base === 'block' ? `<rect x="862" y="${CUT - 4}" width="120" height="${950 - CUT + 4}" fill="#0E0A09"/><path d="M862,${CUT} L862,950" stroke="${C.rim}" stroke-width="2" opacity=".35"/>` : '';
	const defs = `<defs>
		<clipPath id="${id}c"><path d="${HEAD}"/></clipPath>
		<clipPath id="${id}n"><path d="${NECK}"/></clipPath>
		<radialGradient id="${id}glow"><stop offset="0" stop-color="${o.glowCol ?? C.glow}" stop-opacity="${0.5 * glow}"/><stop offset=".45" stop-color="${o.glowCol ?? C.glow}" stop-opacity="${0.2 * glow}"/><stop offset="1" stop-color="${o.glowCol ?? C.glow}" stop-opacity="0"/></radialGradient>
		<radialGradient id="${id}eye" cx=".38" cy=".34" r=".75"><stop offset="0" stop-color="${C.mid2}"/><stop offset=".4" stop-color="${C.deep}"/><stop offset="1" stop-color="${C.dark}"/></radialGradient>
		<linearGradient id="${id}mf" gradientUnits="userSpaceOnUse" x1="760" y1="200" x2="1060" y2="${CUT + 80}"><stop offset="0" stop-color="${C.lite}" stop-opacity=".22"/><stop offset=".55" stop-color="${C.lite}" stop-opacity="0"/><stop offset="1" stop-color="${C.dark}" stop-opacity=".25"/></linearGradient>
		<linearGradient id="${id}hs" gradientUnits="userSpaceOnUse" x1="-500" y1="0" x2="-100" y2="460"><stop offset="0" stop-color="${C.hi}" stop-opacity=".12"/><stop offset=".5" stop-color="${C.hi}" stop-opacity="0"/><stop offset="1" stop-color="${C.dark}" stop-opacity=".3"/></linearGradient>
		<filter id="${id}bb" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
		<filter id="${id}bs" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="9"/></filter>
		<filter id="${id}bj" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="16"/></filter>
		<linearGradient id="${id}jw" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.lite}" stop-opacity=".75"/><stop offset=".3" stop-color="${C.mid2}" stop-opacity=".35"/><stop offset=".62" stop-color="${C.mid}" stop-opacity="0"/><stop offset="1" stop-color="${C.dark}" stop-opacity=".85"/></linearGradient>
		<linearGradient id="${id}hb" gradientUnits="userSpaceOnUse" x1="-60" y1="0" x2="60" y2="0"><stop offset="0" stop-color="${C.mid}" stop-opacity="0"/><stop offset="1" stop-color="${C.mid}" stop-opacity=".9"/></linearGradient>
		<linearGradient id="${id}nk" gradientUnits="userSpaceOnUse" x1="840" y1="0" x2="1100" y2="0"><stop offset="0" stop-color="${C.mid2}"/><stop offset=".45" stop-color="${C.mid}"/><stop offset="1" stop-color="${C.deep}"/></linearGradient>
		<linearGradient id="${id}mb" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1C1817"/><stop offset=".25" stop-color="#121010"/><stop offset="1" stop-color="#080707"/></linearGradient>
	</defs>`;
	const rk = o.rimK ?? 1;
	const body = `
	${glow > 0 ? `<ellipse cx="760" cy="470" rx="760" ry="640" fill="url(#${id}glow)"/>` : ''}
	${block}${post}
	<g transform="translate(${5 * rk},${-3 * rk})" opacity=".9">${sil(C.rim)}</g>
	<g transform="translate(${-3 * rk},${-4 * rk})" opacity=".55">${sil(C.hi)}</g>
	<!-- far ear (shadow side, pricked) -->
	<path d="${EAR_FAR}" fill="${C.deep}"/><path d="${EAR_FAR_IN}" fill="${C.dark}"/><path d="${EF.back}" stroke="${C.rim}" stroke-width="3" fill="none" opacity=".8"/>
	<!-- the far half of the parted mane, behind the crest -->
	${FAR.map((L) => `<path d="${L.outline}" fill="${C.deep}"/><path d="${L.fork}" fill="${C.deep}"/>${L.grooves.slice(0, 3).map((g) => `<path d="${g}" stroke="${C.dark}" stroke-width="1.8" fill="none" opacity=".8"/>`).join('')}<path d="${L.gap}" stroke="${C.rim}" stroke-width="2" fill="none" opacity=".35"/>`).join('')}
	<!-- neck -->
	<path d="${NECK}" fill="${C.mid}"/>
	<g clip-path="url(#${id}n)">
		<rect x="600" y="300" width="500" height="600" fill="url(#${id}nk)"/>
		<path d="${NECK_LIT}" fill="${C.lite}" opacity=".55" filter="url(#${id}bb)"/>
		<path d="${UNDER_JOWL}" fill="${C.deep}" opacity=".8" filter="url(#${id}bb)"/>
		<rect x="700" y="${CUT - 14}" width="420" height="14" fill="${C.deep}"/>
	</g>
	<path d="M848,${CUT - 14} L842,${CUT} L1096,${CUT}" stroke="${C.lite}" stroke-width="2.4" fill="none" opacity=".7"/>
	<!-- mane: back layer, front layer; a light-falloff wash over it -->
	${LOCKS.map((L) => `<path d="${L.outline}" fill="${C.deep}" stroke="${C.deep}" stroke-width="8" stroke-linejoin="round"/>`).join('')}
	${LOCKS.map(lockSvg).join('')}
	<g opacity="1">${LOCKS.map((L) => `<path d="${L.outline}" fill="url(#${id}mf)"/>`).join('')}</g>
	<path d="${RIDGE}" fill="${C.mid2}"/>${RIDGE_G.map((g, k) => `<path d="${g}" stroke="${k % 2 ? C.deep : C.dark}" stroke-width="1.6" fill="none" opacity=".8"/>`).join('')}
	<path d="${RIDGE_TOP}" stroke="${C.hi}" stroke-width="3" fill="none" opacity=".7"/>
	<!-- head -->
	<path d="${MOUTH_IN}" fill="${C.dark}" transform="${HT}"/>
	<g transform="${HT}">
		<path d="${HEAD}" fill="${C.mid}"/>
		<g clip-path="url(#${id}c)">
			<path d="${UPPER_SIDE}" fill="${C.mid2}"/>
			<path d="${JAW_SHADE}" fill="${mixC(C.deep, C.mid, 0.55)}"/>
			<path d="${JAW_SOFT}" stroke="${mixC(C.mid2, mixC(C.deep, C.mid, 0.55), 0.5)}" stroke-width="44" fill="none" stroke-linecap="round" filter="url(#${id}bs)"/>
			<rect x="-60" y="-40" width="200" height="560" fill="url(#${id}hb)"/>
			<ellipse cx="${JOWL.c[0]}" cy="${JOWL.c[1]}" rx="${JOWL.rx}" ry="${JOWL.ry}" transform="rotate(${JOWL.rot} ${JOWL.c[0]} ${JOWL.c[1]})" fill="url(#${id}jw)" filter="url(#${id}bj)"/>
			<path d="${JAW_CORE}" fill="${C.deep}"/>
			<path d="${TOP_PLANE}" fill="${C.lite}"/>
			<path d="${REFL}" fill="${refl}" opacity=".5"/>
			<path d="${MUZZLE_LIT}" fill="${C.lite}" opacity=".85"/>
			<rect x="-700" y="-60" width="800" height="560" fill="url(#${id}hs)"/>
			<path d="${CHEEK_EDGE}" stroke="${C.lite}" stroke-width="2.4" fill="none" opacity=".45"/>
			<path d="${CREST_RIDGE}" stroke="${C.hi}" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/>
			<path d="${CREST_RIDGE}" stroke="${C.dark}" stroke-width="3" fill="none" opacity=".6" transform="translate(0,5)"/>
			<path d="${ORBIT_SHADE}" fill="${C.deep}"/>
			<path d="${ORBIT_LIT}" fill="${C.lite}"/>
			<path d="${ORBIT_EDGE}" stroke="${C.hi}" stroke-width="3" fill="none" opacity=".8"/>
			<path d="${NOSE_FOLD}" stroke="${C.dark}" stroke-width="3.5" fill="none" opacity=".8"/>
			<path d="${NOSTRIL}" fill="${C.dark}"/>
			<path d="${NOSTRIL_FLARE}" stroke="${C.hi}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
			<path d="${NOSTRIL_RIM}" stroke="${C.hi}" stroke-width="2.4" fill="none" opacity=".8"/>
			<path d="${LIP_LINE}" stroke="${C.hi}" stroke-width="2.2" fill="none" opacity=".55" transform="translate(0,-4)"/>
			<path d="${JAW_RIM}" stroke="${C.rim}" stroke-width="4" fill="none" opacity=".55" transform="translate(0,-3)"/>
			<!-- the eye -->
			<ellipse cx="${EYE.c[0]}" cy="${EYE.c[1]}" rx="${EYE.rx + 8}" ry="${EYE.ry + 7}" transform="rotate(${EYE.rot} ${EYE.c[0]} ${EYE.c[1]})" fill="${C.deep}"/>
			<ellipse cx="${EYE.c[0]}" cy="${EYE.c[1]}" rx="${EYE.rx}" ry="${EYE.ry}" transform="rotate(${EYE.rot} ${EYE.c[0]} ${EYE.c[1]})" fill="url(#${id}eye)"/>
			<path d="M${EYE.c[0] - 40},${EYE.c[1] - 4} C${EYE.c[0] - 26},${EYE.c[1] - 31} ${EYE.c[0] + 18},${EYE.c[1] - 33} ${EYE.c[0] + 38},${EYE.c[1] + 2}" stroke="${C.lite}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".85"/>
			<path d="M${EYE.c[0] - 40},${EYE.c[1] + 8} C${EYE.c[0] - 20},${EYE.c[1] + 34} ${EYE.c[0] + 24},${EYE.c[1] + 36} ${EYE.c[0] + 42},${EYE.c[1] + 10}" stroke="${C.dark}" stroke-width="5" fill="none" stroke-linecap="round"/>
			<ellipse cx="${EYE.c[0] - 13}" cy="${EYE.c[1] - 11}" rx="6.5" ry="4.2" transform="rotate(-20 ${EYE.c[0] - 13} ${EYE.c[1] - 11})" fill="${C.spec}" opacity=".9"/>
			<ellipse cx="${EYE.c[0] + 16}" cy="${EYE.c[1] + 10}" rx="5" ry="3" fill="${C.hi}" opacity=".6"/>
			<!-- crisp speculars on the high points -->
			${SPECS.map(([d, w, a]) => `<path d="${d}" stroke="${C.spec}" stroke-width="${w}" fill="none" stroke-linecap="round" opacity="${a}"/>`).join('')}
		</g>
		<path d="${TOP_LINE}" stroke="${C.hi}" stroke-width="3" fill="none" opacity=".75"/>
	</g>
	<!-- forelock over the poll, then the near ear -->
	${FORELOCK.map((f) => `<path d="${f.d}" fill="${C.dark}" transform="translate(3,5)" opacity=".6"/><path d="${f.d}" fill="${C.lite}"/><path d="${f.g}" stroke="${C.deep}" stroke-width="2.2" fill="none"/><path d="${f.g}" stroke="${C.hi}" stroke-width="1.6" fill="none" transform="translate(-3,-3)" opacity=".8"/>`).join('')}
	${ear}`;
	return `<g transform="translate(${x},${y}) scale(${flip * s},${s}) translate(-836,-950)">${defs}${body}</g>`;
};
const HP = {mouth: hp([-572, 226]), eye: hp([EYE.c[0], EYE.c[1]]), ear: [712, 40], nose: hp([-620, 130]), poll: [712, 150], collarF: [760, CUT], collarB: [1096, CUT], throat: [800, 766]};
K.HEAD_PTS = Object.fromEntries(Object.entries(HP).map(([k, p]) => [k, [p[0] - 836, p[1] - 950]]));
K.HERO3_GEO = {LOCKS, FAR, CLUMPS, hp, CUT};   // for the r4 measures (hero_measure.mjs)
K.HEAD_PTS.height = 925; K.HEAD_PTS.cut = CUT - 950;
K.headPt = (o, name) => { const s = (o.h ?? 400) / 925, f = o.flip ? -1 : 1, p = K.HEAD_PTS[name]; return [o.x + f * p[0] * s, o.y + p[1] * s]; };
})();
