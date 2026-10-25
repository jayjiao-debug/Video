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
C-546,210 -500,206 -452,198 L-448,210 C-492,226 -532,236 -558,244 C-584,252 -586,278 -564,288 C-532,300 -488,294 -442,294
C-360,298 -290,330 -236,380 C-180,436 -120,456 -56,446 C4,436 40,370 42,280 C42,170 22,64 0,0 Z`;
const MOUTH_IN = `M-582,204 L-452,200 L-560,248 C-574,236 -582,220 -582,204 Z`;
const TOP_PLANE = `M14,-30 L0,0 C-50,-8 -110,0 -164,12 C-280,26 -410,40 -512,50 C-556,54 -592,76 -608,108 L-574,106
C-562,90 -540,84 -514,82 C-410,72 -290,62 -180,50 C-120,44 -64,40 -20,46 Z`;
const REFL = `M-150,20 C-260,32 -390,46 -490,58 C-520,60 -546,70 -562,86 L-556,92 C-540,80 -518,74 -490,72 C-390,60 -262,48 -150,34 Z`;
const UPPER_SIDE = `M-20,46 C-64,40 -120,44 -180,50 C-290,62 -410,72 -514,82 C-540,84 -562,92 -574,108 L-588,166
C-540,166 -484,178 -446,194 C-390,214 -320,240 -240,250 C-150,262 -60,272 40,290 L30,60 Z`;
const CHEEK_EDGE = `M40,290 C-60,272 -150,262 -240,250 C-320,240 -390,214 -446,196`;      // hard plane edge, throat → mouth corner
const JAW_SHADE = `M40,290 C-60,272 -150,262 -240,250 C-320,240 -390,214 -446,196 L-446,206 C-492,226 -532,236 -558,244 L-600,340 L-60,520 L60,400 Z`;
const JAW_CORE = `M-442,294 C-360,298 -290,330 -236,380 C-180,436 -120,456 -56,446 C-20,440 10,420 26,392
C-20,416 -90,422 -150,404 C-220,384 -290,330 -380,306 C-410,300 -430,300 -442,302 Z`;
const JOWL_RIM = `M30,380 C40,350 44,316 42,280`;
const JAW_RIM = `M-442,294 C-360,298 -290,330 -236,380 C-180,436 -120,456 -56,446`;
const TOP_LINE = `M0,0 C-50,-8 -110,0 -164,12 C-280,26 -410,40 -512,50 C-572,56 -616,94 -620,142`;
const CREST_RIDGE = `M-130,132 C-90,142 -40,148 10,148`;           // facial crest: from under the eye back to the jaw joint
const MUZZLE_LIT = `M-520,84 C-560,88 -596,108 -604,140 C-606,158 -598,172 -580,174 C-576,152 -560,134 -536,124 C-510,114 -488,112 -470,112 Z`;
const NOSTRIL = `M-544,132 C-568,132 -584,150 -584,168 C-584,178 -576,184 -568,182 C-572,170 -568,156 -556,150 C-544,144 -526,146 -516,152 C-518,140 -528,132 -544,132 Z`;
const NOSTRIL_FLARE = `M-516,152 C-504,166 -508,186 -526,196`;
const NOSTRIL_RIM = `M-584,168 C-582,150 -570,138 -552,134`;
const NOSE_FOLD = `M-530,118 C-518,110 -498,110 -484,118`;
const LIP_LINE = `M-576,210 C-544,214 -500,208 -452,200`;
const CHIN_LIT = `M-564,288 C-532,300 -488,294 -442,294`;
const SPECS = [['M-110,16 C-140,20 -170,24 -194,30', 5, 0.85], ['M-430,54 C-460,57 -482,59 -502,62', 4, 0.75], ['M-596,114 C-604,126 -608,138 -608,148', 4, 0.8], ['M-280,226 C-250,224 -220,224 -190,228', 2.5, 0.5]];
// eye (big, bulging, glossy, lid rims; the brow is the lit orbital plane above, no stroke)
const EYE = {c: [-196, 84], rx: 37, ry: 28, rot: 12};
const ORBIT_LIT = `M-254,58 C-234,30 -184,22 -140,40 C-124,48 -114,60 -112,72 C-134,56 -164,48 -196,50 C-220,52 -240,56 -254,66 Z`;
const ORBIT_SHADE = `M-112,72 C-110,96 -124,118 -154,124 C-194,130 -234,118 -254,96 C-234,112 -196,118 -164,112 C-140,106 -122,92 -112,72 Z`;
const ORBIT_EDGE = `M-254,62 C-234,32 -184,24 -140,42 C-124,50 -114,62 -112,72`;

/* ---------- neck, ears, forelock, mane (base frame) ---------- */
const CUT = G.cut;
const NECK = `M700,130 C800,130 910,200 980,320 C1040,430 1070,600 1080,${CUT - 30} L1096,${CUT} L760,${CUT} L770,${CUT - 30}
C772,800 780,780 800,766 C860,740 900,640 905,520 C905,360 820,170 700,130 Z`;
const NECK_LIT = `M730,726 C698,748 676,776 668,${CUT - 30} L652,${CUT} L742,${CUT} C746,800 760,768 792,740 C770,742 748,738 730,726 Z`;
const NECK_GROOVE = `M884,756 C870,786 860,810 856,${CUT - 6}`;
const UNDER_JOWL = `M905,520 C900,640 860,740 800,766 C850,786 920,770 950,700 C970,650 970,580 950,530 Z`;
/** crest: poll → back of the cut, the line the mane parts on */
const CREST = [[772, 150], [884, 192], [974, 302], [1032, 444], [1064, 620], [1084, CUT - 20]];
const crestAt = (t) => { const n = CREST.length - 1, k = Math.min(n - 1, Math.floor(t * n)), u = t * n - k, a = CREST[k], b = CREST[k + 1]; return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]; };
/** one lock: rooted on the crest at t, an S-wave down along the neck to a forked flame tip below the cut */
const lockGeo = (t, i, lay) => {
	const r = crestAt(t), far = lay === 2;
	const tipX = far ? r[0] + 70 + 70 * rnd(i * 3 + 5) + 50 * (1 - t) : 770 + 340 * Math.pow(t, 0.85) + (rnd(i * 3 + lay) - 0.5) * 40 - (lay ? 22 : 0);
	const tipY = far ? Math.max(r[1] + 160, CUT + 10 + 50 * rnd(i * 7 + 2)) : CUT + 28 + 40 * rnd(i * 7 + lay) + 30 * t;
	const root = far ? [r[0] - 6, r[1] + 2] : [r[0] - 10 - lay * 8, r[1] + 4], tip = [tipX, tipY], n = 40, pts = [];
	const dx = tip[0] - root[0], dy = tip[1] - root[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, ph = rnd(i * 5 + lay * 11) * 6.28, amp = 10 + 12 * rnd(i + lay * 3), waves = 1.3 + 0.6 * rnd(i * 13 + lay);
	for (let k = 0; k <= n; k++) { const s = k / n, bow = Math.sin(Math.PI * s) * (far ? 40 + 30 * (1 - t) : -26 - 30 * (1 - t)), w = Math.sin(6.283 * waves * s + ph) * amp * Math.min(1, s * 3);
		pts.push([root[0] + dx * s + nx * (bow + w), root[1] + dy * s + ny * (bow + w)]); }
	const W0 = (lay ? 22 : 26) * (0.85 + 0.3 * rnd(i * 17 + lay));
	const width = (s) => W0 * (s < 0.12 ? 0.55 + s / 0.12 * 0.45 : s < 0.72 ? 1 : Math.max(0.04, 1 - (s - 0.72) / 0.28)) * (1 + 0.15 * Math.sin(s * 9 + i));
	const L1 = [], R1 = [];
	pts.forEach((p, k) => { const q = pts[Math.min(k + 1, n)], o = pts[Math.max(k - 1, 0)], ddx = q[0] - o[0], ddy = q[1] - o[1], d = Math.hypot(ddx, ddy) || 1, w = width(k / n);
		L1.push([p[0] - ddy / d * w, p[1] + ddx / d * w]); R1.push([p[0] + ddy / d * w, p[1] - ddx / d * w]); });
	// the fork: a second, shorter flame tip leaving the lock at 70 % toward the front
	const fk = Math.round(n * 0.68), fb = pts[fk], fdir = Math.atan2(pts[n][1] - fb[1], pts[n][0] - fb[0]) - 0.45 - 0.2 * rnd(i + 40), fl = Math.hypot(pts[n][0] - fb[0], pts[n][1] - fb[1]) * (0.7 + 0.2 * rnd(i + 41));
	const fpts = []; for (let k = 0; k <= 10; k++) { const s = k / 10, a = fdir + 0.5 * s * s; fpts.push([fb[0] + Math.cos(a) * fl * s, fb[1] + Math.sin(a) * fl * s]); }
	const FL = [], FR = []; fpts.forEach((p, k) => { const q = fpts[Math.min(k + 1, 10)], o = fpts[Math.max(k - 1, 0)], ddx = q[0] - o[0], ddy = q[1] - o[1], d = Math.hypot(ddx, ddy) || 1, w = W0 * 0.55 * (1 - k / 10) + 0.5;
		FL.push([p[0] - ddy / d * w, p[1] + ddx / d * w]); FR.push([p[0] + ddy / d * w, p[1] - ddx / d * w]); });
	const outline = 'M' + L1.concat(R1.slice().reverse()).map(P).join(' L') + ' Z';
	const fork = 'M' + FL.concat(FR.slice().reverse()).map(P).join(' L') + ' Z';
	// fine grooves along the lock (5), plus the fork's 2
	const grooves = [0.18, 0.36, 0.54, 0.72, 0.88].map((f, g) => 'M' + pts.slice(3, n - 2 - (g % 2) * 3).map((p, k) => { const kk = k + 3; return P([L1[kk][0] + (R1[kk][0] - L1[kk][0]) * f, L1[kk][1] + (R1[kk][1] - L1[kk][1]) * f]); }).join(' L'));
	const fg = [0.35, 0.7].map((f) => 'M' + fpts.slice(1, 8).map((p, k) => P([FL[k + 1][0] + (FR[k + 1][0] - FL[k + 1][0]) * f, FL[k + 1][1] + (FR[k + 1][1] - FL[k + 1][1]) * f])).join(' L'));
	return {outline, fork, grooves: grooves.concat(fg), lit: 'M' + L1.slice(2, n - 6).map(P).join(' L'), gap: 'M' + R1.slice(2, n - 2).map(P).join(' L'), t, lay};
};
/** the crest ridge: a smooth band of hair along the parting, covering the lock roots */
const RIDGE_PTS = Array.from({length: 25}, (_, k) => crestAt(k / 24 * 0.62));
const ridgeSide = (off) => RIDGE_PTS.map((p, k) => { const q = RIDGE_PTS[Math.min(k + 1, 24)], o = RIDGE_PTS[Math.max(k - 1, 0)], dx = q[0] - o[0], dy = q[1] - o[1], d = Math.hypot(dx, dy) || 1, w = off * (0.4 + 0.6 * Math.sin(Math.PI * Math.min(1, 0.15 + k / 24))); return [p[0] - dy / d * w, p[1] + dx / d * w]; });
const RIDGE = 'M' + ridgeSide(-6).concat(ridgeSide(30).reverse()).map(P).join(' L') + ' Z';
const RIDGE_G = [6, 13, 20].map((o) => 'M' + ridgeSide(o).slice(1, 23).map(P).join(' L'));
const RIDGE_TOP = 'M' + ridgeSide(-4).slice(0, 24).map(P).join(' L');
const LOCKS = [], FAR = [];
for (let lay = 0; lay < 2; lay++) { const N = lay ? 16 : 19; for (let i = 0; i < N; i++) LOCKS.push(lockGeo(Math.min(0.98, (i + 0.5 * lay + 0.3 * rnd(i * 9 + lay)) / N), i + lay * 40, lay)); }
for (let i = 0; i < 14; i++) FAR.push(lockGeo(0.04 + 0.92 * (i + 0.3 * rnd(i + 70)) / 14, i + 90, 2));
LOCKS.sort((a, b) => a.lay - b.lay || b.t - a.t);       // back locks first, the front of each layer on top
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
	const lockSvg = (L) => `<path d="${L.outline}" fill="${C.mid}"/><path d="${L.fork}" fill="${C.mid}"/>
		<path d="${L.gap}" stroke="${C.dark}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
		${L.grooves.map((g, k) => `<path d="${g}" stroke="${k % 2 ? C.deep : C.dark}" stroke-width="${k % 2 ? 1.5 : 1.9}" fill="none" opacity=".8" stroke-linecap="round"/><path d="${g}" stroke="${C.lite}" stroke-width="1.1" fill="none" opacity=".45" transform="translate(-1.6,-1.2)"/>`).join('')}
		<path d="${L.lit}" stroke="${C.hi}" stroke-width="2.6" fill="none" opacity=".6" stroke-linecap="round"/>`;
	const ear = curl > 0.5
		? `<path d="${EAR_ROLL}" fill="${C.mid2}"/><path d="${EAR_ROLL_HOLLOW}" fill="${C.deep}"/>
		   <path d="${EAR_ROLL_TOP}" stroke="${C.hi}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>
		   <ellipse cx="712" cy="34" rx="9" ry="4.5" transform="rotate(-10 712 34)" fill="${C.spec}" opacity=".85"/>`
		: `<path d="${EAR_NEAR}" fill="${C.mid2}"/><path d="${EAR_NEAR_IN}" fill="${C.dark}"/><path d="${EN.back}" stroke="${C.hi}" stroke-width="4" fill="none"/>`;
	// the silhouette (for the rim copies): neck + head + ears + mane
	const sil = (fill) => `<g fill="${fill}">${FAR.map((L) => `<path d="${L.outline}"/><path d="${L.fork}"/>`).join('')}<path d="${NECK}"/>${LOCKS.map((L) => `<path d="${L.outline}"/><path d="${L.fork}"/>`).join('')}<path d="${EAR_FAR}"/><path d="${curl > 0.5 ? EAR_ROLL : EAR_NEAR}"/><path d="${HEAD}" transform="${HT}"/></g>`;
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
		<linearGradient id="${id}nk" gradientUnits="userSpaceOnUse" x1="760" y1="0" x2="990" y2="0"><stop offset="0" stop-color="${C.mid2}"/><stop offset=".45" stop-color="${C.mid}"/><stop offset="1" stop-color="${C.deep}"/></linearGradient>
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
		<path d="${UNDER_JOWL}" fill="${C.deep}" opacity=".75"/>
		<path d="${NECK_GROOVE}" stroke="${C.deep}" stroke-width="9" fill="none" opacity=".8"/>
		<rect x="700" y="${CUT - 14}" width="420" height="14" fill="${C.deep}"/>
	</g>
	<path d="M770,${CUT - 30} L760,${CUT} L1096,${CUT}" stroke="${C.lite}" stroke-width="2.4" fill="none" opacity=".7"/>
	<!-- mane: back layer, front layer; a light-falloff wash over it -->
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
			<path d="${JAW_CORE}" fill="${C.deep}"/>
			<path d="${TOP_PLANE}" fill="${C.lite}"/>
			<path d="${REFL}" fill="${refl}" opacity=".5"/>
			<path d="${MUZZLE_LIT}" fill="${C.lite}" opacity=".85"/>
			<rect x="-700" y="-60" width="800" height="560" fill="url(#${id}hs)"/>
			<path d="${CHEEK_EDGE}" stroke="${C.lite}" stroke-width="2.4" fill="none" opacity=".45"/>
			<path d="${CREST_RIDGE}" stroke="${C.hi}" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/>
			<path d="${CREST_RIDGE}" stroke="${C.dark}" stroke-width="3" fill="none" opacity=".6" transform="translate(0,5)"/>
			<path d="${JOWL_RIM}" stroke="${C.rim}" stroke-width="4" fill="none" opacity=".6"/>
			<path d="${ORBIT_SHADE}" fill="${C.deep}"/>
			<path d="${ORBIT_LIT}" fill="${C.lite}"/>
			<path d="${ORBIT_EDGE}" stroke="${C.hi}" stroke-width="3" fill="none" opacity=".8"/>
			<path d="${NOSE_FOLD}" stroke="${C.dark}" stroke-width="3.5" fill="none" opacity=".8"/>
			<path d="${NOSTRIL}" fill="${C.dark}"/>
			<path d="${NOSTRIL_FLARE}" stroke="${C.hi}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
			<path d="${NOSTRIL_RIM}" stroke="${C.hi}" stroke-width="2.4" fill="none" opacity=".8"/>
			<path d="${LIP_LINE}" stroke="${C.hi}" stroke-width="2.2" fill="none" opacity=".55" transform="translate(0,-4)"/>
			<path d="${CHIN_LIT}" stroke="${C.rim}" stroke-width="3" fill="none" opacity=".6" transform="translate(0,-3)"/>
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
K.HEAD_PTS.height = 925; K.HEAD_PTS.cut = CUT - 950;
K.headPt = (o, name) => { const s = (o.h ?? 400) / 925, f = o.flip ? -1 : 1, p = K.HEAD_PTS[name]; return [o.x + f * p[0] * s, o.y + p[1] * s]; };
})();
