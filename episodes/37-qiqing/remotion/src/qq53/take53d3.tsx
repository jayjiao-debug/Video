import React from 'react';
import {W, H, seg, lerp, rnd} from '../qq50/kit50';
import {B, Lacquer, Vignette, Pool} from '../qq50/styleB';
import {Cam, V3, Scrim, Tag, proj, poly, lookAt} from './parts53';
import {sstep, spline, HK} from './cam53';
import {Pit, Chamber, Air, Labels, LAY, otherAt} from './world53d';
import {worldCam, worldCh, CaseW, GlassPass, toMM, CASE_X} from './scene53d';
import {HallBack, CaseHall, FloorD} from './hall53d';
import {MacroLeg, MACRO_END} from './macro53d';
import {TakeA, camAt} from './take53';
import {MuseumA53, EndAir53, T_TITLE} from './museum53e4';
import {EndCard3, CARD_F3} from './end53d3';
import {frame3} from './v3map53';
/* ep53 v3 TakeD3, 111.389 → 145.333 (MUSIC_NOTES_v3 rows 23–30; tasks/ep53-v3-d/out/selfcheck.md):
   T1 T2 111.389  the hand-off macro, blooms 111.389 / 111.955 / 113.087 ON the surface; the find-ring opens onto the sheath's mouth;
   T3    117.616  the rewind: the sword slides back into its sheath (hilt screen-right, the draw run backwards), settles on 120.446;
   E1    122.144  the tomb's other swords light one per half-bar (122.711 / 123.843 / 124.975);
   L1    125.540  round to the front of the cut-away, the six layers close one per beat from 126.108, the air; up to the surface;
   R2    130.069  the floor is the top of the fill; v3.5: ONE crane from the floor up and forward onto the title shot (TakeA at
                  T_TITLE = 10.4, without the title glass), the bronze a shade duller, one faint rust spot; the crane eases out into a slow
   P1    134.031  settle, at rest on HOME 138.7; TakeA's look crossfades in (museum53e4.MuseumA53, same camera), <TakeA t={T_TITLE} noLeaf />
                  takes over 138.7–139.2;
   air   139.692  the hall dims round the case, one last glint along the edge (peak ≈140.3) (museum53e4.EndAir53);
   END   140.824  the card (J on f4225) over the held museum, 4.0 s, 0.5 s fade to black. (No kitchen anywhere: v3.4.)
   T1 … R2 reuse the v2 TakeD world (world53d, scene53d, hall53d, macro53d) through a monotone C1 time map v3 → v2 whose knots are
   the hits, so every hit lands ON its v3 frame. */

/* ---------- the time map v3 → v2 (cam53's monotone C1 Hermite through the hits) ---------- */
const KN: HK[] = [[111.389, 75.162], [111.955, 75.728], [113.087, 76.86], [113.4, 77.173], [117.616, MACRO_END], [120.446, 84.219],
	[122.711, 86.483], [123.843, 87.615], [124.975, 88.747], [126.108, LAY.sheath], [126.674, LAY.inner], [127.24, LAY.outer], [127.806, LAY.guo],
	[128.372, LAY.bai], [128.938, LAY.hang], [130.069, 94.95], [131.2, 95.9], [132.3, 99.4], [133.4, 101.0], [134.031, 101.6]];
export const v2Of = spline(KN);

/* ---------- v3 times ---------- */
export const T3 = {T1: 111.389, REW: 117.616, R2: 130.069, P1: 134.031, HOME: 138.7, CARD: 140.824};   // v3.4: HOME = the arrival on the title shot
const drawAt = (t2: number) => 36 * Math.pow(1 - seg(t2, MACRO_END, 84.219), 2);
const litAt = (t2: number) => 1 - 0.35 * seg(t2, LAY.sheath, LAY.hang);
const LITE = 0.9;
/** v3.1 E1: the 「其他剑」 tag (44 px), right of the side compartment, clear of the subtitle and the stamp */
const E1TAG: [number, number] = [1330, 400], E1HIT = [122.711, 123.843, 124.975];

/* ---------- the title shot's camera in this world (metres; the museum frame is shifted by CASE_X) and the pull-back to it ---------- */
const X = CASE_X * 1000;
const CT = camAt(T_TITLE), CTW: Cam = {...CT, p: [(CT.p[0] + X) / 1000, CT.p[1] / 1000, CT.p[2] / 1000]};
/** v3.5 R2 → P1 (owner: "the camera path after it rises out of the grave into the museum and then onto the sword looks very weird"):
    no more telephoto punch, no dive into the case and back out. From the frame after the surface break (R2A) ONE crane: up out of the
    floor and forward to the title shot's camera (TakeA at T_TITLE), arriving at rest at HOME. Look-at channels (eye, a target on the
    sword's centre, log f, principal point); each channel leaves R2A with the rise's own slope and eases out to rest at HOME,
    monotone (a cubic Hermite, or where the rise is faster than a cubic can absorb, a power ease-out b + (a − b)(1 − u)^k). */
const R2A = 130.1;
const BLADE_Z = 1.002;
/** the title camera as look-at channels: the target is the point of its view ray nearest the sword's centre */
const ctwCh = (): number[] => { const c = CTW, F = [Math.cos(c.pitch) * Math.cos(c.yaw), Math.cos(c.pitch) * Math.sin(c.yaw), -Math.sin(c.pitch)],
	v = [CASE_X - c.p[0], 0 - c.p[1], BLADE_Z - c.p[2]], d = v[0] * F[0] + v[1] * F[1] + v[2] * F[2];
	return [c.p[0], c.p[1], c.p[2], c.p[0] + d * F[0], c.p[1] + d * F[1], c.p[2] + d * F[2], Math.log(c.f), c.cx, c.cy]; };
const v2Ch = (t: number) => { const v = worldCh(v2Of(t)); return [v[0], v[1], v[2], v[3], v[4], v[5], Math.log(v[6]), v[7], v[8]]; };
/** from value a with slope s0 at t0 to value b at rest at t1, monotone when s0 points towards b */
const easeTo = (a: number, s0: number, b: number, t0: number, t1: number) => { const T = t1 - t0, D = b - a, k = Math.abs(D) > 1e-9 ? s0 * T / D : 0;
	if (k > 3) return (t: number) => { const u = Math.min(1, Math.max(0, (t - t0) / T)); return b - D * Math.pow(1 - u, k); };
	return (t: number) => { const u = Math.min(1, Math.max(0, (t - t0) / T)), u2 = u * u, u3 = u2 * u;
		return (2 * u3 - 3 * u2 + 1) * a + (u3 - 2 * u2 + u) * s0 * T + (-2 * u3 + 3 * u2) * b; }; };
const PCH = (() => { const a = v2Ch(R2A), h = 1 / 240, ap = v2Ch(R2A + h), am = v2Ch(R2A - h), b = ctwCh();
	return a.map((_, i) => easeTo(a[i], (ap[i] - am[i]) / (2 * h), b[i], R2A, T3.HOME)); })();
const p1Cam = (t: number): Cam => { if (t >= T3.HOME) return CTW; const v = PCH.map((f) => f(t));
	return lookAt([v[0], v[1], v[2]], [v[3], v[4], v[5]], Math.exp(v[6]), v[7], v[8], CT.roll ?? 0); };
/** the camera of the take (world metres) for t ≥ the rewind */
export const camD3 = (t: number): Cam => (t < R2A ? worldCam(v2Of(t)) : p1Cam(t));
/** the same camera in the museum (case) frame, mm: TakeA's frame */
const toCase = (c: Cam): Cam => ({...toMM(c), p: [c.p[0] * 1000 - X, c.p[1] * 1000, c.p[2] * 1000]});

/* ---------- the world at v3 time t: the tomb (under the floor) and the museum (above), seen by camera c ---------- */
const World3: React.FC<{t: number; t2: number; c: Cam; mus?: number; dull?: number; spot?: number; dim?: number}> = ({t, t2, c, mus = 1, dull = 0, spot = 0, dim = 0}) => {
	/* v3.1: the plinth and the hood go WITH the hall (no pop); the hall's walls and floor a little ahead of the case */
	/* v3.4: the case keeps its own light through P1 (the pull-back goes AWAY from the deck); if it is ever faded, it fades as ONE group
	   opacity through `pool` (display53k: no 8-bit alpha steps on its stacked rings) */
	const caseL = 1;
	const caseO = mus, hallO = mus;
	const cm = toMM(c), under = c.p[2] < 0.03, k = sstep(seg(t2, 94.9, 96.3)), museum = t2 > 93.9;
	return <g>
		{!under && hallO > 0.01 && <g opacity={hallO}><FloorD c={c} cm={cm} k={k} lite={LITE} /></g>}
		{museum && <>
			{hallO > 0.01 && <g opacity={hallO}><HallBack cm={cm} hall={1} lite={LITE} /></g>}
			{caseO > 0.01 && <g opacity={caseO}><CaseHall cm={cm} t={t2} hood={1} lite={LITE * caseL} pool={caseL} /></g>}
			{/* fix4-d #8: no star on the display sword (130.069 →): the line is 「变暗」 */}
			<CaseW c={c} t={t2} id="d3" dull={dull} bloom={spot} rim={0} ring={0} front={mus} glint={0} dim={dim} />
		</>}
		{under && <>
			<Pit c={c} t={t2} />
			<Chamber c={c} t={t2} draw={drawAt(t2)} lit={litAt(t2)} />
			<Air c={c} t={t2} />
			{museum && <path d={poly(c, [[-40, 0, 0], [40, 0, 0]], false)} stroke="#EDE6D2" strokeOpacity={0.4} strokeWidth={2} fill="none" />}
			<Labels c={c} t={t2} />
		</>}
		<GlassPass c={c} id="d3" />
	</g>; };

/* P1 timing: TakeA's look (MuseumA53, same camera) crossfades in while the crane settles; at rest on HOME the picture is
   TakeA's own, and <TakeA t={T_TITLE} noLeaf /> takes over 138.7 → 139.2 (the motes and the last residues dissolve in, nothing moves) */
const LOOK0 = 134.6, LOOK1 = 137.4, SWAP0 = T3.HOME, SWAP1 = T3.HOME + 0.5;
export const TakeD3: React.FC<{t: number}> = ({t}) => {
	const f = frame3(t);
	/* T1, T2: the macro (v2 TakeD leg 13), the portal opening onto the tomb world at the rewind's first frame */
	if (t < T3.REW) { const t2 = v2Of(t); return <MacroLeg t={t2} world={() => <World3 t={T3.REW} t2={MACRO_END} c={worldCam(MACRO_END)} />} />; }
	/* the held title shot = TakeA at T_TITLE itself, the air (dim + the last glint) and the end card over it */
	const card = f >= CARD_F3 - 6 && <EndCard3 t={t} />;
	if (t >= SWAP1) return <><TakeA t={T_TITLE} noLeaf /><EndAir53 t={t} />{card}</>;
	const t2 = t < T3.P1 ? v2Of(t) : 102.332, c = camD3(t);
	/* R2: a shade duller from the floor on (warm veil), one faint rust spot; they go with the R2 look as TakeA's look comes in */
	const dull = 0.9 * sstep(seg(t, 130.6, 132.4)), spot = sstep(seg(t, 132.0, 132.6)), dim = sstep(seg(t, 131.4, 133.0));
	const look = sstep(seg(t, LOOK0, LOOK1)), swap = sstep(seg(t, SWAP0, SWAP1));
	const e1T = f >= frame3(122.711) ? 1 - sstep(seg(t, 125.15, 125.5)) : 0, e1P = otherAt(c, 0);
	const subA = 0.5 * (1 - sstep(seg(t, T3.P1 + 1.0, T3.P1 + 2.5))), edgeV = sstep(seg(t, 125.3, 126.0)) * (1 - sstep(seg(t, 129.6, 130.3)));
	return <>
		{look < 1 && <svg width={W} height={H} style={{position: 'absolute'}}>
			<Lacquer sheen={0.08} id="d3" />
			<World3 t={t} t2={t2} c={c} dull={dull} spot={spot} dim={dim} />
			{subA > 0.01 && <Scrim id="d3-sub" x={640} y={212} rx={760} ry={170} a={subA} />}
			{/* fix4-d #7: in L1 the frame edges darken further, so the warm sword glow stays the brightest point over the clay */}
			{edgeV > 0.01 && <><defs><radialGradient id="d3ev" cx="0.5" cy="0.55" r="0.75"><stop offset="0.45" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity={0.62 * edgeV} /></radialGradient></defs><rect width={W} height={H} fill="url(#d3ev)" /></>}
			<Vignette id="d3" a={0.6} />
			{/* v3.1 E1: a thin leader from 「其他剑」 to the other swords (they are small at real size), from the first one lit to the end of E1 */}
			{e1T > 0.004 && <g opacity={e1T}>{[1, 2].map((i) => { const q = otherAt(c, i); if (q[2] < 0.2 || f < frame3(E1HIT[i])) return null;
					return <g key={i}><path d={`M${q[0]},${q[1]} L${E1TAG[0] - 15},${E1TAG[1] - 16}`} stroke={B.lac} strokeWidth={4} strokeOpacity={0.5} /><path d={`M${q[0]},${q[1]} L${E1TAG[0] - 15},${E1TAG[1] - 16}`} stroke={B.goldL} strokeWidth={1.6} /><circle cx={q[0]} cy={q[1]} r={4} fill={B.goldL} stroke={B.lac} strokeWidth={1.2} /></g>; })}
				<Tag id="d3e1" x={E1TAG[0]} y={E1TAG[1]} s="其他剑" fs={44} anchor="start" col={B.cream} scrim={0.45} to={[e1P[0], e1P[1]]} /></g>}
		</svg>}
		{look > 0.004 && <div style={{position: 'absolute', inset: 0, opacity: look}}><MuseumA53 c={toCase(c)} /></div>}
		{swap > 0 && <div style={{position: 'absolute', inset: 0, opacity: swap}}><TakeA t={T_TITLE} noLeaf /></div>}
	</>; };
void rnd; void proj; void poly; void lookAt; void Pool; void LITE; void sstep; void seg;
