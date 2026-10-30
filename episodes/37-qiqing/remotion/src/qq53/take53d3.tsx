import React from 'react';
import {W, H, seg, lerp, rnd} from '../qq50/kit50';
import {B, Lacquer, Vignette, Pool} from '../qq50/styleB';
import {Cam, V3, Scrim, Tag, proj, poly, lookAt} from './parts53';
import {sstep, spline, HK} from './cam53';
import {Pit, Chamber, Air, Labels, LAY, otherAt} from './world53d';
import {worldCam, CaseW, GlassPass, toMM, CASE_X} from './scene53d';
import {HallBack, CaseHall, FloorD} from './hall53d';
import {MacroLeg, MACRO_END} from './macro53d';
import {TakeA, camAt} from './take53';
import {CleaverK} from './cleaver53k';
import {Glint} from './kfA53';
import {EndCard3, CARD_F3} from './end53d3';
import {frame3} from './v3map53';
/* ep53 v3 TakeD3, 111.389 → 145.333 (MUSIC_NOTES_v3 rows 23–30; tasks/ep53-v3-d/out/selfcheck.md):
   T1 T2 111.389  the hand-off macro, blooms 111.389 / 111.955 / 113.087 ON the surface; the find-ring opens onto the sheath's mouth;
   T3    117.616  the rewind: the sword slides back into its sheath (hilt screen-right, the draw run backwards), settles on 120.446;
   E1    122.144  the tomb's other swords light one per half-bar (122.711 / 123.843 / 124.975);
   L1    125.540  round to the front of the cut-away, the six layers close one per beat from 126.108, the air; up to the surface;
   R2    130.069  the floor is the top of the fill: up to the display; the bronze a shade duller, one faint rust spot;
   P1    134.031  the pull-back along the blade to frame 0's framing (≈138.5): the kitchen comes back as the reflection; held;
   END   140.824  the card (J on f4225), 4.0 s, 0.5 s fade to black.
   T1 … R2 reuse the v2 TakeD world (world53d, scene53d, hall53d, macro53d) through a monotone C1 time map v3 → v2 whose knots are
   the hits, so every hit lands ON its v3 frame. */

/* ---------- the time map v3 → v2 (cam53's monotone C1 Hermite through the hits) ---------- */
const KN: HK[] = [[111.389, 75.162], [111.955, 75.728], [113.087, 76.86], [113.4, 77.173], [117.616, MACRO_END], [120.446, 84.219],
	[122.711, 86.483], [123.843, 87.615], [124.975, 88.747], [126.108, LAY.sheath], [126.674, LAY.inner], [127.24, LAY.outer], [127.806, LAY.guo],
	[128.372, LAY.bai], [128.938, LAY.hang], [130.069, 94.95], [131.2, 95.9], [132.3, 99.4], [133.4, 101.0], [134.031, 101.6]];
export const v2Of = spline(KN);

/* ---------- v3 times ---------- */
export const T3 = {T1: 111.389, REW: 117.616, R2: 130.069, P1: 134.031, HOME: 138.5, CARD: 140.824};
const drawAt = (t2: number) => 36 * Math.pow(1 - seg(t2, MACRO_END, 84.219), 2);
const litAt = (t2: number) => 1 - 0.35 * seg(t2, LAY.sheath, LAY.hang);
const LITE = 0.9;
/** v3.1 E1: the 「其他剑」 tag (44 px), right of the side compartment, clear of the subtitle and the stamp */
const E1TAG: [number, number] = [1330, 400], E1HIT = [122.711, 123.843, 124.975];

/* ---------- frame 0's camera in this world (metres; the museum frame is shifted by CASE_X) and the pull-back to it ---------- */
const X = CASE_X * 1000;
const C0 = camAt(0), C0W: Cam = {...C0, p: [(C0.p[0] + X) / 1000, C0.p[1] / 1000, C0.p[2] / 1000]};
/** v3.1 R2 → P1 (owner: "the transition camera move is a bit weird"): ONE calm move, look-at channels (eye P, target T, log f,
    principal point), C1 monotone Hermite. The v2 rise into the museum runs to the case hold (R2A); from there the eye comes in to a
    close view of the dulling blade (R2C = the P1 start, 134.031: the blade across the frame, the rust spot inside it) without
    stopping, and goes on DOWN THE BLADE'S OWN LINE toward the tip while it pulls back and turns to look back along the sword:
    the target slides along the blade (guard side → near the tip), the eye passes the hood's tip-end corner (its glass streak
    carries the dissolve to the kitchen) and settles, at rest, on frame 0's camera at HOME. Every channel is monotone from R2C
    to HOME (no arc, no swing); the sword stays in frame throughout. */
const R2A = 131.9, R2C = T3.P1;
const BLADE_Z = 1.002;
/** the eye and a target on the view ray (where it meets the sword's plane z = BLADE_Z) of a Cam */
const eyeTgt = (c: Cam): number[] => { const F = [Math.cos(c.pitch) * Math.cos(c.yaw), Math.cos(c.pitch) * Math.sin(c.yaw), -Math.sin(c.pitch)], s = (c.p[2] - BLADE_Z) / Math.max(0.05, -F[2]);
	return [c.p[0], c.p[1], c.p[2], c.p[0] + s * F[0], c.p[1] + s * F[1], BLADE_Z, Math.log(c.f), c.cx, c.cy]; };
const PCH = (() => { const a = eyeTgt(worldCam(v2Of(R2A))), a0 = eyeTgt(worldCam(v2Of(R2A - 1 / 30))), b = eyeTgt(C0W);
	/* the close view of the dulling blade: the whole sword across the frame, the eye ~0.55 m off it, in front and above */
	const m = [-0.461, -0.493, 1.224, -0.51, 0.0, BLADE_Z, Math.log(1350), lerp(960, 900, 0.3), lerp(540, 560, 0.3)];
	return a.map((_, i) => spline([[R2A, a[i], (a[i] - a0[i]) * 30], [R2C, m[i]], [T3.HOME, b[i], 0]])); })();
const p1Cam = (t: number): Cam => { const v = PCH.map((f) => f(Math.min(t, T3.HOME)));
	return lookAt([v[0], v[1], v[2]], [v[3], v[4], v[5]], Math.exp(v[6]), v[7], v[8]); };
/** the camera of the take (world metres) for t ≥ the rewind */
export const camD3 = (t: number): Cam => (t < R2A ? worldCam(v2Of(t)) : p1Cam(t));

/* ---------- the kitchen as frame 0 draws it (take53 KitchenW, copied: take53 does not export it), in the kitchen frame ---------- */
const kit = (q: V3): V3 => [506 - q[0], -q[1] - 19, q[2] - 1002.2];   // case → kitchen (take53)
const toKitchen = (c: Cam): Cam => ({...c, p: kit(c.p), yaw: c.yaw + Math.PI});
const KitchenW: React.FC<{c: Cam; o: number}> = ({c, o}) => { if (o <= 0.01) return null;
	const counter = poly(c, [[-700, -700, -14], [520, -700, -14], [520, 520, -14], [-700, 520, -14]]), g0 = proj(c, [480, -40, -14]), g1 = proj(c, [140, -40, -14]);
	const wall = (x0: number, x1: number, z0: number, z1: number) => poly(c, [[x0, -700, z0], [x1, -700, z0], [x1, -700, z1], [x0, -700, z1]]);
	const tiles = [...Array.from({length: 14}, (_, i) => poly(c, [[-600 + i * 100, -699, -14], [-600 + i * 100, -699, 640]], false)), ...[86, 186, 286, 386, 486].map((z) => poly(c, [[-600, -699, z], [800, -699, z]], false))].join(' ');
	const pl = proj(c, [150, -560, 520]);
	return <g opacity={o}>
		<defs><filter id="kwB3" filterUnits="userSpaceOnUse" x={-200} y={-200} width={W + 400} height={H + 400}><feGaussianBlur stdDeviation="8" /></filter>
			<linearGradient id="kwC3" gradientUnits="userSpaceOnUse" x1={g0[0]} y1={g0[1]} x2={g1[0]} y2={g1[1]}><stop offset="0" stopColor="#1E1511" stopOpacity="0" /><stop offset="0.55" stopColor="#1E1511" stopOpacity="0.85" /><stop offset="1" stopColor="#201813" stopOpacity="1" /></linearGradient></defs>
		<g filter="url(#kwB3)">
			<path d={wall(-700, 820, -14, 680)} fill="#1C130F" />
			<path d={tiles} stroke="#C8B89A" strokeOpacity={0.08} strokeWidth={3} fill="none" />
			<path d={wall(-700, 820, 560, 580)} fill="#FFE6C0" opacity={0.2} />
			{pl[2] > 0 && <Pool id="kwU3" x={pl[0]} y={pl[1]} rx={720} ry={260} a={0.16} col="#FFE2B8" />}
		</g>
		<path d={counter} fill="url(#kwC3)" />
		{Array.from({length: 160}, (_, i) => { const q: V3 = [-500 + 640 * rnd(i, 1), -680 + 1150 * rnd(i, 2), -13.9], p = proj(c, q); if (p[2] < 8) return null;
			return <circle key={i} cx={p[0]} cy={p[1]} r={Math.max(0.6, c.f * 1.1 / p[2])} fill="#E8DCC8" opacity={0.04 + 0.06 * rnd(i, 4)} />; })}
		{[-118, 28].map((y, i) => <path key={`r${i}`} d={poly(c, [[-260, y, -9], [216, y, -9]], false)} stroke="#7E8282" strokeOpacity={0.35} strokeWidth={3} fill="none" />)}
		{[-110, -55, 0, 55, 110, 165, 214].map((x) => { const a = poly(c, [[x, -150, -5], [x, 60, -5]], false); return <g key={x} opacity={x > 180 ? 0.4 : 0.75}>
			<path d={a} stroke="#0A0807" strokeOpacity={0.5} strokeWidth={6} fill="none" transform="translate(3,5)" /><path d={a} stroke="#5E6262" strokeWidth={3.2} fill="none" />
			<path d={poly(c, [[x, -150, -4.4], [x, 60, -4.4]], false)} stroke="#C8CCCC" strokeOpacity={0.25} strokeWidth={1.1} fill="none" /></g>; })}
	</g>; };

/* ---------- the world at v3 time t: the tomb (under the floor) and the museum (above), seen by camera c ---------- */
const World3: React.FC<{t: number; t2: number; c: Cam; mus?: number; dull?: number; spot?: number; dim?: number; refl?: React.ReactNode}> = ({t, t2, c, mus = 1, dull = 0, spot = 0, dim = 0, refl}) => {
	/* v3.1: the plinth and the hood go WITH the hall (no pop); the hall's walls and floor a little ahead of the case */
	/* the case's own light (display53k's deck pool: its rings break up as the eye passes over the deck) eases off first, 134.3–135.3 */
	const caseL = 1 - sstep(seg(t, 134.0, 135.0));   // gone (pool included) by 135.0: the rings drop out of view at 135.03
	const caseO = mus, hallO = mus * (1 - sstep(seg(t, 134.5, 137.0)));
	const cm = toMM(c), under = c.p[2] < 0.03, k = sstep(seg(t2, 94.9, 96.3)), museum = t2 > 93.9;
	return <g>
		{!under && hallO > 0.01 && <g opacity={hallO}><FloorD c={c} cm={cm} k={k} lite={LITE} /></g>}
		{museum && <>
			{hallO > 0.01 && <g opacity={hallO}><HallBack cm={cm} hall={1} lite={LITE} /></g>}
			{caseO > 0.01 && <g opacity={caseO}><CaseHall cm={cm} t={t2} hood={1} lite={LITE * caseL} pool={caseL} /></g>}
			{/* v3.1 P1: the kitchen first seen in the hood's glass streak (its reflection), over the hall, under the sword */}
			{refl}
			{/* fix4-d #8: no star on the display sword (130.069 → the kitchen): the line is 「变暗」; only frame 0's glint returns, at home */}
			<CaseW c={c} t={t2} id="d3" dull={dull} bloom={spot} rim={0} ring={0} front={mus} glint={0} dim={dim} />
		</>}
		{under && <>
			<Pit c={c} t={t2} />
			<Chamber c={c} t={t2} draw={drawAt(t2)} lit={litAt(t2)} />
			<Air c={c} t={t2} />
			{museum && <path d={poly(c, [[-40, 0, 0], [40, 0, 0]], false)} stroke="#EDE6D2" strokeOpacity={0.4} strokeWidth={2} fill="none" />}
			<Labels c={c} t={t2} />
		</>}
		{t < T3.HOME && <GlassPass c={c} id="d3" />}
	</g>; };

export const TakeD3: React.FC<{t: number}> = ({t}) => {
	const f = frame3(t);
	/* T1, T2: the macro (v2 TakeD leg 13), the portal opening onto the tomb world at the rewind's first frame */
	if (t < T3.REW) { const t2 = v2Of(t); return <MacroLeg t={t2} world={() => <World3 t={T3.REW} t2={MACRO_END} c={worldCam(MACRO_END)} />} />; }
	/* the held kitchen = frame 0 itself (TakeA at 0) from HOME, under the end card */
	const home = sstep(seg(t, T3.HOME - 0.3, T3.HOME));
	if (home >= 1) return <>{<TakeA t={0} />}{f >= CARD_F3 - 6 && <EndCard3 t={t} />}</>;
	const t2 = t < T3.P1 ? v2Of(t) : 102.332, c = camD3(t);
	/* R2: a shade duller from the floor on (warm veil), one faint rust spot; P1: the hall and the hood go, the kitchen comes back */
	const dull = 0.9 * sstep(seg(t, 130.6, 132.4)), spot = sstep(seg(t, 132.0, 132.6)), dim = sstep(seg(t, 131.4, 133.0)) * (1 - sstep(seg(t, 137.0, 138.3)));   // eases off as frame 0's kitchen returns (no pop at home)
	/* v3.1: the hall dissolves to the kitchen as the eye passes the hood's tip-end corner: the hood's glass streak sweeps across the
	   frame (right → left, with the turn) and the kitchen shows first inside it, as its reflection, then everywhere */
	/* producer v3.1: the masked reflection layer exists from the surface (130.069) on, so its first visible frame (135.0) is not a re-raster pop */
	const mus = 1 - sstep(seg(t, 134.8, 137.8)), kitO = sstep(seg(t, 135.0, 138.0)), sw = seg(t, 135.0, 137.6), swO = Math.sin(Math.PI * sw), swX = lerp(560, -540, sstep(sw));   // ≤ 21 px per frame
	const streak = `M${1180 + swX},-80 L${1560 + swX},-80 L${980 + swX},1160 L${600 + swX},1160 Z`;
	const cMus: Cam = {...toMM(c), p: [c.p[0] * 1000 - X, c.p[1] * 1000, c.p[2] * 1000]}, ck = toKitchen(cMus);
	/* frame 0's look arrives with the kitchen: the dark and warm pools round the case centre, the far blur, the glint at the tip (take53) */
	const q0 = proj(cMus, [0, 0, 1000]), g0 = proj(cMus, [244, -18, 1004.2]), blur = 2.6 * sstep(seg(t, 136.8, 138.3)), g0o = sstep(seg(t, 137.4, 138.4));
	const e1T = f >= frame3(122.711) ? 1 - sstep(seg(t, 125.15, 125.5)) : 0, e1P = otherAt(c, 0);
	const subA = 0.5 * (1 - sstep(seg(t, T3.P1 + 1.0, T3.P1 + 2.5))), edgeV = sstep(seg(t, 125.3, 126.0)) * (1 - sstep(seg(t, 129.6, 130.3)));
	return <>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<Lacquer sheen={0.08} id="d3" />
			{kitO > 0.01 && <KitchenW c={ck} o={kitO} />}
			{t >= T3.R2 && <defs><filter id="d3swB" x="-30%" y="-10%" width="160%" height="120%"><feGaussianBlur stdDeviation="46" /></filter>
				<mask id="d3km" maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}><path d={streak} fill="#FFF" filter="url(#d3swB)" /></mask></defs>}
			{kitO > 0.01 && <g opacity={kitO}><Pool id="d3k1" x={q0[0]} y={q0[1]} rx={560} ry={330} a={0.75} col="#080403" /><Pool id="d3k2" x={q0[0] - 20} y={q0[1] + 10} rx={360} ry={200} a={0.34} col="#FFB868" /></g>}
			{blur > 0.05 && <defs><filter id="d3far" filterUnits="userSpaceOnUse" x={-200} y={-200} width={W + 400} height={H + 400}><feGaussianBlur stdDeviation={blur} /></filter></defs>}
			<g filter={blur > 0.05 ? 'url(#d3far)' : undefined}><World3 t={t} t2={t2} c={c} mus={mus} dull={dull} spot={spot} dim={dim} refl={t >= T3.R2 && mus > 0.01 ? <g mask="url(#d3km)" opacity={Math.max(0.002, 0.85 * swO * mus)}><KitchenW c={ck} o={1} /></g> : null} /></g>
			{g0o > 0.01 && g0[2] > 10 && <Glint x={g0[0]} y={g0[1]} r={26} o={g0o} />}
			{kitO > 0.01 && <g opacity={kitO}><CleaverK c={ck} rho={0.68} /></g>}
			{t >= T3.R2 && <g opacity={Math.max(0.002, swO)}><path d={streak} fill="#F4F8FA" opacity={0.06} filter="url(#d3swB)" />
				<path d={`M${1500 + swX},-80 L${1530 + swX},-80 L${950 + swX},1160 L${920 + swX},1160 Z`} fill="#F4F8FA" opacity={0.08} /></g>}
			{subA > 0.01 && <Scrim id="d3-sub" x={640} y={212} rx={760} ry={170} a={subA} />}
			{/* fix4-d #7: in L1 the frame edges darken further, so the warm sword glow stays the brightest point over the clay */}
			{edgeV > 0.01 && <><defs><radialGradient id="d3ev" cx="0.5" cy="0.55" r="0.75"><stop offset="0.45" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity={0.62 * edgeV} /></radialGradient></defs><rect width={W} height={H} fill="url(#d3ev)" /></>}
			<Vignette id="d3" a={0.6} />
			{/* v3.1 E1: a thin leader from 「其他剑」 to the other swords (they are small at real size), from the first one lit to the end of E1 */}
			{e1T > 0.004 && <g opacity={e1T}>{[1, 2].map((i) => { const q = otherAt(c, i); if (q[2] < 0.2 || f < frame3(E1HIT[i])) return null;
					return <g key={i}><path d={`M${q[0]},${q[1]} L${E1TAG[0] - 15},${E1TAG[1] - 16}`} stroke={B.lac} strokeWidth={4} strokeOpacity={0.5} /><path d={`M${q[0]},${q[1]} L${E1TAG[0] - 15},${E1TAG[1] - 16}`} stroke={B.goldL} strokeWidth={1.6} /><circle cx={q[0]} cy={q[1]} r={4} fill={B.goldL} stroke={B.lac} strokeWidth={1.2} /></g>; })}
				<Tag id="d3e1" x={E1TAG[0]} y={E1TAG[1]} s="其他剑" fs={44} anchor="start" col={B.cream} scrim={0.45} to={[e1P[0], e1P[1]]} /></g>}
		</svg>
		{home > 0 && <div style={{position: 'absolute', inset: 0, opacity: home}}><TakeA t={0} /></div>}
	</>; };
void rnd;
