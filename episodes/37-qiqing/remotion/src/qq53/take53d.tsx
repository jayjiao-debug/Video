import React from 'react';
import {W, H, seg, lerp, cl} from '../qq50/kit50';
import {Lacquer, Vignette} from '../qq50/styleB';
import {Scrim, DepthTag, proj} from './parts53';
import {sstep} from './cam53';
import {CAM0, SW_HOOK} from './kfA53';
import {CARD_T53} from './master53';
import {Pit, Chamber, Air, Labels, LAY} from './world53d';
import {worldCam, CaseW, GlassPass, SP_CASE53, toMM} from './scene53d';
import {HallBack, CaseHall, FloorD} from './hall53d';
import {poly} from './parts53';
import {MacroLeg, MACRO_END} from './macro53d';
import {KitchenEnd, EndCardAnim, FADE_OUT_T} from './end53d';
/* ep53 · TakeD = legs 13–18 of the one take, 75.162 → 113.633 s (see tasks/ep53-take-d/out/selfcheck.md).
   13 T1 T2  75.162  the hand-off macro, blooms on the drop; the first bloom's find-ring widens into the sheath's mouth (Match 4);
   14 T3 E1  81.954  the rewind: out of the sheath's mouth over the coffin, the other swords light one per half-bar;
   15 L1     90.445  round to the front of the cut-away; the layers close on the beats; the air; up to the surface (Match 5);
   16 R2 R3  95.540  the floor is the top of the fill; up to the case and in through the glass to 5 cm over the blade;
   17 P1 AIR 102.332 back out through the glass; the reflection resolves into your kitchen, the sword stays a glow in the window;
   18 END    109.125 the card on the held kitchen (J on f3274), 4 s, 0.5 s fade. */
const drawAt = (t: number) => 36 * Math.pow(1 - seg(t, MACRO_END, 84.219), 2);
const litAt = (t: number) => 1 - 0.35 * seg(t, LAY.sheath, LAY.hang);
const glowAt = (t: number) => sstep(seg(t, 106.8, 107.9));
const KIT_C = CAM0;
/** the similarity that carries the case's sword onto the kitchen's glow (so there is only ever one sword) */
const thRaw = (c: ReturnType<typeof worldCam>) => { const cm = toMM(c), s = SP_CASE53;
	const p0 = proj(cm, [s.x0, 0, 1000]), p1 = proj(cm, [s.x0 + 556, 0, 1000]), q0 = proj(KIT_C, [SW_HOOK.x0, SW_HOOK.ya, SW_HOOK.z0]), q1 = proj(KIT_C, [SW_HOOK.x0 - 556, SW_HOOK.ya, SW_HOOK.z0]);
	return Math.atan2(q1[1] - q0[1], q1[0] - q0[0]) - Math.atan2(p1[1] - p0[1], p1[0] - p0[0]); };
/** the roll, unwrapped along time from 106.0 so it never jumps by 2π */
const thAt = (t: number) => { let prev = thRaw(worldCam(106.0)), th = prev;
	for (let s = 106.0 + 1 / 60; s <= t + 1e-9; s += 1 / 60) { const r = thRaw(worldCam(s)); let d = r - prev; d -= 2 * Math.PI * Math.round(d / (2 * Math.PI)); th += d; prev = r; }
	return th; };
/** the similarity that carries the case's sword onto the kitchen's glow (so there is only ever one sword) */
const swordFit = (c: ReturnType<typeof worldCam>, u: number, t: number) => { const cm = toMM(c), s = SP_CASE53;
	const p0 = proj(cm, [s.x0, 0, 1000]), p1 = proj(cm, [s.x0 + 556, 0, 1000]), q0 = proj(KIT_C, [SW_HOOK.x0, SW_HOOK.ya, SW_HOOK.z0]), q1 = proj(KIT_C, [SW_HOOK.x0 - 556, SW_HOOK.ya, SW_HOOK.z0]);
	const dpx = p1[0] - p0[0], dpy = p1[1] - p0[1], dqx = q1[0] - q0[0], dqy = q1[1] - q0[1], sc = Math.hypot(dqx, dqy) / Math.hypot(dpx, dpy), th = thAt(t);
	const k = Math.pow(sc, u), a = k * Math.cos(th * u), b = k * Math.sin(th * u), cx = lerp(p0[0], q0[0], u), cy = lerp(p0[1], q0[1], u);
	return `matrix(${a},${b},${-b},${a},${cx - (a * p0[0] - b * p0[1])},${cy - (b * p0[0] + a * p0[1])})`; };
const LITE = 0.9;
export const WorldD: React.FC<{t: number}> = ({t}) => { const c = worldCam(t), cm = toMM(c), under = c.p[2] < 0.03, hall = t > 93.9 ? 1 : 0, k = sstep(seg(t, 95.4, 96.8));
	const museum = t > 93.9 && <>
		<HallBack cm={cm} hall={hall} lite={LITE} />
		<CaseHall cm={cm} t={t} hood={1} lite={LITE} />
		<CaseW c={c} t={t} id="d" dull={sstep(seg(t, 95.8, 99.0)) * 0.9} bloom={sstep(seg(t, 98.9, 99.6))} gauge={lerp(0.78, 0.6, sstep(seg(t, 95.54, 98.9)))} rim={1 - sstep(seg(t, 100.4, 101.4))} />
	</>;
	return <g>
		{!under && <FloorD c={c} cm={cm} k={k} lite={LITE} />}
		{museum}
		{under && <>
			<Pit c={c} t={t} />
			<Chamber c={c} t={t} draw={drawAt(t)} lit={litAt(t)} />
			<Air c={c} t={t} />
			{t > 93.9 && <path d={poly(c, [[-40, 0, 0], [40, 0, 0]], false)} stroke="#EDE6D2" strokeOpacity={0.4 * hall} strokeWidth={2} fill="none" />}
			<Labels c={c} t={t} />
		</>}
		<GlassPass c={c} id="d" />
	</g>; };
export const TakeD: React.FC<{t: number}> = ({t}) => {
	if (t < MACRO_END) return <MacroLeg t={t} world={() => <WorldD t={MACRO_END} />} />;
	const c = worldCam(t), kit = t < 104.8 ? 0 : t < 106.861 ? 0.55 * sstep(seg(t, 104.8, 106.861)) : lerp(0.55, 1, sstep(seg(t, 106.861, 107.9)));
	const A = 1 - sstep(seg(t, 106.6, 107.9)), fit = sstep(seg(t, 106.2, 107.9)), depth = Math.max(0, -c.p[2]);
	return <>
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<Lacquer sheen={0.08} id="d14" />
			{A > 0.002 && <g transform={fit > 0 ? swordFit(c, fit, t) : undefined}><WorldD t={t} /></g>}
			{A < 0.998 && <g opacity={1 - A}><Lacquer sheen={0.08} id="d14c" /></g>}
			{kit > 0 && <g opacity={kit}><KitchenEnd glow={glowAt(t)} /></g>}
			{t < 100 && <Scrim id="d-sub" x={640} y={212} rx={760} ry={170} a={0.5} />}
			<Vignette id="d14" a={0.6} />
		</svg>
		{t >= LAY.sheath - 0.5 && t < 95.45 && <div style={{opacity: seg(t, LAY.sheath - 0.5, LAY.sheath - 0.2) * (1 - seg(t, 94.9, 95.35))}}><DepthTag v={depth} /></div>}
		{t >= CARD_T53 - 0.2 && <EndCardAnim t={t} />}
		{t >= FADE_OUT_T - 0.4 && <div style={{position: 'absolute', inset: 0, background: '#000', opacity: seg(t, 113.1, 113.6)}} />}
	</>; };
void cl;
