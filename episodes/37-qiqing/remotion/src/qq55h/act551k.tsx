import React from 'react';
import {KAI} from '../qq50/kit50';
import {lookAt, Cam, V3, proj} from './zun55h';
import {sm, f1, rnd, P, Glow, Haze, Plume, pile, tube} from './kf55h';
import {Body, Sil, Sk} from './rig55h';
/* ep55 何尊 v2 · act 1 (builder 1) — the SHARED KIT. Re-exported by act551.tsx; import from either.
   - Glyphs55: the gold bronze-script glyphs 宅 兹 中 或 (and 國), the one style for B (smoke), H (into the mould) and act 3.
   - Cowrie / CowrieString: the cowrie shells of the 30 朋 reward (F, W2 …).
   - The 1965 scrap yard (card 1, and builder 3's reverse angle S): Yard1965, PlatformScale1965, Worker1965, Tag30w, and the
     card-1 action as functions of local time τ (s since the card starts; the 尊 lands on the deck at τ = 1.45):
     worker1965(τ) → the worker's skeleton + where the 尊 is relative to its rest on the deck + where the tag is.
   - small helpers: zunCam (a camera that puts the 尊's base centre at a screen point at k px per cm), ik2, armFK, poseFK. */
const W = 1920, H = 1080;
export const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const seg = (t: number, a: number, b: number) => cl((t - a) / (b - a));
export const ease = (u: number) => u * u * (3 - 2 * u);
export const eio = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const lerpP = (a: P, b: P, u: number): P => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
export const BEAT = 0.56604;
export const BAR1 = (j: number) => 1.4498 + 2.26415 * j;
/** beat n (film beat index from the first bar line) */
export const BT = (n: number) => 1.4498 + BEAT * n;

/* ============================== a camera for the 尊 at a screen point ============================== */
/** a look-at camera at azimuth az / elevation el (deg), D cm away, so that the 尊's base centre lands on (x, y) and its
    middle is drawn at about k px per cm */
export const zunCam = (x: number, y: number, k: number, az = 30, el = 6, D = 320): Cam => { const a = (az * Math.PI) / 180, e = (el * Math.PI) / 180, T: V3 = [0, 0, 19.4];
	const c0 = lookAt([T[0] + D * Math.cos(e) * Math.cos(a), T[1] + D * Math.cos(e) * Math.sin(a), T[2] + D * Math.sin(e)], T, k * D, 0, 0);
	const b = proj(c0, [0, 0, 0]); return {...c0, cx: x - b[0], cy: y - b[1]}; };
/** the four flange beaks of the 尊 on screen (model r ≈ 18.4 cm, z ≈ 34.1 cm), for tags and strings */
export const beaks = (cam: Cam): P[] => [0, 1, 2, 3].map((q) => { const a = (q * Math.PI) / 2, p = proj(cam, [18.4 * Math.cos(a), 18.4 * Math.sin(a), 34.1]); return [p[0], p[1]] as P; });

/* ============================== joints ============================== */
/** two-bone IK from a to b; side = +1 puts the middle joint on the +x side (a knee in front for a figure facing +x) */
export const ik2 = (a: P, b: P, l1: number, l2: number, side = 1): P => { const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.max(Math.abs(l1 - l2) + 0.01, Math.min(l1 + l2 - 0.01, Math.hypot(dx, dy))), th = Math.atan2(dy, dx);
	const al = Math.acos(cl((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), e1: P = [a[0] + l1 * Math.cos(th + al), a[1] + l1 * Math.sin(th + al)], e2: P = [a[0] + l1 * Math.cos(th - al), a[1] + l1 * Math.sin(th - al)];
	return (e1[0] - e2[0]) * side > 0 ? e1 : e2; };
/** an arm by its joint angles (deg): up = upper arm from hanging straight down, toward +x (90 = forward, 180 = straight up);
    bend = elbow flexion (0 straight). Returns elbow and hand (cm). */
export const armFK = (sh: P, up: number, bend: number, l1 = 30, l2 = 28): {e: P; h: P} => { const a = (up * Math.PI) / 180, b = ((up + bend) * Math.PI) / 180;
	const e: P = [sh[0] + l1 * Math.sin(a), sh[1] + l1 * Math.cos(a)]; return {e, h: [e[0] + l2 * Math.sin(b), e[1] + l2 * Math.cos(b)]}; };
/** clamp a hand target to the arm's reach from the shoulder */
export const reach = (sh: P, h: P, r = 57.5): P => { const dx = h[0] - sh[0], dy = h[1] - sh[1], d = Math.hypot(dx, dy); return d <= r ? h : [sh[0] + (dx * r) / d, sh[1] + (dy * r) / d]; };
/** a body pose from the hip, the trunk lean (deg, + forward), the neck angle, planted ankles (knees by IK, in front) and hands.
    Bone lengths match rig55h: trunk 50, neck 18, thigh 44, shin 40, arm 30 + 28. */
export type FK = {hip: P; lean: number; neck?: number; tilt?: number; fN: P; fF: P; hN: P; hF: P; eN?: P; eF?: P; toeN?: number; toeF?: number; kneeSide?: number};
export const poseFK = (o: FK): Sk => { const a = (o.lean * Math.PI) / 180, n = ((o.lean + (o.neck ?? 6)) * Math.PI) / 180;
	const sh: P = [o.hip[0] + 50 * Math.sin(a), o.hip[1] - 50 * Math.cos(a)], hd: P = [sh[0] + 18 * Math.sin(n), sh[1] - 18 * Math.cos(n)];
	const ks = o.kneeSide ?? 1, kN = ik2(o.hip, o.fN, 44, 40, ks), kF = ik2(o.hip, o.fF, 44, 40, ks);
	return {hip: o.hip, sh, hd, kN, fN: o.fN, kF, fF: o.fF, hN: o.eN ? o.hN : reach(sh, o.hN), hF: o.eF ? o.hF : reach(sh, o.hF), eN: o.eN, eF: o.eF, toeN: o.toeN, toeF: o.toeF, tilt: o.tilt ?? 0}; };
/** blend two FK poses (angles and points; the joints are re-solved, so no bone ever stretches) */
export const mixFK = (a: FK, b: FK, u: number): FK => ({hip: lerpP(a.hip, b.hip, u), lean: lerp(a.lean, b.lean, u), neck: lerp(a.neck ?? 6, b.neck ?? 6, u), tilt: lerp(a.tilt ?? 0, b.tilt ?? 0, u),
	fN: lerpP(a.fN, b.fN, u), fF: lerpP(a.fF, b.fF, u), hN: lerpP(a.hN, b.hN, u), hF: lerpP(a.hF, b.hF, u), toeN: a.toeN, toeF: a.toeF, kneeSide: a.kneeSide,
	eN: a.eN && b.eN ? lerpP(a.eN, b.eN, u) : undefined, eF: a.eF && b.eF ? lerpP(a.eF, b.eF, u) : undefined});
/** a keyframed track: [time, value][] with eased segments */
export const track = <T,>(keys: [number, T][], t: number, mix: (a: T, b: T, u: number) => T, e: (u: number) => number = ease): T => {
	if (t <= keys[0][0]) return keys[0][1]; for (let i = 0; i < keys.length - 1; i++) { const [t0, a] = keys[i], [t1, b] = keys[i + 1]; if (t < t1) return mix(a, b, e((t - t0) / (t1 - t0))); }
	return keys[keys.length - 1][1]; };
export const trackN = (keys: [number, number][], t: number, e: (u: number) => number = ease) => track(keys, t, lerp, e);
export const trackP = (keys: [number, P][], t: number, e: (u: number) => number = ease) => track(keys, t, lerpP, e);

/* ============================== Glyphs55: gold bronze-script glyphs ============================== */
type Stroke = {pts: P[]; w: number; fill?: boolean};
/* the same forms as the inscription in zun55h (中 / 或 / 宅 / 兹), unit cell [-0.5, 0.5], y down */
const ZHONG: Stroke[] = [
	{w: 0.085, pts: [[0, -0.5], [0, 0.5]]},
	{w: 0.08, pts: [[-0.21, 0.0], [-0.2, -0.11], [0, -0.14], [0.2, -0.11], [0.21, 0.0], [0.2, 0.11], [0, 0.14], [-0.2, 0.11], [-0.21, 0.0]]},
	{w: 0.065, pts: [[0, -0.47], [0.11, -0.46], [0.18, -0.41], [0.29, -0.4]]}, {w: 0.065, pts: [[0, -0.36], [0.11, -0.35], [0.18, -0.3], [0.29, -0.29]]},
	{w: 0.065, pts: [[0, 0.3], [0.11, 0.31], [0.18, 0.36], [0.29, 0.37]]}, {w: 0.065, pts: [[0, 0.41], [0.11, 0.42], [0.18, 0.47], [0.29, 0.48]]},
];
const HUO: Stroke[] = [
	{w: 0.075, pts: [[-0.36, -0.12], [-0.08, -0.13], [-0.07, 0.12], [-0.35, 0.13], [-0.36, -0.12]]},
	{w: 0.07, pts: [[-0.42, 0.27], [-0.02, 0.25]]},
	{w: 0.085, pts: [[0.12, -0.46], [0.14, -0.1], [0.18, 0.22], [0.27, 0.46]]},
	{w: 0.08, pts: [[-0.4, -0.3], [0.0, -0.31], [0.4, -0.35]]},
	{w: 0.06, pts: [[0.27, -0.46], [0.36, -0.42], [0.44, -0.47]]},
	{w: 0.065, pts: [[0.27, 0.46], [0.38, 0.37]]},
];
const ZHAI: Stroke[] = [
	{w: 0.075, pts: [[-0.42, -0.02], [-0.42, -0.24], [0, -0.43], [0.42, -0.24], [0.42, -0.02]]}, {w: 0.06, pts: [[0, -0.43], [0, -0.5]]},
	{w: 0.08, pts: [[0.03, -0.2], [0, 0.12], [0.02, 0.34], [0.22, 0.42]]}, {w: 0.07, pts: [[-0.2, 0.03], [0.22, -0.04]]},
];
const ZI: Stroke[] = [-0.2, 0.2].flatMap((x) => [
	{w: 0.07, pts: [[x - 0.03, -0.46], [x, -0.36]] as P[]},
	{w: 0.07, pts: Array.from({length: 13}, (_, i) => [x + 0.11 * Math.sin((i / 12) * 2 * Math.PI), -0.22 - 0.12 * Math.cos((i / 12) * 2 * Math.PI)] as P)},
	{w: 0.07, pts: Array.from({length: 13}, (_, i) => [x + 0.13 * Math.sin((i / 12) * 2 * Math.PI), 0.1 - 0.14 * Math.cos((i / 12) * 2 * Math.PI)] as P)},
	{w: 0.07, pts: [[x, 0.24], [x - 0.04, 0.46]] as P[]}]);
/** 國: 或 inside a rounded enclosure (the later form of the same word) */
const GUO: Stroke[] = [{w: 0.07, pts: [[-0.44, -0.46], [0.44, -0.46], [0.46, 0.46], [-0.46, 0.46], [-0.44, -0.46]]},
	...HUO.map((s) => ({...s, w: s.w * 0.8, pts: s.pts.map(([x, y]) => [x * 0.7, y * 0.7] as P)}))];
export const GLYPH_STROKES: Record<string, Stroke[]> = {'中': ZHONG, '或': HUO, '宅': ZHAI, '兹': ZI, '國': GUO};
/** Glyphs55 — gold bronze-script glyphs (#F2C66E) with a soft glow that stays close to the strokes.
    chars: e.g. '宅兹中或' (supported: 宅 兹 中 或 國); x, y: the centre of the FIRST glyph; size: the cell in px;
    dir: 'v' (a column, top → down, the default) or 'h'; gap: centre-to-centre spacing (default 1.12 × size);
    u: how many glyphs are formed (0 … chars.length; a fraction draws the next one's strokes on; default all); weight: stroke weight (1.3);
    glow: 0 … 1+ (the halo strength); o: overall opacity; id: a unique prefix for the filter (needed when two sit in one frame).
    Returns an SVG <g>, so put it inside an <svg>. */
export const Glyphs55: React.FC<{chars: string; x: number; y: number; size: number; glow?: number; u?: number; dir?: 'v' | 'h'; gap?: number; id?: string; o?: number; color?: string; weight?: number}> =
	({chars, x, y, size, glow = 0.8, u, dir = 'v', gap, id = 'g55', o = 1, color = '#F2C66E', weight = 1.3}) => { const cs = [...chars], n = cs.length, uu = u ?? n, g = gap ?? size * 1.12;
	const blur = Math.max(1.5, size * 0.07);
	const body = (pass: 'glow' | 'gold' | 'hi') => cs.map((ch, i) => { const v = cl(uu - i); if (v <= 0) return null; const st = GLYPH_STROKES[ch]; if (!st) return null;
		const cx = x + (dir === 'h' ? i * g : 0), cy = y + (dir === 'v' ? i * g : 0), sc = size * (1 + 0.14 * (1 - ease(cl(v * 1.4))));
		return <g key={`${pass}${i}`} transform={`translate(${f1(cx)},${f1(cy)}) scale(${sc.toFixed(3)})`}>
			{st.map((s, j) => { const m = st.length, p = cl((v * 1.15 - j / m) * m); if (p <= 0) return null;
				const d = s.pts.length > 2 ? sm(s.pts, false) : `M${s.pts[0][0]},${s.pts[0][1]} L${s.pts[1][0]},${s.pts[1][1]}`;
				const w = s.w * weight * (pass === 'glow' ? 2.0 : pass === 'hi' ? 0.3 : 1);
				return <path key={j} d={d} pathLength={1} strokeDasharray={p >= 1 ? undefined : '1 1'} strokeDashoffset={p >= 1 ? undefined : 1 - p} fill="none"
					stroke={pass === 'hi' ? '#FFF4CC' : color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={pass === 'hi' ? 0.75 : 1}
					transform={pass === 'hi' ? `translate(${-s.w * 0.18},${-s.w * 0.22})` : undefined} />; })}</g>; });
	return <g opacity={o}>
		<defs><filter id={`${id}b`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={blur} /></filter></defs>
		{glow > 0 && <g filter={`url(#${id}b)`} opacity={cl(glow, 0, 1.5) * 0.9}>{body('glow')}</g>}
		<g>{body('gold')}</g>
		<g>{body('hi')}</g>
	</g>; };

/* ============================== cowries ============================== */
/** one cowrie seen on its toothed (aperture) side: a glossy cream egg, the dark toothed slit along it, a highlight;
    r = half-length px (r 15 ≈ a 30 px shell); lit 0..1 = a glint as it lands */
export const Cowrie: React.FC<{x: number; y: number; r?: number; rot?: number; lit?: number; o?: number; shadow?: boolean}> = ({x, y, r = 10, rot = 0, lit = 0, o = 1, shadow = true}) => {
	const q = r * 0.66, egg = (k: number, dx = 0, dy = 0) => sm(([[-1, 0], [-0.72, -1], [0.15, -1.06], [0.82, -0.66], [1, 0], [0.82, 0.66], [0.15, 1.06], [-0.72, 1]] as P[]).map(([u, v]) => [dx + u * r * k, dy + v * q * k] as P));
	const sl = `M${f1(-r * 0.8)},${f1(q * 0.08)} C${f1(-r * 0.35)},${f1(-q * 0.16)} ${f1(r * 0.3)},${f1(q * 0.2)} ${f1(r * 0.82)},${f1(-q * 0.04)}`;
	return <g transform={`translate(${f1(x)},${f1(y)}) rotate(${f1(rot)})`} opacity={o}>
		{shadow && <path d={egg(1.04, r * 0.16, r * 0.26)} fill="#120A06" opacity={0.5} />}
		<path d={egg(1)} fill="#C9B48C" />
		<path d={egg(0.93, -r * 0.03, -q * 0.07)} fill="#EADDBF" />
		<path d={egg(0.7, -r * 0.1, -q * 0.22)} fill="#F8F0DC" />
		<path d={sl} fill="none" stroke="#3A2414" strokeWidth={Math.max(1, r * 0.2)} strokeLinecap="round" />
		{r > 5 && [-0.56, -0.36, -0.16, 0.04, 0.24, 0.44, 0.62].map((u, i) => { const yy = q * 0.06 * Math.sin(u * 3); return <path key={i} d={`M${f1(u * r)},${f1(yy - q * 0.3)} L${f1(u * r)},${f1(yy + q * 0.3)}`} stroke="#5A3C24" strokeWidth={Math.max(0.6, r * 0.07)} opacity={0.75} />; })}
		<ellipse cx={-r * 0.4} cy={-q * 0.5} rx={r * 0.28} ry={q * 0.16} fill="#FFFFFF" opacity={0.6 + 0.4 * lit} />
		{lit > 0.05 && <circle cx={-r * 0.42} cy={-q * 0.5} r={r * (0.3 + 0.6 * lit)} fill="#FFF8E4" opacity={0.5 * lit} />}
	</g>; };
/** sample a Catmull-Rom curve through pts into m points */
export const crSample = (pts: P[], m = 40): P[] => { const n = pts.length; if (n < 2) return pts; const g = (i: number) => pts[Math.max(0, Math.min(n - 1, i))], out: P[] = [];
	for (let k = 0; k <= m; k++) { const s = (k / m) * (n - 1), i = Math.min(n - 2, Math.floor(s)), u = s - i, p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2), u2 = u * u, u3 = u2 * u;
		out.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * u + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * u2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * u3)) as P); }
	return out; };
/** a string of cowries on a red cord through the points pts (screen px): n shells (12 by default) spaced along it, each
    lying along the cord; r = shell half-length px; lit = glint per shell (a number, or a function of the shell index) */
export const CowrieString: React.FC<{pts: P[]; n?: number; r?: number; lit?: number | ((i: number) => number); seed?: number; o?: number; cord?: string; shadow?: boolean}> =
	({pts, n = 12, r = 9, lit = 0, seed = 0, o = 1, cord = '#A3301E', shadow = true}) => { const s = crSample(pts, 48), L: number[] = [0];
	for (let i = 1; i < s.length; i++) L.push(L[i - 1] + Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]));
	const tot = L[L.length - 1] || 1, at = (d: number): {p: P; a: number} => { let i = 1; while (i < L.length - 1 && L[i] < d) i++; const u = (d - L[i - 1]) / ((L[i] - L[i - 1]) || 1), a = s[i - 1], b = s[i];
		return {p: [lerp(a[0], b[0], u), lerp(a[1], b[1], u)], a: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI}; };
	const d0 = Math.max(r * 1.2, tot * 0.04), step = Math.min(r * 2.3, (tot - 2 * d0) / Math.max(1, n - 1));
	const cordD = 'M' + s.map((q) => `${f1(q[0])},${f1(q[1])}`).join('L');
	return <g opacity={o}>
		<path d={cordD} fill="none" stroke="#120A06" strokeWidth={Math.max(1.5, r * 0.34)} strokeLinecap="round" opacity={shadow ? 0.35 : 0} transform={`translate(${f1(r * 0.12)},${f1(r * 0.2)})`} />
		<path d={cordD} fill="none" stroke={cord} strokeWidth={Math.max(1, r * 0.26)} strokeLinecap="round" />
		{Array.from({length: n}, (_, i) => { const q = at(d0 + i * step), jit = (rnd(i, seed + 3) - 0.5) * 26;
			return <Cowrie key={i} x={q.p[0]} y={q.p[1]} r={r * (0.92 + 0.16 * rnd(i, seed + 7))} rot={q.a + jit} lit={typeof lit === 'function' ? lit(i) : lit} shadow={shadow} />; })}
		{(() => { const e = s[s.length - 1]; return <g><circle cx={e[0]} cy={e[1]} r={r * 0.3} fill={cord} /><path d={`M${f1(e[0])},${f1(e[1])} l${f1(r * 0.5)},${f1(r * 0.9)} M${f1(e[0])},${f1(e[1])} l${f1(-r * 0.2)},${f1(r * 1.0)}`} stroke={cord} strokeWidth={Math.max(1, r * 0.18)} strokeLinecap="round" /></g>; })()}
	</g>; };

/* ============================== the 1965 scrap yard ============================== */
export type YCam = {x: number; y: number; s: number};
/** a layer of a 2.5D set at parallax p (0 = infinitely far, 1 = the action plane): the camera offset (x, y) px and zoom s */
export const layerT = (c: YCam, p: number, ox = 960, oy = 540) => `translate(${f1(ox - c.x * p)},${f1(oy - c.y * p)}) scale(${(1 + (c.s - 1) * p).toFixed(4)}) translate(${-ox},${-oy})`;
/** the 1965 scrap yard at dusk, the backdrop only (sky, the 秦岭, the yard wall, the shed, the chimney and the furnace, the far
    scrap piles, the ground). cam: the 2.5D camera; t: film time (smoke, furnace flicker); dim: 0..1 the light dying to night;
    rev: the reverse angle (mirrored set, the low sun now behind the camera, so the sky is darker and the faces are lit). */
export const Yard1965: React.FC<{cam?: YCam; t?: number; dim?: number; rev?: boolean; id?: string}> = ({cam = {x: 0, y: 0, s: 1}, t = 0, dim = 0, rev = false, id = 'y65'}) => {
	const fl = 0.85 + 0.1 * Math.sin(t * 7.3) + 0.05 * Math.sin(t * 17.1), sunX = rev ? 300 : 1560;
	const sky = rev ? ['#141822', '#2A2A36', '#5A4448', '#2E2220'] : ['#1A1E2A', '#3A3236', '#8A5A3A', '#3A2618'];
	return <g>
		<defs><linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky[0]} /><stop offset="0.4" stopColor={sky[1]} /><stop offset="0.66" stopColor={sky[2]} /><stop offset="1" stopColor={sky[3]} /></linearGradient>
			<linearGradient id={`${id}gnd`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2C2119" /><stop offset="1" stopColor="#100B08" /></linearGradient></defs>
		<g transform={layerT(cam, 0.2)}>
			<rect x={-600} y={-1200} width={W + 1200} height={H + 2400} fill={`url(#${id}sky)`} />
			{Array.from({length: 7}, (_, i) => <path key={i} d={sm([[-200 + i * 380, 120 + rnd(i, 5) * 160], [-40 + i * 380, 100 + rnd(i, 6) * 150], [160 + i * 380, 128 + rnd(i, 7) * 150], [0 + i * 380, 150 + rnd(i, 8) * 150]])} fill="#6A4A40" opacity={0.18} />)}
			{!rev && <><Glow x={sunX} y={620} r={560} c="#FFB060" o={0.55 * (1 - 0.7 * dim)} id={`${id}sun`} sy={0.55} /><circle cx={sunX} cy={632} r={44} fill="#FFD08A" opacity={0.85 * (1 - 0.8 * dim)} /></>}
		</g>
		<g transform={layerT(cam, 0.4)}>
			<path d={sm([[-400, 700], [160, 610], [380, 640], [560, 585], [760, 625], [980, 570], [1200, 615], [1420, 580], [1660, 620], [2300, 590], [2300, 1400], [-400, 1400]])} fill={rev ? '#2A2228' : '#4A3A38'} opacity={0.9} />
			<path d={sm([[-400, 720], [240, 668], [520, 690], [820, 650], [1100, 682], [1400, 655], [1700, 680], [2300, 660], [2300, 1400], [-400, 1400]])} fill={rev ? '#221A1A' : '#3A2C28'} />
			<Haze y={700} h={130} c={rev ? '#7A5040' : '#C8885A'} o={0.32} id={`${id}hz`} />
		</g>
		<g transform={layerT(cam, 0.7)}>
			<rect x={-500} y={650} width={W + 1000} height={600} fill="#2A1E19" />
			{Array.from({length: 58}, (_, i) => <path key={i} d={`M${i * 50 - 500},650 L${i * 50 - 500},770`} stroke="#1C1411" strokeWidth={2} />)}
			{/* the shed (sign painted out to illegible marks) */}
			<path d={`M${rev ? 160 : 1240},560 L${rev ? 680 : 1760},540 L${rev ? 700 : 1780},580 L${rev ? 700 : 1780},780 L${rev ? 160 : 1240},780 Z`} fill="#241A16" />
			<path d={`M${rev ? 140 : 1220},566 L${rev ? 420 : 1500},520 L${rev ? 720 : 1800},548 L${rev ? 720 : 1800},562 L${rev ? 420 : 1500},534 L${rev ? 140 : 1220},580 Z`} fill="#1A1310" />
			<rect x={rev ? 380 : 1460} y={596} width={300} height={58} fill="#3A2A22" stroke="#5A4232" strokeWidth={2} />
			{Array.from({length: 5}, (_, i) => <path key={i} d={sm([[(rev ? 400 : 1480) + i * 56, 632], [(rev ? 412 : 1492) + i * 56, 612], [(rev ? 430 : 1510) + i * 56, 636], [(rev ? 442 : 1522) + i * 56, 616]], false)} fill="none" stroke="#A8967A" strokeWidth={5} opacity={0.18} strokeLinecap="round" />)}
			{/* the chimney + smoke, the furnace with its door glowing */}
			<rect x={rev ? 1500 : 380} y={380} width={34} height={350} fill="#1E1612" />
			<Plume x={rev ? 1517 : 397} y={372} h={340} w={130} c="#7A6A62" o={0.32} id={`${id}smk`} seed={t * 0.6} />
			<Plume x={(rev ? 1540 : 420) + 30 * Math.sin(t * 0.4)} y={250} h={260} w={150} c="#6A5A52" o={0.2} id={`${id}smk2`} seed={2 + t * 0.5} />
			<path d={sm([[rev ? 1380 : 300, 800], [rev ? 1386 : 306, 700], [rev ? 1420 : 340, 676], [rev ? 1500 : 420, 676], [rev ? 1532 : 452, 700], [rev ? 1538 : 458, 800]])} fill="#2A1C16" />
			<path d={`M${rev ? 1430 : 350},760 L${rev ? 1430 : 350},726 L${rev ? 1488 : 408},726 L${rev ? 1488 : 408},760 Z`} fill="#FF8A34" opacity={0.75 + 0.25 * fl} />
			<Glow x={rev ? 1460 : 380} y={744} r={150} c="#FF8A34" o={0.55 * fl} id={`${id}fur`} sy={0.7} />
			{pile(rev ? 1680 : 240, 870, 520, 180, 3, '#1C1512', '#E89A5A', 1.2)}
			{pile(rev ? 300 : 1620, 880, 640, 210, 7, '#1C1512', '#FFB070', 1.3)}
			{pile(rev ? 1260 : 660, 800, 300, 90, 11, '#231A15', '#D88A50', 0.9)}
		</g>
		<g transform={layerT(cam, 1)}>
			<rect x={-800} y={880} width={W + 1600} height={700} fill={`url(#${id}gnd)`} />
			<Glow x={rev ? 860 : 1080} y={930} r={640} c="#FFB060" o={0.16 * (1 - dim)} id={`${id}gp`} sy={0.16} />
		</g>
		{dim > 0 && <rect x={0} y={0} width={W} height={H} fill="#06040A" opacity={0.55 * dim} />}
	</g>; };

/** a 1960s platform scale (磅秤), drawn in profile at k px / cm: the deck (80 × 14 cm, on castors) with its bottom-centre at
    (x, y), the column at one end (110 cm), the steelyard beam on top pivoting by `beam` degrees (+ = the free end up), the poise
    at `poise` (0..1 along the beam) and the weight hanger. side 'L' puts the column at the left end with the beam reaching left. */
export const PlatformScale1965: React.FC<{x: number; y: number; k: number; beam?: number; poise?: number; side?: 'L' | 'R'; rim?: string}> = ({x, y, k, beam = 0, poise = 0.55, side = 'L', rim = '#E8A868'}) => {
	const s = side === 'L' ? -1 : 1, X = (cm: number) => x + s * cm * k, Y = (cm: number) => y - cm * k;
	const colX = X(40), topY = Y(110), piv: P = [colX + s * 2 * k, topY + 4 * k], Lb = 62 * k, a = (beam * Math.PI) / 180;
	const end: P = [piv[0] + s * Lb * Math.cos(a), piv[1] - Lb * Math.sin(a)], bp = (u: number): P => [lerp(piv[0], end[0], u), lerp(piv[1], end[1], u)];
	const pz = bp(0.25 + 0.65 * poise), hang = bp(0.98);
	return <g>
		{/* deck: top face (a sliver, seen from a little above), front face, castors */}
		<path d={`M${f1(X(-40))},${f1(Y(14))} L${f1(X(40))},${f1(Y(14))} L${f1(X(40) + 18)},${f1(Y(14) - 12)} L${f1(X(-40) + 18)},${f1(Y(14) - 12)} Z`} fill="#3A3330" />
		<rect x={Math.min(X(-40), X(40))} y={Y(14)} width={80 * k} height={11 * k} fill="#201B19" />
		<path d={`M${f1(X(-40))},${f1(Y(14))} L${f1(X(40))},${f1(Y(14))}`} stroke={rim} strokeWidth={2} strokeOpacity={0.6} />
		{[-34, 34].map((c, i) => <g key={i}><circle cx={X(c)} cy={Y(2)} r={2.2 * k} fill="#121010" /><circle cx={X(c)} cy={Y(2)} r={0.7 * k} fill="#3A3230" /></g>)}
		{/* the column and its foot */}
		<rect x={Math.min(colX, colX + s * 5 * k)} y={topY} width={5 * k} height={Y(14) - topY} fill="#2A2422" />
		<path d={`M${f1(colX + (s > 0 ? 5 * k : 0))},${f1(topY)} L${f1(colX + (s > 0 ? 5 * k : 0))},${f1(Y(14))}`} stroke={rim} strokeWidth={2} strokeOpacity={0.55} />
		<rect x={Math.min(colX - s * 4 * k, colX + s * 9 * k)} y={topY - 2 * k} width={13 * k} height={9 * k} rx={k} fill="#2E2826" />
		{/* the beam stop (a little frame the free end moves in) at the far end */}
		<path d={`M${f1(piv[0] + s * (Lb + 4 * k))},${f1(piv[1] - 7 * k)} L${f1(piv[0] + s * (Lb + 4 * k))},${f1(piv[1] + 7 * k)}`} stroke="#2A2422" strokeWidth={2.4 * k} />
		<path d={`M${f1(piv[0] + s * (Lb + 4 * k) - s * 2 * k)},${f1(piv[1] - 7 * k)} L${f1(piv[0] + s * (Lb + 6 * k))},${f1(piv[1] - 7 * k)} M${f1(piv[0] + s * (Lb + 4 * k) - s * 2 * k)},${f1(piv[1] + 7 * k)} L${f1(piv[0] + s * (Lb + 6 * k))},${f1(piv[1] + 7 * k)}`} stroke="#2A2422" strokeWidth={1.2 * k} />
		{/* the beam, graduated, the poise, the hanger */}
		<path d={`M${f1(piv[0])},${f1(piv[1])} L${f1(end[0])},${f1(end[1])}`} stroke="#2E2826" strokeWidth={3.4 * k} strokeLinecap="round" />
		<path d={`M${f1(piv[0])},${f1(piv[1] - 1.7 * k)} L${f1(end[0])},${f1(end[1] - 1.7 * k)}`} stroke={rim} strokeWidth={1.6} strokeOpacity={0.7} />
		{Array.from({length: 12}, (_, i) => { const q = bp(0.12 + i * 0.07); return <path key={i} d={`M${f1(q[0])},${f1(q[1] - 1.6 * k)} L${f1(q[0])},${f1(q[1] - (i % 5 ? 0.4 : -0.4) * k)}`} stroke="#C9A27A" strokeWidth={1} opacity={0.55} />; })}
		<rect x={pz[0] - 2.6 * k} y={pz[1] - 3.6 * k} width={5.2 * k} height={6.4 * k} rx={0.8 * k} fill="#3A3230" stroke={rim} strokeWidth={1.4} strokeOpacity={0.55} transform={`rotate(${f1(-s * beam)} ${f1(pz[0])} ${f1(pz[1])})`} />
		<path d={`M${f1(hang[0])},${f1(hang[1])} L${f1(hang[0])},${f1(hang[1] + 22 * k)}`} stroke="#2A2422" strokeWidth={0.8 * k} />
		{[0, 1, 2].map((i) => <rect key={i} x={hang[0] - (5 - i) * k} y={hang[1] + (22 + i * 2.6) * k} width={(10 - 2 * i) * k} height={2.4 * k} fill="#2A2422" stroke={rim} strokeWidth={1} strokeOpacity={i === 0 ? 0.4 : 0} />)}
		<circle cx={piv[0]} cy={piv[1]} r={1.3 * k} fill="#4A403A" />
	</g>; };

/** the 1965 worker: a dark padded work jacket and a 'cadre' cap, rim-lit. part 'back' / 'front' split him around a held object */
export const Worker1965: React.FC<{s: Sk; x: number; y: number; k: number; id: string; flip?: boolean; rim?: string; lx?: number; ly?: number; part?: 'all' | 'back' | 'front'; fill?: string; o?: number}> =
	({s, x, y, k, id, flip, rim = '#FFB874', lx = 1, ly = 0.2, part = 'all', fill = '#15100C', o}) => <Sil id={id} x={x} y={y} k={k} flip={flip} rim={rim} lx={lx} ly={ly} fill={fill} o={o}><Body s={s} dress="jacket" hat="cadre" part={part} wide={1.16} /></Sil>;

/** the paper price tag: its hole at (x, y), hanging rot degrees; write 0..1 inks 「30元」 on in red; anchor = where its string is
    tied (the 尊's beak), drawn as a sagging string from there to the hole; s = size (1 ≈ 64 × 34 px) */
export const Tag30w: React.FC<{x: number; y: number; rot?: number; write?: number; anchor?: P | null; s?: number; id?: string; o?: number}> = ({x, y, rot = 0, write = 1, anchor = null, s = 1, id = 'tg', o = 1}) => {
	const w = 66 * s, h = 36 * s;
	return <g opacity={o}>
		<defs><clipPath id={`${id}c`}><rect x={-4} y={0} width={4 + w * 1.02 * cl(write)} height={h + 4} /></clipPath></defs>
		{anchor && <path d={`M${f1(anchor[0])},${f1(anchor[1])} Q${f1((anchor[0] + x) / 2)},${f1(Math.max(anchor[1], y) + 14 * s)} ${f1(x)},${f1(y)}`} fill="none" stroke="#D8C8A6" strokeWidth={Math.max(1, 1.6 * s)} />}
		<g transform={`translate(${f1(x)},${f1(y)}) rotate(${f1(rot)}) translate(${f1(-10 * s)},${f1(-6 * s)})`}>
			<path d={`M${f1(3 * s)},${f1(5 * s)} L${f1(13 * s)},${f1(2 * s)} L${f1(w + 3 * s)},${f1(2 * s)} L${f1(w + 3 * s)},${f1(h + 4 * s)} L${f1(3 * s)},${f1(h + 4 * s)} Z`} fill="#000" opacity={0.4} />
			<path d={`M0,${f1(6 * s)} L${f1(10 * s)},0 L${f1(w)},0 L${f1(w)},${f1(h)} L0,${f1(h)} Z`} fill="#E6D8B8" />
			<path d={`M${f1(w)},0 L${f1(w)},${f1(h)} L0,${f1(h)}`} fill="none" stroke="#FFE2B0" strokeWidth={1.2} opacity={0.7} />
			<circle cx={9 * s} cy={8 * s} r={2.6 * s} fill="#3A2E24" />
			<g clipPath={`url(#${id}c)`}><text x={w * 0.56} y={h * 0.78} textAnchor="middle" fontFamily={KAI} fontWeight={700} fontSize={25 * s} fill="#9E2A1C">30元</text></g>
		</g></g>; };

/* ---------- the card-1 action, in the worker's body frame (cm; he faces +x; ground y = 0) ---------- */
/** where the 尊's base centre rests on the deck, in the worker's body frame (the deck's near end is at x = 12, its top at y = −14) */
export const ZREST: P = [54, -14];
/** deck centre-bottom in the worker's body frame (PlatformScale1965 with side 'R' in body coords, i.e. the column at the far end) */
export const DECK1965: P = [54, 0];
const FN: P = [6, -8], FF: P = [-16, -8];
const K1: [number, FK][] = [
	[0.0, {hip: [-6, -88], lean: 14, neck: 4, fN: FN, fF: FF, hN: [30, -84], hF: [38, -88]}],                 // carrying it at the belly
	[0.55, {hip: [-8, -80], lean: 26, neck: 2, fN: FN, fF: FF, hN: [40, -70], hF: [48, -74]}],
	[1.3, {hip: [-14, -64], lean: 50, neck: 0, tilt: 12, fN: FN, fF: FF, hN: [48, -42], hF: [58, -44]}],        // over the deck, nearly down
	[1.42, {hip: [-15, -60], lean: 52, neck: 0, tilt: 12, fN: FN, fF: FF, hN: [47, -39], hF: [61, -41]}],
	[1.62, {hip: [-14, -63], lean: 48, neck: 2, tilt: 10, fN: FN, fF: FF, hN: [44, -46], hF: [54, -48]}],       // let go, hands come off
	[2.15, {hip: [-12, -70], lean: 40, neck: 6, tilt: 10, fN: FN, fF: FF, hN: [0, -74], hF: [22, -62]}],        // a hand to the jacket pocket
	[2.55, {hip: [-12, -70], lean: 40, neck: 8, tilt: 22, fN: FN, fF: FF, hN: [30, -62], hF: [34, -66]}],       // the tag and the pencil, low by the 尊
	[3.9, {hip: [-12, -70], lean: 40, neck: 8, tilt: 22, fN: FN, fF: FF, hN: [31, -62], hF: [34, -66]}],        // writes
	[4.5, {hip: [-13, -66], lean: 46, neck: 6, tilt: 18, fN: FN, fF: FF, hN: [40, -53], hF: [42, -57]}],        // up to the beak, loops it on
	[4.85, {hip: [-13, -66], lean: 46, neck: 6, tilt: 18, fN: FN, fF: FF, hN: [41, -51], hF: [43, -55]}],
	[5.15, {hip: [-12, -70], lean: 38, neck: 6, tilt: 14, fN: FN, fF: FF, hN: [28, -64], hF: [24, -62]}],
	[5.98, {hip: [-5, -88], lean: 12, neck: 4, tilt: 8, fN: FN, fF: FF, hN: [14, -62], hF: [8, -60]}],          // rises, looks at it
];
const ZK: [number, P][] = [[0, [-18, -48]], [0.55, [-9, -38]], [1.3, [0, -9]], [1.4, [0, -6]]];
/** the card-1 action at local time τ (s): the worker's skeleton; zun = the 尊 base offset from ZREST (cm, body frame) and tilt
    (deg, + = top toward +x); tag = 'hand' (in his near hand, at tagAt) or 'hung' (tied to the beak since tagT); write 0..1;
    pencil = the far hand holds a pencil; thud = 1.45 (the landing). */
export const worker1965 = (tau: number) => {
	/* the 尊: carried, lowered, dropped the last 6 cm at 1.40 → 1.45, a 1 cm rattle, then still */
	let zun: P = [0, 0], tilt = 0;
	if (tau < 1.4) { zun = trackP(ZK, tau); tilt = -4 * (1 - seg(tau, 0, 1.3)); }
	else if (tau < 1.45) { const u = (tau - 1.4) / 0.05; zun = [0, -6 * (1 - u * u)]; }
	else { const v = tau - 1.45; zun = [0, -1.0 * Math.exp(-v * 18) * Math.abs(Math.sin(v * 40))]; tilt = 0.8 * Math.exp(-v * 10) * Math.sin(v * 46); }
	const zb: P = [ZREST[0] + zun[0], ZREST[1] + zun[1]], grip = (b: P): [P, P] => [[b[0] - 7, b[1] - 25], [b[0] + 7, b[1] - 27]];
	const base = track(K1, tau, mixFK);
	let hN = base.hN, hF = base.hF;
	if (tau < 1.45) [hN, hF] = grip(zb);
	else if (tau < 1.62) { const g = grip(ZREST), u = ease((tau - 1.45) / 0.17); hN = lerpP(g[0], base.hN, u); hF = lerpP(g[1], base.hF, u); }
	/* writing: small strokes of the pencil hand */
	const wr = seg(tau, 2.7, 3.8), wig = wr > 0 && wr < 1 ? 1.1 * Math.sin(tau * 38) : 0;
	const s = poseFK({...base, hN, hF: [hF[0] + wig + 3 * wr, hF[1] + 0.6 * Math.cos(tau * 38)]});
	const tagHung = tau >= 4.85, write = seg(tau, 2.7, 3.8);
	const tagAt: P = [s.hN[0] + 2, s.hN[1] - 3];
	return {s, zun, tilt, tag: tagHung ? 'hung' as const : tau >= 2.45 ? 'hand' as const : 'none' as const, tagAt, tagT: 4.85, write, pencil: tau >= 2.45 && tau < 4.1, thud: 1.45};
};
/** the scale beam after the landing: it kicks up, knocks the stop, rocks and settles (degrees, + = the free end up) */
export const beam1965 = (tau: number) => { if (tau < 1.45) return -6; const v = tau - 1.45; return Math.min(7, 13 * Math.exp(-v * 2.2) * Math.cos(v * 9) + 6 * Math.exp(-v * 1.2) - 0.0); };
/** the tag swinging from the beak after it is hung at tagT (degrees) */
export const tagSwing1965 = (tau: number, tagT = 4.85) => tau < tagT ? 0 : 16 * Math.exp(-(tau - tagT) * 1.3) * Math.sin((tau - tagT) * 6.2);
/** a stub pencil in the worker's hand (body frame: from the hand forward and down a little) */
export const pencilPath = (h: P): string => { const a: P = [h[0] + 1, h[1] - 1], b: P = [h[0] + 9, h[1] + 3]; return tube(a, b, 0.8, 0.5); };
