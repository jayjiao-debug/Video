// ep43 figures: one-tone human silhouettes in profile, as SVG path strings (no React).
// Port of ep37 qq42/figure42.tsx (Figure4 / fkPose / POSES / mixPose / gaitPose) for the three.js film, which rasterises
// SVG layers into textures. Additions: analytic 2-bone arm IK (reach) so a hand lands exactly on a prop point,
// handAt() to check contact, planted feet, robes drawn as a hull over the leg skeleton (legs never poke through),
// wide sleeves that hang by gravity, and the era heads/costumes of the ep43 storyboard.
//
// Conventions (same as Figure4): a Pose is in BODY UNITS, y up, feet on y = 0, facing +x, head top ~1.0.
// On screen: (x, ground) is the point between the feet, h = figure height in px, flip mirrors to face -x.
import {GAITS} from './gaits';

export type P = [number, number];
export type Pose = Record<string, P>;
export type Side = 'L' | 'R';

export type Head =
	| 'zhanjiao'   // 宋 court official 展脚幞头 (long straight wings)
	| 'futou'      // 宋 soft 幞头 with two soft tails (painter)
	| 'scarf'      // refugee headscarf, knot at the back
	| 'dongpo'     // 金 scholar's tall stepped cap (东坡巾)
	| 'clothcap'   // 元 plain cloth cap, no tails
	| 'boli'       // 元 钹笠 brimmed hat (round-ended brim)
	| 'ruanjin'    // 元 Han scholar's soft cap leaning back, short ribbons
	| 'fangjin'    // 明 square scholar's cap (四方平定巾)
	| 'wusha'      // 明 乌纱帽 with side wings
	| 'neishi'     // 明 eunuch's tall rounded cap
	| 'qingcap'    // 清 official's cap: upturned brim, top knob
	| 'guapi'      // 1923 瓜皮帽 skullcap with knob
	| 'peaked'     // 1945 peaked military cap
	| 'cadre'      // 1950 soft cap with a short visor
	| 'short'      // short hair (1973)
	| 'modern'     // today: short modern hair with volume on top
	| 'ponytail'   // today: tied-back hair
	| 'bun';       // commoner topknot (crowd extras)
export type Dress = 'robe' | 'gown' | 'tunic' | 'greatcoat' | 'smock' | 'jacket' | 'zip';
export type LookQ = {
	head: Head; dress: Dress;
	sleeves?: 'wide' | 'narrow';
	beard?: 'short' | 'long' | 'full' | 'moustache';
	build?: number;                      // girth multiplier (1 = kit)
	pack?: 'bundle' | 'backpack';        // refugee's cloth bundle / visitor's backpack
	surcoat?: boolean;                   // 清 knee-length 补褂 over the robe
};

/** every look the ep43 storyboard needs */
export const LOOKS = {
	songOfficial: {head: 'zhanjiao', dress: 'robe', sleeves: 'wide', beard: 'short', build: 1.06},
	songPainter: {head: 'futou', dress: 'robe', sleeves: 'wide', beard: 'short'},
	refugee: {head: 'scarf', dress: 'tunic', pack: 'bundle'},
	jinScholar: {head: 'dongpo', dress: 'robe', sleeves: 'wide', beard: 'long'},
	yuanCraftsman: {head: 'clothcap', dress: 'robe', sleeves: 'narrow'},
	yuanNoble: {head: 'boli', dress: 'robe', sleeves: 'narrow', beard: 'moustache', build: 1.08},
	yuanScholar: {head: 'ruanjin', dress: 'robe', sleeves: 'wide', beard: 'long'},
	mingScholar: {head: 'fangjin', dress: 'robe', sleeves: 'wide', beard: 'long'},
	mingOfficial: {head: 'wusha', dress: 'robe', sleeves: 'wide', beard: 'full', build: 1.06},
	mingEunuch: {head: 'neishi', dress: 'robe', sleeves: 'narrow'},
	qingOfficial: {head: 'qingcap', dress: 'robe', sleeves: 'narrow', surcoat: true, beard: 'moustache'},
	youth1923: {head: 'guapi', dress: 'gown', sleeves: 'narrow', build: 0.96},
	guard1945: {head: 'peaked', dress: 'greatcoat', build: 1.04},
	cadre1950: {head: 'cadre', dress: 'jacket'},
	restorer1973: {head: 'short', dress: 'smock'},
	visitor: {head: 'modern', dress: 'zip', pack: 'backpack'},
	visitorW: {head: 'ponytail', dress: 'zip', build: 0.94},
} satisfies Record<string, LookQ>;
export type LookName = keyof typeof LOOKS;

/* ---------------- vector helpers (body units, y up) ---------------- */
const D = Math.PI / 180;
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]];
const mul = (a: P, k: number): P => [a[0] * k, a[1] * k];
const len = (a: P) => Math.hypot(a[0], a[1]);
const nrm = (a: P): P => { const l = len(a) || 1e-9; return [a[0] / l, a[1] / l]; };
const rot = (a: P, r: number): P => [a[0] * Math.cos(r) - a[1] * Math.sin(r), a[0] * Math.sin(r) + a[1] * Math.cos(r)];   // CCW (y up)
const mix = (a: P, b: P, u: number): P => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const along = (a: P, b: P, n: number): P[] => Array.from({length: n + 1}, (_, i) => mix(a, b, i / n));
const prof = (n: number, f: (s: number) => number) => Array.from({length: n + 1}, (_, i) => f(i / n));
const dir = (deg: number, l: number): P => [Math.sin(deg * D) * l, -Math.cos(deg * D) * l];   // 0 = straight down, + = forward
const upv = (deg: number, l: number): P => [Math.sin(deg * D) * l, Math.cos(deg * D) * l];    // 0 = straight up, + = leaning forward

/** bone lengths (body units). grip = palm centre, measured from the wrist along the hand */
export const BL = {thigh: 0.264, shin: 0.269, foot: 0.11, ankle: 0.045, spine: 0.155, neck: 0.0625, head: 0.0618, top: 0.066, sh: 0.058, upper: 0.194, fore: 0.135, hand: 0.066, grip: 0.033};
export const ARM_REACH = BL.upper + BL.fore + BL.grip;   // shoulder → palm centre, arm straight

/* ---------------- feet ---------------- */
// A foot is stored as ankle (Ank) and toe (Toe, on the sole line). The sole direction is the ankle→toe line turned by FA.
const FA = Math.atan2(BL.ankle, BL.foot);
const footFrame = (A: P, T: P) => {
	const v = sub(T, A), l = len(v) || 1e-6, s = rot(mul(v, 1 / l), FA), m: P = [-s[1], s[0]];
	return {s, m, B: sub(T, mul(s, l * Math.cos(FA))), ku: (l * Math.cos(FA)) / BL.foot, kw: (l * Math.sin(FA)) / BL.ankle};
};
// shoe outline in the foot frame (u along the sole from under the ankle, w up from the sole)
const SHOE = 'M-0.03,0 L0.104,0 Q0.12,0 0.12,0.009 Q0.119,0.019 0.102,0.022 Q0.064,0.03 0.032,0.054 L-0.02,0.062 Q-0.04,0.054 -0.043,0.024 Q-0.044,0 -0.03,0 Z';
const SHOE_PTS: P[] = [[-0.03, 0], [0.104, 0], [0.12, 0.009], [0.102, 0.022], [0.032, 0.054], [-0.02, 0.062], [-0.043, 0.024]];
const shoeMap = (A: P, T: P) => { const F = footFrame(A, T); return (p: P): P => add(F.B, add(mul(F.s, p[0] * F.ku), mul(F.m, p[1] * F.kw))); };

/** shift a pose up/down so its lowest shoe point (or a kneeling knee) rests on y = 0 */
export const plant = (p: Pose): Pose => {
	let lo = Infinity;
	for (const s of ['L', 'R']) { const m = shoeMap(p[`${s}Ank`], p[`${s}Toe`]); for (const q of SHOE_PTS) lo = Math.min(lo, m(q)[1]); lo = Math.min(lo, p[`${s}Knee`][1] - 0.034); }
	const o: Pose = {}; for (const k of Object.keys(p)) o[k] = [p[k][0], p[k][1] - lo]; return o;
};

/* ---------------- poses ---------------- */
const tipOf = (el: P, ha: P): P => add(ha, mul(nrm(sub(ha, el)), BL.hand));
const MAP: Record<string, string> = {Hips: 'Hips', LUp: 'LeftUpLeg', LKnee: 'LeftLeg', LAnk: 'LeftFoot', LToe: 'LToeTip', RUp: 'RightUpLeg', RKnee: 'RightLeg', RAnk: 'RightFoot', RToe: 'RToeTip',
	Spine1: 'Spine1', Neck1: 'Neck1', Head: 'Head', Top: 'HeadTop', LSh: 'LeftArm', LElb: 'LeftForeArm', LHand: 'LeftHand', RSh: 'RightArm', RElb: 'RightForeArm', RHand: 'RightHand'};
const gaitCal: Record<string, {phi: number; k: number}> = {};
const rawGait = (g: string, u: number): Pose => {
	const out: Pose = {};
	for (const [k, n] of Object.entries(MAP)) { const a = GAITS[g].j[n], N = a.length / 2, x = (((u % 1) + 1) % 1) * N, i = Math.floor(x), f = x - i, j = (i + 1) % N; out[k] = [lerp(a[2 * i], a[2 * j], f), lerp(a[2 * i + 1], a[2 * j + 1], f)]; }
	return out;
};
const calib = (g: string) => {
	if (gaitCal[g]) return gaitCal[g];
	const a = GAITS[g].j, N = a.Hips.length / 2; let best = 0;
	for (let i = 0; i < N; i++) if (a.LeftFoot[2 * i + 1] < a.LeftFoot[2 * best + 1]) best = i;
	const phi = Math.atan2(a.LToeTip[2 * best + 1] - a.LeftFoot[2 * best + 1], a.LToeTip[2 * best] - a.LeftFoot[2 * best]);   // ankle→toe angle when the foot is flat
	gaitCal[g] = {phi, k: 1}; let top = 0;
	for (let i = 0; i < 16; i++) top += gaitPose(g, i / 16)[`Top`][1] / 16;
	gaitCal[g] = {phi, k: 1 / top}; return gaitCal[g];
};
/**
 * the mocap walk at phase u (loops): feet re-modelled so the stance foot is flat and planted, scaled to head top ≈ 1.
 * step < 1 shortens the stride (leg joints pulled toward the hips in x, arm swing halved by the same amount). Use it only
 * under long robes, where the legs are hidden: stepFor(look) gives 0.72 for robes/gowns and 1 otherwise.
 */
export const gaitPose = (g = '08_04', u = 0, step = 1): Pose => {
	const c = calib(g), p = rawGait(g, u), hx = p.Hips[0], ak = lerp(1, step, 0.5);
	const toeV: Record<string, P> = {L: nrm(sub(p.LToe, p.LAnk)), R: nrm(sub(p.RToe, p.RAnk))};
	if (step !== 1) for (const s of ['L', 'R']) {
		for (const j of ['Up', 'Knee', 'Ank']) p[`${s}${j}`] = [hx + (p[`${s}${j}`][0] - hx) * step, p[`${s}${j}`][1]];
		const sh = p[`${s}Sh`]; for (const j of ['Elb', 'Hand']) p[`${s}${j}`] = [sh[0] + (p[`${s}${j}`][0] - sh[0]) * ak, p[`${s}${j}`][1]];
	}
	for (const s of ['L', 'R']) {   // rebuild the toe on the sole line of our foot model
		const A = p[`${s}Ank`], v = toeV[s], sd = rot(v, -c.phi), m: P = [-sd[1], sd[0]];
		p[`${s}Toe`] = add(sub(A, mul(m, BL.ankle)), mul(sd, BL.foot));
		p[`${s}Tip`] = tipOf(p[`${s}Elb`], p[`${s}Hand`]);
	}
	const q = plant(p); if (c.k === 1) return q;
	for (const k of Object.keys(q)) q[k] = [q[k][0] * c.k, q[k][1] * c.k];
	return q;
};
/** body units travelled per gait cycle (advance x by stride * h * cycles so the feet do not slide) */
export const gaitStride = (g = '08_04', step = 1) => GAITS[g].stride * calib(g).k * step;
/** stride scale for a look: long robes and gowns walk with shorter steps so the hem does not tent out */
export const stepFor = (look: LookQ) => (look.dress === 'robe' || look.dress === 'gown' ? 0.72 : 1);
/** a walk pose suited to the look (gaitPose with stepFor(look)); advance x by gaitStride(g, stepFor(look)) * h per cycle */
export const walkFor = (look: LookQ, u: number, g = '08_04'): Pose => gaitPose(g, u, stepFor(look));
export const gaitSeconds = (g = '08_04') => GAITS[g].seconds;

/** designed pose by 2D forward kinematics. Degrees; legs/arms from straight down, + = forward; lw/rw bend the hand off the forearm */
export type FK = {hip: number; hipX?: number; lean: number; neck?: number; lt: number; lk: number; rt: number; rk: number; lf?: number; rf?: number; la: number; le: number; ra: number; re: number; lw?: number; rw?: number};
export const fkPose = (k: FK): Pose => {
	const hips: P = [k.hipX ?? 0, k.hip];
	const leg = (t: number, kn: number, ft = 0, side = 1) => { const u: P = add(hips, [0.0084 * side, -0.066]), kneeP = add(u, dir(t, BL.thigh)), ank = add(kneeP, dir(t - kn, BL.shin)), toe = add(ank, rot([BL.foot, -BL.ankle], ft * D)); return [u, kneeP, ank, toe]; };
	const [LUp, LKnee, LAnk, LToe] = leg(k.lt, k.lk, k.lf ?? 0, 1), [RUp, RKnee, RAnk, RToe] = leg(k.rt, k.rk, k.rf ?? 0, -1);
	const sp = add(hips, upv(k.lean, BL.spine)), n1 = add(sp, upv(k.lean + (k.neck ?? 0) * 0.5, BL.neck)), hd = add(n1, upv(k.lean + (k.neck ?? 0), BL.head)), top = add(hd, upv(k.lean + (k.neck ?? 0), BL.top));
	const LSh = add(sp, upv(k.lean, BL.sh)), RSh = add(LSh, [0.008, -0.01]);
	const arm = (sh: P, a: number, e: number, w = 0): [P, P, P] => { const el = add(sh, dir(a, BL.upper)), ha = add(el, dir(a + e, BL.fore)); return [el, ha, add(ha, dir(a + e + w, BL.hand))]; };
	const [LElb, LHand, LTip] = arm(LSh, k.la, k.le, k.lw), [RElb, RHand, RTip] = arm(RSh, k.ra, k.re, k.rw);
	return plant({Hips: hips, LUp, LKnee, LAnk, LToe, RUp, RKnee, RAnk, RToe, Spine1: sp, Neck1: n1, Head: hd, Top: top, LSh, LElb, LHand, LTip, RSh, RElb, RHand, RTip});
};
export const mixPose = (a: Pose, b: Pose, k: number): Pose => { const o: Pose = {}; for (const n of Object.keys(a)) if (b[n]) o[n] = mix(a[n], b[n], k); return o; };
/** take one or both arms (elbow, wrist, hand tip) from src, re-anchored at this pose's shoulders (e.g. a walk carrying a roll) */
export const armsFrom = (pose: Pose, src: Pose, sides: string = 'LR'): Pose => {
	const o = {...pose};
	for (const s of sides) { const d = sub(pose[`${s}Sh`], src[`${s}Sh`]); for (const j of ['Elb', 'Hand', 'Tip']) o[`${s}${j}`] = add(src[`${s}${j}`], d); }
	return o;
};

/* ---------------- arm IK ---------------- */
export type ReachOpt = {
	dir?: number;      // hand direction in degrees (0 = pointing +x/forward, 90 = up, -90 = down). Default: in line with the forearm
	grip?: number;     // palm-centre distance from the wrist (default BL.grip)
	bend?: 1 | -1;     // 1 (default) = natural elbow (forearm flexes forward; elbow below/behind the line); -1 = the other solution
};
/**
 * 2-bone analytic IK: move the arm on `side` so its palm centre lands exactly on `target` (body units).
 * Bone lengths are the kit's (upper 0.194, fore 0.135). If the target is out of reach the arm points straight at it and
 * falls short; check with reachGap() or handAt().
 */
export const reach = (pose: Pose, side: Side, target: P, opt: ReachOpt | number = {}): Pose => {
	const o: ReachOpt = typeof opt === 'number' ? {dir: opt} : opt, g = o.grip ?? BL.grip, S = pose[`${side}Sh`], a = BL.upper;
	const hd: P | null = o.dir === undefined ? null : [Math.cos(o.dir * D), Math.sin(o.dir * D)];
	const W = hd ? sub(target, mul(hd, g)) : target, b = hd ? BL.fore : BL.fore + g;
	const v = sub(W, S), dn = nrm(v), d = clamp(len(v), Math.abs(a - b) + 1e-4, a + b - 1e-6);
	const A = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1));
	const E = add(S, mul(rot(dn, -A * (o.bend ?? 1)), a)), Wc = add(S, mul(dn, d)), fd = nrm(sub(Wc, E));
	const H = add(E, mul(fd, BL.fore)), T = hd ? add(H, mul(hd, BL.hand)) : add(E, mul(fd, BL.fore + BL.hand));
	return {...pose, [`${side}Elb`]: E, [`${side}Hand`]: H, [`${side}Tip`]: T};
};
/** how far (body units) the palm would fall short of target; 0 = reachable */
export const reachGap = (pose: Pose, side: Side, target: P, opt: ReachOpt = {}) => {
	const g = opt.grip ?? BL.grip, hd: P | null = opt.dir === undefined ? null : [Math.cos(opt.dir * D), Math.sin(opt.dir * D)];
	const W = hd ? sub(target, mul(hd, g)) : target;
	return Math.max(0, len(sub(W, pose[`${side}Sh`])) - (BL.upper + BL.fore + (hd ? 0 : g)));
};
/** palm centre of a pose (body units) */
export const gripOf = (pose: Pose, side: Side): P => add(pose[`${side}Hand`], mul(nrm(sub(pose[`${side}Tip`], pose[`${side}Hand`])), BL.grip));

/* ---------------- placement ---------------- */
export type FigOpts = {x: number; ground: number; h: number; pose: Pose; look: LookQ; flip?: boolean; T?: number; col?: string};
type Place = {x: number; ground: number; h: number; flip?: boolean};
/** body units → screen px for a placement */
export const toScreen = (o: Place, p: P): P => [o.x + (o.flip ? -1 : 1) * p[0] * o.h, o.ground - p[1] * o.h];
/** screen px → body units for a placement (use it to aim reach() at a prop drawn in screen space) */
export const toBody = (o: Place, s: P): P => [((s[0] - o.x) * (o.flip ? -1 : 1)) / o.h, (o.ground - s[1]) / o.h];
/** screen position of the palm centre of a figureSVG call */
export const handAt = (o: Place & {pose: Pose}, side: Side): P => toScreen(o, gripOf(o.pose, side));
/** screen position of any joint */
export const jointAt = (o: Place & {pose: Pose}, name: string): P => toScreen(o, o.pose[name]);

/* ---------------- drawing ---------------- */
const f1 = (v: number) => (Math.round(v * 10) / 10).toString();
const hull = (pts: P[]): P[] => {
	const a = pts.slice().sort((p, q) => p[0] - q[0] || p[1] - q[1]), cr = (o: P, p: P, q: P) => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);
	const lo: P[] = [], hi: P[] = [];
	for (const p of a) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
	for (let i = a.length - 1; i >= 0; i--) { const p = a[i]; while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
	hi.pop(); lo.pop(); return lo.concat(hi);
};

/** draw one figure: returns the `d` strings (screen px, already mirrored if flip) */
export const figurePaths = (o: FigOpts): string[] => {
	const {pose: p, look, h} = o, T = o.T ?? 0, b = look.build ?? 1, sg = o.flip ? -1 : 1;
	const X = (q: P) => `${f1(o.x + sg * q[0] * h)},${f1(o.ground - q[1] * h)}`;
	const out: string[] = [];
	/** smooth closed outline through midpoints (dense point rings: limbs) */
	const smooth = (ring: P[]) => { let d = `M${X(mix(ring[0], ring[1], 0.5))}`; for (let i = 1; i <= ring.length; i++) { const q = ring[i % ring.length], r = ring[(i + 1) % ring.length]; d += ` Q${X(q)} ${X(mix(q, r, 0.5))}`; } return d + ' Z'; };
	/** polygon with rounded corners of radius r (body units) */
	const rounded = (pts: P[], r: number) => {
		const n = pts.length; let d = '';
		for (let i = 0; i < n; i++) { const a = pts[(i + n - 1) % n], c = pts[i], e = pts[(i + 1) % n], la = len(sub(a, c)), le = len(sub(e, c)), k1 = Math.min(r, la / 2), k2 = Math.min(r, le / 2);
			const p1 = add(c, mul(nrm(sub(a, c)), k1)), p2 = add(c, mul(nrm(sub(e, c)), k2)); d += `${i ? ' L' : 'M'}${X(p1)} Q${X(c)} ${X(p2)}`; }
		return d + ' Z';
	};
	/** a limb: points with per-point half-widths; w1 on the (dy,-dx) side (back of a hanging limb, front of the torso) */
	const chain = (pts: P[], w1: number[], w2: number[]) => {
		const L: P[] = [], R: P[] = [];
		for (let i = 0; i < pts.length; i++) { const a = pts[Math.max(0, i - 1)], c = pts[Math.min(pts.length - 1, i + 1)], n = nrm([c[1] - a[1], -(c[0] - a[0])]); L.push(add(pts[i], mul(n, w1[i]))); R.push(sub(pts[i], mul(n, w2[i]))); }
		return smooth([...L, ...R.reverse()]);
	};
	/** map every "x,y" pair of a local path string (absolute M/L/Q/C/Z only) */
	const tx = (d: string, m: (q: P) => P) => d.replace(/(-?\d*\.?\d+),(-?\d*\.?\d+)/g, (_s, a: string, c: string) => X(m([+a, +c])));
	const ell = (cx: number, cy: number, rx: number, ry: number) => { const k = 0.5523, kx = rx * k, ky = ry * k;
		return `M${cx + rx},${cy} C${cx + rx},${cy + ky} ${cx + kx},${cy + ry} ${cx},${cy + ry} C${cx - kx},${cy + ry} ${cx - rx},${cy + ky} ${cx - rx},${cy} C${cx - rx},${cy - ky} ${cx - kx},${cy - ry} ${cx},${cy - ry} C${cx + kx},${cy - ry} ${cx + rx},${cy - ky} ${cx + rx},${cy} Z`; };

	const H = p.Hips, sp = p.Spine1, u = nrm(sub(sp, H)), f: P = [u[1], -u[0]];   // torso up / front
	const robeLike = look.dress === 'robe' || look.dress === 'gown';
	const trousers = look.dress !== 'tunic';
	// ---- legs (never drawn under a long robe: the robe hull covers the skeleton, only the shoes show)
	if (!robeLike) for (const s of ['R', 'L']) {
		const hip = p[`${s}Up`], kn = p[`${s}Knee`], an = p[`${s}Ank`], ext = add(hip, mul(nrm(sub(hip, kn)), 0.05));
		const pts = [ext, ...along(hip, kn, 6), ...along(kn, an, 6).slice(1)], n = pts.length - 1;
		const w1 = prof(n, (t) => (trousers ? (t < 0.5 ? lerp(0.064, 0.04, t * 2) : lerp(0.04, 0.034, (t - 0.5) * 2)) : (t < 0.5 ? lerp(0.066, 0.034, (t * 2) ** 0.8) : 0.032 + 0.012 * Math.sin(Math.PI * Math.min(1, (t - 0.5) * 2.6)) - 0.01 * Math.max(0, (t - 0.85) / 0.15))) * b);
		const w2 = prof(n, (t) => (trousers ? lerp(0.052, 0.032, t) : t < 0.5 ? lerp(0.056, 0.032, t * 2) : lerp(0.032, 0.024, (t - 0.5) * 2)) * b);
		out.push(chain(pts, w1, w2));
	}
	for (const s of ['R', 'L']) out.push(tx(SHOE, shoeMap(p[`${s}Ank`], p[`${s}Toe`])));
	// ---- pelvis + torso (kit shapes)
	{ const pm: P = add(mix(p.LUp, p.RUp, 0.5), [0, -0.012]); out.push(chain([add(H, mul(u, 0.02)), H, pm], [0.07 * b, 0.076 * b, 0.066 * b], [0.062 * b, 0.064 * b, 0.058 * b])); }
	{ const tp = [...along(H, sp, 5), ...along(sp, p.Neck1, 3).slice(1)], tn = tp.length - 1;
		out.push(chain([sub(H, mul(u, 0.03)), ...tp], [0.074, ...prof(tn, (t) => (t < 0.35 ? lerp(0.074, 0.06, t / 0.35) : t < 0.75 ? lerp(0.06, 0.07, (t - 0.35) / 0.4) : lerp(0.07, 0.026, (t - 0.75) / 0.25)))].map((v) => v * b),
			[0.062, ...prof(tn, (t) => (t < 0.4 ? lerp(0.064, 0.058, t / 0.4) : t < 0.78 ? lerp(0.058, 0.072, (t - 0.4) / 0.38) : lerp(0.072, 0.024, (t - 0.78) / 0.22)))].map((v) => v * b))); }
	// ---- arms + hands
	const cloth = look.dress !== 'robe' || look.sleeves !== 'wide' ? 1.08 : 1;
	for (const s of ['R', 'L']) {
		const sh = p[`${s}Sh`], el = p[`${s}Elb`], ha = p[`${s}Hand`], tip = p[`${s}Tip`];
		const pts = [...along(sh, el, 5), ...along(el, ha, 5).slice(1)], n = pts.length - 1;
		out.push(chain(pts, prof(n, (t) => (t < 0.5 ? lerp(0.036, 0.025, t * 2) : lerp(0.025, 0.019, (t - 0.5) * 2)) * b * cloth), prof(n, (t) => (t < 0.15 ? 0.04 : t < 0.5 ? lerp(0.036, 0.023, (t - 0.15) / 0.35) : lerp(0.023, 0.018, (t - 0.5) * 2)) * b * cloth)));
		const hd = nrm(sub(tip, ha)), q = (k: number): P => add(ha, mul(hd, k));
		out.push(chain([q(-0.004), q(0.02), q(0.046), q(BL.hand)], [0.015, 0.02, 0.017, 0.005], [0.015, 0.018, 0.015, 0.005]));
		if (look.sleeves !== 'wide' && look.dress !== 'zip') {   // a cuff
			const fd = nrm(sub(ha, el)), c = add(ha, mul(fd, -0.012)), nn: P = [fd[1], -fd[0]];
			out.push(rounded([add(c, mul(nn, 0.027)), add(add(c, mul(fd, -0.04)), mul(nn, 0.026)), add(add(c, mul(fd, -0.04)), mul(nn, -0.026)), add(c, mul(nn, -0.027))], 0.006));
		}
	}
	// ---- head (profile: brow, nose, chin; no face)
	const up = nrm(sub(p.Top, p.Neck1)), fw: P = [up[1], -up[0]], hc = mix(p.Head, p.Top, 0.45), S = 0.93;
	const HL = (q: P): P => add(hc, add(mul(fw, q[0] * S), mul(up, -q[1] * S)));
	const hp = (d: string) => out.push(tx(d, HL));
	hp('M-0.02,0.07 C-0.066,0.05 -0.072,-0.045 -0.018,-0.066 C0.028,-0.08 0.058,-0.046 0.055,-0.014 L0.058,0.002 L0.074,0.024 L0.058,0.03 L0.06,0.041 L0.055,0.047 C0.057,0.064 0.041,0.072 0.025,0.068 L0.022,0.09 L-0.025,0.095 Z');
	const sw = Math.sin(T * 3.1) * 0.01, sw2 = Math.sin(T * 3.7 + 1) * 0.012;
	const strap = (x0: number, x1: number, y: number, t0: number, t1: number) => { const dx = Math.sign(x1 - x0), r = t1 * 0.45, e = x1 - dx * r;   // a flat straight strap, a touch wider at the end, softly squared tip
		return `M${x0},${y - t0 / 2} L${e},${y - t1 / 2} Q${x1},${y - t1 / 2} ${x1},${y - t1 / 2 + r} L${x1},${y + t1 / 2 - r} Q${x1},${y + t1 / 2} ${e},${y + t1 / 2} L${x0},${y + t0 / 2} Z`; };
	switch (look.head) {
		case 'zhanjiao':   // stiff black cap, raised back, long straight wings
			hp('M-0.07,0.012 L-0.07,-0.07 Q-0.068,-0.096 -0.042,-0.098 L0.032,-0.096 Q0.058,-0.094 0.06,-0.068 L0.06,-0.022 Q0.0,-0.03 -0.07,0.012 Z');
			hp('M-0.07,-0.07 Q-0.072,-0.134 -0.032,-0.136 Q0.004,-0.136 0.008,-0.09 Z');
			hp(strap(-0.02, -0.29, -0.084, 0.016, 0.022)); hp(strap(-0.02, 0.25, -0.084, 0.016, 0.022)); break;
		case 'futou':      // soft 幞头: round crown, knot bump, two soft tails
			hp('M-0.068,0.004 Q-0.068,-0.092 0.0,-0.092 Q0.057,-0.088 0.058,-0.024 Q0.0,-0.034 -0.068,0.004 Z');
			hp('M-0.04,-0.082 Q-0.03,-0.142 0.016,-0.13 Q0.036,-0.112 0.026,-0.084 Z');
			hp(`M-0.062,-0.046 Q-0.1,${-0.01 + sw} ${-0.094 + sw2},0.124 L${-0.078 + sw2},0.126 Q-0.08,0.0 -0.05,-0.03 Z`); break;
		case 'scarf':      // wrapped cloth over skull and nape, knot and short ends at the back
			hp('M0.058,-0.018 Q0.054,-0.094 -0.006,-0.096 Q-0.074,-0.094 -0.082,-0.02 Q-0.086,0.05 -0.064,0.104 L-0.02,0.1 Q-0.028,0.04 -0.026,0.0 Q0.0,-0.036 0.058,-0.018 Z');
			hp('M-0.07,-0.07 Q-0.112,-0.09 -0.122,-0.056 Q-0.112,-0.028 -0.072,-0.038 Z');
			hp(`M-0.1,-0.05 Q-0.13,${-0.01 + sw} ${-0.134 + sw2},0.036 L${-0.114 + sw2},0.03 Q-0.108,-0.01 -0.08,-0.04 Z`); break;
		case 'dongpo':     // tall cap: high back wall, stepped lower front
			hp('M-0.07,0.012 L-0.07,-0.136 Q-0.07,-0.158 -0.046,-0.158 L-0.006,-0.158 Q0.01,-0.158 0.01,-0.142 L0.01,-0.124 L0.042,-0.124 Q0.06,-0.124 0.06,-0.106 L0.06,-0.022 Q0.0,-0.03 -0.07,0.012 Z'); break;
		case 'clothcap':   // soft rounded cap, slight peak at the back, short flap over the nape
			hp('M-0.074,0.014 Q-0.084,-0.06 -0.066,-0.098 Q-0.048,-0.126 -0.01,-0.124 Q0.034,-0.12 0.052,-0.098 Q0.064,-0.076 0.062,-0.022 Q0.0,-0.032 -0.074,0.014 Z');
			hp('M-0.066,-0.088 Q-0.1,-0.104 -0.096,-0.128 Q-0.068,-0.136 -0.04,-0.116 Z'); break;   // soft cloth gathered into a fold at the back
		case 'boli': {     // 钹笠: dome crown + flat brim with ROUND ends (a stadium, never a point)
			hp('M-0.058,-0.044 Q-0.06,-0.122 0.0,-0.124 Q0.058,-0.122 0.058,-0.044 Z');
			hp(ell(0, -0.13, 0.014, 0.012));
			const R = 0.0115, X0 = -0.138, X1 = 0.138, y = -0.046;   // brim: slight arch, semicircular ends
			hp(`M${X0 + R},${y - R} Q0,${y - R - 0.016} ${X1 - R},${y - R} C${X1 - R + 0.0064},${y - R} ${X1},${y - 0.0064} ${X1},${y} C${X1},${y + 0.0064} ${X1 - R + 0.0064},${y + R} ${X1 - R},${y + R} Q0,${y + R - 0.014} ${X0 + R},${y + R} C${X0 + R - 0.0064},${y + R} ${X0},${y + 0.0064} ${X0},${y} C${X0},${y - 0.0064} ${X0 + R - 0.0064},${y - R} ${X0 + R},${y - R} Z`); break; }
		case 'ruanjin':    // soft cap leaning back to a rounded peak, two short ribbons
			hp('M-0.072,0.012 Q-0.08,-0.07 -0.07,-0.112 Q-0.064,-0.152 -0.032,-0.15 Q0.022,-0.138 0.048,-0.096 Q0.062,-0.066 0.06,-0.022 Q0.0,-0.032 -0.072,0.012 Z');
			hp(`M-0.064,-0.04 Q-0.098,${0.01 + sw} ${-0.094 + sw2},0.074 L${-0.078 + sw2},0.074 Q-0.08,0.016 -0.05,-0.03 Z`); break;
		case 'fangjin':    // tall flat-topped square cap, wider at the top
			hp('M-0.07,0.01 L-0.084,-0.152 Q-0.085,-0.163 -0.073,-0.163 L0.062,-0.163 Q0.074,-0.163 0.073,-0.152 L0.06,-0.022 Q0.0,-0.03 -0.07,0.01 Z'); break;
		case 'wusha':      // 乌纱帽: low front, raised round back, oval wings on short stalks
			hp('M-0.07,0.012 L-0.07,-0.066 Q-0.068,-0.09 -0.042,-0.092 L0.032,-0.09 Q0.058,-0.088 0.06,-0.064 L0.06,-0.022 Q0.0,-0.03 -0.07,0.012 Z');
			hp('M-0.07,-0.068 Q-0.074,-0.132 -0.03,-0.134 Q0.008,-0.132 0.01,-0.086 Z');
			hp('M-0.03,-0.097 L-0.13,-0.096 L-0.13,-0.082 L-0.03,-0.081 Z'); hp(ell(-0.172, -0.089, 0.054, 0.024));
			hp('M-0.03,-0.097 L0.08,-0.096 L0.08,-0.082 L-0.03,-0.081 Z'); hp(ell(0.122, -0.089, 0.054, 0.024)); break;
		case 'neishi':     // eunuch: tall rounded cap on a band
			hp('M-0.07,0.008 L-0.072,-0.13 Q-0.072,-0.196 -0.006,-0.198 Q0.062,-0.196 0.062,-0.13 L0.06,-0.022 Q0.0,-0.03 -0.07,0.008 Z');
			hp('M-0.078,0.014 Q-0.08,-0.004 -0.077,-0.016 L0.066,-0.044 Q0.07,-0.032 0.068,-0.018 Z'); break;
		case 'qingcap':    // 暖帽: flared upturned brim, round crown, knob on a short stem
			hp('M-0.076,-0.008 L-0.094,-0.07 Q-0.094,-0.082 -0.082,-0.082 L0.074,-0.084 Q0.086,-0.084 0.084,-0.072 L0.066,-0.026 Q0.0,-0.034 -0.076,-0.008 Z');
			hp('M-0.07,-0.078 Q-0.064,-0.124 -0.004,-0.13 Q0.058,-0.124 0.068,-0.08 Z');
			hp('M-0.005,-0.126 L-0.004,-0.146 L0.004,-0.146 L0.005,-0.126 Z'); hp(ell(0, -0.157, 0.015, 0.015)); break;
		case 'guapi':      // skullcap standing a little off the skull, narrow rim, knob on top
			hp('M-0.072,-0.002 Q-0.08,-0.092 -0.004,-0.098 Q0.06,-0.094 0.062,-0.032 L0.062,-0.022 Q0.0,-0.034 -0.072,-0.002 Z');
			hp('M-0.076,0.004 L-0.076,-0.014 L0.065,-0.04 L0.065,-0.024 Z'); hp(ell(-0.002, -0.106, 0.013, 0.012)); break;
		case 'peaked':     // band, crown flaring up to a raised front (saddle), short visor
			hp('M-0.068,-0.006 L-0.068,-0.058 L0.06,-0.066 L0.06,-0.026 Q0.0,-0.03 -0.068,-0.006 Z');
			hp('M-0.068,-0.054 Q-0.078,-0.076 -0.082,-0.094 Q-0.08,-0.106 -0.062,-0.106 L0.03,-0.111 Q0.062,-0.113 0.063,-0.094 Q0.063,-0.078 0.058,-0.062 Z');
			hp('M0.05,-0.034 Q0.08,-0.036 0.096,-0.024 Q0.099,-0.015 0.088,-0.015 Q0.07,-0.019 0.05,-0.018 Z'); break;
		case 'cadre':      // soft cap, flattish crown, short visor
			hp('M-0.072,0.0 Q-0.08,-0.064 -0.062,-0.1 Q0.0,-0.118 0.052,-0.104 Q0.07,-0.084 0.064,-0.032 Q0.0,-0.034 -0.072,0.0 Z');
			hp('M0.054,-0.038 Q0.088,-0.038 0.104,-0.026 Q0.104,-0.016 0.09,-0.018 Q0.072,-0.022 0.054,-0.02 Z'); break;
		case 'short':
			hp('M-0.068,0.014 Q-0.07,-0.074 0.01,-0.074 Q0.056,-0.069 0.06,-0.034 Q0.01,-0.048 -0.012,0.002 Z'); break;
		case 'modern':     // short sides, volume swept up at the front
			hp('M-0.068,0.012 Q-0.074,-0.074 -0.026,-0.09 Q0.03,-0.104 0.062,-0.078 Q0.074,-0.06 0.064,-0.042 Q0.036,-0.054 0.006,-0.048 Q-0.014,-0.02 -0.014,0.004 Z'); break;
		case 'ponytail':
			hp('M-0.068,0.016 Q-0.072,-0.078 0.006,-0.08 Q0.058,-0.074 0.062,-0.036 Q0.02,-0.05 -0.004,-0.04 Q-0.02,-0.01 -0.02,0.014 Z');
			hp(`M-0.064,-0.056 Q-0.112,-0.06 -0.118,${-0.01 + sw} Q${-0.12 + sw2},0.06 ${-0.098 + sw2},0.1 Q-0.1,0.03 -0.064,-0.022 Z`); break;
		case 'bun':
			hp('M-0.068,0.01 Q-0.072,-0.074 0.0,-0.074 Q0.05,-0.07 0.056,-0.032 Q0.0,-0.05 -0.02,0.0 Z'); hp(ell(-0.03, -0.088, 0.03, 0.026)); break;
	}
	if (look.beard) hp(look.beard === 'long' ? 'M0.036,0.036 Q0.064,0.11 0.018,0.17 Q-0.018,0.09 -0.027,0.036 Z' : look.beard === 'full' ? 'M0.056,0.032 Q0.068,0.09 0.027,0.104 Q-0.027,0.08 -0.04,0.018 Z' : look.beard === 'moustache' ? 'M0.056,0.027 Q0.072,0.04 0.044,0.042 Z' : 'M0.052,0.036 Q0.058,0.077 0.022,0.08 Q-0.018,0.064 -0.032,0.027 Z');

	// ---- clothing, built on the skeleton
	const W = add(H, mul(u, 0.07)), tf = (q: P, a: number, c: number): P => add(q, add(mul(f, a), mul(u, c)));   // torso frame offsets
	const legs = (['L', 'R'] as const).map((s) => ({K: p[`${s}Knee`], A: p[`${s}Ank`], U: p[`${s}Up`]}));
	if (robeLike) {   // long robe over the leg skeleton: waist→knees hull + knees→hem hull; a shin lying on the floor (kneeling) gets its own piece
		const g = look.dress === 'gown', fl = g ? 0 : look.surcoat ? 0.004 : 0.016, mf = g ? 0.034 : 0.044, mb = g ? 0.046 : 0.056;
		// standing / walking (both thighs near vertical): one A-line hull. Seated, kneeling, squatting: waist→knees hull, then the
		// robe hangs from each horizontal thigh to the floor like a curtain; a shin lying on the floor gets its own low piece.
		const upper: P[] = [tf(sp, -0.068 * b, -0.02), tf(sp, 0.064 * b, -0.02), tf(W, -0.078 * b, 0), tf(W, 0.07 * b, 0), tf(H, -0.088 * b, 0), tf(H, 0.074 * b, 0), tf(H, -0.09 * b, -0.06), tf(H, 0.072 * b, -0.06)], lower: P[] = [], hems: P[] = [], lying: P[][] = [];
		const angDown = (a: P, c: P) => Math.atan2(Math.abs(c[0] - a[0]), a[1] - c[1]) / D;
		const split = legs.some(({U, K, A}) => angDown(U, K) > 50 || angDown(K, A) > 55);
		for (const {U, K, A} of legs) {
			const hy = Math.max(A[1] - (g ? 0.0 : 0.01), 0.012);
			const kp: P[] = [add(K, [-0.064 * b, 0]), add(K, [0.058 * b, 0]), add(K, [0, 0.05])], fp: P[] = [add(A, [-mb, 0.06]), add(A, [mf, 0.06]), [A[0] - mb - fl, hy], [A[0] + mf + fl, hy]];
			upper.push(...kp);
			if (angDown(K, A) > 55) { lying.push([...kp, add(K, [0, -0.03]), ...fp]); continue; }
			lower.push(...kp, ...fp); hems.push(A);
			if (split && angDown(U, K) > 50) { const c = mix(U, K, 0.42); lower.push(add(c, [0, -0.04]), [c[0], hy]); }
		}
		if (hems.length === 2) lower.push([(hems[0][0] + hems[1][0]) / 2, Math.max(0.008, Math.min(hems[0][1], hems[1][1]) - 0.022)]);
		if (split) { out.push(rounded(hull(upper), 0.03)); if (lower.length) out.push(rounded(hull(lower), 0.03)); }
		else {   // the cloth falls straight down from its widest points (seat, belly, a forward knee) to the hem
			const all = [...upper, ...lower], hy = Math.max(0.012, Math.min(legs[0].A[1], legs[1].A[1]) - 0.012);
			const xs = upper.filter((q) => q[1] > hy + 0.05).map((q) => q[0]);
			out.push(rounded(hull([...all, [Math.min(...xs) - 0.006, hy], [Math.max(...xs) + 0.006, hy]]), 0.03));
		}
		for (const l of lying) out.push(rounded(hull(l), 0.025));
		if (look.surcoat) {   // 清 补褂: hangs from the shoulders to just below the knee, a step wider than the robe
			const s2: P[] = [tf(sp, -0.084 * b, 0), tf(sp, 0.086 * b, 0), tf(H, -0.1 * b, 0), tf(H, 0.092 * b, 0)];
			for (const {K, A} of legs) { const k = mix(K, A, 0.12), kx = H[0] + (k[0] - H[0]) * 0.55; s2.push([kx - 0.088, k[1]], [kx + 0.084, k[1]]); }
			out.push(rounded(hull(s2), 0.02));
		}
	}
	const skirt = (hemAt: number, mf: number, mb: number, flare: number, top: P[]) => {   // coat skirts: hull from the torso down to a hem between knee and ankle
		const pts: P[] = [...top];
		for (const {K, A} of legs) { const hm = mix(K, A, hemAt); pts.push(add(K, [-mb, 0]), add(K, [mf, 0]), add(K, [0, 0.05]), add(hm, [-mb - flare, 0]), add(hm, [mf + flare, 0])); }
		out.push(rounded(hull(pts), 0.022));
	};
	if (look.dress === 'tunic') skirt(0.2, 0.062 * b, 0.066 * b, 0.012, [tf(W, -0.076 * b, 0), tf(W, 0.07 * b, 0), tf(H, -0.088 * b, 0), tf(H, 0.076 * b, 0)]);
	if (look.dress === 'greatcoat') skirt(0.5, 0.07 * b, 0.074 * b, 0.022, [tf(W, -0.072 * b, -0.01), tf(W, 0.066 * b, -0.01), tf(H, -0.09 * b, 0), tf(H, 0.08 * b, 0)]);
	if (look.dress === 'smock') skirt(0.1, 0.068 * b, 0.072 * b, 0.006, [tf(sp, -0.074 * b, 0.02), tf(sp, 0.078 * b, 0.02), tf(W, -0.082 * b, 0), tf(W, 0.08 * b, 0), tf(H, -0.09 * b, 0), tf(H, 0.084 * b, 0)]);
	if (look.dress === 'jacket') out.push(rounded(hull([tf(sp, -0.076 * b, 0.02), tf(sp, 0.08 * b, 0.02), tf(H, -0.086 * b, 0), tf(H, 0.084 * b, 0), tf(H, -0.086 * b, -0.07), tf(H, 0.084 * b, -0.07)]), 0.014));
	if (look.dress === 'zip') out.push(rounded(hull([tf(sp, -0.08 * b, 0.0), tf(sp, 0.084 * b, 0.0), tf(H, -0.084 * b, 0.02), tf(H, 0.084 * b, 0.02), tf(H, -0.08 * b, -0.04), tf(H, 0.08 * b, -0.04)]), 0.03));
	if (look.dress === 'greatcoat') out.push(rounded([tf(p.Neck1, -0.05, -0.03), tf(p.Neck1, 0.032, -0.04), tf(p.Neck1, 0.04, 0.012), tf(p.Neck1, -0.042, 0.03)], 0.012));   // broad turned-up collar
	// ---- wide sleeves: per arm segment, a bag that hangs by gravity below the arm
	if (look.sleeves === 'wide') for (const s of ['R', 'L']) {
		const sh = p[`${s}Sh`], el = p[`${s}Elb`], wr = p[`${s}Hand`], dn: P = [0, -1];
		const seg = (a: P, c: P, wa: number, wc: number, sag: number, cuff: boolean) => {
			const d = nrm(sub(c, a)), n: P = [d[1], -d[0]], hz = Math.abs(d[0]), sg2 = sag * hz;
			const pts: P[] = [add(a, mul(n, wa)), sub(a, mul(n, wa)), add(c, mul(n, wc)), sub(c, mul(n, wc)), add(mix(a, c, 0.6), mul(dn, wc + sg2)), add(mix(a, c, 0.25), mul(dn, wa + sg2 * 0.6))];
			if (cuff) pts.push(add(add(c, mul(d, -0.01)), mul(dn, wc + sg2 * 0.75)));
			for (const k of [0, 1, 2, 3]) pts.push(add(a, rot([wa, 0], (k * Math.PI) / 2)));
			out.push(rounded(hull(pts), 0.02));
		};
		seg(sh, el, 0.044 * b, 0.046 * b, 0.05, false);
		seg(el, add(wr, mul(nrm(sub(wr, el)), -0.006)), 0.046 * b, 0.05 * b, 0.13, true);
	}
	// ---- belt, packs
	if (look.pack === 'bundle') { const c = tf(sp, -0.12, 0.0), e = (a: number, r: number): P => tf(c, Math.cos(a) * 0.072, Math.sin(a) * r);
		out.push(rounded(Array.from({length: 12}, (_, i) => e((i / 12) * Math.PI * 2, 0.095)), 0.03));
		out.push(rounded([tf(sp, -0.06, 0.07), tf(sp, -0.13, 0.11), tf(sp, -0.15, 0.09), tf(sp, -0.07, 0.04)], 0.01)); }
	if (look.pack === 'backpack') out.push(rounded([tf(sp, -0.06, 0.06), tf(sp, -0.15, 0.05), tf(sp, -0.16, -0.12), tf(sp, -0.06, -0.12)], 0.03));
	return out;
};

/** draw one figure as SVG markup (one <path> per part, all one fill colour) */
export const figureSVG = (o: FigOpts): string => { const c = o.col ?? '#15100C'; return `<g>${figurePaths(o).map((d) => `<path d="${d}" fill="${c}"/>`).join('')}</g>`; };
/** the same figure with a thin rim of light on its outer contour only (a lighter copy offset toward the light) */
export const rimmedSVG = (o: FigOpts & {rim?: string; rimOp?: number; rimDx?: number; rimDy?: number}): string => {
	const k = Math.max(1, o.h / 450), dx = (o.rimDx ?? -2.2) * k, dy = (o.rimDy ?? -1.6) * k;
	return `<g transform="translate(${f1(dx)},${f1(dy)})" opacity="${o.rimOp ?? 0.35}">${figureSVG({...o, col: o.rim ?? '#FFD58F'})}</g>${figureSVG(o)}`;
};

/* ---------------- pose library ---------------- */
const STAND: FK = {hip: 0.655, lean: 3, lt: 2, lk: 2, rt: -3, rk: 3, la: -3, le: 10, ra: 4, re: 14};
/** chest frame of a pose: shoulder, torso up, torso front */
const frame = (p: Pose) => { const u = nrm(sub(p.Spine1, p.Hips)); return {sh: p.LSh, u, f: [u[1], -u[0]] as P}; };
/** a palm target at fraction k of full reach from the shoulder, at height y (clamped to what the arm can reach) */
const atReach = (p: Pose, side: Side, y: number, k = 0.92): P => { const sh = p[`${side}Sh`], r = ARM_REACH * k, dy = clamp(y - sh[1], -r, r); return [sh[0] + Math.sqrt(Math.max(0, r * r - dy * dy)), sh[1] + dy]; };

/** both hands on two rollers in front of the chest (near roller with R, far roller with L), e.g. a short open section or a roll's two ends */
export const carryScroll = (o: {near?: P; far?: P; base?: Pose} = {}): Pose => {
	const b = o.base ?? fkPose({...STAND, lean: 4, neck: 6}), sh = b.LSh;
	return reach(reach(b, 'R', o.near ?? [sh[0] + 0.13, sh[1] - 0.17]), 'L', o.far ?? atReach(b, 'L', sh[1] - 0.15, 0.93));
};
/** one hand on a roller at arm's length (the open scroll held between two people); both = the other hand on the same roller, lower */
export const holdOpen = (o: {at?: P; both?: boolean; base?: Pose} = {}): Pose => {
	const b = o.base ?? fkPose({...STAND, lean: 5, neck: 4, ra: 8, re: 18}), at = o.at ?? atReach(b, 'L', b.LSh[1] - 0.12, 0.93);
	let q = reach(b, 'L', at);
	if (o.both) q = reach(q, 'R', [at[0], at[1] - 0.075]);
	return q;
};
/** arms extended to hand something over: hands at a (R) and b (L), e.g. along a closed roll */
export const handOver = (o: {a?: P; b?: P; base?: Pose} = {}): Pose => {
	const base = o.base ?? fkPose({hip: 0.65, lean: 9, neck: 6, lt: 14, lk: 6, rt: -10, rk: 4, la: 30, le: 20, ra: 30, re: 20}), sh = base.LSh;
	const B = o.b ?? atReach(base, 'L', sh[1] - 0.1, 0.95), A = o.a ?? [B[0] - 0.07, B[1]];
	return reach(reach(base, 'R', A), 'L', B);
};
/** a bow with the hands clasped in front of the chest (作揖); deg = forward lean */
export const bow = (deg = 34): Pose => {
	const b = fkPose({hip: 0.65, hipX: -0.002 * deg, lean: deg, neck: 10, lt: -2 - deg * 0.05, lk: 0, rt: -4 - deg * 0.05, rk: 0, la: 10, le: 40, ra: 10, re: 40}), {u, f} = frame(b);
	const c = add(b.Spine1, add(mul(f, 0.2), mul(u, 0.03)));
	return reach(reach(b, 'R', c, {dir: Math.atan2(u[1], u[0]) / D}), 'L', add(c, mul(u, 0.022)), {dir: Math.atan2(u[1], u[0]) / D});
};
/** one-knee kneel; hands on the raised knee, or both on a point `at` (presenting a roll) */
export const kneel = (o: {at?: P} = {}): Pose => {
	const b = fkPose({hip: 0.36, lean: 8, neck: 8, lt: 86, lk: 88, rt: -6, rk: 84, rf: 172, la: 30, le: 40, ra: 30, re: 40});
	if (o.at) return reach(reach(b, 'R', o.at), 'L', [o.at[0] + 0.06, o.at[1] + 0.005]);
	const k = b.LKnee;
	return reach(reach(b, 'R', [k[0] - 0.01, k[1] + 0.047], {dir: -8}), 'L', [k[0] - 0.075, k[1] + 0.05], {dir: -4});
};
const BEND = (lean: number): FK => ({hip: 0.645, hipX: -0.1 - Math.max(0, lean - 55) * 0.0015, lean, neck: -6, lt: 10, lk: 8, rt: 6, rk: 6, la: 20, le: 30, ra: 10, re: 20});
/**
 * bent over a table whose surface is at height `top`, the far (L) hand flat on it at palm x `flatX` (auto: well within reach).
 * other: 'flat' = the near hand flat too, a little nearer the body; a point = the near palm there; 'hang' = left alone.
 */
export const bendTable = (o: {top?: number; flatX?: number; other?: P | 'flat' | 'hang'; lean?: number} = {}): Pose => {
	const top = o.top ?? 0.47, y = top + 0.017, r = (BL.upper + BL.fore) * 0.92;
	let lean = o.lean ?? 55, b = fkPose(BEND(lean));
	while (b.LSh[1] - y > r * 0.96 && lean < 80) b = fkPose(BEND((lean += 3)));
	const sh = b.LSh, dy = sh[1] - y, x = o.flatX ?? sh[0] + Math.sqrt(Math.max(0, r * r - dy * dy)) + BL.grip;
	let q = reach(b, 'L', [x, y], {dir: 0});
	const other = o.other ?? 'flat';
	if (other === 'flat') q = reach(q, 'R', [x - 0.075, y], {dir: -4});
	else if (other !== 'hang') q = reach(q, 'R', other);
	return q;
};
/** the load of carryArmful(): centre and radius in body units, relative to the shoulder */
const ARMFUL: P = [0.13, -0.17], ARMFUL_R = 0.075;
/** carrying an armful of rolled scrolls (or a cloth bundle) against the chest: near forearm under the load, far hand over its front */
export const carryArmful = (base?: Pose): Pose => {
	const b = base ?? fkPose({hip: 0.655, lean: -3, neck: 6, lt: 3, lk: 3, rt: -4, rk: 4, la: 0, le: 90, ra: 0, re: 90}), c = add(b.LSh, ARMFUL);
	return reach(reach(b, 'R', [c[0] + 0.03, c[1] - ARMFUL_R - 0.014], {dir: 12}), 'L', [c[0] + ARMFUL_R + 0.008, c[1] + 0.012], {dir: -78});
};
/** centre and radius (body units) of the load held by carryArmful() */
export const armfulAt = (p: Pose): {c: P; r: number} => ({c: add(p.LSh, ARMFUL), r: ARMFUL_R});
/** squatting to pick something up from the floor: the near (R) palm at `at` (default: on the floor in front of the knees) */
export const crouch = (o: {at?: P} = {}): Pose => {
	const b = fkPose({hip: 0.22, hipX: -0.08, lean: 52, neck: 6, lt: 110, lk: 152, rt: 98, rk: 142, la: 20, le: 20, ra: 20, re: 20});
	const sh = b.RSh, y = Math.max(o.at?.[1] ?? 0.035, sh[1] - ARM_REACH * 0.97), at = o.at ? [o.at[0], Math.max(o.at[1], y)] as P : atReach(b, 'R', y, 0.97);
	const k = b.LKnee;
	return reach(reach(b, 'R', at), 'L', [k[0] - 0.03, k[1] + 0.045], {dir: -6});
};
/** a roll clamped under the R upper arm (against the ribs), its front end in the R hand; underArmRoll() gives the roll's ends */
export const underArm = (base?: Pose): Pose => {
	const b = base ?? fkPose(STAND), sh = b.RSh;
	return reach(b, 'R', [sh[0] + 0.17, sh[1] - 0.15], {dir: 12});
};
/** the roll's two ends (body units) for a pose made with underArm(): through the palm and under the armpit, sticking out behind the back */
export const underArmRoll = (p: Pose, side: Side = 'R', length = 0.29): [P, P] => {
	const g = gripOf(p, side), pit = add(p[`${side}Sh`], [0, -0.11]), d = nrm(sub(pit, g));
	return [add(g, mul(d, length - 0.025)), add(g, mul(d, -0.025))];
};

export const POSES = {
	stand: fkPose(STAND),
	lookUp: fkPose({hip: 0.655, lean: -4, neck: -28, lt: 2, lk: 2, rt: -4, rk: 3, la: -4, le: 8, ra: 3, re: 10}),
	sit: fkPose({hip: 0.37, lean: 6, lt: 88, lk: 92, rt: 84, rk: 86, la: 10, le: 40, ra: 6, re: 46}),
	walk: gaitPose('08_04', 0.1),
	carryScroll: carryScroll(),
	holdOpen: holdOpen(),
	handOver: handOver(),
	bow: bow(),
	kneel: kneel(),
	bendTable: bendTable(),
	carryArmful: carryArmful(),
	crouch: crouch(),
	underArm: underArm(),
};
export type PoseName = keyof typeof POSES;

/** the lowest shoe point of a foot, in body units (y up): for sole contact checks and slope placement */
export const soleOf = (p: Pose, side: Side): P => { const m = shoeMap(p[`${side}Ank`], p[`${side}Toe`]); let best: P = [0, Infinity]; for (const q of SHOE_PTS) { const v = m(q); if (v[1] < best[1]) best = v; } return best; };
