import React from 'react';
import {mix} from './parts53';
/* ep53 · the pommel's end face (B6: 11 concentric rings), drawn the same way in the museum (3-D, through the camera) and at
   the start of the dive (flat screen circles), so the ring match on 20.821 is pixel-continuous. pt(r, θ) maps face polar
   coordinates (mm, θ counter-clockwise from screen-right) to the screen; ppm ≈ pixels per mm at the face. Light comes from
   the upper RIGHT, so the upper-left of the face (under the subtitle) stays mid-dark.
   v3.1 design C: the dish is near-black greenish bronze (swordspec53s.LOOK.hilt); the 11 rings read by their lit edges. */
export const R_FACE = 18.6;
export const RING_R = Array.from({length: 11}, (_, i) => R_FACE * (0.16 + 0.8 * (i + 0.5) / 11));
export const BOSS_R = R_FACE * 0.1;
export const GROOVE = 0.42;   // mm, the groove width
export const FACE_STOPS: [number, string][] = [[0, '#5E6252'], [0.42, '#3A3E34'], [0.8, '#202420'], [1, '#121411']];
export const FACE_GROOVE = '#070807', FACE_HI = '#C8C6A8';
/** the centre boss: kept the colour tomb53b3 hard-codes for it (#A8783C), so the ring match on 20.821 stays pixel-continuous */
export const FACE_BOSS = '#A8783C';
export type FacePt = (r: number, th: number) => [number, number];
const N = 96;
export const ringPath = (pt: FacePt, r: number) => 'M' + Array.from({length: N}, (_, i) => pt(r, i / N * 2 * Math.PI).map((v) => v.toFixed(1)).join(',')).join('L') + 'Z';
const arcPath = (pt: FacePt, r: number, a0: number, a1: number) => 'M' + Array.from({length: 25}, (_, i) => pt(r, a0 + (a1 - a0) * i / 24).map((v) => v.toFixed(1)).join(',')).join('L');
/** the face fill gradient (userSpaceOnUse): centred toward the upper right */
export const FaceGrad: React.FC<{id: string; pt: FacePt; ppm: number; k?: number}> = ({id, pt, ppm, k = 0}) => { const [gx, gy] = pt(R_FACE * 0.38, Math.PI / 4);
	return <radialGradient id={id} gradientUnits="userSpaceOnUse" cx={gx} cy={gy} r={Math.max(1, R_FACE * 1.45 * ppm)}>
		{FACE_STOPS.map(([o, c]) => <stop key={o} offset={o} stopColor={mix(c, '#3A2A1E', k)} />)}</radialGradient>; };
export const PommelFace: React.FC<{id: string; pt: FacePt; ppm: number; hi?: number}> = ({id, pt, ppm, hi = 1}) => <g>
	<defs><FaceGrad id={`fg${id}`} pt={pt} ppm={ppm} /></defs>
	<path d={ringPath(pt, R_FACE)} fill={`url(#fg${id})`} stroke="#080907" strokeWidth={Math.max(1, ppm * 0.12)} />
	{RING_R.map((r, i) => <path key={i} d={ringPath(pt, r)} fill="none" stroke={FACE_GROOVE} strokeWidth={Math.max(0.9, ppm * GROOVE)} />)}
	{hi > 0.01 && RING_R.map((r, i) => <path key={`h${i}`} d={arcPath(pt, r + GROOVE * 0.75, Math.PI * 0.08, Math.PI * 0.55)} fill="none" stroke={FACE_HI} strokeWidth={Math.max(0.6, ppm * 0.16)} strokeOpacity={0.55 * hi} strokeLinecap="round" />)}
	<path d={ringPath(pt, BOSS_R)} fill={FACE_BOSS} stroke={FACE_GROOVE} strokeWidth={Math.max(0.8, ppm * 0.2)} />
</g>;
