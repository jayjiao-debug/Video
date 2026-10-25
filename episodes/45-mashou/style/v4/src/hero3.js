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

/* ---------- ears, neck + mane (base frame) ---------- */
const CUT = G.cut;
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
const EAR_FAR = EF.d, EAR_FAR_IN = EF_IN.d, EAR_NEAR = EN.d, EAR_NEAR_IN = EN_IN.d;
// rolled ear r6 (owner, v7 key frames: "the curled ear reads like a small bird sitting on the head"): the old roll (a round
// top + a pointed tip + a specular dot) read as a head, a beak and an eye. Now the near ear keeps the far ear's LEAF silhouette
// (wide base, tapering, no bulb, no neck) and is thicker; its upper half bends forward and its front edge rolls inward over the
// cup as a tube, as on the real casting (press photos: a leaf ear whose rim is rolled). Everything is a plane of the head's own
// patina (mid / mid2 / deep), one thin lip line, no highlight dot, no spiral.
const earRoll = {
	// silhouette: wide base, tapering to a narrow round ridge where the top third is folded over (no neck, no point sticking out)
	sil: `M672,178 C670,150 678,116 692,90 C702,70 714,54 728,46 C740,40 754,44 757,58 C761,84 759,120 757,150 C756,162 757,170 759,178 C738,188 696,188 672,178 Z`,
	// the cup (the ear's inside, deep), below the fold
	cup: `M690,174 C688,150 694,124 706,100 L738,82 C743,112 741,146 737,174 C722,180 704,180 690,174 Z`,
	// the folded-over tip: the outer skin turned down over the cup, a blunt triangle pointing down-forward, inside the silhouette
	flap: `M716,53 C732,42 752,45 757,60 L746,76 C732,94 714,112 697,128 C692,116 695,98 703,84 C708,70 711,61 716,53 Z`,
	flapShadow: `M746,76 C732,94 714,112 697,128 L703,136 C719,120 737,102 751,86 Z`,   // its cast shadow on the cup
	ridge: `M714,55 C730,43 750,45 757,59`,                                               // the bend catches the light (a line, no dot)
	back: `M757,58 C761,84 759,120 757,150 C756,162 757,170 759,178`,
	// close-up only (o.earDetail): the bend as a lit band with thickness, the flap's lit upper facet and its free edge (no dents:
	// two dark flats on the flap read as a face)
	bend: `M712,58 C728,46 748,47 756,60 L751,70 C743,60 729,58 716,66 Z`,
	litFacet: `M716,53 C732,42 752,45 757,60 L748,72 C738,72 726,76 714,84 C714,72 715,62 716,53 Z`,   // the flap's upper facet catches the key (hard edge)
	flapEdge: `M746,76 C732,94 714,112 697,128`,                                            // the free edge of the folded tip
};
const EAR_ROLL = earRoll.sil;

/* mane r5 (owner on r4: "it should be at least 一体 no?"). 「你由红铜一次铸成」: the mane is the BACK OF THE NECK, cast in relief in
   the same bronze — not a hairpiece laid on a smooth neck. So:
   · one silhouette: the neck's back edge IS the mane's outer edge, one line from behind the ears down the crest to the cut;
   · one fill: the mane is the neck's own fill (same gradient, same patina); nothing is laid on top but plane shading;
   · relief: grooves cut into that surface split it into MANE_N locks; each lock has one hard lit facet on its up/back side (the
     face's upper-plane value, mid2) and one hard shadow facet on its front/down side (the face's jaw-shade value), the groove dark
     between; no blur, no strands;
   · the locks rise out of the neck side behind a band of smooth neck (the front edge is the first lock's shadow facet, no line);
   · below the cut each lock ends in a thick cast tongue that hangs free, tips at different heights;
   · the ears stand in front of it, out of the poll. */
const arcRS = (pts, n) => { const c = cr(pts, 240), L = [0]; for (let i = 1; i < c.length; i++) L.push(L[i - 1] + Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]));
	const out = []; let j = 0; for (let k = 0; k <= n; k++) { const t = L[L.length - 1] * k / n; while (j < L.length - 2 && L[j + 1] < t) j++; const u = (t - L[j]) / ((L[j + 1] - L[j]) || 1);
		out.push([c[j][0] + (c[j + 1][0] - c[j][0]) * u, c[j][1] + (c[j + 1][1] - c[j][1]) * u]); } return out; };
const MANE_N = 6, NV = 64;
// the back edge (the silhouette, poll → crest → cut) and the front edge (where the relief rises out of the neck side)
const MB = arcRS([[786, 138], [860, 152], [944, 206], [1018, 302], [1072, 424], [1106, 556], [1130, 690], [1144, CUT]], NV);   // flares a little toward the cut, as cast
const MF = arcRS([[796, 182], [818, 226], [864, 300], [910, 396], [946, 504], [970, 618], [986, 730], [994, CUT]], NV);
/** groove at u (0 front edge … 1 back edge): an S-wave across the locks, fading to nothing at the silhouette */
const groove = (u, k) => MF.map((f, j) => { const b = MB[j], v = j / NV, dx = b[0] - f[0], dy = b[1] - f[1], w = Math.hypot(dx, dy) || 1;
	const amp = 24 * Math.min(1, v * 3) * (1 - u * u), off = amp * Math.sin(6.283 * 2 * v + 0.6 + 0.3 * k);
	return [f[0] + dx * u + dx / w * off, f[1] + dy * u + dy / w * off]; });
const GU = [0, 0.15, 0.32, 0.48, 0.63, 0.81, 1];                     // uneven lock widths
const GROOVES = GU.map((u, k) => groove(u, k));
// [length, curl back, thickness, fan (lean back), fork (0 none, else the fork's length as a share)]: they fan out, uneven, two forked
const TONGUE = [[50, -0.1, 1.6, -0.1, 0], [86, 0.02, 2.1, 0.1, 0.5], [58, 0.1, 1.8, 0.22, 0], [92, 0.2, 2.2, 0.36, 0.55], [66, 0.26, 1.8, 0.46, 0], [62, 0.3, 1.8, 0.56, 0]];   // [length, curl back, thickness] per lock, front → back
/** one lock: front edge (groove k), back edge (groove k+1), continued below the cut as a thick tongue with a blunt point */
const MANE = GROOVES.slice(0, MANE_N).map((gF, k) => {
	const gB = GROOVES[k + 1], a = gF[NV], b = gB[NV], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], w0 = Math.hypot(b[0] - a[0], b[1] - a[1]) / 2;
	const nb = [(b[0] - a[0]) / (2 * w0), (b[1] - a[1]) / (2 * w0)], d0 = [-nb[1] + TONGUE[k][3] * nb[0], nb[0] + TONGUE[k][3] * nb[1]], dl = Math.hypot(...d0), d = [d0[0] / dl, d0[1] / dl];
	const [len, curl, th, , fork] = TONGUE[k], TF = [], TB = [];
	// thick cast tongues: they swell a little past the cut (th), then taper to a blunt point
	for (let t = 1; t <= 10; t++) { const s = t / 10, c = [m[0] + d[0] * len * s + nb[0] * curl * len * s * s, m[1] + d[1] * len * s + nb[1] * curl * len * s * s], hw = w0 * (1 + (th - 1) * Math.sin(Math.min(1, s * 2.5) * Math.PI / 2)) * (1 - 0.72 * Math.pow(s, 2.2));
		TF.push([c[0] - nb[0] * hw, c[1] - nb[1] * hw]); TB.push([c[0] + nb[0] * hw, c[1] + nb[1] * hw]); }
	const tip = [m[0] + d[0] * (len + 7) + nb[0] * curl * len * 1.08, m[1] + d[1] * (len + 7) + nb[1] * curl * len * 1.08];   // blunt
	let forkD = '', forkLit = '';
	if (fork) { const r = TB[3], fl = len * fork, fd = [d[0] + nb[0] * 0.9, d[1] + nb[1] * 0.9], q = Math.hypot(...fd), u = [fd[0] / q, fd[1] / q], nv = [-u[1], u[0]], hw0 = w0 * 0.75, FF = [], FB = [];
		for (let t = 0; t <= 8; t++) { const s = t / 8, c = [r[0] - nb[0] * hw0 * 0.6 + u[0] * fl * s, r[1] - nb[1] * hw0 * 0.6 + u[1] * fl * s], hw = hw0 * (1 - 0.75 * Math.pow(s, 1.8));
			FF.push([c[0] + nv[0] * hw, c[1] + nv[1] * hw]); FB.push([c[0] - nv[0] * hw, c[1] - nv[1] * hw]); }
		const ft = [r[0] - nb[0] * hw0 * 0.6 + u[0] * (fl + 6), r[1] - nb[1] * hw0 * 0.6 + u[1] * (fl + 6)];
		forkD = 'M' + FF.concat([ft], FB.slice().reverse()).map(P).join(' L') + ' Z';
		forkLit = 'M' + FB.slice(1).map(P).join(' L') + ' L' + P(ft) + ' L' + FB.slice(1).map((p, i) => P([p[0] + (FF[i + 1][0] - p[0]) * 0.35, p[1] + (FF[i + 1][1] - p[1]) * 0.35])).reverse().join(' L') + ' Z'; }
	const F = gF.concat(TF, [tip]), B = gB.concat(TB, [tip]);              // full front and back edges, root → tip
	const strip = (E, O, f, i0, i1) => 'M' + E.slice(i0, i1).map(P).join(' L') + ' L' + E.slice(i0, i1).map((p, i) => { const q = O[i0 + i], ff = f(i0 + i); return P([p[0] + (q[0] - p[0]) * ff, p[1] + (q[1] - p[1]) * ff]); }).reverse().join(' L') + ' Z';
	// the facets swell and shrink with the S (hard-edged scallops, as chased relief): the lit facet is widest where the ridge
	// turns toward the light, the shadow facet where it turns away; on the tongue they run steady to the point
	const wph = (i, g) => 0.5 + 0.5 * Math.cos(6.283 * 2 * i / NV + 0.6 + 0.3 * g);
	const fLit = (i) => (i <= NV ? 0.2 + 0.24 * wph(i, k + 1) : 0.34), fSh = (i) => (!k ? 0.14 : i <= NV ? 0.14 + 0.2 * (1 - wph(i, k)) : 0.24);
	const n = F.length, i0 = Math.round(NV * (0.03 + 0.035 * (MANE_N - 1 - k)));
	return {k, F, B, forkD, forkLit, tongue: 'M' + [a].concat(TF, [tip], TB.slice().reverse(), [b]).map(P).join(' L') + ' Z',
		lit: strip(B, F, fLit, i0, n), shade: strip(F, B, fSh, i0, n),
		edgeLit: 'M' + B.slice(Math.round(NV * 0.12), n - 3).map(P).join(' L'),
		grooveCut: (() => { const g = gF.slice(i0 + 1, NV + 1), m2 = g.length - 1, L = [], R = []; g.forEach((p, i) => { const q = g[Math.min(i + 1, m2)], o = g[Math.max(i - 1, 0)], dx = q[0] - o[0], dy = q[1] - o[1], dd = Math.hypot(dx, dy) || 1, w = 1.7 * Math.min(1, i / 10);
			L.push([p[0] - dy / dd * w, p[1] + dx / dd * w]); R.push([p[0] + dy / dd * w, p[1] - dx / dd * w]); }); return 'M' + L.concat(R.reverse()).map(P).join(' L') + ' Z'; })(),
		tipDepth: tip[1]}; });
const MANE_TONGUES = MANE.flatMap((L) => (L.forkD ? [L.forkD, L.tongue] : [L.tongue]));
// the neck: front (throat) as r4; the back edge is the mane's silhouette; the cut runs straight back to it
const NECK = `M700,130 L${MB.map(P).join(' L')} L842,${CUT} L848,${CUT - 14}
C862,778 884,740 912,708 C926,690 906,640 880,600 L800,420 L720,220 L700,130 Z`;   // r5: the front edge runs up UNDER the head (no gap at the jowl)
const NECK_LIT = `M912,708 C884,740 862,778 848,${CUT - 14} L842,${CUT} L866,${CUT} C872,792 890,754 918,722 Z`;
const UNDER_JOWL = `M912,708 C900,724 884,742 870,760 C908,764 946,736 962,690 L962,640 Z`;     // the jowl's shadow on the neck
const MANE_REGION = 'M' + GROOVES[0].concat(MB.slice().reverse()).map(P).join(' L') + ' Z';            // for the measures and the mask
// the crest top catches the key and the window, like the face's top plane: a lit band along the silhouette over the poll
const CREST_TOP = 'M' + MB.slice(1, Math.round(NV * 0.3)).map(P).join(' L');
const CREST_REFL = 'M' + MB.slice(3, Math.round(NV * 0.15)).map((p, i) => P([p[0] - 3, p[1] + 6])).join(' L');
// crisp speculars on a few lock crests (lit facets), as on the face's high points
const MANE_SPECS = [[4, 0.2, 0.27], [3, 0.36, 0.43], [2, 0.5, 0.56], [4, 0.62, 0.68]].map(([k, v0, v1]) => 'M' + GROOVES[k + 1].slice(Math.round(NV * v0), Math.round(NV * v1)).map((p) => P([p[0] - 4, p[1] + 1])).join(' L'));
// forelock: one short cast tongue from the poll forward over the forehead, between the ears (behind the near ear)
const FORELOCK = (() => { const r = [752, 156], d = [-0.9, 0.44], nb = [0.44, 0.9], L = 86, W = 15, F = [], B = [];
	for (let t = 0; t <= 10; t++) { const s = t / 10, c = [r[0] + d[0] * L * s + nb[0] * 10 * s * s, r[1] + d[1] * L * s + nb[1] * 10 * s * s], hw = W * (1 - 0.85 * Math.pow(s, 1.3));
		F.push([c[0] - nb[0] * hw, c[1] - nb[1] * hw]); B.push([c[0] + nb[0] * hw, c[1] + nb[1] * hw]); }
	return {d: 'M' + F.concat(B.slice().reverse()).map(P).join(' L') + ' Z', top: 'M' + F.slice(1, 9).map(P).join(' L'),
		under: 'M' + B.slice(0, 10).map(P).join(' L') + ' L' + B.slice(0, 10).map((p, i) => P([p[0] - nb[0] * 6 * (1 - i / 10), p[1] - nb[1] * 6 * (1 - i / 10)])).reverse().join(' L') + ' Z'}; })();

K.horseHead = (o = {}) => {
	const id = K.uid('h3'), x = o.x ?? 960, y = o.y ?? 900, h = o.h ?? 400, s = h / 925, flip = o.flip ? -1 : 1;
	const curl = o.curl ?? 1, glow = o.glow ?? 0.6, mood = o.mood ?? 'warm', refl = o.refl ?? '#9FB2AE', key = o.key ?? 1, base = o.base ?? 'cut';
	const R = {
		warm: {dark: '#0D0705', deep: '#190E09', mid: '#2A1A11', mid2: '#3A2418', lite: '#6E4026', hi: '#C77A45', rim: '#F09A5E', spec: '#FFE6C6', glow: '#FF9A5A'},
		fire: {dark: '#100705', deep: '#1C0E08', mid: '#2E1A10', mid2: '#432616', lite: '#844624', hi: '#E08844', rim: '#FFB060', spec: '#FFF0C8', glow: '#FF9A50'},
		cool: {dark: '#0C0807', deep: '#18110D', mid: '#281C16', mid2: '#37271F', lite: '#644636', hi: '#B08266', rim: '#E7A27A', spec: '#F4F2EA', glow: '#FF9A5A'},
	}[mood];
	const C = {...R, mid: mixC(R.mid, R.lite, (key - 1) * 0.35), mid2: mixC(R.mid2, R.hi, (key - 1) * 0.3), lite: mixC(R.lite, R.hi, (key - 1) * 0.55), hi: mixC(R.hi, R.spec, (key - 1) * 0.3)};
	// r5: the mane is relief in the neck's own surface — the neck's fill shows through; only hard plane facets and grooves on it
	const SH = mixC(C.deep, C.mid, 0.55);                 // the face's jaw-shade value
	// lock by lock, back (crest) to front: the tongue in the neck's fill, then the lock's two facets (front tongues overlap back ones)
	const maneSvg = MANE.slice().reverse().map((L) => (L.forkD ? `<path d="${L.forkD}" fill="${C.mid}"/><path d="${L.forkD}" fill="url(#${id}nk)"/><path d="${L.forkLit}" fill="${C.mid2}"/>` : '') + `<path d="${L.tongue}" fill="${C.mid}"/><path d="${L.tongue}" fill="url(#${id}nk)"/><path d="${L.shade}" fill="${L.k ? SH : mixC(SH, C.mid, 0.5)}"/><path d="${L.lit}" fill="${C.mid2}"/>`).join('')
		+ MANE.slice(1).map((L) => `<path d="${L.grooveCut}" fill="${C.dark}" opacity=".8"/>`).join('')
		+ MANE.map((L) => `<path d="${L.edgeLit}" stroke="${C.hi}" stroke-width="1.8" fill="none" opacity=".35"/>`).join('');
	const E = earRoll, ear = curl > 0.5
		? `<ellipse cx="716" cy="182" rx="52" ry="11" fill="${C.dark}" opacity=".5" filter="url(#${id}bb)"/><g><path d="${E.sil}" fill="${C.mid}"/><path d="${E.cup}" fill="${C.deep}" opacity=".8"/>
		   <path d="${E.flapShadow}" fill="${C.dark}" opacity=".7"/><path d="${E.flap}" fill="${o.earDetail ? mixC(C.mid2, C.lite, 0.3) : C.mid2}"/>
		   ${o.earDetail ? `<path d="${E.litFacet}" fill="${C.lite}"/><path d="${E.bend}" fill="${C.hi}" opacity=".7"/><path d="${E.flapEdge}" stroke="${C.hi}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".55"/>` : ''}
		   <path d="${E.ridge}" stroke="${C.hi}" stroke-width="${o.earDetail ? 2.6 : 3}" fill="none" stroke-linecap="round" opacity=".6"/>
		   <path d="${E.back}" stroke="${C.rim}" stroke-width="3" fill="none" opacity=".7"/></g>`
		: `<path d="${EAR_NEAR}" fill="${C.mid2}"/><path d="${EAR_NEAR_IN}" fill="${C.dark}"/><path d="${EN.back}" stroke="${C.hi}" stroke-width="4" fill="none"/>`;
	// the silhouette (for the rim copies): neck + mane (one outline) + tongues + ears + head
	const sil = (fill) => `<g fill="${fill}"><path d="${NECK}"/>${MANE_TONGUES.map((d) => `<path d="${d}"/>`).join('')}<path d="${EAR_FAR}"/><path d="${curl > 0.5 ? EAR_ROLL : EAR_NEAR}"/><path d="${HEAD}" transform="${HT}"/></g>`;
	const T0 = `translate(${x},${y}) scale(${flip * s},${s}) translate(-836,-950)`;
	if (typeof window !== 'undefined' && window.HERO_MASK) return `<g transform="${T0}"><path d="${NECK}" fill="#00FF00"/><path d="${MANE_REGION}" fill="#FF0000"/>${MANE_TONGUES.map((d) => `<path d="${d}" fill="#FF0000"/>`).join('')}<g fill="#0000FF"><path d="${HEAD}" transform="${HT}"/><path d="${EAR_FAR}"/><path d="${curl > 0.5 ? EAR_ROLL : EAR_NEAR}"/><path d="${FORELOCK.d}"/></g></g>`;
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
	// the post: plain matte black mounting, narrower than the cut, cool grey edge (not bronze), the head's shadow on its top
	const post = base === 'block' ? `<rect x="868" y="${CUT - 6}" width="108" height="${950 - CUT + 6}" fill="#0B0A0A"/>
		<rect x="868" y="${CUT}" width="108" height="18" fill="#000" opacity=".6"/>
		<path d="M869,${CUT + 18} L869,940" stroke="#6A625E" stroke-width="2" opacity=".45"/>` : '';
	const defs = `<defs>
		<clipPath id="${id}c"><path d="${HEAD}"/></clipPath>
		<clipPath id="${id}n"><path d="${NECK}"/>${MANE_TONGUES.map((d) => `<path d="${d}"/>`).join('')}</clipPath>
		<clipPath id="${id}nn"><path d="${NECK}"/></clipPath>
		<radialGradient id="${id}glow"><stop offset="0" stop-color="${o.glowCol ?? C.glow}" stop-opacity="${0.5 * glow}"/><stop offset=".45" stop-color="${o.glowCol ?? C.glow}" stop-opacity="${0.2 * glow}"/><stop offset="1" stop-color="${o.glowCol ?? C.glow}" stop-opacity="0"/></radialGradient>
		<radialGradient id="${id}eye" cx=".38" cy=".34" r=".75"><stop offset="0" stop-color="${C.mid2}"/><stop offset=".4" stop-color="${C.deep}"/><stop offset="1" stop-color="${C.dark}"/></radialGradient>
		<linearGradient id="${id}hs" gradientUnits="userSpaceOnUse" x1="-500" y1="0" x2="-100" y2="460"><stop offset="0" stop-color="${C.hi}" stop-opacity=".12"/><stop offset=".5" stop-color="${C.hi}" stop-opacity="0"/><stop offset="1" stop-color="${C.dark}" stop-opacity=".3"/></linearGradient>
		<filter id="${id}bb" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
		<filter id="${id}bs" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="9"/></filter>
		<filter id="${id}bj" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="16"/></filter>
		<linearGradient id="${id}jw" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.lite}" stop-opacity=".75"/><stop offset=".3" stop-color="${C.mid2}" stop-opacity=".35"/><stop offset=".62" stop-color="${C.mid}" stop-opacity="0"/><stop offset="1" stop-color="${C.dark}" stop-opacity=".85"/></linearGradient>
		<linearGradient id="${id}hb" gradientUnits="userSpaceOnUse" x1="-60" y1="0" x2="60" y2="0"><stop offset="0" stop-color="${C.mid}" stop-opacity="0"/><stop offset="1" stop-color="${C.mid}" stop-opacity=".9"/></linearGradient>
		<linearGradient id="${id}nk" gradientUnits="userSpaceOnUse" x1="840" y1="0" x2="1140" y2="0"><stop offset="0" stop-color="${C.mid2}"/><stop offset=".45" stop-color="${C.mid}"/><stop offset="1" stop-color="${mixC(C.mid, C.deep, 0.3)}"/></linearGradient>
		<linearGradient id="${id}emg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
		<mask id="${id}em" maskUnits="userSpaceOnUse" x="600" y="0" width="260" height="260"><rect x="600" y="0" width="260" height="168" fill="#fff"/><rect x="600" y="168" width="260" height="34" fill="url(#${id}emg)"/></mask>
		<linearGradient id="${id}mb" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1C1817"/><stop offset=".25" stop-color="#121010"/><stop offset="1" stop-color="#080707"/></linearGradient>
	</defs>`;
	const rk = o.rimK ?? 1;
	const body = `
	${glow > 0 ? `<ellipse cx="760" cy="470" rx="760" ry="640" fill="url(#${id}glow)"/>` : ''}
	${block}${post}
	<g transform="translate(${5 * rk},${-3 * rk})" opacity=".9">${sil(C.rim)}</g>
	<g transform="translate(${-3 * rk},${-4 * rk})" opacity=".55">${sil(C.hi)}</g>
	<!-- neck + mane: one casting, one fill, one outline -->
	<path d="${NECK}" fill="${C.mid}"/>${MANE_TONGUES.map((d) => `<path d="${d}" fill="${C.mid}"/>`).join('')}
	<g clip-path="url(#${id}n)"><rect x="600" y="100" width="640" height="900" fill="url(#${id}nk)"/></g>
	<g clip-path="url(#${id}nn)">
		<path d="${NECK_LIT}" fill="${C.lite}" opacity=".55" filter="url(#${id}bb)"/>
		<path d="${UNDER_JOWL}" fill="${C.deep}" opacity=".8" filter="url(#${id}bb)"/>
		<rect x="700" y="${CUT - 14}" width="${f1(GROOVES[0][NV][0] - 700)}" height="14" fill="${C.deep}"/>
	</g>
	<path d="M848,${CUT - 14} L842,${CUT} L${f1(GROOVES[0][NV][0])},${CUT}" stroke="${C.lite}" stroke-width="2.4" fill="none" opacity=".7"/>
	<!-- the mane: grooves and hard plane facets in the same surface (no fill of its own) -->
	${maneSvg}
	<path d="${CREST_TOP}" stroke="${C.hi}" stroke-width="3" fill="none" opacity=".75"/>
	 <path d="${CREST_REFL}" stroke="${refl}" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>
	${MANE_SPECS.map((d) => `<path d="${d}" stroke="${C.spec}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".55"/>`).join('')}
	<!-- far ear (shadow side, pricked): out of the poll, in front of the mane -->
	<path d="${EAR_FAR}" fill="${C.deep}"/><path d="${EAR_FAR_IN}" fill="${C.dark}"/><path d="${EF.back}" stroke="${C.rim}" stroke-width="3" fill="none" opacity=".8"/>
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
	<!-- forelock: one short cast tongue on the forehead's top plane (same lit value), then the near ear in front of everything -->
	<path d="${FORELOCK.d}" fill="${C.lite}"/><path d="${FORELOCK.under}" fill="${C.mid2}"/><path d="${FORELOCK.top}" stroke="${C.hi}" stroke-width="2.4" fill="none" opacity=".8"/>
	${ear}`;
	return `<g transform="${T0}">${defs}${body}</g>`;
};
const HP = {mouth: hp([-572, 226]), eye: hp([EYE.c[0], EYE.c[1]]), ear: [712, 40], nose: hp([-620, 130]), poll: [712, 150], collarF: [760, CUT], collarB: [1128, CUT], throat: [800, 766]};
K.HEAD_PTS = Object.fromEntries(Object.entries(HP).map(([k, p]) => [k, [p[0] - 836, p[1] - 950]]));
K.HERO3_GEO = {MANE, GROOVES, MB, MF, MANE_REGION, NECK, hp, CUT};   // r5 geometry (the r4 hero_measure.mjs lock stats no longer apply)
K.HEAD_PTS.height = 925; K.HEAD_PTS.cut = CUT - 950;
K.headPt = (o, name) => { const s = (o.h ?? 400) / 925, f = o.flip ? -1 : 1, p = K.HEAD_PTS[name]; return [o.x + f * p[0] * s, o.y + p[1] * s]; };
})();
