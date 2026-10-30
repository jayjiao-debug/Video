import React from 'react';
import {W, H, rnd, lerp, cl, seg} from '../qq50/kit50';
import {B, Pool} from '../qq50/styleB';
import {Cam, V3, P2, proj, poly, mix, lookAt, blobOn} from './parts53';
import {bladeOutline} from './parts53';
import {Sword3D, SwordPose} from './sword3d';
import {DisplayFront, hoodDist} from './display53k';
import {Glint} from './kfA53';
import {spline, sstep} from './cam53';
/* ep53 · TakeD, the camera of legs 14–17 and the museum: the same metric world as world53d (metres; the cut plane y = 0; z = 0 is
   the ground AND the museum floor). One camera, a pure function of time: C1 Hermite channels through the poses below.
   The museum case stands on the floor directly above the tomb (CASE_X): the way up from the sword's grave ends under its own
   showcase. */
export const CASE_X = -0.55;
type Pose = [number, number, number, number, number, number, number, number, number, number];   // t, P(3), T(3), f, cx, cy
export const POSES: Pose[] = [
	[80.3, -0.295, 0.23, -10.313, -0.015, 0.5, -10.583, 1380, 960, 540],
	[81.954, -0.275, 0.22, -10.293, -0.015, 0.5, -10.583, 1380, 960, 540],
	[83, 0.065, 0.15, -9.413, 0.115, 0.51, -10.573, 1380, 960, 560],
	[84.219, 0.115, 0.25, -8.313, 0.115, 0.55, -10.573, 2000, 960, 580],
	[86.483, 0.46, 0.3, -7.8, 0.42, 1.2, -10.62, 1700, 960, 560],
	[88.5, 0.4, 0.26, -7.75, 0.37, 1.2, -10.62, 1700, 960, 560],
	[89.0, 0.36, 0.22, -7.8, 0.32, 1.16, -10.6, 1660, 960, 560],
	[90.445, -0.9, -3.4, -8.2, -1.05, 0.5, -9.8, 1500, 960, 600],
	[93.5, -1.0, -6.0, -6.9, -1.25, 0.6, -9.45, 1380, 960, 622],
	[93.95, -1.0, -6.9, -4.6, -1.1, 0.0, -7.6, 1200, 960, 580],
	[94.55, -0.85, -6.2, -2.7, -0.6, 0.0, 0.0, 1100, 960, 560],
	[94.95, -0.66, -4.0, 0.0, -0.55, 0.0, 0.92, 1200, 960, 540],
	[95.2, -0.6, -3.0, 0.8, -0.55, 0.0, 1.0, 1700, 960, 540],
	[95.5, -0.58, -2.2, 1.35, -0.55, 0.0, 0.99, 2700, 960, 540],
	[95.8, -0.57, -2.05, 1.65, -0.55, 0.0, 0.98, 2850, 960, 540],
	[97.4, -0.6, -1.9, 1.7, -0.55, 0.0, 0.99, 2850, 960, 540],
	[98.6, -0.62, -1.85, 1.7, -0.5, 0.0, 0.99, 2900, 960, 540],
	[99.8, -0.62, -1.6, 1.55, -0.45, 0.0, 0.99, 2850, 960, 540],
	[100.3, -0.6, -1.0, 1.18, -0.5, 0.0, 1.0, 1700, 960, 540],
	[100.9, -0.62, -0.62, 1.08, -0.65, 0.0, 1.0, 1300, 960, 540],
	[101.6, -0.62, -0.30, 1.08, -0.72, 0.0, 1.0, 1350, 960, 540],
	[102.332, -0.6, -0.10, 1.08, -0.78, 0.0, 1.0, 1380, 960, 540],
	[104.6, -0.58, -0.75, 1.30, -0.55, 0.0, 0.98, 1500, 960, 640],
	[106.861, CASE_X, -1.3, 1.8, CASE_X, 0.0, 0.96, 2100, 960, 790],
	[108.2, CASE_X, -2.4, 2.1, CASE_X, 0.0, 0.98, 2100, 960, 700],
];
const ch = (i: number) => spline(POSES.map((p) => [p[0], p[i]] as [number, number]));
const CH = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(ch);
export const worldCam = (t: number): Cam => { const v = CH.map((f) => f(Math.max(POSES[0][0], Math.min(POSES[POSES.length - 1][0], t))));
	return lookAt([v[0], v[1], v[2]], [v[3], v[4], v[5]], v[6], v[7], v[8]); };
export const toMM = (c: Cam): Cam => ({...c, p: [c.p[0] * 1000, c.p[1] * 1000, c.p[2] * 1000]});
const pp = (c: Cam, q: V3): P2 => { const p = proj(c, q); return [p[0], p[1]]; };

export const FLOOR_T: [number, number] = [94.9, 96.3];

/* ---------- the case (mm world, shifted to stand above the tomb) ---------- */
export const SP_CASE53: SwordPose = {x0: -278 + CASE_X * 1000, ya: 0, z0: 1000, dir: 1};
export const CaseW: React.FC<{c: Cam; t: number; dull: number; bloom: number; gauge?: number; id: string; rim?: number; front?: number; ring?: number}> = ({c, t, dull, bloom, id, rim = 1, front = 1, ring = 1}) => { const cm = toMM(c), X = CASE_X * 1000;
	const q = (x: number, y: number, z: number): V3 => [x + X, y, z];
	const sp = proj(cm, q(0, 0, 1000));
	const cc: Cam = {...cm, p: [cm.p[0] - X, cm.p[1], cm.p[2]]};   // the display's own (case) frame
	const sw = SP_CASE53, bo = bladeOutline(sw.x0 + 97, 1, 0, 1002.4);
	const bl = (s: number, w: number, r: number, seed: number) => blobOn(cm, sw.x0 + 97 + s, w, r, seed, 1002.6, 10, 0.5);
	const blade = poly(cm, bo);
	return <g>
		<defs><filter id={`cb${id}`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.2" /></filter>
			<filter id={`cr${id}`} x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="14" /></filter></defs>
		{/* v3-e: the pommel mirror is gone (it read as a stray object) */}
		{rim > 0.01 && blade && <path d={blade} fill="none" stroke="#FFD890" strokeWidth={16} strokeOpacity={0.55 * rim} filter={`url(#cr${id})`} />}
		<Sword3D c={cm} sp={SP_CASE53} id={`${id}s`} />
		{rim > 0.01 && blade && <path d={blade} fill="none" stroke="#FFF3CF" strokeWidth={2} strokeOpacity={0.9 * rim} />}
		{dull > 0 && <path d={blade} fill="#5A4630" opacity={0.22 * dull} />}
		{bloom > 0 && <g>
			<g filter={`url(#cb${id})`}><path d={bl(250, 5, 17 * bloom, 5)} fill="#6E7E46" opacity={0.4 * bloom} /><path d={bl(250, 5, 12 * bloom, 5)} fill="#7A5434" opacity={0.7 * bloom} /><path d={bl(250, 5, 9 * bloom, 6)} fill="#4E5E38" opacity={0.95} /><path d={bl(250.4, 5.3, 4.5 * bloom, 7)} fill="#9AA668" opacity={0.85} /></g>
			<path d={poly(cm, Array.from({length: 40}, (_, i) => { const a = i / 40 * 2 * Math.PI; return [sw.x0 + 97 + 250 + 24 * bloom * Math.cos(a), 7 + 24 * bloom * Math.sin(a), 1002.8] as V3; }))} fill="none" stroke="#FFF2D8" strokeWidth={3} strokeOpacity={0.9 * bloom * ring} strokeDasharray="14 7" />
		</g>}
		{front > 0.01 && <g opacity={front}><DisplayFront c={cc} hood={1} /></g>}
		<Glint x={proj(cm, q(-170, 22, 1002))[0]} y={proj(cm, q(-170, 22, 1002))[1]} r={Math.max(6, 12 * 2100 / Math.max(900, sp[2]))} o={0.7} />
	</g>; };

/* ---------- close to the hood's glass (the lectern vitrine, display53k): a soft reflection streak while the lens is within ~25 cm of it.
   (The v2 1.6 m box's front pane at y = −0.8 m is gone; the camera never cuts through the new hood.) ---------- */
export const GlassPass: React.FC<{c: Cam; id: string}> = ({c, id}) => { const cm = toMM(c), d = hoodDist({...cm, p: [cm.p[0] - CASE_X * 1000, cm.p[1], cm.p[2]]});
	const s = cl(1 - d / 250) * cl((d - 20) / 60); if (s <= 0.01) return null; void id;
	return <g opacity={s}>
		<path d="M1240,-40 L1420,-40 L860,1120 L680,1120 Z" fill="#F4F8FA" opacity={0.05} />
		<path d="M1430,-40 L1460,-40 L900,1120 L870,1120 Z" fill="#F4F8FA" opacity={0.09} />
	</g>; };
