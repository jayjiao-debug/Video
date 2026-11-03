/* ep59 v3 · act 1 helpers: the scene's place on the track (beat phase, neighbours' lengths), beat hits, shot switching,
   and a world-space (metres) fog for sets drawn by per-point projection (useWorld) outside a <Layer>. */
import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {layout, Track, Placed} from './story3';
import {useStage, hazeK, mix, cl, lerp, f1, P, W, H, rnd} from './kit3';

const LC = new Map<string, Placed[]>();
export const lay = (tr: Track) => { let L = LC.get(tr.id + tr.beat + tr.d0); if (!L) { L = layout(tr); LC.set(tr.id + tr.beat + tr.d0, L); } return L; };
export const sceneOf = (tr: Track, id: string) => lay(tr).find((s) => s.id === id)!;
/** seconds after the scene's start of its first beat (0 for scenes that start on a beat; the first scene starts before the first downbeat) */
export const beatOff = (tr: Track, id: string) => { const a = sceneOf(tr, id).a; return (((tr.d0 - a) % tr.beat) + tr.beat) % tr.beat; };
/** a hit envelope: 0 before t0, jumps up over `rise` s, decays exponentially with time constant `tau` */
export const hit = (t: number, t0: number, tau = 0.22, rise = 0.04) => (t < t0 ? 0 : t < t0 + rise ? (t - t0) / rise : Math.exp(-(t - t0 - rise) / tau));
/** ease-in (cubic) and ease-out (cubic) */
export const ein = (u: number) => { const x = cl(u); return x * x * x; };
export const eout = (u: number) => { const x = cl(u); return 1 - Math.pow(1 - x, 3); };
/** a trapezoid velocity profile 0 → 1 (accelerate over a, constant, decelerate over a): smooth starts without a 2× peak */
export const trap = (u: number, a = 0.2) => { const x = cl(u), v = 1 / (1 - a); if (x < a) return v * x * x / (2 * a); if (x > 1 - a) { const y = 1 - x; return 1 - v * y * y / (2 * a); } return v * (x - a / 2); };
/** which shot is on at t: cuts = start times of shots 1..n (shot 0 before the first) */
export const shotAt = (t: number, cuts: number[]) => { let k = 0; cuts.forEach((c, i) => { if (t >= c) k = i + 1; }); return k; };
/** fog for world-projected shapes (drawn outside a Layer): mixes toward the stage haze by the depth D */
export const useFogD = () => { const {atm} = useStage(); return (c: string, D: number, extra = 0) => mix(c, atm.haze, cl(hazeK(atm, D) + extra)); };
/** a soft gradient disc (bokeh / glow) without filters */
export const Disc: React.FC<{x: number; y: number; r: number; fill: string; o?: number}> = ({x, y, r, fill, o = 1}) => <circle cx={f1(x)} cy={f1(y)} r={f1(r)} fill={fill} opacity={o.toFixed(3)} />;
/** screen-space film burn / flash rect */
export const Wash: React.FC<{c: string; o: number}> = ({c, o}) => (o > 0.002 ? <rect x={-50} y={-50} width={W + 100} height={H + 100} fill={c} opacity={cl(o).toFixed(3)} /> : null);
export {lerp, rnd};
export type {P};

/** the handwriting face (Caveat, OFL; public/fonts/hand) as 'Caveat59': the frame waits until it is loaded */
let handP: Promise<void> | null = null;
export const useHand = () => {
	const [h] = useState(() => (typeof document === 'undefined' ? null : delayRender('Caveat59')));
	useEffect(() => { if (h === null) return;
		handP ??= (async () => { const f = new FontFace('Caveat59', `url(${staticFile('fonts/hand/caveat-latin-500-normal.woff2')}) format('woff2')`, {weight: '400 700'}); await f.load(); document.fonts.add(f); })().catch(() => undefined);
		handP.then(() => continueRender(h), () => continueRender(h)); }, [h]);
};
