import React from 'react';
import {W, H, seg, cl} from '../qq50/kit50';
import {Vignette} from '../qq50/styleB';
import {Cam, V3, proj, Scrim} from './parts53';
import {Ground53, Museum, SP, camAt} from './take53';
import {Sword3D} from './sword3d';
import {DisplayFront} from './display53k';
import {Light, bw, A_BL} from './land53';
import {sstep} from './cam53';
import {EdgeGlint53} from './edge53e4';
/* ep53 v3.4 · the ending stays in the museum. The title shot (TakeA at T_TITLE, the overlay's plaque only shows 9.5–11.764, so TakeA
   there is the clean case picture) is where P1's pull-back settles; TakeD3 hands over to <TakeA t={T_TITLE} /> at rest.
   · MuseumA53: TakeA's picture AT T_TITLE (its hall, case, light and sword, take53 TakeA's own parameters evaluated at T_TITLE) for ANY
     camera in the case frame (mm), so the pull-back can carry that look in before the hand-off and the hand-off is a non-event.
   · EndAir53: 139.692 → the end: the hall dims round the case (the sword and its spot stay), and one last thin glint runs along the
     sword's near edge, guard → tip, peaking on ~140.3 (a callback to the opening cut). */
export const T_TITLE = 10.4;
const sst = (t: number, a: number, b: number) => sstep(seg(t, a, b));
/* take53 TakeA's look at T_TITLE (same formulas as TakeA; keep in step if TakeA's light changes) */
const LT = sst(T_TITLE, 9.9, 11.3) * (1 - sst(T_TITLE, 17.0, 18.8));
const KSPOT = sst(T_TITLE, 5.0, 8.0), KRAKE = 1 - 0.75 * KSPOT;
const LIGHTS: Light[] = [{dir: [-0.92, -0.32, 0.22], k: 1.7 * KRAKE, pos: [-470, -30, 1150], d0: 600}, {dir: [0.08, -0.28, 0.96], k: 0.55 + 0.6 * KSPOT}];
const LIFT = 0.16 * sst(T_TITLE, 6.0, 8.5) + 0.22 * LT;
const GROUND_K = 1 + (0.35 - 1) * sst(T_TITLE, 4, 8);
export const MuseumA53: React.FC<{c: Cam}> = ({c}) => <svg width={W} height={H} style={{position: 'absolute'}}>
	<Ground53 id="e4A" k={GROUND_K} sheen={0.3 + 0.2 * Math.sin(c.yaw)} />
	{LT > 0.01 && <g opacity={LT}><Scrim id="e4sbs" x={620} y={230} rx={860} ry={260} a={0.5} /></g>}
	<Museum c={c} t={T_TITLE} hall={1} hood={1} ppl={0} lite={LT} leaf={1} />
	<Sword3D c={c} sp={SP} id="e4w" ringGlow={0} lite={LT} land={{lights: LIGHTS, shin: 90, sMin: -20, lift: LIFT, glints: 1, guardCut: true}} />
	<DisplayFront c={c} hood={1} leaf={1} />
	<Vignette id="e4A" a={0.6} />
</svg>;

/** the title camera (case frame, mm) */
export const camTitle = (): Cam => camAt(T_TITLE);
export const AIR0 = 139.692, GLINT_PEAK = 140.3;
export const EndAir53: React.FC<{t: number}> = ({t}) => { if (t < AIR0) return null;
	const c = camTitle(), q = proj(c, [0, 0, 1000]), dim = sst(t, AIR0, AIR0 + 1.0);
	/* the sword's screen extent, for the clear ellipse round it and its spot */
	const ends = [proj(c, [-290, 0, 1000]), proj(c, [290, 0, 1000])], rx = Math.max(260, Math.abs(ends[1][0] - ends[0][0]) * 0.62 + 120), ry = Math.max(150, rx * 0.42);
	/* the glint: guard → tip along the near edge (w < 0: the camera stands on the −y side), 139.95 → 140.65, peak on 140.3 */
	const u = seg(t, GLINT_PEAK - 0.35, GLINT_PEAK + 0.35), k = Math.sin(Math.PI * u);
	const S = (a: number, w: number) => { const p = proj(c, bw(SP, a * 10 - A_BL, w * 10)); return [p[0], p[1]] as [number, number]; };
	return <svg width={W} height={H} style={{position: 'absolute'}}>
		<defs><radialGradient id="e4dim" gradientUnits="userSpaceOnUse" cx={q[0]} cy={q[1]} r={rx} gradientTransform={`translate(${q[0]} ${q[1]}) scale(1 ${ry / rx}) translate(${-q[0]} ${-q[1]})`}>
			<stop offset="0" stopColor="#080403" stopOpacity="0" /><stop offset="0.55" stopColor="#080403" stopOpacity="0" /><stop offset="1" stopColor="#080403" stopOpacity="1" /></radialGradient></defs>
		{dim > 0.004 && <g opacity={0.62 * dim}><rect x={-20} y={-20} width={W + 40} height={H + 40} fill="url(#e4dim)" /></g>}
		{k > 0.004 && <EdgeGlint53 S={S} id="e4g" sg={-1} k={cl(k * 1.15)} u={0.04 + 0.96 * sstep(u)} sig={46} lw={0.8} />}
	</svg>; };
void ({} as V3);
