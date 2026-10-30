import React from 'react';
import {W, H, rnd, lerp, cl, seg} from '../qq50/kit50';
import {Pool, Vignette} from '../qq50/styleB';
import {Figure4, POSES, Look4} from '../qq44/figure44';
import {Cam, V3, lookAt, proj, poly, toCam, mix, blobOn, Tag, Scrim} from './parts53';
import {Sword3D, SwordPose} from './sword3d';
import {R_FACE} from './face53';
import {BladeLand, bw, hwAt, hAt, LBM, A_BL, Light} from './land53';
import {CleaverD as Cleaver} from './end53d';
import {RingDisc} from './props53';
import {spline, sstep, DEG} from './cam53';
import {B} from '../qq50/styleB';
import {DisplayBack, DisplayFront, titleQuadOn, DZ0, HY0, DTITLE_W, DTITLE_H, DTITLE_Y, DTITLE_Z} from './display53k';
/* ep53 · THE ONE TAKE, legs 1–6 (0 → 20.821 s): one camera, one world (the case frame, mm). The sword lies level on its
   holders, pommel end face at x = −278 (PF), tip at x = +278, blue glass up (z+), axis at z = 1000; plinth top z = 940.
   Your kitchen (kfA53, its own frame) is placed on the sword's own edge line beyond the tip (a 180° turn about z + a shift),
   so frame 0 (KF01) and the glide onto the bronze (KF02) are one move; the kitchen then falls away into lacquer.
   Camera: legs 1–2 in Cartesian keys (position + yaw/pitch); legs 3–6 in spherical keys round the pommel face (distance on a
   log scale, so the pull-back and the axis push are constant-rate moves); the two are blended C1 over 4.2–5.2 (v3-e hook).
   Lens (f, principal point, roll) are global channels. Everything is a pure function of t. */
export const SP: SwordPose = {x0: -278, ya: 0, z0: 1000, dir: 1};
export const PF: V3 = [-278, 0, 1000];
const kit = (q: V3): V3 => [506 - q[0], -q[1] - 19, q[2] - 1002.2];   // case → kitchen
const toKitchen = (c: Cam): Cam => ({...c, p: kit(c.p), yaw: c.yaw + Math.PI});

/* ---------- camera channels ---------- */
const XA = spline([[0, 566], [0.8, 352], [1.575, 226, -78], [3.0, 112], [4.7, -92, -72.28], [5.538, -145, -35]]);
const YA = spline([[0, -169], [0.8, -46], [1.575, 4], [3.0, 2.5, -1.0209], [4.7, 0.8188, -0.9731], [5.538, -18, -30]]);
const ZA = spline([[0, 1192.2], [0.8, 1084], [1.575, 1026.5], [2.4, 1025.5], [3.6, 1035], [4.7, 1060, 36.43], [5.538, 1100, 70]]);
const YAWA = spline([[0, 148.5], [0.8, 167], [1.575, 182.5], [3.0, 181.2, -0.6419], [4.7, 180.1871, -0.4135], [5.538, 160, -14]]);
const PITA = spline([[0, 27.6], [0.8, 21.5], [1.575, 15.5], [3.0, 15.5], [4.2, 21.5926, 9.4293], [4.7, 27, 12.0746], [5.1, 38.5], [5.538, 56, 16]]);
/* the hook (4.2 → 9.5, v3): from the glide the camera rises over the blade and swings out to the front, looking DOWN at the guard
   and the grip from a calm three-quarter angle (about 40° up, 35–50° off the axis: nothing points at the lens), then pulls back
   and up onto the whole sword for the title (9.5). Blended in from the glide over 4.2–5.2; knots on 9.5 keep their old slopes, so
   every move after the title is unchanged. */
const AL = spline([[4.2, 180.24, -20], [4.8, 160], [5.66, 145], [6.7, 128], [7.8, 114.5], [8.7, 106.5], [9.5, 102.5, -6.543], [10.4, 99], [11.3, 95.5], [11.764, 89], [13.5, 78], [15.0, 64], [16.293, 50], [18.6, 24.5, -6.6838], [19.75, 2.5], [20.0, 0, 0], [22, 0, 0]]);
const LND = spline([[4.2, Math.log(241)], [4.8, Math.log(270)], [5.66, Math.log(375)], [6.7, Math.log(560)], [7.8, Math.log(880)], [8.7, Math.log(1260)], [9.5, Math.log(1505), 0.07107], [10.4, Math.log(1555)], [11.3, Math.log(1635)], [11.764, Math.log(1800)],
	[13.0, Math.log(1220)], [14.2, Math.log(1100)], [15.4, Math.log(1030), 0], [16.293, Math.log(990)], [18.6, Math.log(335), -0.8527], [20.821, Math.log(55), -0.62]]);
const BE = spline([[4.2, 10.8, 18], [4.8, 26], [5.66, 37], [6.7, 40], [7.8, 37], [8.7, 33.5], [9.5, 31.6, -1.4954], [11.3, 30], [11.764, 28], [14.2, 19], [15.4, 18], [16.293, 17.5], [18.6, 18, -0.941], [19.75, 1.2], [20.0, 0, 0], [22, 0, 0]]);
const TX = spline([[4.2, -320], [4.8, -215], [5.66, -186], [6.7, -145], [7.8, -70], [8.7, -12], [9.5, 0, 0], [11.3, -14], [11.764, -34], [14.2, -46], [16.293, -40], [18.6, -28], [20.0, 0, 30], [20.821, 120]]);
const TY = spline([[4.2, 0], [9.5, 0], [11.3, 0], [14.2, 10], [16.293, 16], [18.6, 30], [20.0, 0, 0], [20.821, 0, 0]]);
const TZ = spline([[4.2, 935], [4.8, 985], [5.66, 998], [6.7, 990], [7.8, 975], [8.7, 963], [9.5, 960, 0], [11.3, 960], [13.0, 975], [14.2, 1000], [15.4, 1010], [16.293, 1000], [18.6, 988, 4.1726], [20.0, 1000, 0], [20.821, 1000, 0]]);
const FF = spline([[0, 1000], [0.8, 905], [1.575, 820], [3.6, 820, 0], [4.4, 870, 107.84], [5.0, 1000], [5.66, 1560], [6.7, 1700], [7.8, 1820], [8.7, 1960], [9.5, 2100, 0], [11.3, 2100], [11.764, 2140], [14.2, 2000], [15.4, 1950], [16.293, 1950], [18.6, 1650, -0.0015], [20.821, 1650, 0]]);
const CX = spline([[0, 900], [1.575, 960], [4.2, 960], [9.5, 960], [16.293, 980], [18.6, 1000], [20.0, 960, 0], [20.821, 960, 0]]);
const CY = spline([[0, 560], [1.575, 640], [3.6, 640], [4.7, 615.969, -30.3939], [5.66, 590], [7.8, 700], [9.5, 790, 0], [11.3, 790], [11.764, 772], [14.2, 700], [16.293, 640], [18.6, 600], [20.0, 540, 0], [20.821, 540, 0]]);
const RO = spline([[0, 0], [0.8, 1.6], [1.575, 2.5], [3.0, 1.8], [5.538, 0, 0], [20.821, 0, 0]]);
/* v3.1 S3 (16.293 → 20.5, owner: "this angle doesn't show the pattern well"): instead of pushing in along the axis from the pommel
   side (the blade end-on), the camera glides in LOW beside the blade at a three-quarter angle — the whole blade, guard to tip, lies
   across the frame (≈46° off the axis, 25° up) with its diamond lattice open to the lens through 「它表面镀了铬」 and the sheen on
   18.557 — then (19.0 → 20.5) swings round the guard onto the axis behind the pommel; every sword point ≤ 25 px per frame. The keys replace the channels only on (S3_0, S3_1): at both ends value and slope are the
   old spline's, so 9.5 → 16.293 and 20.5 → 20.821 (the rings filling the frame, the dive) are exactly as before. */
const S3_0 = 16.293, S3_1 = 20.5;
const s3 = (old: (t: number) => number, mid: [number, number][]) => { const e = 1e-4, sl = (u: number) => (old(u + e) - old(u - e)) / (2 * e);
	const S = spline([[S3_0, old(S3_0), sl(S3_0)], ...mid, [S3_1, old(S3_1), sl(S3_1)]]); return (t: number) => (t > S3_0 && t < S3_1 ? S(t) : old(t)); };
const K3 = [17.4, 18.557, 19.1, 19.6, 20.1];
const k3 = (v: number[]): [number, number][] => K3.map((t, i) => [t, v[i]]);
const AL3 = s3(AL, k3([64, 72, 50, 26, 7]));
const BE3 = s3(BE, k3([23, 25, 19, 10, 2.5]));
const LND3 = s3(LND, k3([730, 520, 400, 260, 130].map(Math.log)));
const TX3 = s3(TX, k3([-30, -60, -120, -220, -250]));
const TY3 = s3(TY, k3([8, 0, 0, 0, 0]));
const TZ3 = s3(TZ, k3([995, 990, 995, 1000, 1000]));
const FF3 = s3(FF, k3([1760, 1650, 1650, 1650, 1650]));
/* the principal point carries the sword up and left, so the hilt stays clear of the overlay's Cr tile (x ≥ 1345, y ≥ 683, 18.557 →) */
const CX3 = s3(CX, k3([880, 720, 780, 900, 960]));
const CY3 = s3(CY, k3([560, 470, 480, 520, 540]));
const BL0 = 4.2, BL1 = 5.1;
const fwd = (yaw: number, pit: number): V3 => [Math.cos(pit) * Math.cos(yaw), Math.cos(pit) * Math.sin(yaw), -Math.sin(pit)];
export const camAt = (t: number): Cam => {
	const pA: V3 = [XA(t), YA(t), ZA(t)], FA = fwd(YAWA(t) * DEG, PITA(t) * DEG), tA: V3 = [pA[0] + FA[0] * 300, pA[1] + FA[1] * 300, pA[2] + FA[2] * 300];
	const a = AL3(t) * DEG, b = BE3(t) * DEG, d = Math.exp(LND3(t));
	const pB: V3 = [PF[0] - d * Math.cos(b) * Math.cos(a), PF[1] - d * Math.cos(b) * Math.sin(a), PF[2] + d * Math.sin(b)], tB: V3 = [TX3(t), TY3(t), TZ3(t)];
	const w = t <= BL0 ? 0 : t >= BL1 ? 1 : sstep((t - BL0) / (BL1 - BL0));
	const p: V3 = [lerp(pA[0], pB[0], w), lerp(pA[1], pB[1], w), lerp(pA[2], pB[2], w)], tg: V3 = [lerp(tA[0], tB[0], w), lerp(tA[1], tB[1], w), lerp(tA[2], tB[2], w)];
	return lookAt(p, tg, FF3(t), CX3(t), CY3(t), RO(t) * DEG); };
/** distance from the camera to the pommel face (mm), for the ring match at 20.821 */
export const faceD = (t: number) => Math.exp(LND3(t));

/* ---------- ground: the lacquer dark under everything ---------- */
export const Ground53: React.FC<{id: string; k?: number; sheen?: number}> = ({id, k = 1, sheen = 0.3}) => <g>
	<defs><radialGradient id={`gv${id}`} cx="0.5" cy="0.5" r="0.75"><stop offset="0" stopColor="#2A1610" /><stop offset="0.6" stopColor="#1C0F0A" /><stop offset="1" stopColor="#0F0806" /></radialGradient>
		<linearGradient id={`gr${id}`} gradientUnits="userSpaceOnUse" x1={lerp(-600, 1400, sheen)} y1={0} x2={lerp(-600, 1400, sheen) + 900} y2={700}>
			<stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#FFEBD6" stopOpacity={0.05 * k} /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
	<rect width={W} height={H} fill={`url(#gv${id})`} />
	{k > 0.01 && <rect width={W} height={H} filter="url(#lacN)" opacity={0.12 * k} />}
	<rect width={W} height={H} fill={`url(#gr${id})`} />
</g>;

/* ---------- the kitchen (kitchen frame): the counter, the rack, the tiled splashback (world-anchored, soft) ---------- */
const KitchenW: React.FC<{c: Cam; o: number}> = ({c, o}) => { if (o <= 0.01) return null;
	const counter = poly(c, [[-700, -700, -14], [520, -700, -14], [520, 520, -14], [-700, 520, -14]]), g0 = proj(c, [480, -40, -14]), g1 = proj(c, [140, -40, -14]);
	const wall = (x0: number, x1: number, z0: number, z1: number) => poly(c, [[x0, -700, z0], [x1, -700, z0], [x1, -700, z1], [x0, -700, z1]]);
	const tiles = [...Array.from({length: 14}, (_, i) => poly(c, [[-600 + i * 100, -699, -14], [-600 + i * 100, -699, 640]], false)), ...[86, 186, 286, 386, 486].map((z) => poly(c, [[-600, -699, z], [800, -699, z]], false))].join(' ');
	const pl = proj(c, [150, -560, 520]);
	return <g opacity={o}>
		<defs><filter id="kwB" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="8" /></filter>
			<linearGradient id="kwC" gradientUnits="userSpaceOnUse" x1={g0[0]} y1={g0[1]} x2={g1[0]} y2={g1[1]}><stop offset="0" stopColor="#1E1511" stopOpacity="0" /><stop offset="0.55" stopColor="#1E1511" stopOpacity="0.85" /><stop offset="1" stopColor="#201813" stopOpacity="1" /></linearGradient></defs>
		<g filter="url(#kwB)">
			<path d={wall(-700, 820, -14, 680)} fill="#1C130F" />
			<path d={tiles} stroke="#C8B89A" strokeOpacity={0.08} strokeWidth={3} fill="none" />
			<path d={wall(-700, 820, 560, 580)} fill="#FFE6C0" opacity={0.2} />
			{pl[2] > 0 && <Pool id="kwU" x={pl[0]} y={pl[1]} rx={720} ry={260} a={0.16} col="#FFE2B8" />}
		</g>
		<path d={counter} fill="url(#kwC)" />
		{Array.from({length: 160}, (_, i) => { const q: V3 = [-500 + 640 * rnd(i, 1), -680 + 1150 * rnd(i, 2), -13.9], p = proj(c, q); if (p[2] < 8) return null;
			return <circle key={i} cx={p[0]} cy={p[1]} r={Math.max(0.6, c.f * 1.1 / p[2])} fill="#E8DCC8" opacity={0.04 + 0.06 * rnd(i, 4)} />; })}
		{[-118, 28].map((y, i) => <path key={`r${i}`} d={poly(c, [[-260, y, -9], [216, y, -9]], false)} stroke="#7E8282" strokeOpacity={0.35} strokeWidth={3} fill="none" />)}
		{[-110, -55, 0, 55, 110, 165, 214].map((x) => { const a = poly(c, [[x, -150, -5], [x, 60, -5]], false); return <g key={x} opacity={x > 180 ? 0.4 : 0.75}>
			<path d={a} stroke="#0A0807" strokeOpacity={0.5} strokeWidth={6} fill="none" transform="translate(3,5)" /><path d={a} stroke="#5E6262" strokeWidth={3.2} fill="none" />
			<path d={poly(c, [[x, -150, -4.4], [x, 60, -4.4]], false)} stroke="#C8CCCC" strokeOpacity={0.25} strokeWidth={1.1} fill="none" /></g>; })}
	</g>; };

/** a four-point glint (screen) */
export const Glint: React.FC<{x: number; y: number; r: number; o?: number}> = ({x, y, r, o = 1}) => <g opacity={o}>
	<circle cx={x} cy={y} r={r * 0.9} fill="#FFE6B0" opacity={0.3} />
	<path d={`M${x},${y - r * 1.6} L${x + r * 0.12},${y - r * 0.12} L${x + r * 1.6},${y} L${x + r * 0.12},${y + r * 0.12} L${x},${y + r * 1.6} L${x - r * 0.12},${y + r * 0.12} L${x - r * 1.6},${y} L${x - r * 0.12},${y - r * 0.12} Z`} fill="#FFF8E6" />
	<circle cx={x} cy={y} r={r * 0.22} fill="#FFFFFF" /></g>;

/** a soft pool of light lying on a horizontal plane, drawn in perspective (stacked ellipses, centre brightest) */
export const WPool: React.FC<{c: Cam; x: number; y: number; z: number; rx: number; ry: number; col: string; a: number; n?: number}> = ({c, x, y, z, rx, ry, col, a, n = 22}) => <g>
	{Array.from({length: n}, (_, k) => { const r = 1 - k / n, d = poly(c, Array.from({length: 28}, (_, i) => { const th = i / 28 * 2 * Math.PI; return [x + rx * r * Math.cos(th), y + ry * r * Math.sin(th), z] as V3; }));
		return d ? <path key={k} d={d} fill={col} opacity={a / n} /> : null; })}</g>;

/* ---------- the museum: hall, rope, visitors, the case (plinth, rests, glass hood, title glass), the spot ---------- */
const HZ0 = DZ0;
/** the hood's front glass (y); the old 1.6 m box's pane is gone */
export const PANE_Y = HY0;
const VIS: {a: number; r: number; look: Look4; h: number; tint: number}[] = [
	{a: 14, r: 4500, look: {dress: 'coat', head: 'short'}, h: 1.74, tint: 0}, {a: 38, r: 4800, look: {dress: 'jacket', head: 'bob', legs: 'trousers'}, h: 1.62, tint: 1},
	{a: 62, r: 4500, look: {dress: 'coat', head: 'cap'}, h: 1.78, tint: 2}, {a: 84, r: 4900, look: {dress: 'dress', head: 'long'}, h: 1.6, tint: 0},
	{a: 104, r: 4600, look: {dress: 'jacket', head: 'short', legs: 'trousers'}, h: 1.72, tint: 1}, {a: 128, r: 4800, look: {dress: 'coat', head: 'glasses'}, h: 1.7, tint: 2},
	{a: 96, r: 5200, look: {dress: 'shirt', head: 'child', legs: 'trousers'}, h: 1.12, tint: 0}];
const Visitor: React.FC<{c: Cam; v: typeof VIS[0]; o: number; lite: number}> = ({c, v, o, lite}) => { const a = v.a * DEG, fx = v.r * Math.cos(a), fy = v.r * Math.sin(a);
	const foot = proj(c, [fx, fy, 0]), head = proj(c, [fx, fy, v.h * 1000]); if (foot[2] < 300 || head[2] < 300) return null;
	const hpx = Math.hypot(head[0] - foot[0], head[1] - foot[1]); if (hpx < 8) return null;
	const cen = proj(c, [0, 0, 1000]), flip = cen[0] < foot[0];
	const col = mix(['#22140D', '#26170F', '#1E110B'][v.tint], '#4A3426', lite);
	const k = Math.max(1, hpx / 450);
	return <g opacity={o} transform={`translate(${foot[0]},${foot[1]}) scale(${flip ? -1 : 1},1) translate(${-foot[0]},${-foot[1]})`}>
		<g transform={`translate(${-2.6 * k},${-2 * k})`} opacity={0.45 - 0.27 * lite}><Figure4 x={foot[0]} ground={foot[1]} h={hpx} pose={POSES.stand} look={v.look} col="#E8A860" /></g>
		<Figure4 x={foot[0]} ground={foot[1]} h={hpx} pose={POSES.stand} look={v.look} col={col} /></g>; };
const faceVis = (c: Cam, q: V3, n: V3) => (c.p[0] - q[0]) * n[0] + (c.p[1] - q[1]) * n[1] + (c.p[2] - q[2]) * n[2] > 0;
export const Museum: React.FC<{c: Cam; t: number; hall: number; hood: number; ppl: number; lite?: number; leaf?: number; pool?: number}> = ({c, t, hall, hood, ppl, lite = 0, leaf = 0, pool = 1}) => {
	/* hall: floor pool, two far walls with faint wall-washers, the rope on posts */
	const floor = poly(c, [[-6500, -5500, 0], [6500, -5500, 0], [6500, 5500, 0], [-6500, 5500, 0]]);
	const pc = proj(c, [0, 0, 0]);
	const walls: [V3[], V3][] = [[[[6500, -5500, 0], [6500, 5500, 0], [6500, 5500, 4500], [6500, -5500, 4500]], [-1, 0, 0]], [[[-6500, 5500, 0], [-6500, -5500, 0], [-6500, -5500, 4500], [-6500, 5500, 4500]], [1, 0, 0]],
		[[[-6500, 5500, 0], [6500, 5500, 0], [6500, 5500, 4500], [-6500, 5500, 4500]], [0, -1, 0]], [[[6500, -5500, 0], [-6500, -5500, 0], [-6500, -5500, 4500], [6500, -5500, 4500]], [0, 1, 0]]];
	const washers: V3[] = [[6490, -2600, 2400], [6490, 2600, 2400], [-2800, 5490, 2400], [2800, 5490, 2400], [-6490, -2600, 2400], [-6490, 2600, 2400]];
	const posts = Array.from({length: 12}, (_, i) => { const a = (i / 12) * 2 * Math.PI + 0.31; return [3900 * Math.cos(a), 3900 * Math.sin(a)] as [number, number]; });
	/* the case: the lectern vitrine (display53k), shared with the end hall */
	/* the pommel caption (v3-e: the mirror is gone): on the real pommel, a thin leader from below-right, only while it is in view */
	const pm = proj(c, PF), pr = pm[2] > 30 ? c.f * 18.6 / pm[2] : 0, pIn = pm[2] > 30 && pm[0] > 40 && pm[0] < W - 40 && pm[1] > 40 && pm[1] < H - 40;
	/* the spot: a soft cone from the ceiling onto the case (skipped while the camera is inside it) */
	const apex: V3 = [0, 0, 4300], rb = 640, zc = c.p[2], rAt = rb * (4300 - zc) / (4300 - HZ0), inside = Math.hypot(c.p[0], c.p[1]) < rAt + 250;
	const cone = (() => { if (inside) return null; const pts = [proj(c, apex), ...Array.from({length: 24}, (_, i) => { const a = i / 24 * 2 * Math.PI; return proj(c, [rb * Math.cos(a), rb * Math.sin(a), HZ0]); })];
		if (pts.some((p) => p[2] < 50)) return null;
		const hull = convexHull(pts.map((p) => [p[0], p[1]] as [number, number])); return 'M' + hull.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L') + 'Z'; })();
	const coneO = inside ? 0 : cl((Math.hypot(c.p[0], c.p[1]) - rAt - 250) / 500);
	const visNear: React.ReactNode[] = [], visFar: React.ReactNode[] = [];
	const dc = Math.hypot(c.p[0], c.p[1]);
	VIS.forEach((v, i) => { const a = v.a * DEG, dv = Math.hypot(c.p[0] - v.r * Math.cos(a), c.p[1] - v.r * Math.sin(a)); (dv > dc ? visFar : visNear).push(<Visitor key={i} c={c} v={v} o={ppl} lite={lite} />); });
	return <g>
		<defs><linearGradient id="mCone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE2A8" stopOpacity="0.1" /><stop offset="0.7" stopColor="#FFD08A" stopOpacity="0.04" /><stop offset="1" stopColor="#FFC070" stopOpacity="0.02" /></linearGradient>
			<filter id="mSh" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
			</defs>
		{hall > 0.01 && <g opacity={hall}>
			{floor && <path d={floor} fill={mix('#0C0605', '#1A100B', lite)} />}
			<WPool c={c} x={0} y={0} z={1} rx={2600} ry={2600} col="#FFB868" a={0.11 + 0.1 * lite} />
				{lite > 0.01 && <WPool c={c} x={0} y={0} z={2} rx={1700} ry={1700} col="#FFD494" a={0.3 * lite} n={26} />}
			{walls.map(([q, n], i) => faceVis(c, q[0], n) ? <path key={`w${i}`} d={poly(c, q)} fill={mix('#120A07', '#34221A', lite)} /> : null)}
			{lite > 0.01 && <HallDetail c={c} lite={lite} />}
			{washers.map((q, i) => { const p = proj(c, q); if (p[2] < 600) return null; const r = Math.min(1400, c.f * 900 / p[2]); if (p[0] < -r || p[0] > W + r || p[1] < -2 * r || p[1] > H + 2 * r) return null;
				return <Pool key={i} id={`mw${i}`} x={p[0]} y={p[1]} rx={r * 0.55} ry={r * 1.1} a={0.09 + 0.08 * lite} col="#FFB060" />; })}
			{visFar}
			<g opacity={ppl}>{posts.map(([x, y], i) => { const a = proj(c, [x, y, 0]), b = proj(c, [x, y, 900]); if (a[2] < 200 || b[2] < 200) return null;
				return <path key={`p${i}`} d={`M${a[0]},${a[1]} L${b[0]},${b[1]}`} stroke="#3A2618" strokeWidth={Math.max(1.5, c.f * 40 / a[2])} strokeLinecap="round" />; })}
			{posts.map(([x, y], i) => { const [x2, y2] = posts[(i + 1) % posts.length], pts: V3[] = Array.from({length: 9}, (_, k) => { const u = k / 8; return [lerp(x, x2, u), lerp(y, y2, u), 880 - 160 * Math.sin(Math.PI * u)]; });
				const d = poly(c, pts, false); return d ? <path key={`rp${i}`} d={d} fill="none" stroke="#6A2C1A" strokeOpacity={0.55} strokeWidth={Math.max(1, c.f * 16 / Math.max(300, proj(c, pts[4])[2]))} /> : null; })}</g>
		</g>}
		{cone && <path d={cone} fill="url(#mCone)" opacity={coneO * hall} />}
		<DisplayBack c={c} lite={lite} hood={hood} id="m" leaf={leaf} pool={pool} />
		{visNear}
	</g>; };
/** convex hull (monotone chain) of screen points */
const convexHull = (P: [number, number][]) => { const p = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
	const lo: [number, number][] = [], up: [number, number][] = [];
	for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
	for (const q of p.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
	return lo.slice(0, -1).concat(up.slice(0, -1)); };


/* ---------- gallery detail (fades in after the title, 9.9–11.2 s, and out again before the dive): tile joints, skirting, lit label
   panels and a wall vitrine on each far wall, so the hall reads as a museum gallery ---------- */
type WallDef = {q: (u0: number, u1: number, z0: number, z1: number) => V3[]; n: V3; panels: [number, number][]};
const WALLS: WallDef[] = [
	{q: (u0, u1, z0, z1) => [[6495, u0, z0], [6495, u1, z0], [6495, u1, z1], [6495, u0, z1]], n: [-1, 0, 0], panels: [[-3800, -1800], [1800, 3800]]},
	{q: (u0, u1, z0, z1) => [[-6495, u0, z0], [-6495, u1, z0], [-6495, u1, z1], [-6495, u0, z1]], n: [1, 0, 0], panels: [[-3800, -1800], [1800, 3800]]},
	{q: (u0, u1, z0, z1) => [[u0, 5495, z0], [u1, 5495, z0], [u1, 5495, z1], [u0, 5495, z1]], n: [0, -1, 0], panels: [[-5200, -3000], [-1000, 1000], [3000, 5200]]},
	{q: (u0, u1, z0, z1) => [[u0, -5495, z0], [u1, -5495, z0], [u1, -5495, z1], [u0, -5495, z1]], n: [0, 1, 0], panels: [[-5200, -3000], [-1000, 1000], [3000, 5200]]}];
const HallDetail: React.FC<{c: Cam; lite: number}> = ({c, lite}) => {
	const tiles = [...Array.from({length: 13}, (_, i) => poly(c, [[-6000 + i * 1000, -5400, 0.5], [-6000 + i * 1000, 5400, 0.5]], false)), ...Array.from({length: 11}, (_, i) => poly(c, [[-6400, -5000 + i * 1000, 0.5], [6400, -5000 + i * 1000, 0.5]], false))].filter(Boolean).join(' ');
	return <g>
		<path d={tiles} stroke="#8A6444" strokeOpacity={0.07 * lite} strokeWidth={2} fill="none" />
		{WALLS.map((w, wi) => { const wp = w.q(0, 0, 0, 0)[0]; if (!faceVis(c, wp, w.n)) return null;
			return <g key={wi}>
				{poly(c, w.q(-6400, 6400, 0, 260)) && <path d={poly(c, w.q(-6400, 6400, 0, 260))} fill="#5A3C28" opacity={0.5 * lite} />}
				{poly(c, w.q(-6400, 6400, 258, 266)) && <path d={poly(c, w.q(-6400, 6400, 258, 266))} fill="#E8B878" opacity={0.35 * lite} />}
				{w.panels.map(([u0, u1], pi) => <g key={pi}>
					<path d={poly(c, w.q(u0, u1, 950, 2450))} fill="#4A3122" opacity={0.7 * lite} />
					<path d={poly(c, w.q(u0 + 120, u1 - 120, 1070, 2330))} fill="#8A6444" opacity={0.3 * lite} />
					{[0, 1, 2, 3, 4, 5].map((k) => { const z = 2160 - k * 170, d = poly(c, [[...w.q(u0 + 280, u0 + 280, z, z)[0]] as V3, [...w.q(u1 - 280 - (k === 5 ? 500 : 0), u1 - 280, z, z)[1]] as V3], false); return d ? <path key={k} d={d} stroke="#F2D9AE" strokeOpacity={0.3 * lite} strokeWidth={Math.max(2, 70 * c.f / 8000 / 3)} fill="none" /> : null; })}
				</g>)}
				{wi >= 2 && poly(c, w.q(-700, 700, 520, 1500)) && <g><path d={poly(c, w.q(-780, 780, 480, 1560))} fill="#2A1A10" opacity={0.8 * lite} /><path d={poly(c, w.q(-700, 700, 520, 1500))} fill="#C8905A" opacity={0.3 * lite} /></g>}
			</g>; })}
	</g>; };

/* ---------- dust motes drifting in the case spot (their own slow clock; never on the beat) ---------- */
const Motes: React.FC<{c: Cam; t: number; o: number}> = ({c, t, o}) => { if (o <= 0.01) return null;
	return <g opacity={o}>{Array.from({length: 46}, (_, i) => { const a = rnd(i, 51) * 2 * Math.PI, r = 950 * Math.sqrt(rnd(i, 52)), z0 = 1000 + 1700 * rnd(i, 53);
		const q: V3 = [r * Math.cos(a) + 60 * Math.sin(t * 0.21 + i), r * Math.sin(a) + 50 * Math.cos(t * 0.17 + i * 1.7), 1000 + ((z0 - 1000 - 22 * t) % 1700 + 1700) % 1700];
		const p = proj(c, q); if (p[2] < 350 || p[0] < -10 || p[0] > W + 10 || p[1] < -10 || p[1] > H + 10) return null;
		const tw = 0.5 + 0.5 * Math.sin(t * (0.6 + rnd(i, 54)) + i * 2.3);
		return <circle key={i} cx={p[0]} cy={p[1]} r={Math.min(2.6, Math.max(0.8, c.f * 1.6 / p[2]))} fill="#FFE8C0" opacity={(0.18 + 0.3 * tw) * Math.min(1, (p[2] - 350) / 400)} />; })}</g>; };

/* ---------- the glass: the hood's near faces, edges and streak, drawn OVER the sword (display53k); same envelope as the case ---------- */
const PaneStreaks: React.FC<{c: Cam; t: number}> = ({c, t}) => { const o = sstep(seg(t, 0.9, 2.2)) * (1 - sstep(seg(t, 20.1, 20.65)));
	return o > 0.01 ? <g opacity={o}><DisplayFront c={c} hood={sstep(seg(t, 6.6, 8.4))} leaf={leafAt(t)} /></g> : null; };
/** the title glass (display53k.TitleLeaf): in with the hood, gone once the title has slid off (the orbit carries it away) */
const leafAt = (t: number) => sstep(seg(t, 6.6, 8.4)) * (1 - sstep(seg(t, 11.7, 12.5)));

/* ---------- the title etched on the FRONT glass (the title leaf on the hood's front pane), facing the camera, in front of the sword
   (world rectangle; the master maps the HTML plaque onto its projection) ---------- */
export const TITLE_W = DTITLE_W, TITLE_H = DTITLE_H;            // mm, the whole source sheet (1400 × 640 px; the plaque 1080 × 404 inside)
export const TITLE_C: V3 = [0, DTITLE_Y, DTITLE_Z];
export const titleQuad = (t: number): [number, number][] | null => { if (t < 9.5 - 1e-6 || t >= 11.764) return null; return titleQuadOn(camAt(t)); };

/* ---------- the sword: sword3d.Sword3D (the one 3-D sword: BladeLand blade clipped at the guard, Guard3D, Hilt3D with the ringed
   end face of face53, painted in the order the camera's place along the axis gives) ---------- */
const SW = (a: number, y: number, z: number): V3 => [SP.x0 + SP.dir * a, SP.ya + y, SP.z0 + z];
export const facePt = (c: Cam) => (r: number, th: number): [number, number] => { const p = proj(c, [SP.x0 + SP.dir * -0.2, SP.ya + r * Math.cos(th), SP.z0 + r * Math.sin(th)]); return [p[0], p[1]]; };
const SwordW: React.FC<{c: Cam; t: number; o: Parameters<typeof BladeLand>[0]['o']; ringGlow?: number; id: string; lite?: number}> = ({c, t, o, ringGlow, id, lite}) => {
	void t; return <Sword3D c={c} sp={SP} id={id} ringGlow={ringGlow} land={{...o, guardCut: true}} lite={lite} />; };


/* ---------- the hall orbit's bloom + rim (11.4 → 17.2): the blade is the brightest thing in the hall ---------- */
const BladeBloom: React.FC<{c: Cam; t: number}> = ({c, t}) => { const e = sstep(seg(t, 11.4, 12.4)) * (1 - sstep(seg(t, 16.4, 17.2))); if (e < 0.01) return null;
	const N = 16, R: V3[] = [], L: V3[] = [];
	for (let i = 0; i <= N; i++) { const s = LBM * i / N, h = hwAt(s) * 0.92; R.push(bw(SP, s, h, 3.4)); L.push(bw(SP, s, -h, 3.4)); }
	const body = poly(c, [...R, ...L.slice().reverse()]), hilt = poly(c, [SW(4, 0, 4), SW(A_BL - 4, 0, 4)], false), rimR = poly(c, R, false), rimL = poly(c, L, false);
	const f = c.f / Math.max(300, toCam(c, bw(SP, LBM / 2, 0))[2]);
	return <g opacity={e}>
		<defs><filter id="bbF" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="15" /></filter></defs>
		<g filter="url(#bbF)" style={{mixBlendMode: 'screen'}}>{body && <path d={body} fill="#FFC870" opacity={0.55} stroke="#FFC870" strokeWidth={Math.max(6, f * 7)} strokeOpacity={0.5} strokeLinejoin="round" />}
			{hilt && <path d={hilt} stroke="#FFC870" strokeOpacity={0.5} strokeWidth={Math.max(8, f * 18)} strokeLinecap="round" fill="none" />}</g>
		{rimR && <path d={rimR} stroke="#FFE2A8" strokeOpacity={0.8} strokeWidth={Math.max(1.4, f * 1.4)} fill="none" />}
		{rimL && <path d={rimL} stroke="#FFD08A" strokeOpacity={0.55} strokeWidth={Math.max(1.2, f * 1.1)} fill="none" />}</g>; };

/* ---------- the guard's blue glass (rise over the guard, 4.7–6.6 s): a soft specular band slides across each pane as the view angle
   changes (continuous, view-driven, never on the beat), and one star glint lands on beat 10 (5.6605 s) ---------- */
const GG_A0 = 84.5, GG_A1 = 99, GG_BEAT = 5.6605;
const ggPt = (s: number, a: number, k: number): V3 => { const u = (a - GG_A0) / (GG_A1 - GG_A0), ye = lerp(22.8, 24.8, u);
	return [SP.x0 + a, SP.ya + s * lerp(2.6, ye, k), SP.z0 + lerp(6.2, 3.8, u) + 0.45]; };
const GuardGlints: React.FC<{c: Cam; t: number}> = ({c, t}) => { if (t < 4.6 || t > 6.8) return null;
	const env = sstep(seg(t, 4.65, 5.1)) * (1 - sstep(seg(t, 6.0, 6.7)));
	const band = (s: 1 | -1, lag: number, key: string) => { const u = sstep(seg(t - lag, 4.7, 6.3)), a = lerp(GG_A0 - 1, GG_A1 + 3, u), w = 3.2;
		const q = (a0: number, a1: number, k0: number, k1: number, ww: number): V3[] => [ggPt(s, Math.max(GG_A0, a0 - ww), k0), ggPt(s, Math.min(GG_A1, a1 + ww), k0), ggPt(s, Math.min(GG_A1, a1 + ww), k1), ggPt(s, Math.max(GG_A0, a0 - ww), k1)];
		if (a < GG_A0 - w || a > GG_A1 + w) return null;
		const wide = poly(c, q(a, a, 0, 1, w * 1.8)), core = poly(c, q(a, a, 0, 1, w * 0.6));
		return <g key={key}>{wide && <path d={wide} fill="#BFE0FF" opacity={0.26 * env} />}{core && <path d={core} fill="#F2FAFF" opacity={0.6 * env} />}</g>; };
	const gp = proj(c, ggPt(1, 91, 0.7)), gl = t >= GG_BEAT - 1e-6 ? Math.exp(-(t - GG_BEAT) / 0.2) : 0, r = Math.max(22, Math.min(40, c.f * 0.3 / Math.max(10, gp[2] / 100)));
	return <g>{band(1, 0, 'a')}{band(-1, 0.14, 'b')}{gl > 0.03 && gp[2] > 5 && <Glint x={gp[0]} y={gp[1]} r={r} o={gl} />}</g>; };

/* ---------- lights (directions toward the light) ---------- */
const L_RAKE: V3 = [-0.92, -0.32, 0.22];      // the raking warm key, low and ahead-right of the glide
/* in the glide the rake is a lamp low and ahead (toward the guard): its highlight runs ON the ridge and the pale cells' rims a
   little ahead of the lens, brightest near the lamp, falling off with distance */
const L_LAMP: V3 = [-470, -30, 1150];
const L_SPOT: V3 = [0.08, -0.28, 0.96];       // the case spot from above, a little to the front

/* ---------- THE TAKE, legs 1–6 ---------- */
export const TakeA: React.FC<{t: number}> = ({t}) => {
	const c = camAt(t), ck = toKitchen(c);
	/* hook: frame-0 glint (KF01), rust bloom on DA(0) = 0.443 (complete on f13), focus pull to the bronze, the kitchen falls away */
	const rho = 0.68 + 0.22 * sstep(seg(t, 0.443 - 0.23, 0.443)) + 0.05 * seg(t, 0.45, 1.4);
	const kitO = 1 - sstep(seg(t, 0.5, 1.35)), knifeO = 1 - sstep(seg(t, 1.15, 1.5));
	const farBlur = 2.6 * (1 - sstep(seg(t, 0.12, 0.9))), knifeBlur = 4.5 * sstep(seg(t, 0.35, 1.05));
	/* the light: the raking key in the glide, the case spot from above as the camera rises */
	const kSpot = sstep(seg(t, 5.0, 8.0)), kRake = 1 - 0.75 * kSpot;
	const lights: Light[] = [{dir: L_RAKE, k: 1.7 * kRake, pos: L_LAMP, d0: 600}, {dir: L_SPOT, k: 0.55 + 0.6 * kSpot}];
	/* depth of field in the glide only */
	const glide = t < 6.4;
	const dof = glide ? {near: 34, far: 260 + 600 * seg(t, 4.6, 6.4), nb: '2 9', fb: 1.3 * (1 - seg(t, 4.8, 6.2))} : undefined;
	const fog = t < 6.8 ? {d0: 60, D: 300 + 3000 * sstep(seg(t, 4.2, 6.8)), col: '#1E100B'} : undefined;
	/* S3: the sheen on the lull hit 18.557 (f557), base → tip; the rings catch light as the push ends */
	const sh = t >= 18.557 - 1e-6 ? {pos: lerp(-0.08, 1.12, seg(t, 18.557, 19.25)), k: 0.95 * (1 - seg(t, 19.0, 19.35))} : undefined;
	const ringGlow = 0.5 * sstep(seg(t, 19.6, 20.6));
	const hall = sstep(seg(t, 7.2, 9.2)) * (1 - sstep(seg(t, 19.9, 20.6))), ppl = sstep(seg(t, 11.3, 12.9)) * (1 - sstep(seg(t, 19.9, 20.6)));
	const plinthO = 1 - sstep(seg(t, 20.1, 20.65));
	const hood = sstep(seg(t, 6.6, 8.4));
	const lite = sstep(seg(t, 9.9, 11.3)) * (1 - sstep(seg(t, 17.0, 18.8)));
	const caseO = sstep(seg(t, 0.9, 2.2));
	const lift = 0.3 * (1 - sstep(seg(t, 0.5, 1.5))) + 0.16 * sstep(seg(t, 6.0, 8.5)) + 0.22 * lite;
	/* hits */
	const g0 = proj(c, [244, -18, 1004.2]), g0o = Math.exp(-t / 0.4) * (1 - seg(t, 0.6, 1.0));
	/* [亮] on 2.707 (f81) — fix4-a, the owner's 0:03 note: the lamp's light lies on the polished bronze as a broad soft specular LOBE
	   (land53 `lobe`, ≈ 460 × 170 px) on the pale diamonds 2–3 cells ahead of the lens, the dark lattice breaking it; in over 0.25 s,
	   peak ON f81, out over 0.8 s, on a faint resting sheen through the glide. No white ridge stripe, no star sparkles. */
	const ltF = Math.round(2.707 * 30) / 30, lobeK = t < ltF ? 0.28 + 0.72 * sstep(seg(t, ltF - 0.25, ltF)) : 0.28 + 0.72 * (1 - sstep(seg(t, ltF, ltF + 0.8)));
	const lobeE = sstep(seg(t, 1.2, 1.9)) * (1 - sstep(seg(t, 4.9, 5.7))) * lobeK;
	const glintK = sstep(seg(t, 6.2, 7.4));   // the pale-cell glints only once the camera has risen out of the glide
	/* KF01's bokeh along the far edge, gone as the focus pulls */
	const bok = [[250, 22, 0.34], [330, 17, 0.28], [420, 13, 0.24], [520, 10, 0.2]].map(([x, r, a], i) => { const p = proj(c, kitInv([x, 0, 2])); return p[2] > 10 ? <circle key={i} cx={p[0]} cy={p[1]} r={r} fill="#FFD890" opacity={a * (1 - seg(t, 0.15, 0.7))} /> : null; });
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		<defs>
			<filter id="tFar" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={Math.max(0.01, farBlur)} /></filter>
			<filter id="tKn" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={Math.max(0.01, knifeBlur)} /></filter>
			<filter id="tBok" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6" /></filter>
		</defs>
		<Ground53 id="tA" k={lerp(1, 0.35, sstep(seg(t, 4, 8)))} sheen={0.3 + 0.2 * Math.sin(c.yaw)} />
		<KitchenW c={ck} o={kitO} />
		{lite > 0.01 && <g opacity={lite}><Scrim id="sbs" x={620} y={230} rx={860} ry={260} a={0.5} /></g>}
		<g opacity={caseO * plinthO}><Museum c={c} t={t} hall={hall} hood={hood} ppl={ppl} lite={lite} leaf={leafAt(t)} /></g>
		{t < 1.2 && <g opacity={1 - caseO}>
			<Pool id="tk1d" x={proj(c, [0, 0, 1000])[0]} y={proj(c, [0, 0, 1000])[1]} rx={560} ry={330} a={0.75 * kitO} col="#080403" />
			<Pool id="tk1s" x={proj(c, [0, 0, 1000])[0] - 20} y={proj(c, [0, 0, 1000])[1] + 10} rx={360} ry={200} a={0.34} col="#FFB868" /></g>}
		<g filter={farBlur > 0.05 ? 'url(#tFar)' : undefined}>
			<SwordW c={c} t={t} id="tw" ringGlow={ringGlow} lite={lite} o={{lights, dof, fog, sheen: sh, shin: glide ? 60 : 90, sMin: -20, lift, lobe: lobeE > 0.004 ? {y: 640, k: lobeE, rx: 230, ry: 85} : undefined, glints: glintK}} />
		</g>
		<BladeBloom c={c} t={t} />
		<GuardGlints c={c} t={t} />
		{t < 0.75 && <g filter="url(#tBok)">{bok}</g>}
		{g0o > 0.01 && g0[2] > 10 && <Glint x={g0[0]} y={g0[1]} r={26} o={g0o} />}
		{knifeO > 0.01 && <g opacity={knifeO} filter={knifeBlur > 0.05 ? 'url(#tKn)' : undefined}><Cleaver c={ck} rho={rho} /></g>}
		<Motes c={c} t={t} o={hall * plinthO} />
		<PaneStreaks c={c} t={t} />
		<Vignette id="tA" a={0.6} />
		<DuoTag c={c} t={t} />
		<RingTag c={c} t={t} />
	</svg>; };
const kitInv = (q: V3): V3 => [506 - q[0], -q[1] - 19, q[2] + 1002.2];   // kitchen → case (its own inverse in x, y)

/* ---------- S3: 「镀铬？」 hangs beside the blade from the lull hit (18.557) — a question tag, never struck ---------- */
const DuoTag: React.FC<{c: Cam; t: number}> = ({c, t}) => { if (t < 18.557 - 1e-6 || t > 19.8) return null;
	const o = 1 - sstep(seg(t, 19.2, 19.7)); const to = proj(c, bw(SP, 233, 14));
	/* v3.1: placed for the new S3 camera — below-left of its blade point, its left end kept inside the safe area (x ≥ 120) */
	const at = proj(camAt(18.6), bw(SP, 233, 14)), x = Math.max(at[0] - 150, 300), y = at[1] + 200;
	/* the leader only while its blade point is in frame and not hidden behind the pommel's end face */
	const fc = proj(c, PF), fr = fc[2] > 1 ? c.f * R_FACE / fc[2] : 0, hidden = c.p[0] < PF[0] && to[2] > fc[2] && Math.hypot(to[0] - fc[0], to[1] - fc[1]) < fr * 1.15;
	const vis = !hidden && to[2] > 20 && to[0] > -40 && to[0] < W + 40 && to[1] > -40 && to[1] < H + 40;
	return <Tag id="duo" x={x} y={y} s="镀铬？" fs={56} anchor="end" to={vis ? [to[0] - 12, to[1] + 10] : undefined} col={B.cream} o={o} />; };
/* ---------- fix4-a (#13): 「剑首 · 11道同心圆」 labels the ring close-up itself (19.3 → 20.7), at the 44 px label size, bottom-left —
   clear of the Cr tile (x 1345–1790, y 683–897), the subtitles and 「镀铬？」 (gone by 19.7); fixed place, a leader to the rings ---------- */
const RingTag: React.FC<{c: Cam; t: number}> = ({c, t}) => { if (t < 19.3 || t > 20.75) return null;
	const o = sstep(seg(t, 19.45, 19.8)) * (1 - sstep(seg(t, 20.35, 20.7))); if (o < 0.004) return null;
	const pm = proj(c, PF), pr = pm[2] > 30 ? c.f * 18.6 / pm[2] : 0, to: [number, number] = [pm[0] - 0.62 * pr, pm[1] + 0.62 * pr];
	const vis = pr > 20 && to[0] > 140 && to[0] < W - 140 && to[1] > 80 && to[1] < H - 80 && to[1] < 900;
	return <Tag id="ring" x={620} y={962} s="剑首 · 11道同心圆" fs={44} anchor="end" col={B.cream} scrim={0.5} to={vis ? to : undefined} o={o} />; };
void hwAt; void LBM; void mix; void blobOn; void rnd;
